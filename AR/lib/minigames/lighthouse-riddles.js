// LIGHTHOUSE OF HOPE (Craig Ellis): RIDDLES OF THE LIGHTHOUSE.
// The great face by the sea comes alive: its mouth moves as it speaks, the moon-lamp glows and pulses, the star by its
// eye twinkles, its hair of clouds drifts and the whole sea ripples. It asks riddles about living with blindness, and
// about Craig's lighthouse ("Hope is the light shining out of the lighthouse"). Three answers each, read out loud:
// pick one with the buttons (or tap Again to hear the riddle again). A wrong answer gets a kind hint and drops away.
// Every right answer sends a beam of light sweeping from the moon-lamp and lights more of the sea in gold. Six riddles,
// then the lighthouse shines out across the whole sea.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const RIDDLES = [
  { q: 'I have no hands, but I lead the way. I walk beside you every day. I stop at every curb and stair, and wag my tail to say we’re there. What am I?',
    a: 'A guide dog', wrong: ['A cat', 'A pigeon'], hint: 'I wear a harness, and I love a good belly rub.', yes: 'Yes! A guide dog. A best friend and a guide.' },
  { q: 'I’m long and white, I tap and sweep. I find the curb before you leap. Fold me up and I fit in a bag. What am I?',
    a: 'A white cane', wrong: ['An umbrella', 'A broom'], hint: 'People who are blind hold me out in front, tapping side to side.', yes: 'Yes! A white cane. Tap, sweep, and step with confidence.' },
  { q: 'I’m little bumps, in groups of six. You read me with your fingertips. What am I?',
    a: 'Braille', wrong: ['Morse code', 'Sign language'], hint: 'Louis Braille invented me when he was only fifteen.', yes: 'Yes! Braille. Reading with your fingertips.' },
  { q: 'Touch me and I talk. I read your messages, your emails and your books out loud, so you can use a phone without seeing it. What am I?',
    a: 'A screen reader', wrong: ['A radio', 'An alarm clock'], hint: 'I live inside phones and computers, and I speak whatever is on the screen.', yes: 'Yes! A screen reader. A voice for everything on the screen.' },
  { q: 'I stand on the shore and shine all night, so ships lost at sea can find their way. Craig says I’m just like hope. What am I?',
    a: 'A lighthouse', wrong: ['The moon', 'A campfire'], hint: 'Craig works at the East Texas one, for people who are blind.', yes: 'Yes! A lighthouse. A light that says, this way, you’re not alone.' },
  { q: 'Craig says it’s the very first thing they give to someone losing their sight. It weighs nothing at all, but it lights the way to the future. What is it?',
    a: 'Hope', wrong: ['A map', 'A flashlight'], hint: 'Look at the name of this painting.', yes: 'Yes. Hope. The first thing they give, and the light that shines out of the lighthouse.' },
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting: the profile's mouth opens and closes, the moon-lamp glows and pulses, the star by the eye twinkles,
// the hair of clouds drifts, the sea ripples, and a beam of light sweeps from the moon-lamp across a sea that grows gold
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uOpen, uT, uA, uH, uBeam, uBeamA, uGold, uShine;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 MOON = vec2(0.302, 0.135), STAR = vec2(0.4905, 0.443);
const float LINE = 0.539, EDGE = 0.556;   // the mouth line, and where the lips meet the sky
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  float sea = smoothstep(0.668, 0.676, p.y);
  // the sea ripples, more strongly closer to you
  float near = smoothstep(0.67, 1.0, p.y);
  s.x += sin(p.y * 180.0 - uT * 1.6 + sin(p.x * 7.0 + uT * 0.5) * 2.0) * (0.0012 + 0.004 * near) * sea;
  s.y += sin(p.x * 30.0 + uT * 1.1) * 0.0012 * near * sea;
  // the hair of clouds drifts (well away from the face)
  float hair = smoothstep(0.6, 0.66, p.x) * (1.0 - smoothstep(0.58, 0.64, p.y)) * smoothstep(0.17, 0.22, p.y);
  hair = max(hair, smoothstep(0.31, 0.36, p.x) * (1.0 - smoothstep(0.3, 0.36, p.y)) * smoothstep(0.2, 0.24, p.y) * step(p.x, 0.7));
  s += vec2(sin(p.y * 22.0 + uT * 0.9), cos(p.x * 18.0 + uT * 0.7)) * 0.003 * hair;
  // the jaw: everything below the mouth line around the chin drops as it speaks
  float dj = uOpen * 0.016;
  float jw = smoothstep(0.44, 0.47, p.x) * (1.0 - smoothstep(0.61, 0.65, p.x)) * (1.0 - smoothstep(0.585, 0.63, p.y));
  float below = smoothstep(LINE - 0.001, LINE + 0.002, p.y);
  s.y -= dj * jw * below;
  vec3 col = at(s);
  // the open mouth, seen from the side: a notch of sky between the lips
  float g = (p.y - LINE) / max(dj, 0.0001);
  if (dj > 0.0005 && g > 0.0 && g < 1.0) {
    float depth = 0.014 * uOpen * (1.0 - abs(g * 2.0 - 1.0));
    if (p.x > EDGE - depth && p.x < EDGE + 0.03) col = at(vec2(0.6, p.y));
  }
  // the moon-lamp glows and pulses, and the star by the eye twinkles
  float pulse = 0.5 + 0.5 * sin(uT * 1.1);
  float md = length((p - MOON) * vec2(1.0, uH));
  col += vec3(1.0, 0.92, 0.65) * (exp(-md * 14.0) * (0.25 + 0.2 * pulse + 0.4 * uShine) + exp(-md * 4.0) * 0.06);
  float sd = length((p - STAR) * vec2(1.0, uH));
  col += vec3(1.0, 0.95, 0.75) * exp(-sd * 60.0) * (0.4 + 0.4 * sin(uT * 3.3)) ;
  // the beam: a cone of light from the moon-lamp sweeping across the sea
  vec2 bd = (p - MOON) * vec2(1.0, uH); float ang = atan(bd.x, bd.y);
  float cone = exp(-pow((ang - uBeam) / 0.09, 2.0)) * smoothstep(0.02, 0.15, length(bd));
  col += vec3(1.0, 0.9, 0.6) * cone * uBeamA * 0.55;
  // the sea turns gold as hope grows
  float glow = sea * uGold * (0.5 + 0.5 * sin(p.x * 40.0 - p.y * 90.0 + uT * 2.0));
  col += vec3(0.5, 0.35, 0.12) * glow * 0.45;
  col *= mix(1.0, 1.15, uShine);
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the sea and a gentle tune ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function seaSound(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, out = bus, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.03);
  }
  const CH = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]];
  let next = 0, step = 0, timer = null, waveT = 0, hope = 0;
  function schedule() {
    while (next < ac.currentTime + 0.2) {
      const t = next, bar = Math.floor(step / 4) % 4, b = step % 4;
      if (b === 0) CH[bar].forEach((m, i) => tone(t + i * 0.1, midi(m), 5, { vol: 0.025, att: 1 }));
      if (Math.random() < 0.25 + hope * 0.5) tone(t + Math.random() * 0.3, midi(CH[bar][2 + Math.floor(Math.random() * 3)] + 12), 2.4, { type: 'triangle', vol: 0.035, att: 0.005 });
      next += 1.2; step++;
    }
    if (ac.currentTime > waveT) { waveT = ac.currentTime + 5 + Math.random() * 2; noise(ac.currentTime + 0.05, 3.5, { freq: 450, type: 'lowpass', vol: 0.16, att: 1.6, sweep: 1200 }); }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 50); schedule(); bus.gain.setTargetAtTime(0.85, ac.currentTime, 1); },
    hope(v) { hope = v; },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.3); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.3); },
    yes() { const t = ac.currentTime + 0.02; [69, 73, 76, 81, 85].forEach((m, i) => tone(t + i * 0.09, midi(m), 1.6, { type: 'triangle', vol: 0.06, out: fx })); noise(t + 0.2, 1.4, { freq: 2500, q: 0.5, vol: 0.05, sweep: 8000, att: 0.5, out: fx }); },
    no() { tone(ac.currentTime + 0.01, 330, 0.5, { vol: 0.05, out: fx }); tone(ac.currentTime + 0.15, 294, 0.6, { vol: 0.05, out: fx }); },
    finale() { const t = ac.currentTime + 0.1; [57, 64, 69, 73, 76, 81, 85, 88].forEach((m, i) => tone(t + i * 0.18, midi(m), 4, { type: 'triangle', vol: 0.05, att: 0.08, out: fx })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function riddlesOfTheLighthouseGame() {
  let G = null;

  // the face speaks: its mouth moves for about as long as the words take
  function speak(text) {
    G.say(text);
    const words = text.split(/\s+/).length;
    G.talkT = 0.4 + words * 0.36; G.talkPh = 0;
  }
  function ask() {
    const R = RIDDLES[G.ri]; G.left = [R.a, ...R.wrong].sort(() => Math.random() - 0.5); G.tries = 0;
    G.ui.panel(`Riddle ${G.ri + 1} of ${RIDDLES.length}`, '', { sub: R.q, segs: [G.ri, RIDDLES.length] });
    speak(`Riddle ${G.ri + 1}. ${R.q} Is it ${G.left.slice(0, -1).join(', ')}, or ${G.left[G.left.length - 1]}?`);
    buttons();
  }
  function answer(choice) {
    if (G.phase !== 'ask') return;
    const R = RIDDLES[G.ri];
    if (choice === R.a) {
      G.right++; G.sound.yes(); G.buzz([30, 40, 80]); speak(R.yes);
      G.ui.pop('✓ ' + R.a); G.sweep = 0; G.beamOn = 1;
      G.goldTo = G.right / RIDDLES.length; G.sound.hope(G.goldTo);
      G.phase = 'wait'; G.ui.buttons([]);
      setTimeout(() => { if (!G) return; G.ri++; if (G.ri >= RIDDLES.length) finale(); else { G.phase = 'ask'; ask(); } }, (0.6 + R.yes.split(/\s+/).length * 0.36 + 1.2) * 1000);
    } else {
      G.tries++; G.sound.no(); G.left = G.left.filter(x => x !== choice);
      speak(`Not that one. ${R.hint}`); buttons();
    }
  }
  function finale() {
    G.phase = 'finale'; G.sound.finale(); G.goldTo = 1; G.shineTo = 1; G.beamOn = 1; G.sweep = 0;
    speak('You answered every riddle. Now the lighthouse shines out across the whole sea. Hope is the light.');
    setTimeout(() => {
      if (!G) return;
      K.finale(G, { won: true, kicker: 'Riddles of the lighthouse', title: 'Hope is the light', line: G.work && G.work.quote,
        cells: [{ k: 'Riddles', v: `${G.right}/${RIDDLES.length}` }, { k: 'First try', v: G.firstTry }],
        say: 'Hope is the light. ' + ((G.work && G.work.quote) || '') });
    }, 8000);
  }
  function buttons() {
    const list = G.left.map(c => ({ label: c, aria: 'Answer: ' + c, press: () => { if (G.tries === 0 && c === RIDDLES[G.ri].a) G.firstTry++; answer(c); } }));
    list.push({ label: 'Again', icon: '↻', kind: 'black', aria: 'Hear the riddle again', press: () => { const R = RIDDLES[G.ri]; speak(`${R.q} Is it ${G.left.slice(0, -1).join(', ')}${G.left.length > 1 ? ', or ' : ''}${G.left[G.left.length - 1]}?`); } });
    const el = G.ui.buttons(list);
    if (el) el.forEach(b => Object.assign(b.style, { flex: '1 1 0', minWidth: '0', fontSize: '12px', padding: '0 6px', lineHeight: '1.1' }));
  }

  return {
    title: 'Riddles of the lighthouse',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', ri: 0, right: 0, firstTry: 0, left: [], tries: 0, open: 0, talkT: 0, talkPh: 0, sweep: 0, beamOn: 0, gold: 0, goldTo: 0, shine: 0, shineTo: 0, botT: 0 });
      G.sound = seaSound(K.audio());
      G.uni = { map: { value: null }, uOpen: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uBeam: { value: 0 }, uBeamA: { value: 0 }, uGold: { value: 0 }, uShine: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.onGo = () => { G.phase = 'ask'; G.sound.start(); ask(); };
      K.intro(G, { title: 'Riddles of the lighthouse', how: 'The face by the sea will ask you riddles about living with blindness, and about Craig’s lighthouse. Pick the answer. Every right answer shines the light a little further.',
        say: 'Riddles of the lighthouse. Hello, traveller. I keep the light by the sea. Answer my riddles, about living with blindness and about Craig’s lighthouse, and every right answer shines the light a little further. Listen, then pick your answer.' });
      G.talkT = 0.4 + 40 * 0.36;   // it speaks the intro, too
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the mouth: a talking rhythm while it speaks
      let want = 0;
      if (G.talkT > 0) { G.talkT -= dt; G.talkPh += dt; want = Math.max(0, Math.abs(Math.sin(G.talkPh * 9.5)) * (0.55 + 0.45 * Math.sin(G.talkPh * 2.3 + 1)) ); }
      G.open += (want - G.open) * Math.min(1, dt * 18); u.uOpen.value = G.open;
      // the beam sweeps once across the sea after each right answer
      if (G.beamOn) { G.sweep += dt * (G.phase === 'finale' ? 0.5 : 0.7); u.uBeam.value = 1.2 - G.sweep * 1.2; u.uBeamA.value = Math.sin(Math.min(1, G.sweep) * Math.PI); if (G.sweep >= 1) { if (G.phase === 'finale') G.sweep = 0; else G.beamOn = 0; } }
      else u.uBeamA.value = 0;
      G.gold += (G.goldTo - G.gold) * Math.min(1, dt * 0.8); u.uGold.value = G.gold;
      G.shine += (G.shineTo - G.shine) * Math.min(1, dt * 0.5); u.uShine.value = G.shine;
      // the robot: one wrong guess on the second riddle, then the right answers
      if (G.bot && G.phase === 'ask') { G.botT += dt; if (G.botT > 1.5) { G.botT = 0; const R = RIDDLES[G.ri]; answer(G.ri === 1 && G.tries === 0 ? R.wrong[0] : R.a); } }
    },
    pointer() {},
    pause() { if (G) { G.paused = true; G.sound.volume(0); } },
    resume() { if (G) { G.paused = false; G.sound.volume(0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'lighthouse', playing: G.playing, over: G.over, phase: G.phase, riddle: G.ri, right: G.right, open: +G.open.toFixed(2), gold: +G.gold.toFixed(2), beam: +G.uni.uBeamA.value.toFixed(2), t: +G.t.toFixed(1) }; },
    stop() { if (G) G.sound.stop(); K.cleanup(G); G = null; },
  };
}
