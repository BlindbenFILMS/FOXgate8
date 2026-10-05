// POP: "spot it fast". Things pop up at real places on the painting for a short moment (the moment shrinks as you
// go). Tap the good ones before they fade; leave the bad ones alone. Reach the goal before the time runs out.
// By ear: every pop sounds from where it is (left/right pan, higher on the painting = higher note) and ticks again
// just before it fades. Tapping anywhere in the same third of the screen (left / middle / right) also catches the
// good thing that is showing there, so you can play without looking. Quick catches in a row build a combo: every third one is worth two.
//
// cfg = {
//   engine: 'pop', title, kicker, how, unit,
//   spots: [{ u, v }, …]               6–10 real places on the painting (0..1 from the top-left)
//   good: [{ e: '📷', name: 'a memory' }, …]   bad: [{ e: '🌫️', name: 'fog' }, …] (optional), badChance: 0.2
//   goal: 18, time: 60 (seconds), window: [2.4, 1.2] (seconds a pop stays, start → end), every: [1.2, 0.6] (gap)
//   maxOn: [1, 2] (how many can show at once, start → end), size: 0.11 (pop size, painting widths)
//   sound: 'photo' | 'shimmer' | 'snap' | 'hero', scale: 'penta' (K.SCALES name), color: '#ffd25a',
//   badHit: 'Not that one', badLine: 'Leave the fog alone.', comboWord: 'Combo',
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

