// 8 GATES — MERU · SCHOOL FOR THE BLIND [meruBlindSchool]. Mr. Alder is out today, so HOPE is the substitute teacher.
// A full interior (lobby, hall, classroom, art room, gym, music room, library) the player can walk around on the standard Game HUD,
// plus HOPE'S CLASS: four lessons, each with its own touch controls (mobile first):
//   1 BRAILLE    · write words on a six-key Perkins brailler (press dots together = a chord; or tap dots + EMBOSS; desktop F D S / J K L)
//   2 TOUCH ART  · swell paper: a raised-line picture you cannot see. Feel it with a finger (hum + buzz on the line), then name it
//   3 CANE WALK  · sleepshades on, two-point touch down the hall: swipe across = sweep the cane + one step; a short arc misses things
//   4 GOALBALL   · eyeshades on, the ball has bells in it: listen (and watch the sound ripples), dive to block, throw into the quiet gap
// START THE SCHOOL DAY runs all four periods with the bell between and ends on a REPORT CARD (stars, helper pay in gold, day unlocks).
// Any lesson can be practised alone from its station or from the welcome card rows.
// MERGE: createBlindSchool({ container }) stands alone; buildSchool(ctx) builds the interior from a Meru-style ctx at ctx.origin
// ({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin }) so meru-game.js can drop it into any building later (quick-fade interior).
import * as THREE from '../../vendor/three/three.module.js';
import { rr, pick, clamp, damp, smooth, makeGradient, glowTexture } from '../../village-game.js';
import { canvasTex, crestTex } from '../../engine/textures.js';
import { foxKit } from '../../fox-kit.js';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { caneKit, CANE_DEFAULTS } from '../../engine/cane.js';
import { save } from '../../engine/save.js';

export const SCHOOL = { name: 'SCHOOL FOR THE BLIND', room: 'meruBlindSchool', w: 26, d: 20, key: 'meru.blindSchool.v1' };
const R = Math.random, RR = (a, b) => a + R() * (b - a), PICK = a => a[Math.floor(R() * a.length)], SHUF = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------------- braille ----------------
// six-dot cells: dots 1 2 3 run down the left column, 4 5 6 down the right
export const BRAILLE = { a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5], f: [1, 2, 4], g: [1, 2, 4, 5], h: [1, 2, 5], i: [2, 4], j: [2, 4, 5] };
'klmnopqrst'.split('').forEach((ch, i) => { BRAILLE[ch] = [...BRAILLE['abcdefghij'[i]], 3].sort(); });
Object.assign(BRAILLE, { u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6], x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6] });
export const dotKey = d => [...d].sort((a, b) => a - b).join('');
export const BY_DOTS = Object.fromEntries(Object.entries(BRAILLE).map(([k, v]) => [dotKey(v), k]));
const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
export const dotsSay = d => { const s = [...d].sort((a, b) => a - b).map(n => NUMW[n]); return s.length === 1 ? 'dot ' + s[0] : 'dots ' + s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1]; };
// word tiers: day 1 = a-j (dots 1 2 4 5 only), day 2 adds k-t (dot 3), day 3+ adds u-z (dot 6)
export const WORDS = [
  ['bad', 'cab', 'fed', 'bag', 'dig', 'hid', 'jab', 'bead', 'face', 'cage', 'idea', 'beef', 'deaf', 'fig', 'ache', 'jig'],
  ['hope', 'moon', 'star', 'lamp', 'book', 'snap', 'pets', 'fish', 'talk', 'kite', 'milk', 'song', 'tree', 'frog', 'nest', 'map'],
  ['fox', 'meru', 'wave', 'jump', 'yes', 'quiz', 'sun', 'zoo', 'gym', 'hug', 'five', 'box', 'very', 'buzz']];

// ---------------- tactile pictures (swell paper), unit square, y down ----------------
const arc = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 30, rx) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * (rx ?? r), cy + Math.sin(a) * r]; });
export const PICTURES = {
  fish: { name: 'FISH', clue: 'It lives in Meru Lake and never stops swimming.', lines: [arc(0.44, 0.5, 0.2, 0, Math.PI * 2, 34, 0.3), [[0.73, 0.5], [0.92, 0.32], [0.92, 0.68], [0.73, 0.5]], arc(0.27, 0.45, 0.03, 0, 7, 10), [[0.5, 0.33], [0.56, 0.5], [0.5, 0.67]]] },
  star: { name: 'STAR', clue: 'Five points. You see lots of them from the space dock.', lines: [Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.17 : 0.4; return [0.5 + Math.cos(a) * r, 0.54 + Math.sin(a) * r]; })] },
  house: { name: 'HOUSE', clue: 'It has a roof, a door, and somebody lives in it.', lines: [[[0.2, 0.9], [0.2, 0.48], [0.8, 0.48], [0.8, 0.9], [0.2, 0.9]], [[0.12, 0.52], [0.5, 0.14], [0.88, 0.52]], [[0.43, 0.9], [0.43, 0.67], [0.57, 0.67], [0.57, 0.9]], [[0.27, 0.58], [0.37, 0.58], [0.37, 0.68], [0.27, 0.68], [0.27, 0.58]]] },
  sun: { name: 'SUN', clue: 'Round in the middle, with rays all the way around. Warm on your fur.', lines: [arc(0.5, 0.5, 0.17, 0, 7, 28), ...Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return [[0.5 + Math.cos(a) * 0.25, 0.5 + Math.sin(a) * 0.25], [0.5 + Math.cos(a) * 0.41, 0.5 + Math.sin(a) * 0.41]]; })] },
  moon: { name: 'MOON', clue: 'A curved shape, thin at both tips. It comes out at night.', lines: [arc(0.5, 0.5, 0.38, Math.PI * 0.35, Math.PI * 1.65, 34), arc(0.66, 0.5, 0.34, Math.PI * 1.51, Math.PI * 0.49, 30)] },
  cup: { name: 'CUP', clue: 'You hold it by the loop on the side. Hot cocoa goes in it.', lines: [[[0.22, 0.27], [0.27, 0.82], [0.67, 0.82], [0.72, 0.27]], [[0.19, 0.27], [0.75, 0.27]], arc(0.73, 0.52, 0.14, -Math.PI * 0.42, Math.PI * 0.42, 16)] },
  tree: { name: 'TREE', clue: 'A straight trunk with a big round top full of leaves.', lines: [[[0.44, 0.92], [0.44, 0.62], [0.56, 0.62], [0.56, 0.92]], Array.from({ length: 49 }, (_, i) => { const a = i / 48 * Math.PI * 2, r = 0.25 + 0.035 * Math.sin(a * 7); return [0.5 + Math.cos(a) * r, 0.38 + Math.sin(a) * r * 0.9]; })] },
  heart: { name: 'HEART', clue: 'Two bumps on top and a point at the bottom.', lines: [Array.from({ length: 49 }, (_, i) => { const t = i / 48 * Math.PI * 2, x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); return [0.5 + x * 0.024, 0.46 - y * 0.024]; })] },
  boat: { name: 'SAILBOAT', clue: 'A tall pole with a sail on it, floating on the water.', lines: [[[0.14, 0.72], [0.86, 0.72], [0.72, 0.87], [0.28, 0.87], [0.14, 0.72]], [[0.5, 0.72], [0.5, 0.12]], [[0.53, 0.16], [0.82, 0.66], [0.53, 0.66], [0.53, 0.16]], [[0.47, 0.24], [0.47, 0.66], [0.24, 0.66], [0.47, 0.24]]] },
  key: { name: 'KEY', clue: 'A ring at one end and little teeth at the other. It opens doors.', lines: [arc(0.27, 0.5, 0.14, 0, 7, 24), [[0.41, 0.5], [0.88, 0.5]], [[0.88, 0.5], [0.88, 0.63]], [[0.78, 0.5], [0.78, 0.66]], [[0.68, 0.5], [0.68, 0.6]]] },
  fox: { name: 'FOX', clue: 'Two pointy ears and a pointed nose. Hey, that is you!', lines: [[[0.5, 0.86], [0.24, 0.5], [0.2, 0.13], [0.38, 0.34], [0.62, 0.34], [0.8, 0.13], [0.76, 0.5], [0.5, 0.86]], arc(0.5, 0.79, 0.035, 0, 7, 10), arc(0.39, 0.52, 0.03, 0, 7, 10), arc(0.61, 0.52, 0.03, 0, 7, 10)] },
  apple: { name: 'APPLE', clue: 'Round, with a little stem and a leaf on top. Crunchy.', lines: [Array.from({ length: 49 }, (_, i) => { const t = i / 48 * Math.PI * 2, r = 0.3 * (1 - 0.13 * Math.exp(-((Math.atan2(Math.sin(t + Math.PI / 2), Math.cos(t + Math.PI / 2))) ** 2) * 6)); return [0.5 + Math.cos(t) * r * 1.05, 0.6 + Math.sin(t) * r]; }), [[0.5, 0.34], [0.54, 0.13]], arc(0.64, 0.21, 0.05, 0, 7, 14, 0.09)] },
};
const PIC_TIERS = [['fish', 'star', 'house', 'sun'], ['moon', 'cup', 'tree', 'heart'], ['boat', 'key', 'fox', 'apple']];

// ---------------- the people ----------------
export const KIDS = [
  { id: 'juno', name: 'JUNO', role: 'Braille speed champ', torso: ['#f472b6', '#fce7f3', '#9d174d'], fur: '#e9772c', cane: true,
    talk: ["Hi Ben! I know your footsteps. You walk like you're late for something.", "Hope is SUBBING? Best day ever. Mr. Alder never lets us play goalball first period.", "Want a tip? On the brailler, don't press the dots one by one. Press them all together, like a piano chord."],
    hello: ['Hi Ben!', 'Ben! Over here!', 'Is that Ben? It is!'] },
  { id: 'pip', name: 'PIP', role: 'Low vision · big print', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], fur: '#f08a3c', sun: true,
    talk: ["I can see a little. Big shapes and bright colours. Small print just turns into fuzz.", "These glasses are for the glare. Bright light makes everything wash out.", "I read big print AND braille. Braille never gets tired eyes."],
    hello: ['Hey Ben!', 'Ben! Nice armour.', 'Hi! I see an orange blur, so it must be you.'] },
  { id: 'tobi', name: 'TOBI', role: 'Goalball captain', torso: ['#22c55e', '#dcfce7', '#14532d'], fur: '#d86a26', cane: true,
    talk: ["Goalball is the best sport ever made. Everybody wears eyeshades, so it's fair for everyone.", "The ball has bells inside. You listen for it, then you DIVE.", "When the Owls tap the floor, they're telling you where they are. Throw where it's quiet."],
    hello: ['Yo, Ben!', 'Ben! You playing goalball later?', 'Hey hey!'] },
  { id: 'mae', name: 'MAE', role: 'Plays piano by ear', torso: ['#a78bfa', '#ede9fe', '#4c1d95'], fur: '#ef7b30',
    talk: ["I hear a song once and then I can play it. Want to hear the Meru anthem?", "Music has its own braille too. Notes are dots, just like letters.", "The piano is in the music room, past the lobby on the west side. Follow the sound."],
    hello: ['Hi Ben!', 'Hello, Ben.', 'Ben! Listen to this.'] },
  { id: 'rio', name: 'RIO', role: 'Sculptor', torso: ['#f59e0b', '#fef3c7', '#92400e'], fur: '#e36f22',
    talk: ["I make things you can touch. Clay is the best, it remembers your fingers.", "The Blind Canvas Project painted those pictures on the wall. You can touch them. You're SUPPOSED to.", "In art today you'll get swell paper. The lines puff up so you can feel the drawing."],
    hello: ['Hi Ben.', 'Ben! Feel this bowl I made.', 'Hey!'] },
];
export const OWLS = [{ name: 'OKO', role: 'Owls captain' }, { name: 'WREN', role: 'Owls wing' }, { name: 'BIRCH', role: 'Owls wing' }];

// ---------------- lines (Hope) ----------------
const HOPE = {
  hi: "Ben! I'd know those footsteps anywhere. Mr. Alder is out today, so I'm the substitute. Want to join my class?",
  dayStart: "Good morning, class! I'm Hope, and I'm your substitute today. Ben is joining us. Four lessons, and then we're done. Let's go!",
  brIntro: "Period one, braille. Six keys, six dots. Left hand: dots one, two, three. Right hand: four, five, six. Press them together and the brailler punches one letter.",
  brIntro2: "Braille time. Six keys, six dots. Press them together for a letter.",
  artIntro: "Period two, art. This is swell paper. The lines are raised, so you read the drawing with your fingers. Eyes shut, everybody. Feel the picture, then tell me what it is.",
  artIntro2: "Swell paper. Feel the raised lines, then tell me what the picture is.",
  caneIntro: "Period three, cane skills. Sleepshades on. Sweep the cane all the way across your body with every step. Left, right, left. If it touches something, stop and step around it.",
  caneIntro2: "Sleepshades on. Sweep wide with every step. If you touch something, step around it.",
  goalIntro: "Last period! Goalball against the Meru Owls. Eyeshades on, everyone, so it's fair. The ball has bells in it. Listen for it and dive. When you throw, aim where it's quiet.",
  goalIntro2: "Goalball. Eyeshades on. Listen for the bells and dive. Throw where it's quiet.",
  report: "That's the bell! Great work today. Here's your report card, Ben.",
};

// ---------------- the interior ----------------
// Footprint 26 x 20 m centred on ctx.origin. Rooms (x0, x1, z0, z1), north = -z:
export const ROOMS = {
  class: { name: 'Classroom', b: [-13, -3, -10, -1] }, art: { name: 'Art Room', b: [-3, 4, -10, -1] }, gym: { name: 'Gym', b: [4, 13, -10, -1] },
  hall: { name: 'Hallway', b: [-13, 13, -1, 3] }, music: { name: 'Music Room', b: [-13, -5, 3, 10] }, lobby: { name: 'Lobby', b: [-5, 5, 3, 10] }, library: { name: 'Library', b: [5, 13, 3, 10] } };
export const SPOTS = {
  entrance: [0, 9.2], hopeFront: [-8, -8.3], benDesk: [-8, -5.9], kidDesks: [[-11, -5.9], [-5, -5.9], [-11, -3.4], [-8, -3.4], [-5, -3.4]],
  artTable: [0.5, -5.6], caneStart: [-11.8, 1], caneEnd: 10.9, gymBen: [8.2, -2.5], lanesX: [6.2, 8.2, 10.2], owlsZ: -8.7, ourGoalZ: -1.75, theirGoalZ: -9.45 };

