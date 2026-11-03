// s662t FOX PROPORTIONS LAB (Ben: "with the new arm length, what would Hope + the other foxes look like with legs and body to match?")
// Jointed foxes got arms 30 % longer (fox-kit ARMK 1.3). This shows the cast at 4 builds side by side, nothing in the game changes:
//   A NOW (legs 1.5) · B LONGER LEGS (1.85) · C LEGS + TORSO (legs 1.75, torso +18 %) · D TALL HERO (legs 1.85, torso +22 %, head 92 %)
// Each row = PLAYER, HOPE (with her cane), and an unjointed town fox (short arms) for comparison. Drag to turn, scroll / pinch to zoom.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit, PLAYER_FEMALE } from '../fox-kit.js';
import { castKit, loadCastRigs, CAST } from './cast.js';
export const BUILDS = [
  { key: 'now', name: 'A · OLD', legs: 1.5, torso: 1, head: 1 },
  { key: 'legs', name: 'B · LONGER LEGS', legs: 1.85, torso: 1, head: 1 },
  { key: 'both', name: 'C · LEGS + TORSO', legs: 1.75, torso: 1.18, head: 1 },
  { key: 'hero', name: 'D · TALL HERO ✓', legs: 1.85, torso: 1.22, head: 0.92 }];
export async function startPropLab(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-3, 8, 6); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: false });
  const rigs = await loadCastRigs().catch(() => ({}));
  const label = txt => { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#f3f2f2'; x.font = '800 44px Archivo, Arial, sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(txt, 256, 50);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.set(2.2, 0.41, 1); return s; };
  // TORSO STRETCH: everything on the body between the hips and the shoulders stretches by k; the head, arms + anything above the shoulders move up
  function stretch(fox, b) { const P = fox.userData.P, B = P.body; if (!P || !B) return; const hip = P.legs[0].position.y, sh = P.arms[0].position.y, up = (b.torso - 1) * (sh - hip);
    const limbs = new Set([...P.legs, ...P.arms, P.head, P.tail].filter(Boolean));
    for (const c of B.children) { if (limbs.has(c)) { if (c !== P.tail && !P.legs.includes(c)) c.position.y += up; continue; }
      const y = c.position.y; if (y > hip - 0.08 && y < sh + 0.06) { c.position.y = hip + (y - hip) * b.torso; c.scale.y *= b.torso; } else if (y >= sh + 0.06) c.position.y += up; }
    if (P.head) P.head.scale.multiplyScalar(b.head); }
  const rows = [], GAP = 1.5, ROWZ = 0;
  const casts = BUILDS.map(b => castKit({ THREE, M, toon, makeFox: o => kit.makeFox({ ...o, look: { ...(o.look || {}), legLength: b.legs, heroBuild: false } }) }, rigs));
  BUILDS.forEach((b, i) => { const C = casts[i], x = (i - 1.5) * GAP * 2.2;
    const pl = C.make('player', { holster: true }), hp = C.make('hope'), npc = kit.makeFox({ key: 'propTown' + i, torso: ['#2f7de1', '#e0f2fe', '#1e3a8a'], crest: 'M', look: { ...PLAYER_FEMALE, legLength: b.legs, heroBuild: false } });
    [pl, hp, npc].forEach((f, j) => { stretch(f, b); f.position.set(x + (j - 1) * 0.95, 0, ROWZ); f.rotation.y = 0; scene.add(f); });
    const hl = label(''); hl.visible = false;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.6), new THREE.MeshBasicMaterial({ color: '#2e2a28' })); fl.rotation.x = -Math.PI / 2; fl.position.set(x, 0.003, 0); scene.add(fl);
    const lb = label(b.name); lb.position.set(x, 3.4, 0); scene.add(lb);
    rows.push({ b, foxes: [pl, hp, npc], x }); });
  // a 1 m grid line behind each group: shows the height change
  for (let h = 0.5; h <= 3; h += 0.5) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(GAP * 2.2 * 4, 0.006), new THREE.MeshBasicMaterial({ color: h % 1 ? '#3a3633' : '#5a5551' })); ln.position.set(0, h, -0.7); scene.add(ln); }
  let yaw = 0, zoom = 1, drag = null, pinch = 0, raf = 0, last = performance.now(), walk = false, focus = -1;
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; }); el.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(0.25, Math.min(1.6, zoom * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  el.addEventListener('touchmove', e => { if (e.touches.length !== 2) return; const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) zoom = Math.max(0.25, Math.min(1.6, zoom * pinch / d)); pinch = d; }, { passive: true });
  el.addEventListener('touchend', () => { pinch = 0; });
  const pu = () => { drag = null; }, pm = e => { if (drag == null) return; yaw -= (e.clientX - drag) * 0.01; drag = e.clientX; }; addEventListener('pointerup', pu); addEventListener('pointermove', pm);
  function place() { const port = cam.aspect < 0.9, cx = focus >= 0 ? rows[focus].x : 0, w = focus >= 0 ? 3.2 : GAP * 2.2 * 4;
    const fovH = 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * cam.aspect), d = Math.max((w / 2 + 0.3) / Math.tan(fovH / 2), focus >= 0 ? (port ? 8 : 6.8) : (port ? 9 : 7.5)) * zoom;
    cam.position.set(cx + Math.sin(yaw) * d, 1.7, Math.cos(yaw) * d); cam.lookAt(cx, 1.5, 0); }
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; place();
    for (const r of rows) for (const f of r.foxes) { kit.animFox(f, dt, walk ? 1.6 : 0, false); }
    renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  return { builds: BUILDS, focus(i) { focus = i; zoom = 1; }, get focused() { return focus; }, walk() { walk = !walk; return walk; }, turn(a) { yaw = 0; for (const r of rows) for (const f of r.foxes) f.rotation.y = a; },
    heights: () => rows.map(r => r.foxes.map(f => { const b = new THREE.Box3().setFromObject(f); return +(b.max.y - b.min.y).toFixed(2); })),
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', pu); removeEventListener('pointermove', pm); renderer.dispose(); } };
}
