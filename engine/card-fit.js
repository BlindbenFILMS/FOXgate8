// 8 GATES — CARD FIT SAFETY NET (s129 phone sweep, Ben: "nothing cut off, cards fit 390x844 + 844x390").
// Job cards, panels and tips are fixed-position boxes that each module adds straight to <body>. Every 400 ms this checks them once:
// a box that runs past the screen (8 px margin) gets fitted: boxes with buttons get a max-height / max-width + their own scroll (every button
// stays reachable); boxes you can't touch (pointer-events none: tips, labels) are zoomed down to fit (never below 0.72).
// Full-screen layers (inset 0) and the 3D canvas are left alone. Rotating the phone resets and refits. Loaded once by engine/save.js.
// Off switch: window.__cardFitOff = true. Log of fitted boxes: window.__cardFit.
(function () {
  if (typeof window === 'undefined' || window.__cardFitOn) return; window.__cardFitOn = true;
  const LOG = window.__cardFit = window.__cardFit || [], M = 8, mine = new Set();
  const reset = el => { el.style.maxHeight = el.dataset.cfMh || ''; el.style.maxWidth = el.dataset.cfMw || ''; el.style.overflowY = el.dataset.cfOy || ''; el.style.overflowX = el.dataset.cfOx || ''; el.style.zoom = el.dataset.cfZ || ''; delete el.dataset.cf; };
  function fit(el) {
    const cs = getComputedStyle(el); if (cs.position !== 'fixed' && cs.position !== 'absolute') return; if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return;
    const r = el.getBoundingClientRect(), W = innerWidth, H = innerHeight; if (r.width < 40 || r.height < 30) return;
    if (r.width >= W - 1 && r.height >= H - 1) return;                       // a full-screen layer
    const over = r.top < M - 1 || r.bottom > H - M + 1 || r.width > W - 2 * M + 1 || r.left < -1 || r.right > W + 1; if (!over) return;
    if (!(el.innerText || '').trim()) return;
    if (!el.dataset.cf) { el.dataset.cfMh = el.style.maxHeight; el.dataset.cfMw = el.style.maxWidth; el.dataset.cfOy = el.style.overflowY; el.dataset.cfOx = el.style.overflowX; el.dataset.cfZ = el.style.zoom; }
    const touch = cs.pointerEvents !== 'none' || !!el.querySelector('button,[role=button],input,select');
    if (touch) {
      const z = parseFloat(cs.zoom) || 1, topA = cs.top !== 'auto' && cs.bottom === 'auto', room = topA ? H - Math.max(M, r.top) - M : H - 2 * M;
      el.style.maxHeight = Math.max(120, Math.floor(room / z)) + 'px'; el.style.overflowY = 'auto'; el.style.webkitOverflowScrolling = 'touch'; el.style.overscrollBehavior = 'contain';
      if (r.width > W - 2 * M) { el.style.maxWidth = Math.floor((W - 2 * M) / z) + 'px'; el.style.overflowX = 'hidden'; }
      if (r.top < M - 1 && topA) el.style.top = M + 'px';
    } else {
      const tf = cs.transform; if (tf && tf !== 'none') { const m = tf.match(/matrix\(([^,]+),[^,]+,[^,]+,([^,]+)/); if (m && (Math.abs(+m[1] - 1) > 0.01 || Math.abs(+m[2] - 1) > 0.01)) return; }   // mid-animation (fly-ins): leave it
      const z0 = parseFloat(el.style.zoom) || 1, k = Math.min(1, (H - 2 * M) / r.height, (W - 2 * M) / r.width), z = Math.max(0.72, z0 * k); if (z >= z0 - 0.01) return; el.style.zoom = String(Math.round(z * 100) / 100);
    }
    el.dataset.cf = '1'; mine.add(el); const tag = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40); if (LOG.length < 60) LOG.push({ t: Math.round(performance.now() / 1000), w: W, h: H, mode: touch ? 'scroll' : 'zoom', text: tag });
  }
  function scan() { if (window.__cardFitOff || !document.body) return; for (const el of document.body.children) { if (el.tagName === 'CANVAS' || el.tagName === 'SCRIPT' || el.tagName === 'X-DC' || el.tagName === 'IFRAME') continue; try { fit(el); } catch (e) {} } }
  let lw = 0, lh = 0; setInterval(() => { if (innerWidth !== lw || innerHeight !== lh) { lw = innerWidth; lh = innerHeight; mine.forEach(reset); mine.clear(); } scan(); }, 400);
})();
