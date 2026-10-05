// WALK THROUGH FEAR · "Blindness Fears": a mini game inside Ben Fox's painting.
//   "… when you walk through the fear, you are the only thing that is left." — Ben Fox
// Ben's real fears from his diagnosis drip down out of the storm toward him, like the paint in the painting.
// Swing the cane (swipe left / right, the two cane buttons, or the ← / → keys) to splash the fear on that side.
// Swinging left, right, left, right walks you forward, like real cane technique: Ben steps, grows smaller and walks
// on into the light. A fear that reaches you costs a step. Every fear you splash becomes the next note of a scale, so
// the storm slowly turns into music, and the further you walk, the calmer the storm and the wind get. At the end the
// storm clears, Ben's animation of the painting comes alive, and his words appear.
// Playable by ear: each fear is spoken and plinks from its side as it appears, warns from its side as it gets
// close, and every swing, step and splash has a sound and a buzz.
//
// Art by Claude Design (media/games/walk-through-fear/): the painting with Ben painted out, Ben cut out (his legs
// step), fear blobs, splashes, the storm and the cane swing. Every picture has a drawn-in-code fallback.
// Positions are in 1024 × 1024 painting pixels (Design's space); px() maps them onto the board.
//
// Game API (see lib/minigames/index.js): start(ctx) · update(dt) · pointer(kind, event) · pause() · resume() · stop() · over · debug
import * as THREE from 'three';
import * as K from './kit.js';

const FEARS = ['WORK?', 'LOVE?', 'DRIVING?', 'PARENTING?', 'HOBBIES?', 'FRIENDS', 'CANE', 'COOKING', 'RUNNING', 'WALKING', 'WRITING', 'READING', 'SELF WORTH', 'INDEPENDENCE', 'RESPECT'];
const GOAL = 24;                                         // steps to walk through the storm
const PALETTE = ['#0f8fa3', '#d8322b', '#f08a1c', '#7a2fb3', '#1f5fb8', '#e8452c', '#14a7a0'];
const NOTES = K.SCALES.penta;                            // fears become music: each splash plays the next note
const DIR = 'media/games/walk-through-fear/';
const BLOB_COL = ['#1b7f88', '#ae291e', '#c45d1d', '#6b298b', '#214a97', '#a77a12'];   // the main colour of fear-blob-1..6
// Design's layout (painting px)
// the two lanes fears fall in, and a fear blob's size. Design: lanes at x 250 / 775, blobs 380 × 190, made for the whole
// print on screen; a phone held upright in AR crops the painting's sides, so the lanes sit closer to Ben here.
const LANE = { '-1': 380, '1': 640 };
const FEAR_W = 290, FEAR_H = 145;
const FIG = { x: 330, y: 160, w: 400, h: 780, split: 462 };   // Ben cut out; legs split at y 462 of the cut-out
const FEET = [510, 915];                                 // Ben's feet: he scales and rises around this point
const CANE = { x: 606, y: 606, len: 330, rest: 4, left: 58, right: -46 };   // degrees, CSS sense (+ = tip swings left)
const SWING = { '-1': { x: 130, y: 540, w: 700, h: 350, deg: -46 }, '1': { x: 330, y: 560, w: 620, h: 310, deg: 34 } };

/* ── Design's art: loaded once, kept between plays; anything missing stays null and the drawn look is used ── */
const ART = { empty: null, figure: null, storm: null, swing: null, blobs: [], splashes: [], asked: false };
function loadArt() {
  if (ART.asked) return; ART.asked = true;
  const L = new THREE.TextureLoader();
  const get = (file, done) => L.load(DIR + file, (t) => { t.colorSpace = THREE.SRGBColorSpace; done(t); }, undefined, () => {});
  get('walk-through-fear-empty.jpg', t => ART.empty = t);
  get('ben-figure.png', t => ART.figure = t);
  get('storm.png', t => { t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.center.set(0.5, 0.5); ART.storm = t; });
  get('cane-swing.png', t => ART.swing = t);
  for (let i = 1; i <= 6; i++) { const img = new Image(); img.onload = () => ART.blobs.push({ img, color: BLOB_COL[i - 1] }); img.src = DIR + 'fear-blob-' + i + '.png'; }
  for (let i = 1; i <= 4; i++) get('splash-' + i + '.png', t => ART.splashes.push(t));
}

