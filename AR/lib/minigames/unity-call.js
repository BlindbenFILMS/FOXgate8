// EMBRACING UNITY (Shardasia Hadley): CALL AND ANSWER.
// "They're always there when I need them the most." The family has wandered off into the busy collage city: nine of
// them stand among the crowd as small dark silhouettes, and only Shardasia is in her place. She calls for one of them
// ("Where's Grandpa?") and that person answers "Here!" from where they are: you hear it from their side (higher voices
// for the little ones, deeper for the grown-ups) and a ring pulses around them. Tap them: they light up in full colour
// and walk back to their own place beside her, adding a note to the family's chord. Tap the wrong one and they say
// "Not me!". Find all nine and the family is whole again, back in the painting just as she painted them.
// Buttons: Call again (she calls, they answer again) and Hint (says which way to look). The answers repeat, and get
// easier to spot each time, so nobody gets stuck.
// Art: media/games/unity/ backdrop.jpg (the painting with the family taken out) and fig-*.png (each of them, cut out).
import * as THREE from 'three';
import * as K from './kit.js';

const ART = new URL('../../media/games/unity/', import.meta.url).href;
// the family, left to right: their box in the painting (u0, v0, u1, v1), what Shardasia calls them, how they sound
const FAM = [
  { id: 'grandpa', call: 'Grandpa', box: [0.0332, 0.5, 0.1406, 0.96], voice: 110, note: 48 },
  { id: 'red', call: 'my little sister in red', box: [0.0801, 0.7197, 0.1592, 0.9668], voice: 330, note: 55 },
  { id: 'floral', call: 'my sister in the blue flowers', box: [0.1455, 0.6094, 0.2412, 0.9736], voice: 270, note: 60 },
  { id: 'shardasia', call: 'Shardasia', box: [0.2422, 0.5928, 0.3389, 0.9746], voice: 230, note: 64, me: true },
  { id: 'little', call: 'the little one in red flowers', box: [0.3594, 0.7021, 0.4551, 0.9648], voice: 350, note: 67 },
  { id: 'dad', call: 'Dad', box: [0.4316, 0.3232, 0.6455, 0.9746], voice: 120, note: 43 },
  { id: 'brother', call: 'my brother', box: [0.5781, 0.6592, 0.6943, 0.9746], voice: 300, note: 71 },
  { id: 'sister', call: 'my sister in blue', box: [0.6943, 0.6543, 0.793, 0.9688], voice: 290, note: 74 },
  { id: 'baby', call: 'my baby sister', box: [0.8154, 0.7334, 0.8975, 0.958], voice: 380, note: 76 },
  { id: 'mom', call: 'Mom', box: [0.8438, 0.4014, 0.9697, 0.9502], voice: 200, note: 52 },
];
// where they wander off to, among the crowd in the collage (centre u, v)
const SPOTS = [[0.1, 0.36], [0.3, 0.3], [0.52, 0.22], [0.7, 0.3], [0.9, 0.3], [0.18, 0.58], [0.42, 0.5], [0.63, 0.55], [0.84, 0.58]];
const AWAY = 0.62, HIT = 0.12, REPEAT = 3.6;   // how small they look in the crowd; how close a tap must be; seconds between answers
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

function bubbleTex(text) {
  return K.canvasTex(256, 128, (g) => {
    g.fillStyle = '#ffffff'; g.strokeStyle = '#111'; g.lineWidth = 6;
    g.beginPath(); g.roundRect(10, 10, 236, 84, 30); g.moveTo(110, 92); g.lineTo(128, 120); g.lineTo(146, 92); g.fill(); g.stroke();
    g.fillStyle = '#ffffff'; g.fillRect(112, 86, 32, 10);
    g.fillStyle = '#111'; g.font = '900 52px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 54);
  });
}

