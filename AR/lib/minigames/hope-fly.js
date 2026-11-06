// HOPE IS NOT LOST (Ricky Ruzicka): FLY TO THE LIGHT.
// "There is a difference between your eyesight and vision. You have to have a vision for hope in the future."
// The floating island lifts out of the painting (it's cut out: media/games/hope/island.png, with the clouds behind it
// filled in: sky.jpg) and flies through a dusky sky toward the dawn, with Ricky standing by his pond. Storm clouds roll in
// from far ahead, rumbling from their side and growing louder and bigger as they come. Somewhere else in the sky, the
// wind chimes of the dawn are ringing: steer the island toward the chimes (hold LEFT or RIGHT, or hold that side of the
// screen) and you fly around the storm. You don't need to see: you follow the sound, like a vision of where you're going.
// Every storm you pass makes the sky brighter and adds a part to the music. Fly into one and it shakes the island with
// thunder and lightning (and you keep going). Pass 8 storms and the sun rises; the island floats home into the painting
// and Ricky says it himself.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './hope-things.js';

const ART = new URL('../../media/games/hope/', import.meta.url).href;
// Ricky in his own words (the 3D gallery's clip for this painting), played at the finale
const ARTIST = new URL('../../../3D/gallery/audio/art_35.mp3', import.meta.url).href;
// Ricky's quote (artworks.js doesn't have it yet; the main chat adds it at merge time)
const QUOTE = '“Hope is not lost. There is a difference between your eyesight and vision, right? You have to have a vision for hope in the future and what you can still do through those challenges that you may have now. You are losing something, but just because you lose something doesn’t mean that there’s nothing to be gained from it.” — Ricky Ruzicka';

