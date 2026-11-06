// LIGHTHOUSE OF HOPE (Craig Ellis): RIDDLES OF THE LIGHTHOUSE (polished 5 Nov 2026).
// "Hope is the light shining out of the lighthouse." The great face by the sea keeps the light. Six little ships are
// lost out on the dark sea, one waiting on the horizon for each riddle, ringing its bell from its side. The face asks a
// riddle about living with blindness (its mouth moves as it speaks) and reads the three answers: left, middle, right.
// Tap that button (or that third of the screen). Right: the searching beam from the moon-lamp locks onto the ship and
// guides it home across a sea that grows more golden with every ship. Wrong: a kind hint, and that answer goes dark.
// Six riddles, six ships home, then Craig reads his own words.
import * as THREE from 'three';
import * as K from './kit.js';
import { aboveHud } from './craig-hud.js';
import { shipTex, glowTex, wakeTex, WATERLINE } from './lighthouse-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_45.mp3', import.meta.url).href;   // Craig, in his own words

// Every sentence is fixed so Ben can record it once. The answers always come in the same order (left, middle, right).
const RIDDLES = [
  { q: 'I have no hands, but I lead the way. I walk beside you every day. I stop at every curb and stair, and wag my tail to say we’re there. What am I?',
    opts: ['A guide dog', 'A cat', 'A pigeon'], a: 0, choices: 'Left, a guide dog. Middle, a cat. Right, a pigeon.',
    hint: 'I wear a harness, and I love a good belly rub.', yes: 'Yes! A guide dog. A best friend and a guide.' },
  { q: 'I’m long and white, I tap and sweep. I find the curb before you leap. Fold me up and I fit in a bag. What am I?',
    opts: ['An umbrella', 'A white cane', 'A broom'], a: 1, choices: 'Left, an umbrella. Middle, a white cane. Right, a broom.',
    hint: 'People who are blind hold me out in front, tapping side to side.', yes: 'Yes! A white cane. Tap, sweep, and step with confidence.' },
  { q: 'I’m little bumps, in groups of six. You read me with your fingertips. What am I?',
    opts: ['Morse code', 'Sign language', 'Braille'], a: 2, choices: 'Left, Morse code. Middle, sign language. Right, Braille.',
    hint: 'Louis Braille invented me when he was only fifteen.', yes: 'Yes! Braille. Reading with your fingertips.' },
  { q: 'Touch me and I talk. I read your messages and your books out loud, so you can use a phone without seeing it. What am I?',
    opts: ['A radio', 'A screen reader', 'An alarm clock'], a: 1, choices: 'Left, a radio. Middle, a screen reader. Right, an alarm clock.',
    hint: 'I live inside phones and computers, and I speak whatever is on the screen.', yes: 'Yes! A screen reader. A voice for everything on the screen.' },
  { q: 'I stand on the shore and shine all night, so ships lost at sea can find their way. Craig says I’m just like hope. What am I?',
    opts: ['A lighthouse', 'The moon', 'A campfire'], a: 0, choices: 'Left, a lighthouse. Middle, the moon. Right, a campfire.',
    hint: 'I stand tall by the sea, with a great lamp at the top.', yes: 'Yes! A lighthouse. A light that says, this way, you’re not alone.' },
  { q: 'Craig says it’s the very first thing they give to someone losing their sight. It weighs nothing at all, but it lights the way to the future. What is it?',
    opts: ['A map', 'A flashlight', 'Hope'], a: 2, choices: 'Left, a map. Middle, a flashlight. Right, hope.',
    hint: 'Look at the name of this painting.', yes: 'Yes. Hope. The first thing they give, and the light that shines out of the lighthouse.' },
];
const L = {
  title: 'Riddles of the lighthouse.',
  intro: 'Riddles of the lighthouse. Hello, traveller. Six ships are lost at sea tonight. Answer my riddles, and my light will guide them home. The answers are left, middle and right.',
  riddle: n => `Riddle ${n}.`,
  no: 'Not that one.',
  home: n => (n === 1 ? '1 ship is home.' : `${n} ships are home.`),
  allHome: 'Every ship is home.',
  end: 'Hope is the light.',
};
// where each ship waits on the horizon, and where it comes to rest in the near water (u, v on the painting)
const WAIT = [[0.86, 0.676], [0.70, 0.676], [0.94, 0.676], [0.78, 0.676], [0.64, 0.676], [0.90, 0.676]];
const HOME = [[0.62, 0.80], [0.81, 0.79], [0.71, 0.875], [0.92, 0.86], [0.58, 0.935], [0.83, 0.95]];
const FAR = 0.055, NEAR = 0.13;   // ship size on the horizon, and at home
const MOON = [0.302, 0.135];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting: the profile's mouth opens and closes, the moon-lamp glows and pulses, the star by the eye twinkles,
// the hair of clouds drifts, the sea ripples, a beam of light from the moon-lamp searches the sea (and locks onto the
// ship when you answer right), and the sea grows more golden with every ship home
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uOpen, uT, uA, uH, uBeam, uBeamA, uBeamW, uGold, uShine;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 MOON = vec2(0.302, 0.135), STAR = vec2(0.4905, 0.443);
const float LINE = 0.539, EDGE = 0.556;   // the mouth line, and where the lips meet the sky
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  float sea = smoothstep(0.668, 0.676, p.y);
  float near = smoothstep(0.67, 1.0, p.y);
  s.x += sin(p.y * 180.0 - uT * 1.6 + sin(p.x * 7.0 + uT * 0.5) * 2.0) * (0.0012 + 0.004 * near) * sea;
  s.y += sin(p.x * 30.0 + uT * 1.1) * 0.0012 * near * sea;
  float hair = smoothstep(0.6, 0.66, p.x) * (1.0 - smoothstep(0.58, 0.64, p.y)) * smoothstep(0.17, 0.22, p.y);
  hair = max(hair, smoothstep(0.31, 0.36, p.x) * (1.0 - smoothstep(0.3, 0.36, p.y)) * smoothstep(0.2, 0.24, p.y) * step(p.x, 0.7));
  s += vec2(sin(p.y * 22.0 + uT * 0.9), cos(p.x * 18.0 + uT * 0.7)) * 0.003 * hair;
  float dj = uOpen * 0.016;
  float jw = smoothstep(0.44, 0.47, p.x) * (1.0 - smoothstep(0.61, 0.65, p.x)) * (1.0 - smoothstep(0.585, 0.63, p.y));
  float below = smoothstep(LINE - 0.001, LINE + 0.002, p.y);
  s.y -= dj * jw * below;
  vec3 col = at(s);
  float g = (p.y - LINE) / max(dj, 0.0001);
  if (dj > 0.0005 && g > 0.0 && g < 1.0) {
    float depth = 0.014 * uOpen * (1.0 - abs(g * 2.0 - 1.0));
    if (p.x > EDGE - depth && p.x < EDGE + 0.03) col = at(vec2(0.6, p.y));
  }
  float pulse = 0.5 + 0.5 * sin(uT * 1.1);
  float md = length((p - MOON) * vec2(1.0, uH));
  col += vec3(1.0, 0.92, 0.65) * (exp(-md * 14.0) * (0.3 + 0.2 * pulse + 0.25 * uBeamA + 0.4 * uShine) + exp(-md * 4.0) * 0.06);
  float sd = length((p - STAR) * vec2(1.0, uH));
  col += vec3(1.0, 0.95, 0.75) * exp(-sd * 60.0) * (0.4 + 0.4 * sin(uT * 3.3));
  // the beam: a cone of light from the moon-lamp
  vec2 bd = (p - MOON) * vec2(1.0, uH); float ang = atan(bd.x, bd.y);
  float cone = exp(-pow((ang - uBeam) / uBeamW, 2.0)) * smoothstep(0.02, 0.15, length(bd));
  col += vec3(1.0, 0.9, 0.6) * cone * uBeamA * (0.45 + 0.35 * sea);
  // the sea turns gold as hope grows
  float glow = sea * uGold * (0.5 + 0.5 * sin(p.x * 40.0 - p.y * 90.0 + uT * 2.0));
  col += vec3(0.5, 0.35, 0.12) * glow * 0.55;
  col *= mix(1.0, 1.15, uShine);
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the sea, a gentle tune that grows, ship bells ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function seaSound(ac) {
  const master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const panned = (pan, out) => { if (!ac.createStereoPanner) return out; const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(out); return p; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, out = bus, sweep = 0, att = 0.005, pan = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(panned(pan, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, pan = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(panned(pan, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  // a little ship's bell: two bright partials
  function bell(t, pan, vol = 0.05) { tone(t, 1318, 1.6, { vol, pan, out: fx }); tone(t, 1318 * 2.76, 0.6, { vol: vol * 0.4, pan, out: fx }); tone(t + 0.28, 1318, 1.4, { vol: vol * 0.8, pan, out: fx }); }
  const CH = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]];
  let next = 0, step = 0, timer = null, waveT = 0, ships = 0;
  function schedule() {
    while (next < ac.currentTime + 0.2) {
      const t = next, bar = Math.floor(step / 4) % 4, b = step % 4;
      if (b === 0) CH[bar].forEach((m, i) => tone(t + i * 0.1, midi(m), 5, { vol: 0.025, att: 1 }));
      // the tune grows: one more voice for every ship that's home
      if (Math.random() < 0.2 + ships * 0.12) tone(t + Math.random() * 0.3, midi(CH[bar][2 + Math.floor(Math.random() * 3)] + 12), 2.4, { type: 'triangle', vol: 0.035, att: 0.005 });
      if (ships >= 2 && b === 2) tone(t, midi(CH[bar][0] - 12), 2.2, { vol: 0.05, att: 0.08 });
      if (ships >= 4 && (b === 1 || b === 3)) tone(t + 0.6, midi(CH[bar][4] + 12), 1.2, { type: 'triangle', vol: 0.022 });
      next += 1.2; step++;
    }
    if (ac.currentTime > waveT) { waveT = ac.currentTime + 5 + Math.random() * 2; noise(ac.currentTime + 0.05, 3.5, { freq: 450, type: 'lowpass', vol: 0.16, att: 1.6, sweep: 1200 }); }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 50); schedule(); bus.gain.setTargetAtTime(0.85, ac.currentTime, 1); },
    ships(n) { ships = n; },
    master(v, secs = 0.4) { master.gain.setTargetAtTime(v, ac.currentTime, secs); },
    bell(pan, vol) { bell(ac.currentTime + 0.02, pan, vol); },
    press(pan) { tone(ac.currentTime + 0.005, 660, 0.18, { type: 'triangle', vol: 0.07, pan, out: fx }); },
    yes(pan) { const t = ac.currentTime + 0.02; [69, 73, 76, 81, 85].forEach((m, i) => tone(t + i * 0.09, midi(m), 1.6, { type: 'triangle', vol: 0.06, out: fx })); noise(t + 0.2, 1.4, { freq: 2500, q: 0.5, vol: 0.05, sweep: 8000, att: 0.5, out: fx, pan }); },
    no(pan) { tone(ac.currentTime + 0.01, 330, 0.5, { vol: 0.05, out: fx, pan }); tone(ac.currentTime + 0.15, 294, 0.6, { vol: 0.05, out: fx, pan }); },
    finale() { const t = ac.currentTime + 0.1; [57, 64, 69, 73, 76, 81, 85, 88].forEach((m, i) => tone(t + i * 0.18, midi(m), 4, { type: 'triangle', vol: 0.05, att: 0.08, out: fx })); },
    stop() { clearInterval(timer); timer = null; try { master.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function riddlesOfTheLighthouseGame() {
  let G = null;
  const PAN = [-0.8, 0, 0.8];
  const angleTo = (u, v) => Math.atan2(u - MOON[0], (v - MOON[1]) * G.h);
  const panOf = u => (u - 0.5) * 1.6;

  function speak(text) { G.say(text); G.talking = 0.5; }   // the mouth moves while the voice is busy
  const busy = () => !G.bot && G.say.busy && G.say.busy();

  function makeShip(i) {
    const grp = new THREE.Group(); grp.position.z = 0.05;
    const body = K.sprite(shipTex, 1, { order: 22 }); body.position.y = (0.5 - WATERLINE) * 1;   // waterline sits on the sea
    const wake = K.plane(wakeTex, 1.3, 0.3, { order: 21, additive: true, opacity: 0.55 }); wake.position.y = -0.12;
    const lamp = K.sprite(glowTex, 0.42, { order: 23, additive: true, opacity: 0.9 }); lamp.position.set(-0.33, 0.06, 0.001);
    grp.add(wake, body, lamp); grp.visible = false; G.root.add(grp);
    return { grp, body, wake, lamp, i, state: 'hidden', k: 0, u: WAIT[i][0], v: WAIT[i][1], size: FAR, ph: Math.random() * 6, bellT: 1 };
  }
  function place(s) {
    const [x, y] = G.S.P(s.u, s.v); s.grp.position.x = x; s.grp.position.y = y;
    s.grp.scale.set(s.size, s.size, 1);
  }

  function ask(again) {
    const R = RIDDLES[G.ri];
    if (!again) { G.out = [false, false, false]; G.tries = 0; const s = G.ships[G.ri]; s.state = 'wait'; s.grp.visible = true; s.fade = 0; s.bellT = 1.2; }
    G.ui.panel(`Riddle ${G.ri + 1} of ${RIDDLES.length}`, '', { sub: R.q, segs: [G.home, RIDDLES.length] });
    speak(`${L.riddle(G.ri + 1)} ${R.q} ${R.choices}`);
    G.phase = 'ask'; G.botT = 0; buttons();
  }
  function answer(k) {
    if (!G || G.phase !== 'ask' || G.out[k]) return;
    const R = RIDDLES[G.ri];
    G.sound.press(PAN[k]);
    if (k === R.a) {
      if (G.tries === 0) G.firstTry++;
      G.home++; G.sound.yes(PAN[k]); G.buzz([30, 40, 80]); speak(G.home < RIDDLES.length ? `${R.yes} ${L.home(G.home)}` : R.yes);
      G.ui.alert(R.opts[k], '', 1.6, 'blue'); G.ui.buttons([]);
      const s = G.ships[G.ri]; s.state = 'sail'; s.k = 0; G.lock = s; G.lockT = 0;
      G.goldTo = G.home / RIDDLES.length; G.sound.ships(G.home);
      G.ui.panel(`Riddle ${G.ri + 1} of ${RIDDLES.length}`, '', { sub: R.q, segs: [G.home, RIDDLES.length] });
      G.phase = 'sail'; G.waitT = 0;
    } else {
      G.tries++; G.out[k] = true; G.sound.no(PAN[k]); G.buzz([60]);
      G.ships[G.ri].rock = 1;
      speak(`${L.no} ${R.hint}`); buttons();
    }
  }
  function buttons() {
    const R = RIDDLES[G.ri];
    const list = R.opts.map((c, k) => ({ label: G.out[k] ? '—' : c, kind: G.out[k] ? 'black' : '', aria: (['Left', 'Middle', 'Right'][k]) + ': ' + c, press: () => answer(k) }));
    list.push({ label: '', icon: '↻', kind: 'black', aria: 'Hear the riddle again', press: () => { if (G.phase === 'ask') { G.sound.press(0); speak(`${R.q} ${R.choices}`); } } });
    const el = G.ui.buttons(list);
    if (el) el.forEach((b, i) => {
      if (i < 3) Object.assign(b.style, { flex: '1 1 0', minWidth: '0', fontSize: '16px', padding: '0 6px', lineHeight: '1.1', opacity: G.out[i] ? '0.35' : '1' });
      else Object.assign(b.style, { flex: '0 0 54px', minWidth: '0', padding: '0', fontSize: '24px', justifyContent: 'center' });
    });
  }
  function finale() {
    G.phase = 'finale'; G.sound.finale(); G.goldTo = 1; G.shineTo = 1; G.lock = null; G.finT = 0;
    G.ui.buttons([]);
    speak(`${L.allHome}`);
  }
  function endPanel() {
    G.phase = 'end';
    K.finale(G, { won: true, kicker: 'Riddles of the lighthouse', title: 'Hope is the light', line: G.work && G.work.quote,
      cells: [{ k: 'Ships home', v: `${G.home}/${RIDDLES.length}` }, { k: 'First try', v: `${G.firstTry}/${RIDDLES.length}` }],
      say: L.end });
    G.overT = 0;
  }

  return {
    title: 'Riddles of the lighthouse',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      G.hud = aboveHud(G);   // the score panel and pop-ups sit above the painting, as wide as it
      Object.assign(G, { phase: 'intro', ri: 0, home: 0, firstTry: 0, out: [false, false, false], tries: 0, open: 0, talking: 0, talkPh: 0,
        beam: 0.9, beamA: 0, beamW: 0.12, lock: null, lockT: 0, gold: 0, goldTo: 0, shine: 0, shineTo: 0, botT: 0, waitT: 0, finT: 0, overT: 0, artist: null, musicBack: false });
      G.sound = seaSound(K.audio());
      G.uni = { map: { value: null }, uOpen: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uBeam: { value: 0.9 }, uBeamA: { value: 0 }, uBeamW: { value: 0.12 }, uGold: { value: 0 }, uShine: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.ships = RIDDLES.map((_, i) => makeShip(i));
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.onGo = () => { G.sound.start(); ask(); };
      K.intro(G, { title: 'Riddles of the lighthouse', how: 'Six ships are lost at sea. Answer each riddle: left, middle or right. Every right answer guides a ship home.', say: L.intro });
      G.talking = 0.5;
    },
    update(dt) {
      if (!G || G.paused) return;
      G.hud.update();
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the mouth: a talking rhythm while the voice is speaking
      if (G.talking > 0) G.talking -= dt;
      const talkingNow = G.phase !== 'end' && ((G.say.busy && G.say.busy()) || G.talking > 0);
      let want = 0; if (talkingNow) { G.talkPh += dt; want = Math.abs(Math.sin(G.talkPh * 9.5)) * (0.55 + 0.45 * Math.sin(G.talkPh * 2.3 + 1)); }
      G.open += (want - G.open) * Math.min(1, dt * 18); u.uOpen.value = G.open;

      // the beam: searches slowly while a riddle is asked; locks bright onto the ship as it sails home
      let bA = 0, bW = 0.12, bTo = G.beam;
      if (G.phase === 'ask' || G.phase === 'intro') { bA = G.phase === 'ask' ? 0.45 : 0.25; bTo = 0.75 + Math.sin(G.t * 0.45) * 0.4; }
      if (G.lock) { G.lockT += dt; bA = Math.min(1, G.lockT * 2.5); bW = 0.08; bTo = angleTo(G.lock.u, G.lock.v - 0.01); }
      if (G.phase === 'finale' || G.phase === 'end') { bA = G.over ? 0 : 0.9; bW = 0.16; bTo = 0.6 + Math.sin(G.t * 0.6) * 0.7; }
      G.beam += (bTo - G.beam) * Math.min(1, dt * (G.lock ? 6 : 1.5)); G.beamA += (bA - G.beamA) * Math.min(1, dt * 3); G.beamW += (bW - G.beamW) * Math.min(1, dt * 3);
      u.uBeam.value = G.beam; u.uBeamA.value = G.beamA; u.uBeamW.value = G.beamW;
      G.gold += (G.goldTo - G.gold) * Math.min(1, dt * 0.8); u.uGold.value = G.gold;
      G.shine += (G.shineTo - G.shine) * Math.min(1, dt * 0.5); u.uShine.value = G.shine;

      // the ships: bob on the swell; the waiting one rings its bell from its side; the guided one sails home
      for (const s of G.ships) {
        if (s.state === 'hidden') continue;
        s.ph += dt;
        if (s.state === 'wait') {
          s.fade = Math.min(1, (s.fade || 0) + dt * 1.5);
          if (G.phase === 'ask') { s.bellT -= dt; if (s.bellT <= 0) { s.bellT = 6; G.sound.bell(panOf(s.u), 0.04); } }
        }
        if (s.state === 'sail') {
          s.k = Math.min(1, s.k + dt / 3.6);
          const e = s.k * s.k * (3 - 2 * s.k);
          s.u = WAIT[s.i][0] + (HOME[s.i][0] - WAIT[s.i][0]) * e;
          s.v = WAIT[s.i][1] + (HOME[s.i][1] - WAIT[s.i][1]) * e - Math.sin(e * Math.PI) * 0.015;
          s.size = FAR + (NEAR - FAR) * e;
          if (s.k >= 1) { s.state = 'home'; G.sound.bell(panOf(s.u), 0.06); { const [bx, by] = G.S.P(s.u, s.v); G.fx.add(bx, by, '#ffd77a', 16, 0.25); } if (G.lock === s) G.lock = null; }
        }
        if (s.rock) s.rock = Math.max(0, s.rock - dt * 0.8);
        place(s);
        s.grp.position.y += Math.sin(s.ph * 1.7) * 0.0025 * (s.size / NEAR);
        s.body.material.rotation = Math.sin(s.ph * 1.3) * 0.05 + (s.rock || 0) * Math.sin(s.ph * 12) * 0.12;
        const op = (s.fade ?? 1) * (G.over ? Math.max(0, 1 - (G.overT || 0) * 0.5) : 1);
        s.body.material.opacity = op;
        s.lamp.material.opacity = op * (0.65 + 0.3 * Math.sin(s.ph * 5.3) * Math.sin(s.ph * 2.1));
        s.wake.material.opacity = op * (s.state === 'sail' ? 0.8 : 0.4 + 0.2 * G.gold);
      }

      // after a right answer: wait for the ship to get home and the words to finish, then the next riddle
      if (G.phase === 'sail') {
        G.waitT += dt;
        const s = G.ships[G.ri];
        if (s.state === 'home' && !busy() && G.waitT > 1) {
          G.ri++;
          if (G.ri >= RIDDLES.length) finale(); else ask();
        }
      }
      if (G.phase === 'finale') { G.finT += dt; if (G.finT > 3 && !busy()) endPanel(); }

      // the finale: Craig reads his own words, the music softens under him and comes back after
      if (G.over) {
        G.overT += dt;
        if (G.overT > 2.5 && !G.artist && !busy()) {
          G.sound.master(0.25, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.sound.master(0.7, 2); } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.onerror = back; G.artist.play().catch(back); } catch (e) { G.artist = { pause() {} }; back(); }
          G.clipSafety = G.overT + 28;
        }
        if (G.artist && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.sound.master(0.7, 2); }
      }

      // the robot: one wrong guess on the second riddle, then the right answers
      if (G.bot && G.phase === 'ask') { G.botT += dt; if (G.botT > 1.5) { G.botT = 0; const R = RIDDLES[G.ri]; answer(G.ri === 1 && G.tries === 0 ? (R.a + 1) % 3 : R.a); } }
      G.hud.update();
    },
    // tap the left, middle or right third of the screen to answer, too (for players who don't look for the buttons)
    pointer(kind, ev) {
      if (!G || G.paused || kind !== 'down' || G.phase !== 'ask') return;
      answer(G.S.screenThird(ev) + 1);
    },
    pause() { if (G) { G.paused = true; G.sound.master(0, 0.2); if (G.artist) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; G.sound.master(G.artist && !G.musicBack ? 0.25 : 1, 0.3); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'lighthouse', playing: G.playing, over: G.over, phase: G.phase, riddle: G.ri, home: G.home, firstTry: G.firstTry, open: +G.open.toFixed(2), gold: +G.gold.toFixed(2), beam: +G.beamA.toFixed(2),
      artist: !!(G.artist && G.artist.currentTime > 0), artistT: G.artist ? +(G.artist.currentTime || 0).toFixed(1) : 0, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.hud) G.hud.remove(); if (G) { G.sound.stop(); if (G.artist) { try { G.artist.pause(); } catch (e) {} G.artist = null; } } K.cleanup(G); G = null; },
  };
}
