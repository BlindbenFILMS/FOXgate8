// LIGHT ON THE OTHER SIDE (Anthony Ferraro): KEEP ROLLING, a skate run through the dark toward the light.
// "Giving up is just not an option, ever. So you have to keep going… there's always going to be light on the other side."
// Anthony (cut out of the painting) skates with his white cane down the road through the huge dark wave.
//  · THE CANE LIGHTS THE WAY: every tap of his cane sends a ripple of light along the road; things in the way glow when
//    a ripple reaches them, and light up bright when the cane HITS them (each has its own sound and its own buzz).
//  · JUMP when the cane hits something (tap anywhere or JUMP): he ollies over it. Miss, and he falls… and gets back up.
//    There is no game over.
//  · FLOW: three SMOOTH jumps in a row and he's in flow: he spins in the air, leaves a trail of light, the beat kicks in.
//  · DARK AND LIGHT, AGAIN AND AGAIN: twice a dark wave rolls over: the picture goes almost black and the music muffles,
//    so you play by the cane alone. Then the light breaks through: tap to catch the sparks of light.
//  · TWO IN A ROW: near the end, some things come in pairs: jump, land, jump again.
//  · ANTHONY'S OWN VOICE: at halfway ("giving up is just not an option ever, so you have to keep going"), when the dark
//    first comes ("it always keeps getting dark and light again"), after the first light moment ("the dark helps you
//    enjoy those light moments") and after the second fall ("so you have to keep going"). His whole statement at the end.
// Every thing he gets past sends a spark ahead: the light grows, the dark pulls back, the music turns from minor to major.
// Ten things, and he rolls right into the light.
// Art: media/games/roll/ clean.jpg (the painting with him painted out) and him cut out in three pieces so he can move:
// sk-body.png, sk-cane.png (sweeps side to side) and sk-leg.png (pushes off the road). Props: roll-things.js.
import * as THREE from 'three';
import * as K from './kit.js';
import { IDS, thingTex, sparkTex } from './roll-things.js';

