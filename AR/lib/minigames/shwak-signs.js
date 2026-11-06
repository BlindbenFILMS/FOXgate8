// WET FLOOR SIGNS, BEWARE! (Michael Tubiak): SHWAK!
// "I turned myself into a comic book superhero — the Tubiak Maniak. Humor is how I take the power back from the hard stuff."
// Wet floor signs sneak up on the Tubiak Maniak along the floor of the comic panel: on the LEFT, straight AHEAD or on
// the RIGHT. Each one squeaks and drips from its own side (left signs low, ahead in the middle, right signs high), and
// grows bigger as it creeps closer. Swing the cane that way (3 big buttons, or tap that third of the screen) before it
// gets you: a white swoosh, a giant comic word (SHWAK! THWACK! KA-POW!), the whole panel lunges, and the sign goes
// spinning off. Swing the wrong way and you whiff; let one reach you and SPLASH, he slips (and bounces right back up).
// 12 signs, faster and faster, with a comic superhero theme pumping. Then the boss: the GIANT WET FLOOR SIGN, with angry
// eyes and gritted teeth. It hops from side to side and stomps: find it by its stomping squeak and SHWAK it 5 times.
// The panel comes alive the whole time: his white cane is cut out of the panel (media/games/shwak/cane.png, with the panel
// painted in behind it: panel.jpg) and really swings to each side, his red cape flutters, his cane glints, and the panel
// punches toward every swing.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas, WORDS } from './shwak-things.js';

// Mike Tubiak in his own words (the 3D gallery's clip for this painting), played as the painting comes alive
const MIKE = new URL('../../../3D/gallery/audio/wing_4_2.mp3', import.meta.url).href;

