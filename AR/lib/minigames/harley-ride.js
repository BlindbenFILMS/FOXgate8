// BACK OF A HARLEY (Craig Ellis): RIDE BY FEEL (polished 5 Nov 2026).
// "I've seen a whole lot of this country on the back of a Harley." Craig can't see the road any more, but he can still
// feel the ride. The bike rides itself, its V-twin rumbling; the clouds stream past, the sunbeams pulse and his jacket
// ripples in the wind. One thing to do: your buddy rides out front and calls each curve ("Curve left!"), his bike
// sounding from that side, and a big yellow curve sign swings in on that side. Hold Left or Right (or hold that side of
// the screen) to lean. Lean well and it's a smooth swoosh; lean wrong and you hear the gravel, nothing worse. Two
// curves in each place: the desert, the coast, a summer rainstorm, then sunset. At the last stop, bikes and cars go
// by: tap when the Harley goes by, the one with the right pipes. Then Craig, in his own words.
import * as THREE from 'three';
import * as K from './kit.js';
import { aboveHud } from './craig-hud.js';
import { curveLeftTex, curveRightTex, glowTex, SCENES } from './harley-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_47.mp3', import.meta.url).href;   // Craig, in his own words
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/harley/';
const STRETCHES = [
  { id: 'desert', name: 'The desert', say: 'The desert. Hot wind on your face, and the smell of sage.', tint: [1.12, 0.96, 0.78] },
  { id: 'coast', name: 'The coast', say: 'The coast. Cool salt spray, and gulls overhead.', tint: [0.86, 1.0, 1.1] },
  { id: 'rain', name: 'Summer rain', say: 'A summer storm. Warm rain on your arms, and thunder rolling.', tint: [0.78, 0.84, 0.9] },
  { id: 'sunset', name: 'Sunset', say: 'Sunset. The air cools, and the whole sky glows.', tint: [1.16, 0.88, 0.8] },
];
const PER = 2;             // curves in each stretch
const CALL = 1.4;          // seconds between the call and the curve
const CURVE = 2.6;         // how long a curve lasts

