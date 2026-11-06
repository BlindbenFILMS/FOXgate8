// GOALBALL IS... (Ricky Ruzicka): the drawn props for "Block the shot".
// Everything is drawn in code, in the painting's own style: hard-edged geometric shards of teal, yellow, coral, magenta
// and navy, with near-black silhouettes. No emoji, no image files.
//   thingCanvas(kind, size) → a square canvas:
//     'ball'        the goalball (ivory rubber, geometric panels, the holes that let you hear the bells)
//     'diver-left'  the defender diving full length to the left, blackout eyeshades on (goalball players all wear them)
//     'diver-mid'   the defender kneeling low in the middle, arms wide, ready
//     'diver-right' the dive to the right (the left one, mirrored)
//     'block'       the shard burst when you stop it (BLOCK!)
//     'goal'        the red burst when a shot gets past (GOAL)
//     'rings'       the sound of the bells: arcs that spread out from the ball

const INK = '#16161c', TEAL = '#17a3a6', YEL = '#f5b62a', CORAL = '#f06a4f', MAG = '#b2346f', NAVY = '#1d3f8f', CREAM = '#f6ecd2', SKY = '#58c6d8';

function ball(g, S) {
  const c = S / 2, r = S * 0.42;
  // soft floor shadow
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(c + r * 0.08, c + r * 0.95, r * 0.8, r * 0.14, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.clip();
  const gr = g.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r * 1.05);
  gr.addColorStop(0, '#fffaf0'); gr.addColorStop(0.6, CREAM); gr.addColorStop(1, '#c9b78f');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  // geometric panels, like the painted ball
  const pan = (pts, col) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, c + x * r, c + y * r)); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = S * 0.018; g.strokeStyle = INK; g.stroke(); };
  pan([[-0.18, -0.2], [0.2, -0.24], [0.32, 0.12], [0.02, 0.34], [-0.3, 0.1]], TEAL);
  pan([[0.2, -0.24], [0.42, -0.62], [0.9, -0.3], [0.32, 0.12]], 'rgba(245,182,42,.92)');
  pan([[-0.3, 0.1], [0.02, 0.34], [-0.1, 0.9], [-0.8, 0.5]], 'rgba(240,106,79,.9)');
  pan([[-0.18, -0.2], [-0.3, 0.1], [-0.92, -0.1], [-0.55, -0.72]], 'rgba(29,63,143,.85)');
  pan([[0.32, 0.12], [0.9, 0.05], [0.7, 0.7], [0.02, 0.34]], 'rgba(178,52,111,.8)');
  // the holes (that's where the bells sing out)
  for (const [x, y, s] of [[0, 0.05, 1], [0.6, -0.25, 0.8], [-0.55, -0.3, 0.8], [-0.42, 0.55, 0.75], [0.48, 0.48, 0.75]]) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(c + x * r, c + y * r, r * 0.12 * s, r * 0.08 * s, Math.atan2(y, x) + 1.57, 0, Math.PI * 2); g.fill();
    g.fillStyle = YEL; g.beginPath(); g.arc(c + x * r + r * 0.02, c + y * r + r * 0.015, r * 0.03 * s, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // rim + shine
  g.lineWidth = S * 0.028; g.strokeStyle = INK; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(c - r * 0.42, c - r * 0.5, r * 0.16, r * 0.08, -0.7, 0, Math.PI * 2); g.fill();
}

