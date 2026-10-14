// THE GRAY ZONE (Morten Bonde): METAMORPHOSIS, a movement-and-calm game.
// The glass cube holds the gray zone: "no longer fully sighted, not yet identifying as blind." Something is growing in
// its fog. Hold your phone very still and the fog settles, so you can see it; move, and the fog churns and swirls back
// (the whole gray room stirs too). Five times the fog clears, and each time the creature inside changes and the in-
// between gets a name: an egg (not fully sighted), a caterpillar (not yet blind), a chrysalis (in between), wings
// unfolding (named), and a butterfly (free). Each stage asks for a little more stillness. At the end the butterfly flies
// out of the glass and the gray room fills with colour, because naming the in-between is what set Morten free.
// No motion sensor? Hold a finger on the screen and keep it still. By ear: a soft chord opens up as the fog clears,
// the wind rises when you move, and each stage is spoken.
import * as THREE from 'three';
import * as K from './kit.js';

const CUBE = [[0.225, 0.322], [0.58, 0.312], [0.777, 0.33], [0.773, 0.77], [0.578, 0.83], [0.228, 0.786]];
const CENTER = { u: 0.5, v: 0.56 };
const STAGES = [
  { word: 'Not fully sighted', what: 'An egg, resting on a leaf.', need: 3.0 },
  { word: 'Not yet blind', what: 'A caterpillar, hungry to grow.', need: 3.8 },
  { word: 'In between', what: 'A chrysalis, quiet and hidden.', need: 4.6 },
  { word: 'Named', what: 'Wings, unfolding.', need: 5.4 },
  { word: 'Free', what: 'A butterfly.', need: 6.0 },
];
const STILL = 0.16;   // how much movement still counts as "still"

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D uMask; uniform float uT, uClear, uChurn, uFree, uH, uA;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float inside = texture2D(uMask, vUv).r;
  // the fog swirls around the middle of the cube, faster when you move
  vec2 c = p - vec2(0.5, 0.56); float r = length(c), a = atan(c.y, c.x) + uT * (0.08 + uChurn * 0.9) + (0.6 + uChurn * 2.0) / (r + 0.4);
  vec2 q = vec2(cos(a), sin(a)) * r * 3.0;
  float f = fbm(q * 2.0 + vec2(uT * 0.04, -uT * 0.03)) * 0.75 + fbm(p * 7.0 + uT * (0.05 + uChurn * 0.4)) * 0.35;
  float inFog = clamp(0.3 + f * 0.85, 0.0, 1.0) * (1.0 - uClear * 0.94) + uChurn * 0.35 * f;
  float outFog = uChurn * 0.32 * smoothstep(0.35, 0.8, fbm(p * 3.0 + vec2(uT * 0.3, uT * 0.1)));
  float dens = clamp(mix(outFog, inFog, inside), 0.0, 1.0) * (1.0 - uFree);
  vec3 col = mix(vec3(0.72, 0.75, 0.78), vec3(0.95, 0.96, 0.97), f);
  // free: the gray room fills with colour
  vec3 bloom = mix(vec3(1.0, 0.62, 0.45), vec3(0.45, 0.8, 0.95), smoothstep(0.0, 1.0, p.x + sin(p.y * 4.0 + uT * 0.5) * 0.2));
  bloom = mix(bloom, vec3(1.0, 0.85, 0.5), smoothstep(0.6, 0.0, length((p - vec2(0.5, 0.25)) * vec2(1.0, uH))) * 0.6);
  float ba = uFree * 0.32 * (1.0 - inside * 0.6);
  vec3 outc = (col * dens + bloom * ba * (1.0 - dens)) / max(dens + ba * (1.0 - dens), 0.001);
  gl_FragColor = vec4(outc, (dens + ba * (1.0 - dens)) * uA);
}`;

// the creature, drawn in light
function stageTex(i) {
  return K.canvasTex(256, 256, (g) => {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = 'rgba(255,190,90,.8)'; g.shadowBlur = 10;
    g.strokeStyle = '#b8701c'; g.fillStyle = 'rgba(255,196,96,.55)'; g.lineWidth = 6;
    const leaf = () => { g.beginPath(); g.moveTo(40, 190); g.quadraticCurveTo(128, 120, 216, 190); g.quadraticCurveTo(128, 236, 40, 190); g.fill(); g.stroke(); g.beginPath(); g.moveTo(48, 190); g.lineTo(206, 190); g.stroke(); };
    const wing = (sx, open) => { g.save(); g.translate(128, 128); g.scale(sx * open, 1);
      g.beginPath(); g.moveTo(0, -6); g.bezierCurveTo(30, -80, 110, -90, 96, -20); g.bezierCurveTo(90, 8, 40, 10, 0, 4); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(30, 20, 84, 40, 66, 82); g.bezierCurveTo(50, 104, 14, 70, 0, 18); g.fill(); g.stroke(); g.restore(); };
    const body = () => { g.beginPath(); g.ellipse(128, 132, 7, 46, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.moveTo(124, 90); g.quadraticCurveTo(110, 60, 98, 56); g.moveTo(132, 90); g.quadraticCurveTo(146, 60, 158, 56); g.stroke(); };
    if (i === 0) { leaf(); g.beginPath(); g.ellipse(128, 150, 26, 34, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    if (i === 1) { leaf(); for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(70 + k * 22, 168 - Math.sin(k * 0.9) * 14, 15 - (k === 5 ? 0 : 1), 0, Math.PI * 2); g.fill(); g.stroke(); } g.fillStyle = '#5a3208'; g.beginPath(); g.arc(186, 160, 3.5, 0, Math.PI * 2); g.fill(); }
    if (i === 2) { g.beginPath(); g.moveTo(60, 40); g.lineTo(196, 40); g.stroke(); g.beginPath(); g.moveTo(128, 40); g.lineTo(128, 64); g.stroke();
      g.beginPath(); g.moveTo(128, 64); g.bezierCurveTo(176, 90, 168, 190, 128, 222); g.bezierCurveTo(88, 190, 80, 90, 128, 64); g.fill(); g.stroke();
      g.lineWidth = 3; for (let y = 100; y < 200; y += 24) { g.beginPath(); g.moveTo(104, y); g.quadraticCurveTo(128, y + 8, 152, y); g.stroke(); } }
    if (i === 3) { wing(-1, 0.45); wing(1, 0.45); body(); }
    if (i === 4) { wing(-1, 1); wing(1, 1); body(); }
  });
}
function maskTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.filter = 'blur(3px)'; g.fillStyle = '#fff';
  g.beginPath(); CUBE.forEach(([u, v], i) => g[i ? 'lineTo' : 'moveTo'](u * 256, v * 256)); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

function sounds(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  // a soft chord behind the fog: it opens up (brighter, louder) as the fog clears
  const pad = ac.createGain(), lp = ac.createBiquadFilter(); pad.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 400; lp.connect(pad).connect(out);
  const os = []; for (const [f, v] of [[130.8, 0.05], [196, 0.04], [261.6, 0.03], [329.6, 0.025], [392, 0.02], [493.9, 0.012]]) for (const det of [-5, 5]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; g.gain.value = v; o.connect(g).connect(lp); o.start(); os.push(o); }
  const wind = ac.createBufferSource(), wf = ac.createBiquadFilter(), wg = ac.createGain(); wind.buffer = nb; wind.loop = true; wf.type = 'bandpass'; wf.frequency.value = 500; wf.Q.value = 0.7; wg.gain.value = 0; wind.connect(wf).connect(wg).connect(out); wind.start();
  const tone = (t, f, dur, vol, type = 'sine') => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05); };
  return {
    set(clear, churn) { const t = ac.currentTime; lp.frequency.setTargetAtTime(350 + clear * 2600, t, 0.3); pad.gain.setTargetAtTime(0.35 + clear * 0.8, t, 0.3); wg.gain.setTargetAtTime(0.015 + churn * 0.22, t, 0.15); wf.frequency.setTargetAtTime(380 + churn * 1200, t, 0.2); },
    stage(i) { const t = ac.currentTime + 0.05; [523.3, 659.3, 784, 987.8, 1174.7].slice(0, 2 + i).forEach((f, k) => tone(t + k * 0.12, f, 1.6, 0.07, 'triangle')); },
    flutter() { const t = ac.currentTime + 0.02; for (let k = 0; k < 10; k++) tone(t + k * 0.09, 1500 + Math.random() * 900, 0.06, 0.03); },
    free() { const t = ac.currentTime + 0.05; [261.6, 329.6, 392, 523.3, 659.3, 784, 1046.5].forEach((f, k) => tone(t + k * 0.15, f, 3.5, 0.06, 'triangle')); },
    volume(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { out.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { os.forEach(o => o.stop()); wind.stop(); out.disconnect(); } catch (e) {} }, 700); },
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
    const S = STAGES[G.stage];
    if (!S) { G.ui.panel('Metamorphosis', 'Free', { segs: [STAGES.length, STAGES.length], sub: 'Naming the in-between set him free' }); return; }
    const pct = Math.round(G.clear * 100);
    G.ui.panel(`Stage ${G.stage + 1} of ${STAGES.length}`, G.churn > 0.35 ? 'The fog swirls…' : `${pct}%<small> clear</small>`,
      { segs: [G.stage, STAGES.length], sub: G.noSensor ? 'Hold a finger on the screen and keep it still' : G.churn > 0.35 ? 'Hold your phone still' : 'Stay still… the fog is settling', warn: G.churn > 0.35 });
  }
  function revealed() {
    const S = STAGES[G.stage]; G.snd.stage(G.stage); G.buzz([30, 30, 80]);
    const [x, y] = G.S.P(CENTER.u, CENTER.v); G.fx.add(x, y, '#fff1cf', 24, 0.3);
    G.wordM.material.map = K.wordTex(S.word, { bg: 'rgba(0,0,0,.72)', fg: '#ffffff' }); G.wordM.material.needsUpdate = true; G.wordT = 0;
    G.ui.alert(S.word, S.what, 2.4, G.stage === STAGES.length - 1 ? 'red' : 'black');
    G.say(`${S.what} ${S.word}.`);
    G.hold = 2.8;                                   // a moment to look before the fog rolls back in
  }
  function nextStage() {
    G.stage++; G.clear = 0;
    if (G.stage >= STAGES.length) { free(); return; }
    G.creature.material.map = G.tex[G.stage]; G.creature.material.needsUpdate = true;
    G.say(['The fog rolls back in. Be still again.', 'Something is changing. Be still.', 'Stiller now. Almost there.', 'One last time. Be still.'][G.stage - 1] || 'Be still.');
    hud();
  }
  function free() {
    G.freeT = 0; G.phase = 'free'; G.snd.free(); G.snd.flutter();
    G.say('Naming the in-between is what set him free.');
    G.ui.alert('Free', 'The butterfly leaves the gray zone', 3, 'red');
  }

  return {
    title: 'Metamorphosis',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', stage: 0, clear: 0, churn: 0.4, hold: 0, wordT: -1, freeT: -1, noSensor: false, touch: null, touchMove: 0, t0: 0, sensorT: 0 });
      G.uni = { uMask: { value: maskTex() }, uT: { value: 0 }, uClear: { value: 0 }, uChurn: { value: 0.4 }, uFree: { value: 0 }, uH: { value: G.h }, uA: { value: 0 } };
      G.tex = STAGES.map((_, i) => stageTex(i));
      // the creature sits inside the cube, under the fog
      G.creature = K.plane(G.tex[0], 0.36, 0.36, { order: 12, opacity: 0 }); { const [x, y] = G.S.P(CENTER.u, CENTER.v); G.creature.position.set(x, y, 0.03); G.cxy = [x, y]; } G.root.add(G.creature);
      G.fog = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.fog.position.z = 0.04; G.fog.renderOrder = 13; G.root.add(G.fog);
      G.wordM = K.plane(K.wordTex(' '), 0.42, 0.105, { order: 20, opacity: 0 }); { const [x, y] = G.S.P(0.5, 0.9); G.wordM.position.set(x, y, 0.06); } G.root.add(G.wordM);
      G.fly = K.plane(stageTex(4), 0.2, 0.2, { order: 21, opacity: 0 }); G.fly.position.z = 0.07; G.root.add(G.fly);
      G.snd = K.audio() ? sounds(K.audio()) : new Proxy({}, { get: () => () => {} });
      sensors();
      hud();
      G.onGo = () => { G.t0 = G.t; G.phase = 'play'; G.snd.volume(1); G.say('Be still.'); hud(); };
      K.intro(G, { title: 'Metamorphosis', how: 'Something is growing in the fog. Hold your phone very still and the fog settles so you can see it. Move, and it swirls back. Five stages.',
        say: 'Metamorphosis. The glass cube holds the gray zone: no longer fully sighted, not yet blind. Something is growing inside the fog. Hold your phone very still, and the fog settles so you can see it. Move, and the fog swirls back. Five times the fog will clear, and each time, something changes.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.uT.value = G.t; U.uA.value += ((G.over ? 0 : 1) - U.uA.value) * Math.min(1, dt * 2);
      // how much you're moving: the phone, or (no sensor) a finger held still on the screen
      G.sensorT += dt; if (G.sensorT > 2.5 && !(G.mot && G.mot.ok) && !G.bot && !G.noSensor) { G.noSensor = true; if (G.playing) { G.say('No motion sensor? Hold a finger on the screen, and keep it still.'); hud(); } }
      let move;
      if (G.bot) move = (Math.sin(G.t * 0.7) > 0.93) ? 0.6 : 0.02;
      else if (G.noSensor) { G.touchMove = Math.max(0, G.touchMove - dt * 2); move = G.touch ? Math.min(1, G.touchMove) : 0.5; }
      else move = G.mot.e;
      G.churn += (move - G.churn) * Math.min(1, dt * (move > G.churn ? 6 : 1.5));
      if (G.phase === 'play' && G.playing) {
        const S = STAGES[G.stage];
        if (G.hold > 0) { G.hold -= dt; if (G.hold <= 0) nextStage(); }
        else if (S) {
          const still = G.churn < STILL * (1 - G.stage * 0.08);   // each stage asks for a little more stillness
          if (still) G.clear = Math.min(1, G.clear + dt / S.need); else G.clear = Math.max(0, G.clear - dt * (0.15 + G.churn * 0.5));
          if (G.clear >= 1) revealed();
          G.hudT = (G.hudT || 0) - dt; if (G.hudT <= 0) { G.hudT = 0.3; hud(); }
        }
      }
      U.uClear.value += ((G.hold > 0 ? 1 : G.clear) - U.uClear.value) * Math.min(1, dt * 3); U.uChurn.value = Math.min(1, G.churn * 1.4);
      G.creature.material.opacity = G.phase === 'free' ? Math.max(0, 1 - G.freeT * 2) : 0.25 + 0.75 * U.uClear.value;
      G.creature.scale.setScalar(1 + 0.02 * Math.sin(G.t * 1.5));
      if (G.wordT >= 0) { G.wordT += dt; G.wordM.material.opacity = G.wordT < 2.6 ? Math.min(1, G.wordT * 3) : Math.max(0, 1 - (G.wordT - 2.6) * 2); }
      G.snd.set && G.snd.set(U.uClear.value, U.uChurn.value);
      // free: the butterfly flies out of the glass and the room fills with colour
      if (G.phase === 'free') {
        G.freeT += dt; U.uFree.value = Math.min(1, G.freeT / 3);
        const [cx, cy] = G.cxy, k = Math.min(1, G.freeT / 4.5);
        G.fly.position.set(cx + Math.sin(G.freeT * 1.6) * 0.18 * k, cy + k * 0.42 + Math.sin(G.freeT * 5) * 0.012, 0.07);
        G.fly.scale.set(0.7 + 0.3 * Math.abs(Math.sin(G.freeT * 9)), 1, 1); G.fly.material.opacity = Math.min(1, G.freeT * 2);
        if (G.freeT > 5.2 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('the-gray-zone:metamorphosis', t, 'lower');
          G.snd.volume(0.5);
          K.finale(G, { won: true, title: 'Free', kicker: 'Metamorphosis', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Stages', v: `${STAGES.length}/${STAGES.length}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.noSensor) return;   // without a motion sensor, a finger held still stands in for the phone
      if (kind === 'down') { G.touch = { x: ev.clientX, y: ev.clientY }; G.touchMove = 0; }
      else if (kind === 'move' && G.touch) { G.touchMove += Math.hypot(ev.clientX - G.touch.x, ev.clientY - G.touch.y) / 40; G.touch = { x: ev.clientX, y: ev.clientY }; }
      else if (kind === 'up') G.touch = null;
    },
    pause() { if (G) { G.paused = true; G.snd.volume(0); } },
    resume() { if (G) { G.paused = false; G.snd.volume(G.over ? 0.5 : 1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'metamorphosis', playing: G.playing, over: G.over, phase: G.phase, stage: G.stage, clear: +G.clear.toFixed(2), churn: +G.churn.toFixed(2), noSensor: G.noSensor, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.offMotion && G.offMotion(); G.snd && G.snd.stop && G.snd.stop(); } K.cleanup(G); G = null; },
  };
}
