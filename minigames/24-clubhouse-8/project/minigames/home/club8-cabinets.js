// 8 GATES — CLUBHOUSE 8 · THE EIGHT CABINETS. Tiny one-thumb arcade games drawn on a 2D canvas that becomes each cabinet's screen.
// Every game takes the same input: { x: 0..1 (where the thumb is, left to right), tap: true on the frame you tapped }.
// ATTRACT mode = the cabinet's own bot plays it (what you see walking past). PLAY = your thumb drives it.
// Games come from the home planet: Air Hockey (tavern), Ice Hockey (The Rink), Slalom (the slopes), Lake 8 Range (the jetty),
// Sal's Round + Sal's Oven (Pizza Place), Grotto Run (Glow-Worm Grotto), Snow Fort (the trench-fort).
// API: makeCabinetGame(id) → { id, name, how, col, reset(), step(dt, inp), draw(ctx, w, h, attract), bot(dt) → inp, score, lives, over, t }
export const CABINETS = [
  { id: 'airhockey', name: 'AIR HOCKEY', how: 'DRAG ← → TO MOVE THE PADDLE · SCORE IN THE TOP GOAL', col: '#38bdf8', side: -1 },
  { id: 'icehockey', name: 'ICE HOCKEY', how: 'DRAG TO AIM · TAP TO SHOOT PAST THE GOALIE', col: '#e0f2fe', side: -1 },
  { id: 'slalom', name: 'SLALOM', how: 'DRAG ← → THROUGH THE GATES', col: '#f87171', side: -1 },
  { id: 'range', name: 'LAKE 8 RANGE', how: 'DRAG TO AIM · TAP TO FIRE AT THE DRONES', col: '#4ade80', side: -1 },
  { id: 'salsround', name: 'SAL’S ROUND', how: 'DRAG THE PIE · CATCH TOPPINGS · DODGE BURNT ONES', col: '#fbbf24', side: 1 },
  { id: 'oven', name: 'SAL’S OVEN', how: 'TAP WHEN THE HEAT IS IN THE GREEN', col: '#fb923c', side: 1 },
  { id: 'grotto', name: 'GROTTO RUN', how: 'TAP TO HOP THE GLOW-WORMS', col: '#a78bfa', side: 1 },
  { id: 'snowfort', name: 'SNOW FORT', how: 'DRAG ← → TO DODGE THE SNOWBALLS', col: '#f8fafc', side: 1 },
];
const W = 240, H = 300, R = (a, b) => a + Math.random() * (b - a), cl = (v, a, b) => Math.max(a, Math.min(b, v));

function base(def) {
  return { ...def, score: 0, lives: 3, over: false, t: 0, x: 0.5, objs: [], fx: [], spawn: 0, botX: 0.5, botTapT: 0,
    hit(x, y, txt, col) { this.fx.push({ x, y, txt, col: col || '#ffd23a', t: 0 }); },
    lose(x, y) { this.lives--; this.hit(x, y, 'OUCH', '#f87171'); if (this.lives <= 0) this.over = true; },
    stepFx(dt) { this.fx.forEach(f => f.t += dt); this.fx = this.fx.filter(f => f.t < 0.8); } };
}
function frame(c, g, attract, col) {
  c.fillStyle = '#05060f'; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 1; for (let y = 0; y < H; y += 4) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  return () => {
    c.textBaseline = 'top'; c.textAlign = 'left'; c.fillStyle = col; c.font = '900 16px Archivo, Arial'; c.fillText(String(g.score).padStart(3, '0'), 8, 6);
    c.textAlign = 'right'; c.fillStyle = '#f472b6'; c.fillText('♥'.repeat(Math.max(0, g.lives)), W - 8, 6);
    g.fx.forEach(f => { c.globalAlpha = 1 - f.t / 0.8; c.textAlign = 'center'; c.fillStyle = f.col; c.font = '900 15px Archivo, Arial'; c.fillText(f.txt, f.x, f.y - f.t * 30); c.globalAlpha = 1; });
    if (attract && Math.floor(g.t * 2) % 2 === 0) { c.textAlign = 'center'; c.fillStyle = '#ffd23a'; c.font = '900 15px Archivo, Arial'; c.fillText('PRESS PLAY', W / 2, H - 26); }
    if (g.over) { c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(0, H / 2 - 30, W, 60); c.textAlign = 'center'; c.fillStyle = '#ffd23a'; c.font = '900 26px Archivo, Arial'; c.fillText('GAME OVER', W / 2, H / 2 - 16); }
  };
}
const fox = (c, x, y, s = 1, col = '#f2741f') => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-12, -2); c.lineTo(-9, -16); c.lineTo(-3, -7); c.lineTo(3, -7); c.lineTo(9, -16); c.lineTo(12, -2); c.lineTo(0, 10); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-6, 2); c.lineTo(0, 10); c.lineTo(6, 2); c.closePath(); c.fill(); c.fillStyle = '#05060f'; c.fillRect(-6, -4, 3, 3); c.fillRect(3, -4, 3, 3); c.restore(); };

