// FLOW STATE (Raquel Alim): WHAT SHOULD I PAINT?
// "I always have art flowing through me... I have too many things in my head that I need to paint."
// Raquel is lost in her flow, eyes closed, colours streaming around her. Then she OPENS HER EYES, blinks, looks at
// you, and asks: "What should I paint next?" You're her voice: press Talk and say an idea. Her mouth moves with your
// voice as you speak, then she says it back (in her voice: Normal, Dreamy or Bright), eyes open, colours pouring out
// around her as she talks. Then she closes her eyes and paints it in her head: the colours swirl into a burst.
// Three ideas, then her own words. Tap her face any time and she opens her eyes and looks where you touched.
// No microphone, or rather type? Press Type and she says your words in a computer voice. Nothing is uploaded or saved.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ASKS = [
  'What should I paint next?',
  'Ooh, I love that. What else is in your head? What should I paint?',
  'One more. What’s something beautiful you want to see painted?',
];
const STYLES = [
  { id: 'normal', label: 'Normal' }, { id: 'dreamy', label: 'Dreamy' }, { id: 'bright', label: 'Bright' },
];
const IDEAS = 3, MAX_REC = 10;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting: her eyes open (drawn over the closed lids: white, a warm brown iris that looks around, a highlight,
// the upper lid and lashes) and blink; her jaw drops as she talks; the colours around her flow, faster as she speaks
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uOpenL, uOpenR, uJaw, uFlow, uT, uA, uH, uBurst;
uniform vec2 uLook;
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
  // the colours around her flow (not on her face)
  float face = 1.0 - smoothstep(0.9, 1.15, length((p - vec2(0.43, 0.52)) / vec2(0.22, 0.3)));
  float fl = (1.0 - face) * (0.4 + uFlow);
  s += vec2(sin(p.y * 16.0 + uT * 1.1 + sin(p.x * 7.0)), cos(p.x * 13.0 - uT * 0.9)) * 0.006 * fl;
  // her jaw drops as she talks
  float dj = uJaw * 0.022;
  float wj = 1.0 - smoothstep(0.65, 1.0, length((p - JAW) / JAWR));
  float below = smoothstep(MOUTH.y - 0.002, MOUTH.y + 0.003, p.y);
  s.y -= dj * wj * below;
  vec3 col = at(s);
  // inside the mouth, between the lips
  float mw = 0.052, my = MOUTH.y + dj * 0.5 + 0.001, mh = dj * 0.5 + 0.003;
  vec2 mq = vec2((p.x - MOUTH.x) / mw, (p.y - my) / mh); mq.y += mq.x * mq.x * 0.2;
  float me = length(mq);
  vec3 inside = mix(vec3(0.07, 0.02, 0.03), vec3(0.4, 0.13, 0.12), smoothstep(0.1, 1.0, me));
  inside = mix(inside, vec3(0.78, 0.7, 0.64), 0.7 * smoothstep(-0.95, -0.7, mq.y) * (1.0 - smoothstep(-0.7, -0.5, mq.y)) * (1.0 - smoothstep(0.4, 0.7, abs(mq.x))));   // a hint of teeth
  col = mix(col, inside, smoothstep(1.0, 0.75, me) * smoothstep(0.05, 0.2, uJaw));
  // her eyes
  vec4 eL = eye(p, vec2(0.284, 0.449), vec2(0.37, 0.446), 0.004, uOpenL, 0.032);
  vec4 eR = eye(p, vec2(0.47, 0.432), vec2(0.572, 0.44), 0.008, uOpenR, 0.035);
  col = mix(col, eL.rgb, eL.a); col = mix(col, eR.rgb, eR.a);
  // a burst of colour when she paints an idea in her head
  col += (1.0 - face) * uBurst * 0.25 * (0.5 + 0.5 * sin(vec3(0.0, 2.1, 4.2) + p.x * 9.0 + p.y * 7.0 + uT * 3.0));
  gl_FragColor = vec4(col, uA);
}`;

export function whatShouldIPaintGame() {
  let G = null;

  // ── her voice ──
  function impulse(ac, secs, decay) { const n = ac.sampleRate * secs, b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  function playBuffer(buf, style) {
    const ac = G.ac, src = ac.createBufferSource(); src.buffer = buf;
    const out = ac.createGain(); out.gain.value = 1.4; out.connect(G.an);
    if (style === 'bright') src.playbackRate.value = 1.18;
    if (style === 'dreamy') {   // soft, with a long shimmer of echo
      src.playbackRate.value = 0.94;
      const cv = ac.createConvolver(), wet = ac.createGain(), dl = ac.createDelay(1), fb = ac.createGain();
      cv.buffer = impulse(ac, 2.6, 2.2); wet.gain.value = 0.5; dl.delayTime.value = 0.32; fb.gain.value = 0.3;
      src.connect(out); src.connect(cv).connect(wet).connect(out); src.connect(dl); dl.connect(fb).connect(dl); dl.connect(wet);
    } else src.connect(out);
    src.start(); G.src = src;
    return buf.duration / src.playbackRate.value;
  }
  function caption(text) {
    if (!G.capEl) { G.capEl = document.createElement('div'); G.capEl.className = 'mgk'; G.capEl.setAttribute('aria-live', 'polite');
      Object.assign(G.capEl.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))',
        background: 'rgba(0,0,0,.82)', borderLeft: '6px solid #f2a541', padding: '10px 14px', font: '700 clamp(18px,5vw,24px)/1.3 "Atkinson Hyperlegible",Arial,sans-serif', textTransform: 'none', display: 'none' });
      document.body.appendChild(G.capEl); }
    G.capEl.textContent = text || ''; G.capEl.style.display = text ? 'block' : 'none';
  }
  // she speaks a line of her own (Ben's voice clip or the computer voice), mouth moving
  function herLine(text) { G.say(text); G.talkT = 0.4 + text.split(/\s+/).length * 0.36; }
  function ask() {
    G.state = 'ready'; G.eyesTo = 1; G.look = [0, 0.3];
    herLine(ASKS[G.idea]); G.ui.banner('What should I paint?', 'Press Talk and tell Raquel an idea. Your voice becomes hers.', 0, `Idea ${G.idea + 1} of ${IDEAS}`); buttons();
  }
  function btns(B) { const el = G.ui.buttons(B); if (el && el.length > 3) el.forEach(b => Object.assign(b.style, { flex: '1 1 0', minWidth: '0', fontSize: '12px' })); }
  function buttons() {
    const B = [];
    if (G.state === 'rec') B.push({ label: 'Stop', icon: '■', kind: 'red', aria: 'Stop recording', press: () => stopRec() });
    else if (G.state === 'say') B.push({ label: 'Stop', icon: '■', kind: 'black', aria: 'Stop', press: () => endSay() });
    else if (G.state === 'ready') {
      B.push({ label: 'Talk', icon: '🎤', kind: 'red', aria: 'Talk: tell Raquel what to paint', press: () => startRec() });
      B.push({ label: 'Type', icon: '⌨', kind: 'black', aria: 'Type instead of talking', press: () => typeIt() });
    } else if (G.state === 'heard') {
      B.push({ label: STYLES[G.si].label, icon: '♪', kind: 'black', aria: 'Her voice: ' + STYLES[G.si].label + '. Press for another', press: () => { G.si = (G.si + 1) % STYLES.length; sayBack(); } });
      B.push({ label: 'Again', icon: '🎤', aria: 'Say it again', press: () => { G.state = 'ready'; G.buf = null; startRec(); } });
      B.push({ label: 'Paint it', icon: '🎨', kind: 'red', aria: 'Paint it', press: () => paint() });
    }
    btns(B);
  }
  async function startRec() {
    if (G.state !== 'ready') return;
    try { if (!G.stream) G.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch (e) { G.ui.alert('No microphone', 'Press Type to write it instead.', 2.4, 'blue'); return; }
    if (!G.micAn) { G.micAn = G.ac.createAnalyser(); G.micAn.fftSize = 1024; G.micSrc = G.ac.createMediaStreamSource(G.stream); G.micSrc.connect(G.micAn); }
    G.chunks = []; G.rec = new MediaRecorder(G.stream); G.rec.ondataavailable = e => e.data.size && G.chunks.push(e.data);
    G.rec.onstop = async () => { try { const ab = await new Blob(G.chunks).arrayBuffer(); G.buf = await G.ac.decodeAudioData(ab); sayBack(); } catch (e) { G.state = 'ready'; buttons(); G.ui.alert('Didn’t catch that', 'Try Talk again.', 2, 'blue'); } };
    G.say.stop && G.say.stop(); G.talkT = 0;
    G.rec.start(); G.state = 'rec'; G.recT = 0; G.words = ''; caption('Listening…'); G.ui.hideBanner(); buttons(); G.buzz(30);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { try { const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.continuous = true;
      r.onresult = e => { let t = ''; for (const x of e.results) t += x[0].transcript; G.words = t.trim(); if (G && G.state === 'rec') caption(G.words || 'Listening…'); };
      r.onerror = () => {}; r.start(); G.sr = r; } catch (e) { G.sr = null; } }
  }
  function stopRec() { if (G.state !== 'rec') return; G.state = 'wait'; try { G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} buttons(); }
  function sayBack() {
    try { G.src && G.src.stop(); } catch (e) {}
    G.state = 'say'; G.sayT = 0; G.tts = false; G.eyesTo = 1; G.look = [0, 0.3];
    if (G.buf) G.sayLen = playBuffer(G.buf, STYLES[G.si].id);
    else { G.tts = true; G.sayLen = Math.max(1.5, G.words.split(/\s+/).length * 0.42);
      try { const u = new SpeechSynthesisUtterance(G.words); u.pitch = STYLES[G.si].id === 'bright' ? 1.4 : STYLES[G.si].id === 'dreamy' ? 0.85 : 1.05; u.rate = STYLES[G.si].id === 'dreamy' ? 0.85 : 0.95;
        u.onend = () => { if (G && G.tts) G.sayLen = Math.min(G.sayLen, G.sayT); }; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
    buttons();
  }
  function endSay() { try { G.src && G.src.stop(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} G.tts = false; G.state = 'heard'; buttons(); if (G.words) caption(G.words); }
  function typeIt() {
    if (!G.box) {
      G.box = document.createElement('form'); G.box.className = 'mgk';
      Object.assign(G.box.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))', pointerEvents: 'auto', display: 'flex', gap: '8px' });
      G.box.innerHTML = '<input type="text" maxlength="140" aria-label="What should Raquel paint?" placeholder="What should Raquel paint?" style="flex:1;min-height:56px;padding:0 12px;border:3px solid #000;font:700 18px Atkinson Hyperlegible,Arial,sans-serif"><button type="submit" style="min-height:56px;padding:0 16px;border:3px solid #000;background:#ec3013;color:#fff;font:900 16px Archivo,Arial,sans-serif;text-transform:uppercase">Say it</button>';
      G.box.onsubmit = ev => { ev.preventDefault(); const v = G.box.querySelector('input').value.trim(); if (!v) return; G.box.style.display = 'none'; G.words = v; G.buf = null; caption(v); sayBack(); };
      document.body.appendChild(G.box);
    }
    G.box.style.display = 'flex'; const inp = G.box.querySelector('input'); inp.value = ''; inp.focus(); G.ui.hideBanner();
  }
  // she closes her eyes and paints it in her head
  function paint() {
    try { G.src && G.src.stop(); } catch (e) {}
    G.state = 'paint'; G.eyesTo = 0; G.burstTo = 1; caption(''); G.ui.buttons([]); G.painted++;
    herLine('Mmm. I can see it already.');
    const ac = G.ac, t = ac.currentTime + 0.05;
    [60, 64, 67, 72, 76, 79].forEach((m, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); g.gain.setValueAtTime(0.0001, t + i * 0.12); g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.12 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 2.5); o.connect(g).connect(ac.destination); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 2.6); });
    for (let i = 0; i < 4; i++) { const [x, y] = G.S.P(0.1 + Math.random() * 0.8, 0.08 + Math.random() * 0.3); G.fx.add(x, y, ['#f2a541', '#ec3013', '#4aa3c8', '#7ac37a'][i], 14, 0.1); }
    setTimeout(() => { if (!G) return; G.burstTo = 0; G.idea++; G.buf = null; G.words = '';
      if (G.idea >= IDEAS) finish(); else ask(); }, 4000);
  }
  function finish() {
    G.state = 'done'; G.eyesTo = 1;
    K.finale(G, { won: true, kicker: 'What should I paint?', title: 'Three new paintings', line: G.work && G.work.quote,
      cells: [{ k: 'Ideas', v: G.painted }],
      say: 'Three new paintings, flowing through me. Thank you. ' + ((G.work && G.work.quote) || '') });
  }

  return {
    title: 'What should I paint?',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { ac: K.audio(), state: 'intro', idea: 0, painted: 0, si: 1, buf: null, words: '', open: 0, talk: 0, talkT: 0, eyes: 0, eyesTo: 0, blink: 0, nextBlink: 3, look: [0, 0.3], lookNow: [0, 0.3],
        burst: 0, burstTo: 0, recT: 0, sayT: 0, sayLen: 0, botT: 0 });
      G.an = G.ac.createAnalyser(); G.an.fftSize = 1024; G.an.connect(G.ac.destination); G.abuf = new Float32Array(G.an.fftSize);
      G.uni = { map: { value: null }, uOpenL: { value: 0 }, uOpenR: { value: 0 }, uJaw: { value: 0 }, uFlow: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uBurst: { value: 0 }, uLook: { value: new THREE.Vector2() } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.onGo = () => { setTimeout(() => G && ask(), 1200); G.eyesTo = 1; };
      K.intro(G, { title: 'What should I paint?', how: 'Raquel has art flowing through her all the time. Wake her up, and be her voice: tell her what to paint next.',
        say: 'What should I paint? Raquel always has art flowing through her, and too many ideas in her head. She’s about to open her eyes and ask you what to paint next. Press Talk and tell her an idea: her mouth moves with your voice, then she says it back. Or press Type to write it.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // how loud: your voice while recording, hers while she says it back, a talking rhythm for her own lines
      let lvl = 0;
      const an = G.state === 'rec' ? G.micAn : G.state === 'say' && !G.tts ? G.an : null;
      if (an) { an.getFloatTimeDomainData(G.abuf); let r = 0; for (let i = 0; i < G.abuf.length; i++) r += G.abuf[i] * G.abuf[i]; lvl = Math.min(1, Math.sqrt(r / G.abuf.length) * 7); }
      if (G.state === 'say' && G.tts) lvl = G.sayT < G.sayLen ? 0.35 + 0.35 * Math.abs(Math.sin(G.t * 11)) : 0;
      if (G.talkT > 0 && G.state !== 'rec' && G.state !== 'say') { G.talkT -= dt; lvl = Math.max(lvl, 0.3 + 0.35 * Math.abs(Math.sin(G.t * 10)) * (0.6 + 0.4 * Math.sin(G.t * 2.7))); }
      if (G.bot && G.state === 'say') lvl = 0.5 + 0.5 * Math.sin(G.t * 12);
      G.open += ((lvl > 0.06 ? Math.min(1, lvl * 1.4) : 0) - G.open) * Math.min(1, dt * 20); u.uJaw.value = G.open;
      G.talk += (lvl - G.talk) * Math.min(1, dt * 3); u.uFlow.value = G.talk * 1.2 + G.burst;
      // eyes: open, close, blink, look around
      G.eyes += (G.eyesTo - G.eyes) * Math.min(1, dt * 3);
      G.nextBlink -= dt; if (G.nextBlink <= 0) { G.blinkT = 0; G.nextBlink = 2.5 + Math.random() * 3.5; }
      if (G.blinkT !== undefined) { G.blinkT += dt; const b = G.blinkT / 0.18; G.blink = b < 1 ? Math.sin(b * Math.PI) : 0; if (b >= 1) G.blinkT = undefined; }
      const o = G.eyes * (1 - G.blink); u.uOpenL.value = o; u.uOpenR.value = o;
      if (Math.random() < dt * 0.4 && G.state !== 'say') G.look = [Math.random() * 1.4 - 0.7, Math.random() * 0.6 - 0.1];
      G.lookNow[0] += (G.look[0] - G.lookNow[0]) * Math.min(1, dt * 6); G.lookNow[1] += (G.look[1] - G.lookNow[1]) * Math.min(1, dt * 6);
      u.uLook.value.set(G.lookNow[0], G.lookNow[1]);
      G.burst += (G.burstTo - G.burst) * Math.min(1, dt * 2); u.uBurst.value = G.burst;
      if (G.state === 'rec') { G.recT += dt; if (G.recT >= MAX_REC) stopRec(); }
      if (G.state === 'say') {
        G.sayT += dt;
        if (G.words) { const w = G.words.split(/\s+/), n = Math.max(1, Math.ceil(w.length * Math.min(1, G.sayT / Math.max(0.5, G.sayLen * 0.92)))); caption(w.slice(0, n).join(' ')); }
        if (!G.tts && G.sayT > G.sayLen + 0.4) endSay();
        if (G.tts && G.sayT > G.sayLen + 4) endSay();
      }
      // the robot: says an idea each round, then paints it
      if (G.bot) {
        G.botT += dt;
        if (G.state === 'ready' && G.botT > 1) { G.botT = 0; G.words = ['A field of sunflowers at night', 'My grandma dancing in the kitchen', 'The ocean, from inside a wave'][G.idea]; G.buf = G.ac.createBuffer(1, G.ac.sampleRate * 2, G.ac.sampleRate); sayBack(); }
        if (G.state === 'heard' && G.botT > 0.8) { G.botT = 0; paint(); }
        if (G.state !== 'ready' && G.state !== 'heard') G.botT = 0;
      }
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down') return;
      // tap her face: she opens her eyes and looks where you touched
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      G.eyesTo = G.state === 'paint' ? 0 : 1; G.look = [Math.max(-1, Math.min(1, (p.u - 0.43) / 0.25)), Math.max(-1, Math.min(1, (p.v - 0.44) / 0.2))];
    },
    pause() { if (G) { G.paused = true; try { G.src && G.src.stop(); } catch (e) {} } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'flow', playing: G.playing, over: G.over, state: G.state, idea: G.idea, eyes: +G.eyes.toFixed(2), jaw: +G.open.toFixed(2), words: G.words, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { try { G.rec && G.rec.state !== 'inactive' && G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} try { G.src && G.src.stop(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {}
        if (G.stream) G.stream.getTracks().forEach(t => t.stop()); G.capEl && G.capEl.remove(); G.box && G.box.remove(); try { G.an.disconnect(); } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
