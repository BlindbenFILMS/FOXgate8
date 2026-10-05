// RHYTHM: tap on the beat. The painting plays a short phrase on its own instrument (LISTEN), then you play it back
// (YOUR TURN): a ring closes onto the spot in the painting that makes each sound, and you tap anywhere on the screen
// (or the big TAP button) as it closes. PERFECT / GOOD / MISS by timing, with a streak. Phrases get busier.
// By ear: a count-in sets the tempo, a quiet backing groove keeps it, each phrase is played to you first, every
// sound comes from where its spot is (stereo pan), a cue note + red frame mark your turn, and taps buzz.
//
// cfg = {
//   engine: 'rhythm', title, kicker, how,
//   bpm: 100, swing: 0 (0..0.2 beats: pushes off-beat eighths late, for jazz),
//   voice: 'drums' | 'strum' | 'cane' | 'pole' | 'piano'      the painting's instrument
//   groove: 'hats' | 'shaker' | 'steps' | 'road' | 'ride'      the quiet backing that keeps time
//   spots: { K: { u, v, name, e: '🥁', ...sound settings }, … }  one letter per spot
//      drums: s: 'kick' | 'snare' | 'tom1' | 'tom2' | 'crash'     strum: notes: [Hz…] (a chord)
//      cane / pole / piano: f: Hz (piano may add under: Hz)
//   bars: ['K...S...K...S...', …]   one phrase per string: 16 steps (sixteenths) or 8 (eighths); '.' = rest.
//      A lower-case letter plays that spot softly (an up-strum, a ghost note).
//   pass: 0.6 (share of beats to hit to win), color: '#ffd25a', ring: '#fff', size: 0.09, cue: 880 (Hz of the your-turn cue),
//   gliss: false (Rhapsody's opening clarinet run), win: { title, line }, lose: { title, line }
// }
import * as K from '../kit.js';

/* the painting's instruments, made in code. o = { pan, delay, vel, up } */
const VOICES = {
  drums(sp, { pan, delay, vel: v }) {
    switch (sp.s) {
      case 'kick': K.tone(150, 0.32, { vol: 0.32 * v, pan, delay, slide: -105, attack: 0.003 }); K.noise(0.03, { vol: 0.12 * v, freq: 2500, pan, delay }); break;
      case 'snare': K.noise(0.2, { vol: 0.36 * v, freq: 1900, q: 0.7, pan, delay }); K.tone(200, 0.1, { type: 'triangle', vol: 0.12 * v, pan, delay, slide: -40, attack: 0.003 }); break;
      case 'tom1': K.tone(240, 0.3, { vol: 0.24 * v, pan, delay, slide: -90, attack: 0.003 }); K.noise(0.05, { vol: 0.08 * v, freq: 1200, pan, delay }); break;
      case 'tom2': K.tone(150, 0.4, { vol: 0.26 * v, pan, delay, slide: -60, attack: 0.003 }); K.noise(0.05, { vol: 0.08 * v, freq: 900, pan, delay }); break;
      case 'crash': K.noise(1.1, { vol: 0.22 * v, freq: 6500, type: 'highpass', q: 0.5, pan, delay }); K.tone(150, 0.25, { vol: 0.2 * v, pan, delay, slide: -105, attack: 0.003 }); break;
    }
  },
  strum(sp, { pan, delay, vel, up }) {             // a strummed chord: strings one after another, down or up
    const ns = up ? sp.notes.slice().reverse() : sp.notes;
    ns.forEach((f, i) => {
      const d = delay + i * 0.016;
      K.tone(f, 0.9, { type: 'triangle', vol: 0.075 * vel, pan, delay: d, attack: 0.004 });
      K.tone(f * 2, 0.3, { type: 'sine', vol: 0.025 * vel, pan, delay: d, attack: 0.004 });
    });
    K.noise(0.07, { vol: 0.07 * vel, freq: 3000, q: 0.6, pan, delay, sweepTo: up ? 5000 : 1800 });
  },
  cane(sp, { pan, delay, vel }) {                  // the cane's tip on a tactile dome: a click and a woody note
    K.noise(0.025, { vol: 0.2 * vel, freq: 4200, q: 1.5, pan, delay });
    K.tone(sp.f, 0.42, { vol: 0.2 * vel, pan, delay, attack: 0.003 });
    K.tone(sp.f * 4, 0.07, { vol: 0.05 * vel, pan, delay, attack: 0.002 });
    K.tone(sp.f / 2, 0.2, { type: 'triangle', vol: 0.05 * vel, pan, delay, attack: 0.003 });
  },
  pole(sp, { pan, delay, vel }) {                  // a pole rushing past the car window: whoosh + a wire's twang bending down
    K.noise(0.34, { vol: 0.32 * vel, freq: 450, sweepTo: 2600, q: 0.9, pan: pan - 0.25, delay });
    K.tone(sp.f, 0.45, { type: 'triangle', vol: 0.11 * vel, pan, delay: delay + 0.02, slide: -sp.f * 0.22, attack: 0.01 });
    K.tone(sp.f * 1.5, 0.3, { type: 'sine', vol: 0.04 * vel, pan, delay: delay + 0.02, slide: -sp.f * 0.3 });
  },
  piano(sp, { pan, delay, vel }) {                 // a blue piano note
    const f = sp.f;
    K.tone(f, 1.1, { type: 'triangle', vol: 0.16 * vel, pan, delay, attack: 0.004 });
    K.tone(f * 2, 0.5, { type: 'sine', vol: 0.05 * vel, pan, delay, attack: 0.004 });
    K.tone(f * 3, 0.18, { type: 'sine', vol: 0.025 * vel, pan, delay, attack: 0.003 });
    if (sp.under) K.tone(sp.under, 0.9, { type: 'triangle', vol: 0.07 * vel, pan, delay, attack: 0.006 });
  },
};