export function buildSchool(ctx) {
  const { M, toon, scene, addOutline } = ctx, O = ctx.origin || new THREE.Vector3(), root = new THREE.Group(); root.position.copy(O); scene.add(root);
  const H = 3.1, T = 0.22, walls = [], boxes = [], signs = [], lamps = [], fx = {};
  const box = (w, h, d, col, x, y, z, parent = root, ol = 0.02) => M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, parent, ol);
  const cyl = (rt, rb, h, col, x, y, z, parent = root, seg = 14, ol = 0.015) => M(new THREE.CylinderGeometry(rt, rb, h, seg), typeof col === 'string' ? toon(col) : col, x, y, z, parent, ol, Math.max(rt, rb));
  const solid = (x0, x1, z0, z1) => boxes.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
  const solidAt = (x, z, w, d) => solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  // ----- textures -----
  const noiseTex = (base, spots, n = 900, size = 256, rep = [4, 4]) => canvasTex(size, size, (g) => { g.fillStyle = base; g.fillRect(0, 0, size, size); for (let i = 0; i < n; i++) { g.fillStyle = spots[i % spots.length]; g.globalAlpha = 0.35 + 0.4 * R(); const r = 0.6 + R() * 1.8; g.fillRect(R() * size, R() * size, r, r); } g.globalAlpha = 1; }, rep);
  const woodTex = (a, b, rep) => canvasTex(256, 256, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(0, i * 16, 256, 16); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, i * 16, 256, 1.5); for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(((i * 97 + k * 61) % 256), i * 16, 1.5, 16); } } }, rep);
  const tileTex = (a, b, rep, n = 8) => canvasTex(256, 256, (g) => { const s = 256 / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * s, y * s, s, s); } g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 256); g.moveTo(0, i * s); g.lineTo(256, i * s); g.stroke(); } }, rep);
  const floorMat = t => new THREE.MeshToonMaterial({ map: t, gradientMap: ctx.grad });
  const blobTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.35 }); fx.blobMat = blobMat; fx.blobTex = blobTex;
  function blob(parent, w, d, op = 0.35) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), op === 0.35 ? blobMat : new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.y = 0.014; m.renderOrder = 1; parent.add(m); return m; }
  const floor = (b, mat, y = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(b[1] - b[0], b[3] - b[2]), mat); m.rotation.x = -Math.PI / 2; m.position.set((b[0] + b[1]) / 2, y, (b[2] + b[3]) / 2); m.receiveShadow = true; root.add(m); return m; };
  floor(ROOMS.class.b, floorMat(woodTex('#c99a62', '#bf8f58', [4, 4])));
  floor(ROOMS.art.b, floorMat(noiseTex('#d9d2c4', ['#b85c38', '#2f6db0', '#e6b45a', '#7a7268'], 700, 256, [3, 3])));
  floor(ROOMS.gym.b, floorMat(woodTex('#e3b679', '#d9aa6c', [3, 5])));
  floor(ROOMS.hall.b, floorMat(tileTex('#e9e4da', '#dcd5c8', [13, 2])));
  floor(ROOMS.music.b, floorMat(noiseTex('#8c2f3a', ['#6e2430', '#a33d48'], 1400, 256, [3, 3])));
  floor(ROOMS.lobby.b, floorMat(noiseTex('#cfc8bb', ['#8a847e', '#f4efe6', '#b5aea2', '#e6b45a'], 1800, 256, [3, 3])));
  floor(ROOMS.library.b, floorMat(noiseTex('#2f4f7a', ['#284268', '#38608f'], 1400, 256, [3, 3])));
  { const out = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), toon('#5b8f3a')); out.rotation.x = -Math.PI / 2; out.position.set(0, -0.02, 2); root.add(out); }
  // tactile guide strip (yellow, raised dots) from the front door to the hall, then along the hall
  { const tt = canvasTex(64, 64, (g) => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#d9a514'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.beginPath(); g.arc(8 + x * 16, 8 + y * 16, 5, 0, 7); g.fill(); } }, [1, 12]);
    const m1 = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 7), floorMat(tt)); m1.rotation.x = -Math.PI / 2; m1.position.set(0, 0.012, 6.3); root.add(m1);
    const tt2 = tt.clone(); tt2.repeat.set(1, 40); tt2.needsUpdate = true; const m2 = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 25), floorMat(tt2)); m2.rotation.set(-Math.PI / 2, 0, Math.PI / 2); m2.position.set(0, 0.012, 2.55); root.add(m2); }
  // ----- walls (with door gaps); every piece is a cut-away segment -----
  const wallMat = { out: toon('#efe3cf'), inn: toon('#f4ecdf'), trim: toon('#6b4f3a'), hall: toon('#d6e4ee'), crown: toon('#fbf7ef'), low: toon('#8fa9a0') };
  const LOWER = new Map([[wallMat.out, toon('#b9a17e')], [wallMat.inn, toon('#8fa9a0')], [wallMat.hall, toon('#3d6f99')]]);
  function wallRun(axis, c, a0, a1, gaps = [], mat = wallMat.inn, h = H) {
    const cuts = [[a0, a1]]; gaps.forEach(([gc, gw]) => { const g0 = gc - gw / 2, g1 = gc + gw / 2; for (let i = cuts.length - 1; i >= 0; i--) { const [s, e] = cuts[i]; if (g1 <= s || g0 >= e) continue; cuts.splice(i, 1, ...[[s, g0], [g1, e]].filter(([p, q]) => q - p > 0.05)); } });
    for (const [s, e] of cuts) { const L = e - s, mid = (s + e) / 2, g = new THREE.Group(); root.add(g);
      const w = axis === 'x' ? M(new THREE.BoxGeometry(L, h, T), mat, 0, h / 2, 0, g, 0.015) : M(new THREE.BoxGeometry(T, h, L), mat, 0, h / 2, 0, g, 0.015);
      const sk = axis === 'x' ? M(new THREE.BoxGeometry(L, 0.16, T + 0.04), wallMat.trim, 0, 0.08, 0, g, 0) : M(new THREE.BoxGeometry(T + 0.04, 0.16, L), wallMat.trim, 0, 0.08, 0, g, 0);
      { const low = LOWER.get(mat) || wallMat.low, bx = (w, hh, y, mt, th) => axis === 'x' ? M(new THREE.BoxGeometry(w, hh, T + th), mt, 0, y, 0, g, 0) : M(new THREE.BoxGeometry(T + th, hh, w), mt, 0, y, 0, g, 0);
        bx(L, 0.92, 0.62, low, 0.025); bx(L, 0.06, 1.1, wallMat.trim, 0.06); bx(L, 0.1, h - 0.05, wallMat.crown, 0.05); }
      if (axis === 'x') { g.position.set(mid, 0, c); walls.push({ g, a: [s, c], b: [e, c], h, cur: 1 }); solid(s, e, c - T / 2, c + T / 2); }
      else { g.position.set(c, 0, mid); walls.push({ g, a: [c, s], b: [c, e], h, cur: 1 }); solid(c - T / 2, c + T / 2, s, e); } }
    // door frames
    gaps.forEach(([gc, gw, noFrame]) => { if (noFrame) return; const fm = toon('#8a5a32'), fg = new THREE.Group(); root.add(fg); for (const sd of [-1, 1]) { const p = gc + sd * (gw / 2 + 0.05); if (axis === 'x') box(0.1, 2.5, T + 0.1, fm, p, 1.25, c, fg); else box(T + 0.1, 2.5, 0.1, fm, c, 1.25, p, fg); } if (axis === 'x') box(gw + 0.2, 0.12, T + 0.1, fm, gc, 2.5, c, fg); else box(T + 0.1, 0.12, gw + 0.2, fm, c, 2.5, gc, fg);
      walls.push({ g: fg, a: axis === 'x' ? [gc - gw / 2 - 0.1, c] : [c, gc - gw / 2 - 0.1], b: axis === 'x' ? [gc + gw / 2 + 0.1, c] : [c, gc + gw / 2 + 0.1], h: 2.6, cur: 1, frame: true }); });
  }
  wallRun('x', -10, -13, 13, [], wallMat.out); wallRun('x', 10, -13, 13, [[0, 2.4]], wallMat.out); wallRun('z', -13, -10, 10, [], wallMat.out); wallRun('z', 13, -10, 10, [], wallMat.out);
  wallRun('x', -1, -13, 13, [[-8, 1.8], [0.5, 1.8], [12, 1.6]], wallMat.hall); wallRun('x', 3, -13, 13, [[-9, 1.8], [0, 6.4, true], [9, 1.8]], wallMat.hall);
  wallRun('z', -3, -10, -1); wallRun('z', 4, -10, -1); wallRun('z', -5, 3, 10); wallRun('z', 5, 3, 10);
  // ----- windows (sky + sun on the floor) -----
  const skyTex = canvasTex(128, 128, (g) => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#6fb6ec'); gr.addColorStop(0.75, '#cdeafc'); gr.addColorStop(1, '#a9d77c'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(255,255,255,0.9)'; [[30, 34, 16], [44, 30, 12], [92, 52, 14], [104, 48, 10]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); g.fillStyle = '#4f8a2a'; g.beginPath(); g.arc(20, 128, 26, 0, 7); g.arc(110, 132, 30, 0, 7); g.fill(); });
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex }), sunMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
  fx.sunPatches = [];
  function windowOn(axis, c, along, inward, w = 1.5, hh = 1.35, y = 1.85) {
    const wl = walls.find(q => !q.frame && !q.lockers && (axis === 'x' ? q.a[1] === c && q.b[1] === c && along > q.a[0] && along < q.b[0] : q.a[0] === c && q.b[0] === c && along > q.a[1] && along < q.b[1])); if (!wl) return;
    const g = wl.g, lp = along - (axis === 'x' ? g.position.x : g.position.z), d = inward * (T / 2 + 0.012), fm = wallMat.crown;
    const P = (x, z) => axis === 'x' ? [x, z] : [z, x];
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), skyMat); const [gx, gz] = P(lp, d); glass.position.set(gx, y, gz); glass.rotation.y = axis === 'x' ? (inward > 0 ? 0 : Math.PI) : (inward > 0 ? Math.PI / 2 : -Math.PI / 2); g.add(glass);
    const bar = (bw, bh, bxx, byy) => { const [x, z] = P(bxx, d + inward * 0.03); const geo = axis === 'x' ? new THREE.BoxGeometry(bw, bh, 0.07) : new THREE.BoxGeometry(0.07, bh, bw); M(geo, fm, x, byy, z, g, 0.008); };
    bar(w + 0.16, 0.08, lp, y + hh / 2); bar(w + 0.26, 0.1, lp, y - hh / 2 - 0.02); bar(0.08, hh, lp - w / 2, y); bar(0.08, hh, lp + w / 2, y); bar(0.05, hh, lp, y); bar(w, 0.05, lp, y + 0.12);
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.15, 1.9), sunMat); patch.rotation.x = -Math.PI / 2; const ia = axis === 'x' ? 0 : 1; if (axis === 'x') { patch.position.set(along + 0.5, 0.02, c + inward * 1.55); } else { patch.rotation.z = Math.PI / 2; patch.position.set(c + inward * 1.55, 0.02, along + 0.5); } root.add(patch); fx.sunPatches.push(patch); }
  windowOn('z', -13, -8.6, 1); windowOn('z', -13, -2.3, 1, 1.3); windowOn('z', 13, -7.4, -1, 1.6, 1.2, 2.15); windowOn('z', 13, -3.6, -1, 1.6, 1.2, 2.15);
  windowOn('x', 10, -3.2, -1, 1.4); windowOn('x', 10, 3.2, -1, 1.4); windowOn('z', -13, 5.4, 1, 1.3); windowOn('z', -13, 8.3, 1, 1.3); windowOn('x', 10, -9.0, -1, 1.4, 1.1, 2.15); windowOn('x', 10, 7.0, -1, 1.2, 1.1, 2.3);
  // paved border + flower beds outside
  { const pv = new THREE.Mesh(new THREE.PlaneGeometry(29, 23), toon('#c9c3b6')); pv.rotation.x = -Math.PI / 2; pv.position.set(0, -0.012, 0.5); root.add(pv);
    for (const x of [-9, -5.5, 4.5, 8.5]) for (let i = 0; i < 4; i++) { const b = M(new THREE.SphereGeometry(0.32, 10, 8), toon(i % 2 ? '#3f8a3a' : '#4f9a40'), x + i * 0.55, 0.24, 10.7, root, 0.015, 0.32); b.scale.y = 0.75; M(new THREE.SphereGeometry(0.07, 6, 5), toon(['#f472b6', '#ffd23a', '#f8fafc', '#c084fc'][i]), x + i * 0.55 + 0.1, 0.48, 10.55, root, 0); } }
  // front doors (glass, open) + welcome mat
  { const gl = new THREE.MeshToonMaterial({ color: '#bfe3f2', gradientMap: ctx.grad, transparent: true, opacity: 0.45 }); for (const s of [-1, 1]) { const d = box(1.1, 2.4, 0.06, gl, s * 1.75, 1.2, 10.35, root, 0.01); d.rotation.y = s * 0.9; }
    box(2.2, 0.02, 1.2, '#3a3836', 0, 0.01, 9.3, root, 0); }
  // ----- signs with print + braille (every door has one) -----
  function brailleDots(g, text, x, y, s, col = '#ffffff') { let cx = x; for (const ch of text.toLowerCase()) { if (ch === ' ') { cx += s * 3.4; continue; } const d = BRAILLE[ch]; if (d) d.forEach(n => { const c = n > 3 ? 1 : 0, r = (n - 1) % 3; g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(cx + c * s + 1.5, y + r * s + 2, s * 0.32, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(cx + c * s, y + r * s, s * 0.32, 0, 7); g.fill(); }); cx += s * 2.6; } return cx; }
  fx.brailleDots = brailleDots;
  function sign(text, x, y, z, ry = 0, w = 1.1, col = '#1d3b5c', sub = '') {
    const tex = canvasTex(512, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#ffd23a'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 246); g.fillStyle = '#fff'; g.font = '900 64px Archivo, "Arial Black", Arial'; g.textBaseline = 'middle'; let fs = 64; while (g.measureText(text).width > 460 && fs > 30) { fs -= 4; g.font = `900 ${fs}px Archivo, "Arial Black", Arial`; } g.fillText(text, 26, sub ? 76 : 90); if (sub) { g.font = '700 30px Archivo, Arial'; g.fillStyle = '#ffd23a'; g.fillText(sub, 28, 128); } brailleDots(g, text.slice(0, 14), 30, 178, 17); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); signs.push(m); return m; }
  sign('CLASSROOM', -9.35, 1.75, -0.86, 0, 1.1, '#1d3b5c', 'MR. ALDER · ROOM 1'); sign('ART ROOM', -0.85, 1.75, -0.86, 0); sign('GYM', 10.9, 1.75, -0.86, 0, 1.0, '#1d3b5c', 'GOALBALL COURT');
  sign('MUSIC', -10.4, 1.75, 2.86, Math.PI); sign('LIBRARY', 10.4, 1.75, 2.86, Math.PI); sign('LIBRARY', 7.6, 1.75, 3.14, 0, 1.0); sign('MUSIC', -7.6, 1.75, 3.14, 0, 1.0);
  { const big = canvasTex(1024, 256, (g) => { g.fillStyle = '#1d3b5c'; g.fillRect(0, 0, 1024, 256); g.strokeStyle = '#ffd23a'; g.lineWidth = 12; g.strokeRect(6, 6, 1012, 244); g.fillStyle = '#fff'; g.font = '900 70px Archivo, "Arial Black", Arial'; g.textBaseline = 'middle'; g.fillText('MERU SCHOOL FOR THE BLIND', 40, 86); brailleDots(g, 'meru school', 44, 170, 22, '#ffd23a'); g.fillStyle = '#ffd23a'; g.font = '800 34px Archivo, Arial'; g.fillText('WELCOME · EVERY FOX LEARNS', 520, 190); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: big })); m.position.set(0, 2.45, 3.14); root.add(m); }
  // ----- furniture helpers -----
  function desk(x, z, ry = 0, col = '#d8b07a') { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); blob(g, 1.6, 1.05, 0.32); box(1.25, 0.06, 0.72, col, 0, 0.84, 0, g); for (const sx of [-0.56, 0.56]) for (const sz of [-0.3, 0.3]) box(0.06, 0.82, 0.06, '#4a4642', sx, 0.41, sz, g, 0.008); box(1.15, 0.24, 0.04, '#b8915e', 0, 0.68, -0.33, g, 0.008); solidAt(x, z, 1.25, 0.72); return g; }
  function chair(x, z, ry = 0, col = '#c42d3c') { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(0.5, 0.06, 0.48, col, 0, 0.5, 0, g); box(0.5, 0.5, 0.06, col, 0, 0.78, 0.22, g); for (const sx of [-0.21, 0.21]) for (const sz of [-0.2, 0.2]) box(0.045, 0.5, 0.045, '#3a3836', sx, 0.25, sz, g, 0.006); return g; }
  function brailler(x, z, ry = 0, parent = root) { // a Perkins brailler: grey body, 6 keys + space, paper roll
    const g = new THREE.Group(); g.position.set(x, 0.87, z); g.rotation.y = ry; parent.add(g);
    const body = M(new THREE.BoxGeometry(0.5, 0.14, 0.3), toon('#8e9aa6'), 0, 0.07, 0, g, 0.012); body.rotation.x = -0.12;
    box(0.5, 0.05, 0.08, '#6b7784', 0, 0.165, -0.11, g, 0.008); cyl(0.03, 0.03, 0.56, '#3a3836', 0, 0.19, -0.11, g, 10, 0.006).rotation.z = Math.PI / 2;
    const paperTex = canvasTex(512, 256, (c) => { c.fillStyle = '#f7f3ea'; c.fillRect(0, 0, 512, 256); });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.22), new THREE.MeshToonMaterial({ map: paperTex, gradientMap: ctx.grad })); paper.position.set(0, 0.29, -0.15); paper.rotation.x = -0.35; g.add(paper);
    const keys = []; const KX = { 3: -0.2, 2: -0.14, 1: -0.08, 4: 0.08, 5: 0.14, 6: 0.2 };
    for (const n of [1, 2, 3, 4, 5, 6]) { const k = M(new THREE.BoxGeometry(0.05, 0.03, 0.07), toon('#2b2f36'), KX[n], 0.15, 0.1, g, 0.006); k.userData.y0 = 0.15; keys[n] = k; }
    M(new THREE.BoxGeometry(0.09, 0.03, 0.07), toon('#2b2f36'), 0, 0.14, 0.11, g, 0.006);
    return { g, keys, paper, paperTex }; }
  function shelf(x, z, ry, w = 2.4, rows = 4, books = true) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(w, 2.0, 0.4, '#7a5234', 0, 1.0, 0, g); for (let r = 0; r < rows; r++) { box(w - 0.1, 0.04, 0.36, '#5e3e26', 0, 0.12 + r * 0.48, 0.03, g, 0);
      if (books) { let bx = -w / 2 + 0.12; while (bx < w / 2 - 0.15) { const bw = RR(0.07, 0.14), bh = RR(0.28, 0.38), col = PICK(['#f7f3ea', '#f7f3ea', '#e9e1cf', '#c42d3c', '#2f6db0', '#22863a', '#e6b45a']); box(bw, bh, 0.28, col, bx + bw / 2, 0.14 + r * 0.48 + bh / 2, 0.06, g, 0.004); bx += bw + 0.01; } } }
    const c = Math.cos(ry), s = Math.sin(ry); solidAt(x, z, Math.abs(c) * w + Math.abs(s) * 0.4, Math.abs(s) * w + Math.abs(c) * 0.4); return g; }
  function lamp(x, z, y = H - 0.05) { const l = cyl(0.32, 0.38, 0.08, toon('#fff8e0', { emissive: new THREE.Color('#fff2c8'), emissiveIntensity: 0.9 }), x, y, z, root, 18, 0); lamps.push(l); return l; }

  // ===== CLASSROOM (front = north wall) =====
  { const board = canvasTex(1024, 384, (g) => { g.fillStyle = '#23352b'; g.fillRect(0, 0, 1024, 384); g.strokeStyle = '#8a5a32'; g.lineWidth = 22; g.strokeRect(0, 0, 1024, 384); g.fillStyle = '#f4f1e8'; g.font = '900 64px Archivo, "Arial Black", Arial'; g.fillText('SUB TODAY: MS. HOPE', 44, 96); g.font = '700 40px Archivo, Arial'; g.fillText('1 BRAILLE   2 TOUCH ART', 44, 176); g.fillText('3 CANE WALK   4 GOALBALL', 44, 236); g.fillStyle = '#ffd23a'; g.font = '700 34px Archivo, Arial'; g.fillText('Be kind. Be curious. Ask for help.', 44, 318); brailleDots(g, 'be kind', 690, 300, 18, '#f4f1e8'); });
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.72), new THREE.MeshBasicMaterial({ map: board })); bm.position.set(-8, 1.85, -9.86); root.add(bm); }
  { const tex = canvasTex(1024, 512, (g) => { g.fillStyle = '#fbf7ef'; g.fillRect(0, 0, 1024, 512); g.fillStyle = '#1d3b5c'; g.fillRect(0, 0, 1024, 92); g.fillStyle = '#ffd23a'; g.font = '900 52px Archivo, "Arial Black", Arial'; g.textBaseline = 'middle'; g.fillText('THE BRAILLE ALPHABET', 32, 48);
      'abcdefghijklmnopqrstuvwxyz'.split('').forEach((ch, i) => { const col = i % 9, row = Math.floor(i / 9), x = 40 + col * 108, y = 130 + row * 128; g.fillStyle = '#1d3b5c'; g.font = '900 40px Archivo, Arial'; g.fillText(ch.toUpperCase(), x, y + 8);
        for (let n = 1; n <= 6; n++) { const on = BRAILLE[ch].includes(n), cx = x + 46 + (n > 3 ? 20 : 0), cy = y - 18 + ((n - 1) % 3) * 20; g.beginPath(); g.arc(cx, cy, 7, 0, 7); if (on) { g.fillStyle = '#c42d3c'; g.fill(); } else { g.strokeStyle = '#c9c0b0'; g.lineWidth = 2; g.stroke(); } } }); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.4), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(-3.13, 1.75, -5.6); m.rotation.y = -Math.PI / 2; root.add(m); }
  { const tex = canvasTex(256, 256, (g) => { g.fillStyle = '#fbf7ef'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 14; g.strokeStyle = '#201e1d'; g.stroke(); g.fillStyle = '#201e1d'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.arc(128 + Math.sin(a) * 94, 128 - Math.cos(a) * 94, i % 3 ? 5 : 9, 0, 7); g.fill(); } g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 - 52, 128); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 40); g.stroke(); g.fillStyle = '#c42d3c'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill(); });
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(-4.4, 2.45, -9.86); root.add(m); }
  const tdesk = desk(-6.3, -8.7, 0, '#9a6a3c'); box(0.3, 0.22, 0.24, '#e6b45a', -6.0, 0.98, -8.7, root, 0.008); // teacher's desk + talking clock
  fx.globe = M(new THREE.SphereGeometry(0.2, 16, 12), toon('#2f6db0'), -6.7, 1.1, -8.7, root, 0.01, 0.2);
  const deskSpots = [SPOTS.benDesk, ...SPOTS.kidDesks], braillers = [];
  deskSpots.forEach(([x, z], i) => { desk(x, z - 0.05, 0); chair(x, z + 0.62, 0, ['#c42d3c', '#2f6db0', '#22863a', '#e6b45a', '#7c3aed', '#0e7fb8'][i]); braillers.push(brailler(x, z - 0.05, 0)); });
  fx.braillers = braillers; fx.benBrailler = braillers[0];
  shelf(-12.75, -5.5, Math.PI / 2, 3.2, 4); // braille books
  { // tactile globe stand + the reading corner rug
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.2, 24), toon('#e6b45a')); rug.rotation.x = -Math.PI / 2; rug.position.set(-11.6, 0.011, -1.9 - 0.2); root.add(rug); }
  // ===== ART ROOM =====
  desk(SPOTS.artTable[0], SPOTS.artTable[1], 0, '#e9e1cf'); fx.artSheet = (() => { const t = canvasTex(256, 256, (g) => { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 256, 256); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshToonMaterial({ map: t, gradientMap: ctx.grad })); m.rotation.x = -Math.PI / 2; m.position.set(SPOTS.artTable[0], 0.875, SPOTS.artTable[1] - 0.02); root.add(m); return { m, t }; })();
  { const banner = canvasTex(1024, 256, (g) => { g.fillStyle = '#111'; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#ffd23a'; g.font = '900 78px Archivo, "Arial Black", Arial'; g.textBaseline = 'middle'; g.fillText('BLIND CANVAS PROJECT', 40, 92); g.fillStyle = '#fff'; g.font = '700 38px Archivo, Arial'; g.fillText('Art you can touch · please touch the paintings', 42, 176); brailleDots(g, 'touch', 860, 160, 18, '#ffd23a'); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.4), new THREE.MeshBasicMaterial({ map: banner })); m.position.set(0.5, 2.3, -9.86); root.add(m); }
  // tactile paintings: raised blobs and ridges on canvases (easels)
  function tactilePainting(x, z, ry, cols) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    for (const s of [-1, 1]) { const l = box(0.05, 1.7, 0.05, '#7a5234', s * 0.4, 0.85, 0, g, 0.006); l.rotation.z = s * 0.08; } box(0.05, 1.6, 0.05, '#7a5234', 0, 0.8, -0.35, g, 0.006).rotation.x = -0.25;
    box(1.0, 0.8, 0.05, '#f4efe2', 0, 1.35, 0.04, g, 0.01); for (let i = 0; i < 9; i++) { const b = M(new THREE.SphereGeometry(RR(0.05, 0.11), 10, 8), toon(cols[i % cols.length]), RR(-0.4, 0.4), 1.35 + RR(-0.3, 0.3), 0.08, g, 0.008); b.scale.z = 0.45; }
    for (let i = 0; i < 3; i++) { const r = M(new THREE.TorusGeometry(RR(0.1, 0.22), 0.018, 6, 20), toon(cols[(i + 2) % cols.length]), RR(-0.25, 0.25), 1.35 + RR(-0.2, 0.2), 0.08, g, 0); }
    solidAt(x, z, 1.0, 0.7); return g; }
  tactilePainting(-2.0, -8.6, 0.3, ['#c42d3c', '#e6b45a', '#2f6db0', '#22863a']); tactilePainting(3.0, -8.6, -0.3, ['#7c3aed', '#f472b6', '#38bdf8', '#ffd23a']);
  { desk(2.7, -2.6, 0, '#b8a58a'); for (let i = 0; i < 4; i++) { const p = M(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 12), toon('#b5653a'), 2.3 + i * 0.27, 0.94, -2.6 + (i % 2) * 0.12, root, 0.006, 0.09); } // clay pots
    desk(-2.1, -2.6, 0, '#b8a58a'); box(0.6, 0.3, 0.45, '#d7dde3', -2.1, 1.02, -2.6, root, 0.01); box(0.5, 0.03, 0.3, '#ec3013', -2.1, 1.18, -2.6, root, 0); } // PIAF swell-paper heater
  // the gallery wall (art side of the classroom partition): Ben's revealed pictures hang here
  fx.gallery = []; for (let i = 0; i < 6; i++) { const z = -8.4 + i * 1.15, fr = box(0.05, 0.86, 0.86, '#2b2f36', -2.86, 1.7, z, root, 0.006); fr.userData.frameOf = true;
    const t = canvasTex(256, 256, (g) => { g.fillStyle = '#e9e4da'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#8a847e'; g.font = '800 26px Archivo, Arial'; g.textAlign = 'center'; g.fillText('?', 128, 140); });
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.74), new THREE.MeshBasicMaterial({ map: t })); pic.position.set(-2.83, 1.7, z); pic.rotation.y = Math.PI / 2; root.add(pic); fx.gallery.push({ pic, t, id: null }); }
  // ===== GYM: goalball court =====
  { const tape = toon('#ffffff'), Y = 0.013; const line = (x0, z0, x1, z1, w = 0.06) => { const L = Math.hypot(x1 - x0, z1 - z0), m = new THREE.Mesh(new THREE.PlaneGeometry(L, w), tape); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(z1 - z0, x1 - x0); m.position.set((x0 + x1) / 2, Y, (z0 + z1) / 2); root.add(m); };
    line(4.9, -9.5, 12.1, -9.5); line(4.9, -1.6, 12.1, -1.6); line(4.9, -9.5, 4.9, -1.6); line(12.1, -9.5, 12.1, -1.6); line(4.9, -5.55, 12.1, -5.55, 0.1);
    for (const z of [-3.2, -7.9]) line(4.9, z, 12.1, z); for (const x of [6.2, 8.2, 10.2]) { line(x - 0.25, -2.4, x + 0.25, -2.4); line(x - 0.25, -8.7, x + 0.25, -8.7); }
    for (const gz of [SPOTS.ourGoalZ, SPOTS.theirGoalZ]) { const s = gz > -5 ? 1 : -1; for (const x of [5.1, 11.3]) box(0.08, 1.3, 0.08, '#f4f1e8', x, 0.65, gz, root, 0.008); box(6.3, 0.08, 0.08, '#f4f1e8', 8.2, 1.3, gz, root, 0.008);
      const net = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.25, 12, 3), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.45 })); net.position.set(8.2, 0.65, gz + s * 0.35); root.add(net); }
    const banner = canvasTex(1024, 256, (g) => { g.fillStyle = '#0b2545'; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#ffd23a'; g.font = '900 84px Archivo, "Arial Black", Arial'; g.textBaseline = 'middle'; g.fillText('MERU GOALBALL', 40, 100); g.fillStyle = '#fff'; g.font = '700 38px Archivo, Arial'; g.fillText('QUIET PLEASE · PLAYERS ARE LISTENING', 42, 190); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: banner })); m.position.set(8.5, 2.4, -9.86); root.add(m);
    for (let i = 0; i < 3; i++) box(0.9 + i * 0, 0.36, 7.4, '#8a5a32', 12.55 - i * 0.0, 0.18 + i * 0.36, -5.5, root, 0.01).scale.set(1 - i * 0.22, 1, 1); solid(12.0, 13, -9.3, -1.8); // bleacher
    fx.ballRack = box(0.8, 0.6, 0.5, '#2b2f36', 4.7, 0.3, -1.6, root, 0.01); }
  // ===== HALL: lockers, fountain, notice board =====
  { const lk = new THREE.Group(); root.add(lk); for (let x = -12.4; x < 12.5; x += 0.62) { if (Math.abs(x + 8) < 1.3 || Math.abs(x - 0.5) < 1.3 || Math.abs(x - 12) < 1.1) continue; const col = (Math.round(x / 0.62) % 3 === 0) ? '#2f6db0' : '#3b7cc4'; box(0.58, 1.8, 0.4, col, x, 0.9, -0.66, lk, 0.008); box(0.04, 0.2, 0.02, '#d7dde3', x + 0.18, 1.0, -0.45, lk, 0); } walls.push({ g: lk, a: [-13, -0.5], b: [13, -0.5], h: 1.8, cur: 1, lockers: true }); }
  solid(-13, 13, -0.9, -0.44);
  box(0.5, 0.9, 0.35, '#d7dde3', 4.6, 0.45, 2.75, root, 0.01); solidAt(4.6, 2.75, 0.5, 0.4); // water fountain
  { const nb = canvasTex(512, 256, (g) => { g.fillStyle = '#b5824a'; g.fillRect(0, 0, 512, 256); const notes = [['#fff59d', 'GOALBALL vs OWLS · TODAY'], ['#bbf7d0', 'Swell paper is BACK'], ['#bfdbfe', 'Lost: one cane tip (red)'], ['#fbcfe8', 'Choir · Friday']]; notes.forEach(([c, t], i) => { const x = 20 + (i % 2) * 250, y = 20 + Math.floor(i / 2) * 118; g.fillStyle = c; g.fillRect(x, y, 230, 100); g.fillStyle = '#201e1d'; g.font = '800 22px Archivo, Arial'; g.fillText(t, x + 10, y + 40, 210); brailleDots(g, t.slice(0, 8), x + 12, y + 66, 9, '#8a847e'); }); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: nb })); m.position.set(-3.6, 1.6, 2.88); m.rotation.y = Math.PI; root.add(m); }
  // ===== LOBBY =====
  { const g = new THREE.Group(); g.position.set(-3.2, 0, 6.6); root.add(g); box(0.7, 1.05, 2.6, '#7a5234', 0, 0.52, 0, g); box(0.9, 0.06, 2.8, '#e6b45a', 0, 1.08, 0, g); solidAt(-3.2, 6.6, 0.8, 2.7);
    box(0.3, 0.25, 0.25, '#2b2f36', 0.1, 1.24, 0.6, g, 0.008); } // reception + bell
  { const g = new THREE.Group(); g.position.set(2.6, 0, 7.4); root.add(g); box(0.9, 0.95, 0.9, '#8a5a32', 0, 0.475, 0, g); const top = box(1.05, 0.08, 1.05, '#d8c9a8', 0, 0.99, 0, g, 0.01); top.rotation.x = -0.15;
    const map = canvasTex(256, 256, (c) => { c.fillStyle = '#d8c9a8'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#5e3e26'; c.lineWidth = 6; const sx = v => (v + 13) / 26 * 236 + 10, sz = v => (v + 10) / 20 * 236 + 10; Object.values(ROOMS).forEach(r => c.strokeRect(sx(r.b[0]), sz(r.b[2]), sx(r.b[1]) - sx(r.b[0]), sz(r.b[3]) - sz(r.b[2]))); c.fillStyle = '#c42d3c'; c.beginPath(); c.arc(sx(2.6), sz(7.4), 9, 0, 7); c.fill(); });
    const mm = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98), new THREE.MeshToonMaterial({ map: map, gradientMap: ctx.grad })); mm.rotation.x = -Math.PI / 2 - 0.15; mm.position.set(0, 1.04, 0); g.add(mm); solidAt(2.6, 7.4, 1.0, 1.0); fx.tactileMap = g; }
  { box(0.5, 1.9, 2.2, '#2b2f36', 4.62, 0.95, 5.0, root, 0.01); for (let i = 0; i < 3; i++) { const c = cyl(0.08, 0.12, 0.3, '#e6b45a', 4.5, 0.55 + i * 0.55, 4.3 + i * 0.6, root, 10, 0.006); M(new THREE.SphereGeometry(0.11, 12, 8), toon('#e6b45a'), 4.5, 0.82 + i * 0.55, 4.3 + i * 0.6, root, 0.006, 0.11); } solidAt(4.62, 5.0, 0.6, 2.3); } // trophy case
  { box(0.5, 0.45, 2.4, '#8a5a32', -4.55, 0.23, 8.2, root, 0.01); solidAt(-4.55, 8.2, 0.55, 2.4); const p = cyl(0.25, 0.2, 0.5, '#b5653a', 4.3, 0.25, 9.3); M(new THREE.SphereGeometry(0.42, 12, 10), toon('#3f8a3a'), 4.3, 0.85, 9.3, root, 0.012, 0.42); solidAt(4.3, 9.3, 0.6, 0.6); }
  // ===== MUSIC ROOM =====
  { const g = new THREE.Group(); g.position.set(-11.2, 0, 8.4); root.add(g); box(1.8, 1.0, 0.7, '#141414', 0, 0.75, 0, g); box(1.7, 0.06, 0.25, '#f4f1e8', 0, 0.98, 0.4, g, 0.006); for (let i = 0; i < 12; i++) if ([1, 2, 4, 5, 6].includes(i % 7)) box(0.05, 0.03, 0.14, '#111', -0.78 + i * 0.14, 1.02, 0.36, g, 0); box(1.8, 0.7, 0.06, '#141414', 0, 1.5, -0.33, g); for (const x of [-0.8, 0.8]) box(0.08, 0.4, 0.6, '#141414', x, 0.2, 0, g, 0.006); solidAt(-11.2, 8.4, 1.9, 1.0); fx.piano = g; }
  { const g = new THREE.Group(); g.position.set(-7.0, 0, 8.6); root.add(g); cyl(0.35, 0.35, 0.45, '#c42d3c', 0, 0.35, 0, g, 18); cyl(0.2, 0.2, 0.2, '#c42d3c', 0.45, 0.62, -0.2, g, 14); cyl(0.2, 0.2, 0.2, '#c42d3c', -0.45, 0.62, -0.2, g, 14); cyl(0.22, 0.22, 0.02, '#e6b45a', 0.55, 1.05, 0.25, g, 16); cyl(0.01, 0.01, 1.0, '#94a3b8', 0.55, 0.55, 0.25, g, 6, 0); solidAt(-7.0, 8.6, 1.3, 1.0); }
  { const g = new THREE.Group(); g.position.set(-9.2, 0, 5.4); root.add(g); for (const s of [-1, 1]) box(1.2, 0.08, 0.08, '#7a5234', 0, 0.75, s * 0.2, g, 0.006); for (let i = 0; i < 8; i++) box(0.11, 0.04, 0.32 - i * 0.02, ['#c42d3c', '#f59e0b', '#ffd23a', '#22c55e', '#38bdf8', '#2f6db0', '#7c3aed', '#f472b6'][i], -0.48 + i * 0.137, 0.81, 0, g, 0.004); for (const x of [-0.5, 0.5]) box(0.05, 0.75, 0.05, '#3a3836', x, 0.375, 0, g, 0.004); solidAt(-9.2, 5.4, 1.3, 0.6); fx.xylo = g; }
  // ===== LIBRARY =====
  shelf(12.75, 6.5, -Math.PI / 2, 5.6, 4); shelf(9.0, 9.75, Math.PI, 4.6, 4); { desk(8.4, 6.0, 0, '#9a6a3c'); chair(8.4, 6.7, 0, '#2f6db0'); chair(8.4, 5.3, Math.PI, '#2f6db0'); const arm = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(0.9, 0.45, 0.85, '#7c3aed', 0, 0.23, 0, g); box(0.9, 0.6, 0.2, '#7c3aed', 0, 0.75, 0.35, g); for (const s of [-1, 1]) box(0.16, 0.3, 0.85, '#6d28d9', s * 0.42, 0.55, 0, g, 0.006); solidAt(x, z, 0.95, 0.95); }; arm(6.2, 8.6, Math.PI * 0.85); arm(6.0, 4.4, 0.2); }
  // outdoor props seen through the doors
  for (const x of [-6, 6]) { cyl(0.18, 0.22, 2.2, '#7a5234', x, 1.1, 13); M(new THREE.SphereGeometry(1.2, 12, 10), toon('#4f8a2a'), x, 2.8, 13, root, 0.02, 1.2); }
  // wall-mounted pictures/signs hide with the wall piece they hang on (cut-away)
  const mounted = []; root.children.forEach(m => { if (!(m.isMesh && (m.geometry.type === 'PlaneGeometry' || m.geometry.type === 'CircleGeometry') && m.position.y > 1)) return; let best = null, bd = 0.45; for (const w of walls) { if (w.frame || w.lockers) continue; const [ax, az] = w.a, [bx, bz] = w.b, dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1e-9, t = clamp(((m.position.x - ax) * dx + (m.position.z - az) * dz) / l2, 0, 1), d = Math.hypot(m.position.x - ax - dx * t, m.position.z - az - dz * t); if (d < bd) { bd = d; best = w; } } if (best) mounted.push({ m, w: best }); });
  return { root, walls, boxes, signs, lamps, fx, H, brailleDots, ROOMS, SPOTS, mounted };
}

