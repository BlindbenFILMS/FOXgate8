
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const D = pts => "M " + pts.map(p => n(p[0]) + " " + n(p[1])).join(" L ");
const poly = pts => D(pts) + " Z";

function polyInfo(pts) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 0.001;
    segs.push({ a, b, dx, dy, len, at: total, ang: Math.atan2(dy, dx) * 180 / Math.PI });
    total += len;
  }
  return { pts, segs, total };
}

// closest point on the polyline: how far along (0..1) and how far off
function projOn(info, x, y) {
  let best = { dist: 1e9, t: 0, ang: 0 };
  info.segs.forEach(s => {
    const u = clamp(((x - s.a[0]) * s.dx + (y - s.a[1]) * s.dy) / (s.len * s.len), 0, 1);
    const px = s.a[0] + s.dx * u, py = s.a[1] + s.dy * u;
    const d = Math.hypot(x - px, y - py);
    if (d < best.dist) best = { dist: d, t: (s.at + u * s.len) / info.total, ang: s.ang };
  });
  return best;
}

function ptAt(info, t) {
  const L = clamp(t, 0, 1) * info.total;
  const segs = info.segs;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (L <= s.at + s.len || i === segs.length - 1) {
      const u = clamp((L - s.at) / s.len, 0, 1);
      return { x: s.a[0] + s.dx * u, y: s.a[1] + s.dy * u, ang: s.ang };
    }
  }
  return { x: 0, y: 0, ang: 0 };
}

function upTo(info, t) {
  const L = clamp(t, 0, 1) * info.total;
  const out = [info.segs[0].a];
  for (const s of info.segs) {
    if (s.at + s.len <= L) out.push(s.b);
    else {
      const u = clamp((L - s.at) / s.len, 0, 1);
      if (u > 0.001) out.push([s.a[0] + s.dx * u, s.a[1] + s.dy * u]);
      break;
    }
  }
  return out;
}

// a pattern blank is a rectangle of cloth with one chalked cut edge running across it;
// the keep side becomes the pattern piece, the other side falls away as scrap
function blank(label, box, cut, keepSide) {
  const x0 = box[0], y0 = box[1], x1 = box[2], y1 = box[3];
  const rev = cut.slice().reverse();
  let keep, off, away;
  if (keepSide === "h-below") { keep = cut.concat([[x1, y1], [x0, y1]]); off = rev.concat([[x0, y0], [x1, y0]]); away = [0, -11]; }
  else if (keepSide === "h-above") { keep = cut.concat([[x1, y0], [x0, y0]]); off = rev.concat([[x0, y1], [x1, y1]]); away = [0, 11]; }
  else if (keepSide === "v-left") { keep = cut.concat([[x0, y1], [x0, y0]]); off = rev.concat([[x1, y0], [x1, y1]]); away = [12, 0]; }
  else { keep = cut.concat([[x1, y1], [x1, y0]]); off = rev.concat([[x0, y0], [x0, y1]]); away = [-12, 0]; }
  return { label, box, cut, keep, off, away, info: polyInfo(cut) };
}

const GARMENTS = {
  shirt: {
    name: "Shirt", ticket: "One shirt — three pieces, three seams, pressed crisp",
    fill: "#6e8fb8", stroke: "#3f5d80",
    pieces: [
      blank("FRONT", [16, 58, 62, 120], [[44, 58], [48, 88], [40, 120]], "v-left"),
      blank("SLEEVE", [72, 58, 128, 120], [[72, 86], [100, 78], [128, 92]], "h-below"),
      blank("COLLAR", [138, 58, 184, 120], [[138, 76], [160, 70], [184, 74]], "h-above")
    ],
    sil: [[74, 64], [92, 64], [100, 70], [108, 64], [126, 64], [146, 84], [132, 96], [126, 88], [126, 120], [74, 120], [74, 88], [68, 96], [54, 84]],
    shade: [[100, 70], [108, 64], [126, 64], [146, 84], [132, 96], [126, 88], [126, 120], [100, 120]],
    seam: [[80, 72], [120, 72], [122, 114], [80, 114]],
    zones: [[100, 74, 8, "YOKE"], [80, 102, 8, "FRONT"], [120, 108, 8, "HEM"]]
  },
  pants: {
    name: "Pants", ticket: "One pair of pants — three pieces, three seams, pressed crisp",
    fill: "#6f7a45", stroke: "#4a5228",
    pieces: [
      blank("LEG A", [16, 58, 62, 120], [[36, 58], [30, 88], [44, 120]], "v-right"),
      blank("LEG B", [72, 58, 128, 120], [[106, 58], [112, 86], [98, 120]], "v-left"),
      blank("WAISTBAND", [138, 58, 184, 120], [[138, 80], [160, 74], [184, 80]], "h-above")
    ],
    sil: [[76, 62], [124, 62], [128, 76], [120, 120], [106, 120], [100, 92], [94, 120], [80, 120], [72, 76]],
    shade: [[100, 62], [124, 62], [128, 76], [120, 120], [106, 120], [100, 92]],
    seam: [[82, 74], [100, 92], [118, 74], [120, 112]],
    zones: [[100, 70, 8, "WAIST"], [84, 100, 8, "LEG A"], [116, 100, 8, "LEG B"]]
  },
  dress: {
    name: "Dress", ticket: "One dress — three pieces, three seams, pressed crisp",
    fill: "#b8566b", stroke: "#7d2f42",
    pieces: [
      blank("BODICE", [16, 58, 62, 120], [[16, 96], [40, 102], [62, 90]], "h-above"),
      blank("SKIRT", [72, 58, 128, 120], [[86, 58], [98, 90], [120, 120]], "v-right"),
      blank("STRAP", [138, 58, 184, 120], [[138, 72], [160, 66], [184, 76]], "h-above")
    ],
    sil: [[80, 62], [92, 62], [100, 68], [108, 62], [120, 62], [124, 84], [142, 120], [58, 120], [76, 84]],
    shade: [[100, 68], [108, 62], [120, 62], [124, 84], [142, 120], [100, 120]],
    seam: [[86, 76], [114, 76], [130, 114], [70, 114]],
    zones: [[100, 72, 8, "BODICE"], [80, 108, 8, "SKIRT L"], [120, 108, 8, "SKIRT R"]]
  },
  coat: {
    name: "Coat", ticket: "One coat — four pieces, four seams, pressed crisp",
    fill: "#b98a4e", stroke: "#7d5828",
    pieces: [
      blank("BODY", [12, 58, 52, 120], [[34, 58], [38, 88], [28, 120]], "v-left"),
      blank("LAPEL", [56, 58, 96, 120], [[74, 58], [70, 86], [84, 120]], "v-right"),
      blank("SLEEVE", [100, 58, 140, 120], [[100, 90], [120, 96], [140, 82]], "h-below"),
      blank("POCKET", [144, 58, 184, 120], [[144, 78], [164, 72], [184, 78]], "h-above")
    ],
    sil: [[72, 62], [92, 62], [100, 68], [108, 62], [128, 62], [148, 82], [138, 94], [130, 88], [130, 122], [70, 122], [70, 88], [62, 94], [52, 82]],
    shade: [[100, 68], [108, 62], [128, 62], [148, 82], [138, 94], [130, 88], [130, 122], [100, 122]],
    seam: [[76, 70], [124, 70], [126, 98], [126, 118], [76, 118]],
    zones: [[100, 74, 8, "COLLAR"], [80, 102, 8, "PANEL"], [118, 110, 8, "HEM"]]
  }
};

