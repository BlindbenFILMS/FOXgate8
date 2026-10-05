// ECHO: call and response (a "Simon" game) on the painting. A few spots on the painting each have their own voice.
// Each round the painting plays a sequence (each spot glows and sings); you play it back by tapping the spots on the
// painting or the big buttons along the bottom (one per spot, in the same left-to-right order). The sequence grows
// by one note each round until it reaches the target length. A mistake replays the sequence; 3 mistakes ends the game.
// By ear: at the start every spot is introduced by name with its own note, panned to where it sits on the painting;
// each spot keeps its own pitch and timbre, the phases are spoken ("Listen", "Your turn"), every press sounds and buzzes,
// and if you wait too long the sequence plays again. No looking needed: the buttons alone play the whole game.
//
// cfg = {
//   engine: 'echo', title, kicker, how,
//   pads: [{ u, v, name, btn, color, note, sound, vowel, pair }]   LIST LEFT TO RIGHT (the buttons follow this order).
//          name = spoken name, btn = short label, note = Hz, sound = 'voice'|'bell'|'glass'|'pluck'|'drop'|'drum',
//          pair = index of a partner pad that shimmers softly with it (e.g. a reflection)
//   sound: default sound, vowel: 'a'|'o'|'e'|'i'|'u' (for 'voice'), padSize: 0.1, reach: 0.11 (tap distance)
//   start: 2 (first length), target: 7 (length to win), maxMiss: 3, gap: 0.6 (seconds between notes), idle: 8
//   pattern: 'random' | 'alternate' (left half and right half take turns, like a conversation) | 'melodic' (steps to a neighbour)
//   listen: ['Your sister goes first.', …] (spoken before each playback, in turn), turn: 'Your turn.', praise: [...]
//   reward: 'chord' | 'splash' | 'shimmer' | 'reply' (the sound when a round is echoed right)
//   unit: 'notes', missTitle, win: { title, line }, lose: { title, line }
// }
import * as K from '../kit.js';

/* a pad's voice: small synths on the kit's audio context */
const FORMANTS = { a: [800, 1200], o: [500, 900], e: [450, 2000], i: [320, 2500], u: [350, 700] };
function sing(f, dur, { sound = 'bell', pan = 0, vol = 1, vowel = 'a', delay = 0 } = {}) {
  const a = K.audio(); if (!a) return;
  if (sound === 'voice') {
    const t = a.currentTime + delay, o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain(), g = a.createGain();
    let dest = a.destination;
    if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(a.destination); dest = p; }
    o.type = 'sawtooth'; o.frequency.value = f; lfo.frequency.value = 5.2; lg.gain.value = f * 0.012; lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16 * vol, t + 0.06);
    g.gain.setValueAtTime(0.16 * vol, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const [f1, f2] = FORMANTS[vowel] || FORMANTS.a;
    for (const [ff, q, gv] of [[f1, 5, 1], [f2, 7, 0.5]]) { const bp = a.createBiquadFilter(), bg = a.createGain(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q; bg.gain.value = gv; o.connect(bp).connect(bg).connect(g); }
    g.connect(dest); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    K.tone(f, dur, { type: 'sine', vol: 0.05 * vol, pan, delay, attack: 0.06 });
  } else if (sound === 'glass') {
    K.tone(f, dur * 1.3, { type: 'sine', vol: 0.13 * vol, pan, delay, attack: 0.03 });
    K.tone(f * 3, dur, { type: 'sine', vol: 0.035 * vol, pan, delay: delay + 0.02, attack: 0.04 });
    K.tone(f * 2.01, dur * 0.9, { type: 'sine', vol: 0.03 * vol, pan, delay, attack: 0.06 });
  } else if (sound === 'pluck') {
    K.tone(f, dur, { type: 'triangle', vol: 0.17 * vol, pan, delay, attack: 0.004 });
    K.noise(0.05, { vol: 0.12 * vol, freq: f * 4, pan, delay, q: 2 });
  } else if (sound === 'drop') {
    K.tone(f * 0.8, dur * 0.7, { type: 'sine', vol: 0.15 * vol, pan, slide: f * 0.5, delay, attack: 0.005 });
    K.tone(f, dur, { type: 'triangle', vol: 0.06 * vol, pan, delay: delay + 0.04 });
    K.noise(0.18, { vol: 0.08 * vol, freq: 1800, sweepTo: 600, pan, delay });
  } else if (sound === 'drum') {
    K.tone(f, dur * 0.8, { type: 'sine', vol: 0.24 * vol, pan, slide: -f * 0.4, delay, attack: 0.003 });
    K.noise(0.12, { vol: 0.16 * vol, freq: 300, pan, delay, type: 'lowpass' });
    K.tone(f * 2, 0.08, { type: 'triangle', vol: 0.05 * vol, pan, delay });
  } else { // bell
    K.tone(f, dur * 1.2, { type: 'sine', vol: 0.14 * vol, pan, delay, attack: 0.004 });
    K.tone(f * 2.76, dur * 0.5, { type: 'sine', vol: 0.04 * vol, pan, delay, attack: 0.004 });
  }
}

