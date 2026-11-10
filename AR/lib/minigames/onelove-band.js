// ONE LOVE (Anthony Ferraro): THE ONE LOVE BIRD BAND, a Simon Says game.
// "I just want to help other people… How can I reach more?" The seven red letters of ONE LOVE have gone dark.
// Along the bottom of the painting, the three ink birds have formed a band, each standing on its own drum:
//   left, the red bird plays the DRUM (a deep boom) · middle, the gold bird plays the GUITAR (a reggae skank chord)
//   · right, the green bird plays the HORN (a high, bright note).
// The band plays a little tune, bird by bird, each one jumping up and landing on its drum as it plays. Then it's your
// turn: tap the birds back in the same order (or press Drum, Guitar, Horn, or tap the left, middle or right of the
// screen). Get the tune right and the next letter of ONE LOVE lights up above, and a new instrument joins the groove
// underneath (bass, skank guitar, organ, melodica, horns, drums, choir). Tunes grow from 2 notes to 5.
// Light all seven: ONE LOVE bounces to the full band, the birds play together, and Anthony's own words play at the end.
// Accessible: each bird has its own sound, its own pitch and its own side (left, middle, right); "Listen." and
// "Your turn." are spoken in Ben's voice (first rounds) and a soft cue plays every time; a wrong note replays the tune.
// Shares the painting shader, the letters and the groove with the first One Love game (onelove-light.js, &classic=1).
import * as THREE from 'three';
import * as K from './kit.js';
import { birdTex, heartTexC, noteTex, burstTex } from './onelove-things.js';
import { PAL, ART, CLIP, LETTERS, BAND, BEAT, BAR, VERT, FRAG, band, midi } from './onelove-light.js';

// the three band members, standing on their drums along the bottom of the painting (u, v of the drum's centre)
const BIRDS = [
  { name: 'Drum', color: '#e8203a', dark: '#8f1020', u: 0.2, v: 0.885, pan: -0.75, face: 1 },
  { name: 'Guitar', color: '#ffc21a', dark: '#a8780a', u: 0.5, v: 0.905, pan: 0, face: 1 },
  { name: 'Horn', color: '#25b862', dark: '#0f6e37', u: 0.8, v: 0.885, pan: 0.75, face: -1 },
];
const LEN = [2, 3, 3, 4, 4, 5, 5];        // notes in each tune, one tune per letter
const DRUM_W = 0.19, DRUM_H = 0.12, BIRD = 0.17;
const GAP = BEAT * 0.75;                   // time between the band's notes
const SPEAK_ROUNDS = 3;                    // "Listen." / "Your turn." are spoken for the first few tunes (a soft cue always plays)

// a drum, side view: a coloured shell with a zigzag rope, rims, and a white head on top
function drumTex(color, dark) {
  return K.canvasTex(256, 200, (g, W, H) => {
    const top = 46, bot = H - 14, rx = W / 2 - 14, ry = 30, cx = W / 2;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx, bot + 4, rx * 0.95, ry * 0.5, 0, 0, Math.PI * 2); g.fill();
    const sh = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
    sh.addColorStop(0, dark); sh.addColorStop(0.3, color); sh.addColorStop(0.55, color); sh.addColorStop(1, dark);
    g.fillStyle = sh; g.beginPath(); g.moveTo(cx - rx, top); g.lineTo(cx - rx, bot); g.ellipse(cx, bot, rx, ry * 0.6, 0, Math.PI, 0, true); g.lineTo(cx + rx, top); g.closePath(); g.fill();
    g.strokeStyle = '#f6efe0'; g.lineWidth = 4;   // the rope
    g.beginPath(); for (let i = 0; i <= 8; i++) { const x = cx - rx + 10 + (2 * rx - 20) * i / 8, y = i % 2 ? bot - 14 : top + 16; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.fillStyle = '#1b1a18'; for (const y of [top + 4, bot - 6]) { g.fillRect(cx - rx, y - 5, 2 * rx, 9); }   // rims
    g.fillStyle = '#f7f2e6'; g.beginPath(); g.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2); g.fill();     // the head
    g.strokeStyle = '#1b1a18'; g.lineWidth = 6; g.stroke();
    g.fillStyle = 'rgba(0,0,0,.06)'; g.beginPath(); g.ellipse(cx, top + 4, rx * 0.7, ry * 0.55, 0, 0, Math.PI * 2); g.fill();
  });
}

