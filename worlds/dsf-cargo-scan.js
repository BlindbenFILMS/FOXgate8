// CARGO SCAN (s355): Ben's 2D game (minigames/dsf/logic/cargo-scan.js) played at the SECURITY scanner belt, rules 1:1
// (4 belts, manifest, lookalike contraband, LAST CALL line, held bin, accuracy). The X-ray deck is a canvas on the
// console top; real 3D: crates ride in through a wall hatch, vanish under the scanner hood, come out the far hood and
// drop into the CLEARED hopper; scanner frame with a sweeping light sheet, LAST CALL beacon that flashes on a miss.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const GOODS = [
  { key: 'drum', name: 'DRUM', d: 'M -4 -6.5 L 4 -6.5 L 4 6.5 L -4 6.5 Z' },
  { key: 'sack', name: 'SACK', d: 'M -4.5 6.5 q -1.5 -9 4.5 -11.5 q 6 2.5 4.5 11.5 Z' },
  { key: 'tin', name: 'TIN', d: 'M -6 -3.5 L 6 -3.5 L 6 3.5 L -6 3.5 Z' },
  { key: 'ring', name: 'RING', d: 'M -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 Z M -2.2 0 a 2.2 2.2 0 1 1 4.4 0 a 2.2 2.2 0 1 1 -4.4 0 Z' },
  { key: 'plate', name: 'PLATE', d: 'M -7 -2.2 L 7 -2.2 L 7 2.2 L -7 2.2 Z' },
  { key: 'bulb', name: 'BULB', d: 'M -1.6 7 L 1.6 7 L 1.6 3 L -1.6 3 Z M 0 -6.6 a 4.6 4.6 0 1 0 0 9.2 a 4.6 4.6 0 1 0 0 -9.2 Z' },
  { key: 'crystal', name: 'CRYSTAL', d: 'M 0 -7 L 5 -3 L 5 4 L 0 7.5 L -5 4 L -5 -3 Z' },
  { key: 'rod', name: 'ROD', d: 'M -1.8 -7.5 L 1.8 -7.5 L 1.8 7.5 L -1.8 7.5 Z M -3.4 -7.5 L 3.4 -7.5 L 3.4 -5.5 L -3.4 -5.5 Z M -3.4 5.5 L 3.4 5.5 L 3.4 7.5 L -3.4 7.5 Z' }];
const GI = {}; GOODS.forEach((g, i) => { GI[g.key] = i; });
const LOOKALIKE = { drum: ['rod', 'tin'], rod: ['drum', 'bulb'], tin: ['plate', 'drum'], plate: ['tin', 'rod'], ring: ['bulb', 'crystal'], bulb: ['ring', 'rod'], crystal: ['ring', 'sack'], sack: ['crystal', 'bulb'] };
const SPAWN_X = -30, LINE_X = 152, EXIT_X = 224, BELT_Y = 64;
const BELTS = [
  { manifest: ['drum', 'sack', 'tin'], per: 2, count: 8, speed: 15, tricky: false, dock: 'Upper pylon' },
  { manifest: ['ring', 'plate', 'bulb'], per: 2, count: 10, speed: 18, tricky: false, dock: 'Freight ring' },
  { manifest: ['drum', 'tin', 'crystal', 'sack'], per: 3, count: 10, speed: 21, tricky: true, dock: 'Lower cargo bay' },
  { manifest: ['rod', 'bulb', 'plate', 'ring'], per: 3, count: 12, speed: 24, tricky: true, dock: 'Transit hub' }];
