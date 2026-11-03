
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const STOOL_X = [32, 78, 124, 170];
const STOOL_Y = 20;
const STATION = { x: 100, y: 78 };
const BOTTLE_X = [30, 56, 82, 108, 134, 160];
const BOTTLE_Y = 116;
const TAP = { x: 12, y: 56, w: 24, h: 44 };
const MAX_QUEUE = 4;

// the speed rail: the ticket shows these as colour chips, so it reads without words
const BOTTLES = [
  { key: "amber", fill: "#d9a84e", cap: "#8f6b28" },
  { key: "rose", fill: "#d9628a", cap: "#8f2b4e" },
  { key: "teal", fill: "#2fbfae", cap: "#1c7a70" },
  { key: "violet", fill: "#8a6ad9", cap: "#4e3a8f" },
  { key: "green", fill: "#6f9d4a", cap: "#3f6b28" },
  { key: "cream", fill: "#e8dcc0", cap: "#a89670" }
];
const BFILL = {};
BOTTLES.forEach(b => { BFILL[b.key] = b.fill; });

// Quirk's list — the house pours and the shaken ones
const DRINKS = [
  { name: "Root Beer", kind: "tap", colour: "#95561f", head: true, ice: 6 },
  { name: "Slug-o-Kola", kind: "tap", colour: "#3f9455", head: true, ice: 6 },
  { name: "Bloodvine", kind: "tap", colour: "#b02334", head: false, ice: 0 },
  { name: "Romulon Ale", kind: "tap", colour: "#2f6bcf", head: true, ice: 6 },
  { name: "Warp Core Breech", kind: "shaken", colour: "#2fd6c0", mix: ["teal", "violet"], ice: 6 },
  { name: "Samerian Sunset", kind: "shaken", colour: "#e06a8a", mix: ["rose", "amber"], ice: 6 },
  { name: "Black Hole", kind: "shaken", colour: "#5a3fa0", mix: ["violet", "green"], ice: 6 },
  { name: "Tranyo", kind: "shaken", colour: "#e8913a", mix: ["amber", "cream"], ice: 6 },
  { name: "Kanor", kind: "shaken", colour: "#cfc63f", mix: ["amber", "green"], ice: 6 },
  { name: "Raktajine", kind: "shaken", colour: "#53341f", mix: ["cream", "violet"], ice: 0 }
];
const BUCKET = { x: 150, y: 64, w: 34, h: 32 };
const ICE_PER_GRAB = 2;
// where each cube settles in the glass
const ICE_PILE = [
  [-3.2, 8.2, -12], [0.7, 9.2, 16], [3.9, 7.4, -6],
  [-2.5, 4.2, 22], [1.5, 4.9, -18], [-0.4, 0.8, 9]
];

const SPECIES = [
  { fur: "#ee7d24", dark: "#b8531a", inner: "#f9ecd9", cloth: "#1f3350", clothDark: "#16263c", ear: "fox" },
  { fur: "#dedcd6", dark: "#a8a6a0", inner: "#f6f4ef", cloth: "#4a3a5c", clothDark: "#332745", ear: "cat" },
  { fur: "#9a6f4a", dark: "#6b4a2c", inner: "#d9bb96", cloth: "#3f5d47", clothDark: "#2b4232", ear: "bear" },
  { fur: "#f0e6da", dark: "#bfae99", inner: "#f8f2ea", cloth: "#8f2b1e", clothDark: "#661a10", ear: "rabbit" },
  { fur: "#8fb8d6", dark: "#5c86a8", inner: "#e0f0fa", cloth: "#2f4a3a", clothDark: "#1f3327", ear: "cat" },
  { fur: "#c8a86a", dark: "#95783f", inner: "#f2e6c8", cloth: "#3a2f4a", clothDark: "#261f33", ear: "fox" }
];
const EARS = {
  fox: { l: "M -6 -5 L -10 -16 L -2 -9 Z", r: "M 6 -5 L 10 -16 L 2 -9 Z" },
  cat: { l: "M -6 -5 L -9 -13 L -1.4 -8 Z", r: "M 6 -5 L 9 -13 L 1.4 -8 Z" },
  bear: { l: "M -7.4 -6 a 3.6 3.6 0 1 1 3.4 -2", r: "M 7.4 -6 a 3.6 3.6 0 1 0 -3.4 -2" },
  rabbit: { l: "M -4.6 -6 q -4.6 -11 -1.4 -15 q 4 2 3.4 14 Z", r: "M 4.6 -6 q 4.6 -11 1.4 -15 q -4 2 -3.4 14 Z" }
};

const SHIFTS = [
  { name: "Quiet shift", total: 6, every: 5.6, patience: 26, pourTol: 13, shakeTol: 20, need: 5 },
  { name: "Freighter crews in", total: 9, every: 4.6, patience: 23, pourTol: 11, shakeTol: 17, need: 6 },
  { name: "Docking day rush", total: 12, every: 3.8, patience: 20, pourTol: 9.5, shakeTol: 14, need: 7 },
  { name: "Station's birthday", total: 15, every: 3.2, patience: 18, pourTol: 8, shakeTol: 12, need: 8 }
];