export function oneLoveBandGame() {
  let G = null;
  const now = () => { const ac = K.audio(); return ac ? ac.currentTime : G.t; };

  // each bird's instrument (low, middle, high: different sounds, pitches and sides)
  function play(i, when = 0) {
    const b = BIRDS[i], d = Math.max(0, when);
    if (i === 0) {          // DRUM: a deep, round boom with a pitched body
      K.tone(110, 0.45, { vol: 0.55, slide: 48, pan: b.pan, delay: d, attack: 0.003 });
      K.tone(midi(48), 0.4, { type: 'triangle', vol: 0.22, pan: b.pan, delay: d });
      K.noise(0.05, { freq: 1500, q: 2, vol: 0.18, pan: b.pan, delay: d });
    } else if (i === 1) {   // GUITAR: a bright reggae skank chord
      for (const m of [64, 67, 72]) K.tone(midi(m), 0.22, { type: 'square', vol: 0.05, pan: b.pan, delay: d, attack: 0.004 });
      K.tone(midi(76), 0.3, { type: 'triangle', vol: 0.12, pan: b.pan, delay: d });
      K.noise(0.04, { freq: 3200, q: 1.5, vol: 0.08, pan: b.pan, delay: d });
    } else {                // HORN: a high, bright note that swells and falls
      K.tone(midi(79), 0.42, { type: 'sawtooth', vol: 0.07, pan: b.pan, delay: d, attack: 0.03 });
      K.tone(midi(91), 0.36, { type: 'sine', vol: 0.06, pan: b.pan, delay: d, attack: 0.03 });
      K.tone(midi(79) * 1.005, 0.42, { type: 'triangle', vol: 0.09, pan: b.pan, delay: d, attack: 0.02 });
    }
  }
  // a bird plays: its sound, and it jumps up and lands on its drum
  function hitBird(i, fromPlayer) {
    play(i);
    const b = G.birds[i]; b.jump = 0; b.flash = 1;
    const [x, y] = G.S.P(b.u, b.v - DRUM_H * 0.5); floaty(x, y + 0.02, BIRDS[i].color, true);
    if (fromPlayer) G.buzz(18);
  }
  const yourTurnCue = () => { K.tone(midi(84), 0.12, { vol: 0.08 }); K.tone(midi(88), 0.16, { vol: 0.08, delay: 0.1 }); };

  function hud() {
    const n = G.lit, sub = G.phase === 'party' ? 'One Love!' : G.step === 'listen' ? 'Listen to the band…' : G.step === 'turn' ? `Your turn: ${G.got} of ${G.seq.length}` : 'Play the tune back';
    G.ui.panel('One Love bird band', `${n}<small>of 7 lit</small>`, { segs: [n, 7], sub });
  }
  function newTune(r) {
    const s = [];
    for (let k = 0; k < LEN[r]; k++) { let n; do { n = Math.floor(Math.random() * 3); } while (k >= 2 && n === s[k - 1] && n === s[k - 2]); s.push(n); }
    if (new Set(s).size === 1) s[s.length - 1] = (s[0] + 1) % 3;   // never the same bird every time
    return s;
  }
  // the band plays the tune (starting just after the next beat of the groove)
  function playTune(delay = 0.5) {
    G.step = 'listen'; G.got = 0; G.idle = 0;
    if (G.round < SPEAK_ROUNDS || G.replays) G.say(G.replays ? 'Listen again.' : 'Listen.');
    const gap = GAP * (G.missRound >= 2 ? 1.3 : 1), t0 = now() + delay + (G.round < SPEAK_ROUNDS || G.replays ? 0.7 : 0);
    G.queue = G.seq.map((n, k) => ({ n, t: t0 + k * gap }));
    G.turnAt = t0 + G.seq.length * gap + 0.15;
    G.band.fade(0.4, 0.4);
    hud();
  }
  function startRound() {
    G.seq = newTune(G.round); G.missRound = 0; G.replays = 0; playTune();
  }
  function press(i) {
    if (!G || !G.playing || G.over || G.phase !== 'play') return;
    if (G.step !== 'turn') { hitBird(i, true); if (G.step === 'listen') pop('Listen first…'); return; }   // the bird still plays, just for fun
    G.taps++; G.idle = 0;
    if (i === G.seq[G.got]) {
      hitBird(i, true); G.got++; hud();
      if (G.got >= G.seq.length) lightLetter();
    } else {
      G.miss++; G.missRound++; G.replays++; G.step = 'wait';
      play(i); K.tone(170, 0.3, { type: 'triangle', vol: 0.18, slide: 110 }); G.buzz([30, 40, 30]);
      G.birds[i].shake = 1; pop('Oops! Listen again');
      setTimeout(() => { if (G && G.phase === 'play') playTune(0.3); }, 900);
    }
  }
  function lightLetter() {
    const i = G.round, L = LETTERS[i];
    G.step = 'good'; G.lit++; G.litT[i] = 0; if (G.missRound === 0) G.clean++;
    G.band.layers = G.lit; G.band.light(now(), i, ((L.box[0] + L.box[2]) / 2 - 0.5) * 1.7); G.band.fade(0.85, 0.3); G.buzz([40, 30, 90]);
    const [x, y] = G.S.P((L.box[0] + L.box[2]) / 2, (L.box[1] + L.box[3]) / 2);
    G.fx.add(x, y, PAL[i], 30, 0.36); G.fx.add(x, y, '#fff3c0', 12, 0.25);
    const b = K.sprite(burstTex(), 0.05, { order: 31, additive: true }); b.position.set(x, y, 0.065); G.root.add(b); G.bursts.push({ s: b, t: 0 });
    for (let k = 0; k < 5; k++) floaty(x, y, k % 2 ? PAL[i] : PAL[(i + 2 + k) % 7], false);
    for (let k = 0; k < 3; k++) floaty(x, y, PAL[(i + k) % 7], true);
    G.ui.alert(L.ch + ' is lit!', BAND[i] + ' joins the band', 1.8, 'red');
    G.say(L.say);
    G.round++;
    if (G.lit >= 7) { G.phase = 'party'; G.partyT = 0; G.band.party = true; hud(); return; }
    setTimeout(() => { if (G && G.phase === 'play') startRound(); }, 2600);
    hud();
  }
  function help() {
    if (!G || !G.playing || G.over || G.phase !== 'play' || G.step === 'listen') return;
    G.replays++; G.ui.alert('Listen, then copy', 'Tap the birds in the same order: Drum, Guitar, Horn', 2.4, 'black'); playTune(0.4);
  }
  function pop(text) {
    let y = innerHeight * 0.5;
    try { const [x0, y0] = G.S.P(0.5, 0.55), v = new THREE.Vector3(x0, y0, 0.05); G.root.localToWorld(v); v.project(G.camera); const r = G.renderer.domElement.getBoundingClientRect(); y = r.top + (1 - v.y) / 2 * r.height; } catch (e) {}
    G.ui.pop(text, innerWidth / 2, y);
  }
  function floaty(x, y, color, note) {
    const s = K.sprite(note ? noteTex(color) : heartTexC(color), (note ? 0.058 : 0.046) + Math.random() * 0.02, { order: 32 }); s.position.set(x, y, 0.07); G.root.add(s);
    G.hearts.push({ s, vx: (Math.random() - 0.5) * 0.5, vy: 0.25 + Math.random() * 0.35, t: 0, life: 1.4 + Math.random() * 0.6, rot: note ? (Math.random() - 0.5) : (Math.random() - 0.5) * 3, ph: Math.random() * 6, wob: note });
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('one-love:band', G.clean, 'higher');
    K.finale(G, { won: true, kicker: 'The band played it all', title: 'One Love', line: G.work && G.work.quote, best: r.isBest && G.clean > 0, say: 'You lit up One Love.',
      cells: [{ k: 'Lit', v: '7/7' }, { k: 'First try', v: `${G.clean}/7` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.band.fade(0.35, 2); G.overT = 0;
  }

  return {
    title: 'The One Love bird band',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', step: 'wait', lit: 0, round: 0, seq: [], got: 0, queue: [], turnAt: 0, idle: 0, miss: 0, missRound: 0, replays: 0, clean: 0, taps: 0,
        hearts: [], bursts: [], litT: LETTERS.map(() => -1), color: 0, t0: 0, partyT: 0, barStarts: [], partyBeat: -1 });
      G.band = band(K.audio()); G.band.onBar = (bar, t) => { G.barStarts.push(t); if (G.barStarts.length > 8) G.barStarts.shift(); }; G.band.cue = null;
      try { G.voice = new Audio((ctx.work && ctx.work.statementAudio) || CLIP); G.voice.preload = 'auto'; } catch (e) { G.voice = null; }
      // the painting, alive (the same shader as the first One Love game)
      G.uni = { map: { value: null }, clean: { value: null }, info: { value: null },
        uBox: { value: LETTERS.map(L => new THREE.Vector4(...L.box)) }, uLit: { value: LETTERS.map(() => 0) }, uScale: { value: LETTERS.map(() => 1) },
        uT: { value: 0 }, uA: { value: 0 }, uWarm: { value: 0 }, uParty: { value: 0 }, uBeat: { value: 0 }, uHue: { value: PAL.map(c => new THREE.Color(c)) },
        uColor: { value: 0 }, uFill: { value: 0 }, uFillOn: { value: 0 }, uTarget: { value: -1 }, uFlash: { value: 0 }, uGlow: { value: 0.6 }, uSway: { value: 1 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const Ld = new THREE.TextureLoader(); let need = 3; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => Ld.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      raw((ctx.work && ctx.work.image) || ART + 'clean.jpg', 'map'); raw(ART + 'clean.jpg', 'clean'); raw(ART + 'info.png', 'info');
      // the band: three drums, a bird standing on each
      G.birds = BIRDS.map((B, i) => {
        const drum = K.sprite(drumTex(B.color, B.dark), DRUM_W, { order: 28 }); drum.scale.set(DRUM_W, DRUM_W * 200 / 256, 1); G.root.add(drum);
        const s = K.sprite(birdTex('perch'), BIRD, { order: 30 }); G.root.add(s);
        const ring = K.sprite(K.glowTex, DRUM_W * 1.3, { order: 27, additive: true, color: B.color, opacity: 0 }); G.root.add(ring);
        return { drum, s, ring, u: B.u, v: B.v, jump: 9, flash: 0, shake: 0, ph: i * 1.3 };
      });
      // buttons in each bird's colour
      G.css = document.createElement('style');
      G.css.textContent = BIRDS.map((B, i) => `.mgk-btns button.lb${i}{background:${B.color}!important;color:${i === 1 ? '#000' : '#fff'}!important}`).join('');
      document.head.appendChild(G.css);
      G.ui.buttons([
        ...BIRDS.map((B, i) => ({ label: B.name, kind: 'lb' + i, aria: `The ${['red', 'gold', 'green'][i]} bird: ${B.name}, on the ${['left', 'middle', 'right'][i]}`, press: () => press(i) })),
        { label: '?', kind: 'black', aria: 'Help: hear the tune again', press: () => help() },
      ]);
      hud();
      G.onGo = () => { G.phase = 'play'; G.t0 = G.t; G.band.start(); G.band.fade(0.6, 0.5); setTimeout(() => { if (G && G.phase === 'play') startRound(); }, 900); };
      K.intro(G, { title: 'The One Love bird band', how: 'The birds play a tune. Tap them back in the same order (Drum, Guitar, Horn) to light up each letter of ONE LOVE.',
        say: 'Light up One Love. Listen, then sing it back by tapping them in the same order.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni, t = now();
      u.uT.value = G.t; u.uA.value += ((G.over && G.overT > 4 ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the band plays its tune, note by note; then it's your turn
      while (G.queue.length && t >= G.queue[0].t) hitBird(G.queue.shift().n, false);
      if (G.step === 'listen' && !G.queue.length && t >= G.turnAt) {
        G.step = 'turn'; yourTurnCue(); if (G.round < SPEAK_ROUNDS || G.replays) G.say('Your turn.'); hud();
      }
      if (G.step === 'turn') { G.idle += dt; if (G.idle > 9) { G.replays++; playTune(0.3); } }
      // the beat (for the bounce of lit letters and the birds' bob)
      const bs = G.barStarts.filter(x => x <= t).pop(), beatPos = bs !== undefined ? (t - bs) / BEAT : 0, beatFrac = beatPos % 1;
      const bounce = bs !== undefined ? Math.exp(-beatFrac * 6) * (Math.floor(beatPos) === 2 ? 0.12 : 0.05) : 0;
      LETTERS.forEach((L, i) => {
        if (G.litT[i] >= 0) { G.litT[i] += dt; u.uLit.value[i] = Math.min(1, G.litT[i] / 0.35); u.uScale.value[i] = 1 + bounce * (G.phase === 'party' ? 1.6 : 1) + Math.max(0, 0.3 - G.litT[i]) * 0.9; }
        else u.uScale.value[i] = 1;
      });
      u.uGlow.value = 0.6 + bounce * 4;
      const warmTo = G.phase === 'party' || G.over ? 1 : G.lit / 7;
      u.uWarm.value += (warmTo - u.uWarm.value) * Math.min(1, dt * 1.5);
      u.uParty.value += ((G.phase === 'party' || G.over ? 1 : 0) - u.uParty.value) * Math.min(1, dt * 1.2);
      u.uBeat.value = bs !== undefined && Math.floor(beatPos) === 2 && G.lit > 0 ? Math.exp(-beatFrac * 5) : 0;
      const want = G.phase === 'party' || G.over ? 1 : G.lit / 7 * 0.6;
      G.color += (want - G.color) * Math.min(1, dt * 1.2); u.uColor.value = G.color;
      // the party: the whole band plays along on the beat, hearts and notes rise
      if (G.phase === 'party') {
        G.partyT += dt;
        if (bs !== undefined && Math.floor(beatPos) !== G.partyBeat) { G.partyBeat = Math.floor(beatPos); hitBird([0, 1, 2, 1][G.partyBeat % 4], false);
          const L = LETTERS[Math.floor(Math.random() * 7)], [x, y] = G.S.P((L.box[0] + L.box[2]) / 2, L.box[1]); floaty(x, y, PAL[Math.floor(Math.random() * 7)], Math.random() < 0.5); }
        if (G.partyT > BAR * 2.5) finish();
      }
      // the birds and their drums
      const vis = G.face.visible ? 1 : 0, turn = G.step === 'turn' && G.phase === 'play';
      G.birds.forEach((b, i) => {
        const B = BIRDS[i]; b.jump += dt; b.flash = Math.max(0, b.flash - dt * 3); b.shake = Math.max(0, b.shake - dt * 2.5);
        const k = Math.min(1, b.jump / 0.42), hop = b.jump < 0.42 ? Math.sin(k * Math.PI) * 0.055 : 0;
        const land = b.jump < 0.55 && b.jump > 0.3 ? Math.sin((b.jump - 0.3) / 0.25 * Math.PI) : 0;          // the drum squashes as the bird lands
        const bob = bs !== undefined ? Math.exp(-beatFrac * 5) * 0.004 : 0;
        const [dx, dy] = G.S.P(b.u, b.v); b.drum.position.set(dx, dy, 0.055);
        b.drum.scale.set(DRUM_W * (1 + land * 0.06), DRUM_W * 200 / 256 * (1 - land * 0.08), 1); b.drum.material.opacity = vis;
        b.ring.position.set(dx, dy + DRUM_H * 0.25, 0.054); b.ring.material.opacity = vis * (b.flash * 0.9 + (turn ? 0.18 + 0.1 * Math.sin(G.t * 4 + i) : 0));
        const pose = b.jump < 0.16 ? 'up' : b.jump < 0.3 ? 'down' : b.jump < 0.6 ? 'sing' : 'perch';
        b.s.material.map = birdTex(pose);
        const sx = b.shake ? Math.sin(G.t * 40) * 0.006 * b.shake : 0;
        b.s.position.set(dx + sx, dy + DRUM_H * 0.62 + BIRD * 0.28 + hop + bob - land * 0.006, 0.06);
        b.s.scale.set(BIRD * B.face, BIRD, 1); b.s.material.opacity = vis;
      });
      // hearts, notes and bursts
      for (let i = G.hearts.length - 1; i >= 0; i--) { const h = G.hearts[i]; h.t += dt; h.vy -= dt * 0.18;
        h.s.position.x += h.vx * dt * 0.3 + (h.wob ? Math.sin(h.t * 5 + h.ph) * 0.0012 : 0); h.s.position.y += h.vy * dt * 0.3; h.s.material.rotation += h.rot * dt; h.s.material.opacity = Math.max(0, 1 - h.t / h.life);
        if (h.t > h.life) { G.root.remove(h.s); h.s.material.dispose(); G.hearts.splice(i, 1); } }
      for (let i = G.bursts.length - 1; i >= 0; i--) { const b = G.bursts[i]; b.t += dt / 0.9; const k = Math.min(1, b.t);
        b.s.scale.setScalar(0.05 + k * 0.4); b.s.material.rotation += dt * 1.2; b.s.material.opacity = 1 - k * k;
        if (k >= 1) { G.root.remove(b.s); b.s.material.dispose(); G.bursts.splice(i, 1); } }
      // the finale: Anthony in his own words, with the music dipped right down under him
      if (G.over) { G.overT += dt;
        if (G.overT > 2.2 && !G.clip) {
          G.band.fade(0.04, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.band.fade(0.22, 2); G.fadeAt = G.overT + 7; } };
          try { G.clip = G.voice || new Audio(CLIP); G.clip.currentTime = 0; G.clip.onended = back; G.clip.onerror = back; G.clip.play().catch(back); } catch (e) { G.clip = {}; back(); }
          G.clipSafety = G.overT + (G.clip.duration > 0 ? G.clip.duration : 22) + 0.8;
        }
        if (G.clip && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.band.fade(0.22, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.band.fade(0.0001, 3); } }
      // the robot: copies each tune (and gets the third one wrong once, to test the replay)
      if (G.bot && G.step === 'turn' && G.phase === 'play') {
        G.botT = (G.botT || 0) + dt;
        if (G.botT > 0.45) { G.botT = 0; const wrong = G.round === 2 && G.missRound === 0 && G.got === 1; press(wrong ? (G.seq[G.got] + 1) % 3 : G.seq[G.got]); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      // tap a bird (or its drum); anywhere else, the left, middle or right of the screen picks that bird
      const p = G.S.toBoard(ev, G.root);
      let i = -1;
      if (p && p.u > -0.05 && p.u < 1.05 && p.v > 0.68 && p.v < 1.08) i = p.u < 0.35 ? 0 : p.u > 0.65 ? 2 : 1;
      if (i < 0) i = G.S.screenThird(ev) + 1;
      press(i);
    },
    pause() { if (G) { G.paused = true; G.band.hold(); } },
    resume() { if (G) { G.paused = false; if (G.phase === 'play' || G.phase === 'party') G.band.resume(); if (G.step === 'listen' || G.step === 'turn') playTune(0.5); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'onelove-band', phase: G.phase, step: G.step, playing: G.playing, over: G.over, lit: G.lit, round: G.round, seq: G.seq.join(''), got: G.got, misses: G.miss, clean: G.clean, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.band.stop(); if (G.clip && G.clip.pause) G.clip.pause(); if (G.voice) try { G.voice.pause(); } catch (e) {} G.hearts.forEach(h => h.s.material.dispose()); G.bursts.forEach(b => b.s.material.dispose()); }
      if (G && G.css) G.css.remove();
      K.cleanup(G); G = null;
    },
  };
}
