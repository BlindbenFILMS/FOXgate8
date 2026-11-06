// THE GRAY ZONE (Morten Bonde): METAMORPHOSIS, a movement-and-calm game.
// The glass cube holds the gray zone: "no longer fully sighted, not yet identifying as blind." Something is growing in
// its fog. Hold your phone very still and the fog settles: the glass turns clear and the creature inside glows out of
// it; move, and the fog churns and swirls back (the whole gray room stirs too). Five times the fog clears, and each
// time the creature inside changes and the in-between gets a name: an egg (not fully sighted), a caterpillar (not yet
// blind), a chrysalis (in between), wings unfolding (named), and a butterfly (free). Each stage asks for a little more
// stillness. At the end the butterfly flies out of the glass, the gray room fills with colour, and Morten reads his
// own words. No motion sensor? Hold a finger on the screen and keep it still.
// By ear: a rising shimmer as the fog clears (with a chime at each quarter), the wind rises when you move, a song that
// gains a part at every stage, and each stage is spoken. Creatures: gray-things.js.
import * as THREE from 'three';
import * as K from './kit.js';
import { creatureCanvas } from './gray-things.js';
import { dockBanner, note, noteOn } from './morten-banner.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_59.mp3', import.meta.url).href;   // Morten, in his own words
const CUBE = [[0.225, 0.322], [0.58, 0.312], [0.777, 0.33], [0.773, 0.77], [0.578, 0.83], [0.228, 0.786]];
const CENTER = { u: 0.5, v: 0.56 };
const STAGES = [
  { word: 'Not fully sighted', what: 'An egg, resting on a leaf.', need: 3.0 },
  { word: 'Not yet blind', what: 'A caterpillar, hungry to grow.', need: 3.8 },
  { word: 'In between', what: 'A chrysalis, quiet and hidden.', need: 4.6 },
  { word: 'Named', what: 'Wings, unfolding.', need: 5.4 },
  { word: 'Free', what: 'A butterfly.', need: 6.0 },
];
const AGAIN = ['The fog rolls back in. Be still again.', 'Something is changing. Be still.', 'Stiller now. Almost there.', 'One last time. Be still.'];
const STILL = 0.16;   // how much movement still counts as "still"

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const NOISE = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }`;
// the fog, over everything
const FRAG = `
varying vec2 vUv;
uniform sampler2D uMask; uniform float uT, uClear, uChurn, uFree, uH, uA;
${NOISE}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float inside = texture2D(uMask, vUv).r;
  vec2 c = p - vec2(0.5, 0.56); float r = length(c), a = atan(c.y, c.x) + uT * (0.08 + uChurn * 0.9) + (0.6 + uChurn * 2.0) / (r + 0.4);
  vec2 q = vec2(cos(a), sin(a)) * r * 3.0;
  float f = fbm(q * 2.0 + vec2(uT * 0.04, -uT * 0.03)) * 0.75 + fbm(p * 7.0 + uT * (0.05 + uChurn * 0.4)) * 0.35;
  float inFog = clamp(0.3 + f * 0.85, 0.0, 1.0) * (1.0 - uClear * 0.97) + uChurn * 0.35 * f;
  float outFog = uChurn * 0.32 * smoothstep(0.35, 0.8, fbm(p * 3.0 + vec2(uT * 0.3, uT * 0.1)));
  float dens = clamp(mix(outFog, inFog, inside), 0.0, 1.0) * (1.0 - uFree);
  vec3 col = mix(vec3(0.72, 0.75, 0.78), vec3(0.95, 0.96, 0.97), f);
  // free: the gray room fills with colour, in waves
  float wave = sin(p.y * 4.0 + uT * 0.5) * 0.2 + sin(p.x * 3.0 - uT * 0.4) * 0.1;
  vec3 bloom = mix(vec3(1.0, 0.55, 0.32), vec3(0.35, 0.72, 0.95), smoothstep(0.0, 1.0, p.x + wave));
  bloom = mix(bloom, vec3(1.0, 0.85, 0.45), smoothstep(0.6, 0.0, length((p - vec2(0.5, 0.25)) * vec2(1.0, uH))) * 0.6);
  bloom = mix(bloom, vec3(0.55, 0.85, 0.5), smoothstep(0.7, 1.0, p.y) * 0.5);
  float ba = uFree * 0.5 * (1.0 - inside * 0.7);
  vec3 outc = (col * dens + bloom * ba * (1.0 - dens)) / max(dens + ba * (1.0 - dens), 0.001);
  gl_FragColor = vec4(outc, (dens + ba * (1.0 - dens)) * uA);
}`;
// the clear glass: as the fog settles, the painted fog inside the cube gives way to dark, clean glass with a warm light
const GLASS = `
varying vec2 vUv;
uniform sampler2D uMask; uniform float uT, uClear, uA, uWarm;
${NOISE}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float inside = texture2D(uMask, vUv).r;
  vec3 col = mix(vec3(0.30, 0.35, 0.41), vec3(0.13, 0.15, 0.19), smoothstep(0.32, 0.82, p.y));
  // soft reflections running across the glass
  float s = smoothstep(0.03, 0.0, abs(fract((p.x + p.y * 0.55) * 2.2 - uT * 0.02) - 0.5) - 0.17);
  col += vec3(0.85, 0.92, 1.0) * s * 0.08 * (0.6 + fbm(p * 9.0) * 0.8);
  // the creature's own warm light
  float r = length((p - vec2(0.5, 0.56)) * vec2(1.0, 1.15));
  col += vec3(1.0, 0.82, 0.55) * smoothstep(0.32, 0.0, r) * (0.18 + 0.22 * uWarm);
  gl_FragColor = vec4(col, inside * smoothstep(0.0, 1.0, uClear) * 0.93 * uA);
}`;

function maskTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.filter = 'blur(3px)'; g.fillStyle = '#fff';
  g.beginPath(); CUBE.forEach(([u, v], i) => g[i ? 'lineTo' : 'moveTo'](u * 256, v * 256)); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

// the band: a soft chord behind the fog, the wind, a shimmer that rises as the fog clears, and a song that grows
function sounds(ac) {
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  const out = ac.createGain(); out.gain.value = 1; out.connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pad = ac.createGain(), lp = ac.createBiquadFilter(); pad.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 400; lp.connect(pad).connect(out);
  const os = []; for (const [f, v] of [[130.8, 0.05], [196, 0.04], [261.6, 0.03], [329.6, 0.025], [392, 0.02], [493.9, 0.012]]) for (const det of [-5, 5]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; g.gain.value = v; o.connect(g).connect(lp); o.start(); os.push(o); }
  const wind = ac.createBufferSource(), wf = ac.createBiquadFilter(), wg = ac.createGain(); wind.buffer = nb; wind.loop = true; wf.type = 'bandpass'; wf.frequency.value = 500; wf.Q.value = 0.7; wg.gain.value = 0; wind.connect(wf).connect(wg).connect(out); wind.start();
  // the shimmer: two glassy sines that rise in pitch and grow as the fog clears
  const sh = ac.createGain(); sh.gain.value = 0; sh.connect(out);
  const shO = [0, 7].map(det => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 392; o.detune.value = det; o.connect(sh); o.start(); return o; });
  const trem = ac.createOscillator(), tg = ac.createGain(); trem.frequency.value = 5.5; tg.gain.value = 0.012; trem.connect(tg).connect(sh.gain); trem.start();
  const tone = (t, f, dur, vol, type = 'sine', pan = 0) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o.connect(g); if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; n = n.connect(p); } n.connect(out); o.start(t); o.stop(t + dur + 0.05); };
  const thump = (t, vol) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g).connect(out); o.start(t); o.stop(t + 0.35); };
  // the song: C major pentatonic, slow and gentle; one more part joins at every stage
  const ARP = [261.6, 329.6, 392, 523.3, 440, 392, 329.6, 293.7];
  const MEL = [784, 0, 659.3, 0, 587.3, 659.3, 0, 523.3, 0, 587.3, 0, 392, 523.3, 0, 0, 0];
  const BASS = [65.4, 0, 0, 0, 87.3, 0, 0, 0, 98, 0, 0, 0, 65.4, 0, 98, 0];
  let step = 0, next = 0;
  return {
    set(clear, churn, still) { const t = ac.currentTime; lp.frequency.setTargetAtTime(350 + clear * 2600, t, 0.3); pad.gain.setTargetAtTime(0.35 + clear * 0.8, t, 0.3); wg.gain.setTargetAtTime(0.015 + churn * 0.22, t, 0.15); wf.frequency.setTargetAtTime(380 + churn * 1200, t, 0.2);
      sh.gain.setTargetAtTime(still ? 0.006 + clear * 0.03 : 0, t, still ? 0.25 : 0.08); shO.forEach(o => o.frequency.setTargetAtTime(392 * Math.pow(2, clear * 1.25), t, 0.2)); },
    chime(k) { const t = ac.currentTime + 0.02; [523.3, 659.3, 784][k] && tone(t, [523.3, 659.3, 784][k], 0.9, 0.05, 'triangle'); tone(t + 0.06, [1046.5, 1318.5, 1568][k] || 1046.5, 0.6, 0.025); },
    // called every frame: schedules the song a little ahead. parts = how many parts play (grows with the stages)
    song(parts) { if (parts <= 0) { next = 0; return; } const now = ac.currentTime; if (!next || next < now) next = now + 0.05;
      while (next < now + 0.25) { const t = next, s = step % 16;
        if (BASS[s]) tone(t, BASS[s], 1.6, 0.07, 'triangle');                              // 1: a low root (the egg)
        if (parts >= 2 && s % 2 === 0) tone(t, ARP[(s / 2) % 8], 0.9, 0.028, 'triangle', Math.sin(s) * 0.4);   // 2: a slow arpeggio
        if (parts >= 3 && (s === 0 || s === 8)) thump(t, 0.12);                             // 3: a heartbeat
        if (parts >= 3 && s === 1) thump(t, 0.07);
        if (parts >= 4 && (s === 4 || s === 12)) tone(t, ARP[(s + 3) % 8] * 2, 1.8, 0.022, 'sine', s === 4 ? -0.5 : 0.5);   // 4: bells, left and right
        if (parts >= 5 && MEL[s]) tone(t, MEL[s], 0.7, 0.035, 'triangle');                // 5: the melody (the butterfly)
        step++; next += 0.32; } },
    stage(i) { const t = ac.currentTime + 0.05; [523.3, 659.3, 784, 987.8, 1174.7].slice(0, 2 + i).forEach((f, k) => tone(t + k * 0.12, f, 1.6, 0.07, 'triangle')); },
    flutter() { const t = ac.currentTime + 0.02; for (let k = 0; k < 14; k++) tone(t + k * 0.08, 1500 + Math.random() * 900, 0.06, 0.03, 'sine', Math.random() * 1.6 - 0.8); },
    free() { const t = ac.currentTime + 0.05; [261.6, 329.6, 392, 523.3, 659.3, 784, 1046.5].forEach((f, k) => tone(t + k * 0.15, f, 3.5, 0.06, 'triangle')); },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { master.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { os.forEach(o => o.stop()); shO.forEach(o => o.stop()); trem.stop(); wind.stop(); master.disconnect(); } catch (e) {} }, 700); },
  };
}

export function metamorphosisGame() {
  let G = null;

  function sensors() {
    const M = G.mot = { ok: false, e: 0, n: 0 };
    const on = (ev) => {
      const a = ev.acceleration, ag = ev.accelerationIncludingGravity, r = ev.rotationRate; M.n++;
      let lin = 0; if (a && a.x != null) lin = Math.hypot(a.x, a.y, a.z || 0); else if (ag && ag.x != null) { M.g = M.g || [ag.x, ag.y, ag.z || 0]; for (const [k, v] of [[0, ag.x], [1, ag.y], [2, ag.z || 0]]) M.g[k] += (v - M.g[k]) * 0.1; lin = Math.hypot(ag.x - M.g[0], ag.y - M.g[1], (ag.z || 0) - M.g[2]); }
      const rot = r ? Math.hypot(r.alpha || 0, r.beta || 0, r.gamma || 0) : 0;
      if ((a && a.x != null) || (ag && ag.x != null)) M.ok = true;
      const raw = Math.min(1.2, Math.max(0, (lin - 0.12) / 2.5 + rot / 160));
      M.e += (raw - M.e) * (raw > M.e ? 0.3 : 0.06);
    };
    addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
  }
  function hud() {
    const S = STAGES[G.stage], n = noteOn(G);
    if (n) { G.ui.panel(S ? `Stage ${G.stage + 1} of ${STAGES.length}` : 'Metamorphosis', n.title, { segs: [Math.min(G.stage + (G.hold > 0 ? 1 : 0), STAGES.length), STAGES.length], sub: n.sub, warn: n.kind === 'red' }); return; }
    if (!S) { G.ui.panel('Metamorphosis', 'Free', { segs: [STAGES.length, STAGES.length], sub: 'Naming the in-between set him free' }); return; }
    const pct = Math.round(G.clear * 100), moving = G.churn > 0.35;
    G.ui.panel(`Stage ${G.stage + 1} of ${STAGES.length}`, moving ? 'The fog swirls' : `${pct}%<small> clear</small>`,
      { segs: [G.stage, STAGES.length], sub: G.noSensor ? 'Hold a finger on the screen and keep it still' : moving ? 'Hold your phone still' : 'Stay still. The fog is settling', warn: moving });
  }
  function showWord(text) {
    // the kit sizes the word before it's capitalised, so hand it the capitals (long words were cut off)
    G.wordM.material.map = K.wordTex(text.toUpperCase(), { bg: 'rgba(0,0,0,.72)', fg: '#ffffff' }); G.wordM.material.needsUpdate = true; G.wordT = 0;
  }
  function revealed() {
    const S = STAGES[G.stage]; G.snd.stage(G.stage); G.buzz([30, 30, 80]);
    const [x, y] = G.S.P(CENTER.u, CENTER.v); G.fx.add(x, y, ['#fff1cf', '#c8ff9a', '#9ff5d0', '#ffcf8a', '#ffb060'][G.stage], 30, 0.35);
    G.pop = 1; showWord(S.word);
    note(G, S.word, S.what, 2.6, G.stage === STAGES.length - 1 ? 'red' : 'black'); hud();
    G.say(`${S.what} ${S.word}.`);
    G.hold = 3.4;                                   // a moment to look before the fog rolls back in
  }
  function nextStage() {
    G.stage++; G.clear = 0; G.chimes = 0; G.stuckT = 0;
    if (G.stage >= STAGES.length) { free(); return; }
    G.pop = 0.6;
    G.say(AGAIN[G.stage - 1] || 'Be still.');
    hud();
  }
  function free() {
    G.freeT = 0; G.phase = 'free'; G.snd.free(); G.snd.flutter();
    G.say('Naming the in-between is what set him free.');
    note(G, 'Free', 'The butterfly leaves the gray zone', 3, 'red');
    hud();
  }

  return {
    title: 'Metamorphosis',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', stage: 0, clear: 0, churn: 0.4, hold: 0, wordT: -1, freeT: -1, noSensor: false, touch: null, touchMove: 0, t0: 0, sensorT: 0,
        chimes: 0, stuckT: 0, hintT: 0, pop: 0, endT: 0, artist: null, hudT: 0, beatParts: 0, sparkT: 0 });
      const mask = maskTex();
      G.uni = { uMask: { value: mask }, uT: { value: 0 }, uClear: { value: 0 }, uChurn: { value: 0.4 }, uFree: { value: 0 }, uH: { value: G.h }, uA: { value: 0 } };
      G.guni = { uMask: { value: mask }, uT: G.uni.uT, uClear: { value: 0 }, uA: G.uni.uA, uWarm: { value: 0 } };
      // back to front: clear glass, the creature's glow, the creature, the fog
      G.glass = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.guni, vertexShader: VERT, fragmentShader: GLASS, transparent: true, depthWrite: false }));
      G.glass.position.z = 0.02; G.glass.renderOrder = 10; G.root.add(G.glass);
      const [cx, cy] = G.S.P(CENTER.u, CENTER.v); G.cxy = [cx, cy];
      G.halo = K.sprite(K.glowTex, 0.55, { additive: true, opacity: 0, color: '#ffd9a0', order: 11 }); G.halo.position.set(cx, cy, 0.025); G.root.add(G.halo);
      G.live = creatureCanvas(THREE, 512);
      G.creature = K.plane(G.live.tex, 0.5, 0.5, { order: 12, opacity: 0 }); G.creature.position.set(cx, cy, 0.03); G.root.add(G.creature);
      G.fog = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.fog.position.z = 0.04; G.fog.renderOrder = 13; G.root.add(G.fog);
      G.wordM = K.plane(K.wordTex(' '), 0.5, 0.125, { order: 20, opacity: 0 }); { const [x, y] = G.S.P(0.5, 0.905); G.wordM.position.set(x, y, 0.06); } G.root.add(G.wordM);
      // the butterfly that flies free at the end
      G.flyLive = creatureCanvas(THREE, 384);
      G.fly = K.plane(G.flyLive.tex, 0.42, 0.42, { order: 21, opacity: 0 }); G.fly.position.set(cx, cy, 0.07); G.root.add(G.fly);
      G.snd = K.audio() ? sounds(K.audio()) : new Proxy({}, { get: () => () => {} });
      sensors();
      hud();
      // the artist's story video: stop Morten's clip so two voices don't overlap
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.onGo = () => { G.t0 = G.t; G.phase = 'play'; G.snd.volume(1); G.say(G.noSensor ? 'No motion sensor? Hold a finger on the screen, and keep it still.' : 'Be still.'); hud(); };
      G.snd.volume(0.6);
      K.intro(G, { title: 'Metamorphosis', how: 'Hold your phone very still and the fog settles, so you can see what grows inside. Move, and it swirls back. Five stages.',
        say: 'Metamorphosis. Hold your phone very still, and the fog settles so you can see it. Move, and the fog swirls back.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      dockBanner(G); if (G.note && !noteOn(G) && !G.over) hud();   // the banner sits above the painting; a message ends
      const U = G.uni; U.uT.value = G.t; U.uA.value += (1 - U.uA.value) * Math.min(1, dt * 2);   // stays on through the finale, so the room keeps its colour
      // how much you're moving: the phone, or (no sensor) a finger held still on the screen
      G.sensorT += dt; if (G.sensorT > 2.5 && !(G.mot && G.mot.ok) && !G.bot && !G.noSensor) { G.noSensor = true; if (G.playing) { G.say('No motion sensor? Hold a finger on the screen, and keep it still.'); hud(); } }
      let move;
      if (G.bot) move = (Math.sin(G.t * 0.7) > 0.93) ? 0.6 : 0.02;
      else if (G.noSensor) { G.touchMove = Math.max(0, G.touchMove - dt * 2); move = G.touch ? Math.min(1, G.touchMove) : 0.5; }
      else move = G.mot.e;
      G.churn += (move - G.churn) * Math.min(1, dt * (move > G.churn ? 6 : 1.5));
      let still = false;
      if (G.phase === 'play' && G.playing) {
        const S = STAGES[G.stage];
        if (G.hold > 0) { G.hold -= dt; if (G.hold <= 0) nextStage(); }
        else if (S) {
          still = G.churn < STILL * (1 - G.stage * 0.08);   // each stage asks for a little more stillness
          if (still) G.clear = Math.min(1, G.clear + dt / S.need); else G.clear = Math.max(0, G.clear - dt * (0.15 + G.churn * 0.5));
          // a chime at each quarter, so you can hear how close you are
          const q = Math.floor(G.clear * 4); if (q > G.chimes && q < 4) { G.snd.chime(q - 1); G.chimes = q; } else if (q < G.chimes - 1) G.chimes = q;
          // stuck moving for a while? a gentle reminder
          G.stuckT = still ? 0 : G.stuckT + dt; G.hintT -= dt;
          if (G.stuckT > 7 && G.hintT <= 0 && !G.noSensor) { G.say('Be still.'); G.hintT = 9; G.stuckT = 0; }
          if (G.clear >= 1) revealed();
          G.hudT -= dt; if (G.hudT <= 0) { G.hudT = 0.3; hud(); }
        }
      }
      // the song: one part per stage reached (and the butterfly brings the melody)
      const parts = G.over ? 5 : G.phase === 'free' ? 5 : G.phase === 'play' ? G.stage + 1 + (G.hold > 0 ? 1 : 0) : 0;
      G.snd.song(Math.min(5, parts));
      const free = G.phase === 'free';
      const target = free ? 1 : G.hold > 0 ? 1 : G.clear;
      U.uClear.value += (target - U.uClear.value) * Math.min(1, dt * 3); U.uChurn.value = Math.min(1, G.churn * 1.4);
      G.guni.uClear.value = U.uClear.value; G.guni.uWarm.value = 0.5 + 0.5 * Math.sin(G.t * 2);
      // the creature: alive, glowing out of the clearing glass, with a little pop when it changes
      G.pop = Math.max(0, G.pop - dt * 1.6);
      const st = Math.min(G.stage, STAGES.length - 1);
      G.live.draw(st, G.t);
      G.creature.material.opacity = free ? Math.max(0, 1 - G.freeT * 2) : 0.2 + 0.8 * U.uClear.value;
      G.creature.scale.setScalar((1 + 0.02 * Math.sin(G.t * 1.5)) * (1 + 0.12 * Math.sin(G.pop * Math.PI)));
      G.halo.material.opacity = free ? 0 : U.uClear.value * (0.35 + 0.15 * Math.sin(G.t * 2.2)) + G.pop * 0.4;
      G.halo.scale.setScalar(0.5 + 0.12 * U.uClear.value + G.pop * 0.2);
      if (G.wordT >= 0) { G.wordT += dt; G.wordM.material.opacity = G.wordT < 3.2 ? Math.min(1, G.wordT * 3) : Math.max(0, 1 - (G.wordT - 3.2) * 2); }
      G.snd.set && G.snd.set(U.uClear.value, U.uChurn.value, still || G.hold > 0);
      // free: the butterfly flies out of the glass and loops round the room as it fills with colour
      if (free || G.over) {
        G.freeT += dt; U.uFree.value = Math.min(1, G.freeT / 3);
        const [cx, cy] = G.cxy, k = Math.min(1, G.freeT / 3.5);
        const loop = Math.max(0, G.freeT - 3.5);
        // once the end panel is up, it drifts down to circle in front of the cube, where it can still be seen
        const down = G.over ? Math.min(1, G.endT / 3) : 0, ease = down * down * (3 - 2 * down);
        G.fly.position.set(cx + Math.sin(G.freeT * 1.3) * 0.2 * k + Math.sin(loop * 0.9) * 0.08, cy + k * 0.3 * (1 - ease) - ease * 0.2 + Math.sin(G.freeT * 4) * 0.015 + Math.cos(loop * 0.9) * 0.04, 0.07);
        G.fly.rotation.z = Math.cos(G.freeT * 1.3) * 0.25 * k;
        G.flyLive.draw(4, G.t, { open: 0.2 + 0.8 * Math.abs(Math.sin(G.freeT * 7)) });
        G.fly.material.opacity = Math.min(1, G.freeT * 2);
        G.fly.scale.setScalar(1.2 - 0.3 * k);   // starts the size of the butterfly in the glass, then a little smaller in flight
        G.sparkT -= dt; if (G.sparkT <= 0 && G.freeT < 6) { G.sparkT = 0.35; G.fx.add(G.fly.position.x, G.fly.position.y, ['#ffb060', '#7cc8f5', '#ffe07a', '#9be27a'][Math.floor(G.freeT * 3) % 4], 8, 0.2); }
        if (G.freeT > 6 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('the-gray-zone:metamorphosis', t, 'lower');
          K.finale(G, { won: true, title: 'Free', kicker: 'Metamorphosis', line: G.work && G.work.quote, best: r.isBest, say: 'Free.',
            cells: [{ k: 'Stages', v: `${STAGES.length}/${STAGES.length}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
          G.endT = 0;
        }
      }
      // the finale: after "Free.", Morten reads his own words over a soft bed of the song
      if (G.over && !G.artist) {
        G.endT += dt;
        if (G.endT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.snd.volume(0.25); }
      }
    },
    pointer(kind, ev) {
      if (!G) return;   // without a motion sensor, a finger held still stands in for the phone (always tracked, so a finger already down counts)
      if (kind === 'down') { G.touch = { x: ev.clientX, y: ev.clientY }; G.touchMove = 0; }
      else if (kind === 'move' && G.touch) { G.touchMove += Math.hypot(ev.clientX - G.touch.x, ev.clientY - G.touch.y) / 40; G.touch = { x: ev.clientX, y: ev.clientY }; }
      else if (kind === 'up') G.touch = null;
    },
    pause() { if (G) { G.paused = true; G.snd.volume(0); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.snd.volume(G.artist ? 0.25 : G.phase === 'intro' ? 0.6 : 1); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'metamorphosis', playing: G.playing, over: G.over, phase: G.phase, stage: G.stage, clear: +G.clear.toFixed(2), churn: +G.churn.toFixed(2), noSensor: G.noSensor, t: +G.t.toFixed(1), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null }; },
    stop() { if (G) { G.offMotion && G.offMotion(); G.snd && G.snd.stop && G.snd.stop(); if (G.artist) { G.artist.pause(); G.artist = null; } } K.cleanup(G); G = null; },
  };
}
