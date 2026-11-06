// THE GRAY ZONE: the creature in the glass, drawn in light. Five stages, each one alive (drawn fresh every frame).
//   drawCreature(g, W, stage, t, open)  stage 0 egg on a leaf, 1 caterpillar, 2 chrysalis, 3 wings unfolding, 4 butterfly
// Colour grows with the stages: the egg is pearl and gold, the caterpillar leaf-green, the chrysalis jade and gold,
// the wings start to show their colours, and the butterfly is the full warm-and-sky colour the room fills with at the end.

const TAU = Math.PI * 2;

function glow(g, color, blur) { g.shadowColor = color; g.shadowBlur = blur; }

function leaf(g, t) {
  g.save();
  g.translate(256, 372); g.rotate(-0.06 + Math.sin(t * 0.9) * 0.02);
  glow(g, 'rgba(150,230,140,.55)', 26);
  const lg = g.createLinearGradient(-190, -40, 190, 40); lg.addColorStop(0, '#4f9a45'); lg.addColorStop(0.55, '#8fd16a'); lg.addColorStop(1, '#3f7d3a');
  g.fillStyle = lg; g.strokeStyle = '#1f4d22'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(-200, 8);
  g.bezierCurveTo(-120, -78, 110, -84, 200, -6);
  g.bezierCurveTo(110, 66, -110, 72, -200, 8); g.closePath(); g.fill(); g.stroke();
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(30,80,32,.85)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(-190, 8); g.quadraticCurveTo(0, -6, 196, -4); g.stroke();
  g.lineWidth = 3;
  for (let k = -3; k <= 3; k++) { if (!k) continue; const x = k * 46; g.beginPath(); g.moveTo(x, -2 + Math.abs(k) * 0.6); g.quadraticCurveTo(x + 18, -24, x + 34, -40 + Math.abs(k) * 6); g.moveTo(x, 2); g.quadraticCurveTo(x + 18, 24, x + 34, 38 - Math.abs(k) * 6); g.stroke(); }
  // a stem
  g.lineWidth = 8; g.strokeStyle = '#2e6a2c'; g.beginPath(); g.moveTo(-200, 8); g.lineTo(-236, 22); g.stroke();
  g.restore();
}

function egg(g, t) {
  leaf(g, t);
  const wob = Math.sin(t * 1.3) * 0.05 + Math.sin(t * 4.1) * 0.012;
  g.save(); g.translate(256, 330); g.rotate(wob);
  // a halo of warm light: something is alive in there
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.2);
  const halo = g.createRadialGradient(0, -60, 10, 0, -60, 150); halo.addColorStop(0, `rgba(255,226,150,${0.35 + 0.25 * pulse})`); halo.addColorStop(1, 'rgba(255,226,150,0)');
  g.fillStyle = halo; g.fillRect(-170, -220, 340, 300);
  glow(g, 'rgba(255,230,170,.9)', 30);
  const eg = g.createRadialGradient(-26, -110, 8, 0, -60, 110); eg.addColorStop(0, '#ffffff'); eg.addColorStop(0.45, '#f8eedb'); eg.addColorStop(1, '#d8c39a');
  g.fillStyle = eg; g.strokeStyle = '#8a6a32'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(0, -150); g.bezierCurveTo(74, -150, 86, -14, 0, 0); g.bezierCurveTo(-86, -14, -74, -150, 0, -150); g.closePath(); g.fill(); g.stroke();
  g.shadowBlur = 0;
  // soft ribs and speckles
  g.strokeStyle = 'rgba(160,125,70,.35)'; g.lineWidth = 3;
  for (const x of [-36, -14, 14, 36]) { g.beginPath(); g.moveTo(x * 0.6, -140); g.quadraticCurveTo(x * 1.25, -70, x * 0.8, -6); g.stroke(); }
  g.fillStyle = 'rgba(190,150,80,.55)';
  for (const [x, y, r] of [[-30, -60, 5], [22, -96, 4], [30, -40, 6], [-14, -118, 3.5], [8, -24, 4]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  // shine
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-26, -106, 10, 22, -0.4, 0, TAU); g.fill();
  g.restore();
}