const ORDER = ["shirt", "pants", "dress", "coat"];

Object.keys(GARMENTS).forEach(k => {
  const g = GARMENTS[k];
  g.silTop = Math.min.apply(null, g.sil.map(p => p[1]));
  g.silD = poly(g.sil);
  g.shadeD = poly(g.shade);
  g.seamD = D(g.seam);
  g.seamInfo = polyInfo(g.seam);
  g.legs = g.seamInfo.segs.map((s, i) => ({
    a: s.a, len: s.len, ang: s.ang,
    dx: s.dx / s.len, dy: s.dy / s.len,
    px: -s.dy / s.len, py: s.dx / s.len,
    pull: (2.1 + (i % 3) * 0.85) * (i % 2 ? -1 : 1)
  }));
});

const CUSTOMERS = [
  { name: "Yuzu", fur: "#ee7d24", furDark: "#b8531a", inner: "#f9ecd9", cloth: "#1f3350", clothDark: "#16263c", ear: "fox" },
  { name: "Mochi", fur: "#dedcd6", furDark: "#a8a6a0", inner: "#f6f4ef", cloth: "#4a3a5c", clothDark: "#332745", ear: "cat" },
  { name: "Kuma", fur: "#9a6f4a", furDark: "#6b4a2c", inner: "#d9bb96", cloth: "#3f5d47", clothDark: "#2b4232", ear: "bear" },
  { name: "Hana", fur: "#f0e6da", furDark: "#bfae99", inner: "#f8f2ea", cloth: "#8f2b1e", clothDark: "#661a10", ear: "rabbit" }
];

const EARS = {
  fox: { l: "M -9 -8 L -15 -25 L -3 -13 Z", r: "M 9 -8 L 15 -25 L 3 -13 Z", li: "M -9 -9 L -13 -21 L -5 -13 Z", ri: "M 9 -9 L 13 -21 L 5 -13 Z" },
  cat: { l: "M -9 -8 L -13 -20 L -2 -12 Z", r: "M 9 -8 L 13 -20 L 2 -12 Z", li: "M -9 -9 L -11.4 -17 L -4 -12 Z", ri: "M 9 -9 L 11.4 -17 L 4 -12 Z" },
  bear: { l: "M -11 -9 a 5.4 5.4 0 1 1 5 -3", r: "M 11 -9 a 5.4 5.4 0 1 0 -5 -3", li: "M -10.4 -9.4 a 3 3 0 1 1 3.4 -2", ri: "M 10.4 -9.4 a 3 3 0 1 0 -3.4 -2" },
  rabbit: { l: "M -7 -9 q -7 -16 -2 -22 q 6 3 5 21 Z", r: "M 7 -9 q 7 -16 2 -22 q -6 3 -5 21 Z", li: "M -7 -10 q -5 -13 -2.4 -17 q 3.4 3 3 16 Z", ri: "M 7 -10 q 5 -13 2.4 -17 q -3.4 3 -3 16 Z" }
};

const SECONDS = { cut: 20, sew: 26, press: 17, serve: 0 };
const TITLES = {
  cut: ["Cut the pieces", "Press on the red ring, then drag the shears down the chalk line to its end."],
  sew: ["Sew the seams", "Hold to run the machine. Steer against the pull, and release at each corner."],
  press: ["Press the garment", "Fill each patch's dial into the green band, then lift the iron off."],
  serve: ["Hand it over", "The customer is waiting."]
};
const HINTS = {
  cut: "Press on the red ring at the start of a chalk line, then drag the shears along the line to its end. Wander off the chalk and the cloth tears.",
  sew: "Hold anywhere to run the machine. The feed pulls sideways — move your pointer to the opposite side to keep the stitch straight. Release at the ringed corner.",
  press: "Hold the iron on a patch to fill its dial. Lift off while the marker is inside the green band — run past the band and the cloth scorches.",
  serve: "Hand the finished garment across the counter."
};

