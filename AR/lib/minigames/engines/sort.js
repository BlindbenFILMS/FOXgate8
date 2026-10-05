// SORT: a card with a short statement appears over the painting. Swipe it left or right (or press the two big
// buttons named after the two sides) before its timer runs out. Right → a point and a chime. Wrong (or time up) →
// the right side and a one-line explanation are shown and spoken. Win with 70% or more right.
// By ear: every card is read aloud when it appears; tap the middle of the screen to hear it again; the left side
// sounds from the left ear, the right side from the right; the timer ticks for its last two seconds.
//
// cfg = {
//   engine: 'sort', title, kicker, how,
//   sides: [{ name:'Myth', color:'#…', note: 330 }, { name:'Fact', color:'#…', note: 660 }]   left, right
//   card: [u, v]            centre of the card on the painting;  cardW: 0.84 (share of the painting's width)
//   tags: [[u, v], [u, v]]  where the two side labels sit on the painting;  tagW: 0.34
//   ask: 'Myth or fact?'    small line on top of each card;  accent: colour of the card's bottom bar
//   cards: [{ t:'statement', a: 0|1 (0 = left side, 1 = right side), why:'one accurate line' }, …]
//   count: 11 (cards per game, drawn at random), time: 4.5 (s per card) + perChar: 0.05 (s per letter, for listening)
//   color: '#ffd25a' (sparkle), voice: 'warm' | 'glass' | 'fire' (sound flavour)
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

// a statement card: black block, small red question, big readable words, a coloured bar along the bottom
function cardTex(text, ask, accent) {
  return K.canvasTex(1024, 600, (g, W, H) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H - 22); g.fillStyle = accent || K.RED; g.fillRect(0, H - 22, W, 22);
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 25);
    g.fillStyle = K.RED; g.font = '900 40px Archivo, "Arial Black", Arial, sans-serif'; g.textBaseline = 'top';
    g.fillText(String(ask || '').toUpperCase(), 48, 42);
    const face = fs => `700 ${fs}px "Atkinson Hyperlegible", Arial, sans-serif`;
    const wrap = (fs) => {
      g.font = face(fs); const words = text.split(/\s+/), lines = []; let cur = '';
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > W - 96 && cur) { lines.push(cur); cur = w; } else cur = t; }
      if (cur) lines.push(cur); return lines;
    };
    let fs = 84, lines = wrap(fs);
    while ((lines.length * fs * 1.16 > H - 170) && fs > 40) { fs -= 4; lines = wrap(fs); }
    g.fillStyle = '#fff'; g.font = face(fs); g.textBaseline = 'middle';
    const top = 110 + ((H - 150) - lines.length * fs * 1.16) / 2;
    lines.forEach((l, i) => g.fillText(l, 48, top + (i + 0.5) * fs * 1.16));
  });
}

