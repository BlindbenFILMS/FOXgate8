// I AM BLIND, LIKE MY HAIR IS BROWN (Alayna Lopez): STILL ME, a "find it and put it back" game.
// “That person you are and always have been is still going to be there. I am blind like my hair is brown, you know?
//  It's just a part of me that I really appreciate.”
// Her mosaic face breaks into 8 pieces that float off over the wall, but her brown hair never moves (it shimmers to show it).
// One at a time, the empty spot where a piece belongs hums, from its own place: left or right in your ears, higher near the top
// of her face, lower near her chin. Tap the spot, or drag the glowing piece onto it (or slide a finger, listen to the pings get
// faster, and lift on it), and the piece flies home. A miss gets a spoken nudge ("Up and left."). Last of all come her brown eyes. Then she's whole: still her.
// Accessible: the hum's side and pitch say where; the sonar pings speed up as your finger gets close; spoken direction hints;
// Hear It repeats the piece and the hum; the target area grows after misses. Sighted players also see the humming spot glow.
// Props: hair-things.js (the pieces are cut from the painting itself). No image files.
import * as THREE from 'three';
import * as K from './kit.js';
import { slimHud } from './alayna-hud.js';
import { PIECES, bounds, drawHole, pieceTex, outlineTex, glowTex } from './hair-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_15.mp3', import.meta.url).href;   // Alayna, in her own words
const R0 = 92, R_MAX = 170;           // how close a tap must be (painting pixels, of 1024)
const MUSIC = 0.67;                   // music a third under the effects and voice (Ben's call)
// where the pieces float while they're away: over her hair and the wall, never over her face
const AWAY = [[150, 210, -0.3], [880, 190, 0.25], [118, 520, 0.2], [915, 540, -0.2], [170, 860, -0.15], [868, 862, 0.3], [512, 965, 0.1], [312, 64, -0.2]];
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const SONG = [65, 69, 72, 77, 76, 72, 74, 81];   // one note per piece home: a little tune that ends high

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uShine, uA;
void main(){
  vec4 c = texture2D(map, vUv);
  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  float hair = (1.0 - smoothstep(0.12, 0.32, l)) * smoothstep(-0.12, 0.12, c.g + c.b - c.r * 0.9);   // the dark brown hair (not the bright shapes)
  float band = smoothstep(0.55, 1.0, sin((vUv.x * 2.2 + vUv.y * 1.3) * 4.0 - uT * 1.8));
  vec3 o = c.rgb + vec3(0.42, 0.25, 0.13) * hair * band * uShine;           // a warm glint running through it
  gl_FragColor = vec4(o, uA);
}`;

/* ───────── sound: a warm pad, the hum, sonar pings, chimes ───────── */
function sounds(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001; master.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p) => { if (!ac.createStereoPanner) return master; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(master); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(pan(p)); o.start(t); o.stop(t + dur + 0.05);
  }
  // the pad: F major, soft
  const padG = ac.createGain(); padG.gain.value = 0.035 * MUSIC; padG.connect(master); const oscs = [];
  [53, 60, 65, 69].forEach((m, i) => { const o = ac.createOscillator(), f = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = midi(m); o.detune.value = i % 2 ? 5 : -5; f.type = 'lowpass'; f.frequency.value = 800; o.connect(f).connect(padG); o.start(); oscs.push(o); });
  // the hum: a steady, pulsing voice that sits where the empty spot is
  const humO = ac.createOscillator(), humO2 = ac.createOscillator(), humG = ac.createGain(), lfo = ac.createOscillator(), lfoG = ac.createGain();
  const humP = ac.createStereoPanner ? ac.createStereoPanner() : null;
  humO.type = 'sine'; humO2.type = 'triangle'; humG.gain.value = 0; lfo.frequency.value = 2.2; lfoG.gain.value = 0;
  lfo.connect(lfoG).connect(humG.gain);
  const h2 = ac.createGain(); h2.gain.value = 0.25; humO.connect(humG); humO2.connect(h2).connect(humG);
  if (humP) { humG.connect(humP).connect(master); } else humG.connect(master);
  humO.start(); humO2.start(); lfo.start(); oscs.push(humO, humO2, lfo);
  const S = {
    start() { master.gain.setTargetAtTime(0.9, ac.currentTime, 0.2); },
    hold() { master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    // u, v: where the spot is on the painting (0..1)
    hum(u, v, on, loud = 1) {
      const t = ac.currentTime, f = 300 + (1 - v) * 520;
      humO.frequency.setTargetAtTime(f, t, 0.05); humO2.frequency.setTargetAtTime(f * 2, t, 0.05);
      if (humP) humP.pan.setTargetAtTime(Math.max(-1, Math.min(1, (u - 0.5) * 2.2)), t, 0.05);
      const a = on ? 0.06 * loud : 0; humG.gain.setTargetAtTime(a, t, 0.15); lfoG.gain.setTargetAtTime(a * 0.9, t, 0.15);
    },
    ping(u, near) { tone(ac.currentTime, 900 + near * 900, 0.06, { vol: 0.07 + near * 0.06, p: (u - 0.5) * 2 }); },
    shatter() { const t = ac.currentTime; for (let i = 0; i < 14; i++) tone(t + i * 0.035 + Math.random() * 0.02, 1500 + Math.random() * 2500, 0.25, { type: 'triangle', vol: 0.05, p: Math.random() * 2 - 1 }); },
    miss(u) { tone(ac.currentTime, 240, 0.16, { type: 'triangle', vol: 0.08, slide: 190, p: (u - 0.5) * 2 }); },
    home(i, u) { const t = ac.currentTime, m = SONG[i % SONG.length]; tone(t, midi(m), 1.2, { vol: 0.14, p: (u - 0.5) * 1.6 }); tone(t, midi(m + 12), 0.5, { vol: 0.05 }); tone(t + 0.08, midi(m + 7), 0.9, { vol: 0.05, att: 0.02 }); },
    whoosh(u) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; s.buffer = nb; f.type = 'bandpass'; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.6); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); s.connect(f).connect(g).connect(pan((u - 0.5) * 2)); s.start(t); s.stop(t + 0.8); },
    whole() { const t = ac.currentTime; [65, 69, 72, 77, 81, 84].forEach((m, i) => tone(t + i * 0.12, midi(m), 1.6, { vol: 0.09, p: (i - 2.5) * 0.3 })); padG.gain.setTargetAtTime(0.06 * MUSIC, t, 0.5); },
    stop() { master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { oscs.forEach(o => { try { o.stop(); } catch (e) {} }); try { master.disconnect(); } catch (e) {} }, 600); },
  };
  return S;
}

function inside(poly, x, y) {
  let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}

export function stillMeGame() {
  let G = null;
  const B = (x, y) => G.S.P(x / 1024, y / 1024);

  function hud() {
    G.ui.panel(G.phase === 'party' || G.over ? 'Still Me · still her' : `Still Me · piece ${Math.min(8, G.i + 1)} of 8`, `${G.home}<small>pieces home</small>`, { segs: [G.home, 8] });
  }
  function redraw() {
    const g = G.boardG; g.drawImage(G.img, 0, 0, 1024, 1024);
    PIECES.forEach((p, i) => { if (G.away[i]) drawHole(g, p.poly); });
    G.boardTex.needsUpdate = true;
  }
  function scatter() {
    G.phase = 'scatter'; G.pt = 0; G.snd.shatter(); G.buzz([20, 30, 20]);
    PIECES.forEach((p, i) => { G.away[i] = true; const m = G.pieces[i]; m.visible = true; m.userData.from = [m.userData.hx, m.userData.hy, 0]; m.userData.to = AWAY[i]; m.userData.t = 0; });
    redraw();
  }
  function beginPiece() {
    G.phase = 'find'; G.ft = 0; G.hinted = false; G.misses = 0; G.r = R0;
    const p = PIECES[G.i], b = bounds(p.poly); G.target = { p, b, u: b.cx / 1024, v: b.cy / 1024 };
    G.say(p.say); G.snd.hum(G.target.u, G.target.v, true);
    hud();
  }
  function tryAt(x, y, final) {
    const T = G.target, d = Math.hypot(x - T.b.cx, y - T.b.cy), ok = inside(T.p.poly, x, y) || d <= G.r;
    if (ok) { place(); return true; }
    if (!final) return false;
    G.misses++; G.taps++; G.snd.miss(x / 1024);
    if (G.misses % 2 === 0) G.r = Math.min(R_MAX, G.r + 25);
    const dx = T.b.cx - x, dy = T.b.cy - y, th = 55;
    const v = Math.abs(dy) > th ? (dy < 0 ? 'Up' : 'Down') : '', h = Math.abs(dx) > th ? (dx < 0 ? 'left' : 'right') : '';
    let line = v && h ? `${v} and ${h}.` : v ? `${v}.` : h ? `${h[0].toUpperCase() + h.slice(1)}.` : 'So close!';
    if (d < G.r * 1.8 && line !== 'So close!') line = 'So close! ' + line;
    G.say(line); G.ui.pop(line.replace(/\.$/, '').toUpperCase(), innerWidth / 2, innerHeight * 0.5);
    return false;
  }
  // drag and drop: grab the glowing piece itself and drop it on its spot
  function grab(bx, by) {
    const m = G.pieces[G.i]; if (!m) return false;
    const w = m.geometry.parameters.width * m.scale.x, h = m.geometry.parameters.height * m.scale.y;
    if (Math.abs(bx - m.position.x) > w / 2 + 0.03 || Math.abs(by - m.position.y) > h / 2 + 0.03) return false;
    G.carry = { ox: m.position.x - bx, oy: m.position.y - by }; m.userData.back = null; G.snd.ping(m.position.x + 0.5, 0.6); G.buzz(15);
    return true;
  }
  function carryTo(bx, by) {
    const m = G.pieces[G.i]; m.position.set(bx + G.carry.ox, by + G.carry.oy, 0.06);
    const px = (m.position.x + 0.5) * 1024, py = (0.5 - m.position.y / G.h) * 1024;
    G.drag = G.drag || { t: 0 }; G.drag.x = px; G.drag.y = py;   // the sonar follows the piece
    return [px, py];
  }
  function drop(bx, by) {
    const m = G.pieces[G.i], [px, py] = carryTo(bx, by); G.carry = null; G.drag = null;
    if (inside(G.target.p.poly, px, py) || Math.hypot(px - G.target.b.cx, py - G.target.b.cy) <= G.r * 1.25) { m.userData.dur = 0.3; place(); return; }
    m.userData.back = { x: m.position.x, y: m.position.y, t: 0 };   // not there yet: it floats back, and the voice says which way
    tryAt(px, py, true);
  }
  function place() {
    const i = G.i, m = G.pieces[i]; G.taps++; G.home++;
    G.phase = 'fly'; G.pt = 0; G.snd.hum(0, 0, false); G.snd.whoosh(G.target.u); G.drag = null;
    m.userData.from = [m.position.x, m.position.y, m.material.rotation || m.rotation.z]; m.userData.t = 0;
    hud();
  }
  function landed() {
    const i = G.i, m = G.pieces[i], p = PIECES[i]; m.visible = false; G.away[i] = false; redraw();
    G.snd.home(i, G.target.u); G.buzz([30, 40, 60]);
    const [x, y] = B(G.target.b.cx, G.target.b.cy);
    G.fx.add(x, y, p.eye ? '#7a3f1d' : '#ffc928', p.eye ? 22 : 16, 0.32); if (p.eye) G.fx.add(x, y, '#ffe39a', 14, 0.25);
    G.i++;
    if (G.i >= PIECES.length) { G.phase = 'party'; G.pt = 0; G.snd.whole(); G.say('Every piece is home. She was there all along.'); hud(); return; }
    G.phase = 'pause'; G.pt = 0;
    if (G.i !== 6) G.say(G.misses === 0 ? 'Home!' : 'There it is.');
  }
  function help() {
    if (!G || !G.playing || G.over) return;
    G.say('Listen for the hum. It comes from where the piece belongs. Tap there, or drag the glowing piece there. Slide your finger and listen: the pings get faster when you are close.');
    G.ui.alert('Follow the hum', 'Tap where it comes from', 2.4, 'black'); G.r = Math.min(R_MAX, G.r + 20);
  }
  function hearIt() {
    if (!G || !G.playing || G.over) return;
    if (G.phase === 'find') { G.say(G.target.p.say); G.snd.hum(G.target.u, G.target.v, true, 1.8); G.loudT = 2.5; G.ft = 0; } else help();
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('i-am-blind-like-my-hair-is-brown:still', G.taps, 'lower');
    K.finale(G, { won: true, kicker: 'I am blind, like my hair is brown', title: 'Still her', line: G.work && G.work.quote, best: r.isBest,
      say: 'Still Alayna, all along!',
      cells: [{ k: 'Pieces', v: '8/8' }, { k: 'Taps', v: `${G.taps}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.endT = 0; G.snd.fade(0.5, 1.5);
  }

  return {
    title: 'Still Me',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = slimHud();
      Object.assign(G, { phase: 'loading', i: 0, home: 0, taps: 0, misses: 0, pt: 0, ft: 0, r: R0, away: PIECES.map(() => false), pieces: [], endT: 0, t0: 0, loudT: 0, drag: null, carry: null, shine: 0 });
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.snd = sounds(K.audio());
      // the board: the painting with the empty spots, drawn on a canvas, through a shader that makes her hair glint
      const bc = document.createElement('canvas'); bc.width = bc.height = 1024; G.boardG = bc.getContext('2d'); G.boardTex = new THREE.CanvasTexture(bc); G.boardTex.colorSpace = THREE.NoColorSpace;
      G.uni = { map: { value: G.boardTex }, uT: { value: 0 }, uShine: { value: 0 }, uA: { value: 1 } };
      G.board = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.board.position.z = 0.015; G.board.renderOrder = 11; G.board.visible = false; G.root.add(G.board);
      G.glow = K.plane(glowTex(), 0.2, 0.2, { order: 13, additive: true, opacity: 0 }); G.glow.position.z = 0.025; G.root.add(G.glow);
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!G) return; G.img = img; redraw(); G.board.visible = true;
        PIECES.forEach((p, i) => {
          const t = pieceTex(img, p.poly), w = t.canvas.width / 1024, h = t.canvas.height / 1024;
          const m = K.plane(t.tex, w, h, { order: 16 }); const [hx, hy] = B(t.b.cx, t.b.cy); m.position.set(hx, hy, 0.04); m.visible = false;
          // its pulsing gold outline, shown while it's the piece you're looking for
          const ot = outlineTex(p.poly), o = K.plane(ot, w, h, { order: 17, opacity: 0 }); o.position.z = 0.002; m.add(o);
          m.userData = { hx, hy, tex: t.tex, otex: ot, outline: o, ph: Math.random() * 6 }; G.root.add(m); G.pieces.push(m);
        });
        G.ready = true;
      };
      img.src = (ctx.work && ctx.work.image) || 'targets/i-am-blind-like-my-hair-is-brown.jpg';
      G.ui.buttons([
        { label: 'Hear it', kind: 'red', aria: 'Hear the piece and its hum again', press: () => hearIt() },
        { label: 'Help', kind: 'black', aria: 'Help: how to find the spot', press: () => help() },
      ]);
      G.phase = 'intro'; hud();
      G.onGo = () => { G.t0 = G.t; G.snd.start(); const go = () => { if (!G) return; if (!G.ready) return setTimeout(go, 100); scatter(); }; go(); };
      K.intro(G, { title: 'Still Me', how: 'Her face breaks into pieces, but her brown hair stays. Each empty spot hums from where it is: tap there, or drag the glowing piece onto it.',
        say: "Still Me. Alayna's face breaks into pieces. But her brown hair stays right where it is. Each empty spot hums from where it is. Tap the spot, and its piece flies home. Eight pieces. Ready?" });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t;
      G.shine += ((G.phase === 'scatter' || G.phase === 'party' ? 1 : 0.3) - G.shine) * Math.min(1, dt * 2); u.uShine.value = G.shine;
      G.pt += dt;
      // the pieces: flying out, floating, flying home
      PIECES.forEach((p, i) => {
        const m = G.pieces[i]; if (!m || !m.visible) return; const d = m.userData;
        const lit = i === G.i && G.phase === 'find', o = d.outline;
        o.material.opacity += ((lit ? 0.55 + 0.45 * Math.sin(G.t * 5) : 0) - o.material.opacity) * Math.min(1, dt * 10);
        const os = lit ? 1.02 + 0.03 * Math.sin(G.t * 5) : 1; o.scale.set(os, os, 1);
        if (G.phase === 'scatter' || (G.phase !== 'fly' || i !== G.i)) {
          if (G.phase === 'scatter' && d.t < 1) {
            d.t = Math.min(1, d.t + dt / 1.4); const e = 1 - Math.pow(1 - d.t, 3), [tx, ty] = B(d.to[0], d.to[1]);
            m.position.set(d.hx + (tx - d.hx) * e, d.hy + (ty - d.hy) * e + Math.sin(Math.PI * e) * 0.06, 0.04); m.rotation.z = d.to[2] * e; const s = 1 - 0.25 * e; m.scale.set(s, s, 1);
          } else if (G.carry && i === G.i) {   // in your fingers: upright and a little bigger
            m.rotation.z *= Math.max(0, 1 - dt * 10); m.scale.set(0.9, 0.9, 1); m.renderOrder = 18;
          } else if (G.away[i]) {
            const [tx, ty] = B(d.to[0], d.to[1]); let fx = tx + Math.sin(G.t * 0.8 + d.ph) * 0.01, fy = ty + Math.sin(G.t * 1.1 + d.ph) * 0.012;
            if (d.back) { d.back.t = Math.min(1, d.back.t + dt / 0.4); const e = 1 - Math.pow(1 - d.back.t, 3); fx = d.back.x + (fx - d.back.x) * e; fy = d.back.y + (fy - d.back.y) * e; if (d.back.t >= 1) d.back = null; }
            m.position.set(fx, fy, 0.04); m.renderOrder = 16;
            m.rotation.z = d.to[2] + Math.sin(G.t * 0.7 + d.ph) * 0.06;
            const pulse = i === G.i && G.phase === 'find' && !d.back ? 1 + Math.sin(G.t * 6) * 0.04 : 1; m.scale.set(0.75 * pulse, 0.75 * pulse, 1);
          }
        } else {   // flying home
          d.t = Math.min(1, d.t + dt / (d.dur || 0.9)); const e = d.t * d.t * (3 - 2 * d.t);
          m.position.set(d.from[0] + (d.hx - d.from[0]) * e, d.from[1] + (d.hy - d.from[1]) * e + Math.sin(Math.PI * e) * 0.08, 0.05);
          m.rotation.z = d.to[2] * (1 - e); const s = 0.75 + 0.25 * e; m.scale.set(s, s, 1); m.renderOrder = 18;
          if (d.t >= 1) { d.dur = 0; landed(); }
        }
      });
      // the humming spot's glow
      const showGlow = G.phase === 'find';
      if (showGlow) { const [gx, gy] = B(G.target.p.id === 'forehead' ? G.target.b.cx - 30 : G.target.b.cx, G.target.p.id === 'forehead' ? G.target.b.cy + 40 : G.target.b.cy), s = Math.min(0.3, Math.max(G.target.b.w, G.target.b.h) / 1024 * 1.25) * (1 + Math.sin(G.t * 4.4) * 0.06); G.glow.position.set(gx, gy, 0.025); G.glow.scale.set(s / 0.2, s / 0.2, 1); }
      G.glow.material.opacity += ((showGlow ? 0.55 + Math.sin(G.t * 4.4) * 0.2 + (G.misses >= 3 ? 0.25 : 0) : 0) - G.glow.material.opacity) * Math.min(1, dt * 6);
      if (G.loudT > 0) { G.loudT -= dt; if (G.loudT <= 0 && G.phase === 'find') G.snd.hum(G.target.u, G.target.v, true); }
      if (G.phase === 'scatter' && G.pt > 1.8) { G.phase = 'pause'; G.pt = 0; G.i = 0; }
      if (G.phase === 'pause' && G.pt > (G.i === 0 ? 0.4 : 1.1)) beginPiece();
      if (G.phase === 'find') {
        G.ft += dt;
        if (G.ft > 14 && !G.hinted) { G.hinted = true; G.say('Listen for the hum. ' + G.target.p.say); G.snd.hum(G.target.u, G.target.v, true, 1.8); G.loudT = 2.5; }
        // sonar: while a finger is down, pings speed up as it nears the spot
        if (G.drag) { G.drag.t -= dt; if (G.drag.t <= 0) { const d = Math.hypot(G.drag.x - G.target.b.cx, G.drag.y - G.target.b.cy), near = Math.max(0, 1 - d / 600); G.snd.ping(G.drag.x / 1024, near); G.drag.t = 0.07 + (1 - near) * 0.5; } }
        if (G.bot && G.ft > 1.2 && G.i === 3 && !G.carry) { const m = G.pieces[3]; grab(m.position.x, m.position.y); const [hx, hy] = B(G.target.b.cx, G.target.b.cy); G.botDrag = [hx - G.carry.ox, hy - G.carry.oy]; G.ft = -5; }
        if (G.bot && G.botDrag && G.carry) { const m = G.pieces[3], [tx, ty] = G.botDrag, cx = m.position.x - G.carry.ox, cy = m.position.y - G.carry.oy, k = Math.min(1, dt * 4); carryTo(cx + (tx - cx) * k, cy + (ty - cy) * k); if (Math.hypot(tx - cx, ty - cy) < 0.004) { G.botDrag = null; drop(tx, ty); } }
        if (G.bot && G.ft > 1.2 && G.i !== 3) { if (G.i === 1 && !G.botMissed) { G.botMissed = true; tryAt(G.target.b.cx + 260, G.target.b.cy + 240, true); G.ft = 0.3; } else tryAt(G.target.b.cx, G.target.b.cy, true); }
      }
      if (G.phase === 'party') {
        if (Math.floor(G.pt * 3) !== Math.floor((G.pt - dt) * 3)) { const [x, y] = B(260 + Math.random() * 500, 180 + Math.random() * 640); G.fx.add(x, y, ['#ffc928', '#2aa9a0', '#ff8a3d', '#f2a7a0'][Math.floor(Math.random() * 4)], 14, 0.3); }
        if (G.pt > 4.5) finish();
      }
      if (G.over) {
        G.endT += dt; u.uA.value = Math.max(0, 1 - Math.max(0, G.endT - 3) * 0.4);
        if (!G.artist && G.endT > 2.5) {
          G.snd.fade(0.08, 0.6);
          const back = () => { if (G && !G.sndOff) { G.sndOff = true; G.snd.fade(0.0001, 4); } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.play().catch(() => {}); } catch (e) { G.artist = {}; }
          G.artistSafety = G.endT + 22;
        }
        if (G.artist && !G.sndOff && G.endT > G.artistSafety) { G.sndOff = true; G.snd.fade(0.0001, 4); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || G.phase !== 'find') return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      const x = p.u * 1024, y = p.v * 1024;
      if (kind === 'down') { if (grab(p.x, p.y)) return; if (!tryAt(x, y, false)) G.drag = { x, y, x0: x, y0: y, t: 0 }; }
      else if (kind === 'move' && G.carry) carryTo(p.x, p.y);
      else if (kind === 'move' && G.drag) { G.drag.x = x; G.drag.y = y; }
      else if (kind === 'up' && G.carry) drop(p.x, p.y);
      else if (kind === 'up' && G.drag) { G.drag = null; tryAt(x, y, true); }
    },
    pause() { if (G) { G.paused = true; G.snd.hold(); if (G.artist && G.artist.pause) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; if (!G.sndOff) G.snd.fade(G.over ? 0.08 : 0.9, 0.3); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'still-me', phase: G.phase, playing: G.playing, over: G.over, piece: G.i + 1, home: G.home, taps: G.taps, ready: !!G.ready,
      artist: G.artist && G.artist.currentTime !== undefined ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.snd.stop(); if (G.artist && G.artist.pause) G.artist.pause(); G.artist = null; G.pieces.forEach(m => { m.userData.tex && m.userData.tex.dispose(); m.userData.otex && m.userData.otex.dispose(); }); G.boardTex.dispose(); }
      if (G && G.css) G.css.remove();
      K.cleanup(G); G = null;
    },
  };
}
