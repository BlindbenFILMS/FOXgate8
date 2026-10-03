// Blind Canvas gallery: the fox Animoji.
// With "Fox copies my face" on, the camera watches the visitor's face (on their own device: no video is sent or kept)
// and their fox copies it: head turn and tilt, blinks, mouth (talking), and mood (smile, surprise, sad, cross).
// Only a few numbers are shared, ~10 times a second, so everyone's fox comes alive however many people are here.
// Messages on the 'ev' channel: { k: 'face', f: [yaw, pitch, roll, blink, mouth, mood] } (all small integers).
const MOODS = ['neutral', 'happy', 'excited', 'surprised', 'sad', 'stern'];

export function setupFace({ G, net, announce, onState = () => {} }) {
  let on = false, busy = false, stream = null, video = null, faceapi = null, timer = 0, base = null, calib = [], lastSend = 0, preview = null;
  const S = { yaw: 0, pitch: 0, roll: 0, blink: 0, mouth: 0, mood: 'neutral' };
  const LOW = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lerp = (a, b, k) => a + (b - a) * k;

  async function loadModels() {
    if (faceapi) return faceapi;
    faceapi = await import('../vendor/face-api/face-api.esm.js');
    const url = new URL('../vendor/face-api/model/', import.meta.url).href;
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(url), faceapi.nets.faceLandmark68Net.loadFromUri(url), faceapi.nets.faceExpressionNet.loadFromUri(url)]);
    return faceapi;
  }
  function showPreview() {
    if (!preview) {
      preview = document.createElement('div'); preview.setAttribute('aria-label', 'Your camera (only on your device)');
      preview.style.cssText = 'position:fixed;z-index:11;right:calc(12px + env(safe-area-inset-right));top:calc(12px + env(safe-area-inset-top));width:92px;background:#141312;border:2px solid #f3f2f2;font:800 9px/1.25 Archivo,Arimo,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#f3f2f2';
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.style.cssText = 'display:block;width:100%;height:69px;object-fit:cover;transform:scaleX(-1);background:#000';
      const t = document.createElement('div'); t.style.cssText = 'padding:4px 5px'; t.innerHTML = '<span style="color:#ec3013">●</span> Fox copies you<br><span style="color:#a9a4a4;letter-spacing:.02em;text-transform:none;font-weight:600">stays on this device</span>';
      preview.append(v, t); preview.vid = v; preview.status = t; document.body.appendChild(preview);
    }
    preview.vid.srcObject = stream; preview.vid.play().catch(() => {}); preview.style.display = 'block';
  }
  async function start() {
    if (on || busy) return; busy = true; onState('loading');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user', frameRate: { ideal: 15 } }, audio: false });
      announce('Loading face tracking…');
      await loadModels();
      video = document.createElement('video'); video.muted = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.srcObject = stream; await video.play();
      on = true; base = null; calib = []; showPreview(); onState('on');
      announce('Your fox now copies your face: smile, blink, talk, turn your head. Your camera picture never leaves this device.');
      loop();
    } catch (e) {
      stopTracks(); onState('off');
      announce(e && e.name === 'NotAllowedError' ? 'The camera was blocked. Allow it in your browser so your fox can copy your face.' : 'Face tracking could not start on this device.');
      console.warn('face', e);
    }
    busy = false;
  }
  function stopTracks() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; if (video) { video.srcObject = null; video = null; } }
  function stop() {
    if (!on) return; on = false; clearTimeout(timer); stopTracks(); G.face.local(null);
    net.event({ k: 'face', off: 1 }); if (preview) preview.style.display = 'none'; onState('off');
    announce('Your fox is back to its own expressions. The camera is off.');
  }
  async function loop() {
    if (!on) return;
    const t0 = performance.now();
    try {
      const r = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: LOW ? 160 : 224, scoreThreshold: 0.4 })).withFaceLandmarks().withFaceExpressions();
      if (r) read(r); else if (preview) preview.style.borderColor = '#5a5654';
    } catch (e) { /* a frame failed: try the next */ }
    if (on) timer = setTimeout(loop, Math.max(0, (LOW ? 110 : 70) - (performance.now() - t0)));
  }
  function read(r) {
    const p = r.landmarks.positions;
    const eyeL = p[36], eyeR = p[45], eyeMid = { x: (eyeL.x + eyeR.x) / 2, y: (eyeL.y + eyeR.y) / 2 }, ed = d(eyeL, eyeR) || 1, nose = p[30], chin = p[8];
    // head pose from landmark geometry (the camera image is not mirrored: your left is the image's right)
    const yawR = (nose.x - eyeMid.x) / ed, pitchR = (nose.y - eyeMid.y) / Math.max(1, chin.y - eyeMid.y), rollR = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);
    if (!base) { calib.push([yawR, pitchR]); if (calib.length >= 6) base = { yaw: calib.reduce((a, c) => a + c[0], 0) / calib.length, pitch: calib.reduce((a, c) => a + c[1], 0) / calib.length }; }
    const b = base || { yaw: 0, pitch: 0.42 };
    // blink: eye aspect ratio; mouth: inner lip gap against face height
    const ear = (a, b2, c, d2, e, f) => (d(p[b2], p[f]) + d(p[c], p[e])) / (2 * d(p[a], p[d2]) || 1);
    const EAR = (ear(36, 37, 38, 39, 40, 41) + ear(42, 43, 44, 45, 46, 47)) / 2;
    const mouthR = d(p[62], p[66]) / Math.max(1, chin.y - eyeMid.y);
    const ex = r.expressions;
    const mood = ex.happy > 0.85 && mouthR > 0.12 ? 'excited' : ex.happy > 0.55 ? 'happy' : ex.surprised > 0.5 ? 'surprised' : ex.sad > 0.5 ? 'sad' : ex.angry > 0.5 ? 'stern' : 'neutral';
    S.yaw = lerp(S.yaw, (yawR - b.yaw) * 2.2, 0.6); S.pitch = lerp(S.pitch, (pitchR - b.pitch) * 2.4, 0.6); S.roll = lerp(S.roll, -rollR, 0.6);
    S.blink = Math.max(0, Math.min(1, (0.27 - EAR) / 0.09)); S.mouth = Math.max(0, Math.min(1, (mouthR - 0.03) / 0.16)); S.mood = mood;
    const ctl = { yaw: S.yaw, pitch: S.pitch, roll: S.roll, blink: S.blink, mouth: S.mouth, mood: S.mood, t: performance.now() };
    G.face.local(ctl);
    if (preview) preview.style.borderColor = '#f3f2f2';
    if (performance.now() - lastSend > 100) { lastSend = performance.now(); net.event({ k: 'face', f: [Math.round(S.yaw * 50), Math.round(S.pitch * 50), Math.round(S.roll * 50), Math.round(S.blink * 9), Math.round(S.mouth * 9), MOODS.indexOf(mood)] }); }
  }
  function onEvent(id, m) {
    if (!m || m.k !== 'face') return;
    if (m.off) { G.face.remote(id, null); return; }
    const f = m.f; if (!Array.isArray(f) || f.length < 6 || !f.every(Number.isFinite)) return;
    G.face.remote(id, { yaw: f[0] / 50, pitch: f[1] / 50, roll: f[2] / 50, blink: f[3] / 9, mouth: f[4] / 9, mood: MOODS[f[5]] || 'neutral', t: performance.now() });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && on) stop(); });   // never keep the camera running in a background tab
  return { start, stop, toggle: () => (on ? stop() : start()), on: () => on, onEvent, supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) };
}
