// WALK THROUGH FEAR (Ben Fox): SEE IT MY WAY, a game about sight.
// Words are hidden in the painting, and the painting is seen through Ben's vision-condition filters (the same maths as
// the Blindness Spectrum Simulator / Patient Experience simulator). It starts with how Ben sees: retinitis pigmentosa,
// his own diagnosis, a tunnel that closes in and narrows as you go. Then cataracts, macular degeneration and glaucoma. Find and tap each hidden word. Where the filter has a centre (macular
// degeneration's smudge, glaucoma's and RP's tunnel), it follows where the phone points, so you have to look around,
// or look just beside a word, the way people with these conditions really do. The last three words spell the painting.
// By ear: a soft hum grows when your finger or aim is near a hidden word, Hint says which way to look, and each round
// begins by describing the condition.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

// sev: how strong the filter is; narrow: how much stronger it gets as each word is found (Ben's tunnel keeps closing);
// slow: how slowly the filter comes over the painting at the start of the round (1 = the usual speed)
const ROUNDS = [
  { mode: 4, sev: 0.36, narrow: 0.2, slow: 0.35, name: 'Retinitis pigmentosa', kicker: 'Round 1 of 4 · how Ben sees', words: ['BREATHE', 'STEP'],
    desc: 'Ben’s own diagnosis: a narrowing tunnel of sight, and night blindness.', tip: 'Sweep slowly, like a cane.',
    done: ['That’s how Ben sees', 'Every day. Here it is without the filter.'] },
  { mode: 1, sev: 0.62, name: 'Cataracts', kicker: 'Round 2 of 4', words: ['TRUST', 'LISTEN'],
    desc: 'The eye’s lens clouds over: a milky haze, faded colour and contrast.', tip: 'Look for shapes, not details.' },
  { mode: 2, sev: 0.62, name: 'Macular degeneration', kicker: 'Round 3 of 4', words: ['COURAGE', 'FORWARD'],
    desc: 'The centre goes dark and blurry, right where you look. The edges stay.', tip: 'Look just beside a word to see it.' },
  { mode: 5, sev: 0.78, name: 'Glaucoma', kicker: 'Round 4 of 4', words: ['WALK', 'THROUGH', 'FEAR'],
    desc: 'The edges fade into a foggy frame that closes in.', tip: 'Move your phone to look around.' },
];
// where words can hide (u, v from the top-left of the painting)
const SLOTS = [[0.2, 0.16], [0.5, 0.1], [0.8, 0.17], [0.16, 0.42], [0.84, 0.4], [0.3, 0.62], [0.72, 0.64], [0.2, 0.86], [0.55, 0.88], [0.84, 0.86], [0.5, 0.36], [0.62, 0.5]];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Ben's filters, ported from lib/vision-gl.js, reading the painting (with its hidden words) instead of the camera
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float sev, aspect, hpx, mode, fade, alpha; uniform vec2 gaze;
float farR(vec2 c, float a) { vec2 p = vec2(c.x * a, c.y); float r = 0.0;
  r = max(r, length(p)); r = max(r, length(p - vec2(a, 0.0))); r = max(r, length(p - vec2(0.0, 1.0))); r = max(r, length(p - vec2(a, 1.0))); return r; }
float pct(vec2 uv, vec2 c, float a) { return length(vec2((uv.x - c.x) * a, uv.y - c.y)) / farR(c, a) * 100.0; }
float ramp4(float t, float t0, float a0, float t1, float a1, float t2, float a2, float t3, float a3) {
  if (t <= t0) return a0; if (t <= t1) return mix(a0, a1, (t - t0) / max(t1 - t0, 1e-4)); if (t <= t2) return mix(a1, a2, (t - t1) / max(t2 - t1, 1e-4)); if (t <= t3) return mix(a2, a3, (t - t2) / max(t3 - t2, 1e-4)); return a3; }
