// MERU 2.0 — s162 MERU HARDWARE · PART 2A: the 7 DEPARTMENT JOBS (Ben's picks). One panel engine, one game per department:
//   FRONT COUNTER KEY CUTTER (Dozer) · LUMBER STACK THE RACK (Hank) · ELECTRICAL BULB TEST (Volta) · PLUMBING DUCK RACE (Gus) ·
//   MASONRY TILE PATTERN (Morty) · PAINT COLOUR MATCH (Tilly) · GARDEN WATER ROUND (Fern).
// While the crew is at the Outlets, Tilly (left side + counter) and Fern (right side) run the away departments' jobs (speaker(k) from meru2-hardware.js).
// NOW HIRING = a picker of all 7. Prizes: gold per star · all 7 cleared = HANK'S FLANNEL outfit · all 7 at 3 stars = HARDWARE HERO.
// Stats via shopKit prefix hw: hwStar_<k> / hwBest_<k>; hwAllJobs, hwHero. Hint hand after 3 s idle. Test: __hwJobs.start('paint').
export const HW_GAMES = [
  { k: 'tools', name: 'Key Cutter', dept: 'FRONT COUNTER', color: '#ec3013' }, { k: 'lumber', name: 'Stack the Rack', dept: 'LUMBER', color: '#8b6a48' },
  { k: 'elec', name: 'Bulb Test', dept: 'ELECTRICAL', color: '#e0a800' }, { k: 'plumb', name: 'Duck Race', dept: 'PLUMBING', color: '#2e86b8' },
  { k: 'mason', name: 'Tile Pattern', dept: 'MASONRY', color: '#8a857e' }, { k: 'paint', name: 'Colour Match', dept: 'PAINT', color: '#c2456a' },
  { k: 'garden', name: 'Water Round', dept: 'GARDEN', color: '#3f9a5e' }];
// s164 PART 2C: the 8 EXTRA jobs, each unlocked by 3 stars on its department's first job (base). Stats hwStar_<k> / hwBest_<k> like the 7; all 8 cleared = SHOP FOREMAN (+60 G, stat hwExtraAll).
export const HW_EXTRA = [
  { k: 'tools2', base: 'tools', name: 'Nuts & Bolts', dept: 'FRONT COUNTER', color: '#ec3013' }, { k: 'lumber2', base: 'lumber', name: 'Forklift Load', dept: 'LUMBER', color: '#8b6a48' },
  { k: 'elec2', base: 'elec', name: 'Fuse Box', dept: 'ELECTRICAL', color: '#e0a800' }, { k: 'plumb2', base: 'plumb', name: 'Leak Patrol', dept: 'PLUMBING', color: '#2e86b8' },
  { k: 'plumb3', base: 'plumb', name: 'Pressure Gauge', dept: 'PLUMBING', color: '#2e86b8' }, { k: 'mason2', base: 'mason', name: 'Brick Layer', dept: 'MASONRY', color: '#8a857e' },
  { k: 'paint2', base: 'paint', name: 'Roll the Wall', dept: 'PAINT', color: '#c2456a' }, { k: 'garden2', base: 'garden', name: 'Sunflower Grow', dept: 'GARDEN', color: '#3f9a5e' }];
