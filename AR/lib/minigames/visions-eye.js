// THE VISIONS THAT WE SHARE (Dave Steele): CATCH THE WORDS.
// The great eye comes alive: it blinks, and its iris looks left and right. Dave lives with Retinitis Pigmentosa: a
// bright centre ringed by darkness, a tunnel of light. Words of a shared poem drift in through that darkness, from the
// left and the right; each one is spoken, from its side. Press Left or Right to turn the eye (it stays looking that way
// until you press the other one) and Blink while the word is on that side to catch it. Words in the dark are dim and
// blurry, pulsing; inside the clear circle of sight they're big and sharp.
// Caught words fly into the poem; each finished line is read out and the tunnel of light grows wider: sharing a story
// widens the view. Miss one and it drifts back later. Four lines, then the whole poem, and the eye can see it all.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/visions/';
// an original little poem; the words in [brackets] are the ones you catch
const POEM = [
  'Through my [eyes], the [world] is [small],',
  'a [circle] of [light] in the [dark].',
  'But [share] your [words], and I will [see]',
  'a [world] as [wide] as [yours].',
];
const LINES = POEM.map(l => ({ text: l.replace(/[[\]]/g, ''), words: [...l.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]) }));
const IRIS = [0.522, 0.457], IRIS_R = 0.112, LOOK = 0.085;   // where the iris sits, its size, how far it can look
const STAY = 8.5;   // seconds a word drifts before fading back into the dark

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the eye: the iris slides left and right inside the eye's opening, the lids close in a blink, and the darkness of
// tunnel vision rings whatever the eye is looking at, opening wider as the poem grows
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, ball, eye;
uniform float uLook, uBlink, uTunnel, uT, uA, uH, uGlow, uGaze;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 C = vec2(0.522, 0.457);
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 e = at(eye, p); float open = e.r, frac = e.g, hgt = e.b * 0.25;
  vec3 col = at(map, p);
  if (open > 0.01) {
    // the white of the eye, and the iris moved to where the eye is looking
    vec3 ball = at(ball, p);
    vec2 q = p - vec2(uLook, 0.0);
    float inIris = 1.0 - smoothstep(0.108, 0.113, length((q - C) * vec2(1.0, uH)));
    vec3 iris = at(map, q) + vec3(0.25, 0.22, 0.12) * uGlow * (1.0 - smoothstep(0.02, 0.1, length((q - C) * vec2(1.0, uH))));
    vec3 eyeCol = mix(ball, iris, inIris);
    // the blink: the upper lid comes down over the eye
    float lid = smoothstep(uBlink - 0.02, uBlink + 0.02, frac);
    float top = p.y - frac * hgt;
    vec3 skin = at(map, vec2(p.x, top - 0.012 - (uBlink - frac) * hgt * 0.5));
    eyeCol = mix(skin, eyeCol, lid);
    eyeCol *= 1.0 - 0.75 * (1.0 - smoothstep(0.0, 0.03, abs(frac - uBlink))) * step(0.03, uBlink);   // the lashes along the closing lid
    col = mix(col, eyeCol, open);
  }
  // tunnel vision: a ring of darkness around where the eye is looking
  vec2 g = vec2(0.5 + uGaze * 0.25, 0.47);
  float r = length((p - g) * vec2(1.0, uH));
  col *= mix(0.12, 1.0, 1.0 - smoothstep(uTunnel * 0.6, uTunnel, r));
  gl_FragColor = vec4(col, uA);
}`;

// a word, big and bold: sharp (for inside the circle of sight) or blurred (for out in the dark)
function wordCard(text, blur) {
  const W = 640, H = 180;
  return K.canvasTex(W, H, (g) => {
    const t = text.toUpperCase(); let fs = 118; const font = () => `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; g.font = font();
    while (g.measureText(t).width > W - 70 && fs > 40) { fs -= 4; g.font = font(); }
    if (blur) g.filter = 'blur(9px)';
    g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(14, 14, W - 28, H - 40); g.fillStyle = '#4aa3c8'; g.fillRect(14, H - 30, W - 28, 12);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, W / 2, (H - 30) / 2 + 10);
  });
}
const WORD_W = 0.34;   // how wide a word is on the painting

