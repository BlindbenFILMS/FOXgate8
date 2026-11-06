// FELLOWSHIP · PASS IT ON: the drawn pieces. The warm glow that travels around the circle (like a squeeze of the
// hand: a soft amber light with a brighter heart and a watercolour edge), the ring that pulses when it lands, and the
// eight friends of the circle (where each one is in Nikki's painting, in ring order, with their colour and note).
import * as K from './kit.js';

// the glow: amber and rose, soft-edged like wet paint, with a bright warm heart
export const orbTex = K.canvasTex(256, 256, (g) => {
  const c = 128;
  let r = g.createRadialGradient(c, c, 0, c, c, 128);
  r.addColorStop(0, 'rgba(255,250,225,1)'); r.addColorStop(0.18, 'rgba(255,214,140,.95)'); r.addColorStop(0.45, 'rgba(245,150,90,.45)'); r.addColorStop(1, 'rgba(240,120,90,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  // two soft overlapping petals of colour, like the overlapping figures
  for (const [dx, col] of [[-22, 'rgba(255,190,90,.35)'], [22, 'rgba(240,130,120,.3)']]) {
    r = g.createRadialGradient(c + dx, c, 0, c + dx, c, 70); r.addColorStop(0, col); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.beginPath(); g.arc(c + dx, c, 70, 0, Math.PI * 2); g.fill();
  }
});
// the landing ring: a warm brush circle
export const pulseTex = K.canvasTex(256, 256, (g) => {
  g.strokeStyle = 'rgba(255,226,170,.95)'; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.arc(128, 128, 104, 0.1, Math.PI * 1.95); g.stroke();
  g.strokeStyle = 'rgba(245,160,110,.6)'; g.lineWidth = 5; g.beginPath(); g.arc(128, 128, 92, 0.6, Math.PI * 2.4); g.stroke();
});
// a friend's place in the circle: a small soft dot (dim until the glow comes near)
export const spotTex = K.canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,240,210,.9)'); r.addColorStop(0.35, 'rgba(255,220,170,.4)'); r.addColorStop(1, 'rgba(255,220,170,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});

// the eight friends, clockwise around the group from the top left (u, v on the painting), their colour and note (D major)
export const RING = [
  { id: 'slate', u: 0.37, v: 0.15, color: '#4f7480', note: 62 },
  { id: 'amber', u: 0.55, v: 0.15, color: '#f2b52c', note: 66 },
  { id: 'rose', u: 0.69, v: 0.24, color: '#ef8a78', note: 69 },
  { id: 'ochre', u: 0.64, v: 0.37, color: '#d6943a', note: 71 },
  { id: 'gray', u: 0.72, v: 0.63, color: '#7d8a8c', note: 74 },
  { id: 'olive', u: 0.47, v: 0.82, color: '#8a8a2c', note: 76 },
  { id: 'coral', u: 0.25, v: 0.58, color: '#df5a48', note: 78 },
  { id: 'teal', u: 0.26, v: 0.4, color: '#2f7d86', note: 81 },
];
