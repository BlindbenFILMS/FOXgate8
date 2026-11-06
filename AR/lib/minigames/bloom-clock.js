// TAKE TIME TO BLOOM (Steven McCoy): WIND THE CLOCKWORK.
// "You deserve your time and attention as well. And when I took that time, and worked on myself, I truly flourished."
// The flower is grey and sleepy. Draw slow circles on the screen (anywhere) to turn the brass gear in the painting,
// like winding a music box: every click of the gear plays the next note of a gentle music-box waltz, so going slow
// sounds beautiful. As you wind, colour sweeps around the flower like the hand of a clock, and every two turns a
// petal swings open. Go too fast and the clockwork jams (a clank, a red burst, the music stops) until you slow down.
// (Or hold the WIND button: it winds at a calm, steady pace.)
// Open all 8 petals and the whole flower blooms in full colour, and Steven says it in his own words.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './bloom-things.js';

// Steven McCoy reading his quote, in his own voice
const ARTIST = new URL('../../../3D/gallery/audio/art_4.mp3', import.meta.url).href;

// the painting (1024 × 1024): the flower's orange centre, and the big brass gear below the clock
const FLOWER = { u: 0.63, v: 0.32 };
const GEAR = { u: 0.42, v: 0.56 };
const GOAL = 8;
const TURNS = 2;                    // turns of the gear to open one petal
const FAST = 1.45;                  // turns per second: faster than this and it jams
const WARN = 1.1;                   // getting close to too fast
const HOLD_SPEED = 0.7;             // the WIND button's calm pace
const PETAL_LINES = ['Take your time.', 'You are a person.', 'You deserve your time.', 'Little by little.', 'You are worth it.', 'Breathe.', 'Almost in bloom.'];
// the music box: a little waltz in G, one note per click of the gear
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const TUNE = [67, 71, 74, 79, 78, 74, 76, 74, 71, 72, 74, 76, 74, 71, 67, 69, 71, 72, 74, 72, 71, 69, 67, 66, 67, 74, 79, 83, 81, 79, 78, 76, 74, 76, 78, 79];
const CLICKS = 12;                  // clicks (notes) per turn

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// grey and sleepy, except where colour has swept around the flower like a clock hand
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform vec2 uC; uniform float uP, uA, uT, uGlow, uJam;
void main(){
  vec3 col = texture2D(map, vUv).rgb;
  vec2 d = vUv - uC;
  float a = atan(d.x, d.y);                       // 0 straight up, clockwise
  float f = fract(a / 6.28318 + 1.0);
  float lit = smoothstep(uP + 0.012, uP - 0.012, f);
  lit = max(lit, step(1.0, uP));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 sleepy = mix(vec3(l), col, 0.1) * vec3(0.46, 0.48, 0.55);
  vec3 c = mix(sleepy, col * (1.0 + 0.1 * uGlow) + vec3(0.05, 0.03, 0.0) * uGlow, lit);
  c = mix(c, c * vec3(1.25, 0.6, 0.55), uJam * 0.5);
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── sound: the music box, the gear, a soft pad ───────────────────────── */
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mix = ac.createGain(); mix.gain.value = 1; mix.connect(out);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const oscs = [];
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, mix)); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, mix)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // a soft pad under everything (G and D), getting warmer as petals open
  const padF = ac.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 500; const padG = ac.createGain(); padG.gain.value = 0.9; padF.connect(padG).connect(mix);
  for (const [m, v] of [[43, 0.04], [50, 0.03], [55, 0.018]]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = midi(m); g.gain.value = v; o.connect(g).connect(padF); o.start(); oscs.push(o); }
  return {
    start() { out.gain.setTargetAtTime(0.85, ac.currentTime, 0.5); },
    // one click of the gear: a tiny tick, and the next note of the music box (bell-like: sine + a bright partial)
    click(n, p, speedK) {
      const t = ac.currentTime + 0.005, m = TUNE[n % TUNE.length];
      noise(t, 0.02, { freq: 4200 + (n % 2) * 900, q: 4, vol: 0.05 + speedK * 0.04, p });
      tone(t, midi(m), 1.1, { vol: 0.07, p: p * 0.5 }); tone(t, midi(m) * 3.01, 0.35, { vol: 0.018, p: p * 0.5 }); tone(t, midi(m) * 5.4, 0.12, { vol: 0.008, p: p * 0.5 });
      if (n % 6 === 0) tone(t, midi(m - 24), 1.6, { type: 'triangle', vol: 0.03 });
    },
    // getting too fast: a rising whirr of the spring
    whirr(k, p) { const t = ac.currentTime + 0.005; noise(t, 0.06, { freq: 1500 + k * 3000, q: 6, vol: 0.05 * k, p }); },
    jam(p) {
      const t = ac.currentTime + 0.01;
      noise(t, 0.3, { freq: 900, q: 1.2, vol: 0.3, p }); tone(t, 180, 0.4, { type: 'square', vol: 0.08, slide: 90, p });
      for (let i = 0; i < 4; i++) noise(t + 0.04 + i * 0.05, 0.04, { freq: 3000 + i * 600, q: 5, vol: 0.12, p });
      tone(t + 0.1, midi(66), 0.8, { type: 'triangle', vol: 0.04, slide: midi(60) });
    },
    unjam() { const t = ac.currentTime + 0.01; tone(t, midi(74), 0.3, { vol: 0.05 }); tone(t + 0.08, midi(79), 0.4, { vol: 0.05 }); },
    petal(n) {
      const t = ac.currentTime + 0.01;
      [0, 4, 7, 11, 14].forEach((d, i) => tone(t + i * 0.07, midi(67 + d + (n % 2) * 2), 1.8, { vol: 0.05, p: (i - 2) * 0.25 }));
      noise(t, 0.6, { freq: 6000, q: 0.7, vol: 0.05 });
      padF.frequency.setTargetAtTime(500 + (n + 1) * 260, ac.currentTime, 0.8);
    },
    finale() { const t = ac.currentTime + 0.1; [55, 62, 67, 71, 74, 79, 83, 86].forEach((m, i) => tone(t + i * 0.12, midi(m), 3.4, { vol: 0.05, att: 0.03, p: (i - 3.5) * 0.2 })); padF.frequency.setTargetAtTime(3000, ac.currentTime, 1); },
    quiet(v) { mix.gain.setTargetAtTime(v, ac.currentTime, 0.6); },
    // Steven is about to speak: fade every sound in the game to silence (and it stays silent while he talks)
    hush() { out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0, ac.currentTime, 0.35); },
    pause() { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); },
    resume() { out.gain.setTargetAtTime(0.85, ac.currentTime, 0.2); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} setTimeout(() => { for (const o of oscs) { try { o.stop(); } catch (e) {} } }, 400); },
  };
}

