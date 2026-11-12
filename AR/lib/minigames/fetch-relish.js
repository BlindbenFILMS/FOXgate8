// RELIROO (Rusty Perez): OFF-DUTY FETCH, a "listen and throw that way" game.
// "I get to take an amazing dog with me everywhere I go." The harness is off, so Relish (the real dog from the painting,
// cut out and brought to life) can play. Each round she bounds off into the painting, LEFT into the flowers, up the path
// in the MIDDLE, or RIGHT into the meadow, turns round and barks for the ball from where she is. Throw LEFT, MIDDLE or
// RIGHT (the buttons, or tap that side of the screen). The right way: she leaps and catches it in the air, bounds back
// and drops it at Rusty's feet with a squeak. The wrong way: the ball lands in the flowers and she barks again.
// 8 catches, then zoomies round the whole painting, and Rusty's own words about Relish at the end.
// Accessible: the bark comes from her side (and sounds further away up the path); a gold ring shows each bark;
// her paws patter from the side she's running; the music adds a part with every catch.
// Art: media/games/reliroo/ relish.png (Relish cut out of the painting, harness off) and clean.jpg (the painting with her
// painted out, so she can run off). Props: relish-things.js. Voice prefix: relish-
import * as THREE from 'three';
import * as K from './kit.js';
import { ballTex, petalTex } from './relish-things.js';

const ART = new URL('../../media/games/reliroo/', import.meta.url).href;
const ARTIST = new URL('../../../3D/gallery/audio/art_27.mp3', import.meta.url).href;   // Rusty, in his own words
const GOAL = 8;
// Relish's picture: where it sits in the painting (bottom-centre of the cut-out, u, v) and its size
const HOME = [0.5474, 0.774], DW = 0.1455 * 1.2, DH = 0.1748 * 1.2;   // a little bigger than in the painting, so she reads on a phone
const MOUTH = [-0.32, 0.79];                          // her mouth, as a fraction of the picture (facing left, from the bottom-centre)
// where she runs to and barks from: LEFT in the flowers, MIDDLE up the path, RIGHT in the meadow (u, v, size)
const SPOTS = [{ u: 0.21, v: 0.745, s: 0.85, name: 'Left' }, { u: 0.42, v: 0.585, s: 0.55, name: 'Middle' }, { u: 0.83, v: 0.765, s: 0.9, name: 'Right' }];
const HAND = [0.62, 0.62];                            // Rusty's hand, where the ball is thrown from
const SAY_N = ['1 catch.', '2 catches.', '3 catches.', '4 catches.', '5 catches.', '6 catches.', '7 catches.'];
const BPM = 108, STEP = 60 / BPM / 4;
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

