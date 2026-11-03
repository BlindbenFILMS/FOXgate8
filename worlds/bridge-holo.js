// 8 GATES · BRIDGE STAR MAP (s599): the galaxy as a three.js hologram for the Bridge menu.
// Real toon planets (same texture recipe as space-map planetTex), halos, star field, nebulae, danger rings
// (pirate ports, nests, the Machine Yard), open animation, tap = glide + zoom, pinch / wheel zoom, double-tap reset,
// marching course line. createHolo(el, { onPick, you }) → { tick(dt), set({ sel, course }), reset(), dispose() }.
import * as THREE from '../vendor/three/three.module.js';
import { WORLDS, FRONTIER, PIRATES, NESTS, MACHINE_YARD, NEBULAE, CELL } from './space-galaxy.js?v=s519';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
const hash = (x, y, z) => { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
function vnoise(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = ease(x - xi), v = ease(y - yi), w = ease(z - zi), c = (a, b, d) => hash(xi + a, yi + b, zi + d);
  return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v), lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w); }
const fbm = (x, y, z, o = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, z * f); f *= 2.03; a *= 0.5; } return s / (1 - Math.pow(0.5, o)); };
const col = h => new THREE.Color(h);

const TEX = new Map();
function planetTex(w) {
  if (TEX.has(w.key)) return TEX.get(w.key);
  const TW = 160, TH = 80, c = document.createElement('canvas'); c.width = TW; c.height = TH;
  const x = c.getContext('2d'), im = x.createImageData(TW, TH), base = col(w.tint), dk = base.clone().multiplyScalar(0.5), lt = base.clone().lerp(col('#ffffff'), 0.45), tmp = new THREE.Color();
  const sea = col('#2b5fa8'), land = col('#4f9a52'), snow = col('#f4f7fc'), rock = col('#7d8494'), seed = w.key.length * 13.7 + w.x * 0.01;
  for (let j = 0; j < TH; j++) { const lat = (j / TH - 0.5) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let i = 0; i < TW; i++) { const lon = i / TW * Math.PI * 2, px = cl * Math.cos(lon) * 2.2, py = sl * 2.2, pz = cl * Math.sin(lon) * 2.2;
      const n = fbm(px + seed, py, pz, 4), n2 = fbm(px * 2.6, py * 2.6 + seed, pz * 2.6, 3), pole = Math.abs(sl);
      switch (w.look) {
        case 'snow': { const ridge = 1 - Math.abs(n * 2 - 1); tmp.copy(snow).lerp(col('#cfdcef'), n2 * 0.6); if (ridge > 0.8) tmp.lerp(rock, (ridge - 0.8) * 4); break; }
        case 'ocean': case 'earth': case 'ice': { const L = n > (w.look === 'earth' ? 0.52 : 0.6); tmp.copy(L ? (w.look === 'ice' ? col('#dfe9f5') : land) : (w.look === 'ice' ? col('#7fb4e0') : sea)); if (!L) tmp.lerp(col(w.look === 'ice' ? '#a9d0f0' : '#1c3f7a'), n2 * 0.5); else tmp.lerp(dk, n2 * 0.35); if (pole > 0.82) tmp.copy(snow); if (n2 > 0.66) tmp.lerp(snow, 0.75); break; }
        case 'jungle': { tmp.copy(base).lerp(col('#22663a'), n * 0.9); if (Math.abs(n2 - 0.5) < 0.03) tmp.copy(col('#3a8fd0')); break; }
        case 'fresh': { tmp.copy(dk).lerp(lt, n); if (n2 > 0.62) tmp.lerp(snow, (n2 - 0.62) * 2.2); break; }
        default: { const band = 0.5 + 0.5 * Math.sin(lat * (w.look === 'canyon' ? 9 : 14) + n * 7); tmp.copy(dk).lerp(lt, band * 0.7 + n2 * 0.3); if (w.look === 'stone' && n > 0.62) tmp.lerp(col('#4d525c'), 0.6); if (w.look === 'salt' && n2 > 0.6) tmp.lerp(snow, 0.55); }
      }
      const k = (j * TW + i) * 4; im.data[k] = tmp.r * 255; im.data[k + 1] = tmp.g * 255; im.data[k + 2] = tmp.b * 255; im.data[k + 3] = 255; } }
  x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; TEX.set(w.key, t); return t;
}
let GRAD = null, DOT = null, PUFF = null;
function shared() {
  if (!GRAD) { const d = new Uint8Array(16); [70, 150, 215, 255].forEach((v, i) => d.set([v, v, v, 255], i * 4)); GRAD = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true; }
  if (!DOT) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); DOT = new THREE.CanvasTexture(c); }
  if (!PUFF) { const S = 96, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), im = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const r = Math.hypot(i / S - 0.5, j / S - 0.5) * 2, n = fbm(i / 18 + 7, j / 18, 3.1, 4), a = clamp((1 - r) * 1.25, 0, 1) ** 1.6 * clamp(n * 1.7 - 0.45, 0, 1), k = (j * S + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = 255; im.data[k + 3] = a * 255; }
    x.putImageData(im, 0, 0); PUFF = new THREE.CanvasTexture(c); }
}