export function bloomClockGame() {
  let G = null;
  const tex = {};
  const thingTex = (k) => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  const PAN = (GEAR.u - 0.5) * 1.5;

  function hud() {
    const sub = G.jam > 0 ? 'Jammed! Wait, then go slower' : G.speedK > WARN ? 'Slow down…' : 'Draw slow circles · or hold WIND';
    G.ui.panel('Wind the clockwork', `${G.open}<small>of ${GOAL} petals</small>`, { segs: [G.open, GOAL], sub: sub + (G.jams ? ` · Jams ${G.jams}` : ''), warn: G.jam > 0 });
  }

  // turn the gear by d radians (from your finger, the WIND button, or the robot)
  function turn(d) {
    if (!G || !G.playing || G.over || G.jam > 0 || G.phase !== 'play') return;
    const a = Math.abs(d);
    G.recent += a / (Math.PI * 2);
    G.gearA += d;
    G.idle = 0;
    G.wound += a / (Math.PI * 2);
    // the music box: one note per click
    const clicks = Math.floor(G.wound * CLICKS);
    while (G.clicks < clicks) { G.band.click(G.clicks, PAN, Math.min(1, G.speedK / FAST)); G.clicks++; G.gearKick = 1; }
    // a petal every TURNS turns
    const petals = Math.min(GOAL, Math.floor(G.wound / TURNS));
    while (G.open < petals) openPetal();
  }
  function openPetal() {
    G.open++; G.band.petal(G.open); G.buzz([20, 30, 40]);
    const p = G.petals[G.open - 1]; p.t = 0; p.on = true;
    const [x, y] = G.S.P(FLOWER.u, FLOWER.v); G.fx.add(x, y, '#fff3d0', 16, 0.3);
    if (G.open < GOAL) { G.say(PETAL_LINES[G.open - 1]); G.ui.alert(PETAL_LINES[G.open - 1].replace('.', ''), `${G.open} of ${GOAL} petals`, 1.5, 'blue'); }
    else { G.say('You are in full bloom!'); G.ui.alert('Full bloom!', 'You took the time', 2, 'red'); G.phase = 'bloom'; G.phT = 0; }
    hud();
  }
  function jam() {
    G.jam = 1.9; G.jams++; G.band.jam(PAN); G.buzz([120, 50, 120]); G.recent = 0; G.speedK = 0;
    const [x, y] = G.S.P(GEAR.u, GEAR.v); G.jamFx = 1; G.fx.add(x, y, '#ff6a3a', 14, 0.3);
    G.say('Too fast! The clock jammed.'); G.ui.alert('Jammed!', 'Too fast. Slow and steady.', 1.8, 'red');
    hud();
  }

  return {
    title: 'Wind the clockwork',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, wound: 0, clicks: 0, open: 0, jams: 0, jam: 0, gearA: 0, gearKick: 0, recent: 0, speedK: 0, fastT: 0, idle: 0, hints: 0,
        holding: false, sweep: 0, glow: 0, jamFx: 0, down: false, lastA: null, endT: 0, artist: null, petals: [], hudT: 0, botJammed: false, botHeld: false });
      G.band = band(K.audio());
      G.uni = { map: { value: null }, uC: { value: new THREE.Vector2(FLOWER.u, 1 - FLOWER.v) }, uP: { value: 0 }, uA: { value: 0 }, uT: { value: 0 }, uGlow: { value: 0 }, uJam: { value: 0 } };
      G.art = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.art.renderOrder = 11; G.art.position.z = 0.03; G.root.add(G.art);
      new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.artOK = true; });
      // 8 petals around the flower's centre, each in its own slice of the clock, folded until it opens
      for (let i = 0; i < GOAL; i++) {
        const ang = (i + 0.5) / GOAL * Math.PI * 2;      // clockwise from straight up
        const s = K.sprite(thingTex('petal'), 0.2, { order: 20, opacity: 0 }); G.root.add(s);
        G.petals.push({ s, ang, t: 0, on: false });
      }
      // the clock hand that sweeps the colour round, the brass gear you turn, its glow and the jam burst
      G.hand = K.sprite(thingTex('hand'), 0.42, { order: 23, opacity: 0 }); const [fx, fy] = G.S.P(FLOWER.u, FLOWER.v); G.hand.position.set(fx, fy, 0.06); G.root.add(G.hand);
      G.gearGlow = K.sprite(K.glowTex, 0.3, { color: '#ffcf7a', additive: true, opacity: 0, order: 21 });
      G.gear = K.sprite(thingTex('gear'), 0.2, { order: 22, opacity: 0 });
      G.jamS = K.sprite(thingTex('jam'), 0.26, { order: 24, additive: true, opacity: 0 });
      const [gx, gy] = G.S.P(GEAR.u, GEAR.v); for (const s of [G.gearGlow, G.gear, G.jamS]) { s.position.set(gx, gy, 0.055); G.root.add(s); }
      G.btns = G.ui.buttons([{ label: 'Hold to wind', icon: '↻', kind: 'red', aria: 'Hold to wind the clock slowly. Or draw slow circles on the screen.', press: () => { G.holding = true; }, release: () => { G.holding = false; } }]);
      hud();
      G.onGo = () => { G.phase = 'play'; G.phT = 0; };
      K.intro(G, { title: 'Wind the clockwork',
        how: 'Draw slow circles anywhere on the screen to turn the gear, like winding a music box. Slow and steady opens the petals. Too fast and it jams. Or hold WIND.',
        say: 'Wind the clockwork. Steven says you deserve your time too. Draw slow circles on the screen, anywhere, to turn the gear. Like winding a music box. Every click plays a note. Slow and steady, and the petals open. Too fast, and the clock jams. You can also hold the Wind button. Open all 8 petals.' });
      G.band.start();
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      G.uni.uA.value += ((G.artOK ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 3.3) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); } }

      // ── the WIND button winds at a calm pace ──
      if (G.holding) turn(HOLD_SPEED * Math.PI * 2 * dt);

      // ── how fast you're winding (turns per second, smoothed) ──
      const inst = G.recent / Math.max(dt, 1e-3); G.recent = 0;
      G.speedK += (inst - G.speedK) * Math.min(1, dt * 6);
      if (G.phase === 'play' && G.jam <= 0) {
        if (G.speedK > WARN) { G.whirrT = (G.whirrT || 0) - dt; if (G.whirrT <= 0) { G.whirrT = 0.07; G.band.whirr(Math.min(1, (G.speedK - WARN) / (FAST - WARN)), PAN); } }
        if (G.speedK > FAST) { G.fastT += dt; if (G.fastT > 0.3) { G.fastT = 0; jam(); } } else G.fastT = Math.max(0, G.fastT - dt);
      }
      if (G.jam > 0) { G.jam -= dt; if (G.jam <= 0) { G.band.unjam(); G.say('Slow and steady.'); hud(); } }
      // a gentle reminder if nothing is happening
      if (G.phase === 'play') { G.idle += dt; if (G.idle > 7 && G.hints < 2) { G.idle = 0; G.hints++; G.say('Draw slow circles on the screen. Or hold Wind.'); } }
      G.hudT -= dt; if (G.hudT <= 0 && G.phase === 'play') { G.hudT = 0.25; hud(); }

      // ── the gear, its glow, the jam burst ──
      G.gearKick = Math.max(0, G.gearKick - dt * 6); G.jamFx = Math.max(0, G.jamFx - dt * 1.2);
      const shake = G.jam > 0 ? (Math.random() - 0.5) * 0.008 : 0, [gx, gy] = G.S.P(GEAR.u, GEAR.v);
      G.gear.position.set(gx + shake, gy + shake, 0.055); G.gear.material.rotation = -G.gearA;
      G.gear.scale.setScalar(0.2 * (1 + G.gearKick * 0.03));
      G.gear.material.opacity += ((G.playing || G.over ? 1 : 0.85) - G.gear.material.opacity) * Math.min(1, dt * 3);
      const warmK = Math.min(1, G.speedK / FAST);
      G.gearGlow.material.color.set(G.jam > 0 ? '#ff5a3a' : warmK > WARN / FAST ? '#ffb070' : '#ffe2a0');
      G.gearGlow.material.opacity = (G.phase === 'intro' ? 0.4 + 0.2 * Math.sin(G.t * 3) : 0.35 + warmK * 0.4);
      G.jamS.material.opacity = G.jamFx; G.jamS.scale.setScalar(0.22 + (1 - G.jamFx) * 0.1); G.uni.uJam.value = G.jamFx;

      // ── the colour sweeps round the flower like a clock hand; the hand points at its edge ──
      const sweepTo = G.over ? 1.0001 : Math.min(1, G.wound / (TURNS * GOAL));
      G.sweep += (sweepTo - G.sweep) * Math.min(1, dt * 5); G.uni.uP.value = G.sweep;
      G.hand.material.rotation = -G.sweep * Math.PI * 2;
      G.hand.material.opacity += ((G.phase === 'play' || G.phase === 'intro' ? 0.95 : 0) - G.hand.material.opacity) * Math.min(1, dt * 3);
      G.glow += ((G.over ? 1 : G.open / GOAL * 0.5) - G.glow) * Math.min(1, dt); G.uni.uGlow.value = G.glow;

      // ── petals swing open from folded, then sway softly ──
      const [fx, fy] = G.S.P(FLOWER.u, FLOWER.v);
      for (const p of G.petals) {
        p.t += dt;
        const k = p.on ? Math.min(1, p.t / 1.1) : 0, e = 1 - Math.pow(1 - k, 3) + Math.sin(k * Math.PI) * 0.12;
        const len = 0.06 + 0.2 * e + (G.over ? 0.03 : 0), sway = Math.sin(G.t * 1.2 + p.ang * 3) * 0.04 * k;
        const a = p.ang + sway, dx = Math.sin(a), dy = Math.cos(a);   // pointing outward, clockwise from up
        const r0 = 0.03 * e;                                          // leave the flower's orange centre showing
        p.s.position.set(fx + dx * (r0 + len * 0.5), fy + dy * (r0 + len * 0.5), 0.05);
        p.s.scale.set(len * (0.55 + 0.45 * e), len, 1);
        p.s.material.rotation = -a;
        p.s.material.opacity = p.on ? Math.min(0.85, k * 2) : 0;
      }

      // ── full bloom, then the finale ──
      if (G.phase === 'bloom' && G.phT > 2.2 && !G.over) {
        G.band.finale(); G.holding = false;
        const r = K.best('take-time-to-bloom:clock', G.jams, 'lower');
        K.finale(G, { won: true, kicker: 'Wind the clockwork', title: 'You took the time to bloom', line: G.work && G.work.quote, best: r.isBest,
          say: 'You took the time, and you bloomed.', cells: [{ k: 'Petals', v: G.open }, { k: 'Turns', v: Math.round(G.wound) }, { k: 'Jams', v: G.jams }] });
        G.endT = 0;
      }

      // ── the robot: draws calm circles, rushes once (to test the jam), and uses the WIND button for a while ──
      if (G.bot && G.playing && !G.over && G.phase === 'play') {
        if (!G.botHeld && G.open === 5) G.holding = true;
        else if (G.holding && !G.botHeld) { G.holding = false; G.botHeld = true; }
        else if (G.jam <= 0) {
          const rush = !G.botJammed && G.open === 2;
          if (rush && G.jams > 0) G.botJammed = true;
          turn((rush ? 2.2 : 0.8) * Math.PI * 2 * dt);
        }
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      // circles around the middle of the screen turn the gear (either way round counts)
      const cx = innerWidth / 2, cy = innerHeight * 0.48, dx = ev.clientX - cx, dy = ev.clientY - cy;
      if (kind === 'down') { G.down = true; G.lastA = Math.hypot(dx, dy) > 24 ? Math.atan2(dy, dx) : null; return; }
      if (kind === 'up') { G.down = false; G.lastA = null; return; }
      if (kind !== 'move' || !G.down) return;
      if (Math.hypot(dx, dy) < 24) { G.lastA = null; return; }
      const a = Math.atan2(dy, dx);
      if (G.lastA !== null) { let d = a - G.lastA; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; turn(d); }
      G.lastA = a;
    },
    pause() { if (G) { G.paused = true; G.holding = false; G.band.pause(); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; if (!G.artist) G.band.resume(); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'bloom', phase: G.phase, playing: G.playing, over: G.over, open: G.open, wound: +G.wound.toFixed(2), jams: G.jams, speed: +G.speedK.toFixed(2), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
