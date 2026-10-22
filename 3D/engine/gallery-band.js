// Blind Canvas gallery: the band corner of the Academy of Music (22 Oct): a drum kit and an electric guitar beside the piano.
// Sit on the drum stool (ACTION "PLAY DRUMS") and a kit of big pads opens along the bottom of the screen: tap them, several at
// once (or on a computer: SPACE / B kick, F J snare, D hi-hat, E open hat, G H toms, K floor tom, R crash, U ride).
// Sit on the guitar stool (ACTION "PLAY GUITAR") and the guitar comes off its stand into your fox's lap: pick a chord, then swipe
// across the six strings to strum (or tap one string), or use STRUM ▼ / STRUM ▲. DRIVE turns the amp up.
// (computer: 1-9 chords, SPACE / ↓ strum down, ↑ strum up, A S D F G H the six strings.)
// The sounds are synthesised (no samples): drums from tuned sine sweeps and filtered noise, the guitar by plucked-string
// (Karplus-Strong) synthesis. Everyone in the gallery hears you, softer further away, and sees the drums jump / strings shake.
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';

const PADS = [
  { k: 'crash', n: 'Crash', key: 'R', c: '#c99a3a' }, { k: 'tom1', n: 'Tom 1', key: 'G', c: '#c81e14' }, { k: 'tom2', n: 'Tom 2', key: 'H', c: '#c81e14' }, { k: 'ride', n: 'Ride', key: 'U', c: '#c99a3a' },
  { k: 'hihat', n: 'Hi-hat', key: 'D', c: '#b38a32' }, { k: 'snare', n: 'Snare', key: 'F', c: '#e9e4d8', dark: 1 }, { k: 'floor', n: 'Floor tom', key: 'K', c: '#a8180f' }, { k: 'open', n: 'Open hat', key: 'E', c: '#b38a32' },
  { k: 'kick', n: 'Kick drum', key: 'SPACE', c: '#1d1c1b', wide: 1 },
];
const DKEYS = { ' ': 'kick', b: 'kick', f: 'snare', j: 'snare', d: 'hihat', e: 'open', g: 'tom1', h: 'tom2', k: 'floor', r: 'crash', q: 'crash', u: 'ride', o: 'ride' };
const OPEN = [40, 45, 50, 55, 59, 64];   // E2 A2 D3 G3 B3 E4
const CHORDS = [
  ['C', [-1, 3, 2, 0, 1, 0]], ['G', [3, 2, 0, 0, 0, 3]], ['D', [-1, -1, 0, 2, 3, 2]], ['A', [-1, 0, 2, 2, 2, 0]], ['E', [0, 2, 2, 1, 0, 0]],
  ['Am', [-1, 0, 2, 2, 1, 0]], ['Em', [0, 2, 2, 0, 0, 0]], ['Dm', [-1, -1, 0, 2, 3, 1]], ['F', [1, 3, 3, 2, 1, 1]],
];
const SPOKEN = { C: 'C major', G: 'G major', D: 'D major', A: 'A major', E: 'E major', Am: 'A minor', Em: 'E minor', Dm: 'D minor', F: 'F major' };
const STR_NAMES = ['low E', 'A', 'D', 'G', 'B', 'high E'];

