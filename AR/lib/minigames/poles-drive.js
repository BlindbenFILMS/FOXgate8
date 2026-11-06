// TELEPHONE POLES (Craig Ellis): STRAIGHT AS AN ARROW (polished 5 Nov 2026).
// "I was driving down the highway and all the telephone poles looked like they went straight up and then bent over at
// the top." That's how macular degeneration began for Craig. Here you drive that highway at dusk in his old pickup, with
// his son beside him. The poles sway, and you hear each one whoosh past on your left.
// One thing to do: HOLD Go (or hold anywhere on the painting) to drive; LET GO to stop. Every so often the poles creak
// and bend right over at the top, toward the road and your truck: let go and wait. When they stand up again, drive on.
// Six times, then you're home, the poles stand straight, and your son says: "Those things are straight as an arrow."
// Then Craig tells it in his own words.
import * as THREE from 'three';
import * as K from './kit.js';
import { aboveHud } from './craig-hud.js';
import { truckTex, tailTex, TRUCK_ASPECT } from './poles-things.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ARTIST = new URL('../../../3D/gallery/audio/art_46.mp3', import.meta.url).href;   // Craig, in his own words

const WIRES = 6, SAFE = 0.35;   // how many times the wires come down; how slow is slow enough
const VP = [0.79, 0.625];       // where the road meets the sky

