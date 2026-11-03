// s486 THE BENCH · DOMINOES (Kufa Station · Crew for Hire): the Dominoes Club (minigames/dominoes/dominoes-club.js) in its WORLD MODE on a
// crate table in front of the hands' bench. The hands are the rivals: BRIN · ROOKIE (deck hand), TOLL · CLUB (gunner), THE QUIET ONE ·
// MASTER (has not said a word). ALL FIVES to 100. Your tiles sit in a rack at the bottom (DOM, inverted Modernist): tap a tile, then tap a
// glowing end on the table (or the end buttons); pad 1 = DRAW / PASS / HINT. Saves = the Dominoes Club's (dominoesClub.*).
const RIVALS = { pip: { name: 'BRIN', who: 'Deck hand · nine years' }, hope: { name: 'TOLL', who: 'Gunner · counts like he aims' }, noble: { name: 'THE QUIET ONE', who: 'Has not said a word' } };

export function makeDominoesConsole(K, { at, yaw = 0, top = 0.92, where = 'Crew for Hire \u00b7 the bench', kicker = 'Kufa Station \u00b7 Crew for Hire', rivals = RIVALS, place = 'KUFA STATION', title = 'DOMINOES \u00b7 THE BENCH', intro = 'The hands clear a crate for a game.', menuTitle = 'Dominoes on the bench', hideFox = false }) {
  const { THREE } = K;
  const parent = new THREE.Group(); parent.position.set(at.x, top, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  const sx = Math.sin(yaw), sz = Math.cos(yaw), stand = { x: at.x + sx * 1.3, z: at.z + sz * 1.3, face: yaw + Math.PI };
  let g = null, h = null, open = false, loading = false, ui = null, sig = '';
  const R = { renderer: null, camera: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/dominoes/dominoes-club.js?v=s486' + (place === 'KUFA STATION' ? '' : '&at=' + encodeURIComponent(place)), import.meta.url).href);
      const gg = await mod.createDominoesClub({ container: null, onState: s => { h = s; }, opts: { inWorld: { renderer: R.renderer, camera: R.camera, parent, scale: 0.5, place } } });
      if (!open) { try { gg.destroy(); } catch (e) {} } else { g = gg; (g.OPPONENTS || []).forEach(o => { if (rivals[o.id]) Object.assign(o, rivals[o.id]); }); h = g.state(); } } catch (e) { console.warn('kufa dominoes', e); }
    loading = false; }
  // ---------- the rack (DOM) ----------
  const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
  function mountUi() { if (ui) return; ui = document.createElement('div'); ui.style.cssText = 'position:fixed;left:0;right:0;bottom:0;pointer-events:none;z-index:8;font-family:' + FONT + ';color:#f3f2f2';
    document.body.appendChild(ui); ui.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || !g) return; e.stopPropagation(); const [a, v] = b.dataset.act.split(':'); if (a === 'tile') g.pickTile(+v); else if (a === 'arm') g.placeAt(v); sig = ''; }); }
  function dropUi() { if (ui) ui.remove(); ui = null; sig = ''; }
  function drawUi() { if (!ui) return; const on = h && h.phase === 'play' && !h.over && !h.hand && h.rack && h.rack.length; ui.style.display = on ? 'block' : 'none'; if (!on) return;
    const phone = Math.min(innerWidth, innerHeight) < 520, port = innerWidth < innerHeight, tw = phone ? 44 : 54, padR = port ? 110 : 0;
    const s2 = JSON.stringify([h.rack.map(r => [r.id, r.ok, r.sel]), h.choices, h.myTurn, innerWidth, innerHeight]); if (s2 === sig) return; sig = s2;
    const img = r => /^\s*</.test(r.img) ? r.img : '<img alt="" src="' + r.img + '" style="width:100%;height:100%;display:block">';
    ui.innerHTML = (h.choices && h.choices.length ? '<div style="display:flex;gap:6px;padding:0 8px 6px;flex-wrap:wrap;pointer-events:auto">' + h.choices.map(c => '<button data-act="arm:' + c.arm + '" style="min-height:48px;padding:0 14px;border:2px solid #f3f2f2;border-radius:0;background:#ec3013;color:#f3f2f2;font:900 15px ' + FONT + ';text-align:left;cursor:pointer">' + c.where + ' \u00b7 ' + c.v + (c.pts ? ' \u00b7 +' + c.pts : '') + '</button>').join('') + '</div>' : '')
      + '<div style="background:#201e1d;border-top:2px solid #f3f2f2;padding:8px ' + (8 + padR) + 'px calc(8px + env(safe-area-inset-bottom)) 8px;display:flex;align-items:center;gap:6px;pointer-events:auto;overflow-x:auto">'
      + '<span style="font:800 11px ' + FONT + ';letter-spacing:0.1em;color:#ffd23a;writing-mode:vertical-rl;transform:rotate(180deg);flex:none">' + (h.myTurn ? 'YOUR TURN' : 'YOUR TILES') + '</span>'
      + h.rack.map(r => '<button data-act="tile:' + r.id + '" aria-label="' + r.label + '" style="flex:none;width:' + tw + 'px;height:' + (tw * 2) + 'px;padding:2px;border:3px solid ' + (r.sel ? '#ffd23a' : r.ok ? '#22c55e' : '#3a3836') + ';border-radius:0;background:#f3f2f2;cursor:pointer;transform:translateY(' + (r.sel ? -8 : 0) + 'px);opacity:' + (h.myTurn && !r.ok ? 0.55 : 1) + '">' + img(r) + '</button>').join('') + '</div>'; }
  function safe() { if (!g || !g.setSafe) return; const phone = Math.min(innerWidth, innerHeight) < 520, port = innerWidth < innerHeight; g.setSafe({ top: phone && port ? 108 : phone ? 60 : 72, bottom: (phone ? 104 : 124) + (h && h.choices && h.choices.length ? 56 : 0), left: 0, right: port ? 110 : 0 }); }
  const names = () => (g && g.OPPONENTS || []);
  return {
    title, where, hideFox, W: 200, H: 140,
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand, attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(stand.x + sx * 0.6, 2.4, stand.z + sz * 0.6); lookTo.set(at.x, top, at.z); return 50; },
    begin() { open = true; h = null; mountUi(); make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; dropUi(); },
    tick() { if (!g) return; if (g.state) h = g.state() || h; safe(); drawUi(); },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (!d || !g || !h || k !== 1) return; if (h.canDraw) g.draw(); else if (h.canPass) g.pass(); else if (h.canHint) g.hint(); },
    key(e) { try { g && g.key(e); } catch (er) {} },
    hud() { if (!g || !h) return { card: { kicker, title: loading ? 'Shuffling the tiles\u2026' : 'Dominoes', body: intro, buttons: ['GOODBYE'] } };
      if (h.phase === 'menu') { const O = names(); const nm = id => (O.find(o => o.id === id) || {}).name || id;
        return { card: { kicker, title: menuTitle, body: 'ALL FIVES to 100: when the open ends add up to 5, 10, 15 or 20, you score it. Tap a tile, then a glowing end.', buttons: ['VS ' + nm('pip') + ' \u00b7 ROOKIE', 'VS ' + nm('hope') + ' \u00b7 CLUB', 'VS ' + nm('noble') + ' \u00b7 MASTER', 'VS ALL THREE', 'GOODBYE'] } }; }
      if (h.over) return { card: { kicker, title: h.over.title || 'Match over', mood: h.over.sub || '', notes: (h.over.rows || []).map(r => r.name + ' \u00b7 ' + r.score + (r.win ? ' \u00b7 WINS' : '')).concat(h.over.gold ? ['+' + h.over.gold + ' G'] : []), buttons: ['REMATCH', 'NEW TABLE', 'LEAVE THE TABLE'] } };
      if (h.hand) return { card: { kicker, title: h.hand.title, mood: h.hand.sub || '', notes: (h.hand.rows || []).map(r => r.name + ' \u00b7 ' + r.score + (r.pts ? ' (' + r.pts + ')' : '')), buttons: ['NEXT HAND', 'LEAVE THE TABLE'] } };
      const st = (h.players || []).slice(0, 4).map(p => [p.me ? 'You' : p.name.split(' ').pop(), String(p.score), p.active ? '#ffd23a' : null]);
      const say = h.flash ? h.flash.txt : h.say ? h.say.who + ': \u201C' + h.say.text + '\u201D' : (h.status || '') + (h.count != null ? ' \u00b7 ENDS ' + h.count : '');
      const pad = h.canDraw ? [{ k: 1, label: 'DRAW', sub: 'BONEYARD ' + h.boneN }] : h.canPass ? [{ k: 1, label: 'PASS', sub: 'KNOCK' }] : h.canHint ? [{ k: 1, label: 'HINT', sub: 'BEST MOVE' }] : null;
      return { stats: st, showStats: true, where: say, pad, noSticks: true }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /GOODBYE|LEAVE/.test(b)) return 'leave'; if (!g) return;
      try { if (/REMATCH/.test(b)) g.rematch(); else if (/NEW TABLE/.test(b)) g.menu(); else if (/NEXT HAND/.test(b)) g.nextHand(); else { try { g.setGameMode('fives'); g.setTarget(100); } catch (e) {} if (/ALL THREE/.test(b)) g.playCpu(['pip', 'hope', 'noble']); else if (/ROOKIE/.test(b)) g.playCpu(['pip']); else if (/CLUB/.test(b)) g.playCpu(['hope']); else if (/MASTER/.test(b)) g.playCpu(['noble']); } h = g.state(); } catch (e) { console.warn(e); } },
  };
}
