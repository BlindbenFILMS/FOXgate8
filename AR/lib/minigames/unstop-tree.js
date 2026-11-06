// UNSTOPPABLE (Doreen Holmes): TREE POSE.
// "What's stopping you?" Doreen stands in tree pose on one leg in front of a huge lotus. She sways: keep her
// balanced with LEFT and RIGHT (hold the button, or press the left or right side of the screen). A calm tone is pure
// when she is centred and wobbles toward the side she leans. Every few steady seconds a lotus petal lights up and the
// painting grows warmer and brighter. Now and then a gust of doubt ("THE NEWS", "YOU CAN'T") blows in from one side
// and pushes her: hold steady and it blows away. Open 8 petals. Then Doreen tells her story in her own voice.
import * as THREE from 'three';
import * as K from './kit.js';

const DOREEN = new URL('../../../3D/gallery/audio/wing_3_2.mp3', import.meta.url).href;   // Doreen tells the story (23 s)
const PIVOT = [0.49, 0.93], BODY = [0.5, 0.5];   // her standing foot; the middle of her and the flower
const PETALS = [[0.12, 0.6], [0.16, 0.36], [0.33, 0.2], [0.5, 0.13], [0.7, 0.18], [0.86, 0.3], [0.9, 0.5], [0.78, 0.66]];
const DOUBTS = ['The news', 'You can’t', 'Too hard', 'Give up'];
const GOAL = 8, HOLD = 2.6, SAFE = 0.35;   // petals; steady seconds per petal; how far she can lean and still be "steady"

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uAng, uBloom, uRdy;
uniform vec2 uPivot, uBody;
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float m = 1.0 - smoothstep(0.28, 0.52, distance(p, uBody));      // she and her flower sway; the sky stays
  float a = -uAng * m, c = cos(a), s = sin(a);
  vec2 d = p - uPivot; vec2 q = uPivot + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
  vec3 col = texture2D(map, vec2(q.x, 1.0 - q.y)).rgb;
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 dull = mix(vec3(g), col, 0.25) * 0.72;                       // before the bloom: pale and dim
  vec3 warm = col * (1.0 + 0.12 * uBloom) + vec3(0.06, 0.02, 0.03) * uBloom;
  gl_FragColor = vec4(mix(dull, warm, uBloom), uRdy);
}`;

export function treePoseGame() {
  let G = null;

  /* ── the balance tone: pure when centred, beating and off to one side when she leans ── */
  function startDrone() {
    const ac = K.audio(); if (!ac) return;
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), pan = ac.createStereoPanner ? ac.createStereoPanner() : null, f = ac.createBiquadFilter();
    o1.type = 'triangle'; o2.type = 'triangle'; o1.frequency.value = 220; o2.frequency.value = 220.5; f.type = 'lowpass'; f.frequency.value = 1400;
    g.gain.value = 0; o1.connect(f); o2.connect(f); f.connect(g); if (pan) { g.connect(pan); pan.connect(ac.destination); } else g.connect(ac.destination);
    o1.start(); o2.start(); G.drone = { o1, o2, g, pan, ac };
  }
  function droneUpdate() {
    const D = G.drone; if (!D) return; const t = D.ac.currentTime, L = Math.abs(G.lean);
    D.g.gain.setTargetAtTime(G.phase === 'play' ? 0.07 : 0, t, 0.2);
    D.o2.frequency.setTargetAtTime(220.5 + L * 14, t, 0.05);       // off-centre → it wobbles
    D.o1.frequency.setTargetAtTime(220 - L * 6, t, 0.05);
    if (D.pan) D.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, G.lean * 1.1)), t, 0.05);
  }
  function stopDrone() { const D = G && G.drone; if (!D) return; try { D.g.gain.setTargetAtTime(0, D.ac.currentTime, 0.1); D.o1.stop(D.ac.currentTime + 0.5); D.o2.stop(D.ac.currentTime + 0.5); } catch (e) {} G.drone = null; }
  function bells(dt) {   // soft temple bells under the game
    G.mT -= dt; if (G.mT > 0) return; G.mT = 3.2;
    const n = [392, 440, 523.3, 587.3, 659.3][G.mI++ % 5]; K.tone(n, 2.6, { vol: 0.03, attack: 0.02 }); K.tone(n * 2.01, 1.8, { vol: 0.012 });
  }

  function topAlert() { const e = document.querySelector('.mgk-alert'); if (e) e.classList.add('tree-top'); }
  function hud() {
    const L = G.lean, sub = Math.abs(L) < SAFE ? 'Steady. Hold her there.' : L < 0 ? 'Leaning LEFT: press RIGHT.' : 'Leaning RIGHT: press LEFT.';
    const key = G.petals + sub; if (key === G.hudKey) return; G.hudKey = key;
    G.ui.panel('Tree pose', `${G.petals}<small>of ${GOAL} petals</small>`, { segs: [G.petals, GOAL], sub, warn: Math.abs(L) > 0.75 });
  }
  function openPetal() {
    const i = G.petals++, [u, v] = PETALS[i], [x, y] = G.S.P(u, v);
    const s = K.sprite(K.glowTex, 0.22, { additive: true, color: '#ff9ab0', order: 30, opacity: 0 }); s.position.set(x, y, 0.06); G.root.add(s); G.glows.push({ s, t: 0, ph: i });
    G.fx.add(x, y, '#ffb3c4', 22, 0.3);
    const f = K.SCALES.penta[2 + i]; K.tone(f, 1.2, { type: 'triangle', vol: 0.12, pan: (u - 0.5) * 1.5 }); K.tone(f * 1.5, 1, { vol: 0.05, delay: 0.1, pan: (u - 0.5) * 1.5 });
    G.buzz(40);
    G.say(G.petals === GOAL ? 'The lotus is open!' : G.petals === GOAL - 1 ? 'One more petal.' : 'A petal opens.');
    if (G.petals >= GOAL) { G.phase = 'bloom'; G.endT = 0; G.ui.buttons([]); G.ui.hidePanel(); }
  }
  function gust() {
    const side = Math.random() < 0.5 ? -1 : 1, word = DOUBTS[G.gN++ % DOUBTS.length];
    const m = K.plane(K.wordTex(word.toUpperCase()), 0.36, 0.09, { order: 40 });
    const [x, y] = G.S.P(side < 0 ? -0.15 : 1.15, 0.28 + Math.random() * 0.3); m.position.set(x, y, 0.08); G.root.add(m);
    G.gusts.push({ m, side, t: 0, word });
    K.wind(1.6, { vol: 0.22, pan: side * 0.9, from: 300, to: 1500 });
    if (!G.saidGust) { G.saidGust = true; G.say('A gust of doubt! Hold her steady.'); }
  }
  function wobble() {
    G.lean = Math.sign(G.lean) * 0.55; G.vel = 0; G.steady = 0; G.wobbles++;
    K.tone(160, 0.4, { type: 'triangle', vol: 0.1, slide: -40, pan: Math.sign(G.lean) * 0.8 }); G.buzz([80]);
    G.ui.alert('Whoa!', 'Breathe. Bring her back to the middle.', 1.4, 'red'); topAlert();
    if (!G.saidWobble) { G.saidWobble = true; G.say('Whoa! Breathe, and bring her back to the middle.'); }
  }

  return {
    title: 'Tree Pose',
    start(ctx) {
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', lean: 0, vel: 0, push: 0, tapPush: 0, steady: 0, petals: 0, wobbles: 0, glows: [], gusts: [], gN: 0, gustT: 5, mT: 0, mI: 0, endT: 0, playT: 0, drift: 0, driftT: 0, botT: 0 });
      const tex = new THREE.TextureLoader().load(G.work.image, () => { G.mat.uniforms.uRdy.value = 1; });
      G.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
        uniforms: { map: { value: tex }, uAng: { value: 0 }, uBloom: { value: 0.25 }, uRdy: { value: 0 }, uPivot: { value: new THREE.Vector2(...PIVOT) }, uBody: { value: new THREE.Vector2(...BODY) } } });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), G.mat); m.position.z = 0.02; m.renderOrder = 11; G.root.add(m);
      startDrone();
      // pop-up messages sit right over the petals banner at the top, so they never cover Doreen or the lotus
      G.css = document.createElement('style');
      G.css.textContent = '.mgk-alert.tree-top{top:calc(66px + env(safe-area-inset-top)) !important;right:calc(12px + env(safe-area-inset-right)) !important;box-shadow:none !important;z-index:13;box-sizing:border-box;min-height:122px}';
      document.head.appendChild(G.css);
      G.onGo = () => {
        G.phase = 'play'; G.hudKey = ''; hud();
        G.ui.buttons([
          { label: 'Left', icon: '◀', aria: 'Lean her left', press: () => { G.push = -1; }, release: () => { if (G.push < 0) G.push = 0; } },
          { label: 'Right', icon: '▶', aria: 'Lean her right', press: () => { G.push = 1; }, release: () => { if (G.push > 0) G.push = 0; } },
        ]);
      };
      K.intro(G, { title: 'Tree Pose', how: 'Keep her balanced. If she leans one way, press the OTHER way. Stay steady to open 8 lotus petals.',
        say: 'Tree Pose. Doreen is balancing on one leg. Keep her steady. If she leans one way, press the other way. Listen: the tone is smooth when she is centered. Stay steady to open 8 lotus petals.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.mat.uniforms;
      if (G.phase === 'play') {
        G.playT += dt; bells(dt);
        if (G.bot) { const want = -Math.sign(G.lean) * (Math.abs(G.lean) > 0.08 ? 1 : 0); G.push = want; }
        // the sway: a slow wandering drift, a little tip-over, gusts, and your pushes
        G.driftT -= dt; if (G.driftT <= 0) { G.driftT = 1.2 + Math.random() * 1.5; G.drift = (Math.random() * 2 - 1) * (0.25 + 0.2 * G.petals / GOAL); }
        let force = G.drift + G.lean * 0.6 + G.push * 1.5;
        for (const gs of G.gusts) if (gs.t < 1.6) force += -gs.side * 0.9;   // a gust from the left pushes her right
        G.vel += (force - G.vel * 2.2) * dt; G.lean += G.vel * dt;
        if (Math.abs(G.lean) >= 1) wobble();
        // steady time opens petals
        if (Math.abs(G.lean) < SAFE) { G.steady += dt; if (G.steady >= HOLD) { G.steady = 0; openPetal(); } }
        else G.steady = Math.max(0, G.steady - dt * 0.5);
        G.gustT -= dt; if (G.gustT <= 0 && G.petals >= 1) { gust(); G.gustT = 6 + Math.random() * 4; }
        if (G.phase === 'play') hud();
      } else if (G.phase === 'bloom') {
        // she comes back to centre, the whole painting blooms, then Doreen speaks
        G.lean *= Math.pow(0.1, dt); G.endT += dt;
        if (G.endT > 1.8 && !G.over) {
          const secs = Math.round(G.playT);
          K.finale(G, { won: true, kicker: 'What’s stopping you?', title: 'Unstoppable!',
            cells: [{ k: 'Petals', v: String(GOAL) }, { k: 'Wobbles', v: String(G.wobbles) }, { k: 'Time', v: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') }],
            line: G.work && G.work.quote, say: 'Nothing stopped her.' });
          G.auT = 2.2;
        }
      }
      if (G.auT > 0) { G.auT -= dt; if (G.auT <= 0) { try { G.say(''); G.au = new Audio(DOREEN); G.au.play().catch(() => {}); } catch (e) {} } }
      droneUpdate();
      U.uAng.value = G.lean * 0.2 + Math.sin(G.t * 1.3) * 0.004;
      U.uBloom.value += ((0.25 + 0.75 * (G.petals / GOAL)) - U.uBloom.value) * Math.min(1, dt * 2);
      for (const gl of G.glows) { gl.t += dt; gl.s.material.opacity = Math.min(1, gl.t * 2) * (0.5 + 0.2 * Math.sin(G.t * 1.8 + gl.ph)); }
      for (let i = G.gusts.length - 1; i >= 0; i--) {
        const gs = G.gusts[i]; gs.t += dt;
        gs.m.position.x += -gs.side * dt * 0.55; gs.m.position.y += Math.sin(G.t * 4 + i) * dt * 0.05;
        gs.m.material.opacity = Math.max(0, Math.min(1, gs.t * 3, (2.4 - gs.t) * 1.5));
        if (gs.t > 2.4) { G.root.remove(gs.m); G.gusts.splice(i, 1); }
      }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      if (kind === 'down') G.push = ev.clientX < innerWidth / 2 ? -1 : 1;
      else if (kind === 'up') G.push = 0;
    },
    pause() { if (G) { G.paused = true; if (G.drone) G.drone.g.gain.value = 0; if (G.au) G.au.pause(); } },
    resume() { if (G) { G.paused = false; if (G.au && !G.au.ended) G.au.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { phase: G.phase, score: G.petals, wobbles: G.wobbles, lean: +G.lean.toFixed(2), t: +G.t.toFixed(1) }; },
    stop() { if (G && G.css) G.css.remove(); if (G && G.au) { G.au.pause(); G.au = null; } stopDrone(); K.cleanup(G); G = null; },
  };
}
