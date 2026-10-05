// Blind Canvas gallery: visitors' notes and the guest book.
//  • Leave a note anywhere (☰ → Leave a note here): it floats at that spot as a little card; anyone who walks by sees it
//    open up, and (if "Read notes aloud" is on) hears it read out.
//  • Leave a note on an artwork: it shows in that artwork's panel, and the artwork's prompt says how many notes it has.
//  • The guest book: a lectern on the WHY House's porch (it was on the welcome plaza). Sign it; the latest signatures show on its page.
//  • The WHY House (4 Oct): visitors' own stories ("why do you create? why do you care?"), with a photo of them or their art
//    and their voice, hang on its walls in the slots the campus gives (cfg.why). The story stand inside adds one.
// Notes are kept: each is a small signed message saved on public Nostr relays (the same network the gallery uses to find
// other visitors), tagged with the room, so a private room keeps its own notes. People here get new notes instantly over
// the gallery connection too, so notes still appear live if the relays can't be reached.
// Photos and voice: a note can carry a small portrait (taken with the camera or picked, shrunk to 160 px) and a short voice
// clip (up to 15 s), both inside the note itself, so nothing new is needed to store them. A note with a photo or a voice
// clip stays hidden from everyone else until the gallery admin approves it (the author sees it straight away, marked
// 'waiting for approval'); text-only notes show at once, as before.
// Moderation: a word filter (and no links); your own notes can be removed; the gallery admin (a private link with a
// passphrase, ?admin=…) can hide any note for everyone; notes.hidden in gallery.json hides ids for good.
import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent, bytesToHex, hexToBytes } from '../vendor/nostr-pure.js';
import { lectern } from './gallery-remodel.js';

