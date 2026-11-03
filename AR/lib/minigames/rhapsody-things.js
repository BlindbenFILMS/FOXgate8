// RHAPSODY IN BLUE · JAZZ SAYS: the band's five instruments and their spotlight badges, drawn in code.
// Rich, polished jazz-club style: shaded metal and wood, bright highlights, a crisp white outline so each reads on the
// busy blue painting.
//   drawThing(ctx, kind, S)  one instrument, centred, in an S × S canvas.   thingCanvas(kind, S=512) → a new canvas.
//   badgeCanvas(color, S=512)  the round spotlight each instrument sits on.
const INK = '#0b1330', OUT = '#ffffff';
const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
const rad = (c, x, y, r0, x1, y1, r1, st) => { const g = c.createRadialGradient(x, y, r0, x1, y1, r1); st.forEach(([o, k]) => g.addColorStop(o, k)); return g; };
// a filled shape with a thick white outline under a fine ink edge
function shape(c, S, path, fill, w = .012) {
  c.save(); path(); c.lineWidth = S * (w + .026); c.strokeStyle = OUT; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); c.restore();
  c.save(); path(); c.fillStyle = fill; c.fill(); c.lineWidth = S * w; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.restore();
}
function line(c, S, pts, col, w, outline = true) {
  for (const [ww, cc] of outline ? [[w + .026, OUT], [w + .01, INK], [w, col]] : [[w, col]]) {
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(S * x, S * y) : c.moveTo(S * x, S * y)); c.lineWidth = S * ww; c.strokeStyle = cc; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
}
function shine(c, S, x, y, rx, ry, a = 0, o = .8) { c.save(); c.beginPath(); c.ellipse(S * x, S * y, S * rx, S * ry, a, 0, Math.PI * 2); c.fillStyle = `rgba(255,255,255,${o})`; c.fill(); c.restore(); }
function sparkle(c, S, x, y, r) { c.save(); c.translate(S * x, S * y); c.fillStyle = '#ffffff'; c.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .28 : r; c.lineTo(Math.cos(a) * S * rr, Math.sin(a) * S * rr); } c.closePath(); c.fill(); c.restore(); }
const GOLD = (c, S, x0, x1) => lin(c, S * x0, 0, S * x1, 0, [[0, '#8a5a06'], [.18, '#e0a92a'], [.4, '#fff3b8'], [.55, '#f2c84a'], [.8, '#c48a14'], [1, '#7a4c05']]);
const SILVER = (c, S, x0, x1) => lin(c, S * x0, 0, S * x1, 0, [[0, '#5d6670'], [.3, '#e9eef2'], [.5, '#ffffff'], [.7, '#b7c0c8'], [1, '#4c545c']]);

