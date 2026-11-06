// 5 WEEKS ON MY SIDE (Ben Fox): HOLD STILL.
// "I had the first of four eye surgeries at the age of 18. Docs put a gas bubble in my eye to hold stitches on my
// retina. If I moved my head the gas bubble could tear the stitches out. So for 5 weeks I was on 1 side ..."
// A round x-ray view opens over Ben's eye patch: his retina, the row of stitches, and the gas bubble that has to stay
// over them. Five weeks, five rounds. Each week a friend knocks and brings a VHS tape, and the little TV in the painting
// plays it (a comedy, a space movie, a western, a scary one, a movie about the future). While it plays, keep the
// bubble in the safe band over the stitches: tilt the phone, hold LEFT / RIGHT, or drag. Life keeps nudging it: a
// friend sits on the bed, a scary part makes you jump, the phone rings, a sneeze. The bubble pings from where it is
// (higher and faster the further it drifts), and the stitches creak when they strain. Strain them too long and that
// week starts again (no game over). Each finished week adds its tape to the pile. After five weeks Ben tells it himself.
// The painting can slip out of the camera while you tilt: the game keeps going and shows the painting on screen.
import * as THREE from 'three';
import * as K from './kit.js';
import { drawLens, tapeTex, tvGlowTex, holdLabelTex } from './weeks-things.js';

// Ben telling it in his own words (the 3D gallery's clip for this painting), played at the end
const BEN = new URL('../../../3D/gallery/audio/art_0.mp3', import.meta.url).href;
const QUOTE = '“I had the first of four eye surgeries at the age of 18. Docs put a gas bubble in my eye to hold stitches on my retina. If I moved my head the gas bubble could tear the stitches out. So for 5 weeks I was on 1 side, in bed and watching movies. Friends visited me often, and brought me every VHS tape they had. Watching movies with friends wondering about the future. Those were actually good times.” — Ben Fox';

// where things are in the 576 × 576 painting (u, v from the top-left)
const PATCH = { u: 0.455, v: 0.37 }, LENS = 0.42;           // the x-ray view sits over the eye patch
const TV = { u: 0.684, v: 0.771, w: 0.27, h: 0.215 };       // the little TV's screen
const PILE = { u: 0.40, v: 0.935 };                         // the new tapes stack up on the floor in front of the bed

const ZONE = 0.3;                                           // half-width of the safe band (bubble x runs -1..1)
const WEEKS = [
  { name: 'Week one', movie: 'Comedy', color: '#ffd23a', say: 'Week one. A friend brings a comedy.', hold: 7, wander: 0.25, events: ['laugh'] },
  { name: 'Week two', movie: 'Space', color: '#59a8ff', say: 'Week two. A space movie.', hold: 8, wander: 0.32, events: ['sit', 'popcorn'] },
  { name: 'Week three', movie: 'Western', color: '#ff9a3a', say: 'Week three. A western.', hold: 9, wander: 0.4, events: ['phone', 'laugh'] },
  { name: 'Week four', movie: 'Scary', color: '#c86bff', say: 'Week four. A scary movie.', hold: 9, wander: 0.36, events: ['jump', 'popcorn'] },
  { name: 'Week five', movie: 'The future', color: '#3affd2', say: 'Week five. A movie about the future.', hold: 10, wander: 0.42, events: ['sneeze', 'popcorn', 'sit'] },
];
const EVENTS = {   // what nudges the bubble: the words, how hard, and its sound
  laugh: { title: 'Ha ha ha!', say: 'Don’t laugh too hard!', kick: 0.9 },
  sit: { title: 'Thump!', say: 'Your friend sat on the bed!', kick: 1.15 },
  popcorn: { title: 'Pop pop pop!', say: 'Popcorn everywhere!', kick: 0.8 },
  phone: { title: 'Ring ring!', say: 'The phone is ringing!', kick: 0.95 },
  jump: { title: 'Boo!', say: 'A scary part! Don’t jump!', kick: 1.0 },
  sneeze: { title: 'Ah… ah…', say: 'Uh oh. A sneeze is coming!', kick: 1.05 },
};
// how long Ben's recorded intro takes (weeks-intro-1 … 8 back to back, 27.7 s): week one waits for it, so nothing cuts it off
const INTRO_LEN = 28.6;
const LEFT_TO_GO = ['Four weeks to go.', 'Three weeks to go.', 'Two weeks to go.', 'One more week.'];

