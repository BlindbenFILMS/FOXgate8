// JOYRIDE (Shardasia Hadley): SUNSET JOYRIDE, a radio game.
// Shardasia and her mom cruise a palm-lined boulevard into the sunset, top down. The road really rolls toward you, the
// palms stream past, their hair blows in the wind and they bob to the radio. You're on the car radio:
//  · Turn the big dial (or press ◀ ▶) across the FM band. Between stations it's static; tune in and a station comes in
//    clear, and the whole sky changes with it. Six stations: Sunset Lofi, Neon Drive, Golden Soul, Night Jazz,
//    Island Breeze and Back Roads Country. Find all six.
//  · Dance: tap the painting (or the Dance button) on the beat. On the beat they bounce and hearts and confetti fly
//    out of the car, and the dance meter fills; fill it for a dance party.
//  · Honk: tap the car (or the Honk button): beep beep! and people on the sidewalk wave back.
// When all six stations are found, Into the sunset drives them right into the sun.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = new URL('../../media/games/joyride/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
const STATIONS = [
  { id: 'lofi', freq: 88.1, name: 'Sunset Lofi', bpm: 80 },
  { id: 'neon', freq: 92.3, name: 'Neon Drive', bpm: 100 },
  { id: 'soul', freq: 96.5, name: 'Golden Soul', bpm: 90 },
  { id: 'jazz', freq: 99.7, name: 'Night Jazz', bpm: 132 },
  { id: 'island', freq: 103.1, name: 'Island Breeze', bpm: 92 },
  { id: 'country', freq: 106.7, name: 'Back Roads', bpm: 112 },
];
const FM = [87.5, 108.0], CATCH = 0.45;   // the band, and how close the dial must be to pick a station up
const METER = 10;                          // on-beat taps for a dance party

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting on the move: the world (road, palms, trees) flows past from the horizon, shifts as the car drifts in
// its lane, their hair blows in the wind and they bob to the music; the sky takes on the radio station's colours,
// and at the end the sun swells as they drive right into it
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, world, info, thing, car;
uniform vec4 uThing;   // a thing by the road: u, v, size, opacity
uniform float uT, uA, uH, uRun, uOff, uBob, uNeon, uGold, uJazz, uIsland, uCountry, uStatic, uParty, uSunset, uRumble;
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
  // Night Jazz: a deep blue night with stars; Island Breeze: turquoise; Back Roads: a dusty pink-lilac dusk
  float star = step(0.995, fract(sin(dot(floor(p * vec2(160.0, 160.0)), vec2(12.9898, 78.233))) * 43758.5453)) * (0.6 + 0.4 * sin(uT * 3.0 + p.x * 50.0));
  vec3 jazz = mix(vec3(0.03, 0.04, 0.16), vec3(0.32, 0.38, 0.85), smoothstep(0.1, 0.95, l)) + vec3(1.0) * star * (1.0 - sun);
  col = mix(col, jazz, uJazz * sky * 0.9); col = mix(col, col * vec3(0.7, 0.78, 1.15), uJazz * (1.0 - sky) * 0.55);
  vec3 isl = mix(vec3(0.0, 0.32, 0.42), vec3(0.55, 1.0, 0.92), smoothstep(0.1, 0.9, l));
  col = mix(col, isl, uIsland * sky * 0.8); col = mix(col, col * vec3(0.9, 1.1, 1.06), uIsland * (1.0 - sky) * 0.45);
  vec3 dusk = mix(vec3(0.3, 0.14, 0.3), vec3(1.0, 0.72, 0.82), smoothstep(0.1, 0.9, l));
  col = mix(col, dusk, uCountry * sky * 0.75); col = mix(col, col * vec3(1.08, 0.92, 0.95), uCountry * (1.0 - sky) * 0.4);
  // between stations the sky goes a bit grey and fuzzy, like the static; a dance party flashes colour
  float fz = fract(sin(dot(floor(p * 220.0) + floor(uT * 30.0), vec2(12.9898, 78.233))) * 43758.5453);
  col = mix(col, vec3(dot(col, vec3(0.3, 0.59, 0.11))) + (fz - 0.5) * 0.12, uStatic * sky * 0.6);
  col += vec3(0.5 + 0.5 * sin(uT * 9.0), 0.5 + 0.5 * sin(uT * 9.0 + 2.1), 0.5 + 0.5 * sin(uT * 9.0 + 4.2)) * uParty * sky * 0.35;
  // the sun breathes, and at the end swells to fill the sky
  float glow = exp(-length(sp) * (9.0 - 6.0 * uSunset)) * (0.18 + 0.05 * sin(uT * 1.7));
  col += vec3(1.0, 0.8, 0.5) * glow * sky;
  col = mix(col, vec3(1.0, 0.93, 0.78), uSunset * smoothstep(0.35 + uSunset * 0.4, 0.0, length(sp)));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the radio: six stations, and static in between ───────────────────────── */
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
  // Night Jazz: ride cymbal, walking bass, piano comping, brushes
  const JAZZ = { ch: [[62, 65, 69, 72], [60, 64, 67, 71], [59, 62, 65, 69], [58, 62, 65, 68]], bass: [[38, 41, 45, 46], [36, 40, 43, 44], [43, 41, 40, 38], [46, 45, 43, 41]],
    mel: [[77, 0], [76, 3], [74, 6], [72, 10], [74, 16], [77, 19], [81, 22], [79, 26]] };
  // Island Breeze: steel drums, an off-beat skank, a one-drop beat, a shaker
  const ISLE = { ch: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [65, 69, 72]], bass: [48, 53, 55, 53],
    mel: [[79, 0], [76, 2], [74, 4], [76, 6], [79, 8], [81, 12], [79, 16], [76, 18], [74, 20], [72, 24], [74, 26], [76, 28]] };
  // Back Roads: boom-chick bass, a train beat, a twangy guitar lick
  const ROAD = { ch: [[55, 59, 62], [55, 59, 62], [60, 64, 67], [62, 66, 69]], bass: [43, 43, 48, 50],
    mel: [[71, 0], [74, 2], [79, 4], [78, 6], [76, 8], [74, 10], [71, 12], [69, 16], [71, 18], [74, 20], [76, 24], [74, 28]] };
  let st = 0, next = ac.currentTime + 0.1, step = 0, timer = null, vol = 0.8, clear = 1;
  const beats = [];   // when each beat lands (so a tap can be judged against it)
  // the static between stations: a hiss and a whine, louder the further you are from a station
  const hiss = (() => { const sr = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); sr.buffer = nb; sr.loop = true; f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.35; g.gain.value = 0; sr.connect(f).connect(g).connect(fx); sr.start(); return g; })();
  const whine = (() => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 900; g.gain.value = 0; o.connect(g).connect(fx); o.start(); return { o, g }; })();
  const spb = () => 60 / STATIONS[st].bpm / 4;   // sixteenths
  function play(t, s16) {
    const bar = Math.floor(s16 / 16) % 4, s = s16 % 16, beat = spb() * 4;
    if (s % 4 === 0) { beats.push(t); if (beats.length > 12) beats.shift(); }
    if (st === 3) {   // Night Jazz
      const sw = s % 4 === 2 ? spb() * 0.33 : 0, tt = t + sw;
      if (s % 4 === 0 || s === 6 || s === 14) noise(tt, 0.4, { freq: 7800, type: 'highpass', vol: s % 4 ? 0.025 : 0.04 });
      if (s === 4 || s === 12) noise(t, 0.12, { freq: 3500, q: 0.4, vol: 0.06 });
      if (s % 4 === 0) tone(t, midi(JAZZ.bass[bar][s / 4]), beat * 0.9, { type: 'triangle', vol: 0.22 });
      if (s === 6 || s === 14) JAZZ.ch[bar].forEach(m => tone(tt, midi(m), beat * 0.5, { type: 'triangle', vol: 0.025 }));
      const pos = (bar % 2) * 16 + s; for (const [m, at] of JAZZ.mel) if (at === pos && bar < 2) tone(tt, midi(m), 0.5, { type: 'triangle', vol: 0.04, att: 0.004 });
      return;
    }
    if (st === 4) {   // Island Breeze
      if (s === 8) { kick(t, 0.45); noise(t, 0.08, { freq: 1600, q: 1, vol: 0.12 }); }   // the one drop
      if (s === 4 || s === 12) ISLE.ch[bar].forEach(m => tone(t, midi(m + 12), 0.12, { type: 'square', vol: 0.018, lp: 2400 }));
      noise(t, 0.04, { freq: 6000, type: 'highpass', vol: s % 2 ? 0.02 : 0.03 });
      if (s === 0 || s === 6 || s === 10) tone(t, midi(ISLE.bass[bar]), beat * 0.6, { type: 'sine', vol: 0.3 });
      const pos = (bar % 2) * 16 + s; for (const [m, at] of ISLE.mel) if (at === pos) { tone(t, midi(m), 0.5, { type: 'sine', vol: 0.06, att: 0.003 }); tone(t, midi(m) * 2.01, 0.25, { type: 'sine', vol: 0.025, att: 0.003 }); tone(t, midi(m) * 3.98, 0.12, { type: 'sine', vol: 0.01 }); }   // a steel pan: a bright, bell-like ping
      return;
    }
    if (st === 5) {   // Back Roads
      if (s === 0 || s === 8) tone(t, midi(ROAD.bass[bar] + (s === 8 ? 7 : 0)), beat * 0.8, { type: 'triangle', vol: 0.24 });
      if (s === 4 || s === 12) ROAD.ch[bar].forEach(m => tone(t, midi(m + 12), 0.14, { type: 'triangle', vol: 0.03 }));
      if (s % 2 === 0) noise(t, 0.06, { freq: 3200, q: 0.6, vol: s % 4 === 2 ? 0.08 : 0.04 });   // the train beat on the snare
      if (s === 0 || s === 10) kick(t, 0.35);
      const pos = (bar % 2) * 16 + s; for (const [m, at] of ROAD.mel) if (at === pos) tone(t, midi(m), 0.32, { type: 'sawtooth', vol: 0.03, att: 0.003, lp: 1800, slide: midi(m) * (at % 8 === 0 ? 1.03 : 1) });   // twang
      return;
    }
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
    station(i) { if (i !== st) { st = i; step = Math.ceil(step / 16) * 16; } },
    // how well the dial is tuned in (1 = right on a station, 0 = static): the music fades in as the static fades out
    tuning(k, f) { clear = k; const t = ac.currentTime; out.gain.setTargetAtTime(vol * k * k, t, 0.05); hiss.gain.setTargetAtTime(0.11 * (1 - k), t, 0.05);
      whine.g.gain.setTargetAtTime(0.012 * Math.max(0, 1 - Math.abs(k - 0.4) * 3), t, 0.05); whine.o.frequency.setTargetAtTime(600 + (f % 1) * 1400, t, 0.03); },
    // how close a tap is to the nearest beat (seconds), and how long a beat is
    offBeat() { const now = ac.currentTime; let d = 9; for (const b of beats) d = Math.min(d, Math.abs(now - b)); return d; },
    beatLen() { return spb() * 4; },
    horn(p) { const t = ac.currentTime + 0.01; for (const at of [0, 0.22]) for (const f of [415, 523]) tone(t + at, f, 0.17, { type: 'square', vol: 0.05, lp: 1500, dest: fx, p }); },
    volume(v) { vol = v; out.gain.setTargetAtTime(v * clear * clear, ac.currentTime, 0.2); },
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
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); setTimeout(() => { try { whine.o.stop(); } catch (e) {} }, 500); } catch (e) {} },
    get station_() { return st; },
  };
}