const GAMES = {
  airhockey(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, px: 120, py: 150, vx: R(-70, 70), vy: 120, fx: [] }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; const pad = cl(inp.x, 0.1, 0.9) * W, sp = 1 + g.score * 0.08;
      g.px += g.vx * dt * sp; g.py += g.vy * dt * sp;
      if (g.px < 8 || g.px > W - 8) { g.vx *= -1; g.px = cl(g.px, 8, W - 8); }
      if (g.py < 30) { if (Math.abs(g.px - W / 2) < 40) { g.score++; g.hit(W / 2, 40, 'GOAL!', '#4ade80'); g.px = 120; g.py = 150; g.vy = 120; g.vx = R(-80, 80); } else { g.vy = Math.abs(g.vy); g.py = 30; } }
      if (g.vy > 0 && g.py > 262 && g.py < 280 && Math.abs(g.px - pad) < 30) { g.vy = -Math.abs(g.vy) - 6; g.vx = (g.px - pad) * 5; }
      if (g.py > H + 10) { g.lose(g.px, 260); g.px = 120; g.py = 120; g.vy = 120; g.vx = R(-60, 60); }
      g.pad = pad; g.stepFx(dt); };
    g.bot = () => ({ x: cl((g.px + (g.vy > 0 ? g.vx * 0.25 : 0)) / W, 0, 1) + Math.sin(g.t * 1.3) * 0.03, tap: false });
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.strokeStyle = '#38bdf8'; c.lineWidth = 3; c.strokeRect(4, 28, W - 8, H - 32); c.beginPath(); c.moveTo(4, 165); c.lineTo(W - 4, 165); c.stroke(); c.beginPath(); c.arc(W / 2, 165, 26, 0, 7); c.stroke();
      c.fillStyle = '#4ade80'; c.fillRect(W / 2 - 40, 26, 80, 6); c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(g.px, g.py, 8, 0, 7); c.fill(); c.fillStyle = '#f472b6'; c.beginPath(); c.arc(g.pad || 120, 272, 16, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(g.pad || 120, 272, 6, 0, 7); c.fill(); end(); };
  },
  icehockey(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, gx: 120, gv: 70, shot: null, fx: [] }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; g.gx += g.gv * dt * (1 + g.score * 0.07); if (g.gx < 70 || g.gx > 170) { g.gv *= -1; g.gx = cl(g.gx, 70, 170); }
      const aim = 60 + cl(inp.x, 0, 1) * 120; g.aim = aim;
      if (inp.tap && !g.shot) g.shot = { x: aim, y: 262 };
      if (g.shot) { g.shot.y -= 360 * dt; if (g.shot.y < 52) { const blocked = Math.abs(g.shot.x - g.gx) < 22; if (blocked) g.lose(g.shot.x, 60); else { g.score++; g.hit(g.shot.x, 60, 'GOAL!', '#4ade80'); } g.shot = null; } }
      g.stepFx(dt); };
    g.bot = dt => { g.botTapT -= dt; let tx = g.gx < 120 ? 0.85 : 0.15; return { x: tx, tap: g.botTapT <= 0 && Math.abs(60 + tx * 120 - g.gx) > 50 && (g.botTapT = R(0.7, 1.4)) > 0 }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.fillStyle = '#dbeafe'; c.fillRect(4, 28, W - 8, H - 32); c.strokeStyle = '#ef4444'; c.lineWidth = 3; c.beginPath(); c.moveTo(4, 150); c.lineTo(W - 4, 150); c.stroke(); c.strokeStyle = '#1d4ed8'; c.strokeRect(60, 36, 120, 18);
      c.fillStyle = '#1e293b'; c.fillRect(g.gx - 20, 46, 40, 14); fox(c, g.gx, 40, 0.8, '#94a3b8');
      if (g.shot) { c.fillStyle = '#05060f'; c.beginPath(); c.arc(g.shot.x, g.shot.y, 6, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(29,78,216,0.5)'; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(g.aim || 120, 262); c.lineTo(g.aim || 120, 60); c.stroke(); c.setLineDash([]); fox(c, g.aim || 120, 270, 1); end(); };
  },
  slalom(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, sx: 120, objs: [], spawn: 0.4, fx: [] }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; g.sx += (cl(inp.x, 0.05, 0.95) * W - g.sx) * Math.min(1, dt * 8); const sp = 110 + g.score * 5;
      g.spawn -= dt; if (g.spawn <= 0) { g.spawn = Math.max(0.9, 1.6 - g.score * 0.04); g.objs.push({ x: R(50, 190), y: 20, gap: Math.max(44, 74 - g.score * 1.5) }); }
      g.objs.forEach(o => o.y += sp * dt);
      g.objs.forEach(o => { if (!o.done && o.y > 262) { o.done = true; if (Math.abs(g.sx - o.x) < o.gap / 2) { g.score++; g.hit(o.x, 240, '+1', '#4ade80'); } else g.lose(g.sx, 240); } });
      g.objs = g.objs.filter(o => o.y < H + 20); g.stepFx(dt); };
    g.bot = () => { const n = g.objs.find(o => !o.done); return { x: n ? n.x / W : 0.5, tap: false }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.fillStyle = '#f1f5f9'; c.fillRect(4, 28, W - 8, H - 32);
      g.objs.forEach(o => { for (const s of [-1, 1]) { const fx = o.x + s * o.gap / 2; c.fillStyle = '#334155'; c.fillRect(fx - 1, o.y - 16, 3, 18); c.fillStyle = s < 0 ? '#ef4444' : '#2563eb'; c.beginPath(); c.moveTo(fx, o.y - 16); c.lineTo(fx + s * -12 + 0, o.y - 11); c.lineTo(fx, o.y - 6); c.fill(); } });
      c.strokeStyle = '#94a3b8'; c.lineWidth = 2; c.beginPath(); c.moveTo(g.sx - 7, 284); c.lineTo(g.sx - 7, 258); c.moveTo(g.sx + 7, 284); c.lineTo(g.sx + 7, 258); c.stroke(); fox(c, g.sx, 268, 0.9); end(); };
  },
  range(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, objs: [], bolts: [], spawn: 0.3, fx: [], cool: 0, miss: 0 }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; g.cx = cl(inp.x, 0.05, 0.95) * W; g.cool -= dt;
      if (inp.tap && g.cool <= 0) { g.bolts.push({ x: g.cx, y: 262 }); g.cool = 0.25; }
      g.spawn -= dt; if (g.spawn <= 0) { g.spawn = Math.max(0.7, 1.4 - g.score * 0.03); const d = Math.random() < 0.5 ? 1 : -1; g.objs.push({ x: d > 0 ? -14 : W + 14, y: R(50, 170), v: d * R(50, 90 + g.score * 3) }); }
      g.objs.forEach(o => o.x += o.v * dt); g.bolts.forEach(b => b.y -= 420 * dt);
      g.bolts.forEach(b => g.objs.forEach(o => { if (!o.dead && !b.dead && Math.abs(b.x - o.x) < 15 && Math.abs(b.y - o.y) < 12) { o.dead = b.dead = true; g.score++; g.hit(o.x, o.y, '+1', '#4ade80'); } }));
      g.objs.forEach(o => { if (!o.dead && !o.gone && (o.x < -20 || o.x > W + 20)) { o.gone = true; if (++g.miss % 3 === 0) g.lose(W / 2, 200); } });
      g.objs = g.objs.filter(o => !o.dead && !o.gone); g.bolts = g.bolts.filter(b => !b.dead && b.y > 20); g.stepFx(dt); };
    g.miss = 0;
    g.bot = dt => { const o = g.objs[0]; if (!o) return { x: 0.5, tap: false }; const lead = o.x + o.v * ((262 - o.y) / 420); g.botTapT -= dt; const tap = g.botTapT <= 0 && Math.abs(lead - (g.cx || 120)) < 10; if (tap) g.botTapT = 0.35; return { x: cl(lead / W, 0, 1), tap }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); const gr = c.createLinearGradient(0, 28, 0, H); gr.addColorStop(0, '#0c4a6e'); gr.addColorStop(1, '#082f49'); c.fillStyle = gr; c.fillRect(4, 28, W - 8, H - 32);
      g.objs.forEach(o => { c.fillStyle = '#e2e8f0'; c.fillRect(o.x - 12, o.y - 3, 24, 6); c.fillStyle = '#4ade80'; c.beginPath(); c.arc(o.x, o.y + 2, 5, 0, 7); c.fill(); c.fillStyle = '#94a3b8'; c.fillRect(o.x - 15, o.y - 6, 8, 2); c.fillRect(o.x + 7, o.y - 6, 8, 2); });
      g.bolts.forEach(b => { c.fillStyle = '#facc15'; c.fillRect(b.x - 2, b.y - 8, 4, 12); });
      const x = g.cx || 120; c.strokeStyle = '#4ade80'; c.lineWidth = 2; c.beginPath(); c.arc(x, 150, 10, 0, 7); c.moveTo(x - 15, 150); c.lineTo(x + 15, 150); c.moveTo(x, 135); c.lineTo(x, 165); c.stroke(); c.fillStyle = '#475569'; c.fillRect(x - 10, 266, 20, 18); c.fillRect(x - 3, 254, 6, 14); end(); };
  },
  salsround(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, objs: [], spawn: 0.3, fx: [] }); };
    const TOP = ['#dc2626', '#a16207', '#16a34a', '#1f2937', '#f5f5f4'];
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; g.cx = cl(inp.x, 0.08, 0.92) * W;
      g.spawn -= dt; if (g.spawn <= 0) { g.spawn = Math.max(0.35, 0.8 - g.score * 0.01); const burnt = Math.random() < 0.22; g.objs.push({ x: R(20, 220), y: 26, v: R(90, 130) + g.score * 2, burnt, col: TOP[(Math.random() * 5) | 0] }); }
      g.objs.forEach(o => { o.y += o.v * dt; if (!o.done && o.y > 258 && o.y < 278 && Math.abs(o.x - g.cx) < 30) { o.done = true; if (o.burnt) g.lose(o.x, 250); else { g.score++; g.hit(o.x, 248, '+1'); } } });
      g.objs = g.objs.filter(o => !o.done && o.y < H + 10); g.stepFx(dt); };
    g.bot = () => { const good = g.objs.filter(o => !o.burnt && o.y < 262).sort((a, b) => b.y - a.y)[0], bad = g.objs.find(o => o.burnt && o.y > 200 && Math.abs(o.x - (g.cx || 120)) < 34); let tx = good ? good.x : 120; if (bad) tx = bad.x < (g.cx || 120) ? bad.x + 70 : bad.x - 70; return { x: cl(tx / W, 0, 1), tap: false }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.fillStyle = '#3b1d0b'; c.fillRect(4, 28, W - 8, H - 32);
      g.objs.forEach(o => { c.fillStyle = o.burnt ? '#111' : o.col; c.beginPath(); c.arc(o.x, o.y, 7, 0, 7); c.fill(); if (o.burnt) { c.fillStyle = '#f97316'; c.fillRect(o.x - 1, o.y - 12, 2, 5); } });
      const x = g.cx || 120; c.fillStyle = '#e8b04a'; c.beginPath(); c.ellipse(x, 272, 32, 12, 0, 0, 7); c.fill(); c.fillStyle = '#ef4444'; c.beginPath(); c.ellipse(x, 270, 26, 9, 0, 0, 7); c.fill(); c.fillStyle = '#fef3c7'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x - 16 + i * 8, 269 + (i % 2) * 3, 3, 0, 7); c.fill(); } end(); };
  },
  oven(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, heat: 0, dir: 1, zone: 0.24, zc: 0.62, flashT: 0, fx: [] }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; g.heat += g.dir * dt * (0.55 + g.score * 0.05); if (g.heat > 1) { g.heat = 1; g.dir = -1; } if (g.heat < 0) { g.heat = 0; g.dir = 1; } g.flashT -= dt;
      if (inp.tap && g.flashT <= 0) { g.flashT = 0.35; if (Math.abs(g.heat - g.zc) < g.zone / 2) { g.score++; g.hit(120, 120, Math.abs(g.heat - g.zc) < g.zone / 6 ? 'PERFECT!' : 'BAKED!', '#4ade80'); g.zone = Math.max(0.09, g.zone - 0.012); g.zc = R(0.3, 0.85); } else g.lose(120, 120); }
      g.stepFx(dt); };
    g.bot = dt => { g.botTapT -= dt; const tap = g.botTapT <= 0 && Math.abs(g.heat - g.zc) < g.zone / 3; if (tap) g.botTapT = 0.6; return { x: 0.5, tap }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.fillStyle = '#292524'; c.fillRect(4, 28, W - 8, H - 32);
      c.fillStyle = '#7c2d12'; c.beginPath(); c.arc(120, 160, 70, Math.PI, 0); c.lineTo(190, 210); c.lineTo(50, 210); c.closePath(); c.fill(); c.fillStyle = `rgb(${200 + g.heat * 55},${80 + g.heat * 120},20)`; c.beginPath(); c.arc(120, 190, 40, Math.PI, 0); c.fill();
      c.fillStyle = '#e8b04a'; c.beginPath(); c.ellipse(120, 196, 30, 8, 0, 0, 7); c.fill();
      const bx = 30, bw = 180, by = 240; c.fillStyle = '#44403c'; c.fillRect(bx, by, bw, 20); c.fillStyle = '#16a34a'; c.fillRect(bx + (g.zc - g.zone / 2) * bw, by, g.zone * bw, 20); c.fillStyle = '#fff'; c.fillRect(bx + g.heat * bw - 2, by - 6, 4, 32);
      c.fillStyle = '#fbbf24'; c.font = '900 12px Archivo, Arial'; c.textAlign = 'center'; c.fillText('HEAT', 120, by + 26); end(); };
  },
  grotto(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, y: 0, vy: 0, objs: [], spawn: 1, fx: [] }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; if (inp.tap && g.y <= 0.01) g.vy = 330; g.vy -= 900 * dt; g.y = Math.max(0, g.y + g.vy * dt); if (g.y === 0) g.vy = Math.max(0, g.vy);
      const sp = 120 + g.score * 5; g.spawn -= dt; if (g.spawn <= 0) { g.spawn = R(0.9, 1.6) - Math.min(0.4, g.score * 0.02); g.objs.push({ x: W + 10, h: R(16, 30) }); }
      g.objs.forEach(o => { o.x -= sp * dt; if (!o.done && o.x < 64 && o.x > 40) { if (g.y < o.h - 4) { o.done = true; g.lose(52, 220); } } if (!o.done && o.x < 36) { o.done = true; g.score++; g.hit(52, 200, '+1', '#a78bfa'); } });
      g.objs = g.objs.filter(o => o.x > -20); g.stepFx(dt); };
    g.bot = () => { const n = g.objs.find(o => !o.done && o.x > 50); return { x: 0.5, tap: !!n && n.x < 100 && n.x > 80 }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.fillStyle = '#0b1026'; c.fillRect(4, 28, W - 8, H - 32); for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(167,139,250,' + (0.3 + 0.3 * Math.sin(g.t * 3 + i)) + ')'; c.beginPath(); c.arc((i * 53 + g.t * 10) % W, 40 + (i * 37) % 120, 2, 0, 7); c.fill(); }
      c.fillStyle = '#1e3a8a'; c.fillRect(4, 250, W - 8, 46);
      g.objs.forEach(o => { c.fillStyle = '#a78bfa'; c.beginPath(); c.ellipse(o.x, 250 - o.h / 2, 8, o.h / 2, 0, 0, 7); c.fill(); c.fillStyle = '#fef08a'; c.beginPath(); c.arc(o.x, 250 - o.h, 4, 0, 7); c.fill(); });
      const by = 246 - g.y; c.fillStyle = '#92400e'; c.beginPath(); c.moveTo(30, by); c.lineTo(74, by); c.lineTo(66, by + 10); c.lineTo(38, by + 10); c.fill(); fox(c, 52, by - 10, 0.8); end(); };
  },
  snowfort(g) {
    g.reset = () => { Object.assign(g, { score: 0, lives: 3, over: false, t: 0, objs: [], spawn: 0.4, fx: [], acc: 0 }); };
    g.step = (dt, inp) => { if (g.over) return; g.t += dt; g.x = inp.x; g.cx = (g.cx == null ? 120 : g.cx) + (cl(inp.x, 0.05, 0.95) * W - (g.cx == null ? 120 : g.cx)) * Math.min(1, dt * 10);
      g.spawn -= dt; if (g.spawn <= 0) { g.spawn = Math.max(0.28, 0.75 - g.t * 0.012); g.objs.push({ x: R(14, 226), y: 24, v: R(110, 160) + g.t * 2 }); }
      g.objs.forEach(o => { o.y += o.v * dt; if (!o.done && o.y > 256 && o.y < 284 && Math.abs(o.x - g.cx) < 16) { o.done = true; g.lose(o.x, 250); } });
      g.acc += dt; if (g.acc >= 1) { g.acc = 0; g.score++; }
      g.objs = g.objs.filter(o => !o.done && o.y < H + 10); g.stepFx(dt); };
    g.bot = () => { const x = g.cx == null ? 120 : g.cx; const th = g.objs.filter(o => o.y > 170 && Math.abs(o.x - x) < 30); let tx = x; if (th.length) { const o = th[0]; tx = o.x < x ? x + 50 : x - 50; if (tx < 20) tx = x + 60; if (tx > 220) tx = x - 60; } else tx = 120 + Math.sin(g.t) * 60; return { x: cl(tx / W, 0, 1), tap: false }; };
    g.draw = (c, attract) => { const end = frame(c, g, attract, g.col); c.fillStyle = '#1e293b'; c.fillRect(4, 28, W - 8, H - 32); c.fillStyle = '#e2e8f0'; for (let i = 0; i < 6; i++) c.fillRect(4 + i * 40, 32, 30, 14); c.fillRect(4, 284, W - 8, 12);
      g.objs.forEach(o => { c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(o.x, o.y, 7, 0, 7); c.fill(); });
      fox(c, g.cx == null ? 120 : g.cx, 270, 1); end(); };
  },
};

export function makeCabinetGame(id) {
  const def = CABINETS.find(c => c.id === id) || CABINETS[0], g = base(def);
  GAMES[def.id](g); g.reset();
  g.drawTo = (ctx, attract) => g.draw(ctx, attract);
  return g;
}
export const CAB_W = W, CAB_H = H;
