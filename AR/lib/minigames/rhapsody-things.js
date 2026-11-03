// RHAPSODY IN BLUE · JAZZ SAYS: the band's five instruments, drawn in code to sit on Marcus Roberts' blue painting.
// Jazz-poster style: bold shapes, a thick white outline (so they read on the busy blue), deep navy ink inside.
//   drawThing(ctx, kind, S) draws one, centred, into an S × S canvas.   thingCanvas(kind, S=256) returns a new canvas.
const INK = '#0c1633', OUT = '#ffffff';
const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
const rad = (c, x, y, r0, x1, y1, r1, st) => { const g = c.createRadialGradient(x, y, r0, x1, y1, r1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
// draw a shape twice: a thick white outline first, then the fill with a navy edge
function shape(c, S, path, fill, w = .014) {
  c.save(); path(); c.lineWidth = S * (w + .03); c.strokeStyle = OUT; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); c.restore();
  c.save(); path(); c.fillStyle = fill; c.fill(); c.lineWidth = S * w; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.restore();
}
function line(c, S, pts, col, w) {   // a stroked line with a white outline
  for (const [ww, cc] of [[w + .03, OUT], [w + .012, INK], [w, col]]) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(S * x, S * y) : c.moveTo(S * x, S * y)); c.lineWidth = S * ww; c.strokeStyle = cc; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
}

