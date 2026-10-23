// Blind Canvas gallery: the sound of the walk-on floor piano (22 Oct). A bright, bell-like toy-piano tone that rings while you
// stand on the key and fades when you step off. One voice per (who, key). No samples: a few partials and a soft knock.
export function floorPianoSound() {
  let ac = null, out = null;
  const voices = new Map();
  function audio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ac.destination);
    out = ac.createGain(); out.gain.value = 0.7; out.connect(comp);
    const d = ac.createDelay(0.3), fb = ac.createGain(), wet = ac.createGain(); d.delayTime.value = 0.12; fb.gain.value = 0.25; wet.gain.value = 0.18;   // a little room
    out.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(comp);
    return ac;
  }
  // wake the audio on the first touch or key (browsers only start sound after a gesture)
  const wake = () => audio(); addEventListener('pointerdown', wake, { once: true }); addEventListener('keydown', wake, { once: true });
  function on(key, m, vol = 1) {
    if (!audio() || vol <= 0.01) return; off(key, true);
    const t = ac.currentTime, f = 440 * Math.pow(2, (m - 69) / 12), g = ac.createGain(), amp = 0.3 * vol;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.006); g.gain.setTargetAtTime(amp * 0.45, t + 0.02, 0.25); g.gain.setTargetAtTime(amp * 0.12, t + 0.6, 2.5);
    const oscs = [];
    for (const [h, a, type] of [[1, 1, 'triangle'], [2, 0.35, 'sine'], [3.01, 0.12, 'sine'], [4.2, 0.06, 'sine']]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = type; o.frequency.value = f * h; og.gain.value = a; o.connect(og); og.connect(g); o.start(t); oscs.push(o); }
    g.connect(out);
    voices.set(key, { g, oscs });
  }
  function off(key, now) {
    const v = voices.get(key); if (!v) return; voices.delete(key);
    const t = ac.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0.0001, t, now ? 0.01 : 0.12);
    for (const o of v.oscs) { try { o.stop(t + (now ? 0.1 : 0.8)); } catch (e) {} }
  }
  return { on, off };
}
