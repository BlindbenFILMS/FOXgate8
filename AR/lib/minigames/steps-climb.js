// A BRIGHT FUTURE (Academy of Music for the Blind): CLIMB THE SCALE, a tap-on-the-beat game.
// “Most of all, I want to serve them. I want to have the delight to know that they get to be the glorious people that
// they are, feel that self-esteem and self-worth, and be able to make the great music that they make.” — David Pinto
// The girl on the painting's musical staircase (cut out: media/games/steps/girl.png, the wall painted in behind her:
// wall.jpg) looks up at the misty sky. A new stair made of sheet music appears above her and counts in with the music:
// tick, tick, tick (from its side of the painting), then it GLOWS and sings its note. Tap right when it sings and she
// hops up onto it. Do, Re, Mi, Fa, Sol, La, Ti, Do: 8 stairs up into the sky. After each stair, the staircase plays back
// the scale so far. Too early or too late, and the stair just counts in again. At the top the whole sky lights up gold,
// the scale rings out, and David speaks in his own voice.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas, GIRL, START, STAIRS, NAMES } from './steps-things.js';

const DAVID = new URL('../../../3D/gallery/audio/art_55.mp3', import.meta.url).href;   // David Pinto, in his own words
const ART = new URL('../../media/games/steps/', import.meta.url).href;
const N = STAIRS.length;
const INTRO = 21;                          // seconds: Ben's recorded intro, then the countdown
const BPM = 84, BEAT = 60 / BPM, BAR = BEAT * 4;
const EARLY = 0.3, LATE = 0.34;                     // seconds around the glow that count as on the beat
const SCALE = [72, 74, 76, 77, 79, 81, 83, 84];      // C major, Do to high Do
const CHORDS = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]];   // C · Am · F · G
const SAY_NOTE = ['Do.', 'Re.', 'Mi.', 'Fa.', 'Sol.', 'La.', 'Ti.', 'Do!'];
const L = {
  title: 'Climb the scale',
  how: 'Each new stair counts in: one, two, three. Then it glows and sings. TAP right when it sings, and she climbs.',
  intro: ['Climb the scale.', 'Music is her staircase into a bright future.', 'Each new stair counts in: one, two, three.',
    'Then it glows and sings its note.', 'Tap right when it sings, and she climbs.', 'Eight stairs, all the way up the scale.', 'Ready?'],
  early: 'Wait for it to sing.', missed: 'Missed it. Try again.', hint: 'Tap when it sings.',
  half: 'Halfway up!', top: 'She reached the top of the scale!', end: 'A bright future!',
};
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

