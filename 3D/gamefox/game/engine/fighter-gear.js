// s186 FOX FIGHTERS GEAR for the walk-around player (from minigames/kyoto/duel-foxes.js in FOXFIGHTERS-FINAL, s47-s71 sheath + holster).
// The SWORD lives in a sheath on the BACK (hilt over the sword-hand shoulder, strap across the chest), the LASER in a holster on the hip.
// HOLD 1 = draw / sheath the sword. TAP 1 unarmed = JAB · CROSS · HOOK · KICK combo; TAP 1 armed = 3-cut sword combo. 2 = laser comes out of the
// holster, fires, goes back after 2.5 s. Works on any cast fox made with gear 'both' (castKit make(key, { holster: true })).
//   const G = fighterGear({ THREE, M, toon }, fox)  → fox.userData.rig = G (animFox calls G.update(dt, speed) at the end of every frame)
//   G.toggle() · G.draw(on) · G.strike() → { n, kind, reach, k } · G.shoot() · G.drawn · G.busy()
import { SFX } from './fighter-sfx.js?v=s695c';   // s191 shared fighter sounds (tuned in Fighter Gear Lab → SOUNDS)
const BASE = { p: [-0.26, 1.98, -0.42], d: [0.77, -0.64, -0.1] }, FIT = { dx: 0, dy: -0.34, out: -0.08, tilt: -16, lean: 4, twist: 70 };   // Ben's Sword Workshop tuning (s68)
const PUNCH = [
  { kind: 'jab', arm: 0, dur: 0.2, reach: 1.9, k: 0.45 },
  { kind: 'cross', arm: 1, dur: 0.22, reach: 1.9, k: 0.5 },
  { kind: 'hook', arm: 0, dur: 0.26, reach: 2.0, k: 0.6 },
  { kind: 'kick', leg: 1, dur: 0.34, reach: 2.4, k: 0.85 }];
// s188 SWORD = the Meru Bridge combo (Ben): overhead CHOP · flat SWEEP · full SPIN (hits all round), glowing arc trail; taps during a cut queue the next one
const SLASH = [
  { kind: 'chop', dur: 0.24, reach: 2.7, k: 1 },
  { kind: 'sweep', dur: 0.24, reach: 2.7, k: 1 },
  { kind: 'spin', dur: 0.36, reach: 3.0, k: 1.4, cone: -1.1 }];
