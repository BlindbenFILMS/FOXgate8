// CATCH: things come down the painting in three lanes. Move the catcher (tap the left / middle / right of the
// screen, or the three buttons) to catch the good ones and dodge the bad ones.
// By ear: each thing chimes from its lane when it appears and ticks faster as it gets close; good and bad sound different.
//
// cfg = {
//   engine: 'catch', title, how, kicker,
//   lanes: [u, u, u]            x of the three lanes (0..1 across the painting)
//   top: v, line: v             where things appear, and the catch line (0..1 down the painting)
//   catcher: '🧺'               emoji (or text) for the catcher
//   good: [{ e: '📼', name: 'tape' }, …]   bad: [{ e: '⛈️', name: 'storm' }, …] (optional)
//   goal: 15, maxMiss: 6, fall: [3.2, 1.6] (seconds from top to line, start → end), every: [1.5, 0.75] (seconds between)
//   color: '#ffd25a' (catch sparkle), unit: 'caught',
//   win: { title, line }, lose: { title, line }
// Optional extras:
//   sound: 'tape' | 'bloom' | 'brass' | 'bells'   how things sound as they fall (default: a chime and a quickening tick)
//                               'bells' rings a jingle the whole way down, louder as it nears, like a goalball
//   melody: [Hz, …]             each catch plays the next note of this tune (instead of the rising scale)
//   good/bad kinds may have f: Hz (their own falling pitch) so each kind can be told apart by ear
//   announce: true              say and show the name of each good thing as it is caught
//   missLabel: 'Goals against'  word for misses in the score panel; missHit: { title, sub } alert when a good one gets past
//   blindfold: 0.8              darken the painting this much and dim the falling things: play by sound (eyeshades on)
//   goSay: 'Play!'              spoken the moment the game starts
// }
import * as THREE from 'three';
import * as K from '../kit.js';

