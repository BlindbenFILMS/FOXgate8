// s480 CINDER CANTINA DICE TABLES (Luxor Station): Liar's Dice + Shut the Box (minigames/parlor) in their WORLD MODE on the cantina's
// own round tables, as station console games. Walk onto the ring by a table → the lantern lifts off, the cups / box appear on the
// table top, the pilots step up round it, the camera eases into the game camera. Space reskin: theme 'cinder' (basalt felt, ember
// trim, obsidian cups), station pilots as rivals. Same save keys + rewards as every other parlor table (liarsDice.* / shutBox.*).
// Liar's Dice pad: ◀ − COUNT · + COUNT · ▲ NUMBER, 1 BID · 2 LIAR! · 3 SPOT ON (desktop arrows, 1/Enter, 2/L, 3/S).
// Shut the Box: tap the tiles on the table, 1 ROLL · 2 SHUT · 3 CLEAR (+ 1 OR 2 DICE when the 7-8-9 are down; desktop = the game's keys).
const FACE = ['', 'ONES', 'TWOS', 'THREES', 'FOURS', 'FIVES', 'SIXES'];
const RIVALS = {
  dice: { cpus: ['otto', 'marla', 'noble'], names: { otto: 'JO', marla: 'VOSS', noble: 'TAMSIN' } },
  box: { cpus: ['marla', 'otto'], names: { marla: 'REE', otto: 'GRIT' } } };
const LOOKS = [
  { key: 'lxPilotJo', torso: ['#f3f2f2', '#ec3013', '#7a1a10'], outfit: 'suit', look: { fur: '#e07a3a', furDark: '#9a4416' } },
  { key: 'lxPilotVoss', torso: ['#4a4e56', '#e8b42a', '#22252a'], outfit: 'coat', look: { fur: '#b8642e', furDark: '#6a3412' } },
  { key: 'lxPilotTam', torso: ['#2a3a6a', '#7fd8ff', '#121a34'], outfit: 'vest', look: { fur: '#d89a5a', furDark: '#8a5a2a' } }];

