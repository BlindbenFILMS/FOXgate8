// PAINTING TRACKER, from Art Alive (ArtAliveStudio games/index.html, AACapture.tracker), for the Blind Canvas AR viewer.
// MindAR recognises WHICH painting is in view and roughly where. This follows it from one camera frame to the next:
// it picks up to 70 sharp little details on and around the painting and tracks each one with pyramidal Lucas-Kanade
// optical flow (checked forwards and backwards), fits the painting's four corners to the points that agree (RANSAC,
// then least squares), and smooths the corners with a one-euro filter. So the art stays glued to the painting while you
// move, and holds through the moments MindAR loses it (a fast move, a hand, glare, getting close).
//   const t = tracker({ detect: (src, sw, sh) => ({ c: [[x,y] ×4] } | null) });   corners 0..1 of the camera picture,
//                                                                                     top-left, top-right, bottom-right, bottom-left
//   t.update(video, videoWidth, videoHeight) → { c, mode: 'find' | 'track' | 'hold', points } | null
// detect is asked every few frames (and every frame when lost) to correct drift: here it hands back MindAR's latest view.
// Options: agree (how close, as a share of the picture width, detect must be to count as agreeing: .02), snapAfter (how many
// disagreements in a row before it jumps to detect's answer: 2), width (camera picture width it works at: 320, 240 on slow phones).
export function quadArea(P) { let s = 0; for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; }
export function convex(P) { let sg = 0; for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4], c = P[(i + 2) % 4], z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (Math.abs(z) < 1e-6) return false; const s = Math.sign(z); if (sg && s !== sg) return false; sg = s; } return true; }
export function inQuad(P, x, y) { let sg = 0; for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4], z = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); const s = Math.sign(z); if (!s) continue; if (sg && s !== sg) return false; sg = s; } return true; }
export function homography(src, dst) { // solves the 3×3 map taking 4 src points to 4 dst points (row-major, last = 1)
  const A = [], b = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  for (let c = 0; c < 8; c++) { let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } }
  return b.map((v, i) => v / A[i][i]).concat([1]);
}

