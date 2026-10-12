// MERU 2.0 — step 10 art pass 3: TREES AND PARKS. Shared flora kit for the city, the four paths and the hills.
// Five tree types (BROAD oak-like, LIME round avenue tree, POPLAR columnar, BIRCH white bark, PINE layered tiers) built from
// lumpy layered canopies with baked vertex shading (dark underside, lighter sunlit top, leaf noise). Each type = ONE instanced
// draw; one shared wind shader (trunk stiff, canopy sways more with height + a small leaf flutter). Shrubs, grass tufts and
// flower clusters use the same shader. No textures, no extra passes (phone budget).
import * as THREE from '../vendor/three/three.module.js';

const uT = { value: 0 }, tickT = () => { uT.value = performance.now() / 1000; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hash = (x, y, z) => { const s = Math.sin(Math.round(x * 1000) * 12.9898 + Math.round(y * 1000) * 78.233 + Math.round(z * 1000) * 37.719) * 43758.5453; return s - Math.floor(s); };
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), TC = new THREE.Color(), TC2 = new THREE.Color();
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

function windMat(base, amp, freq, flutter, side = THREE.FrontSide, near = 0) {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side });
  m.onBeforeCompile = sh => { sh.uniforms.uT = uT;
    // near = see-through distance: leaves within it dissolve (screen-door) so the follow camera never sits inside a canopy
    if (near) sh.fragmentShader = sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      { float cd = length(vViewPosition), dd = fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(0.06711056, 0.00583715)))); if ((cd - ${(near * 0.35).toFixed(2)}) / ${(near * 0.65).toFixed(2)} < dd) discard; }`); sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    { float h = max(position.y - ${base.toFixed(3)}, 0.0); vec2 ip = vec2(0.0);
      #ifdef USE_INSTANCING
      ip = instanceMatrix[3].xz;
      #endif
      float ph = uT * ${freq.toFixed(3)} + ip.x * 0.21 + ip.y * 0.17;
      float w = (sin(ph) + 0.45 * sin(ph * 2.3 + 1.7)) * ${amp.toFixed(5)} * h * h;
      float f = ${flutter.toFixed(4)} * h * sin(uT * 6.0 + position.x * 4.0 + position.z * 3.0 + ip.x);
      transformed.x += w + f; transformed.z += w * 0.5 + f * 0.7; }`); };
  if (near) { const prev = m.onBeforeCompile; m.onBeforeCompile = sh => { prev(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { vec3 nV = normalize(vNormal); float rim = pow(1.0 - abs(dot(nV, normalize(vViewPosition))), 3.0); float leaf = step(diffuseColor.r * 1.08, diffuseColor.g); totalEmissiveRadiance += diffuseColor.rgb * vec3(0.9, 1.0, 0.55) * rim * leaf * 0.55; }`); }; }
  m.customProgramCacheKey = () => 'wind' + base + amp + freq + flutter + side + near;
  return m;
}

function place(g, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { if (g.index) { const n = g.toNonIndexed(); g.dispose(); g = n; }
  E.set(rx, ry, rz, 'YXZ'); M4.compose(V(x, y, z), Q.setFromEuler(E), V(sx, sy, sz)); g.applyMatrix4(M4); return g; }
function paint(g, fn) { const p = g.attributes.position, a = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { fn(p.getX(i), p.getY(i), p.getZ(i), TC); a[i * 3] = TC.r; a[i * 3 + 1] = TC.g; a[i * 3 + 2] = TC.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
function lumpy(g, amt, xzOnly) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = 1 + (hash(x, y, z) - 0.5) * 2 * amt; p.setXYZ(i, x * r, xzOnly ? y : y * r, z * r); } return g; }
function merge(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  for (const g of list) { const c = g.attributes.position.count; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3); o += c; g.dispose(); }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(col, 3)); G.computeBoundingSphere(); return G; }

// a leaf blob: lumpy icosahedron, shaded dark underneath -> light + warmer on top, per-vertex leaf noise
function blob(r, col, x, y, z, sx = 1, sy = 1, sz = 1, lump = 0.2) {
  const base = new THREE.Color(col), top = base.clone().offsetHSL(-0.035, 0.08, 0.16), g = lumpy(new THREE.IcosahedronGeometry(r, 1), lump);
  paint(g, (px, py, pz, c) => { const t = clamp((py / r + 1) / 2), k = 0.68 + 0.5 * t * t + (hash(px + 3, py, pz) - 0.5) * 0.24; c.copy(base).lerp(top, t).multiplyScalar(k); });
  return place(g, x, y, z, 0, 0, 0, sx, sy, sz); }
// a trunk / branch: tapered cylinder from its base, bark noise, darker at the foot; birch = white with dark bands
function wood(r0, r1, h, col, x, y, z, rx = 0, rz = 0, birch = false) {
  const g = new THREE.CylinderGeometry(r1, r0, h, 7, birch ? 8 : 2); g.translate(0, h / 2, 0); const base = new THREE.Color(col);
  paint(g, (px, py, pz, c) => { const n = hash(px, py, pz); if (birch) { const band = hash(Math.floor(py * 3.3), 7, Math.floor(Math.atan2(pz, px) * 1.2)) > 0.72; c.set(band ? 0x2f2a26 : 0xe9e5dc).multiplyScalar(0.9 + n * 0.12); } else c.copy(base).multiplyScalar(0.72 + 0.28 * clamp(py / h) + (n - 0.5) * 0.16); });
  return place(g, x, y, z, rx, 0, rz); }
// a pine tier: lumpy cone, tips lighter
function tier(r, h, col, y, ry = 0) { const base = new THREE.Color(col), g = lumpy(new THREE.ConeGeometry(r, h, 13, 3), 0.24, true), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), yy = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z) / r; if (rr > 0.6) p.setY(i, yy - (rr - 0.6) * h * (0.25 + hash(x, 0, z) * 0.35)); }   // drooping, ragged skirt
  paint(g, (px, py, pz, c) => { const t = clamp(Math.hypot(px, pz) / r), u = clamp(py / h + 0.5); c.copy(base).offsetHSL(-0.02 * t, 0.05 * t, 0.1 * t + 0.06 * u).multiplyScalar(0.7 + 0.4 * Math.max(t, u * 0.8) + (hash(px, py, pz) - 0.5) * 0.18); });
  return place(g, 0, y + h / 2, 0, 0, ry); }

const BARK = '#5e4330', ring = (n, R, y, r, cols, dy = 0, out = []) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.4; out.push(blob(r * (0.9 + hash(i, R, y) * 0.25), cols[i % cols.length], Math.sin(a) * R, y + (i % 2) * dy, Math.cos(a) * R, 1, 0.82, 1)); } return out; };
const GEO = {};
const roots = (r, n = 5) => { const L = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3; L.push(place(wood(r * 0.2, r * 0.75, 0.75, BARK, 0, 0, 0), Math.sin(a) * r * 0.55, -0.05, Math.cos(a) * r * 0.55, Math.cos(a) * 1.15, 0, -Math.sin(a) * 1.15)); } return L; };
const clumps = (n, R, y0, y1, cols, r = 0.55) => { const L = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hash(i, R, 3) * 0.6, rr = R * (0.92 + hash(i, R, 4) * 0.2); L.push(blob(r * (0.8 + hash(i, R, 5) * 0.5), cols[i % cols.length], Math.sin(a) * rr, y0 + hash(i, R, 6) * (y1 - y0), Math.cos(a) * rr, 1, 0.85, 1, 0.3)); } return L; };
function geo(kind) { if (GEO[kind]) return GEO[kind]; let L;
  if (kind === 'broad') L = [wood(0.2, 0.34, 3.4, BARK, 0, 0, 0), wood(0.07, 0.15, 2.5, BARK, 0, 2.8, 0, 0, -0.62), wood(0.07, 0.14, 2.4, BARK, 0, 3.0, 0, 0.35, 0.58), wood(0.06, 0.13, 2.2, BARK, 0, 3.1, 0, -0.62, 0.1),
    blob(1.6, '#3a6629', 0, 4.4, 0, 1.3, 0.6, 1.3), blob(2.0, '#4f7d35', 0, 5.6, 0, 1.15, 0.8, 1.1), ...ring(6, 1.9, 4.9, 1.45, ['#5a8a3b', '#46722f', '#527f36'], 0.6), blob(1.3, '#679845', 0.3, 6.9, 0.2), blob(1.0, '#5f9040', -0.9, 6.5, -0.6), ...roots(0.34), ...clumps(11, 2.75, 4.3, 6.4, ['#5f8f3e', '#4b7832', '#6a9a46'])];
  else if (kind === 'lime') L = [wood(0.18, 0.3, 2.9, '#56402f', 0, 0, 0), wood(0.06, 0.12, 1.8, '#56402f', 0, 2.5, 0, 0.5, 0.4),
    blob(2.3, '#3d6c31', 0, 5.3, 0, 1, 1.15, 1), ...ring(8, 1.95, 4.2, 1.3, ['#3a672f', '#447536']), ...ring(5, 1.35, 6.3, 1.2, ['#4b7d39', '#548a3f']), blob(1.0, '#5c9244', 0, 7.4, 0), ...roots(0.3, 4), ...clumps(10, 2.55, 3.9, 6.6, ['#4a7a37', '#3d6a30', '#568c40'], 0.5)];
  else if (kind === 'poplar') { L = [wood(0.14, 0.22, 2.6, BARK, 0, 0, 0)]; for (let i = 0; i < 6; i++) { const t = i / 5, r = 0.65 + 0.55 * Math.sin(Math.PI * (0.25 + t * 0.7)); L.push(blob(r, i % 2 ? '#4c7d38' : '#3f6b31', (hash(i, 1, 2) - 0.5) * 0.4, 2.9 + i * 1.12, (hash(i, 2, 1) - 0.5) * 0.4, 1, 1.45, 1, 0.24)); } }
  else if (kind === 'birch') { L = [wood(0.1, 0.16, 6.4, '#fff', 0, 0, 0, 0.04, 0.08, true), wood(0.07, 0.12, 5.0, '#fff', 0.25, 0, 0.15, 0.12, -0.2, true)];
    for (let i = 0; i < 10; i++) { const a = i * 2.4, R = 0.5 + hash(i, 5, 5) * 1.3; L.push(blob(0.75 + hash(i, 3, 3) * 0.4, ['#7fa548', '#8db352', '#739c42'][i % 3], Math.sin(a) * R, 3.8 + hash(i, 4, 4) * 3.4, Math.cos(a) * R, 1, 0.8, 1, 0.28)); } }
  else if (kind === 'palm') L = palmParts();
  else { L = [wood(0.16, 0.26, 2.4, '#4d3626', 0, 0, 0)]; for (let i = 0; i < 5; i++) L.push(tier(2.3 - i * 0.42, 2.1 - i * 0.12, i % 2 ? '#2f5a35' : '#2a5230', 1.7 + i * 1.08, i * 0.7)); L.push(tier(0.35, 1.0, '#3a6a3e', 6.9)); }
  const G = merge(L);
  if (kind !== 'palm') { const p = G.attributes.position, c = G.attributes.color; let maxR = 0, y0 = 1e9, y1 = -1e9; for (let i = 0; i < p.count; i++) { const g = c.getY(i) > c.getX(i) * 1.08 && c.getY(i) > c.getZ(i) * 1.2; if (!g) continue; maxR = Math.max(maxR, Math.hypot(p.getX(i), p.getZ(i))); y0 = Math.min(y0, p.getY(i)); y1 = Math.max(y1, p.getY(i)); }
    for (let i = 0; i < p.count; i++) { if (!(c.getY(i) > c.getX(i) * 1.08 && c.getY(i) > c.getZ(i) * 1.2)) continue; const rr = clamp(Math.hypot(p.getX(i), p.getZ(i)) / (maxR * 0.9)), hh = clamp((p.getY(i) - y0) / (y1 - y0 || 1)), k = (0.62 + 0.42 * rr) * (0.82 + 0.26 * hh);
      c.setXYZ(i, c.getX(i) * k, c.getY(i) * k, c.getZ(i) * k); } }
  return GEO[kind] = G; }

const MAT = {}; const mat = k => MAT[k] || (MAT[k] = k === 'tree' ? windMat(1.6, 0.0032, 1.05, 0.012, THREE.FrontSide, 3.4) : k === 'shrub' ? windMat(0.2, 0.012, 1.3, 0.012) : k === 'tuft' ? windMat(0, 0.55, 1.6, 0.05, THREE.DoubleSide) : k === 'reed' ? windMat(0, 0.07, 1.2, 0.02, THREE.DoubleSide) : windMat(0.1, 0.3, 1.5, 0.03));
export const TREE_KINDS = ['broad', 'lime', 'poplar', 'birch', 'pine', 'palm'];
// PALM (Pearl Island beach, art pass 5 extra): a curved ringed trunk in 6 leaning segments, 11 drooping V-folded fronds
// (older ones lower + yellower), a nut cluster. Fronds are two-sided by doubling the triangles (the tree material is FrontSide).
function frond(L, w, col, tip) { const g = new THREE.PlaneGeometry(1, 1, 2, 9), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), t = p.getY(i) + 0.5, ww = w * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)) * (1 - t * 0.35), a = t * L; p.setXYZ(i, x * ww, a * 0.42 - a * a * 0.17 - Math.abs(x) * ww * 0.55, a); }
  g.computeVertexNormals(); const c0 = new THREE.Color(col), c1 = new THREE.Color(tip);
  paint(g, (px, py, pz, c) => { const t = clamp(pz / L); c.copy(c0).lerp(c1, t * t).multiplyScalar(0.8 + 0.3 * clamp(1 - Math.abs(px) / w) + (hash(px, py, pz) - 0.5) * 0.2); });
  const a = g.toNonIndexed(); g.dispose(); const b = a.clone(), bp = b.attributes.position.array, bn = b.attributes.normal.array, bc = b.attributes.color.array;
  for (let i = 0; i < bp.length; i += 9) for (const arr of [bp, bn, bc]) for (let k = 0; k < 3; k++) { const t = arr[i + 3 + k]; arr[i + 3 + k] = arr[i + 6 + k]; arr[i + 6 + k] = t; }
  for (let i = 0; i < bn.length; i++) bn[i] = -bn[i]; for (let i = 0; i < bc.length; i++) bc[i] *= 0.82; return merge([a, b]); }
function palmParts() { const L = []; let x = 0, y = 0, rz = 0;
  for (let i = 0; i < 6; i++) { const h = 1.28, r0 = 0.26 - i * 0.022, g = wood(r0, r0 - 0.022, h, '#8a6c4d', 0, 0, 0), p = g.attributes.position, c = g.attributes.color;
    for (let k = 0; k < p.count; k++) { const ring = (p.getY(k) % 0.32) < 0.06 ? 0.72 : 1; c.setXYZ(k, c.getX(k) * ring, c.getY(k) * ring, c.getZ(k) * ring); }
    L.push(place(g, x, y, 0, 0, 0, rz)); x += -Math.sin(rz) * h; y += Math.cos(rz) * h; rz -= 0.055; }
  for (let i = 0; i < 11; i++) { const old = i >= 8, ya = i / 8 * Math.PI * 2 + (old ? 0.35 + i : 0.2 * hash(i, 1, 9)), up = old ? 0.5 : -0.1 - hash(i, 2, 9) * 0.3;
    L.push(place(frond(old ? 3.0 : 3.5 + hash(i, 3, 9) * 0.6, 0.85, old ? '#6f7d34' : '#3f7a2f', old ? '#b39a4a' : '#78a843'), x, y - 0.1, 0, up, ya, 0)); }
  for (let i = 0; i < 4; i++) { const a = i * 1.7; L.push(blob(0.17, '#5c4326', x + Math.sin(a) * 0.22, y - 0.38 - (i % 2) * 0.12, Math.cos(a) * 0.22, 1, 1.1, 1, 0.05)); }
  L.push(blob(0.3, '#6b5a35', x, y - 0.05, 0, 1, 0.7, 1, 0.1)); return L; }

// list: [x, y, z, scale, kind]. Returns { group, count }. Instance colour = a small per-tree tint.
let blotTex = null;
export function plantTrees(list, { shadow = true } = {}) {
  const group = new THREE.Group(); group.name = 'flora-trees';
  if (!blotTex) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(20,30,12,0.55)'); gr.addColorStop(0.55, 'rgba(20,30,12,0.3)'); gr.addColorStop(1, 'rgba(20,30,12,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); blotTex = new THREE.CanvasTexture(cv); }
  { const bl = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blotTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), Math.max(1, list.length)); bl.count = list.length;
    list.forEach(([x, y, z, s, k], i) => { const r = (k === 'poplar' ? 2.4 : k === 'birch' ? 3.2 : k === 'palm' ? 3.4 : k === 'pine' ? 4 : 5.2) * s; M4.compose(V(x, y + 0.03, z), Q.identity(), V(r, 1, r)); bl.setMatrixAt(i, M4); }); bl.renderOrder = -1; group.add(bl); }
  for (const kind of TREE_KINDS) { const L = list.filter(t => t[4] === kind); if (!L.length) continue; const im = new THREE.InstancedMesh(geo(kind), mat('tree'), L.length);
    L.forEach(([x, y, z, s], i) => { const r = hash(x, 1, z); M4.compose(V(x, y, z), Q.setFromEuler(E.set(0, r * 6.28, 0)), V(s, s * (0.9 + hash(z, 2, x) * 0.2), s)); im.setMatrixAt(i, M4);
      im.setColorAt(i, TC2.setHSL(0.2 + r * 0.1, 0.3, 0.84 + hash(x, 3, z) * 0.16)); });
    im.castShadow = shadow; im.receiveShadow = true; im.onBeforeRender = tickT; group.add(im); }
  return { group, count: list.length };
}
function inst(g, m, list, cols) { const im = new THREE.InstancedMesh(g, m, Math.max(1, list.length)); im.count = list.length;
  list.forEach(([x, y, z, s = 1, r], i) => { M4.compose(V(x, y, z), Q.setFromEuler(E.set(0, r ?? hash(x, 9, z) * 6.28, 0)), V(s, s, s)); im.setMatrixAt(i, M4); if (cols) im.setColorAt(i, TC2.set(cols(i, x, z))); });
  im.onBeforeRender = tickT; im.receiveShadow = true; return im; }

// SHRUBS: 3-4 lumpy blobs. list [x, y, z, scale]
let shrubG; export function plantShrubs(list) { shrubG = shrubG || merge([blob(0.62, '#41692f', 0, 0.45, 0, 1.15, 0.85, 1.1, 0.25), blob(0.48, '#4d7a37', 0.5, 0.42, 0.18, 1, 0.85, 1, 0.25), blob(0.45, '#3b6230', -0.42, 0.38, -0.25, 1, 0.85, 1, 0.25), blob(0.38, '#5a8a40', 0.05, 0.86, 0.05, 1, 0.9, 1, 0.25)]);
  const im = inst(shrubG, mat('shrub'), list, (i, x, z) => TC.setHSL(0.24 + hash(x, 4, z) * 0.07, 0.3, 0.8 + hash(z, 4, x) * 0.2).getHex()); im.castShadow = false; return im; }
// GRASS TUFTS: 7 blades, dark base -> light tip. list [x, y, z, scale]
let tuftG; export function plantTufts(list) {
  if (!tuftG) { const pos = [], col = [], lo = new THREE.Color('#3b5a27'), hi = new THREE.Color('#9cbd5c');
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + hash(i, 1, 1), r = 0.05 + hash(i, 2, 2) * 0.07, h = 0.28 + hash(i, 3, 3) * 0.24, lean = 0.08 + hash(i, 4, 4) * 0.1, ca = Math.cos(a), sa = Math.sin(a), bx = sa * r, bz = ca * r, w = 0.035;
      pos.push(bx - ca * w, 0, bz + sa * w, bx + ca * w, 0, bz - sa * w, bx + sa * lean, h, bz + ca * lean); col.push(lo.r, lo.g, lo.b, lo.r, lo.g, lo.b, hi.r, hi.g, hi.b); }
    tuftG = new THREE.BufferGeometry(); tuftG.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tuftG.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    tuftG.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => i % 3 === 1 ? 1 : 0), 3)); tuftG.computeBoundingSphere(); }
  return inst(tuftG, mat('tuft'), list, (i, x, z) => TC.setHSL(0.22 + hash(x, 5, z) * 0.06, 0.35, 0.85 + hash(z, 5, x) * 0.15).getHex()); }
// FLOWER CLUSTERS: green stems + leaves (one draw) and coloured heads (one draw, instance colour). list [x, y, z, scale]
let stemG, headG; export const FLOWER_COLS = ['#f472b6', '#facc15', '#f3f2f2', '#c084fc', '#ec3013', '#fb923c'];
export function plantFlowers(list, pick = i => FLOWER_COLS[i % FLOWER_COLS.length]) {
  if (!stemG) { const S = [], H = []; for (let i = 0; i < 6; i++) { const a = i * 2.2, r = i ? 0.12 + hash(i, 6, 6) * 0.12 : 0, h = 0.32 + hash(i, 7, 7) * 0.2, x = Math.sin(a) * r, z = Math.cos(a) * r;
      S.push(paint(place(new THREE.CylinderGeometry(0.012, 0.016, h, 4).translate(0, h / 2, 0), x, 0, z), (px, py, pz, c) => c.set('#3f6a2c')));
      const hd = paint(new THREE.IcosahedronGeometry(0.075, 0), (px, py, pz, c) => c.setScalar(py > 0.02 ? 1 : 0.8)); H.push(place(hd, x, h, z, 0, a, 0, 1.2, 0.6, 1.2)); }
    S.push(blob(0.16, '#4a7a34', 0, 0.06, 0, 1.6, 0.5, 1.6, 0.3)); stemG = merge(S); headG = merge(H); }
  const g = new THREE.Group(); g.add(inst(stemG, mat('flower'), list), inst(headG, mat('flower'), list, i => pick(i))); return g; }

// REEDS: tall blades + cattail heads for the shore. list [x, y, z, scale]
let reedG; export function plantReeds(list) {
  if (!reedG) { const pos = [], col = [], lo = new THREE.Color('#5f7a36'), hi = new THREE.Color('#c9d68a'), P = [];
    for (let i = 0; i < 11; i++) { const a = i / 11 * 6.28 + hash(i, 8, 1), r = 0.04 + hash(i, 8, 2) * 0.22, h = 1.1 + hash(i, 8, 3) * 0.8, lean = 0.1 + hash(i, 8, 4) * 0.25, ca = Math.cos(a), sa = Math.sin(a), bx = sa * r, bz = ca * r, w = 0.03;
      pos.push(bx - ca * w, 0, bz + sa * w, bx + ca * w, 0, bz - sa * w, bx + sa * lean, h, bz + ca * lean); col.push(lo.r, lo.g, lo.b, lo.r, lo.g, lo.b, hi.r, hi.g, hi.b); }
    const bl = new THREE.BufferGeometry(); bl.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bl.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); bl.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => i % 3 === 1 ? 1 : 0), 3)); P.push(bl);
    for (let i = 0; i < 3; i++) { const x = (hash(i, 9, 1) - 0.5) * 0.3, z = (hash(i, 9, 2) - 0.5) * 0.3, h = 1.3 + hash(i, 9, 3) * 0.5;
      P.push(paint(place(new THREE.CylinderGeometry(0.012, 0.016, h, 4).translate(0, h / 2, 0), x, 0, z), (px, py, pz, c) => c.set('#5d6b33')), paint(place(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 6), x, h - 0.05, z), (px, py, pz, c) => c.set('#5a3a22'))); }
    reedG = merge(P); }
  return inst(reedG, mat('reed'), list, (i, x, z) => TC.setHSL(0.15 + hash(x, 6, z) * 0.06, 0.25, 0.82 + hash(z, 6, x) * 0.18).getHex()); }
