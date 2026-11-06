// REACHING PAST BLINDNESS (Rusty Perez): the drawn props for "Reach Out".
// Eight listeners waiting in the dark around the edge of the painting, each in two poses:
//   'wait'  : a dark figure with a coloured outline, one hand cupped to the ear, listening
//   'cheer' : lit up in their own colour, arms in the air
// plus a soft comet streak (the travelling colour ray) and a note. All drawn in canvas, no emoji.
// draw*(g, W, H, …) are plain canvas drawings (so they can be previewed anywhere); *Tex() wrap them as textures.
import * as K from './kit.js';

// each listener's colour (also the colour of the ray that reaches them)
export const COLORS = ['#ff5a5f', '#ffb13b', '#ffe14d', '#5fe08a', '#3fd4ff', '#5b8cff', '#b86bff', '#ff6bc8'];
// who they are: a kid, a woman, a man in a cap, a woman with a white cane, an older man in a hat,
// someone in a wheelchair, a teen with headphones, a man with his guide dog
export const KINDS = ['kid', 'woman', 'cap', 'cane', 'hat', 'chair', 'phones', 'dog'];

const DARK = '#14121c';

// one listener, feet at the bottom of a W×H box (designed at 256×320)
export function drawListener(g, W, H, kind = 'woman', pose = 'wait', color = '#ffb13b') {
  g.save();
  const s = Math.min(W / 256, H / 320); g.translate(W / 2, H); g.scale(s, s);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const lit = pose === 'cheer';
  // a soft halo behind, so the figure reads on the busy painting (dark when waiting, their colour when lit)
  const hal = g.createRadialGradient(0, -150, 20, 0, -150, 150);
  if (lit) { hal.addColorStop(0, hexA(color, 0.75)); hal.addColorStop(0.55, hexA(color, 0.28)); hal.addColorStop(1, hexA(color, 0)); }
  else { hal.addColorStop(0, 'rgba(6,5,10,.75)'); hal.addColorStop(0.6, 'rgba(6,5,10,.35)'); hal.addColorStop(1, 'rgba(6,5,10,0)'); }
  g.fillStyle = hal; g.fillRect(-128, -320, 256, 320);

  const small = kind === 'kid' ? 0.74 : 1;
  const sit = kind === 'chair';
  // body measurements (y up is negative)
  const footY = -8, hipY = sit ? -96 : -118 * small - 8, shY = sit ? -190 : hipY - 92 * small, headY = shY - 40 * small, headR = 30 * small;
  const one = kind === 'cane' || kind === 'dog' || kind === 'hat';   // holds something with the left hand

  // the figure as a list of strokes; drawn twice: a fat coloured outline, then the body on top
  const body = (col, extra) => {
    g.strokeStyle = col; g.fillStyle = col;
    const L = (w, pts) => { g.lineWidth = w + extra; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
    // the wheelchair, behind
    if (sit) {
      g.lineWidth = 9 + extra; g.beginPath(); g.arc(-6, -54, 48, 0, Math.PI * 2); g.stroke();
      L(9, [-44, -150, -44, -96, 40, -96]); L(9, [40, -96, 52, -40, 66, -34]);
      g.beginPath(); g.arc(70, -14, 10 + extra / 2, 0, Math.PI * 2); g.fill();
    }
    // legs
    if (sit) { L(26 * small, [-10, hipY, 44, hipY + 2, 52, -30]); L(26 * small, [8, hipY, 60, hipY + 4, 66, -30]); }
    else { L(28 * small, [-14 * small, hipY, -22 * small, footY]); L(28 * small, [14 * small, hipY, 22 * small, footY]); }
    // torso
    g.lineWidth = extra; g.beginPath();
    const tw = 34 * small;
    if (kind === 'woman' || kind === 'cane') { g.moveTo(-tw, shY + 6); g.lineTo(tw, shY + 6); g.lineTo(tw + 18, hipY + 14); g.lineTo(-tw - 18, hipY + 14); }   // a dress
    else { g.moveTo(-tw, shY + 4); g.lineTo(tw, shY + 4); g.lineTo(tw - 4, hipY + 8); g.lineTo(-tw + 4, hipY + 8); }
    g.closePath(); g.fill(); if (extra) g.stroke();
    // arms
    const aw = 20 * small, sx = tw - 4;
    if (lit) {
      L(aw, [sx, shY + 10, sx + 30 * small, shY - 40 * small, sx + 40 * small, shY - 92 * small]);   // right arm up
      if (one) L(aw, [-sx, shY + 10, -sx - 26 * small, shY + 52 * small, -sx - 34 * small, shY + 92 * small]);
      else L(aw, [-sx, shY + 10, -sx - 30 * small, shY - 40 * small, -sx - 40 * small, shY - 92 * small]);
    } else {
      // right hand cupped to the ear, listening
      L(aw, [sx, shY + 10, sx + 34 * small, shY + 44 * small, headR * 0.95 + 6, headY + 4]);
      if (sit) L(aw, [-sx, shY + 10, -sx - 6, shY + 60, -sx + 30, shY + 80]);
      else L(aw, [-sx, shY + 10, -sx - 20 * small, shY + 52 * small, -sx - 26 * small, shY + 92 * small]);
    }
    // the white cane / walking stick (in the left hand)
    if (kind === 'cane' || kind === 'hat') {
      const hx = -sx - (lit ? 34 : 26) * small, hy = shY + 92 * small;
      L(8, [hx, hy, hx - 30, footY]);
    }
    // the guide dog on its harness, by the left leg
    if (kind === 'dog') {
      const hx = -sx - (lit ? 34 : 26), hy = shY + 92;
      g.beginPath(); g.ellipse(-92, -62, 44, 20, 0, 0, Math.PI * 2); g.fill(); if (extra) g.stroke();   // body
      L(12, [-122, -50, -126, footY]); L(12, [-108, -50, -110, footY]); L(12, [-74, -50, -72, footY]); L(12, [-60, -52, -56, footY]);   // legs
      L(18, [-56, -74, -40, -100]); g.beginPath(); g.ellipse(-32, -104, 20, 15, -0.2, 0, Math.PI * 2); g.fill(); if (extra) g.stroke();   // neck, head
      L(10, [-20, -104, -8, -98]);   // snout
      L(8, [-134, -66, -150, lit ? -92 : -80]);   // tail (wagging up when happy)
      L(7, [-80, -80, -84, -112, hx + 4, hy]);   // the harness handle to the hand
    }
    // head
    g.beginPath(); g.arc(0, headY, headR + extra / 2, 0, Math.PI * 2); g.fill();
    // hair and hats
    if (kind === 'woman' || kind === 'cane') { g.beginPath(); g.ellipse(0, headY + 14, headR + 8 + extra / 2, headR + 24 + extra / 2, 0, Math.PI * 1.02, Math.PI * 1.98, true); g.fill(); }
    if (kind === 'kid') { L(14, [-headR + 2, headY - 8, -headR - 24, headY + 14]); g.beginPath(); g.arc(-headR - 26, headY + 18, 11 + extra / 2, 0, Math.PI * 2); g.fill(); }   // ponytail
    if (kind === 'cap') { g.beginPath(); g.ellipse(0, headY - 12, headR + 3 + extra / 2, 16 + extra / 2, 0, Math.PI, 0); g.fill(); L(10, [6, headY - 10, headR + 26, headY - 6]); }
    if (kind === 'hat') { L(10, [-headR - 18, headY - 16, headR + 18, headY - 16]); g.beginPath(); g.rect(-headR + 4 - extra / 2, headY - 46 - extra / 2, (headR - 4) * 2 + extra, 32 + extra); g.fill(); }
    if (kind === 'phones') { g.lineWidth = 9 + extra; g.beginPath(); g.arc(0, headY, headR + 8, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.beginPath(); g.ellipse(-headR - 4, headY + 2, 9 + extra / 2, 15 + extra / 2, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(headR + 4, headY + 2, 9 + extra / 2, 15 + extra / 2, 0, 0, Math.PI * 2); g.fill(); }
  };
  if (lit) {
    body('#ffffff', 14);           // a bright white outline
    const grd = g.createLinearGradient(0, headY - headR, 0, 0); grd.addColorStop(0, lighten(color, 0.45)); grd.addColorStop(1, color);
    body(grd, 0);
  } else {
    body(color, 12);               // their colour as an outline, so you can see who is waiting
    body(DARK, 0);
  }
  // the white cane's red tip and white shaft show in both poses
  if (kind === 'cane') {
    const sx = 34 - 4, hx = -sx - (lit ? 34 : 26), hy = shY + 92;
    g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - 28, footY - 18); g.stroke();
    g.strokeStyle = '#e8222a'; g.beginPath(); g.moveTo(hx - 28, footY - 18); g.lineTo(hx - 30, footY); g.stroke();
  }
  // a big smile when lit
  if (lit) { g.strokeStyle = 'rgba(20,18,28,.85)'; g.lineWidth = 5; g.beginPath(); g.arc(6 * small, headY + 4 * small, 13 * small, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  g.restore();
}

// the travelling colour ray: a soft comet streak pointing right, white-hot at the head
export function drawStreak(g, W, H) {
  const grd = g.createLinearGradient(0, 0, W, 0);
  grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.7, 'rgba(255,255,255,.55)'); grd.addColorStop(1, 'rgba(255,255,255,1)');
  g.fillStyle = grd; g.beginPath(); g.moveTo(0, H / 2); g.quadraticCurveTo(W * 0.6, H * 0.1, W - H * 0.42, H * 0.1); g.arc(W - H * 0.42, H / 2, H * 0.4, -Math.PI / 2, Math.PI / 2); g.quadraticCurveTo(W * 0.6, H * 0.9, 0, H / 2); g.fill();
}
// a music note (two beamed quavers), white so it can be tinted
export function drawNote(g, W, H) {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 128; g.scale(s, s);
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.ellipse(-26, 30, 17, 12, -0.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(28, 20, 17, 12, -0.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-12, 26); g.lineTo(-12, -40); g.lineTo(42, -50); g.lineTo(42, 16); g.stroke();
  g.lineWidth = 14; g.beginPath(); g.moveTo(-12, -36); g.lineTo(42, -46); g.stroke();
  g.restore();
}

/* textures (cached) */
const cache = new Map();
const once = (key, make) => { if (!cache.has(key)) { const t = make(); t._shared = true; cache.set(key, t); } return cache.get(key); };
export const listenerTex = (i, pose) => once('L' + i + pose, () => K.canvasTex(256, 320, (g, W, H) => drawListener(g, W, H, KINDS[i], pose, COLORS[i])));
export const streakTex = () => once('streak', () => K.canvasTex(256, 64, drawStreak));
export const noteTex = () => once('note', () => K.canvasTex(128, 128, drawNote));

/* little colour helpers */
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function lighten(hex, k) { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * k)); return `rgb(${c[0]},${c[1]},${c[2]})`; }
