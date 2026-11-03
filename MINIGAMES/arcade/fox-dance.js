// 8 GATES — ARCADE · FOX DANCE [arcadeDance], IN WORLD (s101, Ben: "do the same for FOX DANCE": play on the Meru Lanes dance machine, no panel).
// The arrows scroll on the machine's own big screen; the camera sits behind your fox on the pad; 1 or 2 players (both pads, P2 = Hope).
// Synth beat for now (Ben will send MP3s). Arrows: P1 ← ↓ ↑ →, P2 D F J K (1P: both sets play P1); phones tap the lane buttons the page draws.
// createFoxDance({ THREE, group, side, screen, camera, isMuted, save, touch, onState }) → { camera, pads, yaw, update(dt), pose(fox, p), key(code), hit(p, ln), pick(n), again(), hud(), destroy() }
export const FOXDANCE = { key: 'arcadeDance', name: 'FOX DANCE', song: 'MERU MIX', bpm: 120, bars: 34, intro: 2, maxPlayers: 2 };
const AR = ['#ff3d9a', '#2ee6ff', '#ffd23a', '#7cff6b'], ROT = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
const WIN = [[0.05, 'PERFECT', 300, '#ffd23a'], [0.095, 'GREAT', 200, '#7cff6b'], [0.145, 'GOOD', 100, '#2ee6ff']], MISS = 0.145;
const E8 = 60 / FOXDANCE.bpm / 2, SONG = FOXDANCE.bars * 8 * E8, INTRO = FOXDANCE.intro * 8 * E8;
const CH = [[45, 0], [41, 1], [48, 1], [43, 1]];   // A minor · F · C · G (root midi, major?)
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function rng(seed) { let s = (seed >>> 0) || 7; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const secOf = bar => bar < 10 ? 0 : bar < 18 ? 1 : bar < 26 ? 2 : bar < FOXDANCE.bars - 1 ? 3 : 4;
function makeChart(seed) { const r = rng(seed), notes = []; let last = -1, rep = 0;
  for (let bar = FOXDANCE.intro; bar < FOXDANCE.bars - 1; bar++) { const sec = secOf(bar);
    for (let e = 0; e < 8; e++) { if (e % 2 && r() >= [0, 0.3, 0.55, 0.4][sec]) continue; if (sec === 0 && e % 4 && r() < 0.5) continue;
      let ln = Math.floor(r() * 4); if (ln === last) { if (++rep >= 2) { ln = (ln + 1 + Math.floor(r() * 3)) % 4; rep = 0; } } else rep = 0; last = ln;
      const t = (bar * 8 + e) * E8; notes.push({ t, ln }); if (sec >= 2 && e % 4 === 0 && r() < 0.14) notes.push({ t, ln: (ln + 2) % 4 }); } }
  notes.push({ t: (FOXDANCE.bars - 1) * 8 * E8, ln: 0 }, { t: (FOXDANCE.bars - 1) * 8 * E8, ln: 3 });   // the last hit: a jump
  return notes; }
function makeAudio() { let ctx = null; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} if (!ctx) return null;
  const master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  const nb = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const env = (g, t, a, dur) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
  const kick = t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.2); env(g, t, 0.9, 0.3); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.32); };
  const noise = (t, hp, a, dur) => { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = nb; f.type = 'highpass'; f.frequency.value = hp; env(g, t, a, dur); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02); };
  const tone = (t, fr, type, a, dur, lp) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(fr, t); let n = o; if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); n = f; } env(g, t, a, dur); n.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03); };
  return { ctx, master, kick, hat: t => noise(t, 7000, 0.1, 0.04), snare: t => { noise(t, 1600, 0.32, 0.17); tone(t, 190, 'triangle', 0.18, 0.08); }, crash: t => noise(t, 4000, 0.25, 1.2), tone }; }
function arrowPath(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s / 30, s / 30); g.beginPath(); g.moveTo(0, -30); g.lineTo(28, 2); g.lineTo(11, 2); g.lineTo(11, 28); g.lineTo(-11, 28); g.lineTo(-11, 2); g.lineTo(-28, 2); g.closePath(); g.restore(); }

