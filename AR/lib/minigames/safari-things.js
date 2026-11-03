// ALMOST BLINDNESS · SOUND SAFARI: the six sound-makers hidden in the fog, drawn in code to sit in Ben's swirling tunnel.
// Deep teal outline, warm orange light on one side (from the glow at the end of the tunnel), a soft halo so each one
// reads against the dark swirls.
//   drawThing(ctx, kind, S)  draws one into an S × S canvas.      thingCanvas(kind, S=256) returns a new canvas.
const INK = '#10202a';
const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
const rad = (c, x, y, r0, x1, y1, r1, st) => { const g = c.createRadialGradient(x, y, r0, x1, y1, r1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
function stroke(c, w) { c.lineWidth = w; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
function halo(c, S, col = '255,190,120') {
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * .48);
  g.addColorStop(0, `rgba(${col},.34)`); g.addColorStop(.6, `rgba(${col},.12)`); g.addColorStop(1, `rgba(${col},0)`);
  c.fillStyle = g; c.fillRect(0, 0, S, S);
}
function waves(c, x, y, r, dir, S, col = 'rgba(255,236,200,.9)') {   // little sound waves
  c.strokeStyle = col; c.lineCap = 'round';
  for (const k of [1, 1.6, 2.2]) { c.beginPath(); c.arc(x, y, r * k, dir - .6, dir + .6); c.lineWidth = S * .018; c.stroke(); }
}

const DRAW = {
  birds(c, S) {   // a little songbird singing on a leafy branch
    halo(c, S, '255,200,130');
    c.beginPath(); c.moveTo(S * .1, S * .74); c.quadraticCurveTo(S * .5, S * .66, S * .9, S * .72); c.lineWidth = S * .05; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = S * .03; c.strokeStyle = '#6b4a34'; c.stroke();
    const leaf = (x, y, a, col) => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(S * .06, -S * .045, S * .12, 0); c.quadraticCurveTo(S * .06, S * .045, 0, 0); c.fillStyle = col; c.fill(); stroke(c, S * .008); c.restore(); };
    [[.18, .72, -2.4, '#4f8f6a'], [.26, .71, .5, '#6fae7e'], [.72, .69, -.8, '#4f8f6a'], [.8, .71, .6, '#6fae7e'], [.86, .72, -2.0, '#3d7a5a']].forEach(([x, y, a, k]) => leaf(S * x, S * y, a, k));
    const x = S * .48, y = S * .5;
    c.beginPath(); c.moveTo(x - S * .14, y + S * .02); c.lineTo(x - S * .27, y + S * .1); c.lineTo(x - S * .22, y - S * .01); c.closePath(); c.fillStyle = '#2f6f8f'; c.fill(); stroke(c, S * .012);   // tail
    c.beginPath(); c.ellipse(x, y + S * .02, S * .15, S * .11, -.15, 0, Math.PI * 2);
    c.fillStyle = rad(c, x + S * .05, y - S * .03, S * .01, x, y, S * .17, [[0, '#7fc3e0'], [1, '#2a6584']]); c.fill(); stroke(c, S * .014);
    c.beginPath(); c.ellipse(x + S * .05, y + S * .06, S * .08, S * .05, -.2, 0, Math.PI * 2); c.fillStyle = '#f39a4a'; c.fill();   // orange breast
    c.beginPath(); c.ellipse(x - S * .03, y + S * .01, S * .08, S * .05, .3, 0, Math.PI * 2); c.fillStyle = 'rgba(20,60,80,.45)'; c.fill(); stroke(c, S * .01);   // wing
    c.beginPath(); c.arc(x + S * .12, y - S * .09, S * .075, 0, Math.PI * 2); c.fillStyle = rad(c, x + S * .14, y - S * .11, 1, x + S * .12, y - S * .09, S * .08, [[0, '#8fd0ea'], [1, '#2f6f8f']]); c.fill(); stroke(c, S * .014);   // head
    c.beginPath(); c.moveTo(x + S * .185, y - S * .1); c.lineTo(x + S * .25, y - S * .12); c.lineTo(x + S * .19, y - S * .075); c.closePath(); c.fillStyle = '#f5b542'; c.fill(); stroke(c, S * .008);   // open beak
    c.beginPath(); c.arc(x + S * .135, y - S * .105, S * .016, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    for (const d of [-.03, .03]) { c.beginPath(); c.moveTo(x + S * d, y + S * .12); c.lineTo(x + S * d, y + S * .19); stroke(c, S * .012); }
    c.fillStyle = '#ffe7c0'; c.font = `900 ${S * .11}px Georgia, serif`; c.textAlign = 'center'; c.fillText('♪', S * .82, S * .3); c.font = `900 ${S * .08}px Georgia, serif`; c.fillText('♫', S * .7, S * .2);
  },
  bell(c, S) {   // a shiny bicycle bell on a handlebar
    halo(c, S, '255,200,130');
    c.beginPath(); c.roundRect(S * .06, S * .62, S * .88, S * .09, S * .045); c.fillStyle = lin(c, 0, S * .62, 0, S * .71, [[0, '#d8dee2'], [.5, '#8a959c'], [1, '#4c565c']]); c.fill(); stroke(c, S * .012);   // handlebar
    c.beginPath(); c.roundRect(S * .74, S * .6, S * .2, S * .13, S * .05); c.fillStyle = '#2b2b2b'; c.fill(); stroke(c, S * .012);   // grip
    c.fillStyle = '#4c565c'; c.fillRect(S * .44, S * .56, S * .12, S * .08);
    const x = S * .5, y = S * .44, r = S * .2;
    c.beginPath(); c.ellipse(x, y + r * .25, r, r * .82, 0, Math.PI, 0); c.lineTo(x + r, y + r * .3); c.ellipse(x, y + r * .3, r, r * .22, 0, 0, Math.PI); c.closePath();
    c.fillStyle = rad(c, x - r * .4, y - r * .3, r * .05, x, y, r * 1.2, [[0, '#ffffff'], [.35, '#e6d27a'], [1, '#9b7a22']]); c.fill(); stroke(c, S * .016);
    c.beginPath(); c.ellipse(x, y + r * .3, r, r * .22, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(80,60,20,.35)'; c.fill(); stroke(c, S * .01);
    c.beginPath(); c.arc(x, y - r * .62, r * .12, 0, Math.PI * 2); c.fillStyle = '#c9a73e'; c.fill(); stroke(c, S * .01);
    c.beginPath(); c.moveTo(x + r * .6, y + r * .5); c.lineTo(x + r * 1.05, y + r * .75); c.lineWidth = S * .03; c.strokeStyle = INK; c.stroke(); c.lineWidth = S * .016; c.strokeStyle = '#d9c06a'; c.stroke();   // the thumb lever
    c.beginPath(); c.ellipse(x - r * .45, y - r * .2, r * .18, r * .09, -.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
    waves(c, x, y, r * .9, -Math.PI / 2 - .9, S); waves(c, x, y, r * .9, -Math.PI / 2 + .9, S);
  },
  drips(c, S) {   // an old tap dripping into a puddle
    halo(c, S, '170,220,255');
    c.beginPath(); c.roundRect(S * .06, S * .18, S * .16, S * .2, S * .03); c.fillStyle = '#5d6b72'; c.fill(); stroke(c, S * .012);   // the wall plate
    c.beginPath(); c.moveTo(S * .2, S * .24); c.lineTo(S * .5, S * .24); c.quadraticCurveTo(S * .62, S * .24, S * .62, S * .36); c.lineTo(S * .62, S * .42); c.lineTo(S * .52, S * .42); c.lineTo(S * .52, S * .36); c.quadraticCurveTo(S * .52, S * .33, S * .48, S * .33); c.lineTo(S * .2, S * .33); c.closePath();
    c.fillStyle = lin(c, 0, S * .22, 0, S * .42, [[0, '#f2f5f7'], [.45, '#a9b4ba'], [1, '#5f6b71']]); c.fill(); stroke(c, S * .014);
    c.beginPath(); c.roundRect(S * .32, S * .14, S * .1, S * .1, S * .02); c.fillStyle = '#a9b4ba'; c.fill(); stroke(c, S * .012);
    c.beginPath(); c.ellipse(S * .37, S * .12, S * .1, S * .03, 0, 0, Math.PI * 2); c.fillStyle = '#d33f3f'; c.fill(); stroke(c, S * .012);   // a red handle
    const drop = (x, y, s) => { c.beginPath(); c.moveTo(x, y - s * 1.6); c.quadraticCurveTo(x + s, y - s * .2, x + s, y + s * .2); c.arc(x, y + s * .2, s, 0, Math.PI); c.quadraticCurveTo(x - s, y - s * .2, x, y - s * 1.6);
      c.fillStyle = rad(c, x - s * .3, y, s * .1, x, y, s * 1.3, [[0, '#e8f7ff'], [1, '#4fa3d6']]); c.fill(); stroke(c, S * .009); };
    drop(S * .57, S * .5, S * .03); drop(S * .57, S * .63, S * .022);
    c.beginPath(); c.ellipse(S * .57, S * .84, S * .3, S * .07, 0, 0, Math.PI * 2); c.fillStyle = lin(c, 0, S * .78, 0, S * .9, [[0, '#a8d8f2'], [1, '#3a7fae']]); c.fill(); stroke(c, S * .012);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = S * .01; for (const r of [.06, .12]) { c.beginPath(); c.ellipse(S * .57, S * .83, S * r, S * r * .3, 0, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = '#cdeeff'; for (const [a, b] of [[.48, .76], [.66, .75], [.52, .73]]) { c.beginPath(); c.arc(S * a, S * b, S * .012, 0, Math.PI * 2); c.fill(); }
  },
  chimes(c, S) {   // wind chimes, swaying
    halo(c, S, '255,210,150');
    c.beginPath(); c.moveTo(S * .5, S * .04); c.lineTo(S * .5, S * .14); stroke(c, S * .01);
    c.beginPath(); c.ellipse(S * .5, S * .17, S * .26, S * .05, 0, 0, Math.PI * 2); c.fillStyle = lin(c, 0, S * .12, 0, S * .22, [[0, '#c98a4f'], [1, '#7a4d26']]); c.fill(); stroke(c, S * .012);   // wooden top
    const tubes = [[.3, .52, '#e9c46a'], [.4, .62, '#7fc3e0'], [.5, .7, '#e9c46a'], [.6, .6, '#7fc3e0'], [.7, .5, '#e9c46a']];
    tubes.forEach(([x, len, col], i) => { const sway = (i - 2) * .02;
      c.beginPath(); c.moveTo(S * x, S * .2); c.lineTo(S * (x + sway), S * .27); c.lineWidth = S * .006; c.strokeStyle = INK; c.stroke();
      c.save(); c.translate(S * (x + sway), S * .27); c.rotate(-sway * 1.5);
      c.beginPath(); c.roundRect(-S * .028, 0, S * .056, S * (len - .27), S * .02); c.fillStyle = lin(c, -S * .03, 0, S * .03, 0, [[0, '#ffffff'], [.35, col], [1, '#4a3a20']]); c.fill(); stroke(c, S * .01);
      c.restore(); });
    c.beginPath(); c.moveTo(S * .5, S * .2); c.lineTo(S * .5, S * .78); c.lineWidth = S * .006; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(S * .5, S * .5, S * .04, 0, Math.PI * 2); c.fillStyle = '#c98a4f'; c.fill(); stroke(c, S * .01);   // the striker
    c.beginPath(); c.moveTo(S * .5, S * .78); c.lineTo(S * .44, S * .9); c.lineTo(S * .56, S * .9); c.closePath(); c.fillStyle = '#d96b3a'; c.fill(); stroke(c, S * .01);   // the sail
    c.fillStyle = '#ffe7c0'; for (const [a, b] of [[.2, .4], [.82, .35], [.85, .62], [.16, .66]]) { c.save(); c.translate(S * a, S * b); c.rotate(.785); c.fillRect(-S * .015, -S * .015, S * .03, S * .03); c.restore(); }   // twinkles
  },
  crossing(c, S) {   // an accessible crosswalk push button, with its raised arrow, on a pole
    halo(c, S, '255,200,120');
    c.beginPath(); c.roundRect(S * .44, S * .02, S * .12, S * .96, S * .04); c.fillStyle = lin(c, S * .44, 0, S * .56, 0, [[0, '#c9ced1'], [.4, '#8e979c'], [1, '#4b5357']]); c.fill(); stroke(c, S * .012);   // pole
    c.beginPath(); c.roundRect(S * .28, S * .2, S * .44, S * .6, S * .06); c.fillStyle = lin(c, 0, S * .2, 0, S * .8, [[0, '#f2c230'], [1, '#c48d10']]); c.fill(); stroke(c, S * .016);   // yellow box
    c.beginPath(); c.roundRect(S * .34, S * .26, S * .32, S * .16, S * .03); c.fillStyle = '#1d2a30'; c.fill(); stroke(c, S * .01);   // sign window
    c.fillStyle = '#f2f2f2'; c.beginPath(); c.arc(S * .48, S * .29, S * .018, 0, Math.PI * 2); c.fill();   // a walking figure
    c.strokeStyle = '#f2f2f2'; c.lineWidth = S * .014; c.lineCap = 'round'; c.beginPath(); c.moveTo(S * .48, S * .31); c.lineTo(S * .47, S * .36); c.lineTo(S * .44, S * .4); c.moveTo(S * .47, S * .36); c.lineTo(S * .5, S * .4); c.moveTo(S * .48, S * .33); c.lineTo(S * .52, S * .35); c.moveTo(S * .48, S * .33); c.lineTo(S * .45, S * .35); c.stroke();
    c.beginPath(); c.arc(S * .5, S * .6, S * .1, 0, Math.PI * 2); c.fillStyle = rad(c, S * .47, S * .57, 1, S * .5, S * .6, S * .1, [[0, '#ffffff'], [1, '#9aa4a8']]); c.fill(); stroke(c, S * .014);   // the big button
    c.beginPath(); c.moveTo(S * .44, S * .6); c.lineTo(S * .54, S * .6); c.moveTo(S * .5, S * .56); c.lineTo(S * .55, S * .6); c.lineTo(S * .5, S * .64); c.lineWidth = S * .018; c.strokeStyle = INK; c.stroke();   // the raised arrow you feel
    c.beginPath(); c.arc(S * .5, S * .74, S * .015, 0, Math.PI * 2); c.fillStyle = '#c0392b'; c.fill();   // the speaker light
    waves(c, S * .72, S * .66, S * .05, 0, S, 'rgba(255,236,200,.95)');
  },
  dog(c, S) {   // a guide dog in its harness, tags jingling
    halo(c, S, '255,200,130');
    const x = S * .48, gold = lin(c, x - S * .25, S * .3, x + S * .2, S * .9, [[0, '#f0c47c'], [.6, '#d39a4c'], [1, '#9a6a2c']]);
    c.beginPath(); c.moveTo(x + S * .14, S * .74); c.quadraticCurveTo(x + S * .34, S * .7, x + S * .36, S * .52); c.lineWidth = S * .05; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = S * .03; c.strokeStyle = '#d39a4c'; c.stroke();   // tail
    c.beginPath(); c.moveTo(x - S * .06, S * .46); c.bezierCurveTo(x - S * .22, S * .52, x - S * .24, S * .86, x - S * .16, S * .88); c.lineTo(x + S * .17, S * .88); c.bezierCurveTo(x + S * .24, S * .86, x + S * .22, S * .52, x + S * .07, S * .46); c.closePath(); c.fillStyle = gold; c.fill(); stroke(c, S * .014);   // body
    for (const d of [-1, 1]) { c.beginPath(); c.ellipse(x + d * S * .055, S * .875, S * .05, S * .025, 0, 0, Math.PI * 2); c.fillStyle = '#e7b56c'; c.fill(); stroke(c, S * .01); }
    // the harness: a strap round the chest and the stiff handle up the back
    c.beginPath(); c.moveTo(x - S * .19, S * .62); c.quadraticCurveTo(x, S * .68, x + S * .19, S * .62); c.lineWidth = S * .05; c.strokeStyle = INK; c.stroke(); c.lineWidth = S * .032; c.strokeStyle = '#2f4f8a'; c.stroke();
    c.beginPath(); c.moveTo(x + S * .1, S * .62); c.lineTo(x + S * .28, S * .36); c.lineTo(x + S * .36, S * .4); c.lineWidth = S * .03; c.strokeStyle = INK; c.stroke(); c.lineWidth = S * .016; c.strokeStyle = '#cfd5d8'; c.stroke();
    c.beginPath(); c.roundRect(x - S * .06, S * .6, S * .12, S * .06, S * .01); c.fillStyle = '#f2c230'; c.fill(); stroke(c, S * .008);   // the yellow patch
    // head
    const hy = S * .33, hr = S * .12;
    c.beginPath(); c.ellipse(x, hy, hr * 1.05, hr, 0, 0, Math.PI * 2); c.fillStyle = rad(c, x - hr * .4, hy - hr * .5, hr * .1, x, hy, hr * 1.2, [[0, '#f6d394'], [1, '#c48a3e']]); c.fill(); stroke(c, S * .014);
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * hr * .6, hy - hr * .75); c.bezierCurveTo(x + d * hr * 1.5, hy - hr * .6, x + d * hr * 1.4, hy + hr * .6, x + d * hr * 1.0, hy + hr * .7); c.quadraticCurveTo(x + d * hr * .8, hy, x + d * hr * .6, hy - hr * .75); c.fillStyle = '#b97a34'; c.fill(); stroke(c, S * .012); }
    c.beginPath(); c.ellipse(x, hy + hr * .45, hr * .5, hr * .35, 0, 0, Math.PI * 2); c.fillStyle = '#f8e0b0'; c.fill();
    for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * hr * .38, hy - hr * .12, hr * .11, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); c.beginPath(); c.arc(x + d * hr * .38 - hr * .03, hy - hr * .16, hr * .035, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); }
    c.beginPath(); c.ellipse(x, hy + hr * .32, hr * .16, hr * .11, 0, 0, Math.PI * 2); c.fillStyle = '#2a1d15'; c.fill();
    c.beginPath(); c.moveTo(x - hr * .25, hy + hr * .55); c.quadraticCurveTo(x, hy + hr * .72, x + hr * .25, hy + hr * .55); stroke(c, S * .009);
    // collar and jingling tags
    c.beginPath(); c.moveTo(x - S * .1, S * .45); c.quadraticCurveTo(x, S * .49, x + S * .1, S * .45); c.lineWidth = S * .03; c.strokeStyle = INK; c.stroke(); c.lineWidth = S * .018; c.strokeStyle = '#2f4f8a'; c.stroke();
    for (const [d, col] of [[-.025, '#f2c94c'], [.02, '#cfd5d8']]) { c.beginPath(); c.arc(x + S * d, S * .505, S * .02, 0, Math.PI * 2); c.fillStyle = col; c.fill(); stroke(c, S * .007); }
    c.strokeStyle = 'rgba(255,236,200,.95)'; c.lineWidth = S * .012; for (const [a, b, e] of [[-.1, .53, -.5], [.1, .53, .5]]) { c.beginPath(); c.moveTo(x + S * a, S * b); c.lineTo(x + S * (a + e * .08), S * (b + .02)); c.stroke(); }
  },
};
export const KINDS = Object.keys(DRAW);
export function drawThing(ctx, kind, S) { ctx.save(); DRAW[kind](ctx, S); ctx.restore(); }
export function thingCanvas(kind, S = 256) { const cv = document.createElement('canvas'); cv.width = cv.height = S; drawThing(cv.getContext('2d'), kind, S); return cv; }
