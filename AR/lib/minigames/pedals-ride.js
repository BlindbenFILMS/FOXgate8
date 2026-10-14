// PEDALS OF FREEDOM (Bill McCann): RIDE THE BLOCK, be Bill's eyes.
// Bill lost his sight at six and learned to ride anyway. He starts small, far down the lane, and pedals toward you,
// growing bigger until he rides right back into his place in the painting. Things are in the road (a ball, a cat,
// a puddle, a trash can, a branch, a dog, a skateboard): he can't see them, so you call it out. Say "LEFT!" or
// "RIGHT!" (or press the buttons, or tap the left or right side of the screen) and he swerves. His legs pedal, the
// bike's headlight glows, and every thing in the road makes its own sound from where it is, so you can guide him by ear.
// The street behind him was filled in (media/games/pedals/road.jpg) and he was cut out (rider.png).
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/pedals/';
const BOX = { x0: 0.3359, y0: 0.0859, x1: 0.8604, y1: 1.0 };   // where Bill and his bike sit in the painting
const ANCHOR = { lx: 0.37, ly: 0.985 };                         // the front wheel's contact point, inside that box
const FAR = { u: 0.335, v: 0.47 };                              // where the lane disappears: he starts here
const RIDE = 52, LANE = 0.17, AHEAD = 0.075;                    // seconds for the whole block; lane width at full size; how far ahead things appear
const THINGS = [
  { e: '⚽', name: 'a ball', snd: 'boing' }, { e: '🐈', name: 'a cat', snd: 'meow' }, { e: '💧', name: 'a puddle', snd: 'splash' },
  { e: '🗑️', name: 'a trash can', snd: 'clank' }, { e: '🌿', name: 'a branch', snd: 'crack' }, { e: '🐕', name: 'a dog', snd: 'woof' }, { e: '🛹', name: 'a skateboard', snd: 'rumble' },
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Bill on his bike, with his legs pedalling (local u, v inside his box, v from the top)
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uPh, uA, uPed;
const vec2 L = vec2(0.18, 0.66), LR = vec2(0.11, 0.15);   // his leg on the left of the picture
const vec2 R = vec2(0.515, 0.61), RR = vec2(0.12, 0.12);  // and on the right
float leg(vec2 p, vec2 c, vec2 r){ vec2 q = (p - c) / r; return (1.0 - smoothstep(0.75, 1.05, length(q))) * clamp(0.5 + q.y * 0.5, 0.0, 1.0); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  s.y -= sin(uPh) * 0.028 * uPed * leg(p, L, LR);            // one foot down while the other comes up
  s.y -= sin(uPh + 3.14159) * 0.024 * uPed * leg(p, R, RR);
  vec4 c = texture2D(map, vec2(s.x, 1.0 - s.y));
  gl_FragColor = vec4(c.rgb, c.a * uA);
}`;

export function rideTheBlockGame() {
  let G = null;
  const ease = t => 1 - Math.pow(1 - t, 1.6);
  const scaleAt = p => 0.16 + 0.84 * ease(p);
  // the road point (painting u, v) at progress p, in lane l
  function roadAt(p, l) {
    const e = ease(p), fx = BOX.x0 + ANCHOR.lx * (BOX.x1 - BOX.x0), fy = BOX.y0 + ANCHOR.ly * (BOX.y1 - BOX.y0);
    return { u: FAR.u + (fx - FAR.u) * e + l * LANE * scaleAt(p), v: FAR.v + (fy - FAR.v) * e };
  }

  /* sounds for the things in the road, from where they are */
  function thingSound(kind, pan, vol = 1) {
    const ac = K.audio(), t = ac.currentTime + 0.02, o = (f, d, opt) => K.tone(f, d, { pan, ...opt, vol: (opt.vol || 0.12) * vol });
    if (kind === 'boing') { o(220, 0.35, { slide: 420, type: 'triangle', vol: 0.16 }); o(440, 0.25, { slide: 300, delay: 0.3, type: 'triangle', vol: 0.1 }); }
    if (kind === 'meow') { o(700, 0.45, { slide: -260, type: 'sawtooth', vol: 0.05 }); o(1400, 0.4, { slide: -500, vol: 0.04 }); }
    if (kind === 'splash') { K.noise(0.4, { vol: 0.22 * vol, pan, freq: 2500, sweepTo: 600, q: 0.7 }); }
    if (kind === 'clank') { [523, 787, 1210].forEach((f, i) => o(f, 0.5, { type: 'square', vol: 0.05, delay: i * 0.01 })); K.noise(0.1, { vol: 0.2 * vol, pan, freq: 3000 }); }
    if (kind === 'crack') { for (let i = 0; i < 4; i++) K.noise(0.05, { vol: 0.25 * vol, pan, freq: 1800 + i * 400, delay: i * 0.06, q: 3 }); }
    if (kind === 'woof') { o(300, 0.18, { slide: -120, type: 'sawtooth', vol: 0.12 }); o(300, 0.18, { slide: -120, type: 'sawtooth', vol: 0.1, delay: 0.28 }); }
    if (kind === 'rumble') { K.noise(0.8, { vol: 0.18 * vol, pan, freq: 300, q: 0.6 }); }
  }
  const bell = () => { [0, 0.18].forEach(d => [2100, 3300].forEach((f, i) => K.tone(f, 0.6, { type: 'triangle', vol: i ? 0.06 : 0.12, delay: d }))); };

  function hud() {
    G.ui.panel('Ride the block', `${G.dodged}<small>dodged</small>`, { segs: [Math.round(G.p * 10), 10], sub: `Bumps ${G.bumps} · Call LEFT or RIGHT` + (G.listening ? ' · 🎤 listening' : '') });
  }
  function steer(dir, how = 'button') {
    if (!G || !G.playing || G.finishing) return;
    const to = Math.max(-1, Math.min(1, G.lane + dir));
    if (to === G.lane) { K.tone(160, 0.12, { type: 'square', vol: 0.05, pan: dir * 0.8 }); G.ui.pop(dir < 0 ? 'Edge!' : 'Edge!'); return; }
    G.lane = to; G.buzz(20); K.noise(0.18, { vol: 0.12, freq: 900, sweepTo: 2200, pan: dir * 0.7 });
    if (how === 'voice') G.ui.pop(dir < 0 ? '◀ LEFT' : 'RIGHT ▶');
  }
  // listen for "left" and "right"
  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR || G.bot) return;
    try {
      const r = new SR(); r.lang = 'en-US'; r.continuous = true; r.interimResults = true; G.sr = r; G.heard = new Map();
      r.onresult = e => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const words = e.results[i][0].transcript.toLowerCase().match(/\b(left|right|write|lift|light)\b/g) || [], n = G.heard.get(i) || 0;
          for (let k = n; k < words.length; k++) steer(/left|lift/.test(words[k]) ? -1 : 1, 'voice');
          G.heard.set(i, Math.max(n, words.length));
        }
      };
      r.onend = () => { if (G && G.playing && !G.finishing && G.sr === r) { try { r.start(); } catch (e) {} } };   // keep listening
      r.onerror = () => {};
      r.start(); G.listening = true;
    } catch (e) { G.listening = false; }
  }
  function spawn() {
    const k = THINGS[G.spawned % THINGS.length], lane = [-1, 0, 1][Math.floor(Math.random() * 3)];
    const lanePick = lane === G.lane || Math.random() < 0.55 ? G.lane : lane;   // most things come in Bill's own lane: you have to call it
    const q = Math.min(0.93, G.p + AHEAD), s = K.sprite(K.emojiTex(k.e, { ring: true, color: '#ffffff', bg: 'rgba(20,20,20,.55)' }), 0.1, { order: 25, opacity: 0 });
    s.position.z = 0.06; G.root.add(s);
    G.things.push({ ...k, q, lane: lanePick, s, warned: false, done: false });
    G.spawned++;
    const pan = Math.max(-1, Math.min(1, (lanePick - G.lane) * 0.7));
    thingSound(k.snd, pan, 1); G.say(`${k.name[0].toUpperCase() + k.name.slice(1)} ahead!`);
  }
  function finish() {
    G.finishing = true; G.endT = 0; G.lane = 0;
    G.ui.alert('You rode the block!', 'Bill knows every bump now.', 2.6, 'red'); G.say('You rode the whole block! Bill knows every bump now.'); bell();
  }

  return {
    title: 'Ride the block',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { p: 0, lane: 0, laneX: 0, dodged: 0, bumps: 0, things: [], spawned: 0, nextSpawn: 4, slow: 0, wob: 0, ph: 0, tick: 0, finishing: false, endT: -1, t0: 0, listening: false });
      // the empty street over the painting, then Bill on his bike on top
      G.road = K.plane(null, 1.002, G.h + 0.002, { order: 11, opacity: 0 }); G.road.position.z = 0.03; G.root.add(G.road);
      new THREE.TextureLoader().load(ART + 'road.jpg', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.road.material.map = t; G.road.material.needsUpdate = true; G.roadOK = true; });
      const bw = BOX.x1 - BOX.x0, bh = (BOX.y1 - BOX.y0) * G.h;
      G.uni = { map: { value: null }, uPh: { value: 0 }, uA: { value: 0 }, uPed: { value: 1 } };
      const geo = new THREE.PlaneGeometry(bw, bh); geo.translate(bw * (0.5 - ANCHOR.lx), bh * (ANCHOR.ly - 0.5), 0);   // pivot at the front wheel
      G.rider = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.rider.renderOrder = 20; G.rider.position.z = 0.05; G.root.add(G.rider);
      new THREE.TextureLoader().load(ART + 'rider.png', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.riderOK = true; });
      // the headlight: a warm glow and a little flare
      G.lamp = K.sprite(K.glowTex, 0.12, { color: '#fff1b8', additive: true, opacity: 0, order: 22 }); G.lamp.position.z = 0.055; G.root.add(G.lamp);
      G.flare = K.plane(K.canvasTex(256, 32, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgba(255,240,190,0)'); gr.addColorStop(0.5, 'rgba(255,245,210,1)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; g.fillRect(0, H / 2 - 3, W, 6); }), 0.3, 0.04, { order: 23, additive: true, opacity: 0 });
      G.flare.position.z = 0.056; G.root.add(G.flare);
      G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'red', aria: 'Call left', press: () => steer(-1) },
        { label: 'Right', icon: '▶', kind: 'red', aria: 'Call right', press: () => steer(1) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; listen(); bell(); hud(); };
      K.intro(G, { title: 'Ride the block', how: 'Bill can’t see the road, so you’re his eyes. When something is in his way, call out LEFT or RIGHT (or use the buttons) and he’ll swerve.',
        say: 'Ride the block. Bill lost his sight when he was six, and he still rode his bike everywhere. You are his eyes today. Things will be in the road. Each one makes a sound from where it is. Shout LEFT or RIGHT, or press the buttons, and Bill will swerve around it. Ready? Ride!' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const fadeIn = G.roadOK && G.riderOK ? 1 : 0;
      G.road.material.opacity += ((G.endT > 2.4 ? 0 : fadeIn) - G.road.material.opacity) * Math.min(1, dt * 2);
      G.uni.uA.value += ((G.endT > 2.4 ? 0 : fadeIn) - G.uni.uA.value) * Math.min(1, dt * 2);
      // riding: speed (slower for a moment after a bump), pedalling, the freewheel ticking
      const speed = G.playing && !G.finishing ? (G.slow > 0 ? 0.35 : 1) / RIDE : G.finishing && G.p < 1 ? 1.4 / RIDE : 0;
      if (G.slow > 0) G.slow -= dt;
      G.p = Math.min(1, G.p + speed * dt);
      G.ph += dt * (speed > 0 ? 7 : 0.5); G.uni.uPh.value = G.ph; G.uni.uPed.value = G.p >= 1 ? Math.max(0, G.uni.uPed.value - dt * 2) : 1;
      if (speed > 0) { G.tick -= dt; if (G.tick <= 0) { G.tick = 0.09; K.tone(3200, 0.012, { type: 'square', vol: 0.012 }); } }
      // where Bill is: along the lane, in his lane, growing bigger as he comes closer
      G.laneX += (G.lane - G.laneX) * Math.min(1, dt * 6);
      G.wob = Math.max(0, G.wob - dt * 2.2);
      const sc = scaleAt(G.p), at = roadAt(G.p, G.laneX), [x, y] = G.S.P(at.u, at.v);
      G.rider.position.set(x, y, 0.05); G.rider.scale.setScalar(sc); G.rider.rotation.z = Math.sin(G.t * 26) * 0.12 * G.wob + (G.laneX - G.lane) * -0.25 + Math.sin(G.ph * 0.5) * 0.01 * (speed > 0 ? 1 : 0);
      // the headlight sits on his handlebars
      const lp = new THREE.Vector3((BOX.x0 + 0.418 * (BOX.x1 - BOX.x0)) - (BOX.x0 + ANCHOR.lx * (BOX.x1 - BOX.x0)), -((0.469 - ANCHOR.ly) * (BOX.y1 - BOX.y0) * G.h), 0).multiplyScalar(sc).applyAxisAngle(new THREE.Vector3(0, 0, 1), G.rider.rotation.z);
      const pulse = 0.85 + Math.sin(G.t * 5) * 0.08;
      G.lamp.position.set(x + lp.x, y + lp.y, 0.055); G.lamp.scale.setScalar(0.07 + sc * 0.11); G.lamp.material.opacity = G.uni.uA.value * 0.85 * pulse + (G.endT >= 0 ? 0.15 : 0);
      G.flare.position.copy(G.lamp.position); G.flare.scale.setScalar(0.3 + sc * 0.9); G.flare.material.opacity = G.uni.uA.value * 0.5 * pulse;
      // things in the road: they come into view ahead of Bill, and he either swerves or bumps
      for (const k of G.things) {
        if (k.done && k.s.material.opacity <= 0.01) continue;
        const ks = scaleAt(k.q), ka = roadAt(k.q, k.lane), [kx, ky] = G.S.P(ka.u, ka.v - 0.035 * ks);
        k.s.position.set(kx, ky, 0.06); k.s.scale.setScalar(0.05 + ks * 0.09);
        const show = k.done ? 0 : Math.min(1, (AHEAD - (k.q - G.p)) / 0.02 + 0.3);
        k.s.material.opacity += (show - k.s.material.opacity) * Math.min(1, dt * 6);
        k.s.renderOrder = k.q > G.p ? 25 : 18;
        if (!k.done && !k.warned && k.q - G.p < AHEAD * 0.45 && k.lane === G.lane) { k.warned = true; bell(); }   // Bill rings his bell when it's close
        if (!k.done && G.p >= k.q) {
          k.done = true;
          if (Math.abs(G.laneX - k.lane) < 0.5) { G.bumps++; G.wob = 1; G.slow = 0.9; thingSound(k.snd, 0, 1.3); K.sfx.bad(); G.buzz([80, 40, 120]); G.fx.add(kx, ky, '#ffcf6b', 14, 0.3); G.ui.alert('Bump!', 'Ouch. Call it sooner.', 1.2, 'red'); }
          else { G.dodged++; K.sfx.good(0, G.dodged); G.fx.add(kx, ky, '#ffffff', 10, 0.2); G.ui.pop('Dodged!'); }
          hud();
        }
      }
      if (!G.playing) return;
      if (!G.finishing) {
        if (G.p < 0.86) { G.nextSpawn -= dt; if (G.nextSpawn <= 0 && !G.things.some(k => !k.done)) { spawn(); G.nextSpawn = 2.6 + Math.random() * 1.4; } }
        else if (!G.things.some(k => !k.done)) finish();
      }
      // the end: he rides back into his own place in the painting, then the street fades and the painting comes alive
      if (G.finishing && G.p >= 1) {
        G.endT += dt;
        if (G.endT > 3.4 && !G.over) {
          try { G.sr && G.sr.stop(); } catch (e) {} G.sr = null;
          const t = Math.round(G.t - G.t0), r = K.best('pedals-of-freedom:ride', G.bumps, 'lower');
          K.finale(G, { won: true, title: 'You rode the block', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Dodged', v: G.dodged }, { k: 'Bumps', v: G.bumps }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        }
      }
      // the robot: calls the right way just in time
      if (G.bot) { const k = G.things.find(k => !k.done); if (k && k.lane === G.lane && k.q - G.p < AHEAD * 0.4) steer(G.lane >= 0 ? -1 : 1); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      steer(ev.clientX < innerWidth / 2 ? -1 : 1, 'tap');   // tap the left or right side of the screen
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'ride', playing: G.playing, over: G.over, p: +G.p.toFixed(3), lane: G.lane, dodged: G.dodged, bumps: G.bumps, things: G.things.length, finishing: G.finishing, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.sr && G.sr.abort(); } catch (e) {} G.sr = null; } K.cleanup(G); G = null; },
  };
}
