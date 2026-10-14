// THE SCOPE OF COMMUNICATION (Marcus Roberts): SELF-TALK PUPPETS, "Good communication starts with healthy self-talk".
// The two heads in the painting become puppets for the two voices inside your own head.
// Voice 1, the swirly head on the left, says something you tell yourself when things get hard (the worry).
// Voice 2, the inky head on the right, answers it back, kindly, like a best friend would.
// Press Talk and record each one, changing your own voice for each head, then pick a voice changer
// (deep, squeaky, robot, echo or normal). Then the heads play your conversation back: the speaking head's jaw
// drops with every word, a glow runs around its outline, its colours swirl, and a cloud of coloured smoke drifts
// from its mouth to the other head, like the painting's own animation. Up to 3 back-and-forths.
// No microphone, or rather type? Press Type and the head says your words in a computer voice.
// Everything stays on this phone: nothing is uploaded or saved.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/scope/';   // glow-l.png / glow-r.png: R = tight outline glow, G = wide halo, B = the head itself
const ROUNDS = [
  [{ k: 'Voice 1: the worry', p: 'Say something you tell yourself when things get hard.', sub: 'Like: “I’m not good enough.” or “What if I mess up?” Use a low, grumbly voice.', say: 'Voice 1, the worry. Say something you tell yourself when things get hard. Use a low, grumbly voice.' },
   { k: 'Voice 2: the answer', p: 'Now answer it back, like your best friend would.', sub: 'Change your voice! Make it bright and warm. Kind, and true.', say: 'Voice 2, the answer. Now answer it back, like your best friend would. Change your voice! Make it bright and warm.' }],
  [{ k: 'Voice 1: the worry', p: 'The worry argues back. What does it say now?', sub: 'Back to your worry voice.', say: 'The worry argues back. What does it say now? Back to your worry voice.' },
   { k: 'Voice 2: the answer', p: 'Answer it again. Stay kind.', sub: 'Back to your warm voice.', say: 'Answer it again. Stay kind.' }],
  [{ k: 'Voice 1: the worry', p: 'One last doubt.', sub: 'Worry voice.', say: 'One last doubt.' },
   { k: 'Voice 2: the answer', p: 'Have the last word. Make it a healthy one.', sub: 'Warm voice.', say: 'Have the last word. Make it a healthy one.' }],
];
const STYLES = [
  { id: 'deep', label: 'Deep' }, { id: 'squeak', label: 'Squeaky' }, { id: 'robot', label: 'Robot' }, { id: 'echo', label: 'Echo' }, { id: 'normal', label: 'Normal' },
];
const MAX_REC = 10;
const SIDE = [
  { name: 'the worry', mouth: [0.428, 0.474], col: ['#e8452c', '#f2c12e', '#3aa655', '#2f6db5', '#8e3fb0', '#f07c22'], bar: '#6b3fd0' },
  { name: 'the answer', mouth: [0.566, 0.476], col: ['#e2381b', '#f08a24', '#f6c445', '#c0261a', '#ff6a3d'], bar: '#f08a24' },
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting itself: both jaws, the outline glow of whoever is speaking, and their colours swirling (u, v from the top-left)
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, gL, gR;
uniform float uOpenL, uOpenR, uGlowL, uGlowR, uSwirlL, uSwirlR, uDim, uT, uA, uH;
vec3 tex(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec3 gl3(sampler2D g, vec2 p){ return texture2D(g, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec2 rot(vec2 d, float a){ float c = cos(a), s = sin(a); return vec2(c * d.x - s * d.y, s * d.x + c * d.y); }
// one jaw: everything below the mouth line, in front of the hinge, swings down around the hinge (dir = which way the face looks)
// returns where to sample; gap = 1 inside the opened mouth
vec2 jaw(vec2 p, vec2 H, float line, float back, float dir, float open, inout float gap){
  float wx = dir > 0.0 ? smoothstep(back, back + 0.05, p.x) * (1.0 - smoothstep(0.455, 0.48, p.x))
                       : (1.0 - smoothstep(back - 0.05, back, p.x)) * smoothstep(0.52, 0.545, p.x);
  float wy = 1.0 - smoothstep(0.535, 0.57, p.y);
  float below = step(line, p.y);
  float a = open * 0.22 * wx * wy * below * dir;
  if (a == 0.0) return p;
  vec2 d = (p - H) * vec2(1.0, uH);
  vec2 q = H + rot(d, -a) / vec2(1.0, uH);
  gap = max(gap, smoothstep(line + 0.0012, line - 0.0012, q.y) * smoothstep(0.0, 0.15, open));
  return q;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the speaking head's colours swirl, well inside the head (away from the lips and the outline)
  float inL = min(min(gl3(gL, p + vec2(0.022, 0.0)).b, gl3(gL, p - vec2(0.022, 0.0)).b), min(gl3(gL, p + vec2(0.0, 0.022)).b, gl3(gL, p - vec2(0.0, 0.022)).b));
  float inR = min(min(gl3(gR, p + vec2(0.022, 0.0)).b, gl3(gR, p - vec2(0.022, 0.0)).b), min(gl3(gR, p + vec2(0.0, 0.022)).b, gl3(gR, p - vec2(0.0, 0.022)).b));
  float sw = inL * uSwirlL + inR * uSwirlR;
  s += vec2(sin(p.y * 38.0 + uT * 2.2 + sin(p.x * 21.0)), cos(p.x * 34.0 - uT * 1.8 + sin(p.y * 17.0))) * 0.0045 * sw;
  // the two jaws
  float gapL = 0.0, gapR = 0.0;
  s = jaw(s, vec2(0.372, 0.4725), 0.4725, 0.35, 1.0, uOpenL, gapL);
  s = jaw(s, vec2(0.6, 0.4745), 0.4745, 0.63, -1.0, uOpenR, gapR);
  vec3 col = tex(s), kL = gl3(gL, s), kR = gl3(gR, s);   // the glow follows the moving jaw
  vec3 bg = tex(vec2(0.5, p.y));
  // inside the opened mouth: dark behind the lips, the plain wall in front of them
  if (gapL > 0.0) {
    float m = 1.0 - smoothstep(0.412, 0.426, p.x), deep = smoothstep(0.425, 0.385, p.x);
    col = mix(col, mix(bg, mix(vec3(0.36, 0.07, 0.08), vec3(0.06, 0.02, 0.03), deep), m), gapL);
    kL = mix(kL, mix(gl3(gL, p) * vec3(1.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0), m), gapL);
  }
  if (gapR > 0.0) {
    float m = smoothstep(0.566, 0.58, p.x), deep = smoothstep(0.572, 0.6, p.x);
    col = mix(col, mix(bg, mix(vec3(0.4, 0.08, 0.06), vec3(0.08, 0.02, 0.02), deep), m), gapR);
    kR = mix(kR, mix(gl3(gR, p) * vec3(1.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0), m), gapR);
  }
  // the room dims a little while someone speaks, so the speaker's glow stands out
  float spk = max(uGlowL, uGlowR), mine = uGlowL >= uGlowR ? kL.b : kR.b;
  col = mix(col, col * vec3(0.8, 0.82, 0.9), uDim * (1.0 - mine));
  // the glow around the outline of whoever is speaking
  vec2 cL = vec2(0.28, 0.4), cR = vec2(0.72, 0.4);
  float ang = atan(p.y - cL.y, p.x - cL.x) / 6.2832;
  float hue = fract(ang + uT * 0.12);
  vec3 rainbow = clamp(abs(fract(hue + vec3(0.0, 0.667, 0.333)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  rainbow = mix(rainbow, vec3(1.0), 0.15);
  float flick = 0.85 + 0.15 * sin(uT * 13.0 + p.y * 60.0);
  vec3 fire = mix(vec3(1.0, 0.33, 0.08), vec3(1.0, 0.8, 0.2), 0.5 + 0.5 * sin(uT * 3.0 + p.y * 40.0 + p.x * 25.0));
  float aL = clamp(kL.r * 1.0 + kL.g * 0.55, 0.0, 1.0) * uGlowL * (1.0 - kL.b);
  float aR = clamp(kR.r * 1.0 + kR.g * 0.55, 0.0, 1.0) * uGlowR * (1.0 - kR.b) * flick;
  col = mix(col, rainbow, clamp(aL, 0.0, 0.92));
  col = mix(col, fire, clamp(aR, 0.0, 0.92));
  gl_FragColor = vec4(col, uA);
}`;

export function selfTalkGame() {
  let G = null;

  // ── voice changers ──
  function impulse(ac, secs, decay) { const n = ac.sampleRate * secs, b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  function playBuffer(buf, style, side) {
    const ac = G.ac, src = ac.createBufferSource(); src.buffer = buf;
    const out = ac.createGain(), pan = ac.createStereoPanner ? ac.createStereoPanner() : null; out.gain.value = 1.4;
    if (pan) { pan.pan.value = side ? 0.35 : -0.35; out.connect(pan).connect(G.an); } else out.connect(G.an);
    const stops = [];
    if (style === 'deep') src.playbackRate.value = 0.74;
    if (style === 'squeak') src.playbackRate.value = 1.45;
    if (style === 'robot') {   // a ring modulator: the voice buzzes like a robot
      const ring = ac.createGain(), osc = ac.createOscillator(), dry = ac.createGain();
      ring.gain.value = 0; osc.frequency.value = 55; osc.connect(ring.gain); osc.start(); stops.push(osc);
      dry.gain.value = 0.25; src.connect(ring).connect(out); src.connect(dry).connect(out); out.gain.value = 1.9;
    } else if (style === 'echo') {   // a big hall inside your head
      const cv = ac.createConvolver(), wet = ac.createGain(), dl = ac.createDelay(1), fb = ac.createGain();
      cv.buffer = impulse(ac, 2.2, 2.4); wet.gain.value = 0.5; dl.delayTime.value = 0.28; fb.gain.value = 0.35;
      src.connect(out); src.connect(cv).connect(wet).connect(out); src.connect(dl); dl.connect(fb).connect(dl); dl.connect(wet);
    } else src.connect(out);
    src.onended = () => stops.forEach(o => { try { o.stop(); } catch (e) {} });
    src.start(); G.src = src;
    return buf.duration / src.playbackRate.value;
  }
  function stopSound() { try { G.src && G.src.stop(); } catch (e) {} G.src = null; try { speechSynthesis.cancel(); } catch (e) {} G.tts = false; }

  // ── the screen ──
  function caption(text, side) {
    if (!G.capEl) { G.capEl = document.createElement('div'); G.capEl.className = 'mgk'; G.capEl.setAttribute('aria-live', 'polite');
      Object.assign(G.capEl.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))',
        background: 'rgba(0,0,0,.82)', borderLeft: '6px solid #ec3013', padding: '10px 14px', font: '700 clamp(18px,5vw,24px)/1.3 "Atkinson Hyperlegible",Arial,sans-serif', textTransform: 'none', display: 'none' });
      document.body.appendChild(G.capEl); }
    G.capEl.textContent = text || ''; G.capEl.style.display = text ? 'block' : 'none';
    if (side !== undefined) { G.capEl.style.borderLeftColor = SIDE[side].bar; G.capEl.style.textAlign = side ? 'right' : 'left'; G.capEl.style.borderRight = side ? '6px solid ' + SIDE[side].bar : '0'; G.capEl.style.borderLeftWidth = side ? '0' : '6px'; }
  }
  const cue = () => ROUNDS[G.round][G.side];
  function showPrompt(speak = true) {
    const c = cue(); G.ui.banner(c.p, c.sub, 0, c.k); if (speak) G.say(c.say);
  }
  function styleOf(side) { return STYLES[G.si[side]]; }
  function btns(B) { const el = G.ui.buttons(B); if (el && el.length > 3) el.forEach(b => Object.assign(b.style, { flex: '1 1 0', minWidth: '0', fontSize: '11px' })); }
  function buttons() {
    const B = [], line = G.cur;
    if (G.state === 'rec') B.push({ label: 'Stop', icon: '■', kind: 'red', aria: 'Stop recording', press: () => stopRec() });
    else if (G.state === 'play' || G.state === 'preview') B.push({ label: 'Stop', icon: '■', kind: 'black', aria: 'Stop', press: () => endPlay() });
    else if (G.state === 'ready') {
      B.push({ label: 'Talk', icon: '🎤', kind: 'red', aria: 'Talk: record ' + SIDE[G.side].name, press: () => startRec() });
      B.push({ label: 'Type', icon: '⌨', kind: 'black', aria: 'Type instead of talking', press: () => typeIt() });
      if (G.lines.length >= 2) B.push({ label: 'Play all', icon: '▶', aria: 'Play the conversation so far', press: () => playAll() });
    } else if (G.state === 'pick') {
      B.push({ label: styleOf(G.side).label, icon: '♪', kind: 'black', aria: 'Voice changer: ' + styleOf(G.side).label + '. Press for the next voice', press: () => { G.si[G.side] = (G.si[G.side] + 1) % STYLES.length; line.style = styleOf(G.side).id; preview(); } });
      B.push({ label: 'Again', icon: '🎤', aria: 'Record that again', press: () => { G.lines.pop(); G.cur = null; G.state = 'ready'; buttons(); showPrompt(false); startRec(); } });
      B.push({ label: G.side === 0 ? 'Next' : 'Play it', icon: G.side === 0 ? '➜' : '▶', kind: 'red', aria: G.side === 0 ? 'Next: record the answer' : 'Play the conversation', press: () => next() });
    } else if (G.state === 'end') {
      B.push({ label: 'Again', icon: '▶', aria: 'Play the conversation again', press: () => playAll() });
      if (G.round < ROUNDS.length - 1) B.push({ label: 'Keep going', icon: '➕', kind: 'black', aria: 'Keep the debate going: record another back and forth', press: () => { G.round++; G.side = 0; G.state = 'ready'; caption(''); buttons(); showPrompt(); } });
      B.push({ label: 'Done', icon: '✓', kind: 'red', aria: 'Finish', press: () => finish() });
    }
    btns(B);
  }

  // ── talking: record one voice; that head's mouth moves live with yours ──
  async function startRec() {
    if (G.state !== 'ready') return;
    stopSound(); G.say.stop && G.say.stop();
    try {
      if (!G.stream) G.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) { G.ui.alert('No microphone', 'Press Type to write it instead.', 2.4, 'blue'); G.say('The microphone is off. Press Type to write it instead.'); return; }
    if (!G.micAn) { G.micAn = G.ac.createAnalyser(); G.micAn.fftSize = 1024; G.micSrc = G.ac.createMediaStreamSource(G.stream); G.micSrc.connect(G.micAn); }   // keep hold of the source, or the browser may drop it
    const side = G.side;
    G.chunks = []; G.rec = new MediaRecorder(G.stream); G.rec.ondataavailable = e => e.data.size && G.chunks.push(e.data);
    G.rec.onstop = async () => {
      try { const ab = await new Blob(G.chunks).arrayBuffer(); const buf = await G.ac.decodeAudioData(ab); addLine({ side, buf, words: G.words }); }
      catch (e) { G.state = 'ready'; buttons(); G.ui.alert('Didn’t catch that', 'Try Talk again.', 2, 'blue'); }
    };
    G.rec.start(); G.state = 'rec'; G.recT = 0; G.words = ''; caption('Listening…', side); G.ui.hideBanner(); buttons(); G.buzz(30); K.tone(660, 0.08, { vol: 0.06 });
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { try { const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.continuous = true;
      r.onresult = e => { let t = ''; for (const x of e.results) t += x[0].transcript; G.words = t.trim(); if (G && G.state === 'rec') caption(G.words || 'Listening…', side); };
      r.onerror = () => {}; r.start(); G.sr = r; } catch (e) { G.sr = null; } }
  }
  function stopRec() { if (G.state !== 'rec') return; G.state = 'wait'; try { G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} buttons(); }
  function addLine(l) {
    l.style = styleOf(l.side).id; G.lines.push(l); G.cur = l; G.state = 'pick'; buttons();
    G.ui.banner('Change the voice', 'Press ' + styleOf(l.side).label + ' to try another voice changer.', 0, SIDE[l.side].name === 'the worry' ? 'Voice 1: the worry' : 'Voice 2: the answer');
    preview();
  }
  // hear just this line, in its voice
  function preview() {
    const l = G.cur; if (!l) return; stopSound();
    G.state = 'preview'; G.queue = [l]; G.qi = -1; G.after = 'pick'; buttons(); nextInQueue();
  }
  function next() {
    stopSound(); G.cur = null; G.ui.hideBanner();
    if (G.side === 0) { G.side = 1; G.state = 'ready'; caption(''); buttons(); showPrompt(); }
    else playAll();
  }
  // the whole conversation, back and forth
  function playAll() {
    stopSound(); G.say.stop && G.say.stop(); G.ui.hideBanner();
    G.state = 'play'; G.queue = G.lines.slice(); G.qi = -1; G.after = 'end'; G.played++; buttons(); nextInQueue();
  }
  function nextInQueue() {
    G.qi++; G.lineT = 0; G.gapT = 0;
    if (G.qi >= G.queue.length) return endPlay();
    const l = G.queue[G.qi]; G.speaker = l.side;
    if (l.buf) { G.tts = false; G.lineLen = playBuffer(l.buf, l.style, l.side); }
    else { G.tts = true; G.lineLen = Math.max(1.5, l.words.split(/\s+/).length * 0.42); speakTyped(l); }
    caption(l.words || '', l.side);
  }
  function speakTyped(l) {
    try { const u = new SpeechSynthesisUtterance(l.words); const st = l.style;
      u.rate = st === 'robot' ? 0.8 : 0.95; u.pitch = st === 'deep' ? 0.4 : st === 'squeak' ? 1.9 : st === 'robot' ? 0.1 : l.side ? 1.3 : 0.8;
      u.onend = () => { if (G && G.tts) G.lineLen = Math.min(G.lineLen, G.lineT); }; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  }
  function endPlay() {
    stopSound(); G.speaker = -1; G.queue = []; G.state = G.after || 'ready'; G.after = null;
    if (G.state === 'end') {
      caption('');
      const last = G.round >= ROUNDS.length - 1;
      G.ui.banner(last ? 'The last word' : 'Who won the debate?', last ? 'Your kind voice had the last word.' : 'Keep going: record another back and forth, or play it again.', 0, 'Self-talk');
      if (!G.endSaid) { G.endSaid = true; G.say(last ? 'Your kind voice had the last word.' : 'Keep the debate going, or play it again.'); }
    }
    buttons();
  }
  // or type it, and the head says it in a computer voice
  function typeIt() {
    if (!G.box) {
      G.box = document.createElement('form'); G.box.className = 'mgk';
      Object.assign(G.box.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))', pointerEvents: 'auto', display: 'flex', gap: '8px' });
      G.box.innerHTML = '<input type="text" maxlength="140" aria-label="What does this voice say?" placeholder="Type what this voice says…" style="flex:1;min-height:56px;padding:0 12px;border:3px solid #000;font:700 18px Atkinson Hyperlegible,Arial,sans-serif"><button type="submit" style="min-height:56px;padding:0 16px;border:3px solid #000;background:#ec3013;color:#fff;font:900 16px Archivo,Arial,sans-serif;text-transform:uppercase">Say it</button>';
      G.box.onsubmit = ev => { ev.preventDefault(); const v = G.box.querySelector('input').value.trim(); if (!v) return; G.box.style.display = 'none'; addLine({ side: G.side, buf: null, words: v }); };
      document.body.appendChild(G.box);
    }
    G.box.style.display = 'flex'; const inp = G.box.querySelector('input'); inp.value = ''; inp.focus(); G.ui.hideBanner();
  }
  function finish() {
    stopSound(); G.state = 'done'; caption(''); if (G.box) G.box.style.display = 'none'; G.ui.hideBanner(); G.speaker = -1;
    const n = Math.floor(G.lines.length / 2);
    K.finale(G, { won: true, kicker: 'Good communication starts with healthy self-talk', title: 'Healthy self-talk', line: G.work && G.work.quote,
      cells: [{ k: 'Back and forths', v: n }, { k: 'Voices', v: 2 }],
      say: 'You talked it out. Good communication starts with healthy self-talk. ' + ((G.work && G.work.quote) || '') });
  }

  // ── smoke: a cloud of colour drifting from the speaker's mouth to the other head ──
  function puff(side, strength) {
    const m = SIDE[side].mouth, dir = side ? -1 : 1;
    const [x, y] = G.S.P(m[0] + dir * 0.008, m[1] + (Math.random() - 0.5) * 0.02);
    const col = SIDE[side].col[Math.floor(Math.random() * SIDE[side].col.length)];
    const s = K.sprite(G.smokeTex[Math.floor(Math.random() * G.smokeTex.length)], 0.02, { color: col, order: 20, opacity: 0 });
    s.position.set(x, y, 0.05 + Math.random() * 0.01); s.material.rotation = Math.random() * 6.28; G.root.add(s);
    G.smoke.push({ s, x, y, vx: dir * (0.05 + Math.random() * 0.03) * (0.7 + strength * 0.6), vy: (Math.random() - 0.5) * 0.02, age: 0, life: 2.6 + Math.random() * 1.6,
      size: 0.06 + Math.random() * 0.08 + strength * 0.05, ph: Math.random() * 6.28, spin: (Math.random() - 0.5) * 1.2, op: 0.35 + Math.random() * 0.3 });
  }
  function updateSmoke(dt) {
    for (let i = G.smoke.length - 1; i >= 0; i--) {
      const p = G.smoke[i]; p.age += dt; const k = p.age / p.life;
      p.x += (p.vx * (1 - k * 0.6)) * dt; p.y += (p.vy + Math.sin(G.t * 1.7 + p.ph) * 0.018 + Math.sin(p.x * 30 + p.ph) * 0.012) * dt;
      p.s.position.x = p.x; p.s.position.y = p.y; p.s.material.rotation += p.spin * dt;
      const sz = 0.02 + p.size * Math.min(1, k * 1.3); p.s.scale.set(sz, sz, 1);
      p.s.material.opacity = p.op * Math.min(1, k * 5) * (1 - Math.max(0, (k - 0.55) / 0.45));
      if (k >= 1) { G.root.remove(p.s); p.s.material.dispose(); G.smoke.splice(i, 1); }
    }
  }

  // ── a quiet pad while you think (silent while you record or play) ──
  function pad(dt) {
    if (G.state === 'rec' || G.state === 'play' || G.state === 'preview' || G.state === 'wait' || G.over) return;
    G.padT -= dt; if (G.padT > 0) return;
    G.padT = 4.2; const C = [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]][G.padI++ % 4];
    K.chord(C, 4.4, { vol: 0.022, type: 'sine', spread: 0.3 });
  }

  // ── the robot tester: a pretend voice, so the mouths really move ──
  function fakeVoice(secs, base) {
    const ac = G.ac, n = Math.floor(ac.sampleRate * secs), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) { const t = i / ac.sampleRate, syl = Math.max(0, Math.sin(t * Math.PI * 4.2)) * (t < secs - 0.2 ? 1 : 0); d[i] = Math.sin(t * base * 6.283) * 0.4 * syl * (0.6 + 0.4 * Math.sin(t * 2.3)); }
    return b;
  }
  const BOT_WORDS = [['I’m not good enough.', 'You are learning, and that’s enough.'], ['But what if I mess up?', 'Then we try again. Mistakes help us grow.'], ['Nobody will listen.', 'I’m listening. Say it.']];

  return {
    title: 'Self-talk',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { ac: K.audio(), round: 0, side: 0, si: [0, 1], state: 'intro', lines: [], cur: null, queue: [], qi: 0, speaker: -1, open: [0, 0], glow: [0, 0], swirl: [0, 0], dim: 0,
        words: '', recT: 0, lineT: 0, lineLen: 0, gapT: 0, smoke: [], puffAcc: [0, 0], ambient: 0, padT: 1, padI: 0, played: 0, botT: 0 });
      G.force = new URLSearchParams(location.search).get('mouth');
      G.an = G.ac.createAnalyser(); G.an.fftSize = 1024; G.an.connect(G.ac.destination); G.abuf = new Float32Array(G.an.fftSize);
      G.uni = { map: { value: null }, gL: { value: null }, gR: { value: null }, uOpenL: { value: 0 }, uOpenR: { value: 0 }, uGlowL: { value: 0 }, uGlowR: { value: 0 }, uSwirlL: { value: 0 }, uSwirlR: { value: 0 },
        uDim: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      let need = 3; const done = () => { if (--need === 0 && G) G.face.visible = true; };
      const load = (url, key) => new THREE.TextureLoader().load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; done(); });
      const src = ctx.work && ctx.work.image; if (src) load(src, 'map');
      load(ART + 'glow-l.png', 'gL'); load(ART + 'glow-r.png', 'gR');
      // soft, lumpy smoke puffs
      G.smokeTex = [0, 1, 2, 3].map(k => K.canvasTex(128, 128, (g) => {
        let seed = 7 + k * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        g.filter = 'blur(5px)';
        for (let i = 0; i < 9; i++) { const x = 30 + rnd() * 68, y = 34 + rnd() * 60, r = 10 + rnd() * 20;
          const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
        g.filter = 'blur(2px)'; g.lineCap = 'round';
        for (let i = 0; i < 5; i++) {   // wisps, like ink curling in water
          g.strokeStyle = `rgba(255,255,255,${0.35 + rnd() * 0.3})`; g.lineWidth = 2 + rnd() * 5; g.beginPath();
          const x0 = 20 + rnd() * 30, y0 = 30 + rnd() * 70; g.moveTo(x0, y0);
          g.bezierCurveTo(x0 + 20 + rnd() * 30, y0 - 30 + rnd() * 60, x0 + 40 + rnd() * 30, y0 - 30 + rnd() * 60, x0 + 60 + rnd() * 30, y0 - 20 + rnd() * 40); g.stroke(); }
      }));
      G.onGo = () => { G.state = 'ready'; buttons(); showPrompt(); };
      K.intro(G, { title: 'Healthy self-talk', how: 'Good communication starts with healthy self-talk. What do you say to yourself? Record two voices: the worry on the left, a kind answer on the right. Change your voice for each, then watch them talk it out. Your voice stays on this phone.',
        say: 'Good communication starts with healthy self-talk. What are some things you say to yourself, and debate back and forth? These two heads are the two voices inside you. Record the worry for the left head, and a kind answer for the right head. Change your own voice for each one, then pick a voice changer. Then watch them talk it out. Your voice stays on this phone.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt); pad(dt);
      G.uni.uT.value = G.t; G.uni.uA.value += ((G.over ? 0 : 1) - G.uni.uA.value) * Math.min(1, dt * 2);
      // who is talking, and how loud
      let lvl = 0, who = -1;
      if (G.state === 'rec') { who = G.side; if (G.micAn) { G.micAn.getFloatTimeDomainData(G.abuf); let r = 0; for (let i = 0; i < G.abuf.length; i++) r += G.abuf[i] * G.abuf[i]; lvl = Math.min(1, Math.sqrt(r / G.abuf.length) * 7); } }
      if ((G.state === 'play' || G.state === 'preview') && G.speaker >= 0) {
        who = G.speaker;
        if (G.tts) lvl = G.lineT < G.lineLen ? 0.35 + 0.35 * Math.abs(Math.sin(G.t * 11)) * (0.6 + 0.4 * Math.sin(G.t * 3.1)) : 0;
        else { G.an.getFloatTimeDomainData(G.abuf); let r = 0; for (let i = 0; i < G.abuf.length; i++) r += G.abuf[i] * G.abuf[i]; lvl = Math.min(1, Math.sqrt(r / G.abuf.length) * 6); }
        G.lineT += dt;
        if (G.lineT > G.lineLen + 0.45) nextInQueue();
        else if (G.tts && G.lineT > G.lineLen + 6) nextInQueue();
      }
      G.level = lvl; G.who = who;
      for (let s = 0; s < 2; s++) {
        const me = who === s, l = me ? lvl : 0;
        G.open[s] += ((l > 0.06 ? Math.min(1, l * 1.5) : 0) - G.open[s]) * Math.min(1, dt * 22);
        G.glow[s] += ((me ? 0.6 + 0.4 * Math.min(1, l * 1.6) : 0) - G.glow[s]) * Math.min(1, dt * (me ? 8 : 2.5));
        G.swirl[s] += ((me ? 0.3 + 0.7 * Math.min(1, l * 1.4) : 0) - G.swirl[s]) * Math.min(1, dt * 4);
        // the smoke leaves the mouth with the words
        if (me && l > 0.08) { G.puffAcc[s] += dt * (8 + 30 * l); while (G.puffAcc[s] >= 1) { G.puffAcc[s]--; puff(s, l); } }
      }
      G.dim += ((who >= 0 ? 1 : 0) - G.dim) * Math.min(1, dt * 2);
      // a slow drift of smoke between them while nobody talks, like the painting's animation
      if (who < 0 && !G.over && Math.random() < dt * 1.6) puff(Math.random() < 0.5 ? 0 : 1, 0);
      updateSmoke(dt);
      if (G.force) { const f = G.force; G.open = [f === 'L' ? 1 : 0, f === 'R' ? 1 : 0]; G.glow = [f === 'L' ? 1 : 0, f === 'R' ? 1 : 0]; G.swirl = G.glow.slice(); G.dim = 1; }   // test: &mouth=L or R holds that mouth open
      const u = G.uni; u.uOpenL.value = G.open[0]; u.uOpenR.value = G.open[1]; u.uGlowL.value = G.glow[0]; u.uGlowR.value = G.glow[1];
      u.uSwirlL.value = G.swirl[0]; u.uSwirlR.value = G.swirl[1]; u.uDim.value = G.dim;
      if (G.state === 'rec') { G.recT += dt; if (G.recT >= MAX_REC) stopRec(); }
      // the robot tester: records both voices for each round, plays them back, goes two rounds, then finishes
      if (G.bot) {
        G.botT += dt;
        if (G.state === 'ready' && G.botT > 0.6) { G.botT = 0; const w = BOT_WORDS[G.round][G.side]; addLine({ side: G.side, buf: fakeVoice(1.6 + w.length * 0.03, G.side ? 260 : 140), words: w }); }
        else if (G.state === 'pick' && G.botT > 0.8) { G.botT = 0; next(); }
        else if (G.state === 'end' && G.botT > 0.8) { G.botT = 0; if (G.round < 1) { G.round++; G.side = 0; G.state = 'ready'; buttons(); showPrompt(); } else finish(); }
        else if (!['ready', 'pick', 'end'].includes(G.state)) G.botT = 0;
      }
    },
    pointer() {},
    pause() { if (G) { G.paused = true; stopSound(); } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'selftalk', playing: G.playing, over: G.over, state: G.state, round: G.round, side: G.side, lines: G.lines.length, styles: G.lines.map(l => l.style), speaker: G.speaker,
      open: G.open.map(v => +v.toFixed(2)), glow: G.glow.map(v => +v.toFixed(2)), smoke: G.smoke.length, played: G.played, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { try { G.rec && G.rec.state !== 'inactive' && G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} stopSound();
        if (G.stream) G.stream.getTracks().forEach(t => t.stop()); G.capEl && G.capEl.remove(); G.box && G.box.remove(); try { G.an.disconnect(); } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
