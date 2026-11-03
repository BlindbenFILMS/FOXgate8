// DOCKING CONTROL (s354): Ben's 2D game (minigames/dsf/logic/docking-control.js) ported 1:1 onto a HOLOGRAM over the
// Ops table. Same watches, hulls, holding circuits, look-ahead conflicts and scoring; drawn live on a canvas texture,
// with 3D touches: the projector cone, a spinning station at the hub, ship glows above the plot, a ring burst on docking.
import { FONT } from '../engine/textures.js';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HUB = { x: 100, y: 66 }, PLOT = { x0: 6, y0: 12, x1: 194, y1: 122 }, SAFE = 9.5, LOOKAHEAD = 16, ORBIT_R = [28, 37, 46], ORBIT_LAPS = 3;
const orbitW = s => s.w || (s.speed / Math.max(1, s.orbitR)), orbitDir = b => (b === 1 ? -1 : 1);
const BERTHS = [{ id: 'A', fill: '#d9a84e', x: 85, y: 55 }, { id: 'B', fill: '#6e8fb8', x: 115, y: 55 }, { id: 'C', fill: '#6f9d86', x: 115, y: 77 }, { id: 'D', fill: '#d98a9c', x: 85, y: 77 }];
// brighter holo inks for the same four berths (the 2D fills read too dull on a glowing plot)
const INK = { A: '#ffc35a', B: '#8fb8ff', C: '#7fe0b0', D: '#ff9db4' };
const HULLS = { shuttle: { d: 'M 0 -5.4 L 3.8 4.4 L 0 2.6 L -3.8 4.4 Z', tag: 'SHTL', speed: 9 }, freighter: { d: 'M -4.6 -5.6 L 4.6 -5.6 L 3.4 5.6 L -3.4 5.6 Z', tag: 'FRTR', speed: 5.8 }, tug: { d: 'M 0 -5 L 4.6 0 L 3 5 L -3 5 L -4.6 0 Z', tag: 'TUG', speed: 7.5 } };
const WATCHES = [
  { name: 'Quiet watch', berths: ['A', 'B'], ships: [{ at: 0.4, berth: 'A', hull: 'shuttle', from: 'w' }, { at: 4.5, berth: 'B', hull: 'freighter', from: 'e' }, { at: 9, berth: 'A', hull: 'tug', from: 's' }] },
  { name: 'Morning arrivals', berths: ['A', 'B', 'C'], ships: [{ at: 0.4, berth: 'C', hull: 'shuttle', from: 'n' }, { at: 3.6, berth: 'A', hull: 'freighter', from: 'e' }, { at: 7, berth: 'B', hull: 'shuttle', from: 'w' }, { at: 11, berth: 'C', hull: 'tug', from: 'e' }] },
  { name: 'Convoy in', berths: ['A', 'B', 'C'], ships: [{ at: 0.4, berth: 'B', hull: 'freighter', from: 'w' }, { at: 2.8, berth: 'A', hull: 'shuttle', from: 'e' }, { at: 5.6, berth: 'C', hull: 'shuttle', from: 'n' }, { at: 8.4, berth: 'B', hull: 'tug', from: 's' }, { at: 11.6, berth: 'A', hull: 'freighter', from: 's' }] },
  { name: 'Full house', berths: ['A', 'B', 'C', 'D'], ships: [{ at: 0.4, berth: 'D', hull: 'shuttle', from: 'e' }, { at: 2.6, berth: 'B', hull: 'shuttle', from: 'w' }, { at: 4.8, berth: 'C', hull: 'freighter', from: 'n' }, { at: 7.2, berth: 'A', hull: 'tug', from: 'e' }, { at: 9.8, berth: 'D', hull: 'freighter', from: 'n' }, { at: 12.4, berth: 'B', hull: 'shuttle', from: 's' }] }];
