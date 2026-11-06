// ROOTS OF KINSHIP: the drawn props for Family apples (apples, blossom, wicker basket, warm glow).
// Everything is drawn with canvas, so it looks the same on every phone. Warm, hand-painted look to suit the painting.

// a shiny apple. kind: 0 red, 1 deep red, 2 golden, 3 green. Centre (x, y), radius R.
export function drawApple(g, x, y, R, kind = 0, { halo = false } = {}) {
  const C = [
    ['#ff5a4a', '#e0261f', '#7c0b10'],
    ['#ff4a5c', '#c8142a', '#6a0814'],
    ['#ffe27a', '#f0a92a', '#9a5a12'],
    ['#c9ee6a', '#7cbc2e', '#356b14'],
  ][kind];
  g.save(); g.translate(x, y);
  if (halo) {   // a soft warm glow behind it, so it still reads through the vision filters
    const h = g.createRadialGradient(0, 0, R * 0.6, 0, 0, R * 1.9);
    h.addColorStop(0, 'rgba(255,248,220,.85)'); h.addColorStop(1, 'rgba(255,248,220,0)');
    g.fillStyle = h; g.beginPath(); g.arc(0, 0, R * 1.9, 0, Math.PI * 2); g.fill();
  }
  // shadow
  g.fillStyle = 'rgba(30,8,4,.35)'; g.beginPath(); g.ellipse(R * 0.1, R * 0.16, R * 1.0, R * 0.95, 0, 0, Math.PI * 2); g.fill();
  // body
  const path = () => {
    g.beginPath(); g.moveTo(0, -R * 0.6);
    g.bezierCurveTo(R * 0.55, -R * 1.08, R * 1.18, -R * 0.6, R * 1.0, R * 0.12);
    g.bezierCurveTo(R * 0.88, R * 0.86, R * 0.38, R * 1.08, 0, R * 0.9);
    g.bezierCurveTo(-R * 0.38, R * 1.08, -R * 0.88, R * 0.86, -R * 1.0, R * 0.12);
    g.bezierCurveTo(-R * 1.18, -R * 0.6, -R * 0.55, -R * 1.08, 0, -R * 0.6); g.closePath();
  };
  const gr = g.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.05, 0, R * 0.1, R * 1.15);
  gr.addColorStop(0, C[0]); gr.addColorStop(0.55, C[1]); gr.addColorStop(1, C[2]);
  path(); g.fillStyle = gr; g.fill();
  // little speckles and a blush stripe, like a real apple
  g.save(); path(); g.clip();
  g.globalAlpha = 0.18; g.strokeStyle = C[2]; g.lineWidth = R * 0.08; g.lineCap = 'round';
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * R * 0.32, -R * 0.4); g.quadraticCurveTo(i * R * 0.4, R * 0.2, i * R * 0.28, R * 0.85); g.stroke(); }
  g.globalAlpha = 0.35; g.fillStyle = '#fff6d0';
  for (let i = 0; i < 14; i++) { const a = i * 2.4, rr = R * (0.25 + (i % 5) * 0.14); g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.9 + R * 0.1, R * 0.025, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // dark outline so it pops off the busy painting
  path(); g.lineWidth = Math.max(1.5, R * 0.07); g.strokeStyle = 'rgba(35,6,4,.85)'; g.stroke();
  // the dimple and the shine
  g.fillStyle = 'rgba(40,8,4,.35)'; g.beginPath(); g.ellipse(0, -R * 0.55, R * 0.16, R * 0.07, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-R * 0.45, -R * 0.22, R * 0.14, R * 0.3, 0.45, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(-R * 0.22, -R * 0.5, R * 0.07, 0, Math.PI * 2); g.fill();
  // stem and leaf
  g.strokeStyle = '#4a2a12'; g.lineWidth = R * 0.13; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -R * 0.58); g.quadraticCurveTo(R * 0.04, -R * 0.95, R * 0.2, -R * 1.15); g.stroke();
  g.save(); g.translate(R * 0.2, -R * 0.98); g.rotate(-0.45);
  const lg = g.createLinearGradient(0, -R * 0.2, 0, R * 0.2); lg.addColorStop(0, '#7fd05a'); lg.addColorStop(1, '#2f7d2a');
  g.fillStyle = lg; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(R * 0.35, -R * 0.3, R * 0.75, 0); g.quadraticCurveTo(R * 0.35, R * 0.28, 0, 0); g.fill();
  g.strokeStyle = 'rgba(20,60,15,.8)'; g.lineWidth = R * 0.035; g.stroke();
  g.beginPath(); g.moveTo(R * 0.05, 0); g.lineTo(R * 0.65, 0); g.stroke();
  g.restore();
  g.restore();
}

