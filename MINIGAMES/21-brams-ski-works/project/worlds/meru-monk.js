// MERU — the Monk Fox, street preaching on the square (placeholder voice until the real recording arrives).
// Drop the recording at MERU/audio/monk-sermon.mp3 and it replaces the synth murmur automatically (same spatial panner).
// Captions follow the recording proportionally until real cue times are filled into CUES.
export const MONK = { key: 'monk', name: 'Monk Fox', role: 'Street preacher', outfit: 'robe', torso: ['#f5b041', '#c2410c', '#7c2d12'], crest: 'G', ax: 1440, ay: 1100, face: Math.PI, mood: 'warm' };
export const AUDIO_FILE = 'MERU/audio/monk-sermon.mp3';
export const CUES = null;   // optional: [start seconds per caption] once the recording exists

// the sermon, verbatim; [quieter]/[warmer] are delivery cues, not spoken
const RAW = `top. — Not for long. I know there is a match at the stadium and you want to be in the stands for the first serve. So do I. I will be quick.

Look up. Go on. Properly — past the roofs, past the gold.

Before any fox wrote anything down, we did not walk. We flew. It is in the scrolls in that library, and the library is the only one of us that has never once lied: there was an age when foxes crossed the dark as balls of light, and the stars were not scenery. They were a road.

And the road is still open. You have seen the Gate. You know what it is — a hole in the sky with a turnstile on it. There are worlds beyond this one. More than the church has names for. Every one of them has a sky, and under every sky tonight there is somebody standing exactly where you are standing, wondering exactly what you are wondering.

[quieter] Now. The vein.

The stone in that mountain is light that has been sitting still for four hundred years. It is sacred. It is not a price. Cut it for a lamp in a hut. Cut it for the glass over the gorge. Cut it so a cleric can read after dark — and the Gate keeps. But cut it for gain, and I promise you: it goes dark in the hand. And so do you.

The same goes for the water. The road. The trees standing either side of it. We did not make this place. We were put into it, and we have been loud guests.

[warmer] And play. I mean that. It is doctrine, not a kindness. We have hit a ball across a net on this planet for a century without once agreeing to count the points — and we are the happiest world through that Gate. A fox at play is a fox telling the truth.

One more thing, and then go.

There is a homeworld. It is called Earth. Every fox here came from it, and every fox here returns to it — and not as a passenger.

As a light.

So: respect the stone. Respect the water. Be kind, be loud, and be on time for the first serve.

The Gate keeps. Go and play.`;

