// ROLLER COASTER OF EMOTIONS (Alayna Lopez): PICK YOUR TRACK, a "steer left or right" game.
// “I had to throw away who I was because of this incorrect perception of what a blind person was and what they should act like.
//  I felt stuck on this roller coaster of different emotions.”
// The sky over her city is stormy. Alayna rides a little coaster car up a track through that sky to a fork. Two billboards stand
// at the ends of the two tracks: one has a wrong idea about blind people on it, the other tells the truth. The voice reads both,
// LEFT then RIGHT. Steer onto the TRUE track (tap the left or right side, or the buttons). True: hands up, the billboard lights
// gold, the sky clears a little. Not true: thunder, then the car hops over to the true track and the voice says the truth.
// Nobody fails: every fork ends on the truth. Six forks; the storm is gone at the end, then Alayna reads her own words.
// Accessible: everything on the billboards is read aloud, with the side said first; Hear Again repeats them; the two choices
// are big buttons as well as the two halves of the screen; true and not-true differ in sound, words and brightness.
// Props: coaster-things.js. No image files.
import * as THREE from 'three';
import * as K from './kit.js';
import { slimHud } from './alayna-hud.js';
import { carTex, cloudTex, signTex, drawTrack } from './coaster-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_14.mp3', import.meta.url).href;   // Alayna, in her own words

// the six forks: the wrong idea, the truth, and which side the truth is on
const FORKS = [
  { no: "Blind people can't go out on their own.", yes: 'I go everywhere with my cane.', side: 'right' },
  { no: 'Blind people only see darkness.', yes: 'Lots of blind people see some light and color.', side: 'left' },
  { no: "Blind people can't make art.", yes: 'I paint, and so do lots of blind artists.', side: 'left' },
  { no: 'Blind people have to give up the things they love.', yes: 'I still love the things I always loved.', side: 'right' },
  { no: 'Blind people always need help.', yes: 'I ask for help when I want it.', side: 'left' },
  { no: 'Being blind changes who you are.', yes: 'Being blind is just one part of me.', side: 'right' },
];

// paths in the painting's pixels (1024 × 1024): the climb to the fork, and the two branches down to the billboards
const CLIMB = [[86, 92], [250, 34], [380, 262], [512, 196]];
const BRANCH = { left: [[512, 196], [440, 156], [300, 250], [212, 296]], right: [[512, 196], [584, 156], [724, 250], [812, 296]] };
const SIGN = { left: [205, 402], right: [819, 402] }, SIGN_W = 0.36, SIGN_H = 0.225;
const CAR_W = 0.16, CAR_H = CAR_W * 192 / 256;

