// Blind Canvas gallery: visitors' notes and the guest book.
//  • Leave a note anywhere (☰ → Leave a note here): it floats at that spot as a little card; anyone who walks by sees it
//    open up, and (if "Read notes aloud" is on) hears it read out.
//  • Leave a note on an artwork: it shows in that artwork's panel, and the artwork's prompt says how many notes it has.
//  • The guest book: a lectern on the welcome plaza. Sign it; the latest signatures show on its page.
// Notes are kept: each is a small signed message saved on public Nostr relays (the same network the gallery uses to find
// other visitors), tagged with the room, so a private room keeps its own notes. People here get new notes instantly over
// the gallery connection too, so notes still appear live if the relays can't be reached.
// Moderation: a word filter (and no links); your own notes can be removed; the gallery admin (a private link with a
// passphrase, ?admin=…) can hide any note for everyone; notes.hidden in gallery.json hides ids for good.
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, bytesToHex, hexToBytes } from '../vendor/nostr-pure.js';

const KIND_NOTE = 4251, KIND_HIDE = 4252, TAG = 'bcp-gallery-v1', MAX = 240;
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';

// ------------------------------------------------ a word filter (kept short; the admin can hide anything it misses)
const BAD = ['fuck', 'shit', 'cunt', 'bitch', 'bastard', 'dick', 'cock', 'pussy', 'whore', 'slut', 'asshole', 'wanker', 'twat', 'nigger', 'nigga', 'faggot', 'fag', 'retard', 'spic', 'chink', 'kike', 'tranny', 'dyke', 'porn', 'nazi', 'rape', 'kys', 'kill yourself'];
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' };
function blocked(text) {
  const t = String(text).toLowerCase().replace(/[013457@$!]/g, c => LEET[c] || c);
  if (/(https?:|www\.|\.com\b|\.net\b|\.org\b)/.test(t)) return 'Links can’t be added to notes.';
  const words = ' ' + t.replace(/[^a-z]+/g, ' ') + ' ', squashed = t.replace(/[^a-z]+/g, '');
  for (const w of BAD) { if (words.includes(' ' + w + ' ') || words.includes(' ' + w + 's ') || (w.length >= 5 && squashed.includes(w.replace(/ /g, '')))) return 'Please keep notes kind — that word can’t be used here.'; }
  return null;
}
const ago = s => { const d = Math.max(0, Date.now() / 1000 - s); return d < 90 ? 'just now' : d < 3600 ? Math.round(d / 60) + ' min ago' : d < 86400 ? Math.round(d / 3600) + ' h ago' : d < 86400 * 45 ? Math.round(d / 86400) + ' days ago' : new Date(s * 1000).toLocaleDateString(); };

