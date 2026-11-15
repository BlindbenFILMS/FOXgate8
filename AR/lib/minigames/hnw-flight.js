// HOW, NOT WHO (Doreen Holmes): FIRST FLIGHT.
// The caterpillar found a new way, and now she can fly. Doreen's own quilled butterfly lifts out of the painting
// (cut out: media/games/hnw/butterfly.png; a soft patch of wall covers her empty spot) and flaps down to the bottom
// of the painting. Eight paper-coil flowers (hnw-things.js) drift down in three lanes. Move her LEFT, MIDDLE or RIGHT
// (buttons, or tap that side of the screen) to drink from each one. Every flower hums its own note from its side,
// louder as it comes close; when she drinks, it blooms open and her little tune grows by that note. A grey rain cloud
// sometimes drifts down too: fly around it (a bump only makes her wobble; nothing is lost). A flower that drifts past
// comes back later. After all 8 she flies home and lands back in her place in the painting.
import * as THREE from 'three';
import * as K from './kit.js';
import { FLOWERS, drawFlower, drawCloud, drawSparkle } from './hnw-things.js';

const ART = new URL('../../media/games/hnw/', import.meta.url).href;
const SPOT = { u: 0.799, v: 0.522, w: 0.2565, h: 0.2318 };   // where the butterfly sits in the painting (cut-out box)
const WING = 0.78;                                         // the left 78% of the cut-out is wings; the right part is her body
const LANES = [0.2, 0.5, 0.8], TOP = 0.05, LINE = 0.8;     // lanes across; where flowers appear; where she flies
const GOAL = 8, FLY = 0.8;                                  // flowers to drink; her size while flying
const LANE_NAME = ['left', 'middle', 'right'];

function tex(s, draw) {
  const c = document.createElement('canvas'); c.width = c.height = s; draw(c.getContext('2d'), s);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const TEX = {};
function texFor(key, draw) { return TEX[key] || (TEX[key] = tex(256, draw)); }
function quad(t, w, h, order = 20) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.renderOrder = order; return m;
}

