// 8 GATES — SIGN TEXT SAFETY NET (s129, Ben: "all text in signs has a nice margin and is not cut off, in all signs in all places").
// Every canvas sign / board / label in the game is drawn with fillText / strokeText. This wraps both once: if a line would run past the
// canvas edge (minus a margin of 4% of the width, min 8 px), the browser squeezes it to fit (the native maxWidth argument) instead of cutting it off.
// Works with textAlign left / start / center / right / end and with translate / scale transforms (rotated text is left alone).
// Loaded once by engine/save.js (every page imports it). Off switch for testing: window.__textFitOff = true. Count of fixes: window.__textFit.
(function () {
  if (typeof CanvasRenderingContext2D === 'undefined' || CanvasRenderingContext2D.prototype.__fit) return;
  const P = CanvasRenderingContext2D.prototype, F = P.fillText, S = P.strokeText; P.__fit = true;
  const stat = (typeof window !== 'undefined') ? (window.__textFit = window.__textFit || { n: 0, last: '' }) : { n: 0 };
  function room(g, text, x) {
    if (typeof window !== 'undefined' && window.__textFitOff) return 0;
    const c = g.canvas; if (!c || !c.width || c.width < 48) return 0;
    let a = 1, b = 0, cc = 0, e = 0; if (g.getTransform) { const m = g.getTransform(); a = m.a; b = m.b; cc = m.c; e = m.e; }
    if (Math.abs(b) > 1e-4 || Math.abs(cc) > 1e-4 || a <= 0) return 0;
    const W = c.width, mg = Math.max(8, W * 0.04), X = a * x + e, al = g.textAlign, dir = g.direction === 'rtl';
    let av; if (al === 'center') av = 2 * Math.min(X - mg, W - mg - X); else if (al === 'right' || (al === 'end' && !dir) || (al === 'start' && dir)) av = X - mg; else av = W - mg - X;
    av /= a; if (av < 12) return 0;
    const w = g.measureText(String(text)).width; if (w <= av) return 0; stat.n++; stat.last = String(text).slice(0, 40); return av;
  }
  P.fillText = function (text, x, y, maxW) { const av = room(this, text, x); if (av) maxW = maxW != null ? Math.min(maxW, av) : av; return maxW != null ? F.call(this, text, x, y, maxW) : F.call(this, text, x, y); };
  P.strokeText = function (text, x, y, maxW) { const av = room(this, text, x); if (av) maxW = maxW != null ? Math.min(maxW, av) : av; return maxW != null ? S.call(this, text, x, y, maxW) : S.call(this, text, x, y); };
  if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && !OffscreenCanvasRenderingContext2D.prototype.__fit) { const O = OffscreenCanvasRenderingContext2D.prototype, OF = O.fillText; O.__fit = true; O.fillText = function (t, x, y, m) { const av = room(this, t, x); if (av) m = m != null ? Math.min(m, av) : av; return m != null ? OF.call(this, t, x, y, m) : OF.call(this, t, x, y); }; }
})();