// ---------------- sound (indoors: no wind loop; everything panned so you can play by ear) ----------------
class SchoolSound {
  constructor() { this.ctx = null; this.muted = false; }
  init() { if (this.ctx) { if (this.ctx.state !== 'running') this.ctx.resume(); return; } const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC(); this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.7; const comp = c.createDynamicsCompressor(); this.master.connect(comp); comp.connect(c.destination);
    const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; this.noiseBuf = b; }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.7, this.ctx.currentTime, 0.05); }
  out(pan) { const c = this.ctx; if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan || 0, -1, 1); p.connect(this.master); return p; } return this.master; }
  tone(f, d, v = 0.1, type = 'sine', pan = 0, sweep = 0, delay = 0) { if (!this.ctx || this.muted) return; const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (sweep) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * sweep), t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(this.out(pan)); o.start(t); o.stop(t + d + 0.05); }
  noise(d, f, v = 0.1, pan = 0, type = 'lowpass', delay = 0, q = 0.8) { if (!this.ctx || this.muted) return; const c = this.ctx, t = c.currentTime + delay, s = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noiseBuf; b.type = type; b.frequency.value = f; b.Q.value = q;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(b); b.connect(g); g.connect(this.out(pan)); s.start(t, R() * 0.5); s.stop(t + d + 0.02); }
  // a held hum for the swell-paper line (level + pitch set every frame)
  hum(on, f = 220, v = 0.06, pan = 0) { if (!this.ctx) return; const c = this.ctx; if (!this.h) { const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null; o.type = 'triangle'; o2.type = 'sine'; g.gain.value = 0; o.connect(g); o2.connect(g); if (p) { g.connect(p); p.connect(this.master); } else g.connect(this.master); o.start(); o2.start(); this.h = { o, o2, g, p }; }
    const t = c.currentTime; this.h.g.gain.setTargetAtTime(on && !this.muted ? v : 0, t, on ? 0.015 : 0.05); this.h.o.frequency.setTargetAtTime(f, t, 0.03); this.h.o2.frequency.setTargetAtTime(f * 2.01, t, 0.03); if (this.h.p) this.h.p.pan.setTargetAtTime(clamp(pan, -1, 1), t, 0.03); }
  // effects
  key(pan = 0) { this.tone(1800, 0.03, 0.05, 'square', pan); this.noise(0.03, 3000, 0.05, pan, 'highpass'); }
  emboss(n, pan = 0) { this.noise(0.08, 900, 0.22, pan); this.tone(140, 0.09, 0.18, 'square', pan, 0.6); for (let i = 0; i < n; i++) this.tone(2400 + i * 140, 0.025, 0.04, 'square', pan, 0, 0.02 + i * 0.012); }
  ding(pan = 0) { this.tone(880, 0.25, 0.1, 'sine', pan); this.tone(1320, 0.35, 0.08, 'sine', pan, 0, 0.08); }
  buzz(pan = 0) { this.tone(130, 0.22, 0.12, 'sawtooth', pan, 0.8); }
  tock(kind = 'metal', pan = 0, v = 0.3) { const F = { metal: [1900, 'square', 0.12], plastic: [1100, 'square', 0.08], soft: [260, 'triangle', 0.1], wood: [700, 'triangle', 0.08], fox: [420, 'sine', 0.12], wall: [900, 'triangle', 0.05] }[kind] || [1000, 'square', 0.1];
    this.tone(F[0], F[2], v * 0.5, F[1], pan); this.noise(0.05, kind === 'soft' ? 600 : 3500, v * 0.6, pan, kind === 'soft' ? 'lowpass' : 'bandpass', 0, 1.2); if (kind === 'metal') this.tone(F[0] * 1.52, 0.4, v * 0.15, 'sine', pan, 0, 0.01); }
  tap(pan = 0, v = 0.08) { this.tone(2600, 0.02, v, 'square', pan); this.noise(0.02, 4000, v, pan, 'highpass'); }
  thud(pan = 0, v = 0.3) { this.tone(90, 0.25, v, 'sine', pan, 0.5); this.noise(0.12, 300, v * 0.7, pan); }
  jingle(pan = 0, v = 0.12) { for (let i = 0; i < 3; i++) this.tone(RR(3200, 4600), 0.07, v * RR(0.5, 1), 'triangle', pan, 0, i * 0.022); }
  step(pan = 0, v = 0.04) { this.noise(0.05, 500, v, pan); }
  bell() { for (let r = 0; r < 4; r++) { this.tone(660, 0.18, 0.12, 'square', 0, 0, r * 0.38); this.tone(990, 0.18, 0.09, 'square', 0, 0, r * 0.38 + 0.19); } }
  cheer(v = 0.15) { this.noise(1.1, 1800, v, 0, 'bandpass', 0, 0.5); for (let i = 0; i < 6; i++) this.tone(RR(500, 900), 0.12, 0.03, 'triangle', RR(-0.6, 0.6), 1.3, i * 0.08); }
  whistle() { this.tone(2800, 0.5, 0.1, 'sine', 0, 1.04); this.tone(2830, 0.5, 0.06, 'sine', 0, 1.04); }
  piano(n, pan = 0, v = 0.07) { const f = 261.63 * Math.pow(2, n / 12); this.tone(f, 1.2, v, 'triangle', pan); this.tone(f * 2, 0.6, v * 0.25, 'sine', pan); }
  ripple(pan = 0) { this.tone(520, 0.4, 0.06, 'sine', pan, 1.8); }
  // SCHOOL THEME: a gentle synth piece (piano arpeggios, bass, soft pad, brushed beat). level() fades it per scene.
  musicStart() { if (!this.ctx || this.mus) return; const c = this.ctx, out = c.createGain(); out.gain.value = 0; out.connect(this.master); const bus = c.createGain(); bus.gain.value = 1; bus.connect(out);
    const bpm = 84, beat = 60 / bpm, CH = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [261.63, 329.63, 392.0], [164.81, 196.0, 246.94], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66, 349.23]];
    const MEL = [[0, 659.26], [3, 783.99], [6, 659.26], [8, 587.33], [11, 523.25], [16, 523.25], [19, 659.26], [22, 587.33], [24, 523.25], [27, 440.0], [32, 440.0], [35, 523.25], [38, 587.33], [40, 659.26], [43, 587.33], [48, 659.26], [51, 783.99], [54, 880.0], [56, 783.99], [59, 698.46]];
    const note = (f, t, d, type, v, dest = bus) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05); };
    const brush = (t, v) => { const b = c.createBufferSource(); b.buffer = this.noiseBuf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 5000; f.Q.value = 0.6; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); b.connect(f); f.connect(g); g.connect(bus); b.start(t, R() * 0.5); b.stop(t + 0.14); };
    let step = 0; const nx = { t: c.currentTime + 0.1 };
    const iv = setInterval(() => { if (!this.ctx) return; while (nx.t < c.currentTime + 0.3) { const t = nx.t, s8 = step % 64, bar = Math.floor(step / 8) % 8, ch = CH[bar], b = step % 8;
        if (b === 0) { note(ch[0] / 2, t, beat * 3.6, 'triangle', 0.16); ch.forEach(f => note(f, t, beat * 3.8, 'sine', 0.025)); }
        if (b === 4) note(ch[0] / 2 * 1.5, t, beat * 1.8, 'triangle', 0.1);
        note(ch[[0, 1, 2, 1, 0, 2, 1, 2][b] % ch.length] * 2, t, beat * 0.9, 'triangle', 0.035);
        if (b % 2 === 0) brush(t, b === 2 || b === 6 ? 0.05 : 0.025);
        const mm = MEL.find(([k]) => k === s8); if (mm) { note(mm[1], t, beat * 1.4, 'sine', 0.06); note(mm[1] * 2, t, beat * 0.5, 'sine', 0.012); }
        nx.t += beat / 2; step++; } }, 70);
    this.mus = { out, iv }; }
  musicLevel(v) { if (!this.mus) return; this.mus.out.gain.setTargetAtTime(this.muted ? 0 : v, this.ctx.currentTime, 0.6); }
  musicStop() { if (!this.mus) return; clearInterval(this.mus.iv); try { this.mus.out.disconnect(); } catch (e) {} this.mus = null; }
}

