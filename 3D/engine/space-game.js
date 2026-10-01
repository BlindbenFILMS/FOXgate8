// 8 GATES 3D — SPACE. The nine worlds in their 3x3 grid (as the 2D map lays them out), each with
// its dock, mining platform, shipyard, fuel depot and star gate; asteroid belts; corsair raids
// from four ports in the deep; King Might's machine cruisers on patrol; haulers on the lanes.
// Toon shading + ink outlines like the surfaces; Modernist HUD from space.html.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, fbm, makeGradient, glowTexture, Ambience } from '../village-game.js';
import { canvasTex, signTex, emblemTex } from './textures.js';
import { save } from './save.js';

const $ = id => document.getElementById(id), show = (el, on, d = 'block') => { if (el) el.style.display = on ? d : 'none'; };
const QS = new URLSearchParams(location.search);
const touch = matchMedia('(pointer:coarse)').matches, low = touch || QS.get('q') === 'low';
const TAU = Math.PI * 2, wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));

// ================================================================ THE NINE (the 2D map's 3x3 grid, Meru in the middle)
const CELL = 1400;
const WORLDS = [
  { k: 'player', n: 'Home', crest: '8', tint: '#e8eef7', row: 0, col: 0, r: 62, look: 'ice', moons: 1, tag: 'Your own planet. Snow on the slopes, a lake, a rink.' },
  { k: 'luxor', n: 'Luxor', crest: 'L', tint: '#e0574a', row: 0, col: 1, r: 64, look: 'lava', tag: 'Red stone, the volcano, the boxing pit.' },
  { k: 'ur', n: 'Ur', crest: 'U', tint: '#e8963a', row: 0, col: 2, r: 62, look: 'ur', ring: true, tag: 'The stepped pyramid and the poisoned lake.' },
  { k: 'gaya', n: 'Gaya', crest: 'G', tint: '#a97bdd', row: 1, col: 0, r: 68, look: 'crystal', moons: 1, tag: 'Crystal church, the vein, Kyoto through the wood.' },
  { k: 'meru', n: 'Meru', crest: 'M', tint: '#b9bec7', row: 1, col: 1, r: 96, look: 'meru', ring: true, href: 'Meru Town Square.dc.html', tag: 'The centre of the Nine. King Might keeps the peace.' },
  { k: 'zion', n: 'Zion', crest: 'Z', tint: '#e8cf4a', row: 1, col: 2, r: 64, look: 'zion', moons: 1, tag: 'Gold in the river and monster trucks.' },
  { k: 'nebo', n: 'Nebo', crest: 'N', tint: '#5aa6e8', row: 2, col: 0, r: 66, look: 'forest', moons: 2, tag: 'The forest town and the giant tree.' },
  { k: 'kufa', n: 'Kufa', crest: 'K', tint: '#b08355', row: 2, col: 1, r: 64, look: 'desert', tag: 'Caravans, water and the long road.' },
  { k: 'jidda', n: 'Jidda', crest: 'J', tint: '#5ec97e', row: 2, col: 2, r: 62, look: 'lagoon', tag: 'A lagoon of islands. Corsairs in the Reach.' },
];
for (const w of WORLDS) { w.x = (w.col - 1) * CELL; w.z = (w.row - 1) * CELL; }
const EARTH = { k: 'earth', n: 'Earth', crest: 'E', tint: '#3f7fd8', x: 3300, z: 3500, r: 92, look: 'earth', moons: 1, tag: 'The far away world. The Strip is lit all night.', earth: true };
const BODIES = [...WORLDS, EARTH];
// four installations ring every world (the station due east; the others take the other points)
const INST = {
  dock: { label: 'DOCK', name: 'Space Dock', dx: 1, dz: 0, d: 200 },
  mine: { label: 'MINE', name: 'Mining Platform', dx: -1, dz: 0, d: 250 },
  yard: { label: 'SHIPYARD', name: 'Shipyard', dx: 0, dz: -1, d: 215 },
  fuel: { label: 'FUEL DEPOT', name: 'Fuel Depot', dx: 0, dz: 1, d: 235 },
  gate: { label: 'STAR GATE', name: 'Star Gate', dx: -0.72, dz: -0.72, d: 260 },
};
// the corsair ports: bearings and distances from the 2D map, scaled to the 3D grid
const PORTS = [{ name: 'KRASS', brg: 62, dist: 3450 }, { name: 'GIBET', brg: 170, dist: 4050 }, { name: 'MURK', brg: 300, dist: 3820 }, { name: 'THRAX', brg: 245, dist: 4500 }]
  .map(p => ({ ...p, x: Math.sin(p.brg * Math.PI / 180) * p.dist, z: -Math.cos(p.brg * Math.PI / 180) * p.dist }));

