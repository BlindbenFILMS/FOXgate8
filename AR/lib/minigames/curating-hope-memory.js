// CURATING HOPE (Ben Fox): LIGHT MEMORY, a song we remember together.
// Three of the people under the tree are the voices: low on the left (blue light), middle (gold), high on the right
// (orange), the painting's own colours. They are cut out of the painting (media/games/memory/singer-N.png), so when one
// sings, that very person glows in their colour and grows a little. Listen to the community sing a little of their
// song, then sing it back by tapping them (or their big buttons) in the same order. 6 rounds: the song grows from 3
// notes to 8. Each round you remember sends light from the singers up into the tree: the painting's own colours
// brighten from the trunk outward and more of its paper-like leaves drift and swirl in the branches, and a soft warm
// band gains a layer. Get one wrong and nobody is out: the community just sings it again, together. At the end the
// whole song plays in harmony, every person under the tree lights up, and Ben reads his quote in his own voice.
// By ear: every round is announced ("Round 2. Listen."), notes go from low on the left to high on the right and come
// from where each person stands, "Remembered!" after each round. You can tap anywhere: left to right across the screen
// picks the person. The round arrow (or 9 quiet seconds) sings the song again.
import * as THREE from 'three';
import * as K from './kit.js';

const ART = new URL('../../media/games/memory/', import.meta.url).href;
const ARTIST = new URL('../../../3D/gallery/audio/art_2.mp3', import.meta.url).href;   // Ben, in his own words

// each singer: cut-out centre (u, v), size (w, h as fractions of the painting), feet (v), voice, colours, button
const PEOPLE = [
  { u: 0.2007, v: 0.7495, w: 0.0400, h: 0.1143, feet: 0.7988, vowel: 'oo', col: '#8fc3ff', btn: '#2f6fd6', label: 'Low' },
  { u: 0.4375, v: 0.6978, w: 0.0508, h: 0.1240, feet: 0.7520, vowel: 'oh', col: '#ffd47a', btn: '#f0b429', label: 'Middle' },
  { u: 0.6782, v: 0.7354, w: 0.0498, h: 0.1172, feet: 0.7861, vowel: 'ah', col: '#ff8a5a', btn: '#ec5a13', label: 'High' },
];
const NOTES = [60, 64, 67];                         // C E G: low on the left, high on the right
const SONG = [1, 2, 1, 0, 2, 1, 2, 0];              // the community's song (the melody you'll remember), ending home on C
const FIRST = 3;                                     // the first round sings 3 notes; then 4, 5 ... 8
const FORM = { ah: [800, 1150, 2900], oh: [500, 900, 2600], oo: [330, 870, 2300] };
const BLUES = ['#6f9be0', '#9fc8ff', '#4a6fc0', '#c4dcff', '#7fb0d8'], WARMS = ['#ffb45a', '#ff7a3a', '#ffd47a', '#f0602a', '#ffc98a'];
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