const ENTRY = { w: { x: PLOT.x0 + 2, spread: 'y', lo: 30, hi: 100 }, e: { x: PLOT.x1 - 2, spread: 'y', lo: 30, hi: 100 }, n: { y: PLOT.y0 + 2, spread: 'x', lo: 40, hi: 160 }, s: { y: PLOT.y1 - 2, spread: 'x', lo: 40, hi: 160 } };
function rng(seed) { let s = seed + 0x9e3779b9; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function spawnPoint(from, rand) { const e = ENTRY[from], v = e.lo + rand() * (e.hi - e.lo); return e.spread === 'y' ? { x: e.x, y: v } : { x: v, y: e.y }; }
function advanceAlong(pos, path, pi, dist) { let x = pos.x, y = pos.y, i = pi, left = dist;
  while (left > 0 && i < path.length) { const dx = path[i][0] - x, dy = path[i][1] - y, d = Math.hypot(dx, dy); if (d <= left) { x = path[i][0]; y = path[i][1]; left -= d; i++; } else { x += dx / d * left; y += dy / d * left; left = 0; } }
  return { x, y, i, done: i >= path.length, left }; }
// the 2D game's bouncy space-age lounge, unchanged
const MUSIC = (() => { const notes = [];
  const sections = [{ at: 0, bass: [36, 43, 36, 40], stab: [60, 64, 67, 71] }, { at: 8, bass: [33, 40, 33, 36], stab: [57, 60, 64, 67] }, { at: 16, bass: [29, 36, 29, 33], stab: [53, 57, 60, 64] }, { at: 24, bass: [31, 38, 31, 35], stab: [55, 59, 62, 65] }];
  sections.forEach(s => { s.bass.forEach((m, i) => notes.push({ b: s.at + i * 2, m, d: 1.5, v: 'bass' })); [1, 3, 5, 6.5].forEach((off, i) => [s.stab[i % 4], s.stab[(i + 2) % 4]].forEach(m => notes.push({ b: s.at + off, m, d: 0.45, v: 'stab' }))); });
  [[1, 72, 76], [2.5, 76, null], [3.5, 79, 76], [6, 76, null], [9, 69, 72], [10.5, 72, null], [11.5, 76, 72], [14, 72, null], [17, 77, 81], [18.5, 81, null], [19.5, 84, 81], [22, 81, null], [25, 74, 71], [26.5, 71, null], [27.5, 67, null], [30, 71, 74]].forEach(p => notes.push({ b: p[0], m: p[1], g: p[2], d: 1.1, v: 'lead' }));
  for (let b = 0; b < 32; b += 0.5) notes.push({ b, m: b % 1 === 0 ? 90 : 96, d: 0.06, v: 'tick' });
  [7.5, 15.5, 23.5, 31.5].forEach(b => notes.push({ b, m: 96, g: 103, d: 0.3, v: 'sparkle' }));
  return { notes, beats: 32, spb: 0.42 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeDocking(K, { group, at, y, audio, save, toast, LOW, portrait = () => false, theme: V = {}, ox = 0, baseY = 28 }) {
  const { THREE, basic, glowSprite } = K;
  // s472 per-station versions: V = { title, where, kicker, body, ink:{A..D}, watches, tags:{hull:'TAG'}, holo:'#hex', holoRgb:'r,g,b', bg, stat:'prefix', pw, maxD, maxY, beams:[{a, drift, off}], cycle }
  const HC = V.holo || '#7fe3ff', HCN = new THREE.Color(HC).getHex(), HCR = V.holoRgb || '127,227,255', INKT = V.ink || INK, WS = V.watches || (V.watchNames ? WATCHES.map((w, i) => ({ ...w, name: V.watchNames[i] || w.name })) : WATCHES), TAG = k => (V.tags && V.tags[k]) || HULLS[k].tag, P = V.stat || 'dsfDock', TITLE = V.title || 'DOCKING CONTROL';
  const PW = V.pw || 7.6, PH = PW * 140 / 200, CW = LOW ? 900 : 1200, CH = Math.round(CW * 0.7), S = CW / 200;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const root = new THREE.Group(); root.position.set(at.x, y, at.z); root.visible = false; group.add(root);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); plate.rotation.x = -Math.PI / 2; plate.renderOrder = 5; root.add(plate);
  // glowing frame + the projector cone from the table top
  const frameM = new THREE.MeshBasicMaterial({ color: HCN, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), edges = [];
  for (const [w, d, x, z] of [[PW, 0.05, 0, -PH / 2], [PW, 0.05, 0, PH / 2], [0.05, PH, -PW / 2, 0], [0.05, PH, PW / 2, 0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), frameM); m.position.set(x, 0, z); root.add(m); edges.push(m); }
  const coneG = new THREE.BufferGeometry(), cy = -(y - 1.22); const cp = []; for (const [x, z] of [[-PW / 2, -PH / 2], [PW / 2, -PH / 2], [PW / 2, PH / 2], [-PW / 2, PH / 2]]) cp.push(0, cy, 0, x, 0, z);
  coneG.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); root.add(new THREE.LineSegments(coneG, new THREE.LineBasicMaterial({ color: HCN, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })));
  const wash = new THREE.Mesh(new THREE.CylinderGeometry(PW * 0.55, 0.25, -cy, 4, 1, true), basic(HC, 0.06, true)); wash.rotation.y = Math.PI / 4; wash.scale.set(1, 1, PH / PW); wash.position.y = cy / 2; root.add(wash);
  const toW = (px, py) => [(px / 200 - 0.5) * PW, ((py / 140) - 0.5) * PH];
  // the station at the hub, a little spinning model standing on the plot
  const stn = new THREE.Group(); { const [hx, hz] = toW(HUB.x, HUB.y); stn.position.set(hx, 0.14, hz); root.add(stn); const hm = basic(HC, 0.85, true);
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 32), hm); r1.rotation.x = Math.PI / 2; stn.add(r1); const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 20), hm); r2.rotation.x = Math.PI / 2; stn.add(r2);
    stn.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 6), hm)); for (let i = 0; i < 3; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.13), hm); sp.rotation.y = i * 2.094; sp.position.set(Math.sin(i * 2.094) * 0.14, 0, Math.cos(i * 2.094) * 0.14); stn.add(sp); } glowSprite(0, 0, 0, HCN, 0.9, 0.5, stn); }
  const glows = []; for (let i = 0; i < 6; i++) { const s = glowSprite(0, 0.12, 0, 0xffffff, 0.55, 0.7, root); s.visible = false; glows.push(s); }
  const bursts = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; root.add(m); bursts.push({ m, t: 9 }); }
  const burst = (bx, by, col) => { const b = bursts.reduce((a, q) => q.t > a.t ? q : a); const [x, z] = toW(bx, by); b.m.position.x = x; b.m.position.z = z; b.m.material.color.set(col); b.t = 0; };

  // ---- sound: the 2D game's sfx + lounge music, through the station's own mixer (so the station mute applies)
  let bus = null, mStart = 0, mBar = 0;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + dur + 0.02); }
  function sfx(k) { const hz = m => midiHz(m);
    if (k === 'ping') tone(1240, 0.09, 0.03, 'sine'); else if (k === 'route') tone(520, 0.07, 0.035, 'triangle', 760);
    else if (k === 'dock') [0, 7, 12].forEach((s, i) => setTimeout(() => tone(hz(74 + s), 0.15, 0.045, 'triangle'), i * 60));
    else if (k === 'alarm') { tone(240, 0.18, 0.055, 'square', 160); setTimeout(() => tone(240, 0.18, 0.055, 'square', 160), 210); }
    else if (k === 'lost') tone(180, 0.22, 0.05, 'square', 112); else if (k === 'wrong') tone(200, 0.2, 0.055, 'sawtooth', 130);
    else if (k === 'clear') [0, 4, 7, 12].forEach((s, i) => setTimeout(() => tone(hz(72 + s), 0.24, 0.05, 'triangle'), i * 100)); }
  function voice(nt, at) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb, f0 = midiHz(nt.m); let peak = 0.02;
    if (nt.v === 'bass') { o.type = 'triangle'; peak = 0.05; } else if (nt.v === 'stab') { o.type = 'square'; peak = 0.012; } else if (nt.v === 'lead') { o.type = 'sine'; peak = 0.042; } else if (nt.v === 'sparkle') { o.type = 'sine'; peak = 0.016; } else { o.type = 'square'; peak = 0.006; }
    o.frequency.setValueAtTime(f0, at); if (nt.g) o.frequency.linearRampToValueAtTime(midiHz(nt.g), at + dur * 0.75);
    if (nt.v === 'lead') { const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.4; lg.gain.value = f0 * 0.012; lfo.connect(lg); lg.connect(o.frequency); lfo.start(at); lfo.stop(at + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + (nt.v === 'lead' ? 0.05 : 0.014)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); o.connect(g); g.connect(bus); o.start(at); o.stop(at + dur + 0.03); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.8) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- the game (state + rules are the 2D file's, mutated in place instead of through setState)
  let s = null, overlay = 'intro', ending = false, unfold = 0, lastDraw = 0, predictAcc = 0, cardInfo = null;
  function freshWatch(round) { const w = WS[round % WS.length], rand = rng(round * 7717 + 41), live = BERTHS.filter(b => w.berths.includes(b.id));
    const ships = w.ships.map((q, i) => { const p = spawnPoint(q.from, rand), toHub = Math.atan2(HUB.y - p.y, HUB.x - p.x) + (rand() - 0.5) * 0.5;
      return { id: i + 1, x: p.x, y: p.y, hdg: toHub, hull: q.hull, berth: q.berth, speed: HULLS[q.hull].speed, at: q.at, state: 'waiting', path: [], pi: 0, mode: 'in', band: i % 3, orbitR: ORBIT_R[i % 3], theta: 0, dir: orbitDir(i % 3), laps: 0, w: 0, pulse: 0 }; });
    return { round, watch: w, live, ships, beams: (V.beams || []).map(b => ({ a0: b.a, a: b.a, drift: !!b.drift, off: b.off || 0, on: false, warn: false })), scorch: 0, storm: V.storm ? { x: -24, y: 40 + rand() * 50, vx: V.storm.speed, vy: (rand() - 0.5) * 2, r: V.storm.r } : null, t: 0, drawing: null, docked: 0, lost: 0, wrong: 0, alerts: 0, exampleOn: round % 4 === 0, conflicts: [], hitPairs: {}, done: false, card: 1.9 }; }
  const berthAt = (x, y) => s.live.find(b => Math.abs(x - b.x) < 8 && Math.abs(y - b.y) < 6.6);
  const inCircuitAt = (q, t) => q.state === 'drifting' && q.mode === 'orbit' && t <= Math.max(0, (ORBIT_LAPS - q.laps) * 2 * Math.PI / orbitW(q));
  function futureAt(q, t) { const dist = q.speed * t;
    if (q.state === 'flying' && q.path.length) { const r = advanceAlong({ x: q.x, y: q.y }, q.path, q.pi, dist); if (r.done) { const last = q.path[q.path.length - 1], prev = q.path.length > 1 ? q.path[q.path.length - 2] : [q.x, q.y], h = Math.atan2(last[1] - prev[1], last[0] - prev[0]); return { x: last[0] + Math.cos(h) * r.left, y: last[1] + Math.sin(h) * r.left }; } return { x: r.x, y: r.y }; }
    if (q.state === 'drifting' && q.mode === 'orbit') { const w = orbitW(q), remain = Math.max(0, (ORBIT_LAPS - q.laps) * 2 * Math.PI / w), th = q.theta + q.dir * w * Math.min(t, remain), px = HUB.x + Math.cos(th) * q.orbitR, py = HUB.y + Math.sin(th) * q.orbitR; if (t <= remain) return { x: px, y: py }; const h = th + q.dir * Math.PI / 2, d = q.speed * (t - remain); return { x: px + Math.cos(h) * d, y: py + Math.sin(h) * d }; }
    return { x: q.x + Math.cos(q.hdg) * dist, y: q.y + Math.sin(q.hdg) * dist }; }
  function predict(ships) { const mv = ships.filter(q => q.state === 'flying' || q.state === 'drifting'), out = [], step = 0.35;
    for (let i = 0; i < mv.length; i++) for (let j = i + 1; j < mv.length; j++) { const a = mv[i], b = mv[j]; let best = null;
      for (let t = 0; t <= LOOKAHEAD; t += step) { const pa = futureAt(a, t), pb = futureAt(b, t); if (inCircuitAt(a, t) && inCircuitAt(b, t)) continue; const d = Math.hypot(pa.x - pb.x, pa.y - pb.y); if (d < SAFE && (!best || d < best.d)) { best = { d, t, x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 }; if (t < step * 2) break; } }
      if (best) out.push({ a: a.id, b: b.id, x: best.x, y: best.y, t: best.t }); }
    const groups = []; out.sort((p, q) => p.t - q.t).forEach(cf => { const g = groups.find(x => Math.hypot(x.x - cf.x, x.y - cf.y) < 13); if (g) { g.ids[cf.a] = 1; g.ids[cf.b] = 1; return; } groups.push({ x: cf.x, y: cf.y, t: cf.t, ids: { [cf.a]: 1, [cf.b]: 1 } }); });
    return groups.slice(0, 4); }
  function step(dt) { if (s.card > 0) { s.card -= dt; return; } const t = s.t += dt; const laneSpeed = {};
    s.ships.forEach(q => { if (q.state === 'drifting' && q.mode === 'orbit') laneSpeed[q.orbitR] = laneSpeed[q.orbitR] == null ? q.speed : Math.min(laneSpeed[q.orbitR], q.speed); });
    for (const o of s.ships) { if (o.state === 'waiting') { if (t >= o.at) { o.state = 'drifting'; o.pulse = 1; sfx('ping'); } continue; } if (o.state === 'docked' || o.state === 'gone') continue;
      const dist = o.speed * dt;
      if (o.state === 'flying' && o.path.length) { const r = advanceAlong({ x: o.x, y: o.y }, o.path, o.pi, dist); o.x = r.x; o.y = r.y; o.pi = r.i; if (o.path.length > o.pi) o.hdg = Math.atan2(o.path[o.pi][1] - o.y, o.path[o.pi][0] - o.x);
        if (r.done) { const end = o.path[o.path.length - 1], b = berthAt(end[0], end[1]);
          if (b && b.id === o.berth) { o.state = 'docked'; o.x = b.x; o.y = b.y; s.docked++; sfx('dock'); burst(b.x, b.y, INKT[b.id]); continue; }
          if (b) { o.state = 'drifting'; o.path = []; o.pi = 0; o.mode = 'in'; o.wrongT = 1.6; s.wrong++; sfx('wrong'); continue; }
          o.state = 'drifting'; o.path = []; o.pi = 0; o.mode = 'in'; } }
      else if (o.mode === 'orbit') { const lane = laneSpeed[o.orbitR], w = Math.min(o.speed, lane == null ? o.speed : lane) / o.orbitR; o.w = w; o.theta += o.dir * w * dt; o.laps += w * dt / (2 * Math.PI); o.x = HUB.x + Math.cos(o.theta) * o.orbitR; o.y = HUB.y + Math.sin(o.theta) * o.orbitR; o.hdg = o.theta + o.dir * Math.PI / 2; if (o.laps >= ORBIT_LAPS) o.mode = 'out'; }
      else { o.x += Math.cos(o.hdg) * dist; o.y += Math.sin(o.hdg) * dist;
        if (o.mode === 'in' && Math.hypot(o.x - HUB.x, o.y - HUB.y) <= o.orbitR) { let r = o.orbitR, band = o.band; const th = Math.atan2(o.y - HUB.y, o.x - HUB.x);
          for (let k = 0; k < 3; k++) { const cand = ORBIT_R[(band + k) % 3], busy = s.ships.some(q => q.id !== o.id && q.state === 'drifting' && q.mode === 'orbit' && q.orbitR === cand && Math.abs(Math.atan2(Math.sin(q.theta - th), Math.cos(q.theta - th))) < 0.6); if (!busy) { r = cand; band = (band + k) % 3; break; } }
          o.orbitR = r; o.band = band; o.dir = orbitDir(band); o.theta = th; o.laps = 0; o.mode = 'orbit'; o.w = Math.min(o.speed, laneSpeed[r] == null ? o.speed : laneSpeed[r]) / r; o.x = HUB.x + Math.cos(th) * r; o.y = HUB.y + Math.sin(th) * r; o.hdg = th + o.dir * Math.PI / 2; } }
      if (o.x < PLOT.x0 - 8 || o.x > PLOT.x1 + 8 || o.y < PLOT.y0 - 8 || o.y > PLOT.y1 + 8) { o.state = 'gone'; s.lost++; sfx('lost'); } }
    const fl = q => q.state === 'flying' || q.state === 'drifting';
    for (let i = 0; i < s.ships.length; i++) for (let j = i + 1; j < s.ships.length; j++) { const a = s.ships[i], b = s.ships[j]; if (!fl(a) || !fl(b)) continue; if (a.state === 'drifting' && a.mode === 'orbit' && b.state === 'drifting' && b.mode === 'orbit') continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < SAFE * 0.62) { const k = a.id + '-' + b.id; if (!s.hitPairs[k]) { s.hitPairs[k] = 1; s.alerts++; sfx('alarm'); } } }
    if (s.beams.length) { const cyc = V.cycle || 7; for (const b of s.beams) { if (b.drift) b.a = b.a0 + 0.12 * Math.sin(t * 0.35); const ph = (t + b.off) % cyc; b.on = ph < 3.2; b.warn = !b.on && ph > cyc - 1.4; }
      for (const q of s.ships) { if (q.state !== 'flying') { q.inBeam = false; continue; } const dx = q.x - HUB.x, dy = q.y - HUB.y; let hit = false; if (Math.hypot(dx, dy) > 9) for (const b of s.beams) if (b.on && Math.abs(-Math.sin(b.a) * dx + Math.cos(b.a) * dy) < 4.5) hit = true;
        if (hit && !q.inBeam) { s.scorch++; q.scorchT = 1.4; sfx('alarm'); } q.inBeam = hit; } }
    if (s.storm) { const st = s.storm; st.x += st.vx * dt; st.y += st.vy * dt; if (st.x > 224) { st.x = -24; st.y = 30 + Math.random() * 70; st.vy = (Math.random() - 0.5) * 2; }
      for (const q of s.ships) { if (q.state !== 'flying') { q.inStorm = false; continue; } const hit = Math.hypot(q.x - st.x, q.y - st.y) < st.r; if (hit && !q.inStorm) { s.scorch++; q.scorchT = 1.4; sfx('alarm'); } q.inStorm = hit; } }
    predictAcc += dt; if (predictAcc > 0.18) { predictAcc = 0; s.conflicts = predict(s.ships); }
    if (s.ships.every(x => x.state !== 'waiting') && s.ships.every(x => x.state === 'docked' || x.state === 'gone')) { s.done = true; sfx('clear'); setTimeout(() => { if (s && s.done) finish(); }, 1200); } }
  function scoreOf() { const tot = s.ships.length, arrivals = Math.round(s.docked / tot * 100), safety = clamp(100 - s.alerts * 22 - s.wrong * 9 - (s.scorch || 0) * 12, 0, 100); return { arrivals, safety, score: Math.round(arrivals * 0.6 + safety * 0.4) }; }
  function finish() { const { arrivals, safety, score } = scoreOf(), w = s.watch, stars = score >= 92 ? 3 : score >= 78 ? 2 : score >= 60 ? 1 : 0, gold = [0, 10, 20, 30][stars];
    const best = save.stat(P + 'Best', 0), isBest = save.best(P + 'Best', score); if (gold) save.addGold(gold); save.setStat(P + 'Watches', save.stat(P + 'Watches', 0) + 1); if (!save.flag(P + 'Done')) save.setFlag(P + 'Done');
    const notes = []; if (s.lost) notes.push(s.lost + ' ship' + (s.lost > 1 ? 's' : '') + ' drifted off the plot unrouted.'); if (s.alerts) notes.push(s.alerts + ' loss of separation: two ships inside the safety ring.'); if (s.wrong) notes.push(s.wrong + ' course ended at the wrong berth and was turned away.'); if (s.scorch) notes.push(s.scorch + ' ship' + (s.scorch > 1 ? 's' : '') + (V.hazardNote || ' flew through a lit mirror beam.')); if (!notes.length) notes.push('Every ship berthed, separation held throughout.');
    const last = s.round + 1 >= 4; overlay = 'card';
    cardInfo = { kicker: last ? 'Watch over · ' + w.name : w.name + ' · relieved', title: score + ' / 100', mood: score >= 92 ? 'A clean watch.' : score >= 78 ? 'Well handled.' : score >= 60 ? 'Traffic got away from you once or twice.' : 'OPS will want a word.',
      stars, best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(best, score), gold: gold ? '+' + gold + ' G' : '',
      rows: [['Arrivals', arrivals], ['Separation', safety]].map(([name, val]) => ({ name, val: val + '', pct: val + '%', color: val >= 75 ? '#8fe38f' : val >= 45 ? '#ffd23a' : '#ec3013' })), notes, buttons: [last ? 'TAKE THE WATCH AGAIN' : 'NEXT WATCH', 'LEAVE THE BOARD'] }; }

  // ---- drawing
  const hullPath = {}; for (const k in HULLS) hullPath[k] = new Path2D(HULLS[k].d);
  const inkOf = id => INKT[id] || HC;
  function text(t, x, y, size, col, align = 'left', w = 900) { c.font = `${w} ${size * S}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col;
    // s363 portrait: the radar is turned to fill the phone, so each label turns back to read upright
    if (portrait()) { c.save(); c.translate(x * S, y * S); c.rotate(Math.PI / 2); c.fillText(t, 0, 0); c.restore(); } else c.fillText(t, x * S, y * S); }
  function draw(T) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH);
    c.fillStyle = V.bg || 'rgba(4,12,22,0.86)'; c.fillRect(0, 0, CW, CH);
    c.save(); c.scale(S, S);
    // grid, sweep, border
    c.strokeStyle = 'rgba(' + HCR + ',0.12)'; c.lineWidth = 0.25; c.beginPath(); for (let x = 20; x < 200; x += 20) { c.moveTo(x, 0); c.lineTo(x, 140); } for (let yy = 14; yy < 140; yy += 18) { c.moveTo(0, yy); c.lineTo(200, yy); } c.stroke();
    { const a = T * 0.9; const g = c.createConicGradient ? c.createConicGradient(a, HUB.x, HUB.y) : null; if (g) { g.addColorStop(0, 'rgba(' + HCR + ',0.16)'); g.addColorStop(0.08, 'rgba(' + HCR + ',0)'); g.addColorStop(1, 'rgba(' + HCR + ',0)'); c.fillStyle = g; c.beginPath(); c.arc(HUB.x, HUB.y, 70, 0, 6.283); c.fill(); } }
    c.strokeStyle = HC; c.lineWidth = 0.5; c.strokeRect(PLOT.x0, PLOT.y0, PLOT.x1 - PLOT.x0, PLOT.y1 - PLOT.y0);
    c.lineWidth = 1.4; for (const [x, yy, dx, dy] of [[PLOT.x0, PLOT.y0, 1, 1], [PLOT.x1, PLOT.y0, -1, 1], [PLOT.x1, PLOT.y1, -1, -1], [PLOT.x0, PLOT.y1, 1, -1]]) { c.beginPath(); c.moveTo(x + dx * 8, yy); c.lineTo(x, yy); c.lineTo(x, yy + dy * 8); c.stroke(); }
    c.restore();
    const PR = portrait(); if (!PR) text(TITLE + ' · ' + (s ? s.watch.name.toUpperCase() : ''), 8, 6, 4.2, HC);
    if (s && !PR) { const sc = scoreOf(); text('DOCKED ' + s.docked + '/' + s.ships.length + '   ALERTS ' + s.alerts, 192, 6, 4.2, s.alerts ? '#ff6a4a' : '#f3f2f2', 'right'); void sc; }
    c.save(); c.scale(S, S);
    // holding circuits
    c.setLineDash([1.6, 2.2]); c.lineWidth = 0.35; ORBIT_R.forEach((r, i) => { c.strokeStyle = `rgba(255,180,84,${0.28 + 0.06 * Math.sin(T * 2 + i)})`; c.beginPath(); c.arc(HUB.x, HUB.y, r, 0, 6.283); c.stroke(); }); c.setLineDash([]);
    if (s && s.beams.length) for (const b of s.beams) { const ca = Math.cos(b.a), sa = Math.sin(b.a), L = 150, nx = -sa * 4.5, ny = ca * 4.5, x0 = HUB.x - ca * L, y0 = HUB.y - sa * L, x1 = HUB.x + ca * L, y1 = HUB.y + sa * L;
      if (b.on) { c.fillStyle = 'rgba(255,196,90,' + (0.2 + 0.06 * Math.sin(T * 10)) + ')'; c.beginPath(); c.moveTo(x0 + nx, y0 + ny); c.lineTo(x1 + nx, y1 + ny); c.lineTo(x1 - nx, y1 - ny); c.lineTo(x0 - nx, y0 - ny); c.closePath(); c.fill(); }
      c.strokeStyle = b.on ? 'rgba(255,214,120,0.85)' : b.warn ? (Math.sin(T * 14) > 0 ? 'rgba(255,214,120,0.9)' : 'rgba(255,214,120,0.15)') : 'rgba(255,214,120,0.16)'; c.lineWidth = b.on ? 0.6 : 0.45; if (!b.on) c.setLineDash([2, 2]);
      c.beginPath(); c.moveTo(x0 + nx, y0 + ny); c.lineTo(x1 + nx, y1 + ny); c.moveTo(x0 - nx, y0 - ny); c.lineTo(x1 - nx, y1 - ny); c.stroke(); c.setLineDash([]); }
    if (s && s.storm) { const st = s.storm, gr = c.createRadialGradient(st.x, st.y, 1, st.x, st.y, st.r); gr.addColorStop(0, 'rgba(208,138,74,0.42)'); gr.addColorStop(0.7, 'rgba(208,138,74,0.22)'); gr.addColorStop(1, 'rgba(208,138,74,0)'); c.fillStyle = gr; c.beginPath(); c.arc(st.x, st.y, st.r, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(255,200,140,0.7)'; for (let i = 0; i < 18; i++) { const a = i * 2.4 + T * (0.6 + (i % 3) * 0.3), rr = (i * 7.3 % st.r); c.fillRect(st.x + Math.cos(a) * rr, st.y + Math.sin(a) * rr, 0.8, 0.8); }
      c.strokeStyle = 'rgba(255,170,100,0.6)'; c.lineWidth = 0.4; c.setLineDash([1.5, 1.5]); c.beginPath(); c.arc(st.x, st.y, st.r, 0, 6.283); c.stroke(); c.setLineDash([]); }
    // hub
    c.strokeStyle = HC; c.lineWidth = 0.6; c.beginPath(); c.arc(HUB.x, HUB.y, 6.4, 0, 6.283); c.stroke();
    if (s) {
      // berths
      for (const b of s.live) { const taken = s.ships.some(q => q.state === 'docked' && q.berth === b.id), ink = inkOf(b.id), ang = Math.atan2(b.y - HUB.y, b.x - HUB.x);
        c.strokeStyle = ink; c.globalAlpha = 0.55; c.lineWidth = 1.1; c.beginPath(); c.moveTo(HUB.x + Math.cos(ang) * 6.4, HUB.y + Math.sin(ang) * 6.4); c.lineTo(b.x, b.y); c.stroke(); c.globalAlpha = 1;
        c.fillStyle = ink; c.globalAlpha = taken ? 0.85 : 0.18 + 0.08 * Math.sin(T * 3); c.fillRect(b.x - 7, b.y - 5.6, 14, 11.2); c.globalAlpha = 1; c.lineWidth = 0.6; c.strokeRect(b.x - 7, b.y - 5.6, 14, 11.2);
        c.restore(); text(b.id, b.x, b.y + 0.3, 6.4, taken ? '#0a1018' : ink, 'center'); c.save(); c.scale(S, S); }
      // routes + the course being drawn
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const q of s.ships) { if (q.state !== 'flying' || !q.path.length) continue; const ink = inkOf(q.berth); c.strokeStyle = ink; c.shadowColor = ink; c.shadowBlur = LOW ? 0 : 6; c.lineWidth = 1.1; c.beginPath(); c.moveTo(q.x, q.y); for (let i = q.pi; i < q.path.length; i++) c.lineTo(q.path[i][0], q.path[i][1]); c.stroke(); c.shadowBlur = 0; const e = q.path[q.path.length - 1]; c.fillStyle = ink; c.beginPath(); c.arc(e[0], e[1], 1.3, 0, 6.283); c.fill(); }
      if (s.drawing && s.drawing.pts.length > 1) { const q = s.ships.find(x => x.id === s.drawing.id), ink = q ? inkOf(q.berth) : '#8fd6bf'; c.strokeStyle = ink; c.lineWidth = 1.3; c.setLineDash([2.2, 1.6]); c.lineDashOffset = -T * 12; c.beginPath(); s.drawing.pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.setLineDash([]); }
      // the example course + a finger, until the first drag
      if (s.exampleOn && !s.drawing && s.card <= 0) { const q = s.ships.find(x => x.state === 'drifting'), b = q && BERTHS.find(x => x.id === q.berth);
        if (q && b) { const dx = b.x - q.x, dy = b.y - q.y, len = Math.hypot(dx, dy) || 1, mx = (q.x + b.x) / 2, my = (q.y + b.y) / 2, p1 = { x: mx - dy / len * 24, y: my + dx / len * 24 }, p2 = { x: mx + dy / len * 24, y: my - dx / len * 24 }, aw = Math.hypot(p1.x - HUB.x, p1.y - HUB.y) > Math.hypot(p2.x - HUB.x, p2.y - HUB.y) ? p1 : p2;
          c.strokeStyle = 'rgba(243,242,242,0.75)'; c.lineWidth = 0.8; c.setLineDash([2, 2]); c.lineDashOffset = -T * 10; c.beginPath(); c.moveTo(q.x, q.y); c.quadraticCurveTo(aw.x, aw.y, b.x, b.y); c.stroke(); c.setLineDash([]);
          const u = (T * 0.45) % 1, iu = 1 - u, hx = iu * iu * q.x + 2 * iu * u * aw.x + u * u * b.x, hy = iu * iu * q.y + 2 * iu * u * aw.y + u * u * b.y;
          c.fillStyle = 'rgba(243,242,242,0.9)'; c.beginPath(); c.arc(hx, hy, 2.4, 0, 6.283); c.fill(); c.strokeStyle = '#ec3013'; c.lineWidth = 0.8; c.beginPath(); c.arc(hx, hy, 3.6 + Math.sin(T * 6) * 0.6, 0, 6.283); c.stroke();
          c.restore(); const lx = clamp(aw.x, 30, 170), ly = clamp(aw.y + (aw.y > HUB.y ? 8 : -8), 18, 116); text('DRAG FROM THE SHIP TO ITS BERTH', lx, ly, 3.6, '#f3f2f2', 'center'); c.save(); c.scale(S, S); } }
      // ships
      for (const q of s.ships) { if (q.state === 'waiting' || q.state === 'gone') continue; const ink = q.state === 'docked' ? '#9aa4a8' : inkOf(q.berth), cf = s.conflicts.some(k => k.ids && k.ids[q.id]);
        c.save(); c.translate(q.x, q.y);
        if (q.state !== 'docked') { c.strokeStyle = cf ? '#ff4a2a' : ink; c.globalAlpha = cf ? 0.6 + 0.4 * Math.abs(Math.sin(T * 8)) : 0.35; c.lineWidth = cf ? 0.8 : 0.45; c.beginPath(); c.arc(0, 0, SAFE * 0.5, 0, 6.283); c.stroke(); c.globalAlpha = 1;
          if (q.state === 'drifting') { const k = (T * 1.3 + q.id * 0.3) % 1; c.strokeStyle = ink; c.globalAlpha = 1 - k; c.lineWidth = 0.4; c.beginPath(); c.arc(0, 0, SAFE * 0.5 + k * 5, 0, 6.283); c.stroke(); c.globalAlpha = 1; }
          if (q.pulse > 0) { c.strokeStyle = '#f3f2f2'; c.globalAlpha = q.pulse; c.lineWidth = 0.6; c.beginPath(); c.arc(0, 0, 4 + (1 - q.pulse) * 14, 0, 6.283); c.stroke(); c.globalAlpha = 1; } }
        c.rotate(q.hdg + Math.PI / 2); c.fillStyle = ink; c.shadowColor = ink; c.shadowBlur = LOW ? 0 : 5; c.fill(hullPath[q.hull]); c.shadowBlur = 0; c.strokeStyle = '#0a1018'; c.lineWidth = 0.35; c.stroke(hullPath[q.hull]);
        c.restore();
        if (q.state !== 'docked') { c.restore(); const tag = q.scorchT > 0 ? (V.hazardWord || 'SCORCHED') : q.wrongT > 0 ? 'WRONG BERTH' : q.mode === 'orbit' && q.state === 'drifting' ? q.berth + ' · ' + Math.min(3, Math.floor(q.laps) + 1) + '/3' : q.berth + ' · ' + TAG(q.hull); text(tag, q.x, q.y + 8.4, 3.3, q.wrongT > 0 || q.scorchT > 0 ? '#ff6a4a' : ink, 'center'); c.save(); c.scale(S, S); } }
      // conflicts
      for (const k of s.conflicts) { const x = clamp(k.x, 12, 188), yy = clamp(k.y, 18, 112), p = 0.5 + 0.5 * Math.sin(T * 9); c.strokeStyle = '#ff4a2a'; c.lineWidth = 0.9; c.globalAlpha = 0.6 + 0.4 * p; c.beginPath(); c.moveTo(x - 3, yy - 3); c.lineTo(x + 3, yy + 3); c.moveTo(x + 3, yy - 3); c.lineTo(x - 3, yy + 3); c.stroke(); c.beginPath(); c.arc(x, yy, 5 + p, 0, 6.283); c.stroke(); c.globalAlpha = 1;
        c.restore(); text(k.t < 0.6 ? 'NOW' : Math.ceil(k.t) + 's', x, yy - 8.5, 3.6, '#ff6a4a', 'center'); c.save(); c.scale(S, S); }
    }
    c.restore();
    // title card across the plot
    if (s && s.card > 0 && !PR) { const a = Math.min(1, s.card * 2, (1.9 - s.card) * 4); c.globalAlpha = a; c.fillStyle = 'rgba(4,12,22,0.92)'; c.fillRect(0, CH * 0.36, CW, CH * 0.28); c.fillStyle = '#ec3013'; c.fillRect(0, CH * 0.36, CW, 4); c.fillRect(0, CH * 0.64 - 4, CW, 4);
      text('WATCH ' + (s.round % 4 + 1) + ' OF 4', 12, 58, 4, '#ec3013'); text(s.watch.name.toUpperCase(), 12, 69, 11, '#f3f2f2'); text(s.live.length + ' berths · ' + s.ships.length + ' inbound', 12, 81, 4.4, HC, 'left', 700); c.globalAlpha = 1; }
    tex.needsUpdate = true; }

  function newWatch(round) { s = freshWatch(round); overlay = null; ending = false; cardInfo = null; predictAcc = 0; }
  return {
    title: TITLE, where: V.where || 'Ops · CDR. KORRA', W: 200, H: 140,
    surface: { c: new THREE.Vector3(ox + at.x, baseY + y, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: V.maxD || 5.2, maxY: baseY + (V.maxY || 7.8) },
    stand: { x: ox + at.x, z: at.z + (V.standZ || 4.4), face: Math.PI }, _s: () => s,
    begin() { root.visible = true; unfold = 0; ending = false; overlay = 'intro'; s = freshWatch(save.stat(P + 'Round', 0) % 4); s.card = 0; draw(0); },
    end() { ending = true; killMusic(); if (s) save.setStat(P + 'Round', s.done ? s.round + 1 : s.round); },
    tick(dt, T, fly) { unfold = ending ? Math.max(0, unfold - dt / 0.5) : Math.min(1, unfold + dt / 0.7); const k = unfold * unfold * (3 - 2 * unfold);
      root.scale.set(Math.max(0.001, k), 1, Math.max(0.001, Math.min(1, k * 1.4))); plate.material.opacity = k; root.visible = unfold > 0.001;
      stn.rotation.y += dt * 0.6; stn.position.y = 0.14 + Math.sin(T * 1.6) * 0.03;
      if (fly > 0.85 && !ending && overlay === null && s && !s.done) { step(dt); music(); } else if (overlay !== null || ending) killMusic();
      if (s) for (const q of s.ships) { if (q.pulse > 0) q.pulse = Math.max(0, q.pulse - dt * 1.2); if (q.wrongT > 0) q.wrongT -= dt; if (q.scorchT > 0) q.scorchT -= dt; }
      let gi = 0; if (s) for (const q of s.ships) { if (gi >= glows.length) break; if (q.state === 'waiting' || q.state === 'gone' || q.state === 'docked') continue; const g = glows[gi++], [x, z] = toW(q.x, q.y); g.visible = true; g.position.set(x, 0.1 + Math.sin(T * 3 + q.id) * 0.03, z); g.material.color.set(inkOf(q.berth)); }
      for (; gi < glows.length; gi++) glows[gi].visible = false;
      for (const b of bursts) { if (b.t > 1.2) { b.m.material.opacity = 0; continue; } b.t += dt; const u = b.t / 1.2; b.m.scale.setScalar(0.1 + u * 0.9); b.m.material.opacity = (1 - u) * 0.9; }
      frameM.opacity = (0.6 + 0.3 * Math.sin(T * 2)) * k;
      if (T - lastDraw > (LOW ? 1 / 24 : 1 / 40) || !lastDraw) { lastDraw = T; if (root.visible) draw(T); }
      if (!root.visible && ending) { /* folded away */ } },
    down(x, y) { if (overlay || !s || s.done || s.card > 0) return; let pick = null, best = 12; for (const q of s.ships) { if (q.state !== 'drifting' && q.state !== 'flying') continue; const d = Math.hypot(x - q.x, y - q.y); if (d < best) { best = d; pick = q; } } if (!pick) return; sfx('route'); s.exampleOn = false; s.drawing = { id: pick.id, pts: [[pick.x, pick.y]] }; },
    move(x, y) { if (!s || !s.drawing) return; const pts = s.drawing.pts, last = pts[pts.length - 1]; if (Math.hypot(x - last[0], y - last[1]) < 3.2) return; pts.push([clamp(x, PLOT.x0, PLOT.x1), clamp(y, PLOT.y0, PLOT.y1)]); },
    up() { if (!s || !s.drawing) return; const d = s.drawing; s.drawing = null; if (d.pts.length < 2) return; const end = d.pts[d.pts.length - 1], b = s.live.find(x => Math.hypot(end[0] - x.x, end[1] - x.y) < 11), pts = b ? d.pts.slice(0, -1).concat([[b.x, b.y]]) : d.pts; const q = s.ships.find(x => x.id === d.id); if (q && (q.state === 'drifting' || q.state === 'flying')) { q.state = 'flying'; q.path = pts.slice(1); q.pi = 0; } },
    hud() { if (overlay === 'intro') return { card: { kicker: V.kicker || 'Ops · Cdr. Korra', title: V.cardTitle || 'Docking Control', body: V.body || 'Ships hold in a circuit for three laps, then leave. Drag from a ship to draw its course, and finish on the berth in its own colour. Keep them out of each other\u2019s rings.', buttons: ['TAKE THE WATCH', 'NOT NOW'] } };
      if (overlay === 'card' && cardInfo) return { card: cardInfo };
      if (!s) return {}; if (portrait()) return { where: s.card > 0 ? 'WATCH ' + (s.round % 4 + 1) + ' · ' + s.watch.name + ' · ' + s.live.length + ' berths, ' + s.ships.length + ' inbound' : 'DRAG FROM A SHIP TO THE BERTH IN ITS COLOUR · KEEP THEM APART', showStats: true, stats: [['Watch', (s.round % 4 + 1) + ' of 4'], ['Docked', s.docked + '/' + s.ships.length], ['Alerts', s.alerts + '', s.alerts ? '#ec3013' : null]] };
      return { stats: [['Watch', (s.round % 4 + 1) + ' of 4'], ['Docked', s.docked + '/' + s.ships.length], ['Alerts', s.alerts + '']], alert: s.alerts > 0 }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); newWatch(s ? s.round : 0); } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) newWatch(s.round + 1); else return 'leave'; } },
  };
}