/* the quiet backing that keeps the tempo; step = eighth note in the bar (0..7), beat = beat number in the song */
const WALK = [116.5, 130.8, 146.8, 155.6, 174.6, 155.6, 146.8, 130.8];      // a walking bass in B flat
const GROOVES = {
  hats(step, d) { K.noise(0.045, { vol: step % 2 ? 0.05 : 0.09, freq: 8500, type: 'highpass', q: 0.4, delay: d }); },
  shaker(step, d) {
    K.noise(0.06, { vol: step % 2 ? 0.05 : 0.035, freq: 6000, q: 0.8, delay: d });
    if (step === 0 || step === 4) K.tone(step === 0 ? 82.4 : 98, 0.5, { vol: 0.12, delay: d, attack: 0.01 });
  },
  steps(step, d, beat) {                            // footsteps on the crosswalk, left, right
    if (step % 2 === 0) K.noise(0.07, { vol: 0.16, freq: 260, q: 0.8, type: 'lowpass', pan: (beat % 2 ? 0.3 : -0.3), delay: d });
  },
  road(step, d) {                                   // the road under the tyres: a thump on each beat, seams on the off-beat
    if (step % 2 === 0) K.tone(62, 0.16, { vol: 0.16, delay: d, slide: -15, attack: 0.004 });
    else K.noise(0.05, { vol: 0.05, freq: 500, q: 1, delay: d });
  },
  ride(step, d, beat) {                             // swing ride cymbal + walking bass
    if (step % 2 === 0) K.tone(WALK[beat % 8], 0.42, { type: 'triangle', vol: 0.11, delay: d, attack: 0.01 });
    if (step % 2 === 0 || step === 3 || step === 7) K.noise(step % 2 ? 0.12 : 0.25, { vol: step % 2 ? 0.04 : 0.06, freq: 7000, type: 'highpass', q: 0.5, delay: d });
  },
};