function caterpillar(g, t) {
  leaf(g, t);
  // a bite out of the leaf edge (he's hungry)
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (const [x, y, r] of [[426, 318, 24], [450, 336, 20]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.restore();
  const N = 9, step = 33, wave = t * 3.0;
  const seg = [];
  for (let k = 0; k < N; k++) {
    const x = 96 + k * step + Math.sin(wave) * 8;
    const hump = Math.max(0, Math.sin(wave - k * 0.55)) * 30;   // the inching hump runs from tail to head
    seg.push([x, 334 - hump]);
  }
  glow(g, 'rgba(190,255,120,.75)', 22);
  for (let k = 0; k < N; k++) {
    const [x, y] = seg[k], r = k === N - 1 ? 34 : 29 - Math.abs(k - 5) * 0.8;
    const sg = g.createRadialGradient(x - 8, y - 10, 2, x, y, r); sg.addColorStop(0, '#e9ff9c'); sg.addColorStop(0.6, '#8fd34a'); sg.addColorStop(1, '#4e8e2a');
    g.fillStyle = sg; g.strokeStyle = '#2d5a1a'; g.lineWidth = 5;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke();
    if (k < N - 1) { g.shadowBlur = 0; g.fillStyle = '#ffcf4a'; g.beginPath(); g.arc(x, y - r * 0.45, 5.5, 0, TAU); g.fill(); glow(g, 'rgba(190,255,120,.75)', 22); }
    if (k < N - 1 && k % 2 === 0) { g.strokeStyle = '#2d5a1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y + r - 2); g.lineTo(x - 4, y + r + 12); g.stroke(); }
  }
  g.shadowBlur = 0;
  // the head: big friendly eyes, antennae
  const [hx, hy] = seg[N - 1];
  g.strokeStyle = '#2d5a1a'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(hx - 8, hy - 26); g.quadraticCurveTo(hx - 14, hy - 60, hx - 28, hy - 64); g.moveTo(hx + 10, hy - 24); g.quadraticCurveTo(hx + 22, hy - 58, hx + 36, hy - 60); g.stroke();
  g.fillStyle = '#ffcf4a'; g.beginPath(); g.arc(hx - 28, hy - 64, 7, 0, TAU); g.arc(hx + 36, hy - 60, 7, 0, TAU); g.fill();
  const blink = (t % 3.4) < 0.12;
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(hx + 4, hy - 6, 9, blink ? 1.5 : 11, 0, 0, TAU); g.ellipse(hx + 20, hy - 4, 8, blink ? 1.5 : 10, 0, 0, TAU); g.fill();
  if (!blink) { g.fillStyle = '#1a2a12'; g.beginPath(); g.arc(hx + 7, hy - 5, 5, 0, TAU); g.arc(hx + 22, hy - 3, 4.5, 0, TAU); g.fill(); }
  g.strokeStyle = '#2d5a1a'; g.lineWidth = 4; g.beginPath(); g.arc(hx + 12, hy + 8, 8, 0.2, Math.PI - 0.2); g.stroke();
}

function chrysalis(g, t) {
  // a twig across the top, the chrysalis hanging from it and swaying
  g.save(); glow(g, 'rgba(255,220,150,.5)', 14);
  g.strokeStyle = '#6b4a2a'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(70, 78); g.quadraticCurveTo(256, 60, 446, 88); g.stroke();
  g.lineWidth = 9; g.beginPath(); g.moveTo(380, 82); g.quadraticCurveTo(414, 54, 436, 40); g.stroke();
  g.fillStyle = '#5fae4a'; g.beginPath(); g.ellipse(438, 36, 22, 10, -0.6, 0, TAU); g.fill();
  g.restore();
  const sway = Math.sin(t * 1.1) * 0.09 + Math.sin(t * 2.7) * 0.015;
  g.save(); g.translate(256, 74); g.rotate(sway);
  g.strokeStyle = '#6b4a2a'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 30); g.stroke();
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
  glow(g, `rgba(140,255,200,${0.55 + 0.35 * pulse})`, 36);
  const cg = g.createLinearGradient(-70, 0, 70, 0); cg.addColorStop(0, '#2f8f6a'); cg.addColorStop(0.45, '#8ff0c4'); cg.addColorStop(1, '#267a5a');
  g.fillStyle = cg; g.strokeStyle = '#174a36'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(0, 28);
  g.bezierCurveTo(84, 60, 84, 230, 8, 320); g.quadraticCurveTo(0, 332, -8, 320);
  g.bezierCurveTo(-84, 230, -84, 60, 0, 28); g.closePath(); g.fill(); g.stroke();
  g.shadowBlur = 0;
  // the wings showing through, faintly: something is changing inside
  g.save(); g.globalAlpha = 0.18 + 0.22 * pulse;
  g.fillStyle = '#ffb25a';
  g.beginPath(); g.moveTo(0, 110); g.bezierCurveTo(48, 96, 56, 190, 6, 236); g.lineTo(0, 236); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0, 110); g.bezierCurveTo(-48, 96, -56, 190, -6, 236); g.lineTo(0, 236); g.closePath(); g.fill();
  g.restore();
  // the gold band and dots
  g.strokeStyle = '#ffd35a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-52, 104); g.quadraticCurveTo(0, 124, 52, 104); g.stroke();
  g.fillStyle = '#ffe07a';
  for (const [x, y] of [[-34, 92], [34, 92], [-20, 148], [20, 148], [0, 196], [-12, 262], [12, 262]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-30, 150, 7, 40, 0.1, 0, TAU); g.fill();
  g.restore();
}

// one butterfly, open = 0 (folded) … 1 (spread flat); colour = 0 (pale gold) … 1 (full colour)
function butterfly(g, t, open, colour) {
  const mix = (a, b) => a.map((v, i) => Math.round(v + (b[i] - v) * colour));
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const foreA = mix([255, 214, 140], [255, 128, 52]), foreB = mix([255, 236, 190], [255, 210, 92]);
  const hindA = mix([255, 220, 160], [70, 170, 235]), hindB = mix([255, 240, 200], [150, 225, 255]);
  const wing = (sx) => {
    g.save(); g.scale(sx * (0.12 + 0.88 * open), 1);
    glow(g, rgb(foreB, 0.8), 28);
    // forewing
    let gr = g.createLinearGradient(0, -20, 200, -150); gr.addColorStop(0, rgb(foreA)); gr.addColorStop(1, rgb(foreB));
    g.fillStyle = gr; g.strokeStyle = '#3a2410'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(0, -14); g.bezierCurveTo(40, -150, 210, -190, 214, -96); g.bezierCurveTo(218, -30, 120, 6, 0, 8); g.closePath(); g.fill(); g.stroke();
    // hindwing
    g.shadowColor = rgb(hindB, 0.8);
    gr = g.createLinearGradient(0, 10, 150, 170); gr.addColorStop(0, rgb(hindA)); gr.addColorStop(1, rgb(hindB));
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(0, 10); g.bezierCurveTo(70, 8, 178, 50, 150, 132); g.bezierCurveTo(130, 190, 40, 170, 0, 40); g.closePath(); g.fill(); g.stroke();
    g.shadowBlur = 0;
    // veins
    g.strokeStyle = 'rgba(58,36,16,.6)'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(6, -6); g.quadraticCurveTo(100, -70, 196, -130); g.moveTo(6, -2); g.quadraticCurveTo(110, -40, 206, -70); g.moveTo(6, 0); g.quadraticCurveTo(90, -10, 170, -20);
    g.moveTo(6, 20); g.quadraticCurveTo(80, 50, 140, 120); g.moveTo(6, 24); g.quadraticCurveTo(50, 90, 70, 150); g.stroke();
    // dark edge with white dots
    g.strokeStyle = 'rgba(40,24,10,.85)'; g.lineWidth = 14;
    g.beginPath(); g.moveTo(150, -164); g.bezierCurveTo(200, -168, 222, -130, 214, -96); g.stroke();
    g.fillStyle = '#fff';
    for (const [x, y, r] of [[168, -160, 5], [196, -150, 5], [212, -120, 4.5], [186, -120, 6], [140, 150, 4.5], [158, 120, 4]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    // an eye spot on the hindwing
    g.fillStyle = rgb(mix([255, 230, 170], [255, 200, 60])); g.beginPath(); g.arc(96, 92, 18, 0, TAU); g.fill();
    g.fillStyle = 'rgba(40,24,10,.85)'; g.beginPath(); g.arc(96, 92, 9, 0, TAU); g.fill();
    g.restore();
  };
  wing(-1); wing(1);
  // body and antennae
  glow(g, 'rgba(255,230,170,.7)', 12);
  const bg = g.createLinearGradient(-10, 0, 10, 0); bg.addColorStop(0, '#2a1a0c'); bg.addColorStop(0.5, '#6a4a2a'); bg.addColorStop(1, '#2a1a0c');
  g.fillStyle = bg; g.beginPath(); g.ellipse(0, 16, 12, 70, 0, 0, TAU); g.fill();
  g.beginPath(); g.arc(0, -58, 15, 0, TAU); g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = '#2a1a0c'; g.lineWidth = 5;
  const tw = Math.sin(t * 2.3) * 6;
  g.beginPath(); g.moveTo(-5, -68); g.quadraticCurveTo(-20, -112, -40 + tw, -128); g.moveTo(5, -68); g.quadraticCurveTo(20, -112, 40 - tw, -128); g.stroke();
  g.fillStyle = '#2a1a0c'; g.beginPath(); g.arc(-40 + tw, -128, 8, 0, TAU); g.moveTo(48 - tw, -128); g.arc(40 - tw, -128, 8, 0, TAU); g.fill();
}

// draws the creature for a stage into a square canvas of size W (designed at 512)
export function drawCreature(g, W, stage, t, opts = {}) {
  g.clearRect(0, 0, W, W);
  g.save(); g.scale(W / 512, W / 512); g.lineCap = 'round'; g.lineJoin = 'round';
  if (stage === 0) egg(g, t);
  else if (stage === 1) caterpillar(g, t);
  else if (stage === 2) chrysalis(g, t);
  else {
    // wings unfolding: slowly opening and closing, half coloured; the butterfly: full colour, a gentle flap
    const open = opts.open != null ? opts.open : stage === 3 ? 0.42 + 0.2 * Math.sin(t * 1.2) : 0.72 + 0.28 * Math.sin(t * 2.4);
    const colour = opts.colour != null ? opts.colour : stage === 3 ? 0.45 : 1;
    g.translate(256, 270); if (stage === 3) g.rotate(Math.sin(t * 0.8) * 0.04);
    butterfly(g, t, open, colour);
  }
  g.restore();
}

// a live canvas texture for one creature: call tick(t) every frame
export function creatureCanvas(THREE, W = 512) {
  const c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  let last = -1;
  return { tex, draw(stage, t, opts) { if (Math.abs(t - last) < 1 / 40) return; last = t; drawCreature(g, W, stage, t, opts); tex.needsUpdate = true; } };
}
