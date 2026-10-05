// CONNECT: bring people (or branches, or homes) together, one link at a time. A spark of connection travels from the
// last connected spot toward the next one while a ring closes in on it. Tap anywhere (or the big CONNECT button) just as
// the ring closes and the spark arrives: a line of light joins them, the spot glows and a warm note sounds, each one a
// step up a scale so the chain builds a chord. Too early or too late and the spark fizzles and has to travel again.
// A slowly draining "warmth" meter means dawdling costs you; when it runs out the game is lost. Sparks speed up
// along the chain. Win when every spot is linked: the whole network glows.
// By ear: the spark hums and pans across the stereo field as it travels, rising in pitch as it nears the next spot;
// a click marks the moment the tap window opens; each link plays its own note; misses fizzle; haptics on every event.
//
// cfg = {
//   engine: 'connect', title, how, kicker,
//   nodes: [{ u, v, name }, …]   8–14 real spots in the painting, in the order they get linked (node 0 starts lit)
//   travel: [2.4, 1.3]           seconds for the spark to reach the next spot, start → end of the chain
//   window: [0.3, 0.2]           seconds either side of the arrival that still count, start → end
//   rest: 0.7                    pause after a link before the next spark sets off
//   warmth: { drain: 1.1, miss: 14, link: 5 }   per second / per fizzle / per link (meter is 0..100)
//   scale: 'major'               a K.SCALES key (one note per link), octave: 1 (multiplier)
//   color: '#ffd25a' (light), ringColor, node: '✨' (optional emoji on unlit spots), unit: 'linked', button: 'Connect'
//   hum: 'triangle'              the spark's hum waveform
//   together: 'All together.'    spoken when the whole network glows
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

// a soft beam: bright centre fading to the edges across its width
const beamTex = K.canvasTex(16, 64, (g, w, h) => {
  const r = g.createLinearGradient(0, 0, 0, h);
  r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.35, 'rgba(255,255,255,.55)'); r.addColorStop(0.5, 'rgba(255,255,255,1)');
  r.addColorStop(0.65, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
});