export async function setupNotes({ G, net, cfg, myName, announce, esc, readAloud, showPanel }) {
  cfg = cfg || {};
  const W = G.world, THREE = W.THREE, qs = new URLSearchParams(location.search);
  const room = (qs.get('room') || 'lobby').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'lobby';
  const relayUrls = qs.get('relays') ? qs.get('relays').split(',') : (cfg.relays || []);
  const admins = new Set(cfg.admins || []), hiddenForGood = new Set(cfg.hidden || []);

  // ------------------------------------------------ my key (kept in this browser, so I can remove my own notes)
  let sk; try { const h = localStorage.getItem('8gates.gallery.notekey'); sk = h ? hexToBytes(h) : null; } catch (e) {}
  if (!sk) { sk = generateSecretKey(); try { localStorage.setItem('8gates.gallery.notekey', bytesToHex(sk)); } catch (e) {} }
  const me = getPublicKey(sk);
  // the admin link: ?admin=<passphrase> (remembered for this tab only)
  let adminSk = null;
  try {
    const pass = qs.get('admin') || sessionStorage.getItem('8gates.gallery.admin');
    if (pass && crypto.subtle) {
      const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bcp-notes-admin:' + pass)));
      if (admins.has(getPublicKey(h))) { adminSk = h; sessionStorage.setItem('8gates.gallery.admin', pass); setTimeout(() => announce('Admin mode: you can hide any note for everyone.'), 1500); }
    }
  } catch (e) {}

  // ------------------------------------------------ the notes we know about
  const notes = new Map();      // id -> { id, pubkey, at, text, name, type, p, art, title }
  const hides = [];             // hide events: { pubkey, target }
  let localHidden; try { localHidden = new Set(JSON.parse(localStorage.getItem('8gates.gallery.hiddenNotes') || '[]')); } catch (e) { localHidden = new Set(); }
  const isHidden = n => hiddenForGood.has(n.id) || localHidden.has(n.id) || hides.some(h => h.target === n.id && (h.pubkey === n.pubkey || admins.has(h.pubkey)));
  const visible = type => [...notes.values()].filter(n => (!type || n.type === type) && !isHidden(n)).sort((a, b) => b.at - a.at);
  const perAuthor = new Map();
  function ingest(e) {
    if (!e || typeof e !== 'object' || notes.has(e.id)) return false;
    if (!(e.tags || []).some(t => t[0] === 'r' && t[1] === room) || !(e.tags || []).some(t => t[0] === 't' && t[1] === TAG)) return false;
    if (!verifyEvent(e)) return false;
    if (e.kind === KIND_HIDE) { const t = e.tags.find(t => t[0] === 'e'); if (t) { hides.push({ pubkey: e.pubkey, target: t[1] }); changed(); } return true; }
    if (e.kind !== KIND_NOTE) return false;
    let c; try { c = JSON.parse(e.content); } catch (err) { return false; }
    const text = String(c.text || '').slice(0, MAX).trim(); if (!text || blocked(text) || blocked(c.name || '')) return false;
    const k = (perAuthor.get(e.pubkey) || 0) + 1; if (k > 40) return false; perAuthor.set(e.pubkey, k);   // one browser can't flood the gallery
    const p = Array.isArray(c.p) && c.p.length === 3 && c.p.every(Number.isFinite) ? c.p : null;
    const type = ['spot', 'art', 'book'].includes(c.type) ? c.type : 'spot';
    if (type !== 'book' && !p) return false;
    notes.set(e.id, { id: e.id, pubkey: e.pubkey, at: e.created_at, text, name: String(c.name || 'A visitor').slice(0, 20), type, p, art: typeof c.art === 'string' ? c.art.slice(0, 80) : null, title: typeof c.title === 'string' ? c.title.slice(0, 80) : '' });
    changed(); return true;
  }

  // ------------------------------------------------ relays
  const relays = [];
  let okCount = 0;
  function connect(url, tries = 0) {
    let ws; try { ws = new WebSocket(url); } catch (e) { return; }
    const R = { url, ws, open: false }; relays.push(R);
    ws.onopen = () => { R.open = true; ws.send(JSON.stringify(['REQ', 'bcpn', { kinds: [KIND_NOTE, KIND_HIDE], '#t': [TAG], '#r': [room], limit: 500 }])); };
    ws.onmessage = m => { let d; try { d = JSON.parse(m.data); } catch (e) { return; } if (d[0] === 'EVENT' && d[1] === 'bcpn') ingest(d[2]); else if (d[0] === 'OK' && d[2]) { okCount++; const cb = pendingOk.get(d[1]); if (cb) { pendingOk.delete(d[1]); cb(true); } } };
    ws.onclose = () => { R.open = false; relays.splice(relays.indexOf(R), 1); if (tries < 3) setTimeout(() => connect(url, tries + 1), 4000 * (tries + 1)); };
    ws.onerror = () => {};
  }
  relayUrls.forEach(u => connect(u));
  const pendingOk = new Map();
  function publish(template) {
    const { adminKey, ...t } = template;
    const e = finalizeEvent({ created_at: Math.floor(Date.now() / 1000), ...t, tags: [['t', TAG], ['r', room], ...(t.tags || [])] }, adminKey || sk);
    for (const R of relays) if (R.open) { try { R.ws.send(JSON.stringify(['EVENT', e])); } catch (err) {} }
    net.event({ k: 'note', e });   // people here see it straight away
    ingest(e);
    return new Promise(res => { pendingOk.set(e.id, res); setTimeout(() => { if (pendingOk.has(e.id)) { pendingOk.delete(e.id); res(false); } }, 5000); });
  }
  let lastPost = 0;
  async function post(type, text, extra = {}) {
    text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX);
    if (!text) return { error: 'Write something first.' };
    const bad = blocked(text) || blocked(myName()); if (bad) return { error: bad };
    if (Date.now() - lastPost < 15000) return { error: 'One note every 15 seconds, please.' };
    lastPost = Date.now();
    const saved = await publish({ kind: KIND_NOTE, content: JSON.stringify({ v: 1, type, text, name: myName() || 'A visitor', ...extra }) });
    return { saved };
  }
  const remove = n => publish({ kind: KIND_HIDE, content: '', tags: [['e', n.id]], adminKey: n.pubkey === me ? null : adminSk });
  const canRemove = n => n.pubkey === me || !!adminSk;
  function hideForMe(n) { localHidden.add(n.id); try { localStorage.setItem('8gates.gallery.hiddenNotes', JSON.stringify([...localHidden])); } catch (e) {} changed(); }

  // ------------------------------------------------ in the world: note cards that open as you walk up
  const cardTex = (n, open) => {
    const cv = document.createElement('canvas'), c = cv.getContext('2d'), Wd = open ? 640 : 300;
    c.font = `500 30px ${FONT}`;
    const lines = []; if (open) { let line = ''; for (const w of n.text.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > Wd - 70 && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); }
    const Hh = open ? 96 + Math.min(7, lines.length) * 38 + 18 : 104;
    cv.width = Wd; cv.height = Hh;
    c.fillStyle = 'rgba(29,28,27,0.94)'; c.fillRect(0, 0, Wd, Hh); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, Hh);
    c.fillStyle = '#ff9783'; c.font = `800 22px ${FONT}`; c.fillText(n.type === 'art' ? 'NOTE ON THIS ART' : 'A NOTE LEFT HERE', 34, 38);
    c.fillStyle = '#ffffff'; c.font = `800 32px ${FONT}`; c.fillText(n.name.toUpperCase(), 34, 78);
    if (open) { c.font = `500 30px ${FONT}`; c.fillStyle = '#f3f2f2'; lines.slice(0, 7).forEach((l, i) => c.fillText(i === 6 && lines.length > 7 ? l + '…' : l, 34, 124 + i * 38)); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { t, w: Wd, h: Hh };
  };
  const marks = new Map();   // id -> { sprite, ring, open, n }
  const ringGeo = new THREE.RingGeometry(0.28, 0.4, 32); ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.65, depthWrite: false });
  function setCard(m, open) {
    const { t, w, h } = cardTex(m.n, open); if (m.sprite.material.map) m.sprite.material.map.dispose();
    m.sprite.material.map = t; m.sprite.material.needsUpdate = true; m.open = open;
    const sw = open ? 2.3 : 1.3; m.sprite.scale.set(sw, sw * h / w, 1); m.sprite.position.y = (open ? m.baseY - 0.55 : m.baseY) + m.sprite.scale.y / 2;
  }
  function placeMarks() {
    const want = new Set(visible('spot').slice(0, 200).map(n => n.id));
    for (const [id, m] of marks) if (!want.has(id)) { W.scene.remove(m.sprite, m.ring); m.sprite.material.map && m.sprite.material.map.dispose(); m.sprite.material.dispose(); marks.delete(id); }
    const placed = [];
    for (const n of visible('spot').slice(0, 200).reverse()) {   // oldest first, so newer notes stack on top
      const stack = placed.filter(q => Math.hypot(q[0] - n.p[0], q[2] - n.p[2]) < 1.2 && Math.abs(q[1] - n.p[1]) < 2).length; placed.push(n.p);
      let m = marks.get(n.id);
      if (!m) {
        m = { n, sprite: new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })), ring: new THREE.Mesh(ringGeo, ringMat), open: false, read: false };
        m.sprite.renderOrder = 4; marks.set(n.id, m); W.scene.add(m.sprite, m.ring);
      }
      m.baseY = n.p[1] + 1.95 + stack * 0.62; m.sprite.position.set(n.p[0], 0, n.p[2]); m.ring.position.set(n.p[0], n.p[1] + 0.03, n.p[2]);
      setCard(m, m.open);
    }
  }
  let dirty = true; function changed() { dirty = true; }
  let spoke = 0;
  W.onTick(dt => {
    if (dirty) { dirty = false; placeMarks(); drawBook(); W.refreshNear(); if (bookOpen) openBook(); }
    const [px, py, pz] = W.pos();
    for (const m of marks.values()) {
      const d = Math.hypot(m.n.p[0] - px, m.n.p[2] - pz), near = d < 3.2 && Math.abs(m.n.p[1] - py) < 2.2;
      m.sprite.visible = m.ring.visible = d < 70;
      if (near !== m.open) setCard(m, near);
      if (near && !m.read) {   // walking past: hear it once
        m.read = true; announce('Note from ' + m.n.name + ': ' + m.n.text);
        const sy = window.speechSynthesis;
        if (readAloud() && sy && !sy.speaking && performance.now() - spoke > 1500) { spoke = performance.now(); sy.speak(new SpeechSynthesisUtterance('Note from ' + m.n.name + '. ' + m.n.text)); }
      }
    }
  });

  // ------------------------------------------------ the guest book lectern on the welcome plaza
  let bookTex = null, bookCtx = null, bookPos = null, bookOpen = false;
  if (cfg.guestbook) {
    const [bx, bz] = cfg.guestbook.p, by = W.groundAt(bx, 3, bz) > -100 ? W.groundAt(bx, 3, bz) : 0.15;
    bookPos = new THREE.Vector3(bx, by, bz);
    const g = new THREE.Group(); g.position.copy(bookPos); g.rotation.y = cfg.guestbook.face || 0; W.scene.add(g);
    const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.9), ink); foot.position.y = 0.04; g.add(foot);
    const colm = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.98, 0.4), ink); colm.position.set(0, 0.53, -0.05); g.add(colm);
    const top = new THREE.Group(); top.position.y = 1.1; top.rotation.x = -0.95; g.add(top);
    top.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 0.08), ink));
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 720; bookCtx = cv.getContext('2d');
    bookTex = new THREE.CanvasTexture(cv); bookTex.colorSpace = THREE.SRGBColorSpace; bookTex.anisotropy = 4;
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.125), new THREE.MeshBasicMaterial({ map: bookTex })); pg.position.z = 0.045; top.add(pg);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.05, 0.1), new THREE.MeshBasicMaterial({ color: 0xec3013 })); bar.position.y = 0.62; top.add(bar);
  }
  function drawBook() {
    if (!bookCtx) return; const c = bookCtx, w = 1024, h = 720;
    c.fillStyle = '#f9f8f6'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; c.fillRect(w / 2 - 3, 30, 6, h - 60);   // an open book
    c.fillStyle = '#ec3013'; c.font = `800 30px ${FONT}`; c.fillText('THE GUEST BOOK', 44, 74);
    c.fillStyle = '#1d1c1b'; c.font = `800 60px ${FONT}`; c.fillText('Say hello.', 44, 150);
    c.font = `500 30px ${FONT}`; c.fillStyle = '#5a5654'; ['Leave a note for the', 'artists and everyone', 'who visits after you.'].forEach((l, i) => c.fillText(l, 44, 210 + i * 40));
    c.fillStyle = '#ec3013'; c.font = `800 28px ${FONT}`; c.fillText('WALK UP · TAP TO SIGN', 44, 400);
    const list = visible('book').slice(0, 4);
    c.font = `800 22px ${FONT}`; c.fillStyle = '#ec3013'; c.fillText(list.length ? 'LATEST SIGNATURES' : 'BE THE FIRST TO SIGN', w / 2 + 34, 74);
    list.forEach((n, i) => {
      const y = 130 + i * 140; c.fillStyle = '#1d1c1b'; c.font = `800 30px ${FONT}`; c.fillText(n.name, w / 2 + 34, y);
      c.font = `500 26px ${FONT}`; c.fillStyle = '#3d4046'; let line = '', row = 0;
      for (const word of n.text.split(' ')) { const t = line ? line + ' ' + word : word; if (c.measureText(t).width > w / 2 - 80) { if (row < 2) c.fillText(row === 1 ? line + '…' : line, w / 2 + 34, y + 36 + row * 32); row++; line = word; } else line = t; }
      if (row < 2) c.fillText(line, w / 2 + 34, y + 36 + row * 32);
    });
    bookTex.needsUpdate = true;
  }
  drawBook();

  // ------------------------------------------------ things you can walk up to
  W.addNear(pl => {
    if (bookPos && Math.hypot(pl.x - bookPos.x, pl.z - bookPos.z) < 2.8 && Math.abs(pl.y - bookPos.y) < 2) return { kind: 'guestbook', item: { z: bookPos.z }, label: 'Sign the guest book' };
    let best = null, bd = 2.4;
    for (const m of marks.values()) { const d = Math.hypot(m.n.p[0] - pl.x, m.n.p[2] - pl.z); if (d < bd && Math.abs(m.n.p[1] - pl.y) < 2) { bd = d; best = m.n; } }
    return best ? { kind: 'note', item: { z: best.p[2], id: best.id }, label: 'Note from ' + best.name } : null;
  });

  // ------------------------------------------------ panels
  const el = (tag, css, text) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; };
  // colours follow the page's panel (dark): --ink text, --card fills, --accent red
  const BTN = 'min-height:44px;padding:0 14px;border:2px solid var(--ink,#f3f2f2);background:var(--card,#232120);color:var(--ink,#f3f2f2);font:800 12px/1 ' + FONT + ';letter-spacing:.08em;text-transform:uppercase;cursor:pointer';
  const MUTED = '#b9b4b4';
  function noteRow(n, onGone) {
    const r = el('div', 'border-left:4px solid var(--accent,#ec3013);padding:6px 10px;margin:10px 0;background:var(--card,#232120)');
    r.appendChild(el('div', 'font:800 13px/1.2 ' + FONT, n.name)); r.appendChild(el('div', 'font:400 15px/1.45 ' + FONT + ';margin:2px 0', n.text));
    const meta = el('div', 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;font:600 12px ' + FONT + ';color:' + MUTED);
    meta.appendChild(el('span', 'flex:1', ago(n.at)));
    const sayB = el('button', BTN + ';min-height:36px', '🔊'); sayB.setAttribute('aria-label', 'Read this note aloud'); sayB.onclick = () => { const sy = window.speechSynthesis; if (sy) { sy.cancel(); sy.speak(new SpeechSynthesisUtterance(n.name + ' says: ' + n.text)); } }; meta.appendChild(sayB);
    if (canRemove(n)) { const b = el('button', BTN + ';min-height:36px', n.pubkey === me ? 'Remove mine' : 'Hide for everyone'); b.onclick = async () => { b.disabled = true; await remove(n); announce('Note removed.'); onGone && onGone(); }; meta.appendChild(b); }
    else { const b = el('button', BTN + ';min-height:36px', 'Hide for me'); b.onclick = () => { hideForMe(n); onGone && onGone(); }; meta.appendChild(b); }
    r.appendChild(meta); return r;
  }
  function composer(placeholder, btnText, send) {
    const f = el('div', 'margin-top:12px');
    const ta = el('textarea'); ta.maxLength = MAX; ta.rows = 3; ta.placeholder = placeholder; ta.setAttribute('aria-label', placeholder);
    ta.style.cssText = 'width:100%;box-sizing:border-box;padding:10px 12px;border:2px solid var(--ink,#f3f2f2);background:#0f0e0d;color:var(--ink,#f3f2f2);border-radius:0;font:400 16px/1.4 ' + FONT + ';resize:vertical;user-select:text;-webkit-user-select:text';
    const row = el('div', 'display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap');
    const b = el('button', BTN + ';background:#ec3013;border-color:#ec3013;color:#fff', btnText); const st = el('span', 'font:600 12px ' + FONT + ';color:' + MUTED + ';flex:1', 'Signed as ' + (myName() || 'a visitor') + ' · ' + MAX + ' letters max · others can see this');
    st.setAttribute('aria-live', 'polite');
    b.onclick = async () => { b.disabled = true; const r = await send(ta.value); b.disabled = false; if (r.error) { st.textContent = r.error; st.style.color = '#ff9783'; return; } ta.value = ''; st.style.color = MUTED; st.textContent = r.saved ? 'Saved ✓ Everyone can see it.' : 'Shared with everyone here ✓ (the note servers didn’t answer, so it may not be kept).'; announce(st.textContent); };
    row.append(b, st); f.append(ta, row);
    ta.addEventListener('keydown', e => e.stopPropagation());   // typing doesn't walk the fox
    return { f, ta };
  }
  function openBook() {
    bookOpen = true;
    const wrap = el('div');
    const c = composer('Write in the guest book…', 'Sign the book', t => post('book', t)); wrap.appendChild(c.f);
    const list = visible('book');
    wrap.appendChild(el('div', 'font:800 11px/1 ' + FONT + ';letter-spacing:.14em;text-transform:uppercase;color:#ff9783;margin:18px 0 4px', list.length ? list.length + (list.length === 1 ? ' signature' : ' signatures') : 'No signatures yet'));
    list.slice(0, 60).forEach(n => wrap.appendChild(noteRow(n, () => openBook())));
    showPanel('Guest book', 'Sign the guest book', wrap, () => { bookOpen = false; });
  }
  function openCompose() {
    const [x, y, z] = W.pos();
    const wrap = el('div'); wrap.appendChild(el('p', 'margin:0;font:400 15px/1.5 ' + FONT, 'Your note stays right here. Anyone who walks by sees it open up, and can hear it read aloud.'));
    const c = composer('What would you like to leave here?', 'Leave the note', async t => { const r = await post('spot', t, { p: [+x.toFixed(2), +y.toFixed(2), +z.toFixed(2)] }); return r; });
    wrap.appendChild(c.f); showPanel('Leave a note', 'A note for this spot', wrap); setTimeout(() => c.ta.focus(), 50);
  }
  function openSpot(item) {
    const n = notes.get(item.id); if (!n) return;
    const here = visible('spot').filter(q => Math.hypot(q.p[0] - n.p[0], q.p[2] - n.p[2]) < 1.5);
    const wrap = el('div'); here.forEach(q => wrap.appendChild(noteRow(q, () => openSpot(item))));
    const [x, y, z] = n.p; const c = composer('Reply with a note here…', 'Leave a note', t => post('spot', t, { p: [x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4] }));
    wrap.appendChild(c.f); showPanel('Notes left here', here.length > 1 ? here.length + ' notes' : 'A note from ' + n.name, wrap);
  }
  // artworks: a notes section inside the artwork's panel
  const artKey = a => 'art:' + String(a.title || 'untitled').slice(0, 40) + '@' + Math.round(a.ctr.x) + ',' + Math.round(a.ctr.z);
  const forArt = a => { const k = artKey(a); return visible('art').filter(n => n.art === k); };
  function artSection(a) {
    const sec = el('div', 'border-top:2px solid var(--ink,#f3f2f2);margin-top:16px;padding-top:12px');
    const draw = () => {
      sec.replaceChildren();
      const list = forArt(a);
      sec.appendChild(el('div', 'font:800 11px/1 ' + FONT + ';letter-spacing:.14em;text-transform:uppercase;color:#ff9783', list.length ? 'Notes from visitors (' + list.length + ')' : 'Notes from visitors'));
      if (!list.length) sec.appendChild(el('p', 'margin:6px 0;font:400 14px ' + FONT + ';color:' + MUTED, 'No notes yet. What does this piece make you feel?'));
      list.slice(0, 40).forEach(n => sec.appendChild(noteRow(n, draw)));
      const c = composer('Leave a note on this artwork…', 'Leave a note', t => post('art', t, { art: artKey(a), title: a.title || '', p: [+a.ctr.x.toFixed(2), +a.ctr.y.toFixed(2), +a.ctr.z.toFixed(2)] }).then(r => { if (!r.error) setTimeout(draw, 50); return r; }));
      sec.appendChild(c.f);
    };
    draw(); return sec;
  }

  return {
    onEvent: (id, d) => { if (d && d.k === 'note') ingest(d.e); },
    openBook, openCompose, openSpot, artSection, countFor: a => forArt(a).length,
    admin: () => !!adminSk, count: () => visible().length, relaysOpen: () => relays.filter(r => r.open).length, me, room, okCount: () => okCount,
  };
}
