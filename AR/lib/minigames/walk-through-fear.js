// WALK THROUGH FEAR · "Blindness Fears": a mini game inside Ben Fox's painting.
//   "… when you walk through the fear, you are the only thing that is left." — Ben Fox
// Ben's real fears from his diagnosis drip down out of the storm toward him, like the paint in the painting.
// Swing the cane (swipe left / right, or the two cane buttons) to splash the fear on that side into colour.
// Swinging left, right, left, right walks you forward, like real cane technique. A fear that reaches you
// pushes you back. Every fear you splash becomes a note, so the storm slowly turns into music, and the
// further you walk, the calmer the storm gets. At the end the storm clears, Ben's animation of the painting
// comes alive, and his words appear.
// Playable by ear: each fear is spoken and plinks from its side as it appears, warns from its side as it gets
// close, and every swing, step and splash has a sound and a buzz.
//
// Game API (see lib/minigames/index.js): start(ctx) · update(dt) · pointer(kind, event) · pause() · resume() · stop() · over
import * as THREE from 'three';

const FEARS = ['WORK?', 'LOVE?', 'DRIVING?', 'PARENTING?', 'HOBBIES?', 'FRIENDS', 'CANE', 'COOKING', 'RUNNING', 'WALKING', 'WRITING', 'READING', 'SELF WORTH', 'INDEPENDENCE', 'RESPECT'];
const GOAL = 24;                                         // steps to walk through the storm
const TOP = 0.44, HIT_Y = -0.02;                         // fears start at the top and reach Ben at chest height
const BEN_X = -0.02;                                     // the figure's centre in the painting
const FEET = [-0.03, -0.37], TIP = [0.174, -0.389];      // where he stands, and the cane tip
const PALETTE = ['#0f8fa3', '#d8322b', '#f08a1c', '#7a2fb3', '#1f5fb8', '#e8452c', '#14a7a0'];
const NOTES = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0];   // a major pentatonic: fears become music

/* ── sound ── */
let ac = null;
function audio() { if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
function out(pan) { const a = audio(); if (!a) return null; if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan || 0)); p.connect(a.destination); return p; } return a.destination; }
function tone(f, dur, { type = 'sine', vol = 0.15, pan = 0, slide = 0, delay = 0 } = {}) {
  const a = audio(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out(pan)); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, { vol = 0.2, pan = 0, freq = 900, q = 1, delay = 0 } = {}) {
  const a = audio(); if (!a) return; const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = n; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
  s.connect(f).connect(g).connect(out(pan)); s.start(a.currentTime + delay);
}

/* ── pictures ── */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// a fear: a dripping blob of paint with the word on it (the drip trails upward, where it came from)
function fearTex(word, color, seed) {
  let s = seed; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = color;
    for (let i = 0; i < 5; i++) { const x = 60 + r() * (W - 120), w = 6 + r() * 14; g.beginPath(); g.moveTo(x - w, 120); g.quadraticCurveTo(x, 10 + r() * 60, x + w, 120); g.fill(); }   // drips above
    g.beginPath(); const cx = W / 2, cy = 168;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 14) { const rr = 1 + (r() - 0.5) * 0.16, x = cx + Math.cos(a) * 236 * rr, y = cy + Math.sin(a) * 74 * rr; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 6; g.stroke();
    let fs = 78; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`;
    while (g.measureText(word).width > W - 70 && fs > 30) { fs -= 4; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 10; g.strokeText(word, cx, cy + 4); g.fillStyle = '#fff'; g.fillText(word, cx, cy + 4);
  });
}
const dotTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,250,235,1)'); r.addColorStop(0.4, 'rgba(255,215,150,.45)'); r.addColorStop(1, 'rgba(255,180,90,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });

/* the storm: a dark churning wash over the painting that calms as you walk */
function stormMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uT: { value: 0 }, uCalm: { value: 0 }, uHit: { value: 0 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vP; uniform float uT, uCalm, uHit;
      float n(vec2 p){ return sin(p.x*7.0+uT*1.7+sin(p.y*5.0-uT))*0.5+sin(p.y*9.0-uT*1.3+sin(p.x*4.0+uT*0.7))*0.5; }
      void main(){
        float k = n(vP*1.0) * 0.5 + n(vP*2.3 + 3.1) * 0.5;
        float edge = smoothstep(0.15, 0.75, length(vP*vec2(1.0,0.9)));
        vec3 col = mix(vec3(0.03,0.05,0.12), vec3(0.45,0.04,0.06), 0.5 + 0.5*k);
        float a = (0.18 + 0.32*edge + 0.12*k) * (1.0 - uCalm);
        col = mix(col, vec3(0.9,0.05,0.04), uHit); a = max(a, uHit*0.45);
        gl_FragColor = vec4(col, clamp(a,0.0,0.8));
      }`,
  });
}