function rng(seed) { let s = seed + 0x9e3779b9; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function buildBelt(round, belts = BELTS, fleet = 0) { const cfg = belts[round % belts.length], rand = rng(round * 7919 + 13), allowed = cfg.manifest, outside = GOODS.map(g => g.key).filter(k => allowed.indexOf(k) < 0), queue = []; let sinceBad = 0;
  for (let i = 0; i < cfg.count; i++) { let bad; if (i < 2) bad = false; else if (i === 2 || i === 4) bad = true; else if (sinceBad >= 5) bad = true; else bad = rand() < 0.45; sinceBad = bad ? 0 : sinceBad + 1;
    const items = []; for (let j = 0; j < cfg.per; j++) items.push(allowed[Math.floor(rand() * allowed.length)]);
    if (bad) { let pick; if (cfg.tricky) { const near = allowed.reduce((a, k) => a.concat(LOOKALIKE[k] || []), []).filter(k => allowed.indexOf(k) < 0); pick = near.length ? near[Math.floor(rand() * near.length)] : outside[Math.floor(rand() * outside.length)]; } else pick = outside[Math.floor(rand() * outside.length)]; items[Math.floor(rand() * items.length)] = pick; }
    let fl = false; if (fleet && !bad && i >= 3 && rand() < fleet) { fl = true; bad = true; sinceBad = 0; }
    queue.push({ items, bad, fleet: fl }); }
  return { cfg, queue }; }
// the 2D game's working shuffle: walking bass + woodblock tick
const MUSIC = (() => { const notes = [], walk = [40, 43, 45, 47, 45, 43, 40, 38];
  for (let s = 0; s < 4; s++) { const at = s * 8; walk.forEach((m, i) => notes.push({ b: at + i, m, d: 0.8, v: 'bass' }));
    [[0.5, 64], [1.5, 67], [3, 69], [4.5, 67], [5.5, 64], [7, 62]].forEach(p => notes.push({ b: at + p[0], m: p[1] + (s === 3 ? 3 : 0), d: 0.7, v: 'lead' })); notes.push({ b: at, m: 52, d: 3.6, v: 'pad' }); }
  for (let b = 0; b < 32; b += 0.5) notes.push({ b, m: b % 2 === 0 ? 88 : 93, d: 0.06, v: 'tick' });
  return { notes, beats: 32, spb: 0.34 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeCargoScan(K, { group, OX, at, y, blocks, audio, save, LOW, portrait = () => false, theme: V = {} }) {
  const { THREE, basic, glowSprite, toon } = K;
  // s472 per-station versions: V = { title, where, kicker, body, names:{good:'NAME'}, belts, fleet (chance a clean crate carries the FLEET mark = must be HELD, never destroyed), stat, scan:'#hex' }
  const P = V.stat || 'dsfScan', NAME = k => (V.names && V.names[k]) || GOODS[GI[k]].name, SC = V.scan || '#8fd6bf', SCR = V.scanRgb || '143,214,191';
  const PW = 6.4, PH = PW * 140 / 200, U = PW / 200, CW = LOW ? 900 : 1200, CH = Math.round(CW * 0.7), S = CW / 200;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); group.add(root);
  const toW = (px, py) => [(px / 200 - 0.5) * PW, (py / 140 - 0.5) * PH];
  const B = (w, h, d, mat, x, yy, z, p = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, yy, z); p.add(m); return m; };
  const tx = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const steel = toon('#2a2424'), red = '#ec3013', [, beltZ] = toW(0, BELT_Y);
  // the console: steel body, red trim, the X-ray deck on top
  B(PW + 0.3, y - 0.04, PH + 0.3, steel, 0, (y - 0.04) / 2, 0); B(PW + 0.34, 0.04, PH + 0.34, basic(red, 0.9), 0, y - 0.02, 0);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); plate.rotation.x = -Math.PI / 2; plate.position.y = y + 0.006; root.add(plate);
  blocks.push([at.x - PW / 2 - 2.2, at.x + PW / 2 + 1.6, at.z - PH / 2 - 0.2, at.z + PH / 2 + 0.2]);
  // in-feed belt from the west wall hatch, out-feed belt to the CLEARED hopper
  const beltM = toon('#3b4d54'), rollM = toon('#1a2529'), x0 = -PW / 2, x1 = PW / 2, inL = 2.05, outL = 0.55, bw = 40 * U;
  B(inL, 0.08, bw + 0.12, beltM, x0 - inL / 2, y - 0.04, beltZ); B(outL, 0.08, bw + 0.12, beltM, x1 + outL / 2, y - 0.04, beltZ);
  for (const s of [-1, 1]) { B(inL, 0.12, 0.06, steel, x0 - inL / 2, y - 0.02, beltZ + s * (bw / 2 + 0.09)); B(outL, 0.12, 0.06, steel, x1 + outL / 2, y - 0.02, beltZ + s * (bw / 2 + 0.09)); }
  const legs = (x) => { for (const s of [-1, 1]) B(0.08, y - 0.08, 0.08, steel, x, (y - 0.08) / 2, beltZ + s * bw / 2); }; legs(x0 - 0.5); legs(x0 - 1.6);
  const rollers = []; for (let i = 0; i < 7; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, bw, 8), rollM); r.rotation.x = Math.PI / 2; r.position.set(x0 - 0.15 - i * 0.28, y - 0.1, beltZ); root.add(r); rollers.push(r); }
  // the wall hatch the crates come in through (west wall, strip curtain)
  { const hx = x0 - inL - 0.02; B(0.06, 1.3, bw + 0.5, toon('#0a0808'), hx, y + 0.45, beltZ); B(0.1, 0.12, bw + 0.7, basic('#f2c94c', 0.95), hx + 0.04, y + 1.12, beltZ); for (const s of [-1, 1]) B(0.1, 1.3, 0.12, basic('#f2c94c', 0.95), hx + 0.04, y + 0.45, beltZ + s * (bw / 2 + 0.3));
    const sm = basic('#7aa0a8', 0.35, true); for (let i = 0; i < 7; i++) B(0.02, 1.0, 0.17, sm, hx + 0.12, y + 0.58, beltZ - bw / 2 - 0.1 + i * 0.2); }
  // the CLEARED hopper at the end of the out-feed
  { const hx = x1 + outL + 0.42; B(0.84, y - 0.1, bw + 0.3, steel, hx, (y - 0.1) / 2, beltZ); B(0.7, 0.02, bw + 0.16, toon('#050404'), hx, y - 0.09, beltZ);
    const hz = tx(canvas(256, 32, (cc, w, h) => { for (let i = 0; i < 16; i++) { cc.fillStyle = i % 2 ? '#1a1414' : '#f2c94c'; cc.beginPath(); cc.moveTo(i * 16, 0); cc.lineTo(i * 16 + 16, 0); cc.lineTo(i * 16 + 8, h); cc.lineTo(i * 16 - 8, h); cc.fill(); } })); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(2, 1);
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(bw + 0.3, 0.12), toon('#ffffff', { map: hz })); m.position.set(hx + s * 0.425, y - 0.16, beltZ); m.rotation.y = s * Math.PI / 2; root.add(m); }
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.22), new THREE.MeshBasicMaterial({ map: tx(canvas(256, 70, (cc, w, h) => { cc.fillStyle = '#0e0d0c'; cc.fillRect(0, 0, w, h); cc.fillStyle = '#8fe38f'; cc.font = `900 46px ${FONT}`; cc.textBaseline = 'middle'; cc.fillText('CLEARED', 10, h / 2); })), toneMapped: false })); lab.position.set(hx, y * 0.6, beltZ + (bw + 0.3) / 2 + 0.01); root.add(lab); }
  // the hoods over each end of the deck (crates swap from 3D to the X-ray view under them)
  const hoodM = toon('#3a1e1a'), hoodD = 46 * U, hoodW = 20 * U, hoodH = 0.42;
  for (const gx of [10, 190]) { const [hx] = toW(gx, 0); B(hoodW, 0.06, hoodD, hoodM, hx, y + hoodH, beltZ); for (const s of [-1, 1]) B(hoodW, hoodH, 0.06, hoodM, hx, y + hoodH / 2, beltZ + s * hoodD / 2);
    const fx = hx + (gx < 100 ? 1 : -1) * hoodW / 2; B(0.05, 0.12, hoodD, basic('#f2c94c', 0.95), fx, y + hoodH - 0.06, beltZ);
    const sm = basic('#7aa0a8', 0.3, true); for (let i = 0; i < 6; i++) B(0.02, hoodH - 0.16, hoodD / 6 - 0.02, sm, fx, y + (hoodH - 0.1) / 2 + 0.04, beltZ - hoodD / 2 + (i + 0.5) * hoodD / 6); }
  // scanner frame: 4 posts + 2 rails along the belt edges, emitters, a light sheet that sweeps across
  const postM = toon('#5c7a83'), frameH = 0.46; const [sx0, sz0] = toW(62, 40), [sx1, sz1] = toW(126, 88);
  for (const px of [sx0, sx1]) for (const pz of [sz0, sz1]) B(0.07, frameH, 0.07, postM, px, y + frameH / 2, pz);
  for (const pz of [sz0, sz1]) B(sx1 - sx0, 0.08, 0.08, postM, (sx0 + sx1) / 2, y + frameH, pz);
  const emit = []; for (const pz of [sz0, sz1]) for (let i = 0; i < 3; i++) { const e = glowSprite(sx0 + 0.18 + i * (sx1 - sx0 - 0.36) / 2, y + frameH - 0.06, pz, new THREE.Color(SC).getHex(), 0.35, 0.5, root); emit.push(e); }
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(sz1 - sz0, frameH - 0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(SC).getHex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  sheet.rotation.y = Math.PI / 2; sheet.position.set(sx0, y + frameH / 2, (sz0 + sz1) / 2); root.add(sheet);
  // LAST CALL post + beacon
  const [lx, lz] = toW(LINE_X, 36); B(0.06, 0.42, 0.06, steel, lx, y + 0.21, lz - 0.03);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), basic(red, 1, true)); bulb.position.set(lx, y + 0.47, lz - 0.03); root.add(bulb); const bGlow = glowSprite(lx, y + 0.47, lz - 0.03, 0xec3013, 0.5, 0.35, root);
  // the stand: red floor ring + a sign on the console's south face
  const stZ = PH / 2 + 1.0; { const fr = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 48), basic(red, 0.95)); fr.rotation.x = -Math.PI / 2; fr.position.set(0, 0.04, stZ); root.add(fr);
    const fi = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), basic(red, 0.18, true)); fi.rotation.x = -Math.PI / 2; fi.position.set(0, 0.035, stZ); root.add(fi); root.userData.ring = [fr, fi];
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.62), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 244, (cc, w, h) => { cc.fillStyle = '#0e0d0c'; cc.fillRect(0, 0, w, h); cc.strokeStyle = red; cc.lineWidth = 10; cc.strokeRect(5, 5, w - 10, h - 10); cc.textBaseline = 'middle'; cc.fillStyle = red; cc.font = `900 104px ${FONT}`; cc.fillText('CARGO SCAN', 40, 84); cc.fillStyle = '#f3f2f2'; cc.font = `900 60px ${FONT}`; cc.fillText('STAND ON THE RED RING', 40, 176); })), toneMapped: false }));
    sg.position.set(0, y * 0.52, PH / 2 + 0.16); root.add(sg); }
  // 3D crates for the parts of the run outside the deck
  const crateM = toon('#6b5a48'), lidM = toon('#8f7a64'), bandM = toon('#54452f'), boxes = [];
  for (let i = 0; i < 5; i++) { const gq = new THREE.Group(); B(38 * U, 0.5, 32 * U, crateM, 0, 0.25, 0, gq); B(38 * U + 0.01, 0.06, 32 * U + 0.01, lidM, 0, 0.49, 0, gq); for (const s of [-1, 1]) B(4 * U, 0.51, 32 * U + 0.02, bandM, s * 17 * U, 0.25, 0, gq); gq.visible = false; root.add(gq); boxes.push(gq); }

  // ---- sound through the station mixer
  let bus = null, mStart = 0, mBar = 0;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + dur + 0.02); }
  function sfx(k) { if (k === 'tap') tone(300, 0.07, 0.05, 'square', 190); else if (k === 'right') [0, 7].forEach((s, i) => setTimeout(() => tone(midiHz(76 + s), 0.13, 0.045, 'triangle'), i * 55));
    else if (k === 'wrong') tone(170, 0.22, 0.06, 'square', 108); else if (k === 'pass') tone(620, 0.06, 0.028, 'sine'); else if (k === 'thud') tone(90, 0.12, 0.05, 'sine', 50);
    else if (k === 'end') [0, 4, 7, 12].forEach((s, i) => setTimeout(() => tone(midiHz(72 + s), 0.24, 0.05, 'triangle'), i * 100)); }
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.02;
    if (nt.v === 'bass') { o.type = 'triangle'; peak = 0.044; } else if (nt.v === 'pad') { o.type = 'sine'; peak = 0.02; } else if (nt.v === 'lead') { o.type = 'triangle'; peak = 0.03; } else { o.type = 'square'; peak = 0.007; }
    o.frequency.setValueAtTime(midiHz(nt.m), at0); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(peak, at0 + (nt.v === 'pad' ? 0.4 : 0.016)); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.connect(g); g.connect(bus); o.start(at0); o.stop(at0 + dur + 0.03); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.9) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- the game (the 2D rules, state mutated in place)
  let s = null, overlay = 'intro', ending = false, cardInfo = null, nextId = 1, lastDraw = 0, beacon = 0, open = false;
  function freshBelt(round) { const b = buildBelt(round, V.belts || (V.dockNames ? BELTS.map((q, i) => ({ ...q, dock: V.dockNames[i] || q.dock })) : BELTS), V.fleet || 0); return { round, cfg: Object.assign({}, b.cfg, { manifest: b.cfg.manifest.slice() }), queue: b.queue, amended: false, amendT: 0, crates: [], marks: [], spawned: 0, resolved: 0, right: 0, wrong: 0, missed: 0, missedFleet: 0, fleetHeld: 0, falseHold: 0, held: 0, sinceSpawn: 99, done: false, t: 0, card: 1.6 }; }
  function mark(cId, ok, x, yy) { s.marks.push({ id: cId, ok, x, y: yy, at: s.t }); }
  function step(dt) { if (s.card > 0) { s.card -= dt; return; } s.t += dt; const cfg = s.cfg, gap = 66 / cfg.speed;
    s.sinceSpawn += dt; if (s.sinceSpawn >= gap && s.spawned < cfg.count) { const q = s.queue[s.spawned]; s.crates.push({ id: nextId++, x: SPAWN_X, y: BELT_Y, items: q.items, bad: q.bad, fleet: q.fleet, state: 'belt', index: s.spawned }); s.spawned++; s.sinceSpawn = 0; }
    for (const cr of s.crates) { if (cr.state === 'belt') { cr.x += cfg.speed * dt; if (cr.x >= LINE_X) { cr.state = 'passing'; const ok = !cr.bad; mark(cr.id, ok, LINE_X - 8, 40); s.resolved++; if (ok) { s.right++; sfx('pass'); } else { s.wrong++; s.missed++; if (cr.fleet) s.missedFleet++; sfx('wrong'); beacon = 1.4; } } }
      else if (cr.state === 'passing') { cr.x += cfg.speed * dt; if (cr.x > 214 && !cr.thud) { cr.thud = 1; sfx('thud'); } }
      else if (cr.state === 'held') cr.h = Math.min(1, (cr.h || 0) + dt / 0.4); }
    if (V.amend && !s.amended && s.spawned >= Math.floor(cfg.count / 2) && !s.crates.some(cr => cr.state === 'belt')) { s.amended = true; s.amendT = 2.6; const out = GOODS.map(g => g.key).filter(k => cfg.manifest.indexOf(k) < 0), gone = cfg.manifest[0], neu = out[(s.round * 3 + 1) % out.length]; cfg.manifest[0] = neu;
      for (let i = s.spawned; i < s.queue.length; i++) { const q = s.queue[i]; q.items = q.items.map(k => k === gone ? neu : k); if (q.bad && !q.fleet && q.items.every(k => cfg.manifest.indexOf(k) >= 0)) q.items[0] = gone; if (!q.bad && q.items.some(k => cfg.manifest.indexOf(k) < 0)) q.items = q.items.map(k => cfg.manifest.indexOf(k) < 0 ? neu : k); }
      tone(880, 0.12, 0.05, 'square'); setTimeout(() => tone(660, 0.18, 0.05, 'square'), 140); }
    if (s.amendT > 0) s.amendT -= dt;
    s.crates = s.crates.filter(cr => !(cr.state === 'passing' && cr.x > EXIT_X)); s.marks = s.marks.filter(m => s.t - m.at < 1.4);
    if (!s.done && s.resolved >= cfg.count && s.spawned >= cfg.count) { s.done = true; sfx('end'); const me = s; setTimeout(() => { if (s === me && open) finish(); }, 1100); } }
  function hold(id) { const cr = s.crates.find(x => x.id === id); if (!cr || cr.state !== 'belt') return; const ok = cr.bad; sfx('tap'); setTimeout(() => sfx(ok ? 'right' : 'wrong'), 90);
    cr.state = 'held'; cr.slot = s.held; cr.h = 0; cr.hx = cr.x; mark(id, ok, cr.x, cr.y - 26); if (cr.fleet) s.fleetHeld++; if (ok) s.right++; else { s.wrong++; s.falseHold++; } s.held++; s.resolved++; }
  function finish() { const cfg = s.cfg, acc = s.resolved ? Math.round(s.right / s.resolved * 100) : 100, total = cfg.count, stars = acc >= 95 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0, gold = [0, 10, 20, 30][stars];
    const best = save.stat(P + 'Best', 0), isBest = save.best(P + 'Best', acc); if (gold) save.addGold(gold); save.setStat(P + 'Belts', save.stat(P + 'Belts', 0) + 1); if (!save.flag(P + 'Done')) save.setFlag(P + 'Done'); if (s.fleetHeld) save.setStat(P + 'FleetHeld', save.stat(P + 'FleetHeld', 0) + s.fleetHeld);
    const notes = []; if (s.missed) notes.push(s.missed + ' crate' + (s.missed > 1 ? 's' : '') + ' with unlisted goods went through.'); if (s.falseHold) notes.push(s.falseHold + ' clean crate' + (s.falseHold > 1 ? 's were' : ' was') + ' held for nothing.'); if (s.fleetHeld) notes.push(s.fleetHeld + ' FLEET-marked crate' + (s.fleetHeld > 1 ? 's' : '') + ' held safe for the Warden. Not destroyed.'); if (s.missedFleet) notes.push(s.missedFleet + ' FLEET crate' + (s.missedFleet > 1 ? 's' : '') + ' slipped through to whoever is giving the orders.'); if (!notes.length) notes.push('Every call correct. The dock supervisor has no notes.');
    const last = s.round % 4 === 3, col = v => v >= 75 ? '#8fe38f' : v >= 45 ? '#ffd23a' : '#ec3013'; overlay = 'card';
    cardInfo = { kicker: last ? 'Shift over · ' + cfg.dock : cfg.dock + ' · cleared', title: acc + ' / 100', mood: acc >= 95 ? 'Nothing got past you.' : acc >= 80 ? 'Good shift.' : acc >= 60 ? 'A few slipped through.' : 'The manifest and the belt disagreed a lot.',
      stars, best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(best, acc), gold: gold ? '+' + gold + ' G' : '',
      rows: [{ name: 'Accuracy', val: acc + '', pct: acc + '%', color: col(acc) }, { name: 'Right calls', val: s.right + '', pct: Math.round(s.right / total * 100) + '%', color: '#8fe38f' }, { name: 'Wrong calls', val: s.wrong + '', pct: Math.round(s.wrong / total * 100) + '%', color: '#ec3013' }],
      notes, buttons: [last ? 'START THE SHIFT AGAIN' : 'NEXT BELT', 'LEAVE THE BELT'] }; }

  // ---- drawing (the 2D layout, seen from above)
  const gp = GOODS.map(g => new Path2D(g.d));
  function text(t, x, yy, size, col, align = 'left', w = 900) { c.font = `${w} ${size * S}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(t, x * S, yy * S); }
  function crate(cr, T) { let x = cr.x, yy = cr.y, sc = 1; if (cr.state === 'held') { const k = cr.h * cr.h * (3 - 2 * cr.h), slot = cr.slot || 0; x = cr.hx + (61 + (slot % 7) * 12.8 - cr.hx) * k; yy = BELT_Y + (110 - BELT_Y) * k - Math.sin(k * Math.PI) * 10; sc = 1 - 0.67 * k; }
    c.save(); c.translate(x, yy); c.scale(sc, sc);
    c.fillStyle = 'rgba(13,21,25,0.5)'; c.beginPath(); c.ellipse(0, 17.6, 18, 2.4, 0, 0, 6.283); c.fill();
    c.fillStyle = '#6b5a48'; c.fillRect(-19, -16, 38, 32); c.strokeStyle = '#3a2f24'; c.lineWidth = 2; c.strokeRect(-19, -16, 38, 32);
    c.fillStyle = '#8f7a64'; c.fillRect(-19, -16, 38, 3.4); c.fillStyle = '#54452f'; c.fillRect(-19, 13, 38, 3); c.fillRect(-19, -16, 4.2, 32); c.fillRect(14.8, -16, 4.2, 32);
    c.fillStyle = '#0c1f25'; c.fillRect(-15.5, -12.5, 31, 25); const inScan = cr.state === 'belt' && x > 58 && x < 130; if (inScan) { c.fillStyle = 'rgba(' + SCR + ',0.12)'; c.fillRect(-15.5, -12.5, 31, 25); }
    c.strokeStyle = 'rgba(' + SCR + ',0.55)'; c.lineWidth = 0.9; c.beginPath(); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.moveTo(a * 15.5, b * 12.5); c.lineTo(a * 11, b * 12.5); c.moveTo(a * 15.5, b * 12.5); c.lineTo(a * 15.5, b * 8.4); } c.stroke();
    const n = cr.items.length, spread = n === 3 ? 10.3 : 15, st = -((n - 1) * spread) / 2, is = n === 3 ? 0.58 : 0.85;
    c.fillStyle = SC; if (!LOW) { c.shadowColor = SC; c.shadowBlur = inScan ? 10 : 4; }
    cr.items.forEach((k, j) => { c.save(); c.translate(st + j * spread, 0); c.scale(is, is); c.fill(gp[GI[k]], 'evenodd'); c.restore(); }); c.shadowBlur = 0;
    if (cr.fleet) { const blue = Math.sin(T * 3 + cr.id * 1.7) > 0.86; c.fillStyle = blue ? '#5fe3ff' : '#ff3a2a'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; c.lineTo(11.5 + Math.cos(a) * 5.4, -9.5 + Math.sin(a) * 5.4); } c.closePath(); c.fill(); c.fillStyle = '#0a0808'; c.font = '900 6.4px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('F', 11.5, -9.2); }
    if (cr.state === 'held') { c.strokeStyle = '#ec3013'; c.lineWidth = 2.6; c.strokeRect(-20.5, -17.5, 41, 35); }
    c.restore();
    // first belt: a pulsing ring on the first bad crate until you hold one
    if (s.round % 4 === 0 && s.held === 0 && cr.state === 'belt' && cr.bad && x > 40 && x < LINE_X) { const p = 0.5 + 0.5 * Math.sin(T * 7); c.strokeStyle = '#f3f2f2'; c.globalAlpha = 0.5 + 0.5 * p; c.lineWidth = 1.2; c.beginPath(); c.arc(x, yy, 24 + p * 3, 0, 6.283); c.stroke(); c.globalAlpha = 1;
      c.restore(); text('TAP IT', x, yy + 31, 4.6, '#f3f2f2', 'center'); c.save(); c.scale(S, S); } }
  function draw(T) { c.setTransform(1, 0, 0, 1, 0, 0); c.save(); c.scale(S, S);
    c.fillStyle = '#1d2b30'; c.fillRect(0, 0, 200, 140); c.fillStyle = '#213137'; c.fillRect(0, 36, 200, 58);
    // belt: moving slats, edge rails, roller heads
    const speed = s ? s.cfg.speed : 15, run = s && !overlay && s.card <= 0 && open, off = s ? (s.t * speed) % 8 : 0;
    c.fillStyle = '#2b3c42'; c.fillRect(0, 46, 200, 36); c.strokeStyle = '#3b4d54'; c.lineWidth = 2.2; c.beginPath(); for (let x = off - 8; x < 204; x += 8) { c.moveTo(x, 47); c.lineTo(x, 81); } c.stroke();
    c.fillStyle = '#6b8189'; c.fillRect(0, 44, 200, 2); c.fillRect(0, 82, 200, 2); c.fillStyle = '#1a2529'; for (let x = 18; x < 200; x += 22) { c.beginPath(); c.arc(x, 45, 1.1, 0, 6.283); c.arc(x, 83, 1.1, 0, 6.283); c.fill(); }
    // scan zone
    const scanning = s && s.crates.some(cr => cr.state === 'belt' && cr.x > 58 && cr.x < 130); c.fillStyle = `rgba(${SCR},${scanning ? 0.16 + 0.06 * Math.sin(T * 6) : 0.06})`; c.fillRect(62, 40, 64, 48);
    c.strokeStyle = '#5c7a83'; c.lineWidth = 1.4; c.strokeRect(62, 40, 64, 48);
    // LAST CALL
    c.strokeStyle = red; c.lineWidth = 1.4; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(LINE_X, 44); c.lineTo(LINE_X, 84); c.stroke(); c.setLineDash([]); c.restore(); text('LAST CALL', LINE_X + 3, 39.5, 4.2, red); c.save(); c.scale(S, S);
    // held bin
    c.fillStyle = '#2a1f22'; c.fillRect(52, 100, 96, 26); c.strokeStyle = '#8f2b1e'; c.lineWidth = 1.6; c.strokeRect(52, 100, 96, 26); c.fillStyle = '#8f2b1e'; c.fillRect(52, 100, 96, 3);
    c.restore(); text('HELD · ' + (s ? s.held : 0), 100, 121.5, 4.6, red, 'center'); c.save(); c.scale(S, S);
    // manifest card
    const PR = portrait() && s; // s363 upright portrait: the manifest card is just the allowed shapes; its words go to the top bar
    c.fillStyle = '#f3f2f2'; if (PR) { const mx = 66 + s.cfg.manifest.length * 32; c.fillRect(62, 5, mx - 62, 30); c.strokeStyle = '#201e1d'; c.lineWidth = 2; c.strokeRect(62, 5, mx - 62, 30); } else { c.fillRect(6, 5, 188, 30); c.strokeStyle = '#201e1d'; c.lineWidth = 2; c.strokeRect(6, 5, 188, 30); }
    c.restore(); if (!PR) { text('MANIFEST', 10, 13, 6.6, '#201e1d'); text('ALLOWED TODAY.', 10, 21.5, 3.9, '#6b6864', 'left', 700); text(V.fleet ? 'HOLD ELSE + FLEET MARK' : 'HOLD ANYTHING ELSE.', 10, 27.5, 3.9, '#b8250e', 'left', 800); } c.save(); c.scale(S, S);
    if (s) s.cfg.manifest.forEach((k, i) => { const x = 66 + i * 32; c.fillStyle = '#e6e4dd'; c.fillRect(x, 8, 30, 24); c.fillStyle = '#dad8d1'; c.fillRect(x, 25, 30, 7); c.strokeStyle = '#201e1d'; c.lineWidth = 1.2; c.strokeRect(x, 8, 30, 24);
      c.save(); c.translate(x + 15, 16.4); c.scale(0.94, 0.94); c.fillStyle = '#201e1d'; c.fill(gp[GI[k]], 'evenodd'); c.restore(); c.restore(); text(NAME(k), x + 15, 28.8, 4.1, '#201e1d', 'center'); c.save(); c.scale(S, S); });
    else { c.restore(); text(V.idleTitle || 'CARGO SCAN · SECURITY', 66, 20, 6, '#201e1d'); c.save(); c.scale(S, S); }
    if (s && s.amendT > 0 && Math.sin(T * 10) > -0.3) { c.fillStyle = 'rgba(236,48,19,0.92)'; c.fillRect(6, 5, 56, 30); c.restore(); text('CONTRACT', 10, 15, 6, '#ffffff'); text('AMENDED', 10, 25, 6, '#ffffff'); c.save(); c.scale(S, S); }
    // crates + marks
    if (s) { for (const cr of s.crates) if (cr.state === 'held') crate(cr, T); for (const cr of s.crates) if (cr.state !== 'held') crate(cr, T);
      for (const m of s.marks) { const u = (s.t - m.at) / 1.4, x = clamp(m.x, 14, 186), yy = clamp(m.y, 45, 118) - u * 6; c.globalAlpha = Math.min(1, (1 - u) * 2); c.fillStyle = '#f3f2f2'; c.beginPath(); c.arc(x, yy, 5.6, 0, 6.283); c.fill();
        c.strokeStyle = m.ok ? '#2f7d3a' : '#c2210f'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); if (m.ok) { c.moveTo(x - 3.8, yy); c.lineTo(x - 1, yy + 2.9); c.lineTo(x + 4, yy - 2.7); } else { c.moveTo(x - 3.2, yy - 3.2); c.lineTo(x + 3.2, yy + 3.2); c.moveTo(x + 3.2, yy - 3.2); c.lineTo(x - 3.2, yy + 3.2); } c.stroke(); c.globalAlpha = 1; } }
    c.restore();
    if (!PR) text(s ? (V.fleet ? 'TAP A CRATE WITH AN OFF-MANIFEST SHAPE OR THE RED FLEET MARK' : 'TAP A CRATE IF ANY SHAPE IN IT IS NOT ON THE MANIFEST') : 'STAND ON THE RED RING TO WORK THE BELT', 100, 133.5, 3.9, '#9fb8bf', 'center', 800);
    if (s && s.card > 0) { const a = Math.min(1, s.card * 2, (1.6 - s.card) * 4); c.globalAlpha = a; c.fillStyle = 'rgba(14,13,12,0.93)'; c.fillRect(0, CH * 0.33, CW, CH * 0.32); c.fillStyle = red; c.fillRect(0, CH * 0.33, CW, 4); c.fillRect(0, CH * 0.65 - 4, CW, 4);
      const lx = PR ? 42 : 12; text('BELT ' + (s.round % 4 + 1) + ' OF 4', lx, 54, PR ? 5 : 4.2, red); text(s.cfg.dock.toUpperCase(), lx, 66, PR ? 9 : 11, '#f3f2f2'); text(s.cfg.count + ' crates · ' + s.cfg.manifest.length + ' goods allowed', lx, 79, PR ? 5.4 : 4.6, SC, 'left', 700); c.globalAlpha = 1; }
    tex.needsUpdate = true; void run; }
  draw(0);

  function render3D(dt, T) { const live = s && open; let bi = 0;
    if (live) for (const cr of s.crates) { if (bi >= boxes.length) break; if (cr.state === 'held') continue; if (cr.x >= 0 && cr.x <= 200) continue; const b = boxes[bi++], [x, z] = toW(cr.x, BELT_Y); b.visible = true; b.position.set(x, y + 0.01 - (cr.x > 214 ? Math.min(1, (cr.x - 214) / 9) * 0.9 : 0), z); }
    for (; bi < boxes.length; bi++) boxes[bi].visible = false;
    const run = live && !overlay && s.card <= 0, spd = run ? s.cfg.speed * U : 0; for (const r of rollers) r.rotation.y -= spd * dt / 0.05;
    const scanning = live && s.crates.some(cr => cr.state === 'belt' && cr.x > 58 && cr.x < 130);
    sheet.position.x = sx0 + (0.5 + 0.5 * Math.sin(T * 2.6)) * (sx1 - sx0); sheet.material.opacity = scanning ? 0.22 + 0.08 * Math.sin(T * 9) : 0.05;
    for (const e of emit) e.material.opacity = scanning ? 0.9 : 0.35;
    beacon = Math.max(0, beacon - dt); const on = beacon > 0 ? (Math.sin(T * 22) > 0 ? 1 : 0.2) : 0.35 + 0.15 * Math.sin(T * 2); bulb.material.opacity = on; bGlow.material.opacity = on * 0.6; bGlow.scale.setScalar(beacon > 0 ? 0.9 : 0.5);
    const [fr, fi] = root.userData.ring; fi.material.opacity = 0.12 + 0.1 * Math.sin(T * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); }

  function newBelt(round) { s = freshBelt(round); overlay = null; ending = false; cardInfo = null; }
  return {
    title: V.title || 'CARGO SCAN', where: V.where || 'Security · LT. WARF', W: 200, H: 140,
    surface: { c: new THREE.Vector3(OX + at.x, y, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: 4.4, maxY: 5.6, turn: false },
    frame() { return s && !overlay ? [36, 3, 196, 128] : null; },
    stand: { x: OX + at.x, z: at.z + stZ, face: Math.PI }, _s: () => s,
    idle(dt, T) { if (!open) render3D(dt, T); },
    begin() { open = true; ending = false; overlay = 'intro'; s = freshBelt(save.stat(P + 'Round', 0) % 4); s.card = 0; draw(0); },
    end() { ending = true; killMusic(); if (s) save.setStat(P + 'Round', s.done ? s.round + 1 : s.round); open = false; s = null; lastDraw = 0; draw(0); },
    tick(dt, T, fly) { if (!open) return; if (fly > 0.85 && !ending && overlay === null && s && !s.done) { step(dt); music(); } else if (overlay !== null || ending) killMusic();
      render3D(dt, T); if (T - lastDraw > (LOW ? 1 / 24 : 1 / 40) || !lastDraw) { lastDraw = T; draw(T); } },
    down(x, yy) { if (overlay || !s || s.done || s.card > 0) return; let pick = null, best = 1e9; for (const cr of s.crates) { if (cr.state !== 'belt') continue; const dx = Math.abs(x - cr.x), dy = Math.abs(yy - cr.y); if (dx < 24 && dy < 24 && dx + dy < best) { best = dx + dy; pick = cr; } } if (pick) hold(pick.id); },
    move() {}, up() {},
    hud() { if (overlay === 'intro') return { card: { kicker: V.kicker || 'Security · Lt. Warf', title: V.cardTitle || 'Cargo Scan', body: V.body || 'Crates ride the belt through the scanner. Tap any crate holding a shape that is not on the manifest, before the red line. Clean crates go through.', buttons: ['WORK THE BELT', 'NOT NOW'] } };
      if (overlay === 'card' && cardInfo) return { card: cardInfo };
      if (!s) return {}; if (portrait()) return { where: s.card > 0 ? 'BELT ' + (s.round % 4 + 1) + ' · ' + s.cfg.dock : 'THE CARD ABOVE IS ALLOWED · TAP A CRATE WITH ANY OTHER SHAPE BEFORE THE RED LINE', showStats: true, stats: [['Belt', (s.round % 4 + 1) + ' of 4'], ['Crate', Math.min(s.resolved + 1, s.cfg.count) + '/' + s.cfg.count], ['Wrong', s.wrong + '', s.wrong ? '#ec3013' : null]] }; return { stats: [['Belt', (s.round % 4 + 1) + ' of 4'], ['Crate', Math.min(s.resolved + 1, s.cfg.count) + '/' + s.cfg.count], ['Wrong', s.wrong + '']], alert: s.wrong > 0 }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); newBelt(s ? s.round : 0); } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) newBelt(s.round + 1); else return 'leave'; } },
  };
}
