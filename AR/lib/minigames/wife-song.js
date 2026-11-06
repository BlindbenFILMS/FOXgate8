// SEEING THE WORLD TOGETHER (Ricky Ruzicka): OUR SONG.
// "She is my eyes and I help her out in the ways that I do. But we both get to see the world together."
// A Simon Says duet over a slow sunset groove. There are three notes: LOW (heard on the left), MIDDLE (in the middle)
// and HIGH (on the right), each with its own glowing pad at the bottom of the painting. She sings a little tune of them
// (notes float up from her in the colour of each pad, and the pads light up); then it's your turn: play the same notes back in the same
// order (three big buttons, or that third of the screen) and Ricky sings them with her (his notes rise from him, in the same colours).
// Each new tune is her last one with one more note added, from 2 notes up to 6. Get it all right and part of the
// future city lights up: the tower, the skyline, the sky ship, the water, the domes, the ringed planet, the bridge,
// the garden. The gold light between their hands grows with every tune. Miss a note and she simply sings it again.
// After 8 tunes the whole sunset sings, the painting comes alive and Ricky says it himself.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './wife-things.js';

// Ricky in his own words (the 3D gallery's clip for this painting), played at the finale
const ARTIST = new URL('../../../3D/gallery/audio/art_34.mp3', import.meta.url).href;
// Ricky's quote (artworks.js doesn't have it yet; the main chat adds it at merge time)
const QUOTE = '“My wife and I have been married for eight years. The blindness journey with her has been nothing but amazing because she is my eyes and I help her out in the ways that I do. But we both get to see the world together and I am grateful for it.” — Ricky Ruzicka';

