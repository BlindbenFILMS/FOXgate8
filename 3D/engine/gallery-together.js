// Blind Canvas gallery: visiting together.
//  • Tours: lead a tour from the menu; everyone gets a "Follow" invite and their fox walks your path behind you
//    (any visitor can also be followed, or jumped to, from the menu's list of who's here).
//  • Watch parties: in any room with a film, "Watch together" restarts it for everyone in that room, in sync;
//    people elsewhere get an invite that takes them there.
//  • The Six Views wall is shared: when anyone changes the severity at a kiosk, everyone's wall changes.
// Messages travel on the gallery-net 'ev' channel: { k: 'tour' | 'wp' | 'sev', ... }.

const FILM_NAMES = {
  bcp_teaser: 'the main screen', bcp_ora_film: 'the film behind the main screen', blindcan_capitol: 'the welcome screen', stevie_wonder: 'the Stevie Wonder film',
  amb: 'the Academy of Music film', ben_fox: "Ben's interview", april_melissa: "April & Melissa's interview", blindness_simulator: 'the blindness simulator',
  goalball: 'the goalball film', morten_meditate: 'the meditation with Morten',
};
const filmName = u => { const b = String(u || '').split('/').pop().split('?')[0].replace(/\.\w+$/, ''); return FILM_NAMES[b] || (/^[a-z_]+$/.test(b) ? b.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'the film here'); };

