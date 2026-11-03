// CONDUIT DECK (s356): Ben's 2D game (minigames/dsf/logic/conduit-deck.js) played IN ENGINEERING, rules 1:1
// (6 x 5 grid, straight + elbow pipes, 3 lines POWER / COOLANT / AIR, 4 panels, par, efficiency score).
// In 3D: a junction pit in the floor beside the main core. Two hazard deck plates drop and slide under the floor,
// the real pipe tiles sit in the pit, tap one and it lifts and turns; fluid glows through every connected run in a
// travelling wave, outlet lamps on the east wall light per line, and solving the panel makes the main core surge.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const COLS = 6, ROWS = 5, CELL = 19, X0 = 42, Y0 = 22, HALF = CELL / 2;
const cx = c => X0 + c * CELL + HALF, cy = r => Y0 + r * CELL + HALF;
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const LINES = [
  { key: 'power', name: 'POWER', dim: '#6b5a2c', ink: '#d9a84e', spark: '#f6e3b4' },
  { key: 'coolant', name: 'COOLANT', dim: '#2f5a4c', ink: '#6f9d86', spark: '#cfe8dc' },
  { key: 'air', name: 'AIR', dim: '#33506b', ink: '#6e8fb8', spark: '#d2e2f2' }];
const BASE = { straight: [0, 2], elbow: [0, 1] };
const openingsOf = (type, rot) => BASE[type].map(d => (d + rot) % 4);
const ROUNDS = [
  { lines: [0], starts: [2], ends: [2], wander: 3.6, minLen: 9, sys: 'Galley power feed' },
  { lines: [0, 1], starts: [1, 3], ends: [0, 4], wander: 3, minLen: 7, sys: 'Reactor coolant loop' },
  { lines: [0, 1, 2], starts: [0, 2, 4], ends: [1, 2, 3], wander: 2.4, sys: 'Habitat ring trunk' },
  { lines: [0, 1, 2], starts: [0, 2, 4], ends: [2, 3, 4], wander: 2.8, sys: 'Dock umbilical spine' }];
