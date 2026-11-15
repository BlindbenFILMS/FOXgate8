// s730 ARMOUR CRESTS (Ben: a unique crest for the MANTIS armour + every unique armour). One round medallion per set (CREST rules: same
// shape, only symbol + colours change, NO planet letters). dressArmor swaps the chest crest decal for crestCanvas(set). The 8 ARMOUR keeps its 8.
// CRESTS[id] = [rim, field, symbol ink, draw(g, ink, field)] on a 256 canvas, centre 128.
const P = (g, pts, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); };
const C = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };
export const CRESTS = {
  mantis: ['#e9e1bf', '#1c2b22', '#e9e1bf', (g, k) => {   // two crossed scythe blades (crescents) under the triangle mantis head with amber eyes
    for (const s of [-1, 1]) { g.save(); g.translate(128 + s * 6, 140); g.rotate(-s * 0.55); g.fillStyle = k;
      g.beginPath(); g.moveTo(-9, 70); g.lineTo(9, 70); g.lineTo(10, -20); g.bezierCurveTo(14, -60, -s * 30, -78, -s * 52, -62); g.bezierCurveTo(-s * 30, -60, -s * 8, -46, -10, -20); g.closePath(); g.fill();
      g.fillStyle = '#1c2b22'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-10, 40 - i * 22); g.lineTo(-20, 32 - i * 22); g.lineTo(-10, 28 - i * 22); g.fill(); } g.restore(); }
    g.fillStyle = '#2f6d4a'; P(g, [[82, 76], [174, 76], [128, 136]]); g.fill(); g.strokeStyle = k; g.lineWidth = 7; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = '#f5a524'; for (const s of [-1, 1]) { C(g, 128 + s * 26, 90, 12); g.fill(); }
    g.strokeStyle = k; g.lineWidth = 5; g.lineCap = 'round'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 + s * 8, 76); g.quadraticCurveTo(128 + s * 18, 46, 128 + s * 42, 34); g.stroke(); } }],
  alien: ['#c9ccd8', '#1a1626', '#4ff0ff', (g, k) => {   // a glowing core with three tilted orbits + a pearl moon on each, a circuit trace ring
    g.strokeStyle = '#5a3d8f'; g.lineWidth = 3; C(g, 128, 128, 92); g.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.lineTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); g.stroke(); }
    g.strokeStyle = k; g.lineWidth = 4; for (const r of [0, 1.05, 2.1]) { g.beginPath(); g.ellipse(128, 128, 78, 26, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#e9e6f2'; for (const [r, t] of [[0, 0.6], [1.05, 2.4], [2.1, 4.2]]) { const x = Math.cos(t) * 78, y = Math.sin(t) * 26; C(g, 128 + x * Math.cos(r) - y * Math.sin(r), 128 + x * Math.sin(r) + y * Math.cos(r), 9); g.fill(); }
    const gr = g.createRadialGradient(128, 128, 2, 128, 128, 30); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, k); gr.addColorStop(1, 'rgba(79,240,255,0)'); g.fillStyle = gr; C(g, 128, 128, 30); g.fill(); }],
  gorilla: ['#f2b705', '#16181b', '#f2b705', (g, k) => {   // a raised gorilla fist in front of a gear, an orange reactor dot, hazard stripes along the bottom
    g.save(); g.beginPath(); g.arc(128, 128, 106, 0, Math.PI * 2); g.clip(); g.fillStyle = '#f2b705'; g.fillRect(0, 190, 256, 66); g.fillStyle = '#16181b'; for (let x = -40; x < 300; x += 26) { g.beginPath(); g.moveTo(x, 190); g.lineTo(x + 13, 190); g.lineTo(x - 13, 256); g.lineTo(x - 26, 256); g.fill(); } g.restore();
    g.fillStyle = '#3a3e45'; g.save(); g.translate(128, 112); for (let i = 0; i < 10; i++) { g.rotate(Math.PI / 5); g.fillRect(-10, -76, 20, 20); } g.restore(); C(g, 128, 112, 62); g.fill(); g.fillStyle = '#16181b'; C(g, 128, 112, 46); g.fill();
    g.fillStyle = k; g.beginPath(); g.moveTo(98, 170); g.lineTo(98, 120); g.quadraticCurveTo(98, 76, 132, 76); g.lineTo(158, 80); g.quadraticCurveTo(170, 84, 166, 102); g.lineTo(164, 128); g.quadraticCurveTo(160, 150, 150, 170); g.closePath(); g.fill();
    g.strokeStyle = '#16181b'; g.lineWidth = 4; for (const y of [96, 112, 128]) { g.beginPath(); g.moveTo(112, y); g.lineTo(164, y + 2); g.stroke(); } g.fillStyle = '#ff7a1a'; C(g, 128, 52, 9); g.fill(); }],
  bear: ['#7cf2a0', '#24160c', '#c89a62', (g, k) => {   // a log end (growth rings) torn by three claw slashes, a green rune in the heart
    g.fillStyle = k; C(g, 128, 128, 86); g.fill(); g.strokeStyle = '#6b4326'; for (let r = 14; r < 86; r += 11) { g.lineWidth = 3 + (r % 3); C(g, 128, 128, r); g.stroke(); }
    g.fillStyle = '#24160c'; for (let i = -1; i <= 1; i++) { g.save(); g.translate(128 + i * 30, 128); g.rotate(-0.5); g.beginPath(); g.moveTo(-6, -82); g.quadraticCurveTo(10, 0, -4, 82); g.quadraticCurveTo(-14, 0, -6, -82); g.fill(); g.restore(); }
    g.fillStyle = '#7cf2a0'; C(g, 128, 128, 18); g.fill(); g.strokeStyle = '#0d2a18'; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 116); g.lineTo(128, 140); g.moveTo(128, 126); g.lineTo(138, 116); g.moveTo(128, 132); g.lineTo(118, 122); g.stroke(); }],
  eagle: ['#c3ccd6', '#2a2228', '#c3ccd6', (g, k) => {   // a gryphon head in profile (steel, crimson eye ring) over a lightning bolt
    g.fillStyle = '#9fe8ff'; P(g, [[150, 40], [104, 128], [130, 128], [98, 214], [170, 112], [142, 112], [176, 40]]); g.fill();
    g.fillStyle = k; g.beginPath(); g.arc(118, 120, 46, 0, Math.PI * 2); g.fill(); P(g, [[72, 112], [96, 70], [92, 104]]); g.fill(); P(g, [[78, 132], [64, 92], [98, 122]]); g.fill();
    g.fillStyle = '#e6b45a'; g.beginPath(); g.moveTo(150, 100); g.quadraticCurveTo(200, 104, 202, 140); g.quadraticCurveTo(196, 158, 184, 160); g.quadraticCurveTo(188, 140, 160, 138); g.closePath(); g.fill();
    g.fillStyle = '#8e1b2a'; C(g, 134, 112, 12); g.fill(); g.fillStyle = '#2a2228'; C(g, 136, 112, 6); g.fill(); g.fillStyle = '#8e1b2a'; P(g, [[90, 150], [140, 150], [120, 170], [100, 168]]); g.fill(); }],
  lizard: ['#c87533', '#3a2418', '#d9b382', (g, k) => {   // a stepped sun (copper rays) with a turquoise heart and a sandstone lizard curled across it
    g.fillStyle = '#c87533'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.save(); g.translate(128, 128); g.rotate(a); g.fillRect(-9, -96, 18, 26); g.fillRect(-5, -104, 10, 10); g.restore(); }
    g.fillStyle = '#2ec4b6'; C(g, 128, 128, 66); g.fill(); g.strokeStyle = '#3a2418'; g.lineWidth = 5; C(g, 128, 128, 58); g.stroke();
    g.strokeStyle = k; g.lineCap = 'round'; g.lineWidth = 16; g.beginPath(); g.moveTo(92, 98); g.bezierCurveTo(140, 92, 110, 150, 150, 156); g.stroke(); g.lineWidth = 9; g.beginPath(); g.moveTo(150, 156); g.quadraticCurveTo(178, 158, 170, 132); g.stroke();
    g.fillStyle = k; g.beginPath(); g.ellipse(84, 96, 18, 12, -0.3, 0, Math.PI * 2); g.fill(); g.lineWidth = 6;
    for (const [x0, y0, x1, y1] of [[112, 104, 120, 86], [104, 112, 90, 124], [126, 140, 146, 132], [128, 148, 120, 166]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.fillStyle = '#e0702a'; g.beginPath(); g.moveTo(80, 86); g.quadraticCurveTo(92, 66, 112, 88); g.closePath(); g.fill(); g.fillStyle = '#3a2418'; C(g, 78, 93, 3.5); g.fill(); }],
  fly: ['#d9a93e', '#151a22', '#f3f2f2', (g, k) => {   // a winged racing roundel: red + white target, two swept iridescent wings
    for (const s of [-1, 1]) { const gr = g.createLinearGradient(128, 0, 128 + s * 110, 0); gr.addColorStop(0, '#3fe0d0'); gr.addColorStop(1, '#8a5ae0'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(128 + s * 30, 112); g.quadraticCurveTo(128 + s * 80, 70, 128 + s * 112, 84); g.quadraticCurveTo(128 + s * 90, 104, 128 + s * 100, 118); g.quadraticCurveTo(128 + s * 70, 128, 128 + s * 86, 146); g.quadraticCurveTo(128 + s * 56, 150, 128 + s * 30, 144); g.closePath(); g.fill();
      g.strokeStyle = '#151a22'; g.lineWidth = 3; for (const y of [104, 124]) { g.beginPath(); g.moveTo(128 + s * 36, y + 6); g.lineTo(128 + s * 92, y); g.stroke(); } }
    [[40, k], [29, '#c0261c'], [16, k], [7, '#c0261c']].forEach(([r, col]) => { g.fillStyle = col; C(g, 128, 128, r); g.fill(); }); }],
  bee: ['#e0a82e', '#1a120a', '#e0a82e', (g, k) => {   // a honeycomb of 7 cells, the middle one full of honey with a drip, a little crown on top
    const hx = (x, y, r) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); };
    const r = 26, dx = r * Math.sqrt(3), cy = 136; g.lineWidth = 6; g.strokeStyle = k; g.lineJoin = 'round';
    for (const [x, y] of [[0, 0], [dx, 0], [-dx, 0], [dx / 2, -r * 1.5], [-dx / 2, -r * 1.5], [dx / 2, r * 1.5], [-dx / 2, r * 1.5]]) { hx(128 + x, cy + y, r - 2); g.fillStyle = (x || y) ? '#3a2614' : '#ffb020'; g.fill(); g.stroke(); }
    g.fillStyle = '#ffb020'; g.beginPath(); g.moveTo(120, cy + 20); g.quadraticCurveTo(128, cy + 60, 128, cy + 64); g.quadraticCurveTo(128, cy + 60, 136, cy + 20); g.fill(); C(g, 128, cy + 62, 7); g.fill();
    g.fillStyle = k; P(g, [[104, 82], [104, 62], [116, 72], [128, 54], [140, 72], [152, 62], [152, 82]]); g.fill(); }],
  reinf: ['#a3cdff', '#3a434f', '#eeeff2', (g, k) => {   // a riveted kite shield with a cross band
    g.fillStyle = k; P(g, [[78, 64], [178, 64], [178, 130], [128, 196], [78, 130]]); g.fill(); g.fillStyle = '#3a434f'; g.fillRect(120, 70, 16, 116); g.fillRect(84, 112, 88, 14);
    g.fillStyle = '#a3cdff'; for (const [x, y] of [[92, 78], [164, 78], [92, 140], [164, 140], [128, 186]]) { C(g, x, y, 6); g.fill(); } }],
  meru: ['#e6b45a', '#121838', '#e6b45a', (g, k) => {   // the royal crown of King Might's house over a laurel arc
    g.fillStyle = k; P(g, [[72, 150], [72, 88], [100, 118], [128, 74], [156, 118], [184, 88], [184, 150]]); g.fill(); g.fillRect(72, 156, 112, 16);
    g.fillStyle = '#121838'; for (const x of [100, 128, 156]) { C(g, x, 140, 7); g.fill(); } g.fillStyle = k; for (const [x, y] of [[72, 82], [128, 66], [184, 82]]) { C(g, x, y, 9); g.fill(); }
    g.strokeStyle = k; g.lineWidth = 5; g.beginPath(); g.arc(128, 128, 78, 0.55, Math.PI - 0.55); g.stroke(); }],
  luxor: ['#ff6a2a', '#161213', '#ff6a2a', (g, k) => {   // a basalt volcano with an ember plume
    g.fillStyle = '#3a3436'; P(g, [[58, 186], [108, 100], [148, 100], [198, 186]]); g.fill(); g.strokeStyle = k; g.lineWidth = 6; g.stroke();
    g.fillStyle = k; P(g, [[108, 100], [148, 100], [138, 130], [128, 116], [116, 136]]); g.fill();
    for (const [x, y, r] of [[128, 76, 12], [110, 56, 8], [148, 50, 9], [124, 36, 6]]) { C(g, x, y, r); g.fill(); } }],
  gaya: ['#9fe6ff', '#3a1f6a', '#9fe6ff', (g, k) => {   // a cut crystal with facets
    g.fillStyle = k; P(g, [[128, 52], [176, 96], [158, 196], [98, 196], [80, 96]]); g.fill();
    g.strokeStyle = '#6e40b0'; g.lineWidth = 5; P(g, [[80, 96], [128, 118], [176, 96]], false); g.stroke(); P(g, [[128, 52], [128, 118], [128, 196]], false); g.stroke(); P(g, [[98, 196], [128, 118], [158, 196]], false); g.stroke(); }],
  ur: ['#3a6fd0', '#5a2814', '#f3e2c8', (g, k) => {   // a big paw print (Ur's zoo + menagerie)
    g.fillStyle = k; g.beginPath(); g.ellipse(128, 150, 42, 34, 0, 0, Math.PI * 2); g.fill();
    for (const [x, y, r] of [[84, 104, 16], [110, 80, 17], [146, 80, 17], [172, 104, 16]]) { g.beginPath(); g.ellipse(x, y, r * 0.85, r, 0, 0, Math.PI * 2); g.fill(); } }],
  zion: ['#ffd23a', '#5a3e14', '#ffd23a', (g, k) => {   // a cog with a gold nugget in the hub
    g.fillStyle = k; g.save(); g.translate(128, 128); for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.fillRect(-12, -78, 24, 26); } g.restore(); C(g, 128, 128, 58); g.fill();
    g.fillStyle = '#5a3e14'; C(g, 128, 128, 32); g.fill(); g.fillStyle = '#ffd23a'; P(g, [[112, 132], [120, 112], [140, 110], [148, 128], [136, 146], [118, 146]]); g.fill(); }],
  nebo: ['#f2c84a', '#1f3418', '#f2c84a', (g, k) => {   // an oak tree with roots
    g.fillStyle = k; for (const [x, y, r] of [[128, 82, 34], [96, 104, 28], [160, 104, 28], [128, 116, 30]]) { C(g, x, y, r); g.fill(); }
    g.fillRect(118, 120, 20, 56); g.lineWidth = 8; g.strokeStyle = k; g.lineCap = 'round'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128, 170); g.quadraticCurveTo(128 + s * 20, 182, 128 + s * 44, 188); g.stroke(); } }],
  kufa: ['#2ab0c8', '#7a5a30', '#f3e2c8', (g, k) => {   // a desert sun over two dunes
    g.fillStyle = '#2ab0c8'; C(g, 128, 112, 30); g.fill(); g.strokeStyle = '#2ab0c8'; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = -Math.PI + i * Math.PI / 7; g.beginPath(); g.moveTo(128 + Math.cos(a) * 42, 112 + Math.sin(a) * 42); g.lineTo(128 + Math.cos(a) * 58, 112 + Math.sin(a) * 58); g.stroke(); }
    g.fillStyle = k; g.beginPath(); g.moveTo(40, 190); g.quadraticCurveTo(100, 120, 160, 190); g.fill(); g.beginPath(); g.moveTo(110, 196); g.quadraticCurveTo(170, 140, 220, 196); g.fill(); }],
  shasta: ['#8fd8ff', '#3a4f66', '#e9f2f8', (g, k) => {   // a six-arm snowflake
    g.strokeStyle = k; g.lineWidth = 10; g.lineCap = 'round'; g.save(); g.translate(128, 128);
    for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -70); g.moveTo(0, -42); g.lineTo(-18, -58); g.moveTo(0, -42); g.lineTo(18, -58); g.stroke(); } g.restore(); }],
  jidda: ['#2ad4d0', '#1f6a80', '#e9fbff', (g, k) => {   // a curling wave over a swell
    g.fillStyle = k; g.beginPath(); g.moveTo(52, 170); g.bezierCurveTo(70, 90, 160, 60, 190, 110); g.bezierCurveTo(160, 92, 128, 110, 140, 140); g.bezierCurveTo(110, 130, 96, 160, 120, 176); g.closePath(); g.fill();
    g.strokeStyle = '#2ad4d0'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(56, 192); g.bezierCurveTo(96, 176, 140, 206, 200, 186); g.stroke(); }],
  eva: ['#c9ced6', '#0b1430', '#f4f5f7', (g, k) => {   // a planet with an orbit ring + a star
    g.fillStyle = k; C(g, 128, 132, 40); g.fill(); g.strokeStyle = '#ff8a2a'; g.lineWidth = 7; g.beginPath(); g.ellipse(128, 132, 74, 22, -0.35, 0, Math.PI * 2); g.stroke();
    g.fillStyle = k; g.save(); g.translate(176, 70); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); P(g, [[0, -16], [4, -4], [0, 0], [-4, -4]]); g.fill(); } g.restore(); }],
  dive: ['#ffd23a', '#0c121c', '#fbf4ea', (g, k) => {   // an open shell holding a pearl
    g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(60, 150); g.quadraticCurveTo(128, 40, 196, 150); g.closePath(); g.fill();
    g.strokeStyle = '#0c121c'; g.lineWidth = 5; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(128, 150); g.lineTo(128 + i * 28, 82 + Math.abs(i) * 14); g.stroke(); }
    g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(60, 156); g.quadraticCurveTo(128, 210, 196, 156); g.closePath(); g.fill(); g.fillStyle = k; C(g, 128, 152, 20); g.fill(); }],
};
const cache = {};
// a 256 canvas: blue outer band (matches the fox-kit crest decal edge), the set's rim, its field + the symbol
export function crestCanvas(id) {
  if (cache[id]) return cache[id]; const D = CRESTS[id]; if (!D || typeof document === 'undefined') return null; const [rim, field, ink, draw] = D;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = field; g.fillRect(0, 0, 256, 256); g.fillStyle = rim; C(g, 128, 128, 126); g.fill(); g.fillStyle = field; C(g, 128, 128, 108); g.fill();
  g.strokeStyle = rim; g.globalAlpha = 0.35; g.lineWidth = 3; C(g, 128, 128, 98); g.stroke(); g.globalAlpha = 1;
  g.save(); C(g, 128, 128, 106); g.clip(); draw(g, ink, field); g.restore(); return (cache[id] = c);
}
export const crestURL = id => { const c = crestCanvas(id); return c ? c.toDataURL() : ''; };
