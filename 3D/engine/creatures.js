// 8 GATES 3D — creature library: one model + one fighting style per kind, picked from the 2D enemy's name.
// Kinds: crab, scarab, golem, spitter, serpent, pirate (fox kit), hornet, wisp, flamingo, snowman, beast, tall.
// Every creature is built from primitives in the toon + ink look, baked so each costs a handful of draw calls.

export const KINDS = {
  crab:     { speed: 3.4, reach: 1.7, dmg: 9,  attack: 'lunge',  hp: 1.0, wind: 0.45 },
  scarab:   { speed: 4.2, reach: 1.6, dmg: 8,  attack: 'charge', hp: 0.9, wind: 0.55 },
  golem:    { speed: 2.2, reach: 2.4, dmg: 16, attack: 'slam',   hp: 2.0, wind: 0.8 },
  spitter:  { speed: 2.6, reach: 11,  dmg: 9,  attack: 'shoot',  hp: 0.8, wind: 0.6, keep: 8 },
  serpent:  { speed: 4.6, reach: 2.2, dmg: 12, attack: 'lunge',  hp: 1.3, wind: 0.5 },
  pirate:   { speed: 4.0, reach: 1.9, dmg: 10, attack: 'slash',  hp: 1.2, wind: 0.4 },
  gunner:   { speed: 3.4, reach: 12,  dmg: 9,  attack: 'shoot',  hp: 1.0, wind: 0.65, keep: 9 },
  hornet:   { speed: 5.2, reach: 1.6, dmg: 7,  attack: 'dive',   hp: 0.6, wind: 0.5, fly: 2.2 },
  wisp:     { speed: 4.8, reach: 1.4, dmg: 12, attack: 'burst',  hp: 0.5, wind: 0.6, fly: 1.2 },
  flamingo: { speed: 2.8, reach: 1.6, dmg: 5,  attack: 'lunge',  hp: 0.5, wind: 0.4 },
  snowman:  { speed: 1.6, reach: 11,  dmg: 8,  attack: 'shoot',  hp: 1.2, wind: 0.7, keep: 8 },
  beast:    { speed: 4.4, reach: 1.9, dmg: 11, attack: 'charge', hp: 1.2, wind: 0.5 },
  tall:     { speed: 3.0, reach: 2.6, dmg: 13, attack: 'slam',   hp: 1.5, wind: 0.6 },
};

export function classify(name = '', ranged = false) {
  const n = name.toLowerCase();
  if (/corsair|pirate|captain|cutlass|stealth fox|guard|suit|doorman|manager|airman|sergeant|man in|one who|one with|young one|one in front|hollis|boyd|prosper|rell|odda|tam\b|wick|roadman|slinger|ratchet|wrench|sparks/.test(n)) return ranged || /gunner|slinger|suit|airman|sergeant|manager|sparks/.test(n) ? 'gunner' : 'pirate';
  if (/flamingo/.test(n)) return 'flamingo';
  if (/snow|icicle/.test(n)) return 'snowman';
  if (/crab/.test(n)) return 'crab';
  if (/scarab|beetle/.test(n)) return 'scarab';
  if (/serpent|wyrm|worm|eel/.test(n)) return 'serpent';
  if (/hornet|drone|bee|queen|glider/.test(n)) return 'hornet';
  if (/ember|spore|glowspite|devil|spark|wisp|cinder/.test(n)) return 'wisp';
  if (/golem|frame|warden|sentry|hulk|sentinel|crusher|breaker|giant|siphon|keeper|deadfall|specimen|snuffer/.test(n)) return ranged && /sentry|sentinel/.test(n) ? 'spitter' : 'golem';
  if (/spitter|thrower|gunner|lancer|seedcaster|ventmaw|maw|caster|bolt/.test(n)) return 'spitter';
  if (/tall|attendant|walker|husk|reed runner|runner|marker/.test(n)) return 'tall';
  return ranged ? 'spitter' : 'beast';
}

