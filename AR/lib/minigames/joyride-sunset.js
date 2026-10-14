// JOYRIDE (Shardasia Hadley): SUNSET JOYRIDE.
// Shardasia and her mom cruise a palm-lined boulevard into the sunset. "She tries to see the world through my
// perspective." You're Mom, at the wheel. The road really rolls toward you, palms stream past, their hair blows in
// the wind and they bob to the radio. Tilt the phone (or hold Left and Right) to keep the car in its lane as the
// boulevard curves. The little radio panel switches between three stations (Sunset Lofi, Neon Drive, Golden Soul),
// and the whole sky changes with each one. Along the way things pass by (palm trees, the ocean, the ice cream truck,
// Grandma's house) and Shardasia asks "Mom, what's that?" Pick the description that helps her see it her way:
// sounds, feelings and smells. Six moments, then you drive right into the sun.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/joyride/';
const MOMENTS = [
  { id: 'palms', emoji: '🌴', side: -1, snd: 'rustle', good: 'Tall, skinny palm trees, with big leaves on top that rustle like rain in the wind.', bad: 'Some green trees.', hint: 'What do they sound like?' },
  { id: 'ocean', emoji: '🌊', side: 1, snd: 'waves', good: 'The ocean! Hear the waves rolling in? Smell the salt in the air?', bad: 'Blue water over there.', hint: 'Can I hear it? Can I smell it?' },
  { id: 'icecream', emoji: '🍦', side: -1, snd: 'jingle', good: 'The ice cream truck! Hear its song? Cold and sweet: your favourite, strawberry.', bad: 'A white truck.', hint: 'What’s that song?' },
  { id: 'dog', emoji: '🐕', side: 1, snd: 'woof', good: 'A big fluffy dog with its head out the car window, ears flapping in the wind, just like your curls!', bad: 'A brown dog.', hint: 'What’s it doing?' },
  { id: 'grandma', emoji: '🏡', side: -1, snd: 'chimes', good: 'Grandma’s house: the wind chimes on her porch, and it smells like her sweet potato pie.', bad: 'A yellow house.', hint: 'Whose house? What does it smell like?' },
  { id: 'sun', emoji: '🌅', side: 0, snd: 'warm', good: 'The sun is going down. It feels warm on your face, like a big hug, and the whole sky is glowing.', bad: 'It’s orange.', hint: 'How does it feel?' },
];
const STATIONS = [
  { id: 'lofi', freq: '88.1', name: 'Sunset Lofi', bpm: 80 },
  { id: 'neon', freq: '96.5', name: 'Neon Drive', bpm: 100 },
  { id: 'soul', freq: '101.3', name: 'Golden Soul', bpm: 90 },
];
const GAP = 11;   // seconds of cruising between moments

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting on the move: the world (road, palms, trees) flows past from the horizon, shifts as the car drifts in
// its lane, their hair blows in the wind and they bob to the music; the sky takes on the radio station's colours,
// and at the end the sun swells as they drive right into it
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, world, info, thing, car;
uniform vec4 uThing;   // a thing by the road: u, v, size, opacity
uniform float uT, uA, uH, uRun, uOff, uBob, uNeon, uGold, uSunset, uRumble;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 VP = vec2(0.505, 0.5);
vec3 flowing(vec2 p, float w){
  // two copies of the world zooming out from the horizon, crossfaded, so the road seems to roll on forever
  float ph = fract(uRun), ph2 = fract(uRun + 0.5);
  vec2 q = p; q.x -= uOff * (0.25 + max(0.0, p.y - 0.47) * 1.6) * w;
  vec2 s1 = VP + (q - VP) * pow(0.8, ph), s2 = VP + (q - VP) * pow(0.8, ph2);
  return at(world, s1) * (1.0 - abs(2.0 * ph - 1.0)) + at(world, s2) * (1.0 - abs(2.0 * ph2 - 1.0));
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  p += vec2(sin(uT * 37.0), cos(uT * 29.0)) * 0.0012 * uRumble;   // the rumble strip
  vec3 inf = at(info, p);
  // hair in the wind, and heads bobbing to the radio
  vec2 s = p;
  s.x += sin(p.y * 90.0 - uT * 14.0) * 0.0028 * inf.g * smoothstep(0.62, 0.45, p.y);
  s.y -= uBob * 0.004 * inf.g;
  vec2 c = vec2(0.67, 0.525), d = p - c;
  s += normalize(d + 0.0001) * sin(atan(d.y, d.x) * 9.0 + uT * 11.0) * 0.0018 * inf.b;
  s.y -= uBob * 0.004 * inf.b;
  vec3 col = at(map, s);
  float w = inf.r;
  if (w > 0.01) col = mix(col, flowing(p, w), w);
  // the thing by the road, behind the car and the two of them
  if (uThing.w > 0.0) {
    vec2 tq = (p - uThing.xy) * vec2(1.0, uH) / uThing.z + 0.5;
    if (tq.x > 0.0 && tq.x < 1.0 && tq.y > 0.0 && tq.y < 1.0) {
      vec4 e = texture2D(thing, vec2(tq.x, 1.0 - tq.y));
      float open = 1.0 - at(car, p).r;
      col = mix(col, e.rgb, e.a * uThing.w * open);
    }
  }
  // the sky takes the station's colours: Neon Drive goes magenta with a striped sun, Golden Soul goes gold
  float sky = (1.0 - w) * smoothstep(0.55, 0.45, p.y) * (1.0 - inf.g) * (1.0 - inf.b);
  vec2 sp = (p - vec2(0.505, 0.365)) * vec2(1.0, uH);
  float sun = 1.0 - smoothstep(0.078, 0.09, length(sp));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 neon = mix(vec3(0.16, 0.05, 0.3), vec3(1.0, 0.25, 0.75), smoothstep(0.15, 0.85, l)) + vec3(0.2, 0.15, 0.0) * sun;
  float stripes = step(0.5, fract((p.y - 0.36) * 70.0)) * step(0.375, p.y) * sun;
  neon = mix(neon, vec3(0.16, 0.05, 0.3), stripes);
  vec3 gold = mix(vec3(0.35, 0.16, 0.05), vec3(1.0, 0.86, 0.45), smoothstep(0.1, 0.9, l));
  float neonA = uNeon, goldA = uGold;
  col = mix(col, neon, neonA * sky * 0.85);
  col = mix(col, col * vec3(1.05, 0.75, 1.15), neonA * (1.0 - sky) * 0.5);
  col = mix(col, gold, goldA * sky * 0.6);
  col = mix(col, col * vec3(1.12, 0.98, 0.78), goldA * (1.0 - sky) * 0.4);
  // the sun breathes, and at the end swells to fill the sky
  float glow = exp(-length(sp) * (9.0 - 6.0 * uSunset)) * (0.18 + 0.05 * sin(uT * 1.7));
  col += vec3(1.0, 0.8, 0.5) * glow * sky;
  col = mix(col, vec3(1.0, 0.93, 0.78), uSunset * smoothstep(0.35 + uSunset * 0.4, 0.0, length(sp)));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the radio: three stations ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function radio(ac) {
  const out = ac.createGain(); out.gain.value = 0;
  const tone_ = ac.createBiquadFilter(); tone_.type = 'lowpass'; tone_.frequency.value = 5200; out.connect(tone_).connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, dest = out, sweep = 0, att = 0.004 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, dest = out, p = 0, slide = 0, lp = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  const kick = (t, v = 0.45) => tone(t, 120, 0.3, { vol: v, slide: 40, att: 0.004 });
  // Sunset Lofi: dusty keys, a lazy beat, vinyl crackle
  const LOFI = { ch: [[53, 57, 60, 64, 67], [52, 55, 59, 62], [50, 53, 57, 60, 64], [55, 59, 62, 65]], bass: [41, 40, 38, 43],
    mel: [[72, 0], [74, 2], [76, 3], [72, 9], [71, 11], [69, 16], [72, 18], [74, 20], [71, 25], [67, 27]] };
  // Neon Drive: synthwave, pulsing bass, big gated snare
  const NEON = { ch: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], bass: [45, 41, 36, 43], arp: [0, 7, 12, 7, 3, 7, 12, 15] };
  // Golden Soul: warm electric piano, a swung groove, a walking bass
  const SOUL = { ch: [[51, 55, 58, 62], [56, 60, 63, 67], [53, 56, 60, 63], [58, 62, 65, 68]], bass: [[39, 43, 46, 48], [44, 48, 51, 49], [41, 44, 48, 46], [46, 50, 53, 46]],
    mel: [[75, 4], [74, 6], [72, 7], [70, 12], [72, 14], [67, 20], [70, 22], [72, 23], [75, 28]] };
  let st = 0, next = ac.currentTime + 0.1, step = 0, timer = null, vol = 0.8;
  const spb = () => 60 / STATIONS[st].bpm / 4;   // sixteenths
  function play(t, s16) {
    const bar = Math.floor(s16 / 16) % 4, s = s16 % 16, beat = spb() * 4;
    if (st === 0) {
      const sw = s % 4 === 2 ? spb() * 0.3 : 0, tt = t + sw;
      if (s === 0) LOFI.ch[bar].forEach((m, i) => { tone(t + i * 0.02, midi(m + 12), beat * 3.8, { vol: 0.035, att: 0.04 }); tone(t + i * 0.02, midi(m + 24), beat * 1.5, { type: 'triangle', vol: 0.006 }); });
      if (s === 0 || s === 10) kick(tt, 0.38);
      if (s === 4 || s === 12) noise(tt, 0.18, { freq: 1800, q: 0.7, vol: 0.1 });
      if (s % 2 === 0) noise(tt, 0.035, { freq: 7500, type: 'highpass', vol: s % 4 ? 0.025 : 0.045 });
      if (s === 0) tone(t, midi(LOFI.bass[bar]), beat * 1.6, { type: 'triangle', vol: 0.2 }); if (s === 6) tone(tt, midi(LOFI.bass[bar] + 7), beat * 0.7, { type: 'triangle', vol: 0.14 });
      const pos = (bar % 2) * 16 + s; for (const [m, at] of LOFI.mel) if (at === pos && bar < 2) { tone(tt, midi(m), 1.3, { type: 'triangle', vol: 0.045, att: 0.004 }); tone(tt, midi(m + 12), 0.4, { vol: 0.01 }); }
      if (Math.random() < 0.18) noise(t, 0.01, { freq: 3000 + Math.random() * 3000, q: 4, vol: 0.03 });
    } else if (st === 1) {
      const root = NEON.bass[bar];
      if (s % 4 === 0) kick(t, 0.5);
      if (s === 4 || s === 12) { noise(t, 0.35, { freq: 1500, q: 0.5, vol: 0.2 }); noise(t, 0.6, { freq: 4000, type: 'highpass', vol: 0.05, att: 0.01 }); }
      noise(t, 0.03, { freq: 9000, type: 'highpass', vol: s % 2 ? 0.02 : 0.035 });
      if (s % 2 === 0) tone(t, midi(root + (s % 4 === 2 ? 12 : 0)), spb() * 1.8, { type: 'sawtooth', vol: 0.07, lp: 700 });
      if (s === 0) NEON.ch[bar].forEach(m => tone(t, midi(m + 12), beat * 4, { type: 'sawtooth', vol: 0.012, att: 0.3, lp: 2200 }));
      tone(t, midi(root + 24 + NEON.arp[s % 8]), spb() * 0.9, { type: 'square', vol: 0.014, lp: 3000, p: s % 2 ? 0.3 : -0.3 });
    } else {
      const sw = s % 4 === 2 ? spb() * 0.35 : 0, tt = t + sw;
      if (s === 0 || s === 8) SOUL.ch[bar].forEach(m => { tone(t, midi(m + 12), beat * 1.8, { vol: 0.04, att: 0.01 }); tone(t, midi(m + 24), beat * 0.6, { type: 'triangle', vol: 0.008 }); });
      if (s === 0 || s === 7 || s === 10) kick(tt, 0.36);
      if (s === 4 || s === 12) noise(tt, 0.16, { freq: 2000, q: 0.8, vol: 0.13 }); if (s === 14) noise(tt, 0.05, { freq: 2200, q: 0.8, vol: 0.03 });
      if (s % 2 === 0) noise(tt, 0.04, { freq: 8000, type: 'highpass', vol: 0.03 });
      if (s % 4 === 0) tone(tt, midi(SOUL.bass[bar][s / 4]), beat * 0.9, { type: 'triangle', vol: 0.2 });
      const pos = (bar % 2) * 16 + s; for (const [m, at] of SOUL.mel) if (at === pos) tone(tt, midi(m), 0.6, { type: 'sine', vol: 0.05, att: 0.01 });
    }
  }
  function schedule() { while (next < ac.currentTime + 0.15) { play(next, step); next += spb(); step++; } }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 25); schedule(); this.volume(vol); },
    station(i) {   // the dial: a burst of static between stations
      st = i; step = Math.ceil(step / 16) * 16; const t = ac.currentTime;
      noise(t, 0.35, { freq: 2500, q: 0.4, vol: 0.12, dest: fx });
      out.gain.setValueAtTime(0.0001, t); out.gain.setTargetAtTime(vol, t + 0.3, 0.08);
    },
    volume(v) { vol = v; out.gain.setTargetAtTime(v, ac.currentTime, 0.2); },
    duck(on) { tone_.frequency.setTargetAtTime(on ? 1400 : 5200, ac.currentTime, 0.2); out.gain.setTargetAtTime(on ? vol * 0.55 : vol, ac.currentTime, 0.2); },
    // the drive
    wind: (() => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.5; g.gain.value = 0; s.connect(f).connect(g).connect(fx); s.start(); return { g, f }; })(),
    rumble(v, p) { if (v > 0) noise(ac.currentTime + 0.01, 0.06, { freq: 140, type: 'lowpass', vol: 0.25 * v, p, dest: fx }); },
    whoosh(p) { noise(ac.currentTime + 0.01, 0.45, { freq: 600, q: 0.8, vol: 0.12, p, dest: fx, sweep: 1800, att: 0.15 }); },
    sfx(kind, p) {
      const t = ac.currentTime + 0.02;
      if (kind === 'rustle') for (let i = 0; i < 6; i++) noise(t + i * 0.12, 0.3, { freq: 4000 + Math.random() * 2000, q: 1, vol: 0.06, p, dest: fx });
      if (kind === 'waves') { noise(t, 2.4, { freq: 600, type: 'lowpass', vol: 0.3, p, dest: fx, sweep: 1800, att: 1.1 }); noise(t + 1.2, 1.4, { freq: 3000, type: 'highpass', vol: 0.08, p, dest: fx, att: 0.2 }); }
      if (kind === 'jingle') [76, 79, 84, 79, 81, 79, 76, 72].forEach((m, i) => tone(t + i * 0.18, midi(m), 0.16, { type: 'square', vol: 0.03, dest: fx, p, lp: 2500 }));
      if (kind === 'woof') [0, 0.35].forEach(d => { tone(t + d, 260, 0.14, { type: 'sawtooth', vol: 0.06, dest: fx, p, slide: 170, lp: 900 }); noise(t + d, 0.1, { freq: 700, q: 2, vol: 0.12, p, dest: fx }); });
      if (kind === 'chimes') [84, 88, 91, 86, 93].forEach((m, i) => tone(t + i * 0.22 + Math.random() * 0.05, midi(m), 1.6, { type: 'sine', vol: 0.04, dest: fx, p }));
      if (kind === 'warm') [60, 64, 67, 72].forEach((m, i) => tone(t + i * 0.15, midi(m), 2.4, { type: 'triangle', vol: 0.05, att: 0.3, dest: fx }));
      if (kind === 'smile') [76, 79, 84].forEach((m, i) => tone(t + i * 0.08, midi(m), 0.4, { type: 'triangle', vol: 0.06, dest: fx, p: 0.4 }));
      if (kind === 'hmm') tone(t, 330, 0.3, { type: 'triangle', vol: 0.05, dest: fx, slide: 290, p: 0.4 });
    },
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
    get station_() { return st; },
  };
}