export function sortGame(cfg) {
  let G = null, keyH = null;
  const sides = cfg.sides, N = Math.min(cfg.count || 11, cfg.cards.length), need = Math.ceil(N * 0.7);
  const PAN = [-0.85, 0.85];
  const name = s => sides[s].name;

  function hud() {
    const left = N - need - G.wrong, arrows = `← ${name(0)}  ·  ${name(1)} →`;
    G.ui.panel(cfg.kicker || cfg.title, `${G.score}<small>right of ${N}</small>`,
      { segs: [G.i, N], warn: left === 0,
        sub: left > 0 ? `${arrows}   You can miss ${left} more.` : left === 0 ? `${arrows}   No more misses!` : arrows });
  }
  // the sound of each side, from its own ear
  function sideSound(s, vol = 0.08) {
    const f = sides[s].note || (s ? 660 : 330), pan = PAN[s];
    if (cfg.voice === 'fire' && s === 1) { K.noise(0.3, { vol: 0.16, freq: 1400, q: 0.6, pan }); K.tone(f, 0.18, { type: 'sawtooth', vol: vol * 0.6, pan }); }
    else if (cfg.voice === 'fire') { K.noise(0.4, { vol: 0.1, freq: 500, sweepTo: 300, q: 0.8, pan }); K.tone(f, 0.3, { vol, pan }); }
    else if (cfg.voice === 'glass') { K.tone(f, 0.4, { vol, pan }); K.tone(f * 2.01, 0.3, { vol: vol * 0.5, pan, delay: 0.02 }); }
    else K.tone(f, 0.22, { type: 'triangle', vol, pan });
  }
  function newCard() {
    const c = G.deck[G.i];
    const [x, y] = G.S.P(cfg.card[0], cfg.card[1]), w = cfg.cardW || 0.84, h = w * 600 / 1024;
    const m = K.plane(cardTex(c.t, cfg.ask || `${name(0)} or ${name(1)}?`, cfg.accent), w, h, { order: 20, opacity: 0 });
    m.position.set(x, y, 0.05); m.scale.setScalar(0.7); G.root.add(m);
    G.timeBar.visible = true; G.timeBar.position.set(x - w / 2, y - h / 2 - 0.014, 0.055); G.timeBar.scale.x = w;
    const max = (cfg.time ?? 4.5) + c.t.length * (cfg.perChar ?? 0.05);
    G.cur = { c, m, x, y, w, h, state: 'ask', t: 0, left: max, max, dx: 0, tick: 0, vx: 0, vy: 0 };
    K.noise(0.18, { vol: 0.12, freq: 2200, q: 0.7 }); G.buzz(15);
    G.say(c.t);
    G.botT = 2 + Math.random() * 0.5;
    hud();
  }
  // the player's choice (s = 0 left, 1 right; null = time ran out)
  function choose(s) {
    const cur = G && G.cur; if (!G.playing || !cur || cur.state !== 'ask') return;
    const c = cur.c, ok = s === c.a, pan = s === null ? 0 : PAN[s];
    cur.state = 'fly'; G.timeBar.visible = false;
    if (s === null) { cur.vx = 0; cur.vy = -0.7; } else { cur.vx = (s ? 1 : -1) * 2.2; cur.vy = 0.15; K.sfx.whoosh(pan); }
    const tag = G.tags[c.a];
    G.i++;
    if (ok) {
      G.score++; G.streak++;
      K.sfx.good(pan, G.score + 2); sideSound(s, 0.06); G.buzz(25);
      G.fx.add(tag.position.x, tag.position.y, cfg.color || '#ffd25a', 22);
      tag.userData.pulse = 1;
      G.ui.alert(G.streak >= 3 ? `Right! ${G.streak} in a row` : 'Right! ' + name(c.a), c.why || '', 1.3, 'blue');
      G.wait = 1.3;
    } else {
      G.wrong++; G.streak = 0;
      K.sfx.bad(pan); G.buzz([80, 40, 120]); tag.userData.pulse = 1;
      const head = (s === null ? 'Time’s up. ' : '') + 'It’s ' + name(c.a);
      G.ui.alert(head, c.why || '', G.bot ? 2 : 3.8, 'black');
      G.say(head + '. ' + (c.why || ''));
      G.wait = G.bot ? 2 : 3.8;
    }
    hud();
  }
  function dropCard() {
    if (!G.cur) return;
    G.root.remove(G.cur.m); G.cur.m.material.map.dispose(); G.cur.m.material.dispose(); G.cur.m.geometry.dispose(); G.cur = null;
  }
  function next() { dropCard(); if (G.i >= N) end(); else newCard(); }
  function end() {
    const won = G.score >= need;
    dropCard(); G.timeBar.visible = false; for (const t of G.tags) t.visible = false;
    const r = K.best(cfg.id + ':sort', G.score, 'higher');
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: 'Right', v: G.score + '/' + N }, { k: 'Score', v: Math.round(100 * G.score / N) + '%' }],
      say: `${W.title}. ${G.score} right out of ${N}. ${W.line || ''}` });
  }
  function repeat() { if (G.cur && G.cur.state === 'ask') G.say(G.cur.c.t); }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.score = 0; G.wrong = 0; G.streak = 0; G.i = 0; G.cur = null; G.wait = 0;
      const pool = cfg.cards.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
      G.deck = pool.slice(0, N);
      // the two side labels on the painting, each with an arrow pointing to its edge
      G.tags = sides.map((sd, s) => {
        const label = s ? `${sd.name} ▶` : `◀ ${sd.name}`;
        const tw = cfg.tagW || 0.34, m = K.plane(K.wordTex(label, { bg: sd.color || '#000', bar: sd.bar || (s ? '#fff' : K.RED) }), tw, tw / 4, { order: 15 });
        const [x, y] = G.S.P(cfg.tags[s][0], cfg.tags[s][1]); m.position.set(x, y, 0.03); m.userData = { pulse: 0, y }; G.root.add(m); return m;
      });
      G.timeBar = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.016).translate(0.5, 0, 0), new THREE.MeshBasicMaterial({ color: K.RED, transparent: true, depthWrite: false }));
      G.timeBar.renderOrder = 21; G.timeBar.visible = false; G.root.add(G.timeBar);
      const btns = G.ui.buttons([
        { label: name(0), icon: '◀', kind: 'black', aria: `${name(0)}. Same as swiping left.`, press: () => choose(0) },
        { label: name(1), icon: '▶', kind: 'red', aria: `${name(1)}. Same as swiping right.`, press: () => choose(1) },
      ]);
      // put the left arrow before the word on the left button
      if (btns[0] && btns[0].lastChild) btns[0].insertBefore(btns[0].lastChild, btns[0].firstChild);
      keyH = (ev) => { if (!G || !G.playing) return; if (ev.key === 'ArrowLeft') choose(0); else if (ev.key === 'ArrowRight') choose(1); else if (ev.key === 'r') repeat(); };
      addEventListener('keydown', keyH);
      hud();
      G.onGo = () => { G.wait = 0.4; };
      K.intro(G, { title: cfg.title, how: cfg.how,
        say: `${cfg.title}. ${cfg.how} Swipe left, or tap the left of the screen, for ${name(0)}. Swipe right, or tap the right, for ${name(1)}. Tap the middle to hear a card again.` });
      if (!G.bot) G._introT = 7; // time to hear the how-to before 3, 2, 1
      sideSound(0, 0.05); setTimeout(() => G && sideSound(1, 0.05), 350);
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      for (const t of G.tags || []) {
        const p = t.userData.pulse; t.userData.pulse = Math.max(0, p - dt * 2.5);
        t.scale.setScalar(1 + 0.18 * Math.sin(Math.min(1, p) * Math.PI));
        t.position.y = t.userData.y + Math.sin(G.t * 2 + t.position.x * 6) * 0.004;
      }
      if (!G.playing) return;
      const cur = G.cur;
      if (cur) {
        cur.t += dt;
        if (cur.state === 'ask') {
          const a = Math.min(1, cur.t * 6); cur.m.material.opacity = a; cur.m.scale.setScalar(0.7 + 0.3 * (1 - Math.pow(1 - a, 3)));
          cur.m.position.x += (cur.x + cur.dx - cur.m.position.x) * Math.min(1, dt * 18); cur.m.rotation.z = -cur.dx * 0.5;
          cur.left -= dt; G.timeBar.scale.x = Math.max(0.0001, cur.w * cur.left / cur.max);
          G.timeBar.material.color.set(cur.left < 2 ? '#ffffff' : K.RED);
          if (cur.left < 2) { cur.tick -= dt; if (cur.tick <= 0) { K.tone(cur.left < 1 ? 1180 : 880, 0.05, { type: 'square', vol: 0.05 }); cur.tick = cur.left < 1 ? 0.25 : 0.5; } }
          if (cur.left <= 0) choose(null);
          else if (G.bot) { G.botT -= dt; if (G.botT <= 0) choose(cur.c.a); }   // the robot knows its facts
        } else {
          cur.m.position.x += cur.vx * dt; cur.m.position.y += cur.vy * dt; cur.m.rotation.z -= cur.vx * dt * 0.4;
          cur.m.material.opacity = Math.max(0, cur.m.material.opacity - dt * 3);
        }
      }
      if (G.wait > 0) { G.wait -= dt; if (G.wait <= 0) next(); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      const cur = G.cur;
      if (kind === 'down') { G.down = { x: ev.clientX }; return; }
      if (!G.down) return;
      const dx = ev.clientX - G.down.x;
      if (kind === 'move') { if (cur && cur.state === 'ask') cur.dx = Math.max(-0.25, Math.min(0.25, dx / innerWidth * 1.1)); return; }
      if (kind !== 'up') return;
      G.down = null; if (cur) cur.dx = 0;
      if (Math.abs(dx) > 45) choose(dx < 0 ? 0 : 1);
      else { const th = G.S.screenThird(ev); if (th === 0) repeat(); else choose(th < 0 ? 0 : 1); }
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'sort', playing: G.playing, over: G.over, card: G.i, cards: N, score: G.score, wrong: G.wrong, need }; },
    stop() { if (keyH) removeEventListener('keydown', keyH); keyH = null; K.cleanup(G); G = null; },
  };
}
