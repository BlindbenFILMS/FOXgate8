// ALMOST BLINDNESS · "Yesterday I Saw It": a mini game inside Ben Fox's painting.
//   "You wake up one day; you saw yesterday the thing that you're going to trip over this morning." — Ben Fox
// Press Play: the painted figure steps out of the painting and becomes yours to walk toward the light.
// Each morning you get a few seconds of clear sight to memorise the room, then your sight closes into a tunnel
// around you. Hold and drag anywhere to walk. Tap the cane to hear what's around you: each thing answers from its
// own side, sooner when it's close. Bump into something and you'll feel it. Five mornings, each with a narrower
// tunnel, a shorter look, and more in the way. Then Ben tells his story.
// Playable by ear: the light chimes from where it is, the cane echoes, and every bump and step has a sound.
//
// Game API (see lib/minigames/index.js): start(ctx) · update(dt) · pointer(kind, event) · pause() · resume() · stop() · over
import * as THREE from 'three';

const EMPTY = 'media/games/almost-blindness-empty.jpg';
const FIGURE = 'media/games/almost-blindness-figure.png';
const LIGHT = [0, 0.5 - 470 / 1024];                      // the bright centre of the tunnel: the goal
const START_Y = -0.38;
const MORNINGS = [                                        // tunnel radius, seconds of clear sight, things in the way
  { r: 0.30, look: 6.0, n: 5 }, { r: 0.23, look: 5.0, n: 6 }, { r: 0.18, look: 4.5, n: 7 }, { r: 0.14, look: 4.0, n: 8 }, { r: 0.105, look: 3.5, n: 9 },
];
const THINGS = [                                          // what's on the floor, and how it answers the cane
  { name: 'chair', e: '🪑', snd: 'wood' }, { name: 'shoe', e: '👟', snd: 'thud' }, { name: 'teddy bear', e: '🧸', snd: 'squeak' },
  { name: 'backpack', e: '🎒', snd: 'soft' }, { name: 'cat', e: '🐈', snd: 'meow' }, { name: 'plant', e: '🪴', snd: 'rustle' },
  { name: 'laundry basket', e: '🧺', snd: 'soft' }, { name: 'guitar', e: '🎸', snd: 'pluck' }, { name: 'box', e: '📦', snd: 'wood' },
];
const PR = 0.028, OR = 0.042, SPEED = 0.2;               // player radius, obstacle radius, walking speed (painting widths / s)

/* ── sound ── */
let ac = null;
function audio() { if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
function out(pan) { const a = audio(); if (!a) return null; if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan || 0)); p.connect(a.destination); return p; } return a.destination; }
function tone(f, dur, { type = 'sine', vol = 0.15, pan = 0, slide = 0, delay = 0 } = {}) {
  const a = audio(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out(pan)); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, { vol = 0.2, pan = 0, freq = 900, q = 1, delay = 0 } = {}) {
  const a = audio(); if (!a) return; const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = n; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
  s.connect(f).connect(g).connect(out(pan)); s.start(a.currentTime + delay);
}
const VOICE = {                                           // each thing's answer to the cane
  wood: (p, d, v) => tone(330, 0.09, { type: 'triangle', vol: v, pan: p, delay: d }),
  thud: (p, d, v) => tone(120, 0.14, { type: 'sine', vol: v * 1.4, pan: p, delay: d }),
  squeak: (p, d, v) => tone(1100, 0.16, { type: 'sine', vol: v * 0.8, pan: p, delay: d, slide: 500 }),
  soft: (p, d, v) => noise(0.12, { vol: v * 1.2, pan: p, freq: 400, delay: d }),
  meow: (p, d, v) => tone(760, 0.32, { type: 'sawtooth', vol: v * 0.35, pan: p, delay: d, slide: -260 }),
  rustle: (p, d, v) => noise(0.22, { vol: v, pan: p, freq: 2600, q: 0.7, delay: d }),
  pluck: (p, d, v) => tone(196, 0.5, { type: 'triangle', vol: v, pan: p, delay: d }),
};

