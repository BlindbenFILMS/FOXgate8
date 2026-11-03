// s600 FARM BUILDING WORKSHOP: look at the 7 trade-building exteriors (worlds/player-farm-look.js farmShell) on a turntable, one at a time or all in a row.
// Same toon + sign look as the Player Planet; the live yards / animals are not shown here.
import * as THREE from '../vendor/three/three.module.js';
import { SHELL_K, SHELL_SIGN, farmShell } from './player-farm-look.js?v=s601e';
import { CAT } from './player-build.js?v=s601e';
export function startFarmWorkshop(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.shadowMap.enabled = true; renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#9fd0ea'); scene.fog = new THREE.Fog('#cfe6ee', 160, 420);
  const cam = new THREE.PerspectiveCamera(42, 1, 0.5, 900);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5a7a3a, 1.0)); const sun = new THREE.DirectionalLight(0xfff4e0, 1.6); sun.position.set(30, 50, 40); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 200 }); scene.add(sun); scene.add(sun.target);
  const gc = document.createElement('canvas'); gc.width = 4; gc.height = 1; const gx = gc.getContext('2d'); ['#777', '#aaa', '#ddd', '#fff'].forEach((c, i) => { gx.fillStyle = c; gx.fillRect(i, 0, 1, 1); });
  const grad = new THREE.CanvasTexture(gc); grad.minFilter = grad.magFilter = THREE.NearestFilter; const cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; };
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const gt = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glowSprite = (x, y, z, color, size, op = 0.8, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; };
  const signTex = (text, bg = '#201e1d', fg = '#f3f2f2', w = 1024, h = 256, sub) => { const c = document.createElement('canvas'); c.width = w; c.height = Math.max(128, h); const x = c.getContext('2d'), Hh = c.height;
    x.fillStyle = bg; x.fillRect(0, 0, w, Hh); x.strokeStyle = fg; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, Hh - 14); let fs = Hh * (sub ? 0.44 : 0.6); const setF = (wt, s) => { x.font = `${wt} ${s}px Archivo, sans-serif`; };
    setF(900, fs); while (x.measureText(text).width > w - 80 && fs > 18) { fs -= 3; setF(900, fs); } x.fillStyle = fg; x.textBaseline = 'middle'; x.fillText(text, 40, sub ? Hh * 0.36 : Hh * 0.53);
    if (sub) { let f2 = Hh * 0.2; setF(800, f2); while (x.measureText(sub).width > w - 80 && f2 > 12) { f2 -= 2; setF(800, f2); } x.fillStyle = '#ec3013'; x.fillText(sub, 40, Hh * 0.74); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const sign = (parent, text, w, h, x, y, z, ry = 0, o = {}) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); M(BOX(w + 0.4, h + 0.4, 0.25), toon('#201e1d'), 0, 0, -0.08, g);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(text, o.bg, o.fg, 1024, Math.round(1024 * h / w), o.sub), toneMapped: false })); p.position.z = 0.06; g.add(p); return g; };
  const FX = [], X = { THREE, M, BOX, toon, glowSprite, FX };
  const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 48), toon('#6ab84e')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(1, 40), toon('#a8a49e')); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.02; pad.receiveShadow = true; scene.add(pad);
  // one building, built the way player-build finish() builds it (foundation + roof sign on posts + door sign + the shell)
  function build(k) { const C = CAT[k], [w, d, h] = C.size, ss = SHELL_SIGN[k](w, d, h), g = new THREE.Group(); g.position.y = 0.3; scene.add(g);
    M(BOX(w + 0.8, 0.6, d + 0.8), toon('#8a7a62'), 0, 0, 0, g);
    const SW = Math.min(w * 0.7, 26); sign(g, C.name, SW, SW / 5, 0, ss.y, ss.z, 0, { bg: '#201e1d', fg: '#f3f2f2' });
    const ph = ss.y - ss.base; for (const s of [-1, 1]) M(BOX(0.3, ph, 0.3), toon('#201e1d'), s * Math.min(w * 0.3, 11), ss.base + ph / 2, ss.z - 0.2, g);
    sign(g, C.name, 3.6, 1.2, 3.4, 2.2, d / 2 + 0.25, 0, { sub: 'BUILT HERE' });
    farmShell(X, k, g, w, d, h); return { g, w, d, h: Math.max(h * (k === 'kiln' ? 1.45 : 1), ss.y + 1) }; }
  let shown = [], sel = SHELL_K[0], all = false, yaw = 0.35, pitch = 0.32, zoom = 1, spin = true, focus = { r: 20, y: 5 };
  function show() { for (const s of shown) scene.remove(s.g); shown = []; FX.length = 0;
    if (all) { let x = 0; const L = SHELL_K.map(k => build(k)); const tot = L.reduce((a, b) => a + b.w + 10, -10); x = -tot / 2; L.forEach(b => { b.g.position.x = x + b.w / 2; x += b.w + 10; }); shown = L; focus = { r: tot * 0.9, y: 6, all: tot }; yaw = 0; pitch = 0.3; spin = false; pad.scale.setScalar(0.001); }
    else { const b = build(sel); shown = [b]; focus = { r: Math.max(b.w, b.d, b.h) * 2.1 + 10, y: b.h * 0.42 }; pad.scale.setScalar(Math.hypot(b.w, b.d) / 2 + 6); } }
  show();
  // drag = orbit, wheel / pinch = zoom
  const pts = new Map(); let pinch0 = 0, z0 = 1;
  el.addEventListener('pointerdown', e => { pts.set(e.pointerId, [e.clientX, e.clientY]); el.setPointerCapture && el.setPointerCapture(e.pointerId); spin = false; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = zoom; } });
  el.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId); if (pts.size === 1) { yaw -= (e.clientX - p[0]) * 0.008; pitch = Math.max(0.04, Math.min(1.3, pitch + (e.clientY - p[1]) * 0.006)); } pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; zoom = Math.max(0.35, Math.min(2.5, z0 * pinch0 / Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1])))); } });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(0.35, Math.min(2.5, zoom * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf = 0, last = performance.now(), T = 0;
  const frame = t => { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; T += dt; if (spin) yaw += dt * 0.18; for (const f of FX) f(dt, T, 1);
    const port = cam.aspect < 1, hf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect, r = (focus.all ? (focus.all / 2 + 4) / hf : focus.r * (port ? 1.6 : 1)) * zoom; cam.position.set(Math.sin(yaw) * Math.cos(pitch) * r, focus.y + Math.sin(pitch) * r, Math.cos(yaw) * Math.cos(pitch) * r); cam.lookAt(0, focus.y, 0); renderer.render(scene, cam); };
  raf = requestAnimationFrame(frame);
  return { keys: SHELL_K, name: k => CAT[k].name, why: k => CAT[k].why, size: k => CAT[k].size,
    pick(k) { sel = k; all = false; show(); }, showAll() { all = true; show(); }, front() { yaw = 0; pitch = 0.22; spin = false; }, toggleSpin() { spin = !spin; return spin; },
    setTime(day) { scene.background.set(day ? '#9fd0ea' : '#1a2238'); sun.intensity = day ? 1.6 : 0.25; scene.children.forEach(o => { if (o.isHemisphereLight) o.intensity = day ? 1.0 : 0.35; }); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.innerHTML = ''; } };
}
