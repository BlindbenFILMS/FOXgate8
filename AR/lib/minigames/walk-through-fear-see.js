// WALK THROUGH FEAR (Ben Fox): SEE IT MY WAY, a game about sight.
// Words are hidden in the painting, and the painting is seen through Ben's vision-condition filters (the same maths as
// the Blindness Spectrum Simulator / Patient Experience simulator). It starts with how Ben sees: retinitis pigmentosa,
// his own diagnosis, a tunnel that closes in and narrows as you go. Then cataracts, macular degeneration and glaucoma. Find and tap each hidden word. Where the filter has a centre (macular
// degeneration's smudge, glaucoma's and RP's tunnel), it follows where the phone points, so you have to look around,
// or look just beside a word, the way people with these conditions really do. The last three words spell the painting.
// By ear: a soft hum grows when your finger or aim is near a hidden word, Hint says which way to look (and comes on its
// own if you're stuck), and each round begins by describing the condition.
// The music walks through fear too: a low, uneasy drone that melts, word by word, into a warm chord, with Ben's cane
// and footsteps on his side, hesitant at first and steadier with every word. The light he walks toward grows as you go.
// The painting moves: its own looping animation (Ben walking into the light) plays under the filters and the words.
// At the end WALK THROUGH FEAR comes together, the filter lifts, the light blazes, and Ben says it in his own voice.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ARTIST = new URL('../../../3D/gallery/audio/art_63.mp3', import.meta.url).href;   // Ben, in his own words

// sev: how strong the filter is; narrow: how much stronger it gets as each word is found (Ben's tunnel keeps closing);
// slow: how slowly the filter comes over the painting at the start of the round (1 = the usual speed)
const ROUNDS = [
  { mode: 4, sev: 0.47, narrow: 0.16, slow: 0.35, name: 'Retinitis pigmentosa', kicker: 'Round 1 of 4 · how Ben sees', words: ['BREATHE', 'STEP'],
    desc: 'Ben’s own diagnosis: a narrowing tunnel of sight, and night blindness.', tip: 'Sweep slowly, like a cane.',
    done: ['That’s how Ben sees', 'Every day. Here it is without the filter.'] },
  { mode: 1, sev: 0.62, name: 'Cataracts', kicker: 'Round 2 of 4', words: ['TRUST', 'LISTEN'],
    desc: 'The eye’s lens clouds over: a milky haze, faded colour and contrast.', tip: 'Look for shapes, not details.' },
  { mode: 2, sev: 0.62, name: 'Macular degeneration', kicker: 'Round 3 of 4', words: ['COURAGE', 'FORWARD'],
    desc: 'The centre goes dark and blurry, right where you look. The edges stay.', tip: 'Look just beside a word to see it.' },
  { mode: 5, sev: 0.6, name: 'Glaucoma', kicker: 'Round 4 of 4', words: ['WALK', 'THROUGH', 'FEAR'],
    desc: 'The edges fade into a foggy frame that closes in.', tip: 'Move your phone to look around.' },
];
// where words can hide (u, v from the top-left of the painting): all well inside the painting, below the round banner
// and above the buttons. Each word is then nudged so the whole word stays on the painting and clear of the others.
const SLOTS = [[0.27, 0.3], [0.73, 0.3], [0.5, 0.4], [0.22, 0.5], [0.78, 0.5], [0.5, 0.58], [0.3, 0.68], [0.7, 0.68], [0.25, 0.8], [0.5, 0.8], [0.75, 0.8]];
const EDGE = 0.05, TOP = 0.24, BOTTOM = 0.84;
const STUCK = 15;                         // seconds without a find before the hint comes on its own
const LIGHT = [0.6, 0.44];                // the light Ben walks toward (u, v)

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Ben's filters, ported from lib/vision-gl.js, reading the painting (with its hidden words) instead of the camera.
// light: the warm light ahead of Ben, added to the painting itself, so the filters cover it too
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, paint, mov; uniform float sev, aspect, hpx, mode, fade, alpha, light, useMov; uniform vec2 gaze, lpos;
float farR(vec2 c, float a) { vec2 p = vec2(c.x * a, c.y); float r = 0.0;
  r = max(r, length(p)); r = max(r, length(p - vec2(a, 0.0))); r = max(r, length(p - vec2(0.0, 1.0))); r = max(r, length(p - vec2(a, 1.0))); return r; }
