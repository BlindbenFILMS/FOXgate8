// ROOTS OF KINSHIP (April & Melissa): FAMILY APPLES.
// First you grow the family: tap the tree to hang ten apples, one for each person (Grandma, Grandpa, Mom, Dad, Auntie,
// Uncle, Big sister, Little sister, Cousin, Baby). Each one blossoms and swells into an apple with its own note.
// Then a low-vision filter comes over the painting (not total blindness): can you still find them? Five apples through
// a cloudy haze (cataracts), then the last five through tunnel vision (retinitis pigmentosa), where the clear spot
// follows where the phone points. Tap each apple to pick it into the basket. At the end the filter lifts and the whole
// family is back on the tree. The apples are painted INTO the picture, so the filter covers them exactly as it
// covers the painting. By ear: a soft hum grows when you're near an apple, Hint says which way to look.
// The filter maths are Ben's vision filters (the same as See it my way).
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const FAMILY = ['Grandma', 'Grandpa', 'Mom', 'Dad', 'Auntie', 'Uncle', 'Big sister', 'Little sister', 'Cousin', 'Baby'];
const ROUNDS = [
  { mode: 1, sev: 0.66, name: 'Cataracts', kicker: 'Round 1 of 2', count: 5,
    desc: 'A cloudy haze: everything is blurry and faded.', tip: 'Look for round shapes, not details.' },
  { mode: 4, sev: 0.47, name: 'Retinitis pigmentosa', kicker: 'Round 2 of 2', count: 5,
    desc: 'Tunnel vision: only a small clear circle in the middle.', tip: 'Move your phone slowly to look around.' },
];
const CANOPY = { u: 0.5, v: 0.47, r: 0.44 }, LOW = 0.64, APPLE = 0.066, GAP = 0.075, PICK_R = 0.055;
// spots the "Hang" button (and the robot player) use
const SPOTS = [[0.3, 0.2], [0.5, 0.12], [0.7, 0.2], [0.2, 0.35], [0.4, 0.28], [0.6, 0.3], [0.8, 0.36], [0.27, 0.5], [0.45, 0.44], [0.62, 0.45], [0.75, 0.55], [0.35, 0.58], [0.15, 0.48], [0.86, 0.47], [0.56, 0.2]];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Ben's filters (ported from lib/vision-gl.js), reading the painting with the apples painted in
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
  } else {
    col = blurred(uv, s * 2.25);
    float amp = min(1.0, s * 1.5125), clr = max(3.0, (1.0 - amp) * 46.0 + 4.0), t = pct(uv, g, aspect);
    col *= 1.0 - s * 0.3;
    col = mix(col, vec3(0.0), ramp4(t, clr, 0.0, clr + 6.0, 0.4 + s * 0.45, clr + 14.0, 0.7 + s * 0.28, clr + 21.0, 1.0));
    float wa = t < clr * 0.55 ? mix(s * 0.42, s * 0.22, t / (clr * 0.55)) : (t < clr ? mix(s * 0.22, 0.0, (t - clr * 0.55) / (clr * 0.45)) : 0.0);
    col = mix(col, vec3(247.0, 243.0, 233.0) / 255.0, wa);
  }
  gl_FragColor = vec4(mix(raw, col, fade), alpha);
}`;

// a shiny apple (drawn, so it works anywhere)
function drawApple(g, x, y, R, kind = 0) {
  const body = [['#e02a2a', '#8e0f14'], ['#e8343a', '#99121c'], ['#f2b72c', '#b5761a'], ['#8fc63c', '#4d7f1f']][kind];
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(R * 0.08, R * 0.12, R * 1.0, R * 0.95, 0, 0, Math.PI * 2); g.fill();
  const gr = g.createRadialGradient(-R * 0.35, -R * 0.3, R * 0.1, 0, 0, R * 1.1); gr.addColorStop(0, body[0]); gr.addColorStop(1, body[1]);
  g.fillStyle = gr; g.beginPath();
  g.moveTo(0, -R * 0.62);
  g.bezierCurveTo(R * 0.55, -R * 1.05, R * 1.15, -R * 0.55, R * 0.98, R * 0.15);
  g.bezierCurveTo(R * 0.85, R * 0.85, R * 0.35, R * 1.05, 0, R * 0.88);
  g.bezierCurveTo(-R * 0.35, R * 1.05, -R * 0.85, R * 0.85, -R * 0.98, R * 0.15);
  g.bezierCurveTo(-R * 1.15, -R * 0.55, -R * 0.55, -R * 1.05, 0, -R * 0.62); g.fill();
  g.lineWidth = Math.max(1, R * 0.06); g.strokeStyle = 'rgba(40,6,6,.6)'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-R * 0.42, -R * 0.25, R * 0.16, R * 0.28, 0.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#4a2a12'; g.lineWidth = R * 0.12; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -R * 0.6); g.quadraticCurveTo(R * 0.05, -R * 0.95, R * 0.2, -R * 1.12); g.stroke();
  g.fillStyle = '#3f9a3a'; g.beginPath(); g.ellipse(R * 0.42, -R * 0.95, R * 0.32, R * 0.14, -0.5, 0, Math.PI * 2); g.fill();
  g.restore();
}
const appleTex = [0, 1, 2, 3].map(k => K.canvasTex(128, 128, (g) => drawApple(g, 64, 70, 46, k)));
const blossomTex = K.canvasTex(128, 128, (g) => {
  g.translate(64, 64);
  for (let i = 0; i < 5; i++) { g.rotate((Math.PI * 2) / 5); g.fillStyle = '#ffd6e4'; g.beginPath(); g.ellipse(0, -26, 17, 26, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(200,80,120,.5)'; g.lineWidth = 2; g.stroke(); }
  g.fillStyle = '#ffcf3f'; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill();
});
const tagTex = {};
function nameTex(name) {
  return tagTex[name] || (tagTex[name] = K.canvasTex(256, 64, (g, W, H) => {
    g.font = '900 34px Archivo, "Arial Black", Arial, sans-serif'; const w = Math.min(W - 4, g.measureText(name.toUpperCase()).width + 28);
    g.fillStyle = '#000'; g.fillRect((W - w) / 2, 4, w, H - 14); g.fillStyle = K.RED; g.fillRect((W - w) / 2, H - 10, w, 6);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name.toUpperCase(), W / 2, (H - 10) / 2 + 3);
  }));
}
const KIND = [0, 1, 0, 2, 1, 0, 3, 1, 0, 2];   // mostly red, a few golden and green
const NOTES = [523.3, 587.3, 659.3, 784, 880, 1046.5, 1174.7, 1318.5, 1568, 1760];

export function familyApplesGame() {
  let G = null;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);
  const onTree = (u, v) => Math.hypot(u - CANOPY.u, (v - CANOPY.v) * G.h) < CANOPY.r && v < LOW && v > 0.05;

  function hud() {
    if (G.phase === 'grow') { G.ui.panel('Grow the family', `${G.apples.length}<small>of ${FAMILY.length} apples</small>`, { segs: [G.apples.length, FAMILY.length], sub: G.apples.length < FAMILY.length ? `Tap the tree to hang ${FAMILY[G.apples.length]}’s apple` : 'The whole family is on the tree' }); return; }
    const R = ROUNDS[G.r], got = G.apples.filter(a => a.got).length;
    G.ui.panel(R ? R.name : 'Family apples', `${got}<small>of ${FAMILY.length} found</small>`, { segs: [got, FAMILY.length], sub: R ? R.tip : 'Everyone together' });
  }
  // the painting with the apples painted in (for the filter rounds)
  function compose() {
    const W = 1024, H = Math.round(1024 * G.h), c = G.cv; c.width = W; c.height = H; const g = c.getContext('2d');
    if (G.img) g.drawImage(G.img, 0, 0, W, H); else { g.fillStyle = '#333'; g.fillRect(0, 0, W, H); }
    for (const a of G.apples) if (!a.got) drawApple(g, a.u * W, a.v * H, APPLE * 0.36 * W, a.kind);
    G.tex.needsUpdate = true;
  }

  /* ── growing ── */
  function hang(u, v) {
    if (G.phase !== 'grow' || G.apples.length >= FAMILY.length) return;
    if (!onTree(u, v)) { G.ui.pop('On the tree!'); K.tone(200, 0.12, { type: 'triangle', vol: 0.05 }); return; }
    if (G.apples.some(a => dist(a, { u, v }) < GAP)) { G.ui.pop('Room to grow!'); K.tone(220, 0.1, { type: 'triangle', vol: 0.05 }); return; }
    const i = G.apples.length, name = FAMILY[i], kind = KIND[i];
    const s = K.sprite(blossomTex, APPLE, { order: 20 }); const [x, y] = G.S.P(u, v); s.position.set(x, y, 0.05); s.scale.setScalar(0.001); G.root.add(s);
    const tag = K.plane(nameTex(name), 0.2, 0.05, { order: 31, opacity: 0 }); tag.position.set(x, y + 0.05, 0.07); G.root.add(tag);
    G.apples.push({ u, v, name, kind, s, tag, t: 0, got: false });
    K.tone(NOTES[i], 0.5, { type: 'triangle', vol: 0.12, pan: (u - 0.5) * 1.6 }); K.tone(NOTES[i] * 2, 0.3, { vol: 0.03, delay: 0.3, pan: (u - 0.5) * 1.6 });
    G.fx.add(x, y, '#ffd6e4', 10, 0.18); G.buzz(20);
    G.say(`${name}’s apple!`);
    if (G.apples.length >= FAMILY.length) { G.phase = 'ready'; G.waitT = 2.6; G.ui.alert('The whole family is on the tree', 'Now, can you still find them?', 2.6, 'red'); }
    hud();
  }
  function autoSpot() {
    const free = SPOTS.filter(([u, v]) => !G.apples.some(a => dist(a, { u, v }) < GAP));
    const [u, v] = free.length ? free[Math.floor(Math.random() * free.length)] : [CANOPY.u + (Math.random() - 0.5) * 0.5, 0.15 + Math.random() * 0.45];
    hang(u + (Math.random() - 0.5) * 0.02, v + (Math.random() - 0.5) * 0.02);
  }

  /* ── finding them through the filter ── */
  function startRound() {
    const R = ROUNDS[G.r]; if (!R) return;
    G.phase = 'find'; G.roundGot = 0;
    compose();
    G.uni.mode.value = R.mode; G.uni.sev.value = R.sev; G.fadeTo = 1;
    G.ui.banner(R.name, R.desc + ' ' + R.tip, 0, R.kicker); G.bannerT = 3.4;
    G.say(`${R.kicker}. ${R.name}. ${R.desc} ${R.tip} Find ${R.count} apples.`);
    G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: where to look', press: () => G.playing && hint() }]);
    hud();
  }
  function tryPick(u, v) {
    if (G.phase !== 'find' || G.settle > 0) return;
    const a = G.apples.filter(a => !a.got).sort((x, y) => dist(x, { u, v }) - dist(y, { u, v }))[0];
    if (!a || dist(a, { u, v }) > PICK_R) { K.tone(180, 0.12, { type: 'triangle', vol: 0.05 }); G.misses++; return; }
    a.got = true; G.roundGot++; compose();
    // it drops into the basket
    const [x, y] = G.S.P(a.u, a.v), s = K.sprite(appleTex[a.kind], APPLE, { order: 32 }); s.position.set(x, y, 0.08); G.root.add(s);
    G.drops.push({ s, x0: x, y0: y, t: 0, a });
    K.sfx.good((a.u - 0.5) * 1.6, G.apples.filter(a => a.got).length); G.fx.add(x, y, '#ffffff', 16, 0.22); G.buzz([30, 30, 60]);
    G.say(`You found ${a.name}’s apple!`); hud();
    const R = ROUNDS[G.r];
    if (G.roundGot >= R.count || G.apples.every(a => a.got)) {
      G.r++; G.fadeTo = 0;
      if (G.r >= ROUNDS.length) { G.settle = 3.0; G.ui.alert('You found the whole family', 'Everyone, together.', 2.6, 'red'); G.say('You found the whole family. Everyone, together.'); }
      else { G.settle = 2.4; G.ui.alert('Round cleared', 'Here it is without the filter.', 2, 'black'); }
    }
  }
  function hint() {
    const a = G.apples.filter(a => !a.got).sort((x, y) => dist(x, G.aim) - dist(y, G.aim))[0]; if (!a) return;
    const du = a.u - G.aim.u, dv = a.v - G.aim.v, d = dist(a, G.aim);
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const way = [v, h].filter(Boolean).join(' and ');
    const msg = !way || d < 0.1 ? 'It’s right around where you’re looking. Tap it.' : (d < 0.3 ? 'Close. Look ' : 'Look ') + way + '.';
    G.ui.alert('Hint', msg, 1.8, 'blue'); G.say(msg);
  }

  return {
    title: 'Family apples',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'grow', r: 0, apples: [], drops: [], aim: { u: 0.5, v: 0.5 }, touch: null, touchT: 0, fadeTo: 0, settle: 0, t0: 0, humT: 0, bannerT: 0, botT: 0, waitT: 0, misses: 0, roundGot: 0 });
      G.cv = document.createElement('canvas'); G.tex = new THREE.CanvasTexture(G.cv); G.tex.colorSpace = THREE.NoColorSpace;
      G.uni = { map: { value: G.tex }, sev: { value: 0 }, aspect: { value: 1 / G.h }, hpx: { value: 300 }, mode: { value: 0 }, fade: { value: 0 }, alpha: { value: 0 }, gaze: { value: new THREE.Vector2(0.5, 0.5) } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { if (G) { G.img = im; compose(); } }; im.src = src; }
      compose();
      G.basket = K.sprite(K.emojiTex('🧺', { bg: 'rgba(0,0,0,0)' }), 0.12, { order: 33, opacity: 0 }); { const [x, y] = G.S.P(0.5, 0.92); G.basket.position.set(x, y, 0.08); G.basketXY = [x, y]; } G.root.add(G.basket);
      G.ui.buttons([{ label: 'Hang an apple', icon: '🍎', kind: 'red', aria: 'Hang an apple on the tree', press: () => G.playing && autoSpot() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; hud(); };
      K.intro(G, { title: 'Family apples', how: 'Tap the tree to hang an apple for everyone in the family. Then the filter comes on: can you still find them?',
        say: 'Family apples. Grow the family tree: tap the tree to hang an apple for each person, ten in all. Then a low vision filter comes over the painting. Not total blindness, but blurry, faded and narrow. Can you still find every apple? Tap each one to pick it. A soft hum means you’re close.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.bannerT > 0) { G.bannerT -= dt; if (G.bannerT <= 0) G.ui.hideBanner(); }
      G.uni.alpha.value += ((G.over ? 0 : 1) - G.uni.alpha.value) * Math.min(1, dt * 2);
      G.uni.fade.value += (G.fadeTo - G.uni.fade.value) * Math.min(1, dt * 1.6);
      // the apples on the tree (as sprites while you grow them; painted in while the filter is on)
      const painted = G.phase === 'find' || G.phase === 'between';
      for (const a of G.apples) {
        a.t += dt;
        if (a.t > 0.45 && a.s.material.map !== appleTex[a.kind]) { a.s.material.map = appleTex[a.kind]; a.s.material.needsUpdate = true; K.tone(NOTES[G.apples.indexOf(a)] * 1.5, 0.15, { vol: 0.04 }); }
        const grow = a.t < 0.45 ? Math.min(1, a.t / 0.3) * 0.7 : Math.min(1.12, 0.5 + (a.t - 0.45) * 3) - Math.max(0, Math.min(0.12, (a.t - 0.62) * 0.6));
        const sway = Math.sin(G.t * 1.6 + a.u * 9) * 0.06;
        a.s.scale.setScalar(APPLE * Math.max(0.001, grow)); a.s.material.rotation = sway;
        a.s.material.opacity += ((painted || a.got ? 0 : 1) - a.s.material.opacity) * Math.min(1, dt * 6);
        a.tag.material.opacity = a.t < 1.6 ? Math.min(1, a.t * 4) : Math.max(0, 1 - (a.t - 1.6) * 2);
      }
      // picked apples drop into the basket
      G.basket.material.opacity += ((G.phase === 'grow' || G.phase === 'done' ? 0 : 1) - G.basket.material.opacity) * Math.min(1, dt * 3);
      for (const d of G.drops) {
        d.t += dt; const k = Math.min(1, d.t / 0.8), e = k * k, [bx, by] = G.basketXY;
        d.s.position.set(d.x0 + (bx - d.x0) * k, d.y0 + (by + 0.015 - d.y0) * e + Math.sin(k * Math.PI) * 0.06, 0.085);
        d.s.scale.setScalar(APPLE * (1 - 0.35 * k));
        if (d.t > 0.8 && !d.landed) { d.landed = true; K.tone(140, 0.12, { type: 'triangle', vol: 0.08 }); G.basketBump = 1; }
      }
      G.basketBump = Math.max(0, (G.basketBump || 0) - dt * 4); G.basket.scale.setScalar(0.12 * (1 + 0.12 * G.basketBump));
      // where you look: a finger, else the middle of the screen (where the phone points)
      if (G.bot && G.playing && G.phase === 'find') { const a = G.apples.filter(a => !a.got)[0]; if (a) { G.aim.u += (a.u - G.aim.u) * Math.min(1, dt * 2); G.aim.v += (a.v - G.aim.v) * Math.min(1, dt * 2); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const gz = G.uni.gaze.value; gz.x += (G.aim.u - gz.x) * Math.min(1, dt * 10); gz.y += (G.aim.v - gz.y) * Math.min(1, dt * 10);
      // between growing and finding
      if (G.phase === 'ready') { G.waitT -= dt; if (G.waitT <= 0) { G.say('Your whole family is on the tree. Now, can you still find them?'); G.phase = 'between'; compose(); G.waitT = 3.2; } return; }
      if (G.phase === 'between' && G.r === 0 && G.waitT > 0) { G.waitT -= dt; if (G.waitT <= 0) startRound(); return; }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0) {
        if (G.r >= ROUNDS.length && !G.over) {
          G.phase = 'done';
          for (const a of G.apples) { a.got = false; a.t = 0.46; }   // everyone back on the tree
          for (const d of G.drops) G.root.remove(d.s); G.drops = []; G.basket.material.opacity = 0;
          K.chord([523.3, 659.3, 784, 1046.5], 1.6, { vol: 0.06 });
          const t = Math.round(G.t - G.t0), r = K.best('roots-of-kinship:apples', G.misses, 'lower');
          K.finale(G, { won: true, title: 'The whole family, together', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Apples', v: `${FAMILY.length}/${FAMILY.length}` }, { k: 'Misses', v: G.misses }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        } else if (G.r < ROUNDS.length) { G.phase = 'between'; startRound(); }
      } return; }
      if (!G.playing) return;
      if (G.phase === 'grow' && G.bot) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.6; autoSpot(); } }
      if (G.phase !== 'find') return;
      // by ear: a soft hum, from the apple's side, that grows as you look near one
      const a = G.apples.filter(a => !a.got).sort((x, y) => dist(x, G.aim) - dist(y, G.aim))[0];
      if (a) { const d = dist(a, G.aim); G.humT -= dt;
        if (d < 0.35 && G.humT <= 0) { G.humT = 0.18 + d * 1.6; K.tone(330 + (0.35 - d) * 900, 0.12, { type: 'sine', vol: 0.02 + (0.35 - d) * 0.09, pan: Math.max(-1, Math.min(1, (a.u - G.aim.u) * 3)) }); } }
      if (G.bot) { G.botT -= dt; if (a && G.botT <= 0 && dist(a, G.aim) < 0.02) { G.botT = 0.4; tryPick(a.u, a.v); } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      const p = G.S.toBoard(ev, G.root);
      if (G.phase === 'grow') { if (kind === 'down' && p) hang(p.u, p.v); return; }
      if (kind === 'down') { if (p) G.touch = { u: p.u, v: p.v }; }
      else if (kind === 'move' && G.touch && p) G.touch = { u: p.u, v: p.v };
      else if (kind === 'up') { if (G.touch) tryPick(G.touch.u, G.touch.v); G.touch = null; G.touchT = 1.2; }
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'family-apples', playing: G.playing, over: G.over, phase: G.phase, round: G.r, apples: G.apples.length, found: G.apples.filter(a => a.got).length, misses: G.misses, t: +G.t.toFixed(1) }; },
    stop() { K.cleanup(G); G = null; },
  };
}