export function firstFlightGame() {
  let G = null;

  /* ── sound ── */
  function hum(f, pan, vol) { K.tone(f, 0.5, { vol, pan, attack: 0.08 }); K.tone(f * 2, 0.35, { vol: vol * 0.3, pan, attack: 0.06, delay: 0.05 }); }
  function rumble(pan, vol) { K.noise(0.5, { vol, pan, freq: 160, q: 0.7, type: 'lowpass' }); }
  function music(dt) {   // a soft music-box loop under the game
    G.mT -= dt; if (G.mT > 0) return; G.mT = 2.4;
    const CH = [[261.6, 329.6, 392], [196, 293.7, 392], [220, 261.6, 329.6], [174.6, 261.6, 349.2]][G.mI++ % 4];
    CH.forEach((f, i) => K.tone(f, 2.2, { type: 'triangle', vol: 0.022, attack: 0.25, delay: i * 0.12 }));
  }
  function tune(pan) {   // her little tune: every note she has drunk so far
    G.notes.forEach((f, i) => { K.tone(f, 0.32, { type: 'triangle', vol: 0.13, pan, delay: i * 0.14 }); K.tone(f * 2, 0.2, { vol: 0.04, pan, delay: i * 0.14 + 0.02 }); });
  }

  /* ── the butterfly ── */
  function buildButterfly() {
    const W = SPOT.w, H = SPOT.h, bf = new THREE.Group(), pivot = new THREE.Group(), wings = new THREE.Group();
    // one picture, shown as two pieces (the wings and the body) so the wings can beat
    let tw = null, tb = null;
    const t = new THREE.TextureLoader().load(ART + 'butterfly.png', () => { tw.needsUpdate = true; tb.needsUpdate = true; pivot.visible = true; });
    t.colorSpace = THREE.SRGBColorSpace;
    tw = t.clone(); tw.repeat.set(WING, 1); tw.offset.set(0, 0);
    tb = t.clone(); tb.repeat.set(1 - WING, 1); tb.offset.set(WING, 0);
    const wm = quad(tw, W * WING, H, 40); wm.position.x = -W * WING / 2; wings.add(wm);
    const bm = quad(tb, W * (1 - WING), H, 41); bm.position.x = W * (1 - WING) / 2;
    pivot.add(wings, bm); pivot.position.x = W * (WING - 0.5); bf.add(pivot);
    pivot.visible = false;   // shown as soon as her picture has arrived (so three.js is never asked to draw a picture it doesn't have yet)
    bf.position.z = 0.06; G.root.add(bf);
    G.bf = bf; G.wings = wings;
    // a soft patch of the white wall that covers her empty spot once she flies
    const patch = quad(tex(128, (c, s) => { const g = c.createRadialGradient(s / 2, s / 2, s * 0.36, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(218,221,227,1)'); g.addColorStop(1, 'rgba(218,221,227,0)'); c.fillStyle = g; c.fillRect(0, 0, s, s); }), W * 1.75, H * 1.9, 15);
    patch.material.opacity = 0; const [px, py] = G.S.P(SPOT.u, SPOT.v); patch.position.set(px, py, 0.03); G.root.add(patch); G.patch = patch;
    placeAt(SPOT.u, SPOT.v, 1);
  }
  function placeAt(u, v, s) { const [x, y] = G.S.P(u, v); G.bf.position.x = x; G.bf.position.y = y; G.bf.scale.setScalar(s); G.bu = u; G.bv = v; G.bs = s; }

  /* ── flowers and clouds ── */
  function spawn() {
    const busy = new Set(G.items.filter(i => i.t < 0.45).map(i => i.lane));
    const free = [0, 1, 2].filter(l => !busy.has(l)); if (!free.length) return;
    const cloud = G.score >= 2 && G.queue.length && Math.random() < 0.28 && G.items.every(i => !i.cloud);
    let lane = free[(Math.random() * free.length) | 0];
    if (!cloud && !G.queue.length) return;
    const kind = cloud ? null : G.queue.shift();
    const size = cloud ? 0.19 : 0.23;
    const m = quad(cloud ? texFor('cloud', (c, s) => drawCloud(c, s, 0.2)) : texFor(kind.id + '-bud', (c, s) => drawFlower(c, s, kind.id, 0, 0.4)), size, size, 22);
    const [x, y] = G.S.P(LANES[lane], TOP); m.position.set(x, y, 0.05); G.root.add(m);
    const it = { m, lane, kind, cloud, t: 0, fall: G.fall, tick: 0, size, ph: Math.random() * 6 };
    G.items.push(it);
    const pan = (lane - 1) * 0.85;
    if (cloud) rumble(pan, 0.12); else hum(kind.hz, pan, 0.06);
  }
  function catchIt(it) {
    G.score++; G.notes.push(it.kind.hz);
    it.m.material.map = texFor(it.kind.id + '-open', (c, s) => drawFlower(c, s, it.kind.id, 1, 0.4));
    it.done = 'drunk'; it.d = 0;
    const pan = (it.lane - 1) * 0.85; tune(pan); G.buzz(40);
    const sp = quad(texFor('sparkle', (c, s) => drawSparkle(c, s)), 0.22, 0.22, 45); sp.position.copy(it.m.position); sp.position.z = 0.07; G.root.add(sp); G.sparks.push({ m: sp, t: 0 });
    G.fx.add(it.m.position.x, it.m.position.y, '#ffc21a', 20, 0.3);
    G.say(G.score === GOAL ? it.kind.name + '. That is all 8!' : G.score === GOAL - 1 ? it.kind.name + '. One more!' : it.kind.name + '.');
    hud();
    if (G.score >= GOAL) { G.phase = 'home'; G.homeT = 0; G.items.filter(i => !i.done).forEach(i => { i.done = 'gone'; i.d = 0; }); G.ui.buttons([]); }
  }
  function bump(it) {
    G.bumps++; G.wobble = 1; it.done = 'gone'; it.d = 0;
    K.noise(0.6, { vol: 0.25, pan: (it.lane - 1) * 0.85, freq: 3200, sweepTo: 900, q: 0.6 }); G.buzz([30, 30, 30]);
    if (!G.saidRain) { G.saidRain = true; G.ui.alert('Rain!', 'Fly around the clouds.', 1.6, 'blue'); G.say('Rain! Fly around the clouds.'); }
  }
  function missIt(it) {
    it.done = 'gone'; it.d = 0; G.queue.push(it.kind);
    if (!G.saidMiss) { G.saidMiss = true; G.say('It drifted past. It will come back.'); }
  }
  function moveTo(l) {
    if (!G || G.phase !== 'play' || l === G.lane || l < 0 || l > 2) return;
    G.lane = l; K.noise(0.25, { vol: 0.12, freq: 900, sweepTo: 2600, q: 0.8, pan: (l - 1) * 0.8 });
    K.tone([330, 440, 554][l], 0.08, { type: 'triangle', vol: 0.06, pan: (l - 1) * 0.8 });
  }
  function hud() { G.ui.panel('First flight', `${G.score}<small>of ${GOAL} flowers</small>`, { segs: [G.score, GOAL] }); }

  function botThink(dt) {
    G.botT -= dt; if (G.botT > 0) return; G.botT = 0.25;
    const live = G.items.filter(i => !i.done).sort((a, b) => b.t - a.t);
    const fl = live.find(i => !i.cloud), cl = live.find(i => i.cloud && i.t > 0.55);
    let want = fl ? fl.lane : G.lane;
    if (cl && cl.lane === want && (!fl || fl.t < cl.t)) want = [0, 1, 2].find(l => l !== cl.lane);
    moveTo(want);
  }

  return {
    title: 'First Flight',
    start(ctx) {
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', score: 0, bumps: 0, lane: 1, items: [], sparks: [], notes: [], queue: FLOWERS.slice().sort(() => Math.random() - 0.5),
        spawnT: 0.8, fall: 3.8, every: 2.4, mT: 0, mI: 0, wobble: 0, botT: 0, flap: 0, liftT: 0, homeT: 0, playT: 0 });
      buildButterfly();
      G.onGo = () => {
        G.phase = 'lift'; G.liftT = 0; hud();
        G.ui.buttons([
          { label: 'Left', icon: '◀', aria: 'Fly left', press: () => moveTo(0) },
          { label: 'Middle', icon: '●', aria: 'Fly to the middle', press: () => moveTo(1) },
          { label: 'Right', icon: '▶', aria: 'Fly right', press: () => moveTo(2) },
        ]);
        K.wind(1.2, { vol: 0.15, from: 500, to: 1800 });
      };
      K.intro(G, { title: 'First Flight', how: 'Move her LEFT, MIDDLE or RIGHT to drink from 8 flowers. Listen: each flower hums from its side.',
        say: 'First Flight. The caterpillar found a new way. Now she can fly. Move her left, middle or right to drink from 8 flowers. Listen. Each flower hums from its side, louder as it comes close.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // wings: slow and resting on the painting, quick in flight
      const flying = G.phase === 'lift' || G.phase === 'play' || G.phase === 'home';
      G.flap += dt * (flying ? 9 : 1.6);
      G.wings.scale.x = flying ? 0.3 + 0.7 * Math.abs(Math.cos(G.flap)) : 0.88 + 0.12 * Math.cos(G.flap);
      if (G.phase === 'lift') {
        G.liftT += dt / 1.6; const e = Math.min(1, G.liftT), s = e * e * (3 - 2 * e);
        placeAt(SPOT.u + (LANES[1] - SPOT.u) * s, SPOT.v + (LINE - SPOT.v) * s - Math.sin(s * Math.PI) * 0.12, 1 + (FLY - 1) * s);
        G.patch.material.opacity = Math.min(1, e * 2);
        if (e >= 1) { G.phase = 'play'; G.playStart = G.t; }
      } else if (G.phase === 'play') {
        G.playT += dt; music(dt);
        if (G.bot) botThink(dt);
        // glide to her lane, bob, wobble after rain
        const u = G.bu + (LANES[G.lane] - G.bu) * Math.min(1, dt * 9);
        G.wobble = Math.max(0, G.wobble - dt * 1.5);
        placeAt(u, LINE + Math.sin(G.t * 3) * 0.008, FLY);
        G.bf.rotation.z = Math.sin(G.t * 2.2) * 0.05 + Math.sin(G.t * 30) * 0.12 * G.wobble;
        // spawn: a little faster as she goes
        G.spawnT -= dt;
        if (G.spawnT <= 0) { spawn(); const k = G.score / GOAL; G.fall = 3.8 - 0.9 * k; G.every = 2.4 - 0.7 * k; G.spawnT = G.every; }
      } else if (G.phase === 'home') {
        G.homeT += dt / 2.4; const e = Math.min(1, G.homeT), s = e * e * (3 - 2 * e);
        if (!G.homeFrom) G.homeFrom = { u: G.bu, v: G.bv };
        placeAt(G.homeFrom.u + (SPOT.u - G.homeFrom.u) * s, G.homeFrom.v + (SPOT.v - G.homeFrom.v) * s - Math.sin(s * Math.PI) * 0.18, FLY + (1 - FLY) * s);
        G.bf.rotation.z *= 0.9; G.patch.material.opacity = 1 - s;
        if (e >= 1) {
          G.phase = 'done'; G.wings.scale.x = 1; G.bf.rotation.z = 0; tune(0.4);
          const secs = Math.round(G.playT), time = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
          setTimeout(() => G && K.finale(G, { won: true, kicker: 'Same me, new way', title: 'She can fly!',
            cells: [{ k: 'Flowers', v: String(GOAL) }, { k: 'Time', v: time }], line: G.work && G.work.quote,
            say: 'She flew home. The same butterfly, with a new way to live. ' + ((G.work && G.work.quote) || '') }), 700);
        }
      }
      // items
      for (let i = G.items.length - 1; i >= 0; i--) {
        const it = G.items[i];
        if (it.done) {
          it.d += dt;
          if (it.done === 'drunk') { it.m.position.y += dt * 0.25; it.m.scale.setScalar(1 + it.d * 0.6); }
          it.m.material.opacity = Math.max(0, 1 - it.d / (it.done === 'drunk' ? 0.9 : 0.5));
          if (it.d > 1) { G.root.remove(it.m); G.items.splice(i, 1); }
          continue;
        }
        if (G.phase !== 'play') continue;
        it.t += dt / it.fall;
        const [x, y] = G.S.P(LANES[it.lane] + Math.sin(G.t * 1.6 + it.ph) * 0.012, TOP + (LINE - TOP) * it.t);
        it.m.position.x = x; it.m.position.y = y; it.m.rotation.z = Math.sin(G.t * 2 + it.ph) * 0.12;
        // its sound, from its lane, louder and quicker as it nears
        it.tick -= dt;
        if (it.tick <= 0) { const pan = (it.lane - 1) * 0.85, v = 0.03 + it.t * 0.12; if (it.cloud) rumble(pan, v); else hum(it.kind.hz, pan, v); it.tick = 0.75 - it.t * 0.45; }
        if (it.t >= 0.97) {
          if (it.lane === G.lane) it.cloud ? bump(it) : catchIt(it);
          else if (it.t >= 1.08) it.cloud ? (it.done = 'gone', it.d = 0) : missIt(it);
        }
      }
      for (let i = G.sparks.length - 1; i >= 0; i--) { const s = G.sparks[i]; s.t += dt; s.m.scale.setScalar(0.6 + s.t * 1.8); s.m.rotation.z += dt * 2; s.m.material.opacity = Math.max(0, 1 - s.t / 0.7); if (s.t > 0.7) { G.root.remove(s.m); G.sparks.splice(i, 1); } }
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down' || G.phase !== 'play') return;
      moveTo(G.S.screenThird(ev) + 1);
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { phase: G.phase, score: G.score, bumps: G.bumps, lane: G.lane, items: G.items.length, t: +G.t.toFixed(1) }; },
    stop() { K.cleanup(G); G = null; },
  };
}