// little drawn things: a heart, and a person on the sidewalk waving (a silhouette, like the trees)
const heartTex = K.canvasTex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(64, 112); g.bezierCurveTo(4, 70, 14, 14, 64, 40); g.bezierCurveTo(114, 14, 124, 70, 64, 112); g.fill(); });
const bitTex = K.canvasTex(32, 32, (g) => { g.fillStyle = '#fff'; g.fillRect(6, 10, 20, 12); });
function waverTex(armUp) {
  return K.canvasTex(128, 256, (g) => {
    g.fillStyle = '#2a1830'; g.strokeStyle = '#2a1830'; g.lineCap = 'round';
    g.beginPath(); g.arc(64, 40, 20, 0, Math.PI * 2); g.fill();   // head
    g.beginPath(); g.moveTo(42, 70); g.quadraticCurveTo(64, 60, 86, 70); g.lineTo(82, 160); g.lineTo(46, 160); g.closePath(); g.fill();   // body
    g.lineWidth = 16; g.beginPath(); g.moveTo(52, 160); g.lineTo(48, 240); g.moveTo(76, 160); g.lineTo(80, 240); g.stroke();   // legs
    g.lineWidth = 13; g.beginPath(); g.moveTo(46, 78); g.lineTo(34, 150); g.stroke();   // one arm down
    g.beginPath(); g.moveTo(84, 76); if (armUp) { g.lineTo(108, 40); g.lineTo(112, 6); } else { g.lineTo(116, 52); g.lineTo(122, 18); } g.stroke();   // the waving arm
    g.beginPath(); g.arc(armUp ? 112 : 122, armUp ? 4 : 16, 10, 0, Math.PI * 2); g.fill();   // hand
  });
}
const HUES = ['#ff9a5a', '#ff4fd8', '#ffc93c', '#7fa8ff', '#3fe0c8', '#ff8fb0'];   // each station's confetti colour

