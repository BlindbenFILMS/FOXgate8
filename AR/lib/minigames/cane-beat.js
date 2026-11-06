// MUSIC ON THE STREETS (Alayna Lopez): CANE BEAT, a "tap on the beat" game.
// “I love going over all the different textures and the domes when you cross the street. Some of them sound like music.”
// A street groove plays. Alayna walks the real crosswalks in her painting, six crossings (each of the three crosswalks,
// there and back). Her white cane touches a bump dome or a stripe on every beat, with a soft tap from its side.
// TAP on the beat (anywhere, or the big button) and that touch rings out as the next note of the tune: the stripe glows,
// music notes fly up, and the grey street gets its graffiti colour back around her cane. Miss and it's just a plain cane
// tap: nobody fails. A new instrument joins the band on every crossing. At the end the whole street fills with colour,
// and Alayna reads her own words.
// Accessible: the cane's own tap on every beat is the timing cue (panned to where the tip is); early/late shows on
// screen; the window gets wider after misses and with Help; phones buzz on each note.
// Props: cane-things.js. No image files.
import * as THREE from 'three';
import * as K from './kit.js';
import { slimHud } from './alayna-hud.js';
import { alaynaTex, caneTex, domesTex, noteTex, stripeGlowTex, NOTE_COLORS } from './cane-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_13.mp3', import.meta.url).href;   // Alayna, in her own words

const BPM = 96, BEAT = 60 / BPM, STEP = BEAT / 2;
const WIN0 = 0.17, WIN_MAX = 0.3, PERFECT = 0.07;
const WALK_IN = 4, GAP = 4, PARTY = 8;
const SZ = 0.15;                  // Alayna's size on the painting
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

// the three crosswalks in the painting (pixels of the 1024 × 1024 image), and where each stripe crosses the walking line
const PATHS = {
  top:  { a: [24, 112], b: [444, 74],  stripes: [0.084, 0.205, 0.319, 0.415, 0.527, 0.629, 0.73, 0.83] },
  left: { a: [100, 165], b: [300, 850], stripes: [0.031, 0.09, 0.15, 0.21, 0.266, 0.321, 0.37, 0.418, 0.484, 0.558, 0.614, 0.677, 0.749, 0.842, 0.922] },
  diag: { a: [355, 935], b: [985, 600], stripes: [0.027, 0.106, 0.186, 0.266, 0.336, 0.41, 0.487, 0.571, 0.643, 0.722, 0.793, 0.881, 0.942] },
};
const ROUTE = [['top', false], ['left', false], ['diag', false], ['top', true], ['left', true], ['diag', true]];
const JOINS = [null, 'The bass joins in.', 'The keys join in.', 'The horns join in.', 'The bongos join in.', 'The strings join in.'];
const BAND = ['Drums', 'Bass', 'Keys', 'Horns', 'Bongos', 'Strings'];
const NUM = ['Crossing 1.', 'Crossing 2.', 'Crossing 3.', 'Crossing 4.', 'Crossing 5.', 'Crossing 6.'];

