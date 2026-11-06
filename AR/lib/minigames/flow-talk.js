// FLOW STATE (Raquel Alim): WHAT SHOULD I PAINT?  (polished 5 Nov 2026)
// "I always have art flowing through me... I have too many things in my head that I need to paint."
// Raquel is lost in her flow, eyes closed, colours streaming around her. Then she OPENS HER EYES and looks at you:
// what should she paint? Three ways to answer, one button each: TALK (say an idea; her mouth moves with your voice,
// then she says it back in a dreamy echo of it), TYPE (write it; she says it in a computer voice), or PICK (choose one
// of three idea cards, read in Ben's voice). Then she closes her eyes and paints it: your words appear as glowing
// painted letters that swirl out of her into the colour streams, and the streams take on the idea's colours (the ocean
// turns them blue, sunflowers gold). Three ideas, then her own words in her own voice (art_44). Tap her face any time
// and she looks where you touched. Nothing is uploaded or saved.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ARTIST = new URL('../../../3D/gallery/audio/art_44.mp3', import.meta.url).href;   // Raquel, in her own words
const IDEAS = 3, MAX_REC = 10, HINT_AFTER = 12;
// the idea cards: a short label for the button, the line Ben reads, and the colours it paints the streams
const PICKS = [
  { label: 'The ocean', say: 'The ocean, from inside a wave.', cols: ['#1f6fd1', '#3fc1e8', '#9fe6ff'] },
  { label: 'Sunflowers', say: 'A field of sunflowers at night.', cols: ['#ffc21a', '#ff9a1a', '#1b2a6b'] },
  { label: 'Grandma dancing', say: 'My grandma dancing in the kitchen.', cols: ['#ff5a3c', '#ffb36b', '#c2185b'] },
  { label: 'City of music', say: 'A city made of music.', cols: ['#9b4dff', '#ff4fd8', '#ffd84d'] },
  { label: 'First snow', say: 'The first snow of winter.', cols: ['#ffffff', '#bfe3ff', '#7fa8d9'] },
  { label: 'Flower dragon', say: 'A dragon made of flowers.', cols: ['#3fbf5f', '#ff6fa8', '#ffd1e6'] },
  { label: 'The rain', say: 'The sound of rain.', cols: ['#4f8fa8', '#9fc4cf', '#2f4f6f'] },
  { label: 'Golden fox', say: 'A fox in a golden forest.', cols: ['#ff8a1f', '#ffc94d', '#7a4a12'] },
  { label: 'Moon picnic', say: 'The moon having a picnic.', cols: ['#e8e8f5', '#ffe58a', '#3a3f8f'] },
];
// colours for your own words: the first match wins; otherwise a colour from the words themselves
const WORD_COLS = [
  [/ocean|sea|water|wave|river|lake|blue|swim|fish|whale|beach/, ['#1f6fd1', '#3fc1e8', '#9fe6ff']],
  [/sun|gold|yellow|light|bright|summer|honey|lemon/, ['#ffc21a', '#ff9a1a', '#fff1a8']],
  [/fire|love|heart|red|rose|apple|hot|dance|danc/, ['#ff3c2e', '#ff8a5c', '#c2185b']],
  [/forest|tree|garden|grass|green|leaf|leaves|plant|jungle|frog/, ['#2fa84f', '#8fdc6a', '#1f5f3a']],
  [/night|moon|star|space|sky|galaxy|dream|sleep/, ['#2a2f8f', '#8f7fff', '#e8e8ff']],
  [/snow|winter|ice|cold|cloud|white/, ['#ffffff', '#bfe3ff', '#7fa8d9']],
  [/flower|pink|spring|butterfly|bloom|blossom/, ['#ff6fa8', '#ffd1e6', '#3fbf5f']],
  [/music|song|sing|jazz|guitar|piano|drum/, ['#9b4dff', '#ff4fd8', '#ffd84d']],
  [/fox|autumn|fall|orange|pumpkin|bread/, ['#ff8a1f', '#ffc94d', '#7a4a12']],
];
function colsFor(text) {
  const t = (text || '').toLowerCase();
  for (const [re, c] of WORD_COLS) if (re.test(t)) return c;
  let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return [`hsl(${h},85%,55%)`, `hsl(${(h + 40) % 360},90%,65%)`, `hsl(${(h + 200) % 360},70%,45%)`];
}
// where each painted idea settles, in the colour streams around her (u, v)
const SLOTS = [[0.25, 0.15], [0.75, 0.12], [0.25, 0.87]];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting: her eyes open (drawn over the closed lids: white, a warm brown iris that looks
// around, a highlight, lids and lashes) and blink; her jaw drops as she talks; the colours around her flow, faster as
// she speaks, and take on the colours of the idea she's painting
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uOpenL, uOpenR, uJaw, uFlow, uT, uA, uH, uBurst, uTintK;
uniform vec2 uLook;
uniform vec3 uTint1, uTint2;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
// one eye: its two corners (where the lashes meet), how far it's open, how high it opens
vec4 eye(vec2 p, vec2 c1, vec2 c2, float sag, float open, float hgt){
  float u = (p.x - c1.x) / (c2.x - c1.x);
  if (u <= 0.0 || u >= 1.0 || open < 0.02) return vec4(0.0);
  float arch = sin(u * 3.14159);
  float yb = mix(c1.y, c2.y, u) + sag * arch;                 // the lash line (bottom of the eye)
  float yt = yb - open * hgt * pow(arch, 0.75);               // the upper lid
  if (p.y < yt - 0.006 || p.y > yb + 0.002) return vec4(0.0);
  vec3 col;
  float a = 0.0;
  if (p.y >= yt && p.y <= yb) {
    // white of the eye, a little shaded toward the corners and under the lid
    col = mix(vec3(0.84, 0.76, 0.68), at(p), 0.22) * (0.72 + 0.28 * arch) * mix(0.6, 1.0, smoothstep(yt, yt + 0.014, p.y));
    // the iris: warm brown, looking where she looks
    vec2 ic = vec2(mix(c1.x, c2.x, 0.5 + uLook.x * 0.22), mix(yt, yb, 0.5) + uLook.y * 0.004);
    float r = length((p - ic) * vec2(1.0, uH)), R = (c2.x - c1.x) * 0.2;
    float ring = 0.5 + 0.5 * sin(atan(p.y - ic.y, p.x - ic.x) * 14.0);
    vec3 iris = mix(vec3(0.24, 0.13, 0.07), vec3(0.6, 0.38, 0.14), smoothstep(R * 0.35, R, r) * 0.6 + ring * 0.12);
    col = mix(col, iris, 1.0 - smoothstep(R * 0.94, R, r));
    col = mix(col, vec3(0.05, 0.03, 0.03), 1.0 - smoothstep(R * 0.36, R * 0.42, r));
    col = mix(col, vec3(1.0), 1.0 - smoothstep(R * 0.1, R * 0.17, length((p - ic - vec2(-R * 0.35, -R * 0.35 / uH)) * vec2(1.0, uH))));
    a = 1.0;
  }
  // the upper lid line and its lashes
  float lid = 1.0 - smoothstep(0.0008, 0.0026, abs(p.y - yt));
  float lash = step(0.0, yt - p.y) * (1.0 - smoothstep(0.0, 0.006, yt - p.y)) * step(0.55, fract(u * 26.0)) * smoothstep(0.1, 0.3, arch);
  vec3 dark = vec3(0.07, 0.05, 0.05);
  if (lid > 0.01 || lash > 0.01) { col = a > 0.0 ? mix(col, dark, max(lid, lash)) : dark; a = max(a, max(lid, lash)); }
  return vec4(col, a * smoothstep(0.02, 0.15, open));
}
const vec2 MOUTH = vec2(0.44, 0.613), JAW = vec2(0.44, 0.665), JAWR = vec2(0.085, 0.075);
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  float face = 1.0 - smoothstep(0.9, 1.15, length((p - vec2(0.43, 0.52)) / vec2(0.22, 0.3)));
  float fl = (1.0 - face) * (0.4 + uFlow);
  s += vec2(sin(p.y * 16.0 + uT * 1.1 + sin(p.x * 7.0)), cos(p.x * 13.0 - uT * 0.9)) * 0.006 * fl;
  float dj = uJaw * 0.022;
  float wj = 1.0 - smoothstep(0.65, 1.0, length((p - JAW) / JAWR));
  float below = smoothstep(MOUTH.y - 0.002, MOUTH.y + 0.003, p.y);
  s.y -= dj * wj * below;
  vec3 col = at(s);
  // the colour streams take on the idea's colours (two colours, flowing)
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float band = 0.5 + 0.5 * sin(p.y * 9.0 - p.x * 4.0 + uT * 0.8);
  vec3 tint = mix(uTint1, uTint2, band) * (0.55 + 0.75 * lum);
  col = mix(col, tint, (1.0 - face) * uTintK * 0.55);
  float mw = 0.052, my = MOUTH.y + dj * 0.5 + 0.001, mh = dj * 0.5 + 0.003;
  vec2 mq = vec2((p.x - MOUTH.x) / mw, (p.y - my) / mh); mq.y += mq.x * mq.x * 0.2;
  float me = length(mq);
  vec3 inside = mix(vec3(0.07, 0.02, 0.03), vec3(0.4, 0.13, 0.12), smoothstep(0.1, 1.0, me));
  inside = mix(inside, vec3(0.78, 0.7, 0.64), 0.7 * smoothstep(-0.95, -0.7, mq.y) * (1.0 - smoothstep(-0.7, -0.5, mq.y)) * (1.0 - smoothstep(0.4, 0.7, abs(mq.x))));
  col = mix(col, inside, smoothstep(1.0, 0.75, me) * smoothstep(0.05, 0.2, uJaw));
  // her eyes
  vec4 eL = eye(p, vec2(0.284, 0.449), vec2(0.37, 0.446), 0.004, uOpenL, 0.032);
  vec4 eR = eye(p, vec2(0.47, 0.432), vec2(0.572, 0.44), 0.008, uOpenR, 0.035);
  col = mix(col, eL.rgb, eL.a); col = mix(col, eR.rgb, eR.a);
  col += (1.0 - face) * uBurst * 0.22 * (0.5 + 0.5 * sin(vec3(0.0, 2.1, 4.2) + p.x * 9.0 + p.y * 7.0 + uT * 3.0));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── painted words: your idea, in glowing brush letters ───────────────────────── */
function wordsTex(text, cols) {
  const words = text.replace(/[.!?]+$/, '').split(/\s+/), lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > 16 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur); if (lines.length > 3) { lines.length = 3; lines[2] += '…'; }
  const W = 512, H = 128 * lines.length + 40;
  const tex = K.canvasTex(W, H, g => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      const y = 84 + i * 128; let fs = 92; g.font = `italic 900 ${fs}px Georgia, "Times New Roman", serif`;
      while (g.measureText(ln).width > W - 40 && fs > 40) { fs -= 4; g.font = `italic 900 ${fs}px Georgia, "Times New Roman", serif`; }
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(20,10,20,.85)'; g.lineWidth = 16; g.strokeText(ln, W / 2, y);                     // a dark edge, so it reads on any colour
      cols.forEach((c, k) => { g.fillStyle = c; g.globalAlpha = 0.9; g.fillText(ln, W / 2 + (k - 1) * 3, y + (k - 1) * 2); });   // brushy layers
      g.globalAlpha = 0.85; g.fillStyle = '#ffffff'; g.font = `italic 900 ${fs * 0.96}px Georgia, "Times New Roman", serif`; g.fillText(ln, W / 2, y - 2);
      g.globalAlpha = 1;
    });
  });
  return { tex, aspect: H / W };
}

