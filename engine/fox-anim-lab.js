// s609 FOX ANIMATION LAB: just our jointed player, playing engine/fox-poses.js animations with faces. Camera per animation, orbit by drag.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs } from './cast.js?v=s339c';
import { applyPose, endPose, FOX_ANIMS, WHEEL } from './fox-poses.js?v=s648k';
import { vehicleKit } from './vehicle-kit.js';   // s619: the real Meru skateboard for the SKATE previews
export const ANIM_LIST = Object.entries(FOX_ANIMS).map(([k, a]) => ({ key: k, label: a.label, group: a.group, note: a.note }));
export async function startAnimLab(el, onClear = () => {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshBasicMaterial({ color: '#2e2a28' })); disc.rotation.x = -Math.PI / 2; scene.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.45, 64), new THREE.MeshBasicMaterial({ color: '#ec3013', side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.004; scene.add(ring);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const fox = cast.make('player', { holster: true }); scene.add(fox);
  // s610 casino set: a chair + a felt table (positions match Meru Casino's poker tables: felt 0.86 up, chair seat under the hips)
  const felt = new THREE.Group(); { const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 1.2), toon('#16624d')); top.position.y = 0.83; felt.add(top); const rail = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.08, 0.1), toon('#3d2a1c')); rail.position.set(0, 0.86, -0.6); felt.add(rail); const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.8, 12), toon('#201e1d')); leg.position.y = 0.4; felt.add(leg); } felt.visible = false; scene.add(felt);
  const chair = new THREE.Group(); { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 18), toon('#7a2a3a')); s.position.y = 0.36; chair.add(s); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.34, 8), toon('#201e1d')); st.position.y = 0.17; chair.add(st); const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.06), toon('#7a2a3a')); b.position.set(0, 0.64, -0.3); chair.add(b); } chair.visible = false; scene.add(chair);
  // s611 bowling lane: maple boards, gutters, arrows, ten pins at the end (the pins fall when the ball arrives)
  const lane = new THREE.Group(); { const L = 15; const w = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, L), toon('#d9a066')); w.position.set(0.22, 0.0, L / 2 + 0.3); lane.add(w);
    for (const x of [-0.45, 0.89]) { const gt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, L), toon('#3a3634')); gt.position.set(x, -0.01, L / 2 + 0.3); lane.add(gt); }
    const fl = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.002, 0.03), toon('#201e1d')); fl.position.set(0.22, 0.022, 1.2); lane.add(fl);
    for (let i = 0; i < 5; i++) { const ar = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 3), toon('#7a2a3a')); ar.rotation.x = Math.PI / 2; ar.position.set(0.22 + (i - 2) * 0.18, 0.024, 4.2 + Math.abs(i - 2) * 0.25); lane.add(ar); }
    lane.userData.pins = []; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) { const pg = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.3, 10), toon('#f3f2f2')); b.position.y = 0.15; pg.add(b); const n = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), toon('#f3f2f2')); n.position.y = 0.33; pg.add(n); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 10), toon('#ec3013')); st.position.y = 0.26; pg.add(st);
      pg.position.set(0.22 + (c - r / 2) * 0.2, 0.02, 14.2 + r * 0.18); pg.userData.r = r; pg.userData.c = c - r / 2; lane.add(pg); lane.userData.pins.push(pg); } }
  lane.visible = false; scene.add(lane);
  let skb = null; try { const VK = vehicleKit({ THREE, M, toon }); skb = VK.make('skate'); skb.scale.setScalar(1.6); skb.visible = false; scene.add(skb); } catch (e) { skb = null; }
  // s621 SWIM previews: a pool surface at WY; A.root(t) tilts + lowers the whole fox (swimRoot)
  const WY = 1.05, water = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: 0x2f8fd6, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide })); water.rotation.x = -Math.PI / 2; water.position.y = WY; water.visible = false; water.renderOrder = 5; scene.add(water);
  // s621b CLIMB previews: a wall 0.42 m in front of the fox (it faces +z) with a few coloured holds
  const wallG = new THREE.Group(); { const wl = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.4), new THREE.MeshLambertMaterial({ color: 0xd9d4cc, side: THREE.FrontSide })); wl.rotation.y = Math.PI; wl.position.set(0, 2.2, 0.44);   /* faces the fox only: see-through from the camera side */ wallG.add(wl); const HC = ['#ec3013', '#2f6fd6', '#ffd23a', '#3f9a5e'];
    for (let i = 0; i < 26; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 3) * 0.015, 8, 6), toon(HC[i % 4])); h.scale.z = 0.5; h.position.set(((i * 37) % 23) / 23 * 2.6 - 1.3, 0.3 + ((i * 53) % 29) / 29 * 3.6, 0.41); wallG.add(h); } } wallG.visible = false; scene.add(wallG);
  // s626 DRIVE previews: a steering wheel ring on the fox's body at WHEEL (same numbers driveD uses), spun by the steer angle
  const wheelP = new THREE.Group(); { const ring = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r, 0.02, 8, 28), toon('#201e1d')); wheelP.add(ring); for (const a of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.018, WHEEL.r, 0.014), toon('#3a3836')); sp.position.set(Math.sin(a) * WHEEL.r / 2, -Math.cos(a) * WHEEL.r / 2, 0); sp.rotation.z = a; wheelP.add(sp); } const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), toon('#ec3013')); hub.rotation.x = Math.PI / 2; wheelP.add(hub); } wheelP.visible = false;
  const setStage = A => { water.visible = !!(A && A.water); wallG.visible = !!(A && A.wall); fox.rotation.order = 'YXZ'; fox.rotation.x = 0; fox.position.z = 0; if (A && (A.water || A.wall)) { felt.visible = chair.visible = lane.visible = false; if (skb) skb.visible = false; return; } if (skb) { skb.visible = !!(A && A.board); fox.position.y = A && A.board ? 0.14 : (A && A.seat ? -0.34 : 0); if (A && A.board) { felt.visible = false; chair.visible = false; lane.visible = false; return; } } const tb = A && A.table; lane.visible = tb === 'lane'; if (tb === 'lane') { felt.visible = false; chair.visible = false; fox.position.y = 0; return; } felt.visible = !!tb; chair.visible = !!(A && A.seat); fox.position.y = A && A.seat ? -0.34 : 0; if (tb) felt.position.z = 0.95; };
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  const CAMS = { front: 0.22, three: 0.8, side: 1.4, close: 0.45, paw: 0.9, head: 0.35, back: Math.PI };
  const T_FL = new THREE.Vector3(), T_LC = new THREE.Vector3(), PAW = new THREE.Vector3(), look = new THREE.Vector3(0, 1.42, 0); let pk2 = 0;
  let sayAt = 0, zk = 1, zoom = false, anim = null, t = 0, pk = 0, speed = 1, paused = false, yaw = 0.22, yawTo = 0.22, auto = true, drag = null, raf = 0, last = performance.now(), worst = 0, wt = 0;
  el.addEventListener('pointerdown', e => { if (e.target === renderer.domElement) { drag = e.clientX; auto = false; } });
  const pu = () => { drag = null; }, pm = e => { if (drag == null) return; yawTo -= (e.clientX - drag) * 0.01; drag = e.clientX; };
  addEventListener('pointerup', pu); addEventListener('pointermove', pm);
  function frame(now) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; const sdt = paused ? 0 : dt * speed;
    if (anim && !paused) t += sdt;
    { const A = anim && FOX_ANIMS[anim], U = fox.userData; if (A && A.say) { if (!U.say && t >= sayAt) { U.talkStyle = A.ts || { rate: 1, amp: 1, base: 0.25 }; U.say = { text: A.say, t: 0 }; sayAt = 1e9; } else if (!U.say && sayAt > 1e8) sayAt = t + 1.2; } } pk += ((anim ? 1 : 0) - pk) * Math.min(1, dt * 7);
    kit.animFox(fox, sdt, anim && FOX_ANIMS[anim].walk ? FOX_ANIMS[anim].walk : 0, false);
    if (pk > 0.002 && (anim || api._last)) applyPose(THREE, fox, anim || api._last, t, pk);
    { const A = anim && FOX_ANIMS[anim]; if (A && A.root) { const r = A.root(((t % A.dur) + A.dur) % A.dur); fox.rotation.x = r.rx || 0; fox.position.y = (A.water ? WY - 0.2 : 0) + r.y; fox.position.z = -(r.back || 0); } }
    { const A = anim && FOX_ANIMS[anim], FPb = fox.userData.P; wheelP.visible = !!(A && A.wheelProp); if (wheelP.visible && FPb && FPb.body) { if (wheelP.parent !== FPb.body) FPb.body.add(wheelP); const sh = FPb.arms[0].position; wheelP.position.set(0, sh.y + WHEEL.y, sh.z + WHEEL.z); wheelP.rotation.set(-WHEEL.tilt, 0, (A.steerOf ? A.steerOf(((t % A.dur) + A.dur) % A.dur) : 0) * 1.05, 'XYZ'); window.__labSX = Math.abs(sh.x); } }
    if (skb && skb.visible) { skb.position.set(0, 0, 0); skb.rotation.set(0, Math.PI / 2, 0); const A = FOX_ANIMS[anim]; skb.position.y = (A && A.key === 'x' ? 0 : 0) + (anim && /ollie|kickflip/.test(anim) ? Math.max(0, Math.sin(Math.max(0, Math.min(1, (t % A.dur - 0.5) / 0.8)) * Math.PI)) * 0.4 : 0); fox.position.y = 0.14 + skb.position.y; if (anim === 'sk_kickflip') { skb.rotation.z = t % A.dur > 0.55 && t % A.dur < 1.05 ? ((t % A.dur - 0.55) / 0.5) * Math.PI * 2 : 0; skb.position.y += Math.abs(Math.sin(skb.rotation.z / 2)) * 0.26; } if (anim === 'sk_manual') skb.rotation.z = -0.25; }
    if (lane.visible) { const rb = fox.userData._rb, hit = rb && rb.visible && rb.position.z > 13.9; for (const pg of lane.userData.pins) { const go = hit ? Math.min(1, (pg.rotation.x ? 1 : 0) + dt * 6) : 0; if (hit) { pg.rotation.x += (1.45 - pg.rotation.x) * Math.min(1, dt * 8); pg.rotation.z += ((pg.userData.c || 0.4) * 1.6 - pg.rotation.z) * Math.min(1, dt * 8); pg.position.z = 14.2 + pg.userData.r * 0.18 + pg.rotation.x * 0.3; } else if (!rb || !rb.visible) { pg.rotation.set(0, 0, 0); pg.position.z = 14.2 + pg.userData.r * 0.18; } } } else if (api._last) { endPose(fox); api._last = null; }
    if (anim) { worst = Math.max(worst, fox.userData.poseClear || 0); wt += dt; if (wt > 0.5) { wt = 0; onClear(worst); } }
    yaw += (yawTo - yaw) * Math.min(1, dt * 5);
    const port = cam.aspect < 0.9, th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), H = 3.0, zc = (anim && FOX_ANIMS[anim].cam === 'close' && auto) || zoom ? 0.62 : 1; zk += (zc - zk) * Math.min(1, dt * 4); const d = Math.max(H * 1.15 / (2 * th), 2.0 / (2 * th * cam.aspect)) * zk;
    const ly = 1.42 - (1 - zk) * 0.45, pawCam = anim && FOX_ANIMS[anim].cam === 'paw', mouthCam = anim && FOX_ANIMS[anim].cam === 'mouth', headCam = anim && (FOX_ANIMS[anim].cam === 'head' || FOX_ANIMS[anim].cam === 'face' || mouthCam), faceCam = anim && FOX_ANIMS[anim].cam === 'face'; pk2 += ((pawCam || headCam ? 1 : 0) - pk2) * Math.min(1, dt * 4);
    if (pawCam && auto) yawTo = 0.62 + Math.sin(t * 0.55) * 0.62; if (mouthCam && auto) yawTo = 0.12 + Math.sin(t * 0.4) * 0.18; else if (faceCam && auto) yawTo = 1.45 + Math.sin(t * 0.5) * 0.12; else if (headCam && auto) yawTo = (FOX_ANIMS[anim] === FOX_ANIMS.ears || FOX_ANIMS[anim] === FOX_ANIMS.hair || FOX_ANIMS[anim] === FOX_ANIMS.cheeks ? Math.sin(t * 0.7) * 2.4 : 0.6);   // slow orbit round the paw
    if (headCam) { fox.userData.P.head.getWorldPosition(PAW); PAW.y += mouthCam ? 0.02 : faceCam ? -0.05 : 0.32; if (faceCam) { PAW.z += 0.3; } } else { fox.userData.P.hands[0].g.getWorldPosition(PAW); PAW.y -= 0.08; } look.set(PAW.x * pk2, ly + (PAW.y - ly) * pk2, PAW.z * pk2); if (water.visible) { look.y = WY - 0.05; look.z = 0; } else if (wallG.visible) { look.y = fox.position.y + 1.1; } let laneCam = 0; if (lane.visible) { const bz = fox.userData.P.body.position.z, rb = fox.userData._rb; look.z += bz; look.y -= 0.25; laneCam = anim === 'bowl' ? Math.max(0, Math.min(1, (t - 2.6) / 0.5)) * (t < 4.75 ? 1 : 0) : 0;   /* a clean CUT back to the bowler (a blend flies the camera low over the lane) */
      T_FL.copy(look); if (laneCam > 0 && rb && rb.visible) { const tz = Math.min(rb.position.z, 14.4); look.set(look.x + (0.22 - look.x) * laneCam, look.y + (0.5 - look.y) * laneCam, look.z + (tz - look.z) * laneCam); } } const dd = d + ((mouthCam ? 2.9 : faceCam ? 2.9 : headCam ? 3.4 : 1.75) - d) * pk2;
    const LB = laneCam > 0 ? T_FL : look; cam.position.set(LB.x + Math.sin(yaw) * dd, LB.y + (1.6 - (1 - zk) * 0.5 - ly) * (1 - pk2) + 0.12 * pk2, LB.z + Math.cos(yaw) * dd);
    if (laneCam > 0) { const bz = fox.userData.P.body.position.z; const rbz = fox.userData._rb && fox.userData._rb.visible ? fox.userData._rb.position.z : bz; T_LC.set(-1.6 + Math.max(0, rbz - 5) * 0.12, 3.4 - Math.max(0, rbz - 5) * 0.12, Math.max(bz - 1.5, Math.min(rbz, 14.2) - 5.5)); /* follows the ball, ends close on the pins */ cam.position.lerp(T_LC, laneCam); }   // after the release: over the bowler's shoulder, down the lane
    cam.lookAt(look); renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  const api = { _last: null,
    play(k) { fox.userData.say = null; fox.userData.talking = false; fox.userData.talkStyle = null; sayAt = 0.5; if (!FOX_ANIMS[k]) { anim = null; setStage(null); return; } setStage(FOX_ANIMS[k]); anim = k; api._last = k; t = 0; worst = 0; paused = false; if (auto) yawTo = (typeof FOX_ANIMS[k].cam === 'number' ? FOX_ANIMS[k].cam : CAMS[FOX_ANIMS[k].cam] ?? 0.22); },
    stop() { anim = null; },
    pause(on) { paused = on ?? !paused; return paused; },
    speed(v) { speed = v; },
    zoom(on) { zoom = on ?? !zoom; return zoom; },
    view(k) { auto = k === 'auto'; yawTo = k === 'auto' ? (anim ? (typeof FOX_ANIMS[anim].cam === 'number' ? FOX_ANIMS[anim].cam : CAMS[FOX_ANIMS[anim].cam]) : 0.22) : CAMS[k] ?? yawTo; },
    at(sec) { t = sec; paused = true; },
    say(text, ts) { fox.userData.talkStyle = ts || null; fox.userData.say = { text, t: 0 }; },
    fox,
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', pu); removeEventListener('pointermove', pm); renderer.dispose(); el.innerHTML = ''; },
  };
  return api;
}
