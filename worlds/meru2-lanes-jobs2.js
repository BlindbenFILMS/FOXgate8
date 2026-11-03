// MERU 2.0 — s115 MERU LANES DELUXE PART B: Mott's other 5 jobs, plugged into worlds/meru2-lanes-jobs.js (same ctx as part A, old frame).
// KEEP SCORE (league night, panel: pick each frame's mark + the running total) · FOUL LINE JUDGE (3D: a bowler slides up to the line, tap FOUL! only
// when the foot crosses) · KIDS' BUMPERS (lane 2: raise the lit bumper rails in turn, then 2 kids roll off them) · RESTOCK THE CLAW (tap the plush the
// card asks for, it drops into the case) · LOST AND FOUND (walk: 4 sparkling things round the hall, E to pick up, bring them to Mott).
import { lanesLayout } from './meru2-funrooms.js';
export const LN_GAMES_B = [{ k: 'score', name: 'Keep Score', color: '#2e4a6b', grp: 'mott' }, { k: 'judge', name: 'Foul Line Judge', color: '#ec3013', grp: 'mott' }, { k: 'bumpers', name: "Kids' Bumpers", color: '#ff3fb4', grp: 'mott' },
  { k: 'claw', name: 'Restock the Claw', color: '#f97316', grp: 'mott' }, { k: 'lost', name: 'Lost and Found', color: '#ffd23a', grp: 'mott', walk: true }];
