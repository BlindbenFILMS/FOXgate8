// GOALBALL IS... (Ricky Ruzicka): BLOCK THE SHOT.
// "Goalball is probably the greatest sport, and not many people have heard of it."
// Goalball is played by ear: every player wears blackout eyeshades, and the ball has bells inside. So is this game.
// You are the defender, kneeling on your goal line at the bottom of the painting. The arena goes quiet ("Quiet please"),
// the whistle blows, and the ball is thrown from the far end. It rolls toward you down the LEFT, the MIDDLE or the RIGHT,
// jingling from its side and getting louder and faster as it comes. Tap that side (three big buttons, or that third of
// the screen) and the defender dives full length that way. If you're lying where the ball arrives: BLOCK! The painting's
// geometric shards flash, the crowd erupts, and the music kicks in until the next throw. If not, it's a goal for them
// (a whistle, the net swishes) and you go again. Block 10 shots to win. The first three are called out so you learn
// the sounds; after that it's all ear, and the shots get faster.
// The defender and the ball are drawn in the painting's own style (goal-things.js). The painting breathes with the
// action: it lunges toward each dive and flashes with colour on every block.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas } from './goal-things.js';

// Ricky in his own words (the 3D gallery's clip for this painting), played at the finale
const ARTIST = new URL('../../../3D/gallery/audio/art_42.mp3', import.meta.url).href;
// Ricky's quote (artworks.js doesn't have it yet; the main chat adds it at merge time)
const QUOTE = '“Goalball is probably the greatest sport, and not many people have heard of it. I found it about four years into the rehabilitation and the new journey of blindness and I was so grateful at the time to be exposed to friends in the community who were thriving and who were so passionate about something.” — Ricky Ruzicka';

