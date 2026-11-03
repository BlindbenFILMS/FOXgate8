
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const polyD = pts => "M " + pts.map(p => n(p[0]) + " " + n(p[1])).join(" L ") + " Z";

// ---- bone profiles: thickness and centreline curve along the long axis
const BONES = [
  { key: "femur", name: "LEFT FEMUR", L: 46,
    hw: t => { const a = Math.abs(t); return a > 36 ? 12.5 : a > 27 ? 7 + (a - 27) * 0.61 : 7; },
    cap: 7, curve: t => t * 0.04, cuts: 2, label: "Transverse fracture, mid-shaft" },
  { key: "rib", name: "THIRD RIB", L: 44,
    hw: () => 4.8, cap: 4,
    curve: t => -14 * Math.cos((t / 44) * 1.35) + 8, cuts: 3, label: "Displaced fracture, two breaks" },
  { key: "ulna", name: "RIGHT ULNA", L: 42,
    hw: t => { const u = (t + 42) / 84; return 3.8 + u * u * 7.6; },
    cap: 5, curve: t => 4 * Math.sin((t / 42) * 1.9), cuts: 3, label: "Comminuted, three fragments" },
  { key: "clavicle", name: "CLAVICLE", L: 43,
    hw: t => 4.4 + Math.abs(t) * 0.08, cap: 4,
    curve: t => 9 * Math.sin((t / 43) * 3.1), cuts: 4, label: "Multiple fragments, S-shaft" }
];

// taper the last few units to a dome so ends read as bone, not blocks
function capped(b, t) {
  const a = Math.abs(t), cap = b.cap || 5, edge = b.L - cap;
  const base = b.hw(t);
  if (a <= edge) return base;
  const u = clamp((a - edge) / cap, 0, 1);
  return base * Math.sqrt(Math.max(0, 1 - u * u * 0.93));
}

function outline(b) {
  const pts = [];
  const steps = 56;
  for (let i = 0; i <= steps; i++) {
    const t = -b.L + (i / steps) * 2 * b.L;
    pts.push([t, b.curve(t) + capped(b, t)]);
  }
  for (let i = steps; i >= 0; i--) {
    const t = -b.L + (i / steps) * 2 * b.L;
    pts.push([t, b.curve(t) - capped(b, t)]);
  }
  return pts;
}

// Sutherland-Hodgman against the half-plane dot(p - a, nrm) >= 0
function clipHalf(poly, a, nrm) {
  const out = [];
  const side = p => (p[0] - a[0]) * nrm[0] + (p[1] - a[1]) * nrm[1];
  for (let i = 0; i < poly.length; i++) {
    const c = poly[i], d = poly[(i + 1) % poly.length];
    const sc = side(c), sd = side(d);
    if (sc >= 0) out.push(c);
    if ((sc >= 0) !== (sd >= 0)) {
      const u = sc / (sc - sd);
      out.push([c[0] + (d[0] - c[0]) * u, c[1] + (d[1] - c[1]) * u]);
    }
  }
  return out;
}

function centroid(poly) {
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const cr = p[0] * q[1] - q[0] * p[1];
    a += cr; x += (p[0] + q[0]) * cr; y += (p[1] + q[1]) * cr;
  }
  if (Math.abs(a) < 1e-6) {
    const m = poly.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [m[0] / poly.length, m[1] / poly.length];
  }
  return [x / (3 * a), y / (3 * a)];
}

function inPoly(poly, x, y) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > y) !== (b[1] > y) && x < a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])) hit = !hit;
  }
  return hit;
}