export function sunsetJoyrideGame() {
  let G = null;
  const near = f => { let best = -1, d = 9; STATIONS.forEach((s, i) => { const x = Math.abs(f - s.freq); if (x < d) { d = x; best = i; } }); return { i: best, d }; };

  /* ── the car radio: a frequency display, a big dial, and tune buttons ── */
  function radioPanel() {
    const el = G.radioEl = document.createElement('div'); el.className = 'mgk'; el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Car radio');
    Object.assign(el.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(160px + env(safe-area-inset-bottom))', pointerEvents: 'auto',
      background: 'linear-gradient(#2b2230,#120d16)', border: '3px solid #000', borderRadius: '16px', boxShadow: '0 6px 0 #000', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px' });
    el.innerHTML = `<div style="flex:1;min-width:0">
        <div style="font:900 11px Archivo,Arial,sans-serif;letter-spacing:.16em;color:#ff7a5a">📻 FM RADIO</div>
        <div class="jr-lcd" aria-live="polite" style="margin-top:4px;background:#1b2a14;border:2px solid #000;border-radius:8px;padding:6px 10px;color:#b8ff6a;font:700 13px/1.15 'Courier New',monospace;text-shadow:0 0 6px #7dff2a">
          <div class="jr-f" style="font-size:26px;font-weight:900">88.1</div><div class="jr-n" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">SUNSET LOFI</div></div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
        <button type="button" class="jr-dn" aria-label="Tune down to the previous station" style="flex:none;width:44px;height:36px;border:2px solid #000;border-radius:8px;background:#fff;font:900 16px Arial;cursor:pointer">◀</button>
        <div class="jr-band" style="position:relative;flex:1;height:16px;border-radius:4px;background:#0c0910">
          ${STATIONS.map((s, i) => `<i data-i="${i}" style="position:absolute;top:4px;width:8px;height:8px;margin-left:-4px;border-radius:50%;border:2px solid #555;left:${(s.freq - FM[0]) / (FM[1] - FM[0]) * 100}%"></i>`).join('')}
          <b class="jr-needle" style="position:absolute;top:-2px;width:3px;height:20px;margin-left:-1px;background:#ff3b2f;box-shadow:0 0 6px #ff3b2f"></b></div>
        <button type="button" class="jr-up" aria-label="Tune up to the next station" style="flex:none;width:44px;height:36px;border:2px solid #000;border-radius:8px;background:#fff;font:900 16px Arial;cursor:pointer">▶</button></div></div>
      <div class="jr-dial" role="slider" tabindex="0" aria-label="Tuning dial" aria-valuemin="${FM[0]}" aria-valuemax="${FM[1]}" style="flex:none;width:92px;height:92px;border-radius:50%;touch-action:none;cursor:grab;position:relative;
        background:radial-gradient(circle at 35% 30%,#fff 0,#d9d4cc 18%,#8d8578 60%,#3e3830 100%);border:3px solid #000;box-shadow:0 4px 0 #000,inset 0 0 0 6px rgba(0,0,0,.15)">
        <span class="jr-knob" style="position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(rgba(0,0,0,.18) 0 4deg,transparent 4deg 12deg)">
          <i style="position:absolute;left:50%;top:6px;width:8px;height:22px;margin-left:-4px;border-radius:4px;background:#ff3b2f;border:2px solid #000"></i></span></div>`;
    document.body.appendChild(el);
    const dial = el.querySelector('.jr-dial');
    el.querySelector('.jr-dn').addEventListener('click', () => step(-1)); el.querySelector('.jr-up').addEventListener('click', () => step(1));
    let last = null;
    const ang = ev => { const r = dial.getBoundingClientRect(); return Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2)); };
    dial.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); dial.setPointerCapture(ev.pointerId); last = ang(ev); G.glide = null; K.audio(); });
    dial.addEventListener('pointermove', ev => { if (last === null) return; const a = ang(ev); let d = a - last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; last = a; setFreq(G.freq + d / (2 * Math.PI) * 5); });
    const up = () => { if (last === null) return; last = null; const n = near(G.freq); if (n.d < CATCH) G.glide = STATIONS[n.i].freq; };   // let go near a station: it clicks into place
    dial.addEventListener('pointerup', up); dial.addEventListener('pointercancel', up);
    dial.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { ev.preventDefault(); step(1); } if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { ev.preventDefault(); step(-1); } });
    paintRadio();
  }
  function setFreq(f) { G.freq = Math.max(FM[0], Math.min(FM[1], f)); }
  function step(dir) {   // ◀ ▶: glide through the static to the next station
    const cur = near(G.freq), list = STATIONS.map(s => s.freq);
    let target = dir > 0 ? list.find(f => f > G.freq + 0.05) : [...list].reverse().find(f => f < G.freq - 0.05);
    if (target === undefined) target = dir > 0 ? list[0] : list[list.length - 1];   // wrap round the band
    G.glide = target; G.buzz(10);
  }
  function paintRadio() {
    if (!G.radioEl) return;
    const n = near(G.freq), on = n.d < CATCH * 0.5, el = G.radioEl;
    el.querySelector('.jr-f').textContent = G.freq.toFixed(1);
    el.querySelector('.jr-n').textContent = on ? STATIONS[n.i].name.toUpperCase() : '· · · static · · ·';
    el.querySelector('.jr-needle').style.left = ((G.freq - FM[0]) / (FM[1] - FM[0]) * 100) + '%';
    el.querySelectorAll('.jr-band i').forEach(d => { const i = +d.dataset.i, got = G.found.has(i); d.style.background = got ? HUES[i] : 'transparent'; d.style.borderColor = got ? '#fff' : '#555'; });
    el.querySelector('.jr-knob').style.transform = `rotate(${(G.freq - FM[0]) / 5 * 360}deg)`;
    el.querySelector('.jr-dial').setAttribute('aria-valuenow', G.freq.toFixed(1)); el.querySelector('.jr-dial').setAttribute('aria-valuetext', G.freq.toFixed(1) + (on ? ' ' + STATIONS[n.i].name : ', static'));
  }
  function tunedIn(i) {   // a station comes in clear
    if (G.st === i && G.t - (G.tunedAt ?? -9) < 1) return;   // the same station twice at once: say it once
    G.tunedAt = G.t; G.st = i; G.music.station(i);
    const first = !G.found.has(i); G.found.add(i);
    G.ui.pop(STATIONS[i].freq.toFixed(1) + ' ' + STATIONS[i].name, innerWidth / 2, innerHeight * 0.3);
    G.say(first ? `${STATIONS[i].name}! ${G.found.size === STATIONS.length ? 'You found all six stations!' : `${G.found.size} of 6 stations.`}` : STATIONS[i].name + '!'   /* (the same line as the first visit, so one recording each) */);
    if (first) { G.buzz([20, 30, 20]); burst(14, HUES[i]); }
    if (G.found.size === STATIONS.length && !G.allSaid) { G.allSaid = true; buttons(); G.ui.alert('All six stations!', 'Keep dancing, or drive into the sunset', 2.6, 'red'); }
    hud();
  }

  /* ── dancing on the beat, honking, waving ── */
  function burst(n, col, big = 1) {
    for (let k = 0; k < n; k++) {
      const heart = k % 3 === 0, s = K.sprite(heart ? heartTex : bitTex, heart ? 0.035 * big : 0.018, { color: heart ? '#ff5d8f' : (k % 2 ? col : HUES[(G.st + k) % 6]), order: 30, opacity: 1 });
      const [x, y] = G.S.P(0.5 + (Math.random() - 0.5) * 0.3, 0.52); s.position.set(x, y, 0.07); G.root.add(s);
      G.bits.push({ s, vx: (Math.random() - 0.5) * 0.5, vy: 0.3 + Math.random() * 0.45 * big, rot: (Math.random() - 0.5) * 8, life: 1.4 + Math.random() * 0.6, t: 0 });
    }
  }
  function dance() {
    if (G.phase !== 'drive' && G.phase !== 'sunset') return;
    const off = G.music.offBeat(), beat = G.music.beatLen(), good = off < Math.max(0.09, beat * 0.18);
    if (good) {
      G.hits++; G.meter++; G.jump = 1; burst(6, HUES[G.st]); K.tone(1200 + (G.meter % 5) * 120, 0.08, { type: 'triangle', vol: 0.05 }); G.buzz(15);
      if (G.meter >= METER) { G.meter = 0; G.parties++; G.party = 1; burst(40, '#ffffff', 1.6); G.ui.alert('Dance party!', 'They’re dancing in their seats', 1.8, 'red'); G.say('Dance party!'); }
      else if (G.hits === 1) G.say('On the beat!');
    } else { G.jump = Math.max(G.jump, 0.35); burst(1, HUES[G.st]); }
    hud();
  }
  function honk() {
    if (G.phase !== 'drive' && G.phase !== 'sunset') return;
    if (G.t - G.honkT < 0.6) return; G.honkT = G.t;
    G.music.horn(0); G.buzz([25, 40, 25]); G.honks++; G.ui.pop('Beep beep!', innerWidth / 2, innerHeight * 0.55);
    // someone on the sidewalk waves back, on the left or the right
    const side = G.honks % 2 ? -1 : 1, u = 0.5 + side * (0.3 + Math.random() * 0.12), v = 0.5 + Math.random() * 0.02;
    const s = K.sprite(G.waveTex[0], 0.04, { order: 13, opacity: 0 }); s.scale.set(0.035, 0.07, 1); const [x, y] = G.S.P(u, v); s.position.set(x, y, 0.035); G.root.add(s);
    G.wavers.push({ s, x, y, t: 0 });
    setTimeout(() => G && G.say(['Hi!', 'Hello!', 'Hey there!'][G.honks % 3]), 500);
  }

  function hud() {
    if (G.phase === 'intro') return;
    G.ui.panel('Sunset joyride', `${G.found.size}<small>of 6 stations</small>` + (G.parties ? ` <small>· 🎉 ${G.parties}</small>` : ''), { segs: [G.meter, METER], sub: 'Turn the dial · tap to the beat · honk!' });
  }
  function buttons() {
    if (G.phase !== 'drive') return G.ui.buttons([]);
    const B = [
      { label: 'Dance', icon: '♥', kind: 'red', aria: 'Dance: tap on the beat', press: () => dance() },
      { label: 'Honk', icon: '📯', kind: 'black', aria: 'Honk the horn', press: () => honk() },
    ];
    if (G.found.size === STATIONS.length) B.push({ label: 'Sunset', icon: '🌅', kind: 'blue', aria: 'Drive into the sunset', press: () => { if (G.phase === 'drive') { G.phase = 'sunset'; G.sunT = 0; G.ui.buttons([]); G.say('Let’s drive into the sun.'); G.music.sfx('warm'); } } });
    G.ui.buttons(B);
  }
  function finish() {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Sunset joyride', title: 'Into the sunset', line: G.work && G.work.quote,
      cells: [{ k: 'Stations', v: `${G.found.size}/6` }, { k: 'On the beat', v: G.hits }, { k: 'Honks', v: G.honks }],
      say: 'Into the sunset. What a ride.' });
    G.radioEl && G.radioEl.remove(); G.radioEl = null;
  }

  return {
    title: 'Sunset joyride',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', st: 0, freq: STATIONS[0].freq, glide: null, found: new Set(), run: 0, speed: 0, lane: 0, curve: 0, off: 0, sunset: 0, whooshT: 2,
        hits: 0, meter: 0, parties: 0, party: 0, jump: 0, honks: 0, honkT: -9, bits: [], wavers: [], botT: 0, paintT: 0, lastIn: -1 });
      G.music = radio(K.audio());
      G.waveTex = [waverTex(false), waverTex(true)];
      G.uni = { map: { value: null }, world: { value: null }, info: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRun: { value: 0 }, uOff: { value: 0 }, uBob: { value: 0 },
        uNeon: { value: 0 }, uGold: { value: 0 }, uJazz: { value: 0 }, uIsland: { value: 0 }, uCountry: { value: 0 }, uStatic: { value: 0 }, uParty: { value: 0 },
        uSunset: { value: 0 }, uRumble: { value: 0 }, car: { value: null }, thing: { value: null }, uThing: { value: new THREE.Vector4(0, 0, 0.1, 0) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 4; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'world.jpg', 'world'); raw(ART + 'info.png', 'info'); raw(ART + 'car.png', 'car');
      G.onGo = () => {
        G.phase = 'drive'; G.music.start(); radioPanel(); buttons(); tunedIn(0);
        G.music.wind.g.gain.setTargetAtTime(0.05, K.audio().currentTime, 1);
      };
      K.intro(G, { title: 'Sunset joyride', how: 'Ride along with Shardasia and her mom. Turn the radio dial to find all six stations, tap on the beat to dance, and honk to say hi.',
        say: 'Sunset joyride. Ride along with Shardasia and her mom, top down, into the sunset. You’re on the radio. Turn the big dial, or press the arrows, to find all six stations. Each one changes the sky. Tap the screen on the beat to dance, and honk the horn to say hi to the people on the sidewalk.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the radio: glide the dial, pick up a station, fade the static
      if (G.phase === 'drive' || G.phase === 'sunset') {
        if (G.glide !== null) { const d = G.glide - G.freq; if (Math.abs(d) < 0.02) { G.freq = G.glide; G.glide = null; } else G.freq += Math.sign(d) * Math.min(Math.abs(d), dt * (2 + Math.abs(d) * 4)); }
        const n = near(G.freq), k = Math.max(0, 1 - n.d / CATCH);
        if (k > 0.5 && n.i !== G.lastIn) { G.lastIn = n.i; tunedIn(n.i); } else if (k < 0.2) G.lastIn = -1;
        if (k > 0) G.music.station(n.i);
        G.music.tuning(Math.min(1, k * 1.25), G.freq); u.uStatic.value += ((1 - Math.min(1, k * 1.25)) - u.uStatic.value) * Math.min(1, dt * 8);
        G.paintT -= dt; if (G.paintT <= 0) { G.paintT = 0.05; paintRadio(); }
      }
      // the colours follow the station
      const W = ['uNeon', 'uGold', 'uJazz', 'uIsland', 'uCountry'];
      W.forEach((key, i) => { u[key].value += ((G.st === i + 1 ? 1 : 0) - u[key].value) * Math.min(1, dt * 2.5); });
      const bpm = STATIONS[G.st].bpm, beatPh = (G.t * bpm / 60) % 1;
      G.jump = Math.max(0, G.jump - dt * 3); G.party = Math.max(0, G.party - dt * 0.6); u.uParty.value = G.party;
      u.uBob.value = (Math.pow(1 - beatPh, 3) * (1 - u.uStatic.value * 0.8) + G.jump * 2.2) * (G.phase === 'drive' ? 1 : 0.3);
      if (G.phase === 'drive' || G.phase === 'sunset') {
        G.speed += ((G.phase === 'sunset' ? 0.5 : 1) - G.speed) * Math.min(1, dt * 0.8);
        G.run += dt * 0.55 * G.speed; u.uRun.value = G.run;
        // the boulevard curves gently; Mom keeps them in the lane
        G.curve = Math.sin(G.t * 0.21) * 0.55 + Math.sin(G.t * 0.083 + 1) * 0.35;
        G.lane += (G.curve - G.lane) * dt * 1.5; G.off = G.lane - G.curve; u.uOff.value += (-G.off * 0.07 - u.uOff.value) * Math.min(1, dt * 5);
        G.whooshT -= dt; if (G.whooshT <= 0) { G.whooshT = 1.4 + Math.random() * 1.2; G.music.whoosh(Math.random() < 0.5 ? -0.8 : 0.8); }
        G.music.wind.f.frequency.value = 450 + Math.sin(G.t * 0.7) * 120;
      }
      // hearts and confetti
      for (let i = G.bits.length - 1; i >= 0; i--) { const b = G.bits[i]; b.t += dt; b.vy -= dt * 0.5;
        b.s.position.x += b.vx * dt * 0.3; b.s.position.y += b.vy * dt * 0.3; b.s.material.rotation += b.rot * dt; b.s.material.opacity = Math.max(0, 1 - b.t / b.life);
        if (b.t > b.life) { G.root.remove(b.s); b.s.material.dispose(); G.bits.splice(i, 1); } }
      // the people waving back
      for (let i = G.wavers.length - 1; i >= 0; i--) { const w = G.wavers[i]; w.t += dt;
        const k = Math.min(1, w.t * 4), fade = Math.max(0, 1 - Math.max(0, w.t - 2.2) * 2);
        w.s.material.map = G.waveTex[Math.floor(w.t * 6) % 2]; w.s.material.opacity = k * fade * u.uA.value;
        w.s.scale.set(0.035 * (0.6 + 0.4 * k), 0.07 * (0.6 + 0.4 * k), 1); w.s.position.y = w.y + 0.035 * k - 0.035;
        if (w.t > 2.8) { G.root.remove(w.s); w.s.material.dispose(); G.wavers.splice(i, 1); } }
      // the end: the sun swells, and they drive right into it
      if (G.phase === 'sunset') { G.sunT += dt; G.sunset = Math.min(1, G.sunT / 6); u.uSunset.value = G.sunset * G.sunset; if (G.sunT > 6.5) finish(); }
      // the robot: tunes through the band, dances on the beat, honks, then drives into the sunset
      if (G.bot && G.phase === 'drive') { G.botT -= dt;
        if (G.botT <= 0) { G.botT = 2.2;
          if (G.found.size < STATIONS.length) step(1);
          else if (G.hits < 12) { /* keep dancing */ } else { G.phase = 'sunset'; G.sunT = 0; G.ui.buttons([]); }
          if (Math.random() < 0.4) honk(); }
        if (G.music.offBeat() < 0.03 && G.t - (G.botDance || 0) > 0.3 && G.glide === null) { G.botDance = G.t; dance(); } }
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down' || (G.phase !== 'drive' && G.phase !== 'sunset')) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      if (p.v > 0.66 && p.v < 1 && p.u > 0.08 && p.u < 0.92) honk(); else dance();   // tap the car to honk; anywhere else to dance
    },
    pause() { if (G) { G.paused = true; G.music.volume(0); } },
    resume() { if (G) { G.paused = false; G.music.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'joyride-radio', playing: G.playing, over: G.over, phase: G.phase, station: STATIONS[G.st].id, freq: +G.freq.toFixed(2), found: G.found.size, hits: G.hits, parties: G.parties, honks: G.honks, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.music.stop(); G.radioEl && G.radioEl.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
