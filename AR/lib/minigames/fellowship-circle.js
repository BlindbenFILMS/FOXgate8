// FELLOWSHIP (Nikki Jeffords): GATHER THE CIRCLE.
// "There is a sacred brotherhood, sisterhood in the blind community." The fellowship has drifted apart: the painting
// starts faded to soft gray, its people gone pale. One at a time, a friend (a drawn watercolour figure, in the colours
// of someone in the painting: fellowship-things.js) drifts in from the LEFT, the RIGHT or from FAR away (the middle),
// humming "Hey, it's me" from that side, louder as they come closer. Press the button for their side (or tap them):
// they glide home to their place in the painting, its colour returns around them, and their note joins the circle's
// warm chord. A wrong side is never punished: they just call again, and after two misses the narrator says where.
// Gather all eight and the whole circle glows and sings together; then Nikki's own words.
// Buttons: ◀ LEFT · WELCOME (the middle) · RIGHT ▶.
import * as THREE from 'three';
import * as K from './kit.js';
import { friend, FRIENDS } from './fellowship-things.js';

const SIZE = 0.22;                // a drifting friend's width on the painting
const CALL_EVERY = 2.6, DRIFT = 4.5, GLIDE = 1.6;
const CLIP = new URL('../../../3D/gallery/audio/wing_5_0.mp3', import.meta.url).href;   // Nikki's own words
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const SIDE_NAME = { '-1': 'left', '0': 'middle', '1': 'right' };

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting faded to soft gray, except around the friends who have come home (soft circles of colour that
// breathe a little), and a warm glow over everything at the end
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uH, uAll, uGlow;
uniform vec3 uHome[8];
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = texture2D(map, vUv).rgb;
  float k = uAll;
  for (int i = 0; i < 8; i++) {
    vec3 h = uHome[i];
    float r = 0.17 + 0.012 * sin(uT * 1.3 + float(i));
    float d = length((p - h.xy) * vec2(1.0, uH));
    k = max(k, h.z * (1.0 - smoothstep(r * 0.55, r, d)));
  }
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 faded = mix(vec3(l), vec3(0.9, 0.88, 0.84), 0.5);
  vec3 c = mix(faded, col, k);
  c += vec3(1.0, 0.82, 0.55) * uGlow * 0.18 * (0.7 + 0.3 * sin(uT * 2.0));
  gl_FragColor = vec4(c, uA);
}`;

/* ───────── the circle's sound: a warm pad that gains a voice for every friend home, and the friends' voices ───────── */
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, dest = bus, p = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.05);
  }
  let notes = [], next = 0, step = 0, timer = null, held = false;
  const ROOT = [38, 45];   // D: always there, very soft, so the circle has a floor
  function schedule() {
    if (held) { next = ac.currentTime + 0.1; return; }
    const beat = 60 / 66;
    while (next < ac.currentTime + 0.2) {
      const t = next;
      if (step % 8 === 0) {                                 // the pad: every friend home holds their note
        ROOT.forEach(m => tone(t, midi(m), beat * 8.5, { vol: 0.035, att: 1.2 }));
        notes.forEach((m, i) => tone(t + i * 0.05, midi(m), beat * 8.5, { type: 'triangle', vol: 0.022, att: 1.0, p: (i % 2 ? 0.3 : -0.3) }));
      }
      if (notes.length && step % 2 === 1) {                // a slow, gentle pluck through the friends' notes
        const m = notes[(step >> 1) % notes.length]; tone(t, midi(m + 12), 1.8, { type: 'triangle', vol: 0.03, att: 0.005, p: Math.sin(step) * 0.4 });
      }
      next += beat; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 50); bus.gain.setTargetAtTime(0.9, ac.currentTime, 1.2); },
    add(m) { notes.push(m); tone(ac.currentTime + 0.02, midi(m), 2.5, { type: 'triangle', vol: 0.07, att: 0.02, dest: fx }); tone(ac.currentTime + 0.08, midi(m + 12), 1.8, { vol: 0.04, dest: fx }); },
    hold(v) { held = v; bus.gain.setTargetAtTime(v ? 0 : 0.9, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 0 : 1, ac.currentTime, 0.2); },
    // "Hey, it's me": three voice-like syllables (two formants), at the friend's own pitch, from their side
    call(f0, p, vol) {
      const t = ac.currentTime + 0.02, o2 = pan(p, fx);
      const sy = [[0, 0.26, 1.0, 1.22, [600, 2100]], [0.34, 0.12, 1.05, 1.0, [420, 2300]], [0.5, 0.42, 1.18, 0.86, [330, 2500]]];
      for (const [at, dur, a, b, fm] of sy) {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(f0 * a, t + at); o.frequency.exponentialRampToValueAtTime(f0 * b, t + at + dur);
        g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(0.2 * vol, t + at + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
        fm.forEach((fq, i) => { const bp = ac.createBiquadFilter(), bg = ac.createGain(); bp.type = 'bandpass'; bp.frequency.value = fq * (f0 > 200 ? 1.15 : 1); bp.Q.value = 7; bg.gain.value = i ? 0.6 : 1; o.connect(bp).connect(bg).connect(g); });
        g.connect(o2); o.start(t + at); o.stop(t + at + dur + 0.05);
      }
    },
    miss(p) { tone(ac.currentTime + 0.01, 330, 0.25, { vol: 0.05, dest: fx, p }); tone(ac.currentTime + 0.12, 294, 0.3, { vol: 0.05, dest: fx, p }); },
    together(all) { const t = ac.currentTime + 0.05; all.forEach((m, i) => { tone(t + i * 0.12, midi(m), 5, { type: 'triangle', vol: 0.05, att: 0.3, dest: fx }); tone(t + i * 0.12, midi(m + 12), 4, { vol: 0.025, att: 0.5, dest: fx }); }); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} setTimeout(() => { try { bus.disconnect(); fx.disconnect(); } catch (e) {} }, 600); },
  };
}

export function fellowshipCircleGame() {
  let G = null;

  // where a friend waits on each side while calling (just inside the painting's edge), and where they start (off it)
  const waitAt = s => s < 0 ? { u: 0.13, v: 0.5 } : s > 0 ? { u: 0.87, v: 0.5 } : { u: 0.5, v: 0.17 };
  const startAt = s => s < 0 ? { u: -0.12, v: 0.5 } : s > 0 ? { u: 1.12, v: 0.5 } : { u: 0.5, v: -0.15 };

  function hud() {
    const n = FRIENDS.length, home = G.home;
    G.ui.panel('Gather the circle', `${home}<small>of ${n} home</small>`, { segs: [home, n], sub: G.cur ? 'Listen: which side are they calling from?' : home === n ? 'Together' : 'Someone is coming…' });
  }
  function nextFriend() {
    const f = G.order[G.idx++]; if (!f) return;
    G.cur = f; f.state = 'drift'; f.k = 0; f.callT = 0.5; f.miss = 0;
    f.from = startAt(f.side); f.to = waitAt(f.side); f.pos = { ...f.from };
    f.thing.opacity(1); f.thing.glow(1);
    G.say('A friend is calling.');
    hud();
  }
  function call(f) {
    const near = 0.35 + 0.65 * Math.min(1, f.k);
    G.band.call(f.voice, f.side * 0.9, near);
  }
  function choose(side) {
    if (!G || !G.playing || G.over) return;
    const f = G.cur;
    if (!f || f.state !== 'drift') { K.sfx.ping(side * 0.8, 660, 0.05); return; }
    if (side === f.side) return welcome(f);
    f.miss++; G.band.miss(side * 0.8); G.buzz(25);
    G.ui.alert('Listen again', 'They are calling from another side', 1.4, 'black');
    G.say(f.miss >= 2 ? (f.side < 0 ? 'They are on the left.' : f.side > 0 ? 'They are on the right.' : 'They are in the middle.') : 'Not quite. Listen again.');
    if (f.miss >= 2) G.ui.alert(SIDE_NAME[f.side] === 'middle' ? 'In the middle' : 'On the ' + SIDE_NAME[f.side], 'Press ' + (f.side < 0 ? 'LEFT' : f.side > 0 ? 'RIGHT' : 'WELCOME'), 2, 'blue');
    f.callT = 0.9;   // they call again straight away
  }
  function welcome(f) {
    f.state = 'glide'; f.g = 0; f.gFrom = { ...f.pos }; G.cur = null; G.home++;
    G.band.add(f.note); G.buzz([30, 40, 70]);
    const [x, y] = G.S.P(f.pos.u, f.pos.v); G.fx.add(x, y, f.color, 22, 0.3);
    G.ui.pop('WELCOME HOME!');
    const left = FRIENDS.length - G.home;
    G.say(left ? `Welcome home. ${left} more.` : 'Welcome home. The whole circle is together.');
    hud();
  }

  function finish() {
    G.endT = 0; G.band.together(FRIENDS.map(f => f.note)); G.buzz([60, 60, 160]);
    G.ui.alert('Together', 'The whole fellowship', 3, 'red');
  }

  return {
    title: 'Gather the circle',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { idx: 0, home: 0, cur: null, waitT: -1, endT: -1, t0: 0, botT: 0, allK: 0, glow: 0 });
      const ac = K.audio(); G.band = ac ? band(ac) : { start() {}, add() {}, hold() {}, call() {}, miss() {}, together() {}, stop() {} };
      // the painting, faded until its people come home
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uAll: { value: 0 }, uGlow: { value: 0 },
        uHome: { value: FRIENDS.map(f => new THREE.Vector3(f.u, f.v, 0)) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.02; G.face.renderOrder = 11; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // the friends: each comes from a side; a shuffled mix of left, right and the middle
      const sides = [-1, 1, 0, 1, -1, 0, -1, 1].sort(() => Math.random() - 0.5);
      G.friends = FRIENDS.map((F, i) => {
        const th = friend(F, SIZE); th.group.position.z = 0.05; G.root.add(th.group);
        return { ...F, thing: th, side: sides[i], state: 'away', k: 0, pos: { u: -1, v: -1 }, homeK: 0, i };
      });
      G.order = G.friends.slice().sort(() => Math.random() - 0.5);
      G.ui.buttons([
        { label: '◀ Left', kind: 'black', aria: 'Welcome a friend calling from the left', press: () => choose(-1) },
        { label: 'Welcome', kind: 'red', aria: 'Welcome a friend calling from the middle, far away', press: () => choose(0) },
        { label: 'Right ▶', kind: 'black', aria: 'Welcome a friend calling from the right', press: () => choose(1) },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.waitT = 0.6; G.band.start(); };
      K.intro(G, { title: 'Gather the circle', how: 'The fellowship has drifted apart. Listen for the side a friend calls from, then press LEFT, WELCOME for the middle, or RIGHT to bring them home.',
        say: 'Gather the circle. Nikki’s fellowship has drifted apart. One by one, a friend will call to you. Listen for which side they call from. Press that side to welcome them home. Press welcome when they call from the middle.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      G.uni.uA.value += ((G.ready ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      if (G.waitT > 0) { G.waitT -= dt; if (G.waitT <= 0) nextFriend(); }
      for (const f of G.friends) {
        const th = f.thing;
        if (f.state === 'drift') {
          f.k = Math.min(1.2, f.k + dt / DRIFT);
          const e = Math.min(1, f.k), s = e * e * (3 - 2 * e);
          f.pos.u = f.from.u + (f.to.u - f.from.u) * s + Math.sin(G.t * 0.8 + f.i) * 0.01;
          f.pos.v = f.from.v + (f.to.v - f.from.v) * s + Math.sin(G.t * 0.6 + f.i) * 0.01;
          f.callT -= dt; if (f.callT <= 0) { call(f); f.callT = CALL_EVERY; }
        } else if (f.state === 'glide') {
          f.g = Math.min(1, f.g + dt / GLIDE); const s = f.g * f.g * (3 - 2 * f.g);
          f.pos.u = f.gFrom.u + (f.u - f.gFrom.u) * s; f.pos.v = f.gFrom.v + (f.v - f.gFrom.v) * s;
          f.homeK = s;
          if (f.g >= 1) { f.state = 'home'; const [x, y] = G.S.P(f.u, f.v); G.fx.add(x, y, '#fff2c8', 26, 0.35); if (G.home < FRIENDS.length) G.waitT = 1.0; else finish(); }
        } else if (f.state === 'home') {
          f.homeK = Math.min(1, f.homeK + dt);
          f.fade = (f.fade || 0) + dt * 0.8; th.opacity(Math.max(0, 1 - f.fade)); th.glow(0);   // the drawn figure melts into the painting
        }
        G.uni.uHome.value[f.i].z = f.state === 'home' || f.state === 'glide' ? f.homeK : 0;
        const [x, y] = G.S.P(f.pos.u, f.pos.v); th.group.position.set(x, y, 0.05);
        const sc = f.state === 'glide' ? 1 - 0.25 * f.g : 1; th.group.scale.setScalar(sc);
        th.tick(G.t);
      }
      // the bot: listens to the first call, then presses the right side (one wrong press on the third friend, to test it)
      if (G.bot && G.playing && G.cur && G.cur.state === 'drift' && G.cur.k > 0.85) {
        G.botT -= dt;
        if (G.botT <= 0) { G.botT = 0.8; const f = G.cur; if (G.home === 2 && !f.miss) choose(f.side === 1 ? -1 : 1); else choose(f.side); }
      }
      if (G.endT >= 0) {
        G.endT += dt; G.allK = Math.min(1, G.allK + dt * 0.6); G.uni.uAll.value = G.allK; G.uni.uGlow.value = Math.sin(Math.min(1, G.endT / 3) * Math.PI);
        if (G.endT > 3.4 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('fellowship:circle', t, 'lower');
          K.finale(G, { won: true, title: 'Together', kicker: 'The circle is whole', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Home', v: `${FRIENDS.length}/${FRIENDS.length}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }],
            say: 'Together. The whole circle is home.' });
          // then Nikki's own words (if the clip is there; otherwise her words are read)
          if (!G.bot) {
            const a = new Audio(CLIP); G.clip = a; a.volume = 1;
            setTimeout(() => { if (!G || G.clip !== a) return; G.band.hold(true); a.play().catch(() => { G && G.say(G.work && G.work.quote || ''); }); }, 3200);
            a.addEventListener('ended', () => { if (G && G.band) G.band.hold(false); });
            a.addEventListener('error', () => { if (G && G.band) G.band.hold(false); });
          }
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down' || !G.cur) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      const f = G.cur; if (Math.hypot(p.u - f.pos.u, (p.v - f.pos.v) * G.h) < SIZE * 0.8) choose(f.side);
    },
    pause() { if (G) { G.paused = true; G.band.hold(true); if (G.clip) G.clip.pause(); } },
    resume() { if (G) { G.paused = false; G.band.hold(false); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'fellowship-circle', homes: G.uni.uHome.value.map(v => +v.z.toFixed(2)), pos: G.cur && [+G.cur.pos.u.toFixed(2), +G.cur.pos.v.toFixed(2), +G.cur.thing.mesh.material.opacity.toFixed(2)], playing: G.playing, over: G.over, home: G.home, cur: G.cur && G.cur.id, side: G.cur && G.cur.side, t: +G.t.toFixed(1) }; },
    stop() { if (!G) return; G.band.stop(); if (G.clip) { G.clip.pause(); G.clip.removeAttribute('src'); G.clip = null; } K.cleanup(G); G = null; },
  };
}
