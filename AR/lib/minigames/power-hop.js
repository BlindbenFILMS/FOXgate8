// THE POWER WITHIN (Academy of Music for the Blind): HERO HOP, a steering game about answering curious kids.
// “Blindness is resilience, a superpower. I don’t want to let my blindness stop me from experiencing things.
// If people are curious about it, let’s educate them.” — Acabella, AMB Performance Group
// The hero lifts off her rooftop (she's cut out of the painting: media/games/power/hero.png, with the city painted in
// behind her: city.jpg) and flies over the bright city. A curious kid leans out of a lit window and calls: a whistle
// "hey-oh!" from their side of the city, louder as she gets close. Hold LEFT or RIGHT (or touch the left or right side
// of the screen) to fly her there. When she reaches the window she swoops down, the kid asks a question about blindness,
// she answers, and a heart floats up. 8 kids. Then she flies home to her rooftop with the whole city waving, and the
// Academy's performance group speaks in their own voice.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas, HERO, WINDOWS } from './power-things.js';

const ACA = new URL('../../../3D/gallery/audio/art_58.mp3', import.meta.url).href;   // Acabella, AMB Performance Group, in their own words
const ART = new URL('../../media/games/power/', import.meta.url).href;
const KIDS = 8;
const INTRO = 20;                          // seconds: Ben's recorded intro, then the countdown
const ORDER = [4, 1, 3, 0, 5, 2, 3, 1];          // which window each kid calls from (WINDOWS index)
const QA = [
  ['How do you read?', 'With my fingers, in braille. And my phone reads to me out loud.'],
  ['How do you cross the street?', 'I listen to the traffic, and my white cane finds the curb.'],
  ['Can you see anything at all?', 'Every blind person is different. Some of us see light, colours or shapes.'],
  ["What's your cane for?", 'It finds steps, curbs and things in my way, before I bump into them.'],
  ['How do you use a phone?', 'It talks to me! A screen reader says everything out loud.'],
  ['Can I help you?', "Thank you for asking first! Then I'll tell you what I need."],
  ['Can you play music?', 'Yes! I sing with my friends at the Academy of Music for the Blind.'],
  ['Is it hard being blind?', 'Some days are hard. But I find my own way, and I keep going.'],
];
const L = {
  title: 'Hero Hop',
  how: 'Curious kids call from the windows. Hold LEFT or RIGHT to fly the hero to each one, and she answers their question.',
  intro: ['Hero hop.', 'Blindness is her superpower, and the kids in the city are curious about it.', 'Listen for a kid calling from a window.',
    'Hold left or right to fly the hero toward the sound.', "When she gets there, she'll answer their question.", 'Ready?'],
  left: 'On your left.', right: 'On your right.',
  more: { 7: '7 more.', 6: '6 more.', 5: '5 more.', 4: '4 more.', 3: '3 more.', 2: '2 more.', 1: 'The last kid.' },
  home: 'Every kid got an answer!', end: "That's the power within!",
};
// how long Ben takes to say a line (so she waits for the answer to finish)
const dur = (s, bot) => bot ? 1.2 : 0.9 + s.split(/\s+/).length * 0.36;