// paragraphs → captions of at most ~150 chars, split on sentence ends
export const PARAS = [];
{ let tone = 'normal';
  for (let p of RAW.split(/\n\s*\n/)) { p = p.trim(); const m = p.match(/^\[(\w+)\]\s*/); if (m) { tone = m[1]; p = p.slice(m[0].length); }
    const sents = p.match(/[^.!?:]+[.!?:]+(\s|$)|[^.!?:]+$/g).map(s => s.trim()).filter(Boolean), caps = []; let cur = '';
    for (const s of sents) { if (cur && (cur + ' ' + s).length > 150) { caps.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s; }
    if (cur) caps.push(cur); PARAS.push({ tone, caps, text: p }); } }
// timeline (placeholder pacing: ~14 chars/s, a breath between captions, a longer one between paragraphs)
const LINES = []; let T = 0;
for (const P of PARAS) { for (const c of P.caps) { const d = 0.8 + c.length / 14; LINES.push({ t0: T, t1: T + d, text: c, tone: P.tone }); T += d + 0.35; } T += 1.1; }
const TOTAL = T, REST = 24;   // seconds of quiet before he starts again

export function createMonk({ THREE, audio, scene, M, BOX, toon, colliders, x, z }) {
  // a soapbox
  const box = new THREE.Group(); box.position.set(x, 0, z); scene.add(box);
  M(BOX(1.1, 0.36, 0.8), toon('#7a5236'), 0, 0.18, 0, box, 0.03); M(BOX(1.14, 0.06, 0.84), toon('#5a3d2c'), 0, 0.37, 0, box, 0.01);
  colliders.push({ c: [x, z, 0.75] });
  let el = null, src = null, panner = null, gain = null, synth = null, useFile = false, failed = false, t0 = null, lastAudible = false;
  function init() {
    const ctx = audio.ctx; if (!ctx || panner) return;
    panner = ctx.createPanner(); Object.assign(panner, { panningModel: 'HRTF', distanceModel: 'inverse', refDistance: 2.5, maxDistance: 40, rolloffFactor: 1.6 });
    panner.positionX.value = x; panner.positionY.value = 2.0; panner.positionZ.value = z;
    gain = ctx.createGain(); gain.gain.value = 0; gain.connect(panner); panner.connect(audio.master);
    el = new Audio(); el.src = AUDIO_FILE; el.loop = false; el.preload = 'auto'; el.crossOrigin = 'anonymous';
    el.addEventListener('canplay', () => { if (failed || useFile) return; useFile = true; try { src = ctx.createMediaElementSource(el); src.connect(gain); } catch (e) { useFile = false; } }, { once: true });
    el.addEventListener('error', () => { failed = true; useFile = false; }, { once: true });
    el.addEventListener('ended', () => { setTimeout(() => { if (el && lastAudible && audio.ctx && audio.ctx.state === 'running') { el.currentTime = 0; el.play().catch(() => {}); } else if (el) el.currentTime = 0; }, REST * 1000); });
    el.load();
    // placeholder voice: a buzzing source through two moving formants, gated syllable by syllable
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 118;
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.2; vg.gain.value = 3; vib.connect(vg); vg.connect(o.frequency);
    const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.Q.value = 7; f2.Q.value = 9; f1.frequency.value = 600; f2.frequency.value = 1200;
    const env = ctx.createGain(); env.gain.value = 0; const mix = ctx.createGain(); mix.gain.value = 0.55;
    o.connect(f1); o.connect(f2); f1.connect(env); f2.connect(env); env.connect(mix); mix.connect(gain); o.start(); vib.start();
    synth = { o, f1, f2, env, next: 0 };
  }
  const VOWELS = [[730, 1090], [530, 1840], [270, 2290], [570, 840], [440, 1020], [660, 1720], [300, 870]];
  let cap = null;
  return {
    get caption() { return cap; },
    // called every frame; listener = the camera, so the voice pans as you turn
    update(dt, Pl, camera, muted, near) {
      const ctx = audio.ctx; if (!ctx) return; if (!panner) init(); if (!panner) return;
      const L = ctx.listener, now = ctx.currentTime, p = camera.position, f = new THREE.Vector3(); camera.getWorldDirection(f);
      if (L.positionX) { L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z; L.forwardX.value = f.x; L.forwardY.value = f.y; L.forwardZ.value = f.z; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; } else { L.setPosition(p.x, p.y, p.z); L.setOrientation(f.x, f.y, f.z, 0, 1, 0); }
      const d = Math.hypot(Pl.x - x, Pl.z - z), audible = near && d < 42; lastAudible = audible;
      if (t0 === null) t0 = now;
      // where are we in the sermon?
      let t, line = null;
      if (useFile) { if (audible && el.paused && el.currentTime === 0) el.play().catch(() => {}); if (!audible && !el.paused) el.pause(); else if (audible && el.paused && el.currentTime > 0 && !el.ended) el.play().catch(() => {});
        const dur = el.duration || TOTAL; t = el.currentTime * (CUES ? 1 : TOTAL / dur);
        if (CUES) { for (let i = 0; i < LINES.length; i++) if (t >= CUES[i] && (i === LINES.length - 1 || t < CUES[i + 1])) line = LINES[i]; } else line = LINES.find(l => t >= l.t0 && t < l.t1);
        if (synth) synth.env.gain.setTargetAtTime(0, now, 0.05); }
      else { t = (now - t0) % (TOTAL + REST); line = LINES.find(l => t >= l.t0 && t < l.t1);
        if (synth) { const speak = !!line && audible;
          if (speak && now >= synth.next) { const v = VOWELS[(Math.random() * VOWELS.length) | 0], syl = 0.12 + Math.random() * 0.14, q = line.tone === 'quieter' ? 0.45 : 1, pitch = line.tone === 'warmer' ? 128 : line.tone === 'quieter' ? 108 : 118;
            synth.f1.frequency.setTargetAtTime(v[0], now, 0.02); synth.f2.frequency.setTargetAtTime(v[1], now, 0.02); synth.o.frequency.setTargetAtTime(pitch * (0.92 + Math.random() * 0.16), now, 0.04);
            synth.env.gain.cancelScheduledValues(now); synth.env.gain.setTargetAtTime(0.9 * q, now, 0.015); synth.env.gain.setTargetAtTime(0.0, now + syl * 0.75, 0.03);
            synth.next = now + syl + (Math.random() < 0.18 ? 0.16 : 0.02); }
          if (!speak) synth.env.gain.setTargetAtTime(0, now, 0.05); } }
      gain.gain.setTargetAtTime(muted || !audible ? 0 : (useFile ? 1 : 0.32), now, 0.25);
      cap = line && audible && d < 16 ? { text: line.text, tone: line.tone } : null;
      return { line, d };
    },
  };
}
