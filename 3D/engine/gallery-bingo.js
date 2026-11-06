// ART BINGO (Ben, 28 Oct): a 3 × 3 card of PAINTINGS, only when 2+ foxes are in the world (an ART BINGO tab under ART HUNT).
// A square fills by itself when you stand in front of a matching painting (same range as Art Hunt); no ticking by hand.
// First to fill a line rings a bell everyone hears (net.event k 'bng'). Same card for everyone per half hour.
// (s3, Ben) ONLY Ben's hand-made list decides what counts (BINGO_TAGS); BINGO_NOT is the near-misses that must never count.
// One painting can fill several squares. Each card has at most ONE rare square so every card can be finished.
const ALL = [
  ['Water', 'water'], ['A tree', 'tree'], ['A person or face', 'person'], ['A vehicle', 'vehicle'], ['A flower', 'flower'],
  ['A building', 'building'], ['A bridge', 'bridge'], ['Music', 'music'], ['Night: moon or stars', 'night'], ['Eyes', 'eyes'],
  ['Abstract shapes', 'abstract'], ['A heart', 'heart'], ['A bird', 'bird'], ['A hat or helmet', 'hat'], ['An animal', 'animal'], ['Hands', 'hands'],
];
const MAIN = ['water', 'tree', 'person', 'vehicle', 'flower', 'building', 'bridge'], EXTRA = ['music', 'night', 'eyes', 'abstract'], RARE = ['heart', 'bird', 'hat', 'animal', 'hands'];
export const BINGO_TAGS = {
  '5 WEEKS ON MY SIDE': ['person', 'eyes'],
  'Almost Blindness': ['person', 'water', 'abstract'],
  'Curating Hope': ['tree', 'person'],
  'Find Your Village': ['building', 'tree', 'night', 'abstract'],
  'Take Time to Bloom': ['flower', 'abstract'],
  'Pour In The Love': ['heart', 'water', 'night'],
  'Roots of Kinship': ['tree', 'bird', 'person', 'flower'],   // (29 Oct, Ben) not water
  'All Life’s Beauty': ['person', 'flower'],
  'The Only Light We’ll See': ['water', 'tree', 'night'],
  'Pathways Unveiled': ['abstract', 'building'],
  'Reflections of Sisterhood': ['person', 'water', 'building'],
  'All the Possibilities': ['person', 'night', 'abstract'],
  'A New Day': ['abstract', 'water'],
  'Music On The Streets': ['person', 'music'],
  'Roller Coaster Of Emotions': ['person', 'hat', 'building', 'eyes'],
  'I Am Blind, Like My Hair Is Brown': ['person', 'eyes', 'abstract'],
  'Reaching Past Blindness': ['person', 'music', 'abstract'],
  'Reasons for a Cure': ['person'],
  'Midnight Melodies': ['person', 'music', 'night'],
  'Moment of Communion': ['bridge', 'water', 'building', 'person'],
  'Fearless Request': ['person', 'night', 'building'],
  'The Scope of Communication': ['person', 'abstract'],
  'Rhapsody in Blue': ['music', 'abstract'],
  'Reliroo': ['person', 'animal', 'flower', 'tree'],
  'Harmonious Gathering': ['bridge', 'water', 'building', 'person', 'music', 'hat', 'tree'],
  'Napkin, Please': ['person', 'building'],
  'SEEING THE WORLD TOGETHER': ['person', 'building', 'tree', 'water'],
  'HOPE IS NOT LOST': ['water', 'person'],
  'Pedals of Freedom': ['person', 'vehicle', 'building', 'tree'],
  'The Bridge of Perception': ['bridge', 'water', 'person', 'eyes'],
  'Rhythm of Life': ['person', 'music'],
  'The Dark Uncertainty': ['person', 'vehicle', 'music'],
  'GOALBALL IS...': ['person', 'abstract', 'hands'],
  'The Visions That We Share': ['eyes', 'abstract'],
  'Flow State': ['person', 'abstract'],
  'Lighthouse of Hope': ['water', 'night', 'person'],
  'Telephone Poles': ['tree', 'abstract'],
  'Back of a Harley': ['person', 'vehicle', 'hat', 'night'],
  'Joyride': ['vehicle', 'person', 'tree', 'building'],
  'Haute Couture Dreams': ['person'],
  'Embracing Unity': ['person', 'building'],
  'A Bright Future': ['person', 'music'],
  'The Harmony of Vision': ['music', 'abstract'],
  'The Power Within': ['person', 'building'],
  'The Gray Zone': ['abstract'],
  'Inner Peace in Outer Chaos': ['person', 'abstract'],
  'The Mirror': ['person', 'water'],
  'Walk Through Fear': ['person', 'water', 'abstract'],
  'Decision Divide': ['tree', 'bridge', 'bird'],
  'The Button is to the Left': ['building', 'vehicle', 'bridge'],
  'Light on the Other Side': ['person', 'water', 'vehicle'],
  'One Love': ['hands', 'bird', 'tree', 'person'],
  'Art Raised Me Up': ['building'],
  'Live the Beauty': ['water', 'tree', 'building'],
  'A Different Way to See': ['person', 'building'],
  'Beauty in the Blurry': ['vehicle', 'building', 'night'],
  'Everything in Its Place': ['water'],
  'The Temperature Setter': ['person', 'music', 'hands'],
  'How, Not Who': ['animal'],
  'Invisibly, Ours': ['person'],
  'Unstoppable': ['person', 'flower'],
  'Comfort in the Uncomfortable': ['person', 'vehicle'],
  'Spectrum of Sight': ['eyes', 'abstract'],
  'Wet Floor Signs, Beware!': ['person', 'water'],
  'Fellowship': ['person', 'abstract'],
  'Move the Needle': ['person', 'abstract'],
  'Self-Worth: A New Understanding': ['person'],
  'Strengths &amp; Limitations': ['person', 'abstract'],
  'Where People Are': ['person', 'abstract'],
  'Full Immersion': ['person', 'building'],
};
export const BINGO_NOT = {
  'Almost Blindness': ['eyes', 'night'],
  'Curating Hope': ['flower', 'building'],
  'Find Your Village': ['person', 'water'],
  'Pour In The Love': ['building', 'person'],
  'Roots of Kinship': ['heart', 'water'],   // (29 Oct, Ben) water never counts here
  'The Only Light We’ll See': ['building', 'person', 'bird'],
  'Pathways Unveiled': ['vehicle', 'bridge'],
  'Reflections of Sisterhood': ['bridge'],
  'All the Possibilities': ['building', 'music'],
  'A New Day': ['tree', 'building'],
  'Music On The Streets': ['vehicle', 'bird', 'building'],
  'Roller Coaster Of Emotions': ['vehicle', 'water'],
  'Reaching Past Blindness': ['bridge'],
  'Reasons for a Cure': ['vehicle'],
  'Midnight Melodies': ['water', 'bird'],
  'Fearless Request': ['vehicle'],
  'The Scope of Communication': ['water'],
  'Rhapsody in Blue': ['water'],
  'Napkin, Please': ['hat'],
  'SEEING THE WORLD TOGETHER': ['vehicle', 'bridge'],
  'HOPE IS NOT LOST': ['vehicle', 'night'],
  'Pedals of Freedom': ['hat', 'water'],
  'GOALBALL IS...': ['heart'],
  'Flow State': ['water'],
  'Lighthouse of Hope': ['building'],
  'Telephone Poles': ['vehicle', 'building'],
  'Back of a Harley': ['heart'],
  'Haute Couture Dreams': ['hat', 'heart'],
  'The Mirror': ['heart', 'tree'],
  'Walk Through Fear': ['building'],
  'One Love': ['flower'],
  'Art Raised Me Up': ['water', 'eyes'],
  'Live the Beauty': ['heart', 'person'],
  'Beauty in the Blurry': ['person'],
  'Everything in Its Place': ['building', 'eyes'],
  'The Temperature Setter': ['water'],
  'How, Not Who': ['bird', 'heart'],
  'Unstoppable': ['tree'],
  'Comfort in the Uncomfortable': ['water', 'building'],
  'Spectrum of Sight': ['water'],
  'Wet Floor Signs, Beware!': ['hat'],
  'Fellowship': ['flower'],
};
const norm = t => String(t || '').replace(/&amp;/g, '&').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const mapLc = M => Object.fromEntries(Object.entries(M).map(([k, v]) => [norm(k), v]));
const TAGS_LC = mapLc(BINGO_TAGS), NOT_LC = mapLc(BINGO_NOT);
// (Ben) how many paintings fill each square: a painting fills only ONE square, the rarest one it fits
const RARITY = {}; for (const [t, ks] of Object.entries(TAGS_LC)) for (const k of ks) if (!(NOT_LC[t] || []).includes(k)) RARITY[k] = (RARITY[k] || 0) + 1;
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export function setupBingo({ G, net, announce, nameOf }) {
  const ink = '#201e1d', bg = '#f3f2f2', red = '#ec3013', yel = '#ffd400', SLOT = 30 * 60000;
  const slot = () => (window.GSES ? window.GSES.slot(SLOT) : Math.floor(Date.now() / SLOT));
  const others = new Map(); let B = null, open_ = false, ac = null, sel = 0;
  const textOf = a => [a.title, a.imgDesc, a.desc].filter(Boolean).join(' ').toLowerCase();
  const fits = (a, q) => { const t = norm(a.title), k = ALL[q][1]; return (TAGS_LC[t] || []).includes(k) && !(NOT_LC[t] || []).includes(k); };
  const arts = () => (G.arts || []).filter(a => a.ctr && a.n && a.title && !a.bio);
  function make() {
    let s = slot() * 104729 + 7; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const sh = L => { L = L.slice(); for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; } return L; };
    const keys = [...MAIN, sh(EXTRA)[0], sh(RARE)[0]], idx = sh(keys.map(k => ALL.findIndex(q => q[1] === k)));
    let sv = {}; try { sv = JSON.parse(localStorage.getItem('gallery.bingo.v5') || '{}'); } catch (e) {}
    const same = sv.id === slot();
    B = { id: slot(), sq: idx.slice(0, 9), got: same ? sv.got || {} : {}, winner: same ? sv.winner || null : null, rivals: new Map() };
  }
  const save = () => { try { localStorage.setItem('gallery.bingo.v5', JSON.stringify({ id: B.id, got: B.got, winner: B.winner })); } catch (e) {} };
  const has = i => B.got[i] != null, count = () => Object.keys(B.got).length;
  const line = () => LINES.find(L => L.every(has));
  function bell() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t0 = ac.currentTime;
    for (const [f, d] of [[880, 0], [1320, 0.004], [2210, 0.008], [880, 0.5], [1320, 0.504]]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.25, t0 + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 1.8); o.connect(g).connect(ac.destination); o.start(t0 + d); o.stop(t0 + d + 1.9); } } catch (e) {} }
  function speak(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {} }
  const tab = document.createElement('button'); tab.type = 'button'; tab.setAttribute('aria-label', 'Art bingo card');
  tab.style.cssText = `position:fixed;left:0;top:calc(42% + 74px);z-index:8500;display:none;min-height:56px;min-width:44px;padding:8px 10px;background:${red};color:#fff;border:2px solid ${bg};border-left:0;border-radius:0;font:800 14px/1.05 Archivo,sans-serif;letter-spacing:.06em;text-align:left;cursor:pointer`;
  document.body.appendChild(tab);
  const el = document.createElement('div'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Art bingo');
  el.style.cssText = `position:fixed;left:0;top:max(8px,env(safe-area-inset-top));z-index:8600;display:none;width:min(420px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;background:${ink};color:${bg};border:2px solid ${bg};border-left:0;font-family:Archivo,sans-serif;box-sizing:border-box;padding:14px 14px 16px max(14px,env(safe-area-inset-left));box-shadow:0 12px 32px rgba(0,0,0,.35)`;
  for (const ev of ['pointerdown', 'touchstart', 'wheel', 'keydown']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  document.body.appendChild(el);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const hov = 'this.style.background="#3a3634"', out = 'this.style.background="' + ink + '"';
  function drawTab() { tab.innerHTML = `ART<br>BINGO<br><span style="color:${yel}">${B ? count() : 0}/9</span>`; tab.style.display = others.size && !open_ && (()=>{const l=document.getElementById('load');return !l||getComputedStyle(l).display==='none';})() ? 'block' : 'none'; }
  function draw() {
    const win = line(), mins = Math.max(1, Math.ceil((window.GSES ? window.GSES.left(SLOT) : SLOT - Date.now() % SLOT) / 60000)), q = ALL[B.sq[sel]][0], f = B.got[sel];
    const cells = B.sq.map((k, i) => { const g = has(i), w = win && win.includes(i), on = i === sel;
      return `<button data-i="${i}" aria-pressed="${on}" aria-label="${esc(ALL[k][0])}${g ? ', found: ' + esc(B.got[i]) : ', not found yet'}" style="position:relative;aspect-ratio:1;min-height:44px;padding:8px;border:0;border-right:2px solid ${bg};border-bottom:2px solid ${bg};border-radius:0;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:left;background:${w ? yel : g ? red : ink};color:${w ? ink : g ? '#fff' : bg};font:700 clamp(12px,3.5vw,14px)/1.15 Archivo,sans-serif">
        <span style="font:700 10px Archivo;letter-spacing:.1em;opacity:.75">0${i + 1}</span><span>${esc(ALL[k][0])}</span><span style="font:900 20px/1 Archivo;min-height:20px">${g ? '★' : ''}</span>
        ${on ? `<span style="position:absolute;left:0;right:0;bottom:0;height:5px;background:${w ? ink : yel}"></span>` : ''}</button>`; }).join('');
    const rv = [...B.rivals.entries()].sort((x, y) => y[1] - x[1]).map(([id, n]) => `<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-top:2px solid #4a4746;padding:8px 0;font:600 15px Archivo"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nameOf(id))}</span><span>${n}/9</span></div>`).join('');
    el.innerHTML = `<div style="display:grid;grid-template-columns:1fr 44px;border-bottom:2px solid ${bg};margin:-14px -14px 0 calc(-1 * max(14px,env(safe-area-inset-left)))">
        <div style="padding:12px 14px 10px max(14px,env(safe-area-inset-left));display:flex;flex-direction:column;gap:3px">
          <div style="font:800 12px Archivo;letter-spacing:.14em;color:${red}">ART BINGO</div>
          <div style="font:600 13px Archivo;letter-spacing:.06em;opacity:.75">${others.size + 1} FOXES · NEW CARD IN ${mins} MIN</div></div>
        <button data-k="x" aria-label="Close" onmouseover='${hov}' onmouseout='${out}' style="border:0;border-left:2px solid ${bg};background:${ink};color:${bg};font:700 20px Archivo;cursor:pointer;border-radius:0">✕</button></div>
      <div style="padding:16px 0 14px">
        ${B.winner ? `<div style="font:900 36px/0.95 Archivo;color:${yel};margin-bottom:10px">${B.winner === 'You' ? 'BINGO!<br>YOU RANG THE BELL.' : 'BINGO!<br>' + esc(B.winner).toUpperCase() + ' RANG THE BELL.'}</div>` : ''}
        <div style="font:800 22px/1.22 Archivo;color:${bg};text-wrap:pretty">FIND paintings that have the following:</div></div>
      <div style="font:800 12px Archivo;letter-spacing:.14em;margin-bottom:6px">YOUR CARD · ${count()}/9 · FIRST LINE RINGS THE BELL</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:2px solid ${bg};border-left:2px solid ${bg};margin-bottom:14px">${cells}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;border:2px solid ${bg};margin-bottom:14px">
        <button data-k="say" onmouseover='${hov}' onmouseout='${out}' style="min-height:48px;padding:0 14px;border:0;border-right:2px solid ${bg};background:${ink};color:${bg};font:700 15px Archivo;letter-spacing:.05em;text-align:left;cursor:pointer;border-radius:0">READ ALOUD</button>
        <button data-k="next" onmouseover='${hov}' onmouseout='${out}' style="min-height:48px;padding:0 14px;border:0;background:${ink};color:${bg};font:700 15px Archivo;letter-spacing:.05em;text-align:left;cursor:pointer;border-radius:0">NEXT SQUARE →</button></div>
      ${rv ? `<div style="font:800 12px Archivo;letter-spacing:.14em;color:${yel};margin-bottom:2px">RACING YOU</div>${rv}` : ''}`;
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sel = +b.dataset.i; draw(); });
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === 'x') close(); if (k === 'say') speak(q + (f ? '. Found: ' + f : '')); if (k === 'next') nextSq(); });
    drawTab();
  }
  function nextSq() { for (let s = 1; s <= 9; s++) { const i = (sel + s) % 9; if (!has(i)) { sel = i; break; } } draw(); }
  function fill(i, a) {
    const had = !!line(); B.got[i] = a.title; save();
    if (navigator.vibrate) navigator.vibrate([20, 40, 40]);
    announce(`Bingo square: ${ALL[B.sq[i]][0]} (${a.title})`);
    if (net) net.event({ k: 'bng', a: 'got', id: B.id, n: count() });
    if (!had && line() && !B.winner) { B.winner = 'You'; save(); bell(); announce('BINGO! You filled a line and rang the bell.'); if (net) net.event({ k: 'bng', a: 'win', id: B.id }); }
    sel = i; if (!open_) open(); else draw();
    el.animate && el.animate([{ boxShadow: `0 0 0 0 ${red}` }, { boxShadow: `0 0 0 16px transparent` }], { duration: 700 });
  }
  let t = 0;
  G.world.onTick(dt => {
    t += dt || 0.016; if (t < 0.4 || !B || !others.size) return; t = 0;
    if (B.id !== slot()) { make(); if (open_) draw(); else drawTab(); return; }
    const [x, , z] = G.world.pos();
    for (const a of arts()) { const dx = x - a.ctr.x, dz = z - a.ctr.z, d = Math.hypot(dx, dz);
      if (d < 3.2 && d > 0.3 && (dx * a.n.x + dz * a.n.z) / d > 0.45) {
        if (Object.values(B.got).includes(a.title)) continue; let best = -1; for (let i = 0; i < 9; i++) if (!has(i) && fits(a, B.sq[i]) && (best < 0 || (RARITY[ALL[B.sq[i]][1]] || 0) < (RARITY[ALL[B.sq[best]][1]] || 0))) best = i; if (best >= 0) { fill(best, a); return; } } }
  });
  function open() { if (B.id !== slot()) make(); open_ = true; el.style.display = 'block'; draw(); el.querySelector('button').focus(); if (net) net.event({ k: 'bng', a: 'ask', id: B.id }); }
  function close() { open_ = false; el.style.display = 'none'; try { speechSynthesis.cancel(); } catch (e) {} drawTab(); }
  tab.onclick = open;
  function seen(id) { if (!id) return; const had = others.size; others.set(id, Date.now()); if (!had) { drawTab(); announce('Another fox is here: Art Bingo is open (tab on the left)'); } }
  function gone(id) { others.delete(id); if (B) B.rivals.delete(id); if (!others.size && open_) close(); drawTab(); }
  function onEvent(id, d) { seen(id); if (!d || d.k !== 'bng' || !B || d.id !== B.id) return;
    if (d.a === 'ask' && count()) net.event({ k: 'bng', a: 'got', id: B.id, n: count(), quiet: 1 }, id);
    if (d.a === 'got') { B.rivals.set(id, d.n); if (open_) draw(); }
    if (d.a === 'win' && !B.winner) { B.winner = nameOf(id); save(); bell(); announce(`BINGO! ${B.winner} filled a line and rang the bell.`); if (open_) draw(); } }
  make(); drawTab(); const wt = setInterval(() => { if ((()=>{const l=document.getElementById('load');return !l||getComputedStyle(l).display==='none';})()) { clearInterval(wt); drawTab(); } }, 500);
  return { near() {}, onJoin: seen, onLeave: gone, onEvent, open, close, isOpen: () => open_ };
}
