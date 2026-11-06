// MORTEN BONDE's games: keep the top banner OFF the painting. The kit's top panel (and the intro banner) is moved to sit
// right above the painting, exactly the painting's width, every frame, wherever the painting is on screen.
// Messages that used to drop over the painting (the kit's alert blocks and pop-ups) are shown in that same banner
// instead: note(G, title, sub, secs, kind) sets one, noteOn(G) says whether one is showing (the game's hud() shows it).
//   dockBanner(G)  call every frame;  paintRect(G)  the painting's rectangle on screen, in px (or null)
import * as THREE from 'three';

const v = new THREE.Vector3();

export function paintRect(G) {
  if (!G || !G.camera || !G.renderer || !G.root) return null;
  G.camera.updateMatrixWorld(); G.root.updateWorldMatrix(true, false);
  const r = G.renderer.domElement.getBoundingClientRect(), h = G.h || 1;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of [[-0.5, -h / 2], [0.5, -h / 2], [-0.5, h / 2], [0.5, h / 2]]) {
    v.set(x, y, 0).applyMatrix4(G.root.matrixWorld).project(G.camera);
    if (!Number.isFinite(v.x) || v.z > 1) return null;
    const px = r.left + (v.x + 1) / 2 * r.width, py = r.top + (1 - v.y) / 2 * r.height;
    x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
  }
  return { left: x0, right: x1, top: y0, bottom: y1, width: x1 - x0, height: y1 - y0 };
}

function reset(e) { e.style.left = e.style.right = e.style.width = e.style.top = ''; }

export function dockBanner(G) {
  const els = document.querySelectorAll('.mgk-panel, .mgk-banner');
  const R = paintRect(G);
  if (!R || R.width < 60) { els.forEach(reset); return; }
  const W = innerWidth, min = Math.min(280, W - 16);
  const w = Math.max(min, Math.min(R.width, W - 16));                         // the painting's width (but readable, and on screen)
  const left = Math.max(8, Math.min(W - 8 - w, R.left + (R.width - w) / 2));
  els.forEach(e => {
    if (getComputedStyle(e).display === 'none') return;
    e.style.boxSizing = 'border-box'; e.style.left = left + 'px'; e.style.right = 'auto'; e.style.width = w + 'px';
    // a long title (METAMORPHOSIS) shrinks to fit the banner instead of being cut off
    const t = e.querySelector('.t'), key = t && t.textContent + '|' + Math.round(w);
    if (t && t._fit !== key) { t._fit = key; t.style.fontSize = ''; t.style.whiteSpace = 'nowrap'; let fs = parseFloat(getComputedStyle(t).fontSize) || 40;
      while (t.scrollWidth > t.clientWidth + 1 && fs > 18) { fs -= 2; t.style.fontSize = fs + 'px'; }
      if (fs < 30) { t.style.whiteSpace = 'normal'; t.style.fontSize = '32px'; } }   // very long: two lines instead of tiny
    e.style.top = Math.max(8, R.top - e.offsetHeight - 10) + 'px';            // right above the painting (if there's room)
  });
}

export function note(G, title, sub = '', secs = 1.6, kind = 'black') { G.note = { title, sub, until: G.t + secs, kind }; }
export function noteOn(G) { if (G.note && G.t >= G.note.until) G.note = null; return G.note; }
