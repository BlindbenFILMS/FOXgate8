// BONE SET (s357): Ben's 2D game (minigames/dsf/logic/bone-set.js) played IN THE INFIRMARY, rules 1:1
// (4 cases: femur / rib / ulna / clavicle, fragments cut at angled lines, snap 7.6/6.6/5.8/5, 50/50/55/60 s,
// a fragment locks WHERE you drop it so sloppy joins stay visible, score = fragments*0.55 + alignment*0.45).
// In 3D: a patient sleeps on the surgical table. On start the lamp ring rises into the ceiling and turns into a holo
// emitter, four light pillars rise from the table corners and a scan line unfolds the X-RAY FIELD over the patient.
// The fragments are real 3D bone pieces: lift one out of the holo tray, it turns green when it is close enough, let go
// and it welds with a spark. Seat them all and a knit wave runs down the bone, the patient wakes and wags.
// The wall light board shows the live case. Dr Bashad's last case note is a Machine Fleet hint.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const n3 = v => Math.round(v * 1000) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BONES = [
  { key: 'femur', name: 'LEFT FEMUR', L: 46, hw: t => { const a = Math.abs(t); return a > 36 ? 12.5 : a > 27 ? 7 + (a - 27) * 0.61 : 7; }, cap: 7, curve: t => t * 0.04, cuts: 2, label: 'Transverse fracture, mid-shaft' },
  { key: 'rib', name: 'THIRD RIB', L: 44, hw: () => 4.8, cap: 4, curve: t => -14 * Math.cos((t / 44) * 1.35) + 8, cuts: 3, label: 'Displaced fracture, two breaks' },
  { key: 'ulna', name: 'RIGHT ULNA', L: 42, hw: t => { const u = (t + 42) / 84; return 3.8 + u * u * 7.6; }, cap: 5, curve: t => 4 * Math.sin((t / 42) * 1.9), cuts: 3, label: 'Comminuted, three fragments' },
  { key: 'clavicle', name: 'CLAVICLE', L: 43, hw: t => 4.4 + Math.abs(t) * 0.08, cap: 4, curve: t => 9 * Math.sin((t / 43) * 3.1), cuts: 4, label: 'Multiple fragments, S-shaft' }];
const FUR = ['#d8783a', '#b8642e', '#e0a050', '#c85a28'];
function capped(b, t) { const a = Math.abs(t), cap = b.cap || 5, edge = b.L - cap, base = b.hw(t); if (a <= edge) return base; const u = clamp((a - edge) / cap, 0, 1); return base * Math.sqrt(Math.max(0, 1 - u * u * 0.93)); }
function outline(b) { const pts = [], steps = 56; for (let i = 0; i <= steps; i++) { const t = -b.L + (i / steps) * 2 * b.L; pts.push([t, b.curve(t) + capped(b, t)]); } for (let i = steps; i >= 0; i--) { const t = -b.L + (i / steps) * 2 * b.L; pts.push([t, b.curve(t) - capped(b, t)]); } return pts; }
function clipHalf(poly, a, nrm) { const out = [], side = p => (p[0] - a[0]) * nrm[0] + (p[1] - a[1]) * nrm[1];
  for (let i = 0; i < poly.length; i++) { const c = poly[i], d = poly[(i + 1) % poly.length], sc = side(c), sd = side(d); if (sc >= 0) out.push(c); if ((sc >= 0) !== (sd >= 0)) { const u = sc / (sc - sd); out.push([c[0] + (d[0] - c[0]) * u, c[1] + (d[1] - c[1]) * u]); } } return out; }
function centroid(poly) { let a = 0, x = 0, y = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length], cr = p[0] * q[1] - q[0] * p[1]; a += cr; x += (p[0] + q[0]) * cr; y += (p[1] + q[1]) * cr; }
  if (Math.abs(a) < 1e-6) { const m = poly.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]); return [m[0] / poly.length, m[1] / poly.length]; } return [x / (3 * a), y / (3 * a)]; }
