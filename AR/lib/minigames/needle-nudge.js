// MOVE THE NEEDLE (Nikki Jeffords): JUST A LITTLE BIT.
// "Researchers may think that moving that needle, just a little bit, to give a little more vision is not a big deal.
// But it is a big deal." The painting is a map of sight: hundreds of coloured marks around a white crosshair. At the
// start only a tiny spot in the middle is lit; the rest is dark. A big gauge (SIGHT, less → more) sits at the bottom.
// Tap NUDGE: the needle ratchets up one notch, the lit field grows by one ring with a shimmer of new marks, and
// something real appears in the new light: a friend's smile, the number on the bus, your own front door… The narrator
// names it, then celebrates the tiny step like it's huge: "Just a little bit. That is a big deal!" Eight nudges light
// the whole map; the marks shimmer, the music swells, and Nikki says it in her own words.
// Buttons: NUDGE (the one action) and LISTEN (says everything you can now see, for players who can't see the screen).
// Drawn pieces: needle-things.js (the gauge and the eight moments).
import * as THREE from 'three';
import * as K from './kit.js';
import { gauge, moment } from './needle-things.js';

const CLIP = new URL('../../../3D/gallery/audio/wing_5_1.mp3', import.meta.url).href;   // Nikki saying it, in her own words
const C = [0.5, 0.497];   // the crosshair
const WX = 0.6;           // the field is wider than tall, like the painting's spread of marks
// the eight moments, in order: where they appear (u, v) and what the narrator calls them
const MOMENTS = [
  { id: 'smile', at: [0.37, 0.40], name: 'A friend’s smile.' },
  { id: 'bus', at: [0.68, 0.37], name: 'The number on the bus.' },
  { id: 'door', at: [0.25, 0.61], name: 'Your own front door.' },
  { id: 'coffee', at: [0.78, 0.62], name: 'The steam on your coffee.' },
  { id: 'drawing', at: [0.15, 0.35], name: 'Your child’s drawing.' },
  { id: 'page', at: [0.85, 0.29], name: 'The words on a page.' },
  { id: 'wave', at: [0.14, 0.74], name: 'A wave from across the street.' },
  { id: 'sunset', at: [0.68, 0.13], name: 'The colours of the sunset.' },
];
const N = MOMENTS.length, SIZE = 0.15, R0 = 0.085;
const CHEER = 'Just a little bit. That is a big deal!';
const fieldD = (u, v) => Math.hypot((u - C[0]) * WX, v - C[1]);
// how far the light reaches after each notch: just past that notch's moment
const RINGS = [R0, ...MOMENTS.map(m => fieldD(...m.at) + 0.075)];
for (let i = 1; i < RINGS.length; i++) RINGS[i] = Math.max(RINGS[i], RINGS[i - 1] + 0.02);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// dark everywhere except the lit field around the crosshair; marks inside twinkle; a shimmer runs along the edge as it grows
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uR, uGrow, uFinale, uWX;
uniform vec2 uC;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = texture2D(map, vUv).rgb;
  float d = length((p - uC) * vec2(uWX, 1.0));
  float R = uR + uFinale * 0.8;
  float inside = 1.0 - smoothstep(R - 0.035, R + 0.01, d);
  float lum = max(col.r, max(col.g, col.b));
  float mark = smoothstep(0.25, 0.5, lum);
  // every mark twinkles on its own beat
  float h = hash(floor(p * 180.0));
  float tw = 0.75 + 0.35 * sin(uT * (1.5 + h * 3.0) + h * 40.0);
  vec3 lit = col * mix(1.0, tw * (1.15 + 0.25 * uFinale), mark);
  // the shimmer: new marks flare as the edge of the light sweeps over them
  float edge = exp(-abs(d - uR) * 45.0) * uGrow;
  lit += col * mark * edge * 1.6 + vec3(1.0, 0.9, 0.7) * edge * 0.06;
  // outside the light: almost black (the crosshair still shows, faintly, so you know where the middle is)
  vec3 dark = col * 0.035;
  gl_FragColor = vec4(mix(dark, lit, inside), uA);
}`;

/* ───────────────────────── sound: a soft space pad, bells that grow with every notch ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, dest = fx, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function noise(t, dur, { freq = 2000, q = 2, vol = 0.1, p = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, fx)); s.start(t); s.stop(t + dur + 0.02);
  }
  // the pad: a low, warm drone that opens up as sight grows
  const pad = ac.createGain(); pad.gain.value = 0; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; lp.connect(pad).connect(bus);
  const oscs = [45, 52, 57, 64].map((m, i) => { const o = ac.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = midi(m) * (1 + (i - 1.5) * 0.002); o.connect(lp); o.start(); return o; });
  const BELLS = [69, 72, 74, 76, 79, 81, 84, 86, 88];
  let level = 0, timer = null, next = 0, step = 0;
  function schedule() {
    const beat = 60 / 70;
    while (next < ac.currentTime + 0.2) {
      // a few slow bells; more of them, and higher, with every notch
      const notes = 1 + level;
      if (step % 2 === 0 && Math.random() < 0.3 + level * 0.08) tone(next, midi(BELLS[Math.floor(Math.random() * Math.min(BELLS.length, notes + 1))]), 2.4, { type: 'triangle', vol: 0.025 + level * 0.003, dest: bus, p: Math.random() * 1.2 - 0.6 });
      next += beat; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 50); bus.gain.setTargetAtTime(0.9, ac.currentTime, 1); pad.gain.setTargetAtTime(0.05, ac.currentTime, 1.5); },
    level(k) { level = k; lp.frequency.setTargetAtTime(300 + k * 260, ac.currentTime, 0.8); pad.gain.setTargetAtTime(0.05 + k * 0.006, ac.currentTime, 0.8); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.2); },
    // the ratchet: three quick clicks and a rising tone, higher with every notch
    nudge(k) {
      const t = ac.currentTime + 0.005;
      for (let i = 0; i < 3; i++) { noise(t + i * 0.07, 0.03, { freq: 3200, q: 4, vol: 0.35 }); tone(t + i * 0.07, 1800, 0.03, { type: 'square', vol: 0.04 }); }
      tone(t + 0.05, midi(55 + k * 2), 0.5, { type: 'triangle', vol: 0.13, slide: midi(60 + k * 2) });
    },
    // a press while the needle is still moving: one soft click, so it never feels dead
    click() { const t = ac.currentTime + 0.005; noise(t, 0.03, { freq: 2600, q: 4, vol: 0.2 }); },
    // the shimmer of new marks lighting up all around the ring, from left and right
    shimmer(k) {
      const t = ac.currentTime + 0.1, sc = [81, 84, 86, 88, 91, 93, 96];
      for (let i = 0; i < 10 + k; i++) tone(t + i * 0.08 + Math.random() * 0.05, midi(sc[Math.floor(Math.random() * sc.length)]), 0.5, { vol: 0.03, p: (Math.random() * 2 - 1) * 0.9 });
    },
    // the moment appears: a warm little chord from its side
    reveal(p, k) { const t = ac.currentTime + 0.02; [0, 4, 7, 12].forEach((s, i) => tone(t + i * 0.06, midi(60 + k + s), 1.4, { type: 'triangle', vol: 0.07, p, att: 0.005 })); },
    // the big cheer for a tiny step
    cheer() { const t = ac.currentTime + 0.05; [72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.09, midi(m), 0.9, { type: 'square', vol: 0.03 })); for (let i = 0; i < 8; i++) noise(t + 0.3 + i * 0.05 + Math.random() * 0.03, 0.05, { freq: 1500, q: 0.7, vol: 0.12, p: Math.random() * 1.4 - 0.7 }); },
    // the whole map lit: a long, rising swell
    swell() { const t = ac.currentTime + 0.1; [45, 52, 57, 64, 69, 72, 76, 81, 84, 88].forEach((m, i) => tone(t + i * 0.16, midi(m), 4.5, { type: 'triangle', vol: 0.045, att: 0.3 })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); oscs.forEach(o => o.stop(ac.currentTime + 0.5)); } catch (e) {} },
  };
}

export function needleNudgeGame() {
  let G = null;

  function hud(sub) {
    G.ui.panel('Move the needle', `${G.k}<small>of ${N} notches</small>`, { segs: [G.k, N], sub: sub || (G.k < N ? 'Tap Nudge to move it just a little bit' : 'The whole map is lit') });
  }
  function nudge() {
    if (!G || !G.playing || G.over) return;
    if (G.lock > 0 || G.k >= N) { G.band.click(); G.gauge.quiver(); G.buzz(10); return; }   // still moving: a little click and a quiver, never nothing
    const m = G.moments[G.k]; G.k++;
    G.lock = G.bot ? 2.2 : 3.4;
    G.gauge.set(G.k / N); G.band.nudge(G.k); G.band.level(G.k); G.buzz([20, 30, 20, 30, 40]);
    G.R0 = G.R; G.R1 = RINGS[G.k]; G.growT = 0;
    G.band.shimmer(G.k);
    // the moment appears in the new light a beat later
    m.revealT = 0.55; hud();
  }
  function reveal(m) {
    m.shown = true; m.pop = 0;
    const pan = (m.at[0] - 0.5) * 1.8; G.band.reveal(pan, G.k);
    const [x, y] = G.S.P(...m.at); G.fx.add(x, y, '#ffe6a0', 20, 0.25);
    G.ui.alert(m.name.replace(/\.$/, ''), CHEER, 2.6, 'black');
    G.say(m.name + ' ' + CHEER);
    setTimeout(() => { if (G && !G.over) G.band.cheer(); }, 600);
    if (G.k >= N) G.endT = 0;
  }
  function listen() {
    if (!G || G.over) return;
    G.gauge.quiver(); K.sfx.ping(0, 660, 0.06);
    const seen = G.moments.filter(m => m.shown);
    if (!seen.length) { G.say('Only a little light so far. Tap Nudge.'); G.ui.alert('Listen', 'Only a little light so far', 1.6, 'blue'); return; }
    G.say('Now you can see. ' + seen.map(m => m.name).join(' '));
    G.ui.alert('Now you can see', seen.length + (seen.length === 1 ? ' thing' : ' things'), 1.8, 'blue');
    seen.forEach((m, i) => { m.pulseT = 0.6 + i * 0.25; });
  }
  function playClip() {
    // Nikki says it herself. If her clip can't play, the narrator reads her words instead.
    try {
      const a = new Audio(CLIP); a.preload = 'auto'; G.clip = a;
      const fallback = () => { if (G && G.clip === a) { G.clip = null; G.say((G.work && G.work.quote) || ''); } };
      a.addEventListener('error', fallback, { once: true });
      a.play().catch(fallback);
    } catch (e) { G.say((G.work && G.work.quote) || ''); }
  }
  function finale() {
    G.phase = 'finale'; G.band.swell(); G.band.level(N + 2);
    G.ui.buttons([]); G.ui.alert('The whole map is lit', 'Every little bit counted', 3, 'red');
    G.say('The whole map is lit. Every little bit counted.');
    for (let i = 0; i < 6; i++) setTimeout(() => { if (!G) return; const [x, y] = G.S.P(0.2 + Math.random() * 0.6, 0.25 + Math.random() * 0.5); G.fx.add(x, y, ['#ffffff', '#f5b81f', '#ec3013', '#5aa0e0'][i % 4], 24, 0.35); }, i * 350);
    setTimeout(() => {
      if (!G) return;
      const t = Math.round(G.t - G.t0);
      K.finale(G, { won: true, kicker: 'Move the needle', title: 'It is a big deal', line: G.work && G.work.quote,
        cells: [{ k: 'Notches', v: `${N}/${N}` }, { k: 'Moments', v: N }],
        say: 'It is a big deal.' });
      if (!G.bot) setTimeout(() => G && playClip(), 2200);
    }, G.bot ? 2500 : 5000);
  }

  return {
    title: 'Move the needle',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', k: 0, lock: 0, R: R0, R0, R1: R0, growT: 1, endT: -1, t0: 0, botT: 1.2, clip: null });
      G.band = band(K.audio());
      // the painting, mostly dark
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uR: { value: R0 }, uGrow: { value: 0 }, uFinale: { value: 0 }, uWX: { value: WX }, uC: { value: new THREE.Vector2(...C) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the gauge, low on the painting
      G.gauge = gauge(0.42); const [gx, gy] = G.S.P(0.5, 0.875); G.gauge.group.position.set(gx, gy, 0.06); G.root.add(G.gauge.group);
      // the eight moments, waiting in the dark
      G.moments = MOMENTS.map((M, i) => {
        const v = moment(M.id, SIZE); const [x, y] = G.S.P(...M.at);
        v.group.position.set(x, y, 0.05); v.group.userData.y = y; v.group.userData.ph = i * 1.3; G.root.add(v.group);
        return { ...M, view: v, shown: false, revealT: -1, pop: 1, pulseT: 0 };
      });
      G.onGo = () => {
        G.phase = 'play'; G.t0 = G.t; G.band.start(); hud();
        G.ui.buttons([
          { label: 'Nudge', icon: '▲', kind: 'red', aria: 'Nudge the needle up a little bit', press: () => nudge() },
          { label: 'Listen', kind: 'black', aria: 'Listen: hear everything you can see now', press: () => listen() },
        ]);
      };
      K.intro(G, { title: 'Move the needle', how: 'This is a map of sight. Only a little bit is lit. Tap Nudge to move the needle just a little bit, and see what a little more sight can show you.',
        say: 'Move the needle. This is a map of sight, and only a little bit of it is lit. Tap Nudge to move the needle, just a little bit. See what a little more sight can show you.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      G.lock = Math.max(0, G.lock - dt);
      // the light grows outward, smoothly, after each nudge
      if (G.growT < 1) { G.growT = Math.min(1, G.growT + dt / 1.4); const e = 1 - Math.pow(1 - G.growT, 3); G.R = G.R0 + (G.R1 - G.R0) * e; }
      u.uR.value = G.R + Math.sin(G.t * 1.6) * 0.004;   // the edge of the light breathes a little
      u.uGrow.value = G.growT < 1 ? Math.sin(G.growT * Math.PI) : Math.max(0, u.uGrow.value - dt * 2);
      u.uFinale.value += ((G.phase === 'finale' ? 1 : 0) - u.uFinale.value) * Math.min(1, dt * 0.6);
      G.gauge.tick(G.t, dt);
      for (const m of G.moments) {
        if (m.revealT > 0) { m.revealT -= dt; if (m.revealT <= 0) reveal(m); }
        // pops in with a little overshoot, then floats; a pulse when LISTEN names it
        if (m.shown) { m.pop = Math.min(1, m.pop + dt / 0.7); }
        m.pulseT = Math.max(0, m.pulseT - dt);
        const e = m.pop, over = 1 + Math.sin(e * Math.PI) * 0.18, pulse = m.pulseT > 0 && m.pulseT < 0.5 ? 1 + Math.sin(m.pulseT * Math.PI * 2) * 0.12 : 1;
        m.view.group.scale.setScalar((m.shown ? (0.6 + 0.4 * e) * over : 0.6) * pulse);
        m.view.opacity(m.shown ? Math.min(1, e * 1.5) : 0);
        m.view.tick(G.t, dt);
      }
      if (G.endT >= 0 && G.phase === 'play') { G.endT += dt; if (G.endT > (G.bot ? 1.5 : 3.2)) finale(); }
      // the robot: nudges whenever the needle is ready, and listens once along the way
      if (G.bot && G.phase === 'play' && G.playing) {
        G.botT -= dt;
        if (G.botT <= 0) { G.botT = 0.5; if (G.k === 4 && !G.botListened) { G.botListened = true; listen(); } else nudge(); }
      }
    },
    pointer(kind, ev) {
      // tapping the painting does nothing on its own: the one action is the NUDGE button (so nobody nudges by accident)
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); if (G.clip) G.clip.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.9); if (G.clip && G.over) G.clip.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'needle', playing: G.playing, over: G.over, phase: G.phase, notch: G.k, R: +G.R.toFixed(3), shown: G.moments.filter(m => m.shown).length, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.band.stop(); if (G.clip) { G.clip.pause(); G.clip = null; } } K.cleanup(G); G = null; },
  };
}
