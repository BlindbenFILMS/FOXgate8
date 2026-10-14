// ALL LIFE'S BEAUTY (Dave Steele): DANCE IN THE FLOWERS.
// The girl in the garden becomes a puppet. Tilt the phone (or drag) and she sways with you; wave the phone (or swipe
// back and forth fast) and she twirls, her dress flaring and her hair swinging, while the stream of flowers pouring
// from her book swirls. A gentle lofi waltz plays, and on each bar a move is called: "Sway left", "Sway right",
// "Twirl". Do it in time and flowers burst from her book and join a ring of blossoms spinning around her. Grey clouds
// of worry ("the fear of tomorrow") drift in and dim the garden: wave them away so the beauty stays. Twelve moves,
// then the whole garden dances. "Don't let the fear of tomorrow take away the beauty you can still find today."
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/beauty/';
const MOVES = 12, WINDOW = 2.6;   // moves in a dance; seconds to do each one
const FEET = [0.375, 0.84];        // she sways from her feet

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting: she sways from her feet, her dress flares and her hair swings when she twirls, the stream of flowers
// from her book swirls, and grey worry dims the garden until you wave it away
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, info;
uniform float uSway, uTwirl, uSwirl, uT, uA, uH, uGray, uBloom;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 FEET = vec2(0.375, 0.84);
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // the stream of flowers from her book swirls
  vec3 i0 = at(info, p);
  vec2 s = p;
  if (i0.r > 0.01) {
    vec2 c = vec2(0.58, 0.34), d = p - c; float a = (0.25 + uSwirl) * i0.r * sin(uT * 1.3 + length(d) * 18.0) * 0.6;
    s = c + mat2(cos(a), -sin(a), sin(a), cos(a)) * d;
    s += vec2(sin(p.y * 40.0 + uT * 3.0), cos(p.x * 40.0 + uT * 2.5)) * 0.004 * (0.3 + uSwirl) * i0.r;
  }
  // her: the whole space around her bends as she sways (no holes), and twirling flares her dress and swings her hair
  float wx = exp(-pow((p.x - 0.39) / 0.17, 2.0));
  float up = clamp((FEET.y - p.y) / 0.58, 0.0, 1.0);
  s.x -= uSway * 0.6 * up * up * wx;
  float wd = exp(-pow((p.x - 0.395) / 0.2, 2.0)) * smoothstep(0.48, 0.72, p.y) * (1.0 - smoothstep(0.84, 0.92, p.y));
  s.x = mix(s.x, 0.395 + (s.x - 0.395) / (1.0 + 0.3 * uTwirl), wd);
  s.y += sin(p.x * 55.0 + uT * 8.0) * 0.003 * uTwirl * wd;
  s.x -= sin(uT * 7.0) * 0.01 * uTwirl * at(info, p).g;
  vec3 col = at(map, s);
  // worry dims and greys the garden
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(l) * 0.62 + 0.08, uGray * 0.75);
  // and at the end the whole garden glows
  col = mix(col, col * 1.12 + vec3(0.05, 0.035, 0.0), uBloom);
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── a lofi waltz ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]];   // D · Bm · G · A
const MEL = [74, 76, 78, 81, 79, 78, 76, 74, 73, 74, 76, 69];
function waltz(ac) {
  const BPM = 132, beat = 60 / BPM;   // three beats to a bar
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3400; bus.connect(tape).connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  let next = ac.currentTime + 0.1, step = 0, timer = null, onBar = null, t0 = 0;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b = step % 3, bar = Math.floor(step / 3), ch = CHORDS[bar % 4];
      if (b === 0) { tone(t, midi(ch[0] - 12), beat * 2.6, { type: 'triangle', vol: 0.22 }); tone(t, 110, 0.35, { vol: 0.3, slide: 45, att: 0.006 }); if (onBar) { const when = t; setTimeout(() => onBar && onBar(bar), Math.max(0, (when - ac.currentTime) * 1000)); } }
      else { ch.slice(1).forEach((m, i) => tone(t + i * 0.012, midi(m + 12), beat * 0.9, { vol: 0.03, att: 0.02 })); noise(t, 0.05, { freq: 7000, type: 'highpass', vol: 0.04 }); }
      if (b === 0 || (b === 2 && bar % 2)) tone(t + (b ? beat * 0.1 : 0), midi(MEL[(bar * 2 + (b ? 1 : 0)) % MEL.length]), beat * 2.2, { type: 'triangle', vol: 0.045, att: 0.005 });
      if (Math.random() < 0.2) noise(t + Math.random() * beat, 0.012, { freq: 3000 + Math.random() * 2500, q: 3, vol: 0.03 });
      next += beat; step++;
    }
  }
  return {
    beat, bar: beat * 3,
    start(cb) { onBar = cb; if (timer) return; next = ac.currentTime + 0.08; t0 = next; timer = setInterval(schedule, 30); schedule(); this.volume(0.85); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    gray(v) { tape.frequency.setTargetAtTime(3400 - v * 2400, ac.currentTime, 0.4); },
    cue(kind) { const t = ac.currentTime + 0.01, p = kind === 'left' ? -0.7 : kind === 'right' ? 0.7 : 0; tone(t, midi(kind === 'twirl' ? 86 : 81), 0.25, { vol: 0.05, p, out: fx }); tone(t + 0.1, midi(kind === 'twirl' ? 91 : 85), 0.3, { vol: 0.04, p, out: fx }); },
    bloom(n, p) { const t = ac.currentTime + 0.01; [0, 4, 7, 11, 14].forEach((d, i) => tone(t + i * 0.05, midi(74 + d + (n % 3) * 2), 0.9, { type: 'triangle', vol: 0.05, p, out: fx })); noise(t, 0.6, { freq: 4000, q: 0.6, vol: 0.05, sweep: 8000, out: fx, p }); },
    swoosh(p) { noise(ac.currentTime + 0.01, 0.4, { freq: 700, q: 0.8, vol: 0.1, sweep: 2200, att: 0.1, p, out: fx }); },
    worry() { const t = ac.currentTime + 0.02; tone(t, 98, 2.2, { type: 'sawtooth', vol: 0.025, att: 0.6, out: fx }); noise(t, 2, { freq: 300, type: 'lowpass', vol: 0.12, att: 0.6, out: fx }); },
    clear() { const t = ac.currentTime + 0.02; [69, 74, 78, 81].forEach((m, i) => tone(t + i * 0.08, midi(m), 1, { type: 'triangle', vol: 0.05, out: fx })); },
    finale() { const t = ac.currentTime + 0.1; [62, 66, 69, 74, 78, 81, 86].forEach((m, i) => tone(t + i * 0.14, midi(m), 3.5, { type: 'triangle', vol: 0.05, att: 0.05, out: fx })); },
    stop() { onBar = null; clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function danceInTheFlowersGame() {
  let G = null;

  /* ── tilt and wave (works on iPhone and Android, any way up) ── */
  function sensors() {
    const M = G.mot = { ok: false, g: [0, 0, 0], s: 0, roll: 0, n: 0, shake: 0 };
    const on = (ev) => {
      const a = ev.accelerationIncludingGravity; if (!a || a.x == null) return;
      M.ok = true; M.n++;
      const ang = (((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
      const x = a.x * ca - a.y * sa, y = a.x * sa + a.y * ca, z = a.z || 0, k = M.n < 4 ? 1 : 0.2;
      const jerk = Math.abs(x - M.g[0]) + Math.abs(y - M.g[1]) + Math.abs(z - M.g[2]);
      M.shake = Math.max(M.shake * 0.9, jerk);   // waving the phone
      M.g[0] += (x - M.g[0]) * k; M.g[1] += (y - M.g[1]) * k; M.g[2] += (z - M.g[2]) * k;
      const [gx, gy, gz] = M.g;
      if (Math.abs(gy) > 6) M.s = Math.sign(gy); else if (!M.s && Math.abs(gz) > 6) M.s = Math.sign(gz);
      M.roll = (Math.atan2(-(M.s || 1) * gx, Math.hypot(gy, gz)) * 180) / Math.PI;
    };
    addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
  }

  // each bar of the waltz: maybe call the next move, and sometimes send a cloud of worry
  function onBar(bar) {
    if (!G || G.phase !== 'dance') return;
    G.bar = bar;
    if (!G.cue && bar % 2 === 0 && G.done < MOVES) {
      const prev = G.lastKind, opts = ['left', 'right', 'twirl'].filter(k => k !== prev);
      const kind = opts[Math.floor(Math.random() * opts.length)];
      G.cue = { kind, t: 0 }; G.lastKind = kind; G.music.cue(kind);
      G.say({ left: 'Sway left.', right: 'Sway right.', twirl: 'Twirl!' }[kind]);
      G.ui.panel('Dance in the flowers', `${{ left: '◀ Sway left', right: 'Sway right ▶', twirl: '🌀 Twirl' }[kind]}`, { segs: [G.done, MOVES] });
    }
    if (G.done >= 3 && !G.worry && G.done < MOVES - 1 && bar % 6 === 3 && G.worries < 3) startWorry();
  }
  function startWorry() {
    G.worry = { t: 0 }; G.worries++; G.waveAmt = 0; G.music.worry();
    const n = 5; G.clouds = [];
    for (let i = 0; i < n; i++) {
      const s = K.sprite(G.cloudTex, 0.22 + Math.random() * 0.12, { order: 24, opacity: 0 }); s.scale.y *= 0.55;
      const [x, y] = G.S.P(1.05 + Math.random() * 0.2, 0.04 + Math.random() * 0.22); s.position.set(x, y, 0.05); G.root.add(s);
      G.clouds.push({ s, x, y, tx: G.S.P(0.15 + i * 0.18 + Math.random() * 0.06, 0.05 + Math.random() * 0.2) });
    }
    G.say('Grey clouds of worry are drifting in. Wave them away!');
    G.ui.alert('Worry', 'Wave the phone, or swipe fast, to blow it away.', 2.6, 'black');
  }
  function clearWorry() {
    if (!G.worry) return;
    G.worry = null; G.music.clear(); G.say('Gone. Back to today.'); G.cleared++;
    for (const c of G.clouds) c.leaving = true;
  }
  // a move was made: does it match the call?
  function move(kind) {
    if (G.phase !== 'dance') return;
    if (kind === 'twirl') { G.twirlT = 1.2; G.music.swoosh(0); }
    if (kind !== 'twirl') { G.swayKick = kind === 'left' ? -1 : 1; }
    if (G.worry && kind === 'twirl') { G.waveAmt += 1; if (G.waveAmt >= 2) clearWorry(); }
    if (!G.cue || G.cue.kind !== kind) return;
    G.cue = null; G.done++; G.combo++;
    burst(kind); G.buzz(25);
    G.ui.pop(['Lovely!', 'Beautiful!', 'Yes!', 'So graceful!'][G.done % 4]);
    G.ui.panel('Dance in the flowers', `${G.done} <small>of ${MOVES} moves</small>`, { segs: [G.done, MOVES] });
    if (G.done >= MOVES) setTimeout(() => G && finale(), 1500);
  }
  // flowers burst from her book and join the ring spinning around her
  function burst(kind) {
    G.music.bloom(G.done, kind === 'left' ? -0.6 : kind === 'right' ? 0.6 : 0);
    const [bx, by] = G.S.P(0.49, 0.44);
    for (let i = 0; i < 3; i++) {
      const tex = G.flowerTex[Math.floor(Math.random() * G.flowerTex.length)]; if (!tex) continue;
      const s = K.sprite(tex, 0.045 + Math.random() * 0.03, { order: 26 }); s.position.set(bx, by, 0.06); s.material.rotation = Math.random() * 6.28; G.root.add(s);
      G.petals.push({ s, a: Math.random() * 6.28, r: 0.13 + Math.random() * 0.1, h: 0.25 + Math.random() * 0.45, k: 0, spin: (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6) });
    }
    G.fx.add(bx, by, '#ffd27a', 12, 0.08);
  }
  function finale() {
    G.phase = 'finale'; G.cue = null; G.music.finale(); G.twirlT = 3;
    G.say('The whole garden is dancing with you. Today is beautiful.');
    setTimeout(() => {
      if (!G) return;
      K.finale(G, { won: true, kicker: 'Dance in the flowers', title: 'Today is beautiful', line: G.work && G.work.quote,
        cells: [{ k: 'Moves', v: `${G.done}/${MOVES}` }, { k: 'Worries waved away', v: G.cleared }],
        say: 'Today is beautiful. ' + ((G.work && G.work.quote) || '') });
    }, 5500);
  }
  function buttons() {
    G.ui.buttons([
      { label: 'Sway', icon: '◀', aria: 'Sway left', press: () => move('left') },
      { label: 'Twirl', icon: '🌀', kind: 'red', aria: 'Twirl, or wave away worry', press: () => move('twirl') },
      { label: 'Sway', icon: '▶', aria: 'Sway right', press: () => move('right') },
    ]);
  }

  return {
    title: 'Dance in the flowers',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', sway: 0, swayKick: 0, twirl: 0, twirlT: 0, swirl: 0, gray: 0, bloom: 0, done: 0, combo: 0, cue: null, lastKind: null, bar: 0, worry: null, worries: 0, cleared: 0, waveAmt: 0,
        clouds: [], petals: [], drag: null, swipe: 0, rollWas: 0, botT: 0 });
      G.music = waltz(K.audio());
      G.uni = { map: { value: null }, info: { value: null }, uSway: { value: 0 }, uTwirl: { value: 0 }, uSwirl: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uGray: { value: 0 }, uBloom: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 2; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'info.png', 'info');
      G.flowerTex = []; for (let i = 0; i < 12; i++) L.load(ART + 'flower-' + i + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.flowerTex.push(t); });
      // grey clouds of worry: lumpy and soft
      G.cloudTex = K.canvasTex(256, 140, (g) => {
        g.filter = 'blur(6px)';
        for (const [x, y, r] of [[70, 85, 42], [120, 65, 52], [175, 82, 40], [140, 95, 38], [95, 98, 34], [205, 95, 28]]) { g.fillStyle = 'rgba(92,96,104,.9)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
        g.filter = 'none';
      });
      sensors();
      G.onGo = () => { G.phase = 'dance'; G.music.start(onBar); buttons(); G.ui.panel('Dance in the flowers', `0 <small>of ${MOVES} moves</small>`, { segs: [0, MOVES] }); };
      K.intro(G, { title: 'Dance in the flowers', how: 'She dances with you. Tilt to sway her, wave the phone (or swipe fast) to twirl. Listen for each move and do it in time. Wave away the grey clouds of worry.',
        say: 'Dance in the flowers. She’s yours to dance with. Tilt your phone, or drag, and she sways. Wave your phone, or swipe back and forth fast, and she twirls. Listen for each move, sway left, sway right, or twirl, and do it in time with the waltz: flowers will burst from her book and spin around her. And if grey clouds of worry drift in, wave them away.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // reading the moves: tilt, a wave of the phone, or a drag / fast swipes
      let lean = 0;
      if (G.mot && G.mot.ok) {
        lean = Math.max(-1, Math.min(1, G.mot.roll / 20));
        if (Math.abs(G.mot.roll) > 14 && Math.sign(G.mot.roll) !== Math.sign(G.rollWas)) { G.rollWas = G.mot.roll; move(G.mot.roll < 0 ? 'left' : 'right'); }
        if (Math.abs(G.mot.roll) < 6) G.rollWas = 0;
        if (G.mot.shake > 14) { G.mot.shake = 0; move('twirl'); }
      }
      if (G.drag) lean = G.drag.lean;
      G.swayKick *= Math.pow(0.15, dt);
      const swayTo = (lean * 0.06 + G.swayKick * 0.07) + Math.sin(G.t * Math.PI * 2 / G.music.bar) * 0.012;
      G.sway += (swayTo - G.sway) * Math.min(1, dt * 6); u.uSway.value = G.sway;
      G.twirlT = Math.max(0, G.twirlT - dt); G.twirl += ((G.twirlT > 0 ? 1 : 0) - G.twirl) * Math.min(1, dt * 4); u.uTwirl.value = G.twirl;
      G.swirl += ((G.twirl * 0.8 + Math.min(1, G.done / MOVES) * 0.5) - G.swirl) * Math.min(1, dt * 2); u.uSwirl.value = G.swirl;
      // a called move waits a little while, then passes
      if (G.cue) { G.cue.t += dt; if (G.cue.t > WINDOW) { G.cue = null; G.combo = 0; G.ui.panel('Dance in the flowers', `${G.done} <small>of ${MOVES} moves</small>`, { segs: [G.done, MOVES] }); } }
      // worry: grey clouds drift in and dim the garden until you wave them away
      if (G.worry) { G.worry.t += dt; if (G.worry.t > 9) clearWorry(); }
      G.gray += ((G.worry ? Math.min(1, G.worry.t / 2) : 0) - G.gray) * Math.min(1, dt * 2); u.uGray.value = G.gray; G.music.gray(G.gray);
      for (let i = G.clouds.length - 1; i >= 0; i--) {
        const c = G.clouds[i];
        if (c.leaving) { c.s.position.x += dt * 0.8; c.s.material.opacity = Math.max(0, c.s.material.opacity - dt * 1.2); if (c.s.material.opacity <= 0) { G.root.remove(c.s); c.s.material.dispose(); G.clouds.splice(i, 1); } }
        else { c.s.position.x += (c.tx[0] - c.s.position.x) * dt * 0.4; c.s.position.y += (c.tx[1] - c.s.position.y) * dt * 0.4; c.s.material.opacity = Math.min(0.75, c.s.material.opacity + dt * 0.4); }
      }
      // the ring of flowers spinning around her
      const [fx, fy] = G.S.P(0.39, 0.56);
      for (const p of G.petals) {
        p.k = Math.min(1, p.k + dt * 0.8); p.a += dt * p.spin * (0.7 + G.twirl);
        const r = p.r * (0.6 + 0.4 * p.k), tx = fx + Math.cos(p.a) * r, ty = fy + (p.h - 0.45) * G.h * 0.6 + Math.sin(p.a) * r * 0.25 + Math.sin(G.t * 2 + p.a) * 0.01;
        p.s.position.x += (tx - p.s.position.x) * Math.min(1, dt * 3); p.s.position.y += (ty - p.s.position.y) * Math.min(1, dt * 3);
        p.s.position.z = 0.04 + (Math.sin(p.a) > 0 ? 0.03 : 0); p.s.renderOrder = Math.sin(p.a) > 0 ? 26 : 11;   // behind her, then in front
        p.s.material.rotation += dt * p.spin;
      }
      if (G.phase === 'finale') { G.bloom = Math.min(1, G.bloom + dt * 0.4); u.uBloom.value = G.bloom * 0.6; if (Math.random() < dt * 6) burst('twirl'); }
      // the robot dances every move, and waves the worry away
      if (G.bot && G.phase === 'dance') {
        if (G.cue && G.cue.t > 0.6) move(G.cue.kind);
        if (G.worry && G.worry.t > 1.5) { G.botT += dt; if (G.botT > 0.4) { G.botT = 0; move('twirl'); } }
      }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'dance') return;
      if (kind === 'down') G.drag = { x0: ev.clientX, x: ev.clientX, lean: 0, flips: 0, dir: 0, t: G.t, path: 0 };
      if (kind === 'move' && G.drag) {
        const d = G.drag, dx = ev.clientX - d.x; d.path += Math.abs(dx); d.x = ev.clientX;
        d.lean = Math.max(-1, Math.min(1, (ev.clientX - d.x0) / (innerWidth * 0.25)));
        const dir = Math.sign(dx); if (dir && dir !== d.dir) { if (d.dir) d.flips++; d.dir = dir; }
        // back and forth, fast: a twirl (or waving worry away)
        if (d.flips >= 2 && d.path > innerWidth * 0.5 && G.t - d.t < 1.2) { move('twirl'); d.flips = 0; d.path = 0; d.t = G.t; }
      }
      if (kind === 'up' && G.drag) {
        const d = G.drag; if (Math.abs(d.x - d.x0) > innerWidth * 0.12 && d.flips < 2) move(d.x < d.x0 ? 'left' : 'right');
        G.drag = null;
      }
    },
    pause() { if (G) { G.paused = true; G.music.volume(0); } },
    resume() { if (G) { G.paused = false; G.music.volume(0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'beauty', playing: G.playing, over: G.over, phase: G.phase, done: G.done, cue: G.cue && G.cue.kind, worry: !!G.worry, worries: G.worries, cleared: G.cleared,
      sway: +G.sway.toFixed(3), twirl: +G.twirl.toFixed(2), petals: G.petals.length, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.music.stop(); G.offMotion && G.offMotion(); } K.cleanup(G); G = null; },
  };
}
