// FOX GATE 8 minigames: no-server rooms for 2+ players (adapted from the Blind Canvas gallery's gallery-net.js).
// Trystero over public Nostr relays finds the other players, then direct WebRTC links carry the game.
// ?net=local = BroadcastChannel (tabs on one device) · ?net=off = no network.
// Every message travels on ONE trystero action ('mx') as { t, d }, so a game may use ANY message name
// ('hi', 'st', 'rq', 'ev', 'sn', ...). Older versions only carried hi / in / sn / ev / pg and silently dropped the rest.
export async function connectDuel({ game = 'duel', code = 'lobby', onJoin = () => {}, onLeave = () => {}, onMsg = () => {}, onStatus = () => {} } = {}) {
  const qs = new URLSearchParams(location.search);
  const room = 'fg8-' + game + '-' + String(code).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  const mode = qs.get('net') || 'p2p';
  let id = Math.random().toString(36).slice(2, 10), send = () => {}, leave = () => {};
  if (mode === 'off') { onStatus('off'); return { id, send, leave, mode }; }
  if (mode === 'local') {
    const bc = new BroadcastChannel(room), seen = new Set();
    const post = (t, d, to) => bc.postMessage({ t, d, from: id, to });
    bc.onmessage = ({ data: m }) => {
      if (m.to && m.to !== id) return;
      if (m.t === 'bye') { if (seen.delete(m.from)) onLeave(m.from); return; }
      if (!seen.has(m.from)) { seen.add(m.from); onJoin(m.from); }
      onMsg(m.t, m.d, m.from);
    };
    send = (t, d, to) => post(t, d, to);
    leave = () => { post('bye', 0); bc.close(); removeEventListener('pagehide', leave); };
    addEventListener('pagehide', leave);
    onStatus('local');
    return { id, send, leave, mode };
  }
  try {
    const { joinRoom, selfId } = await import('../vendor/trystero-nostr.js');
    id = selfId;
    const r = joinRoom({ appId: '8gates-minigames' }, room);
    const mx = r.makeAction('mx');
    mx.onMessage = (m, { peerId }) => { if (m && typeof m.t === 'string') onMsg(m.t, m.d, peerId); };
    r.onPeerJoin = pid => onJoin(pid);
    r.onPeerLeave = pid => onLeave(pid);
    send = (t, d, to) => { try { mx.send({ t, d: d === undefined ? null : d }, to ? { target: to } : undefined); } catch (e) {} };
    leave = () => { try { r.leave(); } catch (e) {} removeEventListener('pagehide', leave); };
    addEventListener('pagehide', leave);
    onStatus('online');
  } catch (e) { console.warn('online play unavailable', e); onStatus('offline'); }
  return { id, send, leave, mode };
}
