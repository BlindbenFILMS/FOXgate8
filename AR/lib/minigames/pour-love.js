// POUR IN THE LOVE (Steven McCoy): POUR IN THE LOVE.
// "It was time to pull all the ugly out and start pouring in the love."
// A warm, slow soul groove plays. Drops of love form at the tip of the painting's molten drip and fall down the line of
// little dots into the black heart. Each drop lights the three dots on the way down, on the beat (you hear one, two,
// three), and lands in the heart on FOUR: tap then (the big POUR button, or anywhere on the screen). A caught drop bursts
// into a rainbow splash, a ring ripples out, and the colour comes back to one more ring of the heart, from the middle
// outward, while a kind thought replaces an ugly one ("I am enough."). A missed drop cools to grey and sinks.
// Catch 8 drops and the whole painting glows in full colour, the black heart fills with warm light that beats with the
// music, the band plays out, and Steven says it in his own words.
// Each ring adds a part to the band: bass, then shaker, then a sparkling melody.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './pour-things.js';

// Steven McCoy reading his quote, in his own voice
const ARTIST = new URL('../../../3D/gallery/audio/art_5.mp3', import.meta.url).href;

// the painting (1024 × 1024): the tip of the long drip, the dots it falls past, and the little flame in the heart's middle
const TIP = { u: 0.515, v: 0.312 };
const DOTS = [{ u: 0.508, v: 0.346 }, { u: 0.508, v: 0.417 }, { u: 0.508, v: 0.473 }, { u: 0.508, v: 0.532 }];
const LAND = { u: 0.508, v: 0.578 };
const HEART = { u: 0.508, v: 0.585 };                     // where the colour rings spread from
// where the drop is at each beat of its fall: released on 0, dots on 1, 2 and 3 (and the pink dot on 3.5), lands on 4
const PATH = [[0, TIP], [1, DOTS[0]], [2, DOTS[1]], [3, DOTS[2]], [3.5, DOTS[3]], [4, LAND]];
const GOAL = 8;
const WINDOW = 0.26;                                        // seconds either side of the landing that count as a catch
const BPM = [88, 88, 88, 88, 96, 96, 96, 96, 96];          // a little quicker after 4 rings
// a kind thought for each ring (said as it fills)
const THOUGHTS = ['I am enough.', 'I am loved.', 'I let the ugly go.', 'I am growing.', 'I am at peace.', 'I am grateful.', 'I am free.', 'I just am.'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, grey and dim outside the rings you've filled; full colour (and a little brighter) inside them
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform vec2 uC; uniform float uR, uPulse, uGlow, uA, uT;
void main(){
  vec3 col = texture2D(map, vUv).rgb;
  float d = length(vUv - uC);
  float inside = 1.0 - smoothstep(uR - 0.035, uR + 0.035, d);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 grey = vec3(l) * 0.42;
  vec3 warm = col * (1.0 + 0.12 * uGlow) + vec3(0.05, 0.03, 0.0) * uGlow;
  vec3 c = mix(grey, warm, inside);
  float edge = exp(-pow((d - uR) / 0.018, 2.0)) * uPulse;
  c += vec3(1.0, 0.85, 0.55) * edge * 0.6;
  c += vec3(0.02, 0.012, 0.0) * sin(uT * 0.9 + d * 40.0) * inside * uGlow;
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── the band: a slow soul groove that grows ring by ring ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
// four warm chords, one per bar: Cmaj7, Am9, Fmaj7, G9sus
const CHORDS = [[48, 55, 59, 64, 67], [45, 52, 55, 60, 64], [41, 48, 52, 57, 60], [43, 50, 53, 57, 62]];
const BASS = [36, 33, 29, 31];
const MELODY = [76, 79, 81, 79, 76, 74, 72, 74];
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mix = ac.createGain(); mix.gain.value = 1; mix.connect(out);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.008, p = 0, slide = 0, dest = mix } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.004 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, mix)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // an electric-piano chord: sine + soft triangle with a slow tremolo feel
  function keys(t, notes, dur, vol = 0.035) {
    notes.forEach((m, i) => { const p = (i - 2) * 0.18; tone(t + i * 0.012, midi(m), dur, { vol, att: 0.02, p }); tone(t + i * 0.012, midi(m + 12), dur * 0.6, { type: 'triangle', vol: vol * 0.25, att: 0.01, p }); });
  }
  let level = 0;
  return {
    start() { out.gain.setTargetAtTime(0.85, ac.currentTime, 0.4); },
    set level(n) { level = n; }, get level() { return level; },
    // one beat of the groove; b = beat number in the bar (0..3), bar = bar number, spb = seconds per beat
    beat(b, bar, spb) {
      const t = ac.currentTime + 0.01, ch = CHORDS[bar % 4];
      if (b === 0 || b === 2) { tone(t, 110, 0.28, { vol: 0.42, slide: 45 }); noise(t, 0.05, { freq: 160, type: 'lowpass', vol: 0.25 }); }   // kick
      if (b === 1 || b === 3) { noise(t, 0.12, { freq: 1800, q: 0.8, vol: 0.13 }); noise(t + 0.008, 0.06, { freq: 3200, q: 2, vol: 0.06 }); }   // finger snap
      if (b === 0) keys(t, ch, spb * 3.6);
      if (b === 2) keys(t + spb * 0.5, ch.slice(1), spb * 1.4, 0.022);
      if (level >= 2) { const m = BASS[bar % 4]; tone(t, midi(m), spb * 0.9, { type: 'triangle', vol: 0.16 }); if (b === 3) tone(t + spb * 0.5, midi(m + 7), spb * 0.4, { type: 'triangle', vol: 0.1 }); }
      if (level >= 4) { noise(t, 0.05, { freq: 7000, q: 1.5, vol: 0.05, p: 0.4 }); noise(t + spb * 0.5, 0.05, { freq: 7500, q: 1.5, vol: 0.035, p: 0.4 }); }   // shaker
      if (level >= 6) { const n = MELODY[(bar * 2 + (b >> 1)) % MELODY.length]; if (b % 2 === 0) tone(t + spb * 0.02, midi(n), spb * 1.6, { type: 'triangle', vol: 0.05, p: -0.3 }); }
    },
    // a drop lighting a dot on its way down (rising pitch: one, two, three)
    dot(n) { const t = ac.currentTime + 0.01, f = midi([72, 76, 79][n] || 79); tone(t, f, 0.25, { vol: 0.12 }); tone(t, f * 2, 0.12, { vol: 0.04 }); },
    // a new drop leaves the tip
    plip() { const t = ac.currentTime + 0.01; tone(t, 900, 0.12, { vol: 0.08, slide: 1600 }); },
    // the catch: a water bloop, a warm chord and a sparkle that climbs with every ring
    catch(n) {
      const t = ac.currentTime + 0.005;
      tone(t, 300, 0.18, { vol: 0.25, slide: 900 }); noise(t, 0.2, { freq: 2500, q: 2, vol: 0.12, sweep: 6000 });
      [0, 4, 7, 11].forEach((d, i) => tone(t + 0.02 + i * 0.05, midi(60 + d + n), 1.4, { type: 'triangle', vol: 0.06, p: (i - 1.5) * 0.3 }));
      for (let i = 0; i < 4; i++) tone(t + 0.25 + i * 0.07, midi(84 + [0, 4, 7, 12][i] + (n % 3) * 2), 0.3, { vol: 0.04, p: 0.5 - i * 0.3 });
    },
    early() { tone(ac.currentTime + 0.01, 420, 0.1, { type: 'square', vol: 0.03 }); },
    miss() { const t = ac.currentTime + 0.01; tone(t, 140, 0.5, { type: 'sawtooth', vol: 0.06, slide: 70 }); noise(t, 0.5, { freq: 500, q: 0.7, vol: 0.12, sweep: 200 }); },
    finale() { const t = ac.currentTime + 0.1; [48, 55, 60, 64, 67, 71, 74, 76, 79].forEach((m, i) => tone(t + i * 0.11, midi(m), 3.5, { type: 'triangle', vol: 0.05, att: 0.04, p: (i - 4) * 0.15 })); },
    quiet(v) { mix.gain.setTargetAtTime(v, ac.currentTime, 0.6); },
    // Steven is about to speak: fade every sound in the game to silence (and it stays silent while he talks)
    hush() { out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0, ac.currentTime, 0.35); },
    pause() { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); },
    resume() { out.gain.setTargetAtTime(0.85, ac.currentTime, 0.2); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} },
  };
}

