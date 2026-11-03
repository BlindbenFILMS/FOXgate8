// 8 GATES — creature POLISH layer: extra detail + tiny animations added after build, per family, without touching the
// family builders. polishKit(THREE, toon, M) → { build(g), tick(g, state, t, dt) }; creature-kit calls both automatically.
export function polishKit(THREE, toon, M) {
  const rr = (a, b) => a + Math.random() * (b - a);
  const P = {
    // ---------- KUFA ----------
    scarab: {
      build(g, U, J) { const horn = M(new THREE.ConeGeometry(0.07, 0.42, 6), toon('#2a1c10'), 0, 0.16, 0.12, J.head, 0.01); horn.rotation.x = -0.9; J.horn = horn;   // a proper rhino horn
        const shine = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false })); shine.scale.set(1.4, 0.3, 0.8); shine.position.set(-0.15, 0.33, 0.1); J.body.add(shine);   // shell shine
        J.ant = [-1, 1].map(s => { const a = M(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 4), toon('#2a1c10'), s * 0.09, 0.12, 0.2, J.head, 0); a.geometry.translate(0, 0.14, 0); a.rotation.set(0.9, 0, s * 0.4); return a; }); },   // extra: twitchy antennae
      tick(g, U, J, state, t) { J.ant.forEach((a, i) => { a.rotation.x = 0.9 + Math.sin(t * (state === 'windup' ? 30 : 6) + i * 2) * 0.15; }); if (state === 'attack' && t < 0.02) U.events.push('pop'); }
    },
    spitter: {
      build(g, U, J) { J.veins = []; const vm = new THREE.MeshBasicMaterial({ color: '#ff8a1a', transparent: true, opacity: 0 }); for (let i = 0; i < 6; i++) { const v = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 4, 14, 1.2), vm); v.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3)); J.sac.add(v); } J.veinM = vm;   // veins on the sac glow as it swells
        for (let i = 0; i < 8; i++) { const c = M(new THREE.BoxGeometry(rr(0.1, 0.2), 0.012, 0.012), toon('#4a3020'), rr(-0.3, 0.3), rr(-0.2, 0.2), 0.37, J.body, 0); c.rotation.z = rr(-1, 1); } },   // cracked clay
      tick(g, U, J, state, t, dt) { const s = J.sac.scale.x; J.veinM.opacity = Math.max(0, Math.min(1, (s - 1) * 1.4)); if (state === 'idle' && Math.random() < dt * 1.5) U.events.push('sandDrool'); }   // extra: sand dribbles from the nozzle
    },
    husk: {
      build(g, U, J) { J.strips = []; const lm = toon('#d8c8a8', { side: THREE.DoubleSide }); for (const [par, x, y] of [[J.torso, 0.15, 0.2], [J.torso, -0.12, 0.45], [J.arms[0].sh, 0, -0.5], [J.arms[1].sh, 0, -0.45], [J.head, 0.1, -0.05]]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.35).translate(0, -0.17, 0), lm); s.position.set(x, y, -0.1); par.add(s); J.strips.push(s); } },   // loose linen strips
      tick(g, U, J, state, t, dt) { J.strips.forEach((s, i) => { s.rotation.x = 0.3 + Math.sin(t * 4 + i * 1.3) * 0.35; s.rotation.z = Math.sin(t * 3 + i) * 0.2; }); if (state === 'move' && Math.random() < dt * 4) U.events.push('sandTrickle'); if (state === 'recover' && Math.random() < dt * 2) U.events.push('sandTrickle'); }   // sand trickles from its joints
    },
    devil: {
      build(g, U, J) { J.junk = []; const items = [[new THREE.CylinderGeometry(0.1, 0.08, 0.14, 10, 1, true), '#8a8f96'], [new THREE.BoxGeometry(0.26, 0.16, 0.02), '#c9a173'], [new THREE.BoxGeometry(0.06, 0.03, 0.16), '#6b4a2a'], [new THREE.IcosahedronGeometry(0.14, 0), '#a08a5a']]; items.forEach(([geo, c], i) => { const m = M(geo, toon(c, { side: THREE.DoubleSide }), 0, 0, 0, g, 0.006); J.junk.push({ m, a: i * 1.6, h: 0.5 + i * 0.45, r: 0.7 + (i % 2) * 0.3 }); }); },   // a bucket, a sign, a sandal and a tumbleweed caught in the spin
      tick(g, U, J, state, t, dt) { const sp = U.spin || 6; J.junk.forEach((q, i) => { q.a += dt * sp * 0.6; q.m.position.set(Math.cos(q.a) * q.r, q.h + Math.sin(t * 2 + i) * 0.1, Math.sin(q.a) * q.r); q.m.rotation.set(t * 3 + i, t * 2, t); q.m.visible = state !== 'die' || t < 0.6; }); }
    },
    wyrm: {
      build(g, U, J) { J.segs.forEach((s, i) => { if (i % 2) return; const r = M(new THREE.TorusGeometry(0.3 * (1 - i / 22), 0.03, 4, 14), toon('#b8ac98'), 0, 0, 0, s, 0); }); },   // ribbed segments
      tick(g, U, J, state, t, dt) { if ((U.hp && U.hp.y > 0.3) && state !== 'die' && Math.random() < dt * 3) U.events.push('sandFall'); if (U.variant === 'Convoy Wyrm' && state === 'move' && Math.floor(t * 4) !== U.rat) { U.rat = Math.floor(t * 4); U.events.push('rattle'); } }   // extra: sand pours off its back when it surfaces
    },
    siphon: {
      build(g, U, J) { J.lamp = M(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb020' }), -0.3, 1.25, 0.3, J.body, 0); },   // extra: a warning lamp on top
      tick(g, U, J, state, t, dt) { if (Math.random() < dt * (state === 'windup' ? 6 : 1.2)) U.events.push('chimney'); if (state === 'windup' && Math.floor(t * 2.5) !== U.wh) { U.wh = Math.floor(t * 2.5); U.events.push('whistle'); } J.lamp.material.color.set(state === 'windup' || state === 'attack' ? (Math.sin(t * 20) > 0 ? '#ec3013' : '#3a0a0a') : (Math.sin(t * 2) > 0 ? '#ffb020' : '#5a3a10')); }
    },
    // ---------- LUXOR ----------
    slag: {
      build(g, U, J) { J.crust.forEach((c, i) => c.scale.multiplyScalar([0.7, 1.25, 0.9, 1.4, 0.8, 1.1][i % 6])); },   // big and small crust chunks
      tick(g, U, J, state, t, dt) { if (Math.random() < dt * (1.5 + (U.crustLvl || 0))) U.events.push('lavaDrip'); if (Math.random() < dt * 2) U.events.push('emberRise'); }   // lava drips from the seams; extra: embers rise off it
    },
    ember: {
      build(g, U, J) { const fm = new THREE.MeshBasicMaterial({ color: '#ffb020', transparent: true, opacity: 0.85 }); J.flame = new THREE.Group(); J.flame.position.y = 0.26; J.body.add(J.flame); [[0, 0.16, 0.08], [-0.06, 0.1, 0.05], [0.06, 0.11, 0.05]].forEach(([x, h, r], i) => { const f = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), i ? new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.8 }) : fm); f.position.set(x, h / 2, 0); J.flame.add(f); }); },   // a little flame on top
      tick(g, U, J, state, t, dt, opts) { J.flame.scale.set(1 + Math.sin(t * 17) * 0.12, 1 + Math.sin(t * 23) * 0.25 + (state === 'windup' ? 0.6 : 0), 1); J.flame.rotation.z = Math.sin(t * 9) * 0.15; if ((state === 'move' || state === 'attack') && Math.random() < dt * 10) U.events.push('emberRise'); if (state === 'idle' && Math.random() < dt * 0.6) U.events.push('crackle'); }   // sparks trail as it bounces; extra: it crackles
    },
    vent: {
      build(g, U, J) { J.lips.forEach(l => { for (let i = 0; i < 3; i++) { const th = M(new THREE.ConeGeometry(0.035, 0.12, 4), toon('#e8d8c0'), (i - 1) * 0.11, -0.04, 0.24, l, 0); th.rotation.x = -0.3; } }); },   // teeth around the rim
      tick(g, U, J, state, t, dt) { if (state === 'idle' && Math.random() < dt * 4) U.events.push('smoke'); if (Math.random() < dt * 1.0) U.events.push('lavaPop'); }   // a smoke column; extra: lava bubbles pop in its mouth
    },
    ash: {
      build(g, U, J) { J.cloak = []; const cm = toon('#5a5854', { side: THREE.DoubleSide }); for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.7 + (i % 2) * 0.2).translate(0, -0.35, 0), cm); s.position.set((i - 2) * 0.09, 0.9, -0.17); J.torso.add(s); J.cloak.push(s); } },   // a tattered ash cloak
      tick(g, U, J, state, t, dt) { J.cloak.forEach((s, i) => { s.rotation.x = 0.25 + Math.sin(t * 2.6 + i) * 0.15 + (state === 'move' ? 0.35 : 0); }); if (state === 'move' && Math.random() < dt * 3) U.events.push('chimney2'); if (state === 'idle' && Math.random() < dt * 1.5) U.events.push('breath'); }   // its footprints steam; extra: cold breath in idle
    },
    cinder: {
      build() {},
      tick(g, U, J, state, t, dt) { if (Math.random() < dt * 6) U.events.push('emberRise'); const per = 1 / ((U.phase || 1) * 0.8 + 0.6); if (Math.floor(t / per) !== U.hb) { U.hb = Math.floor(t / per); U.events.push('heartThump'); } }   // embers always rise from the heart; extra: you hear it beat
    },
    stealth: {
      build(g, U) { const sm = new THREE.MeshBasicMaterial({ color: '#5fe3ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.9, 16, 6, true), sm); sh.position.y = 0.95; g.add(sh); U.shimmer = sh; },   // a refraction ripple around it while cloaked
      tick(g, U, J, state, t, dt) { const k = Math.max(0, 0.6 - (U.cloak ?? 1)); U.shimmer.material.opacity = k * (0.18 + Math.sin(t * 13) * 0.08); U.shimmer.scale.set(1 + Math.sin(t * 7) * 0.04, 1, 1 + Math.cos(t * 9) * 0.04); U.shimmer.rotation.y = t; if (k > 0 && Math.floor(t * 1.5) !== U.hm) { U.hm = Math.floor(t * 1.5); U.events.push('hum2'); } }   // extra: the shield generator hums
    },
    // ---------- NEBO ----------
    hornet: {
      build(g, U, J) { for (const s of [-1, 1]) { const e = M(new THREE.SphereGeometry(0.075, 10, 8), toon('#3a0a14'), s * 0.08, 0.04, 0.38, J.body, 0.006); e.scale.set(0.8, 1.1, 0.7); M(new THREE.SphereGeometry(0.02, 6, 5), new THREE.MeshBasicMaterial({ color: '#ffffff' }), s * 0.09, 0.07, 0.43, J.body, 0); }   // bigger eyes with a shine
        J.hlegs = []; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const l = new THREE.Group(); l.position.set(s * 0.08, -0.1, 0.18 - i * 0.1); J.body.add(l); M(new THREE.CylinderGeometry(0.012, 0.01, 0.16, 4), toon(i % 2 ? '#1a1a1e' : '#ffd23a'), s * 0.05, -0.07, 0, l, 0).rotation.z = s * 0.6; J.hlegs.push(l); } },   // striped legs
      tick(g, U, J, state, t, dt, o) { J.hlegs.forEach((l, i) => l.rotation.x = Math.sin(t * 8 + i) * 0.25); if (state === 'attack' && !U.ranged && t < 0.05 && !(o && o.off)) U.events.push('buzzDive'); }   // a buzz that dives in pitch
    },
    queen: {
      build(g, U, J) { const hm = toon('#e0a020'); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 1.25 + (i % 2) * 0.32; const h = M(new THREE.CylinderGeometry(0.2, 0.2, 0.18 + (i % 3) * 0.1, 6), hm, Math.cos(a) * r, 0.45, Math.sin(a) * r, g, 0.01); } const back = new THREE.Group(); back.position.set(0, 0.4, -1.35); g.add(back); for (let i = 0; i < 9; i++) M(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 6), hm, ((i % 3) - 1) * 0.38, Math.floor(i / 3) * 0.33 + 0.3, 0, back, 0.01).rotation.x = Math.PI / 2;   // a honeycomb throne
        J.capeW = []; const wm = new THREE.MeshBasicMaterial({ color: '#ffe8a0', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }); for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.9).translate(0, -0.45, 0), wm); w.position.set((i - 1.5) * 0.24, 0.35, -0.25); J.body.add(w); J.capeW.push(w); } },   // a royal cape of wings
      tick(g, U, J, state, t, dt) { J.capeW.forEach((w, i) => { w.rotation.x = 0.35 + Math.sin(t * 2 + i) * 0.12; w.rotation.z = (i - 1.5) * 0.12; }); if (Math.random() < dt * 0.8) U.events.push('honey'); }   // extra: honey drips from the comb
    },
    thorn: {
      build(g, U, J) { const lm = toon('#5f9a48'); for (let i = 0; i < 7; i++) { const l = M(new THREE.IcosahedronGeometry(0.11, 0), lm, rr(-0.3, 0.3), 0.55 + rr(0, 0.12), rr(-0.6, 0.1), J.body, 0.008); l.scale.set(1.3, 0.5, 1); } for (const [x, z, c] of [[0.15, -0.3, '#f4a6b8'], [-0.2, -0.1, '#ffd23a'], [0.05, 0.05, '#ffffff']]) { M(new THREE.SphereGeometry(0.05, 6, 5), toon(c), x, 0.7, z, J.body, 0); }   // leaves and flowers on its back
        J.roots = []; J.legs.forEach(L => { const r = M(new THREE.ConeGeometry(0.05, 0.4, 5), toon('#3f2e22'), 0, -0.55, 0, L.p, 0.006); r.rotation.x = Math.PI; r.scale.y = 0.01; J.roots.push(r); }); },   // roots that dig in when it stops
      tick(g, U, J, state, t, dt) { const still = state === 'idle' || state === 'recover'; J.roots.forEach(r => r.scale.y += ((still ? 1 : 0.01) - r.scale.y) * Math.min(1, dt * 3)); if (state === 'idle' && Math.random() < dt * 0.4) U.events.push('butterfly'); }   // extra: a butterfly flits off it
    },
    deadfall: {
      build(g, U, J) { const nest = new THREE.Group(); nest.position.set(0.18, 0.5, 0.05); J.head.add(nest); M(new THREE.TorusGeometry(0.14, 0.05, 5, 12), toon('#8a6a3a'), 0, 0, 0, nest, 0.008).rotation.x = Math.PI / 2; const bird = new THREE.Group(); bird.position.y = 0.08; nest.add(bird); M(new THREE.SphereGeometry(0.06, 8, 6), toon('#5fa8e8'), 0, 0, 0, bird, 0.006); M(new THREE.SphereGeometry(0.04, 8, 6), toon('#5fa8e8'), 0, 0.06, 0.04, bird, 0.006); M(new THREE.ConeGeometry(0.015, 0.04, 4), toon('#ffb020'), 0, 0.06, 0.09, bird, 0).rotation.x = Math.PI / 2; J.bird = bird;   // a bird in a nest on its head
        for (let i = 0; i < 6; i++) { const m = M(new THREE.SphereGeometry(0.12, 6, 5), toon('#4f7a3a'), rr(-0.4, 0.4), rr(0.2, 1.4), 0.3, J.torso, 0); m.scale.set(1.4, 0.7, 0.4); } },   // moss
      tick(g, U, J, state, t, dt) { J.bird.rotation.y = Math.sin(t * 1.3) * 0.8; J.bird.position.y = 0.08 + (state === 'attack' || state === 'hurt' ? Math.abs(Math.sin(t * 20)) * 0.15 : 0); if (state === 'idle' && Math.random() < dt * 0.5) U.events.push('chirp'); }   // extra: it chirps; it jumps when the Deadfall attacks
    },
    spore: {
      build(g, U, J) { for (let i = 0; i < 8; i++) { const a = i * 0.8, r = 0.1 + (i % 3) * 0.08; M(new THREE.CircleGeometry(0.035, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), Math.cos(a) * r, 0.62 - r * 0.6, Math.sin(a) * r, J.body, 0).lookAt(new THREE.Vector3(Math.cos(a) * 2, 2, Math.sin(a) * 2)); } const gill = M(new THREE.CylinderGeometry(0.34, 0.2, 0.05, 16, 1, true), toon('#f1e6d0', { side: THREE.DoubleSide }), 0, 0.41, 0, J.body, 0); },   // spotted cap with gills underneath
      tick(g, U, J, state, t, dt, o) { const hop = state === 'move' ? Math.floor(t * 9 / Math.PI) : -1; if (hop !== U.hp2 && hop >= 0) { U.hp2 = hop; if (!(o && o.off)) U.events.push('puff'); } }   // a puff on every hop
    },
    mole: {
      build(g, U, J) { J.paws.forEach(p2 => { for (let f = 0; f < 3; f++) { const c = M(new THREE.ConeGeometry(0.025, 0.12, 4), toon('#e8e4dc'), (f - 1) * 0.05, 0, 0.12, p2, 0); c.rotation.x = Math.PI / 2; } });   // big digging claws
        if (U.warden) { for (const s of [-1, 1]) M(new THREE.TorusGeometry(0.06, 0.012, 5, 12), toon('#1a1a1e'), s * 0.11, 0.08, 0.27, J.head, 0); }   // glasses on the Molewarden
        J.nose2 = J.head.children.find(c => c.isMesh && c.geometry.type === 'SphereGeometry' && c.position.z > 0.2); },
      tick(g, U, J, state, t, dt) { if (J.nose2) J.nose2.position.y = -0.02 + Math.sin(t * 18) * 0.012 * (state === 'idle' ? 1 : 0.3); if ((state === 'windup' || state === 'attack') && Math.random() < dt * 8) U.events.push('dirt'); }   // dirt flies; extra: the nose sniffs
    },
    shrike: {
      build(g, U) { const P2 = U.P, lift = P2.legs[0].position.y - 0.5, cm = toon('#241c2a', { side: THREE.DoubleSide }); U.coat = []; for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.7).translate(0, -0.35, 0), cm); s.position.set((i - 2) * 0.12, 0.62 + lift, -0.24); P2.body.add(s); U.coat.push(s); }   // a long tattered coat tail
        const hat = new THREE.Group(); hat.position.set(0, 0.36, 0); P2.head.add(hat); M(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 16), toon('#1a1418'), 0, 0, 0, hat, 0.008); M(new THREE.CylinderGeometry(0.2, 0.22, 0.34, 16), toon('#1a1418'), 0, 0.18, 0, hat, 0.01); M(new THREE.CylinderGeometry(0.205, 0.205, 0.05, 16), toon('#c084fc'), 0, 0.06, 0, hat, 0);   // a lamplighter's hat
        U.mothsS = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.04), new THREE.MeshBasicMaterial({ color: '#e9d5ff', side: THREE.DoubleSide })); g.add(m); U.mothsS.push(m); } },   // extra: moths circling her lantern
      tick(g, U, J, state, t, dt) { U.coat.forEach((s, i) => s.rotation.x = 0.15 + Math.sin(t * 2.5 + i * 0.9) * 0.12 + (state === 'move' ? 0.35 : 0)); const lp = new THREE.Vector3(); U.weak.getWorldPosition(lp); g.worldToLocal(lp); U.mothsS.forEach((m, i) => { const a = t * 3 + i * 2.1; m.position.set(lp.x + Math.cos(a) * 0.2, lp.y + Math.sin(a * 1.7) * 0.08 + 0.05, lp.z + Math.sin(a) * 0.2); m.rotation.y = a; m.scale.y = 0.4 + Math.abs(Math.sin(t * 30 + i)) * 0.6; }); }
    },
    // ---------- UR ----------
    urbeast: {
      build(g, U, J) { const par = J.torso || J.body, sm = toon('#3a2a2a'), runner = U.kind === 'runner'; for (let i = 0; i < (runner ? 2 : 3); i++) { const y = runner ? 0.05 : 0.3 + i * 0.18, line = M(new THREE.BoxGeometry(runner ? 0.02 : 0.2, 0.012, runner ? 0.3 : 0.01), sm, runner ? -0.06 + i * 0.12 : 0.05, y, runner ? 0 : 0.16, par, 0); for (let s = 0; s < 4; s++) M(new THREE.BoxGeometry(runner ? 0.05 : 0.01, 0.012, runner ? 0.01 : 0.05), sm, (runner ? -0.06 + i * 0.12 : 0.05 + (s - 1.5) * 0.05), y, runner ? (s - 1.5) * 0.07 : 0.165, par, 0); }   // lab-scar stitches
        const wp = new THREE.Vector3(); U.weak.getWorldPosition(wp); U.weak.parent.worldToLocal(wp); J.blink = M(new THREE.SphereGeometry(0.022, 6, 5), new THREE.MeshBasicMaterial({ color: '#ec3013' }), U.weak.position.x, U.weak.position.y - 0.02, U.weak.position.z + (runner ? 0.11 : 0.13), U.weak.parent, 0); },   // the collar light
      tick(g, U, J, state, t, dt) { J.blink.material.color.set(Math.sin(t * (state === 'windup' || state === 'attack' ? 16 : 3)) > 0.3 ? '#ec3013' : '#3a0a0a'); if (U.kind === 'tall' && state === 'idle' && J.head) { const j = Math.floor(t * 1.2); if (j !== U.jk) { U.jk = j; U.jy = (Math.random() - 0.5) * 1.2; } J.head.rotation.y += ((U.jy || 0) - J.head.rotation.y) * Math.min(1, dt * 20); } }   // extra: the Tall One's head jerks round
    },
    attendant: {
      build(g, U, J) { J.trails = []; const lm = toon(U.slabColor, { side: THREE.DoubleSide }); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const s = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.8).translate(0, -0.4, 0), lm); s.position.set(Math.cos(a) * 0.48, 1.6 - (i % 2) * 0.5, Math.sin(a) * 0.48); s.rotation.y = -a; J.body.add(s); J.trails.push(s); } J.iris = M(new THREE.TorusGeometry(0.1, 0.018, 4, 6), toon('#1a1a1e'), 0, 0, 0.4, J.head, 0); },   // trailing linen ends; extra: a turning lens iris
      tick(g, U, J, state, t, dt) { J.trails.forEach((s, i) => { s.rotation.x = 0.2 + Math.sin(t * 2.4 + i * 1.3) * 0.25; }); J.iris.rotation.z = t * (state === 'windup' || state === 'attack' ? 6 : 0.8); if (state === 'attack' && Math.floor(t * 10) !== U.sc) { U.sc = Math.floor(t * 10); U.events.push('scorch'); } }   // the beam scorches a line
    },
    specimen: {
      build(g, U, J) { const sm = toon('#3a2a2a'); for (const [x, y, len, r] of [[0.15, 0.7, 0.6, 1.3], [-0.2, 0.45, 0.4, 0.3]]) { const line = M(new THREE.BoxGeometry(len, 0.02, 0.02), sm, x, y, 0.43, J.torso, 0); line.rotation.z = r; for (let s = 0; s < 5; s++) { const st = M(new THREE.BoxGeometry(0.02, 0.07, 0.02), sm, x + Math.cos(r) * (s - 2) * len / 5, y + Math.sin(r) * (s - 2) * len / 5, 0.435, J.torso, 0); st.rotation.z = r; } }   // stitched seams
        J.collars.forEach((c, i) => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 32; const x = cv.getContext('2d'); x.fillStyle = '#e8e4dc'; x.fillRect(0, 0, 64, 32); x.fillStyle = '#1a1a1e'; x.font = '900 20px Archivo, Arial'; x.fillText(['001', '014', '027', '039'][i], 8, 24); const tg = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.08), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide })); tg.position.set(0, -0.06, 0.1); tg.rotation.x = -Math.PI / 2; c.add(tg); }); },   // the collar numbers, readable
      tick(g, U, J, state, t) { const br = 1 + Math.sin(t * (state === 'recover' ? 5 : 1.6)) * (state === 'recover' ? 0.05 : 0.025); J.torso.scale.set(br, 1, br); if (state === 'recover' && Math.floor(t * 2.5) !== U.br2) { U.br2 = Math.floor(t * 2.5); U.events.push('breath2'); } }   // extra: heavy breathing
    },
    // ---------- ZION ----------
    scrap: {
      build(g, U, J) {
        if (U.kind === 'scrapper') { const saw = new THREE.Group(); saw.position.set(0.36, 0.0, 0.08); J.body.add(saw); M(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 14), toon('#cfd6dc'), 0, 0, 0, saw, 0.006).rotation.z = Math.PI / 2; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const tth = M(new THREE.ConeGeometry(0.025, 0.06, 3), toon('#cfd6dc'), 0, Math.cos(a) * 0.15, Math.sin(a) * 0.15, saw, 0); tth.rotation.x = a; } J.saw = saw; }   // a sawblade arm
        if (U.kind === 'hulk') { J.stack = M(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 8), toon('#3a3836'), 0.5, 1.6, -0.6, J.body, 0.01, 0.1); J.heads = []; J.body.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.color.getHexString() === 'fff2b0') J.heads.push(o); }); }   // an exhaust stack, headlights that flicker
        if (U.kind === 'bolt') { J.crank = new THREE.Group(); J.crank.position.set(-0.36, 0.45, 0); J.body.add(J.crank); M(new THREE.BoxGeometry(0.04, 0.3, 0.04).translate(0, 0.15, 0), toon('#9aa0a8'), 0, 0, 0, J.crank, 0.006); M(new THREE.SphereGeometry(0.05, 6, 5), toon('#c42d3c'), 0, 0.3, 0, J.crank, 0.006); }   // a crank that winds up
      },
      tick(g, U, J, state, t, dt) {
        if (J.saw) { J.saw.rotation.x += dt * (state === 'windup' || state === 'attack' ? 40 : 6); if (state === 'attack' && Math.random() < dt * 20) U.events.push('spark'); }
        if (J.stack && Math.random() < dt * (state === 'windup' || state === 'attack' ? 10 : 1.5)) U.events.push('exhaust');
        if (J.heads) J.heads.forEach(h => h.visible = Math.random() > 0.04); if (U.kind === 'hulk' && state === 'windup' && t < 0.03) U.events.push('horn');   // extra: it honks before it charges
        if (J.crank) { J.crank.rotation.x = state === 'windup' ? t * 18 : J.crank.rotation.x; if (state === 'attack' && t < 0.03) U.events.push('boing'); }   // extra: a spring boing on the throw
      }
    },
    crusher: {
      build(g, U, J) { const drum = new THREE.Group(); drum.position.set(0, -1.1, 0.5); J.arms[1].el.add(drum); M(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 12), toon('#4b5563'), 0, 0, 0, drum, 0.02).rotation.z = Math.PI / 2; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; M(new THREE.BoxGeometry(0.84, 0.1, 0.1), toon('#9aa0a8'), 0, Math.cos(a) * 0.42, Math.sin(a) * 0.42, drum, 0.006); } J.drum = drum; },   // a big spinning crusher drum
      tick(g, U, J, state, t, dt) { J.drum.rotation.x += dt * (state === 'windup' || state === 'attack' ? 14 : 2); if (state === 'attack' && t > 0.25 && t < 0.4 && Math.random() < 0.5) U.events.push('spark'); }   // extra: sparks when it lands
    },
    gang: {
      build(g, U) { const P2 = U.P, col = { brawl: '#ffd23a', heavy: '#38bdf8', paint: '#ec3013' }[U.role]; const bd = M(new THREE.TorusGeometry(0.4, 0.06, 6, 24), toon(col), 0, 0.22, 0, P2.head, 0.008); bd.rotation.x = Math.PI / 2 - 0.15; const kt = M(new THREE.ConeGeometry(0.05, 0.2, 5), toon(col), 0.05, 0.18, -0.42, P2.head, 0.006); kt.rotation.x = -2.2;   // a bandana in each member's colour
        U.tw = U.role === 'brawl' ? P2.arms[1] : null; },
      tick(g, U, J, state, t, dt) { if (U.role === 'paint' && state === 'attack' && Math.floor(t * 8) !== U.pm) { U.pm = Math.floor(t * 8); U.events.push('paintMark'); } if (U.tw && state === 'idle') U.tw.rotation.y = Math.sin(t * 6) * 0.6; }   // Sparks leaves paint on the ground; extra: Ratchet twirls the wrench
    },
    // ---------- HOME ----------
    snow: {
      build(g, U, J) { const mc = toon(U.ranged ? '#c42d3c' : '#38bdf8'); J.arms.forEach(A => M(new THREE.SphereGeometry(0.07, 8, 6), mc, 0, 0, 0, A.hand, 0.006));   // mittens
        const sc = M(new THREE.TorusGeometry(0.29, 0.06, 6, 18), mc, 0, 0.42, 0, J.mid, 0.008); sc.rotation.x = Math.PI / 2; const tl = M(new THREE.BoxGeometry(0.1, 0.32, 0.03), mc, 0.16, 0.3, 0.26, J.mid, 0.006); tl.rotation.z = 0.2; J.scarf = tl;   // a scarf
        J.carrot = J.head.children.find(c => c.isMesh && c.geometry.type === 'ConeGeometry' && c.position.z > 0.3); },
      tick(g, U, J, state, t, dt) { if (J.carrot) J.carrot.rotation.z = Math.sin(t * (state === 'move' ? 14 : 4)) * 0.15; J.scarf.rotation.x = Math.sin(t * 3) * 0.2 + (state === 'move' ? 0.4 : 0); if (Math.random() < dt * 2) U.events.push('snowflake'); }   // the carrot wobbles; extra: snow falls around it
    },
    king: {
      build(g, U, J) { for (let i = 0; i < 7; i++) { const ic = M(new THREE.ConeGeometry(0.05, 0.3 + (3 - Math.abs(i - 3)) * 0.07, 5), toon('#a8e0f5'), (i - 3) * 0.08, -0.32, 0.36 - Math.abs(i - 3) * 0.03, J.head, 0.006); ic.rotation.x = Math.PI; }   // an icicle beard
        const cape = new THREE.Group(); cape.position.set(0, 0.4, -0.6); J.mid.add(cape); M(new THREE.PlaneGeometry(1.6, 2.0).translate(0, -1.0, 0), toon('#dff4ff', { side: THREE.DoubleSide }), 0, 0, 0, cape, 0.008); for (let i = 0; i < 6; i++) M(new THREE.ConeGeometry(0.08, 0.3, 5), toon('#a8e0f5'), -0.7 + i * 0.28, -2.05, 0.02, cape, 0).rotation.x = Math.PI; J.cape = cape; },   // a frost cape
      tick(g, U, J, state, t, dt) { J.cape.rotation.x = 0.15 + Math.sin(t * 1.4) * 0.05 + (state === 'attack' ? -0.2 : 0); if (Math.random() < dt * (state === 'windup' ? 6 : 1.5)) U.events.push('breath'); }   // extra: frosty breath
    },
    worm: {
      build(g, U, J) { const sh = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false }); J.segs.forEach((s, i) => { if (i % 2) return; const h = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), sh); h.position.set(-0.12, 0.12, 0.12); h.scale.set(1, 0.5, 0.6); s.add(h); });   // a shiny wet look
        J.crumbs = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const c = M(new THREE.DodecahedronGeometry(0.06, 0), toon('#5a4030'), Math.cos(a) * 0.5, 0.04, Math.sin(a) * 0.5, g, 0); J.crumbs.push(c); } },   // dirt crumbs round the hole
      tick(g, U, J, state, t, dt) { J.crumbs.forEach((c, i) => c.position.y = 0.04 + (state === 'windup' || state === 'attack' ? Math.abs(Math.sin(t * 20 + i)) * 0.08 : 0)); if (state === 'idle' && Math.floor(t * 0.4) !== U.dr2) { U.dr2 = Math.floor(t * 0.4); U.events.push('drip'); } }   // extra: it drips
    },
    fed: {
      build(g, U, J) { J.ff = []; for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), new THREE.MeshBasicMaterial({ color: '#f5e6ff' })); g.add(f); J.ff.push({ f, a: i * 1.05, r: 1.6 + (i % 3) * 0.3, h: 1.2 + (i % 2) * 0.8 }); } },   // extra: little glowing motes drift round it like fireflies
      tick(g, U, J, state, t, dt) { U.weakMat.emissiveIntensity = 0.6 + Math.sin(t * 1.1) * 0.35 + (state === 'windup' || state === 'attack' ? 1 : 0); J.head.scale.setScalar(1 + Math.sin(t * 1.1) * 0.025); if (Math.floor(t * 0.5) !== U.tr2) { U.tr2 = Math.floor(t * 0.5); U.events.push('tear'); } J.ff.forEach((q, i) => { q.a += dt * 0.4; q.f.position.set(Math.cos(q.a) * q.r, q.h + Math.sin(t * 1.5 + i) * 0.2, Math.sin(q.a) * q.r); q.f.visible = Math.sin(t * 2 + i * 1.7) > -0.6; }); }   // it breathes in light; slow tears drip
    },
    // ---------- EARTH ----------
    beast: {
      build(g, U, J) { if (U.rat) { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const w = M(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 3), toon('#e8e4dc'), s * 0.05, -0.01 + i * 0.012, 0.13, J.head, 0); w.rotation.set(0, 0, s * (1.3 + i * 0.15)); } J.pnose = M(new THREE.SphereGeometry(0.018, 6, 5), toon('#f4a6b8'), 0, -0.02, 0.17, J.head, 0); }   // whiskers + a pink nose
        else { for (const [x, y, z] of [[0.12, 0.08, -0.1], [-0.1, 0.1, 0.15], [0.05, -0.02, -0.3]]) { const m2 = M(new THREE.SphereGeometry(0.07, 6, 5), toon('#8a6a42'), x, y, z, J.body, 0); m2.scale.set(1, 0.35, 1.2); } const ear = J.head.children.find(c => c.isMesh && c.geometry.type === 'ConeGeometry' && c.position.x > 0); if (ear) ear.rotation.x = 1.0; }   // mangy patches, one ear bent
      },
      tick(g, U, J, state, t, dt, o) { if (J.pnose) J.pnose.position.y = -0.02 + Math.sin(t * 22) * 0.006; if (!U.rat && state === 'windup' && Math.random() < dt * 6 && !(o && o.off)) U.events.push('drool'); }   // extra: the Stray drools when it growls
    },
    crew: {
      build(g, U) { const P2 = U.P, lift = P2.legs[0].position.y - 0.5; M(new THREE.BoxGeometry(0.12, 0.05, 0.01), new THREE.MeshBasicMaterial({ color: '#ffffff' }), -0.16, 1.05 + lift, 0.33, P2.body, 0);   // a name tag
        if (U.variant === 'Doorman') P2.arms.forEach(A => M(new THREE.SphereGeometry(0.075, 8, 6), toon('#ffffff'), 0, -0.46, 0.02, A, 0.006));   // white gloves
        if (U.variant === 'Airman') { const w = M(new THREE.BoxGeometry(0.16, 0.025, 0.01), toon('#e0b43a'), 0.16, 1.12 + lift, 0.33, P2.body, 0); }   // wings badge
        if (U.variant === 'Suit') U.glint = true; },
      tick(g, U, J, state, t, dt) { const P2 = U.P; if (U.variant === 'Manager' && state === 'idle') P2.arms[1].rotation.x = -0.6 + Math.abs(Math.sin(t * 5)) * 0.25; if (U.glint && state === 'windup' && t < 0.03) U.events.push('glint'); }   // extra: the Manager taps his clipboard; the Suit's sunglasses glint
    },
    night: {
      build(g, U) { const P2 = U.P, hat = new THREE.Group(); hat.position.set(0, 0.38, 0); P2.head.add(hat); M(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 16), toon('#0c0c0e'), 0, 0, 0, hat, 0.008); M(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 16), toon('#0c0c0e'), 0, 0.26, 0, hat, 0.01); M(new THREE.CylinderGeometry(0.225, 0.225, 0.06, 16), toon('#7a1d2a'), 0, 0.06, 0, hat, 0);   // a top hat
        const lift = P2.legs[0].position.y - 0.5; M(new THREE.BoxGeometry(0.14, 0.05, 0.01), toon('#e0b43a'), -0.17, 1.06 + lift, 0.33, P2.body, 0);   // a brass name badge
        const sh = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.55, depthWrite: false })); sh.scale.set(0.6, 1.6, 1); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; g.add(sh); U.wrongShadow = sh; },   // a shadow that moves wrong
      tick(g, U, J, state, t, dt) { const s = U.wrongShadow; s.position.x = Math.sin(t * 0.7) * 0.9; s.position.z = 0.6 + Math.cos(t * 0.5) * 0.5; s.rotation.z = Math.sin(t * 0.9) * 0.8; if (Math.floor(t) !== U.tk) { U.tk = Math.floor(t); U.events.push('tick'); } }   // extra: his stopped watch ticks anyway
    },
    // ---------- SPACE ----------
    belt: {
      build(g, U, J) { J.spots = []; J.segs.forEach((s, i) => { if (i % 2) return; for (const sx of [-1, 1]) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.05 * (1 - i / 24), 6, 5), new THREE.MeshBasicMaterial({ color: '#5fe3ff' })); sp.position.set(sx * 0.26 * (1 - i / 22), 0.08, 0); s.add(sp); J.spots.push({ sp, i }); } }); },   // glowing spots like deep-sea lights
      tick(g, U, J, state, t) { J.spots.forEach(q => { const k = 0.5 + 0.5 * Math.sin(t * 4 - q.i * 0.5); q.sp.material.color.setRGB(0.37 * k + 0.3 * (1 - k), 0.89 * k, 1 * k + 0.5 * (1 - k)); q.sp.scale.setScalar(0.7 + k * 0.6); }); }   // extra: a light ripple runs down its body
    },
    moths: {
      build() {},
      tick(g, U, J, state, t, dt) { if (Math.random() < dt * 10) U.events.push('mothDust'); J.nest.scale.setScalar(1 + Math.sin(t * 2) * 0.05); }   // sparkling dust trails; extra: the nest pulses
    },
    octo: {
      build(g, U, J) { J.arms.forEach(A => A.segs.forEach((s, j) => { if (j % 2) return; const su = M(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), toon('#f0b8f0'), 0, -0.17, 0.09 - j * 0.012, s, 0); su.rotation.x = Math.PI / 2; }));   // suckers under the tentacles
        const mantle = J.body.children.find(c => c.isMesh); if (mantle) { mantle.material = mantle.material.clone(); J.mantleM = mantle.material; J.base = mantle.material.color.clone(); } },
      tick(g, U, J, state, t, dt) { if (J.mantleM) { const angry = state === 'windup' || state === 'attack' ? 1 : 0; J.ang = (J.ang || 0) + (angry - (J.ang || 0)) * Math.min(1, dt * 4); J.mantleM.color.copy(J.base).lerp(new THREE.Color('#d0303c'), J.ang); } if (state === 'idle' && Math.random() < dt * 1.2) U.events.push('bubble'); }   // it flushes red when angry; extra: bubbles
    },
  };
  return {
    build(g) { const U = g.userData, p = P[U.family === 'serpent' && /Breaker|Convoy|Cistern/.test(U.variant) ? 'wyrm' : U.family]; if (p && p.build) { p.build(g, U, U.joints || {}); U.polish = p; } },
    tick(g, state, t, dt, opts) { const U = g.userData; if (U.polish && U.polish.tick) U.polish.tick(g, U, U.joints || {}, state, t, dt, opts); },
    add(family, def) { P[family] = def; },
  };
}