// ---------------- the stand-alone game ----------------
export async function createBlindSchool({ container, onState = () => {}, onExit = null }) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || (container.parentElement && container.parentElement.clientWidth) || innerWidth || 1, CH = () => container.clientHeight || (container.parentElement && container.parentElement.clientHeight) || innerHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, preserveDrawingBuffer: true });   // keeps the last frame readable, so canvas previews/snapshots show the 3D view instead of black renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.6 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b1714'); const camera = new THREE.PerspectiveCamera(50, CW() / CH(), 0.05, 90);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const hemi = new THREE.HemisphereLight(0xfff6e8, 0x7a6a5a, 1.2); scene.add(hemi); const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(6, 14, 9); sun.castShadow = !touch; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14, far: 50 }); scene.add(sun); const fill = new THREE.DirectionalLight(0xcfe4ff, 0.45); fill.position.set(-10, 7, -4); scene.add(fill);
  const au = new SchoolSound(), K = buildSchool({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin: V3() }), FX = K.fx;
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  // ---------- local save (school progress) + the shared save (gold) ----------
  const SV = (() => { let d = { day: 1, best: {}, gallery: [], days: 0, voice: true, music: true, metHope: false }; try { d = { ...d, ...JSON.parse(localStorage.getItem(SCHOOL.key) || '{}') }; } catch (e) {} return d; })();
  const persist = () => { try { localStorage.setItem(SCHOOL.key, JSON.stringify(SV)); } catch (e) {} };
  const tier = () => Math.min(2, SV.day - 1);

  // ---------- voice: Hope's lines are read aloud (VOICE toggle), always captioned ----------
  const voice = { pick() { try { const vs = speechSynthesis.getVoices(); return vs.find(v => /en/i.test(v.lang) && /(samantha|zira|female|aria|jenny|libby|sonia|karen|moira|tessa|serena|google uk english female)/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null; } catch (e) { return null; } },
    speak(t) { if (!SV.voice || au.muted || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/Ms\./g, 'Miss')); const v = this.pick(); if (v) u.voice = v; u.rate = 1.03; u.pitch = 1.12; u.volume = 0.95; speechSynthesis.speak(u); } catch (e) {} },
    stop() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} } };

  // ---------- overlays the engine owns: fade + sleepshade vignette + the swell-paper canvas lives in the page host ----------
  const fadeEl = document.createElement('div'); fadeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;transition:opacity .32s;pointer-events:none;z-index:2'; container.appendChild(fadeEl);
  const vigEl = document.createElement('div'); vigEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0;background:radial-gradient(ellipse at 50% 58%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 22%, rgba(0,0,0,0.92) 58%, #000 80%)'; container.appendChild(vigEl);
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  let fading = false; function fade(fn, hold = 120) { if (fading) { fn(); return; } fading = true; fadeEl.style.opacity = '1'; setTimeout(() => { try { fn(); } catch (e) { console.warn(e); } setTimeout(() => { fadeEl.style.opacity = '0'; fading = false; }, hold); }, 340); }

  // ---------- cast ----------
  const rigs = await loadCastRigs().catch(() => ({})), CK = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs), CaneK = caneKit({ THREE, M, toon });
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const ben = hideGear(kit.makeFox({ ...CAST.player, mood: 'happy' })); ben.userData.name = 'BEN';
  const benCane = hideGear(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'determined' })); benCane.userData.rig = CaneK.attach(benCane, { ...CANE_DEFAULTS, length: 128 }); benCane.visible = false;
  const hope = CK.make('hope', { mood: 'happy' }); hope.userData.name = 'HOPE'; hideGear(hope);
  // sleepshades (black band over the eyes) for Ben's cane walk + goalball
  function shades(f, col = '#0b0b0d') { const P = f.userData.P, g = new THREE.Group(); P.head.add(g); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.16, 26, 1, true, -1.25, 2.5), new THREE.MeshToonMaterial({ color: col, gradientMap: grad, side: THREE.DoubleSide })); band.position.set(0, 0.07, 0.02); band.scale.set(1.04, 1, 1.12); g.add(band); const strap = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 24), toon('#1f2937')); strap.rotation.x = Math.PI / 2; strap.position.y = 0.07; strap.scale.set(1.04, 1.12, 1); g.add(strap); g.visible = false; return g; }
  const benShades = shades(ben), caneShades = shades(benCane); caneShades.visible = true;
  const kids = KIDS.map((k, i) => { const f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: k.fur }, torso: k.torso, outfit: 'tee', crest: '', gear: 'none', glasses: k.sun ? 'sun' : undefined, mood: 'happy', eyes: [['#38bdf8', '#38bdf8'], ['#22c55e', '#22c55e'], ['#a16207', '#a16207'], ['#7c3aed', '#7c3aed'], ['#0e7fb8', '#0e7fb8']][i] }));
    f.scale.multiplyScalar(0.74); f.userData.kid = k; f.userData.name = k.name; if (k.cane) f.userData.rig = CaneK.attach(f, { ...CANE_DEFAULTS, length: 112 }); return f; });
  const KID = Object.fromEntries(KIDS.map((k, i) => [k.id, kids[i]]));
  const owls = OWLS.map((o, i) => { const f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: ['#c9672a', '#b8612a', '#d27a3a'][i] }, torso: ['#1e3a8a', '#fbbf24', '#0b1d4d'], outfit: 'tee', crest: '', gear: 'none', mood: 'determined' })); f.scale.multiplyScalar(0.8); f.userData.name = o.name; f.userData.shades = shades(f, '#111827'); f.userData.shades.visible = true; return f; });
  const fern = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#c2703a', fluff: '#f4f4f6' }, torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); fern.userData.name = 'MS. FERN';
  fern.position.set(-3.95, 0, 6.6); fern.rotation.y = Math.PI / 2;
  // uniform-ish print on the kids' tees: the school crest (a braille cell)
  const crestPrint = canvasTex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.fillStyle = '#fbfbf7'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.fill(); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#201e1d'; [[46, 38], [46, 64], [82, 38], [82, 90]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }); });
  kids.forEach(f => { const pr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshToonMaterial({ map: crestPrint, transparent: true, gradientMap: grad, depthTest: false })); pr.renderOrder = 20; pr.position.set(0, 1.07, 0.34); pr.rotation.x = -0.1; f.userData.P.body.add(pr); });
  const ALL = [ben, benCane, hope, fern, ...kids, ...owls];
  // soft contact shadows under every fox (phones have no shadow maps)
  const foxBlobs = ALL.map(f => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshBasicMaterial({ map: FX.blobTex, transparent: true, depthWrite: false, opacity: 0.42 })); m.rotation.x = -Math.PI / 2; m.renderOrder = 2; scene.add(m); return { f, m }; });
  // yellow marker over Hope while you look for her
  const marker = new THREE.Group(); { const mm = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: 0xffd23a })); mm.scale.y = 1.5; const mo = new THREE.Mesh(mm.geometry, new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.BackSide })); mo.scale.setScalar(1.18); mm.add(mo); marker.add(mm); marker.visible = false; scene.add(marker); }
  // dust drifting through the sunbeams
  const dust = []; for (let i = 0; i < (touch ? 26 : 50); i++) { const p = FX.sunPatches[i % FX.sunPatches.length]; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff2c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(0.06 + R() * 0.05); scene.add(sp); dust.push({ sp, p, u: R(), v: R(), h: 0.4 + R() * 1.8, ph: R() * 6 }); }

  // seated pose: legs forward over the chair (after animFox each frame)
  const sitFix = f => { const P = f.userData.P; P.legs[0].rotation.x = P.legs[1].rotation.x = -1.42; };

  // ---------- state ----------
  const St = { mode: 'intro', t: 0, paused: false, hudPad: false, yaw: 0.0, pitch: 0.62, dist: touch ? 8.2 : 7.2, eye0: null, dragT: 0, pov: false, jx: 0, jy: 0, keys: new Set(),
    toast: null, dialog: null, prompt: null, near: null, place: 'Lobby', listen: 0, lesson: null, run: null, result: null, report: null, help: false, say: null, demo: null, flash: null, cam: { pos: V3(0, 6, 16), look: V3(0, 1, 6), shot: null } };
  const P = { x: SPOTS.entrance[0], z: SPOTS.entrance[1] - 0.6, y: 0, vy: 0, face: Math.PI, speed: 0 };
  const SAFE = { top: 0, bottom: 0, left: 0 };
  // ---------- free-roam placement of everyone ----------
  const NPCS = [];   // { f, home:[x,z], face, route?:[[x,z]...], ri, wait, sit }
  function placeFree() {
    ALL.forEach(f => { f.visible = true; f.rotation.set(0, 0, 0); f.position.y = 0; f.userData.lookAt = null; }); benCane.visible = false; benShades.visible = false; ben.scale.setScalar(1); clearObs(); ball.visible = false;
    kids.forEach(k => { if (k.userData.shades) k.userData.shades.visible = false; }); owls.forEach(o => { o.userData.tx = null; o.rotation.z = 0; });
    NPCS.length = 0;
    const put = (f, x, z, face, extra = {}) => { f.position.set(x, 0, z); f.rotation.y = face; NPCS.push({ f, home: [x, z], face, ri: 0, wait: RR(0.5, 3), ...extra }); };
    put(hope, -9.5, -8.3, 0, { route: [[-10.6, -8.2], [-5.6, -8.2], [-7.8, -7.2]], spd: 0.55 });
    put(KID.mae, -11.2, 9.05, Math.PI, { sit: true }); put(KID.pip, -5, -5.9 + 0.62, Math.PI, { sit: true });
    put(KID.rio, 2.7, -1.95, Math.PI); put(KID.juno, -6, 1.6, Math.PI / 2, { route: [[-11.5, 1.8], [-1, 1.8], [7, 2.0], [-1, 1.8]], spd: 0.7 });
    put(KID.tobi, 7.2, -2.3, Math.PI); owls.forEach((o, i) => put(o, SPOTS.lanesX[i], SPOTS.owlsZ, 0, { bounce: true }));
    put(fern, -3.95, 6.6, Math.PI / 2);
    ben.position.set(P.x, P.y, P.z); ben.rotation.y = P.face;
  }

  // ---------- collision ----------
  function collide(x, z, r = 0.32) { for (let it = 0; it < 2; it++) for (const b of K.boxes) { const nx = clamp(x, b.x0, b.x1), nz = clamp(z, b.z0, b.z1), dx = x - nx, dz = z - nz, d2 = dx * dx + dz * dz; if (d2 < r * r) { if (d2 < 1e-6) { const l = x - b.x0, rr2 = b.x1 - x, t = z - b.z0, bt = b.z1 - z, m = Math.min(l, rr2, t, bt); if (m === l) x = b.x0 - r; else if (m === rr2) x = b.x1 + r; else if (m === t) z = b.z0 - r; else z = b.z1 + r; } else { const d = Math.sqrt(d2); x = nx + dx / d * r; z = nz + dz / d * r; } } }
    for (const n of NPCS) { if (!n.f.visible) continue; const dx = x - n.f.position.x, dz = z - n.f.position.z, d = Math.hypot(dx, dz), rr2 = r + 0.32 * (n.f.scale.x / 1); if (d < rr2 && d > 1e-4) { x = n.f.position.x + dx / d * rr2; z = n.f.position.z + dz / d * rr2; } }
    return [clamp(x, -12.6, 12.6), clamp(z, -9.6, 12)]; }
  const roomAt = (x, z) => { for (const [k, r] of Object.entries(ROOMS)) if (k !== 'hall' && x >= r.b[0] && x <= r.b[1] && z >= r.b[2] && z <= r.b[3]) return k; if (z > -1 && z < 3) return 'hall'; return z > 10 ? 'out' : 'lobby'; };

  // ---------- interactions (E / TALK) ----------
  const INTER = [
    { id: 'hope', label: 'Talk to HOPE', who: () => hope, r: 2.2, act: () => talkHope() },
    ...KIDS.map(k => ({ id: k.id, label: 'Talk to ' + k.name, who: () => KID[k.id], r: 1.9, act: () => talkKid(k) })),
    { id: 'fern', label: 'Talk to MS. FERN', who: () => fern, r: 2.4, act: () => openDialog('MS. FERN', 'Front desk', ["Welcome to the Meru School for the Blind! Sign in? No? Fine, you're with Hope.", "Hope is subbing for Mr. Alder today. The classroom is across the hall and to the left, the first door on the north side.", "Follow the yellow bumpy strip on the floor. Your feet can feel it, and so can a cane."]) },
    { id: 'map', label: 'Feel the TACTILE MAP', at: [2.6, 7.4], r: 1.6, act: () => openDialog('TACTILE MAP', 'Raised floor plan', ["You run your fingers over the raised lines. The lobby is in the middle, and a little bump marks YOU ARE HERE.", "North across the hall: the CLASSROOM on the left, the ART ROOM in the middle, the GYM on the right.", "South side: the MUSIC ROOM west of the lobby, the LIBRARY east."]) },
    { id: 'brailler', label: 'Practise BRAILLE', at: SPOTS.benDesk, r: 1.15, act: () => practice('braille') },
    { id: 'art', label: 'Practise TOUCH ART', at: SPOTS.artTable, r: 1.5, act: () => practice('art') },
    { id: 'cane', label: 'Practise the CANE WALK', at: SPOTS.caneStart, r: 1.4, act: () => practice('cane') },
    { id: 'gym', label: 'Practise GOALBALL', at: SPOTS.gymBen, r: 1.6, act: () => practice('goal') },
    { id: 'piano', label: 'Play the PIANO', at: [-11.2, 7.6], r: 1.4, act: () => { [0, 4, 7, 12, 7, 4, 0].forEach((n, i) => setTimeout(() => au.piano(n, -0.2, 0.08), i * 180)); toast('PIANO · Mae: "Not bad! Now try it with your eyes shut."'); } },
    { id: 'xylo', label: 'Play the XYLOPHONE', at: [-9.2, 4.7], r: 1.2, act: () => { [12, 14, 16, 19, 21, 24].forEach((n, i) => setTimeout(() => au.tone(523 * Math.pow(2, (n - 12) / 12), 0.5, 0.08, 'sine'), i * 120)); } },
    { id: 'books', label: 'Read a BRAILLE BOOK', at: [11.8, 6.5], r: 1.4, act: () => openDialog('BRAILLE BOOK', 'Library', ["A braille book is HUGE. One storybook can fill four of these thick white volumes.", "This one is the Meru tide tables. Page one: 'High tide at the lake: noon.' Gripping stuff."]) },
    { id: 'paint', label: 'Touch the PAINTING', at: [-2.0, -7.8], r: 1.3, act: () => openDialog('BLIND CANVAS PROJECT', 'Tactile painting', ["Bumps, ridges and rings of thick paint. You can feel where the colours change: each colour has its own texture.", "The card says: 'Please touch. Art is for everybody.'"]) },
    { id: 'exit', label: 'Leave to MERU', at: [0, 10.2], r: 1.4, act: () => { if (onExit) onExit(); else toast('The front door. This school will open onto the MERU map soon.'); } },
  ];
  function nearest() { let best = null, bd = 9; for (const it of INTER) { const p = it.who ? it.who().position : { x: it.at[0], z: it.at[1] }; if (it.who && !it.who().visible) continue; const d = Math.hypot(P.x - p.x, P.z - p.z); if (d < it.r && d < bd) { bd = d; best = it; } } return best; }
  function toast(t, sec = 3.2) { St.toast = { text: t, t: sec }; emit(); }
  function openDialog(name, role, lines, then) { St.dialog = { name, role, lines, i: 0, then }; emit(); }
  function closeDialog() { const d = St.dialog; St.dialog = null; voice.stop(); d && d.then && d.then(); emit(); }
  function talkKid(k) { const f = KID[k.id]; f.userData.lookAt = ben.position.clone().setY(1.6); openDialog(k.name, k.role, k.talk, () => { f.userData.lookAt = null; }); }
  function talkHope() { hope.userData.lookAt = ben.position.clone().setY(1.6); say(SV.metHope ? "Back for more, Ben? Pick a lesson, or start the whole school day." : HOPE.hi); SV.metHope = true; persist(); St.mode = 'intro'; St.introFrom = 'hope'; emit(); }

  // ---------- Hope / speakers: caption + mouth + voice ----------
  function say(text, who = hope, name = 'HOPE', role = 'Substitute teacher', speak = true) { St.say = { name, role, text, t: Math.max(3.5, text.length / 13 + 1.5) }; if (who) { who.userData.say = { text, t: 0 }; who.userData.talkStyle = { rate: 1, amp: 1, base: 0.25, gest: 1.1 }; } if (speak && name === 'HOPE') voice.speak(text); emit(); }
  function kidSay(id, text) { const f = KID[id]; if (f) { f.userData.say = { text, t: 0 }; f.userData.talkStyle = { rate: 1.15, amp: 0.9, base: 0.2, gest: 1 }; } St.kidLine = { name: KIDS.find(k => k.id === id).name, text, t: 2.6 }; }

  // ---------- LISTEN (button 1 in the halls): what you can hear, and where ----------
  const labelSprite = (txt) => { const tex = canvasTex(512, 96, (g) => { g.font = '900 40px Archivo, "Arial Black", Arial'; const w = Math.min(500, g.measureText(txt).width + 44); g.fillStyle = '#000'; g.fillRect(0, 0, w, 96); g.strokeStyle = '#ffd23a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, 90); g.fillStyle = '#ffd23a'; g.textBaseline = 'middle'; g.fillText(txt, 22, 50); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); s.scale.set(2.4, 0.45, 1); s.center.set(0, 0.5); s.renderOrder = 40; s.visible = false; scene.add(s); return s; };
  const SOUNDS = [
    { txt: 'TAP TAP · HOPE\'S CANE', pos: () => hope.position, play: p => { au.tap(p, 0.1); au.tap(p, 0.08); } },
    { txt: '♪ PIANO · MUSIC ROOM', pos: () => V3(-11.2, 1.4, 8.4), play: p => [0, 3, 7].forEach((n, i) => setTimeout(() => au.piano(n, p, 0.05), i * 150)) },
    { txt: 'JINGLE · GOALBALL', pos: () => V3(8.2, 0.4, -5.5), play: p => au.jingle(p, 0.08) },
    { txt: 'CLACK · BRAILLERS', pos: () => V3(-8, 1.2, -4.7), play: p => { au.key(p); setTimeout(() => au.emboss(3, p), 90); } },
    { txt: 'TICK · TALKING CLOCK', pos: () => V3(-6.0, 1.2, -8.7), play: p => au.tap(p, 0.05) },
    { txt: 'PAGES · LIBRARY', pos: () => V3(9.5, 1.2, 7), play: p => au.noise(0.25, 2500, 0.05, p, 'highpass') },
    { txt: 'HELLO! · MS. FERN', pos: () => fern.position, play: p => au.tone(700, 0.1, 0.05, 'triangle', p) }];
  SOUNDS.forEach(s => s.spr = labelSprite(s.txt));
  const panOf = (pos) => { const v = pos.clone().project(camera); return clamp(v.x, -1, 1) * (v.z > 1 ? -1 : 1); };
  function listen() { if (St.listen > 0.5) return; St.listen = 4.5; ripple(P.x, P.z, 0x38bdf8, 3.2); SOUNDS.forEach((s, i) => { const p = s.pos(), d = Math.hypot(p.x - P.x, p.z - P.z); setTimeout(() => s.play(panOf(p) * 0.9), 120 + Math.min(1500, d * 70)); }); }
  function hello() { let best = null, bd = 5.5; for (const n of NPCS) { if (n.f === ben || !n.f.visible) continue; const d = Math.hypot(n.f.position.x - P.x, n.f.position.z - P.z); if (d < bd) { bd = d; best = n; } } au.tone(620, 0.08, 0.06, 'triangle'); au.tone(820, 0.1, 0.05, 'triangle', 0, 0, 0.08);
    ben.userData.wave = 1.2; if (!best) { toast('BEN · "Hello?" · Nobody close enough to hear you.', 2); return; } const f = best.f; f.userData.wave = 1.4; f.userData.lookAt = ben.position.clone().setY(1.6); setTimeout(() => { f.userData.lookAt = null; }, 2500);
    const k = f.userData.kid, line = f === hope ? "Hi Ben! I heard you coming." : f === fern ? 'Hello, dear!' : k ? PICK(k.hello) : 'Shh, we are listening for the ball!'; f.userData.say = { text: line, t: 0 }; toast(f.userData.name + ' · "' + line + '"', 2.4); }

  // ---------- sound ripples (rings on the floor) — sound made visible for the ear games ----------
  const ripG = new THREE.RingGeometry(0.82, 1, 40).rotateX(-Math.PI / 2), rips = [];
  for (let i = 0; i < 28; i++) { const m = new THREE.Mesh(ripG, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false })); m.renderOrder = 35; m.visible = false; scene.add(m); rips.push({ m, t: 1, max: 1 }); } let ripI = 0;
  function ripple(x, z, col = 0xffd23a, max = 1.2, y = 0.03, life = 0.9) { const r = rips[ripI = (ripI + 1) % rips.length]; r.m.position.set(x, y, z); r.m.material.color.setHex(col); r.t = 0; r.max = max; r.life = life; r.m.visible = true; }

  // ---------- camera ----------
  const fitCam = new THREE.PerspectiveCamera(50, 1, 0.05, 90), _p = V3();
  function fitShot(pts, el, yaw = 0, margin = 0.06) { const W = CW(), Hh = CH(); fitCam.aspect = W / Hh; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * SAFE.top / Hh - margin * 1.2, yB = -1 + 2 * SAFE.bottom / Hh + margin * 1.2, xR = 1 - margin, xL = -1 + 2 * SAFE.left / W + margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), c = V3(); pts.forEach(p => c.add(p)); c.multiplyScalar(1 / pts.length); const tgt = c.clone();
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.4, hi = 30; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  const shotCache = new Map(); function shotFor(key, ptsFn, el, yaw, margin) { const ck = key + '|' + CW() + 'x' + CH() + '|' + SAFE.top + '|' + SAFE.bottom + '|' + SAFE.left; if (!shotCache.has(ck)) { if (shotCache.size > 80) shotCache.clear(); shotCache.set(ck, fitShot(ptsFn(), el, yaw, margin)); } return shotCache.get(ck); }
  const camLook = V3(), camGoal = V3(), lookGoal = V3();
  function freeCam(dt, snap) { const tg = V3(P.x, P.y + 1.15, P.z); if (St.pov) { camGoal.set(P.x + Math.sin(P.face) * 0.1, P.y + 1.7, P.z + Math.cos(P.face) * 0.1); lookGoal.set(P.x + Math.sin(P.face) * 3, P.y + 1.4, P.z + Math.cos(P.face) * 3); }
    else { const cp = Math.cos(St.pitch); camGoal.set(tg.x + Math.sin(St.yaw) * cp * St.dist, tg.y + Math.sin(St.pitch) * St.dist, tg.z + Math.cos(St.yaw) * cp * St.dist); lookGoal.copy(tg); }
    const k = snap ? 1 : 1 - Math.exp(-6 * dt); St.cam.pos.lerp(camGoal, k); camLook.lerp(lookGoal, k); }
  function shotCam(dt, s, snap, rate = 3.2) { const k = snap ? 1 : 1 - Math.exp(-rate * dt); St.cam.pos.lerp(s.pos, k); camLook.lerp(s.look, k); }
  // cut-away: any wall piece between the camera and what it looks at drops to a low kerb
  const seg = (a, b, c, d) => { const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]); if (Math.abs(den) < 1e-9) return false; const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den, u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den; return t > 0 && t < 1 && u > -0.02 && u < 1.02; };
  function cutaway(dt, focus) { const c = [camera.position.x, camera.position.z], f = [focus.x, focus.z], vx = f[0] - c[0], vz = f[1] - c[1], vl = Math.hypot(vx, vz) || 1, lx = -vz / vl * 2.6, lz = vx / vl * 2.6, fL = [f[0] + lx, f[1] + lz], fR = [f[0] - lx, f[1] - lz], fN = [f[0] + vx / vl * 1.5, f[1] + vz / vl * 1.5];
    for (const w of K.walls) { let hide = seg(c, f, w.a, w.b) || seg(c, fL, w.a, w.b) || seg(c, fR, w.a, w.b) || seg(fL, fR, w.a, w.b) && seg(c, fN, w.a, w.b); if (!hide) { const mx = (w.a[0] + w.b[0]) / 2, mz = (w.a[1] + w.b[1]) / 2, L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); const dx = c[0] - mx, dz = c[1] - mz; const along = w.a[0] === w.b[0] ? Math.abs(dz) - L / 2 : Math.abs(dx) - L / 2, perp = w.a[0] === w.b[0] ? Math.abs(dx) : Math.abs(dz); hide = along < 0.6 && perp < 1.3; }
      const tgt = hide ? (w.frame ? 0.02 : 0.12) : 1; w.cur = damp(w.cur, tgt, 9, dt); w.g.scale.y = Math.max(0.02, w.cur); w.g.visible = !(w.frame && w.cur < 0.2); }
    for (const mt of K.mounted) mt.m.visible = mt.w.cur > 0.6; }

  // ---------- emit (HUD) ----------
  let hudT = 0;
  function emit() { onState(hud()); }

  // =====================================================================================
  //  LESSONS
  // =====================================================================================
  const timers = []; function later(sec, fn, L = St.lesson) { timers.push({ t: sec, fn, L }); }
  const LANE_Z = [0.3, 1.2, 2.1];
  const PRAISE = ['Lovely.', 'Perfect.', 'Beautiful dots.', 'I can hear that was right.', 'Nice and crisp.', 'That one will last forever.'];
  function hideAllNpcs() { NPCS.length = 0; [hope, fern, ...kids, ...owls].forEach(f => { f.visible = false; f.userData.lookAt = null; }); }
  function stand(f, x, z, face, sit = false) { f.visible = true; f.position.set(x, 0, z); f.rotation.set(0, face, 0); NPCS.push({ f, home: [x, z], face, sit, fixed: true, wait: 99 }); }

  function startLesson(id, opt = {}) {
    St.mode = 'lesson'; St.dialog = null; St.toast = null; St.prompt = null; St.say = null; St.kidLine = null; St.result = null; St.between = null; timers.length = 0; voice.stop(); au.hum(false);
    const L = St.lesson = { id, t: 0, demo: !!opt.demo, practice: !!opt.practice, stars: 0, over: false };
    hideAllNpcs(); clearObs(); ball.visible = false; ben.scale.setScalar(1); owls.forEach(o => { o.userData.tx = null; o.rotation.z = 0; }); ben.visible = true; benCane.visible = false; benShades.visible = false; ben.rotation.set(0, 0, 0); ben.position.y = 0; St.dim = 0; FX.artSheet.m.visible = true;
    kids.forEach(k => { if (k.userData.shades) k.userData.shades.visible = false; });
    ({ braille: brStart, art: artStart, cane: caneStart, goal: goalStart })[id](L);
    St.cam.snap = true; emit();
  }
  function lessonDone(stars, lines = []) { const L = St.lesson; if (!L || L.over) return; L.over = true; L.stars = stars; au.hum(false);
    if (L.demo) { emit(); return; }
    SV.best[L.id] = Math.max(SV.best[L.id] || 0, stars); persist();
    if (St.run) { St.run.stars.push(stars); const i = St.run.i; later(2.4, () => nextPeriod(), L); St.between = { id: L.id, name: NAMES[L.id], stars, next: St.run.order[i + 1] ? NAMES[St.run.order[i + 1]] : null, n: i + 1 }; au.bell(); }
    else { later(1.6, () => { St.result = { id: L.id, name: NAMES[L.id], stars, lines, best: SV.best[L.id] }; emit(); }, L); }
    emit(); }
  const NAMES = { braille: 'Braille', art: 'Touch art', cane: 'Cane walk', goal: 'Goalball' };
  function practice(id) { St.run = null; fade(() => startLesson(id, { practice: true })); }
  function startDay() { St.run = { i: 0, order: ['braille', 'art', 'cane', 'goal'], stars: [] }; au.init(); au.bell(); fade(() => { startLesson('braille'); St.lesson.dayStart = true; }); }
  function nextPeriod() { const r = St.run; if (!r) return; r.i++; St.between = null; if (r.i >= r.order.length) return endDay(); fade(() => startLesson(r.order[r.i])); }
  function endDay() { const r = St.run, total = r.stars.reduce((a, b) => a + b, 0), avg = total / r.stars.length, gold = 10 + total * 2, up = avg >= 2;
    save.addGold(gold); SV.days++; const dayWas = SV.day; if (up) SV.day = Math.min(9, SV.day + 1); persist();
    const unlock = up && dayWas < 3 ? (dayWas === 1 ? ['Braille letters K to T (dot 3)', 'New pictures: moon, cup, tree, heart', 'A classmate walks the hall during the cane walk'] : ['Braille letters U to Z (dot 6)', 'New pictures: sailboat, key, fox, apple', 'Faster Owls in goalball']) : [];
    St.report = { day: dayWas, rows: r.order.map((id, i) => ({ k: NAMES[id], stars: r.stars[i] })), total, of: r.order.length * 3, gold, up, unlock, line: avg >= 2.75 ? 'Outstanding. Mr. Alder is going to be jealous he missed this.' : avg >= 2 ? 'A really good day. You listened, and that is most of it.' : 'Good effort! Every one of these gets easier with practice.' };
    St.run = null; fade(() => { St.lesson = null; placeFree(); P.x = -8; P.z = -2.3; P.face = Math.PI; St.mode = 'report'; say(HOPE.report); hope.position.set(-8, 0, -4.4); hope.rotation.y = 0; }); }
  function leaveLesson() { timers.length = 0; voice.stop(); au.hum(false); St.run = null; St.between = null; St.result = null; toFree(); }
  function toFree(spot) { fade(() => { const L = St.lesson; St.lesson = null; St.dim = 0; placeFree(); if (L && !spot) { const at = { braille: [-8, -4.6], art: [0.5, -4.3], cane: [-11, 1.2], goal: [8.2, -2.0] }[L.id]; if (at) { P.x = at[0]; P.z = at[1]; } } ben.position.set(P.x, 0, P.z); St.mode = 'free'; St.result = null; St.report = null; St.say = null; St.cam.snap = true; emit(); }); }

  // ---------------- 1 · BRAILLE ----------------
  function seatClass(withBen = true) {
    stand(hope, SPOTS.hopeFront[0], SPOTS.hopeFront[1], 0); [0, 2, 3, 4].forEach((d, i) => { const [x, z] = SPOTS.kidDesks[d]; stand(kids[i], x, z + 0.62, Math.PI, true); }); stand(kids[4], -12.1, -4.2, -Math.PI / 2);
    if (withBen) { ben.position.set(SPOTS.benDesk[0], 0, SPOTS.benDesk[1] + 0.62); ben.rotation.y = Math.PI; } }
  function wordPool() { const t = tier(); const pool = t === 0 ? SHUF(WORDS[0]).slice(0, 4) : t === 1 ? [...SHUF(WORDS[1]).slice(0, 3), ...SHUF(WORDS[0]).slice(0, 1)] : [...SHUF(WORDS[2]).slice(0, 2), ...SHUF(WORDS[1]).slice(0, 1), ...SHUF(WORDS[0]).slice(0, 1)]; return SHUF(pool); }
  function brStart(L) { seatClass(true);
    Object.assign(L, { words: L.demo ? ['bad'] : wordPool(), wi: 0, li: 0, held: new Set(), chord: new Set(), latched: new Set(), mistakes: 0, hints: 0, hintOn: SV.day === 1 && !SV.best.braille, miss: 0, done: [], bad: null, sit: true });
    brPaper(); const first = L.dayStart || (St.run && St.run.i === 0);
    later(0.5, () => say(St.run ? HOPE.dayStart : HOPE.brIntro2), L);
    later(St.run ? 6.2 : 4.2, () => { if (St.run) say(HOPE.brIntro); later(St.run ? 8 : 0.01, () => brAsk(), L); }, L); }
  function brWord() { const L = St.lesson; return L.words[L.wi]; }
  function brAsk() { const L = St.lesson; if (!L || L.id !== 'braille') return; const w = brWord(); say('Write: ' + w.toUpperCase() + '. ' + w.split('').map(c => c.toUpperCase()).join(', ') + '.'); L.ready = true; emit(); }
  function brPaper() { const L = St.lesson, B = FX.benBrailler, c = B.paperTex.image.getContext('2d'); c.fillStyle = '#f7f3ea'; c.fillRect(0, 0, 512, 256); c.fillStyle = 'rgba(0,0,0,0.05)'; for (let i = 0; i < 300; i++) c.fillRect(R() * 512, R() * 256, 2, 2);
    const rows = [...(L ? L.done.slice(-2) : []), L && L.id === 'braille' ? brWord().slice(0, L.li) : ''];
    rows.forEach((wd, r) => { let x = 26; for (const ch of wd) { (BRAILLE[ch] || []).forEach(n => { const cx = x + (n > 3 ? 22 : 0), cy = 34 + r * 76 + ((n - 1) % 3) * 22; c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.arc(cx + 2, cy + 3, 7.5, 0, 7); c.fill(); c.fillStyle = '#fffdf6'; c.beginPath(); c.arc(cx, cy, 7.5, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(cx - 2, cy - 2, 2.6, 0, 7); c.fill(); }); x += 62; } });
    B.paperTex.needsUpdate = true; }
  function brKeyAnim() { const L = St.lesson, B = FX.benBrailler; for (let n = 1; n <= 6; n++) { const dn = L && L.id === 'braille' && (L.held.has(n) || L.latched.has(n)); B.keys[n].position.y = B.keys[n].userData.y0 - (dn ? 0.018 : 0); } }
  function brDown(n) { const L = St.lesson; if (!L || L.id !== 'braille' || L.over || !L.ready) return; au.init(); if (L.held.has(n)) return; L.held.add(n); L.chord.add(n); au.key((n > 3 ? 0.25 : -0.25)); buzz(8); brKeyAnim(); emit(); }
  function brUp(n) { const L = St.lesson; if (!L || L.id !== 'braille' || !L.held.has(n)) return; L.held.delete(n); if (L.held.size === 0) { if (L.chord.size >= 2) brEmboss(); else { L.chord.forEach(d => L.latched.has(d) ? L.latched.delete(d) : L.latched.add(d)); L.chord.clear(); } } brKeyAnim(); emit(); }
  function brErase() { const L = St.lesson; if (!L || L.id !== 'braille') return; L.latched.clear(); L.chord.clear(); au.tap(0, 0.05); brKeyAnim(); emit(); }
  function brHint() { const L = St.lesson; if (!L || L.id !== 'braille' || L.over) return; L.hintOn = !L.hintOn; if (L.hintOn) { L.hints++; const want = brWord()[L.li]; if (want) say(want.toUpperCase() + ' is ' + dotsSay(BRAILLE[want]) + '.'); } emit(); }
  function brEmboss() { const L = St.lesson; if (!L || L.id !== 'braille' || L.over || !L.ready) return; const dots = new Set([...L.latched, ...L.chord]); L.latched.clear(); L.chord.clear(); brKeyAnim(); if (!dots.size) { au.tap(0, 0.04); return; }
    const w = brWord(), want = w[L.li], got = BY_DOTS[dotKey(dots)]; au.emboss(dots.size); buzz(25);
    if (got === want) { L.li++; L.miss = 0; L.bad = null; if (SV.day > 1 || SV.best.braille) L.hintOn = false; au.tone(1320, 0.08, 0.05, 'sine', 0, 0, 0.12); brPaper();
      if (L.li >= w.length) { L.ready = false; L.done.push(w); L.wi++; au.ding(); St.flash = { txt: w.toUpperCase() + ' ✓', col: '#22c55e', t: 1.6 };
        later(0.5, () => { say(w.toUpperCase() + '. ' + PICK(PRAISE)); if (R() < 0.45) later(1.8, () => kidSay(PICK(['juno', 'pip', 'mae']), PICK(['Nice one, Ben!', 'Show-off.', 'Ooh, crisp dots.', 'You type loud!'])), L); }, L);
        if (L.wi >= L.words.length) later(3.0, () => { const s = L.mistakes + L.hints; lessonDone(s <= 1 ? 3 : s <= 4 ? 2 : 1, [['Words', L.words.map(x => x.toUpperCase()).join(' · ')], ['Mistakes', String(L.mistakes)], ['Hints', String(L.hints)]]); }, L);
        else later(2.8, () => { L.li = 0; brPaper(); brAsk(); }, L); } }
    else { L.mistakes++; L.miss++; au.buzz(); buzz([30, 40, 30]); L.bad = { dots: [...dots], got: got ? got.toUpperCase() : '?', t: 2.4 }; if (L.miss >= 2) L.hintOn = true;
      say((got ? "That's " + got.toUpperCase() + ', ' + dotsSay(dots) + '. ' : "That pattern isn't a letter. ") + 'We want ' + want.toUpperCase() + ': ' + dotsSay(BRAILLE[want]) + '.'); }
    emit(); }
  function brHud(L) { const w = brWord() || '', want = w[L.li] || '', cur = [...new Set([...L.held, ...L.chord, ...L.latched])]; const nowL = cur.length ? BY_DOTS[dotKey(cur)] : null;
    return { word: w.toUpperCase(), li: L.li, letters: w.toUpperCase().split('').map((ch, i) => ({ ch, st: i < L.li ? 'done' : i === L.li ? 'now' : 'todo', dots: BRAILLE[ch.toLowerCase()] || [] })), want: want.toUpperCase(), cur, held: [...L.held], latched: [...L.latched],
      curLetter: cur.length ? (nowL ? nowL.toUpperCase() : '?') : '', hint: L.hintOn && want ? BRAILLE[want] : null, n: Math.min(L.wi + 1, L.words.length), of: L.words.length, mistakes: L.mistakes, hints: L.hints, bad: L.bad, ready: !!L.ready }; }

  // ---------------- 2 · TOUCH ART (swell paper) ----------------
  let artHost = null, artCv = null, artCtx = null, artRect = null; const artPtr = { on: false, u: 0, v: 0, id: null, last: 0, bz: 0, line: false };
  function setArtHost(el) { artHost = el; if (!el) { if (artCv && artCv.parentNode) artCv.parentNode.removeChild(artCv); return; } if (!artCv) { artCv = document.createElement('canvas'); artCv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block;cursor:crosshair'; artCtx = artCv.getContext('2d');
      const pos = e => { const r = artCv.getBoundingClientRect(), s = Math.min(r.width, r.height), ox = (r.width - s) / 2, oy = (r.height - s) / 2; return [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s]; };
      artCv.addEventListener('pointerdown', e => { e.preventDefault(); au.init(); try { artCv.setPointerCapture(e.pointerId); } catch (er) {} artPtr.id = e.pointerId; artPtr.on = true; [artPtr.u, artPtr.v] = pos(e); artFeel(); });
      artCv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || artPtr.id === e.pointerId) { [artPtr.u, artPtr.v] = pos(e); artPtr.on = e.pointerType === 'mouse' ? true : artPtr.on; artFeel(); } });
      const up = e => { if (artPtr.id === e.pointerId || e.pointerType === 'mouse') { if (e.type !== 'pointerleave' || e.pointerType === 'mouse') { artPtr.on = false; artPtr.id = null; au.hum(false); } } };
      artCv.addEventListener('pointerup', up); artCv.addEventListener('pointercancel', up); artCv.addEventListener('pointerleave', up); }
    if (artCv.parentNode !== el) el.appendChild(artCv); }
  function picSamples(id) { const pts = []; PICTURES[id].lines.forEach((ln, li) => { for (let i = 0; i < ln.length - 1; i++) { const [x0, y0] = ln[i], [x1, y1] = ln[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.012)); for (let k = 0; k < n; k++) pts.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, li]); } }); return pts; }
  function segDist(u, v, id) { let best = 9; for (const ln of PICTURES[id].lines) for (let i = 0; i < ln.length - 1; i++) { const [x0, y0] = ln[i], [x1, y1] = ln[i + 1], dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1e-9, t = clamp(((u - x0) * dx + (v - y0) * dy) / l2, 0, 1), d = Math.hypot(u - x0 - dx * t, v - y0 - dy * t); if (d < best) best = d; } return best; }
  function artStart(L) { const pool = PIC_TIERS.slice(0, tier() + 1).flat(); Object.assign(L, { pics: L.demo ? ['fish'] : SHUF(pool).slice(0, SV.day === 1 ? 3 : 4), pi: 0, starsList: [] });
    P.x = SPOTS.artTable[0]; P.z = SPOTS.artTable[1] + 0.85; ben.position.set(P.x, 0, P.z); ben.rotation.y = Math.PI;
    stand(hope, SPOTS.artTable[0] + 1.25, SPOTS.artTable[1] - 0.1, -Math.PI / 2); stand(KID.rio, SPOTS.artTable[0] - 1.25, SPOTS.artTable[1] - 0.1, Math.PI / 2); stand(KID.pip, SPOTS.artTable[0] - 0.9, SPOTS.artTable[1] - 1.0, Math.PI * 0.75); stand(KID.juno, SPOTS.artTable[0] + 0.9, SPOTS.artTable[1] - 1.0, -Math.PI * 0.75);
    artSetup(); later(0.5, () => say(St.run ? HOPE.artIntro : HOPE.artIntro2), L); later(St.run ? 9 : 5, () => { if (St.lesson === L && L.phase === 'feel' && L.cover < 0.05) say("Put a finger on the paper and move it slowly. When it buzzes and hums, you're on a raised line."); }, L); }
  function artSetup() { const L = St.lesson, id = L.pics[L.pi]; const all = Object.keys(PICTURES).filter(k => k !== id); const tierPool = PIC_TIERS.slice(0, tier() + 1).flat().filter(k => k !== id);
    const others = SHUF(tierPool.length >= 3 ? tierPool : all).slice(0, 3); Object.assign(L, { pic: id, samp: picSamples(id), felt: null, wrong: [], phase: 'feel', revealT: 0, choices: SHUF([id, ...others]).map(k => PICTURES[k].name), cover: 0, onT: 0, idleT: 0 }); L.felt = new Uint8Array(L.samp.length); L.feltT = new Float32Array(L.samp.length).fill(-99); FX.artSheet.t.image.getContext('2d').fillStyle = '#f4efe2'; artSheet3D(false); emit(); }
  function artFeel() { const L = St.lesson; if (!L || L.id !== 'art' || L.phase !== 'feel') { artPtr.line = false; return; } const { u, v } = artPtr; if (u < 0 || u > 1 || v < 0 || v > 1) { artPtr.line = false; au.hum(false); return; }
    const d = segDist(u, v, L.pic), on = d < 0.032; artPtr.line = on; if (artPtr.on && on) { au.hum(true, 170 + 240 * (1 - v), 0.075, (u - 0.5) * 1.6); const now = performance.now(); if (now - artPtr.bz > 70) { artPtr.bz = now; buzz(14); }
      let nf = 0; for (let i = 0; i < L.samp.length; i++) { if (L.felt[i]) continue; const s = L.samp[i]; if (Math.abs(s[0] - u) < 0.05 && Math.abs(s[1] - v) < 0.05 && Math.hypot(s[0] - u, s[1] - v) < 0.045) { L.felt[i] = 1; nf++; } } for (let i = 0; i < L.samp.length; i++) { const s = L.samp[i]; if (Math.abs(s[0] - u) < 0.05 && Math.abs(s[1] - v) < 0.05) L.feltT[i] = St.t; } if (nf) { let c = 0; for (let i = 0; i < L.felt.length; i++) c += L.felt[i]; L.cover = c / L.felt.length; } }
    else au.hum(false); }
  function artDraw(dt) { const L = St.lesson; if (!artCv || !artHost || !L || L.id !== 'art') return; const r = artHost.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), W = Math.round(r.width * dpr), Hh = Math.round(r.height * dpr); if (!W || !Hh) return; if (artCv.width !== W || artCv.height !== Hh) { artCv.width = W; artCv.height = Hh; }
    const g = artCtx, s = Math.min(W, Hh), ox = (W - s) / 2, oy = (Hh - s) / 2; g.clearRect(0, 0, W, Hh);
    g.fillStyle = '#efe8d8'; g.fillRect(ox, oy, s, s); g.fillStyle = 'rgba(120,100,70,0.06)'; for (let i = 0; i < 120; i++) { const a = (i * 7919) % 997 / 997, b = (i * 104729) % 991 / 991; g.fillRect(ox + a * s, oy + b * s, 2 * dpr, 2 * dpr); }
    g.strokeStyle = '#201e1d'; g.lineWidth = 3 * dpr; g.strokeRect(ox + 1.5 * dpr, oy + 1.5 * dpr, s - 3 * dpr, s - 3 * dpr);
    if (L.phase === 'feel') { for (let i = 0; i < L.samp.length; i++) if (L.felt[i]) { const p = L.samp[i], a = Math.max(0.07, 0.6 * (1 - (St.t - L.feltT[i]) / 6)); g.fillStyle = `rgba(70,45,25,${a.toFixed(3)})`; g.beginPath(); g.arc(ox + p[0] * s, oy + p[1] * s, s * 0.011, 0, 7); g.fill(); } }
    else { L.revealT += dt; const k = Math.min(1, L.revealT / 1.1), n = Math.floor(L.samp.length * k); g.strokeStyle = '#201e1d'; g.lineWidth = s * 0.016; g.lineCap = g.lineJoin = 'round'; g.beginPath(); let prev = -1; for (let i = 0; i < n; i++) { const p = L.samp[i]; if (p[2] !== prev) { g.moveTo(ox + p[0] * s, oy + p[1] * s); prev = p[2]; } else g.lineTo(ox + p[0] * s, oy + p[1] * s); } g.stroke();
      g.fillStyle = '#c42d3c'; g.font = `900 ${Math.round(s * 0.075)}px Archivo, "Arial Black", Arial`; g.textAlign = 'center'; if (k >= 1) g.fillText(PICTURES[L.pic].name, ox + s / 2, oy + s * 0.97); g.textAlign = 'left'; }
    if (artPtr.on || (artPtr.u > 0 && artPtr.u < 1 && artPtr.v > 0 && artPtr.v < 1 && L.phase === 'feel')) { const x = ox + artPtr.u * s, y = oy + artPtr.v * s; g.strokeStyle = artPtr.line && artPtr.on ? '#ec3013' : 'rgba(32,30,29,0.55)'; g.lineWidth = 3 * dpr; g.beginPath(); g.arc(x, y, s * (artPtr.line && artPtr.on ? 0.05 : 0.035), 0, 7); g.stroke(); if (artPtr.line && artPtr.on) { g.fillStyle = 'rgba(236,48,19,0.18)'; g.beginPath(); g.arc(x, y, s * 0.05, 0, 7); g.fill(); } }
    if (L.phase === 'feel') { L.idleT += dt; } }
  function artSheet3D(full) { const L = St.lesson, t = FX.artSheet.t, c = t.image.getContext('2d'); c.fillStyle = '#f4efe2'; c.fillRect(0, 0, 256, 256); if (full && L) { c.strokeStyle = '#201e1d'; c.lineWidth = 6; c.lineCap = c.lineJoin = 'round'; PICTURES[L.pic].lines.forEach(ln => { c.beginPath(); ln.forEach(([x, y], i) => i ? c.lineTo(x * 256, y * 256) : c.moveTo(x * 256, y * 256)); c.stroke(); }); } t.needsUpdate = true; }
  function artPick(name) { const L = St.lesson; if (!L || L.id !== 'art' || L.phase !== 'feel' || L.wrong.includes(name)) return; const pic = PICTURES[L.pic];
    if (name === pic.name) { L.phase = 'reveal'; L.revealT = 0; artPtr.on = false; au.hum(false); au.ding(); buzz([20, 40, 60]); const st = 3 - Math.min(2, L.wrong.length); L.starsList.push(st); St.flash = { txt: pic.name + ' ✓', col: '#22c55e', t: 1.6 }; artSheet3D(true);
      if (!L.demo) { SV.gallery = [L.pic, ...SV.gallery.filter(x => x !== L.pic)].slice(0, 12); persist(); galleryDraw(); }
      say('Yes! A ' + pic.name.toLowerCase() + '. ' + PICK(['You read that with your fingers.', 'That one goes on the gallery wall.', 'Your fingers are getting smart.', 'Rio, did you hear that? Ben got it.'])); later(1.4, () => kidSay(PICK(['rio', 'pip', 'juno']), PICK(['Ooh!', 'I got it too!', 'Nice!', 'Told you, the lines puff up!'])), L);
      L.pi++; if (L.pi >= L.pics.length) later(3.2, () => { const avg = L.starsList.reduce((a, b) => a + b, 0) / L.starsList.length; lessonDone(Math.round(avg), [['Pictures', L.pics.map(k => PICTURES[k].name).join(' · ')], ['First-try answers', L.starsList.filter(x => x === 3).length + ' of ' + L.starsList.length]]); }, L);
      else later(3.0, () => { artSetup(); say(PICK(['Next picture. Feel all of it before you guess.', 'Here is another one. Slow fingers.', 'New sheet. What is this one?'])); }, L); }
    else { L.wrong.push(name); au.buzz(); buzz([30, 40, 30]); say('Not a ' + name.toLowerCase() + '. Here is a clue: ' + pic.clue); }
    emit(); }
  function artFinger(u, v, on) { artPtr.u = u; artPtr.v = v; artPtr.on = on; if (!on) au.hum(false); artFeel(); }
  function galleryDraw() { FX.gallery.forEach((fr, i) => { const id = SV.gallery[i], c = fr.t.image.getContext('2d'); c.fillStyle = '#efe8d8'; c.fillRect(0, 0, 256, 256); if (id && PICTURES[id]) { c.strokeStyle = '#201e1d'; c.lineWidth = 9; c.lineCap = c.lineJoin = 'round'; PICTURES[id].lines.forEach(ln => { c.beginPath(); ln.forEach(([x, y], k) => k ? c.lineTo(20 + x * 216, 14 + y * 200) : c.moveTo(20 + x * 216, 14 + y * 200)); c.stroke(); }); c.fillStyle = '#c42d3c'; c.font = '900 24px Archivo, Arial'; c.textAlign = 'center'; c.fillText('BY BEN', 128, 246); } else { c.fillStyle = '#8a847e'; c.font = '800 28px Archivo, Arial'; c.textAlign = 'center'; c.fillText('YOUR ART', 128, 120); c.fillText('HERE', 128, 156); } fr.t.needsUpdate = true; }); }

  // ---------------- 3 · CANE WALK ----------------
  const OBS_KINDS = { chair: { snd: 'metal', name: 'a chair', r: 0.24 }, backpack: { snd: 'soft', name: 'a backpack', r: 0.2 }, bin: { snd: 'plastic', name: 'a bin', r: 0.2 }, sign: { snd: 'plastic', name: 'a wet floor sign', r: 0.22 }, bucket: { snd: 'metal', name: 'a mop bucket', r: 0.22 }, cart: { snd: 'metal', name: 'a book cart', r: 0.3 } };
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false, fog: false });
  function obstacleMesh(kind) { const g = new THREE.Group(), b = (w, h, d, col, x, y, z) => M(new THREE.BoxGeometry(w, h, d), toon(col), x, y, z, g, 0.012);
    if (kind === 'chair') { b(0.46, 0.05, 0.44, '#c42d3c', 0, 0.48, 0); b(0.46, 0.45, 0.05, '#c42d3c', 0, 0.74, -0.2); for (const sx of [-0.19, 0.19]) for (const sz of [-0.18, 0.18]) b(0.04, 0.48, 0.04, '#94a3b8', sx, 0.24, sz); }
    else if (kind === 'backpack') { b(0.36, 0.42, 0.24, '#7c3aed', 0, 0.21, 0); b(0.3, 0.16, 0.08, '#6d28d9', 0, 0.16, 0.15); }
    else if (kind === 'bin') { M(new THREE.CylinderGeometry(0.2, 0.17, 0.62, 16), toon('#22863a'), 0, 0.31, 0, g, 0.012, 0.2); }
    else if (kind === 'sign') { const a = b(0.4, 0.62, 0.03, '#ffd23a', 0, 0.31, 0.1); a.rotation.x = -0.25; const c = b(0.4, 0.62, 0.03, '#ffd23a', 0, 0.31, -0.1); c.rotation.x = 0.25; }
    else if (kind === 'bucket') { M(new THREE.CylinderGeometry(0.22, 0.19, 0.36, 16), toon('#ffd23a'), 0, 0.22, 0, g, 0.012, 0.22); b(0.03, 1.1, 0.03, '#a16207', 0.05, 0.6, 0); }
    else if (kind === 'cart') { b(0.7, 0.06, 0.4, '#7a5234', 0, 0.3, 0); b(0.7, 0.06, 0.4, '#7a5234', 0, 0.7, 0); for (const sx of [-0.32, 0.32]) b(0.04, 0.75, 0.04, '#3a3836', sx, 0.38, 0.17); for (let i = 0; i < 6; i++) b(0.09, 0.3, 0.3, PICK(['#f7f3ea', '#c42d3c', '#2f6db0']), -0.27 + i * 0.11, 0.48, 0); }
    const ghost = new THREE.Group(); g.traverse(m => { if (m.isMesh && m.material !== outlineMat) { const gm = new THREE.Mesh(m.geometry, ghostMat.clone()); gm.position.copy(m.position); gm.rotation.copy(m.rotation); gm.scale.copy(m.scale).multiplyScalar(1.12); gm.renderOrder = 33; ghost.add(gm); } }); g.add(ghost); g.userData.ghost = ghost; scene.add(g); return g; }
  let lastObs = []; function clearObs() { lastObs.forEach(o => { if (o.g) scene.remove(o.g); }); lastObs = []; }
  function ghostSet(o, a) { o.g.userData.ghost.children.forEach(m => m.material.opacity = a); }
  function caneStart(L) { ben.visible = false; benCane.visible = true; caneShades.visible = true; const z = LANE_Z[1];
    Object.assign(L, { bx: SPOTS.caneStart[0], lane: 1, bz: z, obs: [], lastDir: 0, sweeps: 0, covSum: 0, bumps: 0, finds: 0, sameDir: 0, stepT: 0, stepFrom: 0, stepTo: 0, blocked: null, shake: 0, clapT: 2, arc: 0, msgT: 0 });
    benCane.position.set(L.bx, 0, z); benCane.rotation.set(0, Math.PI / 2, 0); benCane.userData.rig.onTap = (side, p) => { au.tap(side === 'L' ? -0.35 : 0.35, 0.07); ripple(p.x, p.z, 0xffffff, 0.45, 0.03, 0.45); };
    stand(hope, 11.6, 1.2, -Math.PI / 2); // Hope waits at the gym door and claps: walk toward the sound
    const kinds = Object.keys(OBS_KINDS); let x = L.demo ? -10.2 : -9.4; const end = L.demo ? -6 : 9.6;
    while (x < end) { const lane = Math.floor(R() * 3), kind = PICK(kinds), o = { x, lane, off: RR(-0.34, 0.34), kind, r: OBS_KINDS[kind].r, found: false, fade: 0, g: obstacleMesh(kind) }; if (L.demo && L.obs.length === 0) { o.lane = 1; o.off = 0.05; } o.z = LANE_Z[o.lane] + o.off; o.g.position.set(o.x, 0, o.z); o.g.rotation.y = RR(-0.5, 0.5); o.g.visible = false; L.obs.push(o); x += L.demo ? 2.6 : RR(2.1, 3.1); }
    lastObs = L.obs; if (tier() >= 1 && !L.demo) { const s = KID.juno, o = { x: 6.5, lane: Math.floor(R() * 3), off: 0, kind: 'fox', r: 0.26, found: false, student: s, walk: true, fade: 0 }; o.z = LANE_Z[o.lane]; s.visible = true; s.position.set(o.x, 0, o.z); s.rotation.set(0, -Math.PI / 2, 0); s.userData.ghostless = true; NPCS.push({ f: s, fixed: true, wait: 99, walker: o }); L.obs.push(o); }
    St.dim = 1; later(0.5, () => say(St.run ? HOPE.caneIntro : HOPE.caneIntro2), L); L.ready = false; later(St.run ? 8.5 : 5.2, () => { L.ready = true; say("I'm at the gym door. Follow my clapping."); emit(); }, L); }
  function caneLaneOk(lane) { return lane >= 0 && lane <= 2; }
  function caneSweep(dir, cov = 1) { const L = St.lesson; if (!L || L.id !== 'cane' || L.over || !L.ready) return; if (L.stepT > 0 || L.sideT > 0) { L.queued = { dir, cov }; return; } au.init(); dir = dir < 0 ? -1 : 1; cov = clamp(cov, 0.2, 1);
    if (dir === L.lastDir) { L.sameDir++; if (L.sameDir === 2 || L.sameDir % 5 === 0) say('Sweep back the other way. Left, right, left: one sweep for every step.'); } L.lastDir = dir; L.sweeps++; L.covSum += cov; L.arc = cov; L.arcDir = dir;
    const hw = 0.1 + 0.44 * cov, reach = 1.4; let block = null; const found = [];
    for (const o of L.obs) { if (o.gone) continue; const dx = o.x - L.bx, lat = o.z - L.bz; if (dx > 0.05 && dx <= reach && Math.abs(lat) <= hw + o.r) { found.push(o); if (Math.abs(lat) < 0.3 + o.r && (!block || o.x < block.x)) block = o; } }
    found.forEach(o => caneFind(o));
    // the shoreline: a wide sweep in an edge lane ticks the lockers or the wall
    if (cov > 0.7 && (L.lane === 0 || L.lane === 2) && dir === (L.lane === 0 ? -1 : 1)) au.tock('wall', L.lane === 0 ? -0.7 : 0.7, 0.12);
    const rig = benCane.userData.rig;
    if (block) { L.blocked = block; rig.strike(); au.tock(block.kind === 'fox' ? 'fox' : OBS_KINDS[block.kind].snd, clamp((block.z - L.bz) * 1.2, -1, 1), 0.34); buzz(40);
      if (!block.told) { block.told = true; if (block.student) { blockStudent(block); } else say(PICK(['Something there. It sounds like ' + OBS_KINDS[block.kind].name + '. Step around it.', 'Your cane found ' + OBS_KINDS[block.kind].name + '. Step left or right to go around.', 'Stop! ' + OBS_KINDS[block.kind].name.replace(/^a /, 'A ') + '. Go around it.'])); } emit(); return; }
    L.blocked = null; // step forward; anything the arc missed gets bumped into
    let to = L.bx + 0.82, bump = null; for (const o of L.obs) { if (o.gone || o.found && o.student) continue; const dx = o.x - L.bx, lat = o.z - L.bz; if (dx > 0 && dx < 0.82 + 0.3 && Math.abs(lat) < 0.3 + o.r && !found.includes(o)) { if (!bump || o.x < bump.x) bump = o; } }
    if (bump) { to = Math.max(L.bx, bump.x - 0.42); L.pendingBump = bump; }
    L.stepFrom = L.bx; L.stepTo = to; L.stepT = 0.42; emit(); }
  function caneFind(o) { const L = St.lesson; if (!o.found) { o.found = true; L.finds++; if (o.g) o.g.visible = true; } o.fade = 1; if (o.g) ghostSet(o, 1); ripple(o.x, o.z, 0xffffff, 0.8, 0.05, 0.7); }
  function blockStudent(o) { const L = St.lesson; o.walk = false; const s = o.student; s.userData.say = { text: 'Oh! Sorry Ben!', t: 0 }; kidSay('juno', "Oh! Sorry, Ben! I didn't hear you. I'll move."); later(1.6, () => { o.leaving = true; }, L); }
  function caneSide(s) { const L = St.lesson; if (!L || L.id !== 'cane' || L.over || !L.ready || L.stepT > 0) return; au.init(); const nl = L.lane + (s < 0 ? -1 : 1);
    if (!caneLaneOk(nl)) { au.thud(s < 0 ? -0.7 : 0.7, 0.2); buzz(60); L.shake = 0.3; if (!L.wallTold) { L.wallTold = true; say("That's the wall. The hall is three steps wide."); } return; }
    const nz = LANE_Z[nl]; const hit = L.obs.find(o => !o.gone && Math.abs(o.x - L.bx) < 0.38 + o.r && Math.abs(o.z - nz) < 0.3 + o.r);
    if (hit) { caneFind(hit); au.thud((nz - L.bz) * 0.8, 0.3); buzz(80); L.bumps++; L.shake = 0.4; say('Bump! Something was right beside you. Sweep that side first, then step.'); emit(); return; }
    L.lane = nl; L.sideFrom = L.bz; L.sideTo = nz; L.sideT = 0.3; L.blocked = null; au.step(s * 0.4, 0.06); emit(); }
  function caneUpdate(L, dt) { const rig = benCane.userData.rig; let speed = 0;
    if (L.stepT > 0) { L.stepT = Math.max(0, L.stepT - dt); const k = 1 - L.stepT / 0.42; const nx = L.stepFrom + (L.stepTo - L.stepFrom) * smooth(0, 1, k); speed = Math.abs(nx - L.bx) / Math.max(dt, 1e-4); L.bx = nx;
      if (L.stepT === 0) { au.step(0, 0.05); if (L.pendingBump) { const o = L.pendingBump; L.pendingBump = null; caneFind(o); au.thud(clamp((o.z - L.bz) * 1.2, -1, 1), 0.34); buzz([60, 30, 60]); L.bumps++; L.shake = 0.5; L.blocked = o; St.flash = { txt: 'BUMP', col: '#ec3013', t: 1.1 }; say(L.arc < 0.65 ? 'Bump! Sweep wider: the cane has to cover your shoulders, not just your middle.' : 'Bump! Keep the cane sweeping with every single step.'); }
        if (L.bx >= SPOTS.caneEnd) caneFinish(); else if (L.queued) { const q = L.queued; L.queued = null; caneSweep(q.dir, q.cov); } } }
    if (L.sideT > 0) { L.sideT = Math.max(0, L.sideT - dt); L.bz = L.sideFrom + (L.sideTo - L.sideFrom) * smooth(0, 1, 1 - L.sideT / 0.3); if (L.sideT === 0 && L.queued) { const q = L.queued; L.queued = null; caneSweep(q.dir, q.cov); } }
    benCane.position.set(L.bx, 0, L.bz); kit.animFox(benCane, dt, speed * 0.9 + (L.sideT > 0 ? 1.2 : 0));
    L.shake = Math.max(0, L.shake - dt); L.obs.forEach(o => { if (o.g && o.fade > 0) { o.fade = Math.max(0.45, o.fade - dt * 0.6); ghostSet(o, o.fade); } });
    // the classmate walking the hall
    L.obs.forEach(o => { if (!o.student || o.gone) return; const s = o.student; if (o.walk && o.x - L.bx > 1.8) { o.x -= dt * 0.55; s.position.x = o.x; kit.animFox(s, dt, 0.8); o.stT = (o.stT || 0) - dt; if (o.stT < 0) { o.stT = 0.55; au.step(panOf(s.position) * 0.8, 0.05 * clamp(3 / Math.max(1, o.x - L.bx), 0.3, 1)); } }
      else if (o.leaving) { s.position.z = damp(s.position.z, -0.15, 3, dt); s.position.x += dt * 0.6; s.rotation.y = damp(s.rotation.y, Math.PI / 2, 5, dt); kit.animFox(s, dt, 1.2); if (Math.abs(s.position.z + 0.15) < 0.08) { o.gone = true; s.visible = false; if (L.blocked === o) L.blocked = null; } }
      else kit.animFox(s, dt, 0); o.z = s.position.z; });
    L.clapT -= dt; if (L.clapT < 0 && L.ready) { L.clapT = 2.6; const p = panOf(hope.position), d = Math.abs(hope.position.x - L.bx), v = clamp(0.5 / Math.max(1, d / 4), 0.08, 0.35); au.noise(0.04, 2500, v, p, 'bandpass', 0, 2); au.noise(0.04, 2500, v, p, 'bandpass', 0.22, 2); ripple(hope.position.x, hope.position.z, 0x38bdf8, 1.2, 0.04, 0.8); }
    const prog = clamp((L.bx - SPOTS.caneStart[0]) / (SPOTS.caneEnd - SPOTS.caneStart[0]), 0, 1); L.prog = prog; }
  function caneFinish() { const L = St.lesson; if (L.over) return; L.ready = false; au.ding(); const avg = L.covSum / Math.max(1, L.sweeps); say(L.bumps === 0 ? "You made it to the gym door, and not one bump! Your cane did all the work." : "You made it to the gym door! " + (L.bumps === 1 ? 'Just one bump.' : L.bumps + ' bumps. Wider sweeps next time.'));
    const s = L.bumps * 2 + (avg < 0.7 ? 1 : 0) + (L.sameDir > 4 ? 1 : 0); later(2.6, () => lessonDone(s === 0 ? 3 : s <= 2 ? 2 : 1, [['Bumps', String(L.bumps)], ['Things your cane found', String(L.finds)], ['Average arc', Math.round(avg * 100) + '%']]), L); }
  function caneHud(L) { return { prog: L.prog || 0, bumps: L.bumps, finds: L.finds, lane: L.lane, arc: L.arc, arcDir: L.arcDir, blocked: !!L.blocked, ready: !!L.ready, meters: Math.max(0, Math.round(SPOTS.caneEnd - L.bx)) }; }

  // ---------------- 4 · GOALBALL ----------------
  const ball = M(new THREE.SphereGeometry(0.17, 18, 14), toon('#2f6db0'), 0, -5, 0, scene, 0.012, 0.17); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; M(new THREE.SphereGeometry(0.035, 6, 5), toon('#0b2545'), Math.cos(a) * 0.15, Math.sin(a * 2) * 0.06, Math.sin(a) * 0.15, ball, 0); }
  function goalStart(L) { const lx = SPOTS.lanesX; ben.position.set(lx[1], 0, SPOTS.gymBen[1]); ben.rotation.set(0, Math.PI, 0); benShades.visible = true;
    stand(KID.tobi, 5.3, -2.15, Math.PI); stand(KID.juno, 11.1, -2.15, Math.PI); [KID.tobi, KID.juno].forEach(f => { if (!f.userData.shades) f.userData.shades = shades(f); f.userData.shades.visible = true; });
    owls.forEach((o, i) => stand(o, lx[i], SPOTS.owlsZ, 0)); stand(hope, 12.2, -5.5, -Math.PI / 2);
    Object.assign(L, { round: 0, of: L.demo ? 1 : 5, us: 0, them: 0, blocks: 0, phase: 'wait', ballOn: false, dive: null, cue: '' }); ball.position.set(lx[1], 0.17, SPOTS.owlsZ + 0.5); ball.visible = false; St.dim = 0.85;
    later(0.5, () => say(St.run ? HOPE.goalIntro : HOPE.goalIntro2), L); later(St.run ? 9.5 : 5.5, () => { au.whistle(); say('Quiet please. Play!', hope, 'HOPE', 'Referee', false); goalDefend(); }, L); }
  function goalDefend() { const L = St.lesson; if (!L || L.id !== 'goal') return; const T = [1.95, 1.65, 1.38][tier()] * (L.demo ? 1.15 : 1);
    L.round++; L.phase = 'windup'; L.dive = null; const ts = Math.floor(R() * 3); let te = Math.floor(R() * 3); if (R() < 0.55 && te === ts) te = (te + (R() < 0.5 ? 1 : 2)) % 3; Object.assign(L, { ts, te, T, bt: 0, jt: 0, cue: 'LISTEN · the Owls are about to throw' });
    owls.forEach((o, i) => { o.userData.tx = SPOTS.lanesX[i]; o.position.z = SPOTS.owlsZ; }); const thrower = owls[ts]; thrower.position.x = SPOTS.lanesX[ts]; L.thrower = thrower; L.windT = 1.0; for (let i = 0; i < 3; i++) later(0.15 + i * 0.28, () => { au.step(panOf(thrower.position), 0.08); ripple(thrower.position.x, thrower.position.z + 0.5, 0x94a3b8, 0.7, 0.03, 0.6); }, L); emit(); }
  function goalDive(lane) { const L = St.lesson; if (!L || L.id !== 'goal' || L.over) return; au.init(); if (L.phase === 'attack') return goalThrow(lane); if (!(L.phase === 'roll' || L.phase === 'windup') || (L.dive && L.dive.t < 1.25)) return;
    L.dive = { lane, t: 0, at: L.bt }; au.noise(0.18, 700, 0.18, (lane - 1) * 0.7); buzz(30); emit(); }
  function goalAttack() { const L = St.lesson; L.phase = 'attack'; L.ballOn = true; ball.visible = true; L.dive = null; ben.rotation.set(0, Math.PI, 0); ben.position.y = 0; ball.position.set(SPOTS.lanesX[1], 0.9, SPOTS.gymBen[1] - 0.3);
    const open = Math.floor(R() * 3); L.open = open; L.cover = [0, 1, 2].filter(i => i !== open); L.tapT = 0.3; L.shuffleT = tier() >= 1 && !L.demo ? RR(2.2, 3.2) : 99; L.attT = 0; placeOwls(); L.cue = 'YOUR THROW · two Owls are tapping. Throw where it is quiet'; emit(); }
  function placeOwls() { const L = St.lesson; L.cover.forEach((ln, i) => { owls[i].userData.tx = SPOTS.lanesX[ln]; }); owls[2].userData.tx = 12.3; }
  function goalThrow(lane) { const L = St.lesson; if (!L || L.phase !== 'attack') return; L.phase = 'throw'; L.throwLane = lane; L.bt = 0; ball.position.set(ben.position.x, 0.17, SPOTS.gymBen[1] - 0.5); au.noise(0.2, 900, 0.2, 0); buzz(25); L.cue = ''; emit(); }
  function goalUpdate(L, dt) { const lx = SPOTS.lanesX, gz = SPOTS.gymBen[1];
    // Ben's dive pose: body length covers the next lane over
    let rz = 0, y = 0, sc = 1; if (L.dive) { L.dive.t += dt; const t = L.dive.t, k = t < 0.18 ? t / 0.18 : t < 1.0 ? 1 : t < 1.4 ? 1 - (t - 1.0) / 0.4 : 0; if (L.dive.lane === 1) { sc = 1 - 0.3 * k; } else { rz = (L.dive.lane === 0 ? -1.38 : 1.38) * k; y = 0.12 * k; } if (t > 1.45) L.dive = null; }
    ben.rotation.set(0, Math.PI, damp(ben.rotation.z, rz, 18, dt)); ben.scale.set(1, damp(ben.scale.y, sc, 14, dt), 1); ben.position.y = y;
    if (L.phase === 'windup') { L.windT -= dt; L.thrower.rotation.y = Math.sin(L.windT * 9) * 0.15; if (L.windT <= 0) { L.phase = 'roll'; L.bt = 0; L.jt = 0; au.noise(0.15, 600, 0.2, panOf(L.thrower.position)); L.cue = 'LISTEN · where is the ball going?'; } }
    if (L.phase === 'roll') { L.bt += dt; const k = clamp(L.bt / L.T, 0, 1), xs = lx[L.ts], xe = lx[L.te], x = xs + (xe - xs) * smooth(0.15, 0.85, k), z = SPOTS.owlsZ + 0.5 + (gz - 0.2 - SPOTS.owlsZ - 0.5) * k; ball.position.set(x, 0.17, z); ball.rotation.x -= dt * 9;
      L.jt -= dt; if (L.jt <= 0) { L.jt = 0.085; const near = 0.35 + 0.65 * k; au.jingle(clamp((x - ben.position.x) / 2.6, -1, 1), 0.06 + 0.14 * near); ripple(x, z, 0xffd23a, 0.55 + 0.3 * k, 0.04, 0.55); }
      if (k >= 1) { const d = L.dive, ok = d && d.lane === L.te && (L.bt - d.at) <= 1.05 + L.T * 0.1 && d.t < 1.2;
        if (ok) { L.blocks++; L.phase = 'held'; au.thud(clamp((x - ben.position.x) / 2.6, -1, 1), 0.4); buzz([40, 30, 80]); St.flash = { txt: 'BLOCKED!', col: '#22c55e', t: 1.3 }; ball.visible = true; kidSay(PICK(['tobi', 'juno']), PICK(['YES! Great block!', 'Wall! Ben is a wall!', 'Got it!'])); later(1.5, () => goalAttack(), L); }
        else { L.them++; L.phase = 'goalA'; ball.visible = true; au.whistle(); au.noise(0.4, 1500, 0.12, clamp((x - ben.position.x) / 2.6, -1, 1)); buzz(120); St.flash = { txt: 'OWLS SCORE', col: '#ec3013', t: 1.4 }; say(L.dive ? (L.dive.lane !== L.te ? 'It went ' + ['left', 'down the middle', 'right'][L.te] + '. Listen for where the bells END UP, not where they start.' : 'Right side, just too early! Wait until the bells are close.') : 'Goal for the Owls. Dive when the bells get loud!', hope, 'HOPE', 'Referee'); ball.position.z = SPOTS.ourGoalZ + 0.2; later(1.8, () => goalAttack(), L); }
        emit(); } }
    if (L.phase === 'attack') { L.attT += dt; L.tapT -= dt; if (L.tapT <= 0) { L.tapT = 0.62; L.cover.forEach((ln, i) => { const o = owls[i]; au.tap(clamp((lx[ln] - ben.position.x) / 2.6, -1, 1), 0.09); ripple(lx[ln], SPOTS.owlsZ + 0.3, 0x38bdf8, 0.8, 0.04, 0.6); }); }
      L.shuffleT -= dt; if (L.shuffleT <= 0) { L.shuffleT = RR(2.4, 3.4); const no = [0, 1, 2].filter(i => i !== L.open)[Math.floor(R() * 2)]; L.open = no; L.cover = [0, 1, 2].filter(i => i !== no); placeOwls(); au.noise(0.35, 400, 0.08, 0); }
      if (L.attT > 9 && !L.slowTold) { L.slowTold = true; say('Ten second rule, Ben! Throw!', hope, 'HOPE', 'Referee'); } if (L.attT > 12) goalThrow(L.open === 1 ? 0 : 1); }
    if (L.phase === 'throw') { L.bt += dt; const k = clamp(L.bt / 0.85, 0, 1), xe = lx[L.throwLane], x = ben.position.x + (xe - ben.position.x) * smooth(0, 0.6, k), z = gz - 0.5 + (SPOTS.theirGoalZ + 0.3 - gz + 0.5) * k; ball.position.set(x, 0.17, z); ball.rotation.x += dt * 9; L.jt -= dt; if (L.jt <= 0) { L.jt = 0.09; au.jingle(clamp((x - ben.position.x) / 2.6, -1, 1), 0.08); ripple(x, z, 0xffd23a, 0.55, 0.04, 0.5); }
      if (k >= 1) { const blocked = L.cover.includes(L.throwLane); if (blocked) { const o = owls[L.cover.indexOf(L.throwLane)]; o.userData.diveT = 1; au.thud(0, 0.25); St.flash = { txt: 'SAVED BY ' + o.userData.name, col: '#ffd23a', t: 1.3 }; if (!L.demo) say(PICK(["They heard it coming. Throw where nobody's tapping.", 'Blocked. Listen to the taps: the quiet lane is the open one.']), hope, 'HOPE', 'Coach'); }
        else { L.us++; au.cheer(0.16); au.whistle(); buzz([60, 40, 60, 40, 120]); St.flash = { txt: 'GOAL!', col: '#22c55e', t: 1.5 }; kidSay(PICK(['tobi', 'juno']), PICK(['GOAAAL!', 'Right in the quiet spot!', 'Yes, Ben!'])); }
        L.phase = 'after'; later(1.8, () => { ball.visible = false; if (L.round >= L.of) goalEnd(); else goalDefend(); }, L); emit(); } }
    // owls: slide to their lanes, dive when saving
    owls.forEach((o, i) => { const u = o.userData; if (u.tx != null && L.phase !== 'windup' && L.phase !== 'roll') o.position.x = damp(o.position.x, u.tx, 4, dt); if (u.diveT > 0) { u.diveT = Math.max(0, u.diveT - dt); o.rotation.z = Math.sin(u.diveT * Math.PI) * 1.2 * (i === 0 ? -1 : 1); } else o.rotation.z = 0; });
    if (L.phase === 'held' || L.phase === 'attack') { ball.position.lerp(V3(ben.position.x + 0.0, 0.9, gz - 0.35), 1 - Math.exp(-10 * dt)); }
  }
  function goalEnd() { const L = St.lesson; L.phase = 'done'; au.whistle(); const win = L.us > L.them, draw = L.us === L.them; say(win ? 'Final whistle! Ben\'s team wins, ' + L.us + ' to ' + L.them + '!' : draw ? 'Final whistle! A draw, ' + L.us + ' all. Good game!' : 'Final whistle! The Owls win this one, ' + L.them + ' to ' + L.us + '. Rematch tomorrow!', hope, 'HOPE', 'Referee');
    if (win) au.cheer(0.2); const s = clamp((win ? 2 : draw ? 1 : 0) + (L.blocks >= Math.ceil(L.of * 0.6) ? 1 : 0), 1, 3); later(2.8, () => lessonDone(s, [['Score', 'BEN\'S TEAM ' + L.us + ' · OWLS ' + L.them], ['Blocks', L.blocks + ' of ' + L.of]]), L); emit(); }
  function goalHud(L) { return { us: L.us, them: L.them, round: L.round, of: L.of, phase: L.phase, cue: L.cue, attack: L.phase === 'attack', defend: L.phase === 'roll' || L.phase === 'windup', diving: !!L.dive }; }

  // =====================================================================================
  //  FREE ROAM + MAIN LOOP
  // =====================================================================================
  const dampA = (a, b, k, dt) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * (1 - Math.exp(-k * dt)); };
  let stepSnd = 0, pianoT = 3, mini = null;
  function freeUpdate(dt) { let ix = St.jx, iy = St.jy; const k = St.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) iy += 1; if (k.has('KeyS') || k.has('ArrowDown')) iy -= 1; if (k.has('KeyA') || k.has('ArrowLeft')) ix -= 1; if (k.has('KeyD') || k.has('ArrowRight')) ix += 1;
    if (St.dialog || St.mode !== 'free') ix = iy = 0; const mag = Math.min(1, Math.hypot(ix, iy)), run = k.has('ShiftLeft') || k.has('ShiftRight') ? 1.35 : 1;
    const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw); let dx = rx * ix + fx * iy, dz = rz * ix + fz * iy; const dl = Math.hypot(dx, dz);
    P.speed = damp(P.speed, mag > 0.06 ? 3.6 * mag * run : 0, 12, dt);
    if (dl > 0.01) { dx /= dl; dz /= dl; P.face = dampA(P.face, Math.atan2(dx, dz), 12, dt); } const mvx = Math.sin(P.face) * P.speed * dt, mvz = Math.cos(P.face) * P.speed * dt;
    if (P.speed > 0.05) { [P.x, P.z] = collide(P.x + mvx, P.z + mvz); stepSnd -= dt * P.speed; if (stepSnd < 0) { stepSnd = 1.25; au.step(0, 0.03); } }
    P.vy -= 15 * dt; P.y = Math.max(0, P.y + P.vy * dt); if (P.y === 0) P.vy = Math.max(0, P.vy);
    ben.position.set(P.x, P.y, P.z); ben.rotation.y = P.face; kit.animFox(ben, dt, P.speed, P.y > 0.03);
    const rm = roomAt(P.x, P.z); St.room = rm; St.near = St.mode === 'free' && !St.dialog ? nearest() : null;
    // Mae practises the piano: you hear it from the hall (panned)
    pianoT -= dt; if (pianoT < 0) { pianoT = RR(0.9, 2.2); const src = V3(-11.2, 1.2, 8.6), d = Math.hypot(src.x - P.x, src.z - P.z); if (d < 16) { const seq = [0, 2, 4, 7, 9, 12, 9, 7]; au.piano(seq[Math.floor(St.t * 1.7) % seq.length], panOf(src) * 0.8, 0.055 * clamp(5 / Math.max(2, d), 0.15, 1)); KID.mae.userData.wave = 0; } } }
  function npcUpdate(dt) { for (const n of NPCS) { const f = n.f; if (!f.visible || n.walker) continue; let sp = 0;
      if (!n.fixed && n.route && St.mode === 'free' && !(St.dialog && f.userData.lookAt)) { if (n.wait > 0) n.wait -= dt; else { const [tx, tz] = n.route[n.ri], dx = tx - f.position.x, dz = tz - f.position.z, d = Math.hypot(dx, dz); if (d < 0.12) { n.ri = (n.ri + 1) % n.route.length; n.wait = RR(1.2, 3.5); } else { sp = n.spd || 0.6; f.position.x += dx / d * sp * dt; f.position.z += dz / d * sp * dt; f.rotation.y = dampA(f.rotation.y, Math.atan2(dx, dz), 5, dt); } } }
      else if (!n.fixed && St.mode === 'free') f.rotation.y = dampA(f.rotation.y, f.userData.lookAt ? Math.atan2(f.userData.lookAt.x - f.position.x, f.userData.lookAt.z - f.position.z) : n.face, 4, dt);
      if (n.bounce && St.mode === 'free') { n.wait -= dt; if (n.wait < 0) { n.wait = RR(1.5, 4); f.userData.hop = 1; } }
      kit.animFox(f, dt, sp); if (n.sit) sitFix(f); waveFix(f, dt); } }
  function waveFix(f, dt) { const u = f.userData; if (!(u.wave > 0)) return; u.wave = Math.max(0, u.wave - dt); const P2 = u.P, a = P2.arms[1]; a.rotation.x = -2.7 + Math.sin(St.t * 14) * 0.25; a.rotation.z = 0.45; }

  function lessonCam(dt) { const L = St.lesson, portrait = CH() > CW();
    if (L.id === 'braille') shotCam(dt, shotFor('br', () => [V3(-8.3, 0.86, -6.25), V3(-7.7, 0.86, -6.25), V3(-8, 1.05, -5.75), V3(-8.4, 2.3, -8.3), V3(-7.6, 2.3, -8.3), V3(-8, 1.0, -8.3), V3(-8, 2.1, -5.3)], 0.4, 1.0, 0.05), St.cam.snap);
    else if (L.id === 'art') shotCam(dt, shotFor('art', () => [V3(0.05, 0.9, -5.95), V3(0.95, 0.9, -5.95), V3(0.5, 0.9, -5.2), V3(1.75, 2.15, -5.7), V3(-0.75, 1.7, -5.7), V3(0.5, 2.0, -4.75)], 0.55, 0, 0.05), St.cam.snap);
    else if (L.id === 'cane') { const b = V3(L.bx, 0, L.bz), sh = L.shake > 0 ? Math.sin(St.t * 60) * L.shake * 0.12 : 0; const ar = CW() / CH(), s = ar < 0.8 ? { pos: V3(L.bx - 1.1, 9.6, 1.2 + (L.bz - 1.2) * 0.6 + sh), look: V3(L.bx + 1.7, 0, 1.2 + (L.bz - 1.2) * 0.9 + sh * 0.5) } : { pos: V3(L.bx + 1.6 + sh, 7.2, 6.4), look: V3(L.bx + 1.6, 0, 0.9) }; shotCam(dt, s, St.cam.snap, 5); }
    else if (L.id === 'goal') shotCam(dt, shotFor('goal', () => [V3(5.0, 0, -2.4), V3(11.4, 0, -2.4), V3(8.2, 2.1, -2.5), V3(5.9, 1.7, -8.9), V3(10.5, 1.7, -8.9), V3(8.2, 0, -9.5)], portrait ? 0.98 : 0.92, 0, 0.04), St.cam.snap); }
  function introCam(dt) { const h = hope.position; shotCam(dt, shotFor('intro|' + h.x.toFixed(1) + h.z.toFixed(1), () => [V3(h.x - 1.4, 2.5, h.z - 0.2), V3(h.x + 1.4, 2.5, h.z - 0.2), V3(h.x, 0, h.z + 0.4), V3(-10.2, 2.7, -9.86), V3(-5.8, 2.7, -9.86), V3(-10.6, 0.9, -5.6), V3(-5.4, 0.9, -5.6)], 0.5, 0, 0.04), St.cam.snap, 2.5); }
  function reportCam(dt) { shotCam(dt, shotFor('report', () => [V3(-8, 2.3, -4.4), V3(-8, 0, -4.4), V3(-8, 2.1, -2.3), V3(-9.2, 1.2, -3.3), V3(-6.8, 1.2, -3.3)], 0.35, 0, 0.06), St.cam.snap, 2.5); }

  const clock = new THREE.Clock(); let raf = 0, dimV = 0;
  function step(dt) { St.t += dt;
    for (let i = timers.length - 1; i >= 0; i--) { const t = timers[i]; t.t -= dt; if (t.t <= 0) { timers.splice(i, 1); if (t.L === St.lesson) try { t.fn(); } catch (e) { console.warn('school timer', e); } } }
    if (St.toast) { St.toast.t -= dt; if (St.toast.t <= 0) St.toast = null; } if (St.say) { St.say.t -= dt; if (St.say.t <= 0) St.say = null; } if (St.kidLine) { St.kidLine.t -= dt; if (St.kidLine.t <= 0) St.kidLine = null; } if (St.flash) { St.flash.t -= dt; if (St.flash.t <= 0) St.flash = null; }
    if (St.listen > 0) St.listen -= dt; SOUNDS.forEach(s => { s.spr.visible = St.listen > 0 && St.mode === 'free'; if (s.spr.visible) { const p = s.pos(); s.spr.position.set(p.x, p.y + 2.4, p.z); s.spr.material.opacity = clamp(St.listen, 0, 1); } });
    const L = St.lesson;
    if (St.mode === 'free') { freeUpdate(dt); freeCam(dt, St.cam.snap); }
    else if (St.mode === 'lesson' && L) { if (L.id === 'braille') { kit.animFox(ben, dt, 0); sitFix(ben); } else if (L.id === 'art') { kit.animFox(ben, dt, 0); ben.userData.P.arms[1].rotation.x = -0.9; ben.userData.P.arms[0].rotation.x = -0.7; } else if (L.id === 'cane') caneUpdate(L, dt); else if (L.id === 'goal') { kit.animFox(ben, dt, 0); goalUpdate(L, dt); } if (L.id === 'art') artDraw(dt); lessonCam(dt); }
    else if (St.mode === 'intro') { kit.animFox(ben, dt, 0); if (!St.introFrom) { hope.position.set(SPOTS.hopeFront[0], 0, SPOTS.hopeFront[1] + 0.5); hope.rotation.y = 0; if ((St.t % 4) < 0.05) hope.userData.wave = 1.6; } introCam(dt); }
    else if (St.mode === 'report') { kit.animFox(ben, dt, 0); reportCam(dt); }
    npcUpdate(dt); St.cam.snap = false;
    camera.position.copy(St.cam.pos); camera.lookAt(camLook); const W = CW(), Hh = CH(); if (Math.abs(camera.aspect - W / Hh) > 1e-3) { camera.aspect = W / Hh; camera.updateProjectionMatrix(); }
    const focus = St.mode === 'free' ? ben.position : camLook; cutaway(dt, focus);
    // sleepshade darkness + vignette centred on Ben
    dimV = damp(dimV, St.mode === 'lesson' && St.dim ? St.dim : 0, 3, dt); hemi.intensity = 1.2 * (1 - 0.66 * dimV); sun.intensity = 1.5 * (1 - 0.8 * dimV); fill.intensity = 0.45 * (1 - 0.9 * dimV); K.lamps.forEach(l => l.material.emissiveIntensity = 0.9 * (1 - dimV)); scene.background.setRGB(0.106 * (1 - dimV), 0.09 * (1 - dimV), 0.078 * (1 - dimV));
    vigEl.style.opacity = (dimV * 0.92).toFixed(3); if (dimV > 0.01) { const f = L && L.id === 'cane' ? benCane : ben, v = V3(f.position.x, 1.0, f.position.z).project(camera); vigEl.style.background = `radial-gradient(ellipse ${L && L.id === 'goal' ? '95% 70%' : '70% 60%'} at ${((v.x + 1) * 50).toFixed(1)}% ${((1 - v.y) * 50).toFixed(1)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.85) 66%, #000 88%)`; }
    if (au.ctx) { if (SV.music && !au.mus) au.musicStart(); if (!SV.music && au.mus) au.musicStop(); const want = !SV.music ? 0 : St.mode === 'lesson' && L ? ({ braille: 0.32, art: 0.28, cane: 0, goal: 0 })[L.id] : St.mode === 'free' ? (St.room === 'music' ? 0.15 : 0.55) : 0.6; if (want !== St.musV) { St.musV = want; au.musicLevel(want); } }
    for (const b of foxBlobs) { const f = b.f; b.m.visible = f.visible; if (!f.visible) continue; const sc = f.scale.x, lift = Math.max(0, f.position.y); b.m.position.set(f.position.x, 0.016, f.position.z); b.m.scale.setScalar(sc * (1 - Math.min(0.5, lift * 0.4))); b.m.material.opacity = 0.42 * (1 - dimV * 0.6) * (1 - Math.min(0.6, lift * 0.5)); }
    marker.visible = St.mode === 'free' && hope.visible && !(St.near && St.near.id === 'hope') && !St.dialog; if (marker.visible) { marker.position.set(hope.position.x, 2.75 + Math.sin(St.t * 3) * 0.08, hope.position.z); marker.rotation.y += dt * 1.8; }
    for (const d of dust) { const p = d.p.position, k = St.t * 0.05 + d.ph; d.sp.position.set(p.x + (d.u - 0.5) * 1.4 + Math.sin(k * 1.7) * 0.15, d.h + Math.sin(k) * 0.25, p.z + (d.v - 0.5) * 1.4 + Math.cos(k * 1.3) * 0.15); d.sp.material.opacity = (0.35 + 0.35 * Math.sin(St.t * 0.8 + d.ph)) * (1 - dimV); }
    FX.sunPatches.forEach(pt => pt.material.opacity = 0.2 * (1 - dimV));
    rips.forEach(r => { if (r.t >= 1) { r.m.visible = false; return; } r.t = Math.min(1, r.t + dt / (r.life || 0.9)); r.m.scale.setScalar(0.15 + r.max * r.t); r.m.material.opacity = 0.9 * (1 - r.t); });
    if (St.dialog && St.dialog.lines) { /* dialog shows in the HUD */ } }
  let DTMAX = 0.05, lastW = 0, lastH = 0; function frame() { raf = requestAnimationFrame(frame); try { const dt = Math.min(DTMAX, clock.getDelta()); if (!St.paused) step(dt); if (mini) drawMini(); } catch (e) { if (!frame.err) { frame.err = 1; console.error('school update failed:', e && e.stack || e); } } if (CW() !== lastW || CH() !== lastH) { lastW = CW(); lastH = CH(); onRs(); } renderer.render(scene, camera); hudT -= 0.016; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); shotCache.clear(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- minimap (Game HUD MAP + PLAY WITH MINIMAP) ----------
  function drawMini() { const c = mini; if (!c.isConnected) return; const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (!w || !h) return; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext('2d'), k = Math.min(w / 28, h / 22), X = v => w / 2 + v * k, Y = v => h / 2 + v * k; x.fillStyle = '#0f1412'; x.fillRect(0, 0, w, h);
    for (const [id, r] of Object.entries(ROOMS)) { const [x0, x1, z0, z1] = r.b; x.fillStyle = id === St.room ? '#3a3226' : '#22201d'; x.fillRect(X(x0), Y(z0), (x1 - x0) * k, (z1 - z0) * k); x.strokeStyle = '#5a554f'; x.lineWidth = 1.5 * dpr; x.strokeRect(X(x0), Y(z0), (x1 - x0) * k, (z1 - z0) * k);
      x.fillStyle = '#cfcac4'; x.font = `800 ${Math.round(9 * dpr)}px Archivo, Arial`; x.textAlign = 'center'; x.fillText(r.name.toUpperCase(), X((x0 + x1) / 2), Y((z0 + z1) / 2)); }
    x.fillStyle = '#38bdf8'; x.beginPath(); x.arc(X(hope.position.x), Y(hope.position.z), 5 * dpr, 0, 7); x.fill();
    x.save(); x.translate(X(P.x), Y(P.z)); x.rotate(Math.PI - P.face); x.fillStyle = '#ec3013'; x.strokeStyle = '#fff'; x.lineWidth = 1.5 * dpr; x.beginPath(); const s = 8 * dpr; x.moveTo(0, -s); x.lineTo(s * 0.75, s * 0.8); x.lineTo(0, s * 0.4); x.lineTo(-s * 0.75, s * 0.8); x.closePath(); x.fill(); x.stroke(); x.restore(); }
  function mapData() { return { p: [P.x, P.z, P.face], indoor: true, b: Object.values(ROOMS).map(r => [r.name.toUpperCase(), (r.b[0] + r.b[1]) / 2, (r.b[2] + r.b[3]) / 2]), f: [hope, ...kids].filter(f => f.visible).map(f => [f.position.x, f.position.z]), e: [], q: [hope.position.x, hope.position.z, 'Hope'] }; }

  // ---------- input: keyboard + swipes on the 3D view ----------
  const BR_KEYS = { KeyF: 1, KeyD: 2, KeyS: 3, KeyJ: 4, KeyK: 5, KeyL: 6 }, keyT = {};
  function onKeyDown(e) { if (e.target && /input|textarea/i.test(e.target.tagName)) return; const L = St.lesson, c = e.code; au.init();
    if (St.mode === 'free') { St.keys.add(c); if (e.repeat) return; if (c === 'KeyE' || c === 'Enter') api.talk(); else if (c === 'Digit1') listen(); else if (c === 'Digit2') hello(); else if (c === 'Digit3' || c === 'Space') { e.preventDefault(); api.jump(); } else if (c === 'Escape' && St.dialog) closeDialog(); return; }
    if (St.mode !== 'lesson' || !L || St.demo) return; if (e.repeat) { if (/Arrow|Space/.test(c)) e.preventDefault(); return; }
    if (L.id === 'braille') { if (BR_KEYS[c]) { brDown(BR_KEYS[c]); e.preventDefault(); } else if (c === 'Space' || c === 'Enter') { e.preventDefault(); brEmboss(); } else if (c === 'Backspace') brErase(); else if (c === 'KeyH') brHint(); }
    else if (L.id === 'art') { const i = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(c); if (i >= 0 && L.choices) artPick(L.choices[i]); }
    else if (L.id === 'cane') { if (c === 'ArrowLeft' || c === 'KeyA' || c === 'ArrowRight' || c === 'KeyD') { keyT[c] = performance.now(); e.preventDefault(); } else if (c === 'KeyQ' || c === 'ArrowUp') { e.preventDefault(); caneSide(-1); } else if (c === 'KeyE' || c === 'ArrowDown') { e.preventDefault(); caneSide(1); } }
    else if (L.id === 'goal') { const lane = { ArrowLeft: 0, KeyA: 0, ArrowDown: 1, KeyS: 1, Space: 1, ArrowUp: 1, KeyW: 1, ArrowRight: 2, KeyD: 2 }[c]; if (lane != null) { e.preventDefault(); goalDive(lane); } } }
  function onKeyUp(e) { const c = e.code, L = St.lesson; St.keys.delete(c); if (St.mode !== 'lesson' || !L || St.demo) return; if (L.id === 'braille' && BR_KEYS[c]) brUp(BR_KEYS[c]);
    if (L.id === 'cane' && keyT[c]) { const dur = (performance.now() - keyT[c]) / 1000; delete keyT[c]; caneSweep(/Left|KeyA/.test(c) ? -1 : 1, clamp(dur / 0.28, 0.3, 1)); } }
  const firstTouch = () => { au.init(); St.musV = -1; }; addEventListener('pointerdown', firstTouch, true); addEventListener('keydown', firstTouch, true);
  addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp); const blurK = () => St.keys.clear(); addEventListener('blur', blurK);
  const cvs = renderer.domElement, sw = { id: null, x: 0, y: 0, t: 0, lx: 0, ly: 0 };
  cvs.addEventListener('pointerdown', e => { au.init(); sw.id = e.pointerId; sw.x = sw.lx = e.clientX; sw.y = sw.ly = e.clientY; sw.t = performance.now(); try { cvs.setPointerCapture(e.pointerId); } catch (er) {} });
  cvs.addEventListener('pointermove', e => { if (sw.id !== e.pointerId) return; if (St.mode === 'free' && !St.hudPad && (e.buttons & 1)) api.lookBy(e.clientX - sw.lx, e.clientY - sw.ly); sw.lx = e.clientX; sw.ly = e.clientY; });
  cvs.addEventListener('pointerup', e => { if (sw.id !== e.pointerId) return; sw.id = null; const L = St.lesson; if (St.mode !== 'lesson' || !L || St.demo) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y, ad = Math.hypot(dx, dy), W = CW();
    if (L.id === 'cane') { if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 0.8) caneSweep(Math.sign(dx), clamp(Math.abs(dx) / (W * 0.48), 0.2, 1)); else if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) caneSide(dy < 0 ? -1 : 1); }
    else if (L.id === 'goal') { if (L.phase === 'attack') { if (dy < -30) { const a = Math.atan2(dx, -dy); goalThrow(a < -0.3 ? 0 : a > 0.3 ? 2 : 1); } }
      else if (ad < 18 || dy > 30 && Math.abs(dy) > Math.abs(dx)) goalDive(1); else if (Math.abs(dx) > 30) goalDive(dx < 0 ? 0 : 2); } });

  // ---------- items (Game HUD bag) ----------
  function useItem(id) { if (id === 'chocolates' && save.take('chocolates')) { toast('You share the chocolates with the class. Instant best friends.'); kids.forEach(k => k.userData.hop = 1); au.ding(); } else if (save.count(id) > 0) toast('Save it for the field. Nothing hurts in school, except maybe a bump in the hall.'); else toast('Nothing to use.'); emit(); }

  // =====================================================================================
  //  DEMO (autopilot, nothing saved)
  // =====================================================================================
  async function demoRun(D) { const W = ms => new Promise(r => setTimeout(r, ms)), ok = () => St.demo === D, cap = (c, key = '', n) => { D.cap = c; D.key = key; if (n) D.n = n; emit(); };
    try {
      cap("HOPE'S CLASS · four lessons. Here's a quick look.", '', 1); await W(2200); if (!ok()) return;
      fade(() => startLesson('braille', { demo: true })); await W(4600); if (!ok()) return; const L1 = St.lesson; L1.ready = true; timers.length = 0; say('Write: BAD. B, A, D.');
      cap('BRAILLE · press dots 1 + 2 together = B', '1 + 2'); await W(1200); brDown(1); brDown(2); await W(450); brUp(1); brUp(2); await W(1500); if (!ok()) return;
      cap('A = dot 1. Tap it, then EMBOSS', '1'); brDown(1); await W(250); brUp(1); await W(800); brEmboss(); await W(1400); if (!ok()) return;
      cap('D = dots 1 + 4 + 5 together', '1 + 4 + 5'); brDown(1); brDown(4); brDown(5); await W(450); brUp(1); brUp(4); brUp(5); await W(3200); if (!ok()) return;
      cap('TOUCH ART · eyes shut, feel the raised lines', 'DRAG', 2); fade(() => startLesson('art', { demo: true })); await W(4200); if (!ok()) return; timers.length = 0;
      { const S2 = St.lesson.samp; for (let i = 0; i < S2.length && ok(); i += 3) { const p = S2[i]; artFinger(p[0] + 0.004, p[1], true); await W(22); } artFinger(0.5, 0.5, false); }
      if (!ok()) return; cap('It buzzes + hums on the line. Now name it.', 'FISH'); await W(1200); artPick('FISH'); await W(3200); if (!ok()) return;
      cap('CANE WALK · swipe across = sweep the cane + one step', 'SWIPE', 3); fade(() => startLesson('cane', { demo: true })); await W(4000); if (!ok()) return; { const L = St.lesson; timers.length = 0; L.ready = true; let dir = 1;
        for (let i = 0; i < 12 && ok() && L.bx < -5.4; i++) { if (L.blocked) { cap('The cane found something. Step around it', 'STEP ▶'); caneSide(L.lane < 2 ? 1 : -1); await W(900); cap('Sweep + step, left, right, left', 'SWIPE'); } else { caneSweep(dir, 1); dir = -dir; } await W(760); } }
      if (!ok()) return; cap('GOALBALL · the ball has bells. Listen, then dive', '◀ ▶', 4); fade(() => startLesson('goal', { demo: true })); await W(3800); if (!ok()) return; { const L = St.lesson; timers.length = 0; au.whistle(); goalDefend();
        while (ok() && !(L.phase === 'roll' && L.bt > L.T - 0.5)) await W(40); if (!ok()) return; cap('The bells end up on this side: DIVE!', ['◀', 'BLOCK', '▶'][L.te]); goalDive(L.te); await W(1600);
        while (ok() && L.phase !== 'attack') await W(60); if (!ok()) return; cap('Two Owls are tapping. Throw at the QUIET lane', ['◀', '▲', '▶'][L.open]); await W(1700); goalThrow(L.open); await W(2600); }
      if (!ok()) return; cap("That's the day! Now you try.", ''); await W(1800); if (ok()) demoStop();
    } catch (e) { console.warn('demo', e); if (ok()) demoStop(); } }
  function demoStart() { au.init(); const D = { cap: '', key: '', n: 1, of: 4 }; St.demo = D; St.result = null; St.report = null; St.run = null; demoRun(D); emit(); }
  function demoStop() { St.demo = null; timers.length = 0; voice.stop(); au.hum(false); St.lesson = null; toIntro(); }
  function toIntro() { fade(() => { St.lesson = null; St.dim = 0; placeFree(); St.introFrom = null; P.x = -5.6; P.z = -4.6; P.face = Math.PI + 0.5; ben.position.set(P.x, 0, P.z); ben.rotation.y = P.face; St.mode = 'intro'; St.result = null; St.report = null; St.say = null; St.cam.snap = true; emit(); }); }
  function explore() { au.init(); voice.stop(); if (St.introFrom === 'hope') { St.mode = 'free'; St.introFrom = null; hope.userData.lookAt = null; emit(); return; } fade(() => { placeFree(); P.x = -8; P.z = -1.7; P.face = Math.PI; St.yaw = 0; St.mode = 'free'; St.cam.snap = true; emit(); if (!SV.toldListen) { SV.toldListen = true; persist(); toast('Tip: press 1 LISTEN to hear where things are. Hope is at the front of the classroom.', 5); } }); }

  // ---------- HUD ----------
  function lessonHud(L) { const base = { id: L.id, name: NAMES[L.id], practice: L.practice, demo: L.demo, over: L.over };
    if (L.id === 'braille') return { ...base, ...brHud(L) }; if (L.id === 'art') return { ...base, n: Math.min(L.pi + 1, L.pics.length), of: L.pics.length, choices: (L.choices || []).map(c => ({ name: c, wrong: L.wrong.includes(c), right: L.phase === 'reveal' && c === PICTURES[L.pic].name })), felt: Math.round((L.cover || 0) * 100), phase: L.phase };
    if (L.id === 'cane') return { ...base, ...caneHud(L) }; return { ...base, ...goalHud(L) }; }
  function hud() { const L = St.lesson, d = St.dialog, rm = ROOMS[St.room] ? ROOMS[St.room].name : St.room === 'out' ? 'Front steps' : 'Lobby';
    return { mode: St.mode, day: SV.day, days: SV.days, gold: save.data.gold, room: St.room, place: 'Meru · School · ' + rm, touch,
      prompt: St.mode === 'free' && !d && St.near ? St.near.label : null, dialog: d ? { name: d.name, role: d.role, text: d.lines[d.i], step: d.i + 1, total: d.lines.length } : null, toast: St.toast ? St.toast.text : null,
      quest: { text: St.mode === 'free' ? (St.room === 'class' ? 'Talk to HOPE to start the school day' : 'Find HOPE in the CLASSROOM (north-west)') : '' },
      say: St.say ? { name: St.say.name, role: St.say.role, text: St.say.text } : null, kid: St.kidLine ? { name: St.kidLine.name, text: St.kidLine.text } : null,
      lesson: L ? lessonHud(L) : null, run: St.run ? { i: St.run.i, of: St.run.order.length, stars: St.run.stars.slice() } : null, between: St.between, result: St.result, report: St.report,
      demo: St.demo ? { cap: St.demo.cap, key: St.demo.key, n: St.demo.n, of: St.demo.of } : null, flash: St.flash ? { txt: St.flash.txt, col: St.flash.col } : null,
      best: { ...SV.best }, gallery: SV.gallery.length, voice: SV.voice, music: SV.music, muted: au.muted, listening: St.listen > 0, introFrom: St.introFrom || null }; }

  // ---------- go ----------
  try { const c = JSON.parse(localStorage.getItem('meru.schoolCam.v1') || 'null'); if (c && c.dist) { St.dist = clamp(c.dist, 3, 13); St.pitch = clamp(c.pitch, 0.08, 1.25); } } catch (e) {}
  placeFree(); galleryDraw(); P.x = -5.6; P.z = -4.6; P.face = Math.PI + 0.5; ben.position.set(P.x, 0, P.z); ben.rotation.y = P.face; St.mode = 'intro'; St.cam.snap = true; save.where('meru', SCHOOL.room);
  frame();
  const api = window.__school = {
    // standard HUD contract (Game HUD.dc.html)
    start() { au.init(); }, setStick(x, y) { St.jx = x; St.jy = y; }, setHudPad(on) { St.hudPad = !!on; }, setPaused(on) { St.paused = !!on; if (on) { St.jx = St.jy = 0; St.keys.clear(); } },
    talk() { au.init(); if (St.dialog) return api.nextLine(); if (St.near) St.near.act(); }, nextLine() { const d = St.dialog; if (!d) return; if (d.i < d.lines.length - 1) { d.i++; au.tone(900, 0.03, 0.03, 'square'); emit(); } else closeDialog(); },
    closeDialog, choose() {}, clearToast() { St.toast = null; emit(); }, closeWheel() {}, skipTime() {}, cycleWeather() {}, useItem,
    toggleSound() { au.setMuted(!au.muted); if (au.muted) voice.stop(); St.musV = -1; emit(); return au.muted; },
    melee() { au.init(); if (St.mode === 'free') listen(); }, range() { au.init(); if (St.mode === 'free') hello(); }, jump() { if (St.mode === 'free' && P.y <= 0.001) { P.vy = 4.8; ben.userData.hop = 1; au.tone(500, 0.08, 0.04, 'triangle', 0, 1.6); } },
    eyeLook(dx, dy) { if (!St.eye0) St.eye0 = { yaw: St.yaw, pitch: St.pitch }; St.yaw -= dx * 0.008; St.pitch = clamp(St.pitch + dy * 0.0064, 0.08, 1.25); }, eyeRelease() { if (St.eye0) { St.yaw = St.eye0.yaw; St.pitch = St.eye0.pitch; St.eye0 = null; } },
    togglePov() { St.pov = !St.pov; return St.pov; }, lookBy(dx, dy) { St.yaw -= dx * 0.006; St.pitch = clamp(St.pitch + dy * 0.0048, 0.08, 1.25); }, zoomBy(f) { St.dist = clamp(St.dist * f, 3, 13); },
    getCam() { return { dist: St.dist, pitch: St.pitch }; }, setCam(d, p, lock) { if (d != null) St.dist = clamp(d, 3, 13); if (p != null) St.pitch = clamp(p, 0.08, 1.25); if (lock) { try { localStorage.setItem('meru.schoolCam.v1', JSON.stringify({ dist: St.dist, pitch: St.pitch })); } catch (e) {} } },
    mapData, setMinimap(c) { mini = c || null; },
    // the school
    hud, setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; shotCache.clear(); } }, setArtHost,
    startDay() { St.report = null; St.result = null; startDay(); }, practice(id) { au.init(); St.report = null; practice(id); }, explore, toIntro, leaveLesson, toFree: () => toFree(),
    brDown, brUp, brEmboss, brErase, brHint, artPick, caneSweep, caneSide, goalDive, goalThrow,
    musicToggle() { au.init(); SV.music = !SV.music; persist(); St.musV = -1; emit(); }, voiceToggle() { SV.voice = !SV.voice; persist(); if (!SV.voice) voice.stop(); emit(); }, demoStart, demoStop,
    resultAgain() { const id = St.result && St.result.id; St.result = null; if (id) practice(id); }, resultDone() { St.result = null; toFree(); },
    reportDone() { St.report = null; St.mode = 'free'; St.cam.snap = true; emit(); }, nextDay() { St.report = null; startDay(); },
    attach(el) { if (!el || (el === container && renderer.domElement.parentNode === el)) return; container = el; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; [renderer.domElement, fadeEl, vigEl].forEach(n => el.appendChild(n)); try { ro.disconnect(); ro.observe(el); } catch (e) {} lastW = -1; },
    _st: St, _skipTo(id) { practice(id); }, _speed(k) { DTMAX = k; }, _dbg() { return { cam: St.cam.pos.toArray().map(v => +v.toFixed(2)), look: camLook.toArray().map(v => +v.toFixed(2)), SAFE: { ...SAFE }, W: CW(), H: CH() }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); removeEventListener('blur', blurK); removeEventListener('pointerdown', firstTouch, true); removeEventListener('keydown', firstTouch, true); au.musicStop(); ro.disconnect(); voice.stop(); try { au.ctx && au.ctx.close(); } catch (e) {} renderer.dispose(); [renderer.domElement, fadeEl, vigEl].forEach(el => el.parentNode && el.parentNode.removeChild(el)); if (artCv && artCv.parentNode) artCv.parentNode.removeChild(artCv); },
  };
  emit();
  return api;
}
