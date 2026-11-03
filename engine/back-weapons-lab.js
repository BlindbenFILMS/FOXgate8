// s223 Back Weapons Lab: Ben with each shop weapon on his back in place of the sword. One at a time, or all 8 side by side.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js?v=s238';
import { castKit, loadCastRigs } from './cast.js?v=s239';
import { BACK_WEAPONS, RANGED_WEAPONS, loadBackFit, saveBackFit, applyBackFit, mountBackWeapon, mountRanged, defaultFit, tickBackWeapons, makeBackWeapon } from './back-weapons.js?v=s339z2';
export async function startBackLab(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000');
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-3, 8, -6); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const WK = { THREE, M, toon }; let fit = loadBackFit();
  const floorMat = new THREE.MeshBasicMaterial({ color: '#1a1918' });
  const label = txt => { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#f3f2f2'; x.font = '800 ' + (txt.length > 12 ? 40 : 50) + 'px Archivo, Arial, sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(txt, 256, 50);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.set(1.9, 0.36, 1); return s; };
  const SETS = { melee: null, ranged: null }; let mode = 'melee';
  const makeRows = md => (md === 'melee' ? BACK_WEAPONS : RANGED_WEAPONS).map(w => { const fox = cast.make('player', { holster: true }); fox.rotation.y = 0; scene.add(fox);
    const mt = md === 'melee' ? mountBackWeapon(WK, fox, w.key, fit[w.key]) : mountRanged(WK, fox, w.key, fit[w.key]); const fl = new THREE.Mesh(new THREE.CircleGeometry(0.85, 32), floorMat); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.005; fox.add(fl);
    const lb = label(w.name); lb.position.y = 3.15; lb.visible = false; fox.add(lb); return { ...w, fox, mt, lb }; });
  SETS.melee = makeRows('melee'); let rows = SETS.melee;
  // s662 IN HAND (Ben): the weapon drawn in the sword paw (fox's LEFT, arms[1]). Sword = the real draw; other melee = a copy of the back model on the sword grip
  // (grip 12 cm up from its bottom end, sword's own parts hidden); the laser comes out of the holster. touch() every frame keeps it out.
  let hand = false;
  // s662f how each weapon sits in the fist: the grip centre at the origin, +y = out of the index side (toward the blade / head). Back-strap clips hidden.
  function handCopy(key) { const w = makeBackWeapon(WK, key);
    w.traverse(m => { const p = m.geometry && m.geometry.parameters; if (m.isMesh && m.geometry.type === 'BoxGeometry' && p && Math.abs(p.width - 0.11) < 1e-3 && Math.abs(p.height - 0.045) < 1e-3) m.visible = false; });
    if (key === 'bat') { w.rotation.z = 0; w.position.y = 0.56; return w; }   // barrel forward, the fist on the tape just above the knob
    if (key === 'whip') {   // the handle in the fist (knob + loop at the pinky side), the lash out of the index side, hanging + swaying; coil hidden
      const H = w.children.find(c => c.isGroup && c.children.length > 4 && Math.abs(c.rotation.z + 0.5) < 1e-3), T = w.children.find(c => c.isGroup && c !== H);
      for (const c of w.children) if (c.isMesh) c.visible = false;
      if (H) { H.rotation.set(Math.PI, 0, 0); H.position.set(0, 0.13, 0); } if (T) { T.position.set(0, 0.15, 0); T.scale.set(1.3, 2.4, 1.3); } return w; }
    w.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(w); w.position.y = -(bb.min.y + 0.12); return w; }
  // s662g where the fist closes on each ranged weapon (model y; +y = the muzzle / business end, which points forward out of the fist)
  const HOLD_R = { staffR: 0.12, scatter: -0.24, rocket: -0.05, crossbow: -0.1, rifle: -0.32 }, WAND = { flame: -0.12, freeze: -0.12, fog: -0.12 }, UPRIGHT = { staffR: 1 };   // s662h the STAFF stands upright in a low fist (wizard's staff), head above the fox's head
  function rangedCopy(key) { const g = makeBackWeapon(WK, key); let w = g, hy = HOLD_R[key] ?? -0.15;
    if (WAND[key] != null) { w = g.userData.hipPart; g.remove(w); hy = WAND[key]; }   // the throwers: only the wand comes to the paw, the tank stays on the back
    w.traverse(m => { const p = m.geometry && m.geometry.parameters; if (m.isMesh && m.geometry.type === 'BoxGeometry' && p && Math.abs(p.width - 0.11) < 1e-3 && Math.abs(p.height - 0.045) < 1e-3) m.visible = false; });
    const rc = new THREE.Group(); rc.position.set(0, 0.16, 0.185); rc.scale.setScalar(1 / 0.8); w.position.y = -hy; rc.add(w);
    if (UPRIGHT[key]) { rc.rotation.x = 0.12; rc.rotation.z = -0.06; } else { rc.position.y = 0.1; rc.rotation.x = Math.PI / 2; } rc.userData.rx0 = rc.rotation.x; return rc; }
  const _fa = new THREE.Vector3(), _fb = new THREE.Vector3(), _fs = new THREE.Vector3();
  function fistSnap(r) { const P = r.fox.userData.P, H = P.hands && P.hands[0]; if (!H || !P.gun) return; r.fox.updateMatrixWorld(true);
    _fa.set(0, 0, 0); _fb.set(0, 0, 0); for (const f of H.fingers) { _fa.add(f.a.getWorldPosition(_fs)); _fb.add((f.b || f.a).getWorldPosition(_fs)); }
    _fa.multiplyScalar(1 / H.fingers.length); _fb.multiplyScalar(1 / H.fingers.length); H.hg.getWorldPosition(_fs);
    _fa.lerp(_fb, 0.6).addScaledVector(_fs.sub(_fa), 0.35); P.gun.worldToLocal(_fa); r.hw.position.copy(_fa);
    if (UPRIGHT[r.key]) { const h = holdOf(r.key) || {}, ln = (h.lean ?? 8) * D2, fw = (h.fl || 0) * D2;   // s662i the staff stands TRUE upright in the fox's frame (leans out by LEAN, forward by WRIST), whatever the arm does
      _fs.set(-Math.sin(ln), Math.cos(ln) * Math.cos(fw), Math.sin(fw)).normalize(); _fq.setFromUnitVectors(_fy, _fs); r.fox.getWorldQuaternion(_fq2); _fq.premultiply(_fq2); P.gun.getWorldQuaternion(_fq2); r.hw.quaternion.copy(_fq2.invert().multiply(_fq)); } }
  const _fq = new THREE.Quaternion(), _fq2 = new THREE.Quaternion(), _fy = new THREE.Vector3(0, 1, 0);
  // s662i HOLD POSES (Ben: "deep polish on the way EACH weapon is held"): per weapon ARM UP / ARM OUT / ELBOW / WRIST (tilt) / TWIST / SLIDE (grip along the
  // weapon), degrees + metres, saved in localStorage backLab.hold.v1 (sliders in the lab while IN HAND is on). Runs as a fighter-gear superPose (last in the rig).
  // null = the game's own pose (the SWORD low guard, the LASER). Melee = the fox's LEFT paw (arms[1]), ranged = its RIGHT (arms[0]).
  const HOLD_KEY = 'backLab.hold.v1';
  const HOLD0 = {
    // RULES (jointed paw, palm in, thumb forward): the weapon leaves the fist along the knuckles, so its pitch above level ≈ -(ARM UP + ELBOW) - 90:
    // forearm level (sum -90) = upright pole · sum -30 = pointing forward-up · ROLL turns the forearm (top of the weapon out / in), SIDE tips it forward / back; found by measuring the weapon's real direction. SLIDE + = the fist moves up toward the head.
    racket: { ax: -38, az: 30, el: -64, fl: 0, ro: 35, sd: 28, tw: 0, sl: 0 },     // ready position: head up in front of the shoulder
    gloves: { ax: -84, az: 22, el: -36, fl: 0, tw: 0, sl: 0 },      // s662j boxing guard held further out in front of the face (Ben)
    spear: { ax: -12, az: 12, el: -22, fl: 0, ro: 15, sd: -28, tw: 0, sl: 0.36 },    // point forward + up, held a third from the butt
    maul: { ax: -16, az: 20, el: -74, fl: 0, ro: 30, sd: -14, tw: 0, sl: 0.18 },    // stood upright beside the fox, head up, butt near the ground
    halberd: { ax: -10, az: 18, el: -72, fl: 0, ro: 30, sd: -28, tw: 180, sl: 0.62 }, // s662l pole upright beside the fox, held LOWER (Ben): butt near the ground, blade at head height
    bat: { ax: -30, az: 14, el: -80, fl: 0, ro: 40, sd: -10, tw: 0, sl: 0 },         // s662j up + back over the shoulder, tipped OUT away from the head (Ben: it went through the head)
    net: { ax: -18, az: 20, el: -72, fl: 0, ro: 30, sd: -28, tw: 0, sl: 0.36 },     // pole upright, hoop high + out to the side
    flail: { ax: -24, az: 16, el: -34, fl: 0, ro: 15, sd: 14, tw: 0, sl: 0 },        // handle forward, the ball hanging free
    whip: { ax: -20, az: 18, el: -30, fl: 0, ro: 15, sd: 14, tw: 0, sl: 0 },         // handle forward, the lash hanging to the ground
    staffR: { ax: -16, az: 36, el: -52, fl: 4, lean: 6, tw: 0, sl: -0.1 },   // planted WIDE out to the side, orb well clear of the head
    // s662n TWO-HAND ranged: x / y / z = where the RIGHT fist holds the main grip (body space: +x = fox's left, +z = forward), yaw / pitch / roll = the weapon's aim
    scatter: { x: -0.2, y: 1.15, z: 0.38, yaw: 65, pitch: 15, roll: 0 }, rocket: { x: -0.56, y: 1.3, z: 0.2, yaw: 10, pitch: 8, roll: 0 }, crossbow: { x: -0.1, y: 1.15, z: 0.38, yaw: 60, pitch: 5, roll: 80 },
    rifle: { x: -0.2, y: 1.15, z: 0.38, yaw: 65, pitch: 15, roll: 0 }, flame: { x: 0, y: 1, z: 0.38, yaw: 65, pitch: -10, roll: 0 }, freeze: { x: 0, y: 1, z: 0.38, yaw: 65, pitch: -10, roll: 0 }, fog: { x: 0, y: 1, z: 0.38, yaw: 65, pitch: -10, roll: 0 } };
  let holds = {}; try { holds = JSON.parse(localStorage.getItem(HOLD_KEY) || '{}') || {}; } catch (e) {}
  const holdOf = k => HOLD0[k] ? { ...HOLD0[k], ...(holds[k] || {}) } : null;
  const saveHolds = () => { try { localStorage.setItem(HOLD_KEY, JSON.stringify(holds)); } catch (e) {} };
  const D2 = Math.PI / 180;
  const poseFn = r => (p, o) => { const h = holdOf(r.key); if (!h) return; const u = r.fox.userData, P = u.P, rg = mode === 'ranged', i = rg ? 0 : 1, s = i ? 1 : -1, br = Math.sin(o.t * 1.6) * 0.02;
    o.A[i].rotation.set(h.ax * D2 + br - (rg ? (r.kick || 0) * 0.7 : 0), 0, s * h.az * D2); if (P.fore) P.fore[i].rotation.set(h.el * D2, s * (h.ro || 0) * D2, 0);
    if (r.key === 'gloves') { o.A[0].rotation.set(h.ax * D2 + br, 0, -h.az * D2); if (P.fore) P.fore[0].rotation.set(h.el * D2, 0, 0); }
    if (rg) { if (P.gun) P.gun.rotation.set(-(h.ax + h.el) * D2 - 0.05, 0, 0); }
    else { const f = Math.max(-0.55, Math.min(0.55, h.fl * D2)); u.wrist = [[0, 0], [f, Math.max(-0.5, Math.min(0.5, (h.sd || 0) * D2))]]; if (o.sword) o.sword.rotation.set(Math.PI - 0.6 + h.fl * D2, 0, 0); }
    if (r.hw) { const w = r.hw.children[0]; if (w) { if (w.userData.y0 == null) w.userData.y0 = w.position.y; w.position.y = w.userData.y0 - (h.sl || 0); w.rotation.y = (h.tw || 0) * D2 + (w.userData.ry0 || 0); }
      if (rg) { const b = r.hw.userData.rx0; if (b != null) r.hw.rotation.x = b + h.fl * D2; } } };
  // boxing gloves: worn ON both paws (the tied pair on the back hides)
  function gloveOn(P, on) { if (!P.hands) return; for (const H of P.hands) { if (on && !H.glove) { const c = new THREE.Group(), gr = WK.toon('#d8241a'), cf = WK.toon('#f3f2f2');
        const bl = WK.M(new THREE.SphereGeometry(0.1, 14, 10), gr, 0, -0.06, 0.012, c, 0.012, 0.1); bl.scale.set(1, 1.15, 0.95);
        WK.M(new THREE.SphereGeometry(0.04, 8, 6), gr, H.sd * -0.075, -0.035, 0.05, c, 0.008, 0.04).scale.set(1, 1.5, 1);
        WK.M(new THREE.CylinderGeometry(0.075, 0.08, 0.08, 14), cf, 0, 0.04, 0, c, 0.01); c.scale.setScalar(1.2); H.hg.add(c); H.glove = c; }   // s662j gloves 20 % bigger (Ben)
      if (H.glove) { H.glove.visible = on; for (const f of H.fingers) f.a.visible = !on; if (H.th) H.th.visible = !on; } } }
  // s662n TWO-HAND RANGED (Ben: "deep dive how each is held, both hands if needed"). Each weapon has real grips (model space: +y = muzzle, up = the
  // weapon's top). The weapon is placed on the BODY (the right fist's spot + aim), then BOTH arms reach it with 2-bone IK (elbows down + out), and each
  // paw turns so its knuckle line runs along its grip (index toward the top / muzzle) with the back of the paw facing out. The fox's arms are short and
  // the shoulders wide, so two-hand holds sit ACROSS the body (port arms); the rocket rides the right shoulder one-handed.
  const TWOH = {
    rifle: { up: -1, R: { p: [0, -0.33, 0.11], k: [0, 0.27, -1] }, L: { p: [0, 0.2, 0.03], k: [0, 1, 0], nb: -1 } },
    scatter: { up: 1, R: { p: [0, -0.26, -0.12], k: [0, 0.27, 1] }, L: { p: [0, 0.17, -0.08], k: [0, 1, 0], nb: -1 } },
    crossbow: { up: 1, R: { p: [0, -0.2, -0.085], k: [0, 0.27, 1] }, L: { p: [0, 0.07, -0.035], k: [0, 1, 0], nb: -1 } },
    rocket: { up: -1, R: { p: [0, -0.05, 0.15], k: [0, 0.2, -1] }, L: null },
    flame: { wand: 1, up: -1, R: { p: [0, -0.12, 0.08], k: [0, 0.25, -1] }, L: { p: [0, 0.06, 0.07], k: [0, 0.15, -1], nb: -1 } } };
  TWOH.freeze = TWOH.fog = TWOH.flame;
  const V3 = (a, b, c) => new THREE.Vector3(a, b, c), basis = (a, b) => { const x = a.clone().normalize(), y = b.clone().addScaledVector(x, -b.dot(x)).normalize(); return new THREE.Matrix4().makeBasis(x, y, V3().crossVectors(x, y)); };
  const rotOf = (Mt, Ms) => new THREE.Quaternion().setFromRotationMatrix(Mt.clone().multiply(Ms.clone().transpose()));
  function handLocal(H) { const g = H.g, w = o => g.worldToLocal(o.getWorldPosition(V3())), fi = H.fingers, ix = fi.find(f => f.k === 0), pk = fi.find(f => f.k === 3);
    const K = V3(), Cc = V3(); for (const f of fi) { K.add(w(f.a)); Cc.add(w(f.b || f.a)); } K.multiplyScalar(1 / fi.length); Cc.multiplyScalar(1 / fi.length);
    const hole = K.clone().lerp(Cc, 0.6).addScaledVector(w(H.hg).sub(K), 0.35), k = w(ix.a).sub(w(pk.a)).normalize(), n = K.clone().sub(Cc); n.addScaledVector(k, -n.dot(k)).normalize();
    return { hole, k, n }; }   // n = the back of the paw (away from where the fingers curl)
  // reach(): 2-bone IK + the arm's ROLL around the shoulder→wrist line chosen (36 tries) for the most NATURAL WRIST (least turn away from the paw's rest
  // pose, which is palm-in, thumb forward) with the elbow kept down + out of the body. Returns { cost, err, apply() }.
  const _Z = V3(0, 0, 1), _DN3 = V3(0, -1, 0);
  function reach(P, i, HL, T, kb, nb) { const A = P.arms[i], F = P.fore[i], H = P.hands[i], s = H.sd || (i ? 1 : -1);
    const sA = A.scale.x || 1, Qh = rotOf(basis(kb, nb), basis(HL.k, HL.n)), W = T.clone().sub(HL.hole.clone().applyQuaternion(Qh).multiplyScalar(sA)), d = W.clone().sub(A.position).multiplyScalar(1 / sA);
    const v1 = F.position.clone(), gp = H.g.position.clone(), L1 = v1.length(), L2 = gp.length(), dl = d.length(), want = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.002, dl));
    const len = e => v1.clone().add(gp.clone().applyAxisAngle(_X, e)).length(); let lo = -2.9, hi = 0; for (let n = 0; n < 26; n++) { const m = (lo + hi) / 2; if (len(m) > want) hi = m; else lo = m; } const e = (lo + hi) / 2;
    const u = v1.clone().add(gp.clone().applyAxisAngle(_X, e)), Qa0 = rotOf(basis(d, _DN3), basis(u, v1)), dn = d.clone().normalize(), Qe = new THREE.Quaternion().setFromAxisAngle(_X, e);
    const Q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s * 1.37, 0)), mid = A.position.clone().addScaledVector(d, sA * 0.5);
    let best = null; for (let k = 0; k < 36; k++) { const Qa = new THREE.Quaternion().setFromAxisAngle(dn, k / 36 * Math.PI * 2).multiply(Qa0), Hg = Qa.clone().multiply(Qe).invert().multiply(Qh);
      // the forearm can turn (pronate / supinate) ~90° each way, so twist about the forearm line is nearly free; only the true wrist BEND (swing) counts
      const qr = Q0.clone().invert().multiply(Hg), tw = 2 * Math.atan2(qr.y, qr.w), tq = new THREE.Quaternion(0, qr.y, 0, qr.w).normalize(), sw = qr.clone().multiply(tq.invert()), swing = 2 * Math.acos(Math.min(1, Math.abs(sw.w)));
      const twa = Math.abs(Math.atan2(Math.sin(tw), Math.cos(tw))), dev = swing + 0.5 * Math.max(0, twa - 1.5), el = A.position.clone().addScaledVector(v1.clone().applyQuaternion(Qa), sA), ed = el.clone().sub(mid).normalize();
      const pen = 1.4 * Math.max(0, 0.25 - ed.dot(_DN3)) + 6 * Math.max(0, s * (0.3 * s - el.x));
      const c = dev + pen; if (!best || c < best.c) best = { c, Qa, Hg, dev: swing, tw: twa }; }
    const err = (dl - want) * sA;
    return { cost: best.c + Math.abs(err) * 8, dev: best.dev, err, apply() { A.quaternion.copy(best.Qa); F.rotation.set(e, 0, 0); H.g.quaternion.copy(best.Hg); } }; }
  const _X = V3(1, 0, 0);
  function twoHand(r) { const T = TWOH[r.key], h = holdOf(r.key), u = r.fox.userData, P = u.P, D2r = Math.PI / 180; if (!T || !h || !r.hw2) return;
    r.fox.updateMatrixWorld(true); const HLs = [handLocal(P.hands[0]), handLocal(P.hands[1])];
    const kk = r.kick || 0, KB = KICK[r.key] || [0.06, 6], pt = (h.pitch + KB[1] * kk) * D2r, cp = Math.cos(pt), D = V3(Math.sin(h.yaw * D2r) * cp, Math.sin(pt), Math.cos(h.yaw * D2r) * cp).normalize(), Um = V3(0, 0, T.up), Ym = V3(0, 1, 0), rightM = V3().crossVectors(Ym, Um), at = V3(h.x, P.mapY ? P.mapY(h.y) : h.y, h.z).addScaledVector(D, -KB[0] * kk);   // s662p recoil kick
    const place = rollAdd => { const U = V3(0, 1, 0).addScaledVector(D, -D.y).normalize().applyAxisAngle(D, (h.roll + rollAdd) * D2r), Qw = rotOf(basis(D, U), basis(Ym, Um)), pos = at.clone().sub(V3(...T.R.p).applyQuaternion(Qw));
      const g = (G, i) => G ? reach(P, i, HLs[i], V3(...G.p).applyQuaternion(Qw).add(pos), V3(...G.k).normalize().applyQuaternion(Qw), rightM.clone().multiplyScalar(G.nb || 1).applyQuaternion(Qw)) : null;
      // s662o the SUPPORT paw picks how it wraps its grip: from below (palm up), the side or over the top, index toward the muzzle (or reversed, small cost)
      const gL = G => { if (!G) return null; let b = null; const tg = V3(...G.p).applyQuaternion(Qw).add(pos), k0 = V3(...G.k).normalize().applyQuaternion(Qw), rw = rightM.clone().applyQuaternion(Qw), up = V3().crossVectors(k0, rw).normalize();
        for (const ks of [1, -1]) for (const nbv of [rw, rw.clone().negate(), up, up.clone().negate()]) { const c = reach(P, 1, HLs[1], tg, k0.clone().multiplyScalar(ks), nbv); c.cost += ks < 0 ? 0.25 : 0; if (!b || c.cost < b.cost) b = c; } return b; };
      const R = g(T.R, 0), L = gL(T.L); return { Qw, pos, R, L, cost: (R ? R.cost : 0) + (L ? L.cost : 0) }; };
    // s662o the weapon may roll up to ±30° about its own aim line too, if that relaxes both wrists
    let best = null; for (let ra = -30; ra <= 30; ra += 10) { const p = place(ra); if (!best || p.cost < best.cost) best = p; }
    r.hw2.quaternion.copy(best.Qw); r.hw2.position.copy(best.pos); if (best.R) best.R.apply(); if (best.L) best.L.apply();
    { let pen = 0; for (let y = -0.55; y <= 0.65; y += 0.05) { const p = V3(0, y, 0).applyQuaternion(best.Qw).add(best.pos);   // weapon line vs torso + head
        const tq = (p.x / 0.4) ** 2 + ((p.y - 1.15) / 0.5) ** 2 + ((p.z - 0.02) / 0.34) ** 2, hq = p.distanceTo(V3(0, 1.9, 0.12)) / 0.5; pen += Math.max(0, 1 - tq) + Math.max(0, 1 - hq) * 2; }
      r.cost = best.cost + pen; }
    r.ikErr = [best.R ? best.R.err : 0, best.L ? best.L.err : 0]; r.wristDeg = [best.R ? Math.round(best.R.dev * 57.3) : 0, best.L ? Math.round(best.L.dev * 57.3) : 0]; }
  function twoOn(r, on) { const u = r.fox.userData, P = u.P, T = TWOH[r.key];
    if (on && !r.hw2) { const g = makeBackWeapon(WK, r.key); let w = g; if (T.wand) { w = g.userData.hipPart; g.remove(w); w.position.set(0, 0, 0); }
      w.traverse(m => { const p = m.geometry && m.geometry.parameters; if (m.isMesh && m.geometry.type === 'BoxGeometry' && p && Math.abs(p.width - 0.11) < 1e-3 && Math.abs(p.height - 0.045) < 1e-3) m.visible = false; });
      r.hw2 = new THREE.Group(); r.hw2.userData.built = true; r.hw2.add(w); P.body.add(r.hw2); }
    if (r.hw2) r.hw2.visible = on; u.grip = on ? [1, T.L ? 1 : null] : null;
    if (r.mt) { if (T.wand) { if (r.mt.userData.hip) r.mt.userData.hip.visible = !on; } else r.mt.visible = !on; } }
  function setHandRow(r, on) { const u = r.fox.userData, G = u.rig, FP = u.P; if (!G || !FP) return;
    if (mode === 'ranged' && TWOH[r.key]) { twoOn(r, on); return; }
    if (on && holdOf(r.key) && G.superPose) G.superPose(1e9, poseFn(r)); else if (!on && G.superPose && G.superBusy) { G.superPose(1e-4, () => {}); u.wrist = null; }
    if (r.key === 'gloves') { gloveOn(FP, on); if (r.mt) r.mt.visible = !on; G.draw(false, true); return; }
    if (mode === 'ranged') { if (!FP.gun || r.key === 'laser') return;   // s662g RANGED IN HAND: the weapon in the gun paw (fox's RIGHT, arms[0]); the laser body hides, its fist stays
      if (on && !r.hw) { r.hw = rangedCopy(r.key); FP.gun.add(r.hw); }
      if (r.hw) { for (const c of FP.gun.children) if (c !== r.hw && !(c.isMesh && c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius >= 0.048)) c.visible = !on; r.hw.visible = on; }
      if (r.mt) { if (WAND[r.key] != null) { if (r.mt.userData.hip) r.mt.userData.hip.visible = !on; } else r.mt.visible = !on; }
      return; }
    if (!FP.sword) return;
    if (r.key !== 'sword') { if (on && !r.hw) { const h = new THREE.Group(); h.add(handCopy(r.key)); h.rotation.y = Math.PI / 2; h.scale.setScalar(1 / 0.8); r.hw = h; FP.sword.add(h); }
      for (const c of FP.sword.children) c.visible = c === r.hw ? on : !on; if (r.mt) r.mt.visible = !on; }
    { const mu = window.__8gSfxOff; window.__8gSfxOff = true; try { G.draw(on, true); } finally { window.__8gSfxOff = mu; } } }
  function setHand(on) { if (!!on !== hand) { const r = R(sel); if (r && !all) play(r.key, on ? 'draw' : 'holster'); } hand = !!on; for (const k in SETS) if (SETS[k]) for (const r of SETS[k]) setHandRow(r, hand && SETS[k] === rows); yaw = hand ? 0.45 : (mode === 'ranged' ? Math.PI * 1.72 : Math.PI); spin = false; return hand; }
  let zoom = 1, sel = 'racket', all = false, yaw = Math.PI, spin = false, view = 'back', raf = 0, last = performance.now(), drag = null;
  const VIEWS = { back: Math.PI, three: Math.PI * 1.3, side: Math.PI * 1.5 };
  function layout() { const port = cam.aspect < 0.9;
    rows.forEach((r, i) => { r.fox.visible = all || r.key === sel; r.lb.visible = all;
      if (!all) { r.fox.position.set(0, 0, 0); return; }
      const per = port ? 4 : 8, row = Math.floor(i / per), col = i % per, n = per; r.fox.position.set(((n - 1) / 2 - col) * 1.75, 0, row * 2.6); }); }
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); layout(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; }); el.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(0.3, Math.min(1.6, zoom * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  const pu = () => { drag = null; }, pm = e => { if (drag == null) return; yaw -= (e.clientX - drag) * 0.01; drag = e.clientX; }; addEventListener('pointerup', pu); addEventListener('pointermove', pm);
  function place() { const port = cam.aspect < 0.9;
    if (!all) { const rg = mode === 'ranged', d = (port ? 6.4 : 4.6) * (rg ? 0.78 : 1) * zoom;
      if (hand && !rg) { const r = R(sel), sw = r && r.fox.userData.P.sword; if (sw) { sw.getWorldPosition(_t); _t.lerp(_t2.set(0, 1.35, 0), zoom > 0.6 ? 0.55 : 0); const dh = (port ? 2.2 : 1.6) * zoom * (zoom > 0.6 ? 1.7 : 1); cam.position.set(_t.x + Math.sin(yaw) * dh, _t.y + 0.25, _t.z + Math.cos(yaw) * dh); cam.lookAt(_t); return; } }
      cam.position.set(Math.sin(yaw) * d, rg ? 1.6 : 2.0, Math.cos(yaw) * d); cam.lookAt(0, rg ? 1.15 : 1.35, 0); return; }
    const w = port ? 4 * 1.75 : 8 * 1.75, cz = port ? 1.3 : 0, fovH = 2 * Math.atan(Math.tan(cam.fov * D / 2) * cam.aspect), d = (w / 2 + 0.6) / Math.tan(fovH / 2) + 1.5, dd = Math.max(d, port ? 9 : 6);
    cam.position.set(Math.sin(yaw) * dd, port ? 3.6 : 2.4, cz + Math.cos(yaw) * dd); cam.lookAt(0, port ? 1.3 : 1.45, cz); }
  const D = Math.PI / 180, _t = new THREE.Vector3(), _t2 = new THREE.Vector3();
  // s662p SWING / FIRE (Ben): melee = the game's real combo (sword chop · sweep · spin, boxing gloves jab · cross · hook · kick), the hold comes back after;
  // ranged = recoil kick through the arms + what each one shoots (bolt, pellets, crossbow bolt, rocket + back-blast, fireball, flame / frost / fog stream)
  const KICK = { rifle: [0.07, 7], scatter: [0.1, 12], crossbow: [0.04, 4], rocket: [0.12, 5], flame: [0.02, 2], freeze: [0.02, 2], fog: [0.02, 2] };
  const FX = [], _sg = new THREE.SphereGeometry(1, 10, 8), _Y = new THREE.Vector3(0, 1, 0);
  function shot(from, dir, col, size, speed, life, o = {}) { const m = o.mesh || new THREE.Mesh(_sg, new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: o.solid ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false }));
    if (!o.mesh) m.scale.setScalar(size); m.position.copy(from); const v = dir.clone(); if (o.spread) v.add(new THREE.Vector3((Math.random() - 0.5) * o.spread, (Math.random() - 0.5) * o.spread, (Math.random() - 0.5) * o.spread)); v.normalize();
    if (o.mesh) m.quaternion.setFromUnitVectors(_Y, v); v.multiplyScalar(speed); scene.add(m); FX.push({ m, v, t: 0, life, grav: o.grav || 0, grow: o.grow || 0, s0: size, keep: !!o.mesh }); }
  function tickFx(dt) { for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; f.m.position.addScaledVector(f.v, dt); f.v.y -= f.grav * dt; const q = f.t / f.life;
      if (!f.keep) { f.m.scale.setScalar(f.s0 * (1 + f.grow * q)); f.m.material.opacity = Math.max(0, 1 - q); } else if (f.grav) f.m.quaternion.setFromUnitVectors(_Y, f.v.clone().normalize());
      if (q >= 1) { scene.remove(f.m); f.m.material.dispose(); if (f.keep) f.m.geometry.dispose(); FX.splice(i, 1); } } }
  function topY(w) { if (w.userData.top != null) return w.userData.top; w.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(w.matrixWorld).invert(), v = new THREE.Vector3(), M4 = new THREE.Matrix4(); let m = -9;
    w.traverse(o => { if (!o.isMesh || !o.visible || o.material === outlineMat || o.material.blending === THREE.AdditiveBlending) return; const p = o.geometry.attributes.position; if (!p) return; M4.multiplyMatrices(inv, o.matrixWorld); for (let i = 0; i < p.count; i += 2) { v.fromBufferAttribute(p, i).applyMatrix4(M4); if (v.y > m) m = v.y; } });
    return (w.userData.top = m); }
  function muzzle(r) { const w = r.hw2 ? r.hw2.children[0] : r.hw && r.hw.children[0]; if (!w) return null; r.fox.updateMatrixWorld(true); const y = topY(w), q = w.getWorldQuaternion(new THREE.Quaternion());
    return { p: w.localToWorld(new THREE.Vector3(0, y + 0.02, 0)), d: _Y.clone().applyQuaternion(q), w, fwd: new THREE.Vector3(0, 0, 1).applyQuaternion(r.fox.getWorldQuaternion(new THREE.Quaternion())) }; }
  const STREAM = { flame: [[0xff8a20, 0xffd23a, 0xff4a1a], 7, 0.45, 2.6], freeze: [[0xbfe9ff, 0xffffff, 0x7fc8ff], 6, 0.5, 2.4], fog: [[0x8a9097, 0x6b7178, 0xb0b5ba], 3, 0.9, 4] };
  function streamFx(r) { const S = STREAM[r.key], M = S && muzzle(r); if (!M) return; for (let i = 0; i < 2; i++) shot(M.p, M.d, S[0][(Math.random() * 3) | 0], 0.03, S[1] * (0.8 + Math.random() * 0.4), S[2], { spread: 0.3, grow: S[3], solid: r.key === 'fog' }); }
  // s662q WEAPON SOUNDS (Ben's recorded files): audio/melee/<key>-swing|draw|holster.mp3, audio/ranged/<key>-fire|draw|holster|loop|stop.mp3
  const AKEY = { staffR: 'staff', maul: 'maul' }, ABUF = new Map(); let actx = null;
  const ctx = () => { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') actx.resume(); return actx; };
  function buf(url) { if (!ABUF.has(url)) ABUF.set(url, fetch(new URL('../audio/' + url, import.meta.url).href).then(r => r.ok ? r.arrayBuffer() : null).then(a => a && ctx() ? actx.decodeAudioData(a) : null).catch(() => null)); return ABUF.get(url); }
  async function play(key, what, o = {}) { if (window.__muteAll) return null; const c = ctx(); if (!c) return null; const k = AKEY[key] || key, b = await buf((mode === 'ranged' ? 'ranged/' : 'melee/') + k + '-' + what + '.mp3'); if (!b) return null;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.loop = !!o.loop; s.playbackRate.value = o.rate || (0.95 + Math.random() * 0.1); g.gain.value = o.vol ?? 0.85; s.connect(g).connect(c.destination); s.start(); return { s, g }; }
  function stopLoop(r) { const L = r.loopS; if (!L) return; r.loopS = null; L.then(h => { if (!h || !actx) return; h.g.gain.setTargetAtTime(0, actx.currentTime, 0.06); h.s.stop(actx.currentTime + 0.3); }); }
  let swT = 0;
  function swing() { const r = R(sel); if (!r || all) return; if (!hand) setHand(true); const u = r.fox.userData, G = u.rig; if (!G) return;
    if (mode === 'melee') { if (G.superBusy) G.superPose(1e-4, () => {}); u.wrist = null; if (r.key === 'gloves' && !G.fists) G.setFists(true); const mu = window.__8gSfxOff; window.__8gSfxOff = true; try { G.strike(); } finally { window.__8gSfxOff = mu; } play(r.key, 'swing');
      r.swing = 0.12; return; }   // the hold comes back as soon as the move ends (frame)
    if (r.key === 'laser') { const mu = window.__8gSfxOff; window.__8gSfxOff = true; let m; try { m = G.shoot(); } finally { window.__8gSfxOff = mu; } play('laser', 'fire'); if (m) G.bolt(m, null, false); return; }
    const M = muzzle(r); if (!M) return; r.kick = 1;
    if (STREAM[r.key]) { play(r.key, 'fire'); if (!r.loopS) r.loopS = play(r.key, 'loop', { loop: true, vol: 0.7, rate: 1 }); } else play(r.key, 'fire');
    const flash = (c, s) => shot(M.p, M.d, c, s, 0, 0.09);
    if (r.key === 'rifle') { flash(0xff6a5a, 0.09); shot(M.p, M.d, 0xff4a3a, 0.05, 32, 0.6); shot(M.p, M.d, 0xffffff, 0.025, 32, 0.6); }
    else if (r.key === 'scatter') { flash(0xffd23a, 0.14); for (let i = 0; i < 5; i++) shot(M.p, M.d, 0xffb23a, 0.035, 20, 0.45, { spread: 0.28 }); }
    else if (r.key === 'crossbow') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.36, 5), new THREE.MeshBasicMaterial({ color: '#4a2a17' })); shot(M.p, M.d, 0, 0, 16, 0.9, { mesh: b, grav: 2.5 }); }
    else if (r.key === 'rocket') { flash(0xffd23a, 0.16); shot(M.p, M.d, 0xff8a20, 0.08, 13, 1.1); const bk = M.w.localToWorld(new THREE.Vector3(0, -0.45, 0)); for (let i = 0; i < 6; i++) shot(bk, M.d.clone().negate(), 0x8a9097, 0.07, 2 + Math.random() * 2, 0.7, { spread: 0.5, grow: 3, solid: true }); }
    else if (r.key === 'staffR') { flash(0xffb23a, 0.16); setTimeout(() => { const M2 = muzzle(r); if (M2) shot(M2.p, M2.fwd, 0xff7a1a, 0.09, 9, 1.0); }, 140); }
    else if (STREAM[r.key]) r.stream = 0.7; }
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; if (spin) yaw += dt * 0.5; place(); tickFx(dt);
    for (const r of rows) { if (r.swing != null) { const G = r.fox.userData.rig; r.swing -= dt; if (r.swing < 0 && G && !G.striking) { r.swing = null; if (hand && mode === 'melee' && holdOf(r.key)) G.superPose(1e9, poseFn(r)); } }
      if (r.kick) r.kick = Math.max(0, r.kick - dt * 5); if (r.stream > 0) { r.stream -= dt; streamFx(r); if (r.stream <= 0 && r.loopS) { stopLoop(r); play(r.key, 'stop'); } } }
    if (hand) for (const r of rows) { const G = r.fox.userData.rig; if (G) { G.touch(); if (mode === 'ranged' && r.fox.visible) (TWOH[r.key] ? null : (UPRIGHT[r.key] || holdOf(r.key)) ? G.showGun : (G.aimHold || G.showGun))?.(0.5); } }
    for (const r of rows) if (r.fox.visible) kit.animFox(r.fox, dt, 0, false);
    if (hand && mode === 'ranged') for (const r of rows) if (r.fox.visible) { if (TWOH[r.key] && r.hw2 && r.hw2.visible) twoHand(r); else if (r.hw && r.hw.visible) fistSnap(r); }   /* s662h the grip sits IN the real fist */ tickBackWeapons(t / 1000); renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  const R = k => rows.find(r => r.key === k);
  return { zoom(z) { zoom = Math.max(0.12, Math.min(1.6, z)); }, yaw(y) { yaw = y; spin = false; }, _fox: k => (R(k) || {}).fox,
    get weapons() { return mode === 'melee' ? BACK_WEAPONS : RANGED_WEAPONS; }, get mode() { return mode; },
    setMode(md) { if (md === mode) return; if (hand) setHand(false); for (const r of rows) r.fox.visible = false; mode = md; if (!SETS[md]) SETS[md] = makeRows(md); rows = SETS[md]; sel = rows[1].key; all = false; yaw = md === 'ranged' ? Math.PI * 1.72 : Math.PI; layout(); return sel; }, get sel() { return sel; }, get all() { return all; },
    pick(k) { sel = k; all = false; layout(); }, swing, hold: k => holdOf(k), _tune(k, h) { holds[k] = { ...(HOLD0[k] || {}), ...h }; const r = R(k); if (r && r.hw2) { twoHand(r); return { cost: r.cost, wrist: r.wristDeg, err: r.ikErr }; } return null; }, holdKind: k => (mode === 'ranged' && TWOH[k]) ? 'two' : 'arm', _row: k => R(k), setHold(k, part) { if (!HOLD0[k]) return; holds[k] = { ...(holds[k] || {}), ...part }; saveHolds(); }, resetHold(k) { delete holds[k]; saveHolds(); }, hand(on) { return setHand(on == null ? !hand : on); }, get inHand() { return hand; }, showAll(on) { all = on == null ? !all : !!on; if (all) { yaw = Math.PI; spin = false; } layout(); return all; },
    view(k) { view = k; yaw = (mode === 'ranged' && k === 'three' ? Math.PI * 1.72 : VIEWS[k]) ?? yaw; spin = false; }, spin() { spin = !spin; return spin; },
    fit: () => fit, setFit(k, part) { if (!defaultFit(k)) return; fit[k] = { ...fit[k], ...part }; const r = R(k); if (r && r.mt) applyBackFit(r.mt, fit[k]); else if (r && k === 'sword') r.fox.userData.rig.applySwordFit(fit[k]); saveBackFit(fit); },
    resetFit(k) { fit[k] = defaultFit(k); const r = R(k); if (r && r.mt) applyBackFit(r.mt, fit[k]); else if (r && k === 'sword') r.fox.userData.rig.applySwordFit(fit[k]); saveBackFit(fit); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', pu); removeEventListener('pointermove', pm); renderer.dispose(); } };
}