/* a soft sung voice: a buzzy tone shaped by three vowel resonances, with a little vibrato */
function sing(ac, dest, t, m, dur, vowel = 'ah', vol = 0.5, pan = 0) {
  const f0 = midi(m), src = ac.createOscillator(), vib = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain(), mix = ac.createGain();
  src.type = 'sawtooth'; src.frequency.value = f0; vib.frequency.value = 5.3; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(14, t + 0.3); vib.connect(vg); vg.connect(src.detune);
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null; if (p) p.pan.value = pan;
  FORM[vowel].forEach((f, i) => { const b = ac.createBiquadFilter(), bg = ac.createGain(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = 6 + i * 3; bg.gain.value = [1, 0.6, 0.25][i]; src.connect(b).connect(bg).connect(mix); });
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.07); g.gain.setValueAtTime(vol, t + Math.max(0.08, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.18);
  mix.connect(g); if (p) g.connect(p).connect(dest); else g.connect(dest);
  src.start(t); vib.start(t); src.stop(t + dur + 0.25); vib.stop(t + dur + 0.25);
}

/* the band: a soft warm bed in C under the singing, one more layer for every round remembered
   0 a low hum · 1 a warm pad · 2 wind chimes high above · 3 a slow heartbeat · 4 a shimmer · 5 warmth (the sixth) */
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mix = ac.createGain(); mix.gain.value = 1; mix.connect(out);
  const oscs = [];
  function hum(ms, type, vol, lp) {
    const g = ac.createGain(); g.gain.value = 0; let dest = g;
    if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.connect(g); dest = f; }
    ms.forEach((m, i) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = midi(m); o.detune.value = i % 2 ? 5 : -5; o.connect(dest); o.start(); oscs.push(o); });
    g.connect(mix); return { g, vol };
  }
  function bell(t, m, vol, p) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), pn = ac.createStereoPanner ? ac.createStereoPanner() : null;
    o.frequency.value = midi(m); o2.frequency.value = midi(m) * 2.76; const g2 = ac.createGain(); g2.gain.value = 0.25;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g); o2.connect(g2).connect(g); if (pn) { pn.pan.value = p; g.connect(pn).connect(mix); } else g.connect(mix);
    o.start(t); o2.start(t); o.stop(t + 2.3); o2.stop(t + 2.3);
  }
  function thump(t) {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g).connect(mix); o.start(t); o.stop(t + 0.55);
  }
  const L = [hum([48, 55], 'sine', 0.05), hum([60, 64], 'triangle', 0.022, 900), null, null, hum([84, 91], 'sine', 0.005), hum([69, 72], 'triangle', 0.014, 1100)];
  let level = -1, chimeT = 1.5, beatT = 0, ducked = false, on = 0.8;
  return {
    start() { out.gain.setTargetAtTime(on, ac.currentTime, 0.8); this.level = 0; },
    set level(n) { level = n; L.forEach((x, i) => { if (x && i <= n) x.g.gain.setTargetAtTime(x.vol, ac.currentTime, 1.6); }); },
    get level() { return level; },
    // called every frame; listening = the singers are singing, so the chimes wait
    tick(dt, listening) {
      if (level >= 2 && !listening) { chimeT -= dt; if (chimeT <= 0) { chimeT = 1.8 + Math.random() * 1.6; bell(ac.currentTime + 0.01, [84, 86, 88, 91, 93, 96][Math.floor(Math.random() * 6)], 0.022, Math.random() * 1.6 - 0.8); } }
      if (level >= 3) { beatT -= dt; if (beatT <= 0) { beatT = 2.4; const t = ac.currentTime + 0.01; thump(t); thump(t + 0.32); } }
    },
    duck(v) { if (v === ducked) return; ducked = v; mix.gain.setTargetAtTime(v ? 0.5 : 1, ac.currentTime, 0.3); },
    // remembered: a rising sparkle through the chord
    remembered(n) { const t = ac.currentTime + 0.05; [72, 76, 79, 84, 88].forEach((m, i) => bell(t + i * 0.09, m + (n % 2 ? 0 : 0), 0.035, -0.6 + i * 0.3)); },
    // Ben is about to speak: the band goes down to a soft bed under him
    hush() { on = 0.22; out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(on, ac.currentTime, 0.6); },
    pause() { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); },
    resume() { out.gain.setTargetAtTime(on, ac.currentTime, 0.2); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); setTimeout(() => { oscs.forEach(o => { try { o.stop(); } catch (e) {} }); try { out.disconnect(); } catch (e) {} }, 400); } catch (e) {} },
  };
}

/* the tree's light: the painting's own colours, brightened from the trunk outward as the memory grows */
const LIGHT_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const LIGHT_FS = `
uniform sampler2D map; uniform float level, crowd, flash, time, ok; varying vec2 vUv;
void main(){
  vec3 c = texture2D(map, vUv).rgb;
  vec2 p = (vUv - vec2(0.5, 0.56)) * vec2(1.0, 1.15);
  float d = length(p) + 0.025 * sin(atan(p.y, p.x) * 7.0 + time * 0.6);
  float r = 0.05 + level * 0.5;
  float m = 1.0 - smoothstep(r - 0.14, r + 0.03, d);
  m *= smoothstep(0.26, 0.42, vUv.y);                              // the tree, not the ground
  float sh = 0.82 + 0.18 * sin(time * 1.4 + vUv.x * 21.0 + sin(vUv.y * 15.0 + time * 0.8) * 2.0);
  float band = crowd * exp(-pow((vUv.y - 0.255) / 0.07, 2.0));     // everyone under the tree, at the end
  float k = m * sh * (0.25 + 0.55 * min(level, 1.0)) + m * flash * 0.6 + band * 0.9;
  gl_FragColor = vec4(c * k * ok, 1.0);
}`;