export function walkThroughFearGame() {
  let G = null;
  // best = the fewest times a fear caught you on a full walk
  let best = (() => { try { const v = localStorage.getItem('walk-through-fear-best'); return v === null ? null : +v; } catch (e) { return null; } })();

  function el(id, css) { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; e.setAttribute('aria-hidden', 'true'); e.style.cssText = css; document.body.appendChild(e); } return e; }
  const hud = () => el('wfHud', 'position:fixed;left:calc(10px + env(safe-area-inset-left));top:calc(68px + env(safe-area-inset-top));z-index:11;background:#000;color:#fff;padding:8px 14px 8px;border-bottom:4px solid #ec3013;font:900 13px/1.2 Archivo,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;pointer-events:none');
  function setHud() {
    const h = hud(); h.innerHTML = '<div style="color:#ff9783">Blindness fears</div><div style="font-size:21px;letter-spacing:.05em;margin-top:3px"></div><div style="height:6px;background:#333;margin-top:6px"><div style="height:6px;background:#ec3013"></div></div>';
    h.children[1].textContent = 'Steps ' + G.steps + ' / ' + GOAL; h.children[2].firstChild.style.width = (100 * G.steps / GOAL) + '%'; h.style.display = 'block';
  }
  function big(text, sub, secs, withStory) {
    const e = el('wfBig', 'position:fixed;left:0;right:0;top:calc(150px + env(safe-area-inset-top));z-index:11;display:flex;justify-content:center;pointer-events:none');
    e.innerHTML = '<div style="background:rgba(0,0,0,.86);color:#fff;padding:10px 18px 10px;border-bottom:5px solid #ec3013;text-align:center;max-width:90vw;font:900 clamp(22px,7vw,40px)/1.04 Archivo,Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em"></div>';
    e.firstChild.textContent = text;
    if (sub) { const s = document.createElement('small'); s.style.cssText = 'display:block;font:700 15px/1.35 Atkinson Hyperlegible,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#d8d4cf;margin-top:6px'; s.textContent = sub; e.firstChild.appendChild(s); }
    if (withStory) { const b = document.createElement('button'); b.type = 'button'; b.textContent = '▶ Ben’s story';
      b.style.cssText = 'display:block;margin:12px auto 2px;min-height:54px;padding:0 24px;background:#fff;color:#000;border:0;font:900 18px/1 Archivo,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;pointer-events:auto';
      b.onclick = () => { if (G && G.story) G.story(); }; e.firstChild.appendChild(b); }
    e.style.display = 'flex'; if (G) G.bigT = secs || 0;
  }
  const hideBig = () => { const e = document.getElementById('wfBig'); if (e) e.style.display = 'none'; };
  function caneButtons(show) {
    for (const side of [-1, 1]) {
      const id = side < 0 ? 'wfCaneL' : 'wfCaneR'; let b = document.getElementById(id);
      if (!b && show) {
        b = document.createElement('button'); b.id = id; b.type = 'button';
        b.setAttribute('aria-label', side < 0 ? 'Swing the cane left' : 'Swing the cane right');
        b.innerHTML = side < 0 ? '◀ Cane' : 'Cane ▶';
        b.style.cssText = 'position:fixed;bottom:calc(96px + env(safe-area-inset-bottom));' + (side < 0 ? 'left:calc(12px + env(safe-area-inset-left));' : 'right:calc(12px + env(safe-area-inset-right));') +
          'z-index:12;min-width:110px;min-height:64px;padding:0 14px;background:#fff;color:#000;border:4px solid #ec3013;font:900 17px/1 Archivo,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer';
        b.onclick = () => swing(side); document.body.appendChild(b);
      }
      if (b) b.style.display = show ? 'block' : 'none';
    }
  }

  /* ── fears ── */
  function spawn() {
    const word = G.bag.length ? G.bag.pop() : (G.bag = shuffle(FEARS.slice())).pop();
    const side = Math.random() < 0.5 ? -1 : 1, x = BEN_X + side * (0.1 + Math.random() * 0.15);   // stays inside a phone held upright
    const color = PALETTE[(Math.random() * PALETTE.length) | 0];
    const w = 0.13 + Math.min(0.13, word.length * 0.012);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({ map: fearTex(word, color, (Math.random() * 1e5) | 0), transparent: true, depthWrite: false }));
    m.position.set(x, TOP, 0.03); m.renderOrder = 10; G.root.add(m);
    const f = { word, color, x0: x, x, y: TOP, side, m, warn: 0 };
    G.fears.push(f);
    tone(1400 + Math.random() * 300, 0.12, { type: 'sine', vol: 0.09, pan: side * 0.8 });          // a drip, from its side
    G.say(word.replace('?', ''), false);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function splash(f) {
    G.fears.splice(G.fears.indexOf(f), 1); G.root.remove(f.m); f.m.material.map.dispose(); f.m.material.dispose();
    const c = new THREE.Color(f.color);
    for (let i = 0; i < 26; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: c.clone().offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.3) * 0.2), transparent: true, depthWrite: false }));
      const a = Math.random() * Math.PI * 2, v = 0.15 + Math.random() * 0.45; s.position.set(f.x, f.y, 0.035); s.scale.setScalar(0.012 + Math.random() * 0.02); s.renderOrder = 11;
      G.root.add(s); G.bits.push({ s, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 0.1, life: 0.7 + Math.random() * 0.6 });
    }
    G.splashed++;
    const note = NOTES[Math.min(NOTES.length - 1, Math.floor(G.steps / GOAL * NOTES.length))];
    tone(note, 0.6, { type: 'triangle', vol: 0.16, pan: f.side * 0.6 }); tone(note * 1.5, 0.5, { type: 'sine', vol: 0.07, pan: f.side * 0.6, delay: 0.04 });
    noise(0.18, { vol: 0.16, freq: 2400, pan: f.side * 0.7 });
  }
  function swing(side) {
    if (!G || !G.playing || G.paused) return;
    // the cane sweeps that side: it reaches the lowest fear there (the one closest to Ben)
    const reach = G.fears.filter(f => Math.sign(f.x - BEN_X) === side && f.y < TOP - 0.06).sort((a, b) => a.y - b.y)[0];
    G.sweep = { side, t: 0 };
    tone(1700, 0.04, { type: 'square', vol: 0.05, pan: side * 0.6 }); noise(0.07, { vol: 0.18, freq: 3200, pan: side * 0.6 });   // the tip on the wet ground
    if (reach) splash(reach);
    // left, right, left, right: each change of side is a step forward
    if (G.lastSide !== side) { G.steps = Math.min(GOAL, G.steps + 1); G.ripple(); G.buzz(14); tone(110, 0.08, { type: 'triangle', vol: 0.1 }); }
    else { tone(180, 0.12, { type: 'sawtooth', vol: 0.05, slide: -60 }); }          // same side twice: a shuffle, not a step
    G.lastSide = side; setHud();
    if (G.steps >= GOAL) finish();
  }
  function hit(f) {
    G.fears.splice(G.fears.indexOf(f), 1); G.root.remove(f.m); f.m.material.map.dispose(); f.m.material.dispose();
    G.hits++; G.steps = Math.max(0, G.steps - 2); G.hitFlash = 1; G.shake = 0.5; setHud();
    tone(98, 0.6, { type: 'sawtooth', vol: 0.12 }); tone(104, 0.6, { type: 'sawtooth', vol: 0.1 }); noise(0.5, { vol: 0.35, freq: 140, q: 0.6 });
    G.buzz([120, 50, 160]);
    big(f.word, 'The fear caught up with you. Keep walking.', 1.2);
    G.say(f.word.replace('?', '') + '. Keep walking.', true);
  }
  function finish() {
    G.playing = false; G.over = true; caneButtons(false);
    for (const f of G.fears.slice()) splash(f);
    const rec = best === null || G.hits < best; if (rec) { best = G.hits; try { localStorage.setItem('walk-through-fear-best', String(G.hits)); } catch (e) {} }
    [392, 523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, 1.6, { type: 'triangle', vol: 0.12, delay: i * 0.18 }));
    G.buzz([60, 60, 60, 60, 240]);
    big('You are the only thing that is left', 'You walked through ' + G.splashed + ' fears' + (G.hits ? ', and ' + G.hits + ' caught up with you' : ', and none caught you') + (rec ? '. Best walk yet!' : '.'), 0, true);
    G.say('You walked through the fear. When you walk through the fear, you are the only thing that is left. Press Ben’s story to hear it from him.');
    // the painting comes alive behind the words
    const src = G.work && G.work.overlay && G.work.overlay.anim;
    if (src) {
      const v = document.createElement('video'); Object.assign(v, { src, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
      v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
      G.anim = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 }));
      G.anim.position.z = 0.006; G.anim.renderOrder = 6; G.anim.visible = false; G.root.add(G.anim); G.animVideo = v;
      v.addEventListener('playing', () => { if (G && G.anim) G.anim.visible = true; });
      v.play().catch(() => {});
    }
  }

  /* swipes: a sideways flick swings the cane that way; tapping a fear splashes it too */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  return {
    title: 'Walk Through Fear',
    start(ctx) {
      if (G) this.stop(); audio();
      G = { ...ctx, root: new THREE.Group(), fears: [], bits: [], ripples: [], bag: [], t: 0, steps: 0, hits: 0, splashed: 0, lastSide: 0, playing: false, over: false, paused: false,
            spawnT: 1.2, bigT: 0, hitFlash: 0, shake: 0, calm: 0, introT: 3.0, sweep: null };
      ctx.group.add(G.root);
      G.storm = new THREE.Mesh(new THREE.PlaneGeometry(1.02, G.h * 1.02), stormMaterial()); G.storm.position.z = 0.02; G.storm.renderOrder = 8; G.root.add(G.storm);
      G.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
      G.glow.position.set(0.05, 0.16, 0.025); G.glow.scale.set(0.75, 0.75, 1); G.glow.renderOrder = 9; G.root.add(G.glow);
      const arc = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.172, 40, 1, 0, Math.PI * 0.55), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      arc.position.set(FEET[0], FEET[1] + 0.02, 0.04); arc.renderOrder = 12; G.root.add(arc); G.arc = arc;
      G.ripple = () => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE[(Math.random() * PALETTE.length) | 0]), transparent: true, depthWrite: false }));
        m.position.set(FEET[0] + (G.lastSide || 1) * 0.05, FEET[1], 0.022); m.scale.set(0.02, 0.008, 1); m.renderOrder = 9; G.root.add(m); G.ripples.push({ m, t: 0 });
      };
      setHud();
      big('Walk through fear', 'Swing your cane left and right to walk. Splash the fears before they reach you.', 2.8);
      G.say('Blindness fears. Walk through fear. Swing your cane left and right to walk forward. Each swing splashes the fear on that side. Swipe left or right, or use the cane buttons.');
      caneButtons(true);
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; const U = G.storm.material.uniforms; U.uT.value = G.t;
      if (G.bigT > 0) { G.bigT -= dt; if (G.bigT <= 0) hideBig(); }
      if (!G.playing && !G.over) { G.introT -= dt; if (G.introT <= 0) G.playing = true; }
      const progress = G.steps / GOAL;
      G.calm += ((G.over ? 1 : progress * 0.85) - G.calm) * Math.min(1, dt * 1.5); U.uCalm.value = G.calm;
      G.hitFlash = Math.max(0, G.hitFlash - dt * 2.5); U.uHit.value = G.hitFlash;
      G.glow.material.opacity = Math.min(0.55, G.calm * 0.6);
      if (G.playing) {
        G.spawnT -= dt;
        const interval = 2.3 - progress * 1.2;
        if (G.spawnT <= 0 && G.fears.length < 4) { spawn(); G.spawnT = interval * (0.8 + Math.random() * 0.4); }
        const speed = 0.085 + progress * 0.06;
        for (const f of G.fears.slice()) {
          f.y -= speed * dt;
          const k = (TOP - f.y) / (TOP - HIT_Y);                      // 0 at the top → 1 at Ben
          f.x = f.x0 + (BEN_X + Math.sign(f.x0 - BEN_X) * 0.08 - f.x0) * Math.min(1, k * k);   // drawn in toward him
          f.m.position.set(f.x, f.y, 0.03); f.m.rotation.z = Math.sin(G.t * 2 + f.x0 * 20) * 0.05;
          if (k > 0.55) { f.warn -= dt; if (f.warn <= 0) { tone(330 + k * 200, 0.07, { type: 'square', vol: 0.05, pan: f.side * 0.9 }); f.warn = 0.55 - k * 0.35; } }
          if (f.y <= HIT_Y) hit(f);
        }
      }
      for (const b of G.bits) { b.life -= dt; b.vy -= 0.5 * dt; b.s.position.x += b.vx * dt; b.s.position.y += b.vy * dt; b.s.material.opacity = Math.max(0, Math.min(1, b.life * 1.5)); }
      G.bits = G.bits.filter(b => { if (b.life > 0) return true; G.root.remove(b.s); b.s.material.dispose(); return false; });
      for (const r of G.ripples) { r.t += dt; const s = 0.02 + r.t * 0.25; r.m.scale.set(s, s * 0.32, 1); r.m.material.opacity = Math.max(0, 0.8 - r.t * 0.9); }
      G.ripples = G.ripples.filter(r => { if (r.t < 0.9) return true; G.root.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose(); return false; });
      if (G.sweep) { G.sweep.t += dt; const k = G.sweep.t / 0.25; G.arc.material.opacity = Math.max(0, 0.9 - k);
        G.arc.rotation.z = G.sweep.side < 0 ? Math.PI * 0.45 + k * 0.6 : -k * 0.6 - 0.05; if (k >= 1) G.sweep = null; }
      G.shake = Math.max(0, G.shake - dt); G.root.position.x = G.shake > 0 ? Math.sin(G.t * 70) * 0.008 * G.shake * 2 : 0;
      if (G.anim) G.anim.material.opacity = Math.min(1, G.anim.material.opacity + dt * 0.7);
    },
    pointer(kind, ev) {
      if (!G || G.paused) return;
      if (kind === 'down') { G.p = { x: ev.clientX, y: ev.clientY, t: performance.now() }; return; }
      if (kind !== 'up' || !G.p) return;
      const dx = ev.clientX - G.p.x, dy = ev.clientY - G.p.y, quick = performance.now() - G.p.t < 600; G.p = null;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) && quick) { swing(dx < 0 ? -1 : 1); return; }
      if (Math.hypot(dx, dy) < 12 && G.playing) {                   // a tap right on a fear splashes it (but doesn't walk)
        const r = G.renderer.domElement.getBoundingClientRect();
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, G.camera);
        const h = ray.intersectObjects(G.fears.map(f => f.m))[0]; if (h) splash(G.fears.find(f => f.m === h.object));
      }
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { steps: G.steps, hits: G.hits, splashed: G.splashed, fears: G.fears.map(f => [f.word, +f.x.toFixed(2), +f.y.toFixed(2)]), playing: G.playing, over: G.over, calm: +G.calm.toFixed(2) }; },
    swing: (s) => swing(s),
    stop() {
      if (!G) return;
      if (G.animVideo) { G.animVideo.pause(); G.animVideo.removeAttribute('src'); G.animVideo.load(); }
      G.group.remove(G.root); G.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      for (const id of ['wfHud', 'wfBig', 'wfCaneL', 'wfCaneR']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
      G = null;
    },
  };
}
