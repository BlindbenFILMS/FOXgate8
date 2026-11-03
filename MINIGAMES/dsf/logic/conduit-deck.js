
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const COLS = 6, ROWS = 5, CELL = 19, X0 = 42, Y0 = 22;
const HALF = CELL / 2;
const cx = c => X0 + c * CELL + HALF;
const cy = r => Y0 + r * CELL + HALF;
// 0 up, 1 right, 2 down, 3 left
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

const LINES = [
  { key: "power", name: "Power", dim: "#6b5a2c", ink: "#d9a84e", spark: "#f6e3b4" },
  { key: "coolant", name: "Coolant", dim: "#2f5a4c", ink: "#6f9d86", spark: "#cfe8dc" },
  { key: "air", name: "Air", dim: "#33506b", ink: "#6e8fb8", spark: "#d2e2f2" }
];

// base openings at rot 0; rotating adds r to each direction
const BASE = { straight: [0, 2], elbow: [0, 1] };
const SHAPE = {
  straight: "M 0 " + -HALF + " L 0 " + HALF,
  elbow: "M 0 " + -HALF + " L 0 0 L " + HALF + " 0"
};
const openingsOf = (type, rot) => BASE[type].map(d => (d + rot) % 4);

const ROUNDS = [
  { lines: [0], starts: [2], ends: [2], wander: 3.6, minLen: 9, sys: "Galley power feed" },
  { lines: [0, 1], starts: [1, 3], ends: [0, 4], wander: 3, minLen: 7, sys: "Reactor coolant loop" },
  { lines: [0, 1, 2], starts: [0, 2, 4], ends: [1, 2, 3], wander: 2.4, sys: "Habitat ring trunk" },
  { lines: [0, 1, 2], starts: [0, 2, 4], ends: [2, 3, 4], wander: 2.8, sys: "Dock umbilical spine" }
];

