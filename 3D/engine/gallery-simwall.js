// Blind Canvas gallery: the "Six Views" vision-simulator wall, live in 3D.
// Ben's standalone page (Vision Simulator - Six Views) shows one film six times, each through a different eye condition,
// under a title that swaps between VISION SIMULATOR and BLINDNESS SPECTRUM. Here it is rebuilt as shaders on the room's
// two big screens, so the severity can be changed live from a kiosk in the room (everyone in the room sees the change
// on the wall; it does not take over your own view like the floor circles do).
// The overlay maths are the same as the page's (same severity curves, gaze waypoints and floater spots).
import * as THREE from '../vendor/three/three.module.js';

const ORDER = [
  { id: 'cataracts', label: 'Cataracts', mode: 1 },
  { id: 'none', label: 'Regular Vision', mode: 0 },
  { id: 'amd', label: 'Macular Degeneration', mode: 2 },
  { id: 'floaters', label: 'Diabetic Retinopathy', mode: 3 },
  { id: 'rp', label: 'Retinitis Pigmentosa', mode: 4 },
  { id: 'glaucoma', label: 'Glaucoma', mode: 5 },
];
const SPOTS = [[12, 18, 5], [24, 38, 7], [33, 14, 4], [44, 30, 8], [18, 60, 6], [30, 74, 5], [9, 42, 4.5], [40, 52, 6.5], [52, 20, 5], [58, 44, 8], [66, 24, 4.5], [73, 52, 7], [49, 66, 6], [62, 72, 5], [78, 34, 5.5], [86, 58, 6.5], [88, 22, 4], [70, 12, 4], [22, 86, 5], [54, 86, 6], [82, 80, 5.5], [36, 90, 4.5], [16, 30, 4], [92, 44, 5]];
const WP = [{ x: 34, y: 38 }, { x: 66, y: 32 }, { x: 76, y: 56 }, { x: 50, y: 64 }, { x: 26, y: 54 }];

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D map; uniform float sev, aspect; uniform vec2 gaze; uniform vec4 crop; uniform vec3 spots[24]; uniform vec2 fshift;
// CSS-style helpers (everything in sRGB, like the browser does it)
float farR(vec2 c, float a) { // farthest-corner radius from c, in tile-height units (x scaled by aspect)
  vec2 p = vec2(c.x * a, c.y); float r = 0.0;
  r = max(r, length(p - vec2(0.0, 0.0))); r = max(r, length(p - vec2(a, 0.0))); r = max(r, length(p - vec2(0.0, 1.0))); r = max(r, length(p - vec2(a, 1.0))); return r; }
float pct(vec2 uv, vec2 c, float a) { return length(vec2((uv.x - c.x) * a, uv.y - c.y)) / farR(c, a) * 100.0; }
float ramp4(float t, float t0, float a0, float t1, float a1, float t2, float a2, float t3, float a3) {
  if (t <= t0) return a0; if (t <= t1) return mix(a0, a1, (t - t0) / max(t1 - t0, 1e-4)); if (t <= t2) return mix(a1, a2, (t - t1) / max(t2 - t1, 1e-4)); if (t <= t3) return mix(a2, a3, (t - t2) / max(t3 - t2, 1e-4)); return a3; }
vec3 vid(vec2 uv) { vec2 q = clamp(uv, 0.0, 1.0); return texture2D(map, crop.xy + vec2(q.x, 1.0 - q.y) * crop.zw).rgb; }
vec3 blurred(vec2 uv, float px) {   // css blur(px): gaussian, approximated by two rings of taps (px measured against a ~515 px tall tile)
  if (px < 0.05) return vid(uv);
  float r = px / 515.0; vec3 acc = vid(uv) * 0.2; float w = 0.2;
  for (int i = 0; i < TAPS; i++) { float a = float(i) * (6.2831853 / float(TAPS)) + 0.39; vec2 d = vec2(cos(a) / aspect, sin(a)); acc += vid(uv + d * r * 1.35) * 0.17; w += 0.17; }
  return acc / w; }
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);   // css coordinates: y down
  vec2 g = gaze / 100.0; float s = sev; vec3 col;
#if MODE == 0
  col = vid(uv);
