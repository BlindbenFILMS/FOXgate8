// THE BRIDGE OF PERCEPTION (Bill McCann): PUPPET KARAOKE, "say it from the creek".
// Bill's face in the painting becomes a puppet. A prompt card asks something (first: Ben's question, "What would you say if
// you fell through a hole other people can easily see and avoid?"). Press Talk and say your answer: his mouth moves
// with your voice as you speak. Then he says it back, in the voice style you pick (normal, echoing under the bridge,
// gurgly from the water, deep or squeaky): his jaw drops with every word, his eyes blink and pop wide on loud bits,
// the creek ripples out from his chin and bubbles rise when it gets loud, and your words appear as captions.
// No microphone, or rather type? Press Type and he says your words in a computer voice.
// Everything stays on this phone: nothing is uploaded or saved.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const PROMPTS = [
  'What would you say if you fell through a hole other people can easily see and avoid?',
  'What would you shout up to the people on the bridge?',
  'Tell someone how they could actually help. Kindly.',
  'What’s the funniest thing you’ve ever walked into?',
  'What do you wish people could see about you?',
];
const STYLES = [
  { id: 'normal', label: 'Normal', say: 'normal voice' }, { id: 'bridge', label: 'Echo', say: 'echoing under the bridge' }, { id: 'gurgle', label: 'Gurgly', say: 'gurgly, through the water' },
  { id: 'deep', label: 'Deep', say: 'deep voice' }, { id: 'squeak', label: 'Squeaky', say: 'squeaky voice' },
];
const MAX_REC = 12;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting itself, with Bill's jaw, eyes and the creek moving (u, v from the top-left of the painting)
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uOpen, uBlink, uPop, uTalk, uT, uA, uH;
const vec2 M = vec2(0.497, 0.706);   // the mouth line
const vec2 J = vec2(0.497, 0.722), JR = vec2(0.062, 0.032);   // the lower lip and chin that drop
const vec2 E1 = vec2(0.415, 0.565), E2 = vec2(0.556, 0.562), ER = vec2(0.042, 0.022);
vec3 tex(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
float inHead(vec2 p){ return 1.0 - smoothstep(0.85, 1.0, length((p - vec2(0.5, 0.6)) / vec2(0.185, 0.14))); }
vec2 eye(vec2 s, vec2 p, vec2 E, inout float lid, inout vec2 skin){
  vec2 q = (p - E) / ER; float w = 1.0 - smoothstep(0.9, 1.25, length(q));
  s = mix(s, E + (s - E) / (1.0 + uPop * 0.22), w);                 // pop wide
  float line = -1.0 + 2.2 * uBlink;                                   // the eyelid comes down
  if (length(q) < 1.15 && q.y < line) { lid = 1.0; skin = E + vec2(q.x * ER.x, -1.45 * ER.y); }
  if (length(q) < 1.15 && abs(q.y - line) < 0.18 && uBlink > 0.05) lid = 2.0;
  return s;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the creek: always a gentle swell, and rings spreading from his chin while he talks
  float water = max(step(0.728, p.y), step(0.62, p.y) * (1.0 - inHead(p)));
  if (water > 0.5) {
    vec2 d = (p - vec2(0.497, 0.735)) * vec2(1.0, uH); float r = length(d);
    s += vec2(sin(p.y * 70.0 + uT * 1.6), cos(p.x * 55.0 + uT * 1.2)) * 0.0011;
    s += (d / max(r, 0.001)) * sin(r * 140.0 - uT * 9.0) * exp(-r * 6.0) * 0.0045 * uTalk;
  }
  // the jaw: the lower lip and chin drop with each word
  float dj = uOpen * 0.018, wj = 1.0 - smoothstep(0.6, 1.0, length((p - J) / JR)), below = smoothstep(M.y - 0.002, M.y + 0.003, p.y);
  s.y -= dj * wj * below;
  // eyes: blink and pop
  float lid = 0.0; vec2 skin = vec2(0.0);
  s = eye(s, p, E1, lid, skin); s = eye(s, p, E2, lid, skin);
  vec3 col = tex(s);
  if (lid > 1.5) col *= 0.45; else if (lid > 0.5) col = tex(skin);
  // inside the mouth when it's open
  // inside the mouth: a soft, shaded opening between the lips (darker in the middle, a hint of tongue low down)
  float mw = 0.043 * (0.8 + 0.2 * uOpen), my = M.y + dj * 0.5 + 0.001, mh = dj * 0.5 + 0.0035;   // covers the whole gap the jaw opens
  vec2 mq = vec2((p.x - M.x) / mw, (p.y - my) / mh); mq.y += mq.x * mq.x * 0.25;   // a gentle smile-shaped curve
  float me = length(mq);
  vec3 inside = mix(vec3(0.05, 0.015, 0.015), vec3(0.32, 0.08, 0.07), smoothstep(0.1, 1.0, me));
  inside = mix(inside, vec3(0.45, 0.14, 0.13), smoothstep(0.35, 0.95, mq.y) * 0.6 * step(me, 1.0));
  col = mix(col, inside, smoothstep(1.0, 0.72, me) * smoothstep(0.04, 0.15, uOpen));
  gl_FragColor = vec4(col, uA);
}`;

export function puppetKaraokeGame() {
  let G = null;

  // ── voice styles, applied when Bill says it back ──
  function impulse(ac, secs, decay) { const n = ac.sampleRate * secs, b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
  function playBuffer(buf, style) {
    const ac = G.ac, src = ac.createBufferSource(); src.buffer = buf;
    const out = ac.createGain(); out.gain.value = 1.4; out.connect(G.an); G.an.connect(ac.destination);
    if (style === 'deep') src.playbackRate.value = 0.78;
    if (style === 'squeak') src.playbackRate.value = 1.42;
    if (style === 'bridge') {   // a stone-and-wood echo under the bridge
      const cv = ac.createConvolver(), wet = ac.createGain(), dl = ac.createDelay(1), fb = ac.createGain();
      cv.buffer = impulse(ac, 1.8, 2.6); wet.gain.value = 0.55; dl.delayTime.value = 0.23; fb.gain.value = 0.32;
      src.connect(out); src.connect(cv).connect(wet).connect(out); src.connect(dl); dl.connect(fb).connect(dl); dl.connect(wet);
    } else if (style === 'gurgle') {   // talking through the water: a wobble and a muffle
      const dl = ac.createDelay(0.05), lfo = ac.createOscillator(), lg = ac.createGain(), lp = ac.createBiquadFilter();
      dl.delayTime.value = 0.012; lfo.frequency.value = 9; lg.gain.value = 0.006; lfo.connect(lg).connect(dl.delayTime); lfo.start();
      lp.type = 'lowpass'; lp.frequency.value = 1500; src.connect(dl).connect(lp).connect(out); src.onended = () => lfo.stop();
    } else src.connect(out);
    src.start(); G.src = src;
    return buf.duration / src.playbackRate.value;
  }

  // ── the screen: prompt, captions and buttons ──
  function caption(text) {
    if (!G.capEl) { G.capEl = document.createElement('div'); G.capEl.className = 'mgk'; G.capEl.setAttribute('aria-live', 'polite');
      Object.assign(G.capEl.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))',
        background: 'rgba(0,0,0,.82)', borderLeft: '6px solid #ec3013', padding: '10px 14px', font: '700 clamp(18px,5vw,24px)/1.3 "Atkinson Hyperlegible",Arial,sans-serif', textTransform: 'none', display: 'none' });
      document.body.appendChild(G.capEl); }
    G.capEl.textContent = text || ''; G.capEl.style.display = text ? 'block' : 'none';
  }
  function showPrompt() {
    const pr = PROMPTS[G.pi % PROMPTS.length];
    G.ui.banner('Say it', pr, 0, `Prompt ${G.pi % PROMPTS.length + 1} of ${PROMPTS.length}`); G.say(pr);
  }
  function buttons() {
    const B = [];
    if (G.state === 'rec') B.push({ label: 'Stop', icon: '■', kind: 'red', aria: 'Stop recording', press: () => stopRec() });
    else if (G.state === 'say') B.push({ label: 'Stop', icon: '■', kind: 'black', aria: 'Stop', press: () => endSay() });
    else {
      B.push({ label: 'Talk', icon: '🎤', kind: 'red', aria: 'Talk: record your answer', press: () => startRec() });
      if (G.buf) B.push({ label: 'Play', icon: '▶', aria: 'Hear Bill say it again', press: () => sayBack() });
      B.push({ label: G.buf ? STYLES[G.si].label : 'Type', icon: G.buf ? '♪' : '⌨', kind: 'black', aria: G.buf ? 'Voice: ' + STYLES[G.si].say + '. Press for the next voice' : 'Type instead of talking',
        press: () => { if (G.buf) { G.si = (G.si + 1) % STYLES.length; buttons(); sayBack(); } else typeIt(); } });
      B.push({ label: G.takes ? 'Next' : 'Shuffle', icon: '↻', aria: 'A new prompt', press: () => { G.pi++; G.buf = null; G.words = ''; caption(''); buttons(); showPrompt(); } });
      if (G.takes >= 1) B.push({ label: 'Done', icon: '✓', aria: 'Finish', press: () => finish() });
    }
    G.ui.buttons(B);
  }

  // ── talking: record your answer, his mouth moves live with your voice ──
  async function startRec() {
    if (G.state !== 'ready') return;
    try {
      if (!G.stream) G.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) { G.ui.alert('No microphone', 'Press Type to write it instead.', 2.4, 'blue'); G.say('The microphone is off. Press Type to write it instead.'); return; }
    if (!G.micAn) { G.micAn = G.ac.createAnalyser(); G.micAn.fftSize = 1024; G.micSrc = G.ac.createMediaStreamSource(G.stream); G.micSrc.connect(G.micAn); }   // keep hold of the source, or the browser may drop it
    G.chunks = []; G.rec = new MediaRecorder(G.stream); G.rec.ondataavailable = e => e.data.size && G.chunks.push(e.data);
    G.rec.onstop = async () => { try { const ab = await new Blob(G.chunks).arrayBuffer(); G.buf = await G.ac.decodeAudioData(ab); G.takes++; sayBack(); } catch (e) { G.state = 'ready'; buttons(); G.ui.alert('Didn’t catch that', 'Try Talk again.', 2, 'blue'); } };
    G.rec.start(); G.state = 'rec'; G.recT = 0; G.words = ''; caption('Listening…'); G.ui.hideBanner(); buttons(); G.buzz(30);
    // live captions, where the phone can do them
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { try { const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.continuous = true;
      r.onresult = e => { let t = ''; for (const x of e.results) t += x[0].transcript; G.words = t.trim(); if (G && G.state === 'rec') caption(G.words || 'Listening…'); };
      r.onerror = () => {}; r.start(); G.sr = r; } catch (e) { G.sr = null; } }
  }
  function stopRec() { if (G.state !== 'rec') return; G.state = 'wait'; try { G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} buttons(); }
  // Bill says it back
  function sayBack() {
    if (!G.buf || G.state === 'rec') return;
    try { G.src && G.src.stop(); } catch (e) {}
    G.state = 'say'; G.sayT = 0; G.sayLen = playBuffer(G.buf, STYLES[G.si].id); buttons();
    if (!G.words) caption('');
  }
  function endSay() { try { G.src && G.src.stop(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} G.state = 'ready'; G.tts = false; buttons(); if (G.words) caption(G.words); }
  // or type it, and he says it in a computer voice
  function typeIt() {
    if (!G.box) {
      G.box = document.createElement('form'); G.box.className = 'mgk';
      Object.assign(G.box.style, { left: 'calc(12px + env(safe-area-inset-left))', right: 'calc(12px + env(safe-area-inset-right))', bottom: 'calc(150px + env(safe-area-inset-bottom))', pointerEvents: 'auto', display: 'flex', gap: '8px' });
      G.box.innerHTML = '<input type="text" maxlength="160" aria-label="What should Bill say?" placeholder="Type what Bill should say…" style="flex:1;min-height:56px;padding:0 12px;border:3px solid #000;font:700 18px Atkinson Hyperlegible,Arial,sans-serif"><button type="submit" style="min-height:56px;padding:0 16px;border:3px solid #000;background:#ec3013;color:#fff;font:900 16px Archivo,Arial,sans-serif;text-transform:uppercase">Say it</button>';
      G.box.onsubmit = ev => { ev.preventDefault(); const v = G.box.querySelector('input').value.trim(); if (!v) return; G.box.style.display = 'none'; speakTyped(v); };
      document.body.appendChild(G.box);
    }
    G.box.style.display = 'flex'; const inp = G.box.querySelector('input'); inp.value = ''; inp.focus(); G.ui.hideBanner();
  }
  function speakTyped(text) {
    G.words = text; G.takes++; caption(text); G.state = 'say'; G.tts = true; G.sayT = 0; G.sayLen = Math.max(1.5, text.split(/\s+/).length * 0.42); buttons();
    try { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = STYLES[G.si].id === 'deep' ? 0.6 : STYLES[G.si].id === 'squeak' ? 1.7 : 1;
      u.onend = () => { if (G && G.tts) endSay(); }; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  }
  function finish() {
    G.state = 'done'; caption(''); if (G.box) G.box.style.display = 'none';
    K.finale(G, { won: true, kicker: 'Thanks for speaking up', title: 'Bill heard you', line: G.work && G.work.quote, cells: [{ k: 'Takes', v: G.takes }] });
  }

  return {
    title: 'Say it from the creek',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { ac: K.audio(), pi: 0, si: 1, state: 'intro', takes: 0, buf: null, words: '', open: 0, talk: 0, blink: 0, nextBlink: 2, pop: 0, bubbles: [], recT: 0, sayT: 0, sayLen: 0 });
      G.an = G.ac.createAnalyser(); G.an.fftSize = 1024; G.abuf = new Float32Array(G.an.fftSize);
      G.uni = { map: { value: null }, uOpen: { value: 0 }, uBlink: { value: 0 }, uPop: { value: 0 }, uTalk: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.bubTex = K.canvasTex(64, 64, (g) => { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 5; g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(24, 23, 6, 0, Math.PI * 2); g.fill(); });
      G.onGo = () => { G.state = 'ready'; buttons(); showPrompt(); };
      K.intro(G, { title: 'Say it from the creek', how: 'Bill fell through. Answer the prompt: press Talk and say it, and Bill says it back from the creek. Your voice stays on this phone.',
        say: 'Say it from the creek. Bill fell into the creek under the bridge. Answer the prompt: press Talk and say it out loud, then Bill says it back. Change his voice, or press Type to write it instead. Your voice stays on this phone.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t; G.uni.uA.value += ((G.over ? 0 : 1) - G.uni.uA.value) * Math.min(1, dt * 2);
      // how loud: your voice while recording, Bill's voice while he says it back
      let lvl = 0;
      const an = G.state === 'rec' ? G.micAn : G.state === 'say' && !G.tts ? G.an : null;
      if (an) { an.getFloatTimeDomainData(G.abuf); let r = 0; for (let i = 0; i < G.abuf.length; i++) r += G.abuf[i] * G.abuf[i]; lvl = Math.min(1, Math.sqrt(r / G.abuf.length) * 7); }
      if (G.state === 'say' && G.tts) lvl = 0.35 + 0.35 * Math.abs(Math.sin(G.t * 11)) * (0.6 + 0.4 * Math.sin(G.t * 3.1));   // typed: a talking rhythm
      if (G.bot && G.state === 'say') lvl = 0.5 + 0.5 * Math.sin(G.t * 12);
      G.open += ((lvl > 0.06 ? Math.min(1, lvl * 1.4) : 0) - G.open) * Math.min(1, dt * 22);
      G.talk += (lvl - G.talk) * Math.min(1, dt * 3);
      G.pop += ((lvl > 0.7 ? 1 : 0) - G.pop) * Math.min(1, dt * (lvl > 0.7 ? 14 : 3));
      // blinking
      G.nextBlink -= dt; if (G.nextBlink <= 0) { G.blinkT = 0; G.nextBlink = 2 + Math.random() * 3.5 + (Math.random() < 0.2 ? -1.6 : 0); }
      if (G.blinkT !== undefined) { G.blinkT += dt; const b = G.blinkT / 0.16; G.blink = b < 1 ? Math.sin(b * Math.PI) : 0; if (b >= 1) G.blinkT = undefined; }
      G.uni.uOpen.value = G.open; G.uni.uTalk.value = G.talk; G.uni.uPop.value = G.pop; G.uni.uBlink.value = G.blink;
      // bubbles rise from his chin when it gets loud
      if (lvl > 0.45 && Math.random() < dt * 12 * lvl) {
        // bubbles come up through the water around his chin and pop at the surface (not over his face)
        const side = Math.random() < 0.5 ? -1 : 1, [x, y] = G.S.P(0.497 + side * (0.045 + Math.random() * 0.06), 0.75 + Math.random() * 0.03);
        const s = K.sprite(G.bubTex, 0.008 + Math.random() * 0.012, { color: '#ffffff', order: 20, opacity: 0.85 });
        s.position.set(x, y, 0.05); G.root.add(s); G.bubbles.push({ s, vy: 0.012 + Math.random() * 0.02, vx: side * Math.random() * 0.012, life: 0.35 + Math.random() * 0.5 });
      }
      for (let i = G.bubbles.length - 1; i >= 0; i--) { const b = G.bubbles[i]; b.life -= dt; b.s.position.y += b.vy * dt; b.s.position.x += b.vx * dt + Math.sin(G.t * 9 + i) * 0.0004;
        if (b.life <= 0) { G.fx.add(b.s.position.x, b.s.position.y, '#ffffff', 3, 0.05); G.root.remove(b.s); b.s.material.dispose(); G.bubbles.splice(i, 1); } }
      if (G.state === 'rec') { G.recT += dt; if (G.recT >= MAX_REC) stopRec(); }
      if (G.state === 'say') {
        G.sayT += dt;
        // captions: the words appear as he says them
        if (G.words) { const w = G.words.split(/\s+/), n = Math.max(1, Math.ceil(w.length * Math.min(1, G.sayT / Math.max(0.5, G.sayLen * 0.92)))); caption(w.slice(0, n).join(' ')); }
        if (!G.tts && G.sayT > G.sayLen + 0.4) endSay();
        if (G.tts && G.sayT > G.sayLen + 4) endSay();   // in case the computer voice never says it's finished
      }
      // the robot: one take, then done
      if (G.bot && G.state === 'ready') { G.botN = (G.botN || 0) + 1; if (G.takes === 0) { G.words = 'I would say watch out for the hole!'; const b = G.ac.createBuffer(1, G.ac.sampleRate * 2, G.ac.sampleRate); G.buf = b; G.takes = 1; sayBack(); } else if (G.takes >= 1 && G.sayT > 0) finish(); }
    },
    pointer() {},
    pause() { if (G) { G.paused = true; try { G.src && G.src.stop(); } catch (e) {} } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'karaoke', playing: G.playing, over: G.over, state: G.state, takes: G.takes, style: STYLES[G.si].id, prompt: G.pi, open: +G.open.toFixed(2), words: G.words, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { try { G.rec && G.rec.state !== 'inactive' && G.rec.stop(); } catch (e) {} try { G.sr && G.sr.stop(); } catch (e) {} try { G.src && G.src.stop(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {}
        if (G.stream) G.stream.getTracks().forEach(t => t.stop()); G.capEl && G.capEl.remove(); G.box && G.box.remove(); try { G.an.disconnect(); } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
