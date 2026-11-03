
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const ALTAR = { x: 100, y: 36 };
const PLOT = { x0: 8, y0: 12, x1: 192, y1: 122 };
const LIGHT_R = 9;
const RELIGHT_R = 15;

// air vents: a grille on the wall and the draught zone in front of it
const VENTS = {
  left: { gx: 8, gy: 62, gw: 6, gh: 18, zx: 14, zy: 52, zw: 28, zh: 34, dir: 1 },
  right: { gx: 186, gy: 62, gw: 6, gh: 18, zx: 158, zy: 52, zw: 28, zh: 34, dir: -1 },
  lowLeft: { gx: 8, gy: 96, gw: 6, gh: 16, zx: 14, zy: 88, zw: 26, zh: 26, dir: 1 },
  lowRight: { gx: 186, gy: 96, gw: 6, gh: 16, zx: 160, zy: 88, zw: 26, zh: 26, dir: -1 },
  mid: { gx: 97, gy: 117, gw: 16, gh: 5, zx: 87, zy: 104, zw: 26, zh: 14, dir: 0 }
};

const RITES = [
  { name: "Evening lamps", candles: 5, vents: ["left"], limit: 78, drain: 46, wax: 5.2, wane: 0, sway: 0.22 },
  { name: "First watch", candles: 7, vents: ["left", "right"], limit: 70, drain: 54, wax: 6, wane: 0.8, sway: 0.26 },
  { name: "The long night", candles: 9, vents: ["left", "right", "lowLeft"], limit: 62, drain: 62, wax: 6.6, wane: 1.1, sway: 0.3 },
  { name: "Founding day", candles: 11, vents: ["left", "right", "lowLeft", "lowRight"], limit: 56, drain: 70, wax: 7.2, wane: 1.3, sway: 0.38 }
];
// vents breathe rather than blow constantly
const VENT_PERIOD = 5.6, VENT_ON = 3;

// candles sit on arcs below the altar, stored as angle + radius so the
// whole fan can sway on its mount and carry them through the draughts
function layout(count) {
  const out = [];
  const inner = Math.min(count, 6);
  const outer = count - inner;
  const ang = (i, total) => (total === 1 ? 90 : 36 + (i / (total - 1)) * 108) * Math.PI / 180;
  for (let i = 0; i < inner; i++) out.push({ ang: ang(i, inner), r: 50, lit: false, life: 0 });
  for (let i = 0; i < outer; i++) out.push({ ang: ang(i, outer), r: 68, lit: false, life: 0 });
  return out;
}
const candlePos = (c, spin) => ({
  x: ALTAR.x + Math.cos(c.ang + spin) * c.r,
  y: ALTAR.y + Math.sin(c.ang + spin) * c.r
});
const SWAY_RATE = (2 * Math.PI) / 16;
const TOLL_EVERY = 4;
const SEC_PER_CANDLE = 3;
const CANDLE_SNUFF = 58;