export function callAndAnswerGame() {
  let G = null;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);

  // a voice saying "Here!": a little two-syllable call, from their side, high for the children and low for the grown-ups
  function voice(p, text = 'here') {
    const ac = K.audio(); if (!ac) return;
    const t = ac.currentTime + 0.02, pan = ac.createStereoPanner ? ac.createStereoPanner() : null, out = ac.createGain();
    out.gain.value = 1; if (pan) { pan.pan.value = Math.max(-1, Math.min(1, (p.u - 0.5) * 2)); out.connect(pan).connect(ac.destination); } else out.connect(ac.destination);
    const f0 = p.voice, sylls = text === 'here' ? [[0, 0.26, 1.0, 1.25], [0.32, 0.36, 1.2, 0.95]] : [[0, 0.18, 1.0, 0.9], [0.22, 0.28, 0.9, 0.8]];
    for (const [at, dur, a, b] of sylls) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0 * a, t + at); o.frequency.exponentialRampToValueAtTime(f0 * b, t + at + dur);
      g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(0.16, t + at + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
      for (const [fq, q, v] of text === 'here' ? [[700, 6, 1], [2300, 8, 0.6]] : [[500, 6, 1], [1000, 8, 0.6]]) {   // two formants make it sound like a voice
        const bp = ac.createBiquadFilter(), bg = ac.createGain(); bp.type = 'bandpass'; bp.frequency.value = fq * (f0 > 250 ? 1.15 : 1); bp.Q.value = q; bg.gain.value = v; o.connect(bp).connect(bg).connect(g); }
      g.connect(out); o.start(t + at); o.stop(t + at + dur + 0.05);
    }
  }
  function say(text, bubble, p) { p.bub.material.map = bubble; p.bub.material.needsUpdate = true; p.bubT = 1.4; }

  function hud() {
    const n = G.fam.filter(p => !p.me).length, found = G.fam.filter(p => !p.me && p.home).length;
    G.ui.panel('Call and answer', `${found}<small>of ${n} found</small>`, { segs: [found, n], sub: G.target ? 'Listen for who answers “Here!”, then tap them' : found === n ? 'Together again' : 'Shardasia is calling…' });
  }
  function nextCall() {
    const left = G.fam.filter(p => !p.me && !p.home && !p.walking);
    if (!left.length) return;
    G.target = left[Math.floor(Math.random() * left.length)]; G.tries = 0;
    G.answerT = 1.7;
    G.say(`Where's ${G.target.call}?`); G.me.bubT = 1.6; G.me.bub.material.map = G.bubWhere; G.me.bub.material.needsUpdate = true;
    hud();
  }
  function answer() {
    const p = G.target; if (!p) return;
    G.tries++; voice(p, 'here'); say('Here!', G.bubHere, p); p.ring = 1;
    if (G.tries >= 3) p.reveal = Math.min(1, p.reveal + 0.35);   // after a couple of answers they start to stand out
  }
  function found(p) {
    G.target = null; p.walking = true; p.walkT = 0; p.reveal = 1;
    G.buzz([30, 40, 70]); K.sfx.good((p.u - 0.5) * 1.6, G.foundN++);
    K.chord(G.fam.filter(q => q.home || q === p).map(q => midi(q.note)), 1.6, { vol: 0.03, type: 'triangle', spread: 0.04 });
    const [x, y] = G.S.P(p.u, p.v); G.fx.add(x, y, '#ffe6a0', 22, 0.3);
    G.ui.pop(p.call.replace(/^my |^the /, '').toUpperCase() + '!');
    const left = G.fam.filter(q => !q.me && !q.home && q !== p && !q.walking).length;
    G.say(left ? `You found ${p.call.replace(/^my /, 'her ')}. ${left} more.` : `You found ${p.call.replace(/^my /, 'her ')}. The whole family is together!`);
    G.waitT = left ? 2.6 : -1;
    hud();
  }
  function tapAt(u, v) {
    if (!G.playing || G.over) return;
    const hidden = G.fam.filter(p => !p.me && !p.home && !p.walking).map(p => ({ p, d: dist(p, { u, v }) })).sort((a, b) => a.d - b.d)[0];
    if (!hidden || hidden.d > HIT) return;
    if (hidden.p === G.target) found(hidden.p);
    else { voice(hidden.p, 'not'); say('Not me!', G.bubNot, hidden.p); G.buzz(20); }
  }
  function hint() {
    const p = G.target; if (!p) return;
    const h = p.u < 0.38 ? 'on the left' : p.u > 0.62 ? 'on the right' : 'in the middle', v = p.v < 0.4 ? 'up high' : 'lower down';
    G.ui.alert('Listen ' + h, (p.v < 0.4 ? 'Up high' : 'Lower down') + ', in the crowd', 1.8, 'blue'); G.say(`${p.call.replace(/^my /, 'Her ')} is ${h}, ${v}.`);
    p.reveal = Math.min(1, p.reveal + 0.5); answer();
  }

  return {
    title: 'Call and answer',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { target: null, tries: 0, answerT: -1, waitT: -1, foundN: 0, endT: -1, t0: 0, botT: 0 });
      // the painting with the family taken out
      G.bg = K.plane(null, 1.002, G.h + 0.002, { order: 11, opacity: 0 }); G.bg.position.z = 0.03; G.root.add(G.bg);
      new THREE.TextureLoader().load(ART + 'backdrop.jpg', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.bg.material.map = t; G.bg.material.needsUpdate = true; G.ready = true; });
      G.bubHere = bubbleTex('Here!'); G.bubNot = bubbleTex('Not me!'); G.bubWhere = bubbleTex('Where?');
      const spots = SPOTS.slice().sort(() => Math.random() - 0.5);
      let si = 0;
      G.fam = FAM.map(F => {
        const w = F.box[2] - F.box[0], hh = (F.box[3] - F.box[1]) * G.h, home = { u: (F.box[0] + F.box[2]) / 2, v: (F.box[1] + F.box[3]) / 2 };
        const m = K.plane(null, w, hh, { order: 14, opacity: 0 }); m.position.z = 0.04; G.root.add(m);
        new THREE.TextureLoader().load(ART + 'fig-' + F.id + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; m.material.map = t; m.material.needsUpdate = true; });
        const away = F.me ? home : { u: spots[si][0], v: spots[si++][1] };
        const bub = K.sprite(G.bubHere, 0.12, { order: 25, opacity: 0 }); bub.scale.set(0.2, 0.1, 1); bub.position.z = 0.07; G.root.add(bub);
        return { ...F, m, bub, w, hh, homeAt: home, away, u: away.u, v: away.v, home: !!F.me, me: !!F.me, walking: false, walkT: 0, ring: 0, reveal: 0, bubT: 0, ph: Math.random() * 6 };
      });
      G.me = G.fam.find(p => p.me);
      G.ui.buttons([
        { label: 'Call again', icon: '📣', kind: 'red', aria: 'Shardasia calls again', press: () => { if (G.target) { G.say(`Where's ${G.target.call}?`); G.answerT = 1.4; } } },
        { label: 'Hint', icon: '?', kind: 'black', aria: 'Hint: which way to look', press: () => hint() },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.waitT = 0.6; };
      K.intro(G, { title: 'Call and answer', how: 'Shardasia’s family has wandered off into the busy city. She calls for each of them: listen for who answers “Here!”, and tap them to bring them back to her.',
        say: 'Call and answer. Shardasia is the oldest of six, in a family that is always there for her. But they have wandered off into the busy city. Shardasia calls for each of them. Listen for who answers, here!, from their side, and tap them to bring them back to her.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const A = G.ready && !G.over ? 1 : 0;
      G.bg.material.opacity += (A - G.bg.material.opacity) * Math.min(1, dt * 2);
      if (G.waitT > 0) { G.waitT -= dt; if (G.waitT <= 0) nextCall(); }
      if (G.target && G.answerT > 0) { G.answerT -= dt; if (G.answerT <= 0) { answer(); G.answerT = REPEAT; } }
      if (G.bot && G.target && G.tries >= 1) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.9; tapAt(G.target.u, G.target.v); } }
      // the family: small dark silhouettes in the crowd until found, then full colour, walking home with a little bounce
      for (const p of G.fam) {
        let u = p.u, v = p.v, sc = AWAY, dark = 1 - p.reveal * 0.6, hop = 0;
        if (p.home) { u = p.homeAt.u; v = p.homeAt.v; sc = 1; dark = 0; }
        else if (p.walking) {
          p.walkT += dt / 1.5; const k = Math.min(1, p.walkT), e = k * k * (3 - 2 * k);
          u = p.away.u + (p.homeAt.u - p.away.u) * e; v = p.away.v + (p.homeAt.v - p.away.v) * e; sc = AWAY + (1 - AWAY) * e; dark = 0; hop = Math.abs(Math.sin(k * Math.PI * 4)) * 0.012 * (1 - k);
          if (k >= 1) { p.walking = false; p.home = true; if (G.fam.every(q => q.home)) { G.endT = 0; G.buzz([60, 60, 160]); K.chord(G.fam.map(q => midi(q.note)), 3, { vol: 0.035, type: 'triangle', spread: 0.06 }); G.ui.alert('Together again', 'The whole family', 3, 'red'); } }
        } else { u += Math.sin(G.t * 0.6 + p.ph) * 0.006; hop = Math.abs(Math.sin(G.t * 2.2 + p.ph)) * 0.003; }   // milling about in the crowd
        const [x, y] = G.S.P(u, v); p.m.position.set(x, y + hop, 0.04); p.m.scale.setScalar(sc);
        const c = 1 - dark * 0.85; p.m.material.color.setRGB(c, c, c * (1 + dark * 0.1));
        p.m.material.opacity = (G.bg.material.opacity) * (p.home || p.walking ? 1 : 0.9);
        p.ring = Math.max(0, p.ring - dt * 0.8);
        p.bubT = Math.max(0, p.bubT - dt);
        const top = G.S.P(u, v - (p.box[3] - p.box[1]) * sc / 2 - 0.04);
        p.bub.position.set(top[0], top[1], 0.07); p.bub.material.opacity = Math.min(1, p.bubT * 3);
        p._rx = x; p._ry = y; p._rr = 1 - p.ring;
      }
      // the answer rings: a pulse spreading out from whoever just answered
      G.rings = G.rings || G.fam.map(p => { const r = K.sprite(K.ringTex, 0.1, { color: '#fff3b0', opacity: 0, order: 15 }); r.position.z = 0.045; G.root.add(r); return r; });
      G.fam.forEach((p, i) => { const r = G.rings[i]; r.position.set(p._rx, p._ry, 0.045); r.scale.setScalar(0.06 + p._rr * 0.16); r.material.opacity = p.ring * 0.9 * (p.home ? 0 : 1); });
      if (G.endT >= 0) { G.endT += dt;
        if (G.endT > 3.2 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('embracing-unity:call', t, 'lower');
          K.finale(G, { won: true, title: 'Together again', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Found', v: `${G.fam.length - 1}/${G.fam.length - 1}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const p = G.S.toBoard(ev, G.root); if (p) tapAt(p.u, p.v);
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'call-answer', playing: G.playing, over: G.over, target: G.target && G.target.id, tries: G.tries, found: G.fam.filter(p => !p.me && p.home).length, t: +G.t.toFixed(1) }; },
    stop() { K.cleanup(G); G = null; },
  };
}
