// RUNNER: a forward journey in perspective over the painting. The road runs from a vanishing point down to the near
// edge; things come out of the distance in three lanes and grow as they approach. Switch lanes (swipe, tap the left /
// right third of the screen, or ◀ ▶) to dodge obstacles and collect pickups. Three hits ends the run; reach the
// distance goal to win. Speed rises gently.
// By ear: each thing sounds from its lane (stereo pan) and ticks louder and faster as it nears; an obstacle in YOUR lane
// ticks harder and gives a small buzz; pickups chime; a lane change clicks from its side; a hit thumps and buzzes;
// a soft travel beat (paws, pedals, engine) speeds up with you. Tap the middle of the screen to hear which lane you're in.
//
// cfg = {
//   engine: 'runner', title, kicker, how,
//   road: { vp: [u, v], near: [u, v, width], depth: 6, color: '#000', opacity: 0.22, line: '#fff' }
//        vp = vanishing point; near = centre and width of the road at the player's line; depth = perspective strength
//        (2 = gentle, 8 = strong); color/opacity = a soft road band drawn under the lanes (opacity 0 = none)
//   player: '🐕‍🦺', size: 0.12 (near size of things)
//   obstacles: [{ e, name }], pickups: [{ e, name }], pickName: 'treats' (plural, for speech/HUD)
//   goal: 5, unit: 'blocks' (distance goal shown in the HUD), time: 55 (seconds of start-speed travel to the goal)
//   travel: [2.8, 1.8] (seconds from horizon to player, start → end), every: [1.3, 0.8] (seconds between rows)
//   wave: 0 (0..0.3: the speed swells up and down, like a roller coaster)
//   double: [0.1, 0.45] (chance a row has two obstacles, start → end), pickChance: 0.55, healEvery: 6, hits: 3
//   sound: { obs: [freq, type], pick: [freq, type], beat: [freq, type, vol] }
//   color: '#ffd25a' (pickup ring / sparkle), hitColor: '#ff5a4a', hitTitle, healTitle, healSay,
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

