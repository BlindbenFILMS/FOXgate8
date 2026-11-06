// THE BUTTON IS TO THE LEFT (Anthony Ferraro): CROSS THE STREET, one crossing, played by ear.
// "Sometimes independence is knowing when to advocate for help."
// YOU are at the curb with your long white cane (drawn, seen from behind). The crossing button is right next to you on
// the pole to your left, ticking like a real accessible button. Press it ("Wait."). Traffic roars past (try to go early
// and a car honks you back). When the painting's own signal shows the WALK person and the rapid tick starts, HOLD WALK
// (or hold anywhere) to walk across, your cane sweeping and tapping ahead; LET GO to stop. Partway across, a car RUNS
// THE RED LIGHT: you hear its engine roar in from the right and see its headlights. Stop in time and it shoots past in
// front of you ("Good stop."); keep walking and it's a close call: it swerves, horn blaring, and you jump back. (You are
// never hurt.) Then keep going to the far curb. ASK any time: a passerby helps ("The button is right next to you, on
// your left." / "Not yet." / "Go now." / "Stop! A car is running the red light!").
// The left pole (with its signals and the button) is cut out of the painting and drawn IN FRONT, so cars pass behind it.
// Music: a slight lofi bed (dusty keys, lazy beat, vinyl crackle) from the intro to the end; it dips when the car comes.
// Art: media/games/button/pole.png, clean.jpg (the painting without its taxi) and taxi.png (the taxi, which drives off right). Props: button-things.js. Anthony's own words play at the end.
import * as THREE from 'three';
import * as K from './kit.js';
import { buttonTex, walkTex, handTex, taxiTex, helperTex, walkerTex } from './button-things.js';