export function rhythmGame(cfg) {
  let G = null;
  const beatLen = 60 / cfg.bpm, barLen = beatLen * 4, LEAD = Math.max(0.9, beatLen * 1.5);
  const keys = Object.keys(cfg.spots);
  const voice = VOICES[cfg.voice] || VOICES.drums, groove = GROOVES[cfg.groove] || GROOVES.hats;
  const panOf = sp => Math.max(-0.9, Math.min(0.9, (sp.u - 0.5) * 4));        // the phone shows about u 0.27..0.73
  const swingT = (pos) => (Math.abs((pos % 1) - 0.5) < 1e-6 ? pos + (cfg.swing || 0) : pos);   // pos in beats

  /* the whole song as a timeline: a count-in bar, then each phrase twice — LISTEN, then YOUR TURN */
  function build() {
    const ev = [], notes = [];
    for (let b = 0; b < 4; b++) ev.push({ t: b * beatLen, type: 'count', n: b });
    cfg.bars.forEach((bar, i) => {
      const ls = barLen * (1 + 2 * i), ps = ls + barLen, n = bar.length, per = 4 / n;   // beats per step
      ev.push({ t: ls, type: 'listen', i }); ev.push({ t: ps, type: 'turn', i });
      for (let k = 0; k < n; k++) {
        const c = bar[k]; if (c === '.' || c === ' ') continue;
        const key = c.toUpperCase(), soft = c !== key; if (!cfg.spots[key]) continue;
        const pos = swingT(k * per);
        ev.push({ t: ls + pos * beatLen, type: 'hint', key, soft });
        notes.push({ t: ps + pos * beatLen, key, soft, judged: false });
      }
    });
    const endT = barLen * (1 + 2 * cfg.bars.length);
    for (let s = 8; s < (endT / beatLen) * 2; s++) ev.push({ t: swingT(s / 2) * beatLen, type: 'groove', step: s % 8, beat: Math.floor(s / 2) });
    ev.sort((a, b) => a.t - b.t);
    // timing window for each note: never more than half the gap to its neighbours
    notes.forEach((nt, i) => {
      const gap = Math.min(i > 0 ? nt.t - notes[i - 1].t : 9, i < notes.length - 1 ? notes[i + 1].t - nt.t : 9);
      nt.good = Math.min(0.15, gap * 0.48); nt.perfect = Math.min(0.075, nt.good * 0.55);
    });
    return { ev, notes, endT: endT + beatLen * 0.5 };
  }

  const now = () => (performance.now() - G.t0 - G.pausedMs) / 1000;
  function hud() {
    const total = cfg.bars.length, ph = Math.max(0, Math.min(total, G.phrase + 1));
    const mode = !G.started ? 'Count-in' : G.mode === 'turn' ? 'Your turn: tap!' : 'Listen…';
    const r = G.rate && G.t - G.rate.t < 0.6 ? G.rate.text : null;      // the last tap's rating, shown for a moment
    G.ui.panel(cfg.kicker || cfg.title, r ? `${r}<small>streak ${G.streak}</small>` : `${G.hits}<small>on beat · streak ${G.streak}</small>`,
      { segs: [ph, total], sub: `${mode}  ·  ${G.perfect} perfect · ${G.miss} missed`, warn: r === 'Miss' });
  }
  function pulse(key, amt = 1) { const s = G.spotS[key]; s.kick = Math.max(s.kick, amt); }
  function play(key, opts) { const sp = cfg.spots[key]; voice(sp, { pan: panOf(sp), delay: 0, vel: 1, ...opts }); }
  function dropRing(nt) { if (nt.ring) { G.root.remove(nt.ring); nt.ring.material.dispose(); nt.ring = null; } }

  function judge(nt, err) {
    nt.judged = true; dropRing(nt);
    const sp = cfg.spots[nt.key], [x, y] = G.S.P(sp.u, sp.v), a = Math.abs(err);
    if (a <= nt.good) {
      const perfect = a <= nt.perfect;
      G.hits++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      if (perfect) G.perfect++; else G.good++;
      play(nt.key, { vel: nt.soft ? 0.65 : 1, up: nt.soft });
      pulse(nt.key, perfect ? 1.2 : 0.8);
      G.fx.add(x, y, cfg.color || '#ffd25a', perfect ? 20 : 10, perfect ? 0.4 : 0.25);
      G.buzz(perfect ? 28 : 14);
      G.rate = { text: perfect ? 'Perfect!' : 'Good', t: G.t };
      if (G.streak % 10 === 0) { G.ui.alert(G.streak + ' in a row', cfg.streakLine || 'You are locked into the groove.', 1.1, 'blue'); G.say(G.streak + ' in a row!', false); }
    } else {
      G.miss++; G.streak = 0;
      K.tone(110, 0.16, { type: 'triangle', vol: 0.07, pan: panOf(sp), slide: -30 });
      G.rate = { text: 'Miss', t: G.t };
    }
    hud();
  }
  // the player's tap (anywhere on the screen, the big button, a key, or the robot)
  function tap() {
    if (!G || !G.playing || G.paused) return;
    const t = now();
    let best = null;
    for (let i = G.ni; i < G.notes.length; i++) {
      const nt = G.notes[i]; if (nt.t - t > 0.3) break; if (nt.judged) continue;
      if (!best || Math.abs(nt.t - t) < Math.abs(best.t - t)) best = nt;
    }
    if (best && Math.abs(best.t - t) <= best.good) { judge(best, t - best.t); return; }
    // nothing to hit: a soft click; during your turn it costs the streak (so mashing does not pay)
    K.tone(700, 0.04, { type: 'square', vol: 0.03 });
    if (G.mode === 'turn') { G.extra++; if (G.streak) { G.streak = 0; hud(); } }
  }
  function end() {
    G.playing = false; G.ui.frame(false);
    for (const nt of G.notes) dropRing(nt);
    for (const k of keys) { G.spotS[k].s.visible = false; G.spotS[k].g.visible = false; }
    const total = G.notes.length, acc = total ? G.hits / (total + G.extra * 0.5) : 0, pct = Math.round(acc * 100);
    const won = acc >= (cfg.pass ?? 0.6);
    const r = K.best(cfg.id + ':rhythm', pct, 'higher');
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: 'On beat', v: pct + '%' }, { k: 'Streak', v: G.bestStreak }, { k: 'Perfect', v: G.perfect }],
      say: `${W.title}. ${pct} percent on the beat. Best streak ${G.bestStreak}. ${W.line || ''}` });
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      const song = build();
      Object.assign(G, { ev: song.ev, notes: song.notes, endT: song.endT, ai: 0, vi: 0, ni: 0, hits: 0, perfect: 0, good: 0, miss: 0, extra: 0,
        streak: 0, bestStreak: 0, phrase: -1, mode: 'count', started: false, pausedMs: 0, t0: 0, lastDt: 0.016 });
      // the spots: an icon in a ring on each place in the painting that makes a sound, with a soft glow
      G.spotS = {};
      const size = cfg.size || 0.09;
      for (const k of keys) {
        const sp = cfg.spots[k], [x, y] = G.S.P(sp.u, sp.v);
        const g = K.sprite(K.glowTex, size * 2.2, { color: cfg.color || '#ffd25a', additive: true, opacity: 0.35, order: 11 }); g.position.set(x, y, 0.03);
        const s = K.sprite(K.emojiTex(sp.e || '●', { ring: true, color: cfg.color || '#ffd25a' }), size, { order: 14 }); s.position.set(x, y, 0.04);
        G.root.add(g, s); G.spotS[k] = { s, g, kick: 0, size, ph: Math.random() * 6 };
      }
      G.ui.buttons([{ label: 'Tap on the beat', kind: 'red', aria: 'Tap on the beat', press: tap }]);
      hud();
      G.onGo = () => {
        G.t0 = performance.now() + 250; G.pausedMs = 0;
        if (cfg.gliss) K.tone(233, 0.9, { type: 'triangle', vol: 0.12, slide: 700, attack: 0.05 });   // Gershwin's clarinet run up
      };
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // spots breathe, and jump when they sound
      for (const k of keys) {
        const o = G.spotS[k]; o.kick = Math.max(0, o.kick - dt * 4);
        o.s.scale.setScalar(o.size * (1 + 0.35 * o.kick + 0.03 * Math.sin(G.t * 2 + o.ph)));
        o.g.material.opacity = 0.3 + 0.55 * Math.min(1, o.kick); o.g.scale.setScalar(o.size * (2.2 + o.kick));
      }
      if (!G.playing) return;
      G.lastDt = Math.min(0.1, dt);
      if (G.rate && G.t - G.rate.t >= 0.6) { G.rate = null; hud(); }
      const t = now();
      // sounds go out a little ahead, so they land exactly on time
      while (G.ai < G.ev.length && G.ev[G.ai].t < t + 0.12) {
        const e = G.ev[G.ai++], d = Math.max(0, e.t - t);
        if (e.type === 'count') K.tone(e.n ? 1250 : 1650, 0.06, { type: 'square', vol: 0.09, delay: d, attack: 0.002 });
        else if (e.type === 'groove') groove(e.step, d, e.beat);
        else if (e.type === 'hint') { const sp = cfg.spots[e.key]; voice(sp, { pan: panOf(sp), delay: d, vel: e.soft ? 0.6 : 0.9, up: e.soft }); }
        else if (e.type === 'turn') K.tone(cfg.cue || 880, 0.09, { type: 'sine', vol: 0.05, delay: Math.max(0, d - 0.08) });
      }
      // what you see happens on time
      while (G.vi < G.ev.length && G.ev[G.vi].t <= t) {
        const e = G.ev[G.vi++];
        if (e.type === 'hint') { pulse(e.key, e.soft ? 0.7 : 1); G.buzz(12); }
        else if (e.type === 'count') { G.ui.pop(String(e.n + 1)); G.buzz(20); }
        else if (e.type === 'listen') { G.started = true; G.phrase = e.i; G.mode = 'listen'; G.ui.frame(false); hud(); if (e.i < 2) G.say('Listen', false); }
        else if (e.type === 'turn') { G.mode = 'turn'; G.ui.frame(true); hud(); if (e.i < 2) G.say('Your turn', false); }
      }
      // rings close onto the spots during your turn
      const size = cfg.size || 0.09;
      for (let i = G.ni; i < G.notes.length; i++) {
        const nt = G.notes[i]; if (nt.t - t > LEAD) break;
        if (nt.judged) continue;
        const sp = cfg.spots[nt.key];
        if (!nt.ring) { const [x, y] = G.S.P(sp.u, sp.v); nt.ring = K.sprite(K.ringTex, size, { color: nt.soft ? '#bfe6ff' : (cfg.ring || '#ffffff'), order: 16 }); nt.ring.position.set(x, y, 0.05); G.root.add(nt.ring); }
        const k = Math.max(0, (nt.t - t) / LEAD);                       // 1 → 0 as the beat arrives
        nt.ring.scale.setScalar(size * (1.05 + 2.4 * k));
        nt.ring.material.opacity = Math.min(1, (1 - k) * 2.2) * (t > nt.t ? Math.max(0, 1 - (t - nt.t) / 0.15) : 1);
      }
      // the robot taps on the beat (a few ms either side, like a person)
      if (G.bot) {
        let nt = null; for (let i = G.ni; i < G.notes.length; i++) if (!G.notes[i].judged) { nt = G.notes[i]; break; }
        if (nt) { if (nt.botOff === undefined) nt.botOff = (Math.random() - 0.5) * Math.min(0.04, nt.perfect); if (t + Math.min(G.lastDt * 0.5, nt.good * 0.4) >= nt.t + nt.botOff) tap(); }
      }
      // beats that went by without a tap
      while (G.ni < G.notes.length && (G.notes[G.ni].judged || t > G.notes[G.ni].t + G.notes[G.ni].good)) {
        const nt = G.notes[G.ni++]; if (!nt.judged) judge(nt, 9);
      }
      if (t >= G.endT) end();
    },
    pointer(kind, ev) {
      if (kind === 'down') tap();
    },
    pause() { if (G && !G.paused) { G.paused = true; G.pauseAt = performance.now(); } },
    resume() { if (G && G.paused) { G.paused = false; G.pausedMs += performance.now() - G.pauseAt; } },
    get over() { return !!(G && G.over); },
    get debug() {
      return G && { engine: 'rhythm', playing: G.playing, over: G.over, phrase: G.phrase + 1, phrases: cfg.bars.length, notes: G.notes.length,
        hits: G.hits, perfect: G.perfect, good: G.good, miss: G.miss, extra: G.extra, streak: G.streak, bestStreak: G.bestStreak };
    },
    stop() { K.cleanup(G); G = null; },
  };
}
