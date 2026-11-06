// FULL IMMERSION (Sophia Dunn-Walker): STREET OF SENSES.
// "The cobblestones feel different. The way it smells is different. The lighting is different. The languages you hear
// are different. It's a very, very rich experience."
// You walk up Sophia's own market street: the painting slowly moves in around you, step by step, the orange banners
// flutter, the umbrellas sway and the light streaks drift down between the buildings. Things in the street come alive
// one at a time, on the LEFT or the RIGHT, each with its own sound: fresh bread at the stall, a sizzling pan under the
// blue umbrella, voices in another language, cobblestones under your feet, church bells, a flag in the wind… Step
// toward it (press its side, or tap that side of the painting) to catch the moment. Every catch lets more light into
// the street. Catch 10 and the light floods the whole street.
// Each moment has a pulsing target with a big TAP sign: its red ring drains as the moment's time runs out. Catch it and
// light bursts out of it and sparks fly up into the sky; every catch rings a little higher. At the end every moment in
// the street lights up, one after another, as the light floods in.
// Everything is drawn from the painting itself with one shader (no extra pictures needed).
import * as THREE from 'three';
import * as K from './kit.js';

const NEED = 10, WINDOW = 4.2, GAP = 1.3;   // moments to catch; seconds each one stays; seconds between them
const Z = [0.5, 0.47];                       // where the street leads (the walk zooms in toward here)
// the moments: where they are in the painting (pixels of the 768 painting), their side, their sense, their sound
const MOMENTS = [
  { x: 285, y: 425, side: -1, sense: 'Smell', snd: 'bread', line: 'Fresh bread, on the left.' },
  { x: 408, y: 515, side: 1, sense: 'Smell', snd: 'sizzle', line: 'A sizzling pan, on the right.' },
  { x: 62, y: 240, side: -1, sense: 'Light', snd: 'lamp', line: 'A warm lamp, on the left.' },
  { x: 425, y: 630, side: 1, sense: 'Language', snd: 'voices', line: 'Voices in another language, on the right.' },
  { x: 250, y: 720, side: -1, sense: 'Cobblestones', snd: 'cobbles', line: 'Cobblestones under your feet, on the left.' },
  { x: 392, y: 90, side: 1, sense: 'Wind', snd: 'flag', line: 'A flag in the wind, on the right.' },
  { x: 322, y: 378, side: -1, sense: 'Smell', snd: 'spice', line: 'Spices, on the left.' },
  { x: 418, y: 262, side: 1, sense: 'Sound', snd: 'music', line: 'Street music, on the right.' },
  { x: 125, y: 380, side: -1, sense: 'Sound', snd: 'bells', line: 'Church bells, on the left.' },
  { x: 480, y: 120, side: 1, sense: 'Light', snd: 'sun', line: 'Sunlight, on the right.' },
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uA, uT, uZoom, uLight, uFlood, uBob;
uniform vec3 uG;
uniform vec3 uF;
const vec2 Z = vec2(${Z[0]}, ${Z[1]});
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
float box(vec2 p, vec4 b){ return smoothstep(b.x - 0.01, b.x + 0.01, p.x) * smoothstep(b.z + 0.01, b.z - 0.01, p.x) * smoothstep(b.y - 0.01, b.y + 0.01, p.y) * smoothstep(b.w + 0.01, b.w - 0.01, p.y); }
vec2 sway(vec2 s, vec2 c, float r, float k){ vec2 d = s - c; float w = smoothstep(r, r * 0.5, length(d)); float a = k * w; return c + mat2(cos(a), -sin(a), sin(a), cos(a)) * d; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // walking up the street: the painting moves in around you, with a little step in each stride
  vec2 s = Z + (p - Z) / uZoom;
  s.y += uBob * 0.0025; s.x += uBob * 0.001;
  // the banners flutter
  float fl = box(s, vec4(0.48, 0.0, 0.535, 0.25)) + box(s, vec4(0.40, 0.08, 0.47, 0.2)) + box(s, vec4(0.135, 0.37, 0.2, 0.63));
  s.x += sin(s.y * 46.0 - uT * 5.0) * 0.005 * fl;
  // the umbrellas sway
  s = sway(s, vec2(0.531, 0.67), 0.04, 0.09 * sin(uT * 1.3));
  s = sway(s, vec2(0.497, 0.547), 0.032, 0.08 * sin(uT * 1.1 + 1.0));
  s = sway(s, vec2(0.419, 0.492), 0.03, 0.1 * sin(uT * 1.5 + 2.0));
  s = sway(s, vec2(0.352, 0.52), 0.03, 0.08 * sin(uT * 1.2 + 3.0));
  vec3 col = at(s);
  // light streaks drifting down between the buildings, brighter with every catch
  float L = dot(col, vec3(0.299, 0.587, 0.114));
  float streak = pow(0.5 + 0.5 * sin((s.x * 0.85 - s.y * 0.45) * 38.0 + uT * 0.7), 10.0);
  float sky = smoothstep(0.75, 0.0, s.y) * smoothstep(0.2, 0.65, L + 0.15);
  col *= 0.72 + 0.38 * uLight;
  col += vec3(1.0, 0.9, 0.7) * streak * sky * (0.08 + 0.3 * uLight);
  // the moment that's calling glows
  float g = smoothstep(0.1, 0.0, length(p - uG.xy));
  col += vec3(1.0, 0.82, 0.55) * g * uG.z * 0.55;
  // a burst of light where you caught it
  float fr = length(p - uF.xy);
  col += vec3(1.0, 0.9, 0.7) * uF.z * smoothstep(0.04 + 0.2 * (1.0 - uF.z), 0.0, fr) * 0.95;
  // the flood of light at the end
  col = mix(col, col * 1.35 + vec3(0.22, 0.17, 0.1), uFlood * (0.4 + 0.6 * smoothstep(0.9, 0.1, s.y)));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the street: music and sounds ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [40, 47, 52, 56]];   // Am · G · F · E
function street(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = fx, sweep = 0, att = 0.004 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = fx, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  function syll(t, f, dur, p, vol = 0.12) {   // one syllable of a far-off voice
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (0.9 + Math.random() * 0.25), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const fs = [[500 + Math.random() * 400, 6], [1400 + Math.random() * 900, 8]];
    for (const [fq, q] of fs) { const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q; o.connect(bp).connect(g); }
    g.connect(pan(p, fx)); o.start(t); o.stop(t + dur + 0.05);
  }
  const beat = 60 / 100;
  let next = 0, step = 0, timer = null, light = 0;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b = step % 8, bar = Math.floor(step / 8), ch = CHORDS[bar % 4];
      // your footsteps on the stones, left, right
      if (b % 2 === 0) noise(t, 0.05, { freq: 1800, q: 3, vol: 0.05, p: b % 4 ? 0.25 : -0.25, out: bus });
      if (b === 0) tone(t, midi(ch[0] - 12), beat * 3.5, { type: 'triangle', vol: 0.12, att: 0.03, out: bus });
      // a street guitar, picking the chord
      tone(t, midi(ch[[1, 2, 3, 2, 1, 2, 3, 2][b]] + 12), beat * 0.9, { type: 'triangle', vol: 0.026 + light * 0.004, att: 0.004, out: bus });
      if (light > 3 && (b === 3 || b === 7)) tone(t + beat * 0.25, midi(ch[3] + 24), beat * 0.6, { vol: 0.018, out: bus });
      next += beat / 2; step++;
    }
  }
  const SND = {
    bread(p) { const t = ac.currentTime + 0.01; for (let i = 0; i < 9; i++) noise(t + i * 0.07 + Math.random() * 0.04, 0.03, { freq: 2500 + Math.random() * 2000, q: 2, vol: 0.15, p }); tone(t, 220, 0.7, { vol: 0.06, att: 0.1, p }); },
    sizzle(p) { const t = ac.currentTime + 0.01; noise(t, 1.0, { freq: 6000, type: 'highpass', vol: 0.12, p, att: 0.05 }); for (let i = 0; i < 6; i++) noise(t + Math.random() * 0.8, 0.02, { freq: 4000, q: 3, vol: 0.12, p }); },
    lamp(p) { const t = ac.currentTime + 0.01; tone(t, 110, 0.9, { type: 'sawtooth', vol: 0.015, att: 0.2, p }); [880, 1108.7, 1318.5].forEach((f, i) => tone(t + 0.1 + i * 0.07, f, 0.7, { vol: 0.04, p })); },
    voices(p) { const t = ac.currentTime + 0.01; for (let i = 0; i < 6; i++) syll(t + i * 0.15 + Math.random() * 0.05, 180 + Math.random() * 120, 0.13, p); for (let i = 0; i < 4; i++) syll(t + 0.2 + i * 0.18, 260 + Math.random() * 80, 0.14, p * 0.8, 0.08); },
    cobbles(p) { const t = ac.currentTime + 0.01; for (let i = 0; i < 6; i++) noise(t + i * 0.14, 0.05, { freq: 1200 + (i % 2) * 500, q: 5, vol: 0.3, p }); },
    flag(p) { const t = ac.currentTime + 0.01; noise(t, 1.0, { freq: 400, sweep: 1500, q: 0.8, vol: 0.25, p, att: 0.2 }); for (let i = 0; i < 4; i++) noise(t + 0.15 + i * 0.18, 0.06, { freq: 700, q: 1.5, vol: 0.2, p }); },
    spice(p) { const t = ac.currentTime + 0.01; for (let i = 0; i < 8; i++) noise(t + i * 0.09, 0.05, { freq: 7000, type: 'highpass', vol: 0.08, p }); tone(t + 0.2, 1567.98, 0.8, { vol: 0.04, p }); tone(t + 0.35, 2093, 0.7, { vol: 0.03, p }); },
    music(p) { const t = ac.currentTime + 0.01; [69, 72, 76, 74, 72, 71].forEach((m, i) => tone(t + i * 0.14, midi(m + 12), 0.3, { type: 'triangle', vol: 0.08, att: 0.004, p })); },
    bells(p) { const t = ac.currentTime + 0.01; [[392, 0], [329.6, 0.5]].forEach(([f, d]) => { tone(t + d, f, 1.6, { vol: 0.08, p }); tone(t + d, f * 2.76, 0.9, { vol: 0.025, p }); tone(t + d, f * 5.4, 0.5, { vol: 0.012, p }); }); },
    sun(p) { const t = ac.currentTime + 0.01; [76, 79, 83, 88].forEach((m, i) => tone(t + i * 0.09, midi(m), 1.1, { vol: 0.04, p })); noise(t, 1.0, { freq: 5000, q: 0.5, vol: 0.04, p, att: 0.3 }); },
  };
  return {
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.8); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    light(n) { light = n; },
    play(name, p) { SND[name] && SND[name](p); },
    // each catch rings a little higher, climbing up the scale as the street fills with light
    ok(p, n) { const t = ac.currentTime + 0.01, S = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81], b = S[Math.min(S.length - 1, n)];
      [0, 7, 12, 19].forEach((d, i) => tone(t + i * 0.05, midi(b + d), 0.7, { type: 'triangle', vol: 0.07, p })); tone(t, midi(b + 24), 0.9, { vol: 0.03, p });
      noise(t, 0.6, { freq: 6000, sweep: 12000, q: 0.6, vol: 0.05, p, att: 0.02 }); },
    sparkle(p) { const t = ac.currentTime + 0.01; [88, 91, 95].forEach((m, i) => tone(t + i * 0.04, midi(m), 0.25, { vol: 0.03, p })); },
    no(p) { tone(ac.currentTime + 0.01, 220, 0.3, { type: 'triangle', vol: 0.06, p, slide: 180 }); },
    pass() { noise(ac.currentTime + 0.01, 0.5, { freq: 800, sweep: 300, q: 0.7, vol: 0.08 }); },
    finale() { const t = ac.currentTime + 0.1; [57, 60, 64, 69, 72, 76, 81].forEach((m, i) => tone(t + i * 0.14, midi(m), 3.4, { type: 'triangle', vol: 0.055, att: 0.05 })); noise(t, 2.6, { freq: 3000, q: 0.5, vol: 0.06, sweep: 9000, att: 0.4 }); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function streetOfSensesGame() {
  let G = null;
  // where a moment is on the screen right now (the walk has moved the painting in)
  const cl = (x) => Math.min(0.92, Math.max(0.08, x));
  const shown = (m) => [cl(Z[0] + (m.u - Z[0]) * G.zoom), cl(Z[1] + (m.v - Z[1]) * G.zoom)];
  const pan = (m) => m.side * 0.85;

  function hud() {
    const sub = G.cur ? G.cur.line : G.caught >= NEED ? 'The whole street is full of light' : G.lastSense ? `${G.lastSense}! Walking on…` : 'Walking up the street…';
    G.ui.panel('Street of senses', `${G.caught}<small>of ${NEED} moments</small>`, { segs: [G.caught, NEED], sub });
  }
  function next() {
    if (!G.queue.length) G.queue = G.moments.slice().sort(() => Math.random() - 0.5);
    let m = G.queue.shift();
    if (G.last && m.side === G.last.side && G.sameSide >= 2) { G.queue.push(m); m = G.queue.find(q => q.side !== G.last.side) || G.queue[0]; G.queue.splice(G.queue.indexOf(m), 1); }
    G.sameSide = G.last && G.last.side === m.side ? G.sameSide + 1 : 1;
    G.cur = m; G.last = m; G.curT = 0; G.sndT = 0.25; G.glowA = 0;
    G.say(m.line);
    hud();
  }
  function step(side) {
    if (!G || !G.playing || G.over) return;
    const m = G.cur;
    if (!m) { G.band.no(side * 0.6); return; }
    if (side === m.side) {
      G.cur = null; G.caught++; G.band.ok(pan(m), G.caught); G.band.light(G.caught); G.buzz([30, 30, 60]);
      const [u, v] = shown(m), [x, y] = G.S.P(u, v);
      G.fx.add(x, y, '#ffd890', 30, 0.4); G.fx.add(x, y, '#ffffff', 14, 0.6); G.sparks(x, y);
      G.flash.set(u, v, 1); G.tapPop = 1;
      G.lastSense = m.sense;
      const left = NEED - G.caught;
      if (!left) { G.say(`${m.sense}. The whole street is full of light!`); G.endT = 0; G.band.finale(); hud(); return; }
      G.say(`${m.sense}. ${left} more.`); G.gapT = GAP + 0.8; hud();
    } else {
      G.wrong++; G.band.no(side * 0.6); G.buzz([20, 40, 20]);
      G.say(m.side < 0 ? 'Other way. On the left.' : 'Other way. On the right.');
    }
  }
  // the polish: the TAP sign, the ring that drains as time runs out, and sparks of light that fly up into the sky
  function makeFx() {
    G.tapTex = K.canvasTex(256, 128, (g, W, H) => {
      g.font = '900 92px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineJoin = 'round'; g.lineWidth = 18; g.strokeStyle = '#000'; g.strokeText('TAP', W / 2, H / 2 + 4); g.fillStyle = '#fff'; g.fillText('TAP', W / 2, H / 2 + 4);
    });
    G.tap = K.plane(G.tapTex, 0.17, 0.085, { order: 36, opacity: 0 }); G.tap.position.z = 0.08; G.root.add(G.tap);
    G.arcs = Array.from({ length: 13 }, (_, k) => K.canvasTex(128, 128, (g) => {
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 16; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#ec3013'; g.lineWidth = 11; g.beginPath(); g.arc(64, 64, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (k / 12) + 0.0001); g.stroke();
    }));
    const sparks = [];
    G.sparks = (x, y) => {
      for (let i = 0; i < 16; i++) {
        const sp = K.sprite(K.glowTex, 0.03 + Math.random() * 0.03, { color: i % 3 ? '#ffd890' : '#ffffff', additive: true, order: 34 });
        sp.position.set(x, y, 0.07); G.root.add(sp);
        sparks.push({ sp, vx: (Math.random() - 0.5) * 0.25, vy: 0.35 + Math.random() * 0.45, life: 0.9 + Math.random() * 0.6 });
      }
      G.band.sparkle((x) * 1.6);
    };
    G.fxUpdate = (dt) => {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life -= dt; s.vx *= 0.97; s.sp.position.x += s.vx * dt; s.sp.position.y += s.vy * dt; s.sp.material.opacity = Math.max(0, Math.min(1, s.life * 1.4));
        if (s.life <= 0) { G.root.remove(s.sp); s.sp.material.dispose(); sparks.splice(i, 1); }
      }
    };
  }
  // a tap on the painting: right on the moment always catches it; anywhere else steps to that side
  function tapAt(u, v) {
    const m = G.cur;
    if (m) { const [su, sv] = shown(m); if (Math.hypot(u - su, (v - sv) * G.h) < 0.16) { step(m.side); return; } }
    step(u < 0.5 ? -1 : 1);
  }

  return {
    title: 'Street of senses',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { lastSense: null, caught: 0, wrong: 0, passed: 0, cur: null, last: null, sameSide: 0, queue: [], curT: 0, sndT: -1, gapT: -1, endT: -1, glowA: 0, tapPop: 0, finI: 0, finT: 0, zoom: 1, walk: 0, t0: 0, botT: 0, light: 0, flood: 0 });
      G.moments = MOMENTS.map(m => ({ ...m, u: m.x / 768, v: m.y / 768 }));
      G.band = street(K.audio());
      makeFx();
      G.uni = { map: { value: null }, uA: { value: 0 }, uT: { value: 0 }, uZoom: { value: 1 }, uLight: { value: 0 }, uFlood: { value: 0 }, uBob: { value: 0 }, uG: { value: new THREE.Vector3() }, uF: { value: new THREE.Vector3() } };
      G.flash = G.uni.uF.value;
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.02; G.face.renderOrder = 11; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      G.ring = K.sprite(K.ringTex, 0.12, { opacity: 0, order: 25 }); G.ring.position.z = 0.05; G.root.add(G.ring);
      // a beacon on the moment that's calling, so it's easy to find: a red ring that breathes and white ripples
      G.rips = [0, 1, 2].map(() => { const r = K.sprite(K.ringTex, 0.1, { color: '#ffffff', opacity: 0, order: 24 }); r.position.z = 0.049; G.root.add(r); return r; });
      G.ui.buttons([
        { label: '← Left', kind: 'black', aria: 'Step to the left', press: () => step(-1) },
        { label: 'Right →', kind: 'black', aria: 'Step to the right', press: () => step(1) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); G.gapT = 1.2; };
      K.intro(G, { title: 'Street of senses', how: 'Walk up the market street. When something comes alive, TAP it, or press its side, to catch the moment.',
        say: 'Street of senses. You are walking up a market street in a city far from home. Listen. When something comes alive on the left or the right, tap it, or press its side, to catch the moment. Catch 10.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); G.fxUpdate(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni;
      U.uA.value += ((G.ready ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2.5); U.uT.value = G.t;
      // walking: a slow move into the street, faster as the light grows; a little step in each stride
      if (G.playing || G.endT >= 0) { G.walk += dt; G.zoom = Math.min(1.08, G.zoom + dt * (0.0012 + 0.0003 * G.caught)); }   // a gentle move in, so nothing at the edges leaves the picture
      U.uZoom.value = G.zoom; U.uBob.value = G.playing ? Math.sin(G.walk * Math.PI * 2 * 0.83) : 0;
      G.light += (G.caught / NEED - G.light) * Math.min(1, dt * 1.5); U.uLight.value = G.light;
      // the moment that's calling
      if (G.gapT > 0) { G.gapT -= dt; if (G.gapT <= 0 && G.endT < 0) next(); }
      if (G.cur) {
        G.curT += dt; G.sndT -= dt; if (G.sndT <= 0) { G.band.play(G.cur.snd, pan(G.cur)); G.sndT = 1.5; }
        if (G.curT > WINDOW) { G.passed++; G.queue.push(G.cur); G.cur = null; G.band.pass(); G.say('It passed by.'); G.gapT = GAP; hud(); }
      }
      if (G.bot && G.cur && G.curT > 1.1) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.5; step(G.cur.side); } }
      G.glowA += ((G.cur ? 0.6 + 0.4 * Math.abs(Math.sin(G.t * 3.5)) : 0) - G.glowA) * Math.min(1, dt * 6);
      if (G.cur) { const [u, v] = shown(G.cur); U.uG.value.set(u, v, G.glowA); const [x, y] = G.S.P(u, v); G.ring.position.set(x, y, 0.05); G.ring.scale.setScalar(0.09 + 0.025 * Math.abs(Math.sin(G.t * 5.5)));
        G.rips.forEach((r, i) => { const k = (G.t * 0.7 + i / 3) % 1; r.position.set(x, y, 0.049); r.scale.setScalar(0.09 + k * 0.22); r.material.opacity = (1 - k) * 0.8; }); }
      else { U.uG.value.z = G.glowA; G.rips.forEach(r => { r.material.opacity = Math.max(0, r.material.opacity - dt * 3); }); }
      G.ring.material.opacity = G.cur ? 1 : Math.max(0, G.ring.material.opacity - dt * 3);
      if (G.cur) { const k = Math.max(0, Math.min(12, Math.ceil(12 * (1 - G.curT / WINDOW)))); if (G.ring.material.map !== G.arcs[k]) { G.ring.material.map = G.arcs[k]; G.ring.material.needsUpdate = true; } }
      // the TAP sign: just above the moment (below it near the top), bouncing gently; it jumps when you catch
      G.flash.z = Math.max(0, G.flash.z - dt * 1.6);
      G.tapPop = Math.max(0, G.tapPop - dt * 3);
      if (G.cur) {
        const [u, v] = shown(G.cur), below = v < 0.2, [x, y] = G.S.P(u, v + (below ? 0.12 : -0.12));
        G.tap.position.set(Math.max(-0.4, Math.min(0.4, x)), y + Math.abs(Math.sin(G.t * 5.5)) * 0.008, 0.08);
        G.tap.scale.setScalar(1 + 0.06 * Math.sin(G.t * 5.5)); G.tap.material.opacity = Math.min(1, G.tap.material.opacity + dt * 6);
      } else { G.tap.scale.setScalar(1 + G.tapPop * 0.5); G.tap.material.opacity = Math.max(0, G.tap.material.opacity - dt * 4); }
      // the flood of light at the end
      if (G.endT >= 0) {
        G.endT += dt; G.flood = Math.min(1, G.endT / 2.2); U.uFlood.value = G.flood;
        G.finT -= dt;
        if (G.finI < G.moments.length && G.finT <= 0) { const m = G.moments[G.finI++], [u, v] = shown(m), [x, y] = G.S.P(u, v); G.fx.add(x, y, '#ffe6b0', 18, 0.3); G.sparks(x, y); G.finT = 0.22; }
        if (G.endT > 3.4 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('full-immersion:senses', t, 'lower');
          G.ui.hideAlert();
          K.finale(G, { won: true, kicker: 'Full immersion', title: 'You were really there', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Moments', v: `${NEED}/${NEED}` }, { k: 'Missed', v: String(G.passed + G.wrong) }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const p = G.S.toBoard(ev, G.root); if (p) tapAt(p.u, p.v);
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'street-senses', playing: G.playing, over: G.over, caught: G.caught, cur: G.cur && G.cur.snd, passed: G.passed, wrong: G.wrong, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.band) G.band.stop(); K.cleanup(G); G = null; },
  };
}
