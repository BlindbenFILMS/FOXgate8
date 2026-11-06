// SELF-WORTH: A NEW UNDERSTANDING (Nikki Jeffords): SET IT DOWN.
// "A blind woman said to me, 'Nikki, you need to know that blindness is respectable.'" The woman in the painting walks
// the yellow path toward the door standing alone in the hills, but she is carrying six heavy bundles of old
// embarrassment (SORRY, HIDING, PRETEND, SHRINKING, ALONE, SHAME: drawn in selfworth-things.js). At first the whole
// painting is weighed down with them: muted, dim and gray, and she stands a little hunched. One at a time each bundle
// is named (spoken, from its side, with a low heavy note). Press LET GO (or tap the painting): it drops with a thud from
// its side and crumbles to dust, a rising note plays, she stands a little taller, the colour comes back to the hills,
// the light warms, and she takes a few steps forward (the view moves in toward the door). When all six are gone she
// reaches the door, hears "Blindness is respectable.", the doorway fills with warm light, and she walks through.
// Then Nikki tells it in her own voice (her clip from the 3D gallery). Buttons: LET GO, and WHAT IS IT? (says it again).
import * as THREE from 'three';
import * as K from './kit.js';
import { BUNDLES, bundleTex, doorGlowTex, dustTex } from './selfworth-things.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

// Nikki telling it in her own words (her short clip from the 3D gallery), played as the painting comes alive
const NIKKI = new URL('../../../3D/gallery/audio/wing_5_2.mp3', import.meta.url).href;
const NIKKI2 = new URL('../../media/clips/self-worth-a-new-understanding.mp4', import.meta.url).href;   // backup: the sound of her statement video
const C = [0.497, 0.48];                         // the middle of the doorway: the view moves in toward here
const FEET = 0.80;                               // where her feet are (v)
// the six bundles: where each one hangs around her (painting u, v) and what is said about it
const SPOTS = [[0.30, 0.42], [0.70, 0.60], [0.27, 0.62], [0.70, 0.40], [0.32, 0.80], [0.68, 0.80]];
const LINES = [
  'Sorry. Always saying sorry for not seeing.',
  'Hiding. Hiding her cane so nobody knows.',
  'Pretend. Pretending she can see, with a smile.',
  'Shrinking. Trying not to make a fuss.',
  'Alone. Never asking for help.',
  'Shame. The heaviest one of all.',
];
const LET = 'Let it go.', NUDGE = 'Press Let go to set it down.';
const SIZE = 0.2, ZSTEP = 0.07, IDLE = 8;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, weighed down: muted and dim at first, warming with every bundle she lets go; the view moves in toward
// the door as she walks, she stands taller, and at the end the doorway fills with warm light
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uZoom, uProg, uDoor, uBob, uTall;
uniform vec2 uC;
float box(vec2 p, vec4 b, float e){ return smoothstep(b.x - e, b.x + e, p.x) * (1.0 - smoothstep(b.z - e, b.z + e, p.x)) * smoothstep(b.y - e, b.y + e, p.y) * (1.0 - smoothstep(b.w - e, b.w + e, p.y)); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec2 s = uC + (p - uC) / uZoom;
  s.y += uBob;
  // her: hunched under the weight at first, standing taller as she lets go (stretched up from her feet)
  float me = box(s, vec4(0.42, 0.30, 0.58, ${FEET.toFixed(2)} + 0.02), 0.025);
  s.y = mix(s.y, ${FEET.toFixed(2)} + (s.y - ${FEET.toFixed(2)}) / (1.0 + uTall), me);
  vec3 col = texture2D(map, vec2(clamp(s.x, 0.001, 0.999), 1.0 - clamp(s.y, 0.001, 0.999))).rgb;
  // the weight: gray and dim, then the colour comes back
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(g), col, mix(0.12, 1.0, uProg));
  col *= mix(0.6, 1.04, uProg);
  col *= mix(vec3(0.93, 0.96, 1.06), vec3(1.05, 1.0, 0.93), uProg);   // cool and heavy → warm
  // the hills breathe a little more as she goes (a soft shimmer of light)
  col *= 1.0 + 0.03 * uProg * sin(uT * 1.3 + s.x * 9.0);
  // the doorway fills with light
  float inner = box(s, vec4(0.382, 0.215, 0.618, 0.765), 0.01);
  float halo = box(s, vec4(0.33, 0.17, 0.67, 0.79), 0.06) * (1.0 - inner);
  float pulse = 0.85 + 0.15 * sin(uT * 2.2);
  col += vec3(1.0, 0.86, 0.55) * uDoor * (inner * 0.32 + halo * 0.3) * pulse;
  col = mix(col, vec3(1.0, 0.97, 0.88), uDoor * uDoor * inner * 0.18 * (1.0 - me * 0.7));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the band: a warm desert wind and a slow pad that warms as she goes ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const nodes = [];
  // wind: looped noise through a slowly moving filter
  const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const n = ac.createBufferSource(); n.buffer = buf; n.loop = true;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 0.6;
  const wg = ac.createGain(); wg.gain.value = 0.05; n.connect(lp).connect(wg).connect(bus); n.start(); nodes.push(n);
  // the pad: A, E, and a third that is minor (C) while she is weighed down and turns major (C#) as she frees herself
  const pad = ac.createGain(); pad.gain.value = 0.025; const plp = ac.createBiquadFilter(); plp.type = 'lowpass'; plp.frequency.value = 700; pad.connect(plp).connect(bus);
  const osc = (m, type = 'triangle') => { const o = ac.createOscillator(); o.type = type; o.frequency.value = midi(m); o.connect(pad); o.start(); nodes.push(o); return o; };
  osc(45); osc(52); const third = osc(60); osc(57, 'sine');
  return {
    bus,
    set(prog, t) {
      lp.frequency.setTargetAtTime(420 + 260 * Math.sin(t * 0.3) + 300 * prog, ac.currentTime, 0.3);
      plp.frequency.setTargetAtTime(600 + 1400 * prog, ac.currentTime, 0.5);
      pad.gain.setTargetAtTime(0.022 + 0.02 * prog, ac.currentTime, 0.5);
      third.frequency.setTargetAtTime(midi(prog >= 0.5 ? 61 : 60), ac.currentTime, 0.4);
    },
    level(v, tc = 0.4) { bus.gain.setTargetAtTime(v, ac.currentTime, tc); },
    stop() { bus.gain.cancelScheduledValues(ac.currentTime); bus.gain.setValueAtTime(0, ac.currentTime); for (const o of nodes) { try { o.stop(); } catch (e) {} } setTimeout(() => bus.disconnect(), 100); },
  };
}

