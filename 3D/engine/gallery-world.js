// Blind Canvas gallery: the world around the museum.
//  • A lake: rippling, partly see-through water under the entrance bridge and out in front of the welcome plaza.
//  • Two flags out on the water (Blind Canvas Project and Ora) that wave in the wind.
//  • Cherry trees: the park's old green trees repainted in blossom, plus more along the shore.
//  • A city all round the park: streets and a skyline of towers fading into the haze.
// Everything is a handful of draw calls (instancing + small shaders) so it stays inside the phone budget.
import * as THREE from '../vendor/three/three.module.js';

const rnd = (() => { let s = 20261002; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();

// ---------------------------------------------------------------- cherry blossom tree pictures
// The model's tree cards store their picture upside down (glTF), so the trunk is drawn at the top of the canvas.
function cherryCanvas(w, h, seed) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const T = y => y;   // canvas y (0 = ground end of the trunk)
  // trunk and branches (dark bark)
  c.strokeStyle = '#4a3229'; c.lineCap = 'round';
  const cx = w / 2, crownY = h * 0.62, crownR = Math.min(w * 0.46, h * 0.36);
  c.lineWidth = w * 0.055; c.beginPath(); c.moveTo(cx, T(0)); c.quadraticCurveTo(cx + w * 0.03, T(h * 0.25), cx - w * 0.01, T(h * 0.42)); c.stroke();
  const branch = (x, y, ang, len, wd, depth) => {
    if (depth === 0 || len < 4) return;
    const x2 = x + Math.sin(ang) * len, y2 = y + Math.cos(ang) * len;
    c.lineWidth = wd; c.beginPath(); c.moveTo(x, T(y)); c.lineTo(x2, T(y2)); c.stroke();
    branch(x2, y2, ang - 0.35 - r() * 0.4, len * (0.62 + r() * 0.2), wd * 0.66, depth - 1);
    branch(x2, y2, ang + 0.35 + r() * 0.4, len * (0.62 + r() * 0.2), wd * 0.66, depth - 1);
  };
  branch(cx - w * 0.01, h * 0.42, -0.15, h * 0.16, w * 0.04, 5);
  // blossom: hundreds of soft pink puffs in clusters, lighter on top, a few petals drifting below
  const pinks = ['#f7c3d6', '#f4aac6', '#ffd6e6', '#eb8fb4', '#fbe3ee', '#f29dbd'];
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * crownR, bx = cx + Math.cos(a) * d * 1.08, by = crownY + Math.sin(a) * d * 0.78;
    const n = 14 + (r() * 14 | 0), rr = crownR * (0.16 + r() * 0.12);
    for (let k = 0; k < n; k++) {
      const pa = r() * Math.PI * 2, pd = Math.sqrt(r()) * rr, px = bx + Math.cos(pa) * pd, py = by + Math.sin(pa) * pd;
      const shade = (py - (crownY - crownR)) / (2 * crownR);   // 0 = trunk side
      c.fillStyle = pinks[(r() * pinks.length) | 0]; c.globalAlpha = 0.55 + r() * 0.45;
      c.beginPath(); c.arc(px, T(py), w * (0.012 + r() * 0.02) * (shade > 0.7 ? 1.15 : 1), 0, Math.PI * 2); c.fill();
    }
  }
  c.globalAlpha = 0.18; c.fillStyle = '#b4567c';   // a little depth on the trunk side of the crown
  for (let i = 0; i < 220; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * crownR * 0.9; const px = cx + Math.cos(a) * d, py = crownY - crownR * 0.25 + Math.sin(a) * d * 0.5; c.beginPath(); c.arc(px, T(py), w * 0.012, 0, 7); c.fill(); }
  c.globalAlpha = 1; c.fillStyle = '#f7c3d6';
  for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(cx + (r() - 0.5) * w * 0.8, T(h * 0.04 + r() * h * 0.22), w * 0.007, 0, 7); c.fill(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 4; return t;
}

// ---------------------------------------------------------------- water
const WATER_VS = `
  uniform float uT; varying vec3 vW; varying float vH;
  #include <fog_pars_vertex>
  void main() {
    vec3 p = position;
    vec4 w0 = modelMatrix * vec4(p, 1.0);
    float h = sin(w0.x * 0.42 + uT * 1.3) * 0.05 + sin(w0.z * 0.37 - uT * 1.1) * 0.04 + sin((w0.x + w0.z) * 0.9 + uT * 2.1) * 0.02;
    p.z += h;   // the plane is rotated flat, so local z is up
    vec4 wp = modelMatrix * vec4(p, 1.0); vW = wp.xyz; vH = h;
    vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const WATER_FS = `
  uniform float uT; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform float uAlpha; varying vec3 vW; varying float vH;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    vec2 p = vW.xz;
    // two layers of drifting ripples make the surface normal
    float n1 = noise(p * 0.35 + vec2(uT * 0.18, uT * 0.11)), n2 = noise(p * 0.9 - vec2(uT * 0.26, -uT * 0.2)), n3 = noise(p * 2.3 + vec2(-uT * 0.5, uT * 0.4));
    vec3 N = normalize(vec3((n1 - 0.5) * 0.9 + (n2 - 0.5) * 0.6 + (n3 - 0.5) * 0.3, 1.0, (n2 - 0.5) * 0.8 + (n3 - 0.5) * 0.35));
    vec3 V = normalize(cameraPosition - vW);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 col = mix(uShallow, uDeep, clamp(0.35 + n1 * 0.5, 0.0, 1.0));
    col = mix(col, uSky, clamp(fres * 0.85 + 0.08, 0.0, 0.9));
    // sun glints and soft caustic lines
    vec3 L = normalize(vec3(-0.45, 0.85, 0.3)); vec3 H = normalize(L + V);
    col += vec3(1.0, 0.97, 0.9) * pow(max(dot(N, H), 0.0), 90.0) * 0.45;
    float c = smoothstep(0.62, 0.7, noise(p * 1.4 + vec2(uT * 0.3, uT * 0.22)) * 0.6 + n2 * 0.4);
    col += vec3(0.65, 0.9, 1.0) * c * 0.07 + vH * 0.35;
    gl_FragColor = vec4(col, clamp(uAlpha + fres * 0.3, 0.0, 0.95));
    #include <fog_fragment>
  }`;

// ---------------------------------------------------------------- city towers (one instanced mesh, windows drawn in the shader)
const CITY_VS = `
  varying vec3 vW; varying vec3 vN; varying vec3 vC; varying vec3 vL;
  #include <fog_pars_vertex>
  void main() {
    mat4 m = modelMatrix * instanceMatrix;
    vec4 wp = m * vec4(position, 1.0); vW = wp.xyz;
    vN = normalize(mat3(m) * normal);
    vC = instanceColor;
    vL = vec3(instanceMatrix[0][0], instanceMatrix[1][1], instanceMatrix[2][2]);   // the box's size (no rotation)
    vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const CITY_FS = `
  varying vec3 vW; varying vec3 vN; varying vec3 vC; varying vec3 vL;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 13758.5453); }
  void main() {
    vec3 n = normalize(vN);
    float light = 0.62 + 0.38 * max(dot(n, normalize(vec3(-0.45, 0.8, 0.35))), 0.0);
    vec3 col = vC * light;
    if (abs(n.y) < 0.5) {
      vec2 f = vec2(abs(n.x) > 0.5 ? vW.z : vW.x, vW.y + 3.4);
      vec2 cell = floor(f / vec2(3.2, 3.6)), q = fract(f / vec2(3.2, 3.6));
      float win = step(0.18, q.x) * step(q.x, 0.82) * step(0.22, q.y) * step(q.y, 0.78) * step(4.0, f.y);
      float lit = step(0.86, hash(cell + floor(vW.xz * 0.01)));
      vec3 glass = mix(vec3(0.33, 0.42, 0.52), vec3(0.62, 0.72, 0.82), hash(cell * 1.7)) * (0.75 + 0.25 * light);
      col = mix(col, mix(glass, vec3(1.0, 0.86, 0.6), lit * 0.55), win * 0.9);
      col *= 0.92 + 0.08 * step(0.5, fract(f.y / 3.6 * 0.5));
    } else col *= 0.86;
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }`;

export function buildWorld({ scene, camera, renderer, groundAt, resolveImg, lowEnd }) {
  const t0 = performance.now();
  // a hazier, deeper view so the skyline shows
  if (scene.fog) { scene.fog.near = 170; scene.fog.far = lowEnd ? 900 : 1150; }
  camera.far = 1600; camera.updateProjectionMatrix();
  const updaters = [];

  // ---------------------------------------------------------------- 1. cherry trees
  const tall = cherryCanvas(256, 512, 11), round = cherryCanvas(512, 512, 23);
  let repainted = 0;
  scene.traverse(o => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (!m || !/tree/i.test(m.name || '')) continue;
      m.map = /tn1_free_tree/i.test(m.name) ? tall : round; m.color && m.color.set(0xffffff);
      m.transparent = true; m.alphaTest = 0.3; m.depthWrite = true; m.needsUpdate = true; repainted++;
    }
  });
  // more cherry trees round the lake and the park near the museum (crossed cards, one draw call)
  const keepOut = [   // the building, its wings, the lake and the plaza (x0, z0, x1, z1)
    [-285, -32, 20, 32], [-86, -80, -54, 152], [-48, -86, 120, 86], [-130, -30, -60, 30],
  ];
  const treePts = [];
  for (let tries = 0; treePts.length < (lowEnd ? 90 : 170) && tries < 6000; tries++) {
    const x = -175 + rnd() * 220, z = (rnd() - 0.5) * 480;
    if (keepOut.some(([a, b, c, d]) => x > a - 3 && x < c + 3 && z > b - 3 && z < d + 3)) continue;
    if (treePts.some(p => Math.hypot(p[0] - x, p[1] - z) < 7)) continue;
    treePts.push([x, z]);
  }
  for (let i = 0; i < 28; i++) {   // a ring of trees round the lake shore
    const a = (i / 28) * Math.PI * 2, x = 36 + Math.cos(a) * 86, z = Math.sin(a) * 90;
    if (x < -40) continue; treePts.push([x, z]);
  }
  {
    const card = new THREE.PlaneGeometry(1, 1); card.translate(0, 0.5, 0);
    const cross = new THREE.BufferGeometry(), a = card.clone(), b = card.clone(); b.rotateY(Math.PI / 2);
    const merge = (g1, g2) => { const p = [...g1.attributes.position.array, ...g2.attributes.position.array], uv = [...g1.attributes.uv.array, ...g2.attributes.uv.array], n = g1.attributes.position.count, ix = [...g1.index.array, ...[...g2.index.array].map(v => v + n)]; cross.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); cross.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cross.setIndex(ix); cross.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(p.length / 3).fill(0).flatMap(() => [0, 1, 0]), 3)); };   // foliage lit from above, the same on both sides
    merge(a, b);
    const mat = new THREE.MeshLambertMaterial({ map: round, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
    const im = new THREE.InstancedMesh(cross, mat, treePts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    treePts.forEach(([x, z], i) => { const s = 9 + rnd() * 6, g = groundAt(x, 5, z); m4.compose(new THREE.Vector3(x, g > -100 ? g - 0.1 : -3.35, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI), new THREE.Vector3(s * (0.9 + rnd() * 0.3), s, s)); im.setMatrixAt(i, m4); });
    im.frustumCulled = false; scene.add(im);
  }

  // ---------------------------------------------------------------- 2. the lake
  const WATER_Y = -2.95;
  const LAKE = { x0: -43.6, x1: 122, z0: -84, z1: 84 };
  const lakeW = LAKE.x1 - LAKE.x0, lakeD = LAKE.z1 - LAKE.z0, lcx = (LAKE.x0 + LAKE.x1) / 2, lcz = (LAKE.z0 + LAKE.z1) / 2;
  {
    // lake bed: dark and sandy so the water reads as deep (just above the park grass, which sits at -3.3)
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
    const g = c.createRadialGradient(128, 128, 20, 128, 128, 150); g.addColorStop(0, '#0f3341'); g.addColorStop(0.75, '#1f5560'); g.addColorStop(1, '#8a8a72'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${200 + rnd() * 40},${190 + rnd() * 40},${150 + rnd() * 40},${0.04 + rnd() * 0.05})`; c.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(lakeW, lakeD), new THREE.MeshBasicMaterial({ map: tex, fog: true }));
    bed.rotation.x = -Math.PI / 2; bed.position.set(lcx, -3.26, lcz); scene.add(bed);
    // the water itself
    const seg = lowEnd ? 72 : 128;
    const water = new THREE.Mesh(new THREE.PlaneGeometry(lakeW, lakeD, seg, Math.round(seg * lakeD / lakeW)), new THREE.ShaderMaterial({
      vertexShader: WATER_VS, fragmentShader: WATER_FS, transparent: true, depthWrite: false, fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uDeep: { value: new THREE.Color(0x14506a) }, uShallow: { value: new THREE.Color(0x3aa0b4) }, uSky: { value: new THREE.Color(0xcfe6f4) }, uAlpha: { value: 0.66 } }]),
    }));
    water.rotation.x = -Math.PI / 2; water.position.set(lcx, WATER_Y, lcz); water.renderOrder = 1; scene.add(water);
    updaters.push(t => { water.material.uniforms.uT.value = t; });
    // a pale stone rim round the lake (the museum side is the building itself)
    const stone = new THREE.MeshLambertMaterial({ color: 0xd8d2c8 });
    const rim = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, d), stone); m.position.set(x, -3.0, z); scene.add(m); };
    rim(lakeW + 2, 1.2, lcx, LAKE.z0 - 0.6); rim(lakeW + 2, 1.2, lcx, LAKE.z1 + 0.6); rim(1.2, lakeD + 2.4, LAKE.x1 + 0.6, lcz);
    rim(1.2, LAKE.z1 - 34, LAKE.x0 - 0.6, (LAKE.z1 + 34) / 2); rim(1.2, LAKE.z1 - 34, LAKE.x0 - 0.6, -(LAKE.z1 + 34) / 2);
  }

  // ---------------------------------------------------------------- 3. two flags out on the water
  const flags = [];
  {
    const FW = 7.2, FH = 4.6;
    const flagTex = (img, kind) => {
      const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * FH / FW); const c = cv.getContext('2d');
      c.fillStyle = kind === 'ora' ? '#000000' : '#1d1c1b'; c.fillRect(0, 0, cv.width, cv.height);
      if (kind !== 'ora') { c.fillStyle = '#ec3013'; c.fillRect(0, cv.height - 26, cv.width, 26); }
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      const im = new Image(); im.onload = () => {
        const k = kind === 'ora' ? Math.min(cv.width / im.width, cv.height / im.height) : Math.min(cv.width * 0.6 / im.width, cv.height * 0.72 / im.height);
        const w = im.width * k, h = im.height * k; c.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2 - (kind === 'ora' ? 0 : 10), w, h); t.needsUpdate = true;
      };
      im.src = img; return t;
    };
    const FLAG_VS = `
      uniform float uT; uniform float uPhase; varying vec2 vUv; varying float vShade;
      #include <fog_pars_vertex>
      void main() {
        vUv = uv; vec3 p = position; float k = uv.x;   // 0 at the pole, 1 at the free end
        float w = sin(k * 7.0 - uT * 4.2 + uPhase) * 0.34 + sin(k * 13.0 - uT * 6.3 + uPhase * 1.7 + uv.y * 2.0) * 0.12;
        p.z += w * k; p.y -= k * k * 0.25 + sin(k * 5.0 - uT * 3.0) * 0.06 * k;
        vShade = 0.82 + 0.18 * cos(k * 7.0 - uT * 4.2 + uPhase);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`;
    const FLAG_FS = `
      uniform sampler2D map; varying vec2 vUv; varying float vShade;
      #include <fog_pars_fragment>
      void main() { vec4 c = texture2D(map, gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y)); gl_FragColor = vec4(c.rgb * vShade, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`;
    const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), silver = new THREE.MeshLambertMaterial({ color: 0xd9d9d6 });
    const make = (x, z, img, kind, phase) => {
      const g = new THREE.Group(); g.position.set(x, WATER_Y, z); g.rotation.y = -Math.PI / 2; scene.add(g);   // flags face the plaza (+x side looks back at the museum)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.9, 24), new THREE.MeshLambertMaterial({ color: 0xd8d2c8 })); base.position.y = 0.15; g.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 15, 12), silver); pole.position.y = 7.5; g.add(pole);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), ink); ball.position.y = 15.1; g.add(ball);
      const geo = new THREE.PlaneGeometry(FW, FH, 28, 12); geo.translate(FW / 2 + 0.12, 0, 0);
      const mat = new THREE.ShaderMaterial({ vertexShader: FLAG_VS, fragmentShader: FLAG_FS, side: THREE.DoubleSide, fog: true,
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uPhase: { value: phase }, map: { value: null } }]) });
      mat.uniforms.map.value = flagTex(img, kind);
      const flag = new THREE.Mesh(geo, mat); flag.position.y = 15 - FH / 2 - 0.2; g.add(flag);
      flags.push(mat); return g;
    };
    // centred out on the water in front of the welcome plaza, either side of the museum's axis
    make(44, -13, resolveImg('gallery/img/bcp_logo_white.webp'), 'bcp', 0);
    make(44, 13, resolveImg('gallery/img/ora_card_16x9_black_269773142.webp'), 'ora', 1.9);
    updaters.push(t => { for (const m of flags) m.uniforms.uT.value = t; });
  }

  // ---------------------------------------------------------------- 4. the city round the park
  {
    // park lawn that fills the gaps round the museum, then city streets beyond
    const PARK = { x0: -335, x1: 135, z0: -275, z1: 275 };
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(PARK.x1 - PARK.x0, PARK.z1 - PARK.z0), new THREE.MeshLambertMaterial({ color: 0x6f7a3c }));
    lawn.rotation.x = -Math.PI / 2; lawn.position.set((PARK.x0 + PARK.x1) / 2, -3.36, (PARK.z0 + PARK.z1) / 2); scene.add(lawn);
    const BLOCK = 74, ROAD = 14;
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
    const r = ROAD / BLOCK * 256;
    c.fillStyle = '#5c5d60'; c.fillRect(0, 0, 256, 256);                    // asphalt
    c.fillStyle = '#a9a69f'; c.fillRect(r, r, 256 - r, 256 - r);            // the block (pavement)
    c.fillStyle = '#9c998f'; c.fillRect(r + 6, r + 6, 256 - r - 12, 256 - r - 12);
    c.fillStyle = '#e8e3c8'; for (let i = 0; i < 256; i += 18) { c.fillRect(r / 2 - 1, i, 2, 9); c.fillRect(i, r / 2 - 1, 9, 2); }   // lane dashes
    c.fillStyle = '#f3f2f2'; for (let i = 0; i < 6; i++) { c.fillRect(r + 2 + i * 6, 2, 3, r - 4); c.fillRect(2, r + 2 + i * 6, r - 4, 3); }   // crossings
    const st = new THREE.CanvasTexture(cv); st.colorSpace = THREE.SRGBColorSpace; st.wrapS = st.wrapT = THREE.RepeatWrapping; st.anisotropy = 8;
    const SIZE = 3200; st.repeat.set(SIZE / BLOCK, SIZE / BLOCK); st.offset.set(0.5 - ((PARK.x0 - ROAD) / BLOCK) % 1, 0);
    const streets = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), new THREE.MeshLambertMaterial({ map: st }));
    streets.rotation.x = -Math.PI / 2; streets.position.set(-100, -3.42, 0); scene.add(streets);
    // towers on every block outside the park: taller towards a downtown to the north-west
    const boxes = [];
    for (let bx = -1500; bx < 1300; bx += BLOCK) for (let bz = -1500; bz < 1500; bz += BLOCK) {
      const x0 = bx + ROAD, z0 = bz + ROAD, x1 = bx + BLOCK, z1 = bz + BLOCK;
      if (x1 > PARK.x0 - 4 && x0 < PARK.x1 + 4 && z1 > PARK.z0 - 4 && z0 < PARK.z1 + 4) continue;
      const cxb = (x0 + x1) / 2, czb = (z0 + z1) / 2, dist = Math.hypot(cxb + 100, czb);
      if (dist > (lowEnd ? 1000 : 1300)) continue;
      const down = Math.exp(-Math.hypot(cxb + 520, czb + 420) / 380);   // downtown
      const split = rnd() < 0.55 ? 1 : 2, inner = BLOCK - ROAD - 6;
      for (let i = 0; i < split; i++) for (let j = 0; j < split; j++) {
        if (split === 2 && rnd() < 0.15) continue;
        const w = inner / split - 4 - rnd() * 4, d = inner / split - 4 - rnd() * 4;
        const h = (14 + rnd() * 26) * (1 + down * 4.5) * (rnd() < 0.08 ? 1.8 : 1) * (dist < 420 ? 0.7 : 1);
        boxes.push([x0 + 3 + (i + 0.5) * inner / split, z0 + 3 + (j + 0.5) * inner / split, w, h, d]);
      }
    }
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const mat = new THREE.ShaderMaterial({ vertexShader: CITY_VS, fragmentShader: CITY_FS, fog: true, uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]) });
    const city = new THREE.InstancedMesh(geo, mat, boxes.length), m4 = new THREE.Matrix4(), col = new THREE.Color();
    const tones = [0xe6e0d6, 0xcfd3d8, 0xb9bec4, 0xd9cbb8, 0xa9b4bf, 0xeeeae2, 0x9aa4ad, 0xc8b8a4];
    boxes.forEach(([x, z, w, h, d], i) => { m4.makeScale(w, h, d); m4.setPosition(x, -3.42, z); city.setMatrixAt(i, m4); city.setColorAt(i, col.setHex(tones[(rnd() * tones.length) | 0])); });
    city.frustumCulled = false; scene.add(city);
    // a few landmark towers on the skyline
    const spire = new THREE.MeshLambertMaterial({ color: 0xdfe6ec });
    for (const [x, z, h] of [[-560, -470, 260], [-430, -560, 210], [-660, -330, 180], [380, -640, 150], [-760, 520, 170]]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(9, 15, h, 6), spire); t.position.set(x, -3.4 + h / 2, z); scene.add(t);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(6, 40, 6), spire); tip.position.set(x, -3.4 + h + 20, z); scene.add(tip);
    }
    updaters.push(() => {});
    console.log('[world] trees repainted', repainted, '+', treePts.length, '· towers', boxes.length, '·', Math.round(performance.now() - t0), 'ms');
  }

  let t = 0;
  return { update(dt) { t += dt; for (const f of updaters) f(t); }, lake: LAKE, waterY: WATER_Y };
}
