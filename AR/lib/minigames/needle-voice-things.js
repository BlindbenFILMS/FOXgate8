// MOVE THE NEEDLE: the drawn pieces for "Your voice moves the needle".
// A big studio VU meter (ivory face, black scale, red zone, a black needle that swings with your voice), drawn in
// code in the kit's style, plus the painting's own little oval marks (for the sparks that fly off the wave).
//   meter(width) → { group, set(v 0..1), zone(null | 'mid' | 'red' | 'all'), flash(), tick(t, dt), value }
//   markTex(color) → a small oval mark like the painting's
//   drawMeter(g, v, zone) → the whole meter as one flat drawing (for Ben's props sheet)
import * as THREE from 'three';
import * as K from './kit.js';

const RED = '#ec3013', BLUE = '#1f4fd8';
export const FW = 512, FH = 380, PX = 256, PY = 340, RAD = 228;   // face size; the needle's pivot; the scale's radius
export const MID = [0.32, 0.68], REDZ = 0.8;                      // the middle zone; where the red starts
const ANG = v => -0.87 + Math.max(0, Math.min(1, v)) * 1.74;      // −50° … +50°
const at = (v, r) => [PX + Math.sin(ANG(v)) * r, PY - Math.cos(ANG(v)) * r];
const FONT = s => `900 ${s}px Archivo, "Arial Black", Arial, sans-serif`;

