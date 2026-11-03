// MIDNIGHT MELODIES: the dream things hidden in the dark, drawn in code to sit in Wayne's watercolour bedroom.
// Soft navy outline, warm gold and cream highlights (they catch the flashlight), a faint dreamy glow behind each.
//   drawThing(ctx, kind, S)  draws one thing, centred, into an S × S canvas.
//   thingCanvas(kind, S=256) returns a new canvas with it drawn.
const INK = '#1c2342';
const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
const rad = (c, x, y, r0, x1, y1, r1, st) => { const g = c.createRadialGradient(x, y, r0, x1, y1, r1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
function stroke(c, w) { c.lineWidth = w; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
function halo(c, S, col = '255,220,150') {   // a soft dreamy glow behind
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * .48);
  g.addColorStop(0, `rgba(${col},.32)`); g.addColorStop(.6, `rgba(${col},.12)`); g.addColorStop(1, `rgba(${col},0)`);
  c.fillStyle = g; c.fillRect(0, 0, S, S);
}
function sleepyEyes(c, x, y, w, s) { for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * w, y, s, 0.15 * Math.PI, 0.85 * Math.PI); stroke(c, s * .45); } }

const DRAW = {
  moon(c, S) {   // a sleepy crescent moon in a nightcap
    halo(c, S, '255,230,160');
    const x = S * .5, y = S * .52, r = S * .3;
    // the crescent: a full disc with a bite taken out, drawn on its own canvas so the bite stays see-through
    const cv = document.createElement('canvas'); cv.width = cv.height = S; const m = cv.getContext('2d');
    m.beginPath(); m.arc(x, y, r, 0, Math.PI * 2); m.fillStyle = INK; m.fill();
    m.beginPath(); m.arc(x, y, r - S * .012, 0, Math.PI * 2); m.fillStyle = rad(m, x - r * .5, y - r * .3, r * .1, x, y, r * 1.1, [[0, '#fff6d6'], [.6, '#f4d58a'], [1, '#c99a3e']]); m.fill();
    m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(x + r * .58, y - r * .28, r * .84, 0, Math.PI * 2); m.fill();
    m.globalCompositeOperation = 'source-atop'; m.beginPath(); m.arc(x + r * .58, y - r * .28, r * .84 + S * .012, 0, Math.PI * 2); m.lineWidth = S * .024; m.strokeStyle = INK; m.stroke();
    c.drawImage(cv, 0, 0);
    sleepyEyes(c, x - r * .52, y - r * .02, 0, r * .1);
    c.fillStyle = 'rgba(240,140,120,.45)'; c.beginPath(); c.arc(x - r * .4, y + r * .22, r * .09, 0, Math.PI * 2); c.fill();
    // the nightcap
    c.beginPath(); c.moveTo(x - r * .75, y - r * .58); c.quadraticCurveTo(x - r * .1, y - r * 1.25, x + r * .55, y - r * .95);
    c.quadraticCurveTo(x + r * .1, y - r * .75, x - r * .1, y - r * .45); c.closePath();
    c.fillStyle = lin(c, x - r, y - r, x + r * .5, y - r * .5, [[0, '#4f6fb5'], [1, '#2c3f7a']]); c.fill(); stroke(c, S * .012);
    c.beginPath(); c.arc(x + r * .6, y - r * .93, r * .12, 0, Math.PI * 2); c.fillStyle = '#fff4dc'; c.fill(); stroke(c, S * .01);
    c.fillStyle = '#fff4dc'; for (const [a, b] of [[-.4, -.75], [0, -.9], [-.15, -.62]]) { c.beginPath(); c.arc(x + r * a, y + r * b, r * .04, 0, Math.PI * 2); c.fill(); }
  },
  teddy(c, S) {   // a worn little teddy bear, sitting
    halo(c, S, '255,210,150');
    const x = S * .5, fur = '#b9784a';
    const blob = (bx, by, rx, ry, col) => { c.beginPath(); c.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); stroke(c, S * .012); };
    const shade = (bx, by, r) => rad(c, bx - r * .4, by - r * .4, r * .1, bx, by, r * 1.1, [[0, '#e3a876'], [1, '#93572f']]);
    blob(x - S * .13, S * .8, S * .07, S * .055, shade(x - S * .13, S * .8, S * .07)); blob(x + S * .13, S * .8, S * .07, S * .055, shade(x + S * .13, S * .8, S * .07));   // feet
    blob(x, S * .64, S * .17, S * .19, shade(x, S * .64, S * .19));   // body
    blob(x, S * .67, S * .09, S * .1, '#f0d2a8');   // tummy
    blob(x - S * .18, S * .6, S * .055, S * .1, shade(x - S * .18, S * .6, S * .1)); blob(x + S * .18, S * .6, S * .055, S * .1, shade(x + S * .18, S * .6, S * .1));   // arms
    for (const d of [-1, 1]) { blob(x + d * S * .12, S * .2, S * .06, S * .06, shade(x + d * S * .12, S * .2, S * .06)); c.beginPath(); c.arc(x + d * S * .12, S * .2, S * .03, 0, Math.PI * 2); c.fillStyle = '#e8b89a'; c.fill(); }   // ears
    blob(x, S * .32, S * .15, S * .135, shade(x, S * .32, S * .15));   // head
    blob(x, S * .37, S * .07, S * .05, '#f0d2a8');   // muzzle
    c.beginPath(); c.ellipse(x, S * .35, S * .025, S * .017, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.moveTo(x, S * .365); c.quadraticCurveTo(x - S * .02, S * .395, x - S * .035, S * .385); c.moveTo(x, S * .365); c.quadraticCurveTo(x + S * .02, S * .395, x + S * .035, S * .385); stroke(c, S * .008);
    for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * S * .055, S * .29, S * .016, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); }
    c.beginPath(); c.moveTo(x - S * .02, S * .5); c.lineTo(x + S * .07, S * .46); c.lineTo(x + S * .05, S * .53); c.closePath(); c.fillStyle = '#5a7cc4'; c.fill(); stroke(c, S * .008);   // a bow
    c.beginPath(); c.moveTo(x - S * .02, S * .5); c.lineTo(x - S * .11, S * .46); c.lineTo(x - S * .09, S * .53); c.closePath(); c.fill(); stroke(c, S * .008);
    c.strokeStyle = 'rgba(80,40,20,.6)'; c.lineWidth = S * .006; c.setLineDash([S * .012, S * .01]); c.beginPath(); c.arc(x + S * .05, S * .72, S * .04, 0, Math.PI * 1.5); c.stroke(); c.setLineDash([]);   // a stitched patch
  },
  sheep(c, S) {   // a fluffy counting sheep, leaping
    halo(c, S, '230,235,255');
    const x = S * .5, y = S * .5;
    c.strokeStyle = INK; c.lineCap = 'round';
    for (const [a, b, d] of [[-.12, .14, -.3], [-.04, .15, -.1], [.1, .14, .3], [.17, .13, .5]]) { c.beginPath(); c.moveTo(x + S * a, y + S * .05); c.lineTo(x + S * (a + d * .1), y + S * b + S * .06); c.lineWidth = S * .035; c.stroke(); }
    const puffs = [[-.17, 0], [-.08, -.08], [.04, -.09], [.15, -.05], [.2, .04], [.1, .08], [-.02, .09], [-.14, .08]];
    for (const [a, b] of puffs) { c.beginPath(); c.arc(x + S * a, y + S * b, S * .085, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); }
    for (const [a, b] of puffs) { c.beginPath(); c.arc(x + S * a, y + S * b, S * .075, 0, Math.PI * 2);
      c.fillStyle = rad(c, x + S * a - S * .03, y + S * b - S * .03, 1, x + S * a, y + S * b, S * .08, [[0, '#ffffff'], [1, '#d6dcef']]); c.fill(); }
    // head
    c.beginPath(); c.ellipse(x + S * .27, y - S * .06, S * .075, S * .06, -.3, 0, Math.PI * 2); c.fillStyle = '#3b3550'; c.fill(); stroke(c, S * .01);
    c.beginPath(); c.ellipse(x + S * .22, y - S * .11, S * .04, S * .02, -.9, 0, Math.PI * 2); c.fillStyle = '#3b3550'; c.fill();
    sleepyEyes(c, x + S * .28, y - S * .075, S * .025, S * .014); c.strokeStyle = '#fff'; c.lineWidth = S * .007;
    for (const d of [-1, 1]) { c.beginPath(); c.arc(x + S * .28 + d * S * .025, y - S * .075, S * .014, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    c.beginPath(); c.arc(x + S * .21, y - S * .13, S * .045, 0, Math.PI * 2); c.fillStyle = '#f4f6ff'; c.fill();   // a curl on top
    c.fillStyle = '#f4d58a'; c.font = `900 ${S * .1}px Georgia, serif`; c.textAlign = 'center'; c.fillText('z', x + S * .38, y - S * .2); c.font = `900 ${S * .07}px Georgia, serif`; c.fillText('z', x + S * .43, y - S * .28);
  },
  note(c, S) {   // a golden music note, glowing
    halo(c, S, '255,215,120');
    const gold = lin(c, S * .3, S * .2, S * .7, S * .8, [[0, '#fff2b8'], [.45, '#e7b84c'], [1, '#9c6a1c']]);
    c.beginPath(); c.moveTo(S * .37, S * .7); c.lineTo(S * .37, S * .25); c.lineTo(S * .7, S * .17); c.lineTo(S * .7, S * .62);
    c.lineWidth = S * .06; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.lineWidth = S * .035; c.strokeStyle = gold; c.stroke();
    c.beginPath(); c.moveTo(S * .37, S * .25); c.lineTo(S * .7, S * .17); c.lineTo(S * .7, S * .27); c.lineTo(S * .37, S * .35); c.closePath(); c.fillStyle = gold; c.fill(); stroke(c, S * .014);
    for (const [hx, hy] of [[.3, .72], [.63, .64]]) { c.beginPath(); c.ellipse(S * hx, S * hy, S * .09, S * .065, -.4, 0, Math.PI * 2); c.fillStyle = gold; c.fill(); stroke(c, S * .016);
      c.beginPath(); c.ellipse(S * hx - S * .03, S * hy - S * .02, S * .03, S * .015, -.4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); }
    c.fillStyle = '#fff6d6'; for (const [a, b, r] of [[.18, .3, .018], [.82, .4, .014], [.55, .85, .012]]) { c.beginPath(); c.arc(S * a, S * b, S * r, 0, Math.PI * 2); c.fill(); }
  },
  jar(c, S) {   // a jar of fireflies, a little night light
    halo(c, S, '220,255,150');
    const x = S * .5, top = S * .3, bot = S * .82, w = S * .17;
    c.beginPath(); c.moveTo(x - w * .8, top); c.quadraticCurveTo(x - w * 1.15, top + S * .08, x - w, top + S * .16); c.lineTo(x - w, bot - S * .05); c.quadraticCurveTo(x - w, bot, x - w * .7, bot);
    c.lineTo(x + w * .7, bot); c.quadraticCurveTo(x + w, bot, x + w, bot - S * .05); c.lineTo(x + w, top + S * .16); c.quadraticCurveTo(x + w * 1.15, top + S * .08, x + w * .8, top); c.closePath();
    c.fillStyle = rad(c, x, S * .6, S * .02, x, S * .6, S * .25, [[0, 'rgba(240,255,170,.95)'], [.5, 'rgba(170,220,140,.55)'], [1, 'rgba(90,130,150,.45)']]); c.fill(); stroke(c, S * .014);
    c.beginPath(); c.moveTo(x - w * .62, top + S * .2); c.quadraticCurveTo(x - w * .75, S * .55, x - w * .6, bot - S * .08); c.lineWidth = S * .025; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
    for (const [a, b] of [[-.06, .5], [.07, .58], [-.02, .68], [.05, .45], [-.08, .73], [.08, .72]]) { const fx = x + S * a, fy = S * b;
      c.beginPath(); c.arc(fx, fy, S * .03, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,160,.5)'; c.fill(); c.beginPath(); c.arc(fx, fy, S * .013, 0, Math.PI * 2); c.fillStyle = '#fffbd0'; c.fill(); }
    c.beginPath(); c.roundRect(x - w * .9, top - S * .06, w * 1.8, S * .07, S * .015); c.fillStyle = lin(c, 0, top - S * .06, 0, top, [[0, '#d9a35a'], [1, '#8c5a2a']]); c.fill(); stroke(c, S * .012);
    c.beginPath(); c.moveTo(x - w * .7, top - S * .06); c.quadraticCurveTo(x, top - S * .2, x + w * .7, top - S * .06); stroke(c, S * .012);   // the cloth tie
  },
  clock(c, S) {   // a bedside alarm clock, two bells
    halo(c, S, '255,220,170');
    const x = S * .5, y = S * .54, r = S * .21;
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * r * .6, y + r * .8); c.lineTo(x + d * r * .95, y + r * 1.28); stroke(c, S * .03); }   // legs
    for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * r * .72, y - r * .9, r * .36, Math.PI, 0); c.closePath();
      c.fillStyle = lin(c, 0, y - r * 1.3, 0, y - r * .9, [[0, '#fff0b0'], [1, '#d39a3a']]); c.fill(); stroke(c, S * .012); }
    c.beginPath(); c.moveTo(x, y - r * 1.05); c.lineTo(x, y - r * 1.3); stroke(c, S * .02); c.beginPath(); c.arc(x, y - r * 1.34, r * .08, 0, Math.PI * 2); c.fillStyle = '#d39a3a'; c.fill(); stroke(c, S * .008);
    c.beginPath(); c.arc(x, y, r * 1.08, 0, Math.PI * 2); c.fillStyle = rad(c, x - r * .4, y - r * .5, r * .1, x, y, r * 1.1, [[0, '#7fa0e0'], [1, '#2d4485']]); c.fill(); stroke(c, S * .014);
    c.beginPath(); c.arc(x, y, r * .84, 0, Math.PI * 2); c.fillStyle = '#fbf3df'; c.fill(); stroke(c, S * .01);
    c.fillStyle = INK; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.arc(x + Math.sin(a) * r * .68, y - Math.cos(a) * r * .68, i % 3 ? r * .025 : r * .05, 0, Math.PI * 2); c.fill(); }
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - r * .15, y - r * .52); stroke(c, S * .016);   // nearly midnight
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + r * .05, y - r * .66); stroke(c, S * .01);
    c.beginPath(); c.arc(x, y, r * .06, 0, Math.PI * 2); c.fillStyle = '#c9583e'; c.fill();
  },
  rocket(c, S) {   // a toy rocket, off to dreamland
    halo(c, S, '255,200,170');
    c.save(); c.translate(S * .5, S * .5); c.rotate(.6);
    const L = S * .3, W = S * .1;
    c.beginPath(); c.moveTo(-W * .6, L * .55); c.quadraticCurveTo(0, L * 1.5, W * .6, L * .55); c.fillStyle = rad(c, 0, L * .7, 1, 0, L * .8, L * .55, [[0, '#fff8c8'], [.5, '#ffb347'], [1, 'rgba(255,90,50,0)']]); c.fill();   // flame
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * W * .8, L * .1); c.lineTo(d * W * 1.7, L * .6); c.lineTo(d * W * .9, L * .55); c.closePath(); c.fillStyle = '#c9483a'; c.fill(); stroke(c, S * .012); }
    c.beginPath(); c.moveTo(0, -L); c.bezierCurveTo(W * 1.6, -L * .4, W * 1.2, L * .5, W * .9, L * .6); c.lineTo(-W * .9, L * .6); c.bezierCurveTo(-W * 1.2, L * .5, -W * 1.6, -L * .4, 0, -L); c.closePath();
    c.fillStyle = lin(c, -W, 0, W, 0, [[0, '#ffffff'], [.6, '#dfe4f2'], [1, '#9aa6c8']]); c.fill(); stroke(c, S * .014);
    c.save(); c.clip(); c.fillStyle = '#c9483a'; c.fillRect(-W * 2, -L * 1.1, W * 4, L * .45); c.restore();
    c.beginPath(); c.moveTo(0, -L); c.bezierCurveTo(W * 1.6, -L * .4, W * 1.2, L * .5, W * .9, L * .6); c.lineTo(-W * .9, L * .6); c.bezierCurveTo(-W * 1.2, L * .5, -W * 1.6, -L * .4, 0, -L); stroke(c, S * .014);
    c.beginPath(); c.arc(0, -L * .1, W * .5, 0, Math.PI * 2); c.fillStyle = rad(c, -W * .2, -L * .15, 1, 0, -L * .1, W * .5, [[0, '#cfe6ff'], [1, '#4f6fb5']]); c.fill(); stroke(c, S * .012);
    c.beginPath(); c.moveTo(0, L * .2); c.lineTo(0, L * .55); stroke(c, S * .012);
    c.restore();
  },
};
export const KINDS = Object.keys(DRAW);
export function drawThing(ctx, kind, S) { ctx.save(); DRAW[kind](ctx, S); ctx.restore(); }
export function thingCanvas(kind, S = 256) { const cv = document.createElement('canvas'); cv.width = cv.height = S; drawThing(cv.getContext('2d'), kind, S); return cv; }