export function lnJobsB(C) {
  const { THREE, G, V, box, cyl, sph, LM, CT, kit, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, clack, thunk, lst, lab, row, tagSprite, TAPR, scrW, dist, nearest, rnd, shuffle, LZ, CUST, NAMES, touch, mott, J, ringCol } = C;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', RAD = a => (a || 0) * Math.PI / 180;
  const toWo = (o, lx, lz) => { const r = RAD(o.a), c = Math.cos(r), s = Math.sin(r); return [o.x + lx * c + lz * s, o.z - lx * s + lz * c]; };
  const buzz = () => { tone(140, 0.08, 0.5, 'square'); tone(147, 0.06, 0.5, 'sawtooth'); }, cheer = () => { noise(0.9, 0.05, 1200); tone(784, 0.04, 0.3, 'triangle', 0.1); tone(1047, 0.04, 0.4, 'triangle', 0.25); };
  const clatter = () => { for (let i = 0; i < 6; i++) tone(900 + Math.random() * 900, 0.04, 0.08, 'square', i * 0.04); noise(0.35, 0.04, 1800); };
  // ---------- an HTML choice panel (buttons sit outside the 3D tap catcher) ----------
  const PAN = document.createElement('div'); PAN.style.cssText = 'position:fixed;left:12px;bottom:84px;z-index:31;display:none;flex-wrap:wrap;gap:8px;max-width:min(560px, calc(100vw - ' + (touch ? 200 : 24) + 'px));font-family:Archivo,sans-serif';
  document.body.appendChild(PAN);
  const fitPan = () => { PAN.style.bottom = (touch && innerHeight < 500 ? 58 : 84) + 'px'; }; fitPan(); addEventListener('resize', fitPan);
  const btns = (list, cb) => { PAN.innerHTML = ''; list.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t; b.setAttribute('role', 'button');
      b.style.cssText = 'min-height:48px;min-width:84px;padding:8px 14px;text-align:left;background:' + (i === 0 && list.length === 1 ? RED : WHITE) + ';color:' + (i === 0 && list.length === 1 ? '#ffffff' : INK) + ';border:2px solid #201e1d;font:900 18px Archivo,sans-serif;cursor:pointer';
      b.onpointerdown = e => { e.stopPropagation(); }; b.onclick = e => { e.stopPropagation(); cb(i, t); }; PAN.appendChild(b); }); PAN.style.display = 'flex'; };
  const panOff = () => { PAN.style.display = 'none'; PAN.innerHTML = ''; };
  // ================= 7 KEEP SCORE (league night) — panel =================
  const pinsHtml = down => { const rowsP = [[7, 8, 9, 10], [4, 5, 6], [2, 3], [1]]; return '<div style="display:inline-flex;flex-direction:column;gap:3px;align-items:center;padding:4px 6px;border:2px solid #201e1d;background:#ffffff">' + rowsP.map(r => '<div style="display:flex;gap:3px">' + r.map(p => '<span style="width:12px;height:12px;border:2px solid #201e1d;background:' + (down.has(p) ? '#201e1d' : '#ffffff') + '"></span>').join('') + '</div>').join('') + '</div>'; };
  const pick = (n, from) => new Set(shuffle(from.slice()).slice(0, n));
  const mkFrame = (noStrike) => { const u = Math.random(); if (!noStrike && u < 0.25) return { r: [10], d1: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) };
    const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; if (u < 0.6) { const a = 5 + (Math.random() * 5 | 0), d1 = pick(a, ALL); return { r: [a, 10 - a], d1, d2: new Set(ALL) }; }
    const a = 3 + (Math.random() * 6 | 0), b = Math.random() * (10 - a) | 0, d1 = pick(a, ALL), rest = ALL.filter(p => !d1.has(p)), d2 = new Set([...d1, ...pick(b, rest)]); return { r: [a, b], d1, d2 }; };
  const mark = f => f.r[0] === 10 ? 'X' : f.r[0] + f.r[1] === 10 ? f.r[0] + ' /' : f.r[0] + ' ' + (f.r[1] || '-');
  const wrongMarks = f => f.r[0] === 10 ? ['10', '9 /'] : f.r[0] + f.r[1] === 10 ? [f.r[0] + ' ' + f.r[1], 'X'] : [f.r[0] + ' /', f.r[0] + ' ' + ((f.r[1] + 1) % 10 || '-')];
  const total3 = F => { const rolls = F.flatMap(f => f.r); let s = 0, i = 0; for (let k = 0; k < 3; k++) { if (rolls[i] === 10) { s += 10 + rolls[i + 1] + rolls[i + 2]; i += 1; } else if (rolls[i] + rolls[i + 1] === 10) { s += 10 + rolls[i + 2]; i += 2; } else { s += rolls[i] + rolls[i + 1]; i += 2; } } return s; };
  const BOWLERS = ['GALE', 'ROOK', 'NERA', 'DASH', 'PIPER'];
  const G7 = {
    begin() { J.F = [mkFrame(), mkFrame(), mkFrame(), mkFrame(true)]; J.who = BOWLERS[Math.random() * 5 | 0]; J.i = 0; J.ph = 'mark'; this.ask(); toast('LEAGUE NIGHT \u00b7 PICK THE MARK FOR EACH FRAME', 2.6); },
    ask() { if (J.ph === 'mark') { const f = J.F[J.i], opts = shuffle([mark(f), ...wrongMarks(f)]); J.opts = opts; J.want = mark(f); btns(opts, (i, t) => G7.answer(t)); }
      else { const s = total3(J.F); J.want = String(s); J.opts = shuffle([String(s), String(s - 10), String(s + 5)]); btns(J.opts, (i, t) => G7.answer(t)); } J.qt = 0; clack(); },
    answer(t) { if (!J || J.pause > 0) return; if (t !== J.want) { miss(J.ph === 'mark' ? 'NOT QUITE \u00b7 IT IS ' + J.want : 'COUNT THE BONUS BALLS \u00b7 IT IS ' + J.want, 1.8); } else { addGold(2); pop(); }
      if (J.ph === 'mark') { J.i++; if (J.i >= J.F.length) { J.ph = 'total'; } NEXT(() => G7.ask(), 0.5); } else { panOff(); ding(); NEXT(finishGame, 0.8); } panOff(); },
    tick(dt) { J.qt += dt; if (J.qt > 14 && J.pause <= 0) { J.qt = 0; miss('TOO SLOW \u00b7 THE NEXT BALL IS COMING', 1.4); G7.answer('__'); } },
    card() { if (J.ph === 'total') { const marks = J.F.slice(0, 3).map(mark).join(' \u00b7 '); return ['PICK THE TOTAL', lab(J.who + ' \u00b7 FRAMES 1-3') + row(YEL, marks, '', false) + row(WHITE, 'FRAME 4 (BONUS BALLS)', mark(J.F[3]), false) + lab('STRIKE = 10 + NEXT 2 BALLS \u00b7 SPARE = 10 + NEXT 1'), 't'];
      } const f = J.F[J.i]; if (!f) return ['\u2026', '', 'w']; return ['PICK THE MARK', lab(J.who + ' \u00b7 FRAME ' + (J.i + 1) + ' / 4') + '<div style="display:flex;gap:10px;align-items:flex-end;margin-top:6px"><div>' + lab('BALL 1 \u00b7 ' + f.r[0]) + pinsHtml(f.d1) + '</div>' + (f.d2 ? '<div>' + lab('BALL 2 \u00b7 ' + f.r[1]) + pinsHtml(f.d2) + '</div>' : '') + '</div>', 'm' + J.i]; },
    shot() { return [V(127.0, 3.3, -34.1), 2.2, 1.4, 0.05, 2.2, -Math.PI / 2 - 0.2, 3.4]; },
    end() { panOff(); } };
  // ================= 8 FOUL LINE JUDGE — lane 3 =================
  const FZ = LZ[2], FOUL = 126.55;
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 2.0), new THREE.MeshBasicMaterial({ color: '#ff2a1a', transparent: true, opacity: 0.85, depthWrite: false })); laser.rotation.x = -Math.PI / 2; laser.position.set(FOUL, 0.14, FZ); laser.visible = false; laser.renderOrder = 4; G.add(laser);
  const FB = kit.makeFox({ key: 'lnJudgeB', torso: ['#fef3c7', '#fbbf24', '#b45309'], outfit: 'vest', mood: 'determined' }); FB.visible = false; G.add(FB);
  const FBALL = sph(G, 0.16, '#7c3aed', 0, 0, 0); FBALL.visible = false;
  const G8 = {
    begin() { J.list = shuffle([1, 1, 1, 0, 0, 0, 0, 0]).map(f => ({ foul: !!f, by: 0.12 + Math.random() * 0.2 })); J.k = 0; laser.visible = true; FB.visible = true; this.load(); btns(['FOUL!'], () => G8.call()); toast('WATCH THE FOOT \u00b7 TAP FOUL! ONLY IF IT CROSSES THE RED LINE', 3); },
    load() { const q = J.list[J.k]; q.x = 121.6; q.stop = q.foul ? FOUL + q.by : FOUL - q.by - 0.1; q.ph = 'run'; q.t = 0; q.called = false; FB.position.set(q.x, 0, FZ + 0.25); FB.rotation.y = Math.PI / 2; FBALL.visible = false; },
    call() { const q = J && J.list[J.k]; if (!q || J.pause > 0 || q.called) return; q.called = true; if (q.ph === 'run') { miss('WAIT FOR THE SLIDE \u00b7 THEN CALL IT', 1.4); return; }
      if (q.foul) { buzz(); addGold(3); toast('FOUL! \u00b7 GOOD EYE', 1.2); laser.material.color.set('#ffffff'); } else miss('THAT FOOT WAS BEHIND THE LINE', 1.6); },
    tick(dt) { const q = J.list[J.k]; if (!q) return; q.t += dt; laser.material.color.set(q.called && q.foul ? (Math.floor(J.t * 8) % 2 ? '#ffffff' : '#ff2a1a') : '#ff2a1a');
      if (q.ph === 'run') { q.x = Math.min(q.stop, q.x + dt * 3.4); FB.position.x = q.x; kit.animFox(FB, dt, 3.4, false); if (q.x >= q.stop) { q.ph = 'slide'; q.t = 0; FBALL.visible = true; FBALL.position.set(q.x + 0.5, 0.25, FZ); thunk(); } return; }
      kit.animFox(FB, dt, 0, false); if (FBALL.visible) { FBALL.position.x += dt * 9; FBALL.position.y = 0.26; if (FBALL.position.x > 142.5) { FBALL.visible = false; clatter(); } }
      if (q.t > 1.6) { if (q.foul && !q.called) miss('THAT WAS A FOUL \u00b7 THE TOE WAS OVER', 1.6); else if (!q.called) { addGold(1); } J.k++; if (J.k >= J.list.length) { panOff(); ding(); NEXT(finishGame, 0.6); } else NEXT(() => G8.load(), 0.5); } },
    card() { const q = J.list[J.k]; return ['TAP FOUL! IF THE TOE CROSSES', lab('THROW ' + Math.min(8, J.k + 1) + ' / 8') + lst([[RED, 'RED LINE', 'FOUL LINE', false]]), 'f' + J.k]; },
    shot() { return [V(FOUL, 0.35, FZ), 3.2, 1.4, 0.12, 2.6, 0.15, 3.4]; },
    end() { laser.visible = false; FB.visible = false; FBALL.visible = false; panOff(); } };
  // ================= 9 KIDS' BUMPERS — lane 2: raise the lit rails, then two kids roll =================
  const BZ = LZ[1], SEGX = [127.4, 131.0, 134.6, 138.2], BUMP = [];
  for (const s of [-1, 1]) SEGX.forEach((x0, i) => { const m = box(G, 3.5, 0.04, 0.1, '#38bdf8', x0 + 1.75, 0.11, BZ + s * 1.1); m.visible = false; BUMP.push({ m, s, i, up: false }); });
  const KIDS = [['#f472b6', 'dress', 1], ['#22c55e', 'vest']].map(([t, o, fem], i) => { const f = kit.makeFox({ key: 'lnKid' + i, torso: t, outfit: o, female: !!fem, mood: 'excited' }); f.scale.setScalar(0.68); f.visible = false; G.add(f); return f; });
  const KBALL = sph(G, 0.13, '#ffd23a', 0, 0, 0); KBALL.visible = false;
  const raise = (b, on) => { b.up = on; b.m.scale.set(1, on ? 6 : 1, on ? 0.8 : 1); b.m.position.y = on ? 0.22 : 0.11; b.m.material = LM(on ? '#ff3fb4' : '#38bdf8'); };
  const G9 = {
    begin() { BUMP.forEach(b => { b.m.visible = true; raise(b, false); }); J.order = shuffle(BUMP.slice()); J.n = 0; J.ph = 'raise'; J.tag = own(tagSprite('TAP', YEL, INK, 0.36)); this.lit(); toast('RAISE THE BUMPERS \u00b7 TAP THE LIT RAIL', 2.4); },
    lit() { const b = J.order[J.n]; if (!b) return; J.tag.position.set(b.m.position.x, 0.75, b.m.position.z); J.tag.visible = true; },
    press() { if (J.ph !== 'raise' || J.flies.length) return; const b = nearest(BUMP, q => q.m.position, TAPR() * 1.4); if (b < 0) return; const q = BUMP[b]; if (q.up) return;
      if (q !== J.order[J.n]) { miss('THE LIT ONE FIRST \u00b7 FOLLOW THE TAG', 1.3); return; } raise(q, true); clack(); addGold(1); J.n++;
      if (J.n >= J.order.length) { J.tag.visible = false; J.ph = 'kids'; J.kid = 0; ding(); toast('BUMPERS UP \u00b7 HERE COME THE KIDS', 1.6); NEXT(() => G9.kidGo(), 0.8); } else G9.lit(); },
    kidGo() { const f = KIDS[J.kid]; KIDS.forEach(k => { k.visible = k === f; }); f.position.set(124.6, 0, BZ + 0.3); f.rotation.y = Math.PI / 2; J.rt = 0; KBALL.visible = true; KBALL.position.set(126.4, 0.2, BZ); J.ph = 'roll'; cheer(); },
    tick(dt) { if (J.ph === 'raise' && J.tag) J.tag.scale.setScalar((touch ? 0.45 : 0.36) * (1 + Math.abs(Math.sin(J.t * 5)) * 0.25));
      KIDS.forEach(k => { if (k.visible) kit.animFox(k, dt, 0, false); });
      if (J.ph !== 'roll') return; J.rt += dt; const x = 126.4 + J.rt * 3.4, ph = J.rt * 1.3, tri = Math.abs((ph % 2) - 1) * 2 - 1; KBALL.position.set(x, 0.2, BZ + tri * 0.92); KBALL.rotation.z -= dt * 8;
      if (Math.abs(tri) > 0.97 && (J.bt = (J.bt || 0) + dt) > 0.2) { J.bt = 0; tone(520, 0.04, 0.1, 'triangle'); }
      if (x > 142.3) { KBALL.visible = false; clatter(); cheer(); toast(J.kid ? 'SPARE! THE KIDS ARE DANCING' : 'STRIKE! OFF THREE BUMPERS', 1.6); J.ph = 'wait'; J.kid++; if (J.kid >= KIDS.length) NEXT(finishGame, 1.4); else NEXT(() => G9.kidGo(), 1.2); } },
    card() { if (J.ph === 'raise') return ['TAP THE LIT RAIL', lab('LANE 2 \u00b7 BIRTHDAY PARTY') + lst([['#ff3fb4', 'BUMPERS UP', J.n + ' / 8', J.n >= 8]]), 'k' + J.n]; return ['WATCH THEM ROLL', lab('KID ' + Math.min(2, J.kid + 1) + ' / 2'), 'r' + J.kid]; },
    hint() { if (J.ph !== 'raise') return null; const b = J.order[J.n]; return b ? [b.m.position.clone(), 'TAP'] : null; },
    shot() { return [V(132.5, 0.1, BZ), 3.0, 7.0, 0.62, 5, -Math.PI / 2, 10]; },
    end() { BUMP.forEach(b => { raise(b, false); b.m.visible = false; }); KIDS.forEach(k => { k.visible = false; }); KBALL.visible = false; } };
  // ================= 10 RESTOCK THE CLAW — tap the plush the card asks for =================
  const CL = (lanesLayout().claws || [])[0] || { x: 110.5, z: -37, a: 0 };
  const KINDS = [['FOX', '#f97316'], ['DUCK', '#ffd23a'], ['BEAR', '#8a5a34']];
  const plush = k => { const g = new THREE.Group(), c = KINDS[k][1]; sph(g, 0.1, c, 0, 0.1, 0); if (k === 0) for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6), LM(c)); e.position.set(s * 0.05, 0.21, 0); g.add(e); }
    if (k === 1) { const bk = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), LM('#f97316')); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.1, 0.11); g.add(bk); } if (k === 2) for (const s of [-1, 1]) sph(g, 0.035, c, s * 0.07, 0.19, 0); return g; };
  const CRATE = new THREE.Group(); { box(CRATE, 0.9, 0.3, 0.6, '#7a5536', 0, 0.15, 0); const [x, z] = toWo(CL, 0, 1.5); CRATE.position.set(x, 0, z); CRATE.rotation.y = RAD(CL.a); CRATE.visible = false; G.add(CRATE); }
  const G10 = {
    begin() { CRATE.visible = true; J.items = []; const ks = shuffle([0, 0, 0, 1, 1, 1, 2, 2, 2]); ks.forEach((k, i) => { const p = own(plush(k)), lx = ((i % 3) - 1) * 0.26, lz = (Math.floor(i / 3) - 1) * 0.17, [x, z] = toWo(CL, lx, 1.5 + lz); p.position.set(x, 0.3, z); p.rotation.y = RAD(CL.a) + rnd(-0.4, 0.4); J.items.push({ p, k, got: false }); });
      J.ask = shuffle([0, 0, 0, 1, 1, 1, 2, 2, 2]); J.n = 0; toast('THE CARD SAYS WHICH PLUSH \u00b7 TAP IT IN THE CRATE', 2.6); },
    press() { if (J.flies.length) return; const b = nearest(J.items, q => (q.got ? V(0, -99, 0) : q.p.position.clone().setY(0.4)), TAPR() * 1.1); if (b < 0) return; const it = J.items[b], want = J.ask[J.n];
      if (it.k !== want) { miss('THAT IS A ' + KINDS[it.k][0] + ' \u00b7 THE CARD WANTS A ' + KINDS[want][0], 1.5); return; } it.got = true; pop(); addGold(1);
      const [x, z] = toWo(CL, rnd(-0.28, 0.28), rnd(-0.2, 0.15)); fly(it.p, V(x, 0.95 + J.n * 0.02, z), 0.4, 0.8, () => { tone(880, 0.03, 0.15, 'triangle'); }); J.n++; if (J.n >= J.ask.length) { ding(); NEXT(finishGame, 1.0); } },
    card() { const want = J.ask[J.n]; if (want == null) return ['CASE FULL', lab('9 / 9'), 'e']; return ['TAP A ' + KINDS[want][0], lab((J.n + 1) + ' / 9 \u00b7 CLAW CRANE') + lst(KINDS.map((k, i) => [k[1], k[0], '', i === want])), 'c' + J.n]; },
    hint() { const want = J.ask[J.n]; const it = J.items && J.items.find(q => !q.got && q.k === want); return it ? [it.p.position.clone().setY(0.4), 'TAP'] : null; },
    shot() { const [x, z] = toWo(CL, 0, 0.9); return [V(x, 0.75, z), 1.5, 1.6, 0.42, 1.9, RAD(CL.a), 2.8]; },
    end() { CRATE.visible = false; } };
  // ================= 11 LOST AND FOUND (walk) — 4 things round the hall, E to pick up, then E at Mott =================
  const LOST = [['A RED MITTEN', 118.6, -27.5], ['A STRIPED SCARF', 108.2, -20.4], ['A KEY RING', 124.8, -3.5], ['SUNGLASSES', 128.4, -11.8], ['A BOBBLE HAT', 144.0, -12.6], ['A COIN PURSE', 112.8, -33.2]];
  const LFBOX = new THREE.Group(); box(LFBOX, 0.7, 0.55, 0.5, '#3d2a1c', 0, 0.28, 0); box(LFBOX, 0.72, 0.04, 0.52, '#5a3d26', 0, 0.57, 0); LFBOX.position.set(107.4, 0, -9.0); G.add(LFBOX); ringCol(107.4, -9.0, 0.45);
  { const t = tagSprite('LOST + FOUND', YEL, INK, 0.8); t.position.set(0, 1.0, 0); LFBOX.add(t); }
  const sparkT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,230,140,0.8)'); r.addColorStop(1, 'rgba(255,210,58,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const nearItem = P => J.items.find(it => !it.got && Math.hypot(P.x - it.x, P.z - it.z) < 1.4);
  const G11 = { walk: true,
    begin() { J.items = shuffle(LOST.slice()).slice(0, 4).map(([n, x, z], i) => { const s = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkT, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffe8a0' }))); s.position.set(x, 0.35, z); s.scale.setScalar(0.6); return { n, x, z, s, got: false, own: NAMES[(i * 3 + 1) % NAMES.length] }; });
      J.ph = 'find'; toast('FOUR THINGS LEFT BEHIND \u00b7 LOOK FOR THE SPARKLE \u00b7 E TO PICK UP', 3); },
    tick() { J.items.forEach((it, i) => { if (!it.got) it.s.scale.setScalar(0.5 + Math.abs(Math.sin(J.t * 3 + i)) * 0.35); }); },
    goal() { const P = J.P; if (J.ph === 'back') return [mott.position.x, mott.position.z + 0.0, 1.0]; if (J.t < 6) return null; const rest = J.items.filter(it => !it.got); let b = rest[0], bd = 1e9; for (const it of rest) { const d = Math.hypot(P.x - it.x, P.z - it.z); if (d < bd) { bd = d; b = it; } } return b ? [b.x, b.z, 0] : null; },
    prompt(P) { if (J.ph === 'back') return Math.hypot(P.x - mott.position.x, P.z - mott.position.z) < 3.2 ? 'GIVE THEM TO MOTT' : null; const it = nearItem(P); return it ? 'PICK UP \u00b7 ' + it.n : null; },
    talk(P) { if (J.ph === 'back') { if (Math.hypot(P.x - mott.position.x, P.z - mott.position.z) >= 3.2) return false; ding(); addGold(4); toast('MOTT: "LOST + FOUND THANKS YOU."', 1.6); NEXT(finishGame, 0.4); return true; }
      const it = nearItem(P); if (!it) return false; it.got = true; it.s.visible = false; pop(); addGold(2); const left = J.items.filter(q => !q.got).length; toast(it.n + ' \u00b7 ' + (left ? left + ' TO GO' : 'NOW TAKE THEM TO MOTT'), 1.6); if (!left) J.ph = 'back'; return true; },
    card() { return [J.ph === 'back' ? 'WALK TO MOTT \u00b7 E' : 'WALK \u00b7 E AT THE SPARKLE', lst(J.items.map(it => [YEL, it.n, it.got ? '\u2713' : '', it.got])), J.ph + J.items.map(it => +it.got).join('')]; },
    end() {} };
  const GAMES = LN_GAMES_B;
  const [cx, cz] = toWo(CL, 0, 2.2);
  return { GD: { score: G7, judge: G8, bumpers: G9, claw: G10, lost: G11 }, GAMES, RINGS: { score: [122.2, -27.4], judge: [124.8, -29.8], bumpers: [125.4, -33.0], claw: [cx, cz], lost: [107.0, -10.6] },
    tips: ['League night: a strike scores 10 plus the next two balls.', 'Toe over the red line? Foul. Call it.', 'Kids bowl with the bumpers up. Always.', 'Ducks to the front of the claw. They sell.'], dispose() { PAN.remove(); } };
}
