// 8 GATES — ARCADE · SLOTS: LUCKY GATES cabinet [arcadeSlots]. The 3D slot machine: three spinning drums behind a window,
// payline tabs + win lines, chase bulbs, a dot-matrix credit display, a button deck, a pull lever, a coin tray and a lit topper.
//   symbolStrip(THREE, reel)    → the drum texture for one reel (symbols drawn in code, toon + ink style)
//   buildSlotMachine(ctx, opts) → { machine, reels, setReel(i, angle), stopAngle(stop), bulbs, lines, lever, dmd, tray, … }
//   slotsProp(ctx, opts)        → the same machine idling in attract mode, for any world room (pair with slots-embed.js)
// ctx = { THREE, toon, M, grad?, touch? } — the same shape the 8 GATES world modules use.
import { canvasTex, FONT } from '../../engine/textures.js';
import { makeGradient, makeDMD, glowTex } from './pinball-machine.js';
import { STRIPS, STOPS } from './slots-rules.js';

export const REEL = { r: 0.38, w: 0.155, xs: [-0.17, 0, 0.17], y: 1.405, z: -0.11 };
const STEP = Math.PI * 2 / STOPS;
// angle (rotation.x) that puts `stop` in the middle row
export const stopAngle = stop => (((stop % STOPS) + STOPS) % STOPS + 0.5) * STEP;

