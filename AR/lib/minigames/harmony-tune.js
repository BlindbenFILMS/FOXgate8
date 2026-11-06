// THE HARMONY OF VISION (Academy of Music for the Blind): TUNE IT UP, a singing-in-tune game played by ear.
// “I feel like these students have incredible vision. They tell us, the teachers, this is what I want to do, this is how
// I want to play or sing better.” — Deb Beyer, AMB vocal instructor
// Deb sings a golden note (a little to the LEFT). Then a student sings a note that's a little off (a little to the RIGHT).
// Hold UP or DOWN (or slide a finger up or down the screen) to bend the student's note until the two ring together as one.
// You can hear it: when they're close the sound wobbles (the two notes beat against each other), slower and slower,
// and when they're in tune it goes smooth and the two voices meet in the middle. Hold it there for a moment and it locks:
// one of the painting's six round shapes lights up (the white moon, the coloured ball, the golden sun, the red circle,
// the blue ball, the yellow moon) and joins the music. Six notes. Then the whole painting swirls and sings, and Deb speaks.
// On screen: Deb's golden note sits on a dashed golden line; the student's blue note rides above or below it. Level = in tune.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas, CIRCLES } from './harmony-things.js';

const DEB = new URL('../../../3D/gallery/audio/art_57.mp3', import.meta.url).href;   // Deb Beyer, in her own words
const NOTES = 6;
// each round: Deb's note (midi), where the student starts (semitones off), and how close counts as in tune (semitones)
const ROUNDS = [
  { m: 64, off: 4, tol: 0.32 }, { m: 67, off: -4, tol: 0.3 }, { m: 62, off: 3, tol: 0.27 },
  { m: 69, off: -5, tol: 0.25 }, { m: 65, off: 5, tol: 0.23 }, { m: 72, off: -3.5, tol: 0.22 },
];
const CHORD = { 64: [48, 55, 60, 64], 67: [48, 55, 60, 64], 62: [43, 50, 55, 59], 69: [41, 48, 53, 57], 65: [41, 48, 53, 57], 72: [48, 55, 60, 64] };
const INTRO = 21.6;                        // seconds: Ben's recorded intro, then the countdown
const LOCK = 1.0;                          // seconds to hold it in tune
const RANGE = 7;                           // semitones the student's note can go either way
const MID = { v: 0.54 }, TEACH_U = 0.37, STU_U = 0.63, PER = 0.032;   // where the notes sit (v per semitone)
const L = {
  title: 'Tune it up',
  how: "Slide the student's note UP or DOWN until it rings true with Deb's golden note.",
  intro: ['Tune it up.', 'Deb teaches singing at the Academy of Music for the Blind.', 'Listen to her golden note.',
    "Then a student sings a note that's a little off.", 'Slide it up or down until the two notes ring together as one.',
    "When it's close, it wobbles. When it's in tune, it's smooth.", 'Ready?'],
  note: ['Note 1.', 'Note 2.', 'Note 3.', 'Note 4.', 'Note 5.', 'The last note.'],
  higher: 'Higher.', lower: 'Lower.', hold: 'Hold it there.', tune: 'In tune!',
  more: { 5: '5 more.', 4: '4 more.', 3: '3 more.', 2: '2 more.', 1: '1 more.' },
  all: 'All six notes are in tune!', end: 'The whole painting sings in harmony!',
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, alive: its waves and spirals flow (more with every note in tune), it starts dim and gets its colour back
// note by note, and it pulses warm when a note locks in tune
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uFlow, uLife, uFlash, uA;
void main(){
  vec2 p = vUv;
  float f = 0.0025 + 0.005 * uFlow;
  p += vec2(sin(p.y * 9.0 + uT * 0.9) + 0.6 * sin(p.y * 17.0 - uT * 1.3 + p.x * 6.0),
            cos(p.x * 8.0 - uT * 0.8) + 0.6 * sin(p.x * 15.0 + uT * 1.1 - p.y * 5.0)) * f;
  vec3 c = texture2D(map, clamp(p, 0.001, 0.999)).rgb;
  float g = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(vec3(g) * vec3(0.7, 0.74, 0.9) * 0.7, c, uLife);
  c += vec3(1.0, 0.8, 0.45) * uFlash * 0.18;
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── the band: two singing voices, a warm pad, and music-box parts that join one by one ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0.7; mus.connect(out);
  function tone(t, f, dur, { type = 'sine', vol = 0.08, att = 0.01, p = 0, dest = mus } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(), pn = ac.createStereoPanner ? ac.createStereoPanner() : null; o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (pn) { pn.pan.value = p; o.connect(g).connect(pn).connect(dest); } else o.connect(g).connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  // a singing voice: a buzzy tone shaped by "ooh" or "aah" mouth resonances, with a little vibrato
  function voice(p, formants, vib) {
    const o = ac.createOscillator(); o.type = 'sawtooth';
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.2; lg.gain.value = 0; lfo.connect(lg).connect(o.frequency); lfo.start();
    const g = ac.createGain(); g.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    const sum = ac.createGain(); sum.gain.value = 1;
    o.connect(lp);
    formants.forEach(([f, q, v]) => { const b = ac.createBiquadFilter(), bg = ac.createGain(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; bg.gain.value = v; lp.connect(b).connect(bg).connect(sum); });
    const pn = ac.createStereoPanner ? ac.createStereoPanner() : null; if (pn) pn.pan.value = p;
    sum.connect(g); if (pn) g.connect(pn).connect(out); else g.connect(out);
    o.start();
    return {
      freq(f, glide = 0.03) { o.frequency.setTargetAtTime(f, ac.currentTime, glide); lg.gain.setTargetAtTime(f * vib, ac.currentTime, 0.1); },
      vol(v, k = 0.08) { g.gain.setTargetAtTime(v, ac.currentTime, k); },
      pan(v) { if (pn) pn.pan.setTargetAtTime(v, ac.currentTime, 0.25); },
      stop() { try { o.stop(); lfo.stop(); } catch (e) {} },
    };
  }
  const deb = voice(-0.4, [[400, 6, 1.6], [800, 8, 0.9], [2600, 10, 0.25]], 0.0025);   // "ooh", warm
  const kid = voice(0.4, [[700, 6, 1.4], [1150, 8, 1.0], [2800, 10, 0.3]], 0);         // "aah", brighter, steady (so the wobble is clear)
  // the pad and the music-box parts: one more part for every note in tune, each from its circle's side
  let chord = CHORD[64], parts = [], next = 0, step = 0, timer = null, on = false;
  const BEAT = 60 / 76 / 2;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, s = step % 16;
      if (on) {
        if (s === 0) chord.forEach((m, i) => tone(t, midi(m), BEAT * 16, { type: 'triangle', vol: 0.016 + parts.length * 0.003, att: 0.6, p: (i - 1.5) * 0.3 }));
        parts.forEach((pt, i) => {
          const pat = [[0, 6, 10], [3, 8, 13], [2, 5, 12], [4, 9, 14], [1, 7, 11], [0, 4, 8, 12]][i];
          if (pat.includes(s)) tone(t, midi(chord[(s + i) % 4] + 24 + (i % 2) * 12), 0.6, { type: 'sine', vol: 0.03, att: 0.005, p: pt.p });
        });
      }
      next += BEAT; step++;
    }
  }
  return {
    deb, kid,
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.3); next = ac.currentTime + 0.1; timer = setInterval(schedule, 25); },
    music(v) { on = v; },
    chordFor(m) { chord = CHORD[m] || chord; },
    addPart(p) { parts.push({ p }); },
    // the lock: the two voices bloom together, and the circle's bell rings from its side
    lock(m, p) {
      const t = ac.currentTime + 0.02;
      [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.08, midi(m + d), 1.4, { type: 'triangle', vol: 0.06, att: 0.02 }));
      tone(t + 0.35, midi(m + 24), 2.2, { vol: 0.07, p }); tone(t + 0.35, midi(m + 31), 1.6, { vol: 0.03, p });
    },
    // a soft rising shimmer while you hold it in tune
    shimmer(k) { tone(ac.currentTime + 0.01, 1200 + 900 * k, 0.12, { vol: 0.012 + 0.02 * k, p: 0 }); },
    finale(ms) {
      const t = ac.currentTime + 0.05;
      ms.forEach((m, i) => tone(t + i * 0.18, midi(m), 3.5 - i * 0.2, { type: 'triangle', vol: 0.05, att: 0.03, p: (i - 2.5) * 0.3 }));
      [48, 55, 60, 64, 67, 72].forEach(m => tone(t + 1.2, midi(m), 4, { type: 'triangle', vol: 0.025, att: 0.5 }));
    },
    quiet(v) { mus.gain.setTargetAtTime(v, ac.currentTime, 0.4); },
    hush(v) { out.gain.setTargetAtTime(v ? 0 : 0.9, ac.currentTime, 0.1); },
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} setTimeout(() => { deb.stop(); kid.stop(); }, 400); },
  };
}