const TUNES = 8, LENS = [2, 3, 3, 4, 4, 5, 5, 6];                 // how many notes each tune has (each is the last one, plus a note)
const BPM = 88, BEAT = 60 / BPM, BAR = BEAT * 4, GAP = 0.66, IDLE = 7;   // the groove; time between her notes; wait before she sings it again
const LANES = ['Low', 'Middle', 'High'], PAD_U = [0.2, 0.5, 0.8], PAD_V = 0.86;
const PAD_COL = ['#ff6f91', '#ffd36a', '#5fe8ff'];                // low coral-pink, middle gold, high cyan (also darker → lighter)
const HER = { u: 0.26, v: 0.44 }, HIM = { u: 0.355, v: 0.44 }, HANDS = { u: 0.31, v: 0.64 };
// the parts of the future city that light up, one per tune (u, v of the 512 × 512 painting, how big, how many twinkles)
const PLACES = [
  { name: 'tower', u: 0.66, v: 0.3, r: 0.07, n: 6 }, { name: 'skyline', u: 0.8, v: 0.47, r: 0.09, n: 8 }, { name: 'ship', u: 0.43, v: 0.235, r: 0.06, n: 1, ship: true },
  { name: 'water', u: 0.56, v: 0.7, r: 0.1, n: 7 }, { name: 'domes', u: 0.88, v: 0.56, r: 0.08, n: 6 }, { name: 'planet', u: 0.54, v: 0.085, r: 0.06, n: 4 },
  { name: 'bridge', u: 0.5, v: 0.62, r: 0.08, n: 6 }, { name: 'garden', u: 0.86, v: 0.7, r: 0.09, n: 8 },
];
const NICE = ['Beautiful!', 'Together!', 'The city lights up!', 'Halfway there!', 'Beautiful!', 'Together!', 'Last tune!', 'Our song is complete!'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting at dusk: it starts dim and violet, and warms back to its full sunset glow as the song is played
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uDusk, uPulse, uA, uT;
void main(){
  vec3 c = texture2D(map, vUv).rgb;
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  vec3 dusk = mix(vec3(lum), c, 0.7) * vec3(0.48, 0.42, 0.7);
  c = mix(c, dusk, uDusk);
  c *= 1.0 + 0.08 * uPulse;
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── the band: a slow sunset groove, her notes, his notes ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0.8; mus.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest = out) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.004, dest = out } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, dest = out, det = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det; if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.05);
  }
  // F major: Fmaj7 – Dm7 – Bbmaj7 – C (one chord a bar), a soft bed under the duet
  const CH = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 60]];
  const NOTE = [65, 72, 77], PAN = [-0.8, 0, 0.8];
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.4); },
    mute(m) { out.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.1); },
    quiet(v) { mus.gain.setTargetAtTime(v, ac.currentTime, 0.5); },
    // one bar of the groove, starting at time t (bar n picks the chord); full = the snare and bass join
    bar(t, n, full) {
      const ch = CH[n % 4];
      ch.forEach((m, i) => { tone(t, midi(m), BAR * 1.05, { type: 'sawtooth', vol: 0.01, att: 0.5, det: i % 2 ? 7 : -7, dest: mus }); tone(t, midi(m), BAR, { type: 'triangle', vol: 0.016, att: 0.4, dest: mus }); });
      tone(t, midi(ch[0] - 12), BAR * 0.9, { vol: full ? 0.1 : 0.06, att: 0.05, dest: mus });
      for (let b = 0; b < 4; b++) {
        const bt = t + b * BEAT;
        if (b % 2 === 0) tone(bt, 110, 0.2, { vol: 0.2, slide: 42, dest: mus });
        else tone(bt, 90, 0.12, { vol: 0.1, slide: 45, dest: mus });
        if (full && b % 2 === 1) noise(bt, 0.18, { freq: 1700, q: 0.7, vol: 0.12, dest: mus });
        noise(bt, 0.03, { freq: 8000, type: 'highpass', vol: 0.035, dest: mus }); noise(bt + BEAT / 2, 0.025, { freq: 8000, type: 'highpass', vol: 0.02, dest: mus });
      }
    },
    // the three notes: LOW (F, heard on the left), MIDDLE (C, in the middle), HIGH (high F, on the right).
    // She sings them warm and round; Ricky answers with the same note, brighter, with a soft harmony under it.
    her(t, lane) { const f = midi(NOTE[lane]), p = PAN[lane]; tone(t, f, 0.75, { type: 'triangle', vol: 0.15, att: 0.012, p }); tone(t, f * 2, 0.35, { vol: 0.03, p, att: 0.01 }); },
    his(lane) { const t = ac.currentTime + 0.005, f = midi(NOTE[lane]), p = PAN[lane]; tone(t, f, 0.75, { type: 'square', vol: 0.04, att: 0.008, p }); tone(t, f, 0.75, { type: 'triangle', vol: 0.11, att: 0.008, p }); tone(t, midi(NOTE[lane] - 4), 0.75, { type: 'triangle', vol: 0.04, att: 0.02, p }); },
    wrong(lane) { const t = ac.currentTime + 0.005; tone(t, 140, 0.4, { type: 'sawtooth', vol: 0.06, slide: 90, p: PAN[lane] }); },
    yes(t, n) { [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.08, midi(72 + d + (n % 3) * 2), 0.9, { type: 'triangle', vol: 0.05, att: 0.01 })); noise(t, 0.9, { freq: 6000, type: 'highpass', vol: 0.03, att: 0.3 }); },
    again(t) { [0, -3].forEach((d, i) => tone(t + i * 0.16, midi(69 + d), 0.4, { type: 'triangle', vol: 0.05 })); },
    finale(t) { [65, 69, 72, 76, 77, 81, 84].forEach((m, i) => { tone(t + i * 0.12, midi(m), 2.2, { type: 'triangle', vol: 0.05, att: 0.02, p: -0.5 }); tone(t + i * 0.12 + 0.06, midi(m - 4), 2.2, { type: 'triangle', vol: 0.04, att: 0.02, p: 0.5 }); }); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} },
  };
}