// THE SPACE MAP SKY (space-map.js s379d / s379g, same recipe): twinkling dust, a milky-way band, bright bloom stars with a lens streak,
// soft milky-way glow. A dome that follows the camera. makeSky(R, pxRatio, low) → Group (userData.tick(t)).
let GLINT = null;
export function makeSky(R = 2600, px = 1, low = false, boost = 1) {
  shared(); const G = new THREE.Group(); G.frustumCulled = false; const v = new THREE.Vector3(), cc = new THREE.Color();
  if (!GLINT) { const N = 128, h = N / 2, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
    const g = x.createRadialGradient(h, h, 0, h, h, h); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.06, 'rgba(255,255,255,1)'); g.addColorStop(0.14, 'rgba(255,255,255,0.7)'); g.addColorStop(0.3, 'rgba(255,255,255,0.28)'); g.addColorStop(0.6, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, N, N);
    x.globalCompositeOperation = 'lighter'; x.save(); x.translate(h, h); x.scale(1, 0.05); const s = x.createRadialGradient(0, 0, 0, 0, 0, h); s.addColorStop(0, 'rgba(255,255,255,0.95)'); s.addColorStop(0.4, 'rgba(255,255,255,0.35)'); s.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = s; x.beginPath(); x.arc(0, 0, h, 0, 6.283); x.fill(); x.restore();
    GLINT = new THREE.CanvasTexture(c); }
  const layer = (n, pick, sizeR, tex, tw) => {
    n = Math.round(n * boost); const P = new Float32Array(n * 3), C = new Float32Array(n * 3), S2 = new Float32Array(n), Ph = new Float32Array(n), kb = Math.min(1.7, 0.6 + 0.4 * boost);
    for (let i = 0; i < n; i++) { pick(v, cc); cc.multiplyScalar(kb); v.normalize().multiplyScalar(R); P.set([v.x, v.y, v.z], i * 3); C.set([cc.r, cc.g, cc.b], i * 3); S2[i] = sizeR() * (0.6 + 0.4 * boost); Ph[i] = Math.random() * 6.283; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(S2, 1)); g.setAttribute('aPh', new THREE.BufferAttribute(Ph, 1));
    const mat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, map: { value: tex }, uPx: { value: px } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      vertexShader: tw === 'BLOOM'
        ? 'attribute float aSize; attribute float aPh; uniform float uT; uniform float uPx; varying vec3 vC; varying float vK; void main(){ float per = 14.0 + fract(aPh * 7.13) * 16.0; float u = fract(uT / per + aPh * 0.159); float b = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.06, 0.16, u)); vK = 0.38 + 0.62 * b; vC = color; gl_PointSize = aSize * uPx * (0.22 + 0.78 * b); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
        : 'attribute float aSize; attribute float aPh; uniform float uT; uniform float uPx; varying vec3 vC; varying float vK; void main(){ float tw = ' + tw + '; vK = tw; vC = color; gl_PointSize = aSize * uPx * (0.75 + 0.35 * tw); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map; varying vec3 vC; varying float vK; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.a * vK, t.a * vK); }' });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; G.add(pts); return mat; };
  const starCol = (cc, k) => { const r = Math.random(); if (r < 0.12) cc.setHSL(0.07 + Math.random() * 0.05, 0.75, 0.75); else if (r < 0.2) cc.setHSL(0.13, 0.6, 0.82); else cc.setHSL(0.58 + Math.random() * 0.08, 0.35 + Math.random() * 0.3, 0.78 + Math.random() * 0.2); cc.multiplyScalar(k); };
  const band = new THREE.Vector3(0.35, 0.25, 0.9).normalize(), bu = new THREE.Vector3().crossVectors(band, new THREE.Vector3(0, 1, 0)).normalize(), bv = new THREE.Vector3().crossVectors(band, bu);
  const inBand = (v, cc) => { const a = Math.random() * 6.283, off = (Math.random() + Math.random() + Math.random() - 1.5) * 0.18; v.copy(bu).multiplyScalar(Math.cos(a)).addScaledVector(bv, Math.sin(a)).addScaledVector(band, off);
    const k = Math.random(); if (k < 0.3) cc.setHSL(0.72 + Math.random() * 0.08, 0.5, 0.55); else starCol(cc, 0.8); cc.multiplyScalar(0.9 + 0.6 * (1 - Math.abs(off) / 0.3)); };
  const mats = [
    layer(low ? 2600 : 5000, (v, cc) => { v.randomDirection(); starCol(cc, 0.9 + Math.random() * 0.6); }, () => 3.6 + Math.random() * 4.2, DOT, '0.6 + 0.4 * sin(uT * (1.2 + fract(aPh) * 2.0) + aPh)'),
    layer(low ? 2200 : 4200, inBand, () => 3.2 + Math.random() * 3.6, DOT, '0.75 + 0.25 * sin(uT * 1.6 + aPh)'),
    layer(low ? 70 : 120, (v, cc) => { v.randomDirection(); starCol(cc, 1.1); }, () => 26 + Math.random() * 24, GLINT, 'BLOOM')];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283; v.copy(bu).multiplyScalar(Math.cos(a)).addScaledVector(bv, Math.sin(a)); v.normalize().multiplyScalar(R * 0.98);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFF, color: i % 3 ? '#3b3a7a' : '#5a3a7a', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.copy(v); s.scale.setScalar(R * 0.42); G.add(s); }
  G.userData.tick = t => { for (const m of mats) m.uniforms.uT.value = t; };
  return G;
}