// Every sentence is fixed so Ben can record it once.
const L = {
  intro: 'Ride by feel. Craig has seen a whole lot of this country on the back of a Harley, and he still rides by feel. Your buddy rides out front and calls each curve, and you’ll hear his bike from that side. Hold Left or Right to lean that way. That’s all. Enjoy the ride.',
  left: 'Curve left!', right: 'Curve right!',
  stop: 'Last stop. A diner at sunset. Kick back and listen: cars and bikes are going by. Tap when you hear the Harley, the one with the right pipes.',
  yes: 'That’s it. The right pipes.',
  was: { car: 'That was a car.', scooter: 'That was a scooter.', truck: 'That was a truck.' },
  again: 'Let’s listen again. The Harley has a low, lumpy rumble: potato, potato.',
  reveal: 'That was the Harley, the low potato potato rumble.',
  end: 'Coast to coast.',
};
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting on the road: Craig and his Harley (cut out with the mask in info.png) really lean into each curve,
// tipping together from where the tyres meet the road. Behind him the world is rebuilt so it can move: the clouds
// drift past (taken from the clear sky to his right, mirrored so they never run out, with soft wisps racing over
// them), the moon stays put, the distant country for each place slides by (a far strip of hills, mesas or sea), and
// the wheat streams past below the horizon. The sunbeams pulse, his jacket ripples in the wind, and in the storm
// the rain comes in slanting layers, the light goes grey and lightning flashes.
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, info, scene, skyTex;
uniform float uT, uA, uH, uRun, uLean, uRide, uRain, uFlare, uFlash, uScene;
uniform vec3 uTint;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec2 rot(vec2 p, vec2 c, float a){ vec2 d = (p - c) * vec2(1.0, uH); d = mat2(cos(a), -sin(a), sin(a), cos(a)) * d; return c + d / vec2(1.0, uH); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
const float HZ = 0.79;
// the world behind Craig, rebuilt so it can move
vec3 world(vec2 p){
  vec3 col;
  if (p.y > HZ) {
    // the wheat: taken from the field at the left edge, mirrored, streaming past faster the nearer it is
    float near = (p.y - HZ) / (1.0 - HZ);
    float s = fract(p.x * 2.2 + uRun * (0.4 + 3.2 * near));
    col = at(map, vec2(0.006 + 0.068 * abs(2.0 * s - 1.0), max(p.y, 0.79)));
  } else {
    // the clouds drift by: a clean copy of the painting's sky (sky.jpg, with Craig and the moon painted out) slides
    // past and wraps round, so the space behind him is always real sky
    col = texture2D(skyTex, vec2(p.x + uRun * 0.035, 1.0 - min(p.y, 0.78))).rgb;
    // soft wisps racing over them
    float w = fbm(vec2(p.x * 3.0 + uRun * 0.5, p.y * 7.0)) ;
    col = mix(col, vec3(0.96, 0.9, 0.78), smoothstep(0.55, 0.8, w) * 0.25 * (1.0 - smoothstep(0.55, 0.75, p.y)));
    // the moon stays where it is
    vec2 mo = (p - vec2(0.152, 0.168)) * vec2(1.0, uH);
    col = mix(col, at(map, p), 1.0 - smoothstep(0.046, 0.06, length(mo)));
    // the distant country slides by, slower than the wheat
    vec2 sc = vec2(p.x * 0.5 + uRun * 0.07, (p.y - 0.60) / 0.20);
    if (sc.y > 0.0) { vec4 c = texture2D(scene, vec2(sc.x, 1.0 - sc.y)); col = mix(col, c.rgb, c.a * uScene); }
  }
  return col;
}
void main(){
  vec2 p0 = vec2(vUv.x, 1.0 - vUv.y), c = vec2(0.5);
  vec2 pz = c + (p0 - c) / 1.08;                        // a little zoomed in so the edges never show
  // Craig and his bike lean together, tipping from where the tyres meet the road
  vec2 pf = rot(pz, vec2(0.56, 1.12), uRide);
  vec3 infF = at(info, pf);
  float fig = 1.0 - smoothstep(0.35, 0.65, infF.r);
  vec2 sf = pf + vec2(sin(pf.y * 70.0 - uT * 11.0), cos(pf.x * 50.0 - uT * 9.0)) * 0.0022 * infF.g;   // his jacket ripples
  vec3 col = at(map, sf);
  // wet in the rain: his highlights catch the light
  col += uRain * 0.16 * smoothstep(0.45, 0.85, dot(col, vec3(0.33))) * vec3(0.9, 0.95, 1.0);
  if (fig < 0.999) {
    // the world behind him banks a little, the other way
    vec2 pb = rot(pz, c, -uLean * 0.035);
    vec3 bg = world(pb);
    bg += vec3(1.0, 0.9, 0.7) * at(info, pb).b * (0.08 + 0.06 * sin(uT * 1.6) + 0.35 * uFlare) * (1.0 - uRain * 0.8);   // the sunbeams pulse
    bg += vec3(0.85, 0.9, 1.0) * uFlash * 0.55 * (1.0 - smoothstep(0.6, 0.85, pb.y));                                   // lightning lights the sky
    col = mix(bg, col, fig);
  }
  col *= uTint;
  // the storm: the light goes grey and cool, rain falls in slanting layers, and lightning flashes over everything
  if (uRain > 0.001) {
    col = mix(col, col * vec3(0.72, 0.78, 0.86) + vec3(0.04, 0.05, 0.06), uRain * 0.6);
    float rain = 0.0;
    for (int k = 0; k < 3; k++) {
      float fk = float(k), sc = 34.0 + fk * 28.0, sp = 2.6 - fk * 0.6, len = 0.16 - fk * 0.04;
      vec2 r = vec2((p0.x + p0.y * (0.28 - fk * 0.05)) * sc, p0.y * 3.0);
      float col_i = floor(r.x), off = hash(vec2(col_i, fk));
      float y = fract(r.y * 0.33 + uT * sp * (0.8 + 0.4 * off) + off * 7.0);
      float streak = smoothstep(1.0 - len, 1.0, y) * (1.0 - smoothstep(0.0, 0.18 + fk * 0.08, abs(fract(r.x) - 0.5) * 2.0));
      rain += streak * (0.5 - fk * 0.12) * step(0.45, hash(vec2(col_i, fk + 9.0)));
    }
    col += vec3(0.8, 0.85, 0.92) * rain * uRain * 0.55;
    // a soft mist low down
    col = mix(col, vec3(0.7, 0.74, 0.78), uRain * 0.12 * smoothstep(0.5, 1.0, p0.y));
  }
  col += vec3(0.9, 0.93, 1.0) * uFlash * 0.18;
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
    if (place === 'rain' && Math.random() < 0.04) noise(t, 3, { freq: 80, type: 'lowpass', vol: 0.18, att: 0.6, p: Math.random() - 0.5 });
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
    thunder() { const t = ac.currentTime + 0.5 + Math.random() * 0.5, p = Math.random() * 1.2 - 0.6; noise(t, 3.4, { freq: 110, type: 'lowpass', vol: 0.45, att: 0.08, p }); noise(t + 0.1, 1.2, { freq: 900, q: 0.6, vol: 0.06, att: 0.02, p, sweep: 200 }); },
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

  function stretch(i) {
    G.si = i; const st = STRETCHES[i]; G.road.place(st.id); G.tintTo = st.tint; G.rainTo = st.id === 'rain' ? 1 : 0;
    G.sceneNext = SCENES[st.id]; G.flashT = st.id === 'rain' ? 3 : 0;
    G.say(st.say); G.ui.alert(st.name, `${i + 1} of ${STRETCHES.length}`, 2.4, 'black'); G.nextCurve = 5;
  }
  function call() {
    const dir = G.curves % 2 === 0 ? (Math.random() < 0.5 ? -1 : 1) : -G.lastDir; G.lastDir = dir; G.curve = { dir, t: -CALL, good: 0, total: 0 };
    G.road.call(dir * 0.9); G.say(dir < 0 ? L.left : L.right);
    G.sign.material.map = dir < 0 ? curveLeftTex : curveRightTex; G.sign.material.needsUpdate = true; G.signDir = dir; G.signK = 0;
  }
  function endCurve() {
    const c = G.curve; G.curve = null; G.curves++;
    const ok = c.total > 0 && c.good / c.total > 0.55;
    if (ok) { G.smooth++; G.road.swoosh(c.dir * 0.6); G.ui.alert(['Smooth!', 'Nice line!', 'Like butter.', 'Beautiful.'][G.smooth % 4], '', 1.2, 'blue'); G.flare = 0.6; G.buzz([20]); }
    else { G.road.gravel(c.dir * 0.8); G.ui.alert('A little gravel', c.dir < 0 ? 'That one went left' : 'That one went right', 1.6, 'black'); G.buzz([30, 30, 30]); }
    G.ui.panel('Smooth curves', `${G.smooth} <small>of ${STRETCHES.length * PER}</small>`, { segs: [G.curves, STRETCHES.length * PER] });
    if (G.curves % PER === 0) { if (G.si + 1 < STRETCHES.length) setTimeout(() => G && G.phase === 'ride' && stretch(G.si + 1), 1200); else setTimeout(() => G && lastStop(), 1500); }
    G.nextCurve = 2.2 + Math.random() * 1.5;
  }
  // the last stop: things go by; tap for the Harley
  function lastStop() {
    G.phase = 'stop'; G.road.stopEngines(2.5); G.lean = 0;
    G.say(L.stop);
    G.ui.panel('The right pipes', 'Tap when the Harley goes by', {});
    { const el = G.ui.buttons([{ label: 'That’s the Harley!', kind: 'red', aria: 'That is the Harley', press: () => guess() }]); if (el) el.forEach(b => Object.assign(b.style, { height: '72px', fontSize: '20px' })); }
    G.passes = shuffle(['car', 'scooter', 'truck']).slice(0, 2 + (G.tries || 0)); G.passes.splice(Math.floor(Math.random() * (G.passes.length + 1)), 0, 'harley');
    G.passI = -1; G.passT = 1; G.waitSay = true;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function guess() {
    if (G.phase !== 'stop' || !G.passing) return;
    if (G.passing.kind === 'harley' && G.passing.t > 0.4) {
      G.phase = 'done'; G.road.yes(); G.flare = 1.4; G.buzz([60, 40, 120]);
      G.say(L.yes); G.ui.alert('The right pipes', '', 2.4, 'red');
      G.finAt = G.t + 3.5; G.finWon = true;
    } else {
      G.wrong = (G.wrong || 0) + 1; if (G.passing.guessed || G.passing.kind === 'harley') return; G.say(L.was[G.passing.kind]); G.passing.guessed = true; G.road.nope && G.road.nope();
    }
  }
  function finish(won) {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Ride by feel', title: 'Coast to coast', line: G.work && G.work.quote,
      cells: [{ k: 'Smooth curves', v: `${G.smooth}/${G.curves}` }, { k: 'The right pipes', v: won ? '✓' : '–' }],
      say: L.end });
    G.overT = 0;
  }
  function buttons() {
    const el = G.ui.buttons([
      { label: 'Left', icon: '◀', aria: 'Lean left (hold)', press: () => { if (G) G.hold = -1; }, release: () => { if (G && G.hold === -1) G.hold = 0; } },
      { label: 'Right', icon: '▶', aria: 'Lean right (hold)', press: () => { if (G) G.hold = 1; }, release: () => { if (G && G.hold === 1) G.hold = 0; } },
    ]);
    if (el) el.forEach(b => Object.assign(b.style, { height: '72px', fontSize: '20px' }));
  }

  return {
    title: 'Ride by feel',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      G.hud = aboveHud(G);   // the score panel and pop-ups sit above the painting, as wide as it
      Object.assign(G, { sceneA: 0, sceneNext: null, flash: 0, flash2: 0, flashT: 0, overT: 0, artist: null, musicBack: false, lastDir: 1, finAt: 0, finWon: false, waitSay: false, phase: 'intro', si: -1, curve: null, curves: 0, smooth: 0, lean: 0, hold: 0, drag: null, run: 0, rpm: 0.4, tint: [1, 1, 1], tintTo: [1, 1, 1], rain: 0, rainTo: 0, flare: 0, nextCurve: 99, botT: 0 });
      G.road = road(K.audio());
      G.uni = { map: { value: null }, info: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRun: { value: 0 }, uLean: { value: 0 }, uRide: { value: 0 }, scene: { value: SCENES.desert }, skyTex: { value: null }, uScene: { value: 0 }, uFlash: { value: 0 }, uRain: { value: 0 }, uFlare: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const TL = new THREE.TextureLoader(); let need = 3; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => TL.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'info.png', 'info');
      TL.load(ART + 'sky.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; t.wrapS = THREE.RepeatWrapping; G.uni.skyTex.value = t; ok(); });
      // the curve sign that swings in on the side of the curve
      G.signGlow = K.sprite(glowTex, 0.48, { additive: true, order: 24, opacity: 0 }); G.root.add(G.signGlow);
      G.sign = K.sprite(curveLeftTex, 0.26, { order: 25, opacity: 0 }); G.root.add(G.sign); G.signDir = -1; G.signK = 0;
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.onGo = () => { G.phase = 'ride'; G.road.start(); buttons(); G.ui.panel('Smooth curves', `0 <small>of ${STRETCHES.length * PER}</small>`, { segs: [0, STRETCHES.length * PER] }); setTimeout(() => G && stretch(0), 1800); };
      K.intro(G, { title: 'Ride by feel', how: 'Craig rides by feel now. Your buddy out front calls each curve. Hold Left or Right to lean that way.', say: L.intro });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.hud.update();
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // your lean: tilt, the buttons, or a drag
      let want = G.hold || G.touch || 0;
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
      // Craig leans with you (up to about 8 degrees), with a gentle sway on the straights
      const ride = G.lean * 0.14 + Math.sin(G.t * 0.9) * 0.01;
      u.uRide.value += (ride - u.uRide.value) * Math.min(1, dt * 5);
      for (let k = 0; k < 3; k++) G.tint[k] += (G.tintTo[k] - G.tint[k]) * Math.min(1, dt * 0.8);
      u.uTint.value.set(...G.tint);
      G.rain += (G.rainTo - G.rain) * Math.min(1, dt * 0.8); u.uRain.value = G.rain;
      // the distant country: fade the old place out, swap in the new one, fade it in
      if (G.sceneNext) { G.sceneA = Math.max(0, (G.sceneA || 0) - dt * 2); if (G.sceneA <= 0) { u.scene.value = G.sceneNext; G.sceneNext = null; } }
      else G.sceneA = Math.min(1, (G.sceneA || 0) + dt * 0.8);
      u.uScene.value = G.sceneA;
      // lightning in the storm, with thunder a moment later
      G.flash = Math.max(0, (G.flash || 0) - dt * 3.2);
      if (G.rain > 0.6 && G.si >= 0 && STRETCHES[G.si].id === 'rain' && G.phase === 'ride') { G.flashT -= dt; if (G.flashT <= 0) { G.flashT = 6 + Math.random() * 5; G.flash = 1; G.flash2 = 0.18; G.road.thunder && G.road.thunder(); } }
      if (G.flash2 > 0) { G.flash2 -= dt; if (G.flash2 <= 0) G.flash = Math.max(G.flash, 0.7); }
      u.uFlash.value = G.flash;
      G.flare = Math.max(0, G.flare - dt * 0.6); u.uFlare.value = G.flare;
      // the curve sign swings in on its side, bobs while the curve is on, then slides away
      const signOn = G.curve ? 1 : 0; G.signK += (signOn - G.signK) * Math.min(1, dt * (signOn ? 6 : 3));
      { const k = G.signK, [sx, sy] = G.S.P(0.5 + G.signDir * (0.64 - 0.29 * k), 0.6 + Math.sin(G.t * 3) * 0.006);
        G.sign.position.set(sx, sy, 0.07); G.signGlow.position.set(sx, sy, 0.065);
        const pulse = G.curve && G.curve.t < 0 ? 0.5 + 0.5 * Math.sin(G.t * 14) : 1;
        G.sign.material.opacity = k; G.signGlow.material.opacity = k * (0.35 + 0.4 * pulse);
        G.sign.material.rotation = -G.signDir * 0.06 * Math.sin(G.t * 2.2) - u.uLean.value * 0.05; G.sign.scale.setScalar(0.3 * (0.85 + 0.15 * k)); }
      // the finale: Craig in his own words, with the engines quiet
      if (G.finAt && G.t > G.finAt && !G.over) { const w = G.finWon; G.finAt = 0; finish(w); }
      if (G.over) {
        G.overT += dt;
        if (G.overT > 2.5 && !G.artist && !(G.say.busy && G.say.busy() && !G.bot)) {
          try { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); } catch (e) { G.artist = { pause() {} }; }
        }
      }
      // the last stop: things go by, one after another
      if (G.phase === 'stop') {
        if (G.passing) { G.passing.t += dt; if (G.passing.t > G.passing.dur + 0.6) { if (G.passing.kind === 'harley') G.missed = true; G.passing = null; } }
        else { G.passT -= dt; if (G.waitSay && !G.bot && G.say.busy && G.say.busy()) G.passT = Math.max(G.passT, 0.8); else G.waitSay = false; if (G.passT <= 0) {
          G.passI++;
          if (G.passI >= G.passes.length) { G.tries = (G.tries || 0) + 1; if (G.tries >= 2) { G.say(L.reveal); G.phase = 'done'; G.finAt = G.t + 4; G.finWon = false; } else { G.say(L.again); G.passes = shuffle(['car', 'scooter', 'truck', 'harley']); G.passI = -1; G.passT = 1; G.waitSay = true; } }
          else { const kind = G.passes[G.passI]; G.passing = { kind, t: 0, dur: G.road.passBy(kind) }; G.passT = 1.4; }
        } }
        if (G.bot && G.passing && G.passing.kind === 'harley' && G.passing.t > 1) guess();
      }
      G.hud.update();
    },
    pointer(kind, ev) {
      if (!G) return;
      if (G.phase === 'stop' && kind === 'down') { guess(); return; }
      if (G.phase !== 'ride') { G.touch = 0; return; }
      if (kind === 'down') G.touch = ev.clientX < innerWidth / 2 ? -1 : 1;
      if (kind === 'up') G.touch = 0;
    },
    pause() { if (G) { G.paused = true; G.hold = G.touch = 0; G.road.volume(0); if (G.artist) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; G.road.volume(0.85); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'harley', playing: G.playing, over: G.over, phase: G.phase, stretch: G.si, curves: G.curves, smooth: G.smooth, curve: G.curve && G.curve.dir, lean: +G.lean.toFixed(2),
      passing: G.passing && G.passing.kind, sign: G.signDir, signK: +G.signK.toFixed(2), flash: +(G.flash || 0).toFixed(2), artist: !!(G.artist && G.artist.currentTime > 0), artistT: G.artist ? +(G.artist.currentTime || 0).toFixed(1) : 0, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.hud) G.hud.remove(); if (G) { G.road.stop(); if (G.artist) { try { G.artist.pause(); } catch (e) {} G.artist = null; } } K.cleanup(G); G = null; },
  };
}
