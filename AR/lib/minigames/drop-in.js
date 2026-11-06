// COMFORT IN THE UNCOMFORTABLE (Michael Tubiak): DROP IN.
// "I always say that you can't be successful in life unless you're uncomfortable."
// The tiny mountain biker steps out of the painting (he's cut out: media/games/drop/rider.png, and the trail behind him
// is filled in: trail.jpg) and rides the WHOLE canyon trail toward you, from the far bowl at the top to the finish flag at
// the bottom, growing bigger as he comes closer. Six drops, six runs. At the top edge his heart starts racing (you hear
// it, see the big heart beat, feel it on the phone) and the canyon darkens with fear. TAP the big DROP IN button (or
// anywhere on the screen) and he goes: he plunges, the wind roars, speed lines and dust fly, and the canyon leans in. The
// button turns into BRAKE: he keeps riding unless you hold it. Rocks, logs, cacti and tumbleweeds sit in the trail: each
// one ticks from its side, louder as it gets close, and you steer LEFT or RIGHT around it (or brake to buy time). Hit one
// and he crashes, tumbling into the dust, then gets back up and rides on.
// Every run you finish adds a note to the music, so the song grows with you, and each run is faster with more in the way.
// At the bottom of the sixth run the painting comes alive and Mike says it himself.
// Words show at the BOTTOM of the screen while he rides (so you can see the drop) and at the TOP once he's down at the finish.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './drop-things.js';

