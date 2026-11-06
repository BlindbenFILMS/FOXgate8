// ROOTS OF KINSHIP (April & Melissa): FAMILY APPLES.
// First you grow the family: tap the tree to hang ten apples, one for each person (Grandma, Grandpa, Mom, Dad, Auntie,
// Uncle, Big sister, Little sister, Cousin, Baby). Each one blossoms and swells into an apple with its own note.
// Then a low-vision filter comes over the painting (not total blindness): can you still find them? Five apples through
// tunnel vision first (retinitis pigmentosa, Ben's own condition), where the clear spot follows where the phone points,
// then the last five through a cloudy haze (cataracts). Tap each apple to pick it into the basket. At the end the filter lifts and the whole
// family is back on the tree. The apples are painted INTO the picture, so the filter covers them exactly as it
// covers the painting. By ear: a soft hum grows when you're near an apple, Hint says which way to look.
// The filter maths are Ben's vision filters (the same as See it my way).
// POLISHED (5 Nov 2026): now PICKING APPLES WITH VISION LOSS: no hanging; the ten apples grow on the tree by themselves
// during the intro, then you pick 5 through the first filter; the apples pop back up (in new places) and you pick 5
// through the second. Also: bigger drawn apples with a warm glow (roots-things.js), a drawn wicker basket that fills up,
// a gentle plucked family tune that grows with every apple, shorter banners, and at the end the family pops back onto
// the tree and April & Melissa read their quote in their own voice.
import * as THREE from 'three';
import * as K from './kit.js';
import { drawApple, drawBlossom, drawBasket, drawWarmGlow } from './roots-things.js';
const ARTIST = new URL('../../../3D/gallery/audio/art_6.mp3', import.meta.url).href;   // April & Melissa, in their own words
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const FAMILY = ['Grandma', 'Grandpa', 'Mom', 'Dad', 'Auntie', 'Uncle', 'Big sister', 'Little sister', 'Cousin', 'Baby'];
const ROUNDS = [
  { mode: 4, sev: 0.47, name: 'Retinitis pigmentosa', kicker: 'Round 1 of 2', count: 5,
    desc: 'Tunnel vision: only a small clear circle in the middle.', tip: 'Move your phone slowly to look around.' },
  { mode: 1, sev: 0.66, name: 'Cataracts', kicker: 'Round 2 of 2', count: 5,
    desc: 'A cloudy haze: everything is blurry and faded.', tip: 'Look for round shapes, not details.' },
];
// (the apples, the room between them and how close a tap must be are all 10% bigger than at first, so they're easier to see and pick)
const CANOPY = { u: 0.5, v: 0.47, r: 0.44 }, LOW = 0.64, APPLE = 0.1, GAP = 0.105, PICK_R = 0.085;
// spots the "Hang" button (and the robot player) use
const SPOTS = [[0.3, 0.2], [0.5, 0.12], [0.7, 0.2], [0.2, 0.35], [0.4, 0.29], [0.61, 0.31], [0.8, 0.36], [0.27, 0.5], [0.45, 0.44], [0.62, 0.45], [0.75, 0.55], [0.36, 0.59], [0.15, 0.5], [0.87, 0.47], [0.52, 0.56]];

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

// the drawn props (roots-things.js)
const appleTex = [0, 1, 2, 3].map(k => K.canvasTex(256, 256, (g) => drawApple(g, 128, 140, 96, k)));
const blossomTex = K.canvasTex(256, 256, (g) => drawBlossom(g, 128, 128, 110));
const basketBackTex = K.canvasTex(256, 200, (g, W, H) => drawBasket(g, W, H, { front: false }));
const basketFrontTex = K.canvasTex(256, 200, (g, W, H) => drawBasket(g, W, H, { back: false }));
const glowTex = K.canvasTex(256, 256, (g, W, H) => drawWarmGlow(g, W, H));
const BASKET = { u: 0.5, v: 0.885, w: 0.24 };
// where each picked apple sits in the basket (two rows, back row first)
const SLOTS = [[-0.07, -0.028], [-0.023, -0.032], [0.023, -0.032], [0.07, -0.028], [-0.085, -0.01], [-0.045, -0.006], [0, -0.004], [0.045, -0.006], [0.085, -0.01], [0, -0.05]];