const KIND_NOTE = 4251, KIND_HIDE = 4252, KIND_OK = 4253, TAG = 'bcp-gallery-v1', MAX = 240;
const IMG_MAX = 24000, AU_MAX = 56000, AU_SECS = 15;   // characters of the data URL; seconds of voice
const IMG_WHY = 40000;   // a WHY House story's picture can be bigger (it might be their art), unless it also carries a voice clip
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
  const approved = new Set();   // ids of photo/voice notes the admin has approved
  const isHidden = n => hiddenForGood.has(n.id) || localHidden.has(n.id) || hides.some(h => h.target === n.id && (h.pubkey === n.pubkey || admins.has(h.pubkey)));
  const pending = n => n.media && !approved.has(n.id);
  const visible = type => [...notes.values()].filter(n => (!type || n.type === type) && !isHidden(n) && (!pending(n) || n.pubkey === me || adminSk)).sort((a, b) => b.at - a.at);
  const perAuthor = new Map();
  function ingest(e) {
    if (!e || typeof e !== 'object' || notes.has(e.id)) return false;
    if (!(e.tags || []).some(t => t[0] === 'r' && t[1] === room) || !(e.tags || []).some(t => t[0] === 't' && t[1] === TAG)) return false;
    if (!verifyEvent(e)) return false;
    if (e.kind === KIND_HIDE) { const t = e.tags.find(t => t[0] === 'e'); if (t) { hides.push({ pubkey: e.pubkey, target: t[1] }); changed(); } return true; }
    if (e.kind === KIND_OK) { const t = e.tags.find(t => t[0] === 'e'); if (t && admins.has(e.pubkey)) { approved.add(t[1]); changed(); } return true; }
    if (e.kind !== KIND_NOTE) return false;
    let c; try { c = JSON.parse(e.content); } catch (err) { return false; }
    const img = typeof c.img === 'string' && c.img.length < (c.type === 'why' ? IMG_WHY : IMG_MAX) && /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(c.img) ? c.img : null;
    const au = typeof c.au === 'string' && c.au.length < AU_MAX && /^data:audio\/[a-z0-9.+-]+(;codecs=[a-z0-9.,]+)?;base64,[A-Za-z0-9+/=]+$/i.test(c.au) ? c.au : null;
    const text = String(c.text || '').slice(0, MAX).trim(); if ((!text && !au) || (text && blocked(text)) || blocked(c.name || '')) return false;
    const k = (perAuthor.get(e.pubkey) || 0) + 1; if (k > 40) return false; perAuthor.set(e.pubkey, k);   // one browser can't flood the gallery
    const p = Array.isArray(c.p) && c.p.length === 3 && c.p.every(Number.isFinite) ? c.p : null;
    const type = ['spot', 'art', 'book', 'why'].includes(c.type) ? c.type : 'spot';
    if (type !== 'book' && type !== 'why' && !p) return false;
    notes.set(e.id, { id: e.id, pubkey: e.pubkey, at: e.created_at, text, name: String(c.name || 'A visitor').slice(0, 20), type, p, art: typeof c.art === 'string' ? c.art.slice(0, 80) : null, title: typeof c.title === 'string' ? c.title.slice(0, 80) : '', img, au, secs: Math.min(AU_SECS + 1, +c.secs || 0), media: !!(img || au) });
    changed(); return true;
  }

  // ------------------------------------------------ relays
  const relays = [];
  let okCount = 0;
  function connect(url, tries = 0) {
    let ws; try { ws = new WebSocket(url); } catch (e) { return; }
    const R = { url, ws, open: false }; relays.push(R);
    ws.onopen = () => { R.open = true; ws.send(JSON.stringify(['REQ', 'bcpn', { kinds: [KIND_NOTE, KIND_HIDE, KIND_OK], '#t': [TAG], '#r': [room], limit: 500 }])); };
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
    if (!text && !extra.au) return { error: extra.img ? 'Add a few words or a voice clip with your photo.' : 'Write something first.' };
    const bad = (text && blocked(text)) || blocked(myName()); if (bad) return { error: bad };
    if (Date.now() - lastPost < 15000) return { error: 'One note every 15 seconds, please.' };
    lastPost = Date.now();
    for (const k of ['img', 'au', 'secs']) if (extra[k] == null) delete extra[k];
    const saved = await publish({ kind: KIND_NOTE, content: JSON.stringify({ v: 1, type, text, name: myName() || 'A visitor', ...extra }) });
    return { saved, pending: !!(extra.img || extra.au) && !adminSk };
  }
  const remove = n => publish({ kind: KIND_HIDE, content: '', tags: [['e', n.id]], adminKey: n.pubkey === me ? null : adminSk });
  const canRemove = n => n.pubkey === me || !!adminSk;
  const approve = n => publish({ kind: KIND_OK, content: '', tags: [['e', n.id]], adminKey: adminSk });
  // playing a voice clip (one at a time)
  let voice = null;
  const playVoice = n => { if (!n.au) return; try { if (voice) voice.pause(); voice = new Audio(n.au); voice.play().catch(() => {}); } catch (e) {} };
  // photos, decoded once per note
  const pics = new Map();
  const pic = (n, onLoad) => { if (!n.img) return null; let p = pics.get(n.id); if (!p) { p = new Image(); p.onload = () => { for (const m of marks.values()) if (m.n.id === n.id) setCard(m, m.open); onLoad && onLoad(); }; p.src = n.img; pics.set(n.id, p); } return p.complete && p.naturalWidth ? p : null; };
  function hideForMe(n) { localHidden.add(n.id); try { localStorage.setItem('8gates.gallery.hiddenNotes', JSON.stringify([...localHidden])); } catch (e) {} changed(); }

  // ------------------------------------------------ in the world: note cards that open as you walk up
  const cardTex = (n, open) => {
    const cv = document.createElement('canvas'), c = cv.getContext('2d'), Wd = open ? 640 : 300;
    c.font = `500 30px ${FONT}`;
    const lines = []; if (open) { let line = ''; for (const w of n.text.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > Wd - 70 && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); }
    const Hh = Math.max(open ? 96 + Math.min(7, lines.length) * 38 + 18 : 104, n.img ? 108 : 0);
    cv.width = Wd; cv.height = Hh;
    c.fillStyle = 'rgba(29,28,27,0.94)'; c.fillRect(0, 0, Wd, Hh); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, Hh);
    const ph = pic(n), tx = ph ? 34 + 92 : 34;
    if (ph) { c.save(); c.beginPath(); c.arc(34 + 40, 54, 40, 0, Math.PI * 2); c.clip(); c.drawImage(ph, 34, 14, 80, 80); c.restore(); c.strokeStyle = '#ec3013'; c.lineWidth = 4; c.beginPath(); c.arc(74, 54, 40, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = '#ff9783'; c.font = `800 22px ${FONT}`; c.fillText((n.au ? '\u{1F50A} ' : '') + (pending(n) ? 'WAITING FOR APPROVAL' : n.type === 'art' ? 'NOTE ON THIS ART' : n.au ? 'A VOICE NOTE LEFT HERE' : 'A NOTE LEFT HERE'), tx, 38);
    c.fillStyle = '#ffffff'; c.font = `800 32px ${FONT}`; c.fillText(n.name.toUpperCase(), tx, 78);
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
    if (dirty) { dirty = false; placeMarks(); drawBook(); drawWhy(); W.refreshNear(); if (bookOpen) openBook(); }
    const [px, py, pz] = W.pos();
    for (const m of marks.values()) {
      const d = Math.hypot(m.n.p[0] - px, m.n.p[2] - pz), near = d < 3.2 && Math.abs(m.n.p[1] - py) < 2.2;
      m.sprite.visible = m.ring.visible = d < 70;
      if (near !== m.open) setCard(m, near);
      if (near && !m.read) {   // walking past: hear it once
        m.read = true; announce((m.n.au ? 'Voice note from ' : 'Note from ') + m.n.name + (m.n.text ? ': ' + m.n.text : ''));
        const sy = window.speechSynthesis;
        if (m.n.au) { if (readAloud() && !pending(m.n) && performance.now() - spoke > 1500) { spoke = performance.now(); playVoice(m.n); } }
        else if (readAloud() && sy && !sy.speaking && performance.now() - spoke > 1500) { spoke = performance.now(); sy.speak(new SpeechSynthesisUtterance('Note from ' + m.n.name + '. ' + m.n.text)); }
      }
    }
  });

  // ------------------------------------------------ the guest book lectern on the welcome plaza
  let bookTex = null, bookCtx = null, bookPos = null, bookOpen = false;
  if (cfg.guestbook) {
    const [bx, bz] = cfg.guestbook.p, by = W.groundAt(bx, 3, bz) > -100 ? W.groundAt(bx, 3, bz) : 0.15;
    bookPos = new THREE.Vector3(bx, by, bz);
    const g = new THREE.Group(); g.position.copy(bookPos); g.rotation.y = cfg.guestbook.face || 0; W.scene.add(g);
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 720; bookCtx = cv.getContext('2d');
    bookTex = new THREE.CanvasTexture(cv); bookTex.colorSpace = THREE.SRGBColorSpace; bookTex.anisotropy = 4;
    // the same reading lectern as "How to move" across the spawn (one furniture family on the plaza)
    lectern(g, new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), new THREE.MeshBasicMaterial({ color: 0xec3013 }), null, bookTex);
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

  // ------------------------------------------------ the WHY House: visitors' stories on its walls
  const whyCfg = cfg.why || null, whyCards = [];
  if (whyCfg) {
    for (const S of whyCfg.slots) {
      const cv = document.createElement('canvas'); cv.width = 640; cv.height = Math.round(640 * S.h / S.w);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(S.w, S.h), new THREE.MeshBasicMaterial({ map: t }));
      m.position.set(...S.p); m.rotation.y = S.ry; W.scene.add(m);
      whyCards.push({ S, cv, t, n: null, key: '' });
    }
  }
  function drawWhyCard(C) {
    const c = C.cv.getContext('2d'), w = C.cv.width, h = C.cv.height, n = C.n;
    if (!n) {   // an empty frame waiting for a story
      c.fillStyle = '#ebe6dc'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9c1b2'; c.setLineDash([16, 12]); c.lineWidth = 6; c.strokeRect(20, 20, w - 40, h - 40); c.setLineDash([]);
      c.fillStyle = '#8f877a'; c.textAlign = 'center'; c.font = `800 44px ${FONT}`; c.fillText('YOUR STORY HERE', w / 2, h / 2 - 6); c.font = `500 28px ${FONT}`; c.fillText('Tap ADD YOUR STORY by the door', w / 2, h / 2 + 40); c.textAlign = 'left'; C.t.needsUpdate = true; return;
    }
    c.fillStyle = '#f9f8f6'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, h);
    const ph = pic(n, () => { if (C.n === n) drawWhyCard(C); });
    let tx = 40, tw = w - 80;
    if (ph) { const bw = h - 60, k = Math.min(bw / ph.naturalWidth, bw / ph.naturalHeight), iw = ph.naturalWidth * k, ih = ph.naturalHeight * k; c.fillStyle = '#1d1c1b'; c.fillRect(30, 30, bw, bw); c.drawImage(ph, 30 + (bw - iw) / 2, 30 + (bw - ih) / 2, iw, ih); tx = 30 + bw + 26; tw = w - tx - 30; }
    c.fillStyle = pending(n) ? '#b8860b' : '#ec3013'; c.font = `800 22px ${FONT}`; c.fillText(pending(n) ? 'WAITING FOR APPROVAL' : n.au ? '\u{1F50A} A STORY IN THEIR VOICE' : 'A STORY', tx, 58);
    c.fillStyle = '#1d1c1b'; let fs = 40; c.font = `800 ${fs}px ${FONT}`; while (c.measureText(n.name.toUpperCase()).width > tw && fs > 22) { fs -= 2; c.font = `800 ${fs}px ${FONT}`; } c.fillText(n.name.toUpperCase(), tx, 104);
    c.font = `500 26px ${FONT}`; c.fillStyle = '#2b2928'; const lines = []; let line = '';
    for (const wd of (n.text || (n.au ? '(a voice story: walk up and listen)' : '')).split(' ')) { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > tw && line) { lines.push(line); line = wd; } else line = t; } if (line) lines.push(line);
    const room = Math.floor((h - 160) / 34); lines.slice(0, room).forEach((l, i, a) => c.fillText(i === a.length - 1 && lines.length > a.length ? l + '\u2026' : l, tx, 150 + i * 34));
    c.fillStyle = '#9a948c'; c.font = `600 20px ${FONT}`; c.fillText(ago(n.at), tx, h - 30); C.t.needsUpdate = true;
  }
  function drawWhy() {
    if (!whyCards.length) return; const list = visible('why');
    whyCards.forEach((C, i) => { const n = list[i] || null, key = n ? n.id + (pending(n) ? 'p' : '') : ''; if (key === C.key && C.drawn) return; C.n = n; C.key = key; C.drawn = true; drawWhyCard(C); });
  }
  function openWhy(item = {}) {
    const one = item.id ? notes.get(item.id) : null;
    const wrap = el('div');
    if (one) { wrap.appendChild(noteRow(one, () => openWhy({}))); if (one.au && readAloud()) playVoice(one); }
    else wrap.appendChild(el('p', 'margin:0;font:400 15px/1.5 ' + FONT, 'Why do you create? Why do you care? Tell us in your own words, record it in your own voice, and add a photo of yourself or of your art. Your story hangs here on the walls of the WHY House for everyone who visits. (Photos and voices show once the gallery team has looked at them.)'));
    const c = composer(one ? 'Add your own story…' : 'Why do you create? Why do you care?', 'Add my story', (t, a) => post('why', t, { ...a }), { art: true });
    wrap.appendChild(c.f);
    const list = visible('why');
    if (!one) { wrap.appendChild(el('div', 'font:800 11px/1 ' + FONT + ';letter-spacing:.14em;text-transform:uppercase;color:#ff9783;margin:18px 0 4px', list.length ? list.length + (list.length === 1 ? ' story' : ' stories') + ' so far' : 'No stories yet: yours can be the first')); list.slice(0, 60).forEach(n => wrap.appendChild(noteRow(n, () => openWhy({})))); }
    showPanel('The WHY House', one ? 'A story from ' + one.name : 'Add your story', wrap);
    if (!one) setTimeout(() => c.ta.focus(), 50);
  }

  // ------------------------------------------------ things you can walk up to
  W.addNear(pl => {
    if (whyCfg) {
      const st = whyCfg.station; if (Math.hypot(pl.x - st.x, pl.z - st.z) < st.r && Math.abs(pl.y) < 2) return { kind: 'why', item: { z: -1 }, label: 'Add your story' };
      let best = null, bd = 3.4;   // stand in front of a story (within a few steps) to read or hear it
      for (const C of whyCards) { if (!C.n) continue; const [x, y, z] = C.S.p; const d = Math.hypot(pl.x - x, pl.z - z), front = (pl.x - x) * Math.sin(C.S.ry) + (pl.z - z) * Math.cos(C.S.ry); if (d < bd && front > 0.2 && Math.abs(pl.y) < 2) { bd = d; best = C; } }
      if (best) return { kind: 'why', item: { z: best.S.p[0] + best.S.p[1] * 7 + best.S.p[2] * 13, id: best.n.id }, label: 'Story from ' + best.n.name };
    }
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
    const head = el('div', 'display:flex;gap:10px;align-items:center');
    if (n.img) { const im = el('img', 'width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--accent,#ec3013);flex:none'); im.src = n.img; im.alt = 'Photo of ' + n.name; head.appendChild(im); }
    const who = el('div', 'flex:1;min-width:0'); who.appendChild(el('div', 'font:800 13px/1.2 ' + FONT, n.name));
    if (pending(n)) who.appendChild(el('div', 'font:800 10px/1.3 ' + FONT + ';letter-spacing:.1em;text-transform:uppercase;color:#ffcf6b', n.pubkey === me ? 'Waiting for approval · only you can see it for now' : 'Waiting for your approval'));
    head.appendChild(who);
    if (n.au) { const pb = el('button', BTN + ';min-height:44px;background:#1f4fd8;border-color:#1f4fd8;color:#fff', '\u25B6 Voice' + (n.secs ? ' ' + Math.round(n.secs) + 's' : '')); pb.setAttribute('aria-label', 'Play the voice note from ' + n.name); pb.onclick = () => playVoice(n); head.appendChild(pb); }
    if (n.type === 'why' && n.img) { head.firstChild.remove(); const big = el('img', 'display:block;max-width:100%;max-height:340px;margin:0 0 8px;border:2px solid var(--ink,#f3f2f2)'); big.src = n.img; big.alt = 'The picture ' + n.name + ' added to their story'; r.appendChild(big); }
    r.appendChild(head); if (n.text) r.appendChild(el('div', 'font:400 15px/1.45 ' + FONT + ';margin:4px 0 2px', n.text));
    const meta = el('div', 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;font:600 12px ' + FONT + ';color:' + MUTED);
    meta.appendChild(el('span', 'flex:1', ago(n.at)));
    const sayB = el('button', BTN + ';min-height:36px', '🔊'); sayB.setAttribute('aria-label', 'Read this note aloud'); sayB.onclick = () => { const sy = window.speechSynthesis; if (sy) { sy.cancel(); sy.speak(new SpeechSynthesisUtterance(n.name + ' says: ' + n.text)); } }; if (n.text) meta.appendChild(sayB);
    if (adminSk && pending(n)) { const a = el('button', BTN + ';min-height:36px;background:#1f8a4c;border-color:#1f8a4c;color:#fff', 'Approve'); a.onclick = async () => { a.disabled = true; await approve(n); announce('Approved. Everyone can see it now.'); onGone && onGone(); }; meta.appendChild(a); }
    if (canRemove(n)) { const b = el('button', BTN + ';min-height:36px', n.pubkey === me ? 'Remove mine' : 'Hide for everyone'); b.onclick = async () => { b.disabled = true; await remove(n); announce('Note removed.'); onGone && onGone(); }; meta.appendChild(b); }
    else { const b = el('button', BTN + ';min-height:36px', 'Hide for me'); b.onclick = () => { hideForMe(n); onGone && onGone(); }; meta.appendChild(b); }
    r.appendChild(meta); return r;
  }
  function composer(placeholder, btnText, send, opt = {}) {
    const f = el('div', 'margin-top:12px');
    const ta = el('textarea'); ta.maxLength = MAX; ta.rows = 3; ta.placeholder = placeholder; ta.setAttribute('aria-label', placeholder);
    ta.style.cssText = 'width:100%;box-sizing:border-box;padding:10px 12px;border:2px solid var(--ink,#f3f2f2);background:#0f0e0d;color:var(--ink,#f3f2f2);border-radius:0;font:400 16px/1.4 ' + FONT + ';resize:vertical;user-select:text;-webkit-user-select:text';
    const row = el('div', 'display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap');
    const b = el('button', BTN + ';background:#ec3013;border-color:#ec3013;color:#fff', btnText); const st = el('span', 'font:600 12px ' + FONT + ';color:' + MUTED + ';flex:1', 'Signed as ' + (myName() || 'a visitor') + ' · ' + MAX + ' letters max · others can see this');
    st.setAttribute('aria-live', 'polite');
    const say = (msg, bad) => { st.textContent = msg; st.style.color = bad ? '#ff9783' : MUTED; announce(msg); };
    // ---- a photo of yourself and a voice clip, both optional
    const att = { img: null, au: null, secs: 0 };
    const media = el('div', 'display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap');
    const micB = el('button', BTN, '\u{1F399} Record voice'), camB = el('button', BTN, opt.art ? '\u{1F5BC} Add a photo (you or your art)' : '\u{1F4F7} Add your photo');
    micB.setAttribute('aria-label', 'Record a voice note, up to ' + AU_SECS + ' seconds'); camB.setAttribute('aria-label', opt.art ? 'Add a photo of yourself or of your art' : 'Add a photo of yourself');
    const fileIn = el('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; if (!opt.art) fileIn.setAttribute('capture', 'user'); fileIn.style.display = 'none';
    const prev = el('div', 'display:flex;gap:8px;align-items:center;flex-wrap:wrap');
    const drawPrev = () => {
      prev.replaceChildren();
      if (att.img) { const im = el('img', 'width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #ec3013'); im.src = att.img; im.alt = 'Your photo'; const x = el('button', BTN + ';min-height:44px;padding:0 10px', '\u2715'); x.setAttribute('aria-label', 'Remove the photo'); x.onclick = () => { att.img = null; drawPrev(); }; prev.append(im, x); }
      if (att.au) { const pl = el('button', BTN + ';min-height:44px;background:#1f4fd8;border-color:#1f4fd8;color:#fff', '\u25B6 ' + Math.round(att.secs) + 's'); pl.setAttribute('aria-label', 'Play back your voice note'); pl.onclick = () => { try { new Audio(att.au).play(); } catch (e) {} }; const x = el('button', BTN + ';min-height:44px;padding:0 10px', '\u2715'); x.setAttribute('aria-label', 'Remove the voice note'); x.onclick = () => { att.au = null; att.secs = 0; drawPrev(); }; prev.append(pl, x); }
    };
    camB.onclick = () => fileIn.click();
    fileIn.onchange = () => {
      const file = fileIn.files && fileIn.files[0]; fileIn.value = ''; if (!file) return;
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => { const cv = document.createElement('canvas'), nw = im.naturalWidth, nh = im.naturalHeight;
        if (opt.art) { const k = Math.min(1, 360 / Math.max(nw, nh)); cv.width = Math.round(nw * k); cv.height = Math.round(nh * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); }   // the whole picture (it may be their art)
        else { const S = 160, s = Math.min(nw, nh); cv.width = cv.height = S; cv.getContext('2d').drawImage(im, (nw - s) / 2, (nh - s) / 2, s, s, 0, 0, S, S); }
        URL.revokeObjectURL(url);
        const lim = (opt.art ? IMG_WHY : IMG_MAX) - 200;
        let q = 0.8, d = cv.toDataURL('image/jpeg', q); while (d.length > lim && q > 0.3) { q -= 0.1; d = cv.toDataURL('image/jpeg', q); }
        if (d.length > lim) { say('That photo couldn\u2019t be added. Try another one.', true); return; }
        att.img = d; drawPrev(); say('Photo added.'); };
      im.onerror = () => { URL.revokeObjectURL(url); say('That photo couldn\u2019t be opened. Try another one.', true); };
      im.src = url;
    };
    let rec = null, recT = 0, recTimer = 0;
    const stopRec = () => { if (rec && rec.state === 'recording') rec.stop(); };
    micB.onclick = async () => {
      if (rec && rec.state === 'recording') { stopRec(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { say('Voice notes don\u2019t work in this browser.', true); return; }
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); } catch (e) { say('The microphone wasn\u2019t allowed, so no voice note this time.', true); return; }
      const type = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'].find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
      const chunks = []; try { rec = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 }); } catch (e) { rec = new MediaRecorder(stream); }
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        clearInterval(recTimer); stream.getTracks().forEach(tr => tr.stop()); micB.textContent = '\u{1F399} Record voice'; micB.style.background = 'var(--card,#232120)';
        const secs = (performance.now() - recT) / 1000, blob = new Blob(chunks, { type: (rec.mimeType || type || 'audio/webm').split(';')[0] });
        const fr = new FileReader(); fr.onload = () => { const d = String(fr.result);
          if (d.length > AU_MAX - 200) { say('That clip is too big to save. Try a shorter one.', true); return; }
          att.au = d; att.secs = Math.min(AU_SECS, secs); drawPrev(); say('Voice note recorded (' + Math.round(att.secs) + ' seconds).'); };
        fr.readAsDataURL(blob);
      };
      rec.start(); recT = performance.now(); micB.style.background = '#ec3013';
      const tick = () => { const s = (performance.now() - recT) / 1000; micB.textContent = '\u25A0 Stop \u00B7 ' + Math.ceil(AU_SECS - s) + 's'; if (s >= AU_SECS) stopRec(); };
      tick(); recTimer = setInterval(tick, 250); say('Recording. Tap Stop when you\u2019re done.');
    };
    media.append(micB, camB, fileIn, prev);
    // a big picture and a voice clip together would make the note too large for the note servers: shrink the picture to fit
    const shrink = (d, lim) => new Promise(res => { const im = new Image(); im.onload = () => { let k = 1, out = d; const cv = document.createElement('canvas');
      while (out.length > lim && k > 0.2) { k *= 0.8; cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); out = cv.toDataURL('image/jpeg', 0.7); }
      res(out.length <= lim ? out : null); }; im.onerror = () => res(null); im.src = d; });
    b.onclick = async () => { stopRec(); b.disabled = true;
      if (att.img && att.au && att.img.length > IMG_MAX - 200) { const d = await shrink(att.img, IMG_MAX - 200); if (d) att.img = d; else att.img = null; }
      const r = await send(ta.value, { ...att }); b.disabled = false; if (r.error) { say(r.error, true); return; }
      ta.value = ''; att.img = att.au = null; att.secs = 0; drawPrev();
      say(r.pending ? 'Saved \u2713 Your photo and voice will show once the gallery team approves them.' : r.saved ? 'Saved \u2713 Everyone can see it.' : 'Shared with everyone here \u2713 (the note servers didn\u2019t answer, so it may not be kept).'); };
    row.append(b, st); f.append(media, ta, row);
    ta.addEventListener('keydown', e => e.stopPropagation());   // typing doesn't walk the fox
    return { f, ta };
  }
  function openBook() {
    bookOpen = true;
    const wrap = el('div');
    const c = composer('Write in the guest book…', 'Sign the book', (t, a) => post('book', t, { ...a })); wrap.appendChild(c.f);
    const list = visible('book');
    wrap.appendChild(el('div', 'font:800 11px/1 ' + FONT + ';letter-spacing:.14em;text-transform:uppercase;color:#ff9783;margin:18px 0 4px', list.length ? list.length + (list.length === 1 ? ' signature' : ' signatures') : 'No signatures yet'));
    list.slice(0, 60).forEach(n => wrap.appendChild(noteRow(n, () => openBook())));
    showPanel('Guest book', 'Sign the guest book', wrap, () => { bookOpen = false; });
  }
  function openCompose() {
    const [x, y, z] = W.pos();
    const wrap = el('div'); wrap.appendChild(el('p', 'margin:0;font:400 15px/1.5 ' + FONT, 'Your note stays right here. Anyone who walks by sees it open up and hears it. Add your voice and a photo of yourself if you like; those show once the gallery team approves them.'));
    const c = composer('What would you like to leave here?', 'Leave the note', async (t, a) => { const r = await post('spot', t, { ...a, p: [+x.toFixed(2), +y.toFixed(2), +z.toFixed(2)] }); return r; });
    wrap.appendChild(c.f); showPanel('Leave a note', 'A note for this spot', wrap); setTimeout(() => c.ta.focus(), 50);
  }
  function openSpot(item) {
    const n = notes.get(item.id); if (!n) return;
    const here = visible('spot').filter(q => Math.hypot(q.p[0] - n.p[0], q.p[2] - n.p[2]) < 1.5);
    const wrap = el('div'); here.forEach(q => wrap.appendChild(noteRow(q, () => openSpot(item))));
    const [x, y, z] = n.p; const c = composer('Reply with a note here…', 'Leave a note', (t, a) => post('spot', t, { ...a, p: [x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4] }));
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
      const c = composer('Leave a note on this artwork…', 'Leave a note', (t, at) => post('art', t, { ...at, art: artKey(a), title: a.title || '', p: [+a.ctr.x.toFixed(2), +a.ctr.y.toFixed(2), +a.ctr.z.toFixed(2)] }).then(r => { if (!r.error) setTimeout(draw, 50); return r; }));
      sec.appendChild(c.f);
    };
    draw(); return sec;
  }

  return {
    onEvent: (id, d) => { if (d && d.k === 'note') ingest(d.e); },
    openBook, openCompose, openSpot, openWhy, artSection, countFor: a => forArt(a).length,
    admin: () => !!adminSk, count: () => visible().length, relaysOpen: () => relays.filter(r => r.open).length, me, room, okCount: () => okCount,
  };
}
