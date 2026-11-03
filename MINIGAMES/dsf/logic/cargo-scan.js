
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// eight distinctly-shaped goods; the manifest chips use the very same paths
const GOODS = [
  { key: "drum", name: "DRUM", d: "M -4 -6.5 L 4 -6.5 L 4 6.5 L -4 6.5 Z" },
  { key: "sack", name: "SACK", d: "M -4.5 6.5 q -1.5 -9 4.5 -11.5 q 6 2.5 4.5 11.5 Z" },
  { key: "tin", name: "TIN", d: "M -6 -3.5 L 6 -3.5 L 6 3.5 L -6 3.5 Z" },
  { key: "ring", name: "RING", d: "M -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 Z M -2.2 0 a 2.2 2.2 0 1 1 4.4 0 a 2.2 2.2 0 1 1 -4.4 0 Z" },
  { key: "plate", name: "PLATE", d: "M -7 -2.2 L 7 -2.2 L 7 2.2 L -7 2.2 Z" },
  { key: "bulb", name: "BULB", d: "M -1.6 7 L 1.6 7 L 1.6 3 L -1.6 3 Z M 0 -6.6 a 4.6 4.6 0 1 0 0 9.2 a 4.6 4.6 0 1 0 0 -9.2 Z" },
  { key: "crystal", name: "CRYSTAL", d: "M 0 -7 L 5 -3 L 5 4 L 0 7.5 L -5 4 L -5 -3 Z" },
  { key: "rod", name: "ROD", d: "M -1.8 -7.5 L 1.8 -7.5 L 1.8 7.5 L -1.8 7.5 Z M -3.4 -7.5 L 3.4 -7.5 L 3.4 -5.5 L -3.4 -5.5 Z M -3.4 5.5 L 3.4 5.5 L 3.4 7.5 L -3.4 7.5 Z" }
];
const GI = {};
GOODS.forEach((g, i) => { GI[g.key] = i; });

// later belts pick contraband that looks like something on the manifest
const LOOKALIKE = {
  drum: ["rod", "tin"], rod: ["drum", "bulb"], tin: ["plate", "drum"],
  plate: ["tin", "rod"], ring: ["bulb", "crystal"], bulb: ["ring", "rod"],
  crystal: ["ring", "sack"], sack: ["crystal", "bulb"]
};

const SPAWN_X = -30, LINE_X = 152, EXIT_X = 224, BELT_Y = 64;

const BELTS = [
  { manifest: ["drum", "sack", "tin"], per: 2, count: 8, speed: 15, tricky: false, dock: "Upper pylon" },
  { manifest: ["ring", "plate", "bulb"], per: 2, count: 10, speed: 18, tricky: false, dock: "Freight ring" },
  { manifest: ["drum", "tin", "crystal", "sack"], per: 3, count: 10, speed: 21, tricky: true, dock: "Lower cargo bay" },
  { manifest: ["rod", "bulb", "plate", "ring"], per: 3, count: 12, speed: 24, tricky: true, dock: "Transit hub" }
];

