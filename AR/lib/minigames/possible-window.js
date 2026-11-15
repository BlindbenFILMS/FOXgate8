// ALL THE POSSIBILITIES (Raquel Alim): SHOW HER.  (polished 5 Nov 2026)
// "If I were able to sit down with my 12-year-old self, I would show her the art of other visually impaired people…
//  so that little girl could decide where she wants to go in life and how many options she has."
// One simple thing to do: tap. Raquel sits beside her younger self in front of a great round window. Each tap opens the
// window onto another Blind Canvas painting by a visually impaired artist, and you HEAR it too: a piano, dancing feet,
// brush strokes, the goalball bell rolling past, a bike bell, a sewing machine, the sea and gulls, a deep drum, a shower
// of stars. The painting swirls in, then settles sharp and clear. A light flies from the window to the girl and stays
// with her, so by the end she has nine lights around her. Then the lights circle the window, she turns to Raquel, and
// Raquel reads her own words (her recording, art_11).
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = new URL('../../media/games/possible/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
const ARTIST = new URL('../../../3D/gallery/audio/art_11.mp3', import.meta.url).href;   // Raquel, in her own words
// what the window shows: a painting from the gallery, what it says she could do, and the colour of her light
const SHOW = [
  { id: 'reaching-past-blindness', title: 'Reaching Past Blindness', word: 'Make music', say: 'She could make music.', by: 'Rusty Perez', col: '#ffd54a' },
  { id: 'all-lifes-beauty', title: 'All Life’s Beauty', word: 'Dance', say: 'She could dance.', by: 'Dave Steele', col: '#ff8a5c' },
  { id: 'flow-state', title: 'Flow State', word: 'Paint', say: 'She could paint.', by: 'Raquel Alim', col: '#ff5fa8' },
  { id: 'goalball-is', title: 'Goalball Is…', word: 'Play sports', say: 'She could play sports.', by: 'Ricky Ruzicka', col: '#56d6ff' },
  { id: 'pedals-of-freedom', title: 'Pedals of Freedom', word: 'Ride a bike', say: 'She could ride a bike.', by: 'Bill McCann', col: '#7ef08a' },
  { id: 'haute-couture-dreams', title: 'Haute Couture Dreams', word: 'Design fashion', say: 'She could design fashion.', by: 'Shardasia Hadley', col: '#c9a0ff' },
  { id: 'seeing-the-world-together', title: 'Seeing the World Together', word: 'See the world', say: 'She could see the world.', by: 'Ricky Ruzicka', col: '#3aa8ff' },
  { id: 'the-power-within', title: 'The Power Within', word: 'Find her power', say: 'She could find her power.', by: 'Academy of Music for the Blind', col: '#ff4a32' },
  { id: 'a-bright-future', title: 'A Bright Future', word: 'Anything she dreams', say: 'And anything she dreams.', by: 'Academy of Music for the Blind', col: '#ffffff' },
];
const WAIT = 3.6;       // seconds before the next tap opens the window again
const SAY_AT = 1.1;     // the line comes in as the painting settles
const LAND_AT = 1.6;    // the light reaches the girl
const HINT_AFTER = 9;   // seconds without a tap before the hint

// where each light rests: an arc above the girl's head (u, v on the painting)
const slot = i => { const a = Math.PI * (0.88 - 0.76 * i / (SHOW.length - 1)); return [0.30 + 0.17 * Math.cos(a), 0.44 - 0.135 * Math.sin(a)]; };
const WIN = [0.62, 0.30];   // the round window's centre

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, with the round window opening onto another painting (swirling as it changes, then settling sharp), the
// moons glowing, the white river of light flowing, and two heads that move: the girl lifts hers, Raquel leans toward her
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, win, picA, picB;
uniform float uT, uA, uMix, uOpen, uPulse, uLift, uLean, uTurn, uHasA, uHasB, uFocus;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec2 rot(vec2 p, vec2 c, float a){ vec2 d = p - c; float s = sin(a), k = cos(a); return c + vec2(k * d.x - s * d.y, s * d.x + k * d.y); }
vec2 bend(vec2 p, vec2 neck, vec2 head, float r, float a, vec2 shift){
  float w = 1.0 - smoothstep(r * 0.55, r, length(p - head));
  return rot(p, neck, a * w) + shift * w;
}
vec3 inWin(sampler2D t, vec2 p){
  vec2 q = (p - vec2(0.62, 0.30)) / 0.29 * 0.5 + 0.5;
  return texture2D(t, vec2(clamp(q.x, 0.0, 1.0), 1.0 - clamp(q.y, 0.0, 1.0))).rgb;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  s = bend(s, vec2(0.30, 0.56), vec2(0.30, 0.49), 0.095, -uTurn * 0.09 + uLift * 0.03, vec2(0.0, uLift * 0.012));
  s = bend(s, vec2(0.63, 0.45), vec2(0.635, 0.35), 0.13, uLean * 0.05, vec2(0.0));
  float river = smoothstep(0.22, 0.25, p.y) * (1.0 - smoothstep(0.30, 0.33, p.y)) * (1.0 - smoothstep(0.5, 0.62, p.x));
  s.y += sin(p.x * 30.0 - uT * 1.6) * 0.003 * river;
  vec3 c = at(s);
  float m1 = length(p - vec2(0.448, 0.187)), m2 = length(p - vec2(0.697, 0.181));
  float glow = 0.85 + 0.15 * sin(uT * 1.3);
  c += vec3(1.0, 0.95, 0.85) * (exp(-max(m1 - 0.055, 0.0) * 40.0) * 0.12 + exp(-max(m2 - 0.06, 0.0) * 40.0) * 0.12) * glow;
  float W = texture2D(win, vec2(p.x, 1.0 - p.y)).r;
  if (W > 0.001 && uOpen > 0.001) {
    vec2 cc = vec2(0.62, 0.30); float r = length(p - cc) / 0.29;
    float sw = uMix * (1.0 - uMix) * 4.0;                 // swirl while the picture changes
    vec2 q = rot(p, cc, sw * 2.2 * (1.0 - r) + 0.02 * sin(uT * 0.4) * (1.0 - uFocus));
    vec3 a = inWin(picA, q), b = inWin(picB, q);
    vec3 pic = mix(a * uHasA + c * (1.0 - uHasA), b * uHasB + c * (1.0 - uHasB), smoothstep(0.0, 1.0, uMix));
    // a little of the brushwork while it swirls, so it looks painted in; once it settles, sharp and clear
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    pic = mix(pic, pic * (0.75 + 0.5 * lum), 0.35 * (1.0 - uFocus) + 0.06);
    pic *= 1.0 + 0.06 * uFocus;
    c = mix(c, pic, W * uOpen * (0.9 + 0.1 * uFocus));
  }
  float rim = abs(length(p - vec2(0.62, 0.30)) - 0.30);
  c += vec3(1.0, 0.78, 0.4) * exp(-rim * 70.0) * uPulse * 0.6 * (1.0 - smoothstep(0.45, 0.6, p.y));
  gl_FragColor = vec4(c, uA);
}`;

/* ─────────────── the lights the girl keeps: glass orbs that glow, shimmer and twinkle ─────────────── */
const hex = (c, k) => { const n = parseInt(c.slice(1), 16), f = v => Math.round(Math.max(0, Math.min(255, k > 0 ? v + (255 - v) * k : v * (1 + k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
// a soft glow in the light's colour (normal blending, so it still shows on the pale paint)
function haloTex(col) {
  return K.canvasTex(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, hex(col, 0.2)); r.addColorStop(0.35, hex(col, 0)); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.8; g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
}
// a little glass marble: lit from the top left, a bright highlight, a soft reflected rim, and a fine dark edge
function orbTex(col) {
  return K.canvasTex(128, 128, g => {
    g.fillStyle = 'rgba(30,18,8,.55)'; g.beginPath(); g.arc(64, 64, 40, 0, Math.PI * 2); g.fill();
    const b = g.createRadialGradient(52, 50, 2, 64, 64, 38);
    b.addColorStop(0, '#ffffff'); b.addColorStop(0.18, hex(col, 0.75)); b.addColorStop(0.55, col); b.addColorStop(1, hex(col, -0.45));
    g.fillStyle = b; g.beginPath(); g.arc(64, 64, 37, 0, Math.PI * 2); g.fill();
    g.strokeStyle = hex(col, 0.6); g.globalAlpha = 0.7; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 31, 0.1 * Math.PI, 0.65 * Math.PI); g.stroke();
    g.globalAlpha = 0.95; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(51, 47, 10, 6, -0.6, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.8; g.beginPath(); g.arc(76, 80, 3, 0, Math.PI * 2); g.fill();
  });
}
// a four-point star: long thin rays in the light's colour with a white heart, and short diagonal rays
function starTex(col) {
  return K.canvasTex(128, 128, g => {
    const ray = (len, w, a) => { g.save(); g.translate(64, 64); g.rotate(a); g.beginPath(); g.moveTo(-len, 0); g.quadraticCurveTo(0, -w, len, 0); g.quadraticCurveTo(0, w, -len, 0); g.fill(); g.restore(); };
    g.fillStyle = hex(col, 0.15); g.globalAlpha = 0.9; ray(62, 9, 0); ray(62, 9, Math.PI / 2); ray(30, 6, Math.PI / 4); ray(30, 6, -Math.PI / 4);
    g.fillStyle = '#ffffff'; g.globalAlpha = 1; ray(46, 5, 0); ray(46, 5, Math.PI / 2);
    const c = g.createRadialGradient(64, 64, 0, 64, 64, 14); c.addColorStop(0, '#fff'); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.fillRect(40, 40, 48, 48);
  });
}

/* ───────────────────────── a warm, slow music box, and a little sound picture for each possibility ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function musicBox(ac) {
  const master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(master);
  const panner = (p, dest, to = null, t0 = 0, dur = 0) => {
    if (!ac.createStereoPanner) return dest;
    const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p));
    if (to !== null) { n.pan.setValueAtTime(p, t0); n.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, to)), t0 + dur); }
    n.connect(dest); return n;
  };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(panner(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  const nbuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); { const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  function noise(t, dur, { vol = 0.1, freq = 1200, q = 1, type = 'bandpass', p = 0, pTo = null, sweep = 0, att = 0.01 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nbuf; s.loop = true;
    f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(panner(p, fx, pTo, t, dur)); s.start(t, Math.random()); s.stop(t + dur + 0.03);
  }
  const O = { out: fx };
  // each sound picture is about 1.5–2 seconds, played as the window swirls
  const SCENES = [
    t => [72, 76, 79, 84, 83, 79, 84].forEach((m, k) => { const d = [0, .16, .32, .48, .72, .88, 1.1][k];   // make music: a little piano tune
      tone(t + d, midi(m), 1.0, { ...O, type: 'triangle', vol: 0.07, p: -0.3 + k * 0.1 }); tone(t + d, midi(m + 12), 0.4, { ...O, vol: 0.015 }); }),
    t => { [0, .28, .56, .7, .84, 1.12, 1.4].forEach((d, k) => noise(t + d, 0.07, { vol: 0.22, freq: 2200, q: 0.8, type: 'highpass', p: k % 2 ? 0.45 : -0.45 }));   // dance: light steps…
      noise(t + 1.5, 0.5, { vol: 0.08, freq: 500, sweep: 4000, q: 1.2, p: -0.5, pTo: 0.5 }); },                                                                         // …and a twirl
    t => [0, .55, 1.1].forEach((d, k) => noise(t + d, 0.48, { vol: 0.16, freq: 1300, sweep: 2600, q: 0.7, att: 0.12, p: -0.7, pTo: 0.7 })),   // paint: three brush strokes
    t => { for (let k = 0; k < 22; k++) { const p = -0.9 + 1.8 * k / 21;                                                                        // goalball: the bell ball rolls past…
        [2600, 3300, 4100].forEach((f, j) => tone(t + k * 0.065 + j * 0.012, f * (1 + 0.02 * Math.sin(k)), 0.12, { ...O, vol: 0.02, p })); }
      noise(t, 1.45, { vol: 0.07, freq: 180, type: 'lowpass', q: 0.5, att: 0.3, p: -0.9, pTo: 0.9 });
      tone(t + 1.5, 120, 0.35, { ...O, vol: 0.2, slide: 0.45 }); },                                                                              // …and is caught: thud
    t => { for (let k = 0; k < 30; k++) noise(t + k * 0.05, 0.025, { vol: 0.03 + 0.07 * Math.sin(Math.PI * k / 29), freq: 4200, q: 3, p: -0.9 + 1.8 * k / 29 });   // bike: freewheel passing…
      [0.45, 0.8].forEach(d => { tone(t + d, 2150, 0.7, { ...O, vol: 0.06, p: -0.3 + d * 0.5 }); tone(t + d, 2790, 0.5, { ...O, vol: 0.04, p: -0.3 + d * 0.5 }); }); },   // …ring ring
    t => { for (let k = 0; k < 18; k++) noise(t + k * 0.07, 0.03, { vol: 0.13, freq: 1800, q: 2.5, p: 0.25 });                                 // fashion: the sewing machine…
      tone(t, 95, 1.25, { ...O, type: 'square', vol: 0.012, att: 0.05, p: 0.25 });
      [1.45, 1.6].forEach(d => noise(t + d, 0.06, { vol: 0.2, freq: 5000, q: 2, p: -0.2 })); },                                                  // …and a snip
    t => { noise(t, 2.2, { vol: 0.12, freq: 700, type: 'lowpass', q: 0.4, att: 0.8, p: 0.6, pTo: -0.6 });                                       // the world: the sea…
      [0.5, 1.1].forEach((d, k) => { tone(t + d, 1500, 0.28, { ...O, vol: 0.04, slide: 0.7, p: k ? 0.6 : -0.5 }); tone(t + d + 0.3, 1350, 0.35, { ...O, vol: 0.035, slide: 0.65, p: k ? 0.6 : -0.5 }); }); },   // …and gulls
    t => { [0, 0.5].forEach(d => { tone(t + d, 80, 1.0, { ...O, vol: 0.32, slide: 0.5 }); noise(t + d, 0.12, { vol: 0.12, freq: 150, type: 'lowpass' }); });   // her power: deep drum…
      [53, 57, 60, 65].forEach((m, k) => tone(t + 1.0 + k * 0.12, midi(m + 12), 1.1, { ...O, type: 'sawtooth', vol: 0.012, att: 0.3 })); },                        // …and it rises
    t => { const P = [84, 86, 88, 91, 93, 96, 98, 100];                                                                                       // anything she dreams: a shower of stars
      for (let k = 0; k < 16; k++) tone(t + k * 0.1, midi(P[(k * 5) % P.length]), 0.9, { ...O, type: 'triangle', vol: 0.03, p: Math.sin(k * 1.7) * 0.8 });
      [65, 72, 77].forEach(m => tone(t, midi(m), 2.4, { ...O, vol: 0.03, att: 0.5 })); },
  ];
  // F, Dm, Bb, C: soft pads with a slow plucked line on top
  const CH = [[53, 60, 65, 69], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]];
  let next = 0, step = 0, timer = null, warm = 0;
  function schedule() {
    while (next < ac.currentTime + 0.2) {
      const ch = CH[step % 4];
      ch.forEach(m => tone(next, midi(m), 4.2, { vol: 0.018 + 0.012 * warm, att: 1.0 }));
      [0, 1, 2, 3].forEach(i => tone(next + i * 0.9, midi(ch[(i + step) % 4] + 12), 1.2, { type: 'triangle', vol: 0.014 + 0.006 * warm, att: 0.01, p: (i - 1.5) * 0.3 }));
      next += 3.6; step++;
    }
  }
  const NOTES = [65, 67, 69, 72, 74, 77, 79, 81, 84];   // each light's own note: together they climb a scale
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 60); schedule(); bus.gain.setTargetAtTime(0.8, ac.currentTime, 1.2); },
    scene(i) { SCENES[i](ac.currentTime + 0.05); },
    land(i) { const t = ac.currentTime + 0.01, m = NOTES[Math.min(i, NOTES.length - 1)]; warm = Math.min(1, i / 8);
      tone(t, midi(m), 2.2, { type: 'triangle', vol: 0.06, out: fx, p: -0.45 }); tone(t, midi(m + 12), 1.2, { vol: 0.02, out: fx, p: -0.45 }); },
    twinkle(i, p) { const t = ac.currentTime + 0.01, m = NOTES[Math.min(i, NOTES.length - 1)] + 24;
      tone(t, midi(m), 0.6, { type: 'sine', vol: 0.007, out: fx, p }); tone(t + 0.07, midi(m + 7), 0.45, { vol: 0.004, out: fx, p }); },
    end() { const t = ac.currentTime + 0.1; [65, 69, 72, 77, 81, 84, 89].forEach((m, i) => tone(t + i * 0.18, midi(m), 4, { type: 'triangle', vol: 0.045, att: 0.05, out: fx, p: -0.6 + i * 0.2 })); },
    hush() { master.gain.setTargetAtTime(0.3, ac.currentTime, 0.6); },      // a soft bed while Raquel speaks
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { clearInterval(timer); timer = null; try { master.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function showHerGame() {
  let G = null;

  function load(i, cb) {
    if (G.tex[i]) return cb(G.tex[i]);
    new THREE.TextureLoader().load(ART + SHOW[i].id + '.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.tex[i] = t; cb(t); }, undefined, () => cb(null));
  }
  const later = (secs, fn) => G.queue.push({ t: secs, fn });   // timers that stop while the game is paused
  function panel(s) {
    if (s) G.ui.panel(`Show her · ${G.n} of ${SHOW.length}`, s.word, { segs: [G.n, SHOW.length], sub: `${s.title} · ${s.by}` });
    else G.ui.panel('Show her', `${G.n} <small>of ${SHOW.length}</small>`, { segs: [G.n, SHOW.length] });
  }
  // open the window onto the next possibility
  function next() {
    if (G.phase !== 'play' || G.wait > 0 || G.n >= SHOW.length) return;
    const i = G.n; G.n++; G.wait = WAIT; G.idle = 0;
    G.band.scene(i); G.buzz && G.buzz(20);
    G.pulse = 1; G.lift = 1;
    load(i, t => {
      if (!G) return;
      const u = G.uni;
      u.picA.value = u.picB.value; u.uHasA.value = u.uHasB.value;   // what was showing slides back to A; the new one comes in as B
      u.picB.value = t; u.uHasB.value = t ? 1 : 0; u.uMix.value = 0; G.mixing = true; G.focusTo = 0;
    });
    panel(SHOW[i]);
    // this possibility's light leaves the window and flies to the girl
    const L = G.lights[i]; L.fly = 0; L.on = true;
    for (let k = 0; k < 6; k++) G.sparks.push({ t: -k * 0.07, i, a: [WIN[0] - 0.08 + Math.random() * 0.16, WIN[1] - 0.06 + Math.random() * 0.12] });
    later(SAY_AT, () => G.say(SHOW[i].say));
    later(LAND_AT, () => { G.band.land(i); L.flash = 1; L.spark = 1.2; L.tw = 1.5 + Math.random() * 2; });
    if (G.n >= SHOW.length) later(WAIT, finish);
  }
  function finish() {
    G.phase = 'end'; G.ui.buttons([]); G.band.end(); G.turnTo = 1; G.circle = 0;
    later(3.2, () => {
      K.finale(G, { won: true, kicker: 'Show her', title: 'So many options', line: G.work && G.work.quote,
        cells: [{ k: 'Possibilities', v: String(SHOW.length) }], say: 'So many options.' });
      G.endT = 0;
    });
  }

  return {
    title: 'Show her',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', n: 0, wait: 0, mixing: false, focus: 0, focusTo: 0, pulse: 0, lift: 0, liftK: 0, turnTo: 0, turn: 0, lean: 0, open: 0,
        tex: [], sparks: [], queue: [], botT: 1, idle: 0, hints: 0, circle: -1, endT: 0, artist: null });
      G.band = musicBox(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blank.needsUpdate = true;
      G.uni = { map: { value: null }, win: { value: blank }, picA: { value: blank }, picB: { value: blank }, uT: { value: 0 }, uA: { value: 0 }, uMix: { value: 1 }, uOpen: { value: 0 },
        uPulse: { value: 0 }, uLift: { value: 0 }, uLean: { value: 0 }, uTurn: { value: 0 }, uHasA: { value: 0 }, uHasB: { value: 0 }, uFocus: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      new THREE.TextureLoader().load(ART + 'window.png', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.win.value = t; });
      load(0, () => {});
      // her nine lights (hidden until each is shown), and the little sparkles that trail them
      G.lights = SHOW.map((s, i) => {
        const halo = K.sprite(haloTex(s.col), 0.17, { order: 21, opacity: 0 }), sp = K.sprite(orbTex(s.col), 0.075, { order: 22, opacity: 0 });
        const core = K.sprite(K.glowTex, 0.05, { additive: true, order: 23, opacity: 0 }), star = K.sprite(starTex(s.col), 0.09, { order: 24, opacity: 0 });
        [halo, sp, core, star].forEach(m => G.root.add(m));
        return { halo, sp, core, star, on: false, fly: 0, flash: 0, spark: 0, tw: 1 + Math.random() * 2, ph: i * 0.9 }; });
      G.sparkS = []; for (let k = 0; k < 10; k++) { const sp = K.sprite(K.glowTex, 0.035, { additive: true, order: 20, opacity: 0 }); G.root.add(sp); G.sparkS.push(sp); }
      G.onGo = () => {
        G.phase = 'play'; G.band.start(); panel();
        G.ui.buttons([{ label: 'Show her', icon: '✦', kind: 'black', aria: 'Show her the next possibility', press: () => next() }]);
        for (let i = 1; i < SHOW.length; i++) load(i, () => {});
      };
      K.intro(G, { title: 'Show her', how: 'Tap to show the girl what she could do one day.',
        say: 'Show her. Raquel sits beside her 12-year-old self. Tap to show the girl what she could do one day.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // timers
      if (G.queue.length) { const due = []; G.queue = G.queue.filter(q => (q.t -= dt) > 0 || (due.push(q), false)); due.forEach(q => G && q.fn()); if (!G) return; }
      // when the end panel is up, Raquel reads her own words
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); } }
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      if (G.wait > 0) G.wait -= dt;
      if (G.phase === 'play') {
        if (G.bot) { G.botT -= dt; if (G.botT <= 0) { G.botT = WAIT + 0.2; next(); } }
        else if (G.wait <= 0 && (G.idle += dt) > HINT_AFTER) { G.idle = 0; if (G.hints++ < 3) { G.say('Tap to show her more.'); G.pulse = 1; } }
      }
      if (G.n > 0) G.open = Math.min(1, G.open + dt * 1.2);
      u.uOpen.value = G.open;
      if (G.mixing) { u.uMix.value = Math.min(1, u.uMix.value + dt / 1.2); if (u.uMix.value >= 1) { G.mixing = false; G.focusTo = 1; } }
      G.focus += (G.focusTo - G.focus) * Math.min(1, dt * 3); u.uFocus.value = G.focus;
      G.pulse *= Math.pow(0.25, dt); u.uPulse.value = G.pulse + 0.15 * G.open * (0.5 + 0.5 * Math.sin(G.t * 1.5));
      G.lift *= Math.pow(0.4, dt); G.liftK += ((G.n ? 0.35 : 0) + G.lift * 0.65 - G.liftK) * Math.min(1, dt * 4);
      u.uLift.value = G.liftK * (1 - G.turn);
      G.turn += (G.turnTo - G.turn) * Math.min(1, dt * 1.5); u.uTurn.value = G.turn;
      G.lean += (G.turnTo * 1 + (G.n ? 0.25 : 0) - G.lean) * Math.min(1, dt * 1.2); u.uLean.value = G.lean;
      // her lights: fly from the window to their place above her, bob gently; at the end they circle the window
      if (G.circle >= 0) G.circle = Math.min(1, G.circle + dt * 0.5);
      G.lights.forEach((L, i) => {
        if (!L.on) { L.halo.material.opacity = L.sp.material.opacity = L.core.material.opacity = L.star.material.opacity = 0; return; }
        L.fly = Math.min(1, L.fly + dt / LAND_AT); L.flash *= Math.pow(0.1, dt); L.spark *= Math.pow(0.02, dt);
        // now and then each light twinkles (with a tiny high chime from its side)
        if (L.fly >= 1 && (L.tw -= dt) <= 0) { L.tw = 1.6 + Math.random() * 2.8; L.spark = 1; if (!G.artist && !G.paused) G.band.twinkle(i, (L.u || 0.3) * 2 - 1); }
        const e = L.fly * L.fly * (3 - 2 * L.fly), [su, sv] = slot(i);
        let pu = WIN[0] + (su - WIN[0]) * e, pv = WIN[1] + (sv - WIN[1]) * e - Math.sin(L.fly * Math.PI) * 0.06;
        pv += Math.sin(G.t * 1.6 + L.ph) * 0.006 * e;
        if (G.circle >= 0) { const c = G.circle * G.circle * (3 - 2 * G.circle), a = i / SHOW.length * Math.PI * 2 + G.t * 0.35;
          pu += (WIN[0] + 0.315 * Math.cos(a) - pu) * c; pv += (WIN[1] + 0.315 * Math.sin(a) - pv) * c; }
        L.u = pu;
        const [x, y] = G.S.P(pu, pv), a = Math.min(1, L.fly * 3);
        const w = 0.5 + 0.5 * Math.sin(G.t * 2.2 - i * 0.8);           // a shimmer that ripples along the arc
        const sz = 0.075 * (0.7 + 0.3 * e) * (1 + 0.45 * L.flash + 0.05 * Math.sin(G.t * 2.4 + L.ph));
        L.halo.position.set(x, y, 0.062); L.sp.position.set(x, y, 0.065); L.core.position.set(x, y, 0.066); L.star.position.set(x, y, 0.067);
        L.halo.scale.setScalar(sz * (2.0 + 0.5 * w + 0.8 * L.spark + 0.8 * L.flash)); L.halo.material.opacity = a * (0.45 + 0.3 * w + 0.25 * L.spark);
        L.sp.scale.setScalar(sz); L.sp.material.opacity = a;
        L.core.scale.setScalar(sz * (0.55 + 0.25 * w + 0.4 * L.spark)); L.core.material.opacity = a * (0.35 + 0.35 * w + 0.5 * L.spark);
        L.star.scale.setScalar(sz * (0.55 + 0.45 * w + 1.4 * L.spark + 0.8 * L.flash)); L.star.material.opacity = a * Math.min(1, 0.25 + 0.45 * w + L.spark + L.flash);
        L.star.material.rotation = G.t * 0.5 + L.ph + L.spark * 0.6;
      });
      if (G.phase === 'end' && G.turn > 0.5 && G.circle < 0) G.circle = 0;
      // sparkles trailing each new light
      let k = 0;
      G.sparks = G.sparks.filter(s => (s.t += dt) < LAND_AT);
      for (const s of G.sparks) { if (k >= G.sparkS.length) break; const f = Math.max(0, s.t) / LAND_AT, e = f * f * (3 - 2 * f), [su, sv] = slot(s.i);
        const [x, y] = G.S.P(s.a[0] + (su - s.a[0]) * e, s.a[1] + (sv - s.a[1]) * e - Math.sin(f * Math.PI) * 0.07);
        const sp = G.sparkS[k++]; sp.position.set(x, y, 0.06); sp.material.color.set(SHOW[s.i].col); sp.material.opacity = s.t < 0 ? 0 : Math.sin(f * Math.PI) * 0.85; }
      for (; k < G.sparkS.length; k++) G.sparkS[k].material.opacity = 0;
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      if (kind === 'down') next();
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(G.artist ? 0.3 : 1); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'possible', playing: G.playing, over: G.over, phase: G.phase, n: G.n, mix: +G.uni.uMix.value.toFixed(2),
      focus: +G.focus.toFixed(2), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