/* ───────────────────────── the band: a gentle piano groove that grows as she climbs ───────────────────────── */
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0.75; mus.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const panN = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, d, { type = 'sine', vol = 0.08, att = 0.006, p = 0, dest = mus } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(panN(p, dest)); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(t, d, { freq = 6000, type = 'highpass', vol = 0.04, p = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f).connect(g).connect(panN(p, mus)); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  }
  // a soft piano-ish note: a sine with a quiet bright overtone
  const piano = (t, m, d, vol, p = 0) => { tone(t, midi(m), d, { vol, p }); tone(t, midi(m) * 2, d * 0.5, { vol: vol * 0.25, p }); tone(t, midi(m) * 3, d * 0.25, { vol: vol * 0.08, p }); };
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.3); },
    now: () => ac.currentTime,
    // one bar of the groove (bar n of the song), richer the higher she is
    bar(t, n, level) {
      const ch = CHORDS[n % 4];
      tone(t, midi(ch[0] - 12), BAR * 0.95, { type: 'triangle', vol: 0.06 });
      for (let b = 0; b < 4; b++) {
        if (b === 0 || b === 2) tone(t + b * BEAT, 90, 0.16, { vol: 0.12 });
        if (level >= 2) noise(t + b * BEAT + BEAT / 2, 0.04, { vol: 0.03 });
        ch.forEach((m, i) => piano(t + b * BEAT + (level >= 4 ? i * 0.04 : 0), m + 12, BEAT * 0.9, 0.012 + level * 0.002));
      }
      if (level >= 6) ch.forEach((m, i) => tone(t, midi(m + 24), BAR, { type: 'triangle', vol: 0.008, att: 0.4 }));
    },
    // the stair counting in: a soft wood tick from its side
    tick(t, p) { tone(t, 1300, 0.05, { type: 'square', vol: 0.03, p }); tone(t, 650, 0.08, { vol: 0.06, p }); },
    // the stair sings its note (and rings out bright when she lands on it)
    sing(t, i, p, vol = 0.12) { piano(t, SCALE[i], 1.2, vol, p); },
    land(i, p) { const t = ac.currentTime + 0.01; piano(t, SCALE[i] + 12, 0.8, 0.06, p); tone(t, midi(SCALE[i] + 19), 0.6, { vol: 0.02, p }); },
    early() { tone(ac.currentTime + 0.01, 300, 0.12, { type: 'triangle', vol: 0.05 }); },
    // the staircase plays back the scale so far
    melody(t, upto) { const gap = Math.min(BEAT, (BAR - BEAT * 0.25) / (upto + 1)); for (let k = 0; k <= upto; k++) piano(t + k * gap, SCALE[k], 0.9, 0.08, (STAIRS[k].u - 0.5) * 1.4); },
    top() {
      const t = ac.currentTime + 0.05;
      SCALE.forEach((m, k) => piano(t + k * 0.14, m, 1.6, 0.08, (STAIRS[k].u - 0.5) * 1.4));
      [48, 55, 60, 64, 67, 72, 76].forEach((m, k) => tone(t + 1.2 + k * 0.03, midi(m), 4, { type: 'triangle', vol: 0.03, att: 0.3 }));
      piano(t + 1.2, 84, 3, 0.1); piano(t + 1.2, 88, 3, 0.06); piano(t + 1.2, 91, 3, 0.05);
    },
    quiet(v) { mus.gain.setTargetAtTime(v, ac.currentTime, 0.4); },
    hush(v) { out.gain.setTargetAtTime(v ? 0 : 0.9, ac.currentTime, 0.1); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} },
  };
}

