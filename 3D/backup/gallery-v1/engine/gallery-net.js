// Blind Canvas gallery: multiplayer presence.
// Default transport is serverless (Trystero over public Nostr relays for matchmaking, then direct WebRTC between visitors),
// so the site stays plain files on GitHub Pages with no account or server. ?net=local uses BroadcastChannel (tabs on one
// device, for testing). ?room=<name> gives a private room (only people with that link meet each other).
export async function connectGallery({ room = 'lobby', onJoin = () => {}, onLeave = () => {}, onState = () => {}, onEmote = () => {}, onStatus = () => {} } = {}) {
  const qs = new URLSearchParams(location.search);
  const roomName = 'bcp-gallery-' + (qs.get('room') || room).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const mode = qs.get('net') || 'p2p';
  let send = { hi: () => {}, st: () => {}, em: () => {} }, myId = Math.random().toString(36).slice(2, 10), leave = () => {};
  const seen = new Set();
  if (mode === 'off') { onStatus('off'); return { send: () => {}, emote: () => {}, hello: () => {}, id: myId, leave }; }
  if (mode === 'local') {
    const bc = new BroadcastChannel(roomName);
    const post = (t, d, to) => bc.postMessage({ t, d, from: myId, to });
    bc.onmessage = ({ data: m }) => {
      if (m.to && m.to !== myId) return;
      if (!seen.has(m.from)) { seen.add(m.from); onJoin(m.from); if (profile.name) post('hi', profile, m.from); }
      if (m.t === 'hi') onState(m.from, null, m.d); else if (m.t === 'st') onState(m.from, m.d); else if (m.t === 'em') onEmote(m.from, m.d); else if (m.t === 'bye') { seen.delete(m.from); onLeave(m.from); }
    };
    send = { hi: (d, to) => post('hi', d, to), st: d => post('st', d), em: d => post('em', d) };
    leave = () => post('bye', 0);
    addEventListener('pagehide', leave);
    onStatus('local');
  } else {
    try {
      const { joinRoom, selfId } = await import('../vendor/trystero-nostr.js');
      myId = selfId;
      const r = joinRoom({ appId: '8gates-blind-canvas-gallery' }, roomName);
      const hi = r.makeAction('hi'), st = r.makeAction('st'), em = r.makeAction('em');   // trystero 0.25 action objects
      r.onPeerJoin = id => { onJoin(id); if (profile.name) hi.send(profile, { target: id }); };
      r.onPeerLeave = id => onLeave(id);
      hi.onMessage = (d, { peerId }) => onState(peerId, null, d);
      st.onMessage = (d, { peerId }) => onState(peerId, d);
      em.onMessage = (d, { peerId }) => onEmote(peerId, d);
      send = { hi: (d, to) => hi.send(d, to ? { target: to } : undefined), st: d => st.send(d), em: d => em.send(d) };
      leave = () => r.leave();
      addEventListener('pagehide', leave);
      onStatus('online');
    } catch (e) { console.warn('multiplayer unavailable', e); onStatus('offline'); }
  }
  let profile = {};
  return {
    id: myId,
    hello(p) { profile = p; send.hi(p); },          // name + look; re-sent whenever it changes
    send(state) { send.st(state); },                 // [x, y, z, face, speed, air]
    emote(e) { send.em(e); },
    leave,
  };
}
