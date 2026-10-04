// Blind Canvas gallery: wear your camera on your fox.
//  • 'screen': a little TV for a head, showing your camera picture.
//  • 'mask':   your face (found with the same face tracker as the fox Animoji), cut to a soft oval and worn as the fox's face.
// Unlike "Fox copies my face" (which never sends video), these SEND your camera picture to everyone in the gallery,
// straight from you to them (WebRTC via gallery-net, stream metadata kind 'face'). Nothing is recorded or kept.
// The picture is drawn into a small canvas first (320x240 for the screen, 240x270 around your face for the mask) and that
// canvas is what's sent: small, steady, and the same for everyone.
// Messages on the 'ev' channel: { k: 'camhead', mode: 'screen' | 'mask' | null }.
export function setupCamHead({ G, net, announce, nameOf, onState = () => {} }) {
  let mode = null, busy = false, cam = null, video = null, out = null, sendStream = null, timer = 0, detT = 0, faceapi = null, box = null;
  const LOW = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const peerMode = new Map(), peerStream = new Map();   // what each visitor is wearing, and the camera stream they sent
  const SIZE = { screen: [320, 240], mask: [240, 270] };

  async function loadTracker() {
    if (faceapi) return faceapi;
    faceapi = await import('../vendor/face-api/face-api.esm.js');
    await faceapi.nets.tinyFaceDetector.loadFromUri(new URL('../vendor/face-api/model/', import.meta.url).href);
    return faceapi;
  }
  // find the face now and then; the crop glides after it
  async function track() {
    if (mode !== 'mask' || !video || !faceapi) return;
    try {
      const r = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: LOW ? 160 : 224, scoreThreshold: 0.35 }));
      if (r) { const b = r.box, cx = b.x + b.width / 2, cy = b.y + b.height * 0.45, h = b.height * 1.55;   // a little room for hair and chin
        box = box ? { cx: box.cx + (cx - box.cx) * 0.5, cy: box.cy + (cy - box.cy) * 0.5, h: box.h + (h - box.h) * 0.4 } : { cx, cy, h }; }
    } catch (e) {}
  }
  function draw() {
    if (!mode || !video || video.readyState < 2) return;
    const c = out.getContext('2d'), [W, H] = SIZE[mode], vw = video.videoWidth, vh = video.videoHeight;
    if (mode === 'screen') {   // cover-fit the whole camera picture
      const k = Math.max(W / vw, H / vh), sw = W / k, sh = H / k; c.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);
    } else {                   // just the face
      const b = box || { cx: vw / 2, cy: vh * 0.45, h: vh * 0.8 }, sh = Math.min(vh, b.h), sw = sh * W / H;
      const sx = Math.max(0, Math.min(vw - sw, b.cx - sw / 2)), sy = Math.max(0, Math.min(vh - sh, b.cy - sh / 2));
      c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, W, H); c.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
    }
  }
  function loop() {
    if (!mode) return;
    draw();
    detT -= 1; if (detT <= 0) { detT = LOW ? 4 : 3; track(); }
    timer = setTimeout(loop, 66);   // ~15 fps
  }

  async function start(m) {
    if (busy) return; if (mode === m) { stop(); return; }
    if (mode) stop(true);
    busy = true; onState('loading', m);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unsupported');
      cam = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user', frameRate: { ideal: 15 } }, audio: false });
      if (m === 'mask') { announce('Loading face finder…'); await loadTracker(); }
      video = document.createElement('video'); video.muted = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.srcObject = cam; await video.play();
      out = document.createElement('canvas'); [out.width, out.height] = SIZE[m]; box = null;
      mode = m; detT = 0; loop();
      sendStream = out.captureStream(15);
      G.camHead.local(m, sendStream);
      const online = net.face.add(sendStream);
      net.event({ k: 'camhead', mode: m });
      cam.getVideoTracks().forEach(t => t.addEventListener('ended', () => { if (mode) stop(); }));
      onState('on', m);
      announce((m === 'screen' ? 'Your fox now has a screen for a head, showing your camera.' : 'Your fox now wears your face as a mask.') + (online ? ' Everyone in the gallery can see it.' : ' Others will see it in the online gallery.'));
    } catch (e) {
      cleanup(); onState('off');
      announce(e && e.name === 'NotAllowedError' ? 'The camera was blocked. Allow it in your browser to wear your camera.' : 'The camera could not start on this device.');
      console.warn('camhead', e);
    }
    busy = false;
  }
  function cleanup() {
    clearTimeout(timer); mode = null;
    if (sendStream) { net.face.remove(sendStream); sendStream.getTracks().forEach(t => t.stop()); sendStream = null; }
    if (cam) cam.getTracks().forEach(t => t.stop()); cam = null;
    if (video) { video.srcObject = null; video = null; }
    G.camHead.local(null);
  }
  function stop(quiet) {
    if (!mode) return;
    cleanup(); net.event({ k: 'camhead', mode: null }); onState('off');
    if (!quiet) announce('Your camera is off and your fox has its own face back.');
  }

  // other visitors
  const apply = id => { const m = peerMode.get(id), s = peerStream.get(id); G.camHead.remote(id, m && s ? m : null, m && s ? s : null); };
  function onStream(id, stream, meta = {}) {
    if (meta.kind !== 'face' || !stream.getVideoTracks().length) return;
    peerStream.set(id, stream);
    stream.getVideoTracks().forEach(t => t.addEventListener('ended', () => { if (peerStream.get(id) === stream) { peerStream.delete(id); apply(id); } }));
    apply(id);
  }
  function onEvent(id, d) {
    if (!d || d.k !== 'camhead') return;
    const was = peerMode.get(id);
    if (d.mode === 'screen' || d.mode === 'mask') peerMode.set(id, d.mode); else { peerMode.delete(id); peerStream.delete(id); }
    apply(id);
    if (d.mode && d.mode !== was) announce(nameOf(id) + (d.mode === 'screen' ? ' put their camera on as a screen head.' : ' is wearing their face as a mask.'));
  }
  function onNewPeer(id) { if (mode) net.event({ k: 'camhead', mode }, id); }
  function onLeave(id) { peerMode.delete(id); peerStream.delete(id); }
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && HTMLCanvasElement.prototype.captureStream);
  return { start, stop, onStream, onEvent, onNewPeer, onLeave, mode: () => mode, supported };
}
