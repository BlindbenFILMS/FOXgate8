// s482 THE CINDER KITCHEN (Luxor Station · Cinder Cantina): EMBER'S SKEWER HOUSE (minigames/skewer/skewer-house.js) in its WORLD MODE as a station
// console game. Chef EMBER (or the kitchen ring) → the cantina fades into the back kitchen (the Skewer House set) → the camera eases into the
// game camera → work a 3-minute shift: thread the ticket's pieces, roll the kabobs on the coals, plate, serve. SPACE RESKIN: station food names
// (LAVA LAMB, STARHEN, VOID CAP, SUNFRUIT; CINDER SHISH, HYDRO GARDEN, SUN WELL SKEWER, THE CAPSTONE…) and station pilots as customers.
// The game's own ticket row, station bar, plate buttons + grill meter are drawn here as a small DOM layer (inverted Modernist: ink ground,
// light text, 2px rules). Saves = the Skewer House's (skewer.house.*, flag skewerUniform).
const RESKIN = (m) => {
  Object.assign(m.ING.lamb, { name: 'LAVA LAMB' }); Object.assign(m.ING.chicken, { name: 'STARHEN' }); Object.assign(m.ING.mushroom, { name: 'VOID CAP' }); Object.assign(m.ING.pineapple, { name: 'SUNFRUIT' });
  const RN = { shish: 'CINDER SHISH', garden: 'HYDRO GARDEN', tikka: 'STARHEN TIKKA', sunset: 'SUN WELL SKEWER', ember: 'THE EMBER', works: 'THE CAPSTONE' }; m.RECIPES.forEach(r => { if (RN[r.id]) r.name = RN[r.id]; });
  const PIL = ['JO', 'VOSS', 'KEL', 'REE', 'GRIT', 'TAMSIN', 'ASH', 'DUNE', 'PYRE', 'NAHLA']; if (m.CUSTOMERS) m.CUSTOMERS.forEach((c, i) => { c.name = PIL[i % PIL.length]; });
  if (m.LINES) { m.LINES.order[2] = 'I could smell the coals from Berth One.'; m.LINES.happy[2] = 'Best skewers on the station!'; } };
const ZC = { LIGHT: '#e6b45a', MEDIUM: '#c27a32', WELL: '#a0602c', RAW: '#9ca3af', BURNT: '#ec3013' };