/* a leaf of the painting: a torn, brushy paper fragment (tinted per leaf) */
const leafTex = K.canvasTex(64, 64, g => {
  g.beginPath(); g.moveTo(9, 15); g.lineTo(57, 6); g.lineTo(53, 49); g.lineTo(31, 52); g.lineTo(5, 57); g.closePath();
  const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,.72)'); g.fillStyle = gr; g.fill();
  g.globalCompositeOperation = 'destination-out'; g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2;
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(6 + i * 9, 12 + i); g.lineTo(2 + i * 9, 56 - i); g.stroke(); }
});

export function lightMemoryGame() {
  let G = null;
  const rounds = SONG.length - FIRST + 1;
  const busy = () => !G.bot && G.say && G.say.busy && G.say.busy();

  function hud() {
    const len = G.len, sub = G.phase === 'listen' || G.phase === 'cue' ? 'Listen…' : G.phase === 'you' ? `Your turn: ${G.pos} of ${len}` : '';
    G.ui.panel(`Round ${Math.min(rounds, G.round + 1)} of ${rounds}`, `${G.round}<small>of ${rounds} remembered</small>`, { segs: [G.round, rounds], sub });
  }
  function light(i, dur = 0.5) {
    const P = G.ppl[i]; P.on = 1; P.dur = dur;
    const b = G.btns && G.btns[i]; if (b) { b.classList.add('lit'); clearTimeout(b._lit); b._lit = setTimeout(() => b.classList.remove('lit'), dur * 1000 + 120); }
    sing(G.ac, G.bus, G.ac.currentTime + 0.01, NOTES[i], dur, PEOPLE[i].vowel, 0.55, (PEOPLE[i].u - 0.5) * 1.6);
    const [x, y] = G.S.P(PEOPLE[i].u, PEOPLE[i].v - PEOPLE[i].h * 0.45); G.fx.add(x, y, PEOPLE[i].col, 8, 0.14);
  }
  // say a line, then (once it has been spoken) the community sings
  function cue(text) { G.phase = 'cue'; G.pos = 0; hud(); if (text) G.say(text); G.cueT = G.t + (G.bot ? 0.2 : 0.5); G.cueMax = G.cueT + 7; }
  function sing_() {
    G.phase = 'listen'; G.pos = 0; hud();
    const gap = Math.max(0.42, 0.68 - G.round * 0.035), seq = SONG.slice(0, G.len);
    G.queue = seq.map((n, k) => ({ at: G.t + 0.35 + k * gap, n, dur: gap * 0.8 }));
    G.queueEnd = G.t + 0.35 + seq.length * gap + 0.2;
  }
  function roundCue() { cue(G.len >= SONG.length ? 'The last round. The whole song. Listen.' : `Round ${G.round + 1}. Listen.`); }
  function yourTurn() { G.phase = 'you'; G.pos = 0; G.idle = 0; hud(); G.say('Your turn.'); G.botAt = G.t + 0.8; }
  function wait(secs, after) { G.phase = 'wait'; G.waitT = secs; G.after = after; }
  function press(i) {
    if (G.phase !== 'you') return;
    light(i, 0.42); G.buzz(15); G.idle = 0;
    if (i !== SONG[G.pos]) {
      G.misses++;
      K.tone(196, 0.4, { type: 'triangle', vol: 0.06 }); G.buzz([60, 40, 60]);
      G.ui.alert('Let’s sing it again', 'Together. Listen once more.', 1.6, 'blue');
      wait(0.9, () => cue('Let’s sing it again, together.')); hud(); return;
    }
    G.pos++; hud();
    if (G.pos >= G.len) {   // remembered: light streams from the singers up into the tree
      G.round++; G.light.to = G.round / rounds; G.flash = 1; G.band.level = G.round; G.band.remembered(G.round);
      PEOPLE.forEach((p, k) => { for (let j = 0; j < 4; j++) addLeaf(k); });
      G.buzz([30, 40, 30]);
      if (G.len >= SONG.length) {
        G.ui.alert('You remembered the whole song', 'Now everyone sings it together.', 2.6, 'red');
        G.say('You remembered the whole song. Now everyone sings it, together.'); wait(1.2, chorus);
      } else {
        G.len++; G.ui.alert('Remembered!', `The tree holds ${G.round} of ${rounds} memories.`, 1.6, 'black');
        G.say('Remembered!'); wait(1.4, roundCue);
      }
      hud();
    }
  }
  // the end: every voice sings the whole song, with harmony, the whole tree glows and everyone under it lights up
  function chorus() {
    G.phase = 'chorus'; G.playing = false; G.crowd.to = 1; G.light.to = 1.25; G.ui.buttons([]);
    for (let j = 0; j < 18; j++) addLeaf(j % 3);
    const t0 = G.ac.currentTime + 0.3, gap = 0.62;
    SONG.forEach((n, k) => {
      const t = t0 + k * gap;   // the melody, an octave below, and a harmony a fifth above
      sing(G.ac, G.bus, t, NOTES[n], gap * 0.95, 'ah', 0.45, -0.5);
      sing(G.ac, G.bus, t, NOTES[n] - 12, gap * 0.95, 'oh', 0.35, 0.5);
      sing(G.ac, G.bus, t, NOTES[n] + 7, gap * 0.95, 'oo', 0.22, 0);
      G.queue.push({ at: G.t + 0.3 + k * gap, n, dur: gap * 0.9, all: true });
    });
    G.settle = 0.3 + SONG.length * gap + 1.4;
  }
  function again() { if (G.phase === 'you') cue('Listen.'); }

  // leaves: fly from singer k up into the swirling canopy (k < 0: start already in the tree)
  function addLeaf(k) {
    const ang = Math.random() * Math.PI * 2, rad = 0.1 + Math.random() * 0.32;
    const warm = Math.cos(ang) * rad > (Math.random() - 0.5) * 0.15, cols = warm ? WARMS : BLUES;
    const s = K.sprite(leafTex, 0.026 + Math.random() * 0.026, { color: cols[Math.floor(Math.random() * cols.length)], opacity: 0, order: 16 });
    s.scale.y *= 0.75; s.material.rotation = Math.random() * 6.28; G.root.add(s);
    const from = k >= 0 ? G.S.P(PEOPLE[k].u, PEOPLE[k].v - PEOPLE[k].h * 0.3) : null;
    G.leaves.push({ s, ang, rad, spd: (0.05 + Math.random() * 0.08) * (Math.random() < 0.8 ? 1 : -1), spin: (Math.random() - 0.5) * 1.6, ph: Math.random() * 6.28,
      fly: from ? 0 : 1, fx: from ? from[0] : 0, fy: from ? from[1] : 0, a: from ? 1 : 0, ease: 0 });
  }

  return {
    title: 'Light memory',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { round: 0, len: FIRST, pos: 0, misses: 0, phase: 'intro', queue: [], queueEnd: 0, waitT: 0, after: null, settle: 0, t0: 0, botAt: 0,
        cueT: 0, cueMax: 0, idle: 0, flash: 0, endT: 0, artist: null, leaves: [], light: { v: 0, to: 0 }, crowd: { v: 0, to: 0 } });
      G.ac = K.audio(); G.bus = G.ac.createGain(); G.bus.gain.value = 0.9; G.bus.connect(G.ac.destination);
      G.band = band(G.ac);
      // a soft dusk over the painting so the lights glow
      G.dim = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.MeshBasicMaterial({ color: 0x050812, transparent: true, opacity: 0, depthWrite: false }));
      G.dim.position.z = 0.03; G.dim.renderOrder = 11; G.root.add(G.dim);
      // the tree's light (the painting's own colours, added on top)
      G.uni = { map: { value: null }, level: { value: 0 }, crowd: { value: 0 }, flash: { value: 0 }, time: { value: 0 }, ok: { value: 0 } };
      G.glow = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: LIGHT_VS, fragmentShader: LIGHT_FS,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      G.glow.position.z = 0.035; G.glow.renderOrder = 12; G.root.add(G.glow);
      if (G.work && G.work.image) new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.uni.ok.value = 1; });
      // the three singers, cut out of the painting, standing on their own feet
      G.ppl = PEOPLE.map((p, i) => {
        const [fx, fy] = G.S.P(p.u, p.feet), off = (p.feet - p.v) * G.h, H = p.h * G.h;
        const grp = new THREE.Group(); grp.position.set(fx, fy, 0.05); G.root.add(grp);
        const glow = K.plane(null, p.w * 1.25, H * 1.18, { additive: true, opacity: 0, order: 14 }); glow.material.color = new THREE.Color(p.col); glow.position.y = off; glow.visible = false; grp.add(glow);
        const fig = K.plane(null, p.w, H, { order: 15 }); fig.position.set(0, off, 0.002); fig.visible = false; grp.add(fig);
        new THREE.TextureLoader().load(ART + `singer-${i + 1}.png`, t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; fig.material.map = t; fig.material.needsUpdate = true; fig.visible = true; });
        new THREE.TextureLoader().load(ART + `singer-${i + 1}-glow.png`, t => { if (!G) return; glow.material.map = t; glow.material.needsUpdate = true; glow.visible = true; });
        const [bx, by] = G.S.P(p.u, p.v - 0.25);   // a ribbon of light up into the branches
        const beam = K.sprite(K.glowTex, 0.12, { color: p.col, additive: true, opacity: 0, order: 13 }); beam.position.set(bx, by, 0.045); beam.scale.set(0.15, 0.5, 1); G.root.add(beam);
        const pool = K.sprite(K.glowTex, 0.2, { color: p.col, additive: true, opacity: 0, order: 13 }); pool.position.set(fx, fy, 0.045); pool.scale.set(0.13, 0.04, 1); G.root.add(pool);
        return { grp, fig, glow, beam, pool, on: 0, dur: 0.5, by: fy };
      });
      for (let j = 0; j < 6; j++) addLeaf(-1);
      // a big button for each singer, in their colour (they light up when that person sings), then Again
      G.btns = G.ui.buttons(PEOPLE.map((p, i) => ({ label: p.label, aria: `${p.label} voice, ${['left', 'middle', 'right'][i]}`, press: () => G.playing && press(i) }))
        .concat([{ label: '', icon: '↻', kind: 'black', aria: 'Hear the song again', press: () => G.playing && again() }]));
      G.btns.forEach((b, i) => { if (i < PEOPLE.length) { b.style.background = PEOPLE[i].btn; b.style.color = i === 1 ? '#14100c' : '#fff'; b.style.transition = 'transform .08s, box-shadow .08s, filter .08s'; } else b.style.flex = '0 0 66px'; });
      if (!document.getElementById('chm-css')) { const st = document.createElement('style'); st.id = 'chm-css'; st.textContent = '.mgk-btns button.lit{filter:brightness(1.35);transform:scale(1.06);box-shadow:0 0 0 4px #fff,0 0 26px 6px rgba(255,230,160,.9)}'; document.head.appendChild(st); }
      // stop Ben's clip if the player opens his story video
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); roundCue(); };
      K.intro(G, { title: 'Light memory', how: 'Three people under the tree sing a little of their song. Sing it back: tap them, or their buttons, in the same order. Low on the left, high on the right.',
        say: 'Light memory. The people under the tree sing a song together, a few notes at a time. Listen, then sing it back by tapping them in the same order. Low notes are on the left, high notes on the right, and you can tap anywhere across the screen.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.band.tick(dt, G.phase === 'listen' || G.phase === 'chorus'); G.band.duck(G.phase === 'listen' || G.phase === 'you');
      G.dim.material.opacity += ((G.over ? 0.12 : 0.42) - G.dim.material.opacity) * Math.min(1, dt * 1.5);
      // the tree's light grows toward its target; a flash when a round is remembered
      G.light.v += (G.light.to - G.light.v) * Math.min(1, dt * 0.9); G.crowd.v += (G.crowd.to - G.crowd.v) * Math.min(1, dt * 1.2); G.flash = Math.max(0, G.flash - dt * 0.8);
      Object.assign(G.uni.level, { value: G.light.v }); G.uni.crowd.value = G.crowd.v; G.uni.flash.value = G.flash; G.uni.time.value = G.t;
      // the singers glow and grow while they sing (and breathe softly between notes)
      G.ppl.forEach((P, i) => { if (P.on > 0) P.on = Math.max(0, P.on - dt / (P.dur + 0.25)); const a = Math.min(1, P.on * 1.6), rest = G.phase === 'intro' ? 0.5 : 1;
        const br = Math.sin(G.t * 1.6 + i * 2.1) * 0.012 + (G.phase === 'chorus' || G.over ? 0.05 + Math.sin(G.t * 3 + i) * 0.03 : 0);
        P.grp.scale.setScalar(1 + a * 0.2 + br); P.grp.position.y = P.by + a * 0.006;
        P.fig.material.color.setScalar(1 + a * 0.8 + G.crowd.v * 0.3);
        P.glow.material.opacity = Math.min(1, Math.max(rest * 0.38, a) + G.crowd.v * 0.4); P.glow.scale.setScalar(1 + a * 0.25);
        P.beam.material.opacity = a * 0.6;
        P.pool.material.opacity = Math.min(1, rest * 0.55 + a * 0.5); P.pool.scale.set(0.13 + a * 0.05, 0.04 + a * 0.015, 1); });
      // the leaves swirl in the branches (and fly up from the singers when a round is remembered)
      const [cx, cy] = G.S.P(0.5, 0.36);
      G.leaves.forEach(L => { L.ang += L.spd * dt; L.s.material.rotation += L.spin * dt;
        const ox = cx + Math.cos(L.ang) * L.rad, oy = cy + Math.sin(L.ang) * L.rad * 0.62 + Math.sin(G.t * 0.9 + L.ph) * 0.01;
        if (L.fly < 1) { L.fly = Math.min(1, L.fly + dt / 1.5); const e = 1 - Math.pow(1 - L.fly, 3); L.s.position.set(L.fx + (ox - L.fx) * e, L.fy + (oy - L.fy) * e + Math.sin(e * Math.PI) * 0.06, 0.06); }
        else L.s.position.set(ox, oy, 0.06);
        const tw = 0.7 + Math.sin(G.t * 2.2 + L.ph) * 0.3; L.a = Math.min(1, L.a + dt * 0.6); L.s.material.opacity = L.a * tw * (G.over ? 0.6 : 0.9); });
      // play queued notes (the community singing)
      for (let i = G.queue.length - 1; i >= 0; i--) { const q = G.queue[i]; if (G.t >= q.at) { G.queue.splice(i, 1);
        if (q.all) { const P = G.ppl[q.n]; P.on = 1; P.dur = q.dur; G.ppl.forEach(p => p.on = Math.max(p.on, 0.5)); } else light(q.n, q.dur); } }
      // the finale: wait for the end line, then Ben reads his quote in his own voice, the band soft under him
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.6) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); } }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('curating-hope:memory', G.misses, 'lower');
        K.finale(G, { won: true, title: 'A memory we share', line: G.work && G.work.quote, best: r.isBest, say: 'A memory we share.',
          cells: [{ k: 'Notes', v: SONG.length }, { k: 'Sung again', v: G.misses }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        G.endT = 0;
      } return; }
      if (!G.playing) return;
      if (G.phase === 'cue' && G.t >= G.cueT && (!busy() || G.t > G.cueMax)) sing_();
      if (G.phase === 'listen' && !G.queue.length && G.t >= G.queueEnd) yourTurn();
      if (G.phase === 'wait') { G.waitT -= dt; if (G.waitT <= 0 && (!busy() || G.waitT < -6)) { const f = G.after; G.after = null; f && f(); } }
      if (G.phase === 'you') { G.idle += dt; if (G.idle > 9 && !busy()) again(); }   // stuck? the community sings it once more
      if (G.bot && G.phase === 'you' && G.t >= G.botAt) { G.botAt = G.t + 0.5; press(G.round === 1 && G.pos === 1 && !G.botMissed ? (G.botMissed = true, (SONG[G.pos] + 1) % 3) : SONG[G.pos]); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down' || G.phase !== 'you') return;
      // left to right picks the singer: use the painting if the touch lands on it, else the screen
      const p = G.S.toBoard(ev, G.root);
      const u = p && p.u >= 0 && p.u <= 1 ? p.u : ev.clientX / innerWidth;
      let best = 0, bd = 9; PEOPLE.forEach((q, i) => { const d = Math.abs(q.u - u); if (d < bd) { bd = d; best = i; } });   // (three wide zones: left, middle, right)
      press(best);
    },
    pause() { if (G) { G.paused = true; G.band.pause(); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.resume(); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'light-memory', playing: G.playing, over: G.over, phase: G.phase, round: G.round, len: G.len, pos: G.pos, misses: G.misses, leaves: G.leaves.length,
      light: +G.light.v.toFixed(2), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} }
      const b = G && G.bus; if (b) { b.gain.setTargetAtTime(0, b.context.currentTime, 0.05); setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 400); }
      K.cleanup(G); G = null;
    },
  };
}
export { sing as communityVoice, SONG, NOTES, PEOPLE };   // for testing the voices on their own