// Every sentence is fixed so Ben can record it once.
const L = {
  intro: 'Straight as an arrow. When Craig’s sight began to change, the telephone poles looked like they bent over at the top. Drive his highway at dusk. Hold the Go button to drive. When the poles bend over the road, let go, and wait. When they stand up, drive on.',
  hold: 'Hold the Go button to drive.',
  down: ['The poles are bending over the road. Let go!', 'Here they come again. Let go.', 'Slow down, Dad!', 'They’re bending again. Ease off.', 'Careful, here they come.', 'Last one. Let go and wait.'],
  up: ['They’re up. Go!', 'Clear. Go!', 'Up again. Go!', 'They’re up. Go!', 'Clear. Go!'],
  left: ['5 to go.', '4 to go.', '3 to go.', '2 to go.', '1 to go.'],
  whoa: 'Whoa! Too fast.',
  home: 'Home. And your son says, Dad, those things are straight as an arrow.',
  end: 'Home safe.',
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting on the move: the road's centre line streams toward you, the grass shimmers in the wind of passing, and
// the telephone poles themselves bend over at the top toward the road and your truck (the near pole and the next one
// really curve, like a cut-out bent along an arc, with the sky painted back in behind them; the far ones sway), and
// the truck's headlights light the road ahead
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uH, uRun, uSpeed, uBendA, uBendB, uBendC, uBeam, uDusk;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
// a soft, blurred sample (for painting the sky back in)
vec3 soft(vec2 p){ vec3 c = vec3(0.0); for (int i = 0; i < 9; i++) { float a = float(i) * 2.399; c += at(p + vec2(cos(a), sin(a)) * 0.016 * sqrt(float(i) + 0.5) / 3.0); } return c / 9.0; }
const vec2 VP = vec2(0.79, 0.625);
// one pole, bent along an arc above its knee. x0: the pole's centre; yb, yt: its foot and top (painting v, 0 at the top);
// knee: how far up it starts to bend (0..1); phi: how far it bends over (radians); hw: half its width; the cross-arm
// band (ay0..ay1, centre acx, half-width ahw). Paints the bent pole into col, and paints soft sky back in where the
// pole used to stand (feathered at the edges, so no boxes show). Returns true if it touched this pixel.
bool bendPole(vec2 p, float x0, float yb, float yt, float knee, float phi, float hw, float ay0, float ay1, float acx, float ahw, inout vec3 col) {
  if (phi < 0.003) return false;
  float Lh = yb - yt, hb = knee * Lh, R = (Lh - hb) / phi;
  vec2 q = vec2(p.x - x0, yb - p.y);                 // local: x toward the road, y up from the foot
  vec2 v = q - vec2(R, hb);
  float a = atan(v.y, -v.x), n = R - length(v), along = hb + a * R;
  bool arm = along > yb - ay1 && along < yb - ay0;
  float c = arm ? acx - x0 : 0.0, w = arm ? ahw : hw;
  if (q.y > hb - 0.002 && a >= 0.0 && a < phi * 1.2 && along < Lh + 0.012 && abs(n - c) < w) { col = at(vec2(x0 + n, yb - along)); return true; }
  if (q.y <= hb) return false;
  float fade = smoothstep(0.0, 0.03, q.y - hb) * smoothstep(0.0, 0.25, phi);   // the bend eases in, and so does the fill
  // where the cross-arm was: soft sky from above and below (only from above, over the pole itself)
  float ex = ahw + 0.016 - abs(p.x - acx), ey = min(p.y - (ay0 - 0.012), (ay1 + 0.012) - p.y);
  if (ex > 0.0 && ey > 0.0) {
    vec3 up = soft(vec2(p.x, ay0 - 0.022)), dn = soft(vec2(p.x, ay1 + 0.022));
    vec3 fill = abs(p.x - x0) < hw + 0.008 ? up : mix(up, dn, clamp((p.y - ay0) / (ay1 - ay0), 0.0, 1.0));
    col = mix(col, fill, fade * smoothstep(0.0, 0.01, ex) * smoothstep(0.0, 0.01, ey)); return true;
  }
  // where the pole was: soft sky from each side
  float e = hw + 0.012 - abs(p.x - x0);
  if (e > 0.0 && p.y > yt - 0.012) {
    vec3 fill = mix(soft(vec2(x0 - hw - 0.02, p.y)), soft(vec2(x0 + hw + 0.02, p.y)), clamp((p.x - x0 + hw) / (2.0 * hw), 0.0, 1.0));
    col = mix(col, fill, fade * smoothstep(0.0, 0.008, e)); return true;
  }
  return false;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the far poles sway over toward the road (the ones beside it bend right, the ones across it bend left)
  float topB = pow(clamp((0.66 - p.y) / 0.2, 0.0, 1.0), 1.6);
  s.x -= uBendB * 0.045 * topB * exp(-pow((p.x - 0.72) / 0.05, 2.0));
  s.x += uBendB * 0.04 * topB * exp(-pow((p.x - 0.91) / 0.04, 2.0));
  // the grass shimmers as you pass
  float grass = smoothstep(0.63, 0.66, p.y) * (1.0 - smoothstep(0.62, 0.7, p.x + (p.y - 0.63) * -0.2));
  s.x += sin(p.y * 120.0 + uRun * 40.0) * 0.004 * uSpeed * grass;
  vec3 col = at(s);
  // the near pole and the next one bend over toward the road
  if (!bendPole(p, 0.197, 0.96, 0.035, 0.24, uBendA, 0.024, 0.04, 0.118, 0.215, 0.118, col))
    bendPole(p, 0.607, 0.70, 0.25, 0.22, uBendC, 0.012, 0.252, 0.35, 0.605, 0.056, col);
  // the road's centre line streams toward you
  float t = (p.y - VP.y) / (1.0 - VP.y);
  if (t > 0.01) {
    float cx = VP.x + (0.985 - VP.x) * t, w = 0.0015 + 0.012 * t;
    float depth = 1.0 / (t + 0.04);
    float dash = step(0.5, fract(depth * 0.9 + uRun * 3.0));
    float on = (1.0 - smoothstep(w * 0.7, w, abs(p.x - cx))) * dash;
    col = mix(col, vec3(1.0, 0.93, 0.62), on * 0.85);
  }
  // dusk falls: a little darker, so the headlights show
  col *= mix(1.0, 0.62, uDusk);
  // headlights: two soft beams on the road ahead
  if (t > 0.02) {
    float cx = VP.x + (0.86 - VP.x) * t;
    float spread = 0.03 + 0.2 * t;
    float beam = exp(-pow((p.x - cx) / spread, 2.0)) * smoothstep(0.02, 0.25, t) * (1.0 - smoothstep(0.6, 0.95, t));
    col += vec3(1.0, 0.92, 0.7) * beam * uBeam * (0.55 + 0.35 * uSpeed);
  }
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the drive: engine, wind, a road-trip groove ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function drive(ac) {
  const bus = ac.createGain(); bus.gain.value = 0;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; bus.connect(lp).connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  // the engine and the wind, always on, following your speed
  const eng = ac.createOscillator(), eg = ac.createGain(), ef = ac.createBiquadFilter(); eng.type = 'sawtooth'; eng.frequency.value = 40; ef.type = 'lowpass'; ef.frequency.value = 300; eg.gain.value = 0;
  eng.connect(ef).connect(eg).connect(fx); eng.start();
  const ws = ac.createBufferSource(), wf = ac.createBiquadFilter(), wg = ac.createGain(); ws.buffer = nb; ws.loop = true; wf.type = 'bandpass'; wf.frequency.value = 600; wf.Q.value = 0.5; wg.gain.value = 0; ws.connect(wf).connect(wg).connect(fx); ws.start();
  // a laid-back road-trip groove
  const CH = [[52, 56, 59, 64], [57, 61, 64, 69], [54, 57, 61, 66], [59, 63, 66, 71]];   // E · A · F#m · B
  const BASS = [40, 45, 42, 47];
  let next = 0, step = 0, timer = null;
  function schedule() {
    const beat = 60 / 92;
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, bar = Math.floor(step / 8) % 4, sw = b8 % 2 ? beat * 0.08 : 0;
      if (b8 === 0) CH[bar].forEach((m, i) => tone(t + i * 0.02, midi(m), beat * 3.6, { type: 'triangle', vol: 0.03, att: 0.03 }));
      if (b8 === 0 || b8 === 4) tone(t, 110, 0.35, { vol: 0.35, slide: 42, att: 0.005 });
      if (b8 === 2 || b8 === 6) noise(t + sw, 0.16, { freq: 1800, q: 0.7, vol: 0.1 });
      noise(t + sw, 0.03, { freq: 7500, type: 'highpass', vol: b8 % 2 ? 0.025 : 0.04 });
      if (b8 % 2 === 0) tone(t + sw, midi(BASS[bar] + (b8 === 6 ? 7 : 0)), beat * 0.8, { type: 'triangle', vol: 0.16 });
      if (b8 === 3 || b8 === 7) tone(t + sw, midi(CH[bar][(step / 2 | 0) % 4] + 12), 0.5, { type: 'square', vol: 0.012 });
      next += beat / 2; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 30); schedule(); bus.gain.setTargetAtTime(0.8, ac.currentTime, 0.5); eg.gain.setTargetAtTime(0.05, ac.currentTime, 0.5); },
    speed(v) { const t = ac.currentTime; eng.frequency.setTargetAtTime(38 + v * 70, t, 0.15); ef.frequency.setTargetAtTime(250 + v * 600, t, 0.15); wg.gain.setTargetAtTime(0.02 + v * 0.1, t, 0.2); wf.frequency.setTargetAtTime(500 + v * 900, t, 0.2); lp.frequency.setTargetAtTime(1600 + v * 2400, t, 0.3); },
    creak() { const t = ac.currentTime + 0.02; tone(t, 160, 1.2, { type: 'sawtooth', vol: 0.04, slide: 110, att: 0.3, p: -0.5, out: fx }); noise(t, 1.2, { freq: 600, q: 6, vol: 0.08, sweep: 300, att: 0.3, p: -0.5, out: fx }); },
    hum(on) { if (on) { tone(ac.currentTime + 0.02, 120, 3.2, { type: 'square', vol: 0.025, att: 0.3, out: fx, p: 0.5 }); tone(ac.currentTime + 0.02, 180, 3.2, { type: 'sine', vol: 0.03, att: 0.3, out: fx, p: 0.5 }); } },
    zap() { const t = ac.currentTime + 0.01; noise(t, 0.3, { freq: 3000, q: 0.5, vol: 0.25, out: fx }); tone(t, 900, 0.3, { type: 'square', vol: 0.04, slide: 120, out: fx }); },
    brakes() { noise(ac.currentTime + 0.01, 0.6, { freq: 2600, q: 5, vol: 0.06, out: fx, sweep: 1800 }); },
    clear() { const t = ac.currentTime + 0.02; [64, 68, 71, 76].forEach((m, i) => tone(t + i * 0.07, midi(m), 0.8, { type: 'triangle', vol: 0.05, out: fx })); },
    straight() { const t = ac.currentTime + 0.02; [76, 83, 88].forEach((m, i) => tone(t + i * 0.05, midi(m), 1.6, { type: 'sine', vol: 0.05, out: fx })); noise(t, 0.8, { freq: 4000, q: 0.6, vol: 0.05, sweep: 9000, att: 0.2, out: fx }); },
    home() { const t = ac.currentTime + 0.1; [52, 59, 64, 68, 71, 76].forEach((m, i) => tone(t + i * 0.15, midi(m), 3.5, { type: 'triangle', vol: 0.05, att: 0.05, out: fx })); },
    whoosh(v) { noise(ac.currentTime + 0.01, 0.35, { freq: 500 + v * 700, q: 0.8, vol: 0.05 + v * 0.1, p: -0.75, out: fx, sweep: 220, att: 0.04 }); },
    master(v, secs = 0.3) { bus.gain.setTargetAtTime(0.8 * v, ac.currentTime, secs); fx.gain.setTargetAtTime(v, ac.currentTime, secs); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.2); },
    stop() { clearInterval(timer); timer = null; try { eng.stop(); ws.stop(); } catch (e) {} try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function straightAsAnArrowGame() {
  let G = null;
  const busy = () => !G.bot && G.say.busy && G.say.busy();

  // the wires come down across the road
  function wiresDown() {
    G.wire = { t: 0, down: 3.8, hit: false }; G.drive.creak(); G.drive.hum(true);
    G.say(L.down[G.wi % 6]);
    G.ui.alert('Let go', 'The poles are bending over the road', 2, 'red'); G.buzz([60, 40, 60]);
  }
  function wiresUp() {
    const w = G.wire; G.wire = null; G.wi++;
    if (!w.hit) { G.clean++; G.drive.clear(); G.ui.alert('Nice and easy!', '', 1.2, 'blue'); }
    G.ui.panel('Poles passed', `${G.wi} <small>of ${WIRES}</small>`, { segs: [G.wi, WIRES] });
    if (G.wi >= WIRES) { G.phase = 'home'; G.homeT = 0; G.drive.home(); G.say(L.home); G.ui.buttons([]); G.hold = 0; G.touch = 0; }
    else { G.say(`${L.up[G.wi - 1]} ${L.left[G.wi - 1]}`); G.next = 5 + Math.random() * 2; }
  }
  function finish() {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Straight as an arrow', title: 'Home safe', line: G.work && G.work.quote,
      cells: [{ k: 'Slowed in time', v: `${G.clean}/${WIRES}` }, { k: 'Miles', v: Math.round(G.miles) }], say: L.end });
    G.overT = 0;
  }
  function buttons() {
    const el = G.ui.buttons([{ label: 'Hold to go', icon: '▲', kind: 'red', aria: 'Hold to drive; let go to stop', press: () => { if (G) G.hold = 1; }, release: () => { if (G) G.hold = 0; } }]);
    if (el) el.forEach(b => Object.assign(b.style, { height: '72px', fontSize: '22px' }));
  }

  return {
    title: 'Straight as an arrow',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      G.hud = aboveHud(G);   // the score panel and pop-ups sit above the painting, as wide as it
      Object.assign(G, { phase: 'intro', speed: 0, run: 0, miles: 0, hold: 0, touch: 0, wire: null, wi: 0, clean: 0, next: 6, sag: 0, bendA: 0, bendB: 0, straight: 0,
        homeT: 0, idleT: 0, roadT: 0.71, hinted: 0, poleRun: 0, overT: 0, artist: null, musicBack: false, brakeT: 0 });
      G.drive = drive(K.audio());
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRun: { value: 0 }, uSpeed: { value: 0 }, uBendA: { value: 0 }, uBendB: { value: 0 }, uBendC: { value: 0 }, uBeam: { value: 1 }, uDusk: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // Craig's pickup, and its tail lights
      G.W = 0.3; G.car = K.sprite(truckTex, 1, { order: 22 }); G.car.scale.set(G.W, G.W * TRUCK_ASPECT, 1); G.root.add(G.car);
      G.tails = [0, 1].map(() => { const s = K.sprite(tailTex, 0.07, { additive: true, order: 23 }); G.root.add(s); return s; });
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.onGo = () => {
        G.phase = 'drive'; G.drive.start(); buttons();
        G.ui.panel('Poles passed', `0 <small>of ${WIRES}</small>`, { segs: [0, WIRES] });
      };
      K.intro(G, { title: 'Straight as an arrow', how: 'Hold Go to drive. When the poles bend over the road, let go and wait. When they stand up, drive on.', say: L.intro });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.hud.update();
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // how fast you want to go: holding Go (or the painting) drives, letting go stops
      let want = (G.hold || G.touch) ? 1 : 0;
      if (G.bot) want = G.wire && G.wi !== 2 ? 0 : 1;   // the robot drives through the third wires once, to show what happens
      if (G.phase !== 'drive') want = 0;
      const before = G.speed;
      G.speed += (want - G.speed) * Math.min(1, dt * (want < G.speed ? 2.2 : 0.9));
      if (before - G.speed > dt * 0.45 && G.speed > 0.2) { G.brakeT += dt; if (G.brakeT > 0.25) { G.brakeT = -1.5; G.drive.brakes(); } }
      G.run += dt * G.speed * 0.6; G.miles += dt * G.speed * 1.2;
      u.uRun.value = G.run; u.uSpeed.value = G.speed; G.drive.speed(G.speed);
      u.uDusk.value = Math.min(0.5, 0.2 + G.t / 60);
      // each pole whooshes past on your left: faster when you drive faster
      G.poleRun += dt * G.speed * 1.4; if (G.poleRun >= 1) { G.poleRun -= 1; if (G.phase === 'drive') G.drive.whoosh(G.speed); }
      // a nudge if you haven't started driving
      if (G.phase === 'drive' && !G.wire && G.speed < 0.1) { G.idleT += dt; if (G.idleT > 5 && G.hinted < 2 && !busy()) { G.idleT = 0; G.hinted++; G.say(L.hold); } } else G.idleT = 0;
      // the poles sway and bend over at the top, more when the wires come down; at home they stand straight
      G.sag += ((G.wire && G.wire.t < G.wire.down ? 1 : 0) - G.sag) * Math.min(1, dt * (G.wire ? 1.4 : 2.2));
      if (G.phase === 'home' || G.phase === 'done') G.straight = Math.min(1, G.straight + dt * 0.8);
      const k = 1 - G.straight * G.straight * (3 - 2 * G.straight);
      const sway = 0.5 + 0.5 * Math.sin(G.t * 0.7);
      G.bendA = (0.12 + 0.14 * sway + 1.5 * G.sag) * k; G.bendC = (0.14 + 0.12 * Math.sin(G.t * 0.55 + 1) + 1.35 * G.sag) * k; G.bendB = (0.4 + 0.3 * Math.sin(G.t * 0.6 + 1) + 0.6 * G.sag) * k;
      u.uBendA.value = G.bendA; u.uBendB.value = G.bendB; u.uBendC.value = G.bendC;
      // the wires
      if (G.phase === 'drive') {
        if (!G.wire) { G.next -= dt; if (G.next <= 0 && !busy()) wiresDown(); }
        else {
          const w = G.wire; w.t += dt;
          // too fast while they're down: a zap and a jolt (no crash, just a scare)
          if (w.t > 1.8 && w.t < w.down && G.speed > SAFE && !w.hit) { w.hit = true; G.drive.zap(); G.speed *= 0.3; G.buzz([120]); G.ui.alert('Whoa!', 'Let go when the poles bend', 2, 'black'); G.say(L.whoa); }
          if (w.t > w.down + 0.8) wiresUp();
        }
      }
      if (G.phase === 'home') { G.homeT += dt; if (G.homeT > 1.6 && !G.snapped) { G.snapped = true; G.drive.straight(); } if (G.homeT > 4 && !busy()) finish(); }
      // the truck bobs on the road; tail lights brighten when you slow
      // along the road: t = 1 at the bottom of the painting, 0 where the road meets the sky. Back = 0.71, ahead = 0.42.
      G.roadT += ((0.71 - 0.29 * G.speed) - G.roadT) * Math.min(1, dt * 1.2);
      const rt = G.roadT, sc = rt / 0.71;
      G.W = 0.3 * sc; G.car.scale.set(G.W, G.W * TRUCK_ASPECT, 1);
      const [cx, cy] = G.S.P(VP[0] + 0.042 * rt, VP[1] + (1 - VP[1]) * rt - 0.0); G.car.position.set(cx, cy + Math.sin(G.t * 9) * 0.002 * G.speed * sc, 0.06);
      const brake = Math.max(0, Math.min(1, (want < G.speed - 0.05 ? 1 : 0) + (G.speed < 0.1 ? 0.5 : 0)));
      G.tails.forEach((s, i) => { s.position.set(cx + (i ? 1 : -1) * G.W * 0.37, cy - G.W * TRUCK_ASPECT * 0.12, 0.065); s.scale.setScalar(0.07 * sc); s.material.opacity = 0.35 + 0.65 * brake; });

      // the finale: Craig in his own words, the music soft beneath him
      if (G.over) {
        G.overT += dt;
        if (G.overT > 2.5 && !G.artist && !busy()) {
          G.drive.master(0.25, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.drive.master(0.7, 2); } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.onerror = back; G.artist.play().catch(back); } catch (e) { G.artist = { pause() {} }; back(); }
          G.clipSafety = G.overT + 29;
        }
        if (G.artist && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.drive.master(0.7, 2); }
      }
      G.hud.update();
    },
    // hold anywhere on the painting to drive, too
    pointer(kind) {
      if (!G || G.phase !== 'drive') { if (G) G.touch = 0; return; }
      if (kind === 'down') G.touch = 1;
      if (kind === 'up') G.touch = 0;
    },
    pause() { if (G) { G.paused = true; G.hold = G.touch = 0; G.drive.volume(0); if (G.artist) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; G.drive.volume(0.8); if (G.artist && !G.musicBack) G.drive.master(0.25, 0.3); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'poles', playing: G.playing, over: G.over, phase: G.phase, speed: +G.speed.toFixed(2), wire: !!G.wire, sag: +G.sag.toFixed(2), wi: G.wi, clean: G.clean, straight: +G.straight.toFixed(2),
      artist: !!(G.artist && G.artist.currentTime > 0), artistT: G.artist ? +(G.artist.currentTime || 0).toFixed(1) : 0, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.hud) G.hud.remove(); if (G) { G.drive.stop(); if (G.artist) { try { G.artist.pause(); } catch (e) {} G.artist = null; } } K.cleanup(G); G = null; },
  };
}