const DRAW = {
  clarinet(c, S) {   // a black clarinet with silver keys, at a jaunty angle
    c.save(); c.translate(S * .5, S * .5); c.rotate(-.75); c.translate(-S * .5, -S * .5);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .47, S * .06); c.lineTo(S * .53, S * .06); c.lineTo(S * .545, S * .74); c.quadraticCurveTo(S * .62, S * .82, S * .63, S * .93); c.lineTo(S * .37, S * .93); c.quadraticCurveTo(S * .38, S * .82, S * .455, S * .74); c.closePath(); },
      lin(c, S * .44, 0, S * .56, 0, [[0, '#2a2f45'], [.4, '#4b5372'], [1, '#0d1020']]));
    c.fillStyle = '#d9e2ea'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(S * .5, S * (.24 + i * .08), S * .016, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = '#d9e2ea'; c.lineWidth = S * .008; for (const y of [.2, .36, .52, .68]) { c.beginPath(); c.moveTo(S * .465, S * y); c.lineTo(S * .535, S * y); c.stroke(); }
    c.fillStyle = '#c9cfd6'; c.fillRect(S * .468, S * .1, S * .064, S * .025);   // the ligature
    c.restore();
  },
  trumpet(c, S) {   // a gold trumpet, bell to the right
    const gold = lin(c, 0, S * .35, 0, S * .65, [[0, '#fff3b0'], [.4, '#f4c430'], [1, '#a8740d']]);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .62, S * .46); c.quadraticCurveTo(S * .8, S * .44, S * .95, S * .28); c.lineTo(S * .95, S * .72); c.quadraticCurveTo(S * .8, S * .56, S * .62, S * .54); c.closePath(); }, gold);   // bell
    shape(c, S, () => { c.beginPath(); c.roundRect(S * .1, S * .46, S * .54, S * .08, S * .03); }, gold);   // lead pipe
    shape(c, S, () => { c.beginPath(); c.roundRect(S * .26, S * .54, S * .3, S * .12, S * .06); }, 'rgba(0,0,0,0)');   // the loop
    for (const x of [.34, .41, .48]) { shape(c, S, () => { c.beginPath(); c.roundRect(S * (x - .018), S * .32, S * .036, S * .16, S * .01); }, gold, .01);
      shape(c, S, () => { c.beginPath(); c.ellipse(S * x, S * .31, S * .03, S * .014, 0, 0, Math.PI * 2); }, '#fff6d0', .008); }   // valves
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .04, S * .45); c.lineTo(S * .1, S * .47); c.lineTo(S * .1, S * .53); c.lineTo(S * .04, S * .55); c.closePath(); }, '#d8dee4');   // mouthpiece
    c.beginPath(); c.ellipse(S * .78, S * .4, S * .06, S * .02, -.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
  },
  piano(c, S) {   // a little grand piano, lid up
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .14, S * .5); c.lineTo(S * .56, S * .18); c.quadraticCurveTo(S * .9, S * .12, S * .88, S * .4); c.lineTo(S * .86, S * .5); c.closePath(); }, lin(c, 0, S * .15, 0, S * .5, [[0, '#3a4166'], [1, '#0b0e1c']]));   // the lid
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .1, S * .5); c.lineTo(S * .9, S * .5); c.quadraticCurveTo(S * .94, S * .5, S * .94, S * .56); c.lineTo(S * .94, S * .66); c.lineTo(S * .1, S * .66); c.closePath(); }, '#141a33');   // body
    c.fillStyle = '#ffffff'; c.fillRect(S * .13, S * .52, S * .6, S * .1);
    c.strokeStyle = INK; c.lineWidth = S * .005; for (let i = 0; i <= 12; i++) { c.beginPath(); c.moveTo(S * (.13 + i * .05), S * .52); c.lineTo(S * (.13 + i * .05), S * .62); c.stroke(); }
    c.fillStyle = INK; for (let i = 0; i < 12; i++) if ([0, 1, 3, 4, 5, 7, 8, 10, 11].includes(i)) c.fillRect(S * (.13 + i * .05 + .033), S * .52, S * .03, S * .06);
    for (const x of [.18, .82]) line(c, S, [[x, .66], [x, .86]], '#141a33', .025);   // legs
    line(c, S, [[.45, .66], [.45, .8], [.5, .8]], '#f4c430', .012);   // pedal
  },
  drums(c, S) {   // a snare and a ride cymbal, sticks crossed
    line(c, S, [[.72, .32], [.72, .9]], '#c9cfd6', .012); line(c, S, [[.62, .9], [.72, .8], [.82, .9]], '#c9cfd6', .01);   // cymbal stand
    shape(c, S, () => { c.beginPath(); c.ellipse(S * .72, S * .3, S * .22, S * .05, -.12, 0, Math.PI * 2); }, lin(c, S * .5, 0, S * .94, 0, [[0, '#fff1a8'], [.5, '#e3b22d'], [1, '#9c7110']]));
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .1, S * .55); c.lineTo(S * .1, S * .76); c.ellipse(S * .32, S * .76, S * .22, S * .07, 0, Math.PI, 0, true); c.lineTo(S * .54, S * .55); c.closePath(); }, lin(c, S * .1, 0, S * .54, 0, [[0, '#ff4f9a'], [.5, '#ff8fc0'], [1, '#b0185a']]));   // shell
    shape(c, S, () => { c.beginPath(); c.ellipse(S * .32, S * .55, S * .22, S * .07, 0, 0, Math.PI * 2); }, '#f6f2ea');   // head
    c.strokeStyle = '#d9dde3'; c.lineWidth = S * .008; for (const x of [.15, .25, .39, .49]) { c.beginPath(); c.moveTo(S * x, S * .58); c.lineTo(S * x, S * .78); c.stroke(); }
    line(c, S, [[.12, .2], [.38, .53]], '#e6c28a', .018); line(c, S, [[.52, .22], [.3, .53]], '#e6c28a', .018);   // sticks
    c.fillStyle = '#ffffff'; for (const [a, b] of [[.56, .2], [.9, .22], [.6, .4]]) { c.save(); c.translate(S * a, S * b); c.rotate(.785); c.fillRect(-S * .012, -S * .012, S * .024, S * .024); c.restore(); }   // shine
  },
  bass(c, S) {   // an upright bass, scroll at the top
    const wood = lin(c, S * .3, 0, S * .7, 0, [[0, '#7a3c14'], [.45, '#c8722e'], [1, '#5c2a0c']]);
    line(c, S, [[.5, .06], [.5, .4]], '#2a1a12', .04);   // neck
    shape(c, S, () => { c.beginPath(); c.arc(S * .5, S * .07, S * .035, 0, Math.PI * 2); }, '#5c2a0c');   // scroll
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .5, S * .32);
      c.bezierCurveTo(S * .68, S * .32, S * .7, S * .46, S * .62, S * .52); c.bezierCurveTo(S * .78, S * .6, S * .78, S * .92, S * .5, S * .93);
      c.bezierCurveTo(S * .22, S * .92, S * .22, S * .6, S * .38, S * .52); c.bezierCurveTo(S * .3, S * .46, S * .32, S * .32, S * .5, S * .32); c.closePath(); }, wood);   // body
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(S * (.5 + d * .1), S * .6); c.bezierCurveTo(S * (.5 + d * .13), S * .64, S * (.5 + d * .07), S * .7, S * (.5 + d * .1), S * .74); c.lineWidth = S * .01; c.strokeStyle = INK; c.stroke(); }   // f-holes
    c.fillStyle = '#1a0e08'; c.fillRect(S * .47, S * .66, S * .06, S * .02);   // bridge
    c.strokeStyle = '#f3e7cf'; c.lineWidth = S * .005; for (const d of [-.015, -.005, .005, .015]) { c.beginPath(); c.moveTo(S * (.5 + d), S * .08); c.lineTo(S * (.5 + d), S * .82); c.stroke(); }
    line(c, S, [[.5, .93], [.5, .98]], '#c9cfd6', .012);   // endpin
  },
};
export const KINDS = Object.keys(DRAW);
export function drawThing(ctx, kind, S) { ctx.save(); DRAW[kind](ctx, S); ctx.restore(); }
export function thingCanvas(kind, S = 256) { const cv = document.createElement('canvas'); cv.width = cv.height = S; drawThing(cv.getContext('2d'), kind, S); return cv; }
