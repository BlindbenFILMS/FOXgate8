// s483 STAR TABLE (Luxor Station · Sun Gallery · Seer Nahla): a new station console game on a round holo-chart table.
// Each night = 3 constellations of the 8 GATES skies. One glows for 3 s (MEMORISE), then fades: drag from star to star to trace it from
// memory among decoy stars. A wrong line = a miss (red flash). 40 s a constellation; 1 HINT = the ghost lines again for 1.5 s (−5 s).
// ★★★ = no misses, ★★ = 1-2, ★ = finished. Round 2 of every night: a cyan FLEET RELAY drifts across the chart (a hacked Fleet satellite
// posing as a star): tap it to log it (+5 G, flag lxFleetRelay). Gold 4 per ★. Stats lxChartNight, lxChartBest.
const SHAPES = [
  { name: 'THE FOX', p: [[-0.6, -0.9], [-0.35, -0.25], [0, 0.7], [0.35, -0.25], [0.6, -0.9], [0, -0.35]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 4]] },
  { name: 'THE GATE', p: [[0, -0.9], [-0.4, -0.45], [0, 0], [0.4, -0.45], [-0.4, 0.45], [0, 0.9], [0.4, 0.45]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 6], [6, 2]] },
  { name: 'THE PYRAMID', p: [[0, -0.8], [-0.4, -0.1], [-0.8, 0.6], [0.8, 0.6], [0.4, -0.1]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 4]] },
  { name: 'THE MIRROR', p: [[-0.5, -0.75], [0.5, -0.75], [0.5, 0.1], [0, 0.1], [-0.5, 0.1], [0, 0.85]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [3, 5]] },
  { name: 'THE LAVA SERPENT', p: [[-0.9, 0.2], [-0.5, -0.4], [-0.1, 0.3], [0.3, -0.4], [0.7, 0.2], [0.95, -0.15]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  { name: 'THE CROWN', p: [[-0.8, 0.6], [-0.8, -0.4], [-0.4, 0.1], [0, -0.7], [0.4, 0.1], [0.8, -0.4], [0.8, 0.6]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]] },
  { name: 'THE PEARL SAIL', p: [[0, -0.9], [0, 0.45], [0.7, 0.35], [-0.7, 0.45], [-0.35, 0.85], [0.45, 0.85]], e: [[0, 1], [0, 2], [2, 1], [3, 1], [3, 4], [4, 5], [5, 2]] },
  { name: 'THE LANTERN', p: [[0, -0.9], [-0.4, -0.5], [0.4, -0.5], [-0.45, 0.6], [0.45, 0.6]], e: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]] }];
const W = 200, H = 140, TIME = 40, MEM = 3;