// ================================================================ RENDERER, SCENE, KIT
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, low ? 1.25 : 2)); renderer.setSize(innerWidth, innerHeight); stage.appendChild(renderer.domElement);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#04050b');
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.5, 14000);
const marks = $('marks'), mk = marks.getContext('2d');
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); const d = Math.min(devicePixelRatio, 2); marks.width = innerWidth * d; marks.height = innerHeight * d; mk.setTransform(d, 0, 0, d, 0, 0); }
addEventListener('resize', resize); resize();
const grad = makeGradient(), glowTex = glowTexture();
const MATS = new Map();
const toon = (c, x) => { const k = c + (x ? JSON.stringify(x) : ''); if (!MATS.has(k)) MATS.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...x })); return MATS.get(k); };
const GLOWS = [];
const glowing = (c, k = 1.6) => { const k2 = 'g' + c + k; if (!MATS.has(k2)) { const m = new THREE.MeshToonMaterial({ color: c, gradientMap: grad, emissive: new THREE.Color(c), emissiveIntensity: k }); MATS.set(k2, m); GLOWS.push(m); } return MATS.get(k2); };
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
function M(geo, mat, x = 0, y = 0, z = 0, parent, o = 0.04, rad) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o) { const ol = new THREE.Mesh(geo, outlineMat); if (rad) ol.scale.setScalar(1 + o / rad); else { geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s); ol.scale.set(1 + 2 * o / Math.max(s.x, .01), 1 + 2 * o / Math.max(s.y, .01), 1 + 2 * o / Math.max(s.z, .01)); } m.add(ol); }
  (parent || scene).add(m); return m;
}
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const CYL = (a, b, h, s = 12) => new THREE.CylinderGeometry(a, b, h, s);
function glow(x, y, z, color, size, parent, op = 0.9) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op, fog: false })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; }
// bake: merge every still mesh under a group by material (outlines into one) — a structure costs a handful of draw calls
function bake(root) {
  root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), m4 = new THREE.Matrix4();
  const by = new Map(), outl = [], gone = [];
  const kept = o => { for (let p = o; p && p !== root; p = p.parent) if (p.userData.keep) return true; return false; };
  root.traverse(o => { if (!o.isMesh || o === root || kept(o)) return; if (o.material === outlineMat) { outl.push(o); return; } if (Array.isArray(o.material) || o.material.map) return; if (!by.has(o.material)) by.set(o.material, []); by.get(o.material).push(o); });
  const merge = list => { const pos = [], nor = []; for (const o of list) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); m4.multiplyMatrices(inv, o.matrixWorld); g.applyMatrix4(m4); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g; };
  const adds = [];
  for (const [mat, list] of by) { if (list.length < 2) continue; adds.push(new THREE.Mesh(merge(list), mat)); list.forEach(o => gone.push(o)); }
  const keepOl = outl.filter(o => !gone.includes(o.parent) && o.parent && !gone.includes(o.parent));
  const olGone = outl.filter(o => gone.includes(o.parent));
  if (olGone.length) adds.push(new THREE.Mesh(merge(olGone), outlineMat));
  for (const o of gone) { const kids = o.children.filter(c => c.material !== outlineMat); for (const c of kids) root.attach(c); o.parent && o.parent.remove(o); }
  for (const a of adds) root.add(a); void keepOl;
}

