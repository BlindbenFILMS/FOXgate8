// s485 ASSAY BENCH (Kufa Station · Relic Exchange · Vetch): a new station job on the pod's own glass assay table.
// 6 relics, 90 s. SCRUB the crust off each relic (drag on it), then compare its maker's mark with the 3 GENUINE MARKS on the
// reference card: 1 GENUINE (sell it: + its value) · 2 FORGED (caught: +5 G; a forgery has a near-miss mark: one ray too many,
// a mirrored moon, two pupils, a missing bar, a tooth short, eight notches not nine) · 3 HOLD. One crate holds no relic: a warm
// hexagonal FLEET MEMORY CORE under the crust (cyan lines). HOLD it (+10 G, flag kuCoreHeld): someone's memories are in there.
// Calling a forgery GENUINE costs 10 G. ★ 4 · ★★ 5 · ★★★ 6 right. Stats kuAssayBest, kuAssayShifts.
const MARKS = { sun: 'KUFA SUN', moon: 'GAYA MOON', eye: 'UR EYE', gate: 'MERU GATE', key: 'ZION KEY', notch: 'NINE NOTCHES' };
const METALS = [['COPPER', '#d08a4a', '#8a4a1e'], ['GOLD', '#e6b45a', '#9a6a1e'], ['BRONZE', '#b0884a', '#6a4a22'], ['SILVER', '#c9ccd2', '#7a7e86']];
const SHAPES = ['coin', 'tablet', 'idol', 'ring'], N = 6, TIME = 90;

