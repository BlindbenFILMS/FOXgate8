/* 8 GATES 3D: BASKETBALL, pure rules + AI (no three.js).
   Coordinates: x = along the court (team 0 attacks +x), z = across (+z = camera / player side), y = up.
   Everything here works on plain objects so it can be unit tested or reused by an online host. */

export const COURT = {
  HX: 17, HZ: 9.5,              /* half length / half width (lines) */
  HOOP_X: 15.0,                 /* rim centre distance from mid court */
  RIM_Y: 4.2, RIM_R: 0.4, RIM_T: 0.045,
  BALL_R: 0.2,
  BOARD_X: 15.62, BOARD_HW: 1.3, BOARD_Y0: 3.9, BOARD_Y1: 5.4,
  THREE_R: 8.6, CORNER_Z: 8.3,
  KEY_HW: 2.5, FT_X: 10.4, CIRCLE_R: 1.8,
  G: 14,                        /* ball gravity */
  PG: 22,                       /* player gravity */
  SHOT_CLOCK: 14,
};

export const DIFF = {
  easy:   { key: 'easy',   who: 'PIP',   mate: 'MOSS', title: 'ROOKIE', speed: 0.84, shoot: 0.80, steal: 0.10, block: 0.16, react: 0.55, meterErr: 0.17, guard: 2.3, iq: 0.40, gold: 20, xp: 30 },
  medium: { key: 'medium', who: 'HOPE',  mate: 'JUNO', title: 'CLUB',   speed: 0.95, shoot: 0.94, steal: 0.20, block: 0.34, react: 0.32, meterErr: 0.09, guard: 1.65, iq: 0.72, gold: 40, xp: 55 },
  hard:   { key: 'hard',   who: 'NOBLE', mate: 'VEX',  title: 'MASTER', speed: 1.04, shoot: 1.05, steal: 0.31, block: 0.52, react: 0.18, meterErr: 0.045, guard: 1.25, iq: 0.95, gold: 80, xp: 90 },
};
export const HUMAN_SKILL = { speed: 1.0, shoot: 1.0, steal: 0.34, block: 0.5, react: 0, meterErr: 0, guard: 1.5, iq: 0.75 };

export const BASE_SPEED = 6.4;
export const SPRINT_MUL = 1.32;

export const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

/* the hoop a team shoots at */
export const attackX = (team) => (team === 0 ? COURT.HOOP_X : -COURT.HOOP_X);
export const defendX = (team) => -attackX(team);

export function isThree(x, z, hx) {
  const ax = Math.abs(x), sameEnd = Math.sign(x) === Math.sign(hx) || x === 0;
  if (!sameEnd) return true;
  if (Math.abs(z) >= COURT.CORNER_Z) return true;
  return dist2(x, z, hx, 0) >= COURT.THREE_R && ax <= COURT.HX;
}
export const shotPoints = (x, z, hx) => (isThree(x, z, hx) ? 3 : 2);

/* the shot meter runs 0..1 while SHOOT is held; release inside the band.
   Longer shots get a narrower band. */
export function sweetZone(d) {
  const centre = 0.72;
  const half = clamp(0.11 - d * 0.0055, 0.045, 0.1);
  return { a: centre - half, b: centre + half, c: centre, half };
}
export function timingGrade(m, z) {
  const e = Math.abs(m - z.c);
  if (e <= z.half * 0.35) return 'perfect';
  if (e <= z.half) return 'good';
  if (e <= z.half * 2.2) return 'ok';
  return 'bad';
}
const GRADE_MUL = { perfect: 1.5, good: 1.15, ok: 0.72, bad: 0.28, auto: 1.0 };

export function baseChance(d) {
  if (d < 2.6) return 0.74;
  if (d < 5) return 0.56;
  if (d < COURT.THREE_R) return 0.47;
  if (d < 11) return 0.38;
  if (d < 14) return 0.16;
  return 0.05;
}
export function contestMul(cd) {
  if (cd < 0.9) return 0.5;
  if (cd < 1.7) return 0.72;
  if (cd < 2.5) return 0.9;
  return 1;
}
export function makeChance({ d, grade, contest, skill = 1 }) {
  return clamp(baseChance(d) * (GRADE_MUL[grade] ?? 1) * contestMul(contest) * skill, 0.02, 0.97);
}

export const inCourt = (x, z, pad = 0) => Math.abs(x) <= COURT.HX + pad && Math.abs(z) <= COURT.HZ + pad;

export function rewards(diffKey, mine, theirs) {
  const D = DIFF[diffKey] || DIFF.medium;
  const won = mine > theirs, m = mine - theirs;
  const stars = won ? (m >= 10 ? 3 : m >= 5 ? 2 : 1) : 0;
  const gold = won ? D.gold + Math.max(0, m) * 2 : Math.round(D.gold * 0.15);
  const xp = won ? D.xp : Math.round(D.xp * 0.4);
  return { won, stars, gold, xp };
}

export const fmtClock = (t) => {
  t = Math.max(0, t);
  if (t < 10) return t.toFixed(1);
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ':' + String(s).padStart(2, '0');
};

