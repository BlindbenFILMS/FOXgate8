// 8 GATES — ARCADE · SLOTS audio [arcadeSlots]. Synthesised like the pinball (it reuses the pinball's synth engine: reverb, limiter, voices).
//   SlotSound: coin in, lever ratchet, reel ticking, reel stops (each symbol has its own note when SOUND REELS is on), wins small → big,
//              coin payout clinks, jackpot bells, near-miss tension, buttons, "no gold" buzz.
//   SlotsMusic: a lounge groove (electric piano chords, walking bass, brushed drums) with a brighter 'win' mood and a 'jackpot' fanfare mood.
import { PinballSound } from './pinball-audio.js';
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
// the note each symbol plays when its reel stops (SOUND REELS): higher = rarer
export const SYMBOL_NOTE = { blank: 52, moon: 64, sat: 67, star: 71, rocket: 74, fox: 76, crescent: 79, eight: 84 };
const TRIM = { lever: 3, tick: 40, stop: 2.6, button: 4.5, coin: 6, nogold: 1.6, insert: 4.8, note: 2.5 };

export class SlotSound extends PinballSound {
  play(k, pan = 0, amt = 1) {
    if (!this.live || !this.sfxOn) return; const c = this.ctx, t = c.currentTime + 0.005; this.trim = TRIM[k] || 1;
    switch (k) {
      case 'insert': { const o = this.out(pan, 0.2); this.bell(mtof(88), t, 0.25, 0.16, o, 2.0, 1); this.osc('sine', 2600, 2200, t + 0.02, 0.04, 0.06, o); this.nz(0.05, 0.12, 'bandpass', 3500, 3, o, t + 0.12); break; }
      case 'button': { const o = this.out(pan, 0); this.osc('square', 1100, 800, t, 0.03, 0.06, o); this.nz(0.02, 0.08, 'highpass', 3000, 1, o, t); break; }
      case 'lever': { const o = this.out(0.6, 0.12); for (let i = 0; i < 7; i++) { this.nz(0.018, 0.16, 'bandpass', 2400 - i * 120, 4, o, t + i * 0.035); } this.osc('sine', 140, 60, t + 0.27, 0.16, 0.4, o); break; }
      case 'tick': { const o = this.out(pan, 0); this.nz(0.012, 0.09, 'bandpass', 3200 + amt * 300, 5, o, t); break; }
      case 'stop': { const o = this.out(pan, 0.12); this.osc('sine', 120, 55, t, 0.14, 0.45, o); this.nz(0.05, 0.2, 'lowpass', 1400, 1, o, t); break; }
      case 'note': { const o = this.out(pan, 0.25); this.bell(mtof(amt), t + 0.01, 0.5, 0.13, o, 2.0, 1.3); break; }
      case 'tease': { const o = this.out(0, 0.3); this.osc('sawtooth', mtof(55), mtof(67), t, 1.6, 0.05, o, 0.3); this.osc('triangle', mtof(62), mtof(74), t, 1.6, 0.06, o, 0.3); break; }
      case 'small': { const o = this.out(0, 0.35); [76, 79, 84].forEach((m, i) => this.bell(mtof(m), t + i * 0.07, 0.4, 0.14, o, 2.0, 1.2)); break; }
      case 'medium': { const o = this.out(0, 0.4); [72, 76, 79, 84, 88].forEach((m, i) => this.bell(mtof(m), t + i * 0.07, 0.5, 0.15, o, 2.0, 1.4)); this.osc('square', mtof(60), null, t + 0.35, 0.35, 0.06, o); break; }
      case 'big': { const o = this.out(0, 0.5); [60, 64, 67, 72, 76, 79, 84, 88].forEach((m, i) => { this.osc('square', mtof(m), null, t + i * 0.06, 0.3, 0.06, o); this.bell(mtof(m + 12), t + i * 0.06, 0.7, 0.07, o); }); [48, 55, 60, 64].forEach(m => this.osc('sawtooth', mtof(m), null, t + 0.5, 1.2, 0.05, o, 0.05)); break; }
      case 'jackpot': { const o = this.out(0, 0.55); for (let r = 0; r < 3; r++) [84, 88, 91, 96].forEach((m, i) => this.bell(mtof(m), t + r * 0.45 + i * 0.07, 0.9, 0.14, o, 2.0, 2)); const s = this.osc('square', 660, 660, t, 1.5, 0.05, o); const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5; lg.gain.value = 180; l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + 1.5); break; }
      case 'coin': { const o = this.out((Math.random() - 0.5) * 0.6, 0.15); this.bell(mtof(93 + Math.floor(Math.random() * 4)), t, 0.18, 0.09, o, 2.4, 1.5); this.nz(0.03, 0.06, 'highpass', 5000, 1, o, t + 0.01); break; }
      case 'nogold': { const o = this.out(0, 0.1); this.osc('square', 196, 185, t, 0.18, 0.12, o); this.osc('square', 147, 140, t + 0.2, 0.25, 0.12, o); break; }
      case 'join': { const o = this.out(0, 0.3); this.bell(mtof(79), t, 0.3, 0.12, o); this.bell(mtof(86), t + 0.1, 0.4, 0.12, o); break; }
      default: super.play(k, pan, amt);
    }
  }
}