function rng(seed) {
  let s = seed + 0x6d2b79f5;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// route a non-crossing path from the left edge to the right edge, biased toward the exit
function routeLine(taken, sr, er, rand, wander) {
  const goal = [COLS - 1, er];
  const path = [];
  const seen = {};
  function walk(c, r) {
    path.push([c, r]);
    seen[c + "," + r] = true;
    if (c === goal[0] && r === goal[1]) return true;
    const dirs = [0, 1, 2, 3]
      .map(d => {
        const nc = c + DX[d], nr = r + DY[d];
        const ok = nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS
          && !taken[nc + "," + nr] && !seen[nc + "," + nr];
        const h = Math.abs(goal[0] - nc) + Math.abs(goal[1] - nr);
        return { d, nc, nr, ok, w: h + rand() * (wander || 2.6) };
      })
      .filter(x => x.ok)
      .sort((a, b) => a.w - b.w);
    for (const x of dirs) if (walk(x.nc, x.nr)) return true;
    path.pop();
    delete seen[c + "," + r];
    return false;
  }
  if (taken["0," + sr]) return null;
  return walk(0, sr) ? path : null;
}

// turn a path into placed pieces: each cell's two openings are its neighbours
function piecesFromPath(path, lineIdx) {
  const out = [];
  for (let i = 0; i < path.length; i++) {
    const [c, r] = path[i];
    const ds = [];
    if (i === 0) ds.push(3);
    else ds.push([0, 1, 2, 3].find(d => path[i - 1][0] === c + DX[d] && path[i - 1][1] === r + DY[d]));
    if (i === path.length - 1) ds.push(1);
    else ds.push([0, 1, 2, 3].find(d => path[i + 1][0] === c + DX[d] && path[i + 1][1] === r + DY[d]));
    if (ds[0] == null || ds[1] == null || ds[0] === ds[1]) return null;
    const opposite = (ds[0] + 2) % 4 === ds[1];
    const type = opposite ? "straight" : "elbow";
    let rot = null;
    for (let k = 0; k < 4; k++) {
      const o = openingsOf(type, k);
      if (o.includes(ds[0]) && o.includes(ds[1])) { rot = k; break; }
    }
    if (rot == null) return null;
    out.push({ c, r, type, rot, line: lineIdx });
  }
  return out;
}

function buildPuzzle(round, parallel) {
  const cfg = ROUNDS[round % ROUNDS.length];
  // fallback: straight-across endpoints are always routable
  const ends = parallel ? cfg.starts : cfg.ends;
  for (let seed = 1; seed < 400; seed++) {
    const rand = rng(seed + round * 977);
    const taken = {};
    const pieces = [];
    let ok = true;
    for (let i = 0; i < cfg.lines.length; i++) {
      const path = routeLine(taken, cfg.starts[i], ends[i], rand, cfg.wander);
      if (!path || path.length < (parallel ? 3 : cfg.minLen || 3)) { ok = false; break; }
      const pcs = piecesFromPath(path, cfg.lines[i]);
      if (!pcs) { ok = false; break; }
      pcs.forEach(p => { taken[p.c + "," + p.r] = true; pieces.push(p); });
    }
    if (!ok) continue;
    // scramble, then make sure it isn't handed over already solved
    const scrambled = pieces.map(p => {
      let rot = Math.floor(rand() * 4);
      if (rot === p.rot && rand() < 0.8) rot = (rot + 1 + Math.floor(rand() * 3)) % 4;
      return Object.assign({}, p, { rot, correct: p.rot });
    });
    const par = scrambled.reduce((a, p) => a + turnsNeeded(p), 0);
    if (par < 3) continue;
    return { pieces: scrambled, cfg, par };
  }
  return parallel ? null : buildPuzzle(round, true);
}

function turnsNeeded(p) {
  const d = (p.correct - p.rot + 4) % 4;
  // a straight pipe reads the same at 0 and 180
  return p.type === "straight" ? Math.min(d, (d + 2) % 4) : d;
}


// patient puzzle loop: soft plucks in dorian over a low pulse
const MUSIC = (() => {
  const notes = [];
  const chords = [[45, 52, 57], [43, 50, 55], [41, 48, 53], [45, 52, 59]];
  chords.forEach((ch, s) => {
    const at = s * 8;
    notes.push({ b: at, m: ch[0] - 12, d: 7.4, v: "bass" });
    ch.forEach((m, i) => notes.push({ b: at + i * 0.5, m, d: 6.6, v: "pad" }));
    [0.5, 2, 3.5, 5, 6.5].forEach((off, i) => notes.push({ b: at + off, m: ch[(i + 1) % 3] + 12, d: 1.4, v: "lead" }));
  });
  [7.5, 15.5, 23.5, 31.5].forEach(b => notes.push({ b, m: 81, d: 1.6, v: "bell" }));
  return { notes, beats: 32, spb: 0.5 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshRound(0));
  }

  freshRound(round) {
    const pz = buildPuzzle(round);
    return {
      round, pieces: pz.pieces, cfg: pz.cfg, par: pz.par,
      turns: 0, solvedAt: null,
      titleCard: ["Panel " + ((round % 4) + 1), pz.cfg.sys], cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__conduitTarget = this;
    this.started = false;
    this.killMusic();
    this.tick = setInterval(() => {
      const s = this.state;
      if (this.started && window.__conduitAC) {
        if (this.musicOn()) this.scheduleMusic();
        else if (window.__conduitMusicBus) this.killMusic();
      }
      if (s.titleCard && Date.now() - s.cardAt > 1600) this.setState({ titleCard: null });
    }, 120);
  }

  componentWillUnmount() { clearInterval(this.tick); this.killMusic(); }

  muted() { return this.state.muted || (this.props.sound ?? true) === false; }

  audio() {
    if (this.muted() || !this.started) return null;
    if (!window.__conduitAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__conduitAC = new AC();
      window.addEventListener("pagehide", () => { try { window.__conduitAC.close(); } catch (e) {} });
    }
    this.actx = window.__conduitAC;
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
    o.connect(g); g.connect(window.__conduitMusicBus);
    o.start(at); o.stop(at + dur + 0.03);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__conduitMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__conduitMusicBus = bus;
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
    const bus = window.__conduitMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__conduitMusicBus = null;
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
    if (kind === "turn") this.tone(660, 0.05, 0.035, "triangle", 880);
    else if (kind === "connect") [0, 7, 12].forEach((s, i) => setTimeout(() => this.tone(hz(72 + s), 0.16, 0.05, "triangle"), i * 60));
    else if (kind === "done") [0, 4, 7, 12].forEach((s, i) => setTimeout(() => this.tone(hz(72 + s), 0.24, 0.055, "triangle"), i * 100));
  }

  // which pieces the fluid reaches, per line, walking out from the inlet
  flow(pieces, cfg) {
    const at = {};
    pieces.forEach(p => { at[p.c + "," + p.r] = p; });
    const wet = {};
    const done = {};
    cfg.lines.forEach((li, i) => {
      const sr = cfg.starts[i], er = cfg.ends[i];
      const first = at["0," + sr];
      if (!first || first.line !== li || !openingsOf(first.type, first.rot).includes(3)) { done[li] = false; return; }
      const stack = [[0, sr]];
      const seen = {};
      seen["0," + sr] = true;
      wet["0," + sr] = true;
      while (stack.length) {
        const [c, r] = stack.pop();
        const p = at[c + "," + r];
        openingsOf(p.type, p.rot).forEach(d => {
          const nc = c + DX[d], nr = r + DY[d];
          const q = at[nc + "," + nr];
          if (!q || q.line !== li || seen[nc + "," + nr]) return;
          if (!openingsOf(q.type, q.rot).includes((d + 2) % 4)) return;
          seen[nc + "," + nr] = true;
          wet[nc + "," + nr] = true;
          stack.push([nc, nr]);
        });
      }
      const last = at[COLS - 1 + "," + er];
      done[li] = !!(last && seen[COLS - 1 + "," + er] && openingsOf(last.type, last.rot).includes(1));
    });
    return { wet, done };
  }

  rotate(idx) {
    if (this.state.overlay || this.state.solvedAt) return;
    this.audio();
    this.sfx("turn");
    this.setState(s => {
      const pieces = s.pieces.map((p, i) => i === idx ? Object.assign({}, p, { rot: (p.rot + 1) % 4 }) : p);
      const before = this.flow(s.pieces, s.cfg).done;
      const after = this.flow(pieces, s.cfg).done;
      const newly = s.cfg.lines.some(li => after[li] && !before[li]);
      const all = s.cfg.lines.every(li => after[li]);
      if (all) {
        this.sfx("done");
        setTimeout(() => this.setState({ overlay: "card" }), 1300);
      } else if (newly) this.sfx("connect");
      return { pieces, turns: s.turns + 1, solvedAt: all ? Date.now() : null };
    });
  }

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(this.freshRound(s.round + 1), { overlay: null, muted: s.muted }));
  };

  toggleSound = () => {
    if (!this.state.muted) this.killMusic();
    this.setState(s => ({ muted: !s.muted }));
  };

  renderVals() {
    const s = this.state, cfg = s.cfg;
    const { wet, done } = this.flow(s.pieces, cfg);
    const allDone = cfg.lines.every(li => done[li]);

    const over = Math.max(0, s.turns - s.par);
    const efficiency = clamp(100 - over * 5, 0, 100);
    const score = Math.round(allDone ? efficiency * 0.55 + 45 : 0);

    const gridLines = [];
    for (let c = 1; c < COLS; c++) gridLines.push({ d: "M " + (X0 + c * CELL) + " " + Y0 + " L " + (X0 + c * CELL) + " " + (Y0 + ROWS * CELL) });
    for (let r = 1; r < ROWS; r++) gridLines.push({ d: "M " + X0 + " " + (Y0 + r * CELL) + " L " + (X0 + COLS * CELL) + " " + (Y0 + r * CELL) });

    const ports = [];
    cfg.lines.forEach((li, i) => {
      const L = LINES[li];
      const lit = done[li];
      const sy = cy(cfg.starts[i]) - 7.5, ey = cy(cfg.ends[i]) - 7.5;
      ports.push({
        x: n(X0 - 17), y: n(sy), rx: n(X0 - 20), ry: n(sy - 3),
        fill: lit ? L.ink : "#22323c", stroke: L.ink, ink: lit ? "#15222a" : L.ink,
        arrow: "M " + n(X0 - 13) + " " + n(sy + 7.5) + " L " + n(X0 - 6) + " " + n(sy + 7.5)
          + " M " + n(X0 - 9) + " " + n(sy + 4.5) + " L " + n(X0 - 6) + " " + n(sy + 7.5)
          + " L " + n(X0 - 9) + " " + n(sy + 10.5),
        lit
      });
      ports.push({
        x: n(X0 + COLS * CELL + 2), y: n(ey), rx: n(X0 + COLS * CELL - 1), ry: n(ey - 3),
        fill: lit ? L.ink : "#22323c", stroke: L.ink, ink: lit ? "#15222a" : L.ink,
        arrow: "M " + n(X0 + COLS * CELL + 5) + " " + n(ey + 7.5) + " L " + n(X0 + COLS * CELL + 12) + " " + n(ey + 7.5)
          + " M " + n(X0 + COLS * CELL + 9) + " " + n(ey + 4.5) + " L " + n(X0 + COLS * CELL + 12) + " " + n(ey + 7.5)
          + " L " + n(X0 + COLS * CELL + 9) + " " + n(ey + 10.5),
        lit
      });
    });

    const cells = s.pieces.map((p, i) => {
      const L = LINES[p.line];
      const isWet = !!wet[p.c + "," + p.r];
      return {
        x: n(X0 + p.c * CELL), y: n(Y0 + p.r * CELL),
        d: SHAPE[p.type],
        // drawn in base orientation and rotated, so the turn animates
        spin: "transform: translate(" + n(cx(p.c)) + "px, " + n(cy(p.r)) + "px) rotate(" + p.rot * 90 + "deg); transition: transform .16s ease-out",
        ink: isWet ? L.ink : L.dim,
        spark: L.spark,
        flowed: isWet,
        onTap: () => this.rotate(i)
      };
    });

    const legend = cfg.lines.map(li => ({
      fill: done[li] ? LINES[li].ink : "#dedcd6",
      name: LINES[li].name,
      tag: done[li] ? "Connected" : "Open",
      tagColor: done[li] ? "#2f7d3a" : "#b8250e"
    }));

    return {
      hudKicker: "Panel " + ((s.round % 4) + 1) + " of 4",
      stageLabel: cfg.sys,
      legend,
      turnText: s.turns + " / " + s.par + " par",
      turnColor: over > 0 ? "#c2560f" : "#201e1d",
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      toggleMusic: this.toggleMusic,
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleSound: this.toggleSound,

      gridLines, ports, cells,
      allDone: allDone && s.overlay !== "card",

      showHint: !s.overlay && !s.titleCard,
      hintText: allDone ? "Flow restored on every line. Nice work."
        : "Tap a pipe to turn it a quarter turn. Connect each colour from its inlet on the left to its outlet on the right.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: s.round + 1 >= 4 ? "Deck complete · " + cfg.sys : cfg.sys + " · restored",
      cardScore: score + " / 100",
      cardMood: over === 0 ? "Done in par. Clean work."
        : over <= 3 ? "A few turns over par." : "Got there the long way round.",
      cardRows: [
        { name: "Routing", val: 100, pct: 100, color: "#2f7d3a" },
        { name: "Efficiency", val: efficiency, pct: efficiency, color: efficiency >= 75 ? "#2f7d3a" : efficiency >= 45 ? "#b07d00" : "#c2210f" }
      ],
      cardLine: "Solved in " + s.turns + " turns against a par of " + s.par + ".",
      cardCta: s.round + 1 >= 4 ? "Start the deck again" : "Next panel",
      cardAction: this.cardAction
    };
  }
}