/* ───────────────────────── sounds and a happy, bouncy tune that grows with every catch ───────────────────────── */
function band(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const sfx = ac.createGain(); sfx.gain.value = 1;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp); sfx.connect(comp); comp.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, bus = master) => { if (!ac.createStereoPanner) return bus; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(bus); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, lp = 0, vib = 0, bus = master } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p, bus)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.002, bus = master } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p, bus)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // C – Am – F – G, a bouncy 2-step
  const CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], ROOT = [36, 33, 41, 43];
  const MEL = [[[0, 72, 2], [2, 76, 2], [4, 79, 4], [10, 76, 2], [12, 77, 2], [14, 76, 2]], [[0, 74, 4], [6, 72, 2], [8, 69, 6]],
    [[0, 69, 2], [2, 72, 2], [4, 77, 4], [10, 76, 2], [12, 74, 4]], [[0, 74, 2], [2, 79, 2], [4, 77, 2], [6, 76, 2], [8, 74, 6]]];
  const B = {
    layers: 0, bar: 0, step: 0, next: 0, timer: null, party: false,
    sched(step, t) {
      const L = B.layers, bar = B.bar, ch = CH[bar % 4], r = ROOT[bar % 4];
      if (step % 4 === 0) tone(t, midi(step % 8 === 0 ? r : r + 7), 0.28, { type: 'triangle', vol: 0.26, lp: 600 });               // bass, boom-boom
      if (step % 4 === 2) ch.forEach(m => tone(t, midi(m + 12), 0.12, { type: 'triangle', vol: 0.04, p: 0.35 }));                   // off-beat ukulele-ish chops
      if (step % 2 === 0) noise(t, 0.03, { freq: 7600, type: 'highpass', vol: step % 4 === 2 ? 0.06 : 0.03, p: -0.25 });              // shaker
      if (L >= 2 && (step === 4 || step === 12)) noise(t, 0.08, { freq: 1700, q: 1.1, vol: 0.16, p: 0.1 });                            // claps
      if (L >= 4) for (const [st, m, d] of MEL[bar % 4]) if (st === step) tone(t, midi(m), d * STEP * 0.9, { type: 'sine', vol: 0.055, att: 0.03, vib: 0.01, p: -0.15 });   // whistle
      if (L >= 6 && step % 4 === 3) tone(t, midi(ch[step % 3] + 24), 0.3, { vol: 0.035, p: 0.5 });                                     // glockenspiel sparkles
      if (B.party && step % 2 === 1) noise(t, 0.04, { freq: 9000, type: 'highpass', vol: 0.05, p: 0.6 });
    },
    tick() { const now = ac.currentTime; while (B.next < now + 0.18) { B.sched(B.step, B.next); B.next += STEP; B.step++; if (B.step === 16) { B.step = 0; B.bar++; } } },
    start() { B.next = ac.currentTime + 0.1; B.step = 0; master.gain.setTargetAtTime(0.7, ac.currentTime, 0.1); clearInterval(B.timer); B.timer = setInterval(B.tick, 25); B.tick(); },
    hold() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    stop() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); sfx.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { try { master.disconnect(); sfx.disconnect(); } catch (e) {} }, 600); },
    // Relish's bark: "woof woof", from her side; further away (quieter, duller) up the path
    bark(p, far = 0) {
      const t = ac.currentTime + 0.02, v = 0.5 - far * 0.22, lp = 2600 - far * 1300;
      for (let k = 0; k < 2; k++) { const tt = t + k * 0.24;
        tone(tt, 520, 0.14, { type: 'sawtooth', vol: v * 0.35, slide: 260, lp, p, bus: sfx }); noise(tt, 0.11, { freq: 700, q: 1.6, vol: v * 0.6, p, bus: sfx }); tone(tt, 240, 0.12, { type: 'triangle', vol: v * 0.4, slide: 170, p, bus: sfx }); }
    },
    paw(p, far = 0) { noise(ac.currentTime, 0.035, { freq: 1500 - far * 500, q: 2, vol: 0.12 - far * 0.05, p, bus: sfx }); },
    throwIt(p) { noise(ac.currentTime, 0.45, { freq: 500, q: 0.8, vol: 0.22, p, bus: sfx }); tone(ac.currentTime, 300, 0.4, { vol: 0.05, slide: 900, p, bus: sfx }); },
    catchIt(p) { const t = ac.currentTime; noise(t, 0.06, { freq: 900, q: 1.5, vol: 0.35, p, bus: sfx }); [72, 76, 79, 84].forEach((m, k) => tone(t + 0.05 + k * 0.06, midi(m), 0.4, { type: 'triangle', vol: 0.1, p, bus: sfx })); },
    plop(p) { const t = ac.currentTime; tone(t, 140, 0.25, { vol: 0.3, slide: 70, p, bus: sfx }); noise(t, 0.25, { freq: 2400, q: 0.6, vol: 0.12, p, bus: sfx }); },
    squeak(p) { const t = ac.currentTime; tone(t, 1700, 0.09, { type: 'square', vol: 0.05, slide: 2500, p, bus: sfx }); tone(t + 0.12, 1900, 0.1, { type: 'square', vol: 0.05, slide: 2700, p, bus: sfx }); },
  };
  return B;
}

