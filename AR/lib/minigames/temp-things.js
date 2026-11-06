// THE TEMPERATURE SETTER: the props for Hands Up, Hands Down, drawn in code to sit in the painting's
// golden stage haze: dark warm-brown ink, amber light from above and behind (the stage blaze).
//   drawThing(ctx, kind, S)  draws one prop into an S × S canvas.
//   thingCanvas(kind, S=256) returns a new canvas with it drawn.
//   heatColor(t)             the meter's colour for a heat t in 0..1 (cool blue → gold → red hot).
const INK = '#2a1608';

function lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function rad(c, x, y, r0, x1, y1, r1, stops) { const g = c.createRadialGradient(x, y, r0, x1, y1, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function stroke(c, w, col = INK) { c.lineWidth = w; c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }

// One hand, open, fingers spread, wrist at (0,0) pointing up (-y). len = wrist-to-fingertip.
function hand(c, len, fill, line) {
  const pw = len * .5, ph = len * .46, fw = pw * .27;
  const path = () => {
    c.beginPath();
    c.moveTo(-pw * .4, 0); c.quadraticCurveTo(-pw * .58, -ph * .55, -pw * .5, -ph); c.lineTo(pw * .5, -ph); c.quadraticCurveTo(pw * .58, -ph * .55, pw * .4, 0); c.closePath();
    const fingers = [[-.37, -.16, .48], [-.125, -.05, .56], [.125, .05, .54], [.37, .15, .44]];
    for (const [fx, a, L] of fingers) {
      const bx = fx * pw, by = -ph * .9, tx = bx + Math.sin(a) * len * L, ty = by - Math.cos(a) * len * L;
      c.moveTo(bx - fw / 2, by); c.lineTo(tx - fw / 2, ty); c.arc(tx, ty, fw / 2, Math.PI, 0); c.lineTo(bx + fw / 2, by); c.closePath();
    }
    // thumb: out to the side from the lower palm
    const t0x = -pw * .42, t0y = -ph * .35, t1x = -pw * .95, t1y = -ph * 1.05, tw = fw * 1.1;
    const ang = Math.atan2(t1y - t0y, t1x - t0x), nx = -Math.sin(ang) * tw / 2, ny = Math.cos(ang) * tw / 2;
    c.moveTo(t0x + nx, t0y + ny); c.lineTo(t1x + nx, t1y + ny); c.arc(t1x, t1y, tw / 2, ang + Math.PI / 2, ang - Math.PI / 2, true); c.lineTo(t0x - nx, t0y - ny); c.closePath();
  };
  path(); c.fillStyle = fill; c.fill('nonzero');
  if (line) { // outline only the outside edge: stroke, then refill to hide inner seams
    path(); c.lineWidth = line * 2; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); path(); c.fill('nonzero'); }
}
function arrow(c, x, y, s, up) {   // a big chunky arrow, white with dark outline
  c.save(); c.translate(x, y); if (!up) c.rotate(Math.PI);
  c.beginPath(); c.moveTo(0, -s); c.lineTo(s * .75, -s * .1); c.lineTo(s * .3, -s * .1); c.lineTo(s * .3, s * .8); c.lineTo(-s * .3, s * .8); c.lineTo(-s * .3, -s * .1); c.lineTo(-s * .75, -s * .1); c.closePath();
  c.fillStyle = '#ffffff'; c.fill(); stroke(c, s * .1, '#000'); c.restore();
}

const DRAW = {
  handsUp(c, S) {   // the HANDS UP button picture: two hands thrown high, a big up arrow between them
    for (const s of [-1, 1]) { c.save(); c.translate(S * .5 + s * S * .27, S * .9); c.rotate(s * .18);
      c.fillStyle = lin(c, 0, 0, 0, -S * .3, [[0, '#7a3c12'], [1, '#c9701f']]); c.beginPath(); c.roundRect(-S * .055, -S * .32, S * .11, S * .34, S * .05); c.fill(); stroke(c, S * .014);
      c.translate(0, -S * .3); hand(c, S * .36, lin(c, 0, 0, 0, -S * .36, [[0, '#d9873a'], [1, '#ffd08a']]), S * .014); c.restore(); }
    arrow(c, S * .5, S * .42, S * .2, true);
  },
  handsDown(c, S) {   // the HANDS DOWN button picture: two hands pressing down, palms flat, a big down arrow
    for (const s of [-1, 1]) { c.save(); c.translate(S * .5 + s * S * .27, S * .12); c.rotate(Math.PI + s * -.15);
      c.fillStyle = lin(c, 0, 0, 0, -S * .2, [[0, '#7a3c12'], [1, '#c9701f']]); c.beginPath(); c.roundRect(-S * .055, -S * .2, S * .11, S * .22, S * .05); c.fill(); stroke(c, S * .014);
      c.translate(0, -S * .19); hand(c, S * .33, lin(c, 0, 0, 0, -S * .33, [[0, '#d9873a'], [1, '#ffd08a']]), S * .014); c.restore(); }
    arrow(c, S * .5, S * .6, S * .2, false);
  },
  crowdHand(c, S) {   // one crowd hand reaching up, a dark silhouette with a golden rim light (for the wave)
    c.save(); c.translate(S * .5, S); c.rotate(.08);
    const arm = (col) => { c.fillStyle = col; c.beginPath(); c.roundRect(-S * .085, -S * .5, S * .17, S * .52, S * .08); c.fill(); };
    c.save(); c.translate(-S * .012, -S * .012); arm('#f2b25a'); c.translate(0, -S * .48); hand(c, S * .46, '#f2b25a', 0); c.restore();   // the lit edge
    arm('#24150a'); c.translate(0, -S * .48); hand(c, S * .46, '#24150a', 0);
    c.restore();
  },
  mic(c, S) {   // Delric's microphone: black handle, silver mesh head, a hot glint from the stage light
    c.save(); c.translate(S * .5, S * .52); c.rotate(-0.5);
    c.beginPath(); c.moveTo(-S * .06, -S * .08); c.lineTo(S * .06, -S * .08); c.lineTo(S * .04, S * .38); c.lineTo(-S * .04, S * .38); c.closePath();
    c.fillStyle = lin(c, -S * .06, 0, S * .06, 0, [[0, '#4a4a50'], [.35, '#1a1a1e'], [1, '#050506']]); c.fill(); stroke(c, S * .012, '#000');
    c.beginPath(); c.arc(0, -S * .19, S * .13, 0, Math.PI * 2);
    c.fillStyle = rad(c, -S * .05, -S * .25, S * .01, 0, -S * .19, S * .14, [[0, '#ffffff'], [.4, '#c9ccd2'], [1, '#5c6068']]); c.fill(); stroke(c, S * .012, '#000');
    c.save(); c.clip(); c.strokeStyle = 'rgba(30,30,35,.45)'; c.lineWidth = S * .006;
    for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * S * .022, -S * .33); c.lineTo(i * S * .022 + S * .05, -S * .05); c.stroke(); c.beginPath(); c.moveTo(i * S * .022, -S * .33); c.lineTo(i * S * .022 - S * .05, -S * .05); c.stroke(); }
    c.restore();
    c.fillStyle = '#9aa0a8'; c.fillRect(-S * .065, -S * .09, S * .13, S * .03);
    c.restore();
    c.fillStyle = rad(c, S * .36, S * .22, 0, S * .36, S * .22, S * .14, [[0, 'rgba(255,240,200,.95)'], [1, 'rgba(255,200,90,0)']]); c.beginPath(); c.arc(S * .36, S * .22, S * .14, 0, Math.PI * 2); c.fill();
  },
  meter(c, S) {   // the temperature meter: a tall thermometer, glowing from cool blue up to red hot
    const x = S * .5, top = S * .08, bot = S * .78, w = S * .09, br = S * .14;
    c.beginPath(); c.roundRect(x - w, top, w * 2, bot - top, w); c.fillStyle = '#1b0f06'; c.fill(); stroke(c, S * .02, '#fff');
    c.beginPath(); c.arc(x, bot + br * .55, br, 0, Math.PI * 2); c.fillStyle = '#1b0f06'; c.fill(); stroke(c, S * .02, '#fff');
    const lvl = .72, fillTop = bot - (bot - top - w) * lvl;
    c.beginPath(); c.roundRect(x - w * .55, fillTop, w * 1.1, bot - fillTop + br * .6, w * .55);
    c.fillStyle = lin(c, 0, bot, 0, top, [[0, heatColor(0)], [.45, heatColor(.5)], [1, heatColor(1)]]); c.fill();
    c.beginPath(); c.arc(x, bot + br * .55, br * .7, 0, Math.PI * 2); c.fillStyle = heatColor(0); c.fill();
    c.shadowColor = heatColor(lvl); c.shadowBlur = S * .06; c.beginPath(); c.arc(x, fillTop + w * .3, w * .4, 0, Math.PI * 2); c.fillStyle = '#fff3d0'; c.fill(); c.shadowBlur = 0;
    c.strokeStyle = '#fff'; c.lineWidth = S * .012;
    for (let i = 1; i < 6; i++) { const y = top + w + (bot - top - w) * i / 6; c.beginPath(); c.moveTo(x + w * 1.4, y); c.lineTo(x + w * 2.1, y); c.stroke(); }
  },
};
export function heatColor(t) {   // 0 cool → 1 red hot
  const stops = [[0, [70, 140, 255]], [.4, [255, 190, 60]], [.75, [255, 120, 30]], [1, [236, 48, 19]]];
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], k = (t - a) / (b - a); return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',')})`; }
  return 'rgb(236,48,19)';
}
export const KINDS = Object.keys(DRAW);
export function drawThing(ctx, kind, S) { ctx.save(); DRAW[kind](ctx, S); ctx.restore(); }
export function thingCanvas(kind, S = 256) { const cv = document.createElement('canvas'); cv.width = cv.height = S; drawThing(cv.getContext('2d'), kind, S); return cv; }
