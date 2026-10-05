// CURATING HOPE · "Pass It On": a mini game inside Ben Fox's painting.
//   "It's so important to curate hope together…" — Ben Fox
// A single warm leaf of hope starts with the person at the warm end of the line (right). Pass it on, person to
// person, toward the cold side (left): tap anywhere or press PASS IT ON. Everyone it reaches lights up and joins
// hands, and warm leaves grow on the tree's cold side. Cold gusts blow in from the left: when one comes, press and
// HOLD until it passes, or the wind takes the hope back a person. When the whole line is connected, the tree
// blazes warm, Ben's animation of the painting comes alive, and his words appear.
// Playable by ear: each person has their own note (connecting the line builds a chord), the gusts whoosh in from
// the left with a spoken warning, and every pass, hold and loss has a sound and a buzz.
//
// Game API (see lib/minigames/index.js): start(ctx) · update(dt) · pointer(kind, event) · pause() · resume() · stop() · over
import * as THREE from 'three';

// the people at the roots, from the warm end (right) to the cold end (left): [x, head y] in painting pixels
const PEOPLE = [[910, 745], [872, 722], [800, 725], [759, 727], [694, 702], [647, 692], [597, 685],
                [445, 667], [392, 695], [328, 715], [278, 707], [205, 720], [158, 732], [105, 730]];
const NOTES = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0, 1046.5, 1174.7, 1318.5, 1568.0];
const WARM = ['#ffb347', '#ff8a2a', '#ffd166', '#f25c2a', '#ffc04d', '#e8452c', '#ffe08a'];
const COLD_CANOPY = { x: 270, y: 300, rx: 215, ry: 225 };   // the blue half of the tree, in painting pixels
const P = (x, y) => [x / 1024 - 0.5, 0.5 - y / 1024];
const HAND = 42;                                             // hands are this far below the head (pixels)

/* ── sound ── */
let ac = null;
function audio() { if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
function out(pan) { const a = audio(); if (!a) return null; if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan || 0)); p.connect(a.destination); return p; } return a.destination; }
function tone(f, dur, { type = 'sine', vol = 0.15, pan = 0, slide = 0, delay = 0 } = {}) {
  const a = audio(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out(pan)); o.start(t); o.stop(t + dur + 0.02);
}
function wind(dur, { vol = 0.3, pan = -0.8, from = 300, to = 1400, delay = 0 } = {}) {      // a gust: filtered noise that swells and sweeps
  const a = audio(); if (!a) return; const t = a.currentTime + delay;
  const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = n;
  f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur * 0.7);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(out(pan)); s.start(t);
}

/* ── pictures ── */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,250,230,1)'); r.addColorStop(0.35, 'rgba(255,190,90,.55)'); r.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
const ringTex = canvasTex(128, 128, (g) => { g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.stroke(); });
const leafTex = canvasTex(128, 128, (g) => {                 // the leaf of hope: a glowing warm shard, like the painting's leaves
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,230,160,.9)'); r.addColorStop(1, 'rgba(255,150,40,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  g.beginPath(); g.moveTo(64, 18); g.lineTo(98, 58); g.lineTo(70, 108); g.lineTo(34, 72); g.closePath();
  const lg = g.createLinearGradient(34, 18, 98, 108); lg.addColorStop(0, '#fff2b0'); lg.addColorStop(0.5, '#ffb347'); lg.addColorStop(1, '#f25c2a'); g.fillStyle = lg; g.fill();
  g.strokeStyle = 'rgba(120,40,0,.6)'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(64, 22); g.lineTo(70, 104); g.stroke();
});
function shardTex(color, seed) {
  let s = seed; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return canvasTex(64, 64, (g) => { g.beginPath(); const n = 4 + ((r() * 2) | 0);
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.6, rr = 18 + r() * 13; i ? g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr) : g.moveTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = color; g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.stroke(); });
}
const shardTexs = WARM.flatMap((c, i) => [shardTex(c, i * 7 + 1), shardTex(c, i * 7 + 4)]);
const streakTex = canvasTex(256, 32, (g) => { const lg = g.createLinearGradient(0, 0, 256, 0); lg.addColorStop(0, 'rgba(150,200,255,0)'); lg.addColorStop(0.6, 'rgba(190,225,255,.75)'); lg.addColorStop(1, 'rgba(150,200,255,0)'); g.fillStyle = lg; g.fillRect(0, 12, 256, 8); });

