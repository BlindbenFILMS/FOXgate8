// ALMOST BLINDNESS · "Yesterday I Saw It": a mini game inside Ben Fox's painting.
//   "You wake up one day; you saw yesterday the thing that you're going to trip over this morning." — Ben Fox
// Press Play: the painted figure steps onto a bridge of light that runs into the painting, and becomes yours to walk
// toward the light. Each morning you get a few seconds of clear sight to memorise where the wet floor signs are, then
// your sight closes into a tunnel around you. Hold and drag anywhere (or use the arrow keys) to walk: up is forward.
// Tap the cane to hear what's ahead: each sign answers from its own side, sooner when it's close. Bump into one and
// you'll feel it. Five mornings, each with a smaller tunnel and a shorter look. Then Ben tells his story.
// Playable by ear: Ben's own recorded voice tells you what's happening, the light chimes from where it is, the cane
// echoes, and every bump and step has a sound.
//
// Art and specs: Claude Design (media/games/almost-blindness/: bridge, mist, wet floor signs, Ben's voice lines).
// Every picture has a drawn-in-code fallback, and every recorded line falls back to the phone's speech.
// Robot mode (&bot=1): the game plays itself to the finale, through the same keys and cane a player uses.
//
// Game API (see lib/minigames/index.js): start(ctx) · update(dt) · pointer(kind, event) · pause() · resume() · stop() · over · debug
import * as THREE from 'three';
import * as K from './kit.js';

const DIR = 'media/games/almost-blindness/';
const EMPTY = 'media/games/almost-blindness-empty.jpg';       // the painting without its figure
const FIGURE = 'media/games/almost-blindness-figure.png';     // the painting's own figure (210 × 414)
const BRIDGE = DIR + 'bridge.png', MIST = DIR + 'mist.png';
const SIGN = i => DIR + 'obstacle-' + i + '.png';             // nine wet floor signs, 256 × 256
const VDIR = DIR + 'voice/';

/* ── Design's bridge, in 1024 × 1024 painting pixels ──
   depth t runs from 0 (the far end, at the light) to 1 (the bottom edge); u runs across the path (±1 = its edges). */
const VX = 512, VY = 610;
const P = (t, u) => ({ x: VX + u * (35 + 477 * t) * 0.5, y: VY + 414 * t, s: (35 + 215 * t) / 250 });
const START_T = 0.93, FINISH_T = 0.045, U_MAX = 1.7;
const SIGHT = [5, 4.5, 4, 3.5, 3];                      // seconds of clear sight each morning
const TUN = [230, 200, 170, 145, 120];                  // tunnel radius: TUN·s + 40 px
const SIGNS = [2, 2, 3, 3, 4];                          // wet floor signs each morning (Design: 2; a little more later on)
const FWD = 0.1, SIDE = 1.1;                            // walking speed: depth / s, across / s
const LIGHT_Y = 596;                                     // the glow at the far end of the bridge
const WORDS = ['one', 'two', 'three', 'four', 'five'];

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

/* Ben's recorded lines (Design's settings: playbackRate 0.96, pitch not preserved, and a warm, present voice chain).
   Decoded into buffers once; a line that can't load or decode falls back to the phone's speech. mp3 first, then ogg. */
const VRATE = 0.96;
const VBUF = new Map();                                 // id → AudioBuffer
let vLoad = null, vCount = 27, vChain = null, vChainAc = null;
function decode(a, ab) { return new Promise((res, rej) => { try { const p = a.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); } catch (e) { rej(e); } }); }
function fetchLine(a, file) {
  const get = url => fetch(url).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))).then(ab => decode(a, ab));
  return get(VDIR + 'mp3/' + file).catch(() => get(VDIR + 'ogg/' + file.replace(/\.mp3$/, '.ogg')));
}
function loadVoices() {
  const a = audio(); if (!a || vLoad) return vLoad;
  vLoad = fetch(VDIR + 'lines.json').then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
    .then(list => { vCount = list.length; return Promise.all(list.map(l => VBUF.has(l.id) ? null : fetchLine(a, l.file).then(b => { VBUF.set(l.id, b); }).catch(() => {}))); })
    .catch(() => {}).then(() => { if (VBUF.size < vCount) vLoad = null; return VBUF.size; });   // anything missing: try again next game
  return vLoad;
}
function voiceChain(a) {
  if (vChain && vChainAc === a) return vChain;
  const bq = (type, f, gain, q) => { const b = a.createBiquadFilter(); b.type = type; b.frequency.value = f; if (gain !== undefined) b.gain.value = gain; if (q !== undefined) b.Q.value = q; return b; };
  const hp = bq('highpass', 110), warm = bq('lowshelf', 180, 1.5), mud = bq('peaking', 380, -5, 1.1), pres = bq('peaking', 3200, 7, 0.8), air = bq('highshelf', 9000, 3.5);
  const comp = a.createDynamicsCompressor(); comp.threshold.value = -24; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.18; comp.knee.value = 8;
  const g = a.createGain(); g.gain.value = 1.35;
  hp.connect(warm).connect(mud).connect(pres).connect(air).connect(comp).connect(g).connect(a.destination);
  vChain = hp; vChainAc = a; return hp;
}

/* Design's music: lofi chords Am7–Fmaj7–Cmaj7–G6 (one every 4.2 s) on triangles through a 1.3 kHz lowpass, with wind
   and vinyl crackle. Master 0.4, dipping to half while Ben speaks. */