export function holdStillGame() {
  let G = null;

  /* ── sounds ── */
  const pan = u => (u - 0.5) * 1.6;
  function knock(side) { for (let i = 0; i < 3; i++) K.noise(0.07, { vol: 0.5, freq: 220, q: 1.4, pan: side * 0.85, delay: i * 0.17, type: 'lowpass' }); }
  function eventSound(kind, side) {
    const p = side * 0.8;
    if (kind === 'laugh') [0, 1, 2, 3].forEach(i => K.tone(520 - i * 30, 0.12, { type: 'square', vol: 0.05, pan: p, delay: i * 0.16, slide: -60 }));
    if (kind === 'sit') { K.noise(0.35, { vol: 0.6, freq: 110, q: 0.8, pan: p, type: 'lowpass' }); K.noise(0.4, { vol: 0.12, freq: 900, sweepTo: 600, q: 6, pan: p, delay: 0.12 }); }
    if (kind === 'popcorn') for (let i = 0; i < 9; i++) K.noise(0.03, { vol: 0.35, freq: 2400 + Math.random() * 1500, q: 4, pan: p + (Math.random() - 0.5) * 0.4, delay: i * 0.09 + Math.random() * 0.05 });
    if (kind === 'phone') for (let i = 0; i < 6; i++) K.tone(i % 2 ? 1500 : 1200, 0.07, { type: 'square', vol: 0.04, pan: p, delay: i * 0.08 });
    if (kind === 'jump') { K.chord([233, 247, 370, 392], 0.6, { vol: 0.07, type: 'sawtooth', pan: p }); K.noise(0.3, { vol: 0.3, freq: 3000, q: 0.7, pan: p }); }
    if (kind === 'sneeze') { K.noise(0.5, { vol: 0.15, freq: 900, sweepTo: 2600, q: 2, pan: p }); K.noise(0.2, { vol: 0.5, freq: 1800, q: 0.6, pan: p, delay: 0.55 }); }
  }
  // the movie on the TV: a quiet little loop in its style, from the TV's side of the painting
  function movie(dt) {
    const w = WEEKS[G.week]; if (!w || G.phase !== 'hold') return;
    G.mT -= dt; if (G.mT > 0) return;
    const p = pan(TV.u), n = G.mN++;
    if (w.movie === 'Comedy') { G.mT = 0.3; K.tone(K.SCALES.major[[0, 4, 7, 4, 5, 9, 7, 4][n % 8]], 0.12, { type: 'triangle', vol: 0.035, pan: p }); if (n % 16 === 15) K.tone(300, 0.3, { vol: 0.05, slide: 500, pan: p }); }
    if (w.movie === 'Space') { G.mT = 0.6; if (n % 4 === 0) K.chord([110, 165, 220], 2.4, { vol: 0.025, type: 'sine', pan: p }); if (n % 5 === 2) K.tone(1500, 0.25, { type: 'square', vol: 0.025, slide: -1200, pan: p }); }
    if (w.movie === 'Western') { G.mT = 0.32; K.noise(0.04, { vol: 0.18, freq: n % 2 ? 1500 : 1900, q: 5, pan: p }); if (n % 12 === 0) K.tone(880, 0.6, { vol: 0.03, slide: 300, pan: p, delay: 0.1 }); }
    if (w.movie === 'Scary') { G.mT = 0.85; if (n % 3 === 0) K.tone(55, 2.6, { type: 'sawtooth', vol: 0.025, pan: p }); K.noise(0.08, { vol: 0.25, freq: 90, q: 1, type: 'lowpass', pan: p }); K.noise(0.08, { vol: 0.18, freq: 90, q: 1, type: 'lowpass', pan: p, delay: 0.2 }); }
    if (w.movie === 'The future') { G.mT = 0.22; K.tone(K.SCALES.penta[[0, 2, 4, 6, 8, 6, 4, 2][n % 8] + 1], 0.2, { type: 'triangle', vol: 0.028, pan: p + Math.sin(n * 0.4) * 0.3 }); }
  }
  // the bubble pings from where it is: slow and low over the stitches, faster and higher the further it drifts
  function sonar(dt) {
    if (G.phase !== 'hold') return;
    G.sT -= dt; if (G.sT > 0) return;
    const a = Math.abs(G.x), out = Math.max(0, (a - ZONE) / (1 - ZONE));
    G.sT = G.inZ ? 1.0 : 0.45 - 0.25 * out;
    K.tone(G.inZ ? 330 : 420 + 600 * out, 0.09, { vol: G.inZ ? 0.04 : 0.07, pan: G.x * 0.9 });
    if (G.strain > 0.25) K.noise(0.14, { vol: 0.08 + 0.18 * G.strain, freq: 950, sweepTo: 700, q: 7 });   // the stitches creak
  }

  /* ── the painting, on screen, for when tilting takes the camera off it ── */
  function screenView() {
    const el = G.viewEl = document.createElement('div'); el.className = 'mgk'; el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, { left: '50%', top: 'calc(214px + env(safe-area-inset-top))', width: 'min(calc(100vw - 24px), 44vh)', transform: 'translateX(-50%) translateY(12px)', opacity: '0', transition: 'opacity .35s, transform .35s',
      border: '3px solid #fff', boxShadow: '0 8px 0 #000', background: '#000', pointerEvents: 'none' });
    el.innerHTML = `<canvas width="480" height="480" style="display:block;width:100%;height:auto"></canvas>
      <div style="position:absolute;left:0;right:0;bottom:-32px;text-align:center;font:900 12px Archivo,Arial,sans-serif;letter-spacing:.12em;color:#fff;text-transform:uppercase;text-shadow:0 2px 4px #000">Painting out of view · keep going!</div>`;
    document.body.appendChild(el); G.viewCv = el.querySelector('canvas'); G.viewG = G.viewCv.getContext('2d');
    G.viewImg = new Image(); G.viewImg.crossOrigin = 'anonymous'; if (G.work && G.work.image) G.viewImg.src = G.work.image;
  }
  function drawView() {
    const c = G.viewG, W = G.viewCv.width;
    if (G.viewImg.complete && G.viewImg.naturalWidth) c.drawImage(G.viewImg, 0, 0, W, W); else { c.fillStyle = '#2a1a10'; c.fillRect(0, 0, W, W); }
    const s = LENS * W; c.drawImage(G.lensCv, PATCH.u * W - s / 2, PATCH.v * W - s / 2, s, s);
    const lw = 0.46 * W, lh = lw * 200 / 640, li = G.label.material.map.image; if (li) c.drawImage(li, PATCH.u * W - lw / 2, (PATCH.v - LENS / 2 - 0.045) * W - lh / 2, lw, lh);
  }

  function hud() {
    const w = WEEKS[G.phase === 'wait' ? 0 : G.week], pct = Math.round(Math.min(1, G.held / (w ? w.hold : 1)) * 100);
    const sub = G.phase === 'hold' ? (G.inZ ? `Holding still · ${pct}%` : 'Bring the bubble back over the stitches') : G.phase === 'knock' ? 'A friend is at the door…' : G.phase === 'wait' ? 'Listen… this is the bubble in Ben’s eye' : 'Hold still';
    G.ui.panel('Hold still', w ? `${w.name}<small>of 5</small>` : `5 weeks<small>done</small>`, { segs: [G.done, WEEKS.length], sub, warn: G.strain > 0.6 });
  }
  function startWeek(i) {
    G.week = i; G.held = 0; G.strain = 0; G.ev = 0; G.phase = 'knock'; G.phT = 0; G.side = i % 2 ? 1 : -1; G.warned = false;
    const w = WEEKS[i];
    knock(G.side);
    G.ui.alert('Knock knock!', w.say.replace(/^Week \w+\. /, ''), 3, 'black');
    G.say('Knock knock! ' + w.say);
    hud();
  }
  function fire(kind) {
    const E = EVENTS[kind], side = G.evSide = -G.evSide;
    G.vx += side * E.kick; G.bump = 1; G.buzz([40, 30, 40]);
    eventSound(kind, side);
    G.ui.alert(E.title, E.say, 2.2, 'red');
    G.say(E.say);
  }
  function weekDone() {
    const w = WEEKS[G.week];
    G.phase = 'done'; G.phT = 0; G.done++;
    K.sfx.good(0, G.done * 2); K.chord([392, 494, 587, 784], 1.4, { vol: 0.06 });
    // the tape flies onto the pile in front of the bed
    const m = K.plane(tapeTex(w.color, w.movie), 0.15, 0.042, { order: 25, opacity: 0 });
    const [tx, ty] = G.S.P(TV.u, TV.v); m.position.set(tx, ty, 0.06); G.root.add(m);
    const [px, py] = G.S.P(PILE.u + (G.done % 2 ? -0.01 : 0.012), PILE.v - (G.done - 1) * 0.04);
    G.tapes.push({ m, t: 0, from: [tx, ty], to: [px, py], rot: (G.done % 2 ? -1 : 1) * 0.06 });
    const [fx, fy] = G.S.P(PATCH.u, PATCH.v); G.fx.add(fx, fy, '#ffc21a', 26, 0.3);
    if (G.done < WEEKS.length) { G.ui.alert(w.name + ' done!', LEFT_TO_GO[G.done - 1], 2.4, 'red'); G.say(w.name + ' done! ' + LEFT_TO_GO[G.done - 1]); }
    hud();
  }

  return {
    title: 'Hold Still',
    start(ctx) {
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', week: -1, done: 0, x: 0, vx: 0, held: 0, strain: 0, inZ: true, wander: 0, wT: 0, ev: 0, evSide: 1, side: -1, phT: 0,
        mT: 0, mN: 0, sT: 0, bump: 0, btn: 0, drag: null, tapes: [], closeCalls: 0, outT: 0, saidOut: -9, saidGood: -9, playT: 0, endT: -1, lost: false, viewA: 0, hudT: 0, tvA: 0 });
      // the x-ray view over the eye patch (redrawn every frame)
      G.lensCv = document.createElement('canvas'); G.lensCv.width = G.lensCv.height = 320;
      G.lensTex = new THREE.CanvasTexture(G.lensCv); G.lensTex.colorSpace = THREE.SRGBColorSpace;
      G.lens = K.plane(G.lensTex, LENS, LENS, { order: 20, opacity: 0 });
      { const [x, y] = G.S.P(PATCH.u, PATCH.v); G.lens.position.set(x, y, 0.05); } G.root.add(G.lens);
      // the words over the eye
      G.label = K.plane(holdLabelTex(), 0.46, 0.46 * 200 / 640, { order: 21, opacity: 0 });
      { const [x, y] = G.S.P(PATCH.u, PATCH.v - LENS / 2 - 0.045); G.label.position.set(x, y, 0.055); } G.root.add(G.label);
      // (the kit shows pop-ups in the top slot, over the WEEK panel, so they never cover the eye)
      // the TV's glow
      G.tv = K.plane(tvGlowTex(), TV.w * 1.25, TV.h * 1.3, { order: 15, opacity: 0, additive: true });
      { const [x, y] = G.S.P(TV.u, TV.v); G.tv.position.set(x, y, 0.04); } G.root.add(G.tv);
      // tilt, the same way Tides of Decision reads it (iPhone and Android, any way up)
      const M = G.mot = { ok: false, g: [0, 0, 0], s: 0, roll: 0, n: 0 };
      const on = (ev) => {
        const a = ev.accelerationIncludingGravity; if (!a || a.x == null) return;
        M.ok = true; M.n++;
        const ang = (((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
        const x = a.x * ca - a.y * sa, y = a.x * sa + a.y * ca, z = a.z || 0, k = M.n < 4 ? 1 : 0.2;
        M.g[0] += (x - M.g[0]) * k; M.g[1] += (y - M.g[1]) * k; M.g[2] += (z - M.g[2]) * k;
        const [gx, gy, gz] = M.g;
        if (Math.abs(gy) > 6) M.s = Math.sign(gy); else if (!M.s && Math.abs(gz) > 6) M.s = Math.sign(gz);
        M.roll = (Math.atan2(-(M.s || 1) * gx, Math.hypot(gy, gz)) * 180) / Math.PI;
      };
      addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
      try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
      screenView();
      G.onGo = () => {
        G.ui.buttons([
          { label: 'Left', icon: '◀', kind: 'black', aria: 'Nudge the bubble left (hold)', press: () => { G.btn = -1; }, release: () => { if (G.btn < 0) G.btn = 0; } },
          { label: 'Right', icon: '▶', kind: 'black', aria: 'Nudge the bubble right (hold)', press: () => { G.btn = 1; }, release: () => { if (G.btn > 0) G.btn = 0; } },
        ]);
        G.phase = 'wait'; hud();   // the x-ray view opens while Ben finishes the story; the first knock comes after
      };
      K.intro(G, { title: 'Hold Still', how: 'Keep the bubble over the stitches. Tilt, or hold Left / Right.',
        say: 'Hold still. At eighteen, Ben had the first of four eye surgeries. The doctors put a gas bubble in his eye to hold the stitches on his retina. For five weeks, he had to lie on one side and hold still. Keep the bubble over the stitches. If it drifts, tilt your phone, or hold left or right, to bring it back. Friends will visit with movies. Try not to move!' });
    },
    update(dt) {
      if (!G) return;
      dt = Math.min(dt, 0.05);
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const w = WEEKS[G.week];
      // the lens opens once the game starts, and closes at the end
      const lensOn = G.phase !== 'intro' && G.phase !== 'end' ? 1 : 0;
      G.lens.material.opacity += (lensOn - G.lens.material.opacity) * Math.min(1, dt * 4);
      G.lens.scale.setScalar(0.85 + 0.15 * G.lens.material.opacity + Math.sin(G.t * 1.6) * 0.008);
      G.label.material.opacity = G.lens.material.opacity;
      // the TV glows with the movie, flickering in its colour
      const tvOn = G.phase === 'hold' ? 0.45 + 0.15 * Math.sin(G.t * 9) * Math.sin(G.t * 3.7) : G.phase === 'end' ? 0.35 : 0;
      G.tvA += (tvOn - G.tvA) * Math.min(1, dt * 5); G.tv.material.opacity = G.tvA;
      if (w) G.tv.material.color.set(w.color); else G.tv.material.color.set('#fff3c8');
      // the tapes fly to the pile
      for (const tp of G.tapes) {
        tp.t = Math.min(1, tp.t + dt * 1.4); const k = 1 - Math.pow(1 - tp.t, 3);
        tp.m.position.x = tp.from[0] + (tp.to[0] - tp.from[0]) * k; tp.m.position.y = tp.from[1] + (tp.to[1] - tp.from[1]) * k + Math.sin(k * Math.PI) * 0.12;
        tp.m.rotation.z = tp.rot * k + (1 - k) * 2.5; tp.m.material.opacity = Math.min(1, tp.t * 3);
      }

      if (G.phase === 'wait') { G.x = Math.sin(G.t * 0.7) * 0.12; if (G.bot || G.t >= INTRO_LEN) startWeek(0); }
      else if (G.phase === 'knock') { G.phT += dt; G.x *= Math.exp(-dt * 2); G.vx = 0; if (G.phT > (G.bot ? 1.2 : 3.2)) { G.phase = 'hold'; G.mN = 0; G.mT = 0; G.wander = 0; } }
      else if (G.phase === 'hold') {
        G.playT += dt;
        // your push: tilt, the buttons, or a drag (and the robot, when it plays)
        let push = G.btn;
        if (G.mot.ok && Math.abs(G.mot.roll) > 3) push += Math.max(-1, Math.min(1, G.mot.roll / 20));
        if (G.drag) push += Math.max(-1, Math.min(1, G.drag.dx / (innerWidth * 0.25)));
        if (G.bot) push = Math.abs(G.x) > 0.08 || Math.abs(G.vx) > 0.2 ? Math.max(-1, Math.min(1, -(G.x * 3 + G.vx * 1.2))) : 0;
        push = Math.max(-1, Math.min(1, push));
        // the bubble wanders a little by itself, more each week
        G.wT -= dt; if (G.wT <= 0) { G.wT = 1.2 + Math.random(); G.wander = (Math.random() * 2 - 1) * w.wander; }
        G.vx += (push * 2.4 + G.wander) * dt; G.vx *= Math.exp(-2.2 * dt); G.x += G.vx * dt;
        if (Math.abs(G.x) > 1) { G.x = Math.sign(G.x); G.vx *= -0.3; }
        const was = G.inZ; G.inZ = Math.abs(G.x) <= ZONE;
        if (G.inZ) {
          G.held += dt; G.strain = Math.max(0, G.strain - dt * 0.2);
          if (!was && G.t - G.saidGood > 6) { G.saidGood = G.t; G.say('Nice and still.'); }
        } else {
          G.strain = Math.min(1, G.strain + dt * (0.3 + 0.35 * (Math.abs(G.x) - ZONE)));
          if (was && G.t - G.saidOut > 4) { G.saidOut = G.t; G.say(G.x < 0 ? 'It’s drifting left.' : 'It’s drifting right.'); }
          if (G.strain > 0.6 && !G.warned) { G.warned = true; G.say('Careful, the stitches!'); G.buzz([80, 60, 80]); }
        }
        // life happens: the week's nudges come at even points through it
        const evs = w.events; if (G.ev < evs.length && G.held >= w.hold * (G.ev + 1) / (evs.length + 1)) { fire(evs[G.ev]); G.ev++; }
        if (G.strain >= 1) {   // the stitches couldn't take it: that week starts again
          G.closeCalls++; G.strain = 0; G.held = 0; G.ev = 0; G.x = 0; G.vx = 0; G.warned = false;
          K.sfx.bad(); G.buzz([200]); G.ui.alert('Ouch!', 'Let’s try that week again.', 2.4, 'black'); G.say('Ouch. Let’s try that week again.');
        }
        if (G.held >= w.hold) weekDone();
        movie(dt); sonar(dt);
      } else if (G.phase === 'done') {
        G.phT += dt; G.x *= Math.exp(-dt * 3); G.vx = 0; G.strain = Math.max(0, G.strain - dt);
        if (G.phT > (G.bot ? 1.5 : 3.2)) {
          if (G.done < WEEKS.length) startWeek(G.week + 1);
          else {
            G.phase = 'end'; G.endT = 0; G.week = WEEKS.length; hud();
            const secs = Math.round(G.playT);
            K.finale(G, { won: true, kicker: '5 weeks on my side', title: 'The stitches held',
              cells: [{ k: 'Weeks', v: '5' }, { k: 'Tapes', v: String(G.tapes.length) }, { k: 'Close calls', v: String(G.closeCalls) }, { k: 'Time', v: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') }],
              line: (G.work && G.work.quote) || QUOTE, say: 'Five weeks on your side. The stitches held.' });
            // Ben tells it himself, so the pictures and the story meet; stop him if the story video is opened
            const story = G.story; G.story = () => { if (G.ben) G.ben.pause(); story && story(); };
          }
        }
      } else if (G.phase === 'end') {
        G.endT += dt;
        if (G.endT > 3.3 && !G.ben) { try { G.ben = new Audio(BEN); G.ben.play().catch(() => {}); } catch (e) {} }
      }
      G.bump = Math.max(0, G.bump - dt * 3);
      // redraw the x-ray view
      if (G.lens.material.opacity > 0.01) {
        drawLens(G.lensCv.getContext('2d'), G.lensCv.width, { x: G.x, y: Math.sin(G.t * 1.3) * 0.5, zone: ZONE, inZ: G.inZ, strain: G.strain, t: G.t, held: w ? G.held / w.hold : 0, bump: G.bump });
        G.lensTex.needsUpdate = true;
      }
      // the painting on screen while the camera is off it
      G.viewA += ((G.lost && G.phase !== 'intro' && !G.over ? 1 : 0) - G.viewA) * Math.min(1, dt * 6);
      if (G.viewEl) { G.viewEl.style.opacity = G.viewA.toFixed(2); G.viewEl.style.transform = `translateX(-50%) translateY(${(1 - G.viewA) * 12}px)`; if (G.viewA > 0.02) drawView(); }
      G.hudT -= dt; if (G.hudT <= 0 && G.phase !== 'end' && G.phase !== 'intro') { G.hudT = 0.25; hud(); }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'hold') return;
      if (kind === 'down') G.drag = { x0: ev.clientX, dx: 0 };
      else if (kind === 'move' && G.drag) G.drag.dx = ev.clientX - G.drag.x0;
      else if (kind === 'up') G.drag = null;
    },
    // the painting left the camera (tilting does that): keep playing, and show the painting on screen instead
    pause() { if (G) { G.lost = true; if (G.ben && G.over) G.ben.pause(); } },
    resume() { if (G) { G.lost = false; if (G.ben && G.over && !G.ben.ended) G.ben.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'hold-still', phase: G.phase, week: G.week, done: G.done, x: +G.x.toFixed(2), held: +G.held.toFixed(1), strain: +G.strain.toFixed(2), closeCalls: G.closeCalls, sensor: !!(G.mot && G.mot.ok), lost: G.lost, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.offMotion && G.offMotion(); if (G.ben) { G.ben.pause(); G.ben = null; } G.viewEl && G.viewEl.remove(); G.css && G.css.remove(); } K.cleanup(G); G = null; },
  };
}