// ---------------- symbols (space set: 8 crest · crescent moon · fox · rocket · star · satellite · full moon) ----------------
// Each is drawn at size S centred on (0,0): soft drop shadow, flat toon colour + gradient, 1 ink outline weight, a gloss highlight.
const INK = '#1a1626';
function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
export function drawSymbol(g, k, S) {
  const lw = S * 0.042; g.lineJoin = 'round'; g.lineCap = 'round';
  const stroke = (w = lw) => { g.strokeStyle = INK; g.lineWidth = w; g.stroke(); };
  const shadow = on => { if (on) { g.shadowColor = 'rgba(10,6,24,0.45)'; g.shadowBlur = S * 0.06; g.shadowOffsetY = S * 0.025; } else { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; } };
  const lin = (x0, y0, x1, y1, stops) => { const l = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => l.addColorStop(o, c)); return l; };
  const rad = (x, y, r0, r1, stops, x1 = x, y1 = y) => { const l = g.createRadialGradient(x, y, r0, x1, y1, r1); stops.forEach(([o, c]) => l.addColorStop(o, c)); return l; };
  const gloss = (x, y, rx, ry, a = 0.55, rot = -0.5) => { g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fill(); g.restore(); };
  const sparkle = (x, y, r, col = '#ffffff') => { g.save(); g.translate(x, y); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.22 : r, a = i * Math.PI / 4; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); };

  if (k === 'eight') {   // the 8 crest: gold bezel, deep blue enamel, white 8, star studs
    const R = S * 0.37;
    shadow(true); g.beginPath(); g.arc(0, 0, R, 0, 7); g.fillStyle = lin(0, -R, 0, R, [[0, '#fff1a8'], [0.45, '#ffd23a'], [1, '#c98a1c']]); g.fill(); shadow(false); stroke();
    g.beginPath(); g.arc(0, 0, R * 0.78, 0, 7); g.fillStyle = rad(-R * 0.25, -R * 0.3, R * 0.05, R * 0.95, [[0, '#3b6fe0'], [0.6, '#1e3a8a'], [1, '#0f1f52']]); g.fill(); stroke(lw * 0.8);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2; g.beginPath(); g.arc(Math.cos(a) * R * 0.89, Math.sin(a) * R * 0.89, R * 0.045, 0, 7); g.fillStyle = '#fff7d6'; g.fill(); }
    g.font = '900 ' + Math.round(S * 0.5) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = lw * 1.5; g.strokeStyle = INK; g.strokeText('8', 0, S * 0.035); g.fillStyle = lin(0, -R * 0.5, 0, R * 0.6, [[0, '#ffffff'], [1, '#cfe6ff']]); g.fillText('8', 0, S * 0.035);
    gloss(-R * 0.35, -R * 0.45, R * 0.32, R * 0.12, 0.35);
  }
  else if (k === 'crescent') {   // golden crescent moon (a real cut-out crescent), craters, rim light, two twinkling stars
    const R = S * 0.36, C = Math.ceil(S * 1.0), h = C / 2, ix = R * 0.5, iy = -R * 0.2, ir = R * 0.86;
    const layer = () => { const c = document.createElement('canvas'); c.width = c.height = C; const x = c.getContext('2d'); x.translate(h - S * 0.04, h); return [c, x]; };
    const cut = (x, rad) => { x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); x.arc(ix, iy, rad, 0, 7); x.fill(); x.globalCompositeOperation = 'source-over'; };
    const [inkC, ink] = layer(); ink.beginPath(); ink.arc(0, 0, R + lw / 2, 0, 7); ink.fillStyle = INK; ink.fill(); cut(ink, ir - lw / 2);
    const [goldC, gd] = layer(); gd.beginPath(); gd.arc(0, 0, R - lw / 2, 0, 7); const gr = gd.createLinearGradient(-R, -R, R * 0.4, R); gr.addColorStop(0, '#fff6c4'); gr.addColorStop(0.45, '#ffd23a'); gr.addColorStop(1, '#d48a14'); gd.fillStyle = gr; gd.fill();
    const rnd = seeded(5); for (let i = 0; i < 6; i++) { const a = Math.PI * (0.6 + rnd() * 0.8), d = R * (0.45 + rnd() * 0.35), cr = R * (0.06 + rnd() * 0.06), X = Math.cos(a) * d, Y = Math.sin(a) * d; gd.beginPath(); gd.arc(X, Y, cr, 0, 7); gd.fillStyle = 'rgba(190,120,20,0.55)'; gd.fill(); gd.beginPath(); gd.arc(X + cr * 0.22, Y + cr * 0.22, cr * 0.72, 0, 7); gd.fillStyle = 'rgba(255,230,140,0.75)'; gd.fill(); }
    gd.beginPath(); gd.arc(-R * 0.12, -R * 0.08, R * 0.82, Math.PI * 0.85, Math.PI * 1.35); gd.strokeStyle = 'rgba(255,255,255,0.8)'; gd.lineWidth = lw * 0.9; gd.lineCap = 'round'; gd.stroke();
    cut(gd, ir + lw / 2); ink.drawImage(goldC, -(h - S * 0.04), -h);
    g.beginPath(); g.arc(-S * 0.04 - R * 0.35, 0, R * 1.05, 0, 7); g.fillStyle = rad(-S * 0.04 - R * 0.35, 0, R * 0.3, R * 1.05, [[0, 'rgba(255,214,90,0.32)'], [1, 'rgba(255,214,90,0)']]); g.fill();
    shadow(true); g.drawImage(inkC, -h, -h); shadow(false);
    sparkle(S * 0.2, -S * 0.12, S * 0.11, '#fff7d6'); sparkle(S * 0.28, S * 0.17, S * 0.055, '#ffe08a'); sparkle(S * 0.06, S * 0.3, S * 0.035, '#ffffff');
  }
  else if (k === 'fox') {   // fox head: gradient fur, pink inner ears, white muzzle, shiny eyes
    const s = S * 0.36;
    const head = () => { g.beginPath(); g.moveTo(-s * 0.98, -s * 0.95); g.lineTo(-s * 0.36, -s * 0.38); g.quadraticCurveTo(0, -s * 0.5, s * 0.36, -s * 0.38); g.lineTo(s * 0.98, -s * 0.95); g.quadraticCurveTo(s * 1.02, -s * 0.3, s * 0.9, -s * 0.02); g.quadraticCurveTo(s * 0.5, s * 0.55, 0, s * 0.96); g.quadraticCurveTo(-s * 0.5, s * 0.55, -s * 0.9, -s * 0.02); g.quadraticCurveTo(-s * 1.02, -s * 0.3, -s * 0.98, -s * 0.95); g.closePath(); };
    shadow(true); head(); g.fillStyle = lin(0, -s, 0, s, [[0, '#ff9a3c'], [0.6, '#f2741f'], [1, '#c2410c']]); g.fill(); shadow(false); stroke();
    for (const x of [-1, 1]) { g.beginPath(); g.moveTo(x * s * 0.84, -s * 0.78); g.lineTo(x * s * 0.46, -s * 0.42); g.lineTo(x * s * 0.8, -s * 0.3); g.closePath(); g.fillStyle = '#f9a8c4'; g.fill(); }
    g.beginPath(); g.moveTo(-s * 0.7, s * 0.02); g.quadraticCurveTo(-s * 0.3, s * 0.12, -s * 0.12, s * 0.32); g.lineTo(0, s * 0.96); g.lineTo(s * 0.12, s * 0.32); g.quadraticCurveTo(s * 0.3, s * 0.12, s * 0.7, s * 0.02); g.quadraticCurveTo(s * 0.45, s * 0.6, 0, s * 0.96); g.quadraticCurveTo(-s * 0.45, s * 0.6, -s * 0.7, s * 0.02); g.closePath(); g.fillStyle = lin(0, 0, 0, s, [[0, '#ffffff'], [1, '#ffe7cf']]); g.fill(); stroke(lw * 0.8);
    for (const x of [-1, 1]) { g.beginPath(); g.ellipse(x * s * 0.38, -s * 0.1, s * 0.11, s * 0.15, x * 0.2, 0, 7); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(x * s * 0.35 - s * 0.03, -s * 0.16, s * 0.045, 0, 7); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(x * s * 0.42, -s * 0.03, s * 0.02, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(0, s * 0.8, s * 0.11, s * 0.08, 0, 0, 7); g.fillStyle = INK; g.fill(); gloss(-s * 0.03, s * 0.77, s * 0.04, s * 0.02, 0.6, 0);
    gloss(-s * 0.45, -s * 0.55, s * 0.22, s * 0.08, 0.3, -0.7);
  }
  else if (k === 'rocket') {   // retro rocket lifting off: metal body, red nose + fins, porthole, flame
    g.save(); g.rotate(0.62); g.translate(0, -S * 0.03); const s = S * 0.47;
    g.beginPath(); g.moveTo(-s * 0.2, s * 0.48); g.quadraticCurveTo(-s * 0.05, s * 1.15, 0, s * 1.2); g.quadraticCurveTo(s * 0.05, s * 1.15, s * 0.2, s * 0.48); g.closePath(); g.fillStyle = lin(0, s * 0.48, 0, s * 1.2, [[0, '#fff7c2'], [0.35, '#ffd23a'], [0.7, '#ff7a1a'], [1, 'rgba(236,48,19,0)']]); g.fill();
    g.beginPath(); g.moveTo(-s * 0.09, s * 0.48); g.quadraticCurveTo(0, s * 0.85, s * 0.09, s * 0.48); g.closePath(); g.fillStyle = '#ffffff'; g.fill();
    for (const x of [-1, 1]) { g.beginPath(); g.moveTo(x * s * 0.19, s * 0.02); g.quadraticCurveTo(x * s * 0.5, s * 0.25, x * s * 0.48, s * 0.56); g.lineTo(x * s * 0.2, s * 0.44); g.closePath(); g.fillStyle = lin(x * s * 0.2, 0, x * s * 0.5, s * 0.5, [[0, '#ff5a3c'], [1, '#a8230d']]); g.fill(); stroke(); }
    const body = () => { g.beginPath(); g.moveTo(0, -s * 0.98); g.bezierCurveTo(s * 0.36, -s * 0.62, s * 0.29, s * 0.2, s * 0.2, s * 0.5); g.lineTo(-s * 0.2, s * 0.5); g.bezierCurveTo(-s * 0.29, s * 0.2, -s * 0.36, -s * 0.62, 0, -s * 0.98); g.closePath(); };
    shadow(true); body(); g.fillStyle = lin(-s * 0.3, 0, s * 0.3, 0, [[0, '#9aa6b8'], [0.35, '#ffffff'], [0.7, '#e3e8f0'], [1, '#8a94a6']]); g.fill(); shadow(false);
    g.save(); body(); g.clip(); g.fillStyle = lin(-s * 0.3, 0, s * 0.3, 0, [[0, '#a8230d'], [0.35, '#ff5a3c'], [1, '#a8230d']]); g.fillRect(-s * 0.5, -s * 1.05, s, s * 0.52); g.fillRect(-s * 0.5, s * 0.3, s, s * 0.06); g.restore();
    body(); stroke(); g.beginPath(); g.moveTo(-s * 0.3, -s * 0.53); g.quadraticCurveTo(0, -s * 0.47, s * 0.3, -s * 0.53); stroke(lw * 0.7);
    g.beginPath(); g.arc(0, -s * 0.15, s * 0.16, 0, 7); g.fillStyle = '#dfe6ee'; g.fill(); stroke(lw * 0.8); g.beginPath(); g.arc(0, -s * 0.15, s * 0.11, 0, 7); g.fillStyle = rad(-s * 0.04, -s * 0.2, s * 0.01, s * 0.12, [[0, '#bff0ff'], [1, '#1e78c8']]); g.fill();
    gloss(-s * 0.04, -s * 0.2, s * 0.04, s * 0.025, 0.85, -0.6); gloss(-s * 0.13, -s * 0.2, s * 0.045, s * 0.3, 0.45, 0.12);
    g.restore(); sparkle(-S * 0.3, -S * 0.28, S * 0.05); sparkle(S * 0.32, S * 0.3, S * 0.035);
  }
  else if (k === 'star') {   // shooting-star blue, faceted
    const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? S * 0.16 : S * 0.38, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    shadow(true); g.beginPath(); pts.forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fillStyle = lin(0, -S * 0.38, 0, S * 0.35, [[0, '#bff0ff'], [0.5, '#38bdf8'], [1, '#1677c9']]); g.fill(); shadow(false);
    for (let i = 0; i < 10; i += 2) { g.beginPath(); g.moveTo(0, 0); g.lineTo(...pts[i]); g.lineTo(...pts[(i + 1) % 10]); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill(); }
    g.beginPath(); pts.forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); stroke();
    gloss(-S * 0.07, -S * 0.12, S * 0.06, S * 0.03, 0.85); sparkle(S * 0.3, -S * 0.3, S * 0.06);
  }
  else if (k === 'sat') {   // satellite: gold foil body, blue cell panels, dish + beacon
    g.save(); g.rotate(-0.35); g.translate(0, S * 0.03); const s = S * 0.4;
    for (const x of [-1, 1]) { g.fillStyle = '#9aa6b8'; g.fillRect(x > 0 ? s * 0.18 : -s * 0.32, -s * 0.035, s * 0.14, s * 0.07);
      const x0 = x > 0 ? s * 0.32 : -s * 0.98; shadow(true); g.beginPath(); g.rect(x0, -s * 0.27, s * 0.66, s * 0.54); g.fillStyle = lin(x0, -s * 0.27, x0 + s * 0.66, s * 0.27, [[0, '#4aa3ff'], [0.5, '#1e5fbf'], [1, '#123c80']]); g.fill(); shadow(false); stroke();
      g.strokeStyle = 'rgba(191,240,255,0.75)'; g.lineWidth = lw * 0.4; for (let c = 1; c < 3; c++) { g.beginPath(); g.moveTo(x0 + c * s * 0.22, -s * 0.24); g.lineTo(x0 + c * s * 0.22, s * 0.24); g.stroke(); } g.beginPath(); g.moveTo(x0 + s * 0.02, 0); g.lineTo(x0 + s * 0.64, 0); g.stroke();
      g.beginPath(); g.moveTo(x0 + s * 0.05, -s * 0.22); g.lineTo(x0 + s * 0.25, -s * 0.22); g.lineTo(x0 + s * 0.08, s * 0.05); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fill(); }
    shadow(true); g.beginPath(); g.rect(-s * 0.2, -s * 0.25, s * 0.4, s * 0.5); g.fillStyle = lin(-s * 0.2, -s * 0.25, s * 0.2, s * 0.25, [[0, '#fff1a8'], [0.4, '#e6b45a'], [0.75, '#b07a22'], [1, '#e6b45a']]); g.fill(); shadow(false); stroke();
    g.strokeStyle = 'rgba(122,74,10,0.6)'; g.lineWidth = lw * 0.35; for (const y of [-0.1, 0.06]) { g.beginPath(); g.moveTo(-s * 0.18, y * s); g.lineTo(s * 0.18, y * s + s * 0.03); g.stroke(); }
    g.beginPath(); g.moveTo(0, -s * 0.25); g.lineTo(0, -s * 0.42); g.strokeStyle = INK; g.lineWidth = lw * 0.8; g.stroke();
    g.beginPath(); g.ellipse(0, -s * 0.5, s * 0.22, s * 0.1, 0, Math.PI, 0); g.closePath(); g.fillStyle = lin(-s * 0.2, 0, s * 0.2, 0, [[0, '#cfd6e2'], [0.4, '#ffffff'], [1, '#9aa6b8']]); g.fill(); stroke();
    g.beginPath(); g.arc(0, -s * 0.66, s * 0.045, 0, 7); g.fillStyle = '#ec3013'; g.fill(); g.beginPath(); g.arc(0, -s * 0.66, s * 0.1, 0, 7); g.fillStyle = 'rgba(236,48,19,0.25)'; g.fill();
    g.restore();
  }
  else if (k === 'moon') {   // full moon: big soft halo, bright limb-darkened disc, clear maria, rayed crater, rim-lit craters, sparkle
    const R = S * 0.4;
    g.beginPath(); g.arc(0, 0, R * 1.5, 0, 7); g.fillStyle = rad(0, 0, R * 0.9, R * 1.5, [[0, 'rgba(235,244,255,0.75)'], [0.35, 'rgba(190,215,255,0.32)'], [1, 'rgba(160,190,255,0)']]); g.fill();
    shadow(true); g.beginPath(); g.arc(0, 0, R, 0, 7); g.fillStyle = rad(-R * 0.28, -R * 0.32, R * 0.05, R * 1.02, [[0, '#ffffff'], [0.45, '#fdfbf2'], [0.8, '#ece9dc'], [1, '#cfcfc6']]); g.fill(); shadow(false);
    g.save(); g.beginPath(); g.arc(0, 0, R, 0, 7); g.clip();
    const sea = (pts, a) => { g.beginPath(); pts.forEach(([x, y], i) => { const X = x * R, Y = y * R; if (!i) g.moveTo(X, Y); else { const [px, py] = pts[i - 1]; g.quadraticCurveTo((px * R + X) / 2 + (Y - py * R) * 0.25, (py * R + Y) / 2 - (X - px * R) * 0.25, X, Y); } }); g.closePath(); g.fillStyle = 'rgba(104,112,136,' + Math.min(0.85, a * 1.35) + ')'; g.fill(); };
    g.filter = 'blur(' + Math.max(0.6, S * 0.012) + 'px)';
    sea([[-0.62, -0.18], [-0.45, -0.52], [-0.12, -0.6], [0.05, -0.38], [-0.1, -0.12], [-0.38, 0.0]], 0.62);
    sea([[0.08, -0.5], [0.35, -0.62], [0.55, -0.38], [0.42, -0.12], [0.15, -0.18]], 0.55);
    sea([[0.2, -0.05], [0.52, 0.0], [0.6, 0.28], [0.35, 0.36], [0.12, 0.18]], 0.48);
    sea([[-0.48, 0.12], [-0.18, 0.08], [-0.1, 0.3], [-0.32, 0.42], [-0.55, 0.32]], 0.42);
    g.filter = 'none';
    const tx = -0.04 * R, ty = 0.58 * R; g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = Math.max(1, lw * 0.35); for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9 + 0.2, L = R * (0.22 + (i % 3) * 0.1); g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(a) * L, ty + Math.sin(a) * L); g.stroke(); }
    for (const [x, y, cr] of [[tx / R, ty / R, 0.08], [0.42, -0.45, 0.1], [0.62, 0.1, 0.09], [-0.62, -0.05, 0.08], [-0.25, -0.68, 0.07], [0.3, 0.55, 0.07]]) {
      const X = x * R, Y = y * R, r = cr * R; g.beginPath(); g.arc(X, Y, r, 0, 7); g.fillStyle = 'rgba(140,148,165,0.75)'; g.fill(); g.beginPath(); g.arc(X + r * 0.2, Y + r * 0.2, r * 0.75, 0, 7); g.fillStyle = '#f2f1ea'; g.fill();
      g.beginPath(); g.arc(X, Y, r, Math.PI * 0.05, Math.PI * 0.95); g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1, lw * 0.4); g.stroke(); }
    g.beginPath(); g.arc(0, 0, R, 0, 7); g.fillStyle = rad(R * 0.2, R * 0.25, R * 0.55, R * 1.02, [[0, 'rgba(70,80,120,0)'], [1, 'rgba(70,80,120,0.4)']]); g.fill();
    g.restore();
    g.beginPath(); g.arc(0, 0, R, 0, 7); stroke(); gloss(-R * 0.4, -R * 0.52, R * 0.26, R * 0.09, 0.55, -0.6);
    sparkle(R * 0.95, -R * 0.9, S * 0.06, '#ffffff');
  }
  else { const rnd = seeded(11); for (let i = 0; i < 7; i++) { g.beginPath(); g.arc((rnd() - 0.5) * S * 0.8, (rnd() - 0.5) * S * 0.8, S * (0.008 + rnd() * 0.012), 0, 7); g.fillStyle = 'rgba(255,255,255,' + (0.35 + rnd() * 0.5) + ')'; g.fill(); } sparkle(S * 0.12, -S * 0.08, S * 0.04, 'rgba(255,255,255,0.7)'); }
  shadow(false);
}
// night-sky cells: deep navy with a faint star field, a centre glow so each symbol pops, thin gold divider lines
// one cell on the drum is (2πr / stops) tall but REEL.w wide, so symbols are drawn narrower to come out round
const ASPECT = (2 * Math.PI * REEL.r / 22) / REEL.w;
export function symbolStrip(THREE, reel, touch) {
  const S = touch ? 144 : 176, W = S * STOPS;
  const t = canvasTex(W, S, (g) => {
    const rnd = seeded(3 + reel * 17);
    for (let k = 0; k < STOPS; k++) { const x0 = k * S;
      const bg = g.createRadialGradient(x0 + S / 2, S / 2, S * 0.05, x0 + S / 2, S / 2, S * 0.75); bg.addColorStop(0, '#3a3a8e'); bg.addColorStop(0.55, '#1c1b54'); bg.addColorStop(1, '#0d0c2c'); g.fillStyle = bg; g.fillRect(x0, 0, S, S);
      for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.2 + rnd() * 0.5) + ')'; g.beginPath(); g.arc(x0 + rnd() * S, rnd() * S, 0.6 + rnd() * 1.4, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(230,180,90,0.55)'; g.fillRect(x0, 0, 2, S);
      g.save(); g.translate(x0 + S / 2, S / 2); g.rotate(Math.PI / 2); g.scale(ASPECT, 1); drawSymbol(g, STRIPS[reel][k], S * 1.1); g.restore(); }
    g.fillStyle = 'rgba(230,180,90,0.7)'; g.fillRect(0, 0, W, 3); g.fillRect(0, S - 3, W, 3);
  });
  t.anisotropy = 8; return t;
}

