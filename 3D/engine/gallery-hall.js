// Blind Canvas gallery: the Academy of Music's hall sound (28 Oct). A made-in-the-browser reverb (no files): a stereo burst of
// decaying noise as the impulse, darker as it fades, about two seconds long, like a small concert hall. One per AudioContext.
export function hallVerb(ac, { secs = 2.1, wet = 0.3 } = {}) {
  if (ac.__hall) return ac.__hall;
  const len = Math.floor(ac.sampleRate * secs), ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0;
    for (let i = 0; i < len; i++) { const t = i / len, k = 0.35 + 0.6 * t; lp = lp * k + (Math.random() * 2 - 1) * (1 - k); d[i] = lp * Math.pow(1 - t, 2.6) * (i < ac.sampleRate * 0.012 ? i / (ac.sampleRate * 0.012) : 1) * 2.2; } }
  const input = ac.createGain(), conv = ac.createConvolver(), hp = ac.createBiquadFilter(), out = ac.createGain();
  conv.buffer = ir; hp.type = 'highpass'; hp.frequency.value = 160; out.gain.value = wet;
  const pre = ac.createDelay(0.1); pre.delayTime.value = 0.018;   // a short gap before the room answers
  input.connect(pre); pre.connect(hp); hp.connect(conv); conv.connect(out);
  return (ac.__hall = { input, output: out, wet: out.gain });
}