export function makeSkewerConsole(K, { at, yaw = 0, room, scene, where = 'Cinder Cantina \u00b7 the back kitchen', kicker = 'Cinder Cantina \u00b7 Chef Ember' }) {
  const { THREE } = K;
  const parent = new THREE.Group(); parent.position.set(at.x, 0, at.z); parent.rotation.y = yaw; K.scene.add(parent);
  let g = null, h = null, open = false, loading = false, bg0 = null, ui = null, uiSig = '';
  const R = { renderer: null, camera: null };
  async function make() { if (g || loading) return; loading = true;
    try { const mod = await import(new URL('../minigames/skewer/skewer-house.js?v=s482', import.meta.url).href); RESKIN(mod); if (!open) { loading = false; return; }
      const gg = await mod.createSkewerShift({ container: null, onState: s => { h = s; }, opts: { inWorld: { renderer: R.renderer, camera: R.camera, parent } } });
      if (!open) { try { gg.destroy(); } catch (e) {} } else { g = gg; h = g.hud(); } } catch (e) { console.warn('cinder kitchen', e); }
    loading = false; }
  // ---------- the DOM layer: tickets (tap = serve), the station bar, plate buttons, grill meter ----------
  const css = (el, s) => { el.style.cssText = s; return el; };
  const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
  function mountUi() { if (ui) return; ui = css(document.createElement('div'), 'position:fixed;inset:0;pointer-events:none;z-index:8;font-family:' + FONT + ';color:#f3f2f2');
    ui.innerHTML = '<div data-k="tix" style="position:absolute;left:8px;right:8px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px"></div>'
      + '<div data-k="meter" style="position:absolute;right:8px;width:min(240px,46vw);background:#201e1d;border:2px solid #f3f2f2;padding:8px 10px;box-sizing:border-box;display:none"></div>'
      + '<div data-k="plate" style="position:absolute;left:8px;width:min(340px,calc(100% - 16px));background:#201e1d;border:2px solid #f3f2f2;box-sizing:border-box;display:none;pointer-events:auto"></div>'
      + '<div data-k="bar" style="position:absolute;left:0;right:0;bottom:0;display:grid;background:#201e1d;border-top:2px solid #f3f2f2;padding-bottom:env(safe-area-inset-bottom);pointer-events:auto"></div>';
    document.body.appendChild(ui);
    ui.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || !g) return; e.stopPropagation(); const [a, v] = b.dataset.act.split(':');
      if (a === 'serve') g.serveOrder(+v); else if (a === 'focus') g.setFocus(v); else if (a === 'side') g.addSide(v); else if (a === 'bin') g.binPlate(); uiSig = ''; }); }
  function dropUi() { if (ui) ui.remove(); ui = null; uiSig = ''; }
  function drawUi() { if (!ui) return; const work = h && (h.phase === 'shift' || h.phase === 'glide') && !h.done; ui.style.display = work ? 'block' : 'none'; if (!work) return;
    const phone = Math.min(innerWidth, innerHeight) < 520, land = phone && innerWidth > innerHeight, top = (phone ? 52 : 60) + (phone && !land ? 40 : 0) + 6, mt = h.meter;
    const sig = JSON.stringify([h.orders.map(o => [o.id, o.status, Math.round(o.pat * 20), o.waiting]), h.focus, h.badges, h.plate, h.chopOn, mt && mt.sides && mt.sides.map(s => [Math.round(s.v), s.down]), mt && mt.flare, innerWidth, innerHeight]);
    if (sig === uiSig) return; uiSig = sig;
    const tix = ui.querySelector('[data-k=tix]'); tix.style.top = top + 'px'; tix.style.right = land && mt ? 'calc(min(240px,46vw) + 16px)' : '8px';
    tix.innerHTML = h.orders.slice(0, 3).map(o => { const ready = !!(h.plate && o.waiting && !h.demo), pc = o.pat < 0.3 ? '#ec3013' : o.pat < 0.6 ? '#ffd23a' : '#22c55e';
      return '<div data-act="serve:' + o.id + '" style="pointer-events:' + (ready ? 'auto' : 'none') + ';cursor:pointer;background:#201e1d;border:2px solid ' + (ready ? '#ec3013' : '#f3f2f2') + ';min-width:0;opacity:' + (o.waiting ? 1 : 0.75) + '">'
        + '<div style="padding:3px 6px;font:900 12px ' + FONT + ';letter-spacing:0.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:' + (ready ? '#ec3013' : 'transparent') + '">' + o.name + (ready ? ' \u00b7 SERVE' : '') + '</div>'
        + '<div style="height:5px;background:#3a3836"><div style="height:100%;width:' + Math.round(o.pat * 100) + '%;background:' + pc + '"></div></div>'
        + (land ? '' : '<div style="padding:2px 6px;font:800 11px ' + FONT + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + o.recipe + '</div>')
        + '<div style="padding:2px 6px 4px;display:flex;gap:2px">' + o.seq.map(p => '<span title="' + p.n + '" style="flex:1;height:' + (land ? 10 : 14) + 'px;background:' + p.col + ';border:1.5px solid #f3f2f2"></span>').join('') + '</div>'
        + '<div style="padding:2px 6px 4px;font:900 11px ' + FONT + ';color:' + (ZC[o.char] || '#fff') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + o.char + (o.glaze ? ' \u00b7 GLAZE' : '') + (o.sides.length ? ' + ' + o.sides.join(' + ') : '') + '</div></div>'; }).join('');
    const ids = [['all', 'ALL'], ['thread', 'THREAD'], ['grill', 'GRILL'], ['plate', 'PLATE']].concat(h.chopOn ? [['chop', 'CHOP']] : []), bar = ui.querySelector('[data-k=bar]');
    bar.style.gridTemplateColumns = 'repeat(' + ids.length + ',minmax(0,1fr))';
    bar.innerHTML = ids.map(([id, label]) => { const on = h.focus === id, b = (h.badges || {})[id] || '';
      return '<button data-act="focus:' + id + '" aria-label="Go to ' + label + '" style="min-height:56px;border:0;border-right:2px solid #3a3836;border-radius:0;background:' + (on ? '#f3f2f2' : '#201e1d') + ';color:' + (on ? '#201e1d' : '#f3f2f2') + ';text-align:left;padding:6px 8px;display:flex;flex-direction:column;justify-content:center;gap:2px;cursor:pointer;font-family:' + FONT + ';min-width:0">'
        + '<span style="font:900 14px ' + FONT + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + label + '</span><span style="font:800 10px ' + FONT + ';letter-spacing:0.06em;color:' + (on ? '#201e1d' : /FIRE|BURN|OUT/.test(b) ? '#ff9a8a' : '#ffd23a') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (b || (on ? 'VIEWING' : '\u00a0')) + '</span></button>'; }).join('');
    const pl = ui.querySelector('[data-k=plate]'); pl.style.bottom = (60 + 8) + 'px';
    if (h.plate && !h.react) { pl.style.display = 'block'; const sides = ['RICE', 'PITA'].filter(k => h.sides.includes(k));
      pl.innerHTML = '<div style="padding:6px 10px;font:900 13px ' + FONT + ';border-bottom:2px solid #f3f2f2">PLATE' + (h.plate.who ? ' \u00b7 FOR ' + h.plate.who + ' \u00b7 TAP THEIR TICKET' : ' \u00b7 NO TICKET') + '</div><div style="display:grid;grid-template-columns:repeat(' + (sides.length + 1) + ',minmax(0,1fr))">'
        + sides.map(k => { const on = h.plate.sides.includes(k); return '<button data-act="side:' + k.toLowerCase() + '" style="min-height:48px;border:0;border-right:2px solid #3a3836;border-radius:0;background:#201e1d;color:' + (on ? '#22c55e' : '#f3f2f2') + ';font:900 14px ' + FONT + ';text-align:left;padding:0 10px;cursor:pointer">' + (on ? '\u2713 ' : '+ ') + k + '</button>'; }).join('')
        + '<button data-act="bin" style="min-height:48px;border:0;border-radius:0;background:#201e1d;color:#ff9a8a;font:900 14px ' + FONT + ';text-align:left;padding:0 10px;cursor:pointer">BIN</button></div>'; }
    else pl.style.display = 'none';
    const me = ui.querySelector('[data-k=meter]'); me.style.top = land ? top + 'px' : ''; me.style.bottom = land ? '' : (60 + 8 + (h.plate ? 92 : 0)) + 'px';
    if (mt && !h.react) { me.style.display = 'block'; const want = mt.want || '';
      me.innerHTML = '<div style="font:900 12px ' + FONT + ';letter-spacing:0.04em;display:flex;justify-content:space-between;gap:6px"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">KABOB ' + mt.slot + ' \u00b7 ' + mt.name + '</span><span style="color:' + (ZC[want] || '#cfcac4') + '">' + (want ? 'WANTS ' + want : '') + '</span></div>'
        + mt.sides.map((sd, i) => '<div style="display:grid;grid-template-columns:58px minmax(0,1fr);gap:6px;align-items:center;margin-top:5px"><span style="font:800 10px ' + FONT + ';color:' + (sd.down ? '#ff9a5a' : '#cfcac4') + '">' + (sd.down ? '\u25bc COALS' : 'SIDE ' + (i + 1)) + '</span>'
          + '<div style="position:relative;height:12px;background:linear-gradient(90deg,#9ca3af 0 27%,#e6b45a 27% 44%,#c27a32 44% 60%,#7a4520 60% 78%,#ec3013 78%);border:1.5px solid #f3f2f2"><div style="position:absolute;top:-3px;bottom:-3px;width:3px;background:#f3f2f2;left:' + Math.min(100, sd.v / 110 * 100).toFixed(1) + '%"></div></div></div>').join('')
        + (mt.flare ? '<div style="margin-top:6px;font:900 12px ' + FONT + ';color:#ff9a8a">FIRE! TAP THE KABOB TO SPRITZ</div>' : ''); }
    else me.style.display = 'none'; }
  function introCard() { const d = h.day || 1;
    return { kicker, title: "Ember's Skewer House", body: 'Day ' + d + ' in the back kitchen. Thread the ticket, roll the kabobs on the coals, plate and serve. Menu: ' + (h.menu || []).map(r => r.name).join(', ') + '.', buttons: ['YES, PUT ME TO WORK!', 'WATCH A SHIFT FIRST', 'GOODBYE'] }; }
  function doneCard() { const d = h.done;
    return { kicker: 'Day ' + d.day + " \u00b7 Ember's Skewer House", title: d.eod ? 'Employee of the day' : 'Shift done', mood: 'Served ' + d.served + (d.lost ? ' \u00b7 ' + d.lost + ' walked out' : '') + ' \u00b7 average ' + d.avg + ' \u2605',
      notes: ['Wage ' + d.wage + ' G \u00b7 prices ' + d.earned + ' G \u00b7 tips ' + d.tips + ' G', '+' + d.total + ' G'].concat(d.unlock || []), buttons: ['ANOTHER SHIFT', 'LEAVE THE KITCHEN'] }; }
  return {
    title: "EMBER'S SKEWER HOUSE", where, W: 200, H: 140, hideRoom: true, room,
    surface: { c: new THREE.Vector3(at.x, -50, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: 1, h: 1 },
    stand: { x: at.x, z: at.z, face: yaw + Math.PI },
    attach(renderer, camera) { R.renderer = renderer; R.camera = camera; },
    camPose(camTo, lookTo, upTo) { upTo.set(0, 1, 0); const c = g && g.camera;
      if (c && c.position.lengthSq() > 0) { camTo.copy(c.position); lookTo.copy(c.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(c.quaternion)); return c.fov || 50; }
      camTo.set(at.x, 3, at.z + 6); lookTo.set(at.x, 1.2, at.z); return 52; },
    begin() { open = true; h = null; if (scene) { bg0 = scene.background; scene.background = new THREE.Color('#2a1408'); } mountUi(); make(); },
    end() { open = false; try { g && g.destroy(); } catch (e) {} g = null; h = null; dropUi(); if (scene && bg0) scene.background = bg0; },
    tick() { if (!g) return; if (g.setSafe) { const phone = Math.min(innerWidth, innerHeight) < 520; try { g.setSafe(phone ? 190 : 200, phone ? 70 : 80, 0, 0); } catch (e) {} } drawUi(); },
    down() {}, move() {}, up() {},
    hud() { if (!g || !h) return { card: { kicker, title: loading ? 'Lighting the coals\u2026' : "Ember's Skewer House", body: 'The cantina\u2019s back kitchen. Aprons on the hook.', buttons: ['GOODBYE'] } };
      if (h.done && h.phase === 'done') return { card: doneCard() };
      if (h.phase === 'intro' || h.phase === 'walk') return { card: introCard() };
      const m = Math.floor(h.left / 60), s = Math.floor(h.left % 60);
      const say = h.demo ? h.demo.cap : h.flash ? h.flash.txt : h.react ? (h.react.stars ? '\u2605'.repeat(h.react.stars) + (h.react.tip ? ' \u00b7 TIP +' + h.react.tip + ' G' : '') : 'REFUSED') : h.hint ? 'NEXT \u00b7 ' + h.hint.text : (h.say || '');
      return { stats: [['Day ' + h.day, m + ':' + String(s).padStart(2, '0'), h.left < 20 ? '#ec3013' : null], ['Earned', (h.earned + h.tips) + ' G'], ['Served', String(h.served) + (h.stars ? ' \u00b7 \u2605' + h.stars : '')]], showStats: true, where: say }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /GOODBYE|LEAVE/.test(b)) return 'leave'; if (!g) return;
      try { if (/WATCH/.test(b)) g.demoStart(); else g.startShift(); h = g.hud(); } catch (e) { console.warn(e); } },
  };
}