float pct(vec2 uv, vec2 c, float a) { return length(vec2((uv.x - c.x) * a, uv.y - c.y)) / farR(c, a) * 100.0; }
float ramp4(float t, float t0, float a0, float t1, float a1, float t2, float a2, float t3, float a3) {
  if (t <= t0) return a0; if (t <= t1) return mix(a0, a1, (t - t0) / max(t1 - t0, 1e-4)); if (t <= t2) return mix(a1, a2, (t - t1) / max(t2 - t1, 1e-4)); if (t <= t3) return mix(a2, a3, (t - t2) / max(t3 - t2, 1e-4)); return a3; }
vec3 vid(vec2 uv) { vec2 q = clamp(uv, 0.0, 1.0), f = vec2(q.x, 1.0 - q.y);
  vec3 c = mix(texture2D(paint, f).rgb, texture2D(mov, f).rgb, useMov);   // the painting: its looping animation once it plays, the still until then
  vec4 w = texture2D(map, f); c = mix(c, w.rgb, w.a);                       // this round's hidden words, on top
  float d = length(vec2((q.x - lpos.x) * aspect, q.y - lpos.y)) / (0.14 + 0.26 * light);
  vec3 gl = vec3(1.0, 0.72, 0.38) * light * exp(-d * d);
  return 1.0 - (1.0 - c) * (1.0 - min(gl, vec3(1.0))); }
