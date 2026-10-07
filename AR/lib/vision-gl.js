// Blindness Spectrum Simulator: the live camera drawn through Ben's original vision-condition maths on the GPU.
// The CSS overlay (gallery-vision.js) blurs the camera with backdrop-filter, which some phones (iPhone Safari over a
// <video> especially) skip or apply only partly, so the sim looked softer than the original. Here every pixel of the camera
// goes through the same formulas as Ben's Patient Experience simulator (ported as in 3D/engine/gallery-simwall.js):
// the same severity curves, blur amounts, tunnel / smudge / fog / veil colours and floater spots, at full strength on any phone.
// The HUD, Learn panel, severity slider and eye movement all stay in gallery-vision.js; this only reads its state.

const SPOTS = [[12, 18, 5], [24, 38, 7], [33, 14, 4], [44, 30, 8], [18, 60, 6], [30, 74, 5], [9, 42, 4.5], [40, 52, 6.5], [52, 20, 5], [58, 44, 8], [66, 24, 4.5], [73, 52, 7], [49, 66, 6], [62, 72, 5], [78, 34, 5.5], [86, 58, 6.5], [88, 22, 4], [70, 12, 4], [22, 86, 5], [54, 86, 6], [82, 80, 5.5], [36, 90, 4.5], [16, 30, 4], [92, 44, 5]];
const MODES = { none: 0, cataracts: 1, amd: 2, floaters: 3, rp: 4, glaucoma: 5 };