const HOME = { u: (HERO.box[0] + HERO.box[2]) / 2 / HERO.W, v: (HERO.box[1] + HERO.box[3]) / 2 / HERO.H };
const FLY_V = 0.3, FLY_S = 0.6, MIN_U = 0.1, MAX_U = 0.9, SPEED = 0.38;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the hero: her cape ripples (more when she flies), and she glows a little when she lands
const HFRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uFly, uGlow, uA;
void main(){
  vec2 p = vUv;
  float low = 1.0 - smoothstep(0.0, 0.75, p.y);                 // the cape flows more toward the bottom
  float edge = smoothstep(0.25, 0.5, abs(p.x - 0.5));           // and at its sides
  p.x += sin(p.y * 22.0 - uT * (5.0 + 5.0 * uFly)) * (0.006 + 0.02 * uFly) * low * (0.4 + edge);
  vec4 c = texture2D(map, p);
  c.rgb += vec3(1.0, 0.85, 0.5) * uGlow * 0.25 * c.a;
  gl_FragColor = vec4(c.rgb, c.a * uA);
}`;

/* ───────────────────────── the band: a bright, bouncy hero song, the kids' calls, her flight ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0.75; mus.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const panN = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, d, { type = 'sine', vol = 0.08, att = 0.008, p = 0, slide = 0, dest = out } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(panN(p, dest)); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(t, d, { freq = 1500, type = 'bandpass', q = 1, vol = 0.1, p = 0, dest = out } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f).connect(g).connect(panN(p, dest)); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  }
  // flying: a soft wind that follows her across the city
  const wind = ac.createBufferSource(); wind.buffer = nb; wind.loop = true;
  const wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 700; wf.Q.value = 0.7;
  const wg = ac.createGain(); wg.gain.value = 0; const wp = ac.createStereoPanner ? ac.createStereoPanner() : null;
  wind.connect(wf).connect(wg); if (wp) wg.connect(wp).connect(out); else wg.connect(out); wind.start();
  // the song: F major, I · vi · IV · V, with a bass, a backbeat of claps, and bright chords; more parts as kids get answers
  const PROG = [[41, 65, 69, 72], [38, 62, 65, 69], [46, 65, 70, 74], [48, 64, 67, 72]];
  let next = 0, step = 0, timer = null, on = false, level = 0;
  const BEAT = 60 / 112 / 2;
  function schedule() {
    while (next < ac.currentTime + 0.12) {
      const t = next, s = step % 8, ch = PROG[Math.floor(step / 8) % 4];
      if (on) {
        if (s === 0 || s === 3 || s === 6) tone(t, midi(ch[0]), BEAT * 1.6, { type: 'triangle', vol: 0.09, dest: mus });
        if (s % 4 === 0) tone(t, 110, 0.12, { vol: 0.2, slide: 45, dest: mus });
        if (s % 4 === 2) noise(t, 0.08, { freq: 1800, q: 0.8, vol: 0.12, dest: mus });
        if (level >= 1 && (s === 2 || s === 5)) ch.slice(1).forEach(m => tone(t, midi(m), BEAT * 1.2, { type: 'square', vol: 0.012, att: 0.01, dest: mus }));
        if (level >= 2 && s % 2 === 1) noise(t, 0.03, { freq: 7000, type: 'highpass', vol: 0.04, dest: mus });
        if (level >= 3 && (s === 0 || s === 4)) tone(t, midi(ch[1 + (step >> 3) % 3] + 12), BEAT * 1.8, { type: 'triangle', vol: 0.035, dest: mus });
      }
      next += BEAT; step++;
    }
  }
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.3); next = ac.currentTime + 0.1; timer = setInterval(schedule, 25); },
    music(v) { on = v; }, level(n) { level = n; },
    fly(v, p) { wg.gain.setTargetAtTime(v * 0.07, ac.currentTime, 0.15); wf.frequency.setTargetAtTime(500 + v * 900, ac.currentTime, 0.2); if (wp) wp.pan.setTargetAtTime(p, ac.currentTime, 0.1); },
    // a kid calling: a two-note whistle "hey-oh!" and a little bell, from their side, louder when she's close
    call(p, near) { const t = ac.currentTime + 0.01, v = 0.035 + 0.09 * near; tone(t, 1180, 0.16, { vol: v, p, slide: 1580 }); tone(t + 0.2, 1580, 0.22, { vol: v, p, slide: 1180 }); tone(t + 0.45, 2350, 0.3, { vol: v * 0.5, p }); },
    lift() { const t = ac.currentTime + 0.01; noise(t, 0.6, { freq: 600, q: 0.6, vol: 0.18 }); tone(t, 220, 0.5, { type: 'triangle', vol: 0.08, slide: 660 }); },
    land(p) { const t = ac.currentTime + 0.01; [0, 4, 7].forEach((d, i) => tone(t + i * 0.06, midi(77 + d), 0.3, { type: 'triangle', vol: 0.06, p })); },
    heart(p) { const t = ac.currentTime + 0.01; [72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.09, midi(m), 0.5, { type: 'triangle', vol: 0.07, p })); tone(t + 0.4, midi(96), 0.8, { vol: 0.03, p }); },
    home() { const t = ac.currentTime + 0.05; [65, 69, 72, 77, 81, 84].forEach((m, i) => tone(t + i * 0.1, midi(m), 1.4, { type: 'square', vol: 0.025 })); tone(t + 0.6, midi(41), 2, { type: 'triangle', vol: 0.12 }); },
    quiet(v) { mus.gain.setTargetAtTime(v, ac.currentTime, 0.4); },
    hush(v) { out.gain.setTargetAtTime(v ? 0 : 0.9, ac.currentTime, 0.1); },
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} setTimeout(() => { try { wind.stop(); } catch (e) {} }, 400); },
  };
}

export function heroHopGame() {
  let G = null;
  const tex = {};
  const T = k => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };

  function hud() {
    let sub = 'Hold ◀ LEFT or RIGHT ▶';
    if (G.phase === 'fly' && G.kid) { const dx = WINDOWS[G.kid.w].u - G.hu; sub = Math.abs(dx) < 0.06 ? 'HERE!' : dx < 0 ? '◀ Kid on your LEFT' : 'Kid on your RIGHT ▶'; }
    if (G.phase === 'talk') sub = 'Listen…';
    G.ui.panel('Hero Hop', `${G.done}<small>of ${KIDS} kids answered</small>`, { segs: [G.done, KIDS], sub });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; hud(); }
  const winAt = w => G.S.P(WINDOWS[w].u, WINDOWS[w].v);

  // a kid leans out of a window and starts calling
  function nextKid() {
    const n = G.done, w = ORDER[n];
    const s = K.sprite(T('kid' + (n % 4)), 0.17, { order: 22, opacity: 0 }); const [x, y] = winAt(w); s.position.set(x, y, 0.045); G.root.add(s);
    const q = K.sprite(T('ask'), 0.11, { order: 23, opacity: 0 }); q.position.set(x, y + 0.13, 0.05); G.root.add(q);
    if (G.kids[w]) { G.root.remove(G.kids[w].s); if (G.kids[w].q) G.root.remove(G.kids[w].q); }
    G.kid = { w, n, s, q, k: 0, callT: 0.2, hintT: 0 }; G.kids[w] = G.kid;
    if (n < 2) G.say(WINDOWS[w].u < G.hu ? L.left : L.right);
    setPhase('fly');
  }
  function arrive() {
    const k = G.kid; G.hold = 0;
    G.band.land((WINDOWS[k.w].u - 0.5) * 1.6); G.buzz(30);
    G.from = { u: G.hu, v: G.hv, s: G.hs };
    setPhase('swoop');
  }
  function talk() {
    const [q, a] = QA[G.kid.n];
    G.ui.alert('“Hey hero!”', q, dur(q, G.bot) + 0.4, 'black');
    G.say(q); G.talkStep = 0; G.talkT = dur(q, G.bot);
    setPhase('talk');
  }

  return {
    title: 'Hero Hop',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, done: 0, hold: 0, hu: HOME.u, hv: HOME.v, hs: 1, vel: 0, kid: null, kids: {}, hearts: [], endT: 0, artist: null, glow: 0, fly: 0, from: null });
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the city with her rooftop empty (it shows when she flies away)
      G.city = K.plane(null, 1, G.h, { order: 11, opacity: 0 }); G.city.position.z = 0.03; G.root.add(G.city);
      new THREE.TextureLoader().load(ART + 'city.jpg', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.city.material.map = t; G.city.material.needsUpdate = true; G.cityOK = true; });
      // the hero, cut out: a plane exactly the size of her box in the painting
      const bw = (HERO.box[2] - HERO.box[0]) / HERO.W, bh = (HERO.box[3] - HERO.box[1]) / HERO.W;
      G.huni = { map: { value: null }, uT: { value: 0 }, uFly: { value: 0 }, uGlow: { value: 0 }, uA: { value: 0 } };
      G.hero = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.ShaderMaterial({ uniforms: G.huni, vertexShader: VERT, fragmentShader: HFRAG, transparent: true, depthWrite: false }));
      G.hero.renderOrder = 30; G.root.add(G.hero);
      new THREE.TextureLoader().load(ART + 'hero.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.huni.map.value = t; G.heroOK = true; });
      G.btns = G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'red', aria: 'Fly left', press: () => { G.hold = -1; }, release: () => { if (G.hold === -1) G.hold = 0; } },
        { label: 'Right', icon: '▶', kind: 'red', aria: 'Fly right', press: () => { G.hold = 1; }, release: () => { if (G.hold === 1) G.hold = 0; } },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.music(true); G.band.lift(); G.from = { u: G.hu, v: G.hv, s: G.hs }; setPhase('lift'); };
      K.intro(G, { title: L.title, how: L.how, say: L.intro.join(' ') });
      if (!G.bot) G._introT = INTRO;   // wait for the whole spoken intro (tap the screen to skip it)
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over && !G.artist) {
        G.endT += dt;
        if (G.endT > 2.5) { G.artist = new Audio(ACA); G.artist.play().catch(() => {}); G.band.quiet(0.25); }
      }
      const ph = G.phase, sm = x => x * x * (3 - 2 * x);
      let flying = 0;

      if (ph === 'lift') {
        // she leaps off her rooftop and rises into the sky
        const k = sm(Math.min(1, G.phT / 1.1)); G.hv = G.from.v + (FLY_V - G.from.v) * k; G.hs = 1 + (FLY_S - 1) * k; flying = 1;
        if (G.phT > 1.3) nextKid();
      } else if (ph === 'fly') {
        // hold left or right to fly; she speeds up, and leans into the turn
        const want = G.hold * SPEED; G.vel += (want - G.vel) * Math.min(1, dt * 6);
        G.hu = Math.max(MIN_U, Math.min(MAX_U, G.hu + G.vel * dt)); G.hv = FLY_V + Math.sin(G.t * 2) * 0.01; G.hs = FLY_S;
        flying = Math.min(1, Math.abs(G.vel) / SPEED);
        const k = G.kid, wu = WINDOWS[k.w].u, dx = wu - G.hu, near = Math.max(0, 1 - Math.abs(dx) / 0.8);
        k.callT -= dt; if (k.callT <= 0) { k.callT = 1.15 - near * 0.4; G.band.call(Math.max(-1, Math.min(1, dx * 2.2)), near); }
        if (Math.abs(dx) < 0.05) arrive();
        else { k.hintT += dt; if (k.hintT > 8) { k.hintT = 0; G.say(dx < 0 ? L.left : L.right); } }
        if (Math.floor(G.t * 4) !== Math.floor((G.t - dt) * 4)) hud();
      } else if (ph === 'swoop') {
        // she swoops down beside the window
        const k = sm(Math.min(1, G.phT / 0.7)), w = WINDOWS[G.kid.w], tu = w.u + (w.u < 0.5 ? 0.1 : -0.1), tv = w.v - 0.14;
        G.hu = G.from.u + (tu - G.from.u) * k; G.hv = G.from.v + (tv - G.from.v) * k; G.hs = G.from.s + (0.5 - G.from.s) * k; G.vel = 0; flying = 1 - k;
        if (G.phT > 0.8) talk();
      } else if (ph === 'talk') {
        G.talkT -= dt; flying = 0;
        if (G.talkT <= 0 && G.talkStep === 0) {
          const a = QA[G.kid.n][1]; G.talkStep = 1; G.talkT = dur(a, G.bot); G.glow = 1;
          G.ui.alert('She says', a, G.talkT + 0.4, 'blue'); G.say(a);
        } else if (G.talkT <= 0 && G.talkStep === 1) {
          // the answer lands: a heart floats up from the window
          G.talkStep = 2; G.done++; G.band.heart((WINDOWS[G.kid.w].u - 0.5) * 1.6); G.buzz([30, 30, 60]); G.band.level(Math.floor(G.done / 2));
          const [x, y] = winAt(G.kid.w); const h = K.sprite(T('heart'), 0.08, { order: 26 }); h.position.set(x, y + 0.06, 0.06); G.root.add(h); G.hearts.push({ s: h, t: 0, x });
          G.fx.add(x, y + 0.04, '#ff6a8a', 18, 0.3);
          G.kid.q.material.opacity = 0; G.kid.done = true;
          if (G.done < KIDS) G.say(L.more[KIDS - G.done]);
          hud(); G.talkT = 1.1;
        } else if (G.talkT <= 0 && G.talkStep === 2) {
          G.from = { u: G.hu, v: G.hv, s: G.hs };
          if (G.done < KIDS) { G.band.lift(); setPhase('rise'); }
          else { G.band.lift(); G.say(L.home); setPhase('home'); }
        }
      } else if (ph === 'rise') {
        const k = sm(Math.min(1, G.phT / 0.6)); G.hv = G.from.v + (FLY_V - G.from.v) * k; G.hs = G.from.s + (FLY_S - G.from.s) * k; flying = 1;
        if (G.phT > 0.7) nextKid();
      } else if (ph === 'home') {
        // she flies home to her rooftop, and every window waves
        const k = sm(Math.min(1, G.phT / 1.6));
        G.hu = G.from.u + (HOME.u - G.from.u) * k; G.hv = G.from.v + (HOME.v - G.from.v) * k - Math.sin(k * Math.PI) * 0.08; G.hs = G.from.s + (1 - G.from.s) * k; flying = 1 - k;
        if (G.phT > 0.2 && !G.wave) {
          G.wave = true; G.band.home();
          WINDOWS.forEach((w, i) => { if (!G.kids[i]) { const s = K.sprite(T('kid' + (i % 4)), 0.17, { order: 22, opacity: 0 }); const [x, y] = winAt(i); s.position.set(x, y, 0.045); G.root.add(s); G.kids[i] = { w: i, s, k: 0, done: true }; } });
        }
        if (G.phT > 1.7 && !G.landed) { G.landed = true; G.glow = 1; G.fx.add(...G.S.P(HOME.u, 0.15), '#ffd66e', 30, 0.5); }
        if (G.phT > 3.8 && !G.over) {
          const secs = Math.round(G.t - G.t0), b = K.best('the-power-within:time', secs, 'lower');
          K.finale(G, { won: true, kicker: 'The Power Within', title: 'Superpower!', line: G.work && G.work.quote, best: b.isBest, say: L.end,
            cells: [{ k: 'Kids answered', v: KIDS }, { k: 'Time', v: secs + 's' }] });
          G.endT = 0;
        }
      }

      // ── what you see ──
      G.fly += (flying - G.fly) * Math.min(1, dt * 4);
      G.band.fly(G.phase === 'fly' ? Math.abs(G.vel) / SPEED : G.fly * 0.6, (G.hu - 0.5) * 1.6);
      const bob = ph === 'talk' || ph === 'intro' ? 0 : Math.sin(G.t * 2.2) * 0.004;
      const [hx, hy] = G.S.P(G.hu, G.hv);
      G.hero.position.set(hx, hy + bob, 0.06); G.hero.scale.setScalar(G.hs);
      G.hero.rotation.z = -G.vel * 0.6 + (ph === 'lift' ? Math.sin(G.phT * Math.PI) * 0.06 : 0);
      G.glow = Math.max(0, G.glow - dt * 1.2);
      G.huni.uT.value = G.t; G.huni.uFly.value = G.fly; G.huni.uGlow.value = G.glow;
      G.huni.uA.value += ((G.heroOK && G.cityOK ? 1 : 0) - G.huni.uA.value) * Math.min(1, dt * 3);
      G.city.material.opacity = G.huni.uA.value * (G.over && G.endT > 1.2 ? 0 : 1);
      // a trail of red and gold sparks behind her as she flies
      const sp = Math.abs(G.vel) / SPEED;
      G.trailT = (G.trailT || 0) - dt;
      if (sp > 0.3 && G.trailT <= 0) { G.trailT = 0.07; G.fx.add(hx - Math.sign(G.vel) * 0.06, hy - 0.04, Math.random() < 0.5 ? '#ec3013' : '#ffd25a', 3, 0.08); }
      // the kids pop out of their windows; the question bubble bobs; the hearts float up
      for (const k of Object.values(G.kids)) {
        k.k = Math.min(1, k.k + dt * 3);
        k.s.material.opacity = k.k * (k.done && G.kid !== k && !G.wave ? 0.75 : 1);
        k.s.scale.setScalar(0.17 * (0.5 + 0.5 * k.k) * (1 + (G.wave ? 0.06 * Math.sin(G.t * 8 + k.w) : 0.03 * Math.sin(G.t * 5 + k.w))));
        k.s.material.rotation = Math.sin(G.t * (G.wave ? 7 : 3) + k.w) * 0.05;
        if (k.q && !k.done) { k.q.material.opacity = k.k; k.q.position.y = winAt(k.w)[1] + 0.13 + Math.sin(G.t * 4) * 0.008; }
      }
      for (let i = G.hearts.length - 1; i >= 0; i--) {
        const h = G.hearts[i]; h.t += dt; h.s.position.y += dt * 0.07; h.s.position.x = h.x + Math.sin(h.t * 3) * 0.01; h.s.scale.setScalar(0.08 * (1 + Math.min(1, h.t * 3) * 0.3));
        h.s.material.opacity = Math.max(0, 1 - Math.max(0, h.t - 1.6) / 0.8);
        if (h.t > 2.4) { G.root.remove(h.s); G.hearts.splice(i, 1); }
      }

      // ── the robot: flies toward each kid's call and lets go when she's close ──
      if (G.bot && ph === 'fly') { const dx = WINDOWS[G.kid.w].u - G.hu; G.hold = Math.abs(dx) < 0.03 ? 0 : Math.sign(dx); }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'down' && G._introT > 0) { G._introT = 0; if (G.say.stop) G.say.stop(); G._introGo(); return; }   // tap to skip the intro
      // touch and hold the left or right side of the screen to fly that way
      if (kind === 'down') { K.audio(); G.touch = true; G.hold = ev.clientX < innerWidth / 2 ? -1 : 1; }
      else if (kind === 'move' && G.touch) G.hold = ev.clientX < innerWidth / 2 ? -1 : 1;
      else if (kind === 'up') { G.touch = false; G.hold = 0; }
    },
    pause() { if (G) { G.paused = true; G.band.hush(true); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.hush(false); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'hop', phase: G.phase, playing: G.playing, over: G.over, done: G.done, u: +G.hu.toFixed(2), kid: G.kid ? WINDOWS[G.kid.w].u : null, artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