function bez(p, n = 90) {
  const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t;
    pts.push([u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]]); }
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len, L: len[len.length - 1] };
}
// a point and the direction along a path, at a fraction of its length
function along(P, f) {
  const d = Math.max(0, Math.min(1, f)) * P.L; let i = 1; while (i < P.len.length - 1 && P.len[i] < d) i++;
  const a = P.pts[i - 1], b = P.pts[i], k = (d - P.len[i - 1]) / ((P.len[i] - P.len[i - 1]) || 1);
  return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, dx: b[0] - a[0], dy: b[1] - a[1] };
}

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uStorm, uFlash, uSun, uA, uRide, uZoom;
uniform float uL[12], uR[12];
// Alayna's outline below her shoulders: her left and right edge, every 40 px from y = 600 down
vec2 edges(float y){
  vec2 r = vec2(uL[0], uR[0]);
  for (int i = 0; i < 11; i++) {
    float y0 = 600.0 + 40.0 * float(i);
    if (y >= y0 && y < y0 + 40.0) { float t = (y - y0) / 40.0; r = vec2(mix(uL[i], uL[i + 1], t), mix(uR[i], uR[i + 1], t)); }
  }
  if (y >= 1040.0) r = vec2(uL[11], uR[11]);
  return r;
}
void main(){
  vec3 c = texture2D(map, vUv).rgb;
  // the ride: the coaster track under Alayna rushes toward you (an endless zoom out from where the rails meet, behind her),
  // right up to her outline, while she stays still. Where a sample would land on her, it slides out to her edge instead.
  if (uRide > 0.001) {
    vec2 p = vec2(vUv.x, 1.0 - vUv.y) * 1024.0, vp = vec2(512.0, 590.0);
    vec2 e = edges(p.y);
    float her = smoothstep(e.x - 9.0, e.x - 3.0, p.x) * (1.0 - smoothstep(e.y + 3.0, e.y + 9.0, p.x));
    float m = smoothstep(600.0, 640.0, p.y) * (1.0 - her) * uRide;
    if (m > 0.001) {
      vec2 d = p - vp; vec3 acc = vec3(0.0); float ws = 0.0; float left = p.x < 530.0 ? 1.0 : 0.0;
      for (int i = 0; i < 3; i++) {
        float f = fract(uZoom + float(i) / 3.0), w = sin(3.14159 * f);
        vec2 s = vp + d * pow(1.32, -f);
        vec2 es = edges(s.y);
        if (s.y > 600.0) s.x = left > 0.5 ? min(s.x, es.x - 10.0) : max(s.x, es.y + 10.0);
        acc += texture2D(map, vec2(s.x / 1024.0, 1.0 - s.y / 1024.0)).rgb * w; ws += w;
      }
      c = mix(c, acc / max(ws, 0.001), m);
    }
  }
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  vec3 storm = mix(vec3(l), c, 0.35) * vec3(0.62, 0.68, 0.84);   // dull and blue-grey
  vec3 o = mix(c, storm, uStorm);
  o *= 1.0 + uSun * 0.12 * (1.0 - vUv.y * 0.3);                  // and warm sun at the end
  o += vec3(0.85, 0.9, 1.0) * uFlash;                             // lightning
  gl_FragColor = vec4(o, uA);
}`;

/* ───────── the sound: a stormy pad that turns bright, coaster clicks, whooshes, cheers and thunder ───────── */
function sounds(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001; master.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p) => { if (!ac.createStereoPanner) return master; const n = ac.createStereoPanner(); n.pan.value = p; n.connect(master); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(pan(p)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, to = 0, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.004 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur); f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p)); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  // two pads always running: A minor (the storm) and C major (the clear sky); the game slides between them
  const pads = [];
  const pad = (notes, g0) => { const g = ac.createGain(); g.gain.value = g0; g.connect(master);
    notes.forEach((m, i) => { const o = ac.createOscillator(), f = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); o.detune.value = (i % 2 ? 6 : -6);
      f.type = 'lowpass'; f.frequency.value = 900; o.connect(f).connect(g); o.start(); pads.push(o); });
    return g; };
  const MUSIC = 0.67;   // the music sits a third lower than the sound effects (Ben's call)
  const stormPad = pad([45, 57, 60, 64], 0.05 * MUSIC), clearPad = pad([48, 60, 64, 67, 72], 0.0001);
  const wind = ac.createBufferSource(), wf = ac.createBiquadFilter(), wg = ac.createGain(); wind.buffer = nb; wind.loop = true; wf.type = 'lowpass'; wf.frequency.value = 500; wg.gain.value = 0.08 * MUSIC;
  wind.connect(wf).connect(wg).connect(master); wind.start(); pads.push(wind);
  const S = {
    start() { master.gain.setTargetAtTime(0.9, ac.currentTime, 0.2); },
    hold() { master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    mood(storm) { const t = ac.currentTime; stormPad.gain.setTargetAtTime(0.05 * MUSIC * storm + 0.0001, t, 0.8); clearPad.gain.setTargetAtTime(0.045 * MUSIC * (1 - storm) + 0.0001, t, 0.8); wg.gain.setTargetAtTime((0.08 * storm + 0.005) * MUSIC, t, 0.8); },
    click(p = 0) { noise(ac.currentTime, 0.03, { freq: 2600, q: 6, vol: 0.18, p }); tone(ac.currentTime, 900, 0.03, { type: 'square', vol: 0.02, p }); },
    whoosh(p = 0) { noise(ac.currentTime, 1.1, { freq: 300, to: 2600, q: 1.2, vol: 0.3, p, att: 0.3 }); },
    cheer(p = 0) { const t = ac.currentTime; [60, 64, 67, 72, 76].forEach((m, i) => tone(t + i * 0.07, 440 * Math.pow(2, (m - 69) / 12), 0.6, { type: 'triangle', vol: 0.08, p }));
      noise(t + 0.1, 1.0, { freq: 1400, q: 0.6, vol: 0.12, p, att: 0.2 }); },
    thunder() { const t = ac.currentTime; noise(t, 1.8, { freq: 160, type: 'lowpass', vol: 0.55, att: 0.02 }); noise(t + 0.1, 1.2, { freq: 90, type: 'lowpass', vol: 0.4, att: 0.3 }); tone(t, 70, 1.4, { vol: 0.12, slide: 40 }); },
    rush(secs) {   // the ride between forks: a long whoosh, wind, and fast click-clacks that speed up then slow down
      const t = ac.currentTime; noise(t, secs, { freq: 250, to: 1800, q: 0.8, vol: 0.32, att: secs * 0.35 });
      let k = 0; for (let x = 0.15; x < secs - 0.2; k++) { const f = x / secs, gap = 0.16 - 0.11 * Math.sin(Math.PI * f); noise(t + x, 0.025, { freq: 2400, q: 6, vol: 0.12 + 0.1 * Math.sin(Math.PI * f), p: k % 2 ? 0.4 : -0.4 }); x += gap; }
      tone(t + secs * 0.35, 520, 0.5, { type: 'triangle', vol: 0.05, slide: 780 }); tone(t + secs * 0.45, 660, 0.5, { type: 'triangle', vol: 0.05, slide: 990 });
    },
    hop(p = 0) { tone(ac.currentTime, 300, 0.5, { type: 'triangle', vol: 0.09, slide: 900, p }); },
    chime(p = 0) { const t = ac.currentTime; [72, 76, 79].forEach((m, i) => tone(t + i * 0.09, 440 * Math.pow(2, (m - 69) / 12), 0.7, { vol: 0.08, p })); },
    stop() { master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { pads.forEach(o => { try { o.stop(); } catch (e) {} }); try { master.disconnect(); } catch (e) {} }, 600); },
  };
  return S;
}

export function pickTrackGame() {
  let G = null;
  const B = (x, y) => G.S.P(x / 1024, y / 1024);            // painting pixels → board
  const panX = (x) => Math.max(-1, Math.min(1, (x / 1024 - 0.5) * 1.8));

  function hud() {
    G.ui.panel(G.phase === 'party' || G.over ? 'Pick Your Track · the sky is clear' : `Pick Your Track · fork ${Math.min(6, G.i + 1)} of 6`, `${G.truths}<small>true tracks</small>`, { segs: [G.done, 6] });
  }
  function redrawTracks() {
    const g = G.trackG; g.clearRect(0, 0, 1024, 1024);
    const F = FORKS[Math.min(5, G.i)], picked = G.pick;
    drawTrack(g, G.climb.pts, { w: 26 });
    for (const side of ['left', 'right']) {
      const greyed = picked && G.resolved && side !== F.side;
      drawTrack(g, G.branch[side].pts, { w: 26, grey: greyed, alpha: greyed ? 0.45 : 1 });
    }
    G.trackTex.needsUpdate = true;
  }
  function setSign(side, state) {
    const F = FORKS[G.i], m = G.signs[side];
    if (m.material.map) m.material.map.dispose();
    m.material.map = signTex(side === F.side ? F.yes : F.no, state, side === 'left' ? 'Left track' : 'Right track'); m.material.needsUpdate = true;
  }
  function forkSpeech() { const F = FORKS[G.i]; const L = F.side === 'left' ? F.yes : F.no, R = F.side === 'right' ? F.yes : F.no; return `Left track. ${L} Right track. ${R} Which track is true?`; }

  function beginFork() {
    G.phase = 'ride'; G.pt = 0; G.pick = null; G.resolved = false; G.hinted = false; G.clickT = 0;
    setSign('left', 'plain'); setSign('right', 'plain');
    for (const s of ['left', 'right']) { G.signs[s].userData.pop = 0; G.signs[s].visible = false; }
    G.trackA = 0; redrawTracks(); hud();
    G.say(`Fork ${G.i + 1}.`);
  }
  function choose(side) {
    if (!G || !G.playing || G.over || G.phase !== 'fork') return;
    G.pick = side; G.phase = 'swoop'; G.pt = 0; G.picks++;
    G.snd.click(side === 'left' ? -0.6 : 0.6); G.snd.whoosh(side === 'left' ? -0.6 : 0.6); G.say(''); G.buzz(20);
    G.ui.pop(side === 'left' ? 'LEFT' : 'RIGHT', innerWidth * (side === 'left' ? 0.28 : 0.72), innerHeight * 0.45);
  }
  function resolve() {
    const F = FORKS[G.i], ok = G.pick === F.side, [sx, sy] = SIGN[G.pick], p = panX(sx);
    G.resolved = true; G.phase = 'result'; G.pt = 0; G.ok = ok; redrawTracks();
    if (ok) {
      G.truths++; setSign(G.pick, 'true'); G.snd.cheer(p); G.buzz([30, 30, 60]);
      const [x, y] = B(sx, sy); G.fx.add(x, y, '#ffc928', 26, 0.45); G.fx.add(x, y, '#ff6a3a', 14, 0.35);
      G.say('True!'); G.resultLen = 2.6;
    } else {
      setSign(G.pick, 'false'); G.snd.thunder(); G.flash = 1; G.buzz([120]);
      G.say(`That one's not true. Here's the truth. ${F.yes}`); G.resultLen = 6.2; G.hopAt = 1.6;
    }
    hud();
  }
  function afterFork() {
    G.done = G.i + 1; G.storm = Math.max(0, 1 - G.done / 6); G.snd.mood(G.storm); hud();
    if (G.i >= 5) { G.phase = 'party'; G.pt = 0; for (const s of ['left', 'right']) G.signs[s].visible = false; G.say('The storm is over. Alayna is herself again.'); return; }
    G.i++; rush();
  }
  // between forks: the track rushes under Alayna, then the little car climbs to the next fork
  const RUSH = 3.4;
  function rush() {
    G.phase = 'rush'; G.pt = 0; G.snd.rush(RUSH);
    for (const s of ['left', 'right']) G.signs[s].visible = false;
    G.ui.alert('Hold on!', G.i === 0 ? 'Here we go' : 'On to fork ' + (G.i + 1), 1.4, 'red');
  }
  function help() {
    if (!G || !G.playing || G.over) return;
    if (G.phase === 'fork' || G.phase === 'ride') G.say('Tap the left side or the right side. Pick the track that tells the truth. ' + forkSpeech());
    else G.say('Tap the left side or the right side. Pick the track that tells the truth.');
    G.ui.alert('Pick the true track', 'Left side or right side', 2.2, 'black');
  }
  function hearAgain() { if (G && G.playing && (G.phase === 'fork' || G.phase === 'ride')) { G.say(forkSpeech()); G.forkT = 0; } else help(); }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('roller-coaster-of-emotions:track', G.truths, 'higher');
    K.finale(G, { won: true, kicker: 'Roller coaster of emotions', title: 'The sky is clear', line: G.work && G.work.quote, best: r.isBest && G.truths > 0,
      say: 'You rode all the way to the truth!',
      cells: [{ k: 'True first time', v: `${G.truths}/6` }, { k: 'Forks', v: '6' }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.endT = 0; G.snd.fade(0.5, 1.5);
  }
  // put the car on a path point (wheels on the rails), facing along it
  function placeCar(pt, pose) {
    let ang = Math.atan2(-pt.dy, pt.dx), mir = 1;
    if (pt.dx < 0) { ang = Math.atan2(pt.dy, -pt.dx); mir = -1; }
    const [x, y] = B(pt.x, pt.y), up = CAR_H * 0.36;
    G.car.position.set(x - Math.sin(ang) * up, y + Math.cos(ang) * up, 0.05);
    G.car.rotation.z = ang; G.car.scale.set(mir, 1, 1);
    G.car.material.map = carTex(pose);
  }

  return {
    title: 'Pick Your Track',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = slimHud();
      Object.assign(G, { phase: 'intro', zoom: 0, i: 0, done: 0, truths: 0, picks: 0, pt: 0, storm: 1, stormShown: 1, flash: 0, sun: 0, forkT: 0, endT: 0, t0: 0,
        climb: bez(CLIMB), branch: { left: bez(BRANCH.left), right: bez(BRANCH.right) }, clouds: [] });
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.snd = sounds(K.audio());
      // the painting, made stormy (then clear)
      G.uni = { map: { value: null }, uStorm: { value: 0 }, uFlash: { value: 0 }, uSun: { value: 0 }, uA: { value: 1 }, uRide: { value: 0 }, uZoom: { value: 0 },
        uL: { value: [318, 314, 318, 336, 334, 333, 333, 335, 342, 382, 392, 396] }, uR: { value: [684, 688, 702, 716, 727, 732, 732, 732, 730, 712, 682, 680] } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.015; G.face.renderOrder = 11; G.face.visible = false; G.root.add(G.face);
      new THREE.TextureLoader().load((ctx.work && ctx.work.image) || new URL('../../targets/roller-coaster-of-emotions.jpg', import.meta.url).href, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // storm clouds drifting over the sky
      for (const [x, y, s] of [[250, 120, 0.28], [700, 70, 0.32], [480, 40, 0.22], [120, 230, 0.2], [880, 200, 0.24]]) {
        const m = K.sprite(cloudTex(), s, { order: 12 }); m.scale.set(s, s / 2, 1); const [bx, by] = B(x, y); m.position.set(bx, by, 0.02); m.userData = { x0: bx, ph: Math.random() * 6 }; G.root.add(m); G.clouds.push(m);
      }
      // the tracks (one canvas over the whole painting), the billboards and the car
      const tc = document.createElement('canvas'); tc.width = tc.height = 1024; G.trackG = tc.getContext('2d'); G.trackTex = new THREE.CanvasTexture(tc); G.trackTex.colorSpace = THREE.SRGBColorSpace;
      G.tracks = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ map: G.trackTex, transparent: true, depthWrite: false, opacity: 0 }));
      G.tracks.position.z = 0.025; G.tracks.renderOrder = 13; G.root.add(G.tracks);
      G.signs = {};
      for (const side of ['left', 'right']) { const m = K.plane(null, SIGN_W, SIGN_H, { order: 14 }); const [x, y] = B(...SIGN[side]); m.position.set(x, y, 0.03); m.visible = false; G.root.add(m); G.signs[side] = m; }
      G.car = K.plane(carTex('ride'), CAR_W, CAR_H, { order: 16 }); G.car.visible = false; G.root.add(G.car);
      G.ui.buttons([
        { label: 'Left', kind: 'black', aria: 'Steer onto the left track', press: () => choose('left') },
        { label: 'Hear again', kind: 'red', aria: 'Hear the two billboards again', press: () => hearAgain() },
        { label: 'Right', kind: 'black', aria: 'Steer onto the right track', press: () => choose('right') },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.snd.start(); G.snd.mood(1); rush(); };
      K.intro(G, { title: 'Pick Your Track', how: 'At every fork, one billboard says a wrong idea about blind people and one tells the truth. Steer onto the true track.',
        say: 'Pick Your Track. Alayna is riding a roller coaster of emotions. At every fork, two tracks call out. One says a wrong idea about blind people. One tells the truth. Steer onto the true track. Six forks. Ready?' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni;
      G.stormShown += (G.storm - G.stormShown) * Math.min(1, dt * 1.2);
      u.uStorm.value = (G.phase === 'intro' ? Math.min(1, G.t * 0.5) : 1) * G.stormShown * 0.85;
      G.flash = Math.max(0, G.flash - dt * 2.5); u.uFlash.value = G.flash > 0.6 || (G.flash > 0.2 && G.flash < 0.35) ? 0.35 : 0;
      G.sun += ((G.phase === 'party' || G.over ? 1 : 0) - G.sun) * Math.min(1, dt); u.uSun.value = G.sun;
      for (const c of G.clouds) { c.position.x = c.userData.x0 + Math.sin(G.t * 0.15 + c.userData.ph) * 0.03; c.material.opacity = G.phase === 'intro' ? Math.min(1, G.t * 0.5) * 0.9 : Math.min(0.95, G.stormShown * 1.1 + G.flash * 0.3); }
      if (G.phase !== 'intro' && G.phase !== 'party' && G.phase !== 'rush' && !G.over) G.tracks.material.opacity = Math.min(1, G.tracks.material.opacity + dt * 2);
      for (const side of ['left', 'right']) { const m = G.signs[side]; if (!m.visible) continue; m.userData.pop = Math.min(1, m.userData.pop + dt * 3); const e = m.userData.pop, s = e < 1 ? 0.6 + 0.4 * (1 - Math.pow(1 - e, 3)) * (1 + Math.sin(e * Math.PI) * 0.12) : 1; m.scale.set(s, s, 1); m.material.opacity = Math.min(1, e * 1.5); }
      G.pt += dt;
      const F = FORKS[Math.min(5, G.i)];
      // how fast the track is rushing under her (speeds up, then slows to a stop)
      let speed = 0;
      if (G.phase === 'rush') speed = Math.pow(Math.sin(Math.PI * Math.min(1, G.pt / RUSH)), 0.6) * 2.4;
      if (G.phase === 'party') speed = 2.4 * Math.min(1, G.pt * 1.5);
      G.zoom += speed * dt; u.uZoom.value = G.zoom; u.uRide.value = Math.min(1, speed / 0.5);
      if (G.phase === 'rush') {
        G.car.material.opacity = Math.max(0, G.car.material.opacity - dt * 3); if (G.car.material.opacity <= 0) G.car.visible = false;
        G.tracks.material.opacity = Math.max(0.25, G.tracks.material.opacity - dt * 2);
        if (G.pt >= RUSH) beginFork();
      } else if (G.phase === 'ride') {   // the climb to the fork: slow click-click at first, then it rolls
        const D = 2.6, f = Math.min(1, G.pt / D), e = f < 0.6 ? f / 0.6 * 0.45 : 0.45 + (1 - Math.pow(1 - (f - 0.6) / 0.4, 2)) * 0.55;
        G.car.visible = true; G.car.material.opacity = Math.min(1, G.pt * 3);
        const pt = along(G.climb, e); placeCar(pt, 'ride');
        G.clickT -= dt; if (f < 0.6 && G.clickT <= 0) { G.clickT = 0.13; G.snd.click(panX(pt.x)); }
        if (G.pt > 0.8 && !G.signs.left.visible) { G.signs.left.visible = G.signs.right.visible = true; }
        if (f >= 1) { G.phase = 'fork'; G.pt = 0; G.forkT = 0; G.say(forkSpeech()); }
      } else if (G.phase === 'fork') {   // waiting at the top, rocking a little
        G.forkT += dt; const pt = along(G.climb, 1); placeCar(pt, 'ride'); G.car.rotation.z += Math.sin(G.t * 5) * 0.03;
        if (G.forkT > 16 && !G.hinted) { G.hinted = true; G.say('Which track is true? Left, or right?'); G.ui.alert('Left or right?', 'Pick the true track', 2, 'black'); }
        if (G.bot && G.forkT > 1.2) choose(G.i === 1 ? (F.side === 'left' ? 'right' : 'left') : F.side);
      } else if (G.phase === 'swoop') {   // down the chosen branch
        const f = Math.min(1, G.pt / 1.3), e = f * f * (3 - 2 * f), pt = along(G.branch[G.pick], e);
        placeCar(pt, G.pick === F.side && f > 0.35 ? 'hands' : 'ride');
        if (f >= 1) resolve();
      } else if (G.phase === 'result') {
        if (G.ok) { placeCar(along(G.branch[G.pick], 1), 'hands'); }
        else {
          const other = F.side, a = along(G.branch[G.pick], 1), b = along(G.branch[other], 1);
          if (G.pt < G.hopAt) placeCar(a, 'ride');
          else {   // the car hops across to the true track
            const f = Math.min(1, (G.pt - G.hopAt) / 1.1), e = f * f * (3 - 2 * f);
            if (!G.hopped) { G.hopped = true; G.snd.hop(0); }
            const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e - Math.sin(Math.PI * e) * 180;
            placeCar({ x, y, dx: b.x - a.x, dy: 0 }, f > 0.4 ? 'hands' : 'ride');
            if (f >= 1 && !G.landed) { G.landed = true; setSign(other, 'true'); G.snd.chime(panX(b.x)); const [bx, by] = B(...SIGN[other]); G.fx.add(bx, by, '#ffc928', 18, 0.35); }
          }
        }
        if (G.pt > G.resultLen) { G.hopped = G.landed = false; afterFork(); }
      } else if (G.phase === 'party') {   // a victory lap over the whole sky, hands up
        const f = Math.min(1, G.pt / 4.5), a = f * Math.PI * 2;
        const x = 512 + Math.cos(a - Math.PI / 2) * 380, y = 200 + Math.sin(a - Math.PI / 2) * 130 + 80;
        placeCar({ x, y, dx: -Math.sin(a - Math.PI / 2), dy: Math.cos(a - Math.PI / 2) * 0.34 }, 'hands');
        G.trackA = 0; G.tracks.material.opacity = Math.max(0, 1 - G.pt);
        if (Math.floor(G.pt * 3) !== Math.floor((G.pt - dt) * 3)) { const [bx, by] = B(100 + Math.random() * 824, 60 + Math.random() * 300); G.fx.add(bx, by, ['#ffc928', '#ff6a3a', '#4fb0ff', '#ff6fae'][Math.floor(Math.random() * 4)], 16, 0.4); }
        if (G.pt > 5) finish();
      }
      if (G.over) {
        G.endT += dt; G.car.material.opacity = Math.max(0, 1 - G.endT * 0.8); u.uA.value = Math.max(0, 1 - Math.max(0, G.endT - 3) * 0.4);
        for (const c of G.clouds) c.visible = false;
        if (!G.artist && G.endT > 2.5) {
          G.snd.fade(0.08, 0.6);
          const back = () => { if (G && !G.sndOff) { G.sndOff = true; G.snd.fade(0.0001, 4); } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.play().catch(() => {}); } catch (e) { G.artist = {}; }
          G.artistSafety = G.endT + 22;
        }
        if (G.artist && !G.sndOff && G.endT > G.artistSafety) { G.sndOff = true; G.snd.fade(0.0001, 4); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const x = ev && ev.clientX !== undefined ? ev.clientX : innerWidth / 2;
      choose(x < innerWidth / 2 ? 'left' : 'right');
    },
    pause() { if (G) { G.paused = true; G.snd.hold(); if (G.artist && G.artist.pause) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; if (!G.sndOff) G.snd.fade(G.over ? 0.08 : 0.9, 0.3); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'pick-track', phase: G.phase, ride: +G.uni.uRide.value.toFixed(2), playing: G.playing, over: G.over, fork: G.i + 1, done: G.done, truths: G.truths, picks: G.picks, storm: +G.storm.toFixed(2),
      artist: G.artist && G.artist.currentTime !== undefined ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.snd.stop(); if (G.artist && G.artist.pause) G.artist.pause(); G.artist = null; for (const s of ['left', 'right']) if (G.signs[s].material.map) G.signs[s].material.map.dispose(); G.trackTex.dispose(); }
      if (G && G.css) G.css.remove();
      K.cleanup(G); G = null;
    },
  };
}
