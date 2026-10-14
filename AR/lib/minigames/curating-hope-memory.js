// CURATING HOPE (Ben Fox): LIGHT MEMORY, a song we remember together.
// The people under the tree are the voices: each one lights up and sings a note (low on the left, high on the right).
// Listen to the community sing a little of their song, then sing it back by tapping the people in the same order.
// Each round the song is one note longer, and each round you remember fills more of the tree with light: a shared
// memory growing. Get one wrong and nobody is out: the community just sings it again, together. At the end the whole
// song plays in harmony, every voice at once, and the tree glows.
// By ear: notes go from low on the left to high on the right, and come from where each person stands. You can tap
// anywhere: left to right across the screen picks the person, so it works without seeing them. "Again" replays the song.
import * as THREE from 'three';
import * as K from './kit.js';

const PEOPLE = [   // u, v of each singer (mid-body), and their voice
  { u: 0.19, v: 0.725, vowel: 'oo' }, { u: 0.27, v: 0.72, vowel: 'ah' }, { u: 0.43, v: 0.70, vowel: 'oh' },
  { u: 0.585, v: 0.715, vowel: 'ah' }, { u: 0.68, v: 0.72, vowel: 'oo' }, { u: 0.785, v: 0.725, vowel: 'oh' },
];
const NOTES = [60, 62, 64, 67, 69, 72];             // C D E G A C: low on the left, high on the right
const SONG = [2, 3, 4, 3, 5, 4, 3, 2];              // the community's song (the melody you'll remember)
const FIRST = 3;                                     // the first round sings 3 notes; then 4, 5 ... 8
const CANOPY = [[0.22, 0.25], [0.78, 0.25], [0.36, 0.14], [0.64, 0.14], [0.5, 0.3], [0.15, 0.45], [0.85, 0.45], [0.5, 0.08]];
const FORM = { ah: [800, 1150, 2900], oh: [500, 900, 2600], oo: [330, 870, 2300] };