const lerp = (a, b, t) => a + (b - a) * t, BOLT_V = 70;
// s188b POWER SWING: hold 1 = wind up (sword back, glow builds for up to 1 s) · let go = a big spinning slam that hits all round
const POWER = { kind: 'power', dur: 0.46, cone: -1.1 };
const ss = t => t * t * (3 - 2 * t), cl = t => Math.max(0, Math.min(1, t));
export function fighterGear({ THREE, M, toon }, fox, o = {}) {
  const u = fox.userData, FP = u.P; if (!FP || !FP.sword || !FP.body) return null;
  const prev = u.rig || null, side = o.hiltSide ?? 1;   // +1 = hilt over the sword-hand (left, +x) shoulder
  // ---- back sheath ----
  const BA = new THREE.Object3D(); FP.body.add(BA);
  { const D2R = Math.PI / 180; BA.position.set(BASE.p[0] + FIT.dx, BASE.p[1] + FIT.dy, BASE.p[2] - FIT.out);
    BA.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...BASE.d).normalize()).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-FIT.lean * D2R, 0, FIT.tilt * D2R))).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), FIT.twist * D2R));
    if (side > 0) { BA.position.x = -BA.position.x; const q = BA.quaternion; q.set(q.x, -q.y, -q.z, q.w); }
    BA.scale.setScalar(0.85); }
  // s233 EDITABLE SWORD (Back Weapons Lab → SWORD): offsets on top of Ben's Sword Workshop fit, saved in localStorage backWeapons.fit.sword
  const BA0 = { p: BA.position.clone(), q: BA.quaternion.clone(), s: BA.scale.x };
  const applySwordFit = f => { if (!f) return; const D2R = Math.PI / 180; BA.position.set(BA0.p.x + (f.x || 0), BA0.p.y + ((f.y ?? 1.22) - 1.22), BA0.p.z + ((f.z ?? -0.45) + 0.45));
    BA.quaternion.copy(BA0.q).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((f.lean || 0) * D2R, 0, (f.ang || 0) * D2R))).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (f.twist || 0) * D2R)); BA.scale.setScalar(BA0.s * (f.s || 1)); };
  try { applySwordFit(((JSON.parse(localStorage.getItem('backWeapons.fit') || '{}') || {}).sword) || o.swordFit); } catch (e) {}
  // s662 WEAPON LOOK POLISH: worn lacquer + rim-lit brass (wear map + rim from the sword's own look, fox-kit weaponLook → FP.swLook)
  const SL = FP.swLook, lac = toon('#1f2a44').clone(), brass = SL ? SL.gold.clone() : toon('#d4a73a'), lea = toon('#4a2a17');
  if (SL) { lac.map = SL.wear; if (SL.navy.onBeforeCompile) { lac.onBeforeCompile = SL.navy.onBeforeCompile; lac.customProgramCacheKey = SL.navy.customProgramCacheKey; } brass.color.set('#d4a73a'); }
  const inlay = new THREE.MeshBasicMaterial({ color: '#7fe3ff', toneMapped: false });
  { const w0 = 0.085, w1 = 0.07, y0 = 0.14, y1 = 1.36, sh = new THREE.Shape(); sh.moveTo(-w0, y0); sh.lineTo(w0, y0); sh.lineTo(w1, y1 - 0.08); sh.quadraticCurveTo(w1, y1 + 0.02, 0, y1 + 0.04); sh.quadraticCurveTo(-w1, y1 + 0.02, -w1, y1 - 0.08); sh.closePath();
    const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.012, bevelSegments: 1, curveSegments: 4 }); sg.translate(0, 0, -0.02);
    M(sg, lac, 0, 0, 0, BA, 0.017).rotation.y = Math.PI / 2;
    M(new THREE.BoxGeometry(0.09, 0.12, 0.2), brass, 0, 0.19, 0, BA, 0.012);
    M(new THREE.BoxGeometry(0.084, 0.035, 0.18), brass, 0, 0.9, 0, BA, 0.008);
    M(new THREE.BoxGeometry(0.086, 0.035, 0.19), brass, 0, 0.55, 0, BA, 0.008);   // s662 second locket band
    const rv = SL ? SL.steel : brass;   // rivets: throat + both bands, both faces
    for (const [y, x, z] of [[0.19, 0.047, 0.065], [0.55, 0.045, 0.06], [0.9, 0.044, 0.055]]) for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.SphereGeometry(0.011, 6, 4), rv, sx * x, y, sz * z, BA, 0);
    for (const sz of [-1, 1]) { const len = y1 - 0.08 - y0, e = M(new THREE.BoxGeometry(0.05, len, 0.012), brass, 0, y0 + len / 2, sz * ((w0 + w1) / 2 + 0.016), BA, 0.006); e.rotation.x = -sz * (w0 - w1) / len; }   // gold edge trim
    for (const sx of [-1, 1]) for (const [ya, yb] of [[0.27, 0.51], [0.59, 0.86], [0.94, 1.2]]) M(new THREE.BoxGeometry(0.004, yb - ya, 0.012), inlay, sx * 0.0355, (ya + yb) / 2, 0, BA, 0);   // glowing cyan energy inlay, both faces
    const ch = M(new THREE.SphereGeometry(0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), brass, 0, 1.33, 0, BA, 0); ch.rotation.x = Math.PI; ch.scale.set(0.62, 0.9, 0.95); }
  // the sword on the back = a copy of the hand sword with the blade hidden (only grip + guard show over the shoulder)
  const back = FP.sword.clone(true); back.position.set(0, 0, 0); back.rotation.set(0, Math.PI, 0);   /* s233 Ben: flipped, the crest faces away from the body */ back.scale.setScalar(1); BA.add(back);
  back.traverse(m => { if (m.isMesh && m.material === FP.bladeMat) m.visible = false; if (m === FP.bladeHalo || (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending)) m.visible = false; });
  // strap: hilt shoulder → far hip, across the chest
  const STRAP = new THREE.Group(); STRAP.position.set(0, 1.18, 0.0); STRAP.rotation.set(0, 0, side * 0.7); FP.body.add(STRAP);
  { const R0 = 0.335, ring = M(new THREE.TorusGeometry(R0, 0.022, 5, 32), lea, 0, 0, 0, STRAP, 0); ring.rotation.x = Math.PI / 2; ring.scale.set(0.43 / Math.cos(0.7) / R0, 0.37 / R0, 2.3);
    M(new THREE.BoxGeometry(0.075, 0.09, 0.025), brass, 0, 0, 0.375, STRAP, 0.006); M(new THREE.BoxGeometry(0.045, 0.055, 0.03), lea, 0, 0, 0.376, STRAP, 0); M(new THREE.BoxGeometry(0.008, 0.06, 0.034), brass, 0, 0, 0.377, STRAP, 0); }   // s662 open buckle frame + prong
  // ---- hip holster (gun arm = arms[0], his right, −x) ----
  let HG = null; const HA = new THREE.Object3D(); HA.position.set(-0.375, 0.9, 0.06); HA.rotation.set(Math.PI / 2, 0, 0.1); HA.scale.setScalar(0.76); FP.body.add(HA);
  if (FP.gun) { HG = FP.gun.clone(true); HG.position.set(0, 0, 0); HG.rotation.set(0, 0, 0); HG.scale.copy(FP.gun.scale); HA.add(HG);
    HG.traverse(m => { if (m.isSprite) m.visible = false; });
    M(new THREE.BoxGeometry(0.13, 0.1, 0.26), toon('#3b2416'), 0, -0.02, -0.02, HA, 0.01); }
  // s188 sword arc trail (Meru Bridge) + LASER muzzle, flash and bolts
  const trailMat = new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const trail = new THREE.Mesh(new THREE.RingGeometry(0.7, 2.1, 32, 1, -1.25, 2.5), trailMat); trail.rotation.x = -Math.PI / 2; trail.position.y = 1.0; trail.visible = false; fox.add(trail);
  // s190 BLADE CHARGE (Ben: energy growing IN the blade): a glow shell hugging the blade that thickens, a white-hot core that FILLS from the hilt to the tip,
  // sparks pulled into the edge, a flicker at full, and a flash on release
  const EN = (() => { let bm = null; FP.sword.traverse(m => { if (!bm && m.isMesh && m.material === FP.bladeMat) bm = m; }); if (!bm) return null;
    const g0 = bm.geometry; g0.computeBoundingBox(); const bb = g0.boundingBox, sz = new THREE.Vector3(); bb.getSize(sz);
    const ax = sz.x >= sz.y && sz.x >= sz.z ? 'x' : sz.y >= sz.z ? 'y' : 'z', L = sz[ax], mid = new THREE.Vector3(); bb.getCenter(mid);
    const lo = mid.clone(), hi = mid.clone(); lo[ax] = bb.min[ax]; hi[ax] = bb.max[ax];
    const toS = p => p.clone().applyMatrix4(bm.matrix), hilt = toS(lo).length() < toS(hi).length() ? lo : hi, tipDir = hilt === lo ? 1 : -1;
    const add = THREE.NormalBlending, shellM = new THREE.MeshBasicMaterial({ color: 0x18c8ff, transparent: true, opacity: 0, blending: add, depthWrite: false }),   // normal blend: reads on light floors too
      coreM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: add, depthWrite: false }),
      sparkM = new THREE.MeshBasicMaterial({ color: 0x39e4ff, transparent: true, opacity: 0.95, depthWrite: false });
    const shell = new THREE.Mesh(g0, shellM); shell.position.copy(mid).multiplyScalar(0); shell.visible = false; bm.add(shell);
    const piv = new THREE.Object3D(); piv.position.copy(hilt); bm.add(piv); const core = new THREE.Mesh(g0, coreM); core.position.copy(hilt).multiplyScalar(-1); piv.add(core); piv.visible = false;
    const sg = new THREE.SphereGeometry(L * 0.028, 5, 4), sparks = [];
    for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(sg, sparkM); m.visible = false; bm.add(m); sparks.push({ m, t: 1, a: 0, r: 0, u: 0 }); }
    const other = ['x', 'y', 'z'].filter(k => k !== ax);
    return { bm, ax, L, mid, hilt, tipDir, other, shellM, coreM, shell, piv, sparks, flash: 0,
      set(c, t, full) { const pul = 0.75 + 0.25 * Math.sin(t * (10 + 26 * c)), fl = full ? 0.75 + 0.25 * Math.sin(t * 70) * Math.sin(t * 23) : 1;
        shell.visible = piv.visible = true; const th = 1.5 + 3.2 * c * pul; shell.scale.set(1, 1, 1); shell.scale[ax] = 1.03; for (const k of other) shell.scale[k] = th;
        shellM.opacity = (0.22 + 0.4 * c) * fl; shellM.color.setRGB(0.09 + 0.5 * c * c, 0.78 + 0.2 * c, 1);
        piv.scale.set(1, 1, 1); piv.scale[ax] = Math.max(0.02, Math.min(1, c * 1.08)); for (const k of other) piv.scale[k] = 1.15 + 0.6 * c; coreM.opacity = (0.55 + 0.45 * c) * fl;
        shell.renderOrder = 2; core.renderOrder = 3; const n = Math.round(4 + 10 * c); this.sparks.forEach((s, i) => { if (i >= n) { s.m.visible = false; return; }
          s.t += 0.016 * (2.5 + 3 * c); if (s.t >= 1) { s.t = 0; s.u = Math.random() * Math.min(1, c * 1.08 + 0.15); s.a = Math.random() * Math.PI * 2; s.r = L * (0.1 + 0.08 * Math.random()); }
          const r = s.r * (1 - s.t), p = s.m.position; p.copy(hilt); p[ax] += tipDir * L * s.u; p[other[0]] += Math.cos(s.a) * r; p[other[1]] += Math.sin(s.a) * r; s.m.visible = true; s.m.scale.setScalar(0.6 + 0.8 * s.t); }); },
      off() { shell.visible = piv.visible = false; this.sparks.forEach(s => { s.m.visible = false; s.t = 1; }); },
      burst(dt) { if (this.flash <= 0) return false; this.flash -= dt; const k = Math.max(0, this.flash / 0.35); shell.visible = true; piv.visible = true; for (const k2 of other) shell.scale[k2] = 1.3 + 2.2 * k; shell.scale[ax] = 1.05; shellM.opacity = 0.9 * k; shellM.color.setRGB(1, 1, 1); piv.scale[ax] = 1; coreM.opacity = k; if (this.flash <= 0) this.off(); return true; } };
  })();
  const muzzle = new THREE.Object3D(), flashMat = new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const flash = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), flashMat); flash.visible = false;
  if (FP.gun) { muzzle.position.set(0, 0.16, 0.7); FP.gun.add(muzzle); flash.position.set(0, 0.16, 0.74); FP.gun.add(flash); }
  const boltGeo = new THREE.CapsuleGeometry(0.06, 0.7, 3, 6), glowGeo = new THREE.CapsuleGeometry(0.15, 0.8, 3, 6); boltGeo.rotateX(Math.PI / 2); glowGeo.rotateX(Math.PI / 2);
  const boltMat = new THREE.MeshBasicMaterial({ color: 0xcffaff }), glowMat = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const popGeo = new THREE.SphereGeometry(0.3, 8, 6), bolts = [], pops = [], _v = new THREE.Vector3();
  // s192 SUPER FX: beam (cylinder along +z after lookAt) + ground shockwave ring
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true); beamGeo.rotateX(Math.PI / 2); beamGeo.translate(0, 0, 0.5);
  const waveGeo = new THREE.RingGeometry(0.6, 1, 40); waveGeo.rotateX(-Math.PI / 2); const sfx = [];
  const addFx = (m, life, step) => { const sc = fox.parent; if (!sc) return; sc.add(m); sfx.push({ m, t: 0, life, step }); };
  const S = { drawn: !!o.drawn, fists: !!o.fists, idle: 0, ch: null,   // s188c (Ben): SWORD MODE = tap 1 quick-draws + cuts, the sword goes back after 3 s unused (like the laser) · FISTS (H) = unarmed on purpose
    gun: 0, aim: 0, rec: 0, q: null, dr: null, st: null, combo: 0, lastT: 9, t: 0 };
  // the hand sword / gun only show while drawn. Other modules still switch them on / off (shops hide the sword for a rolling pin, swimming hides both):
  // their writes go to ext, and what three.js reads is ext AND drawn, so nothing can bring a sheathed sword back into the paw.
  const swOut = () => (S.dr ? S.dr.swap : S.drawn), gunOut = () => S.gun > 0;
  const gate = (obj, on) => { if (!obj) return; let ext = obj.visible; Object.defineProperty(obj, 'visible', { get: () => ext && on(), set: v => { ext = !!v; }, configurable: true }); };
  gate(FP.sword, swOut); gate(FP.gun, gunOut);
  const show = () => { const sw = swOut(); back.visible = !sw; if (HG) HG.visible = !gunOut();
    u.hold = { right: sw && !S.dr, left: S.gun > 0 }; };
  show();
  // s194 HURT REACTION (Ben: the player must visibly change when hit): a white pop then a red flush over the whole fox (his own material copies,
  // so NPCs sharing the toon cache never turn red), a flinch AWAY from the blow (lean, twist, head snap, arms thrown out), a quick squash.
  // hurt(fromX, fromZ, k): k 1 = a real hit · k 0.3 = a blow the shield caught (tiny flinch, no red)
  const own = new WeakSet(), red = new THREE.Color(1, 0.05, 0.02), wht = new THREE.Color(1, 1, 1); let tinted = [];
  const tintList = () => { const L = []; fox.traverse(m => { if (!m.isMesh || !m.material || m === bubSkip(m)) return; let mt = m.material; if (Array.isArray(mt) || !mt.emissive || mt === FP.bladeMat || mt === FP.tipMat || (mt.userData && mt.userData.noTint) || mt.blending === THREE.AdditiveBlending || mt.isShaderMaterial) return;
      if (!own.has(mt)) { mt = mt.clone(); own.add(mt); mt.userData.e0 = mt.emissive.clone(); mt.userData.i0 = mt.emissiveIntensity ?? 1; m.material = mt; } L.push(mt); }); return L; };
  const bubSkip = m => (m.renderOrder >= 6 ? m : null);
  const HU = { t: 9, k: 0, dx: 0, dz: 1, red: 0 };
  const start = () => { const L = S.drawn ? SLASH : PUNCH; if (S.lastT > 0.75) S.combo = 0; const n = S.combo % L.length; S.combo++; S.lastT = 0; S.st = { ...L[n], n, t: 0, sword: S.drawn }; SFX.play(S.drawn ? (S.st.kind === 'spin' ? 'spin' : 'cut') : (S.st.kind === 'kick' ? 'kick' : 'punch')); return S.st; };
  // s340 Ben's recorded super sounds: WHIRLWIND KICK + FOX BEAM (audio/supers/super-whirl / super-beam.mp3)
  const recSup = n => { try { if (window.__muteAll) return; const a = new Audio(new URL('../audio/supers/super-' + n + (n === 'whirl' ? '.wav' : '.mp3'), import.meta.url).href); a.volume = 0.9; a.play().catch(() => {}); } catch (e) {} };
  const G = {
    parts: [BA, STRAP, HA],   // s728da the sheath, strap + holster (species with their own weapons hide them)
    get drawn() { return S.drawn; }, get drawing() { return S.dr ? S.dr.on : S.drawn; },
    busy: () => !!S.dr, get striking() { return !!(S.st || S.dr || S.q); }, get charging() { return !!S.ch; }, get fists() { return S.fists; },
    // s192 SUPERS: superMove('whirl'|'beam'|'slam') runs the pose; beamFx(from, to) / the slam wave are drawn here
    superMove(kind) { if (kind === 'whirl') recSup('whirl'); S.st = null; S.q = null; S.ch = null; SFX.loopStop(); EN && EN.off(); S.idle = 0; S.sp = { kind, t: 0, dur: kind === 'whirl' ? 0.7 : kind === 'slam' ? 0.8 : 0.9, landed: false }; if (kind === 'beam') { S.gun = 3; S.aim = 0.9; if (FP.gun) { FP.gun.visible = true; FP.gun.rotation.set(1.31, 0, 0); } show(); FP.arms[0].rotation.set(-1.36, 0, 0.04); fox.updateMatrixWorld(true);   /* s339 Ben: gun aimed level first, so the beam leaves the barrel (was too high) */ return muzzle.getWorldPosition(new THREE.Vector3()); } return null; },
    get superBusy() { return !!S.sp || !!S.pp; },
    // s340 SUPER POSES (engine/super-fx.js): fn(p 0..1, { A, Lg, B, H, t }) runs LAST every frame for dur s and may return { bx, bz, lift, pz } (body lean / roll / raise / slide, taken off again next frame)
    superPose(dur, fn) { S.st = null; S.q = null; S.ch = null; S.pp = { t: 0, dur, fn }; S.idle = 0; },
    // s339 Ben: FOX BEAM polished: a short charge at the barrel, then glow + body + white-hot core that PULSE, bright bands racing down it, a spiral ribbon, flares at both ends
    beamFx(from, to) { const d = to.clone().sub(from), L = Math.max(4, d.length()), aim = from.clone().add(d), LIFE = 1.35, CH = 0.14;
      const add = (col, op) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const on = q => { const t = (q * LIFE - CH) / (LIFE - CH); return t < 0 ? 0 : t < 0.08 ? t / 0.08 : t > 0.78 ? Math.max(0, 1 - (t - 0.78) / 0.22) : 1; };
      for (const [r, col, op, ph] of [[0.62, 0x18c8ff, 0.32, 0], [0.32, 0x5fe0ff, 0.7, 1.3], [0.12, 0xffffff, 1, 2.1]]) { const m = new THREE.Mesh(beamGeo, add(col)); m.renderOrder = 4; m.position.copy(from); m.lookAt(aim); m.scale.set(0.01, 0.01, L);
        addFx(m, LIFE, (x, q) => { const k = on(q), t = q * LIFE, pulse = 1 + 0.22 * Math.sin(t * 26 + ph) + 0.08 * Math.sin(t * 61); x.scale.x = x.scale.y = Math.max(0.001, r * k * pulse); x.material.opacity = op * k * (0.85 + 0.15 * Math.sin(t * 40 + ph)); }); }
      for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(waveGeo, add(i % 2 ? 0xffffff : 0x9ff3ff)); m.renderOrder = 5; m.position.copy(from); m.lookAt(aim); m.rotateX(Math.PI / 2);
        addFx(m, LIFE, (x, q) => { const k = on(q), u = ((q * LIFE * 1.6) + i / 6) % 1; x.position.copy(from).addScaledVector(d, u * (L / d.length())); x.scale.setScalar(0.42 * (0.7 + 0.5 * Math.sin(u * Math.PI))); x.material.opacity = k * Math.sin(u * Math.PI) * 0.9; }); }
      { const N = 64, pts = []; for (let i = 0; i <= N; i++) pts.push(new THREE.Vector3(0, 0, i / N)); const g = new THREE.BufferGeometry().setFromPoints(pts), m = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xbff6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.copy(from); m.lookAt(aim); m.scale.set(1, 1, L); m.renderOrder = 5;
        addFx(m, LIFE, (x, q) => { const k = on(q), t = q * LIFE, p = g.attributes.position; for (let i = 0; i <= N; i++) { const z = i / N, a = z * L * 3.2 - t * 18; p.setXY(i, Math.cos(a) * 0.36, Math.sin(a) * 0.36); } p.needsUpdate = true; x.material.opacity = 0.8 * k; }); }
      const flare = (at, col, big, tail) => { const m = new THREE.Mesh(popGeo, add(col)); m.position.copy(at); m.renderOrder = 6;
        addFx(m, LIFE, (x, q) => { const t = q * LIFE, ch = t < CH ? t / CH : 0, k = on(q); x.scale.setScalar((tail ? k : Math.max(ch * 0.9, k)) * big * (1 + 0.25 * Math.sin(t * 34))); x.material.opacity = Math.max(tail ? 0 : ch, k) * 0.95; }); };
      flare(from, 0xffffff, 0.9, false); flare(from, 0x18c8ff, 1.7, false); flare(aim, 0xffffff, 1.2, true); flare(aim, 0x18c8ff, 2.4, true);
      recSup('beam'); },
    hurt(fx, fz, k = 1, dur = 0.55) { HU.dur = dur; fox.updateMatrixWorld(true); const p = fox.getWorldPosition(new THREE.Vector3()); let dx = p.x - (fx ?? p.x), dz = p.z - (fz ?? p.z - 1); const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const yaw = fox.rotation.y, c = Math.cos(yaw), s2 = Math.sin(yaw); HU.dx = dx * c - dz * s2; HU.dz = dx * s2 + dz * c; HU.t = 0; HU.k = k; if (k >= 0.6) { HU.red = 1; tinted = tintList(); } },   // local push direction (away from the blow)
    // s199 POWER-UP FX over the fox: rings rise up round him, motes stream IN, a bright flash at the chest. powerFx(0x2ee6ff) energy · other colours for other pickups
    powerFx(col = 0x2ee6ff, big = 1) { const sc = fox.parent; if (!sc) return; fox.updateMatrixWorld(true); const c0 = fox.getWorldPosition(new THREE.Vector3());
      for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.position.copy(c0); m.renderOrder = 8;
        addFx(m, 0.9, (x, q) => { const u = Math.max(0, q * 1.25 - i * 0.18); x.position.set(c0.x, c0.y + 0.1 + u * 2.3, c0.z); x.scale.setScalar(0.85 * (1 - u * 0.45) * big); x.material.opacity = u > 0 && u < 1 ? Math.sin(u * Math.PI) * 0.95 : 0; }); }
      for (let i = 0; i < 16; i++) { const a = Math.random() * Math.PI * 2, R0 = 1.4 + Math.random() * 0.8, h0 = 0.2 + Math.random() * 2.2, m = new THREE.Mesh(popGeo, new THREE.MeshBasicMaterial({ color: i % 3 ? col : 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.setScalar(0.18); m.renderOrder = 8;
        const d0 = Math.random() * 0.25; addFx(m, 0.75, (x, q) => { const u = Math.max(0, (q - d0) / (1 - d0)), k = u * u; x.position.set(c0.x + Math.cos(a + u * 2) * R0 * (1 - k), c0.y + h0 + (1.1 - h0) * k, c0.z + Math.sin(a + u * 2) * R0 * (1 - k)); x.material.opacity = u > 0 ? 1 - k * 0.6 : 0; x.scale.setScalar(0.1 + 0.12 * (1 - k)); }); }
      const fl = new THREE.Mesh(popGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fl.renderOrder = 9;
      addFx(fl, 0.95, (x, q) => { const u = Math.max(0, (q - 0.6) / 0.4); x.position.set(c0.x, c0.y + 1.1, c0.z); x.scale.setScalar(u > 0 ? 1 + u * 3 : 0.001); x.material.opacity = u > 0 ? 0.9 * (1 - u) : 0; });
      HU.glow = { t: 0, col: new THREE.Color(col) }; tinted = tintList(); },
    // s209 INVINCIBLE look: the whole fox cycles gold → white → rainbow, faster in the last 2 s (a warning it is ending)
    starTick(dt, left) { if (!HU.star) { HU.star = { t: 0 }; tinted = tintList(); } const T2 = HU.star; T2.t += dt; const sp = left < 2 ? 22 : 9, c = new THREE.Color().setHSL((T2.t * sp / 6) % 1, 1, 0.55); if (HU.red > 0) return; for (const mt of tinted) { mt.emissive.copy(c); mt.emissiveIntensity = 0.9 + 0.3 * Math.sin(T2.t * sp); } },
    starOff() { HU.star = null; for (const mt of tinted) { mt.emissive.copy(mt.userData.e0); mt.emissiveIntensity = mt.userData.i0; } },
    touch() { S.idle = 0; }, sfx: (evt, o) => SFX.play(evt, o),   // a map with its own swing code keeps the sword out while it swings
    showGun(sec = 3) { S.gun = Math.max(S.gun, sec); if (FP.gun) FP.gun.visible = true; show(); },   // a map with its own laser code: out of the holster, back after sec
    aimHold(sec = 0.5) { S.gun = Math.max(S.gun, sec); S.aim = Math.max(S.aim, sec); if (FP.gun) FP.gun.visible = true; show(); },   // s662g: out + held level at aim (no shot, no sound)
    setFists(on) { S.fists = !!on; S.q = null; if (S.ch) SFX.loopStop(); S.ch = null; if (S.fists && S.drawn) G.draw(false); return S.fists; },
    // charge(): start the wind-up (sword drawn, nothing else running) · release() → the power move { k, reach } (k 1.6 → 3.0 with the charge)
    charge() { if (S.fists || S.ch) return false; S.idle = 0; if (!S.drawn) { if (!S.dr) G.draw(true, true); if (S.dr && S.dr.on) { S.dr.chg = true; S.q = null; return true; } return false; } if (S.dr) return false; S.st = null; S.q = null; S.ch = { t: 0 }; SFX.loopStart('charge'); return true; },
    release() { S.idle = 0; trail.scale.setScalar(1); SFX.loopStop(); if (S.ch) SFX.play('power', { v: 0.6 + 0.4 * cl(S.ch.t) }); if (EN && S.ch) EN.flash = 0.35 * (0.4 + 0.6 * cl(S.ch.t));  if (S.dr && S.dr.chg) { S.dr.chg = false; return null; } if (!S.ch) return null; const c = cl(S.ch.t / 1.0); S.ch = null; S.combo = 0; S.lastT = 0; S.st = { ...POWER, n: 0, t: 0, sword: true, c, k: 1.6 + 1.4 * c, reach: 3.0 + 0.8 * c }; return S.st; },
    cancelCharge() { S.ch = null; SFX.loopStop(); EN && EN.off(); },
    draw(on, quick) { on = !!on; if (on === S.drawn || S.dr) return false; S.idle = 0; S.dr = { on, t: 0, dur: quick ? 0.22 : 0.42, swap: S.drawn }; SFX.play(on ? 'draw' : 'sheath'); S.st = null; if (on) FP.sword.visible = true; return true; },
    toggle() { return G.draw(!S.drawn); },
    // strike(cb): starts now → returns the move; a sword tap in the back half of a cut is QUEUED → returns null and cb(move) runs when it starts
    strike(cb) { S.idle = 0; if (S.sp) return null;
      if (S.dr) { if (S.dr.on && !S.fists) S.q = cb || (() => {}); return null; }
      if (!S.drawn && !S.fists) { G.draw(true, true); S.q = cb || (() => {}); return null; }   // quick draw, the cut follows
      if (S.st && S.st.sword) { if (S.st.t > S.st.dur * 0.35) S.q = cb || (() => {}); return null; }
      return start(); },
    // shoot(): aims the arm at once, fires the muzzle flash + recoil, returns the muzzle in world space (where the bolt leaves)
    shoot() { SFX.play('laser'); const first = S.gun <= 0; S.aim = 0.62; S.gun = 3.0; S.rec = 1; if (FP.gun) FP.gun.visible = true; show();
      if (!FP.gun) return null; if (first || S.aim > 0) { FP.arms[0].rotation.set(-1.36, 0, 0.04); FP.gun.rotation.set(1.31, 0, 0); }
      flashMat.opacity = 1; flash.visible = true; fox.updateMatrixWorld(true); return muzzle.getWorldPosition(new THREE.Vector3()); },
    // bolt(from, to, hit): a short bright bolt flies from the muzzle to the target point; a pop where it lands if it hit something
    bolt(from, to, hit) { const sc = fox.parent; if (!sc || !from) return; const d = (to ? _v.subVectors(to, from) : _v.set(Math.sin(fox.rotation.y), 0, Math.cos(fox.rotation.y)).multiplyScalar(16)).clone(), L = d.length() || 1;
      const m = new THREE.Mesh(boltGeo, boltMat); m.add(new THREE.Mesh(glowGeo, glowMat)); m.position.copy(from); m.lookAt(from.clone().add(d)); sc.add(m);
      bolts.push({ m, v: d.multiplyScalar(BOLT_V / L), life: Math.max(0.05, L / BOLT_V), hit: !!hit, sc }); },
    update(dt, speed) { S.t += dt; S.lastT += dt; if (S.gun > 0) { S.gun -= dt; if (S.gun <= 0) { show(); SFX.play('holster'); } }
      const A = FP.arms, Lg = FP.legs, B = FP.body; if (S.bx) { B.rotation.x -= S.bx; S.bx = 0; }   // animFox damps body.rotation.x: take last frame's lean back off first
      if (S.dr) { const D = S.dr; D.t += dt; const q = cl(D.t / D.dur), up = Math.sin(Math.PI * q);   // reach up over the shoulder, swap at the top, bring it down
        const sw = q < 0.5 ? !D.on : D.on; if (sw !== D.swap) { D.swap = sw; show(); }
        A[1].rotation.x = A[1].rotation.x * (1 - up) - 3.25 * up; A[1].rotation.z = 0.12 + 0.3 * up; FP.head.rotation.y += side * 0.25 * up;
        if (q >= 1) { S.drawn = D.on; S.dr = null; show(); S.idle = 0;
          if (D.on && D.chg) { S.ch = { t: 0 }; SFX.loopStart('charge'); } else if (D.on && S.q) { const cb = S.q; S.q = null; cb(start()); } } }
      // sword mode: back on the back after 3 s unused
      if (S.drawn && !S.dr && !S.st && !S.ch) { S.idle += dt; if (S.idle > 3) G.draw(false); } else if (S.st || S.ch) S.idle = 0;
      // s187 LASER: quick draw from the hip → arm snaps level at the target, recoil kick, low-ready, then the hand goes back to the holster
      // s188 LASER (Meru Bridge feel): arm held level while firing, each shot kicks the arm + barrel up (recoil), then low-ready, then back in the holster
      S.rec = Math.max(0, S.rec - dt * 9); if (flashMat.opacity > 0) { flashMat.opacity = Math.max(0, flashMat.opacity - dt * 14); flash.scale.setScalar(0.6 + flashMat.opacity * 0.8); if (!flashMat.opacity) flash.visible = false; }
      if (S.gun > 0 && !S.dr) { const a = A[0];
        let x = a.rotation.x, z = a.rotation.z, rel = 0;
        if (S.aim > 0) { S.aim -= dt; x = -1.36 - S.rec * 0.2; z = 0.04; rel = S.rec * 0.45; }
        else if (S.gun < 0.25) { const k = ss(1 - S.gun / 0.25); x = x * (1 - k) + 0.12 * k; z = z * (1 - k) - 0.22 * k; }
        a.rotation.x = x; a.rotation.z = z;
        if (FP.gun) FP.gun.rotation.set(-x - 0.05 - rel, 0, 0); }
      for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.life -= dt; b.m.position.addScaledVector(b.v, dt);
        if (b.life <= 0) { if (b.hit) { const p = new THREE.Mesh(popGeo, glowMat.clone()); p.position.copy(b.m.position); b.sc.add(p); pops.push({ m: p, t: 0 }); } b.sc.remove(b.m); bolts.splice(i, 1); } }
      for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt; const q = p.t / 0.16; p.m.scale.setScalar(0.5 + q * 1.4); p.m.material.opacity = 0.8 * (1 - q); if (q >= 1) { p.m.parent && p.m.parent.remove(p.m); p.m.material.dispose(); pops.splice(i, 1); } }
      if (S.sp) { const X = S.sp; X.t += dt; const p = cl(X.t / X.dur), sp = ss(p);
        if (X.kind === 'whirl') { Lg[1].rotation.x = -1.45 * Math.sin(Math.PI * Math.min(1, p * 1.2)); Lg[0].rotation.x = 0.2; B.rotation.y = -sp * Math.PI * 4; A[0].rotation.set(-0.4, 0, -1.3); A[1].rotation.set(-0.4, 0, 1.3); fox.userData.hop = Math.max(fox.userData.hop || 0, Math.sin(p * Math.PI) * 0.5);
          trail.visible = true; trail.rotation.z = -p * Math.PI * 4; trailMat.opacity = Math.sin(p * Math.PI) * 0.8; trail.scale.setScalar(1.3); }
        else if (X.kind === 'slam') { const up = p < 0.55 ? Math.sin((p / 0.55) * Math.PI / 2) : Math.max(0, 1 - (p - 0.55) / 0.1); B.position.y += 1.2 * up; const dn = p > 0.55;
          A[0].rotation.set(dn ? -0.7 : -3.0 * Math.min(1, p * 3), 0, -0.2); A[1].rotation.set(dn ? -0.7 : -3.0 * Math.min(1, p * 3), 0, 0.2); Lg[0].rotation.x = Lg[1].rotation.x = dn ? 0.3 : -0.6 * up; S.bx = dn ? 0.25 : -0.15 * up; B.rotation.x += S.bx;
          if (p >= 0.62 && !X.landed) { X.landed = true; SFX.play('power', { p: 0.6 }); const w = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: 0x18c8ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); fox.getWorldPosition(w.position); w.position.y += 0.06; addFx(w, 0.5, (x, q) => { x.scale.setScalar(0.5 + 4.2 * q); x.material.opacity = 0.9 * (1 - q); }); } }
        else { S.aim = Math.max(S.aim, 0.1); }
        if (p >= 1) { S.sp = null; B.rotation.y = 0; trail.visible = false; trail.scale.setScalar(1); trailMat.opacity = 0; } }
      for (let i = sfx.length - 1; i >= 0; i--) { const f = sfx[i]; f.t += dt; const q = Math.min(1, f.t / f.life); f.step(f.m, q); if (q >= 1) { f.m.parent && f.m.parent.remove(f.m); f.m.material.dispose(); sfx.splice(i, 1); } }
      if (HU.t < 0.5) { HU.t += dt; const q = HU.t / 0.5, e = Math.sin(Math.PI * Math.min(1, q * 2.2)) * (1 - q) * HU.k;   // fast snap, slow recover
        const fb = HU.dz, sd = HU.dx; B.rotation.x += 0.55 * fb * e; B.rotation.z = (B.rotation.z || 0) * 0.5 - 0.45 * sd * e; B.rotation.y += 0.35 * sd * e;
        FP.head.rotation.x = (FP.head.rotation.x || 0) + 0.5 * fb * e; FP.head.rotation.z = (FP.head.rotation.z || 0) - 0.4 * sd * e;
        A[0].rotation.z -= 0.7 * e; A[1].rotation.z += 0.7 * e; A[0].rotation.x -= 0.5 * e; A[1].rotation.x -= 0.5 * e;
        const sq = 1 - 0.12 * e; B.scale.set(1 + 0.08 * e, sq, 1 + 0.08 * e); if (q >= 1) B.scale.set(1, 1, 1); }
      if (HU.glow && HU.red <= 0 && !HU.star) { const G2 = HU.glow; G2.t += dt; const q = G2.t / 1.4, e = q < 0.6 ? 0 : Math.sin(Math.min(1, (q - 0.6) / 0.4) * Math.PI); for (const mt of tinted) { if (q >= 1) { mt.emissive.copy(mt.userData.e0); mt.emissiveIntensity = mt.userData.i0; } else { mt.emissive.copy(G2.col); mt.emissiveIntensity = 1.2 * e; } } if (q >= 1) HU.glow = null; }
      if (HU.red > 0) { HU.red = Math.max(0, HU.red - dt / (HU.dur || 0.55)); const r = HU.red, pop = HU.t < 0.07;
        for (const mt of tinted) { if (r <= 0) { mt.emissive.copy(mt.userData.e0); mt.emissiveIntensity = mt.userData.i0; } else { mt.emissive.copy(pop ? wht : red); const on = Math.floor(HU.t * 16) % 2 === 0; mt.emissiveIntensity = pop ? 1.0 : (on ? 1.8 : 0.35) * Math.min(1, 0.4 + r); } } }   // s199 Ben: FLASH RED while hurt (no see-through flicker)
      if (EN && !S.ch && !EN.burst(dt) && EN.shell.visible) EN.off();
      if (S.ch) { const C = S.ch; C.t += dt; const c = cl(C.t / 1.0), w = ss(cl(C.t / 0.18)), a = A[1];
        a.rotation.set(lerp(a.rotation.x, -2.9, w), 0, lerp(a.rotation.z, 0.75, w)); FP.sword && FP.sword.rotation.set(Math.PI - 0.5, 0, 0);
        B.rotation.y = 0.75 * w; S.bx = -0.1 * w; B.rotation.x += S.bx; A[0].rotation.x = -0.6 * w;
        const pul = 0.7 + 0.3 * Math.sin(C.t * (14 + 20 * c)); if (FP.bladeMat) FP.bladeMat.emissiveIntensity = 1.5 + 5 * c * pul;
        SFX.loopLevel(c); if (EN) EN.set(c, C.t, c >= 1); else { trail.visible = true; trail.scale.setScalar(0.55 + 0.35 * c); trail.rotation.z = C.t * (6 + 14 * c); trailMat.opacity = (0.15 + 0.45 * c) * pul; }   // s190: the energy builds in the blade
        if (c >= 1) { a.rotation.x += Math.sin(C.t * 60) * 0.03; } }   // the blade glows brighter as the swing charges
      /* s258 LOW GUARD while the sword is out: blade held forward + out to the side, never across the chest
         s662 (Ben: "the hand is shaking"): the old blend only moved dt*12 of the way each frame from whatever animFox had just written, so the arm
         sat part-way between the idle swing and the guard and jittered with every frame-time change. Now the guard itself is held (eased in over
         ~0.17 s, out the same way), with only a slow, tiny breathing sway. */
      if (!S.st && S.drawn && !S.dr && !S.ch && !(S.gun > 0)) { const a1 = A[1]; S.lg = Math.min(1, (S.lg || 0) + dt * 6); const w = ss(S.lg), br = Math.sin(S.t * 1.6) * 0.025;
        a1.rotation.x = lerp(a1.rotation.x, -0.75 + br, w); a1.rotation.z = lerp(a1.rotation.z, 0.5, w); a1.rotation.y = lerp(a1.rotation.y, 0, w); FP.sword && FP.sword.rotation.set(Math.PI - 0.6 * w, 0, 0); } else S.lg = 0;
      if (S.st) { const T = S.st; T.t += dt; const q = cl(T.t / T.dur), e = Math.sin(Math.PI * Math.min(1, q * 1.15)), s = ss(q);
        if (T.sword) { const a = A[1], p = q, sp = s, side = T.n === 1 ? 1 : -1;   // Meru Bridge poses (meru-bridge.js P.pose)
          if (T.kind === 'power') { const c = T.c || 0; a.rotation.set(lerp(-2.9, -0.4, Math.pow(p, 0.6)), 0, lerp(0.75, -0.3, sp)); FP.sword && FP.sword.rotation.set(Math.PI - 0.2, 0, 0); B.rotation.y = lerp(0.75, -Math.PI * 2, sp); fox.userData.hop = Math.max(fox.userData.hop || 0, Math.sin(p * Math.PI) * (0.3 + 0.25 * c)); S.bx = 0.2 * Math.sin(p * Math.PI); B.rotation.x += S.bx; }
          else if (T.kind === 'chop') { const q2 = p < 0.3 ? 0 : Math.pow((p - 0.3) / 0.7, 0.7); a.rotation.set(p < 0.3 ? lerp(-1.0, -2.9, p / 0.3) : lerp(-2.9, -0.85, q2), 0, 0.12); FP.sword && FP.sword.rotation.set(Math.PI - lerp(0.3, 0.75, q2), 0, 0);   /* s258 the chop follows through IN FRONT (blade forward-down), never behind the legs */ S.bx = p < 0.3 ? -0.08 : 0.16 * Math.sin((p - 0.3) / 0.7 * Math.PI); B.rotation.x += S.bx; }
          else if (T.kind === 'sweep') { a.rotation.set(-1.4, 0, lerp(1.2, -0.45, sp)); FP.sword && FP.sword.rotation.set(Math.PI - 0.15, 0, 0); B.rotation.y = lerp(0.65, -0.8, sp); }   /* s258 the arm stops before crossing the chest; the torso twist carries the blade round the front (no blade through the body) */
          else { a.rotation.set(-1.5, 0, 0.9); FP.sword && FP.sword.rotation.set(Math.PI - 0.2, 0, 0); B.rotation.y = -sp * Math.PI * 2; fox.userData.hop = Math.max(fox.userData.hop || 0, Math.sin(p * Math.PI) * 0.25); }
          trail.visible = true; trail.rotation.z = (T.kind === 'spin' || T.kind === 'power') ? -p * Math.PI * 2 : side * lerp(1.0, -1.0, p) + Math.PI; trailMat.opacity = Math.sin(p * Math.PI) * (T.kind === 'power' ? 0.95 : 0.6); if (T.kind === 'power') trail.scale.setScalar(1.0 + 0.25 * (T.c || 0)); else trail.scale.setScalar(1); }
        else if (T.kind === 'kick') { Lg[T.leg].rotation.x = -1.55 * e; Lg[1 - T.leg].rotation.x = 0.15 * e; S.bx = -0.18 * e; B.rotation.x += S.bx; B.rotation.y = 0.3 * e; A[0].rotation.x = -0.9 * e; A[1].rotation.x = -0.6 * e; }
        else { const a = A[T.arm], o2 = A[1 - T.arm], sg = T.arm ? 1 : -1;
          if (T.kind === 'hook') { a.rotation.x = -1.5 * e; a.rotation.z = sg * (1.1 - 1.6 * s) * e; B.rotation.y = -sg * 0.55 * e; }
          else { a.rotation.x = -1.6 * e; a.rotation.z = sg * 0.05; B.rotation.y = -sg * 0.35 * e; }
          o2.rotation.x = -0.9; o2.rotation.z = -sg * 0.25; }   // the other fist up in guard
        if (q >= 1) { S.st = null; B.rotation.y = 0; trail.visible = false; trailMat.opacity = 0;
          if (S.q && S.drawn) { const cb = S.q; S.q = null; const N = start(); cb(N); } else S.q = null; } }
      else if (!S.dr && B.rotation.y) B.rotation.y *= Math.max(0, 1 - dt * 12);
      if (S.pz) { B.position.z -= S.pz; S.pz = 0; } if (S.bz) { B.rotation.z -= S.bz; S.bz = 0; }
      if (S.pp) { const P = S.pp; P.t += dt; const p = cl(P.t / P.dur); let o = null; try { o = P.fn(p, { A, Lg, B, H: FP.head, t: P.t, sword: FP.sword }); } catch (e) {} o = o || {}; S.idle = 0;
        if (o.bx) { S.bx = (S.bx || 0) + o.bx; B.rotation.x += o.bx; } if (o.bz) { S.bz = o.bz; B.rotation.z += o.bz; } if (o.lift) B.position.y += o.lift; if (o.pz) { S.pz = o.pz; B.position.z += o.pz; }
        if (p >= 1) { S.pp = null; B.rotation.y = 0; A[0].rotation.y = A[1].rotation.y = 0; A[1].rotation.z = 0.12; FP.head.rotation.x = FP.head.rotation.z = 0; } }
      if (prev && prev.update) prev.update(dt, speed); },
  };
  G.backAnchor = BA; G.strap = STRAP; G.hipAnchor = HA; G.applySwordFit = applySwordFit;   // s223 Back Weapons Lab: another weapon can take the sword's place on the back
  u.rig = G; return G;
}