export function makeAssayBench(K, { host, ox, at, audio, save, LOW, hideAt = null }) {
  const { THREE } = K, rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const W = 200, H = 80, CW = 1024, CH = Math.round(CW * H / W), S2P = CW / W;
  const u = new THREE.Vector3(0, 0, -1), v = new THREE.Vector3(1, 0, 0), n = new THREE.Vector3(0, 1, 0), PW = 3.8, PH = PW * H / W, YS = 1.075;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); plane.position.set(at.x, YS, at.z);
  plane.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v.clone().negate(), n)); plane.visible = false; host.add(plane);
  // the ring + a NOW HIRING board where you stand (station-local; the table is the pod's glass assay table)
  const SD = 2.1, st = { x: at.x + v.x * SD, z: at.z + v.z * SD };
  { const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.9, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(st.x, 0.03, st.z); host.add(ring);
    const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 320; const g = sc.getContext('2d'); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 1024, 320); g.fillStyle = '#9fe8ff'; g.fillRect(0, 0, 1024, 22); g.fillRect(0, 298, 1024, 22);
    g.fillStyle = '#f3f2f2'; g.font = '900 120px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('NOW HIRING', 48, 120, 930); g.fillStyle = '#ffd23a'; g.font = '800 56px Archivo, Arial'; g.fillText('ASSAY BENCH \u00b7 STAND ON THE RING', 48, 230, 930);
    const t = new THREE.CanvasTexture(sc); t.colorSpace = THREE.SRGBColorSpace; const px = st.x - u.x * 1.6, pz = st.z - u.z * 1.6;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), K.toon('#d08a4a')); post.position.set(px, 0.95, pz); host.add(post);
    for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(px + v.x * 0.05 * s, 1.72, pz + v.z * 0.05 * s); m.rotation.y = Math.atan2(v.x * s, v.z * s); host.add(m); } }
  // crust layer (scrubbed away with destination-out)
  const RA = { x: 24, y: 24, w: 560, h: CH - 48 }, crust = document.createElement('canvas'); crust.width = RA.w; crust.height = RA.h; const cc = crust.getContext('2d');
  let s = null, overlay = 'intro', lastDraw = 0, lastCov = 0, ptr = null, hidden = [];
  // the pod's hanging lamp sits between the camera and the glass: hide it while you work
  function hideProps() { hidden = []; if (!hideAt) return; const p = new THREE.Vector3(); host.traverse(o => { if (!o.visible || !o.isMesh || o === plane) return; o.getWorldPosition(p); if (p.y > 1.1 && Math.hypot(p.x - ox - hideAt[0], p.z - hideAt[1]) < 0.6) { hidden.push(o); o.visible = false; } }); }
  const sfx = (f, d = 0.12, vv = 0.04, t = 'triangle') => { try { audio.tone(f, d, vv, t); } catch (e) {} };
  const portrait = () => innerWidth / innerHeight < 0.95;
  function text(t, x, y, size, col, weight = 900, align = 'left') { c.fillStyle = col; c.font = weight + ' ' + size + 'px Archivo, Arial'; c.textBaseline = 'middle';
    if (portrait()) { c.save(); c.translate(x, y); c.rotate(Math.PI / 2); c.textAlign = 'center'; c.fillText(t, 0, 0); c.restore(); } else { c.textAlign = align; c.fillText(t, x, y); } }
  // ---------- marks (genuine or a near-miss forgery) ----------
  function mark(g, kind, fake, x, y, r, col) { g.save(); g.translate(x, y); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = Math.max(4, r * 0.09); g.lineCap = 'round'; g.lineJoin = 'round';
    if (kind === 'sun') { g.beginPath(); g.arc(0, 0, r * 0.36, 0, 7); g.stroke(); const n2 = fake ? (fake > 0 ? 9 : 7) : 8; for (let i = 0; i < n2; i++) { const a = i / n2 * Math.PI * 2 - Math.PI / 2; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52); g.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92); g.stroke(); } }
    else if (kind === 'moon') { const m = fake ? -1 : 1; g.beginPath(); g.arc(0, 0, r * 0.75, Math.PI * (m > 0 ? 0.35 : 1.35), Math.PI * (m > 0 ? 1.65 : 2.65)); g.arc(r * 0.3 * -m, 0, r * 0.55, Math.PI * (m > 0 ? 1.4 : 0.4), Math.PI * (m > 0 ? 0.6 : -0.6), true); g.closePath(); g.fill(); g.beginPath(); g.arc(r * 0.62 * m, -r * 0.05, r * 0.11, 0, 7); g.fill(); }
    else if (kind === 'eye') { g.beginPath(); g.moveTo(-r * 0.9, 0); g.quadraticCurveTo(0, -r * 0.8, r * 0.9, 0); g.quadraticCurveTo(0, r * 0.8, -r * 0.9, 0); g.stroke(); if (fake) { for (const dx of [-0.28, 0.28]) { g.beginPath(); g.arc(dx * r, 0, r * 0.16, 0, 7); g.fill(); } } else { g.beginPath(); g.arc(0, 0, r * 0.24, 0, 7); g.fill(); } }
    else if (kind === 'gate') { for (const dy of [-0.42, 0.42]) { g.beginPath(); g.arc(0, dy * r, r * 0.4, 0, 7); g.stroke(); } if (!fake) { g.beginPath(); g.moveTo(-r * 0.75, 0); g.lineTo(r * 0.75, 0); g.stroke(); } }
    else if (kind === 'key') { g.beginPath(); g.arc(-r * 0.55, 0, r * 0.28, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-r * 0.27, 0); g.lineTo(r * 0.9, 0); g.stroke(); const teeth = fake ? 2 : 3; for (let i = 0; i < teeth; i++) { const tx = r * (0.85 - i * 0.28); g.beginPath(); g.moveTo(tx, 0); g.lineTo(tx, r * 0.32); g.stroke(); } }
    else if (kind === 'notch') { g.beginPath(); g.arc(0, 0, r * 0.62, 0, 7); g.stroke(); const n2 = fake ? 8 : 9; for (let i = 0; i < n2; i++) { const a = i / n2 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62); g.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); g.stroke(); } }
    else if (kind === 'fleet') { g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; g.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); } g.closePath(); g.stroke(); g.font = '900 ' + Math.round(r * 0.55) + 'px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('F', 0, 4); }
    g.restore(); }
  // ---------- one relic ----------
  function newRelic(i) { const core = i === s.coreAt; const kind = core ? 'fleet' : pick(s.ref), fake = core ? 0 : Math.random() < 0.5 ? (Math.random() < 0.5 ? 1 : -1) : 0, metal = core ? ['ALLOY', '#4a5058', '#22262c'] : pick(METALS), shape = core ? 'core' : pick(SHAPES);
    const val = core ? 0 : Math.round(rr(8, 20)); s.rel = { i, core, kind, fake, metal, shape, val, stamp: null, stampT: 0, cov: 0, slide: 1 };
    // crust: blotchy browns over the whole tray
    cc.globalCompositeOperation = 'source-over'; cc.clearRect(0, 0, RA.w, RA.h); cc.fillStyle = '#6a5038'; cc.fillRect(0, 0, RA.w, RA.h);
    for (let k = 0; k < (LOW ? 140 : 260); k++) { cc.fillStyle = pick(['#5a4230', '#7a5a3e', '#8a6a48', '#4a3626', '#9a7a52']); cc.beginPath(); cc.arc(rr(0, RA.w), rr(0, RA.h), rr(8, 34), 0, 7); cc.fill(); }
    cc.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 400; k++) cc.fillRect(rr(0, RA.w), rr(0, RA.h), 3, 3); lastCov = 0; }
  function drawRelic(T) { const r = s.rel, cx = RA.x + RA.w / 2, cy = RA.y + RA.h / 2, [, m1, m2] = r.metal;
    c.save(); c.beginPath(); c.rect(RA.x, RA.y, RA.w, RA.h); c.clip(); c.fillStyle = '#1a2a30'; c.fillRect(RA.x, RA.y, RA.w, RA.h);
    const gr = c.createLinearGradient(cx - 160, cy - 160, cx + 160, cy + 160); gr.addColorStop(0, m1); gr.addColorStop(1, m2); c.fillStyle = gr; c.strokeStyle = m2; c.lineWidth = 8;
    if (r.shape === 'coin') { c.beginPath(); c.arc(cx, cy, 150, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(cx, cy, 128, 0, 7); c.stroke(); }
    else if (r.shape === 'tablet') { c.beginPath(); c.roundRect(cx - 170, cy - 140, 340, 280, 26); c.fill(); c.stroke(); }
    else if (r.shape === 'idol') { c.beginPath(); c.ellipse(cx, cy + 30, 120, 120, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(cx, cy - 115, 52, 0, 7); c.fill(); c.stroke(); }
    else if (r.shape === 'ring') { c.beginPath(); c.arc(cx, cy, 155, 0, 7); c.arc(cx, cy, 70, 0, 7, true); c.fill('evenodd'); c.stroke(); }
    else { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; c.lineTo(cx + Math.cos(a) * 155, cy + Math.sin(a) * 155); } c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(95,227,255,' + (0.55 + 0.35 * Math.sin(T * 3)) + ')'; c.lineWidth = 5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(cx - 120, cy + k * 34); c.lineTo(cx - 40, cy + k * 34); c.lineTo(cx - 20, cy + k * 34 + 14); c.lineTo(cx + 120, cy + k * 34 + 14); c.stroke(); } }
    if (r.shape !== 'ring') mark(c, r.kind, r.fake, cx, r.shape === 'idol' ? cy + 30 : cy, r.shape === 'core' ? 80 : 96, r.core ? '#5fe3ff' : 'rgba(32,30,29,0.85)');
    else mark(c, r.kind, r.fake, cx, cy - 112, 34, 'rgba(32,30,29,0.9)');
    c.drawImage(crust, RA.x, RA.y); c.restore();
    c.strokeStyle = '#f3f2f2'; c.lineWidth = 4; c.strokeRect(RA.x, RA.y, RA.w, RA.h);
    if (r.stamp) { const ok = r.stamp.ok, col = ok ? '#22c55e' : '#ec3013'; c.save(); c.translate(cx, cy); if (!portrait()) c.rotate(-0.18); else c.rotate(Math.PI / 2 - 0.18); c.strokeStyle = col; c.lineWidth = 12; c.strokeRect(-200, -60, 400, 120); c.fillStyle = col; c.font = '900 72px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(r.stamp.word, 0, 4); c.restore(); } }
  function draw(T) { c.fillStyle = '#0f1a1e'; c.fillRect(0, 0, CW, CH); c.strokeStyle = 'rgba(159,232,255,0.25)'; c.lineWidth = 2; for (let x = 0; x < CW; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, CH); c.stroke(); }
    if (!s) { text('ASSAY BENCH', CW / 2, CH / 2 - 40, 84, '#9fe8ff', 900, 'center'); text('VETCH IS HIRING \u00b7 STAND ON THE RING', CW / 2, CH / 2 + 50, 36, '#f3f2f2', 800, 'center'); tex.needsUpdate = true; return; }
    drawRelic(T);
    const X0 = RA.x + RA.w + 24, X1 = CW - 24; c.strokeStyle = '#f3f2f2'; c.lineWidth = 4; c.strokeRect(X0, RA.y, X1 - X0, RA.h);
    text('GENUINE MARKS', X0 + 20, RA.y + 34, 34, '#ffd23a'); const rowH = (RA.h - 70) / 3;
    s.ref.forEach((k, i) => { const y = RA.y + 74 + i * rowH + rowH / 2; c.fillStyle = '#e8dcc0'; c.fillRect(X0 + 16, y - rowH / 2 + 6, rowH - 12, rowH - 12); mark(c, k, 0, X0 + 16 + (rowH - 12) / 2, y, (rowH - 12) * 0.42, '#201e1d'); text(MARKS[k], X0 + rowH + 22, y, 30, '#f3f2f2', 800); });
    tex.needsUpdate = true; }
  function coverage() { const d = cc.getImageData(0, 0, RA.w, RA.h).data, cx = RA.w / 2, cy = RA.h / 2; let tot = 0, clean = 0;
    for (let y = 0; y < RA.h; y += 10) for (let x = 0; x < RA.w; x += 10) { if (Math.hypot(x - cx, y - cy) > 150) continue; tot++; if (d[(y * RA.w + x) * 4 + 3] < 60) clean++; } return tot ? clean / tot : 0; }
  function scrub(gx, gy) { if (!s || !s.rel || s.rel.stamp) return; let x = gx * S2P - RA.x, y = gy * S2P - RA.y; if (x < -20 || y < -20 || x > RA.w + 20 || y > RA.h + 20) return;
    cc.globalCompositeOperation = 'destination-out'; cc.beginPath(); cc.arc(x, y, 34, 0, 7); cc.fill(); if (ptr) { cc.lineWidth = 68; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(ptr.x, ptr.y); cc.lineTo(x, y); cc.stroke(); } ptr = { x, y };
    if (Math.random() < 0.25) sfx(rr(900, 1400), 0.03, 0.012, 'sawtooth'); }
  function stamp(k) { const r = s.rel; if (!r || r.stamp) return; let ok, word, gold = 0;
    if (r.core) { ok = k === 3; word = ok ? 'HOLD' : k === 1 ? 'GENUINE' : 'FORGED'; if (ok) { gold = 10; s.coreHeld = true; s.say = 'VETCH: \u201CThat is a Fleet memory core. Somebody is in there. Keep it safe.\u201D'; } else s.say = 'VETCH: \u201CThat was no relic. It was warm. Put it aside.\u201D'; }
    else if (k === 3) { ok = false; word = 'HOLD?'; s.say = 'Nothing to hold. It is just a ' + r.metal[0].toLowerCase() + ' ' + r.shape + '.'; }
    else { const isFake = !!r.fake; ok = (k === 2) === isFake; word = k === 1 ? 'GENUINE' : 'FORGED';
      if (ok && !isFake) { gold = r.val; s.say = 'SOLD \u00b7 ' + MARKS[r.kind] + ' \u00b7 +' + r.val + ' G'; } else if (ok) { gold = 5; s.say = 'CAUGHT A FORGERY \u00b7 +5 G'; } else if (isFake) { gold = -10; s.say = 'THAT WAS A FORGERY \u00b7 \u221210 G'; } else s.say = 'IT WAS GENUINE \u00b7 VETCH SIGHS'; }
    s.earned = Math.max(0, s.earned + gold); if (ok) s.right++; r.stamp = { ok, word }; r.stampT = 1.4; s.sayT = 2.2; sfx(ok ? 784 : 160, 0.25, 0.05, ok ? 'triangle' : 'square'); }
  function finish() { s.done = true; overlay = 'done'; s.stars = s.right >= 6 ? 3 : s.right >= 5 ? 2 : s.right >= 4 ? 1 : 0; s.gold = s.earned;
    try { if (s.gold) save.addGold(s.gold); save.setStat('kuAssayShifts', save.stat('kuAssayShifts', 0) + 1); if (s.right > save.stat('kuAssayBest', 0)) save.setStat('kuAssayBest', s.right); if (s.coreHeld) save.setFlag('kuCoreHeld'); } catch (e) {} }
  return {
    title: 'ASSAY BENCH', where: 'Relic Exchange \u00b7 Vetch', W, H,
    surface: { c: new THREE.Vector3(ox + at.x, YS, at.z), u, v, n, w: PW, h: PH, maxD: 4.0, maxY: 4.8 },
    stand: { x: ox + st.x, z: st.z, face: Math.atan2(-v.x, -v.z) }, spot: { x: st.x, z: st.z, r: 0.9 },
    begin() { overlay = 'intro'; s = null; plane.visible = true; hideProps(); draw(0); },
    end() { plane.visible = false; s = null; overlay = 'intro'; hidden.forEach(o => { o.visible = true; }); hidden = []; },
    // the kit's surface fit, plus room for the 3 pad buttons (bottom in landscape, right-hand column in portrait)
    camPose(camTo, lookTo, upTo, Wv, Hv, bar) { const S = this.surface, as = Wv / Hv, por = as < 0.95, phone = Math.min(Wv, Hv) < 520;
      const padB = 12 + (por ? 0 : (phone ? (as > 1 ? 74 : 84) : 92) + 22), padW = por ? (phone ? 84 : 92) + 22 : 0, Ws = por ? S.h : S.w, Hs = por ? S.w : S.h;
      const fracH = (Hv - bar - padB) / Hv, fracW = (Wv - 20 - padW) / Wv; let tf = Math.tan(25 * Math.PI / 180), d = Math.max(Hs / 2 / tf / fracH, Ws / 2 / (tf * as) / fracW) * 1.08;
      if (S.maxD && d > S.maxD) { tf *= d / S.maxD; d = S.maxD; } const fov = Math.min(104, Math.atan(tf) * 360 / Math.PI);
      upTo.copy(por ? S.u : S.v).multiplyScalar(por ? 1 : -1); const right = por ? S.v : S.u, sy = ((bar - padB) / 2) / (Hv / 2) * d * tf, sx = (padW / 2) / (Wv / 2) * d * tf * as, tilt = 0.16 * Math.min(1, 50 / fov);
      lookTo.copy(S.c).addScaledVector(upTo, sy).addScaledVector(right, sx); camTo.copy(S.c).addScaledVector(S.n, d * Math.cos(tilt)).addScaledVector(upTo, -d * Math.sin(tilt) + sy).addScaledVector(right, sx); return fov; },
    tick(dt, T, fly) { if (s && !s.done && !overlay && fly > 0.85) { s.t -= dt; if (s.sayT > 0 && (s.sayT -= dt) <= 0) s.say = null;
        const r = s.rel; if (r && r.stamp && (r.stampT -= dt) <= 0) { if (r.i + 1 >= N) finish(); else newRelic(r.i + 1); }
        if (s.t <= 0) { s.t = 0; finish(); } if (r && !r.stamp && T - lastCov > 0.3) { lastCov = T; r.cov = coverage(); } }
      if (plane.visible && T - lastDraw > (LOW ? 1 / 15 : 1 / 30)) { lastDraw = T; draw(T); } },
    down(x, y) { if (!s || overlay) return; ptr = null; scrub(x, y); }, move(x, y) { if (!s || overlay) return; scrub(x, y); }, up() { ptr = null; },
    pad: [{ k: 1, label: 'GENUINE', sub: 'SELL IT' }, { k: 2, label: 'FORGED', sub: 'CATCH IT' }, { k: 3, label: 'HOLD', sub: 'SET ASIDE' }], noSticks: true,
    padPress(k, d) { if (d && s && !s.done && !overlay) stamp(k); },
    key(e) { if (e.type === 'keydown' && /^Digit[123]$/.test(e.code)) this.padPress(+e.code.slice(5), true); },
    hud() {
      if (overlay === 'intro') return { card: { kicker: 'Relic Exchange \u00b7 Vetch', title: 'Assay Bench', body: 'Scrub the crust off each relic. Match its maker\u2019s mark to the genuine marks on the card: GENUINE sells, FORGED catches a fake. HOLD anything that is not a relic.', buttons: ['YES, PUT ME TO WORK!', 'GOODBYE'] } };
      if (overlay === 'done' && s) return { card: { kicker: 'Kufa Station \u00b7 Relic Exchange', title: s.stars === 3 ? 'A sharp eye' : s.stars ? 'Crate assayed' : 'Vetch frowns', mood: s.right + ' / ' + N + ' right \u00b7 ' + (s.stars ? '\u2605'.repeat(s.stars) : 'no stars') + (s.gold ? ' \u00b7 +' + s.gold + ' G' : ''),
        notes: (s.coreHeld ? ['The Fleet memory core is safe with Vetch. Somebody\u2019s memories are in there.'] : ['A warm hexagon came through and nobody held it.']).concat(['Best crate: ' + Math.max(s.right, save.stat('kuAssayBest', 0)) + ' / ' + N]), buttons: ['ANOTHER CRATE', 'GOODBYE'] } };
      if (!s || !s.rel) return {};
      const r = s.rel, where = s.say || (r.cov < 0.45 ? 'SCRUB THE CRUST OFF \u00b7 ' + Math.round(r.cov * 100) + '% CLEAN' : 'COMPARE THE MARK \u00b7 1 GENUINE \u00b7 2 FORGED \u00b7 3 HOLD');
      return { stats: [['Relic', (r.i + 1) + ' / ' + N], ['Time', String(Math.ceil(s.t)), s.t < 15 ? '#ec3013' : null], ['Right', String(s.right)], ['Earned', s.earned + ' G']], showStats: true, where, pad: this.pad, noSticks: true }; },
    cardPick(i) { const b = this.hud().card && this.hud().card.buttons[i]; if (!b || /GOODBYE|LEAVE/.test(b)) return 'leave';
      const kinds = Object.keys(MARKS).sort(() => Math.random() - 0.5); s = { t: TIME, ref: kinds.slice(0, 3), coreAt: 2 + Math.floor(Math.random() * 3), right: 0, earned: 0, done: false, say: null, sayT: 0, coreHeld: false }; overlay = null; newRelic(0); sfx(523, 0.3, 0.04, 'sine'); },
  };
}