export function wifeSongGame() {
  let G = null;
  const tex = {};
  const T = k => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  const now = () => G.ac.currentTime;

  function hud() {
    const y = G.phase === 'you';   // on your turn the panel turns red, so it's clear at a glance
    G.ui.panel(y ? 'Your turn!' : 'Our song', `${G.done}<small>of ${TUNES} tunes</small>`, { segs: [G.done, TUNES], warn: y,
      sub: y ? `Play her ${LENS[G.done]} notes back: ${G.got} of ${LENS[G.done]}` : 'Listen to her tune… LOW · MIDDLE · HIGH' });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; hud(); }
  // a note floats up from her or from him, in the colour of the note's pad (low coral, middle gold, high cyan)
  function note(who, lane) {
    const at = who === 'her' ? HER : HIM, [x, y] = G.S.P(at.u, at.v), s = K.sprite(T('note'), 0.14, { order: 30, color: PAD_COL[lane] });
    s.position.set(x, y, 0.07); G.root.add(s);
    G.floats.push({ s, t: 0, life: 2, vx: (who === 'her' ? -0.03 : 0.05) + (Math.random() - 0.5) * 0.03, vy: 0.11, size: 0.14, spin: (Math.random() - 0.5) * 0.6 });
  }
  function lightPad(lane, k = 1) { G.pads[lane].k = Math.max(G.pads[lane].k, k); }
  // light up one part of the city
  function light(i) {
    const P = PLACES[i];
    for (let j = 0; j < P.n; j++) {
      const a = (j / P.n) * Math.PI * 2 + i, d = P.n === 1 ? 0 : P.r * (0.35 + ((j * 7) % 5) / 8);
      const [x, y] = G.S.P(P.u + Math.cos(a) * d, P.v + Math.sin(a) * d * 0.8);
      const s = K.sprite(T(P.ship ? 'ship' : 'light'), P.ship ? 0.14 : 0.035 + ((j * 3) % 4) * 0.01, { order: 26, opacity: 0, additive: !P.ship }); s.position.set(x, y, 0.06); G.root.add(s);
      G.twinkles.push({ s, base: s.scale.x, ph: Math.random() * 6, t: -j * 0.08, ship: !!P.ship, x, y });
    }
    const [gx, gy] = G.S.P(P.u, P.v), glow = K.sprite(K.glowTex, P.r * 3.2, { color: '#ffcf7a', additive: true, opacity: 0, order: 24 }); glow.position.set(gx, gy, 0.055); G.root.add(glow);
    G.glows.push({ s: glow, t: 0 }); G.fx.add(gx, gy, '#ffd36a', 16, 0.3);
  }

  // she sings the current tune: each note on its pad, from its side
  function sing(again = false) {
    const n = LENS[G.done], t0 = now() + 0.15; G.got = 0; G.idle = 0;
    for (let k = 0; k < n; k++) { const lane = G.melody[k]; G.band.her(t0 + k * GAP, lane); G.events.push({ t: t0 + k * GAP, lane }); }
    G.singEnd = t0 + (n - 1) * GAP + 0.5;
    setPhase('her');
  }
  function press(lane) {
    if (!G || !G.playing || G.over || G.phase !== 'you') return;
    G.idle = 0; lightPad(lane, 1.3); G.buzz(15);
    const want = G.melody[G.got];
    if (lane === want) {
      G.band.his(lane); note('his', lane); G.pulse = 1; G.got++; hud();
      if (G.got >= LENS[G.done]) {
        G.done++; light(G.done - 1); G.gold = Math.min(1, G.done / TUNES); G.band.yes(now() + 0.35, G.done); G.buzz([30, 30, 60]);
        const [hx, hy] = G.S.P(HANDS.u, HANDS.v), h = K.sprite(T('heart'), 0.1, { order: 32 }); h.position.set(hx, hy, 0.08); G.root.add(h); G.floats.push({ s: h, t: 0, life: 2.4, vx: 0, vy: 0.09, size: 0.12, spin: 0 });
        const longer = G.done < TUNES && LENS[G.done] > LENS[G.done - 1];
        G.say(NICE[G.done - 1] + (longer ? ' One more note.' : '')); G.ui.pop('TOGETHER!');
        setPhase(G.done >= TUNES ? 'end' : 'yes');
        if (G.done >= TUNES) { G.ui.alert('OUR SONG!', 'The whole city is lit up.', 3, 'red'); G.band.finale(now() + 1.2); }
      }
    } else {
      G.misses++; G.band.wrong(lane); G.band.again(now() + 0.3); G.say('Try again with her.'); setPhase('miss');
    }
  }

  return {
    title: 'Our song',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.ac = K.audio();
      // her melody: 6 notes, no note three times in a row, the first two different
      const mel = []; while (mel.length < 6) { const l = Math.floor(Math.random() * 3); if (mel.length === 1 && l === mel[0]) continue; if (mel.length >= 2 && l === mel[mel.length - 1] && l === mel[mel.length - 2]) continue; mel.push(l); }
      Object.assign(G, { melody: mel, phase: 'intro', phT: 0, events: [], floats: [], twinkles: [], glows: [], done: 0, got: 0, misses: 0, idle: 0, singEnd: 0, nextBar: 0, barN: 0,
        gold: 0, goldShow: 0, pulse: 0, dusk: 1, endT: 0, artist: null, told: 0 });
      G.band = band(G.ac);
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the painting at dusk
      G.uni = { map: { value: null }, uDusk: { value: 1 }, uPulse: { value: 0 }, uA: { value: 0 }, uT: { value: 0 } };
      G.art = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.art.renderOrder = 11; G.art.position.z = 0.02; G.root.add(G.art);
      new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.artOK = true; });
      // the three note pads along the bottom, and a glow behind each that flares when it sings
      G.pads = [0, 1, 2].map(lane => {
        const [x, y] = G.S.P(PAD_U[lane], PAD_V);
        const glow = K.sprite(K.glowTex, 0.3, { color: PAD_COL[lane], additive: true, opacity: 0, order: 27 }); glow.position.set(x, y, 0.06); G.root.add(glow);
        const s = K.sprite(T('pad'), 0.2, { color: PAD_COL[lane], order: 29, opacity: 0 }); s.position.set(x, y, 0.065); G.root.add(s);
        return { s, glow, k: 0 };
      });
      { const [x, y] = G.S.P(HANDS.u, HANDS.v); G.goldS = K.sprite(K.glowTex, 0.1, { color: '#ffd36a', additive: true, opacity: 0, order: 27 }); G.goldS.position.set(x, y, 0.06); G.root.add(G.goldS); }
      G.ui.buttons([
        { label: 'Low', icon: '◀', kind: 'red', aria: 'Low note, on the left', press: () => press(0) },
        { label: 'Middle', icon: '●', kind: 'red', aria: 'Middle note', press: () => press(1) },
        { label: 'High', icon: '▶', kind: 'red', aria: 'High note, on the right', press: () => press(2) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.nextBar = now() + 0.1; G.say('Listen to her.'); setPhase('wait'); };
      K.intro(G, { title: 'Our song',
        how: 'She sings a little tune of LOW, MIDDLE and HIGH notes. Then it’s your turn: play them back in the same order. Each tune gets one note longer, and every tune you finish lights up the city. 8 tunes.',
        say: 'Our song. She sings a little tune of low, middle and high notes. Then it’s your turn. Play them back in the same order. Each tune gets one note longer, and every tune you finish lights up the city. Eight tunes.' });
      G.band.start();
      // let her play the three notes once during the intro, so you know them: low, middle, high
      [0, 1, 2].forEach(l => { const t = now() + 0.6 + l * 0.5; G.band.her(t, l); G.events.push({ t, lane: l, intro: true }); });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.quiet(0.25); } }
      // the groove, one bar at a time, under everything
      if (G.nextBar && now() > G.nextBar - 0.15 && !G.over) { G.band.bar(G.nextBar, G.barN++, G.phase === 'yes' || G.phase === 'end'); G.nextBar += BAR; }
      // her notes, as they sound: the pad lights and a pink note floats up from her
      for (let i = G.events.length - 1; i >= 0; i--) {
        const e = G.events[i]; if (now() < e.t) continue; G.events.splice(i, 1);
        lightPad(e.lane, 1); if (!e.intro) note('her', e.lane); G.pulse = 0.6;
      }
      const ph = G.phase;
      if (ph === 'wait' && G.phT > 1.6) sing();
      else if (ph === 'her' && now() > G.singEnd) { setPhase('you'); if (G.told < 2) { G.told++; G.say('Your turn.'); } }
      else if (ph === 'you') { G.idle += dt; if (G.idle > IDLE) { G.say('Listen again.'); G.melodyAgain = true; setPhase('wait2'); } }
      else if (ph === 'wait2' && G.phT > 1.4) sing(true);
      else if (ph === 'miss' && G.phT > 2.2) sing(true);
      else if (ph === 'yes' && G.phT > 2.6) sing();
      else if (ph === 'end' && G.phT > 3.4 && !G.over) {
        G.say('You saw the world together!');
        const r = K.best('seeing-the-world-together:misses', G.misses, 'lower');
        setTimeout(() => { if (!G || G.over) return;
          K.finale(G, { won: true, kicker: 'Seeing the world together', title: 'Our song', line: G.work.quote || QUOTE, best: r.isBest, say: 'You made it together!',
            cells: [{ k: 'Tunes', v: G.done }, { k: 'Tries again', v: G.misses }, { k: 'City lights', v: PLACES.length }] }); }, 2200);
        G.phase = 'ending';
      }

      // the pads, the gold between their hands, the dusk lifting
      G.pads.forEach((p, lane) => {
        p.k = Math.max(0, p.k - dt * 2.4); const a = G.uni.uA.value * (G.over && G.endT > 1.2 ? Math.max(0, 1 - (G.endT - 1.2)) : 1);
        p.s.material.opacity = a * (0.75 + 0.25 * Math.min(1, p.k)); p.s.scale.setScalar(0.2 * (1 + 0.18 * Math.min(1.3, p.k)) + Math.sin(G.t * 2 + lane) * 0.003);
        p.glow.material.opacity = a * Math.min(1, p.k) * 0.9; p.glow.scale.setScalar(0.24 + 0.12 * p.k);
      });
      G.goldShow += (G.gold - G.goldShow) * Math.min(1, dt * 2);
      G.goldS.scale.setScalar(0.06 + 0.16 * G.goldShow + Math.sin(G.t * 3) * 0.01); G.goldS.material.opacity = (0.15 + 0.8 * G.goldShow) * G.uni.uA.value;
      G.dusk += ((ph === 'end' || ph === 'ending' || G.over ? 0 : 1 - G.done / TUNES * 0.75) - G.dusk) * Math.min(1, dt * 1.2); G.uni.uDusk.value = G.dusk;
      G.pulse = Math.max(0, G.pulse - dt * 3); G.uni.uPulse.value = G.pulse; G.uni.uT.value = G.t;
      G.uni.uA.value += ((G.artOK && !(G.over && G.endT > 1.2) ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      for (let i = G.floats.length - 1; i >= 0; i--) {
        const f = G.floats[i]; f.t += dt; f.s.position.x += f.vx * dt + Math.sin(f.t * 3) * 0.0008; f.s.position.y += f.vy * dt; f.s.material.rotation = Math.sin(f.t * 2) * 0.2 + f.spin * f.t;
        f.s.scale.setScalar(f.size * Math.min(1, f.t * 6)); f.s.material.opacity = Math.max(0, 1 - Math.max(0, f.t - f.life * 0.55) / (f.life * 0.45));
        if (f.t >= f.life) { G.root.remove(f.s); f.s.material.dispose(); G.floats.splice(i, 1); }
      }
      for (const w of G.twinkles) { w.t += dt; const on = Math.min(1, Math.max(0, w.t * 2)); w.s.material.opacity = on * (w.ship ? 1 : 0.65 + 0.35 * Math.sin(G.t * 3 + w.ph)) * (G.over && G.endT > 1.2 ? Math.max(0, 1 - (G.endT - 1.2)) : 1);
        w.s.scale.setScalar(w.base * (0.85 + 0.25 * Math.sin(G.t * 2.4 + w.ph))); if (w.ship) w.s.position.set(w.x + Math.sin(G.t * 0.7) * 0.02, w.y + Math.sin(G.t * 1.3) * 0.006, 0.06); }
      for (const g of G.glows) { g.t += dt; g.s.material.opacity = Math.min(0.5, g.t * 0.6) * (0.8 + 0.2 * Math.sin(G.t * 1.5)) * G.uni.uA.value; }

      // the robot: plays her tune back, a note every half second; on the third tune it presses a wrong note once
      if (G.bot && G.playing && ph === 'you') {
        G.botT = (G.botT || 0) + dt;
        if (G.botT > 0.5) { G.botT = 0; const want = G.melody[G.got]; if (G.done === 2 && !G.botMissed) { G.botMissed = true; press((want + 1) % 3); } else press(want); }
      }
    },
    pointer(kind, ev) { if (kind === 'down' && G && !G.paused) press(G.S.screenThird(ev) + 1); },
    pause() { if (G) { G.paused = true; G.band.mute(true); if (G.artist) G.artist.pause(); } },
    resume() {
      if (!G) return; G.paused = false; G.band.mute(false);
      if (G.artist && G.over) G.artist.play().catch(() => {});
      // pick the song up again: the groove restarts, and if she was singing she starts the tune again
      if (G.nextBar) G.nextBar = now() + 0.2;
      if (G.phase === 'her' || G.phase === 'you') { G.events.length = 0; setPhase('wait2'); }
    },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'wife-song', playing: G.playing, over: G.over, phase: G.phase, done: G.done, got: G.got, misses: G.misses, melody: G.melody.join(''), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.artist && G.artist.pause(); } catch (e) {} G.artist = null; try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
