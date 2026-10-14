// THE VISIONS THAT WE SHARE (Dave Steele): CATCH THE WORDS.
// The great eye comes alive: it blinks, and its iris looks left and right. Dave lives with Retinitis Pigmentosa: a
// bright centre ringed by darkness, a tunnel of light. Words of a shared poem drift in through that darkness, from the
// left and the right; each one is spoken, from its side. Turn the eye toward a word (tilt the phone, drag, or hold the
// Left and Right buttons) and blink (the Blink button, or tap where the word is) while it's in view to catch it.
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
const STAY = 7.5;   // seconds a word drifts before fading back into the dark

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
    blink() { noise(ac.currentTime + 0.01, 0.07, { freq: 1200, q: 1.5, vol: 0.05, out: fx }); },
    catch(p, n) { const t = ac.currentTime + 0.01; [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.06, midi(72 + d + (n % 5) * 2), 0.7, { type: 'triangle', vol: 0.06, p, out: fx })); },
    miss(p) { tone(ac.currentTime + 0.01, 300, 0.4, { vol: 0.04, p, slide: 180, out: fx }); },
    line() { const t = ac.currentTime + 0.05; [60, 64, 67, 72, 76].forEach((m, i) => tone(t + i * 0.12, midi(m), 2.5, { type: 'triangle', vol: 0.05, att: 0.05, out: fx })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function catchTheWordsGame() {
  let G = null;

  /* ── tilt to look (works on iPhone and Android, any way up) ── */
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
    const u = 0.5 + side * (0.15 + Math.random() * 0.12), v = 0.22 + Math.random() * 0.5;
    const s = K.sprite(K.wordTex(w, { bg: 'rgba(0,0,0,.65)', fg: '#ffffff', bar: '#4aa3c8', w: 384, h: 112 }), 0.2, { order: 26, opacity: 0 });
    s.scale.set(0.17, 0.17 * 112 / 384, 1); const [x, y] = G.S.P(u, v); s.position.set(x, y, 0.06); G.root.add(s);
    G.word = { s, w, u, v, side, t: 0, du: side * 0.004 };
    G.band.word(side * 0.9);
    G.say(`${w[0].toUpperCase() + w.slice(1)}. On your ${side < 0 ? 'left' : 'right'}.`);
  }
  const gazeU = () => 0.5 + (G.look / LOOK) * 0.25;
  function blink(atU) {
    if (G.blinkT !== undefined && G.blinkT < 0.12) return;
    G.blinkT = 0; G.band.blink(); G.blinks++;
    if (atU !== undefined) G.target = Math.max(-1, Math.min(1, (atU - 0.5) / 0.25));
    if (G.phase !== 'play' || !G.word) return;
    const wd = G.word, inView = atU !== undefined ? Math.abs(wd.u - atU) < 0.17 : Math.abs(wd.u - gazeU()) < 0.17 && Math.sign(G.look) === wd.side;
    if (inView) caught(); else { G.band.miss(wd.side * 0.9); G.ui.pop('Look ' + (wd.side < 0 ? 'left ◀' : 'right ▶')); }
  }
  function caught() {
    const wd = G.word; G.word = null; G.score++; G.glow = 1;
    G.band.catch(wd.side * 0.9, G.score); G.buzz(25);
    G.fly.push({ s: wd.s, from: [wd.s.position.x, wd.s.position.y], to: G.S.P(0.5, 0.95), t: 0 });
    G.caught++; poemBox();
    if (G.caught >= LINES[G.line].words.length) {
      // a whole line: read it, and the view opens wider
      const L = LINES[G.line]; G.line++; G.caught = 0; G.band.line();
      G.say(L.text); G.wait = 4.2;
      G.tunnelTo = [0.34, 0.48, 0.64, 0.82, 1.4][G.line];
      if (G.line >= LINES.length) { G.phase = 'end'; setTimeout(() => G && finish(), 4500); }
      poemBox();
    } else G.wait = 1.2;
  }
  function finish() {
    G.phase = 'done'; G.tunnelTo = 2;
    const whole = LINES.map(l => l.text).join(' ');
    K.finale(G, { won: true, kicker: 'The visions that we share', title: 'You caught every word', line: G.work && G.work.quote,
      cells: [{ k: 'Words', v: G.score }, { k: 'Blinks', v: G.blinks }],
      say: 'You caught every word. Shared, the view is wide. ' + ((G.work && G.work.quote) || '') });
    if (G.poemEl) G.poemEl.style.bottom = 'calc(12px + env(safe-area-inset-bottom))';
  }
  function buttons() {
    const el = G.ui.buttons([
      { label: 'Left', icon: '◀', aria: 'Look left (hold)', press: () => {} },
      { label: 'Blink', icon: '👁', kind: 'red', aria: 'Blink: catch the word you are looking at', press: () => blink() },
      { label: 'Right', icon: '▶', aria: 'Look right (hold)', press: () => {} },
    ]);
    if (el) [el[0], el[2]].forEach((b, i) => {
      const d = i ? 1 : -1, on = () => { G.hold = d; }, off = () => { if (G && G.hold === d) G.hold = 0; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
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
      sensors();
      G.onGo = () => { G.phase = 'play'; G.band.start(); buttons(); poemBox(); G.ui.panel('Catch the words', `0 <small>of ${LINES.reduce((n, l) => n + l.words.length, 0)} words</small>`, { segs: [0, 4] }); };
      K.intro(G, { title: 'Catch the words', how: 'Words of a poem drift in through the dark. Turn the eye toward each one (tilt, drag, or hold Left and Right) and Blink to catch it.',
        say: 'Catch the words. Dave lives with Retinitis Pigmentosa: a bright circle of sight, with darkness all around it. Words of a poem will drift in through the dark, from the left and the right. You’ll hear each one, and which side it’s on. Turn the eye toward it, by tilting your phone, dragging, or holding Left or Right, then press Blink to catch it. Every line you finish opens the view a little wider.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // where the eye looks: tilt, a finger, or the buttons (the eye always comes back to rest a little)
      if (G.mot && G.mot.ok && Math.abs(G.mot.roll) > 4) G.target = Math.max(-1, Math.min(1, G.mot.roll / 25));
      else if (G.hold) G.target = Math.max(-1, Math.min(1, G.target + G.hold * dt * 2.2));
      else if (!G.dragging && !G.bot) G.target *= Math.pow(0.6, dt);
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
          const [x, y] = G.S.P(wd.u, wd.v); wd.s.position.set(x, y, 0.06);
          const inView = Math.abs(wd.u - gazeU()) < 0.17 && Math.sign(G.look) === wd.side && Math.abs(G.look) > LOOK * 0.25;
          wd.s.material.opacity = Math.min(1, wd.t * 2) * (inView ? 1 : 0.4) * (wd.t > STAY - 1 ? Math.max(0, STAY - wd.t) : 1);
          if (wd.t >= STAY) { G.root.remove(wd.s); wd.s.material.dispose(); G.word = null; G.wait = 1.5; G.say('It drifted away. It’ll come back.'); }
        }
      }
      for (let i = G.fly.length - 1; i >= 0; i--) {
        const f = G.fly[i]; f.t += dt / 0.8; const k = Math.min(1, f.t), e = k * k;
        f.s.position.x = f.from[0] + (f.to[0] - f.from[0]) * e; f.s.position.y = f.from[1] + (f.to[1] - f.from[1]) * e; f.s.material.opacity = 1 - k;
        if (k >= 1) { G.root.remove(f.s); f.s.material.dispose(); G.fly.splice(i, 1); }
      }
      G.ui.panel('Catch the words', `${G.score} <small>of ${LINES.reduce((n, l) => n + l.words.length, 0)} words</small>`, { segs: [G.line, 4] });
      // the robot looks toward each word and blinks
      if (G.bot && G.phase === 'play' && G.word) { G.target = G.word.side; G.botT += dt; if (G.botT > 1.6 && Math.abs(G.look) > LOOK * 0.8) { G.botT = 0; blink(); } }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      const p = G.S.toBoard(ev, G.root);
      // drag to look; a quick tap looks there and blinks
      if (kind === 'down') { G.down = { x: ev.clientX, t: G.t, u: p && p.u }; }
      if (kind === 'move' && G.down && Math.abs(ev.clientX - G.down.x) > 12) { G.dragging = true; if (p) G.target = Math.max(-1, Math.min(1, (p.u - 0.5) / 0.25)); }
      if (kind === 'up') { if (G.down && !G.dragging && G.t - G.down.t < 0.4 && G.down.u != null) blink(G.down.u); G.down = null; G.dragging = false; }
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'visions', playing: G.playing, over: G.over, phase: G.phase, line: G.line, caught: G.caught, score: G.score, look: +(G.look / LOOK).toFixed(2), blink: +G.blink.toFixed(2),
      word: G.word && G.word.w, side: G.word && G.word.side, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.band.stop(); G.offMotion && G.offMotion(); G.poemEl && G.poemEl.remove(); } K.cleanup(G); G = null; },
  };
}