function arc(g, v0, v1, r, w, color) {
  g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'butt';
  g.beginPath(); g.arc(PX, PY, r, -Math.PI / 2 + ANG(v0), -Math.PI / 2 + ANG(v1)); g.stroke();
}
// the meter's face: black frame, ivory window, the scale
export function drawFace(g) {
  g.fillStyle = '#000'; g.fillRect(0, 0, FW, FH);
  const win = g.createLinearGradient(0, 24, 0, 300); win.addColorStop(0, '#fbf3dc'); win.addColorStop(1, '#efdcae');
  g.fillStyle = win; g.fillRect(22, 22, FW - 44, 270);
  // the scale: a thick black arc, red from 0 VU up
  arc(g, 0, REDZ, RAD, 8, '#111'); arc(g, REDZ, 1, RAD, 16, RED);
  const ticks = [[0, '20'], [0.3, '10'], [0.5, '5'], [0.62, '3'], [0.72, '1'], [0.8, '0'], [1, '+3']];
  for (let i = 0; i <= 20; i++) { const v = i / 20, [x0, y0] = at(v, RAD + 4), [x1, y1] = at(v, RAD + (i % 5 ? 14 : 26)); g.strokeStyle = v >= REDZ ? RED : '#111'; g.lineWidth = i % 5 ? 3 : 6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const [v, t] of ticks) { const [x, y] = at(v, RAD + 46); g.fillStyle = v >= REDZ ? RED : '#111'; g.font = FONT(t.length > 1 ? 24 : 28); g.fillText(t, x, y); }
  g.fillStyle = '#111'; g.font = FONT(68); g.fillText('VU', PX, 228);
  g.font = FONT(22); g.textAlign = 'left'; g.fillText('SOFT', 44, 272); g.textAlign = 'right'; g.fillStyle = RED; g.fillText('LOUD', FW - 44, 272);
}
// the bottom strip that hides the needle's pivot (it sits in front of the needle)
export function drawBezel(g) {
  g.fillStyle = '#000'; g.fillRect(0, 0, FW, 88);
  g.fillStyle = RED; g.fillRect(0, 76, FW, 12);
  g.fillStyle = '#fff'; g.font = FONT(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('YOUR VOICE', PX, 38);
}
// a coloured band on the scale: the middle zone (blue, with HOLD written on it) or the red zone glowing
export function drawZone(g, kind) {
  if (kind === 'mid') {
    arc(g, MID[0], MID[1], RAD - 26, 30, 'rgba(31,79,216,.85)');
    for (const v of MID) { const [x0, y0] = at(v, RAD - 46), [x1, y1] = at(v, RAD - 6); g.strokeStyle = BLUE; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.fillStyle = '#fff'; g.font = FONT(20); g.textAlign = 'center'; g.textBaseline = 'middle'; const [x, y] = at(0.5, RAD - 26); g.fillText('HOLD', x, y + 1);
  } else if (kind === 'red') {
    g.save(); g.filter = 'blur(8px)'; arc(g, REDZ - 0.02, 1.02, RAD, 44, 'rgba(236,48,19,.9)'); g.restore(); arc(g, REDZ, 1, RAD, 16, RED);
  }
}
export function drawNeedle(g, W, H) {
  // a long black needle with a red tip, pointing up; the pivot is at the bottom centre
  g.fillStyle = '#111'; g.beginPath(); g.moveTo(W / 2 - 5, H); g.lineTo(W / 2 - 2.5, 0); g.lineTo(W / 2 + 2.5, 0); g.lineTo(W / 2 + 5, H); g.closePath(); g.fill();
  g.fillStyle = RED; g.fillRect(W / 2 - 3, 0, 6, 46);
}
// the whole meter as one picture (for the props sheet)
export function drawMeter(g, v = 0.5, zone = null) {
  drawFace(g); if (zone) drawZone(g, zone);
  g.save(); g.translate(PX, PY); g.rotate(ANG(v)); const n = document.createElement('canvas'); n.width = 20; n.height = RAD + 20; drawNeedle(n.getContext('2d'), 20, RAD + 20); g.drawImage(n, -10, -(RAD + 20)); g.restore();
  g.save(); g.translate(0, 292); drawBezel(g); g.restore();
}

export function meter(width) {
  const s = width / FW, group = new THREE.Group(), h = FH * s;
  const face = K.plane(K.canvasTex(FW, FH, drawFace), width, h, { order: 40 }); group.add(face);
  const zones = {};
  for (const k of ['mid', 'red']) { const z = K.plane(K.canvasTex(FW, FH, g => drawZone(g, k)), width, h, { order: 41, opacity: 0 }); z.position.z = 0.001; group.add(z); zones[k] = z; }
  // the needle turns around the pivot (PX, PY on the face)
  const pivot = new THREE.Group(); pivot.position.set(0, h / 2 - PY * s, 0.002); group.add(pivot);
  const NH = (RAD + 20) * s, needle = K.plane(K.canvasTex(20, RAD + 20, (g, W, H) => drawNeedle(g, W, H)), 20 * s, NH, { order: 42 });
  needle.position.set(0, NH / 2, 0); pivot.add(needle);
  const tip = K.sprite(K.glowTex, width * 0.14, { color: '#ff6a3a', additive: true, order: 43, opacity: 0 }); tip.position.set(0, RAD * s * 0.95, 0.001); pivot.add(tip);
  const bez = K.plane(K.canvasTex(FW, 88, drawBezel), width, 88 * s, { order: 44 }); bez.position.set(0, -h / 2 + 44 * s, 0.003); group.add(bez);
  let shown = 0, target = 0, vel = 0, flash = 0, zone = null; const zop = { mid: 0, red: 0 };
  return {
    group,
    set(v) { target = Math.max(0, Math.min(1.05, v)); },
    zone(k) { zone = k; },
    flash() { flash = 1; },
    get value() { return shown; },
    tick(t, dt) {
      // VU ballistics: quick but springy, a little overshoot, then it settles
      vel += (target - shown) * 90 * dt; vel *= Math.pow(0.0008, dt); shown += vel * dt;
      pivot.rotation.z = -ANG(shown + Math.sin(t * 31) * 0.003);
      flash = Math.max(0, flash - dt * 1.2);
      tip.material.opacity = Math.max(flash, shown >= REDZ ? 0.8 : 0);
      for (const k of ['mid', 'red']) { const on = zone === k || zone === 'all' ? 1 : 0; zop[k] += (on - zop[k]) * Math.min(1, dt * 5); zones[k].material.opacity = zop[k] * (k === 'red' ? 0.7 + 0.3 * Math.sin(t * 6) : 1); }
    },
  };
}

// the painting's little oval marks, for the sparks flying off the wave
const markCache = new Map();
export const MARK_COLORS = ['#ffffff', '#cfe6f5', '#5aa0e0', '#f5d24a', '#f08a2a', '#e8322a'];
export function markTex(color) {
  if (!markCache.has(color)) markCache.set(color, K.canvasTex(32, 64, g => { g.fillStyle = color; g.beginPath(); g.ellipse(16, 32, 10, 24, 0.08, 0, Math.PI * 2); g.fill(); }));
  return markCache.get(color);
}
