// Blind Canvas gallery: stained glass in the style of the eye facade, for flat glass anywhere (rail panels, windows).
// Irregular leaded panels (a jittered cell pattern in world space, so neighbouring panes line up), coloured like the eye:
// deep cobalt / ultramarine / teal toward the bottom edge, light half-clear blues, frosted pale and opal near-white higher up,
// a rare pale gold; cathedral-glass streaks, seeds, darker edges; lit from within at night (uNight).
// plane: which world axes the glass lies in ('xy' for glass facing ±z, 'zy' for glass facing ±x).
import * as THREE from '../vendor/three/three.module.js';

const VS = `
  varying vec3 vW;
  #include <fog_pars_vertex>
  void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const FS = `
  uniform float uNight; uniform float uCell; uniform float uY0; uniform float uY1; uniform float uOp; uniform int uPlane; uniform vec3 uCyl;
  varying vec3 vW;
  #include <fog_pars_fragment>
  vec2 h2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    vec2 P = uPlane == 1 ? vW.zy : uPlane == 2 ? vec2(atan(vW.z - uCyl.y, vW.x - uCyl.x) * uCyl.z, vW.y) : vW.xy;   // 2: wrapped round a vertical cylinder
    vec2 q = P / uCell, i = floor(q), f = fract(q);
    // voronoi: nearest and second-nearest cell centres -> the panel and the distance to its leading
    float d1 = 9.0, d2 = 9.0; vec2 id = vec2(0.0);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y)), o = 0.15 + 0.7 * h2(i + g), r = g + o - f; float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d;
    }
    float edge = (sqrt(d2) - sqrt(d1)) * uCell;                 // ~ metres to the lead line
    float lead = 1.0 - smoothstep(0.03, 0.06, edge);
    float h = hash(id), h2v = hash(id + 7.7);
    float t = clamp((P.y - uY0) / max(0.01, uY1 - uY0), 0.0, 1.0);   // 0 at the bottom of the glass, 1 at the top
    vec3 col; float a;
    if (h < 0.42 - t * 0.32) { col = h2v < 0.4 ? vec3(0.07, 0.19, 0.62) : h2v < 0.7 ? vec3(0.10, 0.11, 0.48) : h2v < 0.9 ? vec3(0.04, 0.42, 0.58) : vec3(0.20, 0.34, 0.78); a = 0.68; }
    else if (h > 0.97) { col = vec3(0.98, 0.86, 0.55); a = 0.6; }
    else if (h > 0.97 - (0.2 + t * 0.35)) { col = h2v < 0.5 ? vec3(0.97, 0.98, 1.0) : vec3(0.88, 0.93, 0.97); a = h2v < 0.5 ? 0.82 : 0.58; }
    else { col = h2v < 0.7 ? vec3(0.60, 0.80, 0.96) : vec3(0.32, 0.56, 0.88); a = h2v < 0.7 ? 0.4 : 0.52; }
    vec2 dir = vec2(cos(h * 6.28), sin(h * 6.28));
    col *= 0.9 + noise(vec2(dot(P, dir) * 5.0, dot(P, vec2(-dir.y, dir.x)) * 0.6 + h * 20.0)) * 0.18;
    col += step(0.988, hash(floor(P * 26.0))) * 0.12;
    col *= mix(0.82, 1.0, smoothstep(0.0, 0.12, edge));
    col = mix(col, col * 0.55 + col * col * 0.9 + vec3(0.06, 0.05, 0.03), uNight);
    // clearer glass (more of the world shows through), but the lead came stays solid black, as it would be
    col = mix(col, vec3(0.04, 0.04, 0.05), lead); a = mix(a * 0.55 * uOp, 1.0, lead);
    gl_FragColor = vec4(col, a);
    #include <fog_fragment>
  }`;

const all = [];
export function stainedGlass({ cell = 0.55, y0 = 0, y1 = 1, plane = 'xy', opacity = 1, cyl = null } = {}) {   // cyl: [cx, cz, radius] for plane 'cyl'
  const m = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 }, uCell: { value: cell }, uY0: { value: y0 }, uY1: { value: y1 }, uOp: { value: opacity }, uPlane: { value: plane === 'zy' ? 1 : plane === 'cyl' ? 2 : 0 }, uCyl: { value: new THREE.Vector3(...(cyl || [0, 0, 1])) } }]) });
  all.push(m); return m;
}
export const setStainedNight = n => { for (const m of all) m.uniforms.uNight.value = n; };

// ------------------------------------------------ roof glass: a different design in each bay between the main hall's beams
// style 0 mosaic (the eye's leaded panels) · 1 ripples (rings from the centre, like water) · 2 harlequin (a diamond lattice)
// 3 sunburst (rays from the centre) · 4 waves (flowing bands across the bay) · 5 rose (petals round a centre)
// Local coordinates: the bay's centre (uC) in world x/z; colours from the eye's palette.
const ROOF_FS = `
  uniform float uNight; uniform int uStyle; uniform vec2 uC; uniform vec2 uHalf; uniform float uSeed;
  varying vec3 vW;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 h2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  vec3 pal(float h, float t) {   // t: 0 = deep, 1 = light
    if (h > 0.965) return vec3(0.98, 0.86, 0.55);
    if (h < 0.5 - t * 0.4) return h < 0.2 ? vec3(0.07, 0.19, 0.62) : h < 0.35 ? vec3(0.10, 0.11, 0.48) : vec3(0.04, 0.42, 0.58);
    if (h > 0.75 - t * 0.2) return h > 0.88 ? vec3(0.97, 0.98, 1.0) : vec3(0.88, 0.93, 0.97);
    return h > 0.6 ? vec3(0.60, 0.80, 0.96) : vec3(0.32, 0.56, 0.88);
  }
  void main() {
    vec2 P = vec2(vW.x, vW.z) - uC; float r = length(P), a = atan(P.y, P.x);
    vec2 id; float dl, t = 0.5;
    if (uStyle == 1) {        // ripples
      float k = r / 0.9 + 0.25 * sin(a * 3.0 + uSeed), ring = floor(k), n = 6.0 + ring * 4.0, af = (a / 6.2832 + 0.5) * n + ring * 0.5, s = floor(af);
      id = vec2(ring, mod(s, n)); dl = min(min(fract(k), 1.0 - fract(k)) * 0.9, min(fract(af), 1.0 - fract(af)) * 6.2832 / n * r); t = clamp(ring / 12.0, 0.0, 1.0);
    } else if (uStyle == 2) { // harlequin diamonds
      vec2 q = vec2(P.x + P.y, P.x - P.y) / 1.1, f = fract(q); id = floor(q); dl = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * 0.78; t = mod(id.x + id.y, 2.0) * 0.6 + 0.2;
    } else if (uStyle == 3) { // sunburst
      float n = 28.0, af = (a / 6.2832 + 0.5) * n, s = floor(af), k = floor(r / 2.2 + hash(vec2(s, 1.0)) * 0.6);
      id = vec2(s, k); dl = min(min(fract(af), 1.0 - fract(af)) * 6.2832 / n * r, min(fract(r / 2.2 + hash(vec2(s, 1.0)) * 0.6), 1.0 - fract(r / 2.2 + hash(vec2(s, 1.0)) * 0.6)) * 2.2); t = clamp(r / 18.0, 0.0, 1.0);
      if (r < 0.9) { id = vec2(-1.0); dl = abs(r - 0.9); }
    } else if (uStyle == 4) { // waves
      float w = P.y + sin(P.x * 0.9 + uSeed) * 0.9 + sin(P.x * 2.1) * 0.25, k = floor(w / 1.0), seg = floor((P.x + k * 0.7) / 1.6);
      id = vec2(k, seg); float fw = fract(w / 1.0), fs = fract((P.x + k * 0.7) / 1.6); dl = min(min(fw, 1.0 - fw) * 1.0, min(fs, 1.0 - fs) * 1.6); t = 0.5 + 0.5 * sin(k * 0.7);
    } else if (uStyle == 5) { // rose
      float petals = 10.0, k = r / 1.2, ring = floor(k), af = (a / 6.2832 + 0.5) * petals + ring * 0.5 + sin(r * 0.8) * 0.4, s = floor(af);
      id = vec2(ring, mod(s, petals)); dl = min(min(fract(k), 1.0 - fract(k)) * 1.2, min(fract(af), 1.0 - fract(af)) * 6.2832 / petals * r); t = clamp(ring / 10.0, 0.0, 1.0);
    } else {                  // mosaic
      vec2 q = P / 0.8, i = floor(q), f = fract(q); float d1 = 9.0, d2 = 9.0;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)), o = 0.15 + 0.7 * h2(i + g + uSeed), rr = g + o - f; float d = dot(rr, rr); if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d; }
      dl = (sqrt(d2) - sqrt(d1)) * 0.8; t = clamp(r / 16.0, 0.0, 1.0);
    }
    float h = hash(id + uSeed * 3.1), lead = 1.0 - smoothstep(0.035, 0.07, dl);
    vec3 col = pal(h, t); float al = col.b > 0.9 && col.r > 0.85 ? 0.8 : col.r < 0.15 ? 0.7 : 0.5;
    vec2 dir = vec2(cos(h * 6.28), sin(h * 6.28));
    col *= 0.9 + noise(vec2(dot(P, dir) * 4.0, dot(P, vec2(-dir.y, dir.x)) * 0.5 + h * 20.0)) * 0.18;
    col *= mix(0.82, 1.0, smoothstep(0.0, 0.12, dl));
    col = mix(col, col * 0.55 + col * col * 0.9 + vec3(0.06, 0.05, 0.03), uNight);
    // the bay's frame: a dark border all round
    vec2 e = uHalf - abs(P); float frame = 1.0 - smoothstep(0.06, 0.12, min(e.x, e.y));
    lead = max(lead, frame);
    col = mix(col, vec3(0.04, 0.04, 0.05), lead); al = mix(al * 0.55, 1.0, lead);   // clear glass, solid black lead
    gl_FragColor = vec4(col, al);
    #include <fog_fragment>
  }`;
export function roofGlass({ style = 0, cx, cz, hx, hz, seed = 0 }) {
  const m = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: ROOF_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 }, uStyle: { value: style }, uC: { value: new THREE.Vector2(cx, cz) }, uHalf: { value: new THREE.Vector2(hx, hz) }, uSeed: { value: seed } }]) });
  all.push(m); return m;
}

// ------------------------------------------------ the iris floor: the eye platform's ring floor as stained glass, like the
// facade's eye: rings of curved leaded panels round the pupil, deep cobalt / ultramarine / teal with lighter flecks near the pupil
// (the collarette) and a dark navy limbal band at the rim; slightly see-through (you glimpse the music room below), lead solid black.
const IRIS_FS = `
  uniform float uNight; uniform vec2 uC; uniform float uIn; uniform float uOut;
  varying vec3 vW;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    vec2 P = vec2(vW.x, vW.z) - uC; float r = length(P), a = atan(P.y, P.x);
    float rL = uOut - 0.5;                                   // the limbal band starts here
    vec2 id; float dl, limb = 0.0, t;
    if (r > rL) {                                           // limbal ring: slim navy panels all round
      float n = 56.0, af = (a / 6.2831853 + 0.5) * n; id = vec2(9.0, floor(af));
      dl = min(min(fract(af), 1.0 - fract(af)) * 6.2831853 / n * r, min(r - rL, uOut - r)); limb = 1.0; t = 1.0;
    } else {
      float rw = r + 0.07 * sin(a * 7.0) + 0.04 * sin(a * 13.0 + r);
      float bandW = (rL - uIn) / 4.0, kf = (rw - uIn) / bandW, k = clamp(floor(kf), 0.0, 3.0), fr = fract(kf);
      float n = 12.0 + k * 6.0, af = (a / 6.2831853 + 0.5) * n + hash(vec2(k, 3.1)) + k * 0.37, seg = floor(af), fa = fract(af);
      id = vec2(k, mod(seg, n));
      float h2 = hash(id + 17.3), split = step(0.55, h2), side = step(fa, fr);
      if (split > 0.5) id += side * 41.0;
      float dR = min(fr, 1.0 - fr) * bandW, dA = min(fa, 1.0 - fa) * 6.2831853 / n * r, dD = split > 0.5 ? abs(fa - fr) * 0.7 * bandW : 9.0;
      dl = min(min(dR, dA), dD); dl = min(dl, min(r - uIn, rL - r));
      t = clamp((r - uIn) / (rL - uIn), 0.0, 1.0);
    }
    float h = hash(id), h2 = hash(id + 5.1);
    float lead = 1.0 - smoothstep(0.03, 0.06, dl);
    vec3 col; float al;
    if (limb > 0.5) { col = h < 0.6 ? vec3(0.06, 0.09, 0.30) : vec3(0.09, 0.08, 0.36); al = 0.9; }
    else if (h > 0.975) { col = vec3(0.98, 0.86, 0.55); al = 0.72; }                                   // a gold fleck
    else if (t < 0.3 && h2 > 0.45) { col = h2 > 0.8 ? vec3(0.60, 0.80, 0.96) : vec3(0.30, 0.70, 0.72); al = 0.62; }   // light teal round the pupil
    else if (h < 0.36) { col = vec3(0.07, 0.19, 0.62); al = 0.76; }                                    // cobalt
    else if (h < 0.62) { col = vec3(0.04, 0.42, 0.58); al = 0.72; }                                    // teal
    else if (h < 0.8) { col = vec3(0.10, 0.11, 0.48); al = 0.8; }                                      // ultramarine
    else { col = vec3(0.32, 0.56, 0.88); al = 0.66; }                                                   // mid blue
    vec2 dir = vec2(cos(h * 6.28), sin(h * 6.28));
    col *= 0.9 + noise(vec2(dot(P, dir) * 5.0, dot(P, vec2(-dir.y, dir.x)) * 0.6 + h * 20.0)) * 0.18;
    col += step(0.988, hash(floor(P * 26.0))) * 0.1;
    col *= mix(0.8, 1.0, smoothstep(0.0, 0.14, dl));
    col = mix(col, col * 0.55 + col * col * 0.9 + vec3(0.06, 0.05, 0.03), uNight);
    col = mix(col, vec3(0.04, 0.04, 0.05), lead); al = mix(al, 1.0, lead);
    gl_FragColor = vec4(col, al);
    #include <fog_fragment>
  }`;
export function irisGlass({ cx, cz, rIn, rOut }) {
  const m = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: IRIS_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 }, uC: { value: new THREE.Vector2(cx, cz) }, uIn: { value: rIn }, uOut: { value: rOut } }]) });
  all.push(m); return m;
}

// ------------------------------------------------ art glass: a stained-glass version of one of the gallery's artworks, set as a
// large square medallion in a tall pane (the outer ring's big windows), framed in ink with a thin gold fillet; round it, the
// eye facade's leaded panels (deep blues low, opal whites high). Each small pane of the art takes the artwork's colour at its
// centre (so the picture reads as glass, piece by piece), a little richer, with streaks and solid black lead.
// Pane-local coordinates come in through uv: u along the pane (0..1 over uSize.x metres), v up it (0..1 over uSize.y).
const ART_VS = `
  varying vec3 vW; varying vec2 vUv;
  #include <fog_pars_vertex>
  void main() { vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const ART_FS = `
  uniform float uNight; uniform vec2 uSize; uniform vec4 uArt; uniform sampler2D uMap; uniform float uHas; uniform float uFlip; uniform float uSeed;
  varying vec3 vW; varying vec2 vUv;
  #include <fog_pars_fragment>
  vec2 h2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  // voronoi: returns cell id, cell centre (in P units) and the distance (in P units) to the lead
  void vor(vec2 P, float cell, out vec2 id, out vec2 ctr, out float edge) {
    vec2 q = P / cell, i = floor(q), f = fract(q); float d1 = 9.0, d2 = 9.0; vec2 c1 = vec2(0.0); id = vec2(0.0);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)), o = 0.15 + 0.7 * h2(i + g + uSeed), r = g + o - f; float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; id = i + g; c1 = i + g + o; } else if (d < d2) d2 = d; }
    ctr = c1 * cell; edge = (sqrt(d2) - sqrt(d1)) * cell;
  }
  void main() {
    vec2 P = vUv * uSize;                                    // metres across and up the pane
    vec2 a0 = uArt.xy - uArt.zw, a1 = uArt.xy + uArt.zw;     // the art square
    vec2 dIn = min(P - a0, a1 - P); float inside = min(dIn.x, dIn.y);   // >0 inside the square
    vec3 col; float al, lead;
    if (inside > 0.0) {
      vec2 id, c; float e; vor(P, 0.3, id, c, e);
      vec2 uv = clamp((c - a0) / (a1 - a0), 0.0, 1.0); if (uFlip > 0.5) uv.x = 1.0 - uv.x;
      vec3 t = uHas > 0.5 ? texture2D(uMap, uv).rgb : vec3(0.3, 0.45, 0.8);
      float l = dot(t, vec3(0.3, 0.59, 0.11)); t = clamp(mix(vec3(l), t, 1.35) * 1.08, 0.0, 1.0);   // a little richer, like glass
      col = t; al = 0.86; lead = (1.0 - smoothstep(0.02, 0.04, e)) * smoothstep(0.2, 1.0, 0.3 / (length(fwidth(P)) * 9.0));   // far off, the leading thins out instead of shimmering
      vec2 dir = vec2(cos(hash(id) * 6.28), sin(hash(id) * 6.28));
      col *= 0.92 + noise(vec2(dot(P, dir) * 7.0, dot(P, vec2(-dir.y, dir.x)) * 0.8 + hash(id) * 20.0)) * 0.14;
      col *= mix(0.8, 1.0, smoothstep(0.0, 0.06, e));
    } else {
      vec2 id, c; float e; vor(P, 0.8, id, c, e);
      float h = hash(id), h2v = hash(id + 7.7), tt = clamp(P.y / uSize.y, 0.0, 1.0);
      if (h < 0.42 - tt * 0.32) { col = h2v < 0.4 ? vec3(0.07, 0.19, 0.62) : h2v < 0.7 ? vec3(0.10, 0.11, 0.48) : h2v < 0.9 ? vec3(0.04, 0.42, 0.58) : vec3(0.20, 0.34, 0.78); al = 0.68; }
      else if (h > 0.97) { col = vec3(0.98, 0.86, 0.55); al = 0.6; }
      else if (h > 0.97 - (0.2 + tt * 0.35)) { col = h2v < 0.5 ? vec3(0.97, 0.98, 1.0) : vec3(0.88, 0.93, 0.97); al = h2v < 0.5 ? 0.82 : 0.58; }
      else { col = h2v < 0.7 ? vec3(0.60, 0.80, 0.96) : vec3(0.32, 0.56, 0.88); al = h2v < 0.7 ? 0.4 : 0.52; }
      vec2 dir = vec2(cos(h * 6.28), sin(h * 6.28));
      col *= 0.9 + noise(vec2(dot(P, dir) * 5.0, dot(P, vec2(-dir.y, dir.x)) * 0.6 + h * 20.0)) * 0.18;
      col *= mix(0.82, 1.0, smoothstep(0.0, 0.12, e));
      al *= 0.55;
      lead = (1.0 - smoothstep(0.03, 0.06, e)) * smoothstep(0.2, 1.0, 0.8 / (length(fwidth(P)) * 9.0));
    }
    // the medallion's ink frame with a thin gold fillet inside it; the pane's own ink border
    float fr = 1.0 - smoothstep(0.1, 0.13, abs(inside + 0.02));
    float gold = 1.0 - smoothstep(0.015, 0.03, abs(inside - 0.17));
    vec2 eb = min(P, uSize - P); float border = 1.0 - smoothstep(0.08, 0.11, min(eb.x, eb.y));
    col = mix(col, col * 0.55 + col * col * 0.9 + vec3(0.06, 0.05, 0.03), uNight);
    col = mix(col, vec3(0.93, 0.78, 0.42), gold * 0.9); al = mix(al, 0.95, gold);
    lead = max(lead, max(fr, border));
    col = mix(col, vec3(0.04, 0.04, 0.05), lead); al = mix(al, 1.0, lead);
    gl_FragColor = vec4(col, al);
    #include <fog_fragment>
  }`;
export function artGlass({ size, art, flip = false, seed = 0 }) {   // size [W, H] m; art [cx, cy, half, half] m in pane coords
  const m = new THREE.ShaderMaterial({ vertexShader: ART_VS, fragmentShader: ART_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 }, uSize: { value: new THREE.Vector2(...size) }, uArt: { value: new THREE.Vector4(...art) }, uMap: { value: null }, uHas: { value: 0 }, uFlip: { value: flip ? 1 : 0 }, uSeed: { value: seed } }]) });
  all.push(m); return m;
}