// a figure built from hard-edged shards: draw the black silhouette, then colour shards inside it, then a light rim
function shardFigure(g, S, shapes, shards) {
  const sil = document.createElement('canvas'); sil.width = sil.height = S; const s = sil.getContext('2d');
  s.fillStyle = INK; s.strokeStyle = INK; s.lineJoin = 'miter'; s.lineCap = 'round';
  for (const sh of shapes) {
    s.beginPath(); sh.pts.forEach(([x, y], i) => (i ? s.lineTo : s.moveTo).call(s, x * S, y * S));
    if (sh.w) { s.lineWidth = sh.w * S; s.stroke(); } else { s.closePath(); s.fill(); }
  }
  s.globalCompositeOperation = 'source-atop';
  for (const [col, pts] of shards) { s.beginPath(); pts.forEach(([x, y], i) => (i ? s.lineTo : s.moveTo).call(s, x * S, y * S)); s.closePath(); s.fillStyle = col; s.fill(); }
  // a thin cream outline so it reads on the busy painting
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = S * 0.02; g.shadowOffsetY = S * 0.012;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.7, -0.7], [0.7, 0.7], [0.7, -0.7], [-0.7, 0.7]]) g.drawImage(tint(sil, CREAM), dx * S * 0.008, dy * S * 0.008);
  g.restore();
  g.drawImage(sil, 0, 0);
}
function tint(src, col) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return c;
}
function eyeshade(g, S, x, y, w, ang) {
  g.save(); g.translate(x * S, y * S); g.rotate(ang);
  g.fillStyle = '#050507'; g.beginPath(); g.roundRect(-w * S / 2, -w * S * 0.18, w * S, w * S * 0.36, w * S * 0.16); g.fill();
  g.strokeStyle = SKY; g.lineWidth = S * 0.008; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-w * S * 0.32, -w * S * 0.1, w * S * 0.22, w * S * 0.05);
  g.restore();
}

function diverLeft(g, S) {
  // lying full length, low to the floor, reaching left
  const shapes = [
    { pts: [[0.3, 0.5], [0.66, 0.53]], w: 0.17 },                    // torso
    { pts: [[0.3, 0.45], [0.15, 0.41], [0.05, 0.43]], w: 0.065 },     // top arm, reaching
    { pts: [[0.32, 0.56], [0.17, 0.61], [0.07, 0.61]], w: 0.065 },      // lower arm, reaching
    { pts: [[0.64, 0.49], [0.8, 0.44], [0.95, 0.46]], w: 0.09 },      // top leg
    { pts: [[0.64, 0.57], [0.8, 0.61], [0.93, 0.59]], w: 0.09 },      // lower leg
    { pts: [[0.17, 0.5], [0.21, 0.41], [0.29, 0.42], [0.29, 0.58], [0.21, 0.59]] },   // head
    { pts: [[0.03, 0.4], [0.08, 0.41], [0.09, 0.47], [0.02, 0.47]] }, // hands
    { pts: [[0.04, 0.57], [0.09, 0.57], [0.09, 0.63], [0.03, 0.63]] },
  ];
  const shards = [
    [TEAL, [[0.36, 0.42], [0.5, 0.44], [0.47, 0.6], [0.34, 0.58]]],
    [YEL, [[0.5, 0.44], [0.66, 0.45], [0.62, 0.52], [0.48, 0.5]]],
    [CORAL, [[0.48, 0.52], [0.68, 0.53], [0.66, 0.62], [0.47, 0.6]]],
    [MAG, [[0.66, 0.44], [0.84, 0.4], [0.86, 0.48], [0.68, 0.52]]],
    [NAVY, [[0.68, 0.55], [0.86, 0.56], [0.84, 0.66], [0.66, 0.62]]],
    [SKY, [[0.12, 0.38], [0.22, 0.4], [0.2, 0.46], [0.1, 0.45]]],
    [YEL, [[0.84, 0.42], [0.98, 0.42], [0.98, 0.5], [0.86, 0.5]]],
    [CORAL, [[0.14, 0.58], [0.25, 0.55], [0.26, 0.64], [0.13, 0.65]]],
  ];
  shardFigure(g, S, shapes, shards);
  eyeshade(g, S, 0.225, 0.5, 0.14, 1.45);
}
function diverMid(g, S) {
  // kneeling low, front on, arms spread wide to cover the middle
  const shapes = [
    { pts: [[0.5, 0.42], [0.5, 0.62]], w: 0.17 },                    // torso
    { pts: [[0.42, 0.45], [0.26, 0.55], [0.1, 0.62]], w: 0.06 },     // arms
    { pts: [[0.58, 0.45], [0.74, 0.55], [0.9, 0.62]], w: 0.06 },
    { pts: [[0.44, 0.64], [0.32, 0.74], [0.36, 0.86]], w: 0.08 },    // knees on the floor
    { pts: [[0.56, 0.64], [0.68, 0.74], [0.64, 0.86]], w: 0.08 },
    { pts: [[0.44, 0.24], [0.56, 0.24], [0.58, 0.33], [0.5, 0.37], [0.42, 0.33]] },  // head
    { pts: [[0.05, 0.6], [0.11, 0.58], [0.13, 0.65], [0.06, 0.67]] },
    { pts: [[0.95, 0.6], [0.89, 0.58], [0.87, 0.65], [0.94, 0.67]] },
  ];
  const shards = [
    [TEAL, [[0.42, 0.36], [0.56, 0.38], [0.52, 0.52], [0.4, 0.5]]],
    [CORAL, [[0.52, 0.4], [0.6, 0.4], [0.6, 0.58], [0.5, 0.55]]],
    [YEL, [[0.4, 0.52], [0.54, 0.54], [0.56, 0.7], [0.4, 0.68]]],
    [MAG, [[0.18, 0.5], [0.3, 0.48], [0.3, 0.58], [0.16, 0.62]]],
    [NAVY, [[0.7, 0.48], [0.84, 0.54], [0.82, 0.64], [0.7, 0.58]]],
    [SKY, [[0.3, 0.72], [0.4, 0.7], [0.4, 0.84], [0.3, 0.82]]],
    [CORAL, [[0.6, 0.7], [0.72, 0.72], [0.7, 0.86], [0.6, 0.84]]],
  ];
  shardFigure(g, S, shapes, shards);
  eyeshade(g, S, 0.5, 0.295, 0.17, 0);
}