export function setupBand({ G, net, announce = () => {}, nameOf = () => 'Someone' }) {
  const B = G.campus && G.campus.band; if (!B || !B.drums || !B.guitar) return null;
  // ------------------------------------------------ sound
  let ac = null, bus = null, gtrIn = null, drive = false, shaper = null, cleanG = null, driveG = null, noise = null;
  function audio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 4; comp.connect(ac.destination);
    bus = ac.createGain(); bus.gain.value = 0.9; bus.connect(comp);
    // a small room: a generated impulse response
    const len = ac.sampleRate * 0.9, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const rev = ac.createConvolver(); rev.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.16; bus.connect(rev); rev.connect(wet); wet.connect(comp);
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    // the guitar's amp: clean, or driven (a soft-clipping curve, then a speaker-ish lowpass)
    gtrIn = ac.createGain(); cleanG = ac.createGain(); driveG = ac.createGain(); cleanG.gain.value = 1; driveG.gain.value = 0;
    shaper = ac.createWaveShaper(); const n = 1024, curve = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curve[i] = Math.tanh(x * 6) * 0.6; } shaper.curve = curve; shaper.oversample = '2x';
    const pre = ac.createGain(); pre.gain.value = 2.2; const cab = ac.createBiquadFilter(); cab.type = 'lowpass'; cab.frequency.value = 3600; cab.Q.value = 0.8;
    gtrIn.connect(cleanG); cleanG.connect(bus); gtrIn.connect(pre); pre.connect(shaper); shaper.connect(cab); cab.connect(driveG); driveG.connect(bus);
    return ac;
  }
  function setDrive(on) { drive = on; if (!ac) return; const t = ac.currentTime; cleanG.gain.setTargetAtTime(on ? 0 : 1, t, 0.02); driveG.gain.setTargetAtTime(on ? 0.55 : 0, t, 0.02); }
  const env = (g, t, peak, a, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  function noiseHit(t, out, type, freq, q, peak, dur, rate = 1) { const s = ac.createBufferSource(); s.buffer = noise; s.playbackRate.value = rate; const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ac.createGain(); env(g, t, peak, 0.001, dur); s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05); return g; }
  function sweep(t, out, f0, f1, peak, dur, type = 'sine') { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.4); const g = ac.createGain(); env(g, t, peak, 0.002, dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05); }
  let openHat = null;
  function drumSound(k, vol = 1) {
    if (!audio() || vol <= 0.01) return; const t = ac.currentTime + 0.002, out = ac.createGain(); out.gain.value = vol; out.connect(bus);
    switch (k) {
      case 'kick': sweep(t, out, 160, 42, 1.0, 0.42); noiseHit(t, out, 'lowpass', 2500, 0.7, 0.25, 0.02); break;
      case 'snare': sweep(t, out, 240, 175, 0.45, 0.12, 'triangle'); noiseHit(t, out, 'highpass', 1400, 0.6, 0.55, 0.2); noiseHit(t, out, 'bandpass', 4200, 0.8, 0.3, 0.12); break;
      case 'tom1': sweep(t, out, 330, 205, 0.7, 0.45); noiseHit(t, out, 'bandpass', 900, 1, 0.08, 0.05); break;
      case 'tom2': sweep(t, out, 250, 155, 0.75, 0.5); noiseHit(t, out, 'bandpass', 700, 1, 0.08, 0.05); break;
      case 'floor': sweep(t, out, 170, 98, 0.85, 0.65); noiseHit(t, out, 'bandpass', 500, 1, 0.08, 0.06); break;
      case 'hihat': if (openHat) { try { openHat.gain.cancelScheduledValues(t); openHat.gain.setTargetAtTime(0.0001, t, 0.01); } catch (e) {} openHat = null; }
        metal(t, out, 0.28, 0.05, 9000); break;
      case 'open': openHat = metal(t, out, 0.24, 0.45, 8500); break;
      case 'crash': metal(t, out, 0.34, 1.7, 5200); noiseHit(t, out, 'highpass', 4000, 0.5, 0.3, 1.6); break;
      case 'ride': metal(t, out, 0.2, 1.3, 6500); { const o = ac.createOscillator(); o.frequency.value = 760; const g = ac.createGain(); env(g, t, 0.1, 0.002, 0.8); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.9); } break;
    }
  }
  // cymbals: six detuned square waves (the 808 recipe) through a bandpass and a highpass, plus a little noise
  function metal(t, out, peak, dur, bp) {
    const g = ac.createGain(), f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = bp; f1.Q.value = 0.6; f2.type = 'highpass'; f2.frequency.value = 6000;
    env(g, t, peak, 0.001, dur); for (const r of [2, 3, 4.16, 5.43, 6.79, 8.21]) { const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 40 * r; o.connect(f1); o.start(t); o.stop(t + dur + 0.05); }
    f1.connect(f2); f2.connect(g); g.connect(out); noiseHit(t, out, 'highpass', 8000, 0.5, peak * 0.5, dur * 0.6); return g;
  }
  // the guitar: a plucked string, synthesised once per note and kept (Karplus-Strong with a fractional delay, so it's in tune)
  const strCache = new Map();
  function stringBuf(m) {
    if (strCache.has(m)) return strCache.get(m);
    const sr = ac.sampleRate, f = 440 * Math.pow(2, (m - 69) / 12), P = sr / f, N = Math.floor(P), frac = P - N, dur = 3.2, L = Math.floor(sr * dur);
    const buf = ac.createBuffer(1, L, sr), y = buf.getChannelData(0), decay = 0.9985 - (m - 40) * 0.00004;
    let lp = 0; for (let i = 0; i <= N + 1 && i < L; i++) { lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45; y[i] = lp; }   // a soft pick: the noise burst, lowpassed
    for (let i = N + 2; i < L; i++) { const a = y[i - N] * (1 - frac) + y[i - N - 1] * frac, b = y[i - N - 1] * (1 - frac) + y[i - N - 2] * frac; y[i] = (a + b) * 0.5 * decay; }
    strCache.set(m, buf); return buf;
  }
  const ringing = new Array(6).fill(null);   // per string: the voice that's sounding (a new pluck on the string stops it)
  function pluck(si, m, vol = 1, mute = false, delay = 0) {
    if (!audio() || vol <= 0.01) return; const t = ac.currentTime + 0.003 + delay;
    const old = ringing[si]; if (old) { try { old.g.gain.cancelScheduledValues(t); old.g.gain.setTargetAtTime(0.0001, t, 0.015); old.s.stop(t + 0.1); } catch (e) {} }
    const s = ac.createBufferSource(); s.buffer = stringBuf(m); const g = ac.createGain(); g.gain.setValueAtTime(0.55 * vol, t);
    if (mute) g.gain.setTargetAtTime(0.0001, t + 0.01, 0.025);
    const tone = ac.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = mute ? 900 : 5200;
    s.connect(tone); tone.connect(g); g.connect(gtrIn); s.start(t); s.stop(t + 3.2); ringing[si] = { s, g };
    s.onended = () => { if (ringing[si] && ringing[si].s === s) ringing[si] = null; };
  }
  const near = (P) => { const [x, y, z] = G.localState(), dist = Math.hypot(x - P.x, z - P.z); return Math.abs(y - P.y) < 6 ? Math.max(0, 1 - dist / 40) ** 2 : 0; };

  // ------------------------------------------------ the panels (drums, guitar)
  const css = document.createElement('style');
  css.textContent = `
  .bandui{position:fixed;left:0;right:0;bottom:0;z-index:30;display:none;flex-direction:column;background:#141312;border-top:2px solid #ec3013;padding:6px calc(6px + env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) calc(6px + env(safe-area-inset-left));font-family:${FONT};color:#f3f2f2;touch-action:none;user-select:none;-webkit-user-select:none}
  .bandui .bar{display:flex;gap:6px;align-items:center;margin-bottom:6px}
  .bandui .bar b{flex:1;font:800 13px/1.1 ${FONT};letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bandui .bar b small{display:block;font:600 11px ${FONT};letter-spacing:.04em;color:#ff9783;text-transform:none}
  .bandui button{min-height:44px;min-width:44px;padding:0 10px;border:2px solid #f3f2f2;background:#232120;color:#f3f2f2;font:800 12px ${FONT};letter-spacing:.08em;cursor:pointer}
  .bandui button.on{background:#1f4fd8;border-color:#1f4fd8}
  #drumPads{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;height:min(40vh,250px)}
  #drumPads .pad{position:relative;border:2px solid #000;border-radius:50%/40%;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 13px ${FONT};letter-spacing:.06em;text-transform:uppercase;color:#fff;box-shadow:inset 0 -6px 0 rgba(0,0,0,.25);transition:transform .05s}
  #drumPads .pad.dark{color:#1d1c1b} #drumPads .pad small{font:600 10px ${FONT};opacity:.7;margin-top:2px}
  #drumPads .pad.wide{grid-column:1/-1;border-radius:14px}
  #drumPads .pad.dn{transform:scale(.94);filter:brightness(1.5)}
  #gtrBody{display:flex;gap:8px;height:min(40vh,250px)}
  #gtrChords{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;width:min(42%,230px)}
  #gtrChords button{min-height:0;padding:0;font:800 16px ${FONT}}
  #gtrRight{flex:1;display:flex;flex-direction:column;gap:5px;min-width:0}
  #gtrStrings{flex:1;position:relative;background:linear-gradient(90deg,#3a2418,#4a2e1d 60%,#3a2418);border:2px solid #000;border-radius:8px;overflow:hidden}
  #gtrStrings .s{position:absolute;left:0;right:0;height:16.66%;display:flex;align-items:center}
  #gtrStrings .s i{display:block;width:100%;background:linear-gradient(#fff,#bbb);box-shadow:0 1px 0 #000}
  #gtrStrings .s span{position:absolute;left:6px;font:800 10px ${FONT};color:#e9c98a;letter-spacing:.06em;text-transform:uppercase;background:#3a2418;padding:0 4px}
  #gtrStrings .s.dn i{background:#ec3013;animation:shv .12s linear 3}
  @keyframes shv{0%{transform:translateY(-1px)}50%{transform:translateY(1px)}100%{transform:translateY(0)}}
  #gtrStrum{display:flex;gap:5px} #gtrStrum button{flex:1}
  @media (orientation:landscape) and (max-height:500px){#drumPads,#gtrBody{height:44vh}}`;
  document.head.appendChild(css);
  const mk = (id, label, html) => { const d = document.createElement('div'); d.id = id; d.className = 'bandui'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', label); d.innerHTML = html; document.body.appendChild(d);
    d.addEventListener('pointerdown', e => e.stopPropagation()); d.addEventListener('touchstart', e => e.stopPropagation(), { passive: true }); return d; };
  const touch = matchMedia('(pointer:coarse)').matches;

  // ---------------- drums
  const dUI = mk('drumsUI', 'Drum kit', `<div class="bar"><b>Drum kit<small>Tap the drums · several at once</small></b><button id="drmX">✕ DONE</button></div><div id="drumPads"></div>`);
  const padsEl = dUI.querySelector('#drumPads'), padEls = new Map();
  for (const p of PADS) { const el = document.createElement('div'); el.className = 'pad' + (p.wide ? ' wide' : '') + (p.dark ? ' dark' : ''); el.style.background = `radial-gradient(circle at 50% 40%, ${p.c}, ${p.c}cc 60%, #000 140%)`;
    el.dataset.k = p.k; el.setAttribute('role', 'button'); el.setAttribute('aria-label', p.n); el.innerHTML = p.n + (touch ? '' : `<small>${p.key}</small>`); padsEl.appendChild(el); padEls.set(p.k, el); }
  function hit(k, mine = true) {
    if (mine) { drumSound(k, 1); if (net) net.event({ k: 'drm', d: k }); const el = padEls.get(k); if (el) { el.classList.add('dn'); setTimeout(() => el.classList.remove('dn'), 90); } }
    B.drums.hit(k === 'open' ? 'hihat' : k);
  }
  padsEl.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const el = e.target.closest('.pad'); if (el) hit(el.dataset.k); });
  dUI.querySelector('#drmX').onclick = () => close(true);

  // ---------------- guitar
  const gUI = mk('guitarUI', 'Electric guitar', `<div class="bar"><b>Electric guitar<small id="gtrNow"></small></b><button id="gtrDrv" aria-pressed="false">DRIVE</button><button id="gtrX">✕ DONE</button></div>
    <div id="gtrBody"><div id="gtrChords" role="group" aria-label="Chords"></div><div id="gtrRight"><div id="gtrStrings" role="group" aria-label="Strings: swipe across to strum, tap one to pick it"></div>
    <div id="gtrStrum"><button id="gtrDn" aria-label="Strum down">STRUM ▼</button><button id="gtrUp" aria-label="Strum up">STRUM ▲</button></div></div></div>`);
  const chordsEl = gUI.querySelector('#gtrChords'), strEl = gUI.querySelector('#gtrStrings'), strEls = [];
  let chord = 0;
  CHORDS.forEach(([n], i) => { const b = document.createElement('button'); b.textContent = n; b.setAttribute('aria-label', SPOKEN[n] + (touch ? '' : ' (' + (i + 1) + ')')); b.onclick = () => setChord(i); chordsEl.appendChild(b); });
  // strings drawn high E at the top, low E at the bottom (as you look down at the guitar in your lap)
  for (let r = 0; r < 6; r++) { const si = 5 - r, d = document.createElement('div'); d.className = 's'; d.style.top = (r * 16.66) + '%'; d.dataset.s = si;
    d.innerHTML = `<i style="height:${1 + (5 - r) * 0.5 + 1}px"></i><span>${STR_NAMES[si]}</span>`; d.setAttribute('role', 'button'); d.setAttribute('aria-label', STR_NAMES[si] + ' string'); strEl.appendChild(d); strEls[si] = d; }
  function setChord(i) { chord = i; [...chordsEl.children].forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', String(j === i)); }); gUI.querySelector('#gtrNow').textContent = 'Chord: ' + CHORDS[i][0] + ' · swipe the strings to strum'; }
  function noteOf(si) { const fr = CHORDS[chord][1][si]; return fr < 0 ? { m: OPEN[si], mute: true } : { m: OPEN[si] + fr, mute: false }; }
  function pick(si, delay = 0, mine = true) {
    const n = noteOf(si); pluck(si, n.m, 1, n.mute, delay); B.guitar.pluck(si);
    if (mine) { if (net) net.event({ k: 'gtr', s: si, m: n.m, x: n.mute ? 1 : 0 }); const el = strEls[si]; el.classList.remove('dn'); void el.offsetWidth; el.classList.add('dn'); }
  }
  function strum(down) { for (let i = 0; i < 6; i++) { const si = down ? i : 5 - i; pick(si, i * 0.012); } }
  // swipe: a finger playing every string it crosses
  const fingers = new Map();
  const strAt = (y) => { const r = strEl.getBoundingClientRect(); const row = Math.floor((y - r.top) / r.height * 6); return row < 0 || row > 5 ? null : 5 - row; };
  strEl.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { strEl.setPointerCapture(e.pointerId); } catch (er) {} const s = strAt(e.clientY); fingers.set(e.pointerId, s); if (s != null) pick(s); });
  strEl.addEventListener('pointermove', e => { if (!fingers.has(e.pointerId)) return; e.preventDefault(); const s = strAt(e.clientY), old = fingers.get(e.pointerId); if (s == null || s === old) return;
    if (old != null) { const step = s > old ? 1 : -1; for (let q = old + step; q !== s + step; q += step) pick(q); } else pick(s); fingers.set(e.pointerId, s); });
  const lift = e => fingers.delete(e.pointerId); strEl.addEventListener('pointerup', lift); strEl.addEventListener('pointercancel', lift);
  gUI.querySelector('#gtrDn').onclick = () => strum(true); gUI.querySelector('#gtrUp').onclick = () => strum(false);
  const drvB = gUI.querySelector('#gtrDrv'); drvB.onclick = () => { setDrive(!drive); drvB.classList.toggle('on', drive); drvB.setAttribute('aria-pressed', String(drive)); announce(drive ? 'Drive on: the amp is turned up' : 'Clean sound'); if (net) net.event({ k: 'gtd', on: drive ? 1 : 0 }); };
  gUI.querySelector('#gtrX').onclick = () => close(true);
  setChord(0);

  // ---------------- a computer keyboard
  const SKEYS = { a: 0, s: 1, d: 2, f: 3, g: 4, h: 5 };
  const onKey = e => {
    if (!which) return; const k = e.key.toLowerCase(), down = e.type === 'keydown';
    if (k === 'escape') { if (down) close(true); }
    else if (which === 'drums' && k in DKEYS) { if (down && !e.repeat) hit(DKEYS[k]); }
    else if (which === 'guitar' && /^[1-9]$/.test(k)) { if (down) { setChord(+k - 1); announce(SPOKEN[CHORDS[+k - 1][0]]); } }
    else if (which === 'guitar' && (k === ' ' || k === 'arrowdown')) { if (down && !e.repeat) strum(true); }
    else if (which === 'guitar' && k === 'arrowup') { if (down && !e.repeat) strum(false); }
    else if (which === 'guitar' && k in SKEYS) { if (down && !e.repeat) pick(SKEYS[k]); }
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true);

  // ------------------------------------------------ open / close
  let which = null, guard = null;
  function open(w) {
    if (which) close(false); audio(); G.campus.playAt(w); which = w;
    if (w === 'guitar') { G.campus.holdGuitar(true); gUI.style.display = 'flex'; announce('You have the guitar. Pick a chord on the left, then swipe across the strings to strum, or tap Strum. Tap Done to put it back.'); }
    else { dUI.style.display = 'flex'; announce('You are at the drums. Tap the drums to play: kick, snare, hi-hat, toms and cymbals. Everyone nearby can hear you. Tap Done to stand up.'); }
    clearInterval(guard); guard = setInterval(() => { if (which && G.sitting && !G.sitting()) close(false); }, 400);   // (got up some other way)
  }
  function close(stand) {
    if (!which) return; const w = which; which = null; clearInterval(guard); fingers.clear();
    dUI.style.display = gUI.style.display = 'none';
    if (w === 'guitar') G.campus.holdGuitar(false);
    if (stand && G.campus.standUp) G.campus.standUp();
  }
  // other people playing
  const heard = new Set();
  function onEvent(id, d) {
    if (!d) return;
    if (d.k === 'drm' && typeof d.d === 'string' && PADS.some(p => p.k === d.d)) { const v = near(B.drums); drumSound(d.d, v); B.drums.hit(d.d === 'open' ? 'hihat' : d.d); if (v > 0.2 && !heard.has(id + 'd')) { heard.add(id + 'd'); announce(nameOf(id) + ' is playing the drums'); } }
    else if (d.k === 'gtr' && Number.isFinite(d.m) && d.s >= 0 && d.s < 6) { const v = near(B.guitar), m = Math.max(28, Math.min(88, d.m | 0)); pluck(d.s | 0, m, v, !!d.x); B.guitar.pluck(d.s | 0); if (v > 0.2 && !heard.has(id + 'g')) { heard.add(id + 'g'); announce(nameOf(id) + ' is playing the guitar'); } }
    else if (d.k === 'gtd') { /* their amp setting: we keep ours (one shared amp would surprise you) */ }
  }
  return { open, close, onEvent, isOpen: () => !!which, which: () => which };
}
