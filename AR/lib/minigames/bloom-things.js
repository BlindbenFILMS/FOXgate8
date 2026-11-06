// TAKE TIME TO BLOOM (Steven McCoy): the drawn props.
// Drawn in code, lit like the painting: soft silver-white petals and warm brass clockwork.
//   thingCanvas(kind, size) → a square canvas: 'gear' | 'hand' | 'petal' | 'jam' | 'glint'
//   'petal' is drawn pointing straight up from the bottom middle of the canvas (its base), so it can swing open from there.
// Used by bloom-clock.js. No emoji, no image files.

// polished brass: a metal gradient that sweeps round the gear (conic where the phone has it), lit from the upper left
function brass(g, c, S) {
  if (g.createConicGradient) {
    const k = g.createConicGradient(-Math.PI * 0.75, c, c);
    [[0, '#fff1c4'], [0.12, '#e7b553'], [0.3, '#9c6a1c'], [0.45, '#d9a441'], [0.6, '#fbe0a0'], [0.75, '#b07a26'], [0.9, '#7a4f12'], [1, '#fff1c4']].forEach(([o, col]) => k.addColorStop(o, col));
    return k;
  }
  const l = g.createLinearGradient(0, 0, S, S); l.addColorStop(0, '#ffe7a8'); l.addColorStop(0.45, '#d9a441'); l.addColorStop(1, '#6e4510'); return l;
}
function gearPath(g, c, R, r, teeth) {
  g.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2, w = Math.PI / teeth;
    g.lineTo(c + Math.cos(a0 - w * 0.62) * r, c + Math.sin(a0 - w * 0.62) * r);
    g.quadraticCurveTo(c + Math.cos(a0 - w * 0.5) * R * 0.98, c + Math.sin(a0 - w * 0.5) * R * 0.98, c + Math.cos(a0 - w * 0.32) * R, c + Math.sin(a0 - w * 0.32) * R);
    g.lineTo(c + Math.cos(a0 + w * 0.32) * R, c + Math.sin(a0 + w * 0.32) * R);
    g.quadraticCurveTo(c + Math.cos(a0 + w * 0.5) * R * 0.98, c + Math.sin(a0 + w * 0.5) * R * 0.98, c + Math.cos(a0 + w * 0.62) * r, c + Math.sin(a0 + w * 0.62) * r);
  }
  g.closePath();
}
function gear(g, S) {
  const c = S / 2, teeth = 18, R = S * 0.45, r = S * 0.385, TAU = Math.PI * 2;
  // a warm glow behind it so it stands out on the grey petals
  const gl = g.createRadialGradient(c, c, S * 0.25, c, c, S * 0.5); gl.addColorStop(0, 'rgba(255,205,120,.4)'); gl.addColorStop(1, 'rgba(255,180,80,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  // a soft shadow under it, down and to the right
  g.save(); g.translate(S * 0.018, S * 0.024); g.filter = `blur(${Math.round(S * 0.012)}px)`; gearPath(g, c, R, r, teeth); g.fillStyle = 'rgba(20,10,0,.55)'; g.fill(); g.restore();
  // the body with its teeth
  gearPath(g, c, R, r, teeth); g.fillStyle = brass(g, c, S); g.fill();
  g.lineWidth = S * 0.01; g.strokeStyle = '#3a2408'; g.stroke();
  // a bevel: a bright edge on the upper left of each tooth ring, a dark one on the lower right
  g.save(); gearPath(g, c, R, r, teeth); g.clip();
  const bev = g.createLinearGradient(c - R, c - R, c + R, c + R); bev.addColorStop(0, 'rgba(255,255,255,.45)'); bev.addColorStop(0.45, 'rgba(255,255,255,0)'); bev.addColorStop(0.7, 'rgba(0,0,0,0)'); bev.addColorStop(1, 'rgba(40,20,0,.45)');
  g.strokeStyle = bev; g.lineWidth = S * 0.03; gearPath(g, c, R, r, teeth); g.stroke();
  g.restore();
  // the spokes: five curved windows cut right through
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU - Math.PI / 2, w = 0.42;
    g.beginPath(); g.arc(c, c, S * 0.29, a - w, a + w); g.arc(c, c, S * 0.15, a + w * 0.78, a - w * 0.78, true); g.closePath(); g.fill();
  }
  g.restore();
  // an engraved ring inside the teeth, and the rims of the spoke windows
  g.strokeStyle = 'rgba(58,36,8,.85)'; g.lineWidth = S * 0.008; g.beginPath(); g.arc(c, c, S * 0.325, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,240,200,.55)'; g.lineWidth = S * 0.005; g.beginPath(); g.arc(c - S * 0.003, c - S * 0.003, S * 0.335, Math.PI * 0.95, Math.PI * 1.6); g.stroke();
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU - Math.PI / 2, w = 0.42;
    g.beginPath(); g.arc(c, c, S * 0.29, a - w, a + w); g.arc(c, c, S * 0.15, a + w * 0.78, a - w * 0.78, true); g.closePath();
    g.strokeStyle = '#3a2408'; g.lineWidth = S * 0.008; g.stroke();
  }
  // five little rivets between the windows
  for (let i = 0; i < 5; i++) {
    const a = (i + 0.5) / 5 * TAU - Math.PI / 2, x = c + Math.cos(a) * S * 0.24, y = c + Math.sin(a) * S * 0.24;
    const rv = g.createRadialGradient(x - S * 0.006, y - S * 0.006, 0, x, y, S * 0.018); rv.addColorStop(0, '#fff6d8'); rv.addColorStop(0.6, '#c99236'); rv.addColorStop(1, '#5a3a0c');
    g.fillStyle = rv; g.beginPath(); g.arc(x, y, S * 0.017, 0, TAU); g.fill();
  }
  // the raised hub, a flower of white petals, and a ruby jewel in the middle (like a watch)
  const hub = g.createRadialGradient(c - S * 0.03, c - S * 0.03, 0, c, c, S * 0.12); hub.addColorStop(0, '#fff3c8'); hub.addColorStop(0.55, '#d9a441'); hub.addColorStop(1, '#6e4510');
  g.beginPath(); g.arc(c, c, S * 0.115, 0, TAU); g.fillStyle = hub; g.fill(); g.strokeStyle = '#3a2408'; g.lineWidth = S * 0.009; g.stroke();
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    g.fillStyle = 'rgba(255,255,255,.95)'; g.strokeStyle = 'rgba(120,100,150,.6)'; g.lineWidth = S * 0.003;
    g.beginPath(); g.ellipse(c + Math.cos(a) * S * 0.058, c + Math.sin(a) * S * 0.058, S * 0.036, S * 0.016, a, 0, TAU); g.fill(); g.stroke();
  }
  const ruby = g.createRadialGradient(c - S * 0.008, c - S * 0.01, 0, c, c, S * 0.03); ruby.addColorStop(0, '#ffb3a0'); ruby.addColorStop(0.45, '#e0302a'); ruby.addColorStop(1, '#6a0a12');
  g.beginPath(); g.arc(c, c, S * 0.027, 0, TAU); g.fillStyle = ruby; g.fill(); g.strokeStyle = '#ffe2a0'; g.lineWidth = S * 0.006; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(c - S * 0.009, c - S * 0.01, S * 0.007, 0, TAU); g.fill();
}
function hand(g, S) {
  // an antique clock hand, pointing up, its pivot at the canvas centre: blued steel edged in gold,
  // with a spade tip, an open loop, and a round counterweight on the tail
  const c = S / 2, TAU = Math.PI * 2;
  const steel = g.createLinearGradient(c - S * 0.05, 0, c + S * 0.05, 0); steel.addColorStop(0, '#2a3f8f'); steel.addColorStop(0.5, '#4f6fd8'); steel.addColorStop(1, '#16245a');
  const shape = () => {
    g.beginPath();
    g.moveTo(c, S * 0.035);                                              // the spade tip
    g.bezierCurveTo(c + S * 0.06, S * 0.09, c + S * 0.06, S * 0.15, c + S * 0.012, S * 0.17);
    g.lineTo(c + S * 0.01, S * 0.21);
    g.lineTo(c + S * 0.016, c - S * 0.03); g.lineTo(c + S * 0.03, c); g.lineTo(c + S * 0.012, S * 0.6);  // into the hub and the tail
    g.lineTo(c - S * 0.012, S * 0.6); g.lineTo(c - S * 0.03, c); g.lineTo(c - S * 0.016, c - S * 0.03);
    g.lineTo(c - S * 0.01, S * 0.21); g.lineTo(c - S * 0.012, S * 0.17);
    g.bezierCurveTo(c - S * 0.06, S * 0.15, c - S * 0.06, S * 0.09, c, S * 0.035);
    g.closePath();
  };
  // a soft shadow so it reads on any part of the flower
  g.save(); g.translate(S * 0.01, S * 0.012); g.filter = `blur(${Math.round(S * 0.008)}px)`; shape(); g.fillStyle = 'rgba(0,0,0,.6)'; g.fill(); g.restore();
  shape(); g.fillStyle = steel; g.fill(); g.lineJoin = 'round'; g.lineWidth = S * 0.012; g.strokeStyle = '#ffd98a'; g.stroke();
  // the open loop on the shaft
  g.beginPath(); g.arc(c, S * 0.285, S * 0.04, 0, TAU); g.fillStyle = steel; g.fill(); g.lineWidth = S * 0.012; g.strokeStyle = '#ffd98a'; g.stroke();
  g.beginPath(); g.arc(c, S * 0.285, S * 0.017, 0, TAU); g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(); g.restore();
  g.beginPath(); g.arc(c, S * 0.285, S * 0.017, 0, TAU); g.lineWidth = S * 0.006; g.stroke();
  // the counterweight on the tail
  g.beginPath(); g.arc(c, S * 0.635, S * 0.035, 0, TAU); g.fillStyle = steel; g.fill(); g.lineWidth = S * 0.012; g.stroke();
  // a shine down the left of the blade, and the gold hub
  g.strokeStyle = 'rgba(200,220,255,.7)'; g.lineWidth = S * 0.006; g.beginPath(); g.moveTo(c - S * 0.022, S * 0.1); g.quadraticCurveTo(c - S * 0.04, S * 0.13, c - S * 0.014, S * 0.165); g.stroke();
  const hub = g.createRadialGradient(c - S * 0.01, c - S * 0.01, 0, c, c, S * 0.05); hub.addColorStop(0, '#fff3c8'); hub.addColorStop(0.6, '#d9a441'); hub.addColorStop(1, '#6e4510');
  g.beginPath(); g.arc(c, c, S * 0.045, 0, TAU); g.fillStyle = hub; g.fill(); g.lineWidth = S * 0.008; g.strokeStyle = '#3a2408'; g.stroke();
  g.fillStyle = '#3a2408'; g.beginPath(); g.arc(c, c, S * 0.012, 0, TAU); g.fill();
}
function petal(g, S) {
  // a soft silver-white petal with pale violet veins, glowing at the edge, its base at the bottom middle
  const bx = S / 2, by = S * 0.98;
  const shape = () => { g.beginPath(); g.moveTo(bx, by); g.bezierCurveTo(bx - S * 0.42, S * 0.72, bx - S * 0.36, S * 0.12, bx, S * 0.04); g.bezierCurveTo(bx + S * 0.36, S * 0.12, bx + S * 0.42, S * 0.72, bx, by); g.closePath(); };
  g.save(); g.filter = `blur(${Math.round(S * 0.03)}px)`; shape(); g.fillStyle = 'rgba(255,240,215,.7)'; g.fill(); g.restore();
  shape();
  const f = g.createLinearGradient(0, S * 0.04, 0, by); f.addColorStop(0, '#ffffff'); f.addColorStop(0.45, '#eeeaf4'); f.addColorStop(0.85, '#c9c0d8'); f.addColorStop(1, '#ffd38a');
  g.fillStyle = f; g.fill(); g.lineWidth = S * 0.012; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
  g.save(); shape(); g.clip();
  // fine veins fanning out from the base, a crease down the middle, cool shade at the sides
  g.strokeStyle = 'rgba(150,130,190,.4)'; g.lineWidth = S * 0.005;
  for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + i * S * 0.05, S * 0.52, bx + i * S * 0.075, S * 0.1); g.stroke(); }
  g.strokeStyle = 'rgba(120,100,170,.45)'; g.lineWidth = S * 0.01; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + S * 0.01, S * 0.5, bx, S * 0.08); g.stroke();
  const sh = g.createLinearGradient(bx - S * 0.32, 0, bx + S * 0.32, 0); sh.addColorStop(0, 'rgba(110,100,150,.35)'); sh.addColorStop(0.42, 'rgba(255,255,255,0)'); sh.addColorStop(0.58, 'rgba(255,255,255,.25)'); sh.addColorStop(1, 'rgba(110,100,150,.3)');
  g.fillStyle = sh; g.fillRect(0, 0, S, S);
  // a curled-over tip catching the light
  g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(bx - S * 0.04, S * 0.13, S * 0.08, S * 0.025, -0.3, 0, Math.PI * 2); g.fill();
  // warm pollen dust near the base
  for (let i = 0; i < 14; i++) { const a = (i * 2.4) % 1, x = bx + (a - 0.5) * S * 0.16, y = by - S * (0.04 + ((i * 0.37) % 1) * 0.12); g.fillStyle = 'rgba(255,190,90,.7)'; g.beginPath(); g.arc(x, y, S * 0.007, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
function jam(g, S) {
  // the gears jam: a red flash with hard sparks
  const c = S / 2;
  const gl = g.createRadialGradient(c, c, 0, c, c, S * 0.5); gl.addColorStop(0, 'rgba(255,90,50,.85)'); gl.addColorStop(0.4, 'rgba(236,48,19,.4)'); gl.addColorStop(1, 'rgba(236,48,19,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#fff3c0'; g.lineCap = 'round';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, r0 = S * 0.12, r1 = S * (0.32 + (i % 3) * 0.05); g.lineWidth = S * (0.018 + (i % 2) * 0.01); g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); g.stroke(); }
}
function glint(g, S) {
  const c = S / 2;
  const gl = g.createRadialGradient(c, c, 0, c, c, S * 0.5); gl.addColorStop(0, 'rgba(255,255,240,1)'); gl.addColorStop(0.18, 'rgba(255,230,170,.6)'); gl.addColorStop(1, 'rgba(255,210,140,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? S * 0.07 : S * 0.45; g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); } g.closePath(); g.fill();
}

const DRAW = { gear, hand, petal, jam, glint };
export function thingCanvas(kind, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  (DRAW[kind] || glint)(c.getContext('2d'), size); return c;
}
