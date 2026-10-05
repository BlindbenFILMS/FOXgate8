// Blind Canvas gallery: multiplayer presence.
// Default transport is serverless (Trystero over public Nostr relays for matchmaking, then direct WebRTC between visitors),
// so the site stays plain files on GitHub Pages with no account or server. ?net=local uses BroadcastChannel (tabs on one
// device, for testing). ?room=<name> gives a private room (only people with that link meet each other).
export async function connectGallery({ room = 'lobby', onJoin = () => {}, onLeave = () => {}, onState = () => {}, onEmote = () => {}, onEvent = () => {}, onStream = () => {}, onStatus = () => {} } = {}) {
  const qs = new URLSearchParams(location.search);
  const roomName = 'bcp-gallery-' + (qs.get('room') || room).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const mode = qs.get('net') || 'p2p';
  let send = { hi: () => {}, st: () => {}, em: () => {}, ev: () => {} }, voice = { add: () => false, remove: () => {} }, video = { add: () => false, remove: () => {} }, face = { add: () => false, remove: () => {} }, mic = null, cam = null, head = null, myId = Math.random().toString(36).slice(2, 10), leave = () => {};
  const seen = new Set();
  if (mode === 'off') { onStatus('off'); return { send: () => {}, emote: () => {}, hello: () => {}, event: () => {}, voice, video, face, id: myId, leave }; }
  if (mode === 'local') {
    const bc = new BroadcastChannel(roomName);
    const post = (t, d, to) => bc.postMessage({ t, d, from: myId, to });
    bc.onmessage = ({ data: m }) => {
      if (m.to && m.to !== myId) return;
      if (!seen.has(m.from)) { seen.add(m.from); onJoin(m.from); if (profile.name) post('hi', profile, m.from); }
      if (m.t === 'hi') onState(m.from, null, m.d); else if (m.t === 'st') onState(m.from, m.d); else if (m.t === 'em') onEmote(m.from, m.d); else if (m.t === 'ev') onEvent(m.from, m.d); else if (m.t === 'bye') { seen.delete(m.from); onLeave(m.from); }
    };
    send = { hi: (d, to) => post('hi', d, to), st: d => post('st', d), em: d => post('em', d), ev: (d, to) => post('ev', d, to) };
    leave = () => post('bye', 0);
    addEventListener('pagehide', leave);
    onStatus('local');
  } else {
    try {
      const { joinRoom, selfId } = await import('../vendor/trystero-nostr.js');
      myId = selfId;
      const r = joinRoom({ appId: '8gates-blind-canvas-gallery' }, roomName);
      const hi = r.makeAction('hi'), st = r.makeAction('st'), em = r.makeAction('em'), ev = r.makeAction('ev');   // trystero 0.25 action objects
      r.onPeerJoin = id => { onJoin(id); if (profile.name) hi.send(profile, { target: id }); if (mic) { try { r.addStream(mic, { target: id, metadata: { kind: 'mic' } }); } catch (e) {} } if (cam) { try { r.addStream(cam, { target: id, metadata: { kind: 'live' } }); } catch (e) {} } if (head) { try { r.addStream(head, { target: id, metadata: { kind: 'face' } }); } catch (e) {} } };
      r.onPeerStream = (stream, peerId, meta) => onStream(peerId, stream, meta || {});   // meta.kind: 'mic' | 'live' | 'face'
      video = { add: s => { cam = s; r.addStream(s, { metadata: { kind: 'live' } }); return true; }, remove: s => { cam = null; try { r.removeStream(s); } catch (e) {} } };   // the host's camera / screen share
      voice = { add: s => { mic = s; r.addStream(s, { metadata: { kind: 'mic' } }); return true; }, remove: s => { mic = null; try { r.removeStream(s); } catch (e) {} } };   // voice chat: only when the visitor turns their mic on
      face = { add: s => { head = s; r.addStream(s, { metadata: { kind: 'face' } }); return true; }, remove: s => { head = null; try { r.removeStream(s); } catch (e) {} } };   // a visitor's camera on their fox (screen head / face mask)
      r.onPeerLeave = id => onLeave(id);
      hi.onMessage = (d, { peerId }) => onState(peerId, null, d);
      st.onMessage = (d, { peerId }) => onState(peerId, d);
      em.onMessage = (d, { peerId }) => onEmote(peerId, d);
      ev.onMessage = (d, { peerId }) => onEvent(peerId, d);
      send = { hi: (d, to) => hi.send(d, to ? { target: to } : undefined), st: d => st.send(d), em: d => em.send(d), ev: (d, to) => ev.send(d, to ? { target: to } : undefined) };
      leave = () => r.leave();
      addEventListener('pagehide', leave);
      onStatus('online');
    } catch (e) { console.warn('multiplayer unavailable', e); onStatus('offline'); }
  }
  let profile = {};
  return {
    id: myId,
    hello(p) { profile = p; send.hi(p); },          // name + look; re-sent whenever it changes
    send(state) { send.st(state); },                 // [x, y, z, face, speed, air, sitting]
    emote(e) { send.em(e); },
    event(d, to) { send.ev(d, to); },                // visiting together: tours, watch parties, the shared Six Views wall
    get voice() { return voice; },
    get face() { return face; },                     // { add(stream), remove(stream) }: your camera on your fox's head
    get video() { return video; },                   // { add(stream), remove(stream) }: the host's live camera or screen                   // { add(stream), remove(stream) }; a no-op in local test mode
    leave,
  };
}
