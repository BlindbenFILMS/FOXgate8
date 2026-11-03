// PINBALL, LIGHT VERSION for world rooms (Ben: "the pinball is heavy, make it lighter"). Same look up close, a fraction of the cost:
//  · ONE machine is built (minigames/arcade/pinball-machine.js buildMachine); every placed machine is a clone that SHARES its
//    geometry, materials and textures (was 4 copies of 2.55 megapixels of art + 112 materials each).
//  · Every part that never changes is MERGED into one mesh per material (172 meshes → ~25); lamps, bumper caps, coin slots,
//    the DMD and the glow sprites stay live so the attract-mode light show still runs (shared, so all machines flash together).
//  · FAR LOD: past R metres (phone 9, desktop 14) a machine swaps to a 4-draw box with the playfield + backglass art.
// The playable game is unchanged (pinball.dc.html builds its own full machine).
import { buildMachine } from '../minigames/arcade/pinball-machine.js';
export function pinballSet(ctx, places, { touch = false, scale = 1.45, best = 0 } = {}) {
  const { THREE } = ctx, M0 = buildMachine({ ...ctx, touch }, { scale }), root = M0.machine;
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.updateMatrixWorld(true);
  const live = new Set([M0.slotMat, ...M0.bumpMeshes.map(b => b.capMat)]);
  for (const L of Object.values(M0.lamps)) { live.add(L.m.material); if (L.core) live.add(L.core.material); }
  root.traverse(o => { if (o.material && o.material.map === M0.dmd.tex) live.add(o.material); });
  // ---- merge the static parts, per material ----
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), rel = new THREE.Matrix4(), bins = new Map(), gone = [];
  root.traverse(o => { if (!(o.isMesh || o.isLineSegments) || o.isInstancedMesh || o.isSprite) return; const m = o.material;
    if (!m || Array.isArray(m) || live.has(m) || m.transparent) return;
    rel.multiplyMatrices(inv, o.matrixWorld); let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(rel);
    const key = (o.isLineSegments ? 'L|' : 'M|') + m.uuid; if (!bins.has(key)) bins.set(key, { m, line: o.isLineSegments, list: [] }); bins.get(key).list.push(g); gone.push(o); });
  for (const o of gone) o.parent.remove(o);
  const merged = new THREE.Group(); merged.name = 'pinballStatic';
  for (const { m, line, list } of bins.values()) { let n = 0; for (const g of list) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = line ? null : new Float32Array(n * 3), uv = line ? null : new Float32Array(n * 2); let k = 0;
    for (const g of list) { pos.set(g.attributes.position.array, k * 3); if (!line) { if (!g.attributes.normal) g.computeVertexNormals(); nor.set(g.attributes.normal.array, k * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, k * 2); } k += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); if (!line) { G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
    const mesh = line ? new THREE.LineSegments(G, m) : new THREE.Mesh(G, m); if (!line && !touch) mesh.receiveShadow = true; merged.add(mesh); }
  root.add(merged);
  // ---- the playfield lamp inserts: one vertex-coloured mesh; their colours are copied over after each attract step ----
  const LL = Object.values(M0.lamps).filter(L => L.m.parent), lampRuns = []; let lampMesh = null;
  { const parts = []; let n = 0;
    for (const L of LL) { rel.multiplyMatrices(inv, L.m.matrixWorld); const g = (L.m.geometry.index ? L.m.geometry.toNonIndexed() : L.m.geometry.clone()).applyMatrix4(rel); lampRuns.push({ L, at: n, n: g.attributes.position.count, last: -1 }); n += g.attributes.position.count; parts.push(g); }
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3); let k = 0; for (const g of parts) { pos.set(g.attributes.position.array, k * 3); k += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('color', new THREE.BufferAttribute(col, 3));
    lampMesh = new THREE.Mesh(G, new THREE.MeshBasicMaterial({ vertexColors: true })); root.add(lampMesh); for (const L of LL) L.m.parent.remove(L.m); }
  const syncLamps = () => { const ca = lampMesh.geometry.attributes.color; let dirty = false;
    for (const r of lampRuns) { const c = r.L.m.material.color, h = c.getHex(); if (h === r.last) continue; r.last = h; dirty = true; for (let i = r.at; i < r.at + r.n; i++) ca.setXYZ(i, c.r, c.g, c.b); }
    if (dirty) ca.needsUpdate = true; };
  syncLamps();
  // ---- the far box (4 draws), using the same art ----
  const pfTex = M0.pf.material.map; let backTex = null; root.traverse(o => { const t = o.material && o.material.map; if (t && t.image && t.image.width === 1024 && t.image.height === 768) backTex = t; });
  const far = new THREE.Group(); far.scale.setScalar(scale);
  { const body = new THREE.MeshLambertMaterial({ color: '#201a3a' }); const bx = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.98, 1.66), body); bx.position.set(0, 0.49, 0.04); far.add(bx);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.5), new THREE.MeshBasicMaterial({ map: pfTex, color: 0xcccccc })); top.rotation.x = -Math.PI / 2 + 0.11; top.position.set(0, 0.99, 0.05); far.add(top);
    const bb = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.9, 0.2), body); bb.position.set(0, M0.backbox.position.y + 0.45, -0.8); far.add(bb);
    if (backTex) { const art = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.525), new THREE.MeshBasicMaterial({ map: backTex })); art.position.set(0, M0.backbox.position.y + 0.6, -0.698); far.add(art); } }
  // ---- place the clones ----
  const group = new THREE.Group(); group.name = 'pinballs'; const sprites = [];
  const items = places.map(p => { const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = p.rotY || 0; group.add(g);
    const near = root.clone(), lo = far.clone(); g.add(near, lo); lo.visible = false;
    const src = [], dst = []; root.traverse(o => { if (o.isSprite) src.push(o); }); near.traverse(o => { if (o.isSprite) dst.push(o); }); src.forEach((o, i) => dst[i] && sprites.push([o, dst[i]]));   // clones copy the halos' on / off
    const standAt = new THREE.Vector3(0, 0, 1.3 * scale / 1.45).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.rotY || 0).add(g.position);
    return { group: g, near, lo, standAt, x: p.x, z: p.z }; });
  const R = touch ? 9 : 14; let t = 0, dmdTxt = '';
  return { group, items,
    update(dt, cam) { t += dt; let anyNear = false;
      for (const it of items) { if (it.playing) { it.near.visible = it.lo.visible = false; continue; } const nearOn = !cam || Math.hypot(cam.x - it.x, cam.z - it.z) < R; if (it.near.visible !== nearOn) { it.near.visible = nearOn; it.lo.visible = !nearOn; } anyNear = anyNear || nearOn; }
      if (!anyNear) return;
      M0.attract(dt); syncLamps(); for (const [s, d] of sprites) d.visible = s.visible; const ph = Math.floor(t / 3) % 2, txt = ph ? 'HS' : 'GR'; if (txt !== dmdTxt) { dmdTxt = txt; M0.dmd.draw(ph ? ['HIGH SCORE', best.toLocaleString('en-US')] : ['GATE RUSH']); } },
    setBest(v) { best = v || 0; dmdTxt = ''; },
    stats: () => ({ staticDraws: merged.children.length, machines: items.length }) };
}
