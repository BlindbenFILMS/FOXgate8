// 8 GATES — ARCADE · PINBALL audio [arcadePinball]. Everything is synthesised with Web Audio (no sound files to ship or load).
//   PinballSound: machine sounds (solenoid flippers, pop bumpers, slings, drop targets, chime rollovers, knocker, ball roll, drain …)
//                 + SOUND BALL (a voice that follows the ball for low-vision players) + a small room reverb + a master limiter.
//   PinballMusic: a 4-mode chip/synthwave score — 'menu' (laid back), 'play', 'multi' (multiball, faster), 'wizard' (all 8 gates open).
// Browsers only start audio after a tap or key: call wake() from an input handler. Safe to call anything before that (it just stays silent).
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
// per-sound trim, balanced by offline renders so the mechanical hits sit level with the chimes and the music
const TRIM = { flip: 3.5, flipUp: 12, bump: 2.2, sling: 3, drop: 2.8, stand: 5, wall: 6, clack: 4, pull: 40, launch: 6, hole: 2.5, kick: 3, tick: 5, click: 4, tilt: 1.5 };

export class PinballSound {
  constructor() { this.ctx = null; this.sfxOn = true; this.musicOn = true; this.ballOsc = null; }
  wake() {
    if (!this.ctx) {
      try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; this.ctx = new C(); } catch (e) { return null; }
      const c = this.ctx;
      this.master = c.createDynamicsCompressor(); Object.assign(this.master, {}); this.master.threshold.value = -12; this.master.knee.value = 8; this.master.ratio.value = 5; this.master.attack.value = 0.003; this.master.release.value = 0.2;
      this.masterGain = c.createGain(); this.masterGain.gain.value = 0.9; this.master.connect(this.masterGain); this.masterGain.connect(c.destination);
      this.sfx = c.createGain(); this.sfx.gain.value = this.sfxOn ? 0.85 : 0; this.sfx.connect(this.master);
      this.mus = c.createGain(); this.mus.gain.value = 0; this.musLP = c.createBiquadFilter(); this.musLP.type = 'lowpass'; this.musLP.frequency.value = 18000; this.mus.connect(this.musLP); this.musLP.connect(this.master);
      this.verb = c.createConvolver(); this.verb.buffer = this.impulse(1.3, 2.6); this.verbIn = c.createGain(); this.verbIn.gain.value = 1; this.verbIn.connect(this.verb); this.verb.connect(this.sfx);
      const n = c.createBuffer(1, c.sampleRate, c.sampleRate), a = n.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; this.nb = n;
      // ball roll: looping noise through a band-pass, gain follows ball speed
      this.roll = c.createBufferSource(); this.roll.buffer = n; this.roll.loop = true; this.rollF = c.createBiquadFilter(); this.rollF.type = 'bandpass'; this.rollF.Q.value = 0.8; this.rollF.frequency.value = 260;
      this.rollLP = c.createBiquadFilter(); this.rollLP.type = 'lowpass'; this.rollLP.frequency.value = 900; this.rollG = c.createGain(); this.rollG.gain.value = 0;
      this.roll.connect(this.rollF); this.rollF.connect(this.rollLP); this.rollLP.connect(this.rollG); this.rollG.connect(this.sfx); this.roll.start();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }
  get live() { return !!this.ctx && this.ctx.state === 'running'; }
  impulse(sec, decay) { const c = this.ctx, len = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay) * (i < 40 ? i / 40 : 1); } return b; }
  setSfx(on) { this.sfxOn = on; if (this.ctx) this.sfx.gain.setTargetAtTime(on ? 0.85 : 0, this.ctx.currentTime, 0.05); }
  // an output node for one sound: pan + optional reverb send
  out(pan = 0, wet = 0.15, dest) { const c = this.ctx, g = c.createGain(); g.gain.value = this.trim || 1; let n = g; if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); n = p; } n.connect(dest || this.sfx); if (wet > 0 && !dest) { const s = c.createGain(); s.gain.value = wet; n.connect(s); s.connect(this.verbIn); } return g; }
  osc(type, f0, f1, t, dur, vol, node, atk = 0.002) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(node); o.start(t); o.stop(t + dur + 0.03); return o; }
  nz(dur, vol, ftype, freq, q, node, t, f1) { const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; f.type = ftype; f.frequency.setValueAtTime(freq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(node); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03); }
  bell(f, t, dur, vol, node, ratio = 3.5, idx = 2) { const c = this.ctx, car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain(); car.frequency.value = f; mod.frequency.value = f * ratio; mg.gain.setValueAtTime(f * idx, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur); mod.connect(mg); mg.connect(car.frequency); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); car.connect(g); g.connect(node); car.start(t); mod.start(t); car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05); }
  play(k, pan = 0, amt = 1) {
    if (!this.live || !this.sfxOn) return; const c = this.ctx, t = c.currentTime + 0.005; this.trim = TRIM[k] || 1;
    switch (k) {
      case 'flip': { const o = this.out(pan, 0.08); this.nz(0.045, 0.5, 'bandpass', 1500, 1.2, o, t); this.osc('square', 95, 42, t, 0.08, 0.28, o); this.osc('sine', 2600, 1800, t, 0.012, 0.12, o); break; }
      case 'flipUp': { const o = this.out(pan, 0); this.nz(0.03, 0.12, 'bandpass', 900, 1, o, t); break; }
      case 'bump': { const o = this.out(pan, 0.25), notes = [76, 79, 83]; this.osc('sine', 170, 55, t, 0.14, 0.7, o); this.nz(0.06, 0.4, 'highpass', 2800, 0.7, o, t); this.osc('square', 1240, 1180, t, 0.09, 0.05, o); this.bell(mtof(notes[amt | 0] || 79), t + 0.005, 0.32, 0.14, o, 2.01, 1.2); break; }
      case 'sling': { const o = this.out(pan, 0.15); this.nz(0.05, 0.5, 'bandpass', 2400, 1.5, o, t); this.osc('sine', 240, 90, t, 0.09, 0.45, o); this.osc('triangle', 1400, 900, t, 0.05, 0.08, o); break; }
      case 'drop': { const o = this.out(pan, 0.15); this.osc('sine', 130, 48, t, 0.18, 0.6, o); this.nz(0.08, 0.35, 'lowpass', 900, 0.7, o, t); this.osc('square', 2100, 1500, t, 0.015, 0.08, o); break; }
      case 'stand': { const o = this.out(pan, 0.15); this.osc('triangle', 520, 380, t, 0.1, 0.3, o); this.nz(0.04, 0.3, 'bandpass', 1800, 2, o, t); break; }
      case 'roll': { const o = this.out(pan, 0.35); this.bell(mtof(91), t, 0.7, 0.2, o, 3.5, 1.6); this.bell(mtof(96), t + 0.07, 0.6, 0.1, o, 3.5, 1.2); break; }
      case 'wall': { const o = this.out(pan, 0.05); this.nz(0.03, Math.min(0.35, 0.05 + amt * 0.012), 'highpass', 1600, 0.8, o, t); this.osc('sine', 600, 300, t, 0.03, Math.min(0.15, amt * 0.008), o); break; }
      case 'clack': { const o = this.out(pan, 0.05); this.osc('sine', 3200, 2600, t, 0.02, 0.25, o); this.nz(0.025, 0.2, 'highpass', 4000, 1, o, t); break; }
      case 'pull': { const o = this.out(0.7, 0); this.nz(1.1, 0.12, 'bandpass', 300, 6, o, t, 1400); break; }
      case 'launch': { const o = this.out(0.7, 0.2); this.osc('sine', 120, 50, t, 0.18, 0.6, o); this.nz(0.35, 0.3 + 0.2 * amt, 'bandpass', 500, 1.2, o, t, 2500); this.osc('square', 300, 900, t, 0.12, 0.05, o); break; }
      case 'hole': { const o = this.out(pan, 0.25); this.osc('sine', 110, 38, t, 0.25, 0.7, o); this.nz(0.3, 0.25, 'bandpass', 700, 2, o, t + 0.04, 300); this.bell(mtof(55), t + 0.05, 0.6, 0.12, o, 1.5, 2); break; }
      case 'kick': { const o = this.out(pan, 0.2); this.nz(0.1, 0.5, 'lowpass', 1200, 0.7, o, t); this.osc('sine', 80, 160, t, 0.12, 0.5, o); break; }
      case 'drain': { const o = this.out(0, 0.3); [67, 64, 60, 55].forEach((m, i) => { this.osc('square', mtof(m), mtof(m) * 0.97, t + i * 0.17, 0.2, 0.09, o); this.osc('triangle', mtof(m - 12), null, t + i * 0.17, 0.22, 0.12, o); }); this.osc('sawtooth', mtof(43), mtof(31), t + 0.68, 0.7, 0.12, o); break; }
      case 'gate': { const o = this.out(0, 0.45); [72, 76, 79, 84].forEach((m, i) => this.bell(mtof(m), t + i * 0.075, 0.7, 0.16, o, 2.0, 1.4)); this.osc('square', mtof(60), null, t, 0.3, 0.05, o); break; }
      case 'skill': { const o = this.out(0, 0.45); for (let i = 0; i < 8; i++) this.bell(mtof(72 + i * 2), t + i * 0.045, 0.5, 0.11, o, 3.5, 1.4); break; }
      case 'big': { const o = this.out(0, 0.5); [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => { this.osc('square', mtof(m), null, t + i * 0.07, 0.35, 0.07, o); this.bell(mtof(m + 12), t + i * 0.07, 0.6, 0.06, o); }); [48, 55, 60].forEach(m => this.osc('sawtooth', mtof(m), null, t + 0.5, 0.9, 0.06, o, 0.05)); break; }
      case 'jackpot': { const o = this.out(0, 0.5); [79, 84, 88, 91, 96].forEach((m, i) => this.bell(mtof(m), t + i * 0.06, 0.9, 0.15, o, 2.0, 2)); this.osc('sine', 60, 40, t, 0.4, 0.6, o); this.nz(0.6, 0.15, 'highpass', 5000, 0.5, o, t + 0.3); break; }
      case 'knock': { const o = this.out(0, 0.35); this.osc('sine', 70, 35, t, 0.3, 1, o); this.nz(0.12, 0.6, 'lowpass', 500, 1, o, t); break; }
      case 'tilt': { const o = this.out(0, 0.2); const g = this.osc('sawtooth', 98, 92, t, 1.2, 0.22, o); const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 12; lg.gain.value = 20; l.connect(lg); lg.connect(g.frequency); l.start(t); l.stop(t + 1.2); break; }
      case 'warn': { const o = this.out(0, 0.1); this.osc('square', 880, null, t, 0.12, 0.12, o); this.osc('square', 880, null, t + 0.18, 0.12, 0.12, o); break; }
      case 'tick': { const o = this.out(0, 0.05); this.osc('square', 1700 + amt * 40, null, t, 0.03, 0.06, o); break; }
      case 'coin': { const o = this.out(0, 0.35); this.bell(mtof(83), t, 0.25, 0.18, o, 2.0, 1); this.bell(mtof(88), t + 0.09, 0.6, 0.18, o, 2.0, 1); break; }
      case 'click': { const o = this.out(0, 0); this.osc('square', 1300, 900, t, 0.025, 0.06, o); break; }
      case 'save': { const o = this.out(0, 0.35); [76, 72, 79].forEach((m, i) => this.bell(mtof(m), t + i * 0.09, 0.4, 0.12, o)); break; }
      case 'lock': { const o = this.out(0, 0.35); this.osc('sine', 90, 40, t, 0.3, 0.6, o); [60, 67, 72].forEach((m, i) => this.osc('square', mtof(m), null, t + 0.1 + i * 0.1, 0.18, 0.07, o)); break; }
    }
  }
  // ball roll rumble: speed in units/s, n balls on the table
  setRoll(speed, n) { if (!this.live) return; const t = this.ctx.currentTime, on = this.sfxOn && n > 0; this.rollG.gain.setTargetAtTime(on ? Math.min(0.22, 0.02 + speed * 0.007) * Math.min(1.6, n) : 0, t, 0.06); this.rollF.frequency.setTargetAtTime(160 + speed * 22, t, 0.08); }
  // SOUND BALL
  ball(on, x = 0, y = 0, speed = 0) {
    if (!this.live) return; const c = this.ctx, t = c.currentTime;
    if (on && !this.ballOsc) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; g.gain.value = 0; let n = g; if (c.createStereoPanner) { this.ballPan = c.createStereoPanner(); g.connect(this.ballPan); n = this.ballPan; } n.connect(this.master); o.connect(g); o.start(); this.ballOsc = o; this.ballGain = g; }
    if (!this.ballOsc) return;
    if (!on) { this.ballGain.gain.setTargetAtTime(0, t, 0.05); return; }
    this.ballOsc.frequency.setTargetAtTime(160 + y * 38, t, 0.03); if (this.ballPan) this.ballPan.pan.setTargetAtTime(clamp((x - 4.5) / 4.5, -1, 1), t, 0.03);
    const near = 1 - Math.min(1, Math.max(0, (y - 1.5) / 5.5)); this.ballGain.gain.setTargetAtTime(0.05 + 0.12 * near + Math.min(0.04, speed * 0.002), t, 0.04);
  }
  stopAll() { if (this.ballOsc) { try { this.ballOsc.stop(); } catch (e) {} this.ballOsc = null; } try { this.ctx && this.ctx.close(); } catch (e) {} this.ctx = null; }
}