export function echoGame(cfg) {
  let G = null;
  const N = cfg.pads.length, maxMiss = cfg.maxMiss || 3, target = cfg.target || 7, startLen = cfg.start || 2, gap = cfg.gap || 0.6;
  const unit = cfg.unit || 'notes';
  const panOf = (i) => Math.max(-0.95, Math.min(0.95, (cfg.pads[i].u - 0.5) * 2));
  const voiceOf = (i) => ({ sound: cfg.pads[i].sound || cfg.sound, vowel: cfg.pads[i].vowel || cfg.vowel, pan: panOf(i) });

  /* a tiny scheduler on the game clock (it stops while paused) */
  const later = (secs, fn) => G.timers.push({ at: G.clock + secs, fn });
  const clearTimers = () => { G.timers = []; };

  function hud() {
    const len = G.seq.length || startLen;
    const phase = G.phase === 'input' ? 'Your turn' : G.phase === 'meet' ? 'Meet the voices' : 'Listen';
    G.ui.panel(cfg.kicker || cfg.title, `${phase}<small>${len} ${unit}</small>`,
      { segs: [G.phase === 'input' || G.phase === 'wait' ? G.pos : 0, len],
        sub: `Echo ${len} of ${target} · Mistakes ${G.miss} of ${maxMiss}`, warn: G.miss >= maxMiss - 1 });
  }

  // light a pad: glow, pulse, its voice, a sparkle; its partner (a reflection) shimmers softly
  function light(i, { soft = false, dur = 0.42 } = {}) {
    const p = G.pads[i], c = cfg.pads[i];
    if (soft) { p.lit = Math.max(p.lit, 0.5); return; }
    p.lit = 1;
    sing(c.note, dur, voiceOf(i));
    G.fx.add(p.x, p.y, c.color, 10, 0.22);
    if (c.pair != null && G.pads[c.pair]) light(c.pair, { soft: true });
    const b = G.btns[i];
    if (b && !b.classList.contains('down')) { b.classList.add('lit'); setTimeout(() => b.classList.remove('lit'), 260); }
  }

  function nextNote() {
    const last = G.seq.length ? G.seq[G.seq.length - 1] : -1, r = (n) => (Math.random() * n) | 0;
    const pat = cfg.pattern || 'random';
    if (pat === 'alternate' && last >= 0) {         // a conversation: the other side answers
      const half = Math.ceil(N / 2), opts = [];
      for (let k = 0; k < N; k++) if ((k < half) !== (last < half)) opts.push(k);
      return opts[r(opts.length)];
    }
    if (pat === 'melodic' && last >= 0) {           // a tune: mostly steps to a neighbour, sometimes a leap
      const size = Math.random() < 0.7 ? 1 : 2, step = Math.random() < 0.5 ? -size : size;
      let n = last + step; if (n < 0 || n >= N) n = last - step;
      return Math.max(0, Math.min(N - 1, n));
    }
    let n = r(N); if (n === last && Math.random() < 0.7) n = (n + 1 + r(N - 1)) % N;
    return n;
  }

  // the painting plays the sequence, then it is your turn
  function playback(line) {
    clearTimers(); G.phase = 'play'; G.pos = 0; G.ui.frame(false); hud();
    if (line === undefined) { const L = cfg.listen || ['Listen.']; line = L[(G.round - 1) % L.length]; }
    if (line) G.say(line, false);
    const lead = line ? 1.3 : 0.5;
    G.seq.forEach((i, k) => later(lead + k * gap, () => light(i)));
    later(lead + (G.seq.length - 1) * gap + 0.65, () => {
      G.phase = 'input'; G.pos = 0; G.idle = 0; G.botT = 0.5; hud();
      G.ui.frame(true); K.tone(660, 0.1, { type: 'square', vol: 0.05 }); G.buzz(25);
      if (G.round <= 2 && !G.bot) G.say(cfg.turn || 'Your turn.', false);
    });
  }

  function newRound() {
    if (!G.seq.length) while (G.seq.length < startLen) G.seq.push(nextNote());
    else G.seq.push(nextNote());
    G.round++;
    playback();
  }

  // the player (or the robot) presses pad i: a tap on the painting or a big button
  function press(i) {
    if (!G || !G.playing || G.paused) return;
    if (G.phase !== 'input') {          // tapping while the painting plays: a quiet hum, no penalty
      if (G.phase === 'play' || G.phase === 'meet') sing(cfg.pads[i].note, 0.15, { ...voiceOf(i), vol: 0.25 });
      return;
    }
    G.idle = 0; G.presses++;
    light(i, { dur: 0.36 }); G.buzz(18);
    if (i === G.seq[G.pos]) { G.pos++; hud(); if (G.pos >= G.seq.length) roundDone(); }
    else mistake(i);
  }

  function roundDone() {
    G.phase = 'wait'; G.ui.frame(false); G.best = Math.max(G.best, G.seq.length); hud();
    const len = G.seq.length;
    later(0.35, reward);
    if (len >= target) { later(1.4, () => end(true)); return; }
    const praise = cfg.praise || ['Lovely.', 'Yes!', 'Beautiful.', 'Just right.'], word = praise[(G.round - 1) % praise.length];
    G.ui.alert(word, `${len} ${unit} echoed. Next: ${len + 1}.`, 1.2, 'blue');
    G.say(word + ' Now ' + (len + 1) + '.', false);
    later(1.7, newRound);
  }

  function reward() {
    const kind = cfg.reward || 'chord', used = [...new Set(G.seq)];
    for (const i of used) G.pads[i].lit = Math.max(G.pads[i].lit, 0.75);
    if (kind === 'splash') { K.noise(0.7, { vol: 0.14, freq: 2400, sweepTo: 500, q: 0.7 }); used.forEach((i, k) => sing(cfg.pads[i].note * 2, 0.3, { sound: 'drop', pan: panOf(i), vol: 0.5, delay: 0.08 * k })); }
    else if (kind === 'shimmer') { K.wind(1.0, { vol: 0.08, from: 1800, to: 5000 }); used.forEach((i, k) => sing(cfg.pads[i].note * 2, 0.6, { sound: 'glass', pan: panOf(i), vol: 0.45, delay: 0.07 * k })); }
    else if (kind === 'reply') { used.forEach((i, k) => sing(cfg.pads[i].note, 0.25, { ...voiceOf(i), vol: 0.5, delay: 0.12 * k })); }
    else K.chord(used.map(i => cfg.pads[i].note), 1.3, { vol: 0.06, spread: 0.07 });
    for (const i of used) G.fx.add(G.pads[i].x, G.pads[i].y, cfg.pads[i].color, 8, 0.3);
    G.buzz([30, 30, 30]);
  }

  function mistake(i) {
    G.miss++; G.phase = 'wait'; G.ui.frame(false);
    K.sfx.bad(panOf(i)); G.buzz([90, 50, 140]);
    const want = cfg.pads[G.seq[G.pos]].name;
    hud();
    if (G.miss >= maxMiss) { G.ui.alert(cfg.missTitle || 'Out of tune', 'It was ' + want + '.', 1.4); G.say('It was ' + want + '.'); later(1.6, () => end(false)); return; }
    const left = maxMiss - G.miss;
    G.ui.alert(cfg.missTitle || 'Not quite', `It was ${want}. Listen again. ${left} ${left === 1 ? 'chance' : 'chances'} left.`, 1.8);
    G.say('Not quite. It was ' + want + '. Listen again.');
    later(1.2, () => playback(''));
  }

  function end(won) {
    clearTimers(); G.phase = 'over'; G.ui.frame(false);
    for (const p of G.pads) for (const o of p.objs) o.visible = false;
    const r = K.best(cfg.id + ':echo', G.best, 'higher');
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: 'Longest echo', v: G.best }, { k: 'Mistakes', v: G.miss }] });
  }

  // at GO: meet each voice, left to right (name spoken + its note from its place), then round 1
  function meet() {
    G.phase = 'meet'; hud();
    const step = G.bot ? 0.5 : 1.4;
    cfg.pads.forEach((c, i) => later(0.2 + i * step, () => { light(i); if (!G.bot || i === 0) G.say(c.name, false); }));
    later(0.5 + N * step, newRound);
  }

  function nearestPad(b) {
    let best = -1, bd = 1e9;
    G.pads.forEach((p, i) => { const d = Math.hypot(p.x - b.x, p.y - b.y); if (d < bd) { bd = d; best = i; } });
    return bd < (cfg.reach || 0.11) ? best : -1;
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { timers: [], clock: 0, seq: [], pos: 0, round: 0, miss: 0, best: 0, phase: 'intro', idle: 0, presses: 0, botT: 0 });
      const size = cfg.padSize || 0.1;
      G.pads = cfg.pads.map((c, i) => {
        const [x, y] = G.S.P(c.u, c.v);
        const glow = K.sprite(K.glowTex, size * 2, { color: c.color, additive: true, opacity: 0.2, order: 18 });
        const ring = K.sprite(K.ringTex, size, { color: c.color, opacity: 0.9, order: 20 });
        const dot = K.sprite(K.dotTex, size * 0.3, { color: '#ffffff', opacity: 0.5, order: 21 });
        const lw = size * 1.15, lab = K.plane(K.wordTex(c.btn || c.name, { bar: c.color }), lw, lw / 4, { order: 22, opacity: 0.92 });
        glow.position.set(x, y, 0.03); ring.position.set(x, y, 0.035); dot.position.set(x, y, 0.036);
        lab.position.set(x, y - size * 0.68, 0.04);
        for (const o of [glow, ring, dot, lab]) G.root.add(o);
        return { x, y, glow, ring, dot, lab, objs: [glow, ring, dot, lab], lit: 0, base: size, ph: i * 1.3 };
      });
      G.btns = G.ui.buttons(cfg.pads.map((c, i) => ({ label: c.btn || c.name, aria: c.name, press: () => press(i) })));
      G.btns.forEach((b, i) => {
        b.style.borderBottom = `8px solid ${cfg.pads[i].color}`; b.style.setProperty('--pad', cfg.pads[i].color); b.style.transition = 'background .12s';
        if (N >= 4) Object.assign(b.style, { fontSize: N >= 5 ? '12px' : '13px', padding: '0 3px', lineHeight: '1.05', textAlign: 'center', letterSpacing: '.02em' });
      });
      // a lit button flashes its pad's colour while the painting plays it
      if (!document.getElementById('mg-echo-css')) {
        const s = document.createElement('style'); s.id = 'mg-echo-css';
        s.textContent = '.mgk-btns button.lit{background:var(--pad,#000) !important;color:#000 !important;filter:none !important}';
        document.head.appendChild(s);
      }
      G.onGo = meet;
      hud();
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // pads breathe softly; a lit pad flares and fades
      for (const p of G.pads) {
        p.lit = Math.max(0, p.lit - dt * 2.4);
        const breathe = 0.5 + 0.5 * Math.sin(G.t * 1.6 + p.ph);
        p.glow.material.opacity = 0.14 + 0.08 * breathe + p.lit * 0.8;
        p.glow.scale.setScalar(p.base * (1.8 + p.lit * 1.2));
        p.ring.scale.setScalar(p.base * (1 + p.lit * 0.3));
        p.dot.material.opacity = 0.3 + p.lit * 0.7;
      }
      if (!G.playing) return;
      G.clock += dt;
      for (const tm of G.timers.slice()) if (G.clock >= tm.at && G.timers.includes(tm)) { G.timers.splice(G.timers.indexOf(tm), 1); tm.fn(); if (!G || G.over) return; }
      if (G.phase === 'input') {
        // waited a long time: hear it again (no penalty)
        G.idle += dt;
        if (G.idle > (cfg.idle || 8)) { G.idle = 0; playback('Listen again.'); return; }
        // the robot echoes the sequence with the same press() a player uses
        if (G.bot) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.42; press(G.seq[G.pos]); } }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const b = G.S.toBoard(ev, G.root); if (!b) return;
      const i = nearestPad(b); if (i >= 0) press(i);
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'echo', playing: G.playing, over: G.over, phase: G.phase, round: G.round, length: G.seq.length, target, pos: G.pos, miss: G.miss, best: G.best, presses: G.presses }; },
    stop() { K.cleanup(G); G = null; },
  };
}
