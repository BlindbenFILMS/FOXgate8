// MERU LANES — 3D TENPIN on lane 4 (Ben: "build our 3D bowling minigame in that beautiful alley"). Ten frames, real scoring
// (strikes, spares, the 10th-frame bonus balls), a small 2D physics sim for the ball + pins (pins knock pins, topple, slide,
// bounce off the kickbacks, drop into the gutters + pit), a lane scoreboard over the foul line, best score saved (stat meru.bowling.best).
// CONTROLS = the original Meru tenpin flick (minigames/meru/tenpin.html): touch the lane where you want to start, drag UP and let go.
// Drag direction = aim (sideways drag angles the ball), drag length = speed. Desktop: same with the mouse; or stick/arrows to slide + E = a straight roll. 3 / JUMP = quit.
// The walk calls drive() each frame (true = the game owns the player), camFix() after the follow camera, prompt(), toast(), press(), quit().
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, smooth = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
export const BOWL = { lane: 3, foul: 126.55, head: 142, pit: 143.4, half: 0.535, gutter: 0.655, rb: 0.12, rp: 0.06, oilEnd: 133, best: 'meru.bowling.best', goldPer: 10, bestBonus: 25, draft: true };   // reward DRAFT: 1 gold per 10 pins of score, +25 for beating your best