const ART = new URL('../../media/games/button/', import.meta.url).href;
const CLIP = new URL('../../../3D/gallery/audio/wing_0_0.mp3', import.meta.url).href;   // Anthony, in his own words
const SIGNAL = [0.224, 0.459];          // the face of the painting's yellow walk signal
const BUTTON = [0.161, 0.717];          // the painting's own crossing button, on the pole to your left
const FROM = [0.40, 0.955], TO = [0.44, 0.765];   // your feet: the near curb → the far curb
const LANE = 0.845;
const PTAXI = [0.7111, 0.6867, 1.0, 0.8511];   // the painting's own yellow taxi (cut out): it pulls away when you press the button                     // where the cars' wheels run
const DANGER = [0.45, 0.86];            // how far across (0..1) you're standing in the cars' lane
const SPEED = 0.12;                     // how far across per second while you hold Walk
const WALK = 16, FLASH = 8;             // seconds of WALK, then the flashing hand
const SAY = {
  intro: 'Cross the street. You are at the curb with your white cane. The crossing button is right next to you. Press it, then wait for the walk sign. Hold Walk to walk, and let go to stop. Listen out for cars!',
  how: 'Press the button. Wait for the walk sign. Hold Walk to walk, let go to stop. Listen for cars!',
};
const lerp = (a, b, k) => a + (b - a) * k;
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uStreak, uCalm;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = at(p);
  // the streaks of car lights race across the street while traffic flows
  float red = smoothstep(0.15, 0.45, col.r - max(col.g, col.b));
  float band = smoothstep(0.69, 0.72, p.y) * smoothstep(0.78, 0.745, p.y);
  col += vec3(0.6, 0.05, 0.15) * red * band * (0.5 + 0.5 * sin(p.x * 40.0 + uT * 18.0)) * uStreak;
  // when the walk sign is on, the street calms and brightens a little
  col = mix(col, col * 1.08 + vec3(0.02, 0.03, 0.04), uCalm * 0.6);
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── sound ───────────────────────── */
function sounds(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; master.connect(comp).connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const panN = (p) => { if (!ac.createStereoPanner) return { node: master, pan: null }; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(master); return { node: n, pan: n.pan }; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.004, p = 0, slide = 0, lp = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(panN(p).node); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.003, sweep = 0, panTo = null } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const P = panN(p); if (P.pan && panTo !== null) { P.pan.setValueAtTime(p, t); P.pan.linearRampToValueAtTime(panTo, t + dur); }
    s.connect(f).connect(g).connect(P.node); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  const hum = (() => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'lowpass'; f.frequency.value = 260; g.gain.value = 0; s.connect(f).connect(g).connect(master); s.start(); return g; })();
  const now = () => ac.currentTime;
  // a slight LOFI bed under the city: dusty electric-piano chords, a lazy swung beat, soft bass and vinyl crackle (76 bpm)
  const lofiLp = ac.createBiquadFilter(); lofiLp.type = 'lowpass'; lofiLp.frequency.value = 2000;
  const lofiG = ac.createGain(); lofiG.gain.value = 0.0001; lofiLp.connect(lofiG).connect(master);
  const LP = (p) => { if (!ac.createStereoPanner) return lofiLp; const n = ac.createStereoPanner(); n.pan.value = p; n.connect(lofiLp); return n; };
  const lt = (t, f, dur, { type = 'sine', vol = 0.05, att = 0.02, p = 0, det = 0 } = {}) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; o.detune.value = det;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(LP(p)); o.start(t); o.stop(t + dur + 0.05); };
  const ln = (t, dur, { freq = 2000, type = 'bandpass', q = 1, vol = 0.05, p = 0 } = {}) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(LP(p)); s.start(t, Math.random()); s.stop(t + dur + 0.02); };
  const crackle = (() => { const b = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.015;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; s.loop = true; f.type = 'highpass'; f.frequency.value = 1200; g.gain.value = 0.5; s.connect(f).connect(g).connect(lofiLp); s.start(); return g; })();
  const LOFI = { ch: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], bass: [41, 40, 38, 36], mel: [[72, 2], [69, 3], [67, 5], [64, 6]] };
  const lofi = { timer: null, next: 0, step: 0, bar: 0 };
  const m2f = m => 440 * Math.pow(2, (m - 69) / 12), E = 60 / 76 / 2;   // an eighth note
  function lofiTick() {
    while (lofi.next < now() + 0.2) {
      const t = lofi.next + (lofi.step % 2 ? E * 0.18 : 0), st = lofi.step, ch = LOFI.ch[lofi.bar % 4];   // swung eighths
      if (st === 0) { ch.forEach((m, i) => { lt(t + i * 0.012, m2f(m), 2.4, { type: 'sine', vol: 0.045, att: 0.03, p: -0.15, det: -6 }); lt(t + i * 0.012, m2f(m + 12), 1.2, { type: 'triangle', vol: 0.012, p: 0.15, det: 7 }); }); lt(t, m2f(LOFI.bass[lofi.bar % 4]), 1.4, { vol: 0.1, att: 0.01 }); }
      if (st === 5) ch.slice(1).forEach(m => lt(t, m2f(m), 0.9, { type: 'sine', vol: 0.025, p: 0.1 }));
      if (st === 7) lt(t, m2f(LOFI.bass[lofi.bar % 4] + 7), 0.5, { vol: 0.06 });
      if (st === 0 || st === 5) lt(t, 70, 0.22, { vol: 0.12, att: 0.004 });                       // soft kick
      if (st === 2 || st === 6) ln(t, 0.16, { freq: 1700, q: 0.8, vol: 0.05 });                     // brushed snare
      ln(t, 0.03, { freq: 7000, type: 'highpass', vol: st % 2 ? 0.008 : 0.014, p: 0.3 });           // quiet hats
      if (lofi.bar % 2 === 1) for (const [m, at] of LOFI.mel) if (at === st) lt(t, m2f(m), 0.6, { type: 'triangle', vol: 0.02, p: 0.2 });
      lofi.next += E; lofi.step++; if (lofi.step === 8) { lofi.step = 0; lofi.bar++; }
    }
  }
  return {
    start() { master.gain.setTargetAtTime(0.9, now(), 0.1); },
    lofiStart() { if (lofi.timer) return; lofi.next = now() + 0.1; lofiG.gain.setTargetAtTime(0.9, now(), 1.5); lofi.timer = setInterval(lofiTick, 30); lofiTick(); },
    lofiLevel(k) { lofiG.gain.setTargetAtTime(Math.max(0.0001, k * 0.9), now(), 0.4); },
    city(k) { hum.gain.setTargetAtTime(k, now(), 0.5); },
    locate(p) { const t = now(); tone(t, 880, 0.045, { type: 'square', vol: 0.09, p, lp: 2400 }); noise(t, 0.02, { freq: 3000, q: 2, vol: 0.1, p }); },
    walkTick(p) { tone(now(), 1250, 0.03, { type: 'square', vol: 0.11, p, lp: 3500 }); },
    press(p) { const t = now(); tone(t, 180, 0.08, { type: 'square', vol: 0.25, p, lp: 900 }); noise(t, 0.04, { freq: 1500, vol: 0.3, p }); tone(t + 0.1, 988, 0.12, { type: 'triangle', vol: 0.12, p }); },
    car(dir) { const t = now(), a = dir > 0 ? -0.9 : 0.9; noise(t, 1.3, { freq: 350, q: 0.7, vol: 0.3, p: a, panTo: -a, sweep: 700, att: 0.5 }); },
    horn(p = 0.5, long = false) { const t = now(), d = long ? 1.0 : 0.35; tone(t, 415, d, { type: 'sawtooth', vol: 0.1, p, lp: 1800 }); tone(t, 523, d, { type: 'sawtooth', vol: 0.08, p, lp: 1800 }); },
    screech(p = 0) { noise(now(), 0.9, { freq: 2600, q: 6, vol: 0.28, p, sweep: 1800 }); },
    bus(p) { noise(now(), 0.9, { freq: 4000, type: 'highpass', vol: 0.1, p, att: 0.05 }); },
    // the car running the light: an engine roaring in from the right, getting louder and higher
    engine(secs) {
      const t = now(), o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), P = panN(0.95);
      o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(140, t + secs);
      f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1400, t + secs);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + secs); g.gain.exponentialRampToValueAtTime(0.0001, t + secs + 1.1);
      if (P.pan) { P.pan.setValueAtTime(0.95, t); P.pan.linearRampToValueAtTime(0.2, t + secs); P.pan.linearRampToValueAtTime(-0.95, t + secs + 1.0); }
      o.connect(f).connect(g).connect(P.node); o.start(t); o.stop(t + secs + 1.2);
      noise(t, secs + 1.0, { freq: 500, q: 0.6, vol: 0.25, p: 0.9, panTo: -0.9, sweep: 1500, att: secs * 0.9 });
    },
    step(i) { const t = now(), p = i % 2 ? 0.2 : -0.2; noise(t, 0.07, { freq: 500, q: 1.2, vol: 0.28, p }); tone(t, 90, 0.06, { vol: 0.16, p }); },
    cane(p) { const t = now(); tone(t, 2400, 0.03, { type: 'triangle', vol: 0.07, p }); noise(t, 0.025, { freq: 4200, q: 2, vol: 0.06, p }); },
    phew() { const t = now(); [67, 71, 74].forEach((m, i) => tone(t + i * 0.08, midi(m), 0.4, { type: 'triangle', vol: 0.1 })); },
    helper() { const t = now(); tone(t, midi(76), 0.15, { type: 'triangle', vol: 0.08 }); tone(t + 0.12, midi(81), 0.25, { type: 'triangle', vol: 0.08 }); },
    win() { const t = now(); [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.09, midi(m), 1.2, { type: 'triangle', vol: 0.08 })); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), now(), secs / 3); },
    stop() { clearInterval(lofi.timer); lofi.timer = null; master.gain.setTargetAtTime(0.0001, now(), 0.08); setTimeout(() => { try { master.disconnect(); } catch (e) {} }, 600); },
  };
}