export function tuneItUpGame() {
  let G = null;
  const tex = {};
  const T = k => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };

  const R = () => ROUNDS[G.round];
  const diff = () => G.pitch;                                   // semitones the student is off (+ = too high)
  function hud() {
    let sub = "Hold ▲ UP or ▼ DOWN, or slide your finger";
    if (G.phase === 'tune') { const d = diff(), tol = R().tol; sub = Math.abs(d) < tol ? 'IN TUNE · hold it there' : d > 0 ? 'Too high · go ▼ DOWN' : 'Too low · go ▲ UP'; }
    G.ui.panel('Tune it up', `${G.lit}<small>of ${NOTES} in tune</small>`, { segs: [G.lit, NOTES], sub });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; hud(); }

  function startRound() {
    const r = R(); G.pitch = r.off; G.lockT = 0; G.hintT = 0; G.saidHold = false;
    G.band.chordFor(r.m); G.band.deb.freq(midi(r.m), 0.01); G.band.deb.vol(0.075); G.band.deb.pan(-0.4); G.band.kid.pan(0.4);
    G.say(L.note[G.round]);
    setPhase('listen');
  }
  function lock() {
    const r = R(), c = CIRCLES[G.lit];
    G.lit++; G.flash = 1; G.buzz([40, 30, 80]);
    G.band.kid.freq(midi(r.m), 0.05); G.band.lock(r.m, (c.u - 0.5) * 1.6); G.band.addPart((c.u - 0.5) * 1.6);
    G.band.deb.pan(0); G.band.kid.pan(0);
    G.halos[G.lit - 1].k = 0.001;
    const [x, y] = G.S.P(c.u, c.v); G.fx.add(x, y, '#ffd66e', 26, 0.4);
    const [mx, my] = G.S.P(0.5, MID.v); G.spark.position.set(mx, my, 0.07); G.spark.material.opacity = 1; G.sparkT = 0;
    G.say(G.lit < NOTES ? L.tune + ' ' + L.more[NOTES - G.lit] : L.tune + ' ' + L.all);
    G.ui.alert('In tune!', G.lit < NOTES ? `${NOTES - G.lit} more` : 'All six!', 1.4, 'black');
    setPhase('got');
  }
  function nudge(d) {
    if (!G || G.phase !== 'tune' || G.over) return;
    G.pitch = Math.max(-RANGE, Math.min(RANGE, G.pitch + d));
  }

  return {
    title: 'Tune it up',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, round: 0, lit: 0, pitch: 0, lockT: 0, hintT: 0, hold: 0, holdT: 0, flash: 0, sparkT: 9, drag: null, endT: 0, artist: null, wob: 0 });
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the painting, alive
      G.uni = { map: { value: null }, uT: { value: 0 }, uFlow: { value: 0 }, uLife: { value: 0.55 }, uFlash: { value: 0 }, uA: { value: 0 } };
      G.art = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.art.renderOrder = 11; G.art.position.z = 0.03; G.root.add(G.art);
      if (G.work && G.work.image) new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.artOK = true; });
      // a soft dark stage behind the two notes, so they read on the busy painting
      G.stage = K.plane(K.canvasTex(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 20, 128, 128, 128); r.addColorStop(0, 'rgba(8,10,28,.75)'); r.addColorStop(0.7, 'rgba(8,10,28,.5)'); r.addColorStop(1, 'rgba(8,10,28,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); }), 0.78, 0.62 * G.h, { order: 20, opacity: 0 });
      { const [x, y] = G.S.P(0.5, MID.v); G.stage.position.set(x, y, 0.04); G.root.add(G.stage); }
      // the dashed golden line at Deb's pitch
      G.line = K.plane(K.canvasTex(512, 32, (g) => { g.fillStyle = 'rgba(255,214,110,.95)'; for (let x = 0; x < 512; x += 36) g.fillRect(x, 12, 22, 8); }), 0.6, 0.6 / 16, { order: 21, opacity: 0 });
      { const [x, y] = G.S.P(0.5, MID.v); G.line.position.set(x, y, 0.045); G.root.add(G.line); }
      // the two notes, the lock ring and the spark
      G.teach = K.sprite(T('teacher'), 0.26, { order: 24, opacity: 0 }); G.root.add(G.teach);
      G.stu = K.sprite(T('student'), 0.26, { order: 25, opacity: 0 }); G.root.add(G.stu);
      G.ring = K.sprite(K.ringTex, 0.1, { order: 23, opacity: 0, color: '#ffe9a8' }); G.root.add(G.ring);
      G.spark = K.sprite(T('spark'), 0.5, { order: 30, opacity: 0, additive: true }); G.root.add(G.spark);
      // a halo waiting on each of the six circles
      G.halos = CIRCLES.map(c => { const s = K.sprite(T('halo'), c.r * 3.2, { order: 22, opacity: 0, additive: true }); const [x, y] = G.S.P(c.u, c.v); s.position.set(x, y, 0.05); G.root.add(s); return { s, k: 0, r: c.r }; });
      G.btns = G.ui.buttons([
        { label: 'Down', icon: '▼', kind: 'black', aria: "Slide the student's note down", press: () => { G.hold = -1; G.holdT = 0; nudge(-0.12); }, release: () => { if (G.hold === -1) G.hold = 0; } },
        { label: 'Up', icon: '▲', kind: 'red', aria: "Slide the student's note up", press: () => { G.hold = 1; G.holdT = 0; nudge(0.12); }, release: () => { if (G.hold === 1) G.hold = 0; } },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.music(true); startRound(); };
      K.intro(G, { title: L.title, how: L.how, say: L.intro.join(' ') });
      if (!G.bot) G._introT = INTRO;   // wait for the whole spoken intro (tap the screen to skip it)
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over && !G.artist) {
        G.endT += dt;
        if (G.endT > 2.5) { G.artist = new Audio(DEB); G.artist.play().catch(() => {}); G.band.quiet(0.25); }
      }
      const ph = G.phase, r = G.round < NOTES ? R() : null;

      // holding a button bends the note: slowly at first for fine tuning, faster the longer you hold
      if (G.hold && ph === 'tune') { G.holdT += dt; nudge(G.hold * dt * Math.min(3.2, 0.9 + G.holdT * 2.2)); }

      if (ph === 'listen') {
        // Deb sings alone, then the student comes in
        if (G.phT > 1.7) { G.band.kid.freq(midi(r.m + G.pitch), 0.01); G.band.kid.vol(0.07); setPhase('tune'); }
      } else if (ph === 'tune') {
        G.band.kid.freq(midi(r.m + G.pitch), 0.02);
        const d = diff(), inT = Math.abs(d) < r.tol;
        // the closer they are, the more the two voices drift toward the middle
        const near = Math.max(0, 1 - Math.abs(d) / 2);
        G.band.deb.pan(-0.4 * (1 - near * 0.6)); G.band.kid.pan(0.4 * (1 - near * 0.6));
        if (inT) {
          G.lockT += dt;
          if (!G.saidHold && G.round === 0) { G.saidHold = true; G.say(L.hold); }
          if (Math.floor(G.lockT * 8) !== Math.floor((G.lockT - dt) * 8)) G.band.shimmer(Math.min(1, G.lockT / LOCK));
          if (G.lockT >= (G.round === 0 ? 1.5 : LOCK)) lock();   // the first note holds a little longer, so "Hold it there." finishes
        } else {
          G.lockT = Math.max(0, G.lockT - dt * 2);
          G.hintT += dt;
          if (G.hintT > (G.round === 0 ? 5 : 7)) { G.hintT = 0; G.say(d > 0 ? L.lower : L.higher); }
        }
        if (Math.floor(G.t * 4) !== Math.floor((G.t - dt) * 4)) hud();
      } else if (ph === 'got') {
        if (G.phT > 0.6) G.band.kid.vol(0, 0.3);
        if (G.phT > 3.6) {   // room for "In tune! 5 more." to finish
          G.round++;
          if (G.round < NOTES) startRound();
          else { setPhase('sing'); G.band.deb.vol(0, 0.4); G.band.finale(ROUNDS.map(x => x.m)); G.buzz([60, 40, 60, 40, 120]); }
        }
      } else if (ph === 'sing') {
        if (G.phT > 3.6 && !G.over) {
          const secs = Math.round(G.t - G.t0), b = K.best('the-harmony-of-vision:time', secs, 'lower');
          K.finale(G, { won: true, kicker: 'The Harmony of Vision', title: 'In harmony', line: G.work && G.work.quote, best: b.isBest, say: L.end,
            cells: [{ k: 'Notes in tune', v: NOTES }, { k: 'Time', v: secs + 's' }] });
          G.endT = 0;
        }
      }

      // ── what you see ──
      const show = ph === 'listen' || ph === 'tune' || ph === 'got';
      const fade = (m, on, k = 3) => { m.material.opacity += ((on ? 1 : 0) - m.material.opacity) * Math.min(1, dt * k); };
      fade(G.stage, show && G.artOK); fade(G.line, show); fade(G.teach, show);
      fade(G.stu, ph === 'tune' || (ph === 'got' && G.phT < 1.2), 5);
      const [tx, ty] = G.S.P(TEACH_U, MID.v), bob = Math.sin(G.t * 2.4) * 0.006;
      G.teach.position.set(tx, ty + 0.078 + bob, 0.05); G.teach.scale.setScalar(0.26 * (1 + 0.05 * Math.sin(G.t * 5.2)));
      // the student's note: above or below the line by how far off it is, and it wobbles as fast as the two voices beat
      const d = diff(), beat = r ? Math.abs(midi(r.m + d) - midi(r.m)) : 0;
      G.wob = beat < 0.5 ? 0 : Math.min(1, beat / 4);
      let su = STU_U, sv = MID.v - Math.max(-RANGE, Math.min(RANGE, d)) * PER;
      if (ph === 'got') { const k = Math.min(1, G.phT / 0.6); su = STU_U + (0.5 - STU_U) * k; sv = MID.v; }
      const [sx, sy] = G.S.P(su, sv);
      G.stu.position.set(sx + Math.sin(G.t * Math.min(40, beat * 2 * Math.PI)) * 0.008 * G.wob, sy + 0.078, 0.055);
      G.stu.material.rotation = Math.sin(G.t * Math.min(40, beat * 2 * Math.PI)) * 0.12 * G.wob;
      if (ph === 'got') { const k = Math.min(1, G.phT / 0.6), [mx] = G.S.P(0.5, MID.v); G.teach.position.x = tx + (mx - tx) * k; }
      // the lock ring grows around the student's note while you hold it in tune
      const lk = ph === 'tune' ? Math.min(1, G.lockT / (G.round === 0 ? 1.5 : LOCK)) : 0;
      G.ring.position.set(sx, sy, 0.052); G.ring.scale.setScalar(0.06 + 0.16 * lk); G.ring.material.opacity = lk > 0.02 ? 0.4 + 0.6 * lk : 0;
      // the spark and the halos
      G.sparkT += dt; G.spark.material.opacity = Math.max(0, 1 - G.sparkT / 0.9); G.spark.scale.setScalar(0.3 + G.sparkT * 0.5); G.spark.material.rotation = G.sparkT;
      G.halos.forEach((h, i) => {
        if (!h.k) return; h.k = Math.min(1, h.k + dt * 1.5);
        const pulse = ph === 'sing' || G.over ? 0.15 * Math.sin(G.t * 4 + i) : 0.06 * Math.sin(G.t * 2 + i);
        h.s.material.opacity = (G.over && G.endT > 1.2 ? 0.4 : 0.9) * h.k; h.s.scale.setScalar(h.r * 3.2 * (0.6 + 0.4 * h.k + pulse)); h.s.material.rotation = G.t * 0.3;
      });
      // the painting: flows more, and gets its colour back, note by note
      G.flash = Math.max(0, G.flash - dt * 1.5);
      G.uni.uT.value = G.t;
      G.uni.uFlow.value += ((G.lit / NOTES + (ph === 'sing' ? 0.8 : 0)) - G.uni.uFlow.value) * Math.min(1, dt);
      G.uni.uLife.value += ((0.55 + 0.45 * G.lit / NOTES) - G.uni.uLife.value) * Math.min(1, dt * 1.5);
      G.uni.uFlash.value = G.flash + (ph === 'sing' ? 0.3 + 0.3 * Math.sin(G.t * 6) : 0);
      G.uni.uA.value += ((G.artOK && !(G.over && G.endT > 1.2) ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);

      // ── the robot: slides toward the right pitch, overshoots once on note 2 so you hear the wobble, and locks every note ──
      if (G.bot && ph === 'tune') {
        const want = G.round === 1 && G.phT < 1.4 ? 1.5 : 0, e = d - want;
        G.hold = Math.abs(e) < 0.08 ? 0 : e > 0 ? -1 : 1;
        if (Math.abs(e) < 0.35) { G.holdT = 0; }   // slow down near the target
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'down' && G._introT > 0) { G._introT = 0; if (G.say.stop) G.say.stop(); G._introGo(); return; }   // tap to skip the intro
      // slide a finger up or down anywhere on the screen
      if (kind === 'down') { G.drag = { y: ev.clientY }; K.audio(); }
      else if (kind === 'move' && G.drag) { const dy = ev.clientY - G.drag.y; G.drag.y = ev.clientY; nudge(-dy / (innerHeight * 0.07)); }
      else if (kind === 'up') G.drag = null;
    },
    pause() { if (G) { G.paused = true; G.band.hush(true); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.hush(false); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'tune', phase: G.phase, playing: G.playing, over: G.over, round: G.round, lit: G.lit, off: +G.pitch.toFixed(2), lock: +G.lockT.toFixed(2), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