export function sunsetJoyrideGame() {
  let G = null;

  /* ── tilt to steer (works on iPhone and Android, any way up) ── */
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
      M.roll = (Math.atan2(-(M.s || 1) * gx, Math.hypot(gy, gz)) * 180) / Math.PI;   // + = tilted right
    };
    addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
  }

  /* ── the radio panel ── */
  function radioPanel() {
    const el = G.radioEl = document.createElement('div'); el.className = 'mgk'; el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Car radio');
    Object.assign(el.style, { right: 'calc(12px + env(safe-area-inset-right))', top: 'calc(150px + env(safe-area-inset-top))', pointerEvents: 'auto', background: '#000', border: '2px solid #fff',
      padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px', width: '132px' });
    el.innerHTML = '<div style="font:900 11px Archivo,Arial,sans-serif;letter-spacing:.14em;color:#ec3013;padding:2px 4px">📻 RADIO</div>' +
      STATIONS.map((s, i) => `<button data-i="${i}" aria-label="Radio: ${s.freq}, ${s.name}" style="display:flex;justify-content:space-between;align-items:center;gap:6px;min-height:40px;padding:0 8px;border:2px solid #000;cursor:pointer;font:900 11px/1.05 Archivo,Arial,sans-serif;text-transform:uppercase;text-align:left"><span>${s.name}</span><b style="font-size:10px">${s.freq}</b></button>`).join('');
    el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => tune(+b.dataset.i)));
    document.body.appendChild(el); paintRadio();
  }
  function paintRadio() { G.radioEl && G.radioEl.querySelectorAll('button').forEach(b => { const on = +b.dataset.i === G.st; b.style.background = on ? '#ec3013' : '#fff'; b.style.color = on ? '#fff' : '#000'; b.setAttribute('aria-pressed', on); }); }
  function tune(i) {
    if (G.over || i === G.st) return;
    G.st = i; G.music.station(i); paintRadio(); G.buzz(15);
    G.ui.pop(STATIONS[i].freq + ' ' + STATIONS[i].name, innerWidth / 2, innerHeight * 0.32);
    if (!G.asking) G.say(STATIONS[i].name + '.');
    G.tunes++;
  }

  /* ── things by the road, and "Mom, what's that?" ── */
  function spawn(m) {
    const tex = K.emojiTex(m.emoji, { bg: 'rgba(0,0,0,0)' }); tex.colorSpace = THREE.NoColorSpace; tex.needsUpdate = true;
    G.uni.thing.value = tex; G.thing = { m, k: 0 };
    G.music.sfx(m.snd, m.side * 0.8);
  }
  function ask() {
    const m = MOMENTS[G.mi]; G.asking = true; G.music.duck(true);
    G.order = Math.random() < 0.5 ? ['good', 'bad'] : ['bad', 'good'];
    G.say('Mom, what’s that?');
    showChoices(m);
  }
  function showChoices(m) {
    if (!G.card) {
      G.card = document.createElement('div'); G.card.className = 'mgk';
      Object.assign(G.card.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))', pointerEvents: 'auto',
        background: '#000', borderLeft: '6px solid #f2a541', padding: '10px 12px', display: 'none' });
      document.body.appendChild(G.card);
    }
    G.card.innerHTML = `<div style="font:900 12px Archivo,Arial,sans-serif;letter-spacing:.14em;color:#f2a541">SHARDASIA: “MOM, WHAT’S THAT?”</div>` +
      G.order.map((k, i) => `<button data-k="${k}" style="display:block;width:100%;margin-top:8px;min-height:52px;padding:8px 12px;border:2px solid #000;background:#fff;color:#000;cursor:pointer;text-align:left;font:700 clamp(14px,4.2vw,17px)/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none">${i + 1}. ${m[k]}</button>`).join('');
    G.card.querySelectorAll('button').forEach(b => b.addEventListener('click', () => answer(b.dataset.k)));
    G.card.style.display = 'block';
  }
  function answer(k) {
    if (!G.asking) return;
    const m = MOMENTS[G.mi]; G.asking = false; G.card.style.display = 'none';
    if (k === 'good') {
      G.smiles++; G.music.sfx('smile');
      G.say(m.good + ' I can see it!');
      const [x, y] = G.S.P(0.67, 0.5); G.fx.add(x, y, '#ffd45c', 16, 0.1); G.ui.pop('She can see it! 😊');
    } else {
      G.music.sfx('hmm'); G.say(m.bad + ' Hmm. ' + m.hint + ' ' + m.good);
      G.ui.alert('Her way', 'Sounds, feelings and smells help her see it.', 2.6, 'blue');
    }
    setTimeout(() => G && G.music.duck(false), 3000);
    G.ui.panel('Sunset joyride', `😊 ${G.smiles} <small>of ${MOMENTS.length} · lane ${Math.round(100 * G.inLane / Math.max(1, G.drive))}%</small>`, { segs: [G.mi + 1, MOMENTS.length] });
    G.mi++; G.nextT = G.mi >= MOMENTS.length ? 4 : GAP;
  }
  function finish() {
    G.phase = 'done'; if (G.card) G.card.style.display = 'none';
    K.finale(G, { won: true, kicker: 'Sunset joyride', title: 'Into the sunset', line: G.work && G.work.quote,
      cells: [{ k: 'Smiles', v: `${G.smiles}/${MOMENTS.length}` }, { k: 'In lane', v: Math.round(100 * G.inLane / Math.max(1, G.drive)) + '%' }],
      say: 'Into the sunset. You saw the world her way. ' + ((G.work && G.work.quote) || '') });
    G.radioEl && G.radioEl.remove(); G.radioEl = null;
  }

  function buttons() {
    if (G.phase !== 'drive') return G.ui.buttons([]);
    const el = G.ui.buttons([
      { label: 'Left', icon: '◀', aria: 'Steer left (hold)', press: () => {} },
      { label: 'Right', icon: '▶', aria: 'Steer right (hold)', press: () => {} },
    ]);
    // hold to steer
    if (el) el.forEach((b, i) => {
      const d = i ? 1 : -1, on = () => { G.hold = d; }, off = () => { if (G && G.hold === d) G.hold = 0; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
  }

  return {
    title: 'Sunset joyride',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', st: 0, run: 0, speed: 0, lane: 0, curve: 0, off: 0, hold: 0, drag: null, mi: 0, nextT: 7, asking: false, smiles: 0, tunes: 0, inLane: 0, drive: 0,
        sunset: 0, whooshT: 2, rumbleT: 0, botT: 0 });
      G.music = radio(K.audio());
      G.uni = { map: { value: null }, world: { value: null }, info: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRun: { value: 0 }, uOff: { value: 0 }, uBob: { value: 0 },
        uNeon: { value: 0 }, uGold: { value: 0 }, uSunset: { value: 0 }, uRumble: { value: 0 }, car: { value: null }, thing: { value: null }, uThing: { value: new THREE.Vector4(0, 0, 0.1, 0) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 4; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'world.jpg', 'world'); raw(ART + 'info.png', 'info'); raw(ART + 'car.png', 'car');
      sensors();
      G.onGo = () => {
        G.phase = 'drive'; G.music.start(); radioPanel(); buttons();
        G.music.wind.g.gain.setTargetAtTime(0.06, K.audio().currentTime, 1);
        G.ui.panel('Sunset joyride', `😊 0 <small>of ${MOMENTS.length}</small>`, { segs: [0, MOMENTS.length] });
      };
      K.intro(G, { title: 'Sunset joyride', how: 'You’re Mom, driving. Tilt the phone (or hold Left and Right) to stay in your lane. Change the station on the radio. When Shardasia asks “What’s that?”, describe it her way.',
        say: 'Sunset joyride. You’re Mom, driving Shardasia down the boulevard into the sunset. Tilt your phone, or hold Left and Right, to stay in your lane as the road curves. Change the station on the radio panel. And when Shardasia asks what’s that, describe it her way: how it sounds, how it feels, how it smells.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the colours follow the station
      u.uNeon.value += ((G.st === 1 ? 1 : 0) - u.uNeon.value) * Math.min(1, dt * 2.5); u.uGold.value += ((G.st === 2 ? 1 : 0) - u.uGold.value) * Math.min(1, dt * 2.5);
      const bpm = STATIONS[G.st].bpm, beatPh = (G.t * bpm / 60) % 1; u.uBob.value = Math.pow(1 - beatPh, 3) * (G.phase === 'drive' ? 1 : 0.3);
      if (G.phase === 'drive' || G.phase === 'sunset') {
        G.speed += ((G.phase === 'sunset' ? 0.5 : 1) - G.speed) * Math.min(1, dt * 0.8);
        G.run += dt * 0.55 * G.speed; u.uRun.value = G.run;
        // the boulevard curves; you steer
        G.curve = Math.sin(G.t * 0.21) * 0.55 + Math.sin(G.t * 0.083 + 1) * 0.35;
        let steer = G.hold;
        if (G.mot && G.mot.ok && Math.abs(G.mot.roll) > 3) steer = Math.max(-1, Math.min(1, G.mot.roll / 22));
        if (G.drag !== null) steer = G.drag;
        if (G.bot) steer = Math.max(-1, Math.min(1, (G.curve - G.lane) * 4));
        G.lane += steer * dt * 0.7 + (G.curve - G.lane) * dt * 0.3;
        G.off = G.lane - G.curve; u.uOff.value += (-G.off * 0.07 - u.uOff.value) * Math.min(1, dt * 5);
        const out = Math.abs(G.off) > 0.32;
        G.drive += dt; if (!out) G.inLane += dt;
        u.uRumble.value += ((out ? 1 : 0) - u.uRumble.value) * Math.min(1, dt * 8);
        G.rumbleT -= dt; if (out && G.rumbleT <= 0) { G.rumbleT = 0.09; G.music.rumble(1, Math.sign(G.off)); }
        if (out && !G.warned) { G.warned = true; if (!G.asking) G.say('Whoa, Mom! Stay in your lane.'); setTimeout(() => G && (G.warned = false), 6000); }
        // palms whoosh past
        G.whooshT -= dt; if (G.whooshT <= 0) { G.whooshT = 1.4 + Math.random() * 1.2; G.music.whoosh(Math.random() < 0.5 ? -0.8 : 0.8); }
        G.music.wind.f.frequency.value = 450 + Math.sin(G.t * 0.7) * 120;
      }
      // a thing comes up from the horizon, then she asks about it
      if (G.phase === 'drive') {
        G.nextT -= dt;
        if (G.nextT <= 0 && !G.asking && !G.thing) {
          if (G.mi >= MOMENTS.length) { G.phase = 'sunset'; G.sunT = 0; G.ui.buttons([]); G.say('Let’s drive into the sun.'); G.music.sfx('warm'); }
          else { spawn(MOMENTS[G.mi]); G.askT = 2.6; }
        }
        if (G.thing && G.askT !== undefined) { G.askT -= dt; if (G.askT <= 0) { G.askT = undefined; ask(); } }
      }
      if (G.thing) {
        const th = G.thing; th.k = Math.min(1, th.k + dt * (G.asking ? 0.035 : 0.12));
        const e = th.k * th.k, side = th.m.side || 0.001;
        // it comes from the horizon and passes along the roadside (the sun one rises over the horizon instead)
        const tu = th.m.side ? 0.505 + side * e * 0.5 : 0.505, tv = th.m.side ? 0.49 + e * 0.1 : 0.47 - e * 0.04;
        G.uni.uThing.value.set(tu + G.uni.uOff.value * e, tv, 0.03 + e * 0.17, Math.min(1, th.k * 5) * (1 - Math.max(0, (th.k - 0.85) / 0.15)));
        if (th.k >= 1 && !G.asking) { G.uni.uThing.value.w = 0; G.thing = null; }
      }
      // the end: the sun swells, and they drive right into it
      if (G.phase === 'sunset') { G.sunT += dt; G.sunset = Math.min(1, G.sunT / 6); u.uSunset.value = G.sunset * G.sunset; if (G.sunT > 6.5) finish(); }
      // the robot: answers well (one miss), changes the station twice
      if (G.bot && G.asking) { G.botT += dt; if (G.botT > 1.2) { G.botT = 0; answer(G.mi === 2 ? 'bad' : 'good'); } }
      if (G.bot && G.phase === 'drive' && !G.asking && Math.random() < dt * 0.06) tune((G.st + 1) % 3);
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'drive') return;
      // drag across the screen to steer, too
      if (kind === 'down') G.drag0 = ev.clientX;
      if (kind === 'move' && G.drag0 !== undefined) G.drag = Math.max(-1, Math.min(1, (ev.clientX - G.drag0) / (innerWidth * 0.2)));
      if (kind === 'up') { G.drag0 = undefined; G.drag = null; }
    },
    pause() { if (G) { G.paused = true; G.music.volume(0); } },
    resume() { if (G) { G.paused = false; G.music.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'joyride', playing: G.playing, over: G.over, phase: G.phase, station: STATIONS[G.st].id, moment: G.mi, asking: G.asking, smiles: G.smiles,
      lane: +G.off.toFixed(2), inLane: Math.round(100 * G.inLane / Math.max(1, G.drive)), tilt: !!(G.mot && G.mot.ok), t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.music.stop(); G.offMotion && G.offMotion(); G.radioEl && G.radioEl.remove(); G.card && G.card.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
