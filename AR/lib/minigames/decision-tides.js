// DECISION DIVIDE (Will Hollimon): TIDES OF DECISION.
// Will's painting splits down the middle: the cool, familiar blue world on the left, the bright, fiery, unknown world on
// the right, with the bridge between them (his choice about cataract surgery: it could clear his sight or take it).
// Here the two sides battle like weather. The warm side glows (embers rise, the light pulses); the cool side sways and
// swirls (mist, wind, the picture itself drifts). Tilt the phone to give one side strength: it pushes across the middle
// and washes over the other side in waves, repainting it in its own colours. A five-step timeline gives it a purpose:
//   1 Today (the familiar): fill the picture with the cool side  ·  2 A new hope: fill it with the warm side
//   3 The storm of questions: gusts blow both ways, keep the line in the middle  ·  4 Riding the waves: follow the marker
//   5 Finding balance: hold the middle, and the two worlds meet in the light
// By ear: the cool side has wind and a minor pad, the warm side a crackle and a major pad, mixed by how much of each
// you see; soft ticks from the line's side tell you where it is, and a chime rings while you're in the target zone.
// No tilt sensor? Hold the arrow buttons, or drag left and right.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const CHAPTERS = [
  { name: 'Today', kicker: 'Step 1 of 5 · the familiar', zone: [0.68, 0.88], hold: 2.5,
    say: 'Step one. Today. The left side is the world Will knows: cool, calm and familiar. Tilt your phone to the left to give it strength, until the cool side fills most of the picture.',
    how: 'Tilt left: let the cool side fill the picture' },
  { name: 'A new hope', kicker: 'Step 2 of 5 · the unknown', zone: [0.12, 0.32], hold: 2.5,
    say: 'Step two. A new hope. The right side is the surgery: bright and hopeful, and a little frightening. Tilt right until the warm side fills most of the picture.',
    how: 'Tilt right: let the warm side fill the picture' },
  { name: 'The storm of questions', kicker: 'Step 3 of 5 · questions', zone: [0.4, 0.6], hold: 5, gusts: true,
    say: 'Step three. The storm of questions. What if it works? What if it doesn’t? Gusts blow from both sides. Tilt against them and keep the line in the middle.',
    how: 'Tilt against the gusts: keep the line in the middle' },
  { name: 'Riding the waves', kicker: 'Step 4 of 5 · feelings', zone: 'moving', hold: 6,
    say: 'Step four. Riding the waves. Feelings come in waves, one way and then the other. Follow the glowing marker as it moves.',
    how: 'Follow the glowing marker' },
  { name: 'Finding balance', kicker: 'Step 5 of 5 · balance', zone: [0.45, 0.55], hold: 3,
    say: 'Step five. Finding balance. Take a breath. Bring the two sides together, right in the middle, and hold them there.',
    how: 'Hold the line right in the middle' },
];
const MAX_T = 32;                                   // a step never traps you: after this long it moves on by itself
const LAMP = { u: 0.625, v: 0.715 }, SUN = { u: 0.505, v: 0.34 };

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uD, uAmp, uTongue, uDir, uZ0, uZ1, uZone, uA, uBlend, uGlow, uSwirl, uFlash, uH;
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 coolP(float L){ return mix(mix(vec3(0.03, 0.06, 0.15), vec3(0.24, 0.42, 0.66), smoothstep(0.0, 0.5, L)), vec3(0.86, 0.92, 0.98), smoothstep(0.5, 1.0, L)); }
vec3 warmP(float L){ return mix(mix(vec3(0.24, 0.04, 0.02), vec3(0.95, 0.46, 0.12), smoothstep(0.0, 0.5, L)), vec3(1.0, 0.93, 0.64), smoothstep(0.5, 1.0, L)); }
vec3 tex(vec2 q){ q = clamp(q, 0.0, 1.0); return texture2D(map, vec2(q.x, 1.0 - q.y)).rgb; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // the line between the worlds: wavy, and when you push, tongues of one side reach across the other
  float b = uD + uAmp * (sin(p.y * 11.0 + uT * 1.7) * 0.5 + sin(p.y * 23.0 - uT * 2.3) * 0.25)
              + uDir * uTongue * pow(max(0.0, sin(p.y * 7.0 - uT * 3.2)), 3.0) * 0.16;
  float cool = 1.0 - smoothstep(b - 0.01, b + 0.01, p.x);
  // the cool side sways and swirls
  vec2 q = p, sw = vec2(sin(p.y * 9.0 + uT * 0.9) + sin((p.x + p.y) * 13.0 - uT * 1.3) * 0.5, cos(p.x * 8.0 - uT * 0.8) + cos((p.x - p.y) * 11.0 + uT * 1.1) * 0.5);
  q += sw * uSwirl * 0.007 * cool;
  vec3 c = tex(q), raw = tex(p);
  float L = lum(c), nativeCool = 1.0 - smoothstep(0.47, 0.53, q.x);
  vec3 coolC = mix(mix(c, coolP(L), 0.8), c, nativeCool);
  vec3 warmC = mix(c, mix(c, warmP(L), 0.8), nativeCool);
  vec3 col = mix(warmC, coolC, cool);
  // the warm side glows
  col += (1.0 - cool) * vec3(1.0, 0.58, 0.22) * uGlow * (0.07 + 0.05 * sin(uT * 2.2));
  col += (1.0 - cool) * vec3(1.0, 0.85, 0.5) * uGlow * 0.18 * exp(-length((p - vec2(0.505, 0.34)) * vec2(1.0, uH)) * 5.0);
  // a mist veil on the cool side
  col = mix(col, vec3(0.7, 0.8, 0.92), cool * uSwirl * 0.08 * (0.5 + 0.5 * sin(p.x * 10.0 + p.y * 6.0 + uT)));
  // foam where the two worlds meet
  float e = exp(-abs(p.x - b) * 80.0);
  col += e * vec3(1.0, 0.92, 0.8) * (0.25 + uTongue * 0.4);
  // the target zone: glowing edges at the top and bottom of the picture
  float inZ = step(uZ0, p.x) * step(p.x, uZ1), edge = max(smoothstep(0.035, 0.0, p.y), smoothstep(0.965, 1.0, p.y));
  col = mix(col, vec3(1.0, 1.0, 0.85), inZ * edge * 0.75 * uZone);
  col += vec3(0.25) * uZone * (exp(-abs(p.x - uZ0) * 300.0) + exp(-abs(p.x - uZ1) * 300.0)) * 0.6;
  // balance: the two worlds meet in the light
  col = mix(col, raw * 1.08 + vec3(0.06, 0.04, 0.02), uBlend);
  col += vec3(uFlash * 0.2);
  gl_FragColor = vec4(col, uA);
}`;

/* ── the two worlds' sounds ── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function worlds(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function pad(notes, type, cutoff, p) {
    const g = ac.createGain(), f = ac.createBiquadFilter(); g.gain.value = 0; f.type = 'lowpass'; f.frequency.value = cutoff; f.connect(g).connect(pan(p, out));
    const os = []; for (const m of notes) for (const det of [-6, 6]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = type; o.frequency.value = midi(m); o.detune.value = det; og.gain.value = 0.02; o.connect(og).connect(f); o.start(); os.push(o); }
    return { g, f, os };
  }
  const coolPad = pad([45, 52, 60, 64], 'triangle', 1400, -0.5);      // A minor: the familiar, a little sad
  const warmPad = pad([45, 52, 61, 64, 68], 'sawtooth', 900, 0.5);    // A major: bright, hopeful
  const wind = ac.createBufferSource(), wf = ac.createBiquadFilter(), wg = ac.createGain(), wp = ac.createStereoPanner ? ac.createStereoPanner() : null;
  wind.buffer = nb; wind.loop = true; wf.type = 'bandpass'; wf.frequency.value = 500; wf.Q.value = 0.9; wg.gain.value = 0;
  wind.connect(wf).connect(wg); if (wp) { wg.connect(wp); wp.connect(out); } else wg.connect(out); wind.start();
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.08, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  const tone = (t, f, dur, { type = 'sine', vol = 0.08, p = 0 } = {}) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.02); };
  let wt = 0;
  return {
    // how much of each world there is (cool 0..1), how hard it's moving
    mix(cool, push, dt) {
      const t = ac.currentTime; wt += dt;
      coolPad.g.gain.setTargetAtTime(0.25 + cool * 1.1, t, 0.3); warmPad.g.gain.setTargetAtTime(0.25 + (1 - cool) * 1.0, t, 0.3);
      warmPad.f.frequency.setTargetAtTime(600 + (1 - cool) * 1400, t, 0.3);
      wg.gain.setTargetAtTime(0.03 + cool * 0.09 + push * 0.12, t, 0.2); wf.frequency.setTargetAtTime(380 + Math.sin(wt * 0.8) * 160 + push * 500, t, 0.2); if (wp) wp.pan.setTargetAtTime(Math.sin(wt * 0.5) * 0.7, t, 0.3);
      if (Math.random() < dt * (2 + (1 - cool) * 9)) noise(t + 0.01, 0.025, { freq: 2500 + Math.random() * 3000, q: 4, vol: 0.05 + Math.random() * 0.06 * (1 - cool), p: 0.3 + Math.random() * 0.6 });   // the fire crackles
    },
    wave(dir) { noise(ac.currentTime + 0.02, 1.1, { freq: 400, q: 0.6, vol: 0.18, p: dir * 0.6, sweep: 1800 }); },
    tick(p, inZone) { tone(ac.currentTime + 0.01, inZone ? 1320 : 660, 0.08, { type: 'triangle', vol: inZone ? 0.06 : 0.035, p }); },
    gust(dir) { noise(ac.currentTime + 0.02, 1.4, { freq: 300, q: 0.8, vol: 0.25, p: -dir * 0.8, sweep: 1200 }); },
    step(n) { [523.3, 659.3, 784, 1046.5].slice(0, 2 + Math.min(2, n)).forEach((f, i) => tone(ac.currentTime + 0.03 + i * 0.12, f, 1.0, { type: 'triangle', vol: 0.09 })); },
    resolve() { const t = ac.currentTime + 0.05; [45, 52, 57, 61, 64, 71].forEach((m, i) => tone(t + i * 0.08, midi(m), 3.5, { type: 'triangle', vol: 0.07 })); },
    volume(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { out.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { for (const pd of [coolPad, warmPad]) pd.os.forEach(o => o.stop()); wind.stop(); out.disconnect(); } catch (e) {} }, 800); },
  };
}

export function tidesOfDecisionGame() {
  let G = null;

  /* ── tilt (the same way the robot dance reads it: works on iPhone and Android, any way up) ── */
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

  const zoneOf = (C) => C.zone === 'moving' ? (() => { const c = 0.5 + 0.27 * Math.sin(G.ct * 0.55); return [c - 0.1, c + 0.1]; })() : C.zone;
  function hud() {
    const C = CHAPTERS[G.ch];
    if (!C) { G.ui.panel('Decision divide', 'Balance', { segs: [CHAPTERS.length, CHAPTERS.length], sub: 'The two worlds meet in the light' }); return; }
    G.ui.panel(C.kicker, C.name, { segs: [G.ch, CHAPTERS.length], sub: C.how + (G.inZ ? ' · hold it!' : '') });
  }
  function startChapter(i) {
    G.ch = i; G.ct = 0; G.held = 0; G.gustT = 2.5;
    const C = CHAPTERS[i];
    G.ui.banner(C.name, C.how, 0, C.kicker); G.bannerT = 3;
    G.say(C.say); hud();
  }
  function chapterDone(auto) {
    G.snd.step(G.ch); G.flash = 0.6; G.buzz([30, 30, 60]);
    if (!auto) G.stars++;
    const [x, y] = G.S.P(G.d, 0.5); G.fx.add(x, y, '#fff3c8', 22, 0.3);
    G.ui.alert(auto ? 'That’s okay' : 'Step complete', auto ? 'Some choices take time.' : CHAPTERS[G.ch].name, 1.8, auto ? 'black' : 'red');
    if (G.ch + 1 < CHAPTERS.length) { G.next = 2.4; }
    else { G.balanced = true; G.next = -1; G.endT = 0; G.snd.resolve(); G.say('The two worlds meet in the light. Whatever Will decides, he can stand in the middle and see both.'); }
  }

  return {
    title: 'Tides of decision',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { d: 0.5, vel: 0, ch: -1, ct: 0, held: 0, inZ: false, next: 0, balanced: false, endT: -1, flash: 0, push: 0, tongue: 0, gust: 0, gustT: 0, tickT: 0, stars: 0, btn: 0, drag: null, waveT: 0, bannerT: 0, t0: 0, embers: [], wisps: [] });
      G.uni = { map: { value: null }, uT: { value: 0 }, uD: { value: 0.5 }, uAmp: { value: 0.006 }, uTongue: { value: 0 }, uDir: { value: 1 }, uZ0: { value: 0 }, uZ1: { value: 0 }, uZone: { value: 0 }, uA: { value: 0 }, uBlend: { value: 0 }, uGlow: { value: 1 }, uSwirl: { value: 1 }, uFlash: { value: 0 }, uH: { value: G.h } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // embers rise on the warm side, wisps of mist swirl on the cool side
      for (let i = 0; i < 22; i++) { const s = K.sprite(K.dotTex, 0.012, { color: i % 3 ? '#ffb347' : '#ffe08a', additive: true, opacity: 0, order: 14 }); s.position.z = 0.04; G.root.add(s); G.embers.push({ s, u: Math.random(), v: Math.random(), sp: 0.03 + Math.random() * 0.05, ph: Math.random() * 6 }); }
      for (let i = 0; i < 9; i++) { const s = K.sprite(K.glowTex, 0.12 + Math.random() * 0.1, { color: '#bcd6ff', additive: true, opacity: 0, order: 14 }); s.position.z = 0.04; G.root.add(s); G.wisps.push({ s, a: Math.random() * 6.28, r: 0.08 + Math.random() * 0.2, cu: 0.15 + Math.random() * 0.3, cv: 0.2 + Math.random() * 0.6, sp: 0.3 + Math.random() * 0.4 }); }
      G.lamp = K.sprite(K.glowTex, 0.1, { color: '#ffd28a', additive: true, opacity: 0, order: 15 }); { const [x, y] = G.S.P(LAMP.u, LAMP.v); G.lamp.position.set(x, y, 0.045); } G.root.add(G.lamp);
      G.sun = K.sprite(K.glowTex, 0.3, { color: '#fff4d0', additive: true, opacity: 0, order: 15 }); { const [x, y] = G.S.P(SUN.u, SUN.v); G.sun.position.set(x, y, 0.045); } G.root.add(G.sun);
      G.snd = K.audio() ? worlds(K.audio()) : new Proxy({}, { get: () => () => {} });
      sensors();
      G.ui.buttons([
        { label: 'Cool', icon: '◀', kind: 'red', aria: 'Give the cool side strength (hold)', press: () => { G.btn = -1; }, release: () => { if (G.btn < 0) G.btn = 0; } },
        { label: 'Warm', icon: '▶', kind: 'red', aria: 'Give the warm side strength (hold)', press: () => { G.btn = 1; }, release: () => { if (G.btn > 0) G.btn = 0; } },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.snd.volume(1); startChapter(0); };
      K.intro(G, { title: 'Tides of decision', how: 'Two worlds battle down the middle of Will’s painting. Tilt your phone to give one side strength and push it across, like waves. Five steps, one choice.',
        say: 'Tides of decision. Will has a choice to make about surgery on his eyes: it could clear his sight, or take it away. In his painting, the cool familiar world and the bright unknown world meet in the middle, and here they battle like weather. Tilt your phone to give one side strength, and push it across like a wave. No tilt? Hold the buttons, or drag left and right. Five steps, one choice.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.bannerT > 0) { G.bannerT -= dt; if (G.bannerT <= 0) G.ui.hideBanner(); }
      G.uni.uA.value += ((G.ready && !G.over ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      // the push: your tilt (or the buttons, or a drag), plus the weather's gusts
      const C = CHAPTERS[G.ch], live = G.playing && C && G.next === 0 && !G.balanced;
      let roll = G.mot && G.mot.ok ? G.mot.roll : 0;
      if (G.btn) roll = G.btn * 28; if (G.drag) roll = G.drag.roll;
      if (G.bot && live) { const z = zoneOf(C), c = (z[0] + z[1]) / 2; roll = Math.max(-30, Math.min(30, (G.d - c) * 160 + G.gust * 25)); }
      roll = Math.max(-35, Math.min(35, roll));
      const tilt = Math.abs(roll) < 4 ? 0 : roll;                                  // a little dead zone, so a steady hand holds still
      if (live && C.gusts) { G.gustT -= dt; if (G.gustT <= 0) { G.gustT = 1.6 + Math.random() * 1.8; G.gust = (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.5); G.snd.gust(G.gust); } }
      G.gust *= Math.exp(-dt * 1.1);
      const force = (G.playing ? -tilt / 30 * 0.55 : 0) + G.gust * 0.45 + (G.balanced ? (0.5 - G.d) * 2 : 0);   // tilt left (−) makes the cool side grow (the line moves right)
      G.vel += (force - G.vel * 2.2) * dt; G.d = Math.max(0.06, Math.min(0.94, G.d + G.vel * dt));
      if (G.d <= 0.06 || G.d >= 0.94) G.vel *= 0.5;
      G.push += (Math.min(1, Math.abs(G.vel) * 4) - G.push) * Math.min(1, dt * 4);
      G.tongue += (Math.min(1, Math.abs(G.vel) * 5) - G.tongue) * Math.min(1, dt * 3);
      if (Math.abs(G.vel) > 0.04) G.uni.uDir.value = Math.sign(G.vel);
      G.waveT -= dt; if (G.push > 0.55 && G.waveT <= 0) { G.waveT = 1.2; G.snd.wave(Math.sign(G.vel)); }
      // the picture
      const U = G.uni; U.uT.value = G.t; U.uD.value = G.d; U.uAmp.value = 0.005 + G.push * 0.02; U.uTongue.value = G.tongue;
      U.uSwirl.value = 1 + G.push * 1.5 + Math.abs(G.gust); U.uGlow.value = 1 + G.push * 0.6;
      G.flash = Math.max(0, G.flash - dt * 1.5); U.uFlash.value = G.flash;
      // embers and wisps show only on their own side
      for (const e of G.embers) { e.v -= e.sp * dt; e.u += Math.sin(G.t * 1.5 + e.ph) * 0.01 * dt; if (e.v < 0.05) { e.v = 0.9; e.u = Math.random(); }
        const [x, y] = G.S.P(e.u, e.v); e.s.position.set(x, y, 0.04); e.s.material.opacity = (e.u > G.d + 0.02 ? 1 : 0) * U.uA.value * (0.5 + 0.5 * Math.sin(G.t * 6 + e.ph)) * (1 - U.uBlend.value); }
      for (const w of G.wisps) { w.a += w.sp * dt * (1 + G.push * 2); const u = Math.min(G.d - 0.05, w.cu * G.d / 0.5 + Math.cos(w.a) * w.r * 0.6), v = w.cv + Math.sin(w.a * 1.3) * w.r * 0.4;
        const [x, y] = G.S.P(u, v); w.s.position.set(x, y, 0.04); w.s.material.opacity = (u > 0.02 ? 0.12 : 0) * U.uA.value * (0.6 + 0.4 * Math.sin(w.a * 2)) * (1 - U.uBlend.value); }
      if (G.snd.mix) G.snd.mix(G.d, G.push, dt);
      // the timeline
      if (G.playing && C && !G.balanced) {
        if (G.next > 0) { G.next -= dt; if (G.next <= 0) { G.next = 0; startChapter(G.ch + 1); } }
        else {
          G.ct += dt;
          const z = zoneOf(C); U.uZ0.value = z[0]; U.uZ1.value = z[1]; U.uZone.value += (1 - U.uZone.value) * Math.min(1, dt * 4);
          const was = G.inZ; G.inZ = G.d > z[0] && G.d < z[1];
          if (G.inZ) G.held += dt; else G.held = Math.max(0, G.held - dt * 0.5);
          if (was !== G.inZ) hud();
          G.tickT -= dt; if (G.tickT <= 0) { G.tickT = G.inZ ? 0.3 : 0.55; G.snd.tick((G.d - 0.5) * 2, G.inZ); if (G.inZ) G.buzz(8); }
          if (G.held >= C.hold) chapterDone(false); else if (G.ct > MAX_T) chapterDone(true);
        }
      } else U.uZone.value += (0 - U.uZone.value) * Math.min(1, dt * 3);
      // balance: the worlds meet, the sun and the bridge lamp shine, then Will's words
      if (G.balanced) {
        G.endT += dt; U.uBlend.value = Math.min(1, G.endT / 2.5) * 0.85;
        G.sun.material.opacity = Math.min(0.8, G.endT * 0.4); G.sun.scale.setScalar(0.3 + Math.sin(G.t * 2) * 0.02);
        G.lamp.material.opacity = Math.min(0.9, G.endT * 0.5) * (0.85 + Math.sin(G.t * 3) * 0.1);
        if (G.endT > 4.2 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('decision-divide:tides', t, 'lower');
          G.snd.volume(0.45);
          K.finale(G, { won: true, title: 'The worlds meet in the light', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Steps', v: `${CHAPTERS.length}/${CHAPTERS.length}` }, { k: 'Held', v: `${G.stars}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') G.drag = { x0: ev.clientX, roll: 0 };
      else if (kind === 'move' && G.drag) G.drag.roll = Math.max(-30, Math.min(30, ((ev.clientX - G.drag.x0) / (innerWidth * 0.3)) * 30));   // drag right = tilt right
      else if (kind === 'up') G.drag = null;
    },
    pause() { if (G) { G.paused = true; G.snd.volume(0); } },
    resume() { if (G) { G.paused = false; G.snd.volume(G.over ? 0.45 : 1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'tides', playing: G.playing, over: G.over, ch: G.ch, d: +G.d.toFixed(3), held: +G.held.toFixed(2), inZ: G.inZ, stars: G.stars, sensor: !!(G.mot && G.mot.ok), balanced: G.balanced, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.offMotion && G.offMotion(); G.snd && G.snd.stop && G.snd.stop(); } K.cleanup(G); G = null; },
  };
}