export function creatureKit({ THREE, M, toon, glowing, BOX, makeFox, animFox, bakeLocal, rr, pick, ST, scene }) {
  const DARK = toon('#1b1830'), EYE = glowing('#ffef8a', null, 2.2), EYE_R = glowing('#ff4a3a', null, 2.4);
  const tint = (name) => {
    const n = name.toLowerCase();
    if (/crystal|shard|vein|blue|glow/.test(n)) return ['#7fd8ff', '#3a6a9a'];
    if (/rust|scrap|ratchet|bolt|blackout/.test(n)) return ['#b0643a', '#5a3020'];
    if (/ember|slag|cinder|furnace|ash|vent|lava|first/.test(n)) return ['#ff6a2a', '#4a2620'];
    if (/sand|dune|grit|dust|dry|road|convoy|husk/.test(n)) return ['#d8b070', '#7a5a32'];
    if (/sump|drain|drowned|pipe|cistern|overflow|standpipe|apron/.test(n)) return ['#5a8a7a', '#2a4a42'];
    if (/thorn|hive|hornet|spore|seed|root|cone|garden|mole/.test(n)) return ['#7ab04a', '#3a5a2a'];
    if (/sink|grey|plated|sentry frame|warden frame|factor|marker/.test(n)) return ['#9aa4b5', '#4a5262'];
    if (/gate|wrapped|tall|ray|specimen|hall|tally|cart/.test(n)) return ['#d8c8a0', '#6a5a3a'];
    if (/snow|icicle|fort/.test(n)) return ['#f2f6fb', '#9ab8d8'];
    return [ST.accent || '#c0392b', '#3a2030'];
  };
  function eyes(g, x, y, z, r = 0.09, mat = EYE) { for (const s of [-1, 1]) M(new THREE.SphereGeometry(r, 8, 6), mat, s * x, y, z, g, 0); }

  function build(f) {
    const kind = f.kind, [c1, c2] = tint(f.name || ''), body = toon(c1), dark = toon(c2), s = f.big ? 2.1 : 1;
    const g = new THREE.Group(), P = { legs: [], arms: [], wings: [], segs: [] }; g.userData.P = P;
    const root = new THREE.Group(); g.add(root); P.root = root;
    if (kind === 'crab') {
      M(new THREE.SphereGeometry(0.7, 14, 10), body, 0, 0.55, 0, root, 0.04, 0.7).scale.set(1.3, 0.55, 1);
      if (/crystal|shard|woken/i.test(f.name)) for (let i = 0; i < 5; i++) { const c = M(new THREE.OctahedronGeometry(0.18, 0), glowing('#7fd8ff', null, 1.6), rr(-0.5, 0.5), 0.85, rr(-0.35, 0.3), root, 0.01); c.scale.y = 2; }
      for (const sx of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(sx * 0.75, 0.55, 0.45); root.add(arm); M(new THREE.CylinderGeometry(0.09, 0.1, 0.6, 6), dark, 0, 0, 0.25, arm, 0.02).rotation.x = Math.PI / 2; const cl = M(new THREE.SphereGeometry(0.26, 10, 8), body, 0, 0.05, 0.62, arm, 0.03, 0.26); cl.scale.set(0.8, 0.6, 1.2); M(new THREE.ConeGeometry(0.1, 0.35, 6), body, sx * 0.1, 0.18, 0.85, arm, 0.02).rotation.x = Math.PI / 2; P.arms.push(arm); }
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const leg = new THREE.Group(); leg.position.set(sx * 0.7, 0.45, -0.25 + i * 0.25); root.add(leg); const L = M(BOX(0.6, 0.08, 0.08), dark, sx * 0.3, -0.15, 0, leg, 0.015); L.rotation.z = sx * -0.6; P.legs.push(leg); }
      for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5), dark, sx * 0.2, 0.85, 0.45, root, 0); }
      eyes(root, 0.2, 1.02, 0.45, 0.08);
    } else if (kind === 'scarab') {
      M(new THREE.SphereGeometry(0.7, 14, 10), body, 0, 0.6, 0, root, 0.04, 0.7).scale.set(0.95, 0.6, 1.35); M(BOX(0.04, 0.42, 1.7), dark, 0, 0.98, -0.05, root, 0);
      M(new THREE.SphereGeometry(0.34, 10, 8), dark, 0, 0.55, 0.95, root, 0.03, 0.34); for (const sx of [-1, 1]) M(new THREE.ConeGeometry(0.07, 0.45, 5), dark, sx * 0.18, 0.5, 1.28, root, 0.01).rotation.set(Math.PI / 2, 0, sx * 0.5);
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const leg = new THREE.Group(); leg.position.set(sx * 0.55, 0.4, -0.35 + i * 0.35); root.add(leg); M(BOX(0.55, 0.07, 0.07), dark, sx * 0.25, -0.15, 0, leg, 0.012).rotation.z = sx * -0.7; P.legs.push(leg); }
      eyes(root, 0.16, 0.66, 1.2, 0.07, EYE_R);
    } else if (kind === 'golem' || kind === 'tall') {
      const tall = kind === 'tall', bw = tall ? 0.6 : 1.1, bh = tall ? 1.3 : 1.2, legH = tall ? 1.4 : 0.8;
      const torso = new THREE.Group(); torso.position.y = legH; root.add(torso); P.torso = torso;
      M(BOX(bw, bh, bw * 0.75), body, 0, bh / 2, 0, torso, 0.05); M(BOX(bw * 0.7, bh * 0.4, 0.06), dark, 0, bh * 0.55, bw * 0.38, torso, 0);
      const head = M(BOX(bw * 0.6, bw * 0.5, bw * 0.55), dark, 0, bh + bw * 0.3, 0.05, torso, 0.03); M(BOX(bw * 0.45, 0.1, 0.05), glowing(/crystal|vein|deep/i.test(f.name) ? '#7fd8ff' : '#ffcf3a', null, 2.2), 0, bh + bw * 0.32, bw * 0.33, torso, 0);
      if (/crystal|vein|bank|deep/i.test(f.name)) for (let i = 0; i < 4; i++) { const c = M(new THREE.OctahedronGeometry(0.2, 0), glowing('#7fd8ff', null, 1.6), (i - 1.5) * 0.25, bh + 0.05, -bw * 0.3, torso, 0.01); c.scale.y = 2.2; }
      for (const sx of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(sx * (bw / 2 + 0.2), bh * 0.9, 0); torso.add(arm); M(BOX(0.32, 1.1, 0.32), body, 0, -0.5, 0, arm, 0.03); M(BOX(0.42, 0.42, 0.42), dark, 0, -1.1, 0, arm, 0.03); P.arms.push(arm); }
      if (f.ranged) { M(new THREE.CylinderGeometry(0.16, 0.2, 0.7, 10), dark, 0, -1.15, 0.25, P.arms[1], 0.02).rotation.x = Math.PI / 2; P.muzzle = [0.3, -1.15, 0.6]; }
      for (const sx of [-1, 1]) { const leg = new THREE.Group(); leg.position.set(sx * bw * 0.28, legH, 0); root.add(leg); M(BOX(0.34, legH, 0.36), dark, 0, -legH / 2, 0, leg, 0.03); P.legs.push(leg); }
    } else if (kind === 'spitter') {
      M(new THREE.SphereGeometry(0.75, 14, 10), body, 0, 0.75, 0, root, 0.04, 0.75).scale.set(1, 0.85, 1);
      const sac = M(new THREE.SphereGeometry(0.42, 12, 8), glowing(/seed|cone|thorn/i.test(f.name) ? '#9fff5a' : /ember|vent|slag/i.test(f.name) ? '#ff7a3a' : '#c084fc', null, 0.6), 0, 1.25, -0.25, root, 0.03, 0.42); P.sac = sac;
      const mouth = M(new THREE.CylinderGeometry(0.22, 0.3, 0.5, 10), dark, 0, 0.85, 0.7, root, 0.02); mouth.rotation.x = Math.PI / 2; P.muzzle = [0, 0.85, 1.0];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const leg = new THREE.Group(); leg.position.set(sx * 0.45, 0.35, sz * 0.35); root.add(leg); M(new THREE.CylinderGeometry(0.1, 0.07, 0.5, 6), dark, 0, -0.2, 0, leg, 0.01); P.legs.push(leg); }
      eyes(root, 0.25, 1.05, 0.62, 0.09, EYE_R);
    } else if (kind === 'serpent') {
      const n = f.big ? 10 : 8;
      for (let i = 0; i < n; i++) { const r = 0.42 - i * 0.025; const seg = M(new THREE.SphereGeometry(r, 10, 8), i % 2 ? dark : body, 0, r, -i * 0.55, root, 0.03, r); P.segs.push(seg); }
      const head = P.segs[0]; head.scale.set(1.2, 1, 1.4); for (const sx of [-1, 1]) M(new THREE.ConeGeometry(0.05, 0.22, 5), toon('#ffffff'), sx * 0.14, -0.15, 0.4, head, 0).rotation.x = Math.PI; eyes(head, 0.18, 0.18, 0.28, 0.07, EYE_R);
    } else if (kind === 'hornet') {
      M(new THREE.SphereGeometry(0.32, 10, 8), toon('#2a2420'), 0, 0, 0.35, root, 0.03, 0.32); const ab = M(new THREE.SphereGeometry(0.42, 12, 8), toon('#e8b52a'), 0, -0.05, -0.25, root, 0.03, 0.42); ab.scale.set(0.9, 0.9, 1.3); for (let i = 0; i < 3; i++) M(new THREE.TorusGeometry(0.36 - i * 0.05, 0.06, 5, 16), toon('#2a2420'), 0, -0.05, -0.15 - i * 0.2, root, 0);
      M(new THREE.ConeGeometry(0.08, 0.4, 6), toon('#2a2420'), 0, -0.1, -0.85, root, 0).rotation.x = -Math.PI / 2;
      for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.32), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })); w.position.set(sx * 0.4, 0.28, 0.05); w.userData.keep = true; root.add(w); P.wings.push(w); }
      eyes(root, 0.14, 0.08, 0.6, 0.08, EYE_R);
    } else if (kind === 'wisp') {
      const col = /spore|glow|seed/i.test(f.name) ? '#9fff5a' : /devil|dust|dry/i.test(f.name) ? '#d8b070' : /spark|blue/i.test(f.name) ? '#7fd8ff' : '#ff7a2a';
      const core = M(new THREE.IcosahedronGeometry(0.42, 1), glowing(col, null, 2.4), 0, 0, 0, root, 0.03, 0.42); core.userData.keep = true; P.core = core;
      for (let i = 0; i < 6; i++) { const sp = M(new THREE.ConeGeometry(0.1, 0.5, 5), glowing(col, null, 1.6), 0, 0, 0, core, 0); const a = i / 6 * Math.PI * 2; sp.position.set(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0); sp.rotation.z = a - Math.PI / 2; }
      if (/devil|dust|dry/i.test(f.name)) { const tw = M(new THREE.ConeGeometry(0.9, 2.2, 14, 1, true), toon(col, { transparent: true, opacity: 0.45 }), 0, -0.3, 0, root, 0); tw.rotation.x = Math.PI; P.twist = tw; }
      eyes(core, 0.14, 0.08, 0.38, 0.07, toon('#1b1830'));
    } else if (kind === 'flamingo') {
      const pink = toon('#ff8fb0'); const b = M(new THREE.SphereGeometry(0.42, 12, 8), pink, 0, 1.35, 0, root, 0.03, 0.42); b.scale.set(0.8, 0.75, 1.3);
      M(new THREE.CylinderGeometry(0.05, 0.07, 0.9, 6), pink, 0, 1.9, 0.35, root, 0.01).rotation.x = -0.3; M(new THREE.SphereGeometry(0.16, 10, 8), pink, 0, 2.35, 0.5, root, 0.02, 0.16); M(new THREE.ConeGeometry(0.06, 0.3, 6), toon('#1b1830'), 0, 2.3, 0.72, root, 0).rotation.x = Math.PI / 2 + 0.5;
      for (const sx of [-1, 1]) { const leg = new THREE.Group(); leg.position.set(sx * 0.12, 1.1, 0); root.add(leg); M(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 5), toon('#e8607a'), 0, -0.55, 0, leg, 0); P.legs.push(leg); }
      eyes(root, 0.08, 2.4, 0.6, 0.035, toon('#1b1830'));
    } else if (kind === 'snowman') {
      const w = toon('#f4f8fc'); M(new THREE.SphereGeometry(0.75, 14, 10), w, 0, 0.7, 0, root, 0.04, 0.75); M(new THREE.SphereGeometry(0.55, 14, 10), w, 0, 1.75, 0, root, 0.04, 0.55); M(new THREE.SphereGeometry(0.4, 14, 10), w, 0, 2.5, 0, root, 0.04, 0.4);
      M(new THREE.ConeGeometry(0.07, 0.4, 6), toon('#ff8a3a'), 0, 2.5, 0.55, root, 0).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 14), DARK, 0, 3.0, 0, root, 0.02); M(new THREE.CylinderGeometry(0.48, 0.48, 0.06, 14), DARK, 0, 2.77, 0, root, 0.01);
      M(new THREE.TorusGeometry(0.42, 0.08, 6, 16), toon('#c42d3c'), 0, 2.15, 0, root, 0).rotation.x = Math.PI / 2;
      if (/icicle/i.test(f.name)) for (let i = 0; i < 6; i++) M(new THREE.ConeGeometry(0.08, 0.6, 5), glowing('#bff4ff', null, 1.2), Math.cos(i) * 0.6, 1.9, Math.sin(i) * 0.6, root, 0).rotation.x = Math.PI;
      for (const sx of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(sx * 0.5, 1.85, 0); root.add(arm); M(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 5), toon('#5a3d2c'), sx * 0.35, 0.15, 0, arm, 0).rotation.z = sx * -1.0; P.arms.push(arm); }
      eyes(root, 0.13, 2.6, 0.35, 0.05, toon('#1b1830')); P.muzzle = [0.6, 2.0, 0.3];
    } else if (kind === 'pirate' || kind === 'gunner') {
      const human = /suit|man|airman|sergeant|manager|doorman|one |hollis|boyd|prosper/i.test(f.name);
      const corsair = /corsair|captain|cutlass|pirate|drowned/i.test(f.name);
      const fx = makeFox({ torso: corsair ? ['#2a2a3a', '#5a1d2a', '#1b1830'] : human ? ['#2b2f38', '#15171d', '#0b0c10'] : [c1, c2, '#1b1830'], crest: '8', mood: 'stern', outfit: human ? 'suit' : corsair ? 'coat' : 'armor', gear: kind === 'gunner' ? 'laser' : 'sword' });
      scene.remove(fx); root.add(fx); fx.position.set(0, 0, 0); P.fox = fx;
      const head = fx.userData.P && fx.userData.P.head;
      if (corsair && head) { const hat = new THREE.Group(); hat.position.set(0, 0.55, 0); head.add(hat); M(new THREE.CylinderGeometry(0.42, 0.46, 0.08, 16), toon('#1b1830'), 0, 0, 0, hat, 0.02); const crown = M(new THREE.CylinderGeometry(0.22, 0.3, 0.3, 3), toon('#1b1830'), 0, 0.18, 0, hat, 0.02); crown.rotation.y = Math.PI / 6; M(new THREE.SphereGeometry(0.06, 8, 6), toon('#f4f1ea'), 0, 0.2, 0.26, hat, 0); if (/captain/i.test(f.name)) M(new THREE.ConeGeometry(0.07, 0.4, 6), toon('#c42d3c'), 0.25, 0.3, -0.05, hat, 0).rotation.z = -0.8; }
      if (corsair && head) M(new THREE.CircleGeometry(0.09, 10), toon('#0b0a10'), 0.14, 0.12, 0.4, head, 0);
      bakeLocal(fx);
    } else {   // beast: a four-legged animal
      M(new THREE.CapsuleGeometry(0.42, 1.0, 4, 10), body, 0, 0.9, 0, root, 0.04, 0.42).rotation.x = Math.PI / 2;
      const head = M(new THREE.SphereGeometry(0.36, 12, 10), body, 0, 1.15, 0.85, root, 0.03, 0.36); M(new THREE.ConeGeometry(0.16, 0.35, 8), dark, 0, 1.05, 1.18, root, 0.02).rotation.x = Math.PI / 2;
      for (const sx of [-1, 1]) M(new THREE.ConeGeometry(0.1, 0.3, 5), dark, sx * 0.2, 1.48, 0.8, root, 0.01);
      if (/thorn|slag|rust|ash/i.test(f.name)) for (let i = 0; i < 5; i++) M(new THREE.ConeGeometry(0.1, 0.4, 5), dark, 0, 1.35, -0.5 + i * 0.25, root, 0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const leg = new THREE.Group(); leg.position.set(sx * 0.25, 0.75, sz * 0.45); root.add(leg); M(BOX(0.16, 0.75, 0.16), dark, 0, -0.38, 0, leg, 0.015); P.legs.push(leg); }
      M(new THREE.CylinderGeometry(0.05, 0.1, 0.6, 6), body, 0, 1.05, -0.85, root, 0.01).rotation.x = -0.9;
      eyes(root, 0.15, 1.25, 1.12, 0.06, EYE_R);
    }
    if (f.big) { // bosses: bigger, crowned with horns and an aura
      const top = kind === 'serpent' ? P.segs[0] : root, y = kind === 'golem' || kind === 'tall' ? 3.4 : kind === 'serpent' ? 0.4 : 1.8;
      for (const sx of [-1, 1]) M(new THREE.ConeGeometry(0.12, 0.6, 6), toon('#e6b45a'), sx * 0.3, y, 0.1, top, 0.01).rotation.z = sx * -0.4;
    }
    g.scale.setScalar(s * (f.kind === 'hornet' ? 1.2 : 1));
    // hit flash: a white overlay toggled on hit
    g.traverse(o => { if (o.isMesh && o.material && o.material.isMeshToonMaterial && !o.userData.keep) o.userData.flashable = true; });
    if (kind !== 'pirate' && kind !== 'gunner') bakeLocal(g);
    scene.add(g); return g;
  }

  function animate(f, dt) {
    const g = f.c, P = g.userData.P, t = f.t, mv = Math.min(1, f.speedNow / 3), st = f.state;
    const wind = st === 'windup' ? Math.min(1, f.st / (f.K.wind || 0.5)) : 0;
    if (P.root) P.root.position.y = (f.K.fly || 0) + (f.K.fly ? Math.sin(t * 3) * 0.2 : 0) + (st === 'attack' && f.kind !== 'serpent' ? 0.15 : 0);
    if (P.legs.length) P.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 11 + i * 2.1) * 0.6 * mv; });
    if (f.kind === 'crab' || f.kind === 'scarab') P.arms.forEach((a, i) => { a.rotation.x = -wind * 0.9 + (st === 'attack' ? 0.6 : 0) + Math.sin(t * 4 + i) * 0.1; a.rotation.y = (i ? -1 : 1) * (0.2 + wind * 0.4); });
    if (f.kind === 'golem' || f.kind === 'tall' || f.kind === 'snowman') { P.arms.forEach((a, i) => { a.rotation.x = st === 'windup' ? -2.6 * wind : st === 'attack' ? 0.6 : Math.sin(t * 6 + i * Math.PI) * 0.5 * mv; }); if (P.torso) P.torso.rotation.x = st === 'attack' ? 0.35 : -0.15 * wind; }
    if (f.kind === 'spitter' && P.sac) { const k = 1 + wind * 0.5 + Math.sin(t * 5) * 0.04; P.sac.scale.setScalar(k); }
    if (f.kind === 'serpent') P.segs.forEach((sg, i) => { sg.position.x = Math.sin(t * 6 - i * 0.7) * 0.35 * (0.3 + mv); sg.position.y = (sg.geometry.parameters.radius || 0.4) + (i === 0 ? wind * 0.6 + (st === 'attack' ? 0.4 : 0) : 0); });
    if (f.kind === 'hornet') P.wings.forEach((w, i) => { w.rotation.x = Math.sin(t * 60 + i) * 0.6; });
    if (f.kind === 'wisp' && P.core) { P.core.rotation.y += dt * 4; P.core.scale.setScalar(1 + wind * 0.6 + Math.sin(t * 8) * 0.05); if (P.twist) P.twist.rotation.y += dt * 9; }
    if (f.kind === 'flamingo') { P.legs[1].rotation.x = mv > 0.1 ? Math.sin(t * 8) * 0.5 : -1.2; }
    if (P.fox) { const u = P.fox.userData; u.talking = false; u.mood = st === 'windup' || st === 'attack' ? 'determined' : 'stern'; animFox(P.fox, dt, f.speedNow); const arm = u.P && u.P.arms && u.P.arms[1]; if (arm && st === 'windup') arm.rotation.x = -2.4 * wind; if (arm && st === 'attack') arm.rotation.x = 0.8; }
    // squash on windup, white flash on hit
    const sq = 1 + wind * 0.12; g.children[0].scale.set(1 + wind * 0.08, 1 / sq, 1 + wind * 0.08);
  }

  return { build, animate };
}