/* ───────────────────────── lofi, for looking ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[48, 55, 59, 62, 64], [45, 52, 55, 59, 62], [41, 48, 52, 55, 60], [43, 50, 53, 57, 59]];   // Cmaj9 · Am9 · Fmaj7 · G7sus
const BASS = [36, 33, 29, 31];
const MEL = [[76, 0, 1], [74, 1, 0.5], [72, 1.5, 1.5], [67, 4, 1], [69, 5, 1.5], [72, 8, 1], [74, 9, 0.5], [76, 9.5, 1.5], [74, 12, 1], [72, 13, 2]];
function band(ac) {
  const BPM = 78, beat = 60 / BPM, bar = beat * 4;
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3200; bus.connect(tape).connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  let next = ac.currentTime + 0.1, step = 0, timer = null;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, barN = Math.floor(step / 8), ch = barN % 4, sw = b8 % 2 ? beat * 0.09 : 0, tt = t + sw;
      if (b8 === 0) CHORDS[ch].forEach((m, i) => { tone(t + i * 0.015, midi(m + 12), bar * 0.95, { vol: 0.04, att: 0.03 }); tone(t + i * 0.015, midi(m + 24), bar * 0.35, { type: 'triangle', vol: 0.006 }); });
      noise(tt, 0.04, { freq: 7000, type: 'highpass', q: 0.6, vol: b8 % 2 ? 0.03 : 0.05, p: 0.25 });
      if (b8 === 0 || b8 === 5) tone(tt, 110, 0.4, { vol: 0.36, slide: 42, att: 0.006 });
      if (b8 === 2 || b8 === 6) noise(tt, 0.2, { freq: 1700, q: 0.7, vol: 0.1 });
      if (b8 === 0) tone(t, midi(BASS[ch]), beat * 1.8, { type: 'triangle', vol: 0.2 }); if (b8 === 3) tone(tt, midi(BASS[ch] + 7), beat * 0.8, { type: 'triangle', vol: 0.15 });
      { const pos = (barN % 4) * 4 + b8 / 2; for (const [m, at] of MEL) if (Math.abs(at - pos) < 0.01) { tone(tt, midi(m), 1.4, { type: 'triangle', vol: 0.045, att: 0.004 }); tone(tt, midi(m) * 2, 0.5, { vol: 0.01 }); } }
      if (Math.random() < 0.22) noise(t + Math.random() * beat / 2, 0.012, { freq: 2500 + Math.random() * 2500, q: 3, vol: 0.03, p: Math.random() - 0.5 });
      next += beat / 2; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.85); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    open(v) { tape.frequency.setTargetAtTime(1600 + v * 3200, ac.currentTime, 0.6); },   // the music opens up as the view does
    word(p) { const t = ac.currentTime + 0.01; tone(t, midi(84), 0.5, { vol: 0.05, p, out: fx }); tone(t + 0.08, midi(91), 0.6, { vol: 0.035, p, out: fx }); },
    look(d) { noise(ac.currentTime + 0.01, 0.16, { freq: 700, q: 1.2, vol: 0.05, p: d * 0.8, out: fx, sweep: 1400, att: 0.04 }); },
    // a blink: the soft swish of the lid coming down and a gentle tap as it closes
    blink() { const t = ac.currentTime + 0.01; noise(t, 0.12, { freq: 2600, q: 0.9, vol: 0.09, out: fx, sweep: 900, att: 0.02 }); tone(t + 0.09, 260, 0.12, { vol: 0.12, out: fx, slide: 150, att: 0.004 }); noise(t + 0.16, 0.1, { freq: 1500, q: 0.8, vol: 0.05, out: fx, sweep: 3200, att: 0.02 }); },
    catch(p, n) { const t = ac.currentTime + 0.01; [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.06, midi(72 + d + (n % 5) * 2), 0.7, { type: 'triangle', vol: 0.06, p, out: fx })); },
    miss(p) { tone(ac.currentTime + 0.01, 300, 0.4, { vol: 0.04, p, slide: 180, out: fx }); },
    line() { const t = ac.currentTime + 0.05; [60, 64, 67, 72, 76].forEach((m, i) => tone(t + i * 0.12, midi(m), 2.5, { type: 'triangle', vol: 0.05, att: 0.05, out: fx })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function catchTheWordsGame() {
  let G = null;

  // the poem so far, shown at the bottom
  function poemBox() {
    if (!G.poemEl) {
      G.poemEl = document.createElement('div'); G.poemEl.className = 'mgk'; G.poemEl.setAttribute('aria-live', 'polite');
      Object.assign(G.poemEl.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))',
        background: 'rgba(0,0,0,.84)', borderLeft: '6px solid #4aa3c8', padding: '8px 14px', font: '700 clamp(15px,4.4vw,19px)/1.35 "Atkinson Hyperlegible",Arial,sans-serif', textTransform: 'none' });
      document.body.appendChild(G.poemEl);
    }
    const out = [];
    LINES.forEach((L, i) => {
      if (i > G.line) return;
      if (i < G.line) { out.push(`<div>${L.text}</div>`); return; }
      // the current line: caught words shown, the rest as gaps
      let k = 0; const raw = POEM[i].replace(/\[([^\]]+)\]/g, (_, w) => (k++ < G.caught ? `<b style="color:#8fd3f0">${w}</b>` : '<span style="color:#777">____</span>'));
      out.push(`<div>${raw}</div>`);
    });
    G.poemEl.innerHTML = out.join('');
  }

  // a word drifts in through the dark, from the left or the right
  function spawn() {
    const L = LINES[G.line], w = L.words[G.caught], side = Math.random() < 0.5 ? -1 : 1;
    const u = 0.5 + side * (0.2 + Math.random() * 0.06), v = 0.36 + Math.random() * 0.22;
    // two copies of the word: blurred for the dark, sharp for the clear circle of sight
    const mk = blur => { const s = K.sprite(wordCard(w, blur), 1, { order: blur ? 26 : 27, opacity: 0 }); s.scale.set(WORD_W, WORD_W * 180 / 640, 1); G.root.add(s); return s; };
    const s = mk(false), sb = mk(true); const [x, y] = G.S.P(u, v); s.position.set(x, y, 0.06); sb.position.set(x, y, 0.059);
    G.word = { s, sb, w, u, v, side, t: 0, du: side * 0.003, clear: 0 };
    G.band.word(side * 0.9);
    G.say(`${w[0].toUpperCase() + w.slice(1)}. On your ${side < 0 ? 'left' : 'right'}.`);
  }
  const gazeU = () => 0.5 + (G.look / LOOK) * 0.25;
  function blink(atU) {
    if (G.blinkT !== undefined && G.blinkT < 0.12) return;
    G.blinkT = 0; G.band.blink(); G.blinks++;
    if (atU !== undefined) look(atU < 0.5 ? -1 : 1);
    if (G.phase !== 'play' || !G.word) return;
    const wd = G.word, inView = atU !== undefined ? Math.sign(atU - 0.5) === wd.side : G.target === wd.side;   // looking to the word's side
    if (inView) caught(); else { G.band.miss(wd.side * 0.9); G.ui.pop('Look ' + (wd.side < 0 ? 'left ◀' : 'right ▶')); }
  }
  function caught() {
    const wd = G.word; G.word = null; G.score++; G.glow = 1; G.root.remove(wd.sb); wd.sb.material.dispose();
    G.band.catch(wd.side * 0.9, G.score); G.buzz(25);
    G.fly.push({ s: wd.s, from: [wd.s.position.x, wd.s.position.y], to: G.S.P(0.5, 0.95), t: 0 });
    G.caught++; poemBox();
    if (G.caught >= LINES[G.line].words.length) {
      // a whole line: read it, and the view opens wider
      const L = LINES[G.line]; G.line++; G.caught = 0; G.band.line();
      G.say(L.text); G.wait = 4.2;
      G.tunnelTo = [0.34, 0.48, 0.64, 0.82, 1.4][G.line];
      if (G.line >= LINES.length) { G.phase = 'end'; K.later(G, 4.5, () => G && finish()); }
      poemBox();
    } else G.wait = 1.2;
  }
  function finish() {
    G.phase = 'done'; G.tunnelTo = 2;
    const whole = LINES.map(l => l.text).join(' ');
    K.finale(G, { won: true, kicker: 'The visions that we share', title: 'You caught every word', line: G.work && G.work.quote,
      cells: [{ k: 'Words', v: G.score }, { k: 'Blinks', v: G.blinks }],
      say: 'You caught every word. Shared, the view is wide. ' + ((G.work && G.work.quote) || '') });
    if (G.poemEl) G.poemEl.style.bottom = 'calc(76px + env(safe-area-inset-bottom))';   // above the page's own row of buttons
  }
  // the eye turns to that side and stays there until you press the other button
  function look(d) {
    G.target = d; G.band.look(d);
    if (G.lookBtns) G.lookBtns.forEach((b, i) => { const on = (i ? 1 : -1) === d; b.style.outline = on ? '4px solid #4aa3c8' : ''; b.style.outlineOffset = on ? '-4px' : ''; b.setAttribute('aria-pressed', on); });
  }
  function buttons() {
    const el = G.ui.buttons([
      { label: 'Left', icon: '◀', aria: 'Look left', press: () => look(-1) },
      { label: 'Blink', icon: '👁', kind: 'red', aria: 'Blink: catch the word on the side you are looking', press: () => blink() },
      { label: 'Right', icon: '▶', aria: 'Look right', press: () => look(1) },
    ]);
    G.lookBtns = el ? [el[0], el[2]] : null;
  }

  return {
    title: 'Catch the words',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', look: 0, target: 0, hold: 0, blink: 0, blinkT: undefined, nextBlink: 3, line: 0, caught: 0, score: 0, blinks: 0, word: null, wait: 2, fly: [], glow: 0,
        tunnel: 0.22, tunnelTo: 0.22, botT: 0 });
      G.band = band(K.audio());
      G.uni = { map: { value: null }, ball: { value: null }, eye: { value: null }, uLook: { value: 0 }, uBlink: { value: 0 }, uTunnel: { value: 0.22 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h },
        uGlow: { value: 0 }, uGaze: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 3; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'eyeball.jpg', 'ball'); raw(ART + 'eye.png', 'eye');
      G.onGo = () => { G.phase = 'play'; G.band.start(); buttons(); poemBox(); G.ui.panel('Catch the words', `0 <small>of ${LINES.reduce((n, l) => n + l.words.length, 0)} words</small>`, { segs: [0, 4] }); };
      K.intro(G, { title: 'Catch the words', how: 'Look left or right and blink when the word is on that side.',
        say: 'Catch the words. Look left or right and blink when the word is on that side.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // where the eye looks: it stays where the Left or Right button (or a tap) last sent it
      G.look += (G.target * LOOK - G.look) * Math.min(1, dt * 9); u.uLook.value = G.look; u.uGaze.value = G.look / LOOK;
      // blinking: on demand, and now and then by itself
      G.nextBlink -= dt; if (G.nextBlink <= 0) { G.nextBlink = 3 + Math.random() * 4; if (G.blinkT === undefined) G.blinkT = 0; }
      if (G.blinkT !== undefined) { G.blinkT += dt; const k = G.blinkT / 0.28; G.blink = k < 1 ? Math.sin(k * Math.PI) : 0; if (k >= 1) G.blinkT = undefined; }
      u.uBlink.value = G.blink * 1.02;
      G.glow = Math.max(0, G.glow - dt * 1.5); u.uGlow.value = G.glow;
      G.tunnel += (G.tunnelTo - G.tunnel) * Math.min(1, dt * 1.2); u.uTunnel.value = G.tunnel; G.band.open(Math.min(1, (G.tunnel - 0.22) / 0.6));
      // the words
      if (G.phase === 'play') {
        if (!G.word) { G.wait -= dt; if (G.wait <= 0) spawn(); }
        else {
          const wd = G.word; wd.t += dt; wd.u += wd.du * dt; wd.v += Math.sin(G.t * 0.9 + wd.u * 7) * 0.004 * dt;
          const [x, y] = G.S.P(wd.u, wd.v); wd.s.position.set(x, y, 0.06); wd.sb.position.set(x, y, 0.059);
          // how clearly it can be seen: sharp inside the circle of sight, dim, blurred and pulsing out in the dark
          const gx = 0.5 + (G.look / LOOK) * 0.25, r = Math.hypot(wd.u - gx, (wd.v - 0.47) * G.h);
          wd.clear += ((1 - Math.min(1, Math.max(0, (r - G.tunnel * 0.55) / (G.tunnel * 0.45)))) - (wd.clear || 0)) * Math.min(1, dt * 8);
          const fade = Math.min(1, wd.t * 2) * (wd.t > STAY - 1 ? Math.max(0, STAY - wd.t) : 1), pulse = 0.22 + 0.16 * (0.5 + 0.5 * Math.sin(G.t * 3.2));
          wd.s.material.opacity = fade * wd.clear; wd.sb.material.opacity = fade * (1 - wd.clear) * pulse * 1.6;
          const sc = WORD_W * (1 + 0.04 * (1 - wd.clear) * Math.sin(G.t * 3.2)); wd.sb.scale.set(sc, sc * 180 / 640, 1);
          if (wd.t >= STAY) { for (const q of [wd.s, wd.sb]) { G.root.remove(q); q.material.dispose(); } G.word = null; G.wait = 1.5; G.say('It drifted away. It’ll come back.'); }
        }
      }
      for (let i = G.fly.length - 1; i >= 0; i--) {
        const f = G.fly[i]; f.t += dt / 0.8; const k = Math.min(1, f.t), e = k * k;
        f.s.position.x = f.from[0] + (f.to[0] - f.from[0]) * e; f.s.position.y = f.from[1] + (f.to[1] - f.from[1]) * e; f.s.material.opacity = 1 - k;
        if (k >= 1) { G.root.remove(f.s); f.s.material.dispose(); G.fly.splice(i, 1); }
      }
      G.ui.panel('Catch the words', `${G.score} <small>of ${LINES.reduce((n, l) => n + l.words.length, 0)} words</small>`, { segs: [G.line, 4] });
      // the robot looks toward each word and blinks
      if (G.bot && G.phase === 'play' && G.word) { if (G.target !== G.word.side) look(G.word.side); G.botT += dt; if (G.botT > 1.6 && Math.abs(G.look) > LOOK * 0.8) { G.botT = 0; blink(); } }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      const p = G.S.toBoard(ev, G.root);
      // drag to a side to look that way; a quick tap looks to that side and blinks
      if (kind === 'down') { G.down = { x: ev.clientX, t: G.t, u: p && p.u }; }
      if (kind === 'move' && G.down && Math.abs(ev.clientX - G.down.x) > 12) { G.dragging = true; if (p) { const d = p.u < 0.5 ? -1 : 1; if (d !== G.target) look(d); } }
      if (kind === 'up') { if (G.down && !G.dragging && G.t - G.down.t < 0.4 && G.down.u != null) blink(G.down.u); G.down = null; G.dragging = false; }
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'visions', playing: G.playing, over: G.over, phase: G.phase, line: G.line, caught: G.caught, score: G.score, look: +(G.look / LOOK).toFixed(2), blink: +G.blink.toFixed(2),
      word: G.word && G.word.w, side: G.word && G.word.side, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.band.stop(); G.poemEl && G.poemEl.remove(); } K.cleanup(G); G = null; },
  };
}
