// PAINT TOGETHER (Ben, 28 Oct): a big shared canvas on the plaza. Each fox paints in its own colour, everyone sees strokes live
// (net.event k 'pnt': s = stroke, ask / st = catch up), and it clears on the hour. Walk up → ACTIONS → PAINT.
import { planGarden, inBuilding, GARDEN } from './gallery-garden-plan.js';
const COLS = ['#ec3013', '#ffd400', '#1f6fff', '#19a34a', '#ff7a00', '#9b30ff', '#00b8c4', '#ff4fa3'];
// (Ben, 28 Oct) on the grass, in front of nothing: the open lawn spot nearest the plaza that is 3-6 m off a walk, 5 m+ clear of trees,
// poles, benches, buildings, the river and the art corner, turned to face its walk
export function pickPaintSpot() {
  const P = planGarden(), far = (L, x, z, r) => L.every(t => Math.hypot(t[0] - x, t[1] - z) >= r);
  let best = null, bd = 1e9;
  for (let x = GARDEN.x0 + 6; x < GARDEN.x1 - 6; x += 1) for (let z = GARDEN.z0 + 6; z < GARDEN.z1 - 6; z += 1) {
    const pd = P.pathDist(x, z); if (pd < 3 || pd > 6) continue;
    if (x < 10 && Math.abs(z) < 17) continue;                                   // the plaza
    if (x > 23 && x < 33 && z > 26 && z < 44) continue;                          // the art corner easels
    if (Math.hypot(x - 67.3, z - 36.2) < 8 || P.riverDist(x, z) < 6 || inBuilding(x, z, 5)) continue;
    if (!far(P.trees, x, z, 5.5) || !far(P.poles, x, z, 4.5) || !far(P.benches, x, z, 5)) continue;
    const d = Math.hypot(x, z); if (d < bd) { bd = d; best = { x, z }; }
  }
  if (!best) best = { x: 2, z: -9.6 };
  const e = 0.5, gx = P.pathDist(best.x + e, best.z) - P.pathDist(best.x - e, best.z), gz = P.pathDist(best.x, best.z + e) - P.pathDist(best.x, best.z - e);
  best.face = Math.atan2(-gx, -gz); return best;
}
export function setupPaint({ G, net, announce, nameOf }) {
  const PAINT_AT = { x: -9.0, z: -53.0, face: 0.785 }; let open_ = false;   // (Ben) a little closer to the museum + turned a little toward the start platform let open_ = false;   // (Ben, 28 Oct) where Blindness Tip 1 stood, facing the south walk
  const THREE = G.world.THREE, scene = G.world.scene;
  const ink = '#201e1d', bg = '#f3f2f2', CW = 1600, CH = 900, WW = 6.4, WH = 3.6;
  const HR = 3600000, hourNow = () => window.GSES ? window.GSES.slot(HR) : Math.floor(Date.now() / HR);
  let hour = hourNow(), strokes = [];
  try { const s = JSON.parse(localStorage.getItem('gallery.paint.v3') || 'null'); if (s && s.h === hour) strokes = s.k || []; } catch (e) {}
  let mine = localStorage.getItem('gallery.paintCol'); if (!COLS.includes(mine)) { mine = COLS[Math.floor(Math.random() * COLS.length)]; localStorage.setItem('gallery.paintCol', mine); }
  let size = 14;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8; if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  function blank() { cx.fillStyle = '#fff'; cx.fillRect(0, 0, CW, CH);
    if (strokes.length) return;   // (Ben) the invite goes away once someone starts painting
    cx.fillStyle = '#201e1d'; cx.textBaseline = 'middle'; cx.textAlign = 'center'; cx.font = '900 132px Archivo, sans-serif';
    ['PAINT your ART HERE', 'with A FRIEND', 'in real time.'].forEach((t, i) => cx.fillText(t, CW / 2, 230 + i * 220)); cx.textAlign = 'left'; }
  function seg(s) { cx.strokeStyle = s[0]; cx.lineWidth = s[1]; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(s[2] * CW, s[3] * CH); for (let i = 4; i < s.length; i += 2) cx.lineTo(s[i] * CW, s[i + 1] * CH); cx.stroke(); }
  function redraw() { blank(); strokes.forEach(seg); tex.needsUpdate = true; pv(); }
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem('gallery.paint.v3', JSON.stringify({ h: hour, k: strokes.slice(-1500) })); } catch (e) {} }, 800); };
  function add(s, live) { const first = !strokes.length; strokes.push(s); if (first) { redraw(); if (live) save(); return; } if (strokes.length > 3000) strokes.shift(); seg(s); tex.needsUpdate = true; pv(); if (live) save(); }
  // ---- the canvas on the plaza: an ink frame on two legs, a sign on top
  const g = new THREE.Group(); g.position.set(PAINT_AT.x, G.world.groundAt ? (G.world.groundAt(PAINT_AT.x, 5, PAINT_AT.z) || 0) : 0, PAINT_AT.z); g.rotation.y = PAINT_AT.face;
  const inkM = new THREE.MeshLambertMaterial({ color: ink });
  const fr = new THREE.Mesh(new THREE.BoxGeometry(WW + 0.3, WH + 0.3, 0.12), inkM); fr.position.y = 0.9 + WH / 2; g.add(fr);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshBasicMaterial({ map: tex })); face.position.set(0, 0.9 + WH / 2, 0.065); g.add(face);
  for (const x of [-WW / 2 + 0.3, WW / 2 - 0.3]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.16), inkM); l.position.set(x, 0.45, 0); g.add(l); }
  const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 160; const sx = sc.getContext('2d');
  sx.fillStyle = ink; sx.fillRect(0, 0, 1024, 160); sx.fillStyle = bg; sx.font = '800 92px Archivo, sans-serif'; sx.textBaseline = 'middle'; sx.fillText('PAINT TOGETHER', 40, 84);
  sx.fillStyle = '#ec3013'; sx.fillRect(40, 140, 160, 10);
  const st = new THREE.CanvasTexture(sc); if (THREE.SRGBColorSpace) st.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.625), new THREE.MeshBasicMaterial({ map: st })); sign.position.set(-WW / 2 + 2 + 0.15, 0.9 + WH + 0.15 + 0.33, 0.07); g.add(sign);
  const back = sign.clone(); back.rotation.y = Math.PI; back.position.z = -0.07; back.position.x = -back.position.x; g.add(back);
  scene.add(g); redraw();
  const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), PAINT_AT.face);
  G.world.addNear(Pl => { const dx = Pl.x - PAINT_AT.x, dz = Pl.z - PAINT_AT.z, along = Math.abs(dx * front.z - dz * front.x), out = dx * front.x + dz * front.z;
    return along < WW / 2 + 0.6 && out > -0.4 && out < 3.2 ? { kind: 'paint', item: null, label: 'Paint together' } : null; });
  // ---- the hourly clear
  G.world.onTick(() => { const h = hourNow(); if (h !== hour) { hour = h; strokes = []; redraw(); save(); if (open_) announce('The hour struck: the big canvas is clean again'); } });
  // ---- network
  function onEvent(id, d) {
    if (!d || d.k !== 'pnt') return;
    if (d.a === 's' && Array.isArray(d.s) && d.h === hour) add(d.s, true);
    else if (d.a === 'ask' && strokes.length) net.event({ k: 'pnt', a: 'st', v: 3, h: hour, all: strokes.slice(-1500) }, id);
    else if (d.a === 'st' && d.v === 3 && d.h === hour && Array.isArray(d.all) && d.all.length > strokes.length) { strokes = d.all.slice(); redraw(); save(); }
  }
  setTimeout(() => { if (net) net.event({ k: 'pnt', a: 'ask' }); }, 2500);
  // ---- the painting panel (dark, Modernist, phone first)
  const el = document.createElement('div'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Paint together');
  el.style.cssText = `position:fixed;inset:0;z-index:9000;display:none;background:${ink};color:${bg};font-family:Archivo,sans-serif;padding:max(10px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-sizing:border-box;flex-direction:column;gap:10px`;
  for (const ev of ['pointerdown', 'touchstart', 'wheel', 'keydown']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  document.body.appendChild(el);
  const btn = `min-height:44px;min-width:44px;padding:0 14px;border:2px solid ${bg};background:${ink};color:${bg};font:700 15px Archivo,sans-serif;text-align:left;letter-spacing:.04em;cursor:pointer;border-radius:0`;
  el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center">
    <div style="display:flex;flex-direction:column;gap:2px;flex:1 1 170px"><div style="font:700 12px Archivo;letter-spacing:.12em;color:#ffd400">PAINT TOGETHER · CLEARS EVERY HOUR</div>
    <div style="font:800 18px Archivo" data-t></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap" data-cols></div>
    <div style="display:flex;gap:8px"><button data-z="7" style="${btn}">THIN</button><button data-z="14" style="${btn}">MID</button><button data-z="30" style="${btn}">THICK</button>
    <button data-x style="${btn};border-color:#ec3013">CLOSE ✕</button></div></div>
    <div data-wrap style="flex:1;min-height:0;display:flex;align-items:flex-start;justify-content:flex-start"><canvas data-c style="border:2px solid ${bg};touch-action:none;background:#fff;max-width:100%;max-height:100%;aspect-ratio:16/9;display:block"></canvas></div>`;
  const pc = el.querySelector('[data-c]'); pc.width = CW / 2; pc.height = CH / 2; const px = pc.getContext('2d');
  function pv() { if (!open_) return; if (strokes.length) px.drawImage(cv, 0, 0, pc.width, pc.height); else { px.fillStyle = '#fff'; px.fillRect(0, 0, pc.width, pc.height); } }   // (Ben) no invite text in full screen
  const cols = el.querySelector('[data-cols]');
  function ui() {
    const mins = Math.max(1, Math.ceil((window.GSES ? window.GSES.left(HR) : HR - Date.now() % HR) / 60000)); el.querySelector('[data-t]').textContent = 'Your colour · clean in ' + mins + ' min';
    cols.innerHTML = COLS.map(c => `<button data-col="${c}" aria-label="Colour ${c}" aria-pressed="${c === mine}" style="width:44px;height:44px;padding:0;border:${c === mine ? 4 : 2}px solid ${c === mine ? bg : '#6b6766'};background:${c};cursor:pointer;border-radius:0"></button>`).join('');
    cols.querySelectorAll('button').forEach(b => b.onclick = () => { mine = b.dataset.col; localStorage.setItem('gallery.paintCol', mine); ui(); });
    el.querySelectorAll('[data-z]').forEach(b => { const on = +b.dataset.z === size; b.style.background = on ? bg : ink; b.style.color = on ? ink : bg; b.onclick = () => { size = +b.dataset.z; ui(); }; });
  }
  el.querySelector('[data-x]').onclick = () => close();
  let cur = null, sendT = 0;
  const pt = e => { const r = pc.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))].map(v => Math.round(v * 1000) / 1000); };
  const flush = () => { if (!cur || cur.length < 6) return; const s = cur.slice(); add(s, true); if (net) net.event({ k: 'pnt', a: 's', h: hour, s }); const l = cur.slice(-2); cur = [mine, size, ...l]; };
  pc.addEventListener('pointerdown', e => { pc.setPointerCapture(e.pointerId); cur = [mine, size, ...pt(e)]; const p = pt(e); cur.push(p[0] + 0.0005, p[1]); flush(); });
  pc.addEventListener('pointermove', e => { if (!cur) return; cur.push(...pt(e)); if (cur.length >= 14) flush(); else { clearTimeout(sendT); sendT = setTimeout(flush, 60); } });
  const up = () => { flush(); cur = null; }; pc.addEventListener('pointerup', up); pc.addEventListener('pointercancel', up);
  function fit() { const w = el.querySelector('[data-wrap]'); const r = w.getBoundingClientRect(); const k = Math.min(r.width / 16, r.height / 9); pc.style.width = Math.floor(k * 16) + 'px'; pc.style.height = Math.floor(k * 9) + 'px'; }
  function open() { open_ = true; el.style.display = 'flex'; ui(); fit(); pv(); G.setBusy && G.setBusy(true); el.querySelector('[data-x]').focus(); }
  function close() { open_ = false; el.style.display = 'none'; G.setBusy && G.setBusy(false); }
  addEventListener('resize', () => { if (open_) fit(); });
  addEventListener('keydown', e => { if (open_ && e.key === 'Escape') close(); });
  return { open, close, onEvent, isOpen: () => open_ };
}