export function popGame(cfg) {
  let G = null;
  const unit = cfg.unit || 'found';
  const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
  const pick = a => a[(Math.random() * a.length) | 0];
  const panOf = p => (cfg.spots[p.spot].u - 0.5) * 1.8;
  function noteOf(p) { // higher on the painting → higher note
    const s = K.SCALES[cfg.scale || 'penta'], v = cfg.spots[p.spot].v;
    return s[Math.max(0, Math.min(s.length - 1, Math.round((1 - v) * (s.length - 1))))];
  }

  /* ── each painting's voice ── */
  function voiceAppear(p) {
    const pan = panOf(p), f = noteOf(p);
    if (p.bad) { K.tone(f / 2.5, 0.32, { type: 'sawtooth', vol: 0.05, pan, slide: -40 }); K.noise(0.2, { vol: 0.08, freq: 260, pan }); return; }
    switch (cfg.sound) {
      case 'photo':   // a camera shutter, then a warm memory chime
        K.noise(0.05, { vol: 0.22, freq: 3200, q: 2, pan }); K.noise(0.04, { vol: 0.16, freq: 2200, q: 2, pan, delay: 0.07 });
        K.tone(f, 0.5, { type: 'sine', vol: 0.11, pan, delay: 0.08 }); break;
      case 'shimmer': // a glassy twinkle with a soft halo
        K.tone(f, 0.6, { type: 'triangle', vol: 0.09, pan, attack: 0.04 }); K.tone(f * 1.006, 0.6, { type: 'sine', vol: 0.06, pan, attack: 0.04 });
        K.tone(f * 2, 0.35, { vol: 0.04, pan, delay: 0.09 }); break;
      case 'snap':    // a hanger click, then a bright runway pip
        K.noise(0.03, { vol: 0.25, freq: 4200, q: 4, pan }); K.tone(f, 0.16, { type: 'square', vol: 0.06, pan, delay: 0.03 });
        K.tone(f * 1.5, 0.14, { type: 'square', vol: 0.05, pan, delay: 0.12 }); break;
      case 'hero':    // a call for help: a rising signal
        K.tone(f * 0.75, 0.22, { type: 'sawtooth', vol: 0.05, pan, slide: f * 0.5 }); K.tone(f, 0.25, { type: 'triangle', vol: 0.09, pan, delay: 0.12 }); break;
      default: K.tone(f, 0.3, { type: 'triangle', vol: 0.1, pan });
    }
  }
  function voiceTick(p) { K.tone(p.bad ? noteOf(p) / 2.5 : noteOf(p), 0.06, { type: p.bad ? 'sawtooth' : 'sine', vol: p.bad ? 0.03 : 0.06, pan: panOf(p) }); }
  function voiceCatch(p, combo) {
    const pan = panOf(p);
    K.sfx.good(pan, G.score);
    if (cfg.sound === 'hero') K.noise(0.3, { vol: 0.14, freq: 500, sweepTo: 2600, pan, q: 0.8 });
    if (cfg.sound === 'shimmer') K.tone(noteOf(p) * 1.5, 0.5, { type: 'sine', vol: 0.05, pan, delay: 0.1 });
    if (combo) K.chord([523.3, 659.3, 784].map(x => x * (1 + Math.min(4, G.combo - 3) * 0.06)), 0.5, { vol: 0.05, pan });
  }

  /* ── HUD: count, a time bar, misses ── */
  function hud() {
    const left = Math.max(0, G.timeLeft), frac = left / cfg.time;
    const bar = `<div style="height:8px;background:#3a3a3a;margin-top:8px"><div style="height:100%;width:${(frac * 100).toFixed(1)}%;background:${left < 10 ? '#fff' : '#bdbdbd'}"></div></div>`;
    G.ui.panel(cfg.kicker || cfg.title, `${G.score}<small>of ${cfg.goal} ${unit}</small>${bar}`,
      { segs: [Math.min(G.score, cfg.goal), cfg.goal], sub: `${Math.ceil(left)} s left · missed ${G.miss}` + (G.combo >= 2 ? ` · combo ${G.combo}` : ''), warn: left < 10 });
  }

  /* ── pops ── */
  function spawn() {
    const busy = new Set(G.pops.map(p => p.spot));
    let free = cfg.spots.map((_, i) => i).filter(i => !busy.has(i) && i !== G.lastSpot);
    // only places you can see right now: on the screen, clear of the score panel and the Stop button
    const seen = free.filter(i => { const c = screenOf({ x: G.S.P(cfg.spots[i].u, cfg.spots[i].v)[0], y: G.S.P(cfg.spots[i].u, cfg.spots[i].v)[1] });
      const px = c.sx * innerWidth, py = c.sy * innerHeight; return px > 24 && px < innerWidth - 24 && py > 205 && py < innerHeight - 130; });
    if (seen.length) free = seen;
    if (!free.length) return;
    const spot = pick(free); G.lastSpot = spot;
    const bad = !!(cfg.bad && cfg.bad.length && G.popped > 2 && Math.random() < (cfg.badChance ?? 0.2));
    const kind = bad ? pick(cfg.bad) : pick(cfg.good);
    const col = bad ? '#ff4a3a' : (cfg.color || '#ffd25a'), size = cfg.size || 0.11;
    const [x, y] = G.S.P(cfg.spots[spot].u, cfg.spots[spot].v);
    const s = K.sprite(K.emojiTex(kind.e, { ring: true, color: col }), size, { order: 22 });
    const ring = K.sprite(K.ringTex, size * 1.42, { color: col, opacity: 0.9, order: 21 });
    const glow = K.sprite(K.glowTex, size * 2.2, { color: col, additive: true, opacity: 0.45, order: 20 });
    for (const o of [glow, ring, s]) { o.position.set(x, y, 0.04); o.scale.setScalar(0.001); G.root.add(o); }
    const p = { spot, bad, kind, s, ring, glow, x, y, age: 0, life: G.window, size, ticked: false, botAt: 0.3 + Math.random() * 0.35 };
    G.pops.push(p); G.popped++;
    voiceAppear(p);
  }
  function removePop(p) {
    const i = G.pops.indexOf(p); if (i >= 0) G.pops.splice(i, 1);
    for (const o of [p.s, p.ring, p.glow]) { G.root.remove(o); o.material.dispose(); }
  }
  function screenOf(p) { // where a pop is on the screen (0..1 across, 0..1 down)
    const w = new THREE.Vector3(p.x, p.y, 0.04); G.root.localToWorld(w); w.project(G.camera);
    return { sx: (w.x + 1) / 2, sy: (1 - w.y) / 2 };
  }
  function thirdOf(p) { const sx = screenOf(p).sx; return sx < 0.36 ? -1 : sx > 0.64 ? 1 : 0; }

  function caught(p) {
    const quick = p.age < p.life * 0.45;
    G.combo = quick ? G.combo + 1 : 1; G.bestCombo = Math.max(G.bestCombo, G.combo);
    const combo = G.combo >= 3 && G.combo % 3 === 0, gain = combo ? 2 : 1;
    G.score += gain; G.caught++;
    voiceCatch(p, combo); G.buzz(combo ? [20, 30, 20] : 25);
    G.fx.add(p.x, p.y, cfg.color || '#ffd25a', combo ? 26 : 16);
    const sc = screenOf(p); G.ui.pop(combo ? `+2 ×${G.combo}` : (G.combo >= 2 ? `+1 ×${G.combo}` : '+1'), Math.max(110, Math.min(innerWidth - 110, sc.sx * innerWidth)), Math.max(240, sc.sy * innerHeight + 30));
    if (combo && G.combo === 3) { G.ui.alert((cfg.comboWord || 'Combo') + '!', 'Every third quick catch in a row is worth two.', 1, 'blue'); G.say((cfg.comboWord || 'Combo') + '!', false); }
    else if (G.score >= G.nextSay && G.score < cfg.goal) { G.nextSay += 5; G.say(G.score + ' ' + unit, false); }
    removePop(p); hud();
    if (G.score >= cfg.goal) end(true);
  }
  function tappedBad(p) {
    G.miss++; G.combo = 0; G.bads++; G.timeLeft -= 2;
    K.sfx.bad(panOf(p)); G.buzz([80, 40, 120]);
    G.ui.alert(cfg.badHit || 'Not that one', cfg.badLine || 'Leave the bad ones alone. Minus 2 seconds.', 1.2);
    G.say(cfg.badHit || 'Not that one', false);
    G.fx.add(p.x, p.y, '#ff4a3a', 10, 0.2);
    removePop(p); hud();
  }
  function expire(p) {
    removePop(p);
    if (p.bad) { K.tone(660, 0.08, { vol: 0.035, pan: panOf(p) }); return; }
    G.miss++; G.combo = 0;
    K.tone(220, 0.28, { type: 'triangle', vol: 0.07, pan: panOf(p), slide: -60 }); hud();
  }
  // a tap at a board point (or null), from screen third `third`
  function tap(b, third) {
    if (!G || !G.playing) return;
    K.audio();
    let best = null, bd = Infinity;
    if (b) for (const p of G.pops) { const d = Math.hypot(p.x - b.x, p.y - b.y); if (d < bd) { bd = d; best = p; } }
    if (best && bd < best.size * 0.95) { best.bad ? tappedBad(best) : caught(best); return; }
    // play by ear: the good thing showing in the same third of the screen
    const there = G.pops.filter(p => !p.bad && thirdOf(p) === third).sort((a, c) => (c.age / c.life) - (a.age / a.life))[0];
    if (there) { caught(there); return; }
    K.tone(300, 0.05, { type: 'triangle', vol: 0.04, pan: third * 0.8 }); // nothing there
  }

  function end(won) {
    for (const p of G.pops.slice()) removePop(p);
    const secs = Math.round(G.played);
    const r = K.best(cfg.id + ':pop', won ? secs : -G.score, won ? 'lower' : 'higher');
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: won ? [{ k: 'Time', v: secs + 's' }, { k: 'Best combo', v: G.bestCombo }, { k: 'Missed', v: G.miss }]
                 : [{ k: unit, v: G.score + '/' + cfg.goal }, { k: 'Best combo', v: G.bestCombo }] });
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { pops: [], score: 0, miss: 0, combo: 0, bestCombo: 0, caught: 0, bads: 0, popped: 0, lastSpot: -1,
        timeLeft: cfg.time, played: 0, spawnT: 0.5, window: cfg.window[0], nextSay: 5, said10: false, _hudTick: -1 });
      hud();
      K.intro(G, { title: cfg.title, how: cfg.how,
        say: cfg.title + '. ' + cfg.how + ' Each one sounds from where it is. Tap that side of the screen to catch it.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (!G.playing) return;
      G.played += dt; G.timeLeft -= dt;
      const prog = Math.max(G.score / cfg.goal, G.played / cfg.time);
      G.window = lerp(cfg.window[0], cfg.window[1], prog);
      const mo = cfg.maxOn || [1, 2], maxOn = Math.round(lerp(mo[0], mo[1], prog));
      G.spawnT -= dt;
      if (G.spawnT <= 0 && G.pops.length < maxOn) { spawn(); G.spawnT = lerp(cfg.every[0], cfg.every[1], prog) * (0.8 + Math.random() * 0.4); }
      for (const p of G.pops.slice()) {
        p.age += dt; const k = p.age / p.life;
        const grow = Math.min(1, p.age / 0.16), bounce = grow < 1 ? grow * (1 + Math.sin(grow * Math.PI) * 0.25) : 1;
        const fade = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1;
        p.s.scale.setScalar(p.size * bounce * (0.92 + Math.sin(G.t * 9 + p.spot) * 0.04));
        p.ring.scale.setScalar(p.size * (1.42 - 0.36 * k) * grow); p.ring.material.opacity = 0.9 * fade;
        p.glow.scale.setScalar(p.size * 2.2 * grow); p.glow.material.opacity = 0.45 * fade;
        p.s.material.opacity = Math.max(0.2, fade);
        if (!p.ticked && k > 0.6) { p.ticked = true; voiceTick(p); }
        if (k >= 1) expire(p);
      }
      // the robot: taps good ones (where they are on screen) after a human-ish pause, lets bad ones fade
      if (G.bot) {
        const p = G.pops.find(q => !q.bad && q.age > Math.min(q.botAt, q.life * 0.45));
        if (p) { const sc = screenOf(p), r = G.renderer.domElement.getBoundingClientRect();
          this.pointer('down', { clientX: r.left + sc.sx * r.width, clientY: r.top + sc.sy * r.height }); }
      }
      if (!G.playing) return;
      if (!G.said10 && G.timeLeft <= 10) { G.said10 = true; G.say('Ten seconds', false); G.buzz([40, 60, 40]); }
      const tick = (G.t * 4) | 0; if (tick !== G._hudTick) { G._hudTick = tick; hud(); }
      if (G.timeLeft <= 0) end(false);
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      tap(G.S.toBoard(ev, G.root), G.S.screenThird(ev));
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'pop', playing: G.playing, over: G.over, score: G.score, goal: cfg.goal, caught: G.caught,
      miss: G.miss, bads: G.bads, combo: G.combo, bestCombo: G.bestCombo, timeLeft: +G.timeLeft.toFixed(1), active: G.pops.length, popped: G.popped }; },
    stop() { K.cleanup(G); G = null; },
  };
}
