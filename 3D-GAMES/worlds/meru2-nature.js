// MERU 2.0 — art pass: LIVING NATURE. (1) a field of real GRASS BLADES round the camera that blow in the wind (rolling gusts + flutter),
// (2) CLOUDS drifting across a deeper sky, (3) BIRDS: flocks circling the city + gulls over the lake, wings flapping.
// Grass = one instanced draw: clumps live in a tile that wraps round the camera in the vertex shader, a baked MASK says where grass grows
// (green ground, not under buildings / roads / water) + the ground height there (hills, island). Short mown grass in town, long + wild outside.
export function buildNature({ THREE, scene, L, groundCanvas, heightAt, touch }) {
  const H = L.MAP.half, SZ = H * 2, R = Math.random, uT = { value: 0 }, uCam = { value: new THREE.Vector2() }, uNight = { value: 0 };
  // ---------- GRASS v2 (Ben: "natural, everywhere, not in patches, not growing through benches"): baked later by bakeGrass(blockers) once every
  // module has placed its props. Mask R = grass amount (green ground minus every collider + bench + lamp, softened), G = ground height / 40, B = town (mown).
  // Two layers that wrap round the camera: NEAR (dense, fine blades) and FAR (sparser, bigger clumps) out to ~95 m, cross-faded, so there is no
  // ring edge. Natural variation from low-frequency noise: meadow vs short, yellow-green vs blue-green drifts, clumping; wildflowers outside town.
  let grassLayers = [], maskData = null, maskN = 1;
  const maskAt = (x, z) => { if (!maskData) return [0, 0, 0]; const i = Math.max(0, Math.min(maskN - 1, Math.floor((x + H) / SZ * maskN))), j = Math.max(0, Math.min(maskN - 1, Math.floor((z + H) / SZ * maskN))), p = (j * maskN + i) * 4; return [maskData[p] / 255, maskData[p + 1] / 255 * 40, maskData[p + 2] / 255]; };
  function bakeGrass(blockers = []) {
    const MN = touch ? 768 : 1280, mc = document.createElement('canvas'); mc.width = mc.height = MN; const g = mc.getContext('2d');
    g.drawImage(groundCanvas, 0, 0, MN, MN); const k = MN / SZ, X = x => (x + H) * k, Z = z => (z + H) * k;
    const src = g.getImageData(0, 0, MN, MN).data, cv2 = document.createElement('canvas'); cv2.width = cv2.height = MN; const g2 = cv2.getContext('2d'), id = g2.createImageData(MN, MN);
    for (let p = 0; p < MN * MN; p++) { const r = src[p * 4], gg = src[p * 4 + 1], bb = src[p * 4 + 2], m = Math.max(0, Math.min(1, (gg - Math.max(r, bb) - 6) / 18)); id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = m * 255; id.data[p * 4 + 3] = 255; }
    g2.putImageData(id, 0, 0); g2.fillStyle = '#000';
    for (const b of L.BUILDINGS) if (b.f) g2.fillRect(X(b.f[0] - 1.2), Z(b.f[2] - 1.2), (b.f[1] - b.f[0] + 2.4) * k, (b.f[3] - b.f[2] + 2.4) * k);
    // every paved / built surface, painted black: foot paths (5 m), trails (3 m), roads + kerbs, the skate park, skyline plazas, station platforms
    const strokeP = (p, wd) => { g2.lineWidth = wd * k; g2.beginPath(); p.forEach(([x, z], i) => i ? g2.lineTo(X(x), Z(z)) : g2.moveTo(X(x), Z(z))); g2.stroke(); };
    g2.strokeStyle = '#000'; g2.lineCap = g2.lineJoin = 'round';
    for (const P of L.PATHS || []) strokeP(P.p, 5.5); for (const P of L.TRAILS || []) strokeP(P.p, 3.2); for (const r of L.ROADS || []) strokeP(r.p, r.w + 4);
    if (L.TRAIN && L.TRAIN.line) strokeP([...L.TRAIN.line, L.TRAIN.line[0]], 7);
    const rr = r => g2.fillRect(X(r[0] - 0.6), Z(r[2] - 0.6), (r[1] - r[0] + 1.2) * k, (r[3] - r[2] + 1.2) * k);
    if (L.YARDS && L.YARDS.skate) rr(L.YARDS.skate.rect); for (const P of (L.SKYLINE && L.SKYLINE.plazas) || []) rr(P.r);
    for (const b of L.BUILDINGS) if (b.lot) rr(b.lot.r);
    for (const c of blockers) { if (c.y0 != null && c.y0 > 1) continue; if (c.c) { g2.beginPath(); g2.arc(X(c.c[0]), Z(c.c[1]), (c.c[2] + 0.45) * k, 0, 7); g2.fill(); } else if (c.f) g2.fillRect(X(c.f[0] - 0.4), Z(c.f[2] - 0.4), (c.f[1] - c.f[0] + 0.8) * k, (c.f[3] - c.f[2] + 0.8) * k); }
    const cv3 = document.createElement('canvas'); cv3.width = cv3.height = MN; const g3 = cv3.getContext('2d'); g3.filter = 'blur(' + (touch ? 0.8 : 1.1) + 'px)'; g3.drawImage(cv2, 0, 0); const mk = g3.getImageData(0, 0, MN, MN).data;
    const data = new Uint8Array(MN * MN * 4);
    for (let j = 0; j < MN; j++) for (let i = 0; i < MN; i++) { const p = (j * MN + i) * 4, x = (i + 0.5) / k - H, z = (j + 0.5) / k - H, isl = L.islandAt ? L.islandAt(x, z) : 0, wet = L.inLake && L.inLake(x, z);
      let m = mk[p] / 255; if (m > 0.02 && L.surfaceAt && L.surfaceAt(x, z) !== 'grass') m = 0; if (wet) m = isl > 2.4 ? Math.min(1, (isl - 2.4) / 1.5) * m : 0;
      const h = Math.max(0, wet ? isl : (heightAt(x, z) || 0)); data[p] = m * 255; data[p + 1] = Math.min(255, h / 40 * 255); data[p + 2] = Math.abs(x) < 158 && Math.abs(z) < 148 ? 255 : 0; data[p + 3] = 255; }
    let on = 0; for (let p = 0; p < MN * MN; p++) if (data[p * 4] > 128) on++; bakeGrass.info = { MN, on: on / (MN * MN), src0: [src[((MN / 2 + 40) * MN + MN / 2 + 120) * 4], src[((MN / 2 + 40) * MN + MN / 2 + 120) * 4 + 1], src[((MN / 2 + 40) * MN + MN / 2 + 120) * 4 + 2]] };
    maskData = data; maskN = MN;
    const mask = new THREE.DataTexture(data, MN, MN, THREE.RGBAFormat); mask.magFilter = mask.minFilter = THREE.LinearFilter; mask.needsUpdate = true;
    const clump = (NB, wMul) => { const pos = [], hh = [], idx = [];
      for (let b = 0; b < NB; b++) { const a = b / NB * Math.PI * 2 + R(), r = (0.03 + R() * 0.16) * wMul, ox = Math.cos(a) * r, oz = Math.sin(a) * r, fa = R() * Math.PI, fx = Math.cos(fa), fz = Math.sin(fa), ht = 0.65 + R() * 0.6, lean = (0.08 + R() * 0.22), base = pos.length / 3;
        for (let s = 0; s <= 3; s++) { const t = s / 3, w = 0.024 * wMul * (1 - t * 0.9), lx = ox + Math.cos(a) * lean * t * t, lz = oz + Math.sin(a) * lean * t * t; for (const sd of [-1, 1]) { pos.push(lx + fx * w * sd, t * ht, lz + fz * w * sd); hh.push(t); } }
        for (let s = 0; s < 3; s++) { const q = base + s * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); } }
      const geo = new THREE.InstancedBufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aH', new THREE.Float32BufferAttribute(hh, 1)); geo.setIndex(idx);
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => i % 3 === 1 ? 1 : 0), 3)); return geo; };
    const layer = (RAD, N, NB, wMul, r0, r1, hMul) => { const geo = clump(NB, wMul), TILE = RAD * 2, off = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) { off[i * 4] = R() * TILE; off[i * 4 + 1] = R() * TILE; off[i * 4 + 2] = R(); off[i * 4 + 3] = R() * Math.PI * 2; }
      geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4)); geo.instanceCount = N;
      const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
      mat.onBeforeCompile = sh => { Object.assign(sh.uniforms, { uT, uCam, uMask: { value: mask }, uNight });
        sh.vertexShader = 'uniform float uT; uniform float uNight; uniform vec2 uCam; uniform sampler2D uMask; attribute float aH; attribute vec4 aOff; varying vec3 vGC;\n' +
          'float n2(vec2 p){ return 0.5 + 0.25 * sin(p.x * 0.071 + sin(p.y * 0.043) * 2.1) + 0.25 * sin(p.y * 0.059 + sin(p.x * 0.037) * 1.7); }\n' + sh.vertexShader
          .replace('#include <begin_vertex>', `
            vec2 wp = aOff.xy + ${TILE.toFixed(1)} * floor((uCam - aOff.xy) / ${TILE.toFixed(1)} + 0.5);
            vec4 mk = texture2D(uMask, (wp + ${H.toFixed(1)}) / ${SZ.toFixed(1)});
            float d = length(wp - uCam), fd = smoothstep(${r0[0].toFixed(1)}, ${r0[1].toFixed(1)}, d) * (1.0 - smoothstep(${r1[0].toFixed(1)}, ${r1[1].toFixed(1)}, d));
            float meadow = n2(wp), dens = 0.55 + 0.45 * n2(wp * 2.3 + 17.0);
            float tall = mix(mix(0.26, 0.6, meadow), mix(0.14, 0.22, meadow), mk.b) * (0.7 + 0.6 * aOff.z) * ${hMul.toFixed(2)};
            float sc = smoothstep(0.55, 0.9, mk.r) * fd * step(aOff.z, 0.25 + 0.75 * dens);
            float ca = cos(aOff.w), sa = sin(aOff.w); vec3 p = vec3(position.x * ca - position.z * sa, position.y * tall, position.x * sa + position.z * ca) * sc;
            float gust = 0.5 + 0.5 * sin(dot(wp, vec2(0.21, 0.13)) - uT * 1.7) * sin(dot(wp, vec2(-0.05, 0.11)) - uT * 0.6);
            float bend = sc * aH * aH * (0.1 + 0.3 * gust) * tall * 2.2 + sc * aH * 0.02 * sin(uT * 7.0 + aOff.w * 5.0);
            p.x += bend * 0.86; p.z += bend * 0.5; p.y -= bend * bend * 0.35;
            vec3 transformed = vec3(wp.x, mk.g * 40.0 + 0.015, wp.y) + p;
            float hue = n2(wp * 0.6 + 40.0);
            vec3 lo = vec3(0.17, 0.31, 0.1), hi = mix(mix(vec3(0.36, 0.58, 0.18), vec3(0.5, 0.6, 0.22), hue), vec3(0.4, 0.62, 0.2), mk.b * 0.5);
            vGC = mix(lo, hi, aH) * (0.86 + 0.28 * aOff.z) * (1.0 + 0.22 * gust * aH) * (1.0 - 0.6 * uNight);
            if (aOff.z > 0.97 && mk.b < 0.5 && aH > 0.9 && meadow > 0.45) vGC = (aOff.z > 0.985 ? vec3(1.0, 0.85, 0.2) : vec3(0.98, 0.96, 0.92)) * (1.0 - 0.6 * uNight);`);
        sh.fragmentShader = 'varying vec3 vGC;\n' + sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( vGC, opacity );'); };
      const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; scene.add(m); return m; };
    for (const m of grassLayers) { scene.remove(m); m.geometry.dispose(); }
    grassLayers = touch ? [layer(22, 4200, 4, 1, [-1, 0], [17, 22], 1), layer(58, 3000, 5, 2.4, [14, 20], [48, 58], 1.15)]
                        : [layer(34, 14000, 5, 1, [-1, 0], [26, 34], 1), layer(95, 9000, 6, 2.6, [22, 32], [80, 95], 1.2)];
    return grassLayers; }
  // ---------- CLOUDS: soft puffy billboards high up, drifting with the wind ----------
  const cloudTex = (seed) => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const q = c.getContext('2d'); let s = seed; const rr = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 26; i++) { const x = 40 + rr() * 176, y = 70 - rr() * 30 * Math.sin(Math.PI * (x - 40) / 176), r = 14 + rr() * 26 * Math.sin(Math.PI * (x - 40) / 176);
      const gr = q.createRadialGradient(x, y - r * 0.3, 1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(246,248,252,0.75)'); gr.addColorStop(1, 'rgba(230,236,245,0)'); q.fillStyle = gr; q.beginPath(); q.arc(x, y, r, 0, 7); q.fill(); }
    const gb = q.createLinearGradient(0, 60, 0, 110); gb.addColorStop(0, 'rgba(180,195,215,0)'); gb.addColorStop(1, 'rgba(170,185,205,0.35)'); q.globalCompositeOperation = 'source-atop'; q.fillStyle = gb; q.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const CT = [1, 2, 3, 4].map(i => cloudTex(i * 977)), clouds = [], cloudG = new THREE.Group(); scene.add(cloudG);
  for (let i = 0; i < (touch ? 14 : 26); i++) { const m = new THREE.SpriteMaterial({ map: CT[i % 4], transparent: true, depthWrite: false, fog: false, opacity: 0.92 }), sp = new THREE.Sprite(m);
    const a = R() * Math.PI * 2, d = 250 + R() * 1150, s = 160 + R() * 260; sp.position.set(Math.cos(a) * d, 230 + R() * 220, Math.sin(a) * d); sp.scale.set(s, s * 0.5, 1); cloudG.add(sp); clouds.push({ sp, v: 3 + R() * 3 }); }

  // ---------- BIRDS: a body + two wings that flap in the vertex shader (one draw), flocks on slow loops ----------
  const bg = new THREE.InstancedBufferGeometry(), bp = [0, 0, 0.35, 0, 0, -0.3, 0.12, 0, 0, -0.12, 0, 0,   0.05, 0, 0.12, 0.05, 0, -0.12, 1.0, 0, -0.1,   -0.05, 0, 0.12, -0.05, 0, -0.12, -1.0, 0, -0.1];
  bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); bg.setIndex([0, 2, 1, 0, 1, 3, 4, 5, 6, 7, 9, 8]);
  bg.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(30).fill(0).map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  const flocks = [], birds = []; const addFlock = (cx, cz, r, y, n, sc, col, speed) => { const F = { cx, cz, r, y, a: R() * 6.3, w: (R() < 0.5 ? -1 : 1) * speed / r, bob: R() * 6 }; flocks.push(F);
    for (let i = 0; i < n; i++) birds.push({ F, dx: (R() - 0.5) * 14, dy: (R() - 0.5) * 5, dz: (R() - 0.5) * 14, ph: R() * 6.3, sc: sc * (0.85 + R() * 0.3), col }); };
  for (const [x, z] of [[-60, -40], [90, 60], [-120, 160], [180, -120], [-300, -260]]) addFlock(x, z, 70 + R() * 60, 55 + R() * 40, touch ? 5 : 8, 0.55, 0x2a2a33, 11);
  for (const [x, z] of [[40, 300], [-180, 330], [240, 360]]) addFlock(x, z, 50 + R() * 50, 18 + R() * 14, touch ? 3 : 5, 0.75, 0xf3f2f2, 8);
  const NBI = birds.length, bOff = new Float32Array(NBI * 4), bCol = new Float32Array(NBI * 3);
  birds.forEach((b, i) => { const c = new THREE.Color(b.col); bCol.set([c.r, c.g, c.b], i * 3); });
  const bOffA = new THREE.InstancedBufferAttribute(bOff, 4), bYawA = new THREE.InstancedBufferAttribute(new Float32Array(NBI * 2), 2); bOffA.setUsage(THREE.DynamicDrawUsage); bYawA.setUsage(THREE.DynamicDrawUsage);
  bg.setAttribute('aOff', bOffA); bg.setAttribute('aYaw', bYawA); bg.setAttribute('aCol', new THREE.InstancedBufferAttribute(bCol, 3)); bg.instanceCount = NBI;
  const bm = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }); bm.onBeforeCompile = sh => { sh.uniforms.uT = uT;
    sh.vertexShader = 'uniform float uT; attribute vec4 aOff; attribute vec2 aYaw; attribute vec3 aCol; varying vec3 vBC;\n' + sh.vertexShader.replace('#include <begin_vertex>', `
      vec3 p = position * aOff.w; float span = abs(position.x) / aOff.w; float flap = sin(uT * 9.0 + aYaw.y) * (0.45 + 0.55 * step(0.5, fract(uT * 0.13 + aYaw.y)));
      p.y += span * span * flap * 0.55 * aOff.w; p.y -= span * 0.12 * aOff.w;
      float c = cos(aYaw.x), s = sin(aYaw.x); vec3 transformed = aOff.xyz + vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c); vBC = aCol;`);
    sh.fragmentShader = 'varying vec3 vBC;\n' + sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( vBC, opacity );'); };
  const birdMesh = new THREE.Mesh(bg, bm); birdMesh.frustumCulled = false; scene.add(birdMesh);

  // ---------- LITTLE LIFE: BUTTERFLIES over the meadows (by day), DRAGONFLIES skimming the shore, FIREFLIES over the grass at night ----------
  // One instanced draw: a pair of wings that flap in the vertex shader; each bug lives within ~30 m of the camera, respawns ahead when left behind.
  const BN = touch ? 16 : 34, bugG = new THREE.InstancedBufferGeometry();
  bugG.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.06, 0, 0, -0.06, 0.16, 0, 0.1,  0, 0, 0.06, 0.16, 0, 0.1, 0.13, 0, -0.08,  0, 0, 0.06, 0, 0, -0.06, -0.16, 0, 0.1,  0, 0, 0.06, -0.16, 0, 0.1, -0.13, 0, -0.08], 3));
  bugG.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(36).fill(0).map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  const bugP = new THREE.InstancedBufferAttribute(new Float32Array(BN * 4), 4), bugC = new THREE.InstancedBufferAttribute(new Float32Array(BN * 3), 3); bugP.setUsage(THREE.DynamicDrawUsage); bugC.setUsage(THREE.DynamicDrawUsage);
  bugG.setAttribute('aP', bugP); bugG.setAttribute('aC', bugC); bugG.instanceCount = BN;
  const bugM = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }); bugM.onBeforeCompile = sh => { sh.uniforms.uT = uT;
    sh.vertexShader = 'uniform float uT; attribute vec4 aP; attribute vec3 aC; varying vec3 vBC;\n' + sh.vertexShader.replace('#include <begin_vertex>', `
      float s = abs(aP.w); vec3 p = position * s; float fl = sin(uT * (aP.w < 0.0 ? 40.0 : 15.0) + aP.x * 3.0) * 1.1; float sp = abs(position.x) * s;
      p.y += sp * fl; p.x *= cos(fl * 0.6); float yaw = aP.x * 0.37 + uT * 0.3; vec3 transformed = aP.xyz + vec3(p.x * cos(yaw) + p.z * sin(yaw), p.y, -p.x * sin(yaw) + p.z * cos(yaw)); vBC = aC;`);
    sh.fragmentShader = 'varying vec3 vBC;\n' + sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( vBC, opacity );'); };
  const bugMesh = new THREE.Mesh(bugG, bugM); bugMesh.frustumCulled = false; scene.add(bugMesh);
  const ffN = touch ? 40 : 90, ffP = new Float32Array(ffN * 3), ffG = new THREE.BufferGeometry(); ffG.setAttribute('position', new THREE.BufferAttribute(ffP, 3));
  const ffM = new THREE.PointsMaterial({ color: 0xd9ff7a, size: 0.22, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); const fireflies = new THREE.Points(ffG, ffM); fireflies.frustumCulled = false; scene.add(fireflies);
  const BCOL = ['#ffd23a', '#f3f2f2', '#fb923c', '#60a5fa', '#c084fc'], bugs = [], ffs = [];
  const spot = (cam, wantShore) => { for (let k = 0; k < 24; k++) { const a = R() * 6.283, r = 6 + R() * 26, x = cam.x + Math.cos(a) * r, z = cam.z + Math.sin(a) * r;
    if (wantShore) { const d = L.lakeShoreD ? L.lakeShoreD(x, z) : -99; if (d > 0.5 && d < 9) return [x, 0.6 + R() * 0.8, z]; } else { const m = maskAt(x, z); if (m[0] > 0.6) return [x, m[1] + 0.5 + R() * 1.0, z]; } } return null; };
  for (let i = 0; i < BN; i++) bugs.push({ x: 0, y: -50, z: 0, tx: 0, ty: 0, tz: 0, k: i % 5 === 4 ? 'dragon' : 'fly', c: new THREE.Color(i % 5 === 4 ? '#38bdf8' : BCOL[i % BCOL.length]), wait: R() * 2 });
  for (let i = 0; i < ffN; i++) ffs.push({ x: 0, y: -50, z: 0, ph: R() * 6.3, wait: 0 });
  let nightK = 0;
  function bugsTick(dt, t, cam) { const day = nightK < 0.4;
    for (let i = 0; i < BN; i++) { const b = bugs[i]; const far = Math.hypot(b.x - cam.x, b.z - cam.z) > 34; b.wait -= dt;
      if (!day || cam.y > 60) { b.y = -50; } else if (far || b.y < -10) { if (b.wait <= 0) { const p = spot(cam, b.k === 'dragon'); b.wait = 1; if (p) { [b.x, b.y, b.z] = p; [b.tx, b.ty, b.tz] = p; } } }
      else { if (Math.hypot(b.tx - b.x, b.tz - b.z) < 0.4 || b.wait <= 0) { const r = b.k === 'dragon' ? 6 : 2.2; b.tx = b.x + (R() - 0.5) * r * 2; b.tz = b.z + (R() - 0.5) * r * 2; b.ty = b.k === 'dragon' ? 0.5 + R() * 0.7 : maskAt(b.tx, b.tz)[1] + 0.35 + R() * 1.2; b.wait = b.k === 'dragon' ? 0.4 + R() * 1.2 : 0.8 + R() * 1.5; }
        const sp = b.k === 'dragon' ? 4.5 : 1.3, dx = b.tx - b.x, dy = b.ty - b.y, dz = b.tz - b.z, l = Math.hypot(dx, dy, dz) || 1, st = Math.min(l, sp * dt); b.x += dx / l * st; b.y += dy / l * st + (b.k === 'fly' ? Math.sin(t * 9 + i) * 0.01 : 0); b.z += dz / l * st; }
      bugP.array.set([b.x, b.y, b.z, b.k === 'dragon' ? -0.7 : 0.9], i * 4); bugC.array.set([b.c.r, b.c.g, b.c.b], i * 3); }
    bugP.needsUpdate = bugC.needsUpdate = true;
    ffM.opacity = Math.max(0, (nightK - 0.5) * 2) * 0.95; if (ffM.opacity > 0) for (let i = 0; i < ffN; i++) { const f = ffs[i]; if (Math.hypot(f.x - cam.x, f.z - cam.z) > 30 || f.y < -10) { const p = spot(cam, false); if (p) { f.x = p[0]; f.y = p[1] + 0.2; f.z = p[2]; } }
      f.x += Math.sin(t * 0.7 + f.ph) * 0.4 * dt; f.z += Math.cos(t * 0.6 + f.ph * 1.3) * 0.4 * dt; f.y += Math.sin(t * 1.1 + f.ph) * 0.15 * dt; const blink = Math.sin(t * 2.2 + f.ph * 5) > 0.2 ? 1 : 0; ffP.set([f.x, blink ? f.y : -50, f.z], i * 3); } ffG.attributes.position.needsUpdate = true; }
  function tick(dt, now, cam) { bugsTick(dt, now / 1000, cam); const t = now / 1000; uT.value = t % 10000; uCam.value.set(cam.x, cam.z);
    for (const m of grassLayers) m.visible = cam.y < 120;
    for (const c of clouds) { c.sp.position.x += c.v * dt; if (c.sp.position.x > 1500) c.sp.position.x = -1500; }
    for (const F of flocks) F.a += F.w * dt;
    birds.forEach((b, i) => { const F = b.F, a = F.a + b.dx * 0.004, x = F.cx + Math.cos(a) * (F.r + b.dz), z = F.cz + Math.sin(a) * (F.r + b.dz), y = F.y + b.dy + Math.sin(t * 0.7 + b.ph) * 2 + Math.sin(F.a * 2 + F.bob) * 6;
      bOff[i * 4] = x; bOff[i * 4 + 1] = y; bOff[i * 4 + 2] = z; bOff[i * 4 + 3] = b.sc * 1.6; bYawA.array[i * 2] = Math.atan2(-Math.sin(a) * Math.sign(F.w), Math.cos(a) * Math.sign(F.w)); bYawA.array[i * 2 + 1] = b.ph; });
    bOffA.needsUpdate = true; bYawA.needsUpdate = true; }
  function setNight(n) { uNight.value = n; nightK = n; for (const c of clouds) { c.sp.material.color.setRGB(1 - 0.72 * n, 1 - 0.7 * n, 1 - 0.6 * n); c.sp.material.opacity = 0.92 - 0.35 * n; } birdMesh.visible = n < 0.6; }
  return { tick, setNight, bakeGrass, get grass() { return grassLayers; }, clouds: cloudG, birds: birdMesh, stats: { clouds: clouds.length, birds: NBI } };
}
