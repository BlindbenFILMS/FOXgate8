// CURATING HOPE · "Pass It On": a mini game inside Ben Fox's painting.
//   "It's so important to curate hope together…" — Ben Fox
// A single warm leaf of hope starts with the person at the warm end of the line (right). Pass it on, person to
// person, toward the cold side (left): tap anywhere, press PASS IT ON, or press Space. Everyone it reaches lights
// up, joins hands, adds their own note to a growing chord, and warm leaves grow on the tree's cold side.
// Catch it!: from the third pass the wind can grab the leaf mid-flight; tap fast to catch it, or it blows back.
// Cold gusts blow in from the left: when one comes, press and HOLD until it passes, or the wind takes the hope back
// a person. When the whole line is connected, the tree blazes warm, Ben's animation of the painting comes alive,
// and his words appear.
// Playable by ear: each person has their own note (connecting the line builds a sustained chord, panned where they
// stand), the gusts whoosh in from the left with a spoken warning, and every pass, catch, hold and loss has a sound
// and a buzz.
// Art: Claude Design's PNGs in media/games/curating-hope/ (leaf of hope, person glow, hand link, warm leaves, gust).
// Every picture has a drawn-in-code fallback, so a missing file never breaks the game.
// Robot mode (&bot=1 or ctx.bot): the game plays itself to the finale through the same handlers a player uses.
//
// Game API (see lib/minigames/index.js): start(ctx) · update(dt) · pointer(kind, event) · pause() · resume() · stop() · over · debug
import * as THREE from 'three';
import * as K from './kit.js';

// the people at the roots, from the warm end (right) to the cold end (left): [x, top, bottom] in painting pixels (Design)
const PEOPLE = [[873, 722, 805], [800, 725, 815], [760, 728, 810], [695, 705, 805], [645, 692, 795], [595, 685, 785], [445, 662, 780],
                [388, 695, 790], [328, 718, 800], [278, 705, 800], [250, 712, 805], [204, 720, 815], [157, 735, 815], [105, 728, 815]];
const MIDI = [48, 52, 55, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];   // each person's note: together they build a chord
const NOTES = MIDI.map(m => 440 * Math.pow(2, (m - 69) / 12));
const WARM = ['#ffb347', '#ff8a2a', '#ffd166', '#f25c2a', '#ffc04d', '#e8452c', '#ffe08a'];
const COLD_CANOPY = { x: 270, y: 300, rx: 215, ry: 225 };   // the blue half of the tree, in painting pixels
const SPOTS = []; for (let i = 0; i < 60; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()); SPOTS.push([300 + Math.cos(a) * r * 200 - 60 * r, 280 + Math.sin(a) * r * 150]); }
let H = 1;                                                   // painting height / width
const P = (x, y) => [x / 1024 - 0.5, (0.5 - y / 1024) * H];  // painting pixels → board units (1 wide, centred, y up)
const PX = v => v / 1024;
// Design's rules
const FLIGHT = 0.75, ARC = 230, LIFT = 70;                   // pass flight seconds, arc height px, leaf held this far above the hand
const GRACE = 0.25;                                          // a finger slip shorter than this during a gust is forgiven

/* ── Design's art (loaded once, used when ready; drawn-in-code fallbacks otherwise) ── */
const ART_DIR = 'media/games/curating-hope/';
const ART_NAMES = ['hope-leaf', 'person-glow', 'hands-link', 'gust', ...[1, 2, 3, 4, 5, 6, 7, 8].map(k => 'warm-leaf-' + k)];
const ART = {}; let artV = 0, artAsked = false;
function loadArt() {
  if (artAsked) return; artAsked = true;
  const L = new THREE.TextureLoader();
  for (const n of ART_NAMES) {
    const e = ART[n] = { tex: null, ok: false, failed: false };
    L.load(ART_DIR + n + '.png', t => { t.colorSpace = THREE.SRGBColorSpace; e.tex = t; e.ok = true; artV++; }, undefined, () => { e.failed = true; artV++; });
  }
}
const art = n => (ART[n] && ART[n].ok ? ART[n].tex : null);
const artSettled = () => ART_NAMES.every(n => ART[n] && (ART[n].ok || ART[n].failed));
const warmLeafTexs = () => ART_NAMES.filter(n => n.startsWith('warm-leaf')).map(art).filter(Boolean);
setTimeout(loadArt, 2500);                                   // preload soon after the gallery opens (the game also asks on start)

/* ── sound ── */
const audio = K.audio;
function out(pan) { const a = audio(); if (!a) return null; if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan || 0)); p.connect(a.destination); return p; } return a.destination; }
function tone(f, dur, { type = 'sine', vol = 0.15, pan = 0, slide = 0, delay = 0 } = {}) {
  const a = audio(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out(pan)); o.start(t); o.stop(t + dur + 0.02);
}
function wind(dur, { vol = 0.3, pan = -0.8, from = 300, to = 1400, delay = 0, panTo = null } = {}) {      // a gust: filtered noise that swells and sweeps
  const a = audio(); if (!a) return; const t = a.currentTime + delay;
  const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = n;
  f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur * 0.7);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const o = out(pan); if (panTo != null && o && o.pan) o.pan.linearRampToValueAtTime(panTo, t + dur);
  s.connect(f).connect(g).connect(o); s.start(t);
}