const MUSIC = (() => {
  const notes = [];
  // a slow warm hymn: low drone, gentle bell arpeggio above it
  const chords = [[41, 48, 53], [43, 50, 55], [38, 45, 50], [36, 43, 48]];
  chords.forEach((ch, s) => {
    const at = s * 8;
    notes.push({ b: at, m: ch[0] - 12, d: 7.6, v: "drone" });
    ch.forEach((m, i) => notes.push({ b: at + i * 0.4, m, d: 6.4, v: "pad" }));
    [0, 2.5, 4, 6].forEach((off, i) => notes.push({ b: at + off, m: ch[(i + 1) % 3] + 24, d: 1.8, v: "bell" }));
  });
  [3.5, 11.5, 19.5, 27.5].forEach(b => notes.push({ b, m: 84, d: 2.2, v: "bell" }));
  return { notes, beats: 32, spb: 0.56 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshRite(0));
  }

  freshRite(round) {
    const r = RITES[round % RITES.length];
    return {
      round, rite: r,
      candles: layout(r.candles),
      vents: r.vents.map(k => VENTS[k]),
      taper: { x: 100, y: 84 }, held: false,
      lit: false, flame: 0, wax: 100, guttered: 0, spent: 0, blown: 0, tolled: 0, everLit: false,
      lightings: 0, puffs: [],
      t: 0, peak: 0,
      timeLeft: r.candles * SEC_PER_CANDLE, total: r.candles * SEC_PER_CANDLE,
      smokeAt: 0, done: false, outcome: null,
      titleCard: [r.name, r.candles + " candles · " + r.candles * SEC_PER_CANDLE + " seconds"],
      cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__shrineTarget = this;
    this.started = false;
    this.killMusic();
    setTimeout(() => this.loop(), 0);
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.killMusic();
  }

  muted() { return this.state.muted || (this.props.sound ?? true) === false; }
  musicOn() { return !this.muted() && (this.props.music ?? true) !== false && !this.state.musicOff; }

  audio() {
    if (this.muted() || !this.started) return null;
    if (!window.__shrineAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__shrineAC = new AC();
      const b = window.__shrineAC.createBuffer(1, window.__shrineAC.sampleRate * 1.2, window.__shrineAC.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      window.__shrineNoise = b;
      window.addEventListener("pagehide", () => { try { window.__shrineAC.close(); } catch (e) {} });
    }
    this.actx = window.__shrineAC;
    this.noise = window.__shrineNoise;
    if (this.actx.state === "suspended") this.actx.resume();
    return this.actx;
  }

  tone(freq, dur, gain, type, to) {
    const ac = this.audio();
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }

  burst(o) {
    const ac = this.audio();
    if (!ac) return;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    src.buffer = this.noise; src.loop = true;
    f.type = o.type || "bandpass";
    f.Q.value = o.q == null ? 1 : o.q;
    f.frequency.setValueAtTime(o.f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(60, o.f1), t + o.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(t); src.stop(t + o.dur + 0.05);
  }

  sfx(kind) {
    if (!this.audio()) return;
    if (kind === "take") this.tone(660, 0.06, 0.03, "triangle", 880);
    else if (kind === "kindle") {
      this.burst({ f0: 1800, f1: 700, dur: 0.14, gain: 0.05, type: "bandpass", q: 1.2 });
      [0, 7].forEach((s, i) => setTimeout(() => this.tone(midiHz(81 + s), 0.2, 0.04, "sine"), i * 70));
    } else if (kind === "light") {
      this.burst({ f0: 2400, f1: 900, dur: 0.1, gain: 0.04, type: "bandpass", q: 1.4 });
      this.tone(midiHz(88), 0.22, 0.035, "sine");
    } else if (kind === "out") {
      this.burst({ f0: 700, f1: 180, dur: 0.26, gain: 0.05, type: "lowpass", q: 0.7 });
      this.tone(200, 0.2, 0.035, "sine", 130);
    } else if (kind === "all") {
      [0, 4, 7, 12, 16].forEach((s, i) => setTimeout(() => this.tone(midiHz(76 + s), 0.34, 0.045, "sine"), i * 130));
    } else if (kind === "time") this.tone(190, 0.3, 0.05, "triangle", 120);
  }

  voice(nt, at) {
    const ac = this.actx, g = ac.createGain(), o = ac.createOscillator();
    const dur = nt.d * MUSIC.spb;
    let peak = 0.02;
    if (nt.v === "drone") { o.type = "sine"; peak = 0.042; }
    else if (nt.v === "pad") { o.type = "triangle"; peak = 0.016; }
    else { o.type = "sine"; peak = 0.03; }
    o.frequency.setValueAtTime(midiHz(nt.m), at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + (nt.v === "bell" ? 0.02 : 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(window.__shrineMusicBus);
    o.start(at); o.stop(at + dur + 0.04);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__shrineMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__shrineMusicBus = bus;
      this.musicStart = ac.currentTime + 0.12;
      this.musicBar = 0;
    }
    const barLen = MUSIC.beats * MUSIC.spb;
    while (this.musicStart + this.musicBar * barLen < ac.currentTime + 1) {
      const base = this.musicStart + this.musicBar * barLen;
      MUSIC.notes.forEach(nt => {
        const at = base + nt.b * MUSIC.spb;
        if (at > ac.currentTime - 0.05) this.voice(nt, at);
      });
      this.musicBar++;
    }
  }

  killMusic() {
    const bus = window.__shrineMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__shrineMusicBus = null;
    this.musicBar = 0;
  }

  spin() {
    return (this.state.rite.sway || 0) * Math.sin(this.state.t * SWAY_RATE);
  }

  ventOn(i) {
    const ph = (this.state.t + i * 1.8) % VENT_PERIOD;
    return ph < VENT_ON;
  }

  inVent(x, y) {
    return this.state.vents.some((v, i) => this.ventOn(i)
      && x > v.zx && x < v.zx + v.zw && y > v.zy && y < v.zy + v.zh);
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const dt = Math.min(0.045, (now - (this.last || now)) / 1000);
    this.last = now;
    const s = this.state;
    if (this.started && window.__shrineTarget === this && window.__shrineAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__shrineMusicBus) this.killMusic();
    }
    if (s.overlay || s.done) return;

    const patch = {};
    if (s.titleCard && now - s.cardAt > 1700) patch.titleCard = null;
    if (s.titleCard) { this.setState(patch); return; }

    this.speed = (this.speed || 0) * Math.pow(0.1, dt);
    patch.t = s.t + dt;

    const r = s.rite;

    // the taper's flame answers to how fast you move and to the draught,
    // and burning it spends wax that only the altar can replace
    if (s.lit) {
      let flame = s.flame;
      const wax = s.wax - r.wax * dt;
      patch.wax = Math.max(0, wax);
      const draught = this.inVent(s.taper.x, s.taper.y);
      if (draught) flame -= r.drain * dt;
      else if (this.speed > r.limit) flame -= (this.speed - r.limit) * 0.5 * dt;
      else if (this.speed < r.limit * 0.45) flame = Math.min(100, flame + 16 * dt);
      if (wax <= 0) {
        this.sfx("out");
        patch.lit = false; patch.flame = 0; patch.wax = 0;
        patch.spent = s.spent + 1;
        patch.smokeAt = now;
      } else if (flame <= 0) {
        this.sfx("out");
        patch.lit = false; patch.flame = 0;
        patch.guttered = s.guttered + 1;
        patch.smokeAt = now;
      } else patch.flame = clamp(flame, 0, 100);
    }

    // a lit candle slowly wanes and needs coming back to
    const spin = this.spin();
    let blownOut = 0, changed = false;
    const candles = s.candles.map(c => {
      if (!c.lit) return c;
      const p = candlePos(c, spin);
      const draught = this.inVent(p.x, p.y);
      let life = c.life - r.wane * dt - (draught ? CANDLE_SNUFF * dt : 0);
      changed = true;
      if (life <= 0) {
        if (draught) blownOut++;
        return Object.assign({}, c, { lit: false, life: 0 });
      }
      return Object.assign({}, c, { life });
    });
    if (changed) patch.candles = candles;
    if (blownOut) {
      this.sfx("out");
      patch.blown = s.blown + blownOut;
    }
    const litNow = (patch.candles || s.candles).filter(c => c.lit).length;
    if (litNow > s.peak) patch.peak = litNow;

    const left = s.timeLeft - dt;
    if (left <= 0) {
      this.sfx("time");
      this.setState(Object.assign(patch, { timeLeft: 0, done: true, outcome: "time" }), () => this.finish());
      return;
    }
    patch.timeLeft = left;
    this.setState(patch);
  };

  finish() {
    setTimeout(() => this.setState(s => ({ overlay: s.outcome === "time" ? "timeup" : "card" })), 900);
  }

  local(e) {
    const svg = this.svgRef.current;
    if (!svg || !Number.isFinite(e.clientX)) return null;
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / 200, r.height / 140);
    const ox = (r.width - 200 * scale) / 2, oy = (r.height - 140 * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  }

  // moving the taper: pick up the flame, or pass it on
  place(p) {
    const s = this.state;
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
    const patch = { taper: { x: clamp(p.x, PLOT.x0, PLOT.x1), y: clamp(p.y, PLOT.y0, PLOT.y1) } };
    if (Math.hypot(p.x - ALTAR.x, p.y - ALTAR.y) < RELIGHT_R) {
      if (!s.lit || s.flame < 99 || s.wax < 99) {
        if (!s.lit) this.sfx("kindle");
        patch.lit = true;
        patch.flame = 100;
        patch.wax = 100;
        patch.everLit = true;
      }
    } else if (s.lit) {
      let hit = -1;
      const spin = this.spin();
      s.candles.forEach((c, i) => {
        if (c.lit) return;
        const q = candlePos(c, spin);
        if (Math.hypot(p.x - q.x, p.y - (q.y - 4)) < LIGHT_R) hit = i;
      });
      if (hit >= 0) {
        const candles = s.candles.slice();
        candles[hit] = Object.assign({}, candles[hit], { lit: true, life: 100 });
        const count = s.lightings + 1;
        patch.lightings = count;
        this.sfx("light");
        if (count % TOLL_EVERY === 0) {
          // the shrine takes one back: whichever flame was closest to going
          let victim = -1, low = 1e9;
          candles.forEach((c, i) => {
            if (i === hit || !c.lit) return;
            if (c.life < low) { low = c.life; victim = i; }
          });
          if (victim >= 0) {
            const spin = this.spin();
            const vp = candlePos(candles[victim], spin);
            candles[victim] = Object.assign({}, candles[victim], { lit: false, life: 0 });
            patch.tolled = s.tolled + 1;
            patch.puffs = s.puffs.filter(p => Date.now() - p.at < 1400)
              .concat([{ x: vp.x, y: vp.y, at: Date.now() }]);
            setTimeout(() => this.sfx("out"), 180);
          }
        }
        patch.candles = candles;
        if (candles.every(c => c.lit)) {
          this.sfx("all");
          patch.done = true;
          patch.outcome = "all";
          setTimeout(() => this.finish(), 400);
        }
      }
    }
    this.setState(patch);
  }

  onDown = e => {
    const s = this.state;
    if (s.overlay || s.done || s.titleCard) return;
    this.audio();
    this.sfx("take");
    this.lastPt = null;
    const p = this.local(e);
    this.setState({ held: true });
    if (p) this.place(p);
  };

  onMove = e => {
    const s = this.state;
    if (s.overlay || s.done || !s.held) return;
    const p = this.local(e);
    if (!p) return;
    const now = performance.now();
    if (this.lastPt) {
      const dt = Math.max(0.008, (now - this.lastPt.t) / 1000);
      const v = Math.hypot(p.x - this.lastPt.x, p.y - this.lastPt.y) / dt;
      this.speed = Math.max(this.speed || 0, v);
    }
    this.lastPt = { x: p.x, y: p.y, t: now };
    this.place(p);
  };

  onUp = () => {
    if (this.state.overlay) return;
    this.lastPt = null;
    this.setState({ held: false });
  };

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(
      this.freshRite(s.outcome === "time" ? s.round : s.round + 1),
      { overlay: null, muted: s.muted, musicOff: s.musicOff }));
  };

  toggleSound = () => {
    if (!this.state.muted) this.killMusic();
    this.setState(s => ({ muted: !s.muted }));
  };

  toggleMusic = () => {
    this.audio();
    if (this.musicOn()) this.killMusic();
    this.setState(s => ({ musicOff: !s.musicOff }));
  };

  renderVals() {
    const s = this.state, r = s.rite;
    const total = s.candles.length;
    const lit = s.candles.filter(c => c.lit).length;
    const all = lit === total;

    const best = Math.max(lit, s.peak);
    const completion = Math.round((best / total) * 100);
    const care = clamp(100 - s.guttered * 11 - s.spent * 5 - s.blown * 4, 0, 100);
    const score = Math.round(completion * 0.66 + care * 0.34);

    const now = Date.now();
    const spin = this.spin();
    const candles = s.candles.map((c, i) => {
      const L = clamp(c.life / 100, 0, 1);
      const fh = 2.8 + L * 4, fw = 1.5 + L * 1.9, top = -6.4;
      const p = candlePos(c, spin);
      const draught = c.lit && this.inVent(p.x, p.y);
      return {
        t: "translate(" + n(p.x) + " " + n(p.y) + ")",
        draught,
        lit: c.lit,
        wax: c.lit ? "#e8d9bc" : "#cdbfa4",
        glow: n(5.5 + L * 6),
        flameD: "M 0 " + n(top - fh) + " q " + n(fw) + " " + n(fh * 0.66) + " 0 " + n(fh)
          + " q " + n(-fw) + " " + n(-fh * 0.34) + " 0 " + n(-fh) + " Z",
        coreD: "M 0 " + n(top - fh * 0.56) + " q " + n(fw * 0.5) + " " + n(fh * 0.36) + " 0 " + n(fh * 0.58)
          + " q " + n(-fw * 0.5) + " " + n(-fh * 0.22) + " 0 " + n(-fh * 0.58) + " Z",
        waning: c.lit && (L < 0.34 || draught),
        flick: (1 + (i % 5) * 0.18).toFixed(2) + "s"
      };
    });

    const vents = s.vents.map((v, i) => {
      const slats = [0, 1, 2, 3].map(k => {
        const y = v.gy + 3 + k * ((v.gh - 6) / 3);
        return "M " + (v.gx + 1) + " " + n(y) + " L " + (v.gx + v.gw - 1) + " " + n(y);
      }).join(" ");
      const puffs = [0, 1, 2].map(k => {
        const bx = v.dir === 0 ? v.zx + 5 + k * 7 : (v.dir > 0 ? v.zx + 2 + k * 6 : v.zx + v.zw - 2 - k * 6);
        const by = v.dir === 0 ? v.zy + v.zh - 3 - k * 2 : v.zy + 5 + k * 6;
        const dx = v.dir === 0 ? 0 : v.dir * 7;
        const dy = v.dir === 0 ? -7 : 0;
        return {
          d: "M " + n(bx) + " " + n(by) + " q " + n(dx / 2 + dy / 3) + " " + n(dy / 2 - dx / 3) + " " + n(dx) + " " + n(dy),
          style: "animation:shGust " + (0.9 + k * 0.16) + "s ease-in-out " + (k * 0.2) + "s infinite"
        };
      });
      return {
        gx: v.gx, gy: v.gy, gw: v.gw, gh: v.gh,
        zx: v.zx, zy: v.zy, zw: v.zw, zh: v.zh,
        slats, puffs,
        blowing: this.ventOn(i),
        zoneFill: this.ventOn(i) ? 0.16 : 0.04,
        zoneStroke: this.ventOn(i) ? 0.7 : 0.22
      };
    });

    const fl = s.flame / 100;
    const fh = 3.4 + fl * 7;
    const fw = 1.6 + fl * 2.4;
    const tlen = 7 + (s.wax / 100) * 14;
    const ttop = 12 - tlen;
    const tbase = ttop - 2;

    return {
      hudKicker: "Rite " + ((s.round % 4) + 1) + " of 4",
      stageLabel: r.name,
      riteText: r.name + " · " + total + " candles",
      litText: lit + "/" + total,
      litColor: all ? "#2f7d3a" : "#6b6864",
      timerText: Math.ceil(s.timeLeft) + "s",
      timerPct: n(clamp(s.timeLeft / s.total, 0, 1) * 100),
      timerColor: s.timeLeft < s.total * 0.15 ? "#c2210f"
        : s.timeLeft < s.total * 0.33 ? "#c2560f" : "#201e1d",
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleMusic: this.toggleMusic, toggleSound: this.toggleSound,
      onDown: this.onDown, onMove: this.onMove, onUp: this.onUp,

      svgRef: this.svgRef,
      railD: (() => {
        const pts = [];
        for (let i = 0; i <= 24; i++) {
          const a = (36 + (i / 24) * 108) * Math.PI / 180 + spin;
          pts.push(n(ALTAR.x + Math.cos(a) * 50) + " " + n(ALTAR.y + Math.sin(a) * 50));
        }
        return "M " + pts.join(" L ");
      })(),
      railOuterD: (() => {
        const pts = [];
        for (let i = 0; i <= 24; i++) {
          const a = (36 + (i / 24) * 108) * Math.PI / 180 + spin;
          pts.push(n(ALTAR.x + Math.cos(a) * 68) + " " + n(ALTAR.y + Math.sin(a) * 68));
        }
        return "M " + pts.join(" L ");
      })(),
      hasOuterRail: s.candles.some(c => c.r === 68),
      candles, vents,
      clockText: s.timeLeft < 6 ? s.timeLeft.toFixed(1) : Math.ceil(s.timeLeft) + "",
      clockPct: n(clamp(s.timeLeft / s.total, 0, 1) * 100),
      clockColor: s.timeLeft < s.total * 0.15 ? "#c2210f"
        : s.timeLeft < s.total * 0.33 ? "#c2560f" : "#201e1d",
      clockUrgent: s.timeLeft < s.total * 0.15,
      tollPips: [0, 1, 2, 3].map(i => ({
        fill: i < s.lightings % TOLL_EVERY ? "#c2560f" : "#dedcd6"
      })),
      tollNote: (TOLL_EVERY - (s.lightings % TOLL_EVERY)) + " more takes one",
      puffs: (s.puffs || []).filter(p => Date.now() - p.at < 1400)
        .map(p => ({ t: "translate(" + n(p.x) + " " + n(p.y) + ")" })),
      showTaper: true,
      taperT: "translate(" + n(s.taper.x) + " " + n(s.taper.y) + ")",
      taperLit: s.lit,
      taperGlow: n(5 + fl * 9),
      taperTop: n(ttop), taperLen: n(tlen),
      taperWickD: "M 0 " + n(ttop) + " L 0 " + n(tbase),
      taperTipY: n(tbase),
      taperFlameD: "M 0 " + n(tbase - fh) + " q " + n(fw) + " " + n(fh * 0.66) + " 0 " + n(fh)
        + " q " + n(-fw) + " " + n(-fh * 0.34) + " 0 " + n(-fh) + " Z",
      taperCoreD: "M 0 " + n(tbase - fh * 0.55) + " q " + n(fw * 0.5) + " " + n(fh * 0.36) + " 0 " + n(fh * 0.58)
        + " q " + n(-fw * 0.5) + " " + n(-fh * 0.22) + " 0 " + n(-fh * 0.58) + " Z",
      waxPct: Math.round(s.wax),
      waxColor: s.wax > 60 ? "#2f7d3a" : s.wax > 28 ? "#c2560f" : "#c2210f",
      showSmoke: !s.lit && s.smokeAt > 0 && now - s.smokeAt < 1500,

      needsRelight: !s.lit && s.everLit && !all && !s.done,
      relightWord: s.wax <= 0 ? "FRESH TAPER AT THE ALTAR" : "BACK TO THE FLAME",
      relightD: "M " + n(s.taper.x) + " " + n(s.taper.y - 8) + " Q "
        + n((s.taper.x + ALTAR.x) / 2) + " " + n(Math.min(s.taper.y, ALTAR.y) - 14) + " "
        + ALTAR.x + " " + n(ALTAR.y + 4),
      relightLx: n(clamp((s.taper.x + ALTAR.x) / 2 - 46, 8, 108)),
      relightLy: n(clamp(Math.min(s.taper.y, ALTAR.y) - 20, 14, 110)),

      allLit: all,

      showPanel: !s.overlay && !s.titleCard,
      flamePct: n(s.lit ? s.flame : 0),
      flameWord: !s.lit ? "Out" : s.flame > 66 ? "Steady" : s.flame > 33 ? "Low" : "Guttering",
      flameColor: !s.lit ? "#a8a6a0" : s.flame > 66 ? "#2f7d3a" : s.flame > 33 ? "#c2560f" : "#c2210f",
      panelNote: s.wax <= 0 ? "Wax spent — back to the altar"
        : !s.lit ? (s.everLit ? "Touch the eternal flame" : "Start at the eternal flame")
        : this.inVent(s.taper.x, s.taper.y) ? "In the draught"
        : s.wax < 30 ? "Running short on wax" : "Move gently",

      showHint: !s.overlay && !s.titleCard,
      hintText: all ? "Every candle lit. The rite is kept."
        : "Touch the eternal flame, then each candle. Every fourth one lit puts another out.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showTimeUp: s.overlay === "timeup",
      timeUpTally: lit + " of " + total + " candles lit",
      timeUpBest: best < total ? "Most alight at once: " + best : "",
      hasTimeUpBest: best > 0 && best < total,
      showCard: s.overlay === "card",
      cardKicker: s.outcome === "time" ? r.name + " · time ran out"
        : s.round + 1 >= 4 ? "Observances kept · " + r.name : r.name + " · kept",
      cardScore: score + " / 100",
      cardMood: s.outcome === "time"
        ? "The hour passed with the shrine unfinished. Begin again."
        : score >= 92 ? "Not a candle missed, not a flame lost."
        : score >= 78 ? "A well-kept rite." : score >= 60 ? "The shrine is lit, mostly."
        : "Rather a lot of relighting.",
      cardRows: [
        { name: "Candles", val: completion, pct: completion, color: completion >= 75 ? "#2f7d3a" : completion >= 45 ? "#b07d00" : "#c2210f" },
        { name: "Flame kept", val: care, pct: care, color: care >= 75 ? "#2f7d3a" : care >= 45 ? "#b07d00" : "#c2210f" }
      ],
      cardNotes: (() => {
        const out = [];
        if (best < total) out.push({ text: "Most alight at once: " + best + " of " + total + "." });
        if (s.guttered) out.push({ text: "The taper blew out " + s.guttered + (s.guttered > 1 ? " times." : " time.") });
        if (s.spent) out.push({ text: s.spent + " taper" + (s.spent > 1 ? "s" : "") + " burned down to nothing." });
        if (s.blown) out.push({ text: s.blown + " candle" + (s.blown > 1 ? "s" : "") + " blown out by the vents." });
        if (s.tolled) out.push({ text: "The shrine took " + s.tolled + " back — one for every four lit." });
        if (r.wane > 0 && best === total) out.push({ text: "Held the whole shrine alight at once." });
        if (all && !s.guttered && !s.spent) out.push({ text: "Not a flame lost on the way." });
        return out;
      })(),
      hasNotes: true,
      cardCta: s.outcome === "time" ? "Light them again"
        : s.round + 1 >= 4 ? "Keep the rites again" : "Next observance",
      cardAction: this.cardAction
    };
  }
}
