// HAUTE COUTURE DREAMS (Shardasia Hadley): STYLE THE DREAM.  (Polished 5 Nov 2026)
// Shardasia loves fashion: finding new styles, chic or kind of baggy, being comfortable, and trying out colours
// to see how they look on her. Here you are her stylist. Three clients each tell you what they need.
// One simple action: press NEXT to see the next of four looks on her (she twirls into each one, and clothes really fly
// off the collage wall onto her), and WEAR IT when the look fits. The third client is Shardasia herself: she wants a
// colour she's never worn, and her coloured dresses are spoken with their own sound (yellow rings like a bell, navy hums like a cello).
// When a look fits, she takes it down the runway: the lights drop, cameras flash from the photos on the wall, she walks
// towards you, and you press POSE on the beat to make her lean, spin, step and pop. Three looks, then Shardasia reads
// her own words in her own voice.
// Made for low vision: every look is spoken, every press has a sound, the beat is a clear kick, and tapping her
// repeats what she's wearing.
import * as THREE from 'three';
import * as K from './kit.js';

const ART = new URL('../../media/games/haute/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
const ARTIST = new URL('../../../3D/gallery/audio/art_50.mp3', import.meta.url).href;   // Shardasia, in her own words
const QUOTE = '“I’m into fashion at the moment. I like finding new and different styles of clothing, whether it be chic or kind of baggy. I like being comfortable. And I like trying out certain colors to see how they look on me.” — Shardasia Hadley';

const COLORS = {
  sunflower: { name: 'Sunflower yellow', hex: '#f2cf1d', note: 880, wave: 'sine', say: 'Sunflower yellow: bright as a bell.' },
  coral: { name: 'Coral', hex: '#ff6f5e', note: 784, wave: 'triangle', say: 'Coral: warm and sunny.' },
  hotpink: { name: 'Hot pink', hex: '#e8418a', note: 988, wave: 'square', say: 'Hot pink: loud and fun.' },
  red: { name: 'Cherry red', hex: '#c61f2b', note: 659, wave: 'sawtooth', say: 'Cherry red: strong, like a trumpet.' },
  emerald: { name: 'Emerald green', hex: '#1c9a62', note: 523, wave: 'triangle', say: 'Emerald green: rich and fresh.' },
  sky: { name: 'Sky blue', hex: '#7ab8e6', note: 587, wave: 'sine', say: 'Sky blue: light and breezy.' },
  lavender: { name: 'Lavender', hex: '#b39ade', note: 698, wave: 'sine', say: 'Lavender: soft and dreamy.' },
  navy: { name: 'Navy blue', hex: '#1e2b5c', note: 196, wave: 'triangle', say: 'Navy blue: deep, like a cello.' },
  black: { name: 'Black', hex: '#141416', note: 131, wave: 'triangle', say: 'Black: low and classic.' },
  white: { name: 'White', hex: '#f1efe8', note: 1047, wave: 'sine', say: 'White: clean and crisp.' },
  sand: { name: 'Sand beige', hex: '#d5c393', note: 392, wave: 'sine', say: 'Sand beige: soft and easy.' },
};
const FAB_SCALE = { floral: [8.5, 4], pink: [31, 4.5], beige: [12.5, 10] };   // how many times each fabric repeats across the painting
// how each piece is drawn on her. mode: 0 = what she's wearing in the painting, 1 = plain colour, 2 = a fabric from the wall
const PIECE = {
  top: { yellow: { mode: 0 }, floral: { mode: 2, fab: 'floral' }, beige: { mode: 2, fab: 'beige' }, pink: { mode: 2, fab: 'pink' }, tee: { mode: 1 } },
  bottom: { black: { mode: 0 }, floral: { mode: 2, fab: 'floral' }, pink: { mode: 2, fab: 'pink' }, beige: { mode: 2, fab: 'beige' }, skirt: { mode: 1 } },
};
// the clothes on the wall (u, v from the top-left of the painting): a look from the wall flies off its hanger onto her
const WALL = {
  blazer: [0.075, 0.255, 0.25, 0.555], floral: [0.2, 0.285, 0.41, 0.655], beige: [0.755, 0.345, 0.965, 0.595], pink: [0.8, 0.545, 0.955, 0.865],
};
const L = {   // the sentences that describe each piece (all recorded by Ben)
  yellow: 'Her sunflower yellow tee: soft cotton, easy and bright.',
  black: 'Her long black skirt: flowy and comfy, and it goes with everything.',
  blazer: 'The blazer: sharp tailoring and a crisp white collar. Instant chic.',
  beige: 'The beige button-up shirt: crisp and smart, a calm sandy colour.',
  pinkSkirt: 'A hot pink skirt with the swirly pattern. Made for dancing.',
  coralSkirt: 'And a swingy coral skirt: warm and sunny.',
  pinkDress: 'The hot pink dress.',
  floralDress: 'The floral dress: red roses on cream.',
  navyTee: 'A navy tee with her long black skirt.',
};
const NEXT = 'Try the next look.', CALMER = 'Try something calmer, like the beige shirt.';
// three clients; each has four looks to flip through, and one of them is right
const CLIENTS = [
  { name: 'Maya', job: 'A sunny day in the park', want: 'Comfy · Bright · Bold',
    brief: ['Client 1: Maya.', 'I’m spending the day in the park with my friends.', 'I want to be comfortable, but I want people to see me coming!', 'It’s sunny out.'],
    yes: 'Yes! Comfy, bright and bold. I love it!',
    looks: [
      { short: 'The floral dress', wall: 'floral', fit: { top: 'floral', bottom: 'floral', layer: 0 }, say: [L.floralDress], no: 'Pretty, but not bold enough for me.', hint: NEXT },
      { short: 'The blazer', wall: 'blazer', fit: { top: 'yellow', bottom: 'black', layer: 1 }, say: [L.blazer], no: 'A jacket? It’s way too warm in the park.', hint: NEXT },
      { short: 'Yellow tee, coral skirt', fit: { top: 'yellow', bottom: 'skirt', layer: 0 }, col: { bottom: 'coral' }, say: [L.yellow, L.coralSkirt], ok: true },
      { short: 'Navy tee, black skirt', fit: { top: 'tee', bottom: 'black', layer: 0 }, col: { top: 'navy' }, say: [L.navyTee], no: 'Too dark for a sunny day.', hint: NEXT },
    ] },
  { name: 'Jordan', job: 'A gallery opening', want: 'Chic · Smart · Calm',
    brief: ['Client 2: Jordan.', 'Tonight is the opening of my first art show.', 'I want to look chic and smart, but calm.', 'I don’t want my outfit louder than my paintings.'],
    yes: 'Chic, smart and calm. My paintings will be jealous.',
    looks: [
      { short: 'The hot pink dress', wall: 'pink', fit: { top: 'pink', bottom: 'pink', layer: 0 }, say: [L.pinkDress], no: 'That’s a party look, not a gallery look.', hint: CALMER },
      { short: 'Beige shirt, black skirt', wall: 'beige', fit: { top: 'beige', bottom: 'black', layer: 0 }, say: [L.beige, L.black], ok: true },
      { short: 'Yellow tee, pink skirt', fit: { top: 'yellow', bottom: 'pink', layer: 0 }, say: [L.yellow, L.pinkSkirt], no: 'Too loud! Calmer, please.', hint: CALMER },
      { short: 'The floral dress', wall: 'floral', fit: { top: 'floral', bottom: 'floral', layer: 0 }, say: [L.floralDress], no: 'Pretty, but too busy next to my paintings.', hint: CALMER },
    ] },
  { name: 'Shardasia', job: 'A dance party', want: 'Bold · Fun · A new colour',
    brief: ['Client 3: Shardasia.', 'Dance party tonight!', 'I want something bold and fun, and I need to be able to move.', 'Try a colour I’ve never worn!'],
    yes: 'Bold, fun, and I can dance in it. This is so me!',
    looks: [
      { short: 'Navy blue dress', colour: 'navy', fit: { top: 'tee', bottom: 'skirt', layer: 0 }, col: { top: 'navy', bottom: 'navy' }, say: [COLORS.navy.say], no: 'Too quiet for a dance party! Bolder, please.' },
      { short: 'Beige with the blazer', wall: 'blazer', fit: { top: 'beige', bottom: 'beige', layer: 1 }, say: [L.blazer], no: 'I can’t dance in a blazer!', hint: NEXT },
      { short: 'Sunflower yellow dress', colour: 'sunflower', fit: { top: 'tee', bottom: 'skirt', layer: 0 }, col: { top: 'sunflower', bottom: 'sunflower' }, say: [COLORS.sunflower.say], no: 'I always wear yellow! Try a colour I’ve never worn!' },
      { short: 'Emerald green dress', colour: 'emerald', fit: { top: 'tee', bottom: 'skirt', layer: 0 }, col: { top: 'emerald', bottom: 'emerald' }, say: [COLORS.emerald.say], ok: true },
    ] },
];
const LINES = {
  first: 'Press Next to see the first look.',
  runway: 'Runway! Press Pose on the beat.',
  end: 'Three looks, three happy clients. You styled the dream.',
};
const BPM = 100, SPB = 60 / BPM, POSES = 6, WALK = 16;   // up to 6 poses in a 16-beat walk
const MOVES = ['lean', 'spin', 'step', 'lean', 'hip', 'spin'];
const POPS = ['Fierce!', 'Yes!', 'Work it!', 'Iconic!', 'Stunning!', 'Legend!'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting with her outfit changed: her shirt and skirt are re-dressed (keeping the folds of the painted fabric),
// a blazer can go over the top, and she moves: sways, spins, steps towards you and strikes poses under a spotlight
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, bg, body, lay, fTop, fBot;
uniform vec2 uTopS, uBotS;
uniform float uTopMode, uBotMode, uLay, uSway, uSpin, uZoom, uBob, uMove, uFlash, uSpot, uPulse, uA, uH;
uniform vec3 uTopCol, uBotCol, uLayCol;
vec4 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))); }
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 dressed(vec2 q){
  vec3 c = at(map, q).rgb; vec3 b = at(body, q).rgb; float L = lum(c);
  float sh = clamp(L / 0.66, 0.3, 1.25);
  // the shirt: its mask, plus the tee's own shadowed fabric just beside it (under her arms, at the waist)
  float gr = c.g / max(c.r, 0.01), br = c.b / max(c.r, 0.01);
  float yel = smoothstep(0.6, 0.66, gr) * (1.0 - smoothstep(0.2, 0.26, br)) * step(0.15, c.r);        // clearly the yellow tee
  float yelDim = smoothstep(0.5, 0.58, gr) * (1.0 - smoothstep(0.2, 0.3, br));                         // the tee in deep shadow
  float skin = smoothstep(0.04, 0.09, c.r - c.b) * (1.0 - yel);                                         // warm and not yellow: her skin
  float nearTop = 0.0, nearBot = 0.0;
  if (b.b > 0.0 && b.r < 0.99 && b.g < 0.99) for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854; vec2 o = vec2(cos(a), sin(a) / uH) * 0.014;
    nearTop = max(nearTop, at(body, q + o).r); nearBot = max(nearBot, at(body, q + o).g); }
  float topM = max(b.r, b.b * max(yel * smoothstep(0.45, 0.47, q.y) * (1.0 - smoothstep(0.75, 0.78, q.y)), yelDim * nearTop));
  // the skirt: its mask but never her hands and wrists, plus the dark skirt just beside it (the painted skirt is neutral black)
  float botM = max(b.g * (1.0 - skin), b.b * nearBot * smoothstep(0.22, 0.14, L) * (1.0 - skin)) * (1.0 - topM * step(q.y, 0.7));
  vec3 top = uTopMode > 1.5 ? texture2D(fTop, q * uTopS * vec2(1.0, uH)).rgb * (0.15 + 0.8 * sh) : uTopCol * sh;
  if (uTopMode > 0.5) c = mix(c, top, topM);
  float drape = 0.9 + 0.12 * sin(q.x * 95.0 + q.y * 9.0) * smoothstep(0.74, 0.95, q.y) + clamp((L - 0.11) * 5.0, -0.2, 0.25);
  vec3 bot = uBotMode > 1.5 ? texture2D(fBot, q * uBotS * vec2(1.0, uH)).rgb * drape : uBotCol * drape;
  if (uBotMode > 0.5) c = mix(c, bot, botM);
  vec3 l = at(lay, q).rgb;
  float seam = 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.004, abs(q.x - 0.508))) * step(0.5, q.y);
  vec3 jk = uLayCol * (0.75 + 0.35 * mix(1.0, sh, b.r)) * seam + 0.05 * smoothstep(0.62, 0.5, q.y);
  c = mix(c, jk, l.r * uLay);
  c = mix(c, vec3(0.96, 0.95, 0.92) * (0.85 + 0.15 * sh), l.g * uLay);
  return c + uFlash * max(topM, botM) * 0.35;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // where she stood, the wall shows through when she moves. The patch is widened and soft-edged, so no outline
  // of the painted woman is left behind her, and it is dimmed like the rest of the wall.
  float hole = at(body, p).b;
  // (only look around where she might be: a quick check first keeps it light on phones)
  if (hole + at(body, p + vec2(0.03, 0.0)).b + at(body, p - vec2(0.03, 0.0)).b + at(body, p + vec2(0.0, 0.03)).b + at(body, p - vec2(0.0, 0.03)).b > 0.0) {
    for (int i = 0; i < 12; i++) { float a = float(i) * 0.5236; vec2 o = vec2(cos(a), sin(a) / uH);
      hole += at(body, p + o * 0.012).b + at(body, p + o * 0.026).b; }
    hole = clamp(hole / 25.0 * 2.2, 0.0, 1.0);
  }
  hole *= uMove;
  vec3 wall = at(bg, p).rgb * mix(1.0, 0.62, max(uSpot, 1.0 - abs(uSpin)));
  vec3 base = mix(at(map, p).rgb, wall, hole);
  // her: lean (rotate about her feet), step towards you (zoom), bounce (bob), spin (squeeze and mirror)
  vec2 piv = vec2(0.51, 1.04);
  vec2 d = (p - piv + vec2(0.0, uBob)) * vec2(1.0, uH);
  float c = cos(-uSway), s = sin(-uSway);
  d = vec2(c * d.x - s * d.y, s * d.x + c * d.y) / uZoom;
  float sx = uSpin, edge = smoothstep(0.03, 0.12, abs(sx));
  d.x /= (abs(sx) < 0.03 ? 0.03 : sx);
  vec2 q = piv + d / vec2(1.0, uH);
  float f = at(body, q).b * edge * step(0.0, q.x) * step(q.x, 1.0);
  vec3 col = base;
  if (f > 0.0) col = mix(base, dressed(q) * (0.55 + 0.45 * abs(sx)), f);
  // the runway: lights down, a spotlight on her that pulses with the beat
  float r = length((p - vec2(0.51, 0.6)) * vec2(1.6, 0.95 * uH));
  col *= mix(1.0, mix(1.0, 0.26, smoothstep(0.2, 0.44, r)), uSpot);
  col += uSpot * (0.07 + 0.09 * uPulse) * vec3(1.0, 0.92, 0.8) * (1.0 - smoothstep(0.0, 0.42, r));
  gl_FragColor = vec4(col, uA);
}`;

export function styleTheDreamGame() {
  let G = null;
  const client = () => CLIENTS[G.ci];
  const lookNow = () => (G.li >= 0 ? client().looks[G.li] : null);
  // speak a line once whatever is talking has finished (so the client's words are never cut off)
  function after(fn, min = 0.3) { G.queue = { fn, t: 0, min }; }

  // ── the outfit ──
  const raw = (c, hex) => { const n = parseInt(hex.slice(1), 16); c.r = (n >> 16 & 255) / 255; c.g = (n >> 8 & 255) / 255; c.b = (n & 255) / 255; };
  function dress(look, { twirl = true } = {}) {
    if (twirl) { G.pending = { look }; G.spinV = Math.PI * 2; G.spin = G.spin % (Math.PI * 2); }
    else putOn(look);
    K.tone(784, 0.1, { vol: 0.06 }); K.tone(1175, 0.16, { vol: 0.05, delay: 0.08 });
  }
  function putOn(look) {
    const u = G.uni, fit = look ? look.fit : { top: 'yellow', bottom: 'black', layer: 0 }, col = (look && look.col) || {};
    const t = PIECE.top[fit.top], b = PIECE.bottom[fit.bottom];
    u.uTopMode.value = t.mode; u.uBotMode.value = b.mode; u.uLay.value = fit.layer;
    if (t.mode === 1) raw(u.uTopCol.value, COLORS[col.top].hex);
    if (b.mode === 1) raw(u.uBotCol.value, COLORS[col.bottom].hex);
    raw(u.uLayCol.value, COLORS.black.hex);
    if (t.fab) { u.fTop.value = G.fab[t.fab]; u.uTopS.value.fromArray(FAB_SCALE[t.fab]); }
    if (b.fab) { u.fBot.value = G.fab[b.fab]; u.uBotS.value.fromArray(FAB_SCALE[b.fab]); }
    G.flash = 0.8;
    const [x, y] = G.S.P(0.51, 0.55); G.fx.add(x, y, '#ffffff', 14, 0.12); G.fx.add(x, y, '#f2cf1d', 10, 0.1);
  }

  // ── styling: NEXT shows the next look, WEAR IT picks it ──
  function startClient() {
    G.phase = 'style'; G.li = -1; G.tries = 0; G.busyFly = 0;
    const cl = client();
    dress(null, { twirl: false });
    G.ui.alert(cl.name, cl.job, 2.4, 'black'); panel();
    G.say(cl.brief.join(' ') + (G.ci === 0 ? ' ' + LINES.first : ''));
    buttons();
  }
  function panel() {
    const cl = client(), lk = lookNow(), n = cl.looks.length;
    const sub = !lk ? 'Press NEXT to see the first look.' : `Look ${G.li + 1} of ${n}: ${lk.short}`;
    G.ui.panel(`Client ${G.ci + 1} of 3 · ${cl.name} · ${cl.job}`, `<span style="font-size:.8em">${cl.want}</span>`, { segs: [G.ci, 3], sub });
  }
  function next() {
    if (G.phase !== 'style' || G.busyFly > 0) return;
    const cl = client(); G.li = (G.li + 1) % cl.looks.length;
    const lk = lookNow();
    K.noise(0.25, { vol: 0.1, freq: 900, sweepTo: 2600, q: 0.8 });   // a swish
    if (lk.colour) { const c = COLORS[lk.colour]; K.tone(c.note, 0.45, { type: c.wave, vol: c.wave === 'square' || c.wave === 'sawtooth' ? 0.035 : 0.08 }); K.tone(c.note * 1.5, 0.35, { vol: 0.03, delay: 0.08 }); }
    if (lk.wall) fly(lk); else dress(lk);
    G.say(lk.say.join(' '));
    panel();
  }
  function wear() {
    if (G.phase !== 'style') return;
    const cl = client(), lk = lookNow();
    if (!lk) { G.say(LINES.first); K.tone(330, 0.1, { vol: 0.05 }); return; }
    if (G.busyFly > 0) return;
    G.tries++;
    if (lk.ok) {
      const stars = Math.max(1, 4 - G.tries); G.stars += stars;
      G.ui.alert('She loves it', cl.name, 2, 'red'); K.sfx.win && K.sfx.win(); G.buzz([40, 30, 80]);
      G.say(cl.yes); G.phase = 'loved'; buttons();
      after(runway, 0.6);
    } else {
      G.ui.alert('Not quite', lk.no, 2.6, 'blue'); G.buzz([40, 60, 40]);
      K.tone(294, 0.14, { type: 'triangle', vol: 0.07 }); K.tone(247, 0.2, { type: 'triangle', vol: 0.07, delay: 0.12 });
      G.say(lk.no + (lk.hint ? ' ' + lk.hint : ''));
    }
  }
  // a look from the wall: the garment lifts off its hanger and flies onto her
  function fly(lk) {
    const [x0, y0, x1, y1] = WALL[lk.wall], [cx, cy] = G.S.P((x0 + x1) / 2, (y0 + y1) / 2), [tx, ty] = G.S.P(0.51, 0.55);
    const tex = G.wallTex[lk.wall];
    if (!tex) { dress(lk); return; }
    const m = K.plane(tex, x1 - x0, (y1 - y0) * G.h, { order: 25 });
    m.position.set(cx, cy, 0.07); G.root.add(m);
    G.fly.push({ m, t: 0, from: [cx, cy], to: [tx, ty], lk }); G.busyFly++;
  }

  // ── the runway ──
  function runway() {
    G.phase = 'runway'; G.ui.hidePanel(); G.hits = 0; G.rb = -1; G.lastBeat = null; G.posedOn = null; G.endAt = null;
    G.music.level(1); buttons();
    G.say(LINES.runway);
    G.ui.panel(`Runway · ${client().name}`, 'Pose on the beat', { segs: [0, POSES] });
  }
  function pose() {
    if (G.phase !== 'runway') return;
    const ph = G.music.beat(), near = Math.round(ph), off = Math.abs(ph - near) * SPB;
    if (off < 0.19 && G.rb >= 1 && G.posedOn !== near && G.hits < POSES) {
      G.posedOn = near; G.hits++;
      const mv = MOVES[(G.hits - 1) % MOVES.length];
      if (mv === 'lean') { G.dir = -G.dir; G.swayTo = 0.05 * G.dir; }
      if (mv === 'spin') G.spinV = Math.PI * 2;
      if (mv === 'step') { G.zoomTo += 0.05; G.bobV = 0.02; }
      if (mv === 'hip') { G.dir = -G.dir; G.swayTo = 0.045 * G.dir; G.bobV = -0.015; }
      G.flash = 1; cameraFlash(4); K.noise(0.07, { vol: 0.22, freq: 3500, q: 0.7 }); K.noise(0.05, { vol: 0.15, freq: 5000, q: 0.7, delay: 0.09 });
      K.tone(1319, 0.08, { vol: 0.05 }); G.buzz(25);
      G.ui.pop(POPS[(G.hits - 1) % POPS.length], innerWidth * (G.hits % 2 ? 0.3 : 0.7), innerHeight * 0.34);
      G.ui.panel(`Runway · ${client().name}`, `${G.hits} of ${POSES} poses`, { segs: [G.hits, POSES] });
      if (G.hits >= POSES && G.endAt === null) G.endAt = G.rb + 2;
    } else { K.tone(196, 0.08, { type: 'triangle', vol: 0.05 }); }
  }
  function cameraFlash(n) {
    for (let i = 0; i < n; i++) {
      let u, v; do { u = 0.06 + Math.random() * 0.88; v = 0.06 + Math.random() * 0.86; } while (u > 0.33 && u < 0.69 && v > 0.22);
      const [x, y] = G.S.P(u, v), s = K.sprite(K.glowTex, 0.07 + Math.random() * 0.07, { color: '#ffffff', additive: true, order: 30, opacity: 1 });
      s.position.set(x, y, 0.06); G.root.add(s); G.flashes.push({ s, life: 0.25 + Math.random() * 0.15, t: 0 });
    }
  }
  function onBeat() {
    G.rb++;
    G.pulse = 1;
    if (G.poseBtn) { G.poseBtn.style.transform = 'scale(1.06)'; setTimeout(() => { if (G && G.poseBtn) G.poseBtn.style.transform = ''; }, 140); }
    if (G.rb >= 1) { G.bobV = Math.max(G.bobV, 0.008); G.zoomTo = Math.min(1.3, G.zoomTo + 0.006); if (Math.random() < 0.5) cameraFlash(1); }   // she struts towards you
    if (G.rb >= WALL_END() || (G.endAt !== null && G.rb >= G.endAt)) endRunway();
  }
  const WALL_END = () => WALK + 1;
  function endRunway() {
    G.poses += G.hits; G.ci++;
    G.phase = 'between'; G.swayTo = 0; G.zoomTo = 1; G.music.level(0.35); buttons(); G.ui.hidePanel();
    if (G.ci >= CLIENTS.length) { G.spinV = Math.PI * 2; cameraFlash(8); return K.later(G, 0.9, () => G && finish()); }
    setTimeout(() => { if (G && !G.over) startClient(); }, 1500);
  }
  function finish() {
    G.phase = 'done';
    K.finale(G, { won: true, kicker: 'Style the dream', title: 'Three looks, three happy clients', line: (G.work && G.work.quote) || QUOTE,
      cells: [{ k: 'Stars', v: `${G.stars}/9` }, { k: 'Poses', v: `${G.poses}/${POSES * 3}` }], say: LINES.end });
    G.endT = 0;
  }

  // ── buttons: two while styling, one on the runway ──
  function buttons() {
    G.poseBtn = null;
    if (G.phase === 'style') G.ui.buttons([
      { label: 'Next', icon: '▶', kind: 'black', aria: 'Next look', press: () => next() },
      { label: 'Wear it', icon: '✓', kind: 'red', aria: 'Wear it: show the client', press: () => wear() },
    ]);
    else if (G.phase === 'runway') { const el = G.ui.buttons([{ label: 'Pose', icon: '★', kind: 'red', aria: 'Pose: press on the beat', press: () => pose() }]); G.poseBtn = el && el[0]; if (G.poseBtn) G.poseBtn.style.transition = 'transform .12s'; }
    else G.ui.buttons([]);
  }

  // ── a boutique groove that becomes a runway beat (the kick is the beat you pose on) ──
  function makeMusic(ac) {
    const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(out);
    let next = 0, step = 0, timer = null, lvl = 0.35, t0 = 0, on = true;
    const spe = SPB / 2;   // eighth notes
    const BASS = [55, 55, 65.4, 73.4, 55, 55, 82.4, 73.4], CH = [[220, 261.6, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];
    function hit(t, f, dur, type, vol, to = lp) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g).connect(to); o.start(t); o.stop(t + dur + 0.02); return o; }
    function noiseAt(t, dur, vol, f, type = 'highpass') { const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(), g = ac.createGain(), bp = ac.createBiquadFilter(); bp.type = type; bp.frequency.value = f; s.buffer = b; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(bp).connect(g).connect(out); s.start(t); }
    function schedule() {
      while (next < ac.currentTime + 0.15) {
        const s = step % 16, bar = Math.floor(step / 16) % 4, run = lvl > 0.6;
        if (s % 2 === 0) { const k = hit(next, 120, 0.22, 'sine', run ? 0.6 : 0.2, out); k.frequency.exponentialRampToValueAtTime(45, next + 0.18); }   // kick on every beat
        if (run && s % 2 === 0) noiseAt(next, 0.06, 0.12, 1800, 'bandpass');                                                                         // a clap on every beat on the runway
        if (s % 8 === 4) noiseAt(next, run ? 0.14 : 0.08, run ? 0.2 : 0.06, 1200);
        if (s % 2 === 1 || run) noiseAt(next, 0.03, run ? 0.06 : 0.03, 7000);
        if (s % 2 === 0) hit(next, BASS[(s / 2) % 8] * (bar === 2 ? 0.89 : 1), 0.25, 'triangle', 0.16);
        if (s === 0 || s === 6 || (run && s === 10)) CH[bar].forEach(f => hit(next, f * 2, 0.5, 'sine', 0.025));
        next += spe; step++;
      }
    }
    return {
      start() { if (timer) return; next = t0 = ac.currentTime + 0.1; timer = setInterval(schedule, 30); schedule(); this.level(lvl); },
      level(v) { lvl = v; if (on) out.gain.setTargetAtTime(v * 0.5, ac.currentTime, 0.3); lp.frequency.setTargetAtTime(v > 0.6 ? 5000 : 1400, ac.currentTime, 0.3); },
      mute(m) { on = !m; out.gain.setTargetAtTime(m ? 0 : lvl * 0.5, ac.currentTime, 0.2); },
      hush() { lvl = 0.2; out.gain.setTargetAtTime(0.05, ac.currentTime, 0.6); },
      beat() { return timer ? (ac.currentTime - t0) / SPB : 0; },   // beats since the music started (the kick lands on whole numbers)
      stop() { clearInterval(timer); timer = null; try { out.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
    };
  }

  // the robot stylist (…&bot=1): tries a wrong look first so every line is heard, then picks right, then poses on the beat
  const BOT = [['next', 'wear', 'next', 'wear', 'next', 'wear'], ['next', 'wear', 'next', 'wear'], ['next', 'wear', 'next', 'wear', 'next', 'wear', 'next', 'wear']];
  function botStep(dt) {
    if (G.phase === 'style') {
      G.botT += dt;
      if (G.botT > 1.6 && !(G.say.busy && G.say.busy() && G.botT < 6)) { G.botT = 0; const a = BOT[G.ci][G.botI++]; if (a === 'next') next(); else if (a === 'wear') wear(); }
    } else G.botI = 0;
    if (G.phase === 'runway') { const ph = G.music.beat(), fr = ph - Math.floor(ph); if (G.rb >= 1 && fr < 0.08 && G.posedOn !== Math.round(ph)) pose(); }
  }

  return {
    title: 'Style the dream',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { ci: 0, li: -1, phase: 'intro', stars: 0, poses: 0, hits: 0, tries: 0, rb: -1, busyFly: 0, queue: null, endT: 0, artist: null,
        fly: [], flashes: [], flash: 0, pending: null, pulse: 0, sway: 0, swayTo: 0, dir: 1, spin: 0, spinV: 0, zoom: 1, zoomTo: 1, bob: 0, bobV: 0, botT: 0, botI: 0, poseBtn: null });
      G.music = makeMusic(K.audio());
      // stop Shardasia's clip if the player opens her story video, so two voices don't overlap
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      const v3 = () => ({ value: new THREE.Color() }), f = v => ({ value: v });
      G.uni = { map: f(null), bg: f(null), body: f(null), lay: f(null), fTop: f(null), fBot: f(null),
        uTopS: f(new THREE.Vector2(8, 8)), uBotS: f(new THREE.Vector2(8, 8)), uTopMode: f(0), uBotMode: f(0), uLay: f(0), uSway: f(0), uSpin: f(1), uZoom: f(1), uBob: f(0), uMove: f(1),
        uFlash: f(0), uSpot: f(0), uPulse: f(0), uA: f(0), uH: f(G.h), uTopCol: v3(), uBotCol: v3(), uLayCol: v3() };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const TL = new THREE.TextureLoader(); let need = 4; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const load = (url, key) => TL.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      load((ctx.work && ctx.work.image) || new URL('../../targets/haute-couture-dreams.jpg', import.meta.url).href, 'map');
      load(ART + 'backdrop.jpg', 'bg'); load(ART + 'body.png', 'body'); load(ART + 'layer.png', 'lay');
      G.fab = {}; for (const fb of ['floral', 'pink', 'beige']) TL.load(ART + 'fab-' + fb + '.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; G.fab[fb] = t; });
      G.wallTex = {}; for (const w of Object.keys(WALL)) TL.load(ART + 'wall-' + w + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.wallTex[w] = t; });
      G.onGo = () => { G.music.start(); startClient(); };
      K.intro(G, { title: 'Style the dream', how: 'Press NEXT to see each look. Press WEAR IT when it fits the client. Then pose on the beat!',
        say: 'Style the dream. Shardasia loves fashion, and today you are her stylist. Three clients will tell you what they need. Press Next to see each look, and Wear It when it fits. Then take her down the runway, and press Pose on the beat.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // a line waiting for the last one to finish
      if (G.queue) { const q = G.queue; q.t += dt; if (q.t > q.min && (!(G.say.busy && G.say.busy()) || q.t > 7)) { G.queue = null; q.fn(); } }
      // a shimmer when the new look goes on
      G.flash = Math.max(0, G.flash - dt * 2.5); u.uFlash.value = G.flash * 0.6;
      G.pulse = Math.max(0, G.pulse - dt * 4); u.uPulse.value = G.pulse;
      // flying clothes
      for (let i = G.fly.length - 1; i >= 0; i--) {
        const fl = G.fly[i]; fl.t += dt / 0.7; const k = Math.min(1, fl.t), e = k * k * (3 - 2 * k);
        fl.m.position.x = fl.from[0] + (fl.to[0] - fl.from[0]) * e; fl.m.position.y = fl.from[1] + (fl.to[1] - fl.from[1]) * e + Math.sin(k * Math.PI) * 0.08;
        fl.m.rotation.z = Math.sin(k * Math.PI) * 0.25 * (fl.from[0] < 0 ? -1 : 1); const s = 1 + Math.sin(k * Math.PI) * 0.25 - k * 0.4; fl.m.scale.set(s, s, 1);
        fl.m.material.opacity = k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2;
        if (k >= 1) { G.root.remove(fl.m); fl.m.material.dispose(); G.fly.splice(i, 1); G.busyFly = Math.max(0, G.busyFly - 1); if (G.phase === 'style') dress(fl.lk); }
      }
      for (let i = G.flashes.length - 1; i >= 0; i--) { const fl = G.flashes[i]; fl.t += dt; const k = fl.t / fl.life; fl.s.material.opacity = 1 - k; fl.s.scale.setScalar(fl.s.scale.x * (1 + dt * 2));
        if (k >= 1) { G.root.remove(fl.s); fl.s.material.dispose(); G.flashes.splice(i, 1); } }
      // the runway: lights down, count the beats from the music's own clock
      if (G.phase === 'runway') {
        u.uSpot.value += (1 - u.uSpot.value) * Math.min(1, dt * 2);
        const b = Math.floor(G.music.beat());
        if (G.lastBeat === null) G.lastBeat = b; else if (b !== G.lastBeat) { G.lastBeat = b; onBeat(); }
      } else u.uSpot.value += (0 - u.uSpot.value) * Math.min(1, dt * 1.5);
      // she moves: a gentle sway to the groove, twirls when she changes, leans, spins, steps and bounces on the runway
      const run = G.phase === 'runway';
      const groove = run ? Math.sin(G.music.beat() * Math.PI) * 0.012 : Math.sin(G.t * 1.3) * 0.006;
      G.sway += (G.swayTo + groove - G.sway) * Math.min(1, dt * (run ? 9 : 3)); u.uSway.value = G.sway;
      if (run) G.swayTo *= Math.pow(0.25, dt); else G.swayTo *= Math.pow(0.05, dt);
      if (G.spinV > 0) { const st = Math.min(G.spinV, dt * Math.PI * 2 / 0.55); G.spin += st; G.spinV -= st; if (G.spinV <= 0) G.spin = 0; }
      if (G.pending && (G.spinV <= 0 || Math.cos(G.spin) < 0.1)) { const pl = G.pending; G.pending = null; putOn(pl.look); }   // the new look goes on as she turns side-on
      u.uSpin.value = Math.cos(G.spin);
      G.zoom += (G.zoomTo - G.zoom) * Math.min(1, dt * (run ? 4 : 1.5)); u.uZoom.value = G.zoom;
      G.bob += (G.bobV - G.bob) * Math.min(1, dt * 18); G.bobV *= Math.pow(0.001, dt); u.uBob.value = G.bob + (run ? Math.abs(Math.sin(G.music.beat() * Math.PI)) * 0.004 : Math.sin(G.t * 1.3 + 1) * 0.0015);
      // the finale: wait for the last line, then Shardasia reads her own words
      if (G.over && !G.artist) {
        G.endT += dt;
        if (G.endT > 2.5 && (!(G.say.busy && G.say.busy()) || G.endT > 6)) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.music.hush(); }
      }
      if (G.bot) botStep(dt);
    },
    pointer(kind, ev) {
      if (!G || kind !== 'down' || G.phase !== 'style') return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      // tap her: hear what she's wearing again (or the client's brief)
      if (p.u > 0.34 && p.u < 0.68 && p.v > 0.22) { const lk = lookNow(); G.say(lk ? lk.say.join(' ') : client().brief.slice(1).join(' ')); return; }
      // tap a garment on the wall: if it's one of this client's looks, it flies onto her
      for (const [id, [x0, y0, x1, y1]] of Object.entries(WALL)) {
        if (p.u > x0 && p.u < x1 && p.v > y0 && p.v < y1) {
          const i = client().looks.findIndex(l => l.wall === id);
          if (i >= 0 && G.busyFly === 0) { G.li = i - 1; next(); } else K.tone(330, 0.08, { vol: 0.04 });
          return;
        }
      }
    },
    pause() { if (G) { G.paused = true; G.music.mute(true); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.music.mute(false); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'style', playing: G.playing, over: G.over, phase: G.phase, client: G.ci, look: G.li, tries: G.tries, stars: G.stars, poses: G.poses, hits: G.hits, rb: G.rb,
      sway: +G.sway.toFixed(3), spin: +Math.cos(G.spin).toFixed(2), zoom: +G.zoom.toFixed(3), artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.music.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