#elif MODE == 1
  {   // cataracts: blur, contrast, brightness, sepia, then a milky veil
    col = blurred(uv, s * 5.0);
    col = (col - 0.5) * (1.0 - s * 0.35) + 0.5; col *= 1.0 + s * 0.18;
    vec3 sep = vec3(dot(col, vec3(0.393, 0.769, 0.189)), dot(col, vec3(0.349, 0.686, 0.168)), dot(col, vec3(0.272, 0.534, 0.131)));
    col = mix(col, sep, s * 0.35); col = clamp(col, 0.0, 1.0);
    col = mix(col, vec3(228.0, 221.0, 200.0) / 255.0, 0.1 + s * 0.4);
  }
#elif MODE == 2
  {   // macular degeneration: a dark smudge where you look
    col = blurred(uv, 1.4 + s * 3.4);
    float fog = min(1.0, 0.45 + s * 0.85), r1 = 13.0 + s * 15.0, r2 = 28.0 + s * 28.0, t = pct(uv, g, aspect);
    float a = ramp4(t, 0.0, 0.98 * fog, r1, 0.9 * fog, r2, 0.5 * fog, r2 + 16.0, 0.0);
    col = mix(col, vec3(22.0, 19.0, 15.0) / 255.0, a);
  }
#elif MODE == 3
  {   // diabetic retinopathy: floaters (they drift with the eye)
    col = blurred(uv, s * 3.0);
    vec2 L = ((uv - 0.5 - fshift) / 1.15) / 1.24 + 0.5;   // the spot layer is 124% of the tile, scaled 1.15 and moved with the gaze
    float o = min(1.0, s * 0.88), grow = 1.0 + s * 1.43, keep = 1.0;
    for (int i = 0; i < 24; i++) { vec2 c = spots[i].xy / 100.0; float r = spots[i].z * grow; float t = pct(L, c, aspect);
      float a = t < r * 0.45 ? mix(o, o * 0.78, t / (r * 0.45)) : (t < r ? mix(o * 0.78, 0.0, (t - r * 0.45) / (r * 0.55)) : 0.0); keep *= 1.0 - a; }
    col = mix(vec3(6.0, 5.0, 3.0) / 255.0, col, keep);
  }
#elif MODE == 4
  {   // retinitis pigmentosa: the tunnel, a washed-out centre, and night dimming
    col = blurred(uv, s * 2.25);
    float amp = min(1.0, s * 1.5125), clr = max(3.0, (1.0 - amp) * 46.0 + 4.0), t = pct(uv, g, aspect);
    col *= 1.0 - s * 0.3;
    col = mix(col, vec3(0.0), ramp4(t, clr, 0.0, clr + 6.0, 0.4 + s * 0.45, clr + 14.0, 0.7 + s * 0.28, clr + 21.0, 1.0));
    float wa = t < clr * 0.55 ? mix(s * 0.42, s * 0.22, t / (clr * 0.55)) : (t < clr ? mix(s * 0.22, 0.0, (t - clr * 0.55) / (clr * 0.45)) : 0.0);
    col = mix(col, vec3(247.0, 243.0, 233.0) / 255.0, wa);
  }
#else
  {   // glaucoma: a soft foggy frame closing in
    col = blurred(uv, s * s * 11.0);
    float amp = min(1.0, s * 0.52734375), clr = max(2.0, (1.0 - amp) * 40.0 + 3.0);
    float t = length(vec2((uv.x - g.x) / 0.64, (uv.y - g.y) / 0.64)) * 100.0;
    float a = ramp4(t, clr, 0.0, clr + 7.0, 0.5, clr + 24.0, 0.97, clr + 25.0, 0.97);
    vec3 fc = t < clr + 7.0 ? vec3(16.0, 14.0, 12.0) / 255.0 : mix(vec3(16.0, 14.0, 12.0) / 255.0, vec3(0.0), clamp((t - clr - 7.0) / 17.0, 0.0, 1.0));
    col = mix(col, fc, a);
  }
