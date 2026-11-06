// STRENGTHS & LIMITATIONS (Sophia Dunn-Walker): CREW CALL, a film-set Simon Says.
// "You have to rely on your key collaborators… It really boils down to communication."
// Your crew is built right into Sophia's collage: the CAMERA is the big lens on the left, the LIGHTS are the projector
// up top, and the SOUND is the teal record beside her face on the right. Each crew member has their own musical
// sound and flashes and shakes on the painting when they play it. Each round the crew plays a little sequence
// ("camera, sound, lights…"): watch and listen, then play it back in the same order with the three buttons (or tap
// them in the painting). Get it right and it's ACTION: the painting's own film reel spins like mad, the lens on her
// head zooms, and one of the collage's colours comes back into the black-and-white film. The sequence grows by one
// every round and gets a little quicker. Miss a note and the crew simply plays it again. Six rounds and it's a wrap:
// a projector beam sweeps across her face, the collage is in full colour, and her animation fades in.
// No words are drawn over the painting: the crew is shown by light, shaking and sound.
// Everything is drawn from the painting itself with one shader (no extra pictures needed).
import * as THREE from 'three';
import * as K from './kit.js';

const ROUNDS = 6, START = 2;   // rounds in the shoot; how long the first sequence is (it grows by one each round)
// the crew stations: where they are in the painting (u, v, radius), the side they play from, and the button
const ST = [
  { id: 'camera', name: 'Camera', where: 'on the left', u: 0.156, v: 0.723, r: 0.09, pan: -0.85, label: 'Camera' },
  { id: 'lights', name: 'Lights', where: 'up top', u: 0.44, v: 0.15, r: 0.08, pan: 0, label: 'Lights' },
  { id: 'sound', name: 'Sound', where: 'on the right', u: 0.846, v: 0.371, r: 0.095, pan: 0.85, label: 'Sound' },
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uA, uT, uReel, uLens, uAll, uBeam, uBase;
uniform float uC[6];
uniform vec3 uS;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec3 hsv(vec3 c){
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x);
}
float band(float h, float c){ float d = abs(h - c); d = min(d, 1.0 - d); return smoothstep(0.09, 0.035, d); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the film reel spins
  vec2 R = vec2(0.5625, 0.71), d = p - R; float r = length(d);
  if (r < 0.094) { float a = uReel * smoothstep(0.094, 0.084, r); s = R + mat2(cos(a), -sin(a), sin(a), cos(a)) * d; }
  // the lens on her head zooms in and out
  vec2 L = vec2(0.596, 0.212), dl = p - L; float rl = length(dl);
  if (rl < 0.062) { float k = uLens * smoothstep(0.062, 0.035, rl); s = L + dl * (1.0 - 0.38 * k); }
  // the crew stations shake and swell when they play
  vec2 c0 = vec2(0.156, 0.723), c1 = vec2(0.44, 0.15), c2 = vec2(0.846, 0.371);
  float w0 = smoothstep(0.11, 0.0, length(p - c0)), w1 = smoothstep(0.1, 0.0, length(p - c1)), w2 = smoothstep(0.115, 0.0, length(p - c2));
  s += vec2(sin(uT * 60.0), cos(uT * 53.0)) * 0.004 * (uS.x * w0 + uS.y * w1 + uS.z * w2);
  s = mix(s, c0 + (s - c0) * 0.88, uS.x * w0); s = mix(s, c1 + (s - c1) * 0.88, uS.y * w1); s = mix(s, c2 + (s - c2) * 0.88, uS.z * w2);
  vec3 col = at(s);
  // black-and-white film, with each round's colour coming back
  vec3 hv = hsv(col);
  float amt = uBase;
  amt = max(amt, uC[0] * band(hv.x, 0.53)); amt = max(amt, uC[1] * band(hv.x, 0.07)); amt = max(amt, uC[2] * band(hv.x, 0.82));
  amt = max(amt, uC[3] * band(hv.x, 0.60)); amt = max(amt, uC[4] * band(hv.x, 0.13)); amt = max(amt, uC[5] * band(hv.x, 0.98));
  amt = max(amt, uAll);
  // a crew member in full colour while they play
  amt = max(amt, uS.x * w0); amt = max(amt, uS.y * w1); amt = max(amt, uS.z * w2);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l) * vec3(1.03, 1.0, 0.94), col, amt);
  col *= 1.0 + 0.03 * sin(uT * 47.0) * (1.0 - uAll);                // a little film flicker
  // and lit up
  col += vec3(1.0, 0.55, 0.3) * uS.x * w0 * 0.5 + vec3(1.0, 0.92, 0.6) * uS.y * w1 * 0.55 + vec3(0.35, 0.85, 1.0) * uS.z * w2 * 0.5;
  col += vec3(1.0, 0.7, 0.35) * uLens * 0.28 * smoothstep(0.062, 0.0, rl);
  // the projector's beam sweeps across her face at the wrap
  vec2 P = c1, dir = normalize(vec2(0.74, 0.45) - P), q = p - P;
  float along = dot(q, dir), side = abs(q.x * dir.y - q.y * dir.x) / max(along, 0.001);
  float beam = step(0.0, along) * smoothstep(0.26, 0.06, side) * smoothstep(0.8, 0.25, along);
  col += vec3(1.0, 0.93, 0.72) * beam * uBeam * (0.32 + 0.05 * sin(uT * 38.0));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the film-set band ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];   // C · Am · F · G
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0, att = 0.004 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0, lp = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  const beat = 60 / 96;
  let next = 0, step = 0, timer = null, rolling = 0, level = 0, quiet = 0;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b = step % 8, bar = Math.floor(step / 8), ch = CHORDS[bar % 4], v = quiet ? 0.45 : 1;
      // the projector's soft clatter, racing while the reel spins
      noise(t, 0.03, { freq: 5200, type: 'highpass', vol: (rolling ? 0.08 : 0.022) * v }); if (rolling) { noise(t + beat / 4, 0.03, { freq: 4600, type: 'highpass', vol: 0.06 }); if (b % 2 === 0) tone(t, 70, 0.12, { vol: 0.25, slide: 40 }); }
      if (b === 0) { tone(t, midi(ch[0] - 12), beat * 7, { type: 'triangle', vol: 0.15 * v, att: 0.05 }); ch.slice(1).forEach((m, i) => tone(t + i * 0.03, midi(m), beat * 7.5, { vol: (0.026 + level * 0.006) * v, att: 0.4 })); }
      if (b === 4) tone(t, midi(ch[0] - 5), beat * 3, { type: 'triangle', vol: 0.09 * v, att: 0.05 });
      if (level > 1 && (b === 2 || b === 6)) tone(t, midi(ch[1 + (bar + b) % 3] + 12), beat * 1.4, { type: 'triangle', vol: 0.03 * v });
      next += beat / 2; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.8); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    roll(on) { rolling = on ? 1 : 0; },
    level(n) { level = n; },
    quiet(on) { quiet = on ? 1 : 0; },
    // each crew member's own musical note and character, from their own side
    // CAMERA: a warm low horn (C) with the camera's clicking whir · LIGHTS: a bright bell (G) with the lamp's shimmer ·
    // SOUND: a round bass "boom" (E) with a mic-check blip
    play(id, p, len = 0.42) {
      const t = ac.currentTime + 0.01;
      if (id === 'camera') {
        tone(t, midi(48), len, { type: 'sawtooth', vol: 0.13, att: 0.02, p, out: fx, lp: 900 }); tone(t, midi(60), len, { type: 'square', vol: 0.03, att: 0.02, p, out: fx, lp: 1400 });
        for (let i = 0; i < 6; i++) noise(t + i * (len / 6), 0.02, { freq: 3200, q: 5, vol: 0.18, p, out: fx });
      }
      if (id === 'lights') {
        [[1, 0.12], [2.01, 0.05], [3.0, 0.03], [4.2, 0.015]].forEach(([k, v]) => tone(t, midi(79) * k, len * 1.8, { vol: v, att: 0.004, p, out: fx }));
        noise(t, len, { freq: 8000, type: 'highpass', vol: 0.03, p, out: fx, att: 0.05 });
      }
      if (id === 'sound') {
        tone(t, midi(52), len * 1.3, { type: 'sine', vol: 0.32, att: 0.006, p, out: fx, slide: midi(50) }); tone(t, midi(64), len, { type: 'triangle', vol: 0.06, att: 0.01, p, out: fx });
        tone(t + 0.02, 1760, 0.05, { type: 'square', vol: 0.03, p, out: fx });
      }
    },
    no(p) { const t = ac.currentTime + 0.01; tone(t, 233, 0.22, { type: 'sawtooth', vol: 0.06, p, slide: 180, lp: 1200 }); tone(t + 0.2, 175, 0.35, { type: 'sawtooth', vol: 0.06, p, slide: 120, lp: 1000 }); },
    yourTurn() { const t = ac.currentTime + 0.01; tone(t, midi(84), 0.08, { vol: 0.06, out: fx }); tone(t + 0.1, midi(88), 0.12, { vol: 0.06, out: fx }); },
    clap() { const t = ac.currentTime + 0.01; noise(t, 0.09, { freq: 2200, q: 0.7, vol: 0.6, out: fx, att: 0.001 }); tone(t, 140, 0.12, { vol: 0.2, slide: 70, out: fx }); },
    bloom(n) { const t = ac.currentTime + 0.05; [0, 4, 7, 11, 14, 19].forEach((d, i) => tone(t + i * 0.07, midi(67 + d + n), 1.4, { type: 'triangle', vol: 0.05, out: fx })); },
    wrap() { const t = ac.currentTime + 0.1; [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.13, midi(m), 3.2, { type: 'triangle', vol: 0.06, att: 0.05, out: fx })); noise(t, 2.5, { freq: 3000, q: 0.5, vol: 0.06, sweep: 9000, out: fx, att: 0.3 }); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function crewCallGame() {
  let G = null;

  function hud() {
    const sub = G.phase === 'show' ? 'Watch and listen…' : G.phase === 'input' ? `Your turn: ${G.pos} of ${G.seq.length}` : G.phase === 'roll' ? 'Action!' : G.round >= ROUNDS ? 'That’s a wrap!' : 'Quiet on set…';
    G.ui.panel('Crew call', `Round ${Math.min(ROUNDS, G.round + 1)}<small>of ${ROUNDS}</small>`, { segs: [G.round, ROUNDS], sub });
  }
  // how quick the crew plays this round
  const gapOf = () => Math.max(0.42, 0.78 - G.round * 0.07);
  function newRound() {
    // the sequence keeps what came before and grows by one, never three of the same in a row
    while (G.seq.length < START + G.round) {
      let i = Math.floor(Math.random() * 3);
      const n = G.seq.length; if (n >= 2 && G.seq[n - 1] === i && G.seq[n - 2] === i) i = (i + 1 + Math.floor(Math.random() * 2)) % 3;
      G.seq.push(i);
    }
    G.phase = 'wait';
    G.say(G.round === 0 ? 'Round 1. Watch and listen.' : `Round ${G.round + 1}. ${G.seq.length} this time.`);
    G.showT = 2.0; hud();
  }
  function show() { G.phase = 'show'; G.showI = 0; G.stepT = 0.1; G.band.quiet(true); hud(); }
  function flash(i, len) { G.pulse[i] = 1; G.hold[i] = len; G.reelKick += 1.2; G.band.play(ST[i].id, ST[i].pan, len); }
  function press(i) {
    if (!G || !G.playing || G.over) return;
    if (G.phase !== 'input') { flash(i, 0.3); return; }     // play along any time: you hear your note
    G.inputT = 0;
    flash(i, 0.34);
    const [x, y] = G.S.P(ST[i].u, ST[i].v);
    if (G.seq[G.pos] === i) {
      G.pos++; G.buzz(25); G.fx.add(x, y, ['#ffb27a', '#ffe9a0', '#9fe3ff'][i], 12, 0.22);
      if (G.pos >= G.seq.length) action(); else hud();
    } else {
      G.misses++; G.band.no(ST[i].pan); G.buzz([30, 40, 30]);
      G.phase = 'wait'; G.say('Oops! Again.'); G.showT = 1.6; hud();
    }
  }
  // the sequence played back right: the shot rolls
  function action() {
    G.phase = 'roll'; G.band.quiet(false);
    G.say('Action!'); G.band.clap(); G.band.roll(true); G.rollT = 2.4; hud();
  }
  function cut() {
    G.band.roll(false); G.band.clap();
    G.target[G.round] = 1; G.band.bloom(G.round); G.round++; G.band.level(G.round);
    const [x, y] = G.S.P(0.5625, 0.71); G.fx.add(x, y, '#ffd25a', 30, 0.4);
    G.buzz([40, 30, 80]);
    if (G.round >= ROUNDS) { G.phase = 'done'; G.say('Cut! That’s a wrap!'); G.endT = 0; G.band.wrap(); hud(); return; }
    G.phase = 'wait'; G.say(`Cut! Great take. ${ROUNDS - G.round} more.`);
    G.nextT = 2.4; hud();
  }
  function tapAt(u, v) {
    let best = -1, bd = 1e9;
    ST.forEach((s, i) => { const d = Math.hypot(u - s.u, (v - s.v) * G.h); if (d < s.r * 1.6 && d < bd) { bd = d; best = i; } });
    if (best >= 0) press(best);
  }

  return {
    title: 'Crew call',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { round: 0, seq: [], pos: 0, phase: 'intro', showI: 0, stepT: -1, showT: -1, rollT: -1, nextT: -1, endT: -1, inputT: 0, misses: 0, t0: 0, botT: 0,
        reel: 0, reelV: 0.4, reelKick: 0, lens: 0, pulse: [0, 0, 0], hold: [0, 0, 0], col: [0, 0, 0, 0, 0, 0], target: [0, 0, 0, 0, 0, 0], all: 0, beam: 0 });
      G.band = band(K.audio());
      // the painting itself, alive: one shader draws it with the moving reel, lens, crew, colours and beam
      G.uni = { map: { value: null }, uA: { value: 0 }, uT: { value: 0 }, uReel: { value: 0 }, uLens: { value: 0 }, uAll: { value: 0 }, uBeam: { value: 0 }, uBase: { value: 0.14 },
        uC: { value: [0, 0, 0, 0, 0, 0] }, uS: { value: new THREE.Vector3() } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.02; G.face.renderOrder = 11; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // each station: a coloured glow and a ring (no words on the painting)
      const TINT = ['#ff9a5c', '#ffe08a', '#7fd6ff'];
      G.marks = ST.map((s, i) => {
        const [x, y] = G.S.P(s.u, s.v);
        const glow = K.sprite(K.glowTex, s.r * 3.4, { color: TINT[i], additive: true, opacity: 0, order: 20 }); glow.position.set(x, y, 0.05); G.root.add(glow);
        const rg = K.sprite(K.ringTex, s.r * 2.3, { color: TINT[i], opacity: 0, order: 21 }); rg.position.set(x, y, 0.055); G.root.add(rg);
        return { glow, rg };
      });
      G.ui.buttons(ST.map((s, i) => ({ label: s.label, kind: i === 1 ? 'red' : 'black', aria: `${s.name}, ${s.where}`, press: () => press(i) })));
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); newRound(); };
      K.intro(G, { title: 'Crew call', how: 'Camera is on the left, lights up top, sound on the right. Watch and listen to the crew, then play it back in the same order.',
        say: 'Crew call. Your crew is built into Sophia’s painting. The camera is on the left. The lights are up top. The sound is on the right. Each one has their own sound. Watch and listen to the crew, then play it back in the same order.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni;
      U.uA.value += ((G.ready ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2.5); U.uT.value = G.t;
      // timers
      if (G.showT > 0) { G.showT -= dt; if (G.showT <= 0) show(); }
      if (G.phase === 'show') {
        G.stepT -= dt;
        if (G.stepT <= 0) {
          if (G.showI < G.seq.length) { flash(G.seq[G.showI], gapOf() * 0.62); G.showI++; G.stepT = gapOf(); }
          else { G.phase = 'input'; G.pos = 0; G.inputT = 0; G.band.quiet(false); G.band.yourTurn(); G.say('Your turn.'); hud(); }
        }
      }
      if (G.phase === 'input') { G.inputT += dt; if (G.inputT > 9) { G.inputT = 0; G.phase = 'wait'; G.say('Listen again.'); G.showT = 1.2; hud(); } }   // stuck? the crew plays it again
      if (G.rollT > 0) { G.rollT -= dt; if (G.rollT <= 0) cut(); }
      if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) newRound(); }
      if (G.bot && G.phase === 'input' && G.inputT > 0.45) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.4; press(G.seq[G.pos]); } }
      // the painting moves: the reel always turns, kicks with every note, and spins like mad when the shot rolls
      const rolling = G.rollT > 0 || G.endT >= 0;
      G.reelKick = Math.max(0, G.reelKick - dt * 2.5);
      G.reelV += ((rolling ? 11 : 0.5 + G.reelKick * 2.5) - G.reelV) * Math.min(1, dt * (rolling ? 2.5 : 5)); G.reel += G.reelV * dt; U.uReel.value = G.reel;
      G.lens += ((rolling ? 0.6 + 0.4 * Math.sin(G.t * 6) : 0.12 + 0.1 * Math.sin(G.t * 1.3)) - G.lens) * Math.min(1, dt * 4); U.uLens.value = G.lens;
      for (let i = 0; i < 6; i++) { G.col[i] += (G.target[i] - G.col[i]) * Math.min(1, dt * 1.2); U.uC.value[i] = G.col[i]; }
      // the stations: each one flashes, swells and shakes while its note plays
      ST.forEach((s, i) => {
        const m = G.marks[i];
        if (G.hold[i] > 0) { G.hold[i] -= dt; G.pulse[i] = 1; } else G.pulse[i] = Math.max(0, G.pulse[i] - dt * 4);
        m.glow.material.opacity = G.pulse[i] * 0.9; m.glow.scale.setScalar(s.r * (3.0 + G.pulse[i] * 0.8));
        const idle = G.phase === 'input' ? 0.55 + 0.15 * Math.sin(G.t * 3 + i) : G.playing ? 0.22 : 0;
        m.rg.material.opacity = Math.max(idle, G.pulse[i]); m.rg.scale.setScalar(s.r * (2.1 + G.pulse[i] * 0.45));
      });
      U.uS.value.set(G.pulse[0], G.pulse[1], G.pulse[2]);
      // the wrap: full colour, and the projector's beam across her face
      if (G.endT >= 0) {
        G.endT += dt; G.all = Math.min(1, G.endT / 2.5); G.beam = Math.min(1, G.endT / 1.5); U.uAll.value = G.all; U.uBeam.value = G.beam;
        if (G.endT > 3.4 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('strengths-limitations:crew', G.misses, 'lower');
          K.finale(G, { won: true, kicker: 'That’s a wrap', title: 'One crew, one film', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Rounds', v: `${ROUNDS}/${ROUNDS}` }, { k: 'Oops', v: String(G.misses) }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
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
    get debug() { return G && { engine: 'crew-simon', playing: G.playing, over: G.over, phase: G.phase, round: G.round, len: G.seq.length, pos: G.pos, misses: G.misses, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.band) G.band.stop(); K.cleanup(G); G = null; },
  };
}