// ---------------- music: a small lounge band ----------------
const PROG = { lounge: [[50, 'm7'], [55, '7'], [48, 'M7'], [45, 'm7']], win: [[48, 'M7'], [45, 'm7'], [50, 'm7'], [55, '7']], jackpot: [[48, 'M7'], [53, 'M7'], [55, '7'], [48, 'M7']] };
const CH = { m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], M7: [0, 4, 7, 11] };
const BPM = { lounge: 92, win: 112, jackpot: 128 };
export class SlotsMusic {
  constructor(snd) { this.s = snd; this.mode = null; this.want = null; this.step = 0; this.next = 0; this.timer = 0; this.level = 0.3; this.duck = 1; }
  setMode(m) { this.want = m; if (!this.s.live || !m) return; if (!this.timer) this.start(m); }
  setOn(on) { this.s.musicOn = on; if (!on) this.stop(); else if (this.want) this.setMode(this.want); }
  setDuck(d) { this.duck = d; this.applyGain(); }
  applyGain() { const s = this.s; if (!s.live) return; s.mus.gain.setTargetAtTime(this.timer && s.musicOn ? this.level * this.duck : 0, s.ctx.currentTime, 0.25); }
  start(m) { const s = this.s; if (!s.live || !s.musicOn) return; this.mode = m; this.step = 0; this.next = s.ctx.currentTime + 0.08; this.timer = setInterval(() => this.tick(), 25); this.applyGain(); }
  stop() { clearInterval(this.timer); this.timer = 0; this.mode = null; const s = this.s; if (s.live) s.mus.gain.setTargetAtTime(0, s.ctx.currentTime, 0.15); }
  tick() { const s = this.s; if (!s.live || !s.musicOn) return; const c = s.ctx;
    while (this.next < c.currentTime + 0.14) { if (this.step % 16 === 0 && this.want && this.want !== this.mode) this.mode = this.want; const m = this.mode || 'lounge', dt = 60 / BPM[m] / 4; this.note(m, this.step, this.next, dt); this.next += dt; this.step = (this.step + 1) % (16 * 16); } }
  note(m, step, t, dt) {
    const s = this.s, o = s.mus, i = step % 16, bar = Math.floor(step / 16), [root, q] = PROG[m][bar % 4], tones = CH[q], swing = (i % 2) ? dt * 0.33 : 0, tt = t + swing;
    const epiano = (mids, d, v) => mids.forEach(mm => { s.osc('sine', mtof(mm), null, tt, d, v, o, 0.005); s.osc('sine', mtof(mm) * 2.001, null, tt, d * 0.4, v * 0.25, o, 0.003); });
    const bass = (mid, d, v = 0.22) => { s.osc('triangle', mtof(mid), null, tt, d, v, o, 0.01); s.osc('sine', mtof(mid) * 2, null, tt, d * 0.5, v * 0.2, o, 0.01); };
    const brush = v => s.nz(0.12, v, 'bandpass', 5200, 0.6, o, tt); const rim = v => s.nz(0.03, v, 'bandpass', 2600, 3, o, tt); const kick = v => s.osc('sine', 110, 50, tt, 0.18, v, o);
    // comping: chords on 1 and the "and" of 2
    if (i === 0 || i === 6 || (m !== 'lounge' && i === 10)) epiano(tones.map(x => root + 12 + x), dt * (i === 0 ? 5 : 3), m === 'lounge' ? 0.05 : 0.06);
    // walking bass: root, 3rd/5th, approach
    if (i % 4 === 0) { const walk = [0, tones[1], tones[2], (PROG[m][(bar + 1) % 4][0] - root) - 1]; bass(root - 12 + walk[i / 4], dt * 3.6); }
    if (i % 2 === 0) brush(m === 'lounge' ? 0.05 : 0.07); if (i === 4 || i === 12) rim(0.08); if (i === 0 || (m !== 'lounge' && i === 8)) kick(0.4);
    // a little melody every other bar
    const mel = m === 'jackpot' ? [0, 2, 3, 2, 1, 2, 3, 3] : [3, null, 2, null, 1, null, 2, null];
    if (bar % 2 === 1 && i % 2 === 0) { const d = mel[i / 2]; if (d != null) s.osc('triangle', mtof(root + 24 + tones[d % 4]), null, tt, dt * 1.7, m === 'lounge' ? 0.035 : 0.05, o, 0.01); }
  }
}