// an apple blossom (the bud before the apple)
export function drawBlossom(g, x, y, R) {
  g.save(); g.translate(x, y);
  for (let i = 0; i < 5; i++) {
    g.save(); g.rotate((i / 5) * Math.PI * 2);
    const pg = g.createRadialGradient(0, -R * 0.5, R * 0.05, 0, -R * 0.45, R * 0.6);
    pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#ffb3cc');
    g.fillStyle = pg; g.beginPath(); g.ellipse(0, -R * 0.5, R * 0.34, R * 0.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(190,60,110,.55)'; g.lineWidth = R * 0.04; g.stroke();
    g.restore();
  }
  g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(0, 0, R * 0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c47a12'; for (let i = 0; i < 7; i++) { const a = i * 0.9; g.beginPath(); g.arc(Math.cos(a) * R * 0.12, Math.sin(a) * R * 0.12, R * 0.035, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// a woven wicker basket, seen from the front. Fits a W×H box with its rim at y = top + H*0.38.
export function drawBasket(g, W, H, { back = true, front = true } = {}) {
  const cx = W / 2, rimY = H * 0.4, rw = W * 0.46, bw = W * 0.34, bot = H * 0.94;
  const wick = (y) => { const gr = g.createLinearGradient(0, y, 0, bot); gr.addColorStop(0, '#e2a85c'); gr.addColorStop(1, '#8a5222'); return gr; };
  if (back) {
    // handle
    g.lineCap = 'round';
    g.strokeStyle = '#5a3212'; g.lineWidth = W * 0.07; g.beginPath(); g.ellipse(cx, rimY, rw * 0.82, H * 0.34, 0, Math.PI, 0); g.stroke();
    g.strokeStyle = '#d39a52'; g.lineWidth = W * 0.045; g.beginPath(); g.ellipse(cx, rimY, rw * 0.82, H * 0.34, 0, Math.PI, 0); g.stroke();
    g.strokeStyle = 'rgba(90,50,18,.7)'; g.lineWidth = W * 0.012;
    for (let i = 1; i < 12; i++) { const a = Math.PI + (i / 12) * Math.PI, x = cx + Math.cos(a) * rw * 0.82, y = rimY + Math.sin(a) * H * 0.34;
      g.beginPath(); g.moveTo(x - W * 0.018, y - W * 0.012); g.lineTo(x + W * 0.018, y + W * 0.012); g.stroke(); }
    // inside of the basket (dark)
    g.fillStyle = '#3d220c'; g.beginPath(); g.ellipse(cx, rimY, rw, H * 0.075, 0, 0, Math.PI * 2); g.fill();
  }
  if (front) {
    // body
    const body = () => { g.beginPath(); g.moveTo(cx - rw, rimY); g.lineTo(cx + rw, rimY); g.quadraticCurveTo(cx + bw * 1.05, bot, cx + bw, bot); g.lineTo(cx - bw, bot); g.quadraticCurveTo(cx - bw * 1.05, bot, cx - rw, rimY); g.closePath(); };
    body(); g.fillStyle = wick(rimY); g.fill();
    g.save(); body(); g.clip();
    // the weave: rows of little woven bumps, offset every row
    const rows = 6, rh = (bot - rimY) / rows;
    for (let r = 0; r < rows; r++) {
      const y = rimY + r * rh + rh / 2, n = 9;
      for (let i = -1; i <= n; i++) {
        const x = cx - rw + (i + (r % 2) * 0.5) * (rw * 2 / n);
        const bg = g.createLinearGradient(0, y - rh / 2, 0, y + rh / 2); bg.addColorStop(0, 'rgba(255,225,160,.55)'); bg.addColorStop(1, 'rgba(90,45,10,.45)');
        g.fillStyle = bg; g.beginPath(); g.ellipse(x, y, rw / n * 0.9, rh * 0.42, 0, 0, Math.PI * 2); g.fill();
      }
      g.strokeStyle = 'rgba(70,35,8,.55)'; g.lineWidth = W * 0.008; g.beginPath(); g.moveTo(cx - rw, y + rh / 2); g.lineTo(cx + rw, y + rh / 2); g.stroke();
    }
    // upright stakes
    g.strokeStyle = 'rgba(70,35,8,.4)'; g.lineWidth = W * 0.01;
    for (let i = 1; i < 9; i++) { const k = i / 9; g.beginPath(); g.moveTo(cx - rw + k * rw * 2, rimY); g.lineTo(cx - bw + k * bw * 2, bot); g.stroke(); }
    g.restore();
    body(); g.strokeStyle = '#4a2a0e'; g.lineWidth = W * 0.016; g.stroke();
    // rim: a thick braided band
    g.fillStyle = '#c98a44'; g.beginPath(); g.ellipse(cx, rimY + H * 0.02, rw * 1.03, H * 0.055, 0, 0, Math.PI); g.lineTo(cx - rw * 1.03, rimY + H * 0.02); g.fill();
    g.strokeStyle = '#4a2a0e'; g.lineWidth = W * 0.012; g.stroke();
    g.strokeStyle = 'rgba(255,220,150,.75)'; g.lineWidth = W * 0.01;
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI, x = cx + Math.cos(a) * rw, y = rimY + H * 0.02 + Math.sin(a) * H * 0.04;
      g.beginPath(); g.moveTo(x - W * 0.015, y - H * 0.02); g.lineTo(x + W * 0.015, y + H * 0.02); g.stroke(); }
  }
}

// a big soft warm glow (the tree lighting up as the family grows)
export function drawWarmGlow(g, W, H) {
  const r = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  r.addColorStop(0, 'rgba(255,236,170,.9)'); r.addColorStop(0.45, 'rgba(255,200,110,.45)'); r.addColorStop(1, 'rgba(255,170,80,0)');
  g.fillStyle = r; g.fillRect(0, 0, W, H);
}
