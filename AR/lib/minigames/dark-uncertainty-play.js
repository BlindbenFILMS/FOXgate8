// THE DARK UNCERTAINTY (Bill McCann): NIGHT BUS, Bill plays his trumpet.
// The bus is moving: shapes of the city slide past the windows in the painting's own reds, browns and creams, and
// streetlights sweep through. It's your solo: a row of notes sits along the bottom of the painting, low on the left and
// high on the right. Tap one and Bill lifts his trumpet and plays it, the horn moving a little with every note (the bell
// rises for high notes); stop playing for a moment and he lowers it to his lap. Done ends with Bill himself, in his own voice.
// The trumpet sound is made live (brass synthesis with a little bus-sized echo). Real trumpet recordings can replace it:
// put them in media/games/dark-uncertainty/ and list them in REAL below.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = new URL('../../media/games/dark-uncertainty/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
// Bill McCann saying this painting's quote (the 3D gallery's clip for it), played as the game ends
const BILL = new URL('../../../3D/gallery/audio/art_41.mp3', import.meta.url).href;
const PIECE = { x0: 0.252, y0: 0.4619, x1: 0.5283, y1: 0.8486 };   // the trumpet and his hands, cut out
const MP = { u: 0.30, v: 0.48 };                                   // the mouthpiece end (the piece turns around this)
const LIPS = { u: 0.284, v: 0.318 }, TURN = 0.9;                   // where it goes to play, and how far it turns (radians)
const BELL = { u: 0.47, v: 0.79 };
const TUNES = [
  { name: 'Night bus blues', bpm: 92, notes: [[65, 1], [68, 0.5], [70, 0.5], [71, 0.5], [70, 0.5], [68, 1], [65, 1.5], [63, 0.5], [65, 2], [68, 0.5], [70, 0.5], [73, 1], [72, 0.5], [70, 0.5], [68, 1], [65, 2.5]] },
  { name: 'Window lights', bpm: 104, notes: [[70, 0.75], [72, 0.25], [74, 1], [77, 1], [74, 0.5], [72, 0.5], [70, 2], [67, 1], [70, 0.5], [72, 0.5], [70, 3]] },
  { name: 'Long way home', bpm: 72, notes: [[62, 1.5], [65, 0.5], [67, 1], [69, 1], [70, 2], [69, 0.5], [67, 0.5], [65, 1], [62, 3]] },
];
const SOLO = [63, 65, 66, 68, 70, 73, 75, 77];   // a blues scale, low to high
const NAMES = ['E♭', 'F', 'G♭', 'A♭', 'B♭', 'D♭', 'E♭', 'F'];
const PADS = { v: 0.93, u0: 0.065, u1: 0.935, d: 0.112 };   // the row of notes along the bottom of the painting
const REST = 3.2;   // seconds without a note before he lowers the trumpet
const REAL = null;   // e.g. { 65: 'trumpet-F4.mp3', ... }: recorded notes, if you add them