export function crossTheStreetGame() {
  let G = null;

  function hud() {
    const sub = { press: 'Press the button. It’s right next to you, on your left.', wait: 'Wait for the walk sign…', walk: 'Hold Walk to cross. Let go to stop.', flash: 'Keep going, you’re nearly there', car: 'STOP! A car is running the red light!', done: 'You made it across!' }[G.phase] || '';
    G.ui.panel('Cross the street', `${Math.round(G.p * 100)}%<small>across</small>`, { segs: [Math.round(G.p * 10), 10], sub, warn: G.phase === 'car' });
  }
  function popAt(text, v = 0.5) {
    let y = innerHeight * 0.5;
    try { const [x0, y0] = G.S.P(0.5, v), p = new THREE.Vector3(x0, y0, 0.05); G.root.localToWorld(p); p.project(G.camera);
      const r = G.renderer.domElement.getBoundingClientRect(); y = r.top + (1 - p.y) / 2 * r.height; } catch (e) {}
    G.ui.pop(text, innerWidth / 2, Math.min(y, innerHeight - 270));
  }
  function hudCss() {
    const st = document.createElement('style');
    st.textContent = '.mgk.mgk-alert,.mgk.mgk-count{top:auto!important;bottom:calc(152px + env(safe-area-inset-bottom))!important}.mgk.mgk-alert .t{font-size:clamp(20px,6.4vw,30px)!important}' +
      // a little breathing room for every text box: the finish card, its score cells, the quote, the panel, alerts and pop-ups
      '.mgk.mgk-end{left:calc(18px + env(safe-area-inset-left))!important;right:calc(18px + env(safe-area-inset-right))!important}' +
      '.mgk-end .top{padding:14px 20px 16px!important;height:auto!important;min-height:0!important;overflow:visible!important}.mgk-end .top .t{line-height:1.02!important}.mgk-end .cells div{padding:10px 12px 12px!important;min-width:0}' +
      '.mgk-end .cells b{font-size:11px!important;letter-spacing:.1em!important;line-height:1.25!important}' +
      '.mgk-end .cells span{font-size:clamp(18px,5vw,34px)!important;overflow-wrap:normal;word-break:normal;white-space:nowrap}.mgk-end .cells b{white-space:nowrap}.mgk-end .cells div:first-child{flex:1.8}' +
      '.mgk-end .line{padding:12px 20px 14px!important}.mgk-end .best{padding:8px 20px!important}.mgk-end button{padding:0 20px!important}' +
      '.mgk.mgk-alert{left:calc(18px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;padding:14px 20px 16px!important}' +
      '.mgk.mgk-panel{padding:10px 20px 12px!important}.mgk.mgk-pop{padding:6px 14px 5px!important;white-space:nowrap}';
    document.head.appendChild(st); return st;
  }
  function buttons(kind) {
    if (kind === 'press') G.ui.buttons([
      { label: 'Ask', kind: 'black', aria: 'Ask a passerby for help', press: () => ask() },
      { label: 'Press', kind: 'red', aria: 'Press the crossing button', press: () => press() },
    ]);
    else if (kind === 'walk') G.ui.buttons([
      { label: 'Ask', kind: 'black', aria: 'Ask a passerby for help', press: () => ask() },
      { label: 'Hold to walk', kind: 'red', aria: 'Hold to walk across, let go to stop', press: () => { G.hold = true; }, release: () => { G.hold = false; } },
    ]);
    else G.ui.buttons([]);
  }
  // "Wait." is ALWAYS the computer voice, like a real crossing button (it goes straight to the phone's voice, never a recording)
  function sayWait() { try { G.tts('Wait.'); } catch (e) {} }
  function press() {
    if (!G || !G.playing || G.over) return;
    if (G.phase === 'wait') { G.sfx.press(-0.6); sayWait(); return; }
    if (G.phase !== 'press') return;
    G.btn.material.map = buttonTex(true); G.glow = 1; G.sfx.press(-0.6); G.buzz([30, 40, 30]);
    const [x, y] = G.S.P(BUTTON[0], BUTTON[1]); G.fx.add(x, y, '#ffe27a', 16, 0.2);
    if (!G.ptaxiGo) { G.ptaxiGo = true; G.sfx.car(1); }   // the yellow taxi pulls away, off to the right
    sayWait(); G.waitRep = 1.6; G.phase = 'wait'; G.waitT = G.bot ? 4.5 : 5 + Math.random() * 2; G.carT = 0.3; buttons('walk'); hud();
  }
  function walkOn() {
    G.phase = 'walk'; G.walkT = 0; G.signal.material.map = walkTex(); G.wtick = 0; G.sfx.city(0.02);
    G.say('Walk sign is on. Hold Walk to cross.'); G.ui.alert('WALK', 'Hold Walk to cross', 2, 'blue'); G.buzz([60, 40, 60]); hud();
  }
  function ask() {
    if (!G || !G.playing || G.over || G.phase === 'done') return;
    G.asks++; G.sfx.helper(); G.helperT = 3.2; G.lastSay = G.t; G.waitRep = 2.6;
    const lines = {
      press: ['The button is right next to you, on your left.', 'The button is to your left', 'A friendly passerby'],
      wait: ['Not yet. Wait for the walk sign.', 'Not yet', 'Wait for the walk sign'],
      walk: ['Go now. Hold Walk to cross.', 'Go now!', 'Hold Walk to cross'],
      flash: ['Keep going. You are almost there.', 'Keep going!', 'You’re almost there'],
      car: ['Stop! A car is running the red light!', 'STOP!', 'A car is running the red light'],
    }[G.phase];
    if (!lines) return;
    G.say(lines[0]); G.ui.alert(lines[1], lines[2], 2.4, G.phase === 'car' ? 'red' : 'black');
    if (G.phase === 'press') G.glow = 1.3;
  }
  // the car that runs the red light
  function runner() {
    G.sfx.lofiLevel(0.3);   // the music dips so you can hear the engine
    G.runner = { warn: 2.4, t: 0, x: 1.3, judged: false, swerve: 0 }; G.phase = 'car'; G.sfx.engine(2.4);
    G.say('Listen! A car!'); G.ui.alert('Listen! A car!', 'Let go of Walk to stop', 2.2, 'red'); G.ui.frame(true); G.buzz([100, 60, 100]); hud();
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0);
    K.finale(G, { won: true, kicker: 'You made it across', title: 'You crossed the street', line: G.work && G.work.quote, say: 'You made it across!',
      cells: [{ k: 'The car', v: G.close ? 'Close call' : 'Good stop' }, { k: 'Asked', v: `${G.asks}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.sfx.fade(0.3, 2); G.overT = 0;
  }

  return {
    title: 'Cross the street',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = hudCss(); G.tts = ctx.say || (() => {});
      Object.assign(G, { phase: 'intro', p: 0, back: 0, hold: false, asks: 0, early: 0, close: false, glow: 0, shake: 0, helperT: 0, lastSay: -9, carT: 0, hornT: 4,
        t0: 0, taxi: null, taxiT: 2.0, runner: null, ranLight: false, stepT: 0, steps: 0, startle: 0, tickT: 0.5, walkT: 0 });
      G.sfx = sounds(K.audio()); G.sfx.start(); G.sfx.lofiStart();   // the lofi starts with the intro
      try { G.voice = new Audio((ctx.work && ctx.work.statementAudio) || CLIP); G.voice.preload = 'auto'; } catch (e) { G.voice = null; }
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uStreak: { value: 0 }, uCalm: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      // the painting with its yellow taxi taken out (the taxi is its own piece now, so it can drive off)
      new THREE.TextureLoader().load(ART + 'clean.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; },
        undefined, () => new THREE.TextureLoader().load((ctx.work && ctx.work.image) || '', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; }));
      { const w = PTAXI[2] - PTAXI[0], hh = (PTAXI[3] - PTAXI[1]) * G.h;
        G.ptaxi = K.plane(null, w, hh, { order: 22, opacity: 0 }); G.ptaxi.position.z = 0.045; G.root.add(G.ptaxi); G.ptaxiX = 0; G.ptaxiV = 0;
        new THREE.TextureLoader().load(ART + 'taxi.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.ptaxi.material.map = t; G.ptaxi.material.needsUpdate = true; G.ptaxiReady = true; }); }
      // the cars (behind the pole), you, then the pole with its signals and the button in front of everything
      G.cab = K.sprite(taxiTex(), 0.4, { order: 22, opacity: 0 }); G.cab.scale.set(0.46, 0.46 * 220 / 512, 1); G.root.add(G.cab);
      G.lights = K.sprite(K.glowTex, 0.3, { color: '#fff3c0', additive: true, opacity: 0, order: 23 }); G.root.add(G.lights);
      G.me = K.sprite(walkerTex('stand', 0), 0.3, { order: 24, opacity: 0 }); G.root.add(G.me);
      G.pole = K.plane(null, 1.002, G.h + 0.002, { order: 30, opacity: 0 }); G.pole.position.z = 0.06; G.root.add(G.pole);
      new THREE.TextureLoader().load(ART + 'pole.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.pole.material.map = t; G.pole.material.needsUpdate = true; G.poleReady = true; });
      G.btnGlow = K.sprite(K.glowTex, 0.2, { color: '#ffe27a', additive: true, opacity: 0, order: 31 }); G.root.add(G.btnGlow);
      G.btn = K.sprite(buttonTex(false), 0.085, { order: 32 }); const [bx, by] = G.S.P(BUTTON[0], BUTTON[1]); G.btn.position.set(bx, by, 0.07); G.btnGlow.position.set(bx, by, 0.068); G.root.add(G.btn);
      G.signal = K.sprite(handTex(), 0.085, { order: 32 }); const [sx, sy] = G.S.P(SIGNAL[0], SIGNAL[1]); G.signal.position.set(sx, sy, 0.07); G.root.add(G.signal);
      G.help = K.sprite(helperTex(), 0.2, { order: 34, opacity: 0 }); const [hx, hy] = G.S.P(0.86, 0.86); G.help.position.set(hx, hy, 0.08); G.root.add(G.help);
      buttons('press'); hud();
      G.onGo = () => { G.t0 = G.t; G.sfx.start(); G.sfx.city(0.06); G.phase = 'press'; hud(); };
      K.intro(G, { title: 'Cross the street', how: SAY.how, say: SAY.intro });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over && G.overT > 5 ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      const traffic = G.phase === 'press' || G.phase === 'wait' || G.phase === 'intro';
      u.uStreak.value += ((traffic ? 1 : 0) - u.uStreak.value) * Math.min(1, dt * 3);
      u.uCalm.value += ((G.phase === 'walk' || G.phase === 'flash' ? 1 : 0) - u.uCalm.value) * Math.min(1, dt * 3);
      const vis = G.face.visible ? 1 : 0;
      // the city: cars whoosh past, horns, the taxi (behind the pole)
      if (G.playing && traffic) {
        G.carT -= dt; if (G.carT <= 0) { G.carT = 0.9 + Math.random() * 0.7; G.sfx.car(Math.random() < 0.5 ? 1 : -1); }
        G.hornT -= dt; if (G.hornT <= 0) { G.hornT = 3 + Math.random() * 4; if (Math.random() < 0.7) G.sfx.horn(Math.random() * 1.6 - 0.8); else G.sfx.bus(Math.random() * 1.6 - 0.8); }
        G.taxiT -= dt; if (G.taxiT <= 0 && !G.taxi && !G.runner) { G.taxiT = 2.6 + Math.random() * 2; G.taxi = { t: 0 }; }
      }
      // the button ticks (from your left) until you press it
      if (G.phase === 'press') { G.tickT -= dt; if (G.tickT <= 0) { G.tickT = 1; G.sfx.locate(-0.7); G.glow = Math.max(G.glow, 0.7); } }
      G.glow = Math.max(G.phase === 'press' ? 0.25 : 0, G.glow - dt * 0.9);
      G.btnGlow.material.opacity = Math.min(1, G.glow) * 0.9 * vis; G.btnGlow.scale.setScalar(0.2 + G.glow * 0.08);
      G.btn.material.opacity = vis && G.poleReady ? 1 : 0;
      // waiting: try to go early and a car honks you back
      if (G.phase === 'wait') {
        G.waitT -= dt; if (G.waitT <= 0) walkOn();
        // like a real accessible button: "Wait… wait… wait…" until it's time to walk
        G.waitRep -= dt; if (G.waitRep <= 0 && G.phase === 'wait') { G.waitRep = 1.6; if (G.t - G.lastSay > 2.2) sayWait(); }
        if (G.hold && G.p < 0.05) G.p += dt * 0.08;
        if (G.hold && G.p >= 0.05 && !G.honked) { G.honked = true; G.early++; G.sfx.horn(0.4, true); G.sfx.screech(0.4); G.buzz([200]); G.startle = 1; G.taxi = { t: 0.25 };
          G.lastSay = G.t; G.say('Wait for the walk sign!'); G.ui.alert('Wait for the walk sign!', 'A car honked you back', 1.8, 'red'); }
        if (!G.hold || G.honked) { G.p = Math.max(0, G.p - dt * 0.15); if (G.p === 0 && !G.hold) G.honked = false; }
      }
      // WALK: hold to walk, let go to stop
      if (G.phase === 'walk' || G.phase === 'flash' || G.phase === 'car') {
        G.walkT += dt; G.wtick -= dt;
        if (G.phase !== 'car' && G.wtick <= 0) { G.wtick = G.phase === 'walk' ? 0.13 : 0.5; G.sfx.walkTick(-0.6); }
        if (G.phase === 'walk' && G.walkT > WALK) { G.phase = 'flash'; hud(); }
        if (G.phase === 'flash') G.signal.material.map = Math.floor(G.walkT * 2) % 2 ? handTex() : walkTex();
        if (G.phase === 'flash' && G.walkT > WALK + FLASH && !G.lateSaid) { G.lateSaid = true; G.signal.material.map = handTex(); G.say('Keep going. The cars are waiting for you.'); }
        const moving = G.hold && G.startle <= 0;
        if (moving) {
          G.p = Math.min(1, G.p + SPEED * dt); G.stepT -= dt;
          if (G.stepT <= 0) { G.stepT = 0.42; G.steps++; G.sfx.step(G.steps); G.sfx.cane(G.steps % 2 ? -0.5 : 0.5); if (Math.floor(G.p * 10) !== G.lastTen) { G.lastTen = Math.floor(G.p * 10); hud(); } }
        }
        G.moving = moving;
        // a car runs the red light once you're on your way
        if (!G.ranLight && G.phase !== 'car' && G.p >= 0.2) { G.ranLight = true; runner(); }
        if (G.p >= 1 && G.phase !== 'done') { G.phase = 'done'; G.doneT = 0; buttons(''); G.sfx.win(); G.buzz([40, 30, 40, 30, 120]); popAt('YOU MADE IT!', 0.55); hud(); }
      }
      // the red-light runner: headlights and engine first, then it shoots across the crosswalk
      if (G.runner) {
        const R = G.runner;
        if (R.warn > 0) { R.warn -= dt; const k = 1 - Math.max(0, R.warn) / 2.4; const [x, y] = G.S.P(0.92, LANE - 0.05); G.lights.position.set(x, y, 0.055); G.lights.scale.setScalar(0.2 + k * 0.45); G.lights.material.opacity = Math.min(1, k * 1.4) * vis * (0.8 + 0.2 * Math.sin(G.t * 20)); }
        else {
          R.t += dt; R.x = lerp(1.3, -0.4, R.t / 1.0);
          if (!R.judged && R.x <= lerp(FROM[0], TO[0], G.p) + 0.1) {
            R.judged = true;
            if (G.p >= DANGER[0] && G.p <= DANGER[1]) {   // a close call: it swerves, horn blaring, and you jump back
              G.close = true; R.swerve = 1; G.sfx.screech(0); G.sfx.horn(0, true); G.buzz([250, 80, 250]); G.startle = 1.2; G.back = 0.1; G.shake = 1;
              G.say('Whoa! That car ran the red light. Are you OK? Keep going.'); G.ui.alert('That car ran the red light!', 'Close call. You’re OK', 2.4, 'red');
            } else { G.sfx.phew(); G.say('Good stop! That car ran the red light.'); G.ui.alert('Good stop!', 'That car ran the red light', 2.4, 'blue'); popAt('GOOD STOP!', 0.55); }
          }
          R.swerve = Math.max(0, R.swerve - dt * 1.2);
          G.lights.material.opacity = Math.max(0, G.lights.material.opacity - dt * 3);
          if (R.t > 1.0) { G.runner = null; G.ui.frame(false); G.sfx.lofiLevel(1); G.phase = G.walkT > WALK ? 'flash' : 'walk'; G.ui.alert('All clear', 'Keep going: hold Walk', 1.6, 'blue'); hud(); }
        }
      }
      // you jump back from the car
      if (G.back > 0) { const d = Math.min(G.back, dt * 0.25); G.back -= d; G.p = Math.max(0.3, G.p - d * 1.3); }
      G.startle = Math.max(0, G.startle - dt);
      // where things are drawn: the taxi / runner in the lane, you on the crosswalk, getting smaller as you go
      const fx = lerp(FROM[0], TO[0], G.p), fy = lerp(FROM[1], TO[1], G.p), h = lerp(0.30, 0.12, G.p);
      const sweep = G.moving ? Math.round(Math.sin(G.t * 7.5) * 2) / 2 : Math.round(Math.sin(G.t * 1.2) * 2) / 4;
      const pose = G.startle > 0 ? 'startle' : G.moving ? (G.steps % 2 ? 'stepL' : 'stepR') : 'stand';
      G.me.material.map = walkerTex(pose, sweep);
      const [mx, my] = G.S.P(fx, fy); G.me.scale.set(h * 256 / 384, h, 1); G.me.position.set(mx, my + h / 2 + (G.moving ? Math.abs(Math.sin(G.t * 7.5)) * 0.004 : 0), 0.05);
      G.me.material.opacity = vis * (G.over ? Math.max(0, 1 - G.overT) : 1);
      let carX = null, carLift = 0;
      if (G.taxi) { G.taxi.t += dt / 1.4; carX = lerp(1.25, -0.25, G.taxi.t); if (G.taxi.t >= 1) G.taxi = null; }
      if (G.runner && G.runner.warn <= 0) { carX = G.runner.x; carLift = G.runner.swerve * 0.05; }
      if (carX !== null) { const [cx, cy] = G.S.P(carX, LANE - carLift); const ch = 0.46 * 220 / 512; G.cab.position.set(cx, cy + ch * 0.45, 0.05); G.cab.material.opacity = vis; }
      else G.cab.material.opacity = 0;
      const meNear = fy > LANE;   // nearer than the lane: you're in front of the cars; past it, behind them
      G.me.renderOrder = meNear ? 24 : 21; G.cab.renderOrder = 22;
      // the painting's own taxi (we only see its back end): idling at first, then it pulls away to the right, off the screen
      if (G.ptaxiGo) { G.ptaxiV = Math.min(1.6, G.ptaxiV + dt * 1.8); G.ptaxiX += G.ptaxiV * dt; }
      { const [px, py] = G.S.P((PTAXI[0] + PTAXI[2]) / 2 + G.ptaxiX, (PTAXI[1] + PTAXI[3]) / 2);
        G.ptaxi.position.set(px, py + (G.ptaxiGo ? 0 : Math.sin(G.t * 30) * 0.0008), 0.045);
        G.ptaxi.material.opacity = vis && G.ptaxiReady && G.ptaxiX < 0.35 ? Math.min(1, (0.35 - G.ptaxiX) * 6) : 0; }
      G.pole.material.opacity = vis && G.poleReady ? 1 : 0;
      G.signal.material.opacity = vis && G.poleReady && !G.over ? 1 : 0; G.signal.scale.setScalar(0.085 * (G.phase === 'walk' ? 1 + Math.sin(G.t * 10) * 0.04 : 1));
      G.shake = Math.max(0, G.shake - dt * 2.5); G.root.position.x = Math.sin(G.t * 70) * 0.004 * G.shake;
      G.helperT = Math.max(0, G.helperT - dt); G.help.material.opacity = Math.min(1, G.helperT * 3) * vis; G.help.scale.setScalar(0.2 * (1 + Math.max(0, G.helperT - 2.9) * 1.5));
      if (G.phase === 'done') { G.doneT += dt; if (G.doneT > 2) finish(); }
      if (G.over) { G.overT += dt;
        if (G.overT > 2.2 && !G.clip) {   // Anthony's own words, as his quote comes up: the music dips right down under him, then comes back up gently
          G.sfx.fade(0.04, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.sfx.fade(0.22, 2); G.fadeAt = G.overT + 7; } };
          try { G.clip = G.voice || new Audio(CLIP); G.clip.currentTime = 0; G.clip.onended = back; G.clip.onerror = back; G.clip.play().catch(back); } catch (e) { G.clip = {}; back(); }
          G.clipSafety = G.overT + (G.clip.duration > 0 ? G.clip.duration : 22) + 0.8;
        }
        if (G.clip && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.sfx.fade(0.22, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.sfx.fade(0.0001, 3); } }
      // the robot: presses the button, tries to go early once, walks on WALK, stops for the car, then finishes
      if (G.bot && G.playing && !G.over) {
        G.botT = (G.botT || 1.2) - dt;
        if (G.phase === 'press' && G.botT <= 0) { ask(); press(); }
        if (G.phase === 'wait') G.hold = !G.botEarly && G.waitT < 2; if (G.phase === 'wait' && G.honked) G.botEarly = true;
        if (G.phase === 'walk' || G.phase === 'flash') G.hold = true;
        if (G.phase === 'car') G.hold = /[?&]close=1\b/.test(location.search);   // (&close=1: the robot keeps walking, to test the close call)
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || G.over) return;
      if (G.phase === 'press') { if (kind === 'down') press(); return; }   // tap anywhere to press the button
      if (kind === 'down') { const p = G.S.toBoard(ev, G.root); if (G.phase === 'wait' && p && Math.hypot(p.u - BUTTON[0], p.v - BUTTON[1]) < 0.08) { press(); return; } G.hold = true; }   // hold anywhere to walk
      if (kind === 'up') G.hold = false;
    },
    pause() { if (G) { G.paused = true; G.hold = false; G.sfx.city(0); G.sfx.lofiLevel(0); if (G.voice) try { G.voice.pause(); } catch (e) {} } },
    resume() { if (G) { G.paused = false; G.sfx.lofiLevel(1); if (G.playing && !G.over) G.sfx.city(0.04); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'button-street', phase: G.phase, playing: G.playing, over: G.over, p: +G.p.toFixed(2), close: G.close, early: G.early, asks: G.asks, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.sfx.stop(); if (G.voice) try { G.voice.pause(); } catch (e) {} if (G.clip && G.clip.pause) G.clip.pause(); if (G.css) G.css.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
