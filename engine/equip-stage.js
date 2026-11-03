// EQUIPABLE screen stage (Bag mock-up, s608): the player spinning on a dark plinth, with what you equip shown on the body.
// api: setOutfit({ outfit, torso }), setWeapon('sword' | 'halberd' | 'none'), setJewel(hex | null), setCharm(slot 2-4, id | null), destroy()
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs, CAST } from './cast.js?v=s339c';
import { dressArmor, tickArmor, fullHelm } from './armor-sets.js';   // Armor Workshop sets
import { loadBackFit, mountBackWeapon, mountRanged, tickBackWeapons } from './back-weapons.js?v=s339z2';   // the Back Weapons Lab weapons + fits
export async function startEquipStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 48), new THREE.MeshBasicMaterial({ color: '#2e2a28' })); plinth.position.y = -0.06; scene.add(plinth);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.16, 64), new THREE.MeshBasicMaterial({ color: '#ec3013', side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.005; scene.add(ring);
  let FX = -0.32;
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const S = { outfit: null, melee: 'sword', ranged: 'laser', jewel: null, charms: {} }, WK = { THREE, M, toon }; let fit = loadBackFit();
  let fox = null, H = 2, F = 0.3, extras = null;
  // ---- small models for what you wear ----
  const gem = c => { const g = new THREE.Group(); M(new THREE.OctahedronGeometry(0.075, 0), toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.55 }), 0, 0, 0, g, 0.012, 0.075); return g; };
  const CHARM = {
    luckyGolfBall: () => { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 4), toon('#201e1d'), 0, 0.06, 0, g, 0); M(new THREE.SphereGeometry(0.055, 14, 10), toon('#ffffff'), 0, -0.03, 0, g, 0.012, 0.055); return g; },
    loyaltyCard: () => { const g = new THREE.Group(); const c = M(new THREE.BoxGeometry(0.16, 0.1, 0.012), toon('#ec3013'), 0, 0, 0, g, 0.01); M(new THREE.BoxGeometry(0.12, 0.02, 0.004), toon('#f3f2f2'), 0, 0.015, 0.008, c, 0); return g; },
    cocoaCharm: () => { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.035, 10, 8), toon('#6b3a1f'), -0.028, 0.02, 0, g, 0.01, 0.035); M(new THREE.SphereGeometry(0.035, 10, 8), toon('#6b3a1f'), 0.028, 0.02, 0, g, 0.01, 0.035); const c = M(new THREE.ConeGeometry(0.06, 0.08, 10), toon('#6b3a1f'), 0, -0.03, 0, g, 0.01, 0.05); c.rotation.z = Math.PI; return g; },
    luckyThread: () => { const g = new THREE.Group(); const t = M(new THREE.TorusGeometry(0.06, 0.012, 6, 18), toon('#ec3013'), 0, 0, 0, g, 0); t.rotation.x = Math.PI / 2; return g; },
    stickerPack: () => { const g = new THREE.Group(); const s = M(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16), toon('#d9b24a'), 0, 0, 0, g, 0.01); s.rotation.x = Math.PI / 2; return g; },
  };
  // where each slot sits on the body (fraction of height, sideways, front)
  const SLOT = { 2: [0.8, -0.24, 0.33], 3: [0.8, 0.24, 0.33], 4: [1.05, 0.22, 0.32] };   // fox body-local: y, x, front z
  function dress() {
    const host = (fox.userData.P && fox.userData.P.body) || fox; if (extras && extras.parent) extras.parent.remove(extras); extras = new THREE.Group(); host.add(extras);
    if (S.jewel) { const j = gem(S.jewel); j.position.set(0, 1.14, 0.36); j.scale.setScalar(1.3); extras.add(j); extras.userData.jewel = j; }
  }
  // ---- 3 static DISPLAY BOXES (charm slots 2-4): a bigger copy of each equipped charm turns inside; the crest jewel has no box (always on the fox) ----
  const BOX = 0.54, NW = 0.74, edgeMat = new THREE.LineBasicMaterial({ color: '#f3f2f2' }), boxMat = new THREE.MeshBasicMaterial({ color: '#2e2a28' });
  const numTex = n => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#201e1d'; g.font = '900 46px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(String(n), 16, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const cases = [2, 3, 4].map((k, i) => { const g = new THREE.Group(); g.position.set(0.98, 1.72 - i * 0.66, 0); scene.add(g);
    const back = new THREE.Mesh(new THREE.BoxGeometry(BOX, BOX, BOX), boxMat); g.add(back); back.scale.set(1, 1, 0.02); back.position.z = -BOX / 2;
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX, BOX, BOX)), edgeMat));
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.13), new THREE.MeshBasicMaterial({ map: numTex(i + 1) })); tag.position.set(-BOX / 2 + 0.065, BOX / 2 - 0.065, BOX / 2 + 0.001); g.add(tag);
    const hold = new THREE.Group(); g.add(hold);
    const nc = document.createElement('canvas'); nc.width = 256; nc.height = 64; const ntx = new THREE.CanvasTexture(nc); ntx.colorSpace = THREE.SRGBColorSpace;
    const name = new THREE.Mesh(new THREE.PlaneGeometry(NW, NW / 4), new THREE.MeshBasicMaterial({ map: ntx, transparent: true })); name.position.set(NW / 2 - BOX / 2, -BOX / 2 - 0.12, BOX / 2); g.add(name);
    return { k, g, hold, id: undefined, nc, ntx }; });
  const NAMES = { luckyGolfBall: 'GOLF BALL', loyaltyCard: 'LOYALTY CARD', cocoaCharm: 'COCOA CHARM', luckyThread: 'LUCKY THREAD', stickerPack: 'STICKERS' };
  const writeName = (c, txt) => { const g = c.nc.getContext('2d'); g.clearRect(0, 0, 256, 64); g.fillStyle = txt ? '#f3f2f2' : '#8a8380'; g.font = '900 30px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(txt || 'EMPTY', 2, 34); c.ntx.needsUpdate = true; };
  const label = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f3f2f2'; g.font = '900 44px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('CHARMS', 0, 34); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.18), new THREE.MeshBasicMaterial({ map: tx, transparent: true })); scene.add(m); return m; })();
  function showcase() { for (const c of cases) { const id = S.charms[c.k] || null; if (c.id === id) continue; c.id = id; c.hold.clear(); writeName(c, id ? NAMES[id] || id : '');
    if (!id || !CHARM[id]) continue; const m = CHARM[id](), piv = new THREE.Group(); piv.add(m); m.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(m), ctr = new THREE.Vector3(), sz = new THREE.Vector3(); b.getCenter(ctr); b.getSize(sz); m.position.sub(ctr);
    piv.scale.setScalar((BOX * 0.68) / Math.max(sz.x, sz.y, sz.z, 0.01)); c.hold.add(piv); } }
  function arm() { try { mountBackWeapon(WK, fox, S.melee, fit[S.melee]); } catch (e) { console.warn(e); }
    try { const G = fox.userData.rig; if (S.ranged === 'none') { mountRanged(WK, fox, 'laser', fit.laser); if (G && G.hipAnchor) G.hipAnchor.visible = false; } else mountRanged(WK, fox, S.ranged, fit[S.ranged]); } catch (e) { console.warn(e); } }
  function build() {
    if (fox) scene.remove(fox);
    const { set: aSet, ...oo } = S.outfit || {}; if (aSet && (fullHelm(aSet) || aSet.accent)) oo.look = { ...CAST.player.look, ...(fullHelm(aSet) ? { headTuft: 0 } : {}), ...(aSet.accent ? { armorAccent: aSet.accent } : {}) }; fox = cast.make('player', { ...oo, holster: true }); scene.add(fox); arm(); if (aSet) try { dressArmor(WK, fox, aSet); } catch (e) { console.warn(e); }
    const b = new THREE.Box3().setFromObject(fox), sz = new THREE.Vector3(); b.getSize(sz); H = sz.y || 2; F = Math.max(0.2, b.max.z * 0.62);
    dress(); showcase();
  }
  build();
  let yaw = 0.5, spin = 0.5, drag = null, dragV = 0, raf = 0, last = performance.now(), t0 = 0;
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; dragV = 0; });
  const up = () => { if (drag != null) spin = clamp(dragV * 0.6, -3, 3); drag = null; }, mv = e => { if (drag == null) return; const dx = e.clientX - drag; yaw += dx * 0.012; dragV = dx * 0.012 * 60; drag = e.clientX; };
  addEventListener('pointerup', up); addEventListener('pointermove', mv);
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; t0 += dt;
    if (drag == null) { spin += (0.5 - spin) * Math.min(1, dt * 0.8); yaw += spin * dt; }
    fox.rotation.y = yaw; kit.animFox(fox, dt, 0, false); tickBackWeapons(t0); tickArmor(fox, t0); if (extras && extras.userData.jewel) extras.userData.jewel.rotation.y += dt * 2; cases.forEach(c => { c.hold.rotation.y += dt * 0.9; });
    const d = H / (0.86 * 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    cam.position.set(0.12, H * 0.54, d); cam.lookAt(0.12, H * 0.5, 0);
    { const th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), halfH = d * th, halfW = halfH * cam.aspect, cx = 0.12, cy = H * 0.5;
      const top = cy + halfH - 0.06, bottom = cy - halfH + 0.02, pitch = (top - 0.26 - bottom) / 3, s = Math.min(1, pitch * 0.94 / (BOX + 0.24)), x = cx + halfW - 0.06 - (NW - BOX / 2) * s;
      cases.forEach((c, i) => { c.g.scale.setScalar(s); c.g.position.set(x, top - 0.26 - pitch * i - BOX / 2 * s, 0); });
      label.scale.setScalar(s); label.position.set(x + (0.36 - BOX / 2) * s, top - 0.08, 0);
      FX = ((cx - halfW) + (x - BOX / 2 * s)) / 2; fox.position.x = FX; plinth.position.x = FX; ring.position.x = FX; } renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  return {
    setOutfit(o) { S.outfit = o; build(); }, setMelee(k) { S.melee = k; arm(); }, setRanged(k) { S.ranged = k; arm(); }, setJewel(c) { S.jewel = c; dress(); },
    setCharm(slot, id) { S.charms[slot] = id; dress(); showcase(); }, charmIds: Object.keys(CHARM),
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', up); removeEventListener('pointermove', mv); renderer.dispose(); el.innerHTML = ''; },
  };
}