const VERT = `attribute vec2 p; varying vec2 vUv; void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D map; uniform float sev, aspect, hpx, mode; uniform vec2 gaze; uniform vec4 crop; uniform vec3 spots[24]; uniform vec2 fshift;
float farR(vec2 c, float a) { vec2 p = vec2(c.x * a, c.y); float r = 0.0;
  r = max(r, length(p)); r = max(r, length(p - vec2(a, 0.0))); r = max(r, length(p - vec2(0.0, 1.0))); r = max(r, length(p - vec2(a, 1.0))); return r; }
float pct(vec2 uv, vec2 c, float a) { return length(vec2((uv.x - c.x) * a, uv.y - c.y)) / farR(c, a) * 100.0; }
float ramp4(float t, float t0, float a0, float t1, float a1, float t2, float a2, float t3, float a3) {
  if (t <= t0) return a0; if (t <= t1) return mix(a0, a1, (t - t0) / max(t1 - t0, 1e-4)); if (t <= t2) return mix(a1, a2, (t - t1) / max(t2 - t1, 1e-4)); if (t <= t3) return mix(a2, a3, (t - t2) / max(t3 - t2, 1e-4)); return a3; }
vec3 vid(vec2 uv) { vec2 q = clamp(uv, 0.0, 1.0); return texture2D(map, crop.xy + q * crop.zw).rgb; }
// css blur(px): a gaussian, approximated with the centre and two rings of 8 taps (px are CSS pixels of the screen height)
vec3 blurred(vec2 uv, float px) {
  if (px < 0.05) return vid(uv);
  float r = px / hpx; vec3 acc = vid(uv) * 0.16; float w = 0.16;
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982 + 0.39, b = a + 0.3927;
    acc += vid(uv + vec2(cos(a) / aspect, sin(a)) * r * 0.8) * 0.13;
    acc += vid(uv + vec2(cos(b) / aspect, sin(b)) * r * 1.9) * 0.075; w += 0.205; }
  return acc / w; }
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);   // css coordinates: y down
  vec2 g = gaze / 100.0; float s = sev; vec3 col;
  if (mode < 0.5) { col = vid(uv); }
  else if (mode < 1.5) {   // cataracts: blur, lower contrast, brighter, sepia, then a milky veil
    col = blurred(uv, s * 5.0);
    col = (col - 0.5) * (1.0 - s * 0.35) + 0.5; col *= 1.0 + s * 0.18;
    vec3 sep = vec3(dot(col, vec3(0.393, 0.769, 0.189)), dot(col, vec3(0.349, 0.686, 0.168)), dot(col, vec3(0.272, 0.534, 0.131)));
    col = clamp(mix(col, sep, s * 0.35), 0.0, 1.0);
    col = mix(col, vec3(228.0, 221.0, 200.0) / 255.0, 0.1 + s * 0.4);
  } else if (mode < 2.5) {   // macular degeneration: a dark smudge where you look
    col = blurred(uv, 1.4 + s * 3.4);
    float fog = min(1.0, 0.45 + s * 0.85), r1 = 13.0 + s * 15.0, r2 = 28.0 + s * 28.0, t = pct(uv, g, aspect);
    col = mix(col, vec3(22.0, 19.0, 15.0) / 255.0, ramp4(t, 0.0, 0.98 * fog, r1, 0.9 * fog, r2, 0.5 * fog, r2 + 16.0, 0.0));
  } else if (mode < 3.5) {   // diabetic retinopathy: floaters that drift with the eye
    col = blurred(uv, s * 3.0);
    vec2 L = ((uv - 0.5 - fshift) / 1.15) / 1.24 + 0.5;
    float o = min(1.0, s * 0.88), grow = 1.0 + s * 1.43, keep = 1.0;
    for (int i = 0; i < 24; i++) { vec2 c = spots[i].xy / 100.0; float r = spots[i].z * grow; float t = pct(L, c, aspect);
      float a = t < r * 0.45 ? mix(o, o * 0.78, t / (r * 0.45)) : (t < r ? mix(o * 0.78, 0.0, (t - r * 0.45) / (r * 0.55)) : 0.0); keep *= 1.0 - a; }
    col = mix(vec3(6.0, 5.0, 3.0) / 255.0, col, keep);
  } else if (mode < 4.5) {   // retinitis pigmentosa: the tunnel, a washed-out centre, night dimming
    col = blurred(uv, s * 2.25);
    float amp = min(1.0, s * 1.5125), clr = max(3.0, (1.0 - amp) * 46.0 + 4.0), t = pct(uv, g, aspect);
    col *= 1.0 - s * 0.3;
    col = mix(col, vec3(0.0), ramp4(t, clr, 0.0, clr + 6.0, 0.4 + s * 0.45, clr + 14.0, 0.7 + s * 0.28, clr + 21.0, 1.0));
    float wa = t < clr * 0.55 ? mix(s * 0.42, s * 0.22, t / (clr * 0.55)) : (t < clr ? mix(s * 0.22, 0.0, (t - clr * 0.55) / (clr * 0.45)) : 0.0);
    col = mix(col, vec3(247.0, 243.0, 233.0) / 255.0, wa);
  } else {   // glaucoma: a soft foggy frame closing in
    col = blurred(uv, s * s * 11.0);
    float amp = min(1.0, s * 0.52734375), clr = max(2.0, (1.0 - amp) * 40.0 + 3.0);
    float t = length(vec2((uv.x - g.x) / 0.64, (uv.y - g.y) / 0.64)) * 100.0;
    float a = ramp4(t, clr, 0.0, clr + 7.0, 0.5, clr + 24.0, 0.97, clr + 25.0, 0.97);
    vec3 fc = mix(vec3(16.0, 14.0, 12.0) / 255.0, vec3(0.0), clamp((t - clr - 7.0) / 17.0, 0.0, 1.0));
    col = mix(col, fc, a);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

// Returns null if WebGL isn't available (the CSS overlay then does the work, as before).
export function visionGL(canvas, video) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  try { gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)); }
  catch (e) { console.warn('vision GL off:', e); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  const U = {}; for (const n of ['map', 'sev', 'aspect', 'hpx', 'mode', 'gaze', 'crop', 'fshift']) U[n] = gl.getUniformLocation(prog, n);
  gl.uniform1i(U.map, 0);
  gl.uniform3fv(gl.getUniformLocation(prog, 'spots[0]'), new Float32Array(SPOTS.flat()));
  let ready = false;

  function resize() {
    const dpr = Math.min(1.5, devicePixelRatio || 1), w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  }
  return {
    // st: the overlay's state (cond, shown, gx, gy, lag, t, on). Returns true when it drew a frame.
    draw(st) {
      if (!video.videoWidth || video.readyState < 2) return false;
      resize();
      try { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); }
      catch (e) { return ready; }
      const A = innerWidth / innerHeight, va = video.videoWidth / video.videoHeight;      // object-fit: cover
      const crop = va > A ? [(1 - A / va) / 2, 0, A / va, 1] : [0, (1 - va / A) / 2, 1, va / A];
      const s = Math.max(0, st.shown || 0);
      gl.uniform1f(U.sev, s); gl.uniform1f(U.aspect, A); gl.uniform1f(U.hpx, innerHeight);
      gl.uniform1f(U.mode, s > 0.001 ? (MODES[st.cond] ?? 0) : 0);
      gl.uniform2f(U.gaze, st.gx ?? 50, st.gy ?? 48);
      gl.uniform4f(U.crop, crop[0], crop[1], crop[2], crop[3]);
      // the floater layer moves with the eye, the same as the CSS layer's translate (% of a layer 124% of the screen)
      const cl = v => Math.max(-9, Math.min(9, v)), t = st.t || 0, lag = st.lag || [0, 0];
      const wx = cl(Math.sin(t / 3.1) * 1.6 + lag[0]), wy = cl(Math.cos(t / 4.3) * 1.2 + lag[1]);
      gl.uniform2f(U.fshift, wx * 1.24 / 100, wy * 1.24 / 100);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      ready = true; return true;
    },
  };
}
