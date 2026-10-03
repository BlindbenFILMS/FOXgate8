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
    const u = fox.userData, P = u.P, body = P.body;
    const arm = P.arms[0];                       // her RIGHT arm (she faces +z, so her right is -x)
    const side = Math.sign(arm.position.x) || -1;
    const meshes = arm.children.filter(c => c.isMesh);
    const sleeveMat = meshes[0] ? meshes[0].material : toon('#e7edf4');
    const pawM = meshes.filter(c => c.geometry.type === 'SphereGeometry').pop(); const pawMat = pawM ? pawM.material : toon('#f8fafc');
    arm.visible = false;
    const S = arm.position.clone(), AS = arm.scale.x || 1.25, UA = 0.27 * AS, FA = 0.26 * AS;
    const upper = new THREE.Group(), fore = new THREE.Group(), hand = new THREE.Group(), cane = new THREE.Group(); body.add(upper, fore, hand, cane);
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
    // her scale: units per Hope-cm, from where her sternum sits on the model
    const sternumU = S.y - 0.08, k = sternumU / STERNUM_CM;
    const legU = 0.42 * (P.legs[0].scale.y || 1), legCm = legU / k;
    const waistCm = (S.y - 0.48) / k, shoulderHalfU = Math.abs(S.x) + 0.1 * AS;
    const boots = P.legs.map(p => p.children.filter(c => c.isMesh && c.geometry.type === 'SphereGeometry').pop() || p);
    const R = { cfg: { ...CANE_DEFAULTS, ...cfg0 }, g: 0, amt: 0, strikeT: 0, tipW: new THREE.Vector3(), info: {}, onStep: null, onTap: null, lat: 0, k, cane, hand };
    const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), Hg = new THREE.Vector3(), E = new THREE.Vector3(), T = new THREE.Vector3(), pole = new THREE.Vector3();
    function layout() {
      const c = R.cfg, L = c.length * k, top = 7 * k, gl = 22 * k, bl = 18 * k, Lb = L - top;
      grip.scale.set(1, gl, 1); grip.position.y = top - gl / 2;
      const sl = Lb - bl - (gl - top); shaft.scale.set(1, sl, 1); shaft.position.y = -(gl - top) - sl / 2;
      band.scale.set(1, bl, 1); band.position.y = -Lb + bl / 2; tip.position.y = -Lb;
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
      const g0 = R.g; R.g = (R.g + dt * cad / 2) % 1; const crossed = x => moving && (g0 < x ? (R.g >= x || R.g < g0) : (R.g >= x && R.g < g0));
      const w = 2 * Math.PI * R.g, fR = Math.sin(w), a = R.amt;
      const legA = Math.min(0.75, Math.asin(Math.min(0.95, stepU / 2 / legU)));
      P.legs[0].rotation.x = -legA * fR * a; P.legs[1].rotation.x = legA * fR * a;            // legs[0] is her right
      P.arms[1].rotation.x = -0.3 * fR * a;                                                   // left arm swings with the right leg
      body.position.y = 0.03 * a * Math.abs(Math.cos(w)) + (u.hopY || 0);
      // the sweep: lat +1 = her right, -1 = her left
      let lat = -fR, lift = c.technique === 'constant' ? 0 : c.lift * k * Math.abs(Math.cos(w));
      lat *= a; lift *= a;
      if (R.strikeT > 0) { R.strikeT -= dt; const p = 1 - Math.max(0, R.strikeT) / 0.34; lat = 1.7 - 3.4 * Math.sin(p * Math.PI / 2); lift = 0.18; }
      R.lat = lat;
      const halfW = shoulderHalfU + c.arc * k, gy = -body.position.y;
      const handY = c.grip * k, Lb = R.Lb, ahead = Math.sqrt(Math.max(0.01, Lb * Lb - (handY - gy) * (handY - gy) - (c.handOffset * k) ** 2));
      const tipTarget = c.steps * stepU, zMin = 0.4, zMax = 0.62;
      const handZ = cl(tipTarget - ahead, zMin, zMax);
      const HT = T.set(side * (c.handOffset + 4.5 * lat) * k, handY + (1 - Math.abs(lat)) * 1.5 * k * a, handZ + Math.abs(lat) * 2 * k).clone();
      let reachOk = solveArm(HT);   // the hand follows the sweep a little; the wrist does the rest
      // tip: on the arc at the cane's length from the hand
      const tx = side * lat * halfW, ty = gy + lift, dx = tx - Hg.x, dy = ty - Hg.y, tz = Hg.z + Math.sqrt(Math.max(0, Lb * Lb - dx * dx - dy * dy));
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