// where signs stand on the floor of the panel (u, v of the 857 × 857 painting) for LEFT, AHEAD, RIGHT
const SPOT = [{ u: 0.19, v: 0.86 }, { u: 0.5, v: 0.84 }, { u: 0.81, v: 0.84 }];
const ART = new URL('../../media/games/shwak/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
const GRIP = { u: 0.13, v: 0.36 };                         // his fist on the cane (the glint)
// the cut-out cane, in pixels of the 857 × 857 painting: its picture's box, where his fist holds it, and its ball tip
const CANE = { W: 857, box: [86, 294, 744, 734], pivot: [104, 308], tip: [712, 702] };
const SIGNS = 12, BOSS_HP = 5;
const SIDE = ['left', 'ahead', 'right'];
const SAY_SIDE = ['Sign on the left!', 'Sign straight ahead!', 'Sign on the right!'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the comic panel, alive: his red cape flutters, the panel lunges toward every swing, it wobbles when he slips,
// and flashes with halftone dots on every hit
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uPunch, uDir, uWob, uFlash, uA, uBoss;
float cape(vec3 c){ return smoothstep(0.5, 0.62, c.r) * (1.0 - smoothstep(0.32, 0.42, c.g)) * (1.0 - smoothstep(0.3, 0.4, c.b)); }
void main(){
  vec2 p = vUv;
  // lunge: zoom in a little toward where he's swinging
  vec2 c = vec2(0.5 + uDir * 0.3, 0.2);
  p = c + (p - c) / (1.0 + 0.05 * uPunch);
  // slip wobble
  p.x += sin(p.y * 18.0 + uT * 14.0) * 0.008 * uWob;
  p.y += sin(p.x * 14.0 + uT * 11.0) * 0.005 * uWob;
  // the cape flutters: where the red cape is (on the left of the panel), ripple it
  vec4 c0 = texture2D(map, p);
  float m = cape(c0.rgb) * (1.0 - smoothstep(0.45, 0.6, p.x));
  vec2 q = p + vec2(sin(p.y * 26.0 - uT * 5.0), cos(p.x * 22.0 - uT * 4.0)) * 0.0045 * m * (1.0 + uBoss);
  vec3 col = texture2D(map, clamp(q, 0.001, 0.999)).rgb;
  // halftone flash on a hit
  vec2 g = fract(vUv * 90.0) - 0.5; float dotm = 1.0 - smoothstep(0.18, 0.3, length(g));
  col = mix(col, col + vec3(0.25, 0.22, 0.05) * dotm, uFlash);
  col *= 1.0 + 0.15 * uFlash;
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the band: a comic superhero theme, squeaks, drips, SHWAKs ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0.8; mus.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest = out) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.004, dest = out } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, dest = out, vib = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 28; lg.gain.value = vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.03); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  // the theme: a driving bass, kick and snare, and brassy stabs (four bars in C minor, then up a step for the boss)
  const BASS = [36, 36, 48, 36, 39, 39, 51, 39, 41, 41, 53, 41, 43, 43, 55, 46];
  const STAB = [[60, 63, 67], [63, 67, 70], [65, 68, 72], [67, 71, 74]];
  let next = 0, step = 0, timer = null, bpm = 132, key = 0, on = false;
  function schedule() {
    const beat = 60 / bpm / 2;
    while (next < ac.currentTime + 0.12) {
      const t = next, s = step % 16, bar = Math.floor(step / 16) % 4;
      if (on) {
        tone(t, midi(BASS[s] + key), beat * 0.9, { type: 'sawtooth', vol: 0.05, dest: mus });
        if (s % 4 === 0) { tone(t, 120, 0.18, { vol: 0.35, slide: 40, dest: mus }); }
        if (s % 8 === 4) noise(t, 0.16, { freq: 1800, q: 0.7, vol: 0.22, dest: mus });
        if (s % 2 === 1) noise(t, 0.03, { freq: 8000, type: 'highpass', vol: 0.05, dest: mus });
        if (s === 0 || s === 3 || s === 6) STAB[bar].forEach(m => tone(t, midi(m + key), s === 6 ? beat * 3 : beat * 0.8, { type: 'square', vol: 0.022, att: 0.01, dest: mus }));
      }
      next += beat; step++;
    }
  }
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.3); next = ac.currentTime + 0.1; timer = setInterval(schedule, 25); },
    music(v) { on = v; },
    boss() { key = 2; bpm = 150; },
    // a sign sneaking up: a sneaker squeak and a drip, from its side (left low, ahead middle, right high)
    squeak(lane, vol = 1) {
      const t = ac.currentTime + 0.01, p = (lane - 1) * 0.85, f = [900, 1250, 1650][lane];
      tone(t, f, 0.13, { vol: 0.07 * vol, slide: f * 1.5, p, vib: 60 }); tone(t + 0.16, f * 1.1, 0.1, { vol: 0.05 * vol, slide: f * 1.7, p, vib: 60 });
      tone(t + 0.32, 1800 + lane * 300, 0.09, { vol: 0.05 * vol, slide: 700, p });
    },
    swing(lane) { noise(ac.currentTime + 0.005, 0.22, { freq: 700, q: 0.7, vol: 0.28, sweep: 3500, p: (lane - 1) * 0.8, att: 0.04 }); },
    whiff(lane) { const t = ac.currentTime + 0.12; tone(t, 400, 0.25, { type: 'triangle', vol: 0.06, slide: 250, p: (lane - 1) * 0.8 }); },
    shwak(lane, n) {
      const t = ac.currentTime + 0.02, p = (lane - 1) * 0.8;
      tone(t, 140, 0.25, { vol: 0.4, slide: 50, p }); noise(t, 0.3, { freq: 2600, q: 0.9, vol: 0.45, sweep: 600, p });
      [820, 1240, 1690].forEach((f, i) => tone(t + 0.01, f, 0.45, { type: 'square', vol: 0.04, p, slide: f * 0.9 }));
      for (let i = 0; i < 5; i++) tone(t + 0.25 + i * 0.07, 500 + Math.random() * 900, 0.06, { type: 'square', vol: 0.035, p: p * (1 - i * 0.15) });   // it clatters away
      [0, 4, 7].forEach((d, i) => tone(t + 0.05 + i * 0.05, midi(72 + d + (n % 4) * 2), 0.3, { type: 'triangle', vol: 0.06 }));
    },
    slip() {
      const t = ac.currentTime + 0.01; noise(t, 0.6, { freq: 1500, q: 0.6, vol: 0.4, sweep: 400 });
      tone(t + 0.05, 900, 0.5, { type: 'triangle', vol: 0.1, slide: 180 }); tone(t + 0.55, 90, 0.25, { vol: 0.4, slide: 40 }); noise(t + 0.55, 0.2, { freq: 300, type: 'lowpass', vol: 0.3 });
    },
    roar() { const t = ac.currentTime + 0.01; tone(t, 70, 1.2, { type: 'sawtooth', vol: 0.12, slide: 55, vib: 8 }); tone(t, 105, 1.2, { type: 'sawtooth', vol: 0.07, slide: 80, vib: 6 }); noise(t, 1, { freq: 400, q: 0.5, vol: 0.2 }); },
    stomp(lane) { const t = ac.currentTime + 0.01, p = (lane - 1) * 0.85; tone(t, 80, 0.3, { vol: 0.45, slide: 40, p }); noise(t, 0.4, { freq: 900, q: 0.6, vol: 0.3, p, sweep: 300 }); this.squeak(lane, 1.6); },
    win() { const t = ac.currentTime + 0.05; [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.09, midi(m + 2), 1.2, { type: 'square', vol: 0.03, att: 0.01 })); tone(t + 0.7, midi(48 + 2), 1.6, { type: 'sawtooth', vol: 0.06 }); },
    quiet(v) { mus.gain.setTargetAtTime(v, ac.currentTime, 0.4); },
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} },
  };
}