function rng(seed) { let s = seed + 0x6d2b79f5; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function routeLine(taken, sr, er, rand, wander) { const goal = [COLS - 1, er], path = [], seen = {};
  function walk(c, r) { path.push([c, r]); seen[c + ',' + r] = true; if (c === goal[0] && r === goal[1]) return true;
    const dirs = [0, 1, 2, 3].map(d => { const nc = c + DX[d], nr = r + DY[d]; const ok = nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !taken[nc + ',' + nr] && !seen[nc + ',' + nr]; const h = Math.abs(goal[0] - nc) + Math.abs(goal[1] - nr); return { d, nc, nr, ok, w: h + rand() * (wander || 2.6) }; }).filter(x => x.ok).sort((a, b) => a.w - b.w);
    for (const x of dirs) if (walk(x.nc, x.nr)) return true; path.pop(); delete seen[c + ',' + r]; return false; }
  if (taken['0,' + sr]) return null; return walk(0, sr) ? path : null; }
function piecesFromPath(path, lineIdx) { const out = [];
  for (let i = 0; i < path.length; i++) { const [c, r] = path[i], ds = [];
    if (i === 0) ds.push(3); else ds.push([0, 1, 2, 3].find(d => path[i - 1][0] === c + DX[d] && path[i - 1][1] === r + DY[d]));
    if (i === path.length - 1) ds.push(1); else ds.push([0, 1, 2, 3].find(d => path[i + 1][0] === c + DX[d] && path[i + 1][1] === r + DY[d]));
    if (ds[0] == null || ds[1] == null || ds[0] === ds[1]) return null; const type = (ds[0] + 2) % 4 === ds[1] ? 'straight' : 'elbow'; let rot = null;
    for (let k = 0; k < 4; k++) { const o = openingsOf(type, k); if (o.includes(ds[0]) && o.includes(ds[1])) { rot = k; break; } } if (rot == null) return null; out.push({ c, r, type, rot, line: lineIdx }); }
  return out; }
function turnsNeeded(p) { const d = (p.correct - p.rot + 4) % 4; return p.type === 'straight' ? Math.min(d, (d + 2) % 4) : d; }
function buildPuzzle(round, parallel) { const cfg = ROUNDS[round % ROUNDS.length], ends = parallel ? cfg.starts : cfg.ends;
  for (let seed = 1; seed < 400; seed++) { const rand = rng(seed + round * 977), taken = {}, pieces = []; let ok = true;
    for (let i = 0; i < cfg.lines.length; i++) { const path = routeLine(taken, cfg.starts[i], ends[i], rand, cfg.wander); if (!path || path.length < (parallel ? 3 : cfg.minLen || 3)) { ok = false; break; }
      const pcs = piecesFromPath(path, cfg.lines[i]); if (!pcs) { ok = false; break; } pcs.forEach(p => { taken[p.c + ',' + p.r] = true; pieces.push(p); }); }
    if (!ok) continue;
    const scrambled = pieces.map(p => { let rot = Math.floor(rand() * 4); if (rot === p.rot && rand() < 0.8) rot = (rot + 1 + Math.floor(rand() * 3)) % 4; return Object.assign({}, p, { rot, correct: p.rot }); });
    const par = scrambled.reduce((a, p) => a + turnsNeeded(p), 0); if (par < 3) continue;
    return { pieces: scrambled, cfg: parallel ? Object.assign({}, cfg, { ends: cfg.starts }) : cfg, par }; }
  return parallel ? null : buildPuzzle(round, true); }
// the 2D game's patient puzzle loop: soft plucks in dorian over a low pulse
const MUSIC = (() => { const notes = [], chords = [[45, 52, 57], [43, 50, 55], [41, 48, 53], [45, 52, 59]];
  chords.forEach((ch, s) => { const at = s * 8; notes.push({ b: at, m: ch[0] - 12, d: 7.4, v: 'bass' }); ch.forEach((m, i) => notes.push({ b: at + i * 0.5, m, d: 6.6, v: 'pad' }));
    [0.5, 2, 3.5, 5, 6.5].forEach((off, i) => notes.push({ b: at + off, m: ch[(i + 1) % 3] + 12, d: 1.4, v: 'lead' })); });
  [7.5, 15.5, 23.5, 31.5].forEach(b => notes.push({ b, m: 81, d: 1.6, v: 'bell' })); return { notes, beats: 32, spb: 0.5 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeConduit(K, { group, OX, at, eng, audio, save, LOW, portrait = () => false, theme: V = {} }) {
  const { THREE, basic, glowSprite, toon } = K;
  // s473 per-station versions: V = { title, where, kicker, body, lines:[{name,dim,ink,spark}], sysNames, deck, deckSub, amber, stat, heat:[rate per panel] (heat creep twist) }
  const LN = V.lines || LINES, P = V.stat || 'dsfConduit', SYS = r => (V.sysNames && V.sysNames[r % 4]) || null;
  const PW = 4.4, PH = PW * 0.7, U = PW / 200, CS = CELL * U, HW = at.hw, HD = at.hd, YS = -0.33, YF = -0.46;
  const toW = (px, py) => [(px / 200 - 0.5) * PW, (py / 140 - 0.5) * PH];
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); group.add(root);
  const B = (w, h, d, mat, x, y, z, p = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); p.add(m); return m; };
  const tx = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const steel = toon('#3a4440'), dark = toon('#141a16'), red = '#ec3013', AMBER = V.amber || '#e0b020';
  // ---- the pit: floor, walls (tops stop short of the deck so the plates slide over them), amber strip lights
  const pit = new THREE.Group(); root.add(pit); pit.visible = false;
  B(HW * 2, 0.06, HD * 2, dark, 0, -0.63, 0, pit);
  B(HW * 2, 0.46, 0.08, steel, 0, -0.37, -HD + 0.04, pit); B(HW * 2, 0.46, 0.08, steel, 0, -0.37, HD - 0.04, pit);
  for (const s of [-1, 1]) B(0.08, 0.46, HD * 2, steel, s * (HW - 0.04), -0.37, 0, pit);
  const stripM = new THREE.MeshBasicMaterial({ color: 0xe0b020, toneMapped: false });
  B(HW * 2 - 0.2, 0.03, 0.02, stripM, 0, -0.19, -HD + 0.09, pit); B(HW * 2 - 0.2, 0.03, 0.02, stripM, 0, -0.19, HD - 0.09, pit);
  // the board floor: a canvas (grid, port labels, panel name, turns) under the tiles
  const CW = LOW ? 800 : 1100, CH = Math.round(CW * 0.7), S = CW / 200; const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d'); const tex = tx(cv);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = YF; pit.add(m);
    const sk = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2 - 0.16, HD * 2 - 0.16), new THREE.MeshBasicMaterial({ color: 0x0a120c })); sk.rotation.x = -Math.PI / 2; sk.position.y = YF - 0.01; pit.add(sk); }
  // ---- the hazard rim round the hole + 4 corner beacons
  { const hz = tx(canvas(512, 32, (cc, w, h) => { for (let i = 0; i < 32; i++) { cc.fillStyle = i % 2 ? '#1a1a1a' : AMBER; cc.beginPath(); cc.moveTo(i * 16, 0); cc.lineTo(i * 16 + 16, 0); cc.lineTo(i * 16 + 32, h); cc.lineTo(i * 16 + 16, h); cc.fill(); } })); hz.wrapS = THREE.RepeatWrapping;
    const rimM = new THREE.MeshBasicMaterial({ map: hz, toneMapped: false }), rw = 0.16;
    for (const [w, x, z, ry] of [[HW * 2 + rw * 2, 0, -HD - rw / 2, 0], [HW * 2 + rw * 2, 0, HD + rw / 2, 0], [HD * 2, -HW - rw / 2, 0, Math.PI / 2], [HD * 2, HW + rw / 2, 0, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, rw), rimM); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x, 0.012, z); root.add(m); } }
  const beacons = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.06, 10), new THREE.MeshBasicMaterial({ color: 0xe0b020, transparent: true, toneMapped: false })); b.position.set(sx * (HW + 0.08), 0.03, sz * (HD + 0.08)); root.add(b); beacons.push([b, glowSprite(sx * (HW + 0.08), 0.12, sz * (HD + 0.08), 0xffc040, 0.5, 0, root)]); }
  // ---- the deck plates: diamond tread, hazard border, CONDUIT DECK stencil across both
  const plates = []; { const pc = canvas(1024, Math.round(1024 * HD / HW), (cc, w, h) => { cc.fillStyle = '#2c3430'; cc.fillRect(0, 0, w, h); cc.fillStyle = '#3a4440';
      for (let y = 10; y < h; y += 28) for (let x = (y / 28 % 2) * 14 + 6; x < w; x += 28) { cc.save(); cc.translate(x, y); cc.rotate(0.6); cc.fillRect(-7, -2, 14, 4); cc.restore(); }
      cc.strokeStyle = AMBER; cc.lineWidth = 18; cc.strokeRect(9, 9, w - 18, h - 18); cc.fillStyle = '#1a1a1a'; cc.fillRect(w / 2 - 4, 0, 8, h);
      cc.fillStyle = AMBER; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.font = `900 ${Math.round(h * 0.2)}px ${FONT}`; cc.fillText(V.deck || 'CONDUIT DECK', w / 2, h * 0.42); cc.font = `900 ${Math.round(h * 0.1)}px ${FONT}`; cc.fillStyle = '#f3f2f2'; cc.fillText(V.deckSub || 'JUNCTION 8 · KEEP CLEAR', w / 2, h * 0.66); });
    for (const s of [-1, 1]) { const t = tx(pc); t.repeat.set(0.5, 1); t.offset.set(s < 0 ? 0 : 0.5, 0); const pg = new THREE.Group(); root.add(pg);
      B(HW - 0.01, 0.04, HD * 2, steel, 0, 0, 0, pg); const top = new THREE.Mesh(new THREE.PlaneGeometry(HW - 0.01, HD * 2), toon('#ffffff', { map: t })); top.rotation.x = -Math.PI / 2; top.position.y = 0.021; pg.add(top); plates.push({ g: pg, s }); } }
  const placePlates = k => { const d = clamp(k / 0.25, 0, 1), sl = clamp((k - 0.25) / 0.75, 0, 1), e = sl * sl * (3 - 2 * sl);
    for (const p of plates) { p.g.position.set(p.s * (HW / 2 + e * (HW + 0.1)), -0.02 - d * 0.07, 0); } };
  placePlates(0);
  // ---- the stand: red floor ring + a big sign on a post (Ben: big, high contrast)
  const stZ = HD + 0.9; { const fr = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 48), basic(red, 0.95)); fr.rotation.x = -Math.PI / 2; fr.position.set(0, 0.04, stZ); root.add(fr);
    const fi = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: red, transparent: true, opacity: 0.18, depthWrite: false })); fi.rotation.x = -Math.PI / 2; fi.position.set(0, 0.035, stZ); root.add(fi); root.userData.ring = [fr, fi];
    const px = HW + 0.7, pz = HD + 0.4; B(0.08, 1.9, 0.08, steel, px, 0.95, pz);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.66), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 308, (cc, w, h) => { cc.fillStyle = '#0e1610'; cc.fillRect(0, 0, w, h); cc.strokeStyle = AMBER; cc.lineWidth = 12; cc.strokeRect(6, 6, w - 12, h - 12); cc.textBaseline = 'middle'; cc.fillStyle = AMBER; cc.font = `900 112px ${FONT}`; cc.fillText(V.deck || 'CONDUIT DECK', 40, 104); cc.fillStyle = '#f3f2f2'; cc.font = `900 62px ${FONT}`; cc.fillText('STAND ON THE RED RING', 40, 220); })), toneMapped: false }));
    sg.position.set(px - 0.6, 2.1, pz + 0.05); root.add(sg); B(2.3, 0.76, 0.05, steel, px - 0.6, 2.1, pz); if (eng && eng.circles) eng.circles.push([at.x + px, at.z + pz, 0.12]); }

  // ---- tiles (real pipes) + ports, rebuilt per panel
  const slabG = new THREE.BoxGeometry(CS * 0.92, 0.06, CS * 0.92), pr = 0.072;
  const straightG = new THREE.CylinderGeometry(pr, pr, CS, 12); straightG.rotateX(Math.PI / 2);
  const elbowG = new THREE.TorusGeometry(CS / 2, pr, 8, 12, Math.PI / 2); elbowG.rotateZ(Math.PI); elbowG.rotateX(-Math.PI / 2); elbowG.translate(CS / 2, 0, -CS / 2);
  const collarZ = new THREE.CylinderGeometry(pr * 1.35, pr * 1.35, 0.05, 12); collarZ.rotateX(Math.PI / 2); const collarX = collarZ.clone(); collarX.rotateY(Math.PI / 2);
  const slabM = toon('#2c3430'), collarM = toon('#8a9890');
  const board = new THREE.Group(); board.position.y = YS; pit.add(board);
  const hintRing = new THREE.Mesh(new THREE.RingGeometry(CS * 0.52, CS * 0.62, 32), new THREE.MeshBasicMaterial({ color: 0xf3f2f2, transparent: true, depthWrite: false, toneMapped: false })); hintRing.rotation.x = -Math.PI / 2; hintRing.visible = false; board.add(hintRing);
  let tiles = [], ports = [];
  const GREY = new THREE.Color('#3a4440');
  const lineCol = li => ({ dim: new THREE.Color(LN[li].dim), ink: new THREE.Color(LN[li].ink), spark: new THREE.Color(LN[li].spark) });
  function disposeBoard() { for (const t of tiles) { board.remove(t.g); t.m.dispose(); } for (const p of ports) { pit.remove(p.g); p.m.dispose(); if (p.lamp) p.lamp.material.dispose(); } tiles = []; ports = []; }
  function buildBoard() { disposeBoard(); if (!s) return;
    s.pieces.forEach((p, i) => { const g = new THREE.Group(), [x, z] = toW(cx(p.c), cy(p.r)); g.position.set(x, 0, z); board.add(g);
      const sl = new THREE.Mesh(slabG, slabM); sl.position.y = -0.1; g.add(sl); const sp = new THREE.Group(); g.add(sp);
      const C = lineCol(p.line), m = toon(LN[p.line].dim).clone(); m.color.copy(C.dim).lerp(GREY, 0.45); sp.add(new THREE.Mesh(p.type === 'straight' ? straightG : elbowG, m));
      const c1 = new THREE.Mesh(collarZ, collarM); c1.position.z = -CS / 2 + 0.03; sp.add(c1);
      if (p.type === 'straight') { const c2 = new THREE.Mesh(collarZ, collarM); c2.position.z = CS / 2 - 0.03; sp.add(c2); } else { const c2 = new THREE.Mesh(collarX, collarM); c2.position.x = CS / 2 - 0.03; sp.add(c2); }
      const ang = -p.rot * Math.PI / 2; sp.rotation.y = ang; tiles.push({ g, sp, m, C, i, ang, target: ang, lift: 0 }); });
    const xL = toW(X0, 0)[0], xR = toW(X0 + COLS * CELL, 0)[0];
    s.cfg.lines.forEach((li, i) => { for (const side of [0, 1]) { const row = side ? s.cfg.ends[i] : s.cfg.starts[i], z = toW(0, cy(row))[1], g = new THREE.Group(); pit.add(g);
      const a = side ? xR : -HW + 0.08, b = side ? HW - 0.08 : xL, C = lineCol(li), m = toon(LN[li].dim).clone(); m.color.copy(C.dim).lerp(GREY, 0.45);
      const pg = new THREE.Mesh(new THREE.CylinderGeometry(pr * 1.15, pr * 1.15, b - a, 12), m); pg.rotation.z = Math.PI / 2; pg.position.set((a + b) / 2, YS, z); g.add(pg); pg.geometry.userData.own = true;
      const fl = new THREE.Mesh(new THREE.CylinderGeometry(pr * 2, pr * 2, 0.06, 14), collarM); fl.rotation.z = Math.PI / 2; fl.position.set(side ? HW - 0.11 : -HW + 0.11, YS, z); g.add(fl);
      const port = { g, m, C, li, side, z, pg };
      if (!side) { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 6, 16), new THREE.MeshBasicMaterial({ color: C.ink, toneMapped: false })); wh.rotation.y = Math.PI / 2; wh.position.set((a + b) / 2, YS, z); g.add(wh); port.wheel = wh;
        for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.2, 0.014), wh.material); sp.rotation.x = k * Math.PI / 3; wh.add(sp); } }
      else { const lm = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: C.dim, toneMapped: false })); lm.position.set(HW - 0.14, -0.2, z); g.add(lm); port.lamp = lm; port.glow = glowSprite(HW - 0.2, -0.2, z, LN[li].ink, 0.45, 0, g); }
      ports.push(port); } });
    dirty = true; }

  // ---- sound through the station mixer
  let bus = null, mStart = 0, mBar = 0;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + dur + 0.02); }
  function sfx(k) { if (k === 'turn') { tone(660, 0.05, 0.035, 'triangle', 880); tone(130, 0.08, 0.04, 'square', 80); }
    else if (k === 'connect') [0, 7, 12].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.16, 0.05, 'triangle'), i * 60));
    else if (k === 'done') [0, 4, 7, 12].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.24, 0.055, 'triangle'), i * 100));
    else if (k === 'plates') { tone(70, 0.9, 0.05, 'sawtooth', 50); setTimeout(() => tone(200, 0.12, 0.03, 'square', 120), 250); } }
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.02;
    if (nt.v === 'bass') { o.type = 'triangle'; peak = 0.044; } else if (nt.v === 'pad') { o.type = 'sine'; peak = 0.02; } else if (nt.v === 'lead') { o.type = 'triangle'; peak = 0.03; } else { o.type = 'sine'; peak = 0.028; }
    o.frequency.setValueAtTime(midiHz(nt.m), at0); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(peak, at0 + (nt.v === 'pad' ? 0.4 : 0.016)); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.connect(g); g.connect(bus); o.start(at0); o.stop(at0 + dur + 0.03); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.9) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- the game (the 2D rules)
  let prW = null, s = null, overlay = 'intro', cardInfo = null, open = false, ending = false, openK = 0, dirty = true, F = { wet: {}, done: {} }, solveFx = 0;
  function flow() { const at2 = {}; s.pieces.forEach(p => { at2[p.c + ',' + p.r] = p; }); const wet = {}, done = {};
    s.cfg.lines.forEach((li, i) => { const sr = s.cfg.starts[i], er = s.cfg.ends[i], first = at2['0,' + sr];
      if (!first || first.line !== li || !openingsOf(first.type, first.rot).includes(3)) { done[li] = false; return; }
      const q = [[0, sr, 0]], seen = { ['0,' + sr]: 1 }; wet['0,' + sr] = 0;
      while (q.length) { const [c0, r0, dd] = q.shift(), p = at2[c0 + ',' + r0]; openingsOf(p.type, p.rot).forEach(d => { const nc = c0 + DX[d], nr = r0 + DY[d], k = nc + ',' + nr, qq = at2[k]; if (!qq || qq.line !== li || seen[k]) return; if (!openingsOf(qq.type, qq.rot).includes((d + 2) % 4)) return; seen[k] = 1; wet[k] = dd + 1; q.push([nc, nr, dd + 1]); }); }
      const last = at2[(COLS - 1) + ',' + er]; done[li] = !!(last && seen[(COLS - 1) + ',' + er] && openingsOf(last.type, last.rot).includes(1)); });
    return { wet, done }; }
  function fresh(round) { const pz = buildPuzzle(round), cfg = SYS(round) ? Object.assign({}, pz.cfg, { sys: SYS(round) }) : pz.cfg; return { round, pieces: pz.pieces, cfg, par: pz.par, turns: 0, solved: false, heat: 20, vents: 0, t: 0 }; }
  function newPanel(round) { s = fresh(round); overlay = null; cardInfo = null; F = flow(); buildBoard(); }
  function rotate(idx) { if (overlay || !s || s.solved) return; const before = F.done; s.pieces[idx].rot = (s.pieces[idx].rot + 1) % 4; s.turns++; sfx('turn');
    const t = tiles[idx]; if (t) { t.target -= Math.PI / 2; t.lift = 1; } F = flow(); dirty = true;
    const all = s.cfg.lines.every(li => F.done[li]), newly = s.cfg.lines.some(li => F.done[li] && !before[li]);
    if (all) { s.solved = true; solveFx = 2.2; sfx('done'); if (eng && eng.surge) eng.surge(3.0); const me = s; setTimeout(() => { if (s === me && open) finish(); }, 1500); } else if (newly) sfx('connect'); }
  function finish() { const over = Math.max(0, s.turns - s.par), eff = clamp(100 - over * 5 - (s.vents || 0) * 8, 0, 100), score = Math.round(eff * 0.55 + 45), stars = score >= 95 ? 3 : score >= 80 ? 2 : 1, gold = [0, 10, 20, 30][stars];
    const best = save.stat(P + 'Best', 0), isBest = save.best(P + 'Best', score); save.addGold(gold); save.setStat(P + 'Panels', save.stat(P + 'Panels', 0) + 1); if (!save.flag(P + 'Done')) save.setFlag(P + 'Done');
    const last = s.round % 4 === 3, col = v => v >= 75 ? '#8fe38f' : v >= 45 ? '#ffd23a' : '#ec3013'; overlay = 'card';
    cardInfo = { kicker: last ? 'Deck complete · ' + s.cfg.sys : s.cfg.sys + ' · restored', title: score + ' / 100', mood: over === 0 ? 'Done in par. Clean work.' : over <= 3 ? 'A few turns over par.' : 'Got there the long way round.',
      stars, best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(best, score), gold: '+' + gold + ' G',
      rows: [{ name: 'Routing', val: '100', pct: '100%', color: '#8fe38f' }, { name: 'Efficiency', val: eff + '', pct: eff + '%', color: col(eff) }],
      notes: ['Solved in ' + s.turns + ' turns against a par of ' + s.par + '.'].concat(s.vents ? [s.vents + ' emergency vent' + (s.vents > 1 ? 's' : '') + ': the core redlined before the lines were joined.'] : V.heat ? ['The core never redlined.'] : []), buttons: [last ? 'START THE DECK AGAIN' : 'NEXT PANEL', 'LEAVE THE DECK'] }; }

  // ---- the board floor drawing
  function text(t, x, y, size, col, align = 'left', w = 900) { c.font = `${w} ${size * S}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(t, x * S, y * S); }
  function draw() { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0a120c'; c.fillRect(0, 0, CW, CH);
    c.save(); c.scale(S, S); c.fillStyle = '#101a13'; c.fillRect(X0, Y0, COLS * CELL, ROWS * CELL);
    c.strokeStyle = '#1e3420'; c.lineWidth = 1; for (let i = 0; i <= COLS; i++) { c.beginPath(); c.moveTo(X0 + i * CELL, Y0); c.lineTo(X0 + i * CELL, Y0 + ROWS * CELL); c.stroke(); } for (let i = 0; i <= ROWS; i++) { c.beginPath(); c.moveTo(X0, Y0 + i * CELL); c.lineTo(X0 + COLS * CELL, Y0 + i * CELL); c.stroke(); }
    c.fillStyle = '#1e3420'; for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) { c.beginPath(); c.arc(X0 + i * CELL + 2.4, Y0 + j * CELL + 2.4, 0.8, 0, 6.283); c.fill(); }
    c.fillStyle = red; c.fillRect(0, 0, 200, 1.4); c.restore();
    if (s && portrait()) {} // s363 upright portrait: all writing is in the top bar
    else if (s) { text('PANEL ' + (s.round % 4 + 1) + ' OF 4', 4, 7.5, 6.4, red); text(s.cfg.sys.toUpperCase(), 4, 15.5, 6.4, '#f3f2f2');
      s.cfg.lines.forEach((li, i) => { const L = LN[li], on = F.done[li]; text(L.name, 3, cy(s.cfg.starts[i]) - 8.5, 5.4, L.ink); text('IN', 3, cy(s.cfg.starts[i]) + 8.5, 4.6, '#9fb8a8', 'left', 800);
        text(L.name, 197, cy(s.cfg.ends[i]) - 8.5, 5.4, L.ink, 'right'); text(on ? 'FLOWING' : 'OUT', 197, cy(s.cfg.ends[i]) + 8.5, 4.6, on ? '#8fe38f' : '#9fb8a8', 'right', 800); });
      const over = s.turns > s.par; text('TURNS ' + s.turns + ' · PAR ' + s.par, 4, 129, 7, over ? '#ffb347' : '#f3f2f2');
      text(s.solved ? 'FLOW RESTORED' : 'TAP A PIPE TO TURN IT', 196, 129, 5.6, s.solved ? '#8fe38f' : '#9fb8a8', 'right', 800);
      if (V.heat) { const h = clamp(s.heat, 0, 100), col = h > 80 ? '#ff4a2a' : h > 55 ? '#ffb347' : '#ffd27a'; c.save(); c.scale(S, S); c.fillStyle = '#1a1208'; c.fillRect(120, 4.5, 76, 6); c.fillStyle = col; c.fillRect(120, 4.5, 76 * h / 100, 6); c.strokeStyle = '#f3f2f2'; c.lineWidth = 0.5; c.strokeRect(120, 4.5, 76, 6); c.restore(); text('CORE HEAT', 118, 7.6, 4.6, col, 'right'); } }
    else text('CONDUIT DECK · JUNCTION 8', 4, 11, 6.4, AMBER);
    tex.needsUpdate = true; dirty = false; }
  draw();

  function render3D(dt, T) { openK = open && !ending ? Math.min(1, openK + dt / 1.1) : Math.max(0, openK - dt / 0.9); placePlates(openK); pit.visible = openK > 0.02;
    for (const [b, gl] of beacons) { const on = openK > 0 && openK < 1 ? (Math.sin(T * 14) > 0 ? 1 : 0.25) : openK >= 1 ? 0.7 + 0.3 * Math.sin(T * 3) : 0.35; b.material.opacity = on; gl.material.opacity = openK > 0 ? on * 0.6 : 0; }
    const [fr, fi] = root.userData.ring; fi.material.opacity = 0.12 + 0.1 * Math.sin(T * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); fr.visible = fi.visible = !open;
    stripM.color.setHSL(0.12, 0.8, 0.45 + 0.08 * Math.sin(T * 2));
    if (!pit.visible || !s) { hintRing.visible = false; return; }
    solveFx = Math.max(0, solveFx - dt); const boost = solveFx > 0 ? Math.min(1, solveFx) : 0;
    for (const t of tiles) { t.ang += (t.target - t.ang) * Math.min(1, dt * 16); t.sp.rotation.y = t.ang; t.lift = Math.max(0, t.lift - dt * 5); t.sp.position.y = Math.sin(t.lift * Math.PI) * 0.06;
      const p = s.pieces[t.i], k = p.c + ',' + p.r;
      if (k in F.wet) { const w = 0.5 + 0.5 * Math.sin(T * 5 - F.wet[k] * 0.9), mix = Math.max(boost, w * 0.55); t.m.color.copy(t.C.ink).lerp(t.C.spark, mix); if (t.m.emissive) t.m.emissive.copy(t.C.ink).multiplyScalar(0.5 + 0.4 * mix); }
      else { t.m.color.copy(t.C.dim).lerp(GREY, 0.45); if (t.m.emissive) t.m.emissive.setRGB(0, 0, 0); } }
    for (const p of ports) { const lit = p.side ? !!F.done[p.li] : true, w = 0.5 + 0.5 * Math.sin(T * 5);
      if (lit) { p.m.color.copy(p.C.ink).lerp(p.C.spark, Math.max(boost, w * 0.4)); if (p.m.emissive) p.m.emissive.copy(p.C.ink).multiplyScalar(0.5); } else { p.m.color.copy(p.C.dim).lerp(GREY, 0.45); if (p.m.emissive) p.m.emissive.setRGB(0, 0, 0); }
      if (p.wheel) p.wheel.rotation.x += dt * (0.6 + boost * 6);
      if (p.lamp) { p.lamp.material.color.copy(lit ? p.C.spark : p.C.dim); p.glow.material.opacity = lit ? 0.7 + 0.3 * boost : 0; p.glow.scale.setScalar(lit ? 0.45 + boost * 0.5 : 0.45); } }
    // first panel: a white ring on the first pipe that still needs turning, until the first turn
    const hp = s.round % 4 === 0 && s.turns === 0 && !overlay ? s.pieces.findIndex(p => turnsNeeded(p) > 0) : -1;
    hintRing.visible = hp >= 0; if (hp >= 0) { const p = s.pieces[hp], [x, z] = toW(cx(p.c), cy(p.r)), q = 0.5 + 0.5 * Math.sin(T * 7); hintRing.position.set(x, 0.12, z); hintRing.scale.setScalar(1 + q * 0.12); hintRing.material.opacity = 0.5 + 0.5 * q; } }

  return {
    title: V.title || 'CONDUIT DECK', where: V.where || 'Engineering · CHIEF O\u2019BRAIN', W: 200, H: 140,
    surface: { c: new THREE.Vector3(OX + at.x, YS, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: 6.0, maxY: 6.2, turn: false },
    frame() { return s && !overlay ? [X0 - 8, Y0 - 4, X0 + COLS * CELL + 8, Y0 + ROWS * CELL + 4] : null; },
    stand: { x: OX + at.x, z: at.z + stZ, face: Math.PI }, _s: () => s,
    idle(dt, T) { if (!open) render3D(dt, T); },
    begin() { open = true; ending = false; overlay = 'intro'; s = fresh(save.stat(P + 'Round', 0) % 4); F = flow(); buildBoard(); draw(); setTimeout(() => { if (open) sfx('plates'); }, 350); },
    end() { ending = true; killMusic(); if (s) save.setStat(P + 'Round', s.solved ? s.round + 1 : s.round); open = false; },
    tick(dt, T, fly) { if (!open) return; if (fly > 0.85 && !ending && overlay === null && s && !s.solved) { music(); if (V.heat) { const rate = V.heat[s.round % V.heat.length]; s.heat += rate * dt; if (Math.floor(s.heat) !== s._hd) { s._hd = Math.floor(s.heat); dirty = true; } if (s.heat >= 100) { s.heat = 40; s.vents++; sfx('plates'); tone(90, 1.4, 0.06, 'sawtooth', 40); if (eng && eng.vent) eng.vent(); dirty = true; } } } else if (overlay !== null || ending) killMusic();
      const pr = portrait(); if (pr !== prW) { prW = pr; dirty = true; } render3D(dt, T); if (dirty) draw(); },
    down(x, y) { if (overlay || !s || s.solved) return; const cc = Math.floor((x - X0) / CELL), r = Math.floor((y - Y0) / CELL); if (cc < 0 || cc >= COLS || r < 0 || r >= ROWS) return;
      const i = s.pieces.findIndex(p => p.c === cc && p.r === r); if (i >= 0) rotate(i); },
    move() {}, up() {},
    hud() { if (overlay === 'intro') return { card: { kicker: V.kicker || 'Engineering · Chief O\u2019Brain', title: V.cardTitle || 'Conduit Deck', body: V.body || 'Tap a pipe to turn it a quarter turn. Connect each colour from its inlet on the left to its outlet on the right.', buttons: ['FIX THE PANEL', 'NOT NOW'] } };
      if (overlay === 'card' && cardInfo) return { card: cardInfo };
      if (!s) return {}; if (portrait()) { const n = s.cfg.lines.filter(li => F.done[li]).length;
        return { where: s.solved ? 'FLOW RESTORED · ' + s.cfg.sys : 'TAP A PIPE TO TURN IT · JOIN EACH COLOUR, LEFT TO RIGHT', showStats: true, stats: [['Panel', (s.round % 4 + 1) + ' of 4'], ['Flow', n + ' / ' + s.cfg.lines.length, n === s.cfg.lines.length ? '#8fe38f' : '#f3f2f2'], V.heat ? ['Heat', Math.round(s.heat) + '%', s.heat > 80 ? '#ec3013' : '#ffd27a'] : ['Turns', s.turns + ' / ' + s.par, s.turns > s.par ? '#ffb347' : '#f3f2f2']] }; }
      return { stats: [['Panel', (s.round % 4 + 1) + ' of 4'], ['Turns', s.turns + ' / ' + s.par]].concat(V.heat ? [['Heat', Math.round(s.heat) + '%']] : []), alert: V.heat && s.heat > 80 }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); overlay = null; dirty = true; } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) newPanel(s.round + 1); else return 'leave'; } },
  };
}
