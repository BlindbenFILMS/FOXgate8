import { zoneSong } from './meru2-music.js?v=s654';   // s150l: unique procedural music per zone
// MERU 2.0 — step 8: the SPATIAL AUDIO layer + the hooks Ben's voice script plugs into. Rules: SOUND_LAYOUT_RULES.md. How to hook: AUDIO_HOOKS.md.
// · LISTENER on the player, facing where the camera looks (rule: listener sits on the player, stable follow distance).
// · ZONE MUSIC: one track per zone music key, 2.8 s crossfade, busy zones trimmed to 45 %, ducked 50 % under a voice, dropped indoors.
//   A file in MERU/audio/manifest.json "music" wins; until then a soft synth pad per key (placeholder).
// · ROOMS (one table, BUILDINGS + their rooms): every room has a bed (file in the manifest "rooms", else synth murmur for busy rooms,
//   room tone for the rest). Inside = full level, dry or with the room's named reverb. Outside it LEAKS from each door: 55 % at the
//   threshold, half that at 6.8 m, silent at 11 m, low-passed. Voices are gated on the room: you hear a room's speakers only inside it.
// · VOICES: speakers from L.SPEAKERS (key, tier, place). ONE greeting at a time: 7 m outdoors, 5.5 m indoors, 20 s rest per fox.
//   A clip in the manifest "voice"[key].greet plays through a 3D panner at the fox; until then a short placeholder murmur (1.2-3.6 s).
//   say(key, url) = play any line through the same panner (the dialogue system calls it per line), returns a promise that ends with it.
// · LOOPS already recorded: the Monk's sermon at the fountain (MERU/audio/monk-sermon.mp3), the two fish-talk and bowling-talk pairs.
export function audioKit({ L, getCtx, muted = () => false, manifestUrl = 'MERU/audio/manifest.json' }) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let man = { music: {}, rooms: {}, voice: {} }; fetch(new URL(manifestUrl, document.baseURI)).then(r => r.ok ? r.json() : null).then(j => { if (j) man = { music: j.music || {}, rooms: j.rooms || {}, voice: j.voice || {} }; }).catch(() => {});
  let A = null;   // the graph, built on the first tick that has a context
  const ROOMS = [], RB = {};   // one room table: key, label, centre, w, d, doors (outward points), floor, reverb, busy
  for (const b of L.BUILDINGS) { if (!b.room || !b.f) continue; const cx = (b.f[0] + b.f[1]) / 2, cz = (b.f[2] + b.f[3]) / 2, F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
    const doors = [[b.door, b.face], ...(b.door2 ? [[b.door2, b.face2]] : [])].filter(q => q[0]).map(([p, f]) => [p[0] + F[f][0] * 1.4, p[1] + F[f][1] * 1.4]);
    const R = { key: b.key, label: b.label, cx, cz, w: b.room.w, d: b.room.d, floor: b.room.floor, reverb: b.reverb || null, busy: !!b.busy, doors }; ROOMS.push(R); RB[b.key] = R;
    for (const r of b.rooms || []) { const Q = { key: r.key, label: r.key, cx: r.at[0], cz: r.at[1], w: r.w, d: r.d, floor: r.floor, reverb: r.reverb || null, busy: false, doors: [], inside: b.key }; ROOMS.push(Q); RB[r.key] = Q; } }
  function roomAt(insideKey, x, z) { if (!insideKey) return null; for (const R of ROOMS) if (R.inside === insideKey && Math.abs(x - R.cx) < R.w / 2 && Math.abs(z - R.cz) < R.d / 2) return R.key; return insideKey; }
  const SPK = L.SPEAKERS.filter(s => s.tier < 3).map(s => { if (Array.isArray(s.at)) return { s, x: s.at[0], z: s.at[1], room: null };
    const R = RB[s.at.room]; return R ? { s, x: R.cx + s.at.x, z: R.cz + s.at.z, room: s.at.room } : { s, x: 0, z: 0, room: s.at.room, mobile: true }; });
  const irLen = name => !name ? 0 : /cave/.test(name) ? 3.2 : /little/.test(name) ? 0.9 : /hall|stone|station/.test(name) ? 1.8 : 1.2;
  function build(c) { const master = c.createGain(), music = c.createGain(), amb = c.createGain(), voice = c.createGain(); master.connect(c.destination); for (const g of [music, amb, voice]) g.connect(master); music.gain.value = 1; amb.gain.value = 1; voice.gain.value = 1;
    const verbs = {}; const verb = name => { const n = irLen(name); if (!n) return null; if (verbs[n]) return verbs[n]; const len = Math.floor(c.sampleRate * n), ir = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); } const cv = c.createConvolver(); cv.buffer = ir; const wet = c.createGain(); wet.gain.value = 0.28; cv.connect(wet); wet.connect(master); return (verbs[n] = cv); };
    const noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); { const d = noise.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; } }
    return { c, master, music, amb, voice, verb, noise, tracks: {}, beds: {}, loops: [], cur: null }; }
  const pan = (c, x, y, z, ref = 2, max = 30) => { const p = c.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref; p.maxDistance = max; p.rolloffFactor = 1.2; if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z); return p; };
  const media = (url, loop) => { const el = new Audio(); el.src = new URL(url, document.baseURI).href; el.loop = !!loop; el.crossOrigin = 'anonymous'; el.preload = 'auto'; return el; };

  // ---------- music: per zone key; file from the manifest, else a synth pad ----------
  const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  function track(key) { const T = A.tracks[key]; if (T) return T; const c = A.c, g = c.createGain(); g.gain.value = 0; g.connect(A.music); const t = { g, nodes: [], el: null, idle: 0 };
    if (man.music[key]) { t.el = media(man.music[key], true); const src = c.createMediaElementSource(t.el); src.connect(g); t.el.play().catch(() => {}); }
    else if (/arena/i.test(key)) { party(c, g, t); }
    else if (zoneSong(c, g, t, key)) { /* s150l: an original song per zone (worlds/meru2-music.js) */ }   // s102 (Ben: "a strange background hum" + "REALLY FUN HIFI music"): the Arena Path + Arena play an original party track
    else if (DRONE) { const h = hash(key), root = 45 + (h % 10), minor = (h >> 4) & 1, notes = [0, minor ? 3 : 4, 7, 12 + ((h >> 6) % 2 ? 2 : 0)], lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700 + (h % 5) * 160; lp.connect(g);
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07 + (h % 7) * 0.01; lg.gain.value = 220; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); t.nodes.push(lfo);
      notes.forEach((n, i) => { const o = c.createOscillator(), og = c.createGain(); o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.value = 440 * Math.pow(2, (root + n - 69) / 12); o.detune.value = (i - 1.5) * 6; og.gain.value = i === 0 ? 0.05 : 0.022; o.connect(og); og.connect(lp); o.start(); t.nodes.push(o); }); }
    return (A.tracks[key] = t); }
  // s102: the old held-chord synth pad (a constant drone = the "hum") is off; zones without a music file are quiet until Ben's tracks arrive
  const DRONE = false;
  // s102 (Ben: "REALLY FUN HIFI music"): ARENA PATH PARTY, an original upbeat festival track. 122 bpm, A major, I-V-vi-IV.
  // Hi-fi chain: no tape filter, a glue compressor, stereo hats + chords, a ping delay on the lead. Four-on-the-floor kick, layered claps, offbeat open hats,
  // 16th shaker, a bouncing octave slap bass, offbeat chord stabs (side-chain pumped by the kick), a catchy square-saw lead hook with an answer phrase,
  // brass stabs at phrase ends. 16-bar form: intro 4 (no lead) · hook 8 · breakdown 2 (no kick, filtered) · build 2 (snare roll + riser) · again.
  function party(c, out, t) { const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.008; comp.release.value = 0.18; const bus = c.createGain(); bus.gain.value = 0.62; bus.connect(comp); comp.connect(out);
    const BPM = 122, Q = 60 / BPM, BAR = Q * 4, mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const dl = c.createDelay(1), fb = c.createGain(), dwet = c.createGain(), dlp = c.createBiquadFilter(); dl.delayTime.value = Q * 0.75; fb.gain.value = 0.28; dwet.gain.value = 0.22; dlp.type = 'lowpass'; dlp.frequency.value = 3200; dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(dwet); dwet.connect(bus);
    const chordBus = c.createGain(); chordBus.gain.value = 1; chordBus.connect(bus); const pump = tt => { chordBus.gain.cancelScheduledValues(tt); chordBus.gain.setValueAtTime(0.35, tt); chordBus.gain.linearRampToValueAtTime(1, tt + Q * 0.6); };
    const brk = c.createBiquadFilter(); brk.type = 'lowpass'; brk.frequency.value = 18000; brk.connect(bus); const leadBus = c.createGain(); leadBus.gain.value = 1; leadBus.connect(brk); leadBus.connect(dl);
    const env = (gn, tt, a, d, peak) => { gn.gain.setValueAtTime(0.0001, tt); gn.gain.exponentialRampToValueAtTime(peak, tt + a); gn.gain.exponentialRampToValueAtTime(0.0001, tt + d); };
    const panner = (v, dest) => { const p = c.createStereoPanner ? c.createStereoPanner() : null; if (!p) return dest; p.pan.value = v; p.connect(dest); return p; };
    const noiseHit = (tt, type, f, peak, d, q, pan = 0, dest = bus) => { const s2 = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain(); s2.buffer = A.noise; fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; env(gn, tt, 0.002, d, peak); s2.connect(fl); fl.connect(gn); gn.connect(panner(pan, dest)); s2.start(tt, Math.random()); s2.stop(tt + d + 0.05); };
    const kick = tt => { const o = c.createOscillator(), gn = c.createGain(); o.frequency.setValueAtTime(150, tt); o.frequency.exponentialRampToValueAtTime(48, tt + 0.12); env(gn, tt, 0.003, 0.32, 0.55); o.connect(gn); gn.connect(bus); o.start(tt); o.stop(tt + 0.4); noiseHit(tt, 'highpass', 3000, 0.05, 0.015); pump(tt); };
    const clap = tt => { for (let k = 0; k < 3; k++) noiseHit(tt + k * 0.011, 'bandpass', 1500, k === 2 ? 0.2 : 0.12, k === 2 ? 0.16 : 0.03, 1.1); noiseHit(tt, 'highpass', 6000, 0.04, 0.08); };
    const ohat = (tt, pan) => noiseHit(tt, 'highpass', 7600, 0.07, 0.12, 0, pan);
    const shaker = (tt, v) => noiseHit(tt, 'bandpass', 9500, 0.022 * v, 0.04, 1.4, 0.35);
    const snare = (tt, v = 1) => { noiseHit(tt, 'bandpass', 2200, 0.13 * v, 0.12, 0.8); const o = c.createOscillator(), gn = c.createGain(); o.type = 'triangle'; o.frequency.value = 210; env(gn, tt, 0.002, 0.08, 0.06 * v); o.connect(gn); gn.connect(bus); o.start(tt); o.stop(tt + 0.1); };
    const bass = (tt, m, d) => { const o = c.createOscillator(), o2 = c.createOscillator(), fl = c.createBiquadFilter(), gn = c.createGain(); o.type = 'square'; o2.type = 'sine'; o.frequency.value = o2.frequency.value = mtof(m); fl.type = 'lowpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(1400, tt); fl.frequency.exponentialRampToValueAtTime(260, tt + d); env(gn, tt, 0.004, d, 0.13); const g2 = c.createGain(); g2.gain.value = 1.6; o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(gn); gn.connect(bus); o.start(tt); o2.start(tt); o.stop(tt + d + 0.05); o2.stop(tt + d + 0.05); };
    const stab = (tt, notes, d, v = 1) => notes.forEach((m, k) => { const o = c.createOscillator(), o2 = c.createOscillator(), fl = c.createBiquadFilter(), gn = c.createGain(); o.type = 'triangle'; o2.type = 'square'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 1.003; fl.type = 'lowpass'; fl.frequency.value = 3200; env(gn, tt, 0.004, d, 0.035 * v); const g2 = c.createGain(); g2.gain.value = 0.25; o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(gn); gn.connect(panner(k % 2 ? 0.3 : -0.3, chordBus)); o.start(tt); o2.start(tt); o.stop(tt + d + 0.05); o2.stop(tt + d + 0.05); });
    const lead = (tt, m, d) => { const f = mtof(m), o = c.createOscillator(), o2 = c.createOscillator(), vib = c.createOscillator(), vg = c.createGain(), fl = c.createBiquadFilter(), gn = c.createGain(); o.type = 'square'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f; o2.detune.value = 9; vib.frequency.value = 5.6; vg.gain.value = d > Q * 0.7 ? 7 : 0; vib.connect(vg); vg.connect(o.detune); vg.connect(o2.detune); fl.type = 'lowpass'; fl.frequency.setValueAtTime(5200, tt); fl.frequency.exponentialRampToValueAtTime(2200, tt + d); gn.gain.setValueAtTime(0.0001, tt); gn.gain.exponentialRampToValueAtTime(0.06, tt + 0.012); gn.gain.setValueAtTime(0.06, tt + Math.max(0.02, d - 0.05)); gn.gain.exponentialRampToValueAtTime(0.0001, tt + d + 0.04); const mx = c.createGain(); mx.gain.value = 0.5; o.connect(fl); o2.connect(mx); mx.connect(fl); fl.connect(gn); gn.connect(leadBus); for (const x of [o, o2, vib]) { x.start(tt); x.stop(tt + d + 0.08); } };
    const brass = (tt, notes, d) => notes.forEach(m => { const o = c.createOscillator(), fl = c.createBiquadFilter(), gn = c.createGain(); o.type = 'sawtooth'; o.frequency.value = mtof(m); fl.type = 'lowpass'; fl.frequency.setValueAtTime(600, tt); fl.frequency.exponentialRampToValueAtTime(4200, tt + 0.06); fl.frequency.exponentialRampToValueAtTime(1200, tt + d); env(gn, tt, 0.02, d, 0.05); o.connect(fl); fl.connect(gn); gn.connect(bus); o.start(tt); o.stop(tt + d + 0.05); });
    const riser = (tt, d) => { const s2 = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain(); s2.buffer = A.noise; s2.loop = true; fl.type = 'bandpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(600, tt); fl.frequency.exponentialRampToValueAtTime(7000, tt + d); gn.gain.setValueAtTime(0.0001, tt); gn.gain.exponentialRampToValueAtTime(0.09, tt + d); gn.gain.exponentialRampToValueAtTime(0.0001, tt + d + 0.05); s2.connect(fl); fl.connect(gn); gn.connect(panner(0, bus)); s2.start(tt); s2.stop(tt + d + 0.1); };
    const CH = [[45, [69, 73, 76]], [40, [68, 71, 76]], [42, [69, 73, 78]], [38, [69, 74, 78]]];
    const HOOK = [[[0, 76, .5], [.5, 73, .5], [1, 76, .5], [1.5, 78, .5], [2, 81, 1], [3.5, 78, .5]], [[0, 80, .5], [.5, 76, .5], [1, 73, 1], [2.5, 71, .5], [3, 73, 1]],
      [[0, 73, .5], [.5, 76, .5], [1, 78, .5], [1.5, 81, .5], [2, 83, .75], [3, 81, .5], [3.5, 78, .5]], [[0, 78, 1], [1, 76, .5], [1.5, 74, .5], [2, 73, 1.5], [3.5, 71, .5]]];
    const ANSWER = [[0, 78, .5], [.5, 81, .5], [1, 85, 1], [2.5, 83, .5], [3, 81, 1]];
    let bar = 0, next = c.currentTime + 0.15;
    const sched = () => { if (t.dead) return; while (next < c.currentTime + 1.4) { const tt = next, sec = bar % 16, [root, tri] = CH[bar % 4], intro = sec < 4, brkd = sec === 12 || sec === 13, build = sec >= 14;
        brk.frequency.setValueAtTime(brkd ? 1400 : 18000, tt);
        if (!brkd) { for (let k = 0; k < 4; k++) if (!(build && sec === 15 && k === 3)) kick(tt + k * Q); }
        if (!brkd && !build) { clap(tt + Q); clap(tt + Q * 3); for (let k = 0; k < 4; k++) ohat(tt + k * Q + Q / 2, k % 2 ? 0.4 : -0.4); }
        for (let k = 0; k < 16; k++) shaker(tt + k * Q / 4, k % 4 === 2 ? 1 : k % 2 ? 0.5 : 0.75);
        if (build) { const n = sec === 14 ? 8 : 16; for (let k = 0; k < n; k++) snare(tt + k * BAR / n, 0.4 + 0.6 * k / n); if (sec === 14) riser(tt, BAR * 2); }
        if (!brkd) for (let k = 0; k < 8; k++) bass(tt + k * Q / 2, root + (k % 2 ? 12 : 0) + (k === 7 ? 7 : 0), Q * 0.42);
        for (let k = 0; k < 4; k++) stab(tt + k * Q + Q / 2, tri, Q * 0.38, brkd ? 0.8 : 1);
        if (brkd) stab(tt, tri.map(m => m - 12), BAR * 0.9, 0.9);
        if (!intro && !build) { const ph = (sec - 4) % 8, last = ph === 7 || sec === 13; (last ? ANSWER : HOOK[bar % 4]).forEach(([o, m, d]) => lead(tt + o * Q, m + (sec >= 8 && sec < 12 && !last ? 12 : 0) * 0, d * Q)); }
        if (sec === 3 || sec === 11) brass(tt + Q * 3, [64, 69, 73], Q * 0.5), brass(tt + Q * 3.5, [66, 71, 74], Q * 0.9);
        bar++; next += BAR; } };
    sched(); t.timer = setInterval(sched, 200); }
  function killTrack(key) { const t = A.tracks[key]; if (!t) return; t.dead = true; clearInterval(t.timer); for (const n of t.nodes) try { n.stop(); } catch (e) {} if (t.el) t.el.pause(); t.g.disconnect(); delete A.tracks[key]; }

  // ---------- room beds: inside full, leak out of the doors ----------
  function bed(R) { const B = A.beds[R.key]; if (B) return B; const c = A.c, g = c.createGain(), lp = c.createBiquadFilter(); g.gain.value = 0; lp.type = 'lowpass'; lp.frequency.value = 900; g.connect(lp); lp.connect(A.amb); const b = { g, lp, nodes: [], el: null, send: null };
    const v = A.verb(R.reverb); if (v) { const s = c.createGain(); s.gain.value = 0; g.connect(s); s.connect(v); b.send = s; }
    if (man.rooms[R.key]) { b.el = media(man.rooms[R.key], true); c.createMediaElementSource(b.el).connect(g); b.el.play().catch(() => {}); }
    else if (/casino/i.test(R.key + ' ' + (R.label || ''))) { lp.frequency.value = 9000; lounge(c, g, b); }   // s101 (Ben): CASINO MUSIC: an original lo-fi casino bed
    // s101 (Ben: "a weird whooshing sound playing always"): the synth murmur / room-tone noise beds are gone; rooms without a recorded bed are quiet
    return (A.beds[R.key] = b); }
  // s101c (Ben: "polish the casino music, think LOFI casino music"): an original lo-fi hip-hop bed with a casino wink. 78 bpm, lazy swung 16ths.
  // Everything runs through one warm TAPE chain (low-pass 3.4 kHz + gentle wow/flutter on every pitch) with vinyl crackle (clicks only, no hiss).
  // Dusty kick/snare (snare laid back), soft swung hats, a round sub bass, Rhodes chords (tremolo, 9ths and 13ths) on 1 and a late push,
  // a music-box motif every other bar, and the casino in the distance: a chip clink now and then, a soft slot "ding-ding" every 16 bars.
  function lounge(c, out, b) { const tape = c.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3400; tape.Q.value = 0.4; const bus = c.createGain(); bus.gain.value = 0.7; bus.connect(tape); tape.connect(out);
    const wow = c.createOscillator(), wg = c.createGain(); wow.frequency.value = 0.55; wg.gain.value = 9; wow.connect(wg); wow.start(); b.nodes.push(wow);   // tape wow on every oscillator's detune
    const BPM = 78, Q = 60 / BPM, BAR = Q * 4, S16 = Q / 4, SW = 0.16 * Q, late = 0.028, mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    // s101d (Ben: "a strange background rattle"): the vinyl crackle is gone
    // polish: a soft feedback delay (dub echo) for the Rhodes + bells, and the kick ducks the chords a touch (pump)
    const dl = c.createDelay(1), fb = c.createGain(), wet = c.createGain(), dlp = c.createBiquadFilter(); dl.delayTime.value = Q * 0.75; fb.gain.value = 0.32; wet.gain.value = 0.32; dlp.type = 'lowpass'; dlp.frequency.value = 1800; dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(wet); wet.connect(tape);
    const keysBus = c.createGain(); keysBus.gain.value = 1; keysBus.connect(bus); keysBus.connect(dl);
    const duck = t => { keysBus.gain.cancelScheduledValues(t); keysBus.gain.setValueAtTime(0.62, t); keysBus.gain.linearRampToValueAtTime(1, t + Q * 0.55); };
    const env = (gn, t, a, d, peak) => { gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + d); };
    const osc = (type, f, t, d) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; wg.connect(o.detune); o.start(t); o.stop(t + d + 0.1); o.onended = () => { try { wg.disconnect(o.detune); } catch (e) {} }; return o; };
    const hit = (t, type, hp, peak, d, q) => { const s = c.createBufferSource(), f = c.createBiquadFilter(), gn = c.createGain(); s.buffer = A.noise; f.type = type; f.frequency.value = hp; if (q) f.Q.value = q; env(gn, t, 0.002, d, peak); s.connect(f); f.connect(gn); gn.connect(bus); s.start(t, Math.random()); s.stop(t + d + 0.05); };
    const kick = (t, v = 1) => { const o = osc('sine', 110, t, 0.34), gn = c.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.16); env(gn, t, 0.004, 0.36, 0.34 * v); o.connect(gn); gn.connect(bus); hit(t, 'lowpass', 900, 0.05 * v, 0.03); duck(t); };   // softer, rounder, with a felt-beater click
    const snare = t => { hit(t, 'bandpass', 1900, 0.16, 0.2, 0.9); hit(t, 'highpass', 5200, 0.05, 0.12); const o = osc('triangle', 190, t, 0.1), gn = c.createGain(); env(gn, t, 0.002, 0.09, 0.06); o.connect(gn); gn.connect(bus); };
    const sub = (t, m, d) => { const o = osc('sine', mtof(m), t, d), gn = c.createGain(); env(gn, t, 0.02, d, 0.2); o.connect(gn); gn.connect(bus); };
    const rhodes = (t, notes, d, v = 1) => notes.forEach((m, k) => { const tt = t + k * 0.012, o = osc('sine', mtof(m), tt, d), o2 = osc('triangle', mtof(m) * 2, tt, d * 0.5), gn = c.createGain(), g2 = c.createGain(), tr = c.createOscillator(), tg = c.createGain();
      tr.frequency.value = 4.2; tg.gain.value = 0.25; tr.connect(tg); const am = c.createGain(); am.gain.value = 1; tg.connect(am.gain); tr.start(tt); tr.stop(tt + d + 0.1);
      env(gn, tt, 0.008, d, 0.04 * v); env(g2, tt, 0.004, d * 0.4, 0.009 * v); o.connect(gn); o2.connect(g2); gn.connect(am); g2.connect(am); am.connect(keysBus); });
    const bell = (t, m, d) => { const o = osc('sine', mtof(m), t, d), o2 = osc('sine', mtof(m) * 4.01, t, d * 0.3), gn = c.createGain(), g2 = c.createGain(); env(gn, t, 0.003, d, 0.04); env(g2, t, 0.002, d * 0.3, 0.008); o.connect(gn); o2.connect(g2); gn.connect(keysBus); g2.connect(keysBus); };
    const clink = t => { for (const f of [3100, 4300]) { const o = osc('triangle', f + Math.random() * 200, t, 0.05), gn = c.createGain(); env(gn, t, 0.001, 0.05, 0.012); o.connect(gn); gn.connect(bus); t += 0.06; } };
    // original changes: Dm9 · G13 · Cmaj9 · Am9 · Dm9 · G13 · Em7 · A7(b13) (voiced root-less, Rhodes style)
    const PROG = [[38, [3, 7, 10, 14]], [31, [4, 9, 10, 16]], [36, [4, 7, 11, 14]], [33, [3, 7, 10, 14]], [38, [3, 7, 10, 14]], [31, [4, 9, 10, 16]], [40, [3, 7, 10, 14]], [33, [4, 8, 10, 13]]];
    const PENTA = [62, 64, 67, 69, 72, 74, 76];
    let bar = 0, next = c.currentTime + 0.2;
    const sched = () => { if (b.dead) return; while (next < c.currentTime + 1.4) { const t = next, [root, iv] = PROG[bar % PROG.length], [nr] = PROG[(bar + 1) % PROG.length], drop = bar % 16 === 15;
        // drums (the last bar of every 16 drops out: just Rhodes + the record)
        if (!drop) { kick(t); kick(t + Q * 1.5 + SW, 0.7); kick(t + Q * 2.5 + SW, 0.85); snare(t + Q + late); snare(t + Q * 3 + late);
          for (let k = 0; k < 8; k++) { const ht = t + k * Q / 2 + (k % 2 ? SW : 0); hit(ht, 'bandpass', 8200, k % 2 ? 0.01 : 0.017 * (0.75 + Math.random() * 0.25), 0.035, 1.2); } }   // hats: softer, shorter, no sizzle
        sub(t, root + 12, Q * 1.6); sub(t + Q * 2.5 + SW, root + 12 + (bar % 2 ? 7 : 0), Q * 1.2); if (bar % 4 === 3) sub(t + Q * 3.5 + SW, nr + 11, Q * 0.5);
        const ch = iv.map(s => root + 24 + s); rhodes(t + 0.01, ch, BAR * 0.7); rhodes(t + Q * 2.5 + SW, ch.slice(1), Q * 1.2, 0.7);
        if (bar % 2 === 0) { let k = Math.floor(Math.random() * 3); for (const off of [0.5, 1.25, 2, 3]) { if (Math.random() < 0.25) continue; k = Math.max(0, Math.min(PENTA.length - 1, k + (Math.random() < 0.5 ? 1 : -1))); bell(t + Q * off + (off % 1 ? SW : 0), PENTA[k] + 12, Q * 1.4); } }
        if (bar % 4 === 3) { const top = ch[ch.length - 1]; [[0.5, 0], [1, -2], [1.5 + 0.16, -5], [2.5, -3]].forEach(([o, s]) => bell(t + Q * o, top + 12 + s, Q * 1.6)); }   // a little answering hook
        if (Math.random() < 0.1) clink(t + Q * (Math.random() * 4)); if (bar % 16 === 8) { bell(t + Q * 3, 84, Q); bell(t + Q * 3.25, 88, Q * 1.5); }   // the casino, off in the distance
        bar++; next += BAR; } };
    sched(); b.timer = setInterval(sched, 200); }
  function killBed(k) { const b = A.beds[k]; if (!b) return; b.dead = true; clearInterval(b.timer); for (const n of b.nodes) try { n.stop(); } catch (e) {} if (b.el) b.el.pause(); b.g.disconnect(); delete A.beds[k]; }
  const leak = d => d >= 11 ? 0 : d <= 0 ? 0.55 : d < 6.8 ? 0.55 - 0.275 * d / 6.8 : 0.275 * (11 - d) / 4.2;

  // ---------- voices: one at a time, room-gated, panned at the fox ----------
  let cur = null;   // { sp, until, kind, src }
  function voiceOut(sp, y = 1.5) { const c = A.c, p = pan(c, sp.x, y, sp.z), g = c.createGain(); g.gain.value = 1; g.connect(p); p.connect(A.voice); const R = sp.room && RB[sp.room]; if (R && R.reverb) { const v = A.verb(R.reverb); if (v) { const s = c.createGain(); s.gain.value = 0.6; p.connect(s); s.connect(v); } } return g; }
  function murmur(out, dur) { const c = A.c, t0 = c.currentTime, n = Math.max(3, Math.round(dur * 4.2)); for (let i = 0; i < n; i++) { const t = t0 + i * dur / n, o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(170 + Math.random() * 70, t); o.frequency.linearRampToValueAtTime(140 + Math.random() * 60, t + dur / n * 0.8); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / n * 0.85); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur / n); } }
  function playOn(sp, url, kind) { if (!A) return Promise.resolve(); const out = voiceOut(sp); return new Promise(res => { if (url) { const el = media(url, false); A.c.createMediaElementSource(el).connect(out); el.onended = () => { if (cur && cur.el === el) cur = null; res(); }; el.onerror = () => { cur = null; res(); }; el.play().catch(() => { cur = null; res(); }); cur = { sp, kind, el, until: 1e9 }; }
    else { const dur = kind === 'greet' ? 1.2 + Math.random() * 2.4 : 3.5; murmur(out, dur); cur = { sp, kind, until: A.c.currentTime + dur }; setTimeout(res, dur * 1000); } }); }
  const lastT = {};

  // ---------- recorded loops: the Monk's sermon + the two chatter pairs ----------
  const LOOPS = [   // s150c Ben: the Monk's sermon MUTED (was { key: 'monk', at: 'monk', urls: ['MERU/audio/monk-sermon.mp3'], rest: 6, range: 26, ref: 3 })
    { key: 'fishTalk', at: 'fisherman', urls: [1, 2, 3, 4].map(i => 'MERU/audio/talk-fish' + i + '.mp3'), rest: 14, range: 20, ref: 2.5 },
    { key: 'bowlTalk', at: 'lanesRegular', urls: ['MERU/audio/talk-bowling1.mp3', 'MERU/audio/talk-bowling2.mp3'], rest: 18, range: 14, ref: 2 }];
  function loopTick(Lp, st, inRoom) { const sp = SPK.find(q => q.s.key === Lp.at); if (!sp) return; const d = Math.hypot(st.x - sp.x, st.z - sp.z), ok = d < Lp.range && (sp.room ? inRoom === sp.room : !inRoom);
    if (!ok) { if (Lp.el) { Lp.el.pause(); Lp.el = null; } return; } if (Lp.el || (Lp.wait || 0) > A.c.currentTime) return;
    const url = Lp.urls[(Lp.i = ((Lp.i ?? -1) + 1) % Lp.urls.length)], el = media(url, false), p = pan(A.c, sp.x, 1.6, sp.z, Lp.ref, 40); A.c.createMediaElementSource(el).connect(p); p.connect(A.voice); Lp.el = el;
    el.onended = () => { Lp.el = null; Lp.wait = A.c.currentTime + Lp.rest; }; el.onerror = () => { Lp.el = null; Lp.wait = A.c.currentTime + 60; }; el.play().catch(() => { Lp.el = null; Lp.wait = A.c.currentTime + 5; }); }

  // ---------- per frame ----------
  let zoneKey = null, roomKey = null, info = { music: '', room: '', voice: null, leak: '' };
  const ev = { onGreet: null, onZone: null, onRoom: null };
  let OVR = null;
  function tick(dt, st) {   // st: { x, y, z, camYaw, zone (L.ZONES entry), inside (building key | null), aboard }
    const c = getCtx(); if (!c) return info; if (!A) A = build(c); const now = c.currentTime;
    A.master.gain.setTargetAtTime(muted() ? 0 : 1, now, 0.05); A.music.gain.setTargetAtTime(OVR ? OVR.music : 1, now, 0.4); A.amb.gain.setTargetAtTime(OVR ? OVR.amb : 1, now, 0.4);   // s327 scene override (Rob's drive: own music, quiet shore)
    { const l = c.listener, fx = -Math.sin(st.camYaw), fz = -Math.cos(st.camYaw); if (l.positionX) { l.positionX.value = st.x; l.positionY.value = st.y + 1.5; l.positionZ.value = st.z; l.forwardX.value = fx; l.forwardY.value = 0; l.forwardZ.value = fz; l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0; } else { l.setPosition(st.x, st.y + 1.5, st.z); l.setOrientation(fx, 0, fz, 0, 1, 0); } }
    const room = st.aboard ? 'train' : roomAt(st.inside, st.x, st.z);
    if (room !== roomKey) { roomKey = room; ev.onRoom && ev.onRoom(room); } const zk = st.zone ? st.zone.music : null; if (zk !== zoneKey) { zoneKey = zk; ev.onZone && ev.onZone(st.zone ? st.zone.key : null); }
    // music: current zone up (busy trim, indoor drop, voice duck), every other track down over 2.8 s
    const duck = cur && (cur.el || cur.until > now) ? 0.5 : 1, lvl = (st.zone && st.zone.busy ? 0.45 : 1) * (room ? 0.25 : 1) * duck;
    if (zk) track(zk); for (const k in A.tracks) { const t = A.tracks[k], on = k === zk; t.g.gain.setTargetAtTime(on ? lvl : 0, now, 2.8 / 3); t.idle = on ? 0 : t.idle + dt; if (t.idle > 9) killTrack(k); }
    // room beds: the room you are in at full, others leak from their doors
    let leakTxt = ''; for (const R of ROOMS) { if (R.inside) continue; const inR = room === R.key || (RB[room] && RB[room].inside === R.key), dd = R.doors.length ? Math.min(...R.doors.map(([x, z]) => Math.hypot(st.x - x, st.z - z))) : 99, g = inR ? 1 : room ? 0 : leak(dd);
      if (g <= 0 && !A.beds[R.key]) continue; const b = bed(R); b.g.gain.setTargetAtTime(g * (R.busy ? 1 : 0.6), now, 0.25); b.lp.frequency.setTargetAtTime(inR ? 18000 : 900, now, 0.2); if (b.send) b.send.gain.setTargetAtTime(inR ? 1 : 0, now, 0.2);
      if (!inR && g > 0.02) leakTxt = R.label + ' ' + Math.round(g * 100) + '%'; if (g <= 0 && !inR) { b.off = (b.off || 0) + dt; if (b.off > 3) killBed(R.key); } else b.off = 0; }
    // exterior polish: OUTDOOR AMBIENCE (synth, until Ben's files): town traffic hum + the fountain (3D), wind (stronger out of town + up high),
    // lake lapping near the shore, leaves by day out of town; birds + gulls by day, crickets + the odd owl at night. Indoors it drops to 15 %.
    ambTick(c, now, dt, st, room);
    // greetings: one at a time, 7 m outdoors / 5.5 m indoors, same room only, 20 s rest per fox
    if (cur && !cur.el && cur.until <= now) cur = null;
    if (!cur && !st.aboard) for (const sp of SPK) { if (sp.mobile || sp.s.key === 'monk' || (sp.room || null) !== (room || null)) continue; const lim = sp.room ? 5.5 : 7; if (Math.hypot(st.x - sp.x, st.z - sp.z) > lim) continue; if (lastT[sp.s.key] && now - lastT[sp.s.key] < 20) continue;
      if (LOOPS.some(q => q.at === sp.s.key && q.el)) continue; lastT[sp.s.key] = now; const v = man.voice[sp.s.key]; playOn(sp, v && v.greet, 'greet'); ev.onGreet && ev.onGreet(sp.s.key); break; }
    for (const Lp of LOOPS) loopTick(Lp, st, room);
    info = { music: zk ? zk + (man.music[zk] ? '' : ' (synth)') : '', room: room || '', voice: cur ? { key: cur.sp.s.key, tier: cur.sp.s.tier === 1 ? 'talker' : 'greeter', fresh: !!cur.sp.s.newAvatar, clip: !!cur.el } : null, leak: leakTxt };
    return info; }
  // say(key, url): the dialogue system plays a line through the fox's panner. Stops the current greeting. Resolves when it ends.
  function say(key, url) { const sp = SPK.find(q => q.s.key === key); if (!sp || !A) return Promise.resolve(); if (cur && cur.el) cur.el.pause(); cur = null; return playOn(sp, url || null, 'line'); }
  function stopAll() { if (!A) return; for (const kk in AMB.loops) { for (const n of AMB.loops[kk].nodes) try { n.stop(); } catch (e) {} AMB.loops[kk].g.disconnect(); delete AMB.loops[kk]; } for (const k in A.tracks) killTrack(k); for (const k in A.beds) killBed(k); for (const Lp of LOOPS) if (Lp.el) { Lp.el.pause(); Lp.el = null; } if (cur && cur.el) cur.el.pause(); cur = null; }

  const AMB = { loops: {}, nextBird: 2, nextGull: 4, nextCricket: 1, nextOwl: 20 };
  function ambLoop(c, kind) { if (AMB.loops[kind]) return AMB.loops[kind]; const n = c.createBufferSource(); n.buffer = A.noise; n.loop = true; n.playbackRate.value = 0.7 + Math.random() * 0.6;
    const g = c.createGain(); g.gain.value = 0; const nodes = [n]; let head = n;
    const F = (type, f, q = 0.7) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; head.connect(b); head = b; return b; };
    const lfo = (rate, depth, target) => { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = rate; og.gain.value = depth; o.connect(og); og.connect(target); o.start(); nodes.push(o); };
    if (kind === 'wind') { F('lowpass', 420); const lv = c.createGain(); lv.gain.value = 1; head.connect(lv); head = lv; lfo(0.07, 0.45, lv.gain); }
    else if (kind === 'water') { F('bandpass', 520, 0.8); const lv = c.createGain(); lv.gain.value = 1; head.connect(lv); head = lv; lfo(0.22, 0.6, lv.gain); }
    else if (kind === 'traffic') { F('lowpass', 170); }
    else if (kind === 'leaves') { F('highpass', 2600); const lv = c.createGain(); lv.gain.value = 1; head.connect(lv); head = lv; lfo(0.13, 0.7, lv.gain); }
    else if (kind === 'fountain') { F('highpass', 1400); F('lowpass', 6000); const p = pan(c, 0, 1, 0, 5, 70); head.connect(p); head = p; }
    head.connect(g); g.connect(A.amb); n.start(); return (AMB.loops[kind] = { g, nodes }); }
  function blip(c, at, f0, f1, d, v, type = 'sine') { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + d); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v, at + d * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, at + d); o.connect(g); g.connect(A.amb); o.start(at); o.stop(at + d + 0.02); }
  function ambTick(c, now, dt, st, room) {
    const x = st.x, z = st.z, town = Math.abs(x) < 165 && z > -145 && z < 155, inside = !!room, k = inside ? 0.15 : 1, night = !!st.night;
    const shore = L.lakeShoreD ? L.lakeShoreD(x, z) : -999, lakeW = clamp(1 + shore / 55, 0, 1), high = clamp((st.y - 6) / 20, 0, 1), fd = Math.hypot(x, z);
    const set = (kind, v) => { if (v <= 0.002 && !AMB.loops[kind]) return; ambLoop(c, kind).g.gain.setTargetAtTime(v * k, now, 0.8); };
    set('traffic', 0); set('wind', high * 0.12);   /* s102 (Ben: "a strange background hum"): the low traffic rumble is gone, wind only up high */ set('water', lakeW * 0.16); set('leaves', !town && !night ? 0.03 : 0); set('fountain', town && fd < 70 ? 0.5 : 0);
    if (inside) return;
    const grassy = !town || fd > 20;
    if (!night && grassy && (AMB.nextBird -= dt) <= 0) { AMB.nextBird = 1.5 + Math.random() * 4.5; const f = 2600 + Math.random() * 2200, n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) blip(c, now + i * 0.11, f * (1 + Math.random() * 0.15), f * 0.82, 0.08, 0.025 + Math.random() * 0.02); }
    if (!night && lakeW > 0.4 && (AMB.nextGull -= dt) <= 0) { AMB.nextGull = 5 + Math.random() * 9; for (let i = 0; i < 2; i++) blip(c, now + i * 0.42, 1250, 720, 0.36, 0.03, 'sawtooth'); }
    if (night && grassy && (AMB.nextCricket -= dt) <= 0) { AMB.nextCricket = 0.4 + Math.random() * 1.4; const f = 4100 + Math.random() * 500; for (let i = 0; i < 3; i++) blip(c, now + i * 0.05, f, f * 0.98, 0.035, 0.012, 'square'); }
    if (night && !town && (AMB.nextOwl -= dt) <= 0) { AMB.nextOwl = 18 + Math.random() * 30; blip(c, now, 420, 380, 0.45, 0.05); blip(c, now + 0.6, 440, 370, 0.7, 0.05); }
  }
  return { tick, say, stopAll, override: o => { OVR = o || null; }, events: ev, rooms: ROOMS, speakers: SPK, roomAt, info: () => info, manifest: () => man };
}
