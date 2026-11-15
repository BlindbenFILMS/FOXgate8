// THE TEMPERATURE SETTER (Delric Pollins): HANDS UP, HANDS DOWN.
// "As a performer, you set the temperature in the room. That's the one thing my eyes could never take from me."
// "It's nothing like getting on the stage and put your hands up and put your hands down. And you've got 5,000 people
//  doing that at the same time."
// You're Delric on stage. A hip-hop beat drops. On every call ("Hands up!" with a rising sound, "Hands down!" with a
// falling one) press HANDS UP or HANDS DOWN on the beat the call ends on: the painted crowd's hands rise and fall in a wave
// that spreads out from the stage, the crowd roars, the golden stage light gets hotter, and more people pack in.
// Grow the crowd from 50 to 5,000. Right on the beat is a PERFECT (more heat); a little late still counts; a wrong
// move just gets a confused murmur. The calls come faster as the room heats up. Nobody gets stuck.
// Also: tap the top half of the screen for up, the bottom half for down.
// Props: temp-things.js (the button pictures and the crowd hands, drawn in code).
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './temp-things.js';

const BPM = 92, SPB = 60 / BPM;
const CROWD = [50, 100, 200, 350, 500, 750, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
const PERFECT = 0.17;     // seconds either side of the beat
const LEAD = 3;           // each call is lined up 3 beats ahead of its press…
// …and starts early by the length of Ben's recording, so the END of the words lands right on the beat
// ("Hands up!" is short, "Hands down!" longer). If either is re-recorded, put its new length (seconds) here.
const VO_LEN = { up: 0.77, down: 1.51 };
const MIC = [0.585, 0.205], LIGHT = [0.55, 0.06];
const fmt = n => n.toLocaleString('en-US');

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting itself: the crowd's hands lift in a wave from the stage outward, the haze swirls, the light heats up
const FRAG = `
uniform sampler2D map; uniform float time; uniform float heat; uniform float pulse; uniform float from; uniform float to; uniform float since; uniform float ready;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // the crowd: everything below the stage line except Delric himself
  float crowd = smoothstep(0.47, 0.6, p.y) * (1.0 - (step(0.43, p.x) * step(p.x, 0.635) * step(p.y, 0.775)));
  float delay = abs(p.x - 0.53) * 0.42 + (1.0 - p.y) * 0.1;                     // the wave spreads out from the stage
  float k = smoothstep(0.0, 0.22, since - delay);
  float up = mix(from, to, k);
  float lift = crowd * (up * 0.045 + 0.006 * sin(p.x * 50.0 + time * 7.0) * up) * smoothstep(0.47, 0.75, p.y);
  // the haze above: slowly swirling, faster when it's hot
  float haze = 1.0 - smoothstep(0.35, 0.6, p.y);
  vec2 sw = vec2(noise(p * 6.0 + vec2(time * (0.15 + heat * 0.3), 0.0)), noise(p * 6.0 + vec2(3.1, time * 0.2))) - 0.5;
  vec2 q = p + vec2(0.0, lift) + sw * 0.012 * haze;
  vec3 col = texture2D(map, vec2(q.x, 1.0 - q.y)).rgb;
  // the temperature: cool and dim at first, then golden, then red hot; the stage light blooms on the beat
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  vec3 cool = mix(vec3(lum), col, 0.45) * vec3(0.78, 0.82, 0.95) * 0.75;
  vec3 hot = col * mix(vec3(1.0), vec3(1.25, 0.95, 0.7), smoothstep(0.6, 1.0, heat));
  col = mix(cool, hot, smoothstep(0.0, 0.5, heat));
  float d = distance(p, vec2(${LIGHT[0]}, ${LIGHT[1] + 0.12}));
  col += vec3(1.0, 0.62, 0.22) * (0.15 + heat * 0.55 + pulse * 0.25) * exp(-d * d * 9.0) * (0.4 + heat);
  col *= 1.0 + pulse * 0.06;
  gl_FragColor = vec4(col, ready);
}`;

export function handsUpGame() {
  let G = null;
  const now = () => { const a = K.audio(); return a ? a.currentTime : G.t; };

  /* ───────── the beat: kick, snare, hats, bass and a minor chord stab ───────── */
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  const BASS = [[0, 45], [3, 45], [6, 48], [8, 50], [11, 48], [14, 43]];   // one bar in sixteenths; the second bar drops a step
  function scheduleBeat(n, at) {
    const ac = K.audio(); if (!ac) return;
    const delay = Math.max(0, at - ac.currentTime), b = n % 4, bar = Math.floor(n / 4) % 2, hot = 0.6 + G.heat * 0.6;
    if (b === 0 || b === 2) { K.tone(58, 0.32, { vol: 0.32, slide: -26, delay }); K.tone(110, 0.06, { type: 'triangle', vol: 0.08, delay }); }   // kick
    if (b === 2 && bar === 1) K.tone(58, 0.25, { vol: 0.2, slide: -24, delay: delay + SPB * 0.75 });   // a little extra kick
    if (b === 1 || b === 3) { K.noise(0.18, { vol: 0.32 * hot, freq: 1900, q: 0.9, delay }); K.tone(185, 0.09, { type: 'triangle', vol: 0.07, delay }); }   // snare / clap
    for (let h = 0; h < 2; h++) K.noise(0.04, { vol: 0.07 * hot, freq: 8500, type: 'highpass', delay: delay + h * SPB / 2, pan: h ? 0.2 : -0.2 });   // hats
    for (const [s, m] of BASS) if ((s >> 2) === b) K.tone(midi(m + (bar ? -2 : 0)), SPB * 0.45, { type: 'triangle', vol: 0.16, delay: delay + (s % 4) * SPB / 4 });   // bass
    if (b === 0 && G.heat > 0.25) K.chord([57, 60, 64].map(m => midi(m + (bar ? -2 : 0))), SPB * 0.6, { vol: 0.03 * hot, type: 'square', spread: 0.004, delay });   // a stab
  }
  function crowdBed() {   // the crowd's murmur, louder as it grows
    const ac = K.audio(); if (!ac) return;
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; src.loop = true; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6; g.gain.value = 0;
    src.connect(f).connect(g).connect(ac.destination); src.start(); G.bed = { src, g };
  }
  function cheer(size) {   // a roar: wide noise with a rising shape, bigger crowds roar longer and louder
    K.noise(0.9 + size * 0.8, { vol: 0.18 + size * 0.32, freq: 1100, sweepTo: 2200, q: 0.5 });
    K.noise(0.7 + size * 0.6, { vol: 0.1 + size * 0.15, freq: 600, q: 0.7, pan: -0.5, delay: 0.05 });
    K.noise(0.7 + size * 0.6, { vol: 0.1 + size * 0.15, freq: 1500, q: 0.7, pan: 0.5, delay: 0.08 });
  }
  function callSound(dir, at) {
    const ac = K.audio(); if (!ac) return; const delay = Math.max(0, at - ac.currentTime);
    if (dir === 'up') { K.tone(330, 0.4, { type: 'sawtooth', vol: 0.05, slide: 660, delay }); K.noise(0.4, { vol: 0.15, freq: 600, sweepTo: 4000, delay }); }
    else { K.tone(900, 0.4, { type: 'sawtooth', vol: 0.05, slide: -650, delay }); K.noise(0.4, { vol: 0.15, freq: 3500, sweepTo: 400, delay }); K.tone(70, 0.4, { vol: 0.2, slide: -20, delay: delay + 0.3 }); }
  }

  /* ───────── the calls ───────── */
  function hud() {
    G.ui.panel('The temperature', `${fmt(CROWD[G.step])}<small>people</small>`,
      { segs: [Math.round(G.heat * 10), 10], sub: G.endT >= 0 ? '5,000 hands in the air' : 'Hands up or hands down, on the beat' });
  }
  function gap() { return G.step < 4 ? 5 : G.step < 9 ? 4 : 3; }   // beats between presses: faster as it heats up
  function nextCall(fromBeat) {
    const last = G.lastDir;
    const dir = last === 'up' ? (Math.random() < 0.85 ? 'down' : 'up') : last === 'down' ? (Math.random() < 0.85 ? 'up' : 'down') : 'up';
    G.lastDir = dir;
    G.call = { dir, callBeat: fromBeat, target: fromBeat + LEAD, done: false, shown: false };
  }
  function beatTime(n) { return G.beat0 + n * SPB; }
  function showCall(c) {
    c.shown = true;
    G.say(c.dir === 'up' ? 'Hands up!' : 'Hands down!');
    G.callSpr.material.map = c.dir === 'up' ? G.texUp : G.texDown; G.callSpr.material.needsUpdate = true; G.callT = 1;
    const b = G.btns[c.dir === 'up' ? 0 : 1]; if (b) { b.style.outline = '5px solid #ffd65a'; b.style.outlineOffset = '2px'; }
  }
  function clearCall() { for (const b of G.btns) b.style.outline = ''; }
  function press(dir) {
    if (!G || !G.playing || G.over) return;
    const c = G.call; G.buzz(10);
    if (!c || c.done || !c.shown) { K.tone(dir === 'up' ? 520 : 260, 0.08, { vol: 0.05 }); return; }   // between calls: just a little blip
    const t = now(), diff = t - beatTime(c.target);
    if (dir !== c.dir) { c.done = true; clearCall(); G.heat = Math.max(0, G.heat - 0.04); K.noise(0.6, { vol: 0.12, freq: 400, q: 1.2 }); G.ui.pop('OOPS!', innerWidth / 2, G.popY()); G.say('Other way!'); G.streak = 0; hud(); return; }
    if (diff < -0.45) { K.tone(dir === 'up' ? 520 : 260, 0.08, { vol: 0.05 }); return; }   // too early: wait for the beat
    c.done = true; clearCall();
    const perfect = Math.abs(diff) <= PERFECT;
    G.move(dir);
    G.step = Math.min(CROWD.length - 1, G.step + 1); G.perfects += perfect ? 1 : 0; G.streak++;
    G.heat = Math.min(1, G.heat + (perfect ? 0.085 : 0.055));
    const size = G.step / (CROWD.length - 1); cheer(size);
    G.pulse = 1; G.buzz(perfect ? [30, 20, 60] : [30]);
    const [x, y] = G.S.P(0.5, 0.82); G.fx.add(x, y, perfect ? '#ffd65a' : '#ffffff', perfect ? 26 : 12, 0.3);
    G.ui.pop(perfect ? 'PERFECT!' : dir === 'up' ? 'HANDS UP!' : 'HANDS DOWN!', innerWidth / 2, G.popY());
    hud();
    if (G.step === CROWD.length - 1) { G.endT = 0; G.call = null; G.move('up'); G.say('5,000 people! The room is on fire!'); G.ui.alert('5,000 people!', 'The room is on fire', 3, 'red'); cheer(1.4); G.buzz([60, 60, 160]); }
  }

  return {
    title: 'Hands up, hands down',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { step: 0, heat: 0.05, pulse: 0, perfects: 0, streak: 0, call: null, lastDir: null, beat0: 0, nextBeat: 0, endT: -1, t0: 0, callT: 0, from: 0, to: 0, since: 9 });
      G.uni = { map: { value: null }, time: { value: 0 }, heat: { value: 0 }, pulse: { value: 0 }, from: { value: 0 }, to: { value: 0 }, since: { value: 9 }, ready: { value: 0 } };
      G.board = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.board.position.z = 0.02; G.board.renderOrder = 11; G.root.add(G.board);
      new THREE.TextureLoader().load((ctx.work && ctx.work.image) || '', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.uni.map.value = t; G.ready = true; });
      // the crowd in front: drawn hands along the bottom, more of them as the room fills
      const handTex = new THREE.CanvasTexture(thingCanvas('crowdHand', 256)); handTex.colorSpace = THREE.SRGBColorSpace;
      G.hands = Array.from({ length: 18 }, (_, i) => {
        const u = 0.05 + i * (0.9 / 17) + (Math.random() - 0.5) * 0.03, s = 0.13 + Math.random() * 0.04;
        const m = K.sprite(handTex, s, { order: 20, opacity: 0 }); m.material.rotation = (Math.random() - 0.5) * 0.4; G.root.add(m);
        return { m, u, s, ph: Math.random() * 6, show: Math.abs(u - 0.5) * 2 };   // the ones near the middle arrive first
      });
      // the mic's glint on the beat, and the big call sign above the stage
      G.glint = K.sprite(K.glowTex, 0.12, { additive: true, opacity: 0, order: 22, color: '#fff1c0' }); G.glint.position.set(...G.S.P(...MIC), 0.04); G.root.add(G.glint);
      const sign = (text) => K.canvasTex(512, 128, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#ec3013'; g.fillRect(0, 118, 512, 10);
        // (the words shrink until the whole call fits on the sign: "HANDS DOWN ↓" was losing its first and last letters)
        let fs = 78; const font = () => { g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; }; font();
        while (g.measureText(text).width > 480 && fs > 30) { fs -= 2; font(); }
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 62); });
      G.texUp = sign('HANDS UP ↑'); G.texDown = sign('HANDS DOWN ↓');
      G.callSpr = K.sprite(G.texUp, 0.5, { order: 30, opacity: 0 }); G.callSpr.scale.set(0.56, 0.14, 1); G.callSpr.position.set(...G.S.P(0.5, 0.1), 0.06); G.root.add(G.callSpr);
      // the crowd's hands move: a wave out from the stage
      G.move = (dir) => { const cur = G.from + (G.to - G.from) * Math.min(1, G.since / 0.6); G.from = cur; G.to = dir === 'up' ? 1 : 0; G.since = 0; };
      G.popY = () => innerHeight * 0.62;
      const icon = (k) => `<img alt="" src="${thingCanvas(k, 128).toDataURL()}" style="width:46px;height:46px;display:block">`;
      G.btns = G.ui.buttons([
        { label: 'Hands up', icon: icon('handsUp'), kind: 'red', aria: 'Hands up', press: () => press('up') },
        { label: 'Hands down', icon: icon('handsDown'), kind: 'black', aria: 'Hands down', press: () => press('down') },
      ]);
      hud();
      crowdBed();
      G.onGo = () => { G.t0 = G.t; G.beat0 = now() + 0.15; G.nextBeat = 0; G.firstCall = 8; };   // two bars of beat first, then the calls
      K.intro(G, { title: 'Hands up, hands down', how: 'You’re Delric on stage. When the call comes, press Hands up or Hands down on the next beat. Grow the crowd from 50 to 5,000.',
        say: 'Hands up, hands down. You are Delric, on stage. Listen for the call, then press hands up, or hands down, on the next beat. The crowd moves with you. Grow the crowd from 50 to 5,000.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.time.value = G.t; U.ready.value = Math.min(1, U.ready.value + (G.ready ? dt * 1.5 : 0));
      const t = now();
      // the beat
      if (G.playing || G.endT >= 0) {
        while (beatTime(G.nextBeat) < t + 0.12) {
          const n = G.nextBeat++;
          scheduleBeat(n, beatTime(n));
          if (G.playing && G.endT < 0) {
            if (!G.call && n + 1 >= G.firstCall) nextCall(n + 1);
            else if (G.call && G.call.done && n >= G.call.target + gap() - LEAD - 1) nextCall(n + 1);
          }
        }
        if (Math.floor((t - G.beat0) / SPB) !== G.lastPulse) { G.lastPulse = Math.floor((t - G.beat0) / SPB); G.pulse = Math.max(G.pulse, 0.5 + G.heat * 0.5); }
      }
      // the call: shown and heard one beat before you press; if nobody presses, it passes
      const c = G.call;
      if (c && G.playing && G.endT < 0) {
        if (!c.shown && t >= beatTime(c.target) - VO_LEN[c.dir] - 0.06) { showCall(c); callSound(c.dir, t); }
        if (G.bot && c.shown && !c.done && t >= beatTime(c.target) - 0.03) press(c.dir);
        if (!c.done && t > beatTime(c.target) + SPB * 0.95) { c.done = true; clearCall(); G.heat = Math.max(0, G.heat - 0.03); G.streak = 0; K.noise(0.5, { vol: 0.06, freq: 500, q: 1 }); hud(); }
      }
      G.callT = Math.max(0, G.callT - dt * 0.9);
      G.callSpr.material.opacity = Math.min(1, G.callT * 2.5); G.callSpr.scale.set(0.56 * (1 + G.callT * 0.08), 0.14 * (1 + G.callT * 0.08), 1);
      // the painting
      G.pulse = Math.max(0, G.pulse - dt * 3.5); U.pulse.value = G.pulse;
      U.heat.value += ((G.endT >= 0 ? 1 : G.heat) - U.heat.value) * Math.min(1, dt * 1.5);
      G.since += dt; U.from.value = G.from; U.to.value = G.to; U.since.value = G.since;
      G.glint.material.opacity = 0.2 + G.pulse * 0.7; G.glint.scale.setScalar(0.1 + G.pulse * 0.06);
      // the drawn hands in front: they appear as the crowd grows, and rise and fall with the wave
      const fill = G.step / (CROWD.length - 1), up = G.from + (G.to - G.from);
      for (const hd of G.hands) {
        const k = Math.max(0, Math.min(1, (G.since - Math.abs(hd.u - 0.53) * 0.42) / 0.22)), lvl = G.from + (G.to - G.from) * (k * k * (3 - 2 * k));
        const vis = (hd.show <= fill * 1.15 + 0.12) ? 1 : 0;
        hd.op = (hd.op || 0) + (vis - (hd.op || 0)) * Math.min(1, dt * 3);
        const [x, y] = G.S.P(hd.u, 0.99 - lvl * 0.09 + Math.sin(G.t * 3 + hd.ph) * 0.006 - G.pulse * 0.008);
        hd.m.position.set(x, y, 0.035); hd.m.scale.setScalar(hd.s); hd.m.material.opacity = hd.op * U.ready.value;
        hd.m.material.color.setRGB(0.3 + U.heat.value * 0.55, 0.24 + U.heat.value * 0.36, 0.2 + U.heat.value * 0.18);   // dark in a cool room, lit gold when it's hot
      }
      if (G.bed) { const a = K.audio(); G.bed.g.gain.setTargetAtTime(0.02 + fill * 0.09 + (G.endT >= 0 ? 0.08 : 0), a.currentTime, 0.5); }
      // the finale: 5,000 hands up, the stage blazes, then the end panel
      if (G.endT >= 0) { G.endT += dt;
        if (Math.random() < dt * 12) { const [x, y] = G.S.P(Math.random(), 0.55 + Math.random() * 0.4); G.fx.add(x, y, Math.random() < 0.5 ? '#ffd65a' : '#ff7a2e', 8, 0.25); }
        if (G.endT > 4.5 && !G.over) {
          const tt = Math.round(G.t - G.t0), r = K.best('the-temperature-setter:hands', G.perfects, 'higher');
          K.finale(G, { won: true, title: 'The room is on fire', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Crowd', v: '5,000' }, { k: 'Perfect', v: String(G.perfects) }] });
        } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const r = G.renderer.domElement.getBoundingClientRect();
      press((ev.clientY - r.top) / r.height < 0.5 ? 'up' : 'down');   // top half: up · bottom half: down
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) { G.paused = false; const a = K.audio(); if (a && G.playing) { G.beat0 = a.currentTime + 0.2 - G.nextBeat * SPB; } } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'hands-up', playing: G.playing, over: G.over, crowd: CROWD[G.step], heat: +G.heat.toFixed(2), perfects: G.perfects, call: G.call && G.call.dir, t: +G.t.toFixed(1) }; },
    stop() {
      if (G && G.bed) { try { const a = K.audio(); G.bed.g.gain.setTargetAtTime(0, a.currentTime, 0.2); G.bed.src.stop(a.currentTime + 1); } catch (e) {} }
      if (G && G.btns) clearCall();
      K.cleanup(G); G = null;
    },
  };
}
