import { plantTrees, plantShrubs, plantTufts, plantFlowers, plantReeds } from './meru2-flora.js';
// MERU 2.0 — step 4: THE FOUR PATHS. buildPaths (built by the blockout): the dressing that makes each path readable and its own
// place — CASTLE PATH stone walls, flame braziers, red banners, castle gate · ARENA PATH orange-trimmed road, torches, stalls,
// bunting, the arena gate · LAKE PATH hedges, lanterns, flowers, timber arch, boardwalk · RUINS PATH purple trim, violet
// lanterns, broken columns, wall fragments, two old arches. These replace the generic path lamps inside the four zones.
// buildPathLife (built by the walk): the people standing on those paths (looks from the old Meru modules, spacing from the
// layout) + the Ruins Path wilds: Meru's cave bats + rats off the path, fought with the shared light combat (engine/combat.js).
const awnT = { value: 0 };
export function buildPaths({ THREE, scene, toon, CT, L, touch, avoid = () => false }) {
  const root = new THREE.Group(); root.name = 'meru2Paths'; scene.add(root);
  const V = (x, y, z) => new THREE.Vector3(x, y, z), Q = new THREE.Quaternion(), E = new THREE.Euler(), M4 = new THREE.Matrix4();
  const rnd = (() => { let s = 90210; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const SPK = L.SPEAKERS.filter(s => Array.isArray(s.at)).map(s => s.at);
  const nearSpk = (x, z, r) => SPK.some(a => Math.hypot(a[0] - x, a[1] - z) < r);
  const bld = (x, z, m) => L.BUILDINGS.some(b => x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m);
  const colliders = [], flames = [], glow = { warm: [], violet: [] }, banners = [], batches = new Map(), pools = [];   // pools: [x, z, radius, colour, flame index or -1]
  const rect = (x0, x1, z0, z1) => colliders.push({ f: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] }), ring = (x, z, r) => colliders.push({ c: [x, z, r] });
  const ink = toon('#201e1d'), wood = toon('#9a7550'), woodD = toon('#5e4329'), iron = toon('#3a3634'), red = toon('#ec3013'), orange = toon('#ff8a1a'), hedgeM = toon('#4f7a3a'), violet = toon('#7c4dcc');
  // step 10 pass 5: CUT STONE (world-mapped ashlar canvas texture, so scaled boxes keep real-size blocks), ground grime, MOSS on tops + feet (Ruins heavy)
  const ashlar = (base, rows, cols, seed, crack) => { const t = CT(256, 256, (g, w, h) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; g.fillStyle = '#5f5a54'; g.fillRect(0, 0, w, h); const rh = h / rows, bw = w / cols;
      for (let y = 0; y < rows; y++) { const off = (y % 2) * bw / 2; for (let x = -1; x < cols + 1; x++) { const c = new THREE.Color(base).offsetHSL(0, (r() - 0.5) * 0.04, (r() - 0.5) * 0.12); g.fillStyle = '#' + c.getHexString(); const x0 = x * bw + off + 2, y0 = y * rh + 2; g.fillRect(x0, y0, bw - 4, rh - 4);
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x0, y0, bw - 4, 2); g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(x0, y0 + rh - 8, bw - 4, 4);
        for (let k = 0; k < 16; k++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '0,0,0' : '255,255,255') + ',' + (0.05 + r() * 0.08) + ')'; g.fillRect(x0 + r() * (bw - 8), y0 + r() * (rh - 8), 2 + r() * 7, 2 + r() * 4); } } }
      for (let k = 0; k < crack; k++) { g.strokeStyle = 'rgba(30,25,20,0.5)'; g.lineWidth = 1.3; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let q = 0; q < 5; q++) { x += (r() - 0.5) * 30; y += r() * 18; g.lineTo(x, y); } g.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const worldMat = (tex, scale, moss) => { const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
    m.onBeforeCompile = sh => { sh.uniforms.uSt = { value: tex }; sh.uniforms.uSc = { value: scale }; sh.uniforms.uMoss = { value: moss };
      sh.vertexShader = 'varying vec3 vWP; varying vec3 vWN;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 q = vec4(transformed, 1.0); vec3 n = objectNormal;\n#ifdef USE_INSTANCING\nq = instanceMatrix * q; n = mat3(instanceMatrix) * n;\n#endif\nvWP = (modelMatrix * q).xyz; vWN = normalize(mat3(modelMatrix) * n); }');
      sh.fragmentShader = 'uniform sampler2D uSt; uniform float uSc; uniform float uMoss; varying vec3 vWP; varying vec3 vWN;\nfloat hh(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }\nfloat vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hh(i), hh(i + vec2(1.0, 0.0)), f.x), mix(hh(i + vec2(0.0, 1.0)), hh(i + vec2(1.0, 1.0)), f.x), f.y); }\n'
        + sh.fragmentShader.replace('#include <map_fragment>', '{ vec3 an = abs(vWN); vec2 uv = an.y > max(an.x, an.z) ? vWP.xz : (an.x > an.z ? vWP.zy : vWP.xy); diffuseColor.rgb *= texture2D(uSt, uv * uSc).rgb * 1.35;\n float nz = vn(vWP.xz * 0.9 + vWP.y * 0.7) * 0.6 + vn(vWP.xz * 3.1 - vWP.y * 2.3) * 0.4; diffuseColor.rgb *= 1.0 - (1.0 - smoothstep(0.0, 1.2, vWP.y)) * 0.25;\n float ms = uMoss * clamp(smoothstep(0.45, 0.9, vWN.y) * 0.9 + (1.0 - smoothstep(0.0, 0.9, vWP.y)) * 0.8, 0.0, 1.0) * smoothstep(0.3, 0.55, nz); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.4, 0.14) * (0.8 + nz * 0.4), ms); }'); };
    m.customProgramCacheKey = () => 'wstone' + scale + moss + tex.uuid; return m; };
  const stone = worldMat(ashlar('#c9c1b4', 4, 3, 11, 2), 1 / 2.4, 0.15), stoneD = worldMat(ashlar('#a39a8c', 4, 3, 23, 3), 1 / 2.4, 0.2), rStone = worldMat(ashlar('#d2c9bd', 3, 2, 37, 9), 1 / 2.2, 1.0), rStoneD = worldMat(ashlar('#b4aa9c', 3, 2, 51, 10), 1 / 2.2, 1.0);
  const hsh = (a, b) => { const s = Math.sin(Math.round(a * 1000) * 12.9898 + Math.round(b * 1000) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffa23a }), lampWarm = new THREE.MeshBasicMaterial({ color: 0xffe2a0 }), lampViolet = new THREE.MeshBasicMaterial({ color: 0xc9a6ff });
  const UB = new THREE.BoxGeometry(1, 1, 1);
  const put = (key, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0, rz = 0) => { let b = batches.get(key); if (!b) batches.set(key, b = { geo, mat, list: [] }); b.list.push([x, y, z, sx, sy, sz, ry, rz]); };
  const box = (w, h, d, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(UB, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = !touch; m.receiveShadow = true; root.add(m); return m; };
  const sign = (txt, w, h, bg, fg, x, y, z, ry) => { const t = CT(512, 96, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 64px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 22, H / 2 + 3, W - 44); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  const trees = [], tryTree = (x, z) => { if (avoid(x, z, 3) || nearSpk(x, z, 5) || bld(x, z, 3) || L.PATHS.some(p => segD(x, z, p.p) < 10) || L.ROADS.some(r => segD(x, z, r.p) < r.w / 2 + 3) || trees.some(([a, b]) => Math.hypot(a - x, b - z) < 4.5) || segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) < 8.5) return; const s = 0.85 + rnd() * 0.6; trees.push([x, z, s]); ring(x, z, 0.45 * s); };
  const free = (x, z, r = 1.5) => !avoid(x, z, r) && !nearSpk(x, z, 2.5) && !bld(x, z, 1) && segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) > r + 1.4;   // overlap audit: nothing through the train pylons
  const bowlG = new THREE.CylinderGeometry(0.45, 0.25, 0.35, 10).translate(0, 0.17, 0), cupG = new THREE.CylinderGeometry(0.2, 0.12, 0.25, 8).translate(0, 0.12, 0), poleG = new THREE.CylinderGeometry(0.08, 0.11, 2.6, 6).translate(0, 1.3, 0), roofG = new THREE.ConeGeometry(0.34, 0.3, 4).translate(0, 0.15, 0), colG = (() => { const g = new THREE.CylinderGeometry(0.55, 0.62, 1, 24, 3), P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), r = Math.hypot(x, z); if (r > 0.05) { const k = 1 - 0.06 * (0.5 + 0.5 * Math.cos(Math.atan2(z, x) * 20)); P.setX(i, x * k); P.setZ(i, z * k); } if (y > 0.49) P.setY(i, y - hsh(x, z) * 0.14); } return g; })();
  const COVER = [[-30, 30, -330, -140], [160, 362, -32, 32], [-30, 30, 156, 216], [-402, -240, -40, 40]];

  // ---------- CASTLE PATH [meruCastlePath]: walls with gaps, flame braziers, red banners, the castle gate ----------
  for (const sx of [-1, 1]) for (let z0 = -150; z0 > -314; z0 -= 40) { const z1 = Math.max(z0 - 34, -314), x = sx * 9.5, cz = (z0 + z1) / 2, len = z0 - z1; put('wall', UB, stone, x, 0.5, cz, 0.6, 1.0, len); put('wallCap', UB, stoneD, x, 1.07, cz, 0.8, 0.14, len + 0.1); for (const pz of [z0 - 0.45, cz, z1 + 0.45]) put('pier', UB, stoneD, x, 0.64, pz, 0.9, 1.28, 0.9); rect(x - 0.35, x + 0.35, z1, z0); }
  for (let z = -152; z >= -314; z -= 14) for (const sx of [-1, 1]) { const x = sx * 7.2; if (!free(x, z)) continue; put('plinth', UB, stone, x, 0.55, z, 0.7, 1.1, 0.7); put('bowl', bowlG, iron, x, 1.1, z); flames.push([x, 1.3, z, 1]); glow.warm.push([x, 1.8, z]); pools.push([x, z, 6.5, 0xff9a3a, flames.length - 1]); ring(x, z, 0.5); }
  { const clothT = CT(128, 256, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#e6b45a'; g.fillRect(0, 18, w, 10); g.fillRect(0, h - 30, w, 10); g.font = '900 110px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, h / 2 + 6); });
    const clothM = new THREE.MeshToonMaterial({ map: clothT, gradientMap: toon('#fff').gradientMap, side: THREE.DoubleSide }), clothG = new THREE.PlaneGeometry(1.2, 2.6).translate(0.62, 0, 0);
    for (let z = -164; z > -312; z -= 28) for (const sx of [-1, 1]) { const x = sx * 11.5; if (!free(x, z)) continue; put('bPole', new THREE.CylinderGeometry(0.07, 0.09, 6.2, 6).translate(0, 3.1, 0), ink, x, 0, z); const p = new THREE.Group(); p.position.set(x, 4.5, z); root.add(p); const c = new THREE.Mesh(clothG, clothM); c.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2; p.add(c); banners.push({ p, ph: rnd() * 6, base: 0 }); ring(x, z, 0.3); }
    // art pass 5 extra: long red banners hung on the south face of both castle gate towers, from an iron rod under the merlons
    const towerG = new THREE.PlaneGeometry(1.5, 1.9); for (const sx of [-1, 1]) { const x = sx * 8.3, z = -318 + 1.36; put('tRod', UB, ink, x, 7.05, z + 0.06, 1.9, 0.08, 0.08); const c = new THREE.Mesh(towerG, clothM); c.position.set(x, 6.08, z + 0.04); root.add(c); } }
  { const z = -318; for (const sx of [-1, 1]) { const x = sx * 8.3; box(2.6, 7.4, 2.6, stone, x, 3.7, z); for (const ox of [-0.95, 0.95]) for (const oz of [-0.95, 0.95]) put('tMerl', UB, stoneD, x + ox, 7.9, z + oz, 0.7, 0.8, 0.7); put('tCorb', UB, stoneD, x, 7.3, z, 3.0, 0.3, 3.0); for (const sy of [2.8, 5.4]) put('slit', UB, ink, x, sy, z + 1.31, 0.16, 0.9, 0.04); rect(x - 1.3, x + 1.3, z - 1.3, z + 1.3);
      put('gArm', UB, ink, x, 4.95, z + 1.55, 0.12, 0.12, 0.5); put('gLant', UB, lampWarm, x, 4.55, z + 1.75, 0.5, 0.7, 0.5); put('gCap', UB, ink, x, 5.0, z + 1.75, 0.66, 0.12, 0.66); glow.warm.push([x, 4.55, z + 1.75]); pools.push([x, z + 4, 7.5, 0xffc070, -1]); }
    box(19.2, 1.5, 2.4, stone, 0, 7.15, z); box(19.3, 0.45, 2.5, red, 0, 6.35, z); for (let mx = -5.6; mx <= 5.61; mx += 1.6) put('merl', UB, stone, mx, 8.25, z, 0.8, 0.7, 2.3);
    for (let bx = -6.6; bx <= 6.61; bx += 0.55) put('pcV', UB, iron, bx, 5.25, z, 0.09, 1.75, 0.09); for (const by of [4.7, 5.3, 5.9]) put('pcH', UB, iron, 0, by, z, 13.4, 0.09, 0.09); sign('MERU CASTLE', 8, 1.3, '#201e1d', '#ffd23a', 0, 7.2, z + 1.25, 0); }
  for (let i = 0; i < (touch ? 30 : 56); i++) { const sx = rnd() < 0.5 ? -1 : 1; tryTree(sx * (16 + rnd() * 13), -158 - rnd() * 150); }

  // ---------- ARENA PATH [meruArenaPath]: orange-trimmed road, torches, stalls, bunting over the clearings, the arena gate ----------
  for (const sz of [-1, 1]) put('trimO', UB, orange, 263, 0.03, sz * 5.2, 194, 0.06, 0.5);
  for (const cx of [180, 260, 340]) { for (const sz of [-1, 1]) put('trimO', UB, orange, cx, 0.03, sz * 20, 40, 0.06, 0.6); if (cx > 180) put('trimO', UB, orange, cx - 20, 0.03, 0, 0.6, 0.06, 40); put('trimO', UB, orange, cx + 20, 0.03, 0, 0.6, 0.06, 40); }
  for (let x = 170; x <= 356; x += 10) for (const sz of [-1, 1]) { const z = sz * 7; if (!free(x, z)) continue; put('tPole', poleG, woodD, x, 0, z); put('tCup', cupG, iron, x, 2.6, z); flames.push([x, 2.78, z, 0.6]); glow.warm.push([x, 3.1, z]); pools.push([x, z, 4.8, 0xffa040, flames.length - 1]); ring(x, z, 0.25); }
  const GI = { crate: new THREE.BoxGeometry(0.62, 0.22, 0.46).translate(0, 0.11, 0), ball: new THREE.IcosahedronGeometry(0.1, 1), pie: new THREE.CylinderGeometry(0.2, 0.17, 0.07, 14).translate(0, 0.035, 0), spool: new THREE.CylinderGeometry(0.07, 0.07, 0.24, 10).rotateZ(Math.PI / 2),
    fish: new THREE.IcosahedronGeometry(0.1, 1).scale(2.6, 0.55, 0.9), jar: new THREE.CylinderGeometry(0.09, 0.11, 0.24, 10).translate(0, 0.12, 0), bucket: new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12).translate(0, 0.15, 0), barrel: new THREE.CylinderGeometry(0.34, 0.34, 0.9, 12).translate(0, 0.45, 0) };
  const GL = [], gi = (k, x, y, z, c, ry = 0) => GL.push([k, x, y, z, c, ry]), stallFl = [];
  { const GOODS = { ribbons: ['#c42d3c', '#38bdf8', '#e6b45a'], pies: ['#c98a3c', '#a86a2a', '#e0b06a'], flowers: ['#f472b6', '#facc15', '#c084fc'], fruit: ['#ef4444', '#f59e0b', '#84cc16'], fish: ['#9fb6c8', '#7d95a8', '#c4d2dc'], wares: ['#ffd23a', '#f3f2f2', '#201e1d'] };
    const canopyM = new THREE.MeshToonMaterial({ gradientMap: toon('#fff').gradientMap, vertexColors: true, side: THREE.DoubleSide });
    // breeze: the fabric ripples, more toward the eaves + on the hanging valance (uT shared with the tick)
    canopyM.onBeforeCompile = sh => { sh.uniforms.uT = awnT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wq = modelMatrix * vec4(position, 1.0); float e = clamp(1.0 - position.y / 0.55, 0.0, 1.6); float gust = 0.6 + 0.4 * sin(uT * 0.8 + wq.x * 0.05);
      transformed.y += e * gust * 0.05 * sin(position.x * 3.0 - uT * 6.0 + wq.z); transformed.z += step(position.y, -0.02) * gust * 0.07 * sin(position.x * 4.0 - uT * 7.5 + wq.x);`); };
    const canopyGeo = (col, w, d, rise) => { const P = [], C = [], A = new THREE.Color(col), Bc = new THREE.Color('#f3f2f2'), hw = w / 2, hd = d / 2, n = 8, sw = w / n;
      const tri = (p, q, r, c) => { P.push(...p, ...q, ...r); for (let k = 0; k < 3; k++) C.push(c.r, c.g, c.b); }, quad = (p, q, r, t, c) => { tri(p, q, r, c); tri(p, r, t, c); };
      for (let i = 0; i < n; i++) { const x0 = -hw + i * sw, x1 = x0 + sw, xm = (x0 + x1) / 2, c = i % 2 ? Bc : A;
        for (const sz of [-1, 1]) { const e = sz * hd; quad([x0, rise, 0], [x1, rise, 0], [x1, 0, e], [x0, 0, e], c);
          quad([x0, 0, e], [x1, 0, e], [x1, -0.12, e], [x0, -0.12, e], c); tri([x0, -0.12, e], [x1, -0.12, e], [xm, -0.32, e], c); } }
      for (const sx of [-1, 1]) tri([sx * hw, 0, hd], [sx * hw, 0, -hd], [sx * hw, rise, 0], A);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; };
    const stall = (kx, kz, col, goods) => { const dir = kz < 0 ? 1 : -1, cz = kz + dir * 1.6, zc = (cz + dir * 0.45 + kz - dir * 1.25) / 2;
      box(3.2, 1.0, 0.8, wood, kx, 0.5, cz); box(3.4, 0.08, 1.0, toon(col), kx, 1.04, cz); box(3.4, 1.8, 0.1, woodD, kx, 0.9, kz - dir * 1.25);
      for (const ox of [-1.65, 1.65]) for (const oz of [cz + dir * 0.45, kz - dir * 1.25]) put('sPost', UB, woodD, kx + ox, 1.35, oz, 0.12, 2.7, 0.12);
      { const cn = new THREE.Mesh(canopyGeo(col, 3.8, 3.8, 0.55), canopyM); cn.position.set(kx, 2.72, zc); cn.castShadow = !touch; root.add(cn); put('ridge', UB, woodD, kx, 3.28, zc, 3.9, 0.07, 0.07); for (const ox of [-1.95, 1.95]) put('ridge', UB, woodD, kx + ox, 3.38, zc, 0.06, 0.24, 0.06); }   // pass 7+: a real pitched market awning (stripes run down both slopes, scalloped valance front + back, fabric gable ends)
      const cs = GOODS[goods], Y = 1.08; // step 10 pass 5: real goods on every counter
      for (let i = 0; i < 3; i++) { const sx = kx - 1.05 + i * 1.05, c = cs[i];
        if (goods === 'ribbons') for (let j = 0; j < 4; j++) for (let q = 0; q < 2; q++) gi('spool', sx - 0.14 + q * 0.28, Y + 0.07, cz - 0.15 + j * 0.1, cs[(i + j) % 3]);
        else if (goods === 'pies') { gi('pie', sx - 0.2, Y, cz - 0.08, c); gi('pie', sx + 0.2, Y, cz + 0.06, c); gi('pie', sx - 0.2, Y + 0.07, cz - 0.08, cs[(i + 1) % 3]); }
        else if (goods === 'flowers') for (const ox of [-0.22, 0.22]) { gi('bucket', sx + ox, Y, cz, '#6b7278'); stallFl.push([sx + ox, Y + 0.24, cz, 0.85]); }
        else if (goods === 'fruit' || goods === 'fish') { gi('crate', sx, Y, cz, goods === 'fish' ? '#dfeef4' : '#9a7550'); if (goods === 'fruit') { for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) gi('ball', sx - 0.2 + a * 0.2, Y + 0.3, cz - 0.1 + b * 0.2, c); gi('ball', sx - 0.1, Y + 0.45, cz, c); gi('ball', sx + 0.1, Y + 0.45, cz, c); } else for (let j = 0; j < 4; j++) gi('fish', sx, Y + 0.26, cz - 0.15 + j * 0.1, c, (j % 2) * 0.3); }
        else for (let j = 0; j < 4; j++) gi('jar', sx - 0.3 + j * 0.2, Y, cz + (j % 2) * 0.12 - 0.06, cs[(i + j) % 3]); }
      for (const ox of [-2.3, 2.3]) if (free(kx + ox, cz, 0.5)) { gi('barrel', kx + ox, 0, cz - dir * 0.2, '#7a5a3a'); ring(kx + ox, cz - dir * 0.2, 0.4); }
      rect(kx - 1.8, kx + 1.8, cz + dir * 0.5, kz - dir * 1.35); };
    stall(180, -24, '#c42d3c', 'ribbons'); stall(220, -24, '#e6b45a', 'pies'); stall(260, -24, '#c084fc', 'flowers'); stall(200, 26, '#4ade80', 'fruit'); stall(240, 26, '#7dd3fc', 'fish'); stall(270, 12, '#ff8a1a', 'wares'); stall(330, -10, '#ec3013', 'wares');
    box(2.6, 1.7, 0.12, ink, 290, 1.65, -12.6); for (const ox of [-1.1, 1.1]) put('sPost', UB, woodD, 290 + ox, 0.8, -12.6, 0.12, 1.6, 0.12); sign('ODDS', 2.2, 0.5, '#201e1d', '#ffd23a', 290, 2.2, -12.52, 0); rect(288.6, 291.4, -12.9, -12.3); }
  { const byK = {}; for (const q of GL) (byK[q[0]] || (byK[q[0]] = [])).push(q); const gm = new THREE.MeshLambertMaterial(), c = new THREE.Color();
    for (const k in byK) { const L = byK[k], im = new THREE.InstancedMesh(GI[k], gm, L.length); L.forEach(([, x, y, z, col, ry], i) => { M4.compose(V(x, y, z), Q.setFromEuler(E.set(0, ry, 0)), V(1, 1, 1)); im.setMatrixAt(i, M4); im.setColorAt(i, c.set(col)); }); im.castShadow = !touch && k === 'barrel'; im.receiveShadow = true; root.add(im); }
    if (stallFl.length) root.add(plantFlowers(stallFl)); }
  { const flagG = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([-0.32, 0, 0, 0.32, 0, 0, 0, -0.62, 0], 3)); flagG.computeVertexNormals();
    const pts = []; for (const cx of [180, 260, 340]) for (const ox of [-10, 10]) { const x = cx + ox; for (const sz of [-1, 1]) { put('bunPole', UB, woodD, x, 2.9, sz * 19, 0.16, 5.8, 0.16); ring(x, sz * 19, 0.25); } for (let i = 0; i < 15; i++) { const z = -17.5 + i * 2.5, sag = 5.6 - 0.9 * (1 - ((z / 18) ** 2)); pts.push([x, sag, z]); } }
    for (let i = 0; i < pts.length - 1; i++) { if (i % 15 === 14) continue; const [ax, ay, az] = pts[i], [, by, bz] = pts[i + 1], dy = by - ay, dz = bz - az; put('bunLine', UB, ink, ax, (ay + by) / 2 + 0.01, (az + bz) / 2, Math.hypot(dy, dz) + 0.02, 0.025, 0.025, Math.PI / 2, Math.atan2(-dy, dz)); }
    const COLS = ['#ec3013', '#ffd23a', '#38bdf8', '#f3f2f2', '#ff8a1a'], fm = new THREE.InstancedMesh(flagG, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), pts.length), c = new THREE.Color();
    pts.forEach(([x, y, z], i) => { M4.compose(V(x, y, z), Q.setFromEuler(E.set(0, Math.PI / 2, 0)), V(1, 1, 1)); fm.setMatrixAt(i, M4); fm.setColorAt(i, c.set(COLS[i % COLS.length])); }); root.add(fm); }
  { const x = 360; for (const sz of [-1, 1]) { const z = sz * 9.2; box(2.2, 8, 2.2, stone, x, 4, z); box(2.3, 0.5, 2.3, orange, x, 5.5, z); box(2.3, 0.5, 2.3, orange, x, 1.2, z); rect(x - 1.1, x + 1.1, z - 1.1, z + 1.1);
      put('gArm', UB, ink, x - 1.35, 4.65, z, 0.5, 0.12, 0.12); put('gLant', UB, lampWarm, x - 1.55, 4.25, z, 0.5, 0.7, 0.5); put('gCap', UB, ink, x - 1.55, 4.7, z, 0.66, 0.12, 0.66); glow.warm.push([x - 1.55, 4.25, z]); pools.push([x - 4, z * 0.7, 7.5, 0xffb060, -1]); }
    box(2.4, 1.8, 20.6, stone, x, 8.9, 0); box(2.5, 0.4, 20.7, orange, x, 7.9, 0); sign('MERU ARENA', 10, 1.5, '#201e1d', '#ff8a1a', x - 1.22, 8.95, 0, -Math.PI / 2); }
  for (let i = 0; i < (touch ? 18 : 34); i++) { const sx = 168 + rnd() * 188, sz = (rnd() < 0.5 ? -1 : 1) * (31 + rnd() * 14); tryTree(sx, sz); }

  // ---------- LAKE PATH [meruLakePath]: hedges with gaps, warm lanterns, flowers, a timber arch, the boardwalk ----------
  { const fl = []; for (const sx of [-1, 1]) for (const [z0, z1] of [[160, 172], [176, 188], [192, 204]]) { const x = sx * 6; if (avoid(x, (z0 + z1) / 2, 1)) continue; put('hedge', UB, hedgeM, x, 0.55, (z0 + z1) / 2, 1.2, 1.1, z1 - z0); rect(x - 0.6, x + 0.6, z0, z1); for (let z = z0 + 0.6; z < z1; z += 1.2) fl.push([sx * 5.15, z]); }
    root.add(plantFlowers(fl.map(([x, z]) => [x, 0, z, 1.15]))); }
  for (let z = 161; z <= 209; z += 12) for (const sx of [-1, 1]) { const x = sx * 4.2; if (!free(x, z, 1)) continue; put('lPost', UB, woodD, x, 1.2, z, 0.18, 2.4, 0.18); put('lHead', UB, lampWarm, x, 2.6, z, 0.36, 0.42, 0.36); put('lRoof', roofG, ink, x, 2.8, z); glow.warm.push([x, 2.6, z]); pools.push([x, z, 5, 0xffd890, -1]); ring(x, z, 0.25); }
  { const z = 212; for (const sx of [-1, 1]) { box(0.5, 4.6, 0.5, wood, sx * 3.6, 2.3, z); rect(sx * 3.6 - 0.25, sx * 3.6 + 0.25, z - 0.25, z + 0.25); } for (const sx of [-1, 1]) { put('lHead', UB, lampWarm, sx * 3.6, 3.5, z - 0.38, 0.3, 0.38, 0.22); glow.warm.push([sx * 3.6, 3.5, z - 0.45]); } pools.push([0, z, 6.5, 0xffd890, -1]);
    box(8.6, 0.6, 0.7, woodD, 0, 4.6, z); sign('THE LAKE', 4.6, 0.9, '#f3f2f2', '#201e1d', 0, 3.85, z - 0.3, Math.PI); }
  { const t = CT(64, 256, (g, w, h) => { g.fillStyle = '#b08b5e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(60,40,20,0.35)'; for (let y = 0; y < h; y += 10) g.fillRect(0, y, w, 1.5); }); t.dispose(); // step 10 pass 5: real planks (gaps, tone + height jitter) on two edge beams
    { const zs = []; for (let z = 214.2; z <= 237.8; z += 0.31) zs.push(z); const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(5.0, 0.07, 0.27), new THREE.MeshLambertMaterial(), zs.length), c = new THREE.Color(); zs.forEach((z, i) => { M4.compose(V((rnd() - 0.5) * 0.08, 0.05 + rnd() * 0.015, z), Q.setFromEuler(E.set(0, (rnd() - 0.5) * 0.012, 0)), V(1, 1, 1)); pm.setMatrixAt(i, M4); pm.setColorAt(i, c.setHSL(0.08 + rnd() * 0.02, 0.32 + rnd() * 0.1, 0.42 + rnd() * 0.1)); }); pm.receiveShadow = true; root.add(pm);
      for (const sx of [-1, 1]) put('bwEdge', UB, woodD, sx * 2.56, 0.04, 226, 0.14, 0.09, 24); }
    for (let z = 217; z <= 235; z += 6) for (const sx of [-1, 1]) { const x = sx * 2.75; put('bol', UB, woodD, x, 0.35, z, 0.22, 0.7, 0.22); put('bolT', UB, lampWarm, x, 0.74, z, 0.26, 0.1, 0.26); pools.push([x * 0.6, z, 3, 0xffd890, -1]); ring(x, z, 0.15); } }
  for (let i = 0; i < (touch ? 14 : 26); i++) { const sx = rnd() < 0.5 ? -1 : 1; tryTree(sx * (12 + rnd() * 16), 160 + rnd() * 46); }
  { const rd = []; for (let x = -62; x <= 62; x += 0.9 + rnd() * 1.4) { if (Math.abs(x) < 4.5 || rnd() < 0.2) continue; const zs = 345 - 105 * Math.sqrt(1 - (x / 320) ** 2); for (let k = 0; k < 2; k++) rd.push([x + (rnd() - 0.5) * 0.8, 0, zs + 0.2 + rnd() * 2.4, 0.8 + rnd() * 0.5]); } root.add(plantReeds(rd.slice(0, touch ? 70 : 160))); }   // step 10 pass 5

  const colsAt = [];
  // ---------- RUINS PATH [meruRuinsPath]: purple trim, violet lanterns, broken columns + walls, two old arches ----------
  for (const sz of [-1, 1]) put('trimV', UB, violet, -322.5, 0.03, sz * 6.3, 155, 0.06, 0.45);
  for (let x = -248; x >= -398; x -= 12) for (const sz of [-1, 1]) { const z = sz * 8.5; if (!free(x, z, 1.5)) continue; put('vPil', UB, rStone, x, 0.9, z, 0.7, 1.8, 0.7); put('vCap', UB, lampViolet, x, 2.0, z, 0.5, 0.4, 0.5); put('vTop', UB, rStoneD, x, 2.28, z, 0.8, 0.16, 0.8); glow.violet.push([x, 2.0, z]); pools.push([x, z, 5.5, 0x9a6cff, -1]); rect(x - 0.35, x + 0.35, z - 0.35, z + 0.35); }
  for (let i = 0, n = 0; i < 60 && n < 20; i++) { const x = -258 - rnd() * 136, sz = rnd() < 0.5 ? -1 : 1, z = sz * (11 + rnd() * 13); if (!free(x, z, 2.5) || nearSpk(x, z, 6) || bld(x, z, 3)) continue; n++; colsAt.push([x, z]);
    if (n % 3 === 0) { const ry = rnd() * Math.PI; put('col', colG, rStone, x, 0.58, z, 1, 3.2, 1, ry, Math.PI / 2); ring(x, z, 1.3); } else { const h = 1.4 + rnd() * 3.8; put('col', colG, rStone, x, h / 2, z, 1, h, 1); put('colBase', UB, rStoneD, x, 0.2, z, 1.55, 0.4, 1.55); if (h > 3) put('colCap', UB, rStoneD, x, h + 0.12, z, 1.4, 0.3, 1.4); ring(x, z, 0.7); } }
  for (let i = 0, n = 0; i < 30 && n < 7; i++) { const x = -262 - rnd() * 130, z = (rnd() < 0.5 ? -1 : 1) * (15 + rnd() * 10), w = 4 + rnd() * 3, h = 0.9 + rnd() * 1.6, along = rnd() < 0.6; if (!free(x, z, w / 2 + 1) || nearSpk(x, z, 7) || bld(x, z, 4)) continue; n++;
    put('ruinWall', UB, rStoneD, x, h / 2, z, along ? w : 0.8, h, along ? 0.8 : w); put('ruinTop', UB, rStone, x + (along ? w * 0.2 : 0), h + 0.25, z + (along ? 0 : w * 0.2), along ? w * 0.4 : 0.8, 0.5, along ? 0.8 : w * 0.4); if (along) rect(x - w / 2, x + w / 2, z - 0.4, z + 0.4); else rect(x - 0.4, x + 0.4, z - w / 2, z + w / 2); }
  for (const [x, whole] of [[-300, true], [-360, false]]) { for (const sz of [-1, 1]) { const z = sz * 7.6; box(1.6, 6.2, 1.6, rStone, x, 3.1, z); rect(x - 0.8, x + 0.8, z - 0.8, z + 0.8); }
    if (whole) { box(1.8, 1.2, 16.8, rStone, x, 6.8, 0); box(1.85, 0.3, 16.85, violet, x, 6.1, 0); put('chain', UB, ink, x, 5.7, 0, 0.05, 0.5, 0.05); put('vCap', UB, lampViolet, x, 5.15, 0, 0.45, 0.6, 0.45); put('vTop', UB, rStoneD, x, 5.5, 0, 0.6, 0.1, 0.6); glow.violet.push([x, 5.15, 0]); pools.push([x, 0, 7.5, 0x9a6cff, -1]); } else { box(1.8, 1.2, 7.2, rStone, x, 6.8, -4.6); const f = box(1.8, 1.2, 5, rStoneD, x + 3, 0.6, 11.5, 0.6); f.rotation.z = 0.08; rect(x + 1, x + 5, 9.5, 13.5); } }

  // step 10 pass 5: RUBBLE round the columns + along the Ruins Path verges, grass tufts in the cracks
  { const rubG = new THREE.DodecahedronGeometry(1, 0), tf = []; for (let i = 0, n = 0; i < 1500 && n < (touch ? 80 : 180); i++) { let x, z; if (colsAt.length && rnd() < 0.55) { const c = colsAt[Math.floor(rnd() * colsAt.length)], a = rnd() * 6.28, d = 1 + rnd() * 2.6; x = c[0] + Math.sin(a) * d; z = c[1] + Math.cos(a) * d; } else { x = -252 - rnd() * 146; z = (rnd() < 0.5 ? -1 : 1) * (7.4 + rnd() * 18); }
      if (Math.abs(z) < 7.2 || !free(x, z, 0.3) || nearSpk(x, z, 3)) continue; n++; const s = 0.1 + rnd() ** 2 * 0.42; put('rubble', rubG, rStoneD, x, s * 0.35, z, s * (0.8 + rnd() * 0.6), s * 0.7, s * (0.8 + rnd() * 0.6), rnd() * 6, rnd() * 0.5); if (rnd() < 0.5) tf.push([x + (rnd() - 0.5) * 1.2, 0, z + (rnd() - 0.5) * 1.2, 0.7 + rnd() * 0.6]); }
    for (const [x, z] of colsAt) for (let k = 0; k < 5; k++) { const a = rnd() * 6.28; tf.push([x + Math.sin(a) * 0.95, 0, z + Math.cos(a) * 0.95, 0.8 + rnd() * 0.5]); }
    root.add(plantTufts(tf.slice(0, touch ? 120 : 320))); }
  // ---------- build the batches ----------
  for (const [key, b] of batches) { const im = new THREE.InstancedMesh(b.geo, b.mat, b.list.length); b.list.forEach(([x, y, z, sx, sy, sz, ry, rz], i) => { M4.compose(V(x, y, z), Q.setFromEuler(E.set(0, ry, rz)), V(sx, sy, sz)); im.setMatrixAt(i, M4); }); im.castShadow = !touch && !/trim/.test(key); im.receiveShadow = true; root.add(im); }
  // step 10 pass 3: real trees (meru2-flora.js) — Castle Path pines + oaks, Lake Path birches + poplars, Arena Path mixed; hedges get a leafy shrub crown
  { const rh = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
    root.add(plantTrees(trees.map(([x, z, s]) => { const r = rh(x, z); return [x, 0, z, s, z < -150 ? (r < 0.5 ? 'pine' : r < 0.8 ? 'broad' : 'lime') : z > 150 ? (r < 0.4 ? 'birch' : r < 0.7 ? 'broad' : 'poplar') : (r < 0.45 ? 'broad' : r < 0.7 ? 'lime' : r < 0.85 ? 'birch' : 'pine')]; }), { shadow: !touch }).group);
    const hb = batches.get('hedge'), hs = []; if (hb) for (const [x, y, z, sx, sy, sz] of hb.list) for (let q = z - sz / 2 + 0.5; q < z + sz / 2 - 0.3; q += 0.9) hs.push([x + (rh(q, x) - 0.5) * 0.15, 0.32, q, 0.72 + rh(x, q) * 0.12]); if (hs.length) root.add(plantShrubs(hs)); }
  const flameI = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.62, 7).translate(0, 0.31, 0), flameM, flames.length); root.add(flameI);
  const glowTex = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const pts = (list, col, size) => { const p = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(list.flat(), 3)), new THREE.PointsMaterial({ map: glowTex, color: col, size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); p.visible = false; root.add(p); return p; };
  const glowW = pts(glow.warm, 0xffc070, 4.5), glowV = pts(glow.violet, 0xb48cff, 4);
  const poolT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,0.55)'); r.addColorStop(0.45, 'rgba(255,255,255,0.22)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const poolI = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), pools.length);
  { const c = new THREE.Color(); pools.forEach(([x, z, r, col], i) => { M4.compose(V(x, 0.09, z), Q.identity(), V(r, 1, r)); poolI.setMatrixAt(i, M4); poolI.setColorAt(i, c.set(col)); }); poolI.renderOrder = 2; poolI.visible = false; root.add(poolI); }
  let T = 0, night = false; awnT.value = 0;
  function tick(dt) { T += dt; awnT.value = T; flames.forEach(([x, y, z, s], i) => { const k = s * (0.85 + 0.22 * Math.sin(T * 9 + i * 1.7) + 0.08 * Math.sin(T * 23 + i)); M4.compose(V(x, y, z), Q.identity(), V(s * (0.9 + 0.1 * Math.sin(T * 13 + i)), k, s)); flameI.setMatrixAt(i, M4); }); flameI.instanceMatrix.needsUpdate = true;
    if (night) { pools.forEach(([x, z, r, , f], i) => { if (f < 0) return; const k = r * (0.92 + 0.07 * Math.sin(T * 9 + f * 1.7) + 0.03 * Math.sin(T * 23 + f)); M4.compose(V(x, 0.09, z), Q.identity(), V(k, 1, k)); poolI.setMatrixAt(i, M4); }); poolI.instanceMatrix.needsUpdate = true; }
    for (const b of banners) b.p.rotation.y = Math.sin(T * 1.3 + b.ph) * 0.18; }
  function setNight(on) { night = on; glowW.visible = glowV.visible = poolI.visible = on; flameM.color.set(on ? 0xffb347 : 0xffa23a); lampWarm.color.set(on ? 0xfff0c0 : 0xffe2a0); lampViolet.color.set(on ? 0xdcc4ff : 0xc9a6ff); }
  return { root, colliders, tick, setNight, covers: (x, z) => COVER.some(r => inR(r, x, z)), stats: { flames: flames.length, lanterns: glow.warm.length + glow.violet.length, trees: trees.length, pools: pools.length, banners: banners.length, batches: batches.size } };
}

export async function buildPathLife({ THREE, scene, M, toon, kit, cols, L, HZ, audio = () => null }) {
  const W = await import('./meru.js'), { createCombat } = await import('../engine/combat.js'), { PLAYER_FEMALE } = await import('../fox-kit.js');
  const touch = matchMedia('(pointer: coarse)').matches;
  const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
  const segP = (x, z, p) => { let m = 1e9, best = [x, z]; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), px = ax + dx * u, pz = az + dz * u, d = Math.hypot(x - px, z - pz); if (d < m) { m = d; best = [px, pz]; } } return { d: m, p: best }; };
  const nearestPath = (x, z) => { let b = null; for (const P of L.PATHS) { const q = segP(x, z, P.p); if (!b || q.d < b.d) b = q; } return b; };
  const zoneOf = (x, z) => { let best = null; for (const Z of L.ZONES) if (Z.r ? inR(Z.r, x, z) : Math.hypot(x - Z.c[0], z - Z.c[1]) <= Z.c[2]) best = Z; return best; };

  // ---------- the people on the four paths (looks from the old Meru modules; positions + tiers from the layout) ----------
  const LOOKS = new Map(); for (const f of [...(W.FOXES || []), ...((W.CP && W.CP.FOXES) || []), ...((W.AP && W.AP.FOXES) || []), ...((W.RU && W.RU.FOXES) || []), ...((W.LK && W.LK.FOXES) || [])]) if (f && f.key && !f.cast) LOOKS.set(f.key, f);
  const ZK = ['meruCastlePath', 'meruBarracks', 'meruArenaPath', 'meruArena', 'meruRuinsPath', 'meruRuins', 'meruLakePath', 'meruLake'], foxes = [];
  for (const s of L.SPEAKERS) { if (!Array.isArray(s.at)) continue; const lk = LOOKS.get(s.key), zn = zoneOf(s.at[0], s.at[1]); if (!lk || !zn || !ZK.includes(zn.key)) continue;
    const f = kit.makeFox({ key: s.key, torso: lk.torso, crest: lk.crest, mood: lk.mood || 'neutral', look: lk.look || (lk.female ? PLAYER_FEMALE : undefined), gear: lk.gear || 'none', outfit: lk.outfit || 'vest' });
    const [x, z] = s.at, np = nearestPath(x, z).p, yaw0 = Math.hypot(np[0] - x, np[1] - z) > 0.5 ? Math.atan2(np[0] - x, np[1] - z) : 0;
    f.position.set(x, HZ.terrainAt(x, z), z); f.rotation.y = yaw0; scene.add(f); cols.push({ c: [x, z, 0.5] }); foxes.push({ f, x, z, yaw0, yaw: yaw0, key: s.key }); }
  let cullT = 0;
  function tickFoxes(dt, P) { cullT -= dt; if (cullT <= 0) { cullT = 0.5; const R = touch ? 60 : 95; for (const q of foxes) q.f.visible = Math.hypot(q.x - P.x, q.z - P.z) < R; }
    for (const q of foxes) { if (!q.f.visible) continue; const d = Math.hypot(P.x - q.x, P.z - q.z), want = d < 6 ? Math.atan2(P.x - q.x, P.z - q.z) : q.yaw0; q.yaw += Math.atan2(Math.sin(want - q.yaw), Math.cos(want - q.yaw)) * Math.min(1, dt * 4); q.f.rotation.y = q.yaw; kit.animFox(q.f, dt, 0, false); } }

  // ---------- the Ruins Path wilds: Meru's cave bats + rats, off the path ----------
  const WD = L.WILD, A = WD.area, pad = 4;
  const wildCols = cols.filter(c => c.c ? inR([A[0] - pad, A[1] + pad, A[2] - pad, A[3] + pad], c.c[0], c.c[1]) : c.f && c.f[1] > A[0] - pad && c.f[0] < A[1] + pad && c.f[3] > A[2] - pad && c.f[2] < A[3] + pad);
  const blocked = (x, z) => { for (const c of wildCols) { if (c.on === false) continue; if (c.c) { if (Math.hypot(x - c.c[0], z - c.c[1]) < c.c[2] + 0.35) return true; } else { const f = c.f; if (x > f[0] - 0.35 && x < f[1] + 0.35 && z > f[2] - 0.35 && z < f[3] + 0.35) return true; } } return false; };
  const offPath = (x, z) => nearestPath(x, z).d > WD.band;
  const okAt = (n, x, z) => inR(A, x, z) && offPath(x, z) && !blocked(x, z) && Math.hypot(x - n.home[0], z - n.home[1]) < WD.leash;
  const move = (o, nx, nz) => { if (!o.home) { o.x = nx; o.z = nz; return; } if (okAt(o, nx, nz)) { o.x = nx; o.z = nz; } else if (okAt(o, nx, o.z)) o.x = nx; else if (okAt(o, o.x, nz)) o.z = nz; };
  const aud = { burst(d, f, v) { const c = audio(); if (!c) return; const b = c.createBuffer(1, Math.max(1, c.sampleRate * d | 0), c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length); const n = c.createBufferSource(); n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; const g = c.createGain(); g.gain.value = v; n.connect(bp); bp.connect(g); g.connect(c.destination); n.start(); },
    tone(f, d, v, type = 'sine') { const c = audio(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d + 0.02); } };
  const CB = createCombat({ THREE, scene, audio: aud, move });
  const hill = (HZ.wild || []).filter(s => offPath(s.x, s.z)).map((s, i) => ({ kind: i % 2 ? 'bat' : 'rat', x: s.x, z: s.z }));
  const spots = [...WD.spots, ...hill].filter((s, i) => !touch || i % 2 === 0);
  const crit = spots.map((s, i) => { const m = W.CV.makeCritter({ THREE, scene, M, toon }, { kind: s.kind }); const n = { key: 'wild' + i, x: s.x, z: s.z, face: Math.random() * 6, c: m.c, speedNow: 0, home: [s.x, s.z] };
    const f = CB.add(n, m.opts); f.solo = true; let t = Math.random() * 10; f.anim = (dt, spd) => { t += dt; m.anim(t, spd); n.c.position.y += HZ.terrainAt(n.x, n.z); }; m.c.position.set(s.x, HZ.terrainAt(s.x, s.z) + (m.opts.fly || 0), s.z); return { n, f, downT: 0, pathT: 0 }; });
  function tick(dt, t, P, fox, active) {
    tickFoxes(dt, P);
    const onPath = !offPath(P.x, P.z);
    for (const q of crit) { const { n, f } = q;
      if (f.down) { q.downT += dt; if (q.downT > 1.4) n.c.visible = false; if (q.downT > WD.respawn && Math.hypot(P.x - n.home[0], P.z - n.home[1]) > 35) { Object.assign(f, { down: false, hp: f.max, hostile: false, state: 'idle', t: 0 }); n.x = n.home[0]; n.z = n.home[1]; n.c.rotation.x = 0; n.c.visible = true; q.downT = 0; } continue; }
      if (f.hostile) { q.pathT = onPath ? q.pathT + dt : 0; if (!active || q.pathT > 2.5 || Math.hypot(P.x - n.home[0], P.z - n.home[1]) > WD.leash + 14) { f.hostile = false; f.state = 'idle'; f.t = 0; } }
      else { const dx = n.home[0] - n.x, dz = n.home[1] - n.z, d = Math.hypot(dx, dz); if (d > 0.8) { const s = Math.min(d, f.speed * 0.45 * dt); move(n, n.x + dx / d * s, n.z + dz / d * s); n.face = Math.atan2(dx, dz); } } }
    let r = { playerDown: false };
    if (active) { r = CB.update(dt, { x: P.x, z: P.z, y: P.y, face: P.yaw }, fox); CB.pose(fox); }
    for (const q of crit) if (q.f.down && q.n.c.visible) q.n.c.position.y = HZ.terrainAt(q.n.x, q.n.z) + 0.12;
    if (r.playerDown) { CB.P.hp = CB.P.max; for (const q of crit) if (!q.f.down) { q.f.hostile = false; q.f.state = 'idle'; } }
    return r; }
  return { keys: new Set(foxes.map(q => q.key)), tick, attack: (kind, P, fox) => CB.attack(kind, { x: P.x, z: P.z, y: P.y, face: P.yaw }, fox, { meleeDmg: 30, laserDmg: 15 }),
    hp: () => Math.round(CB.P.hp), max: () => CB.P.max, foes: () => CB.alive().filter(f => f.hostile).length, safePoint: (x, z) => nearestPath(x, z).p, stats: { foxes: foxes.length, creatures: crit.length }, debug: () => crit.map(q => [Math.round(q.n.x), Math.round(q.n.z), q.f.hostile ? 'H' : '-', q.f.down ? 'D' : '-', q.f.hp]) };
}