export function tracker(opts) {
  opts = opts || {};
  let TW = opts.width || 320; const findRect = opts.detect; let cost = 0;
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  let disagree = 0, w = 0, h = 0, prevPyr = null, pts = [], quad = null, sm = null, lastT = 0, frame = 0, lostFor = 0, lastDetectF = -99, mode = 'none';
  const LEVELS = 3, WIN = 4, ITERS = 10;
  function gray(src, sw, sh) {
    if (!sw || !sh) return null;
    const H = Math.round(TW * sh / sw);
    if (cv.width !== TW || cv.height !== H) { cv.width = TW; cv.height = H; }
    w = TW; h = H; cx.drawImage(src, 0, 0, w, h);
    const d = cx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
    for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = d[j] * .299 + d[j + 1] * .587 + d[j + 2] * .114;
    return g;
  }
  function pyramid(g) {
    const L = [{ g, w, h }];
    for (let l = 1; l < LEVELS; l++) {
      const p = L[l - 1], nw = p.w >> 1, nh = p.h >> 1, o = new Float32Array(nw * nh);
      for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) { const i = (y * 2) * p.w + x * 2; o[y * nw + x] = (p.g[i] + p.g[i + 1] + p.g[i + p.w] + p.g[i + p.w + 1]) * .25; }
      L.push({ g: o, w: nw, h: nh });
    }
    for (const lv of L) { // gradients for the window sums
      const gx = new Float32Array(lv.w * lv.h), gy = new Float32Array(lv.w * lv.h), G = lv.g, W2 = lv.w;
      for (let y = 1; y < lv.h - 1; y++) for (let x = 1; x < W2 - 1; x++) { const i = y * W2 + x; gx[i] = (G[i + 1] - G[i - 1]) * .5; gy[i] = (G[i + W2] - G[i - W2]) * .5; }
      lv.gx = gx; lv.gy = gy;
    }
    return L;
  }
  const samp = (a, W2, H2, x, y) => { if (x < 0) x = 0; if (y < 0) y = 0; if (x > W2 - 1.001) x = W2 - 1.001; if (y > H2 - 1.001) y = H2 - 1.001;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * W2 + x0; return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fy) + (a[i + W2] * (1 - fx) + a[i + W2 + 1] * fx) * fy; };
  const NW = (2 * WIN + 1) * (2 * WIN + 1), WA = new Float32Array(NW), WX = new Float32Array(NW), WY = new Float32Array(NW);
  function lk(P, N, x, y) { // pyramidal Lucas-Kanade: where did point (x,y) of P go in N?
    let gxs = 0, gys = 0;
    for (let l = LEVELS - 1; l >= 0; l--) {
      const A = P[l], B = N[l], s = 1 << l, px = x / s, py = y / s;
      let a11 = 0, a12 = 0, a22 = 0, n = 0;
      for (let j = -WIN; j <= WIN; j++) for (let i = -WIN; i <= WIN; i++, n++) { const ix = samp(A.gx, A.w, A.h, px + i, py + j), iy = samp(A.gy, A.w, A.h, px + i, py + j);
        WA[n] = samp(A.g, A.w, A.h, px + i, py + j); WX[n] = ix; WY[n] = iy; a11 += ix * ix; a12 += ix * iy; a22 += iy * iy; }
      const det = a11 * a22 - a12 * a12; if (det < 1e-3) return null;
      let vx = 0, vy = 0;
      for (let k = 0; k < ITERS; k++) {
        let b1 = 0, b2 = 0, m = 0; const ox = px + gxs + vx, oy = py + gys + vy;
        for (let j = -WIN; j <= WIN; j++) for (let i = -WIN; i <= WIN; i++, m++) { const dI = WA[m] - samp(B.g, B.w, B.h, ox + i, oy + j); b1 += dI * WX[m]; b2 += dI * WY[m]; }
        const ex = (a22 * b1 - a12 * b2) / det, ey = (a11 * b2 - a12 * b1) / det; vx += ex; vy += ey;
        if (ex * ex + ey * ey < .0009) break;
      }
      if (l > 0) { gxs = (gxs + vx) * 2; gys = (gys + vy) * 2; } else { gxs += vx; gys += vy; }
    }
    const nx = x + gxs, ny = y + gys; if (nx < 0 || ny < 0 || nx >= w || ny >= h) return null;
    return [nx, ny];
  }
  // homography from the unit square to the image, and its inverse
  const unit = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const apply = (H, x, y) => { const z = H[6] * x + H[7] * y + 1; return [(H[0] * x + H[1] * y + H[2]) / z, (H[3] * x + H[4] * y + H[5]) / z]; };
  function fitH(src, dst) { // least squares through all pairs (normal equations)
    const M = Array.from({ length: 8 }, () => new Float64Array(9));
    for (let k = 0; k < src.length; k++) { const [x, y] = src[k], [u, v] = dst[k];
      const r1 = [x, y, 1, 0, 0, 0, -u * x, -u * y, u], r2 = [0, 0, 0, x, y, 1, -v * x, -v * y, v];
      for (const r of [r1, r2]) for (let i = 0; i < 8; i++) { for (let j = 0; j < 8; j++) M[i][j] += r[i] * r[j]; M[i][8] += r[i] * r[8]; } }
    for (let c = 0; c < 8; c++) { let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]];
      if (Math.abs(M[c][c]) < 1e-12) return null;
      for (let r = 0; r < 8; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 9; k++) M[r][k] -= f * M[c][k]; } }
    return Array.from({ length: 8 }, (_, i) => M[i][8] / M[i][i]).concat([1]);
  }
  function seed(g, Q) { // good corners (Shi-Tomasi) spread over the inside of the rectangle
    const cand = [], E = homography(unit, Q), grow = [[-.15, -.15], [1.15, -.15], [1.15, 1.15], [-.15, 1.15]].map(([u, v]) => apply(E, u, v));
    const xs = grow.map(p => p[0]), ys = grow.map(p => p[1]);
    const x0 = Math.max(WIN + 2, Math.floor(Math.min(...xs))), x1 = Math.min(w - WIN - 3, Math.ceil(Math.max(...xs))), y0 = Math.max(WIN + 2, Math.floor(Math.min(...ys))), y1 = Math.min(h - WIN - 3, Math.ceil(Math.max(...ys)));
    const L0 = prevPyr[0];
    for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) {
      if (!inQuad(grow, x, y)) continue;
      let a = 0, b = 0, c = 0;
      for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const k = (y + j) * w + x + i, ix = L0.gx[k], iy = L0.gy[k]; a += ix * ix; b += ix * iy; c += iy * iy; }
      const tr = a + c, mn = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - (a * c - b * b)));
      if (mn > 60) cand.push([mn, x, y]);
    }
    cand.sort((p, q) => q[0] - p[0]);
    const Hi = homography(Q, unit), out = [], cell = Math.max(6, Math.sqrt((x1 - x0) * (y1 - y0) / 140));
    const taken = new Set();
    let inner = 0;
    for (const [, x, y] of cand) { const key = Math.floor(x / cell) + ',' + Math.floor(y / cell); if (taken.has(key)) continue;
      const uv = apply(Hi, x, y), inside = uv[0] > .12 && uv[0] < .88 && uv[1] > .12 && uv[1] < .88;
      if (inside && inner >= 30) continue; // keep most points on the edges and around the shape
      taken.add(key); if (inside) inner++; out.push({ x, y, uv }); if (out.length >= 70) break; }
    return out;
  }
  // smoothing that stays still when you hold still and keeps up when you move (one-euro filter)
  function euro(prev, val, dt, dprev) {
    const mc = opts.minCutoff || 1.2, beta = opts.beta != null ? opts.beta : .08, dc = 1;
    const al = c => 1 / (1 + 1 / (2 * Math.PI * c * dt));
    const d = (val - prev) / dt, ad = al(dc), ds = dprev + ad * (d - dprev);
    const a = al(mc + beta * Math.abs(ds)); return [prev + a * (val - prev), ds];
  }
  function update(src, sw, sh, now) {
    now = now || performance.now(); frame++; const t0 = performance.now();
    const g = gray(src, sw, sh); if (!g) return null;
    const pyr = pyramid(g); let tracked = null;
    // 1. follow the points from the last frame
    if (quad && prevPyr && pts.length >= 8) {
      const keep = [];
      for (const p of pts) { const n = lk(prevPyr, pyr, p.x, p.y); if (!n) continue; const back = lk(pyr, prevPyr, n[0], n[1]); if (!back || Math.hypot(back[0] - p.x, back[1] - p.y) > 1) continue; keep.push({ x: n[0], y: n[1], uv: p.uv }); }
      if (keep.length >= 8) { // robust fit: try a few 4-point guesses, keep the one most points agree with
        let best = null, bestIn = null;
        for (let it = 0; it < 40; it++) {
          const s = []; while (s.length < 4) { const k = keep[(Math.random() * keep.length) | 0]; if (!s.includes(k)) s.push(k); }
          let H; try { H = homography(s.map(k => k.uv), s.map(k => [k.x, k.y])); } catch (e) { continue; }
          if (!H.every(Number.isFinite)) continue;
          const inl = keep.filter(k => { const q = apply(H, k.uv[0], k.uv[1]); return Math.hypot(q[0] - k.x, q[1] - k.y) < 2.5; });
          if (!bestIn || inl.length > bestIn.length) { best = H; bestIn = inl; }
        }
        if (bestIn && bestIn.length >= Math.max(8, keep.length * .5)) {
          const H = fitH(bestIn.map(k => k.uv), bestIn.map(k => [k.x, k.y])) || best;
          const Q = unit.map(([u, v]) => apply(H, u, v));
          if (Q.every(p => p.every(Number.isFinite)) && convex(Q)) { tracked = Q; pts = bestIn; mode = 'track'; }
        }
      }
    }
    // 2. look for the rectangle: always when lost, and every few frames to correct drift and refresh points
    if (!tracked || frame - lastDetectF > (pts.length < 25 || disagree ? 3 : 10)) {
      lastDetectF = frame;
      const r = findRect(src, sw, sh);
      if (r) {
        const D = r.c.map(([x, y]) => [x * w, y * h]);
        if (!tracked) { tracked = D; mode = 'find'; }
        else { const off = D.reduce((s, p, i) => s + Math.hypot(p[0] - tracked[i][0], p[1] - tracked[i][1]), 0) / 4;
          if (off < Math.max(4, w * (opts.agree || .02))) { tracked = tracked.map((p, i) => [p[0] + (D[i][0] - p[0]) * .25, p[1] + (D[i][1] - p[1]) * .25]); disagree = 0; }
          else if (++disagree >= (opts.snapAfter || 2)) { tracked = D; disagree = 0; mode = 'find'; } }
        prevPyr = pyr; pts = seed(g, tracked);
      }
    }
    prevPyr = pyr;
    if (!tracked) { lostFor++; if (lostFor > 4) { quad = null; sm = null; pts = []; mode = 'none'; } return quad ? { c: quad.map(([x, y]) => [x / w, y / h]), mode: 'hold' } : null; }
    lostFor = 0; quad = tracked;
    if (pts.length < 20 && frame % 6 === 0) pts = pts.concat(seed(g, quad)).slice(0, 70);
    // 3. smooth the corners
    const dt = Math.max(1 / 120, Math.min(.1, (now - lastT) / 1000 || 1 / 30)); lastT = now;
    if (!sm || mode === 'find' && sm.jump) sm = { v: quad.flat(), d: new Array(8).fill(0) };
    else for (let i = 0; i < 8; i++) { const r = euro(sm.v[i], quad.flat()[i], dt, sm.d[i]); sm.v[i] = r[0]; sm.d[i] = r[1]; }
    const out = opts.raw ? quad.map(([x, y]) => [x / w, y / h]) : [0, 1, 2, 3].map(k => [sm.v[k * 2] / w, sm.v[k * 2 + 1] / h]);
    cost = cost * .9 + (performance.now() - t0) * .1;
    if (!opts.width && cost > 14 && TW > 240) { TW = 240; prevPyr = null; pts = []; } // slower phones: smaller frames
    return { c: out, mode, points: pts.length };
  }
  return { update, reset() { quad = null; sm = null; pts = []; prevPyr = null; mode = 'none'; }, get mode() { return mode; } };
}