export function setupTogether({ G, net, nameOf, announce, onSev = () => {}, esc }) {
  const fname = u => (G.campus && G.campus.zone() === 'cinema') ? '\u201c' + G.campus.nowShowing() + '\u201d in the cinema' : filmName(G.film.local(u));   // (in BLIND CAN CINEMA: the film's title)
  const css = document.createElement('style');
  css.textContent = `
  #together{position:fixed;z-index:10;left:calc(12px + env(safe-area-inset-left));top:calc(94px + env(safe-area-inset-top));width:min(340px,calc(100vw - 24px));display:flex;flex-direction:column;gap:6px;pointer-events:none;font-family:Archivo,Arimo,Helvetica,Arial,sans-serif}
  #together .tg{pointer-events:auto;background:rgba(20,19,18,.92);color:#f3f2f2;border-left:4px solid #ec3013;padding:8px 10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font:600 12px/1.3 inherit}
  #together .tg .x{flex:1 1 140px;min-width:0}
  #together .tg .x b{display:block;font:800 10px/1.2 inherit;letter-spacing:.14em;text-transform:uppercase;color:#ff9783;margin-bottom:2px}
  #together .tg button{min-height:40px;padding:0 12px;background:transparent;color:#f3f2f2;border:2px solid #f3f2f2;font:800 11px/1 inherit;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
  #together .tg button.p{background:#ec3013;border-color:#ec3013}
  #together .tg button.c{min-width:40px;padding:0;border-color:transparent;font-size:15px}
  #together .tg.go{animation:tgIn .35s ease-out}
  @keyframes tgIn{from{transform:translateX(-12px);opacity:0}to{transform:none;opacity:1}}
  @media (prefers-reduced-motion:reduce){#together .tg.go{animation:none}}`;
  document.head.appendChild(css);
  const bar = document.createElement('div'); bar.id = 'together'; bar.setAttribute('aria-live', 'polite'); document.body.appendChild(bar);

  const tour = { leading: false, followers: new Set(), from: null };   // from: whose tour I'm following
  let party = null;            // { host: 'me' | id, u, joined, left }
  let invites = [];            // { key, from, text, title, btn, act, until }
  let lastSev = null;
  const noWatch = new Set();   // films whose 'Watch together' offer was dismissed (never offered in the cinema: it runs on showtimes, everyone's already in sync)
  // group vision: me showing everyone (gv), or me seeing through someone else's eyes (gview)
  const COND = { rp: 'Tunnel vision (RP)', cataracts: 'Cataracts', amd: 'Macular degeneration', floaters: 'Floaters (diabetic retinopathy)', glaucoma: 'Glaucoma' };
  const gv = { on: false, cond: 'rp', sev: 0.6, t: 0 };
  let gview = null; const optOut = new Set();
  // host mode: null, 'me' or a visitor's id
  let host = null, spotOn = false;
  const privateRoom = !!new URLSearchParams(location.search).get('room');
  const slotOf = id => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 12; };          // last severity anyone set this visit (sent to people who arrive later)
  const now = () => performance.now();

  // ------------------------------------------------ the bar
  function row(title, text, buttons, cls = '') {
    const d = document.createElement('div'); d.className = 'tg ' + cls;
    d.innerHTML = `<div class="x"><b>${esc(title)}</b>${esc(text)}</div>`;
    for (const [label, fn, k] of buttons) { const b = document.createElement('button'); b.textContent = label; if (k) b.className = k; if (k === 'c') b.setAttribute('aria-label', 'Dismiss'); b.onclick = fn; d.appendChild(b); }
    return d;
  }
  let shown = '';
  function render(force) {
    if (force) shown = '';
    invites = invites.filter(i => i.until > now());
    const rows = [], sig = [];
    const fid = G.following();
    if (fid) { const nm = nameOf(fid); rows.push(row(tour.from === fid ? 'On ' + nm + "'s tour" : 'Following', tour.from === fid ? 'Your fox walks behind ' + nm + '. Move to stop.' : nm + ' · move to stop', [['Stop', () => G.unfollow(), '']])); sig.push('f' + fid); }
    if (host === 'me') {
      const L = window.LIVE, liveBtns = !L ? [] : L.on() ? [['⏹ Stop live ' + (L.kind() === 'screen' ? 'screen' : 'camera'), () => { L.stop(); render(true); }, 'p']]
        : [['📷 Camera on screen', () => L.start('cam').then(() => render(true)), ''], ...(L.canShare ? [['🖥 Share screen', () => L.start('screen').then(() => render(true)), '']] : [])];
      rows.push(row("You're the host", G.remote.count() ? 'Your tools for this visit' : 'Waiting for guests', [['Gather everyone', () => gather(), 'p'], ['Mute all mics', () => muteAll(), ''], [spotOn ? '🔊 Spotlight on' : '🔊 Spotlight my voice', () => spotlight(!spotOn), spotOn ? 'p' : ''], ...liveBtns]));
      sig.push('h' + spotOn + (G.remote.count() > 0) + (L && L.on() ? L.kind() : '-'));
    }
    if (gview) { rows.push(row("Seeing through " + nameOf(gview.from) + "'s eyes", (COND[gview.cond] || '') + ' · ' + Math.round(gview.sev * 100) + '%', [['Stop', () => { optOut.add(gview.from); endGuest(); }, '']])); sig.push('g' + gview.from + gview.cond + Math.round(gview.sev * 20)); }
    if (tour.leading) { const n = tour.followers.size; rows.push(row("You're leading a tour", n ? n + (n === 1 ? ' fox is' : ' foxes are') + ' following you' : 'Waiting for people to follow', [['End tour', () => leadTour(false), 'p']])); sig.push('t' + n); }
    const film = G.film.url();
    if (party && party.host === 'me') { rows.push(row('Watch party · you are hosting', fname(party.u), [['From the start', () => { G.film.seek(party.u, 0); hostSync(); }, ''], ['End', () => endParty(), 'p']])); sig.push('ph'); }
    else if (party && party.joined && film === party.u) { rows.push(row('Watch party · in sync', 'with ' + nameOf(party.host) + ' · ' + fname(party.u), [['Leave', () => { party.joined = false; party.left = true; render(); }, '']])); sig.push('pj' + party.host); }
    else if (film && G.remote.count() > 0 && !(party && party.u === film) && !noWatch.has(film) && !(G.campus && G.campus.zone() === 'cinema')) { rows.push(row('Watch together', 'Restart ' + fname(film) + ' for everyone, in sync', [['▶ Start', () => startParty(), 'p'], ['✕', () => { noWatch.add(film); render(); }, 'c']])); sig.push('pw' + film); }
    for (const i of invites) { rows.push(row(i.title, i.text, [[i.btn, () => { invites = invites.filter(x => x !== i); i.act(); render(); }, 'p'], ['✕', () => { invites = invites.filter(x => x !== i); render(); }, 'c']], 'go')); sig.push('i' + i.key); }
    const k = sig.join('|') + '|' + (fid ? nameOf(fid) : '');
    if (k === shown) return; shown = k;
    bar.replaceChildren(...rows);
  }
  const invite = (key, from, title, text, btn, act) => { invites = invites.filter(i => i.key !== key); invites.push({ key, from, title, text, btn, act, until: now() + 30000 }); render(); };

  // ------------------------------------------------ tours
  function leadTour(on) {
    if (on === tour.leading) return;
    tour.leading = on; if (!on) tour.followers.clear();
    net.event({ k: 'tour', a: on ? 'on' : 'off' });
    announce(on ? 'You are leading a tour. Everyone here has been invited to follow you.' : 'Tour ended.');
    render();
  }
  function follow(id, onTour) {
    const nm = nameOf(id);
    const ok = G.follow(id, why => {
      if (tour.from === id) net.event({ k: 'tour', a: 'leave' }, id);
      tour.from = null;
      announce(why === 'moved' ? 'Stopped following ' + nm + '.' : why === 'left' ? nm + ' left, so you stopped following.' : why === 'ended' ? nm + "'s tour ended." : 'Stopped following ' + nm + '.');
      render();
    });
    if (!ok) { announce(nm + ' is still arriving. Try again in a moment.'); return; }
    if (onTour) { tour.from = id; net.event({ k: 'tour', a: 'join' }, id); }
    announce('Following ' + nm + '. Your fox walks behind them; move to stop.');
    render();
  }
  function goTo(id) { if (G.goTo(id)) announce('You are next to ' + nameOf(id) + '.'); }

  // ------------------------------------------------ watch parties
  let syncT = 0;
  function hostSync(to) { if (party && party.host === 'me') net.event({ k: 'wp', a: 'sync', u: party.u, t: G.film.time() }, to); }
  function startParty() {
    const u = G.film.url(); if (!u) return;
    party = { host: 'me', u, joined: true };
    G.film.seek(u, 0); hostSync(); syncT = 0;
    announce('Watch party started: ' + fname(u) + ' is playing from the start for everyone here.');
    render();
  }
  function endParty(silent) { if (!party) return; if (party.host === 'me') net.event({ k: 'wp', a: 'end', u: party.u }); party = null; if (!silent) announce('Watch party ended.'); render(); }

  // ------------------------------------------------ incoming
  function onEvent(id, d) {
    if (!d || typeof d !== 'object') return;
    const nm = nameOf(id);
    if (d.k === 'tour') {
      if (d.a === 'on') invite('tour' + id, id, nm + ' is leading a tour', 'Your fox can follow them round the gallery', 'Follow ' + nm, () => follow(id, true));
      else if (d.a === 'off') { invites = invites.filter(i => i.key !== 'tour' + id); if (G.following() === id && tour.from === id) { G.unfollow(); announce(nm + "'s tour ended."); } render(); }
      else if (d.a === 'join' && tour.leading) { tour.followers.add(id); announce(nm + ' is following your tour.'); render(); }
      else if (d.a === 'leave') { tour.followers.delete(id); render(); }
    } else if (d.k === 'wp') {
      if (d.a === 'end') { if (party && party.host === id) { party = null; announce(nm + ' ended the watch party.'); } invites = invites.filter(i => i.key !== 'wp' + id); render(); return; }
      if (d.a !== 'sync' || typeof d.u !== 'string') return;
      if (party && party.host === 'me') { if (d.u === party.u) endParty(true); else return; }   // someone else started one on the same film: theirs wins
      const fresh = !party || party.host !== id || party.u !== d.u;
      if (fresh) party = { host: id, u: d.u, joined: false, left: false };
      if (!party.joined && !party.left && G.film.url() === d.u) { party.joined = true; announce('Watch party: ' + fname(d.u) + ' is now in sync with ' + nm + '.'); }
      if (fresh && !party.joined) invite('wp' + id, id, nm + ' started a watch party', fname(d.u), 'Join', () => { party.joined = true; party.left = false; goTo(id); });
      if (party.joined && G.film.url() === d.u) { const target = (+d.t || 0) + 0.15, drift = G.film.time() - target; if (!G.film.ready() || Math.abs(drift) > 0.8) G.film.seek(d.u, target); }
      render();
    } else if (d.k === 'gvis') {
      if (d.a === 'off') { optOut.delete(id); if (gview && gview.from === id) { endGuest(); announce(nm + ' stopped sharing their view.'); } return; }
      if (d.a !== 'on' || !COND[d.cond] || optOut.has(id)) return;
      const r = G.remote.list().find(p => p.id === id), me = G.localState();
      const near = r && Math.hypot(r.x - me[0], r.z - me[2]) < 35 && Math.abs(r.y - me[1]) < 4;
      if (!near) { if (gview && gview.from === id) endGuest(); return; }
      if (gview && gview.from !== id) return;   // already seeing through someone else's eyes
      if (G.vision.overlay.guestView(d.cond, d.sev, nm)) {
        if (!gview) announce('You are now seeing through ' + nm + "'s eyes: " + COND[d.cond] + '. Tap Stop to see normally.');
        gview = { from: id, cond: d.cond, sev: Math.max(0, Math.min(1, +d.sev || 0.6)), until: now() + 12000 };
      }
      render();
    } else if (d.k === 'host') {
      if (d.a === 'on') {
        if (host === 'me') { if (String(net.id) < String(id)) { net.event({ k: 'host', a: 'on' }, id); return; } announce(nm + ' is the host now.'); spotOn = false; }
        if (host !== id) announce(nm + ' is hosting this visit.');
        host = id;
      } else if (d.a === 'off') { if (host === id) { host = null; if (window.VOICE) window.VOICE.setSpotlight(id, false); announce(nm + ' stopped hosting.'); } }
      else if (host !== id) return;   // only the host can do the rest
      else if (d.a === 'gather') {
        if (privateRoom) { if (G.goTo(id, slotOf(net.id))) announce(nm + ' gathered everyone together.'); }
        else invite('gather' + id, id, nm + ' is gathering everyone', 'Join the group', 'Go', () => G.goTo(id, slotOf(net.id)));
      } else if (d.a === 'mute') { if (window.VOICE && window.VOICE.mineOn()) window.VOICE.turnOff("The host turned everyone's mic off. You can turn yours back on."); }
      else if (d.a === 'spot') { if (window.VOICE) window.VOICE.setSpotlight(id, !!d.on); announce(d.on ? nm + "'s voice is in the spotlight: you'll hear them anywhere in the gallery." : nm + "'s voice is back to normal."); }
      render();
    } else if (d.k === 'sev') {
      const v = Math.max(0, Math.min(100, Math.round(+d.v)));
      if (!Number.isFinite(v)) return;
      lastSev = v; onSev(v, nm);
    }
  }
  // ------------------------------------------------ group vision
  function shareVision(on, cond, sev) {
    const was = gv.on; gv.on = on; gv.cond = cond; gv.sev = sev; gv.t = 0;
    net.event(on ? { k: 'gvis', a: 'on', cond, sev } : { k: 'gvis', a: 'off' });
    if (on && !was) announce('Everyone near you now sees through these eyes. Change the condition or severity and they change too.');
    if (!on && was) announce('Stopped showing everyone.');
    render();
  }
  function endGuest() { gview = null; G.vision.overlay.guestEnd(); render(); }
  // ------------------------------------------------ host mode
  function claimHost(on) {
    if (on && host && host !== 'me') { announce(nameOf(host) + ' is already hosting.'); return; }
    if (on) { host = 'me'; net.event({ k: 'host', a: 'on' }); announce("You're the host. Gather everyone, mute all mics or put your voice in the spotlight from the bar under the room name."); }
    else if (host === 'me') { if (window.LIVE && window.LIVE.on()) window.LIVE.stop(); if (spotOn) spotlight(false); host = null; net.event({ k: 'host', a: 'off' }); announce('You stopped hosting.'); }
    render();
  }
  function gather() { net.event({ k: 'host', a: 'gather' }); announce(privateRoom ? 'Everyone is coming to you.' : 'Everyone has been invited to come to you.'); }
  function muteAll() { net.event({ k: 'host', a: 'mute' }); announce("Everyone else's mic is off."); }
  function spotlight(on) { spotOn = on; net.event({ k: 'host', a: 'spot', on }); announce(on ? 'Your voice is in the spotlight: everyone hears you anywhere in the gallery. Turn your mic on to talk.' : 'Spotlight off.'); render(); }

  function onNewPeer(id) {
    if (host === 'me') { net.event({ k: 'host', a: 'on' }, id); if (spotOn) net.event({ k: 'host', a: 'spot', on: true }, id); }
    if (gv.on) net.event({ k: 'gvis', a: 'on', cond: gv.cond, sev: gv.sev }, id);
    if (tour.leading) net.event({ k: 'tour', a: 'on' }, id);
    if (party && party.host === 'me') hostSync(id);
    if (lastSev != null) net.event({ k: 'sev', v: lastSev }, id);
  }
  function onLeave(id) {
    if (host === id) { host = null; announce(nameOf(id) + ' (the host) left.'); }
    if (gview && gview.from === id) endGuest();
    optOut.delete(id);
    tour.followers.delete(id); invites = invites.filter(i => i.from !== id);
    if (party && party.host === id) { party = null; announce(nameOf(id) + ' left, so the watch party ended.'); }
    render();
  }
  // the Six Views kiosk: share what I set (throttled while dragging, always the final value)
  let sevT = 0, sevPending = null;
  function sevChanged(v) {
    lastSev = v; sevPending = v;
    if (now() - sevT > 150) { net.event({ k: 'sev', v }); sevT = now(); sevPending = null; }
    else setTimeout(() => { if (sevPending != null) { net.event({ k: 'sev', v: sevPending }); sevT = now(); sevPending = null; } }, 170);
  }

  // ------------------------------------------------ ticking: host keeps the party in sync; the bar follows where you are
  setInterval(() => {
    // group vision upkeep: keep sharing alive for people who walk up; let a guest view lapse if the sharer goes quiet
    if (gv.on && (gv.t += 0.5) >= 4) { gv.t = 0; net.event({ k: 'gvis', a: 'on', cond: gv.cond, sev: gv.sev }); }
    if (gview && (now() > gview.until || !G.vision.overlay.isGuest())) { gview = null; if (G.vision.overlay.isGuest()) G.vision.overlay.guestEnd(); }
    G.vision.overlay.setShareHandler((on, cond, sev) => shareVision(on, cond, sev), G.remote.count() > 0);
    if (party && party.host === 'me') { if (G.film.url() !== party.u) endParty(); else if ((syncT += 0.5) >= 3) { syncT = 0; hostSync(); } }
    if (party && party.host !== 'me' && party.joined && G.film.url() !== party.u && !invites.some(i => i.key === 'wp' + party.host)) { /* walked out: stay joined, re-sync when back */ }
    render();
  }, 500);

  // the menu's list of who's here: Go to / Follow each person
  function whoRows(container, myName) {
    const list = G.remote.list();
    container.replaceChildren();
    const me = document.createElement('div'); me.innerHTML = '<b>' + esc(myName || 'You') + '</b> (you)'; container.appendChild(me);
    for (const p of list) {
      const r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:6px';
      const n = document.createElement('span'); n.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'; n.textContent = (host === p.id ? '⭐ ' : '') + (window.VOICE && window.VOICE.isOn(p.id) ? '🎙 ' : '') + p.name; r.appendChild(n);
      const go = document.createElement('button'); go.textContent = 'Go to'; go.disabled = !p.placed; go.onclick = () => { goTo(p.id); document.getElementById('menu').style.display = 'none'; };
      const fo = document.createElement('button'); fo.textContent = G.following() === p.id ? 'Following' : 'Follow'; fo.disabled = !p.placed; fo.onclick = () => { if (G.following() === p.id) G.unfollow(); else follow(p.id, false); document.getElementById('menu').style.display = 'none'; };
      r.append(go, fo); container.appendChild(r);
    }
  }

  return { invite, claimHost, host: () => host, shareVision, onEvent, onNewPeer, onLeave, sevChanged, leadTour, leading: () => tour.leading, follow, goTo, startParty, endParty, party: () => party, whoRows, render };
}
