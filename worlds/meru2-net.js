// MERU 2 · ONLINE (s37, Ben): up to 4 foxes share Meru and roam freely (no waiting, split up, explore). engine/world-net.js, room 'fg8-meru2'
// (+ ?room=CODE private). Seats by join time; slot colour RED / BLUE / GOLD / GREEN on the armour, ring + name tag, glide damp 10 / snap > 8 m.
// MINIGAMES WITH FRIENDS: when you start a minigame (a NOW HIRING / PLAY spot) the others see "<NAME> IS AT <GAME> · TAKE SEAT n" with a marker;
// walking up to the same spot gives a JOIN prompt; every seat opens the minigame with the SAME room code (?room=) so games that play online meet.
import { connectWorld } from '../engine/world-net.js';
export function createMeru2Net(W, { onHud = () => {} } = {}) {
  const { THREE, scene, cast, kit, P, CT } = W, SLOTC = ['#ec3013', '#2e7fd6', '#e8b84a', '#2fae55'], SLOTN = ['RED', 'BLUE', 'GOLD', 'GREEN'];
  const N = { link: null, id: 'me', t0: Date.now(), peers: new Map(), seated: [], slot: 0, status: 'connecting', sentAt: 0, last: '', mg: null };
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), ang = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const tagTex = (txt, col) => CT(256, 64, (g, w) => { g.fillStyle = '#000'; g.fillRect(0, 8, w, 48); g.fillStyle = col; g.fillRect(0, 8, 12, 48); g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(txt, 22, 33, w - 30); });
  const seatCode = () => (N.link && N.link.code) || ('M' + Math.abs([...N.seated].sort().join('').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).toUpperCase().slice(0, 5));
  function reseat() { const all = [{ id: N.id, t0: N.t0 }, ...[...N.peers.values()].filter(p => p.t0)].sort((a, b) => a.t0 - b.t0 || (a.id < b.id ? -1 : 1)); N.seated = all.slice(0, 4).map(p => p.id); const i = N.seated.indexOf(N.id); N.full = i < 0; N.slot = Math.max(0, i);
    for (const p of N.peers.values()) { p.slot = N.seated.indexOf(p.id); if (p.fox) look(p); } if (N.full && N.link) { N.link.leave(); N.link = null; } }
  function look(p) { if (p.slot < 0) { p.fox.visible = p.ring.visible = p.tag.visible = false; return; } const col = SLOTC[p.slot % 4]; p.ring.material.color.set(col); p.tag.material.map = tagTex(p.name || SLOTN[p.slot], col); p.tag.material.needsUpdate = true; }
  function mk(p) { if (p.fox) return; p.fox = cast.make('player', { torso: [SLOTC[Math.max(0, p.slot) % 4], '#e7edf4', '#6b7d93'] }); p.fox.userData.noCull = true; if (!p.fox.parent) scene.add(p.fox);
    p.ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })); p.ring.rotation.x = -Math.PI / 2; scene.add(p.ring);
    p.tag = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false })); p.tag.scale.set(1.6, 0.4, 1); p.tag.renderOrder = 26; scene.add(p.tag); look(p); }
  function drop(id) { const p = N.peers.get(id); if (!p) return; for (const o of [p.fox, p.ring, p.tag, p.mark]) if (o) scene.remove(o); N.peers.delete(id); reseat(); }
  const hello = () => N.link && N.link.hello({ name: (W.name() || 'FOX').toUpperCase().slice(0, 10), t0: N.t0 });
  (async () => { if (/[?&](net=off|robdemo=1)/.test(location.search) || !/[?&](net=(on|local)|room=)/.test(location.search))   /* s718d (Ben: "another PLAYER with a red ring"): online is OPT-IN now: only an invite link (?net=on / ?room=CODE) or ?net=local joins the shared Meru, so a second open copy of the game (another tab, the phone, a preview) never walks into your world */   /* s335: the Rob demo plays solo (no friends' foxes walking into the shots) */ { N.status = 'off'; return; }
    try { N.link = await connectWorld({ world: 'meru2', onStatus: s => { N.status = s; },
      onJoin: id => { if (!N.peers.has(id)) N.peers.set(id, { id, last: performance.now() }); hello(); }, onLeave: drop,
      onState: (id, st, prof) => { let p = N.peers.get(id); if (!p) { p = { id }; N.peers.set(id, p); if (!prof) N.link.event({ k: 'who' }, id); } p.last = performance.now(); if (prof) { p.name = prof.name; if (p.t0 !== prof.t0) { p.t0 = prof.t0; reseat(); } if (p.fox) look(p); } if (st) { p.st = st; if (!p.fox && p.slot >= 0) mk(p); } },
      onEvent: (id, d) => { let p = N.peers.get(id); if (!p) { p = { id }; N.peers.set(id, p); } p.last = performance.now(); if (!d) return; if (d.k === 'who') hello(); else if (d.k === 'mg') { p.mg = d.mg || null; mark(p); }
        // PARTY PLAY (s37b): invite → accept / decline → host fills the seats → GO (everyone opens the game with the same room code)
        else if (d.k === 'pinv' && !N.party && !N.mg) { N.inv = { ...d.p, from: id, fromName: p.name || SLOTN[Math.max(0, p.slot) % 4], fromCol: SLOTC[Math.max(0, p.slot) % 4], until: performance.now() + 10000, state: 'ask' }; }
        else if (d.k === 'pacc' && N.party && N.party.id === d.pid && N.party.state === 'wait') { const P0 = N.party; if (P0.acc.length < P0.seats - 1 && !P0.acc.includes(id)) { P0.acc.push(id); N.link.event({ k: 'pok', pid: P0.id, seat: P0.acc.length + 1 }, id); if (P0.acc.length >= P0.seats - 1) go(); } else N.link.event({ k: 'pfull', pid: P0.id }, id); }
        else if (d.k === 'pdec' && N.party && N.party.id === d.pid) { N.party.dec = (N.party.dec || 0) + 1; }
        else if ((d.k === 'pok' || d.k === 'pfull') && N.inv && N.inv.id === d.pid) { N.inv.state = d.k === 'pok' ? 'in' : 'full'; N.inv.seat = d.seat; if (d.k === 'pfull') N.inv.until = performance.now() + 1500; }
        else if (d.k === 'pgo' && N.inv && N.inv.id === d.pid) { const I = N.inv; N.inv = null; if (d.ids.includes(N.id) && N.onGo) N.onGo({ url: I.url, label: I.label, code: d.code, n: d.ids.length }); }
        else if (d.k === 'pcancel' && N.inv && N.inv.id === d.pid) N.inv = null; } });
      N.id = N.link.id; reseat(); hello(); } catch (e) { N.status = 'offline'; } })();
  function go() { const P0 = N.party; if (!P0 || P0.state !== 'wait') return; P0.state = 'go'; const ids = [N.id, ...P0.acc]; if (ids.length > 1) N.link.event({ k: 'pgo', pid: P0.id, code: P0.code, ids }); N.party = null; N.onGo && N.onGo({ url: P0.url, label: P0.label, code: ids.length > 1 ? P0.code : null, n: ids.length }); }
  // a gold seat marker over the minigame a friend is playing
  function mark(p) { if (p.mark) { scene.remove(p.mark); p.mark = null; } if (!p.mg) return; const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.5, 32), new THREE.MeshBasicMaterial({ color: SLOTC[Math.max(0, p.slot) % 4], transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.y = 0.06; g.add(r);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex('SEAT FREE · JOIN', '#ffd23a'), depthTest: false })); s.scale.set(2.4, 0.6, 1); s.position.y = 2.9; s.renderOrder = 26; g.add(s); g.position.set(p.mg.x, p.mg.y || 0, p.mg.z); scene.add(g); p.mark = g; }
  return {
    tick(dt, inside) { const now = performance.now(); for (const p of [...N.peers.values()]) if (now - (p.last || now) > 25000) drop(p.id);
      if (N.link) { const st = [+P.x.toFixed(2), +P.y.toFixed(2), +P.z.toFixed(2), +P.yaw.toFixed(2), +(P.sp || 0).toFixed(1), P.ground ? 0 : 1, inside || '', N.mg ? 1 : 0], k = st.join(), since = now - N.sentAt; if ((k !== N.last && since >= 100) || since >= 1000) { N.link.send(st); N.last = k; N.sentAt = now; } }
      for (const p of N.peers.values()) { if (!p.fox) continue; const s = p.st, show = p.slot >= 0 && s && (s[6] || '') === (inside || '') && !s[7]; p.fox.visible = p.ring.visible = p.tag.visible = !!show; if (!show) continue;
        const f = p.fox.position, far = Math.hypot(s[0] - f.x, s[2] - f.z) > 8 || Math.abs(s[1] - f.y) > 4; f.set(far ? s[0] : damp(f.x, s[0], 10, dt), far ? s[1] : damp(f.y, s[1], 12, dt), far ? s[2] : damp(f.z, s[2], 10, dt)); p.fox.rotation.y += ang(s[3], p.fox.rotation.y) * Math.min(1, dt * 10);
        kit.animFox(p.fox, dt, s[4], !!s[5]); p.ring.position.set(f.x, f.y + 0.04, f.z); p.tag.position.set(f.x, f.y + 2.5, f.z); }
      for (const p of N.peers.values()) if (p.mark) p.mark.children[0].scale.setScalar(1 + 0.08 * Math.sin(now / 200));
      if (N.party && N.party.state === 'wait' && (now > N.party.until || (N.party.dec || 0) >= this.others())) go();
      if (N.inv && now > N.inv.until && N.inv.state !== 'in') { if (N.inv.state === 'ask') N.link && N.link.event({ k: 'pdec', pid: N.inv.id }, N.inv.from); N.inv = null; }
      onHud(this.hud()); },
    // a minigame spot near you that a friend is already playing
    friendAt(h) { if (!h) return null; for (const p of N.peers.values()) if (p.mg && p.slot >= 0 && p.mg.url === h.url) return { name: p.name || SLOTN[p.slot], col: SLOTC[p.slot % 4], code: p.mg.code, seat: [...N.peers.values()].filter(q => q.mg && q.mg.url === h.url).length + 1 }; return null; },
    // you start / leave a minigame: tell everyone + get the shared room code
    playing(h) { if (!h) { N.mg = null; N.link && N.link.event({ k: 'mg', mg: null }); return null; } const fr = this.friendAt(h), code = fr ? fr.code : seatCode(); N.mg = { url: h.url, label: h.label, x: h.x, z: h.z, y: h.y || 0, code }; N.link && N.link.event({ k: 'mg', mg: N.mg }); return this.multi() ? code : null; },
    multi() { return N.seated.length > 1 && !!N.link; },
    others() { return [...N.peers.values()].filter(p => p.slot >= 0 && p.t0).length; },
    set onGo(fn) { N.onGo = fn; },
    partyStart(g, seats) { if (!N.link || !this.multi()) { N.onGo && N.onGo({ url: g.url, label: g.label, code: null, n: 1 }); return; } const id = N.id + '-' + Date.now().toString(36);
      N.party = { id, url: g.url, label: g.label, seats, acc: [], dec: 0, code: 'P' + Math.random().toString(36).slice(2, 7).toUpperCase(), until: performance.now() + 10000, state: 'wait' };
      N.link.event({ k: 'pinv', p: { id, url: g.url, label: g.label, seats } }); },
    partyNow() { go(); }, partyCancel() { if (!N.party) return; N.link && N.link.event({ k: 'pcancel', pid: N.party.id }); N.party = null; },
    partyAnswer(yes) { const I = N.inv; if (!I || I.state !== 'ask') return; if (yes) { I.state = 'sent'; I.until = performance.now() + 12000; N.link.event({ k: 'pacc', pid: I.id }, I.from); } else { N.link.event({ k: 'pdec', pid: I.id }, I.from); N.inv = null; } },
    invite() { const c = (N.link && N.link.code) || Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.random() * 31 | 0]).join(''); return c; },
    hud() { const ps = [...N.peers.values()].filter(p => p.slot >= 0 && p.t0), now = performance.now(), nm = id => { const q = N.peers.get(id); return q ? { name: q.name || SLOTN[Math.max(0, q.slot) % 4], col: SLOTC[Math.max(0, q.slot) % 4] } : { name: 'FOX', col: '#ffd23a' }; };
      return { party: N.party ? { label: N.party.label, seats: N.party.seats, left: Math.max(0, Math.ceil((N.party.until - now) / 1000)), acc: N.party.acc.map(nm), me: { name: 'YOU', col: SLOTC[N.slot % 4] } } : null, invite: N.inv ? { label: N.inv.label, seats: N.inv.seats, from: N.inv.fromName, col: N.inv.fromCol, state: N.inv.state, seat: N.inv.seat, left: Math.max(0, Math.ceil((N.inv.until - now) / 1000)) } : null, status: N.status, n: Math.min(4, ps.length + 1), code: N.link ? N.link.code : '', full: !!N.full, me: SLOTN[N.slot % 4], col: SLOTC[N.slot % 4],
      peers: ps.sort((a, b) => a.slot - b.slot).map(p => { const s = p.st || []; return { name: p.name || SLOTN[p.slot], col: SLOTC[p.slot % 4], what: p.mg ? 'PLAYING ' + String(p.mg.label || 'A GAME').toUpperCase() : s[6] ? 'INSIDE ' + String(s[6]).toUpperCase() : s.length ? Math.round(Math.hypot(s[0] - P.x, s[2] - P.z)) + ' M AWAY' : '…' }; }) }; },
    _dbg: N,
  };
}