/* ---------------------------------------------------------------- AI
   aiThink(p, W) -> { tx, tz, sprint, act }   act: 'shoot' | 'pass' | 'steal' | 'jump' | null
   W = { players, ball, match, dt }. players carry: team, slot, x, z, vx, vz, y, state, hasBall,
   sk (skill table), ai (scratch object, persistent per player). */

const mateOf = (p, P) => P.find((q) => q.team === p.team && q !== p);
const foesOf = (p, P) => P.filter((q) => q.team !== p.team);
const nearestFoe = (p, P) => {
  let best = null, bd = 1e9;
  for (const q of P) if (q.team !== p.team) { const d = dist2(p.x, p.z, q.x, q.z); if (d < bd) { bd = d; best = q; } }
  return { q: best, d: bd };
};
const openness = (p, P) => nearestFoe(p, P).d;

export function aiThink(p, W) {
  const { players: P, ball, match, dt } = W;
  const ai = p.ai;
  const sk = p.sk;
  const hx = attackX(p.team), dx = defendX(p.team);
  ai.cool = Math.max(0, (ai.cool || 0) - dt);
  const out = { tx: p.x, tz: p.z, sprint: false, act: null };

  /* ---------- tip-off: the two jumpers go up near the top */
  if (match.phase === 'tip') {
    if (p.tipper && !p.jumped && ball.vy < 0 && ball.y < 4.9 + (1 - sk.react) * 0.2 && ball.y > 3.6) {
      if ((ai.tipDelay ??= rnd(0, 0.25) + sk.react * 0.4) <= 0) out.act = 'jump';
      else ai.tipDelay -= dt;
    }
    return out;
  }
  if (match.phase === 'inbound') {
    if (p.hasBall) {
      ai.inT = (ai.inT || 0) + dt;
      if (ai.inT > 0.9) { ai.inT = 0; out.act = 'pass'; }
      return out;
    }
    ai.inT = 0;
  }
  if (match.phase !== 'play' && match.phase !== 'inbound' && match.phase !== 'ot') return out;

  const holder = ball.owner;
  const myTeamHas = holder && holder.team === p.team;
  const foeHas = holder && holder.team !== p.team;

  /* ---------- I have the ball */
  if (p.hasBall) {
    ai.hold = (ai.hold || 0) + dt;
    if (!ai.plan || ai.planFor !== match.possId) {
      ai.planFor = match.possId;
      const r = Math.random();
      ai.plan = r < 0.4 ? 'drive' : r < 0.72 ? 'mid' : 'three';
      ai.ang = rnd(-1.1, 1.1);
      ai.hold = 0;
    }
    const d = dist2(p.x, p.z, hx, 0);
    const open = openness(p, P);
    const mate = mateOf(p, P);
    const mateOpen = mate ? openness(mate, P) : 0;
    if (match.shotClock < 2.2 + (1 - sk.iq) * 1.2) { out.act = 'shoot'; return out; }
    if (d < 2.5) { out.act = 'shoot'; return out; }
    const wantShoot =
      (ai.plan === 'three' && isThree(p.x, p.z, hx) && d < COURT.THREE_R + 1.4) ||
      (ai.plan === 'mid' && d < 6.4) ||
      (ai.plan === 'drive' && d < 3.2);
    if (wantShoot && ai.hold > 0.5 && (open > 1.9 || match.shotClock < 5 || Math.random() < 0.15 * dt)) {
      if (Math.random() < dt * (2 + sk.iq * 3)) { out.act = 'shoot'; return out; }
    }
    if (mate && ai.hold > 0.9 && open < 1.3 && mateOpen > 2.4 && Math.random() < dt * 1.2 * (0.5 + sk.iq)) { out.act = 'pass'; return out; }
    if (mate && mate.human && mate.wantsBall && mateOpen > 1.4) { mate.wantsBall = false; out.act = 'pass'; return out; }
    /* where to go */
    let r = ai.plan === 'three' ? COURT.THREE_R + 0.7 : ai.plan === 'mid' ? 5.2 : 0.9;
    let tx = hx - Math.sign(hx) * Math.cos(ai.ang) * r, tz = Math.sin(ai.ang) * r;
    /* steer around the man in front */
    const nf = nearestFoe(p, P);
    if (nf.q && nf.d < 2.2) {
      const fx = (tx - p.x), fz = (tz - p.z), L = Math.hypot(fx, fz) || 1;
      const ox = nf.q.x - p.x, oz = nf.q.z - p.z;
      const ahead = (ox * fx + oz * fz) / L;
      if (ahead > 0) {
        const side = Math.sign(fx * oz - fz * ox) || 1;
        tx += (-fz / L) * side * -2.4; tz += (fx / L) * side * -2.4;
      }
    }
    out.tx = clamp(tx, -COURT.HX + 0.6, COURT.HX - 0.6);
    out.tz = clamp(tz, -COURT.HZ + 0.6, COURT.HZ - 0.6);
    out.sprint = d > 11 && p.stam > 0.3;
    return out;
  }

  /* ---------- ball in the air on a shot: rebound */
  if (ball.mode === 'shot' || (ball.mode === 'loose' && !holder)) {
    const crashX = ball.mode === 'shot' ? ball.hx : ball.x;
    const mine = P.filter((q) => q.team === p.team);
    const tx = ball.mode === 'shot' ? crashX - Math.sign(crashX) * 1.6 : ball.x;
    const tz = ball.mode === 'shot' ? clamp(ball.z * 0.5, -3, 3) : ball.z;
    /* closest teammate chases, the other drops back a bit */
    let chaser = mine[0];
    for (const q of mine) if (dist2(q.x, q.z, tx, tz) < dist2(chaser.x, chaser.z, tx, tz)) chaser = q;
    if (chaser === p || ball.mode === 'loose') {
      out.tx = ball.mode === 'loose' ? ball.x + ball.vx * 0.25 : tx;
      out.tz = ball.mode === 'loose' ? ball.z + ball.vz * 0.25 : tz;
      out.sprint = p.stam > 0.2;
      const near = dist2(p.x, p.z, ball.x, ball.z);
      if (near < 1.6 && ball.y > 2.7 && ball.y < 4.6 && ball.vy < 1 && !ai.cool && Math.random() < dt * 8) { out.act = 'jump'; ai.cool = 0.8; }
    } else {
      out.tx = (tx + defendX(p.team) * 0.3) * 0.6; out.tz = -tz * 0.5;
    }
    return out;
  }

  /* ---------- pass in the air: the receiver meets it */
  if (ball.mode === 'pass' && ball.to === p) { out.tx = ball.tx; out.tz = ball.tz; out.sprint = true; return out; }

  /* ---------- my team has it: get open */
  if (myTeamHas) {
    ai.spotT = (ai.spotT || 0) - dt;
    if (ai.spotT <= 0 || ai.spotFor !== match.possId) {
      ai.spotFor = match.possId;
      ai.spotT = rnd(2.2, 4.2);
      const side = holder.z > 0 ? -1 : 1;
      const cut = Math.random() < 0.25 * (0.5 + sk.iq);
      const a = side * rnd(0.5, 1.25);
      const r = cut ? 2.0 : Math.random() < 0.55 ? COURT.THREE_R + 0.6 : 5.6;
      ai.sx = hx - Math.sign(hx) * Math.cos(a) * r; ai.sz = Math.sin(a) * r;
    }
    /* stay on the attacking half once the handler is over */
    out.tx = ai.sx; out.tz = ai.sz;
    if (Math.sign(holder.x) !== Math.sign(hx)) { out.tx = holder.x + Math.sign(hx) * 6; out.tz = ai.sz * 0.8; }
    out.sprint = dist2(p.x, p.z, out.tx, out.tz) > 6;
    return out;
  }

  /* ---------- defence: man to man */
  const man = P.find((q) => q.team !== p.team && q.slot === p.slot) || foesOf(p, P)[0];
  if (!man) return out;
  const onBall = man.hasBall;
  const g = (onBall ? sk.guard * 0.72 : sk.guard * 1.25);
  const vx = dx - man.x, vz = 0 - man.z, L = Math.hypot(vx, vz) || 1;
  let tx = man.x + (vx / L) * g, tz = man.z + (vz / L) * g;
  if (!onBall && holder) { tx = tx * 0.75 + (holder.x * 0.5 + dx * 0.5) * 0.25; tz = tz * 0.75 + holder.z * 0.25 * 0.25; }
  out.tx = tx; out.tz = tz;
  out.sprint = dist2(p.x, p.z, tx, tz) > 4 && p.stam > 0.25;
  const dm = dist2(p.x, p.z, man.x, man.z);
  if (onBall && man.state === 'shoot' && dm < 2.4 && !p.jumped) {
    ai.blockT = (ai.blockT ?? sk.react + rnd(0, 0.15)) - dt;
    if (ai.blockT <= 0 && Math.random() < sk.block * 1.6) out.act = 'jump';
    if (ai.blockT <= 0) ai.blockT = 99;
  } else ai.blockT = undefined;
  if (onBall && man.state !== 'shoot' && dm < 1.5 && !ai.cool && Math.random() < dt * (0.35 + sk.steal * 1.5)) { out.act = 'steal'; ai.cool = rnd(0.9, 1.6) - sk.iq * 0.4; }
  return out;
}

/* demo captions: short teaching lines (each under 20 words) */
export const CAPTIONS = {
  tip: 'Tip-off. Jump when the ball peaks to win it.',
  move: 'Move with the stick. Hold SPRINT to run faster.',
  shoot: 'Hold SHOOT, then let go when the meter hits the yellow band.',
  three: 'Shots from outside the arc are worth 3.',
  steal: 'Press STEAL near the dribbler to poke the ball loose.',
  block: 'Press BLOCK as the shooter rises to swat it away.',
  rebound: 'A miss is a loose ball. Grab the rebound!',
  pass: 'PASS to your teammate to beat a tight defender.',
  clock: '14 seconds to shoot, or the ball goes over.',
  dunk: 'Sprint at the rim and press SHOOT to dunk.',
};
