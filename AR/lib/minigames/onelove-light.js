// ONE LOVE (Anthony Ferraro): LIGHT UP ONE LOVE, a reggae "tap on the drop" game.
// "I just want to help other people… How can I reach more?" The seven red letters of ONE LOVE have gone dark.
// A warm, original reggae one-drop groove plays. The three ink birds from the painting fly down and perch on the letters,
// one letter at a time. Each bar the bird on the next letter sings two notes (beat 1, beat 2, from that letter's side),
// the letter fills with red from the bottom up, and then comes THE DROP (kick + rimshot on beat 3). Tap anywhere (or the
// big button) on the drop and the letter lights up red, hearts fly, and a new instrument joins the band:
//   O bass · N skank guitar · E bubble organ · L melodica · O horns · V shaker and drums · E choir and bells.
// Each letter that lights also brings a little more colour into the black-and-white world inside the hand, and the
// trees sway. Light all seven: ONE LOVE bounces to the full band, the birds circle the hand, the world inside it blooms,
// and Anthony's own words play at the end.
// Accessible: the two bird notes and the drop are the timing cue (the same every bar); the bird's notes come from the
// letter's side; early/late is spoken; the window gets wider after misses; phones buzz on the drop.
// Art: media/games/onelove/ clean.jpg (the painting with the letters and birds taken out) and info.png
// (R = the letters, G = inside the hand). Props: onelove-things.js.
import * as THREE from 'three';
import * as K from './kit.js';
import { birdTex, heartTex, heartTexC, noteTex, burstTex } from './onelove-things.js';
// each letter's own colour, for its glow, its burst, its notes and hearts
const PAL = ['#ff3b52', '#ffc83d', '#2fbf71', '#ff7ab8', '#ffa63d', '#9b6bff', '#36c5f0'];

