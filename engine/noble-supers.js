// s701 NOBLE'S SUPERS (Ben): all built round his SHOEMERANG drones (engine/noble-shoes.js), some mixed with his chair weapons
// (engine/noble-weapons.js: spike wheel, rockets, hover), and one FINISHER where the chair + both shoes combine.
// Robots are hacked, not evil: hits knock them down, they get back up.
//   const SU = nobleSupers({ THREE, M, toon }, noble, shoes, nw, { targets: () => [...], kit })  → SU.play(k) · SU.tick(dt) · SU.busy()
//   targets: [{ g, hp, max, flash, down }] — makeTargets(scene) gives 5 training bots for the Character Workshop.
export const NOBLE_SUPERS = [
  { k: 'shoe', name: 'SHOEMERANG', tip: 'STARTER · one shoe out + back, circles him 3 times', cost: 15 },
  { k: 'double', name: 'DOUBLE DRONE', tip: 'both shoes out, crossing paths', cost: 30 },
  { k: 'ricochet', name: 'RICOCHET', tip: 'one shoe bounces robot to robot, 5 hits', cost: 35 },
  { k: 'tow', name: 'TOW LINE', tip: 'a shoe hooks the farthest robot + drags it in', cost: 35 },
  { k: 'orbit', name: 'ORBIT SHIELD', tip: 'both shoes circle him fast, block + hit close', cost: 40 },
  { k: 'homing', name: 'HOMING HUNT', tip: 'both shoes lock on to the toughest robot', cost: 45 },
  { k: 'drop', name: 'DROP KICK', tip: 'hover up, both shoes dive on one spot · shockwave', cost: 55 },
  { k: 'storm', name: 'SHOE STORM', tip: 'the shoes split into a swarm of drone-shoes', cost: 70 },
  { k: 'finale', name: 'FULL NOBLE', tip: 'FINISHER · spin-out, rockets, hover + both shoes', cost: 100 },
  /* s702 Ben: 3 CHAIR supers */
  { k: 'shock', name: 'SHOCK CHAIR', tip: 'the chair crackles with electricity · arcs zap every robot close by', cost: 50 },
  { k: 'rush', name: 'WHEEL RUSH', tip: 'spike wheels out · he charges straight through the robots + back', cost: 45 },
  { k: 'rain', name: 'ROCKET RAIN', tip: 'hover high, the launchers rain mini-rockets on every robot', cost: 60 }];