const STORMS = 8;
// the island in the 512 × 512 painting: its cut-out's box (pixels)
const ISL = { x0: 39, y0: 125, x1: 479, y1: 472, W: 512 };
const PLAY_SCALE = 0.7, PLAY_LIFT = 0.07, REACH = 0.17, SPEED = 0.42;   // smaller while flying, a little higher; how far it can steer; how fast
const HIT = 0.15;                                                        // a storm this close (sideways) when it arrives shakes the island
const CALL = { '-1': 'Storm on the left!', '0': 'Storm in the middle!', '1': 'Storm on the right!' };
const PASS = ['Through the storm!', 'The sky is brighter!', 'Through the storm!', 'Halfway to the sunrise!', 'The sky is brighter!', 'Through the storm!', 'One more storm!', 'The sun is rising!'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the sky and the island share one look: dusky blue-violet at the start, warming to a golden dawn as the storms pass;
// darkened by a storm overhead; white-lit by lightning
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uDawn, uFlash, uDark, uA, uT, uSky;
void main(){
  vec2 p = vUv;
  if (uSky > 0.5) p.x += sin(p.y * 6.0 + uT * 0.25) * 0.004;   // the clouds drift a little
  vec4 t = texture2D(map, p);
  vec3 c = t.rgb;
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  vec3 dusk = mix(vec3(lum), c, 0.8) * vec3(0.62, 0.6, 0.88) + vec3(0.08, 0.03, 0.0) * smoothstep(0.3, 0.0, p.y);
  vec3 dawn = c * 1.06 + vec3(0.1, 0.05, 0.0) * (1.0 - p.y);
  c = mix(dusk, dawn, uDawn);
  c *= 1.0 - 0.35 * uDark;
  c = mix(c, vec3(1.0, 0.98, 0.9), uFlash * 0.55);
  gl_FragColor = vec4(c, t.a * uA);
}`;

/* ───────────────────────── the band: a hopeful sky pad that grows, chimes, storms ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0.8; mus.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest = out) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.004, dest = out } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, dest = out } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.05);
  }
  // the music: slow chords in D (I – vi – IV – V), and with each storm passed a new layer joins:
  // 1 the pad · 2 a soft pulse · 3 a rising arpeggio · 5 a bass · 7 a little melody
  const CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]];
  const MEL = [74, 76, 78, 81, 78, 76, 74, 73];
  let next = 0, step = 0, timer = null, layers = 1; const bpm = 84;
  function schedule() {
    const e = 60 / bpm / 2;                                       // eighth notes
    while (next < ac.currentTime + 0.15) {
      const t = next, s = step % 16, bar = Math.floor(step / 16) % 4, ch = CH[bar];
      if (s === 0) ch.forEach((m, i) => tone(t, midi(m), e * 16, { type: 'triangle', vol: 0.022, att: 0.9, dest: mus }));
      if (layers >= 2 && s % 4 === 0) tone(t, midi(ch[0] + 12), e * 1.5, { vol: 0.03, att: 0.02, dest: mus });
      if (layers >= 3) tone(t, midi(ch[s % 4] + 12 + (s >= 8 ? 12 : 0)), e * 1.2, { vol: 0.016, att: 0.01, p: s % 2 ? 0.3 : -0.3, dest: mus });
      if (layers >= 5 && s % 8 === 0) tone(t, midi(ch[0] - 12), e * 7, { type: 'sine', vol: 0.09, att: 0.05, dest: mus });
      if (layers >= 7 && s % 4 === 2) tone(t, midi(MEL[(Math.floor(step / 4)) % MEL.length]), e * 3, { type: 'triangle', vol: 0.03, att: 0.04, dest: mus });
      next += e; step++;
    }
  }
  // a storm's rumble: a continuous low growl, panned, that we raise as the storm comes
  let rum = null;
  function rumble() {
    if (rum) return rum;
    const s = ac.createBufferSource(); s.buffer = nb; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160;
    const g = ac.createGain(); g.gain.value = 0; const p = ac.createStereoPanner ? ac.createStereoPanner() : null;
    s.connect(f).connect(g); if (p) { g.connect(p).connect(out); } else g.connect(out);
    s.start(); rum = { s, g, p, f }; return rum;
  }
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.4); next = ac.currentTime + 0.1; timer = setInterval(schedule, 25); },
    layers(n) { layers = n; },
    mute(m) { out.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.1); },
    quiet(v) { mus.gain.setTargetAtTime(v, ac.currentTime, 0.5); },
    // the storm's growl: where it is (pan) and how close (0..1)
    storm(p, k) { const r = rumble(), t = ac.currentTime; r.g.gain.setTargetAtTime(k * 0.7, t, 0.08); if (r.p) r.p.pan.setTargetAtTime(Math.max(-1, Math.min(1, p)), t, 0.08); r.f.frequency.setTargetAtTime(120 + k * 220, t, 0.1); },
    calm() { if (rum) rum.g.gain.setTargetAtTime(0, ac.currentTime, 0.4); },
    // distant thunder as a storm appears; a big crack when it hits
    thunder(p, big = false) {
      const t = ac.currentTime + 0.02;
      if (big) { noise(t, 0.25, { freq: 3000, q: 0.5, vol: 0.4, p, sweep: 800 }); }
      noise(t + (big ? 0.05 : 0), big ? 2.2 : 1.6, { freq: big ? 220 : 140, type: 'lowpass', vol: big ? 0.6 : 0.3, p, att: big ? 0.01 : 0.25 });
    },
    // the wind chimes of the dawn: a few bright pentatonic tubes ringing from where the light is
    chime(p, vol = 1, bright = 0) {
      const t = ac.currentTime + 0.01, notes = [86, 88, 90, 93, 95, 98];
      const n = 2 + Math.floor(Math.random() * 2) + (bright ? 1 : 0);
      for (let i = 0; i < n; i++) { const m = notes[Math.floor(Math.random() * notes.length)]; tone(t + i * 0.09 + Math.random() * 0.05, midi(m), 1.4, { vol: 0.03 * vol, p, att: 0.003 }); tone(t + i * 0.09, midi(m) * 2.76, 0.5, { vol: 0.006 * vol, p, att: 0.003 }); }
    },
    whoosh(p) { noise(ac.currentTime + 0.01, 0.9, { freq: 500, q: 0.6, vol: 0.16, sweep: 1400, p, att: 0.2 }); },
    pass(n) { const t = ac.currentTime + 0.05; [0, 4, 7, 11].forEach((d, i) => tone(t + i * 0.1, midi(74 + d + (n % 4) * 2 - 2), 1.1, { type: 'triangle', vol: 0.05, att: 0.02 })); },
    sunrise() { const t = ac.currentTime + 0.05; [62, 66, 69, 74, 78, 81, 86].forEach((m, i) => tone(t + i * 0.16, midi(m), 2.5, { type: 'triangle', vol: 0.05, att: 0.05 })); tone(t, midi(38), 4, { vol: 0.12, att: 0.4 }); },
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); if (rum) rum.s.stop(ac.currentTime + 0.3); } catch (e) {} },
  };
}

export function hopeFlyGame() {
  let G = null;
  const tex = {};
  const T = k => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, k === 'storm' || k.startsWith('flash') ? 768 : 512)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  const shaderMat = (sky) => new THREE.ShaderMaterial({ uniforms: { map: { value: null }, uDawn: G.U.uDawn, uFlash: G.U.uFlash, uDark: G.U.uDark, uA: G.U.uA, uT: G.U.uT, uSky: { value: sky ? 1 : 0 } },
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false });

  function hud() {
    G.ui.panel('Fly to the light', `${G.passed}<small>of ${STORMS} storms</small>`, { segs: [G.passed, STORMS], sub: 'Hold LEFT or RIGHT · follow the chimes' + (G.hits ? ` · Storms hit ${G.hits}` : '') });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; }

  // a new storm far ahead: where it is (−1 left, 0 middle, 1 right) and where the chimes of the dawn ring instead
  function spawn() {
    const n = G.spawned++;
    const side = n < 3 ? [-1, 1, -1][n] : n === 4 || n === 7 ? 0 : (Math.random() < 0.5 ? -1 : 1);
    const sx = side * 0.13, cx = side === 0 ? (Math.random() < 0.5 ? -1 : 1) * REACH : -side * REACH;
    G.storm = { side, x: sx, k: 0, dur: Math.max(4.2, 6.2 - n * 0.25), done: false, hit: false };
    G.chimeX = cx; G.chimeT = 0;
    G.band.thunder(sx * 2.5);
    G.say(CALL[side] + (n < 2 ? (side < 0 ? ' Follow the chimes to the right.' : ' Follow the chimes to the left.') : ''));
    setPhase('storm');
  }
  function arrive() {
    const s = G.storm; s.done = true;
    if (Math.abs(G.ix - s.x) < HIT) {
      G.hits++; s.hit = true; G.flash = 1; G.shake = 1; G.band.thunder((s.x - G.ix) * 2, true); G.buzz([200, 80, 200]);
      G.ui.alert('THUNDER!', 'The storm shook the island. Follow the chimes!', 1.8, 'blue');
      G.say('The storm shook the island. Follow the chimes.');
    } else {
      G.passed++; G.band.pass(G.passed); G.band.layers(G.passed + 1); G.buzz([30, 30, 60]);
      const [x, y] = [G.ix, G.iy + 0.12]; G.fx.add(x, y, '#ffd98a', 22, 0.4);
      G.say(PASS[G.passed - 1]); G.ui.pop('THROUGH!');
    }
    hud(); setPhase('after');
  }

  return {
    title: 'Fly to the light',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, spawned: 0, passed: 0, hits: 0, storm: null, ix: 0, iy: 0, vx: 0, steer: 0, held: { l: false, r: false },
        chimeX: REACH, chimeT: 0, flash: 0, bolt: 0, boltQ: 0, shake: 0, dawn: 0, fly: 0, wisps: [], wispT: 0, endT: 0, artist: null, homeK: 0 });
      G.U = { uDawn: { value: 0 }, uFlash: { value: 0 }, uDark: { value: 0 }, uA: { value: 0 }, uT: { value: 0 } };
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the sky (with the island's hole filled in) over the painting
      G.sky = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), shaderMat(true)); G.sky.position.z = 0.02; G.sky.renderOrder = 11; G.root.add(G.sky);
      // the sun, behind the island: it grows as the storms pass and rises at the end
      G.sun = K.sprite(T('sun'), 0.3, { order: 12, opacity: 0, additive: true }); G.root.add(G.sun);
      // the island: a group at its centre in the painting, so it flies, tilts and bobs from there
      { const W = ISL.W, cu = (ISL.x0 + ISL.x1) / 2 / W, cv = (ISL.y0 + ISL.y1) / 2 / W; G.home = G.S.P(cu, cv);
        G.isl = new THREE.Group(); G.isl.position.set(G.home[0], G.home[1], 0.05); G.root.add(G.isl);
        G.islM = new THREE.Mesh(new THREE.PlaneGeometry((ISL.x1 - ISL.x0) / W, (ISL.y1 - ISL.y0) / W * G.h), shaderMat(false)); G.islM.renderOrder = 20; G.isl.add(G.islM); }
      // the storm, its lightning, the chimes of the dawn
      G.stormS = K.sprite(T('storm'), 0.2, { order: 22, opacity: 0 }); G.root.add(G.stormS);
      G.flashS = K.sprite(T('flash'), 0.2, { order: 23, opacity: 0, additive: true }); G.root.add(G.flashS);
      G.chime = K.sprite(T('chime'), 0.2, { order: 15, opacity: 0 }); G.root.add(G.chime);
      let n = 0; const ok = () => { if (++n === 2 && G) G.ready = true; };
      new THREE.TextureLoader().load(ART + 'sky.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.sky.material.uniforms.map.value = t; ok(); });
      new THREE.TextureLoader().load(ART + 'island.png', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.islM.material.uniforms.map.value = t; ok(); });
      const hold = (k, v) => { if (!G) return; G.held[k] = v; };
      G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'red', aria: 'Hold to fly left', press: () => hold('l', true), release: () => hold('l', false) },
        { label: 'Right', icon: '▶', kind: 'red', aria: 'Hold to fly right', press: () => hold('r', true), release: () => hold('r', false) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; setPhase('after'); G.phT = 1; };
      K.intro(G, { title: 'Fly to the light',
        how: 'Storm clouds rumble ahead. Somewhere else, the wind chimes of the dawn are ringing. Hold LEFT or RIGHT to steer the island toward the chimes and fly around the storm. Pass 8 storms to reach the sunrise.',
        say: 'Fly to the light. Storm clouds rumble ahead. Somewhere else, the wind chimes of the dawn are ringing. Hold left or right to steer the island toward the chimes, and fly around the storm. Pass eight storms to reach the sunrise.' });
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.quiet(0.3); } }
      const ph = G.phase, U = G.U;

      // the island lifts off to its flying size at the start, and floats home into the painting at the end
      const flying = G.playing || ph === 'intro';
      G.fly += ((ph === 'home' || G.over ? 0 : (G.ready ? 1 : 0)) - G.fly) * Math.min(1, dt * (ph === 'home' || G.over ? 1.2 : 1.6));
      if (G.playing) {
        // steering: hold left or right; the island glides and leans into the turn
        const want = (G.held.r ? 1 : 0) - (G.held.l ? 1 : 0);
        G.vx += (want * SPEED - G.vx) * Math.min(1, dt * 5);
        G.ix = Math.max(-REACH, Math.min(REACH, G.ix + G.vx * dt));
        if (Math.abs(G.ix) >= REACH) G.vx *= 0.5;
      } else { G.ix += (0 - G.ix) * Math.min(1, dt * 1.5); G.vx *= 0.9; }
      G.shake = Math.max(0, G.shake - dt * 1.4);
      { const s = PLAY_SCALE + (1 - PLAY_SCALE) * (1 - G.fly), bob = Math.sin(G.t * 1.3) * 0.008 * G.fly;
        G.iy = G.home[1] + PLAY_LIFT * G.fly + bob;
        G.isl.position.set(G.home[0] + G.ix * G.fly + Math.sin(G.t * 40) * 0.01 * G.shake, G.iy + Math.cos(G.t * 37) * 0.006 * G.shake, 0.05);
        G.isl.scale.setScalar(s); G.isl.rotation.z = -G.vx * 0.22 + Math.sin(G.t * 0.9) * 0.012 * G.fly + Math.sin(G.t * 33) * 0.03 * G.shake; }
      // mist streams off the island as it moves
      G.wispT -= dt;
      if (G.playing && G.wispT <= 0) { G.wispT = 0.18 - Math.min(0.1, Math.abs(G.vx) * 0.2);
        const s = K.sprite(T('wisp'), 0.08, { order: 19, opacity: 0.7 }); s.position.set(G.isl.position.x + (Math.random() - 0.5) * 0.3, G.isl.position.y - 0.06 + (Math.random() - 0.5) * 0.06, 0.045); G.root.add(s);
        G.wisps.push({ s, t: 0, vx: -G.vx * 0.6 + (Math.random() - 0.5) * 0.03, vy: -0.05 }); }
      for (let i = G.wisps.length - 1; i >= 0; i--) { const w = G.wisps[i]; w.t += dt; w.s.position.x += w.vx * dt; w.s.position.y += w.vy * dt; w.s.scale.setScalar(0.08 + w.t * 0.12); w.s.material.opacity = Math.max(0, 0.6 - w.t * 0.5); if (w.t > 1.2) { G.root.remove(w.s); w.s.material.dispose(); G.wisps.splice(i, 1); } }

      // the storms
      if (ph === 'after' && G.phT > 2.2) { if (G.passed >= STORMS) { setPhase('sunrise'); G.band.sunrise(); G.ui.alert('THE SUN IS RISING!', 'You flew through every storm.', 3.4, 'red'); G.say('You flew all the way to the light!'); } else spawn(); }
      const s = G.storm;
      if (s) {
        if (!s.done) { s.k = Math.min(1, s.k + dt / s.dur); G.band.storm((s.x - G.ix) * 2.5, 0.15 + s.k * 0.85); if (s.k >= 1) arrive(); }
        else { s.k += dt / s.dur * 1.2; G.band.storm((s.x - G.ix) * 2.5, Math.max(0, 1 - (s.k - 1) * 4)); if (s.k > 1.4) { G.storm = null; G.band.calm(); } }
        const k = Math.min(s.k, 1.4), e = k * k, [sx0, sy0] = G.S.P(0.5 + s.x * 0.4, 0.06), [sx1, sy1] = [s.x, G.home[1] + PLAY_LIFT + 0.17];
        const size = 0.17 + 0.38 * e, x = sx0 + (sx1 - sx0) * e, y = sy0 + (sy1 - sy0) * e + (k > 1 ? -(k - 1) * 0.5 : 0);
        G.stormS.position.set(x + Math.sin(G.t * 2) * 0.006, y, k < 1 ? 0.04 : 0.06); G.stormS.scale.setScalar(size); G.stormS.renderOrder = k < 1 ? 18 : 22;
        G.stormS.material.opacity = Math.min(1, k * 5) * (k > 1 ? Math.max(0, 1 - (k - 1) * 2.5) : 1);
        G.flashS.position.copy(G.stormS.position); G.flashS.position.z += 0.002; G.flashS.scale.setScalar(size);
        // the chimes of the dawn ring where it's safe, louder when the island is under them
        G.chimeT -= dt;
        if (!s.done && G.chimeT <= 0) { const near = 1 - Math.min(1, Math.abs(G.ix - G.chimeX) / (REACH * 2)); G.chimeT = 0.75 - near * 0.35; G.band.chime((G.chimeX - G.ix) * 2.5 + G.chimeX * 0.8, 0.6 + near * 0.8, near > 0.85); G.chimeRing = 1; }
        U.uDark.value += ((s.done ? 0 : 0.6 * s.k) - U.uDark.value) * Math.min(1, dt * 3);
      } else { G.stormS.material.opacity = 0; U.uDark.value *= 0.95; }
      // occasional lightning inside the storm, more as it comes
      G.bolt = Math.max(0, (G.bolt || 0) - dt * 4);
      // a strike: a new bolt each time, and often a second flicker right after, like real lightning
      const strike = () => { G.bolt = 1; G.flashS.material.map = T(['flash', 'flash1', 'flash2'][Math.floor(Math.random() * 3)]); };
      if (G.boltQ > 0) { G.boltQ -= dt; if (G.boltQ <= 0) G.bolt = Math.max(G.bolt, 0.8); }
      if (s && !s.done && Math.random() < dt * (0.3 + s.k * 1.5)) { strike(); G.boltQ = Math.random() < 0.6 ? 0.11 : 0; }
      if (G.flash >= 0.99 && G.bolt < 0.5) { strike(); G.boltQ = 0.13; }
      G.flashS.material.opacity = Math.max(G.bolt, G.flash) * G.stormS.material.opacity;
      G.chimeRing = Math.max(0, (G.chimeRing || 0) - dt * 2);
      { const on = s && !s.done ? 1 : 0, [cx, cy] = [G.chimeX, G.S.P(0.5, 0.17)[1]];
        G.chime.position.set(cx + Math.sin(G.t * 1.6) * 0.006, cy + Math.sin(G.t * 2.1) * 0.005, 0.045); G.chime.material.rotation = Math.sin(G.t * 2.4) * 0.08 * (0.4 + G.chimeRing);
        G.chime.scale.setScalar(0.22 + 0.04 * G.chimeRing); G.chime.material.opacity += (on - G.chime.material.opacity) * Math.min(1, dt * 3); }

      // the dawn: brighter with every storm passed, the full sunrise at the end
      const dawnWant = ph === 'sunrise' || ph === 'home' || G.over ? 1 : G.passed / STORMS * 0.8;
      G.dawn += (dawnWant - G.dawn) * Math.min(1, dt * 0.8); U.uDawn.value = G.dawn;
      { const rise = ph === 'sunrise' || ph === 'home' || G.over ? Math.min(1, (ph === 'sunrise' ? G.phT : 3) / 3) : 0, [sx, sy] = G.S.P(0.5, 0.42 - 0.24 * rise);
        G.sun.position.set(sx, sy, 0.035); G.sun.scale.setScalar(0.22 + 0.25 * G.dawn + 0.15 * rise); G.sun.material.opacity = (0.15 + 0.6 * G.dawn) * U.uA.value; G.sun.material.rotation = G.t * 0.05; }
      G.flash = Math.max(0, G.flash - dt * 2); U.uFlash.value = Math.max(G.flash, G.bolt * 0.25 * (s && !s.done ? s.k : 0));
      U.uT.value = G.t;
      U.uA.value += ((G.ready && !(G.over && G.endT > 1.5) ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2);

      if (ph === 'sunrise' && G.phT > 3.6) { setPhase('home'); G.playing = false; G.held.l = G.held.r = false; }
      if (ph === 'home' && G.phT > 2.4 && !G.over) {
        const r = K.best('hope-is-not-lost:hits', G.hits, 'lower');
        K.finale(G, { won: true, kicker: 'Hope is not lost', title: 'You reached the light', line: G.work.quote || QUOTE, best: r.isBest, say: 'You reached the light!',
          cells: [{ k: 'Storms passed', v: G.passed }, { k: 'Storms hit', v: G.hits }, { k: 'Time', v: Math.round(G.t - G.t0) + 's' }] });
      }

      // the robot: steers toward the chimes once it hears the storm; on the third storm it waits too long
      if (G.bot && G.playing && s && !s.done) {
        const go = G.spawned === 3 ? s.k > 0.93 : s.k > 0.12, d = G.chimeX - G.ix;
        G.held.l = go && d < -0.02; G.held.r = go && d > 0.02;
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'down') { const side = ev.clientX < innerWidth / 2 ? 'l' : 'r'; G.held[side] = true; G.ptr = side; }
      else if (kind === 'up' && G.ptr) { G.held[G.ptr] = false; G.ptr = null; }
    },
    pause() { if (G) { G.paused = true; G.band.mute(true); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.mute(false); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'hope-fly', phase: G.phase, playing: G.playing, over: G.over, passed: G.passed, hits: G.hits, ix: +G.ix.toFixed(2), storm: G.storm ? +G.storm.x.toFixed(2) : null, chime: +G.chimeX.toFixed(2), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.artist && G.artist.pause(); } catch (e) {} G.artist = null; try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