// one toon planet as a viewer object (Bridge SIGNALS detail): { group, tick(dt), dispose() }
export function makePlanet(key) {
  shared(); const w = [...WORLDS, ...FRONTIER].find(x => x.key === key) || WORLDS[0], g = new THREE.Group(), rr = 10;
  const ink = new THREE.MeshBasicMaterial({ color: 0x05060c, side: THREE.BackSide });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(rr, 48, 32), new THREE.MeshToonMaterial({ map: planetTex(w), gradientMap: GRAD, emissive: col(w.tint), emissiveIntensity: 0.08 })); g.add(globe);
  const out = new THREE.Mesh(globe.geometry, ink); out.scale.setScalar(1.035); g.add(out);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: col(w.tint), transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(rr * 3.6); g.add(halo);
  if (w.extra === 'icering') { const ring = new THREE.Mesh(new THREE.RingGeometry(rr * 1.45, rr * 2.1, 64).rotateX(-Math.PI / 2 + 0.35), new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })); g.add(ring); }
  return { group: g, tick: dt => { globe.rotation.y += dt * 0.15; }, dispose: () => { g.traverse(o => o.geometry && o.geometry.dispose()); } };
}
export function createHolo(el, { onPick = () => {}, you = { x: 0.3, z: 0.42 } } = {}) {
  shared();
  const U = CELL, H = 70, SPAN = 2.6 * U, D = window.devicePixelRatio || 1;
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); R.setPixelRatio(Math.min(D, matchMedia('(pointer: coarse)').matches ? 1.5 : 2)); R.outputColorSpace = THREE.SRGBColorSpace; R.setClearColor(0, 0);
  Object.assign(R.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', touchAction: 'none' }); el.prepend(R.domElement);
  const layer = document.createElement('div'); Object.assign(layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'hidden' }); el.appendChild(layer);
  const S = new THREE.Scene(); S.add(new THREE.HemisphereLight(0xbcd4ff, 0x1a1030, 1.2)); const sun = new THREE.DirectionalLight(0xfff2e0, 2.2); sun.position.set(-0.55, 1, 0.35); S.add(sun);
  const cam = new THREE.PerspectiveCamera(38, 1, 5, 30000);
  const ink = new THREE.MeshBasicMaterial({ color: 0x05060c, side: THREE.BackSide });
  // star field (the Space Map sky) + nebulae
  const SKY = makeSky(9000, R.getPixelRatio(), matchMedia('(pointer: coarse)').matches, 1.8); S.add(SKY);
  const neb = [];
  NEBULAE.forEach(nb => { for (let i = 0; i < 7; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.8, m = new THREE.SpriteMaterial({ map: PUFF, color: col(nb.col[0]).lerp(col(nb.col[1]), Math.random()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const s = new THREE.Sprite(m), sc = 260 + Math.random() * 380; s.scale.set(sc, sc, 1); s.position.set(nb.x + Math.cos(a) * nb.rx * r, -60 - Math.random() * 160, nb.z + Math.sin(a) * nb.rz * r); S.add(s); neb.push(m); } });
  // the grid (holo cyan), two range rings
  const grid = new THREE.Group(); S.add(grid);
  { const seg = [], st = U / 2; for (let v = -SPAN; v <= SPAN + 1; v += st) { seg.push(v, 0, -SPAN, v, 0, SPAN, -SPAN, 0, v, SPAN, 0, v); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3)); grid.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.13, depthWrite: false })));
    for (const rr of [U * 1.5, U * 2.5]) { const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rr, 0, Math.sin(a) * rr)); } grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.2, depthWrite: false }))); } }
  const gridMats = grid.children.map(c => c.material), gridOp = gridMats.map(m => m.opacity);
  // planets
  const items = [], hits = [];
  const label = (txt, color, big) => { const s = document.createElement('span'); s.textContent = txt; Object.assign(s.style, { position: 'absolute', left: '0', top: '0', font: (big ? '800 13px' : '700 11px') + ' Archivo, sans-serif', letterSpacing: '0.06em', color, whiteSpace: 'nowrap', opacity: '0', willChange: 'transform', transition: 'opacity .18s', textShadow: '0 1px 3px #000, 0 0 8px #000' }); layer.appendChild(s); return s; };
  for (const w of WORLDS) {
    const g = new THREE.Group(); g.position.set(w.x, 0, w.z); S.add(g); const rr = (w.r || 20) * 3.3, top = new THREE.Group(); g.add(top);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(rr, 32, 20), new THREE.MeshToonMaterial({ map: planetTex(w), gradientMap: GRAD, emissive: col(w.tint), emissiveIntensity: 0.1 })); top.add(globe);
    const out = new THREE.Mesh(globe.geometry, ink); out.scale.setScalar(1.06); top.add(out);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: col(w.tint), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(rr * 4.4); top.add(halo);
    const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]), new THREE.LineBasicMaterial({ color: 0xf3f2f2, transparent: true, opacity: 0.35 })); g.add(stem);
    const base = new THREE.Mesh(new THREE.RingGeometry(rr * 0.85, rr, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col(w.tint), transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide })); base.position.y = 1; g.add(base);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(rr * 2, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); top.add(hit); hit.userData.k = w.key; hits.push(hit);
    items.push({ k: w.key, g, top, globe, halo, stem, rr, x: w.x, z: w.z, d: Math.hypot(w.x, w.z), lab: label(w.name, '#f3f2f2', true), pri: w.player ? 1 : 2 });
  }
  { const g = new THREE.Group(), y = MACHINE_YARD; g.position.set(y.x, 0, y.z); S.add(g); const top = new THREE.Group(); g.add(top);
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(30), new THREE.MeshToonMaterial({ color: '#ff8a6a', gradientMap: GRAD, emissive: col('#ff5a3c'), emissiveIntensity: 0.25 })); top.add(m); const o = new THREE.Mesh(m.geometry, ink); o.scale.setScalar(1.1); top.add(o);
    const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]), new THREE.LineBasicMaterial({ color: 0xff8a6a, transparent: true, opacity: 0.4 })); g.add(stem);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(70, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); top.add(hit); hit.userData.k = 'myard'; hits.push(hit);
    items.push({ k: 'myard', g, top, globe: m, stem, rr: 30, x: y.x, z: y.z, d: Math.hypot(y.x, y.z), lab: label('MACHINE', '#ff8a6a', true), pri: 1, spin: 1 }); }
  // danger rings
  const zones = [];
  const zone = (x, z, r, c, name) => { const g = new THREE.Group(); g.position.set(x, 2, z); S.add(g);
    const ring = new THREE.Mesh(new THREE.RingGeometry(r - 7, r, 72).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); g.add(ring);
    const fill = new THREE.Mesh(new THREE.CircleGeometry(r - 7, 72).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide })); g.add(fill);
    const pin = new THREE.Mesh(new THREE.OctahedronGeometry(12), new THREE.MeshBasicMaterial({ color: col(c) })); pin.position.y = 14; g.add(pin);
    zones.push({ g, ring, fill, ph: Math.random() * 6, lab: label(name, c, false), x, z, y: 30 }); };
  PIRATES.forEach(p => zone(p.x, p.z, 150, '#ff4a2e', p.name));
  NESTS.forEach(n => zone(n.x, n.z, 165, n.tint, n.name));
  zone(MACHINE_YARD.x, MACHINE_YARD.z, 110, '#ff8a6a', '');
  // you + course
  const youP = new THREE.Vector3(you.x * U, H * 0.7, you.z * U);
  const youM = new THREE.Mesh(new THREE.ConeGeometry(13, 38, 4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff5a3c })); youM.position.copy(youP); S.add(youM);
  const youH = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: 0xff5a3c, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); youH.scale.setScalar(90); youH.position.copy(youP); S.add(youH);
  const crsLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([youP, youP.clone()]), new THREE.LineBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.45, depthWrite: false })); crsLine.visible = false; S.add(crsLine);
  const dots = Array.from({ length: 16 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: 0x7fd0ff, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(26); s.visible = false; S.add(s); return s; });
  const etaLab = label('', '#7fd0ff', true); Object.assign(etaLab.style, { background: 'rgba(32,30,29,0.9)', border: '2px solid #7fd0ff', padding: '3px 6px', textShadow: 'none' });
  const selRing = new THREE.Mesh(new THREE.RingGeometry(1, 1.12, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })); selRing.visible = false; S.add(selRing);
  // camera
  const O = { yaw: -0.35, pitch: 0.95, dist: 4000, tx: 0, tz: 0 }, T = { ...O }, st = { sel: null, course: 'off', eta: '' };
  let W0 = 0, H0 = 0, D0 = 3000, t = 0, idle = 0, half = 0;
  const fitHome = () => { const a = Math.atan(Math.tan(cam.fov * Math.PI / 360) * Math.min(1, cam.aspect)); D0 = (U * 2.25) / Math.sin(a); };
  const reset = () => { Object.assign(T, { tx: 0, tz: 0, dist: D0, pitch: 0.95 }); };
  // input
  const pts = new Map(); let drag = null, pinch = 0, lastTap = { t: 0, x: 0, y: 0 };
  const cv = R.domElement, rc = new THREE.Raycaster(), v2 = new THREE.Vector2();
  const local = e => { const r = cv.getBoundingClientRect(), k = cv.clientWidth / (r.width || 1); return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }; };
  const down = e => { try { cv.setPointerCapture(e.pointerId); } catch (er) {} pts.set(e.pointerId, local(e)); idle = 0; if (pts.size === 1) { const p = local(e); drag = { x: p.x, y: p.y, yaw: T.yaw, pitch: T.pitch, moved: 0 }; } else { drag = null; const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } };
  const move = e => { if (!pts.has(e.pointerId)) return; const p = local(e); pts.set(e.pointerId, p); idle = 0;
    if (pts.size >= 2) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) T.dist = clamp(T.dist * pinch / d, 260, D0 * 1.7); pinch = d; return; }
    if (!drag) return; const dx = p.x - drag.x, dy = p.y - drag.y; drag.moved = Math.max(drag.moved, Math.hypot(dx, dy)); T.yaw = drag.yaw + dx * 0.008; T.pitch = clamp(drag.pitch + dy * 0.006, 0.3, 1.45); };
  const up = e => { const was = drag, p = local(e); pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; drag = null; if (!was || was.moved > 6) return;
    const now = performance.now(); if (now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) { lastTap.t = 0; reset(); return; } lastTap = { t: now, x: p.x, y: p.y };
    v2.set(p.x / W0 * 2 - 1, -(p.y / H0) * 2 + 1); rc.setFromCamera(v2, cam); const h = rc.intersectObjects(hits, false)[0];
    if (h) { const it = items.find(i => i.k === h.object.userData.k); if (it) { T.tx = it.x; T.tz = it.z; T.dist = clamp(Math.min(T.dist, D0 * 0.5), 380, D0); } onPick(h.object.userData.k); } };
  const wheel = e => { e.preventDefault(); idle = 0; T.dist = clamp(T.dist * (e.deltaY > 0 ? 1.12 : 0.89), 260, D0 * 1.7); };
  cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false });
  const tv = new THREE.Vector3(), lookAt = new THREE.Vector3();
  const scr = v => { tv.copy(v).project(cam); return { x: (tv.x * 0.5 + 0.5) * W0, y: (-tv.y * 0.5 + 0.5) * H0, ok: tv.z < 1 && tv.z > -1 }; };
  function tick(dt) {
    const w = el.clientWidth || 1, h = el.clientHeight || 1; if (w !== W0 || h !== H0) { const first = !W0; W0 = w; H0 = h; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); fitHome(); if (first) { O.dist = D0 * 1.35; T.dist = D0; } }
    t += dt; idle += dt; if (idle > 4 && !drag) T.yaw += dt * 0.05;
    const k = 1 - Math.exp(-dt * 4.5); for (const key of ['yaw', 'pitch', 'dist', 'tx', 'tz']) O[key] = lerp(O[key], T[key], k);
    lookAt.set(O.tx, H * 0.5, O.tz); cam.position.set(O.tx + Math.sin(O.yaw) * Math.cos(O.pitch) * O.dist, H * 0.5 + Math.sin(O.pitch) * O.dist, O.tz + Math.cos(O.yaw) * Math.cos(O.pitch) * O.dist); cam.lookAt(lookAt);
    // open animation: grid draws in, worlds rise on their stems
    const gk = ease(clamp(t / 0.7, 0, 1)); grid.scale.setScalar(0.35 + 0.65 * gk); gridMats.forEach((m, i) => m.opacity = gridOp[i] * gk); neb.forEach(m => m.opacity = 0.09 * gk);
    for (const it of items) { const rk = ease(clamp((t - 0.25 - it.d / U * 0.12) / 0.6, 0, 1)), y = H * rk; it.top.position.y = y; it.top.scale.setScalar(Math.max(0.001, rk)); it.stem.scale.y = Math.max(0.001, y); it.rise = rk;
      if (it.spin) it.globe.rotation.y += dt * 0.8; else it.globe.rotation.y += dt * 0.12; if (it.halo) it.halo.material.opacity = (it.k === st.sel ? 0.85 : 0.45) * rk; }
    for (const z of zones) { const p = 0.5 + 0.5 * Math.sin(t * 2.2 + z.ph); z.ring.material.opacity = (0.3 + 0.4 * p) * gk; z.ring.scale.setScalar(1 + 0.04 * p); z.fill.material.opacity = 0.05 * gk; }
    youM.rotation.y = Math.sin(t * 0.6) * 0.15; youH.material.opacity = 0.4 + 0.25 * Math.sin(t * 4);
    // course
    const sel = items.find(i => i.k === st.sel), on = !!sel && st.course !== 'off'; selRing.visible = !!sel && sel.rise > 0.9; if (sel) { sel.top.getWorldPosition(selRing.position); selRing.scale.setScalar(sel.rr * (1.9 + 0.12 * Math.sin(t * 3))); selRing.quaternion.copy(cam.quaternion); } crsLine.visible = on; etaLab.style.opacity = on ? '1' : '0';
    if (on) { const to = new THREE.Vector3(sel.x, H, sel.z), a = crsLine.geometry.attributes.position; a.setXYZ(1, to.x, to.y, to.z); a.needsUpdate = true; youM.lookAt(to);
      dots.forEach((d, i) => { const f = ((i / dots.length) + t * (st.course === 'auto' ? 0.25 : 0.12)) % 1; d.visible = true; d.position.lerpVectors(youP, to, f); d.material.opacity = st.course === 'auto' ? 0.95 : 0.7 * Math.sin(f * Math.PI); });
      const mid = scr(new THREE.Vector3().lerpVectors(youP, to, 0.5)); etaLab.textContent = st.eta; etaLab.style.transform = 'translate(' + (mid.x + 10).toFixed(0) + 'px,' + (mid.y - 18).toFixed(0) + 'px)'; }
    else dots.forEach(d => d.visible = false);
    SKY.position.copy(cam.position); SKY.userData.tick(t);
    R.render(S, cam);
    // labels: selected first, then worlds, then danger zones; flip / skip on overlap
    const fpx = (H0 * 0.5) / Math.tan(cam.fov * Math.PI / 360), boxes = [], hitB = b => boxes.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
    const L = [...items.map(it => ({ it, p: new THREE.Vector3(it.x, it.top.position.y, it.z), r: it.rr, lab: it.lab, pri: it.k === st.sel ? 9 : it.pri, show: it.rise > 0.95 })), ...zones.filter(z => z.lab.textContent).map(z => ({ p: new THREE.Vector3(z.x, z.y, z.z), r: 14, lab: z.lab, pri: 0, show: gk > 0.95 }))].sort((a, b) => b.pri - a.pri);
    for (const q of L) { const s = scr(q.p), dd = cam.position.distanceTo(q.p), pr = q.r / dd * fpx; q.s = s; q.pr = pr; boxes.push({ x: s.x - pr, y: s.y - pr, w: pr * 2, h: pr * 2 }); }
    for (const q of L) { const el2 = q.lab, big = q.pri === 9; el2.style.fontSize = big ? '16px' : q.pri ? '13px' : '11px'; el2.style.color = big ? '#ffffff' : ''; if (!q.show || !q.s.ok) { el2.style.opacity = '0'; continue; }
      const tw = el2._w && el2._fs === el2.style.fontSize ? el2._w : (el2._fs = el2.style.fontSize, el2._w = el2.offsetWidth), th = big ? 18 : 14, gap = q.pr + 8, s = q.s;
      // s599 (Ben): world names sit UNDER their planet, centred, always (no jumping while it spins). Danger-zone names keep the old dodge.
      const under = { x: s.x - tw / 2, y: s.y + q.pr + 6, w: tw, h: th }, opts = [{ x: s.x + gap, y: s.y - th / 2 }, { x: s.x - gap - tw, y: s.y - th / 2 }, under].map(o => ({ ...o, w: tw, h: th }));
      const pick = q.pri ? under : (opts.find(b => !hitB(b) && b.x >= 2 && b.x + b.w <= W0 - 2 && b.y >= 2 && b.y + b.h <= H0 - 2) || null);
      if (!pick) { el2.style.opacity = '0'; continue; } boxes.push(pick); el2.style.opacity = '1'; el2.style.transform = 'translate(' + pick.x.toFixed(0) + 'px,' + pick.y.toFixed(0) + 'px)'; }
  }
  // keep the per-label color (world labels are set once; selected goes white)
  items.forEach(it => { it.lab._c = it.lab.style.color; }); zones.forEach(z => { z.lab._c = z.lab.style.color; });
  const _tick = tick; const tick2 = dt => { _tick(dt); items.forEach(it => { if (it.k !== st.sel) it.lab.style.color = it.lab._c; }); zones.forEach(z => { z.lab.style.color = z.lab._c; }); };
  return {
    tick: tick2, reset,
    set(o) { if (o.you) { youP.set(o.you.x * U, H * 0.7, o.you.z * U); youM.position.copy(youP); youH.position.copy(youP); crsLine.geometry.attributes.position.setXYZ(0, youP.x, youP.y, youP.z); } if (o.sel !== undefined && o.sel !== st.sel) { st.sel = o.sel; } if (o.course !== undefined) st.course = o.course; if (o.eta !== undefined) st.eta = o.eta; },
    dispose() { cv.removeEventListener('wheel', wheel); try { R.forceContextLoss(); } catch (e) {} R.dispose(); cv.remove(); layer.remove(); S.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  };
}