function burst(g, S, text, cols, fg) {
  const c = S / 2;
  // hard geometric shards flying out
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2, r0 = S * 0.12, r1 = S * (0.36 + (i % 3) * 0.05), w = 0.17;
    g.beginPath(); g.moveTo(c + Math.cos(a - w) * r0, c + Math.sin(a - w) * r0); g.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); g.lineTo(c + Math.cos(a + w) * r0, c + Math.sin(a + w) * r0); g.closePath();
    g.fillStyle = cols[i % cols.length]; g.fill(); g.lineWidth = S * 0.01; g.strokeStyle = INK; g.stroke();
  }
  g.font = `900 ${S * 0.2}px Archivo, "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = S * 0.2; while (g.measureText(text).width > S * 0.8) { fs -= 4; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; }
  const tw = g.measureText(text).width;
  g.fillStyle = INK; g.fillRect(c - tw / 2 - S * 0.04, c - fs * 0.62, tw + S * 0.08, fs * 1.18);
  g.fillStyle = fg; g.fillText(text, c, c + fs * 0.04);
}

function rings(g, S) {
  const c = S / 2; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const r = S * (0.2 + i * 0.1); g.lineWidth = S * (0.035 - i * 0.008); g.strokeStyle = `rgba(255,236,170,${0.95 - i * 0.25})`;
    g.beginPath(); g.arc(c, c, r, -2.4, -0.75); g.stroke(); g.beginPath(); g.arc(c, c, r, 0.75, 2.4); g.stroke();
  }
}

export function thingCanvas(kind, size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  if (kind === 'ball') ball(g, size);
  else if (kind === 'diver-left') diverLeft(g, size);
  else if (kind === 'diver-right') { g.translate(size, 0); g.scale(-1, 1); diverLeft(g, size); }
  else if (kind === 'diver-mid') diverMid(g, size);
  else if (kind === 'block') burst(g, size, 'BLOCK!', [TEAL, YEL, CORAL, SKY, MAG], '#fff');
  else if (kind === 'goal') burst(g, size, 'GOAL', ['#ec3013', INK, '#ec3013', '#7a1206'], '#ec3013');
  else if (kind === 'rings') rings(g, size);
  return c;
}
