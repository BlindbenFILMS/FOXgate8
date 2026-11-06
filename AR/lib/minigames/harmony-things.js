// TUNE IT UP (Academy of Music for the Blind, The Harmony of Vision): the drawn props, in the painting's own style:
// round shapes, warm gold and orange against deep blue, painted soft edges, a dark navy outline.
//   thingCanvas(kind, size) → a square canvas:
//     'teacher'  Deb's note: a golden note glowing like the painting's moons (the note to match)
//     'student'  the student's note: a bright blue note with a white rim (the one you slide)
//     'spark'    the "in tune" starburst
//     'halo'     a soft painted ring of light that sits on one of the painting's circles once it's lit
// No emoji, no image files. Plain canvas: no three.js here, so it can be previewed anywhere.

const NAVY = '#14183a';

function outline(g, S, w = 0.035) { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = S * w; g.strokeStyle = NAVY; g.stroke(); }

// a music note: a tilted round head, a stem, and (for the student) a flag
function note(g, S, { head, shade, rim, flag = false, glow }) {
  const hx = S * 0.42, hy = S * 0.7, rx = S * 0.17, ry = S * 0.125, tilt = -0.42;
  if (glow) {   // the soft light around it
    const r = g.createRadialGradient(hx, hy - S * 0.12, S * 0.05, hx, hy - S * 0.12, S * 0.5);
    r.addColorStop(0, glow); r.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S);
  }
  // stem
  const sx = hx + rx * 0.86, top = S * 0.14;
  g.beginPath(); g.moveTo(sx - S * 0.026, hy - ry * 0.3); g.lineTo(sx - S * 0.026, top); g.lineTo(sx + S * 0.026, top); g.lineTo(sx + S * 0.026, hy - ry * 0.3); g.closePath();
  g.fillStyle = shade; g.fill(); outline(g, S, 0.026);
  if (flag) {
    g.beginPath(); g.moveTo(sx + S * 0.02, top); g.bezierCurveTo(sx + S * 0.12, top + S * 0.1, sx + S * 0.26, top + S * 0.16, sx + S * 0.16, top + S * 0.36);
    g.bezierCurveTo(sx + S * 0.18, top + S * 0.22, sx + S * 0.08, top + S * 0.16, sx + S * 0.02, top + S * 0.14); g.closePath();
    g.fillStyle = head; g.fill(); outline(g, S, 0.024);
  }
  // head
  g.save(); g.translate(hx, hy); g.rotate(tilt);
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  const r = g.createRadialGradient(-rx * 0.35, -ry * 0.4, rx * 0.1, 0, 0, rx * 1.1); r.addColorStop(0, rim); r.addColorStop(0.45, head); r.addColorStop(1, shade);
  g.fillStyle = r; g.fill(); outline(g, S);
  g.beginPath(); g.ellipse(-rx * 0.35, -ry * 0.38, rx * 0.32, ry * 0.2, -0.2, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();   // shine
  g.restore();
}

function teacher(g, S) {
  note(g, S, { head: '#ffc93c', shade: '#d9781c', rim: '#fff4c4', glow: 'rgba(255,214,110,.75)' });
}
function student(g, S) {
  // a white rim behind it so it reads on the busy painting
  g.save(); g.shadowColor = 'rgba(255,255,255,.95)'; g.shadowBlur = S * 0.06;
  note(g, S, { head: '#3f8cff', shade: '#1b3fae', rim: '#d8ecff', flag: true });
  g.restore();
}
function spark(g, S) {
  const c = S / 2;
  const r = g.createRadialGradient(c, c, 0, c, c, c); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,230,150,.9)'); r.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = r; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fffbe8';
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, L = i % 2 ? 0.3 : 0.47;
    g.save(); g.translate(c, c); g.rotate(a); g.beginPath(); g.moveTo(-S * 0.025, 0); g.lineTo(0, -S * L); g.lineTo(S * 0.025, 0); g.closePath(); g.fill(); g.restore();
  }
}
function halo(g, S) {
  const c = S / 2;
  const r = g.createRadialGradient(c, c, S * 0.2, c, c, S * 0.5);
  r.addColorStop(0, 'rgba(255,240,190,0)'); r.addColorStop(0.55, 'rgba(255,225,140,.55)'); r.addColorStop(0.72, 'rgba(255,255,255,.95)'); r.addColorStop(0.85, 'rgba(255,200,90,.45)'); r.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
}

export function thingCanvas(kind, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  ({ teacher, student, spark, halo })[kind](g, size);
  return c;
}

// the six round shapes in the painting that light up, one for each note sung in tune (u, v of the 673 × 674 painting; r = radius)
export const CIRCLES = [
  { u: 0.445, v: 0.085, r: 0.085, name: 'the white moon' },
  { u: 0.18, v: 0.07, r: 0.055, name: 'the coloured ball' },
  { u: 0.758, v: 0.352, r: 0.09, name: 'the golden sun' },
  { u: 0.875, v: 0.565, r: 0.04, name: 'the red circle' },
  { u: 0.215, v: 0.725, r: 0.035, name: 'the blue ball' },
  { u: 0.755, v: 0.745, r: 0.055, name: 'the yellow moon' },
];