export function makeStarTable(K, { host, ox, at, audio, save, LOW }) {
  const { THREE } = K, rr = (a, b) => a + Math.random() * (b - a);
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); host.add(root);
  const PW = 3.2, PH = PW * H / W, YS = 1.12;
  // the table: basalt drum, gold rim, the chart disc on top
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); root.add(m); return m; };
  add(new THREE.CylinderGeometry(0.7, 0.9, 1.0, 24), K.toon('#2a2220'), 0, 0.5, 0);
  add(new THREE.CylinderGeometry(1.95, 1.95, 0.1, 40), K.toon('#17110f'), 0, 1.04, 0); add(new THREE.TorusGeometry(1.95, 0.05, 8, 64), K.toon('#e8b42a'), 0, 1.09, 0).rotation.x = Math.PI / 2;
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * H / W); const c = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const chart = add(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, YS, 0); chart.rotation.x = -Math.PI / 2;
  const S2P = 1024 / W;
  let s = null, overlay = 'intro', lastDraw = 0, ptr = null, night = 0;
  const sfx = (f, d = 0.12, v = 0.04, t = 'triangle') => { try { audio.tone(f, d, v, t); } catch (e) {} };
  // ---------- a constellation laid into the field with decoys ----------
  function lay(shape) { const sc = rr(30, 38), rot = rr(-0.5, 0.5), cx = rr(70, 130), cy = rr(52, 88), cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = shape.p.map(([x, y]) => ({ x: cx + (x * cs - y * sn) * sc, y: cy + (x * sn + y * cs) * sc, pat: true, mag: rr(0.8, 1.2) }));
    const segD = (q, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy, t = Math.max(0, Math.min(1, ((q.x - a.x) * dx + (q.y - a.y) * dy) / L)); return Math.hypot(q.x - a.x - t * dx, q.y - a.y - t * dy); };
    const stars = pts.slice(); let tries = 0;
    while (stars.length < pts.length + 16 && tries++ < 3000) { const q = { x: rr(10, W - 10), y: rr(10, H - 10), pat: false, mag: rr(0.55, 1.15) };
      if (stars.some(o => Math.hypot(o.x - q.x, o.y - q.y) < 12)) continue; if (shape.e.some(([a, b]) => segD(q, pts[a], pts[b]) < 9)) continue; stars.push(q); }
    stars.forEach((q, i) => { q.i = i; q.tw = rr(0, 6); });
    return { stars, edges: shape.e.map(([a, b]) => [a, b]), done: new Set() }; }
  function fresh(n) { night = n; const list = [0, 1, 2].map(k => SHAPES[(n * 3 + k) % SHAPES.length]); return { night: n, list, r: 0, res: [], sat: null, satLogged: false, done: false }; }
  function startRound() { const shp = s.list[s.r]; s.L = lay(shp); s.shape = shp; s.left = TIME; s.mem = MEM; s.ghost = 0; s.miss = 0; s.cur = null; s.wrong = null; s.complete = 0; s.failT = 0; s.flash = null;
    s.sat = s.r === 1 ? { x: -8, y: rr(25, 115), vx: rr(7, 10), vy: rr(-2, 2), on: true } : null; sfx(392, 0.5, 0.04, 'sine'); setTimeout(() => sfx(587, 0.6, 0.035, 'sine'), 160); }
  const key = (a, b) => a < b ? a + ':' + b : b + ':' + a;
  function tryEdge(a, b) { const L = s.L, ok = a < L.edges.length + 99 && L.stars[a].pat && L.stars[b].pat && L.edges.some(([x, y]) => key(x, y) === key(a, b));
    if (ok) { if (L.done.has(key(a, b))) return; L.done.add(key(a, b)); sfx(523 + L.done.size * 60, 0.18, 0.05); if (L.done.size >= L.edges.length) finishRound(true); }
    else { s.miss++; s.wrong = { a, b, t: 0.7 }; sfx(150, 0.25, 0.05, 'square'); s.flash = 'NOT IN ' + s.shape.name; s.flashT = 1.2; } }
  function finishRound(ok) { const stars = ok ? (s.miss === 0 ? 3 : s.miss <= 2 ? 2 : 1) : 0; s.res.push({ name: s.shape.name, stars }); s.complete = ok ? 1.8 : 0; s.failT = ok ? 0 : 1.8; s.cur = null;
    if (ok) { [659, 784, 988, 1318].forEach((f, i) => setTimeout(() => sfx(f, 0.25, 0.04), i * 90)); s.flash = s.shape.name + ' \u00b7 ' + '\u2605'.repeat(stars); s.flashT = 1.8; }
    else { sfx(196, 0.5, 0.05, 'sine'); s.flash = 'TIME \u00b7 THIS WAS ' + s.shape.name; s.flashT = 1.8; s.ghost = 1.8; } }
  function nextOrEnd() { s.r++; if (s.r < s.list.length) { startRound(); return; }
    s.done = true; const tot = s.res.reduce((a, r) => a + r.stars, 0), gold = tot * 4 + (s.satLogged ? 5 : 0); s.gold = gold; s.tot = tot;
    try { if (gold) save.addGold(gold); save.setStat('lxChartNight', night + 1); if (tot > save.stat('lxChartBest', 0)) save.setStat('lxChartBest', tot); } catch (e) {} overlay = 'done'; }
  // ---------- drawing ----------
  const P = v => v * S2P;
  function draw(T) { const w = cv.width, h = cv.height; const g = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.65); g.addColorStop(0, '#16203e'); g.addColorStop(1, '#070a16'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(127,216,255,0.12)'; c.lineWidth = 2; for (let r = 1; r <= 4; r++) { c.beginPath(); c.arc(w / 2, h / 2, r * h / 8.5, 0, 7); c.stroke(); } for (let a = 0; a < 12; a++) { c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a * Math.PI / 6) * w, h / 2 + Math.sin(a * Math.PI / 6) * w); c.stroke(); }
    c.strokeStyle = 'rgba(232,180,42,0.8)'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
    if (!s || !s.L) { for (let i = 0; i < 70; i++) { const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * w, y = (Math.sin(i * 47.3) * 0.5 + 0.5) * h, tw = 0.5 + 0.5 * Math.sin(T * 2 + i); c.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.5 * tw) + ')'; c.beginPath(); c.arc(x, y, 2 + (i % 3), 0, 7); c.fill(); }
      c.fillStyle = '#ffd23a'; c.font = '900 64px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STAR TABLE', w / 2, h / 2 - 30); c.fillStyle = '#f3f2f2'; c.font = '800 34px Archivo, Arial'; c.fillText('SEER NAHLA \u00b7 STAND ON THE RING', w / 2, h / 2 + 34); tex.needsUpdate = true; return; }
    const L = s.L, st = L.stars, ghostA = Math.max(s.mem > 0 ? Math.min(1, s.mem / 0.6) : 0, Math.min(1, s.ghost / 0.5));
    if (ghostA > 0) { c.strokeStyle = 'rgba(95,227,255,' + (0.75 * ghostA) + ')'; c.lineWidth = 7; c.setLineDash([18, 12]); for (const [a, b] of L.edges) { c.beginPath(); c.moveTo(P(st[a].x), P(st[a].y)); c.lineTo(P(st[b].x), P(st[b].y)); c.stroke(); } c.setLineDash([]); }
    const glowK = s.complete > 0 ? 1 + Math.sin(T * 10) * 0.2 : 1; c.strokeStyle = '#ffd23a'; c.lineWidth = 9 * glowK; c.lineCap = 'round';
    for (const k of L.done) { const [a, b] = k.split(':').map(Number); c.beginPath(); c.moveTo(P(st[a].x), P(st[a].y)); c.lineTo(P(st[b].x), P(st[b].y)); c.stroke(); }
    if (s.wrong && s.wrong.t > 0) { const { a, b } = s.wrong; c.strokeStyle = 'rgba(236,48,19,' + Math.min(1, s.wrong.t / 0.4) + ')'; c.lineWidth = 9; c.beginPath(); c.moveTo(P(st[a].x), P(st[a].y)); c.lineTo(P(st[b].x), P(st[b].y)); c.stroke(); }
    if (s.cur != null && ptr) { c.strokeStyle = 'rgba(243,242,242,0.8)'; c.lineWidth = 5; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(P(st[s.cur].x), P(st[s.cur].y)); c.lineTo(P(ptr.x), P(ptr.y)); c.stroke(); c.setLineDash([]); }
    for (const q of st) { const tw = 0.75 + 0.25 * Math.sin(T * 2.4 + q.tw), r = (5 + q.mag * 5) * (q.i === s.cur ? 1.5 : 1) * (s.complete > 0 && q.pat ? 1.4 : 1), x = P(q.x), y = P(q.y);
      const gg = c.createRadialGradient(x, y, 0, x, y, r * 3.4); gg.addColorStop(0, 'rgba(255,248,220,' + (0.55 * tw) + ')'); gg.addColorStop(1, 'rgba(255,248,220,0)'); c.fillStyle = gg; c.beginPath(); c.arc(x, y, r * 3.4, 0, 7); c.fill();
      c.fillStyle = q.i === s.cur ? '#ffd23a' : '#ffffff'; c.beginPath(); c.arc(x, y, r * 0.7, 0, 7); c.fill(); }
    if (s.sat && s.sat.on) { const x = P(s.sat.x), y = P(s.sat.y), bl = Math.sin(T * 7) > -0.2; c.fillStyle = bl ? '#5fe3ff' : 'rgba(95,227,255,0.35)'; c.fillRect(x - 6, y - 6, 12, 12); c.fillRect(x - 22, y - 3, 12, 6); c.fillRect(x + 10, y - 3, 12, 6);
      if (bl) { c.strokeStyle = 'rgba(95,227,255,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 20 + (T * 30) % 20, 0, 7); c.stroke(); } }
    tex.needsUpdate = true; }
  const near = (x, y, r) => { let best = null, bd = r; for (const q of s.L.stars) { const d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = q; } } return best; };
  const live = () => s && !s.done && !overlay && s.L && s.mem <= 0 && s.complete <= 0 && s.failT <= 0;
  return {
    title: 'STAR TABLE', where: 'Sun Gallery \u00b7 Seer Nahla', W, H,
    surface: { c: new THREE.Vector3(ox + at.x, YS, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: 4.6, maxY: 5.2 },
    stand: { x: ox + at.x, z: at.z + 2.5, face: Math.PI }, spot: { x: at.x, z: at.z + 2.5, r: 0.9 },
    pad: [{ k: 1, label: 'HINT', sub: '\u22125 S' }], noSticks: true,
    idle(dt, T) { if (!s && T - lastDraw > 0.25) { lastDraw = T; draw(T); } },
    begin() { overlay = 'intro'; s = null; draw(0); },
    end() { s = null; overlay = 'intro'; ptr = null; draw(0); },
    tick(dt, T, fly) { if (s && !s.done && !overlay && fly > 0.85) {
        if (s.mem > 0) { s.mem -= dt; if (s.mem <= 0) sfx(330, 0.2, 0.03, 'sine'); }
        else if (s.complete > 0) { s.complete -= dt; if (s.complete <= 0) nextOrEnd(); }
        else if (s.failT > 0) { s.failT -= dt; if (s.failT <= 0) nextOrEnd(); }
        else { s.left -= dt; if (s.left <= 0) { s.left = 0; finishRound(false); } }
        if (s.ghost > 0) s.ghost -= dt; if (s.wrong) s.wrong.t -= dt; if (s.flashT > 0 && (s.flashT -= dt) <= 0) s.flash = null;
        if (s.sat && s.sat.on) { s.sat.x += s.sat.vx * dt; s.sat.y += s.sat.vy * dt; if (s.sat.x > W + 10) s.sat.on = false; } }
      if (T - lastDraw > (LOW ? 1 / 15 : 1 / 30)) { lastDraw = T; draw(T); } },
    down(x, y) { if (!live()) return; ptr = { x, y };
      if (s.sat && s.sat.on && Math.hypot(s.sat.x - x, s.sat.y - y) < 9) { s.sat.on = false; s.satLogged = true; s.flash = 'LOGGED \u00b7 FLEET RELAY \u00b7 NOT A STAR'; s.flashT = 2.2; sfx(880, 0.3, 0.05, 'sine'); try { save.setFlag('lxFleetRelay'); } catch (e) {} return; }
      const q = near(x, y, 9); if (q) { s.cur = q.i; sfx(700, 0.06, 0.03); } },
    move(x, y) { if (!live()) return; ptr = { x, y }; if (s.cur == null) return; const q = near(x, y, 6.5); if (q && q.i !== s.cur) { const a = s.cur; s.cur = q.i; tryEdge(a, q.i); } },
    up() { if (s) s.cur = null; ptr = null; },
    padPress(k, d) { if (!d || !live() || k !== 1) return; s.ghost = 1.5; s.left = Math.max(1, s.left - 5); sfx(520, 0.2, 0.03, 'sine'); },
    hud() {
      if (overlay === 'intro') return { card: { kicker: 'Sun Gallery \u00b7 Seer Nahla', title: 'Star Table', body: 'A constellation glows for three seconds, then fades. Drag from star to star to trace it from memory. Wrong lines are misses.', buttons: ['CHART TONIGHT\u2019S SKY', 'NOT NOW'] } };
      if (overlay === 'done' && s) { const first = s.satLogged && !s.satNoted;
        return { card: { kicker: 'Night ' + (s.night + 1) + ' \u00b7 Star Table', title: s.tot >= 8 ? 'A perfect chart' : 'Chart filed', mood: s.tot + ' of 9 \u2605' + (s.gold ? ' \u00b7 +' + s.gold + ' G' : ''),
          notes: s.res.map(r => r.name + ' \u00b7 ' + (r.stars ? '\u2605'.repeat(r.stars) : 'NOT TRACED')).concat(s.satLogged ? ['Nahla: \u201CThat was no star. A Fleet relay, sending on a band nobody uses.\u201D'] : ['Best night: ' + Math.max(s.tot, save.stat('lxChartBest', 0)) + ' \u2605']), buttons: ['NEXT NIGHT', 'LEAVE THE TABLE'] } }; }
      if (!s || !s.L) return {};
      const say = s.flash || (s.mem > 0 ? 'MEMORISE \u00b7 ' + s.shape.name : s.complete > 0 || s.failT > 0 ? '' : 'TRACE ' + s.shape.name + ' \u00b7 DRAG STAR TO STAR' + (s.sat && s.sat.on ? ' \u00b7 SOMETHING IS MOVING' : ''));
      return { stats: [['Round', (s.r + 1) + ' / 3'], ['Time', String(Math.ceil(s.left)), s.left < 10 ? '#ec3013' : null], ['Lines', s.L.done.size + ' / ' + s.L.edges.length], ['Miss', String(s.miss), s.miss ? '#ec3013' : null]], showStats: true, where: say, pad: this.pad, noSticks: true }; },
    cardPick(i) { const b = this.hud().card && this.hud().card.buttons[i]; if (!b || /NOT NOW|LEAVE/.test(b)) return 'leave';
      s = fresh(overlay === 'done' ? night + 1 : save.stat('lxChartNight', 0)); overlay = null; startRound(); },
  };
}