const ART = new URL('../../media/games/onelove/', import.meta.url).href;
const CLIP = new URL('../../../3D/gallery/audio/wing_0_2.mp3', import.meta.url).href;   // Anthony, in his own words
// the seven letters: their box in the painting (u0, v0, u1, v1, from the top-left), what the narrator says
const LETTERS = [
  { ch: 'O', box: [0.0911, 0.2656, 0.1944, 0.3656], say: 'O.' },
  { ch: 'N', box: [0.2189, 0.2678, 0.3078, 0.3633], say: 'N.' },
  { ch: 'E', box: [0.3367, 0.2678, 0.4156, 0.3633], say: 'E. One.' },
  { ch: 'L', box: [0.4867, 0.2678, 0.5667, 0.3633], say: 'L.' },
  { ch: 'O', box: [0.5822, 0.2656, 0.6844, 0.3633], say: 'O.' },
  { ch: 'V', box: [0.7011, 0.2678, 0.7967, 0.3633], say: 'V.' },
  { ch: 'E', box: [0.8200, 0.2678, 0.8989, 0.3633], say: 'E. One Love!' },
];
const BAND = ['Bass', 'Guitar', 'Organ', 'Melodica', 'Horns', 'Drums', 'Choir'];
// the three birds, where they fly in the painting (u, v)
const NESTS = [[0.522, 0.204], [0.561, 0.249], [0.640, 0.246]];
const BPM = 74, BEAT = 60 / BPM, BAR = BEAT * 4, STEP = BEAT / 4;
const WIN0 = 0.2, WIN_MAX = 0.36, PERFECT = 0.09, BIRD = 0.11;
const LATE = 0.16;          // the letter pulses on the drop: an extra moment to catch it just after
const HOP = 0.022, JUMP = 0.044;   // the bird hops on beat 1, then jumps twice as high on beat 2 and lands on the drop
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, clean, info;
uniform vec4 uBox[7];
uniform float uLit[7], uScale[7];
uniform float uT, uA, uColor, uFill, uFillOn, uTarget, uFlash, uGlow, uSway, uWarm, uParty, uBeat;
uniform vec3 uHue[7];
vec4 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))); }
float inBox(vec2 q, vec4 b){ return step(b.x - 0.012, q.x) * step(q.x, b.z + 0.012) * step(b.y - 0.012, q.y) * step(q.y, b.w + 0.012); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float hand = at(info, p).g;
  // the trees and flowers inside the hand sway in a soft breeze
  float sw = hand * smoothstep(0.40, 0.62, p.y) * uSway;
  vec2 s = p + vec2(sin(p.y * 38.0 + uT * 1.3 + p.x * 9.0) * 0.0018, sin(p.x * 31.0 + uT * 0.9) * 0.0008) * sw;
  vec3 col = at(clean, s).rgb;
  // colour blooms into the black-and-white world inside the hand
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 tint = mix(vec3(0.20, 0.50, 0.22), vec3(1.0, 0.70, 0.80), smoothstep(0.60, 0.86, l));
  tint = mix(tint, vec3(0.52, 0.74, 0.98), smoothstep(0.52, 0.30, p.y) * smoothstep(0.45, 0.75, l));
  tint = mix(tint, vec3(0.62, 0.48, 0.32), smoothstep(0.90, 0.97, p.y));
  vec3 bloom = tint * (l * 1.3) + vec3(0.03);
  col = mix(col, bloom, uColor * hand * 0.8);
  // the cream paper around the hand: a warm sunrise spreads as the letters light, the drop flashes gold,
  // and at the party rainbow sun-rays turn slowly behind the hand
  float bgm = (1.0 - hand) * (1.0 - at(info, p).r);
  vec2 sc = vec2(0.5, 0.62); float sd = length((p - sc) * vec2(1.0, 1.15));
  vec3 sun = mix(vec3(1.0, 0.80, 0.42), vec3(1.0, 0.52, 0.56), smoothstep(0.12, 0.75, sd));
  col = mix(col, col * 0.55 + sun * 0.55, bgm * uWarm * 0.6 * (1.0 - smoothstep(0.35, 1.1, sd) * 0.5));
  col += vec3(1.0, 0.72, 0.28) * uBeat * 0.12 * bgm;
  float ang = atan(p.y - sc.y, p.x - sc.x);
  float ray = smoothstep(0.25, 0.95, sin(ang * 14.0 + uT * 0.7));
  vec3 hue = 0.5 + 0.5 * cos(6.2832 * (ang / 6.2832 + uT * 0.05 + vec3(0.0, 0.33, 0.67)));
  col = mix(col, col * 0.7 + hue * 0.45, bgm * uParty * ray * 0.38);
  // the letters: dark until lit; the next one fills with red toward the drop; lit ones glow and bounce on the beat
  for (int i = 0; i < 7; i++) {
    vec4 b = uBox[i]; vec2 c = (b.xy + b.zw) * 0.5;
    if (abs(p.x - c.x) > (b.z - b.x) * 0.8 || abs(p.y - c.y) > (b.w - b.y) * 0.85) continue;
    float sc = uScale[i], lit = uLit[i];
    vec2 q = c + (p - c) / sc;
    float a = inBox(q, b) * at(info, q).r;
    vec2 q2 = c + (p - c) / (sc * 1.12);
    float a2 = inBox(q2, b) * at(info, q2).r;
    col = mix(col, uHue[i], max(a2 - a, 0.0) * lit * uGlow * 0.75);   // each letter glows in its own colour
    vec3 red = at(map, q).rgb * (1.0 + 0.12 * lit * uGlow);
    float isT = 1.0 - step(0.5, abs(float(i) - uTarget));
    float filled = isT * uFillOn * step(b.w - (b.w - b.y) * uFill, q.y);
    vec3 dark = vec3(0.16, 0.155, 0.15);
    vec3 unl = mix(dark, vec3(0.80, 0.16, 0.24), filled * 0.8);
    unl = mix(unl, vec3(1.0, 0.42, 0.46), isT * uFlash);
    col = mix(col, mix(unl, red, lit), a);
  }
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the band: an original reggae one-drop groove, built up one instrument per letter ───────────────────────── */
function band(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp).connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p) => { if (!ac.createStereoPanner) return master; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(master); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, lp = 0, vib = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.2; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.002 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // C – G – Am – F, round and round
  const CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]], ROOT = [36, 43, 45, 41];
  const MEL = [[[0, 76, 3], [4, 79, 2], [6, 76, 2], [8, 74, 4], [12, 72, 4]], [[0, 74, 3], [4, 71, 2], [6, 74, 2], [8, 79, 6]],
    [[0, 72, 3], [4, 76, 2], [6, 72, 2], [8, 69, 4], [12, 72, 2], [14, 74, 2]], [[0, 72, 4], [4, 69, 4], [8, 72, 2], [10, 74, 2], [12, 76, 4]]];
  const B = {
    layers: 0, bar: 0, step: 0, next: 0, timer: null, cue: null, onBar: null, party: false,
    // the bird's two notes: a quick rising chirp from the letter's side
    chirp(t, p, hi = 1) { tone(t, 2300 * hi, 0.07, { type: 'sine', vol: 0.16, p, slide: 3300 * hi }); tone(t + 0.08, 2700 * hi, 0.09, { type: 'sine', vol: 0.14, p, slide: 3600 * hi }); },
    // THE DROP: a deep kick and a sharp rimshot, together on beat 3
    drop(t) { tone(t, 95, 0.42, { vol: 0.85, slide: 38, att: 0.003 }); noise(t, 0.07, { freq: 1900, q: 3.5, vol: 0.55 }); tone(t, 820, 0.05, { type: 'triangle', vol: 0.18 }); },
    light(t, i, p) {   // a letter lights: a bright rising arpeggio, from its side
      [72, 76, 79, 84].forEach((m, k) => tone(t + k * 0.06, midi(m + (i % 3) * 2), 0.5, { type: 'triangle', vol: 0.12, p }));
      tone(t, midi(96), 0.8, { vol: 0.04, p });
    },
    miss(t, p) { tone(t, 180, 0.22, { type: 'triangle', vol: 0.16, p, slide: 120 }); noise(t, 0.08, { freq: 400, vol: 0.12, p }); },
    sched(step, t) {
      const L = B.layers, bar = B.bar, ch = CH[bar % 4], r = ROOT[bar % 4], sw = (step % 4 === 2) ? STEP * 0.18 : 0;
      if (step === 0 && B.onBar) B.onBar(bar, t);
      // drums: soft hi-hats on the eighths, and the one-drop on beat 3
      if (step % 2 === 0) noise(t + sw, 0.045, { freq: 7600, type: 'highpass', vol: step % 4 === 0 ? 0.05 : 0.08, p: 0.15 });
      if (step === 8) B.drop(t);
      if (B.cue && (step === 0 || step === 4)) B.cue(step, t);
      if (L >= 1) {   // O: the bass, round and warm, never on beat 1
        const bl = { 2: r, 6: r + 7, 8: r, 12: r + 12, 14: r + 7 };
        if (bl[step] !== undefined) tone(t, midi(bl[step]), step === 8 ? 0.42 : 0.3, { type: 'triangle', vol: 0.34, lp: 520, att: 0.01 });
      }
      if (L >= 2 && (step === 4 || step === 12)) ch.forEach(m => tone(t, midi(m), 0.13, { type: 'square', vol: 0.035, lp: 2400, p: 0.4 }));   // N: the skank
      if (L >= 3 && step % 4 === 2) ch.forEach(m => tone(t + sw, midi(m - 12), 0.16, { type: 'sine', vol: 0.05, p: -0.4 }));   // E: the organ bubble
      if (L >= 4) for (const [st, m, d] of MEL[bar % 4]) if (st === step) tone(t, midi(m), d * STEP * 0.95, { type: 'sawtooth', vol: 0.05, lp: 1700, att: 0.03, vib: 0.008, p: -0.1 });   // L: the melodica
      if (L >= 5 && (step === 10 || step === 14)) [ch[1] + 12, ch[2] + 12].forEach(m => tone(t, midi(m), 0.16, { type: 'sawtooth', vol: 0.035, lp: 2000, p: 0.25 }));   // O: the horns
      if (L >= 6) {   // V: shaker, and a tom fill at the end of every 4th bar
        noise(t, 0.04, { freq: 6200, type: 'highpass', vol: step % 2 ? 0.035 : 0.06, p: 0.55 });
        if (bar % 4 === 3 && step >= 12) tone(t, [200, 170, 140, 115][step - 12], 0.2, { vol: 0.28, slide: 70 });
      }
      if (L >= 7) {   // E: the choir and the bells
        if (step === 0) ch.concat([ch[0] + 12]).forEach(m => tone(t, midi(m), BAR * 0.95, { type: 'triangle', vol: 0.028, att: 0.35, vib: 0.004 }));
        if (step === 8 || (B.party && step % 4 === 2)) tone(t, midi(ch[2] + 24), 0.6, { vol: 0.05, p: (Math.random() - 0.5) });
      }
      if (B.party && step % 2 === 1 && Math.random() < 0.5) B.chirp(t, Math.random() * 1.6 - 0.8, 0.9 + Math.random() * 0.3);
    },
    tick() {
      const now = ac.currentTime;
      while (B.next < now + 0.18) { B.sched(B.step, B.next); B.next += STEP; B.step++; if (B.step === 16) { B.step = 0; B.bar++; } }
    },
    start() { B.next = ac.currentTime + 0.12; B.step = 0; master.gain.setTargetAtTime(0.85, ac.currentTime, 0.05); clearInterval(B.timer); B.timer = setInterval(B.tick, 25); B.tick(); },
    hold() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    resume() { if (B.step !== 0) { B.step = 0; B.bar++; } B.start(); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    stop() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { try { master.disconnect(); } catch (e) {} }, 600); },
  };
  return B;
}

