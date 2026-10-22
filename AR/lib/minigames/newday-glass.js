// A NEW DAY (Raquel Alim): LIGHT THE GLASS.
// "I have my down moments, and that's okay. Tomorrow is a new day." One simple thing to do.
// It's night: Raquel's stained-glass window is dark and blue. Rub your finger across the glass (or point your phone and
// sweep it slowly) and every piece you touch lights up warm, as if the sunrise were behind it, each with a soft glass
// chime (higher toward the top). Halfway there, a down moment: a cloud drifts over and some of the light fades, and
// that's okay, you light it again. Fill the window with light and the sun rises over the sea: a new day.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const N = 96;               // the light map is N×N
const GOAL = 0.6;           // how much of the window to light
const BRUSH = 0.1;          // how big a touch is

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// night: the painting dark and blue; where the light map is lit, the glass glows warm like sunrise behind it (the dark
// leading between the pieces stays dark); the sea shimmers; and at the end the sun rises over the horizon
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, light;
uniform float uT, uA, uH, uDay, uSun, uCloud;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the sea inside the window shimmers
  float sea = smoothstep(0.6, 0.62, p.y) * (1.0 - smoothstep(0.72, 0.76, p.y)) * step(0.15, p.x) * step(p.x, 0.92);
  s.x += sin(p.y * 220.0 + uT * 1.8) * 0.0022 * sea;
  vec3 c = at(s);
  float L = texture2D(light, vec2(p.x, 1.0 - p.y)).r;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  // night: dark and blue
  vec3 night = mix(vec3(lum) * vec3(0.35, 0.45, 0.75), c * vec3(0.4, 0.5, 0.8), 0.45) * 0.55;
  // lit glass: the painting, brightened warmly where the glass is light (the leading stays dark)
  float glass = smoothstep(0.18, 0.55, lum);
  vec3 lit = c * (1.0 + 0.45 * glass) + vec3(0.12, 0.06, 0.0) * glass;
  float flick = 0.94 + 0.06 * sin(uT * 2.0 + p.x * 20.0 + p.y * 13.0);
  float k = clamp(max(L, uDay), 0.0, 1.0) * (1.0 - uCloud * 0.35);
  vec3 col = mix(night, lit * flick, k);
  // a soft glow at the edge of the light
  col += vec3(1.0, 0.7, 0.35) * glass * L * (1.0 - L) * 0.6;
  // sunrise: the sun comes up over the sea, and its path glitters on the water
  vec2 sp = vec2(0.375, 0.615 - uSun * 0.07);
  float sd = length((p - sp) * vec2(1.0, uH));
  col += vec3(1.0, 0.75, 0.4) * (exp(-sd * 22.0) * 0.9 + exp(-sd * 6.0) * 0.25) * uSun;
  col += vec3(1.0, 0.8, 0.5) * sea * exp(-abs(p.x - 0.375) * 30.0) * (0.5 + 0.5 * sin(p.y * 300.0 - uT * 4.0)) * 0.4 * uSun;
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── glass chimes and a dawn chorus ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const PENTA = [0, 2, 4, 7, 9];
function dawn(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, out = bus, p = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, { freq = 1000, type = 'lowpass', q = 1, vol = 0.1, sweep = 0, att = 0.5 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  const CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]];
  let next = 0, step = 0, timer = null, waveT = 0, day = 0;
  function schedule() {
    while (next < ac.currentTime + 0.2) { const ch = CH[step % 4]; ch.forEach((m, i) => tone(next + i * 0.15, midi(m), 5.5, { vol: 0.02 + 0.015 * day, att: 1.2 })); next += 4.8; step++; }
    if (ac.currentTime > waveT) { waveT = ac.currentTime + 6 + Math.random() * 2; noise(ac.currentTime + 0.05, 3.5, { freq: 380, vol: 0.12, att: 1.5, sweep: 900 }); }
    // birds wake as the day comes
    if (Math.random() < 0.012 * day) { const t = ac.currentTime + 0.05, f = 2200 + Math.random() * 1200, p = Math.random() * 1.6 - 0.8; for (let i = 0; i < 3; i++) tone(t + i * 0.09, f * (1 + i * 0.08), 0.07, { vol: 0.025, out: fx, p }); }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 60); schedule(); bus.gain.setTargetAtTime(0.8, ac.currentTime, 1.5); },
    day(v) { day = v; },
    // a glass chime: higher toward the top of the window, panned to where you touched
    chime(u, v, n) { const deg = Math.max(0, Math.min(14, Math.floor((1 - v) * 15))), m = 69 + Math.floor(deg / 5) * 12 + PENTA[deg % 5];
      const t = ac.currentTime + 0.01, p = u * 1.6 - 0.8; tone(t, midi(m), 1.6, { vol: 0.045, out: fx, p }); tone(t, midi(m) * 2.76, 0.5, { vol: 0.012, out: fx, p }); },
    cloud() { noise(ac.currentTime + 0.05, 3, { freq: 250, vol: 0.18, att: 1 }); tone(ac.currentTime + 0.1, midi(45), 3, { type: 'triangle', vol: 0.03, att: 1, out: fx }); },
    sunrise() { const t = ac.currentTime + 0.1; [62, 66, 69, 74, 78, 81, 86].forEach((m, i) => tone(t + i * 0.22, midi(m), 4.5, { type: 'triangle', vol: 0.05, att: 0.1, out: fx })); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.3); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.3); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function lightTheGlassGame() {
  let G = null;

  // paint light into the light map around (u, v)
  function brush(u, v, amt) {
    const g = G.lg, r = BRUSH * N, x = u * N, y = v * N;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${amt})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    G.lightTex.needsUpdate = true; G.dirty = true;
    // a chime now and then, as new glass lights
    G.chimeT -= 1; if (G.chimeT <= 0) { G.chimeT = 6; G.band.chime(u, v); }
  }
  function coverage() {
    const d = G.lg.getImageData(0, 0, N, N).data; let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 150) lit++;
    return lit / (N * N);
  }
  function aim() {
    if (G.touch) return G.touch;
    if (G.bot) return G.botAim;
    if (!G.pointing) return null;
    const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root);
    return p && p.u > 0 && p.u < 1 && p.v > 0 && p.v < 1 ? [p.u, p.v] : null;
  }
  function milestone(c) {
    const say = [[GOAL * 0.25, 'A quarter of the way to morning.'], [GOAL * 0.5, 'Halfway.'], [GOAL * 0.8, 'The sky is getting brighter.']];
    for (const [at, line] of say) if (c >= at && !G.said.has(at)) { G.said.add(at); G.say(line); }
    // the down moment
    if (c >= GOAL * 0.55 && !G.cloudDone) { G.cloudDone = true; G.cloud = { t: 0 }; G.band.cloud(); G.say('A down moment. A cloud drifts over, and some of the light fades. That’s okay. Light it again.');
      G.ui.alert('A down moment', 'That’s okay. Light it again.', 3, 'black');
      // the cloud dims part of the window
      const g = G.lg; g.globalCompositeOperation = 'destination-out'; const gr = g.createLinearGradient(0, 0, N, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,.25)');
      g.fillStyle = gr; g.fillRect(0, 0, N, N * 0.6); g.globalCompositeOperation = 'source-over'; G.lightTex.needsUpdate = true; }
    if (c >= GOAL && G.phase === 'play') sunrise();
  }
  function sunrise() {
    G.phase = 'sunrise'; G.band.sunrise(); G.ui.buttons([]);
    G.say('Good morning. A new day.');
    setTimeout(() => { if (!G) return;
      K.finale(G, { won: true, kicker: 'Light the glass', title: 'A new day', line: G.work && G.work.quote, cells: [{ k: 'Window lit', v: Math.round(G.cov * 100) + '%' }],
        say: 'A new day. ' + ((G.work && G.work.quote) || '') }); }, 6500);
  }

  return {
    title: 'Light the glass',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', cov: 0, day: 0, sun: 0, cloud: null, cloudK: 0, said: new Set(), cloudDone: false, touch: null, pointing: false, chimeT: 0, covT: 0, botAim: [0.2, 0.15], botK: 0 });
      G.band = dawn(K.audio());
      const cv = document.createElement('canvas'); cv.width = cv.height = N; G.lg = cv.getContext('2d', { willReadFrequently: true }); G.lg.fillStyle = '#000'; G.lg.fillRect(0, 0, N, N);
      G.lightTex = new THREE.CanvasTexture(cv); G.lightTex.colorSpace = THREE.NoColorSpace;
      G.uni = { map: { value: null }, light: { value: G.lightTex }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uDay: { value: 0 }, uSun: { value: 0 }, uCloud: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.ring = K.sprite(K.glowTex, 0.12, { color: '#ffd9a0', additive: true, order: 20, opacity: 0 }); G.root.add(G.ring);
      G.onGo = () => {
        G.phase = 'play'; G.band.start();
        G.ui.panel('Light the glass', '0% <small>of the window lit</small>', { segs: [0, 10] });
        G.ui.buttons([{ label: 'Point to light', icon: '☀', kind: 'black', aria: 'Point your phone to light the glass (on or off)', press: () => { G.pointing = !G.pointing; G.ui.pop(G.pointing ? 'Pointing on' : 'Pointing off'); } }]);
      };
      K.intro(G, { title: 'Light the glass', how: 'It’s night, and the stained-glass window is dark. Rub your finger across the glass to light it up, like the sunrise behind it. Fill the window, and a new day begins.',
        say: 'Light the glass. It’s night, and Raquel’s stained-glass window is dark. Rub your finger across the glass, and every piece lights up like the sunrise is behind it. Or press Point to light, and sweep your phone slowly across the painting. Fill the window with light, and a new day begins.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      if (G.phase === 'play') {
        // the robot sweeps back and forth, top to bottom
        if (G.bot) { G.botK += dt * 0.55; const row = Math.floor(G.botK) % 9, f = G.botK % 1; G.botAim = [0.12 + (row % 2 ? 1 - f : f) * 0.8, 0.08 + row * 0.1]; }
        const a = aim();
        if (a) { brush(a[0], a[1], G.touch ? 0.55 : 0.4); const [x, y] = G.S.P(a[0], a[1]); G.ring.position.set(x, y, 0.06); G.ring.material.opacity = 0.5; }
        else G.ring.material.opacity *= Math.pow(0.05, dt);
        G.covT -= dt; if (G.covT <= 0 && G.dirty) { G.covT = 0.4; G.dirty = false; G.cov = coverage(); milestone(G.cov);
          G.ui.panel('Light the glass', `${Math.round(Math.min(1, G.cov / GOAL) * 100)}% <small>of the way to morning</small>`, { segs: [Math.floor(Math.min(1, G.cov / GOAL) * 10), 10] }); }
      }
      G.band.day(Math.min(1, G.cov / GOAL));
      // the cloud of a down moment passes
      if (G.cloud) { G.cloud.t += dt; G.cloudK = Math.sin(Math.min(1, G.cloud.t / 4) * Math.PI); if (G.cloud.t > 4) G.cloud = null; } else G.cloudK = 0;
      u.uCloud.value = G.cloudK;
      if (G.phase !== 'play' && G.phase !== 'intro') { G.day = Math.min(1, G.day + dt * 0.35); G.sun = Math.min(1, G.sun + dt * 0.25); }
      u.uDay.value = G.day; u.uSun.value = G.sun;
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      if (kind === 'down' || (kind === 'move' && G.touch)) { const p = G.S.toBoard(ev, G.root); if (p) G.touch = [p.u, p.v]; }
      if (kind === 'up') G.touch = null;
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'newday', playing: G.playing, over: G.over, phase: G.phase, cov: +G.cov.toFixed(2), cloud: !!G.cloud, sun: +G.sun.toFixed(2), t: +G.t.toFixed(1) }; },
    stop() { if (G) G.band.stop(); K.cleanup(G); G = null; },
  };
}