export function connectGame(cfg) {
  let G = null;
  const N = cfg.nodes.length;
  const color = cfg.color || '#ffd25a';
  const scale = K.SCALES[cfg.scale || 'major'] || K.SCALES.major;
  const note = i => scale[i % scale.length] * (cfg.octave || 1) * (i >= scale.length ? 2 : 1);
  const W = Object.assign({ drain: 1.1, miss: 14, link: 5 }, cfg.warmth || {});
  const lerp = (a, b, p) => a + (b - a) * p;

  const pos = i => G.S.P(cfg.nodes[i].u, cfg.nodes[i].v);
  const panOf = i => Math.max(-1, Math.min(1, (cfg.nodes[i].u - 0.5) * 1.8));
  const name = i => cfg.nodes[i].name || ('spot ' + (i + 1));
  const prog = () => (G.linked - 1) / Math.max(1, N - 2);
  const travel = () => lerp(cfg.travel[0], cfg.travel[1], prog());
  const win = () => lerp(cfg.window[0], cfg.window[1], prog());

  /* ── the spark's hum: one oscillator pair we keep, panned and pitched as it travels ── */
  function humStart() {
    humStop();
    const a = K.audio(); if (!a) return;
    const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
    o.type = cfg.hum || 'triangle'; o2.type = 'sine'; o2.detune.value = 7;
    g.gain.value = 0.0001; g.gain.setTargetAtTime(0.04, a.currentTime, 0.08);
    o.connect(g); o2.connect(g); if (p) { g.connect(p); p.connect(a.destination); } else g.connect(a.destination);
    o.start(); o2.start(); G.hum = { a, o, o2, g, p };
  }
  function humSet(freq, pan, vol) {
    const h = G && G.hum; if (!h) return; const t = h.a.currentTime;
    h.o.frequency.setTargetAtTime(freq, t, 0.03); h.o2.frequency.setTargetAtTime(freq * 0.5, t, 0.03);
    if (h.p) h.p.pan.setTargetAtTime(pan, t, 0.03);
    h.g.gain.setTargetAtTime(vol, t, 0.05);
  }
  function humStop() {
    const h = G && G.hum; if (!h) return; G.hum = null;
    try { const t = h.a.currentTime; h.g.gain.cancelScheduledValues(t); h.g.gain.setTargetAtTime(0.0001, t, 0.04); h.o.stop(t + 0.25); h.o2.stop(t + 0.25); } catch (e) {}
  }

  /* ── pictures ── */
  function makeNode(i) {
    const [x, y] = pos(i);
    const glow = K.sprite(K.glowTex, 0.12, { color, additive: true, opacity: 0, order: 12 });
    glow.position.set(x, y, 0.03); G.root.add(glow);
    const dot = cfg.node
      ? K.sprite(K.emojiTex(cfg.node, { ring: true, color: '#fff' }), 0.06, { order: 14, opacity: 0.85 })
      : K.sprite(K.ringTex, 0.05, { order: 14, opacity: 0.8 });
    dot.position.set(x, y, 0.04); G.root.add(dot);
    const core = K.sprite(K.dotTex, 0.04, { color: '#fff', additive: true, opacity: 0, order: 15 });
    core.position.set(x, y, 0.045); G.root.add(core);
    return { glow, dot, core, lit: false, pulse: 0 };
  }
  function makeBeam(a, b) {
    const [x1, y1] = pos(a), [x2, y2] = pos(b), len = Math.hypot(x2 - x1, y2 - y1);
    const m = K.plane(beamTex, 1, 1, { additive: true, opacity: 0, order: 11 });
    m.material.color = new THREE.Color(color);
    m.position.set(x1, y1, 0.025); m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
    m.scale.set(0.0001, 0.022, 1); G.root.add(m);
    return { m, grow: 0, len, x1, y1, x2, y2 };
  }
  function light(i) {
    const n = G.nodes[i]; n.lit = true; n.pulse = 1;
    n.dot.visible = false; n.core.material.opacity = 1;
    const [x, y] = pos(i); G.fx.add(x, y, color, 22, 0.3);
  }

  function hud() {
    const w = Math.max(0, Math.round(G.warmth));
    const next = G.linked < N ? 'Next: ' + name(G.linked) + ' · ' : '';
    G.ui.panel(cfg.kicker || cfg.title, `${G.linked}<small>of ${N} ${cfg.unit || 'linked'}</small>`,
      { segs: [G.linked, N], sub: next + 'Warmth ' + w + '%', warn: w <= 30 });
  }

  /* ── the spark ── */
  function launch() {
    G.state = 'travel'; G.st = 0; G.opened = false;
    G.trav = travel(); G.win = win();
    const [x, y] = pos(G.linked - 1); G.spark.position.set(x, y, 0.06); G.sparkGlow.position.set(x, y, 0.055);
    G.spark.visible = true; G.sparkGlow.visible = true; G.ring.visible = true;
    humStart();
    K.tone(note(G.linked - 1) * 0.5, 0.12, { type: 'sine', vol: 0.05, pan: panOf(G.linked - 1) });
  }
  // a tap (anywhere, or the CONNECT button)
  function tap() {
    if (!G || !G.playing || G.paused || G.state !== 'travel') return;
    if (G.st < 0.15) return;                                 // a stray tap right as it sets off doesn't count
    const off = G.st - G.trav;                               // seconds from the perfect moment (− early, + late)
    if (Math.abs(off) <= G.win) link(off); else fizzle(off < 0 ? 'early' : 'late');
  }
  function link(off) {
    const i = G.linked, pan = panOf(i), [x, y] = pos(i);
    humStop();
    G.beams.push(makeBeam(i - 1, i)); light(i); G.linked++;
    G.state = 'rest'; G.st = 0; G.ring.visible = false; G.spark.visible = false; G.sparkGlow.visible = false;
    const perfect = Math.abs(off) <= G.win * 0.4; if (perfect) G.perfect++;
    G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
    // this link's note, with the two before it underneath so the chain builds a chord
    K.tone(note(i), 0.9, { type: 'triangle', vol: 0.16, pan, attack: 0.015 });
    K.tone(note(i) * 2, 0.5, { type: 'sine', vol: 0.05, pan, delay: 0.02 });
    if (i >= 2) K.chord([note(i - 2), note(i - 1)].map(f => f * 0.5), 1.1, { vol: 0.035, delay: 0.05, pan: pan * 0.5 });
    G.fx.add(x, y, '#ffffff', 14, 0.45);
    G.buzz(perfect ? [25, 30, 25] : 30);
    G.warmth = Math.min(100, G.warmth + W.link);
    if (perfect) G.ui.pop('PERFECT');
    hud();
    if (G.linked >= N) return together();
    if (G.streak > 0 && G.streak % 4 === 0) G.say(G.streak + ' in a row. ' + name(G.linked), false);
    else G.say(name(G.linked), false);
  }
  function fizzle(why) {
    humStop();
    const i = G.linked, x = G.spark.position.x, y = G.spark.position.y, pan = panOf(i);
    K.noise(0.45, { vol: 0.22, freq: 1800, sweepTo: 200, pan, q: 1.2 }); K.tone(note(i) * 0.5, 0.35, { type: 'sawtooth', vol: 0.05, pan, slide: -80 });
    G.fx.add(x, y, '#9a9a9a', 12, 0.2); G.buzz([70, 40, 70]);
    G.streak = 0; G.fizzles++;
    G.warmth -= W.miss;
    G.state = 'fizzle'; G.st = 0; G.ring.visible = false; G.spark.visible = false; G.sparkGlow.visible = false;
    const t = why === 'early' ? 'Too soon' : 'Too late';
    G.ui.alert(t, 'Tap as the ring closes on ' + name(i) + '.', 1.1, why === 'early' ? 'blue' : 'red');
    G.say(t, false);
    hud();
    if (G.warmth <= 0) { G.warmth = 0; end(false); }
  }
  // every spot is linked: the whole network glows
  function together() {
    G.state = 'glow'; G.st = 0; G.playing = false;
    for (let i = 0; i < N; i++) { const [x, y] = pos(i); G.fx.add(x, y, color, 16, 0.4); }
    K.chord([0, 2, 4, 7].map(k => note(Math.min(N - 1, k))), 2.2, { vol: 0.06, spread: 0.09 });
    G.say(cfg.together || 'All together.', false);
    G.buzz([40, 30, 40, 30, 120]);
  }
  function end(won) {
    humStop(); G.state = 'over';
    G.root.children.slice().forEach(o => { if (o.isSprite || o.isMesh) o.visible = false; });
    const r = K.best(cfg.id + ':connect', G.fizzles, 'lower');
    const R = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: R.title, line: R.line, best: won && r.isBest,
      cells: [{ k: cfg.unit || 'Linked', v: G.linked + '/' + N }, { k: 'Fizzles', v: G.fizzles }, { k: 'Perfect', v: G.perfect }] });
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { linked: 1, warmth: 100, fizzles: 0, perfect: 0, streak: 0, bestStreak: 0, state: 'wait', st: 0, beams: [], hum: null });
      G.nodes = cfg.nodes.map((_, i) => makeNode(i));
      G.spark = K.sprite(K.dotTex, 0.05, { color: '#fff', additive: true, order: 22 }); G.spark.visible = false; G.root.add(G.spark);
      G.sparkGlow = K.sprite(K.glowTex, 0.16, { color, additive: true, opacity: 0.85, order: 21 }); G.sparkGlow.visible = false; G.root.add(G.sparkGlow);
      G.ring = K.sprite(K.ringTex, 0.2, { color: cfg.ringColor || color, opacity: 0, order: 20 }); G.ring.visible = false; G.root.add(G.ring);
      light(0);
      G.ui.buttons([{ label: cfg.button || 'Connect', icon: '◎', kind: 'red', aria: 'Connect. Tap as the ring closes.', press: tap }]);
      hud();
      G.onGo = () => { G.state = 'rest'; G.st = 0.2; G.say(name(1), false); };
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.state === 'over') return;
      const d = Math.min(dt, 0.05);
      // lit spots breathe; beams draw themselves in
      const glowing = G.state === 'glow';
      for (let i = 0; i < N; i++) {
        const n = G.nodes[i];
        if (n.lit) {
          n.pulse = Math.max(0, n.pulse - d * 1.5);
          const all = glowing ? 0.5 + 0.5 * Math.sin(G.t * 6 - i * 0.7) : 0;
          n.glow.material.opacity = Math.min(1, 0.55 + n.pulse * 0.45 + all * 0.45);
          n.glow.scale.setScalar(0.11 + n.pulse * 0.12 + Math.sin(G.t * 2.4 + i) * 0.008 + all * 0.08);
          n.core.scale.setScalar(0.035 + n.pulse * 0.02);
        } else {
          const isNext = G.playing && i === G.linked;
          n.dot.material.opacity = isNext ? 0.75 + 0.25 * Math.sin(G.t * 6) : 0.45;
        }
      }
      for (const b of G.beams) {
        b.grow = Math.min(1, b.grow + d * 4);
        b.m.scale.x = Math.max(0.0001, b.len * b.grow);
        b.m.position.set(b.x1 + (b.x2 - b.x1) * b.grow / 2, b.y1 + (b.y2 - b.y1) * b.grow / 2, 0.025);
        b.m.material.opacity = glowing ? 0.75 + 0.25 * Math.sin(G.t * 7) : 0.8;
        b.m.scale.y = glowing ? 0.032 : 0.022;
      }
      if (glowing) { G.st += d; if (G.st > 2.2) end(true); return; }
      if (!G.playing) return;

      // warmth drains while you wait
      G.warmth -= W.drain * d;
      G.hudT = (G.hudT || 0) - d; if (G.hudT <= 0) { G.hudT = 0.5; hud(); }
      if (G.warmth <= 0) { G.warmth = 0; hud(); return end(false); }
      if (G.warmth < 25 && !G.coldSaid) { G.coldSaid = true; G.say('Warmth is low', false); }
      if (G.warmth >= 35) G.coldSaid = false;

      G.st += d;
      if (G.state === 'rest' && G.st >= (cfg.rest ?? 0.7)) launch();
      else if (G.state === 'fizzle' && G.st >= 0.9) launch();
      else if (G.state === 'travel') {
        const p = Math.min(1, G.st / G.trav), e = p * p * (3 - 2 * p) * 0.35 + p * 0.65;   // a gentle ease
        const [x1, y1] = pos(G.linked - 1), [x2, y2] = pos(G.linked);
        const x = x1 + (x2 - x1) * e, y = y1 + (y2 - y1) * e + Math.sin(p * Math.PI) * 0.03;
        G.spark.position.set(x, y, 0.06); G.sparkGlow.position.set(x, y, 0.055);
        G.sparkGlow.scale.setScalar(0.13 + Math.sin(G.t * 20) * 0.015);
        // the ring closes on the next spot exactly as the spark arrives
        const left = G.trav - G.st, inWin = Math.abs(left) <= G.win;
        G.ring.position.set(x2, y2, 0.05);
        G.ring.scale.setScalar(0.05 + Math.max(0, left / G.trav) * 0.24);
        G.ring.material.opacity = Math.min(1, 0.25 + p * 0.9);
        G.ring.material.color.set(inWin ? '#ffffff' : (cfg.ringColor || color));
        // hum: pans with the spark, rises an octave as it nears
        humSet(note(G.linked) * 0.5 * Math.pow(2, p), Math.max(-1, Math.min(1, x * 1.8)), 0.025 + p * 0.05);
        if (!G.opened && left <= G.win) { G.opened = true; K.tone(1800, 0.03, { type: 'square', vol: 0.07, pan: panOf(G.linked) }); G.buzz(8); }
        if (left < -G.win) fizzle('late');
        else if (G.bot && left <= G.win * 0.25) tap();       // the robot taps right on time
      }
    },
    pointer(kind) { if (kind === 'down') tap(); },
    pause() { if (G) { G.paused = true; if (G.hum) G.hum.g.gain.setTargetAtTime(0.0001, G.hum.a.currentTime, 0.03); } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'connect', playing: G.playing, over: G.over, linked: G.linked, nodes: N, warmth: Math.round(G.warmth), fizzles: G.fizzles, perfect: G.perfect, state: G.state }; },
    stop() { if (G) humStop(); K.cleanup(G); G = null; },
  };
}
