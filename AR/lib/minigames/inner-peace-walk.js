// INNER PEACE IN OUTER CHAOS (Morten Bonde): BREATHE THROUGH THE STORM, a calm-breathing game with three buttons.
// "Peace is something I carry into the chaos." The storm swirls around the calm face. Take slow breaths with the three
// buttons, three seconds each: hold BREATHE IN while the ring around the face grows, hold HOLD while it glows, hold
// BREATHE OUT while it shrinks. The button whose turn it is lights up red. The ring only moves while you hold the right
// button (let go too soon and it slips back); the wrong button makes the storm flare. Each calm breath carries you a
// step closer: the painting glides in toward the face, the storm settles, and the star on the forehead grows brighter.
// Gusts of storm still come and go: keep breathing and you stay calm. Six breaths and the storm parts: inner peace,
// and Morten reads his own words. By ear: each step is spoken for the first breaths, then each phase has its own sound
// (a rising breath in, a soft hum while you hold, a falling breath out), a soft tick every second, the storm's roar
// fades as you get calmer, and the music gains a note with every breath.
// (Same file and export as the first version, "Calm walk", which had you walk toward the painting: &classic=1.)
import * as THREE from 'three';
import * as K from './kit.js';
import { dockBanner, note, noteOn } from './morten-banner.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ARTIST = new URL('../../../3D/gallery/audio/art_60.mp3', import.meta.url).href;   // Morten, in his own words
const FACE = { u: 0.53, v: 0.47, ru: 0.105, rv: 0.165 };
const STAR = { u: 0.528, v: 0.337 };                    // the light on the forehead
const BREATHS = 6, SECS = 3.0, ZOOM = 1.85;             // calm breaths to peace; seconds per phase; how close you get
const PHASES = [
  { id: 'in', word: 'Breathe in', say: 'Breathe in.', wrong: 'Breathe in first.', sub: 'Hold Breathe in while the ring grows' },
  { id: 'hold', word: 'Hold', say: 'Hold.', wrong: 'Now hold.', sub: 'Hold Hold while the ring glows' },
  { id: 'out', word: 'Breathe out', say: 'And out.', wrong: 'Now breathe out.', sub: 'Hold Breathe out while the ring shrinks' },
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uC, uBreath, uCalm, uA, uH, uZoom, uRip, uStar; uniform vec2 uFace, uFaceR, uStarP;
vec3 tex(vec2 q){ q = clamp(q, 0.0, 1.0); return texture2D(map, vec2(q.x, 1.0 - q.y)).rgb; }
float warmth(vec3 c){ return clamp((c.r - max(c.b, c.g * 0.6)) * 1.8 - 0.15, 0.0, 1.0) * smoothstep(0.3, 0.7, c.r); }
void main(){
  vec2 s = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = uFace + (s - uFace) / uZoom;                                                   // each breath carries you closer to the face
  float fd = length((p - uFace) / uFaceR), face = 1.0 - smoothstep(0.85, 1.3, fd);          // the face stays calm
  float C = uC * (1.0 - uCalm), drift = 0.15 + C * 1.3;
  // the storm swirls around the head, and waves
  vec2 d = (p - uFace) * vec2(1.0, uH); float r = length(d);
  float a = drift * (0.25 + 0.6 * sin(uT * 0.6 + r * 5.0)) * 0.5 / (r + 0.35) * smoothstep(0.08, 0.3, r);
  vec2 rot = vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a));
  vec2 q = uFace + rot / vec2(1.0, uH);
  q += vec2(sin(p.y * 17.0 + uT * (1.0 + 3.5 * C)) + 0.5 * sin(p.y * 41.0 - uT * 2.0), cos(p.x * 15.0 - uT * (0.9 + 3.0 * C)) + 0.5 * cos(p.x * 37.0 + uT * 1.7)) * 0.013 * drift;
  q = mix(q, p, face);
  vec3 c = tex(q), raw = tex(p);
  // the reds and oranges glow and pulse: bigger and faster with the chaos
  float f = 0.5 + C * 4.5, pulse = 0.5 + 0.5 * sin(uT * f * 6.2832), rad = 0.008 + C * 0.035;
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 8; i++) { float an = float(i) * 0.785398; vec3 sm = tex(q + vec2(cos(an), sin(an) * uH) * rad); bloom += sm * warmth(sm); }
  bloom /= 8.0;
  float amp = 0.2 + C * 1.5;
  vec3 col = c + (bloom * 1.2 + vec3(0.25, 0.08, 0.0) * warmth(c)) * pulse * amp * (1.0 - face);
  col *= 1.0 - C * 0.22 * (1.0 - face) * smoothstep(0.2, 0.7, r);                           // a wild storm darkens at the edges
  // the face: calm, breathing softly
  col = mix(col, raw * (1.0 + 0.07 * uBreath) + vec3(0.03, 0.04, 0.05) * uBreath, face);
  // a wave of calm rolls out from the face after each breath
  float sr = length((s - uFace) * vec2(1.0, uH)), wave = uRip * 0.9;
  col += vec3(0.55, 0.8, 0.9) * smoothstep(0.07, 0.0, abs(sr - wave)) * (1.0 - smoothstep(0.3, 0.9, wave)) * 0.35 * step(0.001, uRip);
  // the light on the forehead glows brighter with each breath
  vec2 sp = uFace + (uStarP - uFace) * uZoom; float sd = length((s - sp) * vec2(1.0, uH));
  col += vec3(1.0, 0.92, 0.75) * exp(-sd * sd / (0.0006 + 0.004 * uStar)) * uStar * 0.9;
  // peace at last: a soft, even light
  col = mix(col, raw * 1.06 + vec3(0.03, 0.025, 0.05), uCalm * 0.6);
  gl_FragColor = vec4(col, uA);
}`;

function sounds(ac) {
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  const out = ac.createGain(); out.connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const tone = (t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, slide = 0 } = {}) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.03); };
  // calm: a soft drone that gains a note with every breath; chaos: a roar and a dissonant buzz that rise with it
  const dg = ac.createGain(); dg.gain.value = 0; dg.connect(out);
  const notes = [130.8, 196, 261.6, 329.6, 392, 523.3, 659.3], voices = notes.map((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; g.gain.value = 0; o.connect(g).connect(dg); o.start(); return { o, g }; });
  const roar = ac.createBufferSource(), rf = ac.createBiquadFilter(), rg = ac.createGain(); roar.buffer = nb; roar.loop = true; rf.type = 'lowpass'; rf.frequency.value = 300; rg.gain.value = 0; roar.connect(rf).connect(rg).connect(out); roar.start();
  const buzz = [], bg = ac.createGain(); bg.gain.value = 0; const bf = ac.createBiquadFilter(); bf.type = 'lowpass'; bf.frequency.value = 900; bf.connect(bg).connect(out);
  for (const f of [92, 97.5, 131]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(bf); o.start(); buzz.push(o); }
  // the breath: soft filtered air that rises as you breathe in and falls as you breathe out; a hum while you hold
  const air = ac.createBufferSource(), af = ac.createBiquadFilter(), ag = ac.createGain(); air.buffer = nb; air.loop = true; af.type = 'bandpass'; af.Q.value = 1.2; af.frequency.value = 500; ag.gain.value = 0; air.connect(af).connect(ag).connect(out); air.start();
  const hum = ac.createOscillator(), hg = ac.createGain(); hum.frequency.value = 392; hg.gain.value = 0; hum.connect(hg).connect(out); hum.start();
  return {
    set(chaos, calm, steps) { const t = ac.currentTime; dg.gain.setTargetAtTime(0.5 + calm * 0.5, t, 0.4); rg.gain.setTargetAtTime(0.02 + chaos * 0.32 * (1 - calm), t, 0.3); rf.frequency.setTargetAtTime(250 + chaos * 1700, t, 0.3); bg.gain.setTargetAtTime(chaos * chaos * 0.11 * (1 - calm), t, 0.3);
      voices.forEach((v, i) => v.g.gain.setTargetAtTime(i <= steps ? [0.05, 0.035, 0.03, 0.022, 0.018, 0.014, 0.01][i] : 0, t, 0.8)); },
    // the breath sound for the phase being held: k = progress 0..1
    breath(id, held, k) { const t = ac.currentTime;
      ag.gain.setTargetAtTime(held && id !== 'hold' ? 0.09 : 0, t, held ? 0.15 : 0.1);
      af.frequency.setTargetAtTime(id === 'in' ? 380 + k * 1100 : 1480 - k * 1100, t, 0.1);
      hg.gain.setTargetAtTime(held && id === 'hold' ? 0.035 : 0, t, 0.2); },
    cue(i) { const t = ac.currentTime + 0.01; if (i === 0) tone(t, 392, 0.35, { vol: 0.07, slide: 523.3 }); else if (i === 1) tone(t, 523.3, 0.4, { vol: 0.06 }); else tone(t, 523.3, 0.4, { vol: 0.07, slide: 392 }); },
    tick() { tone(ac.currentTime + 0.01, 880, 0.08, { vol: 0.025 }); },
    good(n) { const t = ac.currentTime + 0.01, f = [523.3, 587.3, 659.3, 784, 880, 1046.5][n % 6]; tone(t, f, 1.8, { vol: 0.12 }); tone(t + 0.1, f * 1.5, 1.4, { vol: 0.05 }); tone(t, f * 2.01, 0.9, { vol: 0.03 }); },
    bad() { tone(ac.currentTime + 0.01, 150, 0.25, { type: 'square', vol: 0.05, slide: 105 }); },
    gust() { const t = ac.currentTime; rg.gain.cancelScheduledValues(t); rg.gain.setTargetAtTime(0.45, t, 0.2); },
    win() { const t = ac.currentTime + 0.05; [261.6, 329.6, 392, 523.3, 659.3, 784].forEach((f, i) => tone(t + i * 0.18, f, 3.5, { vol: 0.08, att: 0.2 })); },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { master.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { [...voices.map(v => v.o), ...buzz, hum].forEach(o => o.stop()); roar.stop(); air.stop(); master.disconnect(); } catch (e) {} }, 700); },
  };
}

export function calmWalkGame() {
  let G = null;

  function hud(force) {
    if (!force && G.t - (G.hudT || -9) < 0.2) return; G.hudT = G.t;
    const n = noteOn(G);
    if (n && (G.phase === 'play' || G.phase === 'done')) { G.ui.panel(`Breath ${Math.min(G.steps + 1, BREATHS)} of ${BREATHS}`, n.title, { segs: [G.steps, BREATHS], sub: n.sub, warn: n.kind === 'red' }); return; }
    if (G.phase !== 'play') return;
    const P = PHASES[G.ph], left = Math.max(1, Math.ceil(SECS * (1 - G.k) - 0.05));
    G.ui.panel(`Breath ${Math.min(G.steps + 1, BREATHS)} of ${BREATHS}`, P.word + (G.held === G.ph ? `<small> ${left}</small>` : ''),
      { segs: [G.steps, BREATHS], sub: G.held === G.ph ? 'Keep holding…' : P.sub, warn: G.flare > 0.3 });
  }
  function light() { G.btns.forEach((b, i) => { b.className = i === G.ph ? 'red' : 'black'; }); }
  function setPhase(i, speak) {
    G.ph = i; G.k = 0; G.ticks = 0; light(); G.snd.cue(i);
    if (speak) G.say(PHASES[i].say);
    hud(true);
  }
  function press(i) {
    if (!G || G.phase !== 'play') { if (G) G.heldBtn = i; return; }
    G.heldBtn = i;
    if (i === G.ph) { G.held = i; G.idle = 0; hud(true); return; }
    // the wrong button: the storm flares
    G.held = -1; G.chaos = Math.min(1, G.chaos + 0.08); G.flare = 1; G.snd.bad(); G.buzz(40);
    note(G, PHASES[G.ph].word + ' first', 'Hold the red button', 1.4, 'red'); hud(true);
    if (G.t - (G.wrongSaid || -9) > 4) { G.wrongSaid = G.t; G.say(PHASES[G.ph].wrong); }
  }
  function release(i) {
    if (!G) return;
    if (G.heldBtn === i) G.heldBtn = -1;
    if (G.held === i) {
      G.held = -1;
      if (G.phase === 'play' && G.k > 0.05 && G.k < 0.97) { note(G, 'Slower', 'Keep holding the red button', 1.4, 'red'); if (G.t - (G.slowSaid || -9) > 6) { G.slowSaid = G.t; G.say('Slower. Keep holding.'); } }
      hud(true);
    }
  }
  function breathDone() {
    G.steps++; G.rip = 0.001; G.chaos = Math.max(0, G.chaos - 0.14); G.snd.good(G.steps); G.buzz([20, 40, 20]);
    const [x, y] = G.S.P(FACE.u, FACE.v); G.fx.add(x, y, '#bff6ff', 24, 0.3);
    if (G.steps >= BREATHS) { win(); return; }
    const line = G.steps === 1 ? 'Closer.' : G.steps === 3 ? 'Halfway there.' : G.steps === BREATHS - 1 ? 'One more breath.' : '';
    if (line) note(G, line.replace('.', ''), `${BREATHS - G.steps} more calm breaths`, 1.8, 'blue');
    G.pending = { line, at: G.t + 0.2 };   // speak the breath's line, then the next "Breathe in"
    setPhase(0, false);
  }
  function win() {
    G.phase = 'done'; G.endT = 0; G.snd.win(); G.btns.forEach(b => { b.className = 'black'; b.disabled = true; });
    note(G, 'Inner peace', 'The storm can swirl. You stay calm.', 4.5, 'blue'); hud(true);
    G.say('You found inner peace. The storm can swirl all around, and you stay calm.');
  }

  return {
    title: 'Breathe through the storm',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', ph: 0, k: 0, held: -1, heldBtn: -1, steps: 0, chaos: 0.75, flare: 0, calm: 0, zoom: 1, rip: 0, star: 0, idle: 0, ticks: 0,
        gustT: 7, gust: 0, gusts: 0, endT: 0, t0: 0, artist: null, pending: null, wrongs: 0 });
      G.uni = { map: { value: null }, uT: { value: 0 }, uC: { value: 0.75 }, uBreath: { value: 0 }, uCalm: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uZoom: { value: 1 }, uRip: { value: 0 }, uStar: { value: 0 },
        uFace: { value: new THREE.Vector2(FACE.u, FACE.v) }, uFaceR: { value: new THREE.Vector2(FACE.ru, FACE.rv) }, uStarP: { value: new THREE.Vector2(STAR.u, STAR.v) } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // the breathing ring around the face, and its soft glow
      G.glow = K.sprite(K.glowTex, 0.5, { additive: true, color: '#9fe8ff', opacity: 0, order: 19 });
      G.ring = K.sprite(K.ringTex, 0.3, { color: '#dff8ff', opacity: 0, order: 20 });
      { const [x, y] = G.S.P(FACE.u, FACE.v); G.ring.position.set(x, y, 0.05); G.glow.position.set(x, y, 0.045); } G.root.add(G.glow, G.ring);
      G.snd = K.audio() ? sounds(K.audio()) : new Proxy({}, { get: () => () => {} });
      G.btns = G.ui.buttons(PHASES.map((P, i) => ({ label: P.word, kind: 'black', aria: `${P.word}: press and hold`, press: () => press(i), release: () => release(i) })));
      G.ui.panel('Breathe through the storm', 'Three buttons', { sub: 'Breathe in, hold, breathe out' });
      // the artist's story video: stop Morten's clip so two voices don't overlap
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.onGo = () => { G.t0 = G.t; G.snd.volume(1); G.phase = 'play'; setPhase(0, true); if (G.heldBtn === 0) G.held = 0; };
      G.snd.volume(0.7);
      K.intro(G, { title: 'Breathe through the storm', how: 'Press and HOLD each button for three seconds: Breathe in, then Hold, then Breathe out. Each calm breath brings you closer to peace.',
        say: 'Breathe through the storm. Hold breathe in, then hold, then breathe out, three seconds each. Each calm breath brings you closer to peace.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      dockBanner(G); if (G.note && !noteOn(G) && !G.over) hud(true);   // the banner sits above the painting; a message ends
      G.uni.uA.value += ((G.ready ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);   // stays on through the finale
      G.uni.uT.value = G.t;
      const P = PHASES[G.ph];
      if (G.phase === 'play' && G.playing) {
        // the robot player: holds the right button for a little over three seconds, then lets go
        if (G.bot) { if (G.held !== G.ph) { G.botWait = (G.botWait || 0) + dt; if (G.botWait > 0.5) { G.botWait = 0; press(G.ph); } } else if (G.k >= 1) release(G.ph); }
        // the phase moves only while its button is held; let go too soon and it slips back
        if (G.held === G.ph) {
          G.k = Math.min(1, G.k + dt / SECS);
          const sec = Math.floor(G.k * SECS + 1e-3); if (sec > G.ticks && sec < SECS) { G.ticks = sec; G.snd.tick(); }
          if (G.k >= 1) {
            const next = G.ph + 1; G.held = -1;
            if (next >= PHASES.length) breathDone(); else setPhase(next, G.steps < 2);
            // still holding the next button already? it counts straight away
            if (G.phase === 'play' && G.heldBtn === G.ph) G.held = G.ph;
          }
        } else { G.k = Math.max(0, G.k - dt * 0.5); G.idle += dt; }
        // the breath's line, then "Breathe in" again (spoken for the first breaths)
        if (G.pending && G.t >= G.pending.at) { const { line } = G.pending; G.pending = null; const cue = G.steps < 2 ? 'Breathe in.' : ''; if (line || cue) G.say([line, cue].filter(Boolean).join(' ')); }
        // the storm: it builds while you're not breathing, and it gusts now and then; your breaths settle it
        const base = 0.7 - G.steps * 0.1;
        if (G.idle > 2.5) G.chaos = Math.min(1, G.chaos + dt * 0.04);
        G.chaos += (Math.max(base * 0.6, Math.min(G.chaos, 1)) - G.chaos) * dt * 0.1;
        G.gustT -= dt;
        if (G.gustT <= 0) {
          G.gustT = 8 + Math.random() * 5; G.gust = 1; G.gusts++; G.snd.gust(); G.buzz([30, 30, 30]);
          note(G, 'A gust', 'Let the storm swirl. Keep breathing', 1.6, 'black'); hud(true);
          if (G.gusts === 1) G.say('Let the storm swirl. Stay calm.');
        }
        hud();
      }
      G.gust = Math.max(0, G.gust - dt * 0.35); G.flare = Math.max(0, G.flare - dt * 1.5);
      // how open the ring is: grows on breathe in, full while you hold, shrinks on breathe out
      const open = G.phase === 'play' ? (G.ph === 0 ? G.k : G.ph === 1 ? 1 : 1 - G.k) : G.phase === 'done' ? 0.5 + 0.5 * Math.sin(G.t * 1.2) : 0;
      const ease = open * open * (3 - 2 * open);
      G.uni.uBreath.value = ease;
      // closer with every breath
      G.zoom += ((1 + (ZOOM - 1) * Math.min(1, G.steps / BREATHS)) - G.zoom) * Math.min(1, dt * 1.2);
      G.uni.uZoom.value = G.zoom;
      const z = G.zoom, ringOn = G.phase === 'play' ? 1 : 0;
      const holding = G.held === G.ph && G.phase === 'play';
      G.ring.scale.setScalar((0.2 + 0.2 * ease) * z);
      G.ring.material.opacity = ringOn * (0.45 + 0.4 * ease + (G.ph === 1 && holding ? 0.15 * Math.sin(G.t * 6) : 0));
      G.ring.material.color.set(holding ? '#ffffff' : '#bff6ff');
      G.glow.scale.setScalar((0.32 + 0.3 * ease) * z); G.glow.material.opacity = ringOn * (holding ? 0.35 : 0.12) * (0.4 + ease);
      G.rip = G.rip > 0 ? G.rip + dt : 0; if (G.rip > 1.4) G.rip = 0; G.uni.uRip.value = G.rip;
      G.star += ((G.phase === 'done' ? 1.6 : G.steps / BREATHS) - G.star) * Math.min(1, dt * 1.5);
      G.uni.uStar.value = G.star * (0.85 + 0.15 * Math.sin(G.t * 2));
      if (G.phase === 'done') { G.endT += dt; G.calm = Math.min(1, G.endT / 3); G.chaos = Math.max(0, G.chaos - dt * 0.4); }
      G.uni.uC.value += (Math.min(1, G.chaos + G.gust * 0.35 + G.flare * 0.2) - G.uni.uC.value) * Math.min(1, dt * 3); G.uni.uCalm.value = G.calm;
      G.snd.set && G.snd.set(Math.min(1, G.chaos + G.gust * 0.3), G.calm, G.steps);
      G.snd.breath && G.snd.breath(P.id, holding, G.k);
      if (G.phase === 'done' && G.endT > 4.5 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('inner-peace:breathe', t, 'lower');
        K.finale(G, { won: true, title: 'Peace within', kicker: 'Breathe through the storm', line: G.work && G.work.quote, best: r.isBest, say: 'Peace within.',
          cells: [{ k: 'Calm breaths', v: `${G.steps}/${BREATHS}` }, { k: 'Gusts', v: G.gusts }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        G.overT = 0;
      }
      // the finale: after "Peace within.", Morten reads his own words over the soft drone
      if (G.over && !G.artist) { G.overT += dt; if (G.overT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.snd.volume(0.3); } }
    },
    pointer() {},
    pause() { if (G) { G.paused = true; G.snd.volume(0); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.snd.volume(G.artist ? 0.3 : G.phase === 'intro' ? 0.7 : 1); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'calm-breath', playing: G.playing, over: G.over, phase: G.phase, step: PHASES[G.ph].id, k: +G.k.toFixed(2), breaths: G.steps, chaos: +G.chaos.toFixed(2), zoom: +G.zoom.toFixed(2), gusts: G.gusts, t: +G.t.toFixed(1), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null }; },
    stop() { if (G) { G.snd && G.snd.stop && G.snd.stop(); if (G.artist) { G.artist.pause(); G.artist = null; } } K.cleanup(G); G = null; },
  };
}
