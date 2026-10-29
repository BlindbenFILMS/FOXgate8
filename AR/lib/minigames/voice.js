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
  'telephone-poles': 'poles-', 'flow-state': 'paint-', 'a-new-day': 'glass-', 'all-the-possibilities': 'show-',
};
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
function load(ac, name) {
  if (!cache.has(name)) cache.set(name, fetch(BASE + name + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b => new Promise((ok, no) => { const p = ac.decodeAudioData(b, ok, no); if (p && p.then) p.then(ok, no); })).catch(e => { cache.delete(name); throw e; }));
  return cache.get(name);
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
  const id = ctx.work && ctx.work.id, prefix = PREFIX[id] || 'mosaic-';
  let token = 0, src = null;
  const ac = () => { try { return ctxAC || (ctxAC = audio()); } catch (e) { return null; } };
  // load this game's clips right away, a few at a time
  const mine = Object.keys(LINES).filter(n => n.startsWith(prefix));
  (async () => { const a = ac(); if (!a) return; for (let i = 0; i < mine.length; i += 4) { await Promise.all(mine.slice(i, i + 4).map(n => load(a, n).catch(() => {}))); } })();
  function stop() { token++; if (src) { try { src.stop(); } catch (e) {} src = null; } }
  async function run(items, my) {
    const a = ac();
    for (let k = 0; k < items.length; k++) {
      if (my !== token) return;
      const it = items[k];
      if (it.text) { ttsSay(items.slice(k).map(x => x.text || LINES[x.clip]).join(' ')); return; }   // the computer voice finishes the line
      let buf = null; try { buf = await load(a, it.clip); } catch (e) { buf = null; }
      if (my !== token) return;
      if (!buf) { ttsSay(items.slice(k).map(x => x.text || LINES[x.clip]).join(' ')); return; }
      await new Promise(done => {
        const s = a.createBufferSource(), g = a.createGain(); s.buffer = buf; g.gain.value = 1.15; s.connect(g).connect(a.destination);
        s.onended = done; src = s; s.start(); setTimeout(done, buf.duration * 1000 + 400);   // (in case "ended" never comes)
      });
      if (src && my === token) src = null;
    }
  }
  const say = (text) => {
    if (window.__muted) { ttsSay(text); return; }
    const items = plan(text, prefix);
    if (!items.some(x => x.clip) || !ac()) { stop(); ttsSay(text); return; }
    stop(); ttsSay('');                                    // quiet whatever was talking
    if (window.__voiceLog) window.__voiceLog.push(items.map(x => x.clip || '[tts] ' + x.text).join(' + '));
    run(items, ++token);
  };
  say.stop = stop;
  return say;
}
