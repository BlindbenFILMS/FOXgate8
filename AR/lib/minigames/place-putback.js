// EVERYTHING IN ITS PLACE (Delric Pollins): PUT IT BACK.
// "When you can't rely on your eyes, everything has to have its place. Order becomes a kind of freedom."
// Delric's desk sits on a cliff above a churning sea. Everything on it has its place, left to right: the watch, the
// wallet, the cologne, the pen cup, the glass, the books (cut out of the painting itself). A wave crashes over the desk
// and knocks some of them into the sea, where they bob on the waves, each making its own sound from where it floats.
// Pick one up (tap it, or press Pick up), then tap its place on the desk. Sliding along the desk while you hold it,
// you hear each place's own sound, like feeling along a shelf. Every thing put back calms the sea a little.
// Three waves: 2 things, then 4, then all 6. After the third, the sea goes still and the desk glows.
// Help: says where the thing you're holding goes ("between the wallet and the pen cup") and makes its place chime;
// press Help again and it goes back by itself. Nobody gets stuck.
// Art: media/games/place/ backdrop.jpg (the painting with the six things taken off the desk) and <thing>.png cut-outs.
import * as THREE from 'three';
import * as K from './kit.js';

const ART = new URL('../../media/games/place/', import.meta.url).href;
const PX = 960;   // the painting's size in pixels (square)
// the six things, left to right: their box in the painting (pixels), what they're called, their note, where they go
const THINGS = [
  { id: 'watch',  name: 'the watch',    box: [36, 206, 156, 276],  note: 523,  where: 'It goes at the far left, next to the jar.' },
  { id: 'wallet', name: 'the wallet',   box: [140, 222, 312, 292], note: 587,  where: 'It goes between the watch and the cologne.' },
  { id: 'cologne', name: 'the cologne', box: [316, 172, 402, 280], note: 659,  where: 'It goes between the wallet and the pen cup.' },
  { id: 'pencup', name: 'the pen cup',  box: [381, 110, 486, 292], note: 784,  where: 'It goes between the cologne and the glass.' },
  { id: 'glass',  name: 'the glass',    box: [474, 160, 568, 282], note: 880,  where: 'It goes between the pen cup and the books.' },
  { id: 'books',  name: 'the books',    box: [569, 186, 797, 294], note: 1047, where: 'It goes at the far right, after the glass.' },
];
const WAVES = [2, 4, 6];
const SEA_V = 0.33;      // the sea's top edge (the desk's front edge)
const WAVE_D = 2.1;      // seconds for the crest to sweep across, right to left (in from the open sea)
const LIFT = 0.25;       // how high the wave rises above the desk's edge
const crestAt = (wp) => 1.4 - 1.85 * (wp / WAVE_D);
// THE WAVE: the painting's own sea, lifted up over the desk, with a foaming lip and spray. Drawn above everything.
const WFRAG = `
uniform sampler2D map; uniform float time; uniform float cx; uniform float lift; uniform float ready;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ return 0.55 * noise(p) + 0.3 * noise(p * 2.1 + 3.7) + 0.15 * noise(p * 4.3 + 9.1); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  const float SEA = ${SEA_V.toFixed(3)};
  // a breaking wave rolling right to left: a steep face in front (left), a long back behind it (right)
  float dx = p.x - cx;
  float g = dx < 0.0 ? exp(-dx * dx / 0.0035) : exp(-dx * dx / 0.03);
  float behind = smoothstep(cx, cx + 0.25, p.x) * (1.0 - smoothstep(cx + 0.45, cx + 1.2, p.x));   // water still pouring over the desk behind it
  float H = lift * (0.08 + 0.92 * g + 0.32 * behind);
  H += lift * 0.12 * (fbm(vec2(p.x * 14.0 - time * 1.5, time * 0.8)) - 0.5);       // a living, uneven top
  float ys = SEA - H;
  if (lift < 0.002 || p.y < ys - 0.07 || p.y > SEA + 0.05) discard;
  float d = p.y - ys;                                     // depth below the surface
  float inW = smoothstep(0.0, 0.004, d) * (1.0 - smoothstep(SEA + 0.01, SEA + 0.05, p.y));
  // the water body: the painting's own rough open sea (lower right), flowing
  vec2 w = vec2(fbm(p * 9.0 + vec2(time * 0.9, 0.0)), fbm(p * 9.0 + vec2(5.2, time * 0.7))) - 0.5;
  vec2 sp = vec2(0.45 + fract(p.x * 0.55 + time * 0.06) * 0.5 + w.x * 0.04, 0.62 + d * 0.9 + w.y * 0.05);
  vec3 col = texture2D(map, vec2(sp.x, 1.0 - min(sp.y, 0.98))).rgb;
  // light through the thin top of the crest: deep blue below, glassy green-teal near the lip
  float thin = (1.0 - smoothstep(0.0, 0.09, d)) * (0.35 + 0.65 * g);
  col = mix(col * vec3(0.85, 0.95, 1.1), vec3(0.2, 0.42, 0.46), thin * 0.55);
  // foam: a thick, bright, broken lip; whitewater tumbling down the front face; streaks on the back
  float lipW = 0.01 + 0.045 * g;
  float lip = (1.0 - smoothstep(0.0, lipW, d)) * smoothstep(0.25, 0.7, fbm(vec2(p.x * 60.0 - time * 3.0, p.y * 60.0)) + 0.35);
  float face = (dx < 0.0 ? exp(-dx * dx / 0.002) : 0.0) * smoothstep(0.45, 0.8, fbm(vec2(p.x * 40.0, p.y * 30.0 - time * 6.0))) * (1.0 - smoothstep(0.02, 0.2, d));
  float streak = smoothstep(0.6, 0.85, fbm(vec2(p.x * 22.0 - time * 2.0, p.y * 70.0))) * 0.5 * behind * (1.0 - smoothstep(0.0, 0.16, d));
  float foam = clamp(lip + face + streak, 0.0, 1.0);
  col = mix(col, vec3(0.94, 0.97, 1.0), foam);
  // spray: mist thrown up and forward off the crest
  float sprayZone = step(d, 0.0) * (1.0 - smoothstep(0.0, 0.03 + 0.09 * g, -d)) * (dx < 0.02 ? 1.0 : 0.35) * g;
  float mist = sprayZone * smoothstep(0.42, 0.75, fbm(vec2(p.x * 70.0 + time * 4.0, p.y * 70.0 - time * 9.0)));
  col = mix(col, vec3(0.95, 0.97, 1.0), mist * (1.0 - inW));
  gl_FragColor = vec4(col, max(inW * 0.96, mist * 0.8) * ready);
}`;
const FLOAT_SC = 1.45;   // things look bigger out in the sea, so they're easy to see and tap
const DESK_V = 0.36;   // above this line (v) is the desk; below it, the sea
// where things can float (u, v): spread over the sea, never under the desk's front edge
const SLOTS = [[0.14, 0.5], [0.4, 0.47], [0.68, 0.5], [0.88, 0.62], [0.24, 0.66], [0.52, 0.64], [0.12, 0.83], [0.38, 0.84], [0.64, 0.8], [0.86, 0.86]];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
uniform sampler2D map; uniform float time; uniform float storm; uniform float calm; uniform float ready; uniform float wet;
varying vec2 vUv;
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float sea = smoothstep(0.322, 0.345, p.y);
  float fall = sea * (1.0 - smoothstep(0.86, 0.9, p.x)) * (1.0 - smoothstep(0.55, 0.75, p.y));   // the water pouring off the desk
  float amp = 0.25 + storm;
  vec2 off = vec2(sin(p.y * 55.0 + time * 1.6 + sin(p.x * 9.0) * 2.0) * 0.004, sin(p.x * 38.0 + time * 2.1) * 0.0035) * amp * sea * (1.0 - calm * 0.85);
  off.y += sin(p.y * 140.0 - time * 7.0) * 0.0025 * fall * amp * (1.0 - calm * 0.85);
  vec3 col = texture2D(map, vec2(vUv.x + off.x, vUv.y - off.y)).rgb;
  col *= 1.0 - storm * 0.18 * sea;                                       // darker when it's rough
  col += sea * calm * vec3(0.06, 0.08, 0.12) * (0.6 + 0.4 * sin(p.x * 20.0 + time * 0.8));   // a soft sheen when it's still
  col += (1.0 - sea) * calm * vec3(0.07, 0.06, 0.03);                    // the desk glows at the end
  float desk = (1.0 - sea) * smoothstep(0.2, 0.26, p.y);
  col = col * (1.0 - wet * 0.12 * desk) + desk * wet * vec3(0.05, 0.07, 0.1) * (0.5 + 0.5 * sin(p.x * 90.0 + p.y * 40.0 + time * 0.5));   // wet and shining after a wave
  gl_FragColor = vec4(col, ready);
}`;

// a dashed glowing outline on the desk: "this is where it lives"
const homeTex = K.canvasTex(256, 64, (g) => {
  const r = g.createRadialGradient(128, 32, 0, 128, 32, 120); r.addColorStop(0, 'rgba(255,214,90,.55)'); r.addColorStop(1, 'rgba(255,214,90,0)');
  g.save(); g.translate(128, 32); g.scale(1, 0.26); g.fillStyle = r; g.beginPath(); g.arc(0, 0, 120, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.translate(128, 32); g.scale(1, 0.26); g.beginPath(); g.arc(0, 0, 100, 0, Math.PI * 2); g.restore();
  g.setLineDash([18, 12]); g.lineWidth = 7; g.strokeStyle = '#ffd65a'; g.stroke();
});

export function putItBackGame() {
  let G = null;

  /* ───────── sound: the sea, and each thing's own voice ───────── */
  function seaStart() {
    const ac = K.audio(); if (!ac) return;
    const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    let b = 0; for (let i = 0; i < len; i++) { b = b * 0.98 + (Math.random() * 2 - 1) * 0.2; d[i] = b; }   // brown-ish noise: the sea
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; src.loop = true; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
    src.connect(f).connect(g).connect(ac.destination); src.start();
    G.sea = { src, f, g };
  }
  function seaUpdate() {
    const ac = K.audio(); if (!ac || !G.sea) return;
    const swell = 0.5 + 0.5 * Math.sin(G.t * 0.9);   // the waves come and go
    // silent until the first wave; full while a wave knocks things off; half while you're picking things up out of the sea
    const level = G.waveT > 0 ? 1 : 0.5;
    G.sea.g.gain.setTargetAtTime(G.seaOn * 0.67 * level * (0.85 + swell * 0.15) * (1 - G.calm * 0.75), ac.currentTime, G.waveT > 0 ? 0.15 : 0.6);
    G.sea.f.frequency.setTargetAtTime(350 + G.storm * 900 + swell * 150, ac.currentTime, 0.3);
  }
  function crash() {
    K.noise(1.6, { vol: 0.7, freq: 2400, sweepTo: 180, q: 0.6, type: 'lowpass' });
    K.noise(0.9, { vol: 0.35, freq: 600, sweepTo: 3000, q: 0.7, delay: 0.1 });
    K.tone(55, 1.2, { type: 'sine', vol: 0.25, slide: -20 });
  }
  function voice(id, pan = 0, vol = 1) {
    switch (id) {
      case 'watch': for (let i = 0; i < 4; i++) K.tone(i % 2 ? 2600 : 3300, 0.025, { type: 'square', vol: 0.05 * vol, pan, delay: i * 0.16 }); break;   // tick, tick
      case 'wallet': K.noise(0.4, { vol: 0.35 * vol, freq: 380, sweepTo: 900, q: 6, pan }); K.tone(95, 0.3, { type: 'triangle', vol: 0.07 * vol, pan, slide: 25 }); break;   // leather creak
      case 'cologne': K.noise(0.32, { vol: 0.3 * vol, freq: 6500, type: 'highpass', q: 0.7, pan, delay: 0.08 }); K.noise(0.32, { vol: 0.2 * vol, freq: 6500, type: 'highpass', q: 0.7, pan, delay: 0.5 }); K.tone(1180, 0.12, { vol: 0.05 * vol, pan }); break;   // a click, then psst, psst
      case 'pencup': for (let i = 0; i < 6; i++) { K.noise(0.03, { vol: 0.22 * vol, freq: 3500 + i * 200, q: 3, pan, delay: i * 0.05 }); K.tone(1700 + (i % 3) * 300, 0.04, { vol: 0.025 * vol, pan, delay: i * 0.05 }); } break;   // pens rattling
      case 'glass': K.tone(2637, 0.6, { vol: 0.07 * vol, pan }); K.tone(3951, 0.35, { vol: 0.03 * vol, pan, delay: 0.01 }); K.noise(0.35, { vol: 0.12 * vol, freq: 500, q: 1, pan, delay: 0.12 }); break;   // clink and slosh
      case 'books': for (let i = 0; i < 9; i++) K.noise(0.025, { vol: 0.25 * vol, freq: 2200 + i * 120, q: 1.2, pan, delay: i * 0.035 }); break;   // pages riffling
    }
  }
  // where on the SCREEN the sea starts, just under the desk (so pop-ups never cover the desk or the wave)
  function belowDesk() {
    const [x, y] = G.S.P(0.5, SEA_V + 0.06), v = new THREE.Vector3(x, y, 0.05);
    G.root.updateWorldMatrix(true, false); v.applyMatrix4(G.root.matrixWorld).project(G.camera);
    const r = G.renderer.domElement.getBoundingClientRect();
    return Math.round(r.top + (1 - v.y) / 2 * r.height);
  }
  function screenY(v) {
    const [x, y] = G.S.P(0.5, v), p = new THREE.Vector3(x, y, 0.05);
    G.root.updateWorldMatrix(true, false); p.applyMatrix4(G.root.matrixWorld).project(G.camera);
    const r = G.renderer.domElement.getBoundingClientRect();
    return Math.round(r.top + (1 - p.y) / 2 * r.height);
  }
  // alerts go in the space under the painting (above the buttons), so they never hide the wave or the sea
  function alertBelow(title, sub, secs, kind) {
    G.ui.alert(title, sub, secs, kind);
    const el = document.querySelector('.mgk-alert'); if (!el) return;
    const btns = document.querySelector('.mgk-btns'), bTop = btns ? btns.getBoundingClientRect().top : innerHeight - 90;
    el.style.top = Math.max(8, Math.min(screenY(1) + 10, bTop - el.offsetHeight - 14)) + 'px';
  }
  const panOf = (u) => Math.max(-1, Math.min(1, (u - 0.5) * 1.8));

  /* ───────── the things ───────── */
  const floating = () => G.things.filter(t => t.state === 'float' || t.state === 'held');
  function hud() {
    const n = WAVES[G.wave] || 6, back = n - floating().length - G.things.filter(t => t.state === 'fly').length;
    G.ui.panel('Put it back', `${Math.max(0, back)}<small>of ${n} back in place</small>`,
      { segs: [Math.max(0, back), n], sub: G.endT >= 0 ? 'Everything is in its place' : G.waveT > 0 ? 'Here comes a wave…' : `Wave ${G.wave + 1} of 3 · pick something up from the sea` });
  }
  function startWave() {
    G.seaOn = 1;
    G.waveT = 1; G.waveHit = false; G.waveP = -1.3; G.crashed = false; G.sprayT = 0;
    G.say(G.wave === 0 ? 'Here comes a wave!' : `Wave ${G.wave + 1}. Here comes a wave!`);
    G.pool = G.things.slice().sort(() => Math.random() - 0.5).slice(0, WAVES[G.wave]);
    G.slots = SLOTS.slice().sort(() => Math.random() - 0.5);
    K.noise(1.4, { vol: 0.25, freq: 120, sweepTo: 420, q: 0.8, type: 'lowpass' });   // the sea draws back: a low rumble
    hud();
  }
  function waveUpdate(dt) {
    if (G.waveT <= 0) { G.uni2.lift.value += (0 - G.uni2.lift.value) * Math.min(1, dt * 3); return; }
    G.waveP += dt; const wp = G.waveP;
    if (wp < 0) { G.storm = Math.max(G.storm, 0.3 + (1.3 + wp) * 0.5); return; }   // swelling up
    if (!G.waveHit) { G.waveHit = true; G.storm = 1; K.noise(1.3, { vol: 0.45, freq: 250, sweepTo: 1800, q: 0.7, pan: 0.7 }); }   // the roar, rising from the right
    const env = Math.min(1, wp / 0.45) * (1 - Math.max(0, Math.min(1, (wp - (WAVE_D - 0.25)) / 0.8)));
    const cx = crestAt(wp), lift = LIFT * env;
    G.uni2.cx.value = cx; G.uni2.lift.value = lift;
    // it crashes onto the desk
    if (!G.crashed && cx < 0.82) { G.crashed = true; crash(); G.shake = 1; G.buzz([80, 40, 140]); alertBelow('Splash!', 'Things fell into the sea', 1.6, 'blue'); }
    // the crest knocks each thing in the pool off the desk as it passes
    G.pool.forEach((t, i) => { if (t.state === 'home' && !t.knocked && cx < t.homeU + 0.05) { t.knocked = true;
      t.state = 'fly'; t.from = [t.homeU, t.homeV]; t.to = G.slots[i]; t.flyT = 0; t.flyDur = 1.0; t.toSea = true; t.u = t.homeU; t.v = t.homeV; } });
    // spray flying off the crest
    G.sprayT -= dt; if (lift > 0.04 && G.sprayT <= 0 && cx > -0.05 && cx < 1.05) { G.sprayT = 0.025;
      for (let k = 0; k < 2; k++) { const [x, y] = G.S.P(cx - Math.random() * 0.05, SEA_V - lift * (0.95 + Math.random() * 0.25)); G.fx.add(x, y, k ? '#ffffff' : '#cfe8f0', 7, 0.3); } }
    G.wet = Math.max(G.wet, env);
    if (wp > WAVE_D + 0.6) { G.waveT = -1; G.pool.forEach(t => { t.knocked = false; }); hud(); }
  }
  function pickUp(t) {
    if (G.held && G.held !== t) G.held.state = 'float';
    G.held = t; t.state = 'held'; t.helped = false;
    voice(t.id, panOf(t.u)); G.buzz(20);
    G.say(G.firstPick ? `${t.name[0].toUpperCase() + t.name.slice(1)}.` : `${t.name[0].toUpperCase() + t.name.slice(1)}. Where does it go? Tap its place on the desk.`);
    G.firstPick = true; G.lastHome = -1;
  }
  function tryPlace(t, homeIdx) {
    const owner = G.things[homeIdx];
    if (owner === t) {
      t.state = 'fly'; t.from = [t.u, t.v]; t.to = [t.homeU, t.homeV]; t.flyT = 0; t.flyDur = 0.45; t.toSea = false; G.held = null;
      return;
    }
    // not its place: hear whose place it is, and keep holding
    K.tone(220, 0.2, { type: 'triangle', vol: 0.08, pan: panOf(owner.homeU) }); voice(owner.id, panOf(owner.homeU), 0.5); G.buzz(15);
    G.say(`That’s ${owner.name}${owner.id === 'books' ? '’' : '’s'} place.`);   // 'That’s the wallet’s place.' · 'That’s the books’ place.'
    owner.homePulse = 1;
  }
  function landed(t) {
    if (t.toSea) { t.state = 'float'; t.u = t.to[0]; t.v = t.to[1]; const [x, y] = G.S.P(t.u, t.v); G.fx.add(x, y, '#cfe6ff', 16, 0.25); K.noise(0.5, { vol: 0.3, freq: 900, sweepTo: 300, pan: panOf(t.u) }); voice(t.id, panOf(t.u), 0.7);
      if (G.things.every(q => q.state !== 'fly')) { G.storm = 0.75; G.say('Pick something up from the sea.'); hud(); }
      return; }
    // back in its place
    t.state = 'home'; t.u = t.homeU; t.v = t.homeV;
    K.tone(t.note, 0.5, { type: 'triangle', vol: 0.12, pan: panOf(t.u) }); K.tone(t.note * 1.5, 0.4, { vol: 0.04, pan: panOf(t.u), delay: 0.05 });
    K.noise(0.05, { vol: 0.3, freq: 1500, q: 2, pan: panOf(t.u) });   // a soft click as it sets down
    const [x, y] = G.S.P(t.u, t.v); G.fx.add(x, y, '#ffd65a', 14, 0.22); G.buzz([25, 30, 50]);
    G.ui.pop(t.name.replace(/^the /, '').toUpperCase() + '!', innerWidth / 2, belowDesk() + 40);
    G.storm = Math.max(0.2, G.storm - 0.6 / WAVES[G.wave]);
    const left = floating().length + G.things.filter(q => q.state === 'fly').length;
    hud();
    if (left > 0) { G.say(left === 1 ? 'Back in its place. 1 more.' : `Back in its place. ${left} more.`); return; }
    // the wave is over
    K.chord(G.things.map(q => q.note), 1.8, { vol: 0.04, type: 'triangle', spread: 0.07 });
    G.wave++;
    if (G.wave < WAVES.length) { G.say('Everything is in its place.'); G.nextWaveT = 2.6; }
    else { G.say('Everything is in its place. The sea is calm.'); G.endT = 0; alertBelow('Everything in its place', 'The sea is calm', 3, 'red'); G.buzz([60, 60, 160]);
      K.chord([523, 659, 784, 1047, 1319], 3.5, { vol: 0.05, type: 'triangle', spread: 0.15 }); }
  }
  function help() {
    if (!G.playing || G.over || G.waveT > 0) return;
    if (!G.held) { const t = floating().sort((a, b) => a.homeU - b.homeU)[0]; if (t) pickUp(t); return; }
    const t = G.held;
    if (!t.helped) { t.helped = true; G.say(t.where); t.homePulse = 1.6; K.tone(t.note, 0.6, { vol: 0.12, pan: panOf(t.homeU) }); voice(t.id, panOf(t.homeU), 0.6); }
    else tryPlace(t, G.things.indexOf(t));
  }
  function pickNext() {
    if (!G.playing || G.over || G.waveT > 0) return;
    const fl = G.things.filter(t => t.state === 'float' || t.state === 'held'); if (!fl.length) return;
    const i = G.held ? (fl.indexOf(G.held) + 1) % fl.length : 0;
    pickUp(fl[i]);
  }
  function thingAt(u, v) {   // the floating thing under a finger (a generous hit area)
    let best = null, bd = 9;
    for (const t of G.things) if (t.state === 'float' || t.state === 'held') {
      const du = Math.abs(u - t.u) - t.w * FLOAT_SC / 2, dv = Math.abs(v - t.v) - t.h * FLOAT_SC / 2, d = Math.max(du, dv);
      if (d < 0.05 && d < bd) { bd = d; best = t; } }
    return best;
  }
  const nearestHome = (u) => { let bi = 0, bd = 9; G.things.forEach((t, i) => { const d = Math.abs(t.homeU - u); if (d < bd) { bd = d; bi = i; } }); return bi; };

  return {
    title: 'Put it back',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { seaOn: 0, wet: 0, waveP: 0, pool: [], slots: [], wave: 0, waveT: -1, nextWaveT: -1, endT: -1, storm: 0.3, calm: 0, shake: 0, held: null, drag: null, firstPick: false, t0: 0, botT: 0, lastHome: -1 });
      G.uni = { map: { value: null }, time: { value: 0 }, storm: { value: 0.3 }, calm: { value: 0 }, ready: { value: 0 }, wet: { value: 0 } };
      G.uni2 = { map: { value: null }, time: { value: 0 }, cx: { value: 2 }, lift: { value: 0 }, ready: { value: 0 } };
      G.waveMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni2, vertexShader: VERT, fragmentShader: WFRAG, transparent: true, depthWrite: false }));
      G.waveMesh.position.z = 0.06; G.waveMesh.renderOrder = 35; G.root.add(G.waveMesh);
      G.board = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.board.position.z = 0.02; G.board.renderOrder = 11; G.root.add(G.board);
      new THREE.TextureLoader().load(ART + 'backdrop.jpg', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.uni.map.value = t; G.uni2.map.value = t; G.ready = true; });
      G.things = THINGS.map(T => {
        const [x0, y0, x1, y1] = T.box, w = (x1 - x0) / PX, h = (y1 - y0) / PX * G.h, homeU = (x0 + x1) / 2 / PX, homeV = (y0 + y1) / 2 / PX;
        const m = K.plane(null, w, h, { order: 30, opacity: 0 }); m.position.z = 0.05; G.root.add(m);
        new THREE.TextureLoader().load(ART + T.id + '.png', tx => { if (!G) return; tx.colorSpace = THREE.SRGBColorSpace; m.material.map = tx; m.material.needsUpdate = true; m.material.opacity = 1; });
        const home = K.sprite(homeTex, w * 1.25, { order: 25, opacity: 0 }); home.scale.set(Math.max(0.1, w * 1.3), Math.max(0.1, w * 1.3) / 4, 1);
        home.position.set(...G.S.P(homeU, (y1 - 6) / PX), 0.03); G.root.add(home);
        const foam = K.sprite(K.glowTex, w * 1.3, { order: 28, opacity: 0, color: '#e8f4ff' }); foam.position.z = 0.045; G.root.add(foam);
        const halo = K.sprite(K.glowTex, Math.max(w, h) * 1.8, { order: 29, opacity: 0, additive: true, color: '#ffd65a' }); halo.position.z = 0.048; G.root.add(halo);
        return { ...T, m, home, foam, halo, w, h, homeU, homeV, u: homeU, v: homeV, state: 'home', ph: Math.random() * 6, homePulse: 0, from: null, to: null, flyT: 0 };
      });
      G.ui.buttons([
        { label: 'Pick up', kind: 'black', aria: 'Pick up the next thing floating in the sea', press: () => pickNext() },
        { label: 'Help', kind: 'red', aria: 'Help: where does the thing I am holding go?', press: () => help() },
      ]);
      hud();
      seaStart();
      // before the first wave: Delric's desk, left to right, each thing lighting up and sounding as it's named
      G.onGo = () => { G.t0 = G.t; G.rollT = 0; G.rollI = -1; G.say('This is Delric’s desk. The watch. The wallet. The cologne. The pen cup. The glass. The books.'); };
      K.intro(G, { title: 'Put it back', how: 'Everything on Delric’s desk has its place. When a wave knocks things into the sea, pick them up and put each one back in its place.',
        say: 'Put it back. Everything on Delric’s desk has its place. When a wave knocks things into the sea, pick them up, and put each one back in its place. Tap a thing, then tap its place on the desk. Or press Pick up, and Help.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.time.value = G.t; U.ready.value = Math.min(1, U.ready.value + (G.ready ? dt * 1.5 : 0));
      G.calm += ((G.endT >= 0 ? 1 : 0) - G.calm) * Math.min(1, dt * 0.7);
      if (G.endT < 0 && !G.waveHit) G.storm += (0.3 - G.storm) * Math.min(1, dt * 0.3);
      U.storm.value += (G.storm - U.storm.value) * Math.min(1, dt * 2); U.calm.value = G.calm;
      seaUpdate();
      // the shake when a wave hits
      G.shake = Math.max(0, G.shake - dt * 1.6);
      G.board.position.x = Math.sin(G.t * 47) * 0.006 * G.shake; G.board.position.y = Math.cos(G.t * 39) * 0.004 * G.shake;
      // the roll call: each thing glows and sounds, left to right, while it's named
      if (G.rollT != null) { G.rollT += dt; const i = Math.floor((G.rollT - 1.6) / 0.95);
        if (i !== G.rollI && i >= 0 && i < 6) { G.rollI = i; const t = G.things[i]; voice(t.id, panOf(t.homeU)); t.homePulse = 1; }
        if (G.rollT > 1.6 + 6 * 0.95 + 0.8) { G.rollT = null; startWave(); } }
      waveUpdate(dt);
      G.wet = Math.max(0, G.wet - dt * 0.12); U.wet.value = G.wet; G.uni2.time.value = G.t; G.uni2.ready.value = U.ready.value;
      if (G.nextWaveT > 0) { G.nextWaveT -= dt; if (G.nextWaveT <= 0) { G.waveHit = false; startWave(); } }
      // the bot: picks things up and puts them back
      if (G.bot && G.playing && !G.over && G.waveT <= 0) { G.botT -= dt;
        if (G.botT <= 0) { G.botT = 0.7; if (!G.held) { const t = floating()[0]; if (t) pickUp(t); } else tryPlace(G.held, G.things.indexOf(G.held)); } }
      // the things: at home, flying, floating (bobbing on the waves), or held up in the light
      for (const t of G.things) {
        let u = t.u, v = t.v, rot = 0, sc = 1;
        if (t.state === 'fly') {
          t.flyT += dt; const k = Math.max(0, Math.min(1, t.flyT / t.flyDur)), e = k * k * (3 - 2 * k);
          u = t.from[0] + (t.to[0] - t.from[0]) * e; v = t.from[1] + (t.to[1] - t.from[1]) * e - Math.sin(k * Math.PI) * (t.toSea ? 0.16 : 0.08);
          rot = t.toSea ? Math.sin(k * Math.PI) * 1.2 * (t.ph > 3 ? 1 : -1) : 0; sc = t.toSea ? 1 + e * (FLOAT_SC - 1) : FLOAT_SC + e * (1 - FLOAT_SC);
          t.u = u; t.v = v;
          if (k >= 1) landed(t);
        } else if (t.state === 'float') {
          const b = (0.3 + G.storm) ; v = t.v + Math.sin(G.t * 1.7 + t.ph) * 0.008 * b; rot = Math.sin(G.t * 1.3 + t.ph) * 0.18 * b; sc = FLOAT_SC;
        } else if (t.state === 'held') {
          if (G.drag !== t) { v = t.v - 0.03 + Math.sin(G.t * 2.4) * 0.006; }
          rot = Math.sin(G.t * 2) * 0.05; sc = FLOAT_SC * 1.1;
        } else if (t.state === 'home') { u = t.homeU; v = t.homeV; }
        const [x, y] = G.S.P(u, v);
        t.m.position.set(x, y, t.state === 'held' ? 0.07 : 0.05); t.m.rotation.z = rot; t.m.scale.setScalar(sc); t.m.renderOrder = t.state === 'held' ? 40 : 30;
        t.foam.position.set(x, y - t.h * 0.38 * sc, 0.045); t.foam.material.opacity = t.state === 'float' ? 0.35 + Math.sin(G.t * 2 + t.ph) * 0.1 : 0;
        t.foam.scale.set(t.w * 1.4 * sc, t.w * 0.35 * sc, 1);
        t.halo.position.set(x, y, 0.048); t.halo.scale.setScalar(Math.max(t.w, t.h) * 1.8 * sc); t.halo.material.opacity = t.state === 'held' ? 0.4 + Math.sin(G.t * 4) * 0.12 : 0;
        // its empty place on the desk glows (and pulses when it's called)
        t.homePulse = Math.max(0, t.homePulse - dt * 0.8);
        const empty = t.state !== 'home' || G.rollT != null;
        t.home.material.opacity = (t.state !== 'home' ? 0.55 + Math.sin(G.t * 3 + t.ph) * 0.15 : 0) + t.homePulse * 0.6;
        if (!empty) t.home.material.opacity = t.homePulse * 0.5;
      }
      // the finale: the sea goes still, the desk glows, then the end panel
      if (G.endT >= 0) { G.endT += dt;
        if (G.endT > 4.5 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('everything-in-its-place:putback', t, 'lower');
          K.finale(G, { won: true, title: 'Everything in its place', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Waves', v: '3/3' }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || G.over) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      const u = p.u, v = p.v;
      if (kind === 'down') {
        G.downAt = [u, v]; G.moved = false;
        const t = thingAt(u, v);
        if (t) { if (G.held !== t) pickUp(t); G.drag = t; return; }
        if (G.held && v < DESK_V + 0.04) { tryPlace(G.held, nearestHome(u)); return; }
        if (G.held) { voice(G.held.id, panOf(G.held.u), 0.6); G.say('Tap its place on the desk.'); }
        return;
      }
      if (kind === 'move' && G.drag && G.drag.state === 'held') {
        if (Math.hypot(u - G.downAt[0], v - G.downAt[1]) > 0.03) G.moved = true;
        if (G.moved) { G.drag.u = Math.max(0.02, Math.min(0.98, u)); G.drag.v = Math.max(0.05, Math.min(0.95, v)); }
        // sliding along the desk: each place sounds as you pass it, like feeling along a shelf
        if (v < DESK_V + 0.04) { const hi = nearestHome(u); if (hi !== G.lastHome) { G.lastHome = hi; const o = G.things[hi]; voice(o.id, panOf(o.homeU), 0.35); o.homePulse = Math.max(o.homePulse, 0.5); } }
        else G.lastHome = -1;
        return;
      }
      if (kind === 'up' && G.drag) {
        const t = G.drag; G.drag = null;
        if (G.moved && t.state === 'held' && v < DESK_V + 0.04) tryPlace(t, nearestHome(u));
      }
    },
    pause() { if (G) { G.paused = true; G.drag = null; } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'put-it-back', playing: G.playing, over: G.over, wave: G.wave, waveP: G.waveT > 0 ? +G.waveP.toFixed(2) : null, held: G.held && G.held.id, floating: G.things.filter(t => t.state === 'float' || t.state === 'held').map(t => t.id), t: +G.t.toFixed(1) }; },
    stop() {
      if (G && G.sea) { try { const a = K.audio(); G.sea.g.gain.setTargetAtTime(0, a.currentTime, 0.2); G.sea.src.stop(a.currentTime + 1); } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