export function buildBowling({ THREE, scene, lanes, save, audio = () => null, touch }) {
  let cam = null; const RC = new THREE.Raycaster(), NDC = new THREE.Vector2(), PL = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.105), HIT = new THREE.Vector3();
  const LZ = lanes.LZ[BOWL.lane], X0 = BOWL.foul, Y = 0.105, pinGeo = lanes.pinGeo, im = lanes.pinIM, imBase = (BOWL.lane - 1) * 10;
  const G = new THREE.Group(); scene.add(G);
  // ---- the ball + the 10 pins ----
  const ballTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); const q = g.createLinearGradient(0, 0, 128, 64); q.addColorStop(0, '#ec3013'); q.addColorStop(0.5, '#7a1020'); q.addColorStop(1, '#ec3013'); g.fillStyle = q; g.fillRect(0, 0, 128, 64);
    g.strokeStyle = 'rgba(255,210,58,0.6)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, 10 + i * 12); g.bezierCurveTo(40, i * 9, 80, 64 - i * 8, 128, 12 + i * 10); g.stroke(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(BOWL.rb, 20, 14), new THREE.MeshPhongMaterial({ map: ballTex, shininess: 110, specular: 0x999999 })); G.add(ball); ball.visible = false;
  for (const [a, b] of [[0.3, 0.2], [-0.25, 0.25], [0.02, 0.55]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.018, 10), new THREE.MeshBasicMaterial({ color: 0x100808 })); const n = new THREE.Vector3(Math.sin(a), b, Math.cos(a)).normalize(); h.position.copy(n).multiplyScalar(BOWL.rb + 0.001); h.lookAt(n.multiplyScalar(2)); ball.add(h); }
  { const tri = [], dot = []; const LZS = lanes.LZ.filter(z => z != null);
    for (const lz of LZS) for (let i = -3; i <= 3; i++) { const x = X0 + 6.4 + (3 - Math.abs(i)) * 0.36, z = lz + i * 0.135; tri.push(x + 0.3, 0, z, x - 0.16, 0, z - 0.055, x - 0.16, 0, z + 0.055); dot.push([X0 - 1.6, z]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3)); g.computeVertexNormals();
    const am = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x5a2a12, side: THREE.DoubleSide, transparent: true, opacity: 0.75, depthWrite: false })); am.position.y = Y + 0.004; scene.add(am);
    const dm = new THREE.InstancedMesh(new THREE.CircleGeometry(0.025, 8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x5a2a12, transparent: true, opacity: 0.6, depthWrite: false }), dot.length); const m4 = new THREE.Matrix4(); dot.forEach(([x, z], k) => dm.setMatrixAt(k, m4.makeTranslation(x, Y + 0.004, z))); scene.add(dm); }
  const pinMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0x666666 });
  const SPOTS = []; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) SPOTS.push([BOWL.head + r * 0.28, LZ + (c - r / 2) * 0.32]);
  const pins = SPOTS.map(([x, z]) => { const m = new THREE.Mesh(pinGeo, pinMat); m.visible = false; G.add(m); return { m, x, z, vx: 0, vz: 0, st: 'up', tilt: 0, dx: 1, dz: 0, yaw: 0, spin: 0, y: Y }; });
  const Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), AX = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  function drawPin(p) { if (p.st === 'gone' && p.y < -0.5) { p.m.visible = false; return; } p.m.visible = true; p.m.position.set(p.x, p.y + (p.tilt > 0 ? p.tilt * 0.06 : 0), p.z);
    AX.set(p.dz, 0, -p.dx).normalize(); Q.setFromAxisAngle(AX, p.tilt * Math.PI / 2); Q2.setFromAxisAngle(UP, p.yaw); p.m.quaternion.copy(Q2).multiply(Q); }
  function rack(all) { pins.forEach((p, i) => { if (all || p.st === 'up') { const [x, z] = SPOTS[i]; Object.assign(p, all ? { x, z } : {}, { vx: 0, vz: 0, st: all ? 'up' : p.st, tilt: all ? 0 : p.tilt, yaw: all ? 0 : p.yaw, spin: 0, y: Y }); } else { p.st = 'gone'; p.y = -1; } drawPin(p); }); }
  function showLanePins(on) { const m4 = new THREE.Matrix4(); for (let k = 0; k < 10; k++) { const [x, z] = SPOTS[k]; im.setMatrixAt(imBase + k, on ? m4.makeTranslation(x, Y, z) : m4.makeScale(0, 0, 0)); } im.instanceMatrix.needsUpdate = true; }
  // ---- 3D UI: aim arrow on the lane, hook meter + power bar beside the approach (always on top), pop text ----
  const ui = (w, h, col, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthTest: false })); m.renderOrder = 20; G.add(m); return m; };
  const arrow = new THREE.Group(); G.add(arrow); { const m = new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 6; i++) { const ch = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.06).rotateX(-Math.PI / 2), m); ch.position.set(1.2 + i * 0.9, 0.012, 0); ch.rotation.y = 0; arrow.add(ch); const a = ch.clone(); a.geometry = new THREE.PlaneGeometry(0.26, 0.05).rotateX(-Math.PI / 2); for (const s of [-1, 1]) { const w = a.clone(); w.position.set(1.32 + i * 0.9, 0.012, s * 0.07); w.rotation.y = s * 0.75; arrow.add(w); } } }
  arrow.visible = false;
  const meter = new THREE.Group(); G.add(meter); meter.rotation.y = -Math.PI / 2; meter.visible = false;
  const hookBg = ui(1.2, 0.12, 0x201e1d, 0.85), hookMid = ui(0.03, 0.16, 0xf3f2f2), hookDot = ui(0.08, 0.16, 0x52e3ff); meter.add(hookBg, hookMid, hookDot);
  const powBg = ui(0.14, 1.0, 0x201e1d, 0.85), powSweet = ui(0.16, 0.16, 0xf3f2f2, 0.55), powFill = ui(0.1, 0.96, 0xec3013); meter.add(powBg, powSweet, powFill);
  hookBg.position.set(0, 0.95, 0); hookMid.position.set(0, 0.95, 0); powBg.position.set(0.85, 1.25, 0); powSweet.position.set(0.85, 0.77 + 0.8 * 0.96 - 0.48 + 0.48, 0); powFill.geometry.translate(0, 0.48, 0); powFill.position.set(0.85, 0.77, 0);
  hookBg.position.set(0, 2.0, 0); hookMid.position.set(0, 2.0, 0); powBg.position.set(-0.85, 1.75, 0); powFill.position.set(-0.85, 1.27, 0); powSweet.position.set(-0.85, 1.27 + 0.8 * 0.96, 0);
  hookBg.visible = hookMid.visible = hookDot.visible = powSweet.visible = false;
  const popCv = document.createElement('canvas'); popCv.width = 512; popCv.height = 128; const popTex = new THREE.CanvasTexture(popCv); popTex.colorSpace = THREE.SRGBColorSpace;
  const pop = new THREE.Sprite(new THREE.SpriteMaterial({ map: popTex, transparent: true, depthTest: false })); pop.renderOrder = 21; pop.scale.set(1.6, 0.4, 1); pop.visible = false; G.add(pop); let popT = 0;
  function popUp(txt, col) { const g = popCv.getContext('2d'); g.clearRect(0, 0, 512, 128); g.font = 'italic 900 84px Archivo, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#201e1d'; g.strokeText(txt, 256, 66); g.fillStyle = col; g.fillText(txt, 256, 66); popTex.needsUpdate = true; pop.visible = true; popT = 0; }
  // ---- the lane scoreboard (hung over the foul line, covers the pair screen while you play) ----
  const sbCv = document.createElement('canvas'); sbCv.width = 1024; sbCv.height = 256; const sbTex = new THREE.CanvasTexture(sbCv); sbTex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: sbTex })); board.position.set(126.95, 3.35, lanes.PAIRS[1]); board.rotation.y = -Math.PI / 2; board.visible = false; G.add(board);
  // ---- scoring ----
  const mk = n => n === 0 ? '-' : String(n);
  function frames(R) { const F = []; let i = 0, tot = 0;
    for (let f = 0; f < 10 && i < R.length; f++) {
      if (f < 9) { if (R[i] === 10) { const s = R[i + 1] != null && R[i + 2] != null ? 10 + R[i + 1] + R[i + 2] : null; F.push({ m: ['', 'X'], s }); i += 1; }
        else { const a = R[i], b = R[i + 1]; if (b == null) { F.push({ m: [mk(a), ''], s: null }); i += 1; } else if (a + b === 10) { F.push({ m: [mk(a), '/'], s: R[i + 2] != null ? 10 + R[i + 2] : null }); i += 2; } else { F.push({ m: [mk(a), mk(b)], s: a + b }); i += 2; } } }
      else { const r = R.slice(i, i + 3), m = ['', '', '']; if (r[0] != null) m[0] = r[0] === 10 ? 'X' : mk(r[0]);
        if (r[1] != null) m[1] = r[0] === 10 ? (r[1] === 10 ? 'X' : mk(r[1])) : (r[0] + r[1] === 10 ? '/' : mk(r[1]));
        if (r[2] != null) m[2] = r[0] === 10 && r[1] < 10 ? (r[1] + r[2] === 10 ? '/' : mk(r[2])) : (r[2] === 10 ? 'X' : mk(r[2]));
        const need = r[0] === 10 || (r[0] + r[1] === 10) ? 3 : 2; F.push({ m, s: r.length >= need && r.slice(0, need).every(v => v != null) ? r.slice(0, need).reduce((a, b) => a + b, 0) : null, tenth: true }); i += 3; } }
    for (const f of F) { if (f.s == null) { f.c = null; continue; } tot += f.s; f.c = tot; } return F; }
  function drawBoard() { const g = sbCv.getContext('2d'), W = 1024, H = 256; g.fillStyle = '#0e1230'; g.fillRect(0, 0, W, H); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 14, H);
    const F = frames(S.rolls), cw = 92, x0 = 40, y0 = 70; g.font = '800 30px Archivo, Helvetica, sans-serif'; g.fillStyle = '#f3f2f2'; g.textBaseline = 'middle';
    g.fillText('TENPIN · LANE 4', 40, 34); g.textAlign = 'right'; g.fillStyle = '#ffd23a'; g.fillText('BEST ' + (save.stat(BOWL.best, 0) || 0), W - 30, 34); g.fillStyle = '#9fb3d6'; g.font = '700 22px Archivo, Helvetica, sans-serif'; g.fillText('TO BEAT · ROOK ' + RIVALS.rook + ' · NERA ' + RIVALS.nera, W - 230, 34); g.textAlign = 'center';
    for (let f = 0; f < 10; f++) { const x = x0 + f * cw, w = f === 9 ? cw + 30 : cw, cur = !S.over && f === S.f; g.strokeStyle = cur ? '#ffd23a' : '#38bdf8'; g.lineWidth = cur ? 4 : 2; g.strokeRect(x, y0, w - 4, 150);
      g.fillStyle = '#9fb3d6'; g.font = '700 20px Archivo, Helvetica, sans-serif'; g.fillText(String(f + 1), x + (w - 4) / 2, y0 - 14);
      const fr = F[f]; if (!fr) continue; const n = fr.m.length, bw = 32; g.font = '800 28px Archivo, Helvetica, sans-serif';
      fr.m.forEach((t, k) => { const bx = x + (w - 4) - bw * (n - k) - 2; g.strokeStyle = '#38bdf8'; g.lineWidth = 1.5; g.strokeRect(bx, y0 + 2, bw, 40); g.fillStyle = t === 'X' ? '#ffd23a' : t === '/' ? '#52e3ff' : '#f3f2f2'; g.fillText(t, bx + bw / 2, y0 + 23); });
      if (fr.c != null) { g.fillStyle = '#f3f2f2'; g.font = '800 44px Archivo, Helvetica, sans-serif'; g.fillText(String(fr.c), x + (w - 4) / 2, y0 + 100); } }
    g.textAlign = 'left'; sbTex.needsUpdate = true; }
  // ---- sound (tiny synth) ----
  let roll = null;
  function sfx(kind, v = 1) { const A = audio(); if (!A) return; const t = A.currentTime;
    const noise = (dur, f, g0, type = 'lowpass') => { const n = A.createBuffer(1, Math.ceil(A.sampleRate * dur), A.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = A.createBufferSource(); s.buffer = n; const fl = A.createBiquadFilter(); fl.type = type; fl.frequency.value = f; const g = A.createGain(); g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl).connect(g).connect(A.destination); s.start(t); return s; };
    const tone = (f, dur, g0, type = 'sine') => { const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(A.destination); o.start(t); o.stop(t + dur); };
    if (kind === 'lock') tone(660, 0.08, 0.05, 'triangle'); if (kind === 'release') { tone(90, 0.3, 0.08, 'sine'); noise(0.12, 900, 0.05); }
    if (kind === 'pin') { noise(0.18, 2600 + Math.random() * 1200, 0.09 * v, 'bandpass'); tone(700 + Math.random() * 500, 0.06, 0.025 * v, 'triangle'); }
    if (kind === 'crash') { noise(0.6, 3000, 0.22); noise(0.4, 600, 0.15); }
    if (kind === 'strike') { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => sfx('note', f), i * 90)); } if (kind === 'note') tone(v, 0.22, 0.06, 'square');
    if (kind === 'roll') { const n = A.createBuffer(1, A.sampleRate * 2, A.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = A.createBufferSource(); s.buffer = n; s.loop = true; const fl = A.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 160; const g = A.createGain(); g.gain.value = 0; s.connect(fl).connect(g).connect(A.destination); s.start(); roll = { s, g }; }
    if (kind === 'rollStop' && roll) { try { roll.g.gain.setTargetAtTime(0, t, 0.08); roll.s.stop(t + 0.4); } catch (e) {} roll = null; } }
  // ---- music: a light disco-funk loop, 112 bpm, only while you bowl ----
  let mus = null;
  function musicOn() { const A = audio(); if (!A || mus) return; const out = A.createGain(); out.gain.value = 0; out.gain.setTargetAtTime(0.5, A.currentTime, 0.4); out.connect(A.destination);
    const nb = A.createBuffer(1, A.sampleRate * 0.3, A.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const spb = 60 / 112 / 4, BASS = [41, 0, 41, 53, 0, 41, 51, 0, 39, 0, 39, 51, 0, 39, 46, 48], CH = [[65, 69, 72], [65, 69, 72], [63, 67, 70], [63, 67, 70]], LEAD = [77, 0, 0, 79, 0, 81, 0, 0, 84, 0, 81, 0, 79, 0, 77, 0, 0, 0, 75, 0, 77, 0, 79, 0, 75, 0, 0, 72, 0, 0, 0, 0];
    const hz = n => 440 * Math.pow(2, (n - 69) / 12);
    const note = (t, f, d, g, type, cut) => { const o = A.createOscillator(), e = A.createGain(), fl = A.createBiquadFilter(); o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cut; e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(fl).connect(e).connect(out); o.start(t); o.stop(t + d + 0.02); };
    const hit = (t, f, d, g, type = 'highpass') => { const sN = A.createBufferSource(); sN.buffer = nb; const fl = A.createBiquadFilter(); fl.type = type; fl.frequency.value = f; const e = A.createGain(); e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + d); sN.connect(fl).connect(e).connect(out); sN.start(t); sN.stop(t + d + 0.02); };
    const kick = t => { const o = A.createOscillator(), e = A.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); e.gain.setValueAtTime(0.5, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(e).connect(out); o.start(t); o.stop(t + 0.25); };
    let step = 0, next = A.currentTime + 0.1;
    const tick = () => { if (!mus) return; while (next < A.currentTime + 0.25) { const i = step % 16, bar = Math.floor(step / 16) % 4;
        if (i % 4 === 0) kick(next); if (i === 4 || i === 12) hit(next, 1500, 0.16, 0.22, 'bandpass'); hit(next, 7000, i % 2 ? 0.03 : 0.06, i % 4 === 2 ? 0.12 : 0.05);
        const b = BASS[i] - (bar === 3 ? 2 : 0); if (BASS[i]) note(next, hz(b), spb * 1.6, 0.22, 'sawtooth', 600);
        if (i === 2 || i === 10) CH[bar].forEach(n => note(next, hz(n), spb * 1.2, 0.035, 'square', 2200));
        const l = LEAD[(step % 32)]; if (l && Math.floor(step / 32) % 2 === 1) note(next, hz(l), spb * 1.8, 0.05, 'triangle', 3000);
        next += spb; step++; } mus.t = setTimeout(tick, 60); };
    mus = { out, t: 0 }; tick(); }
  function musicOff() { if (!mus) return; const A = audio(); clearTimeout(mus.t); try { if (A) { mus.out.gain.setTargetAtTime(0, A.currentTime, 0.25); const o = mus.out; setTimeout(() => o.disconnect(), 1500); } } catch (e) {} mus = null; }
  // ---- game state ----
  const RIVALS = { rook: 147, nera: 212 };   // the keeper's chalk board in surface_meru.html (ROOK 147, HOUSE = NERA 212)
  let lastP = null;
  let S = null, toast = '', toastT = 0, tutDone = false; const say = (s, t = 3) => { toast = s; toastT = t; };
  const B = { x: 0, z: 0, vx: 0, vz: 0, hook: 0, gutter: false, on: false, spin: 0 };
  function begin(P) { lastP = P; S = { rolls: [], f: 0, b: 0, phase: 'aim', t: 0, off: 0, aim: 0, hook: 0, pow: 0, pdir: 1, standBefore: 10, streak: 0, over: false, camK: 0, approach: 0 };
    rack(true); showLanePins(false); board.visible = true; rails.visible = true; musicOn(); drawBoard(); P.x = 123.4; P.z = LZ; P.yaw = Math.PI / 2;
    if (!tutDone) { tutDone = true; say('TENPIN · TOUCH THE LANE WHERE YOU WANT TO START · DRAG UP AND LET GO · LONGER DRAG = FASTER BALL · 3 = QUIT', 6); } else say('TENPIN · 10 FRAMES', 2); }
  function end(msg) { S = null; rails.visible = false; musicOff(); arrow.visible = false; meter.visible = false; ball.visible = false; board.visible = false; sfx('rollStop'); pins.forEach(p => { p.m.visible = false; }); showLanePins(true); if (msg) say(msg, 4); }
  function release(P) { const speed = 5 + S.pow * 5, a = S.aim + 0.18 * 0.03 * (Math.random() * 2 - 1);
    Object.assign(B, { x: X0 + 0.15, z: P.z, vx: Math.cos(a) * speed, vz: Math.sin(a) * speed, hook: 0, gutter: false, on: true, spin: 0 });
    ball.visible = true; S.phase = 'roll'; S.t = 0; S.standBefore = pins.filter(p => p.st === 'up').length; sfx('release'); sfx('roll'); }
  // ---- physics (sub-stepped) ----
  const MB = 6, MP = 1.5;
  function topple(p, vx, vz) { if (p.st !== 'up') return; p.st = 'tilt'; const l = Math.hypot(vx, vz) || 1; p.dx = vx / l; p.dz = vz / l; p.spin = (Math.random() - 0.5) * 6; sfx('pin', Math.min(1, l / 3)); }
  function step(h) {
    if (B.on) { if (!B.gutter) { if (B.x > BOWL.oilEnd) B.vz += B.hook * 1.7 * h; const sp = Math.hypot(B.vx, B.vz); B.vx -= (B.vx / sp) * 0.12 * h; B.vz -= (B.vz / sp) * 0.12 * h;
        if (Math.abs(B.z - LZ) > BOWL.half - BOWL.rb * 0.3 && B.x < BOWL.head - 0.3) { B.gutter = true; B.z = LZ + Math.sign(B.z - LZ) * BOWL.gutter; B.vz = 0; B.vx = Math.max(3, B.vx * 0.9); say('GUTTER', 1); } }
      B.x += B.vx * h; B.z += B.vz * h; if (B.x > BOWL.head - 0.6 && !B.gutter && Math.abs(B.z - LZ) > 0.85) { B.vz = -B.vz * 0.5; B.z = LZ + Math.sign(B.z - LZ) * 0.85; }
      if (B.x > BOWL.pit) { B.on = false; ball.visible = false; sfx('rollStop'); } }
    for (const p of pins) { if (p.st === 'gone') continue;
      if (B.on && !B.gutter) { const dx = p.x - B.x, dz = p.z - B.z, d = Math.hypot(dx, dz), R = BOWL.rb + (p.st === 'up' ? BOWL.rp : 0.09); if (d < R && d > 1e-4) { const nx = dx / d, nz = dz / d, rel = (B.vx - p.vx) * nx + (B.vz - p.vz) * nz;
          if (rel > 0) { const j = (1.5 * rel) / (1 / MB + 1 / MP); B.vx -= j / MB * nx; B.vz -= j / MB * nz; p.vx += j / MP * nx + (Math.random() - 0.5) * 0.3; p.vz += j / MP * nz + (Math.random() - 0.5) * 0.3; topple(p, p.vx, p.vz); if (!S.crashed) { S.crashed = true; sfx('crash'); } }
          p.x = B.x + nx * R; p.z = B.z + nz * R; } } }
    for (let i = 0; i < 10; i++) for (let k = i + 1; k < 10; k++) { const a = pins[i], b = pins[k]; if (a.st === 'gone' || b.st === 'gone') continue; const ra = a.st === 'up' ? BOWL.rp : 0.1, rbb = b.st === 'up' ? BOWL.rp : 0.1, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), R = ra + rbb;
      if (d < R && d > 1e-4) { const nx = dx / d, nz = dz / d, rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz; if (rel > 0) { const j = rel * 0.9; a.vx -= j * nx * 0.5 + 0; a.vz -= j * nz * 0.5; b.vx += j * nx * 0.5; b.vz += j * nz * 0.5;
          if (rel > 0.25) { if (b.st === 'up') topple(b, b.vx, b.vz); if (a.st === 'up') topple(a, a.vx || -nx, a.vz || -nz); } }
        const push = (R - d) / 2; a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push; } }
    for (const p of pins) { if (p.st === 'gone') { if (p.y > -1) { p.y -= h * 2; p.x += p.vx * h; } continue; }
      const sp = Math.hypot(p.vx, p.vz), fr = p.st === 'up' ? 4 : 1.6; if (sp > 0) { const k = Math.max(0, sp - fr * h) / sp; p.vx *= k; p.vz *= k; }
      p.x += p.vx * h; p.z += p.vz * h; if (p.st === 'up' && sp > 0.35) topple(p, p.vx, p.vz);
      if (p.st === 'tilt') { p.tilt = Math.min(1, p.tilt + h * 3.2); if (p.tilt >= 1) p.st = 'down'; } if (p.st !== 'up') p.yaw += p.spin * h * (sp > 0.05 ? 1 : 0);
      const dz = p.z - LZ; if (Math.abs(dz) > 0.85) { p.z = LZ + Math.sign(dz) * 0.85; p.vz = -p.vz * 0.55; } if (p.x < BOWL.head - 0.6 && Math.abs(dz) > BOWL.half) { p.st = 'gone'; p.tilt = 1; }
      if (p.x > BOWL.pit + 0.2) { p.st = 'gone'; p.tilt = 1; } if (p.x < BOWL.head - 2) p.vx = Math.abs(p.vx) * 0.3; } }
  // ---- after a ball: count, pop, frame logic ----
  function scoreBall() { const standing = pins.filter(p => p.st === 'up').length, k = S.standBefore - standing, f = S.f, b = S.b; S.rolls.push(k);
    const first = f < 9 ? b === 0 : (b === 0 || S.rack10); let pp = null;
    if (standing === 0 && first) { S.streak++; pp = [S.streak >= 3 ? (S.streak === 3 ? 'TURKEY!' : S.streak + ' IN A ROW!') : 'STRIKE!', '#ffd23a']; sfx('strike'); }
    else if (standing === 0) { S.streak = 0; pp = ['SPARE!', '#52e3ff']; sfx('note', 880); }
    else { S.streak = 0; pp = [k === 0 ? (B.gutter ? 'GUTTER · 0' : 'MISS · 0') : k + (k === 1 ? ' PIN!' : ' PINS!'), '#f3f2f2']; }
    if (pp) { popUp(pp[0], pp[1]); say(pp[0], 1.6); }
    let reset = false, next = false;
    if (f < 9) { if (b === 0 && standing === 0) next = true; else if (b === 0) S.b = 1; else next = true; }
    else { const R = S.rolls.slice(-(b + 1)); if (b === 0) { S.b = 1; reset = standing === 0; S.rack10 = reset; } else if (b === 1) { const bonus = R[0] === 10 || R[0] + R[1] === 10; if (bonus) { S.b = 2; reset = standing === 0; S.rack10 = reset; } else S.over = true; } else S.over = true; }
    if (next) { S.f++; S.b = 0; reset = true; S.rack10 = false; }
    drawBoard();
    if (S.over || S.f >= 10) { S.over = true; const total = frames(S.rolls).reduce((a, fr) => fr.c ?? a, 0), was = save.stat(BOWL.best, 0) || 0; if (total > was) save.setStat(BOWL.best, total); drawBoard();
      const gold = Math.floor(total / BOWL.goldPer) + (total > was && was > 0 ? BOWL.bestBonus : 0); if (gold > 0) save.addGold(gold);
      S.phase = 'done'; S.t = 0; const beat = total > RIVALS.nera ? ' · YOU BEAT NERA!' : total > RIVALS.rook ? ' · YOU BEAT ROOK!' : '';
      setTimeout(() => popUp('GAME · ' + total, total > was ? '#ffd23a' : '#f3f2f2'), 350); say((total > was ? 'NEW BEST · ' + total : 'GAME OVER · ' + total + ' · BEST ' + Math.max(was, total)) + beat + (gold > 0 ? ' · +' + gold + ' GOLD' : ''), 6); return; }
    S.phase = 'sweep'; S.t = 0; S.reset = reset; }
  // ---- per frame: owns the player while playing ----
  const V = new THREE.Vector3();
  function drive(dt, P, fox, stick) {
    toastT -= dt; if (toastT <= 0) toast = ''; if (pop.visible) { popT += dt; pop.material.opacity = 1 - smooth(1.4, 2.0, popT); pop.position.set(S ? (S.phase === 'roll' || S.phase === 'settle' || S.phase === 'sweep' ? 140.6 : 130) : 130, 0.75 + popT * 0.12, LZ); if (popT > 2) pop.visible = false; }
    if (!S) return false; S.t += dt; for (let i = 0; i < 6; i++) step(dt / 6); pins.forEach(drawPin);
    if (B.on) { ball.position.set(B.x, Y + BOWL.rb - (B.gutter ? 0.08 : 0), B.z); const sp = Math.hypot(B.vx, B.vz); ball.rotateOnWorldAxis(V.set(-B.vz, 0, B.vx).normalize(), sp * dt / BOWL.rb); if (roll) roll.g.gain.value = clamp(0.25 - (B.x - X0) * 0.008, 0.05, 0.25); }
    if (S.phase === 'aim') {
      if (!drag) S.off = clamp(S.off + (stick.x || 0) * dt * 1.2, -0.42, 0.42);
      const g = drag ? flick() : null; if (g && g.ok) { S.aim = g.a; S.pow = g.p; }
      P.x = 123.4; P.z = LZ + S.off; P.yaw = Math.PI / 2; fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.yaw;
      S.armX = g && g.ok ? -0.4 - g.p * 0.9 : -0.35; S.hold = true;
      arrow.visible = !!(g && g.ok); arrow.position.set(X0, Y, P.z); arrow.rotation.y = -S.aim; arrow.scale.set(0.35 + 0.65 * S.pow, 1, 1);
      meter.visible = !!drag; meter.position.set(128.6, 0, LZ); powFill.scale.y = Math.max(0.001, g && g.ok ? g.p : 0); powFill.material.color.set(g && g.p > 0.85 ? 0xffd23a : 0xec3013);
      return true; }
    arrow.visible = false; meter.visible = false;
    if (S.phase === 'approach') { const u = clamp(S.t / 0.95, 0, 1); P.x = lerp(123.4, 126.15, smooth(0, 1, u)); fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.yaw;
      S.armX = u < 0.6 ? lerp(-0.4, 1.4, u / 0.6) : lerp(1.4, -1.6, (u - 0.6) / 0.4); S.hold = true;
      if (u >= 1) release(P); return true; }
    S.hold = false; S.armX = null; if (S.phase === 'roll') { S.armX = S.t < 1 ? -1.6 + S.t * 1.2 : null; if (!B.on) { S.phase = 'settle'; S.t = 0; } return true; }
    if (S.phase === 'settle') { const moving = pins.some(p => p.st !== 'gone' && (Math.hypot(p.vx, p.vz) > 0.05 || p.st === 'tilt')); if ((!moving && S.t > 0.35) || S.t > 2.4) scoreBall(); return true; }
    if (S.phase === 'sweep') { if (S.t > 1.1) { if (S.reset) rack(true); else { for (const p of pins) if (p.st !== 'up') { p.st = 'gone'; p.y = -1; } } pins.forEach(drawPin); S.phase = 'aim'; S.t = 0; S.pow = 0; S.pdir = 1; S.crashed = false; P.x = 123.4; } return true; }
    if (S.phase === 'done') return true;   // waits: TAP / E = play again · 3 = quit
    return true; }
  // ---- camera: behind you on the approach, chases the ball, holds on the pins ----
  const camT = new THREE.Vector3(), lookT = new THREE.Vector3(), lookW = new THREE.Vector3(), cur = { p: new THREE.Vector3(), l: new THREE.Vector3(), init: false };
  let camK = 0, baseFov = null;
  // YOUR LANE: red rails down both gutters of lane 4 while you play
  const rails = new THREE.Group(); G.add(rails); rails.visible = false; { const m = new THREE.MeshBasicMaterial({ color: 0xec3013 }); for (const sd of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(BOWL.head - X0 + 1.2, 0.03, 0.035), m); r.position.set((X0 + BOWL.head) / 2 - 0.4, Y + 0.02, LZ + sd * (BOWL.gutter + 0.12)); rails.add(r); } }
  function camFix(camera, P, dt) { cam = camera; camK = clamp(camK + (S ? dt : -dt) * 2.5, 0, 1); if (camK <= 0) { cur.init = false; if (baseFov != null) { camera.fov = baseFov; camera.updateProjectionMatrix(); baseFov = null; } return; } const k = smooth(0, 1, camK);
    const ph = S ? S.phase : 'aim', portrait = camera.aspect < 1;
    // ONE LANE, ZOOMED (Ben: "focus just on one lane"): dead centre on lane 4, narrow lens, follows the ball to the pins.
    if (ph === 'roll' && B.on) { const bx = clamp(B.x - (portrait ? 5.5 : 4.5), 127.3, 134); camT.set(bx, portrait ? 2.4 : 1.5, LZ); lookT.set(143, portrait ? -1.3 : 0.1, LZ); }
    else if (ph === 'roll' || ph === 'settle' || ph === 'sweep') { camT.set(134, portrait ? 1.9 : 1.5, LZ); lookT.set(143, 0.1, LZ); }
    else { camT.set(127.3, portrait ? 2.4 : 1.7, LZ); lookT.set(143, portrait ? -1.3 : -0.9, LZ); }   // in front of the fox: nothing blocks the lane
    if (baseFov == null) baseFov = camera.fov; const fT = S ? (portrait ? 30 : 16) : baseFov; camera.fov = lerp(baseFov, fT, k); camera.updateProjectionMatrix(); if (camK >= 1 || !S) {} 
    if (!cur.init) { cur.p.copy(camera.position); cur.l.set(P.x + 1, 1.2, P.z); cur.init = true; } const f = Math.min(1, dt * (ph === 'roll' ? 6 : 3)); cur.p.lerp(camT, f); cur.l.lerp(lookT, f);
    camera.position.lerp(cur.p, k); lookW.set(P.x, (P.y || 0) + 1.2, P.z).lerp(cur.l, k); camera.lookAt(lookW); }
  // ---- touch: the original flick ----
  let drag = null;
  const flick = () => { const dx = drag.x - drag.sx, dy = drag.y - drag.sy, len = Math.hypot(dx, dy), max = Math.min(innerHeight * 0.55, 320);
    return { ok: dy < -18 && len >= 24, a: Math.atan2((dx / (len || 1)) * 0.2, -dy / (len || 1)), p: Math.max(0.12, Math.min(1, len / max)) }; };
  const uiHit = t => { for (let e = t; e && e !== document.body; e = e.parentElement) { if (e.matches && e.matches('button,a,input,[role="button"],[aria-label],[title]')) return true; const r = e.getBoundingClientRect && e.getBoundingClientRect(); if (r && r.width > 0 && r.width < 170 && r.height < 170 && getComputedStyle(e).pointerEvents !== 'none' && getComputedStyle(e).position === 'absolute') return true; } return false; };
  const live = () => S && S.phase === 'aim';
  const again = () => { if (S && S.phase === 'done' && S.t > 1.2 && lastP) { begin(lastP); return true; } return false; };
  addEventListener('pointerdown', e => { if (S && S.phase === 'done' && !uiHit(e.target)) { e.stopPropagation(); again(); return; } if (!live() || drag || uiHit(e.target)) return; e.stopPropagation(); e.preventDefault();
    if (cam) { NDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); RC.setFromCamera(NDC, cam); if (RC.ray.intersectPlane(PL, HIT) && HIT.x > 122 && HIT.x < 143) S.off = clamp(HIT.z - LZ, -0.42, 0.42); }
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY }; audio(); }, true);
  addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; e.stopPropagation(); drag.x = e.clientX; drag.y = e.clientY; }, true);
  const up = e => { if (!drag || e.pointerId !== drag.id) return; e.stopPropagation(); const g = flick(); drag = null; if (!live()) return;
    if (!g.ok) { say('DRAG UPWARD TO ROLL', 1.6); return; } S.aim = g.a; S.pow = g.p; S.phase = 'approach'; S.t = 0; sfx('lock'); };
  addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const spot = { key: 'tenpin', x: 123.2, z: LZ, r: 1.6, get prompt() { return S ? null : 'PLAY · TENPIN · LANE 4' + ((save.stat(BOWL.best, 0) || 0) ? ' · BEST ' + save.stat(BOWL.best, 0) : ''); }, use(P) { if (!S) begin(P); } };
  function pose(fox) { if (!S) return; const arm = fox.userData.P && fox.userData.P.arms && fox.userData.P.arms[1]; if (!arm) return; if (S.armX != null) arm.rotation.set(S.armX, 0, 0.15);
    if (S.hold) { fox.updateMatrixWorld(true); arm.localToWorld(V.set(0, -0.5, 0.14)); ball.position.copy(V); ball.visible = true; } }
  return { spot, drive, pose, camFix, begin: P => { if (!S) begin(P); }, active: () => !!S, toast: () => toast,
    prompt() { if (!S) return null; return S.phase === 'aim' ? 'DRAG UP TO ROLL · FRAME ' + (S.f + 1) + ' · BALL ' + (S.b + 1) : S.phase === 'done' && S.t > 1.2 ? 'TAP = PLAY AGAIN · 3 = QUIT' : null; },
    press() { if (again()) return; if (!S || S.phase !== 'aim') return; S.aim = 0; S.pow = 0.7; S.phase = 'approach'; S.t = 0; sfx('lock'); },
    quit() { drag = null; if (S) end('TENPIN · QUIT'); } };
}
