// s489 THE BALCONY CLUBS (Deep Space Fox · Balcony): the Chess Club + Checkers Club (minigames/chess|checkers/*-club.js) in their WORLD
// MODE (opts.world, s102) on a club table on the balcony. The decor table hides while you play (the game sets its own table, board, pieces
// and the rival fox: PIP · ROOKIE, HOPE · CLUB, NOBLE · MASTER). Tap a piece, tap a square (the game owns the taps on the canvas).
// Pad 1 = HINT · 2 = UNDO · 3 = VIEW. Saves = the clubs' own (chessClub.* / checkersClub.*), shared with the Meru plaza tables.
const CFG = { chess: { path: '../minigames/chess/chess-club.js?v=s489', fn: 'createChessClub', title: 'CHESS CLUB', rules: 'Tap a piece, then a square. Checkmate wins. The Balcony plays for gold.' },
  checkers: { path: '../minigames/checkers/checkers-club.js?v=s489', fn: 'createCheckersClub', title: 'CHECKERS CLUB', rules: 'Tap a piece, then a square. Jumps are a must. Take every piece to win.' } };
export function makeBoardConsole(K, { game, at, y = 0, yaw = 0, decor = null, kicker = 'Deep Space Fox \u00b7 The Balcony' }) {
  const { THREE } = K, C = CFG[game];
  const parent = new THREE.Group(); parent.position.set(at.x, y, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  const sx = Math.sin(yaw), sz = Math.cos(yaw), stand = { x: at.x + sx * 2.3, z: at.z + sz * 2.3, face: yaw + Math.PI, y };
  let g = null, h = null, open = false, loading = false;
  const R = { renderer: null, camera: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL(C.path, import.meta.url).href);
      const gg = await mod[C.fn]({ container: null, onState: s => { h = s; }, opts: { world: { renderer: R.renderer, camera: R.camera, parent } } });
      if (!open) { try { gg.destroy(); } catch (e) {} } else { g = gg; if (decor) decor.visible = false; } } catch (e) { console.warn('balcony ' + game, e); }
    loading = false; }
  function safe() { if (!g || !g.setSafe) return; const phone = Math.min(innerWidth, innerHeight) < 520, port = innerWidth < innerHeight;
    g.setSafe({ top: phone && port ? 108 : phone ? 62 : 72, bottom: port ? (phone ? 96 : 110) : (phone ? 100 : 120), left: 0, right: port ? 112 : 0 }); }
  const menu = () => !h || h.phase === 'menu' || h.phase === 'room';
  return {
    title: C.title, where: 'The Balcony', W: 200, H: 140, hideFox: true,
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand, attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && !menu() && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(at.x + sx * 3.4, y + 2.6, at.z + sz * 3.4); lookTo.set(at.x, y + 0.9, at.z); return 50; },
    begin() { open = true; h = null; make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; if (decor) decor.visible = true; },
    tick() { if (g) safe(); },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (!d || !g || !h || h.phase !== 'play' || h.over) return; try { if (k === 1 && h.canHint) g.hint(); else if (k === 2 && h.canUndo) g.undo(); else if (k === 3) g.cycleView(); } catch (e) {} },
    key() {},
    hud() {
      if (!g || !h) return { card: { kicker, title: loading ? 'Setting the board\u2026' : C.title, body: 'A club table on the Balcony, Meru turning below.', buttons: ['GOODBYE'] } };
      if (menu()) { const O = h.opponents || []; return { card: { kicker, title: C.title + ' \u00b7 The Balcony', body: C.rules,
        buttons: O.map(o => 'VS ' + o.name + ' \u00b7 ' + o.tag + (o.gold ? ' \u00b7 ' + o.gold + ' G' : '')).concat(h.resume ? ['RESUME \u00b7 ' + h.resume.label] : [], ['GOODBYE']) } }; }
      if (h.promo) return { card: { kicker, title: 'Promote the pawn', body: 'Pick a piece.', buttons: ['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'] } };
      if (h.over) return { card: { kicker, title: h.over.title || 'Game over', mood: h.over.sub || '', notes: [h.over.record].concat(h.over.gold ? ['+' + h.over.gold + ' G'] : [], h.over.xp ? ['+' + h.over.xp + ' XP'] : []).filter(Boolean), buttons: ['REMATCH', 'NEW GAME', 'LEAVE THE TABLE'] } };
      const T = h.top || {}, B = h.bottom || {}, turnMine = h.turn === h.myColor;
      const stats = [[B.name || 'YOU', (B.sub || '').split(' \u00b7 ').pop(), turnMine ? '#ffd23a' : null], [T.name || 'RIVAL', (T.sub || '').split(' \u00b7 ')[0], !turnMine ? '#ffd23a' : null]];
      if (h.counts) stats.push(['Pieces', h.counts[h.myColor] + ' \u2013 ' + h.counts[h.myColor === 'w' ? 'b' : 'w']]);
      const where = h.flash ? h.flash.txt : h.say ? h.say.who + ': \u201C' + h.say.text + '\u201D' : h.thinking ? (T.name || 'RIVAL') + ' IS THINKING\u2026' : (h.status || '') + (h.check ? ' \u00b7 CHECK' : '') + (h.mustJump ? ' \u00b7 JUMP!' : '');
      return { stats, showStats: true, where, noSticks: true, pad: [{ k: 1, label: 'HINT', sub: h.hintBusy ? 'THINKING' : h.canHint ? 'BEST MOVE' : '\u2014' }, { k: 2, label: 'UNDO', sub: h.canUndo ? 'TAKE BACK' : '\u2014' }, { k: 3, label: 'VIEW', sub: (h.view || 'play').toUpperCase() }] }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /GOODBYE|LEAVE/.test(b)) return 'leave'; if (!g) return;
      try { if (/^RESUME/.test(b)) g.resume(); else if (/^VS /.test(b)) g.playCpu(i, 'w'); else if (/REMATCH/.test(b)) g.rematch(); else if (/NEW GAME/.test(b)) g.menu(); else if (/QUEEN|ROOK|BISHOP|KNIGHT/.test(b)) g.promote({ QUEEN: 'q', ROOK: 'r', BISHOP: 'b', KNIGHT: 'n' }[b]); } catch (e) { console.warn(e); } },
  };
}