const MUSIC_VOL = 0.4;
let MUS = null;
function startMusic() {
  if (MUS) return; const a = audio(); if (!a) return; const t0 = a.currentTime;
  const master = a.createGain(); master.gain.setValueAtTime(0.0001, t0); master.gain.exponentialRampToValueAtTime(MUSIC_VOL, t0 + 1.5);
  const bus = a.createGain(); bus.connect(master).connect(a.destination);
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 0.4; lp.connect(bus);
  const buf = (sec, fn) => { const b = a.createBuffer(1, Math.floor(a.sampleRate * sec), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = fn(i); return b; };
  let last = 0; const brown = buf(6, () => { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; return last * 3.5; });
  const wind = a.createBufferSource(); wind.buffer = brown; wind.loop = true;
  const wf = a.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 0.7;
  const wg = a.createGain(); wg.gain.value = 0.95;
  const lfo = a.createOscillator(); lfo.frequency.value = 0.06; const lfoG = a.createGain(); lfoG.gain.value = 260; lfo.connect(lfoG).connect(wf.frequency);
  const lfo2 = a.createOscillator(); lfo2.frequency.value = 0.11; const lfo2G = a.createGain(); lfo2G.gain.value = 0.4; lfo2.connect(lfo2G).connect(wg.gain);
  wind.connect(wf).connect(wg).connect(bus); wind.start(); lfo.start(); lfo2.start();
  const crk = a.createBufferSource(); crk.buffer = buf(4, () => Math.random() < 0.0007 ? (Math.random() * 2 - 1) : 0); crk.loop = true;
  const ch = a.createBiquadFilter(); ch.type = 'highpass'; ch.frequency.value = 1800; const cg = a.createGain(); cg.gain.value = 0.25; crk.connect(ch).connect(cg).connect(bus); crk.start();
  const wob = a.createOscillator(); wob.frequency.value = 0.35; const wobG = a.createGain(); wobG.gain.value = 9; wob.start(); wob.connect(wobG);
  const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]], len = 4.2; let k = 0;
  const play = () => {
    const t = a.currentTime + 0.05;
    CH[k % 4].forEach((n, j) => {
      const f = 440 * Math.pow(2, (n - 69) / 12);
      [0, -7].forEach(det => {
        const o = a.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; wobG.connect(o.detune);
        const g = a.createGain(); g.gain.setValueAtTime(0.0001, t + j * 0.06); g.gain.exponentialRampToValueAtTime(0.05, t + j * 0.06 + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.6);
        o.connect(g).connect(lp); o.start(t + j * 0.06); o.stop(t + len + 0.7);
        o.onended = () => { try { wobG.disconnect(o.detune); } catch (e) {} };
      });
    });
    const b = a.createOscillator(); b.type = 'sine'; b.frequency.value = 440 * Math.pow(2, (CH[k % 4][0] - 12 - 69) / 12);
    const bg = a.createGain(); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.09, t + 0.08); bg.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.9);
    b.connect(bg).connect(lp); b.start(t); b.stop(t + len); k++;
  };
  play(); const iv = setInterval(play, len * 1000);
  MUS = { a, master, bus, iv, nodes: [wind, lfo, lfo2, crk, wob], ducked: false };
}
function musicLevel(v, tc = 0.4) { if (!MUS) return; const t = MUS.a.currentTime; MUS.master.gain.cancelScheduledValues(t); MUS.master.gain.setTargetAtTime(Math.max(0.0001, v), t, tc); }
function duckMusic(on) { if (!MUS || MUS.ducked === on) return; MUS.ducked = on; const t = MUS.a.currentTime; MUS.bus.gain.cancelScheduledValues(t); MUS.bus.gain.setTargetAtTime(on ? 0.5 : 1, t, on ? 0.08 : 0.6); }
function stopMusic() {
  const m = MUS; if (!m) return; MUS = null; clearInterval(m.iv);
  const t = m.a.currentTime; m.master.gain.cancelScheduledValues(t); m.master.gain.setTargetAtTime(0.0001, t, 0.4);
  setTimeout(() => { m.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { m.master.disconnect(); } catch (e) {} }, 2500);
}

/* ── pictures: Design's art, each with a drawn-in-code fallback ── */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const ART = new Map();                                  // url → { tex, fail, cbs }  (kept between games)
function art(url) {
  let r = ART.get(url);
  if (!r || (r.fail && !r.cbs.length)) {                // not tried yet, or failed last game: (re)try
    r = { tex: null, fail: false, cbs: [] }; ART.set(url, r);
    new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; r.tex = t; const c = r.cbs; r.cbs = []; c.forEach(f => f(t)); },
      undefined, () => { r.fail = true; const c = r.cbs; r.cbs = []; c.forEach(f => f(null)); });
  }
  return r;
}
const settled = url => { const r = ART.get(url); return !!(r && (r.tex || r.fail)); };
// put a picture on a material (or a shader uniform): Design's art when it has loaded, the fallback until then / if it fails
function skin(url, fallback, set) { const r = art(url); if (r.tex) { set(r.tex); return; } set(fallback); if (!r.fail) r.cbs.push(t => { if (t) set(t); }); }
// art with no fallback (the layer simply stays off if it can't load)
function whenArt(url, set) { const r = art(url); if (r.tex) set(r.tex); else if (!r.fail) r.cbs.push(t => { if (t) set(t); }); }
let FB = null;                                          // fallbacks, drawn once
function fallbacks() {
  if (FB) return FB;
  FB = {
    bridge: canvasTex(512, 512, (g) => {                  // a path of light running into the painting
      const s = 0.5; g.beginPath(); g.moveTo((VX - 22) * s, VY * s); g.lineTo((VX + 22) * s, VY * s); g.lineTo(1024 * s, 1024 * s); g.lineTo(0, 1024 * s); g.closePath();
      const lg = g.createLinearGradient(0, VY * s, 0, 512); lg.addColorStop(0, 'rgba(255,240,200,.95)'); lg.addColorStop(0.35, 'rgba(240,130,50,.85)'); lg.addColorStop(1, 'rgba(50,95,110,.9)');
      g.fillStyle = lg; g.fill();
    }),
    sign: canvasTex(256, 256, (g) => {                    // a yellow wet floor sign
      g.beginPath(); g.moveTo(98, 40); g.lineTo(158, 40); g.lineTo(200, 248); g.lineTo(56, 248); g.closePath();
      g.fillStyle = '#e8b820'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#2a2008'; g.stroke();
      g.beginPath(); g.moveTo(128, 92); g.lineTo(158, 146); g.lineTo(98, 146); g.closePath(); g.lineWidth = 6; g.stroke();
      g.fillStyle = '#1a1406'; g.font = '900 30px Archivo, Arial Black, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('WET', 128, 186); g.fillText('FLOOR', 128, 218);
    }),
    figure: canvasTex(210, 414, (g) => {                  // a dark silhouette, seen from behind
      g.fillStyle = '#16232c'; g.beginPath(); g.arc(105, 46, 28, 0, Math.PI * 2); g.fill();
      g.fillRect(64, 80, 82, 150); g.fillRect(40, 86, 22, 130); g.fillRect(148, 86, 22, 130); g.fillRect(68, 226, 32, 186); g.fillRect(110, 226, 32, 186);
    }),
  };
  return FB;
}
const ringTex = canvasTex(160, 160, (g) => { g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); g.arc(80, 80, 68, 0, Math.PI * 2); g.stroke(); });
const glowTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,240,200,.55)'); r.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });

const VERT = 'varying vec2 vP; varying vec2 vUv; void main(){ vP = position.xy; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
/* the tunnel: dark swirling paint closing in around the walker, with a warm rim like the painting */
function tunnelMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uC: { value: new THREE.Vector2() }, uR: { value: 0.3 }, uFade: { value: 0 }, uT: { value: 0 } },
    vertexShader: VERT,
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
/* Design's mist turning slowly around you in the dark, outside your sight (screen-like blend) */
function swirlMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { map: { value: null }, uC: { value: new THREE.Vector2() }, uR: { value: 0.3 }, uA: { value: 0 }, uOp: { value: 0 } },
    vertexShader: VERT,
    fragmentShader: `
      varying vec2 vP; uniform sampler2D map; uniform vec2 uC; uniform float uR, uA, uOp;
      void main(){
        vec2 d = vP - uC; float c = cos(uA), s = sin(uA);
        vec2 uv = vec2(c * d.x - s * d.y, s * d.x + c * d.y) / 1.39 + 0.5;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
        vec4 m = texture2D(map, uv);
        gl_FragColor = vec4(m.rgb, m.a * smoothstep(uR * 1.1, uR * 1.9, length(d)) * uOp);
        #include <colorspace_fragment>
      }`,
  });
}
/* a wet floor sign as the cane hears it: a white outline in the dark (uMix 0), or itself, lit up by a bump (uMix 1) */
function echoMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { map: { value: null }, uMix: { value: 0 }, uOp: { value: 0 } },
    vertexShader: VERT,
    fragmentShader: `
      varying vec2 vUv; uniform sampler2D map; uniform float uMix, uOp;
      void main(){
        vec4 c = texture2D(map, vUv);
        gl_FragColor = vec4(mix(vec3(1.0), min(vec3(1.0), c.rgb * 1.5), uMix), c.a * uOp);
        #include <colorspace_fragment>
      }`,
  });
}
const unit = new THREE.PlaneGeometry(1, 1);