/* ── pictures ── */
const canvasTex = K.canvasTex;
const fitFont = (g, word, max, fs, min) => { g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; while (g.measureText(word).width > max && fs > min) { fs -= 4; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; } };
// a fear: Design's dripping blob with the word on it (fallback: a drawn blob whose drips trail upward)
function fearTex(word, color, seed, blob) {
  if (blob) return canvasTex(512, 256, (g, W) => {
    g.drawImage(blob.img, 0, 0, 512, 256);
    fitFont(g, word, W - 44, word.length > 10 ? 73 : 94, 34);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(word, W / 2, 101);   // Design: drop shadow + soft glow
    g.shadowBlur = 0; g.fillStyle = '#fff'; g.fillText(word, W / 2, 94);
  });
  let s = seed; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = color;
    for (let i = 0; i < 5; i++) { const x = 60 + r() * (W - 120), w = 6 + r() * 14; g.beginPath(); g.moveTo(x - w, 120); g.quadraticCurveTo(x, 10 + r() * 60, x + w, 120); g.fill(); }   // drips above
    g.beginPath(); const cx = W / 2, cy = 168;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 14) { const rr = 1 + (r() - 0.5) * 0.16, x = cx + Math.cos(a) * 236 * rr, y = cy + Math.sin(a) * 74 * rr; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 6; g.stroke();
    fitFont(g, word, W - 70, 78, 30);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 10; g.strokeText(word, cx, cy + 4); g.fillStyle = '#fff'; g.fillText(word, cx, cy + 4);
  });
}
const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,250,235,1)'); r.addColorStop(0.4, 'rgba(255,215,150,.45)'); r.addColorStop(1, 'rgba(255,180,90,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
// Design's cane: white with a red tip and a dark outline
const caneTex = canvasTex(32, 512, (g, W, H) => {
  g.fillStyle = 'rgba(16,8,8,.9)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#f6f6f4'; g.fillRect(6, 4, W - 12, H * 0.8 - 4); g.fillStyle = K.RED; g.fillRect(6, H * 0.8, W - 12, H * 0.2 - 4);
});

/* the drawn storm (fallback when storm.png is missing) and the red flash when a fear catches you */
function stormMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uT: { value: 0 }, uCalm: { value: 0 }, uHit: { value: 0 }, uBase: { value: 1 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vP; uniform float uT, uCalm, uHit, uBase;
      float n(vec2 p){ return sin(p.x*7.0+uT*1.7+sin(p.y*5.0-uT))*0.5+sin(p.y*9.0-uT*1.3+sin(p.x*4.0+uT*0.7))*0.5; }
      void main(){
        float k = n(vP*1.0) * 0.5 + n(vP*2.3 + 3.1) * 0.5;
        float edge = smoothstep(0.15, 0.75, length(vP*vec2(1.0,0.9)));
        vec3 col = mix(vec3(0.03,0.05,0.12), vec3(0.45,0.04,0.06), 0.5 + 0.5*k);
        float a = (0.18 + 0.32*edge + 0.12*k) * (1.0 - uCalm) * uBase;
        col = mix(col, vec3(0.9,0.05,0.04), uHit); a = max(a, uHit*0.45);
        gl_FragColor = vec4(col, clamp(a,0.0,0.8));
      }`,
  });
}

/* the wind: a looping rumble that quietens as you walk (Design) */
function makeWind() {
  const a = K.audio(); if (!a) return null;
  try {
    const b = a.createBuffer(1, a.sampleRate * 6, a.sampleRate), d = b.getChannelData(0); let l = 0;
    for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; }
    const src = a.createBufferSource(); src.buffer = b; src.loop = true;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 380; f.Q.value = 0.6;
    const g = a.createGain(); g.gain.value = 0.0001;
    const lfo = a.createOscillator(); lfo.frequency.value = 0.08; const lg = a.createGain(); lg.gain.value = 240; lfo.connect(lg).connect(f.frequency);
    src.connect(f).connect(g).connect(a.destination); src.start(); lfo.start();
    return {
      level(v, tc = 0.6) { g.gain.setTargetAtTime(Math.max(0.0001, v), a.currentTime, tc); },
      stop() { try { g.gain.setTargetAtTime(0.0001, a.currentTime, 0.15); src.stop(a.currentTime + 0.6); lfo.stop(a.currentTime + 0.6); } catch (e) {} },
    };
  } catch (e) { return null; }
}

export function walkThroughFearGame() {
  let G = null;
  loadArt();
  // best walk: fewest times caught, then most fears splashed. (Older saves hold just the caught count.)
  const readBest = () => { try { const v = localStorage.getItem('walk-through-fear-best'); if (v === null) return null; const o = JSON.parse(v); return typeof o === 'number' ? { caught: o, splashed: -1 } : o; } catch (e) { return null; } };

  /* painting px → board */
  const X = (px) => px / 1024 - 0.5, Y = (py) => (0.5 - py / 1024) * G.h, L = (p) => p / 1024, LY = (p) => p / 1024 * G.h;

  function setHud() { G.ui.panel('Blindness fears', 'Step ' + G.steps + ' <small>/ ' + GOAL + '</small>', { segs: [G.steps, GOAL] }); }

  /* ── Ben, walking: Design's cut-out over the painting with him painted out ── */
  function part(c0, r0, c1, r1, order) {        // a piece of the cut-out (cut-out px), placed relative to his feet
    const geo = new THREE.PlaneGeometry(L(c1 - c0), LY(r1 - r0)), uv = geo.attributes.uv;
    const u0 = c0 / FIG.w, u1 = c1 / FIG.w, vt = 1 - r0 / FIG.h, vb = 1 - r1 / FIG.h;
    uv.setXY(0, u0, vt); uv.setXY(1, u1, vt); uv.setXY(2, u0, vb); uv.setXY(3, u1, vb); uv.needsUpdate = true;
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: ART.figure, transparent: true, depthWrite: false }));
    m.position.set(L(FIG.x + (c0 + c1) / 2 - FEET[0]), -LY(FIG.y + (r0 + r1) / 2 - FEET[1]), 0); m.renderOrder = order; m.userData.y0 = m.position.y;
    G.benMats.push(m.material); return m;
  }
  function buildBen() {
    G.benOn = true; G.arc.visible = false;
    const empty = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ map: ART.empty, transparent: true, depthWrite: false }));
    empty.position.z = 0.004; empty.renderOrder = 5; G.root.add(empty); G.benMats.push(empty.material);
    const ben = new THREE.Group(); ben.position.set(X(FEET[0]), Y(FEET[1]), 0.024); G.root.add(ben); G.ben = ben;
    G.legs = { '-1': part(0, FIG.split, 180, FIG.h, 10), '1': part(180, FIG.split, FIG.w, FIG.h, 10) };
    ben.add(G.legs['-1'], G.legs['1'], part(0, 0, FIG.w, FIG.h - 296, 10.2));
    // the cane hangs from his hand
    const cg = new THREE.PlaneGeometry(L(18), LY(CANE.len)); cg.translate(0, -LY(CANE.len) / 2, 0);
    G.cane = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ map: caneTex, transparent: true, depthWrite: false }));
    G.cane.position.set(L(CANE.x - FEET[0]), -LY(CANE.y - FEET[1]), 0.002); G.cane.renderOrder = 11; ben.add(G.cane); G.benMats.push(G.cane.material);
    // the white swish of a swing
    G.swish = {};
    if (ART.swing) for (const side of [-1, 1]) {
      const s = SWING[side], g = new THREE.PlaneGeometry(L(s.w), LY(s.h)); g.translate(0, LY(s.h) / 2, 0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: ART.swing, transparent: true, opacity: 0, depthWrite: false }));
      m.position.set(L(s.x + s.w / 2 - FEET[0]), -LY(s.y + s.h - FEET[1]), 0.003); m.rotation.z = -s.deg * Math.PI / 180; m.renderOrder = 11;
      ben.add(m); G.swish[side] = m;
    }
  }
  // where a fear catches Ben (board y): Design's feetY − 470·k, following him as he walks away
  const catchY = () => { const k = G.benOn ? G.k : 1; return Y(FEET[1] - (1 - k) * 260 - 470 * k); };

  /* ── fears ── */
  function spawn() {
    const side = Math.random() < 0.5 ? -1 : 1;
    if (G.fears.some(f => f.side === side && f.top > Y(200))) return false;    // one new fear per lane at a time
    const word = G.bag.length ? G.bag.pop() : (G.bag = shuffle(FEARS.slice())).pop();
    const blob = ART.blobs.length ? ART.blobs[(Math.random() * ART.blobs.length) | 0] : null;
    const color = blob ? blob.color : PALETTE[(Math.random() * PALETTE.length) | 0];
    const x = X(LANE[side] + (Math.random() - 0.5) * 40), w = L(FEAR_W), h = LY(FEAR_H);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: fearTex(word, color, (Math.random() * 1e5) | 0, blob), transparent: true, opacity: 0, depthWrite: false }));
    const top = Y(-30);
    m.position.set(x, top - h / 2, 0.03); m.renderOrder = 12; G.root.add(m);
    G.fears.push({ word, color, x, top, h, w, side, m, warn: 0, age: 0, rot: (Math.random() - 0.5) * 0.14, ph: Math.random() * 6 });
    K.tone(1400 + Math.random() * 300, 0.12, { type: 'sine', vol: 0.09, pan: side * 0.8 });          // a drip, from its side
    G.say(word.replace('?', ''), false);
    return true;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function drop(f) { G.fears.splice(G.fears.indexOf(f), 1); G.root.remove(f.m); f.m.geometry.dispose(); f.m.material.map.dispose(); f.m.material.dispose(); }
  function splash(f) {
    drop(f);
    const cx = f.x, cy = f.top - L(FEAR_W * 0.18);
    if (ART.splashes.length) {                                         // Design's paint splash bursts out and fades
      const s = new THREE.Mesh(new THREE.PlaneGeometry(L(320), LY(320)), new THREE.MeshBasicMaterial({ map: ART.splashes[(Math.random() * ART.splashes.length) | 0], transparent: true, depthWrite: false }));
      s.position.set(cx, cy, 0.035); s.rotation.z = Math.random() * Math.PI * 2; s.renderOrder = 13; G.root.add(s); G.splashes.push({ m: s, t: 0 });
    }
    G.fx.add(cx, cy, f.color, 22, 0.4);
    G.splashed++;
    const note = NOTES[(G.splashed - 1) % NOTES.length];
    K.tone(note, 0.6, { type: 'triangle', vol: 0.16, pan: f.side * 0.6 }); K.tone(note * 2, 0.5, { type: 'sine', vol: 0.06, pan: f.side * 0.6, delay: 0.02 });
    K.noise(0.18, { vol: 0.16, freq: 2400, pan: f.side * 0.7 });
  }
  function swing(side) {
    if (!G || !G.playing || G.paused) return;
    // the cane sweeps that side: it reaches the lowest fear there (the one closest to Ben) once it has dripped down a little
    const reach = G.fears.filter(f => f.side === side && f.top < Y(90)).sort((a, b) => a.top - b.top)[0];
    G.sweep = { side, t: 0 }; G.caneT = side < 0 ? CANE.left : CANE.right; G.caneHold = 0.5;
    if (G.swish && G.swish[side]) G.swish[side].material.opacity = 1;
    K.tone(1700, 0.04, { type: 'square', vol: 0.05, pan: side * 0.6 }); K.noise(0.07, { vol: 0.18, freq: 3200, pan: side * 0.6 });   // the tip on the wet ground
    G.buzz(12);
    if (reach) splash(reach);
    // left, right, left, right: each change of side is a step forward
    if (G.lastSide !== side) { G.steps = Math.min(GOAL, G.steps + 1); G.legT = 0.38; G.leg = side; G.ripple(); G.buzz(14); K.tone(110, 0.08, { type: 'triangle', vol: 0.1 }); }
    else { K.tone(180, 0.12, { type: 'sawtooth', vol: 0.05, slide: -60 }); }          // same side twice: a shuffle, not a step
    G.lastSide = side; setHud();
    if (G.steps >= GOAL) finish();
  }
  function hit(f) {
    drop(f);
    G.hits++; G.steps = Math.max(0, G.steps - 1); G.lastSide = 0; G.hitFlash = 1; G.shake = 0.5; G.frameT = 0.6; G.ui.frame(true); setHud();
    K.tone(98, 0.6, { type: 'sawtooth', vol: 0.12 }); K.tone(104, 0.6, { type: 'sawtooth', vol: 0.1 }); K.noise(0.5, { vol: 0.35, freq: 140, q: 0.6 });
    K.tone(150, 0.35, { vol: 0.3, slide: -110 });                                         // Design's thud
    G.buzz([120, 50, 160]);
    G.ui.alert(f.word, 'The fear caught up with you. Keep walking. Back 1 step.', 1.6);
    G.say(f.word.replace('?', '') + '. Keep walking.', true);
  }
  function finish() {
    for (const f of G.fears.slice()) splash(f);
    const prev = readBest(), rec = !prev || G.hits < prev.caught || (G.hits === prev.caught && G.splashed > prev.splashed);
    if (rec) { try { localStorage.setItem('walk-through-fear-best', JSON.stringify({ caught: G.hits, splashed: G.splashed })); } catch (e) {} }
    G.endT = 0; G.frameT = 0; if (G.wind) G.wind.level(0.12, 1);
    K.finale(G, {
      kicker: GOAL + ' steps · walk complete', title: 'You are the only thing that is left',
      cells: [{ k: G.splashed === 1 ? 'Fear walked through' : 'Fears walked through', v: G.splashed }, { k: 'Caught', v: G.hits }],
      line: 'You walked through ' + G.splashed + ' fears' + (G.hits ? ', and ' + G.hits + ' caught up with you' : ', and none caught you') + (rec ? '. Best walk yet!' : '.'),
      best: rec,
      say: 'You walked through the fear. When you walk through the fear, you are the only thing that is left.' + (rec ? ' Best walk yet!' : '') + ' Press Ben’s story to hear it from him.',
    });
  }

  /* the robot (…&bot=1): walks left, right, left, right, and swings at a fear on its side when one gets close */
  function bot(dt) {
    G.botT -= dt; if (G.botT > 0) return;
    G.botT = 0.75 + Math.random() * 0.3;
    if (G.hits === 0 && G.steps >= 8 && G.fears.length) return;                         // once, it stands still and lets a fear catch it (tests the catch)
    const cy = catchY(), near = G.fears.filter(f => f.top < Y(90)).map(f => ({ f, d: (f.top - f.h * 0.25) - cy })).sort((a, b) => a.d - b.d)[0];
    let side = G.lastSide ? -G.lastSide : -1;
    if (near && near.d < 0.12) side = near.f.side;                                       // a fear is close: splash it
    swing(side);
  }

  const onKey = (e) => {
    if (!G || !G.playing || G.paused || e.repeat) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); swing(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); swing(1); }
  };

  /* swipes: a sideways flick swings the cane that way; tapping a fear splashes it too */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  return {
    title: 'Walk Through Fear',
    start(ctx) {
      if (G) this.stop(); loadArt();
      G = K.makeBase(ctx);
      Object.assign(G, { fears: [], splashes: [], ripples: [], bag: [], steps: 0, hits: 0, splashed: 0, lastSide: 0, spawnT: 1.2, hitFlash: 0, shake: 0, frameT: 0,
        calm: 0, introT: G.bot ? 1 : 3.0, sweep: null, k: 1, legT: 0, leg: 1, caneA: CANE.rest, caneT: CANE.rest, caneHold: 0, benOn: false, benMats: [], endT: -1, botT: 0.5 });
      G.storm = new THREE.Mesh(new THREE.PlaneGeometry(1.02, G.h * 1.02), stormMaterial()); G.storm.position.z = 0.021; G.storm.renderOrder = 8; G.root.add(G.storm);
      G.stormImg = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 1 }));
      G.stormImg.position.z = 0.02; G.stormImg.renderOrder = 7; G.stormImg.visible = false; G.root.add(G.stormImg);
      G.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
      G.glow.position.set(0.05, 0.16, 0.022); G.glow.scale.set(0.75, 0.75, 1); G.glow.renderOrder = 9; G.root.add(G.glow);
      // fallback cane sweep (when Ben's cut-out isn't available)
      const arc = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.172, 40, 1, 0, Math.PI * 0.55), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      arc.position.set(-0.03, -0.35, 0.04); arc.renderOrder = 12; G.root.add(arc); G.arc = arc;
      G.ripple = () => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE[(Math.random() * PALETTE.length) | 0]), transparent: true, depthWrite: false }));
        const fx = G.ben ? G.ben.position.x : -0.03, fy = G.ben ? G.ben.position.y : -0.37;
        m.position.set(fx + (G.lastSide || 1) * 0.05 * G.k, fy, 0.022); m.scale.set(0.02, 0.008, 1); m.renderOrder = 9.5; G.root.add(m); G.ripples.push({ m, t: 0 });
      };
      setHud();
      G.ui.banner('Blindness fears', 'Swing your cane left and right to walk. Splash the fears before they reach you.', 2.8, 'Walk Through Fear · mini game');
      G.say('Blindness fears. Walk through fear. Swing your cane left and right to walk forward. Each swing splashes the fear on that side. Swipe left or right, or use the cane buttons.');
      G.ui.buttons([
        { label: '◀ Cane', kind: 'black', aria: 'Swing the cane left', press: () => swing(-1) },
        { label: 'Cane ▶', kind: 'black', aria: 'Swing the cane right', press: () => swing(1) },
      ]);
      G.wind = makeWind(); if (G.wind) G.wind.level(0.55, 0.8);
      addEventListener('keydown', onKey);
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; const U = G.storm.material.uniforms; U.uT.value = G.t;
      G.ui.update(dt); G.fx.update(dt); K.finaleUpdate(G, dt);
      if (!G.playing && !G.over) { G.introT -= dt; if (G.introT <= 0) G.playing = true; }
      if (!G.benOn && !G.over && ART.empty && ART.figure) buildBen();
      const progress = G.steps / GOAL;
      G.calm += ((G.over ? 1 : progress * 0.85) - G.calm) * Math.min(1, dt * (G.over ? 1.2 : 1.5)); U.uCalm.value = G.calm;
      G.hitFlash = Math.max(0, G.hitFlash - dt * 2.5); U.uHit.value = G.hitFlash;
      if (G.frameT > 0) { G.frameT -= dt; if (G.frameT <= 0) G.ui.frame(false); }
      G.glow.material.opacity = Math.min(0.55, G.calm * 0.6);
      // the storm: Design's painted storm, slowly turning, fading as you walk (or the drawn one)
      if (ART.storm) {
        const S = G.stormImg; if (!S.material.map) { S.material.map = ART.storm; S.material.needsUpdate = true; S.visible = true; U.uBase.value = 0; }
        const t = G.t, deg = Math.sin(t * 0.15) * 3 + t * (1.5 - progress) * 1.2, sc = 1.02 + Math.sin(t * 0.3) * 0.02;
        ART.storm.rotation = -deg * Math.PI / 180; ART.storm.repeat.set(1024 / 1104 / sc, 1024 / 1104 / sc);
        S.material.opacity = Math.max(0, 1 - G.calm);
      }
      if (G.wind && G.playing) G.wind.level(0.55 - progress * 0.35);
      // Ben walks away into the light: smaller and higher with every step; the stepping leg lifts; the cane sweeps
      G.k += ((G.over ? G.k : 1 - progress * 0.4) - G.k) * Math.min(1, dt * 2.5);
      if (G.ben) {
        G.legT = Math.max(0, G.legT - dt); const lp = G.legT > 0 ? Math.sin((1 - G.legT / 0.38) * Math.PI) : 0;
        G.ben.scale.set(G.k, G.k, 1); G.ben.position.y = Y(FEET[1]) + LY((1 - G.k) * 260 + lp * 6);
        for (const s of [-1, 1]) G.legs[s].position.y = G.legs[s].userData.y0 + (s === G.leg ? LY(lp * 18) : 0);
        G.caneHold = Math.max(0, G.caneHold - dt); if (G.caneHold <= 0) G.caneT = CANE.rest;
        G.caneA += (G.caneT - G.caneA) * Math.min(1, dt * 16); G.cane.rotation.z = -G.caneA * Math.PI / 180;
        for (const s of [-1, 1]) if (G.swish[s]) G.swish[s].material.opacity = Math.max(0, G.swish[s].material.opacity - dt / 0.45);
        if (G.over) {   // the end: Ben (and the painted-out copy) fade, uncovering the painting as it is, then the animation
          G.endT += dt; const op = Math.max(0, 1 - Math.max(0, G.endT - 0.4) / 1.2);
          for (const m of G.benMats) m.opacity = op;
        }
      }
      if (G.playing) {
        if (G.bot) bot(dt);
        G.spawnT -= dt;
        if (G.spawnT <= 0 && G.fears.length < 4) { if (spawn()) G.spawnT = 1.35 + progress * 1.2 + Math.random() * 0.5; else G.spawnT = 0.2; }
        const speed = 0.085 + progress * 0.06, cy = catchY();
        for (const f of G.fears.slice()) {
          f.age += dt; f.top -= speed * dt;
          const y = f.top - f.h / 2, k = Math.max(0, Math.min(1, (Y(-30) - f.top) / (Y(-30) - cy - f.h * 0.25)));   // 0 at the top → 1 when it reaches Ben
          f.m.position.set(f.x, y, 0.03); f.m.rotation.z = f.rot + Math.sin(G.t * 2 + f.ph) * 0.03;
          f.m.scale.y = 1 + Math.sin(G.t * 3 + f.ph) * 0.03; f.m.material.opacity = Math.min(1, f.age / 0.3);
          if (k > 0.55) { f.warn -= dt; if (f.warn <= 0) { K.tone(330 + k * 200, 0.07, { type: 'square', vol: 0.05, pan: f.side * 0.9 }); f.warn = 0.55 - k * 0.35; } }
          if (f.top - f.h * 0.25 <= cy) hit(f);
        }
      }
      for (const s of G.splashes) { s.t += dt; const k = Math.min(1, s.t / 0.5), sc = 0.4 + k * 0.9; s.m.scale.set(sc, sc, 1); s.m.material.opacity = Math.max(0, 1 - Math.max(0, s.t - 0.25) / 0.5); }
      G.splashes = G.splashes.filter(s => { if (s.t < 0.8) return true; G.root.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); return false; });
      for (const r of G.ripples) { r.t += dt; const s = 0.02 + r.t * 0.25; r.m.scale.set(s, s * 0.32, 1); r.m.material.opacity = Math.max(0, 0.8 - r.t * 0.9); }
      G.ripples = G.ripples.filter(r => { if (r.t < 0.9) return true; G.root.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose(); return false; });
      if (G.sweep) { G.sweep.t += dt; const k = G.sweep.t / 0.25; if (!G.benOn) G.arc.material.opacity = Math.max(0, 0.9 - k);
        G.arc.rotation.z = G.sweep.side < 0 ? Math.PI * 0.45 + k * 0.6 : -k * 0.6 - 0.05; if (k >= 1) G.sweep = null; }
      G.shake = Math.max(0, G.shake - dt); G.root.position.x = G.shake > 0 ? Math.sin(G.t * 70) * 0.008 * G.shake * 2 : 0;
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
    pause() { if (G) { G.paused = true; if (G.wind) G.wind.level(0.0001, 0.1); } },
    resume() { if (G) { G.paused = false; if (G.wind) G.wind.level(G.over ? 0.12 : 0.55 - G.steps / GOAL * 0.35); } },
    get over() { return !!(G && G.over); },
    get debug() {
      return G && { engine: 'walk-through-fear', playing: G.playing, over: G.over, steps: G.steps, goal: GOAL, hits: G.hits, splashed: G.splashed,
        fears: G.fears.map(f => [f.word, +f.x.toFixed(2), +f.top.toFixed(2)]), calm: +G.calm.toFixed(2), k: +G.k.toFixed(2), bot: !!G.bot,
        art: { ben: G.benOn, storm: !!ART.storm, blobs: ART.blobs.length, splashes: ART.splashes.length, swing: !!ART.swing } };
    },
    swing: (s) => swing(s),
    stop() {
      if (!G) return;
      removeEventListener('keydown', onKey);
      if (G.wind) G.wind.stop();
      for (const f of G.fears.slice()) drop(f);
      G.stormImg.material.map = null;                      // the storm texture is shared between plays: don't dispose it
      K.cleanup(G);
      G = null;
    },
  };
}
