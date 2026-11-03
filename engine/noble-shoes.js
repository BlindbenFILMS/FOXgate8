// s667 NOBLE'S SHOE DRONES (Ben): Noble has NO FEET. His "shoes" are two tech skate-boot DRONES (bright blue + white, light strips, glowing
// skate pods) that hover where his feet would be. THROW: he reaches down, the drone lifts up to meet his paw, he takes it, it glows brighter,
// he throws; it flies out on a boomerang curve (glow trail + a spinning energy ring + sparks), comes back, ORBITS him 3 times as a shield,
// then docks back in its idle place.
// nobleShoes({ THREE, M, toon }).attach(noble) → S · host calls S.tick(dt) every frame after animFox · S.throw(i = 0) (0 = his RIGHT shoe)
export function nobleShoes({ THREE, M, toon }) {
  const ACC = (typeof localStorage !== 'undefined' && localStorage.getItem('noble.shoeAccent')) || 'white';   /* s667l Ben: try the accents in white ('gold' = the s667e look) */
  const BLUE = ACC === 'gold' ? '#ffc83d' : '#f3f2f2', WHITE = '#1e3a8a', INK = '#0f1a3d', CYAN = ACC === 'gold' ? 0xffd86b : 0xdff4ff;   /* s667e Ben: DARK BLUE boots + a different accent: navy shell, gold panels, warm gold glow */   /* s667c Ben: complements his white + blue suit but clearly different: graphite shell, bright orange panels, amber glow */
  let glowTex = null;
  const glowT = () => { if (glowTex) return glowTex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(160,230,255,0.75)'); gr.addColorStop(1, 'rgba(56,189,248,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glowTex = new THREE.CanvasTexture(c); return glowTex; };
  const sprite = (s, o = 1) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT(), color: CYAN, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.setScalar(s); return m; };
  function makeDrone(H = 0) {
    const g = new THREE.Group(), lit = toon(BLUE, { emissive: new THREE.Color(BLUE), emissiveIntensity: 0.35 }), wh = toon(WHITE), ink = toon(INK);
    const glow = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 });
    const shell = M(new THREE.SphereGeometry(0.13, 20, 14), wh, 0, -0.005, 0.045, g, 0.016, 0.13); shell.scale.set(0.98, 0.64, 1.5);           // the boot shell (s667g sleeker, lower)
    const toe = M(new THREE.SphereGeometry(0.075, 16, 10), lit, 0, -0.03, 0.215, g, 0.01, 0.075); toe.scale.set(1.2, 0.5, 0.62);        // s667g a slim gold toe tip (was a big blob)
    for (const sx of [-1, 1]) { const fin = M(new THREE.BoxGeometry(0.012, 0.09, 0.11), lit, sx * 0.07, 0.07, -0.17, g, 0.008); fin.rotation.set(-0.5, 0, sx * 0.35); }   // little drone fins on the heel
    const heel = M(new THREE.SphereGeometry(0.085, 14, 10), wh, 0, 0.0, -0.1, g, 0.012, 0.085); heel.scale.set(1.08, 0.8, 0.7);        // heel counter (navy)
    /* s667d (Ben: keep the shoe from before, but MORE of it comes off): the shoe + its ANKLE CUFF (the flared cuff with rims) fly as one piece */
    /* s667e slimmer ankle (Ben: too bulky): one tapered cuff hugging the shin, thin rims */
    const cuffG = new THREE.LatheGeometry([[0.112, 0.0], [0.11, 0.025], [0.102, 0.07], [0.097, 0.12], [0.1, 0.15], [0.094, 0.16]].map(([x, y]) => new THREE.Vector2(x, y)), 22);
    M(cuffG, wh, 0, 0.05, -0.02, g, 0.01, 0.112);
    for (const [y, r] of [[0.21, 0.095]]) { const t = M(new THREE.TorusGeometry(r, 0.009, 6, 22), lit, 0, y, -0.02, g, 0); t.rotation.x = Math.PI / 2; }
    { const bd = M(new THREE.CylinderGeometry(0.036, 0.036, 0.01, 16), lit, 0, 0.14, 0.078, g, 0.006); bd.rotation.x = Math.PI / 2; const gl = M(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 14), glow, 0, 0.14, 0.084, g, 0); gl.rotation.x = Math.PI / 2; gl.userData.glow = true; }   // a gold badge with a glowing eye on the front of the cuff
    const port = M(new THREE.CylinderGeometry(0.088, 0.088, 0.01, 18), glow, 0, 0.212, -0.02, g, 0); port.userData.glow = true;        // glowing dock port on top
    M(new THREE.BoxGeometry(0.21, 0.04, 0.42), ink, 0, -0.085, 0.045, g, 0.01);   // sole                                                            // sole plate
    const pods = []; for (const z of [-0.1, 0.04, 0.18]) { const p = M(new THREE.CylinderGeometry(0.034, 0.034, 0.17, 14), glow, 0, -0.108, z, g, 0); p.rotation.z = Math.PI / 2; p.userData.glow = true; pods.push(p); }   // skate pods
    const halo = sprite(0.34, 0.45); halo.position.set(0, -0.14, 0.04); g.add(halo);                                                   // hover glow under it
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 6, 32), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    ring.rotation.x = Math.PI / 2; g.add(ring);                                                                                         // energy ring (in flight)
    g.userData = { pods, halo, ring, glowMats: [glow] }; return g;
  }
  function attach(noble) {
    const u = noble.userData, P = u.P, body = P.body, R = u.rig; if (!R || !R.knees) return null;
    const scene = () => { let o = noble; while (o.parent) o = o.parent; return o; };
    const D = R.knees.map((K, i) => { const b = K.boot; const pos = b ? b.position.clone() : new THREE.Vector3(0, -0.4, 0.05); const d = makeDrone();
      if (b) b.visible = false; for (const o of K.extra || []) if (o.geometry && /Lathe|Torus/.test(o.geometry.type) && o.position.y < -0.1) o.visible = false;   /* the boot cuff sits inside the tall shaft */
      const stump = M(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 18), new THREE.MeshBasicMaterial({ color: CYAN }), 0, pos.y + 0.2, 0.01, K.knee, 0.01, 0.09); stump.visible = false;   /* glowing socket where the cuff was while the shoe is away */ d.position.copy(pos); d.position.y += 0.02; d.scale.setScalar(0.95); K.knee.add(d); return { d, K, stump, home: d.position.clone(), st: 'dock', t: 0, i, ph: i * 1.7 }; });
    const trail = Array.from({ length: 18 }, () => { const s = sprite(0.26, 0); s.visible = false; return { s, a: 0 }; }); let trI = 0, trOn = false;
    const sparks = Array.from({ length: 14 }, () => { const s = sprite(0.08, 0); s.visible = false; return { s, v: new THREE.Vector3(), a: 0 }; }); let spI = 0;
    const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion(), FWD = new THREE.Vector3(), RT = new THREE.Vector3();
    const ss = x => x * x * (3 - 2 * x), cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
    const S = { drones: D, busy: () => D.some(x => x.st !== 'dock'), range: 6, orbitR: 1.35, orbitH: 1.0, orbits: 3 };
    const toWorld = x => { x.d.updateMatrixWorld(true); x.d.getWorldPosition(_a); x.d.getWorldQuaternion(_q); const sc = scene(); if (x.d.parent !== sc) { x.d.parent.remove(x.d); sc.add(x.d); } x.d.position.copy(_a); x.d.quaternion.copy(_q); x.d.scale.setScalar(0.95 * (noble.scale.x || 1)); };
    const dockWorld = (x, out) => { x.K.knee.updateMatrixWorld(true); return x.K.knee.localToWorld(out.copy(x.home)); };
    const handWorld = (i, out) => { const H = P.hands && P.hands[i]; if (!H) return body.localToWorld(out.set(-0.3, 1.2, 0.4)); const w = new THREE.Vector3(); out.set(0, 0, 0); for (const f of H.fingers) out.add((f.b || f.a).getWorldPosition(w)); return out.divideScalar(H.fingers.length); };
    const glowK = (x, k) => { for (const m of x.d.userData.glowMats) m.color.setHSL(0.55, 0.9, 0.62 + 0.3 * k); x.d.userData.halo.material.opacity = 0.45 + 0.5 * k; x.d.userData.halo.scale.setScalar(0.34 + 0.4 * k); };
    S.throw = (i = 0) => { const x = D[i]; if (!x || x.st !== 'dock') return false; x.st = 'reach'; x.t = 0; return true; };
    /* s701 SUPERS take a drone over: grab = it leaves the dock into the world, the super flies it; release = it flies home + docks */
    S.grab = i => { const x = D[i]; if (!x || x.st !== 'dock') return null; toWorld(x); x.st = 'super'; x.t = 0; trOn = true; return x.d; };
    S.release = i => { const x = D[i]; if (!x || x.st !== 'super') return; x.st = 'home'; x.t = 0; x.p0 = x.d.position.clone(); };
    const setOv = (i, Tb, w) => { R.armOv = R.armOv || [null, null]; R.armOv[i] = w > 0 ? { T: Tb, w } : null; };
    S.tick = dt => { const sc = scene(); noble.updateMatrixWorld(true); FWD.set(0, 0, 1).applyQuaternion(noble.getWorldQuaternion(_q)).setY(0).normalize(); RT.set(-FWD.z, 0, FWD.x);
      const C = noble.getWorldPosition(new THREE.Vector3());
      for (const x of D) { x.ph += dt; const d = x.d, U = d.userData; { const off = x.st !== 'dock' && x.st !== 'reach'; x.stump.visible = off; } U.pods.forEach((p, k) => p.rotation.x += dt * (x.st === 'dock' ? 2 : 22));
        if (x.st === 'dock') { d.position.y = x.home.y; d.rotation.set(0, 0, 0);   /* s667j no idle bob (Ben: it looked like his legs were moving) */ glowK(x, 0.15 + 0.1 * Math.sin(x.ph * 3)); U.ring.material.opacity = 0; continue; }
        x.t += dt; const t = x.t;
        if (x.st === 'reach') {   // he reaches down; the drone lifts up to meet his paw
          const A = R.arms[x.i]; dockWorld(x, _a); const lift = ss(cl((t - 0.12) / 0.33)); _b.copy(_a).lerp(handWorld(x.i, new THREE.Vector3()), lift * 0.85);
          const Tb = body.worldToLocal(_a.clone().lerp(_b, 0.5).add(new THREE.Vector3(0, 0.06, 0))); setOv(x.i, Tb, ss(cl(t / 0.3)));
          if (t > 0.12) { if (d.parent !== sc) toWorld(x); d.position.copy(_b); d.rotation.y += dt * 2; } glowK(x, 0.3 + 0.4 * lift);
          if (t >= 0.45) { x.st = 'hold'; x.t = 0; } }
        else if (x.st === 'hold') {   // takes it, raises it up by the shoulder, it glows brighter
          const A = R.arms[x.i], k = ss(cl(t / 0.35)); const Tb = new THREE.Vector3(A.side * 0.32, A.S.y + 0.25 * k - 0.35 * (1 - k), 0.12 + 0.1 * k); setOv(x.i, Tb, 1);
          handWorld(x.i, _a); d.position.copy(_a); d.quaternion.copy(noble.getWorldQuaternion(_q)); d.rotateY(-Math.PI / 2 * A.side * k); glowK(x, 0.6 + 0.4 * k + 0.15 * Math.sin(t * 40));
          if (t >= 0.42) { x.st = 'out'; x.t = 0; x.p0 = d.position.clone(); x.far = C.clone().addScaledVector(FWD, S.range).setY(C.y + S.orbitH); trOn = true; } }
        else {
          if (x.st === 'out' || x.st === 'back') { const A = R.arms[x.i]; const k = x.st === 'out' ? cl(t / 0.3) : 1; setOv(x.i, new THREE.Vector3(A.side * 0.18, A.S.y + 0.1, 0.55), 1 - ss(k)); }
          U.ring.material.opacity = 0.85; U.ring.rotation.z += dt * 9; U.ring.scale.setScalar(1 + 0.15 * Math.sin(t * 18)); glowK(x, 1);
          d.rotateY(dt * 22);
          if (x.st === 'out') { const q = cl(t / 0.7), e = ss(q); d.position.copy(x.p0).lerp(x.far, e).addScaledVector(RT, Math.sin(Math.PI * q) * 1.6); if (q >= 1) { x.st = 'back'; x.t = 0; x.p0 = d.position.clone(); } }
          else if (x.st === 'back') { const q = cl(t / 0.75), e = ss(q), tgt = C.clone().addScaledVector(RT, -S.orbitR).setY(C.y + S.orbitH); d.position.copy(x.p0).lerp(tgt, e).addScaledVector(RT, -Math.sin(Math.PI * q) * 1.4);
            if (q >= 1) { x.st = 'orbit'; x.t = 0; x.a0 = Math.atan2(-RT.x, -RT.z); } }
          else if (x.st === 'orbit') { const dur = S.orbits * 0.95, q = cl(t / dur), a = x.a0 + q * S.orbits * Math.PI * 2;   // 3 shield laps round him
            d.position.set(C.x + Math.sin(a) * S.orbitR, C.y + S.orbitH + Math.sin(a * 2) * 0.08, C.z + Math.cos(a) * S.orbitR); if (q >= 1) { x.st = 'home'; x.t = 0; x.p0 = d.position.clone(); } }
          else if (x.st === 'home') { const q = cl(t / 0.55), e = ss(q); dockWorld(x, _a); d.position.copy(x.p0).lerp(_a, e); d.position.y += Math.sin(Math.PI * q) * 0.25; U.ring.material.opacity = 0.85 * (1 - q);
            if (q >= 1) { sc.remove(d); x.K.knee.add(d); d.position.copy(x.home); d.rotation.set(0, 0, 0); d.scale.setScalar(0.95); x.st = 'dock'; trOn = D.some(y => y.st !== 'dock' && y.st !== 'reach' && y.st !== 'hold'); } }
          // glow trail + sparks
          const tr = trail[trI = (trI + 1) % trail.length]; if (!tr.s.parent) sc.add(tr.s); tr.s.position.copy(d.position); tr.a = 0.7; tr.s.visible = true;
          if (Math.random() < 0.6) { const sp = sparks[spI = (spI + 1) % sparks.length]; if (!sp.s.parent) sc.add(sp.s); sp.s.position.copy(d.position); sp.v.set(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).multiplyScalar(2.4); sp.a = 1; sp.s.visible = true; } } }
      for (const tr of trail) if (tr.a > 0) { tr.a = Math.max(0, tr.a - dt * 2.2); tr.s.material.opacity = tr.a; tr.s.scale.setScalar(0.1 + 0.22 * tr.a); if (!tr.a) tr.s.visible = false; }
      for (const sp of sparks) if (sp.a > 0) { sp.a = Math.max(0, sp.a - dt * 2.5); sp.s.position.addScaledVector(sp.v, dt); sp.v.y -= 3 * dt; sp.s.material.opacity = sp.a; if (!sp.a) sp.s.visible = false; }
      for (const x of D) if (x.st === 'dock' && R.armOv && R.armOv[x.i]) R.armOv[x.i] = null; };
    S.reset = () => { for (const x of D) { if (x.d.parent !== x.K.knee) { if (x.d.parent) x.d.parent.remove(x.d); x.K.knee.add(x.d); } x.d.position.copy(x.home); x.d.rotation.set(0, 0, 0); x.d.scale.setScalar(0.95); x.st = 'dock'; x.t = 0; x.d.userData.ring.material.opacity = 0; x.stump.visible = false; }
      if (R.armOv) R.armOv = [null, null]; trOn = false; for (const tr of trail) { tr.a = 0; tr.s.visible = false; } for (const sp of sparks) { sp.a = 0; sp.s.visible = false; } };
    return S;
  }
  return { attach, makeDrone };
}
