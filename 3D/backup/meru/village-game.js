import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// ---------- math / noise ----------
let seed = 20260930;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rr = (a, b) => a + rnd() * (b - a);
const pick = a => a[Math.floor(rnd() * a.length)];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z) { let s = 0, a = 1, f = 1, n = 0; for (let i = 0; i < 4; i++) { s += vnoise(x * f, z * f) * a; n += a; a *= 0.5; f *= 2.03; } return s / n; }

// ---------- world layout ----------
const POND = { x: -36, z: 28, r: 10 };
const MILL = { x: 54, z: -48 };
const MEADOW = { x: 10, z: 39 };
const WATER_Y = -0.45;
const deg = d => d * Math.PI / 180;
const PATHS = [
  { a: Math.atan2(POND.z, POND.x), len: Math.hypot(POND.x, POND.z) - POND.r - 3 },
  { a: Math.atan2(MILL.z, MILL.x), len: Math.hypot(MILL.x, MILL.z) - 4 },
  { a: deg(60), len: 125 },
  { a: deg(230), len: 125 },
];
function pathDist(x, z) {
  let m = 1e9;
  for (const p of PATHS) {
    const dx = Math.cos(p.a), dz = Math.sin(p.a);
    const t = clamp(x * dx + z * dz, 0, p.len);
    const wob = Math.sin(t * 0.09 + p.a * 3) * 2.2 * smooth(12, 30, t);
    const px = dx * t - dz * wob, pz = dz * t + dx * wob;
    m = Math.min(m, Math.hypot(x - px, z - pz));
  }
  return m;
}
function heightAt(x, z) {
  const r = Math.hypot(x, z);
  let h = (fbm(x * 0.016 + 3.1, z * 0.016 + 7.3) - 0.42) * 20 * smooth(26, 80, r);
  h += smooth(85, 145, r) * (14 + 26 * fbm(x * 0.012 + 11, z * 0.012 + 5));
  h += (vnoise(x * 0.09, z * 0.09) - 0.5) * 0.7 * smooth(11, 26, r);
  const dm = Math.hypot(x - MILL.x, z - MILL.z); h += 8 * Math.exp(-dm * dm / 320);
  const dp = Math.hypot(x - POND.x, z - POND.z); const k = smooth(POND.r - 4, POND.r + 6, dp);
  return -2.2 + (h + 2.2) * k;
}

// ---------- palettes over the day ----------
const C = h => new THREE.Color(h);
const KEYS = [
  [0, { top: '#0a1030', hor: '#26305e', fog: '#1f2850', light: '#9fb4ff', li: 0.55, hs: '#3a4a8a', hg: '#1a2030', hi: 0.6, glow: 1 }],
  [5, { top: '#0c1438', hor: '#2c3466', fog: '#232c58', light: '#9fb4ff', li: 0.5, hs: '#3a4a8a', hg: '#1a2030', hi: 0.6, glow: 1 }],
  [6.2, { top: '#4a5aa0', hor: '#f7a98a', fog: '#e7b3a0', light: '#ffb48a', li: 1.2, hs: '#a8a8d8', hg: '#5a6a50', hi: 0.8, glow: 0.5 }],
  [7.6, { top: '#6fb0e8', hor: '#f2e2c8', fog: '#e6e4d8', light: '#ffe2b8', li: 2.2, hs: '#cfe2ff', hg: '#6b8a50', hi: 1.0, glow: 0 }],
  [12, { top: '#4b9be6', hor: '#cbe6f7', fog: '#cfe4f0', light: '#fff6e6', li: 2.6, hs: '#d6ecff', hg: '#6f9a52', hi: 1.1, glow: 0 }],
  [16.5, { top: '#5a9ee0', hor: '#f6dcb0', fog: '#ecd9bd', light: '#ffd9a0', li: 2.4, hs: '#e0e2f0', hg: '#7a8a50', hi: 1.0, glow: 0 }],
  [18, { top: '#4f6fb8', hor: '#ffb070', fog: '#f0b48a', light: '#ffa060', li: 1.9, hs: '#c8a8c8', hg: '#6a5a40', hi: 0.9, glow: 0.3 }],
  [19.2, { top: '#2c3478', hor: '#e8706a', fog: '#a86a7a', light: '#ff7a60', li: 0.7, hs: '#6a5a9a', hg: '#3a3040', hi: 0.75, glow: 0.8 }],
  [20.3, { top: '#121a48', hor: '#4a4a8a', fog: '#303a6a', light: '#9fb4ff', li: 0.45, hs: '#4a4a8a', hg: '#1e2234', hi: 0.6, glow: 1 }],
  [24, { top: '#0a1030', hor: '#26305e', fog: '#1f2850', light: '#9fb4ff', li: 0.55, hs: '#3a4a8a', hg: '#1a2030', hi: 0.6, glow: 1 }],
].map(([h, p]) => [h, { ...p, top: C(p.top), hor: C(p.hor), fog: C(p.fog), light: C(p.light), hs: C(p.hs), hg: C(p.hg) }]);
function paletteAt(h, out) {
  let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const [h0, a] = KEYS[i], [h1, b] = KEYS[i + 1];
  const t = smooth(0, 1, (h - h0) / (h1 - h0));
  for (const k of ['top', 'hor', 'fog', 'light', 'hs', 'hg']) out[k].copy(a[k]).lerp(b[k], t);
  out.li = lerp(a.li, b.li, t); out.hi = lerp(a.hi, b.hi, t); out.glow = lerp(a.glow, b.glow, t);
  return out;
}

// ---------- materials ----------
function makeGradient() {
  const tones = [70, 150, 215, 255];
  const data = new Uint8Array(tones.length * 4);
  tones.forEach((t, i) => data.set([t, t, t, 255], i * 4));
  const tex = new THREE.DataTexture(data, tones.length, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
  return tex;
}
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.beginPath(); g.arc(16, 16, 14, 0, 7); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- characters ----------
const DIALOG = {
  Mira: { role: 'Baker', lines: c => [
    c.night ? 'You\'re up late. The last loaf of the day is always the best one.' : c.rain ? 'Rain is good for bread. Everyone stays in and eats.' : 'Morning or evening, the ovens never really go cold.',
    'The stall by the fountain is mine. Take a bun, nobody\'s counting.',
    'If you follow the east road up past the windmill, you can see the whole vale at once.',
  ] },
  Tobin: { role: 'Fisherman', lines: c => [
    'Shh. They bite more when it\'s quiet.',
    c.fog ? 'Fog like this, the far shore disappears. Feels like the pond goes on forever.' : 'Forty years at this pond. Caught the same carp three times. We\'re friends now.',
    c.night ? 'The moon makes a road on the water. Never managed to walk it.' : 'Go on, I\'ll be here. I\'m always here.',
  ] },
  Pell: { role: 'Village kid', lines: c => [
    'Bet you can\'t jump as high as me! Press space, go on.',
    c.night ? 'I\'m not allowed out after dark. Don\'t tell anyone.' : 'The lanterns turn on by themselves at dusk. I\'ve never caught them doing it.',
    'Old Tobin says there\'s a fish in the pond older than him.',
  ] },
  Haru: { role: 'Miller', lines: c => [
    c.rain ? 'Wet wind is still wind. The blades don\'t mind.' : 'The blades turn whether there\'s grain or not. I just let them.',
    'On a clear day you can count every roof in the village from up here.',
    'Twelve houses, one fountain, one pond. That\'s the whole of Hollow Vale.',
  ] },
  Ines: { role: 'Florist', lines: c => [
    'Every flower in this meadow was planted by someone in the village.',
    c.night ? 'At night the fireflies take over. I just tidy up after them.' : 'The blossom trees by the square only look like this for a few weeks. Come back often.',
    'Pick one if you like. They grow back.',
  ] },
};

// ---------- audio ----------
class Ambience {
  constructor() { this.ctx = null; this.muted = false; this.tBird = 2; this.tCricket = 1; }
  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.6; this.master.connect(ctx.destination);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    const loop = (filters, g) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; let n = s; for (const f of filters) { n.connect(f); n = f; } const gain = ctx.createGain(); gain.gain.value = g; n.connect(gain); gain.connect(this.master); s.start(); return gain; };
    const bq = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    this.wind = loop([bq('lowpass', 380)], 0.1);
    this.rain = loop([bq('highpass', 900), bq('lowpass', 7000)], 0);
    this.water = loop([bq('bandpass', 2400, 0.9)], 0);
  }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.1); }
  tone(freq, dur, vol, type = 'sine', sweep = 0, pan = 0) {
    if (!this.ctx || this.muted) return; const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); if (sweep) o.frequency.exponentialRampToValueAtTime(freq * sweep, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; o.connect(g); g.connect(p); p.connect(this.master); } else { o.connect(g); g.connect(this.master); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  burst(dur, f, vol) {
    if (!this.ctx || this.muted) return; const ctx = this.ctx, t = ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = this.noise; const b = ctx.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = f;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b); b.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  step() { this.burst(0.07, 700 + Math.random() * 400, 0.12); }
  blip() { this.tone(880, 0.08, 0.05, 'triangle'); }
  update(dt, e) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    this.wind.gain.setTargetAtTime(0.07 + 0.08 * e.fog + 0.1 * e.rain + 0.03 * Math.sin(t * 0.3), t, 0.5);
    this.rain.gain.setTargetAtTime(0.32 * e.rain, t, 0.6);
    this.water.gain.setTargetAtTime(0.05 * (1 - smooth(4, 20, e.fountainDist)), t, 0.2);
    if (e.day > 0.5 && e.rain < 0.5 && (this.tBird -= dt) < 0) {
      this.tBird = rr(1.5, 6); const f = rr(2200, 3600), pan = rr(-0.8, 0.8), n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) setTimeout(() => this.tone(f * rr(0.9, 1.15), 0.09, 0.025, 'sine', rr(1.2, 1.6), pan), i * 110);
    }
    if (e.night > 0.5 && e.rain < 0.5 && (this.tCricket -= dt) < 0) {
      this.tCricket = rr(0.3, 1.2); const pan = rr(-1, 1);
      for (let i = 0; i < 3; i++) setTimeout(() => this.tone(4600, 0.03, 0.012, 'sine', 0, pan), i * 45);
    }
  }
  dispose() { try { this.ctx && this.ctx.close(); } catch (e) {} }
}