const ART = new URL('../../media/games/roll/', import.meta.url).href;
const CLIP = new URL('../../../3D/gallery/audio/wing_0_1.mp3', import.meta.url).href;   // Anthony, in his own words (20.4 s)
// pieces of that recording (seconds), found by the pauses between his phrases
const BITS = {   // whole lines only: each starts and ends in the quiet between his sentences
  giveUp: [8.85, 13.50],     // "And it's like giving up is just not an option ever. So you have to keep going."
  keepGoing: [11.60, 13.50], // "So you have to keep going."
  darkLight: [13.75, 17.85], // "And I think it always keeps getting dark and light again."
  enjoy: [17.85, 20.40],     // "And it's like the dark helps you enjoy those light moments."
};
const BIT_TEXT = {   // the captions, word for word
  giveUp: 'And it’s like giving up is just not an option, ever. So you have to keep going.',
  keepGoing: 'So you have to keep going.',
  darkLight: 'And I think it always keeps getting dark and light again.',
  enjoy: 'And it’s like the dark helps you enjoy those light moments.',
};
const GOAL = 10;
const BOX = [0.4601, 0.5831, 0.5399, 0.7130];          // him, in the painting (u0, v0, u1, v1)
const FOOT = [0.50, 0.713], SK = 1.7;                   // his board; how much bigger he's drawn so he reads on a phone
const FAR = [0.20, 0.598], NEAR = [0.502, 0.716], PAST = [0.70, 0.77];   // the road: out of the light, under his board, behind him
const TIP = [0.44, 0.708];                              // where his cane touches the road
const SUN = [0.20, 0.43];                               // the burst of light
const CANE = 0.55;          // seconds between the cane hitting a thing and the thing reaching his board
const AIR = 0.72;           // how long an ollie stays up
const PAIR_GAP = 1.15;      // seconds between two things that come together
const DARK_AT = [3, 7];
// three lanes across the road: LEFT (toward us, lower on the screen), MIDDLE, RIGHT (away from us, higher up)
const LANE = [-0.366, 0.931], LANE_W = 0.08;    // the direction across the road (u, v) and the width of a lane up close
const laneAt = (x, k = 1) => [-LANE[0] * x * LANE_W * k, -LANE[1] * x * LANE_W * k];   // x: -1 left, 0 middle, 1 right     // a dark wave rolls over after this many things
const BUZZ = { crack: [30, 40, 30], curb: [180], puddle: [15, 20, 15, 20, 15, 20, 15], rock: [60, 40, 60], cone: [100, 50, 30] };
const SAY = {
  intro: 'Keep rolling. Anthony is skating through the dark, toward the light. Listen to his cane. When it hits something, jump! Or move left or right to go around it. If you fall, get back up and keep going.',
  how: 'Listen to the cane. When it hits something, tap to jump, or move left or right to go around it.',
};
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const lerp = (a, b, k) => a + (b - a) * k;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D clean;
uniform float uT, uA, uRun, uLight, uWhite, uDip, uNight;
uniform vec2 uSun;
vec3 at(vec2 p){ return texture2D(clean, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // the wave churns slowly around the tunnel (harder when a dark wave rolls over)
  vec2 c = vec2(0.36, 0.42), d = p - c; float r = length(d);
  float wave = smoothstep(0.62, 0.5, p.y);
  float ang = (sin(uT * 0.35 + r * 9.0) * (0.012 + uNight * 0.02) + 0.004 * sin(uT * 0.8)) * wave * smoothstep(0.08, 0.45, r);
  vec2 s = c + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d;
  // the road flows past under him: two copies sliding out of the light toward us, crossfaded
  float road = smoothstep(0.585, 0.65, p.y);
  vec2 dir = normalize(vec2(-0.93, -0.37));
  float ph = fract(uRun), ph2 = fract(uRun + 0.5);
  vec3 a1 = at(s + dir * ph * 0.06 * road), a2 = at(s + dir * ph2 * 0.06 * road);
  vec3 col = a1 * (1.0 - abs(2.0 * ph - 1.0)) + a2 * (1.0 - abs(2.0 * ph2 - 1.0));
  col = mix(at(s), col, road);
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  // the dark is heavy at first; the light pushes it back as he keeps going
  float sunD = length((p - uSun) * vec2(1.0, 1.2));
  float near = exp(-sunD * mix(5.5, 2.2, uLight));
  col *= mix(0.55, 1.0, max(uLight, near)) * (1.0 - uDip * 0.35);
  col = mix(col, col * 1.35 + vec3(0.10, 0.07, 0.02) * (1.0 - l), uLight * 0.55 * (1.0 - l));
  col += vec3(1.0, 0.78, 0.45) * near * (0.12 + 0.55 * uLight) * (0.9 + 0.1 * sin(uT * 2.1));
  // a dark wave rolls over everything
  col *= 1.0 - uNight * 0.9;
  // at the end, he rolls into the light
  col = mix(col, vec3(1.0, 0.95, 0.84), 0.85 * uWhite * (1.0 - smoothstep(0.0, 0.12 + uWhite * 1.1, sunD)));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── sound: the cane, the wheels, the things, and music that turns from dark to light ───────────────────────── */
function sounds(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; master.connect(comp).connect(ac.destination);
  // the music has its own bus, so a dark wave can muffle it (and Anthony's voice can duck it) without muffling the cane
  const musLp = ac.createBiquadFilter(); musLp.type = 'lowpass'; musLp.frequency.value = 16000;
  const musG = ac.createGain(); musG.gain.value = 1; musLp.connect(musG).connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest = master) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, p = 0, slide = 0, lp = 0, mus = false } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p, mus ? musLp : master)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.003, sweep = 0, mus = false } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p, mus ? musLp : master)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  const roll = (() => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'lowpass'; f.frequency.value = 420; g.gain.value = 0; s.connect(f).connect(g).connect(pan(0.1)); s.start(); return { g, f }; })();
  const now = () => ac.currentTime;
  const S = {
    light: 0, flow: false, timer: null, next: 0, beat: 0,
    cane(p) { const t = now(); tone(t, 2600, 0.035, { type: 'triangle', vol: 0.07, p }); noise(t, 0.03, { freq: 4200, q: 2, vol: 0.06, p }); },
    hit(id, p = -0.35, v = 1) {   // each thing has its own sound when the cane finds it (quieter, from that side, in another lane)
      const t = now(), N = (a, b, o) => noise(a, b, { ...o, vol: o.vol * v }), T = (a, b, c, o) => tone(a, b, c, { ...o, vol: o.vol * v });
      if (id === 'crack') { N(t, 0.09, { freq: 3000, q: 1.5, vol: 0.5, p }); T(t, 1500, 0.08, { type: 'square', vol: 0.12, p, slide: 900 }); N(t + 0.06, 0.12, { freq: 1200, q: 0.8, vol: 0.25, p }); }
      if (id === 'curb') { T(t, 330, 0.22, { type: 'triangle', vol: 0.45, p, slide: 260 }); N(t, 0.05, { freq: 900, q: 3, vol: 0.4, p }); }
      if (id === 'puddle') { N(t, 0.35, { freq: 1800, q: 0.7, vol: 0.45, p, sweep: 600 }); T(t + 0.02, 900, 0.15, { vol: 0.12, p, slide: 1500 }); T(t + 0.1, 1300, 0.12, { vol: 0.08, p, slide: 2100 }); }
      if (id === 'rock') { T(t, 620, 0.1, { type: 'square', vol: 0.18, p, lp: 2400 }); N(t, 0.08, { freq: 2200, q: 4, vol: 0.45, p }); T(t + 0.07, 520, 0.08, { type: 'square', vol: 0.1, p, lp: 2000 }); }
      if (id === 'cone') { T(t, 520, 0.25, { type: 'sine', vol: 0.4, p, slide: 300 }); N(t, 0.06, { freq: 700, q: 2, vol: 0.3, p }); }
    },
    scuff() { const t = now(); noise(t, 0.28, { freq: 900, q: 0.7, vol: 0.22, p: 0.25, sweep: 400 }); noise(t + 0.02, 0.1, { freq: 300, vol: 0.18, p: 0.25 }); },
    approach(p = -0.7) { noise(now(), 1.2, { freq: 200, q: 0.8, vol: 0.18, p, sweep: 900, att: 0.9 }); },
    lane(p) { const t = now(); noise(t, 0.22, { freq: 700, q: 0.8, vol: 0.3, p, sweep: 1800 }); tone(t, 330, 0.12, { type: 'triangle', vol: 0.05, p, slide: p < 0 ? 260 : 420 }); },
    edge(p) { const t = now(); tone(t, 140, 0.15, { type: 'square', vol: 0.1, p, lp: 600 }); },
    pop() { const t = now(); noise(t, 0.05, { freq: 2600, q: 2, vol: 0.5 }); tone(t, 200, 0.12, { vol: 0.35, slide: 90 }); },
    spin() { const t = now(); noise(t, 0.4, { freq: 1500, q: 1, vol: 0.25, sweep: 4000 }); [79, 83, 86].forEach((m, i) => tone(t + i * 0.05, midi(m), 0.3, { type: 'triangle', vol: 0.06 })); },
    land() { const t = now(); tone(t, 110, 0.16, { vol: 0.5, slide: 60 }); noise(t, 0.06, { freq: 600, vol: 0.35 }); tone(t + 0.05, 95, 0.12, { vol: 0.35, slide: 55 }); },
    fall() { const t = now(); noise(t, 0.6, { freq: 900, q: 0.6, vol: 0.4, sweep: 300 }); tone(t + 0.25, 80, 0.3, { vol: 0.6, slide: 45 }); noise(t + 0.25, 0.1, { freq: 400, vol: 0.4 }); },
    up() { const t = now(); [57, 62, 66, 69].forEach((m, i) => tone(t + i * 0.09, midi(m), 0.35, { type: 'triangle', vol: 0.1 })); },
    pass(n) { const t = now(); [74, 78, 81, 86].forEach((m, i) => tone(t + i * 0.07, midi(m + (n % 3)), 0.6, { type: 'triangle', vol: 0.09, p: -0.4 })); tone(t, midi(98), 1.2, { vol: 0.03, p: -0.6 }); },
    flowOn() { const t = now(); [74, 78, 81, 86, 90].forEach((m, i) => tone(t + i * 0.06, midi(m), 0.5, { type: 'sine', vol: 0.08 })); noise(t, 0.6, { freq: 5000, type: 'highpass', vol: 0.12 }); },
    twinkle(p, n = 0) { const t = now(); tone(t, midi(88 + (n % 5) * 2), 0.25, { vol: 0.05, p }); },
    catch(n, p) { const t = now(); const m = [74, 76, 78, 81, 83, 86, 88, 90][n % 8]; tone(t, midi(m), 0.6, { type: 'triangle', vol: 0.13, p }); tone(t + 0.04, midi(m + 12), 0.4, { vol: 0.05, p }); },
    darkIn() { const t = now(); noise(t, 2.6, { freq: 120, q: 0.6, vol: 0.4, sweep: 60, att: 1.2 }); tone(t, 55, 2.5, { vol: 0.25, att: 1.0 }); },
    lightIn() { const t = now(); [62, 69, 74, 78, 81].forEach((m, i) => tone(t + i * 0.1, midi(m), 2.2, { type: 'triangle', vol: 0.07, att: 0.2 })); },
    muffle(k) { musLp.frequency.setTargetAtTime(k ? 380 : 16000, now(), 0.4); },
    duck(on) { musG.gain.setTargetAtTime(on ? 0.3 : 1, now(), 0.15); roll.g.gain.setTargetAtTime(on ? 0.02 : 0.07, now(), 0.15); },
    // music: 80 bpm; dark minor drone at first, turning major, then an arpeggio and a tune as the light grows; a beat in flow
    tick() {
      const B = 0.75;
      while (S.next < now() + 0.2) {
        const t = S.next, bar = Math.floor(S.beat / 4), bt = S.beat % 4, L = S.light;
        const dark = [[38, 50, 53, 57], [34, 50, 53, 58], [41, 48, 53, 57], [36, 48, 52, 55]], bright = [[38, 50, 54, 57], [43, 50, 55, 59], [47, 50, 54, 59], [45, 49, 52, 57]];
        const ch = (L < 0.5 ? dark : bright)[bar % 4];
        if (bt === 0) {
          tone(t, midi(ch[0]), B * 4, { type: 'sine', vol: 0.16, att: 0.4, mus: true });
          ch.slice(1).forEach(m => tone(t, midi(m), B * 4, { type: 'triangle', vol: 0.025 + L * 0.02, att: 0.8, lp: 900 + L * 2000, mus: true }));
        }
        if (L >= 0.3) { const arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]; tone(t, midi(arp[bt]), 0.4, { type: 'triangle', vol: 0.04, p: 0.3, mus: true }); tone(t + B / 2, midi(arp[(bt + 2) % 4]), 0.3, { type: 'triangle', vol: 0.025, p: -0.3, mus: true }); }
        if (L >= 0.7) { const mel = [[81, 0], [78, 2], [76, 3]][bt % 3]; if (bt !== 3) tone(t, midi(mel[0] - (bar % 2) * 2), B * 1.2, { type: 'sine', vol: 0.05, att: 0.05, mus: true }); }
        if (L >= 0.5 && bt % 2 === 1) noise(t, 0.05, { freq: 6000, type: 'highpass', vol: 0.03, mus: true });
        if (S.flow) {   // in flow: a kick and a clap, and quick hats
          if (bt % 2 === 0) tone(t, 120, 0.25, { vol: 0.4, slide: 45, mus: true });
          if (bt % 2 === 1) noise(t, 0.12, { freq: 1500, q: 0.8, vol: 0.22, mus: true });
          noise(t + B / 2, 0.04, { freq: 7500, type: 'highpass', vol: 0.05, mus: true });
        }
        S.next += B; S.beat++;
      }
    },
    start() { S.next = now() + 0.1; master.gain.setTargetAtTime(0.9, now(), 0.1); roll.g.gain.setTargetAtTime(0.07, now(), 0.3); clearInterval(S.timer); S.timer = setInterval(S.tick, 30); S.tick(); },
    hold() { clearInterval(S.timer); S.timer = null; master.gain.setTargetAtTime(0.0001, now(), 0.05); },
    rolling(k) { roll.g.gain.setTargetAtTime(0.07 * k, now(), 0.15); roll.f.frequency.setTargetAtTime(300 + 200 * k, now(), 0.2); },
    finale() { const t = now(); [62, 66, 69, 74, 78, 81].forEach((m, i) => tone(t + i * 0.12, midi(m), 3.5, { type: 'triangle', vol: 0.06, att: 0.3 })); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), now(), secs / 3); },
    stop() { clearInterval(S.timer); S.timer = null; master.gain.setTargetAtTime(0.0001, now(), 0.08); setTimeout(() => { try { master.disconnect(); } catch (e) {} }, 600); },
  };
  return S;
}