export function curatingHopeGame() {
  let G = null;

  function el(id, css) { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; e.setAttribute('aria-hidden', 'true'); e.style.cssText = css; document.body.appendChild(e); } return e; }
  const hud = () => el('chHud', 'position:fixed;left:calc(10px + env(safe-area-inset-left));top:calc(68px + env(safe-area-inset-top));z-index:11;background:#000;color:#fff;padding:8px 14px 8px;border-bottom:4px solid #ec3013;font:900 13px/1.2 Archivo,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;pointer-events:none;min-width:170px');
  function setHud() {
    const h = hud(), n = G.idx + 1;
    h.innerHTML = '<div style="color:#ffb347">Pass it on</div><div style="font-size:21px;letter-spacing:.05em;margin-top:3px"></div><div style="height:6px;background:#333;margin-top:6px"><div style="height:6px;background:linear-gradient(90deg,#ffb347,#ec3013)"></div></div>';
    h.children[1].textContent = 'Hope shared ' + n + ' / ' + PEOPLE.length; h.children[2].firstChild.style.width = (100 * n / PEOPLE.length) + '%'; h.style.display = 'block';
  }
  function big(text, sub, secs, withStory) {
    const e = el('chBig', 'position:fixed;left:0;right:0;top:calc(150px + env(safe-area-inset-top));z-index:11;display:flex;justify-content:center;pointer-events:none');
    e.innerHTML = '<div style="background:rgba(0,0,0,.86);color:#fff;padding:10px 18px 10px;border-bottom:5px solid #ec3013;text-align:center;max-width:90vw;font:900 clamp(22px,7vw,40px)/1.04 Archivo,Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em"></div>';
    e.firstChild.textContent = text;
    if (sub) { const s = document.createElement('small'); s.style.cssText = 'display:block;font:700 15px/1.35 Atkinson Hyperlegible,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#d8d4cf;margin-top:6px'; s.textContent = sub; e.firstChild.appendChild(s); }
    if (withStory) { const b = document.createElement('button'); b.type = 'button'; b.textContent = '▶ Ben’s story';
      b.style.cssText = 'display:block;margin:12px auto 2px;min-height:54px;padding:0 24px;background:#fff;color:#000;border:0;font:900 18px/1 Archivo,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;pointer-events:auto';
      b.onclick = () => { if (G && G.story) G.story(); }; e.firstChild.appendChild(b); }
    e.style.display = 'flex'; if (G) G.bigT = secs || 0;
  }
  const hideBig = () => { const e = document.getElementById('chBig'); if (e) e.style.display = 'none'; };

  /* the big PASS / HOLD button: tap to pass, press and hold through a gust */
  function passButton(show) {
    let b = document.getElementById('chPass');
    if (!b && show) {
      b = document.createElement('button'); b.id = 'chPass'; b.type = 'button';
      b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(96px + env(safe-area-inset-bottom));z-index:12;min-width:250px;min-height:68px;padding:0 22px;' +
        'background:#ffb347;color:#000;border:4px solid #000;font:900 22px/1 Archivo,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none';
      b.addEventListener('pointerdown', e => { e.preventDefault(); press(true); });
      for (const k of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(k, () => press(false));
      b.addEventListener('contextmenu', e => e.preventDefault());
      document.body.appendChild(b);
    }
    if (b) b.style.display = show ? 'block' : 'none';
    return b;
  }
  function setButton() {
    const b = document.getElementById('chPass'); if (!b || !G) return;
    const gust = G.gust && G.gust.phase !== 'calm';
    b.textContent = gust ? (G.holding ? '✋ Holding…' : '✋ Hold!') : '◀ Pass it on';
    b.style.background = gust ? (G.holding ? '#7fc4ff' : '#1f4fd8') : '#ffb347'; b.style.color = gust && !G.holding ? '#fff' : '#000';
    b.setAttribute('aria-label', gust ? 'A cold gust: press and hold until it passes' : 'Pass the hope on to the next person');
  }
  function press(down) {
    if (!G || G.paused) return;
    if (down) { G.holding = true; G.pressT = performance.now(); }
    else if (G.holding) {
      G.holding = false;
      const quick = performance.now() - G.pressT < 350;
      if (quick && !(G.gust && G.gust.phase === 'blow')) pass();
    }
    setButton();
  }

  /* ── people, hands, leaves ── */
  const hand = i => { const [x, y] = PEOPLE[i]; return P(x, y + HAND); };
  const chest = i => { const [x, y] = PEOPLE[i]; return P(x, y + 30); };
  function lightUp(i) {
    const p = G.people[i]; p.lit = true; p.glow.material.opacity = 0; p.t = 0;
    if (i > 0) {                                           // joined hands: a warm line of light to the person before
      const [ax, ay] = hand(i - 1), [bx, by] = hand(i), len = Math.hypot(bx - ax, by - ay);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.007), new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.position.set((ax + bx) / 2, (ay + by) / 2, 0.03); m.rotation.z = Math.atan2(by - ay, bx - ax); m.renderOrder = 9; G.root.add(m); p.link = m;
    }
    p.shards = [];                                         // warm leaves grow on the cold side of the tree
    for (let k = 0; k < 7; k++) p.shards.push(addShard(false));
  }
  function addShard(fast) {
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random());
    const x = COLD_CANOPY.x + Math.cos(a) * COLD_CANOPY.rx * rr, y = COLD_CANOPY.y + Math.sin(a) * COLD_CANOPY.ry * rr;
    const [px, py] = P(Math.min(500, x), y), s = 0.018 + Math.random() * 0.02;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: shardTexs[(Math.random() * shardTexs.length) | 0], transparent: true, depthWrite: false }));
    m.position.set(px, py, 0.012 + Math.random() * 0.004); m.rotation.z = Math.random() * 6.28; m.scale.setScalar(0.01); m.renderOrder = 7; G.root.add(m);
    const sh = { m, grow: 0, delay: fast ? Math.random() * 1.2 : Math.random() * 0.5, spin: (Math.random() - 0.5) * 0.4 }; G.shards.push(sh); return sh;
  }
  function unlight(i) {
    const p = G.people[i]; p.lit = false;
    if (p.link) { G.root.remove(p.link); p.link.geometry.dispose(); p.link.material.dispose(); p.link = null; }
    for (const sh of p.shards || []) { sh.fall = 1; }        // the warm leaves it brought blow away
    p.shards = [];
  }

  /* ── passing ── */
  function pass() {
    if (!G.playing || G.flight || G.recvT > 0 || G.idx >= PEOPLE.length - 1) return;   // each person holds the hope a moment first
    const from = G.idx, to = G.idx + 1;
    G.flight = { from, to, t: 0 };
    tone(NOTES[from] * 2, 0.08, { type: 'sine', vol: 0.08, pan: chest(from)[0] * 1.6 });
  }
  function arrive(to) {
    G.idx = to; lightUp(to); setHud(); G.recvT = 0.35;
    const pan = chest(to)[0] * 1.6;
    tone(NOTES[to], 0.9, { type: 'triangle', vol: 0.16, pan }); tone(NOTES[to] * 2, 0.6, { type: 'sine', vol: 0.05, pan, delay: 0.03 });
    tone(NOTES[0] / 2, 0.9, { type: 'sine', vol: 0.06 });   // the chord's root, under every new voice
    G.buzz(25);
    if (to === PEOPLE.length - 1) return finale();
    if (to % 4 === 0) G.say((to + 1) + ' people sharing hope', false);
  }

  /* ── gusts ── */
  function scheduleGust() { const k = G.idx / (PEOPLE.length - 1); G.gust = { phase: 'calm', t: 2.6 + Math.random() * 2.4 - k * 1.2 }; }   // colder, more often, toward the cold end
  function updateGust(dt) {
    const g = G.gust; g.t -= dt;
    if (g.phase === 'calm') {
      if (g.t <= 0 && G.idx > 0) {                           // a gust can come at any moment, even mid-pass
        g.phase = 'warn'; g.t = 1.4; g.held = 0; g.total = 0;
        wind(1.4, { vol: 0.14, from: 200, to: 600, pan: -0.9 }); G.buzz([30, 60, 30]);
        big('Cold gust coming!', 'Press and hold until it passes', 1.4); G.say('Cold gust! Hold on!', true);
        setButton();
      } else if (g.t <= 0) g.t = 1;
    } else if (g.phase === 'warn') {
      if (g.t <= 0) { g.phase = 'blow'; g.t = 1.9; wind(1.9, { vol: 0.42, from: 500, to: 1800, pan: -0.4 }); spawnStreaks(); }
    } else if (g.phase === 'blow') {
      g.total += dt; if (G.holding) g.held += dt;
      if (g.t <= 0) {
        const ok = g.held / Math.max(0.01, g.total) >= 0.7;
        if (ok) { G.holds++; tone(NOTES[G.idx], 0.5, { type: 'triangle', vol: 0.12 }); tone(NOTES[G.idx] * 1.5, 0.5, { type: 'triangle', vol: 0.08, delay: 0.08 }); G.buzz(40);
          big('Held steady!', 'The hope is safe', 1.1); G.say('Held steady.', false); }
        else blown();
        scheduleGust(); setButton();
      }
    }
  }
  function blown() {
    G.blown++;
    tone(196, 0.6, { type: 'sawtooth', vol: 0.08, slide: -90 }); G.buzz([100, 50, 140]);
    if (G.idx > 0) {
      const lost = G.idx; unlight(lost); G.idx--; setHud();
      G.flight = { from: lost, to: G.idx, t: 0, back: true };
      big('The wind took it', 'Pass it on again', 1.4); G.say('The wind took the hope back. Pass it on again.', true);
    } else { big('Hold on tight', null, 1); }
  }
  function spawnStreaks() {
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, transparent: true, depthWrite: false, opacity: 0 }));
      s.scale.set(0.28 + Math.random() * 0.2, 0.03, 1); s.position.set(-0.75 - Math.random() * 0.4, (Math.random() - 0.5) * 0.85, 0.04); s.renderOrder = 14;
      G.root.add(s); G.streaks.push({ s, v: 0.9 + Math.random() * 0.7, life: 2.2 });
    }
  }

  /* ── the end ── */
  function finale() {
    G.playing = false; G.over = true; passButton(false); hideBig(); G.gust = { phase: 'calm', t: 1e9 };
    for (let k = 0; k < 70; k++) addShard(true);             // the tree blazes
    G.blaze = 0;
    NOTES.forEach((f, i) => tone(f, 2.2, { type: 'triangle', vol: 0.07, pan: chest(i)[0] * 1.6, delay: i * 0.07 }));
    G.buzz([60, 40, 60, 40, 220]);
    setTimeout(() => {
      if (!G) return;
      big('Curating hope together', '“It’s so important to curate hope together.” — Ben Fox' + (G.holds ? '. You held steady through ' + G.holds + (G.holds === 1 ? ' cold gust.' : ' cold gusts.') : ''), 0, true);
      G.say('You passed the hope all the way down the line. It’s so important to curate hope together. Press Ben’s story to hear it from him.');
    }, 1400);
    const src = G.work && G.work.overlay && G.work.overlay.anim;  // the painting comes alive
    if (src) {
      const v = document.createElement('video'); Object.assign(v, { src, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
      v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
      G.anim = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 }));
      G.anim.position.z = 0.005; G.anim.renderOrder = 5; G.anim.visible = false; G.root.add(G.anim); G.animVideo = v;
      v.addEventListener('playing', () => { if (G && G.anim) { G.anim.visible = true; G.animT = 0; } });
      setTimeout(() => { if (G) v.play().catch(() => {}); }, 2600);
    }
  }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  return {
    title: 'Curating Hope',
    start(ctx) {
      if (G) this.stop(); audio();
      G = { ...ctx, root: new THREE.Group(), people: [], shards: [], streaks: [], idx: 0, flight: null, recvT: 0, holding: false, pressT: 0, playing: false, over: false, paused: false,
            t: 0, bigT: 0, holds: 0, blown: 0, introT: 3.2 };
      ctx.group.add(G.root);
      // a warm wash over the cold half that grows as hope is shared
      G.warm = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a3c, transparent: true, depthWrite: false, opacity: 0 }));
      const [wx, wy] = P(COLD_CANOPY.x, COLD_CANOPY.y + 40); G.warm.position.set(wx, wy, 0.008); G.warm.scale.set(0.62, 0.66, 1); G.warm.renderOrder = 6; G.root.add(G.warm);
      G.chill = new THREE.Mesh(new THREE.PlaneGeometry(1.02, G.h * 1.02), new THREE.MeshBasicMaterial({ color: 0x3a78c8, transparent: true, opacity: 0, depthWrite: false }));
      G.chill.position.z = 0.035; G.chill.renderOrder = 13; G.root.add(G.chill);
      PEOPLE.forEach((_, i) => {
        const [cx, cy] = chest(i);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
        glow.position.set(cx, cy, 0.02); glow.scale.set(0.09, 0.13, 1); glow.renderOrder = 8; G.root.add(glow);
        const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0 }));
        ring.position.set(cx, cy, 0.045); ring.scale.set(0.07, 0.07, 1); ring.renderOrder = 15; G.root.add(ring);
        const hit = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.12), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(cx, cy, 0.05); hit.userData.i = i; G.root.add(hit);
        G.people.push({ glow, ring, hit, lit: false, link: null, shards: [], t: 0 });
      });
      G.leaf = new THREE.Sprite(new THREE.SpriteMaterial({ map: leafTex, transparent: true, depthWrite: false }));
      G.leaf.scale.set(0.055, 0.055, 1); G.leaf.renderOrder = 16; G.root.add(G.leaf);
      lightUp(0); setHud(); scheduleGust();
      big('Pass it on', 'Pass the hope down the line. When a cold gust comes, press and hold.', 3);
      G.say('Curating hope. Pass it on. Pass the leaf of hope down the line, person to person: tap anywhere, or press Pass it on. When a cold gust comes, press and hold until it passes.');
      passButton(true); setButton();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; if (G.recvT > 0) G.recvT -= dt;
      if (G.bigT > 0) { G.bigT -= dt; if (G.bigT <= 0) hideBig(); }
      if (!G.playing && !G.over) { G.introT -= dt; if (G.introT <= 0) G.playing = true; }
      if (G.playing) updateGust(dt);
      // the leaf: held by the current person, or flying in an arc between two
      if (G.flight) {
        const f = G.flight; f.t += dt / (f.back ? 0.6 : 0.42); const k = Math.min(1, f.t), e = 1 - (1 - k) * (1 - k);
        const [ax, ay] = hand(f.from), [bx, by] = hand(f.to);
        G.leaf.position.set(ax + (bx - ax) * e, ay + (by - ay) * e + Math.sin(k * Math.PI) * (f.back ? 0.03 : 0.07), 0.05);
        G.leaf.material.rotation += dt * (f.back ? -9 : 6);
        if (k >= 1) { G.flight = null; if (!f.back) arrive(f.to); }
      } else {
        const [hx, hy] = hand(G.idx), g = G.gust, blowing = g && g.phase === 'blow';
        const wob = blowing ? (G.holding ? 0.004 : 0.02) : 0.003;
        G.leaf.position.set(hx + Math.sin(G.t * (blowing ? 19 : 2.4)) * wob + (blowing && !G.holding ? 0.012 : 0), hy + 0.012 + Math.sin(G.t * 2.1) * 0.004, 0.05);
        G.leaf.material.rotation = Math.sin(G.t * 1.6) * 0.3 + (blowing ? Math.sin(G.t * 23) * 0.4 : 0);
      }
      // people: lit ones glow warm; the next one pulses so you know where hope goes
      const lit = G.people.filter(p => p.lit).length, nxt = G.over ? -1 : G.idx + 1;
      G.people.forEach((p, i) => {
        p.t += dt;
        p.glow.material.opacity += ((p.lit ? 0.85 + Math.sin(G.t * 2 + i) * 0.1 : 0) - p.glow.material.opacity) * Math.min(1, dt * 4);
        p.ring.material.opacity = i === nxt && G.playing ? 0.5 + Math.sin(G.t * 5) * 0.4 : Math.max(0, p.ring.material.opacity - dt * 3);
        if (i === nxt) p.ring.scale.setScalar(0.065 + Math.sin(G.t * 5) * 0.008);
        if (p.link) p.link.material.opacity = Math.min(0.9, p.link.material.opacity + dt * 2) * (0.85 + Math.sin(G.t * 3 + i) * 0.15);
      });
      for (const sh of G.shards) {
        if (sh.fall) { sh.fall += dt; sh.m.position.x += dt * 0.5; sh.m.position.y -= dt * 0.12; sh.m.material.opacity = Math.max(0, 1 - (sh.fall - 1) * 1.5); continue; }
        if (sh.delay > 0) { sh.delay -= dt; continue; }
        sh.grow = Math.min(1, sh.grow + dt * 2.2); const s = sh.grow < 1 ? 1 - Math.pow(1 - sh.grow, 3) * (1 - Math.sin(sh.grow * 6) * 0.1) : 1;
        sh.m.scale.setScalar(s); sh.m.rotation.z += sh.spin * dt;
      }
      G.shards = G.shards.filter(sh => { if (!sh.fall || sh.m.material.opacity > 0) return true; G.root.remove(sh.m); sh.m.geometry.dispose(); sh.m.material.dispose(); return false; });
      G.warm.material.opacity += ((G.over ? 0.75 : (lit - 1) / (PEOPLE.length - 1) * 0.45) - G.warm.material.opacity) * Math.min(1, dt * 1.5);
      const g = G.gust, chillTo = g && g.phase === 'blow' ? 0.22 : g && g.phase === 'warn' ? 0.08 : 0;
      G.chill.material.opacity += (chillTo - G.chill.material.opacity) * Math.min(1, dt * 5);
      for (const st of G.streaks) { st.life -= dt; st.s.position.x += st.v * dt; st.s.material.opacity = Math.max(0, Math.min(0.9, st.life * 0.8)); }
      G.streaks = G.streaks.filter(st => { if (st.life > 0) return true; G.root.remove(st.s); st.s.material.dispose(); return false; });
      if (G.anim && G.anim.visible) { G.animT += dt; G.anim.material.opacity = Math.min(0.92, G.animT * 0.6); }
      setButton();
    },
    pointer(kind, ev) {
      if (!G || G.paused) return;
      if (kind === 'down') { press(true); G.downAt = { x: ev.clientX, y: ev.clientY }; return; }
      if (kind !== 'up') return;
      // tapping a specific person: only the next one in line takes the hope
      if (G.downAt && Math.hypot(ev.clientX - G.downAt.x, ev.clientY - G.downAt.y) < 14) {
        const r = G.renderer.domElement.getBoundingClientRect();
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, G.camera);
        const h = ray.intersectObjects(G.people.map(p => p.hit))[0];
        if (h && h.object.userData.i !== G.idx + 1 && h.object.userData.i !== G.idx) { G.holding = false; tone(220, 0.12, { type: 'triangle', vol: 0.06 }); G.say('Pass it to the next person in line', false); return; }
      }
      press(false);
    },
    pause() { if (G) { G.paused = true; G.holding = false; } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { idx: G.idx, gust: G.gust && G.gust.phase, holds: G.holds, blown: G.blown, playing: G.playing, over: G.over, flying: !!G.flight }; },
    stop() {
      if (!G) return;
      if (G.animVideo) { G.animVideo.pause(); G.animVideo.removeAttribute('src'); G.animVideo.load(); }
      G.group.remove(G.root); G.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      for (const id of ['chHud', 'chBig', 'chPass']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
      G = null;
    },
  };
}