export function selfWorthDoorGame() {
  let G = null;
  // where a painting point shows up once the view has moved in toward the door
  const zp = (u, v) => [C[0] + (u - C[0]) * G.zoom, C[1] + (v - C[1]) * G.zoom];
  const panOf = u => Math.max(-1, Math.min(1, (u - 0.5) * 2.4));

  const heavy = pan => { K.tone(98, 0.7, { vol: 0.13, pan }); K.tone(73.4, 0.9, { type: 'triangle', vol: 0.08, pan, delay: 0.05 }); };
  const thud = pan => { K.tone(72, 0.5, { vol: 0.3, pan, slide: -30 }); K.noise(0.3, { vol: 0.35, pan, freq: 220, type: 'lowpass' }); K.noise(0.7, { vol: 0.1, pan, freq: 2600, sweepTo: 700, delay: 0.15 }); };
  const rise = n => { const s = K.SCALES.major; [0, 2, 4].forEach((k, i) => K.tone(s[Math.min(s.length - 1, n + k)] , 0.6, { type: 'triangle', vol: 0.11, delay: 0.12 + i * 0.11 })); };
  const step = (pan = 0) => K.noise(0.09, { vol: 0.12, pan, freq: 380, type: 'lowpass' });
  const chime = () => { [1046.5, 1318.5, 1568, 2093].forEach((f, i) => K.tone(f, 1.6, { vol: 0.06, delay: i * 0.18 })); K.chord([220, 277.2, 329.6, 440, 554.4], 3.2, { vol: 0.045, type: 'triangle', spread: 0.08, delay: 0.4 }); };

  function hud() {
    if (!G.panelFix) {   // the panel at 0.999 opacity (looks identical): stops some renderers (headless SwiftShader) from
      G.panelFix = true;  // punching a mirrored gray hole through the painting canvas behind the buttons
      requestAnimationFrame(() => { const e = document.querySelector('.mgk-panel'); if (e) e.style.opacity = '0.999'; });
    }
    G.ui.panel('Set it down', `${G.dropped}<small>of 6 let go</small>`, { segs: [G.dropped, 6], sub: G.phase === 'door' ? 'Through the door' : 'Press LET GO, or tap the painting' });
  }
  function next() {
    if (G.dropped >= 6) return toDoor();
    G.active = G.bundles[G.dropped]; G.active.hl = 1;
    heavy(panOf(G.active.u));
    G.say(LINES[G.dropped] + ' ' + LET);
    G.idleT = IDLE; G.botT = 2.2; hud();
  }
  function letGo() {
    if (!G || !G.playing || G.over || G.paused) return;
    const b = G.active;
    if (!b) { K.sfx.ping(0, 660, 0.06); G.ui.pop('WALKING'); return; }   // between bundles: still a little reaction
    G.active = null; b.dropping = true; b.vy = 0; b.hl = 0;
    G.dropped++; G.target = G.dropped / 6;
    thud(panOf(b.u)); rise(G.dropped); G.buzz([40, 30, 90]);
    const [x, y] = G.S.P(...zp(b.u, b.v)); G.fx.add(x, y, '#cfc6b8', 16, 0.25);
    G.ui.pop('LET GO!');
    const left = 6 - G.dropped;
    G.say(left ? `She stands a little taller. ${left} more.` : 'She stands a little taller. That was the last one.');
    G.walkT = 1.6; G.zoomTo = 1 + ZSTEP * G.dropped; G.afterWalk = 2.4; hud();
  }
  function toDoor() {
    G.phase = 'door'; G.active = null; hud();
    G.zoomTo = 1.75; G.walkT = 2.6;
    G.doorT = 0; G.said = 0;
  }
  function again() {
    if (!G || !G.playing || G.over) return;
    if (G.active) { heavy(panOf(G.active.u)); G.active.pulse = 1; G.say(LINES[G.active.i] + ' ' + LET); G.idleT = IDLE; }
    else K.sfx.ping(0, 660, 0.06);
  }

  return {
    title: 'Set it down',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'walk', dropped: 0, prog: 0, target: 0, zoom: 1, zoomTo: 1, walkT: 0, walkPh: 0, afterWalk: -1, active: null, idleT: -1, botT: 0, doorT: -1, said: 0, endT: -1, t0: 0, door: 0 });
      // the painting, carrying the weight
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uZoom: { value: 1 }, uProg: { value: 0 }, uDoor: { value: 0 }, uBob: { value: 0 }, uTall: { value: -0.03 }, uC: { value: new THREE.Vector2(C[0], C[1]) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 11; G.face.visible = false; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the light that pours out of the doorway at the end
      G.glow = K.sprite(doorGlowTex(), 1, { additive: true, opacity: 0, order: 20 }); G.glow.position.z = 0.05; G.root.add(G.glow);
      // the six bundles, with a ring that pulses around the one being named
      G.bundles = BUNDLES.map((w, i) => {
        const s = K.sprite(bundleTex(w), SIZE, { order: 18 }); s.position.z = 0.06; G.root.add(s);
        const ring = K.sprite(K.ringTex, SIZE * 1.2, { color: '#fff3b0', opacity: 0, order: 17 }); ring.position.z = 0.055; G.root.add(ring);
        const dust = K.sprite(dustTex(), SIZE * 1.4, { opacity: 0, order: 19 }); dust.position.z = 0.065; G.root.add(dust);
        return { i, s, ring, dust, u: SPOTS[i][0], v: SPOTS[i][1], ph: i * 1.7, hl: 0, pulse: 0, dropping: false, gone: false, fall: 0, vy: 0, dustT: -1 };
      });
      G.btns = G.ui.buttons([
        { label: 'Let go', kind: 'red', aria: 'Let go: set this bundle down', press: () => letGo() },
        { label: 'What is it?', kind: 'black', aria: 'Say again what she is carrying', press: () => again() },
      ]);
      G.band = band(K.audio());
      // (the score panel appears when play begins, not behind the start banner)
      G.onGo = () => { hud(); G.t0 = G.t; G.band.level(1, 1.5); G.afterWalk = 0.5; };
      K.intro(G, { title: 'Set it down', how: 'She is walking to the door, but she is carrying old embarrassment. When you hear what she is carrying, press LET GO, or tap the painting.',
        say: 'Set it down. She is walking to the door. But she is carrying old embarrassment, and it is heavy. When you hear what she is carrying, press Let go. Or tap the painting.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni;
      u.uT.value = G.t; u.uA.value += (1 - u.uA.value) * Math.min(1, dt * 2);
      G.prog += (G.target - G.prog) * Math.min(1, dt * 1.6);
      G.zoom += (G.zoomTo - G.zoom) * Math.min(1, dt * (G.walkT > 0 ? 1.2 : 0.6));
      // walking: a gentle step bob and footsteps while the view moves in
      if (G.walkT > 0) { G.walkT -= dt; const ph0 = G.walkPh; G.walkPh += dt * 6.5; if (Math.floor(ph0 / Math.PI) !== Math.floor(G.walkPh / Math.PI)) step(Math.floor(G.walkPh / Math.PI) % 2 ? -0.3 : 0.3); }
      const walking = G.walkT > 0 ? 1 : 0;
      u.uBob.value = Math.abs(Math.sin(G.walkPh)) * 0.004 * walking + Math.sin(G.t * 1.1) * 0.0008;
      u.uZoom.value = G.zoom; u.uProg.value = G.prog; u.uTall.value = -0.03 + 0.065 * G.prog + 0.004 * Math.sin(G.t * 1.4);
      if (G.band) G.band.set(G.prog, G.t);
      if (G.afterWalk > 0) { G.afterWalk -= dt; if (G.afterWalk <= 0 && G.phase === 'walk' && G.playing) next(); }
      // waiting on a bundle: a nudge if nothing happens for a while; the bot lets go after it hears it
      if (G.active && G.playing) {
        G.idleT -= dt; if (G.idleT <= 0) { G.say(NUDGE); G.active.pulse = 1; G.idleT = IDLE; }
        if (G.bot) { G.botT -= dt; if (G.botT <= 0) letGo(); }
      }
      // the bundles: hanging and swaying beside her, heavy; the named one pulses; dropped ones fall, thud, crumble away
      for (const b of G.bundles) {
        if (b.gone) continue;
        const [du, dv] = zp(b.u, b.v), sc = SIZE * Math.sqrt(G.zoom);
        if (b.dropping) {
          b.vy += dt * 1.6; b.fall += b.vy * dt;
          const land = Math.min(0.97, dv + 0.25);
          let yv = dv + b.fall;
          if (yv >= land && b.dustT < 0) { yv = land; b.dustT = 0; thud(panOf(b.u) * 0.6); }
          if (b.dustT >= 0) { yv = land; b.dustT += dt; const k = Math.min(1, b.dustT / 0.9);
            b.s.material.opacity = 1 - k; b.s.scale.set(sc * (1 + k * 0.2), sc * (1 - k * 0.7), 1);
            const [x, y] = G.S.P(du, land); b.dust.position.set(x, y, 0.065); b.dust.material.opacity = Math.sin(k * Math.PI) * 0.9; b.dust.scale.setScalar(sc * (1 + k * 1.4));
            if (k >= 1) { b.gone = true; b.s.visible = false; b.dust.visible = false; b.ring.visible = false; }
          }
          const [x, y] = G.S.P(du, Math.min(yv, land)); b.s.position.set(x, y, 0.06); b.s.material.rotation = b.fall * 3 * (b.u < 0.5 ? -1 : 1);
          if (b.dustT < 0) b.s.scale.set(sc, sc, 1);
          b.ring.material.opacity = 0;
          continue;
        }
        b.pulse = Math.max(0, b.pulse - dt * 0.8);
        const sway = Math.sin(G.t * 1.2 + b.ph) * 0.06, heavyBob = Math.sin(G.t * 0.9 + b.ph) * 0.004 + Math.abs(Math.sin(G.walkPh)) * 0.006 * walking;
        const [x, y] = G.S.P(du, dv + heavyBob);
        const hot = b === G.active ? 1 : 0, beat = hot ? 1 + 0.07 * Math.sin(G.t * 6) + b.pulse * 0.2 : 1;
        b.s.position.set(x, y, 0.06); b.s.material.rotation = sway; b.s.scale.set(sc * beat, sc * beat, 1);
        b.s.material.opacity = hot ? 1 : 0.86;
        b.ring.position.set(x, y, 0.055); b.ring.scale.setScalar(sc * (1.15 + 0.12 * Math.sin(G.t * 4))); b.ring.material.opacity = hot * (0.6 + 0.3 * Math.sin(G.t * 4));
      }
      // the door: she reaches it, hears the words, the light pours out, and she walks through
      if (G.phase === 'door' && G.doorT >= 0) {
        G.doorT += dt;
        if (G.said === 0 && G.doorT > 2.2) { G.said = 1; G.say('She reached the door. Blindness is respectable.'); G.ui.alert('Blindness is respectable', 'The words that changed everything', 3.6, 'black'); }
        if (G.said === 1 && G.doorT > 4.6) { G.said = 2; chime(); G.buzz([60, 40, 160]); G.say('The door opens. She has worth. She always did.'); }
        if (G.said >= 2) { G.door = Math.min(1, G.door + dt * 0.6); if (G.doorT > 6.5 && G.said === 2) { G.said = 3; G.zoomTo = 2.5; G.walkT = 3; } }
        if (G.said === 3 && G.doorT > 9.5 && !G.over) {
          G.said = 4;
          const t = Math.round(G.t - G.t0), r = K.best('self-worth:door', t, 'lower');
          G.band.level(0.35, 1);
          K.finale(G, { won: true, kicker: 'You did it', title: 'Through the door', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Let go', v: '6/6' }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }],
            say: 'Through the door. Here is Nikki, in her own words.' });
          // then Nikki tells it herself (if her clip can't play, her words are read instead)
          G.clipT = setTimeout(() => {
            if (!G || G.bot) return;
            const a = new Audio(NIKKI); G.clip = a; a.volume = 1;
            a.play().catch(() => { if (!G || G.clip !== a) return; const b = new Audio(NIKKI2); G.clip = b; b.volume = 1; b.play().catch(() => { if (G && G.work && G.work.quote) G.say(G.work.quote); }); });
          }, 3200);
        }
      }
      u.uDoor.value = G.door;
      const [gu, gv] = zp(0.5, 0.49), [gx, gy] = G.S.P(gu, gv);
      G.glow.position.set(gx, gy, 0.05); G.glow.scale.set(Math.min(0.62, 0.3 * G.zoom), Math.min(G.h * 0.9, 0.6 * G.zoom), 1); G.glow.material.opacity = G.door * (0.3 + 0.06 * Math.sin(G.t * 2.2));
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      if (G.S.toBoard(ev, G.root)) letGo();
    },
    pause() { if (G) { G.paused = true; if (G.band) G.band.level(0, 0.2); if (G.clip) G.clip.pause(); } },
    resume() { if (G) { G.paused = false; if (G.band) G.band.level(G.over ? 0.35 : G.playing ? 1 : 0, 0.4); if (G.clip && G.clip.paused && !G.clip.ended) G.clip.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'set-it-down', phase: G.phase, playing: G.playing, over: G.over, dropped: G.dropped, active: G.active && BUNDLES[G.active.i], prog: +G.prog.toFixed(2), zoom: +G.zoom.toFixed(2), door: +G.door.toFixed(2), t: +G.t.toFixed(1) }; },
    stop() {
      if (!G) return;
      clearTimeout(G.clipT);
      if (G.clip) { G.clip.pause(); G.clip.removeAttribute('src'); G.clip.load(); }
      if (G.band) G.band.stop();
      K.cleanup(G); G = null;
    },
  };
}