export function runnerGame(cfg) {
  let G = null;
  const R = Object.assign({ depth: 6, color: '#000', opacity: 0.22, line: '#ffffff' }, cfg.road);
  const SND = Object.assign({ obs: [196, 'square'], pick: [1046, 'sine'], beat: [110, 'triangle', 0.05] }, cfg.sound);
  const HITS = cfg.hits || 3, SIZE = cfg.size || 0.1, LANES = ['left', 'middle', 'right'];
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (d) => cfg.goal >= 20 ? String(Math.floor(d)) : d.toFixed(1);

  // perspective: s runs 0 (horizon) → 1 (player's line); f is how far along the screen path it is (0..1+)
  function persp(s) { const D = R.depth, d = Math.max(0.35, D - (D - 1) * s); return (1 / d - 1 / D) / (1 - 1 / D); }
  // board position of lane offset o (−1, 0, 1; fractions allowed) at depth s
  function at(o, s) {
    const f = persp(s), [vu, vv] = R.vp, [nu, nv, w] = R.near;
    const u = lerp(vu, nu, f) + o * (w / 3) * f, v = lerp(vv, nv, f);
    const [x, y] = G.S.P(u, v); return { x, y, f };
  }
  const panOf = (lane) => (lane - 1) * 0.85;

  function hud() {
    G.ui.panel(cfg.kicker || cfg.title, `${fmt(G.p * cfg.goal)}<small>of ${cfg.goal} ${cfg.unit || 'miles'}</small>`,
      { segs: [Math.floor(G.p * 10 + 1e-6), 10], sub: `Hits ${G.hits} of ${HITS}  ·  ${G.picks} ${cfg.pickName || 'collected'}`, warn: G.hits >= HITS - 1 });
  }

  // ── moving the player ──
  function moveTo(lane) {
    if (!G || !G.playing) return false;
    lane = Math.max(0, Math.min(2, lane));
    if (lane === G.lane) { K.tone(140, 0.07, { type: 'square', vol: 0.05, pan: panOf(lane) * 1.1 }); G.buzz(8); return false; }  // bump the edge
    G.lane = lane;
    K.tone(lane === 0 ? 392 : lane === 1 ? 523 : 659, 0.05, { type: 'triangle', vol: 0.09, pan: panOf(lane) });
    K.noise(0.05, { vol: 0.12, freq: 2600, pan: panOf(lane) });
    G.buzz(10);
    return true;
  }
  const step = (dir) => moveTo(G.lane + dir);

  // ── things on the road ──
  function makeItem(lane, bad) {
    const list = bad ? cfg.obstacles : cfg.pickups, kind = list[(Math.random() * list.length) | 0];
    const s = K.sprite(K.emojiTex(kind.e, { ring: true, color: bad ? (cfg.hitColor || '#ff5a4a') : (cfg.color || '#ffd25a') }), SIZE, { order: 12 });
    G.root.add(s);
    const it = { lane, bad, kind, s, z: 0, tick: 0, warned: false };
    place(it); G.items.push(it); return it;
  }
  function place(it) {
    const p = at(it.lane - 1, it.z);
    it.s.position.set(p.x, p.y, 0.03 + p.f * 0.02);
    it.s.scale.setScalar(SIZE * Math.max(0.16, p.f));
    it.s.material.opacity = Math.min(1, it.z * 6);
    it.s.renderOrder = 12 + Math.floor(it.z * 8);
  }
  function spawnRow() {
    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    const two = !G.lastTwo && Math.random() < lerp(cfg.double[0], cfg.double[1], G.p);   // never two double rows running
    const obsLanes = lanes.slice(0, two ? 2 : 1), free = lanes.slice(two ? 2 : 1);
    for (const l of obsLanes) makeItem(l, true);
    G.lastTwo = two;
    if (Math.random() < (cfg.pickChance ?? 0.55)) makeItem(free[(Math.random() * free.length) | 0], false);
    for (const l of obsLanes) K.tone(SND.obs[0] * 0.75, 0.12, { type: 'sine', vol: 0.035, pan: panOf(l) });   // a soft far-off call
  }
  function reach(it) {
    const pan = panOf(it.lane), p = at(it.lane - 1, 1);
    if (it.lane === G.lane) {
      if (it.bad) {
        G.hits++;
        K.noise(0.3, { vol: 0.5, freq: 120, q: 0.7, type: 'lowpass', pan });          // thump
        K.tone(90, 0.35, { type: 'sawtooth', vol: 0.1, pan, slide: -40 });           // buzz
        K.tone(70, 0.4, { type: 'square', vol: 0.05, pan, delay: 0.05 });
        G.buzz([90, 40, 140]); G.fx.add(p.x, p.y, cfg.hitColor || '#ff5a4a', 22, 0.45);
        G.flash = 0.5;
        const left = HITS - G.hits;
        if (left > 0) {
          G.ui.alert(cfg.hitTitle || ('Oof, ' + it.kind.name + '!'), `${left} ${left === 1 ? 'hit' : 'hits'} left. Change lanes to dodge.`, 1.2);
          G.say(it.kind.name + '! ' + left + (left === 1 ? ' hit left.' : ' hits left.'), false);
        }
      } else {
        G.picks++;
        K.sfx.good(pan, G.picks + 2);
        K.tone(SND.pick[0] * 1.5, 0.18, { type: 'sine', vol: 0.05, pan, delay: 0.06 });
        G.fx.add(p.x, p.y, cfg.color || '#ffd25a'); G.buzz(18);
        if (G.picks % (cfg.healEvery || 6) === 0 && G.hits > 0) {
          G.hits--; K.chord([523.3, 659.3, 784], 0.6, { vol: 0.06 });
          G.ui.alert(cfg.healTitle || 'Feeling stronger', `Every ${cfg.healEvery || 6} ${cfg.pickName || 'pickups'} heal a hit.`, 1.4, 'blue');
          G.say(cfg.healSay || 'One hit healed.', false);
        } else if (G.picks % 5 === 0) G.say(G.picks + ' ' + (cfg.pickName || 'collected'), false);
      }
    } else if (it.bad) { G.dodged++; K.noise(0.18, { vol: 0.12, freq: 900, sweepTo: 300, pan }); }   // whoosh past
    G.root.remove(it.s); it.s.material.dispose();
    hud();
    if (G.hits >= HITS) end(false);
  }

  // ── road band and moving lane marks ──
  function buildRoad() {
    const g = new THREE.Group(); G.road = g; G.root.add(g);
    if (R.opacity > 0) {
      const N = 24, pos = [], uv = [], idx = [], s0 = 0.02, s1 = 1.1;
      for (let i = 0; i <= N; i++) {
        const s = s0 + (s1 - s0) * (i / N), a = at(-1.6, s), b = at(1.6, s);
        pos.push(a.x, a.y, 0.021, b.x, b.y, 0.021); uv.push(0, i / N, 1, i / N);
        if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      // canvas top = near end (uv v = 1), bottom = horizon (v = 0); soft at both ends and at the sides
      const tex = K.canvasTex(64, 256, (c, W, H) => {
        const gr = c.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.12, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = gr; c.fillRect(0, 0, W, H);
        const sx = c.createLinearGradient(0, 0, W, 0); sx.addColorStop(0, 'rgba(0,0,0,1)'); sx.addColorStop(0.14, 'rgba(0,0,0,0)'); sx.addColorStop(0.86, 'rgba(0,0,0,0)'); sx.addColorStop(1, 'rgba(0,0,0,1)');
        c.globalCompositeOperation = 'destination-out'; c.fillStyle = sx; c.fillRect(0, 0, W, H);
      });
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(R.color), transparent: true, opacity: R.opacity, depthWrite: false, side: THREE.DoubleSide }));
      m.renderOrder = 10; g.add(m);
    }
    G.marks = [];
    const NM = 9;
    for (const o of [-1.5, -0.5, 0.5, 1.5]) for (let i = 0; i < NM; i++) {
      const sp = K.sprite(K.dotTex, 0.02, { color: R.line, opacity: 0.7, order: 11 }); g.add(sp);
      G.marks.push({ sp, o, z: i / NM * 1.1, edge: Math.abs(o) > 1 });
    }
    updateMarks(0);
  }
  function updateMarks(dz) {
    for (const m of G.marks) {
      m.z += dz; if (m.z > 1.1) m.z -= 1.1;
      const p = at(m.o, m.z);
      m.sp.position.set(p.x, p.y, 0.025);
      const sz = (m.edge ? 0.024 : 0.036) * Math.max(0.2, p.f);
      m.sp.scale.set(sz, sz * (m.edge ? 1 : 2.2), 1);
      m.sp.material.opacity = (m.edge ? 0.5 : 0.9) * Math.min(1, m.z * 4) * (m.z > 1 ? Math.max(0, 1 - (m.z - 1) * 10) : 1);
    }
  }

  function end(won) {
    for (const it of G.items) { G.root.remove(it.s); it.s.material.dispose(); } G.items = [];
    G.player.visible = false; G.glow.visible = false; G.road.visible = false;
    const dist = Math.min(cfg.goal, G.p * cfg.goal);
    const r = won ? K.best(cfg.id + ':runner', G.picks, 'higher') : { isBest: false };
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: cfg.unit || 'Distance', v: fmt(dist) }, { k: cfg.pickName || 'Collected', v: G.picks }, { k: 'Dodged', v: G.dodged }] });
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { items: [], lane: 1, p: 0, hits: 0, picks: 0, dodged: 0, rowT: 1.0, beatT: 0, flash: 0, botT: 0, said: 0, lastTwo: false, travel: cfg.travel[0] });
      buildRoad();
      const pp = at(0, 1);
      G.glow = K.sprite(K.glowTex, SIZE * 2.4, { color: cfg.color || '#ffd25a', additive: true, opacity: 0.55, order: 24 }); G.glow.position.set(pp.x, pp.y, 0.045); G.root.add(G.glow);
      G.player = K.sprite(K.emojiTex(cfg.player, { ring: true, color: '#fff', bg: 'rgba(236,48,19,.88)' }), SIZE * 1.15, { order: 26 });
      G.player.position.set(pp.x, pp.y, 0.05); G.root.add(G.player);
      G.ui.buttons([
        { label: '◀', aria: 'Move one lane left', press: () => step(-1) },
        { label: '▶', aria: 'Move one lane right', press: () => step(1) },
      ]);
      hud();
      G.onGo = () => { K.wind(1.2, { vol: 0.12, from: 200, to: 900 }); };
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      dt = Math.min(dt, 0.1);
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over) return;
      // the player glides to its lane and bobs with the ride
      const tp = at(G.lane - 1, 1);
      G.player.position.x += (tp.x - G.player.position.x) * Math.min(1, dt * 16);
      G.player.position.y = tp.y + Math.abs(Math.sin(G.t * (G.playing ? 9 : 3))) * 0.006;
      G.glow.position.set(G.player.position.x, tp.y, 0.045);
      if (G.flash > 0) { G.flash -= dt; G.player.visible = Math.floor(G.flash * 16) % 2 === 0; }
      else G.player.visible = true;
      if (!G.playing) { updateMarks(dt * 0.08); return; }

      // speed rises gently with progress
      G.travel = lerp(cfg.travel[0], cfg.travel[1], G.p) * (1 - (cfg.wave || 0) * Math.sin(G.t * 0.9));   // wave: swells of speed
      const dz = dt / G.travel;
      updateMarks(dz);
      G.p = Math.min(1, G.p + dt * (cfg.travel[0] / G.travel) / cfg.time);
      // milestones, spoken
      const q = Math.floor(G.p * 4);
      if (q > G.said && q < 4) {
        G.said = q; const left = cfg.goal * (1 - q / 4);
        G.say((q === 2 ? 'Halfway. ' : '') + (n => n + ' ' + (n === '1' ? (cfg.unit || 'miles').replace(/s$/, '') : (cfg.unit || 'miles')))(fmt(left).replace(/\.0$/, '')) + ' to go.', false);
        K.chord([392, 523.3], 0.4, { vol: 0.05 });
      }
      // the travel beat
      G.beatT -= dt;
      if (G.beatT <= 0) { G.beatT = G.travel * 0.2; K.tone(SND.beat[0], 0.08, { type: SND.beat[1], vol: SND.beat[2] }); }
      // rows of things
      G.rowT -= dt;
      if (G.rowT <= 0 && G.p < 0.96) { spawnRow(); G.rowT = lerp(cfg.every[0], cfg.every[1], G.p) * (0.85 + Math.random() * 0.3); }
      for (const it of G.items.slice()) {
        it.z += dz; place(it);
        // by ear: ticks from its lane, louder and faster as it comes
        if (it.z > 0.25) {
          it.tick -= dt;
          if (it.tick <= 0) {
            const mine = it.lane === G.lane, f = persp(it.z);
            const vol = (it.bad ? 0.03 : 0.025) + f * (it.bad ? (mine ? 0.11 : 0.05) : 0.06);
            if (it.bad) K.tone(SND.obs[0] * (mine ? 1 : 0.8), 0.06, { type: SND.obs[1], vol, pan: panOf(it.lane) });
            else K.tone(SND.pick[0], 0.07, { type: SND.pick[1], vol, pan: panOf(it.lane) });
            it.tick = Math.max(0.08, 0.42 - it.z * 0.34);
          }
          if (it.bad && it.lane === G.lane && it.z > 0.6 && !it.warned) { it.warned = true; G.buzz(15); }
        }
        if (it.z >= 1) { G.items.splice(G.items.indexOf(it), 1); reach(it); if (G.over) return; }
      }
      if (G.p >= 1 && !G.items.some(i => i.z > 0.6)) { hud(); end(true); return; }
      if (Math.floor(G.t * 4) !== Math.floor((G.t - dt) * 4)) hud();

      // the robot: looks ahead, picks the safest lane it can reach in time (and a pickup when that is safe)
      if (G.bot) {
        G.botT -= dt; if (G.botT > 0) return;
        const ahead = G.items.filter(i => i.z > 0.3 && i.z < 1);
        const threat = (l) => Math.max(0, ...ahead.filter(i => i.bad && i.lane === l).map(i => i.z));   // 0 = clear
        const gift = (l) => ahead.some(i => !i.bad && i.lane === l && i.z > 0.5);
        const reachable = (l) => { const mid = (l + G.lane) / 2; return Math.abs(l - G.lane) < 2 || threat(mid) < 0.82; };
        const score = (l) => (threat(l) ? 10 + threat(l) * 10 : 0) - (gift(l) ? 2 : 0) + Math.abs(l - G.lane) * 0.6 + (l === 1 ? -0.3 : 0) + (reachable(l) ? 0 : 50);
        const cur = score(G.lane), want = [0, 1, 2].sort((a, b) => score(a) - score(b))[0];
        if (want !== G.lane && score(want) < cur - 0.5) { step(Math.sign(want - G.lane)); G.botT = 0.06; }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') { G.down = { x: ev.clientX, y: ev.clientY }; return; }
      if (kind !== 'up' || !G.down) return;
      const dx = ev.clientX - G.down.x, dy = ev.clientY - G.down.y; G.down = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(Math.sign(dx));
      else {
        const t = G.S.screenThird(ev);
        if (t) step(t);
        else G.say('You are in the ' + LANES[G.lane] + ' lane.', false);   // tap the middle: where am I?
      }
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'runner', playing: G.playing, over: G.over, progress: +G.p.toFixed(3), distance: +(G.p * cfg.goal).toFixed(2), goal: cfg.goal, hits: G.hits, picks: G.picks, dodged: G.dodged, lane: G.lane, items: G.items.length }; },
    stop() { K.cleanup(G); G = null; },
  };
}