/* ── drawn-in-code pictures (the fallbacks) ── */
const canvasTex = K.canvasTex;
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

const ICON_PASS = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
const ICON_HAND = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>';

export function curatingHopeGame() {
  let G = null;
  loadArt();

  function setHud() {
    const n = G.idx + 1;
    G.ui.panel('Pass it on', 'Hope shared ' + n + ' <small>/ ' + PEOPLE.length + '</small>', { segs: [n, PEOPLE.length] });
  }

  /* the big PASS / HOLD / CATCH button: tap to pass, press and hold through a gust, tap fast to catch */
  function passButton(show) {
    let b = document.getElementById('chPass');
    if (!b && show) {
      b = document.createElement('button'); b.id = 'chPass'; b.type = 'button';
      b.style.cssText = 'position:fixed;left:calc(16px + env(safe-area-inset-left));right:calc(16px + env(safe-area-inset-right));bottom:calc(96px + env(safe-area-inset-bottom));z-index:12;min-height:64px;padding:0 22px;overflow:hidden;' +
        'display:flex;align-items:center;gap:12px;background:#ec3013;color:#fff;border:2px solid #000;border-radius:0;font:900 clamp(20px,6.4vw,26px)/1 Archivo,"Arial Black",Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none';
      b.innerHTML = '<i style="position:absolute;left:0;top:0;bottom:0;width:0;background:#0d2f8f;pointer-events:none"></i><span style="position:relative;display:flex;align-items:center;gap:12px;pointer-events:none"></span>';
      b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} press(true); });
      for (const k of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture']) b.addEventListener(k, () => press(false));
      b.addEventListener('contextmenu', e => e.preventDefault());
      document.body.appendChild(b);
    }
    if (b) b.style.display = show ? 'flex' : 'none';
    return b;
  }
  function setButton() {
    const b = document.getElementById('chPass'); if (!b || !G) return;
    const g = G.gust, gust = g && g.phase !== 'calm', catching = !!(G.flight && G.flight.sweep);
    const label = catching ? 'Catch!' : gust ? (G.holding ? 'Holding…' : 'Hold!') : 'Pass it on';
    const key = label + (gust ? 1 : 0) + (catching ? 1 : 0);
    if (b.dataset.k !== key) {
      b.dataset.k = key; b.lastChild.innerHTML = label + (gust ? ICON_HAND : ICON_PASS);
      b.style.background = catching ? '#ec3013' : gust ? '#1f4fd8' : '#ec3013';
      b.style.border = gust ? '3px solid #fff' : '2px solid #000'; b.style.boxShadow = gust ? '0 0 0 3px #000' : 'none';
      b.setAttribute('aria-label', catching ? 'The wind grabbed the leaf: tap fast to catch it' : gust ? 'A cold gust: press and hold until it passes' : 'Pass the hope on to the next person');
    }
    b.firstChild.style.width = (g && g.phase === 'blow' ? Math.min(1, g.t / g.dur) * 100 : 0) + '%';
  }
  function press(down) {
    if (!G || G.paused || G.over) return;
    if (down) {
      if (G.holding) return;
      G.holding = true; G.pressT = performance.now();
      if (G.flight && G.flight.sweep) catchIt();              // Catch it! fires on the press, not the release
    } else if (G.holding) {
      G.holding = false;
      const quick = performance.now() - G.pressT < 350;
      if (quick && G.gust.phase === 'calm') pass();
    }
    setButton();
  }

  /* ── people, hands, leaves ── */
  const hand = i => { const [x, t, b] = PEOPLE[i]; return P(x, t + (b - t) * 0.45); };
  const chest = i => { const [x, t, b] = PEOPLE[i]; return P(x, (t + b) / 2); };
  const panOf = x => Math.max(-1, Math.min(1, x * 1.6));
  function lightUp(i) {
    const p = G.people[i]; p.lit = true; p.glow.material.opacity = 0; p.t = 0;
    if (i > 0) {                                           // joined hands: a warm line of light to the person before
      const [ax, ay] = hand(i - 1), [bx, by] = hand(i), len = Math.hypot(bx - ax, by - ay), tex = art('hands-link');
      const geo = new THREE.PlaneGeometry(len, tex ? PX(28) : 0.007); geo.translate(len / 2, 0, 0);   // grows out of the person before
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(tex ? { map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }
        : { color: 0xffc46b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.position.set(ax, ay, 0.03); m.rotation.z = Math.atan2(by - ay, bx - ax); m.scale.x = 0.001; m.renderOrder = 9; G.root.add(m); p.link = m; p.linkT = 0;
    }
    p.shards = [];                                         // warm leaves grow on the cold side of the tree
    if (warmLeafTexs().length) for (let k = 0; k < 2; k++) { const sp = SPOTS[(i * 2 + k) % SPOTS.length]; p.shards.push(addLeaf(sp[0], sp[1], 70 + Math.random() * 30, 0)); }
    else for (let k = 0; k < 7; k++) p.shards.push(addShard(false));
    padAdd(i);
  }
  function addLeaf(x, y, sizePx, delay) {                  // one of Design's warm leaves, popping in with a little overshoot
    const texs = warmLeafTexs(), [px, py] = P(x, y), s = PX(sizePx);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: texs[(Math.random() * texs.length) | 0], transparent: true, depthWrite: false }));
    m.position.set(px, py, 0.012 + Math.random() * 0.004); m.rotation.z = Math.random() * 6.28; m.scale.setScalar(0.01); m.renderOrder = 7; G.root.add(m);
    const sh = { m, grow: 0, delay, spin: (Math.random() - 0.5) * 0.3, rate: 1 / 0.6, back: true }; G.shards.push(sh); return sh;
  }
  function addShard(fast) {
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random());
    const x = Math.min(500, COLD_CANOPY.x + Math.cos(a) * COLD_CANOPY.rx * rr), y = COLD_CANOPY.y + Math.sin(a) * COLD_CANOPY.ry * rr;
    if (warmLeafTexs().length) return addLeaf(x, y, fast ? 34 + Math.random() * 34 : 45 + Math.random() * 25, fast ? Math.random() * 1.2 : Math.random() * 0.5);
    const [px, py] = P(x, y), s = 0.018 + Math.random() * 0.02;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: shardTexs[(Math.random() * shardTexs.length) | 0], transparent: true, depthWrite: false }));
    m.position.set(px, py, 0.012 + Math.random() * 0.004); m.rotation.z = Math.random() * 6.28; m.scale.setScalar(0.01); m.renderOrder = 7; G.root.add(m);
    const sh = { m, grow: 0, delay: fast ? Math.random() * 1.2 : Math.random() * 0.5, spin: (Math.random() - 0.5) * 0.4, rate: 2.2 }; G.shards.push(sh); return sh;
  }
  function unlight(i) {
    const p = G.people[i]; p.lit = false;
    if (p.link) { const l = p.link; p.link = null; G.dying.push({ m: l, t: 0, dur: 0.6 }); }
    for (const sh of p.shards || []) {                     // the warm leaves it brought blow away to the left
      sh.fall = 0; sh.from = [sh.m.position.x, sh.m.position.y]; sh.dx = -PX(260 + Math.random() * 200); sh.dy = PX(-60 + Math.random() * 120); sh.rot = -(3.5 + Math.random() * 3.5); sh.s0 = sh.m.scale.x;
    }
    p.shards = [];
    padRemove(i);
  }

  /* ── the chord: one soft sustained note per connected person (Design) ── */
  function padAdd(i) {
    const a = audio(); if (!a || !G.padBus || G.pads[i]) return;
    const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1600; o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = NOTES[i]; o2.frequency.value = NOTES[i] * 1.003;
    g.gain.setValueAtTime(0.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(0.022, a.currentTime + 0.8);
    let n = lp.connect(g); if (a.createStereoPanner) { const pn = a.createStereoPanner(); pn.pan.value = panOf(chest(i)[0]); n = n.connect(pn); }
    o.connect(lp); o2.connect(lp); n.connect(G.padBus); o.start(); o2.start(); G.pads[i] = { o, o2, g };
  }
  function padRemove(i) {
    const p = G && G.pads[i]; if (!p) return; const a = audio(); G.pads[i] = null;
    try { p.g.gain.cancelScheduledValues(a.currentTime); p.g.gain.setTargetAtTime(0.0001, a.currentTime, 0.25); p.o.stop(a.currentTime + 1.5); p.o2.stop(a.currentTime + 1.5); } catch (e) {}
  }

  /* ── passing (and catching) ── */
  function pass() {
    if (!G.playing || G.flight || G.recvT > 0 || G.idx >= PEOPLE.length - 1 || G.gust.phase !== 'calm') return;   // each person holds the hope a moment first
    const from = G.idx, to = G.idx + 1, [x1, y1] = hand(from), [x2, y2] = hand(to);
    G.flight = { from, to, t: 0, dur: FLIGHT, arc: PX(ARC), x1, y1: y1 + PX(LIFT), x2, y2: y2 + PX(LIFT), checked: false };
    tone(NOTES[from] * 4, 0.08, { type: 'sine', vol: 0.08, pan: panOf(x1) });
  }
  function arrive(to) {
    G.idx = to; G.passes++; lightUp(to); setHud(); G.recvT = 0.35;
    const pan = panOf(chest(to)[0]);
    tone(NOTES[to], 1.4, { type: 'triangle', vol: 0.2, pan }); tone(NOTES[to] * 2, 0.5, { type: 'sine', vol: 0.05, pan, delay: 0.02 });
    G.buzz(25);
    if (to === PEOPLE.length - 1) return finale();
    if (to === 6) G.say('Halfway there. ' + (to + 1) + ' people sharing hope');
    else if (to % 4 === 0) G.say((to + 1) + ' people sharing hope');
  }
  function grab(f, x, y) {                                 // Catch it!: the wind snatches the leaf mid-flight
    f.sweep = { t: 0, x, y, dir: 1, lim: Math.max(1.1, 1.7 - G.idx * 0.04) };
    wind(0.9, { vol: 0.5, from: 400, to: 1800, pan: panOf(x), panTo: Math.min(1, panOf(x) + 0.6) });
    tone(660, 0.25, { type: 'square', vol: 0.07, slide: 500 }); G.buzz([30, 30, 30]);
    G.ui.alert('Catch it!', 'The wind grabbed the leaf. Tap fast!', 1.7, 'red'); G.say('Catch it!');
    setButton();
  }
  function catchIt() {
    const f = G.flight, S = f.sweep;
    G.flight = { from: f.from, to: f.to, t: 0, dur: 0.55, arc: PX(60), x1: S.x, y1: S.y, x2: f.x2, y2: f.y2, checked: true, spin0: G.leaf.material.rotation };
    G.catches++; tone(1320, 0.15, { type: 'triangle', vol: 0.15, pan: panOf(S.x) }); tone(1760, 0.3, { type: 'triangle', vol: 0.12, delay: 0.08, pan: panOf(S.x) }); G.buzz(20);
    G.ui.alert('Caught it!', null, 1, 'black'); G.say('Caught it!');
  }
  function missCatch() {
    const f = G.flight, S = f.sweep, [hx, hy] = hand(G.idx);
    G.flight = { from: f.to, to: G.idx, t: 0, dur: 0.6, arc: PX(60), x1: S.x, y1: S.y, x2: hx, y2: hy + PX(LIFT), checked: true, back: true };
    G.misses++; tone(220, 0.4, { type: 'sawtooth', vol: 0.1, slide: -60 }); G.buzz([60, 40, 60]);
    G.ui.alert('Blown back', 'Pass it on again.', 1.5, 'blue'); G.say('The wind blew it back. Try again.');
  }

  /* ── gusts ── */
  function scheduleGust(first) { G.gust = { phase: 'calm', t: first ? 7 + Math.random() * 3 : Math.max(3.5, 6.5 - G.idx * 0.2) + Math.random() * 3 }; }
  function updateGust(dt) {
    const g = G.gust;
    if (g.phase === 'calm') {
      if (G.passes < 2 || G.idx >= PEOPLE.length - 1 || (G.flight && G.flight.sweep)) return;   // none before the second pass or while catching
      g.t -= dt;
      if (g.t <= 0 && !G.flight) {                           // a due gust waits for the leaf to land, then comes
        if (G.idx === 0) { g.t = 1; return; }
        g.phase = 'warn'; g.t = 0; g.dur = 2.4 + G.idx * 0.09; g.free = 0;
        wind(1.3, { vol: 0.16, from: 200, to: 600, pan: -0.9 }); G.buzz([40, 60, 40]);
        G.ui.alert('Cold gust coming!', 'Press and hold until it passes.', 1.3, 'blue'); G.say('Cold gust coming! Press and hold.');
        setButton();
      }
    } else if (g.phase === 'warn') {
      g.t += dt;
      if (g.t >= 1.3) { g.phase = 'blow'; g.t = 0; wind(g.dur, { vol: 0.42, from: 500, to: 1800, pan: -0.9, panTo: 0.9 }); spawnStreaks(); G.ui.alert('Hold on!', 'Press and hold until it passes.', g.dur, 'blue'); }
    } else if (g.phase === 'blow') {
      g.t += dt;
      g.free = G.holding ? 0 : g.free + dt;                // letting go (beyond a brief slip) loses the last person
      if (g.free > GRACE) { blown(); scheduleGust(); setButton(); return; }
      if (g.t >= g.dur) {
        G.holds++; tone(880, 0.3, { type: 'triangle', vol: 0.15 }); tone(1320, 0.5, { type: 'triangle', vol: 0.12, delay: 0.12 }); G.buzz(40);
        G.ui.alert('You held on!', null, 1.4, 'black'); G.say('You held on!');
        scheduleGust(); setButton();
      }
    }
  }
  function blown() {
    G.blown++;
    tone(180, 0.5, { type: 'sawtooth', vol: 0.1, slide: -80 }); G.buzz([80, 40, 80]);
    if (G.idx > 0) {
      const lost = G.idx; unlight(lost); G.idx--; setHud();
      const [ax, ay] = hand(lost), [bx, by] = hand(G.idx);
      G.flight = { from: lost, to: G.idx, t: 0, dur: 0.6, arc: PX(60), x1: ax, y1: ay + PX(LIFT), x2: bx, y2: by + PX(LIFT), checked: true, back: true };
      G.ui.alert('The wind took it', 'Back one person. Pass it on again.', 1.8, 'blue'); G.say('The wind took it. Back one person. Pass it on again.');
    } else { G.ui.alert('Hold on tight', null, 1, 'blue'); }
  }
  function spawnStreaks() {
    if (art('gust')) return;                               // Design's gust art sweeps across instead
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, transparent: true, depthWrite: false, opacity: 0 }));
      s.scale.set(0.28 + Math.random() * 0.2, 0.03, 1); s.position.set(-0.75 - Math.random() * 0.4, (Math.random() - 0.5) * 0.85, 0.04); s.renderOrder = 14;
      G.root.add(s); G.streaks.push({ s, v: 0.9 + Math.random() * 0.7, life: 2.2 });
    }
  }
  // a gust strip (Design: gust.png sweeping left → right), trimmed to the painting's edges so it never spills off the canvas
  function gustStrip(flip) {
    const geo = new THREE.PlaneGeometry(1, 1), m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    m.frustumCulled = false; m.renderOrder = 14; m.position.z = 0.04; m.visible = false; m.userData.flip = flip; G.root.add(m); return m;
  }
  function placeStrip(m, leftPx, widthPx, topPx, heightPx) {
    const L = PX(leftPx) - 0.5, W = PX(widthPx), x0 = Math.max(L, -0.5), x1 = Math.min(L + W, 0.5);
    if (x1 <= x0) { m.visible = false; return; }
    const yT = (0.5 - topPx / 1024) * H, yB = (0.5 - (topPx + heightPx) / 1024) * H, u0 = (x0 - L) / W, u1 = (x1 - L) / W;
    const vT = m.userData.flip ? 0 : 1, vB = 1 - vT, pos = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
    pos.setXYZ(0, x0, yT, 0); pos.setXYZ(1, x1, yT, 0); pos.setXYZ(2, x0, yB, 0); pos.setXYZ(3, x1, yB, 0);
    uv.setXY(0, u0, vT); uv.setXY(1, u1, vT); uv.setXY(2, u0, vB); uv.setXY(3, u1, vB); pos.needsUpdate = true; uv.needsUpdate = true; m.visible = true;
  }

  /* ── the end ── */
  function finale() {
    G.playing = false; G.over = true; passButton(false); G.ui.hideAlert(); G.gust = { phase: 'calm', t: 1e9 }; G.holding = false;
    for (let k = 0; k < 70; k++) addShard(true);             // the tree blazes
    G.blaze = 0;
    NOTES.forEach((f, i) => tone(f, 2.6, { type: 'triangle', vol: 0.07, pan: panOf(chest(i)[0]), delay: i * 0.06 }));
    G.buzz([60, 40, 60, 40, 220]);
    G.timers.push(setTimeout(() => {
      if (!G) return;
      G.ui.end({ kicker: 'Hope shared ' + PEOPLE.length + ' / ' + PEOPLE.length, title: 'Curating hope together',
        cells: [{ k: 'Cold gusts held', v: String(G.holds) }, { k: 'Leaves caught', v: String(G.catches) }],
        line: '“It’s so important to curate hope together.” — Ben Fox', storyLabel: 'Ben’s story', onStory: () => { if (G && G.story) G.story(); } });
      G.say('Curating hope together. You passed the hope all the way down the line' + (G.holds ? ', and held on through ' + G.holds + (G.holds === 1 ? ' cold gust' : ' cold gusts') : '') +
        '. It’s so important to curate hope together. Press Ben’s story to hear it from him.');
    }, 1400));
    const src = G.work && G.work.overlay && G.work.overlay.anim;  // the painting comes alive
    if (src) {
      const v = document.createElement('video'); Object.assign(v, { src, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
      v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
      G.anim = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 }));
      G.anim.position.z = 0.005; G.anim.renderOrder = 5; G.anim.visible = false; G.root.add(G.anim); G.animVideo = v;
      v.addEventListener('playing', () => { if (G && G.anim) { G.anim.visible = true; G.animT = 0; } });
      G.timers.push(setTimeout(() => { if (G) v.play().catch(() => {}); }, 1800));
    }
  }

  /* ── robot: plays through the same press() a finger or Space uses ── */
  function robot(dt) {
    const R = G.robot; R.t -= dt;
    const g = G.gust, gust = g.phase !== 'calm';
    if (G.flight && G.flight.sweep) {                        // catch it after a human-ish reaction time
      if (R.catchT == null) R.catchT = 0.35 + Math.random() * 0.3;
      R.catchT -= dt; if (R.catchT <= 0) { R.catchT = null; press(true); R.release = 0.05; }
    }
    if (R.release != null) { R.release -= dt; if (R.release <= 0) { R.release = null; press(false); } return; }
    if (gust) {
      if (!G.holding && g.phase === 'warn' && g.t > 0.5) { press(true); R.gusts++; R.letGo = R.gusts === 1; }   // hold through it…
      if (R.letGo && g.phase === 'blow' && g.t > g.dur * 0.4 && G.holding) { press(false); R.letGo = false; }      // …except once, to test the loss
      return;
    }
    if (G.holding) { press(false); return; }                 // the gust passed: let go
    if (!G.flight && G.recvT <= 0 && R.t <= 0) { R.t = 0.3; press(true); R.release = 0.04; }
  }

  function onKey(e) {
    if (e.key !== ' ' && e.code !== 'Space') return;
    const t = e.target; if (t && t !== document.body && t.id !== 'chPass' && /^(BUTTON|INPUT|TEXTAREA|SELECT|A)$/.test(t.tagName)) return;
    e.preventDefault(); if (e.repeat) return;
    press(e.type === 'keydown');
  }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  return {
    title: 'Curating Hope',
    start(ctx) {
      if (G) this.stop(); audio(); loadArt(); H = ctx.h || 1;
      G = { ...ctx, bot: ctx.bot ?? K.isBot(), root: new THREE.Group(), ui: K.ui(), people: [], shards: [], streaks: [], dying: [], timers: [], pads: [],
            idx: 0, passes: 0, flight: null, recvT: 0, holding: false, pressT: 0, playing: false, over: false, paused: false,
            t: 0, holds: 0, blown: 0, catches: 0, misses: 0, introT: 3.2, artV: -1, robot: { t: 0.4, gusts: 0 } };
      if (G.bot) G.introT = 1.2;
      ctx.group.add(G.root);
      const a = audio(); if (a) { G.padBus = a.createGain(); G.padBus.connect(a.destination); }
      // a warm wash over the cold half that grows as hope is shared
      G.warm = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a3c, transparent: true, depthWrite: false, opacity: 0 }));
      const [wx, wy] = P(COLD_CANOPY.x, COLD_CANOPY.y + 40); G.warm.position.set(wx, wy, 0.008); G.warm.scale.set(0.62, 0.66, 1); G.warm.renderOrder = 6; G.root.add(G.warm);
      // the finale's blaze (Design: a warm radial glow at 30% / 40% that swells and fades as the animation arrives)
      G.blazeS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffaa3c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
      const [bx, by] = P(307, 410); G.blazeS.position.set(bx, by, 0.02); G.blazeS.scale.set(1.45, 1.25, 1); G.blazeS.renderOrder = 12; G.root.add(G.blazeS);
      G.chill = new THREE.Mesh(new THREE.PlaneGeometry(1.02, G.h * 1.02), new THREE.MeshBasicMaterial({ color: 0x3a78c8, transparent: true, opacity: 0, depthWrite: false }));
      G.chill.position.z = 0.035; G.chill.renderOrder = 13; G.root.add(G.chill);
      G.gusts = [gustStrip(false), gustStrip(true)];
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
      G.leafSize = 0.055; G.leaf.scale.set(0.055, 0.055, 1); G.leaf.renderOrder = 16; G.root.add(G.leaf);
      this._applyArt();
      lightUp(0); tone(NOTES[0], 1.2, { type: 'triangle', vol: 0.2, pan: panOf(chest(0)[0]) });
      setHud(); scheduleGust(true);
      G.ui.banner('Pass it on', 'Tap to pass the leaf of hope along the line. When a cold gust comes, press and hold.', G.introT, 'Curating Hope · mini game');
      G.say('Curating hope. Pass it on. Pass the leaf of hope down the line, person to person: tap anywhere, press Pass it on, or press Space. If the wind grabs the leaf, tap fast to catch it. When a cold gust comes, press and hold until it passes.');
      passButton(true); setButton();
      addEventListener('keydown', onKey); addEventListener('keyup', onKey);
    },
    // swap Design's pictures in as they arrive (keeps the drawn-in-code ones if a file is missing)
    _applyArt() {
      if (!G || G.artV === artV) return; G.artV = artV;
      const lf = art('hope-leaf'); if (lf && G.leaf.material.map !== lf) { G.leaf.material.map = lf; G.leaf.material.needsUpdate = true; G.leafSize = PX(150); }
      const pg = art('person-glow');
      if (pg) G.people.forEach((p, i) => {
        if (p.glow.material.map === pg) return;
        const [x, t, b] = PEOPLE[i], h = (b - t) * 1.7, [cx, cy] = P(x, (t + b) / 2 - 6);
        p.glow.material.map = pg; p.glow.material.needsUpdate = true; p.glow.position.set(cx, cy, 0.02); p.glow.scale.set(PX(h / 2), PX(h) * H, 1);
      });
      const gt = art('gust'); if (gt) for (const m of G.gusts) if (m.material.map !== gt) { m.material.map = gt; m.material.needsUpdate = true; }
    },
    update(dt) {
      if (!G || G.paused) return;
      this._applyArt();
      G.t += dt; if (G.recvT > 0) G.recvT -= dt;
      G.ui.update(dt);
      if (!G.playing && !G.over) { G.introT -= dt; if (G.introT <= 0) { G.playing = true; G.ui.hideBanner(); } }
      if (G.playing) updateGust(dt);
      if (G.playing && G.bot) robot(dt);
      // the leaf: held by the current person, or flying in an arc between two, or snatched by the wind
      const f = G.flight, L = G.leaf;
      if (f && f.sweep) {
        const S = f.sweep; S.t += dt;
        S.x += S.dir * PX(240 + Math.sin(S.t * 6) * 80) * dt; S.y -= PX(-50 + Math.cos(S.t * 5) * 120) * dt;
        if (S.x > PX(870) - 0.5) S.dir = -1; else if (S.x < PX(140) - 0.5) S.dir = 1;   // stays on the painting (in AR the edges are often off screen)
        S.y = Math.max(P(0, 760)[1], Math.min(P(0, 360)[1], S.y));
        L.position.set(S.x, S.y, 0.05); L.scale.setScalar(G.leafSize * (1.3 + Math.sin(S.t * 9) * 0.25)); L.material.rotation -= dt * 9.4;
        if (S.t >= S.lim) missCatch();
      } else if (f) {
        f.t += dt / f.dur; const k = Math.min(1, f.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const x = f.x1 + (f.x2 - f.x1) * e, y = f.y1 + (f.y2 - f.y1) * e + Math.sin(k * Math.PI) * f.arc;
        L.position.set(x, y, 0.05); L.scale.setScalar(G.leafSize * (1 + Math.sin(k * Math.PI) * (f.back ? 0.5 : 2.2)));
        L.material.rotation += dt * (f.back ? -9 : 8.4);
        if (!f.checked && k >= 0.42) {                     // Catch it!: from the third pass the wind can grab the leaf
          f.checked = true;
          if (G.playing && G.passes >= 2 && Math.random() < Math.min(0.55, 0.25 + G.idx * 0.025)) grab(f, x, y);
        }
        if (k >= 1 && !f.sweep) { G.flight = null; if (!f.back) arrive(f.to); }
      } else {
        const [hx, hy] = hand(G.idx), g = G.gust, blowing = g && g.phase === 'blow';
        const wob = blowing ? (G.holding ? 0.004 : 0.02) : 0.003;
        L.position.set(hx + Math.sin(G.t * (blowing ? 19 : 2.4)) * wob + (blowing && !G.holding ? 0.012 : 0), hy + PX(LIFT) + Math.sin(G.t * 3) * PX(6), 0.05);
        L.scale.setScalar(G.leafSize * (1 + Math.sin(G.t * 3) * 0.06));
        L.material.rotation = Math.sin(G.t * 1.6) * 0.3 + (blowing ? Math.sin(G.t * 23) * 0.4 : 0);
      }
      if (G.over) { G.leafFade = (G.leafFade || 0) + dt; L.material.opacity = Math.max(0, 1 - G.leafFade); }
      // people: lit ones glow warm; the next one pulses so you know where hope goes
      const lit = G.people.filter(p => p.lit).length, nxt = G.over ? -1 : G.idx + 1;
      G.people.forEach((p, i) => {
        p.t += dt;
        p.glow.material.opacity += ((p.lit ? 0.85 + Math.sin(G.t * 2 + i) * 0.1 : 0) - p.glow.material.opacity) * Math.min(1, dt * 4);
        p.ring.material.opacity = i === nxt && G.playing ? 0.5 + Math.sin(G.t * 5) * 0.4 : Math.max(0, p.ring.material.opacity - dt * 3);
        if (i === nxt) p.ring.scale.setScalar(0.065 + Math.sin(G.t * 5) * 0.008);
        if (p.link) {
          p.linkT += dt; const k = Math.min(1, p.linkT / 0.45); p.link.scale.x = Math.max(0.001, 1 - Math.pow(1 - k, 3));
          p.link.material.opacity = Math.min(0.95, p.link.material.opacity + dt * 3) * (0.88 + Math.sin(G.t * 3 + i) * 0.12);
        }
      });
      for (const d of G.dying) { d.t += dt; d.m.material.opacity = Math.max(0, 1 - d.t / d.dur); }
      G.dying = G.dying.filter(d => { if (d.t < d.dur) return true; G.root.remove(d.m); d.m.geometry.dispose(); d.m.material.dispose(); return false; });
      for (const sh of G.shards) {
        if (sh.fall != null) {                             // blown away to the left (Design: 1.4 s, ease-in)
          sh.fall += dt; const k = Math.min(1, sh.fall / 1.4), e = k * k;
          sh.m.position.x = sh.from[0] + sh.dx * e; sh.m.position.y = sh.from[1] + sh.dy * e; sh.m.rotation.z += sh.rot * dt;
          sh.m.scale.setScalar(Math.max(0.01, sh.s0 * (1 - 0.4 * k))); sh.m.material.opacity = 1 - k; continue;
        }
        if (sh.delay > 0) { sh.delay -= dt; continue; }
        if (sh.grow < 1) {
          sh.grow = Math.min(1, sh.grow + dt * sh.rate);
          let s; if (sh.back) { const c1 = 2.2, c3 = c1 + 1, u = sh.grow - 1; s = 1 + c3 * u * u * u + c1 * u * u; }   // pop with overshoot
          else s = 1 - Math.pow(1 - sh.grow, 3) * (1 - Math.sin(sh.grow * 6) * 0.1);
          sh.m.scale.setScalar(Math.max(0.01, s));
        }
        sh.m.rotation.z += sh.spin * dt;
      }
      G.shards = G.shards.filter(sh => { if (sh.fall == null || sh.fall < 1.4) return true; G.root.remove(sh.m); sh.m.geometry.dispose(); sh.m.material.dispose(); return false; });
      G.warm.material.opacity += ((G.over ? 0.75 : (lit - 1) / (PEOPLE.length - 1) * 0.45) - G.warm.material.opacity) * Math.min(1, dt * 1.5);
      if (G.over) {
        G.blaze += dt;
        G.blazeS.material.opacity = 0.6 * Math.min(1, G.blaze / 1.2) * (G.blaze < 2.4 ? 1 : Math.max(0, 1 - (G.blaze - 2.4) / 1.2));
        if (G.blaze > 3.6 && !G.padsGone) { G.padsGone = true; G.pads.forEach((_, i) => padRemove(i)); }
      }
      // cold: a blue chill, and Design's gust sweeping across the painting while it blows
      const g = G.gust, chillTo = g && g.phase === 'blow' ? 0.24 : g && g.phase === 'warn' ? 0.1 * Math.min(1, g.t / 1.3) : 0;
      G.chill.material.opacity += (chillTo - G.chill.material.opacity) * Math.min(1, dt * 5);
      const gp = g && g.phase === 'blow' ? g.t / g.dur : -1;
      G.gusts.forEach((m, k) => {
        if (!m.material.map) { m.visible = false; return; }
        if (gp < 0) { m.material.opacity = Math.max(0, m.material.opacity - dt * 2); if (m.material.opacity <= 0) m.visible = false; return; }
        m.material.opacity = 0.9;
        if (k === 0) placeStrip(m, -1300 + gp * 2400, 1300, 380, 325); else placeStrip(m, -1300 + gp * 2400 + 200, 1100, 120, 275);
      });
      for (const st of G.streaks) { st.life -= dt; st.s.position.x += st.v * dt; st.s.material.opacity = Math.max(0, Math.min(0.9, st.life * 0.8)); }
      G.streaks = G.streaks.filter(st => { if (st.life > 0) return true; G.root.remove(st.s); st.s.material.dispose(); return false; });
      if (G.anim && G.anim.visible) { G.animT += dt; G.anim.material.opacity = Math.min(0.92, G.animT / 1.4 * 0.92); }
      setButton();
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'down') { press(true); G.downAt = { x: ev.clientX, y: ev.clientY }; return; }
      if (kind !== 'up') return;
      // tapping a specific person: only the next one in line takes the hope
      if (G.downAt && G.gust.phase === 'calm' && !G.flight && Math.hypot(ev.clientX - G.downAt.x, ev.clientY - G.downAt.y) < 14) {
        const r = G.renderer.domElement.getBoundingClientRect();
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, G.camera);
        const h = ray.intersectObjects(G.people.map(p => p.hit))[0];
        if (h && h.object.userData.i !== G.idx + 1 && h.object.userData.i !== G.idx) { G.holding = false; tone(220, 0.12, { type: 'triangle', vol: 0.06 }); G.say('Pass it to the next person in line'); return; }
      }
      press(false);
    },
    pause() { if (G) { G.paused = true; G.holding = false; const a = audio(); if (G.padBus && a) G.padBus.gain.setTargetAtTime(0, a.currentTime, 0.05); } },
    resume() { if (G) { G.paused = false; const a = audio(); if (G.padBus && a) G.padBus.gain.setTargetAtTime(1, a.currentTime, 0.1); } },
    get over() { return !!(G && G.over); },
    get debug() {
      return G && { engine: 'curating-hope', playing: G.playing, over: G.over, idx: G.idx, shared: G.idx + 1, of: PEOPLE.length, passes: G.passes,
        gust: G.gust && G.gust.phase, gustP: G.gust && G.gust.phase === 'blow' ? +(G.gust.t / G.gust.dur).toFixed(2) : 0, holding: G.holding, holds: G.holds, blown: G.blown, catches: G.catches, misses: G.misses,
        flying: !!G.flight, catching: !!(G.flight && G.flight.sweep), bot: !!G.bot,
        art: ART_NAMES.filter(n => ART[n] && ART[n].ok).length + '/' + ART_NAMES.length + (artSettled() ? '' : ' loading') };
    },
    stop() {
      if (!G) return;
      removeEventListener('keydown', onKey); removeEventListener('keyup', onKey);
      for (const t of G.timers) clearTimeout(t);
      G.pads.forEach((_, i) => padRemove(i));
      if (G.padBus) { const bus = G.padBus; setTimeout(() => { try { bus.disconnect(); } catch (e) {} }, 1600); }
      if (G.animVideo) { G.animVideo.pause(); G.animVideo.removeAttribute('src'); G.animVideo.load(); }
      G.group.remove(G.root); G.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      G.ui.destroy();
      const b = document.getElementById('chPass'); if (b) b.remove();
      for (const id of ['chHud', 'chBig']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
      G = null;
    },
  };
}
