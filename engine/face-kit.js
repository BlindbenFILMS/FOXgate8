// 8 GATES — creature FACES: brows, a mouth and (where missing) eyes, added after build and driven by the fight state, so
// every creature reads as grumpy, angry, roaring, tired, hurt, dizzy or shocked. Plus rbox(): a rounded box for less boxy bodies.
export function faceKit(THREE, toon) {
  const DARK = '#1a1416', LIGHT = '#f5e6d0';
  function rbox(w, h, d, k = 0.28) {
    const r = Math.min(w, h, d) * k, g = new THREE.BoxGeometry(w, h, d, 4, 4, 4), p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
    const hi = new THREE.Vector3(w / 2 - r, h / 2 - r, d / 2 - r), lo = hi.clone().negate();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.copy(v).clamp(lo, hi); const dir = v.clone().sub(c); if (dir.lengthSq() > 1e-10) v.copy(c).add(dir.normalize().multiplyScalar(r)); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g;
  }
  function addFace(par, o) {
    const s = o.s || 1, col = new THREE.MeshBasicMaterial({ color: o.col || DARK }), f = new THREE.Group(); f.position.set(o.x || 0, o.y || 0, o.z || 0); f.scale.setScalar(s); if (o.ry) f.rotation.y = o.ry; par.add(f);
    const F = { g: f, t: Math.random() * 5, blink: 2 + Math.random() * 3 };
    if (o.eyes) { F.eyes = [-1, 1].map(sx => { const e = new THREE.Group(); e.position.set(sx * 0.075, 0.03, 0); f.add(e); const w = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); w.scale.z = 0.5; e.add(w); const p = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), new THREE.MeshBasicMaterial({ color: '#15121c' })); p.position.z = 0.022; e.add(p); e.userData.pupil = p; return e; }); }
    if (o.brows !== false) F.brows = [-1, 1].map(sx => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.026, 0.02), col); b.position.set(sx * 0.075, 0.1, 0.012); f.add(b); b.userData.sx = sx; return b; });
    if (o.mouth !== false) { const m = new THREE.Group(); m.position.y = -0.09; f.add(m); F.arc = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.013, 5, 12, Math.PI), col); F.arc.position.y = 0.02; m.add(F.arc); F.open = new THREE.Mesh(new THREE.CircleGeometry(0.05, 14), new THREE.MeshBasicMaterial({ color: '#2a0a10' })); F.open.position.z = 0.004; m.add(F.open); F.teeth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.014, 0.01), new THREE.MeshBasicMaterial({ color: '#fffaf0' })); F.teeth.position.set(0, 0.03, 0.008); m.add(F.teeth); F.m = m; }
    return F;
  }
  const lerp = (a, b, k) => a + (b - a) * k;
  // mood per fight state: brow angle (+ angry, − worried), brow lift, mouth curve (+ smile, − frown), open, eye squint, dizzy
  const MOOD = { idle: [0.25, 0, -0.4, 0, 1, 0], move: [0.35, 0, -0.5, 0, 1, 0], windup: [0.6, -0.01, -0.8, 0.5, 0.8, 0], attack: [0.65, -0.01, -1, 1, 0.75, 0], recover: [-0.25, 0.01, -0.3, 0.35, 0.7, 0], hurt: [-0.5, 0.015, -0.8, 0.6, 0.25, 0], stagger: [-0.1, 0.01, 0, 0.3, 1, 1], armorBreak: [-0.2, 0.04, 0, 1, 1.25, 0], die: [-0.5, -0.01, -1, 0.2, 0.1, 0] };
  function setFace(F, state, dt) {
    if (!F) return; F.t += dt; const m = MOOD[state] || MOOD.idle; F.cur = F.cur || m.slice(); for (let i = 0; i < 6; i++) F.cur[i] = lerp(F.cur[i], m[i], Math.min(1, dt * 12));
    const [ang, lift, curve, open, squint, dizzy] = F.cur;
    F.blink -= dt; const bl = F.blink < 0 ? (F.blink < -0.12 ? (F.blink = 2 + Math.random() * 3, 1) : 0.1) : 1;
    if (F.brows) F.brows.forEach(b => { const wob = dizzy ? Math.sin(F.t * 9 + b.userData.sx) * 0.4 * dizzy : 0; b.rotation.z = -b.userData.sx * ang + wob; b.position.y = 0.1 + lift + (ang > 0 ? -ang * 0.02 : -ang * 0.012); });
    if (F.eyes) F.eyes.forEach((e, i) => { e.scale.y = Math.max(0.08, Math.min(1.3, squint * bl)); const p = e.userData.pupil; p.position.x = dizzy ? Math.cos(F.t * 10 + i * Math.PI) * 0.015 * dizzy : 0; p.position.y = dizzy ? Math.sin(F.t * 10 + i * Math.PI) * 0.015 * dizzy : 0; p.scale.setScalar(ang > 0.5 ? 0.7 : 1); });
    if (F.m) { F.arc.rotation.z = curve >= 0 ? Math.PI : 0; F.arc.scale.set(1, Math.max(0.15, Math.abs(curve)), 1); F.arc.position.y = curve >= 0 ? 0.035 : -0.005; F.arc.visible = open < 0.6; F.open.scale.set(state === 'armorBreak' ? 0.6 : 1, Math.max(0.02, open * (1 + (dizzy ? Math.sin(F.t * 7) * 0.3 : 0))), 1); F.open.visible = open > 0.08; F.teeth.visible = open > 0.4 && ang > 0.3; F.m.rotation.z = dizzy ? Math.sin(F.t * 6) * 0.25 : 0; }
  }
  return { rbox, addFace, setFace, DARK, LIGHT };
}
