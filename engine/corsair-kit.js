// 8 GATES — CORSAIRS (Jidda): fox-kit foxes in pirate gear. Registered into creatureKit by the host (it owns the fox kit).
// corsairFamily({ THREE, toon, M, fk }) → { names, build, animate, enter, dur }.
const CORS = {
  'Corsair Cutlass': { role: 'cutlass', outfit: 'vest', torso: ['#f7f1e6', '#7a1d2a', '#3a0d14'], hat: 'bandana', patch: true, sash: '#c42d3c' },
  'Corsair Gunner': { role: 'gunner', outfit: 'coat', torso: ['#3a4a5e', '#24303f', '#121a24'], hat: 'tricorn', sash: '#e0b43a' },
  'Corsair Captain': { role: 'captain', outfit: 'coat', torso: ['#9b1c2c', '#6b0f1c', '#3a0710'], hat: 'tricorn', plume: '#ffffff', patch: true, sash: '#e0b43a', big: 1.12 },
  'Drowned Corsair': { role: 'cutlass', outfit: 'vest', torso: ['#9fb59a', '#3f5a4a', '#1f2e26'], hat: 'bandana', drowned: true, sash: '#4f6b3a' },
  'Drowned Gunner': { role: 'gunner', outfit: 'coat', torso: ['#4f6b5e', '#2f4038', '#18221d'], hat: 'tricorn', drowned: true, sash: '#4f6b3a' },
  'The Hollow Captain': { role: 'captain', outfit: 'coat', torso: ['#3f4f4a', '#26302c', '#121815'], hat: 'tricorn', plume: '#9fb59a', drowned: true, hollow: true, sash: '#4f6b3a', big: 1.2 },
};
const DROWN_LOOK = { fur: '#7f8f7a', furDark: '#4f5f4a', muzzle: '#b8c4ae', chin: '#c9d2bf', snout: '#a8b49e', fluff: '#c9d2bf', paw: '#4f5f4a' };
export function corsairFamily({ THREE, toon, M, fk }) {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
  const blk = () => toon('#18161a'), gold = () => toon('#e0b43a'), steel = () => toon('#cfd6dc');
  function build(name) {
    const V = CORS[name] || CORS['Corsair Cutlass'];
    const g = fk.makeFox({ key: name, torso: V.torso, crest: 'none', outfit: V.outfit, mood: 'determined', eyes: V.hollow ? ['#5fe3ff', '#5fe3ff'] : ['#f59e0b', '#f59e0b'], look: V.drowned ? DROWN_LOOK : null });
    const U = g.userData, P = U.P, head = P.head, R = P.arms[1], L = P.arms[0];
    // hats
    if (V.hat === 'tricorn') { const h = new THREE.Group(); h.position.set(0, 0.36, -0.02); head.add(h); const b = M(new THREE.CylinderGeometry(0.5, 0.52, 0.08, 3), blk(), 0, 0, 0, h, 0.02); b.rotation.y = Math.PI; M(new THREE.CylinderGeometry(0.26, 0.3, 0.26, 16), blk(), 0, 0.14, 0, h, 0.02, 0.3); M(new THREE.TorusGeometry(0.5, 0.018, 4, 3), gold(), 0, 0.04, 0, h, 0).rotation.set(Math.PI / 2, 0, Math.PI / 2);
      if (V.plume) { const p = M(new THREE.SphereGeometry(0.1, 10, 8), toon(V.plume), -0.24, 0.26, -0.05, h, 0.012); p.scale.set(0.7, 0.7, 3); p.rotation.set(0.5, 0.3, 0.4); }
      U.hat = h; }
    else { const h = new THREE.Group(); h.position.set(0, 0.24, 0); head.add(h); const b = M(new THREE.SphereGeometry(0.41, 18, 10, 0, Math.PI * 2, 0, 1.2), toon(V.sash), 0, 0, 0, h, 0.015, 0.41); b.scale.set(1.02, 0.7, 1.02); const k = M(new THREE.ConeGeometry(0.06, 0.24, 6), toon(V.sash), 0.08, -0.04, -0.4, h, 0.01); k.rotation.x = -2.2; U.hat = h; }
    if (V.patch) { M(new THREE.CircleGeometry(0.075, 12), blk(), 0.14, 0.07, 0.385, head, 0).rotation.y = 0.35; const s = M(new THREE.TorusGeometry(0.4, 0.012, 4, 30), blk(), 0, 0.1, 0, head, 0); s.rotation.set(Math.PI / 2 - 0.25, 0, 0); }
    // sash, belt and a weak point (the powder horn / pouch)
    const lift = P.legs[0].position.y - 0.5;
    M(new THREE.TorusGeometry(0.29, 0.05, 6, 24), toon(V.sash), 0, 0.62 + lift, 0, P.body, 0.01).rotation.x = Math.PI / 2;
    const weakMat = new THREE.MeshToonMaterial({ color: '#c9a173', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const weak = M(new THREE.ConeGeometry(0.07, 0.24, 8), weakMat, 0.28, 0.6 + lift, 0.12, P.body, 0.012); weak.rotation.z = 1.9;
    // weapons in the right hand (cutlass, or flintlock); the captain carries both
    const hand = new THREE.Group(); hand.position.set(0, -0.46, 0.04); R.add(hand); U.hand = hand;
    if (V.role === 'cutlass' && V.drowned) { const s = new THREE.Group(); hand.add(s); M(new THREE.CylinderGeometry(0.02, 0.022, 0.75, 6), toon('#4a3a2a'), 0, 0, 0.32, s, 0.006).rotation.x = Math.PI / 2; const head2 = M(new THREE.BoxGeometry(0.03, 0.24, 0.16), toon('#7a6a5a'), 0, 0.1, 0.62, s, 0.008); M(new THREE.ConeGeometry(0.03, 0.1, 4), toon('#7a6a5a'), 0, -0.06, 0.62, s, 0.006).rotation.x = Math.PI; for (let i = 0; i < 3; i++) M(new THREE.SphereGeometry(0.02, 5, 4), toon('#a8603a'), 0.015, 0.05 + i * 0.05, 0.6, s, 0); s.rotation.x = -1.3; U.blade = s; }   // the Drowned Corsair swings a rusted boarding axe
    else if (V.role !== 'gunner') { const s = new THREE.Group(); hand.add(s); M(new THREE.TorusGeometry(0.06, 0.014, 4, 10, Math.PI * 1.2), gold(), 0, 0, 0.02, s, 0); const bl = M(new THREE.BoxGeometry(0.03, 0.08, 0.7), steel(), 0, 0.02, 0.4, s, 0.01); bl.rotation.x = -0.12; M(new THREE.BoxGeometry(0.035, 0.05, 0.12), toon('#5a3d2b'), 0, 0, -0.04, s, 0.008); s.rotation.x = -1.3; U.blade = s; }
    if (V.role !== 'cutlass') { const gp = new THREE.Group(); (V.role === 'captain' ? L : R).add(gp); gp.position.set(0, -0.46, 0.06); M(new THREE.BoxGeometry(0.06, 0.1, 0.16), toon('#5a3d2b'), 0, -0.02, 0, gp, 0.008); const br = M(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 8), blk(), 0, 0.03, 0.24, gp, 0.008, 0.03); br.rotation.x = Math.PI / 2; gp.rotation.x = -1.4; U.gun = gp; U.muzzle = new THREE.Object3D(); U.muzzle.position.set(0, 0.03, 0.46); gp.add(U.muzzle); }
    // drowned: seaweed and barnacles
    if (V.drowned) { const sw = toon('#3f6b3a'), bar = toon('#d8d0c0'); for (const [x, y, z, l] of [[0.2, 1.05, 0.18, 0.4], [-0.18, 0.9, 0.2, 0.5], [0.05, 0.5, 0.28, 0.35], [0.26, 0.28, -0.05, 0.3]]) { const s = M(new THREE.CylinderGeometry(0.02, 0.008, l, 5), sw, x, y + lift - l / 2, z, P.body, 0); s.rotation.z = (Math.random() - 0.5) * 0.4; }
      for (const [x, y, z] of [[0.18, 1.12, 0.2], [-0.22, 0.78, 0.18], [0.1, 0.4, 0.25], [-0.05, 1.0, -0.25]]) M(new THREE.ConeGeometry(0.04, 0.05, 6), bar, x, y + lift, z, P.body, 0); M(new THREE.ConeGeometry(0.035, 0.05, 6), bar, 0.18, 0.2, 0.2, head, 0); }
    if (V.hollow) { const glow = new THREE.PointLight(0x5fe3ff, 0.6, 2.5); glow.position.set(0, 0.1, 0.5); head.add(glow); }
    for (const s of [-1, 1]) M(new THREE.TorusGeometry(0.035, 0.009, 5, 10), toon('#e0b43a'), s * 0.36, -0.08, 0.02, head, 0);   // gold earrings
    if (V.role === 'captain') { const par = new THREE.Group(); par.position.set(0.42, 1.42 + lift, -0.02); P.body.add(par); const pc = V.drowned ? ['#7f8f7a', '#4f5f4a', '#c9d2bf'] : ['#2fbf4a', '#ec3013', '#ffd23a'];
      M(new THREE.SphereGeometry(0.1, 10, 8), toon(pc[0]), 0, 0, 0, par, 0.01).scale.set(0.9, 1.1, 1); const ph = new THREE.Group(); ph.position.set(0, 0.13, 0.03); par.add(ph); M(new THREE.SphereGeometry(0.07, 10, 8), toon(pc[0]), 0, 0, 0, ph, 0.008); const bk = M(new THREE.ConeGeometry(0.03, 0.08, 6), toon('#2a2622'), 0, -0.02, 0.07, ph, 0.004); bk.rotation.x = Math.PI / 2 + 0.6; for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.014, 6, 5), toon('#1a1a1e'), s * 0.04, 0.02, 0.05, ph, 0);
      const tail = M(new THREE.BoxGeometry(0.06, 0.02, 0.2), toon(pc[1]), 0, -0.1, -0.12, par, 0.004); tail.rotation.x = 0.8; U.parrot = { par, ph, wings: [-1, 1].map(s => { const w = M(new THREE.BoxGeometry(0.02, 0.1, 0.16), toon(pc[1]), s * 0.09, 0, -0.02, par, 0.004); return { w, s }; }) }; }   // a parrot on the Captain's shoulder
    if (V.drowned) U.dripAt = P.body;
    { const pouch = M(new THREE.SphereGeometry(0.07, 8, 6), toon('#6b4a2a'), -0.26, 0.58 + lift, 0.14, P.body, 0.008); pouch.scale.y = 0.8; U.pouch = pouch; }   // extra: a jingling coin pouch (coins fly when hit)
    g.scale.multiplyScalar(V.big || 1);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(U, { family: 'corsair', variant: name, role: V.role, weak, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#ffd23a', calls, height: 1.75 * (V.big || 1), reach: V.role === 'gunner' ? 0 : 1.35, ranged: V.role === 'gunner', laneAngles: V.role === 'gunner' ? [0] : null, drowned: !!V.drowned, events: [] });
    U.joints = { weak };
    return g;
  }
  const dur = { windup: 0.7, attack: 0.45, recover: 1.0, armorBreak: 0.8, die: 1.6, stagger: 1.2 };
  function enter(g, state) { const U = g.userData; if (state === 'armorBreak' && U.hat && U.hat.visible) U.events.push('hat'); if (state === 'idle' || state === 'move') { if (U.hat) U.hat.visible = true; } }
  function animate(g, state, t, dt) {
    const U = g.userData, P = U.P, R = P.arms[1], L = P.arms[0], B = P.body, role = U.role;
    fk.animFox(g, dt, state === 'move' ? 3.2 : state === 'attack' && role !== 'gunner' ? 1.5 : 0, false);
    B.rotation.set(0, 0, 0); B.position.set(0, 0, 0); U.mood = state === 'hurt' || state === 'stagger' ? 'sad' : 'determined';
    const arm = (A, x, y, z) => A.rotation.set(x, y, z);
    if (state === 'idle') { if (role === 'captain') { arm(L, 0.2, 0, 0.9); } if (role === 'gunner') arm(R, -0.5, 0, 0.1); }
    else if (state === 'windup') { const k = ease(cl(t / (dur.windup * 0.8)));
      if (role === 'gunner') { arm(R, lerp(0, -1.5, k), 0, lerp(0, 0.1, k)); arm(L, lerp(0, -1.3, k), 0, lerp(0, -0.5, k)); B.rotation.y = 0.15 * k; }
      else if (role === 'captain' && t < 0.45) { arm(R, lerp(0, -2.9, k), 0, 0.2); if (!U.rallied) { U.rallied = true; U.events.push('rally'); } }   // the Captain rallies his crew
      else { arm(R, lerp(0, -2.2, k), 0, lerp(0, 1.2, k)); B.rotation.y = -0.5 * k; B.rotation.x = -0.08 * k; } }
    else if (state === 'attack') { const k = cl(t / dur.attack), s = ease(cl(k / 0.5));
      if (role === 'gunner') { arm(R, -1.5 + (k < 0.2 ? -0.5 * (1 - k / 0.2) : 0), 0, 0.1); arm(L, -1.3, 0, -0.5); B.position.z = -0.08 * (1 - k); if (k > 0.05 && !U.fired) { U.fired = true; U.events.push('shot'); } }
      else { arm(R, lerp(-2.2, -1.1, s), 0, lerp(1.2, -1.5, s)); B.rotation.y = lerp(-0.5, 0.7, s); B.position.z = Math.sin(k * Math.PI) * 0.3; if (k > 0.3 && !U.fired) { U.fired = true; U.events.push('swing'); } } }
    else if (state === 'recover') { if (role === 'gunner') { arm(R, -0.6, 0, 0.3); arm(L, -1.6 + Math.abs(Math.sin(t * 7)) * 0.7, 0, 0.6); U.weakMat.emissiveIntensity = 0.8 + 0.5 * Math.sin(t * 12); }   // reloading: ram, ram, ram
      else { arm(R, -0.6, 0, -1.2); B.rotation.y = 0.5; B.rotation.x = 0.12; } }
    else if (state === 'hurt') { B.rotation.x = -0.15; B.position.x = Math.sin(t * 50) * 0.03; arm(L, -0.8, 0, -0.4); }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 5) * 0.15; B.rotation.x = 0.1; arm(R, 0.3, 0, 0.6); arm(L, 0.3, 0, -0.6); }
    else if (state === 'armorBreak') { B.rotation.x = -0.2 * Math.sin(cl(t / 0.8) * Math.PI); if (U.hat) U.hat.visible = false; }
    else if (state === 'die') { const k = ease(cl(t / 0.9)); B.rotation.x = -1.45 * k; B.position.y = -0.15 * k; B.position.z = -0.5 * k; arm(R, -2.6 * k, 0, 0.6); arm(L, -2.6 * k, 0, -0.6); if (U.drowned && t > 1.0 && g.visible) { g.visible = false; U.events.push('splash'); } }
    if (state !== 'die') g.visible = true; if (state !== 'attack') U.fired = false; if (state !== 'windup') U.rallied = false;
    if (state !== 'recover' || role !== 'gunner') U.weakMat.emissiveIntensity = 0;
    if (U.parrot) { const P2 = U.parrot, alarm = state === 'windup' || state === 'attack' || state === 'hurt'; P2.ph.rotation.y = Math.sin(t * 1.7) * 0.6; P2.ph.rotation.x = alarm ? -0.4 : Math.sin(t * 3) * 0.1; P2.wings.forEach(w => w.w.rotation.z = w.s * (alarm ? 0.6 + Math.sin(t * 40) * 0.5 : 0.1)); if (state === 'windup' && t < dt * 1.5) U.events.push('squawk'); }
    if (U.dripAt && Math.random() < dt * 2.5) U.events.push('drip');
    if (state === 'hurt' && t < dt * 1.5) U.events.push('coins');
  }
  return { names: Object.keys(CORS), build, animate, enter, dur };
}