vec3 vid(vec2 uv) { vec2 q = clamp(uv, 0.0, 1.0); return texture2D(map, vec2(q.x, 1.0 - q.y)).rgb; }
vec3 blurred(vec2 uv, float px) {
  if (px < 0.05) return vid(uv);
  float r = px / hpx; vec3 acc = vid(uv) * 0.16; float w = 0.16;
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982 + 0.39, b = a + 0.3927;
    acc += vid(uv + vec2(cos(a) / aspect, sin(a)) * r * 0.8) * 0.13;
    acc += vid(uv + vec2(cos(b) / aspect, sin(b)) * r * 1.9) * 0.075; w += 0.205; }
  return acc / w; }
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 g = gaze; float s = sev; vec3 col; vec3 raw = vid(uv);
  if (mode < 0.5) { col = raw; }
  else if (mode < 1.5) {
    col = blurred(uv, s * 5.0);
    col = (col - 0.5) * (1.0 - s * 0.35) + 0.5; col *= 1.0 + s * 0.18;
    vec3 sep = vec3(dot(col, vec3(0.393, 0.769, 0.189)), dot(col, vec3(0.349, 0.686, 0.168)), dot(col, vec3(0.272, 0.534, 0.131)));
    col = clamp(mix(col, sep, s * 0.35), 0.0, 1.0);
    col = mix(col, vec3(228.0, 221.0, 200.0) / 255.0, 0.1 + s * 0.4);
  } else if (mode < 2.5) {
    col = blurred(uv, 1.4 + s * 3.4);
    float fog = min(1.0, 0.45 + s * 0.85), r1 = 13.0 + s * 15.0, r2 = 28.0 + s * 28.0, t = pct(uv, g, aspect);
    col = mix(col, vec3(22.0, 19.0, 15.0) / 255.0, ramp4(t, 0.0, 0.98 * fog, r1, 0.9 * fog, r2, 0.5 * fog, r2 + 16.0, 0.0));
  } else if (mode < 4.5) {
    col = blurred(uv, s * 2.25);
    float amp = min(1.0, s * 1.5125), clr = max(3.0, (1.0 - amp) * 46.0 + 4.0), t = pct(uv, g, aspect);
    col *= 1.0 - s * 0.3;
    col = mix(col, vec3(0.0), ramp4(t, clr, 0.0, clr + 6.0, 0.4 + s * 0.45, clr + 14.0, 0.7 + s * 0.28, clr + 21.0, 1.0));
    float wa = t < clr * 0.55 ? mix(s * 0.42, s * 0.22, t / (clr * 0.55)) : (t < clr ? mix(s * 0.22, 0.0, (t - clr * 0.55) / (clr * 0.45)) : 0.0);
    col = mix(col, vec3(247.0, 243.0, 233.0) / 255.0, wa);
  } else {
    col = blurred(uv, s * s * 11.0);
    float amp = min(1.0, s * 0.52734375), clr = max(2.0, (1.0 - amp) * 40.0 + 3.0);
    float t = length(vec2((uv.x - g.x) / 0.64, (uv.y - g.y) / 0.64)) * 100.0;
    float a = ramp4(t, clr, 0.0, clr + 7.0, 0.5, clr + 24.0, 0.97, clr + 25.0, 0.97);
    vec3 fc = mix(vec3(16.0, 14.0, 12.0) / 255.0, vec3(0.0), clamp((t - clr - 7.0) / 17.0, 0.0, 1.0));
    col = mix(col, fc, a);
  }
  gl_FragColor = vec4(mix(raw, col, fade), alpha);
}`;

export function seeItMyWayGame() {
  let G = null;
  const total = ROUNDS.reduce((n, r) => n + r.words.length, 0);

  function hud() {
    const R = ROUNDS[G.r];
    G.ui.panel(R ? R.name : 'See it my way', `${G.found.length}<small>of ${total} words</small>`,
      { segs: [G.found.length, total], sub: G.found.length ? G.found.join(' · ') : (R ? R.tip : '') });
  }
  // paint the photo with this round's words hidden in it
  function compose() {
    const W = 1024, H = Math.round(1024 * G.h), c = G.cv; c.width = W; c.height = H; const g = c.getContext('2d');
    if (G.img) g.drawImage(G.img, 0, 0, W, H); else { g.fillStyle = '#333'; g.fillRect(0, 0, W, H); }
    for (const w of G.words) if (!w.got && !G.hideWords) {
      g.save(); g.translate(w.u * W, w.v * H); g.rotate(w.rot);
      g.font = `900 ${w.size * W}px Archivo, "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineJoin = 'round'; g.lineWidth = w.size * W * 0.16; g.strokeStyle = 'rgba(0,0,0,.75)'; g.strokeText(w.text, 0, 0);
      g.fillStyle = 'rgba(255,255,255,.95)'; g.fillText(w.text, 0, 0);
      const m = g.measureText(w.text); w.hw = (m.width / W) / 2 + 0.02; w.hh = w.size * 0.7;
      g.restore();
    }
    G.tex.needsUpdate = true;
  }
  function startRound() {
    const R = ROUNDS[G.r]; if (!R) return;
    const slots = SLOTS.map(s => s.slice()).sort(() => Math.random() - 0.5);
    G.words = R.words.map((text, i) => ({ text, u: slots[i][0] + (Math.random() - 0.5) * 0.06, v: slots[i][1] + (Math.random() - 0.5) * 0.04, rot: (Math.random() - 0.5) * 0.3, size: text.length > 6 ? 0.075 : 0.09, got: false }));
    G.hideWords = !!R.slow; compose();   // in Ben's round, the words appear once his tunnel has closed in
    G.uni.mode.value = R.mode; G.uni.sev.value = R.sev; G.sevTo = R.sev; G.fadeTo = 1; G.fadeRate = 1.6 * (R.slow || 1); G.roundT = 0;
    G.ui.banner(R.name, R.desc + ' ' + R.tip, 0, R.kicker); G.bannerT = R.slow ? 4.6 : 3.2;
    // said as short sentences, so each one plays Ben's own recording ("Round 1 of 4." "How Ben sees." …)
    const kick = R.kicker.split(' · ').map(k => k[0].toUpperCase() + k.slice(1) + '.').join(' ');
    G.say(`${kick} ${R.name}. ${R.desc} ${R.tip} Find ${R.words.length} hidden words.`);
    hud();
  }
  function tryFind(u, v) {
    if (G.hideWords) return;   // still closing in
    const w = G.words.find(w => !w.got && Math.abs(u - w.u) < w.hw + 0.03 && Math.abs(v - w.v) < w.hh + 0.035);
    if (!w) { K.tone(180, 0.12, { type: 'triangle', vol: 0.05 }); return; }
    w.got = true; G.found.push(w.text); compose();
    const [x, y] = G.S.P(w.u, w.v), pan = Math.max(-1, Math.min(1, (w.u - 0.5) * 1.8));
    const s = K.plane(K.wordTex(w.text), 0.36, 0.09, { order: 30 }); s.position.set(x, y, 0.06); s.rotation.z = -w.rot; s.scale.setScalar(0.2); G.root.add(s); G.pops.push({ s, t: 0 });
    K.sfx.good(pan, G.found.length); G.fx.add(x, y, '#ffffff', 20, 0.25); G.buzz([30, 30, 60]);
    G.say(w.text.toLowerCase() + '.'); hud();
    { const R = ROUNDS[G.r]; if (R && R.narrow) G.sevTo = R.sev + R.narrow * G.words.filter(w => w.got).length / G.words.length; }   // the tunnel closes in a little more
    if (G.words.every(w => w.got)) {
      G.r++;
      if (G.r >= ROUNDS.length) { G.fadeTo = 0; G.settle = 2.6; G.ui.alert('You walked through fear', 'Now see it clearly.', 2.4, 'red'); G.say('Walk through fear. You found every word. Now see it clearly.'); }
      else { const D = ROUNDS[G.r - 1].done || ['Round cleared', 'Here it is without the filter.']; G.fadeTo = 0; G.fadeRate = 1.6; G.settle = ROUNDS[G.r - 1].done ? 3 : 2.2; G.ui.alert(D[0], D[1], ROUNDS[G.r - 1].done ? 2.8 : 2, 'black'); }
    }
  }
  function hint() {
    const w = G.words.find(w => !w.got); if (!w) return;
    const du = w.u - G.aim.u, dv = w.v - G.aim.v, d = Math.hypot(du, dv * G.h);
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const way = [v, h].filter(Boolean).join(' and ');
    const msg = !way || d < 0.12 ? 'It’s right around where you’re looking. Tap it.' : (d < 0.3 ? 'Close. Look ' : 'Look ') + way + '.';
    G.ui.alert('Hint', msg, 1.8, 'blue'); G.say(msg);
  }

  return {
    title: 'See it my way',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { r: 0, found: [], words: [], pops: [], aim: { u: 0.5, v: 0.5 }, touch: null, touchT: 0, fadeTo: 0, settle: 0, t0: 0, humT: 0, bannerT: 0, botT: 0 });
      G.cv = document.createElement('canvas'); G.tex = new THREE.CanvasTexture(G.cv); G.tex.colorSpace = THREE.NoColorSpace;
      G.uni = { map: { value: G.tex }, sev: { value: 0 }, aspect: { value: 1 / G.h }, hpx: { value: 300 }, mode: { value: 0 }, fade: { value: 0 }, alpha: { value: 0 }, gaze: { value: new THREE.Vector2(0.5, 0.5) } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { if (G) { G.img = im; compose(); } }; im.src = src; }
      compose();
      G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: where to look', press: () => G.playing && hint() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; startRound(); };
      K.intro(G, { title: 'See it my way', how: 'Words are hidden in Ben’s painting. Find them through four kinds of low vision, starting with how Ben sees. Tap each word you find.',
        say: 'See it my way. Words are hidden in Ben’s painting, Walk Through Fear. You’ll look for them through four kinds of low vision. Move your phone to look around, and tap each word you find. A soft hum means you’re close.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.bannerT > 0) { G.bannerT -= dt; if (G.bannerT <= 0) G.ui.hideBanner(); }
      // the painting under the filter fades in, and the filter fades in and out between rounds
      G.uni.alpha.value += ((G.over ? 0 : 1) - G.uni.alpha.value) * Math.min(1, dt * 2);
      G.uni.fade.value += (G.fadeTo - G.uni.fade.value) * Math.min(1, dt * (G.fadeRate || 1.6));
      if (G.hideWords && G.uni.fade.value > 0.85) { G.hideWords = false; compose(); }
      if (G.sevTo != null) G.uni.sev.value += (G.sevTo - G.uni.sev.value) * Math.min(1, dt * 1.2);
      // where you look: a finger on the screen, else the middle of the screen (where the phone points)
      if (G.bot && G.playing) { const w = G.words.find(w => !w.got); if (w) { G.aim.u += (w.u - G.aim.u) * Math.min(1, dt * 2); G.aim.v += (w.v - G.aim.v) * Math.min(1, dt * 2); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const gz = G.uni.gaze.value; gz.x += (G.aim.u - gz.x) * Math.min(1, dt * 10); gz.y += (G.aim.v - gz.y) * Math.min(1, dt * 10);
      for (let i = G.pops.length - 1; i >= 0; i--) { const p = G.pops[i]; p.t += dt; p.s.scale.setScalar(Math.min(1, 0.2 + p.t * 3) * (p.t > 2.2 ? Math.max(0, 1 - (p.t - 2.2) * 2) : 1)); if (p.t > 2.8) { G.root.remove(p.s); G.pops.splice(i, 1); } }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0) {
        if (G.r >= ROUNDS.length && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('walk-through-fear:see', t, 'lower');
          K.finale(G, { won: true, title: 'You walked through fear', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Words', v: `${total}/${total}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        } else if (G.r < ROUNDS.length) startRound();
      } return; }
      if (!G.playing) return;
      // by ear: a soft hum, from the word's side, that grows as you look near a hidden word
      const w = G.words.filter(w => !w.got).sort((a, b) => Math.hypot(a.u - G.aim.u, a.v - G.aim.v) - Math.hypot(b.u - G.aim.u, b.v - G.aim.v))[0];
      if (w && !G.hideWords) { const d = Math.hypot(w.u - G.aim.u, (w.v - G.aim.v) * G.h); G.humT -= dt;
        if (d < 0.35 && G.humT <= 0) { G.humT = 0.18 + d * 1.6; K.tone(330 + (0.35 - d) * 900, 0.12, { type: 'sine', vol: 0.02 + (0.35 - d) * 0.09, pan: Math.max(-1, Math.min(1, (w.u - G.aim.u) * 3)) }); } }
      if (G.bot) { G.botT -= dt; if (w && G.botT <= 0 && Math.hypot(w.u - G.aim.u, w.v - G.aim.v) < 0.02) { G.botT = 0.4; tryFind(w.u, w.v); } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      const p = G.S.toBoard(ev, G.root);
      if (kind === 'down') { if (p) { G.touch = { u: p.u, v: p.v }; G.downAt = { x: ev.clientX, y: ev.clientY }; } }
      else if (kind === 'move' && G.touch && p) G.touch = { u: p.u, v: p.v };
      else if (kind === 'up') {
        if (G.touch && G.settle <= 0) tryFind(G.touch.u, G.touch.v);   // a tap (or the end of a drag) checks for a word there
        G.touch = null; G.touchT = 1.2;
      }
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'see-it-my-way', playing: G.playing, over: G.over, settle: +G.settle.toFixed(2), paused: G.paused, t: +G.t.toFixed(1), round: G.r, hidden: !!G.hideWords, found: G.found.length, total, words: G.words.map(w => `${w.text}@${w.u.toFixed(2)},${w.v.toFixed(2)}${w.got ? '✓' : ''}`) }; },
    stop() { K.cleanup(G); G = null; },
  };
}
