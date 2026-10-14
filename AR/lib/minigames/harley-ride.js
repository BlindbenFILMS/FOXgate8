// BACK OF A HARLEY (Craig Ellis): RIDE BY FEEL.
// "I've seen a whole lot of this country on the back of a Harley." Craig can't see the road any more, but he can still
// feel the ride. The bike rides itself, its V-twin rumbling; the clouds stream past, the sunbeams pulse and his jacket
// ripples in the wind. One thing to do: your buddy rides out front and calls each curve ("Curve left!"), his bike
// sounding from that side. Lean that way (tilt the phone, or hold Left or Right). Lean well and it's a smooth swoosh;
// lean wrong and you hear the gravel, nothing worse. Every three curves the country changes: desert, coast, a summer
// rainstorm, then sunset. At the last stop, vehicles roar past: tap when the Harley goes by, the one with the right pipes.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/harley/';
const STRETCHES = [
  { id: 'desert', name: 'The desert', say: 'The desert. Hot wind on your face, and the smell of sage.', tint: [1.12, 0.96, 0.78] },
  { id: 'coast', name: 'The coast', say: 'The coast. Cool salt spray, and gulls overhead.', tint: [0.86, 1.0, 1.1] },
  { id: 'rain', name: 'Summer rain', say: 'A summer storm. Warm rain on your arms, and thunder rolling.', tint: [0.78, 0.84, 0.9] },
  { id: 'sunset', name: 'Sunset', say: 'Sunset. The air cools, and the whole sky glows.', tint: [1.16, 0.88, 0.8] },
];
const PER = 3;             // curves in each stretch
const CALL = 1.4;          // seconds between the call and the curve
const CURVE = 2.6;         // how long a curve lasts

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting on the road: the whole view banks as you lean, the clouds and the wheat stream past, the sunbeams pulse,
// his jacket ripples in the wind, and the light changes with each stretch of the country (with rain in the storm)
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, info;
uniform float uT, uA, uH, uRun, uLean, uRain, uFlare;
uniform vec3 uTint;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // bank with the lean (a little zoomed in so the edges never show)
  vec2 c = vec2(0.5), d = (p - c) * vec2(1.0, uH);
  float a = uLean * 0.06; d = mat2(cos(a), -sin(a), sin(a), cos(a)) * d / 1.07;
  p = c + d / vec2(1.0, uH);
  vec3 inf = at(info, p);
  // his jacket ripples in the wind
  vec2 s = p + vec2(sin(p.y * 70.0 - uT * 11.0), cos(p.x * 50.0 - uT * 9.0)) * 0.0022 * inf.g;
  vec3 col = at(map, s);
  // the sky and the wheat stream past (two copies, crossfaded, so it never runs out)
  if (inf.r > 0.01) {
    float sp = p.y > 0.76 ? 1.0 : 0.25, ph = fract(uRun * sp), ph2 = fract(uRun * sp + 0.5);
    float dx = p.y > 0.76 ? 0.12 : 0.05;
    vec3 w = at(map, p + vec2(ph * dx, 0.0)) * (1.0 - abs(2.0 * ph - 1.0)) + at(map, p + vec2(ph2 * dx, 0.0)) * (1.0 - abs(2.0 * ph2 - 1.0));
    col = mix(col, w, inf.r);
  }
  // the sunbeams pulse
  col += vec3(1.0, 0.9, 0.7) * inf.b * (0.08 + 0.06 * sin(uT * 1.6) + 0.35 * uFlare);
  // each stretch of the country has its own light
  col *= uTint;
  // rain: streaks and a grey veil
  if (uRain > 0.0) {
    vec2 r = vec2(p.x * 90.0 + p.y * 18.0, p.y * 9.0 + uT * 7.0);
    float drop = step(0.93, fract(sin(floor(r.x) * 12.9898) * 43758.5453)) * smoothstep(0.0, 0.3, fract(r.y + fract(sin(floor(r.x) * 7.1) * 99.0))) * (1.0 - smoothstep(0.3, 0.6, fract(r.y + fract(sin(floor(r.x) * 7.1) * 99.0))));
    col = mix(col, vec3(0.62, 0.66, 0.72), 0.18 * uRain) + drop * 0.35 * uRain;
  }
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the sound: a V-twin, the road, the country ───────────────────────── */
function road(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  // the V-twin: two quick firings, then a gap ("potato, potato"), through a growl and a low filter
  const firing = (() => {
    const N = 64, re = new Float32Array(N), im = new Float32Array(N);
    const pulse = ph => Math.exp(-Math.pow((ph % 1) * 14, 2)) + Math.exp(-Math.pow(((ph + 0.68) % 1) * 14, 2)) * 0.85;
    for (let k = 1; k < N; k++) { let a = 0, b = 0; for (let i = 0; i < 256; i++) { const ph = i / 256, v = pulse(ph); a += v * Math.cos(2 * Math.PI * k * ph); b += v * Math.sin(2 * Math.PI * k * ph); } re[k] = a / 128; im[k] = b / 128; }
    return ac.createPeriodicWave(re, im);
  })();
  function engine(gain, p) {
    const o = ac.createOscillator(); o.setPeriodicWave(firing); o.frequency.value = 14;
    const shaper = ac.createWaveShaper(), curve = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 255.5 - 1; curve[i] = Math.tanh(x * 3); } shaper.curve = curve;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 2;
    const g = ac.createGain(); g.gain.value = gain;
    const rumble = ac.createBufferSource(), rf = ac.createBiquadFilter(), rg = ac.createGain(); rumble.buffer = nb; rumble.loop = true; rf.type = 'lowpass'; rf.frequency.value = 160; rg.gain.value = gain * 0.4;
    const pn = ac.createStereoPanner ? ac.createStereoPanner() : null;
    const dest = pn ? (pn.pan.value = p, pn.connect(out), pn) : out;
    o.connect(shaper).connect(lp).connect(g).connect(dest); rumble.connect(rf).connect(rg).connect(dest);
    o.start(); rumble.start();
    return { o, lp, g, rg, pn, stop() { try { o.stop(); rumble.stop(); } catch (e) {} } };
  }
  let mine = null, buddy = null, wind = null, bed = null;
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  function loopNoise(type, freq, q) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; s.connect(f).connect(g).connect(out); s.start(); return { s, f, g }; }
  let ambT = null, place = '';
  function ambience() {
    const t = ac.currentTime + 0.05;
    if (place === 'coast' && Math.random() < 0.5) { const p = Math.random() * 1.6 - 0.8; [0, 0.18].forEach(d => tone(t + d, 1800 + Math.random() * 300, 0.18, { vol: 0.03, p, slide: 1300 })); }
    if (place === 'coast' && Math.random() < 0.3) noise(t, 2.2, { freq: 500, type: 'lowpass', vol: 0.12, att: 1, p: 0.6, sweep: 1400 });
    if (place === 'rain' && Math.random() < 0.12) noise(t, 3, { freq: 90, type: 'lowpass', vol: 0.35, att: 0.4, p: Math.random() - 0.5 });
    if (place === 'sunset' && Math.random() < 0.7) for (let k = 0; k < 3; k++) noise(t + k * 0.05 + Math.random() * 0.2, 0.025, { freq: 4400, q: 12, vol: 0.025, p: Math.random() - 0.5 });
    if (place === 'desert' && Math.random() < 0.25) noise(t, 1.5, { freq: 2500, q: 0.6, vol: 0.05, att: 0.6, p: Math.random() - 0.5 });
  }
  return {
    start() {
      mine = engine(0.5, 0); buddy = engine(0.18, 0); wind = loopNoise('bandpass', 700, 0.5); bed = loopNoise('highpass', 3000, 0.4);
      out.gain.setTargetAtTime(0.85, ac.currentTime, 0.3); wind.g.gain.setTargetAtTime(0.05, ac.currentTime, 1);
      // fire it up: a quick rev
      const t = ac.currentTime; mine.o.frequency.setValueAtTime(10, t); mine.o.frequency.linearRampToValueAtTime(30, t + 0.6); mine.o.frequency.linearRampToValueAtTime(22, t + 1.6);
      mine.lp.frequency.setValueAtTime(300, t); mine.lp.frequency.linearRampToValueAtTime(700, t + 0.6); mine.lp.frequency.linearRampToValueAtTime(480, t + 1.6);
      ambT = setInterval(ambience, 700);
    },
    // how hard the engine works, and where the buddy's bike is
    drive(rpm, buddyPan) {
      if (!mine) return; const t = ac.currentTime;
      mine.o.frequency.setTargetAtTime(18 + rpm * 16, t, 0.2); mine.lp.frequency.setTargetAtTime(380 + rpm * 420, t, 0.2);
      buddy.o.frequency.setTargetAtTime(19 + rpm * 15, t, 0.3); if (buddy.pn) buddy.pn.pan.setTargetAtTime(buddyPan, t, 0.3);
      wind.f.frequency.setTargetAtTime(500 + rpm * 500, t, 0.3);
    },
    place(id) { place = id; const t = ac.currentTime; bed.g.gain.setTargetAtTime(id === 'rain' ? 0.12 : 0, t, 1); bed.f.frequency.value = 3000; wind.g.gain.setTargetAtTime(id === 'desert' ? 0.09 : 0.05, t, 1); },
    swoosh(p) { noise(ac.currentTime + 0.01, 0.9, { freq: 600, q: 0.7, vol: 0.18, p, sweep: 2400, att: 0.3 }); },
    gravel(p) { const t = ac.currentTime + 0.01; for (let i = 0; i < 14; i++) noise(t + i * 0.05 + Math.random() * 0.03, 0.04, { freq: 2500 + Math.random() * 3000, q: 2, vol: 0.12, p }); },
    call(p) { tone(ac.currentTime + 0.01, 880, 0.12, { vol: 0.05, p }); tone(ac.currentTime + 0.14, 880, 0.12, { vol: 0.05, p }); },
    stopEngines(fade = 2) { const t = ac.currentTime; if (mine) { mine.g.gain.setTargetAtTime(0.0001, t, fade / 3); mine.rg.gain.setTargetAtTime(0.0001, t, fade / 3); } if (buddy) { buddy.g.gain.setTargetAtTime(0.0001, t, fade / 3); buddy.rg.gain.setTargetAtTime(0.0001, t, fade / 3); } wind.g.gain.setTargetAtTime(0, t, 0.6); },
    // something goes by, left to right: a car, a scooter, a truck, or the Harley
    passBy(kind) {
      const t = ac.currentTime + 0.05, dur = 3.2;
      const p = ac.createStereoPanner ? ac.createStereoPanner() : null, g = ac.createGain(); g.gain.value = 0.0001;
      if (p) { p.pan.setValueAtTime(-1, t); p.pan.linearRampToValueAtTime(1, t + dur); g.connect(p).connect(out); } else g.connect(out);
      g.gain.exponentialRampToValueAtTime(0.9, t + dur / 2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const drop = (f0, f1) => { const o = ac.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.setValueAtTime(f0, t + dur * 0.45); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6); return o; };
      if (kind === 'harley') {
        const o = drop(24, 19); o.setPeriodicWave(firing); const sh = ac.createWaveShaper(), c = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 255.5 - 1; c[i] = Math.tanh(x * 4); } sh.curve = c;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; const v = ac.createGain(); v.gain.value = 0.7; o.connect(sh).connect(lp).connect(v).connect(g); o.start(t); o.stop(t + dur);
      } else {
        const spec = { car: [110, 92, 'triangle', 0.25, 900], scooter: [260, 215, 'sawtooth', 0.12, 3000], truck: [58, 50, 'sawtooth', 0.3, 300] }[kind];
        const o = drop(spec[0], spec[1]); o.type = spec[2]; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = spec[4]; const v = ac.createGain(); v.gain.value = spec[3]; o.connect(lp).connect(v).connect(g); o.start(t); o.stop(t + dur);
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), tg = ac.createGain(); s.buffer = nb; f.type = 'bandpass'; f.frequency.value = kind === 'truck' ? 400 : 1200; tg.gain.value = kind === 'scooter' ? 0.05 : 0.18; s.connect(f).connect(tg).connect(g); s.start(t, Math.random()); s.stop(t + dur);
      }
      return dur;
    },
    yes() { const t = ac.currentTime + 0.05; [55, 62, 67, 71, 74].forEach((m, i) => tone(t + i * 0.1, 440 * Math.pow(2, (m - 57) / 12), 2, { type: 'triangle', vol: 0.06, att: 0.02 })); },
    volume(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.2); },
    stop() { clearInterval(ambT); try { mine && mine.stop(); buddy && buddy.stop(); wind && wind.s.stop(); bed && bed.s.stop(); } catch (e) {} out.gain.setTargetAtTime(0, ac.currentTime, 0.1); },
  };
}