// STEALTH FOX (Luxor): a fox in a shield that bends light. Cloaked = almost invisible with a shimmer; footprints and dust give it away; decloaks to strike.
export function stealthFamily({ THREE, toon, M, fk }) {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
  function build(name) {
    const g = fk.makeFox({ key: name, torso: ['#2a3340', '#1a2028', '#0c1014'], crest: 'none', outfit: 'armor', mood: 'determined', eyes: ['#5fe3ff', '#5fe3ff'], look: { fur: '#5a5f66', furDark: '#33373c', armorAccent: '#5fe3ff' } });
    const U = g.userData, P = U.P, R = P.arms[1];
    const blade = new THREE.Group(); blade.position.set(0, -0.46, 0.04); R.add(blade); const bl = M(new THREE.BoxGeometry(0.03, 0.06, 0.55), new THREE.MeshBasicMaterial({ color: '#5fe3ff' }), 0, 0, 0.3, blade, 0); blade.rotation.x = -1.3;
    const weakMat = new THREE.MeshToonMaterial({ color: '#5fe3ff', emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 0.8, gradientMap: toon('#fff').gradientMap });
    const lift = P.legs[0].position.y - 0.5, gen = M(new THREE.BoxGeometry(0.22, 0.26, 0.1), weakMat, 0, 0.9 + lift, -0.3, P.body, 0.012);   // the shield generator on its back
    const mats = []; g.traverse(o => { if (o.isMesh && o.material && !mats.includes(o.material)) mats.push(o.material); });
    U.cloakMats = mats.map(m => { const c = m.clone(); c.transparent = true; return c; }); g.traverse(o => { if (o.isMesh) { const i = mats.indexOf(o.material); if (i >= 0) o.material = U.cloakMats[i]; } });
    U.baseOp = U.cloakMats.map(m => m.opacity);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(U, { family: 'stealth', variant: name, weak: gen, weakMat, weakBase: new THREE.Color('#5fe3ff'), slabColor: '#5fe3ff', calls, height: 1.75, reach: 1.3, cloak: 1, events: [] }); U.joints = { weak: gen };
    return g;
  }
  const dur = { windup: 0.6, attack: 0.4, recover: 1.2, armorBreak: 0.8, die: 1.6 };
  function animate(g, state, t, dt) {
    const U = g.userData, P = U.P, R = P.arms[1], B = P.body; let want = 0.06;
    fk.animFox(g, dt, state === 'move' ? 3.4 : 0, false); B.rotation.set(0, 0, 0); B.position.set(0, 0, 0);
    if (state === 'move') { if (Math.floor(t * 3.4) !== U.st) { U.st = Math.floor(t * 3.4); U.events.push('footprint'); } }
    else if (state === 'windup') { want = lerp(0.06, 1, cl(t / 0.5)); R.rotation.set(lerp(0, -2.2, ease(cl(t / 0.5))), 0, lerp(0, 1.1, ease(cl(t / 0.5)))); if (t < dt * 1.5) U.events.push('decloak'); }   // the shimmer breaks: it is about to strike
    else if (state === 'attack') { want = 1; const s = ease(cl(t / 0.25)); R.rotation.set(lerp(-2.2, -1.0, s), 0, lerp(1.1, -1.5, s)); B.rotation.y = lerp(-0.4, 0.6, s); B.position.z = Math.sin(cl(t / 0.4) * Math.PI) * 0.4; if (t > 0.12 && !U.sw) { U.sw = true; U.events.push('swing'); } }
    else if (state === 'recover') { want = 1; R.rotation.set(-0.5, 0, -1.2); U.weakMat.emissiveIntensity = 1.2 + Math.sin(t * 12) * 0.5; }   // visible and open: hit the generator
    else if (state === 'hurt' || state === 'stagger') { want = 1; B.rotation.z = state === 'stagger' ? Math.sin(t * 5) * 0.15 : 0; }
    else if (state === 'armorBreak') { want = Math.random() > 0.5 ? 1 : 0.2; if (t < dt * 1.5) U.events.push('spark'); }   // shield shorting out
    else if (state === 'die') { want = 1; const k = ease(cl(t / 0.9)); B.rotation.x = -1.4 * k; B.position.y = -0.15 * k; }
    if (state !== 'attack') U.sw = false; if (state !== 'recover') U.weakMat.emissiveIntensity = 0.8;
    U.cloak = lerp(U.cloak, want, 1 - Math.exp(-10 * dt)); const sh = 0.04 * Math.sin(t * 9);
    U.cloakMats.forEach((m, i) => { m.opacity = U.baseOp[i] * Math.min(1, U.cloak + (U.cloak < 0.5 ? sh + 0.04 : 0)); m.depthWrite = U.cloak > 0.6; });
  }
  return { names: ['Stealth Fox'], build, animate, dur };
}

