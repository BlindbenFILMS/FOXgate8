// Shared canvas textures (moved out of meru-game.js; every world uses these).
import * as THREE from '../vendor/three/three.module.js';

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
export const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
// a world's round emblem; Meru's is the default
export function emblemTex(letter = 'M', cols = { outer: '#c42d3c', ring: '#e6b45a', bg: '#151b3d', stroke: '#7dd3fc' }) {
  return canvasTex(256, 256, (g) => {
    const c = 128; const ring = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); };
    ring(126, cols.outer); ring(100, cols.ring); ring(92, cols.bg);
    g.fillStyle = '#ffffff'; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(a) * 113, c + Math.sin(a) * 113, 4, 0, 7); g.fill(); }
    g.font = `900 120px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = cols.stroke; g.strokeText(letter, c, c + 8); g.fillText(letter, c, c + 8);
  });
}
export function crestTex(letter, ring, bg = '#070a13', fg = '#ffffff') {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = ring; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill();
    g.fillStyle = fg; g.font = `900 70px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 68);
  });
}
export function signTex(text, glyph, accent = '#d9a64a', glow = '#f6e7c8') {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#141a33'; g.fillRect(0, 0, w, h); g.strokeStyle = accent; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = glow; g.font = `900 ${text.length > 8 ? 52 : 66}px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(text, 34, h / 2 + 3);
    const tw = g.measureText(text).width; if (glyph) glyph(g, 34 + tw + 24, h / 2, accent);
  });
}
export function bannerTex(letter = 'M', cloth = '#1b2350', trim = '#e6b45a', bg = '#151b3d') {
  return canvasTex(128, 256, (g) => {
    g.fillStyle = cloth; g.beginPath(); g.moveTo(8, 0); g.lineTo(120, 0); g.lineTo(120, 220); g.lineTo(64, 252); g.lineTo(8, 220); g.closePath(); g.fill();
    g.strokeStyle = trim; g.lineWidth = 6; g.stroke();
    g.fillStyle = trim; g.beginPath(); g.arc(64, 120, 40, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(64, 120, 32, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = `900 40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 123);
  });
}
export const cobbleTex = (r, cols = ['#878bb6', '#9296bd', '#8b8fb9', '#9a9ec5', '#7f84ad'], grout = '#5c608c') => canvasTex(256, 256, (g) => {
  g.fillStyle = grout; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let k = -1; k < 5; k++) { const x = k * 64 + (row % 2 ? 32 : 0) + 3, y = row * 32 + 3; g.fillStyle = cols[(row * 7 + k * 3 + 10) % cols.length]; g.beginPath(); g.roundRect(x, y, 58, 26, 9); g.fill(); }
}, r);
export const plazaTex = (r, a = '#cfcbe0', b = '#c1bcd6') => canvasTex(256, 256, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 256, 256); g.fillStyle = b; g.fillRect(128, 0, 128, 128); g.fillRect(0, 128, 128, 128);
  g.strokeStyle = 'rgba(80,76,120,0.18)'; g.lineWidth = 2; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
}, r);
export const asphaltTex = (r, base = '#4b4f6e') => canvasTex(128, 128, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
}, r);
