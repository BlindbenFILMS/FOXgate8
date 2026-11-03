// MERU 2.0 — the YELLOW BRICK ROAD (Ben, s33): a 3.2 m strip of yellow bricks from the fountain out along the four walking paths
// (PATHS: Ruins, Arena, Castle, Lake) so you always know where the path is. Gaps where a road crosses (the crosswalk shows there).
// Follows the ground height; one merged mesh, one texture.
export function buildYellowRoad({ THREE, scene, L, heightAt, roadD, touch }) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#8a6a1c'; g.fillRect(0, 0, 128, 256);
  for (let r = 0; r < 16; r++) { const o = r % 2 ? 0 : 16; for (let i = -1; i < 5; i++) { const k = 0.86 + ((i * 7 + r * 11) % 7) / 28; g.fillStyle = 'rgb(' + (240 * k | 0) + ',' + (196 * k | 0) + ',' + (58 * k | 0) + ')'; g.fillRect(i * 32 + o + 1.5, r * 16 + 1.5, 29, 13); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(i * 32 + o + 2, r * 16 + 2, 27, 2); } }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  const W = 3.2, STEP = touch ? 3 : 2, RING = [8.6, 11.8], R0 = RING[1] - 0.3, pos = [], uv = [], idx = [];
  const ENDS = { toArena: 360, toRuins: 432, toLake: 212, toCastle: 400 };
  for (const p of L.PATHS) { const end = ENDS[p.key]; if (!end) continue; const [ax, az] = p.p[0], [bx, bz] = p.p[p.p.length - 1], len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, nx = -uz, nz = ux;
    let prev = null;
    for (let s = R0; s <= Math.min(end, len) + 1e-6; s += STEP) { const x = ax + ux * s, z = az + uz * s;
      if (roadD(x, z) < 0.3) { prev = null; continue; }
      const y = heightAt(x, z) + 0.07, row = [[x + nx * W / 2, y, z + nz * W / 2], [x - nx * W / 2, y, z - nz * W / 2]], v = s / 1.6;
      const i0 = pos.length / 3; for (const q of row) pos.push(...q); uv.push(0, v, W / 1.6 / 2 * 0 + 1, v);
      if (prev != null) idx.push(prev, i0, prev + 1, prev + 1, i0, i0 + 1);
      prev = i0; } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  tex.repeat.set(1, 1);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); mesh.receiveShadow = !touch; mesh.renderOrder = -1; scene.add(mesh);
  // s35 (Ben): the FOUNTAIN RING: the same yellow brick all the way round the fountain (r 8.6..11.8, between the basin rim at 7.95 and the
  // plaza), so the four paths read as one path that goes round it; grey edging stones both sides, a hair above the paths where they meet
  { const N = touch ? 72 : 120, rp = [], ru = [], ri = [], y = 0.075; for (let i = 0; i <= N; i++) { const an = i / N * Math.PI * 2, c = Math.cos(an), s = Math.sin(an), u = an * (RING[0] + RING[1]) / 2 / 1.6;
      rp.push(c * RING[0], y + heightAt(c * RING[0], s * RING[0]), s * RING[0], c * RING[1], y + heightAt(c * RING[1], s * RING[1]), s * RING[1]); ru.push(0, u, 1, u); if (i) { const k = (i - 1) * 2; ri.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setAttribute('uv', new THREE.Float32BufferAttribute(ru, 2)); rg.setIndex(ri); rg.computeVertexNormals();
    // s181 (Ben's form: yellow only on the 4 main axes): the ring is the same brick in GREY (pixel-desaturated copy, Safari-safe); ?yellowring=1 = yellow
    let rTex = tex; if (!/[?&]yellowring=1/.test(location.search)) { const gc = document.createElement('canvas'); gc.width = c.width; gc.height = c.height; const gx = gc.getContext('2d'); gx.drawImage(c, 0, 0); const id = gx.getImageData(0, 0, gc.width, gc.height), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2], v = Math.min(255, l * 0.92 + 20); d[i] = v; d[i + 1] = v * 0.98; d[i + 2] = v * 0.95; } gx.putImageData(id, 0, 0);
      rTex = new THREE.CanvasTexture(gc); rTex.colorSpace = THREE.SRGBColorSpace; rTex.wrapS = rTex.wrapT = THREE.RepeatWrapping; rTex.anisotropy = 4; rTex.repeat.copy(tex.repeat); }
    const ring = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ map: rTex, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); ring.receiveShadow = !touch; ring.renderOrder = -1; scene.add(ring);
    const edge = new THREE.MeshLambertMaterial({ color: '#a9a39a', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    for (const [r0, r1] of [[RING[0] - 0.3, RING[0] + 0.05], [RING[1] - 0.05, RING[1] + 0.3]]) { const e = new THREE.Mesh(new THREE.RingGeometry(r0, r1, N, 1), edge); e.rotation.x = -Math.PI / 2; e.position.y = y - 0.012; e.receiveShadow = !touch; scene.add(e); }
    // gaps in the outer edging where the four paths join
    mesh.userData.ring = RING; }
  if (typeof window !== 'undefined') window.__m2yellow = { mesh, verts: pos.length / 3 };
  return { mesh, ring: RING };
}