// ================================================================ SKY: nebula dome, two star layers, the sun
const SUN_DIR = new THREE.Vector3(-0.6, 0.45, -0.66).normalize();
{
  const dome = new THREE.Mesh(new THREE.SphereGeometry(9000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uSun: { value: SUN_DIR } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vD; uniform vec3 uSun;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      float n3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
      float fb(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*n3(p); p*=2.03; a*=0.5; } return s; }
      void main(){ vec3 d = normalize(vD); float band = exp(-pow(d.y*2.6 + 0.35*sin(d.x*2.0), 2.0));
        float n = fb(d*3.2 + vec3(0.0, 4.0, 0.0)), m = fb(d*6.0 - 2.0);
        vec3 c = vec3(0.012, 0.016, 0.04);
        c += vec3(0.20, 0.08, 0.30) * smoothstep(0.45, 0.85, n) * (0.35 + band);
        c += vec3(0.05, 0.22, 0.32) * smoothstep(0.5, 0.9, m) * band * 0.9;
        c += vec3(0.45, 0.16, 0.12) * smoothstep(0.62, 0.95, fb(d*4.5 + 7.0)) * 0.35;
        float sd = max(dot(d, uSun), 0.0); c += vec3(1.0, 0.85, 0.6) * pow(sd, 18.0) * 0.6 + vec3(1.0,0.7,0.45) * pow(sd, 4.0) * 0.08;
        gl_FragColor = vec4(c, 1.0); }` }));
  scene.add(dome); dome.renderOrder = -10; window.__dome = dome;
  for (const [n, R, sz, op] of [[low ? 1800 : 3600, 8000, 1.6, 0.9], [low ? 400 : 900, 7800, 2.6, 1]]) {
    const a = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random() * TAU, v = Math.acos(rr(-1, 1)); const band = Math.random() < 0.45; const y = band ? rr(-0.25, 0.25) : Math.cos(v); const s = Math.sqrt(1 - y * y); a.set([Math.cos(u) * s * R, y * R, Math.sin(u) * s * R], i * 3); const c = new THREE.Color().setHSL(pick([0.58, 0.6, 0.62, 0.08, 0.12]), rr(0.2, 0.7), rr(0.75, 1)); col.set([c.r, c.g, c.b], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const st = new THREE.Points(g, new THREE.PointsMaterial({ size: sz, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, opacity: op, depthWrite: false })); scene.add(st); (window.__stars = window.__stars || []).push(st);
  }
  const sp = SUN_DIR.clone().multiplyScalar(7000); glow(sp.x, sp.y, sp.z, 0xfff1d0, 2600, null, 1); glow(sp.x, sp.y, sp.z, 0xffb070, 5200, null, 0.35);
}
scene.add(new THREE.HemisphereLight(0xb8c8ff, 0x1a1028, 0.9));
const sun = new THREE.DirectionalLight(0xfff1dc, 2.8); sun.position.copy(SUN_DIR).multiplyScalar(100); scene.add(sun);
const amb = new THREE.AmbientLight(0x404a70, 0.35); scene.add(amb);

// ================================================================ PLANETS
const LOOKS = {
  meru:    { a: '#9aa2b0', b: '#6a7282', c: '#cfd5df', ice: 0.3, atm: '#cfe0ff', city: true },
  ice:     { a: '#e8eef7', b: '#9fc0e0', c: '#5a8ac8', ice: 0.55, atm: '#d8ecff', sea: '#5a8ac8' },
  lava:    { a: '#7a3a2e', b: '#3a1a16', c: '#c45a3a', ice: 0, atm: '#ff8a6a', lava: true },
  ur:      { a: '#d89a5a', b: '#a8603a', c: '#e8c48a', ice: 0.05, atm: '#ffd0a0', toxic: true },
  crystal: { a: '#8a6ac8', b: '#4a3a7a', c: '#d8c8ff', ice: 0.35, atm: '#d8b8ff', crystal: true },
  zion:    { a: '#c8a44a', b: '#7a6a3a', c: '#3f6a3a', ice: 0.2, atm: '#ffe8a8', river: true },
  forest:  { a: '#2f6e4a', b: '#1f4a34', c: '#5a8a4a', ice: 0.25, atm: '#a8e0ff', sea: '#2f6aa8' },
  desert:  { a: '#d8b070', b: '#a8804a', c: '#efd8a8', ice: 0.08, atm: '#ffe0b0', oasis: true },
  lagoon:  { a: '#2fa8a0', b: '#1f6a8a', c: '#efe0b0', ice: 0, atm: '#a8fff0', sea: '#2fa8b8', islands: true },
  earth:   { a: '#2f6fc8', b: '#1f4a8a', c: '#4f9a4a', ice: 0.5, atm: '#9fd0ff', sea: '#2f6fc8', earth: true, city: true },
};
function planetTex(w) {
  const L = LOOKS[w.look], W = low ? 384 : 768, H = W / 2, seed = (w.x * 0.0013 + w.z * 0.0007) % 10;
  const A = new THREE.Color(L.a), B = new THREE.Color(L.b), C = new THREE.Color(L.c), SEA = L.sea ? new THREE.Color(L.sea) : null, col = new THREE.Color(), tmp = new THREE.Color();
  return canvasTex(W, H, c => {
    const img = c.createImageData(W, H), D = img.data;
    for (let y = 0; y < H; y++) { const lat = y / H, pole = Math.abs(lat - 0.5) * 2;
      for (let x = 0; x < W; x++) { const u = x / W * 6 + seed, v = y / H * 3;
        // wrap the noise round the sphere: blend the seam
        const n = fbm(u, v) * 0.75 + fbm(u * 3.1, v * 3.1) * 0.25, n2 = fbm(u * 0.6 + 9, v * 0.6);
        const nW = x > W - 24 ? (fbm(u - 6, v) * 0.75 + fbm((u - 6) * 3.1, v * 3.1) * 0.25) : n; const nn = x > W - 24 ? n + (nW - n) * ((x - (W - 24)) / 24) : n;
        if (SEA) { const land = smooth(0.5, 0.54, nn); col.copy(SEA).lerp(tmp.copy(SEA).multiplyScalar(0.7), smooth(0.3, 0.5, n2)); if (L.islands) { col.lerp(C, smooth(0.6, 0.63, nn)); col.lerp(tmp.set('#7fe0d0'), smooth(0.55, 0.6, nn) * (1 - smooth(0.6, 0.63, nn)) * 0.8); } else { tmp.copy(A).lerp(B, smooth(0.45, 0.7, n2)); if (L.earth) tmp.lerp(C, smooth(0.55, 0.75, n2)); col.lerp(tmp, land); } }
        else { col.copy(A).lerp(B, smooth(0.42, 0.66, nn)); col.lerp(C, smooth(0.62, 0.72, n2) * 0.6); }
        if (L.lava) col.lerp(tmp.set('#ffb03a'), smooth(0.015, 0.0, Math.abs(nn - 0.5)) * 0.95);
        if (L.toxic) col.lerp(tmp.set('#7fd83a'), smooth(0.7, 0.74, n2) * 0.9);
        if (L.crystal) col.lerp(tmp.set('#f4ecff'), smooth(0.66, 0.7, nn) * 0.8);
        if (L.river) col.lerp(tmp.set('#4a9ab8'), smooth(0.012, 0.0, Math.abs(n2 - 0.5)) * 0.9);
        if (L.oasis) col.lerp(tmp.set('#3fb7a0'), smooth(0.74, 0.76, nn) * 0.9);
        if (w.k === 'meru') col.lerp(tmp.set('#e6b45a'), smooth(0.71, 0.73, nn) * 0.5);
        col.lerp(tmp.set('#ffffff'), smooth(1 - L.ice * 0.6, 1.0, pole + n2 * 0.2) * 0.95);
        const i = (y * W + x) * 4; D[i] = col.r * 255; D[i + 1] = col.g * 255; D[i + 2] = col.b * 255; D[i + 3] = 255; } }
    c.putImageData(img, 0, 0);
  });
}
function cloudTex(w) { const W = low ? 256 : 512, H = W / 2, seed = w.x * 0.001; return canvasTex(W, H, c => { const img = c.createImageData(W, H), D = img.data; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = fbm(x / W * 8 + seed, y / H * 4 + 3) * 0.7 + fbm(x / W * 22, y / H * 11) * 0.3, a = smooth(0.52, 0.7, n) * (1 - Math.pow(Math.abs(y / H - 0.5) * 2, 6)); const i = (y * W + x) * 4; D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = a * 230; } c.putImageData(img, 0, 0); }); }
function atmosphere(r, col) {
  return new THREE.Mesh(new THREE.SphereGeometry(r * 1.09, 48, 32), new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide, uniforms: { uCol: { value: new THREE.Color(col) }, uSun: { value: SUN_DIR } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); vW = normalize((modelMatrix * vec4(normal,0.0)).xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uCol; uniform vec3 uSun; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); float lit = 0.35 + 0.65 * smoothstep(-0.3, 0.6, dot(vW, uSun)); gl_FragColor = vec4(uCol * f * lit * 1.4, f * lit); }' }));
}
const SPIN = [], MOONS = [];
for (const w of BODIES) {
  const L = LOOKS[w.look]; const g = new THREE.Group(); g.position.set(w.x, 0, w.z); scene.add(g); w.g = g;
  const body = new THREE.Mesh(new THREE.SphereGeometry(w.r, low ? 40 : 64, low ? 24 : 40), new THREE.MeshToonMaterial({ map: planetTex(w), gradientMap: grad })); body.rotation.z = 0.2; g.add(body); SPIN.push({ o: body, v: 0.012 + (w.r % 7) * 0.001 });
  const ol = new THREE.Mesh(body.geometry, outlineMat); ol.scale.setScalar(1.01); body.add(ol);
  if (w.look !== 'lava' && w.look !== 'meru') { const cl = new THREE.Mesh(new THREE.SphereGeometry(w.r * 1.025, low ? 32 : 48, low ? 20 : 32), new THREE.MeshToonMaterial({ map: cloudTex(w), gradientMap: grad, transparent: true, depthWrite: false })); cl.rotation.z = 0.2; g.add(cl); SPIN.push({ o: cl, v: 0.02 }); }
  if (w.look === 'lava') { const em = new THREE.Mesh(new THREE.SphereGeometry(w.r * 1.004, 40, 24), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(em); }
  g.add(atmosphere(w.r, L.atm));
  if (w.ring) { const rt = canvasTex(512, 8, c => { for (let x = 0; x < 512; x++) { const a = 0.15 + 0.7 * Math.abs(Math.sin(x * 0.07) * Math.sin(x * 0.013 + 1)) * (x > 30 && x < 490 ? 1 : 0.2); const t = new THREE.Color(w.tint).lerp(new THREE.Color('#ffffff'), 0.5 + Math.random() * 0.2); c.fillStyle = `rgba(${t.r * 255 | 0},${t.g * 255 | 0},${t.b * 255 | 0},${a.toFixed(2)})`; c.fillRect(x, 0, 1, 8); } });
    const rg = new THREE.RingGeometry(w.r * 1.35, w.r * 2.15, 128, 1); const p = rg.attributes.position, uv = rg.attributes.uv; for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (d - w.r * 1.35) / (w.r * 0.8), 0.5); }
    const ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: rt, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.95 })); ring.rotation.x = -Math.PI / 2 + 0.28; ring.rotation.y = 0.12; g.add(ring); }
  for (let i = 0; i < (w.moons || 0); i++) { const m = M(new THREE.IcosahedronGeometry(w.r * 0.16, 2), toon(i ? '#a8a49a' : '#cfcac0'), 0, 0, 0, null, 0.4, w.r * 0.16); MOONS.push({ m, w, R: w.r * (2.3 + i * 0.7), a: rr(0, TAU), v: 0.05 + i * 0.03, tilt: rr(-0.3, 0.3) }); }
  const lt = signTex(w.n.toUpperCase(), null, w.tint); const lbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, transparent: true, depthTest: false, fog: false })); lbl.position.set(0, w.r + 34, 0); lbl.scale.set(84, 21, 1); lbl.renderOrder = 5; g.add(lbl); w.lbl = lbl;
}
// Meru's city lights: tiny glow points scattered on the night side
for (const w of [WORLDS[4], EARTH]) { const n = low ? 120 : 260, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new THREE.Vector3(rr(-1, 1), rr(-0.7, 0.7), rr(-1, 1)).normalize().multiplyScalar(w.r * 1.003); if (v.dot(SUN_DIR) > 0.1) { i--; continue; } a.set([v.x, v.y, v.z], i * 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); w.g.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffd38a, size: 2.2, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false }))); }

// ================================================================ INSTALLATIONS (built once per kind, coloured per world)
const ANIM = [];   // {o, fn(t)}
const STRUCTS = [];   // {kind, w, x, z, g, r, name}
function emblemFor(w) { return emblemTex(w.crest, { outer: w.tint, ring: '#e6b45a', bg: '#151b3d', stroke: '#ffffff' }); }
function beacon(parent, x, y, z, col, ph = 0) { const s = glow(x, y, z, col, 6, parent, 0.9); ANIM.push({ fn: t => { s.material.opacity = (Math.sin(t * 3 + ph) > 0.4 ? 0.95 : 0.15); } }); return s; }
function buildDock(w, g) {   // a hub, a spinning habitat ring, docking arms, solar wings, the world's crest on the pad
  const hull = toon('#b8c0cc'), dark = toon('#5a6276'), acc = toon(w.tint), win = glowing('#ffd38a', 1.4);
  M(CYL(7, 7, 26, 16), hull, 0, 0, 0, g, 0.25, 7); M(new THREE.SphereGeometry(7, 16, 10), hull, 0, 13, 0, g, 0.25, 7); M(CYL(3, 3, 10, 12), dark, 0, -17, 0, g, 0.2, 3);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; M(BOX(1.2, 1.2, 1.2), win, Math.cos(a) * 7.1, 4, Math.sin(a) * 7.1, g, 0); M(BOX(1.2, 1.2, 1.2), win, Math.cos(a + 0.5) * 7.1, -4, Math.sin(a + 0.5) * 7.1, g, 0); }
  const ring = new THREE.Group(); g.add(ring); ring.userData.keep = true;
  M(new THREE.TorusGeometry(24, 2.6, 10, 48), hull, 0, 0, 0, ring, 0.3, 2.6).rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) { const s = M(BOX(24, 1.4, 1.4), dark, 0, 0, 0, ring, 0.1); s.rotation.y = i / 4 * Math.PI; s.position.set(Math.cos(i / 4 * Math.PI) * 0, 0, 0); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; M(BOX(1.6, 1.0, 1.0), i % 4 ? win : glowing(w.tint, 2), Math.cos(a) * 26.7, 0, Math.sin(a) * 26.7, ring, 0); }
  ANIM.push({ fn: (t, dt) => { ring.rotation.y += dt * 0.12; } });
  for (const s of [-1, 1]) { const arm = M(BOX(4, 3, 30), hull, s * 0, -6, s * 20, g, 0.15); arm.position.x = 0; M(BOX(6, 0.6, 6), acc, 0, -4.3, s * 35, g, 0.1); beacon(g, 0, -3, s * 36, new THREE.Color(w.tint).getHex(), s); }
  for (const s of [-1, 1]) { M(BOX(1, 1, 26), dark, s * 12, 9, 0, g, 0.05).rotation.y = Math.PI / 2; for (let k = 0; k < 2; k++) M(BOX(10, 0.3, 14), toon('#2f4a8a'), s * (18 + k * 11), 9, 0, g, 0.06); }
  const pad = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshToonMaterial({ map: emblemFor(w), gradientMap: grad })); pad.rotation.x = -Math.PI / 2; pad.position.y = 20.2; g.add(pad); M(CYL(7, 7, 1.2, 24), dark, 0, 19.5, 0, g, 0.1, 7);
  beacon(g, 0, 22, 0, 0xff3a3a, 0.7); bake(g);
  return 34;
}
function buildMine(w, g) {   // a rig bolted to a rock: derrick, a turning drill, ore silos in the world's colour, a conveyor
  const rock = toon('#7a7068'), steel = toon('#5a6276'), acc = toon(w.tint), lamp = glowing('#ffcf6a', 1.8);
  const r = M(new THREE.DodecahedronGeometry(26, 1), rock, 0, -14, 0, g, 0.4, 26); r.scale.set(1.3, 0.8, 1.1);
  for (let i = 0; i < 9; i++) M(new THREE.DodecahedronGeometry(rr(3, 7), 0), rock, rr(-28, 28), rr(-30, -4), rr(-24, 24), g, 0.2, 5);
  M(BOX(34, 2, 26), steel, 0, 5, 0, g, 0.15);
  for (const [x, z] of [[-14, -10], [-14, 10], [14, -10], [14, 10]]) M(BOX(1.6, 10, 1.6), steel, x, 0, z, g, 0.05);
  for (let i = 0; i < 3; i++) { M(CYL(3.4, 3.4, 12, 14), acc, -10 + i * 7.5, 12, -7, g, 0.15, 3.4); M(new THREE.SphereGeometry(3.4, 14, 8, 0, TAU, 0, Math.PI / 2), acc, -10 + i * 7.5, 18, -7, g, 0.15, 3.4); }
  const der = new THREE.Group(); der.position.set(8, 6, 6); g.add(der);
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { const l = M(BOX(0.6, 22, 0.6), steel, x * 0.5, 11, z * 0.5, der, 0.03); l.rotation.set(-z * 0.03, 0, x * 0.03); }
  for (let y = 4; y < 22; y += 4) M(BOX(4 - y * 0.12, 0.4, 4 - y * 0.12), steel, 0, y, 0, der, 0);
  M(BOX(2, 2, 2), acc, 0, 23, 0, der, 0.05); beacon(der, 0, 24.5, 0, 0xff5a3a, 1.2);
  const drill = new THREE.Group(); drill.position.set(8, 4, 6); drill.userData.keep = true; g.add(drill); M(CYL(0.4, 1.6, 10, 8), toon('#cbd5e1'), 0, -6, 0, drill, 0.05, 1.6); for (let k = 0; k < 3; k++) M(BOX(3.6, 0.4, 0.4), toon('#e6b45a'), 0, -3 - k * 2.4, 0, drill, 0).rotation.y = k;
  ANIM.push({ fn: (t, dt) => { drill.rotation.y += dt * 3; } });
  const belt = M(BOX(2.4, 0.6, 22), toon('#3a3a42'), -14, 7, 2, g, 0.05); belt.rotation.x = -0.25;
  for (let i = 0; i < 6; i++) M(BOX(1.4, 1.4, 1.4), lamp, -16 + i * 6.4, 6.6, 13, g, 0);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), new THREE.MeshToonMaterial({ map: signTex('MINE', null, w.tint), gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: signTex('MINE', null, w.tint), emissiveIntensity: 0.6 })); sg.position.set(0, 10, 13.3); g.add(sg); const sb = sg.clone(); sb.rotation.y = Math.PI; sb.position.z = 12.7; g.add(sb);
  bake(g); return 34;
}
function buildYard(w, g) {   // an open cradle with a hull half plated, two cranes and the welders' sparks
  const steel = toon('#6a7282'), dark = toon('#3a4050'), acc = toon(w.tint), hull = toon('#cfd5df');
  for (const s of [-1, 1]) for (let i = 0; i <= 5; i++) { const x = -30 + i * 12; M(BOX(1.4, 26, 1.4), steel, x, 0, s * 12, g, 0.05); }
  for (const y of [-12, 12]) for (const s of [-1, 1]) M(BOX(62, 1.4, 1.4), steel, 0, y, s * 12, g, 0.05);
  for (let i = 0; i <= 5; i++) { const x = -30 + i * 12; M(BOX(1.2, 1.2, 24), steel, x, 12, 0, g, 0.04); M(BOX(1.2, 1.2, 24), steel, x, -12, 0, g, 0.04); }
  // the ship on the stocks: a long hull, plated at the bow, ribs at the stern
  M(new THREE.CapsuleGeometry(6, 26, 6, 16), hull, 6, 0, 0, g, 0.2, 6).rotation.z = Math.PI / 2;
  for (let i = 0; i < 6; i++) M(new THREE.TorusGeometry(6.2, 0.45, 6, 18), dark, -14 - i * 3.2, 0, 0, g, 0).rotation.y = Math.PI / 2;
  M(BOX(10, 0.6, 18), acc, 8, 0, 0, g, 0.08); M(BOX(4, 3, 3), glowing('#7fd8ff', 1.4), 22, 3, 0, g, 0.05);
  const cranes = []; for (const s of [-1, 1]) { const c = new THREE.Group(); c.position.set(s * 18, 14, s * 12); c.userData.keep = true; g.add(c); M(BOX(1.6, 6, 1.6), acc, 0, 3, 0, c, 0.05); const jib = M(BOX(24, 1.2, 1.2), acc, 10, 6, 0, c, 0.05); M(BOX(0.2, 8, 0.2), dark, 20, 2, 0, c, 0); M(BOX(2, 1.2, 2), dark, 20, -2, 0, c, 0.03); cranes.push(c); void jib; }
  ANIM.push({ fn: t => { cranes.forEach((c, i) => c.rotation.y = Math.sin(t * 0.3 + i * 2) * 0.8 + (i ? Math.PI : 0)); } });
  const sparks = []; for (let i = 0; i < 4; i++) { const s = glow(rr(-12, 18), rr(-5, 6), rr(-5, 5), 0xfff0a0, 5, g, 0); sparks.push(s); } ANIM.push({ fn: t => { sparks.forEach((s, i) => { const on = Math.sin(t * 13 + i * 7) > 0.6; s.material.opacity = on ? 0.95 : 0; s.scale.setScalar(on ? rr(3, 7) : 1); }); } });
  for (const [x, y, z] of [[-30, 13, -12], [30, 13, -12], [-30, 13, 12], [30, 13, 12]]) beacon(g, x, y + 1, z, 0xff5a3a, x * 0.1);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(26, 5.5), new THREE.MeshToonMaterial({ map: signTex('SHIPYARD', null, w.tint), gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: signTex('SHIPYARD', null, w.tint), emissiveIntensity: 0.6 })); sg.position.set(0, 17, 12.8); g.add(sg); const sb = sg.clone(); sb.rotation.y = Math.PI; sb.position.z = 12.2; g.add(sb);
  bake(g); return 38;
}
function buildFuel(w, g) {   // a spine with four spherical tanks striped in the world's colour, a walkway ring, pump arms
  const steel = toon('#7a8290'), tank = toon('#e8ecf2'), acc = toon(w.tint);
  M(CYL(2.2, 2.2, 40, 12), steel, 0, 0, 0, g, 0.1, 2.2);
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4, x = Math.cos(a) * 12, z = Math.sin(a) * 12; M(new THREE.SphereGeometry(7, 20, 14), tank, x, 0, z, g, 0.2, 7); M(new THREE.TorusGeometry(7.05, 0.7, 6, 28), acc, x, 0, z, g, 0).rotation.x = Math.PI / 2; M(BOX(10, 1.2, 1.2), steel, Math.cos(a) * 6, 0, Math.sin(a) * 6, g, 0.04).rotation.y = -a; }
  M(new THREE.TorusGeometry(20, 1.0, 6, 40), steel, 0, 10, 0, g, 0.1).rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(20, 1.0, 6, 40), steel, 0, -10, 0, g, 0.1).rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; M(BOX(0.8, 20, 0.8), steel, Math.cos(a) * 20, 0, Math.sin(a) * 20, g, 0); }
  for (const s of [-1, 1]) { M(BOX(16, 1.4, 1.4), steel, s * 26, 0, 0, g, 0.05); M(CYL(1.6, 1.6, 4, 10), acc, s * 34, 0, 0, g, 0.05).rotation.z = Math.PI / 2; beacon(g, s * 36, 0, 0, 0x6ee7b7, s); }
  M(CYL(3, 1, 6, 10), toon('#5a6276'), 0, 23, 0, g, 0.08); beacon(g, 0, 27, 0, new THREE.Color(w.tint).getHex(), 2);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(26, 5.5), new THREE.MeshToonMaterial({ map: signTex('FUEL', null, w.tint), gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: signTex('FUEL', null, w.tint), emissiveIntensity: 0.6 })); sg.position.set(0, 16, 20.8); g.add(sg); const sb = sg.clone(); sb.rotation.y = Math.PI; sb.position.z = 20.2; g.add(sb);
  bake(g); return 34;
}
const GATE_MATS = [];
function gateHorizon(col) { const m = new THREE.ShaderMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uC: { value: new THREE.Color(col) } },
  vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform float uT; uniform vec3 uC; varying vec2 vU; void main(){ vec2 p = vU - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x); float sw = sin(a * 6.0 + r * 14.0 - uT * 3.0) * 0.5 + 0.5; float core = smoothstep(1.0, 0.0, r); float rim = smoothstep(0.6, 1.0, r) * smoothstep(1.02, 0.95, r); vec3 c = mix(uC, vec3(1.0), sw * 0.35 + core * 0.4); gl_FragColor = vec4(c, (0.25 + 0.45 * sw) * core * 0.9 + rim * 0.8); }' });
  GATE_MATS.push(m); return m; }
function buildGate(w, g) {   // a ring of segments that turns, pylons, and a swirling horizon you fly through
  const steel = toon('#5a5f72'), acc = toon(w.tint);
  const ring = new THREE.Group(); ring.userData.keep = true; g.add(ring);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, s = new THREE.Group(); s.position.set(Math.cos(a) * 40, Math.sin(a) * 40, 0); s.rotation.z = a; ring.add(s); M(BOX(7, 9, 9), steel, 0, 0, 0, s, 0.2); M(BOX(7.2, 2, 9.4), acc, 0, 0, 0, s, 0); M(BOX(2, 2, 2), glowing(w.tint, 2.4), -3.8, 0, 0, s, 0); }
  ANIM.push({ fn: (t, dt) => { ring.rotation.z += dt * 0.25; } });
  const ev = new THREE.Mesh(new THREE.CircleGeometry(36, 64), gateHorizon(w.tint)); g.add(ev);
  for (const s of [-1, 1]) { M(BOX(6, 30, 6), steel, s * 52, -26, 0, g, 0.15); M(BOX(14, 4, 8), acc, s * 46, -10, 0, g, 0.1); beacon(g, s * 52, -10, 4, new THREE.Color(w.tint).getHex(), s); }
  glow(0, 0, 0, new THREE.Color(w.tint).getHex(), 90, g, 0.35);
  return 46;
}
const BUILD = { dock: buildDock, mine: buildMine, yard: buildYard, fuel: buildFuel, gate: buildGate };
for (const w of WORLDS) {
  for (const [kind, I] of Object.entries(INST)) {
    const L = Math.hypot(I.dx, I.dz), d = w.r + I.d, x = w.x + I.dx / L * d, z = w.z + I.dz / L * d;
    const g = new THREE.Group(); g.position.set(x, kind === 'gate' ? 6 : 0, z);
    if (kind === 'gate') g.rotation.y = Math.atan2(I.dx, I.dz); else g.rotation.y = rr(0, TAU);
    scene.add(g); const r = BUILD[kind](w, g);
    const name = kind === 'dock' && w.k === 'player' ? 'Home Dock' : kind === 'dock' ? w.n + ' Dock' : w.n + ' ' + I.name;
    STRUCTS.push({ kind, w, x, z, g, r, name, label: I.label });
  }
}
// Deep Space Fox: the big ring station off Home, boarded from your own dock
const DSF = { k: 'station', n: 'Deep Space Fox', x: WORLDS[0].x - 420, z: WORLDS[0].z - 260, r: 60 };
{ const g = new THREE.Group(); g.position.set(DSF.x, 0, DSF.z); scene.add(g); const hull = toon('#9aa4b5'), dark = toon('#3a404c');
  const ring = new THREE.Group(); ring.userData.keep = true; g.add(ring); M(new THREE.TorusGeometry(58, 5, 12, 64), hull, 0, 0, 0, ring, 0.4, 5).rotation.x = Math.PI / 2;
  for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; M(BOX(2.4, 1.6, 1.6), glowing(i % 4 ? '#5fe1ff' : '#ff3fa4', 2), Math.cos(a) * 63.2, 0, Math.sin(a) * 63.2, ring, 0); }
  for (let i = 0; i < 6; i++) { const s = M(BOX(116, 2.4, 2.4), dark, 0, 0, 0, ring, 0.1); s.rotation.y = i / 6 * Math.PI; }
  ANIM.push({ fn: (t, dt) => { ring.rotation.y += dt * 0.05; } });
  M(CYL(12, 12, 36, 20), hull, 0, 0, 0, g, 0.3, 12); M(new THREE.SphereGeometry(12, 20, 12), toon('#cfd5df'), 0, 18, 0, g, 0.3, 12); M(CYL(4, 8, 14, 12), dark, 0, -24, 0, g, 0.2, 8);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; M(BOX(1.4, 1.4, 1.4), glowing('#ffd38a', 1.4), Math.cos(a) * 12.2, 6, Math.sin(a) * 12.2, g, 0); }
  const pad = new THREE.Mesh(new THREE.CircleGeometry(10, 32), new THREE.MeshToonMaterial({ map: emblemTex('8', { outer: '#ec3013', ring: '#e6b45a', bg: '#151b3d', stroke: '#7dd3fc' }), gradientMap: grad })); pad.rotation.x = -Math.PI / 2; pad.position.y = 30.1; g.add(pad);
  glow(0, 0, 0, 0x5fe1ff, 260, g, 0.25); bake(g);
  const lt = signTex('DEEP SPACE FOX', null, '#5fe1ff'); const lbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, transparent: true, depthTest: false })); lbl.position.set(0, 90, 0); lbl.scale.set(96, 24, 1); lbl.renderOrder = 5; g.add(lbl);
  STRUCTS.push({ kind: 'dsf', w: WORLDS[0], x: DSF.x, z: DSF.z, g, r: 70, name: 'Deep Space Fox', label: 'STATION' }); }
// Earth's gate (the far end of the network) — Earth has no dock: you land on the Strip
{ const g = new THREE.Group(); const x = EARTH.x - EARTH.r - 190, z = EARTH.z - 60; g.position.set(x, 6, z); g.rotation.y = -Math.PI / 2; scene.add(g); buildGate(EARTH, g); STRUCTS.push({ kind: 'gate', w: EARTH, x, z, g, r: 46, name: 'Earth Star Gate', label: 'STAR GATE' }); }

// ================================================================ CORSAIR PORTS (out in the deep)
const PORTS3 = [];
for (const p of PORTS) {
  const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = rr(0, TAU); scene.add(g);
  const rock = toon('#4a4048'), iron = toon('#2a2630'), red = toon('#8a1230');
  const r = M(new THREE.DodecahedronGeometry(40, 1), rock, 0, -10, 0, g, 0.5, 40); r.scale.set(1.4, 0.7, 1.1);
  for (let i = 0; i < 7; i++) M(new THREE.DodecahedronGeometry(rr(6, 14), 0), rock, rr(-50, 50), rr(-20, 4), rr(-40, 40), g, 0.3, 8);
  M(BOX(46, 10, 30), iron, 0, 12, 0, g, 0.2); M(BOX(20, 14, 16), iron, -8, 24, 0, g, 0.2); M(hipRoofGeo(22, 18, 6), red, -8, 31, 0, g, 0.15);
  for (const s of [-1, 1]) { M(BOX(4, 34, 4), iron, s * 20, 20, 10, g, 0.08); const fl = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), new THREE.MeshToonMaterial({ map: signTex('✖', null, '#ec3013'), gradientMap: grad, side: THREE.DoubleSide })); fl.position.set(s * 20 + 5, 34, 10); g.add(fl); }
  for (let i = 0; i < 10; i++) M(BOX(1.6, 1.6, 1.6), glowing(i % 3 ? '#ff5a3a' : '#ffd38a', 1.6), -20 + i * 4.4, 14, 15.2, g, 0);
  const sg = signTex(p.name, null, '#ec3013'); const lbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: sg, transparent: true, depthTest: false })); lbl.position.set(0, 66, 0); lbl.scale.set(70, 17.5, 1); lbl.renderOrder = 5; g.add(lbl);
  bake(g);
  const turrets = []; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4, t = new THREE.Group(); t.position.set(Math.cos(a) * 34, 8, Math.sin(a) * 26); g.add(t); M(CYL(3, 4, 4, 10), iron, 0, 0, 0, t, 0.1, 4); const head = new THREE.Group(); head.position.y = 3; t.add(head); M(new THREE.SphereGeometry(2.6, 12, 8), red, 0, 0, 0, head, 0.1, 2.6); M(CYL(0.5, 0.5, 6, 8), iron, 0, 0, 3.4, head, 0.03, 0.5).rotation.x = Math.PI / 2; turrets.push({ t, head, hp: 30, cd: rr(1, 3), dead: false }); }
  const razed = save.flag('space.port.' + p.name);
  const P = { ...p, g, turrets, hp: razed ? 0 : 420, max: 420, razed, r: 60, kind: 'port', name: 'Corsair port ' + p.name };
  if (razed) razePort(P, true);
  PORTS3.push(P);
}
function hipRoofGeo(W, D, H) { const g = new THREE.BufferGeometry(); const w = W / 2, d = D / 2, r = Math.max(0, w - d); const v = [-w, 0, -d, w, 0, -d, w, 0, d, -w, 0, d, -r, H, 0, r, H, 0]; const idx = [0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 4, 2, 4, 3, 3, 4, 0]; g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals(); return g.toNonIndexed(); }
function razePort(P, quiet) { P.razed = true; P.hp = 0; P.turrets.forEach(t => { t.dead = true; t.t.visible = false; }); P.g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material.color && !o.material.emissiveIntensity) o.material = toon('#2a2628'); }); if (!quiet) { save.setFlag('space.port.' + P.name); } }

// ================================================================ ASTEROIDS (instanced; shoot them for ore)
const ROCKS = [];   // {x,y,z,s,hp,ore,alive,i,mesh,rot,spin}
const rockGeo = new THREE.DodecahedronGeometry(1, 1); { const p = rockGeo.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)); const k = 1 + (fbm(v.x * 2 + 3, v.y * 2 + v.z) - 0.5) * 0.5; p.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k); } rockGeo.computeVertexNormals(); }
const ROCK_IM = [];
function makeField(cx, cz, r0, r1, n, flat = 14) {
  const list = []; for (let i = 0; i < n; i++) { const a = rr(0, TAU), R = rr(r0, r1), s = Math.random() < 0.12 ? rr(9, 16) : rr(2.5, 8); list.push({ x: cx + Math.cos(a) * R, y: rr(-flat, flat), z: cz + Math.sin(a) * R, s, hp: Math.ceil(s / 2.5), ore: Math.random() < 0.22, alive: true, rot: new THREE.Euler(rr(0, 6), rr(0, 6), rr(0, 6)), spin: rr(-0.3, 0.3) }); }
  const ore = list.filter(r => r.ore), plain = list.filter(r => !r.ore);
  for (const [L, col] of [[plain, '#8a8478'], [ore, '#b8945a']]) { if (!L.length) continue; const im = new THREE.InstancedMesh(rockGeo, toon(col), L.length); im.castShadow = false; const ol = new THREE.InstancedMesh(rockGeo, outlineMat, L.length); scene.add(im); scene.add(ol);
    L.forEach((r, i) => { r.im = im; r.ol = ol; r.i = i; }); ROCK_IM.push({ im, ol, L }); if (col === '#b8945a') { const gl = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.35, 0), glowing('#ffd23a', 2.2), L.length * 3); L.forEach((r, i) => { r.gl = gl; r.gi = i * 3; }); scene.add(gl); ROCK_IM.push({ gl, L }); } }
  ROCKS.push(...list);
}
makeField(0, 0, 330, 470, low ? 260 : 420, 10);              // Meru's belt
makeField(-700, -700, 0, 260, low ? 70 : 120); makeField(700, -700, 0, 240, low ? 60 : 110); makeField(-700, 700, 0, 260, low ? 70 : 120); makeField(700, 700, 0, 260, low ? 70 : 120);
makeField(EARTH.x, EARTH.z, EARTH.r * 3.9, EARTH.r * 4.7, low ? 70 : 130, 6);
for (const P of PORTS) makeField(P.x, P.z, 90, 260, low ? 40 : 70, 20);
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v4 = new THREE.Vector3(), s4 = new THREE.Vector3();
function writeRock(r) { if (!r.alive) { m4.makeScale(0, 0, 0); r.im.setMatrixAt(r.i, m4); r.ol.setMatrixAt(r.i, m4); if (r.gl) for (let k = 0; k < 3; k++) r.gl.setMatrixAt(r.gi + k, m4); return; }
  q4.setFromEuler(r.rot); m4.compose(v4.set(r.x, r.y, r.z), q4, s4.set(r.s, r.s, r.s)); r.im.setMatrixAt(r.i, m4); m4.compose(v4, q4, s4.multiplyScalar(1.05)); r.ol.setMatrixAt(r.i, m4);
  if (r.gl) for (let k = 0; k < 3; k++) { const a = k * 2.1 + r.rot.y; m4.compose(v4.set(r.x + Math.cos(a) * r.s * 0.8, r.y + r.s * 0.35 * (k - 1), r.z + Math.sin(a) * r.s * 0.8), q4, s4.set(r.s * 0.28, r.s * 0.5, r.s * 0.28)); r.gl.setMatrixAt(r.gi + k, m4); } }
ROCKS.forEach(writeRock); ROCK_IM.forEach(o => { if (o.im) { o.im.instanceMatrix.needsUpdate = true; o.ol.instanceMatrix.needsUpdate = true; o.im.computeBoundingSphere(); o.ol.computeBoundingSphere(); } if (o.gl) { o.gl.instanceMatrix.needsUpdate = true; o.gl.computeBoundingSphere(); } });
// a spatial hash for rocks
const HASH = new Map(), HC = 60; const hk = (x, z) => Math.floor(x / HC) + ',' + Math.floor(z / HC);
ROCKS.forEach(r => { const k = hk(r.x, r.z); if (!HASH.has(k)) HASH.set(k, []); HASH.get(k).push(r); });
function rocksNear(x, z) { const out = []; const cx = Math.floor(x / HC), cz = Math.floor(z / HC); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const L = HASH.get((cx + a) + ',' + (cz + b)); if (L) for (const r of L) if (r.alive) out.push(r); } return out; }

export { mk, marks, THREE, scene, camera, renderer, WORLDS, EARTH, BODIES, STRUCTS, PORTS3, ROCKS, DSF, INST, CELL, M, BOX, CYL, toon, glowing, glow, bake, outlineMat, grad, glowTex, ANIM, SPIN, MOONS, GATE_MATS, GLOWS, rocksNear, writeRock, ROCK_IM, razePort, emblemFor, low, touch, $, show, TAU, wrapA, QS, signTex, emblemTex, save };
import('./space-play.js');
