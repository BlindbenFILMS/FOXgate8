
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const D = pts => "M " + pts.map(p => n(p[0]) + " " + n(p[1])).join(" L ");

const HUB = { x: 100, y: 66 };
const PLOT = { x0: 6, y0: 12, x1: 194, y1: 122 };
const SAFE = 9.5;
const LOOKAHEAD = 16;
const ORBIT_R = [28, 37, 46];
const ORBIT_LAPS = 3;
const orbitW = s => s.w || (s.speed / Math.max(1, s.orbitR));
const orbitDir = band => (band === 1 ? -1 : 1);

const BERTHS = [
  { id: "A", label: "BERTH A", fill: "#d9a84e", x: 85, y: 55 },
  { id: "B", label: "BERTH B", fill: "#6e8fb8", x: 115, y: 55 },
  { id: "C", label: "BERTH C", fill: "#6f9d86", x: 115, y: 77 },
  { id: "D", label: "BERTH D", fill: "#d98a9c", x: 85, y: 77 }
];

const HULLS = {
  shuttle: { d: "M 0 -5.4 L 3.8 4.4 L 0 2.6 L -3.8 4.4 Z", tag: "SHTL", speed: 9 },
  freighter: { d: "M -4.6 -5.6 L 4.6 -5.6 L 3.4 5.6 L -3.4 5.6 Z", tag: "FRTR", speed: 5.8 },
  tug: { d: "M 0 -5 L 4.6 0 L 3 5 L -3 5 L -4.6 0 Z", tag: "TUG", speed: 7.5 }
};

// each watch: which berths are live, and the inbound queue
const WATCHES = [
  { name: "Quiet watch", berths: ["A", "B"], ships: [
      { at: 0.4, berth: "A", hull: "shuttle", from: "w" },
      { at: 4.5, berth: "B", hull: "freighter", from: "e" },
      { at: 9, berth: "A", hull: "tug", from: "s" } ] },
  { name: "Morning arrivals", berths: ["A", "B", "C"], ships: [
      { at: 0.4, berth: "C", hull: "shuttle", from: "n" },
      { at: 3.6, berth: "A", hull: "freighter", from: "e" },
      { at: 7, berth: "B", hull: "shuttle", from: "w" },
      { at: 11, berth: "C", hull: "tug", from: "e" } ] },
  { name: "Convoy in", berths: ["A", "B", "C"], ships: [
      { at: 0.4, berth: "B", hull: "freighter", from: "w" },
      { at: 2.8, berth: "A", hull: "shuttle", from: "e" },
      { at: 5.6, berth: "C", hull: "shuttle", from: "n" },
      { at: 8.4, berth: "B", hull: "tug", from: "s" },
      { at: 11.6, berth: "A", hull: "freighter", from: "s" } ] },
  { name: "Full house", berths: ["A", "B", "C", "D"], ships: [
      { at: 0.4, berth: "D", hull: "shuttle", from: "e" },
      { at: 2.6, berth: "B", hull: "shuttle", from: "w" },
      { at: 4.8, berth: "C", hull: "freighter", from: "n" },
      { at: 7.2, berth: "A", hull: "tug", from: "e" },
      { at: 9.8, berth: "D", hull: "freighter", from: "n" },
      { at: 12.4, berth: "B", hull: "shuttle", from: "s" } ] }
];

const ENTRY = {
  w: { x: PLOT.x0 + 2, spread: "y", lo: 30, hi: 100 },
  e: { x: PLOT.x1 - 2, spread: "y", lo: 30, hi: 100 },
  n: { y: PLOT.y0 + 2, spread: "x", lo: 40, hi: 160 },
  s: { y: PLOT.y1 - 2, spread: "x", lo: 40, hi: 160 }
};

