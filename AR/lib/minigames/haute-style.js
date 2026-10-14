// HAUTE COUTURE DREAMS (Shardasia Hadley): STYLE THE DREAM.
// Shardasia loves fashion: finding new styles, chic or kind of baggy, being comfortable, and trying out colours
// to see how they look on her. Here you are her stylist. Three clients each give you a brief ("comfortable but bold
// for a sunny day"). The clothes on the collage wall really come off their hangers: tap one and it flies onto her.
// Or use the buttons: Top, Bottom and Layer go through what's on the rack; Colour changes the colour of the last piece
// you touched, and every colour is spoken and has its own sound (yellow rings like a bell, navy hums like a cello).
// The client's wishes show as a checklist, ticked off out loud as you dress her. Press Done: if the look fits, she
// takes it down the runway: the lights drop, cameras flash from the photos on the wall, and you press Pose on the
// beat to make her strike a pose. Three looks, then Shardasia's own words.
// Made for low vision: everything is spoken and described, and the client tells you what's still missing.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/haute/';
const COLORS = [
  { id: 'sunflower', name: 'sunflower yellow', hex: '#f2cf1d', tags: ['bright', 'warm', 'bold'], note: 880, wave: 'sine', feel: 'bright as a bell' },
  { id: 'coral', name: 'coral', hex: '#ff6f5e', tags: ['bright', 'warm', 'playful'], note: 784, wave: 'triangle', feel: 'warm and sunny' },
  { id: 'hotpink', name: 'hot pink', hex: '#e8418a', tags: ['bold', 'bright', 'party', 'warm'], note: 988, wave: 'square', feel: 'loud and fun' },
  { id: 'red', name: 'cherry red', hex: '#c61f2b', tags: ['bold', 'warm', 'party'], note: 659, wave: 'sawtooth', feel: 'strong, like a trumpet' },
  { id: 'emerald', name: 'emerald green', hex: '#1c9a62', tags: ['bold', 'cool'], note: 523, wave: 'triangle', feel: 'rich and fresh' },
  { id: 'sky', name: 'sky blue', hex: '#7ab8e6', tags: ['calm', 'cool', 'bright'], note: 587, wave: 'sine', feel: 'light and breezy' },
  { id: 'lavender', name: 'lavender', hex: '#b39ade', tags: ['calm', 'cool', 'playful'], note: 698, wave: 'sine', feel: 'soft and dreamy' },
  { id: 'navy', name: 'navy blue', hex: '#1e2b5c', tags: ['calm', 'cool', 'dark', 'smart'], note: 196, wave: 'triangle', feel: 'deep, like a cello' },
  { id: 'black', name: 'black', hex: '#141416', tags: ['dark', 'chic', 'night'], note: 131, wave: 'triangle', feel: 'low and classic' },
  { id: 'white', name: 'white', hex: '#f1efe8', tags: ['bright', 'calm', 'chic'], note: 1047, wave: 'sine', feel: 'clean and crisp' },
  { id: 'sand', name: 'sand beige', hex: '#d5c393', tags: ['calm', 'warm', 'smart'], note: 392, wave: 'sine', feel: 'soft and easy' },
];
const FAB_SCALE = { floral: [8.5, 4], pink: [31, 4.5], beige: [12.5, 10] };   // how many times each fabric repeats across the painting
const C = id => COLORS.find(c => c.id === id);
// mode: 0 = what she's wearing in the painting, 1 = plain colour, 2 = a fabric from the wall
const RACK = {
  top: [
    { id: 'yellow', name: 'yellow tee', mode: 0, tags: ['comfy', 'casual', 'bright', 'bold', 'warm'], say: 'Her sunflower yellow tee: soft cotton, easy and bright.' },
    { id: 'floral', name: 'floral blouse', mode: 2, fab: 'floral', tags: ['chic', 'playful', 'warm'], say: 'The floral blouse: little red roses on cream. Light and pretty.' },
    { id: 'beige', name: 'beige shirt', mode: 2, fab: 'beige', tags: ['smart', 'chic', 'calm', 'warm'], say: 'The beige button-up shirt: crisp and smart, a calm sandy colour.' },
    { id: 'pink', name: 'pink top', mode: 2, fab: 'pink', tags: ['bold', 'party', 'playful', 'bright'], say: 'The pink top: hot pink with a swirly white pattern. Bold and fun.' },
    { id: 'tee', name: 'plain tee', mode: 1, color: 'sky', tags: ['comfy', 'casual'], say: 'A plain cotton tee. Comfy. Press Colour to pick its colour.' },
  ],
  bottom: [
    { id: 'black', name: 'black skirt', mode: 0, tags: ['comfy', 'chic', 'dark', 'night'], say: 'Her long black skirt: flowy and comfy, and it goes with everything.' },
    { id: 'floral', name: 'floral skirt', mode: 2, fab: 'floral', tags: ['playful', 'chic'], say: 'A floral skirt, roses on cream, to match the blouse.' },
    { id: 'pink', name: 'pink skirt', mode: 2, fab: 'pink', tags: ['bold', 'party', 'playful'], say: 'A hot pink skirt with the swirly pattern. Made for dancing.' },
    { id: 'beige', name: 'beige skirt', mode: 2, fab: 'beige', tags: ['smart', 'calm'], say: 'A beige skirt: smart and simple.' },
    { id: 'skirt', name: 'plain skirt', mode: 1, color: 'navy', tags: ['comfy'], say: 'A plain, swingy skirt. Comfy. Press Colour to pick its colour.' },
  ],
  layer: [
    { id: 'none', name: 'no jacket', tags: [], say: 'No jacket.' },
    { id: 'blazer', name: 'blazer', color: 'black', tags: ['chic', 'smart', 'structured'], say: 'The blazer: sharp tailoring and a crisp white collar. Instant chic.' },
  ],
};
// the clothes on the wall (u, v from the top-left of the painting): tap one and it flies onto her
const WALL = [
  { id: 'blazer', box: [0.075, 0.255, 0.25, 0.555], put: { layer: 'blazer' }, say: 'The black and white blazer.' },
  { id: 'floral', box: [0.2, 0.285, 0.41, 0.655], put: { top: 'floral', bottom: 'floral' }, say: 'The floral dress: red roses on cream.' },
  { id: 'beige', box: [0.755, 0.345, 0.965, 0.595], put: { top: 'beige' }, say: 'The beige button-up shirt.' },
  { id: 'pink', box: [0.8, 0.545, 0.955, 0.865], put: { top: 'pink', bottom: 'pink' }, say: 'The hot pink dress.' },
];
const CLIENTS = [
  { name: 'Maya', job: 'A sunny day in the park', brief: 'I’m spending the day in the park with my friends. I want to be comfortable, but I want people to see me coming! It’s sunny out.',
    want: ['comfy', 'bright', 'bold'], avoid: ['dark', 'structured'],
    no: { dark: 'Too dark for a sunny day.', structured: 'A jacket? It’s way too warm in the park.' }, yes: 'Yes! Comfy, bright and bold. I love it!' },
  { name: 'Jordan', job: 'A gallery opening', brief: 'Tonight is the opening of my first art show. I want to look chic and smart, but calm. I don’t want my outfit louder than my paintings.',
    want: ['chic', 'smart', 'calm'], avoid: ['party', 'bold'],
    no: { party: 'That’s a party look, not a gallery look.', bold: 'Too loud! Calmer, please.' }, yes: 'Chic, smart and calm. My paintings will be jealous.' },
  { name: 'Shardasia', job: 'A dance party', brief: 'Dance party tonight! I want something bold and fun, and I need to be able to move. Try a colour I’ve never worn!',
    want: ['bold', 'party', 'comfy'], avoid: ['smart', 'structured'],
    no: { smart: 'Too smart, this is a dance party!', structured: 'I can’t dance in a blazer!' }, yes: 'Bold, fun, and I can dance in it. This is so me!' },
];
const WORD = { comfy: 'comfy', bright: 'bright', bold: 'bold', chic: 'chic', smart: 'smart', calm: 'calm', party: 'party', playful: 'playful' };
const BPM = 104, BEATS = 8;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting with her outfit changed: her shirt and skirt are re-dressed (keeping the folds of the painted fabric),
// a blazer can go over the top, and on the runway she sways and strikes poses under a spotlight
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, bg, body, lay, fTop, fBot;
uniform vec2 uTopS, uBotS;
uniform float uTopMode, uBotMode, uLay, uSway, uFlash, uSpot, uT, uA, uH, uWipe;
uniform vec3 uTopCol, uBotCol, uLayCol;
vec4 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 dressed(vec2 q){
  vec3 c = at(map, q).rgb; vec3 b = at(body, q).rgb; float L = lum(c);
  // the top: keep the light and folds of her painted tee
  float sh = clamp(L / 0.66, 0.3, 1.25);
  vec3 top = uTopMode > 1.5 ? texture2D(fTop, q * uTopS * vec2(1.0, uH)).rgb * (0.15 + 0.8 * sh) : uTopCol * sh;
  if (uTopMode > 0.5) c = mix(c, top, b.r * step(q.y, uWipe));
  // the skirt: her painted skirt is almost flat black, so add a gentle drape
  float drape = 0.9 + 0.12 * sin(q.x * 95.0 + q.y * 9.0) * smoothstep(0.74, 0.95, q.y) + (L - 0.11) * 5.0;
  vec3 bot = uBotMode > 1.5 ? texture2D(fBot, q * uBotS * vec2(1.0, uH)).rgb * drape : uBotCol * drape;
  if (uBotMode > 0.5) c = mix(c, bot, b.g * step(q.y, uWipe));
  // the blazer: dark tailoring with a back seam, shaded by the shirt's folds, and a white collar
  vec3 l = at(lay, q).rgb;
  float seam = 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.004, abs(q.x - 0.508))) * step(0.5, q.y);
  vec3 jk = uLayCol * (0.75 + 0.35 * mix(1.0, sh, b.r)) * seam + 0.05 * smoothstep(0.62, 0.5, q.y);
  c = mix(c, jk, l.r * uLay);
  c = mix(c, vec3(0.96, 0.95, 0.92) * (0.85 + 0.15 * sh), l.g * uLay);
  return c + uFlash * b.b * 0.55;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // where she stood, the wall shows through when she sways
  vec3 base = mix(at(map, p).rgb, at(bg, p).rgb, at(body, p).b * step(0.0005, abs(uSway)));
  vec2 piv = vec2(0.51, 1.04), d = (p - piv) * vec2(1.0, uH);
  float c = cos(-uSway), s = sin(-uSway);
  vec2 q = piv + vec2(c * d.x - s * d.y, s * d.x + c * d.y) / vec2(1.0, uH);
  float f = at(body, q).b;
  vec3 col = mix(base, dressed(q), f);
  // the runway: lights down, a spotlight on her
  float r = length((p - vec2(0.51, 0.62)) * vec2(1.6, 0.95 * uH));
  col *= mix(1.0, mix(1.0, 0.28, smoothstep(0.2, 0.42, r)), uSpot);
  col += uSpot * 0.08 * vec3(1.0, 0.92, 0.8) * (1.0 - smoothstep(0.0, 0.4, r));
  gl_FragColor = vec4(col, uA);
}`;

export function styleTheDreamGame() {
  let G = null;

  // ── the outfit ──
  // colours go to the shader as plain 0–1 numbers, the same as the painting's pixels
  const raw = (c, hex) => { const n = parseInt(hex.slice(1), 16); c.r = (n >> 16 & 255) / 255; c.g = (n >> 8 & 255) / 255; c.b = (n & 255) / 255; };
  const piece = (slot, id) => RACK[slot].find(p => p.id === id);
  const cur = slot => piece(slot, G.fit[slot]);
  function colorOf(slot) { return C(G.col[slot] || cur(slot).color || 'black'); }
  function tagsOf() {
    const t = new Set();
    for (const slot of ['top', 'bottom', 'layer']) {
      const p = cur(slot); p.tags.forEach(x => t.add(x));
      if (p.mode === 1 || (slot === 'layer' && p.id !== 'none')) colorOf(slot).tags.forEach(x => t.add(x));
    }
    return t;
  }
  function describe() {
    const bits = [];
    const one = slot => { const p = cur(slot); return (p.mode === 1 || (slot === 'layer' && p.id !== 'none')) ? `the ${p.name} in ${colorOf(slot).name}` : `the ${p.name}`; };
    if (G.fit.top === 'floral' && G.fit.bottom === 'floral') bits.push('the floral dress');
    else if (G.fit.top === 'pink' && G.fit.bottom === 'pink') bits.push('the hot pink dress');
    else { bits.push(one('top')); bits.push(one('bottom')); }
    if (G.fit.layer !== 'none') bits.push(one('layer'));
    return 'She’s wearing ' + (bits.length > 1 ? bits.slice(0, -1).join(', ') + ' and ' + bits[bits.length - 1] : bits[0]) + '.';
  }
  function apply() {
    const u = G.uni, t = cur('top'), b = cur('bottom'), l = cur('layer');
    u.uTopMode.value = t.mode; u.uBotMode.value = b.mode; u.uLay.value = l.id === 'none' ? 0 : 1;
    if (t.mode === 1) raw(u.uTopCol.value, colorOf('top').hex);
    if (b.mode === 1) raw(u.uBotCol.value, colorOf('bottom').hex);
    if (l.id !== 'none') raw(u.uLayCol.value, colorOf('layer').hex);
    if (t.fab) { u.fTop.value = G.fab[t.fab]; u.uTopS.value.fromArray(FAB_SCALE[t.fab]); } if (b.fab) { u.fBot.value = G.fab[b.fab]; u.uBotS.value.fromArray(FAB_SCALE[b.fab]); }
    G.uni.uWipe.value = 0; G.wipe = 0;   // the new look sweeps down her from the shoulders
    G.flash = 0.8;
    checklist(true);
  }
  // put something on (from the buttons or from the wall)
  function wear(slot, id, { quiet = false } = {}) {
    G.fit[slot] = id; G.slot = slot; G.changes++;
    if (!quiet) { G.say(piece(slot, id).say); }
    K.tone(660, 0.07, { vol: 0.05 }); K.tone(990, 0.09, { vol: 0.04, delay: 0.06 });
    apply();
  }
  function nextIn(slot) { const list = RACK[slot], i = list.findIndex(p => p.id === G.fit[slot]); wear(slot, list[(i + 1) % list.length].id); buttons(); }
  function nextColor() {
    let slot = G.slot;
    if (slot === 'layer' && G.fit.layer === 'none') slot = 'top';
    const p = cur(slot);
    // patterns can't be recoloured: switch to the plain one in that slot
    if (slot !== 'layer' && p.mode !== 1) { G.fit[slot] = slot === 'top' ? 'tee' : 'skirt'; }
    const list = COLORS.map(c => c.id), now = G.col[slot] || cur(slot).color, i = list.indexOf(now);
    const c = C(list[(i + 1) % list.length]); G.col[slot] = c.id; G.slot = slot; G.changes++; G.colors.add(c.id);
    // every colour has its own sound
    K.tone(c.note, 0.45, { type: c.wave, vol: c.wave === 'square' || c.wave === 'sawtooth' ? 0.035 : 0.08 }); K.tone(c.note * 1.5, 0.35, { type: 'sine', vol: 0.03, delay: 0.08 });
    G.say(`${c.name[0].toUpperCase() + c.name.slice(1)}: ${c.feel}.`);
    apply(); buttons();
  }

  // ── the client's checklist ──
  const client = () => CLIENTS[G.ci];
  function checklist(speak) {
    if (G.phase !== 'style') return;
    const tags = tagsOf(), cl = client();
    const chips = cl.want.map(w => `<span style="display:inline-block;margin:2px 8px 2px 0;color:${tags.has(w) ? '#fff' : '#777'}">${tags.has(w) ? '✓' : '○'} ${WORD[w]}</span>`).join('');
    const bad = cl.avoid.filter(a => tags.has(a));
    G.ui.panel(`Client ${G.ci + 1} of 3 · ${cl.name} · ${cl.job}`, chips, { sub: bad.length ? '✗ ' + bad.map(a => cl.no[a]).join(' ') : cl.brief, warn: false });
    if (speak) {
      // say each wish as it gets ticked off
      const got = cl.want.filter(w => tags.has(w) && !G.met.has(w));
      got.forEach((w, i) => { K.tone(1047 + i * 220, 0.12, { vol: 0.06, delay: 0.25 + i * 0.12 }); });
      if (got.length) setTimeout(() => G && G.phase === 'style' && G.say(got.map(w => WORD[w][0].toUpperCase() + WORD[w].slice(1) + ': yes.').join(' ')), 1600);
      G.met = new Set(cl.want.filter(w => tags.has(w)));
    }
  }
  function startClient() {
    G.phase = 'style'; G.tries = 0; G.met = new Set(); G.colors = new Set();
    const cl = client();
    G.ui.alert(cl.name, cl.job, 2.2, 'black'); checklist(false); buttons();
    G.say(`Client ${G.ci + 1}: ${cl.name}. ${cl.brief}`);
    G.met = new Set(cl.want.filter(w => tagsOf().has(w)));
  }
  function done() {
    if (G.phase !== 'style') return;
    const tags = tagsOf(), cl = client(), miss = cl.want.filter(w => !tags.has(w)), bad = cl.avoid.filter(a => tags.has(a));
    G.tries++;
    if ((miss.length === 0 && bad.length === 0) || (G.tries >= 3 && miss.length <= 1 && bad.length === 0) || G.tries >= 4) {
      G.stars += miss.length === 0 && bad.length === 0 ? 3 : 2;
      G.ui.alert('She loves it', cl.name, 1.8, 'red'); K.sfx.win && K.sfx.win();
      G.say(miss.length === 0 && bad.length === 0 ? cl.yes : 'Close enough. I love it! Let’s go.'); runway();
    } else {
      const why = bad.length ? cl.no[bad[0]] : `Hmm. I need it to be more ${WORD[miss[0]]}.`;
      G.ui.alert('Not quite', why, 2.4, 'blue'); G.say(why + ' ' + hint(miss[0] || null, bad[0] || null)); G.buzz([40, 60, 40]);
    }
  }
  function hint(miss, bad) {
    if (bad === 'dark') return 'Try a brighter skirt.';
    if (bad === 'structured') return 'Take the jacket off: press Layer.';
    if (bad === 'bold' || bad === 'party') return 'Try something calmer, like the beige shirt.';
    if (bad === 'smart') return 'Try the pink dress.';
    return { comfy: 'The tee and the long skirt are the comfiest.', bright: 'Try a bright colour.', bold: 'Try a bold colour, like hot pink or cherry red.', chic: 'The blazer is very chic.',
      smart: 'The beige shirt is smart.', calm: 'Try a calm colour, like navy or sand.', party: 'Pink is a party colour.' }[miss] || '';
  }

  // ── the runway ──
  function runway() {
    G.phase = 'runway'; G.ui.hidePanel(); G.beat = -2; G.beatT = 0; G.hits = 0; G.lastPose = -9; G.posed = false;
    G.music.level(1);
    buttons();
    setTimeout(() => G && G.phase === 'runway' && G.say('Runway! Press Pose on the beat.'), 1200);
  }
  function pose() {
    if (G.phase !== 'runway') return;
    const into = G.beatT, from = 60 / BPM - G.beatT, off = Math.min(into, from);
    if (off < 0.17 && G.beat >= 0 && !G.posed) {
      G.posed = true; G.hits++; G.dir = -G.dir; G.swayTo = 0.03 * G.dir;
      G.flash = 1; cameraFlash(3); K.noise(0.07, { vol: 0.2, freq: 3500, q: 0.7 }); K.tone(1319, 0.08, { vol: 0.05 }); G.buzz(25);
      G.ui.pop(['Fierce!', 'Yes!', 'Work it!', 'Iconic!', 'Stunning!'][G.hits % 5]);
    } else { K.tone(220, 0.06, { vol: 0.04 }); }
  }
  function cameraFlash(n) {
    for (let i = 0; i < n; i++) {
      // flashes pop from the photos on the wall
      let u, v; do { u = 0.06 + Math.random() * 0.88; v = 0.06 + Math.random() * 0.86; } while (u > 0.33 && u < 0.69 && v > 0.22);
      const [x, y] = G.S.P(u, v), s = K.sprite(K.glowTex, 0.06 + Math.random() * 0.06, { color: '#ffffff', additive: true, order: 30, opacity: 1 });
      s.position.set(x, y, 0.06); G.root.add(s); G.flashes.push({ s, life: 0.25 + Math.random() * 0.15, t: 0 });
    }
  }
  function endRunway() {
    G.ci++;
    G.swayTo = 0; G.music.level(0.35);
    if (G.ci >= CLIENTS.length) return finish();
    G.uni.uSpot.value = 0;
    setTimeout(() => { if (G && !G.over) startClient(); }, 1400);
    G.phase = 'between'; buttons();
  }
  function finish() {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Style the dream', title: 'Three looks, three happy clients', line: G.work && G.work.quote,
      cells: [{ k: 'Stars', v: `${G.stars}/9` }, { k: 'Poses', v: G.poses + G.hits }],
      say: 'Three looks, three happy clients. You styled the dream. ' + ((G.work && G.work.quote) || '') });
  }

  // ── buttons ──
  function buttons() {
    if (G.phase === 'style') {
      const el = G.ui.buttons([
        { label: 'Top', icon: '👚', aria: 'Next top. Now: ' + cur('top').name, press: () => nextIn('top') },
        { label: 'Bottom', icon: '👗', aria: 'Next skirt. Now: ' + cur('bottom').name, press: () => nextIn('bottom') },
        { label: 'Layer', icon: '🧥', aria: 'Jacket on or off. Now: ' + cur('layer').name, press: () => nextIn('layer') },
        { label: 'Colour', icon: '🎨', kind: 'black', aria: 'Next colour for the ' + cur(G.slot).name, press: () => nextColor() },
        { label: 'Done', icon: '✓', kind: 'red', aria: 'Done: show the client', press: () => done() },
      ]);
      if (el) el.forEach(b => Object.assign(b.style, { flex: '1 1 0', minWidth: '0', fontSize: '11px', padding: '0 4px', flexDirection: 'column', gap: '4px' }));
    } else if (G.phase === 'runway') G.ui.buttons([{ label: 'Pose', icon: '✨', kind: 'red', aria: 'Pose: press on the beat', press: () => pose() }]);
    else G.ui.buttons([]);
  }

  // ── a boutique groove that becomes a runway beat ──
  function makeMusic(ac) {
    const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(out);
    let next = 0, step = 0, timer = null, lvl = 0.35;
    const spb = 60 / BPM / 2;   // eighth notes
    const BASS = [55, 55, 65.4, 73.4, 55, 55, 82.4, 73.4], CH = [[220, 261.6, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];
    function hit(t, f, dur, type, vol, to = lp) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g).connect(to); o.start(t); o.stop(t + dur + 0.02); return o; }
    function noiseAt(t, dur, vol, f) { const n = ac.sampleRate * dur, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(), g = ac.createGain(), bp = ac.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = f; s.buffer = b; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(bp).connect(g).connect(out); s.start(t); }
    function schedule() {
      while (next < ac.currentTime + 0.15) {
        const s = step % 16, bar = Math.floor(step / 16) % 4, run = lvl > 0.6;
        if (s % 4 === 0) { const k = hit(next, 120, 0.22, 'sine', run ? 0.5 : 0.22, out); k.frequency.exponentialRampToValueAtTime(45, next + 0.18); }
        if (s % 8 === 4) noiseAt(next, run ? 0.14 : 0.08, run ? 0.22 : 0.06, 1200);
        if (s % 2 === 1 || run) noiseAt(next, 0.03, run ? 0.07 : 0.035, 7000);
        if (s % 2 === 0) hit(next, BASS[(s / 2) % 8] * (bar === 2 ? 0.89 : 1), 0.25, 'triangle', 0.16);
        if (s === 0 || s === 6 || (run && s === 10)) CH[bar].forEach(f => hit(next, f * 2, 0.5, 'sine', 0.025));
        next += spb; step++;
      }
    }
    return {
      start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 30); schedule(); this.level(lvl); },
      level(v) { lvl = v; out.gain.setTargetAtTime(v * 0.5, ac.currentTime, 0.3); lp.frequency.setTargetAtTime(v > 0.6 ? 5000 : 1400, ac.currentTime, 0.3); },
      stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
    };
  }

  // tap a garment on the wall: it lifts off its hanger and flies onto her
  function fromWall(w) {
    if (G.phase !== 'style') return;
    const [x0, y0, x1, y1] = w.box, [cx, cy] = G.S.P((x0 + x1) / 2, (y0 + y1) / 2), [tx, ty] = G.S.P(0.51, 0.6);
    const m = K.plane(G.wallTex[w.id], x1 - x0, (y1 - y0) * G.h, { order: 25 });
    m.position.set(cx, cy, 0.07); G.root.add(m);
    G.fly.push({ m, t: 0, from: [cx, cy], to: [tx, ty], w });
    G.say(w.say); K.noise(0.3, { vol: 0.12, freq: 900, sweepTo: 2600, q: 0.8 });
  }
  function land(w) {
    for (const [slot, id] of Object.entries(w.put)) { G.fit[slot] = id; G.slot = slot; }
    G.changes++; apply(); buttons();
    const [x, y] = G.S.P(0.51, 0.6); G.fx.add(x, y, '#ffffff', 14, 0.12); G.fx.add(x, y, '#f2cf1d', 10, 0.1);
    K.tone(784, 0.1, { vol: 0.06 }); K.tone(1175, 0.16, { vol: 0.05, delay: 0.08 });
  }

  return {
    title: 'Style the dream',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { ci: 0, phase: 'intro', fit: { top: 'yellow', bottom: 'black', layer: 'none' }, col: {}, slot: 'top', changes: 0, stars: 0, poses: 0, hits: 0, tries: 0,
        met: new Set(), colors: new Set(), fly: [], flashes: [], flash: 0, wipe: 1, sway: 0, swayTo: 0, dir: 1, beat: 0, beatT: 0, botT: 0 });
      G.music = makeMusic(K.audio());
      const v3 = () => ({ value: new THREE.Color() });
      G.uni = { map: { value: null }, bg: { value: null }, body: { value: null }, lay: { value: null }, fTop: { value: null }, fBot: { value: null },
        uTopS: { value: new THREE.Vector2(8, 8) }, uBotS: { value: new THREE.Vector2(8, 8) }, uTopMode: { value: 0 }, uBotMode: { value: 0 }, uLay: { value: 0 }, uSway: { value: 0 }, uFlash: { value: 0 }, uSpot: { value: 0 }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uWipe: { value: 1 },
        uTopCol: v3(), uBotCol: v3(), uLayCol: v3() };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 4; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'backdrop.jpg', 'bg'); raw(ART + 'body.png', 'body'); raw(ART + 'layer.png', 'lay');
      G.fab = {}; for (const f of ['floral', 'pink', 'beige']) L.load(ART + 'fab-' + f + '.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; G.fab[f] = t; });
      G.wallTex = {}; for (const w of WALL) L.load(ART + 'wall-' + w.id + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.wallTex[w.id] = t; });
      G.onGo = () => { G.music.start(); startClient(); };
      K.intro(G, { title: 'Style the dream', how: 'You’re Shardasia’s stylist. Tap the clothes on the wall, or use the buttons, to dress her for each client. Then take her down the runway.',
        say: 'Style the dream. Shardasia loves fashion, and today you are her stylist. Three clients will tell you what they need. Tap the clothes on the wall and they fly onto her, or use the buttons: Top, Bottom and Layer go through the rack, and Colour changes the colour. Every colour has its own sound. When the look is right, press Done, then take her down the runway.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the new look sweeps down her, with a shimmer
      G.wipe = Math.min(1.2, G.wipe + dt * 1.6); u.uWipe.value = 0.44 + G.wipe * 0.62;
      G.flash = Math.max(0, G.flash - dt * 2.5); u.uFlash.value = G.flash * 0.6;
      // flying clothes
      for (let i = G.fly.length - 1; i >= 0; i--) {
        const f = G.fly[i]; f.t += dt / 0.75; const k = Math.min(1, f.t), e = k * k * (3 - 2 * k);
        f.m.position.x = f.from[0] + (f.to[0] - f.from[0]) * e; f.m.position.y = f.from[1] + (f.to[1] - f.from[1]) * e + Math.sin(k * Math.PI) * 0.08;
        f.m.rotation.z = Math.sin(k * Math.PI) * 0.25 * (f.from[0] < 0 ? -1 : 1); const s = 1 + Math.sin(k * Math.PI) * 0.25 - k * 0.4; f.m.scale.set(s, s, 1);
        f.m.material.opacity = k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2;
        if (k >= 1) { G.root.remove(f.m); f.m.material.dispose(); G.fly.splice(i, 1); land(f.w); }
      }
      for (let i = G.flashes.length - 1; i >= 0; i--) { const f = G.flashes[i]; f.t += dt; const k = f.t / f.life; f.s.material.opacity = 1 - k; f.s.scale.setScalar(f.s.scale.x * (1 + dt * 2));
        if (k >= 1) { G.root.remove(f.s); f.s.material.dispose(); G.flashes.splice(i, 1); } }
      // the runway: count the beats, pose on them
      if (G.phase === 'runway') {
        u.uSpot.value += (1 - u.uSpot.value) * Math.min(1, dt * 2);
        G.beatT += dt; const spb = 60 / BPM;
        if (G.beatT >= spb) { G.beatT -= spb; G.beat++; G.posed = false;
          if (G.beat >= 0 && G.beat < BEATS) { K.tone(G.beat % 4 === 0 ? 1568 : 1175, 0.05, { vol: 0.035 }); if (Math.random() < 0.6) cameraFlash(1); G.ui.pop(String(BEATS - G.beat), innerWidth / 2, innerHeight * 0.3); }
          if (G.beat >= BEATS) { G.poses += G.hits; G.hits = 0; endRunway(); }
        }
        // the robot poses right on the beat
        if (G.bot && G.beat >= 0 && !G.posed && G.beatT > 0.02 && G.beatT < 0.1) pose();
      } else u.uSpot.value += (0 - u.uSpot.value) * Math.min(1, dt * 2);
      // she sways gently to the music, and snaps into poses
      const groove = G.phase === 'runway' ? Math.sin(G.t * Math.PI * BPM / 60) * 0.006 : Math.sin(G.t * 1.1) * 0.0025;
      G.sway += (G.swayTo + groove - G.sway) * Math.min(1, dt * (G.phase === 'runway' ? 9 : 3)); u.uSway.value = G.sway;
      if (G.phase === 'runway' && G.beatT > 0.35) G.swayTo *= Math.pow(0.2, dt);
      // the robot stylist: dresses each client right, then poses
      if (G.bot && G.phase === 'style') {
        G.botT += dt;
        const plan = [
          [() => fromWall(WALL[1]), () => done(), () => { G.fit.top = 'yellow'; G.fit.bottom = 'skirt'; G.col.bottom = 'coral'; apply(); }, () => done()],
          [() => fromWall(WALL[2]), () => { G.fit.bottom = 'black'; apply(); }, () => nextIn('layer'), () => nextIn('layer'), () => done()],
          [() => fromWall(WALL[3]), () => { G.fit.bottom = 'skirt'; G.col.bottom = 'hotpink'; apply(); }, () => done(), () => done()],
        ][G.ci];
        G.botI = G.botI || 0;
        if (G.botT > 1.4 && plan[G.botI]) { G.botT = 0; plan[G.botI](); G.botI++; }
      } else if (G.bot) { G.botI = 0; }
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down' || G.phase !== 'style') return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      // her: say what she's wearing
      if (p.u > 0.34 && p.u < 0.68 && p.v > 0.22) { G.say(describe()); return; }
      let best = null, bd = 9;
      for (const w of WALL) { const [x0, y0, x1, y1] = w.box; if (p.u > x0 && p.u < x1 && p.v > y0 && p.v < y1) { const d = Math.hypot(p.u - (x0 + x1) / 2, p.v - (y0 + y1) / 2); if (d < bd) { bd = d; best = w; } } }
      if (best) fromWall(best);
    },
    pause() { if (G) { G.paused = true; G.music.level(0); } },
    resume() { if (G) { G.paused = false; G.music.level(G.phase === 'runway' ? 1 : 0.35); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'style', playing: G.playing, over: G.over, phase: G.phase, client: G.ci, fit: { ...G.fit }, col: { ...G.col }, tags: [...tagsOf()], tries: G.tries,
      stars: G.stars, poses: G.poses, hits: G.hits, beat: G.beat, sway: +G.sway.toFixed(3), t: +G.t.toFixed(1) }; },
    stop() { if (G) G.music.stop(); K.cleanup(G); G = null; },
  };
}
