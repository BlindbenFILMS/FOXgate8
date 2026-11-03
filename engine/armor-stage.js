// Armor Workshop stage (s608): one fox (or two side by side to compare) wearing armour sets from engine/armor-sets.js.
// api: show(who, setA, setB|null) rebuilds the foxes · dress(setA, setB) re-straps the parts only (cheap, for sliders) · view(k) · destroy()
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs, CAST } from './cast.js?v=s339c';
import { armorOutfit, dressArmor, tickArmor, humanCfg } from './armor-sets.js';
import { humanKit, HUMAN_PRESETS } from './human-kit.js';
export async function startArmorStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const WK = { THREE, M, toon }; const HK = humanKit({ THREE, grad });
  const plinth = () => { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 48), new THREE.MeshBasicMaterial({ color: '#2e2a28' })); p.position.y = -0.05; g.add(p);
    const r = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.0, 64), new THREE.MeshBasicMaterial({ color: '#ec3013', side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = 0.004; g.add(r); scene.add(g); return g; };
  const slots = [{ fox: null, base: plinth() }, { fox: null, base: plinth() }];
  let who = 'player', yaw = 0.4, spin = 0, spinOn = false, drag = null, dragV = 0, raf = 0, last = performance.now(), t0 = 0, two = false, H = 2;
  let lookId = null, JF = null, jOn = false;
  async function jointed(on) { jOn = !!on; if (jOn && !JF && who !== 'bensumo') { const m = await import('../FOXFIGHTERS-FINAL/FoxFighters/minigames/kyoto/duel-foxes.js'); JF = m.foxFighter({ THREE, kit, M, toon }, who === 'hope' || who === 'noble' ? who : 'player'); JF.base = plinth(); scene.add(JF.g); }
    if (JF) { JF.g.visible = jOn; JF.base.visible = jOn; } layout(); return !!JF; }
  function dropJ() { if (!JF) return; scene.remove(JF.g); scene.remove(JF.base); JF = null; } function make(i, set) { const S = slots[i]; if (S.fox) scene.remove(S.fox); S.fox = null; if (!set) return;
    if (who === 'bensumo') { S.fox = HK.make(humanCfg(HUMAN_PRESETS, set, lookId)); S.human = true; scene.add(S.fox); } else { S.human = false;
    S.fox = cast.make(who, { ...armorOutfit(set, CAST[who] && CAST[who].look), gear: 'none' }); scene.add(S.fox); dressArmor(WK, S.fox, set); }
    const b = new THREE.Box3().setFromObject(S.fox), sz = new THREE.Vector3(); b.getSize(sz); H = Math.max(H * 0, sz.y || 2); }
  function layout() { const gap = who === 'bensumo' ? 1.6 : 1.25, n = (two ? 2 : 1) + (jOn && JF ? 1 : 0), x0 = -(n - 1) * gap; if (JF) { JF.g.position.x = JF.base.position.x = x0 + (n - 1) * 2 * gap; }
    slots.forEach((S, i) => { const x = x0 + i * 2 * gap, on = i === 0 || two; S.base.visible = on; S.base.position.x = x; if (S.fox) { S.fox.visible = on; S.fox.position.x = x; } }); }
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; dragV = 0; });
  const up = () => { if (drag != null) spin = clamp(dragV * 0.6, -3, 3); drag = null; }, mv = e => { if (drag == null) return; const dx = e.clientX - drag; yaw += dx * 0.012; dragV = dx * 0.012 * 60; drag = e.clientX; };
  addEventListener('pointerup', up); addEventListener('pointermove', mv);
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; t0 += dt;
    if (drag == null) { spin += ((spinOn ? 0.35 : 0) - spin) * Math.min(1, dt * 2); yaw += spin * dt; }
    for (const S of slots) if (S.fox && S.fox.visible) { S.fox.rotation.y = yaw; if (S.human) HK.update(S.fox, HK.restPose(S.fox), dt); else { kit.animFox(S.fox, dt, 0, false); tickArmor(S.fox, t0); } }
    if (JF && jOn) { JF.g.rotation.y = yaw; JF.upd({ ...JF.R0, mood: 'determined' }, dt, JF); }
    const th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), wNeed = 2.2 + ((two ? 1 : 0) + (jOn && JF ? 1 : 0)) * 2.4, hNeed = H * 1.12, d = Math.max(hNeed / (2 * th), wNeed / (2 * th * cam.aspect));
    cam.position.set(0, H * 0.56, d); cam.lookAt(0, H * 0.5, 0); renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  return {
    jointed,
    show(w, a, b, look) { if ((w || 'player') !== who) dropJ(); who = w || 'player'; if (jOn && !JF && who !== 'bensumo') jointed(true); lookId = look || null; two = !!b; make(0, a); make(1, b); layout(); },
    dress(a, b) { if (who === 'bensumo') { make(0, a); make(1, b); layout(); return; } if (slots[0].fox && a) dressArmor(WK, slots[0].fox, a); if (slots[1].fox && b) dressArmor(WK, slots[1].fox, b); },
    view(k) { yaw = { front: 0, side: Math.PI / 2, back: Math.PI }[k] ?? yaw; spin = 0; },
    debug() { const f = slots[0].fox; if (!f) return null; const v = new THREE.Vector3(); return (f.userData.armorAdd || []).map(o => { o.getWorldPosition(v); const b = new THREE.Box3().setFromObject(o), sz = new THREE.Vector3(); b.getSize(sz); return [o.children.length, +v.y.toFixed(2), +v.z.toFixed(2), sz.toArray().map(n => +n.toFixed(2))]; }); },
    spin(on) { spinOn = !!on; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', up); removeEventListener('pointermove', mv); renderer.dispose(); el.innerHTML = ''; },
  };
}