export function pourLoveGame() {
  let G = null;
  const tex = {};
  const thingTex = (k) => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  const spb = () => 60 / G.bpm;
  // where a drop is, b beats after it left the tip
  function dropAt(b) {
    if (b <= 0) return TIP;
    for (let i = 1; i < PATH.length; i++) {
      if (b <= PATH[i][0]) { const [b0, a] = PATH[i - 1], [b1, c] = PATH[i], k = (b - b0) / (b1 - b0), e = k * k * (3 - 2 * k) * 0.5 + k * 0.5; return { u: a.u + (c.u - a.u) * e, v: a.v + (c.v - a.v) * e }; }
    }
    return LAND;
  }
  const radiusFor = n => 0.075 + n * 0.085;

  function hud() {
    const sub = G.over ? '' : G.caught >= GOAL ? 'Your heart is full!' : 'TAP on four, as each drop lands';
    G.ui.panel('Pour in the love', `${G.caught}<small>of ${GOAL} rings</small>`, { segs: [G.caught, GOAL], sub: sub + (G.missed ? ` · Missed ${G.missed}` : '') });
  }

  function newDrop(at) {
    const s = K.sprite(thingTex('drop'), 0.075, { order: 22, opacity: 0 }); s.position.z = 0.055; G.root.add(s);
    const halo = K.sprite(K.glowTex, 0.12, { color: '#ffb050', additive: true, opacity: 0, order: 21 }); halo.position.z = 0.052; G.root.add(halo);
    G.drops.push({ release: at, land: at + 4, state: 'fall', s, halo, t: 0, lit: 0 });
  }

  // a tap: the drop that is landing right now is caught
  function tap() {
    if (!G || !G.playing || G.over) return;
    const now = G.beat;
    let best = null, bestDt = 9;
    for (const d of G.drops) if (d.state === 'fall') { const dt = Math.abs(now - d.land) * spb(); if (dt < bestDt) { bestDt = dt; best = d; } }
    if (best && bestDt <= WINDOW) catchDrop(best, (now - best.land) * spb());
    else { G.band.early(); G.ui.pop('Wait for it…', innerWidth * 0.5, innerHeight * 0.6); G.early++; }
  }
  function catchDrop(d, off) {
    d.state = 'caught'; d.t = 0; G.caught++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
    if (Math.abs(off) < 0.08) G.perfect++;
    G.band.catch(G.caught - 1); G.band.level = G.caught; G.buzz([30, 30, 60]);
    const [x, y] = G.S.P(LAND.u, LAND.v);
    G.fx.add(x, y, '#ffd25a', 22, 0.4); G.fx.add(x, y, '#ff5a8a', 12, 0.3);
    const sp = K.sprite(thingTex('splash'), 0.16, { order: 26 }); sp.position.set(x, y + 0.02, 0.06); G.root.add(sp); G.fxs.push({ s: sp, t: 0, life: 0.6, grow: 0.25, kind: 'splash' });
    const wv = K.sprite(thingTex('wave'), 0.05, { order: 18, additive: true }); const [hx, hy] = G.S.P(HEART.u, HEART.v); wv.position.set(hx, hy, 0.045); G.root.add(wv);
    G.fxs.push({ s: wv, t: 0, life: 1.1, to: Math.min(1.0, radiusFor(G.caught) * 2.5), kind: 'wave' });   // (kept inside the painting)
    G.R.to = radiusFor(G.caught); G.pulse = 1;
    G.ui.pop(Math.abs(off) < 0.08 ? 'Perfect!' : '+1', innerWidth * 0.5, innerHeight * 0.55);
    G.say(THOUGHTS[G.caught - 1] + (G.caught === 4 ? ' A little faster now.' : ''));
    G.ui.alert(THOUGHTS[G.caught - 1].replace('.', ''), G.caught < GOAL ? `${GOAL - G.caught} more to go` : 'Your heart is full!', 1.6, 'blue');
    hud();
    if (G.caught >= GOAL) { G.phase = 'full'; G.phT = 0; for (const o of G.drops) if (o.state === 'fall') { o.state = 'gone'; o.t = 0; } }
  }
  function missDrop(d) {
    d.state = 'missed'; d.t = 0; G.missed++; G.streak = 0; G.band.miss(); G.buzz(80);
    const [x, y] = G.S.P(LAND.u, LAND.v); G.fx.add(x, y, '#8a8580', 10, 0.2);
    // a gentle reminder the first few times (not every time)
    if (G.t - G.hintT > 9 && G.missed <= 4) { G.hintT = G.t; G.say(G.missed % 2 ? 'Tap just as it lands in the heart.' : 'Count with the dots. One, two, three, tap!'); }
    hud();
  }

  return {
    title: 'Pour in the love',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, beat: 0, lastBeat: -1, bpm: BPM[0], caught: 0, missed: 0, early: 0, perfect: 0, streak: 0, bestStreak: 0, drops: [], fxs: [], nextRelease: 0,
        R: { now: radiusFor(0), to: radiusFor(0) }, pulse: 0, glow: 0, beatEnv: 0, hintT: -99, endT: 0, artist: null, dotFlash: [0, 0, 0, 0], botMissed: false, botEarly: false });
      G.band = band(K.audio());
      // the painting, grey outside the rings you've filled
      G.uni = { map: { value: null }, uC: { value: new THREE.Vector2(HEART.u, 1 - HEART.v) }, uR: { value: G.R.now }, uPulse: { value: 0 }, uGlow: { value: 0 }, uA: { value: 0 }, uT: { value: 0 } };
      G.art = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.art.renderOrder = 11; G.art.position.z = 0.03; G.root.add(G.art);
      new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.artOK = true; });
      // the heart's warm light (grows with every ring, beats with the music)
      G.heartGlow = K.sprite(thingTex('heartglow'), 0.5, { order: 16, additive: true, opacity: 0 }); const [hx, hy] = G.S.P(0.508, 0.6); G.heartGlow.position.set(hx, hy, 0.04); G.root.add(G.heartGlow);
      // the dots light up as each drop passes; the landing spot glows on four
      G.dotGlows = DOTS.map(p => { const s = K.sprite(K.glowTex, 0.07, { color: '#ffe0a0', additive: true, opacity: 0, order: 20 }); const [x, y] = G.S.P(p.u, p.v); s.position.set(x, y, 0.05); G.root.add(s); return s; });
      G.target = K.sprite(thingTex('target'), 0.09, { opacity: 0, order: 20 }); const [lx, ly] = G.S.P(LAND.u, LAND.v); G.target.position.set(lx, ly, 0.05); G.root.add(G.target);
      G.btns = G.ui.buttons([{ label: 'Pour', icon: '▼', kind: 'red', aria: 'Pour. Tap as each drop lands in the heart.', press: () => tap() }]);
      hud();
      G.onGo = () => { G.phase = 'play'; G.phT = 0; G.beat = -0.001; G.lastBeat = -1; newDrop(0); };
      K.intro(G, { title: 'Pour in the love',
        how: 'Drops of love fall into the heart. Each one lights 3 dots on the way down: one, two, three. TAP on four, just as it lands. Catch 8 to fill the heart.',
        say: 'Pour in the love. Steven had to pull all the ugly out of his thoughts, and pour in the love. Drops of love fall down into the heart. Each drop lights three dots on the way down. One, two, three. Tap on four, just as it lands. Catch 8 drops to fill the heart. Here comes the first one.' });
      G.band.start();
      // stop Steven's clip if the player opens his story video
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      G.uni.uA.value += ((G.artOK ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);

      // the finale: wait for the end line, then Steven speaks and the band goes soft under him
      if (G.over && !G.artist) {
        G.endT += dt;
        if (G.endT > 3.3) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); }
      }

      // ── the groove clock ──
      if (G.phase === 'play' || G.phase === 'full') {
        G.beat += dt * G.bpm / 60;
        const whole = Math.floor(G.beat);
        while (G.lastBeat < whole) {
          G.lastBeat++;
          const b = ((G.lastBeat % 4) + 4) % 4, bar = Math.floor(G.lastBeat / 4);
          if (G.lastBeat >= 0) G.band.beat(b, bar, 60 / G.bpm);
          G.beatEnv = 1;
          if (G.phase === 'play') {
            // each falling drop lights its dot on 1, 2 and 3
            for (const d of G.drops) if (d.state === 'fall') { const k = G.lastBeat - d.release; if (k >= 1 && k <= 3) { G.band.dot(k - 1); G.dotFlash[k - 1] = 1; } }
            // a new drop leaves the tip every bar, and the tempo can lift at the start of a bar
            if (b === 0 && G.lastBeat > 0) { G.bpm = BPM[Math.min(BPM.length - 1, G.caught)]; newDrop(G.lastBeat); G.band.plip(); }
          }
        }
        // the pink dot lights halfway through beat 3, just before it lands
        for (const d of G.drops) if (d.state === 'fall' && G.beat - d.release >= 3.5 && d.lit < 4) { d.lit = 4; G.dotFlash[3] = 1; }
        // a drop that lands and isn't caught in time
        for (const d of G.drops) if (d.state === 'fall' && (G.beat - d.land) * spb() > WINDOW) missDrop(d);
      }
      G.beatEnv = Math.max(0, G.beatEnv - dt * 4);

      // ── drops ──
      for (let i = G.drops.length - 1; i >= 0; i--) {
        const d = G.drops[i], b = G.beat - d.release;
        let a = 0, size = 0.075;
        if (d.state === 'fall') {
          const p = dropAt(b), [x, y] = G.S.P(p.u, p.v);
          // it swells at the tip during the beat before it falls
          const grow = b < 0 ? Math.max(0, 1 + b) : 1;
          a = b < -1 ? 0 : 1; size = 0.03 + 0.045 * grow;
          d.s.position.set(x, y + (b < 0 ? -0.01 * grow : 0), 0.055);
          d.s.material.rotation = b > 0 ? Math.sin(G.t * 9) * 0.06 : 0;
          d.halo.position.set(x, y, 0.052);
        } else if (d.state === 'caught' || d.state === 'gone') {
          d.t += dt; a = Math.max(0, 1 - d.t * 6); size = 0.075 * (1 + d.t * 2);
        } else if (d.state === 'missed') {
          d.t += dt; a = Math.max(0, 1 - d.t * 0.9); size = 0.06;
          if (d.t < 0.05) d.s.material.map = thingTex('grey');
          d.s.position.y -= dt * 0.03;
        }
        d.s.scale.setScalar(size); d.s.material.opacity = a;
        d.halo.scale.setScalar(size * 1.8); d.halo.material.opacity = a * (d.state === 'fall' ? 0.6 : 0.2);
        if (d.state !== 'fall' && a <= 0) { G.root.remove(d.s); G.root.remove(d.halo); d.s.material.dispose(); d.halo.material.dispose(); G.drops.splice(i, 1); }
      }

      // ── splashes and ring ripples ──
      for (let i = G.fxs.length - 1; i >= 0; i--) {
        const f = G.fxs[i]; f.t += dt; const k = f.t / f.life;
        if (f.kind === 'wave') { f.s.scale.setScalar(0.05 + (f.to - 0.05) * (1 - Math.pow(1 - k, 3))); f.s.material.opacity = Math.max(0, 1 - k); }
        else { f.s.scale.setScalar(0.16 + f.grow * k); f.s.material.opacity = Math.max(0, 1 - k * k); }
        if (k >= 1) { G.root.remove(f.s); f.s.material.dispose(); G.fxs.splice(i, 1); }
      }

      // ── the heart: colour rings, the warm light inside, the glowing dots and target ──
      G.R.now += (G.R.to - G.R.now) * Math.min(1, dt * 2.2); G.uni.uR.value = G.R.now;
      G.pulse = Math.max(0, G.pulse - dt * 0.8); G.uni.uPulse.value = Math.max(G.pulse, G.beatEnv * 0.25 * (G.phase === 'play' ? 1 : 0));
      const glowTo = G.over ? 1 : G.caught / GOAL * 0.6;
      G.glow += (glowTo - G.glow) * Math.min(1, dt * 1.5); G.uni.uGlow.value = G.glow;
      G.heartGlow.material.opacity = Math.min(1, G.glow * 0.9 + (G.over ? 0.1 : 0)) * (0.75 + 0.25 * G.beatEnv);
      G.heartGlow.scale.setScalar(0.5 * (1 + G.beatEnv * 0.05 * (G.over ? 1.6 : 1)));
      for (let i = 0; i < 4; i++) { G.dotFlash[i] = Math.max(0, G.dotFlash[i] - dt * 2.5); G.dotGlows[i].material.opacity = G.dotFlash[i] * 0.95; G.dotGlows[i].scale.setScalar(0.05 + G.dotFlash[i] * 0.04); }
      // the landing ring brightens as a drop gets close to four
      let near = 0; for (const d of G.drops) if (d.state === 'fall') near = Math.max(near, 1 - Math.min(1, Math.abs(G.beat - d.land) / 1.2));
      G.target.material.opacity += (((G.phase === 'play') ? 0.25 + near * 0.75 : 0) - G.target.material.opacity) * Math.min(1, dt * 8);
      G.target.scale.setScalar(0.07 + near * 0.03);

      // ── full: one bar of glory, then the finale ──
      if (G.phase === 'full' && G.phT > 1.6 && !G.over) {
        G.R.to = 1.25; G.band.finale(); G.band.level = 8;
        const r = K.best('pour-in-the-love:pour', G.missed, 'lower');
        K.finale(G, { won: true, kicker: 'Pour in the love', title: 'Your heart is full', line: G.work && G.work.quote, best: r.isBest,
          say: 'Your heart is full of love.',
          cells: [{ k: 'Caught', v: G.caught }, { k: 'Perfect', v: G.perfect }, { k: 'Missed', v: G.missed }] });
        G.endT = 0;
      }
      if (G.over && G.phase === 'full' && !G.artist) {   // the music keeps going under the end panel until Steven speaks
        G.beat += dt * G.bpm / 60; const whole = Math.floor(G.beat);
        while (G.lastBeat < whole) { G.lastBeat++; G.band.beat(((G.lastBeat % 4) + 4) % 4, Math.floor(G.lastBeat / 4), 60 / G.bpm); G.beatEnv = 1; }
      }

      // ── the robot: taps on four (a little early or late), misses one drop and taps too soon once, to test those ──
      if (G.bot && G.playing && !G.over && G.phase === 'play') {
        for (const d of G.drops) {
          if (d.state !== 'fall' || d.botDone) continue;
          if (!G.botEarly && G.caught === 1 && G.beat - d.release > 2) { G.botEarly = true; tap(); }
          if (!G.botMissed && G.caught === 2) { if (G.beat > d.land) { d.botDone = true; G.botMissed = true; } continue; }
          if (!d.off) d.off = (Math.random() - 0.5) * 0.18;
          if ((G.beat - d.land) * spb() >= d.off) { d.botDone = true; tap(); }
        }
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'down') tap();
    },
    pause() { if (G) { G.paused = true; G.band.pause(); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; if (!G.artist) G.band.resume(); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'pour', phase: G.phase, playing: G.playing, over: G.over, caught: G.caught, missed: G.missed, early: G.early, perfect: G.perfect, beat: +G.beat.toFixed(2), bpm: G.bpm, artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
