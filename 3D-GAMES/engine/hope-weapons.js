// HOPE'S WEAPONS. She is blind: everything is the cane, sound, touch and vibration.
//   MELEE (1): sweep (CANE SWEEP, trips → next hit +50%) · staff (CANE STAFF, 3-hit, 3rd = long thrust) · tap (TAP STRIKE, 3 taps → ground shock line)
//              beat (DROP THE BEAT: tap 1 on the beat she hears, every beat in a row hits harder, up to 3×)
//   RANGED (2): echo (ECHO DART, homes on whatever she heard last) · tip (CANE TIP SHOT, whip on a cord, pulls) · bell (SONIC BELL, lob, confuses)
//               drone (GUIDE DRONE, a robot bird that flies with her; tap 2 sends it to peck)
//   HOLDS: hold 1 = ECHOLOCATION PULSE (outlines every enemy, hits on outlined = critical) · hold 2 = WAVE OF SOUND (cone, knockback, breaks armour)
//          hold 3 in the air = CANE VAULT (extra height + landing slam) · hold 3 on the ground (stick still) = FEEDBACK SHIELD (returns shots)
//   PASSIVES: SIXTH SENSE (a tell rings before a shot lands; roll on it = perfect, no damage) · STEADY GROUND (can't be tripped or confused)
//             · SUNGLASSES (flash and glare attacks don't affect her)
export const HOPE_MELEE = {
  sweep: { name: 'CANE SWEEP', line: 'A fast low arc in front of her. Trips them: the next hit does +50%.', dmg: 1, stats: [1, 1, 1] },
  staff: { name: 'CANE STAFF', line: 'Bo-staff spin, 3-hit combo. The third hit is a long thrust. A bit faster, a bit less damage.', dmg: 0.85, stats: [0.85, 1.15, 1.4] },
  tap: { name: 'TAP STRIKE', line: 'Three taps, then a shock runs along the floor in a line. Slow, hits everything in the line.', dmg: 1.2, stats: [1.2, 0.5, 3] },
  beat: { name: 'DROP THE BEAT', line: 'Tap 1 on the beat she hears. Every beat in a row hits 25% harder, up to 3×. Miss and it resets.', dmg: 1, stats: [1, 1, 1] },
};
export const HOPE_RANGED = {
  echo: { name: 'ECHO DART', line: 'A click becomes a sound bolt. Homes on whatever she heard last and never misses it.', dmg: 1, stats: [0.33, 1, 1] },
  tip: { name: 'CANE TIP SHOT', line: 'The white tip flies out on a cord and snaps back. Pulls them toward her.', dmg: 0.8, range: 7, stats: [0.27, 0.7, 0.5] },
  bell: { name: 'SONIC BELL', line: 'A lobbed bell that bursts on landing. Everyone inside is confused for 3 s.', dmg: 0.5, stats: [0.17, 0.5, 0.8] },
  drone: { name: 'GUIDE DRONE', line: 'A robot bird flies with her. Tap 2 sends it to peck a target, then it comes back.', dmg: 0.4, stats: [0.4, 0.4, 0.9] },
};
export const HOPE_HOLDS = {
  echo: { name: 'ECHOLOCATION PULSE', line: 'Hold 1. Every enemy glows for 5 s, even through walls. Hits on glowing enemies are critical.', radius: 14, dur: 5 },
  wave: { name: 'WAVE OF SOUND', line: 'Hold 2. A cone blast that knocks back and breaks armour (+25% damage taken for 5 s).', len: 6, ang: 0.6 },
  vault: { name: 'CANE VAULT', line: 'Hold 3 in the air. She plants the cane, vaults higher and slams down.' },
  shield: { name: 'FEEDBACK SHIELD', line: 'Hold 3 on the ground, stick still. The cane hums and returns shots.' },
};
export const HOPE_PASSIVES = [
  ['SIXTH SENSE', 'A tell rings just before a shot lands. Roll on it: perfect dodge, no damage.'],
  ['STEADY GROUND', 'She can’t be tripped or confused.'],
  ['SUNGLASSES', 'Flash and glare attacks don’t affect her.'],
];
export function hopeWeaponKit({ THREE, M, toon, scene }) {
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glow = (color, size, parent, op = 0.9) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.scale.setScalar(size); parent.add(s); return s; };
  const fx = [];
  // flat expanding ring (sound made visible). dur seconds, r = final radius
  function wave(pos, r, col = 0x7dd3fc, dur = 0.5, y = 0.05) { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(pos.x, y, pos.z); scene.add(m); fx.push({ m, t: 0, dur, r, kind: 'ring' }); }
  // a fan of sound in front of her
  function fan(pos, face, len, ang, col = 0xbae6fd) { const g = new THREE.CircleGeometry(1, 24, Math.PI / 2 - ang, ang * 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, face + Math.PI, 0); m.position.set(pos.x, 0.6, pos.z); scene.add(m); fx.push({ m, t: 0, dur: 0.45, r: len, kind: 'fan' }); }
  // a straight shock line along the floor
  function line(from, face, len, col = 0xffffff) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.geometry.translate(0, 0.5, 0); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, face + Math.PI, 0); m.position.set(from.x, 0.04, from.z); scene.add(m); fx.push({ m, t: 0, dur: 0.4, r: len, kind: 'line' }); }
  function update(dt) { for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; const u = Math.min(1, f.t / f.dur);
    if (f.kind === 'ring') { f.m.scale.setScalar(0.2 + u * f.r); f.m.material.opacity = 0.9 * (1 - u); }
    else if (f.kind === 'fan') { const s = 0.3 + u * f.r; f.m.scale.set(s, s, 1); f.m.material.opacity = 0.55 * (1 - u); }
    else { f.m.scale.set(1, Math.max(0.01, Math.min(1, u * 2.2)) * f.r, 1); f.m.material.opacity = 0.8 * (1 - u); }
    if (u >= 1) { scene.remove(f.m); f.m.geometry.dispose(); f.m.material.dispose(); fx.splice(i, 1); } } }
  function makeBell() { const g = new THREE.Group(); const b = M(new THREE.CylinderGeometry(0.08, 0.2, 0.26, 16, 1, true), toon('#e6b45a'), 0, 0, 0, g, 0.012); b.material.side = THREE.DoubleSide; M(new THREE.SphereGeometry(0.05, 10, 8), toon('#201e1d'), 0, -0.12, 0, g, 0.008, 0.05); M(new THREE.TorusGeometry(0.05, 0.015, 6, 12), toon('#e6b45a'), 0, 0.16, 0, g, 0.006); glow(0xffd23a, 0.7, g, 0.6); return g; }
  function makeTip() { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.07, 12, 10), toon('#f8fafc'), 0, 0, 0, g, 0.012, 0.07); M(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 10), toon('#ec3013'), 0, 0.07, 0, g, 0.008, 0.045); glow(0xffffff, 0.5, g, 0.6);
    const cord = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xf8fafc })); cord.frustumCulled = false; g.userData.cord = cord; return g; }
  function makeDrone() { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const white = toon('#f1f5f9'), ink = toon('#1e293b');
    M(new THREE.SphereGeometry(0.16, 14, 10), white, 0, 0, 0, body, 0.015, 0.16).scale.set(0.9, 0.8, 1.25);
    M(new THREE.SphereGeometry(0.1, 12, 10), white, 0, 0.1, 0.17, body, 0.012, 0.1);
    const beak = M(new THREE.ConeGeometry(0.035, 0.12, 8), toon('#e6b45a'), 0, 0.09, 0.3, body, 0.006); beak.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }), sx * 0.05, 0.13, 0.25, body, 0);
    const wings = [-1, 1].map(sx => { const p = new THREE.Group(); p.position.set(sx * 0.12, 0.04, 0); body.add(p); M(new THREE.BoxGeometry(0.3, 0.02, 0.16), ink, sx * 0.15, 0, 0, p, 0.008); M(new THREE.BoxGeometry(0.3, 0.025, 0.03), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }), sx * 0.15, 0, 0.07, p, 0); return p; });
    const tail = M(new THREE.BoxGeometry(0.12, 0.02, 0.14), ink, 0, 0.02, -0.22, body, 0.006); glow(0x7dd3fc, 0.45, body, 0.4).position.set(0, -0.12, 0);
    g.userData.tick = (t, fast) => { const f = Math.sin(t * (fast ? 40 : 22)) * 0.7; wings[0].rotation.z = f; wings[1].rotation.z = -f; body.position.y = Math.sin(t * 3) * 0.04; }; return g; }
  function makeShield() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.2, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); c.position.y = 1.1; g.add(c);
    const rings = [0.3, 1.1, 1.9].map(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.015, 6, 48), new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.7 })); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); return r; });
    g.userData.tick = t => { rings.forEach((r, i) => { r.position.y = ((t * 1.4 + i / 3) % 1) * 2.2; r.material.opacity = 0.7 * Math.sin(((t * 1.4 + i / 3) % 1) * Math.PI); }); c.material.opacity = 0.14 + Math.sin(t * 30) * 0.04; }; g.visible = false; return g; }
  // see-through outline marker for ECHOLOCATION (drawn on top of everything)
  function makeMarker() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.56, 40), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide })); m.renderOrder = 8; m.scale.y = 2.1; g.add(m); g.visible = false; return g; }
  return { wave, fan, line, update, makeBell, makeTip, makeDrone, makeShield, makeMarker, glow, glowTex };
}
