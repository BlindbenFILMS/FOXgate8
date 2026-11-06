// Craig Ellis's three games share this screen layout: the score panel, the start banner and every pop-up sit just
// ABOVE the painting, exactly as wide as the painting (never narrower than 260 px, never off the screen), so nothing
// covers it. It follows the painting as it moves in the camera. Call hud.update() every frame; hud.remove() in stop().
import * as THREE from 'three';

const TOP_MIN = 66;     // keep clear of the viewer's own buttons at the top (the kit's own top line); the start banner may go higher
const GAP = 8;          // space between the panel and the painting
const MIN_W = 260;

export function aboveHud(G) {
  const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const st = document.createElement('style');
  st.textContent = '.mgk.mgk-alert{box-shadow:none!important}' +   // the offset shadow would poke out past the painting's edge
    // a compact start banner, so it fits above the painting
    '.mgk.mgk-banner{padding:10px 16px 12px!important;border-bottom-width:6px!important}.mgk-banner .t{font-size:clamp(24px,7.4vw,34px)!important;margin-top:4px!important}' +
    '.mgk-banner .s{font-size:clamp(14px,3.9vw,16px)!important;line-height:1.28!important;margin-top:6px!important}';
  document.head.appendChild(st);
  let rect = null;
  function measure() {
    if (!G || !G.root || !G.camera || !G.renderer) return null;
    const r = G.renderer.domElement.getBoundingClientRect(), h = G.h || 1;
    G.root.updateWorldMatrix(true, false);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    [[-0.5, h / 2], [0.5, h / 2], [-0.5, -h / 2], [0.5, -h / 2]].forEach(([x, y], i) => {
      const v = corners[i].set(x, y, 0).applyMatrix4(G.root.matrixWorld).project(G.camera);
      const sx = r.left + (v.x + 1) / 2 * r.width, sy = r.top + (1 - v.y) / 2 * r.height;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    });
    if (!isFinite(x0)) return null;
    return { left: x0, right: x1, top: y0, bottom: y1 };
  }
  return {
    update() {
      rect = measure(); if (!rect) return;
      const W = innerWidth, w = Math.min(W - 16, Math.max(MIN_W, rect.right - rect.left));
      const left = Math.max(8, Math.min(W - 8 - w, (rect.left + rect.right) / 2 - w / 2));
      const place = (el, top) => {
        const s = el.style; s.setProperty('left', left + 'px', 'important'); s.setProperty('right', 'auto', 'important'); s.setProperty('bottom', 'auto', 'important');
        if (!el.classList.contains('mgk-count')) { s.setProperty('width', w + 'px', 'important'); s.setProperty('box-sizing', 'border-box', 'important'); }
        s.setProperty('top', top + 'px', 'important');
      };
      const shown = el => el && el.offsetHeight > 0 && getComputedStyle(el).display !== 'none';
      // the score panel sits on top of the painting; pop-ups cover it exactly (at least as tall), so it never peeks out
      const panel = document.querySelector('.mgk.mgk-panel');
      let pTop = null, pH = 0;
      if (shown(panel)) { place(panel, 0); pH = panel.offsetHeight; pTop = Math.max(TOP_MIN, rect.top - GAP - pH); place(panel, pTop); }
      document.querySelectorAll('.mgk.mgk-alert').forEach(el => {
        if (pTop !== null) { el.style.setProperty('min-height', pH + 'px', 'important'); place(el, pTop); }
        else { el.style.removeProperty('min-height'); place(el, 0); place(el, Math.max(TOP_MIN, rect.top - GAP - el.offsetHeight)); }
      });
      document.querySelectorAll('.mgk.mgk-banner').forEach(el => { place(el, 0); place(el, Math.max(12, rect.top - GAP - el.offsetHeight)); });
      document.querySelectorAll('.mgk.mgk-count').forEach(el => place(el, Math.max(TOP_MIN, rect.top - GAP - el.offsetHeight)));
    },
    // where a pop-up word should go: centred just above the painting
    popAt() { const r = rect || measure(); return r ? [(r.left + r.right) / 2, Math.max(TOP_MIN + 20, r.top - 30)] : [innerWidth / 2, 120]; },
    remove() { st.remove(); },
  };
}
