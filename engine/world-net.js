// FOX GATE 8 · WORLD NET (from the Blind Canvas gallery kit, engine/gallery-net.js): up to 4 players per world, no server.
// Trystero over public Nostr relays for matchmaking, then direct WebRTC phone to phone. ?net=local = BroadcastChannel (tabs on one
// device, for testing) · ?net=off = solo · ?room=ABCD = a private room. Never blocks solo play: if the library fails, status 'offline'.
export async function connectWorld({ world = 'lobby', onJoin = () => {}, onLeave = () => {}, onState = () => {}, onEvent = () => {}, onStatus = () => {} } = {}) {
  const qs = new URLSearchParams(location.search), code = (qs.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const roomName = 'fg8-' + world + (code ? '-' + code.toLowerCase() : ''), mode = qs.get('net') || 'p2p';
  let keep = null, send = { hi: () => {}, st: () => {}, ev: () => {} }, myId = Math.random().toString(36).slice(2, 10), leave = () => {}, profile = {};
  const seen = new Set();
  if (mode === 'off') { onStatus('off'); return { id: myId, code, hello() {}, send() {}, event() {}, leave }; }
  if (mode === 'local') {
    const bc = keep = new BroadcastChannel(roomName), post = (t, d, to) => bc.postMessage({ t, d, from: myId, to });
    bc.onmessage = ({ data: m }) => { if (m.to && m.to !== myId) return;
      if (!seen.has(m.from) && m.t !== 'bye') { seen.add(m.from); onJoin(m.from); if (profile.name) post('hi', profile, m.from); }
      if (m.t === 'hi') onState(m.from, null, m.d); else if (m.t === 'st') onState(m.from, m.d); else if (m.t === 'ev') onEvent(m.from, m.d); else if (m.t === 'bye') { seen.delete(m.from); onLeave(m.from); } };
    send = { hi: (d, to) => post('hi', d, to), st: d => post('st', d), ev: (d, to) => post('ev', d, to) }; leave = () => post('bye', 0); addEventListener('pagehide', leave); onStatus('local');
  } else {
    try { const { joinRoom, selfId } = await import('../vendor/trystero-nostr.js'); myId = selfId;
      const r = joinRoom({ appId: 'foxgate8-worlds' }, roomName), hi = r.makeAction('hi'), st = r.makeAction('st'), ev = r.makeAction('ev');
      r.onPeerJoin = id => { onJoin(id); if (profile.name) hi.send(profile, { target: id }); }; r.onPeerLeave = id => onLeave(id);
      hi.onMessage = (d, { peerId }) => onState(peerId, null, d); st.onMessage = (d, { peerId }) => onState(peerId, d); ev.onMessage = (d, { peerId }) => onEvent(peerId, d);
      send = { hi: (d, to) => hi.send(d, to ? { target: to } : undefined), st: d => st.send(d), ev: (d, to) => ev.send(d, to ? { target: to } : undefined) };
      leave = () => r.leave(); addEventListener('pagehide', leave); onStatus('online');
    } catch (e) { console.warn('multiplayer unavailable', e); onStatus('offline'); }
  }
  return { _keep: keep, id: myId, code, hello(p) { profile = p; send.hi(p); }, send(s) { send.st(s); }, event(d, to) { send.ev(d, to); }, leave };
}
