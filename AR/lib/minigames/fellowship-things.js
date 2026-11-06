// FELLOWSHIP: the eight friends, drawn the way Nikki's painting draws people: soft rounded head-and-shoulders shapes in
// translucent watercolour, a darker wash at the edges, paper grain, a simple profile and hair. No emoji.
// friend(f, size) → { group, opacity(v), tick(t), glow(v) }: a group you put on the painting; size is its width (board units).
import * as THREE from 'three';
import * as K from './kit.js';

const W = 256, H = 320;
// a seeded random, so each friend's paper texture is the same every game
function rnd(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };

// draw a shape as a watercolour wash: soft fill, darker pooled edge, blotches and grain
function wash(g, path, col, R) {
  g.save(); path(g); g.clip();
  g.fillStyle = col; g.globalAlpha = 0.86; path(g); g.fill();
  for (let i = 0; i < 26; i++) {                       // blotches of lighter and darker pigment
    const x = R() * W, y = R() * H, r = 14 + R() * 40;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); const dark = R() < 0.5;
    gr.addColorStop(0, dark ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.globalAlpha = 0.18; g.fillStyle = '#000';            // paper grain
  for (let i = 0; i < 900; i++) g.fillRect(R() * W, R() * H, 1 + R() * 1.5, 1);
  g.restore();
  g.save(); g.globalAlpha = 0.55; g.strokeStyle = shade(col, 0.6); g.lineWidth = 6; g.filter = 'blur(1.5px)'; path(g); g.stroke(); g.restore();   // pooled edge
}

export function drawFriend(f) {
  return K.canvasTex(W, H, (g) => {
    const R = rnd(f.seed);
    const dir = f.face;                                   // +1 faces right, −1 faces left
    // shoulders: a big rounded egg, like the bodies in the painting
    const body = p => { p.beginPath(); p.moveTo(18, H - 6); p.bezierCurveTo(10, 190, 70, 150, 128, 150); p.bezierCurveTo(186, 150, 246, 190, 238, H - 6); p.closePath(); };
    wash(g, body, f.color, R);
    // the head: a round shape with a little nose on the side they face
    const hx = 128, hy = 96, hr = 56;
    const head = p => { p.beginPath(); p.arc(hx, hy, hr, 0, Math.PI * 2); p.moveTo(hx + dir * (hr - 4), hy - 4); p.lineTo(hx + dir * (hr + 9), hy + 12); p.lineTo(hx + dir * (hr - 2), hy + 18); p.closePath(); };
    wash(g, head, f.skin, R);
    // hair
    const hair = p => { p.beginPath(); p.ellipse(hx - dir * 10, hy - 10, hr + 4, hr - 4, 0, Math.PI * 0.95, Math.PI * 2.05); p.closePath(); };
    if (f.hair === 'cap') { wash(g, p => { p.beginPath(); p.ellipse(hx - dir * 4, hy - 26, hr + 2, 40, 0, Math.PI, 0); p.closePath(); }, f.hairCol, R); wash(g, p => { p.beginPath(); p.arc(hx - dir * 52, hy - 4, 22, 0, Math.PI * 2); }, f.hairCol, R); }
    else if (f.hair === 'long') { wash(g, p => { p.beginPath(); p.moveTo(hx - dir * 60, hy + 70); p.quadraticCurveTo(hx - dir * 70, hy - 70, hx + dir * 10, hy - 60); p.quadraticCurveTo(hx + dir * 50, hy - 52, hx + dir * 46, hy - 20); p.lineTo(hx - dir * 10, hy - 18); p.quadraticCurveTo(hx - dir * 20, hy + 40, hx - dir * 60, hy + 70); p.closePath(); }, f.hairCol, R);
      g.save(); g.strokeStyle = shade(f.hairCol, 0.7); g.globalAlpha = 0.5; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(hx - dir * (6 + i * 5), hy - 52 + i * 2); g.quadraticCurveTo(hx - dir * (40 + i * 2), hy, hx - dir * (54 - i), hy + 60); g.stroke(); } g.restore(); }
    else if (f.hair === 'short') wash(g, hair, f.hairCol, R);
    // a closed, calm eye and a small smile, on the side they face
    g.strokeStyle = 'rgba(25,20,20,.75)'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.arc(hx + dir * 26, hy + 2, 7, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.beginPath(); g.arc(hx + dir * 34, hy + 30, 9, 0.2 * Math.PI, 0.7 * Math.PI); g.stroke();
  });
}

// a soft warm halo that shows around a friend when they are calling or coming home
const halo = K.canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,240,200,.9)'); r.addColorStop(0.5, 'rgba(255,220,160,.35)'); r.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });

export function friend(f, size) {
  const group = new THREE.Group();
  const glowS = K.sprite(halo, size * 1.9, { order: 18, opacity: 0, additive: true }); glowS.position.z = -0.001; group.add(glowS);
  const m = K.plane(drawFriend(f), size, size * H / W, { order: 20, opacity: 0 }); group.add(m);
  const ph = f.seed * 1.7; let op = 0, gl = 0;
  return {
    group, mesh: m,
    opacity(v) { op = v; },
    glow(v) { gl = v; },
    tick(t) {
      m.material.opacity = op * 0.92;
      m.position.y = Math.sin(t * 1.6 + ph) * size * 0.03;               // a gentle bob
      m.rotation.z = Math.sin(t * 0.9 + ph) * 0.05;                      // and sway
      const br = 1 + Math.sin(t * 2.1 + ph) * 0.015; m.scale.set(br, br, 1);   // breathing
      glowS.material.opacity = op * gl * (0.6 + 0.25 * Math.sin(t * 3 + ph));
    },
  };
}

// the eight friends, each tied to a figure in the painting: where they sit (u, v), their colours, voice and note
export const FRIENDS = [
  { id: 'slate', u: 0.37, v: 0.15, color: '#4f7480', skin: '#5f7d84', hair: 'none', hairCol: '#2e4a52', face: 1, voice: 120, note: 50, seed: 3 },
  { id: 'amber', u: 0.55, v: 0.16, color: '#f2b52c', skin: '#6a4030', hair: 'long', hairCol: '#f3c64a', face: -1, voice: 230, note: 57, seed: 7 },
  { id: 'rose', u: 0.69, v: 0.24, color: '#ef8a78', skin: '#f2a08e', hair: 'cap', hairCol: '#1f5c78', face: -1, voice: 250, note: 62, seed: 11 },
  { id: 'teal', u: 0.26, v: 0.42, color: '#2f7d86', skin: '#3d3530', hair: 'short', hairCol: '#58806a', face: 1, voice: 215, note: 66, seed: 17 },
  { id: 'orange', u: 0.42, v: 0.4, color: '#e2742e', skin: '#2e2622', hair: 'long', hairCol: '#3a2a24', face: -1, voice: 200, note: 69, seed: 23 },
  { id: 'coral', u: 0.25, v: 0.6, color: '#df5a48', skin: '#e2a074', hair: 'short', hairCol: '#c0443a', face: 1, voice: 300, note: 74, seed: 29 },
  { id: 'smoke', u: 0.48, v: 0.62, color: '#4a4c52', skin: '#2a2a2e', hair: 'short', hairCol: '#1c1c20', face: -1, voice: 140, note: 76, seed: 31 },
  { id: 'olive', u: 0.47, v: 0.82, color: '#8a8a2c', skin: '#e7b23a', hair: 'none', hairCol: '#6b6b22', face: 1, voice: 170, note: 81, seed: 37 },
];
