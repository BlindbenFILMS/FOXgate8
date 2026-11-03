
const n = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;

const SEGS = 6;
const STEP = 360 / SEGS;
/* CHIP is no longer a price — every chip is worth its own face value now —
   but the constant is left standing because the wheel's own art and the
   intro copy are written around a ten-credit table. PAYS is the number that
   had to move: at six segments a fair return is six times the stake, and
   three was generous for a free chip and a fifty per cent edge for a bought
   one. Five leaves the house 2.8%, DABA doubling included. */
const CHIP = 10;
/* PAYS WAS 5, WHICH WAS BREAK-EVEN ON ITS OWN. Every return is now multiplied
   by the meter as well, and a random stop averages 2.21 — so leaving PAYS at 5
   would return better than twice the stake and the wheel would be a cash
   machine. Two is the number that makes the METER the thing being played:

       RTP = PAYS x E[mult] x 7/36

       careless (random stop, E 2.21)   2 x 2.21 x 7/36 = 86%
       decent   (mostly x2 and x3, 2.8) 2 x 2.80 x 7/36 = 109%
       sharp    (x3 with x5s in it, 3.4) 2 x 3.40 x 7/36 = 132%

   Which is the shape this wants: sloppy loses, good play beats the house, and
   the difference between those two is entirely in your thumb. */
const PAYS = 2;
/* The rack. Five denominations, and the spread matters more than the values:
   1 is for finding out, 50 is for the last spin when you are behind, and 5,
   10 and 25 are the three you will actually live in. */
const CHIPS = [1, 5, 10, 25, 50];

/* ---- THE X METER ------------------------------------------------------
   Seven bands across the track, in Ben's order, and the shape of them IS the
   game: x5 is worth two and a half times its neighbours and is less than half
   their width, and it is walled in on both sides by the x1 — the one band
   that gives you nothing. You cannot drift onto the big one. You have to go
   through the punishment to reach it.

   The widths add to 100 so a band's width is also its chance at a random
   stop, which makes the expected multiplier readable straight off the table:

       (15.5 x (2+3+1+1+3+2) + 7 x 5) / 100 = 2.21

   That number is why PAYS comes down to 2 below. */
const METER = [
  { m: 2, w: 15.5, fill: "#5a7fa8", ink: "#eaf2fa" },
  { m: 3, w: 15.5, fill: "#2f7d3a", ink: "#e9f5ec" },
  { m: 1, w: 15.5, fill: "#6b3330", ink: "#e8bcb4" },
  { m: 5, w: 7.0,  fill: "#f0c040", ink: "#231a08" },
  { m: 1, w: 15.5, fill: "#6b3330", ink: "#e8bcb4" },
  { m: 3, w: 15.5, fill: "#2f7d3a", ink: "#e9f5ec" },
  { m: 2, w: 15.5, fill: "#5a7fa8", ink: "#eaf2fa" }
];
const METER_X0 = 121, METER_W = 70;     // the track, in the panel's own units
/* A FULL ROUND TRIP IN 1.6 SECONDS. The x3 bands are 15.5% of the track, so
   the marker is inside one for about 124 ms a pass — hittable with a little
   practice. The x5 is 7%, which is 56 ms, and that is meant to be hard. */
const METER_MS = 1600;
/* THE INDEX, NOT THE VALUE. Two of the seven bands say x1 and two say x3 and
   two say x2 — so highlighting "the band that matches the multiplier" lights
   up both of them, and the player cannot tell which one they actually hit.
   The index is the answer to "where did it stop"; the value is only what that
   place is worth. */
function meterIdx(p) {
  let acc = 0;
  const at = clamp(p, 0, 1) * 100;
  for (let i = 0; i < METER.length; i++) { acc += METER[i].w; if (at <= acc) return i; }
  return METER.length - 1;
}
function meterMult(p) { return METER[meterIdx(p)].m; }
/* THE MARKER'S POSITION IS DERIVED FROM THE CLOCK, not stepped frame by
   frame. A marker that advances by a delta each frame drifts at a different
   speed on a slow machine, which would make the whole challenge a function of
   the player's hardware. */
function meterPos(elapsed) {
  const t = (elapsed % METER_MS) / METER_MS;
  return t < 0.5 ? t * 2 : 2 - t * 2;
}

// the outer ring is read by colour, the inner by its mark as well
const OUTER = [
  { fill: "#d9a84e", name: "Gold" },
  { fill: "#d9628a", name: "Rose" },
  { fill: "#2fbfae", name: "Teal" },
  { fill: "#8a6ad9", name: "Violet" },
  { fill: "#6f9d4a", name: "Green" },
  { fill: "#4f8fd6", name: "Blue" }
];
const MARKS = [
  "M -4.4 0 L 0 -4.4 L 4.4 0 L 0 4.4 Z",
  "M -4.2 -4.2 L 4.2 -4.2 L 4.2 4.2 L -4.2 4.2 Z",
  "M 0 -4.8 L 4.4 3 L -4.4 3 Z",
  "M -4.8 0 a 4.8 4.8 0 1 0 9.6 0 a 4.8 4.8 0 1 0 -9.6 0 Z M -1.9 0 a 1.9 1.9 0 1 1 3.8 0 a 1.9 1.9 0 1 1 -3.8 0 Z",
  "M 0 -5 L 1.5 -1.5 L 5 -1.5 L 2 1 L 3.2 4.8 L 0 2.4 L -3.2 4.8 L -2 1 L -5 -1.5 L -1.5 -1.5 Z",
  "M -5 -1.7 L -1.7 -1.7 L -1.7 -5 L 1.7 -5 L 1.7 -1.7 L 5 -1.7 L 5 1.7 L 1.7 1.7 L 1.7 5 L -1.7 5 L -1.7 1.7 L -5 1.7 Z"
];
const INNER = [
  { fill: "#e8913a", name: "Amber" },
  { fill: "#2fd6c0", name: "Aqua" },
  { fill: "#cfc63f", name: "Citron" },
  { fill: "#b02334", name: "Crimson" },
  { fill: "#5a3fa0", name: "Indigo" },
  { fill: "#dfe7ec", name: "Pearl" }
];

