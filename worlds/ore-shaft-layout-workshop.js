// ORE SHAFT LAYOUT WORKSHOP view (s365): PLAN (2D, edit) + 3D (blockout preview with the real machines) + TOUR (ride the guide line).
// Used by Ore Shaft Layout Workshop.dc.html. Owns the mutable layout; emits onEvent({sel}) / onEvent({edit}) / onEvent({tool}).
import * as THREE from '../vendor/three/three.module.js';
import { makeGradient } from '../village-game.js';
import { poseMachine } from './ore-machines.js?v=s364aj';
import { LEVELS, KINDS, TOOL, MNAME, lampsFor, newItem, newPath, segDist } from './ore-shaft-layout.js?v=s365';
import { oreSceneKit, buildOreLevel } from './ore-shaft-scene.js?v=s365d';

export async function createOreLayoutWorkshop({ container, onEvent = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, dpr = Math.min(devicePixelRatio || 1, 2);
  let L = null, li = 0, mode = 'plan', tool = 'move', toolM = null, sel = null, labels = true, dirty3 = true, alive = true;
  const lv = () => L.levels[li], D = () => LEVELS[li];
  const emit = e => onEvent(e);
  // ---------- PLAN ----------
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block;cursor:crosshair'; container.appendChild(cv);
  const g = cv.getContext('2d'); const V = { cx: 0, cz: 0, s: 6 };
  const cw = () => container.clientWidth || 1, ch = () => container.clientHeight || 1;
  const W2S = (x, z) => [cw() / 2 + (x - V.cx) * V.s, ch() / 2 + (z - V.cz) * V.s], S2W = (sx, sy) => [V.cx + (sx - cw() / 2) / V.s, V.cz + (sy - ch() / 2) / V.s];
  const snap = v => Math.round(v * 2) / 2;
  function fit() { const d = D(), pad = touch ? 4 : 8; V.cx = 0; V.cz = 0; V.s = Math.min(cw() / (d.hw * 2 + pad * 2), ch() / (d.hd * 2 + pad * 2)); draw(); }
  function size() { cv.width = cw() * dpr; cv.height = ch() * dpr; if (R) { R.renderer.setSize(cw(), ch()); R.cam.aspect = cw() / ch(); R.cam.updateProjectionMatrix(); } draw(); }
  const beltPts = it => { const a = (it.ang || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), h = it.len / 2, w = 1.1; return [[-h, -w], [h, -w], [h, w], [-h, w]].map(([u, v]) => [it.x + u * c - v * s, it.z + u * s + v * c]); };
  const FONT = (w, px) => `${w} ${px}px Archivo, "Arial Black", sans-serif`;
  function draw() {
    if (!L) return; const W = cw(), H = ch(); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#201e1d'; g.fillRect(0, 0, W, H);
    const d = D(), l = lv(), [x0, y0] = W2S(-d.hw, -d.hd), [x1, y1] = W2S(d.hw, d.hd);
    g.fillStyle = d.floor; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let x = -d.hw; x <= d.hw; x += 5) { const [sx] = W2S(x, 0); g.strokeStyle = x % 10 ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, y0); g.lineTo(sx, y1); g.stroke(); }
    for (let z = -d.hd; z <= d.hd; z += 5) { const [, sy] = W2S(0, z); g.strokeStyle = z % 10 ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.25)'; g.beginPath(); g.moveTo(x0, sy); g.lineTo(x1, sy); g.stroke(); }
    const S = V.s, isSel = it => sel && sel.id === it.id;
    const rect = (it, fill, stroke, hatch) => { const [a, b] = W2S(it.x - it.w / 2, it.z - it.d / 2); g.fillStyle = fill; g.fillRect(a, b, it.w * S, it.d * S); if (hatch) { g.save(); g.beginPath(); g.rect(a, b, it.w * S, it.d * S); g.clip(); g.strokeStyle = hatch; g.lineWidth = 1.5; for (let k = -it.d * S; k < it.w * S; k += 9) { g.beginPath(); g.moveTo(a + k, b + it.d * S); g.lineTo(a + k + it.d * S, b); g.stroke(); } g.restore(); } g.strokeStyle = stroke; g.lineWidth = 2; g.strokeRect(a, b, it.w * S, it.d * S); };
    const circ = (it, fill, stroke, dash) => { const [a, b] = W2S(it.x, it.z); g.beginPath(); g.arc(a, b, it.r * S, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } g.setLineDash(dash || []); g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); g.setLineDash([]); };
    const order = ['wild', 'water', 'ice', 'arena', 'rubble', 'cable', 'rock', 'pile', 'belt'];
    for (const k of order) for (const it of l.items) { if (it.k !== k) continue;
      if (k === 'wild') rect(it, 'rgba(138,106,74,0.35)', '#8a6a4a', 'rgba(32,30,29,0.25)');
      else if (k === 'water') rect(it, 'rgba(47,111,208,0.5)', '#5fb8ff');
      else if (k === 'ice') rect(it, 'rgba(191,230,244,0.55)', '#e6f7ff');
      else if (k === 'arena') circ(it, 'rgba(236,48,19,0.14)', '#ec3013', [10, 6]);
      else if (k === 'rubble') circ(it, 'rgba(200,204,210,0.18)', '#c8ccd2', [5, 5]);
      else if (k === 'cable') { circ(it, 'rgba(124,255,155,0.18)', '#7cff9b'); const [a, b] = W2S(it.x, it.z); g.strokeStyle = '#7cff9b'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 8; i++) { const u = -it.r * 0.7 + i * it.r * 1.4 / 8; g.lineTo(a + u * S, b + (i % 2 ? -1 : 1) * it.r * 0.3 * S); } g.stroke(); }
      else if (k === 'rock') circ(it, '#6a7078', '#c8ccd2');
      else if (k === 'pile') circ(it, '#9a5a2a', '#d0782c');
      else if (k === 'belt') { const P = beltPts(it).map(p => W2S(p[0], p[1])); g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = '#2a2d33'; g.fill(); g.strokeStyle = it.dir === 'up' ? '#e0b020' : '#b8b2ac'; g.lineWidth = 2; g.stroke();
        const a = (it.ang || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); g.fillStyle = it.dir === 'up' ? '#e0b020' : '#b8b2ac'; for (let u = -it.len / 2 + 1.5; u < it.len / 2 - 0.5; u += 3) { const [px, pz] = W2S(it.x + u * c, it.z + u * s); g.save(); g.translate(px, pz); g.rotate(a); g.beginPath(); g.moveTo(0.9 * S, 0); g.lineTo(-0.4 * S, -0.7 * S); g.lineTo(-0.4 * S, 0.7 * S); g.closePath(); g.fill(); g.restore(); } }
      if (isSel(it)) { if (it.r != null && KINDS[k].shape === 'circle') circ(it, null, '#f3f2f2', [4, 4]); else if (k === 'belt') { const P = beltPts(it).map(p => W2S(p[0], p[1])); g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.setLineDash([4, 4]); g.strokeStyle = '#f3f2f2'; g.lineWidth = 3; g.stroke(); g.setLineDash([]); } else { const [a, b] = W2S(it.x - it.w / 2, it.z - it.d / 2); g.setLineDash([4, 4]); g.strokeStyle = '#f3f2f2'; g.lineWidth = 3; g.strokeRect(a - 2, b - 2, it.w * S + 4, it.d * S + 4); g.setLineDash([]); } } }
    // paths: walkway, hazard edge, glowing guide line, then lamps
    for (const p of l.paths) { if (p.pts.length < 1) continue; const on = sel && sel.id === p.id; g.lineCap = 'round'; g.lineJoin = 'round';
      const line = () => { g.beginPath(); p.pts.forEach((q, i) => { const [a, b] = W2S(q[0], q[1]); i ? g.lineTo(a, b) : g.moveTo(a, b); }); };
      line(); g.strokeStyle = on ? '#f3f2f2' : '#15171d'; g.lineWidth = p.w * S + 4; g.stroke(); line(); g.strokeStyle = '#6a7078'; g.lineWidth = p.w * S; g.stroke(); line(); g.strokeStyle = '#ffd23a'; g.lineWidth = Math.max(2, 0.3 * S); g.stroke();
      if (on) p.pts.forEach((q, i) => { const [a, b] = W2S(q[0], q[1]); const hot = sel.pi === i; g.fillStyle = hot ? '#ec3013' : '#f3f2f2'; g.fillRect(a - 7, b - 7, 14, 14); g.strokeStyle = '#201e1d'; g.lineWidth = 2; g.strokeRect(a - 7, b - 7, 14, 14); }); }
    for (const q of lampsFor(l)) { const [a, b] = W2S(q.x, q.z); g.beginPath(); g.arc(a, b, Math.max(5, 0.9 * S), 0, 7); g.fillStyle = 'rgba(255,200,112,0.22)'; g.fill(); g.beginPath(); g.arc(a, b, 3, 0, 7); g.fillStyle = '#ffc870'; g.fill(); }
    // point items + spawns
    for (const it of l.items) { const K = KINDS[it.k], [a, b] = W2S(it.x, it.z), on = isSel(it);
      if (it.k === 'spawn') { circ(it, 'rgba(255,107,90,0.22)', on ? '#f3f2f2' : '#ff6b5a', on ? [4, 4] : null); g.fillStyle = '#201e1d'; g.fillRect(a - 15, b - 10, 30, 20); g.fillStyle = '#ff6b5a'; g.font = FONT(900, 12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(MNAME[it.m].slice(0, 2) + '×' + (it.n || 1), a, b + 1); }
      else if (K.shape === 'pt') { if (it.k === 'lamp') { if (on) { g.strokeStyle = '#f3f2f2'; g.lineWidth = 2; g.strokeRect(a - 8, b - 8, 16, 16); } continue; }
        const big = ['lift', 'guard', 'relay', 'rig', 'r8hack'].includes(it.k), r = big ? 13 : 9; g.fillStyle = K.col; if (it.k === 'guard' || it.k === 'relay' || it.k === 'rig') { g.beginPath(); g.moveTo(a, b - r); g.lineTo(a + r, b); g.lineTo(a, b + r); g.lineTo(a - r, b); g.closePath(); g.fill(); g.strokeStyle = on ? '#f3f2f2' : '#15171d'; g.lineWidth = on ? 3 : 2; g.stroke(); }
        else { g.fillRect(a - r, b - r, r * 2, r * 2); g.strokeStyle = on ? '#f3f2f2' : '#15171d'; g.lineWidth = on ? 3 : 2; g.strokeRect(a - r, b - r, r * 2, r * 2); }
        const glyph = { lift: 'L', guard: 'P' + (li + 1), r8hack: 'R8', relay: 'RE', rig: 'RG', dead: 'X', chute: 'C', main: 'W', vent: 'V' }[it.k] || '';
        g.fillStyle = ['lift', 'vent', 'chute', 'guard', 'rig'].includes(it.k) ? '#15171d' : '#f3f2f2'; g.font = FONT(900, big ? 12 : 10); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, a, b + 1); } }
    if (labels) { g.font = FONT(800, 11); g.textAlign = 'left'; g.textBaseline = 'top'; for (const it of l.items) { const K = KINDS[it.k]; if (['lamp', 'dead', 'vent', 'wild'].includes(it.k)) continue; let t = it.k === 'spawn' ? MNAME[it.m] + ' ×' + (it.n || 1) : it.k === 'guard' ? 'GUARD · ' + MNAME[it.m] + ' · ' + TOOL[li].part : it.k === 'belt' ? (it.dir === 'up' ? 'ORE BELT ↑' : 'RUBBLE → CHUTE') : K.label; const [a, b] = W2S(it.x, it.z), oy = K.shape === 'pt' || it.k === 'spawn' ? 16 : K.shape === 'rect' ? -it.d / 2 * V.s + 4 : K.shape === 'circle' ? it.r * V.s + 4 : 10, ox = K.shape === 'rect' ? -it.w / 2 * V.s + 4 : -g.measureText(t).width / 2;
        const tw = g.measureText(t).width; g.fillStyle = 'rgba(32,30,29,0.85)'; g.fillRect(a + ox - 3, b + oy - 2, tw + 6, 15); g.fillStyle = K.col === '#1a3fb8' ? '#5fe3ff' : K.col === '#2f6fd0' ? '#5fb8ff' : K.col; g.fillText(t, a + ox, b + oy); } }
    g.strokeStyle = '#f3f2f2'; g.lineWidth = 2; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
  }
  // hit test (plan)
  function hit(sx, sy) { const l = lv(), [x, z] = S2W(sx, sy), tol = (touch ? 22 : 12) / V.s;
    if (sel && sel.type === 'path') { const p = l.paths.find(q => q.id === sel.id); if (p) for (let i = p.pts.length - 1; i >= 0; i--) if (Math.hypot(p.pts[i][0] - x, p.pts[i][1] - z) < tol) return { type: 'path', id: p.id, pi: i }; }
    const pts = l.items.filter(i => KINDS[i.k].shape === 'pt'); for (let i = pts.length - 1; i >= 0; i--) if (Math.hypot(pts[i].x - x, pts[i].z - z) < tol) return { type: 'item', id: pts[i].id };
    for (const k of ['spawn']) for (const it of l.items) if (it.k === k && Math.hypot(it.x - x, it.z - z) < Math.max(it.r, tol)) return { type: 'item', id: it.id };
    for (const p of l.paths) for (let i = 0; i < p.pts.length - 1; i++) if (segDist(x, z, p.pts[i], p.pts[i + 1]) < p.w / 2 + tol * 0.5) return { type: 'path', id: p.id, pi: -1 };
    for (const k of ['belt', 'cable', 'pile', 'rock', 'rubble', 'arena', 'ice', 'water', 'wild']) for (let j = l.items.length - 1; j >= 0; j--) { const it = l.items[j]; if (it.k !== k) continue; const sh = KINDS[k].shape;
      if (sh === 'circle' && Math.hypot(it.x - x, it.z - z) < it.r) return { type: 'item', id: it.id };
      if (sh === 'rect' && Math.abs(x - it.x) < it.w / 2 && Math.abs(z - it.z) < it.d / 2) return { type: 'item', id: it.id };
      if (sh === 'belt') { const a = (it.ang || 0) * Math.PI / 180, u = (x - it.x) * Math.cos(a) + (z - it.z) * Math.sin(a), v = -(x - it.x) * Math.sin(a) + (z - it.z) * Math.cos(a); if (Math.abs(u) < it.len / 2 && Math.abs(v) < 1.6) return { type: 'item', id: it.id }; } }
    return null; }
  const setSel = s => { sel = s; emit({ sel }); draw(); };
  const edited = () => { dirty3 = true; draw(); emit({ edit: true }); if (mode !== 'plan') schedule3(); };
  // pointers: 1 = select / drag / pan / place, 2 = pinch zoom + pan
  const PT = new Map(); let drag = null;
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); PT.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (PT.size === 2) { const [a, b] = [...PT.values()]; drag = { pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]), s0: V.s, m0: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], c0: [V.cx, V.cz] }; return; }
    const sx = e.offsetX, sy = e.offsetY, [wx, wz] = S2W(sx, sy); drag = { sx, sy, moved: false, wx, wz, c0: [V.cx, V.cz] };
    if (tool === 'move') { const h = hit(sx, sy); if (h) { drag.h = h; setSel(h); const l = lv(); if (h.type === 'item') { const it = l.items.find(i => i.id === h.id); drag.o = [it.x, it.z]; } else { const p = l.paths.find(q => q.id === h.id); drag.o = h.pi >= 0 ? [...p.pts[h.pi]] : p.pts.map(q => [...q]); } } } });
  cv.addEventListener('pointermove', e => { if (!PT.has(e.pointerId) || !drag) return; PT.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (drag.pinch && PT.size >= 2) { const [a, b] = [...PT.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; V.s = Math.max(1.5, Math.min(60, drag.s0 * d / Math.max(drag.d0, 1))); V.cx = drag.c0[0] - (m[0] - drag.m0[0]) / V.s; V.cz = drag.c0[1] - (m[1] - drag.m0[1]) / V.s; draw(); return; }
    const dx = e.offsetX - drag.sx, dy = e.offsetY - drag.sy; if (!drag.moved && Math.hypot(dx, dy) < 6) return; drag.moved = true;
    if (drag.h) { const l = lv(), mx = dx / V.s, mz = dy / V.s; if (drag.h.type === 'item') { const it = l.items.find(i => i.id === drag.h.id); it.x = snap(drag.o[0] + mx); it.z = snap(drag.o[1] + mz); } else { const p = l.paths.find(q => q.id === drag.h.id); if (drag.h.pi >= 0) p.pts[drag.h.pi] = [snap(drag.o[0] + mx), snap(drag.o[1] + mz)]; else p.pts = drag.o.map(q => [snap(q[0] + mx), snap(q[1] + mz)]); } draw(); }
    else { V.cx = drag.c0[0] - dx / V.s; V.cz = drag.c0[1] - dy / V.s; draw(); } });
  const up = e => { PT.delete(e.pointerId); if (!drag) return; const d = drag; if (d.pinch) { if (PT.size === 0) drag = null; return; } drag = null;
    if (d.h && d.moved) { edited(); return; }
    if (d.moved) return;
    const l = lv(), x = snap(d.wx), z = snap(d.wz);
    if (tool === 'move') { if (!d.h) setSel(null); return; }
    if (tool === 'path') { let p = sel && sel.type === 'path' && l.paths.find(q => q.id === sel.id); if (!p) { p = newPath(x, z); l.paths.push(p); } else p.pts.push([x, z]); sel = { type: 'path', id: p.id, pi: p.pts.length - 1 }; emit({ sel }); edited(); return; }
    const K = KINDS[tool]; let it = K.one && l.items.find(i => i.k === tool); if (it) { it.x = x; it.z = z; } else { it = newItem(tool, x, z, toolM); l.items.push(it); }
    tool = 'move'; emit({ tool }); setSel({ type: 'item', id: it.id }); edited(); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); const [wx, wz] = S2W(e.offsetX, e.offsetY); V.s = Math.max(1.5, Math.min(60, V.s * Math.exp(-e.deltaY * 0.0015))); V.cx = wx - (e.offsetX - cw() / 2) / V.s; V.cz = wz - (e.offsetY - ch() / 2) / V.s; draw(); }, { passive: false });
  const onKey = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { api.remove(); e.preventDefault(); } if (e.key === 'Escape') setSel(null); };
  addEventListener('keydown', onKey);

  // ---------- 3D ----------
  let R = null, t3 = null; const schedule3 = () => { clearTimeout(t3); t3 = setTimeout(() => { if (mode !== 'plan') build3(); }, 220); };
  function init3() {
    const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2)); renderer.setSize(cw(), ch()); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, cw() / ch(), 0.3, 600);
    const hemi = new THREE.HemisphereLight(0xc8dcf0, 0x30363c, 1.25); scene.add(hemi); const sun = new THREE.DirectionalLight(0xfff0d8, 0.9); sun.position.set(-30, 60, 20); scene.add(sun);
    const grad = makeGradient(), cache = new Map(), toon = c => { if (!cache.has(c)) cache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return cache.get(c); };
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0e0c14, side: THREE.BackSide });
    const addOutline = (mesh, t = 0.04, radius) => { const gg = mesh.geometry; gg.computeBoundingBox(); const s = new THREE.Vector3(); gg.boundingBox.getSize(s); const o = new THREE.Mesh(gg, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; };
    let root = null; const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || root).add(m); return m; };
    const CT = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const glowTex = CT(64, 64, (q, w) => { const gr = q.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gr; q.fillRect(0, 0, w, w); });
    const noise = (base, n, lo, hi, tint = [0, 4, 10]) => CT(256, 256, (q, w) => { q.fillStyle = base; q.fillRect(0, 0, w, w); for (let i = 0; i < n; i++) { const v = lo + Math.random() * (hi - lo) | 0; q.fillStyle = `rgb(${v + tint[0]},${v + tint[1]},${v + tint[2]})`; q.fillRect(Math.random() * w, Math.random() * w, 2 + Math.random() * 7, 2 + Math.random() * 7); } q.strokeStyle = 'rgba(15,18,24,0.45)'; q.lineWidth = 2; for (let i = 0; i < 10; i++) { q.beginPath(); let x = Math.random() * w, y = Math.random() * w; q.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; q.lineTo(x, y); } q.stroke(); } });
    const rep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
    const T = {
      rock: noise('#4a5058', 900, 60, 100), rubble: noise('#4a3e34', 1400, 50, 95, [8, 2, -6]),
      grate: CT(128, 128, (q, w) => { q.fillStyle = '#5a6068'; q.fillRect(0, 0, w, w); q.strokeStyle = '#2a2f36'; q.lineWidth = 5; for (let x = 0; x <= w; x += 16) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x, w); q.stroke(); } q.lineWidth = 3; for (let y = 0; y <= w; y += 32) { q.beginPath(); q.moveTo(0, y); q.lineTo(w, y); q.stroke(); } }),
      dash: CT(128, 16, (q, w, h) => { q.clearRect(0, 0, w, h); q.fillStyle = '#ffd23a'; for (let x = 0; x < w; x += 32) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x + 18, 0); q.lineTo(x + 26, h / 2); q.lineTo(x + 18, h); q.lineTo(x, h); q.lineTo(x + 8, h / 2); q.closePath(); q.fill(); } }),
      stripe: CT(256, 16, (q, w, h) => { q.fillStyle = '#15171d'; q.fillRect(0, 0, w, h); q.fillStyle = '#f2c230'; for (let x = -16; x < w + 16; x += 16) { q.beginPath(); q.moveTo(x, h); q.lineTo(x + 8, h); q.lineTo(x + 16, 0); q.lineTo(x + 8, 0); q.closePath(); q.fill(); } }),
      belt: (c) => CT(64, 64, (q, w) => { q.fillStyle = '#1a1c20'; q.fillRect(0, 0, w, w); q.strokeStyle = c; q.lineWidth = 7; for (let y = 4; y < w; y += 32) { q.beginPath(); q.moveTo(10, y + 18); q.lineTo(32, y); q.lineTo(54, y + 18); q.stroke(); } }),
      ripple: CT(128, 128, (q, w) => { q.fillStyle = '#2f6fd0'; q.fillRect(0, 0, w, w); q.strokeStyle = 'rgba(160,220,255,0.5)'; q.lineWidth = 2; for (let i = 0; i < 26; i++) { const x = Math.random() * w, y = Math.random() * w, r = 4 + Math.random() * 14; q.beginPath(); q.arc(x, y, r, 0.3, 2.6); q.stroke(); } }),
      ice: CT(256, 256, (q, w) => { q.fillStyle = '#bfe6f4'; q.fillRect(0, 0, w, w); q.strokeStyle = 'rgba(255,255,255,0.9)'; q.lineWidth = 2; for (let i = 0; i < 16; i++) { q.beginPath(); let x = Math.random() * w, y = Math.random() * w; q.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 70; y += (Math.random() - 0.5) * 70; q.lineTo(x, y); } q.stroke(); } q.fillStyle = 'rgba(120,180,210,0.25)'; for (let i = 0; i < 40; i++) q.fillRect(Math.random() * w, Math.random() * w, 10, 3); }),
    };
    const label = (txt, col = '#f3f2f2', sub) => { const tx = CT(512, sub ? 160 : 112, (q, w, h) => { q.fillStyle = 'rgba(32,30,29,0.92)'; q.fillRect(0, 0, w, h); q.fillStyle = col; q.fillRect(0, 0, 14, h); q.strokeStyle = '#f3f2f2'; q.lineWidth = 4; q.strokeRect(2, 2, w - 4, h - 4); q.fillStyle = '#f3f2f2'; q.textBaseline = 'middle'; let fs = 62; q.font = `900 ${fs}px Archivo, "Arial Black", sans-serif`; while (q.measureText(txt).width > w - 50 && fs > 24) { fs -= 2; q.font = `900 ${fs}px Archivo, "Arial Black", sans-serif`; } q.fillText(txt, 30, sub ? 58 : h / 2 + 2); if (sub) { q.fillStyle = col; q.font = '800 36px Archivo, "Arial Black", sans-serif'; q.fillText(sub, 30, 122); } });
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true, sizeAttenuation: false })); s.renderOrder = 10; const hh = (touch ? 0.05 : 0.042) * (sub ? 1.43 : 1); s.scale.set(hh * 512 / (sub ? 160 : 112), hh, 1); s.userData.label = true; return s; };
    R = { K: oreSceneKit({ toon, outlineMat, touch }), renderer, scene, cam, toon, M, CT, T, rep, glowTex, outlineMat, label, hemi, sun, anim: [], bots: [], setRoot: r => { root = r; } };
    // orbit camera: 1 finger rotate, 2 finger pinch + pan, wheel zoom, right-drag pan
    R.orb = { yaw: Math.PI / 2 - 0.5, pitch: 0.85, dist: 110, tx: 0, ty: 0, tz: 0 }; const P3 = new Map(); let od = null;
    const el = renderer.domElement;
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); P3.set(e.pointerId, [e.clientX, e.clientY]); R.tour = null; emit({ tour: false }); const o = R.orb;
      if (P3.size === 2) { const [a, b] = [...P3.values()]; od = { pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]), dist0: o.dist, m0: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], t0: [o.tx, o.tz] }; }
      else od = { x: e.clientX, y: e.clientY, yaw: o.yaw, pitch: o.pitch, pan: e.button === 2 || e.shiftKey, t0: [o.tx, o.tz] }; });
    el.addEventListener('pointermove', e => { if (!P3.has(e.pointerId) || !od) return; P3.set(e.pointerId, [e.clientX, e.clientY]); const o = R.orb;
      const pan = (dx, dy, t0) => { const k = o.dist / Math.max(ch(), 1) * 1.1, c = Math.cos(o.yaw), s = Math.sin(o.yaw); o.tx = t0[0] - s * dx * k - c * dy * k; o.tz = t0[1] + c * dx * k - s * dy * k; };
      if (od.pinch && P3.size >= 2) { const [a, b] = [...P3.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); o.dist = Math.max(10, Math.min(260, od.dist0 * od.d0 / Math.max(d, 1))); const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; pan(m[0] - od.m0[0], m[1] - od.m0[1], od.t0); return; }
      if (od.pinch) return; const dx = e.clientX - od.x, dy = e.clientY - od.y;
      if (od.pan) pan(dx, dy, od.t0); else { o.yaw = od.yaw - dx * 0.008; o.pitch = Math.max(0.12, Math.min(1.5, od.pitch + dy * 0.006)); } });
    const u3 = e => { P3.delete(e.pointerId); if (!P3.size) od = null; }; el.addEventListener('pointerup', u3); el.addEventListener('pointercancel', u3);
    el.addEventListener('wheel', e => { e.preventDefault(); R.orb.dist = Math.max(10, Math.min(260, R.orb.dist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
  }
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function disposeTree(o) { o.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.isSprite && c.material.map && c.userData.label) { c.material.map.dispose(); c.material.dispose(); } }); }
  function build3() {
    if (!R) init3(); dirty3 = false; const { scene } = R;
    if (R.root) { scene.remove(R.root); disposeTree(R.root); }
    const d = D(), S3 = buildOreLevel(R.K, L, li, { labels, touch }); R.root = S3.root; R.anim = S3.anim; R.bots = S3.bots; scene.add(S3.root); const md = S3.mood; scene.background = new THREE.Color(md.bg); scene.fog = new THREE.Fog(md.bg, 140, 320); R.hemi.color.set(md.hemi);
    const o = R.orb; o.tx = 0; o.tz = 0; o.ty = 0; if (!R.kept) { o.dist = Math.max(d.hw, d.hd) * 2.1 * (cw() < ch() ? 1.6 : 1); R.kept = true; }
  }
  // TOUR: ride the main path from the lift at head height, looking ahead
  function tourPos(p, s) { let acc = 0; for (let i = 0; i < p.pts.length - 1; i++) { const a = p.pts[i], b = p.pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + len >= s) { const k = (s - acc) / len; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; } acc += len; } const q = p.pts[p.pts.length - 1]; return [q[0], q[1]]; }
  let last = performance.now(), T0 = 0;
  function frame() { if (!alive) return; requestAnimationFrame(frame); if (mode === 'plan' || !R) return; const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; T0 += dt;
    for (const f of R.anim) f(T0);
    for (const B of R.bots) { try { poseMachine(B.b, { mode: 'idle', p: 0, speed: 0.3, dt, t: T0 + B.seed, hacked: B.hacked, aim: [B.x + 6, 1.1, B.z] }); B.b.position.set(B.x, B.hy, B.z); } catch (e) {} }
    const o = R.orb, cam = R.cam;
    if (R.tour) { const p = lv().paths[0], len = p.pts.reduce((s, q, i) => i ? s + Math.hypot(q[0] - p.pts[i - 1][0], q[1] - p.pts[i - 1][1]) : 0, 0); R.tour.s += dt * 5; if (R.tour.s > len) R.tour.s = 0; const [x, z] = tourPos(p, R.tour.s), [lx, lz] = tourPos(p, Math.min(len, R.tour.s + 10)), [bx, bz] = tourPos(p, Math.max(0, R.tour.s - 7));
      cam.position.set(bx, 5.5, bz); cam.lookAt(lx, 1.2, lz); void x; void z; }
    else { cam.position.set(o.tx + Math.cos(o.yaw) * Math.cos(o.pitch) * o.dist, o.ty + Math.sin(o.pitch) * o.dist, o.tz + Math.sin(o.yaw) * Math.cos(o.pitch) * o.dist); cam.lookAt(o.tx, o.ty, o.tz); }
    R.renderer.render(R.scene, cam); }
  requestAnimationFrame(frame);
  const ro = new ResizeObserver(() => size()); ro.observe(container);

  const api = {
    get layout() { return L; }, get sel() { return sel; }, get mode() { return mode; },
    set(layout, level) { const lvChanged = level !== li; L = layout; li = level; if (sel && !lv().items.some(i => i.id === sel.id) && !lv().paths.some(p => p.id === sel.id)) sel = null; dirty3 = true; if (lvChanged || !V.inited) { V.inited = true; fit(); } else draw(); if (mode !== 'plan') build3(); },
    setMode(m) { mode = m; if (m !== 'plan') { if (!R) init3(); if (dirty3) build3(); R.renderer.domElement.style.display = 'block'; cv.style.display = 'none'; R.tour = m === 'tour' ? { s: 0 } : null; } else { cv.style.display = 'block'; if (R) R.renderer.domElement.style.display = 'none'; draw(); } },
    setTool(t, m) { tool = t; toolM = m || null; cv.style.cursor = t === 'move' ? 'default' : 'crosshair'; },
    setLabels(b) { labels = b; draw(); dirty3 = true; if (mode !== 'plan') build3(); },
    view(k) { if (!R) return; const o = R.orb; R.tour = null; if (k === 'top') { o.pitch = 1.5; o.yaw = Math.PI / 2; } else { o.pitch = 0.85; o.yaw = Math.PI / 2 - 0.5; } o.tx = o.tz = 0; o.dist = Math.max(D().hw, D().hd) * 2.1 * (cw() < ch() ? 1.6 : 1); },
    fit,
    select(s) { setSel(s); },
    patch(id, o) { const l = lv(), it = l.items.find(i => i.id === id); if (it) { Object.assign(it, o); edited(); return; } const p = l.paths.find(q => q.id === id); if (p) { Object.assign(p, o); edited(); } },
    patchLevel(o) { Object.assign(lv(), o); edited(); },
    remove() { if (!sel) return; const l = lv(); if (sel.type === 'path' && sel.pi >= 0) { const p = l.paths.find(q => q.id === sel.id); if (p && p.pts.length > 2) { p.pts.splice(sel.pi, 1); sel = { ...sel, pi: -1 }; emit({ sel }); edited(); return; } }
      l.items = l.items.filter(i => i.id !== sel.id); l.paths = l.paths.filter(p => p.id !== sel.id); setSel(null); edited(); },
    newPath() { tool = 'path'; setSel(null); emit({ tool }); },
    destroy() { alive = false; ro.disconnect(); removeEventListener('keydown', onKey); if (R) R.renderer.dispose(); container.innerHTML = ''; },
    _R: () => R,
  };
  return api;
}
