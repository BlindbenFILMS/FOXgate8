// FELLOWSHIP (Nikki Jeffords): PASS IT ON.
// "There is a sacred brotherhood, sisterhood in the blind community." A warm glow, like a squeeze of the hand, travels
// around the circle of people in the painting on a gentle, steady beat. The painting starts faded to soft gray. When
// the glow lands on the next friend, they light up and a bell rings from their side. Tap PASS (or anywhere on the
// painting) on that beat to pass it on: that friend's colour comes back, and their note joins the groove. Too early
// or too late is never punished: the glow just waits, and the bell rings again on the next beat. Two laps around the
// circle (16 passes); the groove grows a little each lap. Then everyone glows: "Everyone has someone."
// Then Nikki's own words.
import * as THREE from 'three';
import * as K from './kit.js';
import { RING, orbTex, pulseTex, spotTex } from './fellowship-pass-things.js';

const BPM = 72, BEAT = 60 / BPM;
const LAPS = 2, PASSES = RING.length * LAPS;
const AFTER = 0.38, BEFORE = 0.2;          // how close to the bell a tap counts (seconds after it / before the next one)
const CLIP = new URL('../../../3D/gallery/audio/wing_5_0.mp3', import.meta.url).href;   // Nikki's own words
const CLIP2 = new URL('../../media/clips/fellowship.mp4', import.meta.url).href;      // backup: the sound of her statement video
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting faded to soft gray, except around friends the glow has reached (soft breathing circles of colour);
// a warm light follows the glow; at the end everything returns to colour and glows
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uH, uAll, uGlow, uOrbA;
uniform vec2 uOrb;
uniform vec3 uHome[8];
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = texture2D(map, vUv).rgb;
  float k = uAll;
  for (int i = 0; i < 8; i++) {
    vec3 h = uHome[i];
    float r = 0.17 + 0.012 * sin(uT * 1.3 + float(i));
    float d = length((p - h.xy) * vec2(1.0, uH));
    k = max(k, h.z * (1.0 - smoothstep(r * 0.5, r, d)));
  }
  float od = length((p - uOrb) * vec2(1.0, uH));
  float warm = exp(-od * 9.0) * uOrbA;
  k = max(k, warm * 0.55);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 faded = mix(vec3(l), vec3(0.9, 0.88, 0.84), 0.5);
  vec3 c = mix(faded, col, k);
  c += vec3(1.0, 0.78, 0.5) * (warm * 0.22 + uGlow * 0.18 * (0.7 + 0.3 * sin(uT * 2.0)));
  gl_FragColor = vec4(c, uA);
}`;

/* ───────── the groove: a heartbeat, a pad, and more each lap; the friends' notes join as they're passed ───────── */
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, dest = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 6000, q = 1, vol = 0.05, dest = bus, p = 0, type = 'highpass' } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  const CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]];   // D · Bm · G · A
  const BASS = [38, 35, 31, 33];
  let notes = [], level = 0, held = false;
  return {
    start() { bus.gain.setTargetAtTime(0.9, ac.currentTime, 0.8); },
    level(v) { level = v; },
    // one beat of the groove (n = beat number); the heartbeat always, more instruments as the circle warms up
    beat(n) {
      if (held) return;
      const t = ac.currentTime + 0.01, bar = Math.floor(n / 4) % 4, b = n % 4;
      tone(t, 70, 0.28, { vol: 0.2, att: 0.004, slide: 45 }); tone(t + 0.2, 64, 0.22, { vol: 0.08, att: 0.004, slide: 42 });   // lub-dub
      if (b === 0) CH[bar].forEach((m, i) => tone(t + i * 0.04, midi(m), BEAT * 4.2, { type: 'triangle', vol: 0.025, att: 0.6, p: i % 2 ? 0.25 : -0.25 }));
      if (level >= 1) { noise(t + BEAT / 2, 0.06, { vol: 0.04, p: 0.3 }); noise(t, 0.04, { vol: 0.025, p: -0.3 }); }                  // shaker
      if (level >= 1 && (b === 0 || b === 2)) tone(t, midi(BASS[bar]), BEAT * 1.6, { type: 'triangle', vol: 0.09, att: 0.01 });       // bass
      if (level >= 2 && notes.length) { const m = notes[n % notes.length]; tone(t + BEAT / 2, midi(m), 0.9, { type: 'triangle', vol: 0.035, att: 0.005, p: Math.sin(n) * 0.5 }); }   // the friends' notes
      if (level >= 2 && b === 3) noise(t, 0.12, { freq: 1800, type: 'bandpass', q: 1.5, vol: 0.06 });                                  // a soft clap
    },
    // the glow lands on a friend: a warm bell from their side, and a soft squeeze
    cue(m, p) { const t = ac.currentTime + 0.01; tone(t, midi(m), 1.2, { type: 'sine', vol: 0.13, att: 0.004, p, dest: fx }); tone(t, midi(m + 12), 0.6, { vol: 0.04, att: 0.004, p, dest: fx }); },
    passed(m, p, first) {
      const t = ac.currentTime + 0.01; notes.push(m);
      [0, 4, 7].forEach((d, i) => tone(t + i * 0.06, midi(m + d), 1.4, { type: 'triangle', vol: first ? 0.05 : 0.07, att: 0.01, p, dest: fx }));
      noise(t, 0.4, { freq: 5000, vol: 0.03, p, dest: fx });
    },
    early(p) { tone(ac.currentTime + 0.01, 520, 0.12, { vol: 0.035, p, dest: fx }); },
    swell(all) { const t = ac.currentTime + 0.05; all.forEach((m, i) => { tone(t + i * 0.1, midi(m - 12), 5, { type: 'triangle', vol: 0.05, att: 0.4, dest: fx }); tone(t + i * 0.1, midi(m), 4, { vol: 0.025, att: 0.6, dest: fx }); }); },
    hold(v) { held = v; bus.gain.setTargetAtTime(v ? 0 : 0.9, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 0 : 1, ac.currentTime, 0.2); },
    stop() { held = true; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} setTimeout(() => { try { bus.disconnect(); fx.disconnect(); } catch (e) {} }, 600); },
  };
}

export function fellowshipPassGame() {
  let G = null;
  const panOf = f => (f.u - 0.5) * 1.8;

  function hud() {
    const lap = Math.min(LAPS, Math.floor(G.passes / RING.length) + 1);
    G.ui.panel('Pass it on', `${G.passes}<small>of ${PASSES} passes</small>`, { segs: [G.passes, PASSES], sub: G.passes >= PASSES ? 'Everyone has someone' : `Lap ${lap} of ${LAPS}: tap PASS when the bell rings` });
  }
  // the glow starts moving toward the next friend, landing on a beat at least half a beat away
  function hopTo(i) {
    const nextIn = BEAT - G.beatT, land = nextIn >= BEAT * 0.5 ? nextIn + BEAT : nextIn + 2 * BEAT;   // the glow takes about two beats to travel
    G.hop = { from: G.at, to: i, t: 0, dur: land };
    G.state = 'hop'; G.landAt = G.beatN + Math.round((land - nextIn) / BEAT) + 1;
  }
  function land() {
    G.at = G.hop.to; G.state = 'wait'; G.sinceCue = 0; G.cues = 0; cue();
  }
  function cue() {
    const f = G.friends[G.at]; G.cues++; G.sinceCue = 0;
    G.band.cue(f.note, panOf(f)); f.pulse = 1; G.buzz(15);
  }
  function pass() {
    if (!G || !G.playing || G.over) return;
    const f = G.friends[G.at];
    const ok = G.state === 'wait' && (G.sinceCue <= AFTER || BEAT - G.beatT <= BEFORE);
    if (!ok) { G.band.early(f ? panOf(f) : 0); G.ui.pop('WAIT FOR THE BELL'); return; }
    G.passes++; f.lit = Math.min(2, f.lit + 1); f.flash = 1;
    const first = f.lit === 1;
    G.band.passed(f.note, panOf(f), first); G.buzz([25, 30, 50]);
    const [x, y] = G.S.P(f.u, f.v); G.fx.add(x, y, f.color, 18, 0.28);
    if (G.passes <= 3) G.say('I’ve got you.');
    else if (G.passes === RING.length) G.say('Everyone has the glow. One more lap.');
    G.ui.pop(G.passes <= 3 ? 'I’VE GOT YOU' : 'PASSED!');
    const lap = Math.floor(G.passes / RING.length); G.band.level(lap >= 1 ? (G.passes >= RING.length + 3 ? 2 : 1) : 0);
    hud();
    if (G.passes >= PASSES) return finish();
    hopTo((G.at + 1) % RING.length);
  }
  function finish() {
    G.state = 'end'; G.endT = 0; G.band.swell(RING.map(f => f.note)); G.buzz([60, 60, 160]);
    G.ui.alert('Everyone has someone', 'The whole circle is glowing', 3.2, 'red');
    G.say('Everyone has someone.');
  }

  return {
    title: 'Pass it on',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { passes: 0, at: 0, state: 'idle', hop: null, beatT: 0, beatN: 0, sinceCue: 0, cues: 0, endT: -1, t0: 0, allK: 0, botSkip: false });
      const ac = K.audio();
      G.band = ac ? band(ac) : { start() {}, level() {}, beat() {}, cue() {}, passed() {}, early() {}, swell() {}, hold() {}, stop() {} };
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uAll: { value: 0 }, uGlow: { value: 0 }, uOrbA: { value: 0 },
        uOrb: { value: new THREE.Vector2(RING[0].u, RING[0].v) }, uHome: { value: RING.map(f => new THREE.Vector3(f.u, f.v, 0)) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.02; G.face.renderOrder = 11; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // each friend: a soft spot on their place, and the landing ring
      G.friends = RING.map((F, i) => {
        const spot = K.sprite(spotTex, 0.1, { order: 16, opacity: 0, additive: true }); const ring = K.sprite(pulseTex, 0.14, { order: 17, opacity: 0 });
        const [x, y] = G.S.P(F.u, F.v); spot.position.set(x, y, 0.04); ring.position.set(x, y, 0.045); G.root.add(spot, ring);
        return { ...F, i, spot, ring, lit: 0, litK: 0, pulse: 0, flash: 0 };
      });
      G.orb = K.sprite(orbTex, 0.17, { order: 20, opacity: 0, additive: true }); G.orb.position.z = 0.06; G.root.add(G.orb);
      G.ui.buttons([{ label: 'Pass', kind: 'red', aria: 'Pass the glow on: press when the bell rings', press: () => pass() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); G.beatT = BEAT - 0.05; G.at = RING.length - 1; G.hop = { from: RING.length - 1, to: 0, t: 0, dur: BEAT + 0.05 }; G.state = 'hop'; G.landAt = 2; };
      K.intro(G, { title: 'Pass it on', how: 'A warm glow travels around Nikki’s circle of friends. When it lands and the bell rings, tap PASS to pass it on.',
        say: 'Pass it on. A warm glow travels around Nikki’s circle of friends, like a squeeze of the hand. When the glow lands on a friend, a bell rings from their side. Tap pass on the bell to pass it on. If you miss it, it waits for you.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      G.uni.uA.value += ((G.ready ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      if (G.playing && G.state !== 'end') {
        // the beat
        G.beatT += dt; G.sinceCue += dt;
        if (G.beatT >= BEAT) {
          G.beatT -= BEAT; G.beatN++; G.band.beat(G.beatN);
          if (G.state === 'hop' && G.beatN >= G.landAt) land();
          else if (G.state === 'wait') cue();     // missed it: the glow waits, and the bell rings again
        }
        if (G.state === 'hop') G.hop.t += dt;
      }
      // the glow: an arc from friend to friend, bowing out from the middle of the circle; it beats with the music
      const at = G.friends[G.at];
      let ou = at.u, ov = at.v;
      if (G.state === 'hop' && G.hop) {
        const a = G.friends[G.hop.from], b = G.friends[G.hop.to], k = Math.min(1, G.hop.t / G.hop.dur), e = k * k * (3 - 2 * k);
        const mu = (a.u + b.u) / 2, mv = (a.v + b.v) / 2, cu = 0.48, cv = 0.48, bow = 0.25;
        const pu = mu + (mu - cu) * bow, pv = mv + (mv - cv) * bow;
        ou = (1 - e) * (1 - e) * a.u + 2 * (1 - e) * e * pu + e * e * b.u; ov = (1 - e) * (1 - e) * a.v + 2 * (1 - e) * e * pv + e * e * b.v;
      }
      const thump = Math.exp(-G.beatT * 6);
      const orbOn = G.playing || G.state === 'end' ? 1 : 0;
      G.orb.material.opacity += (orbOn * (G.state === 'end' ? 0 : 1) - G.orb.material.opacity) * Math.min(1, dt * 3);
      const [ox, oy] = G.S.P(ou, ov); G.orb.position.set(ox, oy, 0.06); G.orb.scale.setScalar(0.17 * (1 + 0.18 * thump));
      G.uni.uOrb.value.set(ou, ov); G.uni.uOrbA.value = G.orb.material.opacity;
      for (const f of G.friends) {
        f.litK += ((f.lit >= 2 ? 1 : f.lit === 1 ? 0.75 : 0) - f.litK) * Math.min(1, dt * 2);
        G.uni.uHome.value[f.i].z = f.litK;
        f.pulse = Math.max(0, f.pulse - dt * 1.3); f.flash = Math.max(0, f.flash - dt * 1.5);
        f.ring.material.opacity = f.pulse * 0.95; f.ring.scale.setScalar(0.1 + (1 - f.pulse) * 0.12);
        const waiting = G.state === 'wait' && f === at;
        f.spot.material.opacity = Math.max(waiting ? 0.7 + 0.3 * Math.sin(G.t * 8) : 0, f.flash, G.playing ? 0.18 : 0);
        f.spot.scale.setScalar(0.1 + 0.08 * f.flash);
      }
      // the bot: passes a moment after the bell (it lets the bell ring twice on pass 5, to test the wait)
      if (G.bot && G.playing && G.state === 'wait' && G.sinceCue > 0.12 && G.sinceCue < 0.3) {
        if (G.passes === 4 && G.cues < 2) { /* wait for the bell again */ } else pass();
      }
      if (G.endT >= 0) {
        G.endT += dt; G.allK = Math.min(1, G.allK + dt * 0.6); G.uni.uAll.value = G.allK; G.uni.uGlow.value = Math.sin(Math.min(1, G.endT / 3) * Math.PI);
        if (G.endT > 3.6 && !G.over) {
          const t = Math.round(G.t - G.t0);
          K.finale(G, { won: true, title: 'Everyone has someone', kicker: 'Passed all the way round', line: G.work && G.work.quote,
            cells: [{ k: 'Passes', v: `${PASSES}/${PASSES}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }],
            say: 'Passed all the way round. The whole circle is glowing.' });
          if (!G.bot) {   // then Nikki's own words (if the clip is missing, her quote is read)
            const a = new Audio(CLIP); G.clip = a;
            setTimeout(() => { if (!G || G.clip !== a) return; G.band.hold(true); a.play().catch(() => { if (!G || G.clip !== a) return; const b = new Audio(CLIP2); G.clip = b; b.addEventListener('ended', () => { if (G) G.band.hold(false); }); b.play().catch(() => { if (G) { G.band.hold(false); G.say(G.work && G.work.quote || ''); } }); }); }, 3200);
            a.addEventListener('ended', () => { if (G) G.band.hold(false); });
            a.addEventListener('error', () => { if (G) G.band.hold(false); });
          }
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      if (G.S.toBoard(ev, G.root)) pass();      // tap anywhere on the painting
    },
    pause() { if (G) { G.paused = true; G.band.hold(true); if (G.clip) G.clip.pause(); } },
    resume() { if (G) { G.paused = false; G.band.hold(false); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'fellowship-pass', playing: G.playing, over: G.over, state: G.state, passes: G.passes, at: G.at, cues: G.cues, t: +G.t.toFixed(1) }; },
    stop() { if (!G) return; G.band.stop(); if (G.clip) { G.clip.pause(); G.clip.removeAttribute('src'); G.clip = null; } K.cleanup(G); G = null; },
  };
}
