// BEN'S VOICE for the games.
// Every game speaks through G.say(text). This turns that text into Ben's recorded clips (media/voice/*.mp3, listed in
// voice-lines.js): the text is split into sentences, and each run of sentences that matches a recording is played as
// that recording, in order. Anything without a recording (an artist's quote, or a line not recorded yet) is read by
// the computer voice at the end, exactly as before. Clips for the painting's own game load as soon as it starts.
import LINES from './voice-lines.js';

const BASE = new URL('../../media/voice/', import.meta.url).href;   // AR/media/voice/, whichever page plays the game (the AR page or the 3D gallery)
// which clips belong to which painting's game (anything else plays the sliding mosaic)
const PREFIX = {
  'midnight-melodies': 'night-', 'rhythm-of-life': 'glow-', 'walk-through-fear': 'see-', 'almost-blindness': 'safari-',
  'curating-hope': 'memory-', 'the-bridge-of-perception': 'creek-', 'pedals-of-freedom': 'ride-', 'the-dark-uncertainty': 'bus-',
  'fearless-request': 'dance-', 'pathways-unveiled': 'road-', 'roots-of-kinship': 'apples-', 'reflections-of-sisterhood': 'fish-',
  'decision-divide': 'tides-', 'harmonious-gathering': 'storm-', 'inner-peace-in-outer-chaos': 'calm-',
  'the-mirror': 'mirror-', 'the-gray-zone': 'meta-', 'rhapsody-in-blue': 'jazz-', 'moment-of-communion': 'cross-', 'the-scope-of-communication': 'talk-',
  'haute-couture-dreams': 'style-', 'embracing-unity': 'unity-', 'joyride': 'joy-', 'the-only-light-well-see': 'moon-',
  'the-visions-that-we-share': 'eye-', 'all-lifes-beauty': 'flower-', 'back-of-a-harley': 'harley-', 'lighthouse-of-hope': 'light-',
  'telephone-poles': 'poles-', 'flow-state': 'paint-', 'a-new-day': 'glass-', 'all-the-possibilities': 'show-', 'napkin-please': 'napkin-',
  'the-button-is-to-the-left': 'button-', 'light-on-the-other-side': 'roll-', 'one-love': 'love-',
  'art-raised-me-up': 'raise-', 'a-different-way-to-see': 'diffway-', 'live-the-beauty': 'breathe-',
  'how-not-who': 'flight-', 'invisibly-ours': 'crowd-', 'unstoppable': 'lotus-',
  'fellowship': 'fellow-', 'move-the-needle': 'needle-', 'self-worth-a-new-understanding': 'worth-',
  'beauty-in-the-blurry': 'blur-', 'everything-in-its-place': 'place-', 'the-temperature-setter': 'heat-',
  'strengths-limitations': 'crew-', 'where-people-are': 'circle-', 'full-immersion': 'street-',
  'comfort-in-the-uncomfortable': 'drop-', 'spectrum-of-sight': 'ring-', 'wet-floor-signs-beware': 'shwak-', 'pour-in-the-love': 'pour-', 'find-your-village': 'village-', 'take-time-to-bloom': 'bloom-', 'reaching-past-blindness': 'strum-', 'reliroo': 'relish-', 'reasons-for-a-cure': 'cure-', 'goalball-is': 'goal-', 'hope-is-not-lost': 'hope-', 'seeing-the-world-together': 'wife-', 'music-on-the-streets': 'cane-', 'roller-coaster-of-emotions': 'track-', 'i-am-blind-like-my-hair-is-brown': 'still-', 'the-harmony-of-vision': 'harmony-', 'the-power-within': 'power-', 'a-bright-future': 'steps-', '5-weeks-on-my-side': 'weeks-',
};
// TEST: these games play Ben's lines from a sped-up copy (media/voice/fast/, 20% faster, same pitch). Remove a line here to go back.
const FAST = { 'the-only-light-well-see': 'fast/' };
const norm = s => s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const BY_TEXT = new Map();
const add = (text, name) => { const k = norm(text); if (!BY_TEXT.has(k)) BY_TEXT.set(k, []); BY_TEXT.get(k).push(name); };
for (const [name, text] of Object.entries(LINES)) add(text, name);
// other ways the games say the same thing
for (let n = 1; n <= 6; n++) add(`${n} of 8 pieces are in place.`, `mosaic-${n}-in-place`);
add('0 of 8 pieces are in place.', 'mosaic-0-pieces'); add('7 of 8 pieces are in place.', 'mosaic-one-more');
add('Missed it', 'dance-missed'); add('Too wiggly', 'dance-too-wiggly');