export function lightUpOneLoveGame() {
  let G = null;
  const panOf = (i) => ((LETTERS[i].box[0] + LETTERS[i].box[2]) / 2 - 0.5) * 1.7;
  const heard = () => { const ac = K.audio(); return ac ? ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) : G.t; };

  // pop-ups go over the bottom of the painting, so the letters and the birds stay clear
  function popLow(text) {
    let y = innerHeight * 0.62;
    try {
      const [x0, y0] = G.S.P(0.5, 0.6), v = new THREE.Vector3(x0, y0, 0.05); G.root.localToWorld(v); v.project(G.camera);
      const r = G.renderer.domElement.getBoundingClientRect(); y = r.top + (1 - v.y) / 2 * r.height;
    } catch (e) {}
    G.ui.pop(text, innerWidth / 2, Math.min(y, innerHeight - 270));
  }
  function hudCss() {
    const st = document.createElement('style'); st.dataset.onelove = '1';
    st.textContent = '.mgk.mgk-alert,.mgk.mgk-count{top:auto!important;bottom:calc(152px + env(safe-area-inset-bottom))!important}' +
      // a little breathing room for every text box: the finish card, its score cells, the quote, the panel, alerts and pop-ups
      '.mgk.mgk-end{left:calc(18px + env(safe-area-inset-left))!important;right:calc(18px + env(safe-area-inset-right))!important}' +
      '.mgk-end .top{padding:14px 20px 16px!important;height:auto!important;min-height:0!important;overflow:visible!important}.mgk-end .top .t{line-height:1.02!important}.mgk-end .cells div{padding:10px 12px 12px!important;min-width:0}' +
      '.mgk-end .cells b{font-size:11px!important;letter-spacing:.1em!important;line-height:1.25!important}' +
      '.mgk-end .cells span{font-size:clamp(22px,7vw,38px)!important;overflow-wrap:normal;word-break:normal}.mgk-end .cells div:first-child{flex:1.4}' +
      '.mgk-end .line{padding:12px 20px 14px!important}.mgk-end .best{padding:8px 20px!important}.mgk-end button{padding:0 20px!important}' +
      '.mgk.mgk-alert{left:calc(18px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;padding:14px 20px 16px!important}' +
      '.mgk.mgk-panel{padding:10px 20px 12px!important}.mgk.mgk-pop{padding:6px 14px 5px!important;white-space:nowrap}';
    document.head.appendChild(st); return st;
  }
  function hud() {
    const n = G.lit;
    G.ui.panel('Light up One Love', `${n}<small>of 7 lit</small>`, { segs: [n, 7], sub: G.phase === 'party' ? 'One Love!' : G.listen ? 'Listen…' : 'Two bird notes, then tap on the drop' });
  }
  // a bird takes off and flies (in an arc) to sit on top of a letter
  function fly(b, i) {
    const L = LETTERS[i].box, to = [(L[0] + L[2]) / 2 + 0.006, L[1] - BIRD * 0.36];
    Object.assign(b, { from: [b.u, b.v], to, flyT: 0, flying: true, perch: i });
  }
  function nextLetter() {
    const i = G.lit; if (i >= 7) return;
    G.target = i; G.misses = 0; G.hinted = false; G.idleBars = 0;
    G.bird = G.birds[i % 3]; fly(G.bird, i);
  }
  // the band calls this at the start of every bar (in audio time)
  function onBar(bar, t) {
    G.barStarts.push(t); if (G.barStarts.length > 8) G.barStarts.shift();
    if (G.phase === 'play' && G.target >= 0 && t >= G.activeFrom - 0.01) {
      G.drops.push({ t: t + 2 * BEAT, bar, tapped: false }); if (G.drops.length > 6) G.drops.shift();
      if (t > G.activeFrom + 0.01) { G.idleBars++; if (G.idleBars === 3 && !G.hinted) { G.hinted = true; G.say('Listen for the drop, then tap.'); } }
    }
    if (G.phase === 'party') { G.partyBars++; if (G.partyBars === 3) G.endAt = t + BAR * 0.5; }
  }
  function cue(step, t) {
    if (G.phase !== 'play' || G.target < 0 || t < G.activeFrom - 0.01) return;
    G.band.chirp(t, panOf(G.target), step === 0 ? 1 : 1.12);
    G.singAt.push(t);
  }
  function tap() {
    if (!G || !G.playing || G.over || G.phase !== 'play' || G.target < 0) return;
    const now = heard();
    const d = G.drops.filter(x => !x.tapped).map(x => ({ x, e: now - x.t })).sort((a, b) => Math.abs(a.e) - Math.abs(b.e))[0];
    G.taps++;
    if (!d || now < G.activeFrom - 0.25) { popLow('Listen…'); return; }
    if (d.e >= -G.win && d.e <= G.win + LATE) { d.x.tapped = true; hit(Math.abs(d.e) <= PERFECT); }
    else miss(d.e);
  }
  function hit(perfect) {
    const i = G.target, L = LETTERS[i], ac = K.audio();
    G.lit++; G.target = -1; if (perfect) G.perfect++;
    G.litT[i] = 0; G.flash = 1;
    G.band.light(ac.currentTime, i, panOf(i)); G.band.layers = G.lit; G.buzz([40, 30, 90]);
    const [x, y] = G.S.P((L.box[0] + L.box[2]) / 2, (L.box[1] + L.box[3]) / 2);
    G.fx.add(x, y, PAL[i], 30, 0.36); G.fx.add(x, y, '#fff3c0', 12, 0.25);
    const b = K.sprite(burstTex(), 0.05, { order: 31, additive: true }); b.position.set(x, y, 0.065); G.root.add(b); G.bursts.push({ s: b, t: 0 });   // a burst of coloured rays
    for (let k = 0; k < 5; k++) floaty(x, y, k % 2 ? PAL[i] : PAL[(i + 2 + k) % 7], false);   // hearts in the letter's colours
    for (let k = 0; k < 4; k++) floaty(x, y, PAL[(i + k) % 7], true);                          // and music notes
    popLow(perfect ? 'PERFECT!' : L.ch + '!');
    G.ui.alert(L.ch + ' is lit!', BAND[i] + ' joins the band', 1.6, 'red');
    G.say(L.say);
    // the next letter starts after one bar of listening to the new instrument
    const bs = G.barStarts[G.barStarts.length - 1] || ac.currentTime;
    G.activeFrom = bs + BAR * 2; G.listen = true;
    if (G.lit >= 7) { G.phase = 'party'; G.partyBars = 0; G.band.party = true; G.band.cue = null; G.birds.forEach((b, k) => { b.circle = true; b.flying = true; b.ph = k * 2.09; }); }
    else setTimeout(() => { if (G && G.phase === 'play') nextLetter(); }, 450);
    hud();
  }
  // a heart or a music note that floats up from (x, y), wobbling, then fades
  function floaty(x, y, color, note) {
    const s = K.sprite(note ? noteTex(color) : heartTexC(color), (note ? 0.058 : 0.046) + Math.random() * 0.02, { order: 32 }); s.position.set(x, y, 0.07); G.root.add(s);
    G.hearts.push({ s, vx: (Math.random() - 0.5) * 0.5, vy: 0.25 + Math.random() * 0.35, t: 0, life: 1.5 + Math.random() * 0.6, rot: note ? (Math.random() - 0.5) * 1 : (Math.random() - 0.5) * 3, ph: Math.random() * 6, wob: note });
  }
  function miss(e) {
    const ac = K.audio(), i = G.target;
    G.misses++; G.missN++; G.band.miss(ac.currentTime, panOf(i)); G.buzz(15); G.shake = 1;
    if (G.misses >= 2) G.win = Math.min(WIN_MAX, G.win + 0.04);   // easier after misses
    if (G.t - G.lastSay > 2.5) { G.lastSay = G.t; G.say(Math.abs(e) > BEAT * 1.2 ? 'Wait for the drop.' : e < 0 ? 'A little early.' : 'A little late.'); }
    popLow(Math.abs(e) > BEAT * 1.2 ? 'WAIT FOR THE DROP' : e < 0 ? 'EARLY' : 'LATE');
  }
  function help() {
    if (!G || !G.playing || G.over) return;
    G.win = Math.min(WIN_MAX, G.win + 0.06); G.lastSay = G.t;
    G.say('The bird sings two notes. Then comes the drop. Tap on the drop.');
    G.ui.alert('Two notes, then DROP', 'Tap on the drop, anywhere on the screen', 2.4, 'black');
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('one-love:light', G.perfect, 'higher');
    K.finale(G, { won: true, kicker: 'You lit it up', title: 'One Love', line: G.work && G.work.quote, best: r.isBest && G.perfect > 0, say: 'You lit up One Love.',
      cells: [{ k: 'Lit', v: '7/7' }, { k: 'Perfect', v: `${G.perfect}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.band.fade(0.35, 2); G.overT = 0;
  }

  return {
    title: 'Light up ONE LOVE',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = hudCss();
      Object.assign(G, { phase: 'intro', lit: 0, target: -1, activeFrom: 1e9, drops: [], barStarts: [], singAt: [], misses: 0, missN: 0, perfect: 0, taps: 0,
        win: WIN0, lastSay: -9, hinted: false, idleBars: 0, listen: true, flash: 0, shake: 0, hearts: [], bursts: [], partyBeat: -1, litT: LETTERS.map(() => -1), color: 0, t0: 0, partyBars: 0, endAt: 0 });
      G.band = band(K.audio()); G.band.onBar = onBar; G.band.cue = cue;
      try { G.voice = new Audio((ctx.work && ctx.work.statementAudio) || CLIP); G.voice.preload = 'auto'; } catch (e) { G.voice = null; }   // Anthony, ready for the end
      // the painting, alive
      G.uni = { map: { value: null }, clean: { value: null }, info: { value: null },
        uBox: { value: LETTERS.map(L => new THREE.Vector4(...L.box)) }, uLit: { value: LETTERS.map(() => 0) }, uScale: { value: LETTERS.map(() => 1) },
        uT: { value: 0 }, uA: { value: 0 }, uWarm: { value: 0 }, uParty: { value: 0 }, uBeat: { value: 0 }, uHue: { value: PAL.map(c => new THREE.Color(c)) }, uColor: { value: 0 }, uFill: { value: 0 }, uFillOn: { value: 0 }, uTarget: { value: -1 }, uFlash: { value: 0 }, uGlow: { value: 0 }, uSway: { value: 1 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const Ld = new THREE.TextureLoader(); let need = 3; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => Ld.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      raw((ctx.work && ctx.work.image) || ART + 'clean.jpg', 'map'); raw(ART + 'clean.jpg', 'clean'); raw(ART + 'info.png', 'info');
      // the three birds, flying where they fly in the painting
      G.birds = NESTS.map(([u, v], k) => {
        const s = K.sprite(birdTex('mid'), BIRD, { order: 30 }); s.position.z = 0.06; G.root.add(s);
        return { s, u, v, home: [u, v], ph: k * 1.7, flying: false, perch: -1, face: 1, flyT: 0, circle: false };
      });
      G.ui.buttons([
        { label: 'Tap on the drop', kind: 'red', aria: 'Tap on the drop to light the letter', press: () => tap() },
        { label: 'Help', kind: 'black', aria: 'Help: how to catch the drop', press: () => help() },
      ]);
      hud();
      G.onGo = () => {
        G.phase = 'play'; G.t0 = G.t; G.band.start();
        nextLetter();
        const ac = K.audio(); G.activeFrom = ac.currentTime + 0.12 + BAR;   // listen to one bar of the groove first
      };
      K.intro(G, { title: 'Light up ONE LOVE', how: 'A bird lands on each letter and sings two notes, then comes the drop. Tap on the drop to light the letter.',
        say: 'Light up One Love. The letters have gone dark. A bird lands on each letter and sings two notes. Then comes the drop. Tap anywhere on the drop to light the letter.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni, now = heard();
      u.uT.value = G.t; u.uA.value += ((G.over && G.overT > 4 ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // where we are in the bar (audio time, as heard)
      const bs = G.barStarts.filter(x => x <= now).pop();
      const beatPos = bs !== undefined ? (now - bs) / BEAT : 0, beatFrac = beatPos % 1, playing = G.phase === 'play' || G.phase === 'party' || G.over;
      if (G.listen && now >= G.activeFrom - BEAT * 0.25) { G.listen = false; if (G.phase === 'play') hud(); }
      // the letters: lit ones flash in, then bounce on every beat (harder on the drop)
      const active = G.phase === 'play' && G.target >= 0 && now >= G.activeFrom - 0.02;
      // on the drop the waiting letter PULSES (twice): that's when to tap, and it keeps the window open a moment longer
      const pulse = active && beatPos >= 2 && beatPos < 3 ? Math.exp(-(beatPos - 2) * 3.2) * (0.75 + 0.25 * Math.cos((beatPos - 2) * Math.PI * 4)) : 0;
      const bounce = playing && bs !== undefined ? Math.exp(-beatFrac * 6) * (Math.floor(beatPos) === 2 ? 0.12 : 0.05) : 0;
      LETTERS.forEach((L, i) => {
        if (G.litT[i] >= 0) { G.litT[i] += dt; const k = Math.min(1, G.litT[i] / 0.35); u.uLit.value[i] = k; u.uScale.value[i] = 1 + bounce * (G.phase === 'party' ? 1.6 : 1) + Math.max(0, 0.3 - G.litT[i]) * 0.9; }
        else u.uScale.value[i] = 1 + (i === G.target ? G.shake * 0.03 * Math.sin(G.t * 60) + pulse * 0.2 : 0);
      });
      G.shake = Math.max(0, G.shake - dt * 4);
      u.uGlow.value = 0.6 + bounce * 4;
      // colour: the sunrise grows with every letter; a gold flash on each drop; the party's rainbow rays
      const warmTo = G.phase === 'party' || G.over ? 1 : G.lit / 7;
      u.uWarm.value += (warmTo - u.uWarm.value) * Math.min(1, dt * 1.5);
      u.uParty.value += ((G.phase === 'party' || G.over ? 1 : 0) - u.uParty.value) * Math.min(1, dt * 1.2);
      u.uBeat.value = playing && bs !== undefined && Math.floor(beatPos) === 2 && (G.lit > 0 || G.target >= 0) ? Math.exp(-beatFrac * 5) : 0;
      // at the party, notes and hearts in every colour rise on each beat
      if (G.phase === 'party' && bs !== undefined && Math.floor(beatPos) !== G.partyBeat) { G.partyBeat = Math.floor(beatPos);
        for (let k = 0; k < 3; k++) { const L = LETTERS[Math.floor(Math.random() * 7)], [x, y] = G.S.P((L.box[0] + L.box[2]) / 2, L.box[1]); floaty(x, y, PAL[Math.floor(Math.random() * 7)], Math.random() < 0.5); } }
      // the next letter fills with red from the bottom toward the drop, then drains
      u.uTarget.value = G.target; u.uFillOn.value = active ? 1 : 0;
      u.uFill.value = active ? (beatPos <= 2 ? Math.pow(Math.min(1, beatPos / 2), 1.3) : beatPos < 2.45 ? 1 : Math.max(0, 1 - (beatPos - 2.45) * 1.5)) : 0;
      G.flash = Math.max(0, G.flash - dt * 3); u.uFlash.value = pulse * 0.85;
      // colour comes into the world inside the hand with every letter
      const want = G.phase === 'party' || G.over ? 1 : G.lit / 7 * 0.6;
      G.color += (want - G.color) * Math.min(1, dt * 1.2); u.uColor.value = G.color;
      // the birds
      for (const b of G.birds) {
        let pose = 'mid', bob = 0, sx = 1, sy = 1;
        if (b.circle) {   // the finale: all three circle the hand
          b.ph += dt * 0.9; const tu = 0.5 + Math.cos(b.ph) * 0.3, tv = 0.42 + Math.sin(b.ph) * 0.2;
          b.face = Math.sin(b.ph) > 0 ? -1 : 1; b.u += (tu - b.u) * Math.min(1, dt * 2.5); b.v += (tv - b.v) * Math.min(1, dt * 2.5);
          pose = ['up', 'mid', 'down', 'mid'][Math.floor(G.t * 9 + b.ph) % 4];
        } else if (b.flying) {
          b.flyT += dt / 1.4; const k = Math.min(1, b.flyT), e = k * k * (3 - 2 * k);
          b.u = b.from[0] + (b.to[0] - b.from[0]) * e; b.v = b.from[1] + (b.to[1] - b.from[1]) * e - Math.sin(k * Math.PI) * 0.08;
          b.face = b.to[0] >= b.from[0] ? 1 : -1;
          pose = k > 0.88 ? 'perch' : ['up', 'mid', 'down', 'mid'][Math.floor(G.t * 10) % 4];
          if (k >= 1) { b.flying = false; K.sfx.ping(panOf(b.perch), 1760, 0.05); }
        } else if (b.perch >= 0) {   // sitting on a letter, bobbing to the beat; singing on its notes
          pose = 'perch'; bob = playing ? Math.exp(-beatFrac * 5) * 0.006 : 0;
          if (b === G.bird && G.singAt.some(x => now >= x && now - x < 0.22)) { pose = 'sing'; bob += 0.004; }
          if (b === G.bird && active) {
            if (beatPos < 0.45) bob = HOP * Math.sin(Math.PI * beatPos / 0.45);                       // beat 1: a little hop
            else if (beatPos >= 1 && beatPos < 2) {                                                   // beat 2: up twice as high…
              const k = beatPos - 1; bob = JUMP * Math.sin(Math.PI * k);
              pose = k < 0.45 ? 'up' : k < 0.85 ? 'down' : 'perch';
            } else if (beatPos >= 2 && beatPos < 2.3) {                                               // …and lands right on the drop
              const k = (beatPos - 2) / 0.3; sy = 1 - 0.18 * Math.sin(Math.PI * k); sx = 1 + 0.12 * Math.sin(Math.PI * k);
              bob = -BIRD * 0.5 * (1 - sy);
              if (b.landBar !== bs) { b.landBar = bs; const [lx, ly] = G.S.P(b.u, b.v + BIRD * 0.4); G.fx.add(lx, ly, '#fff4dc', 10, 0.18); }
            }
          }
          if (b.perch < G.lit && b !== G.bird && G.phase === 'party') pose = 'sing';
        } else {          // still flying where it is in the painting, gliding in little loops
          b.u = b.home[0] + Math.cos(G.t * 0.8 + b.ph) * 0.012; b.v = b.home[1] + Math.sin(G.t * 1.1 + b.ph) * 0.008;
          pose = ['up', 'mid', 'down', 'mid'][Math.floor(G.t * 5 + b.ph * 3) % 4]; b.face = 1;
        }
        b.s.material.map = birdTex(pose);
        const [x, y] = G.S.P(b.u, b.v); b.s.position.set(x, y + bob, 0.06);
        b.s.scale.set(BIRD * b.face * sx, BIRD * sy, 1); b.s.material.opacity = G.face.visible ? 1 : 0;
      }
      G.singAt = G.singAt.filter(x => now - x < 1);
      // hearts
      for (let i = G.hearts.length - 1; i >= 0; i--) { const h = G.hearts[i]; h.t += dt; h.vy -= dt * 0.18;
        h.s.position.x += h.vx * dt * 0.3 + (h.wob ? Math.sin(h.t * 5 + h.ph) * 0.0012 : 0); h.s.position.y += h.vy * dt * 0.3; h.s.material.rotation += h.rot * dt; h.s.material.opacity = Math.max(0, 1 - h.t / h.life);
        if (h.t > h.life) { G.root.remove(h.s); h.s.material.dispose(); G.hearts.splice(i, 1); } }
      for (let i = G.bursts.length - 1; i >= 0; i--) { const b = G.bursts[i]; b.t += dt / 0.9; const k = Math.min(1, b.t);
        b.s.scale.setScalar(0.05 + k * 0.4); b.s.material.rotation += dt * 1.2; b.s.material.opacity = 1 - k * k;
        if (k >= 1) { G.root.remove(b.s); b.s.material.dispose(); G.bursts.splice(i, 1); } }
      // the party, then the finale, then Anthony in his own words
      if (G.phase === 'party' && G.endAt && K.audio().currentTime >= G.endAt) finish();
      if (G.over) { G.overT += dt;
        if (G.overT > 2.2 && !G.clip) {   // Anthony's own words, as his quote comes up: the music dips right down under him, then comes back up gently
          G.band.fade(0.04, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.band.fade(0.22, 2); G.fadeAt = G.overT + 7; } };
          try { G.clip = G.voice || new Audio(CLIP); G.clip.currentTime = 0; G.clip.onended = back; G.clip.onerror = back; G.clip.play().catch(back); } catch (e) { G.clip = {}; back(); }
          G.clipSafety = G.overT + (G.clip.duration > 0 ? G.clip.duration : 22) + 0.8;
        }
        if (G.clip && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.band.fade(0.22, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.band.fade(0.0001, 3); } }
      // the robot: taps right on each drop (a little off now and then)
      if (G.bot && G.phase === 'play' && G.target >= 0) {
        const d = G.drops.find(x => !x.tapped && now >= x.t - 0.01 && now - x.t < 0.12 && x.t >= G.activeFrom - 0.02);
        if (d && G.botLast !== d) { G.botLast = d; tap(); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      tap();   // anywhere on the screen counts
    },
    pause() { if (G) { G.paused = true; G.band.hold(); } },
    resume() { if (G) { G.paused = false; if (G.phase === 'play' || G.phase === 'party') { G.band.resume(); if (G.phase === 'play' && G.activeFrom < K.audio().currentTime + BAR) G.activeFrom = K.audio().currentTime + 0.12 + BAR; } } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'onelove-light', phase: G.phase, playing: G.playing, over: G.over, lit: G.lit, target: G.target, perfect: G.perfect, misses: G.missN, taps: G.taps, win: +G.win.toFixed(2), t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.band.stop(); if (G.clip && G.clip.pause) G.clip.pause(); if (G.voice) try { G.voice.pause(); } catch (e) {} G.hearts.forEach(h => h.s.material.dispose()); G.bursts.forEach(b => b.s.material.dispose()); }
      if (G && G.css) G.css.remove();
      K.cleanup(G); G = null;
    },
  };
}