// ---------------- music ----------------
const PROG = { menu: [[45, 'm'], [43, 'M'], [41, 'M'], [40, 'M']], play: [[45, 'm'], [41, 'M'], [48, 'M'], [43, 'M']], multi: [[45, 'm'], [41, 'M'], [43, 'M'], [40, 'M']], wizard: [[50, 'm'], [46, 'M'], [48, 'M'], [45, 'M']] };
const BPM = { menu: 94, play: 128, multi: 146, wizard: 152 };
const MOTIF = {
  A: [0, null, 1, null, 2, null, 1, null, 3, null, 2, null, 1, null, 0, null],
  B: [3, null, null, 2, null, null, 1, null, 2, null, 3, null, 4, null, null, null],
  C: [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4, 3],
  D: [4, null, 3, null, null, null, 2, null, null, null, 1, null, 0, null, null, null],
  E: [2, null, 2, 3, null, 4, null, 3, 2, null, 1, null, 2, null, null, null] };
export class PinballMusic {
  constructor(snd) { this.s = snd; this.mode = null; this.want = null; this.step = 0; this.next = 0; this.timer = 0; this.level = 0.18; this.duck = 1; }
  setMode(m) { this.want = m; if (!this.s.live) return; if (!m) { this.stop(); return; } if (!this.timer) this.start(m); }
  setOn(on) { this.s.musicOn = on; if (!on) this.stop(); else if (this.want) this.setMode(this.want); }
  setDuck(d) { this.duck = d; this.applyGain(); }
  applyGain() { const s = this.s; if (!s.live) return; s.mus.gain.setTargetAtTime(this.timer && s.musicOn ? this.level * this.duck : 0, s.ctx.currentTime, 0.25); s.musLP.frequency.setTargetAtTime(this.duck < 0.5 ? 900 : 18000, s.ctx.currentTime, 0.2); }
  start(m) { const s = this.s; if (!s.live || !s.musicOn) return; this.mode = m; this.step = 0; this.next = s.ctx.currentTime + 0.08; this.timer = setInterval(() => this.tick(), 25); this.applyGain(); }
  stop() { clearInterval(this.timer); this.timer = 0; this.mode = null; const s = this.s; if (s.live) s.mus.gain.setTargetAtTime(0, s.ctx.currentTime, 0.15); }
  tick() {
    const s = this.s; if (!s.live || !s.musicOn) return; const c = s.ctx;
    while (this.next < c.currentTime + 0.14) {
      if (this.step % 16 === 0 && this.want && this.want !== this.mode) this.mode = this.want;      // switch mode on the bar
      const m = this.mode || 'menu', dt = 60 / BPM[m] / 4; this.note(m, this.step, this.next, dt); this.next += dt; this.step = (this.step + 1) % (16 * 16);
    }
  }
  note(m, step, t, dt) {
    const s = this.s, o = s.mus, i = step % 16, bar = Math.floor(step / 16), [root, q] = PROG[m][bar % 4], tones = q === 'm' ? [0, 3, 7] : [0, 4, 7];
    const deg = d => root + 12 + tones[d % 3] + 12 * Math.floor(d / 3);
    const kick = (v = 0.9) => { s.osc('sine', 150, 42, t, 0.22, v, o); s.osc('square', 60, 40, t, 0.05, v * 0.15, o); };
    const snare = (v = 0.45) => { s.nz(0.16, v, 'bandpass', 1900, 0.8, o, t); s.osc('triangle', 200, 150, t, 0.08, v * 0.5, o); };
    const hat = (v = 0.12, open) => s.nz(open ? 0.14 : 0.035, v, 'highpass', 7500, 0.7, o, t);
    const bass = (mid, d, v = 0.2) => { const c = s.ctx, os = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); os.type = 'sawtooth'; os.frequency.value = mtof(mid); f.type = 'lowpass'; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(260, t + d); f.Q.value = 4; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.95); os.connect(f); f.connect(g); g.connect(o); os.start(t); os.stop(t + d + 0.02); };
    const lead = (mid, d, v = 0.06) => { s.osc('square', mtof(mid), null, t, d, v, o, 0.006); s.osc('sawtooth', mtof(mid) * 1.004, null, t, d, v * 0.6, o, 0.006); };
    const pad = (mids, d, v = 0.045) => mids.forEach(mm => s.osc('triangle', mtof(mm), null, t, d, v, o, 0.25));
    if (m === 'menu') {
      if (i === 0) pad([root + 12, root + 12 + tones[1], root + 12 + tones[2], root + 24], dt * 16, 0.05);
      if (i === 0 || i === 10) kick(0.55); if (i === 12) s.nz(0.04, 0.12, 'bandpass', 3000, 2, o, t); if (i % 2 === 0) hat(0.05);
      if (i === 0 || i === 6 || i === 8) bass(root, dt * 5, 0.16);
      const mo = MOTIF[bar % 8 < 4 ? 'D' : 'E'][i]; if (mo != null && bar % 2 === 1) lead(deg(mo) + 12, dt * 2.6, 0.035);
      return;
    }
    const fast = m === 'multi' || m === 'wizard';
    if (i % 4 === 0) kick(); if (i === 4 || i === 12) snare(); if (fast && i === 14) snare(0.25);
    if (fast ? true : i % 2 === 0) hat(i % 4 === 2 ? 0.14 : 0.08, i === 14 && !fast);
    if (fast) bass(i % 2 ? root + 12 : root, dt * 0.9, 0.17); else if (i % 2 === 0) bass(i % 4 === 2 ? root + 12 : root, dt * 1.8, 0.18);
    const motif = fast ? MOTIF.C : MOTIF[['A', 'A', 'B', 'D'][Math.floor(bar / 4) % 4]], mo = motif[i];
    if (mo != null && (fast || bar % 8 >= 2)) lead(deg(mo) + (m === 'wizard' ? 12 : 0), dt * (fast ? 0.9 : 1.8), fast ? 0.05 : 0.06);
    if (i === 0 && bar % 4 === 0) s.nz(0.9, 0.06, 'highpass', 6000, 0.5, o, t); // crash on the phrase
  }
}
