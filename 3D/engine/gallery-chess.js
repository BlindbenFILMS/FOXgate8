// Blind Canvas gallery: TALKING CHESS (27 Oct). Two chess tables under the big cherry tree on the east lawn (built in gallery-fun-props.js).
// Walk up to a stool (ACTION "PLAY CHESS"): your fox walks to the stool and sits, and the camera glides over its shoulder onto
// the board. You play on the 3D table itself: tap a piece, then tap where it goes. South stool = white, north stool = black.
// 1 PLAYER = you against the computer. 2 PLAYERS = you invite a visitor whose fox is standing near the table (or sitting across).
// Every move is read aloud ("Knight to F3. Check."), tapping any square says what is on it, and the table border carries
// braille-style file + rank dots. A hidden grid of buttons gives screen readers every square too.
// Rules + computer player are Meru's chess (chess-rules.js, in a worker so phones never freeze); sounds are chess-audio.js.
// Everyone sees the pieces move on the 3D table (net events k: 'chs').
import { Chess, think, sqName, colorOf, typeOf, PIECE_NAMES } from './chess-rules.js';
import { createChessAudio } from './chess-audio.js';

const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
const CPU_LEVEL = 1, NEAR_M = 8;
const SIDE = { w: 'white', b: 'black' }, other = s => (s === 'w' ? 'b' : 'w');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