const POUR_RATE = 30;
const SHAKE_PER = 11;

function rng(seed) {
  let s = seed + 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MUSIC = (() => {
  const notes = [];
  // lounge bar loop: walking bass, brushed tick, a lazy vibe melody
  const bass = [38, 45, 41, 48, 36, 43, 40, 47];
  bass.forEach((m, i) => {
    notes.push({ b: i * 4, m, d: 3.4, v: "bass" });
    notes.push({ b: i * 4 + 2, m: m + 7, d: 1.4, v: "bass" });
  });
  [[1, 74], [2.5, 77], [4, 79], [6.5, 77], [9, 74], [10.5, 72], [13, 69],
   [17, 76], [18.5, 79], [21, 81], [23.5, 79], [25, 76], [27.5, 72], [30, 74]
  ].forEach(p => notes.push({ b: p[0], m: p[1], d: 1.8, v: "vibe" }));
  for (let b = 0; b < 32; b += 1) notes.push({ b: b + 0.5, m: 92, d: 0.07, v: "tick" });
  return { notes, beats: 32, spb: 0.44 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

let CID = 0;

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshShift(0));
  }

  freshShift(round) {
    const cfg = SHIFTS[round % SHIFTS.length];
    const rand = rng(round * 5431 + 7);
    const orders = [];
    // exactly one drink in every four comes without ice, its slot picked at random
    const iced = DRINKS.filter(x => (x.ice || 0) > 0);
    const plain = DRINKS.filter(x => (x.ice || 0) === 0);
    const plainAt = {};
    for (let g = 0; g * 4 < cfg.total; g++) plainAt[g * 4 + Math.floor(rand() * 4)] = true;
    for (let i = 0; i < cfg.total; i++) {
      const pool = plainAt[i] ? plain : iced;
      const d = pool[Math.floor(rand() * pool.length)];
      const mixTargets = (d.mix || []).map(() => 30 + Math.floor(rand() * 16));
      orders.push({
        drink: d,
        sp: SPECIES[Math.floor(rand() * SPECIES.length)],
        // a target fill high in the glass, but never the same twice running
        target: 58 + Math.floor(rand() * 30),
        mixTargets,
        shakeTarget: 45 + Math.floor(rand() * 34)
      });
    }
    return {
      round, cfg, orders, nextIn: 0.9, spawned: 0,
      stools: [null, null, null, null], queue: [],
      active: null,
      vessel: null,
      served: 0, walked: 0, wrong: 0, accSum: 0, accN: 0, patSum: 0, dumpedAt: 0,
      drag: null, pops: [], t: 0, done: false,
      titleCard: [cfg.name, cfg.total + " customers · serve " + cfg.need],
      cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__quirksTarget = this;
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
    if (!window.__quirksAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__quirksAC = new AC();
      const b = window.__quirksAC.createBuffer(1, window.__quirksAC.sampleRate * 1.2, window.__quirksAC.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      window.__quirksNoise = b;
      window.addEventListener("pagehide", () => { try { window.__quirksAC.close(); } catch (e) {} });
    }
    this.actx = window.__quirksAC;
    this.noise = window.__quirksNoise;
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
    if (kind === "ticket") this.tone(880, 0.06, 0.035, "triangle", 1180);
    else if (kind === "pour") this.burst({ f0: 900, f1: 500, dur: 0.2, gain: 0.035, type: "lowpass", q: 0.8 });
    else if (kind === "bottle") this.tone(560, 0.06, 0.04, "square", 780);
    else if (kind === "shake") this.burst({ f0: 2400, f1: 1400, dur: 0.07, gain: 0.05, type: "bandpass", q: 1.6 });
    else if (kind === "serve") [0, 7, 12].forEach((s, i) => setTimeout(() => this.tone(midiHz(76 + s), 0.14, 0.045, "triangle"), i * 55));
    else if (kind === "great") [0, 4, 7, 12].forEach((s, i) => setTimeout(() => this.tone(midiHz(76 + s), 0.2, 0.05, "triangle"), i * 80));
    else if (kind === "bad") this.tone(170, 0.24, 0.06, "square", 108);
    else if (kind === "walk") { this.tone(300, 0.18, 0.05, "square", 150); setTimeout(() => this.tone(220, 0.22, 0.05, "square", 120), 190); }
    else if (kind === "arrive") this.tone(640, 0.07, 0.028, "sine", 820);
    else if (kind === "close") [0, 5, 9, 12].forEach((s, i) => setTimeout(() => this.tone(midiHz(72 + s), 0.26, 0.05, "triangle"), i * 110));
  }

  voice(nt, at) {
    const ac = this.actx, g = ac.createGain(), o = ac.createOscillator();
    const dur = nt.d * MUSIC.spb;
    let peak = 0.02;
    if (nt.v === "bass") { o.type = "triangle"; peak = 0.046; }
    else if (nt.v === "vibe") { o.type = "sine"; peak = 0.036; }
    else { o.type = "square"; peak = 0.007; }
    o.frequency.setValueAtTime(midiHz(nt.m), at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(window.__quirksMusicBus);
    o.start(at); o.stop(at + dur + 0.03);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__quirksMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__quirksMusicBus = bus;
      this.musicStart = ac.currentTime + 0.12;
      this.musicBar = 0;
    }
    const barLen = MUSIC.beats * MUSIC.spb;
    while (this.musicStart + this.musicBar * barLen < ac.currentTime + 0.9) {
      const base = this.musicStart + this.musicBar * barLen;
      MUSIC.notes.forEach(nt => {
        const at = base + nt.b * MUSIC.spb;
        if (at > ac.currentTime - 0.05) this.voice(nt, at);
      });
      this.musicBar++;
    }
  }

  killMusic() {
    const bus = window.__quirksMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__quirksMusicBus = null;
    this.musicBar = 0;
  }

  pop(x, y, ok) {
    this.setState(s => ({
      pops: s.pops.filter(p => Date.now() - p.at < 1100)
        .concat([{ x, y, ok, at: Date.now() }])
    }));
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const dt = Math.min(0.045, (now - (this.last || now)) / 1000);
    this.last = now;
    const s = this.state;
    if (this.started && window.__quirksTarget === this && window.__quirksAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__quirksMusicBus) this.killMusic();
    }
    if (s.overlay || s.done) return;

    const patch = { t: s.t + dt };
    if (s.titleCard && now - s.cardAt > 1700) patch.titleCard = null;
    if (s.titleCard) { this.setState(patch); return; }

    const cfg = s.cfg;
    let stools = s.stools.slice();
    let queue = s.queue.slice();
    let spawned = s.spawned, walked = s.walked, patSum = s.patSum;
    let active = s.active;

    // arrivals: take a stool if there is one, otherwise wait in line
    let nextIn = s.nextIn - dt;
    if (nextIn <= 0 && spawned < cfg.total) {
      const o = s.orders[spawned];
      const seat = stools.indexOf(null);
      const guest = { id: ++CID, drink: o.drink, sp: o.sp, target: o.target,
        mixTargets: o.mixTargets, shakeTarget: o.shakeTarget,
        pat: cfg.patience, max: cfg.patience };
      if (seat >= 0) { stools[seat] = guest; this.sfx("arrive"); spawned++; nextIn = cfg.every; }
      else if (queue.length < MAX_QUEUE) { queue.push(guest); spawned++; nextIn = cfg.every; }
      else nextIn = 0.6;
    } else if (spawned < cfg.total) patch.nextIn = nextIn;
    if (nextIn !== s.nextIn) patch.nextIn = nextIn;

    // seat anyone waiting as soon as a stool frees
    let seatOpen = stools.indexOf(null);
    while (seatOpen >= 0 && queue.length) {
      stools[seatOpen] = queue.shift();
      seatOpen = stools.indexOf(null);
    }

    // patience runs down for everyone at the bar
    let changed = false, dumped = false;
    stools = stools.map((g, i) => {
      if (!g) return g;
      const pat = g.pat - dt;
      changed = true;
      if (pat <= 0) {
        this.sfx("walk");
        this.pop(STOOL_X[i], STOOL_Y + 6, false);
        walked++;
        if (active === i) { active = null; dumped = true; }
        return null;
      }
      return Object.assign({}, g, { pat });
    });
    if (changed) patch.stools = stools;
    if (dumped) { patch.vessel = null; patch.dumpedAt = now; }
    patch.queue = queue;
    patch.spawned = spawned;
    patch.walked = walked;
    patch.active = active;

    // a held bottle grows its own layer in the mixing glass
    if (s.vessel && s.vessel.pouring) {
      const v = Object.assign({}, s.vessel);
      const pours = v.pours.slice();
      const cur = Object.assign({}, pours[v.step]);
      const below = pours.slice(0, v.step).reduce((a, p) => a + p.amount, 0);
      cur.amount = cur.amount + POUR_RATE * dt;
      pours[v.step] = cur;
      v.pours = pours;
      patch.vessel = v;
      if (below + cur.amount >= 112) {
        this.sfx("bad");
        patch.vessel = Object.assign({}, v, { pouring: false, spilled: true, step: v.drink.mix.length, phase: "shaking" });
      }
    }

    // pouring while the tap handle is held
    if (s.vessel && s.vessel.phase === "pouring") {
      const v = Object.assign({}, s.vessel);
      v.fill = Math.min(118, v.fill + POUR_RATE * dt);
      patch.vessel = v;
      if (v.fill >= 118) {
        this.sfx("bad");
        patch.vessel = Object.assign({}, v, { phase: "ready", spilled: true });
      }
    }

    const allGone = spawned >= cfg.total && stools.every(g => !g) && !queue.length;
    if (allGone) {
      patch.done = true;
      this.sfx("close");
      setTimeout(() => this.setState({ overlay: "card" }), 1100);
    }

    this.setState(patch);
  };

  local(e) {
    const svg = this.svgRef.current;
    if (!svg || !Number.isFinite(e.clientX)) return null;
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / 200, r.height / 140);
    const ox = (r.width - 200 * scale) / 2, oy = (r.height - 140 * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  }

  ticket() {
    const s = this.state;
    return s.active != null ? s.stools[s.active] : null;
  }

  // take an order: this is what tells the station what it is building
  takeOrder = i => {
    const s = this.state;
    if (s.overlay || s.done || !s.stools[i]) return;
    this.audio();
    this.sfx("ticket");
    const g = s.stools[i];
    this.setState({
      active: i,
      vessel: { drink: g.drink,
        phase: (g.drink.ice || 0) > 0 ? "ice" : (g.drink.kind === "tap" ? "empty" : "loading"),
        ice: 0, fill: 0, pours: [], step: 0, pouring: false, shake: 0, strokes: 0, spilled: false }
    });
  };

  onTapTower = () => {};

  grabIce(p) {
    const v = this.state.vessel;
    if (!v || v.phase !== "ice") return false;
    this.audio();
    this.sfx("bottle");
    this.setState({ iceDrag: { x: p.x, y: p.y } });
    return true;
  }

  dropIce(p) {
    const v = this.state.vessel;
    this.setState({ iceDrag: null });
    if (!v || v.phase !== "ice") return;
    if (Math.hypot(p.x - STATION.x, p.y - STATION.y) > 24) return;
    this.sfx("shake");
    const need = v.drink.ice || 0;
    const ice = Math.min(need, v.ice + ICE_PER_GRAB);
    const full = ice >= need;
    this.setState({ vessel: Object.assign({}, v, {
      ice,
      phase: full ? (v.drink.kind === "tap" ? "empty" : "loading") : "ice"
    }) });
  }

  startPour(key) {
    const s = this.state;
    const v = s.vessel;
    const g = this.ticket();
    if (!v || !g || v.drink.kind !== "shaken" || v.phase !== "loading") return;
    this.audio();
    const want = v.drink.mix[v.step];
    if (key !== want) {
      this.sfx("bad");
      const bi = BOTTLES.findIndex(b => b.key === key);
      if (bi >= 0) this.pop(BOTTLE_X[bi], BOTTLE_Y - 16, false);
      this.setState(st => ({ wrong: st.wrong + 1 }));
      return;
    }
    this.sfx("pour");
    this.setState({ vessel: Object.assign({}, v, {
      pouring: true,
      pours: v.pours.length > v.step ? v.pours : v.pours.concat([{ key, amount: 0 }])
    }) });
  }

  endPour() {
    const v = this.state.vessel;
    if (!v || !v.pouring) return;
    this.sfx("bottle");
    const step = v.step + 1;
    const done = step >= v.drink.mix.length;
    this.setState({ vessel: Object.assign({}, v, {
      pouring: false, step, phase: done ? "shaking" : "loading"
    }) });
  }

  onDown = e => {
    const s = this.state;
    if (s.overlay || s.done || s.titleCard) return;
    this.audio();
    const p = this.local(e);
    if (!p) return;

    // hold the tap to pour a draught
    const v = s.vessel;
    if (v && v.drink.kind === "tap" && (v.phase === "empty" || v.phase === "pouring")
      && p.x > TAP.x - 4 && p.x < TAP.x + TAP.w + 6 && p.y > TAP.y && p.y < TAP.y + TAP.h) {
      this.sfx("pour");
      this.setState({ vessel: Object.assign({}, v, { phase: "pouring" }) });
      return;
    }

    // pick the finished drink up off the rail to carry it over
    if (v && v.phase === "ready" && Math.hypot(p.x - STATION.x, p.y - STATION.y) < 24) {
      this.setState({ drag: { x: p.x, y: p.y } });
      return;
    }

    // lift a cube out of the bucket
    if (v && v.phase === "ice"
      && p.x > BUCKET.x - 4 && p.x < BUCKET.x + BUCKET.w + 4
      && p.y > BUCKET.y - 4 && p.y < BUCKET.y + BUCKET.h + 4) {
      if (this.grabIce(p)) return;
    }

    // press and hold a bottle to pour it
    if (v && v.drink.kind === "shaken" && v.phase === "loading"
      && p.y > BOTTLE_Y - 16 && p.y < BOTTLE_Y + 12) {
      let bi = -1;
      BOTTLE_X.forEach((x, i) => { if (Math.abs(p.x - x) < 12) bi = i; });
      if (bi >= 0) { this.startPour(BOTTLES[bi].key); return; }
    }

    // shaking: the stroke counter starts on the first drag
    if (v && v.phase === "shaking" && Math.hypot(p.x - STATION.x, p.y - STATION.y) < 26) {
      this.shakeFrom = p.x;
      this.shakeDir = 0;
      this.setState({ shaking: true });
      return;
    }
  };

  onMove = e => {
    const s = this.state;
    if (s.overlay || s.done) return;
    const p = this.local(e);
    if (!p) return;

    if (s.iceDrag) { this.setState({ iceDrag: { x: p.x, y: p.y } }); return; }
    if (s.drag) { this.setState({ drag: { x: p.x, y: p.y } }); return; }

    if (s.shaking && s.vessel && s.vessel.phase === "shaking") {
      const dx = p.x - (this.shakeFrom == null ? p.x : this.shakeFrom);
      const dir = dx > 2 ? 1 : dx < -2 ? -1 : 0;
      if (dir !== 0 && dir !== this.shakeDir) {
        this.shakeDir = dir;
        this.shakeFrom = p.x;
        this.sfx("shake");
        this.setState(st => {
          const v = st.vessel;
          return { vessel: Object.assign({}, v, {
            strokes: v.strokes + 1,
            shake: Math.min(125, v.shake + SHAKE_PER)
          }) };
        });
      }
    }
  };

  onUp = e => {
    const s = this.state;
    if (s.overlay || s.done) return;

    if (s.drag) {
      const p = s.drag;
      let hit = -1;
      STOOL_X.forEach((x, i) => {
        if (Math.abs(p.x - x) < 24 && p.y < 58) hit = i;
      });
      this.setState({ drag: null }, () => { if (hit >= 0) this.serve(hit); });
      return;
    }

    if (s.iceDrag) { this.dropIce(s.iceDrag); return; }

    if (s.vessel && s.vessel.pouring) { this.endPour(); return; }

    if (s.vessel && s.vessel.phase === "pouring") {
      this.setState({ vessel: Object.assign({}, s.vessel, { phase: "ready" }) });
      return;
    }

    if (s.shaking) {
      this.shakeFrom = null;
      const v = s.vessel;
      this.setState({ shaking: false,
        vessel: v && v.strokes > 0
          ? Object.assign({}, v, { phase: "ready", readyAt: Date.now() }) : v });
    }
  };

  serve(i) {
    const s = this.state;
    const g = s.stools[i];
    const v = s.vessel;
    if (!g || !v || v.phase !== "ready") return;

    if (g.drink.name !== v.drink.name) {
      this.sfx("bad");
      this.pop(STOOL_X[i], STOOL_Y + 6, false);
      this.setState(st => ({ wrong: st.wrong + 1, vessel: null, active: null }));
      return;
    }

    const cfg = s.cfg;
    let acc;
    if (v.drink.kind === "tap") {
      acc = v.spilled ? 0 : clamp(100 - Math.abs(v.fill - g.target) * (100 / (cfg.pourTol * 2.6)), 0, 100);
    } else {
      const shakeAcc = clamp(100 - Math.abs(v.shake - g.shakeTarget) * (100 / (cfg.shakeTol * 2.6)), 0, 100);
      let pourAcc = 0;
      const tgts = g.mixTargets || [];
      tgts.forEach((t, i) => {
        const got = v.pours[i] ? v.pours[i].amount : 0;
        pourAcc += clamp(100 - Math.abs(got - t) * (100 / (cfg.pourTol * 2.6)), 0, 100);
      });
      pourAcc = tgts.length ? pourAcc / tgts.length : 0;
      acc = v.spilled ? 0 : pourAcc * 0.55 + shakeAcc * 0.45;
    }
    const patLeft = clamp(g.pat / g.max, 0, 1) * 100;
    this.sfx(acc >= 82 ? "great" : "serve");
    this.pop(STOOL_X[i], STOOL_Y + 6, true);

    const stools = s.stools.slice();
    stools[i] = null;
    this.setState({
      stools, vessel: null, active: null,
      served: s.served + 1,
      accSum: s.accSum + acc, accN: s.accN + 1,
      patSum: s.patSum + patLeft
    });
  }

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(
      this.freshShift(s.served >= s.cfg.need ? s.round + 1 : s.round),
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
    const s = this.state, cfg = s.cfg;
    const v = s.vessel;
    const tick = this.ticket();
    const now = Date.now();

    const stools = STOOL_X.map((x, i) => {
      const g = s.stools[i];
      if (!g) return { t: "translate(" + x + " " + STOOL_Y + ")", busy: false, empty: true };
      const ears = EARS[g.sp.ear];
      const pf = clamp(g.pat / g.max, 0, 1);
      const iceN = g.drink.ice || 0;
      const GW = 8, GAP = 4.2, CW = 3.4;
      const rowW = GW + (iceN ? GAP + CW : 0);
      const rowX = -rowW / 2;
      const iceChips = iceN ? [{ x: n(rowX + GW + GAP + CW / 2) }] : [];
      let acc1 = 0;
      const totT = (g.mixTargets || []).reduce((a, t) => a + t, 0) || 1;
      const mixChips = g.drink.kind === "shaken"
        ? g.drink.mix.map((k, j) => {
            const t = (g.mixTargets || [])[j] || 0;
            const y0 = 4.6 - 9.2 * (acc1 / totT);
            acc1 += t;
            const y1 = 4.6 - 9.2 * (acc1 / totT);
            return { y: n(y1), h: n(Math.max(1, y0 - y1)), fill: BFILL[k] };
          })
        : [];
      return {
        t: "translate(" + x + " " + STOOL_Y + ")",
        busy: true, empty: false,
        active: s.active === i,
        onTap: () => this.takeOrder(i),
        fur: g.sp.fur, dark: g.sp.dark, inner: g.sp.inner,
        cloth: g.sp.cloth, clothDark: g.sp.clothDark,
        earL: ears.l, earR: ears.r,
        mouth: pf > 0.5 ? "M -2.4 3.4 q 2.4 2 4.8 0" : "M -2.4 4.4 q 2.4 -1.8 4.8 0",
        drink: g.drink.name,
        isTap: g.drink.kind === "tap",
        isShaken: g.drink.kind === "shaken",
        colour: g.drink.colour,
        mix: mixChips,
        iceChips, hasIce: iceN > 0,
        glyphX: n(rowX), glyphMid: n(rowX + 8), glyphCx: n(rowX + 4),
        patW: n(40.8 * pf),
        patColour: pf > 0.5 ? "#2f7d3a" : pf > 0.25 ? "#c2560f" : "#c2210f"
      };
    });

    // geometry shared by every level in the vessel
    const gTopY = -15, gBotY = 13, gH = 28;
    const hwAt = y => 6.4 + ((gBotY - y) / gH) * 0 + 1.6 * ((gBotY - y) / gH === 0 ? 0 : 0) + (6.4 + 1.6 * (1 - (gBotY - y) / gH) - 6.4);
    const halfW = y => 6.4 + 1.6 * ((gBotY - y) / gH);
    const yOf = L => gBotY - gH * clamp(L / 100, 0, 1.12);
    const band = (lo, hi) => ({ top: n(yOf(hi)), bot: n(yOf(lo)) });
    const trap = (lo, hi) => {
      const yT = yOf(hi), yB = yOf(lo);
      return "M " + n(-halfW(yT)) + " " + n(yT) + " L " + n(halfW(yT)) + " " + n(yT)
        + " L " + n(halfW(yB)) + " " + n(yB) + " L " + n(-halfW(yB)) + " " + n(yB) + " Z";
    };

    // each poured ingredient is its own visible layer
    const layers = [];
    if (v && v.drink.kind === "shaken") {
      let acc0 = 0;
      (v.pours || []).forEach(p => {
        layers.push({ d: trap(acc0, acc0 + p.amount), fill: BFILL[p.key] });
        acc0 += p.amount;
      });
    }
    const poured = (v && v.pours ? v.pours.reduce((a, p) => a + p.amount, 0) : 0);

    // the vessel: a glass for draught, a shaker for mixed
    const isShaker = !!v && v.drink.kind === "shaken" && v.phase !== "ready";
    const isGlass = !!v && (v.drink.kind === "tap" || v.phase === "ready");
    const fillPct = v ? (v.drink.kind === "tap" ? v.fill : (v.phase === "ready" ? Math.max(60, poured) : poured)) : 0;
    const gh = gH, gTop = gTopY;
    const lvl = clamp(fillPct / 100, 0, 1);
    const liqTop = yOf(fillPct);
    const headH = v && v.drink.head && v.phase === "ready" ? 3.4 : 0;

    const isMixPour = !!v && v.drink.kind === "shaken" && v.phase === "loading";
    const stepTarget = isMixPour && tick && tick.mixTargets ? (tick.mixTargets[v.step] || 0) : 0;
    const below = isMixPour ? (v.pours || []).slice(0, v.step).reduce((a, p) => a + p.amount, 0) : 0;
    const target = tick ? (v && v.drink.kind === "tap" ? tick.target : tick.shakeTarget) : 70;
    const tol = (v && v.drink.kind === "tap") || isMixPour ? cfg.pourTol : cfg.shakeTol;
    const bnd = isMixPour
      ? band(below + stepTarget - tol, below + stepTarget + tol)
      : band(target - tol, target + tol);
    const bTop = bnd.top, bBot = bnd.bot;

    const circ = 2 * Math.PI * 20;
    const sf = x => clamp(x / 125, 0, 1);

    const fizz = [];
    if (v && (v.phase === "pouring" || v.pouring)) {
      for (let i = 0; i < 3; i++) {
        fizz.push({ x: n(-3 + i * 3), y: n(liqTop + 2), r: n(0.8 + (i % 2) * 0.5),
          style: "animation:qbFizz " + (0.5 + i * 0.14) + "s linear infinite" });
      }
    }

    let stationNote = "Take an order";
    if (!v && s.dumpedAt && now - s.dumpedAt < 2200) stationNote = "Poured away";
    else if (v && v.phase === "ice") {
      const left = (v.drink.ice || 0) - v.ice;
      stationNote = left > ICE_PER_GRAB ? left + " more ice" : "Last of the ice";
    } else
    if (v && v.drink.kind === "tap") {
      if (v.phase === "empty") stationNote = "Hold the tap";
      else if (v.phase === "pouring") stationNote = v.fill > target + tol ? "TOO FULL" : "Stop in the band";
      else if (v.phase === "ready") stationNote = v.spilled ? "Overflowed" : "Carry it over";
    } else if (v) {
      if (v.phase === "loading") stationNote = v.pouring ? "Stop in the band" : "Hold the lit bottle";
      else if (v.phase === "shaking") stationNote = v.strokes ? "Shake into the band" : "Drag side to side";
      else if (v.phase === "ready") stationNote = "Carry it over";
    }

    const bottles = BOTTLES.map((b, i) => ({
      t: "translate(" + BOTTLE_X[i] + " " + BOTTLE_Y + ")",
      fill: b.fill, cap: b.cap,
      wanted: !!v && v.phase === "loading" && v.drink.mix && v.drink.mix[v.step] === b.key,
      dim: !!v && v.phase === "loading" && v.drink.mix && v.drink.mix[v.step] !== b.key ? 0.34 : 1,
      used: !!v && !!v.pours && v.pours.some(p => p.key === b.key)
    }));

    const served = s.served, tot = cfg.total;
    const acc = s.accN ? Math.round(s.accSum / s.accN) : 0;
    const keep = s.accN ? Math.round(s.patSum / s.accN) : 0;
    const rate = Math.round((served / tot) * 100);
    const score = Math.round(rate * 0.46 + acc * 0.34 + keep * 0.2) - s.wrong * 3;
    const passed = served >= cfg.need;

    const notes = [];
    if (s.walked) notes.push({ text: s.walked + " customer" + (s.walked > 1 ? "s" : "") + " walked out." });
    if (s.wrong) notes.push({ text: s.wrong + " wrong pour" + (s.wrong > 1 ? "s" : "") + " down the drain." });
    if (!s.walked && served === tot) notes.push({ text: "Served the whole room without losing one." });
    if (!passed) notes.push({ text: "Quirk wanted " + cfg.need + " served. You got " + served + "." });

    return {
      svgRef: this.svgRef,
      hudKicker: "Shift " + ((s.round % 4) + 1) + " of 4",
      stageLabel: cfg.name,
      ticketLabel: tick ? "Making" : "Order",
      ticketText: tick ? tick.drink.name + (tick.drink.kind === "tap" ? " · on tap" : " · shaken")
        : "Tap a customer to take their order",
      servedText: served + "/" + tot,
      queueText: s.queue.length + "",
      queueColor: s.queue.length >= MAX_QUEUE ? "#c2210f" : s.queue.length ? "#c2560f" : "#6b6864",
      walkText: s.walked + "",
      walkColor: s.walked > 0 ? "#c2210f" : "#6b6864",
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleMusic: this.toggleMusic, toggleSound: this.toggleSound,
      onDown: this.onDown, onMove: this.onMove, onUp: this.onUp,
      onTapTower: this.onTapTower,

      stools,

      handleT: v && v.phase === "pouring" ? "translate(22 72) rotate(26)" : "translate(22 72)",
      tapInk: v && v.drink.kind === "tap" && v.phase !== "ready" ? "#f0c040" : "#9c8fa8",

      stationT: "translate(" + STATION.x + " " + STATION.y + ")",
      isShaker, isGlass, noVessel: !v,
      showLid: !!v && v.drink.kind === "shaken" && v.phase === "shaking",
      shakeStyle: s.shaking && v && v.phase === "shaking"
        ? "transform-box:fill-box; transform-origin:center; animation:qbShakeIt .17s linear infinite" : "",
      showLidOff: !!v && v.drink.kind === "shaken" && v.phase === "ready"
        && !!v.readyAt && now - v.readyAt < 700,
      layers,
      hasLayers: layers.length > 0,
      blendD: trap(0, Math.max(0, poured)),
      blendO: v && v.drink.kind === "shaken"
        ? (v.phase === "ready" ? 1 : clamp((v.shake || 0) / 100, 0, 0.9)) : 0,
      vesselReady: !!v && v.phase === "ready",
      vesselColour: v ? v.drink.colour : "#4a3b50",
      glassFillD: "M " + n(-8 + 1.6 * (1 - lvl)) + " " + n(liqTop) + " L " + n(8 - 1.6 * (1 - lvl)) + " " + n(liqTop)
        + " L 6.4 13 L -6.4 13 Z",
      hasHead: headH > 0,
      glassHeadD: "M " + n(-8 + 1.6 * (1 - lvl)) + " " + n(liqTop) + " L " + n(8 - 1.6 * (1 - lvl)) + " " + n(liqTop)
        + " L " + n(7.6 - 1.6 * (1 - lvl)) + " " + n(liqTop + headH) + " L " + n(-7.6 + 1.6 * (1 - lvl)) + " " + n(liqTop + headH) + " Z",
      shakerFillD: "M -8.4 " + n(liqTop) + " L 8.4 " + n(liqTop) + " L 7 12 L -7 12 Z",

      showBand: !!v && !!tick && v.phase !== "ready",
      bandY: n(bTop), bandH: n(Math.max(1.5, bBot - bTop)),
      bandTop: n(bTop), bandBot: n(bBot),

      showShakeDial: !!v && v.drink.kind === "shaken" && (v.phase === "shaking" || v.phase === "loading"),
      shakeTDash: n((sf(target + tol) - sf(Math.max(0, target - tol))) * circ) + " " + n(circ),
      shakeTOff: n(-sf(Math.max(0, target - tol)) * circ),
      shakeFDash: n(sf(v ? v.shake : 0) * circ) + " " + n(circ),
      shakeInk: v && Math.abs((v.shake || 0) - target) <= tol ? "#f6f4ef" : "#f0c040",

      fizz, stationNote,
      cubes: v && v.ice ? ICE_PILE.slice(0, Math.min(v.ice, ICE_PILE.length)).map(p => ({
        t: "translate(" + p[0] + " " + p[1] + ") rotate(" + p[2] + ")"
      })) : [],
      hasCubes: !!v && v.ice > 0,
      carryingIce: !!s.iceDrag,
      iceDragT: s.iceDrag ? "translate(" + n(s.iceDrag.x) + " " + n(s.iceDrag.y) + ")" : "translate(0 0)",
      bucketLit: !!v && v.phase === "ice",
      bucketInk: v && v.phase === "ice" ? "#9fd8e8" : "#9c8fa8",
      showPourBottle: !!v && !!v.pouring,
      pourColour: v && v.pouring && v.pours[v.step] ? BFILL[v.pours[v.step].key] : "#d9a84e",
      pourCap: v && v.pouring && v.pours[v.step]
        ? (BOTTLES.find(b => b.key === v.pours[v.step].key) || BOTTLES[0]).cap : "#8f6b28",
      pourBottleT: "translate(16.4 -18.1) rotate(265)",
      pourStreamD: "M 4 -16.4 Q 3.2 " + n((-16.4 + liqTop) / 2) + " 2 " + n(liqTop + 1),
      bottles,

      dragging: !!s.drag,
      dragT: s.drag ? "translate(" + n(s.drag.x) + " " + n(s.drag.y) + ")" : "translate(0 0)",

      pops: (s.pops || []).filter(p => now - p.at < 1100).map(p => ({
        t: "translate(" + n(p.x) + " " + n(p.y) + ")",
        fill: p.ok ? "#2f7d3a" : "#c2210f",
        d: p.ok ? "M -3.6 0 L -1 2.8 L 3.8 -2.6" : "M -3 -3 L 3 3 M 3 -3 L -3 3"
      })),

      showHint: !s.overlay && !s.titleCard,
      hintText: tick && v && v.phase === "ice"
        ? "Press the ice bucket and drag the tongs to the glass — two cubes a time, " + (tick.drink.ice || 0) + " in all."
        : tick
        ? (tick.drink.kind === "tap"
            ? "Hold the tap handle and stop the pour inside the green band, then drag the glass to " + tick.drink.name + "'s customer."
            : "Hold the lit bottle to pour each layer to its band, then shake side to side and drag it over.")
        : "Tap a customer to take their order. Watch the patience bars — they walk when one empties.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: passed ? cfg.name + " · closed out" : cfg.name + " · Quirk is not pleased",
      cardScore: clamp(score, 0, 100) + " / 100",
      cardMood: !passed ? "Not enough served. Quirk wants the shift run again."
        : score >= 90 ? "A blinding shift. Quirk almost smiled."
        : score >= 75 ? "Good shift. The till is happy."
        : "The drinks went out, more or less.",
      cardRows: [
        { name: "Served", val: rate, pct: rate, color: rate >= 75 ? "#2f7d3a" : rate >= 45 ? "#b07d00" : "#c2210f" },
        { name: "Accuracy", val: acc, pct: acc, color: acc >= 75 ? "#2f7d3a" : acc >= 45 ? "#b07d00" : "#c2210f" },
        { name: "Patience", val: keep, pct: keep, color: keep >= 60 ? "#2f7d3a" : keep >= 30 ? "#b07d00" : "#c2210f" }
      ],
      cardNotes: notes, hasNotes: notes.length > 0,
      cardCta: !passed ? "Run the shift again"
        : s.round + 1 >= 4 ? "Open up again" : "Next shift",
      cardAction: this.cardAction
    };
  }
}
