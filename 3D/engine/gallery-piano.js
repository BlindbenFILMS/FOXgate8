// Blind Canvas gallery: the Academy of Music's grand piano, playable (5 Oct).
// Walk up to the piano in the AMB building: ACTION "PLAY PIANO" sits your fox at the bench and opens a keyboard along the bottom of
// the screen. Touch the keys (several at once, and slide along them for a glissando), or on a computer play with the keyboard
// (A W S E D F T G Y H U J K O L = C to E, Z / X = octave down / up). ◀ ▶ move the keyboard an octave, PEDAL holds the notes.
// The sound is a small piano synth (no samples): a few decaying partials, a soft hammer knock, brighter when you play higher.
// Everyone in the gallery hears what you play, softer the further they are from the piano, and sees the keys go down.
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const SPOKEN = ['C', 'C sharp', 'D', 'D sharp', 'E', 'F', 'F sharp', 'G', 'G sharp', 'A', 'A sharp', 'B'];
const isBlack = m => [1, 3, 6, 8, 10].includes(m % 12);
const LO = 36, HI = 96;   // C2..C7, the piano's keys

export function setupPiano({ G, net, announce = () => {}, nameOf = () => 'Someone' }) {
  const P = G.campus && G.campus.piano; if (!P) return null;
  // ------------------------------------------------ sound
  let ac = null, master = null, pedal = false;
  const voices = new Map();   // key 'me:60' / 'id:60' -> voice
  function audio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master = ac.createGain(); master.gain.value = 0.8; master.connect(comp); comp.connect(ac.destination);
    // a little room: a short feedback delay, lowpassed
    const d = ac.createDelay(0.2), fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
    d.delayTime.value = 0.075; fb.gain.value = 0.32; lp.type = 'lowpass'; lp.frequency.value = 2400; wet.gain.value = 0.22;
    master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(comp);
    return ac;
  }
  let noiseBuf = null;
  function noteOn(key, m, vel = 0.8, gainMul = 1) {
    if (!audio() || gainMul <= 0.01) return; noteOff(key, true);
    const t = ac.currentTime, f = 440 * Math.pow(2, (m - 69) / 12), out = ac.createGain(), tone = ac.createBiquadFilter();
    tone.type = 'lowpass'; tone.Q.value = 0.4; const bright = Math.min(12000, f * (6 + vel * 8)); tone.frequency.setValueAtTime(bright, t); tone.frequency.setTargetAtTime(Math.max(f * 2, 600), t + 0.02, 0.9);
    const amp = vel * 0.28 * gainMul * (m < 48 ? 1.15 : m > 84 ? 0.75 : 1), decay = 3.2 * Math.pow(0.5, (m - 48) / 22);   // low notes ring longer
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(amp, t + 0.004); out.gain.setTargetAtTime(amp * 0.35, t + 0.01, 0.12); out.gain.setTargetAtTime(0.0001, t + 0.15, decay);
    const parts = [[1, 1, 'triangle'], [2, 0.42, 'sine'], [3, 0.2, 'sine'], [4.02, 0.1, 'sine'], [5.05, 0.05, 'sine']], oscs = [];
    for (const [h, a, type] of parts) { if (f * h > 16000) continue; const o = ac.createOscillator(), gg = ac.createGain(); o.type = type; o.frequency.value = f * h; o.detune.value = (h - 1) * 1.6;
      gg.gain.setValueAtTime(a, t); gg.gain.setTargetAtTime(a * 0.25, t + 0.02, decay / (h * 1.4)); o.connect(gg); gg.connect(tone); o.start(t); oscs.push(o); }
    // the hammer: a tiny knock of filtered noise
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 3); }
    const nz = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); nz.buffer = noiseBuf; nf.type = 'bandpass'; nf.frequency.value = Math.min(6000, f * 3); nf.Q.value = 1.2; ng.gain.value = 0.18 * vel;
    nz.connect(nf); nf.connect(ng); ng.connect(out); nz.start(t);
    tone.connect(out); out.connect(master);
    const v = { out, oscs, m, held: true, end: t + decay * 6 }; voices.set(key, v);
    for (const o of oscs) o.stop(t + Math.min(14, decay * 6));
  }
  function noteOff(key, now) {
    const v = voices.get(key); if (!v) return; v.held = false;
    if (pedal && !now) return;   // the pedal holds it: released when the pedal comes up
    const t = ac.currentTime; v.out.gain.cancelScheduledValues(t); v.out.gain.setTargetAtTime(0.0001, t, now ? 0.015 : 0.09);
    for (const o of v.oscs) { try { o.stop(t + 0.6); } catch (e) {} }
    voices.delete(key);
  }
  function setPedal(on) { pedal = on; if (!on) for (const [k, v] of [...voices]) if (!v.held) noteOff(k); }

  // ------------------------------------------------ playing: mine (sound + keys + tell everyone), and other people's
  const mine = new Set();
  function play(m, on) {
    if (m < LO || m > HI) return;
    if (on) { if (mine.has(m)) return; mine.add(m); noteOn('me:' + m, m, 0.85); } else { if (!mine.has(m)) return; mine.delete(m); noteOff('me:' + m); }
    P.press(m, on); if (net) net.event({ k: 'pno', m, on: on ? 1 : 0, p: pedal ? 1 : 0 });
    const el = keyEls.get(m); if (el) el.classList.toggle('dn', on);
  }
  let heardFrom = new Set();
  function onEvent(id, d) {
    if (!d || d.k !== 'pno' || !Number.isFinite(d.m)) return; const m = d.m | 0; if (m < LO || m > HI) return;
    P.press(m, !!d.on);
    const [x, y, z] = G.localState(), dist = Math.hypot(x - P.x, z - P.z), sameFloor = Math.abs(y - P.y) < 6;
    const vol = sameFloor ? Math.max(0, 1 - dist / 40) : 0;
    if (d.on) { noteOn(id + ':' + m, m, 0.8, vol * vol); if (!heardFrom.has(id) && vol > 0.2) { heardFrom.add(id); announce(nameOf(id) + ' is playing the piano'); } }
    else { const v = voices.get(id + ':' + m); if (v && d.p) v.held = false; else noteOff(id + ':' + m); }
  }

  // ------------------------------------------------ the keyboard on screen
  const css = document.createElement('style');
  css.textContent = `
  #piano{position:fixed;left:0;right:0;bottom:0;z-index:30;display:none;flex-direction:column;background:#141312;border-top:2px solid #ec3013;padding:6px calc(6px + env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) calc(6px + env(safe-area-inset-left));font-family:${FONT};color:#f3f2f2;touch-action:none;user-select:none;-webkit-user-select:none}
  #piano .bar{display:flex;gap:6px;align-items:center;margin-bottom:6px}
  #piano .bar b{flex:1;font:800 13px/1.1 ${FONT};letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #piano .bar b small{display:block;font:600 11px ${FONT};letter-spacing:.04em;color:#ff9783;text-transform:none}
  #piano button{min-height:44px;min-width:44px;padding:0 10px;border:2px solid #f3f2f2;background:#232120;color:#f3f2f2;font:800 12px ${FONT};letter-spacing:.08em;cursor:pointer}
  #piano button.on{background:#1f4fd8;border-color:#1f4fd8}
  #piano .keys{position:relative;height:min(38vh,230px);display:flex}
  #piano .w{flex:1;position:relative;background:linear-gradient(#fbfaf6,#e9e5dc);border:1px solid #1d1c1b;border-radius:0 0 6px 6px;margin-right:2px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;font:800 11px ${FONT};color:#8f877a}
  #piano .w.c{color:#ec3013}
  #piano .b{position:absolute;top:0;height:60%;background:linear-gradient(#2b2a29,#0c0c0c);border:1px solid #000;border-radius:0 0 4px 4px;z-index:2}
  #piano .w.dn{background:linear-gradient(#ffd9cf,#ffb8a6)} #piano .b.dn{background:linear-gradient(#ec3013,#8e1c24)}
  @media (orientation:landscape) and (max-height:500px){#piano .keys{height:40vh}}`;
  document.head.appendChild(css);
  const ui = document.createElement('div'); ui.id = 'piano'; ui.setAttribute('role', 'dialog'); ui.setAttribute('aria-label', 'Piano keyboard');
  ui.innerHTML = `<div class="bar"><b>Grand piano<small id="pnoRange"></small></b><button id="pnoDn" aria-label="Octave down">◀</button><button id="pnoUp" aria-label="Octave up">▶</button><button id="pnoPed" aria-pressed="false">PEDAL</button><button id="pnoX">✕ DONE</button></div><div class="keys" id="pnoKeys"></div>`;
  document.body.appendChild(ui);
  const keysEl = ui.querySelector('#pnoKeys'), keyEls = new Map();
  let base = 60;   // the lowest C shown
  function whiteCount() { const w = keysEl.clientWidth || innerWidth - 12; return Math.max(8, Math.min(22, Math.floor(w / 44))); }
  function build() {
    keysEl.replaceChildren(); keyEls.clear();
    const n = whiteCount(); let m = base, whites = [];
    while (whites.length < n && m <= HI) { if (!isBlack(m)) whites.push(m); m++; }
    if (whites.length < n) { base = Math.max(LO, base - 12); return build(); }
    const top = whites[whites.length - 1], W = 100 / whites.length;
    whites.forEach(m => { const k = document.createElement('div'); k.className = 'w' + (m % 12 === 0 ? ' c' : ''); k.dataset.m = m; k.setAttribute('role', 'button'); k.setAttribute('aria-label', SPOKEN[m % 12] + ' ' + (Math.floor(m / 12) - 1)); if (m % 12 === 0) k.textContent = 'C' + (Math.floor(m / 12) - 1); keysEl.appendChild(k); keyEls.set(m, k); });
    whites.forEach((m, i) => { const b = m + 1; if (b > top || !isBlack(b)) return; const k = document.createElement('div'); k.className = 'b'; k.dataset.m = b; k.style.left = `calc(${(i + 1) * W}% - ${W * 0.3}%)`; k.style.width = W * 0.6 + '%'; k.setAttribute('role', 'button'); k.setAttribute('aria-label', SPOKEN[b % 12] + ' ' + (Math.floor(b / 12) - 1)); keysEl.appendChild(k); keyEls.set(b, k); });
    ui.querySelector('#pnoRange').textContent = NAMES[whites[0] % 12] + (Math.floor(whites[0] / 12) - 1) + ' – ' + NAMES[top % 12] + (Math.floor(top / 12) - 1) + ' · slide along the keys';
    for (const mm of mine) { const el = keyEls.get(mm); if (el) el.classList.add('dn'); }
  }
  // touch / mouse: each finger plays the key under it, and slides to the next
  const fingers = new Map();
  const keyAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.dataset && el.dataset.m && keysEl.contains(el) ? +el.dataset.m : null; };
  keysEl.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { keysEl.setPointerCapture(e.pointerId); } catch (er) {} const m = keyAt(e.clientX, e.clientY); fingers.set(e.pointerId, m); if (m != null) play(m, true); });
  keysEl.addEventListener('pointermove', e => { if (!fingers.has(e.pointerId)) return; e.preventDefault(); const m = keyAt(e.clientX, e.clientY), old = fingers.get(e.pointerId); if (m === old) return; fingers.set(e.pointerId, m); if (old != null && ![...fingers.values()].includes(old)) play(old, false); if (m != null) play(m, true); });
  const lift = e => { if (!fingers.has(e.pointerId)) return; const old = fingers.get(e.pointerId); fingers.delete(e.pointerId); if (old != null && ![...fingers.values()].includes(old)) play(old, false); };
  keysEl.addEventListener('pointerup', lift); keysEl.addEventListener('pointercancel', lift); keysEl.addEventListener('lostpointercapture', lift);
  ui.addEventListener('pointerdown', e => e.stopPropagation()); ui.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  ui.querySelector('#pnoDn').onclick = () => { base = Math.max(LO, base - 12); build(); announce('Octave down'); };
  ui.querySelector('#pnoUp').onclick = () => { base = Math.min(HI - 12, base + 12); build(); announce('Octave up'); };
  const pedB = ui.querySelector('#pnoPed'); pedB.onclick = () => { setPedal(!pedal); pedB.classList.toggle('on', pedal); pedB.setAttribute('aria-pressed', String(pedal)); announce(pedal ? 'Pedal down' : 'Pedal up'); };
  ui.querySelector('#pnoX').onclick = () => close(true);
  // a computer keyboard: two rows like a piano (A=C, W=C#, S=D ...), Z/X octaves, space = pedal
  const KMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ';': 16 };
  const onKey = e => {
    if (!open) return; const k = e.key.toLowerCase();
    if (k === 'escape') { if (e.type === 'keydown') close(true); }
    else if (k in KMAP) { if (!e.repeat) play(base + KMAP[k], e.type === 'keydown'); }
    else if (e.type === 'keydown' && (k === 'z' || k === 'x')) { base = Math.max(LO, Math.min(HI - 12, base + (k === 'z' ? -12 : 12))); build(); }
    else if (e.type === 'keydown' && k === ' ') { pedB.click(); }
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true);
  let open = false;
  function show() {
    audio(); G.campus.playPiano(); open = true; ui.style.display = 'flex'; build();
    announce('You are at the piano. Touch the keys to play; everyone nearby can hear you. Tap Done to stand up.');
  }
  function close(stand) {
    if (!open) return; open = false; ui.style.display = 'none';
    for (const m of [...mine]) play(m, false); fingers.clear(); if (pedal) pedB.click();
    if (stand && G.campus.standUp) G.campus.standUp();
  }
  addEventListener('resize', () => { if (open) build(); });
  return { open: show, close, onEvent, isOpen: () => open };
}
