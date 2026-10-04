// Blind Canvas gallery: voice chat.
// Nothing is asked for at load. When someone else is in the gallery a MIC button appears beside the wave; tapping it asks
// for the microphone and sends your voice straight to the other visitors (WebRTC, via gallery-net). Tap again to stop.
// Everyone hears everyone whose mic is on, louder the closer their fox is (never below 35%, so a tour guide carries).
// If everyone else leaves, your mic switches itself off.
export function setupVoice({ G, net, button, announce, nameOf }) {
  const peers = new Map();        // id -> { audio, stream }
  const micOn = new Set();        // ids whose mic is on (from their 'mic' events)
  let mine = null, busy = false, spotlight = null;   // spotlight: the host's voice carries at full volume everywhere

  function label() {
    const others = G.remote.count() > 0;
    button.style.display = others || mine ? '' : 'none';
    button.textContent = mine ? 'MIC\nON' : 'MIC\nOFF';
    button.classList.toggle('on', !!mine);
    button.setAttribute('aria-pressed', mine ? 'true' : 'false');
    button.setAttribute('aria-label', mine ? 'Microphone on. Tap to turn it off' : 'Microphone off. Tap to talk to the other visitors');
  }
  async function turnOn() {
    if (mine || busy) return; busy = true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unsupported');
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      mine = s;
      if (!net.voice.add(s)) announce('Voice chat needs the online gallery; it is off in this test mode.');
      net.event({ k: 'mic', on: true });
      announce('Your mic is on. Everyone in the gallery can hear you.');
    } catch (e) {
      announce(e && e.name === 'NotAllowedError' ? 'The microphone was blocked. Allow it in your browser settings to talk.' : 'No microphone was found.');
      button.textContent = 'NO\nMIC'; setTimeout(label, 2500); busy = false; return;
    }
    busy = false; label();
  }
  function turnOff(why) {
    if (!mine) return;
    net.voice.remove(mine); mine.getTracks().forEach(t => t.stop()); mine = null;
    net.event({ k: 'mic', on: false });
    announce(why || 'Your mic is off.');
    label();
  }
  button.onclick = () => (mine ? turnOff() : turnOn());

  // incoming voices
  function onStream(id, stream) {
    if (stream.getVideoTracks().length || !stream.getAudioTracks().length) return;   // video streams belong to the live screen
    drop(id);
    const audio = document.createElement('audio');
    audio.autoplay = true; audio.playsInline = true; audio.setAttribute('playsinline', ''); audio.srcObject = stream;
    audio.style.display = 'none'; document.body.appendChild(audio);
    const p = audio.play(); if (p && p.catch) p.catch(() => {});
    peers.set(id, { audio, stream });
    stream.getAudioTracks().forEach(t => t.addEventListener('ended', () => { if (peers.get(id) && peers.get(id).stream === stream) drop(id); }));
  }
  function drop(id) { const p = peers.get(id); if (!p) return; p.audio.pause(); p.audio.srcObject = null; p.audio.remove(); peers.delete(id); }
  function onEvent(id, d) {
    if (!d || d.k !== 'mic') return;
    if (d.on) { micOn.add(id); announce(nameOf(id) + ' turned their mic on.'); }
    else { micOn.delete(id); announce(nameOf(id) + ' turned their mic off.'); }
  }
  function onLeave(id) { drop(id); micOn.delete(id); if (G.remote.count() === 0) turnOff('Everyone else has left, so your mic is now off.'); label(); }
  function onNewPeer(id) { if (mine) net.event({ k: 'mic', on: true }, id); label(); }
  // a browser can block playback until a tap; retry on the next one
  addEventListener('pointerdown', () => { for (const p of peers.values()) if (p.audio.paused) p.audio.play().catch(() => {}); }, { passive: true });

  // closer foxes are louder
  setInterval(() => {
    const me = G.localState(), list = G.remote.list();
    for (const r of list) {
      const p = peers.get(r.id); if (!p) continue;
      const d = Math.hypot(r.x - me[0], r.z - me[2]) + Math.abs(r.y - me[1]) * 2;
      p.audio.volume = r.id === spotlight ? 1 : Math.max(0.35, Math.min(1, 1 - (d - 8) / 45));
      p.audio.muted = !!window.HUSH;   // quiet while an artwork is open
    }
    label();
  }, 300);
  label();
  return { onStream, onEvent, onLeave, onNewPeer, isOn: id => micOn.has(id), mineOn: () => !!mine, turnOff, peers, setSpotlight: (id, on) => { spotlight = on ? id : (spotlight === id ? null : spotlight); } };
}
