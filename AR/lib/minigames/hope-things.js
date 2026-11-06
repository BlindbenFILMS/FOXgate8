// HOPE IS NOT LOST (Ricky Ruzicka): the drawn props for "Fly to the light".
// Drawn in code, lit like the painting (soft warm dawn light from the right, peach and sky-blue clouds).
// The floating island itself is cut out of the painting: media/games/hope/island.png over sky.jpg (the clouds behind it).
//   thingCanvas(kind, size) → a square canvas:
//     'storm'  a towering dark storm cloud, lit by the dawn on its right edge, with rain curtains underneath
//     'flash', 'flash1', 'flash2'  three different lightning strikes: the cloud lit from inside and a branching bolt (drawn over 'storm')
//     'chime'  the wind chime of the dawn: golden tubes ringing in a glow of light (what you steer toward)
//     'sun'    the rising sun with soft rays (grows as the storms pass)
//     'wisp'   a puff of white mist streaming off the island as it flies
//     'spark'  a four-point twinkle of light

// a little seeded random, so each prop is drawn the same way every time
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// the storm's billows: a towering cumulonimbus, flat-ish at the base, piled up high, lit by the dawn from the upper right
function puffs() {
  const r = rng(11), P = [];
  // the outline of the whole cloud (how high it piles up at each point across), then lots of small soft billows inside it
  const top = x => 0.58 - 0.4 * Math.exp(-Math.pow((x - 0.5) / 0.17, 2)) - 0.08 * Math.exp(-Math.pow((x - 0.3) / 0.1, 2)) - 0.1 * Math.exp(-Math.pow((x - 0.68) / 0.09, 2));
  for (let i = 0; i < 170; i++) {
    const x = 0.17 + r() * 0.66, t = top(x), y = t + 0.04 + r() * (0.6 - t - 0.04);
    const edge = Math.min(1, (y - t) / 0.08);             // billows near the top edge are smaller, so the edge is lumpy
    P.push([x, y, 0.035 + r() * 0.04 + 0.03 * edge * r(), edge]);
  }
  return P.sort((a, b) => b[1] - a[1]);                    // paint the low ones first, so the lit tops sit on top
}
const PUFFS = puffs();