export const HW_ALL = [...HW_GAMES, ...HW_EXTRA];
export const FLANNEL = { outfit: 'vest', torso: ['#a8322a', '#201e1d', '#5a1a14'], name: "HANK'S FLANNEL" };
export function hwJobs(o) {
  const { save, K, sayTo, toast, speaker, prize, yard } = o, isMuted = o.isMuted || (() => false);
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', STEEL = '#9aa0a6';
  const GN = Object.fromEntries(HW_ALL.map(q => [q.k, q]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // ---------- lines (every box 20 words or less) ----------
  const INTRO = { tools: 'Mm. Keys cut while you wait. Slide your finger along the dotted teeth before the blade passes.',
    lumber: 'Kid, stack the oak. Tap DROP when the board sits over the pile. Ten boards, keep it wide.',
    elec: 'Bright spark! Tap the flickering bulbs. Leave the steady ones alone. Three test boards!',
    plumb: 'Drain test. Tap PUMP to push your yellow duck. Tap the gunk to plunge it. Beat my ducks.',
    mason: 'Copy the card onto the floor. Pick a colour, tap a square. Cement sets fast.',
    paint: 'Match the swatch, sunshine. Tap the tins to add drops, then MIX IT. Four orders!',
    garden: 'Water the droopy pots, sprout. The dark wet ones are full. Do not drown them.' };
  const HOW = { tools: 'Slide your finger along the dotted teeth before the blade passes.', lumber: 'Tap DROP when the board sits over the pile.', elec: 'Tap the flickering bulbs. Leave the steady ones.',
    plumb: 'Tap PUMP for the yellow duck. Tap gunk to plunge it.', mason: 'Pick a colour, tap a square. Copy the card.', paint: 'Tap tins to add drops, then MIX IT.', garden: 'Water the droopy pots. Not the wet ones.' };
  const DONE = { tools: 'Mm. Three keys. They all turn. Good hands.', lumber: 'Level as a lake, kid. Hank approves.', elec: 'Every bulb steady! You are a live wire. Sorry. Not sorry.',
    plumb: 'Drains clear. Ducks happy. Calm work.', mason: 'Straight lines. Right colours. I almost smiled.', paint: 'Perfect match, sunshine! You have a painter\u2019s eye.', garden: 'Every pot happy. They said thank you. Quietly.' };
  Object.assign(INTRO, { tools2: 'Mm. Bolts come down the counter. Tap the nut that fits. Not loose. Not tight.',
    lumber2: 'My forklift is out in the yard, kid. Rack four pallets, then load the truck. Mind the beams.',
    elec2: 'Bright spark! Each switch flips its room and the rooms next door. Light the whole house!',
    plumb2: 'The pipes are weeping. Tap each leak to patch it. Big ones take two taps.',
    plumb3: 'Three gauges. Pressure climbs. Tap a valve to let some out. Keep every needle green.',
    mason2: 'Bricks swing on the crane. Tap DROP over the gap. Straight, or I notice.',
    paint2: 'Sunshine yellow, sunshine! Drag the roller over the wall. Tap the tray for paint. Mind the window!',
    garden2: 'Grow three sunflowers, sprout. Hold to water. Keep the drop in the green band.' });
  Object.assign(HOW, { tools2: 'Tap the nut that fits the bolt.', lumber2: 'Climb into the forklift in the yard. Forks level with the beam, drive in, drop.', elec2: 'Each switch flips its room and the rooms next door.',
    plumb2: 'Tap the leaks. Big ones take two taps.', plumb3: 'Tap a valve to let pressure out. Keep the needles green.', mason2: 'Tap DROP when the brick hangs over the gap.',
    paint2: 'Drag the roller over the wall. Tap the tray for paint.', garden2: 'Hold to water. Keep the drop in the green band.' });
  Object.assign(DONE, { tools2: 'Mm. Every bolt snug. You have an eye for sizes.', lumber2: 'Every pallet racked and loaded. You can drive my forklift any day, kid.',
    elec2: 'The whole house is glowing! Watt a pro. Sorry. Not sorry.', plumb2: 'Dry floor. Calm pipes. Calm Gus.', plumb3: 'Steady needles. Nothing burst. That is the whole job, really.',
    mason2: 'A straight wall. I will lean on it. That is a compliment.', paint2: 'Not one streak! That wall is sunnier than me. Almost.', garden2: 'Three sunflowers, all smiling at the sun. And at you.' });
  // ---------- sound ----------
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, os = ac.createOscillator(), gn = ac.createGain(); os.type = type; os.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); os.connect(gn).connect(ac.destination); os.start(t); os.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); }, zap = () => { tone(1800, 0.04, 0.1, 'sawtooth'); tone(300, 0.05, 0.2, 'sawtooth', 0.05); }, squeak = () => { tone(1400 + Math.random() * 300, 0.03, 0.09, 'triangle'); }, plip = () => tone(660 + Math.random() * 200, 0.04, 0.12);
  // ---------- panel ----------
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = short ? Math.max(8, Math.min(150, (W - 360) / 2)) : 8, w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none') fitPanel(); });
  const BTN = 'flex:1;min-width:0;min-height:56px;padding:6px 12px;text-align:left;background:#ec3013;color:#fff;border:2px solid #201e1d;border-radius:0;font:900 20px Archivo,sans-serif;line-height:1.1;cursor:pointer;touch-action:none';
  const BTN2 = BTN.replace('background:#ec3013;color:#fff', 'background:#f3f2f2;color:#201e1d');
  const head = (title, right) => '<div style="display:flex;align-items:center;gap:10px;background:#ec3013;color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2">' + title + '</span><span style="white-space:nowrap">' + (right || '') + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">' + (right === 'MERU HARDWARE' ? 'CLOSE' : 'STOP') + '</button></div>';
  let busy = null, J = null;
  const setTip = (msg, bad) => { const t = PANEL.querySelector('[data-tip]'); if (t) { t.textContent = msg; t.style.background = bad ? RED : INK; t.style.color = bad ? '#ffffff' : YEL; } };
  const missOne = msg => { if (!J) return; J.miss++; nope(); setTip(msg, true); };
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  function openPanel(title, tip, btns) { fitPanel(); const sp = J.sp;
    PANEL.innerHTML = head(title, sp && sp.away ? 'RUN BY ' + sp.t.name.toUpperCase() : '')
      + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:8px;box-sizing:border-box"><canvas data-cv style="flex:1 1 0;min-height:0;width:100%;display:block;touch-action:none;background:#2a2826"></canvas>'
      + (btns ? '<div style="display:flex;gap:8px;flex:none">' + btns.map((b, i) => '<button data-' + b[0] + ' style="' + (btns.length > 1 && i === 0 ? BTN2 : BTN) + '">' + b[1] + '</button>').join('') + '</div>' : '') + '</div>'
      + '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:14px;padding:9px 12px;line-height:1.25">' + tip + '</div>';
    PANEL.style.display = 'flex'; PANEL.querySelector('[data-stop]').onclick = () => quit(); J.cv = PANEL.querySelector('[data-cv]'); }
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  const ptOf = e => { const r = J.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  function bindCv(down, move, up) { const cv = J.cv; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; J.down = true; down && down(ptOf(e)); }; cv.onpointermove = e => { if (J.down) J.idle = 0; if (move) move(ptOf(e), J.down); }; cv.onpointerup = cv.onpointercancel = e => { const was = J.down; J.down = false; if (up && was) up(ptOf(e)); }; }
  function bindBtn(name, down) { const b = PANEL.querySelector('[data-' + name + ']'); if (!b) return; b.onpointerdown = e => { e.preventDefault(); J.idle = 0; down && down(); }; }
  function keys(map) { const kd = e => { const f = map[e.code]; if (!f) return; e.preventDefault(); e.stopPropagation(); if (!e.repeat || f.hold) { J.idle = 0; (f.down || f)(); } }, ku = e => { const f = map[e.code]; if (f && f.up) { e.preventDefault(); f.up(); } };
    addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; }
  const act = f => keys({ Space: f, Enter: f });
  const done1 = () => { if (!J || J.over) return; J.over = true; setTimeout(finishJob, 800); };
  const txt = (g, t, x, y, size, col = '#fff', wt = 900, al = 'left') => { g.fillStyle = col; g.font = wt + ' ' + Math.round(size) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = al; g.fillText(t, x, y); g.textAlign = 'left'; };
  const bar = (g, w, h, k, label) => { const bh = Math.max(14, h * 0.045); g.fillStyle = INK; g.fillRect(8, 8, w - 16, bh); g.fillStyle = k > 0.75 ? RED : YEL; g.fillRect(8, 8, (w - 16) * (1 - clamp(k, 0, 1)), bh); if (label) txt(g, label, 14, 8 + bh / 2, Math.min(12, bh * 0.75), INK); return 8 + bh; };
  const hand = (g, x, y, t) => { const r = 20 + 5 * Math.sin(t * 6); g.strokeStyle = YEL; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    g.save(); g.translate(x + 6, y + 8); g.rotate(-0.45); g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 2.5; g.fillRect(-6, 0, 12, 26); g.strokeRect(-6, 0, 12, 26); g.fillRect(-13, 20, 26, 22); g.strokeRect(-13, 20, 26, 22); g.restore(); };
  // ---------- run loop ----------
  let raf = 0; function loop(now) { if (!J) return; const dt = Math.min(0.05, (now - (J.last || now)) / 1000); J.last = now; J.t += dt; const D = GD[J.k];
    if (!J.over) { J.idle += dt; D.tick(dt); } const c = fitCv(J.cv); if (c) { D.draw(c.g, c.w, c.h); if (!J.over && J.idle > 3 && D.hint) { const p = D.hint(c.w, c.h); if (p) hand(c.g, p[0], p[1], J.t); } }
    raf = requestAnimationFrame(loop); }
  const GD = {};
  // ================= 1 FRONT COUNTER · KEY CUTTER: follow the dotted teeth with your finger while the blade passes (3 keys) =================
  GD.tools = { btns: null, tip: 'KEY 1 / 3 \u00b7 SLIDE UP + DOWN \u00b7 FOLLOW THE DOTTED TEETH',
    begin() { J.key = 0; J.dep = 0.1; J.kb = {}; this.setup(); bindCv(p => this.aim(p), (p, d) => { if (d) this.aim(p); });
      keys({ ArrowUp: { hold: true, down: () => { J.kb.up = true; }, up: () => { J.kb.up = false; } }, ArrowDown: { hold: true, down: () => { J.kb.dn = true; }, up: () => { J.kb.dn = false; } }, KeyW: { hold: true, down: () => { J.kb.up = true; }, up: () => { J.kb.up = false; } }, KeyS: { hold: true, down: () => { J.kb.dn = true; }, up: () => { J.kb.dn = false; } } }); },
    setup() { const D = [0.15, 0.4, 0.65, 0.88]; J.tg = []; for (let i = 0; i < 6; i++) { let d; do d = D[Math.random() * 4 | 0]; while (i && d === J.tg[i - 1]); J.tg.push(d); } J.bx = -0.22; J.cut = []; J.wait = 0.9; J.spd = [1 / 7, 1 / 6, 1 / 5][J.key]; J.res = null; J.rt = 0; },
    geom(w, h) { const x0 = w * 0.16, x1 = w * 0.92, zh = Math.min(h * 0.34, (x1 - x0) * 0.3), zt = h * 0.52 - zh * 0.7; return { x0, x1, zt, zh, bt: zt + zh, bh: zh * 0.55 }; },
    aim(p) { const G = this.geom(p.w, p.h); J.dep = clamp((p.y - G.zt) / G.zh, 0, 1); },
    tick(dt) { if (J.kb.up) J.dep = clamp(J.dep - dt * 1.4, 0, 1); if (J.kb.dn) J.dep = clamp(J.dep + dt * 1.4, 0, 1);
      if (J.res) { J.rt -= dt; if (J.rt <= 0) { J.key++; if (J.key >= 3) { setTip('THREE KEYS \u00b7 ALL CUT!'); done1(); } else { this.setup(); setTip('KEY ' + (J.key + 1) + ' / 3 \u00b7 FOLLOW THE DOTTED TEETH'); } } return; }
      if (J.wait > 0) { J.wait -= dt; return; } J.bx += dt * J.spd; if (J.bx >= 0) { const i = Math.min(59, Math.floor(J.bx * 60)); for (let q = J.cut.length; q <= i; q++) J.cut[q] = J.dep; if (Math.random() < 0.4) tone(2200 + Math.random() * 400, 0.008, 0.05, 'sawtooth'); }
      if (J.bx >= 1) this.grade(); },
    grade() { J.bad = []; for (let i = 0; i < 6; i++) { let s = 0, n = 0; for (let q = i * 10 + 3; q < i * 10 + 8; q++) { s += J.cut[q] ?? 0; n++; } if (Math.abs(s / n - J.tg[i]) > 0.16) J.bad.push(i); }
      if (J.bad.length) { J.miss += Math.min(2, J.bad.length); nope(); setTip(J.bad.length + (J.bad.length > 1 ? ' TEETH' : ' TOOTH') + ' OFF \u00b7 THE KEY STICKS', true); } else { ding(); setTip('PERFECT KEY \u00b7 IT TURNS!'); } J.res = J.bad.length ? 'bad' : 'ok'; J.rt = 1.4; },
    hint(w, h) { if (J.res || J.bx < -0.1) return null; const G = this.geom(w, h), i = clamp(Math.floor(Math.max(0, J.bx + 0.05) * 6), 0, 5); return [G.x0 + (i + 0.5) / 6 * (G.x1 - G.x0), G.zt + J.tg[i] * G.zh]; },
    draw(g, w, h) { g.fillStyle = '#3a3836'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4744'; g.fillRect(0, h * 0.78, w, h * 0.22); const G = this.geom(w, h), cw = (G.x1 - G.x0) / 60, BR = '#d4a838', BRD = '#a87e1e';
      // bow (round head) + body
      g.fillStyle = BR; g.beginPath(); g.arc(G.x0 - G.bh * 0.9, G.bt + G.bh / 2, G.bh * 1.25, 0, 7); g.fill(); g.fillStyle = '#3a3836'; g.beginPath(); g.arc(G.x0 - G.bh * 1.2, G.bt + G.bh / 2, G.bh * 0.42, 0, 7); g.fill();
      g.fillStyle = BR; g.fillRect(G.x0 - G.bh * 0.2, G.bt, G.x1 - G.x0 + G.bh * 0.2, G.bh); g.fillStyle = BRD; g.fillRect(G.x0, G.bt + G.bh * 0.45, G.x1 - G.x0, 3);
      // tooth zone: uncut blank, or cut down to the recorded depth
      for (let q = 0; q < 60; q++) { const d = J.cut[q] ?? 0, y = G.zt + d * G.zh; g.fillStyle = BR; g.fillRect(G.x0 + q * cw, y, cw + 0.6, G.bt - y + 1); }
      // target teeth (dotted)
      g.strokeStyle = YEL; g.lineWidth = 3; g.setLineDash([7, 6]); g.beginPath(); for (let i = 0; i < 6; i++) { const y = G.zt + J.tg[i] * G.zh, xa = G.x0 + i / 6 * (G.x1 - G.x0), xb = G.x0 + (i + 1) / 6 * (G.x1 - G.x0); if (i) g.lineTo(xa, y); else g.moveTo(xa, y); g.lineTo(xb, y); } g.stroke(); g.setLineDash([]);
      if (J.res && J.bad) J.bad.forEach(i => { const xa = G.x0 + (i + 0.5) / 6 * (G.x1 - G.x0); txt(g, '\u2715', xa, G.zt - 16, 22, RED, 900, 'center'); });
      // the blade + your depth line
      const bx = G.x0 + clamp(J.bx, -0.3, 1) * (G.x1 - G.x0), by = G.zt + J.dep * G.zh, r = Math.max(14, G.zh * 0.32);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(8, by); g.lineTo(w - 8, by); g.stroke();
      g.save(); g.translate(bx, by - r); g.rotate(J.t * 14); g.fillStyle = STEEL; g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, q = i % 2 ? r : r * 0.86; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = RED; g.beginPath(); g.arc(0, 0, r * 0.25, 0, 7); g.fill(); g.restore();
      txt(g, 'KEY ' + (J.key + 1) + ' / 3', 12, 20, 18, '#ffffff'); if (J.wait > 0 && !J.res) txt(g, 'READY\u2026', w / 2, h * 0.12, 22, YEL, 900, 'center');
      if (J.res === 'ok') txt(g, '\u2713 IT TURNS', w / 2, h * 0.88, 22, '#7cff9b', 900, 'center'); } };
  // ================= 2 LUMBER · STACK THE RACK: drop each sliding board over the pile; overhang falls off (10 boards) =================
  const grain = (g, x, y, w, h, base) => { g.fillStyle = base; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(90,60,30,.35)'; g.lineWidth = 1; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x, y + h * k / 3); g.lineTo(x + w, y + h * k / 3 + Math.sin(x + k) * 1.5); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, y, w, h); };
  const WOODS = ['#c9a27a', '#b88a5c', '#d6b48a'];
  GD.lumber = { btns: [['go', 'DROP']], tip: 'BOARD 1 / 10 \u00b7 TAP DROP OVER THE PILE',
    begin() { J.st = [{ c: 0.5, w: 0.56 }]; J.n = 0; J.N = 10; J.fall = []; this.next(); const a = () => this.drop(); bindBtn('go', a); bindCv(a); act(a); },
    next() { const top = J.st[J.st.length - 1]; J.cur = { w: top.w, x: J.n % 2 ? 1.05 - top.w / 2 : top.w / 2 - 0.05, dir: J.n % 2 ? -1 : 1 }; J.spd = 0.42 + J.n * 0.045; J.cool = 0.25; },
    drop() { if (J.over || J.cool > 0) return; const top = J.st[J.st.length - 1], c = J.cur, off = c.x - top.c, ov = top.w - Math.abs(off);
      if (ov <= 0.03) { J.fall.push({ c: c.x, w: c.w, y: 0, v: 0, r: 0 }); missOne('MISSED THE PILE \u00b7 TRY AGAIN'); J.cool = 0.4; this.next(); return; }
      if (Math.abs(off) < 0.02) { J.st.push({ c: top.c, w: top.w }); ding(); setTip('PERFECT! BOARD ' + Math.min(J.N, J.n + 2) + ' / 10'); }
      else { const nc = top.c + off / 2; J.st.push({ c: nc, w: ov }); J.fall.push({ c: off > 0 ? top.c + top.w / 2 + Math.abs(off) / 2 : top.c - top.w / 2 - Math.abs(off) / 2, w: Math.abs(off), y: 0, v: 0, r: 0, dir: Math.sign(off) }); thunk(); setTip('BOARD ' + Math.min(J.N, J.n + 2) + ' / 10 \u00b7 TAP DROP OVER THE PILE'); }
      J.n++; if (J.n >= J.N) { const r = J.st[J.st.length - 1].w / J.st[0].w; J.stars = r >= 0.7 ? 3 : r >= 0.4 ? 2 : 1; if (J.miss >= 2) J.stars = Math.min(J.stars, 2); setTip('TEN BOARDS \u00b7 ' + Math.round(r * 100) + '% WIDE'); done1(); } else this.next(); },
    tick(dt) { J.cool = Math.max(0, J.cool - dt); const c = J.cur; c.x += c.dir * J.spd * dt; const lo = c.w / 2 - 0.08, hi = 1.08 - c.w / 2; if (c.x > hi) { c.x = hi; c.dir = -1; } if (c.x < lo) { c.x = lo; c.dir = 1; }
      for (let i = J.fall.length - 1; i >= 0; i--) { const f = J.fall[i]; f.v += dt * 2.6; f.y += f.v * dt; f.r += (f.dir || 1) * dt * 3; if (f.y > 2) J.fall.splice(i, 1); } },
    lay(w, h) { const bh = Math.min(h * 0.075, 26), base = h * 0.9, top = base - J.st.length * bh, scroll = Math.max(0, h * 0.42 - top); return { bh, base: base + scroll, X: x => w * 0.08 + x * w * 0.84, S: s => s * w * 0.84 }; },
    hint(w, h) { const L = this.lay(w, h), top = J.st[J.st.length - 1]; return Math.abs(J.cur.x - top.c) < 0.06 ? [L.X(J.cur.x), L.base - (J.st.length + 1) * L.bh - L.bh * 0.6] : null; },
    draw(g, w, h) { g.fillStyle = '#5a5654'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4744'; for (let i = 0; i < 6; i++) g.fillRect(i * w / 6, 0, 3, h); const L = this.lay(w, h);
      g.fillStyle = '#3d3b3a'; g.fillRect(0, L.base, w, h); J.st.forEach((s, i) => grain(g, L.X(s.c - s.w / 2), L.base - (i + 1) * L.bh, L.S(s.w), L.bh, i ? WOODS[i % 3] : '#7a5236'));
      const top = J.st[J.st.length - 1], cy = L.base - (J.st.length + 1) * L.bh - L.bh * 0.6; if (!J.over) { grain(g, L.X(J.cur.x - J.cur.w / 2), cy, L.S(J.cur.w), L.bh, WOODS[J.st.length % 3]); g.strokeStyle = 'rgba(255,210,58,.5)'; g.setLineDash([5, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(L.X(top.c - top.w / 2), cy); g.lineTo(L.X(top.c - top.w / 2), L.base - J.st.length * L.bh); g.moveTo(L.X(top.c + top.w / 2), cy); g.lineTo(L.X(top.c + top.w / 2), L.base - J.st.length * L.bh); g.stroke(); g.setLineDash([]); }
      J.fall.forEach(f => { g.save(); g.translate(L.X(f.c), cy + L.bh * 2 + f.y * h); g.rotate(f.r); grain(g, -L.S(f.w) / 2, -L.bh / 2, L.S(f.w), L.bh, '#b88a5c'); g.restore(); });
      txt(g, 'BOARD ' + Math.min(J.N, J.n + 1) + ' / 10', 12, 20, 18); txt(g, Math.round(top.w / J.st[0].w * 100) + '% WIDE', w - 12, 20, 18, YEL, 900, 'right'); } };
  // ================= 3 ELECTRICAL · BULB TEST: tap the flickering bulbs, leave the steady ones (3 boards) =================
  GD.elec = { btns: null, tip: 'BOARD 1 / 3 \u00b7 TAP THE FLICKERING BULBS',
    begin() { J.wv = 0; this.wave(); bindCv(p => this.tap(p)); },
    wave() { const bad = [3, 4, 5][J.wv], idx = shuffle([...Array(12).keys()]).slice(0, bad); J.b = [...Array(12)].map((_, i) => ({ bad: idx.includes(i), off: 0, nx: rnd(0.1, 0.8), pop: 0, zap: 0 })); J.T = [14, 14, 13][J.wv]; J.left = J.T; J.gap = [[0.25, 0.9], [0.5, 1.5], [0.9, 2.2]][J.wv]; J.pause = 0; },
    lay(w, h) { const cols = w > h * 1.5 ? 6 : w > h ? 4 : 3, rows = Math.ceil(12 / cols), top = h * 0.1, cs = Math.min(w / cols, (h - top - 6) / rows); return { cols, rows, cs, ox: (w - cs * cols) / 2, oy: top + (h - top - cs * rows) / 2 }; },
    pos(i, L) { return [L.ox + (i % L.cols + 0.5) * L.cs, L.oy + (Math.floor(i / L.cols) + 0.5) * L.cs]; },
    tap(p) { if (J.over || J.pause > 0) return; const L = this.lay(p.w, p.h); const i = J.b.findIndex((b, k) => { const [x, y] = this.pos(k, L); return Math.hypot(p.x - x, p.y - y) < L.cs * 0.48; }); if (i < 0) return; const b = J.b[i];
      if (b.bad) { b.bad = false; b.pop = 0.5; ding(); if (!J.b.some(q => q.bad)) this.cleared(); } else { b.zap = 0.45; zap(); missOne('ZAP! THAT ONE WAS FINE'); } },
    cleared(late) { J.pause = 0.9; if (!late) setTip('BOARD ' + (J.wv + 1) + ' ALL STEADY!'); },
    tick(dt) { if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) { J.wv++; if (J.wv >= 3) { setTip('ALL THREE BOARDS STEADY!'); done1(); return; } this.wave(); setTip('BOARD ' + (J.wv + 1) + ' / 3 \u00b7 THE FLICKERS GET SNEAKIER'); } return; }
      J.b.forEach(b => { b.pop = Math.max(0, b.pop - dt); b.zap = Math.max(0, b.zap - dt); if (!b.bad) return; b.off -= dt; b.nx -= dt; if (b.nx <= 0) { b.off = rnd(0.07, 0.2); b.nx = rnd(J.gap[0], J.gap[1]); if (Math.random() < 0.5) tone(3000, 0.006, 0.05, 'square'); } });
      J.left -= dt; if (J.left <= 0) { const n = J.b.filter(b => b.bad).length; J.miss += Math.min(2, n); nope(); setTip('TIME! ' + n + ' FLICKER' + (n > 1 ? 'S' : '') + ' LEFT ON', true); J.b.forEach(b => { b.bad = false; }); this.cleared(true); } },
    hint(w, h) { const L = this.lay(w, h), i = J.b.findIndex(b => b.bad); return i < 0 ? null : this.pos(i, L); },
    draw(g, w, h) { g.fillStyle = '#23262b'; g.fillRect(0, 0, w, h); bar(g, w, h, 1 - J.left / J.T, 'BOARD ' + Math.min(3, J.wv + 1) + ' / 3'); const L = this.lay(w, h);
      J.b.forEach((b, i) => { const [x, y] = this.pos(i, L), r = L.cs * 0.26, dim = b.bad && b.off > 0; g.fillStyle = '#5a5654'; g.fillRect(x - r * 0.5, y + r * 0.7, r, r * 0.55); g.fillStyle = '#8a9096'; for (let k = 0; k < 3; k++) g.fillRect(x - r * 0.5, y + r * 0.78 + k * r * 0.17, r, 2);
        if (!dim) { const gl = g.createRadialGradient(x, y, r * 0.3, x, y, r * 2); gl.addColorStop(0, 'rgba(255,230,140,.55)'); gl.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gl; g.fillRect(x - r * 2, y - r * 2, r * 4, r * 4); }
        g.fillStyle = b.zap > 0 ? '#ff6a4a' : dim ? '#4a4638' : b.pop > 0 ? '#ffffff' : '#fff2a8'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        g.strokeStyle = dim ? '#6a6048' : '#e0a800'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - r * 0.3, y + r * 0.5); g.lineTo(x - r * 0.15, y - r * 0.1); g.lineTo(x + r * 0.15, y + r * 0.1); g.lineTo(x + r * 0.3, y - r * 0.4); g.stroke();
        if (b.pop > 0) { g.strokeStyle = YEL; g.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, q = r * (1.3 + (0.5 - b.pop) * 2); g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15); g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); g.stroke(); } } }); } };
  // ================= 4 PLUMBING · DUCK RACE: pump your yellow duck down the drain test channel; plunge the gunk (3 heats) =================
  const duck = (g, x, y, s, col, t) => { const bob = Math.sin(t * 6 + x) * s * 0.06; g.fillStyle = col; g.beginPath(); g.ellipse(x, y + bob, s * 0.62, s * 0.38, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.beginPath(); g.arc(x + s * 0.36, y - s * 0.36 + bob, s * 0.26, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#e8742a'; g.beginPath(); g.moveTo(x + s * 0.58, y - s * 0.38 + bob); g.lineTo(x + s * 0.86, y - s * 0.3 + bob); g.lineTo(x + s * 0.58, y - s * 0.24 + bob); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(x + s * 0.42, y - s * 0.42 + bob, s * 0.05, 0, 7); g.fill(); };
  GD.plumb = { btns: [['go', 'PUMP']], tip: 'HEAT 1 / 3 \u00b7 TAP PUMP \u00b7 TAP THE GUNK TO PLUNGE IT',
    begin() { J.heat = 0; J.wins = 0; this.heat(); bindBtn('go', () => this.pump()); bindCv(p => this.tapCv(p)); act(() => this.pump()); },
    heat() { const base = [0.082, 0.092, 0.102][J.heat]; J.d = [{ x: 0, me: false, name: 'GUS', col: '#2e86b8', base: base * rnd(0.96, 1.06), ph: rnd(0, 6) }, { x: 0, v: 0, me: true, name: 'YOU', col: YEL }, { x: 0, me: false, name: 'TILLY', col: '#c2456a', base: base * rnd(0.96, 1.06), ph: rnd(0, 6) }]; J.go = -2.2; J.clog = null; J.cd = 1.4; J.res = null; J.rt = 0; },
    pump() { if (J.over || J.go < 0 || J.res) return; const me = J.d[1]; if (J.clog && J.clog.x - me.x < 0.045) { this.plunge(); return; } me.v = Math.min(0.22, me.v + 0.032); squeak(); },
    plunge(early) { J.clog.hp = early ? 0 : J.clog.hp - 1; thunk(); if (J.clog.hp <= 0) { J.clog = null; blip(); } },
    lay(w, h) { const top = h * 0.12, lh = (h - top - 8) / 3; return { lh, X: x => w * 0.12 + x * w * 0.76, Y: i => top + (i + 0.5) * lh }; },
    tapCv(p) { if (J.over || J.go < 0 || J.res) return; if (J.clog) { const L = this.lay(p.w, p.h); if (Math.hypot(p.x - L.X(J.clog.x), p.y - L.Y(1)) < Math.max(36, L.lh * 0.55)) { this.plunge(J.clog.x - J.d[1].x > 0.05); return; } } this.pump(); },
    tick(dt) { if (J.res) { J.rt -= dt; if (J.rt <= 0) { J.heat++; if (J.heat >= 3) { J.stars = J.wins >= 3 ? 3 : J.wins === 2 ? 2 : 1; setTip(J.wins + ' / 3 HEATS WON'); done1(); } else { this.heat(); setTip('HEAT ' + (J.heat + 1) + ' / 3 \u00b7 THE RIVALS GET FASTER'); } } return; }
      if (J.go < 0) { const a = Math.ceil(-J.go); J.go += dt; if (Math.ceil(-J.go) !== a) tone(a === 1 ? 1320 : 660, 0.05, 0.2); return; }
      let win = null; J.d.forEach(d => { if (d.me) { d.v *= Math.pow(0.35, dt); let nx = d.x + d.v * dt; if (J.clog && nx > J.clog.x - 0.04) { nx = Math.max(d.x, J.clog.x - 0.04); d.v = 0; } d.x = nx; } else d.x += d.base * (1 + 0.3 * Math.sin(J.t * 1.6 + d.ph)) * dt; if (d.x >= 1 && !win) win = d; });
      if (!J.clog) { J.cd -= dt; if (J.cd <= 0) { const cx = J.d[1].x + rnd(0.12, 0.22); if (cx < 0.93) J.clog = { x: cx, hp: 3 }; J.cd = rnd(2.0, 3.0); } }
      if (win) { J.res = win.me ? 'win' : 'lose'; J.rt = 1.6; if (win.me) { J.wins++; ding(); setTip('YOUR DUCK WINS HEAT ' + (J.heat + 1) + '!'); } else missOne(win.name + '\u2019S DUCK WON THAT HEAT'); } },
    hint(w, h) { const L = this.lay(w, h); if (J.go < 0 || J.res) return null; return J.clog ? [L.X(J.clog.x), L.Y(1)] : [L.X(J.d[1].x), L.Y(1)]; },
    draw(g, w, h) { g.fillStyle = '#e7e4dc'; g.fillRect(0, 0, w, h); const L = this.lay(w, h), s = Math.min(L.lh * 0.55, 46);
      J.d.forEach((d, i) => { const y = L.Y(i); g.fillStyle = '#c9ced3'; g.fillRect(L.X(-0.04), y - L.lh * 0.36, L.X(1.04) - L.X(-0.04), L.lh * 0.72); g.fillStyle = d.me ? '#7cc3ea' : '#a8d4ee'; g.fillRect(L.X(-0.03), y - L.lh * 0.28, L.X(1.03) - L.X(-0.03), L.lh * 0.56);
        g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const rx = L.X(((k / 6 + J.t * 0.08) % 1)); g.beginPath(); g.moveTo(rx, y - L.lh * 0.1); g.quadraticCurveTo(rx + 8, y - L.lh * 0.16, rx + 16, y - L.lh * 0.1); g.stroke(); }
        g.fillStyle = INK; g.beginPath(); g.arc(L.X(1.05), y, L.lh * 0.2, 0, 7); g.fill(); txt(g, d.name, 8, y, Math.min(14, L.lh * 0.25), d.me ? RED : INK); duck(g, L.X(Math.min(1, d.x)), y, s, d.col, J.t + i); });
      if (J.clog) { const x = L.X(J.clog.x), y = L.Y(1); g.fillStyle = '#6b4a2a'; g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, q = s * (0.42 + 0.12 * Math.sin(k * 2.3 + J.t * 3)); g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); for (let k = 0; k < J.clog.hp; k++) { g.fillStyle = YEL; g.fillRect(x - 12 + k * 9, y - s * 0.75, 6, 6); } }
      txt(g, 'HEAT ' + Math.min(3, J.heat + 1) + ' / 3', 8, h * 0.06, 16, INK); txt(g, 'WINS ' + J.wins, w - 8, h * 0.06, 16, RED, 900, 'right');
      if (J.go < 0) txt(g, String(Math.ceil(-J.go)), w / 2, h * 0.5, Math.min(80, h * 0.3), RED, 900, 'center'); else if (J.go < 0.6) txt(g, 'GO!', w / 2, h * 0.5, Math.min(80, h * 0.3), RED, 900, 'center'); } };
  // ================= 5 MASONRY · TILE PATTERN: copy the pattern card onto the floor before the cement sets (3 floors) =================
  const TILEC = ['#f3f2f2', '#2e4a6b', '#c94f2e'], TILEN = ['WHITE', 'NAVY', 'TERRACOTTA'];
  GD.mason = { btns: null, tip: 'FLOOR 1 / 3 \u00b7 PICK A COLOUR \u00b7 TAP A SQUARE',
    begin() { J.r = 0; this.setup(); bindCv(p => this.tap(p)); keys({ Digit1: () => { J.sel = 0; }, Digit2: () => { J.sel = 1; }, Digit3: () => { if (J.nc > 2) J.sel = 2; } }); },
    setup() { const n = [3, 4, 4][J.r], nc = [2, 3, 3][J.r]; J.n = n; J.nc = nc; let ok = false;
      while (!ok) { J.pat = []; const seed = {}; for (let y = 0; y < n; y++) { J.pat[y] = []; for (let x = 0; x < n; x++) { const k = J.r < 2 ? Math.min(x, n - 1 - x) + ',' + Math.min(y, n - 1 - y) : x + ',' + y; if (!(k in seed)) seed[k] = Math.random() * nc | 0; J.pat[y][x] = seed[k]; } } ok = new Set(J.pat.flat()).size >= Math.min(nc, J.r ? 3 : 2); }
      J.fl = J.pat.map(r => r.map(() => null)); J.sel = 0; J.set = 0; J.T = [30, 42, 48][J.r]; J.flash = null; J.pause = 0; },
    lay(w, h) { if (w >= h * 1.15) { const cs = Math.min(h * 0.5, w * 0.24), gs = Math.min(h * 0.86, w * 0.5), gx = 8 + cs + 14, ch = Math.min(56, gs / 3.4); return { cx: 8, cy: (h - cs) / 2, cs, gx, gy: (h - gs) / 2 + 6, gs, pal: i => [gx + gs + 14, (h - gs) / 2 + 6 + i * (ch + 10), ch] }; }
      const cs = Math.min(w * 0.36, h * 0.24), top = 30, ch = Math.min(56, cs * 0.44), gs = Math.min(w * 0.94, h - top - cs - 22); return { cx: 8, cy: top, cs, gx: (w - gs) / 2, gy: top + cs + 14, gs, pal: i => [8 + cs + 16 + i * (ch + 10), top + (cs - ch) / 2, ch] }; },
    tap(p) { if (J.over || J.pause > 0) return; const L = this.lay(p.w, p.h);
      for (let i = 0; i < J.nc; i++) { const [x, y, s] = L.pal(i); if (p.x > x - 6 && p.x < x + s + 6 && p.y > y - 6 && p.y < y + s + 6) { J.sel = i; blip(); return; } }
      const c = L.gs / J.n, gx = Math.floor((p.x - L.gx) / c), gy = Math.floor((p.y - L.gy) / c); if (gx < 0 || gy < 0 || gx >= J.n || gy >= J.n || J.fl[gy][gx] != null) return;
      if (J.pat[gy][gx] === J.sel) { J.fl[gy][gx] = J.sel; thunk(); if (J.fl.every((r, y) => r.every((v, x) => v === J.pat[y][x]))) { ding(); setTip('FLOOR ' + (J.r + 1) + ' MATCHES THE CARD!'); J.pause = 1.0; } }
      else { J.flash = { x: gx, y: gy, t: 0.5 }; missOne('WRONG COLOUR \u00b7 THAT ONE IS ' + TILEN[J.pat[gy][gx]]); } },
    tick(dt) { if (J.flash && (J.flash.t -= dt) <= 0) J.flash = null; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) { J.r++; if (J.r >= 3) { setTip('THREE FLOORS LAID!'); done1(); } else { this.setup(); setTip('FLOOR ' + (J.r + 1) + ' / 3 \u00b7 PICK A COLOUR \u00b7 TAP A SQUARE'); } } return; }
      J.set += dt / J.T; if (J.set >= 1) { missOne('THE CEMENT SET \u00b7 NEXT FLOOR'); J.set = 1; J.pause = 1.2; } },
    hint(w, h) { const L = this.lay(w, h), c = L.gs / J.n; for (let y = 0; y < J.n; y++) for (let x = 0; x < J.n; x++) if (J.fl[y][x] == null && J.pat[y][x] === J.sel) return [L.gx + (x + 0.5) * c, L.gy + (y + 0.5) * c];
      for (let y = 0; y < J.n; y++) for (let x = 0; x < J.n; x++) if (J.fl[y][x] == null) { const [px, py, s] = L.pal(J.pat[y][x]); return [px + s / 2, py + s / 2]; } return null; },
    draw(g, w, h) { g.fillStyle = '#6f6b66'; g.fillRect(0, 0, w, h); const L = this.lay(w, h);
      const bh = Math.max(12, h * 0.035); g.fillStyle = INK; g.fillRect(8, 6, w - 16, bh); g.fillStyle = J.set > 0.75 ? RED : YEL; g.fillRect(8, 6, (w - 16) * (1 - J.set), bh); txt(g, 'CEMENT SETTING \u00b7 FLOOR ' + Math.min(3, J.r + 1) + ' / 3', 14, 6 + bh / 2, Math.min(11, bh * 0.8), INK);
      // the card
      g.fillStyle = PAPER; g.fillRect(L.cx, L.cy, L.cs, L.cs); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(L.cx, L.cy, L.cs, L.cs); const pad = L.cs * 0.1, cc = (L.cs - pad * 2) / J.n;
      for (let y = 0; y < J.n; y++) for (let x = 0; x < J.n; x++) { g.fillStyle = TILEC[J.pat[y][x]]; g.fillRect(L.cx + pad + x * cc, L.cy + pad + y * cc, cc - 1, cc - 1); } g.strokeRect(L.cx + pad, L.cy + pad, cc * J.n, cc * J.n); txt(g, 'CARD', L.cx + 4, L.cy + pad * 0.5, Math.min(11, pad * 0.9), INK);
      // the floor (wet cement + laid tiles)
      const c = L.gs / J.n; g.fillStyle = '#9a958e'; g.fillRect(L.gx, L.gy, L.gs, L.gs);
      for (let y = 0; y < J.n; y++) for (let x = 0; x < J.n; x++) { const v = J.fl[y][x], X = L.gx + x * c, Y = L.gy + y * c; if (v != null) { g.fillStyle = TILEC[v]; g.fillRect(X + 3, Y + 3, c - 6, c - 6); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(X + 3, Y + 3, c - 6, c - 6); } else { g.strokeStyle = 'rgba(32,30,29,.35)'; g.lineWidth = 1; g.strokeRect(X + 3, Y + 3, c - 6, c - 6); } }
      if (J.flash) { g.strokeStyle = RED; g.lineWidth = 4; g.strokeRect(L.gx + J.flash.x * c + 2, L.gy + J.flash.y * c + 2, c - 4, c - 4); } g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(L.gx, L.gy, L.gs, L.gs);
      for (let i = 0; i < J.nc; i++) { const [x, y, s] = L.pal(i); g.fillStyle = TILEC[i]; g.fillRect(x, y, s, s); g.strokeStyle = i === J.sel ? YEL : INK; g.lineWidth = i === J.sel ? 5 : 2; g.strokeRect(x, y, s, s); } } };
  // ================= 6 PAINT · COLOUR MATCH: add red / yellow / blue / white drops to match the swatch, then MIX IT (4 orders) =================
  const RYB = [[1, 1, 1], [1, 0, 0], [1, 1, 0], [1, 0.5, 0], [0.163, 0.373, 0.6], [0.5, 0, 0.5], [0, 0.66, 0.2], [0.2, 0.094, 0]];   // corners: 0, r, y, ry, b, rb, yb, ryb
  const ryb2rgb = (r, y, b) => [0, 1, 2].map(k => { const c = i => RYB[i][k]; const x0 = c(0) * (1 - r) + c(1) * r, x1 = c(2) * (1 - r) + c(3) * r, x2 = c(4) * (1 - r) + c(5) * r, x3 = c(6) * (1 - r) + c(7) * r; const y0 = x0 * (1 - y) + x1 * y, y1 = x2 * (1 - y) + x3 * y; return y0 * (1 - b) + y1 * b; });
  const mixCol = c => { const [r, y, b, wt] = c, m = Math.max(r, y, b), tot = r + y + b + wt; if (!tot) return null; let rgb = m ? ryb2rgb(r / m, y / m, b / m) : [1, 1, 1]; const k = wt / tot; rgb = rgb.map(v => v * (1 - k) + k); return 'rgb(' + rgb.map(v => Math.round(v * 255)).join(',') + ')'; };
  const TINS = [['RED', '#ec3013'], ['YELLOW', '#ffd23a'], ['BLUE', '#2e5fb8'], ['WHITE', '#ffffff']];
  const ORDERS = [[['ORANGE', [1, 1, 0, 0]], ['LEAF GREEN', [0, 1, 1, 0]], ['PURPLE', [1, 0, 1, 0]]], [['PINK', [1, 0, 0, 2]], ['SKY BLUE', [0, 0, 1, 2]], ['LEMON', [0, 1, 0, 1]]],
    [['SUNSET', [2, 1, 0, 0]], ['LIME', [0, 2, 1, 0]], ['TEAL', [0, 1, 2, 0]], ['PLUM', [2, 0, 1, 0]]], [['PEACH', [1, 1, 0, 2]], ['LILAC', [1, 0, 1, 2]], ['MINT', [0, 1, 1, 2]]]];
  const prop = c => { const s = c.reduce((a, b) => a + b, 0) || 1; return c.map(v => v / s); };
  GD.paint = { btns: [['empty', 'EMPTY'], ['go', 'MIX IT']], tip: 'ORDER 1 / 4 \u00b7 TAP THE TINS TO ADD DROPS',
    begin() { J.o = 0; J.ord = ORDERS.map(t => t[Math.random() * t.length | 0]); this.setup(); bindCv(p => this.tap(p)); bindBtn('empty', () => this.empty()); bindBtn('go', () => this.mix()); keys({ Space: () => this.mix(), Enter: () => this.mix(), Digit1: () => this.add(0), Digit2: () => this.add(1), Digit3: () => this.add(2), Digit4: () => this.add(3), Backspace: () => this.empty() }); },
    setup() { J.c = [0, 0, 0, 0]; J.drops = []; J.pause = 0; },
    lay(w, h) { const ty = h * 0.6, th = h * 0.38; return { ty, th, tw: w / 4, sw: Math.min(w * 0.42, h * 0.46) }; },
    add(i) { if (J.over || J.pause > 0) return; if (J.c.reduce((a, b) => a + b, 0) >= 8) { nope(); setTip('BUCKET FULL \u00b7 TAP EMPTY', true); return; } J.c[i]++; J.drops.push({ i, t: 0 }); plip(); },
    tap(p) { const L = this.lay(p.w, p.h); if (p.y > L.ty - 10) this.add(clamp(Math.floor(p.x / L.tw), 0, 3)); },
    empty() { if (J.over || J.pause > 0) return; J.c = [0, 0, 0, 0]; tone(300, 0.04, 0.2, 'triangle'); setTip('BUCKET EMPTY \u00b7 ORDER ' + (J.o + 1) + ' / 4'); },
    mix() { if (J.over || J.pause > 0) return; if (!J.c.some(v => v)) { nope(); return; } const a = prop(J.c), b = prop(J.ord[J.o][1]);
      if (a.every((v, i) => Math.abs(v - b[i]) < 0.01)) { ding(); setTip(J.ord[J.o][0] + ' \u00b7 PERFECT MATCH!'); J.pause = 1.1; return; }
      let wi = 0, wd = 0; a.forEach((v, i) => { const d = b[i] - v; if (Math.abs(d) > Math.abs(wd)) { wd = d; wi = i; } }); missOne('NOT QUITE \u00b7 ' + (wd > 0 ? 'NEEDS MORE ' : 'TOO MUCH ') + TINS[wi][0]); },
    tick(dt) { J.drops.forEach(d => { d.t += dt * 2.6; }); J.drops = J.drops.filter(d => d.t < 1); if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) { J.o++; if (J.o >= 4) { setTip('FOUR ORDERS MIXED!'); done1(); } else { this.setup(); setTip('ORDER ' + (J.o + 1) + ' / 4 \u00b7 ' + J.ord[J.o][0]); } } } },
    hint(w, h) { const L = this.lay(w, h), a = prop(J.c), b = prop(J.ord[Math.min(3, J.o)][1]); let wi = 0, wd = -1; b.forEach((v, i) => { const d = v - (J.c.some(x => x) ? a[i] : 0); if (d > wd) { wd = d; wi = i; } }); return wd > 0.01 ? [(wi + 0.5) * L.tw, L.ty + L.th * 0.5] : null; },
    draw(g, w, h) { g.fillStyle = '#efe4ea'; g.fillRect(0, 0, w, h); const L = this.lay(w, h), O = J.ord[Math.min(3, J.o)], sw = L.sw, sy = Math.max(26, (L.ty - sw) / 2);
      // the order swatch (left) + your bucket (right)
      const sx = w * 0.25 - sw / 2; g.fillStyle = mixCol(O[1]); g.fillRect(sx, sy, sw, sw * 0.8); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(sx, sy, sw, sw * 0.8); txt(g, 'ORDER ' + (J.o + 1) + ' \u00b7 ' + O[0], sx, sy - 12, Math.min(14, w * 0.035), INK);
      const bx = w * 0.75 - sw * 0.42, bw = sw * 0.84, by = sy + sw * 0.08, bh = sw * 0.72, col = mixCol(J.c); g.fillStyle = '#c9ced3'; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + bw, by); g.lineTo(bx + bw * 0.9, by + bh); g.lineTo(bx + bw * 0.1, by + bh); g.closePath(); g.fill(); g.stroke();
      if (col) { g.fillStyle = col; g.beginPath(); g.ellipse(bx + bw / 2, by + bh * 0.18, bw * 0.46, bh * 0.12, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); } txt(g, 'YOUR MIX \u00b7 ' + J.c.reduce((a, b) => a + b, 0) + ' / 8', bx, sy - 12, Math.min(14, w * 0.035), INK);
      J.drops.forEach(d => { const x0 = (d.i + 0.5) * L.tw, y0 = L.ty, x1 = bx + bw / 2, y1 = by + bh * 0.18, k = d.t; g.fillStyle = TINS[d.i][1]; g.beginPath(); g.arc(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 40, 7, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); });
      TINS.forEach(([n, c], i) => { const x = i * L.tw + 6, tw = L.tw - 12; g.fillStyle = '#c9ced3'; g.fillRect(x, L.ty, tw, L.th); g.fillStyle = c; g.fillRect(x, L.ty, tw, L.th * 0.3); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, L.ty, tw, L.th); txt(g, n, x + 6, L.ty + L.th * 0.55, Math.min(14, tw * 0.17), INK); txt(g, '\u00d7' + J.c[i], x + 6, L.ty + L.th * 0.8, Math.min(18, tw * 0.2), RED); }); } };
  // ================= 7 GARDEN · WATER ROUND: water the thirsty (droopy) pots, never the wet ones (50 s) =================
  GD.garden = { btns: null, tip: 'TAP THE DROOPY POTS \u00b7 NOT THE DARK WET ONES',
    begin() { J.p = [...Array(8)].map(() => ({ m: rnd(0.45, 1), r: rnd(0.035, 0.06), wob: 0, sad: 0, joy: 0 })); J.T = 50; J.left = 50; J.score = 0; bindCv(p => this.tap(p)); },
    lay(w, h) { const cols = w > h * 1.6 ? 8 : 4, rows = 8 / cols, top = h * 0.1, cs = Math.min(w / cols, (h - top - 6) / rows); return { cols, cs, ox: (w - cs * cols) / 2, oy: top + (h - top - cs * rows) / 2 }; },
    pos(i, L) { return [L.ox + (i % L.cols + 0.5) * L.cs, L.oy + (Math.floor(i / L.cols) + 0.5) * L.cs]; },
    tap(p) { if (J.over) return; const L = this.lay(p.w, p.h), i = J.p.findIndex((q, k) => { const [x, y] = this.pos(k, L); return Math.abs(p.x - x) < L.cs * 0.48 && Math.abs(p.y - y) < L.cs * 0.48; }); if (i < 0) return; const q = J.p[i];
      if (q.m > 0.78) { q.wob = 0.6; missOne('GLUG! THAT ONE WAS ALREADY WET'); } else if (q.m < 0.32) { q.m = 1; q.joy = 0.6; J.score++; plip(); ding(); setTip('HAPPY POTS ' + J.score); } else { q.m = Math.min(1, q.m + 0.3); plip(); setTip('NOT THIRSTY YET \u00b7 LOOK FOR DROOPY ONES'); } },
    tick(dt) { J.left -= dt; const k = 1 + (1 - J.left / J.T) * 0.8; J.p.forEach(q => { q.m -= q.r * k * dt; q.wob = Math.max(0, q.wob - dt); q.joy = Math.max(0, q.joy - dt); q.sad = Math.max(0, q.sad - dt); if (q.m <= 0) { q.m = 0.55; q.sad = 1.2; missOne('A POT WILTED \u00b7 FERN REPOTS IT'); } });
      if (J.left <= 0) { J.left = 0; setTip('ROUND OVER \u00b7 ' + J.score + ' HAPPY POTS'); done1(); } },
    hint(w, h) { const L = this.lay(w, h), i = J.p.findIndex(q => q.m < 0.32); return i < 0 ? null : this.pos(i, L); },
    draw(g, w, h) { g.fillStyle = '#dfe7e0'; g.fillRect(0, 0, w, h); bar(g, w, h, 1 - J.left / J.T, Math.ceil(J.left) + ' S \u00b7 HAPPY POTS ' + J.score); const L = this.lay(w, h);
      J.p.forEach((q, i) => { const [x, y] = this.pos(i, L), s = L.cs * 0.42, wet = q.m > 0.78, dry = q.m < 0.32, wb = q.wob > 0 ? Math.sin(q.wob * 30) * 4 : 0, py = y + s * 0.25;
        g.fillStyle = '#b0623f'; g.beginPath(); g.moveTo(x - s * 0.55 + wb, py); g.lineTo(x + s * 0.55 + wb, py); g.lineTo(x + s * 0.4 + wb, py + s * 0.7); g.lineTo(x - s * 0.4 + wb, py + s * 0.7); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = '#8f4e31'; g.fillRect(x - s * 0.6 + wb, py - s * 0.08, s * 1.2, s * 0.14); g.strokeRect(x - s * 0.6 + wb, py - s * 0.08, s * 1.2, s * 0.14);
        const sc = Math.round(201 - (201 - 74) * clamp(q.m, 0, 1)), sg = Math.round(162 - (162 - 48) * clamp(q.m, 0, 1)), sb = Math.round(122 - (122 - 32) * clamp(q.m, 0, 1)); g.fillStyle = 'rgb(' + sc + ',' + sg + ',' + sb + ')'; g.beginPath(); g.ellipse(x + wb, py - s * 0.06, s * 0.52, s * 0.1, 0, 0, 7); g.fill();
        const droop = dry ? 0.9 : q.m < 0.5 ? 0.35 : 0, sway = Math.sin(J.t * 2 + i) * 0.06 + (q.joy > 0 ? Math.sin(q.joy * 20) * 0.2 : 0); g.strokeStyle = '#3f7a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, py - s * 0.08); const tx = x + Math.sin(droop + sway) * s * 0.7, ty = py - s * 0.08 - Math.cos(droop + sway) * s * 0.7; g.quadraticCurveTo(x, py - s * 0.6, tx, ty); g.stroke();
        g.fillStyle = dry ? '#9aa05a' : '#3f9a5e'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x + sd * s * 0.2, py - s * 0.35, s * 0.2, s * 0.08, sd * (0.5 + droop * 0.6), 0, 7); g.fill(); }
        g.fillStyle = dry ? '#c9a24a' : ['#ffd23a', '#ec3013', '#f3f2f2', '#c2456a'][i % 4]; g.beginPath(); g.arc(tx, ty, s * 0.18, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
        if (wet) { g.fillStyle = 'rgba(46,134,184,.8)'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x - s * 0.3 + k * s * 0.3, py + s * 0.85 + Math.sin(J.t * 3 + k) * 2, 3, 0, 7); g.fill(); } }
        if (dry && Math.sin(J.t * 8) > -0.3) { g.fillStyle = '#2e86b8'; g.beginPath(); g.moveTo(x + s * 0.6, y - s * 0.95); g.quadraticCurveTo(x + s * 0.8, y - s * 0.6, x + s * 0.6, y - s * 0.55); g.quadraticCurveTo(x + s * 0.4, y - s * 0.6, x + s * 0.6, y - s * 0.95); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); } }); } };
  // ================= PART 2C · the 8 EXTRA jobs =================
  const hexP = (g, x, y, r, rot) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); };
  function bindHold(name, down, up) { const b = PANEL.querySelector('[data-' + name + ']'); if (!b) return; b.oncontextmenu = e => e.preventDefault(); b.onpointerdown = e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; down(); }; b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => up(); }
  const holdKey = (o, k) => ({ hold: true, down: () => { o[k] = true; }, up: () => { o[k] = false; } });
  // ---- 8 FRONT COUNTER · NUTS & BOLTS: tap the nut whose hole fits the bolt (12 bolts) ----
  const NUTS = [0.45, 0.6, 0.75, 0.9, 1.05];
  GD.tools2 = { btns: null, tip: 'BOLT 1 / 12 \u00b7 TAP THE NUT THAT FITS',
    begin() { J.n = 0; J.N = 12; this.next(); bindCv(p => this.tap(p)); keys({ Digit1: () => this.pick(0), Digit2: () => this.pick(1), Digit3: () => this.pick(2), Digit4: () => this.pick(3) }); },
    next() { J.nuts = shuffle([0, 1, 2, 3, 4]).slice(0, 4).map(i => NUTS[i]); J.ans = Math.random() * 4 | 0; J.T = Math.max(3.2, 6.5 - J.n * 0.3); J.left = J.T; J.anim = 0; J.fx = null; if (J.n) setTip('BOLT ' + (J.n + 1) + ' / 12 \u00b7 TAP THE NUT THAT FITS'); },
    lay(w, h) { const cw = w / 4; return { cw, U: Math.min(cw * 0.36, h * 0.13), ny: h * 0.8, bx: w / 2, by0: h * 0.1, by1: h * 0.54 }; },
    pick(i) { if (J.over || J.anim > 0) return; if (i === J.ans) { thunk(); ding(); J.anim = 0.6; J.fx = { i }; setTip('SNUG! THAT ONE FITS'); }
      else { J.fx = { i, bad: 0.4 }; missOne(J.nuts[i] > J.nuts[J.ans] ? 'TOO LOOSE \u00b7 IT RATTLES' : 'TOO TIGHT \u00b7 IT WON\u2019T GO ON'); } },
    tap(p) { if (p.y < p.h * 0.6) return; this.pick(clamp(Math.floor(p.x / (p.w / 4)), 0, 3)); },
    tick(dt) { if (J.fx && J.fx.bad) { J.fx.bad -= dt; if (J.fx.bad <= 0) J.fx = null; }
      if (J.anim > 0) { J.anim -= dt; if (J.anim <= 0) { J.n++; if (J.n >= J.N) { setTip('TWELVE BOLTS \u00b7 ALL SNUG!'); done1(); } else this.next(); } return; }
      J.left -= dt; if (J.left <= 0) { missOne('TOO SLOW \u00b7 DOZER FOUND THAT ONE'); J.anim = 0.6; J.fx = { i: J.ans }; } },
    hint(w, h) { if (J.anim > 0) return null; const L = this.lay(w, h); return [(J.ans + 0.5) * L.cw, L.ny]; },
    draw(g, w, h) { g.fillStyle = '#3a3836'; g.fillRect(0, 0, w, h); bar(g, w, h, 1 - J.left / J.T, 'BOLT ' + Math.min(J.N, J.n + 1) + ' / 12'); const L = this.lay(w, h), U = L.U, sw = J.nuts[J.ans] * U;
      g.fillStyle = '#4a4744'; g.fillRect(6, h * 0.62, w - 12, h * 0.36); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(6, h * 0.62, w - 12, h * 0.36);
      // the bolt (side view: head + threaded shaft)
      const hy = L.by0 + 18; g.fillStyle = STEEL; g.fillRect(L.bx - U * 0.85, hy, U * 1.7, U * 0.55); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(L.bx - U * 0.85, hy, U * 1.7, U * 0.55);
      g.fillStyle = '#b8bec4'; g.fillRect(L.bx - sw / 2, hy + U * 0.55, sw, L.by1 - hy - U * 0.55); g.strokeRect(L.bx - sw / 2, hy + U * 0.55, sw, L.by1 - hy - U * 0.55);
      g.strokeStyle = 'rgba(32,30,29,.45)'; g.lineWidth = 1.5; for (let y = hy + U * 0.8; y < L.by1 - 3; y += 6) { g.beginPath(); g.moveTo(L.bx - sw / 2, y); g.lineTo(L.bx + sw / 2, y - 3); g.stroke(); }
      J.nuts.forEach((s, i) => { let x = (i + 0.5) * L.cw, y = L.ny, rot = 0; const go = J.anim > 0 && J.fx && J.fx.i === i;
        if (go) { const k = 1 - J.anim / 0.6; x += (L.bx - x) * k; y += (L.by1 - U * 0.6 - y) * k; rot = k * 6; }
        const sh = J.fx && J.fx.bad && J.fx.i === i ? Math.sin(J.fx.bad * 40) * 4 : 0; hexP(g, x + sh, y, U * 0.95, rot); g.fillStyle = '#c9ced3'; g.fill(); g.strokeStyle = J.fx && J.fx.bad && J.fx.i === i ? RED : INK; g.lineWidth = J.fx && J.fx.bad && J.fx.i === i ? 4 : 2; g.stroke();
        g.fillStyle = '#2a2826'; g.beginPath(); g.arc(x + sh, y, s * U * 0.5, 0, 7); g.fill(); g.strokeStyle = '#8a9096'; g.lineWidth = 1.5; g.stroke();
        if (!go) txt(g, String(i + 1), (i + 0.5) * L.cw, Math.min(h - 10, L.ny + U * 1.25), 13, '#cfcac3', 900, 'center'); }); } };
  // ---- 9 LUMBER · FORKLIFT LOAD: s165 = the 3D drive in the lumber yard (worlds/meru2-hardware-fork.js); the job arms the forklift there ----
  GD.lumber2 = { yard: true };
  // ---- 10 ELECTRICAL · FUSE BOX: each switch flips its room + the rooms next door; light the whole house (3 boxes) ----
  const NB = i => [i, i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter(j => j >= 0 && j < 6);
  GD.elec2 = { btns: null, tip: 'BOX 1 / 3 \u00b7 EACH SWITCH FLIPS ITS ROOM + THE ROOMS NEXT DOOR',
    begin() { J.b = 0; this.setup(); bindCv(p => this.tap(p)); keys(Object.fromEntries([1, 2, 3, 4, 5, 6].map(d => ['Digit' + d, () => this.press(d - 1)]))); },
    setup() { const n = [2, 3, 4][J.b]; do { J.on = Array(6).fill(true); J.need = Array(6).fill(false); shuffle([0, 1, 2, 3, 4, 5]).slice(0, n).forEach(i => this.flip(i)); } while (J.on.every(v => v));
      J.par = J.need.filter(v => v).length; J.taps = 0; J.T = 25; J.left = 25; J.pause = 0; J.fl = Array(6).fill(0); J.lev = Array(6).fill(false); },
    flip(i) { NB(i).forEach(j => { J.on[j] = !J.on[j]; }); J.need[i] = !J.need[i]; },
    press(i) { if (J.over || J.pause > 0) return; this.flip(i); J.taps++; J.lev[i] = !J.lev[i]; NB(i).forEach(j => { J.fl[j] = 0.35; }); tone(220, 0.06, 0.06, 'square');
      if (J.on.every(v => v)) { ding(); const over = J.taps - J.par; if (over > 0) { J.miss += Math.min(2, Math.ceil(over / 2)); setTip('ALL LIT \u00b7 ' + over + ' EXTRA FLIP' + (over > 1 ? 'S' : '')); } else setTip('ALL LIT \u00b7 PERFECT!'); J.pause = 1.1; } },
    lay(w, h) { const top = 26, land = w > h * 1.2; if (land) { const cw = (w - 24) / 2; return { H: { x: 8, y: top, w: cw, h: h - top - 8 }, B: { x: 16 + cw, y: top, w: cw, h: h - top - 8 } }; }
      const ch = (h - top - 16) / 2; return { H: { x: 8, y: top, w: w - 16, h: ch }, B: { x: 8, y: top + ch + 8, w: w - 16, h: ch } }; },
    cell(R, i, pad) { const roof = R.roof ? R.h * 0.22 : 0, cw = R.w / 3, ch = (R.h - roof) / 2; return { x: R.x + (i % 3) * cw + pad, y: R.y + roof + Math.floor(i / 3) * ch + pad, w: cw - pad * 2, h: ch - pad * 2 }; },
    tap(p) { const L = this.lay(p.w, p.h); L.H.roof = true; for (const R of [L.H, L.B]) for (let i = 0; i < 6; i++) { const c = this.cell(R, i, 0); if (p.x >= c.x && p.x < c.x + c.w && p.y >= c.y && p.y < c.y + c.h) { this.press(i); return; } } },
    tick(dt) { J.fl = J.fl.map(v => Math.max(0, v - dt)); if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) { J.b++; if (J.b >= 3) { setTip('THREE HOUSES LIT!'); done1(); } else { this.setup(); setTip('BOX ' + (J.b + 1) + ' / 3 \u00b7 LIGHT EVERY ROOM'); } } return; }
      J.left -= dt; if (J.left <= 0) { J.miss += 2; nope(); setTip('TIME \u00b7 VOLTA RESET THE BOX', true); J.on = J.on.map(() => true); J.pause = 1.2; } },
    hint(w, h) { const i = J.need.findIndex(v => v); if (i < 0 || J.pause > 0) return null; const L = this.lay(w, h), c = this.cell(L.B, i, 0); return [c.x + c.w / 2, c.y + c.h / 2]; },
    draw(g, w, h) { g.fillStyle = '#23262b'; g.fillRect(0, 0, w, h); bar(g, w, h, 1 - J.left / J.T, 'BOX ' + Math.min(3, J.b + 1) + ' / 3 \u00b7 FLIPS ' + J.taps); const L = this.lay(w, h); L.H.roof = true;
      const H = L.H, rh = H.h * 0.22; g.fillStyle = '#a8432c'; g.beginPath(); g.moveTo(H.x, H.y + rh); g.lineTo(H.x + H.w / 2, H.y); g.lineTo(H.x + H.w, H.y + rh); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#e7e4dc'; g.fillRect(H.x, H.y + rh, H.w, H.h - rh); g.strokeRect(H.x, H.y + rh, H.w, H.h - rh);
      for (let i = 0; i < 6; i++) { const c = this.cell(H, i, 6), on = J.on[i]; g.fillStyle = on ? '#ffe58a' : '#1e2a3a'; g.fillRect(c.x, c.y, c.w, c.h); g.strokeStyle = J.fl[i] > 0 ? YEL : INK; g.lineWidth = J.fl[i] > 0 ? 4 : 2; g.strokeRect(c.x, c.y, c.w, c.h);
        g.fillStyle = on ? '#fff7d0' : '#3a4658'; g.beginPath(); g.arc(c.x + c.w / 2, c.y + c.h * 0.32, Math.min(c.w, c.h) * 0.14, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(c.x + c.w / 2, c.y); g.lineTo(c.x + c.w / 2, c.y + c.h * 0.2); g.stroke(); }
      const B = L.B; g.fillStyle = '#8a9096'; g.fillRect(B.x, B.y, B.w, B.h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(B.x, B.y, B.w, B.h);
      for (let i = 0; i < 6; i++) { const c = this.cell(B, i, 8), lw = Math.min(c.w * 0.36, 34), lh = c.h * 0.7, lx = c.x + c.w / 2 - lw / 2, ly = c.y + (c.h - lh) / 2; g.fillStyle = '#2a2826'; g.fillRect(lx, ly, lw, lh);
        g.fillStyle = J.lev[i] ? '#e0a800' : '#f3f2f2'; g.fillRect(lx + 3, J.lev[i] ? ly + lh * 0.52 : ly + 3, lw - 6, lh * 0.45); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(lx + 3, J.lev[i] ? ly + lh * 0.52 : ly + 3, lw - 6, lh * 0.45);
        txt(g, String(i + 1), c.x + 4, c.y + 10, 12, INK); } } };
  // ---- 11 PLUMBING · LEAK PATROL: tap the leaks to patch them before the floor floods (45 s) ----
  GD.plumb2 = { btns: null, tip: 'TAP THE LEAKS TO PATCH THEM \u00b7 KEEP THE FLOOR DRY',
    begin() { J.lk = [...Array(12)].map(() => ({ hp: 0, t: 0, fix: 0 })); J.T = 45; J.left = 45; J.lvl = 0; J.cd = 0.8; J.fixed = 0; bindCv(p => this.tap(p)); },
    pos(i, w, h) { return [w * ((i % 4) + 0.5) / 4, h * [0.2, 0.39, 0.58][Math.floor(i / 4)]]; },
    tap(p) { if (J.over) return; let bi = -1, bd = 1e9; J.lk.forEach((q, i) => { if (!q.hp) return; const [x, y] = this.pos(i, p.w, p.h), d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; bi = i; } });
      if (bi < 0 || bd > Math.max(44, p.w * 0.12)) return; const q = J.lk[bi]; q.hp--; q.fix = 0.35; thunk(); if (!q.hp) { J.fixed++; blip(); setTip('PATCHED ' + J.fixed); } else setTip('BIG ONE \u00b7 ONE MORE TAP'); },
    tick(dt) { J.left -= dt; const k = 1 - J.left / J.T; J.cd -= dt;
      if (J.cd <= 0) { const free = J.lk.map((q, i) => (q.hp ? -1 : i)).filter(i => i >= 0); if (free.length) { const q = J.lk[free[Math.random() * free.length | 0]]; q.hp = k > 0.3 && Math.random() < 0.35 ? 2 : 1; q.t = 0; tone(500, 0.03, 0.1, 'triangle'); } J.cd = rnd(1.4, 2.0) - k * 0.8; }
      let open = 0; J.lk.forEach(q => { q.fix = Math.max(0, q.fix - dt); if (q.hp) { q.t += dt; open += q.hp; } }); J.lvl = Math.max(0, J.lvl + (open ? open * 0.035 : -0.04) * dt);
      if (J.lvl >= 1) { J.lvl = 0.4; missOne('THE FLOOR FLOODED \u00b7 GUS MOPS IT'); }
      if (J.left <= 0) { J.left = 0; setTip('SHIFT OVER \u00b7 ' + J.fixed + ' LEAKS PATCHED'); done1(); } },
    hint(w, h) { const i = J.lk.findIndex(q => q.hp); return i < 0 ? null : this.pos(i, w, h); },
    draw(g, w, h) { g.fillStyle = '#d9dee2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c3c9ce'; g.lineWidth = 1; for (let y = 0; y < h; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let x = 0; x < w; x += 28) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      bar(g, w, h, 1 - J.left / J.T, Math.ceil(J.left) + ' S \u00b7 PATCHED ' + J.fixed); const pr = Math.max(8, h * 0.025);
      for (let r = 0; r < 3; r++) { const y = h * [0.2, 0.39, 0.58][r]; g.fillStyle = '#c47a3a'; g.fillRect(0, y - pr, w, pr * 2); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-2, y - pr, w + 4, pr * 2); }
      J.lk.forEach((q, i) => { const [x, y] = this.pos(i, w, h); g.fillStyle = q.fix > 0 ? YEL : '#a8622e'; g.fillRect(x - pr * 1.3, y - pr * 1.25, pr * 2.6, pr * 2.5); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x - pr * 1.3, y - pr * 1.25, pr * 2.6, pr * 2.5);
        if (!q.hp) return; const n = q.hp * 5; g.fillStyle = '#2e86b8'; for (let d = 0; d < n; d++) { const ph = ((J.t * 1.6 + d / n) % 1), dir = d % 2 ? 1 : -1, sx = x + dir * ph * pr * (2 + q.hp * 2), sy = y + pr + ph * ph * h * 0.18; g.beginPath(); g.arc(sx, sy, 2.5 + q.hp, 0, 7); g.fill(); }
        if (q.hp > 1) { g.fillStyle = RED; g.fillRect(x - 8, y - pr * 2.2, 16, 14); txt(g, '2', x, y - pr * 2.2 + 7, 12, '#ffffff', 900, 'center'); } });
      const fy = h * 0.74; g.fillStyle = '#b8bec4'; g.fillRect(0, fy, w, h - fy); const wh = (h - fy) * clamp(J.lvl, 0, 1); g.fillStyle = J.lvl > 0.75 ? 'rgba(236,48,19,.55)' : 'rgba(46,134,184,.75)'; g.fillRect(0, h - wh, w, wh);
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, fy); g.lineTo(w, fy); g.stroke(); txt(g, 'FLOOR ' + Math.round(J.lvl * 100) + '% WET', 10, fy + 14, 13, INK); } };
  // ---- 12 PLUMBING · PRESSURE GAUGE: tap a valve to let pressure out; keep all 3 needles in the green (40 s) ----
  GD.plumb3 = { btns: null, tip: 'TAP A VALVE TO LET PRESSURE OUT \u00b7 KEEP ALL 3 NEEDLES GREEN',
    begin() { J.p = [0.5, 0.45, 0.55]; J.r = [rnd(0.05, 0.07), rnd(0.06, 0.08), rnd(0.05, 0.07)]; J.sg = [0, 0, 0]; J.turn = [0, 0, 0]; J.tr = [0, 0, 0]; J.T = 40; J.left = 40; J.good = 0; J.tot = 0; J.cd = 4;
      bindCv(p => this.tap(p)); keys({ Digit1: () => this.vent(0), Digit2: () => this.vent(1), Digit3: () => this.vent(2) }); },
    vent(i) { if (J.over) return; J.p[i] = Math.max(0, J.p[i] - 0.11); J.turn[i] += 1; tone(260 + i * 60, 0.03, 0.2, 'sawtooth'); },
    tap(p) { this.vent(clamp(Math.floor(p.x / (p.w / 3)), 0, 2)); },
    tick(dt) { J.left -= dt; const k = 1 - J.left / J.T; J.cd -= dt; if (J.cd <= 0) { const i = Math.random() * 3 | 0; J.sg[i] = 1.6; tone(150, 0.05, 0.4, 'square'); J.cd = rnd(3.5, 5) - k * 1.5; }
      for (let i = 0; i < 3; i++) { J.tr[i] += (J.turn[i] - J.tr[i]) * Math.min(1, dt * 10); J.sg[i] = Math.max(0, J.sg[i] - dt); J.p[i] += J.r[i] * (1 + k * 0.6) * (J.sg[i] > 0 ? 3.2 : 1) * dt;
        if (J.p[i] >= 1) { J.p[i] = 0.55; missOne('GAUGE ' + (i + 1) + ' BLEW \u00b7 GUS RESET IT'); } J.tot += dt / 3; if (J.p[i] >= 0.4 && J.p[i] <= 0.68) J.good += dt / 3; }
      if (J.left <= 0) { J.left = 0; const r = J.good / Math.max(0.01, J.tot); J.stars = r >= 0.82 ? 3 : r >= 0.6 ? 2 : 1; if (J.miss >= 2) J.stars = Math.min(J.stars, 2); setTip('SHIFT OVER \u00b7 ' + Math.round(r * 100) + '% IN THE GREEN'); done1(); } },
    hint(w, h) { let bi = -1, bp = 0.62; J.p.forEach((v, i) => { if (v > bp) { bp = v; bi = i; } }); return bi < 0 ? null : [w * (bi + 0.5) / 3, h * 0.78]; },
    draw(g, w, h) { g.fillStyle = '#2f3a42'; g.fillRect(0, 0, w, h); const r = J.good / Math.max(0.01, J.tot); bar(g, w, h, 1 - J.left / J.T, Math.ceil(J.left) + ' S \u00b7 ' + Math.round(r * 100) + '% GREEN');
      const cw = w / 3, R = Math.min(cw * 0.42, h * 0.24), cy = 30 + R + 6, A0 = Math.PI * 0.75, SW = Math.PI * 1.5, ang = v => A0 + v * SW;
      g.fillStyle = '#c47a3a'; g.fillRect(0, h * 0.78 - 6, w, 12);
      for (let i = 0; i < 3; i++) { const cx = cw * (i + 0.5), sg = J.sg[i] > 0; g.fillStyle = '#c47a3a'; g.fillRect(cx - 6, cy, 12, h * 0.78 - cy);
        g.fillStyle = PAPER; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = sg && Math.sin(J.t * 20) > 0 ? RED : INK; g.lineWidth = 3; g.stroke();
        for (const [a, b, c] of [[0, 0.4, '#b8bec4'], [0.4, 0.68, '#3f9a5e'], [0.68, 0.85, YEL], [0.85, 1, RED]]) { g.strokeStyle = c; g.lineWidth = R * 0.18; g.beginPath(); g.arc(cx, cy, R * 0.78, ang(a), ang(b)); g.stroke(); }
        const a = ang(clamp(J.p[i], 0, 1)); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8); g.stroke(); g.fillStyle = RED; g.beginPath(); g.arc(cx, cy, R * 0.1, 0, 7); g.fill();
        if (sg) txt(g, 'SURGE!', cx, cy + R * 0.5, Math.min(16, R * 0.3), RED, 900, 'center');
        const vy = h * 0.78, vr = Math.min(cw * 0.32, h * 0.13); g.save(); g.translate(cx, vy); g.rotate(J.tr[i] * 0.9); g.strokeStyle = RED; g.lineWidth = Math.max(5, vr * 0.18); g.beginPath(); g.arc(0, 0, vr, 0, 7); g.stroke();
        for (let s = 0; s < 4; s++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(s * Math.PI / 2) * vr, Math.sin(s * Math.PI / 2) * vr); g.stroke(); } g.restore(); g.fillStyle = INK; g.beginPath(); g.arc(cx, vy, vr * 0.18, 0, 7); g.fill();
        txt(g, 'VALVE ' + (i + 1), cx, Math.min(h - 10, vy + vr + 14), 12, '#f3f2f2', 900, 'center'); } } };
  // ---- 13 MASONRY · BRICK LAYER: bricks swing on the crane; tap DROP over the gap (4 staggered courses, 14 bricks) ----
  const COURSES = [4, 3, 4, 3], BRICK = '#b5482e';
  const brick = (g, x, y, w, h, c) => { g.fillStyle = c || BRICK; g.fillRect(x, y, w, h); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 3, y + 3, w - 6, h * 0.2); };
  GD.mason2 = { btns: [['go', 'DROP']], tip: 'BRICK 1 / 14 \u00b7 TAP DROP OVER THE GAP',
    begin() { J.c = 0; J.s = 0; J.laid = []; J.ph = rnd(0, 6); J.fall = null; J.crumb = null; const a = () => this.drop(); bindBtn('go', a); bindCv(a); act(a); },
    lay(w, h) { const bw = Math.min(w * 0.8 / 4, h * 0.46 / 4 / 0.45), bh = bw * 0.45; return { bw, bh, x0: (w - bw * 4) / 2, gy: h * 0.93, sy: h * 0.2 }; },
    slotX(c, s) { return c % 2 ? 1 + s : 0.5 + s; }, swing() { return 2 + 2.25 * Math.sin(J.ph); },
    drop() { if (J.over || J.fall || J.c >= 4) return; J.fall = { x: this.swing(), t: 0 }; tone(500, 0.03, 0.15, 'triangle'); },
    tick(dt) { J.ph += dt * (1.5 + J.c * 0.35); if (J.crumb && (J.crumb.t += dt) > 0.8) J.crumb = null;
      if (J.fall) { J.fall.t += dt / 0.35; if (J.fall.t >= 1) { const x = J.fall.x, tx = this.slotX(J.c, J.s); J.fall = null;
        if (Math.abs(x - tx) < 0.25) { J.laid.push({ c: J.c, s: J.s }); thunk(); J.s++; if (J.s >= COURSES[J.c]) { J.c++; J.s = 0; ding(); } if (J.c >= 4) { setTip('FOURTEEN BRICKS \u00b7 A STRAIGHT WALL!'); done1(); } else setTip('BRICK ' + (J.laid.length + 1) + ' / 14 \u00b7 TAP DROP OVER THE GAP'); }
        else { J.crumb = { x, c: J.c, t: 0 }; missOne('CROOKED \u00b7 MORTY SIGHS \u00b7 TRY AGAIN'); } } } },
    hint(w, h) { if (J.fall || J.c >= 4) return null; const L = this.lay(w, h), tx = this.slotX(J.c, J.s); return Math.abs(this.swing() - tx) < 0.35 ? [L.x0 + tx * L.bw, L.gy - (J.c + 0.5) * L.bh] : null; },
    draw(g, w, h) { g.fillStyle = '#d7d0c4'; g.fillRect(0, 0, w, h); const L = this.lay(w, h), X = u => L.x0 + u * L.bw, CY = c => L.gy - (c + 1) * L.bh; g.fillStyle = '#8a857e'; g.fillRect(0, L.gy, w, h - L.gy);
      g.fillStyle = INK; g.fillRect(0, 26, w, 6); const c = Math.min(3, J.c);
      for (let k = 0; k <= c; k++) { if (k > J.c) break; g.fillStyle = '#b8b2a8'; g.fillRect(X(0), CY(k), L.bw * 4, L.bh); if (k % 2) { brick(g, X(0), CY(k), L.bw / 2, L.bh, '#9a3c26'); brick(g, X(3.5), CY(k), L.bw / 2, L.bh, '#9a3c26'); } }
      J.laid.forEach(b => brick(g, X(this.slotX(b.c, b.s) - 0.5), CY(b.c), L.bw, L.bh));
      if (J.c < 4 && !J.over) { const tx = this.slotX(J.c, J.s); g.strokeStyle = YEL; g.lineWidth = 3; g.setLineDash([6, 5]); g.strokeRect(X(tx - 0.5) + 2, CY(J.c) + 2, L.bw - 4, L.bh - 4); g.setLineDash([]); }
      if (J.crumb) { const k = J.crumb.t; g.fillStyle = BRICK; for (let i = 0; i < 6; i++) { const px = X(J.crumb.x) + (i - 2.5) * L.bw * 0.15 * (1 + k * 2), py = CY(J.crumb.c) + k * k * h * 0.6; g.fillRect(px, py, L.bw * 0.14, L.bh * 0.4); } }
      const sx = X(this.swing()); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 32); g.lineTo(sx, L.sy - L.bh * 0.2); g.stroke();
      if (J.fall) { const k = J.fall.t, y = L.sy + (CY(J.c) - L.sy) * k * k; brick(g, X(J.fall.x - 0.5), y, L.bw, L.bh); } else if (J.c < 4) brick(g, sx - L.bw / 2, L.sy, L.bw, L.bh);
      txt(g, 'BRICK ' + Math.min(14, J.laid.length + 1) + ' / 14', 12, 14, 16, INK); txt(g, 'COURSE ' + Math.min(4, J.c + 1) + ' / 4', w - 12, 14, 14, RED, 900, 'right'); } };
  // ---- 14 PAINT · ROLL THE WALL: drag the roller over the wall, tap the tray for paint, mind the window (45 s) ----
  const SUNY = '#f2c230', OLDW = '#cfc6b8';
  GD.paint2 = { btns: null, tip: 'DRAG THE ROLLER OVER THE WALL \u00b7 TAP THE TRAY FOR PAINT',
    begin() { J.cell = Array(240).fill(0); const wx = 2 + (Math.random() * 12 | 0), sx = wx > 8 ? 2 + (Math.random() * 3 | 0) : 14 + (Math.random() * 3 | 0);
      for (let y = 2; y < 7; y++) for (let x = wx; x < wx + 5; x++) J.cell[y * 20 + x] = -1; for (let y = 9; y < 11; y++) for (let x = sx; x < sx + 2; x++) J.cell[y * 20 + x] = -1;
      J.need = J.cell.filter(v => v === 0).length; J.done = 0; J.load = 1; J.T = 45; J.left = 45; J.rp = null; J.stroke = false; J.dry = false;
      bindCv(p => { J.stroke = false; J.rp = null; this.at(p); }, (p, d) => { if (d) this.at(p); }, () => { J.rp = null; }); },
    lay(w, h) { const th = Math.max(56, h * 0.17), tw = Math.min(w * 0.4, 190), wy = 22; return { wx: 8, wy, ww: w - 16, wh: h - th - wy - 8, tx: w - 8 - tw, ty: h - th, tw, th: th - 6 }; },
    at(p) { if (J.over) return; const L = this.lay(p.w, p.h);
      if (p.x > L.tx && p.y > L.ty) { if (J.load < 1) { J.load = 1; plip(); setTip('ROLLER FULL \u00b7 KEEP ROLLING'); J.dry = false; } J.rp = null; return; }
      const cw = L.ww / 20, ch = L.wh / 12, from = J.rp || p, n = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y) / (cw * 0.5)));
      for (let s = 1; s <= n; s++) { const x = from.x + (p.x - from.x) * s / n, y = from.y + (p.y - from.y) * s / n; this.paint((x - L.wx) / cw, (y - L.wy) / ch); } J.rp = p; },
    paint(cx, cy) { const rows = [Math.floor(cy - 0.4), Math.floor(cy + 0.4)]; for (const yy of new Set(rows)) { if (yy < 0 || yy >= 12) continue; for (let xx = Math.floor(cx - 1.3); xx <= Math.floor(cx + 1.3); xx++) { if (xx < 0 || xx >= 20) continue; const i = yy * 20 + xx, v = J.cell[i];
      if (v === 1 || v === -2) continue; if (J.load <= 0) { if (!J.dry) { J.dry = true; nope(); setTip('OUT OF PAINT \u00b7 TAP THE TRAY', true); } return; }
      if (v === -1) { J.cell[i] = -2; J.load -= 0.025; if (!J.stroke) { J.stroke = true; missOne('PAINT ON THE WINDOW! CAREFUL, SUNSHINE'); } continue; }
      J.cell[i] = 1; J.done++; J.load -= 0.025; } }
      if (J.done / J.need >= 0.95 && !J.over) { const k = J.left / J.T; J.stars = k >= 0.4 ? 3 : k >= 0.15 ? 2 : 1; if (J.miss >= 2) J.stars = Math.min(J.stars, 2); if (J.miss >= 4) J.stars = 1; setTip('WALL DONE \u00b7 SUNSHINE YELLOW!'); ding(); done1(); } },
    tick(dt) { J.left -= dt; if (J.left <= 0) { J.left = 0; J.stars = 1; setTip('TIME \u00b7 ' + Math.round(J.done / J.need * 100) + '% COVERED', true); done1(); } },
    hint(w, h) { const L = this.lay(w, h); if (J.load < 0.15) return [L.tx + L.tw / 2, L.ty + L.th / 2]; const i = J.cell.findIndex(v => v === 0); return i < 0 ? null : [L.wx + (i % 20 + 0.5) * L.ww / 20, L.wy + (Math.floor(i / 20) + 0.5) * L.wh / 12]; },
    draw(g, w, h) { g.fillStyle = '#efe4ea'; g.fillRect(0, 0, w, h); bar(g, w, h, 1 - J.left / J.T, 'COVERED ' + Math.round(J.done / J.need * 100) + '% \u00b7 ' + Math.ceil(J.left) + ' S'); const L = this.lay(w, h), cw = L.ww / 20, ch = L.wh / 12;
      for (let i = 0; i < 240; i++) { const v = J.cell[i], x = L.wx + (i % 20) * cw, y = L.wy + Math.floor(i / 20) * ch; g.fillStyle = v === 1 ? SUNY : v < 0 ? '#9fd0ea' : OLDW; g.fillRect(x, y, cw + 0.6, ch + 0.6); if (v === -2) { g.fillStyle = 'rgba(242,194,48,.85)'; g.beginPath(); g.arc(x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.45, 0, 7); g.fill(); } }
      let mn = [99, 99, -1, -1]; for (let i = 0; i < 240; i++) if (J.cell[i] < 0) { const x = i % 20, y = Math.floor(i / 20); if (y < 8) mn = [Math.min(mn[0], x), Math.min(mn[1], y), Math.max(mn[2], x), Math.max(mn[3], y)]; }
      if (mn[2] >= 0) { g.strokeStyle = '#f3f2f2'; g.lineWidth = 5; g.strokeRect(L.wx + mn[0] * cw, L.wy + mn[1] * ch, (mn[2] - mn[0] + 1) * cw, (mn[3] - mn[1] + 1) * ch); g.lineWidth = 3; g.beginPath(); g.moveTo(L.wx + (mn[0] + 2.5) * cw, L.wy + mn[1] * ch); g.lineTo(L.wx + (mn[0] + 2.5) * cw, L.wy + (mn[3] + 1) * ch); g.stroke(); }
      g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(L.wx, L.wy, L.ww, L.wh);
      g.fillStyle = '#8a9096'; g.fillRect(L.tx, L.ty, L.tw, L.th); g.fillStyle = J.load < 1 ? SUNY : '#d9a91c'; g.fillRect(L.tx + 8, L.ty + L.th * 0.35, L.tw - 16, L.th * 0.5); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(L.tx, L.ty, L.tw, L.th); txt(g, 'TRAY \u00b7 TAP', L.tx + 8, L.ty + L.th * 0.2, 12, INK);
      g.fillStyle = INK; g.fillRect(8, L.ty + L.th * 0.3, Math.min(160, L.tx - 24), 14); g.fillStyle = J.load < 0.15 ? RED : SUNY; g.fillRect(10, L.ty + L.th * 0.3 + 2, (Math.min(160, L.tx - 24) - 4) * clamp(J.load, 0, 1), 10); txt(g, 'PAINT ON THE ROLLER', 8, L.ty + L.th * 0.3 + 26, 12, INK);
      const rp = J.rp; if (rp) { const rw = cw * 2.6, rh = ch * 0.8; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(rp.x, rp.y); g.lineTo(rp.x + 6, rp.y + rh * 1.6); g.stroke(); g.fillStyle = J.load > 0 ? SUNY : '#e7e4dc'; g.fillRect(rp.x - rw / 2, rp.y - rh / 2, rw, rh); g.strokeRect(rp.x - rw / 2, rp.y - rh / 2, rw, rh); } } };
  // ---- 15 GARDEN · SUNFLOWER GROW: hold to water; keep the drop in the moving green band to grow 3 sunflowers (60 s) ----
  const sunflower = (g, x, by, s, k) => { const top = by - s * 1.8 * k; g.strokeStyle = '#3f7a2a'; g.lineWidth = Math.max(3, s * 0.09); g.beginPath(); g.moveTo(x, by); g.quadraticCurveTo(x + s * 0.12, (by + top) / 2, x, top); g.stroke();
    if (k > 0.25) { g.fillStyle = '#3f9a5e'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x + sd * s * 0.22, by - s * 0.6 * k, s * 0.22, s * 0.08, sd * 0.5, 0, 7); g.fill(); } }
    if (k > 0.55) { const o = clamp((k - 0.55) / 0.45, 0, 1), r = s * (0.18 + 0.3 * o); if (o > 0.05) { g.fillStyle = '#ffd23a'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * r, top + Math.sin(a) * r, r * 0.55, r * 0.22, a, 0, 7); g.fill(); } }
      g.fillStyle = o > 0.05 ? '#6b4a2a' : '#5fae5a'; g.beginPath(); g.arc(x, top, r * 0.62, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); } };
  GD.garden2 = { btns: [['go', 'HOLD TO WATER']], tip: 'HOLD TO WATER \u00b7 KEEP THE DROP IN THE GREEN BAND',
    begin() { J.m = 0.35; J.g = 0; J.f = 0; J.T = 60; J.left = 60; J.hold = false; J.ph = rnd(0, 6); J.pause = 0; const on = () => { J.hold = true; }, off = () => { J.hold = false; };
      bindHold('go', on, off); bindCv(on, null, off); keys({ Space: { hold: true, down: on, up: off }, Enter: { hold: true, down: on, up: off } }); },
    band() { const c = 0.5 + 0.22 * Math.sin(J.ph), bw = [0.28, 0.23, 0.19][Math.min(2, J.f)]; return [c - bw / 2, c + bw / 2]; },
    tick(dt) { J.left -= dt; if (J.left <= 0) { J.left = 0; J.stars = 1; setTip('TIME \u00b7 ' + J.f + ' / 3 SUNFLOWERS', true); done1(); return; }
      if (J.pause > 0) { J.pause -= dt; return; } J.ph += dt * (0.55 + J.f * 0.2); J.m += (J.hold ? 0.5 : -0.3) * dt; if (J.hold && Math.random() < 0.15) plip();
      if (J.m > 1) { J.m = 0.6; missOne('TOO MUCH WATER \u00b7 THE ROOTS ARE SOGGY'); } if (J.m < 0) { J.m = 0.35; missOne('IT DRIED OUT \u00b7 WATER SOONER'); }
      const [a, b] = this.band(); if (J.m >= a && J.m <= b) J.g += dt / 8;
      if (J.g >= 1) { J.f++; J.g = 0; ding(); J.pause = 0.8; J.hold = false; if (J.f >= 3) { const k = J.left; J.stars = k >= 20 ? 3 : k >= 8 ? 2 : 1; if (J.miss >= 2) J.stars = Math.min(J.stars, 2); setTip('THREE SUNFLOWERS!'); done1(); } else setTip('SUNFLOWER ' + J.f + ' BLOOMED \u00b7 NEXT ONE'); } },
    hint(w, h) { const [a] = this.band(); return !J.hold && J.m < a + 0.02 ? [w / 2, h - 26] : null; },
    draw(g, w, h) { g.fillStyle = '#cfe6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#8fbf6a'; g.fillRect(0, h * 0.82, w, h * 0.18); bar(g, w, h, 1 - J.left / J.T, Math.ceil(J.left) + ' S \u00b7 SUNFLOWER ' + Math.min(3, J.f + 1) + ' / 3');
      const sx = w * (0.55 + 0.35 * Math.sin(J.t * 0.1)), sy = h * 0.14; g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(sx, sy, Math.min(26, h * 0.06), 0, 7); g.fill();
      const mx = 12, mw = 26, mt = 34, mb = h - 14, MY = v => mb - v * (mb - mt), [a, b] = this.band(); g.fillStyle = PAPER; g.fillRect(mx, mt, mw, mb - mt); g.fillStyle = '#3f9a5e'; g.fillRect(mx, MY(b), mw, MY(a) - MY(b)); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(mx, mt, mw, mb - mt);
      const dy = MY(clamp(J.m, 0, 1)); g.fillStyle = '#2e86b8'; g.beginPath(); g.moveTo(mx + mw + 14, dy - 12); g.quadraticCurveTo(mx + mw + 24, dy, mx + mw + 14, dy + 6); g.quadraticCurveTo(mx + mw + 4, dy, mx + mw + 14, dy - 12); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); g.fillStyle = INK; g.fillRect(mx - 2, dy - 1.5, mw + 6, 3);
      const x0 = mx + mw + 40, span = w - x0 - 10, s = Math.min(span / 3 * 0.5, h * 0.2), by = h * 0.82;
      for (let i = 0; i < 3; i++) { const x = x0 + span * (i + 0.5) / 3, k = i < J.f ? 1 : i === J.f ? 0.12 + 0.88 * J.g : 0;
        if (k > 0) sunflower(g, x, by - s * 0.35, s, k); g.fillStyle = '#b0623f'; g.beginPath(); g.moveTo(x - s * 0.4, by - s * 0.4); g.lineTo(x + s * 0.4, by - s * 0.4); g.lineTo(x + s * 0.3, by + s * 0.05); g.lineTo(x - s * 0.3, by + s * 0.05); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        if (i === J.f && J.f < 3) { const cx = x + s * 0.5, cy = by - s * 2.3; g.save(); g.translate(cx, cy); g.rotate(J.hold ? -0.5 : 0); g.fillStyle = '#3f9a5e'; g.fillRect(-s * 0.3, -s * 0.18, s * 0.5, s * 0.36); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-s * 0.3, -s * 0.18, s * 0.5, s * 0.36); g.beginPath(); g.moveTo(-s * 0.3, 0); g.lineTo(-s * 0.6, -s * 0.12); g.stroke(); g.restore();
          if (J.hold) { g.fillStyle = '#2e86b8'; for (let d = 0; d < 5; d++) { const ph = (J.t * 2 + d / 5) % 1; g.beginPath(); g.arc(cx - s * 0.55 + Math.sin(d) * 4, cy + ph * (by - cy - s * 0.4), 2.5, 0, 7); g.fill(); } } } } } };
  // ================= run a job =================
  const starsOf = () => J.stars || (J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1);
  const baseOf = k => GN[k].base || k, unlocked = k => !GN[k].base || K.stars(GN[k].base) >= 3, extrasOf = b => HW_EXTRA.filter(q => q.base === b);
  // a department with an unlocked extra job asks which one first (direct = straight to the job)
  function start(k, direct, force) { if (busy || !GD[k]) return false; const sp = speaker(baseOf(k)); if (!sp) return false;
    if (!force && !unlocked(k)) { toast('LOCKED \u00b7 3 STARS ON ' + GN[GN[k].base].name.toUpperCase() + ' FIRST', 2.6); return false; }
    const ex = !direct && !GN[k].base ? extrasOf(k).filter(q => unlocked(q.k)) : [];
    if (ex.length) { sayTo(sp.t, [{ ...sp.l('Which job today?'), choices: [{ text: GN[k].name.toUpperCase(), pick: () => start(k, true) }, ...ex.map(q => ({ text: q.name.toUpperCase() + (K.stars(q.k) ? '' : ' \u00b7 NEW'), pick: () => start(q.k, true) })), { text: 'GOODBYE', bye: true, pick: () => {} }] }]); return true; }
    busy = 'intro';
    sayTo(sp.t, [sp.l(sp.away ? sp.away + ' is out, so I run it. ' + HOW[k] : INTRO[k])], () => begin(k, sp)); setTimeout(() => { if (busy === 'intro' && !J) busy = null; }, 30000); return true; }
  function begin(k, sp) { if (busy !== 'intro') return; const D = GD[k], q = GN[k]; J = { k, sp, miss: 0, idle: 0, t: 0, over: false }; if (D.yard && yard) { busy = 'yard'; ding(); yard.arm(); return; } busy = 'job'; ding(); openPanel(q.name.toUpperCase() + ' \u00b7 ' + q.dept, D.tip, D.btns); D.begin(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  function finishJob() { if (!J || busy !== 'job') return; const k = J.k, sp = J.sp, st = starsOf(), prev = K.stars(k), first = !prev, ex = !GN[k].base && st === 3 && prev < 3 ? extrasOf(k) : []; J.off && J.off(); cancelAnimationFrame(raf); hidePanel(); J = null;
    const gold = st * 6 + (first ? 12 : 0); save.addGold(gold); coin(); try { save.addXp && save.addXp(first ? 15 : 4); } catch (e) {} K.finish(k, st, gold, first);
    const lines = [sp.l((sp.away ? 'All done! ' + HOW[k].split('.')[0] + '. Nicely.' : DONE[k]) + (st === 3 ? ' Three stars.' : ''))];
    if (ex.length) lines.push(sp.l('New job unlocked: ' + ex.map(q => q.name.toUpperCase()).join(' and ') + '. Ask me any time.'));
    busy = 'end'; sayTo(sp.t, lines, () => { busy = null; prizes(); }); setTimeout(() => { if (busy === 'end') busy = null; }, 30000); }
  function prizes() { const all = HW_GAMES.every(q => K.stars(q.k) > 0), hero = HW_GAMES.every(q => K.stars(q.k) >= 3);
    if (all && !save.stat('hwAllJobs', false)) { save.setStat('hwAllJobs', true); try { const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === FLANNEL.name)) save.setStat('tailorOutfits', [...list, FLANNEL]); } catch (e) {} save.addGold(40); prize && prize('all'); return; }
    if (hero && !save.stat('hwHero', false)) { save.setStat('hwHero', true); save.addGold(100); try { save.addXp && save.addXp(100); } catch (e) {} prize && prize('hero'); return; }
    if (HW_EXTRA.every(q => K.stars(q.k) > 0) && !save.stat('hwExtraAll', false)) { save.setStat('hwExtraAll', true); save.addGold(60); try { save.addXp && save.addXp(60); } catch (e) {} prize && prize('extra'); } }
  function quit() { if (busy === 'yard') { yard && yard.disarm(); J = null; busy = null; toast('JOB STOPPED \u00b7 COME BACK ANY TIME', 2); return; } if (busy === 'picker') { hidePanel(); busy = null; return; } if (busy === 'intro') { busy = null; return; } if (busy !== 'job') return; J && J.off && J.off(); cancelAnimationFrame(raf); hidePanel(); J = null; busy = null; toast('JOB STOPPED \u00b7 COME BACK ANY TIME', 2); }
  // ================= NOW HIRING: pick any of the 7 + the unlocked extras =================
  function hiring() { if (busy) return; busy = 'picker'; fitPanel(); const starHtml = n => [0, 1, 2].map(i => '<span style="color:' + (i < n ? '#ffd23a' : '#cfcac3') + ';-webkit-text-stroke:1px #201e1d">\u2605</span>').join('');
    const tile = q => { const sp = speaker(baseOf(q.k)), st = K.stars(q.k), b = K.best(q.k), lock = !unlocked(q.k); return '<button data-job="' + q.k + '"' + (lock ? ' data-lock="1"' : '') + ' style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-height:76px;padding:8px 10px;text-align:left;background:' + (lock ? '#e7e4dc' : '#f3f2f2') + ';color:#201e1d;border:2px solid #201e1d;border-left:10px solid ' + (lock ? '#9a958e' : q.color) + ';border-radius:0;font-family:Archivo,sans-serif;cursor:pointer">'
        + '<span style="font-weight:900;font-size:16px;line-height:1.1">' + q.name.toUpperCase() + '</span><span style="font-weight:800;font-size:11px">' + q.dept + (sp ? ' \u00b7 ' + sp.t.name.toUpperCase() : '') + '</span>'
        + (lock ? '<span style="font-weight:900;font-size:11px;color:#a8322a">LOCKED \u00b7 3 STARS ON ' + GN[q.base].name.toUpperCase() + '</span>' : '<span style="font-size:18px;line-height:1;letter-spacing:2px">' + starHtml(st) + '</span><span style="font-weight:800;font-size:11px">' + (b ? 'BEST ' + b + ' G' : 'NOT PLAYED YET') + '</span>') + '</button>'; };
    const sec = t => '<div style="grid-column:1/-1;font-weight:900;font-size:12px;padding:4px 0 2px;border-bottom:2px solid #201e1d">' + t + '</div>';
    PANEL.innerHTML = head('NOW HIRING \u00b7 PICK A JOB', 'MERU HARDWARE') + '<div style="flex:1;min-height:0;overflow:auto;padding:8px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;align-content:start">'
      + sec('DEPARTMENT JOBS') + HW_GAMES.map(tile).join('') + sec('EXTRA JOBS \u00b7 3 STARS ON THE FIRST JOB UNLOCKS THEM') + HW_EXTRA.map(tile).join('') + '</div>'
      + '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:14px;padding:9px 12px;line-height:1.25">' + (save.stat('hwHero', false) ? 'HARDWARE HERO \u00b7 THREE STARS EVERYWHERE' : 'ALL 7 = HANK\u2019S FLANNEL \u00b7 3 STARS ON ALL 7 = HARDWARE HERO') + '</div>';
    PANEL.style.display = 'flex'; PANEL.querySelector('[data-stop]').onclick = () => quit();
    PANEL.querySelectorAll('[data-job]').forEach(b => { b.onclick = () => { const k = b.getAttribute('data-job'); if (b.getAttribute('data-lock')) { const t = PANEL.querySelector('[data-tip]'); if (t) { t.textContent = '3 STARS ON ' + GN[GN[k].base].name.toUpperCase() + ' UNLOCKS ' + GN[k].name.toUpperCase(); t.style.background = RED; t.style.color = '#ffffff'; } nope(); return; } hidePanel(); busy = null; start(k, true); }; }); }
  const API = { yardDone(st, sp2) { if (busy !== 'yard' || !J) return; J.stars = st; if (sp2) J.sp = sp2; busy = 'job'; finishJob(); }, start, play: k => start(k, true, true), _dbg: () => ({ GD, J }), quit, hiring, busy: () => busy, dispose() { cancelAnimationFrame(raf); PANEL.remove(); } };
  window.__hwJobs = API; return API;
}
