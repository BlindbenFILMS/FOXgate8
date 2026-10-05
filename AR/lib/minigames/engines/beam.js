// BEAM: darkness covers the painting except one cone of light from a lamp in the painting. Sweep the beam (drag left or
// right anywhere, or hold the ◀ ▶ buttons). Lost things appear in the dark and drift toward danger; hold the beam on one
// for a moment to light it up and save it. Ones you do not reach in time are lost.
// By ear: each lost thing calls softly from where it is compared with the beam (left or right; louder as the beam gets
// closer, faster as time runs out). The beam hums all the time and rises in pitch while it rests on something.
//
// cfg = {
//   engine: 'beam', title, kicker, how, unit: 'saved',
//   source: [u, v]                 where the light comes from (the lamp / lantern)
//   range: [degMin, degMax]        how far the beam can swing (0° = right, 90° = up, −90° = down, in painting space)
//   start: deg                     where the beam points at GO
//   width: deg                     half-width of the cone (default 11)
//   spawn: [[u0, v0, u1, v1], …]   boxes where lost things appear
//   danger: [u, v] | [[u0,v0,u1,v1], …]  where they drift to (a point, or boxes: each picks a point in one)
//   safe: [u, v]                   where a saved thing goes
//   lost: [{ e, name }]            what they look like in the dark;  found: [{ e, name }] (optional) what they become when lit
//   goal: 10, maxLost: 4, life: [9, 6] (seconds to reach danger, start → end), every: [3, 1.8] (seconds between), maxAt: 3
//   dwell: 0.8 (seconds of light to save), turn: 95 (degrees per second the buttons swing), color: '#ffd98a', dark: 0.86
//   callF: 660 (the lost things' call pitch), humF: 110 (the beam's hum),
//   words: { appear, ahead, left, right, lostOne, lostSub }  short phrases spoken / shown
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

const D2R = Math.PI / 180;
const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const pick = arr => arr[(Math.random() * arr.length) | 0];
const lerp = (a, b, t) => a + (b - a) * t;