const GOAL = 10;                                             // blocks to win
const TOP = { v: 0.15, u: [0.4, 0.5, 0.6] };                 // where each lane starts at the far end (u, v of the painting)
const BOT = { v: 0.8, u: [0.2, 0.5, 0.8] };                  // where each lane reaches your goal line
const DIVE_U = [0.27, 0.5, 0.73], DIVER_V = 0.82;            // where the defender lies for each lane
const FROM = ['From the left!', 'Down the middle!', 'From the right!'];
const BLOCKS = ['Block!', 'Great block!', 'What a save!', 'Stopped it!'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, alive: it lunges toward each dive, and on a block its colour shards flash and shimmer like a kaleidoscope
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uPunch, uDir, uFlash, uA, uLive, uMiss;
vec3 hue(vec3 c, float a){ const vec3 k = vec3(0.57735); float ca = cos(a); return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca); }
void main(){
  vec2 p = vUv;
  vec2 c = vec2(0.5 + uDir * 0.3, 0.2);
  p = c + (p - c) / (1.0 + 0.045 * uPunch);
  // a gentle shimmer across the shards while the ball is live
  p += vec2(sin(p.y * 40.0 + uT * 3.0), cos(p.x * 36.0 + uT * 2.6)) * 0.0012 * uLive;
  vec3 col = texture2D(map, clamp(p, 0.001, 0.999)).rgb;
  // block: the shards spin through the painting's colours for a moment
  float cells = floor(p.x * 9.0) + floor(p.y * 9.0) * 3.0;
  col = mix(col, hue(col, uFlash * (1.5 + 0.6 * sin(cells))), uFlash);
  col *= 1.0 + 0.22 * uFlash;
  // a goal against: the painting dims red for a moment
  col = mix(col, col * vec3(1.0, 0.55, 0.5), uMiss * 0.6);
  // a see-through black veil over the painting, so the ball and the defender stand out (a little darker while the ball is live)
  col *= 1.0 - 0.38 - 0.1 * uLive;
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the band: arena drums, the bells, blocks, whistles, the crowd ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mus = ac.createGain(); mus.gain.value = 0; mus.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest = out) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.004, dest = out } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, dest = out, vib = 0, vibF = 6 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = vibF; lg.gain.value = vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.03); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  // between throws: a bright, bouncing arena groove (A major, like the painting's yellows and teals)
  const BASS = [45, 45, 57, 45, 50, 50, 62, 50, 52, 52, 64, 52, 49, 49, 61, 52];
  const CH = [[69, 73, 76], [74, 78, 81], [76, 80, 83], [73, 76, 81]];
  let next = 0, step = 0, timer = null; const bpm = 124;
  function schedule() {
    const beat = 60 / bpm / 2;
    while (next < ac.currentTime + 0.12) {
      const t = next, s = step % 16, bar = Math.floor(step / 16) % 4;
      tone(t, midi(BASS[s]), beat * 0.85, { type: 'square', vol: 0.03, dest: mus });
      if (s % 4 === 0) tone(t, 130, 0.16, { vol: 0.32, slide: 45, dest: mus });
      if (s % 8 === 4) { noise(t, 0.14, { freq: 2000, q: 0.8, vol: 0.2, dest: mus }); noise(t, 0.05, { freq: 5000, type: 'highpass', vol: 0.06, dest: mus }); }
      if (s % 2 === 1) noise(t, 0.025, { freq: 8000, type: 'highpass', vol: 0.045, dest: mus });
      if (s === 2 || s === 10) CH[bar].forEach(m => tone(t, midi(m), beat * 1.6, { type: 'triangle', vol: 0.025, att: 0.01, dest: mus }));
      next += beat; step++;
    }
  }
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.3); next = ac.currentTime + 0.1; timer = setInterval(schedule, 25); },
    music(v) { mus.gain.setTargetAtTime(v ? 0.85 : 0, ac.currentTime, v ? 0.3 : 0.12); },
    mute(m) { out.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.1); },
    // the bells inside the ball: a little cluster of bright pings from its side
    jingle(p, vol) {
      const t = ac.currentTime + 0.005;
      for (let i = 0; i < 4; i++) { const f = 2600 + Math.random() * 2600; tone(t + i * 0.018 + Math.random() * 0.01, f, 0.09 + Math.random() * 0.06, { vol: 0.035 * vol, p, att: 0.002 }); }
      noise(t, 0.05, { freq: 300, type: 'lowpass', vol: 0.05 * vol, p });   // the rumble of the roll
    },
    whistle() { const t = ac.currentTime + 0.01; tone(t, 2950, 0.32, { vol: 0.07, vib: 90, vibF: 28 }); tone(t, 3100, 0.32, { vol: 0.04, vib: 90, vibF: 28 }); },
    longWhistle() { const t = ac.currentTime + 0.01; [0, 0.38].forEach(d => { tone(t + d, 2950, 0.3, { vol: 0.07, vib: 90, vibF: 28 }); }); },
    thunk(p) { const t = ac.currentTime + 0.01; tone(t, 160, 0.18, { vol: 0.3, slide: 60, p }); noise(t, 0.1, { freq: 400, type: 'lowpass', vol: 0.2, p }); },
    dive(p) { noise(ac.currentTime + 0.005, 0.24, { freq: 500, q: 0.6, vol: 0.22, sweep: 2200, p, att: 0.03 }); const t = ac.currentTime + 0.16; tone(t, 90, 0.2, { vol: 0.32, slide: 45, p }); noise(t, 0.12, { freq: 250, type: 'lowpass', vol: 0.22, p }); },
    block(p, n) {
      const t = ac.currentTime + 0.01;
      tone(t, 110, 0.3, { vol: 0.45, slide: 50, p }); noise(t, 0.2, { freq: 900, q: 0.7, vol: 0.4, p, sweep: 300 });
      for (let i = 0; i < 6; i++) tone(t + i * 0.02, 2800 + Math.random() * 2400, 0.25, { vol: 0.04, p });   // the bells rattle
      [0, 4, 7, 12].forEach((d, i) => tone(t + 0.06 + i * 0.06, midi(69 + d + (n % 3) * 2), 0.5, { type: 'triangle', vol: 0.07 }));
    },
    goal(p) { const t = ac.currentTime + 0.01; noise(t, 0.5, { freq: 3000, q: 0.5, vol: 0.18, p, sweep: 1200 }); [440, 349.2, 293.7].forEach((f, i) => tone(t + 0.3 + i * 0.14, f, 0.35, { type: 'triangle', vol: 0.07 })); },
    // the crowd: a rising cheer (big = louder, longer) or a disappointed "aww"
    cheer(big = 1) { const t = ac.currentTime + 0.05; noise(t, 1.2 + big, { freq: 1100, q: 0.4, vol: 0.18 * big, att: 0.15 }); noise(t + 0.05, 1 + big, { freq: 2400, q: 0.6, vol: 0.08 * big, att: 0.2 }); for (let i = 0; i < 6 * big; i++) noise(t + Math.random() * big, 0.04, { freq: 2500, q: 2, vol: 0.12, p: Math.random() * 2 - 1 }); },
    aww() { const t = ac.currentTime + 0.05; noise(t, 1.1, { freq: 700, q: 1.2, vol: 0.14, sweep: 350, att: 0.12 }); },
    win() { const t = ac.currentTime + 0.05; [69, 73, 76, 81, 85, 88, 93].forEach((m, i) => tone(t + i * 0.09, midi(m), 1.2, { type: 'triangle', vol: 0.06, att: 0.01 })); tone(t + 0.7, midi(45), 1.6, { type: 'sawtooth', vol: 0.05 }); },
    stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} },
  };
}