export function keepRollingGame() {
  let G = null;

  /* ── screen bits ── */
  function hud() {
    const sub = G.listening ? 'Anthony is speaking…' : G.mode === 'glow' ? 'Tap to catch the light!' : G.mode === 'dark' ? 'Dark wave: listen to the cane' : G.state === 'down' ? 'Get back up…' : G.flow ? 'FLOW! Keep it smooth' : 'When the cane hits something, jump!';
    const lane = ['Left', 'Middle', 'Right'][G.lane + 1];
    G.ui.panel('Keep rolling', `${G.passed}<small>of ${GOAL} past · ${lane} lane</small>`, { segs: [G.passed, GOAL], sub });
  }
  function popMid(text) {
    let y = innerHeight * 0.55;
    try { const [x0, y0] = G.S.P(0.5, 0.45), v = new THREE.Vector3(x0, y0, 0.05); G.root.localToWorld(v); v.project(G.camera);
      const r = G.renderer.domElement.getBoundingClientRect(); y = r.top + (1 - v.y) / 2 * r.height; } catch (e) {}
    G.ui.pop(text, innerWidth / 2, Math.min(y, innerHeight - 270));
  }
  function hudCss() {
    const st = document.createElement('style');
    st.textContent = '.mgk.mgk-alert,.mgk.mgk-count{top:auto!important;bottom:calc(200px + env(safe-area-inset-bottom))!important}' +
      '.mgk.mgk-btns{bottom:calc(122px + env(safe-area-inset-bottom))!important}.mgk.mgk-alert .t{font-size:clamp(20px,6.4vw,30px)!important}' +
      '.mgk.mgk-btns.roll-help{bottom:calc(64px + env(safe-area-inset-bottom))!important}.mgk.mgk-btns.roll-help button{min-height:46px}' +
      // a little breathing room for every text box: the finish card, its score cells, the quote, the panel, alerts and pop-ups
      '.mgk.mgk-end{left:calc(18px + env(safe-area-inset-left))!important;right:calc(18px + env(safe-area-inset-right))!important}' +
      '.mgk-end .top{padding:14px 20px 16px!important;height:auto!important;min-height:0!important;overflow:visible!important}.mgk-end .top .t{line-height:1.02!important}.mgk-end .cells div{padding:10px 12px 12px!important;min-width:0}' +
      '.mgk-end .cells b{font-size:12px!important;letter-spacing:.1em!important;line-height:1.25!important}' +
      '.mgk-end .cells span{font-size:clamp(22px,7vw,38px)!important;overflow-wrap:normal;word-break:normal}.mgk-end .cells div:first-child{flex:1.4}' +
      '.mgk-end .line{padding:12px 20px 14px!important}.mgk-end .best{padding:8px 20px!important}.mgk-end button{padding:0 20px!important}' +
      '.mgk.mgk-alert{left:calc(18px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;padding:14px 20px 16px!important}' +
      '.mgk.mgk-panel{padding:10px 20px 12px!important}.mgk.mgk-pop{padding:6px 14px 5px!important;white-space:nowrap}';
    document.head.appendChild(st); return st;
  }
  /* ── Anthony's own voice: a piece of his recording ── */
  function anthony(bit, after = 0) {
    const [a, b] = BITS[bit];
    setTimeout(() => {
      if (!G || G.over) return;
      G.ui.alert('“' + BIT_TEXT[bit] + '”', 'Anthony Ferraro', b - a + 0.8, 'black');
      // WE HEAR ALL OF IT: the ride pauses (nothing moves toward him, the narrator waits) while Anthony speaks
      const done = () => { if (!G || !G.listening) return; G.listening = false; G.sfx.duck(false); hud(); flushSay(); };
      const ac = K.audio();
      if (G.clipBuf && ac) {   // his recording, decoded once: play exactly this piece of it
        G.say(''); G.sfx.duck(true); G.listening = true; hud();
        try { const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = G.clipBuf; src.connect(g).connect(ac.destination);
          const t0 = ac.currentTime, len = Math.min(b, G.clipBuf.duration) - a;   // a soft fade on both edges (no clicks)
          g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(1.25, t0 + 0.04); g.gain.setValueAtTime(1.25, t0 + len - 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
          src.onended = done; src.start(t0, a, len); G.bitSrc = src; } catch (e) { done(); }
        clearTimeout(G.voiceStop); G.voiceStop = setTimeout(done, (b - a) * 1000 + 600);   // (in case "ended" never comes)
        return;
      }
      const v = G.voice; if (!v) return;
      try {   // (fallback, if the recording couldn't be decoded)
        G.say(''); v.pause(); v.currentTime = a; G.sfx.duck(true); G.listening = true; hud();
        v.play().catch(done);
        clearTimeout(G.voiceStop); G.voiceStop = setTimeout(() => { try { v.pause(); } catch (e) {} done(); }, (b - a) * 1000 + 250);
      } catch (e) { done(); }
    }, after * 1000);
  }

  // narrator lines that come while Anthony is speaking wait until he's finished
  function flushSay() { if (G && G.sayQ.length) { const t = G.sayQ.join(' '); G.sayQ = []; G.rawSay(t); } }

  /* ── the things on the road ── */
  function spawn(delay = 0, lane = G.lane) {
    const id = G.order[G.spawned % G.order.length]; G.spawned++;
    const w = 0.15, m = K.plane(thingTex(id), w, w * 160 / 256, { order: 14 }); m.position.z = 0.04; m.material.opacity = 0; G.root.add(m);
    const glow = K.sprite(K.glowTex, w * 1.6, { color: '#ffd58a', additive: true, opacity: 0, order: 13 }); glow.position.z = 0.038; G.root.add(glow);
    G.things.push({ id, m, glow, w, lane, t: -delay, travel: G.travel, caned: false, approached: false, done: false, reveal: 0, idx: G.spawned });
  }
  function nextThing(mine = true) { return G.things.filter(o => !o.done && o.t > -0.01 && (!mine || o.lane === G.lane)).sort((a, b) => (a.travel - a.t) - (b.travel - b.t))[0]; }
  function jump() {
    if (!G || !G.playing || G.over) return;
    if (G.listening) { G.ui.pop('Listen…'); return; }   // the ride is paused while Anthony speaks
    if (G.mode === 'glow') { catchSpark(); return; }
    if (G.state === 'down') { G.ui.pop('Getting up…'); return; }
    if (G.state !== 'roll' || G.mode === 'end') return;
    G.state = 'air'; G.airT = 0; G.jumps++; G.sfx.pop(); G.buzz(20); G.spinning = G.flow;
    if (G.flow) G.sfx.spin();
    const o = nextThing();
    if (o) {
      const left = o.travel - o.t; o.jumpLeft = left;
      if (left > CANE + 0.07 && o.t / o.travel > 0.3 && G.t - G.lastSay > 2) { G.lastSay = G.t; G.say('Wait for the cane.'); popMid('WAIT FOR THE CANE'); }
    }
  }
  function move(d) {
    if (!G || !G.playing || G.over || G.mode === 'end' || G.state === 'down' || G.listening) return;
    const to = Math.max(-1, Math.min(1, G.lane + d));
    if (to === G.lane) { G.sfx.edge(d * 0.8); G.buzz(10); popMid(d < 0 ? 'ALREADY LEFT' : 'ALREADY RIGHT'); return; }
    G.lane = to; G.sfx.lane(to * 0.7); G.buzz(12); G.moves++; hud();
  }
  function dodged(o) {
    o.done = true; G.passed++; popMid('AROUND IT!'); G.sfx.pass(G.passed); G.buzz([20, 30]);
    const [x, y] = G.S.P(NEAR[0], NEAR[1] - 0.05), s = K.sprite(sparkTex(), 0.07, { order: 32, additive: true }); s.position.set(x, y, 0.07); G.root.add(s);
    G.sparks.push({ s, t: 0, from: [x, y], to: G.S.P(SUN[0], SUN[1]) });
    G.sfx.light = G.passed / GOAL; G.travel = Math.max(2.5, G.travel - 0.06);
    if (G.passed === Math.ceil(GOAL / 2)) { popMid('HALFWAY!'); anthony('giveUp', 0.5); }
    else if (G.passed === GOAL - 1) G.say('One more.');
    resolved(); hud();
    if (G.passed >= GOAL) endRun(o); else checkDark();
  }
  function endRun(o) {
    G.mode = 'end'; G.endT = 0; G.ui.buttons([]); if (G.helpEl) G.helpEl.style.display = 'none'; G.sfx.finale(); G.say('You made it to the light.'); G.flow = G.sfx.flow = false; G.sfx.muffle(false);
    G.things.forEach(t => { if (t !== o) t.done = true; t.fade = true; }); G.ui.alert('Light on the other side', 'He kept going', 3, 'black');
  }
  function resolved() { if (G.mode === 'dark') G.darkLeft--; }
  function passed(o) {
    o.done = true; G.passed++; const smooth = o.jumpLeft !== undefined && o.jumpLeft <= 0.42 && o.jumpLeft >= 0.16;
    if (smooth) { G.smooth++; G.streak++; } else G.streak = 0;
    const wasFlow = G.flow; G.flow = G.streak >= 3; G.sfx.flow = G.flow;
    if (G.flow && !wasFlow) { G.sfx.flowOn(); popMid('FLOW!'); G.say('Flow!'); }
    else popMid(smooth ? 'SMOOTH!' : 'OVER IT!');
    G.sfx.pass(G.passed); G.buzz([20, 30, 50]);
    const [x, y] = G.S.P(NEAR[0], NEAR[1] - 0.05), s = K.sprite(sparkTex(), 0.07, { order: 32, additive: true }); s.position.set(x, y, 0.07); G.root.add(s);
    G.sparks.push({ s, t: 0, from: [x, y], to: G.S.P(SUN[0], SUN[1]) });
    G.sfx.light = G.passed / GOAL;
    G.travel = Math.max(2.5, G.travel - 0.06);
    if (G.passed === Math.ceil(GOAL / 2)) { popMid('HALFWAY!'); anthony('giveUp', 0.5); }
    else if (G.passed === GOAL - 1) G.say('One more.');
    resolved(); hud();
    if (G.passed >= GOAL) endRun(o);
    else checkDark();
  }
  function fall(o) {
    o.done = true; G.falls++; G.state = 'down'; G.downT = 0; G.sfx.fall(); G.buzz([120]); G.dip = 1; G.spinning = false;
    G.streak = 0; G.flow = G.sfx.flow = false;
    if (G.falls === 2) { G.say('Get back up.'); anthony('keepGoing', 1.2); }
    else { G.say(G.falls % 2 === 1 ? 'Get back up. Keep going.' : 'Get back up. Giving up is not an option.'); G.ui.alert('Get back up', 'Keep going', 1.8, 'red'); }
    resolved(); hud(); checkDark();
  }
  /* ── dark and light, again and again ── */
  function checkDark() {
    if (G.mode === 'run' && DARK_AT.includes(G.passed) && !G.darkDone.includes(G.passed)) {
      G.darkDone.push(G.passed); G.mode = 'dark'; G.darkLeft = 2; G.gap = Math.max(G.gap, 2.6); G.sfx.darkIn(); G.sfx.muffle(true);
      if (G.darkDone.length === 1) { anthony('darkLight', 0.2); setTimeout(() => { if (G && G.mode === 'dark') { G.say('A dark wave is coming. Listen to the cane.'); G.ui.alert('Dark wave', 'Listen to the cane', 2.2, 'black'); } }, 2600); }
      else { G.say('Another dark wave. Listen to the cane.'); G.ui.alert('Dark wave', 'Listen to the cane', 2.2, 'black'); }
      hud();
    }
  }
  function startGlow() {
    G.mode = 'glow'; G.glowT = 0; G.glowN++; G.sfx.muffle(false); G.sfx.lightIn(); G.buzz([30, 30, 30]);
    G.say('The light is back. Tap to catch the light!');
    G.ui.alert('The light is back', 'Tap to catch the light', 2.4, 'black');
    for (let i = 0; i < 7; i++) {   // sparks of light float up around him
      const s = K.sprite(sparkTex(), 0.06, { order: 33, additive: true, opacity: 0 }); G.root.add(s);
      G.motes.push({ s, u: 0.22 + Math.random() * 0.6, v: 0.32 + Math.random() * 0.3, ph: Math.random() * 6, t: -i * 0.35, caught: false, ct: 0, n: i });
    }
    hud();
  }
  function catchSpark() {
    const m = G.motes.filter(m => !m.caught && m.t > 0).sort((a, b) => Math.hypot(a.u - FOOT[0], a.v - FOOT[1]) - Math.hypot(b.u - FOOT[0], b.v - FOOT[1]))[0];
    if (!m) return;
    m.caught = true; m.ct = 0; G.caught++; G.sfx.catch(G.caught, (m.u - 0.5) * 1.6); G.buzz(15);
    const [x, y] = G.S.P(m.u, m.v); G.fx.add(x, y, '#ffe9b0', 12, 0.2); popMid('+1 LIGHT');
  }
  function help() {
    if (!G || !G.playing || G.over) return;
    G.lastSay = G.t;
    if (G.mode === 'glow') { G.say('Tap to catch the light!'); return; }
    G.say('Listen to the cane. When it hits something, jump! Or move left or right to go around it.');
    G.ui.alert('Cane hits it: JUMP', 'Or move LEFT or RIGHT to go around it', 2.6, 'black');
    G.travel = Math.min(3.6, G.travel + 0.3);
  }
  function finish() {
    if (G.over) return;
    const r = K.best('light-on-the-other-side:roll', G.falls, 'lower');
    K.finale(G, { won: true, kicker: 'He kept going', title: 'Light on the other side', line: G.work && G.work.quote, best: r.isBest, say: 'He kept going.',
      cells: [{ k: 'Past', v: `${G.passed}/${GOAL}` }, { k: 'Light caught', v: `${G.caught}` }, { k: 'Got back up', v: `${G.falls}` }] });
    G.sfx.fade(0.35, 2); G.overT = 0;
  }

  return {
    title: 'Keep rolling',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = hudCss();
      G.sayQ = []; G.rawSay = G.say; G.say = Object.assign((t) => { if (G && G.listening && t) { G.sayQ.push(t); return; } G.rawSay(t); }, { stop: G.rawSay.stop });
      Object.assign(G, { lane: 0, laneX: 0, moves: 0, walls: 0, state: 'intro', mode: 'run', passed: 0, falls: 0, smooth: 0, streak: 0, flow: false, spinning: false, jumps: 0, spawned: 0, things: [], gap: 1.2, travel: 3.2, pairs: 0,
        airT: 0, downT: 0, endT: 0, lastSay: -9, caneT: 0, caneSide: 0, run: 0, light: 0, dip: 0, night: 0, sparks: [], ripples: [], trail: [], trailT: 0,
        motes: [], caught: 0, glowN: 0, glowT: 0, darkLeft: 0, darkDone: [], t0: 0, order: IDS.slice().sort(() => Math.random() - 0.5) });
      G.sfx = sounds(K.audio());
      try { G.voice = new Audio((ctx.work && ctx.work.statementAudio) || CLIP); G.voice.preload = 'auto'; } catch (e) { G.voice = null; }
      // decode Anthony's recording up front, so each piece of it can be played exactly (from the right word to the end)
      fetch((ctx.work && ctx.work.statementAudio) || CLIP).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => { const p = K.audio().decodeAudioData(b, ok, no); if (p && p.then) p.then(ok, no); }))
        .then(buf => { if (G) G.clipBuf = buf; }).catch(() => {});
      G.uni = { clean: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uRun: { value: 0 }, uLight: { value: 0 }, uWhite: { value: 0 }, uDip: { value: 0 }, uNight: { value: 0 }, uSun: { value: new THREE.Vector2(...SUN) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      new THREE.TextureLoader().load(ART + 'clean.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.clean.value = t; G.face.visible = true; });
      // Anthony, cut out of the painting, drawn a bit bigger, pivoting at his board
      const bw = (BOX[2] - BOX[0]) * SK, bh = (BOX[3] - BOX[1]) * G.h * SK;
      // in three pieces, so his cane can sweep and his back leg can push: each piece pivots where it joins him
      G.sk = new THREE.Group(); G.root.add(G.sk); G.parts = {}; let need = 3;
      const LP = (x, y) => [(x / 210 - 0.5) * bw, (1 - y / 342) * bh];   // a point on the cut-out (its 210×342 pixels) → his group
      for (const [name, px, py, order] of [['leg', 138, 178, 19], ['body', 105, 342, 20], ['cane', 46, 142, 21]]) {
        const [ox, oy] = LP(px, py), geo = new THREE.PlaneGeometry(bw, bh); geo.translate(-ox, bh / 2 - oy, 0);
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }));
        m.renderOrder = order; m.position.set(ox, oy, 0); G.sk.add(m); G.parts[name] = m;
        new THREE.TextureLoader().load(ART + 'sk-' + name + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; m.material.map = t; m.material.needsUpdate = true; if (--need === 0) G.skReady = true; });
      }
      G.pushT = -1; G.pushCD = 1.5;
      G.ui.buttons([
        { label: '◀ Left', kind: 'black', aria: 'Move one lane left', press: () => move(-1) },
        { label: 'Jump', kind: 'red', aria: 'Jump over what the cane found, or catch the light', press: () => jump() },
        { label: 'Right ▶', kind: 'black', aria: 'Move one lane right', press: () => move(1) },
      ]);
      // Help gets its own bar along the bottom
      G.helpEl = document.createElement('div'); G.helpEl.className = 'mgk mgk-btns roll-help';
      const hb = document.createElement('button'); hb.type = 'button'; hb.className = 'black'; hb.textContent = 'Help'; hb.setAttribute('aria-label', 'Help: how to play');
      hb.addEventListener('pointerdown', ev => { ev.preventDefault(); K.audio(); help(); }); hb.addEventListener('keydown', ev => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); help(); } });
      G.helpEl.appendChild(hb); document.body.appendChild(G.helpEl);
      hud();
      G.onGo = () => { G.state = 'roll'; G.t0 = G.t; G.sfx.start(); G.gap = 1.6; };
      K.intro(G, { title: 'Keep rolling', how: SAY.how, say: SAY.intro });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const gdt = G.listening ? 0 : dt;   // while Anthony speaks, the ride holds still
      const u = G.uni, moving = G.state === 'roll' || G.state === 'air' || G.mode === 'end';
      u.uT.value = G.t; u.uA.value += ((G.over && G.overT > 5 ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      G.run += (G.listening ? dt * 0.15 : dt) * (moving ? (G.flow ? 1.15 : 0.9) : G.state === 'intro' ? 0.25 : 0); u.uRun.value = G.run;
      G.light += (G.passed / GOAL - G.light) * Math.min(1, dt * 1.5); u.uLight.value = G.light;
      G.dip = Math.max(0, G.dip - dt * 0.5); u.uDip.value = G.dip;
      G.night += ((G.mode === 'dark' ? 1 : 0) - G.night) * Math.min(1, dt * (G.mode === 'dark' ? 0.9 : 1.6)); u.uNight.value = G.night;
      if (G.playing) G.sfx.rolling(moving ? 1 : 0.1);

      // the cane sweeps ahead: tik… tik…, and every tap sends a ripple of light along the road
      if (G.playing && moving && G.mode !== 'end') {
        G.caneT -= gdt;
        if (G.caneT <= 0) {
          G.caneT = 0.42; G.caneSide ^= 1; G.sfx.cane(G.caneSide ? -0.6 : 0.6);   // left side of his path, then the right
          const side = G.caneSide ? -0.55 : 0.55, [ox, oy] = laneAt(G.laneX + side);
          const r = K.sprite(K.ringTex, 0.02, { color: '#ffe3b0', additive: true, opacity: 0, order: 15 }); const [x, y] = G.S.P(TIP[0] + ox, TIP[1] + oy);
          r.position.set(x, y, 0.035); G.root.add(r); G.ripples.push({ s: r, t: 0 });
          for (const o of G.things) { const k = o.t / o.travel; if (!o.done && k > 0.3 && k < 1) o.reveal = Math.max(o.reveal, 0.55 + 0.4 * k); }
        }
      }
      for (let i = G.ripples.length - 1; i >= 0; i--) { const r = G.ripples[i]; r.t += dt / 1.1;
        const w = 0.03 + r.t * 0.42; r.s.scale.set(w, w * 0.32, 1); r.s.material.opacity = (1 - r.t) * (0.35 + G.night * 0.5);
        r.s.position.x -= dt * 0.05;   // the ripple runs ahead, up the road toward the light
        if (r.t >= 1) { G.root.remove(r.s); r.s.material.dispose(); G.ripples.splice(i, 1); } }

      // the things coming at him
      if (G.playing && (G.mode === 'run' || G.mode === 'dark') && !G.things.length) {
        if (G.mode === 'dark' && G.darkLeft <= 0) startGlow();
        else { G.gap -= gdt; if (G.gap <= 0) {
          const left = GOAL - G.passed, other = () => [-1, 0, 1].filter(l => l !== G.lane)[Math.floor(Math.random() * 2)];
          if (G.mode === 'run' && G.passed >= 5 && left >= 2 && G.pairs < 2 && (G.bot || Math.random() < 0.6)) { spawn(0, G.lane); spawn(PAIR_GAP, Math.random() < 0.5 ? G.lane : other()); G.pairs++; }   // two in a row
          else if (G.mode === 'run' && G.passed >= 2 && left >= 2 && G.walls < 2 && (G.bot ? G.passed === 2 : Math.random() < 0.35)) { spawn(0, G.lane); spawn(0, other()); G.walls++; }   // two lanes blocked: jump, or find the free one
          else spawn(0, Math.random() < 0.7 ? G.lane : other());
        } }
      }
      for (let i = G.things.length - 1; i >= 0; i--) {
        const o = G.things[i]; o.t += gdt;
        if (o.t < 0) { o.m.material.opacity = 0; o.glow.material.opacity = 0; continue; }
        const k = o.t / o.travel;
        const rel = o.lane - G.lane;   // which side of him it is: <0 left, >0 right
        if (!o.done && !o.approached && o.t >= o.travel - CANE - 1.1) { o.approached = true; G.sfx.approach(rel ? rel * 0.8 : -0.2); }
        if (!o.done && !o.caned && o.t >= o.travel - CANE) {
          o.caned = true;
          if (!rel) { G.sfx.hit(o.id); G.buzz(BUZZ[o.id]); o.reveal = 1.6; G.caneT = 0.5; }   // right in his path: the cane hits it
          else { G.sfx.hit(o.id, rel * 0.85, 0.35); o.reveal = 0.9; }                       // the cane brushes it off to one side
        }
        if (!o.done && o.t >= o.travel) {
          const inLane = Math.abs(G.laneX - o.lane) < 0.5;
          if (!inLane) { if (G.state === 'down') { o.done = true; resolved(); } else dodged(o); }
          else if (G.state === 'air') passed(o);
          else if (G.state === 'down') { o.done = true; resolved(); }   // he's still getting up: it goes past
          else fall(o);
        }
        let pu, pv, sc;
        if (k <= 1) { const e = Math.pow(Math.max(0, k), 1.6); pu = lerp(FAR[0], NEAR[0], e); pv = lerp(FAR[1], NEAR[1], e); sc = lerp(0.18, 1, e); }
        else { const e = Math.min(1, (k - 1) * 2.2); pu = lerp(NEAR[0], PAST[0], e); pv = lerp(NEAR[1], PAST[1], e); sc = 1 + e * 0.5; }
        const [lx, ly] = laneAt(o.lane, Math.min(1.3, sc)), [x, y] = G.S.P(pu + lx, pv + ly), yy = y + o.w * 160 / 256 * sc * 0.4;
        o.m.position.set(x, yy, 0.04); o.m.scale.setScalar(sc); o.glow.position.set(x, yy, 0.038); o.glow.scale.setScalar(o.w * 1.6 * sc);
        o.reveal = Math.max(0, o.reveal - dt * 1.4);
        const fadeIn = Math.min(1, k * 3), fadeOut = k > 1 ? Math.max(0, 1 - (k - 1) * 2.4) : 1;
        const seen = lerp(1, Math.min(1, 0.06 + o.reveal), G.night);   // in a dark wave you only see it when the cane's light reaches it
        o.m.material.opacity = fadeIn * fadeOut * seen * (o.fade ? 0.5 : 1);
        o.m.material.color.setScalar(1 + Math.min(1, o.reveal) * 0.5);
        o.glow.material.opacity = Math.min(1, o.reveal) * 0.75 * fadeOut;
        if (k > 1.45) { G.root.remove(o.m); G.root.remove(o.glow); o.m.material.dispose(); o.glow.material.dispose(); G.things.splice(i, 1); if (!G.things.length) G.gap = 1.0 + Math.random() * 0.8; }
      }

      // a light moment: sparks float around him; tap to catch them
      if (G.mode === 'glow') {
        G.glowT += gdt;
        if (G.bot) { G.botTap = (G.botTap || 0) - dt; if (G.botTap <= 0) { G.botTap = 0.45; catchSpark(); } }
        if (G.glowT > 6.5 || G.motes.every(m => m.caught && m.ct > 0.6)) {
          G.mode = 'run'; G.gap = G.glowN === 1 ? 3.0 : 1.4; hud();
          if (G.glowN === 1) anthony('enjoy', 0.3);
          G.motes.forEach(m => { G.root.remove(m.s); m.s.material.dispose(); }); G.motes = [];
        }
      }
      for (const m of G.motes) {
        m.t += gdt; if (m.t < 0) continue;
        if (m.caught) { m.ct += dt; const e = Math.min(1, m.ct / 0.6); const [x, y] = G.S.P(lerp(m.u, SUN[0], e), lerp(m.v, SUN[1], e)); m.s.position.set(x, y, 0.07); m.s.material.opacity = 1 - e; m.s.scale.setScalar(0.06 * (1 - e * 0.5)); continue; }
        const bob = Math.sin(G.t * 2 + m.ph) * 0.015, [x, y] = G.S.P(m.u + Math.cos(G.t * 0.7 + m.ph) * 0.02, m.v + bob);
        m.s.position.set(x, y, 0.07); m.s.material.opacity = Math.min(1, m.t * 2) * (0.75 + 0.25 * Math.sin(G.t * 6 + m.ph)); m.s.material.rotation += dt;
        m.s.scale.setScalar(0.06 + 0.012 * Math.sin(G.t * 4 + m.ph));
        const tw = Math.floor((G.t + m.ph) * 1.3); if (tw !== m.tw) { m.tw = tw; G.sfx.twinkle((m.u - 0.5) * 1.6, m.n); }
      }

      // him: rolling with a little sway, the ollie (a spin in flow), the fall, getting back up, and at the end, into the light
      let lift = 0, rot = 0, spin = 0, su = FOOT[0], sv = FOOT[1], sc = 1;
      const sway = moving ? Math.sin(G.t * 5.2) * 0.0018 : 0;
      if (G.state === 'air') {
        G.airT += gdt; const k = Math.min(1, G.airT / AIR); lift = (G.spinning ? 0.1 : 0.085) * Math.sin(Math.PI * k); rot = -0.2 * Math.sin(Math.PI * k);
        if (G.spinning) spin = k * Math.PI * 2;
        if (k >= 1) { G.state = 'roll'; G.spinning = false; G.sfx.land(); const [x, y] = G.S.P(FOOT[0], FOOT[1]); G.fx.add(x, y, '#ffd99a', 10, 0.15); }
      } else if (G.state === 'down') {
        G.downT += gdt; const t = G.downT;
        if (t < 0.45) rot = -1.25 * Math.pow(t / 0.45, 2);
        else if (t < 1.5) rot = -1.25 + Math.sin((t - 0.45) * 9) * 0.02 * (1.5 - t);
        else if (t < 2.2) { const k = (t - 1.5) / 0.7; rot = -1.25 * (1 - k * k * (3 - 2 * k)); lift = Math.sin(Math.PI * k) * 0.01; }
        else { G.state = 'roll'; G.sfx.up(); hud(); }
      } else if (G.mode === 'end') {
        G.endT += dt; const k = Math.min(1, G.endT / 4.5), e = k * k;
        su = lerp(FOOT[0], SUN[0] + 0.04, e); sv = lerp(FOOT[1], SUN[1] + 0.16, e); sc = 1 - e * 0.75;
        u.uWhite.value = Math.min(1, Math.max(0, (G.endT - 1.2) / 3.6));
        if (G.endT > 5.2) finish();
      }
      G.laneX += (G.lane - G.laneX) * Math.min(1, dt * 12);
      if (G.mode !== 'end') { const [lx, ly] = laneAt(G.laneX); su += lx; sv += ly; sc *= 1 - 0.07 * G.laneX; }   // a little smaller in the far lane
      const [sx, sy] = G.S.P(su, sv); G.sk.position.set(sx, sy + lift + sway, 0.05); G.sk.rotation.set(0, spin, rot + sway * 3); G.sk.scale.setScalar(sc);
      const skA = (G.skReady && G.face.visible ? 1 : 0) * (G.mode === 'end' ? Math.max(0, 1 - Math.max(0, G.endT - 3.4)) : 1);
      const skC = 1 - G.night * 0.6 + (G.flow ? 0.15 * (0.5 + 0.5 * Math.sin(G.t * 8)) : 0);
      for (const m of Object.values(G.parts)) { m.material.opacity = skA; m.material.color.setScalar(skC); }
      // his cane sweeps side to side, tapping the road at each end of the sweep (in time with the tik… tik…)
      const ph = Math.max(0, Math.min(1, 1 - G.caneT / 0.42)), sweeping = G.playing && moving && G.mode !== 'end' && G.state !== 'air';
      // sw: -1 = the tip out on his left (toward us, in front of him), +1 = on his right (beyond his feet, behind him)
      const sw = sweeping ? (G.caneSide ? -1 : 1) * Math.cos(Math.PI * ph) : 0;
      G.caneSw = (G.caneSw || 0) + (sw - (G.caneSw || 0)) * Math.min(1, dt * 20);
      const cs = G.caneSw;
      G.parts.cane.rotation.z = 0.05 + cs * 0.16;                                         // the tip swings toward his feet on the right side
      G.parts.cane.scale.y = (1 + Math.max(0, -cs) * 0.12 - Math.max(0, cs) * 0.24) * (sweeping ? 1 - 0.05 * Math.sin(Math.PI * ph) : 1);   // reaches out in front, shorter as it goes behind
      G.parts.cane.renderOrder = cs > 0.15 ? 18 : 21;                                     // behind his legs on the right side
      // every few seconds he pushes: his back leg reaches down to the road and kicks back
      const clear = !G.things.some(o => !o.done && o.t / o.travel > 0.3 && o.t / o.travel < 1.15);
      if (G.pushT < 0 && G.state === 'roll' && G.mode !== 'end' && G.playing) { G.pushCD -= gdt; if (G.pushCD <= 0 && clear && !G.listening) { G.pushT = 0; G.pushCD = 2.2 + Math.random() * 1.2; G.scuffed = false; } }
      let pe = 0;
      if (G.pushT >= 0) { G.pushT += dt / 0.85; if (G.state !== 'roll' || G.pushT >= 1) G.pushT = -1; else { pe = Math.sin(Math.PI * G.pushT); if (!G.scuffed && G.pushT > 0.35) { G.scuffed = true; G.sfx.scuff(); } } }
      G.parts.leg.rotation.z = 0.5 * pe; G.parts.leg.scale.y = 1 + 0.2 * pe;
      G.sk.position.y -= 0.012 * pe;   // he dips as his front knee bends
      // in flow he leaves a trail of light
      if (G.flow && moving && G.mode !== 'end') { G.trailT -= dt; if (G.trailT <= 0) { G.trailT = 0.04;
        const d = K.sprite(K.dotTex, 0.03, { color: '#ffd27a', additive: true, order: 18 }); d.position.set(sx + (Math.random() - 0.5) * 0.02, sy + lift + 0.01, 0.045); G.root.add(d); G.trail.push({ s: d, t: 0 }); } }
      for (let i = G.trail.length - 1; i >= 0; i--) { const d = G.trail[i]; d.t += dt / 0.8; d.s.position.x += dt * 0.12; d.s.position.y -= dt * 0.03; d.s.material.opacity = 1 - d.t; d.s.scale.setScalar(0.03 * (1 - d.t * 0.5));
        if (d.t >= 1) { G.root.remove(d.s); d.s.material.dispose(); G.trail.splice(i, 1); } }
      // sparks fly to the light
      for (let i = G.sparks.length - 1; i >= 0; i--) { const s = G.sparks[i]; s.t += dt / 1.1; const k = Math.min(1, s.t), e = 1 - Math.pow(1 - k, 2);
        s.s.position.set(lerp(s.from[0], s.to[0], e), lerp(s.from[1], s.to[1], e) + Math.sin(k * Math.PI) * 0.08, 0.07); s.s.material.opacity = 1 - Math.max(0, k - 0.8) * 5; s.s.material.rotation += dt * 3;
        if (k >= 1) { G.root.remove(s.s); s.s.material.dispose(); G.sparks.splice(i, 1); const [x, y] = G.S.P(SUN[0], SUN[1]); G.fx.add(x, y, '#ffe2a0', 16, 0.25); } }
      // the end: Anthony's whole statement
      if (G.over) { G.overT += dt; u.uWhite.value = Math.max(0, u.uWhite.value - dt * 0.4);
        if (G.overT > 2.2 && !G.clip) {   // Anthony's own words, as his quote comes up: the music dips right down under him, then comes back up gently
          G.sfx.fade(0.04, 0.6); clearTimeout(G.voiceStop); G.sfx.duck(false);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.sfx.fade(0.22, 2); G.fadeAt = G.overT + 7; } };
          try { G.clip = G.voice || new Audio(CLIP); G.clip.currentTime = 0; G.clip.onended = back; G.clip.onerror = back; G.clip.play().catch(back); } catch (e) { G.clip = {}; back(); }
          G.clipSafety = G.overT + (G.clip.duration > 0 ? G.clip.duration : 22) + 0.8;
        }
        if (G.clip && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.sfx.fade(0.22, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.sfx.fade(0.0001, 3); } }
      // the robot: jumps a moment after the cane hits (and misses the 3rd thing on purpose, to show getting back up)
      if (G.bot && G.state === 'roll' && (G.mode === 'run' || G.mode === 'dark')) {
        const o = nextThing();
        if (o && o.caned && !o.botDone) {
          if (o.idx % 4 === 2 && !o.botMoved) { o.botMoved = true; const busy = new Set(G.things.filter(t => !t.done && Math.abs(t.travel - t.t - (o.travel - o.t)) < 0.8).map(t => t.lane));
            const free = [-1, 0, 1].filter(l => !busy.has(l)).sort((a, b) => Math.abs(a - G.lane) - Math.abs(b - G.lane))[0]; if (free !== undefined) { move(free - G.lane > 0 ? 1 : -1); if (Math.abs(free - G.lane) > 0) move(free - G.lane > 0 ? 1 : -1); } }
          else if (o.t >= o.travel - 0.3) { o.botDone = true; if (o.idx !== 3) jump(); }
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') { G.swipe = { x: ev.clientX, y: ev.clientY, t: performance.now(), done: false }; jump(); return; }   // tap anywhere: jump
      if (kind === 'move' && G.swipe && !G.swipe.done) {   // swipe left or right: change lanes
        const dx = ev.clientX - G.swipe.x; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(ev.clientY - G.swipe.y) && performance.now() - G.swipe.t < 600) { G.swipe.done = true; move(dx < 0 ? -1 : 1); }
      }
      if (kind === 'up') G.swipe = null;
    },
    pause() { if (G) { G.paused = true; G.sfx.hold(); if (G.voice) try { G.voice.pause(); } catch (e) {} } },
    resume() { if (G) { G.paused = false; if (G.playing && !G.over) G.sfx.start(); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { lane: G.lane, moves: G.moves, engine: 'roll-keep', state: G.state, mode: G.mode, playing: G.playing, over: G.over, passed: G.passed, falls: G.falls, smooth: G.smooth, flow: G.flow, caught: G.caught, things: G.things.length, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.sfx.stop(); clearTimeout(G.voiceStop); if (G.voice) try { G.voice.pause(); } catch (e) {} if (G.clip && G.clip.pause) G.clip.pause(); if (G.bitSrc) try { G.bitSrc.stop(); } catch (e) {}
        for (const list of [G.sparks, G.ripples, G.trail, G.motes]) list.forEach(x => x.s.material.dispose()); if (G.css) G.css.remove(); if (G.helpEl) G.helpEl.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
