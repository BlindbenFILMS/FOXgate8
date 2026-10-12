// NOBLE'S CHAIR WEAPONS (Ben's set). Hands stay on the wheels; every weapon is built into the chair.
//   MELEE (1): spike (SPIKE WHEEL, 360 spin, sword damage) · ram (BATTERING RAM, armrest spikes + short charge, +25%, 25% slower cycle)
//              horn (AUDIO HORN, 360 stun burst at sword range, no damage)
//   RANGED (2): shoe (SHOEMERANG, right boot out and back) · boot (BOOTERANG, bigger, stronger, slower) · homing (HOMING SHOE, seeks, longer range)
//   HOLDS: hold 1 = SPIN-OUT (wheelie 720, knockback all round) · hold 2 = LAUNCHERS (twin mini-rockets) · hold 3 in the air = HOVER
// nobleWeaponKit({ THREE, M, toon }).attach(noble) → NW. Host calls NW.play(key), NW.hover(on) and NW.update(dt, speed) every frame
// (after animFox) and applies the returned pose { yaw, tilt, lift } to the root. Props sit on the fox root at the chair's geo.
export const NOBLE_MELEE = {
  spike: { name: 'SPIKE WHEEL', line: 'Spikes pop out of the wheels. 360° spin, sword damage.', dmg: 1, dur: 0.45, cd: 0.1, stats: [1, 1, 1] },
  ram: { name: 'BATTERING RAM', line: 'Armrest spikes come forward. Short fast charge, +25% damage, then a recharge.', dmg: 1.25, dur: 0.3, cd: 0.39, stats: [1.25, 0.8, 1.3] },
  horn: { name: 'AUDIO HORN', line: '360° stun burst at sword range. No damage. Small 3 s, medium and foxes 2 s, big 1 s, bosses 0.5 s.', dmg: 0, dur: 0.4, cd: 1.2, stats: [0, 0.45, 1] },
};
export const NOBLE_RANGED = {
  shoe: { name: 'SHOEMERANG', line: 'His right boot flies out and comes back.', dmg: 1.2, range: 7.2, out: 0.43, scale: 1, hitR: 0.75, stats: [0.4, 1, 0.6] },
  boot: { name: 'BOOTERANG', line: 'A bigger boot. Hits twice as hard, flies slower.', dmg: 2.4, range: 7.2, out: 0.7, scale: 1.8, hitR: 1.05, stats: [0.8, 0.6, 0.6] },
  homing: { name: 'HOMING SHOE', line: 'Seeks the nearest enemy. Longer range than the shoemerang.', dmg: 1.2, range: 11.5, out: 0.75, scale: 1, hitR: 0.75, stats: [0.4, 0.85, 1] },
};
export const NOBLE_HOLDS = { spin: { name: 'SPIN-OUT', dur: 0.8, radius: 3.4, dmg: 1.4 }, rockets: { name: 'ARMREST LAUNCHERS', dur: 1.1 }, hover: { name: 'HOVER', max: 1.4 } };
// stun seconds by size class: small 3, medium (and fox NPCs) 2, big 1, boss 0.5
export function stunSeconds(u = {}) { if (u.boss) return 0.5; if (u.fox) return 2; const h = u.height || 1.5; return h > 2.2 ? 1 : h > 1.2 ? 2 : 3; }
export function stunClass(u = {}) { if (u.boss) return 'BOSS'; if (u.fox) return 'FOX'; const h = u.height || 1.5; return h > 2.2 ? 'BIG' : h > 1.2 ? 'MEDIUM' : 'SMALL'; }

