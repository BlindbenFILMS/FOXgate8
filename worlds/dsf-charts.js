// s487 CHART PLOTTING (Kufa Station · Maps & Charts · Old Merrit): a station job on Merrit's own chart table.
// 5 charts, 150 s. A ship leaves KUFA STATION (left) for a port (right). The straight line crosses hazards (ROCKS, GRAVITY
// WELL, ION STORM): TAP the chart to bend the course through that point (drag a waypoint to move it). Stay inside the FUEL.
// 1 SAIL · 2 UNDO · 3 CLEAR. Clean arrival = 4-16 G (tighter line = more). One chart carries an UNLOGGED SIGNAL (a cyan
// ping off the lane, a Fleet buoy calling in a voice not its own): route past it to log it (+8 G, flag kuBuoyLogged).
// ★ 3 · ★★ 4 · ★★★ 5 clean charts. Stats kuChartsBest, kuChartsShifts.
const PORTS = ['GAYA LANE', 'JIDDA REACH', 'MERU GATE', 'LUXOR BERTH', 'NEBO LIGHT', 'UR DEEP', 'ZION YARD', 'SHASTA COLD'];
const HZ = { rocks: ['ROCKS', 'LOST IN THE ROCKS'], well: ['WELL', 'PULLED INTO THE WELL'], storm: ['STORM', 'BURNT OUT IN THE STORM'] };
const N = 5, TIME = 150, MAXWP = 6, SPEED = 80;