function storm(g, S) {
  const r = rng(5);
  // rain curtains: soft slanted sheets hanging under the cloud, then fine streaks
  for (let i = 0; i < 5; i++) {
    const x = 0.26 + i * 0.12 + r() * 0.04, w = 0.07 + r() * 0.05, top = 0.56, len = 0.3 + r() * 0.1, slant = -0.06;
    const gr = g.createLinearGradient(0, S * top, 0, S * (top + len)); gr.addColorStop(0, 'rgba(70,72,110,.55)'); gr.addColorStop(1, 'rgba(70,72,110,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(S * x, S * top); g.lineTo(S * (x + w), S * top); g.lineTo(S * (x + w + slant), S * (top + len)); g.lineTo(S * (x + slant), S * (top + len)); g.closePath(); g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = 0.24 + r() * 0.54, y = 0.58 + r() * 0.14, l = 0.06 + r() * 0.1;
    g.strokeStyle = `rgba(190,200,235,${0.15 + r() * 0.35})`; g.lineWidth = S * (0.002 + r() * 0.003);
    g.beginPath(); g.moveTo(S * x, S * y); g.lineTo(S * (x - l * 0.25), S * (y + l)); g.stroke();
  }
  // a soft dark halo behind it, so it reads against the pale peach clouds without a hard outline
  g.save(); g.shadowColor = 'rgba(16,12,34,.85)'; g.shadowBlur = S * 0.05;
  g.fillStyle = 'rgba(30,26,52,.55)'; for (const [x, y, rr] of PUFFS) { g.beginPath(); g.arc(S * x, S * y, S * rr * 0.8, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // the body: soft billows, each fading out at its edge, shaded from a lavender lit top-right to a deep slate underside
  for (const [x, y, rr] of PUFFS) {
    const lit = 1 - Math.min(1, Math.max(0, (y - 0.18) / 0.42));
    const c0 = `${150 + 70 * lit},${138 + 58 * lit},${182 + 48 * lit}`, c1 = `${70 + 32 * lit},${63 + 28 * lit},${100 + 32 * lit}`;
    const bb = g.createRadialGradient(S * (x + rr * 0.3), S * (y - rr * 0.4), 0, S * x, S * y, S * rr * 1.25);
    bb.addColorStop(0, `rgba(${c0},.95)`); bb.addColorStop(0.45, `rgba(${c1},.9)`); bb.addColorStop(0.8, 'rgba(44,38,70,.55)'); bb.addColorStop(1, 'rgba(44,38,70,0)');
    g.fillStyle = bb; g.beginPath(); g.arc(S * x, S * y, S * rr * 1.25, 0, Math.PI * 2); g.fill();
  }
  // sunlit bumps along the top edge, like the cauliflower tops of the painting's clouds
  for (const [x, y, rr, edge] of PUFFS) {
    if (edge > 0.6 || y > 0.5) continue;
    const hx = x + rr * 0.25, hy = y - rr * 0.35, hr = rr * 0.75;
    const h = g.createRadialGradient(S * (hx + hr * 0.3), S * (hy - hr * 0.3), 0, S * hx, S * hy, S * hr);
    h.addColorStop(0, 'rgba(236,222,246,.75)'); h.addColorStop(0.5, 'rgba(190,176,222,.35)'); h.addColorStop(1, 'rgba(190,176,222,0)');
    g.fillStyle = h; g.beginPath(); g.arc(S * hx, S * hy, S * hr, 0, Math.PI * 2); g.fill();
  }
  // a darker, heavier underbelly where the rain falls from
  g.save(); g.beginPath(); for (const [x, y, rr] of PUFFS) { g.moveTo(S * (x + rr * 0.9), S * y); g.arc(S * x, S * y, S * rr * 0.9, 0, Math.PI * 2); } g.clip();
  const u = g.createLinearGradient(0, S * 0.36, 0, S * 0.64); u.addColorStop(0, 'rgba(22,18,40,0)'); u.addColorStop(1, 'rgba(22,18,40,.6)'); g.fillStyle = u; g.fillRect(0, 0, S, S);
  // the dawn catching its right edge, and a faint warm bounce along the bottom
  const d = g.createLinearGradient(S * 0.5, 0, S * 0.9, 0); d.addColorStop(0, 'rgba(255,190,150,0)'); d.addColorStop(1, 'rgba(255,190,150,.32)'); g.fillStyle = d; g.fillRect(0, 0, S, S);
  const w = g.createLinearGradient(0, S * 0.58, 0, S * 0.66); w.addColorStop(0, 'rgba(240,150,120,0)'); w.addColorStop(1, 'rgba(240,150,120,.22)'); g.fillStyle = w; g.fillRect(0, 0, S, S);
  // a hint of the lightning glowing deep inside
  const l = g.createRadialGradient(S * 0.46, S * 0.44, 0, S * 0.46, S * 0.44, S * 0.18); l.addColorStop(0, 'rgba(190,170,255,.35)'); l.addColorStop(1, 'rgba(190,170,255,0)'); g.fillStyle = l; g.fillRect(0, 0, S, S);
  g.restore();
}

// a jagged branching bolt: split each segment and nudge its middle sideways, again and again
function boltPath(r, x0, y0, x1, y1, rough, depth) {
  let pts = [[x0, y0], [x1, y1]];
  for (let d = 0; d < depth; d++) {
    const n = [pts[0]];
    for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; n.push([(ax + bx) / 2 + (r() - 0.5) * rough, (ay + by) / 2 + (r() - 0.5) * rough * 0.3]); n.push([bx, by]); }
    pts = n; rough *= 0.55;
  }
  return pts;
}
function strokeBolt(g, S, pts, w) {
  const line = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, S * x, S * y)); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.save(); g.shadowColor = 'rgba(170,160,255,1)'; g.shadowBlur = S * 0.05;
  g.strokeStyle = 'rgba(150,140,255,.35)'; g.lineWidth = S * 0.045 * w; line(); g.stroke(); g.restore();
  g.strokeStyle = 'rgba(215,210,255,.8)'; g.lineWidth = S * 0.016 * w; line(); g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = S * 0.0065 * w; line(); g.stroke();
}
function flash(g, S, seed = 1) {
  const r = rng(seed * 7919 + 3);
  // the cloud lights up from inside, in two or three places
  for (let i = 0; i < 3; i++) {
    const x = 0.32 + r() * 0.36, y = 0.3 + r() * 0.22, rr = 0.14 + r() * 0.12;
    const gl = g.createRadialGradient(S * x, S * y, 0, S * x, S * y, S * rr); gl.addColorStop(0, 'rgba(235,230,255,.85)'); gl.addColorStop(0.5, 'rgba(190,180,255,.35)'); gl.addColorStop(1, 'rgba(190,180,255,0)');
    g.fillStyle = gl; g.fillRect(0, 0, S, S);
  }
  // the main bolt from the cloud's belly down through the rain, and a few forks
  const x0 = 0.4 + r() * 0.2, main = boltPath(r, x0, 0.5, x0 + (r() - 0.5) * 0.25, 0.96, 0.22, 6);
  for (let f = 0; f < 3; f++) {
    const k = 4 + Math.floor(r() * (main.length - 20)), [bx, by] = main[k], dir = r() < 0.5 ? -1 : 1;
    strokeBolt(g, S, boltPath(r, bx, by, bx + dir * (0.08 + r() * 0.12), by + 0.1 + r() * 0.14, 0.08, 4), 0.5);
  }
  strokeBolt(g, S, main, 1);
  // where it leaves the cloud, a bright knot of light
  const k = g.createRadialGradient(S * x0, S * 0.52, 0, S * x0, S * 0.52, S * 0.08); k.addColorStop(0, 'rgba(255,255,255,.95)'); k.addColorStop(1, 'rgba(220,210,255,0)'); g.fillStyle = k; g.fillRect(0, 0, S, S);
}

