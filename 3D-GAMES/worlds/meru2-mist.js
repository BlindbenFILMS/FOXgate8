// MERU 2.0 — exterior polish: FOG + MIST (Ben: "fog + mist only", phone first).
// Soft camera-facing mist banks in the open low places (over the lake, along the shore, the falls plunge pool, the Ruins wilds,
// the hill valleys), 1 instanced draw. Each bank fades out near its foot (no hard line where it meets the ground), near the camera
// and with distance, drifts with the wind (west). Strength follows the time of day: a thin haze at noon, thick at dusk, low at night.
// The scene fog also closes in at dusk + night (setTime). Phone: 46 banks, desktop 130. Never inside Town Square (walls cut sprites).
export function buildMist({ THREE, scene, L, terrainAt = () => 0, touch }) {
  const N = touch ? 46 : 130, R = Math.random, spots = [];
  const inTown = (x, z) => x > -175 && x < 175 && z > -155 && z < 165;
  const nearB = (x, z, m) => L.BUILDINGS.some(b => b.f && x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m);
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };
  const line = [...L.TRAIN.line, L.TRAIN.line[0]];
  const gy = (x, z) => { if (L.inLake(x, z)) { const ir = L.islandR(x, z); return ir < L.ISLAND.c[2] ? Math.max(0.1, L.islandAt(x, z)) : 0.1; } return Math.max(0, terrainAt(x, z)); };
  // [weight, sampler] — each returns [x, z] or null
  const zones = [
    [0.42, () => { const [cx, cz, rx, rz] = L.WATER[0].e, a = R() * 6.283, r = Math.sqrt(R()) * 0.95; const x = cx + Math.cos(a) * rx * r, z = cz + Math.sin(a) * rz * r; return L.inLake(x, z) && L.lakeShoreD(x, z) > 6 ? [x, z] : null; }],
    [0.14, () => { const t = R() * 6.283, [x0, z0] = L.lakeEdge(t), [cx, cz] = L.WATER[0].e.slice(0, 2), dx = cx - x0, dz = cz - z0, dl = Math.hypot(dx, dz) || 1, o = -6 + R() * 18; const x = x0 + dx / dl * o, z = z0 + dz / dl * o; return z > 215 || !inTown(x, z) ? [x, z] : null; }],
    [0.12, () => { const H = L.HILLS.find(h => h.key === 'falls'); if (!H) return null; const x = H.cliff.x + 4 + R() * 26, z = H.c[1] + (R() - 0.5) * 34; return [x, z]; }],
    [0.18, () => { const A = L.WILD.area, x = A[0] + R() * (A[1] - A[0]), z = A[2] + R() * (A[3] - A[2]); return Math.abs(z) > 10 ? [x, z] : null; }],
    [0.14, () => { const H = L.HILLS[(R() * L.HILLS.length) | 0], c = H.c || [(H.a[0] + H.b[0]) / 2, (H.a[1] + H.b[1]) / 2], a = R() * 6.283, r = H.r * (0.75 + R() * 0.45); return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; }],
  ];
  const tot = zones.reduce((a, z) => a + z[0], 0);
  for (let i = 0; i < 6000 && spots.length < N; i++) { let u = R() * tot, Z = zones[0]; for (const z of zones) { if ((u -= z[0]) <= 0) { Z = z; break; } } const p = Z[1](); if (!p) continue; const [x, z] = p;
    if (Math.abs(x) > 445 || Math.abs(z) > 445 || inTown(x, z) || nearB(x, z, 6) || segD(x, z, line) < 8 || spots.some(s => Math.hypot(s[0] - x, s[1] - z) < 9)) continue;
    const w = L.inLake(x, z) ? 18 + R() * 16 : 12 + R() * 12; spots.push([x, z, gy(x, z), w]); }
  // texture: a soft lumpy puff, transparent edges
  const c = document.createElement('canvas'); c.width = c.height = 128; { const g = c.getContext('2d'); for (let k = 0; k < 14; k++) { const x = 30 + R() * 68, y = 44 + R() * 44, r = 18 + R() * 26, q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(255,255,255,0.6)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); }
    const id = g.getImageData(0, 0, 128, 128), d = id.data; for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { const e = Math.min(1, Math.hypot(x - 64, (y - 64) * 1.25) / 62); d[(y * 128 + x) * 4 + 3] *= Math.max(0, 1 - e * e); } g.putImageData(id, 0, 0); }
  const tex = new THREE.CanvasTexture(c);
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 0.42)); geo.instanceCount = spots.length;
  const off = new Float32Array(spots.length * 4); spots.forEach((s, i) => off.set([s[0], s[2], s[1], s[3]], i * 4)); geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4));
  const ph = new Float32Array(spots.length); for (let i = 0; i < ph.length; i++) ph[i] = R() * 100; geo.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 1));
  const U = { uT: { value: 0 }, uAmt: { value: 0.3 }, uCol: { value: new THREE.Color('#eef3f7') }, map: { value: tex }, fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, fog: true,
    vertexShader: `attribute vec4 aOff; attribute float aPh; uniform float uT; varying vec2 vUv; varying float vA; varying float vFoot; varying float vFogDepth;
      void main(){ vUv = uv; float w = aOff.w; vec3 c = vec3(aOff.x + mod(uT * 0.9 + aPh * 7.0, 24.0) - 12.0, aOff.y + w * 0.12 + 0.4, aOff.z + sin(uT * 0.05 + aPh) * 3.0);
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); vec3 up = vec3(0.0, 1.0, 0.0);
        vec3 wp = c + right * position.x * w + up * position.y * w; vFoot = (wp.y - aOff.y) / (w * 0.22);
        vec4 mv = viewMatrix * vec4(wp, 1.0); float dc = -mv.z; vA = smoothstep(4.0, 22.0, dc) * (1.0 - smoothstep(260.0, 420.0, dc)) * (0.75 + 0.25 * sin(uT * 0.3 + aPh));
        vFogDepth = dc; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform float uAmt; uniform vec3 uCol; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; varying vec2 vUv; varying float vA; varying float vFoot; varying float vFogDepth;
      void main(){ vec4 t = texture2D(map, vUv); float a = t.a * vA * uAmt * smoothstep(0.0, 0.9, vFoot); if (a < 0.004) discard; float f = smoothstep(fogNear, fogFar, vFogDepth); gl_FragColor = vec4(mix(uCol, fogColor, f), a); }` });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 3; mesh.name = 'meru2Mist'; scene.add(mesh);
  const cA = new THREE.Color(), cB = new THREE.Color();
  // t: 0 day, 0.5 dusk, 1 night. Haze at noon, thick at dusk, lower at night (moonlit blue)
  function setTime(t) { const k = t < 0.5 ? t * 2 : (t - 0.5) * 2; U.uAmt.value = t < 0.5 ? 0.45 + 0.75 * k : 1.2 - 0.3 * k;
    if (t < 0.5) U.uCol.value.copy(cA.set('#eef3f7').lerp(cB.set('#f6d6c8'), k)); else U.uCol.value.copy(cA.set('#f6d6c8').lerp(cB.set('#7d88b4'), k)); }
  function tick(dt, now) { U.uT.value = now / 1000; if (scene.fog) { U.fogColor.value.copy(scene.fog.color); U.fogNear.value = scene.fog.near; U.fogFar.value = scene.fog.far; } }
  return { tick, setTime, mesh, stats: { banks: spots.length } };
}