export function setupChess({ G, net, announce = () => {}, nameOf = () => 'A visitor' }) {
  const C = G.chess; if (!C || !C.tables || !C.tables.length) return null;
  const THREE = G.world.THREE, camera = G.world.camera, canvas = G.world.canvas;
  const myId = (net && net.id) || 'me';
  const T = C.tables.map(t => ({ t, g: new Chess(), seat: { w: null, b: null }, mode: 'idle', last: null, over: null, gen: 0 }));
  let mine = null, sel = -1, voice = true, invitedBy = null, pendingInvite = null;
  const audio = createChessAudio({ sound: true, music: false });
  const sfx = (n, o) => audio.sfx(n, o);

  // ------------------------------------------------ words
  const who = (tb, s) => { const id = tb.seat[s]; return id === myId ? 'You' : id === 'cpu' ? 'The computer' : id ? nameOf(id) : cap(SIDE[s]); };
  const sqWords = sq => sqName(sq).toUpperCase();
  const pieceWords = p => SIDE[colorOf(p)] + ' ' + PIECE_NAMES[typeOf(p)];
  function moveWords(m) {
    if (m.flag === 'K') return 'Castles king side'; if (m.flag === 'Q') return 'Castles queen side';
    let s = cap(PIECE_NAMES[typeOf(m.piece)]) + (m.cap ? ' takes ' + PIECE_NAMES[typeOf(m.cap)] + ' on ' : ' to ') + sqWords(m.to);
    if (m.flag === 'ep') s += ', en passant'; if (m.promo) s += ', and becomes a ' + PIECE_NAMES[typeOf(m.promo)];
    return s;
  }
  function speak(text) {
    announce(text); stat.textContent = text;
    if (!voice || !window.speechSynthesis) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.02; speechSynthesis.speak(u); } catch (e) {}
  }

  // ------------------------------------------------ the on-screen bars (inverted menu style: ink ground, light type, red rules)
  const css = document.createElement('style');
  css.textContent = `
  .chbar{position:fixed;left:0;right:0;z-index:30;display:none;background:#201e1d;color:#f3f2f2;font-family:${FONT};touch-action:manipulation;user-select:none;-webkit-user-select:none;box-sizing:border-box}
  .chbar.top{top:0;border-bottom:2px solid #ec3013;padding:calc(8px + env(safe-area-inset-top)) calc(10px + env(safe-area-inset-right)) 10px calc(10px + env(safe-area-inset-left))}
  .chbar.bot{bottom:0;border-top:2px solid #ec3013;padding:8px calc(10px + env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) calc(10px + env(safe-area-inset-left));gap:6px;grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}
  .chbar .row{display:flex;gap:8px;align-items:center}
  .chbar .row b{flex:1;min-width:0;font:800 14px/1.1 ${FONT};letter-spacing:.08em;text-transform:uppercase}
  .chbar .row b small{display:block;font:600 12px/1.3 ${FONT};letter-spacing:.02em;color:#ff9783;text-transform:none;margin-top:2px}
  .chbar .st{font:800 18px/1.25 ${FONT};margin-top:8px;text-wrap:pretty;min-height:22px}
  .chbar button{min-height:52px;min-width:48px;padding:0 12px;border:2px solid #f3f2f2;background:#201e1d;color:#f3f2f2;font:800 14px ${FONT};letter-spacing:.06em;text-transform:uppercase;text-align:left;cursor:pointer;border-radius:0}
  .chbar button small{display:block;font:600 11px ${FONT};letter-spacing:.02em;text-transform:none;color:#ff9783;margin-top:2px}
  .chbar button:hover{background:#4a1308} .chbar button:active{background:#8f1d0b} .chbar button:focus-visible{outline:2px solid #ec3013;outline-offset:2px}
  .chbar button.red{background:#ec3013;border-color:#ec3013} .chbar button.red:hover{background:#c92810} .chbar button.red small{color:#f3f2f2}
  .chbar button:disabled{opacity:.45;cursor:default}
  .chsr{position:fixed;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
  @media (orientation:landscape) and (max-height:500px){
    .chbar{right:auto;width:calc(232px + env(safe-area-inset-left))}
    .chbar.top{border-bottom:0;border-right:2px solid #ec3013;bottom:auto}
    .chbar.bot{border-top:2px solid #ec3013;border-right:2px solid #ec3013;grid-template-columns:1fr}
  }
  .chinv{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top));transform:translateX(-50%);z-index:31;display:none;width:min(360px,calc(100vw - 24px));box-sizing:border-box;background:#201e1d;color:#f3f2f2;border:2px solid #ec3013;padding:12px;font-family:${FONT}}
  .chinv b{display:block;font:800 17px/1.25 ${FONT};margin-bottom:10px;text-wrap:pretty} .chinv .r{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .chinv button{min-height:52px;padding:0 12px;border:2px solid #f3f2f2;background:#201e1d;color:#f3f2f2;font:800 14px ${FONT};letter-spacing:.06em;text-align:left;cursor:pointer;border-radius:0}
  .chinv button.red{background:#ec3013;border-color:#ec3013}`;
  document.head.appendChild(css);
  const mk = (cls, html, label) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; if (label) { d.setAttribute('role', 'region'); d.setAttribute('aria-label', label); }
    for (const ev of ['pointerdown', 'touchstart', 'wheel', 'keydown']) d.addEventListener(ev, e => e.stopPropagation(), { passive: true }); document.body.appendChild(d); return d; };
  const top = mk('chbar top', `<div class="row"><b><span class="tt">TALKING CHESS</span><small class="sub"></small></b><button class="x" aria-label="Leave the table">\u2715 LEAVE</button></div><div class="st" aria-hidden="true"></div>`, 'Fox chess');
  const bot = mk('chbar bot', '', 'Chess actions');
  const sr = mk('chsr', '', 'Chess board, every square'); sr.setAttribute('role', 'grid');
  const inv = mk('chinv', '<b></b><div class="r"><button class="red yes">JOIN</button><button class="no">NO THANKS</button></div>');
  inv.setAttribute('role', 'alertdialog');
  const stat = top.querySelector('.st');
  top.querySelector('.x').onclick = () => leave(true);
  const cells = []; for (let i = 0; i < 64; i++) { const b = document.createElement('button'); b.onclick = () => tap(+b.dataset.sq); sr.appendChild(b); cells.push(b); }

  // ------------------------------------------------ drawing the state (the 3D table + the bars)
  const myTb = () => (mine ? T[mine.tb] : null);
  const myTurn = tb => mine && T[mine.tb] === tb && tb.mode !== 'idle' && !tb.over && tb.g.turn === mine.side;
  const nearbyFox = tb => {
    const across = tb.seat[other(mine.side)]; if (across && across !== 'cpu' && across !== myId) return across;
    let best = null, bd = NEAR_M;
    for (const r of (G.remote && G.remote.list ? G.remote.list() : [])) { if (!r.placed) continue; const d = Math.hypot(r.x - tb.t.x, r.z - tb.t.z); if (d < bd) { bd = d; best = r.id; } }
    return best;
  };
  function draw3d(tb) {
    const isMine = myTb() === tb, s = isMine ? sel : -1;
    tb.t.setBoard(tb.g.b, s);
    tb.t.mark({ sel: s, from: tb.last ? tb.last.from : -1, to: tb.last ? tb.last.to : -1 });
    tb.t.targets(s >= 0 && myTurn(tb) ? [...new Set(tb.g.moves(s).map(m => m.to))] : []);
  }
  function render() {
    const tb = myTb(); if (!tb) return; draw3d(tb);
    top.querySelector('.tt').textContent = 'TALKING CHESS \u00b7 ' + tb.t.name.replace('Chess table', 'TABLE');
    top.querySelector('.sub').textContent = tb.mode === 'idle' ? 'You are ' + SIDE[mine.side] : who(tb, 'w') + ' (white) vs ' + who(tb, 'b') + ' (black)';
    bot.innerHTML = '';
    const btn = (label, sub, fn, red, dis) => { const b = document.createElement('button'); if (red) b.className = 'red'; b.innerHTML = label + (sub ? `<small>${sub}</small>` : ''); b.onclick = fn; b.disabled = !!dis; bot.appendChild(b); return b; };
    if (tb.mode === 'idle' || tb.over) {
      const fox = nearbyFox(tb);
      btn('1 PLAYER', 'You vs the computer', () => startGame('cpu'), true);
      btn('2 PLAYERS', pendingInvite ? 'Asking ' + nameOf(pendingInvite) + '\u2026' : fox ? 'With ' + nameOf(fox) : 'No fox nearby yet', () => twoPlayers(), false, !fox || !!pendingInvite);
    } else {
      btn('READ BOARD', 'Hear every piece', readBoard);
      btn('RESIGN', 'End this game', resign);
    }
    btn(voice ? 'VOICE: ON' : 'VOICE: OFF', 'Read moves aloud', () => { voice = !voice; if (!voice && window.speechSynthesis) speechSynthesis.cancel(); render(); if (voice) speak('Voice on.'); });
    const flip = mine.side === 'b';
    for (let v = 0; v < 64; v++) { const sq = flip ? 63 - v : v, p = tb.g.b[sq], b = cells[v]; b.dataset.sq = sq;
      b.textContent = sqWords(sq) + ', ' + (p ? pieceWords(p) : 'empty') + (sq === sel ? ', picked up' : ''); }
  }

  // ------------------------------------------------ tapping the 3D board
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hit = new THREE.Vector3();
  let down = null;
  canvas.addEventListener('pointerdown', e => { if (mine) down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', e => {
    if (!mine || !down) return; const d = down; down = null;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12 || performance.now() - d.t > 700) return;
    const tb = myTb(), t = tb.t, r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    plane.set(new THREE.Vector3(0, 1, 0), -(t.y + t.boardY)); if (!ray.ray.intersectPlane(plane, hit)) return;
    const dx = hit.x - t.x, dz = hit.z - t.z, c = Math.cos(t.ry), s = Math.sin(t.ry), lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (Math.abs(lx) > 4 * t.sq || Math.abs(lz) > 4 * t.sq) { if (sel >= 0) { sel = -1; render(); } return; }
    const col = Math.max(0, Math.min(7, Math.floor(4 - lx / t.sq))), row = Math.max(0, Math.min(7, Math.floor(4 - lz / t.sq)));
    tap(row * 8 + col);
  });
  function tap(sq) {
    const tb = myTb(); if (!tb) return; const g = tb.g, p = g.b[sq];
    if (myTurn(tb) && sel >= 0 && g.moves(sel).some(m => m.to === sq)) { play(tb, sel, sq); return; }
    if (myTurn(tb) && p && colorOf(p) === mine.side) {
      sel = sq; const L = g.moves(sq); sfx('pick');
      speak(cap(PIECE_NAMES[typeOf(p)]) + ' on ' + sqWords(sq) + '. ' + (L.length ? 'It can go to ' + [...new Set(L.map(m => sqWords(m.to)))].join(', ') + '.' : 'It has no moves.'));
      render(); return;
    }
    if (sel >= 0) { sfx('bad'); sel = -1; render(); }
    speak(sqWords(sq) + ', ' + (p ? pieceWords(p) : 'empty') + '.' + (tb.mode !== 'idle' && !tb.over && !myTurn(tb) ? ' Waiting for ' + (tb.seat[g.turn] === 'cpu' ? 'the computer' : who(tb, g.turn)) + '.' : ''));
  }

  // ------------------------------------------------ playing
  function play(tb, from, to, by = myId, promo) {
    const m = tb.g.move({ from, to, promo }); if (!m) { sfx('bad'); return null; }
    sel = -1; tb.last = { from: m.from, to: m.to };
    if (net && myTb() === tb) net.event({ k: 'chs', a: 'mv', tb: tb.t.id, f: m.from, t: m.to, p: m.promo || '', fen: tb.g.fen(), cpu: by === 'cpu' ? 1 : 0 });
    after(tb, m); return m;
  }
  function after(tb, m) {
    const here = myTb() === tb, st = tb.g.status();
    if (!here) { draw3d(tb); }
    sfxNear(tb, m.flag === 'K' || m.flag === 'Q' ? 'castle' : m.cap ? 'capture' : 'move', { t: typeOf(m.piece) });
    const w0 = who(tb, m.color); let words = (w0 === 'You' ? '' : w0 + ': ') + moveWords(m) + '.';
    if (st.over) { tb.over = st; const w = st.winner ? who(tb, st.winner) : null;
      words += st.reason === 'checkmate' ? ' Checkmate. ' + (w === 'You' ? 'You win!' : w + ' wins.') : ' Draw: ' + st.reason + '.';
      if (here) setTimeout(() => sfx(!st.winner ? 'draw' : st.winner === mine.side ? 'win' : 'lose'), 350);
      if (here) words += ' Tap 1 player or 2 players to play again.';
    } else if (st.check) { words += ' Check.'; if (here) setTimeout(() => sfx('check'), 150); }
    if (here) { speak(words); render(); }
    if (!st.over && tb.mode === 'cpu' && here && tb.g.turn !== mine.side) cpuTurn(tb);
  }
  // sounds for people standing near a table they aren't playing at
  const sfxNear = (tb, n, o) => { if (myTb() === tb) { sfx(n, o); return; } const p = G.world.pos(); if (Math.hypot(p[0] - tb.t.x, p[2] - tb.t.z) < 10) sfx(n, o); };
  let worker = null, wid = 0; const pend = new Map();
  try { worker = new Worker(new URL('./chess-rules.js', import.meta.url), { type: 'module' }); worker.onmessage = e => { const f = pend.get(e.data.id); pend.delete(e.data.id); if (f) f(e.data.m); }; worker.onerror = () => { worker = null; }; } catch (e) { worker = null; }
  function cpuTurn(tb) {
    const gen = tb.gen, t0 = performance.now(); stat.textContent = 'The computer is thinking\u2026';
    const done = m => { if (gen !== tb.gen || myTb() !== tb || tb.over) return; setTimeout(() => { if (gen === tb.gen && m) play(tb, m.from, m.to, 'cpu', m.promo || undefined); }, Math.max(0, 800 - (performance.now() - t0))); };
    if (worker) { const id = ++wid, hist = []; for (const [k, n] of tb.g.reps) for (let i = 0; i < n; i++) hist.push(k); pend.set(id, done); worker.postMessage({ id, fen: tb.g.fen(), hist, level: CPU_LEVEL }); }
    else setTimeout(() => { const r = think(tb.g, CPU_LEVEL); done(r && { from: r.from, to: r.to, promo: r.promo }); }, 30);
  }
  function startGame(mode, quiet) {
    const tb = myTb(); if (!tb) return; const o = other(mine.side);
    tb.gen++; tb.g = new Chess(); tb.last = null; tb.over = null; tb.mode = mode; sel = -1; pendingInvite = null;
    if (mode === 'cpu') tb.seat[o] = 'cpu';
    if (!quiet && net) net.event({ k: 'chs', a: 'new', tb: tb.t.id, m: mode, me: mine.side });
    sfx('start');
    const opp = mode === 'cpu' ? 'the computer' : who(tb, o);
    speak((mode === 'cpu' ? '1 player. ' : '2 players. ') + 'You are ' + SIDE[mine.side] + ' against ' + opp + '. ' + (mine.side === 'w' ? 'Your move. Tap a piece on the table, then tap where it goes.' : cap(opp) + ' moves first.'));
    render();
    if (mode === 'cpu' && mine.side === 'b') cpuTurn(tb);
  }
  function twoPlayers() {
    const tb = myTb(); if (!tb) return; const fox = nearbyFox(tb); if (!fox) { speak('There is no fox near the table yet. Ask a friend to come over.'); return; }
    if (tb.seat[other(mine.side)] === fox) { startGame('pvp'); return; }
    pendingInvite = fox; if (net) net.event({ k: 'chs', a: 'inv', tb: tb.t.id, side: mine.side }, fox);
    speak('Asking ' + nameOf(fox) + ' to play.'); render();
    setTimeout(() => { if (pendingInvite === fox) { pendingInvite = null; if (mine) { speak(nameOf(fox) + ' did not answer.'); render(); } } }, 30000);
  }
  function resign() {
    const tb = myTb(); if (!tb || tb.mode === 'idle' || tb.over) return;
    tb.over = { over: true, winner: other(mine.side), reason: 'resigned' }; tb.gen++;
    if (net) net.event({ k: 'chs', a: 'rs', tb: tb.t.id });
    sfx('lose'); speak('You resigned. ' + who(tb, other(mine.side)) + ' wins.'); render();
  }
  function readBoard() {
    const tb = myTb(); if (!tb) return; const g = tb.g, list = { w: [], b: [] };
    for (const t of 'kqrbnp') for (let sq = 0; sq < 64; sq++) { const p = g.b[sq]; if (p && typeOf(p) === t) list[colorOf(p)].push(PIECE_NAMES[t] + ' ' + sqWords(sq)); }
    speak('White: ' + list.w.join(', ') + '. Black: ' + list.b.join(', ') + '.' + (tb.mode !== 'idle' && !tb.over ? ' ' + cap(SIDE[g.turn]) + ' to move.' : ''));
  }

  // ------------------------------------------------ the camera over your shoulder (fits the board on any screen)
  function shot(tb) {
    const t = tb.t, s = t.seats[mine.side], c = new THREE.Vector3(t.x, t.y + t.boardY, t.z), out = new THREE.Vector3(s.x - t.x, 0, s.z - t.z).normalize();
    const portraitPhone = camera.aspect < 1, phoneLand = !portraitPhone && innerHeight <= 500;
    const vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect * (phoneLand ? 0.62 : 1));
    const half = 0.56, d = Math.max(half / Math.tan(hf), half / Math.tan(vf) * (portraitPhone ? 1.35 : 1.15)) * 1.08, el = THREE.MathUtils.degToRad(phoneLand ? 58 : 62);
    const pos = c.clone().addScaledVector(out, d * Math.cos(el)).add(new THREE.Vector3(0, d * Math.sin(el), 0)), at = c.clone();
    if (phoneLand) { const side = new THREE.Vector3(out.z, 0, -out.x); const k = Math.tan(hf) * d * 0.36; pos.addScaledVector(side, -k); at.addScaledVector(side, -k); }   // (the bars sit on the left: slide the board right)
    if (portraitPhone) at.addScaledVector(out, 0.06);
    return [pos.toArray(), at.toArray()];
  }
  addEventListener('resize', () => setTimeout(() => { if (mine && G.camShot) G.camShot(...shot(myTb())); }, 120));

  // ------------------------------------------------ sitting down + standing up
  let guard = null, walking = null;
  function open(item = {}) {
    try { audio.unlock && audio.unlock(); } catch (e) {}
    if (item.seated) { if (mine) show(); return; }
    const tb = T[item.tb]; if (!tb) return;
    let side = item.side; const free = s => !tb.seat[s] || tb.seat[s] === myId;
    if (!free(side)) side = other(side);
    if (!free(side)) { speak('Both seats at ' + tb.t.name + ' are taken. Stand close by to watch the game.'); return; }
    const s = tb.t.seats[side], out = [s.x - tb.t.x, s.z - tb.t.z], ol = Math.hypot(...out) || 1, ax = s.x + out[0] / ol * 0.5, az = s.z + out[1] / ol * 0.5;
    const sitDown = () => {
      walking = null; if (!(G.sitting && G.sitting())) G.sit(s);
      mine = { tb: tb.t.id, side }; sel = -1; tb.seat[side] = myId;
      if (tb.mode === 'cpu' && tb.seat[other(side)] !== 'cpu') tb.mode = 'idle';
      if (net) { net.event({ k: 'chs', a: 'sit', tb: tb.t.id, s: side }); net.event({ k: 'chs', a: 'ask', tb: tb.t.id }); }
      if (G.camShot) G.camShot(...shot(tb));
      show();
      if (item.accept) { if (net) net.event({ k: 'chs', a: 'acc', tb: tb.t.id }, item.accept); speak('You sit down on the ' + SIDE[side] + ' side. ' + nameOf(item.accept) + ' is across from you.'); }
      else { const fox = nearbyFox(tb); speak('You sit down on the ' + SIDE[side] + ' side. Tap 1 player to play the computer' + (fox ? ', or 2 players to play ' + nameOf(fox) : '') + '.'); }
      clearInterval(guard); guard = setInterval(() => { if (mine && G.sitting && !G.sitting()) leave(false); if (mine && (tb.mode === 'idle' || tb.over)) { const f = !!nearbyFox(tb), was = bot.dataset.fox === '1'; if (f !== was) { bot.dataset.fox = f ? '1' : '0'; render(); } } }, 500);
    };
    if (G.camSave && !(G.sitting && G.sitting())) G.camSave();   // (the view you came in with: LEAVE goes back to it)
    if (G.walkToPoint && Math.hypot(G.world.pos()[0] - ax, G.world.pos()[2] - az) > 0.7) {
      walking = tb.t.id; G.walkToPoint(ax, az, why => { if (why === 'arrived' && walking === tb.t.id) sitDown(); else walking = null; });
    } else sitDown();
  }
  function show() { top.style.display = 'block'; bot.style.display = 'grid'; render(); }
  function leave(stand) {
    clearInterval(guard); top.style.display = 'none'; bot.style.display = 'none'; sel = -1; pendingInvite = null;
    if (!mine) return; const tb = myTb(), s = mine.side; mine = null;
    tb.seat[s] = null; if (tb.seat[other(s)] === 'cpu') tb.seat[other(s)] = null;
    if (tb.mode !== 'idle' && !tb.over) tb.over = { over: true, winner: null, reason: 'left' };
    tb.mode = 'idle'; tb.gen++; draw3d(tb);
    if (net) net.event({ k: 'chs', a: 'up', tb: tb.t.id });
    if (stand && G.sitting && G.sitting()) G.sit({ up: true });   // (stand first: standing up turns the camera, the release then puts your old view back)
    if (G.camRelease) G.camRelease();
    if (window.speechSynthesis) speechSynthesis.cancel();
    announce('You left ' + tb.t.name + '.');
  }

  // walking up to a stool: the ACTION button says PLAY CHESS
  G.world.addNear(Pl => {
    for (const tb of T) for (const s of ['w', 'b']) { const b = tb.t.seats[s];
      if (Math.hypot(Pl.x - b.x, Pl.z - b.z) < 1.35 && Math.abs(Pl.y - tb.t.y) < 1.5) return { kind: 'chess', item: { tb: tb.t.id, side: s, z: tb.t.id * 2 + (s === 'b' ? 1 : 0) }, label: 'Play chess \u00b7 ' + tb.t.name }; }
    return null;
  });

  // ------------------------------------------------ invitations
  function showInvite(id, tbId, side) {
    invitedBy = { id, tb: tbId, side };
    inv.querySelector('b').textContent = nameOf(id) + ' wants to play chess with you at ' + T[tbId].t.name + '.';
    inv.style.display = 'block'; speak(nameOf(id) + ' wants to play chess with you. Join, or no thanks?'); sfx('ui');
    inv.querySelector('.yes').focus();
  }
  inv.querySelector('.yes').onclick = () => { const I = invitedBy; inv.style.display = 'none'; invitedBy = null; if (!I) return; if (mine) leave(true); open({ tb: I.tb, side: other(I.side), accept: I.id }); };
  inv.querySelector('.no').onclick = () => { const I = invitedBy; inv.style.display = 'none'; invitedBy = null; if (I && net) net.event({ k: 'chs', a: 'dec', tb: I.tb }, I.id); };

  // ------------------------------------------------ other visitors
  const packSeat = (tb, s) => (tb.seat[s] === myId ? '@' : tb.seat[s]);
  function sync(tb, to) { if (net) net.event({ k: 'chs', a: 'sync', tb: tb.t.id, fen: tb.g.fen(), m: tb.mode, w: packSeat(tb, 'w'), b: packSeat(tb, 'b'), last: tb.last, over: tb.over ? 1 : 0 }, to); }
  function onEvent(id, d) {
    if (!d || d.k !== 'chs') return; const tb = T[d.tb]; if (!tb) return;
    const atThis = myTb() === tb;
    switch (d.a) {
      case 'sit': for (const s of ['w', 'b']) if (tb.seat[s] === id) tb.seat[s] = null;
        tb.seat[d.s === 'b' ? 'b' : 'w'] = id;
        if (atThis) { sync(tb, id); if (pendingInvite !== id) speak(nameOf(id) + ' sat down across from you.' + (tb.mode === 'idle' || tb.over ? ' Tap 2 players to play them.' : '')); render(); } break;
      case 'ask': if (atThis) sync(tb, id); break;
      case 'sync': {
        if (atThis && tb.mode !== 'idle' && !tb.over) break;   // (we are mid-game here: ours stands)
        try { tb.g = new Chess(d.fen); } catch (e) { break; }
        tb.mode = d.m || 'idle'; tb.last = d.last || null; tb.over = d.over ? { over: true } : null;
        for (const s of ['w', 'b']) { if (tb.seat[s] === myId) continue; const v = d[s]; tb.seat[s] = v === '@' ? id : v || null; }
        if (atThis) render(); else draw3d(tb); break; }
      case 'inv': if (!mine || myTb().mode === 'idle' || myTb().over) showInvite(id, d.tb, d.side === 'b' ? 'b' : 'w'); else if (net) net.event({ k: 'chs', a: 'dec', tb: d.tb, busy: 1 }, id); break;
      case 'acc': if (atThis && pendingInvite === id) startGame('pvp'); break;
      case 'dec': if (atThis && pendingInvite === id) { pendingInvite = null; speak(nameOf(id) + (d.busy ? ' is in another game.' : ' said no thanks.')); render(); } break;
      case 'new': tb.gen++; tb.g = new Chess(); tb.last = null; tb.over = null; tb.mode = d.m;
        tb.seat[d.me === 'b' ? 'b' : 'w'] = id; if (d.m === 'cpu') tb.seat[other(d.me)] = 'cpu';
        if (atThis && d.m === 'pvp') { sel = -1; sfx('start'); speak('2 players. ' + nameOf(id) + ' is ' + SIDE[d.me] + ', you are ' + SIDE[mine.side] + '. ' + (mine.side === 'w' ? 'Your move.' : nameOf(id) + ' moves first.')); render(); }
        else draw3d(tb); break;
      case 'mv': { if (atThis && tb.mode === 'cpu') break;
        const m = tb.g.move({ from: d.f, to: d.t, promo: d.p || undefined });
        if (!m) { try { tb.g = new Chess(d.fen); } catch (e) {} tb.last = { from: d.f, to: d.t }; if (atThis) render(); else draw3d(tb); break; }
        if (d.cpu) tb.seat[m.color] = 'cpu';
        tb.last = { from: m.from, to: m.to }; after(tb, m); break; }
      case 'rs': if (tb.mode === 'idle' || tb.over) break; tb.over = { over: true, reason: 'resigned' }; tb.gen++;
        if (atThis) { speak(nameOf(id) + ' resigned. You win!'); sfx('win'); render(); } break;
      case 'up': gone(id, tb); break;
    }
  }
  function gone(id, only) {
    if (invitedBy && invitedBy.id === id) { inv.style.display = 'none'; invitedBy = null; }
    if (pendingInvite === id) { pendingInvite = null; if (mine) render(); }
    for (const tb of only ? [only] : T) for (const s of ['w', 'b']) if (tb.seat[s] === id) {
      tb.seat[s] = null; if (tb.seat[other(s)] === 'cpu') tb.seat[other(s)] = null;
      const atThis = myTb() === tb;
      if (tb.mode !== 'idle' && !tb.over && (atThis || tb.mode === 'cpu')) { tb.over = { over: true, reason: 'left' }; tb.gen++; if (atThis) speak(nameOf(id) + ' left the table. Game over.'); }
      if (!atThis && tb.mode === 'cpu') tb.mode = 'idle';
      if (atThis) render();
    }
  }
  return { open, close: () => leave(true), onEvent, onLeave: id => gone(id), isOpen: () => !!mine, invite: showInvite };
}