/* ── a trumpet: buzzy brass that brightens as it speaks, a little lip scoop, breath, vibrato, and the bus's echo ── */
function brass(ac) {
  const out = ac.createGain(); out.gain.value = 0.9; out.connect(ac.destination);
  const rv = ac.createConvolver(), rvg = ac.createGain(); rvg.gain.value = 0.22;
  const n = ac.sampleRate * 1.4, ir = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
  rv.buffer = ir; rv.connect(rvg).connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function note(t, m, dur, vel = 0.8) {
    const f = 440 * Math.pow(2, (m - 69) / 12), g = ac.createGain(), lp = ac.createBiquadFilter(), f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 1.2; lp.frequency.setValueAtTime(f * 1.5, t); lp.frequency.exponentialRampToValueAtTime(f * (5 + vel * 5), t + 0.06); lp.frequency.exponentialRampToValueAtTime(f * (3.5 + vel * 3), t + 0.25);
    f1.type = 'peaking'; f1.frequency.value = 1250; f1.Q.value = 1.6; f1.gain.value = 7;
    f2.type = 'peaking'; f2.frequency.value = 2800; f2.Q.value = 2; f2.gain.value = 4;
    const vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5.6; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(dur > 0.5 ? 13 : 4, t + Math.min(0.5, dur * 0.7)); vib.connect(vg);
    for (const [type, mul, v] of [['sawtooth', 1, 1], ['square', 1, 0.25], ['sawtooth', 2, 0.18]]) {
      const o = ac.createOscillator(), og = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f * mul * 0.982, t); o.frequency.exponentialRampToValueAtTime(f * mul, t + 0.06);   // the lip scoop up to pitch
      og.gain.value = v; vg.connect(o.detune); o.connect(og).connect(lp); o.start(t); o.stop(t + dur + 0.2);
    }
    const br = ac.createBufferSource(), bf = ac.createBiquadFilter(), bg = ac.createGain(); br.buffer = nb; bf.type = 'bandpass'; bf.frequency.value = 1800; bf.Q.value = 0.8;
    bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.05 * vel, t + 0.02); bg.gain.exponentialRampToValueAtTime(0.008, t + 0.15); bg.gain.setValueAtTime(0.008, t + dur); bg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    br.connect(bf).connect(bg).connect(out); br.start(t, Math.random() * 0.5); br.stop(t + dur + 0.15);
    const peak = 0.13 * vel;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak * 1.25, t + 0.035); g.gain.exponentialRampToValueAtTime(peak, t + 0.12);
    g.gain.setValueAtTime(peak * 0.9, t + Math.max(0.13, dur - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    lp.connect(f1).connect(f2).connect(g); g.connect(out); g.connect(rv);
    vib.start(t); vib.stop(t + dur + 0.2);
  }
  return { out, note };
}

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting (with the trumpet lifted out) and the city sliding past the windows
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uMove, uA, uH;
float rbox(vec2 p, vec2 a, vec2 b, float r){ vec2 c = (a + b) * 0.5, h = (b - a) * 0.5 - r; vec2 d = abs(p - c) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
float hash(float x){ return fract(sin(x * 127.1) * 43758.5453); }
// the city: far buildings, nearer trees, and lamp posts, each layer moving at its own speed
vec4 city(vec2 p, float t){
  float x = p.x * 3.0 + t;
  float bi = floor(x * 1.6), bh = 0.28 + hash(bi) * 0.32; float b = step(1.0 - bh, p.y) * step(0.12, fract(x * 1.6));
  float win = step(0.9, hash(floor(x * 6.0) + floor(p.y * 9.0) * 7.0)) * b * step(1.0 - bh + 0.08, p.y);
  float x2 = p.x * 3.0 + t * 1.8, ti = floor(x2 * 0.9), tr = length(vec2(fract(x2 * 0.9) - 0.5, (p.y - 0.62) * 1.6)) - (0.18 + hash(ti) * 0.14);
  float tree = (1.0 - smoothstep(-0.01, 0.01, tr)) * step(0.45, hash(ti + 3.0));
  float x3 = p.x * 3.0 + t * 3.2, pi = floor(x3 * 0.55), post = step(abs(fract(x3 * 0.55) - 0.5), 0.012) * step(0.18, p.y) * step(0.5, hash(pi + 9.0));
  float lamp = exp(-pow(length(vec2((fract(x3 * 0.55) - 0.5) * 3.0, p.y - 0.2)) / 0.06, 2.0)) * step(0.5, hash(pi + 9.0));
  vec3 col = vec3(0.0); float a = 0.0;
  col = mix(col, vec3(0.30, 0.07, 0.04), b * 0.55); a = max(a, b * 0.55);
  col = mix(col, vec3(1.0, 0.8, 0.5), win * 0.4); a = max(a, win * 0.22);
  col = mix(col, vec3(0.18, 0.05, 0.03), tree * 0.7); a = max(a, tree * 0.7);
  col = mix(col, vec3(0.12, 0.04, 0.03), post); a = max(a, post * 0.85);
  col += vec3(1.0, 0.9, 0.65) * lamp; a = max(a, lamp * 0.8);
  return vec4(col, a);
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec2 s = p + vec2(0.0, sin(uT * 7.3) * 0.0012 * uMove);   // the bus rumbles
  vec3 c = texture2D(map, vec2(s.x, 1.0 - s.y)).rgb;
  // inside the windows (rounded shapes, and only where the glass is red or cream)
  float w = 0.0; vec2 lo = vec2(0.0);
  float dA = rbox(p * vec2(1.0, uH), vec2(0.462, 0.125 * uH), vec2(0.585, 0.538 * uH), 0.02); if (dA < 0.0) { w = 1.0; lo = (p - vec2(0.462, 0.125)) / vec2(0.123, 0.413); }
  float dB = rbox(p * vec2(1.0, uH), vec2(0.633, 0.04 * uH), vec2(0.795, 0.575 * uH), 0.03); if (dB < 0.0) { w = 1.0; lo = (p - vec2(0.633, 0.04)) / vec2(0.162, 0.535); }
  float dC = rbox(p * vec2(1.0, uH), vec2(0.85, 0.0), vec2(1.02, 0.595 * uH), 0.03); if (dC < 0.0) { w = 1.0; lo = (p - vec2(0.85, 0.0)) / vec2(0.17, 0.595); }
  float glass = smoothstep(0.35, 0.5, c.r) * (1.0 - smoothstep(0.75, 0.95, c.g * (1.0 - c.r * 0.3)));
  if (w > 0.5) {
    vec4 k = city(vec2(lo.x * 0.6 + p.x, lo.y), uT * 0.35 * uMove);
    c = mix(c, c * 0.35 + k.rgb, k.a * glass * 0.85);
  }
  gl_FragColor = vec4(c, uA);
}`;

export function nightBusGame() {
  let G = null;

  function pose(k) {   // 0: resting in his lap, 1: at his lips
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [ax, ay] = G.S.P(MP.u, MP.v), [bx, by] = G.S.P(LIPS.u, LIPS.v);
    const bob = G.kick * 0.007 * e;   // a little push with each note
    G.piece.position.set(ax + (bx - ax) * e - bob * 0.5, ay + (by - ay) * e + bob, 0.05); G.piece.rotation.z = TURN * e + (G.tilt + G.kick * 0.045) * e;   // the bell rises for high notes
  }
  function bellXY() {   // where the bell is now (board coordinates)
    const [mx, my] = G.S.P(MP.u, MP.v), [bx, by] = G.S.P(BELL.u, BELL.v);
    const v = new THREE.Vector3(bx - mx, by - my, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), G.piece.rotation.z);
    return [G.piece.position.x + v.x, G.piece.position.y + v.y];
  }
  function noteFx(m) {
    const [x, y] = bellXY(), s = K.sprite(G.noteTex[Math.floor(Math.random() * 2)], 0.05 + Math.random() * 0.03, { color: ['#ffd9a0', '#ff9a5a', '#fff1d0'][m % 3], order: 30, opacity: 0.95 });
    s.position.set(x, y, 0.07); G.root.add(s); G.notes.push({ s, vx: 0.05 + Math.random() * 0.06, vy: 0.04 + Math.random() * 0.05, life: 1.6 });
    G.bellGlow = 1;
  }
  function hud() { G.ui.panel('Night bus', 'Your solo', { sub: 'Tap the notes on the painting: low on the left, high on the right' }); }
  // the notes on the painting
  function padTex(i) {
    return K.canvasTex(160, 160, (g) => {
      const c = [[150, 38, 22], [176, 52, 26], [196, 70, 32], [214, 96, 44], [228, 126, 62], [238, 156, 88], [244, 186, 120], [248, 214, 160]][i];
      const r = g.createRadialGradient(62, 56, 6, 80, 80, 74); r.addColorStop(0, `rgb(${c.map(v => Math.min(255, v + 60)).join(',')})`); r.addColorStop(1, `rgb(${c.join(',')})`);
      g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(84, 86, 70, 0, Math.PI * 2); g.fill();
      g.fillStyle = r; g.beginPath(); g.arc(80, 80, 68, 0, Math.PI * 2); g.fill(); g.lineWidth = 7; g.strokeStyle = '#1a0806'; g.stroke();
      g.fillStyle = i > 4 ? '#2a0c06' : '#fff4e0'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '900 64px Archivo, "Arial Black", Arial, sans-serif'; g.fillText(NAMES[i], 80, 84);
    });
  }
  function padU(i) { return PADS.u0 + (PADS.u1 - PADS.u0) * (i / (SOLO.length - 1)); }
  function playNote(i) {
    if (!G.playing || G.over) return;
    G.horn.note(K.audio().currentTime + 0.01, SOLO[i], 0.45, 0.85); G.soloNotes++; G.buzz(10);
    G.target = 1; G.last = G.t; G.kick = 1; G.tiltTo = (i / (SOLO.length - 1) - 0.5) * 0.16;
    const pd = G.pads[i]; pd.hit = 1; noteFx(SOLO[i]);
  }
  function buttons() { G.ui.buttons([{ label: 'Done', icon: '✓', aria: 'Finish', press: () => finish() }]); }
  function finish() {
    if (G.over) return; G.solo = false; G.target = 0; G.ui.buttons([]);
    for (const pd of G.pads) pd.s.visible = false;
    K.finale(G, { won: true, kicker: 'The bus rolls on', title: 'Bill played your solo', line: G.work && G.work.quote, cells: [{ k: 'Your notes', v: G.soloNotes }], say: 'The bus rolls on. Bill played your solo.' });
  }

  return {
    title: 'Night bus',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { k: 0, target: 0, notes: [], soloNotes: 0, bellGlow: 0, move: 0, kick: 0, tilt: 0, tiltTo: 0, last: -99, pads: [] });
      G.uni = { map: { value: null }, uT: { value: 0 }, uMove: { value: 0 }, uA: { value: 0 }, uH: { value: G.h } };
      G.bus = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.bus.position.z = 0.03; G.bus.renderOrder = 11; G.root.add(G.bus);
      new THREE.TextureLoader().load(ART + 'body.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.bodyOK = true; });
      // the trumpet and his hands: a cut-out piece that turns around the mouthpiece
      const pw = PIECE.x1 - PIECE.x0, ph = (PIECE.y1 - PIECE.y0) * G.h, lx = (MP.u - PIECE.x0) / pw, ly = (MP.v - PIECE.y0) / (PIECE.y1 - PIECE.y0);
      const geo = new THREE.PlaneGeometry(pw, ph); geo.translate(pw * (0.5 - lx), ph * (ly - 0.5), 0);
      G.piece = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); G.piece.renderOrder = 20; G.root.add(G.piece);
      new THREE.TextureLoader().load(ART + 'trumpet.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.piece.material.map = t; G.piece.material.needsUpdate = true; G.pieceOK = true; });
      pose(0);
      G.glow = K.sprite(K.glowTex, 0.16, { color: '#ffb066', additive: true, opacity: 0, order: 21 }); G.glow.position.z = 0.06; G.root.add(G.glow);
      G.noteTex = ['♪', '♫'].map(ch => K.canvasTex(96, 96, (g) => { g.font = '900 80px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(ch, 48, 52); }));
      G.horn = brass(K.audio());
      // the notes along the bottom of the painting
      for (let i = 0; i < SOLO.length; i++) { const s = K.sprite(padTex(i), PADS.d, { order: 26, opacity: 0 }), [x, y] = G.S.P(padU(i), PADS.v); s.position.set(x, y, 0.07); G.root.add(s); G.pads.push({ s, hit: 0 }); }
      // the bus engine: a low, soft rumble
      const ac = K.audio(); G.eng = ac.createOscillator(); G.engG = ac.createGain(); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140;
      G.eng.type = 'sawtooth'; G.eng.frequency.value = 42; G.engG.gain.value = 0; G.eng.connect(lp).connect(G.engG).connect(ac.destination); G.eng.start();
      hud();
      G.onGo = () => { buttons(); G.engG.gain.setTargetAtTime(0.05, K.audio().currentTime, 1); G.say('Your solo. Tap the notes along the bottom: low on the left, high on the right.'); };
      K.intro(G, { title: 'Night bus', how: 'Bill is riding the night bus with his trumpet. Play his solo: tap the notes along the bottom of the painting, low on the left, high on the right.',
        say: 'Night bus. Bill is riding the bus at night with his trumpet, and it’s your solo. Tap the notes along the bottom of the painting, low on the left and high on the right, and Bill plays them. Stop for a moment and he rests his trumpet.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const ready = G.bodyOK && G.pieceOK ? 1 : 0;
      G.uni.uA.value += ((G.over ? 0 : ready) - G.uni.uA.value) * Math.min(1, dt * 2); G.piece.material.opacity = G.uni.uA.value;
      G.move += ((G.over ? 0 : 1) - G.move) * Math.min(1, dt * 0.6); G.uni.uMove.value = G.move; G.uni.uT.value = G.t;
      // lifting the trumpet when you play, and resting it in his lap when you stop for a moment
      if (G.target === 1 && G.t - G.last > REST) G.target = 0;
      G.k += Math.sign(G.target - G.k) * Math.min(Math.abs(G.target - G.k), dt / (G.target > G.k ? 0.4 : 0.9));
      G.kick = Math.max(0, G.kick - dt * 5); G.tilt += (G.tiltTo - G.tilt) * Math.min(1, dt * 10); pose(G.k);
      // the notes on the painting: they fade in with it, and pop and glow when tapped
      for (let i = 0; i < G.pads.length; i++) { const pd = G.pads[i]; pd.hit = Math.max(0, pd.hit - dt * 4);
        const breathe = G.soloNotes === 0 && G.playing ? 0.06 * Math.sin(G.t * 3 - i * 0.5) : 0;   // a ripple along the row until the first note
        pd.s.scale.setScalar(PADS.d * (1 + pd.hit * 0.3 + breathe)); pd.s.material.opacity = G.uni.uA.value * (G.playing || G.over ? 1 : 0.5); }
      for (let i = G.notes.length - 1; i >= 0; i--) { const n = G.notes[i]; n.life -= dt; n.s.position.x += n.vx * dt; n.s.position.y += n.vy * dt + Math.sin(G.t * 4 + i) * 0.0006; n.s.material.opacity = Math.min(0.95, n.life);
        if (n.life <= 0) { G.root.remove(n.s); n.s.material.dispose(); G.notes.splice(i, 1); } }
      G.bellGlow = Math.max(0, G.bellGlow - dt * 2.5); const [gx, gy] = bellXY(); G.glow.position.set(gx, gy, 0.06); G.glow.material.opacity = G.bellGlow * 0.6 * G.k;
      // once the painting settles, Bill himself speaks
      if (G.over && !G.billAu) { G.overT = (G.overT || 0) + dt; if (G.overT > 2.4) { try { G.billAu = new Audio(BILL); G.billAu.play().catch(() => {}); } catch (e) {} } }
      if (G.bot && G.playing && !G.over) { G.botT = (G.botT || 0) + dt; if (G.botT > 0.5 && G.soloNotes < 8) { G.botT = 0; playNote([0, 2, 4, 3, 5, 7, 6, 4][G.soloNotes]); } else if (G.soloNotes >= 8 && G.k < 0.01) finish(); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      if (ev.clientY > innerHeight - 120) return;   // not on the buttons
      // the note under the finger: anywhere above or below a note plays it, so it's easy to find without looking
      const p = G.S.toBoard(ev, G.root), u = p ? p.u : ev.clientX / innerWidth;
      playNote(Math.max(0, Math.min(SOLO.length - 1, Math.round((u - PADS.u0) / (PADS.u1 - PADS.u0) * (SOLO.length - 1)))));
    },
    pause() { if (G) { G.paused = true; try { G.billAu && G.billAu.pause(); } catch (e) {} G.engG && G.engG.gain.setTargetAtTime(0, K.audio().currentTime, 0.1); } },
    resume() { if (G) { G.paused = false; G.engG && G.engG.gain.setTargetAtTime(0.05, K.audio().currentTime, 0.3); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'night-bus', playing: G.playing, over: G.over, lift: +G.k.toFixed(2), tilt: +G.tilt.toFixed(3), soloNotes: G.soloNotes, notes: G.notes.length }; },
    stop() { if (G) { try { G.eng.stop(); } catch (e) {} try { G.billAu && G.billAu.pause(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
export { brass as trumpetVoice, TUNES as busTunes };