/* ───────────────────────── a flowing, dreamy band that grows with each idea ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function flowBand(ac) {
  const master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(master);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, out = bus, p = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  // Fmaj7, Am7, Dm9, Bbmaj7: a slow pad; an arpeggio that flows in once she paints her first idea, a bell line after the second
  const CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [46, 53, 57, 62]];
  let next = 0, step = 0, timer = null, layers = 0;
  function schedule() {
    while (next < ac.currentTime + 0.25) {
      const ch = CH[step % 4];
      ch.forEach(m => tone(next, midi(m), 4.4, { vol: 0.016, att: 1.1 }));
      if (layers >= 1) for (let i = 0; i < 8; i++) tone(next + i * 0.5, midi(ch[i % 4] + 12 + (i > 3 ? 12 : 0)), 0.9, { type: 'triangle', vol: 0.012, p: Math.sin(i * 0.9) * 0.6 });
      if (layers >= 2) [0, 1.5, 2.5].forEach((d, i) => tone(next + d, midi(ch[(i + step) % 4] + 24), 2, { vol: 0.01, p: 0.5 - i * 0.5 }));
      if (layers >= 3) tone(next, midi(ch[0] - 12), 4, { vol: 0.03, att: 0.4 });
      next += 4; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 60); schedule(); bus.gain.setTargetAtTime(0.9, ac.currentTime, 1.5); },
    grow() { layers++; },
    // she opens her eyes: a rising shimmer
    wake() { const t = ac.currentTime + 0.02; [72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.08, midi(m), 1.2, { type: 'triangle', vol: 0.03, out: fx, p: -0.3 + i * 0.2 })); },
    // you start or stop talking
    blip(up) { tone(ac.currentTime + 0.01, midi(up ? 79 : 72), 0.25, { vol: 0.06, out: fx }); tone(ac.currentTime + 0.09, midi(up ? 84 : 67), 0.3, { vol: 0.05, out: fx }); },
    // she paints it: a cascade, swirling from side to side
    paint() { const t = ac.currentTime + 0.05; [60, 64, 67, 72, 76, 79, 84, 88].forEach((m, i) => tone(t + i * 0.11, midi(m), 2.6, { type: 'triangle', vol: 0.045, out: fx, p: Math.sin(i * 1.3) * 0.8 })); },
    end() { const t = ac.currentTime + 0.1; [53, 57, 60, 64, 69, 72, 76, 81].forEach((m, i) => tone(t + i * 0.16, midi(m), 4, { type: 'triangle', vol: 0.04, att: 0.05, out: fx, p: -0.7 + i * 0.2 })); },
    hush() { master.gain.setTargetAtTime(0.3, ac.currentTime, 0.6); },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { clearInterval(timer); timer = null; try { master.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function whatShouldIPaintGame() {
  let G = null;
  const later = (secs, fn) => G.queue.push({ t: secs, fn });

  // ── your voice, said back as hers: a soft, dreamy echo ──
  function impulse(ac, secs, decay) { const n = ac.sampleRate * secs, b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  function playBuffer(buf) {
    const ac = G.ac, src = ac.createBufferSource(); src.buffer = buf; src.playbackRate.value = 0.96;
    const out = ac.createGain(); out.gain.value = 1.4; out.connect(G.an);
    const cv = ac.createConvolver(), wet = ac.createGain(); cv.buffer = impulse(ac, 2.2, 2.4); wet.gain.value = 0.4;
    src.connect(out); src.connect(cv).connect(wet).connect(out);
    src.start(); G.src = src;
    return buf.duration / src.playbackRate.value;
  }
  function caption(text) {
    if (!G.capEl) { G.capEl = document.createElement('div'); G.capEl.className = 'mgk'; G.capEl.setAttribute('aria-live', 'polite');
      Object.assign(G.capEl.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))',
        background: 'rgba(0,0,0,.85)', borderLeft: '6px solid #f2a541', padding: '10px 14px', color: '#fff', font: '700 clamp(18px,5vw,24px)/1.3 "Atkinson Hyperlegible",Arial,sans-serif', textTransform: 'none', display: 'none' });
      document.body.appendChild(G.capEl); }
    G.capEl.textContent = text || ''; G.capEl.style.display = text ? 'block' : 'none';
  }
  function panel(sub) { G.ui.panel(`Idea ${Math.min(G.idea + 1, IDEAS)} of ${IDEAS}`, 'What should she paint?', { segs: [G.idea, IDEAS], sub }); }
  function buttons() {
    const B = [];
    if (G.state === 'ready') {
      B.push({ label: 'Talk', icon: '●', kind: 'red', aria: 'Talk: say an idea for Raquel to paint', press: () => startRec() });
      B.push({ label: 'Type', icon: '✎', kind: 'black', aria: 'Type an idea instead', press: () => typeIt() });
      B.push({ label: 'Pick', icon: '✦', kind: 'black', aria: 'Pick one of three ideas', press: () => pickIt() });
    } else if (G.state === 'rec') B.push({ label: 'Done', icon: '■', kind: 'red', aria: 'Done talking', press: () => stopRec() });
    else if (G.state === 'pick') G.cards.forEach((c, k) => B.push({ label: PICKS[c].label, kind: k ? 'black' : 'red', aria: 'Paint: ' + PICKS[c].say, press: () => choose(c) }));
    const el = G.ui.buttons(B);
    if (el && el.length === 3) el.forEach(b => Object.assign(b.style, { flex: '1 1 0', minWidth: '0', paddingLeft: '6px', paddingRight: '6px', fontSize: G.state === 'pick' ? '13px' : '' }));
  }
  function ask() {
    G.state = 'ready'; G.eyesTo = 1; G.look = [0, 0.3]; G.idle = 0; G.band.wake();
    G.say(['Raquel opens her eyes. What should she paint?', 'What else should she paint?', 'One more idea.'][G.idea]);
    panel('Talk, type, or pick an idea'); buttons();
  }
  async function startRec() {
    if (G.state !== 'ready') return;
    hideBox(); G.idle = 0;
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error('no mic');
      if (!G.stream) G.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      if (!G) return;
      G.say('The microphone isn’t on. Press Type or Pick.'); G.ui.alert('No microphone', 'Press Type or Pick instead.', 3, 'blue'); return;
    }
    if (!G || G.state !== 'ready') return;
    if (!G.micAn) { G.micAn = G.ac.createAnalyser(); G.micAn.fftSize = 1024; G.micSrc = G.ac.createMediaStreamSource(G.stream); G.micSrc.connect(G.micAn); }
    G.chunks = []; G.rec = new MediaRecorder(G.stream); G.rec.ondataavailable = e => e.data.size && G.chunks.push(e.data);
    G.rec.onstop = async () => {
      try { const ab = await new Blob(G.chunks).arrayBuffer(); const buf = await G.ac.decodeAudioData(ab); if (!G) return; G.buf = buf; sayBack(); }
      catch (e) { if (!G) return; G.state = 'ready'; buttons(); G.say('Try again.'); G.ui.alert('Didn’t catch that', 'Try again.', 2, 'blue'); }
    };
    G.say.stop && G.say.stop(); G.talkT = 0;
    G.rec.start(); G.state = 'rec'; G.recT = 0; G.words = ''; caption('Listening…'); G.band.blip(true); buttons(); G.buzz(30);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { try { const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.continuous = true;
      r.onresult = e => { let t = ''; for (const x of e.results) t += x[0].transcript; if (!G) return; G.words = t.trim(); if (G.state === 'rec') caption(G.words || 'Listening…'); };
      r.onerror = () => {}; r.start(); G.sr = r; } catch (e) { G.sr = null; } }
  }
  function stopRec() { if (G.state !== 'rec') return; G.state = 'wait'; G.band.blip(false); try { G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} buttons(); }
  // she says your idea back: your own voice with a dreamy echo, or (typed) a computer voice; then she paints it
  function sayBack() {
    try { G.src && G.src.stop(); } catch (e) {}
    G.state = 'say'; G.sayT = 0; G.tts = false; G.eyesTo = 1; G.look = [0, 0.3]; G.ui.buttons([]);
    if (G.buf) G.sayLen = playBuffer(G.buf);
    else { G.tts = true; G.sayLen = Math.max(1.5, G.words.split(/\s+/).length * 0.42);
      try { const u = new SpeechSynthesisUtterance(G.words); u.pitch = 1.15; u.rate = 0.9;
        u.onend = () => { if (G && G.tts) G.sayLen = Math.min(G.sayLen, G.sayT); }; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
  }
  function endSay() { try { G.src && G.src.stop(); } catch (e) {} G.tts = false; paint(G.words || 'Your idea', colsFor(G.words)); }
  // ── typing: a plain button (and Enter), so it works everywhere ──
  function hideBox() { if (G.box) G.box.style.display = 'none'; }
  function typeIt() {
    if (G.state !== 'ready') return;
    G.idle = 0;
    if (!G.box) {
      G.box = document.createElement('div'); G.box.className = 'mgk';
      Object.assign(G.box.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))', pointerEvents: 'auto', display: 'flex', gap: '8px' });
      G.box.innerHTML = '<input type="text" maxlength="80" enterkeyhint="done" aria-label="What should Raquel paint?" placeholder="What should Raquel paint?" style="flex:1;min-width:0;min-height:56px;padding:0 12px;border:3px solid #000;border-radius:0;font:700 18px Atkinson Hyperlegible,Arial,sans-serif;color:#000;background:#fff">' +
        '<button type="button" style="min-height:56px;padding:0 16px;border:3px solid #000;border-radius:0;background:#ec3013;color:#fff;font:900 16px Archivo,Arial,sans-serif;text-transform:uppercase;cursor:pointer">Say it</button>';
      const inp = G.box.querySelector('input'), btn = G.box.querySelector('button');
      const go = ev => { if (ev) { ev.preventDefault(); ev.stopPropagation(); } if (!G || G.state !== 'ready') return; const v = inp.value.trim(); if (!v) { inp.focus(); return; }
        inp.blur(); hideBox(); G.words = v; G.buf = null; caption(v); sayBack(); };
      btn.addEventListener('click', go); btn.addEventListener('pointerup', go);
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') go(ev); });
      G.box.addEventListener('pointerdown', ev => ev.stopPropagation());
      document.body.appendChild(G.box);
    }
    G.box.style.display = 'flex'; const inp = G.box.querySelector('input'); inp.value = ''; try { inp.focus(); } catch (e) {}
  }
  function typeFor(text) { if (!G) return; typeIt(); const inp = G.box.querySelector('input'); inp.value = text; G.box.querySelector('button').click(); }   // the robot types
  // ── picking: three idea cards ──
  function pickIt() {
    if (G.state !== 'ready') return;
    hideBox(); G.idle = 0;
    const free = PICKS.map((p, i) => i).filter(i => !G.used.has(i));
    for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
    G.cards = free.slice(0, 3); G.state = 'pick'; buttons();
    G.say('Pick an idea.'); panel('Pick an idea');
  }
  function choose(c) {
    if (G.state !== 'pick') return;
    G.used.add(c); const P = PICKS[c]; G.words = P.say;
    G.ui.buttons([]); caption(P.say); G.say(P.say);
    G.state = 'heard'; G.look = [0, -0.2];
    later(0.6 + P.say.split(/\s+/).length * 0.38, () => paint(P.say, P.cols));
  }
  // ── she closes her eyes and paints it: your words swirl out into the colour streams ──
  function paint(text, cols) {
    G.state = 'paint'; G.eyesTo = 0; G.burstTo = 1; G.ui.buttons([]); G.painted++;
    G.say('She closes her eyes and paints it.');
    G.band.paint(); G.band.grow();
    G.tint1.set(cols[0]); G.tint2.set(cols[1]); G.tintTo = 1;
    const { tex, aspect } = wordsTex(text, cols), sp = K.sprite(tex, 0.34, { order: 30, opacity: 0 }); sp.scale.set(0.34, 0.34 * aspect, 1); G.root.add(sp);
    G.paintings.push({ sp, aspect, t: 0, slot: SLOTS[G.idea % SLOTS.length], ph: Math.random() * 6 });
    for (let i = 0; i < 6; i++) { const [x, y] = G.S.P(0.44 + (Math.random() - 0.5) * 0.3, 0.55 + (Math.random() - 0.5) * 0.2); G.fx.add(x, y, cols[i % cols.length], 10, 0.22); }
    later(4.2, () => { caption(''); G.burstTo = 0; G.tintTo = 0.35; G.idea++; G.buf = null; G.words = '';
      if (G.idea >= IDEAS) finish(); else ask(); });
  }
  function finish() {
    G.state = 'done'; G.eyesTo = 1; G.band.end(); G.tintTo = 0.6;
    K.finale(G, { won: true, kicker: 'What should I paint?', title: 'Three new paintings', line: G.work && G.work.quote,
      cells: [{ k: 'Ideas', v: String(G.painted) }], say: 'Three new paintings, flowing through her.' });
    G.endT = 0;
  }

  return {
    title: 'What should I paint?',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { ac: K.audio(), state: 'intro', idea: 0, painted: 0, buf: null, words: '', open: 0, talk: 0, talkT: 0, eyes: 0, eyesTo: 0, blink: 0, nextBlink: 3, look: [0, 0.3], lookNow: [0, 0.3],
        burst: 0, burstTo: 0, recT: 0, sayT: 0, sayLen: 0, botT: 0, idle: 0, hints: 0, queue: [], used: new Set(), cards: [], paintings: [], tint: 0, tintTo: 0,
        tint1: new THREE.Color('#ffffff'), tint2: new THREE.Color('#ffffff'), endT: 0, artist: null });
      G.band = flowBand(G.ac);
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.an = G.ac.createAnalyser(); G.an.fftSize = 1024; G.an.connect(G.ac.destination); G.abuf = new Float32Array(G.an.fftSize);
      G.uni = { map: { value: null }, uOpenL: { value: 0 }, uOpenR: { value: 0 }, uJaw: { value: 0 }, uFlow: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uBurst: { value: 0 },
        uLook: { value: new THREE.Vector2() }, uTintK: { value: 0 }, uTint1: { value: G.tint1 }, uTint2: { value: G.tint2 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.onGo = () => { G.band.start(); later(0.8, ask); };
      K.intro(G, { title: 'What should I paint?', how: 'Wake Raquel up, and tell her what to paint. Talk, type, or pick an idea.',
        say: 'What should I paint? Raquel always has art flowing through her. Wake her up, and tell her what to paint. Talk, type, or pick an idea.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.queue.length) { const due = []; G.queue = G.queue.filter(q => (q.t -= dt) > 0 || (due.push(q), false)); due.forEach(q => G && q.fn()); if (!G) return; }
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 3.2) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); } }
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // how loud: your voice while recording, hers while she says it back
      let lvl = 0;
      const an = G.state === 'rec' ? G.micAn : G.state === 'say' && !G.tts ? G.an : null;
      if (an) { an.getFloatTimeDomainData(G.abuf); let r = 0; for (let i = 0; i < G.abuf.length; i++) r += G.abuf[i] * G.abuf[i]; lvl = Math.min(1, Math.sqrt(r / G.abuf.length) * 7); }
      if (G.state === 'say' && G.tts) lvl = G.sayT < G.sayLen ? 0.35 + 0.35 * Math.abs(Math.sin(G.t * 11)) : 0;
      if (G.bot && G.state === 'say') lvl = 0.5 + 0.5 * Math.sin(G.t * 12);
      G.open += ((lvl > 0.06 ? Math.min(1, lvl * 1.4) : 0) - G.open) * Math.min(1, dt * 20); u.uJaw.value = G.open;
      G.talk += (lvl - G.talk) * Math.min(1, dt * 3); u.uFlow.value = G.talk * 1.2 + G.burst + G.painted * 0.15;
      // eyes: open, close, blink, look around
      G.eyes += (G.eyesTo - G.eyes) * Math.min(1, dt * 3);
      G.nextBlink -= dt; if (G.nextBlink <= 0) { G.blinkT = 0; G.nextBlink = 2.5 + Math.random() * 3.5; }
      if (G.blinkT !== undefined) { G.blinkT += dt; const b = G.blinkT / 0.18; G.blink = b < 1 ? Math.sin(b * Math.PI) : 0; if (b >= 1) G.blinkT = undefined; }
      const o = G.eyes * (1 - G.blink); u.uOpenL.value = o; u.uOpenR.value = o;
      if (Math.random() < dt * 0.4 && G.state !== 'say' && G.state !== 'heard') G.look = [Math.random() * 1.4 - 0.7, Math.random() * 0.6 - 0.1];
      G.lookNow[0] += (G.look[0] - G.lookNow[0]) * Math.min(1, dt * 6); G.lookNow[1] += (G.look[1] - G.lookNow[1]) * Math.min(1, dt * 6);
      u.uLook.value.set(G.lookNow[0], G.lookNow[1]);
      G.burst += (G.burstTo - G.burst) * Math.min(1, dt * 2); u.uBurst.value = G.burst;
      G.tint += (G.tintTo - G.tint) * Math.min(1, dt * 1.2); u.uTintK.value = G.tint;
      if (G.state === 'rec') { G.recT += dt; if (G.recT >= MAX_REC) stopRec(); }
      if (G.state === 'say') {
        G.sayT += dt;
        if (G.words) { const w = G.words.split(/\s+/), n = Math.max(1, Math.ceil(w.length * Math.min(1, G.sayT / Math.max(0.5, G.sayLen * 0.92)))); caption(w.slice(0, n).join(' ')); }
        if (!G.tts && G.sayT > G.sayLen + 0.4) endSay();
        if (G.tts && G.sayT > G.sayLen + 0.6) endSay();
      }
      // a hint if nobody answers
      if (G.state === 'ready' && !G.bot && !(G.box && G.box.style.display !== 'none')) { G.idle += dt; if (G.idle > HINT_AFTER) { G.idle = 0; if (G.hints++ < 2) G.say('Press Talk, Type or Pick.'); } }
      // the painted ideas: swirl out of her, then settle in the streams, bobbing
      for (const P of G.paintings) {
        P.t += dt; const f = Math.min(1, P.t / 3), e = f * f * (3 - 2 * f), a = (1 - e) * Math.PI * 2.2;
        const cu = 0.44 + (P.slot[0] - 0.44) * e + Math.sin(a) * 0.12 * (1 - e), cv = 0.6 + (P.slot[1] - 0.6) * e + Math.cos(a) * 0.08 * (1 - e) + Math.sin(G.t * 1.2 + P.ph) * 0.006 * e;
        const [x, y] = G.S.P(cu, cv); P.sp.position.set(x, y, 0.07);
        const s = 0.34 * (0.4 + 0.6 * e) * (1 + 0.03 * Math.sin(G.t * 1.7 + P.ph)); P.sp.scale.set(s, s * P.aspect, 1);
        P.sp.material.opacity = Math.min(1, P.t * 2) * (G.over ? 0.95 : 0.92);
        P.sp.material.rotation = (1 - e) * 0.6 * Math.sin(a) + 0.05 * Math.sin(G.t * 0.8 + P.ph);
      }
      // the robot: picks an idea, types one, picks another
      if (G.bot) {
        G.botT += dt;
        if (G.state === 'ready' && G.botT > 1) { G.botT = 0; if (G.idea === 1) typeFor('A whale singing to the stars'); else pickIt(); }
        else if (G.state === 'pick' && G.botT > 1) { G.botT = 0; choose(G.cards[0]); }
        if (G.state !== 'ready' && G.state !== 'pick') G.botT = 0;
      }
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down') return;
      // tap her face: she looks where you touched
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      if (G.state !== 'paint') G.eyesTo = 1;
      G.look = [Math.max(-1, Math.min(1, (p.u - 0.43) / 0.25)), Math.max(-1, Math.min(1, (p.v - 0.44) / 0.2))];
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); try { G.src && G.src.stop(); } catch (e) {} if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(G.artist ? 0.3 : 1); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'flow', playing: G.playing, over: G.over, state: G.state, idea: G.idea, eyes: +G.eyes.toFixed(2), jaw: +G.open.toFixed(2), words: G.words,
      artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {}
        try { G.rec && G.rec.state !== 'inactive' && G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} try { G.src && G.src.stop(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {}
        if (G.stream) G.stream.getTracks().forEach(t => t.stop()); G.capEl && G.capEl.remove(); G.box && G.box.remove(); try { G.an.disconnect(); } catch (e) {} try { G.band.stop(); } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
