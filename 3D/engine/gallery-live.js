// Blind Canvas gallery: the host goes live.
// The host can put their webcam, or a shared screen/window/tab, onto the big screen of the room they're in.
// Everyone in that room sees it on the screen (the room film drops to a murmur); people elsewhere get an invite to come.
// Video goes straight from the host to each visitor (WebRTC via gallery-net). Voice stays on the MIC button.
// Messages on the 'ev' channel: { k: 'live', a: 'on' | 'off', idx, kind: 'cam' | 'screen' }.
export function setupLive({ G, net, announce, nameOf, invite }) {
  let mine = null;               // { stream, idx, kind } while I'm live
  const streams = new Map();     // peer id -> video stream they sent
  let watching = null;           // { from, idx, kind } the live show on now

  const label = k => k === 'screen' ? 'screen share' : 'camera';
  function show() {
    if (mine) return;
    if (!watching) { G.live.clear(); return; }
    const st = streams.get(watching.from);
    if (st && G.live.active() !== watching.idx) G.live.show(watching.idx, st);
  }
  async function start(kind) {
    if (mine) stop(true);
    let stream;
    try {
      stream = kind === 'screen'
        ? await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15, width: { ideal: 1280 } }, audio: false })
        : await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 960 }, height: { ideal: 540 }, frameRate: { ideal: 24 }, facingMode: 'user' }, audio: false });
    } catch (e) {
      announce(e && e.name === 'NotAllowedError' ? 'The ' + label(kind) + ' was blocked. Allow it in your browser to go live.' : kind === 'screen' ? 'Screen sharing is not available on this device.' : 'No camera was found.');
      return false;
    }
    const [x, y, z] = G.localState(), idx = G.live.nearest(x, y, z);
    mine = { stream, idx, kind };
    G.live.show(idx, stream);
    net.video.add(stream);
    net.event({ k: 'live', a: 'on', idx, kind });
    stream.getVideoTracks().forEach(t => t.addEventListener('ended', () => { if (mine && mine.stream === stream) stop(); }));   // "Stop sharing" in the browser bar
    announce('You are live: your ' + label(kind) + ' is on the big screen. Turn your mic on to talk.');
    return true;
  }
  function stop(quiet) {
    if (!mine) return;
    net.video.remove(mine.stream); mine.stream.getTracks().forEach(t => t.stop());
    mine = null; G.live.clear(); net.event({ k: 'live', a: 'off' });
    if (!quiet) announce('You are no longer live.');
    show();
  }
  function onStream(id, stream, meta = {}) {
    if (!stream.getVideoTracks().length || meta.kind === 'face') return;   // a camera on someone's fox head, not the big screen
    streams.set(id, stream);
    stream.getVideoTracks().forEach(t => t.addEventListener('ended', () => { if (streams.get(id) === stream) streams.delete(id); }));
    show();
  }
  function onEvent(id, d) {
    if (!d || d.k !== 'live') return;
    const nm = nameOf(id);
    if (d.a === 'on' && Number.isInteger(d.idx)) {
      watching = { from: id, idx: d.idx, kind: d.kind };
      show();
      const [x, y, z] = G.localState(), p = G.live.pos(d.idx), far = Math.hypot(p[0] - x, p[2] - z) > 35 || Math.abs(p[1] - y) > 6;
      announce(nm + ' is live with their ' + label(d.kind) + ' on the big screen.');
      if (far && invite) invite('live' + id, id, nm + ' is live', 'Their ' + label(d.kind) + ' is on the big screen', 'Go watch', () => G.goTo(id));
    } else if (d.a === 'off' && watching && watching.from === id) {
      watching = null; G.live.clear(); announce(nm + ' stopped the live ' + label(d.kind || 'cam') + '.');
    }
  }
  function onNewPeer(id) { if (mine) net.event({ k: 'live', a: 'on', idx: mine.idx, kind: mine.kind }, id); }
  function onLeave(id) { streams.delete(id); if (watching && watching.from === id) { watching = null; G.live.clear(); } }
  const canShare = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  return { start, stop, onStream, onEvent, onNewPeer, onLeave, on: () => !!mine, kind: () => mine && mine.kind, canShare };
}