const BAND = [{ lo: 56, hi: 98 }, { lo: 58, hi: 94 }, { lo: 60, hi: 92 }, { lo: 62, hi: 90 }];
const TOL = [6.6, 6, 5.4, 4.8];
const SEW_SPEED = [30, 34, 38, 42];
const SCORCH = 114;

// a clipped, ticking little workroom loop
const MUSIC = (() => {
  const scale = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79];
  const phrase = [
    [0, 2], [0.5, 4], [1, 5], [2, 4], [3, 6], [4, 5], [5, 3], [6, 4], [7, 2],
    [8, 3], [8.5, 5], [9, 6], [10, 5], [11, 7], [12, 6], [13, 4], [14, 5], [15, 3],
    [16, 5], [16.5, 7], [17, 8], [18, 6], [19, 5], [20, 7], [21, 5], [22, 4], [23, 2],
    [24, 4], [24.5, 3], [25, 5], [26, 3], [27, 2], [28, 3], [29, 1], [30, 2], [31, 0]
  ];
  const notes = [];
  phrase.forEach(p => notes.push({ b: p[0], m: scale[p[1]], d: 0.5, v: "pluck" }));
  [0, 4, 8, 12, 16, 20, 24, 28].forEach(b => {
    notes.push({ b, m: 33, d: 0.46, v: "bass" });
    notes.push({ b: b + 2.5, m: 40, d: 0.3, v: "bass" });
  });
  for (let b = 0; b < 32; b += 0.5) notes.push({ b, m: b % 4 === 0 ? 88 : 94, d: 0.05, v: "tick" });
  return { notes, beats: 32, spb: 0.32 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false, totals: [] }, this.freshRound(0));
  }

  freshRound(round) {
    const r = round % 4;
    const key = ORDER[r];
    const g = GARMENTS[key];
    const spec = {
      key, tol: TOL[r], speed: SEW_SPEED[r], band: BAND[r],
      forgive: this.props.forgiveness ?? 1
    };
    return {
      round, stages: ["cut", "sew", "press", "serve"], stageIndex: 0,
      scores: {}, notes: [], timeLeft: SECONDS.cut, titleCard: TITLES.cut, cardAt: Date.now(),
      cust: CUSTOMERS[round % CUSTOMERS.length], spec,
      prog: g.pieces.map(() => 0), cutDone: g.pieces.map(() => false),
      cutDevs: [], tears: 0, activeCut: null, shear: null,
      legIndex: 0, legT: 0, lat: 0, holding: false, stitchLegs: [[]],
      latDevs: [], cornerErrs: [], overshoots: 0, sewDone: false, ptr: null,
      zoneHeat: g.zones.map(() => 0), scorched: g.zones.map(() => false),
      iron: null, ironing: false, handed: false
    };
  }

  componentDidMount() {
    window.__tailorTarget = this;
    this.started = false;
    this.killMusic();
    this.stopHold();
    setTimeout(() => this.loop(), 0);
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.killMusic();
    this.stopHold();
  }

  garment() { return GARMENTS[this.state.spec.key]; }
  stage() { return this.state.stages[this.state.stageIndex]; }

  muted() { return this.state.muted || (this.props.sound ?? true) === false; }
  musicOn() { return !this.muted() && (this.props.music ?? true) !== false && !this.state.musicOff; }

  audio() {
    if (this.muted() || !this.started) return null;
    if (!window.__tailorAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__tailorAC = new AC();
      const b = window.__tailorAC.createBuffer(1, window.__tailorAC.sampleRate * 1.4, window.__tailorAC.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      window.__tailorNoise = b;
      window.addEventListener("pagehide", () => { try { window.__tailorAC.close(); } catch (e) {} });
    }
    this.actx = window.__tailorAC;
    this.noise = window.__tailorNoise;
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

  burst(o) {
    const ac = this.audio();
    if (!ac) return;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    src.buffer = this.noise;
    src.loop = true;
    f.type = o.type || "bandpass";
    f.Q.value = o.q == null ? 1 : o.q;
    f.frequency.setValueAtTime(o.f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(60, o.f1), t + o.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(t); src.stop(t + o.dur + 0.05);
  }

  sfx(kind) {
    if (!this.audio()) return;
    if (kind === "snip") {
      this.burst({ f0: 3400, f1: 900, dur: 0.07, gain: 0.07, type: "bandpass", q: 2.4 });
      this.tone(1400, 0.05, 0.03, "triangle", 900);
    } else if (kind === "tear") {
      this.burst({ f0: 900, f1: 260, dur: 0.2, gain: 0.075, type: "bandpass", q: 0.7 });
    } else if (kind === "corner") {
      this.tone(880, 0.08, 0.045, "triangle", 620);
    } else if (kind === "hiss") {
      this.burst({ f0: 5200, f1: 2400, dur: 0.26, gain: 0.045, type: "highpass", q: 0.6 });
    } else if (kind === "good") {
      [0, 4, 7].forEach((s, i) => setTimeout(() => this.tone(midiHz(72 + s), 0.16, 0.055, "triangle"), i * 62));
    } else if (kind === "bad") {
      this.tone(170, 0.24, 0.075, "square", 105);
    } else if (kind === "stage") {
      [0, 7].forEach((s, i) => setTimeout(() => this.tone(midiHz(69 + s), 0.2, 0.05, "triangle"), i * 80));
    } else if (kind === "serve") {
      [0, 4, 7, 12].forEach((s, i) => setTimeout(() => this.tone(midiHz(72 + s), 0.24, 0.06, "triangle"), i * 95));
    }
  }

  startHold(kind) {
    const ac = this.audio();
    if (!ac || this.holdNodes) return;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = this.noise; src.loop = true;
    if (kind === "machine") {
      f.type = "bandpass"; f.frequency.value = 260; f.Q.value = 3.2; g.gain.value = 0.05;
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 17; lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      this.holdExtra = lfo;
    } else {
      f.type = "highpass"; f.frequency.value = 2600; g.gain.value = 0.028;
    }
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start();
    this.holdNodes = { src, g };
    window.__tailorHold = this.holdNodes;
  }

  stopHold() {
    const h = this.holdNodes || window.__tailorHold;
    if (!h) return;
    try { h.g.gain.value = 0; h.src.stop(); h.src.disconnect(); h.g.disconnect(); } catch (e) {}
    try { if (this.holdExtra) this.holdExtra.stop(); } catch (e) {}
    this.holdExtra = null;
    this.holdNodes = null;
    window.__tailorHold = null;
  }

  voice(v, freq, at, dur) {
    const ac = this.actx, g = ac.createGain(), o = ac.createOscillator();
    let peak = 0.028;
    if (v === "pluck") { o.type = "triangle"; peak = 0.03; }
    else if (v === "bass") { o.type = "sine"; peak = 0.045; }
    else { o.type = "square"; peak = 0.012; }
    o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(window.__tailorMusicBus);
    o.start(at); o.stop(at + dur + 0.02);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__tailorMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__tailorMusicBus = bus;
      this.musicStart = ac.currentTime + 0.1;
      this.musicBar = 0;
    }
    const barLen = MUSIC.beats * MUSIC.spb;
    while (this.musicStart + this.musicBar * barLen < ac.currentTime + 0.7) {
      const base = this.musicStart + this.musicBar * barLen;
      MUSIC.notes.forEach(nt => {
        const at = base + nt.b * MUSIC.spb;
        if (at > ac.currentTime - 0.05) this.voice(nt.v, midiHz(nt.m), at, nt.d * MUSIC.spb);
      });
      this.musicBar++;
    }
  }

  killMusic() {
    const bus = window.__tailorMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__tailorMusicBus = null;
    this.musicBar = 0;
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const s = this.state;
    if (this.started && window.__tailorTarget === this && window.__tailorAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__tailorMusicBus) this.killMusic();
    }
    if (s.overlay) return;
    const st = this.stage();
    const patch = {};
    let dirty = false;

    if (s.titleCard && now - s.cardAt > 1600) { patch.titleCard = null; dirty = true; }

    if (st === "sew" && s.holding && !s.sewDone) {
      const g = this.garment();
      const leg = g.legs[s.legIndex];
      if (leg) {
        const sp = s.spec.speed;
        let legT = s.legT + (sp / leg.len) * dt;
        // the feed dog drags the cloth sideways; the pointer's offset is the counter-steer
        const perp = s.ptr ? (s.ptr.x - leg.a[0]) * leg.px + (s.ptr.y - leg.a[1]) * leg.py : 0;
        const wob = Math.sin(now / 520 + s.legIndex) * 1.1;
        let lat = s.lat + (leg.pull + wob + clamp(perp, -6, 6) * 1.7 / s.spec.forgive) * dt;
        lat = clamp(lat, -9, 9);
        this.latAcc = (this.latAcc || 0) + dt;
        const legs = s.stitchLegs.slice();
        const cur = (legs[s.legIndex] || []).slice();
        if (this.latAcc > 0.045) {
          this.latAcc = 0;
          const t = clamp(legT, 0, 1);
          cur.push([leg.a[0] + leg.dx * t * leg.len + leg.px * lat, leg.a[1] + leg.dy * t * leg.len + leg.py * lat]);
          legs[s.legIndex] = cur;
          patch.stitchLegs = legs;
          patch.latDevs = s.latDevs.concat([Math.abs(lat)]);
        }
        if (legT >= 1) {
          // ran past the corner with the needle still down
          this.sfx("tear");
          this.note("The needle ran past a corner — the stitch line overshot.");
          patch.overshoots = s.overshoots + 1;
          patch.cornerErrs = s.cornerErrs.concat([0.4]);
          this.stopHold();
          Object.assign(patch, this.pivot(s, legs, lat, false));
        } else {
          patch.legT = legT;
          patch.lat = lat;
        }
        dirty = true;
      }
    }

    if (st === "press" && s.ironing && s.iron) {
      const g = this.garment();
      const heat = s.zoneHeat.slice(), sc = s.scorched.slice();
      g.zones.forEach((z, i) => {
        if (Math.hypot(s.iron.x - z[0], s.iron.y - z[1]) < z[2] + 3) {
          heat[i] = Math.min(150, heat[i] + dt * 26);
          if (heat[i] > SCORCH && !sc[i]) {
            sc[i] = true;
            this.sfx("tear");
            this.note("Scorch mark on the " + z[3].toLowerCase() + " — the iron sat too long.");
          }
        }
      });
      patch.zoneHeat = heat; patch.scorched = sc; dirty = true;
    }

    const total = SECONDS[st];
    if (total > 0) {
      const left = s.timeLeft - dt;
      if (left <= 0) {
        this.setState(Object.assign(patch, { timeLeft: 0 }), () => this.timeUp());
        return;
      }
      patch.timeLeft = left; dirty = true;
    }
    if (dirty) this.setState(patch);
  };

  // move to the next seam leg; clean === released at the corner
  pivot(s, legs, lat, clean) {
    const g = this.garment();
    const idx = s.legIndex + 1;
    const out = { legIndex: idx, legT: 0, lat: lat * 0.25, holding: false, stitchLegs: legs.concat([[]]) };
    if (idx >= g.legs.length) {
      out.sewDone = true;
      setTimeout(() => this.commit("Sewing", this.sewScore()), 60);
    } else if (clean) this.sfx("corner");
    return out;
  }

  note(text) { this.pendingNotes = (this.pendingNotes || []).concat([{ text }]); }

  commit(name, score) {
    if (this.committedAt === this.state.stageIndex) return;
    this.committedAt = this.state.stageIndex;
    const sc = Math.round(clamp(score, 0, 100));
    this.sfx(sc >= 75 ? "good" : sc >= 45 ? "stage" : "bad");
    const seen = {};
    const notes = this.state.notes.concat(this.pendingNotes || []).filter(x => {
      if (seen[x.text]) return false;
      seen[x.text] = 1;
      return true;
    });
    this.pendingNotes = [];
    this.stopHold();
    this.setState(s => {
      const idx = s.stageIndex + 1;
      const next = s.stages[idx];
      const scores = Object.assign({}, s.scores);
      scores[name] = sc;
      return { scores, notes, stageIndex: idx,
        timeLeft: next ? SECONDS[next] : 0,
        titleCard: next ? (TITLES[next] || null) : null, cardAt: Date.now(),
        activeCut: null, holding: false, ironing: false };
    }, () => { if (this.stage() === "serve") this.sfx("serve"); });
  }

  timeUp() {
    const st = this.stage();
    if (st === "cut") this.commit("Cutting", this.cutScore());
    else if (st === "sew") this.commit("Sewing", this.sewScore());
    else if (st === "press") this.commit("Pressing", this.pressScore());
  }

  cutScore() {
    const s = this.state, g = this.garment();
    const done = s.cutDone.filter(Boolean).length;
    const need = g.pieces.length;
    if (!done && !s.cutDevs.length) { this.note("No cloth got cut."); return 0; }
    if (done < need) this.note((need - done) + " piece" + (need - done > 1 ? "s" : "") + " never came free of the blank.");
    const dev = s.cutDevs.length ? s.cutDevs.reduce((a, b) => a + b, 0) / s.cutDevs.length : 4;
    const accuracy = clamp(100 - dev * 19 / s.spec.forgive, 0, 100);
    if (dev > 2.2) this.note("The shears wandered off the chalk — edges came out ragged.");
    if (s.tears) this.note(s.tears + " tear" + (s.tears > 1 ? "s" : "") + " in the cloth.");
    return (done / need) * 100 * 0.58 + accuracy * 0.42 - s.tears * 5;
  }

  sewScore() {
    const s = this.state, g = this.garment();
    const legs = g.legs.length;
    const doneLegs = clamp(s.legIndex, 0, legs);
    if (!doneLegs && !s.latDevs.length) { this.note("Not a stitch went in."); return 0; }
    if (doneLegs < legs) this.note("Only " + doneLegs + " of " + legs + " seams got sewn.");
    const dev = s.latDevs.length ? s.latDevs.reduce((a, b) => a + b, 0) / s.latDevs.length : 5;
    const straight = clamp(100 - dev * 15 / s.spec.forgive, 0, 100);
    if (dev > 2.4) this.note("The stitch line wandered off the seam — that will show.");
    const cerr = s.cornerErrs.length ? s.cornerErrs.reduce((a, b) => a + b, 0) / s.cornerErrs.length : 0.3;
    const corners = clamp(100 - cerr * 220, 0, 100);
    if (cerr > 0.14) this.note("Corners turned early or late — the seams do not meet square.");
    return (doneLegs / legs) * 100 * 0.42 + straight * 0.36 + corners * 0.22 - s.overshoots * 4;
  }

  pressScore() {
    const s = this.state, g = this.garment(), b = s.spec.band;
    const lo = b.lo / s.spec.forgive, hi = b.hi * s.spec.forgive;
    let sum = 0, cold = 0;
    g.zones.forEach((z, i) => {
      const v = s.zoneHeat[i];
      if (s.scorched[i]) { sum += 22; return; }
      if (v >= lo && v <= hi) sum += 100;
      else if (v < lo) { sum += (v / lo) * 74; if (v < lo * 0.5) cold++; }
      else sum += clamp(100 - (v - hi) * 1.8, 30, 100);
    });
    if (cold) this.note(cold + " patch" + (cold > 1 ? "es" : "") + " left creased.");
    const scorches = s.scorched.filter(Boolean).length;
    if (scorches) this.note(scorches + " scorch" + (scorches > 1 ? "es" : "") + " on the finished garment.");
    return sum / g.zones.length;
  }

  local(e) {
    const svg = this.svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / 200, r.height / 140);
    const ox = (r.width - 200 * scale) / 2, oy = (r.height - 140 * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  }

  onDown = e => {
    if (this.state.overlay) return;
    this.audio();
    const s = this.state, st = this.stage(), p = this.local(e);
    if (st === "cut") {
      const g = this.garment();
      let pick = null, bestD = 9.5;
      g.pieces.forEach((pc, i) => {
        if (s.cutDone[i]) return;
        const pr = projOn(pc.info, p.x, p.y);
        if (pr.dist < bestD && pr.t <= s.prog[i] + 0.2) { bestD = pr.dist; pick = i; }
      });
      this.setState({ activeCut: pick, shear: p });
    } else if (st === "sew" && !s.sewDone) {
      this.startHold("machine");
      this.setState({ holding: true, ptr: p });
    } else if (st === "press") {
      this.startHold("steam");
      this.sfx("hiss");
      this.setState({ ironing: true, iron: p });
    }
  };

  onMove = e => {
    const s = this.state;
    if (s.overlay) return;
    const st = this.stage(), p = this.local(e);
    if (st === "cut") {
      const patch = { shear: p };
      const i = s.activeCut;
      if (i != null && !s.cutDone[i]) {
        const pc = this.garment().pieces[i];
        const pr = projOn(pc.info, p.x, p.y);
        const tol = s.spec.tol * s.spec.forgive;
        if (pr.t > s.prog[i]) {
          const prog = s.prog[i];
          const nd = s.cutDevs.concat([Math.min(pr.dist, 12)]);
          patch.cutDevs = nd;
          const np = s.prog.slice();
          np[i] = pr.t;
          patch.prog = np;
          if (pr.dist > tol) {
            patch.tears = s.tears + 1;
            this.sfx("tear");
          } else if (Math.floor(pr.t * 6) > Math.floor(prog * 6)) this.sfx("snip");
          if (pr.t > 0.94) {
            const dn = s.cutDone.slice();
            dn[i] = true;
            np[i] = 1;
            patch.cutDone = dn;
            patch.activeCut = null;
            this.sfx("snip");
            if (dn.filter(Boolean).length === this.garment().pieces.length) {
              setTimeout(() => this.commit("Cutting", this.cutScore()), 120);
            }
          }
        }
      }
      this.setState(patch);
    } else if (st === "sew") {
      this.setState({ ptr: p });
    } else if (st === "press") {
      this.setState({ iron: p });
    }
  };

  onUp = () => {
    const s = this.state;
    if (s.overlay) return;
    const st = this.stage();
    if (st === "cut") this.setState({ activeCut: null });
    else if (st === "sew") {
      this.stopHold();
      if (!s.holding || s.sewDone) { this.setState({ holding: false }); return; }
      if (s.legT >= 0.76) {
        const err = Math.abs(1 - s.legT);
        this.setState(Object.assign({ cornerErrs: s.cornerErrs.concat([err]) },
          this.pivot(s, s.stitchLegs.slice(), s.lat, err < 0.12)));
      } else this.setState({ holding: false });
    } else if (st === "press") {
      this.stopHold();
      this.setState({ ironing: false });
    }
  };

  doBig = () => {
    if (this.stage() !== "serve" || this.state.handed) return;
    this.setState({ handed: true });
    const vals = Object.values(this.state.scores);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    this.sfx(avg >= 70 ? "good" : "stage");
    this.setState(s => ({ overlay: "card", totals: s.totals.concat([Math.round(avg)]) }));
  };

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.committedAt = null;
    this.setState(s => Object.assign(this.freshRound(s.round + 1),
      { overlay: null, totals: s.round + 1 >= 4 ? [] : s.totals, muted: s.muted, musicOff: s.musicOff }));
  };

  toggleSound = () => {
    if (!this.state.muted) { this.stopHold(); this.killMusic(); }
    this.setState(s => ({ muted: !s.muted }));
  };

  toggleMusic = () => {
    this.audio();
    if (this.musicOn()) this.killMusic();
    this.setState(s => ({ musicOff: !s.musicOff }));
  };

  renderVals() {
    const s = this.state, g = this.garment(), st = this.stage(), c = s.spec;
    const guides = this.props.guides ?? true;
    const vals = Object.values(s.scores);
    const avgNow = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    const mood = avgNow >= 90 ? "Delighted" : avgNow >= 80 ? "Happy" : avgNow >= 70 ? "Satisfied"
      : avgNow >= 60 ? "Unconvinced" : avgNow >= 50 ? "Disappointed" : "Asking for a refund";
    const moodColor = avgNow >= 80 ? "#2f7d3a" : avgNow >= 70 ? "#b07d00" : avgNow >= 60 ? "#c2560f" : "#c2210f";

    // ---- cutting table
    const nextPiece = s.cutDone.findIndex(v => !v);
    const pieces = g.pieces.map((pc, i) => {
      const done = s.cutDone[i];
      const pr = s.prog[i];
      const start = pc.cut[0];
      return {
        label: pc.label,
        labelColor: done ? "#2f7d3a" : "#4a3c26",
        lx: n((pc.box[0] + pc.box[2]) / 2 - 24), ly: n(pc.box[3] + 1),
        keepD: poly(pc.keep), offD: poly(pc.off),
        offT: done ? "translate(" + n(pc.away[0]) + " " + n(pc.away[1]) + ")" : "translate(0 0)",
        offO: done ? 0.55 : 1,
        chalkD: D(pc.cut),
        hasTrail: pr > 0.01,
        trailD: D(upTo(pc.info, pr)),
        isNext: guides && !done && (i === nextPiece || s.activeCut === i),
        sx: n(start[0]), sy: n(start[1]),
        fill: g.fill, stroke: g.stroke
      };
    });
    const shear = s.shear || { x: 100, y: 90 };
    const shearAng = s.activeCut != null ? projOn(g.pieces[s.activeCut].info, shear.x, shear.y).ang - 90 : 0;

    // ---- sewing
    const leg = g.legs[Math.min(s.legIndex, g.legs.length - 1)];
    const footPt = s.sewDone ? ptAt(g.seamInfo, 1) : (() => {
      const t = clamp(s.legT, 0, 1);
      return { x: leg.a[0] + leg.dx * t * leg.len + leg.px * s.lat, y: leg.a[1] + leg.dy * t * leg.len + leg.py * s.lat, ang: leg.ang };
    })();
    const stitchLines = s.stitchLegs.map((pts, i) => ({
      d: pts.length > 1 ? D(pts) : "",
      stroke: "#f0c040"
    })).filter(x => x.d);
    const corners = g.seam.map((p, i) => {
      const isEnd = i === g.seam.length - 1;
      const reached = i <= s.legIndex;
      const live = guides && !s.sewDone && i === s.legIndex + 1;
      return {
        x: n(p[0]), y: n(p[1]),
        r: i === 0 ? 3 : 4.2,
        stroke: live ? "#ec3013" : reached ? "#2f7d3a" : "#f6f4ef",
        w: live ? 2 : 1.2,
        live: live && !isEnd ? true : live
      };
    });
    const latOff = Math.abs(s.lat);
    const badgeText = s.sewDone ? "SEAM DONE" : s.holding
      ? (s.legT >= 0.76 ? "RELEASE NOW" : latOff > 3.4 ? "STEER BACK" : "RUNNING")
      : (s.legIndex > 0 ? "HOLD TO CONTINUE" : "HOLD TO SEW");

    // ---- pressing
    const band = c.band;
    const zones = g.zones.map((z, i) => {
      const v = s.zoneHeat[i];
      const sc = s.scorched[i];
      const inBand = v >= band.lo && v <= band.hi;
      const over = !sc && v > band.hi;
      // the dial makes the whole thing visible: grey track, green target band, filling marker
      const rr = z[2] + 3.4, circ = 2 * Math.PI * rr;
      const frac = v => clamp(v / SCORCH, 0, 1);
      return {
        x: n(z[0]), y: n(z[1]), r: n(z[2]),
        rr: n(rr), circ: n(circ),
        dialT: "rotate(-90 " + n(z[0]) + " " + n(z[1]) + ")",
        tDash: n((frac(band.hi) - frac(band.lo)) * circ) + " " + n(circ),
        tOff: n(-frac(band.lo) * circ),
        fDash: n(frac(v) * circ) + " " + n(circ),
        fillStroke: sc ? "#c2210f" : inBand ? "#f6f4ef" : over ? "#ec3013" : "#f0c040",
        label: z[3],
        lx: n(z[0] - 20), ly: n(z[1] + z[2] + 8),
        fill: sc ? "#6b4a2c" : over ? "#c98a3a" : "#1d1826",
        o: sc ? 0.75 : over ? n(0.2 + (v - band.hi) / 100) : n(clamp(0.3 - v / 420, 0.02, 0.3)),
        rough: v < band.lo * 0.8,
        gloss: inBand,
        ring: sc ? "#c2210f" : inBand ? "#2f7d3a" : over ? "#c2560f" : "#f6f4ef",
        dash: inBand || sc ? "0" : "2.4 2.2",
        wrinkle: "M " + n(z[0] - z[2] * 0.6) + " " + n(z[1] - 2) + " q " + n(z[2] * 0.3) + " 3 " + n(z[2] * 0.6) + " 0 q " + n(z[2] * 0.3) + " -3 " + n(z[2] * 0.6) + " 0"
          + " M " + n(z[0] - z[2] * 0.6) + " " + n(z[1] + 3) + " q " + n(z[2] * 0.3) + " 3 " + n(z[2] * 0.6) + " 0 q " + n(z[2] * 0.3) + " -3 " + n(z[2] * 0.6) + " 0",
        sheen: "M " + n(z[0] - z[2] * 0.5) + " " + n(z[1] + z[2] * 0.3) + " q " + n(z[2] * 0.5) + " " + n(-z[2] * 0.9) + " " + n(z[2]) + " " + n(-z[2] * 0.5)
      };
    });
    const steam = [];
    if (st === "press" && s.ironing && s.iron) {
      for (let i = 0; i < 4; i++) {
        steam.push({
          x: n(s.iron.x - 6 + i * 4), y: n(s.iron.y - 8),
          rx: n(2 + (i % 2) * 0.8), ry: n(3 + (i % 3)), o: 0.4,
          style: "transform-box:fill-box; transform-origin:center; animation:tlSteam " + (1.6 + (i % 3) * 0.4) + "s ease-out " + (i * 0.25) + "s infinite"
        });
      }
    }

    // ---- panel
    let panelLabel = "", panelChips = [], panelNote = "", panelNoteColor = "#6b6864";
    if (st === "cut") {
      panelLabel = "Pieces";
      panelChips = g.pieces.map((pc, i) => ({
        fill: s.cutDone[i] ? g.fill : "#dedcd6",
        color: s.cutDone[i] ? "#2f7d3a" : "#6b6864",
        tag: s.cutDone[i] ? "OK" : Math.round(s.prog[i] * 100) + ""
      }));
      panelNote = s.tears ? s.tears + " tear" + (s.tears > 1 ? "s" : "") : "Stay on the chalk";
      panelNoteColor = s.tears ? "#c2210f" : "#6b6864";
    } else if (st === "sew") {
      panelLabel = "Seams";
      panelChips = g.legs.map((lg, i) => ({
        fill: i < s.legIndex ? "#2f7d3a" : i === s.legIndex ? "#f0c040" : "#dedcd6",
        color: i < s.legIndex ? "#2f7d3a" : "#6b6864",
        tag: i < s.legIndex ? "OK" : i === s.legIndex ? Math.round(s.legT * 100) + "" : "—"
      }));
      panelNote = latOff > 3.4 ? "Stitch drifting " + (s.lat > 0 ? "right" : "left") : "Drift " + latOff.toFixed(1);
      panelNoteColor = latOff > 3.4 ? "#c2210f" : latOff > 1.8 ? "#c2560f" : "#2f7d3a";
    } else if (st === "press") {
      panelLabel = "Patches";
      panelChips = g.zones.map((z, i) => {
        const v = s.zoneHeat[i];
        const ok = !s.scorched[i] && v >= band.lo && v <= band.hi;
        return {
          fill: s.scorched[i] ? "#6b4a2c" : ok ? "#2f7d3a" : v > band.hi ? "#c98a3a" : "#dedcd6",
          color: s.scorched[i] ? "#c2210f" : ok ? "#2f7d3a" : "#6b6864",
          tag: Math.round(v) + ""
        };
      });
      panelNote = "Lift inside the green band";
    }

    const ears = EARS[s.cust.ear];
    const cardRows = Object.keys(s.scores).map(k => ({
      name: k, val: s.scores[k], pct: s.scores[k],
      color: s.scores[k] >= 75 ? "#2f7d3a" : s.scores[k] >= 45 ? "#b07d00" : "#c2210f"
    }));

    return {
      svgRef: this.svgRef,
      hudKicker: "Order " + (s.round + 1) + " of 4",
      hudOrder: g.ticket + " · for " + s.cust.name,
      stageLabel: st === "cut" ? "Cut" : st === "sew" ? "Sew" : st === "press" ? "Press" : "Hand over",
      showTimer: SECONDS[st] > 0 && !s.overlay,
      timerText: Math.ceil(s.timeLeft) + "s",
      timerPct: n(clamp(s.timeLeft / (SECONDS[st] || 1), 0, 1) * 100),
      timerColor: s.timeLeft < 4 ? "#c2210f" : s.timeLeft < 8 ? "#c2560f" : "#201e1d",
      showReadout: vals.length > 0,
      readoutLabel: "So far", readoutText: avgNow + " · " + mood, readoutColor: moodColor,
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleMusic: this.toggleMusic, toggleSound: this.toggleSound,
      onDown: this.onDown, onMove: this.onMove, onUp: this.onUp,

      isCut: st === "cut", isSew: st === "sew", isPress: st === "press", isServe: st === "serve",
      pieces,
      showShears: st === "cut" && !!s.shear,
      shearT: "translate(" + n(shear.x) + " " + n(shear.y) + ") rotate(" + n(shearAng) + ")",

      fabricFill: g.fill, fabricStroke: g.stroke,
      silD: g.silD, silShade: g.shadeD, seamD: g.seamD,
      corners, stitchLines,
      footT: "translate(" + n(footPt.x) + " " + n(footPt.y) + ") rotate(" + n(footPt.ang + 90) + ")",
      showHoldBadge: st === "sew",
      badgeText,
      badgeBg: s.sewDone ? "#2f7d3a" : !s.holding ? "#201e1d" : (s.legT >= 0.76 || latOff > 3.4) ? "#ec3013" : "#2f7d3a",

      zones, steam,
      showIron: st === "press" && !!s.iron,
      ironT: s.iron ? "translate(" + n(s.iron.x) + " " + n(s.iron.y - 6) + ")" : "translate(100 84)",

      // collar pinned to the hanger bar (viewBox y = 50) whatever the garment's own top edge is
      hangT: "translate(62 50) scale(0.82) translate(-100 " + n(-g.silTop) + ")",
      custT: "translate(156 60) scale(1.24)",
      custName: s.cust.name, custFur: s.cust.fur, custDark: s.cust.furDark,
      custInner: s.cust.inner, custCloth: s.cust.cloth, custClothDark: s.cust.clothDark,
      earL: ears.l, earR: ears.r, earLi: ears.li, earRi: ears.ri,
      mouthD: avgNow >= 70 ? "M -4 9.6 q 4 3 8 0" : "M -4 10.6 q 4 -2.4 8 0",

      showPanel: !s.overlay && st !== "serve",
      panelLabel, panelChips, panelNote, panelNoteColor,
      hasPanelNote: !!panelNote,

      showBigBtn: st === "serve" && !s.overlay && !s.handed,
      bigLabel: "Hand it over",
      doBig: this.doBig,

      showHint: !s.overlay && !s.titleCard,
      hintText: HINTS[st],

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: s.round + 1 >= 4 ? "Shop closed · " + g.name : g.name + " for " + s.cust.name,
      cardScore: avgNow + " / 100",
      cardMood: s.cust.name + " is " + mood.toLowerCase() + ".",
      cardRows, cardNotes: s.notes, hasNotes: s.notes.length > 0,
      cardCta: s.round + 1 >= 4 ? "Open again tomorrow" : "Next customer",
      cardAction: this.cardAction
    };
  }
}