// each crossing: its steps (domes at both curbs, the stripes between) as positions t along the line, 0..1
function buildCrossings() {
  let beat = 4; const out = [];
  ROUTE.forEach(([key, rev], i) => {
    const P = PATHS[key], L = Math.hypot(P.b[0] - P.a[0], P.b[1] - P.a[1]), d = 22 / L;
    let st = P.stripes.slice(); const s0 = st[0], s1 = st[st.length - 1];
    let steps = [{ t: s0 - 2 * d, kind: 'dome' }, { t: s0 - d, kind: 'dome' }, ...st.map(t => ({ t, kind: 'stripe' })), { t: s1 + d, kind: 'dome' }, { t: s1 + 2 * d, kind: 'dome' }];
    let a = P.a, b = P.b;
    if (rev) { steps = steps.reverse().map(s => ({ t: 1 - s.t, kind: s.kind })); [a, b] = [b, a]; }
    const S = beat, T0 = S + WALK_IN, E = T0 + steps.length;
    out.push({ i, key, a: [a[0] / 1024, a[1] / 1024], b: [b[0] / 1024, b[1] / 1024], L: L / 1024, steps, S, T0, E, next: E + GAP, hits: 0 });
    beat = E + GAP;
  });
  return out;
}
const TOTAL = ROUTE.reduce((n, [k]) => n + PATHS[k].stripes.length + 4, 0);   // 96 notes

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, rev;
uniform float uA, uDrain, uFull, uBeat;
void main(){
  vec3 col = texture2D(map, vUv).rgb;
  float mx = max(col.r, max(col.g, col.b)), mn = min(col.r, min(col.g, col.b));
  float paint = smoothstep(0.08, 0.28, mx - mn);              // the graffiti: the saturated colours on the grey street
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  float r = max(texture2D(rev, vUv).r, uFull);                 // where the cane has sung, the colour comes back
  vec3 grey = vec3(l * 0.55 + 0.02);
  vec3 c = mix(col, grey, paint * (1.0 - r) * uDrain);
  c += col * paint * r * (0.18 + uBeat * 0.4);                 // and it glows, pulsing on the beat
  gl_FragColor = vec4(c, uA);
}`;

/* ───────── the band: an original street groove in F, one instrument added per crossing ───────── */
function band(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp).connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p) => { if (!ac.createStereoPanner) return master; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(master); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, p = 0, slide = 0, lp = 0, vib = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.002 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // F – Dm – Bb – C, one chord a bar
  const CH = [[65, 69, 72], [62, 65, 69], [62, 65, 70], [64, 67, 72]], ROOT = [41, 38, 34, 36];
  // the tune the cane plays: one note a beat, four bars round
  const MEL = [72, 69, 72, 77, 74, 77, 81, 77, 74, 70, 74, 77, 79, 76, 72, 74];
  const B = {
    layers: 1, step: 0, next: 0, timer: null, onBeat: null, party: false,
    // the cane's own tap on the ground (the timing cue): a woody tok on paint, a double tick on the domes
    tap(t, kind, p, soft = 1) {
      if (kind === 'dome') { noise(t, 0.035, { freq: 4300, q: 5, vol: 0.2 * soft, p }); noise(t + 0.045, 0.03, { freq: 4800, q: 5, vol: 0.14 * soft, p }); }
      else { noise(t, 0.045, { freq: 2600, q: 4, vol: 0.24 * soft, p }); tone(t, 1500, 0.04, { type: 'triangle', vol: 0.05 * soft, p }); }
    },
    // the note the cane sings: a bright marimba on the stripes, a little bell on the domes
    sing(t, beat, kind, p) {
      const m = MEL[((beat % 16) + 16) % 16];
      if (kind === 'dome') {
        const top = CH[Math.floor(beat / 4) % 4][2] + 12;
        tone(t, midi(top), 0.9, { vol: 0.12, p }); tone(t, midi(top) * 2.76, 0.35, { vol: 0.03, p }); tone(t, midi(top + 7), 0.6, { vol: 0.04, p, att: 0.01 });
      } else {
        tone(t, midi(m), 0.55, { vol: 0.2, p, att: 0.003 }); tone(t, midi(m) * 4, 0.09, { vol: 0.05, p }); tone(t, midi(m - 12), 0.3, { type: 'triangle', vol: 0.06, p });
      }
    },
    flop(t, p) { tone(t, 210, 0.12, { type: 'triangle', vol: 0.08, p, slide: 160 }); },
    sched(s, t) {
      const L = B.layers, beat = Math.floor(s / 2), sb = s % 8, bar = Math.floor(s / 8) % 4, ch = CH[bar], r = ROOT[bar];
      if (s % 2 === 0 && B.onBeat) B.onBeat(beat, t);
      // drums (always): kick on 1 and 3, clap on 2 and 4, soft hats
      if (sb === 0 || sb === 4 || (L >= 2 && sb === 5)) tone(t, 120, 0.3, { vol: sb === 5 ? 0.35 : 0.6, slide: 42, att: 0.003 });
      if (sb === 2 || sb === 6) { noise(t, 0.12, { freq: 1500, q: 0.9, vol: 0.32, p: 0.05 }); noise(t + 0.012, 0.08, { freq: 2200, q: 1.2, vol: 0.18 }); }
      noise(t, 0.035, { freq: 8000, type: 'highpass', vol: s % 2 ? 0.05 : 0.03, p: 0.2 });
      if (sb === 7) noise(t, 0.15, { freq: 7000, type: 'highpass', vol: 0.045, p: 0.2 });
      if (L >= 2) {   // bass
        const bl = { 0: r, 3: r, 4: r + 7, 6: r + 12, 7: r + 10 };
        if (bl[sb] !== undefined) tone(t, midi(bl[sb]), sb === 0 ? 0.32 : 0.2, { type: 'sawtooth', vol: 0.16, lp: 420, att: 0.006 });
      }
      if (L >= 3 && (sb === 1 || sb === 5)) ch.forEach(m => tone(t, midi(m), 0.32, { type: 'sine', vol: 0.05, p: -0.35, att: 0.008 }));   // keys
      if (L >= 4 && (bar === 1 || bar === 3) && (sb === 6 || sb === 7)) [ch[0] + 12, ch[2] + 12].forEach(m => tone(t, midi(m), sb === 7 ? 0.28 : 0.12, { type: 'sawtooth', vol: 0.035, lp: 2200, p: 0.3 }));   // horns
      if (L >= 5) {   // bongos and a shaker
        if (sb === 3 || sb === 5 || sb === 7) tone(t, sb === 5 ? 300 : 420, 0.12, { vol: 0.16, slide: sb === 5 ? 250 : 360, p: 0.5 });
        noise(t, 0.03, { freq: 6000, type: 'highpass', vol: 0.04, p: -0.5 });
      }
      if (L >= 6 && sb === 0) ch.concat([ch[0] + 12]).forEach(m => tone(t, midi(m), BEAT * 4 * 0.95, { type: 'triangle', vol: 0.03, att: 0.4, vib: 0.004 }));   // strings
      if (B.party && s % 2 === 1) tone(t, midi(MEL[(beat + 3) % 16] + 12), 0.3, { vol: 0.05, p: Math.random() * 1.4 - 0.7 });
    },
    tick() { const now = ac.currentTime; while (B.next < now + 0.16) { B.sched(B.step, B.next); B.next += STEP; B.step++; } },
    start() { B.next = ac.currentTime + 0.12; master.gain.setTargetAtTime(0.8, ac.currentTime, 0.05); clearInterval(B.timer); B.timer = setInterval(B.tick, 25); B.tick(); },
    hold() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    resume() { if (B.step % 2) B.step++; B.start(); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    stop() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { try { master.disconnect(); } catch (e) {} }, 600); },
  };
  return B;
}

export function caneBeatGame() {
  let G = null;
  const heard = () => { const ac = K.audio(); return ac ? ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) : G.t; };
  const at = (X, t) => [X.a[0] + (X.b[0] - X.a[0]) * t, X.a[1] + (X.b[1] - X.a[1]) * t];   // u, v on a crossing's line
  const panU = (u) => Math.max(-1, Math.min(1, (u - 0.5) * 1.8));
  // a step's t, for any k (before the first and after the last, she keeps walking at the same stride)
  function stepT(X, k) {
    const n = X.steps.length;
    if (k < 0) return X.steps[0].t + k * (X.steps[1].t - X.steps[0].t) * 1.6;
    if (k >= n) return X.steps[n - 1].t + (k - n + 1) * (X.steps[n - 1].t - X.steps[n - 2].t) * 1.6;
    return X.steps[k].t;
  }
  const crossingAt = (beat) => { for (const X of G.X) if (beat < X.next) return X; return null; };

  function hud() {
    const X = G.X[Math.min(5, G.cur)];
    G.ui.panel(G.phase === 'party' || G.over ? 'Cane Beat · the street is singing' : `Cane Beat · crossing ${X.i + 1} of 6`, `${G.hits}<small>notes played</small>`, { segs: [G.done, 6] });
  }
  // the band calls this on every beat (audio time): remember when it lands, and tap the cane on the ground there
  function onBeat(beat, t) {
    G.beatT[beat] = t;
    const X = crossingAt(beat);
    G.band.layers = X ? X.i + 1 : 6;
    if (G.band.party !== (G.phase === 'party')) G.band.party = G.phase === 'party';
    if (!X) return;
    const k = beat - X.T0;
    if (k >= -WALK_IN && k < X.steps.length + 2) {
      const real = k >= 0 && k < X.steps.length, kind = real ? X.steps[k].kind : 'stripe';
      const [u] = at(X, stepT(X, k)); G.band.tap(t, kind, panU(u), real ? 1 : 0.55);
      if (real) G.targets.push({ beat, t, X, k, kind, done: false });
    }
  }
  function popAt(text, u, v, X) {
    if (X) { const du = X.b[0] - X.a[0], dv = X.b[1] - X.a[1], l = Math.hypot(du, dv); u += du / l * 0.1; v += dv / l * 0.1; }   // just ahead of the cane, clear of Alayna
    let x = innerWidth / 2, y = innerHeight * 0.5;
    try {
      const [bx, by] = G.S.P(u, v), p = new THREE.Vector3(bx, by, 0.05); G.root.localToWorld(p); p.project(G.camera);
      const r = G.renderer.domElement.getBoundingClientRect(); x = r.left + (p.x + 1) / 2 * r.width; y = r.top + (1 - p.y) / 2 * r.height;
    } catch (e) {}
    G.ui.pop(text, Math.max(70, Math.min(innerWidth - 70, x)), Math.max(140, Math.min(innerHeight - 260, y)));
  }
  function tap() {
    if (!G || !G.playing || G.over || G.phase !== 'play') return;
    const now = heard(); G.taps++; G.tappedThis = true;
    const c = G.targets.filter(x => !x.done).map(x => ({ x, e: now - G.beatT[x.beat] })).sort((a, b) => Math.abs(a.e) - Math.abs(b.e))[0];
    if (!c || Math.abs(c.e) > BEAT * 0.5) return;   // between crossings: nothing to hit
    if (Math.abs(c.e) <= G.win) { c.x.done = true; hit(c.x, Math.abs(c.e) <= PERFECT); }
    else { G.band.flop(K.audio().currentTime, 0); G.missStreak++; const [u, v] = at(c.x.X, stepT(c.x.X, c.x.k)); popAt(c.e < 0 ? 'EARLY' : 'LATE', u, v, c.x.X); if (G.missStreak >= 3) G.win = Math.min(WIN_MAX, G.win + 0.03); }
  }
  function hit(T, perfect) {
    const ac = K.audio(), X = T.X, [u, v] = at(X, stepT(X, T.k));
    G.hits++; X.hits++; if (perfect) G.perfect++; G.missStreak = 0;
    G.band.sing(ac.currentTime, T.beat, T.kind, panU(u)); G.buzz(25);
    const [x, y] = G.S.P(u, v);
    G.fx.add(x, y, NOTE_COLORS[G.hits % 4], 14, 0.25);
    floatNote(x, y); if (perfect) floatNote(x, y);
    splash(u, v, T.kind === 'dome' ? 0.07 : 0.1);
    G.caneLit = 0.3;
    if (T.kind === 'stripe') { const gl = G.glows[G.glowI++ % G.glows.length]; gl.position.set(x, y, 0.035); gl.rotation.z = X.ang + Math.PI / 2; gl.userData.t = 0; gl.visible = true; }
    if (perfect && G.hits % 3 === 0) popAt('PERFECT!', u, v, X);
    hud();
  }
  function floatNote(x, y) {
    const kinds = ['eighth', 'beamed', 'quarter', 'clef'], s = K.sprite(noteTex(kinds[Math.floor(Math.random() * 4)], NOTE_COLORS[Math.floor(Math.random() * 4)]), 0.05 + Math.random() * 0.02, { order: 30 });
    s.position.set(x, y, 0.06); G.root.add(s);
    G.notes.push({ s, vx: (Math.random() - 0.5) * 0.12, vy: 0.1 + Math.random() * 0.08, t: 0, life: 1.4 + Math.random() * 0.5, rot: (Math.random() - 0.5) * 1.2, ph: Math.random() * 6 });
  }
  // the colour comes back: a soft round splash on the mask
  function splash(u, v, r) {
    const g = G.revG, W = 256, gr = g.createRadialGradient(u * W, v * W, 0, u * W, v * W, r * W);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.arc(u * W, v * W, r * W, 0, Math.PI * 2); g.fill();
    G.revTex.needsUpdate = true;
  }
  function help() {
    if (!G || !G.playing || G.over) return;
    G.win = Math.min(WIN_MAX, G.win + 0.05);
    G.say('Listen for the cane. Tap every time it touches the ground.');
    G.ui.alert('Tap with the cane', 'Every time it touches the ground', 2.4, 'black');
  }
  // things that happen on a beat (as heard)
  function onHeardBeat(beat) {
    const X = crossingAt(beat);
    if (G.phase === 'play' && X) {
      if (beat === X.S) {   // a new crossing begins: she walks up to the curb
        G.cur = X.i; G.tappedThis = false; hud();
        G.say(X.i === 5 ? NUM[5] + ' The last crossing.' + (JOINS[5] ? ' ' + JOINS[5] : '') : NUM[X.i] + (JOINS[X.i] ? ' ' + JOINS[X.i] : ''));
        if (X.i > 0) G.ui.alert(BAND[X.i] + ' join in', 'Crossing ' + (X.i + 1) + ' of 6', 1.8, 'red');
        [G.padA, G.padB].forEach((p, j) => {
          const ks = j ? [X.steps.length - 2, X.steps.length - 1] : [0, 1], t = (stepT(X, ks[0]) + stepT(X, ks[1])) / 2, [u, v] = at(X, t), [x, y] = G.S.P(u, v);
          p.position.set(x, y, 0.03); p.rotation.z = X.ang; p.userData.k = ks; p.userData.lit = 0;
        });
      }
      if (beat === X.T0 + 6 && !G.hinted && X.hits === 0 && !G.tappedThis) { G.hinted = true; G.say('Tap on every beat.'); G.ui.alert('Tap on every beat', 'With the cane', 1.8, 'black'); }
      if (beat === X.E) {   // she's across
        G.done = X.i + 1; hud();
        const r = X.hits / X.steps.length;
        if (X.i === 5) { G.phase = 'party'; G.partyEnd = beat + PARTY; G.say('The whole street is singing!'); }
        else { G.say(r >= 0.8 ? 'The street is singing!' : r >= 0.4 ? 'Beautiful!' : 'Keep tapping with the cane.'); G.ui.alert('Across!', `${X.hits} of ${X.steps.length} notes`, 1.6, 'blue'); }
      }
    }
    if (G.phase === 'party' && beat >= G.partyEnd) finish();
    if (G.phase === 'party' && beat % 1 === 0) { for (let n = 0; n < 3; n++) { const [x, y] = G.S.P(0.1 + Math.random() * 0.8, 0.15 + Math.random() * 0.7); floatNote(x, y); } }
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('music-on-the-streets:cane', G.hits, 'higher');
    K.finale(G, { won: true, kicker: 'Music on the streets', title: 'Your cane played the song', line: G.work && G.work.quote, best: r.isBest && G.hits > 0,
      say: "Your cane played the street's song!",
      cells: [{ k: 'Notes', v: `${G.hits}/${TOTAL}` }, { k: 'Perfect', v: `${G.perfect}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.endT = 0; G.band.fade(0.5, 1.5);
  }

  return {
    title: 'Cane Beat',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = slimHud();
      Object.assign(G, { phase: 'intro', X: buildCrossings(), cur: 0, done: 0, hits: 0, perfect: 0, taps: 0, missStreak: 0, misses: 0, win: WIN0,
        beatT: [], targets: [], heardBeat: -1, notes: [], glows: [], glowI: 0, caneLit: 0, hinted: false, tappedThis: false, t0: 0, endT: 0, partyEnd: 1e9, full: 0, drain: 0, botMissed: false });
      for (const X of G.X) { const du = X.b[0] - X.a[0], dv = X.b[1] - X.a[1]; X.ang = Math.atan2(-dv * G.h, du); }
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.band = band(K.audio()); G.band.onBeat = onBeat;
      // the painting, drained to grey, with the colour coming back where the cane sings
      const rc = document.createElement('canvas'); rc.width = rc.height = 256; G.revG = rc.getContext('2d'); G.revG.fillStyle = '#000'; G.revG.fillRect(0, 0, 256, 256);
      G.revTex = new THREE.CanvasTexture(rc);
      G.uni = { map: { value: null }, rev: { value: G.revTex }, uA: { value: 1 }, uDrain: { value: 0 }, uFull: { value: 0 }, uBeat: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.02; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      new THREE.TextureLoader().load((ctx.work && ctx.work.image) || 'targets/music-on-the-streets.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the curb pads, the stripe glows, the cane and Alayna
      const pad = () => { const m = K.plane(domesTex(false), 0.065, 0.065, { order: 14 }); m.position.z = 0.03; m.visible = false; m.userData.k = []; G.root.add(m); return m; };
      G.padA = pad(); G.padB = pad();
      for (let i = 0; i < 4; i++) { const m = K.plane(stripeGlowTex(), 0.15, 0.035, { order: 15, additive: true, opacity: 0 }); m.visible = false; m.userData.t = 1; G.root.add(m); G.glows.push(m); }
      const cg = new THREE.PlaneGeometry(1, 1); cg.translate(0, -0.5, 0);
      G.cane = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ map: caneTex(false), transparent: true, depthWrite: false })); G.cane.renderOrder = 18; G.cane.visible = false; G.root.add(G.cane);
      G.girl = K.sprite(alaynaTex('stand'), SZ, { order: 20 }); G.girl.visible = false; G.root.add(G.girl);
      G.ui.buttons([
        { label: 'Tap', kind: 'red', aria: 'Tap on the beat with the cane', press: () => tap() },
        { label: 'Help', kind: 'black', aria: 'Help: how to tap with the cane', press: () => help() },
      ]);
      hud();
      G.onGo = () => { G.phase = 'play'; G.t0 = G.t; G.band.start(); };
      K.intro(G, { title: 'Cane Beat', how: 'Her cane taps a stripe or a dome on every beat. Tap with it, and the cane plays the song.',
        say: 'Cane Beat. Alayna feels the city through her cane. The stripes and the domes sound like music. Her cane taps on every beat. Tap with it, and the cane plays the song. Six crossings. Ready?' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const now = heard(), u = G.uni;
      // where we are in the song, as heard
      let b = G.heardBeat; while (G.beatT[b + 1] !== undefined && G.beatT[b + 1] <= now) { b++; G.heardBeat = b; onHeardBeat(b); if (!G) return; }
      const f = b >= 0 && G.beatT[b] !== undefined ? Math.max(0, Math.min(1, (now - G.beatT[b]) / BEAT)) : 0;
      // missed notes: their moment has passed
      for (const T of G.targets) if (!T.done && now > G.beatT[T.beat] + G.win + 0.02) { T.done = true; G.misses++; }
      G.targets = G.targets.filter(T => !T.done);
      // the street drains to grey as the game starts; floods with colour at the end
      u.uDrain.value += ((G.phase === 'intro' ? 0.4 : 1) - u.uDrain.value) * Math.min(1, dt * 1.5);
      G.full += ((G.phase === 'party' || G.over ? 1 : 0) - G.full) * Math.min(1, dt * 0.8); u.uFull.value = G.full;
      u.uBeat.value = b >= 0 ? Math.exp(-f * 5) : 0;
      if (G.over) { G.endT += dt; u.uA.value = Math.max(0, 1 - Math.max(0, G.endT - 3) * 0.4); }
      // Alayna and her cane
      const X = b >= 0 ? crossingAt(b) : G.X[0];
      let show = 0;
      if (X && G.phase !== 'intro') {
        const k = b - X.T0, kk = k + f, n = X.steps.length;
        if (k >= -WALK_IN && k < n + 3) {
          show = Math.min(1, (kk + WALK_IN) / 1.5, (n + 3 - kk) / 1.5);
          // the tip moves from this step to the next, lifting and swinging over (touching down on the beat)
          const t0 = stepT(X, k), t1 = stepT(X, k + 1), e = f < 0.15 ? 0 : (f - 0.15) / 0.85, ee = e * e * (3 - 2 * e);
          const tt = t0 + (t1 - t0) * ee, side = (k % 2 ? 1 : -1) * (1 - 2 * ee) * 0.02;
          const [tu, tv] = at(X, tt), ang = X.ang, nx = -Math.sin(ang), ny = Math.cos(ang);
          let [tx, ty] = G.S.P(tu, tv); tx += nx * side; ty += ny * side;
          const lift = Math.sin(Math.PI * ee) * 0.006;
          // her body follows the tip, a cane's length behind
          const bt = tt - 0.12 / X.L, [bu, bv] = at(X, bt), [bx, by] = G.S.P(bu, bv);
          const mirror = Math.cos(ang) < -0.05 ? -1 : 1, bob = Math.abs(Math.sin(Math.PI * kk)) * 0.003;
          G.girl.position.set(bx, by + SZ * 0.32 + bob, 0.05); G.girl.scale.set(SZ * mirror, SZ, 1);
          G.girl.material.map = alaynaTex(k >= n + 1 && f > 0.5 ? 'stand' : (b % 2 ? 'stepL' : 'stepR'), Math.sin(ang) > 0.35 ? 'back' : 'front');   // her face unless she walks away up the screen
          const hx = bx + SZ * 0.094 * mirror, hy = by + SZ * 0.32 - SZ * 0.133 + bob;
          const dx = tx - hx, dy = ty + lift - hy, len = Math.max(0.02, Math.hypot(dx, dy));
          G.cane.position.set(hx, hy, Math.sin(ang) > 0.2 ? 0.045 : 0.055); G.cane.renderOrder = Math.sin(ang) > 0.2 ? 18 : 22;
          G.cane.rotation.z = Math.atan2(dx, -dy); G.cane.scale.set(0.028, len, 1);
          G.caneLit = Math.max(0, G.caneLit - dt); G.cane.material.map = caneTex(G.caneLit > 0);
          // the curb pads light up as she steps on them
          for (const p of [G.padA, G.padB]) {
            p.visible = true; p.material.opacity = Math.min(1, show * 1.3);
            const on = p.userData.k.includes(k) && f < 0.6; p.material.map = domesTex(on);
          }
        }
      }
      G.girl.visible = G.cane.visible = show > 0.01; G.girl.material.opacity = G.cane.material.opacity = show;
      if (show <= 0.01) { G.padA.visible = G.padB.visible = false; }
      for (const gl of G.glows) { if (!gl.visible) continue; gl.userData.t += dt / 0.5; gl.material.opacity = Math.max(0, 1 - gl.userData.t) * 0.9; if (gl.userData.t >= 1) gl.visible = false; }
      for (let i = G.notes.length - 1; i >= 0; i--) { const n = G.notes[i]; n.t += dt;
        n.s.position.x += (n.vx + Math.sin(n.t * 4 + n.ph) * 0.03) * dt; n.s.position.y += n.vy * dt; n.s.material.rotation = Math.sin(n.t * 3 + n.ph) * 0.3 + n.rot * n.t * 0.2;
        n.s.material.opacity = Math.max(0, Math.min(1, n.t * 6, (n.life - n.t) * 2.5));
        if (n.t > n.life) { G.root.remove(n.s); n.s.material.dispose(); G.notes.splice(i, 1); } }
      // the finale: Alayna reads her own words, the band dips under her and then fades away
      if (G.over && !G.artist && G.endT > 2.5) {
        G.band.fade(0.08, 0.6);
        const back = () => { if (G && !G.bandOff) { G.bandOff = true; G.band.fade(0.0001, 4); } };
        try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.play().catch(() => {}); } catch (e) { G.artist = {}; }
        G.artistSafety = G.endT + 22;
      }
      if (G.over && G.artist && !G.bandOff && G.endT > G.artistSafety) { G.bandOff = true; G.band.fade(0.0001, 4); }
      // the robot: taps right on each beat (and misses one on purpose)
      if (G.bot && G.phase === 'play') {
        const T = G.targets.find(x => !x.done && now >= G.beatT[x.beat] - 0.01 && now - G.beatT[x.beat] < 0.08);
        if (T && G.botLast !== T) { G.botLast = T; if (T.X.i === 1 && T.k === 5 && !G.botMissed) G.botMissed = true; else tap(); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      tap();
    },
    pause() { if (G) { G.paused = true; G.band.hold(); if (G.artist && G.artist.pause) G.artist.pause(); } },
    resume() {
      if (!G) return; G.paused = false;
      if (G.phase === 'play' || G.phase === 'party' || (G.over && !G.bandOff)) G.band.resume();
      if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {});
    },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'cane-beat', phase: G.phase, playing: G.playing, over: G.over, crossing: G.cur + 1, done: G.done, hits: G.hits, perfect: G.perfect, misses: G.misses, taps: G.taps, beat: G.heardBeat,
      artist: G.artist && G.artist.currentTime !== undefined ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.band.stop(); if (G.artist && G.artist.pause) G.artist.pause(); G.artist = null; G.notes.forEach(n => n.s.material.dispose()); }
      if (G && G.css) G.css.remove();
      K.cleanup(G); G = null;
    },
  };
}
