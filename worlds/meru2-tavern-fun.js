import { applyD, applyPose, endPose, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 the stage singer + fans
// MERU 2.0 — s89 TAVERN DELUXE PART B2: the two FUN games (Ben s86), plugged into worlds/meru2-tavern-jobs.js like part B (same frame, card, camera, rings).
// DARTS VS FLICK (tap): a match on Flick's board (darts2). First to 3 legs; a leg = 3 darts each, the higher total takes it (a tie is thrown again).
//   Your darts: a red sight drifts over the board, tap to throw. Flick (meru-darter.js MATCH mode: setHold / throwTo) aims at the treble 20.
// KARAOKE (tap): a little stage on the west wall (L.stage, default x 13.7 z -90.6, faces east), pick one of the jukebox songs (A1-A5),
//   notes fall down 3 lanes (LOW / MID / HIGH): tap the lane when the note reaches the line (phone: the 3 big buttons; desktop: click or ← ↓ →).
//   Your fox sings on the stage under 2 spotlights, 2 fans cheer. Backing is a synth groove in the song's style (the jukebox goes quiet meanwhile).
import { SONGS } from './meru-tavern.js?v=s645';
import { CHOICE_BYE } from './meru2-shopkit.js?v=s728';
const SEG = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export const gamesF = () => [{ k: 'match', name: 'Darts vs Flick', color: '#b91c1c', fun: true }, { k: 'karaoke', name: 'Karaoke', color: '#7c3aed', fun: true }];
export function tavFun(X) {
  const { THREE, G, L, RAD, toWo, V, box, cyl, LM, CT, label, plane, kit, cols, own, fly, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, lst, lab, sayTo, rnd, touch, tav, J, save, cast, kT, ln, stop } = X;
  const INK = '#201e1d', YEL = '#ffd23a', WHITE = '#f3f2f2', RED = '#ec3013', ORANGE = '#e07a30';
  const RINGS = {}, GD = {};
  const paintRing = (x, z) => { const a = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.085, z, 22), b = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.087, z, 22); a.renderOrder = b.renderOrder = 1; };
  // ================= DARTS VS FLICK =================
  const DB = L.darts2 || { x: 51.5, z: -80, a: 270 }, DA = RAD(DB.a), FX = Math.sin(DA), FZ = Math.cos(DA), RX = Math.cos(DA), RZ = -Math.sin(DA), DY = 2.0;
  const onBoard = (u, v, d = 0.06) => V(DB.x + FX * d + RX * u, DY + v, DB.z + FZ * d + RZ * u);
  const dartScore = (u, v) => { const r = Math.hypot(u, v); if (r < 0.04) return [50, 'BULLSEYE']; if (r < 0.09) return [25, 'OUTER BULL']; if (r > 0.5) return [0, 'MISS'];
    const n = SEG[((Math.round(Math.atan2(u, v) / (Math.PI / 10)) % 20) + 20) % 20]; if (r > 0.29 && r < 0.32) return [n * 3, 'TRIPLE ' + n]; if (r > 0.47) return [n * 2, 'DOUBLE ' + n]; return [n, String(n)]; };
  const dartGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5);
  const mkDart = () => { const g = new THREE.Group(); const s = new THREE.Mesh(dartGeo, LM('#c0c4cc')); s.rotation.x = Math.PI / 2; g.add(s); const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.005), LM(ORANGE)); f.position.z = 0.08; g.add(f); g.rotation.y = DA; return g; };
  const SIGHT = new THREE.Group(); { const m = new THREE.MeshBasicMaterial({ color: '#ff1f1f', depthTest: false, transparent: true }); const r = new THREE.Mesh(new THREE.RingGeometry(0.045, 0.06, 24), m); SIGHT.add(r);
    for (const [w, h, x, y] of [[0.006, 0.05, 0, 0.085], [0.006, 0.05, 0, -0.085], [0.05, 0.006, 0.085, 0], [0.05, 0.006, -0.085, 0]]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(w * (touch ? 1.4 : 1), h * (touch ? 1.4 : 1)), m); b.position.set(x, y, 0); SIGHT.add(b); }
    SIGHT.rotation.y = DA; SIGHT.traverse(o => { o.renderOrder = 8; }); SIGHT.visible = false; G.add(SIGHT); }
  RINGS.match = [...toWo(DB, -1.3, 5.6)]; paintRing(RINGS.match[0], RINGS.match[1]);
  const D2 = tav && tav.darter;
  const gs = () => (rnd(-1, 1) + rnd(-1, 1) + rnd(-1, 1)) / 3;
  const FL = { hi: 'Flick. Darts are my thing. First to three legs. You throw first.', win: 'You beat me? Okay. Rematch. Tonight.', lose: 'Good arm. Practise the treble twenty.' };
  GD.match = {
    begin() { Object.assign(J, { legs: [0, 0], leg: 1, sc: [0, 0], log: [[], []], turn: 'you', n: 0, fn: 0, phase: 'aim', at: rnd(0, 6), dm: [], over: -1, u: 0, v: 0 }); if (D2) D2.setHold(true);
      save.setStat('tvFlickPlays', save.stat('tvFlickPlays', 0) + 1); toast('FLICK: "' + FL.hi.toUpperCase() + '"', 3.4); },
    tick(dt) { if (J.turn === 'you' && J.phase === 'aim') { J.at += dt; const wob = 0.3 * (1 - Math.min(0.5, J.n * 0.06)); J.u = Math.sin(J.at * 1.9) * wob + Math.sin(J.at * 4.7) * 0.05; J.v = Math.sin(J.at * 2.6 + 1) * wob * 0.9 + Math.cos(J.at * 3.9) * 0.05;
        SIGHT.position.copy(onBoard(J.u, J.v, 0.09)); SIGHT.visible = true; SIGHT.scale.setScalar(1 + Math.sin(J.t * 8) * 0.08); } else SIGHT.visible = false; },
    press() { if (J.turn !== 'you' || J.phase !== 'aim') return; J.phase = 'fly'; SIGHT.visible = false; const u = J.u + rnd(-0.015, 0.015), v = J.v + rnd(-0.015, 0.015), m = own(mkDart());
      m.position.copy(onBoard(0.3, -0.45, 2.4)); J.dm.push(m); noise(0.08, 0.03, 3200); tone(300, 0.02, 0.2, 'sine'); fly(m, onBoard(u, v, 0.06), 0.3, 0.12, () => { if (J.g === 'match') this.land(0, u, v); }); },
    land(who, u, v) { const [p, l] = dartScore(u, v); J.sc[who] += p; J.log[who].push(l); tone(p >= 50 ? 1200 : p >= 30 ? 980 : p ? 700 : 180, 0.05, 0.14, p ? 'triangle' : 'square'); noise(0.05, 0.03, 900);
      toast((who ? 'FLICK \u00b7 ' : '') + l + (p ? ' \u00b7 ' + p : ''), 1.1);
      if (!who) { J.n++; if (J.n < 3) { J.phase = 'aim'; J.at = rnd(0, 6); } else { J.phase = 'wait'; NEXT(() => this.flick(), 1.1); } }
      else { J.fn++; if (J.fn < 3) NEXT(() => this.flickThrow(), 0.3); else NEXT(() => this.score(), 1.0); } },
    flick() { J.turn = 'flick'; J.fn = 0; toast('FLICK STEPS UP \u00b7 ' + J.sc[0] + ' TO BEAT', 1.6); NEXT(() => this.flickThrow(), 0.9); },
    flickThrow() { if (J.g !== 'match') return; const u = gs() * 0.17, w = 0.305 + gs() * 0.17;
      if (D2) D2.throwTo(J.fn, u, w, () => { if (J.g === 'match' && J.turn === 'flick') this.land(1, u, w); }); else this.land(1, u, w); },
    score() { const [a, b] = J.sc;
      if (a === b) toast('TIE LEG \u00b7 ' + a + ' EACH \u00b7 AGAIN', 2); else { const w = a > b ? 0 : 1; J.legs[w]++; if (!w) { coin(); addGold(3); } else tone(220, 0.05, 0.4, 'sawtooth'); toast((w ? 'FLICK TAKES' : 'YOU TAKE') + ' LEG ' + J.leg + ' \u00b7 ' + a + ' \u2013 ' + b, 2); }
      if (J.legs[0] >= 3 || J.legs[1] >= 3) { J.over = J.legs[0] >= 3 ? 0 : 1; J.turn = 'end';
        if (!J.over) { const wins = save.stat('tvFlickWins', 0) + 1; save.setStat('tvFlickWins', wins); addGold(wins === 1 ? 50 : 25); ding(); } else addGold(4);
        NEXT(finishGame, 2.4); return; }
      NEXT(() => { J.dm.forEach(m => m.parent && m.parent.remove(m)); J.dm = []; if (D2) D2.clear(); if (a !== b) J.leg++; Object.assign(J, { sc: [0, 0], log: [[], []], turn: 'you', n: 0, fn: 0, phase: 'aim', at: rnd(0, 6) }); pop(); toast('LEG ' + J.leg + ' \u00b7 YOUR THROW', 1.4); }, 2.2); },
    result() { const s = J.legs[0] + ' \u2013 ' + J.legs[1]; return J.over === 0 ? 'YOU BEAT FLICK ' + s + ' \u00b7 +' + J.gold + ' GOLD \u00b7 FLICK: "' + FL.win.toUpperCase() + '"' : 'FLICK WINS ' + s + ' \u00b7 FLICK: "' + FL.lose.toUpperCase() + '"'; },
    card() { const t = J.turn, me = t !== 'flick' ? 0 : 1;
      return [t === 'you' ? (J.phase === 'aim' ? 'TAP \u00b7 THROW DART ' + (J.n + 1) + ' OF 3' : 'WATCH IT LAND') : t === 'flick' ? 'FLICK IS THROWING' : J.over === 0 ? 'YOU WIN!' : 'FLICK WINS',
        lab('LEG ' + J.leg + ' \u00b7 FIRST TO 3') + lst([[ORANGE, 'YOU \u00b7 ' + J.legs[0] + ' LEGS', String(J.sc[0]), J.legs[0] >= 3], ['#b91c1c', 'FLICK \u00b7 ' + J.legs[1] + ' LEGS', String(J.sc[1]), J.legs[1] >= 3]]) + lab(J.log[me].join(' \u00b7 ') || '\u00a0'),
        'm' + J.leg + t + J.n + J.fn + J.phase + J.sc.join('_') + J.legs.join('_')]; },
    hint() { return J.turn === 'you' && J.phase === 'aim' ? [onBoard(0, 0, 0.1), 'TAP WHEN IT IS ON THE MIDDLE'] : null; },
    shot() { return J.turn === 'flick' ? [onBoard(0, -0.7, 2.6), 6.2, 2.6, 0.14, 4.5, DA + 0.9, 7.5] : [onBoard(0, 0, 0), 1.9, 1.7, 0.1, 2.4, DA, 4.2]; },
    end() { SIGHT.visible = false; if (D2) D2.setHold(false); } };
  // ================= KARAOKE STAGE (west wall) =================
  const ST = L.stage || { x: 13.7, z: -90.6, a: 90 }, SA = RAD(ST.a), SH = 0.35;
  const SG = new THREE.Group(); SG.position.set(ST.x, 0, ST.z); SG.rotation.y = SA; G.add(SG);
  const spots = [];
  { box(SG, 4.0, SH, 3.0, '#3a2618', 0, SH / 2, 0); box(SG, 4.04, 0.06, 0.06, '#e0a84a', 0, SH, 1.52); box(SG, 1.3, SH / 2, 0.5, '#4a3020', 0, SH / 4, 1.75);
    box(SG, 4.0, 3.4, 0.08, '#7a1d2a', 0, SH + 1.7, -1.46); for (let i = 0; i < 8; i++) box(SG, 0.12, 3.4, 0.04, '#5a1420', -1.75 + i * 0.5, SH + 1.7, -1.4);
    box(SG, 4.2, 0.22, 0.2, '#2e2018', 0, SH + 3.45, -1.36);
    plane(SG, label('KARAOKE', INK, YEL, 512, 112), 2.2, 0.48, 0, SH + 3.85, -1.38);
    cyl(SG, 0.16, 0.18, 0.04, '#111111', 0, SH + 0.02, 0.85, 12); cyl(SG, 0.015, 0.015, 1.4, '#9aa0a6', 0, SH + 0.72, 0.85, 6); const mh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), LM('#2a2a2a')); mh.position.set(0, SH + 1.45, 0.85); SG.add(mh);
    for (const s of [-1, 1]) { box(SG, 0.6, 0.9, 0.5, INK, s * 1.6, SH + 0.45, 0.9); for (const y of [0.25, 0.62]) { const c = cyl(SG, y > 0.5 ? 0.09 : 0.17, y > 0.5 ? 0.09 : 0.17, 0.02, '#5c6670', s * 1.6, SH + y, 1.16, 14); c.rotation.x = Math.PI / 2; } }
    for (let i = 0; i < 4; i++) box(SG, 0.22, 0.08, 0.1, YEL, -1.35 + i * 0.9, SH + 0.04, 1.42);
    const coneM = () => new THREE.MeshBasicMaterial({ color: '#fff1c4', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4.4, 18, 1, true), coneM()); c.position.set(s * 0.9, SH + 2.2, 0.3); c.rotation.z = s * 0.18; SG.add(c); spots.push(c); box(SG, 0.26, 0.3, 0.26, INK, s * 1.3, 4.6, 0.3); }
    const c0 = toWo(ST, -2.0, -1.5), c1 = toWo(ST, 2.0, 1.5); cols.push({ f: [Math.min(c0[0], c1[0]), Math.max(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[1], c1[1])] }); }
  const stageW = (lx, lz, y = 0) => { const [x, z] = toWo(ST, lx, lz); return V(x, y, z); };
  RINGS.karaoke = [...toWo(ST, 1.0, 2.4)]; paintRing(RINGS.karaoke[0], RINGS.karaoke[1]);
  let singer = null; const getSinger = () => { if (singer) return singer; try { singer = cast ? cast.make('player') : null; } catch (e) { singer = null; } if (!singer) singer = kit.makeFox({ joints: true, key: 'tvSinger', outfit: 'armor', crest: '8', mood: 'happy' });
    singer.position.copy(stageW(0, 0.2, SH)); singer.rotation.y = SA; singer.visible = false; G.add(singer);
    const P = singer.userData && singer.userData.P; if (P && P.arms && P.arms[1]) { const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.2, 8), LM('#2a2a2a')); mic.position.set(0, -0.5, 0.08); P.arms[1].add(mic); } return singer; };
  const FANS = [kit.makeFox({ joints: true, key: 'tvFan1', torso: ['#c75b9b', '#9a4078', '#6a2a50'], outfit: 'dress', mood: 'excited' }), kit.makeFox({ joints: true, key: 'tvFan2', torso: ['#3f9a5e', '#2e7a48', '#1f5a34'], outfit: 'vest', mood: 'excited' })];
  FANS.forEach((f, i) => { f.position.copy(stageW(i ? 2.5 : -2.5, 2.0, 0)); { const c = stageW(0, 0.2); f.rotation.y = Math.atan2(c.x - f.position.x, c.z - f.position.z); } f.visible = false; G.add(f); f.userData.hop = 0; });
  const LANE = [['LOW', '#38bdf8', 'ArrowLeft', '\u2190'], ['MID', YEL, 'ArrowDown', '\u2193'], ['HIGH', RED, 'ArrowRight', '\u2192']], LEAD = 1.7, WIN_P = 0.09, WIN_G = 0.19;
  const ROOT = { COUNTRY: [196, 247, 294, 247], JAZZ: [174.6, 233, 196, 261.6], OPERA: [220, 174.6, 196, 164.8], ROCKABILLY: [164.8, 220, 246.9, 220], 'ROCK & ROLL': [196, 261.6, 293.7, 261.6] };
  let UI = null; const keyH = e => { const l = LANE.findIndex(q => q[2] === e.key); if (l >= 0 && J.g === 'karaoke' && J.phase === 'song') { e.preventDefault(); e.stopPropagation(); GD.karaoke.hit(l); } };
  function makeUI() { const port = innerHeight > innerWidth, short = innerHeight < 500, w = document.createElement('div');
    w.style.cssText = 'position:fixed;z-index:31;font-family:Archivo,sans-serif;box-sizing:border-box;' + (touch ? 'bottom:84px;' : 'bottom:24px;') + 'left:12px;width:' + (port ? 'min(62vw,300px)' : 'min(38vw,320px)') + ';';
    const hd = document.createElement('div'); hd.style.cssText = 'background:#7c3aed;color:#fff;border:2px solid #201e1d;border-bottom:0;padding:5px 8px;font-weight:900;font-size:12px;display:flex;justify-content:space-between;gap:6px';
    const hb = document.createElement('div'); hb.style.cssText = 'height:6px;background:#201e1d;border:2px solid #201e1d;border-top:0;border-bottom:0'; const hf = document.createElement('div'); hf.style.cssText = 'height:100%;width:40%;background:#ffd23a'; hb.appendChild(hf);
    const hw = document.createElement('div'); hw.style.cssText = 'position:relative;overflow:hidden;background:rgba(32,30,29,0.88);border:2px solid #201e1d;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));height:' + (short ? '42vh' : port ? '30vh' : '36vh');
    const lanes = LANE.map((q, i) => { const c = document.createElement('div'); c.style.cssText = 'position:relative;border-left:' + (i ? '2px solid rgba(243,242,242,0.18)' : '0'); hw.appendChild(c); return c; });
    const line = document.createElement('div'); line.style.cssText = 'position:absolute;left:0;right:0;bottom:14px;height:4px;background:#f3f2f2;pointer-events:none'; hw.appendChild(line);
    const btns = document.createElement('div'); btns.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:4px';
    const bs = LANE.map((q, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Sing ' + q[0]); b.style.cssText = 'height:' + (touch ? 58 : 44) + 'px;border:2px solid #201e1d;border-radius:0;background:' + q[1] + ';color:#201e1d;font:900 15px Archivo,sans-serif;text-align:left;padding:0 10px;cursor:pointer;touch-action:none';
      b.textContent = q[0] + (touch ? '' : ' ' + q[3]); b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (J.g === 'karaoke' && J.phase === 'song') GD.karaoke.hit(i); }); btns.appendChild(b); return b; });
    w.appendChild(hd); w.appendChild(hb); w.appendChild(hw); w.appendChild(btns); document.body.appendChild(w); addEventListener('keydown', keyH, true); return { w, hw, lanes, bs, hd, hf, last: '' }; }
  const killUI = () => { if (UI) { UI.w.remove(); UI = null; removeEventListener('keydown', keyH, true); } };
  const best = () => save.stat('tvKaraBest', 0) || 0;
  GD.karaoke = {
    begin() { Object.assign(J, { phase: 'pick', st: 0, score: 0, combo: 0, maxC: 0, hype: 0.4, per: 0, good: 0, bad: 0, notes: [], beatN: -1, flash: [0, 0, 0] }); if (tav && tav.jukebox && tav.jukebox.stop) try { tav.jukebox.stop(); } catch (e) {}
      const S = getSinger(); S.visible = true; FANS.forEach(f => { f.visible = true; });
      sayTo(kT, [{ ...ln('The stage is yours. Pick a song.'), choices: [...SONGS.map((s, i) => ({ text: s.n + ' \u00b7 ' + s.title, pick: () => { if (J.g === 'karaoke') this.go(i); } })), { text: CHOICE_BYE, bye: true, pick: () => { if (J.g === 'karaoke') { stop(); toast('MAYBE NEXT TIME', 1.4); } } }] }]); },
    go(i) { const s = SONGS[i], beat = 60 / s.bpm, step = s.bpm > 130 ? beat * 2 : beat; let lane = 1, t = 2.6; const notes = [];
      for (let k = 0; k < 28; k++) { notes.push({ t, lane, st: 0, el: null }); const r = Math.random(); lane = r < 0.25 ? lane : Math.max(0, Math.min(2, lane + (r < 0.62 ? 1 : -1) * (Math.random() < 0.15 ? 2 : 1))); t += (k % 8 === 7 ? step * 2 : step); }
      Object.assign(J, { song: s, beat, step, notes, dur: t + 1.2, phase: 'song', st: 0, beatN: -1, roots: ROOT[s.genre] || ROOT.COUNTRY }); UI = makeUI(); toast(s.n + ' \u00b7 ' + s.title + ' \u00b7 GET READY', 2.2); tone(1320, 0.05, 0.08, 'square'); },
    hit(l) { const now = J.st; let b = null, bd = WIN_G; for (const n of J.notes) { if (n.st || n.lane !== l) continue; const d = Math.abs(n.t - now); if (d < bd) { bd = d; b = n; } }
      J.flash[l] = 0.18; if (!b) { J.combo = 0; J.hype = Math.max(0, J.hype - 0.03); J.bad++; tone(150, 0.03, 0.12, 'square'); return; }
      const perfect = bd <= WIN_P; b.st = perfect ? 2 : 1; if (b.el) { b.el.remove(); b.el = null; } J.combo++; J.maxC = Math.max(J.maxC, J.combo); J.score += Math.round((perfect ? 100 : 50) * (1 + Math.min(20, J.combo) * 0.05)); if (perfect) J.per++; else J.good++;
      J.hype = Math.min(1, J.hype + (perfect ? 0.06 : 0.03)); const f = J.roots[Math.floor(J.st / (J.beat * 4)) % 4] * [1, 1.26, 1.5][l] * 2; tone(f, 0.07, 0.35, 'triangle'); tone(f * 2, 0.02, 0.25, 'sine');
      if (perfect) { const fn = FANS[(Math.random() * 2) | 0]; fn.userData.hop = 1; } },
    tick(dt) { const S = singer, t = J.t; FANS.forEach(f => { kit.animFox(f, dt, 0, false); if (f.userData.hop > 0) { f.userData.hop = Math.max(0, f.userData.hop - dt * 2.5); f.position.y = Math.sin(f.userData.hop * Math.PI) * 0.35; } }); if (S) kit.animFox(S, dt, 0, false);
      const on = J.phase === 'song'; spots.forEach((c, i) => { c.material.opacity += ((on ? 0.13 + J.hype * 0.08 : 0.04) - c.material.opacity) * Math.min(1, dt * 3); c.rotation.z = (i ? 1 : -1) * (0.18 + Math.sin(t * 0.9 + i) * 0.06); });
      if (!on) { [S, ...FANS].forEach(f => { if (f && f.userData._lifeJ) { f.userData._lifeJ = 0; endPose(f); } }); return; } J.st += dt; const bp = J.st / J.beat;
      if (S) { S.position.y = SH + Math.abs(Math.sin(bp * Math.PI)) * 0.05; const P = S.userData && S.userData.P; if (P && P.fore) { applyD(THREE, S, lifeD('sing', J.st, { bpm: 0.5 / J.beat }), J.st, 1); S.userData._lifeJ = 1; FANS.forEach((f, i) => { if (f.userData.P && f.userData.P.fore) { applyPose(THREE, f, f.userData.hop > 0 ? 'cheer' : 'clap', J.st + i * 0.3, 1); f.userData._lifeJ = 1; } }); } else if (P) { if (P.arms && P.arms[1]) { P.arms[1].rotation.x = -2.0; P.arms[1].rotation.z = 0.35; } if (P.head) P.head.rotation.z = Math.sin(bp * Math.PI) * 0.12; } }
      const bn = Math.floor(bp); if (bn !== J.beatN && J.st < J.dur - 0.8) { J.beatN = bn; const r = J.roots[Math.floor(bn / 4) % 4]; tone(r / 2, 0.09, J.beat * 0.85, 'triangle'); noise(0.04, 0.025, 7000); if (bn % 2 === 0) tone(70, 0.14, 0.12, 'sine'); if (J.st < 2.6 && bn < 4) toast(bn < 3 ? String(3 - bn) : 'SING!', 0.6); }
      for (const n of J.notes) if (!n.st && n.t < J.st - WIN_G) { n.st = -1; J.combo = 0; J.hype = Math.max(0, J.hype - 0.05); if (n.el) { n.el.style.opacity = '0.25'; } }
      if (UI) { const H = UI.hw.clientHeight, base = H - 16; for (const n of J.notes) { const dtn = n.t - J.st; if (dtn > LEAD || n.st > 0 || dtn < -0.5) { if (n.el && (n.st > 0 || dtn < -0.5)) { n.el.remove(); n.el = null; } continue; }
          if (!n.el) { const e = document.createElement('div'); e.style.cssText = 'position:absolute;left:6px;right:6px;top:0;height:18px;background:' + LANE[n.lane][1] + ';border:2px solid #f3f2f2;box-sizing:border-box;pointer-events:none'; UI.lanes[n.lane].appendChild(e); n.el = e; }
          n.el.style.transform = 'translateY(' + Math.round(base - dtn / LEAD * base - 9) + 'px)'; }
        const ht = J.song.n + ' \u00b7 ' + J.song.title + '|' + J.score + (J.combo > 1 ? ' \u00b7 x' + J.combo : ''); if (ht !== UI.last) { UI.last = ht; const [a, b] = ht.split('|'); UI.hd.innerHTML = '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + a + '</span><span style="white-space:nowrap;color:#ffd23a">' + b + '</span>'; } UI.hf.style.width = Math.round(J.hype * 100) + '%';
        J.flash.forEach((f, i) => { J.flash[i] = Math.max(0, f - dt); UI.bs[i].style.filter = J.flash[i] > 0 ? 'brightness(1.35)' : ''; }); }
      if (J.st >= J.dur) { J.phase = 'done'; killUI(); const tot = J.notes.length, acc = (J.per + J.good) / tot; J.acc = acc; J.stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1; const b0 = best(); if (J.score > b0) save.setStat('tvKaraBest', J.score); J.newBest = J.score > b0;
        save.setStat('tvKaraSongs', save.stat('tvKaraSongs', 0) + 1); addGold(Math.round(J.per * 1 + J.good * 0.5 + (J.stars === 3 ? 10 : 0))); noise(1.4, 0.06, 1500); ding(); FANS.forEach(f => { f.userData.hop = 1; }); NEXT(finishGame, 2.0); } },
    result() { return (J.stars === 3 ? 'ENCORE! ' : J.stars === 2 ? 'BIG CHEER! ' : 'NICE TRY! ') + Math.round((J.acc || 0) * 100) + '% \u00b7 ' + J.score + ' POINTS' + (J.newBest ? ' \u00b7 NEW BEST' : '') + ' \u00b7 +' + J.gold + ' GOLD'; },
    card() { if (J.phase === 'pick') return ['PICK A SONG', lab('BEST ' + best()), 'kp']; if (J.phase === 'song') return null;
      const n = J.notes.filter(q => q.st).length; return [J.phase === 'done' ? 'THE CROWD GOES WILD' : J.st < 2.6 ? 'GET READY' : 'TAP THE LANE ON THE LINE', lab(J.song.n + ' \u00b7 ' + J.song.title) + lst([[YEL, 'SCORE', String(J.score), false], [RED, 'COMBO', String(J.combo), J.combo >= 10], ['#7c3aed', 'CROWD', Math.round(J.hype * 100) + '%', J.hype >= 0.9]]), 'k' + n + '_' + J.score + '_' + J.combo + '_' + Math.round(J.hype * 20) + J.phase + (J.st < 2.6 ? 'r' : '')]; },
    shot() { return [stageW(0, 0.2, 1.35), 4.6, 3.0, 0.14, 4.5, SA, 8]; },
    end() { killUI(); if (singer) singer.visible = false; FANS.forEach(f => { f.visible = false; f.position.y = 0; }); spots.forEach(c => { c.material.opacity = 0; }); } };
  const tips = ['Flick aims for the treble twenty. Hit the bull and he gets nervous.', 'On the karaoke stage, tap when the note touches the white line.'];
  return { RINGS, GD, tips };
}
