// HOPE's long white cane: a posable cane + right arm + walk that keep the cane IN STEP.
// Measurements are in "Hope cm": her sternum is 117 cm, so the standard 122 cm cane reaches 5 cm above it.
// Two-point touch: left foot forward = tip taps on her RIGHT, right foot forward = tip taps on her LEFT;
// the tip lifts only at the middle of the arc. Constant contact: the tip stays on the ground.
// All movement comes from the wrist: the hand stays at her midline, only the cane's angle changes.
export const CANE_KEY = 'meru.cane.v1';
export const STERNUM_CM = 117;
export const CANE_DEFAULTS = {length: 122, grip: 92, handOffset: 15, arc: 13, steps: 2.1, lift: 4.5, technique: 'two-point', speed: 1.2};   // Hope's tuned cane (saved from the workshop)
export function loadCaneLocal() { try { const s = localStorage.getItem(CANE_KEY); return s ? { ...CANE_DEFAULTS, ...JSON.parse(s) } : null; } catch (e) { return null; } }
export async function loadCane(base = document.baseURI) {
  const local = loadCaneLocal(); if (local) return local;
  try { const r = await fetch(new URL('presets/cane.json', base).href, { cache: 'no-store' }); if (r.ok) return { ...CANE_DEFAULTS, ...(await r.json()) }; } catch (e) {}
  return { ...CANE_DEFAULTS };
}
export function saveCane(cfg) { localStorage.setItem(CANE_KEY, JSON.stringify(cfg)); }

