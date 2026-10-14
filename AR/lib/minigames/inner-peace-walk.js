// INNER PEACE IN OUTER CHAOS (Morten Bonde): CALM WALK, red light, green light.
// A game you play by MOVING: start a few steps back from the painting and walk toward it. But only on GREEN LIGHT:
// walk on RED and the chaos around the face grows (the clouds swirl and wave harder, the reds and oranges pulse bigger
// and faster). At the same time, keep your calm: tap the Breathe button in rhythm, when the breathing ring around the
// face is at its biggest. Good breaths calm the storm; missed ones let it grow. The face itself always stays calm.
// You win when you're close to the painting (it fills the screen) AND you've taken enough calm breaths: walking fast
// doesn't skip the breathing. How close you are is measured from how big the painting is on the screen.
// Can't walk up to it? Hold the Walk button instead (it counts the same). By ear: "Green light" / "Red light" are
// spoken with their own sounds, the breath has a soft tick, and the chaos has its own roar.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const FACE = { u: 0.53, v: 0.47, ru: 0.105, rv: 0.165 };
const BREATHS = 24, BEAT = 1.25, WINDOW = 0.26;          // calm breaths needed; seconds per breath; how close to the peak a tap counts
const START_MAX = 0.66, GOAL = 0.95;                     // how much of the screen's width the painting fills at the start line / at the finish
const GREEN = [3.0, 5.0], RED = [2.2, 3.6];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uC, uBreath, uCalm, uA, uH, uRed; uniform vec2 uFace, uFaceR;
vec3 tex(vec2 q){ q = clamp(q, 0.0, 1.0); return texture2D(map, vec2(q.x, 1.0 - q.y)).rgb; }
float warmth(vec3 c){ return clamp((c.r - max(c.b, c.g * 0.6)) * 1.8 - 0.15, 0.0, 1.0) * smoothstep(0.3, 0.7, c.r); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float fd = length((p - uFace) / uFaceR), face = 1.0 - smoothstep(0.85, 1.3, fd);          // the face stays calm
  float C = uC * (1.0 - uCalm), drift = 0.18 + C;
  // the storm swirls around the head, and waves
  vec2 d = (p - uFace) * vec2(1.0, uH); float r = length(d);
  float a = drift * (0.25 + 0.6 * sin(uT * 0.6 + r * 5.0)) * 0.45 / (r + 0.35) * smoothstep(0.08, 0.3, r);
  vec2 rot = vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a));
  vec2 q = uFace + rot / vec2(1.0, uH);
  q += vec2(sin(p.y * 17.0 + uT * (1.0 + 3.0 * C)) + 0.5 * sin(p.y * 41.0 - uT * 2.0), cos(p.x * 15.0 - uT * (0.9 + 2.6 * C)) + 0.5 * cos(p.x * 37.0 + uT * 1.7)) * 0.011 * drift;
  q = mix(q, p, face);
  vec3 c = tex(q), raw = tex(p);
  // the reds and oranges glow and pulse: bigger and faster with the chaos
  float f = 0.6 + C * 4.5, pulse = 0.5 + 0.5 * sin(uT * f * 6.2832), rad = 0.008 + C * 0.03;
  vec3 bloom = vec3(0.0); float bw = 0.0;
  for (int i = 0; i < 8; i++) { float an = float(i) * 0.785398; vec3 s = tex(q + vec2(cos(an), sin(an) * uH) * rad); float w = warmth(s); bloom += s * w; bw += 1.0; }
  bloom /= bw;
  float amp = 0.25 + C * 1.3;
  vec3 col = c + (bloom * 1.2 + vec3(0.25, 0.08, 0.0) * warmth(c)) * pulse * amp * (1.0 - face);
  col += vec3(0.25, 0.04, 0.02) * uRed * 0.18 * (1.0 - face) * (0.6 + 0.4 * pulse);            // red light tints the storm
  // the face: calm, breathing softly
  col = mix(col, raw * (1.0 + 0.06 * uBreath) + vec3(0.03, 0.04, 0.05) * uBreath, face);
  // peace at last: a soft, even light
  col = mix(col, raw * 1.06 + vec3(0.03, 0.025, 0.05), uCalm * 0.6);
  gl_FragColor = vec4(col, uA);
}`;

function sounds(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const tone = (t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, slide = 0 } = {}) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.03); };
  // calm: a soft drone; chaos: a roar and a dissonant buzz that rise with it
  const drone = [], dg = ac.createGain(); dg.gain.value = 0.0; dg.connect(out);
  for (const [f, v] of [[110, 0.05], [165, 0.035], [220, 0.025], [277.2, 0.015]]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = v; o.connect(g).connect(dg); o.start(); drone.push(o); }
  const roar = ac.createBufferSource(), rf = ac.createBiquadFilter(), rg = ac.createGain(); roar.buffer = nb; roar.loop = true; rf.type = 'lowpass'; rf.frequency.value = 300; rg.gain.value = 0; roar.connect(rf).connect(rg).connect(out); roar.start();
  const buzz = [], bg = ac.createGain(); bg.gain.value = 0; const bf = ac.createBiquadFilter(); bf.type = 'lowpass'; bf.frequency.value = 900; bf.connect(bg).connect(out);
  for (const f of [92, 97.5, 131]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(bf); o.start(); buzz.push(o); }
  return {
    set(chaos, calm) { const t = ac.currentTime; dg.gain.setTargetAtTime(0.6 + calm * 0.6, t, 0.4); rg.gain.setTargetAtTime(0.03 + chaos * 0.3, t, 0.3); rf.frequency.setTargetAtTime(250 + chaos * 1600, t, 0.3); bg.gain.setTargetAtTime(chaos * chaos * 0.12 * (1 - calm), t, 0.3); },
    green() { const t = ac.currentTime + 0.02; [523.3, 659.3, 784].forEach((f, i) => tone(t + i * 0.08, f, 0.5, { type: 'triangle', vol: 0.12 })); },
    red() { const t = ac.currentTime + 0.02; tone(t, 196, 1.4, { type: 'triangle', vol: 0.2 }); tone(t, 98, 1.6, { vol: 0.18 }); tone(t, 207.7, 1.2, { type: 'triangle', vol: 0.06 }); },
    tick(peak) { tone(ac.currentTime + 0.01, peak ? 440 : 330, 0.12, { vol: peak ? 0.05 : 0.025 }); },
    good(n) { const f = [523.3, 587.3, 659.3, 784, 880][n % 5]; tone(ac.currentTime + 0.01, f, 1.4, { vol: 0.12 }); tone(ac.currentTime + 0.01, f * 2.01, 0.8, { vol: 0.03 }); },
    bad() { tone(ac.currentTime + 0.01, 150, 0.2, { type: 'square', vol: 0.05, slide: 110 }); },
    caught() { const t = ac.currentTime + 0.02; tone(t, 120, 0.6, { type: 'sawtooth', vol: 0.12, slide: 70 }); },
    win() { const t = ac.currentTime + 0.05; [261.6, 329.6, 392, 523.3, 659.3].forEach((f, i) => tone(t + i * 0.18, f, 3.5, { vol: 0.09, att: 0.2 })); },
    volume(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { out.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { [...drone, ...buzz].forEach(o => o.stop()); roar.stop(); out.disconnect(); } catch (e) {} }, 700); },
  };
}

export function calmWalkGame() {
  let G = null;

  /* ── how far away you are: how much of the screen's width the painting fills ── */
  const pv = new THREE.Vector3();
  function coverage() {
    if (!G.camera) return 0;
    G.camera.updateMatrixWorld(); G.root.updateWorldMatrix(true, false);
    const xs = [-0.5, 0.5].map(x => { pv.set(x, 0, 0).applyMatrix4(G.root.matrixWorld).project(G.camera); return pv.x; });
    return Math.abs(xs[1] - xs[0]) / 2;
  }
  /* ── walking: footsteps shake the phone ── */
  function sensors() {
    const M = G.mot = { e: 0 };
    const on = (ev) => { const a = ev.acceleration; let lin = 0; if (a && a.x != null) lin = Math.hypot(a.x, a.y, a.z || 0); M.e += (lin - M.e) * 0.1; };
    addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
  }

  function setLight(green) {
    G.green = green; G.lightT = green ? GREEN[0] + Math.random() * (GREEN[1] - GREEN[0]) : RED[0] + Math.random() * (RED[1] - RED[0]);
    G.light.style.borderColor = green ? '#21c25a' : K.RED;
    G.lamp.innerHTML = green ? '● GREEN LIGHT · WALK' : '● RED LIGHT · FREEZE';
    G.lamp.style.background = green ? '#21c25a' : K.RED;
    if (green) { G.snd.green(); G.say('Green light!'); } else { G.snd.red(); G.say('Red light!'); G.redGrace = 0.6; }
    G.buzz(green ? [40] : [120]);
    hud(true);
  }
  function hud(force) {
    if (!force && G.t - (G.hudT || -9) < 0.25) return; G.hudT = G.t;
    const pct = Math.round(G.prog * 100);
    if (G.phase === 'setup') { G.ui.panel('Get ready', 'Step back', { sub: 'Back up until the painting fits on your screen with room around it' }); return; }
    G.ui.panel(G.green ? 'Green light · walk' : 'Red light · freeze', `${pct}%<small> of the way</small>`,
      { segs: [Math.min(10, Math.round(G.prog * 10)), 10], sub: `Calm breaths ${Math.min(G.breaths, BREATHS)}/${BREATHS}` + (G.chaos > 0.7 ? ' · the storm is wild!' : ''), warn: !G.green });
  }
  function breathe() {
    if (!G.playing || G.phase !== 'play') return;
    const ph = (G.t - G.beat0) / BEAT, off = Math.abs(ph - Math.round(ph)) * BEAT, n = Math.round(ph);
    if (off <= WINDOW && n !== G.lastBreathN) {
      G.lastBreathN = n; G.breaths++; G.chaos = Math.max(0, G.chaos - 0.11); G.snd.good(G.breaths); G.ringFlash = 1; G.buzz(15);
      if (G.breaths === BREATHS) { G.ui.pop('Enough breaths!'); }
    } else { G.chaos = Math.min(1, G.chaos + 0.05); G.snd.bad(); G.ui.pop('Breathe with the ring'); }
    hud(true);
  }

  return {
    title: 'Calm walk',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', green: false, lightT: 0, prog: 0, virt: 0, cov: 0, cov0: 0, breaths: 0, chaos: 0.3, beat0: 0, lastBreathN: -1, lastTickN: -1, ringFlash: 0, walkBtn: false, setupT: 0, caught: 0, redGrace: 0, calm: 0, endT: 0, t0: 0, prevCov: 0, moving: 0 });
      G.uni = { map: { value: null }, uT: { value: 0 }, uC: { value: 0.3 }, uBreath: { value: 0 }, uCalm: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRed: { value: 0 }, uFace: { value: new THREE.Vector2(FACE.u, FACE.v) }, uFaceR: { value: new THREE.Vector2(FACE.ru, FACE.rv) } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // the breathing ring around the face
      G.ring = K.sprite(K.ringTex, 0.3, { color: '#bff6ff', opacity: 0, order: 20 }); { const [x, y] = G.S.P(FACE.u, FACE.v); G.ring.position.set(x, y, 0.05); } G.root.add(G.ring);
      // the light: a border around the whole screen and a lamp at the bottom
      G.light = document.createElement('div'); Object.assign(G.light.style, { position: 'fixed', inset: '0', border: '10px solid transparent', zIndex: 9, pointerEvents: 'none', transition: 'border-color .25s' }); document.body.appendChild(G.light);
      G.lamp = document.createElement('div'); Object.assign(G.lamp.style, { position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(152px + env(safe-area-inset-bottom))', zIndex: 11, pointerEvents: 'none', color: '#fff', font: "900 15px Archivo,'Arial Black',Arial,sans-serif", letterSpacing: '.12em', padding: '8px 14px', display: 'none' }); document.body.appendChild(G.lamp);
      G.snd = K.audio() ? sounds(K.audio()) : new Proxy({}, { get: () => () => {} });
      sensors();
      G.ui.buttons([
        { label: 'Walk', icon: '🚶', kind: 'black', aria: 'Walk forward (hold), if you can’t walk up to the painting', press: () => { G.walkBtn = true; }, release: () => { G.walkBtn = false; } },
        { label: 'Breathe', icon: '◯', kind: 'red', aria: 'Breathe: tap when the ring is biggest', press: () => breathe() },
      ]);
      G.ui.panel('Calm walk', 'Red light, green light', { sub: 'You’ll walk toward the painting' });
      G.onGo = () => {
        G.t0 = G.t; G.snd.volume(1); G.phase = 'setup'; G.setupT = 0;
        G.say('First, step back until the whole painting fits on your screen, with room around it.'); hud(true);
      };
      K.intro(G, { title: 'Calm walk', how: 'This game is played by MOVING. Start a few steps back, then walk toward the painting, but only on green light. Tap Breathe when the ring is biggest to keep calm.',
        say: 'Calm walk. This game is played by moving: you will walk toward the painting. Start a few steps back. Walk closer only on green light, and freeze on red light, or the storm around the face grows. At the same time, keep your calm: tap the breathe button in rhythm, when the ring around the face is at its biggest. Reach the painting, and take enough calm breaths, to find inner peace. If you can’t walk up to it, hold the walk button instead.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uA.value += ((G.ready && !G.over ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      G.uni.uT.value = G.t;
      // where you are
      const raw = coverage(); if (Number.isFinite(raw) && raw > 0 && raw < 20) G.cov += (raw - G.cov) * Math.min(1, dt * (G.cov ? 4 : 99));
      if (G.phase === 'setup') {
        G.setupT += dt; hud();
        if (G.cov < START_MAX || G.setupT > 9 || G.bot) {
          G.phase = 'play'; G.cov0 = G.cov; G.physOK = G.cov < START_MAX + 0.08; G.prevCov = G.cov; G.beat0 = G.t + 0.6; G.lamp.style.display = 'block';
          if (!G.physOK && !G.bot) G.say('You’re already very close, so hold the walk button on green light instead.');
          setLight(true);
        }
      }
      // the breathing ring: biggest on each breath
      const ph = G.phase === 'play' ? (G.t - G.beat0) / BEAT : G.t / BEAT, br = Math.pow(0.5 + 0.5 * Math.cos(ph * Math.PI * 2), 2);
      G.ringFlash = Math.max(0, G.ringFlash - dt * 3);
      G.ring.material.opacity = G.phase === 'play' ? 0.35 + 0.4 * br + 0.25 * G.ringFlash : 0;
      G.ring.scale.setScalar(0.24 + 0.12 * br + 0.05 * G.ringFlash);
      G.ring.material.color.set(G.ringFlash > 0.1 ? '#ffffff' : '#bff6ff');
      G.uni.uBreath.value = br;
      if (G.phase === 'play' && G.playing) {
        const n = Math.round(ph); if (n !== G.lastTickN && Math.abs(ph - n) < 0.05) { G.lastTickN = n; G.snd.tick(true); }
        // the lights
        G.lightT -= dt; if (G.lightT <= 0) setLight(!G.green);
        G.redGrace = Math.max(0, G.redGrace - dt);
        // walking: the painting getting bigger on screen, a step's shake, or the Walk button
        const grow = (G.cov - G.prevCov) / Math.max(dt, 1e-3); G.prevCov = G.cov;
        const stepping = (G.mot && G.mot.e > 1.1) || grow > 0.02 || G.walkBtn || (G.bot && G.green);
        if ((G.walkBtn || (G.bot && G.green)) && G.green) G.virt = Math.min(1, G.virt + dt / 14);
        G.moving += ((stepping ? 1 : 0) - G.moving) * Math.min(1, dt * 6);
        if (!G.green && G.redGrace <= 0 && G.moving > 0.5) {   // caught moving on red: the storm surges
          G.chaos = Math.min(1, G.chaos + dt * 0.45);
          G.caughtT = (G.caughtT || 0) - dt; if (G.caughtT <= 0) { G.caughtT = 1.5; G.caught++; G.snd.caught(); G.ui.alert('Freeze!', 'Moving on red makes the storm grow', 1.2, 'red'); G.say('Freeze!'); G.buzz([60, 30, 60]); }
        }
        // the storm grows on its own; calm breaths settle it
        G.chaos = Math.min(1, G.chaos + dt * 0.035);
        // the robot player breathes on the beat
        if (G.bot && Math.abs(ph - Math.round(ph)) * BEAT < 0.05 && Math.round(ph) !== G.lastBreathN && Math.round(ph) >= 0) breathe();
        // how far you've come
        const phys = G.physOK ? Math.max(0, Math.min(1, (G.cov - G.cov0) / Math.max(0.2, GOAL - G.cov0))) : 0;
        G.prog = Math.max(G.prog * 0.999, phys, G.virt);
        hud();
        if (G.prog >= 0.98 && G.breaths >= BREATHS) {
          G.phase = 'done'; G.endT = 0; G.snd.win(); G.lamp.style.display = 'none'; G.light.style.borderColor = 'transparent';
          G.ui.alert('Inner peace', 'The storm can swirl. You stay calm.', 3, 'blue'); G.say('You found inner peace. The storm can swirl all around, and you stay calm.');
        } else if (G.prog >= 0.98 && !G.saidMore) { G.saidMore = true; G.say(`You made it! Now keep breathing a few more calm breaths.`); }
        else if (G.breaths >= BREATHS && !G.saidWalk) { G.saidWalk = true; G.say('Your breathing is steady. Now keep walking closer, on green light.'); }
      }
      // the picture follows the storm
      if (G.phase === 'done') { G.endT += dt; G.calm = Math.min(1, G.endT / 3); G.chaos = Math.max(0, G.chaos - dt * 0.4); }
      G.uni.uC.value += (G.chaos - G.uni.uC.value) * Math.min(1, dt * 3); G.uni.uCalm.value = G.calm;
      G.uni.uRed.value += ((G.phase === 'play' && !G.green ? 1 : 0) - G.uni.uRed.value) * Math.min(1, dt * 4);
      G.snd.set && G.snd.set(G.chaos, G.calm);
      if (G.phase === 'done' && G.endT > 4.5 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('inner-peace:walk', G.caught, 'lower');
        K.finale(G, { won: true, title: 'Peace within', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Breaths', v: G.breaths }, { k: 'Caught on red', v: G.caught }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        G.snd.volume(0.5);
      }
    },
    pointer() {},
    pause() { if (G) { G.paused = true; G.snd.volume(0); } },
    resume() { if (G) { G.paused = false; G.snd.volume(G.over ? 0.5 : 1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'calm-walk', playing: G.playing, over: G.over, phase: G.phase, green: G.green, prog: +G.prog.toFixed(2), cov: +G.cov.toFixed(2), breaths: G.breaths, chaos: +G.chaos.toFixed(2), caught: G.caught, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.offMotion && G.offMotion(); G.snd && G.snd.stop && G.snd.stop(); G.light && G.light.remove(); G.lamp && G.lamp.remove(); } K.cleanup(G); G = null; },
  };
}