export function catchGame(cfg) {
  let G = null;
  const LANE_NAMES = ['left', 'middle', 'right'];
  function hud() {
    G.ui.panel(cfg.kicker || cfg.title, `${G.score}<small>${cfg.unit || 'caught'}</small>`,
      { segs: [G.score, cfg.goal], sub: `${cfg.missLabel || 'Missed'} ${G.miss} of ${cfg.maxMiss}`, warn: G.miss >= cfg.maxMiss - 1 });
  }
  function moveTo(lane) {
    if (!G || !G.playing || lane === G.lane) return;
    G.lane = lane; K.tone(lane === 0 ? 330 : lane === 1 ? 440 : 554, 0.06, { type: 'triangle', vol: 0.07, pan: (lane - 1) * 0.8 });
  }
  // ── sounds (by preset) ──
  const SND = cfg.sound || 'chime';
  const pan3 = lane => (lane - 1) * (SND === 'bells' ? 1 : 0.85);
  function fallSound(it) {
    const pan = pan3(it.lane), f = it.kind.f || (it.bad ? 196 : 784);
    if (SND === 'tape') { K.noise(0.05, { vol: 0.22, freq: 2400, q: 2, pan }); K.noise(0.05, { vol: 0.18, freq: 1600, q: 2, pan, delay: 0.07 }); if (it.bad) K.tone(150, 0.25, { type: 'sawtooth', vol: 0.06, pan }); else K.tone(f, 0.12, { type: 'triangle', vol: 0.06, pan, delay: 0.1 }); }
    else if (SND === 'bloom') { if (it.bad) K.noise(0.6, { vol: 0.12, freq: 260, sweepTo: 140, pan }); else { K.tone(f, 0.4, { vol: 0.07, pan, attack: 0.05 }); K.tone(f * 1.5, 0.3, { vol: 0.03, pan, delay: 0.08, attack: 0.05 }); } }
    else if (SND === 'brass') { if (it.bad) { for (let i = 0; i < 4; i++) K.tone(1320, 0.05, { type: 'square', vol: 0.04, pan, delay: i * 0.08 }); } else K.tone(f, 0.3, { type: 'sawtooth', vol: 0.035, pan, attack: 0.04, slide: 4 }); }
    else if (SND === 'bells') { jingle(pan, 0.05); K.noise(0.5, { vol: 0.1, freq: 120, q: 0.7, pan, type: 'lowpass' }); }
    else K.tone(it.bad ? 196 : (it.kind.f || 784), 0.14, { type: it.bad ? 'sawtooth' : 'sine', vol: it.bad ? 0.06 : 0.09, pan });
  }
  function nearSound(it) {      // called every few tenths of a second as it falls: return the gap to the next one
    const pan = pan3(it.lane);
    if (SND === 'bells') { jingle(pan, 0.03 + it.t * 0.09); if (Math.random() < 0.5) K.noise(0.18, { vol: 0.05 + it.t * 0.1, freq: 110, q: 0.7, pan, type: 'lowpass' }); return 0.32 - it.t * 0.2; }
    if (it.t <= 0.55) return 0.05;
    if (SND === 'tape') K.noise(0.03, { vol: 0.12, freq: it.bad ? 500 : 3000, q: 3, pan });
    else if (SND === 'bloom' && !it.bad) K.tone((it.kind.f || 784) * 2, 0.06, { vol: 0.035, pan });
    else K.tone(it.bad ? 260 : 990, 0.04, { vol: 0.045, pan });
    return 0.42 - it.t * 0.3;
  }
  function jingle(pan, vol) { for (let i = 0; i < 3; i++) K.tone(2400 + Math.random() * 1600, 0.07, { vol, pan, delay: i * 0.035 + Math.random() * 0.02 }); }
  function catchSound(pan) {
    if (cfg.melody) {
      const f = cfg.melody[(G.score - 1) % cfg.melody.length];
      if (SND === 'brass') { K.tone(f, 0.45, { type: 'sawtooth', vol: 0.06, pan, attack: 0.03 }); K.tone(f, 0.45, { type: 'triangle', vol: 0.12, pan, attack: 0.02 }); K.tone(f * 2, 0.3, { vol: 0.03, pan, delay: 0.02 }); }
      else { K.tone(f, 0.4, { type: 'triangle', vol: 0.15, pan }); K.tone(f * 2, 0.25, { vol: 0.05, pan, delay: 0.03 }); }
    } else if (SND === 'bells') { K.noise(0.12, { vol: 0.35, freq: 300, q: 0.8, pan }); jingle(pan, 0.08); K.sfx.good(pan, G.score); }
    else K.sfx.good(pan, G.score);
  }
  function spawn() {
    const bad = cfg.bad && cfg.bad.length && Math.random() < (cfg.badChance ?? 0.3);
    const kind = bad ? cfg.bad[(Math.random() * cfg.bad.length) | 0] : cfg.good[(Math.random() * cfg.good.length) | 0];
    let lane = (Math.random() * 3) | 0;
    const s = K.sprite(K.emojiTex(kind.e, { ring: true, color: bad ? '#ff5a4a' : (cfg.color || '#ffd25a') }), 0.1, { order: 20 });
    const [x, y] = G.S.P(cfg.lanes[lane], cfg.top); s.position.set(x, y, 0.04); G.root.add(s);
    const it = { lane, bad, kind, s, t: 0, fall: G.fall, tick: 0 };
    G.items.push(it);
    if (cfg.blindfold) s.material.opacity = cfg.dimTo ?? 0.22;
    fallSound(it);
  }
  function popAt(text, x, y) {   // a word tag just above a point on the painting
    const v = new THREE.Vector3(x, y + 0.09, 0.05); G.root.localToWorld(v); v.project(G.camera);
    const r = G.renderer.domElement.getBoundingClientRect();
    G.ui.pop(text, Math.max(120, Math.min(innerWidth - 120, r.left + (v.x + 1) / 2 * r.width)), Math.max(200, r.top + (1 - v.y) / 2 * r.height));
  }
  function land(it) {
    const pan = pan3(it.lane), [x, y] = G.S.P(cfg.lanes[it.lane], cfg.line);
    const inLane = it.lane === G.lane;
    if (inLane && !it.bad) {
      G.score++; catchSound(pan); G.fx.add(x, y, cfg.color || '#ffd25a'); G.buzz(20);
      if (cfg.announce && it.kind.name) { popAt(it.kind.name, x, y); if (G.score % 5) G.say(it.kind.name, false); }
      if (G.score % 5 === 0 && G.score < cfg.goal) G.say(G.score + ' ' + (cfg.unit || 'caught'), false);
    }
    else if (inLane && it.bad) { G.miss++; K.sfx.bad(pan); G.buzz([80, 40, 120]); G.ui.alert(cfg.badHit || ('Oh no, ' + it.kind.name + '!'), 'Dodge the ' + (cfg.badName || 'bad ones') + '.', 1.1); G.say('Oh no, ' + it.kind.name, false); }
    else if (!it.bad) {
      G.miss++; K.tone(220, 0.25, { type: 'triangle', vol: 0.07, pan, slide: -60 });
      if (cfg.missHit) { G.ui.alert(cfg.missHit.title, cfg.missHit.sub, 1.1, 'black'); G.buzz([60, 30, 60]); if (cfg.missHit.say) G.say(cfg.missHit.say, false); }
    }
    else { K.tone(660, 0.08, { vol: 0.04, pan }); }
    G.root.remove(it.s); it.s.material.dispose();
    hud();
    if (G.score >= cfg.goal) end(true); else if (G.miss >= cfg.maxMiss) end(false);
  }
  function end(won) {
    for (const it of G.items) { G.root.remove(it.s); it.s.material.dispose(); } G.items = [];
    G.catcher.visible = false; G.glow.visible = false; if (G.shade) G.shade.visible = false;
    const r = K.best(cfg.id + ':catch', G.score, 'higher');
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: cfg.unit || 'Caught', v: G.score }, { k: cfg.missLabel || 'Missed', v: G.miss }] });
  }
  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.items = []; G.score = 0; G.miss = 0; G.lane = 1; G.spawnT = 0.6; G.fall = cfg.fall[0];
      const [cx, cy] = G.S.P(cfg.lanes[1], cfg.line);
      G.catcher = K.sprite(K.emojiTex(cfg.catcher || '🧺', { ring: true, color: '#fff', bg: 'rgba(236,48,19,.85)' }), 0.13, { order: 25 });
      G.catcher.position.set(cx, cy, 0.05); G.root.add(G.catcher);
      G.glow = K.sprite(K.glowTex, 0.26, { color: cfg.color || '#ffd25a', additive: true, opacity: 0.5, order: 24 }); G.glow.position.set(cx, cy, 0.045); G.root.add(G.glow);
      if (cfg.blindfold) {   // eyeshades: the painting goes dark, play by ear
        G.shade = K.plane(K.canvasTex(4, 4, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 4, 4); }), 1, G.h, { opacity: 0, order: 12 });
        G.shade.position.z = 0.02; G.root.add(G.shade);
      }
      G.onGo = () => { if (cfg.goSay) G.say(cfg.goSay); };
      G.ui.buttons([
        { label: '◀', aria: 'Move left', press: () => moveTo(Math.max(0, G.lane - 1)) },
        { label: '●', aria: 'Move to the middle', press: () => moveTo(1) },
        { label: '▶', aria: 'Move right', press: () => moveTo(Math.min(2, G.lane + 1)) },
      ]);
      hud();
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // the catcher glides to its lane
      const [tx, ty] = G.S.P(cfg.lanes[G.lane], cfg.line);
      G.catcher.position.x += (tx - G.catcher.position.x) * Math.min(1, dt * 14); G.glow.position.x = G.catcher.position.x;
      G.catcher.position.y = ty + Math.sin(G.t * 3) * 0.004;
      if (G.shade) G.shade.material.opacity += ((G.playing ? cfg.blindfold : 0) - G.shade.material.opacity) * Math.min(1, dt * 2);
      if (!G.playing) return;
      const prog = G.score / cfg.goal;
      G.fall = cfg.fall[0] + (cfg.fall[1] - cfg.fall[0]) * prog;
      G.spawnT -= dt;
      const every = cfg.every[0] + (cfg.every[1] - cfg.every[0]) * prog;
      if (G.spawnT <= 0) { spawn(); G.spawnT = every * (0.85 + Math.random() * 0.3); }
      for (const it of G.items.slice()) {
        it.t += dt / it.fall;
        const v = cfg.top + (cfg.line - cfg.top) * it.t, [x, y] = G.S.P(cfg.lanes[it.lane], v);
        it.s.position.set(x, y, 0.04); it.s.scale.setScalar(0.085 + it.t * 0.03);
        it.tick -= dt; if (it.tick <= 0) it.tick = nearSound(it);
        if (it.t >= 1) { G.items.splice(G.items.indexOf(it), 1); land(it); if (G.over) return; }
      }
      // the robot player: stand under the next good thing, step away from a bad one
      if (G.bot) {
        const next = G.items.filter(i => !i.bad).sort((a, b) => b.t - a.t)[0], danger = G.items.find(i => i.bad && i.t > 0.7 && i.lane === G.lane);
        if (next) moveTo(next.lane); if (danger && (!next || next.lane === G.lane)) moveTo((G.lane + 1) % 3);
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') { G.down = { x: ev.clientX, t: performance.now() }; return; }
      if (kind !== 'up' || !G.down) return;
      const dx = ev.clientX - G.down.x; G.down = null;
      if (Math.abs(dx) > 40) moveTo(Math.max(0, Math.min(2, G.lane + Math.sign(dx))));
      else moveTo(G.S.screenThird(ev) + 1);
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'catch', playing: G.playing, over: G.over, score: G.score, miss: G.miss, goal: cfg.goal }; },
    stop() { K.cleanup(G); G = null; },
  };
}