// this game's own layout addition (the kit's styles stay as they are): pop-ups sit over the score panel, above the art
let cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = `.mgk-alert.shwak-top{top:calc(60px + env(safe-area-inset-top));z-index:12}
  @media (max-height:640px){.mgk-alert.shwak-top{top:calc(60px + env(safe-area-inset-top))}}`;
  document.head.appendChild(s);
}

export function shwakGame() {
  let G = null;
  const tex = {};
  const T = (k, text) => { const key = k + (text || ''); if (!tex[key]) { const t = new THREE.CanvasTexture(thingCanvas(k, 512, text)); t.colorSpace = THREE.SRGBColorSpace; tex[key] = t; } return tex[key]; };
  const at = (lane, up = 0) => { const s = SPOT[lane]; return G.S.P(s.u, s.v - up); };

  function hud() {
    const v = G.phase.startsWith('boss') || G.phase === 'win' ? `${BOSS_HP - G.hp}<small>of ${BOSS_HP} hits on the giant</small>` : `${G.shwaks}<small>of ${SIGNS} signs</small>`;
    const segs = G.phase.startsWith('boss') || G.phase === 'win' ? [BOSS_HP - G.hp, BOSS_HP] : [G.shwaks, SIGNS];
    G.ui.panel('SHWAK!', v, { segs, sub: `Swing LEFT · AHEAD · RIGHT` + (G.combo > 1 ? ` · Combo ×${G.combo}` : '') + (G.slips ? ` · Slips ${G.slips}` : ''), warn: G.phase.startsWith('boss') });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; hud(); }
  const alert = (title, sub, secs, kind = 'red') => G.ui.alert(title, sub, secs, kind + ' shwak-top');

  // a big comic word bursts out where he hit
  function word(lane, text, big = 1) {
    const [x, y] = at(lane, 0.2), s = K.sprite(T('burst', text), 0.34 * big, { order: 40 }); s.position.set(x, y, 0.08); s.material.rotation = (Math.random() - 0.5) * 0.4; G.root.add(s);
    G.pops.push({ s, t: 0, life: 0.9, size: 0.34 * big, kind: 'word' });
  }
  function splashAt(x, y, size = 0.3) { const s = K.sprite(T('splash'), size, { order: 35 }); s.position.set(x, y + size * 0.25, 0.07); G.root.add(s); G.pops.push({ s, t: 0, life: 0.7, size, kind: 'splash' }); }

  // a new sign starts sneaking up
  function spawn() {
    const n = G.spawned++;
    const lane = n < 3 ? [0, 2, 1][n] : Math.floor(Math.random() * 3);
    const s = K.sprite(T('sign'), 0.1, { order: 25, opacity: 0 }); G.root.add(s);
    G.sign = { lane, s, k: 0, dur: Math.max(1.25, 2.8 - n * 0.13), sq: 0, hit: false, fly: 0, vx: 0, spin: 0 };
    G.band.squeak(lane, 0.6);
    if (n < 3) G.say(SAY_SIDE[lane]);   // the first three are called out, so you learn the sounds
  }
  function swing(lane) {
    if (!G || !G.playing || G.over) return;
    if (G.cool > 0) return;
    G.cool = 0.22; G.swingLane = lane; G.swingT = 0; G.punch = 1; G.dir = lane - 1;
    G.band.swing(lane); G.buzz(15);
    { const s = SPOT[lane], [sx, sy] = G.S.P(s.u, s.v - 0.02), dx = sx - G.canePivot[0], dy = sy - G.canePivot[1];
      G.cs = { t: 0, a0: G.caneAng, l0: G.caneL, a: Math.atan2(dy, dx), l: Math.max(0.6, Math.min(1.08, Math.hypot(dx, dy) / G.caneLen * 1.04)) }; }
    // the swoosh arc on that side
    const [x, y] = at(lane, 0.12); G.swoosh.position.set(x, y, 0.075); G.swoosh.scale.set(lane === 0 ? -0.42 : 0.42, 0.42, 1); G.swoosh.material.opacity = 1;
    const sg = G.sign;
    if (G.phase === 'signs' && sg && !sg.hit && sg.k > 0.08) {
      if (sg.lane === lane) return hitSign();
      G.combo = 0; G.band.whiff(lane); G.ui.pop('Whiff!'); hud(); return;
    }
    if (G.phase === 'boss-charge') {
      if (G.bossLane === lane) return hitBoss();
      G.band.whiff(lane); G.ui.pop('Whiff!');
      return;
    }
    G.band.whiff(lane);
  }
  function hitSign() {
    const sg = G.sign; sg.hit = true; sg.vx = (sg.lane - 1 || (Math.random() < 0.5 ? -1 : 1)) * 0.9; sg.vy = 0.9; sg.spin = (Math.random() < 0.5 ? -1 : 1) * 12;
    G.shwaks++; G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo); G.flash = 1;
    const w = WORDS[(G.shwaks - 1) % WORDS.length];
    G.band.shwak(sg.lane, G.shwaks); G.buzz([40, 20, 60]); word(sg.lane, w);
    const [x, y] = at(sg.lane, 0.1); G.fx.add(x, y, '#ffe600', 22, 0.45);
    G.say(w.replace('!', '') === 'SHWAK' ? 'Shwak!' : w.charAt(0) + w.slice(1).toLowerCase());
    G.gap = Math.max(0.35, 0.8 - G.shwaks * 0.03); hud();
  }
  function slip() {
    const sg = G.sign; G.slips++; G.combo = 0; G.wob = 1; G.band.slip(); G.buzz([150, 60, 200]);
    const [x, y] = at(sg.lane); splashAt(x, y, 0.36);
    alert('SPLASH!', 'He slipped! Listen for the squeak.', 1.4, 'blue'); G.say('Splash! He slipped!');
    sg.hit = true; sg.vx = 0; sg.vy = -0.1; sg.spin = 0; sg.fade = true;
    G.gap = 1.2; hud();
  }

  /* ── the boss ── */
  function bossIntro() {
    setPhase('boss-in'); G.hp = BOSS_HP; G.bossLane = 1; G.band.roar(); G.band.boss(); G.buzz([200, 100, 200]);
    alert('THE GIANT WET FLOOR SIGN!', 'Find it by its stomp. SHWAK it 5 times!', 3, 'red');
    G.say('Oh no! The giant wet floor sign! Find it by its stomp, and shwak it five times!');
    hud();
  }
  function bossHop() {
    const from = G.bossLane; let to = Math.floor(Math.random() * 3); if (to === from) to = (to + 1 + Math.floor(Math.random() * 2)) % 3;
    G.hopFrom = from; G.bossLane = to; setPhase('boss-hop');
  }
  function hitBoss() {
    G.hp--; G.flash = 1; G.recoil = 1; G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo);
    const w = ['KA-SHWAK!', 'THWACK!', 'KA-POW!', 'BONK!', 'KA-SHWAAAK!'][BOSS_HP - G.hp - 1];
    G.band.shwak(G.bossLane, 8 + G.hp); G.buzz([60, 30, 90]); word(G.bossLane, w, 1.25);
    const [x, y] = at(G.bossLane, 0.22); G.fx.add(x, y, '#ffe600', 30, 0.55);
    hud();
    if (G.hp <= 0) { setPhase('win'); G.band.win(); alert('KA-SHWAAAK!', 'The Tubiak Maniak wins!', 3, 'red'); G.say('Ka shwak! The Tubiak Maniak wins!'); G.bossFly = { vx: (G.bossLane - 1 || 1) * 0.5, vy: 1.4, spin: 6 }; }
    else { G.say(`${G.hp} more!`); setPhase('boss-recoil'); }
  }

  return {
    title: 'SHWAK!',
    start(ctx) {
      if (G) this.stop();
      css();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, spawned: 0, shwaks: 0, slips: 0, combo: 0, bestCombo: 0, sign: null, gap: 1.0, cool: 0, punch: 0, dir: 0, wob: 0, flash: 0, pops: [], hp: BOSS_HP, bossLane: 1, recoil: 0, swingLane: 1 });
      G.band = band(K.audio());
      // the comic panel, alive (cape, lunges, wobble, halftone flash)
      G.uni = { map: { value: null }, uT: { value: 0 }, uPunch: { value: 0 }, uDir: { value: 0 }, uWob: { value: 0 }, uFlash: { value: 0 }, uA: { value: 0 }, uBoss: { value: 0 } };
      G.panel = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.panel.renderOrder = 11; G.panel.position.z = 0.03; G.root.add(G.panel);
      new THREE.TextureLoader().load(ART + 'panel.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.panelOK = true; });
      // his cane, cut out: it turns on his fist. The pivot group turns it and stretches it along its length; the inner
      // group first turns it back by its painted angle, so at rest (turned to that same angle) it sits exactly as painted.
      { const W = CANE.W, [bx0, by0, bx1, by1] = CANE.box, P = (x, y) => G.S.P(x / W, y / W), [px, py] = P(...CANE.pivot), [tx, ty] = P(...CANE.tip), [cx, cy] = P((bx0 + bx1) / 2, (by0 + by1) / 2);
        G.caneRest = Math.atan2(ty - py, tx - px); G.caneLen = Math.hypot(tx - px, ty - py); G.canePivot = [px, py];
        G.cane = new THREE.Group(); G.cane.position.set(px, py, 0.062); G.root.add(G.cane);
        const inner = new THREE.Group(); inner.rotation.z = -G.caneRest; G.cane.add(inner);
        const hold = new THREE.Group(); inner.add(hold);   // (the cane's picture sits here exactly where it is in the painting)
        G.caneMesh = new THREE.Mesh(new THREE.PlaneGeometry((bx1 - bx0) / W, (by1 - by0) / W * G.h), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
        G.caneMesh.position.set(cx - px, cy - py, 0); G.caneMesh.renderOrder = 31; hold.add(G.caneMesh);
        G.caneAng = G.caneRest; G.caneL = 1; G.cs = null;
        new THREE.TextureLoader().load(ART + 'cane.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.caneMesh.material.map = t; G.caneMesh.material.needsUpdate = true; G.caneOK = true; }); }
      // the glint on his cane, the swoosh, and the boss
      G.glint = K.sprite(K.glowTex, 0.12, { color: '#ffffff', additive: true, opacity: 0, order: 30 }); const [gx, gy] = G.S.P(GRIP.u, GRIP.v); G.glint.position.set(gx, gy, 0.06); G.root.add(G.glint);
      G.swoosh = K.sprite(T('swoosh'), 0.42, { order: 32, opacity: 0 }); G.root.add(G.swoosh);
      G.boss = K.sprite(T('boss'), 0.5, { order: 26, opacity: 0 }); G.root.add(G.boss);
      G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'red', aria: 'Swing left', press: () => swing(0) },
        { label: 'Ahead', icon: '▲', kind: 'red', aria: 'Swing straight ahead', press: () => swing(1) },
        { label: 'Right', icon: '▶', kind: 'red', aria: 'Swing right', press: () => swing(2) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; setPhase('signs'); G.band.music(true); G.gap = 0.6; };
      K.intro(G, { title: 'SHWAK!',
        how: 'Wet floor signs sneak up on the left, straight ahead or on the right. Each one squeaks from its side. Swing the cane that way and SHWAK it before it gets you!',
        say: 'Shwak! You are the Tubiak Maniak. Wet floor signs are sneaking up on you. Each one squeaks from its side: on the left, straight ahead, or on the right. Swing your cane that way and shwak it before it gets you. Ready?' });
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over && !G.mikeAu) { G.overT = (G.overT || 0) + dt; if (G.overT > 2.4) { try { G.mikeAu = new Audio(MIKE); G.mikeAu.play().catch(() => {}); } catch (e) {} } }
      G.cool = Math.max(0, G.cool - dt);
      const ph = G.phase;

      // ── the signs ──
      if (ph === 'signs') {
        const sg = G.sign;
        if (!sg || (sg.hit && sg.done)) {
          G.gap -= dt;
          if (G.gap <= 0) { if (G.shwaks >= SIGNS) { G.sign = null; bossIntro(); } else spawn(); }
        }
      }
      const sg = G.sign;
      if (sg) {
        const [x, y] = at(sg.lane);
        if (!sg.hit) {
          sg.k = Math.min(1, sg.k + dt / sg.dur);
          sg.sq -= dt; if (sg.sq <= 0) { sg.sq = 0.55 - sg.k * 0.3; G.band.squeak(sg.lane, 0.5 + sg.k * 0.9); }
          const size = 0.07 + 0.24 * Math.pow(sg.k, 1.3), wob = Math.sin(G.t * 16) * 0.05 * (1 - sg.k * 0.5);
          sg.s.position.set(x + Math.sin(G.t * 8) * 0.004, y + size * 0.42 + Math.abs(Math.sin(G.t * 10)) * 0.008, 0.06); sg.s.scale.setScalar(size); sg.s.material.rotation = wob;
          sg.s.material.opacity = Math.min(1, sg.s.material.opacity + dt * 4);
          if (sg.k >= 1) slip();
        } else {
          // knocked flying, spinning off the panel (or, after a slip, just fading)
          sg.fly += dt;
          if (!sg.fade) { sg.s.position.x += sg.vx * dt; sg.s.position.y += sg.vy * dt; sg.vy -= 2.2 * dt; sg.s.material.rotation += sg.spin * dt; }
          sg.s.material.opacity = Math.max(0, sg.s.material.opacity - dt * (sg.fade ? 2 : 1.2));
          if (sg.fly > 0.9 && !sg.done) { sg.done = true; G.root.remove(sg.s); }
        }
      }

      // ── the boss ──
      const B = G.boss;
      if (ph === 'boss-in') {
        const k = Math.min(1, G.phT / 1.2), [x, y] = at(1);
        B.material.opacity = k; B.scale.setScalar(0.5 * (0.3 + 0.7 * k)); B.position.set(x, y + 0.24 * (0.3 + 0.7 * k) + Math.abs(Math.sin(G.t * 9)) * 0.01, 0.065);
        if (G.phT > 3.2) bossHop();
      } else if (ph === 'boss-hop') {
        // it hops to a new side, squeaking where it lands
        const k = Math.min(1, G.phT / 0.5), [x0, y0] = at(G.hopFrom), [x1, y1] = at(G.bossLane);
        B.position.set(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + 0.24 + Math.sin(k * Math.PI) * 0.12, 0.065); B.scale.setScalar(0.5); B.material.rotation = Math.sin(k * Math.PI) * (G.bossLane - G.hopFrom) * -0.15;
        if (k >= 1) { setPhase('boss-charge'); G.charge = Math.max(1.3, 2.1 - (BOSS_HP - G.hp) * 0.15); G.band.stomp(G.bossLane); G.sq = 0.5; }
      } else if (ph === 'boss-charge') {
        // it shakes with rage, squeaking, then STOMPS
        const [x, y] = at(G.bossLane), k = G.phT / G.charge;
        B.position.set(x + Math.sin(G.t * 40) * 0.006 * k, y + 0.24, 0.065); B.scale.setScalar(0.5 * (1 + k * 0.12)); B.material.rotation = Math.sin(G.t * 30) * 0.04 * k;
        G.sq -= dt; if (G.sq <= 0) { G.sq = 0.45 - k * 0.2; G.band.squeak(G.bossLane, 1 + k); }
        if (G.phT > G.charge) {
          G.slips++; G.combo = 0; G.wob = 1; G.band.stomp(G.bossLane); G.band.slip(); G.buzz([200, 80, 200]); splashAt(x, y, 0.45);
          alert('STOMP! SPLASH!', 'He slipped! Get back up and SHWAK it!', 1.4, 'blue'); G.say('Stomp! Splash!'); hud();
          bossHop();
        }
      } else if (ph === 'boss-recoil') {
        const [x, y] = at(G.bossLane); G.recoil = Math.max(0, G.recoil - dt * 2);
        B.position.set(x + Math.sin(G.t * 50) * 0.01 * G.recoil, y + 0.24 + G.recoil * 0.04, 0.065); B.material.rotation = (G.bossLane - 1 || 1) * 0.3 * G.recoil;
        if (G.phT > 0.9) bossHop();
      } else if (ph === 'win') {
        const f = G.bossFly; B.position.x += f.vx * dt; B.position.y += f.vy * dt; f.vy -= 1.2 * dt; B.material.rotation += f.spin * dt; B.material.opacity = Math.max(0, B.material.opacity - dt * 0.5);
        if (G.phT > 3.6 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('wet-floor-signs-beware:slips', G.slips, 'lower');
          K.finale(G, { won: true, kicker: 'Wet Floor Signs, Beware!', title: 'SHWAK!', line: G.work && G.work.quote, best: r.isBest, say: 'The wet floor signs are beaten!',
            cells: [{ k: 'Shwaks', v: G.shwaks + BOSS_HP }, { k: 'Best combo', v: G.bestCombo }, { k: 'Slips', v: G.slips }] });
          G.band.music(false); G.band.quiet(0.3);
        }
      }
      G.uni.uBoss.value += ((ph.startsWith('boss') ? 1 : 0) - G.uni.uBoss.value) * Math.min(1, dt * 2);

      // ── the panel: lunge, wobble, flash; the cane glint; the swoosh; the words ──
      G.uni.uT.value = G.t;
      G.punch = Math.max(0, G.punch - dt * 4); G.uni.uPunch.value = Math.sin(Math.min(1, G.punch) * Math.PI / 2); G.uni.uDir.value += (G.dir - G.uni.uDir.value) * Math.min(1, dt * 12);
      G.wob = Math.max(0, G.wob - dt * 1.3); G.uni.uWob.value = G.wob;
      G.flash = Math.max(0, G.flash - dt * 3); G.uni.uFlash.value = G.flash;
      G.uni.uA.value += ((G.panelOK && !(G.over && G.overT > 1.2) ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      const tw = Math.pow(Math.max(0, Math.sin(G.t * 2.3)), 12);
      G.glint.material.opacity = G.uni.uA.value * (0.25 + 0.75 * Math.max(tw, G.punch)); G.glint.scale.setScalar(0.08 + 0.1 * Math.max(tw, G.punch)); G.glint.material.rotation = G.t;
      G.swoosh.material.opacity = Math.max(0, G.swoosh.material.opacity - dt * 4);
      // the cane: wind up, slam to the side you chose, hold a beat, swing back to where it is in the painting
      if (G.cane) {
        const sm = x => x * x * (3 - 2 * x), up = G.caneRest + 0.6;
        let a = G.caneRest + Math.sin(G.t * 1.7) * 0.015, l = 1;
        if (G.cs) {
          const c = G.cs; c.t += dt; const t = c.t;
          if (t < 0.07) { const k = sm(t / 0.07); a = c.a0 + (up - c.a0) * k; l = c.l0 + (1 - c.l0) * k; }
          else if (t < 0.15) { const k = sm((t - 0.07) / 0.08); a = up + (c.a - up) * k; l = 1 + (c.l - 1) * k; }
          else if (t < 0.3) { a = c.a; l = c.l; }
          else if (t < 0.62) { const k = sm((t - 0.3) / 0.32); a = c.a + (G.caneRest - c.a) * k; l = c.l + (1 - c.l) * k; }
          else G.cs = null;
        }
        a += Math.sin(G.t * 30) * 0.12 * G.wob;   // it wobbles when he slips
        G.caneAng = a; G.caneL = l; G.cane.rotation.z = a; G.cane.scale.set(l, 1, 1);
        G.caneMesh.material.opacity = G.caneOK ? G.uni.uA.value : 0;
      }
      for (let i = G.pops.length - 1; i >= 0; i--) {
        const p = G.pops[i]; p.t += dt; const k = p.t / p.life;
        p.s.scale.setScalar(p.size * (p.kind === 'word' ? (k < 0.15 ? 0.4 + k / 0.15 * 0.75 : 1.15 - (k - 0.15) * 0.15) : 0.6 + k * 0.6));
        p.s.material.opacity = k < 0.6 ? 1 : Math.max(0, 1 - (k - 0.6) / 0.4);
        if (p.kind === 'word') p.s.position.y += dt * 0.05;
        if (p.t >= p.life) { G.root.remove(p.s); p.s.material.dispose(); G.pops.splice(i, 1); }
      }

      // ── the robot: swings the right way when a sign is halfway; whiffs once, and lets one slip ──
      if (G.bot && G.playing && !G.over && G.cool <= 0) {
        if (ph === 'signs' && sg && !sg.hit) {
          if (G.spawned === 4 && !G.botWhiff && sg.k > 0.3) { G.botWhiff = true; swing((sg.lane + 1) % 3); }
          else if (G.spawned === 6 && !G.slips) { /* lets this one get him */ }
          else if (sg.k > 0.5) swing(sg.lane);
        }
        if (ph === 'boss-charge' && G.phT > 0.6 && !(G.hp === 3 && G.slips < 2)) swing(G.bossLane);
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over || kind !== 'down') return;
      swing(G.S.screenThird(ev) + 1);   // tap the left, middle or right of the screen
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'shwak', phase: G.phase, playing: G.playing, over: G.over, shwaks: G.shwaks, slips: G.slips, combo: G.combo, hp: G.hp, lane: G.sign ? G.sign.lane : G.bossLane, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.mikeAu && G.mikeAu.pause(); } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
