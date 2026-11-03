// s703 HOPE'S SUPERS (Ben: 12 for Hope; the first = a GUIDE ROBOT BIRD that helps her see + shoots). Hope is blind: her supers are built on
// HEARING (echo pulses, sound waves, cane taps you can see as rings) and her guide birds (the bird is her eyes). The robots are hacked, not evil:
// TRUE VOICE quiets the hack for a moment. Same contract as engine/noble-supers.js:
//   const SU = hopeSupers({ THREE, M, toon }, hope, { targets: () => [...], sfx }) → SU.play(k) · SU.tick(dt) · SU.busy()
export const HOPE_SUPERS = [
  { k: 'bird', name: 'GUIDE BIRD', tip: 'STARTER · her robot bird scouts, marks + shoots the robots', cost: 15 },
  { k: 'vault', name: 'CANE VAULT', tip: 'she vaults high on her cane + lands in a shockwave', cost: 20 },
  { k: 'echo', name: 'ECHO PULSE', tip: 'a cane tap rings out · every robot is marked + stunned', cost: 25 },
  { k: 'sweep', name: 'CANE SWEEP', tip: 'a full circle cane arc knocks back anything close', cost: 25 },
  { k: 'wave', name: 'SOUND WAVE', tip: 'a forward blast of sound rings', cost: 35 },
  { k: 'mines', name: 'ECHO MINES', tip: 'she taps 5 glowing spots · they burst under the robots', cost: 35 },
  { k: 'seismic', name: 'SEISMIC TAP', tip: 'cane to the floor · cracks race to every robot + pop them up', cost: 40 },
  { k: 'wing', name: 'WING SHIELD', tip: 'the bird circles her fast · blocks + zaps close robots', cost: 40 },
  { k: 'flock', name: 'BIRD FLOCK', tip: '4 guide birds dive at the robots', cost: 50 },
  { k: 'beam', name: 'LIGHT BEAM', tip: 'the bird hovers + sweeps a beam across the robots', cost: 55 },
  { k: 'voice', name: 'TRUE VOICE', tip: 'she hears the real robot under the hack · all stop, the hack flickers', cost: 70 },
  { k: 'finale', name: 'SEE IT ALL', tip: 'FINISHER · echo pulse, the flock, a cane vault slam', cost: 100 }];