export function createFoxDance({ THREE, group, side, screen, camera: worldCam, isMuted = () => false, save = null, touch = false, foxH = 2.0, onState = () => {} }) {
  const sd = side < 0 ? -1 : 1, zl = sd < 0 ? -0.85 : 0.85, V = (x, y, z) => new THREE.Vector3(x, y, z);
  group.updateWorldMatrix(true, false); const L2W = (x, y, z) => group.localToWorld(V(x, y, z)), gq = new THREE.Quaternion(); group.getWorldQuaternion(gq);
  const gyaw = new THREE.Euler().setFromQuaternion(gq, 'YXZ').y, yaw = gyaw + (sd < 0 ? Math.PI / 2 : -Math.PI / 2);
  const pads = [L2W(sd * 2.0, 0.14, zl), L2W(sd * 2.0, 0.14, -zl)];
  // ---------- the machine screen becomes the game ----------
  const cv = document.createElement('canvas'); cv.width = touch ? 768 : 1024; cv.height = Math.round(cv.width * 1.8 / 3.4); const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const mat0 = screen.material, mat = new THREE.MeshBasicMaterial({ map: tex }); screen.material = mat;
  // ---------- light-up arrows on both pads ----------
  const atx = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#fff'; arrowPath(g, 32, 32, 26, 0); g.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const padFx = [], fwd = [-sd, 0], right = [0, -sd], DIRS = [[-right[0], -right[1]], [-fwd[0], -fwd[1]], fwd, right];
  for (let p = 0; p < 2; p++) { const pz = p ? -zl : zl, row = [];
    for (let ln = 0; ln < 4; ln++) { const d = DIRS[ln], m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: atx, color: AR[ln], transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.position.set(sd * 2.0 + d[0] * 0.46, 0.165, pz + d[1] * 0.46); m.rotation.y = Math.atan2(-d[0], -d[1]); group.add(m); row.push(m); } padFx.push(row); }
  // ---------- state ----------
  let phase = 'pick', players = 1, sel = 0, A = null, t0 = 0, tp0 = 0, nextE = 0, chart = [], ps = [], res = null, lastEmit = 0, dirty = true;
  const best = () => (save && save.stat ? save.stat(FOXDANCE.key + '.best', 0) : 0) || 0;
  const now = () => performance.now() / 1000;
  const songT = () => phase === 'pick' ? -99 : A ? A.ctx.currentTime - t0 - (A.ctx.outputLatency || A.ctx.baseLatency || 0) : now() - tp0;
  const newP = () => ({ score: 0, combo: 0, max: 0, cnt: [0, 0, 0, 0], next: 0, notes: chart.map(n => ({ ...n, j: 0 })), judge: null, press: [-9, -9, -9, -9], fx: [], poseLane: -1, poseT: -9 });
  function start() { if (!A) A = makeAudio(); if (A && A.ctx.state === 'suspended') A.ctx.resume();
    chart = makeChart((Math.random() * 1e9) | 0); ps = Array.from({ length: players }, newP); res = null; nextE = 0; t0 = A ? A.ctx.currentTime + 0.25 : 0; tp0 = now() + 0.25; phase = 'play'; fitKey = ''; dirty = true; }
  function finish() { phase = 'done'; const b0 = best(); let top = 0;
    res = ps.map((pl, i) => { const tot = pl.notes.length || 1, acc = (pl.cnt[0] + pl.cnt[1] * 0.7 + pl.cnt[2] * 0.4) / tot, gr = acc >= 0.95 ? 'S' : acc >= 0.85 ? 'A' : acc >= 0.7 ? 'B' : acc >= 0.5 ? 'C' : 'D'; top = Math.max(top, pl.score);
      return { name: i ? 'P2 \u00b7 HOPE' : (players > 1 ? 'P1 \u00b7 YOU' : 'YOU'), col: i ? '#2ee6ff' : '#ff3d9a', grade: gr, score: pl.score, max: pl.max, cnt: pl.cnt.slice(), acc: Math.round(acc * 100) }; });
    res.newBest = top > b0; if (res.newBest && save && save.setStat) save.setStat(FOXDANCE.key + '.best', top); res.best = Math.max(b0, top);
    try { window.postMessage({ type: '8gates:score', score: top }, '*'); } catch (e) {} dirty = true; }
  function judge(pl, w) { const [, txt, pts, col] = w; pl.combo++; pl.max = Math.max(pl.max, pl.combo); pl.score += pts + Math.min(pl.combo, 50) * 2; pl.cnt[WIN.indexOf(w)]++; pl.judge = { txt, col, t: now() }; }
  function hit(p, ln) { if (phase !== 'play') return; const pl = ps[p]; if (!pl) return; const st = songT(); pl.press[ln] = now(); pl.poseLane = ln; pl.poseT = now(); stepPress(pl, ln);
    let best = null, bd = 9; for (let i = pl.next; i < pl.notes.length; i++) { const n = pl.notes[i]; if (n.t - st > MISS) break; if (n.j || n.ln !== ln) continue; const d = Math.abs(n.t - st); if (d <= MISS && d < bd) { bd = d; best = n; } }
    if (!best) return; best.j = 1; const w = WIN.find(q => bd <= q[0]) || WIN[2]; judge(pl, w); pl.fx.push({ ln, t: now(), col: w[3] }); }
  function key(code) {
    if (phase === 'pick') { if (/ArrowLeft|ArrowUp|KeyA|KeyW/.test(code)) sel = 0; else if (/ArrowRight|ArrowDown|KeyD|KeyS/.test(code)) sel = 1; else if (code === 'Digit1') pick(1); else if (code === 'Digit2') pick(2); else if (code === 'Enter' || code === 'Space') pick(sel + 1); dirty = true; return; }
    if (phase === 'done') { if (code === 'Enter' || code === 'Space') again(); return; }
    const P1 = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }, P2 = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 };
    if (code in P1) hit(0, P1[code]); else if (code in P2) hit(players > 1 ? 1 : 0, P2[code]); }
  function pick(n) { if (phase !== 'pick') return; players = n === 2 ? 2 : 1; sel = players - 1; start(); }
  function again() { start(); }
  // ---------- music ----------
  function schedule() { if (!A) return; A.master.gain.value = isMuted() ? 0 : 0.5; const ct = A.ctx.currentTime;
    while (t0 + nextE * E8 < ct + 0.2 && nextE <= FOXDANCE.bars * 8) { const e = nextE++, t = t0 + e * E8, bar = Math.floor(e / 8), e8 = e % 8, sec = bar < FOXDANCE.intro ? -1 : secOf(bar), [root, maj] = CH[Math.floor(bar / 1) % 4];
      if (bar >= FOXDANCE.bars) { A.kick(t); A.crash(t); A.tone(t, mtof(57), 'square', 0.08, 1.0, 2400); continue; }
      if (e8 % 2 === 0) A.kick(t); if (e8 % 2 === 1) A.hat(t); if (sec >= 2) A.hat(t + E8 / 2);
      if (sec >= 1 && (e8 === 2 || e8 === 6)) A.snare(t);
      if (sec >= 0) A.tone(t, mtof(root + (e8 % 2 ? 12 : 0)), 'sawtooth', 0.16, E8 * 0.9, 700);
      if (sec >= 1 && sec !== 4) { const arp = [0, maj ? 4 : 3, 7, 12, 7, maj ? 4 : 3, 0, 7][e8]; A.tone(t, mtof(root + 24 + arp), 'square', sec >= 2 ? 0.05 : 0.035, E8 * 0.7, 3000); }
      if (sec === 3 && e8 === 0) A.tone(t, mtof(root + 36 + 7), 'triangle', 0.06, E8 * 3.5); } }
  // ---------- the screen ----------
  function draw() { const g = cx, W = cv.width, H = cv.height, k = W / 1024, st = songT(), F = 'Archivo, sans-serif';
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#120c22'; g.fillRect(0, 0, W, H);
    if (phase === 'play') { const bt = (Math.max(0, st) / (E8 * 2)) % 1; g.fillStyle = 'rgba(46,230,255,' + (0.1 * (1 - bt)).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    g.strokeStyle = '#2ee6ff'; g.lineWidth = 6 * k; g.strokeRect(3 * k, 3 * k, W - 6 * k, H - 6 * k);
    if (phase === 'pick') { g.fillStyle = '#fff'; g.font = '900 ' + Math.round(104 * k) + 'px ' + F; g.fillText('FOX DANCE', 56 * k, 140 * k); g.fillStyle = '#ffd23a'; g.font = '800 ' + Math.round(28 * k) + 'px ' + F; g.fillText(FOXDANCE.song + ' \u00b7 ' + FOXDANCE.bpm + ' BPM \u00b7 BEST ' + best().toLocaleString(), 60 * k, 190 * k);
      ['1 PLAYER', '2 PLAYERS'].forEach((t, i) => { const x = 56 * k + i * 470 * k, y = 250 * k, w = 440 * k, h = 120 * k; if (i === sel) { g.fillStyle = '#ec3013'; g.fillRect(x, y, w, h); } g.strokeStyle = '#fff'; g.lineWidth = 4 * k; g.strokeRect(x, y, w, h); g.fillStyle = '#fff'; g.font = '900 ' + Math.round(54 * k) + 'px ' + F; g.fillText(t, x + 26 * k, y + 80 * k); });
      g.fillStyle = '#cfcac4'; g.font = '800 ' + Math.round(24 * k) + 'px ' + F; g.fillText(touch ? 'TAP 1 PLAYER OR 2 PLAYERS' : '\u2190 \u2192 TO CHOOSE \u00b7 ENTER TO DANCE', 60 * k, 440 * k);
      for (let i = 0; i < 22; i++) { const bh = (14 + ((i * 37) % 60)) * k * (0.6 + 0.4 * Math.abs(Math.sin(now() * 3 + i))); g.fillStyle = AR[i % 4]; g.fillRect(60 * k + i * 42 * k, H - 22 * k - bh, 30 * k, bh); }
      tex.needsUpdate = true; return; }
    if (phase === 'done' && res) { g.fillStyle = '#fff'; g.font = '900 ' + Math.round(64 * k) + 'px ' + F; g.fillText('RESULTS', 56 * k, 96 * k); g.fillStyle = '#ffd23a'; g.font = '800 ' + Math.round(26 * k) + 'px ' + F; g.fillText(res.newBest ? 'NEW BEST! ' + res.best.toLocaleString() : 'BEST ' + res.best.toLocaleString(), 60 * k, 136 * k);
      res.forEach((r, i) => { const x = 56 * k + i * 470 * k, y = 170 * k, w = 440 * k; g.strokeStyle = r.col; g.lineWidth = 4 * k; g.strokeRect(x, y, w, 300 * k); g.fillStyle = r.col; g.font = '900 ' + Math.round(150 * k) + 'px ' + F; g.fillText(r.grade, x + 22 * k, y + 160 * k);
        g.fillStyle = '#fff'; g.font = '800 ' + Math.round(24 * k) + 'px ' + F; g.fillText(r.name, x + 170 * k, y + 50 * k); g.font = '900 ' + Math.round(46 * k) + 'px ' + F; g.fillText(r.score.toLocaleString(), x + 170 * k, y + 104 * k);
        g.font = '800 ' + Math.round(22 * k) + 'px ' + F; g.fillStyle = '#cfcac4'; g.fillText('MAX COMBO ' + r.max + ' \u00b7 ' + r.acc + '%', x + 170 * k, y + 144 * k);
        ['PERFECT', 'GREAT', 'GOOD', 'MISS'].forEach((t, j) => { g.fillStyle = j < 3 ? WIN[j][3] : '#ff5a4a'; g.fillText(t, x + 22 * k, y + 214 * k + j * 0 + (j > 1 ? 40 * k : 0)); }); });
      res.forEach((r, i) => { const x = 56 * k + i * 470 * k, y = 170 * k; g.font = '800 ' + Math.round(22 * k) + 'px ' + F; [0, 1, 2, 3].forEach(j => { const cx2 = x + 22 * k + (j % 2) * 210 * k, cy2 = y + 214 * k + Math.floor(j / 2) * 40 * k; g.fillStyle = '#120c22'; g.fillRect(cx2 - 2 * k, cy2 - 24 * k, 200 * k, 32 * k); g.fillStyle = j < 3 ? WIN[j][3] : '#ff5a4a'; g.fillText(['PERFECT', 'GREAT', 'GOOD', 'MISS'][j] + ' ' + r.cnt[j], cx2, cy2); }); });
      tex.needsUpdate = true; return; }
    const n2 = players > 1, lw = (n2 ? 84 : 100) * k, ty = 74 * k, SPD = 300 * k, cols = n2 ? [W * 0.29, W * 0.71] : [W / 2], tnow = now();
    ps.forEach((pl, p) => { const x0 = cols[p] - lw * 2;
      g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(x0, 0, lw * 4, H);
      for (let ln = 0; ln < 4; ln++) { const ax = x0 + lw * (ln + 0.5), pr = Math.max(0, 1 - (tnow - pl.press[ln]) / 0.14); arrowPath(g, ax, ty, lw * 0.4, ROT[ln]); if (pr > 0) { g.globalAlpha = 0.35 + 0.5 * pr; g.fillStyle = AR[ln]; g.fill(); g.globalAlpha = 1; } g.strokeStyle = pr > 0 ? '#fff' : 'rgba(255,255,255,0.55)'; g.lineWidth = 4 * k; g.stroke(); }
      for (let i = Math.max(0, pl.next - 6); i < pl.notes.length; i++) { const n = pl.notes[i], y = ty + (n.t - st) * SPD; if (y > H + 60 * k) break; if (n.j || y < ty - 70 * k) continue; arrowPath(g, x0 + lw * (n.ln + 0.5), y, lw * 0.4, ROT[n.ln]); g.fillStyle = AR[n.ln]; g.fill(); g.strokeStyle = '#120c22'; g.lineWidth = 3 * k; g.stroke(); }
      pl.fx = pl.fx.filter(f => tnow - f.t < 0.25); for (const f of pl.fx) { const a = (tnow - f.t) / 0.25; g.strokeStyle = f.col; g.globalAlpha = 1 - a; g.lineWidth = 6 * k; g.beginPath(); g.arc(x0 + lw * (f.ln + 0.5), ty, lw * (0.45 + a * 0.4), 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (pl.judge && tnow - pl.judge.t < 0.6) { const a = Math.min(1, (0.6 - (tnow - pl.judge.t)) / 0.2), s = 1 + Math.max(0, 0.12 - (tnow - pl.judge.t)) * 2; g.globalAlpha = a; g.fillStyle = pl.judge.col; g.textAlign = 'center'; g.font = '900 ' + Math.round(54 * k * s) + 'px ' + F; g.fillText(pl.judge.txt, cols[p], H * 0.52); if (pl.combo > 2) { g.fillStyle = '#fff'; g.font = '900 ' + Math.round(30 * k) + 'px ' + F; g.fillText(pl.combo + ' COMBO', cols[p], H * 0.52 + 40 * k); } g.textAlign = 'left'; g.globalAlpha = 1; }
      g.fillStyle = '#120c22'; g.fillRect(x0, H - 66 * k, lw * 4, 46 * k); g.fillStyle = p ? '#2ee6ff' : '#ff3d9a'; g.fillRect(x0, H - 66 * k, 8 * k, 46 * k); g.fillStyle = '#fff'; g.font = '900 ' + Math.round(30 * k) + 'px ' + F; g.fillText((n2 ? (p ? 'P2 ' : 'P1 ') : '') + pl.score.toLocaleString(), x0 + 18 * k, H - 32 * k); });
    if (st < INTRO) { const b = Math.floor(st / (E8 * 2)), txt = b < 4 ? 'READY' : ['3', '2', '1', 'GO!'][Math.min(3, b - 4)]; g.fillStyle = '#ffd23a'; g.textAlign = 'center'; g.font = '900 ' + Math.round((b < 4 ? 80 : 130) * k) + 'px ' + F; g.fillText(txt, W / 2, H * 0.62); g.textAlign = 'left'; }
    g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, H - 12 * k, W, 12 * k); g.fillStyle = '#ec3013'; g.fillRect(0, H - 12 * k, W * Math.max(0, Math.min(1, st / SONG)), 12 * k);
    tex.needsUpdate = true; }
  // ---------- camera: behind the fox, the screen + both pads in shot (fitted per screen shape) ----------
  const cam = new THREE.PerspectiveCamera(worldCam.fov || 55, 1, 0.05, 200), tcam = cam.clone(), pv = V(0, 0, 0); let fitKey = '';
  // s101b (Ben: "make the screen AND the player visible, desktop + mobile"): the fox is ~2 m tall, so a straight shot from behind hides the screen.
  // Search pitch (how high the camera looks down) × yaw (how far round to the side) × distance: every candidate must fit the screen + the fox(es) in frame
  // (above the phone buttons), and the winner is the one where the fox covers the least of the arrow area, then the closest.
  function fit() { const Wd = innerWidth || 1, Hd = innerHeight || 1, key = Wd + 'x' + Hd + ':' + players + phase; if (key === fitKey) return; fitKey = key;
    const n2 = players > 1 || phase === 'pick', port = Hd > Wd, FH = foxH, aw = n2 ? 1.6 : 0.95, zc = n2 ? 0 : zl * 0.5;
    const scr = [L2W(sd * 0.3, 3.45, aw), L2W(sd * 0.3, 3.45, -aw), L2W(sd * 0.3, 1.72, aw), L2W(sd * 0.3, 1.72, -aw)];
    const foxes = (n2 ? [zl, -zl] : [zl]).map(pz => [L2W(sd * 2.0, FH, pz + 0.4), L2W(sd * 2.0, FH, pz - 0.4), L2W(sd * 2.0, 0.15, pz + 0.4), L2W(sd * 2.0, 0.15, pz - 0.4), L2W(sd * 2.0 + sd * 0.3, FH * 0.6, pz), L2W(sd * 2.0 - sd * 0.3, FH * 0.6, pz)]);
    const pts = [...scr, ...foxes.flat()];
    const btm = touch ? (phase === 'play' ? (port && players > 1 ? 250 : 130) : 200) : 40, yMin = -1 + 2 * btm / Hd + 0.02, yMax = 1 - 2 * (port ? 70 : 76) / Hd;
    tcam.fov = worldCam.fov || 55; tcam.aspect = Wd / Hd; tcam.updateProjectionMatrix();
    const C = L2W(sd * 1.15, 1.75, zc), side = n2 ? 0 : (zl > 0 ? 1 : -1), rect = P => { let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of P) { pv.copy(p).project(tcam); x0 = Math.min(x0, pv.x); x1 = Math.max(x1, pv.x); y0 = Math.min(y0, pv.y); y1 = Math.max(y1, pv.y); } return [x0, x1, y0, y1]; };
    const place = (pitch, yo, D) => { const dl = V(-sd * Math.cos(pitch) * Math.cos(yo), -Math.sin(pitch), Math.cos(pitch) * Math.sin(yo)).applyQuaternion(gq).normalize(); tcam.position.copy(C).addScaledVector(dl, -D); tcam.lookAt(C); tcam.updateMatrixWorld(); };
    const fits = () => { for (const p of pts) { pv.copy(p).project(tcam); if (pv.z > 1 || pv.z < -1 || Math.abs(pv.x) > 0.95 || pv.y > yMax || pv.y < yMin) return false; } return true; };
    let best = null;
    for (const pitch of [0.12, 0.22, 0.32, 0.42, 0.52, 0.62]) for (const yo of [0, 0.25, 0.45, 0.65, -0.25, -0.45]) {
      let lo = 2.2, hi = 7.5; place(pitch, yo, hi); if (!fits()) continue;
      for (let i = 0; i < 14; i++) { const D = (lo + hi) / 2; place(pitch, yo, D); if (fits()) hi = D; else lo = D; }
      place(pitch, yo, hi); const S = rect(scr), sa = Math.max(1e-4, (S[1] - S[0]) * (S[3] - S[2])); let cover = 0;
      for (const F of foxes) { const R2 = rect(F), ox = Math.max(0, Math.min(S[1], R2[1]) - Math.max(S[0], R2[0])), oy = Math.max(0, Math.min(S[3], R2[3]) - Math.max(S[2], R2[2])); cover += ox * oy / sa; }
      const score = cover * 12 + hi * 0.35 - sa * 1.5 + pitch * 0.4 + Math.abs(yo) * 0.3 + (side && yo * side > 0 ? 0.2 : 0);
      if (!best || score < best.score) best = { score, pitch, yo, D: hi }; }
    if (!best) best = { pitch: port ? 0.5 : 0.35, yo: 0, D: 7.5 };
    place(best.pitch, best.yo, best.D); cam.fov = tcam.fov; cam.aspect = tcam.aspect; cam.updateProjectionMatrix(); cam.position.copy(tcam.position); cam.quaternion.copy(tcam.quaternion); cam.updateMatrixWorld(); }
  fit();
  // ---------- dance poses (applied after the walk's own fox animation) ----------
  // s101c+d STEPS (Ben: "legs actually move to tap the arrow" → "polish it, especially front and back"): the legs are stiff hip pivots (no knee),
  // so a step is a LUNGE: the hips slide halfway towards the arrow and drop, the stepping leg reaches the arrow while the other leg stays planted on its
  // spot (both feet on the pad, no floating goose-step). Phases: LIFT (the leg kicks up past the target, body rises) → PLANT (stomp, extra dip) → HOLD → HOME.
  // Fox-local: faces +z, +x = its left; legs[0] = right leg, legs[1] = left leg. ← left leg out left · → right leg out right · ↑ / ↓ alternate legs.
  const REACH = 0.46, T_LIFT = 0.06, T_PLANT = 0.11, T_HOLD = 0.22, T_HOME = 0.36;
  function stepPress(pl, ln) { if (!pl.legs) pl.legs = [null, null]; const leg = ln === 0 ? 1 : ln === 3 ? 0 : (pl.alt = !pl.alt) ? 0 : 1; pl.legs[leg] = { ln, t: now() }; }
  const ease = u => u * u * (3 - 2 * u);
  function rig(f) { const B = f.userData.P; if (B._dz) return B._dz; const ws = V(1, 1, 1); f.getWorldScale(ws); const L = B.legs && B.legs[0]; B._dz = { s: ws.x || 1, hip: Math.max(0.2, 0.415 * (L ? L.scale.y : 1)) }; return B._dz; }
  function geo(ln, R) { const r = REACH / R.s;   // the arrow, in the fox's own units
    if (ln === 0 || ln === 3) { const mid = (r - 0.14) / 2; return { side: true, sign: ln === 0 ? 1 : -1, mid, th: Math.asin(Math.min(0.85, mid / R.hip)) }; }
    const mid = r / 2; return { side: false, sign: ln === 2 ? 1 : -1, mid, th: Math.asin(Math.min(0.85, mid / R.hip)) }; }
  // s612 JOINTED DANCER (Ben): a fox with elbows + knees (the player) dances through engine/fox-poses.js: each foot really steps onto its
  // arrow (two-bone IK, knees bend, the body shifts its weight over it), the arms hit a STYLE MOVE per arrow (← / → fling that arm out,
  // ↑ disco point, ↓ low double pump, jump = both arms up), a bounce + finger snaps on the beat between steps, and the face follows the
  // game: grinning on a combo, excited past 10, a flinch on a MISS, eyes squeezed happy on PERFECT. Unjointed foxes (Hope) keep the old pose.
  let FP = null; import(new URL('../../engine/fox-poses.js?v=s645', import.meta.url).href).then(m => { FP = m; }).catch(() => {});
  const two = v => [v.slice(), v.slice()], mixv = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
  function poseJ(f, p) { const u = f.userData, B = u.P, pl = ps[p], R = rig(f), st = songT(), on = phase === 'play' && st > 0, tn = now(), bt = Math.max(0, st) / (E8 * 2), r = REACH / R.s;
    const D = FP.neutralD(), sq = Math.sin(bt * Math.PI * 2), bnc = on ? Math.abs(Math.sin(bt * Math.PI)) : 0; let act = 0, styleLn = -1, styleK = 0, jump = 0;
    D.mood = 'happy'; D.g = [0.45, 0.45]; D.a = [[0.12, -0.42, 0.22], [0.12, -0.42, 0.22]]; D.pole = two([0.7, -1, -0.3]); D.palm = two([-0.6, 0, 0.4]);
    const both = pl && pl.legs && pl.legs[0] && pl.legs[1] && Math.abs(pl.legs[0].t - pl.legs[1].t) < 0.05 && tn - pl.legs[0].t < T_HOME;
    for (let leg = 0; leg < 2; leg++) { const S = pl && pl.legs && pl.legs[leg], LG = B.legs[leg], ls = Math.sign(LG.position.x) || (leg ? 1 : -1); if (!S) continue; const t = tn - S.t;
      if (t < 0.7 && (styleLn < 0 || t < tn - (pl.legs[1 - leg] || { t: -9 }).t)) { styleLn = S.ln; styleK = t < 0.08 ? ease(t / 0.08) : 1 - ease(Math.max(0, (t - 0.38) / 0.32)); }
      if (t >= T_HOME) continue; const k = t < T_PLANT ? ease(Math.min(1, t / T_PLANT)) : t < T_HOLD ? 1 : 1 - ease((t - T_HOLD) / (T_HOME - T_HOLD)), up = t < T_PLANT ? Math.sin(Math.PI * Math.min(1, t / T_PLANT)) : (t > T_HOLD ? Math.sin(Math.PI * (t - T_HOLD) / (T_HOME - T_HOLD)) * 0.5 : 0);
      act = Math.max(act, k); let fx = LG.position.x, fz = 0.02;
      if (S.ln === 0 || S.ln === 3) { fx = (S.ln === 0 ? 1 : -1) * r; D.bx += (S.ln === 0 ? 1 : -1) * (r - Math.abs(LG.position.x)) * 0.45 * k; D.roll += (S.ln === 0 ? -1 : 1) * 0.08 * k; D.head[1] += (S.ln === 0 ? 1 : -1) * 0.35 * k; }
      else { fz = (S.ln === 2 ? 1 : -1) * r; D.bz += (S.ln === 2 ? 1 : -1) * r * 0.4 * k; D.lean += (S.ln === 2 ? 0.1 : -0.06) * k; }
      fx = LG.position.x + (fx - LG.position.x) * k; fz = 0.02 + (fz - 0.02) * k;
      D.l[leg] = [(fx - LG.position.x) * ls, 0.05 + up * 0.14, fz]; D.lpole[leg] = S.ln === 1 ? [0.2, 0, 1] : [S.ln === 0 || S.ln === 3 ? 0.5 : 0, 0, 1]; if (both) jump = Math.max(jump, up); }
    D.drop += 0.05 * act + (on ? (1 - bnc) * 0.05 * (1 - act) : 0) - jump * 0.12; D.head[0] += 0.12 * act;
    if (on && act < 0.5) { const gk = 1 - act * 2; D.a[0][1] += sq * 0.06 * gk; D.a[1][1] -= sq * 0.06 * gk; D.twist += Math.sin(bt * Math.PI) * 0.12 * gk; D.roll += Math.sin(bt * Math.PI) * 0.05 * gk;
      const f8 = (st / E8) % 2, snap = Math.exp(-Math.pow(Math.min(f8, 2 - f8) / 0.12, 2)); D.g = [0.45 + snap * 0.5, 0.45 + snap * 0.5]; D.head[2] += Math.sin(bt * Math.PI) * 0.08 * gk; }
    if (styleLn >= 0) { const k = styleK, sgn = styleLn === 0 ? 1 : -1, iS = a => (Math.sign(B.arms[a].position.x) || (a ? 1 : -1)), side = [0, 1].find(a => iS(a) === sgn), other = 1 - side;
      if (both) { D.a = D.a.map(v => mixv(v, [0.22, 0.62, 0.08], k)); D.g = D.g.map(g => g + (0.05 - g) * k); D.spread = 1.5; D.mood = 'excited'; }
      else if (styleLn === 0 || styleLn === 3) { D.a[side] = mixv(D.a[side], [0.6, 0.12, 0.12], k); D.palm[side] = mixv(D.palm[side], [0, 0.1, 1], k); D.g[side] += (0.05 - D.g[side]) * k; D.ext[side] = 0.8 * k;
        D.a[other] = mixv(D.a[other], [-0.34, -0.12, 0.36], k); D.pole[other] = mixv(D.pole[other], [0.9, -0.8, 0], k); D.g[other] += (1 - D.g[other]) * k; }
      else if (styleLn === 2) { const pa = (Math.floor(st / (E8 * 4)) % 2) ? 1 : 0; D.a[pa] = mixv(D.a[pa], [0.18, 0.62, 0.22], k); D.g[pa] += (1 - D.g[pa]) * k; D.pt[pa] = k; D.ext[pa] = k; D.palm[pa] = mixv(D.palm[pa], [-0.5, 0, 0.6], k);
        D.a[1 - pa] = mixv(D.a[1 - pa], [-0.12, -0.52, -0.02], k); D.pole[1 - pa] = mixv(D.pole[1 - pa], [1, 0, -0.35], k); D.palm[1 - pa] = mixv(D.palm[1 - pa], [-1, 0, 0], k); D.head[0] -= 0.15 * k; D.lookY = -0.5 * k; }
      else { D.a = D.a.map(v => mixv(v, [-0.06, -0.5, 0.34], k)); D.pole = D.pole.map(v => mixv(v, [0.6, -1, -0.2], k)); D.g = D.g.map(g => g + (1 - g) * k); D.drop += 0.05 * k; D.head[0] += 0.08 * k; } }
    const J = pl && pl.judge, jt = J ? tn - J.t : 9, combo = pl ? pl.combo : 0;
    if (J && J.txt === 'MISS' && jt < 0.45) { D.mood = 'shock'; D.head[0] -= 0.1; }
    else if (J && J.txt === 'PERFECT' && jt < 0.3) D.mood = 'joy';
    else if (combo >= 10) D.mood = 'excited';
    D.mp = D.mood === 'shock' ? null : { smile: combo >= 10 ? 0.95 : 0.7, open: combo >= 10 ? 0.25 : 0.05, teeth: combo >= 3 ? 0.9 : 0.4, wide: 0.75 };
    if (!on) { D.a = two([0.06, -0.62, 0.06]); D.mp = { smile: 0.5, wide: 0.6 }; }
    FP.applyD(THREE, f, D, tn, 1); u._fdJ = true; }
  function pose(f, p) { if (FP && f && f.userData && f.userData.P && f.userData.P.fore) return poseJ(f, p); const B = f && f.userData && f.userData.P, pl = ps[p]; if (!B || !B.body || !B.legs) return; const R = rig(f), st = songT(), on = phase === 'play' && st > 0, bt = Math.max(0, st) / (E8 * 2), tn = now();
    const s = Math.sin(bt * Math.PI); let bx = 0, bz = 0, drop = 0, lift = 0, lx = 0, lz = 0, hy = 0, act = 0; const rot = [[0, 0], [0, 0]], arm = [[0, 0], [0, 0]];
    for (let leg = 0; leg < 2; leg++) { const S = pl && pl.legs && pl.legs[leg]; if (!S) continue; const t = tn - S.t; if (t >= T_HOME) continue;
      const g = geo(S.ln, R), k = t < T_PLANT ? ease(Math.min(1, t / T_PLANT)) : t < T_HOLD ? 1 : 1 - ease((t - T_HOLD) / (T_HOME - T_HOLD));
      const up = t < T_PLANT ? Math.sin(Math.PI * Math.min(1, t / T_PLANT)) : 0, stomp = t > T_PLANT - 0.01 && t < T_PLANT + 0.07 ? Math.sin(Math.PI * (t - T_PLANT + 0.01) / 0.08) : 0, other = 1 - leg;
      act = Math.max(act, k); drop = Math.max(drop, R.hip * (1 - Math.cos(g.th)) * k * (1 - up * 0.8) + 0.03 * stomp); lift = Math.max(lift, 0.025 * up);
      if (g.side) { bx += g.sign * g.mid * k * (1 - up * 0.5); rot[leg][1] += g.sign * (g.th * k + 0.3 * up); rot[other][1] += -g.sign * g.th * k * (1 - up * 0.6);
        lz += -g.sign * 0.12 * k; hy += g.sign * 0.35 * k; arm[leg][1] += g.sign * 0.7 * k; arm[other][1] += -g.sign * 0.25 * k; }
      else { bz += g.sign * g.mid * k * (1 - up * 0.5); rot[leg][0] += -g.sign * (g.th * k + 0.35 * up); rot[other][0] += g.sign * g.th * k * (1 - up * 0.6);
        lx += g.sign * 0.14 * k; arm[other][0] += -g.sign * 0.75 * k; arm[leg][0] += g.sign * 0.45 * k; hy += (leg ? 1 : -1) * 0.1 * k; } }
    B.legs[0].rotation.set(rot[0][0], 0, rot[0][1]); B.legs[1].rotation.set(rot[1][0], 0, rot[1][1]);
    const groove = on ? 1 - Math.min(1, act * 1.5) : 0;
    B.body.position.set(bx, (on ? Math.abs(s) * 0.04 * groove : 0) + lift - drop, bz); B.body.rotation.set(lx - 0.06 * drop, on ? s * 0.12 * groove : 0, lz);
    if (B.head) { B.head.rotation.x = 0.18 * act; B.head.rotation.y = hy; B.head.rotation.z = on ? Math.sin(bt * Math.PI * 2) * 0.07 * groove : 0; }   // looks down at the foot
    if (B.arms) { B.arms[0].rotation.x = (on ? (-0.3 + s * 0.25) * groove : 0) + arm[0][0]; B.arms[1].rotation.x = (on ? (-0.3 - s * 0.25) * groove : 0) + arm[1][0];
      B.arms[0].rotation.z = -0.22 - arm[0][1] * -1 * (arm[0][1] < 0 ? 1 : 0.4); B.arms[1].rotation.z = 0.22 + arm[1][1] * (arm[1][1] > 0 ? 1 : 0.4); } }
  function unpose(f) { if (FP && f && f.userData && f.userData._fdJ) { FP.endPose(f); f.userData._fdJ = false; } const B = f && f.userData && f.userData.P; if (!B || !B.body) return; B.body.position.set(0, 0, 0); delete B._dz; B.body.rotation.z = 0; B.body.rotation.y = 0; B.body.rotation.x = 0; if (B.head) { B.head.rotation.z = 0; B.head.rotation.x = 0; }
    for (const L of B.legs || []) { L.rotation.z = 0; L.rotation.x = 0; } for (const R of B.arms || []) R.rotation.z = 0; }
  // ---------- loop (driven by the map) ----------
  function update() { fit(); if (phase === 'play') { schedule(); const st = songT();
      for (const pl of ps) while (pl.next < pl.notes.length) { const n = pl.notes[pl.next]; if (n.j) { pl.next++; continue; } if (st > n.t + MISS) { n.j = 2; pl.combo = 0; pl.cnt[3]++; pl.judge = { txt: 'MISS', col: '#ff5a4a', t: now() }; pl.next++; continue; } break; }
      if (st > SONG + 1.2) finish(); }
    const tn = now(); padFx.forEach((row, p) => row.forEach((m, ln) => { const pl = ps[p], pr = pl && p < players ? Math.max(0, 1 - (tn - pl.press[ln]) / 0.2) : 0; m.material.opacity = phase === 'play' ? 0.15 + pr * 0.85 : 0; }));
    draw(); const n = performance.now(); if (dirty || n - lastEmit > 150) { dirty = false; lastEmit = n; onState(hud()); } }
  function hud() { return { phase, players, sel, best: best(), prog: phase === 'play' ? Math.max(0, Math.min(1, songT() / SONG)) : 0, res: res ? res.map(r => ({ ...r })) : null, newBest: res ? res.newBest : false }; }
  return { camera: cam, pads, yaw, update, pose, unpose, key, hit, pick, again, hud, setSel(i) { sel = i ? 1 : 0; dirty = true; },
    destroy() { screen.material = mat0; mat.dispose(); tex.dispose(); for (const row of padFx) for (const m of row) { group.remove(m); m.geometry.dispose(); m.material.dispose(); } atx.dispose(); try { A && A.ctx.close(); } catch (e) {} } };
}