export function makeParlorConsole(K, { kind = 'dice', at, top = 1.045, yaw = 0, room, mkFox, animFox, scale, where, kicker = 'Cinder Cantina' }) {
  const { THREE } = K, D = kind === 'dice', RV = RIVALS[kind];
  const parent = new THREE.Group(); parent.position.set(at.x, top, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  const seatG = new THREE.Group(); seatG.position.set(at.x, 0, at.z); seatG.rotation.y = yaw; K.scene.add(seatG);
  const sx = Math.sin(yaw), sz = Math.cos(yaw), stand = { x: at.x + sx * 1.45, z: at.z + sz * 1.45, face: Math.atan2(-sx, -sz) };
  let g = null, h = null, open = false, loading = false, hidden = [], foxes = [], dq = 1, df = 2, seqSeen = -1;
  const R = { renderer: null, camera: null };
  const title = D ? "LIAR'S DICE" : 'SHUT THE BOX';
  async function make() { if (g || loading) return; loading = true;
    try { const mod = D ? await import(new URL('../minigames/parlor/liars-dice.js?v=s480', import.meta.url).href) : await import(new URL('../minigames/parlor/shut-the-box.js?v=s480', import.meta.url).href);
      const fn = D ? mod.createLiarsDice : mod.createShutTheBox;
      const gg = await fn({ container: null, theme: 'cinder', names: RV.names, onState: s => { h = s; }, opts: { inWorld: { renderer: R.renderer, camera: R.camera, parent, scale } } });
      if (!open) { try { gg.destroy(); } catch (e) {} } else { g = gg; h = g.hud(); } } catch (e) { console.warn('parlor table', e); }
    loading = false; }
  function hideProps() { const p = new THREE.Vector3(); hidden = [];
    if (room) room.traverse(o => { if (!o.visible || o === room || !(o.isMesh || o.isSprite)) return; o.getWorldPosition(p);
      if (Math.hypot(p.x - at.x, p.z - at.z) < 0.4 && p.y > top + 0.01 && p.y < top + 0.8) { hidden.push(o); o.visible = false; } }); }
  // the pilots round the table (seat k = the game's seat order, you at k = 0 on the near side)
  function seatFoxes() { const n = h && h.players ? h.players.length : 1;
    foxes.forEach((f, i) => { const on = i + 1 < n && !!h.players[i + 1] && !h.players[i + 1].gone; f.visible = on; if (!on) return;
      let x, z; if (D) { const a = Math.PI + ((i + 1) / n) * Math.PI * 2; x = Math.sin(a) * 1.25; z = -Math.cos(a) * 1.25; }
      else { const a = n === 2 ? 0 : (i === 0 ? -0.7 : 0.7); x = Math.sin(a) * 1.25; z = -Math.cos(a) * 1.25; }
      f.position.set(x, 0, z); f.rotation.y = Math.atan2(-x, -z); }); }
  function ensureFoxes() { if (foxes.length || !mkFox) return; for (const L of LOOKS) { try { const f = mkFox({ ...L, mood: 'neutral' }); f.visible = false; seatG.add(f); foxes.push(f); } catch (e) { console.warn(e); } } }
  function safe() { if (!g || !g.setSafe) return; const w = innerWidth, hh = innerHeight, phone = Math.min(w, hh) < 520, land = phone && w > hh;
    if (phone && !land) g.setSafe(108, 84, 0, 100); else if (land) g.setSafe(60, 100, 0, 0); else g.setSafe(72, 124, 0, 0); }
  const fl = () => h && h.flash ? h.flash.t : '';
  // ---------- Liar's Dice ----------
  function diceDraft() { if (!h || h.phase !== 'bid') return; if (h.seq !== seqSeen) { seqSeen = h.seq; dq = h.min.q; df = h.min.f; } }
  const bidOk = () => !h.bid || dq > h.bid.q || (dq === h.bid.q && df > h.bid.f);
  function diceHud() {
    if (h.phase === 'menu') return { card: { kicker, title: "Liar's Dice", body: 'Five dice under every cup. Bid how many of one number sit on the whole table. Ones are wild. Think a bid is too high? Call LIAR.', buttons: ['VS 1 PILOT', 'VS 2 PILOTS', 'VS 3 PILOTS', 'WATCH A DEMO ROUND', 'NOT NOW'] } };
    if (h.phase === 'end') return { card: { kicker, title: h.winMine ? 'You win the table' : h.winner + ' wins the table', mood: h.winMine ? 'The pilots push their cups across to you.' : 'Shake it off. The cups are still warm.',
      notes: [].concat(h.endGold ? ['+' + h.endGold + ' G'] : []).concat(h.endNote ? [h.endNote] : []).concat(['Tables won: ' + (h.wins || 0)]), buttons: ['PLAY AGAIN', 'NEW TABLE', 'LEAVE THE TABLE'] } };
    const me = h.players.find(p => p.me) || { n: 0 }, st = [['You', me.n + ' dice', me.n <= 1 ? '#ec3013' : null], ['Table', String(h.total)], ['Bid', h.bid ? h.bid.q + ' \u00d7 ' + h.bid.f : '-']];
    if (h.demo) return { stats: st, showStats: true, where: h.demo.cap || "Liar's Dice \u00b7 demo", noSticks: true };
    if (h.phase === 'reveal' && h.reveal) { const r = h.reveal, call = r.kind === 'spot' ? 'SPOT ON' : 'LIAR';
      const say = r.done ? (r.losers.length ? r.losers.join(' + ') + ' LOSE' + (r.losers.length > 1 ? '' : 'S') + ' A DIE' : '') + (r.gainer ? ' \u00b7 ' + r.gainer + ' GAINS ONE' : '') : r.caller + ' CALLS ' + call + ' ON ' + r.bid.q + ' \u00d7 ' + FACE[r.bid.f] + ' \u00b7 FOUND ' + r.shown;
      return { stats: st, showStats: true, where: fl() || say, noSticks: true }; }
    diceDraft(); const dice = h.myDice.length ? 'YOUR DICE ' + h.myDice.join(' ') : 'SHAKING\u2026';
    const say = fl() || (h.myTurn ? dice + ' \u00b7 ' + (h.bid ? h.bid.name + ' BID ' + h.bid.q + ' \u00d7 ' + FACE[h.bid.f] : 'MAKE THE FIRST BID') : dice + ' \u00b7 ' + h.turnName + ' IS THINKING\u2026');
    return { stats: st, showStats: true, where: say,
      pad: [{ k: 1, label: 'BID', sub: dq + ' \u00d7 ' + FACE[df] + (bidOk() ? '' : ' \u00b7 TOO LOW') }, { k: 2, label: 'LIAR!', sub: h.bid ? 'BLUFF?' : 'NO BID' }, { k: 3, label: 'SPOT ON', sub: 'EXACT' }],
      sticks: [['\u2212', 'COUNT', -1, 0], ['+', 'COUNT', 1, 0], ['\u25b2', 'NUMBER', 0, 1]] }; }
  function diceStep(x, y) { if (!h || !h.myTurn) return; const mf = h.minFace || 1;
    if (x) dq = Math.max(1, Math.min(h.total, dq + x)); if (y) df = df >= 6 ? mf : df + 1; g.sound && g.sound().ui && g.sound().ui(); }
  function dicePress(k) { if (!h) return; if (h.phase !== 'bid' || !h.myTurn) return;
    if (k === 1) g.input({ a: 'bid', q: dq, f: df }); else if (k === 2) g.input({ a: 'liar' }); else if (k === 3) g.input({ a: 'spot' }); }
  // ---------- Shut the Box ----------
  function boxHud() {
    if (h.phase === 'menu') return { card: { kicker, title: 'Shut the Box', body: 'Roll, then tap tiles that add up to the roll. Drop all nine and you shut the box. Lowest score after three rounds wins.', buttons: ['SOLO \u00b7 3 ROUNDS', 'VS 1 PILOT', 'VS 2 PILOTS', 'WATCH A DEMO', 'NOT NOW'] } };
    if (h.phase === 'end') { const mine = h.board && h.board[0] && h.board[0].me && !h.tie;
      return { card: { kicker, title: h.players.length === 1 ? 'Three rounds done' : mine ? 'You win the box' : h.tie ? 'A tie' : h.winner + ' wins the box', mood: h.board.map(b => b.name + ' ' + b.total).join(' \u00b7 '),
        notes: [].concat(h.endGold ? ['+' + h.endGold + ' G'] : []).concat(h.trophy ? ['TROPHY: FIRST SHUT BOX'] : []).concat(['Best round: ' + (h.best >= 0 ? h.best : '-') + ' \u00b7 Boxes shut: ' + (h.shuts || 0)]), buttons: ['PLAY AGAIN', 'NEW TABLE', 'LEAVE THE TABLE'] } }; }
    const me = h.players.find(p => p.me) || h.players[0], riv = h.players.filter(p => p !== me).slice(0, 2);
    const st = [['Round', h.round + ' / ' + h.rounds], ['You', String(me.total)]].concat(riv.map(p => [p.name, String(p.total)]));
    if (h.demo) return { stats: st, showStats: true, where: h.demo.cap || 'Shut the Box \u00b7 demo', noSticks: true };
    const A = h.active || {}; let say = '';
    if (h.phase === 'roll') say = A.mine ? 'YOUR ROLL \u00b7 TAP 1 ROLL' + (h.oneDie ? ' \u00b7 7 8 9 ARE DOWN: ONE DIE ALLOWED' : '') : A.name + ' ROLLS';
    else if (h.phase === 'pick') say = h.rolling ? 'ROLLING\u2026' : A.mine ? 'ROLLED ' + h.total + ' \u00b7 TAP TILES THAT ADD TO ' + h.total + ' (YOU HAVE ' + h.selSum + ')' : A.name + ' PICKS TILES\u2026';
    else if (h.phase === 'over' && h.res) say = h.res.shut ? h.res.name + ' SHUT THE BOX!' : h.res.name + ' IS STUCK \u00b7 ' + h.res.score + ' LEFT';
    else if (h.phase === 'round') say = 'ROUND ' + h.round + ' DONE';
    else if (h.rolling) say = 'ROLLING\u2026';
    return { stats: st, showStats: true, where: fl() || say,
      pad: [{ k: 1, label: 'ROLL', sub: h.oneDie ? (h.diceN === 1 ? 'ONE DIE' : 'TWO DICE') : 'TWO DICE' }, { k: 2, label: 'SHUT', sub: 'DROP TILES' }, { k: 3, label: 'CLEAR', sub: 'UNPICK' }],
      sticks: h.oneDie && A.mine ? [['\u2680', '1 OR 2 DICE', -1, 0]] : null, noSticks: !(h.oneDie && A.mine) }; }
  function boxPress(k) { if (!h) return;
    if (k === 1) { if (h.canRoll) g.input({ a: 'roll' }); else if (h.phase === 'over' || h.phase === 'round') g.input({ a: 'next' }); }
    else if (k === 2) { if (h.phase === 'pick') g.input({ a: 'shut' }); }
    else if (k === 3) { if (h.canClear) g.input({ a: 'clear' }); } }
  function boxStep(x) { if (x && h && h.oneDie && h.canRoll) g.input({ a: 'dice', n: h.diceN === 1 ? 2 : 1 }); }
  return {
    title, where: where || (D ? 'Cinder Cantina \u00b7 the dice table' : 'Cinder Cantina \u00b7 the tile table'), W: 200, H: 140, room,
    pad: [{ k: 1, label: D ? 'BID' : 'ROLL' }],
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand,
    attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(at.x + sx * 2.2, top + 1.6, at.z + sz * 2.2); lookTo.set(at.x, top, at.z); return 50; },
    begin() { open = true; h = null; seqSeen = -1; hideProps(); ensureFoxes(); make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; hidden.forEach(o => { o.visible = true; }); hidden = []; foxes.forEach(f => { f.visible = false; }); },
    tick(dt) { for (const o of hidden) o.visible = false; if (!g) return; safe(); seatFoxes();
      foxes.forEach((f, i) => { if (!f.visible) return; const p = h && h.players && h.players[i + 1], u = f.userData;
        u.mood = !p ? 'neutral' : h.phase === 'end' ? (h.winner === p.name ? 'happy' : 'sad') : p.turn || p.active ? 'determined' : p.out ? 'sad' : 'neutral';
        animFox && animFox(f, dt, 0); }); },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (!d || !g || !h) return; D ? dicePress(k) : boxPress(k); },
    padStick(x, y) { if (!g || !h || (!x && !y)) return; D ? diceStep(x, y) : boxStep(x); },
    key(e) { if (!g || !h || e.type !== 'keydown') return; if (/Arrow|Space/.test(e.code)) e.preventDefault();
      if (!D) { try { g.key(e); } catch (er) {} return; }
      const c = e.code; if (c === 'ArrowLeft') diceStep(-1, 0); else if (c === 'ArrowRight') diceStep(1, 0); else if (c === 'ArrowUp' || c === 'ArrowDown') diceStep(0, 1);
      else if (c === 'Digit1' || c === 'Enter' || c === 'Space') dicePress(1); else if (c === 'Digit2' || c === 'KeyL') dicePress(2); else if (c === 'Digit3' || c === 'KeyS') dicePress(3); },
    hud() { if (!g || !h) return { card: { kicker, title: loading ? 'Shaking the cups\u2026' : D ? "Liar's Dice" : 'Shut the Box', body: 'The pilots pull up round the table.', buttons: ['NOT NOW'] } };
      const o = D ? diceHud() : boxHud(); if (o.pad === undefined && !o.card) o.pad = null; return o; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /NOT NOW|LEAVE/.test(b)) return 'leave'; if (!g) return;
      try {
        if (/PLAY AGAIN/.test(b)) g.rematch();
        else if (/NEW TABLE/.test(b)) g.toMenu();
        else if (/DEMO/.test(b)) g.demoStart();
        else if (D) { const n = /3/.test(b) ? 3 : /2/.test(b) ? 2 : 1; g.start({ mode: 'cpu', n, cpus: RV.cpus.slice(0, n), opts: { wild: true, spot: true, start: 5 } }); }
        else if (/SOLO/.test(b)) g.start({ mode: 'solo', rounds: 3 });
        else { const n = /2/.test(b) ? 2 : 1; g.start({ mode: 'cpu', n, rounds: 3, cpus: RV.cpus.slice(0, n) }); }
        h = g.hud(); } catch (e) { console.warn(e); } },
  };
}