vec3 blurred(vec2 uv, float px) {
  if (px < 0.05) return vid(uv);
  float r = px / hpx; vec3 acc = vid(uv) * 0.16; float w = 0.16;
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982 + 0.39, b = a + 0.3927;
    acc += vid(uv + vec2(cos(a) / aspect, sin(a)) * r * 0.8) * 0.13;
    acc += vid(uv + vec2(cos(b) / aspect, sin(b)) * r * 1.9) * 0.075; w += 0.205; }
  return acc / w; }
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 g = gaze; float s = sev; vec3 col; vec3 raw = vid(uv);
  if (mode < 0.5) { col = raw; }
  else if (mode < 1.5) {
    col = blurred(uv, s * 5.0);
    col = (col - 0.5) * (1.0 - s * 0.35) + 0.5; col *= 1.0 + s * 0.18;
    vec3 sep = vec3(dot(col, vec3(0.393, 0.769, 0.189)), dot(col, vec3(0.349, 0.686, 0.168)), dot(col, vec3(0.272, 0.534, 0.131)));
    col = clamp(mix(col, sep, s * 0.35), 0.0, 1.0);
    col = mix(col, vec3(228.0, 221.0, 200.0) / 255.0, 0.1 + s * 0.4);
  } else if (mode < 2.5) {
    col = blurred(uv, 1.4 + s * 3.4);
    float fog = min(1.0, 0.45 + s * 0.85), r1 = 13.0 + s * 15.0, r2 = 28.0 + s * 28.0, t = pct(uv, g, aspect);
    col = mix(col, vec3(22.0, 19.0, 15.0) / 255.0, ramp4(t, 0.0, 0.98 * fog, r1, 0.9 * fog, r2, 0.5 * fog, r2 + 16.0, 0.0));
  } else if (mode < 4.5) {
    col = blurred(uv, s * 2.25);
    float amp = min(1.0, s * 1.5125), clr = max(3.0, (1.0 - amp) * 46.0 + 4.0), t = pct(uv, g, aspect);
    col *= 1.0 - s * 0.3;
    col = mix(col, vec3(0.0), ramp4(t, clr, 0.0, clr + 6.0, 0.4 + s * 0.45, clr + 14.0, 0.7 + s * 0.28, clr + 21.0, 1.0));
    float wa = t < clr * 0.55 ? mix(s * 0.42, s * 0.22, t / (clr * 0.55)) : (t < clr ? mix(s * 0.22, 0.0, (t - clr * 0.55) / (clr * 0.45)) : 0.0);
    col = mix(col, vec3(247.0, 243.0, 233.0) / 255.0, wa);
  } else {
    col = blurred(uv, s * s * 11.0);
    float amp = min(1.0, s * 0.52734375), clr = max(2.0, (1.0 - amp) * 40.0 + 3.0);
    float t = length(vec2((uv.x - g.x) / 0.64, (uv.y - g.y) / 0.64)) * 100.0;
    float a = ramp4(t, clr, 0.0, clr + 7.0, 0.5, clr + 24.0, 0.97, clr + 25.0, 0.97);
    vec3 fc = mix(vec3(16.0, 14.0, 12.0) / 255.0, vec3(0.0), clamp((t - clr - 7.0) / 17.0, 0.0, 1.0));
    col = mix(col, fc, a);
  }
  gl_FragColor = vec4(mix(raw, col, fade), alpha);
}`;

/* the music of walking through fear: an uneasy low drone that melts into a warm chord as words are found,
   and Ben's cane and footsteps on his side of the painting, hesitant at first and steadier word by word */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mix = ac.createGain(); mix.gain.value = 1; mix.connect(out);
  const oscs = [];
  function hum(ms, type, lp) {
    const g = ac.createGain(); g.gain.value = 0; let dest = g;
    if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.connect(g); dest = f; }
    ms.forEach((m, i) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = midi(m); o.detune.value = i % 2 ? 6 : -6; o.connect(dest); o.start(); oscs.push(o); });
    g.connect(mix); return g;
  }
  // fear: a low rub of two close notes, trembling, with a thin high whine above it
  const fear = hum([36, 37], 'sawtooth', 240), whine = hum([85, 86], 'sine');
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 0; lfo.connect(lg).connect(fear.gain); lfo.start(); oscs.push(lfo);
  // courage: a warm chord that grows in, then a bright top at the end
  const warm = hum([48, 55], 'sine'), mid = hum([60, 64, 67], 'triangle', 1300), top = hum([72, 79], 'sine');
  const noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate); { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  function hit(t, { f = 2000, q = 1, vol = 0.1, dur = 0.06, pan = 0, type = 'bandpass', ping = 0 }) {
    const s = ac.createBufferSource(), bf = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise; bf.type = type; bf.frequency.value = f; bf.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let last = g; if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); last = p; }
    s.connect(bf).connect(g); last.connect(mix); s.start(t); s.stop(t + dur + 0.05);
    if (ping) { const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = ping; og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(vol * 0.25, t + 0.003); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07); o.connect(og).connect(g); o.start(t); o.stop(t + 0.1); }
  }
  const cane = (t, v) => hit(t, { f: 2600, q: 3, vol: 0.09 * v, dur: 0.05, pan: 0.38, ping: 1900 });          // the cane's tip, out ahead on his right
  const step = (t, v, side) => hit(t, { f: 260, q: 0.8, vol: 0.16 * v, dur: 0.16, pan: side, type: 'lowpass' });   // a footstep
  let p = 0, on = 0.75, stepT = 2, foot = 0, walking = false, ducked = false;
  const set = (g, v, tc = 1.5) => g.gain.setTargetAtTime(v, ac.currentTime, tc);
  function level(x) {
    p = x; const fearV = Math.max(0, 1 - x * 1.05);
    set(fear, 0.05 * fearV); lg.gain.setTargetAtTime(0.022 * fearV, ac.currentTime, 1.5); set(whine, 0.005 * fearV);
    set(warm, 0.05 * Math.min(1, x * 1.6)); set(mid, 0.022 * Math.max(0, Math.min(1, (x - 0.2) * 1.6))); set(top, 0.009 * Math.max(0, (x - 0.65) / 0.35));
  }
  return {
    start() { level(0); out.gain.setTargetAtTime(on, ac.currentTime, 1.2); walking = true; },
    level,
    // every frame: speaking = a voice line is playing, so the music steps back a little
    tick(dt, speaking) {
      if (speaking !== ducked) { ducked = speaking; mix.gain.setTargetAtTime(speaking ? 0.55 : 1, ac.currentTime, 0.25); }
      if (!walking) return;
      stepT -= dt; if (stepT > 0) return;
      // cane, step, step: unsure and uneven with fear, a steady walk with courage
      const t = ac.currentTime + 0.02, v = 0.55 + p * 0.45, gap = 0.42 - p * 0.1 + (1 - p) * Math.random() * 0.25;
      cane(t, v); step(t + gap * 0.6, v, foot ? 0.12 : -0.12); step(t + gap * 1.6, v, foot ? -0.12 : 0.12); foot ^= 1;
      stepT = 2.1 - p * 0.75 + (1 - p) * Math.random() * 1.1;
    },
    // the end: fear is gone, the warm chord opens up bright
    win() { level(1.15); set(top, 0.016, 0.8); K.chord([60, 64, 67, 72, 76].map(midi), 3.2, { vol: 0.05, type: 'sine', spread: 0.12 }); walking = false; },
    // Ben is about to speak: the music goes down to a soft bed under him
    hush() { on = 0.2; out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(on, ac.currentTime, 0.6); },
    pause() { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); },
    resume() { out.gain.setTargetAtTime(on, ac.currentTime, 0.2); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); setTimeout(() => { oscs.forEach(o => { try { o.stop(); } catch (e) {} }); try { out.disconnect(); } catch (e) {} }, 400); } catch (e) {} },
  };
}

export function seeItMyWayGame() {
  let G = null;
  const total = ROUNDS.reduce((n, r) => n + r.words.length, 0);
  const busy = () => !!(G && G.say && G.say.busy && G.say.busy());
  // lines wait their turn, so one never cuts off the one before (each waits at most a few seconds)
  function queue(text) { G.q.push(text); }
  function flush(dt) {
    if (!G.q.length) { G.qWait = 0; return; }
    G.qWait += dt;
    if (!busy() || G.qWait > 6) { G.qWait = 0; G.say(G.q.shift()); }
  }
  const quiet = () => !G.q.length && !busy();

  function hud() {
    const R = ROUNDS[G.r];
    G.ui.panel(R ? R.name : 'See it my way', `${G.found.length}<small>of ${total} words</small>`,
      { segs: [G.found.length, total], sub: G.found.length ? G.found.join(' · ') : (R ? R.tip : '') });
  }
  const font = w => `900 ${w.size * 1024}px Archivo, "Arial Black", Arial, sans-serif`;
  // this round's hidden words, on a clear layer over the painting (the painting itself is its own texture: the still, or the animation)
  function compose() {
    const W = 1024, H = Math.round(1024 * G.h), c = G.cv; c.width = W; c.height = H; const g = c.getContext('2d'); g.clearRect(0, 0, W, H);
    for (const w of G.words) if (!w.got && !G.hideWords) {
      g.save(); g.translate(w.u * W, w.v * H); g.rotate(w.rot);
      g.font = font(w); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineJoin = 'round'; g.lineWidth = w.size * W * 0.16; g.strokeStyle = 'rgba(0,0,0,.75)'; g.strokeText(w.text, 0, 0);
      g.fillStyle = 'rgba(255,255,255,.95)'; g.fillText(w.text, 0, 0);
      g.restore();
    }
    G.tex.needsUpdate = true;
  }
  // choose where this round's words go: each one fully on the painting, under the banner, and clear of the others
  function place(texts) {
    const g = G.cv.getContext('2d'), out = [];
    const slots = SLOTS.map(s => s.slice()).sort(() => Math.random() - 0.5);
    for (const text of texts) {
      const w = { text, size: text.length > 6 ? 0.075 : 0.09, rot: (Math.random() - 0.5) * 0.24, got: false };
      g.font = font(w); w.half = (g.measureText(text).width / 1024) / 2;
      const ext = w.half * Math.cos(w.rot) + w.size * 0.6;                       // how far the tilted word reaches sideways
      const extV = (w.half * Math.abs(Math.sin(w.rot)) + w.size * 0.6) / G.h;   // and up and down
      let best = null;
      for (const s of slots) {
        const u = Math.max(EDGE + ext, Math.min(1 - EDGE - ext, s[0] + (Math.random() - 0.5) * 0.05));
        const v = Math.max(TOP + extV, Math.min(BOTTOM - extV, s[1] + (Math.random() - 0.5) * 0.04));
        const clash = out.some(o => Math.abs(o.u - u) < o.ext + ext + 0.03 && Math.abs(o.v - v) < o.extV + extV + 0.03);
        if (!clash) { best = { u, v }; slots.splice(slots.indexOf(s), 1); break; }
      }
      if (!best) best = { u: 0.5, v: TOP + extV + out.length * 0.2 };
      Object.assign(w, best, { ext, extV, hw: w.half + 0.02, hh: w.size * 0.7 });
      out.push(w);
    }
    return out;
  }
  function startRound() {
    const R = ROUNDS[G.r]; if (!R) return;
    G.words = place(R.words);
    G.hideWords = !!R.slow; compose();   // in Ben's round, the words appear once his tunnel has closed in
    G.uni.mode.value = R.mode; G.uni.sev.value = R.sev; G.sevTo = R.sev; G.fadeTo = 1; G.fadeRate = 1.6 * (R.slow || 1); G.roundT = 0; G.stuck = 0;
    G.ui.banner(R.name, R.desc + ' ' + R.tip, 0, R.kicker); G.bannerT = R.slow ? 4.6 : 3.2;
    // said as short sentences, so each one plays Ben's own recording ("Round 1 of 4." "How Ben sees." …)
    const kick = R.kicker.split(' · ').map(k => k[0].toUpperCase() + k.slice(1) + '.').join(' ');
    queue(`${kick} ${R.name}. ${R.desc} ${R.tip} Find ${R.words.length} hidden words.`);
    hud();
  }
  function pop(w) {
    const [x, y] = G.S.P(w.u, w.v);
    const s = K.plane(K.wordTex(w.text), 0.36, 0.09, { order: 30 }); s.position.set(x, y, 0.06); s.rotation.z = -w.rot; s.scale.setScalar(0.2); G.root.add(s);
    // keep the popped word on the painting even near an edge
    s.position.x = Math.max(-0.5 + 0.2, Math.min(0.5 - 0.2, x));
    G.pops.push({ s, t: 0 });
  }
  // WALK THROUGH FEAR: the three words fly from where they were found and stack up in the middle of the light
  function titleLine() {
    const R = ROUNDS[ROUNDS.length - 1];
    G.title = { t: 0, items: G.words.map((w, i) => {
      const [x, y] = G.S.P(w.u, w.v), s = K.plane(K.wordTex(w.text), 0.42, 0.105, { order: 32 });
      s.position.set(x, y, 0.07); G.root.add(s);
      const [, ty] = G.S.P(0.5, 0.5 + (i - (R.words.length - 1) / 2) * 0.125);   // stacked, like a poster: WALK / THROUGH / FEAR
      return { s, from: [x, y, -w.rot], to: [0, ty, 0] };
    }) };
    K.sfx.good(0, 9);
  }
  function tryFind(u, v) {
    if (G.hideWords) return;   // still closing in
    // generous: a tap on or just around a word counts
    const w = G.words.find(w => !w.got && Math.abs(u - w.u) < w.hw + 0.05 && Math.abs(v - w.v) < (w.hh + 0.06) / G.h);
    if (!w) { K.tone(180, 0.12, { type: 'triangle', vol: 0.05 }); return; }
    w.got = true; G.found.push(w.text); compose(); G.stuck = 0;
    const [x, y] = G.S.P(w.u, w.v), pan = Math.max(-1, Math.min(1, (w.u - 0.5) * 1.8));
    const last = G.r === ROUNDS.length - 1 && G.words.every(w => w.got);
    if (!last) pop(w);
    K.sfx.good(pan, G.found.length); G.fx.add(x, y, '#ffffff', 20, 0.25); G.buzz([30, 30, 60]);
    G.say(w.text.toLowerCase() + '.'); hud();   // the word straight away; anything queued (like the round's intro) still plays after it
    G.band && G.band.level(G.found.length / total); G.lightTo = 0.12 + 0.5 * G.found.length / total;
    { const R = ROUNDS[G.r]; if (R && R.narrow) G.sevTo = R.sev + R.narrow * G.words.filter(w => w.got).length / G.words.length; }   // the tunnel closes in a little more
    if (G.words.every(w => w.got)) {
      G.r++; G.ui.hideBanner(); G.bannerT = 0;
      if (G.r >= ROUNDS.length) {
        // the end: the title comes together, the filter lifts, the light blazes and fear melts away
        titleLine(); G.ui.buttons([]); G.fadeTo = 0; G.fadeRate = 0.9; G.lightTo = 1.15; G.settle = 4.2; G.band && G.band.win();
        G.ui.alert('You walked through fear', 'Now see it clearly.', 3.2, 'red');
        queue('Walk through fear. You found every word. Now see it clearly.');
      } else {
        const done = ROUNDS[G.r - 1].done, D = done || ['Round cleared', 'Here it is without the filter.'];
        G.fadeTo = 0; G.fadeRate = 1.6; G.settle = done ? 3 : 2.2; G.ui.alert(D[0], D[1], done ? 2.8 : 2, 'black');
        queue(done ? 'That’s how Ben sees. Every day. Here it is without the filter.' : 'Round cleared. Here it is without the filter.');
      }
    }
  }
  function hint() {
    const w = G.words.find(w => !w.got); if (!w) return;
    const du = w.u - G.aim.u, dv = w.v - G.aim.v, d = Math.hypot(du, dv * G.h);
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const way = [v, h].filter(Boolean).join(' and ');
    const msg = !way || d < 0.12 ? 'It’s right around where you’re looking. Tap it.' : (d < 0.3 ? 'Close. Look ' : 'Look ') + way + '.';
    G.ui.alert('Hint', msg, 1.8, 'blue'); G.say(msg); G.stuck = 0;
  }

  return {
    title: 'See it my way',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { r: 0, found: [], words: [], pops: [], q: [], qWait: 0, aim: { u: 0.5, v: 0.5 }, touch: null, touchT: 0, fadeTo: 0, settle: 0, hold: 0, t0: 0, humT: 0, bannerT: 0, botT: 0,
        stuck: 0, lightTo: 0.12, title: null, endT: 0, artist: null });
      G.cv = document.createElement('canvas'); G.tex = new THREE.CanvasTexture(G.cv); G.tex.colorSpace = THREE.NoColorSpace;
      G.blank = new THREE.DataTexture(new Uint8Array([51, 51, 51, 255]), 1, 1); G.blank.needsUpdate = true;
      G.uni = { map: { value: G.tex }, paint: { value: G.blank }, mov: { value: G.blank }, useMov: { value: 0 }, sev: { value: 0 }, aspect: { value: 1 / G.h }, hpx: { value: 300 }, mode: { value: 0 }, fade: { value: 0 }, alpha: { value: 0 },
        gaze: { value: new THREE.Vector2(0.5, 0.5) }, light: { value: 0 }, lpos: { value: new THREE.Vector2(LIGHT[0], LIGHT[1]) } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { if (!G) return; const t = new THREE.Texture(im); t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; G.uni.paint.value = t; G.img = im; }; im.src = src; }
      // the painting's own animation (Ben walking into the light), muted and looping, under the filters and the words
      const anim = ctx.work && ctx.work.overlay && ctx.work.overlay.anim;
      if (anim) {
        const v = document.createElement('video'); Object.assign(v, { src: anim, muted: true, loop: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
        v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.muted = true;
        const t = new THREE.VideoTexture(v); t.colorSpace = THREE.NoColorSpace;
        v.addEventListener('playing', () => { if (G && G.mov === v) { G.uni.mov.value = t; G.movOn = true; } });
        G.mov = v; G.movTex = t; v.play().catch(() => {});
      }
      compose();
      try { G.ac = K.audio(); G.band = G.ac ? band(G.ac) : null; } catch (e) { G.band = null; }
      // stop Ben's clip if the player opens his story video
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: where to look', press: () => G.playing && !G.settle && hint() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band && G.band.start(); startRound(); };
      K.intro(G, { title: 'See it my way', how: 'Words are hidden in Ben’s painting. Find them through four kinds of low vision, starting with how Ben sees. Tap each word you find.',
        say: 'See it my way. Words are hidden in Ben’s painting, Walk Through Fear. You’ll look for them through four kinds of low vision. Move your phone to look around, and tap each word you find. A soft hum means you’re close.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      flush(dt); G.band && G.band.tick(dt, busy());
      if (G.bannerT > 0) { G.bannerT -= dt; if (G.bannerT <= 0) G.ui.hideBanner(); }
      // the painting under the filter fades in, and the filter fades in and out between rounds
      G.uni.alpha.value += (1 - G.uni.alpha.value) * Math.min(1, dt * 2);
      if (G.movOn) G.uni.useMov.value = Math.min(1, G.uni.useMov.value + dt * 1.5);   // the still melts into the moving painting
      else if (G.mov && G.mov.paused && !G.paused && G.t > 0.5 && (G.retryMov = (G.retryMov || 0) - dt) <= 0) { G.retryMov = 1; G.mov.play().catch(() => {}); }   // some phones only start it after a tap
      G.uni.fade.value += (G.fadeTo - G.uni.fade.value) * Math.min(1, dt * (G.fadeRate || 1.6));
      G.uni.light.value += (G.lightTo - G.uni.light.value) * Math.min(1, dt * (G.lightTo > 1 ? 1.2 : 0.8));
      if (G.hideWords && G.uni.fade.value > 0.85) { G.hideWords = false; compose(); }
      if (G.sevTo != null) G.uni.sev.value += (G.sevTo - G.uni.sev.value) * Math.min(1, dt * 1.2);
      // where you look: a finger on the screen, else the middle of the screen (where the phone points)
      if (G.bot && G.playing) { const w = G.words.find(w => !w.got); if (w) { G.aim.u += (w.u - G.aim.u) * Math.min(1, dt * 2); G.aim.v += (w.v - G.aim.v) * Math.min(1, dt * 2); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const gz = G.uni.gaze.value; gz.x += (G.aim.u - gz.x) * Math.min(1, dt * 10); gz.y += (G.aim.v - gz.y) * Math.min(1, dt * 10);
      for (let i = G.pops.length - 1; i >= 0; i--) { const p = G.pops[i]; p.t += dt; p.s.scale.setScalar(Math.min(1, 0.2 + p.t * 3) * (p.t > 2.2 ? Math.max(0, 1 - (p.t - 2.2) * 2) : 1)); if (p.t > 2.8) { G.root.remove(p.s); G.pops.splice(i, 1); } }
      // the title line: fly in, then stay until the end panel, then fade
      if (G.title) { const T = G.title; T.t += dt; const e = Math.min(1, T.t / 1.3), k = 1 - Math.pow(1 - e, 3);
        T.items.forEach((it, i) => { const kk = Math.max(0, Math.min(1, (T.t - i * 0.12) / 1.3)), q = 1 - Math.pow(1 - kk, 3);
          it.s.position.x = it.from[0] + (it.to[0] - it.from[0]) * q; it.s.position.y = it.from[1] + (it.to[1] - it.from[1]) * q + Math.sin(q * Math.PI) * 0.05;
          it.s.rotation.z = it.from[2] * (1 - q); it.s.scale.setScalar(0.6 + 0.4 * q + (T.t > 1.3 && T.t < 1.7 ? Math.sin((T.t - 1.3) / 0.4 * Math.PI) * 0.12 : 0));
          if (G.over) it.s.material.opacity = Math.max(0, it.s.material.opacity - dt * 1.5); });
        if (k >= 1 && T.t < 1.4 && !T.flash) { T.flash = 1; const [, ty] = G.S.P(0.5, 0.5); G.fx.add(0, ty, '#ffd27a', 40, 0.4); G.buzz([40, 30, 120]); } }
      // Ben's own voice, after the end panel has settled
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.6) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band && G.band.hush(); } }
      if (G.settle > 0) { G.settle -= dt;
        // let the round's last line finish before the next round (or the end) starts talking
        if (G.settle <= 0 && !quiet() && G.hold < 8) { G.hold += dt; G.settle = 0.0001; }
        if (G.settle <= 0) { G.settle = 0; G.hold = 0;
          if (G.r >= ROUNDS.length && !G.over) {
            const t = Math.round(G.t - G.t0), r = K.best('walk-through-fear:see', t, 'lower');
            K.finale(G, { won: true, title: 'You walked through fear', line: G.work && G.work.quote, best: r.isBest, say: 'You walked through fear.',
              cells: [{ k: 'Words', v: `${total}/${total}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
          } else if (G.r < ROUNDS.length) startRound();
        } return; }
      if (!G.playing) return;
      // stuck for a while: the hint comes on its own
      if (!G.hideWords && quiet()) { G.stuck += dt; if (G.stuck > STUCK && !G.bot) hint(); }
      // by ear: a soft hum, from the word's side, that grows as you look near a hidden word
      const w = G.words.filter(w => !w.got).sort((a, b) => Math.hypot(a.u - G.aim.u, a.v - G.aim.v) - Math.hypot(b.u - G.aim.u, b.v - G.aim.v))[0];
      if (w && !G.hideWords) { const d = Math.hypot(w.u - G.aim.u, (w.v - G.aim.v) * G.h); G.humT -= dt;
        if (d < 0.35 && G.humT <= 0) { G.humT = 0.18 + d * 1.6; K.tone(330 + (0.35 - d) * 900, 0.12, { type: 'sine', vol: 0.02 + (0.35 - d) * 0.09, pan: Math.max(-1, Math.min(1, (w.u - G.aim.u) * 3)) }); } }
      if (G.bot) { G.botT -= dt; if (w && G.botT <= 0 && Math.hypot(w.u - G.aim.u, w.v - G.aim.v) < 0.02) { G.botT = 0.4; tryFind(w.u, w.v); } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      const p = G.S.toBoard(ev, G.root);
      if (kind === 'down') { if (p) { G.touch = { u: p.u, v: p.v }; G.downAt = { x: ev.clientX, y: ev.clientY }; } }
      else if (kind === 'move' && G.touch && p) G.touch = { u: p.u, v: p.v };
      else if (kind === 'up') {
        if (G.touch && G.settle <= 0) tryFind(G.touch.u, G.touch.v);   // a tap (or the end of a drag) checks for a word there
        G.touch = null; G.touchT = 1.2;
      }
    },
    pause() { if (G) { G.paused = true; G.band && G.band.pause(); if (G.artist) G.artist.pause(); if (G.mov) G.mov.pause(); } },
    resume() { if (G) { G.paused = false; G.band && G.band.resume(); if (G.artist && G.over) G.artist.play().catch(() => {}); if (G.mov) G.mov.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'see-it-my-way', playing: G.playing, over: G.over, settle: +G.settle.toFixed(2), paused: G.paused, t: +G.t.toFixed(1), round: G.r, hidden: !!G.hideWords, found: G.found.length, total,
      light: +G.uni.light.value.toFixed(2), movie: G.mov ? (G.movOn ? +G.mov.currentTime.toFixed(1) : 'waiting') : 'none', artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, queued: G.q.length,
      words: G.words.map(w => `${w.text}@${w.u.toFixed(2)},${w.v.toFixed(2)}${w.got ? '✓' : ''}`) }; },
    stop() {
      if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band && G.band.stop(); } catch (e) {}
        try { if (G.mov) { G.mov.pause(); G.mov.removeAttribute('src'); G.mov.load(); G.movTex && G.movTex.dispose(); G.mov = null; } } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