/* ── pictures ── */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const thingTex = THINGS.map(t => canvasTex(160, 160, (g) => {
  g.fillStyle = 'rgba(8,12,24,.62)'; g.beginPath(); g.arc(80, 80, 74, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,214,140,.9)'; g.lineWidth = 5; g.stroke();
  g.font = '96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t.e, 80, 88);
}));
const ringTex = canvasTex(160, 160, (g) => { g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.beginPath(); g.arc(80, 80, 70, 0, Math.PI * 2); g.stroke(); });
const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,240,200,.55)'); r.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });

/* the tunnel: dark swirling paint closing in around the walker, with a warm rim like the painting */
function tunnelMaterial(h) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uC: { value: new THREE.Vector2() }, uR: { value: 0.3 }, uFade: { value: 0 }, uT: { value: 0 }, uH: { value: h } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vP; uniform vec2 uC; uniform float uR, uFade, uT;
      void main(){
        vec2 d = vP - uC; float r = length(d), a = atan(d.y, d.x);
        float edge = smoothstep(uR, uR + 0.06, r);
        float rim = exp(-pow((r - uR - 0.012) / 0.018, 2.0));
        float swirl = 0.5 + 0.5 * sin(a * 9.0 + r * 46.0 - uT * 1.3 + sin(a * 3.0 + uT * 0.4) * 2.0);
        vec3 deep = mix(vec3(0.015, 0.03, 0.05), vec3(0.07, 0.2, 0.25), swirl * 0.55 * smoothstep(0.0, 0.25, r - uR));
        vec3 col = mix(deep, vec3(1.0, 0.55, 0.16), rim * 0.75);
        float alpha = max(edge * 0.985, rim * 0.6) * uFade;
        gl_FragColor = vec4(col, alpha);
      }`,
  });
}

export function almostBlindnessGame() {
  let G = null;
  let bestBruises = (() => { try { const v = localStorage.getItem('almost-blindness-best'); return v === null ? null : +v; } catch (e) { return null; } })();

  /* small screen pieces: score under the eye button, a big banner, and the cane button */
  function el(id, css) { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; e.setAttribute('aria-hidden', 'true'); e.style.cssText = css; document.body.appendChild(e); } return e; }
  const hud = () => el('mgHud', 'position:fixed;left:calc(10px + env(safe-area-inset-left));top:calc(68px + env(safe-area-inset-top));z-index:11;background:#000;color:#fff;padding:8px 14px 7px;border-bottom:4px solid #ec3013;font:900 18px/1.15 Archivo,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;max-width:72vw');
  function big(text, sub, secs) {
    // high on the screen, so it never hides the room you're trying to memorise
    const e = el('abBig', 'position:fixed;left:0;right:0;top:calc(150px + env(safe-area-inset-top));z-index:11;display:flex;justify-content:center;pointer-events:none');
    e.innerHTML = '<div style="background:rgba(0,0,0,.86);color:#fff;padding:10px 18px 9px;border-bottom:5px solid #ec3013;text-align:center;max-width:90vw;font:900 clamp(22px,7vw,40px)/1.02 Archivo,Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em"></div>';
    e.firstChild.textContent = text;
    if (sub) { const s = document.createElement('small'); s.style.cssText = 'display:block;font:700 15px/1.35 Atkinson Hyperlegible,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#d8d4cf;margin-top:6px'; s.textContent = sub; e.firstChild.appendChild(s); }
    e.style.display = 'flex'; if (G) G.bigT = secs || 0;
  }
  const hideBig = () => { const e = document.getElementById('abBig'); if (e) e.style.display = 'none'; };
  function caneButton(show) {
    let b = document.getElementById('mgCane');
    if (!b && show) {
      b = document.createElement('button'); b.id = 'mgCane'; b.type = 'button'; b.setAttribute('aria-label', 'Tap the cane: hear what is around you');
      b.innerHTML = '<span style="font-size:30px;line-height:1" aria-hidden="true">🦯</span><span>CANE</span>';
      b.style.cssText = 'position:fixed;right:calc(14px + env(safe-area-inset-right));bottom:calc(96px + env(safe-area-inset-bottom));z-index:12;width:88px;height:88px;border-radius:50%;' +
        'background:#fff;color:#000;border:4px solid #ec3013;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:900 14px/1 Archivo,Arial,sans-serif;letter-spacing:.06em;cursor:pointer';
      b.onclick = () => cane(); document.body.appendChild(b);
    }
    if (b) b.style.display = show ? 'flex' : 'none';
  }

  /* ── a morning ── */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function newMorning(again) {
    const M = MORNINGS[G.day], r = rng(G.day * 7919 + (again ? G.retries * 31 : 0) + 17);
    for (const o of G.things) { G.root.remove(o.m); G.root.remove(o.ring); }
    G.things = [];
    const used = [[0, START_Y], LIGHT];
    for (let i = 0; i < M.n; i++) {
      let x = 0, y = 0;
      for (let t = 0; t < 500; t++) {
        x = (r() - 0.5) * 0.8; y = START_Y + 0.1 + r() * (LIGHT[1] + 0.14 - START_Y - 0.1);
        if (used.every(([ux, uy]) => Math.hypot(ux - x, uy - y) > 0.155)) break;
      }
      used.push([x, y]);
      const k = (i + G.day * 3) % THINGS.length;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(OR * 2.3, OR * 2.3), new THREE.MeshBasicMaterial({ map: thingTex[k], transparent: true, depthWrite: false }));
      m.position.set(x, y, 0.01); m.renderOrder = 6; G.root.add(m);
      const ring = new THREE.Mesh(new THREE.PlaneGeometry(OR * 2.6, OR * 2.6), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0 }));
      ring.position.set(x, y, 0.03); ring.renderOrder = 9; G.root.add(ring);
      G.things.push({ x, y, k, m, ring, echo: 0, known: false });
    }
    G.px = 0; G.py = START_Y; G.bruises = 0; G.phase = 'look'; G.lookT = M.look; G.fadeTo = 0; G.tunnelR = 0.9;
    hud().textContent = 'Morning ' + (G.day + 1) + ' of ' + MORNINGS.length;
    big('Morning ' + (G.day + 1), again ? 'Try this morning again. Look around and remember the room.' : 'Look around. Remember where everything is.', M.look - 0.6);
    G.say((again ? 'Let’s try that morning again. ' : 'Morning ' + (G.day + 1) + '. ') + 'Look around and remember the room. ' + M.n + ' things are on the floor between you and the light.');
    [523, 659, 784].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.12, delay: i * 0.14 }));
    caneButton(false);
  }
  function lightsFade() {
    G.phase = 'walk'; G.fadeTo = 1;
    big('Your sight closes in', 'Hold and drag to walk to the light. Tap the cane to listen.', 2.6);
    G.say('Your sight closes in. Hold and drag anywhere to walk toward the light. Tap the cane to hear what’s around you.');
    noise(1.4, { vol: 0.25, freq: 220, q: 0.6 }); tone(330, 1.4, { type: 'sine', vol: 0.1, slide: -180 });
    caneButton(true); G.buzz(60);
  }
  function reachLight() {
    G.phase = 'done'; G.walkDir = null; G.fadeTo = 0; caneButton(false);
    G.total += G.bruises;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.16, delay: i * 0.1 }));
    G.buzz([40, 40, 40, 40, 120]);
    const ouch = G.bruises === 0 ? 'Not a single bruise!' : G.bruises === 1 ? 'One stubbed toe.' : G.bruises + ' bruises.';
    if (G.day < MORNINGS.length - 1) {
      big('You reached the light', ouch + ' Tomorrow your tunnel is a little smaller.', 3.4);
      G.say('You reached the light. ' + ouch + ' Tomorrow your tunnel will be a little smaller.');
      G.nextT = 3.6;
    } else finale();
  }
  function finale() {
    G.over = true; G.phase = 'over';
    const rec = bestBruises === null || G.total < bestBruises; if (rec) { bestBruises = G.total; try { localStorage.setItem('almost-blindness-best', String(G.total)); } catch (e) {} }
    hud().textContent = 'A week of mornings · ' + G.total + (G.total === 1 ? ' bruise' : ' bruises');
    big('This is almost blindness', 'Every morning the tunnel got smaller. ' + G.total + (G.total === 1 ? ' bruise' : ' bruises') + ' this week' + (rec ? ' · Best yet!' : '') + '. Tap Ben’s story to hear it from him.', 0);
    G.say('This is almost blindness. Every morning the tunnel got smaller. You finished the week with ' + G.total + ' bruises. Press Ben’s story to hear it from him.');
    const b = document.createElement('button'); b.type = 'button'; b.textContent = '\u25B6 Ben\u2019s story';   // inside the final banner
    b.style.cssText = 'display:block;margin:12px auto 2px;min-height:54px;padding:0 24px;background:#fff;color:#000;border:0;font:900 18px/1 Archivo,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;pointer-events:auto';
    b.onclick = () => { if (G && G.story) G.story(); };
    document.getElementById('abBig').firstChild.appendChild(b);
  }
  function bump(o) {
    G.bruises++; o.known = true; o.echo = 2.5;
    noise(0.18, { vol: 0.45, freq: 160, q: 0.8 }); tone(180, 0.35, { type: 'sawtooth', vol: 0.12, slide: -90, delay: 0.05 });
    G.buzz([90, 40, 140]); G.flash = 0.5;
    const dx = G.px - o.x, dy = G.py - o.y, d = Math.hypot(dx, dy) || 1;            // step back
    G.px = o.x + dx / d * (PR + OR + 0.012); G.py = o.y + dy / d * (PR + OR + 0.012);
    G.walkDir = null;
    big('Ow! A ' + THINGS[o.k].name, G.bruises >= 3 ? null : 'You saw it yesterday.', 1.4);
    G.say('Ow! A ' + THINGS[o.k].name + '.');
    if (G.bruises >= 3) { G.retries++; G.phase = 'done'; caneButton(false); G.fadeTo = 0; G.retryT = 1.8; big('Rough morning', 'Three bruises. Take a breath and try this morning again.', 1.8); }
  }
  function cane() {
    if (!G || G.phase !== 'walk' || G.paused) return;
    tone(1500, 0.05, { type: 'square', vol: 0.06 }); noise(0.05, { vol: 0.2, freq: 3000 });           // the tip taps the floor
    G.buzz(20);
    const R = 0.24; let near = null, nd = 9;
    for (const o of G.things) {
      const dx = o.x - G.px, dy = o.y - G.py, d = Math.hypot(dx, dy) - OR;
      if (d > R) continue;
      o.echo = 1.0;                                                  // a brief outline in the dark
      VOICE[THINGS[o.k].snd](dx * 3, 0.08 + d * 1.6, 0.06 + (R - d) * 0.6);
      if (d < nd) { nd = d; near = o; }
    }
    if (near) {
      const dx = near.x - G.px, dy = near.y - G.py, side = Math.abs(dx) < 0.04 ? '' : dx < 0 ? ' to your left' : ' to your right', ahead = dy > 0.03 ? 'ahead' : dy < -0.03 ? 'behind you' : 'beside you';
      G.say(THINGS[near.k].name + ', ' + (nd < 0.06 ? 'right ' : '') + ahead + side, true);
      setTimeout(() => G && G.buzz(nd < 0.06 ? [40, 30, 40] : 30), 80 + nd * 1600);
    } else G.say('Clear', true);
  }

  /* drag anywhere: the direction you drag is the way you walk (works without seeing the figure) */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hit = new THREE.Vector3(), inv = new THREE.Matrix4();
  function toBoard(x, y) {
    const r = G.renderer.domElement.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, G.camera);
    G.root.updateWorldMatrix(true, false);
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).transformDirection(G.root.matrixWorld), new THREE.Vector3().setFromMatrixPosition(G.root.matrixWorld));
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    inv.copy(G.root.matrixWorld).invert(); return hit.clone().applyMatrix4(inv);
  }

  return {
    title: 'Almost Blindness',
    start(ctx) {
      if (G) this.stop(); audio();
      const h = ctx.h;
      G = { ...ctx, h, root: new THREE.Group(), things: [], day: 0, total: 0, retries: 0, t: 0, phase: 'intro', fade: 0, fadeTo: 0, tunnelR: 0.9, bigT: 0, flash: 0, stepT: 0, beaconT: 0, px: 0, py: START_Y, walkDir: null, over: false, paused: false };
      ctx.group.add(G.root);
      const empty = new THREE.TextureLoader().load(EMPTY); empty.colorSpace = THREE.SRGBColorSpace;
      G.empty = new THREE.Mesh(new THREE.PlaneGeometry(1, h), new THREE.MeshBasicMaterial({ map: empty, transparent: true, opacity: 0 }));
      G.empty.position.z = 0.004; G.empty.renderOrder = 5; G.root.add(G.empty);
      G.tunnel = new THREE.Mesh(new THREE.PlaneGeometry(1.02, h * 1.02), tunnelMaterial(h)); G.tunnel.position.z = 0.02; G.tunnel.renderOrder = 8; G.root.add(G.tunnel);
      const fig = new THREE.TextureLoader().load(FIGURE); fig.colorSpace = THREE.SRGBColorSpace;
      G.me = new THREE.Mesh(new THREE.PlaneGeometry(0.07 * 70 / 138, 0.07), new THREE.MeshBasicMaterial({ map: fig, transparent: true, depthWrite: false }));
      G.me.position.set(0, START_Y, 0.035); G.me.renderOrder = 12; G.root.add(G.me);
      G.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe2a8, transparent: true, depthWrite: false, opacity: 0.55 })); G.halo.scale.set(0.11, 0.11, 1); G.halo.renderOrder = 11; G.root.add(G.halo);
      G.light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff4d6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); G.light.scale.set(0.2, 0.2, 1);
      G.light.position.set(LIGHT[0], LIGHT[1], 0.04); G.light.renderOrder = 13; G.root.add(G.light);
      G.introT = 1.2;
      big('Yesterday I saw it', 'Walk Ben to the light. Each morning, your sight closes in a little more.', 2.4);
      G.say('Yesterday I saw it. Walk Ben to the light. Each morning, your sight closes in a little more.');
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.tunnel.material.uniforms.uT.value = G.t;
      if (G.empty.material.opacity < 1 && !G.over) G.empty.material.opacity = Math.min(1, G.empty.material.opacity + dt * 2);
      if (G.bigT > 0) { G.bigT -= dt; if (G.bigT <= 0) hideBig(); }
      if (G.phase === 'intro') { G.introT -= dt; if (G.introT <= 0) newMorning(false); }
      else if (G.phase === 'look') { G.lookT -= dt; if (G.lookT <= 0) lightsFade(); }
      else if (G.phase === 'done') {
        if (G.retryT > 0) { G.retryT -= dt; if (G.retryT <= 0) newMorning(true); }
        else if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) { G.day++; newMorning(false); } }
      }
      // the tunnel closes to this morning's size, centred on you
      const M = MORNINGS[Math.min(G.day, MORNINGS.length - 1)], targetR = G.phase === 'walk' ? M.r : 0.9;
      G.tunnelR += (targetR - G.tunnelR) * Math.min(1, dt * (G.phase === 'walk' ? 1.4 : 2.5));
      G.fade += ((G.over ? 0 : G.fadeTo) - G.fade) * Math.min(1, dt * 2);
      const U = G.tunnel.material.uniforms; U.uC.value.set(G.px, G.py); U.uR.value = G.tunnelR; U.uFade.value = G.fade;

      if (G.phase === 'walk' && G.walkDir) {
        const [dx, dy, s] = G.walkDir, step = SPEED * s * dt;
        G.px = Math.max(-0.5 + PR, Math.min(0.5 - PR, G.px + dx * step)); G.py = Math.max(-G.h / 2 + PR, Math.min(G.h / 2 - PR, G.py + dy * step));
        G.stepT -= dt * s; if (G.stepT <= 0) { G.stepT = 0.32; tone(90 + Math.random() * 20, 0.05, { type: 'triangle', vol: 0.07 }); }
        for (const o of G.things) if (Math.hypot(o.x - G.px, o.y - G.py) < PR + OR) { bump(o); break; }
        if (G.phase === 'walk' && Math.hypot(LIGHT[0] - G.px, LIGHT[1] - G.py) < 0.05) reachLight();
      }
      // the light chimes from where it is, faster as you get closer
      if (G.phase === 'walk') {
        G.beaconT -= dt;
        if (G.beaconT <= 0) { const dx = LIGHT[0] - G.px, d = Math.hypot(dx, LIGHT[1] - G.py); tone(988, 0.25, { vol: 0.07, pan: dx * 3 }); tone(1319, 0.3, { vol: 0.05, pan: dx * 3, delay: 0.08 }); G.beaconT = 0.6 + d * 2.2; }
      }
      // pictures
      const bob = G.walkDir && G.phase === 'walk' ? Math.abs(Math.sin(G.t * 9)) * 0.004 : 0;
      G.me.position.set(G.px, G.py + 0.012 + bob, 0.035); G.halo.position.set(G.px, G.py + 0.01, 0.033);
      G.light.scale.setScalar(0.18 + Math.sin(G.t * 2.2) * 0.02);
      for (const o of G.things) {
        if (o.echo > 0) o.echo = Math.max(0, o.echo - dt);
        o.ring.material.opacity = Math.min(1, o.echo * 1.6);
        o.ring.material.color.set(o.known && o.echo > 1 ? 0xff6a4a : 0xffffff);
      }
      if (G.flash > 0) G.flash -= dt;
      if (G.phase === 'walk') hud().textContent = 'Morning ' + (G.day + 1) + ' · ' + G.bruises + (G.bruises === 1 ? ' bruise' : ' bruises');
      if (G.over && G.empty.material.opacity > 0) { G.empty.material.opacity = Math.max(0, G.empty.material.opacity - dt * 0.8); G.me.material.opacity = G.empty.material.opacity; }
    },
    pointer(kind, ev) {
      if (!G || G.paused) return;
      if (kind === 'down') { G.drag = { x: ev.clientX, y: ev.clientY, b: toBoard(ev.clientX, ev.clientY) }; return; }
      if (!G.drag) return;
      if (kind === 'up') { G.drag = null; G.walkDir = null; return; }
      const px = Math.hypot(ev.clientX - G.drag.x, ev.clientY - G.drag.y); if (px < 12) { G.walkDir = null; return; }
      const b = toBoard(ev.clientX, ev.clientY); if (!b || !G.drag.b) return;
      const dx = b.x - G.drag.b.x, dy = b.y - G.drag.b.y, d = Math.hypot(dx, dy) || 1;
      G.walkDir = [dx / d, dy / d, Math.min(1, px / 70)];
    },
    pause() { if (G) { G.paused = true; G.walkDir = null; G.drag = null; } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { phase: G.phase, day: G.day, px: +G.px.toFixed(3), py: +G.py.toFixed(3), bruises: G.bruises, total: G.total, r: +G.tunnelR.toFixed(3), things: G.things.map(o => [+o.x.toFixed(3), +o.y.toFixed(3)]) }; },
    cane: () => cane(),
    stop() {
      if (!G) return;
      G.group.remove(G.root);
      G.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      for (const id of ['mgHud', 'abBig', 'mgCane']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
      G = null;
    },
  };
}