export function goalBlockGame() {
  let G = null;
  const tex = {};
  const T = k => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 512)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  // where the ball is in lane `lane` when it's `k` of the way to you (0 far end … 1 your goal line)
  const ballAt = (lane, k) => { const e = k * k * 0.35 + k * 0.65; return G.S.P(TOP.u[lane] + (BOT.u[lane] - TOP.u[lane]) * e, TOP.v + (BOT.v - TOP.v) * e); };

  function hud() {
    G.ui.panel('Block the shot', `${G.blocks}<small>of ${GOAL} blocks</small>`, { segs: [G.blocks, GOAL], sub: 'Tap LEFT · MIDDLE · RIGHT' + (G.streak > 1 ? ` · Streak ×${G.streak}` : '') + (G.goals ? ` · Goals let in ${G.goals}` : '') });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; }

  // the next throw: quiet, whistle, the far-end thrower's thunk, and the ball comes
  function prepShot() { setPhase('quiet'); G.band.music(false); G.diverLane = 1; G.diveT = 1; if (G.shots === 0) G.say('Quiet please.'); }
  function throwBall() {
    const n = G.shots++;
    const lane = n < 3 ? [0, 2, 1][n] : (() => { let l = Math.floor(Math.random() * 3); if (l === G.lastLane && Math.random() < 0.6) l = (l + 1 + Math.floor(Math.random() * 2)) % 3; return l; })();
    G.lastLane = lane; G.ball = { lane, k: 0, dur: Math.max(1.55, 3.3 - G.blocks * 0.17), jt: 0, spin: 0 };
    G.band.whistle(); G.band.thunk((lane - 1) * 0.35);
    if (n < 3) G.say(FROM[lane]);
    setPhase('roll');
  }
  function dive(lane) {
    if (!G || !G.playing || G.over) return;
    if (G.phase !== 'roll' && G.phase !== 'quiet') return;
    if (G.cool > 0 || (lane === G.diverLane && G.diveT < 1)) return;
    G.cool = 0.18; G.diveFrom = G.diverLane; G.diverLane = lane; G.diveT = 0; G.punch = 1; G.dir = lane - 1;
    G.band.dive((lane - 1) * 0.8); G.buzz(15);
  }
  function arrive() {
    const b = G.ball, [x, y] = ballAt(b.lane, 1);
    if (G.diverLane === b.lane) {
      G.blocks++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak); G.flash = 1;
      G.band.block((b.lane - 1) * 0.8, G.blocks); G.band.cheer(1); G.buzz([40, 20, 70]);
      pop('block', x, y + 0.05, 0.34); G.fx.add(x, y, '#f5b62a', 24, 0.5); G.fx.add(x, y, '#17a3a6', 14, 0.4);
      G.bounce = { x, y, vx: (Math.random() - 0.5) * 0.5, vy: 0.9 };   // the ball pops back up off the defender
      const line = G.blocks === GOAL ? 'Ten blocks! You are a goalball star!' : G.blocks === 5 ? 'Halfway there!' : G.blocks === GOAL - 1 ? 'One more!' : BLOCKS[(G.blocks - 1) % BLOCKS.length];
      G.say(line);
      G.ui.pop('BLOCK!');
    } else {
      G.goals++; G.streak = 0; G.miss = 1;
      G.band.goal((b.lane - 1) * 0.8); G.band.longWhistle(); G.band.aww(); G.buzz([150, 60, 150]);
      pop('goal', x, y + 0.02, 0.3); G.bounce = null;
      G.ui.alert('GOAL', 'It got past. Listen for the bells.', 1.6, 'black');
      G.say('Goal. Listen for the bells.');
    }
    G.ball.done = true; hud();
    if (G.blocks >= GOAL) { setPhase('win'); G.band.win(); G.band.cheer(2.4); G.ui.alert('YOU ARE A GOALBALL STAR!', 'Ten shots blocked.', 3, 'red'); }
    else setPhase('after');
  }
  function pop(k, x, y, size) { const s = K.sprite(T(k), size, { order: 40 }); s.position.set(x, y, 0.08); s.material.rotation = (Math.random() - 0.5) * 0.3; G.root.add(s); G.pops.push({ s, t: 0, life: 1, size }); }

  return {
    title: 'Block the shot',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, shots: 0, blocks: 0, goals: 0, streak: 0, bestStreak: 0, ball: null, bounce: null, lastLane: 1,
        diverLane: 1, diveFrom: 1, diveT: 1, cool: 0, punch: 0, dir: 0, flash: 0, miss: 0, live: 0, pops: [], endT: 0, artist: null });
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the painting, alive
      G.uni = { map: { value: null }, uT: { value: 0 }, uPunch: { value: 0 }, uDir: { value: 0 }, uFlash: { value: 0 }, uA: { value: 0 }, uLive: { value: 0 }, uMiss: { value: 0 } };
      G.art = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.art.renderOrder = 11; G.art.position.z = 0.02; G.root.add(G.art);
      new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.artOK = true; });
      // the court's tape lines: the two lane lines and your goal line (goalball lines are taped so players can feel them)
      G.court = K.plane(K.canvasTex(512, 512, (g, W, H) => {
        g.lineCap = 'round'; const L = (u0, v0, u1, v1) => { g.beginPath(); g.moveTo(u0 * W, v0 * H); g.lineTo(u1 * W, v1 * H); g.stroke(); };
        for (const [w, c] of [[12, 'rgba(0,0,0,.55)'], [5, 'rgba(255,248,225,.9)']]) {
          g.lineWidth = w; g.strokeStyle = c; g.setLineDash([22, 14]);
          L(0.45, TOP.v, 0.35, BOT.v + 0.08); L(0.55, TOP.v, 0.65, BOT.v + 0.08);
          g.setLineDash([]); L(0.04, BOT.v + 0.1, 0.96, BOT.v + 0.1);
        }
      }), 1, G.h, { order: 12, opacity: 0 });
      G.court.position.z = 0.03; G.root.add(G.court);
      // the ball, its bells' rings, the defender
      G.ballS = K.sprite(T('ball'), 0.06, { order: 25, opacity: 0 }); G.root.add(G.ballS);
      G.ringS = K.sprite(T('rings'), 0.1, { order: 24, opacity: 0 }); G.root.add(G.ringS);
      G.shade = K.sprite(K.glowTex, 0.1, { color: '#000000', order: 23, opacity: 0 }); G.root.add(G.shade);   // a dark halo so the ball stands out on the busy painting
      G.diver = K.sprite(T('diver-mid'), 0.34, { order: 30, opacity: 0 }); G.root.add(G.diver);
      G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'red', aria: 'Dive left', press: () => dive(0) },
        { label: 'Middle', icon: '▼', kind: 'red', aria: 'Stay in the middle', press: () => dive(1) },
        { label: 'Right', icon: '▶', kind: 'red', aria: 'Dive right', press: () => dive(2) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.music(true); setPhase('after'); G.phT = 0.6; };
      K.intro(G, { title: 'Block the shot',
        how: 'Goalball is played by ear. The ball has bells inside. Listen: is it coming from the left, the middle or the right? Tap that side to dive and block it. Block 10 shots!',
        say: 'Block the shot. Goalball is played by ear. The ball has bells inside. Listen. Is it coming from the left, the middle, or the right? Tap that side to dive and block it. Block ten shots!' });
      G.band.start(); G.band.music(true);
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      // the finale: Ricky speaks, the music drops to a soft bed
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.music(false); } }
      G.cool = Math.max(0, G.cool - dt);
      const ph = G.phase;
      if (ph === 'after' && G.phT > (G.shots === 0 ? 1.2 : 2.2)) prepShot();
      else if (ph === 'quiet' && G.phT > (G.shots === 0 ? 1.6 : 0.9)) throwBall();
      else if (ph === 'win' && G.phT > 3.4 && !G.over) {
        const r = K.best('goalball-is:shots', G.shots, 'lower');
        K.finale(G, { won: true, kicker: 'Goalball is...', title: 'What a game!', line: G.work.quote || QUOTE, best: r.isBest, say: 'What a game!',
          cells: [{ k: 'Blocks', v: G.blocks }, { k: 'Shots', v: G.shots }, { k: 'Best streak', v: G.bestStreak }] });
        G.band.music(true);
      }

      // the ball rolling toward you: bigger, louder, faster bells as it comes
      const b = G.ball;
      if (b && !b.done) {
        b.k = Math.min(1, b.k + dt / b.dur);
        const [x, y] = ballAt(b.lane, b.k), size = 0.07 + 0.13 * b.k * b.k;
        b.spin += dt * (4 + b.k * 10);
        G.ballS.position.set(x, y + size * 0.4, 0.06); G.ballS.scale.setScalar(size); G.shade.position.set(x, y + size * 0.4, 0.058); G.shade.scale.setScalar(size * 2.1); G.shade.material.opacity = Math.min(0.75, b.k * 6); G.ballS.material.rotation = -b.spin * (b.lane === 2 ? -1 : 1); G.ballS.material.opacity = Math.min(1, b.k * 8);
        b.jt -= dt; if (b.jt <= 0) { b.jt = 0.24 - b.k * 0.15; G.band.jingle((b.lane - 1) * (0.35 + 0.6 * b.k), 0.35 + b.k * 1.1); G.ring = 1; }
        G.ringS.position.set(x, y + size * 0.4, 0.055); G.ringS.scale.setScalar(size * (1.6 + (1 - G.ring) * 0.7)); G.ringS.material.opacity = G.ring * 0.9;
        if (b.k >= 1) arrive();
      } else if (G.bounce) {
        const o = G.bounce; o.vy -= 2.4 * dt; o.x += o.vx * dt; o.y += o.vy * dt; G.ballS.position.set(o.x, o.y, 0.06); G.ballS.material.rotation += dt * 9; G.ballS.material.opacity = Math.max(0, G.ballS.material.opacity - dt * 0.9);
      } else { G.ballS.material.opacity = Math.max(0, G.ballS.material.opacity - dt * 3); }
      if (!b || b.done) G.shade.material.opacity = Math.max(0, G.shade.material.opacity - dt * 3);
      if (b && b.done) G.ringS.material.opacity = 0;
      G.ring = Math.max(0, (G.ring || 0) - dt * 5);

      // the defender: kneels in the middle; dives full length to the side you tap
      { const d = G.diver; G.diveT = Math.min(1, G.diveT + dt / 0.2);
        const e = G.diveT * G.diveT * (3 - 2 * G.diveT), lane = G.diverLane, [x0, y0] = G.S.P(DIVE_U[G.diveFrom], DIVER_V), [x1, y1] = G.S.P(DIVE_U[lane], DIVER_V + (lane === 1 ? 0 : 0.03));
        d.material.map = T(lane === 0 ? 'diver-left' : lane === 2 ? 'diver-right' : 'diver-mid');
        const hop = Math.sin(e * Math.PI) * 0.04 * (lane === G.diveFrom ? 0 : 1);
        d.position.set(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e + hop + (lane === 1 ? Math.sin(G.t * 3) * 0.004 : 0), 0.065);
        d.scale.setScalar(lane === 1 ? 0.34 : 0.42); d.material.opacity = G.uni.uA.value * (G.over ? Math.max(0, 1 - G.endT) : 1);
        // after each shot he gets back up and kneels in the middle again
        if ((ph === 'after' || ph === 'win') && G.phT > 1.1 && G.diverLane !== 1) { G.diveFrom = G.diverLane; G.diverLane = 1; G.diveT = 0; }
      }

      // the painting, alive
      G.uni.uT.value = G.t;
      G.punch = Math.max(0, G.punch - dt * 4); G.uni.uPunch.value = Math.sin(Math.min(1, G.punch) * Math.PI / 2);
      G.uni.uDir.value += (G.dir - G.uni.uDir.value) * Math.min(1, dt * 10);
      G.flash = Math.max(0, G.flash - dt * 1.4); G.uni.uFlash.value = G.flash;
      G.miss = Math.max(0, G.miss - dt * 1.2); G.uni.uMiss.value = G.miss;
      G.live += ((ph === 'roll' ? 1 : 0) - G.live) * Math.min(1, dt * 3); G.uni.uLive.value = G.live;
      G.uni.uA.value += ((G.artOK && !(G.over && G.endT > 1.2) ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      G.court.material.opacity = G.uni.uA.value * 0.85;
      for (let i = G.pops.length - 1; i >= 0; i--) {
        const p = G.pops[i]; p.t += dt; const k = p.t / p.life;
        p.s.scale.setScalar(p.size * (k < 0.15 ? 0.4 + k / 0.15 * 0.75 : 1.15 - (k - 0.15) * 0.15)); p.s.position.y += dt * 0.04;
        p.s.material.opacity = k < 0.6 ? 1 : Math.max(0, 1 - (k - 0.6) / 0.4);
        if (p.t >= p.life) { G.root.remove(p.s); p.s.material.dispose(); G.pops.splice(i, 1); }
      }

      // the robot: dives the right way once the ball is halfway; guesses wrong on the 4th shot
      if (G.bot && G.playing && !G.over && b && !b.done && ph === 'roll' && b.k > 0.5 && G.diveT >= 1) {
        const want = G.shots === 4 ? (b.lane + 1) % 3 : b.lane;
        if (G.diverLane !== want && G.cool <= 0) dive(want);
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over || kind !== 'down') return;
      dive(G.S.screenThird(ev) + 1);
    },
    pause() { if (G) { G.paused = true; G.band.mute(true); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.mute(false); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'goal-block', phase: G.phase, playing: G.playing, over: G.over, blocks: G.blocks, goals: G.goals, shots: G.shots, lane: G.ball ? G.ball.lane : -1, diver: G.diverLane, artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.artist && G.artist.pause(); } catch (e) {} G.artist = null; try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