const ART = new URL('../../media/games/drop/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
// Mike Tubiak saying it in his own words (the 3D gallery's clip for this painting), played as the painting comes alive
const MIKE = new URL('../../../3D/gallery/audio/wing_4_0.mp3', import.meta.url).href;

// the rider in the 900 × 900 painting: his box (pixels) and the front wheel's contact point inside it
const BOX = { x0: 430, y0: 412, x1: 478, y1: 500, W: 900, H: 900 }, ANCHOR = { lx: 0.625, ly: 0.86 };
const HOME = { u: (BOX.x0 + ANCHOR.lx * (BOX.x1 - BOX.x0)) / BOX.W, v: (BOX.y0 + ANCHOR.ly * (BOX.y1 - BOX.y0)) / BOX.H };
// the trail, from the far bowl at the top down through his own spot to the bottom of the painting (u, v)
const TRAIL = [[0.535, 0.16], [0.52, 0.24], [0.50, 0.31], [0.495, 0.40], [0.505, 0.47], [HOME.u, HOME.v], [0.505, 0.62], [0.485, 0.70], [0.465, 0.78], [0.45, 0.86], [0.44, 0.95]];
const EDGE = 0.06, ROLL = 0.03;                                // the top edge of every run; rolling speed to it (trail per second)
const RUN = [11, 10.5, 10, 9.5, 9, 8.5];                       // seconds to ride the whole trail on each run (faster each time)
const COUNT = [3, 4, 4, 5, 5, 6];                              // things in the way on each run
const LANE = 0.034;                                            // how far one step left or right moves him, at his own size
const KINDS = [
  { kind: 'rock', name: 'Rock' }, { kind: 'log', name: 'Log' }, { kind: 'cactus', name: 'Cactus' }, { kind: 'tumbleweed', name: 'Tumbleweed' },
];
const THROUGH = ['You pushed through!', 'That’s where the growth happens!', 'You pushed through!', 'Growth!', 'That’s where the growth happens!', 'You pushed through!'];

// the trail as a path with even spacing
const SEG = (() => { const L = [0]; for (let i = 1; i < TRAIL.length; i++) L.push(L[i - 1] + Math.hypot(TRAIL[i][0] - TRAIL[i - 1][0], TRAIL[i][1] - TRAIL[i - 1][1])); return L.map(x => x / L[L.length - 1]); })();
function trailAt(p) {
  p = Math.max(0, Math.min(1, p)); let i = 1; while (i < SEG.length - 1 && SEG[i] < p) i++;
  const k = (p - SEG[i - 1]) / (SEG[i] - SEG[i - 1] || 1), a = TRAIL[i - 1], b = TRAIL[i];
  return { u: a[0] + (b[0] - a[0]) * k, v: a[1] + (b[1] - a[1]) * k };
}
// bigger as he comes closer: small in the far bowl, his own size at his spot, big at the bottom
const sizeAt = v => v <= HOME.v ? 0.65 + 0.5 * (v - 0.16) / (HOME.v - 0.16) : 1.15 + 1.85 * (v - HOME.v) / (0.95 - HOME.v);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the canyon (with the rider painted out): it leans in toward him as he rides, shimmers in the heat, and darkens red
// around the edges with every heartbeat when he's scared; it glows warmer with every run he finishes
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform vec2 uC, uShake; uniform float uZoom, uFear, uBeat, uGlow, uT, uA;
void main(){
  vec2 q = uC + (vUv - uC) / (1.0 + uZoom) + uShake;
  q.x += sin(q.y * 70.0 + uT * 2.2) * 0.0007 * (1.0 - q.y);
  vec3 col = texture2D(map, clamp(q, 0.001, 0.999)).rgb;
  float d = length((vUv - 0.5) * vec2(1.0, 1.1));
  float vig = smoothstep(0.28, 0.75, d) * uFear * (0.55 + 0.45 * uBeat);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(l), uFear * 0.25);
  col = mix(col, col * vec3(0.5, 0.18, 0.12), vig);
  col = mix(col, col * 1.08 + vec3(0.04, 0.025, 0.0), uGlow);
  gl_FragColor = vec4(col, uA);
}`;

// this game's own layout additions (the kit's styles stay as they are): a wide middle button, and alerts that can sit low
let cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = `.mgk-btns button.drop-hold{flex:1.9}
  .mgk-alert.drop-low{top:auto;bottom:calc(156px + env(safe-area-inset-bottom))}`;
  document.head.appendChild(s);
}

/* ───────────────────────── the canyon band: wind, gravel, heartbeat and a song that grows ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const pad = ac.createBiquadFilter(); pad.type = 'lowpass'; pad.frequency.value = 900; const padG = ac.createGain(); padG.gain.value = 0.9; pad.connect(padG).connect(out);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const oscs = [];
  // a warm desert drone: A and E, and one more note for every run you finish
  function voice(m, vol, type = 'triangle') {
    const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o.type = type; o.frequency.value = midi(m); g.gain.value = 0; lfo.frequency.value = 0.13 + Math.random() * 0.2; lg.gain.value = vol * 0.35;
    lfo.connect(lg).connect(g.gain); o.connect(g).connect(pad); o.start(); lfo.start();
    g.gain.setTargetAtTime(vol, ac.currentTime, 1.2); oscs.push(o, lfo); return g;
  }
  voice(45, 0.05); voice(52, 0.035);
  const GROW = [57, 60, 64, 67, 69, 76];
  // the wind of the ride: a looping hiss through a filter that opens as he speeds up
  const w = ac.createBufferSource(); w.buffer = nb; w.loop = true;
  const wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.Q.value = 0.7; wf.frequency.value = 400;
  const wg = ac.createGain(); wg.gain.value = 0; const wp = ac.createStereoPanner ? ac.createStereoPanner() : null;
  w.connect(wf).connect(wg); if (wp) { wg.connect(wp).connect(out); } else wg.connect(out); w.start();
  // a soft breeze all the time
  const b = ac.createBufferSource(); b.buffer = nb; b.loop = true; const bf = ac.createBiquadFilter(); bf.type = 'lowpass'; bf.frequency.value = 500; const bg = ac.createGain(); bg.gain.value = 0.025;
  b.connect(bf).connect(bg).connect(out); b.start(); b.playbackRate.value = 0.6;
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.008, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  // each thing in the trail has its own sound: a short cue while it's coming, and a big one if he hits it
  function thing(kind, p, vol = 1, hit = false) {
    const t = ac.currentTime + 0.01, v = vol * (hit ? 1.6 : 1);
    if (kind === 'rock') { tone(t, 620, 0.09, { type: 'square', vol: 0.05 * v, p }); tone(t + 0.07, 520, 0.09, { type: 'square', vol: 0.04 * v, p }); if (hit) noise(t, 0.35, { freq: 500, type: 'lowpass', vol: 0.4, p }); }
    if (kind === 'log') { tone(t, 180, 0.16, { type: 'triangle', vol: 0.16 * v, p, slide: 120 }); noise(t, 0.08, { freq: 900, q: 2, vol: 0.1 * v, p }); if (hit) for (let i = 0; i < 3; i++) noise(t + i * 0.05, 0.05, { freq: 2000 + i * 500, q: 3, vol: 0.25, p }); }
    if (kind === 'cactus') { tone(t, 1900, 0.12, { vol: 0.05 * v, p, slide: 2600 }); tone(t + 0.1, 2300, 0.12, { vol: 0.04 * v, p, slide: 3000 }); if (hit) tone(t, 900, 0.5, { type: 'sawtooth', vol: 0.06, p, slide: 300 }); }
    if (kind === 'tumbleweed') { noise(t, 0.3, { freq: 3500, q: 0.8, vol: 0.09 * v, p, sweep: 5000 }); if (hit) noise(t, 0.6, { freq: 2500, q: 0.6, vol: 0.3, p, sweep: 900 }); }
  }
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.4); },
    thing,
    // lub-dub (pitched high enough for a phone speaker, with a thump)
    beat(loud = 1) {
      const t = ac.currentTime + 0.01;
      tone(t, 120, 0.13, { vol: 0.32 * loud, slide: 60 }); noise(t, 0.06, { freq: 300, type: 'lowpass', vol: 0.2 * loud });
      tone(t + 0.16, 105, 0.12, { vol: 0.22 * loud, slide: 55 }); noise(t + 0.16, 0.05, { freq: 260, type: 'lowpass', vol: 0.14 * loud });
    },
    gravel(p, vol = 1) { noise(ac.currentTime + 0.005, 0.03 + Math.random() * 0.04, { freq: 2200 + Math.random() * 2600, q: 1.6, vol: 0.05 * vol, p }); },
    wind(k, p = 0) { const t = ac.currentTime; wg.gain.setTargetAtTime(0.02 + 0.3 * k, t, 0.08); wf.frequency.setTargetAtTime(400 + 2600 * k, t, 0.1); if (wp) wp.pan.setTargetAtTime(p, t, 0.1); },
    windOff() { wg.gain.setTargetAtTime(0, ac.currentTime, 0.25); },
    edge(p) { const t = ac.currentTime + 0.01; noise(t, 0.5, { freq: 1500, q: 2, vol: 0.08, p }); tone(t, midi(57), 1.2, { type: 'triangle', vol: 0.05, p }); tone(t + 0.1, midi(58), 1.1, { type: 'triangle', vol: 0.04, p }); },
    go(p) { noise(ac.currentTime + 0.01, 0.5, { freq: 600, q: 0.8, vol: 0.18, sweep: 3000, att: 0.08, p }); },
    crash(p) {
      const t = ac.currentTime + 0.01; tone(t, 80, 0.5, { vol: 0.4, slide: 40 }); noise(t, 0.6, { freq: 600, type: 'lowpass', vol: 0.45, p });
      for (let i = 0; i < 5; i++) noise(t + 0.05 + i * 0.07, 0.06, { freq: 2500 + i * 300, q: 2, vol: 0.18, p });
      tone(t + 0.1, 700, 0.5, { type: 'sawtooth', vol: 0.03, slide: 200, p });
    },
    up(p) { const t = ac.currentTime + 0.01; [0, 5, 9].forEach((d, i) => tone(t + i * 0.09, midi(64 + d), 0.4, { type: 'triangle', vol: 0.07, p })); },
    steer(dir) { noise(ac.currentTime + 0.01, 0.16, { freq: 900, q: 0.9, vol: 0.12, sweep: 2400, p: dir * 0.7 }); },
    wall(dir) { tone(ac.currentTime + 0.01, 160, 0.12, { type: 'square', vol: 0.05, p: dir * 0.8 }); noise(ac.currentTime + 0.01, 0.15, { freq: 400, q: 1, vol: 0.12, p: dir * 0.9 }); },
    dodge(p, n) { tone(ac.currentTime + 0.01, midi(76 + (n % 4) * 2), 0.2, { type: 'triangle', vol: 0.07, p }); },
    brake(p) {
      const t = ac.currentTime + 0.01; noise(t, 0.7, { freq: 3500, q: 1.2, vol: 0.22, sweep: 700, p });
      tone(t, 1400, 0.45, { type: 'sawtooth', vol: 0.025, slide: 900, p }); 
    },
    land(p, n) {
      const t = ac.currentTime + 0.01;
      tone(t, 90, 0.35, { vol: 0.35, slide: 45 }); noise(t, 0.4, { freq: 700, type: 'lowpass', vol: 0.3, p });
      noise(t + 0.35, 1.4, { freq: 900, q: 0.5, vol: 0.09, sweep: 350, att: 0.4 });   // the breath out
      [0, 4, 7, 12].forEach((d, i) => tone(t + 0.25 + i * 0.07, midi(69 + d + (n % 3) * 2), 0.9, { type: 'triangle', vol: 0.06, p }));
      if (n < GROW.length) voice(GROW[n], 0.022 + n * 0.002);   // the song grows
      pad.frequency.setTargetAtTime(900 + (n + 1) * 350, ac.currentTime, 0.8);
    },
    finale() { const t = ac.currentTime + 0.1; [57, 61, 64, 69, 73, 76, 81].forEach((m, i) => tone(t + i * 0.13, midi(m), 3.2, { type: 'triangle', vol: 0.05, att: 0.04 })); pad.frequency.setTargetAtTime(4000, ac.currentTime, 1); },
    quiet(v) { padG.gain.setTargetAtTime(v, ac.currentTime, 0.5); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} setTimeout(() => { for (const o of oscs) { try { o.stop(); } catch (e) {} } try { w.stop(); b.stop(); } catch (e) {} }, 400); },
  };
}

export function dropInGame() {
  let G = null;
  const tex = {};
  const thingTex = (k) => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  const panOf = u => Math.max(-1, Math.min(1, (u - 0.5) * 2.4));
  // where he is on the painting (u, v), with his steering
  const riderAt = () => { const a = G.phase === 'intro' ? { u: HOME.u, v: HOME.v } : trailAt(G.p); return { u: a.u + G.laneX * LANE * sizeAt(a.v), v: a.v }; };

  // words go at the bottom of the screen while he rides, and at the top when he's down at the finish line
  function say2(title, sub, secs, kind = 'red') {
    const low = G.p < 0.8 && G.phase !== 'finish';
    G.ui.alert(title, sub, secs, kind + (low ? ' drop-low' : ''));
  }
  function pop(text) { const low = G.p < 0.8; G.ui.pop(text, innerWidth * 0.8, innerHeight * (low ? 0.55 : 0.42)); }

  function hud() {
    const sub = { roll: 'Rolling to the edge…', edge: 'TAP Drop in', ride: 'Steer LEFT / RIGHT · hold BRAKE to slow', crash: 'Crash! Getting back up…', finish: 'The finish line!' }[G.phase] || '';
    G.ui.panel('Drop in', `${G.done}<small>of 6 drops</small>`, { segs: [G.done, 6], sub: sub + (G.crashes ? ` · Crashes ${G.crashes}` : ''), warn: G.phase === 'edge' || G.phase === 'ride' || G.phase === 'crash' });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; hud(); }

  // the big middle button: DROP IN at the edge (one tap and he goes), then BRAKE while he rides (hold it to slow down)
  function press() {
    if (!G || G.over || !G.playing) return;
    if (G.phase === 'edge') { if (G.phT < 0.8) { pop('Wait for it…'); return; } startRide(); return; }
    if ((G.phase === 'ride' || G.phase === 'crash') && !G.braking) { G.braking = true; G.buzz(15); if (G.phase === 'ride' && G.speedK > 0.1) { G.band.brake(panOf(riderAt().u)); pop('Braking'); } }
  }
  function release() { if (G) G.braking = false; }
  function setMid(brake) {
    const b = G.btns && G.btns[1]; if (!b) return;
    const sp = b.querySelectorAll('span'); sp[0].textContent = brake ? 'Brake' : 'Drop in'; if (sp[1]) sp[1].textContent = brake ? '■' : '▼';
    b.classList.toggle('red', !brake);
    b.setAttribute('aria-label', brake ? 'Brake. Hold to slow down.' : 'Drop in. Tap and he goes.');
  }
  function steer(dir) {
    if (!G || !G.playing || G.over) return;
    const to = Math.max(-1, Math.min(1, G.lane + dir));
    if (to === G.lane) { G.band.wall(dir); pop('Edge!'); return; }
    G.lane = to; G.buzz(15); G.band.steer(dir);
  }

  function dust(x, y, s, n = 6, spread = 1) {
    for (let i = 0; i < n; i++) {
      const sp = K.sprite(thingTex('dust'), 0.03 * s, { order: 24, opacity: 0.9 });
      sp.position.set(x + (Math.random() - 0.5) * 0.02 * s * spread, y + Math.random() * 0.01 * s, 0.057); G.root.add(sp);
      G.puffs.push({ sp, vx: (Math.random() - 0.5) * 0.08 * s * spread, vy: (0.02 + Math.random() * 0.05) * s, life: 0.9 + Math.random() * 0.6, max: 1.5, grow: 0.06 * s * (0.6 + Math.random()) });
    }
  }

  // a new run: he pops up at the top of the canyon, and the things for this run are put in the trail
  function newRun() {
    for (const o of G.obs) { G.root.remove(o.s); o.s.material.dispose(); }
    G.obs = []; G.p = 0; G.lane = 0; G.laneX = 0; G.speedK = 0;
    const n = COUNT[G.drop], a = 0.2, b = 0.9;
    for (let i = 0; i < n; i++) {
      const k = KINDS[(G.drop + i) % KINDS.length], q = a + (b - a) * (i + 0.5) / n + (Math.random() - 0.5) * 0.04;
      const lane = [-1, 0, 1][Math.floor(Math.random() * 3)];
      const s = K.sprite(thingTex(k.kind), 0.1, { order: 21, opacity: 0 }); s.position.z = 0.052; G.root.add(s);
      G.obs.push({ ...k, q, lane, s, warned: false, done: false, cue: 0 });
    }
    setPhase('roll');
    if (G.drop > 0) { const at = riderAt(), [x, y] = G.S.P(at.u, at.v); dust(x, y, sizeAt(at.v), 5); }
  }
  function arriveAtEdge() {
    const n = G.drop + 1;
    setPhase('edge'); G.fearT = 0; G.prompt = 5;
    G.band.edge(panOf(riderAt().u));
    say2(n === 6 ? 'The last drop' : `Drop ${n}`, n === 6 ? 'The biggest one. TAP Drop in.' : 'TAP Drop in, and he goes.', 2.2, 'red'); setMid(false);
    G.say(n === 6 ? 'Drop 6. The last drop. The biggest one.' : `Drop ${n}. Here’s the edge.`);
  }
  function startRide() {
    setPhase('ride'); G.speedK = 0.45; G.braking = false; setMid(true);
    G.band.go(panOf(riderAt().u)); G.buzz(40);
    const at = riderAt(), [x, y] = G.S.P(at.u, at.v); dust(x, y, sizeAt(at.v), 5);
  }
  // he hits it: he tumbles over away from it, lies in the dust a moment, then gets back up (see 'crash' in update)
  function crash(o, rel, ox, gy, s) {
    G.crashes++; setPhase('crash'); G.speedK = 0; G.band.windOff();
    G.band.thing(o.kind, rel, 1.4, true); G.band.crash(rel); G.buzz([120, 60, 200]);
    G.fallDir = G.laneX >= o.lane ? -1 : 1; o.fly = -G.fallDir;   // he falls one way, the thing goes flying the other
    dust(ox, gy, s, 14, 2.6); G.fx.add(ox, gy + 0.02 * s, '#ffcf6b', 18, 0.35);
    say2('Crash!', 'He’s OK. He gets back up.', 1.8, 'red'); G.say('Crash! He gets back up.');
  }
  function reachBottom() {
    const n = G.drop; G.done++;
    setPhase('finish'); G.braking = false; setMid(false); G.band.windOff(); G.band.land(panOf(riderAt().u), n); G.buzz([30, 30, 120]);
    const at = riderAt(), s = sizeAt(at.v), [x, y] = G.S.P(at.u, at.v);
    dust(x, y, s, 10, 2.2); G.fx.add(x, y + 0.03 * s, '#ffe2b0', 16, 0.25);
    if (G.done < 6) { say2(THROUGH[n], `${G.done} of 6 drops.`, 2, 'blue'); G.say(THROUGH[n]); }
    else { say2('You made it to the bottom!', 'Comfortable being uncomfortable.', 2.8, 'red'); G.say('You made it to the bottom!'); G.band.finale(); }
    pop('+1');
    G.glow = Math.min(1, G.glow + 0.17);
  }

  return {
    title: 'Drop in',
    start(ctx) {
      if (G) this.stop();
      css();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, p: 0, drop: 0, done: 0, brakeT: 0, crashes: 0, dodged: 0, braking: false, speedK: 0, glow: 0, fear: 0, fearT: 0, bpm: 70, beatPh: 0, beatEnv: 0,
        gravelT: 0, puffs: [], obs: [], lane: 0, laneX: 0, wob: 0, slow: 0, zoom: 0, t0: 0, prompt: 5, fade: 1 });
      G.band = band(K.audio());
      // the canyon with the rider painted out, over the painting
      G.uni = { map: { value: null }, uC: { value: new THREE.Vector2(HOME.u, 1 - HOME.v) }, uShake: { value: new THREE.Vector2() }, uZoom: { value: 0 }, uFear: { value: 0 }, uBeat: { value: 0 }, uGlow: { value: 0 }, uT: { value: 0 }, uA: { value: 0 } };
      G.trail = new THREE.Mesh(new THREE.PlaneGeometry(1.0, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.trail.renderOrder = 11; G.trail.position.z = 0.03; G.root.add(G.trail);
      new THREE.TextureLoader().load(ART + 'trail.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.trailOK = true; });
      // the rider (pivot at his front wheel), his shadow, and a soft glow so he's easy to find
      const bw = (BOX.x1 - BOX.x0) / BOX.W, bh = (BOX.y1 - BOX.y0) / BOX.H * G.h;
      const geo = new THREE.PlaneGeometry(bw, bh); geo.translate(bw * (0.5 - ANCHOR.lx), bh * (ANCHOR.ly - 0.5), 0);
      G.rider = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 })); G.rider.renderOrder = 22; G.rider.position.z = 0.055; G.root.add(G.rider);
      new THREE.TextureLoader().load(ART + 'rider.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.rider.material.map = t; G.rider.material.needsUpdate = true; G.riderOK = true; });
      G.shadow = K.plane(thingTex('shadow'), 1, 1, { order: 20, opacity: 0 }); G.shadow.position.z = 0.05; G.root.add(G.shadow);
      G.halo = K.sprite(K.glowTex, 0.1, { color: '#fff0d0', additive: true, opacity: 0, order: 19 }); G.halo.position.z = 0.048; G.root.add(G.halo);
      G.streak = K.plane(thingTex('streak'), 1, 1, { order: 23, additive: true, opacity: 0 }); G.streak.position.z = 0.058; G.root.add(G.streak);
      // the top edge, the big heart, and the finish flag at the bottom
      G.lip = K.sprite(thingTex('lip'), 0.1, { order: 18, opacity: 0 }); G.lip.position.z = 0.045; G.root.add(G.lip);
      G.heart = K.sprite(thingTex('heart'), 0.16, { order: 30, opacity: 0 }); const [hx, hy] = G.S.P(0.86, 0.13); G.heart.position.set(hx, hy, 0.07); G.root.add(G.heart);
      G.flag = K.sprite(thingTex('flag'), 0.2, { order: 17, opacity: 0 }); const fa = trailAt(0.985), [fx, fy] = G.S.P(fa.u + 0.13, fa.v - 0.07); G.flag.position.set(fx, fy, 0.044); G.root.add(G.flag);
      G.btns = G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'black', aria: 'Steer left', press: () => steer(-1) },
        { label: 'Drop in', icon: '▼', kind: 'red drop-hold', aria: 'Drop in. Tap and he goes.', press, release },
        { label: 'Right', icon: '▶', kind: 'black', aria: 'Steer right', press: () => steer(1) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; newRun(); };
      K.intro(G, { title: 'Drop in',
        how: 'Ride the whole canyon, 6 times. At the edge your heart races: TAP Drop in and he goes. Steer LEFT and RIGHT around what’s in the way. Hold BRAKE to slow down.',
        say: 'Drop in. Mike always says you can’t grow unless you get uncomfortable. Ride the whole canyon, six times. At the top edge, your heart will start to race. Tap Drop in, and he goes. Then the button turns into Brake. Hold Brake to slow down. Rocks and logs are in the trail. Each one makes a sound from its side. Steer left or right around them. If he crashes, he gets back up. Ready? Drop in!' });
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      // once the painting comes alive, Mike says it in his own words
      if (G.over && !G.mikeAu) { G.overT = (G.overT || 0) + dt; if (G.overT > 2.4) { try { G.mikeAu = new Audio(MIKE); G.mikeAu.play().catch(() => {}); } catch (e) {} } }

      // ── the ride ──
      const ph = G.phase;
      if (ph === 'roll') {
        G.p = Math.min(EDGE, G.p + ROLL * dt);
        if (G.p >= EDGE) arriveAtEdge();
      } else if (ph === 'edge') {
        G.fearT += dt;
        if (G.phT > G.prompt) { G.prompt = G.phT + 6; G.say('Tap Drop in.'); say2('Tap Drop in', 'He goes as soon as you tap.', 2, 'red'); }
      } else if (ph === 'ride') {
        // he rides unless you hold BRAKE, picking up speed as he drops in
        if (G.braking) {
          G.speedK = Math.max(0, G.speedK - dt * 2.2); G.brakeT += dt;
          G.skidT = (G.skidT || 0) - dt; if (G.skidT <= 0 && G.speedK > 0.05) { G.skidT = 0.05; G.band.gravel(panOf(riderAt().u), 1.6); }
        } else G.speedK = Math.min(1, G.speedK + dt * 0.8);
        const v = (1 - EDGE) / RUN[G.drop] * G.speedK;
        G.p = Math.min(1, G.p + v * dt);
        G.band.wind(G.speedK, panOf(riderAt().u));
        if (Math.random() < dt * 10 * G.speedK) { const at = riderAt(), [x, y] = G.S.P(at.u, at.v); dust(x, y, sizeAt(at.v), 1, 1.5); }
        if (G.p >= 1) reachBottom();
      } else if (ph === 'crash') {
        if (G.phT > 1.7) { setPhase('ride'); G.speedK = 0.15; G.band.up(panOf(riderAt().u)); say2('Back up!', 'Keep riding.', 1.3, 'blue'); G.say('Back up! Keep riding.'); }
      } else if (ph === 'finish') {
        // he coasts to a stop by the flag; then (after a run) the next run, or (after the sixth) the finale
        if (G.done < 6) {
          if (G.phT > 2.4) G.fade = Math.max(0, G.fade - dt * 3);
          if (G.phT > 2.8) { G.drop++; G.fade = 1; newRun(); }
        } else if (G.phT > 3.2 && !G.over) {
          const r = K.best('comfort-in-the-uncomfortable:drop', G.crashes, 'lower');
          K.finale(G, { won: true, kicker: 'Comfort in the uncomfortable', title: 'You dropped in', line: G.work && G.work.quote, best: r.isBest, say: 'You dropped in! That’s where the growth happens.',
            cells: [{ k: 'Dodged', v: G.dodged }, { k: 'Crashes', v: G.crashes }, { k: 'Braking', v: Math.round(G.brakeT) + 's' }] });
          G.band.quiet(0.35);
        }
      }

      // ── things in the trail: they tick from their side, louder as they come, and he dodges or bumps ──
      G.laneX += (G.lane - G.laneX) * Math.min(1, dt * 7);
      for (const o of G.obs) {
        const a = trailAt(o.q), s = sizeAt(a.v), [ox, gy] = G.S.P(a.u + o.lane * LANE * s, a.v), sz = 0.05 + 0.04 * s;
        if (o.fly) { o.flyT = (o.flyT || 0) + dt; o.s.material.rotation += o.fly * dt * 9; }
        o.s.position.set(ox + (o.fly ? o.fly * o.flyT * 0.25 : 0), gy + sz * 0.3 + (o.fly ? Math.sin(Math.min(1, o.flyT * 2) * Math.PI) * 0.05 : 0), 0.052); o.s.scale.setScalar(sz);
        if (o.fly) {} else if (o.kind === 'tumbleweed') o.s.material.rotation = -G.t * 2.5;
        else if (o.kind === 'cactus') o.s.material.rotation = Math.sin(G.t * 1.6 + o.q * 9) * 0.04;
        const ahead = o.q - G.p, show = o.done ? 0 : ahead < 0.4 ? 1 : 0.0;
        // most things end up right in his way, so you have to steer (decided before it comes into view)
        if (!o.aimed && ahead < 0.42 && G.phase === 'ride') { o.aimed = true; if (Math.random() < 0.8) o.lane = G.lane; }
        o.s.material.opacity += (show - o.s.material.opacity) * Math.min(1, dt * 4);
        o.s.renderOrder = o.q > G.p ? 21 : 23;   // still ahead: behind him; once passed: nearer to us, in front
        if (o.done || G.phase === 'intro') continue;
        const rel = Math.max(-1, Math.min(1, (o.lane - G.lane) * 0.75 + panOf(a.u) * 0.3)), close = Math.max(0, 1 - ahead / 0.25);
        if (G.phase === 'ride' && ahead < 0.25 && ahead > 0) {
          if (!o.warned) { o.warned = true; if (o.lane === G.lane) G.say(`${o.name} ahead!`); }
          o.cue -= dt; if (o.cue <= 0) { o.cue = 0.75 - close * 0.4; G.band.thing(o.kind, rel, 0.4 + close * 0.9); }
        }
        if (G.p >= o.q) {
          o.done = true;
          if (Math.abs(G.laneX - o.lane) < 0.5) {
            crash(o, rel, ox, gy, s);
          } else { G.dodged++; G.band.dodge(rel, G.dodged); G.fx.add(ox, gy + sz * 0.3, '#ffffff', 8, 0.2); pop('Dodged!'); }
          hud();
        }
      }

      // ── fear and the heartbeat ──
      const fearTo = ph === 'edge' ? Math.min(1, 0.45 + G.fearT * 0.14) : ph === 'crash' ? 0.6 : ph === 'ride' ? 0.85 - (G.p - EDGE) * 0.6 : 0;
      G.fear += (fearTo - G.fear) * Math.min(1, dt * (fearTo > G.fear ? 2.5 : 0.9));
      const bpmTo = ph === 'edge' ? Math.min(150, 88 + G.fearT * 16) : ph === 'ride' ? 150 + G.speedK * 15 : ph === 'crash' ? 140 : ph === 'intro' ? 66 : 70;
      G.bpm += (bpmTo - G.bpm) * Math.min(1, dt * (bpmTo > G.bpm ? 3 : 0.6));
      const beating = G.playing && !G.over && !(ph === 'finish' && G.done >= 6);
      if (beating) { G.beatPh += dt * G.bpm / 60; if (G.beatPh >= 1) { G.beatPh -= 1; G.beatEnv = 1; G.band.beat(0.3 + G.fear * 0.7); if (G.fear > 0.4) G.buzz(25); } }
      G.beatEnv = Math.max(0, G.beatEnv - dt * 5);
      G.uni.uFear.value = G.fear; G.uni.uBeat.value = G.beatEnv;
      G.heart.material.opacity += ((beating ? 0.35 + G.fear * 0.65 : 0) - G.heart.material.opacity) * Math.min(1, dt * 4);
      G.heart.scale.setScalar((0.12 + G.fear * 0.06) * (1 + G.beatEnv * 0.22));
      G.glowNow = (G.glowNow || 0) + ((G.over ? 1 : G.glow) - (G.glowNow || 0)) * Math.min(1, dt); G.uni.uGlow.value = G.glowNow;

      // ── the canyon leans in toward him while he rides, and shakes ──
      const at = riderAt(), s = sizeAt(at.v), [x, y] = G.S.P(at.u, at.v);
      G.uni.uC.value.set(at.u, 1 - at.v);
      const zTo = ph === 'ride' ? 0.02 + 0.04 * G.speedK : ph === 'edge' ? 0.015 : 0;
      G.zoom += (zTo - G.zoom) * Math.min(1, dt * (zTo > G.zoom ? 3 : 1.5)); G.uni.uZoom.value = G.zoom;
      const shake = ph === 'ride' ? 0.001 + 0.002 * G.speedK : (ph === 'finish' || ph === 'crash') && G.phT < 0.3 ? 0.007 : 0;
      G.uni.uShake.value.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

      // ── the rider ──
      const ready = G.trailOK && G.riderOK;
      G.uni.uA.value += ((ready && !(G.over && G.overT > 1.5) ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      // during the intro he sits in his own place; when it's time to ride he pops up to the top of the canyon
      if (G.phase !== 'intro' && !G.popped) { G.popped = true; const [px, py] = G.S.P(HOME.u, HOME.v); dust(px, py, 1.15, 6); }
      G.wob = Math.max(0, G.wob - dt * 2.2);
      const bob = ph === 'roll' || ph === 'finish' ? Math.sin(G.t * 9) * 0.0012 * s : 0;
      const jit = ph === 'ride' ? (Math.random() - 0.5) * 0.002 * s : 0;
      const sq = ph === 'finish' && G.phT < 0.25 ? 1 - Math.sin(G.phT / 0.25 * Math.PI) * 0.1 : 1;
      // a crash: he tips over onto his side (pivoting on the wheel), lies there a moment, then stands back up with a little hop
      let fall = 0, hop = 0;
      if (ph === 'crash') {
        const k = Math.min(1, G.phT / 0.35), up = G.phT > 1.1 ? Math.min(1, (G.phT - 1.1) / 0.6) : 0;
        fall = G.fallDir * 1.45 * (1 - Math.pow(1 - k, 3)) * (1 - up * up * (3 - 2 * up));
        hop = up > 0 && up < 1 ? Math.sin(up * Math.PI) * 0.01 * s : 0;
      }
      G.rider.position.set(x + jit * G.speedK + fall * 0.008 * s, y + bob + hop, 0.055); G.rider.scale.set(s / sq * 0.97 + 0.03 * s, s * sq, 1);
      G.rider.rotation.z = fall + (ph === 'crash' ? 0 : (G.laneX - G.lane) * -0.35 + (ph === 'ride' ? Math.sin(G.t * 23) * 0.025 * G.speedK : Math.sin(G.t * 2.2) * 0.02));
      const vis = (G.over && G.overT > 1.5 ? 0 : ready ? 1 : 0) * G.fade;
      G.rider.material.opacity += (vis - G.rider.material.opacity) * Math.min(1, dt * (vis < G.rider.material.opacity ? 8 : 3));
      G.shadow.position.set(x - 0.014 * s, y - 0.003 * s, 0.05); G.shadow.scale.set(0.07 * s, 0.07 * s, 1); G.shadow.material.opacity = G.rider.material.opacity * 0.8;
      const bh = (BOX.y1 - BOX.y0) / BOX.H;
      G.halo.position.set(x, y + bh * 0.4 * s, 0.048); G.halo.scale.setScalar(0.05 + 0.09 * s); G.halo.material.opacity = G.rider.material.opacity * (0.42 + 0.12 * Math.sin(G.t * 3));
      G.streak.position.set(x + (Math.random() - 0.5) * 0.004, y + bh * 0.9 * s, 0.058); G.streak.scale.set(0.11 * s, 0.13 * s, 1);
      G.streak.material.opacity += ((ph === 'ride' ? 0.2 + 0.6 * G.speedK : 0) - G.streak.material.opacity) * Math.min(1, dt * 8);
      // the glowing top edge just ahead of him
      const la = trailAt(EDGE + 0.025), ls = sizeAt(la.v), [lx, ly] = G.S.P(la.u, la.v);
      G.lip.position.set(lx, ly, 0.045); G.lip.scale.setScalar((0.11 + 0.08 * ls) * (1 + (ph === 'edge' ? G.beatEnv * 0.08 : 0)));
      G.lip.material.opacity += ((ph === 'roll' || ph === 'edge' ? 0.95 : 0) - G.lip.material.opacity) * Math.min(1, dt * 5);
      G.flag.material.opacity += ((G.playing && !(G.over && G.overT > 1.5) ? 1 : 0) - G.flag.material.opacity) * Math.min(1, dt * 2);
      G.flag.material.rotation = Math.sin(G.t * 2) * 0.03;
      // gravel under the tyres, from where he is
      if ((ph === 'roll' || ph === 'finish' || ph === 'ride') && G.playing && G.fade > 0.5) { G.gravelT -= dt; if (G.gravelT <= 0) { G.gravelT = (ph === 'ride' ? 0.04 : 0.07) + Math.random() * 0.06; G.band.gravel(panOf(at.u), 0.6 + s * 0.4); } }
      // dust puffs
      for (let i = G.puffs.length - 1; i >= 0; i--) {
        const d = G.puffs[i]; d.life -= dt; d.sp.position.x += d.vx * dt; d.sp.position.y += d.vy * dt; d.vy *= 0.97;
        d.sp.scale.setScalar(d.sp.scale.x + d.grow * dt); d.sp.material.opacity = Math.max(0, Math.min(0.9, d.life / d.max * 1.4));
        if (d.life <= 0) { G.root.remove(d.sp); d.sp.material.dispose(); G.puffs.splice(i, 1); }
      }

      // ── the robot: waits at the edge, holds all the way down, steers around things, and brakes once on run 2 ──
      if (G.bot && G.playing && !G.over) {
        if (ph === 'edge' && G.phT > 1.3) { press(); release(); }
        if (ph === 'ride') { const b = G.drop === 1 && G.phT > 3 && G.phT < 4.2; if (b && !G.braking) press(); if (!b && G.braking) release(); }
        const o = G.obs.find(o => !o.done && o.q - G.p < 0.07 && o.q > G.p);
        if (o && o.lane === G.lane && ph === 'ride' && !(G.drop === 2 && !G.crashes)) steer(G.lane >= 0 ? -1 : 1);   // (lets one crash happen on run 3, to test it)
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'down') press(); else if (kind === 'up') release();
    },
    pause() { if (G) { G.paused = true; G.braking = false; G.band.windOff(); } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'drop', phase: G.phase, playing: G.playing, over: G.over, drop: G.drop, done: G.done, braking: +G.brakeT.toFixed(1), crashes: G.crashes, dodged: G.dodged, lane: G.lane, p: +G.p.toFixed(3), t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.mikeAu && G.mikeAu.pause(); } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
