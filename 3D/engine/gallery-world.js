// Blind Canvas gallery: the world around the museum.
//  • A lake: rippling, partly see-through water under the entrance bridge and out in front of the welcome plaza.
//  • Two flags out on the water (Blind Canvas Project and Ora) that wave in the wind.
//  • Cherry trees: the park's old green trees repainted in blossom, plus more along the shore.
//  • A city all round the park: streets and a skyline of towers fading into the haze.
// Everything is a handful of draw calls (instancing + small shaders) so it stays inside the phone budget.
import * as THREE from '../vendor/three/three.module.js';
import { buildEye } from './gallery-eye.js';
import { setStainedNight } from './gallery-stained.js';
import { GARDEN, RING, CAMPUS, inBuilding as onCampus, planGarden } from './gallery-garden-plan.js';
import { toCreasedNormals } from '../vendor/three/addons/BufferGeometryUtils.js';

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
  uniform float uT; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform float uAlpha; uniform float uNight; varying vec3 vW; varying float vH;
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
    col += mix(vec3(1.0, 0.9, 0.72), vec3(1.0, 0.85, 0.6) * 0.6, uNight) * pow(max(dot(N, H), 0.0), 90.0) * 0.45;
    col += uNight * vec3(1.0, 0.8, 0.5) * smoothstep(0.72, 0.8, noise(p * vec2(0.25, 3.0) + vec2(0.0, uT * 0.4))) * 0.22;   // city lights shimmering on the water
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
  uniform float uNight; varying vec3 vW; varying vec3 vN; varying vec3 vC; varying vec3 vL;
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
      float lit = step(mix(0.86, 0.42, uNight), hash(cell + floor(vW.xz * 0.01)));
      vec3 glass = mix(vec3(0.33, 0.42, 0.52), vec3(0.62, 0.72, 0.82), hash(cell * 1.7)) * (0.75 + 0.25 * light);
      col *= mix(1.0, 0.16, uNight); glass *= mix(1.0, 0.22, uNight);
      col = mix(col, mix(glass, vec3(1.0, 0.84, 0.55) * mix(1.0, 1.25, uNight), lit * mix(0.55, 1.0, uNight)), win * 0.9);
      col *= 0.92 + 0.08 * step(0.5, fract(f.y / 3.6 * 0.5));
    } else col *= 0.86 * mix(1.0, 0.16, uNight);
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }`;

export function buildWorld({ scene, camera, renderer, groundAt, resolveImg, lowEnd }) {
  const t0 = performance.now();
  // a hazier, deeper view so the skyline shows
  if (scene.fog) { scene.fog.near = 170; scene.fog.far = lowEnd ? 900 : 1150; }
  camera.far = 1600; camera.updateProjectionMatrix();
  const updaters = [];
  let cityMat = null, waterMat = null;
  // the model's old lawn sits a few cm above some floors and peeks along wall bases: drop it out of sight (looks only; walking is unchanged)
  // the building's white shell: smooth the curves (flat faces stay crisp: only edges under 32 degrees are rounded)
  // and paint pure-black parts a deep charcoal, so they read as surfaces rather than holes
  let smoothed = 0;
  scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || !o.geometry.attributes.normal) return;
    const m0 = Array.isArray(o.material) ? o.material[0] : o.material;
    if (m0 && /^Palette/.test(m0.name || '') && o.geometry.attributes.position.count >= 60 && !Array.isArray(o.material)) {
      try { const g = toCreasedNormals(o.geometry, THREE.MathUtils.degToRad(32)); o.geometry = g; smoothed++; } catch (e) {}
    }
    for (const m of [].concat(o.material)) if (m && m.name === 'black' && m.color && m.color.getHex() === 0) m.color.set(0x2b2a29);
    // (28 Oct, Ben: polish the front) the big dark canopy over the eye: smoother (curves under 60° round off, so the facets
    // stop reading as flat plates) and, at the front only (x > -40), a deep Ora navy that ties the shell to the eye's blue glass,
    // a little lighter toward its crown. The rest of the building's dark parts stay charcoal (per-vertex colours).
    if (o.name === 'Meditate_with_Morten__15_' && !o.userData.frontTone) { o.userData.frontTone = true;
      try { o.geometry = toCreasedNormals(o.geometry, THREE.MathUtils.degToRad(60)); } catch (e) {}
      const pos = o.geometry.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3(); o.updateWorldMatrix(true, false);
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); const k = THREE.MathUtils.smoothstep(v.x, -44, -36), up = THREE.MathUtils.smoothstep(v.y, 6, 20);
        col[i * 3] = 1 + (0.55 + 0.25 * up - 1) * k; col[i * 3 + 1] = 1 + (0.9 + 0.3 * up - 1) * k; col[i * 3 + 2] = 1 + (2.4 + 0.9 * up - 1) * k; }
      o.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      o.material = [].concat(o.material).map(m => { const c = m.clone(); c.vertexColors = true; return c; }); if (o.material.length === 1) o.material = o.material[0]; }
  });
  scene.traverse(o => { if (o.isMesh && /^Plane001/.test(o.name)) { o.position.y -= 0.2; o.updateMatrix(); o.updateMatrixWorld(true); } });

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
    [-285, -32, 20, 32], [-86, -80, -54, 152], [-48, -86, -10, 86], [-130, -30, -60, 30], [GARDEN.x0 - 2, GARDEN.z0 - 2, GARDEN.x1 + 2, GARDEN.z1 + 2],
  ];
  const treePts = [];
  for (let tries = 0; treePts.length < (lowEnd ? 90 : 170) && tries < 6000; tries++) {
    const x = -175 + rnd() * 220, z = (rnd() - 0.5) * 480;
    if (keepOut.some(([a, b, c, d]) => x > a - 3 && x < c + 3 && z > b - 3 && z < d + 3)) continue;
    if (treePts.some(p => Math.hypot(p[0] - x, p[1] - z) < 7)) continue;
    treePts.push([x, z]);
  }
  // (22 Oct) a tree must stand on the ground: one that would land on a roof (the New Artists Wing's south half went up over two)
  // is dropped; the garden's trees stand on its lawn, whatever is under their middle (the big tree's trunk post had lifted it 3 m)
  for (let i = treePts.length - 1; i >= 0; i--) { const g = groundAt(treePts[i][0], 5, treePts[i][1]); if (g > -2.2) treePts.splice(i, 1); else treePts[i][3] = g; }
  const uWind = { value: 0 }; updaters.push(t => { uWind.value = t; });
  {
    const card = new THREE.PlaneGeometry(1, 1); card.translate(0, 0.5, 0);
    const cross = new THREE.BufferGeometry(), a = card.clone(), b = card.clone(); b.rotateY(Math.PI / 2);
    const merge = (g1, g2) => { const p = [...g1.attributes.position.array, ...g2.attributes.position.array], uv = [...g1.attributes.uv.array, ...g2.attributes.uv.array], n = g1.attributes.position.count, ix = [...g1.index.array, ...[...g2.index.array].map(v => v + n)]; cross.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); cross.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cross.setIndex(ix); cross.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(p.length / 3).fill(0).flatMap(() => [0, 1, 0]), 3)); };   // foliage lit from above, the same on both sides
    merge(a, b);
    const mat = new THREE.MeshLambertMaterial({ map: round, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
    const im = new THREE.InstancedMesh(cross, mat, treePts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    treePts.forEach(([x, z, sc, g], i) => { const s = sc || 9 + rnd() * 6; m4.compose(new THREE.Vector3(x, g > -100 ? g - 0.1 : -3.35, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI), new THREE.Vector3(s * (0.9 + rnd() * 0.3), s, s)); im.setMatrixAt(i, m4); });
    im.frustumCulled = false; scene.add(im);
  }
  // (27 Oct, park polish) the garden's cherry trees: three cards each (full from every side), two blossom pictures, a touch of
  // colour per tree and a slow sway in the crown; petals drift down under them. 3 draw calls.
  {
    const gTrees = planGarden().trees;
    const tri = new THREE.BufferGeometry(), P = [], UV = [], IX = [];
    for (const a of [0, Math.PI / 3, Math.PI * 2 / 3]) { const g = new THREE.PlaneGeometry(1, 1); g.translate(0, 0.5, 0); g.rotateY(a); const n = P.length / 3; P.push(...g.attributes.position.array); UV.push(...g.attributes.uv.array); IX.push(...[...g.index.array].map(v => v + n)); }
    tri.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); tri.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); tri.setIndex(IX);
    tri.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(P.length / 3).fill(0).flatMap(() => [0, 1, 0]), 3));
    const pics = [round, cherryCanvas(512, 512, 41)], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    pics.forEach((map, v) => {
      const list = gTrees.filter((t, i) => (i === 0 ? 0 : i % 2) === v);
      const mat = new THREE.MeshLambertMaterial({ map, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
      mat.onBeforeCompile = sh => { sh.uniforms.uT = uWind; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float sw = position.y * position.y; vec2 ph = vec2(instanceMatrix[3][0], instanceMatrix[3][2]) * 0.13;
        transformed.x += sw * 0.035 * sin(uT * 0.8 + ph.x); transformed.z += sw * 0.025 * sin(uT * 0.63 + ph.y);`); };
      mat.customProgramCacheKey = () => 'gtree';
      const im = new THREE.InstancedMesh(tri, mat, list.length);
      list.forEach(([x, z, sc], i) => { m4.compose(new THREE.Vector3(x, GARDEN.y - 0.1, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI), new THREE.Vector3(sc * (0.95 + rnd() * 0.2), sc, sc * (0.95 + rnd() * 0.2))); im.setMatrixAt(i, m4);
        im.setColorAt(i, col.setRGB(1, 0.93 + rnd() * 0.07, 0.95 + rnd() * 0.05)); });
      im.frustumCulled = false; scene.add(im);
    });
    // falling petals: one point cloud, moved in the shader
    const N = lowEnd ? 160 : 340, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { const t = gTrees[i % gTrees.length], a = rnd() * 6.283, d = Math.sqrt(rnd()) * t[2] * 0.42; pos[i * 3] = t[0] + Math.cos(a) * d; pos[i * 3 + 1] = t[2] * (0.45 + rnd() * 0.3); pos[i * 3 + 2] = t[1] + Math.sin(a) * d; seed[i] = rnd(); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const pm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uSize: { value: 90 } }]),
      vertexShader: `uniform float uT; uniform float uSize; attribute float aSeed; varying float vA;
        #include <fog_pars_vertex>
        void main() { float f = fract(uT * (0.05 + 0.04 * fract(aSeed * 7.1)) + aSeed);
          vec3 p = position; p.y *= 1.0 - f; p.x += sin(uT * 0.9 + aSeed * 40.0) * 0.7 + f * 2.2; p.z += cos(uT * 0.7 + aSeed * 30.0) * 0.6;
          vec4 mvPosition = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = uSize * (0.7 + 0.6 * fract(aSeed * 3.7)) / max(-mvPosition.z, 1.0); vA = smoothstep(0.0, 0.06, f) * smoothstep(1.0, 0.92, f);
          #include <fog_vertex>
        }`,
      fragmentShader: `varying float vA;
        #include <fog_pars_fragment>
        void main() { vec2 d = gl_PointCoord - 0.5; d.x *= 1.6; if (dot(d, d) > 0.25) discard; gl_FragColor = vec4(0.98, 0.76, 0.85, vA);
          #include <fog_fragment>
        }` });
    const petalsPts = new THREE.Points(pg, pm); petalsPts.frustumCulled = false; scene.add(petalsPts);
    const proj = () => { pm.uniforms.uSize.value = 0.11 * renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360)); };
    updaters.push(t => { pm.uniforms.uT.value = t; if (!(t % 1 < 0.02)) return; proj(); }); proj();
  }

  // ---------------------------------------------------------------- 2. the lake
  const WATER_Y = -2.95, POOL = { x0: -29.4, x1: -13.3, z0: -16, z1: 16, y: -0.22 };   // (28 Oct, Ben) raised 0.53 m to just under the bridge deck (0.02): it now covers the wooden bowl out to about z ±11.5 either side
  const LAKE = { x0: -43.6, x1: GARDEN.x0, z0: -84, z1: 84 };   // between the museum's eye and the welcome plaza, under the bridge
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
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uDeep: { value: new THREE.Color(0x14506a) }, uShallow: { value: new THREE.Color(0x3aa0b4) }, uSky: { value: new THREE.Color(0xcfe6f4) }, uAlpha: { value: 0.66 }, uNight: { value: 0 } }]),
    }));
    water.rotation.x = -Math.PI / 2; water.position.set(lcx, WATER_Y, lcz); water.renderOrder = 1; scene.add(water);
    waterMat = water.material;
    updaters.push(t => { water.material.uniforms.uT.value = t; });
    // (22 Oct) the pools either side of the bridge, inside the eye: raised up to just below the bridge so you see the water as you
    // walk over it into the museum (the lake's own level is down under the eye's wooden bowl there). Same water, one plane: the
    // bridge hides its middle, and it meets the bowl's rising sides in a natural shoreline. The uplights and mist sit on it.
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(POOL.x1 - POOL.x0, POOL.z1 - POOL.z0, 48, 48), water.material);
    pool.rotation.x = -Math.PI / 2; pool.position.set((POOL.x0 + POOL.x1) / 2, POOL.y, (POOL.z0 + POOL.z1) / 2); pool.renderOrder = 1; scene.add(pool);
    // (27 Oct, Ben) inside the first room the water used to stop in mid-air over the floor: a stone lip now holds it in, along the
    // water's west edge from the walkway out to each wall, with a darker coping stone on top
    { const lipM = new THREE.MeshLambertMaterial({ color: 0xd8d2c8 }), capM = new THREE.MeshLambertMaterial({ color: 0x8f877c }), FL = -3.38, TOP = WATER_Y + 0.12, X = LAKE.x0 - 0.18;
      for (const s of [-1, 1]) { const z0 = 2.35, z1 = 16.5, L = z1 - z0, zc = s * (z0 + L / 2);
        const lip = new THREE.Mesh(new THREE.BoxGeometry(0.36, TOP - FL, L), lipM); lip.position.set(X, (TOP + FL) / 2, zc); scene.add(lip);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, L), capM); cap.position.set(X, TOP + 0.035, zc); scene.add(cap); } }
    // a pale stone rim round the lake (the museum side is the building itself)
    const stone = new THREE.MeshLambertMaterial({ color: 0xd8d2c8 });
    const rim = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, d), stone); m.position.set(x, -3.0, z); scene.add(m); };
    rim(lakeW + 2, 1.2, lcx, LAKE.z0 - 0.6); rim(lakeW + 2, 1.2, lcx, LAKE.z1 + 0.6);   // (the garden's stone terrace wall is the east shore)
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
      const g = new THREE.Group(); g.position.set(x, GARDEN.y, z); g.rotation.y = z < 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(g);   // on the ring path, flying in towards the way to the museum
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 0.6, 24), new THREE.MeshLambertMaterial({ color: 0xd8d2c8 })); base.position.y = 0.3; g.add(base);
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
    const flagImg = { bcp: 'gallery/img/bcp_logo_white.webp', ora: 'gallery/img/ora_card_16x9_black_269773142.webp' };
    // (27 Oct, Ben) the two tall flagpoles REMOVED for a calmer park (CAMPUS.flags stays as data so the path layout doesn't reshuffle)
    if (false) CAMPUS.flags.forEach(([x, z, kind], i) => make(x, z, resolveImg(flagImg[kind]), kind, i * 1.9));   // either side of the way to the museum, as you set off from the big tree
    updaters.push(t => { for (const m of flags) m.uniforms.uT.value = t; });
  }

  // ---------------------------------------------------------------- 3b. the cherry blossom garden (where the lake used to be)
  let lanternMat = null, lampGlobeMat = null, lampGlowMat = null, lanternGlowMat = null, lampPoolMat = null, bannerMat = null;
  {
    const G = GARDEN, plan = planGarden(), gw = G.x1 - G.x0, gd = G.z1 - G.z0;
    // the lawn: one painted texture with the gravel walks, the dry river of petals and petal drifts under the trees
    const TS = lowEnd ? 1024 : 2048, cv = document.createElement('canvas'); cv.width = cv.height = TS; const c = cv.getContext('2d');
    const U = x => (x - G.x0) / gw * TS, V = z => (z - G.z0) / gd * TS, PX = TS / gw;
    c.fillStyle = '#6f8f3e'; c.fillRect(0, 0, TS, TS);
    for (let i = 0; i < TS * 6; i++) { const g = 110 + rnd() * 60; c.fillStyle = `rgba(${50 + rnd() * 40},${g},${40 + rnd() * 30},${0.25 + rnd() * 0.3})`; c.fillRect(rnd() * TS, rnd() * TS, 2 + rnd() * 3, 2 + rnd() * 3); }
    // petal drifts under every tree, the river of petals
    const petals = (x, z, r, n, a = 0.75) => { for (let i = 0; i < n; i++) { const an = rnd() * 6.283, d = Math.sqrt(rnd()) * r; c.fillStyle = ['#f7c3d6', '#f4aac6', '#ffd6e6', '#fbe3ee'][(rnd() * 4) | 0]; c.globalAlpha = a * (0.4 + rnd() * 0.6); c.beginPath(); c.ellipse(U(x + Math.cos(an) * d), V(z + Math.sin(an) * d), PX * (0.07 + rnd() * 0.08), PX * (0.05 + rnd() * 0.05), rnd() * 3, 0, 6.283); c.fill(); } c.globalAlpha = 1; };
    for (const [x, z, sc] of plan.trees) petals(x, z, sc * 0.42, Math.round(sc * 60 * (TS / 2048)));
    c.lineCap = c.lineJoin = 'round';
    c.strokeStyle = '#f2b9cf'; c.lineWidth = PX * 3.4; c.beginPath(); plan.river.forEach(([x, z], i) => i ? c.lineTo(U(x), V(z)) : c.moveTo(U(x), V(z))); c.stroke();
    for (let i = 0; i < plan.river.length - 1; i++) { const [x, z] = plan.river[i]; petals(x, z, 2.2, Math.round(160 * TS / 2048), 0.95); }
    // gravel walks with a darker edge
    for (const [col, extra] of [['#9c8f78', 0.5], ['#d9cdb4', 0]]) { c.strokeStyle = col; for (const p of plan.paths) { c.lineWidth = PX * (p.w + extra); c.beginPath(); p.pts.forEach(([x, z], i) => i ? c.lineTo(U(x), V(z)) : c.moveTo(U(x), V(z))); c.stroke(); } }
    for (let i = 0; i < TS * 3; i++) { const x = G.x0 + rnd() * gw, z = G.z0 + rnd() * gd; if (plan.pathDist(x, z) < 0) { c.fillStyle = `rgba(${120 + rnd() * 80},${110 + rnd() * 70},${90 + rnd() * 60},0.5)`; c.fillRect(U(x), V(z), 2, 2); } }
    // a round stone court under the big tree
    c.fillStyle = '#cfc4ad'; c.beginPath(); c.arc(U(RING.x), V(RING.z), PX * 6.5, 0, 6.283); c.fill(); petals(RING.x, RING.z, 6.5, Math.round(500 * TS / 2048), 0.9);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const lawnM = new THREE.MeshLambertMaterial({ map: tex });
    const lawnPlane = (x0, x1, z0, z1) => {   // a piece of the lawn, its UVs taken from the one big picture
      const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, G.y + 0.005, (z0 + z1) / 2);
      const pa = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < pa.count; i++) uv.setXY(i, (pa.getX(i) - G.x0) / gw, 1 - (pa.getZ(i) - G.z0) / gd);
      const m = new THREE.Mesh(g, lawnM); scene.add(m); return m; };
    tex.flipY = true;
    lawnPlane(G.plaza.x1, G.x1, G.z0, G.z1); lawnPlane(G.x0, G.plaza.x1, G.plaza.z, G.z1); lawnPlane(G.x0, G.plaza.x1, G.z0, -G.plaza.z);
    // (27 Oct, park polish 2) grass, walks and edging. Own random numbers so the city's layout doesn't reshuffle.
    {
      let s2 = 4242; const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
      const CV = (w, h, draw) => { const cc = document.createElement('canvas'); cc.width = w; cc.height = h; draw(cc.getContext('2d'), w, h); return cc; };
      // 1. the lawn up close: a tiling blade texture (fine + broad scale) and soft mowing stripes, mixed into the painted lawn in its shader
      const detT = new THREE.CanvasTexture(CV(256, 256, (g, w) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, w);
        for (let i = 0; i < 5200; i++) { const x = r2() * w, y = r2() * w, l = 2 + r2() * 5, v = 60 + r2() * 140 | 0; g.strokeStyle = `rgba(${v},${v},${v},0.55)`; g.lineWidth = 1 + r2();
          for (const [ox, oy] of [[0, 0], [-w, 0], [0, -w], [-w, -w]]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + (r2() - 0.5) * 2, y + oy - l); g.stroke(); } } }));
      detT.wrapS = detT.wrapT = THREE.RepeatWrapping; detT.anisotropy = 8;
      lawnM.onBeforeCompile = sh => { sh.uniforms.uDet = { value: detT };
        sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vWp = (modelMatrix * vec4(position, 1.0)).xyz;');
        sh.fragmentShader = 'uniform sampler2D uDet; varying vec3 vWp;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
          float g1 = texture2D(uDet, vWp.xz / 3.2).r, g2 = texture2D(uDet, vWp.xz / 23.0 + 0.37).r;
          float stripe = 1.0 + 0.045 * smoothstep(-0.25, 0.25, sin(vWp.x * 1.0472 + 0.3 * sin(vWp.z * 0.05)));
          diffuseColor.rgb *= (0.8 + 0.4 * g1) * (0.9 + 0.2 * g2) * stripe;`); };
      lawnM.customProgramCacheKey = () => 'lawn2'; lawnM.needsUpdate = true;
      // 2. the walks: flagstone paving (world-space, so walks that meet line up), darker at the edges; a low stone kerb either side
      const pave = CV(512, 512, (g, w) => { g.fillStyle = '#7d725d'; g.fillRect(0, 0, w, w); const RH = 128, tones = ['#ddd0b4', '#cbbb9a', '#bfae8e', '#e3d8c0', '#b8a888', '#d2c3a4', '#c9bfae'];
        for (let row = 0; row < 4; row++) { let x = r2() * 120; const end = x + w; while (x < end - 1) { const sw = Math.min(end - x, 120 + r2() * 150); const tone = tones[(r2() * tones.length) | 0];
            for (const ox of [0, -w]) { g.fillStyle = tone; g.fillRect(x + ox + 3, row * RH + 3, sw - 6, RH - 6); g.fillStyle = 'rgba(255,250,235,0.35)'; g.fillRect(x + ox + 3, row * RH + 3, sw - 6, 3); g.fillStyle = 'rgba(70,60,45,0.25)'; g.fillRect(x + ox + 3, row * RH + RH - 6, sw - 6, 3); }
            x += sw; } }
        for (let i = 0; i < 9000; i++) { const v = r2() < 0.5 ? 'rgba(90,80,62,0.18)' : 'rgba(255,248,230,0.16)'; g.fillStyle = v; g.fillRect(r2() * w, r2() * w, 1 + r2() * 2, 1 + r2() * 2); }
        for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(110,130,70,0.35)'; g.beginPath(); g.ellipse(r2() * w, ((r2() * 4) | 0) * RH + (r2() < 0.5 ? 2 : RH - 2), 6 + r2() * 10, 2, 0, 0, 6.283); g.fill(); }   // a little moss in the joints
      });
      const paveT = new THREE.CanvasTexture(pave); paveT.colorSpace = THREE.SRGBColorSpace; paveT.wrapS = paveT.wrapT = THREE.RepeatWrapping; paveT.anisotropy = 8;
      const segD = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
      const inOther = (x, z, self, m) => plan.paths.some((p, k) => k !== self && p.pts.some((q, i) => i < p.pts.length - 1 && segD(x, z, q, p.pts[i + 1]) < p.w / 2 + m));
      const frame = pts => { const n = pts.length, closed = Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) < 0.01, nrm = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1; return [dx / L, dz / L]; };
        return pts.map((p, i) => { let a = pts[i - 1], b = pts[i + 1]; if (closed && i === 0) a = pts[n - 2]; if (closed && i === n - 1) b = pts[1];
          const d1 = a ? nrm(a, p) : null, d2 = b ? nrm(p, b) : null; let tx = (d1 ? d1[0] : 0) + (d2 ? d2[0] : 0), tz = (d1 ? d1[1] : 0) + (d2 ? d2[1] : 0); const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
          const nx = -tz, nz = tx, d = d2 || d1, k = 1 / Math.max(0.6, nx * -d[1] + nz * d[0]); return [p[0], p[1], nx * k, nz * k]; }); };
      const wp = [], wu = [], wc = [], wi = [], kp = [], Y = G.y + 0.02, KY = G.y + 0.075, KW = 0.2;
      plan.paths.forEach((p, self) => { const f = frame(p.pts), h = p.w / 2, base = wp.length / 3;
        f.forEach(([x, z, nx, nz]) => { for (const [s, c] of [[-1, 0.8], [0, 1], [1, 0.8]]) { const X = x + nx * h * s, Z = z + nz * h * s; wp.push(X, Y, Z); wu.push(X / 3, Z / 3); wc.push(c, c, c * 0.97); } });
        for (let i = 0; i < f.length - 1; i++) { const a = base + i * 3, b = a + 3; wi.push(a, a + 1, b, a + 1, b + 1, b, a + 1, a + 2, b + 1, a + 2, b + 2, b + 1); }
        if (p.w > 5) return;   // (the forecourts meet buildings: no kerb)
        for (const s of [-1, 1]) for (let i = 0; i < f.length - 1; i++) { const A = f[i], B = f[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]), steps = Math.max(1, Math.round(L / 1.2));
          for (let j = 0; j < steps; j++) { const P = t => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, A[3] + (B[3] - A[3]) * t], u = P(j / steps), v = P((j + 1) / steps);
            const mx = (u[0] + v[0]) / 2 + (u[2] + v[2]) / 2 * s * (h + KW / 2), mz = (u[1] + v[1]) / 2 + (u[3] + v[3]) / 2 * s * (h + KW / 2);
            if (inOther(mx, mz, self, 0.15) || mx < 9 && Math.abs(mz) < 15.5 || onCampus(mx, mz, 0.2)) continue;
            const e = (q, o) => [q[0] + q[2] * s * o, q[1] + q[3] * s * o], i0 = e(u, h), o0 = e(u, h + KW), i1 = e(v, h), o1 = e(v, h + KW);
            const quad = (a, b, c, d) => kp.push(...a, ...b, ...c, ...a, ...c, ...d);
            const T = (q, y) => [q[0], y, q[1]];
            if (s > 0) { quad(T(i0, KY), T(i1, KY), T(o1, KY), T(o0, KY)); quad(T(o0, KY), T(o1, KY), T(o1, G.y), T(o0, G.y)); quad(T(i0, G.y), T(i1, G.y), T(i1, KY), T(i0, KY)); }
            else { quad(T(i0, KY), T(o0, KY), T(o1, KY), T(i1, KY)); quad(T(o0, KY), T(o0, G.y), T(o1, G.y), T(o1, KY)); quad(T(i0, G.y), T(i0, KY), T(i1, KY), T(i1, G.y)); }
          } } });
      const walkG = new THREE.BufferGeometry(); walkG.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); walkG.setAttribute('uv', new THREE.Float32BufferAttribute(wu, 2)); walkG.setAttribute('color', new THREE.Float32BufferAttribute(wc, 3)); walkG.setIndex(wi);
      walkG.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(wp.length / 3).fill(0).flatMap(() => [0, 1, 0]), 3));
      { const base = wp.length / 3, R = 6.5, N = 48; wp.push(RING.x, Y, RING.z); wu.push(RING.x / 3, RING.z / 3); wc.push(1, 1, 0.97);   // the round court under the big tree, paved to match
        for (let i = 0; i <= N; i++) { const a = i / N * 6.283, x = RING.x + Math.cos(a) * R, z = RING.z + Math.sin(a) * R; wp.push(x, Y, z); wu.push(x / 3, z / 3); wc.push(0.82, 0.82, 0.8); if (i) wi.push(base, base + i + 1, base + i); }
        walkG.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); walkG.setAttribute('uv', new THREE.Float32BufferAttribute(wu, 2)); walkG.setAttribute('color', new THREE.Float32BufferAttribute(wc, 3)); walkG.setIndex(wi);
        walkG.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(wp.length / 3).fill(0).flatMap(() => [0, 1, 0]), 3));
        const kr = new THREE.Mesh(new THREE.TorusGeometry(R + 0.08, 0.1, 4, 64), new THREE.MeshLambertMaterial({ color: 0xbdb3a2 })); kr.rotation.x = -Math.PI / 2; kr.scale.z = 0.6; kr.position.set(RING.x, G.y + 0.03, RING.z); scene.add(kr); }
      const walk = new THREE.Mesh(walkG, new THREE.MeshLambertMaterial({ map: paveT, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1 })); scene.add(walk);
      const kerbG = new THREE.BufferGeometry(); kerbG.setAttribute('position', new THREE.Float32BufferAttribute(kp, 3)); kerbG.computeVertexNormals();
      scene.add(new THREE.Mesh(kerbG, new THREE.MeshLambertMaterial({ color: 0xbdb3a2, side: THREE.DoubleSide })));
      // 3. grass tufts and a few wild flowers on the lawn, thicker along the walk edges; they sway with the trees
      const tuftCv = flowers => CV(128, 128, (g, w, h) => { for (let i = 0; i < 46; i++) { const x = 10 + r2() * 108, lean = (r2() - 0.5) * 34, tall = h * (0.45 + r2() * 0.5), gr = g.createLinearGradient(0, h, 0, h - tall);
          gr.addColorStop(0, '#5d7d32'); gr.addColorStop(1, ['#9cbc56', '#88ad48', '#b0c968'][(r2() * 3) | 0]); g.strokeStyle = gr; g.lineWidth = 2 + r2() * 2.5; g.lineCap = 'round';
          g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + lean * 0.3, h - tall * 0.6, x + lean, h - tall); g.stroke();
          if (flowers && r2() < 0.28) { g.fillStyle = ['#fbf7ee', '#f4d34a', '#c9b8f2', '#f6b7cf'][(r2() * 4) | 0]; g.beginPath(); g.arc(x + lean, h - tall, 4 + r2() * 2, 0, 6.283); g.fill(); g.fillStyle = '#e8b430'; g.beginPath(); g.arc(x + lean, h - tall, 1.6, 0, 6.283); g.fill(); } } });
      const cross = new THREE.BufferGeometry(), CP = [], CU = [], CI = [];
      for (const a of [0, Math.PI / 2]) { const pg = new THREE.PlaneGeometry(1, 1); pg.translate(0, 0.5, 0); pg.rotateY(a); const n0 = CP.length / 3; CP.push(...pg.attributes.position.array); CU.push(...pg.attributes.uv.array); CI.push(...[...pg.index.array].map(v => v + n0)); }
      cross.setAttribute('position', new THREE.Float32BufferAttribute(CP, 3)); cross.setAttribute('uv', new THREE.Float32BufferAttribute(CU, 2)); cross.setIndex(CI);
      cross.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(CP.length / 3).fill(0).flatMap(() => [0, 1, 0]), 3));
      const spots = (n, pick) => { const out = []; for (let tries = 0; out.length < n && tries < n * 30; tries++) { const x = G.x0 + 1.5 + r2() * (gw - 3), z = G.z0 + 1.5 + r2() * (gd - 3);
        if (x < 9 && Math.abs(z) < 15.5 || onCampus(x, z, 0.6) || Math.hypot(x - RING.x, z - RING.z) < 7.2 || plan.riverDist(x, z) < 1.8) continue; const d = plan.pathDist(x, z); if (d < 0.25 || !pick(d, x, z)) continue; out.push([x, z]); } return out; };
      const tuftSet = (cv, pts, size) => { const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
        const m = new THREE.MeshLambertMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide });
        m.onBeforeCompile = sh => { sh.uniforms.uT = uWind; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          float ph = instanceMatrix[3][0] * 0.21 + instanceMatrix[3][2] * 0.17; transformed.x += position.y * 0.12 * sin(uT * 1.7 + ph); transformed.z += position.y * 0.08 * sin(uT * 1.3 + ph * 1.3);`); };
        m.customProgramCacheKey = () => 'tuft';
        const im = new THREE.InstancedMesh(cross, m, pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
        pts.forEach(([x, z], i) => { const s = size * (0.7 + r2() * 0.6); m4.compose(new THREE.Vector3(x, G.y, z), q.setFromAxisAngle(up, r2() * 3.14), new THREE.Vector3(s * (1 + r2() * 0.5), s, s)); im.setMatrixAt(i, m4); });
        im.frustumCulled = false; scene.add(im); };
      tuftSet(tuftCv(false), spots(lowEnd ? 520 : 1400, d => d < 1.6 || r2() < 0.28), 0.36);
      tuftSet(tuftCv(true), spots(lowEnd ? 110 : 260, (d, x, z) => (Math.sin(x * 0.11) + Math.cos(z * 0.09) > 0.9 || d < 1.2) && r2() < 0.6), 0.4);   // wildflowers in drifts and along the edges
    }
    // the terrace's stone wall down to the park (and into the lake on the west), and a clipped hedge along the top
    const stoneM = new THREE.MeshLambertMaterial({ color: 0xd8d2c8 });
    const wall = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 3.7, d), stoneM); m.position.set(x, G.y - 1.85, z); scene.add(m); };
    wall(gw + 0.8, 0.8, (G.x0 + G.x1) / 2, G.z1 + 0.4); wall(gw + 0.8, 0.8, (G.x0 + G.x1) / 2, G.z0 - 0.4); wall(0.8, gd + 0.8, G.x1 + 0.4, 0);
    const sl = G.z1 - G.plaza.z; wall(0.8, sl, G.x0 - 0.4, G.plaza.z + sl / 2); wall(0.8, sl, G.x0 - 0.4, -G.plaza.z - sl / 2);
    const hcv = document.createElement('canvas'); hcv.width = hcv.height = 128; const hc = hcv.getContext('2d'); hc.fillStyle = '#2f5a2a'; hc.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) { hc.fillStyle = `rgba(${40 + rnd() * 50},${90 + rnd() * 70},${40 + rnd() * 30},0.8)`; hc.beginPath(); hc.arc(rnd() * 128, rnd() * 128, 1.5 + rnd() * 2.5, 0, 6.283); hc.fill(); }
    const htex = new THREE.CanvasTexture(hcv); htex.colorSpace = THREE.SRGBColorSpace; htex.wrapS = htex.wrapT = THREE.RepeatWrapping;
    const hedge = (w, d, x, z) => { const t = htex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(w, d) / 1.5, 1); const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), new THREE.MeshLambertMaterial({ map: t })); m.position.set(x, G.y + 0.55, z); scene.add(m); };
    hedge(gw, 0.9, (G.x0 + G.x1) / 2, G.z1 - 0.45); hedge(gw, 0.9, (G.x0 + G.x1) / 2, G.z0 + 0.45); hedge(0.9, gd, G.x1 - 0.45, 0);
    hedge(0.9, sl, G.x0 + 0.45, G.plaza.z + sl / 2); hedge(0.9, sl, G.x0 + 0.45, -G.plaza.z - sl / 2);
    // stone lanterns (tōrō): one instanced stone body + one glowing window (warm at night)
    {
      const parts = [[0.9, 0.18, 0.9, 0.09], [0.32, 0.55, 0.32, 0.45], [0.75, 0.12, 0.75, 0.78], [0.6, 0.42, 0.6, 1.05], [0.95, 0.14, 0.95, 1.33], [0.5, 0.18, 0.5, 1.47], [0.18, 0.16, 0.18, 1.62]];
      const geos = parts.map(([w, h, d, y]) => { const b = new THREE.BoxGeometry(w, h, d); b.translate(0, y, 0); return b; });
      const merge = list => { const pos = [], nor = []; for (const g of list) { const n = g.toNonIndexed(); pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); } const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return o; };
      const body = new THREE.InstancedMesh(merge(geos), new THREE.MeshLambertMaterial({ color: 0xb9b2a6 }), plan.lanterns.length);
      lanternMat = new THREE.MeshBasicMaterial({ color: 0x8a7a5c });
      const win = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.26, 0.62).translate(0, 1.06, 0), lanternMat, plan.lanterns.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      plan.lanterns.forEach(([x, z], i) => { m4.compose(new THREE.Vector3(x, G.y, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (i * 0.7) % 1.57), new THREE.Vector3(1, 1, 1)); body.setMatrixAt(i, m4); win.setMatrixAt(i, m4); });
      scene.add(body, win);
    }
    // (27 Oct) LIGHT POLES along the walks, built like Meru's banner poles: an ink pole, two arms, two BLIND CANVAS PROJECT banners
    // swaying in the wind and a lamp on top. No real lights: a glowing globe, a glow sprite cloud and a soft pool on the ground.
    {
      const poles = plan.poles, n = poles.length;
      const geoOf = (g, x, y, z) => { g.translate(x, y, z); return g; };
      const merge = list => { const pos = [], nor = []; for (const g of list) { const nn = g.toNonIndexed(); pos.push(...nn.attributes.position.array); nor.push(...nn.attributes.normal.array); } const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return o; };
      const poleGeo = merge([geoOf(new THREE.CylinderGeometry(0.09, 0.13, 6.4, 8), 0, 3.2, 0), geoOf(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 8), 0, 0.25, 0), geoOf(new THREE.BoxGeometry(2.6, 0.07, 0.07), 0, 6.0, 0), geoOf(new THREE.BoxGeometry(2.6, 0.07, 0.07), 0, 3.4, 0),
        geoOf(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 8), 0, 6.48, 0), geoOf(new THREE.ConeGeometry(0.42, 0.32, 8), 0, 7.16, 0)]);
      const poleI = new THREE.InstancedMesh(poleGeo, new THREE.MeshLambertMaterial({ color: 0x201e1d }), n);
      lampGlobeMat = new THREE.MeshBasicMaterial({ color: 0xd9d4c8 });
      const globeI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 12, 8).translate(0, 6.82, 0), lampGlobeMat, n);
      // the banner: ink cloth, the white logo, a red band, a swallowtail; reads the right way round from both sides
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 608; const c = cv.getContext('2d');
      const paint = im => { c.clearRect(0, 0, 256, 608); c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 608); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 256, 34); c.fillRect(0, 470, 256, 18);
        c.fillStyle = '#f3f2f2'; c.fillRect(0, 34, 256, 4);
        if (im) { const k = 220 / im.width, h = im.height * k; c.drawImage(im, 18, 60 + (390 - h) / 2, 220, h); }
        c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.moveTo(0, 608); c.lineTo(128, 540); c.lineTo(256, 608); c.fill(); c.globalCompositeOperation = 'source-over'; };
      paint(null);
      const btex = new THREE.CanvasTexture(cv); btex.colorSpace = THREE.SRGBColorSpace; btex.anisotropy = 4; btex.flipY = true;
      { const im = new Image(); im.onload = () => { paint(im); btex.needsUpdate = true; }; im.src = resolveImg('gallery/img/bcp_logo_white.webp'); }
      bannerMat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, fog: true,
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, map: { value: null }, uTint: { value: new THREE.Color(1, 1, 1) } }]),
        vertexShader: `uniform float uT; varying vec2 vUv; varying float vShade;
          #include <fog_pars_vertex>
          void main() { vUv = uv; vec3 p = position; vec4 wq = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float f = uv.x * (1.0 - uv.y) * 0.6, gust = 0.65 + 0.35 * sin(uT * 0.7 + wq.x * 0.02 + wq.z * 0.015);
            float w = 0.28 * sin(uv.x * 6.0 - uT * 5.5 + wq.x * 0.3) + 0.1 * sin(uv.x * 13.0 + uv.y * 4.0 - uT * 9.0);
            p.z += f * gust * w; vShade = 0.86 + 0.14 * cos(uv.x * 6.0 - uT * 5.5 + wq.x * 0.3);
            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }`,
        fragmentShader: `uniform sampler2D map; uniform vec3 uTint; varying vec2 vUv; varying float vShade;
          #include <fog_pars_fragment>
          void main() { vec4 c = texture2D(map, gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y)); if (c.a < 0.5) discard; gl_FragColor = vec4(c.rgb * vShade * uTint, 1.0);
            #include <colorspace_fragment>
            #include <fog_fragment>
          }` });
      bannerMat.uniforms.map.value = btex;
      const banG = new THREE.PlaneGeometry(1.1, 2.6, 6, 8), banI = new THREE.InstancedMesh(banG, bannerMat, n * 2);
      // ground pools of lamplight + glow sprites (lamp globes and the stone lanterns' windows)
      const CTX = (draw) => { const cc = document.createElement('canvas'); cc.width = cc.height = 64; const g = cc.getContext('2d'); draw(g); const t = new THREE.CanvasTexture(cc); t.colorSpace = THREE.SRGBColorSpace; return t; };
      const radial = (stops) => CTX(g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); stops.forEach(([o, s]) => r.addColorStop(o, s)); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
      lampPoolMat = new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(255,214,150,0.55)'], [0.5, 'rgba(255,214,150,0.2)'], [1, 'rgba(255,214,150,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2 });
      const poolI = new THREE.InstancedMesh(new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2).translate(0, 0.03, 0), lampPoolMat, n);
      const gp = [];
      const PS = 0.9;   // (27 Oct, Ben) the light poles 10 % shorter
      for (const [x, z] of poles) gp.push(x, G.y + 6.82 * PS, z);
      lampGlowMat = new THREE.PointsMaterial({ map: radial([[0, 'rgba(255,230,170,1)'], [0.35, 'rgba(255,200,120,0.35)'], [1, 'rgba(255,190,110,0)']]), size: 3.2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: true });
      const glowG = new THREE.BufferGeometry(); glowG.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
      const glow = new THREE.Points(glowG, lampGlowMat); glow.frustumCulled = false;
      const lp = []; for (const [x, z] of plan.lanterns) lp.push(x, G.y + 1.06, z); if (!lp.length) lp.push(0, -999, 0);
      lanternGlowMat = lampGlowMat.clone(); lanternGlowMat.size = 1.6;
      const lgG = new THREE.BufferGeometry(); lgG.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      const lglow = new THREE.Points(lgG, lanternGlowMat); lglow.frustumCulled = false;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
      poles.forEach(([x, z, ry], i) => {
        m4.compose(new THREE.Vector3(x, G.y, z), q.setFromAxisAngle(up, ry), one); poolI.setMatrixAt(i, m4);
        m4.compose(new THREE.Vector3(x, G.y, z), q, new THREE.Vector3(1, PS, 1)); poleI.setMatrixAt(i, m4); globeI.setMatrixAt(i, m4);
        for (const [j, s] of [[0, 1], [1, -1]]) { m4.compose(new THREE.Vector3(x + Math.cos(ry) * 0.68 * s, G.y + 4.7 * PS, z - Math.sin(ry) * 0.68 * s), q.setFromAxisAngle(up, ry + (s < 0 ? Math.PI : 0)), new THREE.Vector3(PS, PS, 1)); banI.setMatrixAt(i * 2 + j, m4); }
      });
      for (const o of [poleI, globeI, banI, poolI]) o.frustumCulled = false;
      scene.add(poleI, globeI, banI, poolI, glow, lglow);
      updaters.push(t => { bannerMat.uniforms.uT.value = t; });
    }
    // (27 Oct, Ben) the START PLATFORM where the big tree stood: a low round two-step plinth (40 cm, so it never blocks the view
    // from the cinema to the eye), pale stone with an ink band on each riser, a red ring set in the top, and a red arrow
    // inlaid toward the museum's eye
    // (s22, Ben) now BLACK with the BLIND CANVAS PROJECT logo in the middle; pale edge bands on each step so the steps read clearly
    { const blk = new THREE.MeshLambertMaterial({ color: 0x201e1d }), blk2 = new THREE.MeshLambertMaterial({ color: 0x2b2928 }), edgeM = new THREE.MeshLambertMaterial({ color: 0xe4ded3 }), redM = new THREE.MeshBasicMaterial({ color: 0xec3013, polygonOffset: true, polygonOffsetFactor: -2 });
      const X = RING.x, Z = RING.z, Y = G.y;
      const disc = (r, h, y, m, open) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, !!open), m); d.position.set(X, y, Z); scene.add(d); return d; };
      disc(6.2, 0.2, Y + 0.1, blk2); disc(6.22, 0.05, Y + 0.175, edgeM, true);
      disc(5.3, 0.2, Y + 0.3, blk); disc(5.32, 0.05, Y + 0.375, edgeM, true);
      const ring = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.78, 72), redM); ring.rotation.x = -Math.PI / 2; ring.position.set(X, Y + 0.405, Z); scene.add(ring);
      const logoM = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
      const logo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).rotateY(Math.PI / 2), logoM); logo.position.set(X, Y + 0.407, Z); scene.add(logo);   // reads upright as you face the eye
      new THREE.TextureLoader().load(resolveImg('gallery/img/bcp_logo_white.webp'), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; logoM.map = t; logoM.opacity = 1; logoM.needsUpdate = true;
        const a = t.image.width / t.image.height, k = 7.4 / Math.hypot(a, 1); logo.scale.set(a >= 1 ? 1 : 1, 1, 1); logo.scale.set(k, 1, k * a); }); }
    // benches round the court, facing the platform
    {
      const seat = new THREE.BoxGeometry(2.4, 0.09, 0.6).translate(0, 0.46, 0), legs = [-0.95, 0.95].map(x => new THREE.BoxGeometry(0.12, 0.42, 0.5).translate(x, 0.21, 0));
      const im = new THREE.InstancedMesh(seat, new THREE.MeshLambertMaterial({ color: 0xb98a5a }), plan.benches.length), il = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.42, 0.5).translate(0, 0.21, 0), new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), plan.benches.length * 2);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
      plan.benches.forEach(([x, z, ry], i) => { q.setFromAxisAngle(up, ry); m4.compose(new THREE.Vector3(x, G.y, z), q, one); im.setMatrixAt(i, m4);
        for (const [k, lx] of [[0, -0.95], [1, 0.95]]) { const off = new THREE.Vector3(lx, 0, 0).applyQuaternion(q); m4.compose(new THREE.Vector3(x + off.x, G.y, z + off.z), q, one); il.setMatrixAt(i * 2 + k, m4); } });
      scene.add(im, il);
    }
    // petals drifting down through the garden
    {
      const N = lowEnd ? 260 : 560, pos = new Float32Array(N * 3), sp = new Float32Array(N);
      for (let i = 0; i < N; i++) { pos[i * 3] = G.x0 + 4 + rnd() * (gw - 8); pos[i * 3 + 1] = rnd() * 14; pos[i * 3 + 2] = G.z0 + 4 + rnd() * (gd - 8); sp[i] = 0.35 + rnd() * 0.5; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pc = document.createElement('canvas'); pc.width = pc.height = 32; const px = pc.getContext('2d'); px.fillStyle = '#f9c9da'; px.beginPath(); px.ellipse(16, 16, 12, 7, 0.6, 0, 6.283); px.fill(); px.fillStyle = 'rgba(236,140,172,0.6)'; px.beginPath(); px.ellipse(16, 16, 5, 3, 0.6, 0, 6.283); px.fill();
      const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace;
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: ptex, size: 0.32, transparent: true, alphaTest: 0.3, depthWrite: false, sizeAttenuation: true }));
      pts.frustumCulled = false; scene.add(pts);
      updaters.push((t, dt) => {
        const cp = camera.position; pts.visible = cp.x > G.x0 - 50 && cp.x < G.x1 + 30 && Math.abs(cp.z) < G.z1 + 40 && cp.y > -6;   // only animate when you can see the garden
        if (!pts.visible || !dt) return;
        for (let i = 0; i < N; i++) { const k = i * 3; pos[k + 1] -= sp[i] * dt; pos[k] += Math.sin(t * 0.9 + i) * 0.4 * dt + 0.25 * dt; pos[k + 2] += Math.cos(t * 0.7 + i * 1.3) * 0.35 * dt;
          if (pos[k + 1] < G.y + 0.05 || (pos[k + 1] < 9.5 && onCampus(pos[k], pos[k + 2]) && !CAMPUS.pools.some(p => Math.abs(pos[k] - p.x) < 5))) { pos[k + 1] = 9 + rnd() * 6;   // (none drift indoors: a petal reaching a roof starts again)
            pos[k] = G.x0 + 4 + rnd() * (gw - 8); pos[k + 2] = G.z0 + 4 + rnd() * (gd - 8); } }
        geo.attributes.position.needsUpdate = true;
      });
    }
  }

  // ---------------------------------------------------------------- 4. the city round the park
  {
    // park lawn that fills the gaps round the museum, then city streets beyond
    const PARK = { x0: -335, x1: 135, z0: -275, z1: 275 };
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(PARK.x1 - PARK.x0, PARK.z1 - PARK.z0), new THREE.MeshLambertMaterial({ color: 0x6f7a3c }));
    lawn.rotation.x = -Math.PI / 2; lawn.position.set((PARK.x0 + PARK.x1) / 2, -3.55, (PARK.z0 + PARK.z1) / 2); scene.add(lawn);
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
    streets.rotation.x = -Math.PI / 2; streets.position.set(-100, -3.6, 0); scene.add(streets);
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
    const mat = new THREE.ShaderMaterial({ vertexShader: CITY_VS, fragmentShader: CITY_FS, fog: true, uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 } }]) });
    cityMat = mat;
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
    console.log('[world] smoothed', smoothed, '· trees repainted', repainted, '+', treePts.length, '· towers', boxes.length, '·', Math.round(performance.now() - t0), 'ms');
  }

  let t = 0;
  // ---------------------------------------------------------------- 5. the sky: golden hour by day, stars by night
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uNight: { value: 0 }, uDusk: { value: 0 }, uSun: { value: new THREE.Vector3(0.62, 0.22, 0.48).normalize() } },
    vertexShader: 'varying vec3 vD; void main() { vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform float uNight; uniform float uDusk; uniform vec3 uSun; varying vec3 vD;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main() {
        float h = max(vD.y, -0.1);
        vec3 day = mix(vec3(1.0, 0.82, 0.64), vec3(0.42, 0.62, 0.86), smoothstep(0.0, 0.42, h));   // warm horizon, deep blue overhead
        day = mix(day, vec3(0.98, 0.9, 0.82), smoothstep(0.05, -0.08, vD.y));
        float sd = max(dot(vD, uSun), 0.0);
        day += vec3(1.0, 0.75, 0.45) * pow(sd, 18.0) * 0.55 + vec3(1.0, 0.96, 0.85) * smoothstep(0.9993, 0.9997, sd);
        // golden hour: a deep amber horizon under a violet-blue sky, a big low sun
        vec3 dusk = mix(vec3(1.0, 0.6, 0.34), vec3(0.98, 0.74, 0.58), smoothstep(0.0, 0.12, h));
        dusk = mix(dusk, vec3(0.34, 0.4, 0.66), smoothstep(0.1, 0.6, h)); dusk = mix(dusk, vec3(0.9, 0.62, 0.48), smoothstep(0.05, -0.08, vD.y));
        dusk += vec3(1.0, 0.55, 0.22) * (pow(sd, 6.0) * 0.45 + pow(sd, 40.0) * 0.6) + vec3(1.0, 0.92, 0.7) * smoothstep(0.9988, 0.9994, sd);
        day = mix(day, dusk, uDusk);
        vec3 night = mix(vec3(0.16, 0.13, 0.2), vec3(0.02, 0.03, 0.08), smoothstep(0.0, 0.5, h));
        vec3 g = floor(vD * 420.0); float st = step(0.9975, hash(g)) * smoothstep(0.05, 0.3, h);
        night += vec3(0.9, 0.92, 1.0) * st * (0.6 + 0.4 * hash(g + 3.0));
        night += vec3(0.95, 0.95, 1.0) * smoothstep(0.9996, 0.9998, max(dot(vD, normalize(vec3(-0.5, 0.45, -0.7))), 0.0));   // the moon
        gl_FragColor = vec4(mix(day, night, uNight), 1.0);
      }`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  updaters.push(() => sky.position.copy(camera.position));
  // the sun low and warm; remember the lights so night can dim them
  const lights = { hemi: null, sun: null, amb: null };
  scene.traverse(o => { if (o.isHemisphereLight) lights.hemi = o; else if (o.isDirectionalLight) lights.sun = o; else if (o.isAmbientLight) lights.amb = o; });
  const L0 = { hemi: lights.hemi && lights.hemi.intensity, sun: lights.sun && lights.sun.intensity, amb: lights.amb && lights.amb.intensity };
  if (lights.sun) { lights.sun.color.set(0xffe2bf); lights.sun.position.set(110, 60, 85); }
  if (lights.hemi) lights.hemi.color.set(0xfff4e8);
  const fogDay = new THREE.Color(0xeedfd0), fogNight = new THREE.Color(0x141626);
  if (scene.fog) scene.fog.color.copy(fogDay);
  scene.background = null;

  // ---------------------------------------------------------------- 6. the eye facade and the name sign
  let eye = { update() {} };
  try { eye = buildEye({ scene, lowEnd }); } catch (e) { console.warn('eye', e); }

  // ---------------------------------------------------------------- the sky's moods: afternoon, GOLDEN HOUR (27 Oct, the default:
  // low amber sun, lamps on, not dark yet) and night; each eases in and out
  let night = 0, nightTarget = 0, dusk = 1, duskTarget = 1;
  const sunDay = new THREE.Vector3(0.62, 0.22, 0.48).normalize(), sunDusk = new THREE.Vector3(0.62, 0.07, 0.48).normalize();
  const sunPosDay = new THREE.Vector3(110, 60, 85), sunPosDusk = new THREE.Vector3(125, 34, 92), fogDusk = new THREE.Color(0xf0c5a2);
  const C = (r, g, b) => new THREE.Color(r, g, b), mixC = (a, b, k) => a.clone().lerp(b, k);
  const applyNight = n => {
    const d = dusk * (1 - n), lamp = Math.max(n, dusk * 0.85);
    if (lanternMat) lanternMat.color.setRGB(0.54 + 0.46 * lamp, 0.48 + 0.34 * lamp, 0.36 + 0.06 * lamp);   // stone lanterns glow warm at dusk and night
    if (lampGlobeMat) lampGlobeMat.color.copy(mixC(C(0.85, 0.83, 0.78), C(1, 0.9, 0.66), lamp));
    if (lampGlowMat) lampGlowMat.opacity = lamp * 0.9;
    if (lanternGlowMat) lanternGlowMat.opacity = lamp * 0.75;
    if (lampPoolMat) lampPoolMat.opacity = lamp * (0.45 + 0.55 * n);
    if (bannerMat) bannerMat.uniforms.uTint.value.copy(mixC(mixC(C(1, 1, 1), C(1, 0.88, 0.76), dusk), C(0.42, 0.4, 0.5), n));
    sky.material.uniforms.uNight.value = n; sky.material.uniforms.uDusk.value = dusk;
    sky.material.uniforms.uSun.value.copy(sunDay).lerp(sunDusk, dusk).normalize();
    if (cityMat) cityMat.uniforms.uNight.value = Math.max(n, 0.3 * dusk);   // windows start lighting up
    if (waterMat) { const u = waterMat.uniforms; u.uNight.value = n; u.uSky.value.copy(mixC(C(0.81, 0.9, 0.96), C(0.98, 0.74, 0.58), d)).multiplyScalar(1 - 0.85 * n); u.uDeep.value.setRGB(0.08 - 0.05 * n, 0.31 - 0.22 * n, 0.42 - 0.27 * n); u.uShallow.value.setRGB(0.23 - 0.15 * n, 0.63 - 0.45 * n, 0.71 - 0.45 * n); }
    if (scene.fog) scene.fog.color.copy(fogDay).lerp(fogDusk, dusk).lerp(fogNight, n);
    // inside stays well lit (the gallery has its lights on); outside goes warm, then dark
    if (lights.hemi) { lights.hemi.intensity = L0.hemi * (1 - 0.45 * n) * (1 - 0.12 * d); lights.hemi.color.setRGB(1, 0.96 - 0.08 * n - 0.08 * d, 0.91 + 0.04 * n - 0.14 * d); }
    if (lights.sun) { lights.sun.intensity = L0.sun * (1 - 0.85 * n) * (1 - 0.1 * d); lights.sun.color.copy(mixC(C(1, 0.886, 0.75), C(1, 0.68, 0.4), dusk)); lights.sun.position.copy(sunPosDay).lerp(sunPosDusk, dusk); }
    if (lights.amb) lights.amb.intensity = L0.amb * (1 + 0.9 * n);
  };
  applyNight(0);
  const ease = (v, to, dt) => v + Math.sign(to - v) * Math.min(Math.abs(to - v), dt / 2.5);
  updaters.push((tt, dt) => { if (Math.abs(night - nightTarget) > 0.001 || Math.abs(dusk - duskTarget) > 0.001) { night = ease(night, nightTarget, dt); dusk = ease(dusk, duskTarget, dt); applyNight(night); } eye.update(tt, night); setStainedNight(night); });

  let last = 0;
  const setSky = m => { nightTarget = m === 'night' ? 1 : 0; duskTarget = m === 'day' ? 0 : 1; };
  return {
    update(dt) { t += dt; for (const f of updaters) f(t, dt); },
    setSky, sky: () => nightTarget === 1 ? 'night' : duskTarget === 1 ? 'golden' : 'day',
    setNight(v) { setSky(v ? 'night' : 'golden'); }, isNight: () => nightTarget === 1,
    lake: LAKE, waterY: WATER_Y, pool: POOL,
  };
}
