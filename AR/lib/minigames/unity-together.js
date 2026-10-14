// EMBRACING UNITY (Shardasia Hadley): HOLD ON TOGETHER.
// Shardasia is the oldest of six, in a family that moves together. Part 1: link the family hand to hand. Drag from one
// person to the one next to them (or press Link): a golden thread joins their hands, and every link adds a note to the
// family's chord, so the more of them you join, the richer the harmony. All ten linked, and the colours bloom.
// Part 2: the family walks through the busy city together, stepping in time to the lofi. Things happen on the way
// (a busy crossing, a loud bus, a puppy across the street) and someone lets go and drifts off into the crowd.
// You hear them call from their side: tap them, or press the Left or Right button, to bring them back into the chain.
// Bring everyone home together.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/unity/';
// the family, left to right (u, v from the top-left of the painting): their box, and their left and right hands
const FAM = [
  { id: 'grandpa', name: 'Grandpa', box: [0.0332, 0.5, 0.1406, 0.96], L: [0.045, 0.73], R: [0.14, 0.73], note: 48, adult: true },
  { id: 'red', name: 'little sister in red', box: [0.0801, 0.7197, 0.1592, 0.9668], L: [0.085, 0.83], R: [0.155, 0.83], note: 55 },
  { id: 'floral', name: 'sister in blue flowers', box: [0.1455, 0.6094, 0.2412, 0.9736], L: [0.155, 0.77], R: [0.238, 0.77], note: 60 },
  { id: 'shardasia', name: 'Shardasia', box: [0.2422, 0.5928, 0.3389, 0.9746], L: [0.255, 0.77], R: [0.335, 0.77], note: 64 },
  { id: 'little', name: 'little one in red flowers', box: [0.3594, 0.7021, 0.4551, 0.9648], L: [0.372, 0.83], R: [0.452, 0.82], note: 67 },
  { id: 'dad', name: 'Dad', box: [0.4316, 0.3232, 0.6455, 0.9746], L: [0.452, 0.69], R: [0.638, 0.68], note: 43, adult: true },
  { id: 'brother', name: 'brother', box: [0.5781, 0.6592, 0.6943, 0.9746], L: [0.596, 0.84], R: [0.69, 0.84], note: 71 },
  { id: 'sister', name: 'sister in blue', box: [0.6943, 0.6543, 0.793, 0.9688], L: [0.708, 0.83], R: [0.79, 0.84], note: 74 },
  { id: 'baby', name: 'baby sister', box: [0.8154, 0.7334, 0.8975, 0.958], L: [0.835, 0.86], R: [0.902, 0.82], note: 76 },
  { id: 'mom', name: 'Mom', box: [0.8438, 0.4014, 0.9697, 0.9502], L: [0.875, 0.69], R: [0.975, 0.7], note: 52, adult: true },
];
const N = FAM.length;
// the walk: three moments on the way home, and who lets go in each
const EVENTS = [
  { say: 'A busy crossing. Hold on tight!', who: ['red', 'brother'], gap: 3.2, snd: 'traffic' },
  { say: 'A loud bus rumbles past. Someone gets scared and lets go!', who: ['little', 'sister', 'floral'], gap: 2.6, snd: 'bus' },
  { say: 'A puppy across the street! The little ones want to say hi.', who: ['baby', 'red', 'brother'], gap: 2.1, snd: 'dog' },
];
const WAIT = 5.5;   // how long someone drifts before finding their own way back

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting: each of the family steps up and down as they walk, glows when you touch them, fades out when they drift
// off into the crowd; the whole scene moves closer as they walk toward you, and the colours bloom when they're all linked
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, ids, bg;
uniform float uBob[11], uGlow[11], uGone[11];
uniform float uZoom, uBloom, uT, uA, uH;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
int who(vec2 p){ return int(floor(at(ids, p).r * 255.0 / 20.0 + 0.5)); }
float pick(float a[11], int i){ float v = 0.0; for (int k = 0; k < 11; k++) if (k == i) v = a[k]; return v; }
void main(){
  vec2 p0 = vec2(vUv.x, 1.0 - vUv.y);
  vec2 c = vec2(0.5, 0.78), p = c + (p0 - c) / uZoom;
  // who is here? (they step up, so look a little below too)
  int a = who(p), b = who(p + vec2(0.0, 0.008));
  int f = 0; vec2 s = p;
  if (b > 0 && who(p + vec2(0.0, pick(uBob, b))) == b) { f = b; s = p + vec2(0.0, pick(uBob, b)); }
  else if (a > 0 && who(p + vec2(0.0, pick(uBob, a))) == a) { f = a; s = p + vec2(0.0, pick(uBob, a)); }
  vec3 col = (a > 0 || b > 0) ? at(bg, p) : at(map, p);
  if (f > 0) col = mix(at(map, s), at(bg, p), pick(uGone, f) * 0.88);
  // a golden glow around whoever you touch
  float halo = 0.0;
  if (f == 0) {
    for (int k = 0; k < 8; k++) {
      float an = float(k) * 0.785;
      int n = who(p + vec2(cos(an) * 0.007, sin(an) * 0.007 * uH));
      if (n > 0) halo = max(halo, pick(uGlow, n) * (1.0 - pick(uGone, n)));
    }
  } else col += vec3(0.16, 0.11, 0.03) * pick(uGlow, f) * (1.0 - pick(uGone, f));
  col = mix(col, vec3(1.0, 0.82, 0.35), halo * 0.85);
  // the colours bloom when the whole family is linked
  if (f == 0) { float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(col, clamp(mix(vec3(l), col, 1.35) * 1.06, 0.0, 1.0), uBloom); }
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── lofi for a family walk ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[53, 57, 60, 64, 67], [52, 55, 59, 62, 67], [50, 53, 57, 60, 64], [55, 59, 62, 65, 69]];   // Fmaj9 · Em7 · Dm9 · G9
const BASS = [41, 40, 38, 43];
const MEL = [[72, 0, 1], [74, 1, 0.5], [76, 1.5, 1.5], [72, 4.5, 1], [71, 5.5, 1.5], [69, 8, 1], [72, 9, 1], [74, 10, 1.5], [71, 12.5, 1], [67, 13.5, 2]];
function band(ac) {
  const BPM = 80, beat = 60 / BPM, bar = beat * 4;
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3000; tape.Q.value = 0.5; bus.connect(tape).connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  const keys = (t, m, dur, vol = 0.04) => { tone(t, midi(m), dur, { vol, att: 0.03 }); tone(t, midi(m) * 2, dur * 0.4, { type: 'triangle', vol: vol * 0.15, att: 0.02 }); };
  const piano = (t, m, vol = 0.05) => { tone(t, midi(m), 1.4, { type: 'triangle', vol, att: 0.004 }); tone(t, midi(m) * 2, 0.5, { vol: vol * 0.25, att: 0.004 }); };
  // the city: a low hum of traffic and people
  const city = (() => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0; s.connect(f).connect(g).connect(fx); s.start(); return g; })();
  let next = ac.currentTime + 0.1, step = 0, timer = null, links = [], drums = 0.4;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, barN = Math.floor(step / 8), ch = barN % 4, sw = b8 % 2 ? beat * 0.09 : 0, tt = t + sw;
      if (b8 === 0) CHORDS[ch].forEach((m, i) => keys(t + i * 0.015, m + 12, bar * 0.95));
      // the family's chord: one note for every link you've made, shimmering on top
      if (b8 === 0 || b8 === 4) links.forEach((m, i) => tone(t + i * 0.03, midi(m + 12), beat * 2.2, { type: 'sine', vol: 0.018, att: 0.15, p: (i / 9) * 1.4 - 0.7 }));
      noise(tt, 0.04, { freq: 7000, type: 'highpass', q: 0.6, vol: (b8 % 2 ? 0.03 : 0.05) * drums * 2, p: 0.25 });
      if (b8 === 0 || b8 === 5) tone(tt, 110, 0.4, { vol: 0.38 * drums * 2, slide: 42, att: 0.006 });
      if (b8 === 2 || b8 === 6) noise(tt, 0.2, { freq: 1700, q: 0.7, vol: 0.1 * drums * 2 });
      if (b8 === 0) tone(t, midi(BASS[ch]), beat * 1.8, { type: 'triangle', vol: 0.2, att: 0.02 }); if (b8 === 3) tone(tt, midi(BASS[ch] + 7), beat * 0.8, { type: 'triangle', vol: 0.15 });
      { const pos = (barN % 4) * 4 + b8 / 2; for (const [m, at] of MEL) if (Math.abs(at - pos) < 0.01) piano(tt, m); }
      if (Math.random() < 0.25) noise(t + Math.random() * beat / 2, 0.012, { freq: 2500 + Math.random() * 2500, q: 3, vol: 0.03, p: Math.random() - 0.5 });
      next += beat / 2; step++;
    }
  }
  return {
    beat,
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.85); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    setLinks(l) { links = l; }, drums(v) { drums = v; },
    city(v) { city.gain.setTargetAtTime(v, ac.currentTime, 0.6); },
    note(m, p = 0) { const t = ac.currentTime + 0.01; tone(t, midi(m + 12), 1.6, { type: 'triangle', vol: 0.09, att: 0.01, out: fx, p }); tone(t, midi(m + 24), 0.8, { vol: 0.03, out: fx, p }); },
    snap(p) { const t = ac.currentTime + 0.01; noise(t, 0.08, { freq: 3000, q: 2, vol: 0.2, p, out: fx }); tone(t, 660, 0.25, { type: 'square', vol: 0.03, slide: 330, out: fx, p }); },
    // each of the family calls out from where they've drifted
    call(m, p) { const t = ac.currentTime + 0.01; [0, 0.16].forEach((d, i) => tone(t + d, midi(m + 12 + (i ? 5 : 0)), 0.22, { type: 'triangle', vol: 0.12, out: fx, p, slide: midi(m + 12 + (i ? 7 : 2)) })); },
    home(m, p) { const t = ac.currentTime + 0.01; [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.07, midi(m + 12 + d), 0.6, { type: 'triangle', vol: 0.06, out: fx, p })); },
    step(p) { noise(ac.currentTime + 0.01, 0.05, { freq: 800, q: 2, vol: 0.04, p, out: fx }); },
    traffic() { const t = ac.currentTime + 0.02; noise(t, 2.2, { freq: 300, q: 0.8, vol: 0.25, p: -0.8, out: fx, sweep: 900, att: 0.8 }); tone(t + 0.6, 440, 0.25, { type: 'square', vol: 0.03, out: fx, p: 0.6 }); tone(t + 0.9, 440, 0.4, { type: 'square', vol: 0.03, out: fx, p: 0.6 }); },
    bus() { const t = ac.currentTime + 0.02; noise(t, 3, { freq: 120, type: 'lowpass', q: 0.7, vol: 0.5, p: 0.7, out: fx, sweep: 60, att: 1 }); tone(t, 55, 3, { type: 'sawtooth', vol: 0.05, out: fx, p: 0.5, att: 1 }); noise(t + 1.6, 0.6, { freq: 3500, q: 4, vol: 0.12, p: -0.4, out: fx }); },
    dog() { const t = ac.currentTime + 0.02; [0, 0.3, 0.5].forEach(d => { tone(t + d, 520, 0.09, { type: 'square', vol: 0.05, out: fx, p: 0.7, slide: 380 }); noise(t + d, 0.08, { freq: 900, q: 2, vol: 0.1, p: 0.7, out: fx }); }); },
    bloom() { const t = ac.currentTime + 0.1; [53, 60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.12, midi(m), 4, { type: 'triangle', vol: 0.05, att: 0.1, out: fx })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function holdOnTogetherGame() {
  let G = null;
  const center = i => [(FAM[i].box[0] + FAM[i].box[2]) / 2, (FAM[i].box[1] + FAM[i].box[3]) / 2];
  const panOf = i => center(i)[0] * 1.6 - 0.8;
  // painting (u, v) → board, following the walk's zoom
  function P(u, v) { const z = G.zoom, cu = 0.5, cv = 0.78; return G.S.P(cu + (u - cu) * z, cv + (v - cv) * z); }

  // ── the golden threads between hands ──
  function makeThread(i) {
    const dots = [];
    for (let k = 0; k < 14; k++) { const s = K.sprite(K.dotTex, 0.013, { color: '#ffd45c', order: 22, opacity: 0 }); G.root.add(s); dots.push(s); }
    return { i, dots, on: 0, made: false };
  }
  function placeThreads(dt) {
    for (const th of G.threads) {
      const a = FAM[th.i].R, b = FAM[th.i + 1].L, want = th.made && !G.away.has(th.i) && !G.away.has(th.i + 1) ? 1 : 0;
      th.on += (want - th.on) * Math.min(1, dt * 6);
      const ba = G.bob[th.i + 1] || 0, bb = G.bob[th.i + 2] || 0;
      th.dots.forEach((s, k) => {
        const f = k / (th.dots.length - 1), u = a[0] + (b[0] - a[0]) * f, v = a[1] + (b[1] - a[1]) * f - Math.sin(f * Math.PI) * (0.025 + Math.abs(b[0] - a[0]) * 0.15) - (ba * (1 - f) + bb * f);
        const [x, y] = P(u, v); s.position.set(x, y, 0.05);
        const pulse = 0.65 + 0.35 * Math.sin(G.t * 5 - k * 0.6 - th.i * 0.9) + (G.flow > 0 ? Math.max(0, 1 - Math.abs(G.flow * 12 - th.i - f)) : 0);
        s.material.opacity = th.on * Math.min(1, 0.4 + pulse); s.scale.setScalar(0.011 + 0.008 * pulse);
      });
    }
  }

  // ── part 1: link the family ──
  function link(i) {
    const th = G.threads[i]; if (!th || th.made) return;
    th.made = true; G.linked++;
    G.glow[i + 1] = G.glow[i + 2] = 1;
    G.band.note(FAM[i].note, panOf(i)); setTimeout(() => G && G.band.note(FAM[i + 1].note, panOf(i + 1)), 140);
    G.band.setLinks(G.threads.filter(t => t.made).map(t => FAM[t.i + 1].note));
    const [x, y] = P((FAM[i].R[0] + FAM[i + 1].L[0]) / 2, (FAM[i].R[1] + FAM[i + 1].L[1]) / 2); G.fx.add(x, y, '#ffd45c', 12, 0.08);
    G.buzz(20);
    G.ui.panel('Link the family', `${G.linked} <small>of ${N - 1} hands</small>`, { segs: [G.linked, N - 1] });
    G.say(`${cap(FAM[i].name)} and ${FAM[i + 1].name}.`);
    if (G.linked === N - 1) setTimeout(() => G && allLinked(), 900);
  }
  function linkNext() { const th = G.threads.find(t => !t.made); if (th) link(th.i); }
  function allLinked() {
    G.phase = 'bloom'; G.flow = 0.001; G.band.bloom(); G.ui.alert('Together', 'The whole family is linked.', 2.4, 'red');
    G.say('The whole family, hand in hand. Now walk home together. When someone lets go, you’ll hear them call. Tap them, or press Left or Right, to bring them back.');
    setTimeout(() => G && startWalk(), G.bot ? 2500 : 9000);
  }
  const cap = s => s[0].toUpperCase() + s.slice(1);

  // ── part 2: the walk home ──
  function startWalk() {
    G.phase = 'walk'; G.ei = -1; G.evT = 2.5; G.queue = []; G.band.drums(0.55); G.band.city(0.05);
    G.ui.panel('Walk home together', `<small>Together</small> ${G.saved} <small>· drifted off</small> ${G.lost}`, {});
    buttons();
  }
  function nextEvent() {
    G.ei++;
    if (G.ei >= EVENTS.length) { G.phase = 'arrive'; G.arriveT = 0; G.ui.alert('Home', 'Everyone made it.', 2.5, 'red'); return; }
    const e = EVENTS[G.ei]; G.say(e.say); G.band[e.snd](); G.queue = e.who.map((id, k) => ({ id, at: 1.6 + k * e.gap })); G.evClock = 0;
    G.ui.alert(['The crossing', 'The bus', 'The puppy'][G.ei], e.say, 2.6, 'black');
  }
  function drift(id) {
    const i = FAM.findIndex(f => f.id === id); if (G.away.has(i)) return;
    G.away.set(i, { t: 0, side: center(i)[0] < 0.5 ? -1 : 1 }); G.band.snap(panOf(i));
    const f = FAM[i], [u0, v0, u1, v1] = f.box, m = K.plane(G.figTex[f.id], u1 - u0, (v1 - v0) * G.h, { order: 24, opacity: 1 });
    const [x, y] = P((u0 + u1) / 2, (v0 + v1) / 2); m.position.set(x, y, 0.06); G.root.add(m); G.away.get(i).m = m; G.away.get(i).x0 = x; G.away.get(i).y0 = y;
    G.say(`${cap(f.name)} let go!`); G.band.call(f.note, panOf(i) * 1.2);
  }
  function rescue(i, auto = false) {
    const d = G.away.get(i); if (!d || d.back) return;
    d.back = true; d.bt = 0;
    if (!auto) { G.saved++; G.say(`Got you, ${f(i)}.`); G.ui.pop('Got you!'); G.buzz(30); } else { G.lost++; G.say(`${cap(FAM[i].name)} found the way back.`); }
    G.band.home(FAM[i].note, panOf(i));
    G.ui.panel('Walk home together', `<small>Together</small> ${G.saved} <small>· drifted off</small> ${G.lost}`, {});
  }
  const f = i => FAM[i].name === 'Shardasia' || FAM[i].adult ? FAM[i].name : FAM[i].name.split(' in ')[0];
  function pullSide(side) {
    let best = -1, bt = -1; for (const [i, d] of G.away) if (!d.back && d.side === side && d.t > bt) { bt = d.t; best = i; }
    if (best < 0) for (const [i, d] of G.away) if (!d.back && d.t > bt) { bt = d.t; best = i; }
    if (best >= 0) rescue(best); else K.tone(220, 0.06, { vol: 0.04 });
  }
  function finish() {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Hold on together', title: 'Home, together', line: G.work && G.work.quote,
      cells: [{ k: 'Brought back', v: `${G.saved}/${G.saved + G.lost}` }, { k: 'Family', v: N }],
      say: 'Home, together. A family that moves together. ' + ((G.work && G.work.quote) || '') });
  }

  function buttons() {
    if (G.phase === 'link') G.ui.buttons([{ label: 'Link', icon: '🤝', kind: 'red', aria: 'Link the next two hands', press: () => linkNext() }]);
    else if (G.phase === 'walk') G.ui.buttons([
      { label: 'Left', icon: '◀', aria: 'Bring back whoever drifted off on the left', press: () => pullSide(-1) },
      { label: 'Right', icon: '▶', aria: 'Bring back whoever drifted off on the right', press: () => pullSide(1) },
    ]);
    else G.ui.buttons([]);
  }

  // which of the family is under a finger
  function whoAt(u, v) {
    let best = -1, bd = 9;
    FAM.forEach((m, i) => { const [x0, y0, x1, y1] = m.box; if (u > x0 && u < x1 && v > y0 && v < y1) { const d = Math.abs(u - (x0 + x1) / 2) / (x1 - x0); if (d < bd) { bd = d; best = i; } } });
    return best;
  }

  return {
    title: 'Hold on together',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', linked: 0, threads: [], away: new Map(), saved: 0, lost: 0, zoom: 1, bob: new Array(11).fill(0), glow: new Array(11).fill(0), gone: new Array(11).fill(0),
        flow: 0, bloom: 0, stepT: 0, stepN: 0, botT: 0 });
      G.band = band(K.audio());
      G.uni = { map: { value: null }, ids: { value: null }, bg: { value: null }, uBob: { value: G.bob }, uGlow: { value: G.glow }, uGone: { value: G.gone },
        uZoom: { value: 1 }, uBloom: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 3; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key, nearest) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; if (nearest) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; } G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'ids.png', 'ids', true); raw(ART + 'backdrop.jpg', 'bg');
      G.figTex = {}; for (const m of FAM) L.load(ART + 'fig-' + m.id + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.figTex[m.id] = t; });
      for (let i = 0; i < N - 1; i++) G.threads.push(makeThread(i));
      G.onGo = () => {
        G.band.start(); G.phase = 'link'; buttons();
        G.ui.panel('Link the family', `0 <small>of ${N - 1} hands</small>`, { segs: [0, N - 1] });
        G.say('Drag from one person to the person next to them to join their hands, or press Link.');
      };
      K.intro(G, { title: 'Hold on together', how: 'Shardasia is the oldest of six, in a family that moves together. Join their hands, then walk them home and keep everyone together.',
        say: 'Hold on together. Shardasia is the oldest of six, in a family that moves together. First, join their hands: drag from one person to the next, from Grandpa all the way to Mom. Then walk them home through the busy city, and keep everyone together.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      for (let i = 1; i <= N; i++) G.glow[i] = Math.max(G.hover === i - 1 ? 0.8 : 0, G.glow[i] - dt * 0.8);
      // the golden flow along the chain, once everyone's linked
      if (G.flow > 0) { G.flow += dt * 0.25; if (G.flow > 1.2) G.flow = G.phase === 'bloom' ? 0.001 : 0; }
      G.bloom += (((G.linked === N - 1) ? 1 : 0) - G.bloom) * Math.min(1, dt * 0.8); u.uBloom.value = G.bloom * 0.8;
      // walking: everyone steps in time with the music, and the city comes closer
      if (G.phase === 'walk' || G.phase === 'arrive') {
        G.zoom = Math.min(1.12, G.zoom + dt * 0.0018); u.uZoom.value = G.zoom;
        G.stepT += dt; const per = G.band.beat;
        if (G.stepT >= per) { G.stepT -= per; G.stepN++; G.band.step((G.stepN % 2) * 0.6 - 0.3); }
        FAM.forEach((m, i) => { const ph = G.t * Math.PI / per + (i % 2) * Math.PI / 2 + (m.adult ? 0 : 0.6); G.bob[i + 1] = Math.abs(Math.sin(ph)) * (m.adult ? 0.007 : 0.005); });
      } else for (let i = 1; i <= N; i++) G.bob[i] *= Math.pow(0.05, dt);
      // the events on the way home
      if (G.phase === 'walk') {
        G.evT -= dt;
        if (G.evT <= 0 && G.queue.length === 0 && G.away.size === 0) { nextEvent(); G.evT = 9; }
        if (G.queue.length) { G.evClock += dt; while (G.queue.length && G.evClock >= G.queue[0].at) drift(G.queue.shift().id); }
      }
      if (G.phase === 'arrive') { G.arriveT += dt; if (G.arriveT > 3.5) { G.phase = 'end'; finish(); } }
      // the ones who drifted: they wander off into the crowd, calling, until you bring them back
      for (const [i, d] of G.away) {
        d.t += dt;
        if (!d.back) {
          const k = Math.min(1, d.t / 1.2), drift = k * k * (3 - 2 * k);
          d.m.position.x = d.x0 + d.side * (0.13 + 0.04 * Math.sin(d.t * 0.8)) * drift; d.m.position.y = d.y0 + 0.09 * drift + Math.sin(d.t * 6) * 0.004;
          d.m.scale.setScalar(1 - 0.3 * drift); d.m.material.opacity = 1 - 0.25 * drift;
          G.gone[i + 1] = drift;
          d.callT = (d.callT || 0) - dt; if (d.callT <= 0) { d.callT = 1.4; G.band.call(FAM[i].note, d.side * 0.9); }
          if (d.t > WAIT) rescue(i, true);
          if (G.bot && d.t > 1.6) rescue(i);
        } else {
          d.bt += dt; const k = Math.min(1, d.bt / 0.6), e = k * k * (3 - 2 * k);
          d.m.position.x += (d.x0 - d.m.position.x) * Math.min(1, dt * 10); d.m.position.y += (d.y0 - d.m.position.y) * Math.min(1, dt * 10);
          d.m.scale.setScalar(0.78 + 0.22 * e); d.m.material.opacity = 1 - e; G.gone[i + 1] = 1 - e;
          if (k >= 1) { G.root.remove(d.m); d.m.material.dispose(); G.away.delete(i); G.glow[i + 1] = 1; const [x, y] = P(...center(i)); G.fx.add(x, y, '#ffd45c', 10, 0.08); }
        }
      }
      placeThreads(dt);
      // the robot links everyone, then walks them home
      if (G.bot && G.phase === 'link') { G.botT += dt; if (G.botT > 0.5) { G.botT = 0; linkNext(); } }
    },
    pointer(kind, ev) {
      if (!G) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      // undo the walk's zoom
      const z = G.zoom, uu = 0.5 + (p.u - 0.5) / z, vv = 0.78 + (p.v - 0.78) / z;
      if (G.phase === 'link') {
        const i = whoAt(uu, vv);
        if (kind === 'down') { G.drag = i; if (i >= 0) { G.glow[i + 1] = 1; G.band.note(FAM[i].note, panOf(i)); G.say(cap(FAM[i].name) + '.'); } }
        if (kind === 'move' && G.drag !== undefined && G.drag >= 0 && i >= 0 && i !== G.drag) {
          if (Math.abs(i - G.drag) === 1) { link(Math.min(i, G.drag)); G.drag = i; }
        }
        if (kind === 'up') G.drag = undefined;
      } else if (G.phase === 'walk' && kind === 'down') {
        // tap someone who's drifted off (where they are now, or where they were)
        let best = -1, bd = 0.12;
        for (const [i, d] of G.away) { if (d.back) continue; const dd = Math.hypot(p.x - d.m.position.x, p.y - d.m.position.y), d2 = Math.abs(uu - center(i)[0]) < 0.06 && Math.abs(vv - center(i)[1]) < 0.2 ? 0 : 9; const m = Math.min(dd, d2); if (m < bd) { bd = m; best = i; } }
        if (best >= 0) rescue(best);
      }
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'unity', playing: G.playing, over: G.over, phase: G.phase, linked: G.linked, event: G.ei, away: [...G.away.keys()].map(i => FAM[i].id), saved: G.saved, lost: G.lost, zoom: +G.zoom.toFixed(3), t: +G.t.toFixed(1) }; },
    stop() { if (G) G.band.stop(); K.cleanup(G); G = null; },
  };
}