function rng(seed) {
  let s = seed + 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spawnPoint(from, rand) {
  const e = ENTRY[from];
  const v = e.lo + rand() * (e.hi - e.lo);
  if (e.spread === "y") return { x: e.x, y: v };
  return { x: v, y: e.y };
}

// walk a path forward by `dist`, returning the position reached
function advanceAlong(pos, path, pi, dist) {
  let x = pos.x, y = pos.y, i = pi, left = dist;
  while (left > 0 && i < path.length) {
    const dx = path[i][0] - x, dy = path[i][1] - y;
    const d = Math.hypot(dx, dy);
    if (d <= left) { x = path[i][0]; y = path[i][1]; left -= d; i++; }
    else { x += (dx / d) * left; y += (dy / d) * left; left = 0; }
  }
  return { x, y, i, done: i >= path.length, left };
}


// bouncy space-age lounge: walking bass, offbeat chord stabs, a gliding theremin lead
const MUSIC = (() => {
  const notes = [];
  // Cmaj7 / Am7 / Fmaj7 / G7, eight beats each
  const sections = [
    { at: 0,  bass: [36, 43, 36, 40], stab: [60, 64, 67, 71] },
    { at: 8,  bass: [33, 40, 33, 36], stab: [57, 60, 64, 67] },
    { at: 16, bass: [29, 36, 29, 33], stab: [53, 57, 60, 64] },
    { at: 24, bass: [31, 38, 31, 35], stab: [55, 59, 62, 65] }
  ];
  sections.forEach(s => {
    s.bass.forEach((m, i) => notes.push({ b: s.at + i * 2, m, d: 1.5, v: "bass" }));
    // stabs land on the offbeats
    [1, 3, 5, 6.5].forEach((off, i) => {
      const chord = [s.stab[i % 4], s.stab[(i + 2) % 4]];
      chord.forEach(m => notes.push({ b: s.at + off, m, d: 0.45, v: "stab" }));
    });
  });
  // the lead, with portamento into some notes
  [[1, 72, 76], [2.5, 76, null], [3.5, 79, 76], [6, 76, null],
   [9, 69, 72], [10.5, 72, null], [11.5, 76, 72], [14, 72, null],
   [17, 77, 81], [18.5, 81, null], [19.5, 84, 81], [22, 81, null],
   [25, 74, 71], [26.5, 71, null], [27.5, 67, null], [30, 71, 74]
  ].forEach(p => notes.push({ b: p[0], m: p[1], g: p[2], d: 1.1, v: "lead" }));
  // shaker
  for (let b = 0; b < 32; b += 0.5) notes.push({ b, m: b % 1 === 0 ? 90 : 96, d: 0.06, v: "tick" });
  // high sparkles
  [7.5, 15.5, 23.5, 31.5].forEach(b => notes.push({ b, m: 96, g: 103, d: 0.3, v: "sparkle" }));
  return { notes, beats: 32, spb: 0.42 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshWatch(0));
  }

  freshWatch(round) {
    const w = WATCHES[round % WATCHES.length];
    const rand = rng(round * 7717 + 41);
    const live = BERTHS.filter(b => w.berths.indexOf(b.id) >= 0);
    const ships = w.ships.map((s, i) => {
      const p = spawnPoint(s.from, rand);
      const toHub = Math.atan2(HUB.y - p.y, HUB.x - p.x) + (rand() - 0.5) * 0.5;
      return {
        id: i + 1, x: p.x, y: p.y, hdg: toHub,
        hull: s.hull, berth: s.berth, speed: HULLS[s.hull].speed,
        at: s.at, state: "waiting", path: [], pi: 0, mark: null,
        mode: "in", band: i % ORBIT_R.length, orbitR: ORBIT_R[i % ORBIT_R.length],
        theta: 0, dir: orbitDir(i % ORBIT_R.length), laps: 0, w: 0
      };
    });
    return {
      round, watch: w, live, ships, t: 0,
      drawing: null, docked: 0, lost: 0, wrong: 0, alerts: 0,
      exampleOn: round % WATCHES.length === 0,
      conflicts: [], hitPairs: {}, waveDone: false, done: false,
      titleCard: [w.name, live.length + " berths · " + w.ships.length + " inbound"],
      cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__dockTarget = this;
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
    if (!window.__dockAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__dockAC = new AC();
      window.addEventListener("pagehide", () => { try { window.__dockAC.close(); } catch (e) {} });
    }
    this.actx = window.__dockAC;
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


  voice(nt, at) {
    const ac = this.actx, g = ac.createGain(), o = ac.createOscillator();
    const dur = nt.d * MUSIC.spb;
    const f0 = midiHz(nt.m);
    let peak = 0.02;
    if (nt.v === "bass") { o.type = "triangle"; peak = 0.05; }
    else if (nt.v === "stab") { o.type = "square"; peak = 0.012; }
    else if (nt.v === "lead") { o.type = "sine"; peak = 0.042; }
    else if (nt.v === "sparkle") { o.type = "sine"; peak = 0.016; }
    else { o.type = "square"; peak = 0.006; }
    o.frequency.setValueAtTime(f0, at);
    if (nt.g) o.frequency.linearRampToValueAtTime(midiHz(nt.g), at + dur * 0.75);
    if (nt.v === "lead") {
      // a little vibrato so the lead sings
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5.4; lg.gain.value = f0 * 0.012;
      lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(at); lfo.stop(at + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + (nt.v === "lead" ? 0.05 : 0.014));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(window.__dockMusicBus);
    o.start(at); o.stop(at + dur + 0.03);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__dockMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__dockMusicBus = bus;
      this.musicStart = ac.currentTime + 0.12;
      this.musicBar = 0;
    }
    const barLen = MUSIC.beats * MUSIC.spb;
    while (this.musicStart + this.musicBar * barLen < ac.currentTime + 0.8) {
      const base = this.musicStart + this.musicBar * barLen;
      MUSIC.notes.forEach(nt => {
        const at = base + nt.b * MUSIC.spb;
        if (at > ac.currentTime - 0.05) this.voice(nt, at);
      });
      this.musicBar++;
    }
  }

  killMusic() {
    const bus = window.__dockMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__dockMusicBus = null;
    this.musicBar = 0;
  }

  musicOn() { return !this.muted() && (this.props.music ?? true) !== false && !this.state.musicOff; }

  toggleMusic = () => {
    this.audio();
    if (this.musicOn()) this.killMusic();
    this.setState(s => ({ musicOff: !s.musicOff }));
  };

  sfx(kind) {
    if (!this.audio()) return;
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    if (kind === "ping") this.tone(1240, 0.09, 0.03, "sine");
    else if (kind === "route") this.tone(520, 0.07, 0.035, "triangle", 760);
    else if (kind === "dock") [0, 7, 12].forEach((s, i) => setTimeout(() => this.tone(hz(74 + s), 0.15, 0.045, "triangle"), i * 60));
    else if (kind === "alarm") { this.tone(240, 0.18, 0.055, "square", 160); setTimeout(() => this.tone(240, 0.18, 0.055, "square", 160), 210); }
    else if (kind === "lost") this.tone(180, 0.22, 0.05, "square", 112);
    else if (kind === "wrong") this.tone(200, 0.2, 0.055, "sawtooth", 130);
    else if (kind === "clear") [0, 4, 7, 12].forEach((s, i) => setTimeout(() => this.tone(hz(72 + s), 0.24, 0.05, "triangle"), i * 100));
  }

  berthAt(x, y) {
    return this.state.live.find(b => Math.abs(x - b.x) < 8 && Math.abs(y - b.y) < 6.6);
  }

  // look ahead along both drawn courses and find where two ships come too close
  predict(ships) {
    const moving = ships.filter(s => s.state === "flying" || s.state === "drifting");
    const out = [];
    const step = 0.35;
    for (let i = 0; i < moving.length; i++) {
      for (let j = i + 1; j < moving.length; j++) {
        const a = moving[i], b = moving[j];
        let best = null;
        for (let t = 0; t <= LOOKAHEAD; t += step) {
          const pa = this.futureAt(a, t), pb = this.futureAt(b, t);
          if (!pa || !pb) continue;
          // while both are still flying the circuit their separation is fixed by design
          if (this.inCircuitAt(a, t) && this.inCircuitAt(b, t)) continue;
          const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
          if (d < SAFE && (!best || d < best.d)) {
            best = { d, t, x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
            if (t < step * 2) break;
          }
        }
        if (best) out.push({ a: a.id, b: b.id, x: best.x, y: best.y, t: best.t });
      }
    }
    // several pairs converging on the same spot is one alert, not five
    const groups = [];
    out.sort((p, q) => p.t - q.t).forEach(c => {
      const g = groups.find(x => Math.hypot(x.x - c.x, x.y - c.y) < 13);
      if (g) { g.ids[c.a] = 1; g.ids[c.b] = 1; return; }
      groups.push({ x: c.x, y: c.y, t: c.t, ids: { [c.a]: 1, [c.b]: 1 } });
    });
    return groups.slice(0, 4);
  }

  // is this ship still inside its holding circuit t seconds from now?
  inCircuitAt(s, t) {
    if (s.state !== "drifting" || s.mode !== "orbit") return false;
    return t <= Math.max(0, (ORBIT_LAPS - s.laps) * 2 * Math.PI / orbitW(s));
  }

  futureAt(s, t) {
    const dist = s.speed * t;
    if (s.state === "flying" && s.path.length) {
      const r = advanceAlong({ x: s.x, y: s.y }, s.path, s.pi, dist);
      if (r.done) {
        // past the end of the course it keeps the last heading
        const last = s.path[s.path.length - 1];
        const prev = s.path.length > 1 ? s.path[s.path.length - 2] : [s.x, s.y];
        const h = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
        return { x: last[0] + Math.cos(h) * r.left, y: last[1] + Math.sin(h) * r.left };
      }
      return { x: r.x, y: r.y };
    }
    if (s.state === "drifting" && s.mode === "orbit") {
      const w = orbitW(s);
      const remain = Math.max(0, (ORBIT_LAPS - s.laps) * 2 * Math.PI / w);
      const th = s.theta + s.dir * w * Math.min(t, remain);
      const px = HUB.x + Math.cos(th) * s.orbitR, py = HUB.y + Math.sin(th) * s.orbitR;
      if (t <= remain) return { x: px, y: py };
      const h = th + s.dir * Math.PI / 2, d = s.speed * (t - remain);
      return { x: px + Math.cos(h) * d, y: py + Math.sin(h) * d };
    }
    return { x: s.x + Math.cos(s.hdg) * dist, y: s.y + Math.sin(s.hdg) * dist };
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const dt = Math.min(0.045, (now - (this.last || now)) / 1000);
    this.last = now;
    const s = this.state;
    if (this.started && window.__dockTarget === this && window.__dockAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__dockMusicBus) this.killMusic();
    }
    if (s.overlay || s.done) return;

    const patch = {};
    if (s.titleCard && now - s.cardAt > 1700) patch.titleCard = null;
    if (s.titleCard) { this.setState(patch); return; }

    const t = s.t + dt;
    patch.t = t;

    let docked = s.docked, lost = s.lost, wrong = s.wrong, alerts = s.alerts;
    const hitPairs = Object.assign({}, s.hitPairs);

    // each lane turns at its slowest occupant's cruise speed: no ship ever
    // orbits faster than it flies, and lane-mates keep a shared angular rate
    const laneSpeed = {};
    s.ships.forEach(q => {
      if (q.state !== "drifting" || q.mode !== "orbit") return;
      laneSpeed[q.orbitR] = laneSpeed[q.orbitR] == null ? q.speed : Math.min(laneSpeed[q.orbitR], q.speed);
    });

    const ships = s.ships.map(sh => {
      const o = Object.assign({}, sh);
      if (o.state === "waiting") {
        if (t >= o.at) { o.state = "drifting"; this.sfx("ping"); }
        return o;
      }
      if (o.state === "docked" || o.state === "gone") return o;

      const dist = o.speed * dt;
      if (o.state === "flying" && o.path.length) {
        const r = advanceAlong({ x: o.x, y: o.y }, o.path, o.pi, dist);
        o.x = r.x; o.y = r.y; o.pi = r.i;
        if (o.path.length > o.pi) {
          o.hdg = Math.atan2(o.path[o.pi][1] - o.y, o.path[o.pi][0] - o.x);
        }
        if (r.done) {
          const end = o.path[o.path.length - 1];
          const b = this.berthAt(end[0], end[1]);
          if (b && b.id === o.berth) {
            o.state = "docked"; o.x = b.x; o.y = b.y; docked++;
            this.sfx("dock");
            return o;
          }
          if (b) {
            o.state = "drifting"; o.path = []; o.pi = 0; o.mark = "wrong"; o.mode = "in";
            wrong++; this.sfx("wrong");
            return o;
          }
          o.state = "drifting"; o.path = []; o.pi = 0; o.mode = "in";
        }
      } else if (o.mode === "orbit") {
        const lane = laneSpeed[o.orbitR];
        const w = Math.min(o.speed, lane == null ? o.speed : lane) / o.orbitR;
        o.w = w;
        o.theta += o.dir * w * dt;
        o.laps += (w * dt) / (2 * Math.PI);
        o.x = HUB.x + Math.cos(o.theta) * o.orbitR;
        o.y = HUB.y + Math.sin(o.theta) * o.orbitR;
        o.hdg = o.theta + o.dir * Math.PI / 2;
        if (o.laps >= ORBIT_LAPS) o.mode = "out";
      } else {
        o.x += Math.cos(o.hdg) * dist;
        o.y += Math.sin(o.hdg) * dist;
        if (o.mode === "in" && Math.hypot(o.x - HUB.x, o.y - HUB.y) <= o.orbitR) {
          // slot into the circuit, stepping out a band if that lane is occupied here
          let r = o.orbitR, band = o.band;
          const th = Math.atan2(o.y - HUB.y, o.x - HUB.x);
          for (let k = 0; k < ORBIT_R.length; k++) {
            const cand = ORBIT_R[(band + k) % ORBIT_R.length];
            const busy = s.ships.some(q => q.id !== o.id && q.state === "drifting" && q.mode === "orbit"
              && q.orbitR === cand && Math.abs(Math.atan2(Math.sin(q.theta - th), Math.cos(q.theta - th))) < 0.6);
            if (!busy) { r = cand; band = (band + k) % ORBIT_R.length; break; }
          }
          o.orbitR = r; o.band = band; o.dir = orbitDir(band);
          o.theta = th; o.laps = 0; o.mode = "orbit";
          o.w = Math.min(o.speed, laneSpeed[r] == null ? o.speed : laneSpeed[r]) / r;
          o.x = HUB.x + Math.cos(th) * r;
          o.y = HUB.y + Math.sin(th) * r;
          o.hdg = th + o.dir * Math.PI / 2;
        }
      }

      if (o.x < PLOT.x0 - 8 || o.x > PLOT.x1 + 8 || o.y < PLOT.y0 - 8 || o.y > PLOT.y1 + 8) {
        o.state = "gone"; lost++; this.sfx("lost");
      }
      return o;
    });

    // an actual loss of separation, not just a predicted one
    for (let i = 0; i < ships.length; i++) {
      for (let j = i + 1; j < ships.length; j++) {
        const a = ships[i], b = ships[j];
        if (!["flying", "drifting"].includes(a.state) || !["flying", "drifting"].includes(b.state)) continue;
        if (a.state === "drifting" && a.mode === "orbit" && b.state === "drifting" && b.mode === "orbit") continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) < SAFE * 0.62) {
          const key = a.id + "-" + b.id;
          if (!hitPairs[key]) { hitPairs[key] = 1; alerts++; this.sfx("alarm"); }
        }
      }
    }

    patch.ships = ships;
    patch.docked = docked; patch.lost = lost; patch.wrong = wrong;
    patch.alerts = alerts; patch.hitPairs = hitPairs;

    this.predictAcc = (this.predictAcc || 0) + dt;
    if (this.predictAcc > 0.18) {
      this.predictAcc = 0;
      patch.conflicts = this.predict(ships);
    }

    const allSpawned = ships.every(x => x.state !== "waiting");
    const allSettled = ships.every(x => x.state === "docked" || x.state === "gone");
    if (allSpawned && allSettled) {
      patch.waveDone = true;
      patch.done = true;
      this.sfx("clear");
      setTimeout(() => this.setState({ overlay: "card" }), 1200);
    }

    this.setState(patch);
  };

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
    if (s.overlay || s.done || s.titleCard) return;
    this.audio();
    const p = this.local(e);
    let pick = null, best = 11;
    s.ships.forEach(sh => {
      if (sh.state !== "drifting" && sh.state !== "flying") return;
      const d = Math.hypot(p.x - sh.x, p.y - sh.y);
      if (d < best) { best = d; pick = sh; }
    });
    if (!pick) return;
    this.sfx("route");
    this.setState({ exampleOn: false, drawing: { id: pick.id, pts: [[pick.x, pick.y]] } });
  };

  onMove = e => {
    const s = this.state;
    if (s.overlay || !s.drawing) return;
    const p = this.local(e);
    const pts = s.drawing.pts;
    const last = pts[pts.length - 1];
    if (Math.hypot(p.x - last[0], p.y - last[1]) < 3.2) return;
    const x = clamp(p.x, PLOT.x0, PLOT.x1), y = clamp(p.y, PLOT.y0, PLOT.y1);
    this.setState({ drawing: { id: s.drawing.id, pts: pts.concat([[x, y]]) } });
  };

  onUp = () => {
    const s = this.state;
    if (s.overlay || !s.drawing) return;
    const d = s.drawing;
    if (d.pts.length < 2) { this.setState({ drawing: null }); return; }
    // snap a course that finishes near a berth onto the pad
    const end = d.pts[d.pts.length - 1];
    const b = this.state.live.find(x => Math.hypot(end[0] - x.x, end[1] - x.y) < 11);
    const pts = b ? d.pts.slice(0, -1).concat([[b.x, b.y]]) : d.pts;
    this.setState(st => ({
      drawing: null,
      ships: st.ships.map(sh => sh.id === d.id
        ? Object.assign({}, sh, { state: "flying", path: pts.slice(1), pi: 0, mark: null })
        : sh)
    }));
  };

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(this.freshWatch(s.round + 1),
      { overlay: null, muted: s.muted, musicOff: s.musicOff }));
  };

  toggleSound = () => {
    if (!this.state.muted) this.killMusic();
    this.setState(s => ({ muted: !s.muted }));
  };

  renderVals() {
    const s = this.state, w = s.watch;
    const tot = s.ships.length;
    const arrivals = Math.round((s.docked / tot) * 100);
    const safety = clamp(100 - s.alerts * 22 - s.wrong * 9, 0, 100);
    const score = Math.round(arrivals * 0.6 + safety * 0.4);

    const berthOf = id => BERTHS.find(b => b.id === id);
    const grid = [];
    for (let x = 20; x < 200; x += 20) grid.push({ d: "M " + x + " 0 L " + x + " 140" });
    for (let y = 14; y < 140; y += 18) grid.push({ d: "M 0 " + y + " L 200 " + y });

    const berths = s.live.map(b => {
      const taken = s.ships.some(sh => sh.state === "docked" && sh.berth === b.id);
      const ang = Math.atan2(b.y - HUB.y, b.x - HUB.x);
      const armX = HUB.x + Math.cos(ang) * 6.4, armY = HUB.y + Math.sin(ang) * 6.4;
      const vertical = Math.abs(Math.cos(ang)) < 0.5;
      return {
        arm: "M " + n(armX) + " " + n(armY) + " L " + n(b.x) + " " + n(b.y),
        t: "translate(" + b.x + " " + b.y + ")",
        clamp: vertical ? "M -6 -2.2 L -3.8 -2.2 M 6 -2.2 L 3.8 -2.2 M -6 2.2 L -3.8 2.2 M 6 2.2 L 3.8 2.2"
          : "M -3 -4.6 L -3 -2.6 M 3 -4.6 L 3 -2.6 M -3 4.6 L -3 2.6 M 3 4.6 L 3 2.6",
        fill: b.fill, taken, label: b.id,
        lx: n(b.x - 12), ly: n(b.y > HUB.y ? b.y + 5.6 : b.y - 13.4)
      };
    });

    const routes = s.ships.filter(sh => sh.state === "flying" && sh.path.length)
      .map(sh => {
        const remain = [[sh.x, sh.y]].concat(sh.path.slice(sh.pi));
        const end = sh.path[sh.path.length - 1];
        return {
          d: D(remain),
          stroke: berthOf(sh.berth).fill,
          o: 0.85,
          hasEnd: true, ex: n(end[0]), ey: n(end[1])
        };
      });

    const ships = s.ships.filter(sh => sh.state !== "waiting" && sh.state !== "gone")
      .map(sh => {
        const b = berthOf(sh.berth);
        const inConflict = s.conflicts.some(c => c.ids && c.ids[sh.id]);
        return {
          t: "translate(" + n(sh.x) + " " + n(sh.y) + ")",
          rot: "rotate(" + n((sh.hdg * 180) / Math.PI + 90) + ")",
          hull: HULLS[sh.hull].d,
          fill: sh.state === "docked" ? "#9aa4a8" : b.fill,
          showRing: sh.state !== "docked",
          ring: n(SAFE * 0.5),
          ringStroke: inConflict ? "#ec3013" : b.fill,
          ringO: inConflict ? 0.9 : 0.3,
          unrouted: sh.state === "drifting",
          tag: sh.state === "drifting" && sh.mode === "orbit"
            ? sh.berth + " · " + Math.min(ORBIT_LAPS, Math.floor(sh.laps) + 1) + "/" + ORBIT_LAPS
            : sh.berth + " · " + HULLS[sh.hull].tag,
          ly: n(7.4)
        };
      });

    const conflicts = s.conflicts.map(c => ({
      t: "translate(" + n(clamp(c.x, 12, 188)) + " " + n(clamp(c.y, 18, 112)) + ")",
      eta: c.t < 0.6 ? "NOW" : Math.ceil(c.t) + "s"
    }));

    // a bowed demo course on the first drifting ship, shown until the player drags
    let ex = null;
    if (s.exampleOn && !s.drawing) {
      const sh = s.ships.find(x => x.state === "drifting");
      const b = sh ? berthOf(sh.berth) : null;
      if (sh && b) {
        const dx = b.x - sh.x, dy = b.y - sh.y, len = Math.hypot(dx, dy) || 1;
        const mx = (sh.x + b.x) / 2, my = (sh.y + b.y) / 2;
        const p1 = { x: mx + (-dy / len) * 24, y: my + (dx / len) * 24 };
        const p2 = { x: mx + (dy / len) * 24, y: my + (-dx / len) * 24 };
        const away = Math.hypot(p1.x - HUB.x, p1.y - HUB.y) > Math.hypot(p2.x - HUB.x, p2.y - HUB.y) ? p1 : p2;
        const ox = away.x - mx, oy = away.y - my, ol = Math.hypot(ox, oy) || 1;
        // a hand partway along the curve, clear of the ship glyph
        const u = 0.42, iu = 1 - u;
        const hx = iu * iu * sh.x + 2 * iu * u * away.x + u * u * b.x;
        const hy = iu * iu * sh.y + 2 * iu * u * away.y + u * u * b.y;
        ex = {
          hT: "translate(" + n(hx) + " " + n(hy) + ") scale(0.42)",
          d: "M " + n(sh.x) + " " + n(sh.y) + " Q " + n(away.x) + " " + n(away.y) + " " + n(b.x) + " " + n(b.y),
          lx: n(clamp(away.x + (ox / ol) * 10 - 30, 8, 132)),
          ly: n(clamp(away.y + (oy / ol) * 10 - 4, 16, 110))
        };
      }
    }

    const drawing = !!s.drawing && s.drawing.pts.length > 1;
    const drawShip = s.drawing ? s.ships.find(x => x.id === s.drawing.id) : null;

    const legend = s.live.map(b => {
      const mine = s.ships.filter(sh => sh.berth === b.id);
      const din = mine.filter(sh => sh.state === "docked").length;
      return {
        fill: b.fill, name: "BERTH " + b.id,
        tag: din + "/" + mine.length + " in",
        tagColor: din === mine.length ? "#2f7d3a" : "#6b6864"
      };
    });

    const notes = [];
    if (s.lost) notes.push({ text: s.lost + " ship" + (s.lost > 1 ? "s" : "") + " drifted off the plot unrouted." });
    if (s.alerts) notes.push({ text: s.alerts + " loss of separation — two ships inside the safety ring." });
    if (s.wrong) notes.push({ text: s.wrong + " course ended at the wrong berth and was turned away." });
    if (!s.lost && !s.alerts && !s.wrong) notes.push({ text: "Every ship berthed, separation held throughout." });

    return {
      hudKicker: "Watch " + ((s.round % 4) + 1) + " of 4",
      stageLabel: w.name,
      legend,
      dockedText: s.docked + "/" + tot,
      alertText: s.alerts + "",
      alertColor: s.alerts > 0 ? "#c2210f" : "#6b6864",
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleSound: this.toggleSound,
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      toggleMusic: this.toggleMusic,
      onDown: this.onDown, onMove: this.onMove, onUp: this.onUp,

      grid, berths, routes, ships, conflicts,
      showExample: !!ex, exampleD: ex ? ex.d : "", exLx: ex ? ex.lx : 0, exLy: ex ? ex.ly : 0,
      exHandT: ex ? ex.hT : "translate(0 0)",
      drawing,
      drawD: drawing ? D(s.drawing.pts) : "",
      drawStroke: drawShip ? berthOf(drawShip.berth).fill : "#8fd6bf",
      waveDone: s.waveDone,

      showHint: !s.overlay && !s.titleCard,
      hintText: s.waveDone ? "Traffic clear. Every inbound resolved."
        : "Ships hold in a circuit for three laps before they leave. Drag from one to draw its course, finishing on the berth in its own colour.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: s.round + 1 >= 4 ? "Watch over · " + w.name : w.name + " · relieved",
      cardScore: score + " / 100",
      cardMood: score >= 92 ? "A clean watch." : score >= 78 ? "Well handled."
        : score >= 60 ? "Traffic got away from you once or twice." : "OPS will want a word.",
      cardRows: [
        { name: "Arrivals", val: arrivals, pct: arrivals, color: arrivals >= 75 ? "#2f7d3a" : arrivals >= 45 ? "#b07d00" : "#c2210f" },
        { name: "Separation", val: safety, pct: safety, color: safety >= 75 ? "#2f7d3a" : safety >= 45 ? "#b07d00" : "#c2210f" }
      ],
      cardNotes: notes, hasNotes: notes.length > 0,
      cardCta: s.round + 1 >= 4 ? "Take the watch again" : "Next watch",
      cardAction: this.cardAction
    };
  }
}