const DRAW = {
  clarinet(c, S) {   // grenadilla-black clarinet with silver keys, tipped at an angle
    c.save(); c.translate(S * .5, S * .5); c.rotate(-.72); c.translate(-S * .5, -S * .5);
    const body = lin(c, S * .44, 0, S * .56, 0, [[0, '#05070e'], [.3, '#3a4160'], [.5, '#6b7396'], [.7, '#262b40'], [1, '#05070e']]);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .476, S * .1); c.lineTo(S * .524, S * .1); c.lineTo(S * .536, S * .72); c.bezierCurveTo(S * .56, S * .8, S * .64, S * .86, S * .65, S * .95); c.lineTo(S * .35, S * .95); c.bezierCurveTo(S * .36, S * .86, S * .44, S * .8, S * .464, S * .72); c.closePath(); }, body);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .482, S * .03); c.lineTo(S * .518, S * .03); c.lineTo(S * .524, S * .1); c.lineTo(S * .476, S * .1); c.closePath(); }, '#11131c', .008);   // mouthpiece
    shape(c, S, () => { c.beginPath(); c.roundRect(S * .468, S * .1, S * .064, S * .026, S * .006); }, SILVER(c, S, .468, .532), .006);   // ligature
    for (const y of [.3, .52, .7]) shape(c, S, () => { c.beginPath(); c.roundRect(S * .462, S * y, S * .076, S * .02, S * .006); }, SILVER(c, S, .46, .54), .005);   // joint rings
    shape(c, S, () => { c.beginPath(); c.ellipse(S * .5, S * .945, S * .15, S * .02, 0, 0, Math.PI * 2); }, SILVER(c, S, .35, .65), .006);   // bell ring
    for (let i = 0; i < 7; i++) { const y = .17 + i * .075; c.beginPath(); c.arc(S * .5, S * y, S * .017, 0, Math.PI * 2); c.fillStyle = SILVER(c, S, .48, .52); c.fill(); c.lineWidth = S * .004; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.moveTo(S * .515, S * y); c.lineTo(S * .545, S * (y + .03)); c.lineWidth = S * .007; c.strokeStyle = '#d7dde3'; c.stroke(); }
    shine(c, S, .489, .5, .006, .2, 0, .35);
    c.restore();
    sparkle(c, S, .78, .22, .04); sparkle(c, S, .2, .8, .025);
  },
  trumpet(c, S) {   // a gleaming brass trumpet, bell to the right
    const g = (y0, y1) => lin(c, 0, S * y0, 0, S * y1, [[0, '#fff6c8'], [.3, '#f6cf48'], [.6, '#c78d12'], [1, '#6e4504']]);
    shape(c, S, () => { c.beginPath(); c.roundRect(S * .25, S * .55, S * .38, S * .13, S * .065); c.roundRect(S * .29, S * .58, S * .3, S * .07, S * .035); }, 'rgba(0,0,0,0)');   // the lower loop (outline)
    line(c, S, [[.27, .615], [.6, .615]], '#d9a224', .028, false);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .6, S * .45); c.bezierCurveTo(S * .78, S * .44, S * .86, S * .36, S * .97, S * .24); c.lineTo(S * .97, S * .76); c.bezierCurveTo(S * .86, S * .64, S * .78, S * .56, S * .6, S * .55); c.closePath(); }, g(.24, .76));   // bell
    shape(c, S, () => { c.beginPath(); c.ellipse(S * .965, S * .5, S * .035, S * .26, 0, 0, Math.PI * 2); }, rad(c, S * .96, S * .5, 1, S * .96, S * .5, S * .26, [[0, '#4a2a02'], [.5, '#b9800f'], [1, '#ffe27a']]), .008);   // inside of the bell
    shape(c, S, () => { c.beginPath(); c.roundRect(S * .1, S * .455, S * .52, S * .09, S * .045); }, g(.455, .545));   // lead pipe
    for (const x of [.33, .41, .49]) {
      shape(c, S, () => { c.beginPath(); c.roundRect(S * (x - .026), S * .3, S * .052, S * .22, S * .012); }, lin(c, S * (x - .03), 0, S * (x + .03), 0, [[0, '#7a4c05'], [.4, '#ffe9a0'], [1, '#9a6608']]), .009);   // valve casing
      shape(c, S, () => { c.beginPath(); c.roundRect(S * (x - .012), S * .22, S * .024, S * .08, S * .006); }, SILVER(c, S, x - .012, x + .012), .006);   // stem
      shape(c, S, () => { c.beginPath(); c.ellipse(S * x, S * .215, S * .036, S * .016, 0, 0, Math.PI * 2); }, rad(c, S * x, S * .21, 1, S * x, S * .215, S * .036, [[0, '#ffffff'], [.6, '#f3efe4'], [1, '#c7bfa8']]), .007);   // pearl button
    }
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .02, S * .44); c.quadraticCurveTo(S * .06, S * .44, S * .1, S * .475); c.lineTo(S * .1, S * .525); c.quadraticCurveTo(S * .06, S * .56, S * .02, S * .56); c.closePath(); }, SILVER(c, S, .02, .1), .008);   // mouthpiece
    shine(c, S, .3, .475, .16, .008, 0, .7); shine(c, S, .8, .37, .07, .018, -.55, .65);
    sparkle(c, S, .86, .2, .045); sparkle(c, S, .15, .3, .028);
  },
  piano(c, S) {   // a glossy black grand piano, lid propped open
    const black = lin(c, 0, S * .15, 0, S * .7, [[0, '#4a5480'], [.35, '#1a2040'], [1, '#04060e']]);
    line(c, S, [[.5, .48], [.62, .24]], '#c9a54a', .012);   // the lid prop
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .1, S * .48); c.lineTo(S * .5, S * .14); c.bezierCurveTo(S * .75, S * .04, S * .95, S * .14, S * .9, S * .38); c.lineTo(S * .88, S * .48); c.closePath(); }, black);   // lid
    shine(c, S, .55, .24, .22, .025, -.55, .35);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .06, S * .48); c.lineTo(S * .9, S * .48); c.quadraticCurveTo(S * .96, S * .48, S * .96, S * .55); c.lineTo(S * .96, S * .66); c.lineTo(S * .06, S * .66); c.closePath(); }, black);   // case
    // the keyboard
    c.fillStyle = '#fbf8f0'; c.fillRect(S * .09, S * .505, S * .66, S * .11);
    c.strokeStyle = '#7d828f'; c.lineWidth = S * .003; for (let i = 0; i <= 15; i++) { c.beginPath(); c.moveTo(S * (.09 + i * .044), S * .505); c.lineTo(S * (.09 + i * .044), S * .615); c.stroke(); }
    c.fillStyle = '#070a14'; for (let i = 0; i < 15; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) c.fillRect(S * (.09 + i * .044 + .029), S * .505, S * .028, S * .068);
    c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 15; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) c.fillRect(S * (.09 + i * .044 + .033), S * .508, S * .006, S * .04);
    line(c, S, [[.09, .505], [.75, .505]], '#0b1330', .006, false);
    // legs, brass casters, pedals
    for (const x of [.14, .86]) { shape(c, S, () => { c.beginPath(); c.moveTo(S * (x - .03), S * .66); c.lineTo(S * (x + .03), S * .66); c.lineTo(S * (x + .018), S * .88); c.lineTo(S * (x - .018), S * .88); c.closePath(); }, black, .008);
      shape(c, S, () => { c.beginPath(); c.arc(S * x, S * .9, S * .022, 0, Math.PI * 2); }, GOLD(c, S, x - .02, x + .02), .006); }
    line(c, S, [[.45, .66], [.45, .82]], '#141a33', .02);   // the pedal lyre
    for (const x of [.42, .45, .48]) line(c, S, [[x, .83], [x, .86]], '#e0b23c', .01, false);
    sparkle(c, S, .82, .12, .04); sparkle(c, S, .18, .3, .025);
  },
  drums(c, S) {   // a jazz kit: bass drum, snare, ride cymbal and hi-hat, sticks mid-hit
    // cymbal stands
    line(c, S, [[.82, .25], [.82, .9]], '#c9ced4', .01); line(c, S, [[.74, .93], [.82, .85], [.9, .93]], '#c9ced4', .008);
    line(c, S, [[.13, .33], [.13, .9]], '#c9ced4', .01); line(c, S, [[.06, .93], [.13, .86], [.2, .93]], '#c9ced4', .008);
    const cym = (x, y, rx) => shape(c, S, () => { c.beginPath(); c.ellipse(S * x, S * y, S * rx, S * rx * .22, -.08, 0, Math.PI * 2); },
      lin(c, S * (x - rx), 0, S * (x + rx), 0, [[0, '#8a5d08'], [.3, '#f2c94c'], [.5, '#fff4c2'], [.7, '#e2ad2c'], [1, '#7a5006']]), .008);
    cym(.82, .24, .17); cym(.13, .33, .11); cym(.13, .3, .11);   // ride, and the two hi-hat cymbals
    c.strokeStyle = 'rgba(122,80,6,.6)'; c.lineWidth = S * .003; for (const k of [.4, .7]) { c.beginPath(); c.ellipse(S * .82, S * .24, S * .17 * k, S * .17 * k * .22, -.08, 0, Math.PI * 2); c.stroke(); }
    // the bass drum, front head with a logo ring
    shape(c, S, () => { c.beginPath(); c.arc(S * .5, S * .66, S * .25, 0, Math.PI * 2); }, rad(c, S * .43, S * .58, S * .02, S * .5, S * .66, S * .26, [[0, '#ff9ccb'], [.55, '#e84a8f'], [1, '#8f1450']]));
    shape(c, S, () => { c.beginPath(); c.arc(S * .5, S * .66, S * .2, 0, Math.PI * 2); }, rad(c, S * .45, S * .6, S * .01, S * .5, S * .66, S * .2, [[0, '#ffffff'], [1, '#e9e4da']]), .008);
    c.fillStyle = '#0b1330'; c.font = `900 ${S * .07}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('JAZZ', S * .5, S * .665);
    c.strokeStyle = '#e84a8f'; c.lineWidth = S * .01; c.beginPath(); c.arc(S * .5, S * .66, S * .14, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; c.beginPath(); c.arc(S * (.5 + Math.cos(a) * .228), S * (.66 + Math.sin(a) * .228), S * .012, 0, Math.PI * 2); c.fillStyle = SILVER(c, S, .3, .7); c.fill(); }   // tension lugs
    // the snare, in front
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .2, S * .5); c.lineTo(S * .2, S * .6); c.ellipse(S * .32, S * .6, S * .12, S * .035, 0, Math.PI, 0, true); c.lineTo(S * .44, S * .5); c.closePath(); }, SILVER(c, S, .2, .44), .008);
    shape(c, S, () => { c.beginPath(); c.ellipse(S * .32, S * .5, S * .12, S * .035, 0, 0, Math.PI * 2); }, '#f7f3ea', .008);
    // sticks, mid-hit
    line(c, S, [[.04, .2], [.3, .49]], '#e8c48c', .014); line(c, S, [[.62, .08], [.36, .48]], '#e8c48c', .014);
    shine(c, S, .82, .225, .07, .012, -.08, .6); sparkle(c, S, .64, .2, .035); sparkle(c, S, .96, .3, .025);
  },
  bass(c, S) {   // an upright bass: flamed wood, black fingerboard, strings, scroll
    const wood = lin(c, S * .28, 0, S * .72, 0, [[0, '#4a1f07'], [.25, '#a3541c'], [.45, '#e09447'], [.6, '#b8621f'], [1, '#3e1905']]);
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .5, S * .3);
      c.bezierCurveTo(S * .7, S * .3, S * .72, S * .45, S * .63, S * .52); c.bezierCurveTo(S * .8, S * .6, S * .8, S * .94, S * .5, S * .95);
      c.bezierCurveTo(S * .2, S * .94, S * .2, S * .6, S * .37, S * .52); c.bezierCurveTo(S * .28, S * .45, S * .3, S * .3, S * .5, S * .3); c.closePath(); }, wood);
    c.save(); c.beginPath(); c.moveTo(S * .5, S * .3); c.bezierCurveTo(S * .7, S * .3, S * .72, S * .45, S * .63, S * .52); c.bezierCurveTo(S * .8, S * .6, S * .8, S * .94, S * .5, S * .95); c.bezierCurveTo(S * .2, S * .94, S * .2, S * .6, S * .37, S * .52); c.bezierCurveTo(S * .28, S * .45, S * .3, S * .3, S * .5, S * .3); c.clip();
    c.strokeStyle = 'rgba(255,220,160,.18)'; c.lineWidth = S * .006; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(S * .2, S * (.35 + i * .07)); c.quadraticCurveTo(S * .5, S * (.32 + i * .07), S * .8, S * (.37 + i * .07)); c.stroke(); }   // flame in the wood
    c.restore();
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(S * (.5 + d * .1), S * .58); c.bezierCurveTo(S * (.5 + d * .14), S * .63, S * (.5 + d * .06), S * .7, S * (.5 + d * .1), S * .76); c.lineWidth = S * .012; c.strokeStyle = '#140802'; c.stroke();
      for (const y of [.58, .76]) { c.beginPath(); c.arc(S * (.5 + d * .1), S * y, S * .01, 0, Math.PI * 2); c.fillStyle = '#140802'; c.fill(); } }   // f-holes
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .45, S * .69); c.lineTo(S * .55, S * .69); c.lineTo(S * .54, S * .72); c.lineTo(S * .46, S * .72); c.closePath(); }, '#e9c98f', .006);   // bridge
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .47, S * .76); c.lineTo(S * .53, S * .76); c.lineTo(S * .55, S * .88); c.lineTo(S * .45, S * .88); c.closePath(); }, '#16100c', .006);   // tailpiece
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .475, S * .1); c.lineTo(S * .525, S * .1); c.lineTo(S * .535, S * .6); c.lineTo(S * .465, S * .6); c.closePath(); }, lin(c, S * .46, 0, S * .54, 0, [[0, '#050505'], [.5, '#3a3a40'], [1, '#050505']]), .008);   // fingerboard
    shape(c, S, () => { c.beginPath(); c.moveTo(S * .48, S * .03); c.bezierCurveTo(S * .56, S * .0, S * .58, S * .08, S * .53, S * .1); c.lineTo(S * .47, S * .1); c.bezierCurveTo(S * .44, S * .08, S * .44, S * .04, S * .48, S * .03); c.closePath(); }, wood, .008);   // scroll
    for (const [x, y, d] of [[.44, .06, -1], [.44, .085, -1], [.56, .06, 1], [.56, .085, 1]]) line(c, S, [[x, y], [x + d * .03, y]], '#e2c46a', .008, false);   // tuning pegs
    c.strokeStyle = '#efe2c4'; c.lineWidth = S * .0035; for (const d of [-.018, -.006, .006, .018]) { c.beginPath(); c.moveTo(S * (.5 + d * .7), S * .1); c.lineTo(S * (.5 + d), S * .76); c.stroke(); }
    line(c, S, [[.5, .95], [.5, .99]], '#c9ced4', .01);   // endpin
    shine(c, S, .4, .78, .03, .09, .2, .35); sparkle(c, S, .8, .3, .04); sparkle(c, S, .22, .5, .025);
  },
};
export const KINDS = Object.keys(DRAW);
export function drawThing(ctx, kind, S, fit = 0.84) { ctx.save(); ctx.translate(S / 2, S / 2); ctx.scale(fit, fit); ctx.translate(-S / 2, -S / 2); DRAW[kind](ctx, S); ctx.restore(); }   // fit: shrunk a little to sit inside its spotlight
export function thingCanvas(kind, S = 512) { const cv = document.createElement('canvas'); cv.width = cv.height = S; drawThing(cv.getContext('2d'), kind, S); return cv; }
// the spotlight each instrument sits on: a deep navy pool of light, a glowing double ring in its colour, little stars
export function badgeCanvas(color, S = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'), m = S / 2;
  const glow = c.createRadialGradient(m, m, S * .38, m, m, S * .5); glow.addColorStop(0, color); glow.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = .55; c.fillStyle = glow; c.beginPath(); c.arc(m, m, S * .5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  const pool = c.createRadialGradient(m, m * .8, S * .02, m, m, S * .42); pool.addColorStop(0, '#2a3a78'); pool.addColorStop(.6, '#101a42'); pool.addColorStop(1, '#070c24');
  c.fillStyle = pool; c.beginPath(); c.arc(m, m, S * .42, 0, Math.PI * 2); c.fill();
  c.lineWidth = S * .022; c.strokeStyle = color; c.beginPath(); c.arc(m, m, S * .42, 0, Math.PI * 2); c.stroke();
  c.lineWidth = S * .006; c.strokeStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(m, m, S * .385, 0, Math.PI * 2); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 14; i++) { const a = i * 2.4, r = S * (.12 + (i * 37 % 23) / 23 * .24); c.beginPath(); c.arc(m + Math.cos(a) * r, m + Math.sin(a) * r, S * (.003 + (i % 3) * .002), 0, Math.PI * 2); c.fill(); }
  return cv;
}