// ---------------- cabinet ----------------
export function buildSlotMachine(ctx, opts = {}) {
  const { THREE, toon, M } = ctx, touch = ctx.touch ?? matchMedia('(pointer: coarse)').matches, grad = ctx.grad || makeGradient(THREE), glow = glowTex(THREE), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const machine = new THREE.Group(); machine.name = 'arcadeSlots'; machine.scale.setScalar(opts.scale ?? 1.35);
  const purple = toon('#2a1d5c'), deep = toon('#140f2e'), chrome = toon('#dfe6ee'), gold = toon('#e6b45a'), red = toon('#c42d3c'), black = toon('#0e0c16');
  const flat = (w, h, mat, x, y, z, parent = machine) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); parent.add(m); return m; };
  // pedestal + coin tray
  M(new THREE.BoxGeometry(0.66, 0.86, 0.5), purple, 0, 0.43, 0, machine, 0.012);
  M(new THREE.BoxGeometry(0.68, 0.04, 0.52), chrome, 0, 0.88, 0, machine, 0.006);
  const tray = new THREE.Group(); tray.position.set(0, 0.55, 0.25); machine.add(tray);
  M(new THREE.BoxGeometry(0.42, 0.14, 0.1), black, 0, 0, 0.04, tray, 0.008); M(new THREE.BoxGeometry(0.44, 0.02, 0.12), chrome, 0, -0.07, 0.05, tray, 0.004); M(new THREE.BoxGeometry(0.44, 0.03, 0.02), chrome, 0, -0.045, 0.105, tray, 0.004);
  const coinGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.006, 14), coinMat = toon('#ffcf3a'), coins = [];
  for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(coinGeo, coinMat); c.position.set(-0.16 + (i % 6) * 0.064 + (Math.floor(i / 6) % 2) * 0.03, -0.05 + Math.floor(i / 6) * 0.007, 0.06 + ((i * 7) % 3) * 0.012); c.rotation.set(0.15 * ((i % 3) - 1), i, 0.12 * ((i % 4) - 1.5)); c.visible = false; tray.add(c); coins.push(c); }
  const pedTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#2a1d5c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { g.fillStyle = ['#ec3013', '#ffd23a', '#38bdf8'][i % 3]; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(0, h * 0.55 + i * 14); g.lineTo(w, h * 0.25 + i * 14); g.lineTo(w, h * 0.25 + i * 14 + 6); g.lineTo(0, h * 0.55 + i * 14 + 6); g.fill(); } g.globalAlpha = 1; g.fillStyle = '#ffd23a'; g.font = '900 30px ' + FONT; g.textAlign = 'center'; g.fillText('PAYS GOLD', w / 2, h - 26); });
  flat(0.58, 0.32, new THREE.MeshToonMaterial({ map: pedTex, gradientMap: grad }), 0, 0.24, 0.252);
  // body shell around the reel window (front frame built from 4 pieces so the drums show through)
  const bz = 0.27, wy = REEL.y, ww = 0.52, wh = 0.34, BT = 1.82;   // BT = top of the body (display window sits between the reels and BT)
  M(new THREE.BoxGeometry(0.72, BT - 0.88, 0.04), deep, 0, (BT + 0.88) / 2, -0.51, machine, 0.01);
  for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.04, BT - 0.88, 0.8), purple, s * 0.34, (BT + 0.88) / 2, -0.12, machine, 0.01);
  M(new THREE.BoxGeometry(0.72, 0.04, 0.8), purple, 0, BT, -0.12, machine, 0.01);
  const frame = toon('#3a2a7a');
  M(new THREE.BoxGeometry(0.72, BT - (wy + wh / 2), 0.04), frame, 0, (BT + wy + wh / 2) / 2, bz, machine, 0.008);
  M(new THREE.BoxGeometry(0.72, (wy - wh / 2) - 0.88, 0.04), frame, 0, (wy - wh / 2 + 0.88) / 2, bz, machine, 0.008);
  for (const s of [-1, 1]) M(new THREE.BoxGeometry((0.72 - ww) / 2, wh, 0.04), frame, s * (ww / 2 + (0.72 - ww) / 4), wy, bz, machine, 0.008);
  // window trim (gold) + dark cavity
  const trimW = 0.012; for (const [w, h, x, y] of [[ww + 0.03, trimW, 0, wy + wh / 2 + trimW / 2], [ww + 0.03, trimW, 0, wy - wh / 2 - trimW / 2], [trimW, wh, -ww / 2 - trimW / 2, wy], [trimW, wh, ww / 2 + trimW / 2, wy]]) M(new THREE.BoxGeometry(w, h, 0.05), gold, x, y, bz + 0.005, machine, 0);
  flat(ww, wh + 0.2, new THREE.MeshBasicMaterial({ color: '#0a0716' }), 0, wy, -0.49);
  // drums
  const reelGeo = new THREE.CylinderGeometry(REEL.r, REEL.r, REEL.w, 48, 1, true); reelGeo.rotateZ(Math.PI / 2);
  const capGeo = new THREE.CircleGeometry(REEL.r, 32);
  const reels = REEL.xs.map((x, i) => { const g = new THREE.Group(); g.position.set(x, wy, REEL.z); machine.add(g);
    const m = new THREE.Mesh(reelGeo, new THREE.MeshBasicMaterial({ map: symbolStrip(THREE, i, touch) })); g.add(m);
    for (const s of [-1, 1]) { const cap = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ color: '#1a1430' })); cap.rotation.y = s * Math.PI / 2; cap.position.x = s * REEL.w / 2; g.add(cap); }
    g.rotation.x = stopAngle(0); return g; });
  // curvature shading + glass over the window
  const shade = canvasTex(8, 128, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, 'rgba(10,6,24,0.92)'); l.addColorStop(0.2, 'rgba(10,6,24,0.25)'); l.addColorStop(0.5, 'rgba(10,6,24,0)'); l.addColorStop(0.8, 'rgba(10,6,24,0.25)'); l.addColorStop(1, 'rgba(10,6,24,0.92)'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  flat(ww, wh, new THREE.MeshBasicMaterial({ map: shade, transparent: true, depthWrite: false }), 0, wy, bz - 0.012);
  for (const x of [-0.085, 0.085]) flat(0.008, wh, new THREE.MeshBasicMaterial({ color: '#0a0716' }), x, wy, bz - 0.011);
  const sheen = canvasTex(64, 64, (g, w, h) => { const l = g.createLinearGradient(0, 0, w, h); l.addColorStop(0.3, 'rgba(255,255,255,0)'); l.addColorStop(0.42, 'rgba(255,255,255,0.8)'); l.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  flat(ww, wh, new THREE.MeshBasicMaterial({ map: sheen, transparent: true, opacity: 0.12, depthWrite: false }), 0, wy, bz - 0.008);
  // paylines: tabs (left + right) and the lit win line across the window
  const LCOL = ['#ec3013', '#ffd23a', '#38bdf8'], rowY = r => wy + (1 - r) * (wh / 3), LROW = [1, 0, 2];
  const lines = [0, 1, 2].map(i => { const row = LROW[i], y = rowY(row), col = new THREE.Color(LCOL[i]);
    const tabTex = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1626'; g.font = '900 44px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), w / 2, h / 2 + 3); });
    const tabs = [-1, 1].map(s => { const t = flat(0.045, 0.05, new THREE.MeshBasicMaterial({ map: tabTex, color: col.clone().multiplyScalar(0.35) }), s * (ww / 2 + 0.045), y, bz + 0.022); return t; });
    const line = flat(ww - 0.01, 0.008, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false }), 0, y, bz - 0.004); line.visible = false;
    const lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); lg.scale.set(ww * 1.2, 0.06, 1); lg.position.set(0, y, bz); lg.visible = false; machine.add(lg);
    return { tabs, line, glow: lg, col, on: false, win: false }; });
  // chase bulbs around the window
  // each bulb: chrome socket, a glass bulb whose colour fades between off and its lit colour, and a soft additive halo
  const bulbGeo = new THREE.SphereGeometry(0.0115, 10, 8), sockGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.006, 14); sockGeo.rotateX(Math.PI / 2);
  const sockMat = toon('#c9d3e3'), OFF = new THREE.Color('#4a3a1a'), WARM = new THREE.Color('#fff1c2'), bulbs = [];
  function makeBulb(x, y, z, sc = 1) { const mat = new THREE.MeshBasicMaterial({ color: OFF.clone() }), m = new THREE.Mesh(bulbGeo, mat); m.position.set(x, y, z); m.scale.setScalar(sc); machine.add(m);
    const so = new THREE.Mesh(sockGeo, sockMat); so.position.set(x, y, z - 0.008); so.scale.setScalar(sc); machine.add(so);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: WARM.clone(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(0.07 * sc); halo.position.set(x, y, z + 0.004); machine.add(halo);
    return { m, mat, halo, lvl: 0, col: WARM.clone() }; }
  const bw = ww + 0.13, bh = wh + 0.09, per = 2 * (bw + bh), NB = 28;
  for (let i = 0; i < NB; i++) { let d = i / NB * per, x, y; if (d < bw) { x = -bw / 2 + d; y = bh / 2; } else if ((d -= bw) < bh) { x = bw / 2; y = bh / 2 - d; } else if ((d -= bh) < bw) { x = bw / 2 - d; y = -bh / 2; } else { d -= bw; x = -bw / 2; y = -bh / 2 + d; }
    bulbs.push(makeBulb(x, wy + y, bz + 0.026)); }
  // dot-matrix credit display above the window
  // the message display: its own recessed window with a chrome bezel, above the chase bulbs
  const DY = 1.738, dmd = makeDMD(THREE, { on: '#6fcaff', mid: '#174260', off: '#081720', bg: '#03080d', glow: 7 });   // baby-blue dot matrix
  M(new THREE.BoxGeometry(0.53, 0.16, 0.02), chrome, 0, DY, bz + 0.012, machine, 0.004);
  M(new THREE.BoxGeometry(0.5, 0.13, 0.02), black, 0, DY, bz + 0.016, machine, 0);
  const dmdMat = new THREE.MeshBasicMaterial({ map: dmd.tex }); flat(0.47, 0.1175, dmdMat, 0, DY, bz + 0.027);
  const dmdGlass = canvasTex(64, 32, (g, w, h) => { const l = g.createLinearGradient(0, 0, w, h); l.addColorStop(0, 'rgba(255,255,255,0.08)'); l.addColorStop(0.35, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  flat(0.47, 0.1175, new THREE.MeshBasicMaterial({ map: dmdGlass, transparent: true, depthWrite: false }), 0, DY, bz + 0.029);
  // button deck
  const deck = new THREE.Group(); deck.position.set(0, 1.095, 0.31); deck.rotation.x = 0.35; machine.add(deck);
  M(new THREE.BoxGeometry(0.7, 0.04, 0.16), toon('#1b1733'), 0, 0, 0, deck, 0.006);
  const btnMats = {}, mkBtn = (k, x, col, r = 0.028) => { const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(0.55) }); btnMats[k] = { mat, col: new THREE.Color(col) }; M(new THREE.CylinderGeometry(r + 0.008, r + 0.008, 0.012, 18), chrome, x, 0.024, 0.01, deck, 0); const b = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.022, 18), mat); b.position.set(x, 0.034, 0.01); deck.add(b); return b; };
  const buttons = { lines: mkBtn('lines', -0.22, '#38bdf8'), bet: mkBtn('bet', -0.1, '#ffd23a'), max: mkBtn('max', 0.02, '#a78bfa'), spin: mkBtn('spin', 0.2, '#ec3013', 0.045) };
  // belly glass between deck and pedestal
  // lever on the right side
  const lever = new THREE.Group(); lever.position.set(0.37, 1.3, 0.02); machine.add(lever);
  M(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16), chrome, 0.02, 0, 0, lever, 0.006).rotation.z = Math.PI / 2;
  const arm = new THREE.Group(); arm.position.x = 0.05; lever.add(arm);
  M(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 10), chrome, 0, 0.21, 0, arm, 0.004); M(new THREE.SphereGeometry(0.045, 16, 12), red, 0, 0.44, 0, arm, 0.008, 0.045);
  arm.rotation.x = -0.25;
  // topper sign + bulbs
  // payout sign (the paytable at a glance)
  const PAYS = [['eight', '250'], ['crescent', '100'], ['fox', '60'], ['rocket', '30'], ['star', '20'], ['sat', '15'], ['moon', '12'], ['moon', '2 · 5']];
  const payTex = canvasTex(840, 220, (g, w, h) => {
    const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#24205e'); l.addColorStop(1, '#0d0c2c'); g.fillStyle = l; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, 26); g.fillStyle = '#1a1626'; g.font = '900 19px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PAYS × YOUR BET A LINE · THREE IN A ROW', w / 2, 14);
    const cw = w / 4, ch = (h - 30) / 2;
    PAYS.forEach(([k, v], n) => { const cx = (n % 4) * cw, cy = 30 + Math.floor(n / 4) * ch;
      g.strokeStyle = 'rgba(230,180,90,0.45)'; g.lineWidth = 2; g.strokeRect(cx + 4, cy + 4, cw - 8, ch - 8);
      g.save(); g.translate(cx + 52, cy + ch / 2); drawSymbol(g, k, 84); g.restore();
      g.textAlign = 'left'; g.fillStyle = '#cfcac4'; g.font = '800 16px ' + FONT; g.fillText(n === 7 ? '1 · 2 MOONS' : '× 3', cx + 100, cy + ch / 2 - 18);
      g.fillStyle = n === 0 ? '#ffd23a' : '#ffffff'; g.font = '900 ' + (n === 7 ? 30 : 38) + 'px ' + FONT; g.fillText(v, cx + 100, cy + ch / 2 + 14); });
    g.strokeStyle = '#ffd23a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); });
  // it sits on the belly: under the round buttons, above the pedestal
  const PY = 0.955; M(new THREE.BoxGeometry(0.66, 0.175, 0.02), toon('#e6b45a'), 0, PY, bz + 0.018, machine, 0.004);
  flat(0.63, 0.1645, new THREE.MeshBasicMaterial({ map: payTex }), 0, PY, bz + 0.03);
  const signGlass = canvasTex(64, 32, (g, w, h) => { const l = g.createLinearGradient(0, 0, w, h); l.addColorStop(0.2, 'rgba(255,255,255,0)'); l.addColorStop(0.32, 'rgba(255,255,255,0.22)'); l.addColorStop(0.4, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  flat(0.63, 0.1645, new THREE.MeshBasicMaterial({ map: signGlass, transparent: true, depthWrite: false }), 0, PY, bz + 0.032);
  // the LUCKY GATES banner, slimmer, on the very top
  // LUCKY GATES banner = the machine's info panel: title + CREDITS · BET · WIN · JACKPOT, redrawn when a value changes
  const TY = BT + 0.095, BH = 0.155;
  const banTex = canvasTex(1024, 200, () => {}), banCv = banTex.image, bg2 = banCv.getContext('2d'); let banKey = '';
  function drawBanner(v = {}) {
    const key = JSON.stringify(v); if (key === banKey) return; banKey = key; const g = bg2, w = banCv.width, h = banCv.height;
    const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#ec3013'); l.addColorStop(1, '#7a1205'); g.fillStyle = l; g.fillRect(0, 0, w, h);
    g.textBaseline = 'middle'; g.textAlign = 'center'; g.lineJoin = 'round';
    // title block
    g.font = '900 64px ' + FONT; g.lineWidth = 9; g.strokeStyle = '#1a1626'; g.strokeText('LUCKY', 150, 66); g.fillStyle = '#ffd23a'; g.fillText('LUCKY', 150, 66);
    g.strokeText('GATES', 150, 136); g.fillStyle = '#ffffff'; g.fillText('GATES', 150, 136);
    // four readouts
    const cells = [[v.creditLbl || 'CREDITS', v.credits ?? '—', '#ffd23a'], ['BET', v.bet ?? '—', '#ffffff'], ['WIN', v.win ?? '—', v.winHot ? '#7dff9a' : '#ffffff'], [v.potLbl || 'JACKPOT', v.pot ?? '—', '#ffd23a']];
    const x0 = 300, cw = (w - x0 - 16) / 4;
    cells.forEach(([lab, val, col], k) => { const x = x0 + k * cw;
      g.fillStyle = '#0b0918'; g.fillRect(x + 6, 18, cw - 12, h - 36); g.strokeStyle = '#ffd23a'; g.lineWidth = 3; g.strokeRect(x + 6, 18, cw - 12, h - 36);
      g.fillStyle = '#7fd0ff'; g.font = '800 24px ' + FONT; g.fillText(lab, x + cw / 2, 46);
      let fs = 60; g.font = '900 ' + fs + 'px ' + FONT; while (g.measureText(String(val)).width > cw - 30 && fs > 26) { fs -= 4; g.font = '900 ' + fs + 'px ' + FONT; }
      g.shadowColor = col; g.shadowBlur = 12; g.fillStyle = col; g.fillText(String(val), x + cw / 2, 118); g.shadowBlur = 0; });
    g.strokeStyle = '#ffd23a'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
    banTex.needsUpdate = true;
  }
  drawBanner();
  M(new THREE.BoxGeometry(0.74, BH + 0.015, 0.5), deep, 0, TY, -0.01, machine, 0.01);
  flat(0.71, BH, new THREE.MeshBasicMaterial({ map: banTex }), 0, TY, 0.242);
  const topBulbs = []; for (let i = 0; i < 12; i++) topBulbs.push(makeBulb(-0.33 + i * 0.06, TY + BH / 2 + 0.012, 0.2, 1.35));
  const topGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ff6a3d', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); topGlow.scale.set(1.1, 0.45, 1); topGlow.position.set(0, TY, 0.3); machine.add(topGlow);
  // side art
  const sideTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#2a1d5c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = ['#ec3013', '#ffd23a', '#38bdf8', '#ffd23a', '#ec3013'][i]; g.fillRect(0, 40 + i * 30, w, 12); } g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(w / 2, h - 50, 30, 0, 7); g.fill(); g.fillStyle = '#1e3a8a'; g.beginPath(); g.arc(w / 2, h - 50, 22, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '900 34px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', w / 2, h - 48); });
  for (const s of [-1, 1]) { const sp = flat(0.72, 0.9, new THREE.MeshToonMaterial({ map: sideTex, gradientMap: grad }), s * 0.361, (BT + 0.88) / 2, -0.12); sp.rotation.y = s * Math.PI / 2; }

  // ---- helpers for the game + the prop ----
  let chaseT = 0;
  function setLines(n, winRows = []) { lines.forEach((L, i) => { L.on = i < n; L.tabs.forEach(t => t.material.color.copy(L.on ? L.col : L.col.clone().multiplyScalar(0.3))); }); }
  function showWins(ids, blink) { lines.forEach((L, i) => { const on = ids.includes(i + 1) && blink; L.line.visible = on; L.glow.visible = on; }); }
  // light shows. mode: 'idle' (slow comet), 'spin' (two fast comets), 'tease' (gold pulse), 'win' (alternating flash in the win colour),
  // 'big' (fast flash + sweep), 'jackpot' (rainbow wave). col = the winning line's colour.
  const tmpC = new THREE.Color(), RAINBOW = ['#ec3013', '#ff8a1a', '#ffd23a', '#22c55e', '#38bdf8', '#a78bfa', '#f472b6'].map(c => new THREE.Color(c));
  function setBulb(b, lvl, col, dt) { b.lvl += (lvl - b.lvl) * Math.min(1, dt * 22); b.col.lerp(col, Math.min(1, dt * 10)); b.mat.color.copy(OFF).lerp(b.col, b.lvl); b.halo.material.color.copy(b.col); b.halo.material.opacity = b.lvl * 0.85; b.halo.visible = b.lvl > 0.03; }
  function chase(dt, mode = 'idle', col) {
    chaseT += dt; const n = bulbs.length, t = chaseT, winCol = col ? tmpC.set(col) : WARM;
    bulbs.forEach((b, i) => { let lvl = 0, c = WARM;
      if (mode === 'idle') { const head = (t * 7) % n, d = (head - i + n) % n; lvl = d < 6 ? 1 - d / 6 : 0.08; }
      else if (mode === 'spin') { const head = (t * 26) % n; for (const off of [0, n / 2]) { const d = (head + off - i + n * 2) % n; lvl = Math.max(lvl, d < 4 ? 1 - d / 4 : 0); } lvl = Math.max(lvl, 0.12); }
      else if (mode === 'tease') { lvl = 0.45 + 0.55 * Math.max(0, Math.sin(t * 10 - i * 0.4)); c = RAINBOW[2]; }
      else if (mode === 'win') { lvl = (Math.floor(t * 7) + i) % 2 ? 1 : 0.15; c = winCol; }
      else if (mode === 'big') { lvl = (Math.floor(t * 12) + (i >> 1)) % 2 ? 1 : 0.2; c = (Math.floor(t * 3) % 2) ? winCol : WARM; }
      else if (mode === 'jackpot') { lvl = 0.6 + 0.4 * Math.sin(t * 14 + i * 0.7); c = RAINBOW[Math.floor(i / 2 + t * 10) % RAINBOW.length]; }
      setBulb(b, lvl, c, dt); });
    topBulbs.forEach((b, i) => { const hot = mode === 'win' || mode === 'big' || mode === 'jackpot';
      setBulb(b, hot ? ((Math.floor(t * 8) + i) % 2 ? 1 : 0.2) : mode === 'spin' ? ((Math.floor(t * 12) + i) % 3 === 0 ? 1 : 0.2) : 0.35 + 0.65 * Math.max(0, Math.sin(t * 3 - i * 0.6)), mode === 'jackpot' ? RAINBOW[(i + Math.floor(t * 8)) % RAINBOW.length] : hot ? winCol : WARM, dt); });
    topGlow.material.opacity = 0.26 + (mode === 'win' || mode === 'big' || mode === 'jackpot' ? 0.25 * (Math.floor(t * 8) % 2) : 0.06 * Math.sin(t * 3)); }
  // ---- inside the reels: per-cell glow, frame and dimming for wins (and a gold pulse on reel 3 during a near miss) ----
  const cellGlowTex = canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,0.95)'); r.addColorStop(0.45, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const cellFrameTex = canvasTex(128, 96, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 7; g.shadowColor = 'rgba(255,255,255,0.9)'; g.shadowBlur = 10; g.beginPath(); g.roundRect ? g.roundRect(8, 8, w - 16, h - 16, 12) : g.rect(8, 8, w - 16, h - 16); g.stroke(); });
  const cw = REEL.w * 1.06, chh = wh / 3 * 1.04, cells = [0, 1, 2].map(row => REEL.xs.map(x => { const y = rowY(row), z = bz + 0.006;
    const mk = (tex, blend, op) => { const m = flat(cw, chh, new THREE.MeshBasicMaterial({ map: tex, color: '#ffffff', transparent: true, opacity: op, depthWrite: false, blending: blend }), x, y, z); m.renderOrder = 6; m.visible = false; return m; };
    const dim = flat(cw, chh, new THREE.MeshBasicMaterial({ color: '#05030c', transparent: true, opacity: 0.55, depthWrite: false }), x, y, z - 0.001); dim.renderOrder = 5; dim.visible = false;
    return { glow: mk(cellGlowTex, THREE.AdditiveBlending, 0), frame: mk(cellFrameTex, THREE.AdditiveBlending, 0), dim, x, y }; }));
  // spark bursts that fly out of winning symbols
  const sparkTex = glow, sparks = []; for (let i = 0; i < 40; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.visible = false; sp.renderOrder = 7; machine.add(sp); sparks.push({ sp, life: 0, vx: 0, vy: 0 }); }
  let spI = 0; function burst(x, y, col, n = 8) { for (let i = 0; i < n; i++) { const p = sparks[spI = (spI + 1) % sparks.length], a = Math.random() * 6.28, v = 0.15 + Math.random() * 0.25; p.sp.position.set(x, y, bz + 0.03); p.sp.material.color.set(col); p.life = 1; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v + 0.08; p.sp.visible = true; } }
  // cellFx(list of { reel, row, col }, t, mode): mode 'win' | 'tease' | null
  function cellFx(list, t, mode, dt = 0.016) {
    const hit = new Map(list.map(c => [c.reel + ':' + c.row, c]));
    cells.forEach((rowCells, row) => rowCells.forEach((cell, reel) => { const c = hit.get(reel + ':' + row);
      if (!mode) { cell.glow.visible = cell.frame.visible = cell.dim.visible = false; return; }
      if (mode === 'tease') { const on = reel === 2; cell.dim.visible = false; cell.frame.visible = false; cell.glow.visible = on; if (on) { cell.glow.material.color.set('#ffd23a'); cell.glow.material.opacity = 0.25 + 0.25 * Math.sin(t * 12); } return; }
      cell.dim.visible = !c; if (!c) return;
      const pulse = 0.5 + 0.5 * Math.sin(t * 11 + reel * 0.9), flash = Math.floor(t * 6) % 2;
      cell.glow.visible = true; cell.glow.material.color.set(c.col); cell.glow.material.opacity = 0.18 + 0.32 * pulse;
      cell.frame.visible = true; cell.frame.material.color.set(flash ? '#ffffff' : c.col); cell.frame.material.opacity = 0.42 + 0.22 * pulse; }));
    for (const p of sparks) if (p.life > 0) { p.life -= dt * 1.6; p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.vy -= 0.35 * dt; p.sp.scale.setScalar(0.035 * p.life + 0.008); p.sp.material.opacity = p.life; if (p.life <= 0) p.sp.visible = false; }
  }
  const cellPos = (reel, row) => ({ x: cells[row][reel].x, y: cells[row][reel].y });
  function button(k, lit) { const b = btnMats[k]; if (b) b.mat.color.copy(lit ? b.col : b.col.clone().multiplyScalar(0.45)); }
  function press(k) { const b = buttons[k]; if (b) { b.position.y = 0.026; setTimeout(() => { b.position.y = 0.034; }, 120); } }
  function setCoins(n) { coins.forEach((c, i) => c.visible = i < n); }
  return { machine, reels, lines, bulbs, dmdMat, drawBanner, lever, arm, dmd, buttons, setLines, showWins, chase, cellFx, burst, cellPos, button, press, setCoins, windowCenter: V3(0, wy, bz), windowSize: [ww, wh], LCOL };
}

// ---------------- a world prop ----------------
// const sp = slotsProp(ctx, { x, z, rotY, scale: 1.35 }); room.add(sp.group); each frame sp.update(dt); sp.standAt = where to stand to play.
export function slotsProp(ctx, { x = 0, y = 0, z = 0, rotY = 0, scale = 1.35, pot = 250 } = {}) {
  const { THREE } = ctx, S0 = buildSlotMachine(ctx, { scale }), group = new THREE.Group(); group.add(S0.machine); group.position.set(x, y, z); group.rotation.y = rotY;
  const standAt = new THREE.Vector3(0, 0, 1.1 * scale / 1.35).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(group.position);
  let t = 0; S0.setLines(3); S0.reels.forEach((r, i) => r.rotation.x = (i * 7 + 3) * Math.PI * 2 / 22 + Math.PI / 22);
  return { group, standAt, machine: S0, setPot(v) { pot = v; },
    update(dt) { t += dt; S0.chase(dt, 'idle'); S0.dmd.draw(Math.floor(t / 3) % 2 ? ['JACKPOT', String(Math.round(pot))] : ['LUCKY GATES']); S0.drawBanner({ credits: 'PLAY', bet: '1–15', win: '—', pot: Math.round(pot).toLocaleString('en-US') }); } };
}