export function caneKit({ THREE, M, toon }) {
  const DOWN = new THREE.Vector3(0, -1, 0);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function attach(fox, cfg0 = {}) {
    try { const g = JSON.parse(localStorage.getItem('cane.grip.v1') || 'null'); if (g) cfg0 = { ...cfg0, ...g }; } catch (e) {}   // s665e Cane Grip Workshop: how her hand holds the cane
    const u = fox.userData, P = u.P, body = P.body;
    const arm = P.arms[cfg0.arm ?? 0];          // s91: cfg.arm picks the arm (0 = her RIGHT arm, the default) (she faces +z, so her right is -x)
    const side = Math.sign(arm.position.x) || -1;
    const meshes = arm.children.filter(c => c.isMesh);
    const sleeveMat = meshes[0] ? meshes[0].material : toon('#e7edf4');
    const pawM = meshes.filter(c => c.geometry.type === 'SphereGeometry').pop(); const pawMat = pawM ? pawM.material : toon('#f8fafc');
    // s662s JOINTED HOPE (Ben): with elbows + fingers (fox-kit jointLimbs) her OWN right arm holds the cane (2-bone IK below, real fingers round the grip);
    // the old stand-in capsule arm is only built for an unjointed Hope
    const JF = P.fore && P.fore[cfg0.arm ?? 0], JH = P.hands && P.hands[cfg0.arm ?? 0], JOINTED = !!(JF && JH && JH.fingers);
    if (!JOINTED) arm.visible = false;
    const S = arm.position.clone(), AS = arm.scale.x || 1.25; let UA = 0.27 * AS, FA = 0.26 * AS;
    const holeOf = (H, into) => { const K = new THREE.Vector3(), C = new THREE.Vector3(), w = new THREE.Vector3(); for (const f of H.fingers) { K.add(f.a.getWorldPosition(w)); C.add((f.b || f.a).getWorldPosition(w)); }
      K.multiplyScalar(1 / H.fingers.length); C.multiplyScalar(1 / H.fingers.length); return into.worldToLocal(K.lerp(C, 0.6).addScaledVector(H.hg.getWorldPosition(w).sub(K), 0.35)); };
    if (JOINTED) { fox.updateMatrixWorld(true); UA = JF.position.length() * AS; FA = holeOf(JH, JF).length() * AS; }
    const upper = new THREE.Group(), fore = new THREE.Group(), hand = new THREE.Group(), cane = new THREE.Group(); body.add(upper, fore, hand, cane); for (const o of [upper, fore, hand, cane]) o.userData.built = true;   // s662u placed in the real body space every frame (no hero remap)
    M(new THREE.CapsuleGeometry(0.078 * AS, UA - 0.08, 4, 10), sleeveMat, 0, -UA / 2, 0, upper, 0.02);
    M(new THREE.CapsuleGeometry(0.068 * AS, FA - 0.06, 4, 10), sleeveMat, 0, -FA / 2, 0, fore, 0.02);
    M(new THREE.SphereGeometry(0.1, 12, 8), pawMat, 0, 0, 0, hand, 0.02, 0.1);
    // the cane: unit parts, sized in layout()
    const white = toon('#f8fafc'), red = toon('#dc2626'), black = toon('#1f2937');
    const grip = M(new THREE.CylinderGeometry(0.036, 0.036, 1, 12), black, 0, 0, 0, cane, 0.01, 0.036);
    const shaft = M(new THREE.CylinderGeometry(0.025, 0.025, 1, 10), white, 0, 0, 0, cane, 0.01, 0.025);
    const band = M(new THREE.CylinderGeometry(0.0255, 0.0255, 1, 10), red, 0, 0, 0, cane, 0.01, 0.0255);
    const tip = M(new THREE.SphereGeometry(0.042, 10, 8), toon('#e5e7eb'), 0, 0, 0, cane, 0.01, 0.042);
    const finger = M(new THREE.CapsuleGeometry(0.022, 0.07, 3, 6), pawMat, 0, 0, 0.03, cane, 0.01);
    if (JOINTED) { upper.visible = fore.visible = hand.visible = false; finger.visible = false; }
    // her scale: units per Hope-cm, from where her sternum sits on the model
    const sternumU = S.y - 0.08, k = sternumU / STERNUM_CM;
    const legU = 0.42 * (P.legs[0].scale.y || 1), legCm = legU / k;
    const waistCm = (S.y - 0.48) / k, shoulderHalfU = Math.abs(S.x) + 0.1 * AS;
    const boots = P.legs.map(p => p.children.filter(c => c.isMesh && c.geometry.type === 'SphereGeometry').pop() || p);
    const R = { cfg: { ...CANE_DEFAULTS, ...cfg0 }, g: 0, amt: 0, strikeT: 0, tipW: new THREE.Vector3(), info: {}, onStep: null, onTap: null, lat: 0, k, cane, hand, armParts: [upper, fore, hand], arm };   // armParts: a host can hide this arm and pose the fox's own arm onto R.hand instead
    const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), Hg = new THREE.Vector3(), E = new THREE.Vector3(), T = new THREE.Vector3(), pole = new THREE.Vector3();
    function layout() {
      const c = R.cfg, L = c.length * k, top = (c.top ?? (JOINTED ? 13 : 7)) * k,   /* s665d jointed: she holds the handle part way down (the real grip: hand no more than halfway down the handle), so its end shows above her fist */ gl = 22 * k, bl = (c.band ?? 18) * k, Lb = L - top, bg = (c.bandGap ?? 0) * k;
      grip.scale.set(1, gl, 1); grip.position.y = top - gl / 2;
      const sl = Lb - bl - (gl - top); shaft.scale.set(1, sl, 1); shaft.position.y = -(gl - top) - sl / 2;
      band.scale.set(1, bl, 1); band.position.y = -Lb + bg + bl / 2; tip.position.y = -Lb; tip.scale.setScalar(c.ball ?? 1);   /* optional: a shorter red strip a little above a bigger roller ball */
      finger.position.set(0, -0.06, 0.045); finger.rotation.set(0, 0, 0);
      R.Lb = Lb;
    }
    function solveArm(target) {
      v1.subVectors(target, S); let d = v1.length(); const max = (UA + FA) * 0.995, min = Math.abs(UA - FA) + 0.02;
      const reachOk = d <= max; d = cl(d, min, max); v1.setLength(d); Hg.copy(S).add(v1);
      const cosA = cl((UA * UA + d * d - FA * FA) / (2 * UA * d), -1, 1), A = Math.acos(cosA), dir = v2.copy(v1).normalize();
      pole.set(side * 0.55, -1, -0.45); pole.addScaledVector(dir, -pole.dot(dir)).normalize();   // elbow tucked down, back, against her side
      E.copy(S).addScaledVector(dir, Math.cos(A) * UA).addScaledVector(pole, Math.sin(A) * UA);
      upper.position.copy(S); upper.quaternion.setFromUnitVectors(DOWN, v3.subVectors(E, S).normalize());
      fore.position.copy(E); fore.quaternion.setFromUnitVectors(DOWN, v3.subVectors(Hg, E).normalize());
      hand.position.copy(Hg); return reachOk;
    }
    // s662s her real arm onto the solved shoulder → elbow → hand line: try both bend senses, keep the one whose fist lands on the cane grip; then the paw
    // turns so its knuckle line runs UP the cane (index on top) with the back of the paw facing out, and the cane slides into the fist
    const _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _h = new THREE.Vector3(), _Y = new THREE.Vector3(0, 1, 0), _X = new THREE.Vector3(1, 0, 0);
    const basis = (x, y) => { const X = x.clone().normalize(), Yv = y.clone().addScaledVector(X, -y.dot(X)).normalize(); return new THREE.Matrix4().makeBasis(X, Yv, new THREE.Vector3().crossVectors(X, Yv)); };
    function poseReal() { const du = _a.subVectors(E, S).normalize(), df = _b.subVectors(Hg, E).normalize(), bend = Math.acos(cl(du.dot(df), -1, 1));
      let n = _c.crossVectors(du, df); if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize();
      let best = null; for (const sgn of [1, -1]) { const X = n.clone().multiplyScalar(sgn), Yd = du.clone().negate(); _m.makeBasis(X, Yd, new THREE.Vector3().crossVectors(X, Yd)); arm.quaternion.setFromRotationMatrix(_m);
        for (const e of [-bend, bend]) { JF.rotation.set(e, 0, 0); arm.updateMatrixWorld(true); const hp = holeOf(JH, body); const d = hp.distanceTo(Hg) - (R.eSign && Math.sign(e) === R.eSign ? 0.03 : 0); if (!best || d < best.d) best = { d, q: arm.quaternion.clone(), e }; } }   /* s665 HAND SHAKE fix: both elbow bend senses landed almost the same distance, so she flipped between two arm poses every frame; the last choice now wins unless the other is 3 cm better */
      arm.quaternion.copy(best.q); JF.rotation.set(best.e, 0, 0); R.eSign = Math.sign(best.e) || R.eSign; u.grip = [1, (u.grip && u.grip[1]) ?? null];
      u.fcurl = [R.cfg.curl || [0.5, 1, 1, 1], (u.fcurl && u.fcurl[1]) || null]; u.oppose = [R.cfg.thumb ?? 0, (u.oppose && u.oppose[1]) || 0]; u.thumbUp = [R.cfg.thumbUp ?? 0, (u.thumbUp && u.thumbUp[1]) || 0];   /* the three fingers close right round the handle, the index a little looser along it */   /* the index lies looser along the shaft, the other three wrap it (a light grip) */
      // the paw: knuckle line (pinky → index) along the cane, pointing DOWN the cane toward the tip (s665c Ben: it was backwards; the real long-cane grip = a handshake, index finger toward the tip, thumb on top); back of the paw toward her outside
      arm.updateMatrixWorld(true); const gi = JH.g, w = o => gi.worldToLocal(o.getWorldPosition(new THREE.Vector3())), fi = JH.fingers, ix = fi.find(f => f.k === 0), pk = fi.find(f => f.k === 3);
      if (ix && pk) { const kL = w(ix.a).sub(w(pk.a)).normalize(), K = new THREE.Vector3(), Cc = new THREE.Vector3(); for (const f of fi) { K.add(w(f.a)); Cc.add(w(f.b || f.a)); } K.divideScalar(fi.length); Cc.divideScalar(fi.length);
        /* s665d (Ben: "put her open hand flat, set the cane in it, close the hand"): the real power grip. The shaft lies DIAGONALLY across the palm,
           from the heel of the hand (pinky side) out past the base of the index finger, and runs on along the index finger toward the tip; the palm
           faces in toward her middle, the thumb on top, the fingers close over it. In the paw's own frame: F = finger direction, P = palm side. */
        const fL = new THREE.Vector3(0, -1, 0); fL.addScaledVector(kL, -fL.dot(kL)).normalize();
        const pL = new THREE.Vector3().crossVectors(kL, fL).normalize(); if (pL.dot(Cc.clone().sub(K)) < 0) pL.negate();
        const A = (R.cfg.gripAngle ?? 75) * Math.PI / 180, dL = fL.clone().multiplyScalar(Math.cos(A)).addScaledVector(kL, Math.sin(A)).normalize();
        const pL2 = pL.clone().addScaledVector(dL, -pL.dot(dL)).normalize();
        const up = _h.set(0, 1, 0).applyQuaternion(cane.quaternion);
        const parentQ = gi.parent.getWorldQuaternion(new THREE.Quaternion()), bodyQ = body.getWorldQuaternion(new THREE.Quaternion());
        const dW = up.clone().negate().applyQuaternion(bodyQ), pW = new THREE.Vector3(-side, R.cfg.palmUp ?? 0.35, R.cfg.palmFwd ?? 0).applyQuaternion(bodyQ); pW.addScaledVector(dW, -pW.dot(dW)).normalize(); if (R.cfg.gripRoll) pW.applyAxisAngle(dW, side * R.cfg.gripRoll * Math.PI / 180);   /* Cane Grip Workshop: palm up / forward tilt, roll round the shaft */
        const Qw = new THREE.Quaternion().setFromRotationMatrix(basis(dW, pW).multiply(basis(dL, pL2).transpose()));
        gi.quaternion.copy(parentQ.invert().multiply(Qw));   // Qw = the paw's world rotation: its palm diagonal → down the cane, its palm → in toward her middle
        /* s665d the shaft sits IN THE PALM CUP (measured before: it ran along the knuckles, 3-5 cm off them, so the fingers never closed round it):
           knuckle centroid + 4.5 cm toward the palm side, so the curled fingers wrap it */
        gi.updateMatrixWorld(true); { const kw = new THREE.Vector3(), w2 = new THREE.Vector3(); for (const f of fi) kw.add(f.a.getWorldPosition(w2)); kw.divideScalar(fi.length); kw.addScaledVector(pW, (R.cfg.palmIn ?? 0.045) * (fox.scale.x || 1)); if (R.cfg.slide) kw.addScaledVector(dW, R.cfg.slide * (fox.scale.x || 1)); cane.position.copy(body.worldToLocal(kw)); } } }
    R.set = cfg => { Object.assign(R.cfg, cfg); layout(); };
    // SWING: she raises the cane to mid level, winds it to her right and sweeps it across in front of her, like the
    // player's sword. Phases of R.SWD: raise 0-0.35, sweep 0.35-0.8 (the hit window), lower 0.8-1. A swoosh ribbon follows the tip.
    R.SWD = 0.8; R.swT = -1; R.swP = -1;
    R.swing = () => { if (R.swT >= 0) return false; R.swT = 0; R.swP = 0; trailN = 0; trailFade = 1; return true; };
    R.spin = R.swing;
    R.reachU = () => 0.45 + R.Lb * 0.97;          // body units, from her centre to the tip, cane held out level
    R.inWindow = () => R.swP >= 0.38 && R.swP <= 0.82;
    R.facingSector = 1.9;                          // radians either side of her facing that the sweep covers
    // swoosh ribbon (world space, under the fox's parent)
    const TR = 40; let trailN = 0, trailFade = 0; const trPairs = [];
    for (let i = 0; i < TR; i++) trPairs.push([new THREE.Vector3(), new THREE.Vector3()]);
    const trPos = new Float32Array(TR * 2 * 3), trGeo = new THREE.BufferGeometry(); trGeo.setAttribute('position', new THREE.BufferAttribute(trPos, 3));
    const trIdx = []; for (let i = 0; i < TR - 1; i++) { const q = i * 2; trIdx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); } trGeo.setIndex(trIdx);
    const trMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const trMesh = new THREE.Mesh(trGeo, trMat); trMesh.frustumCulled = false; trMesh.renderOrder = 5;
    const edPos = new Float32Array(TR * 3), edGeo = new THREE.BufferGeometry(); edGeo.setAttribute('position', new THREE.BufferAttribute(edPos, 3));
    const edMat = new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0 }); const edLine = new THREE.Line(edGeo, edMat); edLine.frustumCulled = false; edLine.renderOrder = 6;
    function trailPush(mid, tipP) { if (!trMesh.parent && fox.parent) fox.parent.add(trMesh, edLine); if (trailN >= TR) { trPairs.push(trPairs.shift()); trailN = TR - 1; } trPairs[trailN][0].copy(mid); trPairs[trailN][1].copy(tipP); trailN++; }
    function trailBuild() { const n = trailN; for (let i = 0; i < TR; i++) { const j = Math.min(i, Math.max(0, n - 1)), [m, t] = trPairs[j], w = n > 1 ? (j + 1) / n : 1;
        const ix = t.x + (m.x - t.x) * w, iy = t.y + (m.y - t.y) * w, iz = t.z + (m.z - t.z) * w;     // older = thinner: a crescent
        trPos.set([ix, iy, iz, t.x, t.y, t.z], i * 6); edPos.set([t.x, t.y, t.z], i * 3); }
      trGeo.attributes.position.needsUpdate = true; edGeo.attributes.position.needsUpdate = true; edGeo.setDrawRange(0, n); trGeo.setDrawRange(0, Math.max(0, n - 1) * 6); }
    R.trailMeshes = [trMesh, edLine];
    R.strike = () => { if (R.strikeT <= 0) { R.strikeT = 0.34; return true; } return false; };
    // speed: the fox group's ground speed in world units/s
    R.update = (dt, speed) => {
      const c = R.cfg, bs = fox.scale.x || 1, sp = speed / bs, vm = sp / k / 100;    // Hope m/s
      const moving = sp > 0.05; R.amt += ((moving ? 1 : 0) - R.amt) * Math.min(1, dt * 8);
      const stepU = Math.max(legU * (0.7 + 0.35 * Math.min(vm, 2)), sp / 4.5), cad = moving ? sp / stepU : 0;    // steps per second, capped at 4.5
      const LEGS = !!(P.foot && !u.legOff);   /* s665 the jointed body walks with fox-kit legTick (knees, ankles, grounding): the cane follows ITS step phase and leaves the legs + body alone */
      const g0 = R.g; R.g = LEGS ? ((((u.phase || 0) + Math.PI) / (2 * Math.PI)) % 1 + 1) % 1 : (R.g + dt * cad / 2) % 1; const crossed = x => moving && (g0 < x ? (R.g >= x || R.g < g0) : (R.g >= x && R.g < g0));
      const w = 2 * Math.PI * R.g, fR = Math.sin(w), a = R.amt;
      const legA = Math.min(0.75, Math.asin(Math.min(0.95, stepU / 2 / legU)));
      if (!LEGS) { P.legs[0].rotation.x = -legA * fR * a; P.legs[1].rotation.x = legA * fR * a;            // legs[0] is her right
        P.arms[1].rotation.x = -0.3 * fR * a;                                                   // left arm swings with the right leg
        body.position.y = 0.03 * a * Math.abs(Math.cos(w)) + (u.hopY || 0); }
      // the sweep: lat +1 = her right, -1 = her left
      let lat = -fR, lift = c.technique === 'constant' ? 0 : c.lift * k * Math.abs(Math.cos(w));
      lat *= a; lift *= a;
      /* s665 IDLE: standing still she checks the ground now and then: two small taps of the tip in front, a little to her right */
      if (!moving) { R.idT = (R.idT ?? 4 + Math.random() * 3) - dt; if (R.idT < 0) { R.idT = 6 + Math.random() * 5; R.idTap = 0; } if (R.idTap != null) { R.idTap += dt; const q = R.idTap / 0.9; if (q >= 1) R.idTap = null; else { lift += 0.05 * Math.max(0, Math.sin(q * 2 * Math.PI * 2)) * (1 - R.amt); if (R.onTap && ((q > 0.24 && R.idQ <= 0.24) || (q > 0.74 && R.idQ <= 0.74))) R.onTap('L', R.tipW.clone()); } R.idQ = q; } }
      if (R.strikeT > 0) { R.strikeT -= dt; const p = 1 - Math.max(0, R.strikeT) / 0.34; lat = 1.7 - 3.4 * Math.sin(p * Math.PI / 2); lift = 0.18; }
      R.lat = lat;
      const halfW = shoulderHalfU + c.arc * k, gy = R.groundY ?? -body.position.y;   /* a host that moves the body after this (a fighting crouch) can say where the floor is */
      const handY = c.grip * k, Lb = R.Lb, ahead = Math.sqrt(Math.max(0.01, Lb * Lb - (handY - gy) * (handY - gy) - (c.handOffset * k) ** 2));
      const tipTarget = c.steps * stepU, zMin = c.zMin ?? 0.4, zMax = c.zMax ?? 0.62;
      const handZ = cl(tipTarget - ahead, zMin, zMax);
      const HT = T.set(side * (c.handOffset + 4.5 * lat) * k, handY + (1 - Math.abs(lat)) * 1.5 * k * a, handZ + Math.abs(lat) * 2 * k).clone();
      let reachOk = solveArm(HT);   // the hand follows the sweep a little; the wrist does the rest
      // tip: on the arc at the cane's length from the hand
      const tx = side * lat * halfW * (R.camSide && Math.sign(lat) === R.camSide ? (c.camBoost ?? 1) : 1), up0 = lift + (c.ball ? 0.04 * c.ball : 0), dx = tx - Hg.x;   /* a bigger roller ball rests ON the floor */
      let ty = gy + up0, dy = ty - Hg.y, tz = Hg.z + Math.sqrt(Math.max(0, Lb * Lb - dx * dx - dy * dy));
      if (R.groundAt) for (let it = 0; it < 2; it++) { ty = R.groundAt(tx, tz) + up0; dy = ty - Hg.y; tz = Hg.z + Math.sqrt(Math.max(0, Lb * Lb - dx * dx - dy * dy)); }   // a host can give the real floor plane (she leans in a fighting stance)
      T.set(tx, ty, tz); cane.position.copy(Hg); cane.quaternion.setFromUnitVectors(DOWN, v3.subVectors(T, Hg).normalize());
      hand.quaternion.copy(cane.quaternion);
      if (R.swT >= 0) {
        R.swT += dt; const p = R.swP = Math.min(1, R.swT / R.SWD), ez = x => x * x * (3 - 2 * x);
        let th, raise;
        if (p < 0.35) { const e = ez(p / 0.35); th = 1.9 * e; raise = e; }
        else if (p < 0.8) { const e = ez((p - 0.35) / 0.45); th = 1.9 - 3.6 * e; raise = 1; }
        else { const e = ez((p - 0.8) / 0.2); th = -1.7 * (1 - e); raise = 1 - e; }
        body.rotation.y = side * th * 0.3; const tl = th * 0.7, ha = tl * 0.55, rh = 0.46;   // her body twists into it; th > 0 = toward her right
        const SH2 = v1.set(side * Math.sin(ha) * rh, S.y - 0.24, Math.cos(ha) * rh).lerp(HT, 1 - raise);
        reachOk = solveArm(SH2);
        const wd = v2.subVectors(T, Hg).normalize(), sd = v3.set(side * Math.sin(tl), -0.22, Math.cos(tl)).normalize(), dir = wd.lerp(sd, raise).normalize();
        cane.position.copy(Hg); cane.quaternion.setFromUnitVectors(DOWN, dir); hand.quaternion.copy(cane.quaternion);
        fox.updateMatrixWorld(true);
        if (p > 0.3 && p < 0.86) { const mid = new THREE.Vector3(0, -Lb * 0.3, 0), tp = new THREE.Vector3(0, -Lb, 0); cane.localToWorld(mid); cane.localToWorld(tp); trailPush(mid, tp); trailBuild(); trMat.opacity = 0.6; edMat.opacity = 0.95; }
        if (p >= 1) { R.swT = -1; R.swP = -1; body.rotation.y = 0; }
      } else if (trailFade > 0) { trailFade = Math.max(0, trailFade - dt / 0.35); trMat.opacity = 0.6 * trailFade; edMat.opacity = 0.95 * trailFade; }
      if (JOINTED) poseReal();
      fox.updateMatrixWorld(true); R.tipW.set(0, -Lb, 0); cane.localToWorld(R.tipW);
      if (crossed(0.25)) { R.onStep && R.onStep('R', boots[0].getWorldPosition(v1.clone())); if (c.technique !== 'constant') R.onTap && R.onTap('L', R.tipW.clone()); }
      if (crossed(0.75)) { R.onStep && R.onStep('L', boots[1].getWorldPosition(v1.clone())); if (c.technique !== 'constant') R.onTap && R.onTap('R', R.tipW.clone()); }
      R.info = { sternumCm: STERNUM_CM, fitCm: STERNUM_CM + 5, waistCm: Math.round(waistCm), legCm: Math.round(legCm), stepCm: Math.round(stepU / k), cadence: +(cad * 60).toFixed(0),
        tipSteps: +((tz) / stepU).toFixed(2), tipCm: Math.round(tz / k), handZcm: Math.round(handZ / k), reachOk, tooLong: tipTarget - ahead < zMin, tooShort: tipTarget - ahead > zMax,
        arcCm: Math.round(2 * halfW / k), shoulderCm: Math.round(2 * shoulderHalfU / k), reachCm: Math.round(R.reachU() / k) };
    };
    R.dims = () => ({ k, shoulderHalfU, halfW: shoulderHalfU + R.cfg.arc * k, legU, waistCm, sternumU, side });
    layout();
    return R;
  }
  return { attach };
}
