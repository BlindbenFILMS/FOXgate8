// INVISIBLY, OURS (Doreen Holmes): MEET THE CROWD.
// "You don't look blind." Tap anyone in Doreen's painted crowd (or press MEET SOMEONE). That person lights up, the
// crowd around them dims a little as if they stepped forward, and they tell you in one line what they live with that
// you can't see. Meet 5 people. Then the whole crowd glows and Doreen herself says it: "Sometimes disabilities are
// not visible." No searching and no listening skill needed: every tap gets a sound and a story.
import * as THREE from 'three';
import * as K from './kit.js';

const DOREEN = new URL('../../../3D/gallery/audio/wing_3_1.mp3', import.meta.url).href;   // Doreen's own words
const DOREEN_SAYS = '“I said, ‘You know what, ma’am?’ I said, ‘Sometimes disabilities are not visible.’”';
const PEOPLE = [   // the blind person is always last: Doreen's own story. Each person has their own recorded voice (see the merge note).
  { id: 'lowvision', name: 'Maria', voice: 'female', pitch: 1.15, tag: 'Maria · Low vision', line: 'Hi, my name is Maria. I have low vision. My phone reads the signs to me.' },
  { id: 'hearing', name: 'James', voice: 'male', pitch: 0.8, tag: 'James · Hearing aids', line: 'Hi, my name is James. I wear hearing aids. You can’t see them under my hair.' },
  { id: 'pain', name: 'Keisha', voice: 'female', pitch: 0.95, tag: 'Keisha · Chronic pain', line: 'Hi, my name is Keisha. I live with pain every day. Some days I need to sit.' },
  { id: 'autism', name: 'Leo', voice: 'male', pitch: 1.1, tag: 'Leo · Autistic', line: 'Hi, my name is Leo. I am autistic. My headphones help with the noise.' },
  { id: 'blind', name: 'Rosa', voice: 'female', pitch: 1.0, tag: 'Rosa · Blind', line: 'Hi, my name is Rosa. I am blind. People tell me I don’t look blind.' },
];
const GOAL = PEOPLE.length, TALK = 6.8;   // seconds each person talks before you can meet the next

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform vec2 uP; uniform float uA, uH;
void main(){
  vec2 p = vec2(vUv.x, (1.0 - vUv.y) * uH);
  float d = length(p - vec2(uP.x, uP.y * uH));
  gl_FragColor = vec4(0.02, 0.02, 0.05, uA * smoothstep(0.06, 0.2, d));
}`;

export function meetCrowdGame() {
  let G = null;

  // each person's own little sound, from their side of the painting
  function sound(id, pan) {
    const T = (f, d, o = {}) => K.tone(f, d, { pan, vol: 0.1, ...o });
    if (id === 'blind') { K.noise(0.04, { vol: 0.5, pan, freq: 3800, q: 3 }); K.noise(0.04, { vol: 0.4, pan, freq: 3400, q: 3, delay: 0.22 }); }
    if (id === 'lowvision') for (let i = 0; i < 6; i++) T(500 + ((i * 137) % 5) * 60, 0.06, { type: 'square', vol: 0.05, delay: i * 0.07 });
    if (id === 'hearing') { T(2637, 0.25, { vol: 0.08 }); T(3136, 0.3, { vol: 0.07, delay: 0.14 }); }
    if (id === 'pain') K.noise(0.9, { vol: 0.25, pan, freq: 500, sweepTo: 260, q: 0.8, type: 'lowpass' });
    if (id === 'autism') [523, 659, 784, 659].forEach((f, i) => T(f, 0.16, { type: 'sawtooth', vol: 0.05, delay: i * 0.12 }));
  }
  function murmur(dt) {
    G.mT -= dt; if (G.mT > 0) return; G.mT = 0.2 + Math.random() * 0.3;
    K.noise(0.35, { vol: 0.03, pan: Math.random() * 2 - 1, freq: 350 + Math.random() * 600, q: 2.5 });
  }
  function hud() { G.ui.panel('Meet the crowd', `${G.met}<small>of ${GOAL} met</small>`, { segs: [G.met, GOAL] }); }

  function meet(u, v) {
    if (G.phase !== 'play') return;
    if (G.wait > 0) { K.tone(392, 0.08, { type: 'triangle', vol: 0.04 }); return; }   // they're still talking
    const p = PEOPLE[G.met], pan = (u - 0.5) * 1.6;
    G.met++; G.wait = TALK; G.spot = { u, v }; G.lit = 0;
    // a happy chime, then their own sound
    [523.3, 659.3, 784].forEach((f, k) => K.tone(f * (1 + G.met * 0.06), 0.5, { type: 'triangle', vol: 0.11, delay: k * 0.07, pan }));
    setTimeout(() => G && sound(p.id, pan), 250);
    G.buzz(40);
    const [x, y] = G.S.P(u, v);
    const g = K.sprite(K.glowTex, 0.2, { additive: true, color: '#ffd27a', order: 30, opacity: 0 }), r = K.sprite(K.ringTex, 0.12, { color: '#ffc21a', order: 31, opacity: 0 });
    g.position.set(x, y, 0.05); r.position.set(x, y, 0.055); G.root.add(g, r); G.glows.push({ g, r, t: 0, ph: G.met });
    G.fx.add(x, y, '#ffc21a', 22, 0.28);
    G.ui.alert(p.tag, p.line, TALK - 0.2, 'black');
    window.__sayVoice = { voice: p.voice, pitch: p.pitch };   // a hint for the computer voice until the real recordings are in
    G.say(p.line);
    window.__sayVoice = null;
    hud();
    if (G.met >= GOAL) { G.ui.buttons([]); }
  }
  function meetSomeone() {   // for the button (and the bot): someone not too close to the people already met
    let best = null;
    for (let k = 0; k < 12; k++) {
      const c = { u: 0.1 + Math.random() * 0.8, v: 0.12 + Math.random() * 0.78 };
      const far = Math.min(1, ...G.glows.filter(x => x.r.material.map).map(x => Math.hypot(x.g.position.x - G.S.P(c.u, c.v)[0], x.g.position.y - G.S.P(c.u, c.v)[1])));
      if (!best || far > best.far) best = { ...c, far };
    }
    meet(best.u, best.v);
  }

  return {
    title: 'Meet the Crowd',
    start(ctx) {
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', met: 0, wait: 0, spot: { u: 0.5, v: 0.5 }, lit: 0, glows: [], mT: 0, botT: 1, endT: 0, playT: 0 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
        uniforms: { uP: { value: new THREE.Vector2(0.5, 0.5) }, uA: { value: 0 }, uH: { value: G.h } } }));
      m.position.z = 0.02; m.renderOrder = 12; G.root.add(m); G.shade = m;
      G.onGo = () => {
        G.phase = 'play'; hud();
        G.ui.buttons([{ label: 'Meet someone', kind: 'red', aria: 'Meet someone in the crowd', press: meetSomeone }]);
      };
      K.intro(G, { title: 'Meet the Crowd', how: 'Tap anyone in the crowd to meet them. Meet 5 people.',
        say: 'Meet the Crowd. Everyone here has a story you cannot see. Tap anyone in the crowd to meet them, or press Meet someone. Meet 5 people.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.shade.material.uniforms;
      // the crowd dims a little around whoever is talking, as if they stepped forward
      const talking = G.phase === 'play' && G.wait > 0.3 && G.met > 0;
      U.uA.value += ((talking ? 0.5 : 0) - U.uA.value) * Math.min(1, dt * 5); U.uP.value.set(G.spot.u, G.spot.v);
      for (const gl of G.glows) { gl.t += dt; const a = Math.min(1, gl.t * 2); gl.g.material.opacity = a * (0.55 + 0.2 * Math.sin(G.t * 2 + gl.ph)); if (gl.r.material.map) { gl.r.material.opacity = a * 0.9; gl.r.scale.setScalar(0.11 + 0.012 * Math.sin(G.t * 3 + gl.ph)); } }
      if (G.phase === 'play') {
        G.playT += dt; murmur(dt);
        if (G.wait > 0) { G.wait -= dt; if (G.wait <= 0 && G.met >= GOAL) { G.phase = 'glow'; G.endT = 0; } }
        if (G.bot && G.wait <= 0 && G.met < GOAL) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.6; meetSomeone(); } }
      } else if (G.phase === 'glow') {
        // the whole crowd glows, then Doreen speaks
        G.endT += dt; murmur(dt);
        if (G.glowN === undefined) G.glowN = 0;
        if (G.glowN < 55 && Math.random() < 0.7) {
          G.glowN++; const s = K.sprite(K.glowTex, 0.08 + Math.random() * 0.06, { additive: true, color: ['#ffd27a', '#ffffff', '#ffb36a'][G.glowN % 3], order: 29, opacity: 0 });
          const [x, y] = G.S.P(0.04 + Math.random() * 0.92, 0.04 + Math.random() * 0.92); s.position.set(x, y, 0.05); G.root.add(s); G.glows.push({ g: s, r: { material: {} }, t: 0, ph: G.glowN });
          if (G.glowN % 5 === 0) K.tone(K.SCALES.penta[(G.glowN / 5) % 11 | 0], 0.6, { type: 'triangle', vol: 0.06, pan: x * 1.6 });
        }
        if (G.endT > 2.2 && !G.au) {
          G.say('');   // quiet the computer voice so Doreen is heard
          try { G.au = new Audio(DOREEN); G.au.play().catch(() => { G.auFail = true; }); G.au.onended = () => { G.auDone = true; }; } catch (e) { G.auFail = true; }
          G.ui.alert('Doreen Holmes', DOREEN_SAYS, 7.5, 'black');
          if (G.auFail) G.say('Sometimes disabilities are not visible.');
        }
        if (G.au && (G.auDone || G.auFail || G.endT > 10.5) && !G.over) {
          const secs = Math.round(G.playT);
          K.finale(G, { won: true, kicker: 'You can’t tell by looking', title: 'Everyone is ours',
            cells: [{ k: 'Met', v: String(GOAL) }, { k: 'Time', v: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') }],
            line: G.work && G.work.quote, say: 'Everyone here is ours.' });
        }
      }
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down' || G.phase !== 'play') return;
      const p = G.S.toBoard(ev, G.root); if (!p || p.u < 0 || p.u > 1 || p.v < 0 || p.v > 1) return;
      meet(p.u, p.v);
    },
    pause() { if (G) { G.paused = true; if (G.au) G.au.pause(); } },
    resume() { if (G) { G.paused = false; if (G.au && !G.auDone) G.au.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { phase: G.phase, score: G.met, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.au) { G.au.pause(); G.au = null; } K.cleanup(G); G = null; },
  };
}