function rng(seed) {
  let s = seed + 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ORIGIN = { x: 122, y: 52 };
const REF = { x: 31, y: 45, s: 0.34 };
const TRAY = { x: 54, y: 86, w: 134, h: 34, inX0: 58, inX1: 184, inY0: 94, inY1: 120 };
const SNAP = [7.6, 6.6, 5.8, 5];
const SECONDS = [50, 50, 55, 60];

function buildCase(round) {
  const b = BONES[round % BONES.length];
  const rand = rng(round * 6151 + 29);
  const shell = outline(b);
  // cut the shaft into fragments at slightly angled lines
  const cuts = [];
  const nCuts = b.cuts;
  for (let i = 1; i <= nCuts; i++) {
    const tc = -b.L + (i / (nCuts + 1)) * 2 * b.L + (rand() - 0.5) * 5;
    const ang = (rand() - 0.5) * 0.7;
    cuts.push({ tc, nrm: [Math.cos(ang), Math.sin(ang)] });
  }
  cuts.sort((p, q) => p.tc - q.tc);

  const frags = [];
  for (let i = 0; i <= nCuts; i++) {
    let poly = shell;
    if (i > 0) { const c = cuts[i - 1]; poly = clipHalf(poly, [c.tc, c.curveAt || 0], c.nrm); }
    if (i < nCuts) { const c = cuts[i]; poly = clipHalf(poly, [c.tc, 0], [-c.nrm[0], -c.nrm[1]]); }
    if (poly.length < 3) continue;
    frags.push({ poly, home: centroid(poly) });
  }

  // scatter into the tray, order shuffled so shape reading matters
  const order = frags.map((f, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  const slotW = (TRAY.inX1 - TRAY.inX0) / frags.length;
  order.forEach((fi, slot) => {
    const f = frags[fi];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    f.poly.forEach(p => {
      x0 = Math.min(x0, p[0] - f.home[0]); x1 = Math.max(x1, p[0] - f.home[0]);
      y0 = Math.min(y0, p[1] - f.home[1]); y1 = Math.max(y1, p[1] - f.home[1]);
    });
    const lo = TRAY.inX0 + slotW * slot, hi = lo + slotW;
    const sx = clamp((lo + hi) / 2, lo - x0, Math.max(lo - x0, hi - x1));
    const cy = (TRAY.inY0 + TRAY.inY1) / 2;
    const sy = clamp(cy + (rand() - 0.5) * 4, TRAY.inY0 - y0, Math.max(TRAY.inY0 - y0, TRAY.inY1 - y1));
    f.off = [sx - (ORIGIN.x + f.home[0]), sy - (ORIGIN.y + f.home[1])];
    f.placed = false;
    f.residual = 0;
  });

  return { bone: b, cuts, frags, refD: polyD(shell) };
}


// quiet infirmary loop: glassy music-box figure over a long low note
const MUSIC = (() => {
  const notes = [];
  const chords = [[48, 55, 60], [46, 53, 58], [44, 51, 56], [46, 53, 60]];
  chords.forEach((ch, s) => {
    const at = s * 8;
    notes.push({ b: at, m: ch[0] - 12, d: 7.6, v: "bass" });
    notes.push({ b: at, m: ch[1], d: 7.2, v: "pad" });
    [0, 1.5, 3, 4.5, 6].forEach((off, i) => notes.push({ b: at + off, m: ch[i % 3] + 24, d: 1.5, v: "bell" }));
  });
  [3.5, 11.5, 19.5, 27.5].forEach(b => notes.push({ b, m: 91, d: 1.8, v: "bell" }));
  return { notes, beats: 32, spb: 0.54 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshCase(0));
  }

  freshCase(round) {
    const c = buildCase(round);
    const r = round % 4;
    return {
      round, bone: c.bone, cuts: c.cuts, refD: c.refD,
      frags: c.frags.map(f => ({ poly: f.poly, home: f.home, off: f.off, placed: false, residual: 0 })),
      snap: SNAP[r], timeLeft: SECONDS[r], total: SECONDS[r],
      held: null, grab: [0, 0], knitting: false, done: false,
      titleCard: ["Case " + (r + 1), c.bone.name + " · " + c.bone.label],
      cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__boneTarget = this;
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

  audio() {
    if (this.muted() || !this.started) return null;
    if (!window.__boneAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__boneAC = new AC();
      window.addEventListener("pagehide", () => { try { window.__boneAC.close(); } catch (e) {} });
    }
    this.actx = window.__boneAC;
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
    o.connect(g); g.connect(window.__boneMusicBus);
    o.start(at); o.stop(at + dur + 0.03);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__boneMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__boneMusicBus = bus;
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
    const bus = window.__boneMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__boneMusicBus = null;
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
    if (kind === "lift") this.tone(480, 0.05, 0.03, "triangle", 620);
    else if (kind === "lock") { this.tone(340, 0.08, 0.05, "square", 560); this.tone(720, 0.07, 0.03, "triangle"); }
    else if (kind === "drop") this.tone(220, 0.08, 0.035, "sine", 160);
    else if (kind === "knit") [0, 4, 7, 12].forEach((s, i) => setTimeout(() => this.tone(hz(74 + s), 0.22, 0.05, "triangle"), i * 95));
    else if (kind === "time") this.tone(180, 0.24, 0.06, "square", 110);
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const s = this.state;
    if (this.started && window.__boneTarget === this && window.__boneAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__boneMusicBus) this.killMusic();
    }
    if (s.overlay || s.done) return;

    const patch = {};
    if (s.titleCard && now - s.cardAt > 1700) patch.titleCard = null;

    if (!s.titleCard) {
      const left = s.timeLeft - dt;
      if (left <= 0) {
        this.sfx("time");
        this.setState({ timeLeft: 0, done: true, held: null }, () => this.finish());
        return;
      }
      patch.timeLeft = left;
    }
    this.setState(patch);
  };

  finish() {
    setTimeout(() => this.setState({ overlay: "card" }), 900);
  }

  local(e) {
    const svg = this.svgEl || (this.svgEl = e.currentTarget.querySelectorAll("svg")[1]);
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / 200, r.height / 140);
    const ox = (r.width - 200 * scale) / 2, oy = (r.height - 140 * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  }

  onDown = e => {
    const s = this.state;
    if (this.started && window.__boneTarget === this && window.__boneAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__boneMusicBus) this.killMusic();
    }
    if (s.overlay || s.done || s.titleCard) return;
    this.audio();
    const p = this.local(e);
    for (let i = s.frags.length - 1; i >= 0; i--) {
      const f = s.frags[i];
      if (f.placed) continue;
      const lx = p.x - ORIGIN.x - f.off[0], ly = p.y - ORIGIN.y - f.off[1];
      if (inPoly(f.poly, lx, ly)) {
        this.sfx("lift");
        this.setState({ held: i, grab: [p.x - f.off[0], p.y - f.off[1]] });
        return;
      }
    }
  };

  onMove = e => {
    const s = this.state;
    if (this.started && window.__boneTarget === this && window.__boneAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__boneMusicBus) this.killMusic();
    }
    if (s.overlay || s.held == null) return;
    const p = this.local(e);
    const g = s.grab;
    this.setState(st => ({
      frags: st.frags.map((f, i) => i === st.held
        ? Object.assign({}, f, { off: [p.x - g[0], p.y - g[1]] })
        : f)
    }));
  };

  onUp = () => {
    const s = this.state;
    if (this.started && window.__boneTarget === this && window.__boneAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__boneMusicBus) this.killMusic();
    }
    if (s.overlay || s.held == null) return;
    const i = s.held;
    const f = s.frags[i];
    const d = Math.hypot(f.off[0], f.off[1]);
    if (d <= s.snap) {
      // locks where you dropped it, so sloppy work stays visible
      this.sfx("lock");
      const frags = s.frags.map((x, j) => j === i
        ? Object.assign({}, x, { placed: true, residual: d })
        : x);
      const all = frags.every(x => x.placed);
      this.setState({ held: null, frags, knitting: all }, () => {
        if (all) {
          this.sfx("knit");
          setTimeout(() => this.setState({ done: true }, () => this.finish()), 700);
        }
      });
    } else {
      this.sfx("drop");
      this.setState({ held: null });
    }
  };

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(this.freshCase(s.round + 1), { overlay: null, muted: s.muted }));
  };

  toggleSound = () => {
    if (!this.state.muted) this.killMusic();
    this.setState(s => ({ muted: !s.muted }));
  };

  renderVals() {
    const s = this.state, b = s.bone;
    const placed = s.frags.filter(f => f.placed).length;
    const tot = s.frags.length;
    const all = placed === tot;

    const precisions = s.frags.filter(f => f.placed)
      .map(f => clamp(1 - f.residual / s.snap, 0, 1));
    const avgPrec = precisions.length ? precisions.reduce((a, x) => a + x, 0) / precisions.length : 0;
    const alignment = Math.round(avgPrec * 100);
    const completion = Math.round((placed / tot) * 100);
    const score = Math.round(completion * 0.55 + alignment * 0.45);

    const frags = s.frags.map((f, i) => {
      const d = Math.hypot(f.off[0], f.off[1]);
      const isHeld = s.held === i;
      return {
        t: "translate(" + n(ORIGIN.x + f.off[0]) + " " + n(ORIGIN.y + f.off[1]) + ")",
        d: polyD(f.poly),
        cursor: f.placed ? "cursor:default" : isHeld ? "cursor:grabbing" : "cursor:grab",
        fill: f.placed ? "#f2ead9" : "#ede3cf",
        stroke: f.placed ? "#9c8a68" : "#b8a483",
        sheen: isHeld ? 0.45 : 0.18,
        near: isHeld && d <= s.snap
      };
    });

    const seams = s.cuts.map(c => {
      // draw each cut line across the bone so the knit reads along the breaks
      const dx = -c.nrm[1], dy = c.nrm[0];
      const half = 26;
      return { d: "M " + n(c.tc - dx * half) + " " + n(-dy * half) + " L " + n(c.tc + dx * half) + " " + n(dy * half) };
    });

    const notes = [];
    if (placed < tot) notes.push({ text: (tot - placed) + " fragment" + (tot - placed > 1 ? "s" : "") + " never made it into the bone." });
    const sloppy = s.frags.filter(f => f.placed && f.residual > s.snap * 0.55).length;
    if (sloppy) notes.push({ text: sloppy + " join" + (sloppy > 1 ? "s" : "") + " left a visible step in the shaft." });
    if (all && !sloppy) notes.push({ text: "Every fragment seated clean. The bone will knit true." });

    return {
      hudKicker: "Case " + ((s.round % 4) + 1) + " of 4",
      stageLabel: b.name,
      caseText: b.name + " · " + b.label,
      boneName: b.name,
      timerText: Math.ceil(s.timeLeft) + "s",
      timerPct: n(clamp(s.timeLeft / s.total, 0, 1) * 100),
      timerColor: s.timeLeft < 8 ? "#c2210f" : s.timeLeft < 16 ? "#c2560f" : "#201e1d",
      setText: placed + " / " + tot,
      setColor: all ? "#2f7d3a" : "#6b6864",
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      toggleMusic: this.toggleMusic,
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleSound: this.toggleSound,
      onDown: this.onDown, onMove: this.onMove, onUp: this.onUp,

      refD: s.refD,
      refT: "translate(" + REF.x + " " + REF.y + ") scale(" + REF.s + ")",
      boneT: "translate(" + ORIGIN.x + " " + ORIGIN.y + ")",
      trayLabel: placed < tot ? "FRAGMENT TRAY" : "TRAY CLEAR",
      trayCount: (tot - placed) + " LOOSE",
      frags, seams,
      knitting: s.knitting,
      allSet: all && s.done,

      showHint: !s.overlay && !s.titleCard,
      hintText: all ? "Bone knitted. Every fragment seated."
        : "Drag each fragment from the tray into the dashed outline. Get it close and it locks where you leave it.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: s.round + 1 >= 4 ? "Shift over · " + b.name : b.name + " · set",
      cardScore: score + " / 100",
      cardMood: score >= 92 ? "A textbook reduction." : score >= 78 ? "Good set."
        : score >= 60 ? "It will heal, with a ridge." : "That one needs setting again.",
      cardRows: [
        { name: "Fragments", val: completion, pct: completion, color: completion >= 75 ? "#2f7d3a" : completion >= 45 ? "#b07d00" : "#c2210f" },
        { name: "Alignment", val: alignment, pct: alignment, color: alignment >= 75 ? "#2f7d3a" : alignment >= 45 ? "#b07d00" : "#c2210f" }
      ],
      cardNotes: notes, hasNotes: notes.length > 0,
      cardCta: s.round + 1 >= 4 ? "Start the shift again" : "Next case",
      cardAction: this.cardAction
    };
  }
}
