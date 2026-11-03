// MERU 2.0 — s35 NIGHT LIGHTING KIT (Ben: "light up the stations, the carnival games inside, the carousel, the action"). No real lights
// (phone budget: every toon material would pay per light): lit things get their own copy of their materials with an EMISSIVE that fades
// in at night (textured ones glow with their own texture), plus additive LIGHT POOLS on the ground and soft SPOT BEAMS (open cones) from
// small lamp heads down onto the action. Pools, beams and lamp heads are one instanced draw each per kit.
//   const NL = makeNightLit(THREE); NL.lit(obj, 0.4); NL.pool(x, y, z, r, col, a); NL.beam([x,y,z] lamp, [x,y,z] target, r, col, a); NL.done(parent);
//   per frame: NL.tick(dt, isNight)
export function makeNightLit(THREE) {
  const mats = new Map(), litMats = [], pools = [], beams = [], heads = []; let f = 0, want = 0, applied = -1, built = null;
  const clone = (m, k) => { if (!m || m.emissive === undefined) return m; const key = m.uuid + ':' + k; if (mats.has(key)) return mats.get(key);
    const c = m.clone(); c.userData = { ...m.userData, nlK: k }; if (m.map) { c.emissiveMap = m.map; c.userData.nlBase = new THREE.Color(1, 1, 1); } else c.userData.nlBase = (m.color ? m.color.clone() : new THREE.Color(1, 1, 1)).lerp(new THREE.Color(1, 0.86, 0.6), 0.25);
    c.userData.nlE0 = m.emissive.clone(); mats.set(key, c); litMats.push(c); return c; };
  function lit(obj, k = 0.4) { obj.traverse(o => { if (!o.isMesh || o.userData.nlSkip || o.userData.nl) return; o.userData.nl = true; o.material = Array.isArray(o.material) ? o.material.map(m => clone(m, k)) : clone(o.material, k); }); }
  const pool = (x, y, z, r, col = '#ffd9a0', a = 0.55) => pools.push({ x, y, z, r, c: new THREE.Color(col).multiplyScalar(a) });
  const beam = (from, to, r = 1.2, col = '#fff1c8', a = 0.32, head = true) => { beams.push({ from, to, r, c: new THREE.Color(col).multiplyScalar(a) }); if (head) heads.push(from); pool(to[0], Math.max(0.03, to[1] - 0.02), to[2], r * 1.1, col, a * 1.4); };
  function done(parent) {
    const radial = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.45, 'rgba(255,255,255,0.45)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    const fade = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 64; const g = c.getContext('2d'), q = g.createLinearGradient(0, 64, 0, 0); q.addColorStop(0, 'rgba(255,255,255,0.9)'); q.addColorStop(0.7, 'rgba(255,255,255,0.25)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 4, 64); return new THREE.CanvasTexture(c); })();
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), G = new THREE.Group(); G.name = 'nightLit'; parent.add(G);
    const add = (geo, mat, list, set) => { if (!list.length) return null; const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((p, i) => { set(p); im.setMatrixAt(i, M4); if (p.c) im.setColorAt(i, p.c); }); if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; im.renderOrder = 3; im.userData.noCull = true; G.add(im); return im; };
    const pm = new THREE.MeshBasicMaterial({ map: radial, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, color: 0xffffff });
    const pIm = add(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), pm, pools, p => M4.compose(V.set(p.x, p.y, p.z), Q.identity(), S.set(p.r, 1, p.r)));
    const bm = new THREE.MeshBasicMaterial({ map: fade, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, color: 0xffffff });
    const bIm = add(new THREE.CylinderGeometry(0.12, 1, 1, 18, 1, true), bm, beams, p => { const a = new THREE.Vector3(...p.from), b = new THREE.Vector3(...p.to), d = a.clone().sub(b), L = d.length(); Q.setFromUnitVectors(UP, d.normalize()); M4.compose(V.copy(a).add(b).multiplyScalar(0.5), Q, S.set(p.r, L, p.r)); });
    const hm = new THREE.MeshBasicMaterial({ color: 0x3a3a3a });
    const hIm = add(new THREE.CylinderGeometry(0.16, 0.22, 0.3, 10), hm, heads.map(h => ({ h })), p => M4.makeTranslation(p.h[0], p.h[1] + 0.12, p.h[2]));
    built = { G, pm, bm, hm, parts: [pIm, bIm].filter(Boolean) }; for (const m of built.parts) m.visible = false; return built; }
  function tick(dt, night) { want = night ? 1 : 0; f += Math.max(-dt * 0.8, Math.min(dt * 0.8, want - f)); if (Math.abs(f - applied) < 0.01 && !(f === want && applied !== want)) return; applied = f;
    for (const m of litMats) m.emissive.copy(m.userData.nlBase).multiplyScalar(m.userData.nlK * f).add(m.userData.nlE0);
    if (built) { const on = f > 0.02; for (const m of built.parts) m.visible = on; built.pm.color.setScalar(f); built.bm.color.setScalar(f * 0.75); built.hm.color.setRGB(0.23 + 0.77 * f, 0.23 + 0.72 * f, 0.23 + 0.55 * f); } }
  return { lit, pool, beam, done, tick, get n() { return { mats: litMats.length, pools: pools.length, beams: beams.length }; } };
}