function inPoly(poly, x, y) { let hit = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])) hit = !hit; } return hit; }
function rng(seed) { let s = seed + 0x9e3779b9; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const REF = { x: 31, y: 45, s: 0.34 };
// s363 two layouts: LL = the 2D board (landscape); LP = upright phone portrait (tray ABOVE the bone, all writing in the top bar)
const LL = { O: { x: 122, y: 52 }, T: { x: 54, y: 86, w: 134, h: 34, inX0: 58, inX1: 184, inY0: 94, inY1: 120 }, P: false };
const LP = { O: { x: 100, y: 96 }, T: { x: 46, y: 26, w: 108, h: 36, inX0: 50, inX1: 150, inY0: 31, inY1: 57 }, P: true, frame: [42, 20, 158, 120], grid: [46, 154, 76, 118] };
let ORIGIN = LL.O, TRAY = LL.T;
const SNAP = [7.6, 6.6, 5.8, 5], SECONDS = [50, 50, 55, 60];
function buildCase(round) { const b = BONES[round % BONES.length], rand = rng(round * 6151 + 29), shell = outline(b), cuts = [];
  for (let i = 1; i <= b.cuts; i++) { const tc = -b.L + (i / (b.cuts + 1)) * 2 * b.L + (rand() - 0.5) * 5, ang = (rand() - 0.5) * 0.7; cuts.push({ tc, nrm: [Math.cos(ang), Math.sin(ang)] }); }
  cuts.sort((p, q) => p.tc - q.tc); const frags = [];
  for (let i = 0; i <= b.cuts; i++) { let poly = shell; if (i > 0) { const c = cuts[i - 1]; poly = clipHalf(poly, [c.tc, 0], c.nrm); } if (i < b.cuts) { const c = cuts[i]; poly = clipHalf(poly, [c.tc, 0], [-c.nrm[0], -c.nrm[1]]); } if (poly.length < 3) continue; frags.push({ poly, home: centroid(poly) }); }
  const order = frags.map((f, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
  const slotW = (TRAY.inX1 - TRAY.inX0) / frags.length;
  order.forEach((fi, slot) => { const f = frags[fi]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; f.poly.forEach(p => { x0 = Math.min(x0, p[0] - f.home[0]); x1 = Math.max(x1, p[0] - f.home[0]); y0 = Math.min(y0, p[1] - f.home[1]); y1 = Math.max(y1, p[1] - f.home[1]); });
    const lo = TRAY.inX0 + slotW * slot, hi = lo + slotW, sx = clamp((lo + hi) / 2, lo - x0, Math.max(lo - x0, hi - x1)), cy = (TRAY.inY0 + TRAY.inY1) / 2, sy = clamp(cy + (rand() - 0.5) * 4, TRAY.inY0 - y0, Math.max(TRAY.inY0 - y0, TRAY.inY1 - y1));
    f.off = [sx - (ORIGIN.x + f.home[0]), sy - (ORIGIN.y + f.home[1])]; f.placed = false; f.residual = 0; });
  return { bone: b, cuts, frags, shell }; }
// the 2D quiet infirmary loop: glassy music-box figure over a long low note
const MUSIC = (() => { const notes = [], chords = [[48, 55, 60], [46, 53, 58], [44, 51, 56], [46, 53, 60]];
  chords.forEach((ch, s) => { const at = s * 8; notes.push({ b: at, m: ch[0] - 12, d: 7.6, v: 'bass' }); notes.push({ b: at, m: ch[1], d: 7.2, v: 'pad' }); [0, 1.5, 3, 4.5, 6].forEach((off, i) => notes.push({ b: at + off, m: ch[i % 3] + 24, d: 1.5, v: 'bell' })); });
  [3.5, 11.5, 19.5, 27.5].forEach(b => notes.push({ b, m: 91, d: 1.8, v: 'bell' })); return { notes, beats: 32, spb: 0.54 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeBoneSet(K, { group, OX, at, lamp, wallX, roomH = 6.5, audio, save, LOW, portrait = () => false }) {
  const { THREE, basic, glowSprite, toon } = K;
  const PW = 2.8, PH = PW * 0.7, U = PW / 200, YS = 1.5, DEPTH = 0.05, CYAN = '#5fe3ff', GREEN = '#8fe38f';
  const toW = (px, py) => [(px / 200 - 0.5) * PW, (py / 140 - 0.5) * PH];
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); group.add(root);
  const tx = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); p.add(m); return m; };
  // ---- the patient: asleep under a sheet on the table, head on the west end; breathes, wakes + wags when the bone knits
  const pat = new THREE.Group(); pat.position.set(0, 1.0, 0); root.add(pat);
  const furM = toon(FUR[0]).clone(), white = toon('#ffffff'), sheetM = toon('#bfe6f2');
  const sheet = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.15, 4, 10), sheetM); sheet.rotation.z = Math.PI / 2; sheet.scale.set(1, 1, 1.25); sheet.position.set(0.2, 0.15, 0); pat.add(sheet);
  B(0.42, 0.1, 0.62, white, -0.95, 0.06, 0, pat);
  const head = new THREE.Group(); head.position.set(-0.86, 0.22, 0); pat.add(head);
  { const hs = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), furM); head.add(hs); const sn = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 10), furM); sn.position.set(0, 0.13, 0); head.add(sn);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), toon('#1a1210')); nose.position.set(0, 0.23, 0); head.add(nose);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), furM); e.position.set(-0.13, 0.03, s * 0.09); e.rotation.z = Math.PI / 2 + 0.25; e.rotation.x = s * 0.3; head.add(e); } }
  const tail = new THREE.Group(); tail.position.set(0.95, 0.1, 0.22); pat.add(tail);
  { const tt = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.55, 10), furM); tt.rotation.z = -Math.PI / 2; tt.position.x = 0.27; tail.add(tt); const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), white); tip.position.x = 0.54; tail.add(tip); }
  // ---- holo kit: 4 light pillars at the table corners, a scan line, the field glass, the field canvas
  const pillars = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, YS - 1.0, 0.03), new THREE.MeshBasicMaterial({ color: 0x9ff4ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); m.position.set(sx * 1.15, 1.0 + (YS - 1.0) / 2, sz * 0.5); root.add(m); pillars.push([m, glowSprite(sx * 1.15, YS, sz * 0.5, 0x9ff4ff, 0.3, 0, root)]); }
  const CW = LOW ? 800 : 1100, CH = Math.round(CW * 0.7), S = CW / 200, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d'), tex = tx(cv);
  const field = new THREE.Group(); field.position.y = YS; root.add(field); field.visible = false;
  const glassM = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), glassM); glass.rotation.x = -Math.PI / 2; field.add(glass);
  const scanM = new THREE.MeshBasicMaterial({ color: 0xbff8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const scanL = new THREE.Mesh(new THREE.PlaneGeometry(PW * 1.04, 0.035), scanM); scanL.rotation.x = -Math.PI / 2; scanL.position.y = 0.01; field.add(scanL);
  // ---- the wall light board: the live case x-ray over the static one
  const XW = 512, XH = 320, xcv = document.createElement('canvas'); xcv.width = XW; xcv.height = XH; const xc = xcv.getContext('2d'), xtex = tx(xcv);
  if (wallX != null) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.1), new THREE.MeshBasicMaterial({ map: xtex, toneMapped: false })); m.rotation.y = -Math.PI / 2; m.position.set(wallX - at.x - 0.015, 2.4, 0); root.add(m); }
  // ---- the stand: red floor ring + a big sign on a post
  const stZ = 1.9, red = '#ec3013', steel = toon('#24303a');
  { const fr = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 48), basic(red, 0.95)); fr.rotation.x = -Math.PI / 2; fr.position.set(0, 0.04, stZ); root.add(fr);
    const fi = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: red, transparent: true, opacity: 0.18, depthWrite: false })); fi.rotation.x = -Math.PI / 2; fi.position.set(0, 0.035, stZ); root.add(fi); root.userData.ring = [fr, fi];
    const px = -1.9, pz = 1.5; B(0.08, 1.9, 0.08, steel, px, 0.95, pz);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.6), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 308, (cc, w, h) => { cc.fillStyle = '#0b1218'; cc.fillRect(0, 0, w, h); cc.strokeStyle = CYAN; cc.lineWidth = 12; cc.strokeRect(6, 6, w - 12, h - 12); cc.textBaseline = 'middle'; cc.fillStyle = CYAN; cc.font = `900 120px ${FONT}`; cc.fillText('BONE SET', 40, 104); cc.fillStyle = '#f3f2f2'; cc.font = `900 62px ${FONT}`; cc.fillText('STAND ON THE RED RING', 40, 220); })), toneMapped: false }));
    sg.position.set(px, 2.1, pz + 0.05); root.add(sg); B(2.1, 0.7, 0.05, steel, px, 2.1, pz); }

  // ---- fragments (real bone pieces), rebuilt per case
  let frags3 = [], sparks = [];
  const boneEdge = new THREE.LineBasicMaterial({ color: 0x6b5a3c });
  function disposeFrags() { for (const f of frags3) { field.remove(f.g); f.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); f.m.dispose(); } frags3 = []; }
  function buildFrags() { disposeFrags(); if (!s) return;
    s.frags.forEach((f, i) => { const sh = new THREE.Shape(); f.poly.forEach((p, k) => { const x = (p[0] - f.home[0]) * U, y = (p[1] - f.home[1]) * U; k ? sh.lineTo(x, y) : sh.moveTo(x, y); });
      const geo = new THREE.ExtrudeGeometry(sh, { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2, curveSegments: 4 }); geo.rotateX(Math.PI / 2);
      const m = toon('#ede3cf').clone(), g = new THREE.Group(), mesh = new THREE.Mesh(geo, m); g.add(mesh);
      const ed = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 35), boneEdge); g.add(ed); field.add(g);
      frags3.push({ g, m, i, y: 0.3, x: 0, z: 0, glow: 0 }); });
    place(true); }
  function place(snap) { for (const F of frags3) { const f = s.frags[F.i], [x, z] = toW(ORIGIN.x + f.home[0] + f.off[0], ORIGIN.y + f.home[1] + f.off[1]); F.x = x; F.z = z; if (snap) F.g.position.set(x, DEPTH + 0.3 + F.i * 0.04, z); } }
  function spark(x, z, col, big) { const sp = glowSprite(x, 0.08, z, col, 0.1, 1, field); sparks.push({ sp, t: 0, big: big ? 1 : 0 }); }

  // ---- sound through the station mixer
  let bus = null, mStart = 0, mBar = 0;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + dur + 0.02); }
  function sfx(k) { if (k === 'lift') tone(480, 0.05, 0.03, 'triangle', 620);
    else if (k === 'near') tone(990, 0.06, 0.02, 'sine');
    else if (k === 'lock') { tone(340, 0.08, 0.05, 'square', 560); tone(720, 0.07, 0.03, 'triangle'); }
    else if (k === 'drop') tone(220, 0.08, 0.035, 'sine', 160);
    else if (k === 'knit') [0, 4, 7, 12].forEach((v, i) => setTimeout(() => tone(midiHz(74 + v), 0.22, 0.05, 'triangle'), i * 95));
    else if (k === 'time') tone(180, 0.24, 0.06, 'square', 110);
    else if (k === 'open') { tone(220, 1.0, 0.03, 'sine', 880); setTimeout(() => tone(1320, 0.4, 0.02, 'sine'), 500); } }
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.02;
    if (nt.v === 'bass') { o.type = 'triangle'; peak = 0.044; } else if (nt.v === 'pad') { o.type = 'sine'; peak = 0.02; } else { o.type = 'sine'; peak = 0.028; }
    o.frequency.setValueAtTime(midiHz(nt.m), at0); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(peak, at0 + (nt.v === 'pad' ? 0.4 : 0.016)); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.connect(g); g.connect(bus); o.start(at0); o.stop(at0 + dur + 0.03); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.9) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- the game (the 2D rules)
  let s = null, overlay = 'intro', cardInfo = null, open = false, ending = false, openK = 0, dirty = true, drawT = 0, knitT = -1, heal = 0, wasNear = false;
  function fresh(round) { const lay = portrait() ? LP : LL; ORIGIN = lay.O; TRAY = lay.T; const k = buildCase(round), r = round % 4; return { round, lay, bone: k.bone, cuts: k.cuts, shell: k.shell, frags: k.frags, snap: SNAP[r], timeLeft: SECONDS[r], total: SECONDS[r], held: null, grab: [0, 0], done: false, card: 1.7, timeUp: false }; }
  function newCase(round) { s = fresh(round); overlay = null; cardInfo = null; knitT = -1; heal = 0; furM.color.set(FUR[round % 4]); buildFrags(); drawXray(); dirty = true; }
  const placedN = () => s.frags.filter(f => f.placed).length;
  function score() { const placed = s.frags.filter(f => f.placed), tot = s.frags.length; const prec = placed.map(f => clamp(1 - f.residual / s.snap, 0, 1)), avg = prec.length ? prec.reduce((a, x) => a + x, 0) / prec.length : 0;
    const alignment = Math.round(avg * 100), completion = Math.round(placed.length / tot * 100); return { alignment, completion, score: Math.round(completion * 0.55 + alignment * 0.45) }; }
  function finish() { const b = s.bone, { alignment, completion, score: sc } = score(), stars = sc >= 92 ? 3 : sc >= 78 ? 2 : 1, gold = [0, 10, 20, 30][stars], tot = s.frags.length, placed = placedN();
    const best = save.stat('dsfBoneBest', 0), isBest = save.best('dsfBoneBest', sc); save.addGold(gold); save.setStat('dsfBoneCases', save.stat('dsfBoneCases', 0) + 1); if (placed === tot && !save.flag('dsfBoneDone')) save.setFlag('dsfBoneDone');
    const col = v => v >= 75 ? GREEN : v >= 45 ? '#ffd23a' : '#ec3013', last = s.round % 4 === 3, notes = [];
    if (placed < tot) notes.push((tot - placed) + ' fragment' + (tot - placed > 1 ? 's' : '') + ' never made it into the bone.');
    const sloppy = s.frags.filter(f => f.placed && f.residual > s.snap * 0.55).length; if (sloppy) notes.push(sloppy + ' join' + (sloppy > 1 ? 's' : '') + ' left a visible step in the shaft.');
    if (placed === tot && !sloppy) notes.push('Every fragment seated clean. The bone will knit true.');
    overlay = 'card'; cardInfo = { kicker: last ? 'Shift over · ' + b.name : b.name + ' · set', title: sc + ' / 100', mood: sc >= 92 ? 'A textbook reduction.' : sc >= 78 ? 'Good set.' : sc >= 60 ? 'It will heal, with a ridge.' : 'That one needs setting again.',
      stars, best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(best, sc), gold: '+' + gold + ' G',
      rows: [{ name: 'Fragments', val: completion + '', pct: completion + '%', color: col(completion) }, { name: 'Alignment', val: alignment + '', pct: alignment + '%', color: col(alignment) }],
      notes, buttons: [last ? 'START THE SHIFT AGAIN' : 'NEXT CASE', 'LEAVE THE TABLE'] }; }
  function lock(i, d) { const f = s.frags[i]; f.placed = true; f.residual = d; s.held = null; sfx('lock'); const F = frags3[i]; if (F) { F.glow = 1; spark(F.x, F.z, 0xbff8ff, true); }
    dirty = true; if (s.frags.every(x => x.placed)) { s.done = true; knitT = 0; sfx('knit'); const me = s; setTimeout(() => { if (s === me && open) finish(); }, 1900); } }

  // ---- the field drawing (game units, 200 x 140)
  function text(t, x, y, size, col, align = 'left', w = 900) { c.font = `${w} ${size}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(t, x, y); }
  function path(poly, ox, oy) { c.beginPath(); poly.forEach((p, k) => k ? c.lineTo(ox + p[0], oy + p[1]) : c.moveTo(ox + p[0], oy + p[1])); c.closePath(); }
  function draw(T) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); c.fillStyle = 'rgba(4,18,28,0.97)'; c.fillRect(0, 0, CW, CH);
    c.save(); c.scale(S, S); c.strokeStyle = CYAN; c.lineWidth = 0.8; c.strokeRect(0.6, 0.6, 198.8, 138.8); c.fillStyle = red; c.fillRect(0, 0, 200, 1.4);
    const P = !!(s && s.lay.P), gr = P ? s.lay.grid : [10, 190, 26, 80];
    c.strokeStyle = 'rgba(95,227,255,0.12)'; c.lineWidth = 0.3; for (let x = gr[0]; x <= gr[1]; x += 10) { c.beginPath(); c.moveTo(x, gr[2]); c.lineTo(x, gr[3]); c.stroke(); } for (let y = P ? gr[2] + 2 : 30; y <= gr[3]; y += 10) { c.beginPath(); c.moveTo(P ? gr[0] : 56, y); c.lineTo(P ? gr[1] : 196, y); c.stroke(); }
    if (!s) { text('BONE SET · X-RAY FIELD', 4, 10, 6.4, CYAN); c.restore(); tex.needsUpdate = true; return; }
    const b = s.bone, knit = knitT >= 0;
    // target outline + seams
    path(s.shell, ORIGIN.x, ORIGIN.y); c.fillStyle = knit ? 'rgba(143,227,143,0.16)' : 'rgba(95,227,255,0.10)'; c.fill(); c.setLineDash([2.4, 1.6]); c.lineDashOffset = -T * 4; c.strokeStyle = knit ? GREEN : CYAN; c.lineWidth = 0.9; c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(255,106,90,0.55)'; c.lineWidth = 0.5; c.setLineDash([1, 1.2]); for (const ct of s.cuts) { const dx = -ct.nrm[1], dy = ct.nrm[0], hh = 16; c.beginPath(); c.moveTo(ORIGIN.x + ct.tc - dx * hh, ORIGIN.y - dy * hh); c.lineTo(ORIGIN.x + ct.tc + dx * hh, ORIGIN.y + dy * hh); c.stroke(); } c.setLineDash([]);
    // held fragment: its home glows (green when close enough to lock)
    if (s.held != null) { const f = s.frags[s.held], near = Math.hypot(f.off[0], f.off[1]) <= s.snap; path(f.poly, ORIGIN.x, ORIGIN.y); c.fillStyle = near ? 'rgba(143,227,143,0.35)' : 'rgba(95,227,255,0.18)'; c.fill(); c.strokeStyle = near ? GREEN : '#bff8ff'; c.lineWidth = near ? 1.4 : 0.9; c.stroke(); }
    // reference (landscape only: in portrait the outline is the reference)
    if (!P) { c.save(); c.translate(REF.x, REF.y); c.scale(REF.s, REF.s); path(s.shell, 0, 0); c.fillStyle = '#e8fbff'; c.fill(); c.restore();
    text('REFERENCE', REF.x - 15, REF.y - 14, 4.4, '#9fdcef', 'left', 800); }
    // tray
    c.strokeStyle = '#9fb8c8'; c.lineWidth = 0.6; c.strokeRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h); c.fillStyle = 'rgba(159,184,200,0.08)'; c.fillRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h);
    const loose = s.frags.length - placedN(); if (!P) text(loose ? 'FRAGMENT TRAY · ' + loose + ' LOOSE' : 'TRAY CLEAR', TRAY.x, TRAY.y - 3.2, 4.6, loose ? '#f3f2f2' : GREEN, 'left', 800);
    // header + timer (portrait: in the top bar instead)
    if (!P) { text('CASE ' + (s.round % 4 + 1) + ' OF 4', 4, 7.5, 6, '#ff6a5a'); text(b.name, 4, 15, 6.4, '#f3f2f2'); text(b.label, 4, 22, 4.4, '#9fdcef', 'left', 800);
    const pct = clamp(s.timeLeft / s.total, 0, 1), tc = s.timeLeft < 8 ? '#ff6a5a' : s.timeLeft < 16 ? '#ffb347' : '#f3f2f2';
    c.fillStyle = '#16323f'; c.fillRect(120, 5, 76, 4); c.fillStyle = tc; c.fillRect(120, 5, 76 * pct, 4); text(Math.ceil(s.timeLeft) + 's', 196, 15.5, 7, tc, 'right');
    text(s.placedAll ? '' : placedN() + ' / ' + s.frags.length + ' SET', 196, 22.5, 4.6, '#9fdcef', 'right', 800); }
    // first case: a moving dashed guide from a loose fragment to its place
    if (s.round % 4 === 0 && placedN() === 0 && s.held == null && !s.card && !overlay) { const i = s.frags.findIndex(f => !f.placed), f = s.frags[i], ax = ORIGIN.x + f.home[0] + f.off[0], ay = ORIGIN.y + f.home[1] + f.off[1], bx = ORIGIN.x + f.home[0], by = ORIGIN.y + f.home[1];
      c.setLineDash([2, 2]); c.lineDashOffset = -T * 10; c.strokeStyle = '#ffffff'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.setLineDash([]);
      const q = 0.5 + 0.5 * Math.sin(T * 6); c.strokeStyle = `rgba(255,255,255,${0.5 + q * 0.5})`; c.lineWidth = 1; c.beginPath(); c.arc(ax, ay, 9 + q * 2, 0, 6.283); c.stroke(); }
    // bottom line
    if (!P) text(hintText(), 4, 131, 5.6, knit ? GREEN : s.timeUp ? '#ff6a5a' : '#f3f2f2', 'left', 900);
    // case title card
    if (s.card > 0 && !overlay) { const y0 = P ? 74 : 34, x0 = P ? 48 : 8; c.fillStyle = 'rgba(4,18,28,0.92)'; c.fillRect(0, y0, 200, 34); c.fillStyle = red; c.fillRect(0, y0, 200, 1); text('CASE ' + (s.round % 4 + 1) + ' · ' + b.name, x0, y0 + 12, P ? 7.5 : 9, '#f3f2f2'); text(b.label, x0, y0 + 24, P ? 4.8 : 5.6, '#9fdcef', 'left', 800); }
    c.restore(); tex.needsUpdate = true; dirty = false; }
  function hintText() { const knit = knitT >= 0; return knit ? 'BONE KNITTED' : s.timeUp ? 'TIME' : s.held != null ? (Math.hypot(s.frags[s.held].off[0], s.frags[s.held].off[1]) <= s.snap ? 'GREEN · LET GO TO LOCK' : 'BRING IT TO ITS PLACE') : 'DRAG A FRAGMENT INTO THE OUTLINE'; }
  function drawXray() { const s0 = s; if (!s) s = fresh(save.stat('dsfBoneRound', 0) % 4); try { drawXray0(); } finally { s = s0; } }
  function drawXray0() { xc.fillStyle = '#0d2a3a'; xc.fillRect(0, 0, XW, XH); xc.strokeStyle = CYAN; xc.lineWidth = 6; xc.strokeRect(3, 3, XW - 6, XH - 6);
    if (!s) { tex.needsUpdate = true; xtex.needsUpdate = true; return; }
    const sc = 3.6, ox = XW / 2 + 20, oy = 150, knit = knitT >= 0;
    s.frags.forEach(f => { const dx = f.placed ? f.off[0] : (f.home[0] > 0 ? 3 : -3), dy = f.placed ? f.off[1] : (f.home[1] * 0.1); xc.beginPath(); f.poly.forEach((p, k) => { const x = ox + (p[0] + dx) * sc, y = oy + (p[1] + dy) * sc; k ? xc.lineTo(x, y) : xc.moveTo(x, y); }); xc.closePath(); xc.fillStyle = knit ? '#e8fff0' : '#e8fbff'; xc.fill(); });
    if (!knit) { xc.strokeStyle = '#ff6a5a'; xc.lineWidth = 5; for (const ct of s.cuts) { xc.beginPath(); xc.arc(ox + ct.tc * sc, oy, 34, 0, 6.283); xc.stroke(); } }
    xc.textBaseline = 'middle'; xc.fillStyle = '#ff6a5a'; xc.font = `900 30px ${FONT}`; xc.fillText('CASE ' + (s.round % 4 + 1) + ' OF 4', 24, 36); xc.fillStyle = '#f3f2f2'; xc.font = `900 40px ${FONT}`; xc.fillText(s.bone.name, 24, 74);
    xc.fillStyle = knit ? GREEN : CYAN; xc.font = `900 30px ${FONT}`; xc.fillText(knit ? 'KNITTED · RESTING' : s.bone.label.toUpperCase(), 24, 290); xtex.needsUpdate = true; }
  draw(0); drawXray();

  function render3D(dt, T) { openK = open && !ending ? Math.min(1, openK + dt / 1.2) : Math.max(0, openK - dt / 0.9); const e = openK * openK * (3 - 2 * openK);
    // the lamp ring rises into the ceiling and becomes the emitter
    if (lamp) { const ry = 3.4 + e * (roomH - 0.4 - 3.4); lamp.ring.position.y = ry; lamp.ring.scale.setScalar(1 + e * 0.35); lamp.ring.material.color.set(e > 0.5 ? '#9ff4ff' : '#fff6e0'); const pl = Math.max(0.05, roomH - ry); lamp.pole.scale.y = pl / (roomH - 3.4); lamp.pole.position.y = ry + pl / 2; }
    const [fr, fi] = root.userData.ring; fi.material.opacity = 0.12 + 0.1 * Math.sin(T * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); fr.visible = fi.visible = !open;
    for (const [m, gl] of pillars) { m.material.opacity = e * (0.55 + 0.2 * Math.sin(T * 9)); gl.material.opacity = e * 0.8; }
    field.visible = openK > 0.02; const reveal = clamp((openK - 0.3) / 0.7, 0, 1); glassM.opacity = reveal * 0.95; field.scale.set(1, 1, Math.max(0.02, reveal));
    scanM.opacity = openK > 0 && openK < 1 ? 0.9 : 0.25 + 0.15 * Math.sin(T * 2); scanL.position.z = openK < 1 ? (reveal - 0.5) * PH : Math.sin(T * 0.8) * PH * 0.48;
    // patient: breathing; sits up + wags once healed
    const br = Math.sin(T * 1.6); sheet.scale.y = 1 + br * 0.03; heal = knitT >= 0 ? Math.min(1, heal + dt / 1.4) : Math.max(0, heal - dt);
    head.rotation.z = -heal * 0.5 + br * 0.02; head.position.y = 0.22 + heal * 0.08; tail.rotation.y = heal ? Math.sin(T * 12) * 0.6 * heal : Math.sin(T * 0.7) * 0.08;
    for (let i = sparks.length - 1; i >= 0; i--) { const sp = sparks[i]; sp.t += dt; const k = sp.t / 0.6; sp.sp.scale.setScalar(0.1 + k * (sp.big ? 0.6 : 0.3)); sp.sp.material.opacity = Math.max(0, 1 - k); if (k >= 1) { field.remove(sp.sp); sp.sp.material.dispose(); sparks.splice(i, 1); } }
    if (!s || !field.visible) return;
    if (knitT >= 0) knitT += dt;
    const sweep = knitT >= 0 ? -PW * 0.25 + knitT * 1.2 : -99;
    for (const F of frags3) { const f = s.frags[F.i], held = s.held === F.i, near = held && Math.hypot(f.off[0], f.off[1]) <= s.snap;
      const ty = f.placed ? DEPTH + 0.005 : held ? DEPTH + 0.14 : DEPTH + 0.03; F.y += (ty - F.y) * Math.min(1, dt * 14);
      const fx = F.g.position.x + (F.x - F.g.position.x) * Math.min(1, dt * (held ? 30 : 12)), fz = F.g.position.z + (F.z - F.g.position.z) * Math.min(1, dt * (held ? 30 : 12));
      F.g.position.set(fx, F.y + Math.sin(T * 3 + F.i) * (f.placed ? 0 : 0.006), fz); F.glow = Math.max(0, F.glow - dt * 1.6);
      const kw = knitT >= 0 ? Math.max(0, 1 - Math.abs(F.x - sweep) / 0.25) : 0;
      if (near) F.m.color.set('#c8f5c0'); else if (held) F.m.color.set('#fff8e8'); else F.m.color.set(f.placed ? (knitT >= 0 && heal > 0.5 ? '#f4fff2' : '#f2ead9') : '#ede3cf');
      const gl = Math.max(F.glow * 0.6, kw * 0.9, held ? 0.15 : 0); if (near) F.m.emissive.set('#2f7d3a').multiplyScalar(0.5); else F.m.emissive.setRGB(0.32 + gl * 0.37, 0.3 + gl * 0.89, 0.27 + gl * 1.0); }
    if (knitT >= 0 && knitT < 1.4 && Math.random() < dt * 30) spark(sweep, (Math.random() - 0.5) * 0.12 + toW(0, ORIGIN.y)[1], 0xbff8ff, false); }

  return {
    title: 'BONE SET', where: 'Infirmary · DR. BASHAD', W: 200, H: 140,
    surface: { c: new THREE.Vector3(OX + at.x, YS, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: 4.0, maxY: roomH - 0.8, turn: false },
    frame() { return s && s.lay.P ? s.lay.frame : null; },
    stand: { x: OX + at.x, z: at.z + stZ, face: Math.PI }, _s: () => s,
    idle(dt, T) { if (!open) render3D(dt, T); },
    begin() { open = true; ending = false; overlay = 'intro'; s = fresh(save.stat('dsfBoneRound', 0) % 4); furM.color.set(FUR[s.round % 4]); knitT = -1; heal = 0; buildFrags(); drawXray(); draw(0); setTimeout(() => { if (open) sfx('open'); }, 300); },
    end() { ending = true; killMusic(); if (s) save.setStat('dsfBoneRound', s.done ? s.round + 1 : s.round); if (s) s.held = null; open = false; },
    tick(dt, T, fly) { if (!open) return; if (fly > 0.85 && !ending && overlay === null && s && !s.done && !s.timeUp) music(); else if (overlay !== null || ending) killMusic();
      if (s && !overlay && !s.done && !s.timeUp && fly > 0.85) { if (s.card > 0) { s.card -= dt; if (s.card <= 0) { s.card = 0; dirty = true; } }
        else { s.timeLeft -= dt; if (s.timeLeft <= 0) { s.timeLeft = 0; s.timeUp = true; s.held = null; sfx('time'); dirty = true; const me = s; setTimeout(() => { if (s === me && open) finish(); }, 900); } } }
      if (knitT >= 0 && knitT < 0.1) drawXray();
      render3D(dt, T); drawT += dt; if (dirty || drawT > 0.1) { drawT = 0; draw(T); } },
    down(x, y) { if (overlay || !s || s.done || s.timeUp || s.card > 0) return;
      let pick = -1; for (let i = s.frags.length - 1; i >= 0; i--) { const f = s.frags[i]; if (f.placed) continue; if (inPoly(f.poly, x - ORIGIN.x - f.off[0], y - ORIGIN.y - f.off[1])) { pick = i; break; } }
      if (pick < 0) { let bd = 9; s.frags.forEach((f, i) => { if (f.placed) return; const d = Math.hypot(x - (ORIGIN.x + f.home[0] + f.off[0]), y - (ORIGIN.y + f.home[1] + f.off[1])); if (d < bd) { bd = d; pick = i; } }); }
      if (pick < 0) return; const f = s.frags[pick]; s.held = pick; s.grab = [x - f.off[0], y - f.off[1]]; wasNear = false; sfx('lift'); dirty = true; },
    move(x, y) { if (!s || s.held == null) return; const f = s.frags[s.held]; f.off = [x - s.grab[0], y - s.grab[1]]; place(false); const near = Math.hypot(f.off[0], f.off[1]) <= s.snap; if (near && !wasNear) sfx('near'); if (near !== wasNear) dirty = true; wasNear = near; },
    up() { if (!s || s.held == null) return; const i = s.held, f = s.frags[i], d = Math.hypot(f.off[0], f.off[1]); if (d <= s.snap) lock(i, d); else { sfx('drop'); s.held = null; dirty = true; } },
    hud() { if (overlay === 'intro') return { card: { kicker: 'Infirmary · Dr. Bashad', title: 'Bone Set', body: 'Drag each fragment from the tray into the outline. Green means close: let go and it locks.', buttons: ['SET THE BONE', 'NOT NOW'] } };
      if (overlay === 'card' && cardInfo) return { card: cardInfo };
      if (!s) return {}; if (s.lay.P) return { where: s.card > 0 ? 'CASE ' + (s.round % 4 + 1) + ' · ' + s.bone.name + ' · ' + s.bone.label : hintText(), showStats: true, stats: [['Case', (s.round % 4 + 1) + ' of 4'], ['Set', placedN() + ' / ' + s.frags.length], ['Time', Math.ceil(s.timeLeft) + 's', s.timeLeft < 8 ? '#ec3013' : s.timeLeft < 16 ? '#ffd23a' : '#f3f2f2']] }; return { stats: [['Case', (s.round % 4 + 1) + ' of 4'], ['Set', placedN() + ' / ' + s.frags.length], ['Time', Math.ceil(s.timeLeft) + 's']] }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); overlay = null; dirty = true; } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) newCase(s.round + 1); else return 'leave'; } },
  };
}