export function climbTheScaleGame() {
  let G = null;
  const tex = {};
  const T = (k, i = 0) => { const key = k + i; if (!tex[key]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256, i)); t.colorSpace = THREE.SRGBColorSpace; tex[key] = t; } return tex[key]; };
  const pan = i => (STAIRS[i].u - 0.5) * 1.4;
  const SIZE = 0.15;                                   // a stair's sprite size (the top face sits 0.08 × size above its centre)

  function hud(beat = -1) {
    let sub = 'TAP when the stair sings';
    if (G.phase === 'play' && G.bar && G.bar.type === 'try') sub = ['1 …', '1 · 2 …', '1 · 2 · 3 …', 'TAP NOW!'][beat] || sub;
    if (G.bar && G.bar.type === 'climb') sub = NAMES.slice(0, G.n).join(' · ');
    G.ui.panel('Climb the scale', `${G.n}<small>of ${N} stairs</small>`, { segs: [G.n, N], sub, warn: beat === 3 });
  }

  // plan the next bar on the music's own clock
  function nextBar() {
    const t = G.barAt, type = G.after === 'climb' ? 'climb' : G.n >= N ? 'top' : G.after === 'groove' ? 'groove' : 'try';
    G.bar = { type, t, i: G.n, beat: -1, hit: false, judged: false };
    G.after = null;
    if (type === 'top') return top();
    G.band.bar(t, G.barN++, G.n);
    if (type === 'try') {
      const i = G.n;
      for (let b = 0; b < 3; b++) G.band.tick(t + b * BEAT, pan(i));
      G.band.sing(t + 3 * BEAT, i, pan(i), 0.07);
      G.target = t + 3 * BEAT;
      const s = G.stairs[i]; if (!s.shown) { s.shown = true; s.k = 0.001; }
    } else if (type === 'climb') {
      G.band.melody(t, G.n - 1);
    }
    G.barAt += BAR;
  }
  function tap() {
    if (!G || G.phase !== 'play' || G.over) return;
    const b = G.bar; G.tapFx = 1;
    if (!b || b.type !== 'try' || b.hit) return;
    const now = G.band.now(), d = now - G.target;
    if (d < -EARLY) {
      // too early: a little bump, and (now and then) a reminder
      G.band.early(); G.wob = 1; G.ui.pop('Wait…');
      if (G.t - G.saidEarly > 6) { G.saidEarly = G.t; G.say(L.early); }
      return;
    }
    if (d > LATE) return;
    // on the beat: she hops up
    b.hit = true; b.judged = true;
    const i = b.i; G.n++; G.misses = 0;
    G.band.land(i, pan(i)); G.buzz([30, 20, 50]);
    G.hop = { from: { ...G.feet }, to: { u: STAIRS[i].u, v: STAIRS[i].v }, t: 0 };
    G.stairs[i].lit = 1;
    const [x, y] = G.S.P(STAIRS[i].u, STAIRS[i].v); G.fx.add(x, y, '#ffe08a', 16, 0.3);
    for (let k = 0; k < 3; k++) { const s = K.sprite(T('note'), 0.06, { order: 28 }); s.position.set(x + (k - 1) * 0.04, y + 0.02, 0.07); G.root.add(s); G.floaty.push({ s, t: 0, vx: (k - 1) * 0.03 }); }
    G.say(SAY_NOTE[i] + (G.n === N / 2 ? ' ' + L.half : ''));
    G.after = 'climb';
    hud();
  }
  function top() {
    G.phase = 'top'; G.phT = 0; G.band.top(); G.buzz([60, 40, 60, 40, 160]);
    G.say(L.top);
    hud();
  }

  return {
    title: 'Climb the scale',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, n: 0, misses: 0, barN: 0, bar: null, after: 'groove', feet: { u: START.u, v: START.v }, hop: null, wob: 0, tapFx: 0, saidEarly: -99, floaty: [], endT: 0, artist: null, sky: 0 });
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the wall with her stair empty (it shows when she climbs away)
      G.wall = K.plane(null, 1, G.h, { order: 11, opacity: 0 }); G.wall.position.z = 0.03; G.root.add(G.wall);
      new THREE.TextureLoader().load(ART + 'wall.jpg', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.wall.material.map = t; G.wall.material.needsUpdate = true; G.wallOK = true; });
      // the warm light in the sky that grows as she climbs
      G.glow = K.sprite(K.glowTex, 0.9, { order: 12, opacity: 0, additive: true, color: '#ffd98a' }); { const [x, y] = G.S.P(0.3, 0.2); G.glow.position.set(x, y, 0.035); } G.root.add(G.glow);
      G.mist = [0, 1, 2, 3].map(k => { const s = K.sprite(K.glowTex, 0.4, { order: 13, opacity: 0, additive: true, color: '#fff4dc' }); G.root.add(s); return { s, k }; });
      // the 8 new stairs, waiting
      G.stairs = STAIRS.map((st, i) => { const s = K.sprite(T('stair', i), SIZE, { order: 20 + i, opacity: 0 }); const [x, y] = G.S.P(st.u, st.v); s.position.set(x, y - 0.08 * SIZE, 0.045); G.root.add(s); return { s, k: 0, lit: 0, shown: false }; });
      G.ring = K.sprite(T('ring'), SIZE * 1.2, { order: 29, opacity: 0, additive: true }); G.root.add(G.ring);
      // the girl, cut out: her group sits at her feet, so she stands on whatever stair she's on
      const bw = (GIRL.box[2] - GIRL.box[0]) / GIRL.W, bh = (GIRL.box[3] - GIRL.box[1]) / GIRL.W;
      const cx = (GIRL.box[0] + GIRL.box[2]) / 2, cy = (GIRL.box[1] + GIRL.box[3]) / 2;
      G.girl = new THREE.Group(); G.root.add(G.girl);
      G.girlM = K.plane(null, bw, bh, { order: 40, opacity: 0 }); G.girlM.position.set((cx - GIRL.feet[0]) / GIRL.W, (GIRL.feet[1] - cy) / GIRL.W, 0); G.girl.add(G.girlM);
      new THREE.TextureLoader().load(ART + 'girl.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.girlM.material.map = t; G.girlM.material.needsUpdate = true; G.girlOK = true; });
      G.ui.buttons([{ label: 'Tap', icon: '♪', kind: 'red', aria: 'Tap when the stair sings', press: () => tap() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.phase = 'play'; G.phT = 0; G.barAt = G.band.now() + 0.15; nextBar(); };
      K.intro(G, { title: L.title, how: L.how, say: L.intro.join(' ') });
      // (the kit waits for the spoken intro to finish; tap the screen to skip it)
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over && !G.artist) {
        G.endT += dt;
        if (G.endT > 2.5) { G.artist = new Audio(DAVID); G.artist.play().catch(() => {}); G.band.quiet(0.25); }
      }
      const now = G.band.now();

      if (G.phase === 'play') {
        const b = G.bar;
        // the beat we're on in this bar (for the ring and the panel)
        const beat = b ? Math.floor((now - b.t) / BEAT) : -1;
        if (b && beat !== b.beat && beat >= 0 && beat < 4) { b.beat = beat; if (b.type === 'try') { hud(beat); G.pulse = 1; if (beat === 3) G.stairs[b.i].glow = 1; } }
        // a miss: the glow passed without a tap
        if (b && b.type === 'try' && !b.judged && now > G.target + LATE) {
          b.judged = true; G.misses++;
          if (G.misses === 1 || G.misses % 3 === 0) G.say(G.misses >= 2 ? L.hint : L.missed);
          hud();
        }
        if (now >= G.barAt - 0.06) nextBar();
      } else if (G.phase === 'top') {
        if (G.phT > 4.2 && !G.over) {
          const secs = Math.round(G.t - G.t0), b = K.best('a-bright-future:time', secs, 'lower');
          K.finale(G, { won: true, kicker: 'A Bright Future', title: 'To the top', line: G.work && G.work.quote, best: b.isBest, say: L.end,
            cells: [{ k: 'Stairs', v: N }, { k: 'Time', v: secs + 's' }] });
          G.endT = 0;
        }
      }

      // ── what you see ──
      const sm = x => x * x * (3 - 2 * x);
      if (G.hop) {
        G.hop.t += dt; const k = Math.min(1, G.hop.t / 0.45), e = sm(k);
        G.feet.u = G.hop.from.u + (G.hop.to.u - G.hop.from.u) * e; G.feet.v = G.hop.from.v + (G.hop.to.v - G.hop.from.v) * e - Math.sin(k * Math.PI) * 0.05;
        if (k >= 1) G.hop = null;
      }
      const [fx, fy] = G.S.P(G.feet.u, G.feet.v);
      G.wob = Math.max(0, G.wob - dt * 3);
      const cheer = G.phase === 'top' || G.over ? Math.abs(Math.sin(G.t * 5)) * 0.015 : 0;
      G.girl.position.set(fx + Math.sin(G.t * 40) * 0.004 * G.wob, fy + cheer, 0.06);
      G.girl.scale.setScalar(1 - G.n * 0.025);
      G.girl.rotation.z = Math.sin(G.t * 1.6) * 0.02 + (G.hop ? -0.08 : 0);
      const ready = G.wallOK && G.girlOK;
      const fadeTo = (m, v, k = 3) => { m.material.opacity += (v - m.material.opacity) * Math.min(1, dt * k); };
      fadeTo(G.wall, ready && !(G.over && G.endT > 1.2) ? 1 : 0); fadeTo(G.girlM, ready ? 1 : 0);
      // the stairs appear, glow on the 4th beat, and stay softly lit once she's stood on them
      G.stairs.forEach((s, i) => {
        if (!s.shown) return;
        s.k = Math.min(1, s.k + dt * 2); s.glow = Math.max(0, (s.glow || 0) - dt * 2);
        const lit = i < G.n, next = i === G.n;
        s.s.material.opacity = s.k * (lit ? 1 : next ? 0.55 + 0.45 * s.glow : 0.5);
        s.s.scale.setScalar(SIZE * (0.7 + 0.3 * s.k) * (1 + 0.15 * s.glow + (G.phase === 'top' ? 0.05 * Math.sin(G.t * 6 + i) : 0)));
        const [x, y] = G.S.P(STAIRS[i].u, STAIRS[i].v); s.s.position.y = y - 0.08 * SIZE + Math.sin(G.t * 1.5 + i) * 0.003;
      });
      // the ring pulses on the next stair with each beat
      G.pulse = Math.max(0, (G.pulse || 0) - dt * 3);
      const nb = G.phase === 'play' && G.bar && G.bar.type === 'try' && !G.bar.hit ? G.bar.i : -1;
      if (nb >= 0) { const [x, y] = G.S.P(STAIRS[nb].u, STAIRS[nb].v); G.ring.position.set(x, y - 0.01, 0.05); const big = G.bar.beat === 3 ? 1.6 : 1; G.ring.scale.set(SIZE * (1 + 0.4 * G.pulse) * big, SIZE * 0.6 * (1 + 0.4 * G.pulse) * big, 1); G.ring.material.opacity = 0.35 + 0.65 * G.pulse; }
      else G.ring.material.opacity = Math.max(0, G.ring.material.opacity - dt * 3);
      // the sky warms as she climbs; the mist drifts
      G.sky += (((G.n / N) * 0.7 + (G.phase === 'top' || G.over ? 0.5 : 0)) - G.sky) * Math.min(1, dt * 1.2);
      G.glow.material.opacity = 0.75 * G.sky * (G.over && G.endT > 1.2 ? 0.3 : 1); G.glow.scale.setScalar(0.45 + G.sky * 0.35);
      G.mist.forEach(m => { const a = G.t * 0.05 + m.k * 1.7; const [x, y] = G.S.P(0.3 + 0.2 * Math.sin(a), 0.25 + 0.1 * Math.cos(a * 1.3)); m.s.position.set(x, y, 0.04); m.s.material.opacity = (ready ? 0.1 : 0) + G.sky * 0.05; });
      for (let i = G.floaty.length - 1; i >= 0; i--) {
        const f = G.floaty[i]; f.t += dt; f.s.position.y += dt * 0.08; f.s.position.x += f.vx * dt; f.s.material.opacity = Math.max(0, 1 - f.t / 1.4); f.s.material.rotation = Math.sin(f.t * 4) * 0.3;
        if (f.t > 1.4) { G.root.remove(f.s); G.floaty.splice(i, 1); }
      }

      // ── the robot: taps on the glow (a little early on stair 3 and misses stair 5 once, to show both) ──
      if (G.bot && G.phase === 'play' && G.bar && G.bar.type === 'try' && !G.bar.hit) {
        const d = now - G.target;
        if (G.n === 2 && !G.botEarly && d > -1.2) { G.botEarly = true; tap(); }
        else if (G.n === 4 && !G.botMiss) { if (d > LATE) G.botMiss = true; }
        else if (d > 0.02) tap();
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over || kind !== 'down') return;
      if (G._introT > 0) { G._introT = 0; if (G.say.stop) G.say.stop(); G._introGo(); return; }   // tap to skip the intro
      tap();   // tap anywhere on the screen
    },
    pause() { if (G) { G.paused = true; G.band.hush(true); if (G.artist) G.artist.pause(); } },
    resume() {
      if (!G) return;
      G.paused = false; G.band.hush(false);
      if (G.phase === 'play') { G.barAt = G.band.now() + 0.3; G.after = G.after || null; if (G.bar && G.bar.type === 'try' && !G.bar.hit) G.bar.judged = true; }
      if (G.artist && G.over) G.artist.play().catch(() => {});
    },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'climb', phase: G.phase, playing: G.playing, over: G.over, stairs: G.n, bar: G.bar && G.bar.type, misses: G.misses, artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