#endif
  gl_FragColor = vec4(col, 1.0);
}`;

function textTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';

const LOW = /iPhone|iPad|Android/i.test(navigator.userAgent);
export function buildSimWalls({ scene, walls, src, kiosk, kiosks, zone }) {
  // one video for every tile on every wall: always in sync
  const video = document.createElement('video'); video.muted = true; video.loop = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.preload = 'none'; video.crossOrigin = 'anonymous';
  const vtex = new THREE.VideoTexture(video); vtex.colorSpace = THREE.NoColorSpace;   // shader works in sRGB like CSS
  const st = { sev: 0.85, shown: 0.85, playing: false, phase: 0, t: 0 };
  const tiles = [];   // { mat, i }
  const heads = [];
  for (const w of walls) {
    const g = new THREE.Group(); g.position.set(...w.p); g.quaternion.set(...w.q); scene.add(g);
    const W = w.s[2] * 1.01, H = w.s[1] * 1.01, HH = H * 0.14, gap = 0.08, gw = (W - gap * 4) / 3, gh = (H - HH - gap * 3) / 2;
    const dark = new THREE.Mesh(new THREE.BoxGeometry(w.s[0] * 1.04, H, W), new THREE.MeshBasicMaterial({ color: 0x08080a })); g.add(dark);
    for (const side of [1, -1]) {
      const face = new THREE.Group(); face.rotation.y = side * Math.PI / 2; face.position.x = side * (w.s[0] * 0.52 + 0.01); g.add(face);
      // header: VISION SIMULATOR / BLINDNESS SPECTRUM, swapping every 5 s like the page
      const mkHead = (txt, color) => { const t = textTex(2048, Math.round(2048 * HH / W), (c, cw, ch) => { c.fillStyle = color; c.font = `800 ${Math.round(ch * 0.5)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt.split('').join(String.fromCharCode(8202)), cw / 2, ch * 0.54); });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(W, HH), new THREE.MeshBasicMaterial({ map: t, transparent: true })); m.position.set(0, H / 2 - HH / 2, 0.005); face.add(m); return m; };
      heads.push([mkHead('VISION SIMULATOR', '#f3f1ee'), mkHead('BLINDNESS SPECTRUM', '#e8b26a')]);
      ORDER.forEach((o, i) => {
        const cx = -W / 2 + gap + gw / 2 + (i % 3) * (gw + gap), cy = H / 2 - HH - gap - gh / 2 - Math.floor(i / 3) * (gh + gap);
        const aspect = gw / gh, crop = aspect > 1 ? new THREE.Vector4(0, (1 - 1 / aspect) / 2, 1, 1 / aspect) : new THREE.Vector4((1 - aspect) / 2, 0, aspect, 1);   // object-fit: cover (square film)
        const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, defines: { MODE: o.mode, TAPS: LOW ? 6 : 8 }, uniforms: { map: { value: vtex }, sev: { value: st.sev }, aspect: { value: aspect }, gaze: { value: new THREE.Vector2(50, 40) }, crop: { value: crop }, spots: { value: SPOTS.map(p => new THREE.Vector3(...p)) }, fshift: { value: new THREE.Vector2() } } });
        mat.toneMapped = false;
        const tile = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), mat); tile.position.set(cx, cy, 0.01); face.add(tile);
        // the label pill, bottom left (Regular Vision in gold, like the page)
        const reg = o.id === 'none', label = o.label.toUpperCase();
        const mc = document.createElement('canvas').getContext('2d'); mc.font = `700 40px ${FONT}`; const PW = Math.ceil(mc.measureText(label).width + 64);
        const lt = textTex(PW, 96, (c, cw, ch) => { c.font = `700 40px ${FONT}`; c.fillStyle = reg ? '#e8b26a' : 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(2, 8, cw - 4, ch - 16, (ch - 16) / 2); c.fill(); c.fillStyle = '#111'; c.textBaseline = 'middle'; c.fillText(label, 32, ch / 2 + 2); });
        const ph = gh * 0.1, pw = ph * PW / 96, pill = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: lt, transparent: true }));
        pill.position.set(cx - gw / 2 + pw / 2 + gw * 0.03, cy - gh / 2 + ph / 2 + gh * 0.04, 0.02); face.add(pill);
        tile.visible = false; tiles.push({ mat, i, id: o.id, mesh: tile });
      });
    }
  }
  // the kiosk: change the severity on the wall
  let kioskTex = null, kioskCtx = null;
  const drawKiosk = () => {
    const c = kioskCtx, w = 900, h = 640; c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 14);
    c.fillStyle = '#ff9783'; c.font = `800 34px ${FONT}`; c.fillText('VISION SIMULATOR · THE WALL', 50, 86);
    c.fillStyle = '#fff'; c.font = `800 74px ${FONT}`; c.fillText('Severity', 50, 182);
    c.fillStyle = '#e8b26a'; c.font = `800 120px ${FONT}`; c.fillText(Math.round(st.sev * 100) + '%', 50, 330);
    c.fillStyle = '#3d4046'; c.fillRect(50, 384, w - 100, 28); c.fillStyle = '#ec3013'; c.fillRect(50, 384, (w - 100) * st.sev, 28);
    c.fillStyle = '#cfcaca'; c.font = `600 28px ${FONT}`; c.fillText('Regular', 50, 452); c.textAlign = 'right'; c.fillText('Severe', w - 50, 452); c.textAlign = 'left';
    c.fillStyle = '#f3f2f2'; c.font = `700 34px ${FONT}`; c.fillText('Press E (or tap) to change', 50, 540); c.fillText('what the wall shows', 50, 584);
    if (kioskTex) kioskTex.needsUpdate = true;
  };
  // the kiosks: low lecterns, one in front of each screen, so you face the wall while you change it (and they don't block the film)
  const kioskList = (kiosks || (kiosk ? [kiosk] : []));
  if (kioskList.length) {
    const cv = document.createElement('canvas'); cv.width = 900; cv.height = 640; kioskCtx = cv.getContext('2d'); drawKiosk();
    kioskTex = new THREE.CanvasTexture(cv); kioskTex.colorSpace = THREE.SRGBColorSpace; kioskTex.anisotropy = 4;
    const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), scrM = new THREE.MeshBasicMaterial({ map: kioskTex }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
    const TILT = -0.95;   // screen leans back, like a lectern
    for (const k of kioskList) {
      const t = new THREE.Group(); t.position.set(...k.p); t.rotation.y = k.face || 0; scene.add(t);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.8), ink); foot.position.y = 0.04; t.add(foot);
      const colm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.95, 0.36), ink); colm.position.set(0, 0.52, -0.05); t.add(colm);
      const top = new THREE.Group(); top.position.set(0, 1.08, 0); top.rotation.x = TILT; t.add(top);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.16, 0.08), ink); top.add(back);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.07), scrM); scr.position.z = 0.045; top.add(scr);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.05, 0.1), red); bar.position.set(0, 0.6, 0); top.add(bar);
      t.updateMatrixWorld(true);
    }
  }
  const zoneBox = new THREE.Box3(new THREE.Vector3(...zone[0]), new THREE.Vector3(...zone[1]));
  return {
    kioskPos: kioskList.length ? new THREE.Vector3(...kioskList[0].p) : null,
    kioskPositions: kioskList.map(k => new THREE.Vector3(...k.p)),
    get severity() { return st.sev; },
    setSeverity(v) { st.sev = THREE.MathUtils.clamp(v, 0, 1); drawKiosk(); },
    update(dt, px, py, pz) {
      st.t += dt;
      const inRoom = zoneBox.containsPoint(new THREE.Vector3(px, py + 0.5, pz));
      if (inRoom && !st.playing) { st.playing = true; for (const T of tiles) T.mesh.visible = true; if (!video.getAttribute('src')) { video.src = src; video.load(); } const p = video.play(); if (p && p.catch) p.catch(() => {}); }
      else if (!inRoom && st.playing) { st.playing = false; video.pause(); video.removeAttribute('src'); video.load(); for (const T of tiles) T.mesh.visible = false; }   // left the room: screens off and the film let go of (memory)   // outside the room (or upstairs): screens off, no effect to draw
      if (!st.playing) return;
      st.shown += THREE.MathUtils.clamp(st.sev - st.shown, -dt * 1.5, dt * 1.5);   // the wall eases to a new severity
      const ph = Math.floor(st.t / 5) % 2, k = THREE.MathUtils.clamp((st.t % 5) / 0.9, 0, 1);
      for (const [a, b] of heads) { a.material.opacity = ph ? 1 - k : k; b.material.opacity = ph ? k : 1 - k; }
      const TRAVEL = 2.2, DWELL = 1.7, CYCLE = TRAVEL + DWELL, ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      for (const T of tiles) {
        const u = T.mat.uniforms; u.sev.value = st.shown;
        const el = st.t + T.i * 1.3, seg = Math.floor(el / CYCLE) + T.i * 2, inSeg = el % CYCLE, a = WP[seg % WP.length], b = WP[(seg + 1) % WP.length], kk = inSeg < TRAVEL ? ease(inSeg / TRAVEL) : 1;
        const gx = a.x + (b.x - a.x) * kk + Math.sin(st.t * 1.3 + T.i) * 1.2, gy = a.y + (b.y - a.y) * kk + Math.cos(st.t * 1.1 + T.i) * 1.0;
        u.gaze.value.set(gx, gy); u.fshift.value.set((gx - 50) * 0.0062, (gy - 45) * 0.0062);
      }
    },
  };
}
