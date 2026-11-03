// s295 MATERIALIZE: the shared "coming out of a gate" animation (Ben: save it for things to come out of the gate).
//   const MAT = makeMaterializer({ THREE, scene, glowTex, color });
//   MAT.start(mesh, from:[x,y,z], to:[x,y,z], { dur, onDone, sfx })   // the mesh is drawn in by the portal: scaled from a speck, pulled out to `to`, wrapped in a column of light + scan ring
//   MAT.fx(x, y, z, { dur })                                          // just the light show (for things that animate themselves)
//   MAT.step(dt)  every frame · MAT.busy(mesh) → true while it is materializing · MAT.clear()
export function makeMaterializer({ THREE, scene, glowTex, color = 0xff3b2a }) {
  const list = [], add = (o) => { scene.add(o); return o; };
  const addM = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  function fxGroup(x, y, z) {
    const g = add(new THREE.Group()); g.position.set(x, y, z);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 3.2, 20, 1, true), addM(color, 0)); col.position.y = 1.6; g.add(col);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 3.2, 10, 1, true), addM(0xffe0c0, 0)); core.position.y = 1.6; g.add(core);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 40), addM(color, 0)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; g.add(ring);
    const scan = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.95, 32), addM(0xfff1e0, 0)); scan.rotation.x = -Math.PI / 2; g.add(scan);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.y = 1.1; g.add(glow);
    const motes = []; for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i % 3 ? color : 0xffd23a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(0.22); g.add(s); motes.push(s); }
    return { g, col, core, ring, scan, glow, motes };
  }
  function animFx(F, k) {   // k 0 → 1 over the whole effect
    const inn = Math.min(1, k / 0.25), out = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1, a = inn * out;
    F.col.material.opacity = 0.35 * a; F.col.scale.set(1 - 0.35 * k, 1, 1 - 0.35 * k); F.core.material.opacity = 0.6 * a * (0.6 + 0.4 * Math.sin(k * 60));
    const rw = (k * 2.2) % 1; F.ring.scale.setScalar(0.6 + rw * 1.8); F.ring.material.opacity = (1 - rw) * 0.9 * out;
    F.scan.position.y = 0.1 + ((k * 2.5) % 1) * 2.6; F.scan.material.opacity = 0.7 * a; F.glow.material.opacity = 0.8 * a; F.glow.scale.setScalar(2.2 + 1.4 * Math.sin(k * Math.PI));
    F.motes.forEach((s, i) => { const ph = ((k * 1.6 + i / F.motes.length) % 1), r = 1.6 * (1 - ph), an = i * 2.4 + ph * 5; s.position.set(Math.cos(an) * r, 0.3 + (i % 4) * 0.6 + ph * 0.4, Math.sin(an) * r); s.material.opacity = Math.sin(ph * Math.PI) * a; });
  }
  function kill(it) { scene.remove(it.F.g); it.F.g.traverse(o => { if (o.material) o.material.dispose(); if (o.geometry && o.isMesh) o.geometry.dispose(); }); }
  return {
    start(mesh, from, to, o = {}) { const it = { mesh, from, to, t: 0, dur: o.dur || 1.3, onDone: o.onDone, F: fxGroup(to[0], to[2] != null ? (to[1] || 0) : 0, to[2] != null ? to[2] : to[1]), base: mesh.scale.x || 1 };
      if (to.length === 2) it.to = [to[0], 0, to[1]]; if (from.length === 2) it.from = [from[0], 0, from[1]]; it.F.g.position.set(it.to[0], it.to[1], it.to[2]);
      mesh.scale.setScalar(0.05 * it.base); mesh.position.set(it.from[0], it.from[1] + 1.2, it.from[2]); list.push(it); return it; },
    fx(x, y, z, o = {}) { const it = { mesh: null, t: 0, dur: o.dur || 1.0, F: fxGroup(x, y, z) }; list.push(it); return it; },
    busy(mesh) { return list.some(it => it.mesh === mesh); },
    step(dt) { for (let i = list.length - 1; i >= 0; i--) { const it = list[i]; it.t += dt; const k = Math.min(1, it.t / it.dur); animFx(it.F, k);
        if (it.mesh) { const m = Math.min(1, k / 0.75), e = 1 - Math.pow(1 - m, 3); it.mesh.position.set(it.from[0] + (it.to[0] - it.from[0]) * e, it.from[1] + 1.2 * (1 - e) + (it.to[1] - it.from[1]) * e, it.from[2] + (it.to[2] - it.from[2]) * e);
          it.mesh.scale.setScalar(it.base * (0.05 + 0.95 * e) * (1 + 0.12 * Math.sin(k * 40) * (1 - k))); it.mesh.rotation.y += (1 - e) * dt * 14; }
        if (k >= 1) { if (it.mesh) it.mesh.scale.setScalar(it.base); kill(it); list.splice(i, 1); it.onDone && it.onDone(); } } },
    clear() { for (const it of list) kill(it); list.length = 0; } };
}