/* THE TARGET IS NOW A NET, NOT A TOTAL. Free chips could only ever add, so a
   target of 100 meant "collect 100". A staked chip can lose, so the same
   number now means "finish 100 UP on the night" — which is a harder thing to
   ask and a much better one, because it can go the other way while you watch.
   `hand` is gone with the free chips: a spin is one bet on each ring. */
const TABLES = [
  { name: "The quiet table", target: 60, spins: 8 },
  { name: "Evening crowd", target: 110, spins: 9 },
  { name: "The high table", target: 180, spins: 10 },
  { name: "Quirk's own table", target: 260, spins: 11 }
];

// an annular sector, drawn from the top and going clockwise
function sector(r0, r1, i) {
  const a0 = (i * STEP - 90 - STEP / 2) * Math.PI / 180;
  const a1 = ((i + 1) * STEP - 90 - STEP / 2) * Math.PI / 180;
  const p = (r, a) => n(Math.cos(a) * r) + " " + n(Math.sin(a) * r);
  return "M " + p(r1, a0) + " A " + r1 + " " + r1 + " 0 0 1 " + p(r1, a1)
    + " L " + p(r0, a1) + " A " + r0 + " " + r0 + " 0 0 0 " + p(r0, a0) + " Z";
}
function midAngle(i) { return i * STEP - 90; }
function polar(r, i) {
  const a = midAngle(i) * Math.PI / 180;
  return { x: n(Math.cos(a) * r), y: n(Math.sin(a) * r) };
}

const MUSIC = (() => {
  const notes = [];
  // a lounge vamp with a little casino sparkle
  const bass = [45, 45, 52, 52, 43, 43, 50, 50];
  bass.forEach((m, i) => notes.push({ b: i * 4, m: m - 12, d: 3.4, v: "bass" }));
  [[1, 76], [2.5, 79], [4, 81], [6.5, 79], [9, 76], [11, 72], [13, 74],
   [17, 79], [18.5, 83], [21, 84], [23.5, 81], [25, 79], [27.5, 76], [30, 72]
  ].forEach(p => notes.push({ b: p[0], m: p[1], d: 1.6, v: "vibe" }));
  for (let b = 0; b < 32; b += 2) notes.push({ b: b + 1, m: 93, d: 0.08, v: "tick" });
  return { notes, beats: 32, spb: 0.42 };
})();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

/* ======================================================== THE PURSE =======
   The chips are bought with the STATION'S credits — the same purse that pays
   GAROK for a coat — and this game cannot see them. It runs in an iframe on a
   blob: URL with its own opaque origin, which is exactly the isolation that
   lets it be embedded without its stylesheet touching the station's; the
   price of that is that `window.game` is not a thing in here.

   So the two talk by postMessage, and the STATION IS THE ONE THAT COUNTS.
   This side never decides a balance: it asks for a stake, it asks to be paid,
   and it displays whatever number comes back. A message that goes missing can
   then cost a spin but can never mint a credit, which is the right way round
   for the failure to fall.

   AND IT STILL WORKS ON ITS OWN. Opened as a file with no station around it,
   `parent === window`, nothing answers, and the purse falls back to a local
   thousand — so the uploaded page is still a working page by itself, which is
   how it was tested and how it should stay. */
