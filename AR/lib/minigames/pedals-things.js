// PEDALS OF FREEDOM: the things in the street, drawn in code to sit in the painting's sunny 1950s street.
// Warm outline, soft shading lit from the upper left, a ground shadow falling to the right (like the bike's).
//   drawThing(ctx, kind, S)  draws one thing into an S × S canvas, standing on a ground line near the bottom.
//   thingCanvas(kind, S=256) returns a new canvas with it drawn.
const INK = '#3b2a1f';

function shadow(c, x, y, w, h) {
  const g = c.createRadialGradient(x, y, 0, x, y, w);
  g.addColorStop(0, 'rgba(45,32,20,.42)'); g.addColorStop(0.7, 'rgba(45,32,20,.22)'); g.addColorStop(1, 'rgba(45,32,20,0)');
  c.save(); c.translate(x, y); c.scale(1, h / w); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, Math.PI * 2); c.fill(); c.restore();
}
function lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function rad(c, x, y, r0, x1, y1, r1, stops) { const g = c.createRadialGradient(x, y, r0, x1, y1, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function stroke(c, w) { c.lineWidth = w; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }

const DRAW = {
  ball(c, S) {   // a red and cream playground ball
    const x = S * .5, y = S * .56, r = S * .3;
    shadow(c, x + r * .45, S * .87, r * 1.15, r * .28);
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = rad(c, x - r * .4, y - r * .45, r * .1, x, y, r * 1.05, [[0, '#ff8a6a'], [.55, '#d8402a'], [1, '#8e2216']]); c.fill();
    c.save(); c.clip();   // a cream band round the middle
    c.beginPath(); c.ellipse(x, y + r * .05, r * 1.2, r * .32, -0.35, 0, Math.PI * 2);
    c.fillStyle = rad(c, x - r * .4, y - r * .2, r * .1, x, y, r * 1.1, [[0, '#fffaf0'], [.6, '#efe2c4'], [1, '#b7a27c']]); c.fill();
    c.beginPath(); c.ellipse(x, y + r * .05, r * 1.2, r * .32, -0.35, 0, Math.PI * 2); stroke(c, S * .012);
    c.restore();
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); stroke(c, S * .016);
    c.beginPath(); c.ellipse(x - r * .42, y - r * .48, r * .2, r * .11, -0.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
  },
  cat(c, S) {   // an orange tabby, sitting, tail curled round
    const x = S * .5, g = S * .86;
    shadow(c, x + S * .07, g, S * .27, S * .06);
    const fur = lin(c, x - S * .2, S * .3, x + S * .2, g, [[0, '#f2a457'], [.6, '#d5772f'], [1, '#9c4e1c']]);
    // tail
    c.beginPath(); c.moveTo(x + S * .14, g - S * .02); c.bezierCurveTo(x + S * .34, g - S * .02, x + S * .36, g - S * .2, x + S * .26, g - S * .26);
    c.lineWidth = S * .055; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = S * .032; c.strokeStyle = '#d5772f'; c.stroke();
    // body: a pear shape
    c.beginPath(); c.moveTo(x - S * .05, S * .44);
    c.bezierCurveTo(x - S * .2, S * .52, x - S * .22, g - S * .04, x - S * .15, g);
    c.lineTo(x + S * .15, g); c.bezierCurveTo(x + S * .22, g - S * .04, x + S * .2, S * .52, x + S * .05, S * .44); c.closePath();
    c.fillStyle = fur; c.fill(); stroke(c, S * .014);
    // chest
    c.beginPath(); c.ellipse(x, S * .6, S * .06, S * .1, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(255,240,215,.85)'; c.fill();
    // paws
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * S * .055, g - S * .015, S * .045, S * .028, 0, 0, Math.PI * 2); c.fillStyle = '#fbe9cc'; c.fill(); stroke(c, S * .01); }
    // head + ears
    const hy = S * .36, hr = S * .13;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * hr * .95, hy - hr * .2); c.lineTo(x + s * hr * .85, hy - hr * 1.35); c.lineTo(x + s * hr * .2, hy - hr * .8); c.closePath(); c.fillStyle = '#e08a3c'; c.fill(); stroke(c, S * .012);
      c.beginPath(); c.moveTo(x + s * hr * .78, hy - hr * .5); c.lineTo(x + s * hr * .78, hy - hr * 1.05); c.lineTo(x + s * hr * .4, hy - hr * .8); c.closePath(); c.fillStyle = '#f6b9a0'; c.fill(); }
    c.beginPath(); c.ellipse(x, hy, hr * 1.08, hr * .92, 0, 0, Math.PI * 2);
    c.fillStyle = rad(c, x - hr * .4, hy - hr * .5, hr * .1, x, hy, hr * 1.2, [[0, '#f7b46a'], [1, '#c96a28']]); c.fill(); stroke(c, S * .014);
    // stripes
    c.strokeStyle = 'rgba(120,55,20,.7)'; c.lineWidth = S * .012;
    for (const s of [-.35, 0, .35]) { c.beginPath(); c.moveTo(x + s * hr, hy - hr * .88); c.lineTo(x + s * hr * .8, hy - hr * .55); c.stroke(); }
    for (const yy of [.55, .66, .77]) { c.beginPath(); c.moveTo(x - S * .17, S * yy); c.quadraticCurveTo(x - S * .12, S * yy + S * .01, x - S * .1, S * yy + S * .03); c.stroke();
      c.beginPath(); c.moveTo(x + S * .17, S * yy); c.quadraticCurveTo(x + S * .12, S * yy + S * .01, x + S * .1, S * yy + S * .03); c.stroke(); }
    // face
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * hr * .42, hy - hr * .05, hr * .17, hr * .2, 0, 0, Math.PI * 2); c.fillStyle = '#c9d65a'; c.fill(); stroke(c, S * .008);
      c.beginPath(); c.ellipse(x + s * hr * .42, hy - hr * .05, hr * .05, hr * .16, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); }
    c.beginPath(); c.moveTo(x - hr * .12, hy + hr * .28); c.lineTo(x + hr * .12, hy + hr * .28); c.lineTo(x, hy + hr * .42); c.closePath(); c.fillStyle = '#e57b7b'; c.fill();
    c.beginPath(); c.moveTo(x, hy + hr * .42); c.quadraticCurveTo(x - hr * .1, hy + hr * .6, x - hr * .25, hy + hr * .52); c.moveTo(x, hy + hr * .42); c.quadraticCurveTo(x + hr * .1, hy + hr * .6, x + hr * .25, hy + hr * .52); stroke(c, S * .008);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = S * .005;
    for (const s of [-1, 1]) for (const d of [-.08, .06]) { c.beginPath(); c.moveTo(x + s * hr * .4, hy + hr * .45); c.lineTo(x + s * hr * 1.35, hy + hr * (.35 + d * 3)); c.stroke(); }
  },
  puddle(c, S) {   // a rain puddle, reflecting the blue sky, with ripples
    const x = S * .5, y = S * .74;
    c.beginPath();
    const pts = [[-.42, .02], [-.36, -.1], [-.18, -.15], [.02, -.12], [.2, -.16], [.4, -.08], [.44, .04], [.3, .13], [.08, .12], [-.12, .16], [-.32, .12]];
    pts.forEach(([a, b], i) => { const px = x + a * S, py = y + b * S * .9; if (!i) c.moveTo(px, py); else { const [pa, pb] = pts[i - 1]; c.quadraticCurveTo(x + pa * S, y + pb * S * .9, (px + x + pa * S) / 2, (py + y + pb * S * .9) / 2); } });
    c.closePath();
    c.fillStyle = 'rgba(70,52,34,.35)'; c.save(); c.translate(S * .012, S * .012); c.fill(); c.restore();   // damp edge
    c.fillStyle = lin(c, 0, y - S * .15, 0, y + S * .15, [[0, '#cfe3f0'], [.45, '#7fb0d2'], [1, '#4d7fa6']]); c.fill(); stroke(c, S * .012);
    c.save(); c.clip();
    c.fillStyle = 'rgba(255,255,255,.75)';   // a cloud in the water
    for (const [a, b, r] of [[-.15, -.04, .07], [-.07, -.06, .08], [.02, -.04, .06]]) { c.beginPath(); c.ellipse(x + a * S, y + b * S, r * S, r * S * .45, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = 'rgba(40,60,40,.35)'; c.beginPath(); c.ellipse(x + S * .28, y - S * .1, S * .12, S * .05, 0, 0, Math.PI * 2); c.fill();   // a tree's reflection
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = S * .008;
    for (const r of [.05, .09]) { c.beginPath(); c.ellipse(x + S * .14, y + S * .05, r * S, r * S * .35, 0, 0, Math.PI * 2); c.stroke(); }
    // drops
    c.fillStyle = '#9cc4e0'; for (const [a, b] of [[-.44, -.1], [.47, .09]]) { c.beginPath(); c.ellipse(x + a * S, y + b * S, S * .022, S * .012, 0, 0, Math.PI * 2); c.fill(); stroke(c, S * .006); }
  },
  can(c, S) {   // a dented galvanized trash can, lid tipped
    const x = S * .48, top = S * .36, g = S * .87, w = S * .2, bw = S * .17;
    shadow(c, x + S * .12, g, S * .28, S * .06);
    c.beginPath(); c.moveTo(x - w, top); c.lineTo(x + w, top); c.lineTo(x + bw, g); c.quadraticCurveTo(x, g + S * .03, x - bw, g); c.closePath();
    c.fillStyle = lin(c, x - w, 0, x + w, 0, [[0, '#d9dee0'], [.25, '#f4f6f6'], [.55, '#9aa4a8'], [1, '#5f686c']]); c.fill(); stroke(c, S * .015);
    // ridges
    c.strokeStyle = 'rgba(60,70,75,.55)'; c.lineWidth = S * .01;
    for (const f of [.3, .62]) { const yy = top + (g - top) * f, ww = w + (bw - w) * f; c.beginPath(); c.moveTo(x - ww, yy); c.quadraticCurveTo(x, yy + S * .025, x + ww, yy); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(x - ww, yy + S * .012); c.quadraticCurveTo(x, yy + S * .037, x + ww, yy + S * .012); c.stroke(); c.strokeStyle = 'rgba(60,70,75,.55)'; }
    // a dent
    c.beginPath(); c.ellipse(x + w * .45, top + (g - top) * .78, S * .03, S * .045, .3, 0, Math.PI * 2); c.fillStyle = 'rgba(60,70,75,.3)'; c.fill();
    // handles
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * w * .98, top + S * .07); c.quadraticCurveTo(x + s * (w + S * .05), top + S * .11, x + s * w * .96, top + S * .15); stroke(c, S * .016); }
    // mouth of the can
    c.beginPath(); c.ellipse(x, top, w, S * .045, 0, 0, Math.PI * 2); c.fillStyle = '#3f3a33'; c.fill(); stroke(c, S * .014);
    c.fillStyle = '#7b5a3a'; c.beginPath(); c.ellipse(x - S * .05, top - S * .01, S * .05, S * .018, .2, 0, Math.PI * 2); c.fill();   // a paper bag peeking out
    // lid, tipped against the side
    c.save(); c.translate(x - w * .55, top - S * .09); c.rotate(-0.42);
    c.beginPath(); c.ellipse(0, 0, w * 1.02, S * .05, 0, 0, Math.PI * 2);
    c.fillStyle = lin(c, -w, 0, w, 0, [[0, '#eef1f2'], [.6, '#a7b0b4'], [1, '#6d777b']]); c.fill(); stroke(c, S * .014);
    c.beginPath(); c.ellipse(0, -S * .012, w * .6, S * .028, 0, Math.PI, Math.PI * 2); stroke(c, S * .009);
    c.beginPath(); c.moveTo(-S * .04, -S * .03); c.quadraticCurveTo(0, -S * .07, S * .04, -S * .03); stroke(c, S * .016);
    c.restore();
  },
  branch(c, S) {   // a fallen branch, lying across the street, still in leaf
    const g = S * .74;
    shadow(c, S * .55, g + S * .07, S * .42, S * .05);
    c.translate(S * .5, S * .7); c.scale(.86, .86); c.translate(-S * .52, -S * .7);   // keep the leaves inside the tile
    c.lineCap = 'round';
    const limb = (pts, w) => { c.beginPath(); c.moveTo(pts[0][0] * S, pts[0][1] * S); c.bezierCurveTo(...pts.slice(1).flat().map(v => v * S));
      c.lineWidth = w * S + S * .02; c.strokeStyle = INK; c.stroke(); c.lineWidth = w * S; c.strokeStyle = '#7a5134'; c.stroke();
      c.lineWidth = w * S * .35; c.strokeStyle = 'rgba(200,160,110,.6)'; c.stroke(); };
    limb([[.1, .8], [.35, .72], [.6, .78], [.9, .66]], .05);
    limb([[.45, .75], [.5, .65], [.56, .58], [.62, .52]], .025);
    limb([[.7, .73], [.75, .8], [.82, .84], [.88, .86]], .022);
    limb([[.28, .76], [.24, .66], [.2, .6], [.16, .55]], .02);
    // a broken end
    c.fillStyle = '#e8c79a'; c.beginPath(); c.ellipse(S * .1, S * .8, S * .02, S * .03, .3, 0, Math.PI * 2); c.fill(); stroke(c, S * .01);
    const leaf = (lx, ly, a, s, col) => { c.save(); c.translate(lx * S, ly * S); c.rotate(a); c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(s * S * .5, -s * S * .35, s * S, 0); c.quadraticCurveTo(s * S * .5, s * S * .35, 0, 0);
      c.fillStyle = col; c.fill(); stroke(c, S * .008); c.beginPath(); c.moveTo(0, 0); c.lineTo(s * S * .85, 0); c.lineWidth = S * .005; c.strokeStyle = 'rgba(40,60,20,.6)'; c.stroke(); c.restore(); };
    const greens = ['#6f9a3a', '#89b04a', '#557d2c', '#a4bf5a'];
    [[.62, .52, -1.2, .12], [.62, .52, -.4, .13], [.6, .55, -2.1, .11], [.16, .55, -2.2, .12], [.16, .55, -1.3, .11], [.2, .6, -2.9, .1],
     [.88, .66, -.6, .13], [.9, .66, .3, .12], [.88, .86, .5, .1], [.82, .84, 1.4, .09], [.5, .66, -2.5, .1], [.75, .7, -1.6, .11], [.35, .73, 1.9, .09]]
      .forEach(([a, b, r, s], i) => leaf(a, b, r, s, greens[i % greens.length]));
  },
  dog(c, S) {   // a friendly brown and white dog, sitting, red collar
    const x = S * .5, g = S * .87;
    shadow(c, x + S * .08, g, S * .3, S * .065);
    const brown = lin(c, x - S * .2, S * .3, x + S * .2, g, [[0, '#c48a55'], [.6, '#9a6436'], [1, '#6b4122']]);
    // tail wag
    c.beginPath(); c.moveTo(x + S * .15, g - S * .05); c.quadraticCurveTo(x + S * .32, g - S * .1, x + S * .33, g - S * .25);
    c.lineWidth = S * .05; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = S * .03; c.strokeStyle = '#9a6436'; c.stroke();
    // body
    c.beginPath(); c.moveTo(x - S * .08, S * .46);
    c.bezierCurveTo(x - S * .22, S * .55, x - S * .24, g - S * .03, x - S * .17, g);
    c.lineTo(x + S * .17, g); c.bezierCurveTo(x + S * .24, g - S * .03, x + S * .22, S * .55, x + S * .08, S * .46); c.closePath();
    c.fillStyle = brown; c.fill(); stroke(c, S * .014);
    // white chest and front legs
    c.beginPath(); c.moveTo(x - S * .07, S * .5); c.quadraticCurveTo(x, S * .48, x + S * .07, S * .5); c.lineTo(x + S * .09, g); c.lineTo(x - S * .09, g); c.closePath();
    c.fillStyle = lin(c, 0, S * .5, 0, g, [[0, '#fffaf0'], [1, '#e6dac4']]); c.fill(); stroke(c, S * .011);
    c.beginPath(); c.moveTo(x, S * .66); c.lineTo(x, g); stroke(c, S * .008);
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * S * .05, g - S * .012, S * .05, S * .025, 0, 0, Math.PI * 2); c.fillStyle = '#fffaf0'; c.fill(); stroke(c, S * .01); }
    // head
    const hy = S * .33, hr = S * .13;
    c.beginPath(); c.ellipse(x, hy, hr * 1.05, hr, 0, 0, Math.PI * 2);
    c.fillStyle = rad(c, x - hr * .4, hy - hr * .5, hr * .1, x, hy, hr * 1.2, [[0, '#d39a62'], [1, '#93602f']]); c.fill(); stroke(c, S * .014);
    // white blaze + muzzle
    c.beginPath(); c.moveTo(x - hr * .1, hy - hr * .9); c.quadraticCurveTo(x - hr * .2, hy, x - hr * .5, hy + hr * .45); c.quadraticCurveTo(x, hy + hr * .95, x + hr * .5, hy + hr * .45);
    c.quadraticCurveTo(x + hr * .2, hy, x + hr * .1, hy - hr * .9); c.closePath(); c.fillStyle = '#fbf3e2'; c.fill();
    // floppy ears
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * hr * .6, hy - hr * .75);
      c.bezierCurveTo(x + s * hr * 1.5, hy - hr * .7, x + s * hr * 1.45, hy + hr * .5, x + s * hr * 1.05, hy + hr * .65);
      c.quadraticCurveTo(x + s * hr * .8, hy, x + s * hr * .6, hy - hr * .75); c.fillStyle = '#5e3a1f'; c.fill(); stroke(c, S * .012); }
    // eyes, nose, tongue
    for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * hr * .38, hy - hr * .12, hr * .12, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
      c.beginPath(); c.arc(x + s * hr * .38 - hr * .04, hy - hr * .17, hr * .04, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); }
    c.beginPath(); c.ellipse(x, hy + hr * .35, hr * .17, hr * .12, 0, 0, Math.PI * 2); c.fillStyle = '#2a1d15'; c.fill();
    c.beginPath(); c.ellipse(x + hr * .05, hy + hr * .72, hr * .12, hr * .17, 0, 0, Math.PI * 2); c.fillStyle = '#e8737a'; c.fill(); stroke(c, S * .008);
    c.beginPath(); c.moveTo(x - hr * .3, hy + hr * .55); c.quadraticCurveTo(x, hy + hr * .7, x + hr * .3, hy + hr * .55); stroke(c, S * .009);
    // collar + tag
    c.beginPath(); c.moveTo(x - S * .1, S * .47); c.quadraticCurveTo(x, S * .5, x + S * .1, S * .47); c.lineWidth = S * .03; c.strokeStyle = INK; c.stroke(); c.lineWidth = S * .018; c.strokeStyle = '#d23a2a'; c.stroke();
    c.beginPath(); c.arc(x, S * .515, S * .018, 0, Math.PI * 2); c.fillStyle = '#f2c94c'; c.fill(); stroke(c, S * .007);
  },
  skateboard(c, S) {   // a wooden skateboard with red clay wheels, at an angle
    const x = S * .5, y = S * .7;
    shadow(c, x + S * .05, y + S * .14, S * .42, S * .06);
    c.save(); c.translate(x, y); c.rotate(-0.18);
    const L = S * .38, W = S * .085;
    // wheels and trucks
    for (const s of [-1, 1]) { c.fillStyle = '#9aa4a8'; c.fillRect(s * L * .62 - S * .015, W * .2, S * .03, W * .9);
      for (const t of [-1, 1]) { c.beginPath(); c.ellipse(s * L * .62 + t * S * .045, W * 1.15, S * .032, S * .03, 0, 0, Math.PI * 2);
        c.fillStyle = rad(c, s * L * .62 + t * S * .045 - S * .01, W * 1.05, 1, s * L * .62 + t * S * .045, W * 1.15, S * .035, [[0, '#ff7a5c'], [1, '#a92b1a']]); c.fill(); stroke(c, S * .01); } }
    // edge of the deck
    c.beginPath(); c.roundRect(-L, -W * .2, L * 2, W * 1.05, W * .55); c.fillStyle = '#8a5a2f'; c.fill(); stroke(c, S * .013);
    // deck top
    c.beginPath(); c.roundRect(-L, -W, L * 2, W * 1.4, W * .65);
    c.fillStyle = lin(c, 0, -W, 0, W * .4, [[0, '#f1cf8f'], [1, '#c99353']]); c.fill(); stroke(c, S * .014);
    c.strokeStyle = 'rgba(140,90,40,.35)'; c.lineWidth = S * .006;   // wood grain
    for (const d of [-.6, -.25, .1]) { c.beginPath(); c.moveTo(-L * .85, W * d); c.bezierCurveTo(-L * .3, W * (d - .15), L * .3, W * (d + .15), L * .85, W * d); c.stroke(); }
    // a red and blue stripe down the middle
    c.fillStyle = '#d23a2a'; c.beginPath(); c.roundRect(-L * .55, -W * .45, L * 1.1, W * .18, W * .09); c.fill();
    c.fillStyle = '#2f5d8a'; c.beginPath(); c.roundRect(-L * .45, -W * .2, L * .9, W * .12, W * .06); c.fill();
    c.restore();
  },
};
export const KINDS = Object.keys(DRAW);
export function drawThing(ctx, kind, S) { ctx.save(); DRAW[kind](ctx, S); ctx.restore(); }
export function thingCanvas(kind, S = 256) { const cv = document.createElement('canvas'); cv.width = cv.height = S; drawThing(cv.getContext('2d'), kind, S); return cv; }