function chime(g, S) {
  const c = S / 2;
  // the glow of dawn around it
  const r = g.createRadialGradient(c, S * 0.52, 0, c, S * 0.52, S * 0.48); r.addColorStop(0, 'rgba(255,236,170,.95)'); r.addColorStop(0.35, 'rgba(255,196,120,.5)'); r.addColorStop(1, 'rgba(255,170,110,0)');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
  // the ring it hangs from
  g.strokeStyle = '#4a2b12'; g.lineWidth = S * 0.012; g.beginPath(); g.moveTo(c, S * 0.1); g.lineTo(c, S * 0.24); g.stroke();
  g.fillStyle = '#c9822c'; g.beginPath(); g.ellipse(c, S * 0.26, S * 0.2, S * 0.045, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4a2b12'; g.lineWidth = S * 0.012; g.stroke();
  // five golden tubes of different lengths
  const tubes = [[-0.15, 0.36], [-0.075, 0.46], [0, 0.52], [0.075, 0.44], [0.15, 0.34]];
  for (const [dx, len] of tubes) {
    const x = c + dx * S, y0 = S * 0.3, w = S * 0.042;
    g.strokeStyle = '#4a2b12'; g.lineWidth = S * 0.006; g.beginPath(); g.moveTo(x, S * 0.27); g.lineTo(x, y0); g.stroke();
    const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, '#a8631c'); gr.addColorStop(0.35, '#ffe6a0'); gr.addColorStop(0.6, '#f0b04a'); gr.addColorStop(1, '#8a4c12');
    g.fillStyle = gr; g.fillRect(x - w / 2, y0, w, S * len); g.strokeStyle = '#4a2b12'; g.lineWidth = S * 0.008; g.strokeRect(x - w / 2, y0, w, S * len);
  }
  // the striker and its sail
  g.strokeStyle = '#4a2b12'; g.lineWidth = S * 0.006; g.beginPath(); g.moveTo(c, S * 0.27); g.lineTo(c, S * 0.88); g.stroke();
  g.fillStyle = '#ffd56a'; g.beginPath(); g.arc(c, S * 0.62, S * 0.03, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#ffefc4'; g.beginPath(); g.moveTo(c, S * 0.84); g.lineTo(c + S * 0.06, S * 0.9); g.lineTo(c, S * 0.96); g.lineTo(c - S * 0.06, S * 0.9); g.closePath(); g.fill(); g.stroke();
}

function sun(g, S) {
  const c = S / 2;
  g.save(); g.translate(c, c);
  for (let i = 0; i < 16; i++) {
    g.rotate(Math.PI / 8); const L = S * (i % 2 ? 0.36 : 0.46);
    const gr = g.createLinearGradient(0, 0, 0, -L); gr.addColorStop(0, 'rgba(255,214,140,.7)'); gr.addColorStop(1, 'rgba(255,214,140,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-S * 0.03, 0); g.lineTo(0, -L); g.lineTo(S * 0.03, 0); g.fill();
  }
  g.restore();
  const r = g.createRadialGradient(c, c, 0, c, c, S * 0.24); r.addColorStop(0, '#fffbe8'); r.addColorStop(0.55, '#ffd98a'); r.addColorStop(0.8, 'rgba(255,170,100,.6)'); r.addColorStop(1, 'rgba(255,150,90,0)');
  g.fillStyle = r; g.beginPath(); g.arc(c, c, S * 0.24, 0, Math.PI * 2); g.fill();
}

function wisp(g, S) {
  const blobs = [[0.5, 0.5, 0.2], [0.33, 0.55, 0.15], [0.67, 0.55, 0.15], [0.42, 0.42, 0.13], [0.6, 0.42, 0.12]];
  for (const [x, y, r] of blobs) { const b = g.createRadialGradient(S * x, S * (y - r * 0.2), 0, S * x, S * y, S * r); b.addColorStop(0, 'rgba(255,248,240,.85)'); b.addColorStop(0.6, 'rgba(255,236,220,.45)'); b.addColorStop(1, 'rgba(255,230,210,0)'); g.fillStyle = b; g.beginPath(); g.arc(S * x, S * y, S * r, 0, Math.PI * 2); g.fill(); }
}
function spark(g, S) {
  const c = S / 2; g.fillStyle = '#fff6d8';
  g.beginPath(); g.moveTo(c, S * 0.08); g.quadraticCurveTo(c + S * 0.05, c - S * 0.05, S * 0.92, c); g.quadraticCurveTo(c + S * 0.05, c + S * 0.05, c, S * 0.92);
  g.quadraticCurveTo(c - S * 0.05, c + S * 0.05, S * 0.08, c); g.quadraticCurveTo(c - S * 0.05, c - S * 0.05, c, S * 0.08); g.fill();
  const r = g.createRadialGradient(c, c, 0, c, c, S * 0.3); r.addColorStop(0, 'rgba(255,240,190,.9)'); r.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S);
}

export function thingCanvas(kind, size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  if (/^flash\d?$/.test(kind)) flash(g, size, +(kind.slice(5) || 0) + 1);   // 'flash', 'flash1', 'flash2': three different bolts
  else ({ storm, chime, sun, wisp, spark }[kind] || (() => {}))(g, size);
  return c;
}