export function hopeSupers({ THREE, M, toon }, hope, o = {}) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ss = k => k * k * (3 - 2 * k), cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const scene = () => { let q = hope; while (q.parent) q = q.parent; return q; }, tgts = () => (o.targets ? o.targets() : []).filter(t => t.down <= 0);
  const C = () => hope.getWorldPosition(V()), FWD = () => V(0, 0, 1).applyQuaternion(hope.getWorldQuaternion(new THREE.Quaternion())).setY(0).normalize(), tp = (t, y = 1.1) => t.g.position.clone().setY(y);
  let gtx = null; const gT = () => { if (gtx) return gtx; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, 'rgba(200,240,255,0.8)'); gr.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return gtx = new THREE.CanvasTexture(c); };
  const fx = [], add = m => { scene().add(m); return m; }, del = m => m && m.parent && m.parent.remove(m);
  const pop = (p, col = 0x7dd3fc, s = 1.4) => { const m = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: gT(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); m.position.copy(p); fx.push({ m, t: 0, d: 0.35, s }); };
  const ring = (p, col = 0x7dd3fc, r = 3, d = 0.6, flat = true) => { const m = add(new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 56), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false }))); if (flat) m.rotation.x = -Math.PI / 2; m.position.copy(p).setY(flat ? p.y + 0.06 : p.y); fx.push({ m, t: 0, d, s: r, ring: true }); return m; };
  const mark = t => { const m = add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 28), new THREE.MeshBasicMaterial({ color: 0xffd23a }))); m.rotation.x = -Math.PI / 2; m.position.copy(t.g.position).setY(2.0); fx.push({ m, t: 0, d: 1.6, s: 0, mark: true }); };
  const hit = (t, dmg = 1, from = C(), stun = 0) => { if (!t || t.down > 0) return; t.hp -= dmg; t.flash = 0.2; const d = t.g.position.clone().sub(from).setY(0).normalize().multiplyScalar(dmg ? 3.5 : 0); t.kx = d.x; t.kz = d.z; if (stun) t.stun = stun; pop(tp(t), 0x7dd3fc, 1.3); if (t.hp <= 0) t.down = 2.2; o.sfx && o.sfx('laserHit'); };
  const near = (p, ex = []) => tgts().filter(t => !ex.includes(t)).sort((a, b) => a.g.position.distanceTo(p) - b.g.position.distanceTo(p))[0];
  // the GUIDE BIRD: a small white robot bird, blue wings with a glowing edge, a gold beak, one bright lens eye
  function makeBird(s = 1) { const g = new THREE.Group(), wh = toon('#f3f2f2'), bl = toon('#38bdf8', { emissive: new THREE.Color('#0ea5e9'), emissiveIntensity: 0.4 }), go = toon('#e6b45a');
    const body = M(new THREE.SphereGeometry(0.16, 14, 10), wh, 0, 0, 0, g, 0.012, 0.16); body.scale.set(0.85, 0.8, 1.25); M(new THREE.SphereGeometry(0.1, 12, 8), wh, 0, 0.1, 0.13, g, 0.01, 0.1);
    const bk = M(new THREE.ConeGeometry(0.035, 0.1, 6), go, 0, 0.09, 0.26, g, 0.006); bk.rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0x7df9ff }), 0, 0.13, 0.21, g, 0);
    const tail = M(new THREE.BoxGeometry(0.1, 0.02, 0.14), bl, 0, 0.02, -0.22, g, 0.006); tail.rotation.x = 0.3;
    const W = [-1, 1].map(sd => { const p = new THREE.Group(); p.position.set(sd * 0.12, 0.04, 0); g.add(p); const w = M(new THREE.BoxGeometry(0.32, 0.02, 0.14), bl, sd * 0.16, 0, 0, p, 0.006); M(new THREE.BoxGeometry(0.3, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: 0x7df9ff }), sd * 0.16, 0.012, -0.07, p, 0); return p; });
    g.scale.setScalar(s); g.userData.flap = t => { W.forEach((p, i) => { p.rotation.z = (i ? -1 : 1) * Math.sin(t * 22) * 0.6; }); }; return g; }
  const birds = [], bolts = [];
  const bird = (p, s = 1) => { const b = add(makeBird(s * 1.9));   /* s703 big enough to read at the wide shot */ b.position.copy(p); birds.push(b); return b; };
  const shoot = (from, t) => { const m = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.22, 3, 6), new THREE.MeshBasicMaterial({ color: 0x7df9ff }))); m.position.copy(from); bolts.push({ m, from: from.clone(), t: 0, tg: t }); };
  const shoulder = () => hope.localToWorld(V(0.3, 1.75, 0));
  const flyTo = (b, p, k) => { const d = p.clone().sub(b.position); b.position.addScaledVector(d, Math.min(1, k)); if (d.lengthSq() > 1e-4) b.lookAt(b.position.clone().add(d.setY(0))); };
  /* s704 THE CANE TAP (Ben: make it big): she lifts the cane high, SLAMS the tip down; her body dips, a white flash + spark burst + dust ring at the tip.
     Runs after the cane rig has posed the cane this frame, so the offsets never pile up. */
  const rig = () => hope.userData.rig, taps = [];
  const tipW = () => { const r = rig(); if (r && r.tipW && r.tipW.lengthSq() > 0) return r.tipW.clone().setY(0.05); return hope.localToWorld(V(-0.35, 0.05, 0.55)); };
  const tap = (cb, big = 1) => taps.push({ t: 0, cb, big, hit: false });
  const spark = (p, n = 10, col = 0xffffff) => { for (let i = 0; i < n; i++) { const m = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: gT(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); m.position.copy(p); m.scale.setScalar(0.18); const a = Math.random() * 6.28, sp = 2 + Math.random() * 3; fx.push({ m, t: 0, d: 0.45, s: 0.1, v: V(Math.cos(a) * sp, 2 + Math.random() * 3, Math.sin(a) * sp) }); } };
  function tapTick(dt) { const r = rig(), cane = r && r.cane, P = hope.userData.P;
    for (let i = taps.length - 1; i >= 0; i--) { const q = taps[i]; q.t += dt; const up = q.t < 0.28 ? ss(q.t / 0.28) : q.t < 0.36 ? 1 - ((q.t - 0.28) / 0.08) ** 2 : 0, dip = q.t > 0.34 && q.t < 0.6 ? Math.sin(Math.PI * (q.t - 0.34) / 0.26) : 0;
      if (cane) { cane.position.y += up * 0.45 * q.big - dip * 0.04; cane.rotation.x += -up * 0.55; cane.rotation.z += up * 0.25; }
      if (r && r.arm) r.arm.rotation.x += -up * 0.9 * q.big; if (P && P.body) { P.body.position.y -= dip * 0.07 * q.big; P.body.rotation.x += dip * 0.12; } if (P && P.head) P.head.rotation.x += dip * 0.25;
      if (!q.hit && q.t >= 0.36) { q.hit = true; const p = tipW(); pop(p.clone().setY(0.25), 0xffffff, 1.8 * q.big); ring(p, 0xffffff, 1.4 * q.big, 0.35); spark(p, 10 * q.big); o.sfx && o.sfx('stompHeavy', { v: 0.6 * q.big, p: 1.4 }); q.cb && q.cb(p); }
      if (q.t > 0.65) taps.splice(i, 1); } }
  let A = null;
  const PLAY = {
    bird: () => { const b = bird(shoulder(), 1.3); return { t: 0, n: 0, upd: (s, dt) => { const c = C(), T = tgts();   /* rises off her shoulder, circles, marks every robot, 6 shots, lands back */
        if (s.t < 0.5) flyTo(b, c.clone().setY(3.2), dt * 4); else if (s.t < 3.4) { const a = s.t * 2.2; flyTo(b, c.clone().add(V(Math.sin(a) * 3.2, 2.9, Math.cos(a) * 3.2)), dt * 6);
          if (!s.marked && s.t > 0.7) { s.marked = true; T.forEach(mark); } if (s.t > 1.0 + s.n * 0.35 && s.n < 6 && T.length) { const t = T[s.n % T.length]; s.n++; shoot(b.position.clone(), t); } }
        else { flyTo(b, shoulder(), dt * 6); if (s.t > 4.0) { del(b); birds.splice(birds.indexOf(b), 1); return true; } } } }; },
    echo: () => { tap(p => { for (let i = 0; i < 4; i++) setTimeout(() => ring(p, i % 2 ? 0xffffff : 0x7dd3fc, 10, 1.2), i * 170); }, 1.3);   /* s704 a BIG cane tap; the sound rolls out as rings from the tip */
      return { t: 0, upd: (s) => { if (s.t > 0.9 && !s.d) { s.d = true; for (const t of tgts()) { mark(t); hit(t, 0, C(), 2); t.flash = 0.6; } } return s.t > 1.9; } }; },
    sweep: () => { const r0 = rig(); r0 && r0.strike && r0.strike(); spark(tipW(), 6); const c = C(), arc = add(new THREE.Mesh(new THREE.RingGeometry(1.6, 2.4, 48, 1, 0, 0.1), new THREE.MeshBasicMaterial({ color: 0xf3f2f2, transparent: true, side: THREE.DoubleSide, depthWrite: false }))); arc.rotation.x = -Math.PI / 2; arc.position.copy(c).setY(0.25);
      return { t: 0, hitT: new Set(), upd: (s) => { const k = cl(s.t / 0.5), th = k * Math.PI * 2; arc.geometry.dispose(); arc.geometry = new THREE.RingGeometry(0.6, 2.8, 48, 1, 0, Math.max(0.05, th)); arc.material.opacity = 1 - cl((s.t - 0.5) / 0.3);
        for (const t of tgts()) { const d = t.g.position.clone().sub(c); if (!s.hitT.has(t) && d.length() < 3.4) { const a = (Math.atan2(-d.z, d.x) + Math.PI * 2) % (Math.PI * 2); if (a < th) { s.hitT.add(t); hit(t, 1, c); } } }
        if (s.t > 0.8) { del(arc); return true; } } }; },
    wave: () => { const c = C(), f = FWD(); return { t: 0, n: 0, hitT: new Set(), upd: (s) => { if (s.t > s.n * 0.12 && s.n < 6) { const m = ring(c.clone().addScaledVector(f, 0.8).setY(1.1), 0x7dd3fc, 2.2, 0.8, false); m.lookAt(m.position.clone().add(f)); m.userData.v = f.clone().multiplyScalar(9); s.n++; }
        for (const q of fx) if (q.m.userData.v) q.m.position.addScaledVector(q.m.userData.v, 1 / 60);
        for (const t of tgts()) { const d = t.g.position.clone().sub(c), al = d.dot(f); if (!s.hitT.has(t) && al > 0 && al < s.t * 9 && d.clone().addScaledVector(f, -al).length() < 1.6 + al * 0.3) { s.hitT.add(t); hit(t, 2, c); } } return s.t > 1.2; } }; },
    mines: () => { const T = tgts(), spots = T.slice(0, 5).map(t => t.g.position.clone()); while (spots.length < 5) spots.push(C().add(V((Math.random() - 0.5) * 6, 0, 2 + Math.random() * 3)));
      const glows = spots.map(p => { const m = add(new THREE.Mesh(new THREE.CircleGeometry(0.6, 28), new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.0, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.position.copy(p).setY(0.05); return m; });
      return { t: 0, upd: (s) => { glows.forEach((m, i) => { const on = s.t - i * 0.34; m.material.opacity = on > 0 ? 0.5 + 0.4 * Math.sin(s.t * 18) : 0; if (on > 0 && !m.userData.tap) { m.userData.tap = true; tap(null, 0.7); ring(m.position, 0xffffff, 1.4, 0.35); spark(m.position, 5, 0x7df9ff); } });
        if (s.t > 2.3 && !s.boom) { s.boom = true; spots.forEach((p, i) => setTimeout(() => { ring(p, 0x7df9ff, 3, 0.5); pop(p.clone().setY(0.6), 0x7df9ff, 2.2); for (const t of tgts()) if (t.g.position.distanceTo(p) < 1.8) hit(t, 2, p); }, i * 120)); }
        if (s.t > 3.1) { glows.forEach(del); return true; } } }; },
    seismic: () => { let go = 0; tap(() => { go = 1; }, 1.5); const c = C().setY(0.04), T = tgts(), cracks = T.map(t => { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1), new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, depthWrite: false }))); m.rotation.x = -Math.PI / 2; return { m, t }; }); ring(c, 0xffffff, 2, 0.4);
      return { t: 0, upd: (s) => { if (!go) { s.t = 0; return false; } cracks.forEach(q => { const e = q.t.g.position.clone().setY(0.04), k = cl(s.t / 0.5), p = c.clone().lerp(e, k), L = c.distanceTo(p); q.m.position.copy(c.clone().add(p).multiplyScalar(0.5)); q.m.scale.set(2.2, Math.max(0.01, L), 1); q.m.rotation.z = -Math.atan2(e.x - c.x, e.z - c.z) + Math.PI; q.m.material.opacity = 1 - cl((s.t - 0.8) / 0.4);
          if (k >= 1 && !q.d) { q.d = true; hit(q.t, 2, c); q.t.kx = q.t.kz = 0; ring(e, 0x7df9ff, 1.8, 0.4); q.t.b.position.y = 0.8; } q.t.b.position.y = Math.max(0, q.t.b.position.y - 1 / 60 * 3); }); if (s.t > 1.3) { cracks.forEach(q => { del(q.m); q.t.b.position.y = 0; }); return true; } } }; },
    wing: () => { const b = bird(shoulder(), 1.2), dome = add(new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 14), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.14, depthWrite: false })));
      return { t: 0, cd: new Map(), upd: (s, dt) => { const c = C(), a = s.t * 11; b.position.set(c.x + Math.sin(a) * 1.5, c.y + 1.1 + Math.sin(a * 2) * 0.2, c.z + Math.cos(a) * 1.5); b.lookAt(c.x + Math.sin(a + 0.3) * 1.5, b.position.y, c.z + Math.cos(a + 0.3) * 1.5); dome.position.copy(c).setY(c.y + 1);
        for (const t of tgts()) if (t.g.position.distanceTo(c.clone().setY(0)) < 2.8 && (s.cd.get(t) || 0) < s.t) { s.cd.set(t, s.t + 0.5); hit(t, 1, c); } if (s.t > 3.2) { del(b); birds.splice(birds.indexOf(b), 1); del(dome); return true; } } }; },
    flock: () => { const c = C(), T = tgts(), F = [0, 1, 2, 3].map(i => bird(c.clone().add(V((i - 1.5) * 0.6, 3.4, -0.5)), 1.1));
      return { t: 0, upd: (s, dt) => { F.forEach((b, i) => { const t = T[i % Math.max(1, T.length)], st = s.t - i * 0.18; if (!t || st < 0) return; if (st < 0.5) flyTo(b, C().add(V((i - 1.5) * 1.4, 4, 0)), dt * 5); else if (st < 0.9) { const k = (st - 0.5) / 0.4; b.position.lerpVectors(C().add(V((i - 1.5) * 1.4, 4, 0)), tp(t), k * k); b.lookAt(tp(t)); if (k > 0.95 && !b.userData.h) { b.userData.h = 1; hit(t, 2); ring(t.g.position.clone(), 0x7dd3fc, 1.6, 0.4); } } else flyTo(b, C().add(V((i - 1.5) * 2, 6, -3)), dt * 3); });
        if (s.t > 2.2) { F.forEach(b => { del(b); birds.splice(birds.indexOf(b), 1); }); return true; } } }; },
    beam: () => { const b = bird(shoulder(), 1.4), bm = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }))); bm.visible = false;
      const T = tgts().sort((a, c) => Math.atan2(a.g.position.x, a.g.position.z) - Math.atan2(c.g.position.x, c.g.position.z));
      return { t: 0, cd: new Map(), upd: (s, dt) => { const c = C(); flyTo(b, c.clone().setY(3.4).add(V(0, 0, 0.6)), dt * 4); if (s.t > 0.6 && s.t < 2.8 && T.length) { const k = (s.t - 0.6) / 2.2, f = k * (T.length - 1), i0 = Math.floor(f), i1 = Math.min(T.length - 1, i0 + 1), p = tp(T[i0], 0.2).lerp(tp(T[i1], 0.2), f - i0);
          bm.visible = true; const a = b.position, m = a.clone().add(p).multiplyScalar(0.5); bm.position.copy(m); bm.scale.set(1, a.distanceTo(p), 1); bm.quaternion.setFromUnitVectors(V(0, 1, 0), p.clone().sub(a).normalize()); pop(p, 0x7df9ff, 0.6);
          for (const t of T) if (t.g.position.distanceTo(p.clone().setY(0)) < 0.9 && (s.cd.get(t) || 0) < s.t) { s.cd.set(t, s.t + 0.4); hit(t, 1, a); } } else bm.visible = false;
        if (s.t > 3.2) { del(b); birds.splice(birds.indexOf(b), 1); del(bm); return true; } } }; },
    vault: () => { const c0 = C(), y0 = hope.position.y, z0 = hope.position.z, f = FWD(); tap(null, 0.8); return { t: 0, upd: (s) => { const P = hope.userData.P, cr = s.t < 0.35 ? Math.sin(Math.PI * s.t / 0.35 * 0.5) : 0, k = cl((s.t - 0.35) / 0.95);   /* s704 crouch → plant the cane → a big forward arc with a full flip → squash landing */
        if (P && P.body && s.t < 0.35) P.body.position.y -= cr * 0.18; hope.position.y = y0 + Math.sin(Math.PI * k) * 3.6; hope.position.z = z0 + Math.sin(Math.PI * k) * 0.8 * f.z; hope.rotation.x = k > 0 && k < 1 ? -k * Math.PI * 2 : 0;
        if (k > 0 && k < 1 && Math.random() < 0.6) pop(hope.localToWorld(V(0, 1, 0)), 0x7dd3fc, 0.5);
        if (s.t > 1.3 && s.t < 1.5 && P && P.body) P.body.position.y -= Math.sin(Math.PI * (s.t - 1.3) / 0.2) * 0.2;
        if (k >= 1 && !s.l) { s.l = true; hope.rotation.x = 0; hope.position.y = y0; hope.position.z = z0; spark(c0.clone().setY(0.1), 16); ring(c0, 0xffffff, 4, 0.5); ring(c0, 0x7dd3fc, 6, 0.7); pop(c0.clone().setY(0.4), 0x7dd3fc, 3); for (const t of tgts()) if (t.g.position.distanceTo(c0.clone().setY(0)) < 6) hit(t, 2, c0); o.sfx && o.sfx('stompHeavy'); } return s.t > 1.8; } }; },
    voice: () => { const T = tgts(), notes = []; return { t: 0, upd: (s) => { const c = C(); if (s.t < 2.4 && Math.random() < 0.5) { const n = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: gT(), color: 0xbfe9ff, transparent: true, depthWrite: false }))); n.scale.setScalar(0.25); n.position.copy(c).setY(1.8); const t = T[(Math.random() * T.length) | 0]; notes.push({ n, t: 0, to: t ? tp(t, 1.6) : c.clone().add(V(0, 3, 0)) }); }
        for (let i = notes.length - 1; i >= 0; i--) { const q = notes[i]; q.t += 1 / 60 / 0.9; q.n.position.lerpVectors(c.clone().setY(1.8), q.to, q.t); q.n.position.y += Math.sin(q.t * 9) * 0.15; q.n.material.opacity = 1 - q.t; if (q.t >= 1) { del(q.n); notes.splice(i, 1); } }
        for (const t of T) { t.stun = 1; t.b.rotation.y = Math.sin(s.t * 30) * 0.05 * (Math.random() < 0.3 ? 4 : 1); } if (s.t > 2.6 && !s.e) { s.e = true; for (const t of T) { t.b.rotation.y = 0; hit(t, 1, C(), 3); } }
        if (s.t > 3.0) { notes.forEach(q => del(q.n)); return true; } } }; },
    finale: () => { const c0 = C(); let sub = null; return { t: 0, upd: (s, dt) => { if (s.t < 0.01) sub = PLAY.echo(); if (s.t > 1.4 && !s.f) { s.f = true; sub = PLAY.flock(); } if (s.t > 3.6 && !s.v) { s.v = true; sub = PLAY.vault(); } if (sub) { sub.t += dt; if (sub.upd(sub, dt)) sub = null; }
        if (s.t > 5.6 && !sub) { ring(c0, 0xffd23a, 7, 0.8); for (const t of tgts()) hit(t, 3, c0); return true; } } }; } };
  function tick(dt) { tapTick(dt); if (A) { A.t += dt; if (A.upd(A, dt)) A = null; }
    birds.forEach(b => b.userData.flap && b.userData.flap(performance.now() / 1000));
    for (let i = bolts.length - 1; i >= 0; i--) { const q = bolts[i]; q.t += dt / 0.25; const to = tp(q.tg); q.m.position.lerpVectors(q.from, to, cl(q.t)); q.m.quaternion.setFromUnitVectors(V(0, 1, 0), to.clone().sub(q.from).normalize()); if (q.t >= 1) { hit(q.tg, 1, q.from); del(q.m); bolts.splice(i, 1); } }
    for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; const k = f.t / f.d; if (f.mark) { f.m.rotation.z += dt * 4; f.m.material.opacity = 1; f.m.scale.setScalar(1 + 0.1 * Math.sin(f.t * 12)); }
      else if (f.v) { f.m.position.addScaledVector(f.v, dt); f.v.y -= 9 * dt; f.m.material.opacity = 1 - k; }
      else if (f.ring) { f.m.scale.setScalar(0.3 + f.s * k); f.m.material.opacity = 1 - k; } else { f.m.scale.setScalar(0.2 + f.s * Math.sin(Math.PI * Math.min(1, k))); f.m.material.opacity = 1 - k; } if (k >= 1) { del(f.m); fx.splice(i, 1); } } }
  return { play(k) { if (A) return false; const f = PLAY[k]; if (!f) return false; A = f(); return !!A; }, tick, busy: () => !!A, list: HOPE_SUPERS };
}