export function almostBlindnessGame() {
  let G = null;
  let bestBruises = (() => { try { const v = localStorage.getItem('almost-blindness-best'); return v === null ? null : +v; } catch (e) { return null; } })();

  /* painting pixels → board (the painting is 1 wide, h tall, centred, y up) */
  const bx = X => X / 1024 - 0.5, by = Y => (0.5 - Y / 1024) * G.h, bs = px => px / 1024;

  /* small screen pieces: score under the eye button, a big banner, a red bump flash, and the cane button */
  function el(id, css) { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; e.setAttribute('aria-hidden', 'true'); e.style.cssText = css; document.body.appendChild(e); } return e; }
  const hud = () => el('mgHud', 'position:fixed;left:calc(10px + env(safe-area-inset-left));top:calc(68px + env(safe-area-inset-top));z-index:11;background:#000;color:#fff;padding:8px 14px 7px;border-bottom:4px solid #ec3013;font:900 18px/1.15 Archivo,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;max-width:72vw');
  function setHud(text, pips) {
    const key = text + '|' + pips; if (G.hudKey === key) return; G.hudKey = key;
    const e = hud(); e.style.display = 'block'; e.textContent = text;
    if (pips !== undefined) {                            // Design's bruise pips: three squares, red for each bruise this morning
      const row = document.createElement('span'); row.style.cssText = 'display:inline-flex;gap:5px;margin-left:10px;vertical-align:-1px';
      for (let i = 0; i < 3; i++) { const p = document.createElement('i'); p.style.cssText = 'display:inline-block;width:14px;height:14px;box-sizing:border-box;' + (i < pips ? 'background:#ec3013' : 'border:2px solid #fff'); row.appendChild(p); }
      e.appendChild(row);
    }
  }
  function big(text, sub, secs, timer) {
    // high on the screen, so it never hides the room you're trying to memorise
    const e = el('abBig', 'position:fixed;left:0;right:0;top:calc(150px + env(safe-area-inset-top));z-index:11;display:flex;justify-content:center;pointer-events:none');
    e.innerHTML = '<div style="background:rgba(0,0,0,.86);color:#fff;padding:10px 18px 9px;border-bottom:5px solid #ec3013;text-align:center;max-width:90vw;font:900 clamp(22px,7vw,40px)/1.02 Archivo,Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em"></div>';
    e.firstChild.textContent = text;
    if (sub) { const s = document.createElement('small'); s.style.cssText = 'display:block;font:700 15px/1.35 Atkinson Hyperlegible,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#d8d4cf;margin-top:6px'; s.textContent = sub; e.firstChild.appendChild(s); }
    G.timerBar = null;
    if (timer) {                                          // Design's look timer: a white bar that runs down
      const b = document.createElement('div'); b.style.cssText = 'height:6px;background:#333;margin:8px 0 2px';
      b.innerHTML = '<div style="height:100%;width:100%;background:#fff"></div>'; e.firstChild.appendChild(b); G.timerBar = b.firstChild;
    }
    e.style.display = 'flex'; G.bigT = secs || 0;
  }
  const hideBig = () => { const e = document.getElementById('abBig'); if (e) e.style.display = 'none'; if (G) G.timerBar = null; };
  const flashEl = () => el('abFlash', 'position:fixed;inset:0;z-index:9;pointer-events:none;box-shadow:inset 0 0 0 10px #ec3013,inset 0 0 90px rgba(236,48,19,.55);display:none');
  function caneButton(show) {
    let b = document.getElementById('mgCane');
    if (!b && show) {
      b = document.createElement('button'); b.id = 'mgCane'; b.type = 'button'; b.setAttribute('aria-label', 'Tap the cane: hear what is ahead of you');
      b.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 21 17 5"/><path d="M17 5c1-1.6 3.4-1 3 1"/><path d="M7.6 18.7 9 16.7" stroke="#ec3013" stroke-width="3"/></svg><span>CANE</span>';
      b.style.cssText = 'position:fixed;right:calc(14px + env(safe-area-inset-right));bottom:calc(24px + env(safe-area-inset-bottom));z-index:12;width:92px;height:92px;border-radius:50%;box-sizing:border-box;padding:0;' +
        'background:#000;color:#fff;border:5px solid #ec3013;box-shadow:0 0 0 3px #fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:900 15px/1 Archivo,Arial,sans-serif;letter-spacing:.06em;cursor:pointer';
      b.onclick = () => cane(); document.body.appendChild(b);
    }
    if (b) b.style.display = show ? 'flex' : 'none';
  }

  /* ── Ben's voice: play his recorded lines instead of the phone's speech for the same words ── */
  function hush() { const V = G && G.V; if (!V) return; for (const s of V.srcs) { try { s.stop(); } catch (e) {} } V.srcs = []; V.end = 0; V.then = null; }
  // ids: recorded lines to play in a row; text: what they say (spoken by the phone instead if any line is missing).
  // queue: play after whatever is playing now. then: called once they've finished. Returns seconds until done.
  function voice(ids, text, { queue = false, then = null } = {}) {
    const V = G.V, a = audio(), bufs = ids.map(id => VBUF.get(id));
    if (!queue) hush();
    if (!a || a.state !== 'running' || bufs.some(b => !b)) {
      G.say(text); V.spoken++;
      const dur = 0.6 + text.length * 0.068; V.end = 0; V.then = then; V.thenAt = G.t + dur; return dur;
    }
    G.say('');                                            // stop the phone's speech: Ben is talking
    let t = Math.max(a.currentTime + 0.03, V.end || 0);
    for (const b of bufs) {
      const s = a.createBufferSource(); s.buffer = b; s.playbackRate.value = VRATE; s.connect(voiceChain(a)); s.start(t);
      V.srcs.push(s); s.onended = () => { const i = V.srcs.indexOf(s); if (i >= 0) V.srcs.splice(i, 1); };
      t += b.duration / VRATE; V.played++;
    }
    V.end = t; V.then = then; V.thenAt = 0;
    return t - a.currentTime;
  }
  const talking = () => !!(G && !window.__muted && G.V.end && ac && ac.currentTime < G.V.end);   // muted: the page pauses all sound, so don't wait on a line

  /* ── a morning ── */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function layout(day) {                                 // Design: signs spread along the bridge, alternating sides
    const r = rng(G.seed + day * 7919), n = SIGNS[day];
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [r(), i]).sort((p, q) => p[0] - q[0]).map(p => p[1]).slice(0, n);
    let side = r() < 0.5 ? -1 : 1;
    return ids.map((id, i) => { const t = 0.14 + 0.7 * (i + 0.5) / n + (r() - 0.5) * 0.05, u = side * (0.3 + r() * 0.9); side = -side; return { id, t, u }; });
  }
  function clearSigns() { for (const o of G.signs) { G.root.remove(o.m); G.root.remove(o.echo); G.root.remove(o.ring); o.m.material.dispose(); o.echo.material.dispose(); o.ring.material.dispose(); } G.signs = []; }
  function buildSigns() {
    clearSigns(); const fb = fallbacks();
    for (const L of G.layout) {
      const p = P(L.t, L.u), size = 210 * p.s, cx = bx(p.x), cy = by(p.y - size * 0.47);   // Design: top = y − 0.97·size
      const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
      skin(SIGN(L.id), fb.sign, t => { mat.map = t; mat.needsUpdate = true; });
      const m = new THREE.Mesh(unit, mat); m.scale.set(bs(size), bs(size) * G.h, 1); m.position.set(cx, cy, 0.012); m.renderOrder = 10 + L.t; G.root.add(m);
      const em = echoMaterial(); skin(SIGN(L.id), fb.sign, t => { em.uniforms.map.value = t; });
      const echo = new THREE.Mesh(unit, em); echo.scale.copy(m.scale); echo.position.set(cx, cy, 0.045); echo.renderOrder = 30; G.root.add(echo);
      const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0 }));
      ring.position.set(cx, by(p.y - size * 0.42), 0.046); ring.renderOrder = 31; G.root.add(ring);
      G.signs.push({ ...L, x: p.x, s: p.s, size, m, echo, ring, a: 0, mix: 0, ra: 0, cool: 0, known: false });
    }
  }
  function newMorning(again) {
    if (!again) G.layout = layout(G.day);                 // a rough morning is tried again in the same room
    buildSigns();
    G.d = START_T; G.u = 0; G.bruises = 0; G.phase = 'look'; G.lookT = SIGHT[G.day]; G.fadeTo = 0; G.figA = 1; G.walkDir = null; G.owT = 0; G.rough = false; G.retryT = 0; G.nextT = 0; G.endT = 0;
    if (again) G.retries++;
    const n = G.day + 1;
    setHud('Morning ' + n + ' of ' + SIGHT.length);
    big('Morning ' + n, again ? 'Try this morning again. Look around. Remember where everything is.' : 'Look around. Remember where everything is.', SIGHT[G.day] + 0.2, true);
    voice(['morning_' + n + '_intro'], 'Morning ' + WORDS[G.day] + '. Look around. Remember where everything is.');
    [523, 659, 784].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.12, delay: i * 0.14 }));
    caneButton(false);
  }
  function lightsFade() {
    G.phase = 'walk'; G.fadeTo = 1; G.caneCD = 0;
    big('Your sight closes in', 'Hold and drag to walk to the light. Tap the cane to listen.', 3);
    voice(['sight_closes_in'], 'Your sight closes in. Hold and drag to walk to the light. Tap the cane to listen.', { queue: true });   // never cut Ben off mid-line
    noise(1.4, { vol: 0.25, freq: 220, q: 0.6 }); tone(330, 1.4, { type: 'sine', vol: 0.1, slide: -180 });
    caneButton(true); G.buzz(60);
  }
  function reachLight() {
    G.phase = 'done'; G.walkDir = null; G.fadeTo = 0; caneButton(false); G.mornings++;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, { type: 'triangle', vol: 0.16, delay: i * 0.1 }));
    G.buzz([40, 40, 40, 40, 120]);
    const n = G.day + 1;
    const ouch = G.bruises === 0 ? 'Not a single bruise!' : G.bruises === 1 ? 'One stubbed toe.' : G.bruises + ' bruises.';
    if (G.day < SIGHT.length - 1) {
      big('Morning ' + n + ' done', ouch + ' Tomorrow your sight is smaller.', 3.6);
      const dur = voice(['morning_' + n + '_done'], 'Morning ' + WORDS[G.day] + ' done. ' + ouch + ' Tomorrow your sight is smaller.');
      G.nextT = Math.max(3.6, dur + 0.6);
    } else {
      big('Morning ' + n + ' done', ouch + ' The week is over.', 2.6);
      const dur = voice(['morning_5_done'], 'Morning five done.');
      G.endT = Math.max(2.4, dur + 0.5);
    }
  }
  function finale() {
    G.phase = 'over'; G.walkDir = null; G.keys = {}; caneButton(false); hideBig();
    const w = G.total, rec = bestBruises === null || w < bestBruises;
    if (rec) { bestBruises = w; try { localStorage.setItem('almost-blindness-best', String(w)); } catch (e) {} }
    for (const id of ['mgHud', 'abFlash']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
    // the painting's own animation fades in over the game, with the end panel (Play again is the Stop button's other face)
    K.finale(G, {
      kicker: 'Five mornings done', title: 'This is almost blindness',
      cells: [{ k: 'Bruises this week', v: String(w) }, { k: 'Mornings', v: SIGHT.length + ' of ' + SIGHT.length }],
      best: rec, line: 'You wake up one day; you saw yesterday the thing that you’re going to trip over this morning. — Ben Fox',
      say: ' ',                                           // Ben says it himself, just below
    });
    const N = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    const said = 'This is almost blindness. ' + (w > 10 ? 'More than ten' : N[w]) + (w === 1 ? ' bruise' : ' bruises') + ' this week.' + (rec ? ' Best week yet!' : '');
    const ids = ['almost_blindness', w > 10 ? 'bruises_more_than_10' : 'bruises_' + w].concat(rec ? ['best_week_yet'] : []);
    const story = 'Press Ben’s story to hear it from him.';
    if (ids.every(id => VBUF.has(id)) && ac && ac.state === 'running') voice(ids, said, { then: () => { if (G && G.over) G.say(story); } });
    else voice(ids, said + ' ' + story);
  }
  function bump(o) {
    G.bruises++; G.total++; o.known = true; o.cool = 1.5; o.a = 1.8; o.mix = 1; o.ra = 0;
    noise(0.18, { vol: 0.45, freq: 160, q: 0.8 }); tone(180, 0.35, { type: 'sawtooth', vol: 0.12, slide: -90, delay: 0.05 });
    G.buzz([90, 40, 140]); G.flash = 0.5;
    G.d = Math.min(0.97, o.t + 0.07);                   // step back
    G.walkDir = null; G.phase = 'ow'; G.owT = 1.6; G.rough = G.bruises >= 3;
    big('Ow! A wet floor sign', 'You saw it yesterday.', 1.6);
    voice(['ow_wet_floor_sign'], 'Ow! A wet floor sign. You saw it yesterday.');
  }
  function afterOw() {
    if (!G.rough) { G.phase = 'walk'; return; }
    G.phase = 'done'; caneButton(false); G.fadeTo = 0;
    big('Rough morning', 'Three bruises. Take a breath and try this morning again.', 0);
    const dur = voice(['rough_morning_retry'], 'Rough morning. Three bruises. Try this morning again.', { queue: true });
    G.retryT = Math.max(1.8, dur + 0.5);
  }
  function cane() {
    if (!G || G.paused || (G.phase !== 'walk' && G.phase !== 'ow') || G.caneCD > 0) return;
    G.caneCD = 0.7; G.canes++;
    tone(1900, 0.05, { type: 'square', vol: 0.08 }); noise(0.05, { vol: 0.2, freq: 3000 });           // the tip taps the floor
    G.buzz(15);
    const me = P(G.d, G.u); let near = null, nd = 9;
    for (const o of G.signs) {
      const d = G.d - o.t; if (d <= -0.06 || d >= 0.32) continue;                                       // Design: up to 0.32 ahead
      if (o.a < 1.4) { o.a = 1.4; o.mix = 0; }                                                          // a white outline in the dark…
      o.ra = 1;                                                                                          // …and a ring
      const dist = Math.hypot(d, (o.u - G.u) * 0.3), pan = Math.max(-1, Math.min(1, (o.u - G.u) * 1.2));
      tone(Math.max(260, 900 - dist * 1200), 0.18, { type: 'triangle', vol: 0.22, pan, delay: 0.08 + dist * 1.1 });   // each echo: panned by side, later when farther
      if (Math.abs(d) < nd) { nd = Math.abs(d); near = o; }
    }
    if (near) {
      const d = G.d - near.t, dx = near.x - me.x, side = Math.abs(dx) < 105 * near.s * 0.6 ? '' : dx < 0 ? ' to your left' : ' to your right';
      const where = d > 0.03 ? 'ahead' : d < -0.03 ? 'behind you' : 'beside you';
      G.say('Wet floor sign, ' + (d < 0.08 && d > -0.03 ? 'right ' : '') + where + side);
      setTimeout(() => G && G.buzz(nd < 0.08 ? [40, 30, 40] : 30), 80 + nd * 1100);
    } else { tone(520, 0.25, { vol: 0.08, delay: 0.15 }); G.say('Clear'); }
  }

  /* ── input: drag anywhere (the way you drag on the painting is the way you walk: up is forward), arrow keys, space or C = cane ── */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hit = new THREE.Vector3(), inv = new THREE.Matrix4();
  function toBoard(x, y) {
    const r = G.renderer.domElement.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, G.camera);
    G.root.updateWorldMatrix(true, false);
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).transformDirection(G.root.matrixWorld), new THREE.Vector3().setFromMatrixPosition(G.root.matrixWorld));
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    inv.copy(G.root.matrixWorld).invert(); return hit.clone().applyMatrix4(inv);
  }
  const ARROWS = { ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1 };
  function onKey(ev) {
    if (!G || G.over || G.bot) return;
    const down = ev.type === 'keydown';
    if (ARROWS[ev.key]) { G.keys[ev.key] = down; ev.preventDefault(); return; }
    const inButton = ev.target && /^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(ev.target.tagName) && ev.target.id !== 'mgCane';
    if (down && !ev.repeat && (ev.key === 'c' || ev.key === 'C' || (ev.key === ' ' && !inButton))) { ev.preventDefault(); cane(); }
  }
  // the robot holds the same keys and taps the same cane a player does
  function robot(dt) {
    const B = G.botS || (G.botS = { caneT: 0.8, bumped: false });
    for (const k in ARROWS) G.keys[k] = false;
    if (G.phase !== 'walk') return;
    B.caneT -= dt; if (B.caneT <= 0) { B.caneT = 1.6; cane(); }
    if (G.bruises > 0) B.bumped = true;
    let target = 0, go = true;
    const ahead = G.signs.filter(o => o.t < G.d + 0.02 && G.d - o.t < 0.24).sort((p, q) => q.t - p.t)[0];
    if (ahead) {
      if (G.day === 0 && !B.bumped) target = ahead.u;                       // walk into the first sign once, to feel a bump
      else {
        target = Math.abs(G.u - ahead.u) < 0.95 ? Math.max(-1.6, Math.min(1.6, ahead.u + (ahead.u > 0 ? -1.05 : 1.05))) : G.u;
        if (Math.abs(G.u - target) > 0.08 && G.d - ahead.t < 0.1) go = false;   // stop and sidestep before it
      }
    }
    if (target - G.u > 0.05) G.keys.ArrowRight = true; else if (G.u - target > 0.05) G.keys.ArrowLeft = true;
    if (go) G.keys.ArrowUp = true;
  }

  return {
    title: 'Almost Blindness',
    start(ctx) {
      if (G) this.stop(); audio();
      const h = ctx.h, bot = ctx.bot ?? K.isBot();
      G = { ...ctx, h, bot, root: new THREE.Group(), ui: K.ui(), signs: [], layout: [], day: 0, total: 0, retries: 0, mornings: 0, canes: 0, t: 0, phase: 'intro', fade: 0, fadeTo: 0, tunnelR: 0.9,
        bigT: 0, flash: 0, stepT: 0, beaconT: 0, d: START_T, u: 0, walkDir: null, keys: {}, caneCD: 0, figA: 1, layerA: 0, introT: 0, over: false, playing: false, paused: false,
        seed: bot ? 17 : (Math.random() * 1e9) >>> 0, V: { srcs: [], end: 0, then: null, thenAt: 0, played: 0, spoken: 0 } };
      ctx.group.add(G.root);
      const fb = fallbacks();
      [EMPTY, FIGURE, BRIDGE, MIST, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(SIGN)].forEach(art);   // preload while the title shows
      loadVoices();
      startMusic();
      // layers, back to front: the empty painting, the bridge, the mist, signs + figure (by depth), the tunnel, the swirl, echoes
      const layer = (h1, z, order, opacity = 1) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, h1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        m.position.z = z; m.renderOrder = order; m.userData.base = opacity; m.visible = false; return m;
      };
      G.empty = layer(h, 0.004, 5); G.root.add(G.empty);
      whenArt(EMPTY, t => { if (!G) return; G.empty.material.map = t; G.empty.material.needsUpdate = true; G.empty.visible = true; });
      G.bridge = layer(h, 0.006, 6); G.root.add(G.bridge);                    // shown once the art is in (or the fallback, if it's late)
      skin(BRIDGE, fb.bridge, t => { if (!G) return; G.bridge.material.map = t; G.bridge.material.needsUpdate = true; });
      G.mistPivot = new THREE.Group(); G.mistPivot.position.set(bx(512), by(490), 0.008); G.root.add(G.mistPivot);   // Design: turns about (512, 490)
      G.mist = layer(h, 0, 7, 0.85); G.mist.position.set(-bx(512), -by(490), 0); G.mistPivot.add(G.mist);
      whenArt(MIST, t => { if (!G) return; G.mist.material.map = t; G.mist.material.needsUpdate = true; G.mist.visible = true; });
      G.tunnel = new THREE.Mesh(new THREE.PlaneGeometry(1.02, h * 1.02), tunnelMaterial()); G.tunnel.position.z = 0.02; G.tunnel.renderOrder = 20; G.root.add(G.tunnel);
      G.swirl = new THREE.Mesh(new THREE.PlaneGeometry(1, h), swirlMaterial()); G.swirl.position.z = 0.022; G.swirl.renderOrder = 21; G.swirl.visible = false; G.root.add(G.swirl);
      whenArt(MIST, t => { if (!G) return; G.swirl.material.uniforms.map.value = t; G.swirl.visible = true; });
      const figMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
      skin(FIGURE, fb.figure, t => { figMat.map = t; figMat.needsUpdate = true; });
      G.me = new THREE.Mesh(unit, figMat); G.me.renderOrder = 11; G.me.visible = false; G.root.add(G.me);
      G.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe2a8, transparent: true, depthWrite: false, opacity: 0.5 })); G.halo.renderOrder = 10; G.halo.visible = false; G.root.add(G.halo);
      G.light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff4d6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      G.light.position.set(bx(VX), by(LIGHT_Y), 0.04); G.light.renderOrder = 25; G.root.add(G.light);
      G.onKey = onKey; addEventListener('keydown', onKey); addEventListener('keyup', onKey);
      big('Yesterday I saw it', 'Five mornings. Look, remember, then walk to the light.', 0);
      G.say('Yesterday I saw it. Five mornings. Look, remember, then walk to the light.');
    },
    update(dt) {
      if (!G || G.paused) return;
      const n = G.bot && !G.over ? 3 : 1;                // the robot plays at triple speed (a test, not a show)
      for (let i = 0; i < n && G && !G.paused; i++) this.tick(dt);
    },
    tick(dt) {
      G.t += dt; G.tunnel.material.uniforms.uT.value = G.t; G.ui.update(dt); K.finaleUpdate(G, dt);
      if (G.bigT > 0) { G.bigT -= dt; if (G.bigT <= 0) hideBig(); }
      if (G.caneCD > 0) G.caneCD -= dt;
      const V = G.V;
      if (V.then && (V.thenAt ? G.t >= V.thenAt : !talking())) { const f = V.then; V.then = null; f(); }
      duckMusic(talking());
      if (G.bot && !G.over) robot(dt);

      // ── the story of a morning ──
      if (G.phase === 'intro') {
        G.introT += dt;                                    // let the title finish, and give the art and Ben's voice a moment (≤ ~3 s) to arrive
        const speaking = !G.bot && window.speechSynthesis && speechSynthesis.speaking;
        const ready = VBUF.size >= vCount && [EMPTY, BRIDGE, FIGURE].every(settled);
        if (G.introT >= (G.bot ? 0.8 : 1.6) && ((!speaking && ready) || G.introT > (G.bot ? 2.5 : 4.6))) { G.playing = true; newMorning(false); }
      } else if (G.phase === 'look') {
        G.lookT -= dt; if (G.timerBar) G.timerBar.style.width = Math.max(0, G.lookT / SIGHT[G.day] * 100) + '%';
        if (G.lookT <= 0) lightsFade();
      } else if (G.phase === 'ow') {
        G.owT -= dt; if (G.owT <= 0) afterOw();
      } else if (G.phase === 'done') {
        if (G.retryT > 0) { G.retryT -= dt; if (G.retryT <= 0) newMorning(true); }
        else if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) { G.day++; newMorning(false); } }
        else if (G.endT > 0) { G.endT -= dt; if (G.endT <= 0) finale(); }
      }

      // ── walking ──
      let moving = false;
      if (G.phase === 'walk') {
        let fx = 0, fy = 0;
        if (G.walkDir) { const [dx, dy, s] = G.walkDir; fx = dx * s * 1.4; fy = dy * s; }
        if (G.keys.ArrowUp) fy = 1; if (G.keys.ArrowDown) fy = -0.4; if (G.keys.ArrowLeft) fx = -1; if (G.keys.ArrowRight) fx = 1;
        fx = Math.max(-1, Math.min(1, fx)); fy = Math.max(-0.4, Math.min(1, fy));
        if (Math.abs(fx) > 0.02 || Math.abs(fy) > 0.02) {
          moving = true;
          G.d = Math.max(0, Math.min(0.97, G.d - fy * FWD * dt)); G.u = Math.max(-U_MAX, Math.min(U_MAX, G.u + fx * SIDE * dt));
          G.stepT -= dt * Math.max(Math.abs(fx), Math.abs(fy)); if (G.stepT <= 0) { G.stepT = 0.36; tone(90 + Math.random() * 20, 0.05, { type: 'triangle', vol: 0.07, pan: G.u * 0.25 }); }
        }
        const me = P(G.d, G.u).x;                         // Design: a bump is |Δt| < 0.03 and a horizontal gap under 105·s px
        for (const o of G.signs) if (o.cool <= 0 && Math.abs(G.d - o.t) < 0.03 && Math.abs(me - o.x) < 105 * o.s) { bump(o); break; }
        if (G.phase === 'walk' && G.d <= FINISH_T) reachLight();
      }
      for (const o of G.signs) if (o.cool > 0) o.cool -= dt;
      // the light chimes from where it is, faster as you get closer
      if (G.phase === 'walk') {
        G.beaconT -= dt;
        if (G.beaconT <= 0) { const pan = Math.max(-1, Math.min(1, (VX - P(G.d, G.u).x) / 120)); tone(988, 0.25, { vol: 0.07, pan }); tone(1319, 0.3, { vol: 0.05, pan, delay: 0.08 }); G.beaconT = 0.6 + G.d * 2.4; }
      }

      // ── pictures ──
      G.layerA = G.over ? Math.max(0, G.layerA - dt / 1.5) : Math.min(1, G.layerA + dt * 2);
      for (const m of [G.empty, G.bridge, G.mist]) m.material.opacity = m.userData.base * G.layerA;
      if (!G.bridge.visible && (settled(BRIDGE) || G.t > 2)) G.bridge.visible = true;   // the fallback only if the art is clearly late
      G.mistPivot.rotation.z = Math.sin(G.t * 0.12) * 4 * Math.PI / 180; G.mistPivot.scale.setScalar(1.03 + Math.sin(G.t * 0.2) * 0.02);
      const p = P(G.d, G.u), H = 330 * p.s, W = H * 210 / 414;   // Design: the figure is 330·s tall, feet on the bridge
      if (moving) G.walkT = (G.walkT || 0) + dt;
      const bob = moving ? Math.abs(Math.sin(G.walkT * 7.5)) * 6 * p.s : 0, sway = moving ? Math.sin(G.walkT * 7.5) * 1.5 * Math.PI / 180 : 0;
      if (G.phase === 'done' && !G.rough && G.d <= FINISH_T + 0.01) G.figA = Math.max(0, G.figA - dt);   // Ben walks into the light
      const figA = G.over ? G.layerA * G.figA : G.figA;
      G.me.visible = G.halo.visible = figA > 0.01 && G.phase !== 'intro';
      G.me.scale.set(bs(W), bs(H) * G.h, 1); G.me.position.set(bx(p.x), by(p.y - H / 2 - bob), 0.013); G.me.rotation.z = -sway; G.me.renderOrder = 10 + G.d + 0.0005;
      G.me.material.opacity = figA;
      G.halo.scale.setScalar(bs(H) * 0.75); G.halo.position.set(bx(p.x), by(p.y - H * 0.5), 0.0125); G.halo.renderOrder = 10 + G.d + 0.0004; G.halo.material.opacity = 0.45 * figA;
      G.light.scale.setScalar(0.15 + Math.sin(G.t * 2.2) * 0.018); G.light.material.opacity = G.over ? G.layerA : 1;
      // the tunnel closes to this morning's size, centred on you (Design: TUN·s + 40 px)
      const dark = G.phase === 'walk' || G.phase === 'ow', targetR = dark ? bs(TUN[Math.min(G.day, TUN.length - 1)] * p.s + 40) : 0.9;
      G.tunnelR += (targetR - G.tunnelR) * Math.min(1, dt * (dark ? 2.2 : 3));
      G.fade += ((G.over ? 0 : G.fadeTo) - G.fade) * Math.min(1, dt * 2);
      const cx = bx(p.x), cy = by(p.y - H * 0.45);
      const U = G.tunnel.material.uniforms; U.uC.value.set(cx, cy); U.uR.value = G.tunnelR; U.uFade.value = G.fade;
      const S = G.swirl.material.uniforms; S.uC.value.set(cx, cy); S.uR.value = G.tunnelR; S.uA.value = -G.t * 9 * Math.PI / 180;
      S.uOp.value = Math.max(0, Math.min(0.6, (1400 - G.tunnelR * 1024) / 1400)) * G.fade;
      // echoes: white outlines and a widening ring for the cane; the sign itself, lit up, for a bump
      for (const o of G.signs) {
        if (o.a > 0) o.a = Math.max(0, o.a - dt);
        o.echo.material.uniforms.uOp.value = Math.min(1, o.a) * (G.over ? G.layerA : 1); o.echo.material.uniforms.uMix.value = o.mix;
        if (o.ra > 0) o.ra = Math.max(0, o.ra - dt * 0.9);
        o.ring.material.opacity = o.ra; o.ring.scale.setScalar(bs(o.size * 0.8) * (1 + (1 - o.ra) * 0.8));
        o.ring.material.color.set(o.known ? 0xff6a4a : 0xffffff);
        o.m.material.opacity = G.over ? G.layerA : 1;
      }
      if (G.flash > 0) G.flash -= dt;
      flashEl().style.display = G.flash > 0 && !G.over ? 'block' : 'none';
      if (G.phase === 'walk' || G.phase === 'ow') setHud('Morning ' + (G.day + 1) + ' · ' + G.bruises + (G.bruises === 1 ? ' bruise' : ' bruises'), G.bruises);
    },
    pointer(kind, ev) {
      if (!G || G.paused) return;
      if (kind === 'down') { audio(); G.drag = { x: ev.clientX, y: ev.clientY, b: toBoard(ev.clientX, ev.clientY) }; return; }
      if (!G.drag) return;
      if (kind === 'up') { G.drag = null; G.walkDir = null; return; }
      const px = Math.hypot(ev.clientX - G.drag.x, ev.clientY - G.drag.y); if (px < 12) { G.walkDir = null; return; }
      const b = toBoard(ev.clientX, ev.clientY); if (!b || !G.drag.b) return;
      const dx = b.x - G.drag.b.x, dy = b.y - G.drag.b.y, d = Math.hypot(dx, dy) || 1;
      G.walkDir = [dx / d, dy / d, Math.min(1, px / 70)];
    },
    pause() { if (G) { G.paused = true; G.walkDir = null; G.drag = null; G.keys = {}; musicLevel(0.0001, 0.2); } },
    resume() { if (G) { G.paused = false; musicLevel(MUSIC_VOL, 0.4); } },
    get over() { return !!(G && G.over); },
    get debug() {
      return G && { engine: 'almost-blindness', secs: +G.t.toFixed(1), playing: !!G.playing && !G.over, over: !!G.over, phase: G.phase, morning: G.day + 1, mornings: G.mornings, depth: +G.d.toFixed(3), u: +G.u.toFixed(2),
        bruises: G.bruises, total: G.total, retries: G.retries, canes: G.canes, tunnelPx: Math.round(G.tunnelR * 1024),
        signs: G.signs.map(o => [o.id, +o.t.toFixed(2), +o.u.toFixed(2)]),
        voice: { loaded: VBUF.size, of: vCount, played: G.V.played, spoken: G.V.spoken, ctx: ac ? ac.state : 'none' },
        art: { loaded: [...ART.values()].filter(r => r.tex).length, failed: [...ART.entries()].filter(([, r]) => r.fail).map(([u]) => u.split('/').pop()) } };
    },
    cane: () => cane(),
    stop() {
      if (!G) return;
      hush(); stopMusic();
      removeEventListener('keydown', G.onKey); removeEventListener('keyup', G.onKey);
      clearSigns();
      for (const m of [G.empty, G.bridge, G.mist, G.tunnel, G.swirl, G.me]) if (m && m.material) m.material.dispose();
      for (const s of [G.halo, G.light]) if (s) s.material.dispose();
      K.cleanup(G);                                         // the finale's video, the root group, the end panel
      for (const id of ['mgHud', 'abBig', 'mgCane', 'abFlash']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
      G = null;
    },
  };
}