function rng(seed) {
  let s = seed + 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// build the whole belt up front so every crate is known-good or known-bad
function buildBelt(round) {
  const cfg = BELTS[round % BELTS.length];
  const rand = rng(round * 7919 + 13);
  const allowed = cfg.manifest;
  const outside = GOODS.map(g => g.key).filter(k => allowed.indexOf(k) < 0);
  const queue = [];
  let sinceBad = 0;
  for (let i = 0; i < cfg.count; i++) {
    let bad;
    if (i < 2) bad = false;
    else if (i === 2 || i === 4) bad = true;
    else if (sinceBad >= 5) bad = true;
    else bad = rand() < 0.45;
    sinceBad = bad ? 0 : sinceBad + 1;
    const items = [];
    for (let j = 0; j < cfg.per; j++) items.push(allowed[Math.floor(rand() * allowed.length)]);
    if (bad) {
      let pick;
      if (cfg.tricky) {
        const near = allowed
          .reduce((a, k) => a.concat(LOOKALIKE[k] || []), [])
          .filter(k => allowed.indexOf(k) < 0);
        pick = near.length ? near[Math.floor(rand() * near.length)] : outside[Math.floor(rand() * outside.length)];
      } else pick = outside[Math.floor(rand() * outside.length)];
      items[Math.floor(rand() * items.length)] = pick;
    }
    queue.push({ items, bad });
  }
  return { cfg, queue };
}


// a working shuffle to match the belt: walking bass and a woodblock tick
const MUSIC = (() => {
  const notes = [];
  const walk = [40, 43, 45, 47, 45, 43, 40, 38];
  for (let s = 0; s < 4; s++) {
    const at = s * 8;
    walk.forEach((m, i) => notes.push({ b: at + i, m: m - (s % 2 ? 0 : 0), d: 0.8, v: "bass" }));
    [[0.5, 64], [1.5, 67], [3, 69], [4.5, 67], [5.5, 64], [7, 62]].forEach(p =>
      notes.push({ b: at + p[0], m: p[1] + (s === 3 ? 3 : 0), d: 0.7, v: "lead" }));
    notes.push({ b: at, m: 52, d: 3.6, v: "pad" });
  }
  for (let b = 0; b < 32; b += 0.5) notes.push({ b, m: b % 2 === 0 ? 88 : 93, d: 0.06, v: "tick" });
  return { notes, beats: 32, spb: 0.34 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshBelt(0));
  }

  freshBelt(round) {
    const b = buildBelt(round);
    return {
      round, cfg: b.cfg, queue: b.queue,
      crates: [], marks: [], spawned: 0, resolved: 0,
      right: 0, wrong: 0, missed: 0, falseHold: 0, held: 0,
      sinceSpawn: 99, done: false,
      titleCard: ["Belt " + ((round % 4) + 1), b.cfg.dock + " · " + b.cfg.count + " crates"],
      cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__cargoTarget = this;
    this.started = false;
    this.killMusic();
    this.nextId = 1;
    setTimeout(() => this.loop(), 0);
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.killMusic();
  }

  muted() { return this.state.muted || (this.props.sound ?? true) === false; }

  audio() {
    if (this.muted() || !this.started) return null;
    if (!window.__cargoAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__cargoAC = new AC();
      window.addEventListener("pagehide", () => { try { window.__cargoAC.close(); } catch (e) {} });
    }
    this.actx = window.__cargoAC;
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
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }


  musicOn() { return !this.muted() && (this.props.music ?? true) !== false && !this.state.musicOff; }

  voice(nt, at) {
    const ac = this.actx, g = ac.createGain(), o = ac.createOscillator();
    const dur = nt.d * MUSIC.spb;
    let peak = 0.02;
    if (nt.v === "bass") { o.type = "triangle"; peak = 0.044; }
    else if (nt.v === "pad") { o.type = "sine"; peak = 0.02; }
    else if (nt.v === "lead") { o.type = "triangle"; peak = 0.03; }
    else if (nt.v === "bell") { o.type = "sine"; peak = 0.028; }
    else { o.type = "square"; peak = 0.007; }
    o.frequency.setValueAtTime(midiHz(nt.m), at);
    if (nt.g) o.frequency.linearRampToValueAtTime(midiHz(nt.g), at + dur * 0.7);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + (nt.v === "pad" ? 0.4 : 0.016));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(window.__cargoMusicBus);
    o.start(at); o.stop(at + dur + 0.03);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__cargoMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__cargoMusicBus = bus;
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
    const bus = window.__cargoMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__cargoMusicBus = null;
    this.musicBar = 0;
  }

  toggleMusic = () => {
    this.audio();
    if (this.musicOn()) this.killMusic();
    this.setState(s => ({ musicOff: !s.musicOff }));
  };

  sfx(kind) {
    if (!this.audio()) return;
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    if (kind === "tap") this.tone(300, 0.07, 0.05, "square", 190);
    else if (kind === "right") [0, 7].forEach((s, i) => setTimeout(() => this.tone(hz(76 + s), 0.13, 0.045, "triangle"), i * 55));
    else if (kind === "wrong") this.tone(170, 0.22, 0.06, "square", 108);
    else if (kind === "pass") this.tone(620, 0.06, 0.028, "sine");
    else if (kind === "end") [0, 4, 7, 12].forEach((s, i) => setTimeout(() => this.tone(hz(72 + s), 0.24, 0.05, "triangle"), i * 100));
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const s = this.state;
    if (this.started && window.__cargoTarget === this && window.__cargoAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__cargoMusicBus) this.killMusic();
    }
    if (s.overlay || s.done) return;

    const patch = {};
    if (s.titleCard && now - s.cardAt > 1600) patch.titleCard = null;

    const cfg = s.cfg;
    const gap = 66 / cfg.speed;
    let sinceSpawn = s.sinceSpawn + dt;
    let spawned = s.spawned;
    let crates = s.crates.map(c => Object.assign({}, c));

    if (sinceSpawn >= gap && spawned < cfg.count && !s.titleCard) {
      const q = s.queue[spawned];
      crates.push({
        id: this.nextId++, x: SPAWN_X, y: BELT_Y, items: q.items, bad: q.bad,
        state: "belt", mark: null, markAt: 0, index: spawned
      });
      spawned++;
      sinceSpawn = 0;
    }

    let right = s.right, wrong = s.wrong, missed = s.missed, resolved = s.resolved, held = s.held;
    const marks = s.marks.filter(m => now - m.at < 1400);

    crates.forEach(c => {
      if (c.state === "belt") {
        c.x += cfg.speed * dt;
        if (c.x >= LINE_X) {
          // crossed without being held: it passes
          c.state = "passing";
          const ok = !c.bad;
          marks.push({ id: c.id, kind: ok ? "tick" : "cross", x: LINE_X - 8, y: 40, at: now });
          resolved++;
          if (ok) { right++; this.sfx("pass"); }
          else { wrong++; missed++; this.sfx("wrong"); }
        }
      } else if (c.state === "passing") {
        c.x += cfg.speed * dt;
      }
    });
    crates = crates.filter(c => !(c.state === "passing" && c.x > EXIT_X));

    Object.assign(patch, { crates, spawned, sinceSpawn, right, wrong, missed, resolved, held, marks });

    if (resolved >= cfg.count && spawned >= cfg.count) {
      patch.done = true;
      this.sfx("end");
      setTimeout(() => this.setState({ overlay: "card" }), 1100);
    }
    this.setState(patch);
  };

  hold = id => {
    const s = this.state;
    if (this.started && window.__cargoTarget === this && window.__cargoAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__cargoMusicBus) this.killMusic();
    }
    if (s.overlay || s.done) return;
    this.audio();
    const c = s.crates.find(x => x.id === id);
    if (!c || c.state !== "belt") return;
    const ok = c.bad;
    this.sfx("tap");
    setTimeout(() => this.sfx(ok ? "right" : "wrong"), 90);
    this.setState(st => ({
      crates: st.crates.map(x => x.id === id
        ? Object.assign({}, x, { state: "held", slot: st.held })
        : x),
      marks: st.marks.filter(m => Date.now() - m.at < 1400)
        .concat([{ id: id, kind: ok ? "tick" : "cross", x: c.x, y: c.y - 26, at: Date.now() }]),
      right: st.right + (ok ? 1 : 0),
      wrong: st.wrong + (ok ? 0 : 1),
      falseHold: st.falseHold + (ok ? 0 : 1),
      held: st.held + 1,
      resolved: st.resolved + 1
    }));
  };

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(this.freshBelt(s.round + 1), { overlay: null, muted: s.muted }));
  };

  toggleSound = () => {
    if (!this.state.muted) this.killMusic();
    this.setState(s => ({ muted: !s.muted }));
  };

  renderVals() {
    const s = this.state, cfg = s.cfg;
    const total = cfg.count;
    const accuracy = s.resolved ? Math.round((s.right / s.resolved) * 100) : 100;
    const allowed = cfg.manifest;

    const manifest = allowed.map((k, i) => {
      const g = GOODS[GI[k]];
      const x = 66 + i * 32;
      return { x: n(x), t: "translate(" + n(x + 15) + " 16.4) scale(0.94)", d: g.d, name: g.name };
    });

    const now = Date.now();
    const crates = s.crates.map(c => {
      const spread = c.items.length === 3 ? 10.3 : 15;
      const start = -((c.items.length - 1) * spread) / 2;
      const slot = c.slot || 0;
      const slotX = 61 + (slot % 7) * 12.8;
      const t = c.state === "held"
        ? "translate(" + n(slotX) + " 110) scale(0.33)"
        : "translate(" + n(c.x) + " " + n(c.y) + ")";
      return {
        t,
        cursor: c.state === "belt" ? "cursor:pointer" : "cursor:default",
        onTap: () => this.hold(c.id),
        flagged: c.state === "held",
        items: c.items.map((k, j) => ({
          t: "translate(" + n(start + j * spread) + " 0) scale(" + (c.items.length === 3 ? 0.58 : 0.85) + ")",
          d: GOODS[GI[k]].d,
          fill: "#8fd6bf"
        })),
      };
    });

    const notes = [];
    if (s.missed) notes.push({ text: s.missed + " crate" + (s.missed > 1 ? "s" : "") + " with unlisted goods went through." });
    if (s.falseHold) notes.push({ text: s.falseHold + " clean crate" + (s.falseHold > 1 ? "s were" : " was") + " held for nothing." });
    if (!s.missed && !s.falseHold) notes.push({ text: "Every call correct. The dock supervisor has no notes." });

    return {
      hudKicker: "Belt " + ((s.round % 4) + 1) + " of 4",
      stageLabel: cfg.dock,
      beltText: cfg.dock + " · crate " + Math.min(s.resolved + 1, total) + " of " + total,
      rightCount: s.right,
      wrongCount: s.wrong,
      wrongColor: s.wrong > 0 ? "#c2210f" : "#6b6864",
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      toggleMusic: this.toggleMusic,
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleSound: this.toggleSound,

      scanGlow: s.crates.some(c => c.state !== "held" && c.x > 58 && c.x < 130) ? 0.2 : 0.08,
      emitterFill: s.crates.some(c => c.state !== "held" && c.x > 58 && c.x < 130) ? "#c9f4e4" : "#5c8f7e",
      rollers: [18, 40, 62, 84, 106, 128, 150, 172, 194].map(x => ({ x })),
      stripes: [0, 1, 2, 3, 4, 5].map(i => ({
        d: "M " + (6 + i * 8) + " 132 L " + (12 + i * 8) + " 126"
      })),
      manifest, crates,
      marks: (s.marks || []).map(m => ({
        t: "translate(" + n(clamp(m.x, 14, 186)) + " " + n(clamp(m.y, 45, 118)) + ")",
        fill: m.kind === "tick" ? "#2f7d3a" : "#c2210f",
        d: m.kind === "tick" ? "M -3.8 0 L -1 2.9 L 4 -2.7" : "M -3.2 -3.2 L 3.2 3.2 M 3.2 -3.2 L -3.2 3.2"
      })),
      heldCount: s.held,
      beltAnim: "animation:csBeltShift " + n(16 / cfg.speed) + "s linear infinite",

      showHint: !s.overlay && !s.titleCard,
      hintText: "Tap a crate if anything inside it is a shape that is not in the manifest row above. Decide before the red line.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: s.round + 1 >= 4 ? "Shift over · " + cfg.dock : cfg.dock + " · cleared",
      cardScore: accuracy + " / 100",
      cardMood: accuracy >= 95 ? "Nothing got past you." : accuracy >= 80 ? "Good shift."
        : accuracy >= 60 ? "A few slipped through." : "The manifest and the belt disagreed a lot.",
      cardRows: [
        { name: "Accuracy", val: accuracy, pct: accuracy, color: accuracy >= 75 ? "#2f7d3a" : accuracy >= 45 ? "#b07d00" : "#c2210f" },
        { name: "Right calls", val: s.right, pct: n((s.right / Math.max(1, total)) * 100), color: "#2f7d3a" },
        { name: "Wrong calls", val: s.wrong, pct: n((s.wrong / Math.max(1, total)) * 100), color: "#c2210f" }
      ],
      cardNotes: notes, hasNotes: notes.length > 0,
      cardCta: s.round + 1 >= 4 ? "Start the shift again" : "Next belt",
      cardAction: this.cardAction
    };
  }
}