export function makeChartTable(K, { host, ox, at, th, audio, save, LOW }) {
  const { THREE } = K, rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const W = 200, H = 115, CW = 1024, CH = Math.round(CW * H / W), S2P = CW / W, PW = 4.0, PH = PW * H / W, YS = 0.985;
  const t0 = th * Math.PI / 180, n = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(-Math.sin(t0), 0, Math.cos(t0)), u = v.clone().negate().cross(n);
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); plane.position.set(at.x, YS, at.z);
  plane.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v.clone().negate(), n)); plane.visible = false; host.add(plane);
  const SD = 2.1, st = { x: at.x + v.x * SD, z: at.z + v.z * SD };
  { const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.9, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(st.x, 0.03, st.z); host.add(ring);
    const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 320; const g = sc.getContext('2d'); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 1024, 320); g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 1024, 22); g.fillRect(0, 298, 1024, 22);
    g.fillStyle = '#f3f2f2'; g.font = '900 120px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('NOW HIRING', 48, 120, 930); g.fillStyle = '#ffd23a'; g.font = '800 56px Archivo, Arial'; g.fillText('CHART PLOTTING \u00b7 STAND ON THE RING', 48, 230, 930);
    const t = new THREE.CanvasTexture(sc); t.colorSpace = THREE.SRGBColorSpace; const px = st.x - u.x * 1.6, pz = st.z - u.z * 1.6;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), K.toon('#d08a4a')); post.position.set(px, 0.95, pz); host.add(post);
    for (const s2 of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(px + v.x * 0.05 * s2, 1.72, pz + v.z * 0.05 * s2); m.rotation.y = Math.atan2(v.x * s2, v.z * s2); host.add(m); } }
  let s = null, overlay = 'intro', lastDraw = 0, drag = -1, hidden = [];
  // the orrery + its rod hang over the table: hide them while you plot
  function hideProps() { hidden = []; const p = new THREE.Vector3(); host.traverse(o => { if (!o.visible || !o.isMesh || o === plane) return; o.getWorldPosition(p); if (p.y < 2.0) return; const d = Math.hypot(p.x - ox - at.x, p.z - at.z);
    const g = o.geometry; if (g && !g.boundingSphere) g.computeBoundingSphere(); const rad = g && g.boundingSphere ? g.boundingSphere.radius : 0; if ((d < 2.3 && rad < 2.5) || d < 0.15) { hidden.push(o); o.visible = false; } }); }
  const sfx = (f, d = 0.12, vv = 0.04, t = 'triangle') => { try { audio.tone(f, d, vv, t); } catch (e) {} };
  const portrait = () => innerWidth / innerHeight < 0.95;
  function text(t, x, y, size, col, weight = 900, align = 'left') { c.fillStyle = col; c.font = weight + ' ' + size + 'px Archivo, Arial'; c.textBaseline = 'middle';
    if (portrait()) { c.save(); c.translate(x, y); c.rotate(Math.PI / 2); c.textAlign = 'center'; c.fillText(t, 0, 0); c.restore(); } else { c.textAlign = align; c.fillText(t, x, y); } }
  // ---------- geometry ----------
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function hitT(A, B, h) { const dx = B.x - A.x, dy = B.y - A.y, fx = A.x - h.x, fy = A.y - h.y, a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), cc = fx * fx + fy * fy - h.r * h.r;
    if (cc <= 0) return 0; if (a < 1e-6) return -1; const disc = b * b - 4 * a * cc; if (disc < 0) return -1; const t = (-b - Math.sqrt(disc)) / (2 * a); return t >= 0 && t <= 1 ? t : -1; }
  function segDist(p, A, B) { const dx = B.x - A.x, dy = B.y - A.y, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.y - A.y) * dy) / l)) : 0; return Math.hypot(A.x + t * dx - p.x, A.y + t * dy - p.y); }
  const pts = () => [s.ch.S, ...s.wp, s.ch.P];
  function routeLen(P2) { let L = 0; for (let i = 1; i < P2.length; i++) L += dist(P2[i - 1], P2[i]); return L; }
  function check() { const P2 = pts(); s.hits = []; for (let i = 1; i < P2.length; i++) if (s.ch.hz.some(h => hitT(P2[i - 1], P2[i], h) >= 0)) s.hits.push(i - 1); s.len = routeLen(P2); }
  // grid Dijkstra: proves a course exists and sets the fuel
  function solve(S, P, hz) { const cs = 4, nx = Math.ceil(W / cs), ny = Math.ceil(H / cs), N2 = nx * ny, free = new Uint8Array(N2), D2 = new Float32Array(N2).fill(1e9), done = new Uint8Array(N2);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = (i + 0.5) * cs, y = (j + 0.5) * cs; free[j * nx + i] = hz.every(h => Math.hypot(x - h.x, y - h.y) > h.r + 3) ? 1 : 0; }
    const id = p => Math.min(ny - 1, Math.floor(p.y / cs)) * nx + Math.min(nx - 1, Math.floor(p.x / cs)), a = id(S), b = id(P); free[a] = free[b] = 1; D2[a] = 0;
    for (;;) { let k = -1, m = 1e9; for (let q = 0; q < N2; q++) if (!done[q] && D2[q] < m) { m = D2[q]; k = q; } if (k < 0) return 0; if (k === b) return D2[b] * cs; done[k] = 1; const i = k % nx, j = (k - i) / nx;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue; const q = jj * nx + ii; if (!free[q] || done[q]) continue; const w = m + (di && dj ? 1.414 : 1); if (w < D2[q]) D2[q] = w; } } }
  function newChart(i) { let ch = null;
    for (let tries = 0; tries < 40 && !ch; tries++) { const S = { x: 14, y: rr(25, 90) }, P = { x: 186, y: rr(25, 90) }, hz = [], cnt = 4 + i;
      for (let k = 0; k < cnt * 6 && hz.length < cnt; k++) { const r = rr(9, 17), h = { x: rr(40, 160), y: rr(r * 0.6, H - r * 0.6), r, kind: pick(['rocks', 'rocks', 'well', 'storm']) };
        if (dist(h, S) < r + 14 || dist(h, P) < r + 14 || hz.some(o => dist(o, h) < o.r + r - 4)) continue; h.dots = Array.from({ length: Math.round(r * 1.2) }, () => { const a = rr(0, 7), d = Math.sqrt(Math.random()) * r * 0.85; return [Math.cos(a) * d, Math.sin(a) * d, rr(0.8, 2.2)]; }); hz.push(h); }
      if (!hz.some(h => hitT(S, P, h) >= 0)) { const m = { x: (S.x + P.x) / 2 + rr(-20, 20), r: rr(12, 16), kind: 'well' }; m.y = S.y + (P.y - S.y) * (m.x - S.x) / (P.x - S.x); m.dots = []; hz.push(m); }
      const L = solve(S, P, hz); if (!L) continue; ch = { S, P, hz, port: PORTS[(s.portBase + i) % PORTS.length], direct: dist(S, P), fuel: Math.max(dist(S, P) * 1.35, L * 1.2), buoy: null };
      if (i === s.buoyAt) { for (let k = 0; k < 60; k++) { const b = { x: rr(60, 140), y: Math.random() < 0.5 ? rr(8, 26) : rr(H - 26, H - 8), r: 5 }; if (hz.every(h => dist(h, b) > h.r + 9) && segDist(b, S, P) > 22) { ch.buoy = b; break; } } if (ch.buoy) ch.fuel *= 1.3; } }
    s.ch = ch; s.wp = []; s.hit = null; s.sail = null; s.res = null; drag = -1; check(); }
  // ---------- sailing ----------
  function sail() { if (s.sail || s.res) return; const P2 = pts(); let acc = 0, stop = null;
    for (let i = 1; i < P2.length && !stop; i++) { const A = P2[i - 1], B = P2[i], L = dist(A, B); let best = 2, kind = null; for (const h of s.ch.hz) { const t = hitT(A, B, h); if (t >= 0 && t < best) { best = t; kind = h.kind; } } if (kind) stop = { at: acc + best * L, why: HZ[kind][1] }; acc += L; }
    if ((!stop || stop.at > s.ch.fuel) && s.len > s.ch.fuel) stop = { at: s.ch.fuel, why: 'RAN DRY' }; const cum = [0]; for (let i = 1; i < P2.length; i++) cum.push(cum[i - 1] + dist(P2[i - 1], P2[i]));
    s.sail = { P2, cum, end: stop ? stop.at : s.len, stop, d: 0, buoy: !!(s.ch.buoy && P2.some((p, i) => i && segDist(s.ch.buoy, P2[i - 1], p) < 8)) }; sfx(392, 0.2, 0.04, 'sine'); }
  function shipAt(d) { const { P2, cum } = s.sail; for (let i = 1; i < P2.length; i++) if (d <= cum[i] || i === P2.length - 1) { const A = P2[i - 1], B = P2[i], f = Math.min(1, (d - cum[i - 1]) / Math.max(0.001, cum[i] - cum[i - 1])); return { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, a: Math.atan2(B.y - A.y, B.x - A.x) }; } return { x: s.ch.S.x, y: s.ch.S.y, a: 0 }; }
  function arrive() { const sl = s.sail; let gold = 0, ok = !sl.stop, word;
    if (ok) { const eff = Math.min(1, s.ch.direct / s.len); gold = Math.round(4 + 12 * Math.max(0, (eff - 0.55) / 0.45)); s.clean++; word = eff > 0.85 ? 'TIGHT LINE' : 'ARRIVED'; s.say = 'IN AT ' + s.ch.port + ' \u00b7 +' + gold + ' G';
      if (sl.buoy) { gold += 8; s.buoyLogged = true; s.say = 'SIGNAL LOGGED: \u201C\u2026NOT OUR ORDERS\u2026 HELP US\u2026\u201D \u00b7 +' + gold + ' G'; } sfx(784, 0.3, 0.05); }
    else { word = 'LOST'; s.say = sl.stop.why + ' \u00b7 CARGO LOST'; sfx(140, 0.4, 0.05, 'square'); }
    s.earned += gold; s.res = { ok, word, t: 2.2 }; }
  function finish() { s.done = true; overlay = 'done'; s.stars = s.clean >= 5 ? 3 : s.clean >= 4 ? 2 : s.clean >= 3 ? 1 : 0;
    try { if (s.earned) save.addGold(s.earned); save.setStat('kuChartsShifts', save.stat('kuChartsShifts', 0) + 1); if (s.clean > save.stat('kuChartsBest', 0)) save.setStat('kuChartsBest', s.clean); if (s.buoyLogged) save.setFlag('kuBuoyLogged'); } catch (e) {} }
  // ---------- drawing ----------
  const X = x => x * S2P, Y = y => y * S2P;
  function drawHz(h, T) { const x = X(h.x), y = Y(h.y), r = h.r * S2P; c.save();
    if (h.kind === 'rocks') { c.fillStyle = 'rgba(106,74,42,0.22)'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#5a3a22'; for (const [dx, dy, rs] of h.dots) { c.beginPath(); c.arc(x + dx * S2P, y + dy * S2P, rs * S2P, 0, 7); c.fill(); } c.setLineDash([10, 8]); c.strokeStyle = '#5a3a22'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); }
    else if (h.kind === 'well') { c.strokeStyle = '#5a2a7a'; for (let k = 0; k < 4; k++) { const rk = r * (1 - k * 0.22) - ((T * 14) % (r * 0.22)); if (rk <= 4) continue; c.lineWidth = 3; c.globalAlpha = 0.4 + k * 0.15; c.beginPath(); c.arc(x, y, rk, 0, 7); c.stroke(); } c.globalAlpha = 1; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); }
    else { c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = 'rgba(179,18,27,0.12)'; c.fillRect(x - r, y - r, r * 2, r * 2); c.strokeStyle = '#b3121b'; c.lineWidth = 3; const o = (T * 20) % 22; for (let k = -r * 2; k < r * 2; k += 22) { c.beginPath(); c.moveTo(x + k + o - r, y - r); c.lineTo(x + k + o + r, y + r); c.stroke(); } c.restore(); c.save(); c.strokeStyle = '#b3121b'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); }
    c.restore(); text(HZ[h.kind][0], x, y + (h.kind === 'well' ? r * 0.55 : 0), 24, h.kind === 'storm' ? '#7a0c12' : h.kind === 'well' ? '#3a1a52' : '#3a2614', 900, 'center'); }
  function draw(T) { c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, CW, CH); c.strokeStyle = '#cdb98e'; c.lineWidth = 2; for (let x = 0; x <= CW; x += 51.2) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, CH); c.stroke(); } for (let y = 0; y <= CH; y += 51.2) { c.beginPath(); c.moveTo(0, y); c.lineTo(CW, y); c.stroke(); }
    c.strokeStyle = '#201e1d'; c.lineWidth = 6; c.strokeRect(3, 3, CW - 6, CH - 6);
    if (!s || !s.ch) { text('CHART PLOTTING', CW / 2, CH / 2 - 40, 84, '#201e1d', 900, 'center'); text('OLD MERRIT IS HIRING \u00b7 STAND ON THE RING', CW / 2, CH / 2 + 50, 36, '#5a3a22', 800, 'center'); tex.needsUpdate = true; return; }
    const ch = s.ch; for (const h of ch.hz) drawHz(h, T);
    if (ch.buoy) { const b = ch.buoy, x = X(b.x), y = Y(b.y), p = (T * 0.8) % 1; c.strokeStyle = '#1a8aa8'; c.lineWidth = 4; c.globalAlpha = 1 - p; c.beginPath(); c.arc(x, y, 14 + p * 46, 0, 7); c.stroke(); c.globalAlpha = 1; c.fillStyle = '#1a8aa8'; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); text('UNLOGGED SIGNAL', x, y + (b.y < H / 2 ? 34 : -34), 22, '#0f5a70', 900, 'center'); }
    const P2 = pts(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (let i = 1; i < P2.length; i++) { const bad = s.hits.includes(i - 1); c.strokeStyle = bad ? '#ec3013' : '#201e1d'; c.lineWidth = bad ? 7 : 6; c.setLineDash(s.sail ? [14, 12] : []); c.beginPath(); c.moveTo(X(P2[i - 1].x), Y(P2[i - 1].y)); c.lineTo(X(P2[i].x), Y(P2[i].y)); c.stroke(); } c.setLineDash([]);
    if (s.len > ch.fuel && !s.sail) { let acc = 0; for (let i = 1; i < P2.length; i++) { const L = dist(P2[i - 1], P2[i]); if (acc + L >= ch.fuel) { const f = (ch.fuel - acc) / L, x = X(P2[i - 1].x + (P2[i].x - P2[i - 1].x) * f), y = Y(P2[i - 1].y + (P2[i].y - P2[i - 1].y) * f); c.strokeStyle = '#ec3013'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 14, y - 14); c.lineTo(x + 14, y + 14); c.moveTo(x + 14, y - 14); c.lineTo(x - 14, y + 14); c.stroke(); text('DRY', x, y - 30, 22, '#ec3013', 900, 'center'); break; } acc += L; } }
    s.wp.forEach((w, i) => { c.fillStyle = '#f3f2f2'; c.strokeStyle = '#201e1d'; c.lineWidth = 4; c.beginPath(); c.arc(X(w.x), Y(w.y), 18, 0, 7); c.fill(); c.stroke(); text(String(i + 1), X(w.x), Y(w.y) + 1, 22, '#201e1d', 900, 'center'); });
    { const p = ch.S, x = X(p.x), y = Y(p.y); c.fillStyle = '#d08a4a'; c.strokeStyle = '#201e1d'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 24, 0, 7); c.fill(); c.stroke(); text('KUFA', x + 2, y + (p.y < H / 2 ? 46 : -46), 24, '#201e1d', 900, portrait() ? 'center' : 'left'); }
    { const p = ch.P, x = X(p.x), y = Y(p.y); c.fillStyle = '#ec3013'; c.strokeStyle = '#201e1d'; c.lineWidth = 4; c.fillRect(x - 20, y - 20, 40, 40); c.strokeRect(x - 20, y - 20, 40, 40); text(ch.port, x + 22, y + (p.y < H / 2 ? 48 : -48), 24, '#201e1d', 900, portrait() ? 'center' : 'right'); }
    if (s.sail) { const sp = shipAt(s.sail.d); c.save(); c.translate(X(sp.x), Y(sp.y)); c.rotate(sp.a); c.fillStyle = '#201e1d'; c.beginPath(); c.moveTo(22, 0); c.lineTo(-14, -13); c.lineTo(-8, 0); c.lineTo(-14, 13); c.closePath(); c.fill(); c.restore(); }
    if (s.res) { const col = s.res.ok ? '#16803c' : '#ec3013'; c.save(); c.translate(CW / 2, CH / 2); c.rotate(portrait() ? Math.PI / 2 - 0.15 : -0.15); c.fillStyle = 'rgba(232,220,192,0.85)'; c.fillRect(-230, -66, 460, 132); c.strokeStyle = col; c.lineWidth = 12; c.strokeRect(-230, -66, 460, 132); c.fillStyle = col; c.font = '900 76px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s.res.word, 0, 4); c.restore(); }
    tex.needsUpdate = true; }
  // ---------- input ----------
  function tapAt(x, y) { if (!s || !s.ch || s.sail || s.res) return; const p = { x: Math.max(3, Math.min(W - 3, x)), y: Math.max(3, Math.min(H - 3, y)) };
    const k = s.wp.findIndex(w => dist(w, p) < 7); if (k >= 0) { drag = k; return; } if (dist(p, s.ch.S) < 6 || dist(p, s.ch.P) < 6) return;
    if (s.wp.length >= MAXWP) { s.say = 'SIX TURNS IS THE MOST \u00b7 DRAG ONE OR 2 UNDO'; s.sayT = 2; sfx(180, 0.1, 0.03, 'square'); return; }
    const P2 = pts(); let bi = 0, bd = 1e9; for (let i = 1; i < P2.length; i++) { const d = segDist(p, P2[i - 1], P2[i]); if (d < bd) { bd = d; bi = i - 1; } }
    s.wp.splice(bi, 0, p); s.order.push(p); drag = bi; check(); sfx(660, 0.06, 0.03); }
  return {
    title: 'CHART PLOTTING', where: 'Maps & Charts \u00b7 Old Merrit', W, H,
    surface: { c: new THREE.Vector3(ox + at.x, YS, at.z), u, v, n, w: PW, h: PH, maxD: 4.2, maxY: 4.8 },
    stand: { x: ox + st.x, z: st.z, face: Math.atan2(-v.x, -v.z) }, spot: { x: st.x, z: st.z, r: 0.9 },
    begin() { overlay = 'intro'; s = null; plane.visible = true; hideProps(); draw(0); },
    end() { plane.visible = false; s = null; overlay = 'intro'; hidden.forEach(o => { o.visible = true; }); hidden = []; },
    camPose(camTo, lookTo, upTo, Wv, Hv, bar) { const S = this.surface, as = Wv / Hv, por = as < 0.95, phone = Math.min(Wv, Hv) < 520;
      const padB = 12 + (por ? 0 : (phone ? (as > 1 ? 74 : 84) : 92) + 22), padW = por ? (phone ? 84 : 92) + 22 : 0, Ws = por ? S.h : S.w, Hs = por ? S.w : S.h;
      const fracH = (Hv - bar - padB) / Hv, fracW = (Wv - 20 - padW) / Wv; let tf = Math.tan(25 * Math.PI / 180), d = Math.max(Hs / 2 / tf / fracH, Ws / 2 / (tf * as) / fracW) * 1.06;
      if (S.maxD && d > S.maxD) { tf *= d / S.maxD; d = S.maxD; } const fov = Math.min(104, Math.atan(tf) * 360 / Math.PI);
      upTo.copy(por ? S.u : S.v).multiplyScalar(por ? 1 : -1); const right = por ? S.v : S.u, sy = ((bar - padB) / 2) / (Hv / 2) * d * tf, sx = (padW / 2) / (Wv / 2) * d * tf * as, tilt = 0.12 * Math.min(1, 50 / fov);
      lookTo.copy(S.c).addScaledVector(upTo, sy).addScaledVector(right, sx); camTo.copy(S.c).addScaledVector(S.n, d * Math.cos(tilt)).addScaledVector(upTo, -d * Math.sin(tilt) + sy).addScaledVector(right, sx); return fov; },
    tick(dt, T, fly) { if (s && !s.done && !overlay && fly > 0.85) { if (s.sayT > 0 && (s.sayT -= dt) <= 0) s.say = null;
        if (s.sail && !s.res) { s.sail.d = Math.min(s.sail.end, s.sail.d + dt * SPEED); if (s.sail.d >= s.sail.end) arrive(); }
        else if (s.res) { if ((s.res.t -= dt) <= 0) { s.say = null; if (s.i + 1 >= N || s.t <= 0) finish(); else { s.i++; newChart(s.i); } } }
        else { s.t -= dt; if (s.t <= 0) { s.t = 0; finish(); } } }
      if (plane.visible && T - lastDraw > (LOW ? 1 / 15 : 1 / 30)) { lastDraw = T; draw(T); } },
    down(x, y) { if (!s || overlay) return; tapAt(x, y); },
    move(x, y) { if (!s || overlay || drag < 0 || s.sail) return; const w = s.wp[drag]; if (!w) return; w.x = Math.max(3, Math.min(W - 3, x)); w.y = Math.max(3, Math.min(H - 3, y)); check(); },
    up() { drag = -1; },
    pad: [{ k: 1, label: 'SAIL', sub: 'SEND HER' }, { k: 2, label: 'UNDO', sub: 'LAST TURN' }, { k: 3, label: 'CLEAR', sub: 'START OVER' }], noSticks: true,
    padPress(k, d) { if (!d || !s || s.done || overlay || s.sail || s.res) return;
      if (k === 1) sail();
      else if (k === 2) { const w = s.order.pop(); const i = s.wp.indexOf(w); if (i >= 0) s.wp.splice(i, 1); else s.wp.pop(); check(); sfx(330, 0.06, 0.03); }
      else { s.wp = []; s.order = []; check(); sfx(260, 0.08, 0.03); } },
    key(e) { if (e.type === 'keydown' && /^Digit[123]$/.test(e.code)) this.padPress(+e.code.slice(5), true); },
    hud() {
      if (overlay === 'intro') return { card: { kicker: 'Maps & Charts \u00b7 Old Merrit', title: 'Chart Plotting', body: 'Tap the chart to bend the course round the hazards. Stay inside the fuel. SAIL when the line is clean.', buttons: ['YES, PUT ME TO WORK!', 'GOODBYE'] } };
      if (overlay === 'done' && s) return { card: { kicker: 'Kufa Station \u00b7 Maps & Charts', title: s.stars === 3 ? 'A pilot\u2019s hand' : s.stars ? 'Charts delivered' : 'Merrit tuts', mood: s.clean + ' / ' + N + ' clean \u00b7 ' + (s.stars ? '\u2605'.repeat(s.stars) : 'no stars') + (s.earned ? ' \u00b7 +' + s.earned + ' G' : ''),
        notes: (s.buoyLogged ? ['You logged the signal. Merrit writes it down: a Fleet buoy, asking for help in a voice not its own.'] : ['A signal pinged off the lane and nobody logged it.']).concat(['Best shift: ' + Math.max(s.clean, save.stat('kuChartsBest', 0)) + ' / ' + N + ' clean']), buttons: ['ANOTHER SHIFT', 'GOODBYE'] } };
      if (!s || !s.ch) return {};
      const over = s.len > s.ch.fuel, fuel = Math.round(s.len / s.ch.fuel * 100);
      const where = s.say || (s.sail ? 'UNDER WAY TO ' + s.ch.port : s.hits.length ? 'THE LINE CROSSES A HAZARD \u00b7 TAP TO BEND IT' : over ? 'OVER THE FUEL \u00b7 SHORTEN THE LINE' : s.ch.buoy ? 'CLEAR COURSE \u00b7 1 SAIL \u00b7 PASS THE SIGNAL TO LOG IT' : 'CLEAR COURSE \u00b7 1 SAIL');
      return { stats: [['Chart', (s.i + 1) + ' / ' + N], ['Time', String(Math.ceil(s.t)), s.t < 20 ? '#ec3013' : null], ['Fuel', fuel + '%', over ? '#ec3013' : null], ['Earned', s.earned + ' G']], showStats: true, where, pad: this.pad, noSticks: true }; },
    cardPick(i) { const b = this.hud().card && this.hud().card.buttons[i]; if (!b || /GOODBYE|LEAVE/.test(b)) return 'leave';
      s = { t: TIME, i: 0, clean: 0, earned: 0, done: false, say: null, sayT: 0, buoyLogged: false, buoyAt: 1 + Math.floor(Math.random() * 3), portBase: Math.floor(Math.random() * PORTS.length), wp: [], order: [], hits: [], len: 0 }; overlay = null; newChart(0); sfx(523, 0.3, 0.04, 'sine'); },
  };
}