export function nobleWeaponKit({ THREE, M, toon }) {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glow = (color, size, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); s.scale.setScalar(size); parent.add(s); return s; };
  const steel = toon('#cbd5e1'), ink = toon('#1e293b'), red = toon('#ec3013'), gold = toon('#e6b45a');
  const lit = c => new THREE.MeshToonMaterial({ color: c, gradientMap: toon('#fff').gradientMap, emissive: new THREE.Color(c), emissiveIntensity: 1.5 });
  // dizzy stars: a ring of five that spins above a stunned head
  function makeStars(r = 0.42) { const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0xffd23a }); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, s = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), mat); s.scale.set(1, 1, 0.45); s.position.set(Math.cos(a) * r, Math.sin(a * 2) * 0.05, Math.sin(a) * r); g.add(s); } g.visible = false; g.userData.tick = dt => { g.rotation.y += dt * 4.5; g.children.forEach((s, i) => { s.rotation.y += dt * 6; s.position.y = Math.sin(g.rotation.y * 2 + i) * 0.06; }); }; return g; }
  // the flying boot: shoe / boot (gold-trimmed, 1.8×) / homing (red seeker fin)
  function makeShoe(kind = 'shoe') {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.userData.body = body; const glowC = kind === 'homing' ? 0xff5a3a : kind === 'boot' ? 0xffd23a : 0x7dd3fc;
    M(new THREE.SphereGeometry(0.2, 16, 12), ink, 0, 0, 0.05, body, 0.025, 0.2).scale.set(1, 0.62, 1.35);
    M(new THREE.BoxGeometry(0.3, 0.06, 0.52), toon('#0f172a'), 0, -0.11, 0.05, body, 0.015);
    M(new THREE.BoxGeometry(0.32, 0.04, 0.2), lit(kind === 'homing' ? '#ff5a3a' : kind === 'boot' ? '#e6b45a' : '#7dd3fc'), 0, 0.02, -0.12, body, 0);
    for (const sx of [-1, 1]) { const r = M(new THREE.TorusGeometry(0.09, 0.02, 6, 16), kind === 'boot' ? gold : toon('#94a3b8'), sx * 0.22, 0.02, 0.05, body, 0); r.rotation.y = Math.PI / 2; }
    if (kind === 'boot') { M(new THREE.BoxGeometry(0.34, 0.05, 0.56), gold, 0, -0.15, 0.05, body, 0.01); for (const z of [-0.12, 0.08, 0.26]) M(new THREE.ConeGeometry(0.04, 0.1, 6), steel, 0, 0.12, z, body, 0.008); }
    if (kind === 'homing') { const f = M(new THREE.BoxGeometry(0.03, 0.16, 0.2), red, 0, 0.16, -0.06, body, 0.008); f.rotation.x = -0.3; M(new THREE.SphereGeometry(0.06, 10, 8), lit('#ff5a3a'), 0, 0.03, 0.34, body, 0.008, 0.06); }
    const g = glow(glowC, 0.9, body); g.material.opacity = 0.8; g.position.set(0, 0, -0.2);
    root.scale.setScalar(1.3 * (kind === 'boot' ? NOBLE_RANGED.boot.scale : 1)); return root;
  }
  function attach(noble) {
    const rig = noble.userData.rig, k = rig.k, W = new THREE.Group(); noble.add(W);
    const NW = { t: {}, dur: {}, hoverOn: false, hoverK: 0, spinA: 0, pose: { yaw: 0, tilt: 0, lift: 0 }, muzzles: [] };
    // wheel spikes (8 per wheel, in the wheel plane, roll with the wheel)
    const wheelG = [-1, 1].map(s => { const g = new THREE.Group(), sp = new THREE.Group(); g.add(sp); W.add(g); const cones = [];
      for (let n = 0; n < 8; n++) { const q = n / 8 * Math.PI * 2, c = M(new THREE.ConeGeometry(0.045, 0.16, 6), steel, 0, 0, 0, sp, 0.01); c.userData.q = q; c.rotation.x = q; cones.push(c); }
      return { s, g, sp, cones }; });
    // armrest rams: a sleeve on each armrest fin, the spike slides forward
    const rams = [-1, 1].map(s => { const g = new THREE.Group(); W.add(g); const sl = M(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 10), ink, 0, 0, 0, g, 0.01, 0.045); sl.rotation.x = Math.PI / 2;
      const sp = new THREE.Group(); g.add(sp); const c = M(new THREE.ConeGeometry(0.05, 0.3, 8), steel, 0, 0.15, 0, sp, 0.01); sp.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), steel, 0, -0.05, 0, sp, 0.008); return { s, g, sp }; });
    // audio horn: folds up out of the backrest
    const horn = new THREE.Group(); W.add(horn); { const st = M(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8), ink, 0, 0.11, 0, horn, 0.008); const bell = M(new THREE.CylinderGeometry(0.17, 0.04, 0.2, 18, 1, true), red, 0, 0.3, 0, horn, 0.012); bell.material.side = THREE.DoubleSide; M(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), gold, 0, 0.21, 0, horn, 0.006); NW.hornGlow = glow(0xffd23a, 0.8, horn); NW.hornGlow.position.y = 0.4; }
    // twin mini-rocket pods on the armrests: folded flat along the side, they swing up and point forward
    const pods = [-1, 1].map(s => { const piv = new THREE.Group(); W.add(piv); const p = new THREE.Group(); p.position.x = s * 0.07; piv.add(p);
      const tb = M(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 10), toon('#4d5a2a'), 0, 0, 0.08, p, 0.01, 0.05); tb.rotation.x = Math.PI / 2;
      const tip = M(new THREE.ConeGeometry(0.045, 0.1, 10), red, 0, 0, 0.27, p, 0.008); tip.rotation.x = Math.PI / 2; const mz = new THREE.Object3D(); mz.position.set(0, 0, 0.34); p.add(mz); NW.muzzles.push(mz); return { s, piv, p, tip }; });
    // hover jets: two blue thrusters under the seat
    const jets = [-1, 1].map(s => { const g = new THREE.Group(); W.add(g); const n = M(new THREE.CylinderGeometry(0.06, 0.08, 0.06, 12), ink, 0, 0, 0, g, 0.008, 0.08); const fl = glow(0x7dd3fc, 0.55, g); fl.position.y = -0.08; const cone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); cone.rotation.x = Math.PI; cone.position.y = -0.18; g.add(cone); return { g, fl, cone }; });
    // ground wave for the horn and the spin-out
    const wave = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); wave.rotation.x = -Math.PI / 2; wave.position.y = 0.03; W.add(wave);
    const ext = key => { const T = NW.t[key]; if (T == null) return 0; const d = NW.dur[key]; return cl(Math.min(T / 0.08, (d - T) / 0.14), 0, 1); };
    NW.play = (key, dur, o = {}) => { const d = dur ?? (NOBLE_MELEE[key] || NOBLE_HOLDS[key] || {}).dur ?? 0.5; NW.t[key] = 0; NW.dur[key] = d; if (key === 'horn' || key === 'spin') NW.wave = { t: 0, r: (o.radius || 3) / (noble.scale.x || 1), col: key === 'horn' ? 0xffd23a : 0xffffff }; };
    NW.busy = key => NW.t[key] != null;
    NW.hover = on => { NW.hoverOn = on === true ? 1 : on || 0; };   // 0..1 jet strength (rocket jump, hover, slow fall)
    NW.muzzleWorld = (i, out) => { noble.updateMatrixWorld(true); return NW.muzzles[i].getWorldPosition(out); };
    NW.update = (dt, speed = 0) => {
      const G = rig.geo, c = rig.cfg, bs = noble.scale.x || 1;
      for (const key of Object.keys(NW.t)) { NW.t[key] += dt; if (NW.t[key] > NW.dur[key]) delete NW.t[key]; }
      // place props on the current chair (the chair can be retuned live)
      const eS = Math.max(ext('spike'), ext('spin'));
      wheelG.forEach(w => { w.g.position.set(w.s * (G.wx + 0.075), G.Rw, G.wz); w.g.rotation.z = w.s * c.camber * Math.PI / 180; w.g.visible = eS > 0.01; w.sp.rotation.x += speed / bs * dt / G.Rw + (eS > 0 ? dt * 6 : 0);
        w.cones.forEach(cn => { const q = cn.userData.q, r = G.Rw - 0.1 + 0.15 * eS; cn.position.set(0, Math.cos(q) * r, Math.sin(q) * r); cn.scale.setScalar(Math.max(0.01, eS)); }); });
      const eR = ext('ram'), armY = G.seatY + 0.2 - 0.0, armZ = G.z1 - 0.06;
      rams.forEach(r => { r.g.position.set(r.s * (G.hw + 0.04), armY, armZ); r.sp.position.z = -0.08 + 0.3 * eR; r.sp.scale.setScalar(0.4 + 0.6 * eR); r.sp.visible = eR > 0.01; });
      const eH = ext('horn'); horn.position.set(0, G.seatY + c.back * k - 0.18 + 0.18 * eH, G.z0 - 0.08); horn.scale.setScalar(0.3 + 0.7 * eH); horn.visible = eH > 0.01; horn.children[1].scale.setScalar(1 + Math.sin((NW.t.horn || 0) * 60) * 0.06 * eH); NW.hornGlow.material.opacity = eH * 0.8;
      const eP = ext('rockets'); pods.forEach(p => { p.piv.position.set(p.s * (G.hw + 0.06), armY + 0.04 + 0.08 * eP, G.z0 + 0.12); p.piv.rotation.x = (1 - eP) * Math.PI / 2; p.piv.visible = eP > 0.01; p.piv.scale.setScalar(0.5 + 0.5 * eP); });
      NW.hoverK += ((+NW.hoverOn || 0) - NW.hoverK) * Math.min(1, dt * 10); const hk = NW.hoverK;
      jets.forEach((j, i) => { j.g.position.set((i ? 1 : -1) * G.hw * 0.6, Math.max(0.04, G.seatY - 0.22), (G.z0 + G.z1) / 2); j.g.visible = hk > 0.02; j.fl.material.opacity = hk * (0.7 + Math.random() * 0.3); j.cone.material.opacity = hk * 0.55; j.cone.scale.set(1, 0.8 + Math.random() * 0.4, 1); });
      if (NW.wave) { const w = NW.wave; w.t += dt; const u = w.t / 0.4; wave.visible = u < 1; wave.material.color.set(w.col); wave.scale.setScalar(0.3 + u * w.r); wave.material.opacity = Math.max(0, 0.9 * (1 - u)); if (u >= 1) NW.wave = null; } else wave.visible = false;
      // body pose
      const P = NW.pose; P.yaw = 0; P.tilt = 0; P.lift = 0;
      if (NW.t.spike != null) P.yaw = -(NW.t.spike / NW.dur.spike) * Math.PI * 2;
      if (NW.t.spin != null) { const u = NW.t.spin / NW.dur.spin; P.yaw = -u * Math.PI * 4; P.tilt = -0.38 * Math.sin(Math.min(1, u * 1.15) * Math.PI); }
      if (NW.t.ram != null) P.tilt = 0.09 * Math.sin(NW.t.ram / NW.dur.ram * Math.PI);
      if (NW.t.horn != null) P.lift = 0.04 * Math.abs(Math.sin(NW.t.horn * 40)) * eH;
      if (hk > 0.02) P.tilt += -0.06 * hk;
      return P;
    };
    NW.update(0, 0);
    return NW;
  }
  return { attach, makeShoe, makeStars, glowTex };
}