const sentences = text => (String(text).match(/[^.!?]+[.!?]*["”’]?\s*/g) || []).map(s => s.trim()).filter(Boolean);

let ctxAC = null;
const cache = new Map();
function load(ac, name, dir = '') {
  const key = dir + name;
  if (!cache.has(key)) cache.set(key, fetch(BASE + key + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b => new Promise((ok, no) => { const p = ac.decodeAudioData(b, ok, no); if (p && p.then) p.then(ok, no); })).catch(e => { cache.delete(key); throw e; }));
  return cache.get(key);
}

// what to play for a line: [{ clip }, …, { text }]
export function plan(text, prefix = '') {
  const S = sentences(text), out = [];
  for (let i = 0; i < S.length;) {
    let hit = null, j;
    for (j = S.length; j > i; j--) { const names = BY_TEXT.get(norm(S.slice(i, j).join(' '))); if (names) { hit = names.find(n => n.startsWith(prefix)) || names[0]; break; } }
    if (hit) { out.push({ clip: hit }); i = j; }
    else { const last = out[out.length - 1]; if (last && last.text) last.text += ' ' + S[i]; else out.push({ text: S[i] }); i++; }
  }
  return out;
}

// G.say for one game: Ben's clips where there are any, the computer voice for the rest
export function voiceFor(ctx, audio) {
  const ttsSay = ctx.say || (() => {});
  const id = ctx.work && ctx.work.id, prefix = PREFIX[id] || 'mosaic-', dir = FAST[id] || '';
  let token = 0, src = null, running = 0, ttsUntil = 0;
  // roughly how long the computer voice takes to read some text (about 2.6 words a second)
  const ttsTime = t => { const w = String(t || '').trim().split(/\s+/).filter(Boolean).length; return w ? 0.6 + w / 2.6 : 0; };
  const tts = t => { ttsUntil = performance.now() + ttsTime(t) * 1000; ttsSay(t); };
  const ac = () => { try { return ctxAC || (ctxAC = audio()); } catch (e) { return null; } };
  // load this game's clips right away, a few at a time
  const mine = Object.keys(LINES).filter(n => n.startsWith(prefix));
  (async () => { const a = ac(); if (!a) return; for (let i = 0; i < mine.length; i += 4) { await Promise.all(mine.slice(i, i + 4).map(n => load(a, n, dir).catch(() => {}))); } })();
  function stop() { token++; running = 0; ttsUntil = 0; if (src) { try { src.stop(); } catch (e) {} src = null; } }
  async function run(items, my) {
    const a = ac();
    for (let k = 0; k < items.length; k++) {
      if (my !== token) return;
      const it = items[k];
      if (it.text) { tts(items.slice(k).map(x => x.text || LINES[x.clip]).join(' ')); if (running === my) running = 0; return; }   // the computer voice finishes the line
      let buf = null; try { buf = await load(a, it.clip, dir); } catch (e) { buf = null; }
      if (my !== token) return;
      if (!buf) { tts(items.slice(k).map(x => x.text || LINES[x.clip]).join(' ')); if (running === my) running = 0; return; }
      await new Promise(done => {
        const s = a.createBufferSource(), g = a.createGain(); s.buffer = buf; g.gain.value = 1.15; s.connect(g).connect(a.destination);
        s.onended = done; src = s; s.start(); setTimeout(done, buf.duration * 1000 + 400);   // (in case "ended" never comes)
      });
      if (src && my === token) src = null;
    }
    if (running === my) running = 0;
  }
  const say = (text) => {
    if (window.__muted) { tts(text); return; }
    const items = plan(text, prefix);
    if (!items.some(x => x.clip) || !ac()) { stop(); tts(text); return; }
    stop(); ttsSay('');                                    // quiet whatever was talking
    if (window.__voiceLog) window.__voiceLog.push(items.map(x => x.clip || '[tts] ' + x.text).join(' + '));
    running = ++token; run(items, token);
  };
  say.stop = stop;
  // true while a line is still being spoken (Ben's clips, or the computer voice by estimate): the intro waits for it
  say.busy = () => (running !== 0 && running === token) || performance.now() < ttsUntil;
  return say;
}
