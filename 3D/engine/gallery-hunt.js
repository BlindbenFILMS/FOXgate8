// ART HUNT (Ben, 28 Oct): a card reads a painting the way a blind visitor hears it; find it and stand in front of it = a stamp.
// Everyone in the gallery in the same 30 min gets the same 5 cards (seeded), so friends race: finds go out on net.event k 'hnt'.
export function setupHunt({ G, net, announce, nameOf }) {
  const ink = '#201e1d', bg = '#f3f2f2', red = '#ec3013', yel = '#ffd400', N = 5, SLOT = 30 * 60000;
  const slot = () => (window.GSES ? window.GSES.slot(SLOT) : Math.floor(Date.now() / SLOT));   // (Ben) the clock starts when the first fox comes in (window.GSES)
  const rnd = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pool = () => { const seen = new Set(); return G.arts.filter(a => a.ctr && a.n && a.title && (a.imgDesc || a.desc) && !a.bio && !seen.has(a.title) && seen.add(a.title)); };
  const short = (t, w) => { const s = String(t || '').replace(/\s+/g, ' ').split(/(?<=[.;!?])\s/)[0].replace(/[.;]$/, ''); const p = s.split(' '); return p.length > w ? p.slice(0, w).join(' ') + '…' : s; };
  function clue(a) {
    let c = short(a.imgDesc || a.desc, 16).replace(new RegExp(a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), 'this piece');
    c = c.charAt(0).toLowerCase() + c.slice(1);
    const who = a.artist ? a.artist.replace(/&amp;/g, '&').split(/\s/)[0] : '';
    return c + (who ? '; the artist is called ' + who : '');
  }
  let H = null, open_ = false;
  function make() {
    const P = pool(), r = rnd(slot() * 7919 + 13), pick = [];
    const idx = P.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    for (const i of idx) { if (pick.length >= N) break; pick.push(P[i]); }
    // (Ben) same 5 paintings for everyone, but each player gets them in their own order (no racing to the same card)
    let me = +localStorage.getItem('gallery.huntSeed'); if (!me) { me = 1 + Math.floor(Math.random() * 1e9); localStorage.setItem('gallery.huntSeed', me); }
    const r2 = rnd(slot() * 31 + me); for (let i = pick.length - 1; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [pick[i], pick[j]] = [pick[j], pick[i]]; }
    let saved = {}; try { saved = JSON.parse(localStorage.getItem('gallery.hunt.v2') || '{}'); } catch (e) {}
    H = { id: slot(), cards: pick.map(a => ({ a, clue: clue(a) })), got: saved.id === slot() ? saved.got || [] : [], cur: 0, rivals: new Map() };
    H.cur = H.cards.findIndex((_, i) => !H.got.includes(i)); if (H.cur < 0) H.cur = 0;
  }
  const save = () => { try { localStorage.setItem('gallery.hunt.v2', JSON.stringify({ id: H.id, got: H.got })); } catch (e) {} };
  const tab = document.createElement('button'); tab.type = 'button'; tab.setAttribute('aria-label', 'Art hunt card');
  tab.style.cssText = `position:fixed;left:0;top:42%;z-index:8500;display:none;min-height:56px;min-width:44px;padding:8px 10px;background:${ink};color:${yel};border:2px solid ${bg};border-left:0;border-radius:0;font:800 14px/1.05 Archivo,sans-serif;letter-spacing:.06em;text-align:left;cursor:pointer`;
  document.body.appendChild(tab);
  const el = document.createElement('div'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Art hunt');
  el.style.cssText = `position:fixed;left:0;top:max(8px,env(safe-area-inset-top));z-index:8600;display:none;width:min(420px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;background:${ink};color:${bg};border:2px solid ${bg};border-left:0;font-family:Archivo,sans-serif;box-sizing:border-box;padding:14px 14px 16px max(14px,env(safe-area-inset-left));box-shadow:0 12px 32px rgba(0,0,0,.35)`;
  for (const ev of ['pointerdown', 'touchstart', 'wheel', 'keydown']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  document.body.appendChild(el);
  const btn = `min-height:44px;padding:0 14px;border:2px solid ${bg};background:${ink};color:${bg};font:700 15px Archivo,sans-serif;letter-spacing:.04em;text-align:left;cursor:pointer;border-radius:0`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function speak(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {} }
  function drawTab() { tab.innerHTML = `ART<br>HUNT<br><span style="color:${bg}">${H ? H.got.length : 0}/${N}</span>`; if (!open_) tab.style.display = (()=>{const l=document.getElementById('load');return !l||getComputedStyle(l).display==='none';})() ? 'block' : 'none'; }
  function draw() {
    if (!H) return; const done = H.got.length >= N, c = H.cards[H.cur], mins = Math.max(1, Math.ceil((window.GSES ? window.GSES.left(SLOT) : SLOT - Date.now() % SLOT) / 60000));
    const hov = 'this.style.background="#3a3634"', out = 'this.style.background="' + ink + '"';
    const stamps = H.cards.map((k, i) => { const g = H.got.includes(i), on = i === H.cur && !done;
      return `<button data-i="${i}" aria-label="Card ${i + 1}${g ? ', found: ' + esc(k.a.title) : ''}" style="position:relative;min-width:44px;height:56px;padding:6px 0 0 8px;border:0;border-right:2px solid ${bg};border-radius:0;cursor:pointer;background:${g ? red : ink};color:${g ? '#fff' : bg};text-align:left;display:flex;flex-direction:column;justify-content:space-between">
        <span style="font:700 11px Archivo;letter-spacing:.1em;opacity:.8">0${i + 1}</span><span style="font:900 22px/1 Archivo;padding-bottom:6px">${g ? '★' : ''}</span>
        ${on ? `<span style="position:absolute;left:0;right:0;bottom:0;height:5px;background:${yel}"></span>` : ''}</button>`; }).join('');
    const rv = [...H.rivals.entries()].sort((x, y) => y[1] - x[1]).map(([id, n]) => `<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-top:2px solid #4a4746;padding:8px 0;font:600 15px Archivo"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nameOf(id))}</span><span style="display:flex;gap:3px">${Array.from({ length: N }, (_, j) => `<span style="width:10px;height:10px;background:${j < n ? red : 'transparent'};border:2px solid ${j < n ? red : '#6b6766'}"></span>`).join('')}</span></div>`).join('');
    el.innerHTML = `<div style="display:grid;grid-template-columns:1fr 44px;border-bottom:2px solid ${bg};margin:-14px -14px 0 calc(-1 * max(14px,env(safe-area-inset-left)))">
        <div style="padding:12px 14px 10px max(14px,env(safe-area-inset-left));display:flex;flex-direction:column;gap:3px">
          <div style="font:800 12px Archivo;letter-spacing:.14em;color:${yel}">ART HUNT</div>
          <div style="font:600 13px Archivo;letter-spacing:.06em;opacity:.75">${done ? 'COMPLETE' : 'CARD ' + (H.cur + 1) + ' OF ' + N} · NEW HUNT IN ${mins} MIN</div></div>
        <button data-k="x" aria-label="Close" onmouseover='${hov}' onmouseout='${out}' style="border:0;border-left:2px solid ${bg};background:${ink};color:${bg};font:700 20px Archivo;cursor:pointer;border-radius:0">✕</button></div>
      ${done ? `<div style="padding:18px 0 16px"><div style="font:900 40px/0.95 Archivo;letter-spacing:-.01em;color:${yel}">CARD<br>FULL.</div><div style="font:500 16px/1.45 Archivo;margin-top:12px;max-width:30ch">You found all ${N} paintings. A new hunt starts when the timer runs out.</div></div>`
        : `<div style="padding:18px 0 14px">
             <div style="font:900 64px/0.5 Archivo;color:${red};height:26px" aria-hidden="true">“</div>
             <div style="font:800 24px/1.22 Archivo;letter-spacing:-.005em;text-wrap:pretty">${esc(c.clue.charAt(0).toUpperCase() + c.clue.slice(1))}.</div>
             <div style="font:500 15px/1.4 Archivo;opacity:.8;margin-top:12px">Find this painting and stand in front of it.</div></div>
           <div style="display:grid;grid-template-columns:1fr 1fr;border:2px solid ${bg};margin-bottom:14px">
             <button data-k="say" onmouseover='${hov}' onmouseout='${out}' style="min-height:48px;padding:0 14px;border:0;border-right:2px solid ${bg};background:${ink};color:${bg};font:700 15px Archivo;letter-spacing:.05em;text-align:left;cursor:pointer;border-radius:0">READ ALOUD</button>
             <button data-k="skip" onmouseover='${hov}' onmouseout='${out}' style="min-height:48px;padding:0 14px;border:0;background:${ink};color:${bg};font:700 15px Archivo;letter-spacing:.05em;text-align:left;cursor:pointer;border-radius:0">NEXT CARD →</button></div>`}
      <div style="font:800 12px Archivo;letter-spacing:.14em;margin-bottom:6px">YOUR STAMPS · ${H.got.length}/${N}</div>
      <div style="display:grid;grid-template-columns:repeat(${N},minmax(0,1fr));border:2px solid ${bg};border-right:0;margin-bottom:16px">${stamps}</div>
      ${rv ? `<div style="font:800 12px Archivo;letter-spacing:.14em;color:${yel};margin-bottom:2px">RACING YOU</div>${rv}` : `<div style="border-top:2px solid #4a4746;padding-top:10px;font:500 14px/1.4 Archivo;opacity:.75">Friends in the gallery get the same cards. First to fill the card wins.</div>`}`;
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { H.cur = +b.dataset.i; draw(); });
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === 'x') close(); if (k === 'say') speak(c.clue); if (k === 'skip') next(); });
    drawTab();
  }
  function next() { for (let s = 1; s <= N; s++) { const i = (H.cur + s) % N; if (!H.got.includes(i)) { H.cur = i; break; } } draw(); }
  function open() { if (!H || H.id !== slot()) make(); open_ = true; el.style.display = 'block'; tab.style.display = 'none'; draw(); el.querySelector('button').focus(); if (net) net.event({ k: 'hnt', a: 'ask', id: H.id }); }
  function close() { open_ = false; el.style.display = 'none'; tab.style.display = 'block'; try { speechSynthesis.cancel(); } catch (e) {} }
  tab.onclick = open;
  function found(i) {
    H.got.push(i); save(); const a = H.cards[i].a, left = N - H.got.length;
    if (navigator.vibrate) navigator.vibrate([20, 40, 40]);
    announce(left ? `Stamp! You found ${a.title}. ${left} to go.` : `Card full! You found all ${N} paintings.`);
    if (net) net.event({ k: 'hnt', a: 'got', id: H.id, n: H.got.length });
    if (!left) speak('Card full! You found every painting.'); else { next(); }
    if (!open_) { open(); } else draw();
    tab.animate && el.animate([{ boxShadow: `0 0 0 0 ${yel}` }, { boxShadow: `0 0 0 16px transparent` }], { duration: 700 });
  }
  let t = 0;
  G.world.onTick(dt => {
    t += dt || 0.016; if (t < 0.4 || !H) return; t = 0;
    if (H.id !== slot()) { make(); draw(); return; }
    const [x, , z] = G.world.pos();
    H.cards.forEach((k, i) => { if (H.got.includes(i)) return; const a = k.a, dx = x - a.ctr.x, dz = z - a.ctr.z, d = Math.hypot(dx, dz);
      if (d < 3.2 && d > 0.3 && (dx * a.n.x + dz * a.n.z) / d > 0.45) found(i); });
  });
  function onEvent(id, d) {
    if (!d || d.k !== 'hnt' || !H || d.id !== H.id) return;
    if (d.a === 'ask' && H.got.length) net.event({ k: 'hnt', a: 'got', id: H.id, n: H.got.length, quiet: 1 }, id);
    if (d.a === 'got') { const was = H.rivals.get(id) || 0; H.rivals.set(id, d.n); if (!d.quiet && d.n > was) announce(d.n >= N ? `${nameOf(id)} filled the Art Hunt card!` : `${nameOf(id)} found an Art Hunt painting (${d.n}/${N})`); if (open_) draw(); }
  }
  make(); drawTab(); const wt = setInterval(() => { if ((()=>{const l=document.getElementById('load');return !l||getComputedStyle(l).display==='none';})()) { clearInterval(wt); drawTab(); } }, 500);
  return { open, close, onEvent, isOpen: () => open_ };
}