const PURSE = (() => {
  const standalone = (typeof window === 'undefined') || window.parent === window;
  let credits = 1000;
  let onChange = null;
  let seq = 0;
  const pending = {};
  if (!standalone) {
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.dsfPurse !== 'is' || typeof d.credits !== 'number') return;
      credits = Math.max(0, Math.round(d.credits));
      const cb = pending[d.id]; delete pending[d.id];
      if (cb) cb(credits, !!d.ok);
      if (onChange) onChange(credits);
    });
    try { window.parent.postMessage({ dsfPurse: 'get' }, '*'); } catch (err) {}
  }
  const ask = (op, amount, cb) => {
    if (standalone) {
      /* The same arithmetic the station would do, so the standalone page
         behaves identically rather than merely not crashing. */
      if (op === 'stake') {
        if (credits < amount) { if (cb) cb(credits, false); return; }
        credits -= amount;
      } else credits += amount;
      if (cb) cb(credits, true);
      if (onChange) onChange(credits);
      return;
    }
    const id = ++seq;
    if (cb) pending[id] = cb;
    try { window.parent.postMessage({ dsfPurse: op, amount, id }, '*'); }
    catch (err) { if (cb) { delete pending[id]; cb(credits, false); } }
  };
  return {
    get: () => credits,
    stake: (amount, cb) => ask('stake', amount, cb),
    pay: (amount, cb) => ask('pay', amount, cb),
    watch: (fn) => { onChange = fn; },
  };
})();

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = Object.assign({ overlay: "intro", muted: false, musicOff: false }, this.freshTable(0));
  }

  freshTable(round) {
    const cfg = TABLES[round % TABLES.length];
    return {
      round, cfg,
      bank: 0, spinsLeft: cfg.spins,
      outerBets: [0, 0, 0, 0, 0, 0], innerBets: [0, 0, 0, 0, 0, 0],
      placed: 0,
      /* THE BETS STAY AS SIX-LONG ARRAYS even though only one of the six can
         be non-zero now. Keeping the shape means the wheel's own chip markers
         and settle()'s lookup of the winning segment go on working untouched
         — the change is that a segment now holds a STAKE rather than a count
         of chips, and the number drawn on it is already the array value. */
      chip: 5,              // which denomination is in your paw
      drag: null,           // { amt, x, y } while one is being carried
      credits: PURSE.get(),
      staked: 0,            // what is on the cloth this spin, for the report
      lastNet: null,        // + or - , for the note above the chips
      outerRot: 0, innerRot: 0,
      spinning: false, spinAt: 0, from: [0, 0], to: [0, 0],
      result: null, dabaAt: 0, best: 0, dabas: 0, hits: 0,
      done: false,
      titleCard: [cfg.name, "Reach " + cfg.target + " in " + cfg.spins + " spins"],
      cardAt: Date.now()
    };
  }

  componentDidMount() {
    window.__dabaTarget = this;
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
    if (!window.__dabaAC) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__dabaAC = new AC();
      const b = window.__dabaAC.createBuffer(1, window.__dabaAC.sampleRate * 1.2, window.__dabaAC.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      window.__dabaNoise = b;
      window.addEventListener("pagehide", () => { try { window.__dabaAC.close(); } catch (e) {} });
    }
    this.actx = window.__dabaAC;
    this.noise = window.__dabaNoise;
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
    if (kind === "chip") this.tone(1100, 0.05, 0.035, "triangle", 1500);
    else if (kind === "clear") this.tone(420, 0.07, 0.03, "sine", 260);
    else if (kind === "tick") this.tone(1800, 0.02, 0.02, "square");
    else if (kind === "spin") this.burst({ f0: 600, f1: 2200, dur: 0.5, gain: 0.035, type: "bandpass", q: 0.8 });
    else if (kind === "stop") this.tone(520, 0.1, 0.045, "triangle", 320);
    else if (kind === "win") [0, 4, 7].forEach((s, i) => setTimeout(() => this.tone(midiHz(76 + s), 0.16, 0.05, "triangle"), i * 60));
    else if (kind === "miss") this.tone(190, 0.22, 0.05, "square", 120);
    else if (kind === "daba") [0, 4, 7, 12, 16, 19].forEach((s, i) => setTimeout(() => this.tone(midiHz(72 + s), 0.24, 0.055, "triangle"), i * 90));
    else if (kind === "close") [0, 5, 9, 12].forEach((s, i) => setTimeout(() => this.tone(midiHz(72 + s), 0.26, 0.05, "triangle"), i * 110));
  }

  voice(nt, at) {
    const ac = this.actx, g = ac.createGain(), o = ac.createOscillator();
    const dur = nt.d * MUSIC.spb;
    let peak = 0.02;
    if (nt.v === "bass") { o.type = "triangle"; peak = 0.044; }
    else if (nt.v === "vibe") { o.type = "sine"; peak = 0.034; }
    else { o.type = "square"; peak = 0.008; }
    o.frequency.setValueAtTime(midiHz(nt.m), at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(window.__dabaMusicBus);
    o.start(at); o.stop(at + dur + 0.03);
  }

  scheduleMusic() {
    const ac = this.actx;
    if (!ac || !this.musicOn()) return;
    if (!window.__dabaMusicBus) {
      const bus = ac.createGain();
      bus.gain.value = 0.5;
      bus.connect(ac.destination);
      window.__dabaMusicBus = bus;
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
    const bus = window.__dabaMusicBus;
    if (bus) { try { bus.gain.value = 0; bus.disconnect(); } catch (e) {} }
    window.__dabaMusicBus = null;
    this.musicBar = 0;
  }

  /* ---- PUTTING A CHIP DOWN --------------------------------------------
     One bet on each ring, in that order, and the money is gone the moment it
     lands. The stake is asked of the station BEFORE the board changes and the
     board only changes if the station says yes — the other way round and a
     refused stake would leave a chip drawn on a segment that nobody had paid
     for. */
  place = (ring, i) => {
    const s = this.state;
    if (s.spinning || s.result) return;
    const done = ring === "outer" ? s.outerBets.some(x => x > 0) : s.innerBets.some(x => x > 0);
    if (done) { this.sfx("clear"); return; }
    const amt = s.chip;
    PURSE.stake(amt, (credits, ok) => {
      if (!ok) { this.sfx("miss"); this.setState({ credits }); this.flash("shortAt"); return; }
      const key = ring === "outer" ? "outerBets" : "innerBets";
      const arr = this.state[key].slice();
      arr[i] = amt;
      this.sfx("chip");
      this.setState({ [key]: arr, placed: this.state.placed + 1,
                      staked: this.state.staked + amt, credits,
                      result: null, lastNet: null });
    });
  };

  /* ---- A FLASH THAT PUTS ITSELF OUT ----------------------------------
     The note's two telling-off messages — wrong ring, not enough credits —
     are written to fade after a second and a half, and the note works that
     out from Date.now() at render time. WHICH NEVER COMES ROUND AGAIN. The
     wheel re-renders on every frame while it is spinning and not once while
     it is sitting still, so a message posted at rest would have stayed on
     that strip until the player did something else — and "the game is still
     telling me off for a mistake I made a minute ago" is exactly the sort of
     wrong that gets lived with rather than reported.

     So a flash schedules its own clear. Timing expressed in state that only
     something else can refresh is a bug waiting for a quiet moment. */
  flash = (key) => {
    this.setState({ [key]: Date.now() });
    clearTimeout(this._flashT);
    this._flashT = setTimeout(() => this.setState({ wrongAt: 0, shortAt: 0 }), 1600);
  };

  pickChip = (amt) => {
    if (this.state.spinning) return;
    this.sfx("chip");
    this.setState({ chip: amt });
  };

  /* ---- DRAGGING IT THERE ----------------------------------------------
     The chip is picked up in the rack and let go over a ring, and the ring is
     part of an SVG that is scaled to whatever the window happens to be. So
     the drop has to be converted out of screen pixels and into the wheel's own
     units before anything can be worked out about it, and `getScreenCTM()` is
     the one function that knows that mapping — it is the SVG's own answer to
     "where is this point really".

     The move and the release are listened for on the WINDOW, not on the ring.
     A drag that has to stay inside the element it started over is not a drag,
     it is a very fussy click: the pointer leaves the rack immediately and the
     whole gesture happens somewhere else. */
  svgPoint = (ev) => {
    const svg = this.dragSvg;
    if (!svg || !svg.getScreenCTM) return null;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const inv = m.inverse();
    const p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    const q = p.matrixTransform(inv);
    return { x: q.x, y: q.y };
  };

  /* WHERE THE DROP LANDED. The wheel is centred at (62,70) in the viewBox;
     the outer ring runs from r=31 to r=49 and the inner from r=13 to r=30,
     and each is turned by its own rotation. Un-turn the angle, and the
     segment is whichever sixth of the circle it falls in — measured from the
     TOP, because sector() draws segment 0 centred on -90 degrees. */
  ringAt = (pt) => {
    if (!pt) return null;
    const s = this.state;
    const dx = pt.x - 62, dy = pt.y - 70;
    const rr = Math.sqrt(dx * dx + dy * dy);
    const ring = (rr >= 30.5 && rr <= 49.5) ? "outer" : (rr >= 12.5 && rr <= 30.5) ? "inner" : null;
    if (!ring) return null;
    const rot = ring === "outer" ? s.outerRot : s.innerRot;
    let a = Math.atan2(dy, dx) * 180 / Math.PI - rot + 90 + STEP / 2;
    a = ((a % 360) + 360) % 360;
    return { ring, i: Math.floor(a / STEP) % SEGS };
  };

  onChipDown = (amt) => (ev) => {
    const s = this.state;
    if (s.spinning || s.result) return;
    if (ev && ev.preventDefault) ev.preventDefault();
    this.dragSvg = document.querySelector("svg[data-daba-wheel]") ||
                   document.querySelectorAll("svg")[1] || document.querySelector("svg");
    this.setState({ chip: amt, drag: { amt, x: 62, y: 70 } }, () => {
      const pt = this.svgPoint(ev);
      if (pt) this.setState({ drag: { amt, x: pt.x, y: pt.y } });
    });
    const move = (e) => {
      const p = this.svgPoint(e);
      if (p) this.setState({ drag: { amt, x: p.x, y: p.y } });
    };
    const up = (e) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const hit = this.ringAt(this.svgPoint(e));
      this.setState({ drag: null });
      if (!hit) { this.sfx("miss"); return; }
      /* THE RING YOU ARE BEING ASKED FOR, and no other. Dropping an outer
         chip on the inner ring is not a mistake worth punishing with a
         silent no-op, so it says so in the note. */
      const want = this.state.outerBets.some(x => x > 0) ? "inner" : "outer";
      if (hit.ring !== want) { this.sfx("miss"); this.flash("wrongAt"); return; }
      this.place(hit.ring, hit.i);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /* TAP IS A DRAG WITH NO DISTANCE. Every pointer that can drag can also
     tap, and a player who taps a chip and then taps the ring has said the
     same thing — so the rings take a click as well, and the chip in hand is
     whichever one was last touched. */
  onRingTap = (ring, i) => () => {
    const want = this.state.outerBets.some(x => x > 0) ? "inner" : "outer";
    if (ring !== want) { this.sfx("miss"); this.flash("wrongAt"); return; }
    this.place(ring, i);
  };

  clearBets = () => {
    const s = this.state;
    if (s.spinning || s.placed === 0) return;
    /* AND THE MONEY COMES BACK. A clear that kept the stake would be a
       charge for changing your mind. */
    const back = s.outerBets.reduce((a, b) => a + b, 0) + s.innerBets.reduce((a, b) => a + b, 0);
    this.sfx("clear");
    PURSE.pay(back, (credits) => {
      this.setState({ outerBets: [0, 0, 0, 0, 0, 0], innerBets: [0, 0, 0, 0, 0, 0],
                      placed: 0, staked: 0, credits });
    });
  };

  onSpin = () => {
    const s = this.state;
    /* ONE BUTTON, THREE JOBS, and this line is the whole of the second one.
       While the wheels are running free the button says STOP WHEEL, and the
       guard below — which exists to stop a second SPIN landing on a spin
       already in flight — would have swallowed the press. The dispatch has to
       come before the guard, not after it. */
    if (s.spinPhase === "free") { this.stopWheel(false); return; }
    if (s.overlay || s.done || s.spinning) return;
    this.audio();
    if (s.result) { this.sfx("clear"); this.setState({ result: null, dabaAt: 0 }); return; }
    if (s.placed === 0) { this.sfx("miss"); return; }

    const oi = Math.floor(Math.random() * SEGS);
    const ii = Math.floor(Math.random() * SEGS);
    // land the chosen segment's middle under the pointer at the top
    // segment i sits under the pointer when the ring's rotation is -i*STEP (mod 360)
    const oDelta = ((((-oi * STEP) - s.outerRot) % 360) + 360) % 360;
    const iDelta = (((s.innerRot + ii * STEP) % 360) + 360) % 360;
    const oTarget = s.outerRot + 360 * 3 + oDelta;
    const iTarget = s.innerRot - 360 * 4 - iDelta;

    this.sfx("spin");
    /* NOT DECIDED YET. The uploaded game picked the landing segments here,
       three seconds before anybody saw them; the wheels now run free until the
       player stops them, so the landing is chosen at the STOP. Nothing is
       fairer or less fair about it — the outcome is random either way — but a
       result that exists before the press makes the press a formality, and
       this game is now about the press. */
    this.setState({
      spinning: true, spinPhase: "free", spinAt: Date.now(),
      freeFrom: [s.outerRot, s.innerRot],
      mult: null, meterP: 0,
      result: null
    });
  };

  /* ---- STOPPING IT ----------------------------------------------------
     One press does two things and only one of them is yours. The wheels take
     the segment they are given; the METER freezes exactly where your thumb
     caught it, and that is the multiplier on whatever the wheels pay. */
  stopWheel = (auto) => {
    const s = this.state;
    if (!s.spinning || s.spinPhase !== "free") return;
    const oi = Math.floor(Math.random() * SEGS);
    const ii = Math.floor(Math.random() * SEGS);
    const oDelta = ((((-oi * STEP) - s.outerRot) % 360) + 360) % 360;
    const iDelta = (((s.innerRot + ii * STEP) % 360) + 360) % 360;
    const mIdx = meterIdx(s.meterP);
    const mult = METER[mIdx].m;
    this.spinResult = { oi, ii };
    this.sfx(mult >= 5 ? "daba" : mult > 1 ? "chip" : "miss");
    this.setState({
      spinPhase: "brake", spinAt: Date.now(),
      from: [s.outerRot, s.innerRot],
      /* WHOLE TURNS, AND THIS IS NOT A DETAIL. oDelta is the angle that puts
         the winning tile dead under the pointer, so whatever is added on top
         of it to make the brake feel like a brake has to be a multiple of a
         full circle or it lands somewhere else entirely. 1.4 turns is 144
         degrees of somewhere else — not even a whole tile — which is how the
         wheel came to stop with a dividing line under the triangle and name a
         colour nowhere near it. Two turns each, and the arithmetic that
         chooses the tile is the arithmetic that shows it. */
      to: [s.outerRot + 720 + oDelta, s.innerRot - 720 - iDelta],
      mult: mult, mIdx: mIdx, autoStopped: !!auto
    });
  };

  settle() {
    const s = this.state;
    const { oi, ii } = this.spinResult;
    const oHit = s.outerBets[oi], iHit = s.innerBets[ii];
    const daba = oHit > 0 && iHit > 0;
    /* THE STAKE IS ALREADY GONE — it was taken when the chip landed — so
       this only ever pays. `win` is the RETURN, and the net for the note
       above the chips is that return minus what was on the cloth. */
    const mult = s.mult || 1;
    let win = (oHit + iHit) * PAYS * mult;
    if (daba) win *= 2;
    const net = win - s.staked;
    const bank = s.bank + net;
    if (win > 0) PURSE.pay(win, (credits) => this.setState({ credits }));

    if (daba) this.sfx("daba");
    else if (win > 0) this.sfx("win");
    else this.sfx("miss");

    const spinsLeft = s.spinsLeft - 1;
    const finished = spinsLeft <= 0 || bank >= s.cfg.target;
    this.setState({
      spinning: false, spinPhase: null, outerRot: s.to[0], innerRot: s.to[1],
      result: { oi, ii, win, daba, net, staked: s.staked, mult: mult, mIdx: s.mIdx },
      dabaAt: daba ? Date.now() : 0,
      bank, best: Math.max(s.best, net), spinsLeft,
      dabas: s.dabas + (daba ? 1 : 0),
      hits: s.hits + (win > 0 ? 1 : 0),
      lastNet: net, staked: 0,
      outerBets: [0, 0, 0, 0, 0, 0], innerBets: [0, 0, 0, 0, 0, 0], placed: 0
    }, () => {
      if (finished) {
        this.sfx("close");
        this.setState({ done: true });
        setTimeout(() => this.setState({ overlay: "card" }), 1500);
      }
    });
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = Date.now();
    const s = this.state;
    if (this.started && window.__dabaTarget === this && window.__dabaAC) {
      if (this.musicOn()) this.scheduleMusic();
      else if (window.__dabaMusicBus) this.killMusic();
    }
    if (s.overlay) return;
    if (s.titleCard && now - s.cardAt > 1700) this.setState({ titleCard: null });
    if (!s.spinning) return;

    /* ---- THE FREE RUN ---------------------------------------------------
       Constant speed, and the meter sweeping under it, until the player hits
       STOP WHEEL. A press that never comes stops itself after eight seconds:
       a wheel that spins for ever is not tension, it is a hung game, and the
       auto-stop takes whatever the meter happened to be on rather than
       punishing the player with a x1 for hesitating. */
    if (s.spinPhase === "free") {
      const el = now - s.spinAt;
      const meterP = meterPos(el);
      const outerRot0 = s.freeFrom[0] + el * 0.62;
      const innerRot0 = s.freeFrom[1] - el * 0.78;
      const crossed0 = Math.floor(Math.abs(outerRot0) / STEP);
      if (this.lastClick !== crossed0) { this.lastClick = crossed0; this.sfx("tick"); }
      this.setState({ outerRot: outerRot0, innerRot: innerRot0, meterP });
      if (el > 8000) this.stopWheel(true);
      return;
    }

    const T = 1500;
    const t = clamp((now - s.spinAt) / T, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    const outerRot = s.from[0] + (s.to[0] - s.from[0]) * e;
    const innerRot = s.from[1] + (s.to[1] - s.from[1]) * e;

    // a click as each divider passes the pointer
    const crossed = Math.floor(Math.abs(outerRot) / STEP);
    if (this.lastClick !== crossed && t < 0.98) { this.lastClick = crossed; this.sfx("tick"); }

    if (t >= 1) { this.sfx("stop"); this.settle(); return; }
    this.setState({ outerRot, innerRot });
  };

  begin = () => { this.started = true; this.audio(); this.setState({ overlay: null }); };

  cardAction = () => {
    this.setState(s => Object.assign(
      this.freshTable(s.bank >= s.cfg.target ? s.round + 1 : s.round),
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
    const r = s.result;
    const now = Date.now();
    /* THE WHOLE INTERACTION IN THREE LINES. Which ring you are being asked
       for is not a mode anybody has to set — it is simply which one is still
       empty, in order. */
    const oDown = s.outerBets.some(x => x > 0);
    const iDown = s.innerBets.some(x => x > 0);
    const want = !oDown ? "outer" : !iDown ? "inner" : null;
    const staked = s.outerBets.reduce((a, b) => a + b, 0) + s.innerBets.reduce((a, b) => a + b, 0);
    const now2 = Date.now();


    const outerSegs = OUTER.map((o, i) => {
      const pipN = i + 1;
      const pips = [];
      for (let k = 0; k < pipN; k++) pips.push({ x: n((k - (pipN - 1) / 2) * 4.2) });
      const p = polar(40, i);
      const cp = polar(34.6, i);
      return {
        d: sector(31, 49, i), fill: o.fill,
        gloss: sector(44, 49, i),
        pipT: "translate(" + p.x + " " + p.y + ") rotate(" + n(midAngle(i) + 90) + ")",
        pips,
        hasChips: s.outerBets[i] > 0, n: s.outerBets[i] + "",
        chipT: "translate(" + cp.x + " " + cp.y + ") rotate(" + n(-s.outerRot) + ")",
        win: !!r && !s.spinning && r.oi === i,
        onTap: this.onRingTap("outer", i)
      };
    });

    const innerSegs = INNER.map((o, i) => {
      const p = polar(24.4, i);
      const cp = polar(17.4, i);
      return {
        d: sector(13, 30, i), fill: o.fill,
        gloss: sector(26, 30, i),
        pipT: "translate(" + p.x + " " + p.y + ") rotate(" + n(midAngle(i) + 90) + ") scale(0.78)",
        mark: MARKS[i],
        hasChips: s.innerBets[i] > 0, n: s.innerBets[i] + "",
        chipT: "translate(" + cp.x + " " + cp.y + ") rotate(" + n(-s.innerRot) + ")",
        win: !!r && !s.spinning && r.ii === i,
        onTap: this.onRingTap("inner", i)
      };
    });

    /* ---- THE RACK -------------------------------------------------------
       Five chips, drawn as chips: a disc, a rim of alternating dashes the way
       a real one is edged, and its own face value. The one in your paw stands
       a little taller and keeps its rim lit, because a rack where you cannot
       see which chip is selected is a rack you have to remember. */
    const CHIP_INK = {
      1:  { face: "#f3f2f2", edge: "#8d8a84", ink: "#201e1d" },
      5:  { face: "#c2210f", edge: "#7c1409", ink: "#f7e9e6" },
      10: { face: "#2f6fb0", edge: "#1b4270", ink: "#eaf2fa" },
      25: { face: "#2f7d3a", edge: "#1a4a22", ink: "#e9f5ec" },
      50: { face: "#3a2b42", edge: "#f0c040", ink: "#f0c040" }
    };
    const rack = CHIPS.map((amt, i) => {
      const ink = CHIP_INK[amt];
      const on = s.chip === amt;
      const afford = s.credits >= amt;
      return {
        t: "translate(" + n(128 + i * 13.2) + " " + (on ? 74.5 : 76) + ")",
        face: afford ? ink.face : "#4a4550",
        edge: on ? "#f0c040" : (afford ? ink.edge : "#332f38"),
        sw: on ? 1.8 : 1.1,
        ink: afford ? ink.ink : "#8d8a94",
        n: amt + "",
        r: on ? 6.4 : 5.6,
        onDown: this.onChipDown(amt),
        onTap: () => this.pickChip(amt)
      };
    });

    const reached = s.bank >= cfg.target;
    const pct = Math.round(clamp(s.bank / cfg.target, 0, 1) * 100);

    const notes = [];
    if (s.dabas) notes.push({ text: s.dabas + " DABA" + (s.dabas > 1 ? "s" : "") + " on the night." });
    if (s.best) notes.push({ text: "Best single spin: " + s.best + " credits." });
    if (!s.hits) notes.push({ text: "Not one chip came home." });
    if (!reached) notes.push({ text: "The table wanted " + cfg.target + " up. You finished " +
      (s.bank < 0 ? Math.abs(s.bank) + " down." : s.bank + " up.") });

    return {
      hudKicker: "Table " + ((s.round % 4) + 1) + " of 4",
      stageLabel: cfg.name,
      callLabel: s.spinning ? "Spinning" : r ? "Last spin" : "Target",
      callText: s.spinning ? "Wheels turning…"
        : r ? (OUTER[r.oi].name + " / " + INNER[r.ii].name +
               (r.net > 0 ? " — " + r.net + " up" : r.net < 0 ? " — " + (-r.net) + " down" : " — even"))
        : cfg.target + " up in " + cfg.spins + " spins",
      bankText: (s.bank > 0 ? "+" : "") + s.bank + "/" + cfg.target,
      bankColour: reached ? "#2f7d3a" : s.bank < 0 ? "#c2210f" : "#201e1d",
      spinText: s.spinsLeft + "",
      spinColour: s.spinsLeft <= 2 ? "#c2210f" : "#201e1d",
      musicLabel: this.musicOn() ? "Music on" : "Music off",
      musicColor: this.musicOn() ? "#201e1d" : "#a8a6a0",
      soundLabel: this.muted() ? "Sound off" : "Sound on",
      soundColor: this.muted() ? "#a8a6a0" : "#201e1d",
      toggleMusic: this.toggleMusic, toggleSound: this.toggleSound,

      outerT: "rotate(" + n(s.outerRot) + ")",
      innerT: "rotate(" + n(s.innerRot) + ")",
      outerSegs, innerSegs, rack,

      /* THE RING THAT IS BEING ASKED FOR IS LIT and the other is not. A thick
         translucent stroke laid along the middle of the annulus tints the
         whole ring without hiding a single segment, which is what a
         highlight has to do here — the colours ARE the game. The first pass
         washed them at 0.20, the second at 0.12, and BOTH were wrong for the
         same reason: a tint over six colours you are choosing between makes
         them six shades of the tint. There is no wash left. The lit ring is
         marked by two bright rims and a running dashed line, and the contrast
         that actually tells you which ring is wanted comes from the OTHER one
         going dark or going away. */
      litOuter: want === "outer" && !s.spinning && !r,
      litInner: want === "inner" && !s.spinning && !r,

      /* AND THE RING THAT IS NOT BEING ASKED FOR GETS OUT OF THE WAY. Lighting
         one of two things is a comparison; the eye still has to make it. So
         while the outer bet is wanted the inner ring goes DARK, and once it is
         down the outer ring goes away altogether — at which point there is
         exactly one thing on the wheel you can drop a chip on and no reading
         required. The chips already on the cloth are drawn in a group of their
         own so they survive the fade: the bet you have placed is the one thing
         that must not vanish when the ring under it does. */
      dimInner: want === "outer" && !s.spinning && !r,
      outerFade: (want === "inner" && !s.spinning && !r) ? "0" : "1",

      dragging: !!s.drag,
      dragT: s.drag ? "translate(" + n(s.drag.x) + " " + n(s.drag.y) + ")" : "translate(0 0)",
      dragN: s.drag ? s.drag.amt + "" : "",

      handText: staked > 0 ? staked + " ON" : "NOTHING DOWN",
      onSpin: this.onSpin,
      onClear: this.clearBets,
      clearInk: s.placed && !s.spinning ? "#e6d8ef" : "#8d7c99",
      clearCursor: s.placed && !s.spinning ? "cursor:pointer" : "cursor:default",
      spinLabel: s.spinPhase === "free" ? "STOP WHEEL"
        : s.spinning ? "…" : r ? "Reset wheel" : "Spin",
      spinFont: (s.spinPhase === "free" || (r && !s.spinning)) ? "4.6px" : "6.4px",
      spinTrack: (s.spinPhase === "free" || (r && !s.spinning)) ? ".03em" : ".08em",
      spinFill: s.spinPhase === "free" ? "#f0c040"
        : s.spinning ? "#6b5039" : (r || s.placed) ? "#ec3013" : "#3a2b42",
      stakeText: staked > 0 ? staked + "" : "—",
      spinInk: s.spinPhase === "free" ? "#231a08"
        : (r || s.placed) && !s.spinning ? "#f3f2f2" : "#c6b8cf",
      spinCursor: (s.spinPhase === "free" || ((r || s.placed) && !s.spinning))
        ? "cursor:pointer" : "cursor:default",

      /* ---- THE METER, AS SEVEN RECTANGLES AND A NEEDLE ------------------
         Laid out by running total rather than by index, because the x5 is a
         different width from the rest and an index-times-width layout would
         put every band after it in the wrong place. */
      meterBands: (() => {
        let x = METER_X0;
        return METER.map((b, i) => {
          const w = METER_W * b.w / 100;
          const t = { x: n(x), w: n(w), fill: b.fill, ink: b.ink, n: b.m + "",
                      cx: n(x + w / 2), small: b.w < 10,
                      lit: !!r && r.mIdx === i && !s.spinning };
          x += w;
          return t;
        });
      })(),
      meterShow: s.spinning || !!r,
      meterT: "translate(" + n(METER_X0 + METER_W * (r && !s.spinning
        ? (s.meterP || 0) : (s.meterP || 0))) + " 0)",
      /* BLANK WHILE IT RUNS. This label sits above the right-hand end of the
         track, which is exactly where the needle is every time it gets there —
         and the button two rows down already says STOP WHEEL. */
      meterLabel: r && !s.spinning ? "x" + r.mult : s.mult ? "x" + s.mult : "",
      meterInk: r && !s.spinning ? (r.mult >= 5 ? "#f0c040" : r.mult === 1 ? "#ec6a52" : "#8fd6ae")
        : "#f3f2f2",

      showResult: !!r && !s.spinning,
      resultText: r ? (r.daba ? "DABA x" + r.mult + "! " + r.net + " UP"
        : r.net > 0 ? "+" + r.net + " credits"
        : r.net < 0 ? (-r.net) + " to the house" : "Even") : "",
      resultInk: r && r.net > 0 ? "#2f7d3a" : "#c2210f",
      showDaba: !!s.dabaAt && now - s.dabaAt < 1400,

      /* ---- THE NOTE -------------------------------------------------------
         One line of text above the rack, doing three jobs in turn: tell you
         which ring to drag to, then tell you what the spin did to you. It is
         the same strip every time, which is the whole reason it works — there
         is one place on this panel where the game talks to you, and you learn
         where it is in the first ten seconds. */
      /* AND IT IS AS BIG AS THE ROOM ALLOWS. The meter only exists once the
         wheels are moving, so the instruction and the multiplier never share
         the panel — which means the note can have the whole top of it while
         you are betting and give half of it back afterwards. Two sizes, and
         the box that clips them moves with them. */
      noteH: (s.spinning || r) ? "21.5" : "28",
      noteFont: (s.spinning || r) ? "5.4px" : "6.2px",
      noteText: s.spinPhase === "free" ? "STOP THE WHEEL"
        : s.spinning ? "BOTH RINGS TURNING…"
        : r ? (r.net > 0 ? "YOU WIN " + r.net + " CREDITS" : r.net < 0 ? "YOU LOSE " + (-r.net) + " CREDITS" : "NOTHING IN, NOTHING OUT")
        : (now2 - (s.wrongAt || 0) < 1500) ? (want === "outer" ? "THAT IS THE INNER RING — OUTER FIRST" : "OUTER IS DOWN — THE INNER RING NOW")
        : (now2 - (s.shortAt || 0) < 1500) ? "NOT ENOUGH CREDITS FOR THAT CHIP"
        : want === "outer" ? "DRAG YOUR BET TO THE OUTER RING"
        : want === "inner" ? "DRAG YOUR BET TO THE INNER RING"
        : "BOTH BETS DOWN — HIT SPIN",
      noteInk: r ? (r.net > 0 ? "#8fd6ae" : r.net < 0 ? "#ec6a52" : "#d9d5cf")
        : (now2 - (s.wrongAt || 0) < 1500 || now2 - (s.shortAt || 0) < 1500) ? "#ec6a52"
        : want === "outer" ? "#d9a84e" : want === "inner" ? "#8fd6bf" : "#f0c040",
      noteSub: s.spinPhase === "free" ? "Freeze the meter — x5 is narrow."
        /* THE MULTIPLIER IS ONLY NEWS IF THERE WAS SOMETHING TO MULTIPLY.
           "Violet / Crimson came up at x5" on a losing spin is a sentence
           that reads like a win and is not one — the meter did its job
           perfectly and there was nothing on the table for it. Say THAT
           instead, because a wasted x5 is the most memorable thing that can
           happen at this wheel and the game should notice it. */
        /* AND IT HAS TO FIT. The box above the meter holds a bold line and
           two small ones and no more; a sentence that runs to a third is cut
           off mid-word, which is how "an x5 with nothing to multiply" became
           "an x5 with". The DABA case says the least here because the flash
           across the wheel is already shouting it. */
        : r ? ((r.daba ? "DABA — both rings. " : "") +
                    OUTER[r.oi].name + " / " + INNER[r.ii].name +
                    (r.win > 0
                      ? (r.mult > 1 ? (r.daba ? " at x" + r.mult + "." : " — the meter paid x" + r.mult + ".")
                                    : " — but the meter gave you x1.")
                      : (r.mult >= 5 ? " — neither one. An x5 with nothing to multiply."
                                     : " — neither one.")))
        : want ? "Pick a chip, then drag it onto the lit ring."
        : "CLEAR takes both bets back.",
      creditText: s.credits + "",

      showHint: !s.overlay && !s.titleCard,
      hintText: s.spinning ? "Both rings are turning — the pointer at the top decides."
        : r ? "The winning colours are ringed on the wheel. Hit RESET WHEEL to bet again."
        : s.spinPhase === "free" ? "STOP WHEEL freezes the meter where your thumb catches it. x5 is narrow and the x1s are right beside it."
        : !want ? "Both bets are down. Hit SPIN — or CLEAR to take them back."
        : want === "inner" ? "Now the INNER ring. Drag a chip onto a colour — it is lit."
        : "Take a chip off the rack and drag it onto the OUTER ring. A colour that comes up pays five to one; both rings pays double.",

      showTitleCard: !!s.titleCard && !s.overlay,
      cardTitle: s.titleCard ? s.titleCard[0] : "",
      cardHint: s.titleCard ? s.titleCard[1] : "",

      showIntro: s.overlay === "intro",
      begin: this.begin,

      showCard: s.overlay === "card",
      cardKicker: reached ? cfg.name + " · cleared" : cfg.name + " · short",
      cardScore: (s.bank > 0 ? "+" : "") + s.bank + " credits on the night",
      cardMood: !reached ? "Quirk keeps the chips. Have another go."
        : s.dabas ? "A DABA night. The bar drank to you."
        : "Table cleared. Quirk looked almost disappointed.",
      cardRows: [
        { name: "Target", val: pct + "%", pct, color: pct >= 100 ? "#2f7d3a" : pct >= 60 ? "#b07d00" : "#c2210f" },
        { name: "Spins won", val: s.hits + "/" + cfg.spins, pct: Math.round((s.hits / cfg.spins) * 100),
          color: s.hits >= cfg.spins * 0.5 ? "#2f7d3a" : "#b07d00" }
      ],
      cardNotes: notes, hasNotes: notes.length > 0,
      cardCta: !reached ? "Play the table again"
        : s.round + 1 >= 4 ? "Back to the quiet table" : "Next table",
      cardAction: this.cardAction
    };
  }
}
