// 8 GATES — phone bake: merge a creature's static meshes into one mesh per material per joint (outlines too).
// Animated / toggled parts are left alone: anything referenced from userData (joints, weak, arrays of parts) or carrying
// userData.home. Textured, vertex-coloured, transparent or skinned materials are skipped. Returns { before, after } draw calls.
export function bakeCreature(THREE, g) {
  const keep = new Set(), seen = new Set();
  const collect = v => { if (!v || typeof v !== 'object' || seen.has(v)) return; seen.add(v); if (v.isObject3D) { keep.add(v); return; } if (Array.isArray(v)) v.forEach(collect); else if (v.constructor === Object) Object.values(v).forEach(collect); };
  collect(g.userData.joints); collect(g.userData.weak); if (g.userData.cface) g.userData.cface.g.traverse(o => keep.add(o)); collect(g.userData.hat); collect(g.userData.lamps);
  const count = () => { let n = 0; g.traverse(o => { if (o.isMesh && o.visible) n++; }); return n; };
  const before = count();
  const okMat = m => m && !Array.isArray(m) && !m.map && !m.vertexColors && !m.transparent && (m.isMeshToonMaterial || m.isMeshBasicMaterial);
  const isOutline = o => o.isMesh && o.material && o.material.side === THREE.BackSide && o.material.isMeshBasicMaterial;
  const toArrays = (geo, mtx) => { const gg = geo.index ? geo.toNonIndexed() : geo.clone(); gg.applyMatrix4(mtx); if (!gg.attributes.normal) gg.computeVertexNormals(); return { p: gg.attributes.position.array, n: gg.attributes.normal.array }; };
  const groups = []; g.traverse(o => { if (!o.isMesh) groups.push(o); });
  for (const grp of groups) {
    const buckets = new Map(), victims = [];
    for (const m of grp.children) {
      if (!m.isMesh || keep.has(m) || m.userData.home || !okMat(m.material) || isOutline(m) || !m.visible) continue;
      if (m.children.some(c => !isOutline(c))) continue;
      m.updateMatrix();
      const add = (mat, geo, mtx, castShadow) => { const k = mat.uuid; if (!buckets.has(k)) buckets.set(k, { mat, parts: [], cast: false }); const b = buckets.get(k); b.parts.push(toArrays(geo, mtx)); b.cast = b.cast || castShadow; };
      add(m.material, m.geometry, m.matrix, m.castShadow);
      for (const c of m.children) { c.updateMatrix(); add(c.material, c.geometry, m.matrix.clone().multiply(c.matrix), false); }
      victims.push(m);
    }
    if (victims.length < 2) continue;
    for (const v of victims) grp.remove(v);
    for (const { mat, parts, cast } of buckets.values()) {
      let len = 0; parts.forEach(q => len += q.p.length); const P = new Float32Array(len), N = new Float32Array(len); let o = 0; parts.forEach(q => { P.set(q.p, o); N.set(q.n, o); o += q.p.length; });
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.computeBoundingSphere();
      const mm = new THREE.Mesh(geo, mat); mm.castShadow = cast && mat.side !== THREE.BackSide; mm.receiveShadow = true; grp.add(mm);
    }
  }
  const after = count(); g.userData.calls = after; g.userData.callsBefore = before;
  return { before, after };
}