// the night: one plane over the painting, dark except a soft cone from the source (mode 0), or the warm light itself (mode 1)
function nightMaterial(mode, color, dark) {
  // the light only adds colour and leaves the canvas alpha alone, so the camera picture still shows through it
  const blend = mode ? { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor } : { blending: THREE.NormalBlending };
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, ...blend,
    uniforms: { uSrc: { value: new THREE.Vector2() }, uAng: { value: 0 }, uHalf: { value: 0.2 }, uDark: { value: dark },
      uCol: { value: new THREE.Color(color) }, uOn: { value: 0 }, uT: { value: 0 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vP; uniform vec2 uSrc; uniform float uAng, uHalf, uDark, uOn, uT; uniform vec3 uCol;
      void main(){
        vec2 d = vP - uSrc; float r = length(d);
        float a = atan(d.y, d.x) - uAng; a = mod(a + 3.14159265, 6.2831853) - 3.14159265;
        float w = uHalf * (1.0 + 0.04 * sin(uT * 3.0));
        float cone = smoothstep(w * 1.35, w * 0.7, abs(a)) * smoothstep(0.0, 0.05, r);
        float halo = smoothstep(0.11, 0.0, r);
        float lit = clamp(cone * (1.0 - 0.12 * r) + halo, 0.0, 1.0);
        ${mode
          ? 'gl_FragColor = vec4(uCol * (cone * 0.16 * (1.0 - 0.6 * r) + halo * 0.35 + uOn * cone * 0.08), 1.0);'
          : 'gl_FragColor = vec4(0.012, 0.018, 0.04, uDark * (1.0 - lit));'}
      }`,
  });
}

export function beamGame(cfg) {
  let G = null;
  const W = cfg.words || {};
  const unit = cfg.unit || 'saved';
  const half = (cfg.width || 11) * D2R, dwellNeed = cfg.dwell || 0.8;
  const aMin = cfg.range[0] * D2R, aMax = cfg.range[1] * D2R;
  // which way the beam's tip moves on screen when the angle grows: up-pointing fans move left, down-pointing fans move right
  const sgn = Math.sin((aMin + aMax) / 2) >= 0 ? 1 : -1;
  const col = cfg.color || '#ffd98a';

  function hud() {
    G.ui.panel(cfg.kicker || cfg.title, `${G.saved}<small>${unit}</small>`,
      { segs: [G.saved, cfg.goal], sub: `Lost ${G.lost} of ${cfg.maxLost}`, warn: G.lost >= cfg.maxLost - 1 });
  }
  const angTo = (x, y) => Math.atan2(y - G.src[1], x - G.src[0]);
  // where a thing is compared with the beam, as a stereo pan: −1 far to the left of the beam … 1 far to the right
  const panOf = (it) => Math.max(-1, Math.min(1, -wrap(it.ang - G.ang) * sgn / (50 * D2R)));

  // ── the beam: steer(−1 left, 0 stop, 1 right) is what the buttons and the robot both use; drags nudge it directly
  function steer(dir) { if (G) G.steer = dir; }
  function nudge(rad) { G.ang = Math.max(aMin, Math.min(aMax, G.ang + rad)); }

  // ── the hum: a soft drone that follows the beam, rising while it rests on something
  function humStart() {
    const a = K.audio(); if (!a || G.hum) return;
    const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sine'; f.type = 'lowpass'; f.frequency.value = 900;
    o.frequency.value = cfg.humF || 110; o2.frequency.value = (cfg.humF || 110) * 1.5; g.gain.value = 0.0001;
    o.connect(f); o2.connect(f); f.connect(g).connect(a.destination); o.start(); o2.start();
    G.hum = { o, o2, g, a };
  }
  function humSet(onness, moving) {
    const h = G && G.hum; if (!h) return;
    const t = h.a.currentTime, f = (cfg.humF || 110) * (1 + onness);
    h.o.frequency.setTargetAtTime(f, t, 0.06); h.o2.frequency.setTargetAtTime(f * 1.5, t, 0.06);
    h.g.gain.setTargetAtTime(G.playing && !G.paused ? 0.035 + onness * 0.05 + (moving ? 0.01 : 0) : 0.0001, t, 0.08);
  }
  function humStop() {
    const h = G && G.hum; if (!h) return; G.hum = null;
    try { h.g.gain.setTargetAtTime(0.0001, h.a.currentTime, 0.05); h.o.stop(h.a.currentTime + 0.3); h.o2.stop(h.a.currentTime + 0.3); } catch (e) {}
  }

  // ── lost things
  function spawn() {
    const box = pick(cfg.spawn), u = lerp(box[0], box[2], Math.random()), v = lerp(box[1], box[3], Math.random());
    let du, dv; const dz = cfg.danger;
    if (Array.isArray(dz[0])) { const b = pick(dz); du = lerp(b[0], b[2], Math.random()); dv = lerp(b[1], b[3], Math.random()); } else [du, dv] = dz;
    const i = (Math.random() * cfg.lost.length) | 0, kind = cfg.lost[i], found = cfg.found ? cfg.found[i % cfg.found.length] : kind;
    const s = K.sprite(K.emojiTex(kind.e, { ring: true, color: '#6c7690', bg: 'rgba(6,8,14,.75)' }), 0.085, { order: 22, color: '#555' });
    const ring = K.sprite(K.ringTex, 0.12, { color: col, opacity: 0, order: 21 });
    const glow = K.sprite(K.glowTex, 0.22, { color: col, additive: true, opacity: 0, order: 20 });
    for (const o of [glow, ring, s]) G.root.add(o);
    const it = { kind, found, s, ring, glow, from: G.S.P(u, v), to: G.S.P(du, dv), t: 0, life: G.life, dwell: 0, call: 0.9 + Math.random() * 0.4,
      on: false, state: 'lost', x: 0, y: 0, ang: 0, id: ++G.made };
    place(it); G.items.push(it);
    call(it, 1.5);                                         // its first call, a little louder, from its side
    if (G.made <= 2 || G.made % 5 === 0) G.say((W.appear || 'Someone is lost') + ', ' + sideWord(it), false);
  }
  function sideWord(it) { const p = panOf(it); return Math.abs(p) < 0.18 ? (W.ahead || 'right in your light') : p < 0 ? (W.left || 'to your left') : (W.right || 'to your right'); }
  function place(it) {
    // they drift, speeding up a little as they near danger, with a gentle sway
    const e = it.t * it.t * 0.4 + it.t * 0.6;
    it.x = lerp(it.from[0], it.to[0], e) + Math.sin(G.t * 1.7 + it.id) * 0.01;
    it.y = lerp(it.from[1], it.to[1], e) + Math.cos(G.t * 1.3 + it.id * 2) * 0.007;
    it.ang = angTo(it.x, it.y);
    for (const o of [it.s, it.ring, it.glow]) o.position.set(it.x, it.y, o === it.s ? 0.05 : 0.045);
  }
  function call(it, loud = 1) {
    const p = panOf(it), near = 1 - Math.min(1, Math.abs(wrap(it.ang - G.ang)) / (90 * D2R));
    const f = (cfg.callF || 660) * [1, 1.125, 1.26][it.id % 3];
    const vol = (0.022 + 0.06 * near) * loud;
    K.tone(f, 0.16, { vol, pan: p }); K.tone(f * 1.335, 0.22, { vol: vol * 0.7, pan: p, delay: 0.13 });
  }
  function rescue(it) {
    it.state = 'saved'; it.t = 0; G.saved++;
    it.s.material.map = K.emojiTex(it.found.e, { ring: true, color: col, bg: 'rgba(20,16,6,.7)' }); it.s.material.color.set('#fff'); it.s.material.needsUpdate = true;
    it.from = [it.x, it.y]; it.to = G.S.P(cfg.safe[0], cfg.safe[1]);
    const p = panOf(it); K.sfx.good(p, G.saved);
    G.fx.add(it.x, it.y, col, 22); G.buzz([30, 30, 60]);
    if (G.saved === 1 || G.saved % 3 === 0) G.say(G.saved + ' ' + unit + (it.found.name ? '. ' + it.found.name : ''), false);
    hud(); if (G.saved >= cfg.goal) end(true);
  }
  function lose(it) {
    it.state = 'gone'; it.t = 0; G.lost++;
    const p = panOf(it); K.sfx.bad(p); G.buzz([90, 40, 140]);
    G.ui.alert(W.lostOne || 'Lost in the dark', W.lostSub || 'Find them sooner.', 1.1);
    G.say(W.lostOne || 'Lost in the dark', false);
    hud(); if (G.lost >= cfg.maxLost) end(false);
  }
  function drop(it) { for (const o of [it.s, it.ring, it.glow]) { G.root.remove(o); o.material.dispose(); } G.items.splice(G.items.indexOf(it), 1); }

  function end(won) {
    for (const it of G.items.slice()) drop(it);
    humStop(); steer(0);
    G.night.visible = false; G.light.visible = false; G.lamp.visible = false;
    const r = K.best(cfg.id + ':beam', G.saved, 'higher');
    const Wn = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: Wn.title, line: Wn.line, best: won && r.isBest,
      cells: [{ k: unit, v: G.saved }, { k: 'Lost', v: G.lost }] });
  }

  // the robot player: turn toward the most urgent lost thing, hold the light on it, then move on
  function robot() {
    const lostOnes = G.items.filter(i => i.state === 'lost');
    if (!lostOnes.length) { steer(0); return; }
    const urgency = it => (1 - it.t) * it.life + Math.abs(wrap(it.ang - G.ang)) / (G.turn * D2R) * 0.6;
    const tgt = G.botT && lostOnes.includes(G.botT) && G.botT.dwell > 0 ? G.botT : lostOnes.sort((a, b) => urgency(a) - urgency(b))[0];
    G.botT = tgt;
    const d = wrap(tgt.ang - G.ang);
    if (Math.abs(d) < half * 0.35) steer(0);
    else steer(d * sgn > 0 ? -1 : 1);
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.items = []; G.saved = 0; G.lost = 0; G.made = 0; G.steer = 0; G.drag = null;
      G.spawnT = 0.6; G.life = cfg.life[0]; G.turn = cfg.turn || 95;
      G.src = G.S.P(cfg.source[0], cfg.source[1]);
      G.ang = (cfg.start ?? (cfg.range[0] + cfg.range[1]) / 2) * D2R;
      // the night and the warm light
      const geo = new THREE.PlaneGeometry(1, G.h);
      G.night = new THREE.Mesh(geo, nightMaterial(0, col, cfg.dark ?? 0.86)); G.night.position.z = 0.02; G.night.renderOrder = 12;
      G.light = new THREE.Mesh(geo, nightMaterial(1, col, 0)); G.light.position.z = 0.025; G.light.renderOrder = 13;
      for (const m of [G.night, G.light]) { m.material.uniforms.uSrc.value.set(G.src[0], G.src[1]); m.material.uniforms.uHalf.value = half; m.material.uniforms.uAng.value = G.ang; G.root.add(m); }
      G.night.material.uniforms.uDark.value = 0.4;   // dusk while the instructions play; full night at GO
      G.lamp = K.sprite(K.glowTex, 0.12, { color: col, additive: true, opacity: 0.9, order: 24 }); G.lamp.position.set(G.src[0], G.src[1], 0.05); G.root.add(G.lamp);
      G.ui.buttons([
        { label: '◀', aria: 'Swing the light left', press: () => steer(-1), release: () => { if (G && G.steer === -1) steer(0); } },
        { label: '▶', aria: 'Swing the light right', press: () => steer(1), release: () => { if (G && G.steer === 1) steer(0); } },
      ]);
      G.onGo = () => { humStart(); };
      hud();
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over) return;
      const nu = G.night.material.uniforms;
      if (G.playing) nu.uDark.value += ((cfg.dark ?? 0.86) - nu.uDark.value) * Math.min(1, dt * 2);
      // the beam swings
      if (G.bot && G.playing) robot();
      const before = G.ang;
      if (G.steer && G.playing) nudge(-G.steer * sgn * G.turn * D2R * dt);
      const moving = Math.abs(G.ang - before) > 1e-5 || !!G.drag;
      const atEdge = G.ang <= aMin + 1e-3 || G.ang >= aMax - 1e-3;
      if (G.steer && atEdge && !G.atEdge) { K.tone(140, 0.12, { type: 'square', vol: 0.05, pan: G.steer * 0.9 }); G.buzz(15); }
      G.atEdge = atEdge;
      for (const m of [G.night, G.light]) { m.material.uniforms.uAng.value = G.ang; m.material.uniforms.uT.value = G.t; }
      G.lamp.material.opacity = 0.75 + Math.sin(G.t * 5) * 0.15;
      if (!G.playing) return;
      // pacing
      const prog = G.saved / cfg.goal;
      G.life = lerp(cfg.life[0], cfg.life[1], prog);
      const every = lerp(cfg.every[0], cfg.every[1], prog);
      const live = G.items.filter(i => i.state === 'lost').length;
      G.spawnT -= dt;
      if (live === 0 && G.spawnT > 0.9) G.spawnT = 0.9;   // never leave the player waiting in an empty night
      if (G.spawnT <= 0 && live < (cfg.maxAt || 3)) { spawn(); G.spawnT = every * (0.8 + Math.random() * 0.4); }
      // lost things drift, call, and light up
      let onness = 0;
      for (const it of G.items.slice()) {
        if (it.state === 'lost') {
          it.t += dt / it.life; place(it);
          const inBeam = Math.abs(wrap(it.ang - G.ang)) < half;
          if (inBeam && !it.on) { G.buzz(12); K.tone((cfg.callF || 660) * 1.5, 0.08, { vol: 0.05, pan: panOf(it) }); }
          it.on = inBeam;
          it.dwell = inBeam ? it.dwell + dt : Math.max(0, it.dwell - dt * 0.6);
          const k = Math.min(1, it.dwell / dwellNeed); if (inBeam) onness = Math.max(onness, 0.35 + 0.65 * k);
          it.s.material.color.setScalar(Math.min(1, 0.33 + 0.67 * k + (inBeam ? 0.15 : 0)));
          it.ring.material.opacity = inBeam ? 0.35 + 0.6 * k : 0; it.ring.scale.setScalar(0.16 - 0.05 * k);
          it.glow.material.opacity = k * 0.7;
          it.s.scale.setScalar(0.085 + (it.t > 0.6 ? 0.012 * Math.sin(G.t * 9 + it.id) : 0));   // trembles when time is short
          it.call -= dt;
          if (it.call <= 0) { call(it); it.call = lerp(1.3, 0.45, it.t) * (inBeam ? 1.6 : 1); }
          if (it.dwell >= dwellNeed) { rescue(it); if (G.over) return; }
          else if (it.t >= 1) { lose(it); if (G.over) return; }
        } else if (it.state === 'saved') {
          it.t += dt / 1.6; const e = 1 - Math.pow(1 - Math.min(1, it.t), 2);
          it.x = lerp(it.from[0], it.to[0], e); it.y = lerp(it.from[1], it.to[1], e);
          for (const o of [it.s, it.ring, it.glow]) o.position.set(it.x, it.y, o === it.s ? 0.05 : 0.045);
          it.ring.material.opacity = 0; it.glow.material.opacity = 0.6 * (1 - it.t); it.s.material.opacity = Math.min(1, 2.2 * (1 - it.t));
          it.s.scale.setScalar(0.1 * (1 - 0.4 * it.t));
          if (it.t >= 1) drop(it);
        } else {
          it.t += dt / 0.8; it.s.material.opacity = Math.max(0, 1 - it.t); it.ring.material.opacity = 0; it.glow.material.opacity = 0;
          it.s.scale.setScalar(0.085 * (1 - 0.5 * Math.min(1, it.t)));
          if (it.t >= 1) drop(it);
        }
      }
      G.light.material.uniforms.uOn.value = onness;
      humSet(onness, moving);
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') { G.drag = { x: ev.clientX }; return; }
      if (!G.drag) return;
      if (kind === 'move') {
        const dx = ev.clientX - G.drag.x; G.drag.x = ev.clientX;
        nudge(-dx / innerWidth * 110 * D2R * sgn);   // drag right → the tip of the beam moves right
      } else if (kind === 'up') G.drag = null;
    },
    pause() { if (G) { G.paused = true; G.drag = null; if (G.hum) G.hum.g.gain.setTargetAtTime(0.0001, G.hum.a.currentTime, 0.03); } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() {
      return G && { engine: 'beam', playing: G.playing, over: G.over, saved: G.saved, lost: G.lost, goal: cfg.goal,
        beamDeg: Math.round(G.ang / D2R), live: G.items.filter(i => i.state === 'lost').length };
    },
    stop() { if (G) humStop(); K.cleanup(G); G = null; },
  };
}