export function offDutyFetchGame() {
  let G = null;
  const panU = (u) => (u - 0.5) * 1.8;
  const farOf = (s) => (0.9 - s) / 0.35;   // 0 near, 1 far up the path

  function popLow(text) { G.ui.pop(text, innerWidth / 2, innerHeight - 250); }
  function hud() {
    G.ui.panel('Off-duty fetch', `${G.caught}<small>of ${GOAL} caught</small>`, { segs: [G.caught, GOAL],
      sub: G.phase === 'party' ? 'Good girl, Reliroo!' : G.phase === 'call' ? 'Where is she? Throw that way' : 'Listen for her bark' });
  }
  function hudCss() {
    const st = document.createElement('style'); st.dataset.relish = '1';
    st.textContent = '.mgk.mgk-alert,.mgk.mgk-count{top:auto!important;bottom:calc(152px + env(safe-area-inset-bottom))!important}' +
      '.mgk.mgk-end{left:calc(18px + env(safe-area-inset-left))!important;right:calc(18px + env(safe-area-inset-right))!important}' +
      '.mgk-end .top{padding:14px 20px 16px!important}.mgk-end .cells div{padding:10px 12px 12px!important;min-width:0}' +
      '.mgk-end .cells b{font-size:12px!important;letter-spacing:.1em!important;line-height:1.25!important}.mgk-end .cells span{font-size:clamp(22px,7vw,38px)!important}' +
      '.mgk-end .line{padding:12px 20px 14px!important}.mgk-end button{padding:0 20px!important}' +
      '.mgk.mgk-alert{left:calc(18px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;padding:14px 20px 16px!important}' +
      '.mgk.mgk-panel{padding:10px 20px 12px!important}.mgk.mgk-pop{padding:6px 14px 5px!important;white-space:nowrap}';
    document.head.appendChild(st); return st;
  }
  // Relish runs (bounding) from where she is to (u, v) at size s, then calls done()
  function runTo(u, v, s, done) {
    const d = G.dog, dist = Math.hypot(u - d.u, (v - d.v) * 1.6);
    Object.assign(d, { from: [d.u, d.v, d.s], to: [u, v, s], runT: 0, runDur: 0.7 + dist * 2.2, running: true, done });
    if (Math.abs(u - d.u) > 0.01) d.faceRight = u > d.u;
  }
  function sendOut() {
    G.round++; G.phase = 'out';
    let k; do { k = Math.floor(Math.random() * 3); } while (k === G.last && Math.random() < 0.75);
    G.last = k; G.spot = k; const S = SPOTS[k];
    runTo(S.u, S.v, S.s, () => { G.dog.faceRight = S.u < HOME[0]; G.phase = 'call'; G.barkAt = G.t + 0.35; G.barks = 0; hud(); });
    hud();
  }
  function bark() {
    const S = SPOTS[G.spot]; G.band.bark(panU(S.u), farOf(S.s)); G.barks++; G.dog.hop = 0;
    G.rings.push({ t: 0 }); G.rings.push({ t: -0.24 });
    if (G.barks === 4 && !G.hinted) { G.hinted = true; G.say('Listen for the bark, then throw that way.'); }
  }
  function throwTo(k) {
    if (!G || !G.playing || G.over || G.phase !== 'call') return;
    G.phase = 'throw'; G.throws++;
    const S = SPOTS[k], d = G.dog, right = k === G.spot;
    const [hx, hy] = G.S.P(HAND[0], HAND[1]);
    // the ball's target: her mouth at the top of her leap, or the ground at the spot she isn't
    let tx, ty;
    if (right) { const m = mouthAt(S.u, S.v, S.s, d.faceRight, 0.06 * S.s); tx = m[0]; ty = m[1]; }
    else { [tx, ty] = G.S.P(S.u, S.v - 0.01); }
    Object.assign(G.ball, { flying: true, ft: 0, fdur: 0.55 + Math.hypot(tx - hx, ty - hy) * 0.6, from: [hx, hy], to: [tx, ty], right, k, arc: 0.16 });
    G.ball.s.visible = true; G.band.throwIt(panU(HAND[0]));
    if (right) G.dog.leapAt = G.ball.fdur - 0.32;   // she jumps to meet it
  }
  // her mouth on the board, standing at (u, v), size s, facing, lifted by `lift`
  function mouthAt(u, v, s, faceRight, lift = 0) {
    const [x, y] = G.S.P(u, v);
    return [x + MOUTH[0] * DW * s * (faceRight ? -1 : 1), y + MOUTH[1] * DH * s + lift];
  }
  function landed() {
    const b = G.ball, S = SPOTS[b.k];
    if (b.right) {
      G.caught++; G.band.catchIt(panU(S.u)); G.band.layers = G.caught; G.buzz([40, 30, 80]);
      b.held = true; G.fx.add(b.s.position.x, b.s.position.y, '#f0ff80', 18, 0.3);
      popLow('CAUGHT IT!'); G.ui.alert('Good catch!', S.name + '!', 1.4, 'red');
      G.say(G.caught >= GOAL ? 'Good catch! Good girl, Reliroo!' : 'Good catch! ' + SAY_N[G.caught - 1]);
      hud();
      setTimeout(() => { if (!G || G.over) return; G.phase = 'back';
        runTo(HOME[0], HOME[1], 1, () => { G.dog.faceRight = false; G.dog.dropT = 0; G.phase = 'drop'; }); }, 650);
    } else {
      G.misses++; G.band.plop(panU(S.u)); G.buzz(15);
      petals(b.s.position.x, b.s.position.y, 14);
      b.bounce = 0.5; b.flying = false;
      popLow('NOT THERE'); if (G.t - G.lastSay > 2) { G.lastSay = G.t; G.say('Listen again.'); }
      setTimeout(() => { if (!G || G.over) return; G.ball.s.visible = false; G.ball.bounce = 0; G.phase = 'call'; G.barkAt = G.t + 0.3; hud(); }, 1000);
    }
  }
  function petals(x, y, n) {
    for (let i = 0; i < n; i++) {
      const s = K.sprite(petalTex(), 0.018 + Math.random() * 0.012, { order: 33, color: Math.random() < 0.5 ? '#ff9a2e' : '#ffd84a' }); s.position.set(x, y, 0.07); G.root.add(s);
      const a = Math.random() * Math.PI * 2, sp = 0.15 + Math.random() * 0.25;
      G.bits.push({ s, vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp + 0.15, t: 0, life: 1.1 + Math.random() * 0.5, rot: (Math.random() - 0.5) * 8 });
    }
  }
  function party() {
    G.phase = 'party'; G.band.party = true; hud();
    // zoomies: round every spot and home again
    const path = [SPOTS[0], SPOTS[1], SPOTS[2], { u: HOME[0], v: HOME[1], s: 1 }];
    let i = 0; const next = () => { if (!G || G.over) return; if (i >= path.length) { G.dog.faceRight = false; K.later(G, 0.9, () => G && finish()); return; }
      const P = path[i++]; petals(...G.S.P(P.u, P.v), 10); runTo(P.u, P.v, P.s, () => { G.band.bark(panU(P.u), farOf(P.s)); G.rings.push({ t: 0 }); next(); }); };
    next();
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('reliroo:fetch', G.throws, 'lower');
    K.finale(G, { won: true, kicker: 'Off-duty fetch', title: 'Good girl, Reliroo!', line: G.work && G.work.quote, best: r.isBest, say: 'Relish caught them all!',
      cells: [{ k: 'Caught', v: `${GOAL}/${GOAL}` }, { k: 'Throws', v: `${G.throws}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.band.fade(0.3, 2); G.overT = 0;
  }

  return {
    title: 'Off-Duty Fetch',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = hudCss();
      Object.assign(G, { phase: 'intro', caught: 0, throws: 0, misses: 0, round: 0, spot: 0, last: -1, barkAt: 1e9, barks: 0, hinted: false, lastSay: -9, rings: [], bits: [], t0: 0, overT: 0, pawT: 0 });
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the painting with Relish painted out, so she can run off and come back
      const clean = K.plane(new THREE.TextureLoader().load(ART + 'clean.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; }), 1.002, G.h + 0.002, { order: 12 });
      clean.position.z = 0.03; G.root.add(clean);
      // Relish: a group at her feet (so she can flip, tilt and leap round her paws)
      const tex = new THREE.TextureLoader().load(ART + 'relish.png', t => { t.colorSpace = THREE.SRGBColorSpace; });
      const mesh = K.plane(tex, DW, DH, { order: 30 }); mesh.position.y = DH / 2;
      const grp = new THREE.Group(); grp.add(mesh); grp.position.z = 0.06; G.root.add(grp);
      G.dog = { grp, u: HOME[0], v: HOME[1], s: 1, faceRight: false, running: false, runT: 0, runDur: 1, from: [0, 0, 1], to: [0, 0, 1], hop: 9, leapAt: -1, leapT: -1, dropT: -1, ph: 0 };
      G.ball = { s: K.sprite(ballTex(), 0.05, { order: 34 }), flying: false, held: false, ft: 0, fdur: 1, from: [0, 0], to: [0, 0], bounce: 0, arc: 0.16, right: false, k: 0 };
      G.ball.s.visible = false; G.root.add(G.ball.s);
      G.ring = K.sprite(K.ringTex, 0.05, { color: '#ffd36a', additive: true, order: 31, opacity: 0 }); G.root.add(G.ring);
      G.ring2 = K.sprite(K.ringTex, 0.05, { color: '#ffd36a', additive: true, order: 31, opacity: 0 }); G.root.add(G.ring2);
      G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'black', aria: 'Throw left', press: () => throwTo(0) },
        { label: 'Middle', icon: '▲', kind: 'red', aria: 'Throw to the middle, up the path', press: () => throwTo(1) },
        { label: 'Right', icon: '▶', kind: 'black', aria: 'Throw right', press: () => throwTo(2) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); setTimeout(() => { if (G && !G.over) sendOut(); }, 500); };
      K.intro(G, { title: 'Off-Duty Fetch', how: 'Listen for Relish’s bark, then throw LEFT, MIDDLE or RIGHT.',
        say: 'Off-Duty Fetch. The harness is off, so Relish can play! Listen for her bark. Is she on the left, in the middle, or on the right? Throw the ball to her.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const d = G.dog;
      // running: bounding hops along the way, paws pattering from her side
      let lift = 0, tilt = 0, sq = 1;
      if (d.running) {
        d.runT += dt; const k = Math.min(1, d.runT / d.runDur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        d.u = d.from[0] + (d.to[0] - d.from[0]) * e; d.v = d.from[1] + (d.to[1] - d.from[1]) * e; d.s = d.from[2] + (d.to[2] - d.from[2]) * e;
        d.ph += dt * 15; lift = Math.abs(Math.sin(d.ph)) * 0.022 * d.s; tilt = Math.sin(d.ph) * 0.16;
        G.pawT -= dt; if (G.pawT <= 0) { G.pawT = 0.11; G.band.paw(panU(d.u), farOf(d.s)); }
        if (k >= 1) { d.running = false; const f = d.done; d.done = null; f && f(); }
      }
      // barking: a little hop on each "woof" (and the gold rings)
      if (G.phase === 'call' && G.t >= G.barkAt) { bark(); G.barkAt = G.t + 2.3; }
      if (d.hop < 0.5) { d.hop += dt; lift += Math.sin(Math.min(1, d.hop / 0.2) * Math.PI) * 0.01 * d.s; }
      // the leap to catch
      if (d.leapAt >= 0 && G.ball.flying && G.ball.ft >= d.leapAt) { d.leapT = 0; d.leapAt = -1; }
      if (d.leapT >= 0) { d.leapT += dt; const k = Math.min(1, d.leapT / 0.64); lift += Math.sin(k * Math.PI) * 0.06 * d.s; tilt = 0.55 * Math.sin(k * Math.PI); if (k >= 1) d.leapT = -1; }
      // dropping the ball at Rusty's feet
      if (d.dropT >= 0) {
        d.dropT += dt; const k = Math.min(1, d.dropT / 0.8); tilt = -0.35 * Math.sin(k * Math.PI);
        if (G.ball.held && k > 0.45) { G.ball.held = false; G.ball.bounce = 0.7; G.band.squeak(panU(HOME[0])); G.fx.add(G.ball.s.position.x, G.ball.s.position.y, '#f0ff80', 10, 0.2); }
        if (k >= 1) { d.dropT = -1; G.ball.s.visible = false; G.ball.bounce = 0;
          if (G.caught >= GOAL) party(); else setTimeout(() => { if (G && !G.over) sendOut(); }, 500); }
      }
      if (!d.running && d.leapT < 0 && d.dropT < 0) { sq = 1 + Math.sin(G.t * 3) * 0.012; tilt += Math.sin(G.t * 1.7) * 0.02; }   // breathing
      const [x, y] = G.S.P(d.u, d.v);
      d.grp.position.set(x, y + lift, 0.06 + (1 - d.v) * 0.001);
      d.grp.scale.set(d.s * (d.faceRight ? -1 : 1), d.s * sq, 1);
      d.grp.rotation.z = tilt * (d.faceRight ? 1 : -1);   // nose up when tilt > 0
      // the ball
      const b = G.ball;
      if (b.flying) {
        b.ft += dt; const k = Math.min(1, b.ft / b.fdur);
        b.s.position.set(b.from[0] + (b.to[0] - b.from[0]) * k, b.from[1] + (b.to[1] - b.from[1]) * k + Math.sin(k * Math.PI) * b.arc, 0.075);
        b.s.material.rotation += dt * 9; b.s.scale.setScalar(0.05 * (1 - 0.3 * k * farOf(SPOTS[b.k].s)));
        if (Math.random() < dt * 40) G.fx.add(b.s.position.x, b.s.position.y, '#f0ff80', 1, 0.03);   // a glowing trail
        if (k >= 1) { b.flying = false; landed(); }
      } else if (b.held) {
        const m = mouthAt(d.u, d.v, d.s, d.faceRight, lift); b.s.position.set(m[0], m[1], 0.075); b.s.scale.setScalar(0.034 * d.s);
      } else if (b.bounce > 0) {
        b.bounce -= dt; b.s.position.y += Math.sin(b.bounce * 14) * 0.002;
      }
      // the gold "woof" rings at her mouth
      for (const r of G.rings) r.t += dt;
      G.rings = G.rings.filter(r => r.t < 0.7);
      [G.ring, G.ring2].forEach((s, i) => { const r = G.rings[i]; if (r && r.t >= 0) { const m = mouthAt(d.u, d.v, d.s, d.faceRight, lift); s.position.set(m[0], m[1], 0.07); s.scale.setScalar((0.03 + r.t * 0.16) * d.s); s.material.opacity = Math.max(0, 0.9 - r.t * 1.3); } else s.material.opacity = 0; });
      for (let i = G.bits.length - 1; i >= 0; i--) { const p = G.bits[i]; p.t += dt; p.vy -= dt * 0.5; p.s.position.x += p.vx * dt * 0.3; p.s.position.y += p.vy * dt * 0.3; p.s.material.rotation += p.rot * dt; p.s.material.opacity = Math.max(0, 1 - p.t / p.life);
        if (p.t > p.life) { G.root.remove(p.s); p.s.material.dispose(); G.bits.splice(i, 1); } }
      // the finale, then Rusty in his own words
      if (G.over) {
        G.overT += dt;
        if (G.overT > 2.5 && !G.artist) {
          G.band.fade(0.05, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.band.fade(0.18, 2); G.fadeAt = G.overT + 7; } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.onerror = back; G.artist.play().catch(back); } catch (e) { G.artist = { pause() {} }; back(); }
          G.clipSafety = G.overT + 23;
        }
        if (G.artist && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.band.fade(0.18, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.band.fade(0.0001, 3); }
      }
      // the robot: listens to two barks, then throws the right way (and the wrong way once, to show what happens)
      if (G.bot && G.phase === 'call' && G.barks >= 1 && G.t > G.barkAt - 1.4) throwTo(G.round === 2 && G.misses === 0 ? (G.spot + 1) % 3 : G.spot);
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down' || G.phase !== 'call') return;
      throwTo(G.S.screenThird(ev) + 1);   // left / middle / right third of the screen
    },
    pause() { if (G) { G.paused = true; G.band.hold(); if (G.artist) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; if (G.playing || G.phase === 'party') G.band.start(); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'fetch-relish', phase: G.phase, playing: G.playing, over: G.over, caught: G.caught, throws: G.throws, misses: G.misses, spot: G.spot, artist: !!(G.artist && G.artist.currentTime > 0), artistT: G.artist ? +(G.artist.currentTime || 0).toFixed(1) : 0, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.band.stop(); if (G.artist) { try { G.artist.pause(); } catch (e) {} G.artist = null; } G.bits.forEach(p => p.s.material.dispose()); if (G.css) G.css.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