export function rideByFeelGame() {
  let G = null;

  /* ── tilt to lean (works on iPhone and Android, any way up) ── */
  function sensors() {
    const M = G.mot = { ok: false, g: [0, 0, 0], s: 0, roll: 0, n: 0 };
    const on = (ev) => {
      const a = ev.accelerationIncludingGravity; if (!a || a.x == null) return;
      M.ok = true; M.n++;
      const ang = (((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
      const x = a.x * ca - a.y * sa, y = a.x * sa + a.y * ca, z = a.z || 0, k = M.n < 4 ? 1 : 0.2;
      M.g[0] += (x - M.g[0]) * k; M.g[1] += (y - M.g[1]) * k; M.g[2] += (z - M.g[2]) * k;
      const [gx, gy, gz] = M.g;
      if (Math.abs(gy) > 6) M.s = Math.sign(gy); else if (!M.s && Math.abs(gz) > 6) M.s = Math.sign(gz);
      M.roll = (Math.atan2(-(M.s || 1) * gx, Math.hypot(gy, gz)) * 180) / Math.PI;
    };
    addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
  }

  function stretch(i) {
    G.si = i; const st = STRETCHES[i]; G.road.place(st.id); G.tintTo = st.tint; G.rainTo = st.id === 'rain' ? 1 : 0;
    G.say(st.say); G.ui.alert(st.name, `${i + 1} of ${STRETCHES.length}`, 2.4, 'black'); G.nextCurve = 5;
  }
  function call() {
    const dir = Math.random() < 0.5 ? -1 : 1; G.curve = { dir, t: -CALL, good: 0, total: 0 };
    G.road.call(dir * 0.9); G.say(dir < 0 ? 'Curve left!' : 'Curve right!');
  }
  function endCurve() {
    const c = G.curve; G.curve = null; G.curves++;
    const ok = c.total > 0 && c.good / c.total > 0.55;
    if (ok) { G.smooth++; G.road.swoosh(c.dir * 0.6); G.ui.pop(['Smooth!', 'Nice line!', 'Like butter.', 'Beautiful.'][G.smooth % 4]); G.flare = 0.6; }
    else { G.road.gravel(c.dir * 0.8); G.ui.pop('A little gravel'); G.buzz([30, 30, 30]); }
    G.ui.panel('Ride by feel', `${G.smooth} <small>smooth of ${G.curves} curves</small>`, { segs: [G.curves, STRETCHES.length * PER] });
    if (G.curves % PER === 0) { if (G.si + 1 < STRETCHES.length) setTimeout(() => G && G.phase === 'ride' && stretch(G.si + 1), 1200); else setTimeout(() => G && lastStop(), 1500); }
    G.nextCurve = 2.2 + Math.random() * 1.5;
  }
  // the last stop: things go by; tap for the Harley
  function lastStop() {
    G.phase = 'stop'; G.road.stopEngines(2.5); G.lean = 0;
    G.say('Last stop. A diner at sunset. Kick back and listen: cars and bikes are going by. Tap when you hear the Harley, the one with the right pipes.');
    G.ui.panel('The right pipes', 'Tap when the Harley goes by', {});
    G.ui.buttons([{ label: 'That’s the Harley!', icon: '🏍', kind: 'red', aria: 'That is the Harley', press: () => guess() }]);
    G.passes = shuffle(['car', 'scooter', 'truck']).slice(0, 2 + (G.tries || 0)); G.passes.splice(Math.floor(Math.random() * (G.passes.length + 1)), 0, 'harley');
    G.passI = -1; G.passT = 9;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function guess() {
    if (G.phase !== 'stop' || !G.passing) return;
    if (G.passing.kind === 'harley' && G.passing.t > 0.4) {
      G.phase = 'done'; G.road.yes(); G.flare = 1.4; G.buzz([60, 40, 120]);
      G.say('That’s it. The right pipes.');
      setTimeout(() => G && finish(true), 3500);
    } else {
      G.wrong = (G.wrong || 0) + 1; G.say({ car: 'That was a car.', scooter: 'That was a scooter.', truck: 'That was a truck.' }[G.passing.kind] || 'Not that one.'); G.passing.guessed = true;
    }
  }
  function finish(won) {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Ride by feel', title: 'Coast to coast', line: G.work && G.work.quote,
      cells: [{ k: 'Smooth curves', v: `${G.smooth}/${G.curves}` }, { k: 'The right pipes', v: won ? '✓' : '–' }],
      say: 'Coast to coast. ' + ((G.work && G.work.quote) || '') });
  }
  function buttons() {
    const el = G.ui.buttons([
      { label: 'Lean', icon: '◀', aria: 'Lean left (hold)', press: () => {} },
      { label: 'Lean', icon: '▶', aria: 'Lean right (hold)', press: () => {} },
    ]);
    if (el) el.forEach((b, i) => {
      const d = i ? 1 : -1, on = () => { G.hold = d; }, off = () => { if (G && G.hold === d) G.hold = 0; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
  }

  return {
    title: 'Ride by feel',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', si: -1, curve: null, curves: 0, smooth: 0, lean: 0, hold: 0, drag: null, run: 0, rpm: 0.4, tint: [1, 1, 1], tintTo: [1, 1, 1], rain: 0, rainTo: 0, flare: 0, nextCurve: 99, botT: 0 });
      G.road = road(K.audio());
      G.uni = { map: { value: null }, info: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRun: { value: 0 }, uLean: { value: 0 }, uRain: { value: 0 }, uFlare: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 2; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'info.png', 'info');
      sensors();
      G.onGo = () => { G.phase = 'ride'; G.road.start(); buttons(); G.ui.panel('Ride by feel', `0 <small>smooth of 0 curves</small>`, { segs: [0, STRETCHES.length * PER] }); setTimeout(() => G && stretch(0), 1800); };
      K.intro(G, { title: 'Ride by feel', how: 'Craig rides by feel now. Your buddy out front calls each curve. Lean that way: tilt the phone, or hold Left or Right.',
        say: 'Ride by feel. Craig has seen a whole lot of this country on the back of a Harley, and he still rides by feel. Your buddy rides out front and calls each curve, and you’ll hear his bike from that side. Lean that way: tilt your phone, or hold Left or Right. That’s all. Enjoy the ride.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // your lean: tilt, the buttons, or a drag
      let want = G.hold;
      if (G.mot && G.mot.ok && Math.abs(G.mot.roll) > 4) want = Math.max(-1, Math.min(1, G.mot.roll / 22));
      if (G.drag) want = G.drag.lean;
      if (G.bot && G.curve && G.curve.t > -0.3) want = G.curve.dir; else if (G.bot) want = 0;
      G.lean += (want - G.lean) * Math.min(1, dt * 5);
      // the road
      if (G.phase === 'ride') {
        G.run += dt * 0.55; u.uRun.value = G.run;
        if (G.si >= 0) {
          if (!G.curve) { G.nextCurve -= dt; if (G.nextCurve <= 0 && G.curves < STRETCHES.length * PER && G.curves < (G.si + 1) * PER) call(); }
          else {
            const c = G.curve; c.t += dt;
            if (c.t > 0) { c.total += dt; if (Math.sign(G.lean) === c.dir && Math.abs(G.lean) > 0.35) c.good += dt; }
            if (c.t > CURVE) endCurve();
          }
        }
        const into = G.curve && G.curve.t > 0 ? 1 : 0;
        G.rpm += ((0.55 + 0.25 * into - 0.15 * (G.curve && G.curve.t > 0 && Math.sign(G.lean) !== G.curve.dir ? 1 : 0)) - G.rpm) * Math.min(1, dt * 1.5);
        G.road.drive(G.rpm, G.curve ? G.curve.dir * 0.85 : Math.sin(G.t * 0.3) * 0.2);
      }
      // the view banks: your lean, plus the road's own curve
      const bank = G.lean * 0.8 + (G.curve && G.curve.t > 0 ? G.curve.dir * 0.4 * Math.sin(Math.min(1, G.curve.t / CURVE) * Math.PI) : 0);
      u.uLean.value += (bank - u.uLean.value) * Math.min(1, dt * 4);
      for (let k = 0; k < 3; k++) G.tint[k] += (G.tintTo[k] - G.tint[k]) * Math.min(1, dt * 0.8);
      u.uTint.value.set(...G.tint);
      G.rain += (G.rainTo - G.rain) * Math.min(1, dt * 0.8); u.uRain.value = G.rain;
      G.flare = Math.max(0, G.flare - dt * 0.6); u.uFlare.value = G.flare;
      // the last stop: things go by, one after another
      if (G.phase === 'stop') {
        if (G.passing) { G.passing.t += dt; if (G.passing.t > G.passing.dur + 0.6) { if (G.passing.kind === 'harley') G.missed = true; G.passing = null; } }
        else { G.passT -= dt; if (G.passT <= 0) {
          G.passI++;
          if (G.passI >= G.passes.length) { G.tries = (G.tries || 0) + 1; if (G.tries >= 2) { G.say('That was the Harley, the low potato potato rumble.'); setTimeout(() => G && finish(false), 3000); G.phase = 'done'; } else { G.say('Let’s listen again. The Harley has a low, lumpy rumble: potato, potato.'); G.passes = shuffle(['car', 'scooter', 'truck', 'harley']); G.passI = -1; G.passT = 4; } }
          else { const kind = G.passes[G.passI]; G.passing = { kind, t: 0, dur: G.road.passBy(kind) }; G.passT = 1.2; }
        } }
        if (G.bot && G.passing && G.passing.kind === 'harley' && G.passing.t > 1) guess();
      }
    },
    pointer(kind, ev) {
      if (!G) return;
      if (G.phase === 'stop' && kind === 'down') { guess(); return; }
      if (G.phase !== 'ride') return;
      if (kind === 'down') G.drag = { x0: ev.clientX, lean: 0 };
      if (kind === 'move' && G.drag) G.drag.lean = Math.max(-1, Math.min(1, (ev.clientX - G.drag.x0) / (innerWidth * 0.25)));
      if (kind === 'up') G.drag = null;
    },
    pause() { if (G) { G.paused = true; G.road.volume(0); } },
    resume() { if (G) { G.paused = false; G.road.volume(0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'harley', playing: G.playing, over: G.over, phase: G.phase, stretch: G.si, curves: G.curves, smooth: G.smooth, curve: G.curve && G.curve.dir, lean: +G.lean.toFixed(2),
      passing: G.passing && G.passing.kind, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.road.stop(); G.offMotion && G.offMotion(); } K.cleanup(G); G = null; },
  };
}