/* a soft sung voice: a buzzy tone shaped by three vowel resonances, with a little vibrato */
function sing(ac, dest, t, m, dur, vowel = 'ah', vol = 0.5, pan = 0) {
  const f0 = 440 * Math.pow(2, (m - 69) / 12), src = ac.createOscillator(), vib = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain(), mix = ac.createGain();
  src.type = 'sawtooth'; src.frequency.value = f0; vib.frequency.value = 5.3; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(14, t + 0.3); vib.connect(vg); vg.connect(src.detune);
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null; if (p) p.pan.value = pan;
  FORM[vowel].forEach((f, i) => { const b = ac.createBiquadFilter(), bg = ac.createGain(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = 6 + i * 3; bg.gain.value = [1, 0.6, 0.25][i]; src.connect(b).connect(bg).connect(mix); });
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.07); g.gain.setValueAtTime(vol, t + Math.max(0.08, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.18);
  mix.connect(g); if (p) g.connect(p).connect(dest); else g.connect(dest);
  src.start(t); vib.start(t); src.stop(t + dur + 0.25); vib.stop(t + dur + 0.25);
}

export function lightMemoryGame() {
  let G = null;
  const rounds = SONG.length - FIRST + 1;

  function hud() {
    const len = G.len, sub = G.phase === 'listen' ? 'Listen…' : G.phase === 'you' ? `Your turn: ${G.pos} of ${len}` : '';
    G.ui.panel(`Round ${Math.min(rounds, G.round + 1)} of ${rounds}`, `${G.round}<small>of ${rounds} remembered</small>`, { segs: [G.round, rounds], sub });
  }
  function light(i, dur = 0.5) {
    const P = G.ppl[i]; P.on = 1; P.dur = dur;
    sing(G.ac, G.bus, G.ac.currentTime + 0.01, NOTES[i], dur, PEOPLE[i].vowel, 0.55, (PEOPLE[i].u - 0.5) * 1.6);
    const [x, y] = G.S.P(PEOPLE[i].u, PEOPLE[i].v - 0.04); G.fx.add(x, y, '#ffd98a', 6, 0.12);
  }
  // the community sings the song so far
  function listen() {
    G.phase = 'listen'; G.pos = 0; hud();
    const gap = Math.max(0.42, 0.68 - G.round * 0.035), seq = SONG.slice(0, G.len);
    G.queue = seq.map((n, k) => ({ at: G.t + 0.7 + k * gap, n, dur: gap * 0.8 }));
    G.queueEnd = G.t + 0.7 + seq.length * gap + 0.2;
  }
  function yourTurn() { G.phase = 'you'; G.pos = 0; hud(); G.say('Your turn.'); G.botAt = G.t + 0.8; }
  function press(i) {
    if (G.phase !== 'you') return;
    light(i, 0.42); G.buzz(15);
    if (i !== SONG[G.pos]) {
      G.misses++; G.phase = 'wait';
      K.tone(196, 0.4, { type: 'triangle', vol: 0.06 }); G.buzz([60, 40, 60]);
      G.ui.alert('Let’s sing it again', 'Together. Listen once more.', 1.6, 'blue'); G.say('Let’s sing it again, together.');
      G.waitT = 1.8; G.after = listen; hud(); return;
    }
    G.pos++; hud();
    if (G.pos >= G.len) {   // remembered: the tree fills with a little more light
      G.round++; G.phase = 'wait';
      const leaf = G.glows[G.round - 1]; if (leaf) leaf.target = 0.75;
      G.fx.add(...G.S.P(...CANOPY[(G.round - 1) % CANOPY.length]), '#ffe7a6', 24, 0.3);
      K.chord(SONG.slice(0, 3).map(n => 440 * Math.pow(2, (NOTES[n] + 12 - 69) / 12)), 0.9, { vol: 0.04, delay: 0.35 });
      if (G.len >= SONG.length) { G.waitT = 1.2; G.after = chorus; G.ui.alert('You remembered the whole song', 'Now everyone sings it together.', 2.4, 'red'); G.say('You remembered the whole song. Now everyone sings it, together.'); }
      else { G.len++; G.waitT = 1.5; G.after = listen; G.ui.alert('Remembered!', `The tree holds ${G.round} of ${rounds} memories.`, 1.4, 'black'); }
      hud();
    }
  }
  // the end: every voice sings the whole song, with harmony, and the tree glows
  function chorus() {
    G.phase = 'chorus'; G.glows.forEach(g => g.target = 1);
    const t0 = G.ac.currentTime + 0.3, gap = 0.62;
    SONG.forEach((n, k) => {
      const t = t0 + k * gap, up = Math.min(5, n + 2);   // a harmony a little above
      sing(G.ac, G.bus, t, NOTES[n], gap * 0.95, 'ah', 0.45, -0.5);
      sing(G.ac, G.bus, t, NOTES[n] - 12, gap * 0.95, 'oh', 0.35, 0.5);
      sing(G.ac, G.bus, t, NOTES[up], gap * 0.95, 'oo', 0.25, 0);
      G.queue.push({ at: G.t + 0.3 + k * gap, n, dur: gap * 0.9, all: true });
    });
    G.settle = 0.3 + SONG.length * gap + 1.2;
  }
  function again() { if (G.phase === 'you') { G.say('Listen.'); listen(); } }

  return {
    title: 'Light memory',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { round: 0, len: FIRST, pos: 0, misses: 0, phase: 'intro', queue: [], queueEnd: 0, waitT: 0, after: null, settle: 0, t0: 0, botAt: 0 });
      G.ac = K.audio(); G.bus = G.ac.createGain(); G.bus.gain.value = 1.4; G.bus.connect(G.ac.destination);
      // a soft dusk over the painting so the lights glow
      G.dim = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.MeshBasicMaterial({ color: 0x050812, transparent: true, opacity: 0, depthWrite: false }));
      G.dim.position.z = 0.03; G.dim.renderOrder = 11; G.root.add(G.dim);
      G.ppl = PEOPLE.map(p => {
        const [x, y] = G.S.P(p.u, p.v);
        const halo = K.sprite(K.glowTex, 0.16, { color: '#ffcf6b', additive: true, opacity: 0, order: 14 }); halo.position.set(x, y, 0.05); G.root.add(halo);
        const [bx, by] = G.S.P(p.u, p.v - 0.22);   // a ribbon of light up into the branches
        const beam = K.sprite(K.glowTex, 0.12, { color: '#ffe0a0', additive: true, opacity: 0, order: 13 }); beam.position.set(bx, by, 0.045); beam.scale.set(0.09, 0.42, 1); G.root.add(beam);
        return { halo, beam, on: 0, dur: 0.5 };
      });
      G.glows = CANOPY.map(([u, v], i) => { const [x, y] = G.S.P(u, v); const s = K.sprite(K.glowTex, 0.34, { color: i % 2 ? '#ffb45a' : '#9fc4ff', additive: true, opacity: 0, order: 12 }); s.position.set(x, y, 0.04); G.root.add(s); return { s, target: 0, v: 0 }; });
      G.ui.buttons([{ label: 'Again', icon: '↻', kind: 'red', aria: 'Hear the song again', press: () => G.playing && again() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; listen(); };
      K.intro(G, { title: 'Light memory', how: 'The community sings a little of their song. Sing it back: tap the people in the same order. Low notes on the left, high on the right.',
        say: 'Light memory. The people under the tree sing a song together, a few notes at a time. Listen, then sing it back by tapping them in the same order. Low notes are on the left, high notes on the right, and you can tap anywhere across the screen. Each round you remember fills the tree with light.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.dim.material.opacity += ((G.over ? 0 : 0.42) - G.dim.material.opacity) * Math.min(1, dt * 1.5);
      // the people glow while they sing
      G.ppl.forEach(P => { if (P.on > 0) P.on = Math.max(0, P.on - dt / (P.dur + 0.25)); const a = Math.min(1, P.on * 1.6);
        P.halo.material.opacity = a * 0.95; P.halo.scale.setScalar(0.12 + a * 0.08); P.beam.material.opacity = a * 0.55; });
      G.glows.forEach(g => { g.v += (g.target - g.v) * Math.min(1, dt * 1.2); g.s.material.opacity = g.v * (0.75 + Math.sin(G.t * 1.7 + g.s.position.x * 9) * 0.12); });
      // play queued notes (the community singing)
      for (let i = G.queue.length - 1; i >= 0; i--) { const q = G.queue[i]; if (G.t >= q.at) { G.queue.splice(i, 1);
        if (q.all) { const P = G.ppl[q.n]; P.on = 1; P.dur = q.dur; G.ppl.forEach(p => p.on = Math.max(p.on, 0.5)); } else light(q.n, q.dur); } }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('curating-hope:memory', G.misses, 'lower');
        K.finale(G, { won: true, title: 'A memory we share', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Notes', v: SONG.length }, { k: 'Sung again', v: G.misses }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
      } return; }
      if (!G.playing) return;
      if (G.phase === 'listen' && !G.queue.length && G.t >= G.queueEnd) yourTurn();
      if (G.phase === 'wait') { G.waitT -= dt; if (G.waitT <= 0) { const f = G.after; G.after = null; f && f(); } }
      if (G.bot && G.phase === 'you' && G.t >= G.botAt) { G.botAt = G.t + 0.5; press(SONG[G.pos]); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down' || G.phase !== 'you') return;
      // left to right picks the singer: use the painting if the touch lands on it, else the screen
      const p = G.S.toBoard(ev, G.root);
      const u = p && p.u >= 0 && p.u <= 1 ? p.u : ev.clientX / innerWidth;
      let best = 0, bd = 9; PEOPLE.forEach((q, i) => { const d = Math.abs(q.u - u); if (d < bd) { bd = d; best = i; } });
      press(best);
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'light-memory', playing: G.playing, over: G.over, phase: G.phase, round: G.round, len: G.len, pos: G.pos, misses: G.misses, t: +G.t.toFixed(1) }; },
    stop() { const b = G && G.bus; if (b) { b.gain.setTargetAtTime(0, b.context.currentTime, 0.05); setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 400); } K.cleanup(G); G = null; },
  };
}
export { sing as communityVoice, SONG, NOTES, PEOPLE };   // for testing the voices on their own