// SHRIKE THE SNUFFER (Nebo): a fox with a lamplighter's pole, used the wrong way round. Puts out the lamps; relight them to see her.
export function shrikeFamily({ THREE, toon, M, fk }) {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
  function build(name) {
    const g = new THREE.Group(), fox = fk.makeFox({ key: name, torso: ['#3a3040', '#241c2a', '#120e16'], crest: 'none', outfit: 'coat', mood: 'determined', eyes: ['#c084fc', '#c084fc'], look: { fur: '#4a4048', furDark: '#2a2228' } }); g.add(fox);
    const U = fox.userData, R = U.P.arms[1];
    const pole = new THREE.Group(); pole.position.set(0, -0.46, 0.04); R.add(pole); M(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 6), toon('#5a3d2b'), 0, 0, 0.6, pole, 0.008).rotation.x = Math.PI / 2;
    const cap = M(new THREE.ConeGeometry(0.1, 0.18, 8, 1, true), toon('#c9a24a', { side: THREE.DoubleSide }), 0, 0, 1.62, pole, 0.008); cap.rotation.x = -Math.PI / 2; pole.rotation.x = -1.2;   // the snuffer bell on the end
    const weakMat = new THREE.MeshToonMaterial({ color: '#c084fc', emissive: new THREE.Color('#c084fc'), emissiveIntensity: 0.5, gradientMap: toon('#fff').gradientMap });
    const lantern = M(new THREE.BoxGeometry(0.14, 0.18, 0.14), weakMat, 0.3, 0.55 + (U.P.legs[0].position.y - 0.5), 0.1, U.P.body, 0.01);   // her own shuttered lantern: break it
    const lamps = [[-2.2, -0.6], [2.2, -0.6], [0, 2.6]].map(([x, z]) => { const l = new THREE.Group(); l.position.set(x, 0, z); g.add(l); M(new THREE.CylinderGeometry(0.05, 0.07, 2.2, 6), toon('#2a2826'), 0, 1.1, 0, l, 0.01); const glass = M(new THREE.BoxGeometry(0.26, 0.32, 0.26), new THREE.MeshBasicMaterial({ color: '#ffd38a' }), 0, 2.3, 0, l, 0.01); return { l, glass, lit: true }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'shrike', variant: name, fox, P: U.P, weak: lantern, weakMat, weakBase: new THREE.Color('#c084fc'), slabColor: '#c084fc', calls, height: 1.75, reach: 2.0, lamps, events: [], joints: { weak: lantern } });
    return g;
  }
  const dur = { windup: 0.8, attack: 0.5, recover: 1.2, armorBreak: 0.8, die: 1.6 };
  function enter(g, state) { const U = g.userData; if (state === 'armorBreak') { U.lamps.forEach(l => l.lit = true); U.events.push('relight'); } }
  function animate(g, state, t, dt) {
    const U = g.userData, fox = U.fox, P = U.P, R = P.arms[1], B = P.body; fk.animFox(fox, dt, state === 'move' ? 3 : 0, false); B.rotation.set(0, 0, 0); B.position.set(0, 0, 0);
    if (state === 'windup') { const k = ease(cl(t / 0.6)); R.rotation.set(lerp(0, -2.6, k), 0, lerp(0, 0.6, k)); B.rotation.y = -0.4 * k; if (t > 0.5 && !U.sn) { U.sn = true; const l = U.lamps.find(q => q.lit); if (l) { l.lit = false; U.events.push('snuff'); } } }   // reaches up and snuffs a lamp
    else if (state === 'attack') { const s = ease(cl(t / 0.3)); R.rotation.set(lerp(-2.6, -1.0, s), 0, lerp(0.6, -1.4, s)); B.rotation.y = lerp(-0.4, 0.7, s); fox.position.z = Math.sin(cl(t / 0.5) * Math.PI) * 0.4; if (t > 0.15 && !U.f) { U.f = true; U.events.push('swing'); } }
    else if (state === 'recover') { R.rotation.set(-0.5, 0, -1.0); B.rotation.x = 0.1; U.weakMat.emissiveIntensity = 1.2 + Math.sin(t * 12) * 0.4; }
    else if (state === 'hurt') B.rotation.x = -0.15;
    else if (state === 'stagger') B.rotation.z = Math.sin(t * 5) * 0.15;
    else if (state === 'die') { const k = ease(cl(t / 0.9)); B.rotation.x = -1.4 * k; B.position.y = -0.15 * k; }
    if (state !== 'windup') U.sn = false; if (state !== 'attack') { U.f = false; fox.position.z = 0; } if (state !== 'recover') U.weakMat.emissiveIntensity = 0.5;
    // in the dark she fades out; relit lamps show her
    const lit = U.lamps.filter(l => l.lit).length; U.lamps.forEach(l => l.glass.material.color.set(l.lit ? '#ffd38a' : '#2a2620'));
    fox.traverse(o => { if (o.isMesh && o.material && o.material.color) { if (!o.userData.c0) o.userData.c0 = o.material.color.clone(); } });
    U.dark = lit === 0;
  }
  return { names: ['Shrike the Snuffer'], build, animate, enter, dur };
}