// ---------- main ----------
export async function createGame({ container, minimap, options = {}, onState = () => {} }) {
  const opts = { timeScale: 2, startHour: 17.5, outlines: true, quality: 'high', ...options };
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.quality === 'low' ? 1 : 2));
  renderer.setSize(W(), H());
  renderer.shadowMap.enabled = opts.quality !== 'low';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1200);
  scene.fog = new THREE.FogExp2(0xcfe4f0, 0.005);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture();
  const matCache = new Map();
  const toon = (c, extra) => {
    const key = c + (extra ? JSON.stringify(extra) : '');
    if (!matCache.has(key)) matCache.set(key, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra }));
    return matCache.get(key);
  };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x241c1e, side: THREE.BackSide });
  outlineMat.visible = !!opts.outlines;
  function addOutline(mesh, t = 0.04, radius) {
    const g = mesh.geometry; g.computeBoundingBox();
    const s = new THREE.Vector3(); g.boundingBox.getSize(s);
    const o = new THREE.Mesh(g, outlineMat);
    if (radius) o.scale.setScalar(1 + t / radius);
    else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01));
    mesh.add(o); return mesh;
  }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (outline) addOutline(m, outline, radius);
    if (parent) parent.add(m); return m;
  }

  // lights
  const hemi = new THREE.HemisphereLight(0xd6ecff, 0x6f9a52, 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 260 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  // sky
  const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, moonDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunVis: { value: 1 }, moonVis: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 top, hor, bottom, sunDir, moonDir, sunCol; uniform float sunVis, moonVis;
      void main(){ vec3 d = normalize(vDir); float y = d.y;
        vec3 col = mix(hor, top, pow(smoothstep(0.0, 1.0, max(y, 0.0)), 0.55));
        col = mix(col, bottom, smoothstep(0.0, -0.2, y));
        float sd = max(dot(d, sunDir), 0.0);
        col += sunCol * (pow(sd, 48.0) * 0.55 + pow(sd, 6.0) * 0.22) * sunVis;
        col = mix(col, vec3(1.0, 0.97, 0.88), smoothstep(0.9990, 0.9994, sd) * sunVis);
        float md = max(dot(d, moonDir), 0.0);
        col = mix(col, vec3(0.93, 0.95, 1.0), smoothstep(0.9993, 0.9996, md) * moonVis);
        col += vec3(0.45, 0.55, 1.0) * pow(md, 120.0) * 0.35 * moonVis;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  sky.renderOrder = -10; scene.add(sky);

  // stars
  const starGeo = new THREE.BufferGeometry(); const sp = [];
  for (let i = 0; i < 900; i++) { const u = rnd() * Math.PI * 2, v = Math.acos(rr(0.05, 1)); sp.push(Math.sin(v) * Math.cos(u) * 450, Math.cos(v) * 450, Math.sin(v) * Math.sin(u) * 450); }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat); scene.add(stars);

  // terrain
  const SIZE = 300, SEG = 220;
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, cols = new Float32Array(pos.count * 3);
  const G1 = C('#8cc35c'), G2 = C('#5f9f48'), G3 = C('#3f7a45'), ROCK = C('#b7ad9a'), PATH = C('#d9bf8f'), PLAZA = C('#e2d6bd'), PLAZA2 = C('#cfc1a4'), SAND = C('#ead69e'), MEAD = C('#b9d65e'), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z); pos.setY(i, h);
    const r = Math.hypot(x, z);
    tmp.copy(G1).lerp(G2, smooth(0.35, 0.65, fbm(x * 0.06 + 9, z * 0.06)));
    tmp.lerp(G3, smooth(6, 16, h)); tmp.lerp(ROCK, smooth(20, 32, h));
    tmp.lerp(MEAD, 0.6 * (1 - smooth(6, 14, Math.hypot(x - MEADOW.x, z - MEADOW.z))));
    const dpd = Math.hypot(x - POND.x, z - POND.z); tmp.lerp(SAND, 1 - smooth(POND.r + 3, POND.r + 5.5, dpd));
    const pd = pathDist(x, z) + (vnoise(x * 0.4, z * 0.4) - 0.5) * 0.8; tmp.lerp(PATH, 1 - smooth(1.0, 1.9, pd));
    if (r < 10.5) { const ring = Math.floor(r / 1.5) % 2 ? PLAZA2 : PLAZA; tmp.lerp(ring, 1 - smooth(9.4, 10.2, r)); }
    cols.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  tg.setAttribute('color', new THREE.BufferAttribute(cols, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad }));
  terrain.receiveShadow = true; terrain.castShadow = true; scene.add(terrain);

  // water
  const waterMat = new THREE.MeshToonMaterial({ color: 0x5fb6c8, gradientMap: grad, transparent: true, opacity: 0.86 });
  const water = new THREE.Mesh(new THREE.CircleGeometry(POND.r + 6, 64), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.set(POND.x, WATER_Y, POND.z); water.receiveShadow = true; scene.add(water);
  const pads = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 10), toon('#5f9a3c'), 14);
  for (let i = 0; i < 14; i++) { const a = rr(0, 6.28), d = rr(3, POND.r); const m = new THREE.Matrix4().compose(new THREE.Vector3(POND.x + Math.cos(a) * d, WATER_Y + 0.03, POND.z + Math.sin(a) * d), new THREE.Quaternion(), new THREE.Vector3().setScalar(rr(0.6, 1.2))); pads.setMatrixAt(i, m); }
  scene.add(pads);

  const colliders = []; // {x,z,r} circles or {x,z,ry,hw,hd} boxes
  const mapItems = { houses: [], trees: [] };
  const windows = toon('#33445a', { emissive: new THREE.Color('#ffb24a'), emissiveIntensity: 0 });
  const lampGlass = toon('#fff1c8', { emissive: new THREE.Color('#ffc86a'), emissiveIntensity: 0 });

  // houses
  const WALLS = ['#f4e6cc', '#f7f1e6', '#f3dca0', '#cfe0e8', '#f2c9a8', '#e9eadf'];
  const ROOFS = ['#d9442b', '#b8342a', '#3e5a78', '#c97a2b', '#ec3013', '#6a8a4a'];
  const WOOD = toon('#6b4a35'), STONE = toon('#b9ad98'), DARK = toon('#3a2a22');
  const houseSpots = [[10, 19], [30, 24], [85, 19], [105, 24], [122, 18.5], [165, 19], [190, 24], [208, 19], [255, 19], [275, 24], [295, 19], [340, 23]];
  const chimneys = [];
  houseSpots.forEach(([ad, d], i) => {
    const a = deg(ad), x = Math.cos(a) * d, z = Math.sin(a) * d, y = heightAt(x, z) - 0.15;
    const w = rr(4.2, 5.6), dp = rr(3.8, 4.8), h = rr(2.8, 3.8), rh = rr(1.8, 2.6);
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    M(new THREE.BoxGeometry(w + 0.4, 0.5, dp + 0.4), STONE, 0, 0.25, 0, g, 0.04);
    const wallM = toon(WALLS[i % WALLS.length]);
    M(new THREE.BoxGeometry(w, h, dp), wallM, 0, 0.5 + h / 2, 0, g, 0.05);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.BoxGeometry(0.22, h, 0.22), WOOD, sx * (w / 2 - 0.06), 0.5 + h / 2, sz * (dp / 2 - 0.06), g, 0);
    M(new THREE.BoxGeometry(w + 0.1, 0.2, dp + 0.1), WOOD, 0, 0.5 + h - 0.1, 0, g, 0);
    const shape = new THREE.Shape(); const rw = w / 2 + 0.55;
    shape.moveTo(-rw, 0); shape.lineTo(rw, 0); shape.lineTo(0, rh); shape.closePath();
    const rg = new THREE.ExtrudeGeometry(shape, { depth: dp + 0.9, bevelEnabled: false }); rg.translate(0, 0, -(dp + 0.9) / 2); rg.computeVertexNormals();
    const roofSide = false;
    const roof = M(rg, toon(ROOFS[i % ROOFS.length]), 0, 0.5 + h, 0, g, 0);
    if (roofSide) { roof.rotation.y = Math.PI / 2; roof.scale.set((dp + 0.9) / (w + 0.9), 1, (w + 0.9) / (dp + 0.9)); }
    const ro = new THREE.Mesh(rg, outlineMat); ro.scale.set(1 + 0.1 / rw, 1 + 0.1 / rh, 1 + 0.1 / (dp + 0.9)); ro.position.y = -0.04; roof.add(ro);
    const ch = M(new THREE.BoxGeometry(0.55, 1.6, 0.55), toon('#a5664a'), w / 4, 0.5 + h + rh * 0.5, -dp / 5, g, 0.04);
    chimneys.push(ch);
    M(new THREE.BoxGeometry(0.95, 1.6, 0.1), WOOD, 0, 0.5 + 0.8, dp / 2 + 0.05, g, 0.03);
    M(new THREE.BoxGeometry(0.08, 0.08, 0.08), toon('#e8c060'), 0.32, 1.3, dp / 2 + 0.12, g, 0);
    for (const sx of [-1, 1]) {
      M(new THREE.BoxGeometry(0.8, 0.8, 0.08), windows, sx * w * 0.3, 0.5 + h * 0.58, dp / 2 + 0.04, g, 0.035);
      M(new THREE.BoxGeometry(0.95, 0.22, 0.32), toon('#7a4a2e'), sx * w * 0.3, 0.5 + h * 0.58 - 0.5, dp / 2 + 0.16, g, 0.03);
      for (let k = -1; k <= 1; k++) M(new THREE.IcosahedronGeometry(0.11, 0), toon(pick(['#ff6b8a', '#ffd04a', '#ffffff', '#ec3013'])), sx * w * 0.3 + k * 0.28, 0.5 + h * 0.58 - 0.33, dp / 2 + 0.2, g, 0);
      M(new THREE.BoxGeometry(0.08, 0.8, 0.8), windows, sx * (w / 2 + 0.04), 0.5 + h * 0.58, 0, g, 0.035);
    }
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
    colliders.push({ x, z, ry: g.rotation.y, hw: (roofSide ? w : w) / 2 + 0.35, hd: dp / 2 + 0.35 });
    mapItems.houses.push({ x, z, ry: g.rotation.y, w: w + 0.4, d: dp + 0.4, roof: ROOFS[i % ROOFS.length] });
  });

  // fountain
  const fountain = new THREE.Group(); scene.add(fountain);
  const stoneL = toon('#d8ccb4');
  M(new THREE.CylinderGeometry(3, 3.2, 0.7, 28), stoneL, 0, 0.35, 0, fountain, 0.06, 3.2);
  const fw = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.05, 28), waterMat); fw.position.y = 0.6; fountain.add(fw);
  M(new THREE.CylinderGeometry(0.32, 0.45, 1.8, 12), stoneL, 0, 1.2, 0, fountain, 0.04, 0.45);
  M(new THREE.CylinderGeometry(1.1, 0.55, 0.35, 20), stoneL, 0, 2.15, 0, fountain, 0.05, 1.1);
  M(new THREE.SphereGeometry(0.22, 12, 8), toon('#ec3013'), 0, 2.55, 0, fountain, 0.03, 0.22);
  colliders.push({ x: 0, z: 0, r: 3.4 });
  const dropN = 140, dropGeo = new THREE.BufferGeometry(); dropGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(dropN * 3), 3));
  const drops = new THREE.Points(dropGeo, new THREE.PointsMaterial({ color: 0xdff6ff, map: dotTex, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false, alphaTest: 0.1 })); scene.add(drops);
  const dropSeed = Array.from({ length: dropN }, () => [rr(0, 6.28), rr(0, 1)]);

  // lamps
  const lamps = [], lampLights = [];
  PATHS.forEach(p => [-1, 1].forEach(s => {
    const a = p.a + s * deg(10), x = Math.cos(a) * 10.6, z = Math.sin(a) * 10.6, y = heightAt(x, z);
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    M(new THREE.CylinderGeometry(0.08, 0.12, 3.2, 8), DARK, 0, 1.6, 0, g, 0.03, 0.12);
    M(new THREE.BoxGeometry(0.42, 0.5, 0.42), lampGlass, 0, 3.4, 0, g, 0.04);
    M(new THREE.ConeGeometry(0.38, 0.3, 4), DARK, 0, 3.8, 0, g, 0.03).rotation.y = Math.PI / 4;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc070, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
    spr.scale.setScalar(3); spr.position.y = 3.4; g.add(spr); lamps.push(spr);
    if (s === 1) { const L = new THREE.PointLight(0xffb060, 0, 16, 2); L.position.set(x, y + 3.2, z); scene.add(L); lampLights.push(L); }
    colliders.push({ x, z, r: 0.3 });
  }));

  // market stalls
  [[100, '#ec3013'], [282, '#3e5a78']].forEach(([ad, col]) => {
    const a = deg(ad), x = Math.cos(a) * 6.8, z = Math.sin(a) * 6.8;
    const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); scene.add(g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.BoxGeometry(0.14, 2.4, 0.14), WOOD, sx * 1.3, 1.2, sz * 0.7, g, 0.02);
    M(new THREE.BoxGeometry(2.8, 0.15, 1.5), WOOD, 0, 0.95, 0, g, 0.03);
    for (let k = 0; k < 6; k++) { const s = M(new THREE.BoxGeometry(0.5, 0.06, 1.9), toon(k % 2 ? '#f7f1e6' : col), -1.25 + k * 0.5, 2.5, 0.05, g, 0.02); s.rotation.x = 0.22; }
    for (let k = 0; k < 9; k++) M(new THREE.SphereGeometry(0.13, 8, 6), toon(pick(['#ff8a3a', '#ec3013', '#9ad04a', '#ffd04a'])), rr(-1.1, 1.1), 1.1, rr(-0.5, 0.5), g, 0.02, 0.13);
    colliders.push({ x, z, ry: g.rotation.y, hw: 1.6, hd: 1.0 });
  });

  // windmill
  const mill = new THREE.Group(); const my = heightAt(MILL.x, MILL.z) - 0.3;
  mill.position.set(MILL.x, my, MILL.z); mill.rotation.y = Math.atan2(-MILL.x, -MILL.z); scene.add(mill);
  M(new THREE.CylinderGeometry(1.6, 2.5, 8.5, 10), toon('#f4ead6'), 0, 4.25, 0, mill, 0.06, 2.5);
  M(new THREE.ConeGeometry(2.2, 2.4, 10), toon('#ec3013'), 0, 9.6, 0, mill, 0.06, 2.2);
  M(new THREE.BoxGeometry(1.1, 1.9, 0.1), WOOD, 0, 0.95, 2.3, mill, 0.03).rotation.x = -0.1;
  M(new THREE.BoxGeometry(0.6, 0.6, 0.1), windows, 0, 5.4, 1.95, mill, 0.03);
  const blades = new THREE.Group(); blades.position.set(0, 7.9, 2.2); mill.add(blades);
  M(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 10), DARK, 0, 0, 0, blades, 0.03, 0.3).rotation.x = Math.PI / 2;
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; blades.add(arm);
    M(new THREE.BoxGeometry(0.22, 6.2, 0.12), WOOD, 0, 3.1, 0.2, arm, 0.03);
    M(new THREE.BoxGeometry(1.1, 4.6, 0.05), toon('#fbf6ec'), 0.7, 3.8, 0.2, arm, 0.03);
  }
  colliders.push({ x: MILL.x, z: MILL.z, r: 2.8 });

  // dock
  const pdx = -POND.x, pdz = -POND.z, pl = Math.hypot(pdx, pdz), ux = pdx / pl, uz = pdz / pl;
  const dockStart = POND.r + 3.4;
  const dock = new THREE.Group(); dock.position.set(POND.x + ux * (dockStart - 3.5), 0, POND.z + uz * (dockStart - 3.5)); dock.rotation.y = Math.atan2(ux, uz); scene.add(dock);
  M(new THREE.BoxGeometry(1.8, 0.16, 7.5), WOOD, 0, -0.05, 0, dock, 0.03);
  for (const sx of [-1, 1]) for (const sz of [-3.4, 0, 3.4]) M(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), DARK, sx * 0.85, -0.9, sz, dock, 0);

  // instanced vegetation
  const dummy = new THREE.Object3D();
  function instanced(geo, mat, list, outlineGeo, colorsArr) {
    const im = new THREE.InstancedMesh(geo, mat, list.length); im.castShadow = true; im.receiveShadow = true;
    list.forEach((t, i) => { dummy.position.set(t.x, t.y, t.z); dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0); dummy.scale.set(t.sx ?? t.s, t.sy ?? t.s, t.sz ?? t.s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (colorsArr) im.setColorAt(i, colorsArr[i]); });
    scene.add(im);
    if (outlineGeo) { const om = new THREE.InstancedMesh(outlineGeo, outlineMat, list.length); for (let i = 0; i < list.length; i++) { im.getMatrixAt(i, dummy.matrix); om.setMatrixAt(i, dummy.matrix); } scene.add(om); }
    return im;
  }
  const blocked = (x, z, pad = 0) => {
    const r = Math.hypot(x, z);
    if (pathDist(x, z) < 2.8 + pad) return true;
    if (Math.hypot(x - POND.x, z - POND.z) < POND.r + 5 + pad) return true;
    if (Math.hypot(x - MILL.x, z - MILL.z) < 7 + pad) return true;
    if (r > 135) return true;
    return false;
  };
  const rounds = [], roundCols = [], pines = [], trunks = [], blossoms = [], blossomCols = [];
  const greens = ['#4f9a44', '#5aa84a', '#3f8a46', '#6db54c', '#478f3f'].map(C), autumn = ['#e8a33a', '#d9622b', '#f2c94a'].map(C);
  for (let i = 0; i < 1600 && rounds.length + pines.length < 330; i++) {
    const a = rr(0, 6.28), r = Math.sqrt(rr(0, 1)) * 128 + 6;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (r < 28 || blocked(x, z) || Math.hypot(x - MEADOW.x, z - MEADOW.z) < 11) continue;
    if (rnd() > smooth(26, 60, r) * 0.9 + 0.1) continue;
    const y = heightAt(x, z); if (y < WATER_Y + 0.3) continue;
    const s = rr(0.8, 1.4);
    if (y > 8 || r > 95 ? rnd() < 0.75 : rnd() < 0.25) pines.push({ x, y, z, s, ry: rr(0, 6) });
    else { rounds.push({ x, y: y + 2.6 * s, z, s, sy: s * rr(0.9, 1.2), ry: rr(0, 6) }); roundCols.push(rnd() < 0.12 ? pick(autumn) : pick(greens)); }
    trunks.push({ x, y: y + 0.9 * s, z, s });
    colliders.push({ x, z, r: 0.45 * s }); mapItems.trees.push({ x, z, s });
  }
  [40, 120, 190, 262, 338].forEach(ad => {
    const a = deg(ad), x = Math.cos(a) * 13, z = Math.sin(a) * 13, y = heightAt(x, z), s = rr(1, 1.2);
    blossoms.push({ x, y: y + 2.7 * s, z, s, ry: rr(0, 6) }); blossomCols.push(pick(['#ffb7cf', '#ffc8da', '#f7a6c4'].map(C)));
    trunks.push({ x, y: y + 0.9 * s, z, s }); colliders.push({ x, z, r: 0.5 }); mapItems.trees.push({ x, z, s, blossom: true });
  });
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.8, 7);
  instanced(trunkGeo, toon('#7a5236'), trunks, new THREE.CylinderGeometry(0.27, 0.37, 1.85, 7));
  const fol = new THREE.IcosahedronGeometry(1.6, 1), folO = new THREE.IcosahedronGeometry(1.68, 1);
  instanced(fol, toon('#ffffff'), rounds, folO, roundCols);
  instanced(new THREE.IcosahedronGeometry(1.8, 1), toon('#ffffff'), blossoms, new THREE.IcosahedronGeometry(1.88, 1), blossomCols);
  const pineA = new THREE.ConeGeometry(1.6, 2.8, 7); pineA.translate(0, 2.6, 0);
  const pineB = new THREE.ConeGeometry(1.15, 2.3, 7); pineB.translate(0, 4.1, 0);
  const pineAO = new THREE.ConeGeometry(1.68, 2.9, 7); pineAO.translate(0, 2.58, 0);
  const pineBO = new THREE.ConeGeometry(1.22, 2.4, 7); pineBO.translate(0, 4.08, 0);
  instanced(pineA, toon('#2f6e4a'), pines, pineAO); instanced(pineB, toon('#3a7f52'), pines, pineBO);

  const bushes = [], bushCols = [];
  houseSpots.forEach(([ad, d]) => { for (const s of [-1, 1]) { const a = deg(ad) + s * 0.16, rd = d - 2.4; const x = Math.cos(a) * rd, z = Math.sin(a) * rd; bushes.push({ x, y: heightAt(x, z) + 0.35, z, s: rr(0.45, 0.65), ry: rr(0, 6) }); bushCols.push(pick(greens)); } });
  instanced(new THREE.IcosahedronGeometry(1, 1), toon('#ffffff'), bushes, new THREE.IcosahedronGeometry(1.07, 1), bushCols);

  const rocks = [];
  for (let i = 0; i < 400 && rocks.length < 60; i++) { const a = rr(0, 6.28), r = rr(25, 125), x = Math.cos(a) * r, z = Math.sin(a) * r; if (blocked(x, z)) continue; const s = rr(0.4, 1.3); rocks.push({ x, y: heightAt(x, z) + 0.15 * s, z, s, sy: s * 0.7, rx: rr(0, 3), ry: rr(0, 3) }); colliders.push({ x, z, r: 0.8 * s }); }
  instanced(new THREE.DodecahedronGeometry(0.9, 0), toon('#a8a296'), rocks, new THREE.DodecahedronGeometry(0.96, 0));

  const tufts = [], tuftCols = [], tg2 = new THREE.ConeGeometry(0.1, 0.55, 3); tg2.translate(0, 0.27, 0);
  for (let i = 0; i < 9000 && tufts.length < 3200; i++) { const a = rr(0, 6.28), r = rr(11, 110), x = Math.cos(a) * r, z = Math.sin(a) * r; if (blocked(x, z, -1.2)) continue; const y = heightAt(x, z); if (y > 16) continue; tufts.push({ x, y, z, s: rr(0.7, 1.4), rz: rr(-0.2, 0.2), ry: rr(0, 6) }); tuftCols.push(pick(['#4a8a3a', '#6aa848', '#7fbf50', '#3f7a3a'].map(C))); }
  const tuftIM = instanced(tg2, toon('#ffffff'), tufts, null, tuftCols); tuftIM.castShadow = false;
  const flowers = [], flowerCols = [], FC = ['#ffffff', '#ffd04a', '#ff8fb0', '#ec3013', '#b9a0ff'].map(C);
  for (let i = 0; i < 12000 && flowers.length < 2200; i++) {
    const nearMeadow = i % 2 === 0; const a = rr(0, 6.28), r = nearMeadow ? Math.sqrt(rnd()) * 12 : rr(12, 90);
    const x = nearMeadow ? MEADOW.x + Math.cos(a) * r : Math.cos(a) * r, z = nearMeadow ? MEADOW.z + Math.sin(a) * r : Math.sin(a) * r;
    if (blocked(x, z, -1.4)) continue; const y = heightAt(x, z); if (y > 12) continue;
    flowers.push({ x, y: y + 0.32, z, s: rr(0.8, 1.3) }); flowerCols.push(nearMeadow ? FC[Math.floor(fbm(x * 0.3, z * 0.3) * 9) % FC.length] : pick(FC));
  }
  const flowerIM = instanced(new THREE.IcosahedronGeometry(0.12, 0), toon('#ffffff'), flowers, null, flowerCols); flowerIM.castShadow = false;

  // clouds
  const clouds = [], cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, emissive: new THREE.Color(0x8a8f9a), emissiveIntensity: 0.6 });
  for (let i = 0; i < 18; i++) {
    const g = new THREE.Group(), n = 4 + Math.floor(rnd() * 4);
    for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(3, 6), 1), cloudMat); m.position.set(k * 4 - n * 2 + rr(-1, 1), rr(-1, 1.5), rr(-2, 2)); m.scale.y = 0.7; g.add(m); }
    g.position.set(rr(-260, 260), rr(55, 85), rr(-260, 260)); g.userData.v = rr(1.5, 3.5); scene.add(g); clouds.push(g);
  }

  // particles: fireflies, petals, rain, smoke
  const ffN = 160, ffGeo = new THREE.BufferGeometry(), ffBase = [];
  for (let i = 0; i < ffN; i++) { let x, z; do { const a = rr(0, 6.28), r = rr(12, 70); x = Math.cos(a) * r; z = Math.sin(a) * r; } while (Math.hypot(x - POND.x, z - POND.z) < POND.r); ffBase.push([x, heightAt(x, z) + rr(0.5, 2.5), z, rr(0, 10)]); }
  ffGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(ffN * 3), 3));
  const ffMat = new THREE.PointsMaterial({ color: 0xfff08a, map: glowTex, size: 0.7, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const fireflies = new THREE.Points(ffGeo, ffMat); scene.add(fireflies);
  const ptN = 220, ptGeo = new THREE.BufferGeometry(), ptArr = new Float32Array(ptN * 3);
  for (let i = 0; i < ptN; i++) { const a = rr(0, 6.28), r = rr(4, 22); ptArr.set([Math.cos(a) * r, rr(0, 7), Math.sin(a) * r], i * 3); }
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptArr, 3));
  const petals = new THREE.Points(ptGeo, new THREE.PointsMaterial({ color: 0xffb7cf, map: dotTex, size: 0.12, transparent: true, opacity: 0.95, depthWrite: false, alphaTest: 0.1 })); scene.add(petals);
  const rainN = 1600, rainArr = new Float32Array(rainN * 6), rainGeo = new THREE.BufferGeometry();
  for (let i = 0; i < rainN; i++) { const x = rr(-40, 40), y = rr(0, 40), z = rr(-40, 40); rainArr.set([x, y, z, x - 0.15, y - 0.9, z], i * 6); }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainArr, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xc6d3e0, transparent: true, opacity: 0 });
  const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; scene.add(rain);
  const smoke = [];
  chimneys.forEach((ch, ci) => { if (ci % 2) return; for (let k = 0; k < 5; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); smoke.push({ s, ch, t: k / 5 }); } });

  // characters
  function makeChar({ outfit, skin = '#ffdcc4', hair, accent, hat, scale = 1, long = false, bun = false }) {
    const g = new THREE.Group(), parts = {};
    const sk = toon(skin), out = toon(outfit), hr = toon(hair);
    parts.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.14, 0.6, 0); g.add(p); M(new THREE.CapsuleGeometry(0.11, 0.34, 4, 8), toon('#3a3040'), 0, -0.3, 0, p, 0.03); return p; });
    parts.body = M(new THREE.CapsuleGeometry(0.33, 0.42, 4, 14), out, 0, 0.96, 0, g, 0.04);
    parts.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.4, 1.2, 0); g.add(p); M(new THREE.CapsuleGeometry(0.09, 0.32, 4, 8), out, 0, -0.22, 0, p, 0.03); M(new THREE.SphereGeometry(0.1, 8, 6), sk, 0, -0.46, 0, p, 0.025, 0.1); return p; });
    const head = new THREE.Group(); head.position.y = 1.62; g.add(head); parts.head = head;
    M(new THREE.SphereGeometry(0.37, 22, 16), sk, 0, 0, 0, head, 0.04, 0.37);
    const cap = M(new THREE.SphereGeometry(0.4, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), hr, 0, 0.04, -0.03, head, 0.035, 0.4); cap.rotation.x = -0.32;
    for (let k = -2; k <= 2; k++) { const b = M(new THREE.ConeGeometry(0.08, 0.22, 5), hr, k * 0.09, 0.2, 0.31, head, 0); b.rotation.x = Math.PI + 0.5; b.rotation.z = k * 0.12; }
    if (long) M(new THREE.CapsuleGeometry(0.3, 0.4, 4, 12), hr, 0, -0.3, -0.16, head, 0.035).scale.z = 0.6;
    if (bun) M(new THREE.SphereGeometry(0.17, 12, 10), hr, 0, 0.28, -0.3, head, 0.03, 0.17);
    const eyeM = new THREE.MeshBasicMaterial({ color: 0x1b1420 }), hiM = new THREE.MeshBasicMaterial({ color: 0xffffff }), blM = new THREE.MeshBasicMaterial({ color: 0xff8a9a, transparent: true, opacity: 0.55 });
    parts.eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), eyeM); e.scale.set(0.055, 0.09, 0.03); e.position.set(s * 0.13, -0.02, 0.345); head.add(e); const h = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 4), hiM); h.position.set(s * 0.13 + 0.018, 0.02, 0.37); head.add(h); return e; });
    [-1, 1].forEach(s => { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), blM); b.scale.set(0.065, 0.03, 0.02); b.position.set(s * 0.21, -0.11, 0.31); head.add(b); });
    if (accent) { const sc = M(new THREE.TorusGeometry(0.25, 0.08, 8, 18), toon(accent), 0, 1.3, 0, g, 0.03, 0.33); sc.rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.16, 0.42, 0.08), toon(accent), 0.12, 1.1, -0.3, g, 0.02).rotation.z = 0.15; }
    if (hat === 'straw') { M(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 22), toon('#e9cf86'), 0, 0.3, 0, head, 0.03, 0.62); M(new THREE.CylinderGeometry(0.28, 0.34, 0.24, 18), toon('#e9cf86'), 0, 0.42, 0, head, 0.03, 0.34); M(new THREE.CylinderGeometry(0.345, 0.345, 0.06, 18), toon('#ec3013'), 0, 0.34, 0, head, 0); }
    if (hat === 'cap') { M(new THREE.SphereGeometry(0.41, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), toon('#ec3013'), 0, 0.07, 0, head, 0.03, 0.41); M(new THREE.BoxGeometry(0.4, 0.04, 0.3), toon('#ec3013'), 0, 0.17, 0.4, head, 0.02); }
    if (hat === 'band') { const t = M(new THREE.TorusGeometry(0.385, 0.04, 6, 24), toon('#f7f1e6'), 0, 0.12, 0, head, 0); t.rotation.x = Math.PI / 2 - 0.3; }
    if (hat === 'flower') { M(new THREE.IcosahedronGeometry(0.1, 0), toon('#ffffff'), 0.28, 0.22, 0.12, head, 0.02); M(new THREE.SphereGeometry(0.045, 6, 4), toon('#ffd04a'), 0.3, 0.24, 0.2, head, 0); }
    if (hat === 'kerchief') M(new THREE.SphereGeometry(0.42, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), toon('#ec3013'), 0, 0.06, -0.04, head, 0.03, 0.42).rotation.x = -0.4;
    g.scale.setScalar(scale);
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat) o.castShadow = true; });
    g.userData = { parts, phase: 0, blink: rr(1, 4) };
    scene.add(g); return g;
  }
  function animChar(c, dt, speed, airborne = false) {
    const u = c.userData, p = u.parts, moving = speed > 0.2;
    u.phase += dt * (moving ? 3 + speed * 1.4 : 1.5); u.amt = damp(u.amt || 0, moving ? Math.min(1, speed / 4) : 0, 10, dt);
    const sw = Math.sin(u.phase) * 0.9 * u.amt;
    p.legs[0].rotation.x = airborne ? -0.6 : sw; p.legs[1].rotation.x = airborne ? 0.4 : -sw;
    p.arms[0].rotation.x = airborne ? -2.4 : -sw * 0.8; p.arms[1].rotation.x = airborne ? -2.4 : sw * 0.8;
    p.arms[0].rotation.z = -0.12; p.arms[1].rotation.z = 0.12;
    p.body.position.y = 0.96 + Math.abs(Math.sin(u.phase)) * 0.06 * u.amt + Math.sin(u.phase * 0.7) * 0.01;
    p.head.position.y = 1.62 + (p.body.position.y - 0.96);
    u.blink -= dt; const closed = u.blink < 0.12 && u.blink > 0; if (u.blink < 0) u.blink = rr(2, 5);
    p.eyes.forEach(e => e.scale.y = closed ? 0.012 : 0.09);
  }

  const player = makeChar({ outfit: '#ec3013', hair: '#2a2230', accent: '#f7f1e6', skin: '#ffdcc4' });
  const P = { x: 0, z: 7.5, y: 0, vy: 0, vx: 0, vz: 0, face: 0, ground: true, stepT: 0 };
  const npcDefs = [
    { name: 'Mira', home: [5.5, -6.5], rad: 3.5, speed: 1.2, look: { outfit: '#f7f1e6', hair: '#b5562c', bun: true, hat: 'kerchief' } },
    { name: 'Tobin', home: [POND.x + ux * (dockStart + 0.6), POND.z + uz * (dockStart + 0.6)], rad: 0, speed: 0, look: { outfit: '#4f6b8a', hair: '#d8d8d8', hat: 'straw' }, still: true },
    { name: 'Pell', home: [0, 0], rad: 9, speed: 3, minR: 4.2, look: { outfit: '#f2b33a', hair: '#5a3a24', hat: 'cap', scale: 0.82 } },
    { name: 'Haru', home: [MILL.x - 4, MILL.z + 5], rad: 3, speed: 1, look: { outfit: '#6a7a4a', hair: '#1e1e28', hat: 'band' } },
    { name: 'Ines', home: [MEADOW.x, MEADOW.z], rad: 6, speed: 0.9, look: { outfit: '#c87aa8', hair: '#f0d27a', long: true, hat: 'flower' } },
  ];
  const npcs = npcDefs.map(d => {
    const c = makeChar(d.look); const [hx, hz] = d.home;
    const n = { ...d, c, x: hx, z: hz, tx: hx, tz: hz, wait: rr(0, 3), face: rr(0, 6), speedNow: 0 };
    if (d.still) { n.face = Math.atan2(-ux, -uz); const rod = M(new THREE.CylinderGeometry(0.02, 0.03, 3.2, 5), WOOD, 0.45, 1.3, 1.1, c, 0); rod.rotation.x = 1.0; }
    return n;
  });
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xec3013 })); marker.scale.y = 1.6; scene.add(marker);

  // ---------- state ----------
  const S = { time: ((opts.startHour % 24) + 24) % 24, weather: 'clear', wRain: 0, wFog: 0, mode: 'attract', yaw: 0.4, pitch: 0.35, dist: 8.5, dialog: null, near: null, muted: false, t: 0 };
  const audio = new Ambience();
  const pal = { top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), light: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color() };
  const keys = new Set();
  const input = { jx: 0, jy: 0, jump: false };
  const camPos = new THREE.Vector3(30, 18, 30), camLook = new THREE.Vector3();
  const grey = new THREE.Color(), fogWhite = new THREE.Color('#dfe3e6');

  // ---------- input ----------
  const isTyping = e => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  const onKeyDown = e => {
    if (isTyping(e) || S.mode !== 'play') return;
    keys.add(e.code);
    if (e.code === 'Space') { input.jump = true; e.preventDefault(); }
    if (e.code === 'KeyE' || e.code === 'Enter') api.talk();
    if (e.code === 'Escape' && S.dialog) S.dialog = null;
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => keys.delete(e.code);
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => keys.clear());

  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;';
  container.style.position = container.style.position || 'absolute'; container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => {
    if (S.mode !== 'play') return;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect(), lx = e.clientX - rect.left, ly = e.clientY - rect.top;
    const isJoy = e.pointerType === 'touch' && lx < rect.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy: isJoy });
    if (isJoy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
  });
  el.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (p.joy) {
      const rect = el.getBoundingClientRect(); let dx = e.clientX - rect.left - p.ox, dy = e.clientY - rect.top - p.oy;
      const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; }
      input.jx = dx / m; input.jy = -dy / m; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px';
    } else {
      const k = e.pointerType === 'touch' ? 0.008 : 0.005;
      S.yaw -= (e.clientX - p.x) * k; S.pitch = clamp(S.pitch + (e.clientY - p.y) * k * 0.8, -0.05, 1.25);
    }
    p.x = e.clientX; p.y = e.clientY;
  });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { if (S.mode !== 'play') return; S.dist = clamp(S.dist + e.deltaY * 0.01, 4, 18); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());

  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
  ro.observe(container);

  // ---------- collisions ----------
  function collide(o, pr) {
    for (const c of colliders) {
      if (c.r) {
        const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz), m = c.r + pr;
        if (d < m && d > 1e-5) { o.x = c.x + dx / d * m; o.z = c.z + dz / d * m; }
      } else {
        const dx = o.x - c.x, dz = o.z - c.z; if (Math.abs(dx) > 8 || Math.abs(dz) > 8) continue;
        const cs = Math.cos(c.ry), sn = Math.sin(c.ry);
        let lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
        const qx = clamp(lx, -c.hw, c.hw), qz = clamp(lz, -c.hd, c.hd), ex = lx - qx, ez = lz - qz, d = Math.hypot(ex, ez);
        if (d > 0 && d < pr) { lx = qx + ex / d * pr; lz = qz + ez / d * pr; }
        else if (d === 0) { const px = c.hw + pr - Math.abs(lx), pz = c.hd + pr - Math.abs(lz); if (px < pz) lx = Math.sign(lx || 1) * (c.hw + pr); else lz = Math.sign(lz || 1) * (c.hd + pr); }
        else continue;
        o.x = c.x + lx * cs + lz * sn; o.z = c.z - lx * sn + lz * cs;
      }
    }
    const dp = Math.hypot(o.x - POND.x, o.z - POND.z), pm = POND.r + 2.6;
    if (dp < pm) { o.x = POND.x + (o.x - POND.x) / dp * pm; o.z = POND.z + (o.z - POND.z) / dp * pm; }
    const r = Math.hypot(o.x, o.z); if (r > 118) { o.x *= 118 / r; o.z *= 118 / r; }
  }

  // ---------- minimap ----------
  let mapCanvas = null, mapCtx = null; const mapStatic = document.createElement('canvas'); mapStatic.width = mapStatic.height = 512;
  const css = (v, f) => (getComputedStyle(document.documentElement).getPropertyValue(v) || '').trim() || f;
  function drawStaticMap() {
    const g = mapStatic.getContext('2d'), k = 2, o = 128;
    const bg = css('--color-bg', '#f3f2f2'), n2 = css('--color-neutral-200', '#eae7e7'), n3 = css('--color-neutral-300', '#d7d3d3'), n4 = css('--color-neutral-400', '#bab6b6'), n5 = css('--color-neutral-500', '#9b9797'), ink = css('--color-text', '#201e1d'), acc = css('--color-accent', '#ec3013');
    g.fillStyle = bg; g.fillRect(0, 0, 512, 512);
    for (let px = 0; px < 512; px += 4) for (let py = 0; py < 512; py += 4) { const h = heightAt(px / k - o, py / k - o); const band = Math.floor((h + 4) / 4); if (band % 2) { g.fillStyle = n2; g.fillRect(px, py, 4, 4); } if (h > 18) { g.fillStyle = n3; g.fillRect(px, py, 4, 4); } }
    g.fillStyle = n4; g.beginPath(); g.arc((POND.x + o) * k, (POND.z + o) * k, (POND.r + 2.7) * k, 0, 7); g.fill();
    g.strokeStyle = n5; g.lineWidth = 3.5; g.lineCap = 'square';
    for (const p of PATHS) { g.beginPath(); for (let t = 0; t <= p.len; t += 2) { const dx = Math.cos(p.a), dz = Math.sin(p.a), wob = Math.sin(t * 0.09 + p.a * 3) * 2.2 * smooth(12, 30, t); const x = dx * t - dz * wob, z = dz * t + dx * wob; t ? g.lineTo((x + o) * k, (z + o) * k) : g.moveTo((x + o) * k, (z + o) * k); } g.stroke(); }
    g.fillStyle = n3; g.beginPath(); g.arc(o * k, o * k, 10 * k, 0, 7); g.fill(); g.fillStyle = n4; g.beginPath(); g.arc(o * k, o * k, 3.2 * k, 0, 7); g.fill();
    g.fillStyle = n4; for (const t of mapItems.trees) { g.beginPath(); g.arc((t.x + o) * k, (t.z + o) * k, 1.4 * t.s * k, 0, 7); g.fill(); }
    g.fillStyle = ink; for (const hs of mapItems.houses) { g.save(); g.translate((hs.x + o) * k, (hs.z + o) * k); g.rotate(-hs.ry); g.fillRect(-hs.w * k / 2, -hs.d * k / 2, hs.w * k, hs.d * k); g.restore(); }
    g.fillStyle = acc; g.fillRect((MILL.x + o) * k - 5, (MILL.z + o) * k - 5, 10, 10);
  }
  drawStaticMap();
  function drawMap() {
    if (!mapCtx) return; const cw = mapCanvas.width, ch = mapCanvas.height, view = 90, k = 2, o = 128;
    mapCtx.clearRect(0, 0, cw, ch);
    mapCtx.drawImage(mapStatic, (P.x + o) * k - view, (P.z + o) * k - view, view * 2, view * 2, 0, 0, cw, ch);
    const sc = cw / (view * 2) * k, toM = (x, z) => [cw / 2 + (x - P.x) * sc, ch / 2 + (z - P.z) * sc];
    const ink = css('--color-text', '#201e1d'), bg = css('--color-bg', '#f3f2f2'), acc = css('--color-accent', '#ec3013');
    for (const n of npcs) { const [x, y] = toM(n.x, n.z); mapCtx.fillStyle = ink; mapCtx.strokeStyle = bg; mapCtx.lineWidth = 2 * devicePixelRatio; mapCtx.beginPath(); mapCtx.arc(x, y, 4 * devicePixelRatio, 0, 7); mapCtx.fill(); mapCtx.stroke(); }
    mapCtx.save(); mapCtx.translate(cw / 2, ch / 2); mapCtx.rotate(-P.face); const s = 7 * devicePixelRatio;
    mapCtx.fillStyle = acc; mapCtx.strokeStyle = bg; mapCtx.lineWidth = 2 * devicePixelRatio; mapCtx.beginPath(); mapCtx.moveTo(0, s * 1.3); mapCtx.lineTo(s * 0.9, -s); mapCtx.lineTo(-s * 0.9, -s); mapCtx.closePath(); mapCtx.fill(); mapCtx.stroke(); mapCtx.restore();
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, lastHud = '', hudT = 0;
  const sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3(), lightDir = new THREE.Vector3(), v3 = new THREE.Vector3();
  function ctxFlags() { const h = S.time; return { night: h < 5.5 || h > 20, rain: S.weather === 'rain', fog: S.weather === 'fog' }; }
  function nearestNpc() { let best = null, bd = 3.4; for (const n of npcs) { const d = Math.hypot(n.x - P.x, n.z - P.z); if (d < bd) { bd = d; best = n; } } return best; }

  function update(dt) {
    S.t += dt;
    S.time = (S.time + dt * opts.timeScale / 60) % 24;
    S.wRain = damp(S.wRain, S.weather === 'rain' ? 1 : 0, 0.8, dt); S.wFog = damp(S.wFog, S.weather === 'fog' ? 1 : 0, 0.8, dt);
    const h = S.time; paletteAt(h, pal);
    // sun & moon
    const sa = (h - 6) / 13 * Math.PI; sunDir.set(Math.cos(sa), Math.sin(sa) * 0.9, 0.38).normalize();
    const mh = ((h - 19 + 24) % 24) / 11 * Math.PI; moonDir.set(-Math.cos(mh), Math.sin(mh) * 0.85, -0.3).normalize();
    const sunUp = sunDir.y > -0.02; lightDir.copy(sunUp ? sunDir : moonDir); lightDir.y = Math.max(lightDir.y, 0.18); lightDir.normalize();
    const rainK = S.wRain, fogK = S.wFog;
    for (const k of ['top', 'hor', 'fog']) { const c = pal[k]; const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; grey.setRGB(l, l, l * 1.06); c.lerp(grey, rainK * 0.7); }
    pal.hor.lerp(pal.fog, fogK * 0.8); pal.top.lerp(pal.fog, fogK * 0.6); fogWhite.set('#dfe3e6').multiplyScalar(0.25 + 0.75 * (1 - pal.glow)); pal.fog.lerp(fogWhite, fogK * 0.35);
    skyU.top.value.copy(pal.top); skyU.hor.value.copy(pal.hor); skyU.bottom.value.copy(pal.fog); skyU.sunDir.value.copy(sunDir); skyU.moonDir.value.copy(moonDir);
    skyU.sunCol.value.copy(pal.light); skyU.sunVis.value = smooth(-0.08, 0.05, sunDir.y) * (1 - 0.85 * Math.max(rainK, fogK));
    skyU.moonVis.value = smooth(-0.05, 0.1, moonDir.y) * pal.glow * (1 - 0.85 * Math.max(rainK, fogK));
    scene.fog.color.copy(pal.fog); scene.fog.density = 0.0045 + 0.024 * fogK + 0.008 * rainK;
    sun.color.copy(pal.light); sun.intensity = pal.li * (1 - 0.65 * rainK - 0.45 * fogK);
    hemi.color.copy(pal.hs); hemi.groundColor.copy(pal.hg); hemi.intensity = pal.hi * (1 + 0.15 * rainK);
    const glow = Math.max(pal.glow, rainK * 0.45, fogK * 0.3);
    windows.emissiveIntensity = glow * 1.6; lampGlass.emissiveIntensity = glow * 2.2;
    lamps.forEach(s => s.material.opacity = glow * 0.85); lampLights.forEach(L => L.intensity = glow * 14);
    starMat.opacity = smooth(0.5, 0.95, pal.glow) * (1 - Math.max(rainK, fogK));
    ffMat.opacity = smooth(0.6, 1, pal.glow) * (1 - rainK) * (0.7 + 0.3 * Math.sin(S.t * 3));
    rainMat.opacity = rainK * 0.55;
    waterMat.color.set('#5fb6c8').lerp(pal.fog, 0.35).lerp(pal.top, 0.15);
    cloudMat.color.setRGB(1, 1, 1).lerp(pal.hor, 0.35).lerp(grey, rainK * 0.6); cloudMat.emissive.copy(pal.hs).multiplyScalar(0.5);

    // player
    if (S.mode === 'play') {
      let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx;
      let iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy;
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(S.yaw), fz = -Math.cos(S.yaw), rx = Math.cos(S.yaw), rz = -Math.sin(S.yaw);
      const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(input.jx, input.jy) > 0.92;
      const sp = (run ? 9 : 5.2) * Math.min(1, Math.hypot(ix, iy));
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      P.vx = damp(P.vx, mx * sp, 12, dt); P.vz = damp(P.vz, mz * sp, 12, dt);
      P.x += P.vx * dt; P.z += P.vz * dt; collide(P, 0.42);
      const hs = Math.hypot(P.vx, P.vz);
      if (hs > 0.3) { let df = Math.atan2(P.vx, P.vz) - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 12); }
      const gy = heightAt(P.x, P.z);
      if (input.jump && P.ground) { P.vy = 8.6; P.ground = false; audio.tone(420, 0.12, 0.04, 'triangle', 1.8); }
      input.jump = false;
      P.vy -= 24 * dt; P.y += P.vy * dt;
      if (P.y <= gy) { if (!P.ground && P.vy < -6) audio.burst(0.1, 500, 0.18); P.y = gy; P.vy = 0; P.ground = true; }
      else if (P.y - gy > 0.15) P.ground = false;
      if (P.ground && hs > 1) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.step(); } }
      player.position.set(P.x, P.y, P.z); player.rotation.y = P.face; animChar(player, dt, hs, !P.ground);
    } else { player.position.set(P.x, heightAt(P.x, P.z), P.z); player.rotation.y = P.face; animChar(player, dt, 0); }

    // npcs
    const nr = nearestNpc(); S.near = S.dialog ? null : nr;
    for (const n of npcs) {
      const dpl = Math.hypot(P.x - n.x, P.z - n.z), engaged = (S.dialog && S.dialog.npc === n) || dpl < 3.4;
      let spd = 0;
      if (engaged && S.mode === 'play') { const tf = Math.atan2(P.x - n.x, P.z - n.z); let df = tf - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 6); }
      else if (!n.still) {
        const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
        if (d < 0.3) { n.wait -= dt; if (n.wait < 0) { const a = rr(0, 6.28), r = (n.minR || 0) + rnd() * (n.rad - (n.minR || 0)); n.tx = n.home[0] + Math.cos(a) * r; n.tz = n.home[1] + Math.sin(a) * r; n.wait = rr(1.5, 5); } }
        else { spd = n.speed; n.x += dx / d * spd * dt; n.z += dz / d * spd * dt; const tf = Math.atan2(dx, dz); let df = tf - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 5); const bx = n.x, bz = n.z; collide(n, 0.4); if (Math.hypot(bx - n.x, bz - n.z) > 0.001) { n.tx = n.x; n.tz = n.z; } }
      }
      n.speedNow = damp(n.speedNow, spd, 8, dt);
      n.c.position.set(n.x, n.still ? -0.03 : heightAt(n.x, n.z), n.z); n.c.rotation.y = n.face; animChar(n.c, dt, n.speedNow);
    }
    const pc = P; for (const n of npcs) { const dx = pc.x - n.x, dz = pc.z - n.z, d = Math.hypot(dx, dz), m = 0.85; if (d < m && d > 0.001) { pc.x = n.x + dx / d * m; pc.z = n.z + dz / d * m; } }
    const mk = S.mode === 'play' ? (S.dialog ? S.dialog.npc : S.near) : null;
    marker.visible = !!mk; if (mk) { marker.position.set(mk.x, mk.c.position.y + 2.35 * mk.c.scale.y + Math.sin(S.t * 4) * 0.08, mk.z); marker.rotation.y += dt * 2.5; }
    if (S.dialog) {
      const d = S.dialog; d.chars = Math.min(d.lines[d.i].length, d.chars + dt * 45);
      if (Math.hypot(P.x - d.npc.x, P.z - d.npc.z) > 6) S.dialog = null;
    }

    // world animation
    blades.rotation.z += dt * (0.6 + 0.6 * rainK);
    clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 280) c.position.x = -280; });
    const dpos = dropGeo.attributes.position;
    dropSeed.forEach(([a, ph], i) => { const t = (S.t * 0.9 + ph) % 1; const r = 0.9 + t * 1.5; dpos.setXYZ(i, Math.cos(a) * r, 2.3 + t * 0.9 - t * t * 2.6, Math.sin(a) * r); }); dpos.needsUpdate = true;
    const fpos = ffGeo.attributes.position;
    ffBase.forEach(([x, y, z, ph], i) => fpos.setXYZ(i, x + Math.sin(S.t * 0.5 + ph) * 1.5, y + Math.sin(S.t * 0.9 + ph * 2) * 0.5, z + Math.cos(S.t * 0.4 + ph) * 1.5)); fpos.needsUpdate = true;
    for (let i = 0; i < ptN; i++) { let y = ptArr[i * 3 + 1] - dt * 0.6; ptArr[i * 3] += Math.sin(S.t + i) * dt * 0.4 + dt * 0.3; ptArr[i * 3 + 2] += Math.cos(S.t * 0.7 + i) * dt * 0.3; if (y < 0) { const a = rr(0, 6.28), r = rr(10, 16); y = rr(3, 6); ptArr[i * 3] = Math.cos(a) * r; ptArr[i * 3 + 2] = Math.sin(a) * r; } ptArr[i * 3 + 1] = y; }
    ptGeo.attributes.position.needsUpdate = true;
    if (rainK > 0.01) {
      rain.position.set(camera.position.x, camera.position.y - 20, camera.position.z);
      for (let i = 0; i < rainN; i++) { const o = i * 6; let y = rainArr[o + 1] - dt * 32; if (y < 0) y += 40; rainArr[o + 1] = y; rainArr[o + 4] = y - 0.9; rainArr[o + 3] = rainArr[o] - 0.15; }
      rainGeo.attributes.position.needsUpdate = true;
    }
    smoke.forEach(p => { p.t = (p.t + dt * 0.12) % 1; p.ch.getWorldPosition(v3); p.s.position.set(v3.x + Math.sin(p.t * 6 + v3.z) * 0.6 * p.t, v3.y + 0.9 + p.t * 5, v3.z + p.t * 1.5); p.s.scale.setScalar(0.8 + p.t * 2.6); p.s.material.opacity = Math.sin(p.t * Math.PI) * 0.4 * (1 - rainK * 0.6); p.s.material.color.copy(pal.hor).lerp(fogWhite.set('#ffffff'), 0.6); });

    // camera
    if (S.mode === 'play') {
      const tx = P.x, ty = P.y + 1.5, tz = P.z;
      v3.set(tx + Math.sin(S.yaw) * Math.cos(S.pitch) * S.dist, ty + Math.sin(S.pitch) * S.dist, tz + Math.cos(S.yaw) * Math.cos(S.pitch) * S.dist);
      const gh = heightAt(v3.x, v3.z) + 0.6; if (v3.y < gh) v3.y = gh;
      camPos.x = damp(camPos.x, v3.x, 10, dt); camPos.y = damp(camPos.y, v3.y, 10, dt); camPos.z = damp(camPos.z, v3.z, 10, dt);
      camLook.x = damp(camLook.x, tx, 14, dt); camLook.y = damp(camLook.y, ty, 14, dt); camLook.z = damp(camLook.z, tz, 14, dt);
    } else {
      const a = S.t * 0.05 + 0.6; camPos.set(Math.cos(a) * 36, 16 + Math.sin(S.t * 0.1) * 2, Math.sin(a) * 36); camLook.set(0, 3, 0);
    }
    camera.position.copy(camPos); camera.lookAt(camLook);
    sky.position.copy(camera.position); stars.position.copy(camera.position);
    const sc = S.mode === 'play' ? player.position : camLook;
    sun.target.position.copy(sc); sun.position.copy(sc).addScaledVector(lightDir, 110);

    audio.update(dt, { day: smooth(-0.05, 0.2, sunDir.y), night: pal.glow, rain: rainK, fog: fogK, fountainDist: Math.hypot(P.x, P.z) });
    drawMap();

    // hud
    hudT -= dt;
    if (hudT < 0) {
      hudT = 0.05;
      const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
      const period = h < 5 ? 'Night' : h < 7 ? 'Dawn' : h < 11 ? 'Morning' : h < 14 ? 'Midday' : h < 17.5 ? 'Afternoon' : h < 19.3 ? 'Evening' : h < 20.6 ? 'Dusk' : 'Night';
      const d = S.dialog;
      const hud = {
        clock: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), period,
        weather: { clear: 'Clear', fog: 'Fog', rain: 'Rain' }[S.weather], muted: S.muted,
        prompt: S.near && S.mode === 'play' ? S.near.name : null,
        dialog: d ? { name: d.npc.name, role: DIALOG[d.npc.name].role, text: d.lines[d.i].slice(0, Math.floor(d.chars)), step: d.i + 1, total: d.lines.length, done: d.chars >= d.lines[d.i].length } : null,
      };
      const key = JSON.stringify(hud); if (key !== lastHud) { lastHud = key; onState(hud); }
    }
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), 0.05); update(dt); renderer.render(scene, camera); }
  frame();

  const api = {
    start() { S.mode = 'play'; audio.init(); audio.setMuted(S.muted); camPos.set(P.x + Math.sin(S.yaw) * 14, 12, P.z + Math.cos(S.yaw) * 14); el.focus && el.focus(); },
    talk() {
      if (S.mode !== 'play') return;
      const d = S.dialog;
      if (d) { if (d.chars < d.lines[d.i].length) d.chars = d.lines[d.i].length; else if (d.i < d.lines.length - 1) { d.i++; d.chars = 0; audio.blip(); } else S.dialog = null; return; }
      const n = nearestNpc(); if (n) { S.dialog = { npc: n, lines: DIALOG[n.name].lines(ctxFlags()), i: 0, chars: 0 }; audio.blip(); }
    },
    jump() { input.jump = true; },
    cycleWeather() { S.weather = { clear: 'fog', fog: 'rain', rain: 'clear' }[S.weather]; },
    skipTime(hours = 3) { S.time = (S.time + hours) % 24; },
    toggleSound() { S.muted = !S.muted; audio.init(); audio.setMuted(S.muted); },
    setMinimap(c) { mapCanvas = c; if (!c) { mapCtx = null; return; } const r = c.getBoundingClientRect(); c.width = Math.round((r.width || 168) * devicePixelRatio); c.height = Math.round((r.height || 168) * devicePixelRatio); mapCtx = c.getContext('2d'); drawStaticMap(); },
    setOptions(o) {
      if (o.timeScale != null) opts.timeScale = o.timeScale;
      if (o.outlines != null) outlineMat.visible = !!o.outlines;
      if (o.startHour != null && o.startHour !== opts.startHour) { opts.startHour = o.startHour; S.time = o.startHour % 24; }
      if (o.quality && o.quality !== opts.quality) { opts.quality = o.quality; renderer.setPixelRatio(Math.min(devicePixelRatio, o.quality === 'low' ? 1 : 2)); renderer.shadowMap.enabled = o.quality !== 'low'; scene.traverse(m => { if (m.material) m.material.needsUpdate = true; }); }
    },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
  if (minimap) api.setMinimap(minimap);
  return api;
}

export { rnd, rr, pick, clamp, smooth, lerp, damp, vnoise, fbm, paletteAt, makeGradient, glowTexture, dotTexture, Ambience };