export function makeTargets({ THREE, M, toon }, scene, n = 5) {
  const T = [], steel = toon('#8a94a3'), dark = toon('#2a2f38'), eye = new THREE.MeshBasicMaterial({ color: 0xff3b2a });
  for (let i = 0; i < n; i++) { const a = Math.PI - 0.8 + i * 0.4, r = 3.6 + (i % 2) * 1.2,   /* s701b the arc sits BEHIND Noble (camera side clear) */ g = new THREE.Group(); g.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); g.rotation.y = a + Math.PI; scene.add(g);
    const b = new THREE.Group(); g.add(b); M(new THREE.CylinderGeometry(0.42, 0.5, 0.12, 18), dark, 0, 0.06, 0, b, 0.015);
    M(new THREE.CapsuleGeometry(0.3, 0.7, 4, 12), steel, 0, 0.75, 0, b, 0.02); const h = M(new THREE.BoxGeometry(0.42, 0.32, 0.36), steel, 0, 1.42, 0, b, 0.02);
    M(new THREE.BoxGeometry(0.3, 0.06, 0.02), eye, 0, 1.44, 0.19, b, 0); g.userData.body = b;
    T.push({ g, b, hp: 3, max: 3, flash: 0, down: 0, home: g.position.clone(), kx: 0, kz: 0, mats: [] }); }
  T.tick = dt => { for (const t of T) { t.flash = Math.max(0, t.flash - dt); t.b.scale.setScalar(t.flash > 0 ? 1.12 : 1);
      if (t.down > 0) { t.down -= dt; t.b.rotation.x = Math.min(1.5, t.b.rotation.x + dt * 6); if (t.down <= 0) { t.hp = t.max; } } else t.b.rotation.x = Math.max(0, t.b.rotation.x - dt * 3);
      if (t.kx || t.kz) { t.g.position.x += t.kx * dt; t.g.position.z += t.kz * dt; t.kx *= Math.pow(0.02, dt); t.kz *= Math.pow(0.02, dt); if (Math.abs(t.kx) + Math.abs(t.kz) < 0.05) t.kx = t.kz = 0; }
      if (!t.drag && !t.kx && !t.kz && t.down <= 0) t.g.position.lerp(t.home, Math.min(1, dt * 0.8)); } };
  T.dispose = () => T.forEach(t => scene.remove(t.g)); return T;
}
export function nobleSupers({ THREE, M, toon }, noble, shoes, nw, o = {}) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ss = k => k * k * (3 - 2 * k), cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const scene = () => { let q = noble; while (q.parent) q = q.parent; return q; }, tgts = () => (o.targets ? o.targets() : []).filter(t => t.down <= 0);
  let glowTex = null; const gT = () => { if (glowTex) return glowTex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, 'rgba(255,220,140,0.8)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return glowTex = new THREE.CanvasTexture(c); };
  const fx = []; const pop = (p, col = 0xffd23a, s = 1.6) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: gT(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.position.copy(p); m.scale.setScalar(0.2); scene().add(m); fx.push({ m, t: 0, d: 0.35, s }); };
  const ring = (p, col = 0xffd23a, r = 3) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.copy(p).setY(p.y + 0.05); scene().add(m); fx.push({ m, t: 0, d: 0.5, s: r, ring: true }); };
  const C = () => noble.getWorldPosition(V()), FWD = () => V(0, 0, 1).applyQuaternion(noble.getWorldQuaternion(new THREE.Quaternion())).setY(0).normalize(), RT = () => { const f = FWD(); return V(-f.z, 0, f.x); };
  const tp = (t, y = 1.1) => t.g.position.clone().setY(y);
  const hit = (t, dmg = 1, from = C()) => { if (!t || t.down > 0) return; t.hp -= dmg; t.flash = 0.18; const d = t.g.position.clone().sub(from).setY(0).normalize().multiplyScalar(4); t.kx = d.x; t.kz = d.z; pop(tp(t), 0xffd23a, 1.4); if (t.hp <= 0) t.down = 2.2; o.sfx && o.sfx('laserHit'); };
  const near = (p, ex = []) => tgts().filter(t => !ex.includes(t)).sort((a, b) => a.g.position.distanceTo(p) - b.g.position.distanceTo(p))[0];
  const HV = v => o.hover ? o.hover(v) : nw && nw.hover && nw.hover(v);
  let A = null; const minis = [];
  const PLAY = {
    shoe: () => { shoes.throw(0); return { t: 0, upd: (s, dt) => { const d = shoes.drones[0]; if (d.st === 'out' || d.st === 'back' || d.st === 'orbit') { for (const t of tgts()) if (t.g.position.distanceTo(d.d.position.clone().setY(0)) < 1.1 && !(s.hitT && s.hitT.has(t))) { (s.hitT = s.hitT || new Set()).add(t); hit(t); } } return s.t > 0.5 && d.st === 'dock'; } }; },
    double: () => { const a = shoes.grab(0), b = shoes.grab(1); if (!a || !b) return null; const c0 = C(), f = FWD(), r = RT(); return { t: 0, hit: new Set(), upd: (s) => { const q = cl(s.t / 1.8), R = 6;
        [a, b].forEach((d, i) => { const sd = i ? 1 : -1; d.position.copy(c0).addScaledVector(f, R * Math.sin(Math.PI * q)).addScaledVector(r, sd * 2.6 * Math.sin(2 * Math.PI * q)).setY(c0.y + 1 + 0.3 * Math.sin(4 * Math.PI * q)); for (const t of tgts()) if (!s.hit.has(t.g.id + ':' + i) && t.g.position.distanceTo(d.position.clone().setY(0)) < 1.2) { s.hit.add(t.g.id + ':' + i); hit(t); } });
        if (q >= 1) { shoes.release(0); shoes.release(1); return true; } } }; },
    ricochet: () => { const d = shoes.grab(0); if (!d) return null; return { t: 0, n: 0, from: d.position.clone(), seen: [], upd: (s) => { if (!s.to) { const t = near(s.from, s.seen) || near(s.from); if (!t || s.n >= 5) { shoes.release(0); return true; } s.to = t; s.k = 0; }
        s.k += 1 / 60 / 0.28; const k = cl(s.k), p = s.from.clone().lerp(tp(s.to), ss(k)); p.y += Math.sin(Math.PI * k) * 0.8; d.position.copy(p);
        if (k >= 1) { hit(s.to, 1, s.from); s.seen.push(s.to); if (s.seen.length >= tgts().length) s.seen = [s.to]; s.from = d.position.clone(); s.to = null; s.n++; } } }; },
    tow: () => { const d = shoes.grab(0); if (!d) return null; const far = tgts().sort((a, b) => b.g.position.distanceTo(C()) - a.g.position.distanceTo(C()))[0]; if (!far) { shoes.release(0); return null; }
      const line = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffd23a })); line.visible = false; scene().add(line); const p0 = d.position.clone();
      return { t: 0, upd: (s) => { const c = C(); if (s.t < 0.5) d.position.copy(p0.clone().lerp(tp(far), ss(s.t / 0.5))); else if (s.t < 1.4) { far.drag = true; const k = ss((s.t - 0.5) / 0.9), end = c.clone().addScaledVector(FWD(), 1.6); far.g.position.copy(far.home.clone().lerp(end.setY(0), k)); d.position.copy(tp(far)); }
        else if (!s.smack) { s.smack = true; far.drag = false; hit(far, 2, c); ring(far.g.position.clone(), 0xffd23a, 2); }
        line.visible = s.t < 1.45; if (line.visible) { const a = noble.localToWorld(V(0, 0.9, 0.3)), b = d.position, m = a.clone().add(b).multiplyScalar(0.5), L = a.distanceTo(b); line.position.copy(m); line.scale.set(1, L, 1); line.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); }
        if (s.t > 1.6) { scene().remove(line); shoes.release(0); return true; } } }; },
    orbit: () => { const a = shoes.grab(0), b = shoes.grab(1); if (!a || !b) return null; return { t: 0, cd: new Map(), upd: (s) => { const c = C(), dur = 3.2, ang = s.t * 9;
        [a, b].forEach((d, i) => { const q = ang + i * Math.PI; d.position.set(c.x + Math.sin(q) * 1.4, c.y + 0.9 + i * 0.35, c.z + Math.cos(q) * 1.4); });
        for (const t of tgts()) { if (t.g.position.distanceTo(c.clone().setY(0)) < 2.6 && (s.cd.get(t) || 0) < s.t) { s.cd.set(t, s.t + 0.5); hit(t, 1, c); } }
        if (s.t > dur) { shoes.release(0); shoes.release(1); return true; } } }; },
    homing: () => { const a = shoes.grab(0), b = shoes.grab(1); if (!a || !b) return null; const tg = tgts().sort((x, y) => y.hp - x.hp || y.g.position.distanceTo(C()) - x.g.position.distanceTo(C()))[0]; if (!tg) { shoes.release(0); shoes.release(1); return null; }
      const v = [V(-3, 4, 1), V(3, 4, 1)].map(q => q.applyQuaternion(noble.getWorldQuaternion(new THREE.Quaternion())));
      return { t: 0, done: [false, false], upd: (s, dt) => { [a, b].forEach((d, i) => { if (s.done[i]) return; const to = tp(tg).sub(d.position), L = to.length(); v[i].lerp(to.normalize().multiplyScalar(12), Math.min(1, dt * 2.8)); d.position.addScaledVector(v[i], dt);
          if (L < 0.5 || s.t > 2.2) { s.done[i] = true; hit(tg, 2); shoes.release(i); } }); return s.done[0] && s.done[1]; } }; },
    drop: () => { const a = shoes.grab(0), b = shoes.grab(1); if (!a || !b) return null; const spot = (near(C()) || { g: { position: C().addScaledVector(FWD(), 4) } }).g.position.clone().setY(0); HV(1);
      const p = [a.position.clone(), b.position.clone()]; return { t: 0, upd: (s) => { [a, b].forEach((d, i) => { const sd = i ? 1 : -1, hi = spot.clone().add(RT().multiplyScalar(sd * 0.5)).setY(7);
          if (s.t < 0.7) d.position.copy(p[i].clone().lerp(C().setY(6.5).add(RT().multiplyScalar(sd)), ss(s.t / 0.7))); else if (s.t < 1.0) d.position.copy(C().setY(6.5).add(RT().multiplyScalar(sd)).lerp(hi, ss((s.t - 0.7) / 0.3))); else d.position.copy(hi.clone().lerp(spot.clone().add(RT().multiplyScalar(sd * 0.25)).setY(0.3), cl((s.t - 1.0) / 0.22) ** 2)); });
        if (s.t > 1.22 && !s.boom) { s.boom = true; ring(spot, 0xffd23a, 4); ring(spot, 0xffffff, 2.4); pop(spot.clone().setY(0.4), 0xffd23a, 3); for (const t of tgts()) if (t.g.position.distanceTo(spot) < 3) hit(t, 2, spot); o.sfx && o.sfx('stompHeavy'); }
        if (s.t > 1.6) { HV(0); shoes.release(0); shoes.release(1); return true; } } }; },
    storm: () => { const a = shoes.grab(0), b = shoes.grab(1); if (!a || !b || !o.kit) return null; const c0 = C(), up = c0.clone().setY(2.6);
      return { t: 0, upd: (s) => { [a, b].forEach((d, i) => { const q = s.t * 6 + i * Math.PI; d.position.copy(up).add(V(Math.sin(q) * 0.6, Math.sin(s.t * 3) * 0.2, Math.cos(q) * 0.6)); });
        if (s.t > 0.4 && !s.spawned) { s.spawned = true; const T = tgts(); for (let i = 0; i < 12; i++) { const m = o.kit.makeDrone(); m.scale.setScalar(0.5); scene().add(m); m.position.copy(up); minis.push({ m, t: -i * 0.07, tg: T[i % Math.max(1, T.length)], a: Math.random() * 6.28, from: up.clone() }); } }
        if (s.t > 2.6) { shoes.release(0); shoes.release(1); return true; } } }; },
    finale: () => { const a = shoes.grab(0), b = shoes.grab(1); if (!a || !b) return null; nw && nw.play && nw.play('spin'); const T = tgts();
      return { t: 0, i: 0, upd: (s) => { const c = C(); if (s.t > 0.8 && !s.rk) { s.rk = true; nw && nw.play && nw.play('rockets'); for (const t of T) setTimeout(() => hit(t, 1, c), 300 + Math.random() * 500); }
        if (s.t > 1.2) HV(1);
        [a, b].forEach((d, i) => { if (s.t < 1.6) { const q = s.t * 10 + i * Math.PI; d.position.set(c.x + Math.sin(q) * 1.6, c.y + 1.2, c.z + Math.cos(q) * 1.6); }
          else { const k = (s.t - 1.6) / 0.35, j = Math.floor(k) * 2 + i, t = T[j % Math.max(1, T.length)]; if (!t) return; const f = k - Math.floor(k), hi = tp(t, 5); d.position.copy(f < 0.5 ? c.clone().setY(4).lerp(hi, ss(f * 2)) : hi.lerp(tp(t, 0.4), (f * 2 - 1) ** 2)); if (f > 0.92 && s.last !== j) { s.last = j; hit(t, 2, c); ring(t.g.position.clone(), 0xffd23a, 2.4); } } });
        if (s.t > 3.6 && !s.big) { s.big = true; ring(c.clone().setY(0), 0xffffff, 6); ring(c.clone().setY(0), 0xffd23a, 4.5); for (const t of tgts()) hit(t, 3, c); }
        if (s.t > 3.9) { HV(0); shoes.release(0); shoes.release(1); return true; } } }; },
    shock: () => { const bolts = [], mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, depthWrite: false }), core = new THREE.MeshBasicMaterial({ color: 0xfffbe0 });   /* s702 an ELECTRIC CHAIR discharge: a crackling aura, then arcs jump to every robot in reach */
      const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: gT(), color: 0x7dd3fc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene().add(aura);
      const zig = (a, b) => { const pts = [a.clone()]; for (let i = 1; i < 7; i++) { const p = a.clone().lerp(b, i / 7); p.x += (Math.random() - 0.5) * 0.5; p.y += (Math.random() - 0.5) * 0.5; p.z += (Math.random() - 0.5) * 0.5; pts.push(p); } pts.push(b.clone()); const cv = new THREE.CatmullRomCurve3(pts), g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 16, 0.08, 5), mat), new THREE.Mesh(new THREE.TubeGeometry(cv, 16, 0.03, 4), core)); return g; };   /* thick blue glow + a white-hot core: reads on light floors */
      return { t: 0, z: 0, cd: new Map(), upd: (s, dt) => { const c = C().setY(1.0); aura.position.copy(c); aura.scale.setScalar(2.4 + Math.random() * 0.8); aura.material.opacity = s.t < 2.6 ? 0.55 + Math.random() * 0.35 : Math.max(0, 1 - (s.t - 2.6) * 3);
        noble.position.x = (Math.random() - 0.5) * 0.04 * (s.t < 2.6 ? 1 : 0); for (const b of bolts) scene().remove(b); bolts.length = 0;
        if (s.t < 2.6) { for (let i = 0; i < 3; i++) { const a2 = Math.random() * 6.28, e = c.clone().add(V(Math.cos(a2) * 1.1, (Math.random() - 0.3) * 1.2, Math.sin(a2) * 1.1)); const m = zig(c, e); scene().add(m); bolts.push(m); }
          if (s.t > 0.5) for (const t of tgts()) if (t.g.position.distanceTo(c.clone().setY(0)) < 6) { const m = zig(c, tp(t)); scene().add(m); bolts.push(m); if ((s.cd.get(t) || 0) < s.t) { s.cd.set(t, s.t + 0.6); t.flash = 0.3; hit(t, 1, c); pop(tp(t), 0x7dd3fc, 1.8); } } }
        if (s.t > 3.0) { for (const b of bolts) scene().remove(b); scene().remove(aura); noble.position.x = 0; return true; } } }; },
    rush: () => { nw && nw.play && nw.play('spike', 2.2); const c0 = C(), tg = tgts(), cen = tg.length ? tg.reduce((a, t) => a.add(t.g.position), V()).multiplyScalar(1 / tg.length) : c0.clone().addScaledVector(FWD(), 5), f = cen.clone().sub(c0).setY(0).normalize(), far = Math.min(4.6, tg.length ? Math.max(...tg.map(t => t.g.position.clone().sub(c0).dot(f))) + 0.4 : 4.6); noble.userData.faceYaw = Math.atan2(f.x, f.z);   /* s702 spike wheels out, a straight charge through the robots + roll back */
      return { t: 0, hitT: new Set(), upd: (s) => { const go = s.t < 0.9 ? ss(s.t / 0.9) : s.t < 1.3 ? 1 : 1 - ss((s.t - 1.3) / 0.9), p = c0.clone().addScaledVector(f, far * go); noble.position.x = p.x; noble.position.z = p.z;
        for (const t of tgts()) if (!s.hitT.has(t) && t.g.position.distanceTo(p.clone().setY(0)) < 1.4) { s.hitT.add(t); hit(t, 2, p); } if (s.t > 1.25 && !s.mid) { s.mid = true; s.hitT.clear(); ring(p.clone().setY(0), 0xffffff, 2.5); }
        if (s.t > 2.2) { noble.position.x = c0.x; noble.position.z = c0.z; noble.userData.faceYaw = 0; return true; } } }; },
    rain: () => { HV(1); nw && nw.play && nw.play('rockets', 2.0); const rk = []; const rm = new THREE.MeshBasicMaterial({ color: 0xff5a2a });   /* s702 hover high, the armrest launchers rain mini-rockets */
      return { t: 0, n: 0, upd: (s, dt) => { const c = C(); if (s.t > 0.6 && s.t < 2.4 && s.t > 0.6 + s.n * 0.12) { s.n++; const T = tgts(), t = T[s.n % Math.max(1, T.length)]; if (t) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 6), rm); m.position.copy(c.clone().setY(c.y + 1.6 + (s.liftY || 0))); scene().add(m); rk.push({ m, t: 0, from: m.position.clone(), tg: t }); } }
        for (let i = rk.length - 1; i >= 0; i--) { const r = rk[i]; r.t += dt / 0.55; const to = tp(r.tg, 0.6), p = r.from.clone().lerp(to, r.t); p.y += Math.sin(Math.PI * Math.min(1, r.t)) * 2.2; r.m.lookAt(p.clone().add(to.clone().sub(r.m.position))); r.m.rotateX(Math.PI / 2); r.m.position.copy(p); pop(p, 0xff8a3d, 0.25);
          if (r.t >= 1) { hit(r.tg, 1, c); ring(r.tg.g.position.clone(), 0xff8a3d, 1.6); scene().remove(r.m); rk.splice(i, 1); } }
        if (s.t > 2.9 && !rk.length) { HV(0); return true; } } }; } };
  function tick(dt) {
    if (A) { A.t += dt; if (A.upd(A, dt)) A = null; }
    for (let i = minis.length - 1; i >= 0; i--) { const q = minis[i]; q.t += dt; if (q.t < 0) continue; q.m.rotation.y += dt * 20; const k = cl(q.t / 0.7), to = q.tg ? tp(q.tg) : q.from.clone().add(V(Math.sin(q.a) * 4, 0, Math.cos(q.a) * 4));
      const p = q.from.clone().lerp(to, ss(k)); p.x += Math.sin(q.a) * Math.sin(Math.PI * k) * 1.6; p.z += Math.cos(q.a) * Math.sin(Math.PI * k) * 1.6; p.y += Math.sin(Math.PI * k) * 1.2; q.m.position.copy(p);
      if (k >= 1 && !q.hit) { q.hit = true; if (q.tg) hit(q.tg, 1); pop(p, 0x7dd3fc, 1); } if (q.t > 0.9) { q.m.parent && q.m.parent.remove(q.m); minis.splice(i, 1); } }
    for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; const k = f.t / f.d; if (f.ring) { f.m.scale.setScalar(0.3 + f.s * k); f.m.material.opacity = 1 - k; } else { f.m.scale.setScalar(0.2 + f.s * Math.sin(Math.PI * Math.min(1, k))); f.m.material.opacity = 1 - k; } if (k >= 1) { f.m.parent && f.m.parent.remove(f.m); fx.splice(i, 1); } }
  }
  return { play(k) { if (A || shoes.busy()) return false; const f = PLAY[k]; if (!f) return false; A = f(); return !!A; }, tick, busy: () => !!A || shoes.busy(), list: NOBLE_SUPERS };
}