// the music: a warm plucked family tune (C, G, A minor, F) that adds a part as the family grows
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[48, 55, 60, 64, 67], [43, 50, 55, 59, 62], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60]];
const MELODY = [76, 74, 72, 74, 76, 79, 76, 74, 72, 69, 72, 74, 72, 67, 69, 72];
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mix = ac.createGain(); mix.gain.value = 1; mix.connect(out);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'triangle', vol = 0.05, att = 0.006, p = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(pan(p, mix)); o.start(t); o.stop(t + dur + 0.03);
  }
  // a soft guitar-like pluck: triangle + a quiet octave sine that fades faster
  const pluck = (t, m, dur, vol, p = 0) => { tone(t, midi(m), dur, { vol, p }); tone(t, midi(m + 12), dur * 0.4, { type: 'sine', vol: vol * 0.35, p }); };
  let level = 0;
  return {
    set level(n) { level = n; }, get level() { return level; },
    start() { out.gain.setTargetAtTime(0.8, ac.currentTime, 0.5); },
    // one eighth note; e = 0..7 in the bar, bar = bar number, s8 = seconds per eighth
    step(e, bar, s8) {
      const t = ac.currentTime + 0.01, ch = CHORDS[bar % 4];
      if (e === 0) { tone(t, midi(ch[0]), s8 * 7, { vol: 0.07, att: 0.03 }); tone(t, midi(ch[2]), s8 * 7, { type: 'sine', vol: 0.03, att: 0.2 }); }   // bass + soft pad
      const arp = [1, 2, 3, 4, 3, 2, 3, 4];
      if (level >= 2 || e % 2 === 0) pluck(t, ch[arp[e]] + 12, s8 * 3, level >= 2 ? 0.03 : 0.02, (e % 4 - 1.5) * 0.25);
      if (level >= 5 && (e === 4)) tone(t, midi(ch[0] + 7), s8 * 3, { vol: 0.045 });
      if (level >= 8 && e % 4 === 0) { const n = MELODY[(bar * 2 + (e >> 2)) % MELODY.length]; pluck(t, n, s8 * 4, 0.035, -0.3); }
      if (level >= 13 && (e === 2 || e === 6)) tone(t, midi(ch[3] + 24), s8 * 1.5, { type: 'sine', vol: 0.018, p: 0.5 });   // a little bell
    },
    // each family member's own note (hang and find), from their side of the tree
    note(f, p) { const t = ac.currentTime + 0.005; tone(t, f, 0.9, { vol: 0.1, p }); tone(t + 0.12, f * 1.5, 0.6, { type: 'sine', vol: 0.04, p }); tone(t + 0.24, f * 2, 0.5, { type: 'sine', vol: 0.03, p }); },
    thunk() { const t = ac.currentTime + 0.005; tone(t, 150, 0.16, { vol: 0.12 }); tone(t, 95, 0.2, { type: 'sine', vol: 0.12 }); },
    finale() { const t = ac.currentTime + 0.1; [48, 55, 60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.12, midi(m), 3.5, { vol: 0.05, att: 0.04, p: (i - 4) * 0.15 })); },
    quiet(v) { mix.gain.setTargetAtTime(v, ac.currentTime, 0.6); },
    pause() { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); },
    resume() { out.gain.setTargetAtTime(0.8, ac.currentTime, 0.2); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} },
  };
}
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
    if (G.phase === 'grow') { G.ui.panel('Picking apples', `0<small>of ${FAMILY.length} found</small>`, { segs: [0, FAMILY.length], sub: 'The apples are growing' }); return; }
    const R = ROUNDS[G.r], got = G.picked;
    G.ui.panel(R ? R.name : 'Family apples', `${got}<small>of ${FAMILY.length} found</small>`, { segs: [got, FAMILY.length], sub: R ? R.tip : 'Everyone together' });
  }
  // the painting with the apples painted in (for the filter rounds)
  function compose() {
    const W = 1024, H = Math.round(1024 * G.h), c = G.cv; c.width = W; c.height = H; const g = c.getContext('2d');
    if (G.img) g.drawImage(G.img, 0, 0, W, H); else { g.fillStyle = '#333'; g.fillRect(0, 0, W, H); }
    if (G.phase !== 'regrow') for (const a of G.apples) if (!a.got) drawApple(g, a.u * W, a.v * H, APPLE * 0.375 * W, a.kind, { halo: true });
    G.tex.needsUpdate = true;
  }

  /* ── growing ── */
  // the ten apples grow on the tree by themselves, one after another (blossom, then apple, each with its note)
  function growAll() {
    const spots = SPOTS.slice().sort(() => Math.random() - 0.5), pick = [];
    for (const [u, v] of spots) { if (pick.length >= FAMILY.length) break; if (!pick.some(p => Math.hypot(p[0] - u, (p[1] - v) * G.h) < GAP)) pick.push([u, v]); }
    pick.forEach(([u, v], i) => {
      const s = K.sprite(blossomTex, APPLE, { order: 20 }); const [x, y] = G.S.P(u, v); s.position.set(x, y, 0.05); s.scale.setScalar(0.001); G.root.add(s);
      const tag = K.plane(nameTex(FAMILY[i]), 0.26, 0.065, { order: 31, opacity: 0 }); tag.position.set(x, y + 0.07, 0.07); G.root.add(tag);
      G.apples.push({ u, v, name: FAMILY[i], kind: KIND[i], s, tag, t: -0.6 - i * 0.22, got: false, back: true });
    });
  }

  // between the two vision conditions: every apple pops back up on the tree, in new places
  function regrow() {
    const spots = SPOTS.slice().sort(() => Math.random() - 0.5), pick = [];
    for (const [u, v] of spots) { if (pick.length >= G.apples.length) break; if (!pick.some(p => Math.hypot(p[0] - u, (p[1] - v) * G.h) < GAP)) pick.push([u, v]); }
    G.apples.forEach((a, i) => {
      const [u, v] = pick[i] || [a.u, a.v]; a.u = u; a.v = v; a.got = false; a.t = -0.2 - i * 0.16; a.back = true;
      a.s.material.map = blossomTex; a.s.material.needsUpdate = true; a.s.material.opacity = 1;
      const [x, y] = G.S.P(u, v); a.s.position.set(x, y, 0.05); a.tag.position.set(x, y + 0.07, 0.07);
    });
    compose();   // the painted-in apples go; the growing ones are drawn on top until the next filter comes on
  }

  /* ── finding them through the filter ── */
  function startRound() {
    const R = ROUNDS[G.r]; if (!R) return;
    G.phase = 'find'; G.roundGot = 0;
    compose();
    G.uni.mode.value = R.mode; G.uni.sev.value = R.sev; G.fadeTo = 1;
    G.ui.banner(R.name, R.desc, 0, R.kicker); G.bannerT = 2.4; G.band.quiet(0.55);
    G.say(`${R.kicker}. ${R.name}. ${R.desc} ${R.tip} Find ${R.count} apples.`);
    G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: where to look', press: () => G.playing && G.phase === 'find' && hint() }]);
    hud();
  }
  function tryPick(u, v) {
    if (G.phase !== 'find' || G.settle > 0) return;
    const a = G.apples.filter(a => !a.got).sort((x, y) => dist(x, { u, v }) - dist(y, { u, v }))[0];
    if (!a || dist(a, { u, v }) > PICK_R) { K.tone(180, 0.12, { type: 'triangle', vol: 0.05 }); G.misses++; return; }
    a.got = true; G.roundGot++; G.picked++; compose();
    // it drops into the basket
    const [x, y] = G.S.P(a.u, a.v), s = K.sprite(appleTex[a.kind], APPLE, { order: 32 }); s.position.set(x, y, 0.08); G.root.add(s);
    const n = G.drops.length, [bx, by] = G.basketXY, sl = SLOTS[n % SLOTS.length];
    G.drops.push({ s, x0: x, y0: y, x1: bx + sl[0], y1: by + 0.03 - sl[1], t: 0, a });
    const total = G.picked;
    G.band.note(NOTES[G.apples.indexOf(a)], (a.u - 0.5) * 1.6); G.band.level = FAMILY.length + total;
    G.fx.add(x, y, '#fff3c4', 18, 0.25); G.buzz([30, 30, 60]);
    G.say(`You found ${a.name}’s apple!`); hud();
    const R = ROUNDS[G.r];
    if (G.roundGot >= R.count) {
      G.r++; G.fadeTo = 0;
      // (the whole-family line is spoken at the finale, so it never cuts off the last apple's name)
      if (G.r >= ROUNDS.length) { G.settle = 2.6; G.ui.alert('You found the whole family', 'Everyone, together.', 2.4, 'red'); }
      else { G.settle = 3.4; G.phase = 'regrow'; G.regrowT = 0.9; G.ui.alert('Round cleared', 'The apples are growing back.', 2.4, 'black'); G.band.quiet(1); }
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
    title: 'Picking apples',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { picked: 0, regrowT: 0, beat: -1, lastStep: -1, phase: 'grow', r: 0, apples: [], drops: [], aim: { u: 0.5, v: 0.5 }, touch: null, touchT: 0, fadeTo: 0, settle: 0, t0: 0, humT: 0, bannerT: 0, botT: 0, waitT: 0, misses: 0, roundGot: 0 });
      G.cv = document.createElement('canvas'); G.tex = new THREE.CanvasTexture(G.cv); G.tex.colorSpace = THREE.NoColorSpace;
      G.uni = { map: { value: G.tex }, sev: { value: 0 }, aspect: { value: 1 / G.h }, hpx: { value: 300 }, mode: { value: 0 }, fade: { value: 0 }, alpha: { value: 0 }, gaze: { value: new THREE.Vector2(0.5, 0.5) } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { if (G) { G.img = im; compose(); } }; im.src = src; }
      compose();
      // the wicker basket: its back (handle, inside) behind the picked apples, its front over them
      { const [x, y] = G.S.P(BASKET.u, BASKET.v); G.basketXY = [x, y];
        G.basketBack = K.plane(basketBackTex, BASKET.w, BASKET.w * 200 / 256, { order: 31, opacity: 0 }); G.basketBack.position.set(x, y, 0.078); G.root.add(G.basketBack);
        G.basket = K.plane(basketFrontTex, BASKET.w, BASKET.w * 200 / 256, { order: 34, opacity: 0 }); G.basket.position.set(x, y, 0.09); G.root.add(G.basket); }
      // the tree's warm light, which grows with the family
      G.glow = K.sprite(glowTex, 0.95, { order: 13, additive: true, opacity: 0 }); { const [x, y] = G.S.P(CANOPY.u, CANOPY.v - 0.04); G.glow.position.set(x, y, 0.04); } G.root.add(G.glow);
      G.band = band(K.audio()); G.endT = 0; G.artist = null;
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.ui.buttons([]);
      growAll(); G.band.start(); G.beat = 0; G.lastStep = -1; G.band.level = 4;
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.level = FAMILY.length; G.phase = 'between'; startRound(); };
      K.intro(G, { title: 'Picking apples with vision loss', how: 'Find every apple through low vision. Tap each one to pick it.',
        say: 'Picking apples with vision loss. Can you still find every apple? Tap each one to pick it. A soft hum means you’re close.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // the music clock (84 beats a minute, in eighth notes)
      if (G.beat >= 0) { G.beat += dt * 84 / 60 * 2; const w = Math.floor(G.beat); while (G.lastStep < w) { G.lastStep++; G.band.step(G.lastStep % 8, Math.floor(G.lastStep / 8), 60 / 84 / 2); } }
      // the tree's warm light: grows as you hang apples, hides under the filter, blooms at the end
      { const want = G.phase === 'grow' ? 0.04 * G.apples.filter(a => a.t > 0).length : (G.phase === 'done' ? 0.55 + Math.sin(G.t * 1.5) * 0.1 : 0);
        G.glow.material.opacity += (want - G.glow.material.opacity) * Math.min(1, dt * 2); G.glow.scale.setScalar(0.95 * (1 + Math.sin(G.t * 1.1) * 0.02)); }
      // the artist speaks once the finale line is done; the music becomes a soft bed under them
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 3.4) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.quiet(0.3); } }
      if (G.bannerT > 0) { G.bannerT -= dt; if (G.bannerT <= 0) G.ui.hideBanner(); }
      G.uni.alpha.value += ((G.over ? 0 : 1) - G.uni.alpha.value) * Math.min(1, dt * 2);
      G.uni.fade.value += (G.fadeTo - G.uni.fade.value) * Math.min(1, dt * 1.6);
      // the apples on the tree (as sprites while you grow them; painted in while the filter is on)
      const painted = G.phase === 'find' || G.phase === 'between';
      for (const a of G.apples) {
        a.t += dt;
        if (a.t > 0.45 && a.s.material.map !== appleTex[a.kind]) { a.s.material.map = appleTex[a.kind]; a.s.material.needsUpdate = true; K.tone(NOTES[G.apples.indexOf(a)] * 1.5, 0.15, { vol: 0.04 }); }
        if (a.back && a.t > 0.3) { a.back = false; G.band.note(NOTES[G.apples.indexOf(a)], (a.u - 0.5) * 1.6); G.fx.add(...G.S.P(a.u, a.v), '#fff3c4', 10, 0.18); }
        const grow = a.t < 0.45 ? Math.min(1, a.t / 0.3) * 0.7 : Math.min(1.12, 0.5 + (a.t - 0.45) * 3) - Math.max(0, Math.min(0.12, (a.t - 0.62) * 0.6));
        const sway = Math.sin(G.t * 1.6 + a.u * 9) * 0.08;
        a.s.scale.setScalar(APPLE * Math.max(0.001, grow)); a.s.material.rotation = sway;
        a.s.material.opacity += ((painted || a.got ? 0 : 1) - a.s.material.opacity) * Math.min(1, dt * 6);
        a.tag.material.opacity = G.phase === 'done' && a.t > 0 ? Math.min(1, a.t * 4) : 0;   // name tags when the family is back together
      }
      // picked apples drop into the basket
      { const bo = G.basket.material.opacity + ((G.phase === 'grow' || G.phase === 'done' ? 0 : 1) - G.basket.material.opacity) * Math.min(1, dt * 3);
        G.basket.material.opacity = bo; G.basketBack.material.opacity = bo; }
      for (const d of G.drops) {
        d.t += dt; const k = Math.min(1, d.t / 0.8), e = k * k;
        d.s.position.set(d.x0 + (d.x1 - d.x0) * k, d.y0 + (d.y1 - d.y0) * e + Math.sin(k * Math.PI) * 0.06, 0.085);
        d.s.scale.setScalar(APPLE * (1 - 0.45 * k)); d.s.material.opacity = G.basket.material.opacity || (k < 1 ? 1 : 0);
        if (d.t > 0.8 && !d.landed) { d.landed = true; G.band.thunk(); G.basketBump = 1; }
      }
      G.basketBump = Math.max(0, (G.basketBump || 0) - dt * 4);
      { const sc = 1 + 0.08 * G.basketBump; G.basket.scale.set(sc, sc, 1); G.basketBack.scale.set(sc, sc, 1); }
      // where you look: a finger, else the middle of the screen (where the phone points)
      if (G.bot && G.playing && G.phase === 'find') { const a = G.apples.filter(a => !a.got)[0]; if (a) { G.aim.u += (a.u - G.aim.u) * Math.min(1, dt * 2); G.aim.v += (a.v - G.aim.v) * Math.min(1, dt * 2); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const gz = G.uni.gaze.value; gz.x += (G.aim.u - gz.x) * Math.min(1, dt * 10); gz.y += (G.aim.v - gz.y) * Math.min(1, dt * 10);
      // between growing and finding
      if (G.phase === 'between' && G.r === 0 && G.waitT > 0) { G.waitT -= dt; if (G.waitT <= 0) startRound(); return; }
      if (G.regrowT > 0) { G.regrowT -= dt; if (G.regrowT <= 0) regrow(); }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0) {
        if (G.r >= ROUNDS.length && !G.over) {
          G.phase = 'done';
          G.apples.forEach((a, i) => { a.got = false; a.t = -0.25 * i; a.back = true; a.s.material.map = appleTex[a.kind]; });   // everyone pops back onto the tree, one by one
          for (const d of G.drops) G.root.remove(d.s); G.drops = []; G.basket.material.opacity = 0; G.basketBack.material.opacity = 0;
          G.band.finale(); G.band.quiet(0.6); G.endT = 0;
          const t = Math.round(G.t - G.t0), r = K.best('roots-of-kinship:apples', G.misses, 'lower');
          K.finale(G, { won: true, title: 'The whole family, together', line: G.work && G.work.quote, best: r.isBest, say: 'You found the whole family. Everyone, together.',
            cells: [{ k: 'Apples', v: `${FAMILY.length}/${FAMILY.length}` }, { k: 'Misses', v: G.misses }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        } else if (G.r < ROUNDS.length) { G.phase = 'between'; startRound(); }
      } return; }
      if (!G.playing) return;
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
      if (G.phase === 'grow') return;
      if (kind === 'down') { if (p) G.touch = { u: p.u, v: p.v }; }
      else if (kind === 'move' && G.touch && p) G.touch = { u: p.u, v: p.v };
      else if (kind === 'up') { if (G.touch) tryPick(G.touch.u, G.touch.v); G.touch = null; G.touchT = 1.2; }
    },
    pause() { if (G) { G.paused = true; G.band.pause(); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.resume(); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'family-apples', playing: G.playing, over: G.over, phase: G.phase, round: G.r, apples: G.apples.length, found: G.apples.filter(a => a.got).length, misses: G.misses, settle: +G.settle.toFixed(2), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, list: G.apples.map(a => `${a.got ? '✓' : ''}${a.u.toFixed(3)},${a.v.toFixed(3)}`), t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
