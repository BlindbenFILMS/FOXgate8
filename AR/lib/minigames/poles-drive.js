// TELEPHONE POLES (Craig Ellis): STRAIGHT AS AN ARROW.
// "I was driving down the highway and all the telephone poles looked like they went straight up and then bent over at
// the top." That's how macular degeneration began for Craig. Here you drive that highway at dusk, headlights glowing.
// The poles sway and bend over at the top like puppets, and every so often their wires droop right down across the road.
// One thing to do: tilt the phone forward to speed up, back to slow down (or hold Go). When the wires come down, slow
// down and wait for them to lift; when they're up, go. Six stretches of wire, then you're home, and your son reminds you:
// "Those things are straight as an arrow."
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const WIRES = 6, SAFE = 0.35;   // how many times the wires come down; how slow is slow enough
const VP = [0.79, 0.625];       // where the road meets the sky

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting on the move: the road's centre line streams toward you, the grass shimmers in the wind of passing, the
// poles bend over at the top (the near one and the row along the road), a wire droops right down across the road and
// lifts again, and the car's headlights light the road ahead
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uH, uRun, uSpeed, uBendA, uBendB, uSag, uBeam, uDusk;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 VP = vec2(0.79, 0.625);
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the poles bend over at the top: the near one (and its wires), and the row along the road
  float topA = pow(clamp((0.8 - p.y) / 0.78, 0.0, 1.0), 2.0);
  s.x -= uBendA * 0.13 * topA * exp(-pow((p.x - 0.2) / 0.13, 2.0));
  float topB = pow(clamp((0.66 - p.y) / 0.42, 0.0, 1.0), 2.0);
  s.x -= uBendB * 0.07 * topB * exp(-pow((p.x - 0.66) / 0.12, 2.0));
  // the grass shimmers as you pass
  float grass = smoothstep(0.63, 0.66, p.y) * (1.0 - smoothstep(0.62, 0.7, p.x + (p.y - 0.63) * -0.2));
  s.x += sin(p.y * 120.0 + uRun * 40.0) * 0.004 * uSpeed * grass;
  vec3 col = at(s);
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
  // the wire: from the pole across the road, drooping right down into it, then lifting away
  float sag = uSag;
  vec2 a = vec2(0.615, 0.27), b = vec2(1.05, 0.22);
  float f = (p.x - a.x) / (b.x - a.x);
  if (f > 0.0 && f < 1.0) {
    float y = mix(a.y, b.y, f) + sag * 0.62 * sin(f * 3.14159) + sin(uT * 3.0 + f * 9.0) * 0.004 * sag;
    float d = abs(p.y - y);
    col = mix(col, vec3(0.08, 0.05, 0.05), 1.0 - smoothstep(0.003, 0.0055, d));
    col += vec3(1.0, 0.45, 0.15) * exp(-d * 140.0) * 0.8 * sag * (0.6 + 0.4 * sin(uT * 18.0));
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
    creak() { const t = ac.currentTime + 0.02; tone(t, 160, 1.2, { type: 'sawtooth', vol: 0.03, slide: 110, att: 0.3, p: 0.4 }); noise(t, 1.2, { freq: 600, q: 6, vol: 0.06, sweep: 300, att: 0.3, p: 0.4 }); },
    hum(on) { if (on) tone(ac.currentTime + 0.02, 120, 2.2, { type: 'square', vol: 0.02, att: 0.3, out: fx, p: 0.3 }); },
    zap() { const t = ac.currentTime + 0.01; noise(t, 0.3, { freq: 3000, q: 0.5, vol: 0.25, out: fx }); tone(t, 900, 0.3, { type: 'square', vol: 0.04, slide: 120, out: fx }); },
    brakes() { noise(ac.currentTime + 0.01, 0.6, { freq: 2600, q: 5, vol: 0.06, out: fx, sweep: 1800 }); },
    clear() { const t = ac.currentTime + 0.02; [64, 68, 71, 76].forEach((m, i) => tone(t + i * 0.07, midi(m), 0.8, { type: 'triangle', vol: 0.05, out: fx })); },
    home() { const t = ac.currentTime + 0.1; [52, 59, 64, 68, 71, 76].forEach((m, i) => tone(t + i * 0.15, midi(m), 3.5, { type: 'triangle', vol: 0.05, att: 0.05, out: fx })); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.2); },
    stop() { clearInterval(timer); timer = null; try { eng.stop(); ws.stop(); } catch (e) {} try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

// the car, seen from behind, with tail lights that brighten when you slow down
function carTex() {
  return K.canvasTex(256, 160, (g) => {
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(128, 148, 112, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d2230';
    g.beginPath(); g.moveTo(40, 140); g.lineTo(36, 92); g.quadraticCurveTo(40, 78, 62, 74); g.lineTo(84, 40); g.quadraticCurveTo(128, 30, 172, 40); g.lineTo(194, 74); g.quadraticCurveTo(216, 78, 220, 92); g.lineTo(216, 140); g.closePath(); g.fill();
    g.fillStyle = '#4a5a78'; g.beginPath(); g.moveTo(92, 46); g.quadraticCurveTo(128, 38, 164, 46); g.lineTo(180, 72); g.lineTo(76, 72); g.closePath(); g.fill();
    g.fillStyle = '#0d1018'; g.fillRect(46, 132, 30, 14); g.fillRect(180, 132, 30, 14);
    g.fillStyle = '#c9ccd4'; g.fillRect(100, 104, 56, 16);
  });
}
function tailTex() { return K.canvasTex(64, 32, (g) => { const r = g.createRadialGradient(32, 16, 0, 32, 16, 30); r.addColorStop(0, 'rgba(255,60,40,1)'); r.addColorStop(0.4, 'rgba(255,30,20,.6)'); r.addColorStop(1, 'rgba(255,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 32); }); }

export function straightAsAnArrowGame() {
  let G = null;

  /* ── tilt forward and back (works on iPhone and Android) ── */
  function sensors() {
    const M = G.mot = { ok: false, g: [0, 0, 0], s: 0, pitch: 0, p0: null, n: 0 };
    const on = (ev) => {
      const a = ev.accelerationIncludingGravity; if (!a || a.x == null) return;
      M.ok = true; M.n++;
      const ang = (((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
      const x = a.x * ca - a.y * sa, y = a.x * sa + a.y * ca, z = a.z || 0, k = M.n < 4 ? 1 : 0.2;
      M.g[0] += (x - M.g[0]) * k; M.g[1] += (y - M.g[1]) * k; M.g[2] += (z - M.g[2]) * k;
      const [, gy, gz] = M.g;
      if (Math.abs(gy) > 5) M.s = Math.sign(gy); else if (!M.s && Math.abs(gz) > 5) M.s = Math.sign(gz);
      const s = M.s || 1; M.pitch = (Math.atan2(s * gz, s * gy) * 180) / Math.PI;   // + = top of the phone tipped away from you
    };
    addEventListener('devicemotion', on); G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}
  }

  // the wires come down across the road
  function wiresDown() {
    G.wire = { t: 0, down: 3.2, warned: false, hit: false }; G.drive.creak(); G.drive.hum(true);
    G.say(['The wires are bending down into the road. Slow down!', 'Here they come again. Easy.', 'Slow down, Dad!', 'Wires down. Ease off.', 'Careful, they’re drooping again.', 'Last one. Slow and steady.'][G.wi % 6]);
    G.ui.alert('Slow down', 'The wires are in the road', 2, 'red'); G.buzz([60, 40, 60]);
  }
  function wiresUp() {
    const w = G.wire; G.wire = null; G.wi++;
    if (!w.hit) { G.clean++; G.drive.clear(); G.say(['They’re up. Go!', 'Clear. Go!', 'Up again. Go!'][G.wi % 3]); G.ui.pop('Nice and easy!'); }
    else G.say('Up again. Go!');
    G.ui.panel('Straight as an arrow', `${G.wi} <small>of ${WIRES} · slowed in time</small> ${G.clean}`, { segs: [G.wi, WIRES] });
    if (G.wi >= WIRES) { G.phase = 'home'; G.homeT = 0; G.drive.home(); G.say('Home. And your son says, Dad, those things are straight as an arrow.'); G.ui.buttons([]); }
    else G.next = 5 + Math.random() * 2;
  }
  function finish() {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Straight as an arrow', title: 'Home safe', line: G.work && G.work.quote,
      cells: [{ k: 'Slowed in time', v: `${G.clean}/${WIRES}` }, { k: 'Miles', v: Math.round(G.miles) }],
      say: 'Home safe. ' + ((G.work && G.work.quote) || '') });
  }
  function buttons() {
    const el = G.ui.buttons([{ label: 'Hold to go', icon: '▲', kind: 'red', aria: 'Hold to drive faster; let go to slow down', press: () => {} }]);
    if (el) el.forEach(b => {
      const on = () => { G.hold = 1; }, off = () => { if (G) G.hold = 0; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
  }

  return {
    title: 'Straight as an arrow',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', speed: 0, run: 0, miles: 0, hold: 0, drag: null, wire: null, wi: 0, clean: 0, next: 6, sag: 0, bendA: 0, bendB: 0, homeT: 0, used: false });
      G.drive = drive(K.audio());
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uRun: { value: 0 }, uSpeed: { value: 0 }, uBendA: { value: 0 }, uBendB: { value: 0 }, uSag: { value: 0 }, uBeam: { value: 1 }, uDusk: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the car, and its tail lights
      G.car = K.sprite(carTex(), 0.26, { order: 22 }); G.car.scale.set(0.26, 0.26 * 160 / 256, 1); G.root.add(G.car);
      const tt = tailTex(); G.tails = [0, 1].map(() => { const s = K.sprite(tt, 0.05, { additive: true, order: 23 }); s.scale.set(0.05, 0.025, 1); G.root.add(s); return s; });
      sensors();
      G.onGo = () => {
        G.phase = 'drive'; G.drive.start(); buttons(); if (G.mot && G.mot.ok) G.mot.p0 = G.mot.pitch;
        G.ui.panel('Straight as an arrow', `0 <small>of ${WIRES}</small>`, { segs: [0, WIRES] });
      };
      K.intro(G, { title: 'Straight as an arrow', how: 'Tilt your phone forward to speed up, back to slow down (or hold Go). When the wires bend down into the road, slow down. When they lift, go.',
        say: 'Straight as an arrow. When Craig’s sight began to change, the telephone poles looked like they went straight up, then bent over at the top. Drive his highway at dusk. Tilt your phone forward to speed up, and back to slow down. Or hold the Go button. When the wires bend down into the road, slow down, and wait for them to lift. Then go.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // how fast you want to go: tilt, the Go button, or a drag up and down
      let want = G.phase === 'drive' ? 0.15 : 0;
      if (G.mot && G.mot.ok && G.mot.p0 != null) { const d = G.mot.pitch - G.mot.p0; if (Math.abs(d) > 3) G.used = true; want = Math.max(0, Math.min(1, 0.4 + d / 25)); }
      if (G.hold) want = 1;
      if (G.drag) want = G.drag.want;
      if (G.bot) want = G.wire ? 0.05 : 0.9;
      if (G.phase !== 'drive') want = G.phase === 'home' ? 0 : want;
      const before = G.speed;
      G.speed += (want - G.speed) * Math.min(1, dt * (want < G.speed ? 1.6 : 0.9));
      if (before - G.speed > dt * 0.45 && G.speed > 0.2) { G.brakeT = (G.brakeT || 0) + dt; if (G.brakeT > 0.25) { G.brakeT = -1.5; G.drive.brakes(); } }
      G.run += dt * G.speed * 0.6; G.miles += dt * G.speed * 1.2;
      u.uRun.value = G.run; u.uSpeed.value = G.speed; G.drive.speed(G.speed);
      u.uDusk.value = Math.min(0.5, 0.2 + G.t / 60);
      // the poles sway and bend over at the top, more when the wires come down
      G.sag += ((G.wire && G.wire.t < G.wire.down ? 1 : 0) - G.sag) * Math.min(1, dt * 1.8); u.uSag.value = G.sag;
      G.bendA = 0.35 + 0.25 * Math.sin(G.t * 0.8) + 0.5 * G.sag; G.bendB = 0.3 + 0.3 * Math.sin(G.t * 0.6 + 1) + 0.6 * G.sag;
      u.uBendA.value = G.bendA; u.uBendB.value = G.bendB;
      // the wires
      if (G.phase === 'drive') {
        if (!G.wire) { G.next -= dt; if (G.next <= 0) wiresDown(); }
        else {
          const w = G.wire; w.t += dt;
          // too fast while they're down: a zap and a jolt (no crash, just a scare)
          if (w.t > 1.0 && w.t < w.down && G.speed > SAFE && !w.hit) { w.hit = true; G.drive.zap(); G.speed *= 0.3; G.buzz([120]); G.ui.alert('Whoa!', 'Too fast under the wires. Slow down when they bend.', 2, 'black'); G.say('Whoa! Too fast.'); }
          if (w.t > w.down + 0.8) wiresUp();
        }
      }
      if (G.phase === 'home') { G.homeT += dt; if (G.homeT > 6) finish(); }
      // the car bobs on the road; tail lights brighten when you slow
      const [cx, cy] = G.S.P(0.86, 0.885); G.car.position.set(cx, cy + Math.sin(G.t * 9) * 0.002 * G.speed, 0.06);
      const brake = Math.max(0, Math.min(1, (want < G.speed - 0.05 ? 1 : 0) + (G.speed < 0.1 ? 0.6 : 0)));
      G.tails.forEach((s, i) => { s.position.set(cx + (i ? 0.09 : -0.09), cy - 0.002, 0.065); s.material.opacity = 0.45 + 0.55 * brake; });
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'drive') return;
      if (kind === 'down') G.drag = { y0: ev.clientY, want: G.speed };
      if (kind === 'move' && G.drag) G.drag.want = Math.max(0, Math.min(1, 0.4 + (G.drag.y0 - ev.clientY) / (innerHeight * 0.3)));
      if (kind === 'up') G.drag = null;
    },
    pause() { if (G) { G.paused = true; G.drive.volume(0); } },
    resume() { if (G) { G.paused = false; G.drive.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'poles', playing: G.playing, over: G.over, phase: G.phase, speed: +G.speed.toFixed(2), wire: !!G.wire, sag: +G.sag.toFixed(2), wi: G.wi, clean: G.clean, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.drive.stop(); G.offMotion && G.offMotion(); } K.cleanup(G); G = null; },
  };
}
