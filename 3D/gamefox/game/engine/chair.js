// NOBLE's wheelchair, seated legs and pushing arms. Replaces makeFox's built-in chair (makeFox({ chair: true }) first).
// Sizes in "fox cm" (his sternum = 117 cm, like Hope's cane). Tuned in Noble Workshop.dc.html → presets/chair.json.
export const CHAIR_KEY = 'meru.chair.v1';
export const STERNUM_CM = 117;
export const CHAIR_DEFAULTS = {seat: 50, seatW: 58, seatD: 42, back: 60, backTilt: 8, wheel: 75, camber: 5, wheelZ: -6, caster: 13, foot: 12, footZ: 34, thigh: 84, knee: 78, shin: 34, legSpread: 24, boot: 1, armReach: 1.01, push: 1, speed: 1.2, style: 'future', glow: '#7dd3fc', frame: '#201e1d', tire: '#0f172a', rim: '#cbd5e1'};   // Noble's saved chair (Noble Workshop)
export function loadChairLocal() { try { const s = localStorage.getItem(CHAIR_KEY); return s ? { ...CHAIR_DEFAULTS, ...JSON.parse(s) } : null; } catch (e) { return null; } }
export async function loadChair(base = document.baseURI) {
  const local = loadChairLocal(); if (local) return local;
  try { const r = await fetch(new URL('presets/chair.json', base).href, { cache: 'no-store' }); if (r.ok) return { ...CHAIR_DEFAULTS, ...(await r.json()) }; } catch (e) {}
  return { ...CHAIR_DEFAULTS };
}
export function saveChair(cfg) { localStorage.setItem(CHAIR_KEY, JSON.stringify(cfg)); }

export function chairKit({ THREE, M, toon }) {
  const DOWN = new THREE.Vector3(0, -1, 0), D2R = Math.PI / 180;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function attach(fox, cfg0 = {}) {
    const u = fox.userData, P = u.P, body = P.body;
    if (P.wheels && P.wheels[0] && P.wheels[0].parent) fox.remove(P.wheels[0].parent);     // drop the stock chair
    P.wheels = [];
    const R = { cfg: { ...CHAIR_DEFAULTS, ...cfg0 }, throwT: 0, push: 0, spin: 0, info: {}, boots: [], knees: [], dy: 0 };
    const S0 = P.arms[0].position.clone(), sternumU = S0.y - 0.08, k = sternumU / STERNUM_CM; R.k = k;
    const SIT = 0.42 + (S0.y - 1.12) - 0.0;   // the bottom of his torso in body space (lathe starts at 0.42 + lift)
    // ---- arms: two-bone, hands on the push rims ----
    // s666 JOINTED NOBLE (Ben): with elbows + fingers (fox-kit jointLimbs armsOnly) his OWN arms push the rims: the solved shoulder → elbow → hand
    // line is put on arms[i] + fore[i] (both bend senses tried, the last one kept unless the other is 3 cm better = no shake), fingers closed on the rim.
    const J = !!(P.fore && P.hands && P.hands[0] && P.hands[0].fingers), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _m = new THREE.Matrix4();
    const holeOf = (H, into) => { const K = new THREE.Vector3(), C = new THREE.Vector3(), w = new THREE.Vector3(); for (const f of H.fingers) { K.add(f.a.getWorldPosition(w)); C.add((f.b || f.a).getWorldPosition(w)); }
      K.multiplyScalar(1 / H.fingers.length); C.multiplyScalar(1 / H.fingers.length); return into.worldToLocal(K.lerp(C, 0.6).addScaledVector(H.hg.getWorldPosition(w).sub(K), 0.35)); };
    const arms = P.arms.map((arm, i) => {
      const side = Math.sign(arm.position.x) || (i ? 1 : -1), ms = arm.children.filter(c => c.isMesh);
      const sleeve = ms[0] ? ms[0].material : toon('#f7f1e6'), cuff = ms[1] ? ms[1].material : sleeve, paw = (ms.filter(c => c.geometry.type === 'SphereGeometry').pop() || {}).material || toon('#f2741f');
      if (!J) arm.visible = false;
      const up = new THREE.Group(), fo = new THREE.Group(), hd = new THREE.Group(); body.add(up, fo, hd); if (J) up.visible = fo.visible = hd.visible = false;
      const uM = null, fM = null;
      const cM = M(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 14), cuff, 0, 0, 0, fo, 0.012, 0.1);
      M(new THREE.SphereGeometry(0.115, 12, 8), paw, 0, 0, 0, hd, 0.02, 0.115);
      let rUA = 0, rFA = 0; if (J) { fox.updateMatrixWorld(true); const AS = arm.scale.x || 1; rUA = P.fore[i].position.length() * AS; rFA = holeOf(P.hands[i], P.fore[i]).length() * AS; }
      return { i, arm, side, sleeve, S: arm.position.clone(), up, fo, hd, uM, fM, cM, UA: 0, FA: 0, rUA, rFA, eSign: 0, E: new THREE.Vector3(), H: new THREE.Vector3() };
    });
    function poseReal(A) { const arm = A.arm, JF = P.fore[A.i], JH = P.hands[A.i], S = A.S, E = A.E, Hg = A.H;
      const du = _a.subVectors(E, S).normalize(), df = _b.subVectors(Hg, E).normalize(), bend = Math.acos(cl(du.dot(df), -1, 1));
      let n = _c.crossVectors(du, df); if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize();
      let best = null; for (const sgn of [1, -1]) { const X = n.clone().multiplyScalar(sgn), Yd = du.clone().negate(); _m.makeBasis(X, Yd, new THREE.Vector3().crossVectors(X, Yd)); arm.quaternion.setFromRotationMatrix(_m);
        for (const e of [-bend, bend]) { JF.rotation.set(e, 0, 0); arm.updateMatrixWorld(true); const d = holeOf(JH, body).distanceTo(Hg) - (A.eSign && Math.sign(e) === A.eSign ? 0.03 : 0); if (!best || d < best.d) best = { d, q: arm.quaternion.clone(), e }; } }
      arm.quaternion.copy(best.q); JF.rotation.set(best.e, 0, 0); A.eSign = Math.sign(best.e) || A.eSign;
      /* s667k (Ben: the LEFT paw was perfect, the right looked turned backwards; s667f changed both): the left paw keeps its own built pose (q0),
         the RIGHT paw copies the left one MIRRORED across his middle, so both hold the rim the same way */
      const gi = JH.g; if (!A.q0) A.q0 = gi.quaternion.clone();
      const bodyQ = body.getWorldQuaternion(new THREE.Quaternion());
      if (A.side > 0) { gi.quaternion.copy(A.q0); gi.updateMatrixWorld(true); const wq = gi.getWorldQuaternion(new THREE.Quaternion()); R.leftPawQ = bodyQ.clone().invert().multiply(wq); }
      else if (R.leftPawQ) { const m = R.leftPawQ, mq = new THREE.Quaternion(m.x, -m.y, -m.z, m.w), parentQ = gi.parent.getWorldQuaternion(new THREE.Quaternion()); gi.quaternion.copy(parentQ.invert().multiply(bodyQ.clone().multiply(mq))); }
      else gi.quaternion.copy(A.q0); }
    const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), pole = new THREE.Vector3();
    function solve(A, target) {
      v1.subVectors(target, A.S); let d = v1.length(); const max = (A.UA + A.FA) * 0.995, ok = d <= max; d = cl(d, Math.abs(A.UA - A.FA) + 0.02, max); v1.setLength(d); A.H.copy(A.S).add(v1);
      const cosA = cl((A.UA * A.UA + d * d - A.FA * A.FA) / (2 * A.UA * d), -1, 1), a = Math.acos(cosA), dir = v2.copy(v1).normalize();
      pole.set(A.side * 0.7, 0.1, -1); pole.addScaledVector(dir, -pole.dot(dir)).normalize();          // elbows out and back, like pushing a rim
      A.E.copy(A.S).addScaledVector(dir, Math.cos(a) * A.UA).addScaledVector(pole, Math.sin(a) * A.UA);
      A.up.position.copy(A.S); A.up.quaternion.setFromUnitVectors(DOWN, v3.subVectors(A.E, A.S).normalize());
      A.fo.position.copy(A.E); A.fo.quaternion.setFromUnitVectors(DOWN, v3.subVectors(A.H, A.E).normalize());
      A.hd.position.copy(A.H); if (J) poseReal(A); return ok;
    }
    // ---- legs: hip → thigh → knee → shin → boot ----
    P.legs.forEach((p, i) => {
      p.scale.set(1, 1, 1); p.rotation.set(0, 0, 0);
      const ms = p.children.filter(c => c.isMesh), boot = ms.filter(c => c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius === 0.14).pop();
      const thighM = ms.find(c => c.geometry.type === 'CapsuleGeometry');
      p.children.filter(c => c.isMesh && c !== thighM && c !== boot).forEach(c => c.visible = false);
      const knee = new THREE.Group(); p.add(knee);
      const shinM = null, legMat = thighM ? thighM.material : toon('#e2e8f0'); if (thighM) thighM.visible = false;
      if (boot) { p.remove(boot); knee.add(boot); }
      R.knees.push({ leg: p, knee, legMat, thighM: null, shinM, boot, bs: boot ? boot.scale.clone() : null }); R.boots.push(boot || knee);
    });
    // ---- the chair ----
    const chair = new THREE.Group(); fox.add(chair); R.chair = chair;
    let wheels = [], casters = [];
    function tube(a, b, r, mat, parent = chair) { const d = v3.subVectors(b, a), L = d.length(), m = M(new THREE.CylinderGeometry(r, r, L, 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, parent, 0.008, r); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; }
    function build() {
      const c = R.cfg;
      chair.children.slice().forEach(o => { chair.remove(o); o.traverse(x => x.geometry && x.geometry.dispose()); });
      if (c.style === 'classic') return buildClassic();
      // FUTURE: one moulded white shell, ink trim, hubless glowing wheels, hover-orb casters, light strips
      const glow = c.glow || '#7dd3fc';
      const shell = toon(c.frame === '#334155' ? '#f1f5f9' : c.frame), trim = toon('#1e293b'), tire = toon(c.tire), rimM = toon(c.rim);
      const lit = new THREE.MeshToonMaterial({ color: glow, gradientMap: toon('#fff').gradientMap, emissive: new THREE.Color(glow), emissiveIntensity: 1.6 });
      const seatY = c.seat * k, hw = c.seatW * k / 2, sd = c.seatD * k, z0 = -0.3, z1 = z0 + sd, Rw = c.wheel * k / 2, wx = hw + 0.08, wz = c.wheelZ * k;
      const fY = c.foot * k, fZ = c.footZ * k, bt = c.backTilt * D2R, bh = c.back * k;
      // seat pan + bolsters
      const pan = M(new THREE.BoxGeometry(hw * 2 + 0.04, 0.09, sd + 0.04), shell, 0, seatY - 0.05, (z0 + z1) / 2, chair, 0.018);
      M(new THREE.BoxGeometry(hw * 2 - 0.06, 0.035, sd - 0.06), trim, 0, seatY + 0.005, (z0 + z1) / 2 + 0.01, chair, 0);
      M(new THREE.BoxGeometry(hw * 2 + 0.05, 0.022, 0.03), lit, 0, seatY - 0.06, z1 + 0.025, chair, 0);
      // backrest: curved shell
      const bk = new THREE.Group(); bk.position.set(0, seatY, z0 - 0.02); bk.rotation.x = -bt; chair.add(bk); R.back = bk; R.backH = bh;
      const bs = new THREE.CylinderGeometry(hw + 0.06, hw + 0.06, bh, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76); const bm = M(bs, shell, 0, bh / 2, hw * 0.62, bk, 0.016); bm.material = shell; bm.children.forEach(o => o.material.side = THREE.BackSide);
      shell.side = THREE.DoubleSide;
      M(new THREE.BoxGeometry(hw * 1.2, bh * 0.7, 0.03), trim, 0, bh * 0.5, -0.02, bk, 0);
      M(new THREE.BoxGeometry(0.03, bh * 0.6, 0.02), lit, 0, bh * 0.5, -0.045, bk, 0);
      // side skirts that sweep from the backrest down to the axle and forward to the footrest
      for (const s of [-1, 1]) {
        const x = s * (hw + 0.025);
        const sk = M(new THREE.BoxGeometry(0.04, 0.12, sd * 0.9), shell, x, seatY - 0.1, (z0 + z1) / 2 - 0.02, chair, 0.012);
        M(new THREE.BoxGeometry(0.045, 0.02, sd * 0.8), lit, x + s * 0.002, seatY - 0.13, (z0 + z1) / 2 - 0.02, chair, 0);
        tube(new THREE.Vector3(x, seatY - 0.12, z1 - 0.04), new THREE.Vector3(s * hw * 0.62, fY + 0.03, fZ - 0.03), 0.026, shell);
        tube(new THREE.Vector3(x, seatY - 0.14, z0 + 0.08), new THREE.Vector3(s * (hw + 0.01), Rw, wz), 0.03, trim);
        // armrest fin
        const fin = M(new THREE.BoxGeometry(0.035, 0.035, sd * 0.7), shell, s * (hw + 0.04), seatY + 0.2, (z0 + z1) / 2 - 0.04, chair, 0.01);
        tube(new THREE.Vector3(s * (hw + 0.04), seatY + 0.2, z0 + 0.04), new THREE.Vector3(s * (hw + 0.03), seatY - 0.06, z0 + 0.02), 0.018, shell);
        // hover-orb caster with a glow puddle
        const cr = Math.max(0.035, c.caster * k / 2 * 0.6), cz = z1 - 0.02, cx = s * hw * 0.82;
        tube(new THREE.Vector3(cx, seatY - 0.08, cz), new THREE.Vector3(cx, cr * 2 + 0.02, cz + 0.02), 0.018, trim);
        const cw = new THREE.Group(); cw.position.set(cx, cr + 0.02, cz + 0.02); chair.add(cw); casters.push(cw);
        M(new THREE.SphereGeometry(cr, 14, 10), trim, 0, 0, 0, cw, 0.008, cr);
        M(new THREE.TorusGeometry(cr * 1.02, cr * 0.18, 6, 18), lit, 0, 0, 0, cw, 0).rotation.y = Math.PI / 2;
        const pud = new THREE.Mesh(new THREE.CircleGeometry(cr * 1.6, 18), new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.35, depthWrite: false })); pud.rotation.x = -Math.PI / 2; pud.position.set(cx, 0.006, cz + 0.02); chair.add(pud);
        // hubless wheel: thick tyre, glowing inner ring, push rim, no spokes
        const wg = new THREE.Group(); wg.position.set(s * wx, Rw, wz); wg.rotation.z = s * c.camber * D2R; chair.add(wg);
        const sp = new THREE.Group(); wg.add(sp); wheels.push(sp);
        M(new THREE.TorusGeometry(Rw - 0.045, 0.05, 10, 40), tire, 0, 0, 0, sp, 0.012).rotation.y = Math.PI / 2;
        M(new THREE.TorusGeometry(Rw - 0.1, 0.022, 8, 40), shell, 0, 0, 0, sp, 0.006).rotation.y = Math.PI / 2;
        M(new THREE.TorusGeometry(Rw - 0.125, 0.009, 6, 40), lit, 0, 0, 0, sp, 0).rotation.y = Math.PI / 2;
        for (let n = 0; n < 6; n++) { const q = n / 6 * Math.PI * 2, m = M(new THREE.BoxGeometry(0.03, 0.012, 0.05), lit, 0, Math.cos(q) * (Rw - 0.045), Math.sin(q) * (Rw - 0.045), sp, 0); m.position.x = s * 0.05; m.rotation.x = -q; }
        const rm = M(new THREE.TorusGeometry((Rw - 0.035) * 0.86, 0.016, 6, 40), rimM, s * 0.06, 0, 0, sp, 0); rm.rotation.y = Math.PI / 2;
        // axle pod with the 8 gate light
        M(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20), trim, s * 0.0, 0, 0, wg, 0.008, 0.075).rotation.z = Math.PI / 2;
        M(new THREE.CylinderGeometry(0.045, 0.045, 0.055, 20), lit, s * 0.003, 0, 0, wg, 0).rotation.z = Math.PI / 2;
      }
      // footplate: a floating glass-edged plate
      M(new THREE.BoxGeometry(hw * 1.5, 0.035, 0.18), shell, 0, fY, fZ, chair, 0.01);
      M(new THREE.BoxGeometry(hw * 1.5, 0.012, 0.02), lit, 0, fY - 0.012, fZ + 0.095, chair, 0);
      // under-glow
      const ug = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2.2, sd * 1.4), new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.22, depthWrite: false })); ug.rotation.x = -Math.PI / 2; ug.position.set(0, 0.005, (z0 + z1) / 2); chair.add(ug);
      R.glowMat = lit;
      R.geo = { seatY, hw, sd, z0, z1, Rw, wx, wz, fY, fZ };
    }
    function buildClassic() {
      const c = R.cfg;
      const frame = toon(c.frame), tire = toon(c.tire), rimM = toon(c.rim), cush = toon('#1e293b'), hub = toon('#94a3b8');
      const seatY = c.seat * k, hw = c.seatW * k / 2, sd = c.seatD * k, z0 = -0.3, z1 = z0 + sd, Rw = c.wheel * k / 2, wx = hw + 0.07, wz = c.wheelZ * k, fr = 0.022;
      M(new THREE.BoxGeometry(hw * 2, 0.06, sd), cush, 0, seatY - 0.03, (z0 + z1) / 2, chair, 0.016);
      const bk = new THREE.Group(); bk.position.set(0, seatY, z0 - 0.02); bk.rotation.x = -c.backTilt * D2R; chair.add(bk);
      M(new THREE.BoxGeometry(hw * 2, c.back * k, 0.05), cush, 0, c.back * k / 2, 0, bk, 0.016);
      const fY = c.foot * k, fZ = c.footZ * k;
      for (const s of [-1, 1]) {
        const x = s * (hw + 0.01), top = new THREE.Vector3(x, seatY + c.back * k, z0 - 0.02 - Math.sin(c.backTilt * D2R) * c.back * k);
        const a = new THREE.Vector3(x, seatY - 0.06, z0 - 0.02), b = new THREE.Vector3(x, seatY - 0.06, z1), f = new THREE.Vector3(x * 0.8, fY + 0.03, fZ - 0.04);
        tube(top, a, fr, frame); tube(a, b, fr, frame); tube(b, f, fr, frame);
        const hand = top.clone().add(new THREE.Vector3(0, 0.02, -0.12)); tube(top, hand, fr * 1.1, frame); M(new THREE.CylinderGeometry(fr * 1.6, fr * 1.6, 0.1, 8), cush, hand.x, hand.y, hand.z + 0.02, chair, 0.008).rotation.x = Math.PI / 2;
        const axle = new THREE.Vector3(s * (hw + 0.01), Rw, wz); tube(a.clone().lerp(b, 0.15), axle, fr, frame);
        // caster
        const cr = c.caster * k / 2, cz = z1 - 0.02, cx = s * hw * 0.85, stem = new THREE.Vector3(cx, cr * 2 + 0.05, cz);
        tube(new THREE.Vector3(cx, seatY - 0.06, cz), stem, fr, frame);
        const cw = new THREE.Group(); cw.position.set(cx, cr, cz + 0.02); chair.add(cw); casters.push(cw);
        const ct = M(new THREE.TorusGeometry(cr * 0.8, cr * 0.25, 6, 16), tire, 0, 0, 0, cw, 0.008); ct.rotation.y = Math.PI / 2;
        tube(stem, new THREE.Vector3(cx, cr, cz + 0.02), fr * 0.7, frame);
        // big wheel
        const wg = new THREE.Group(); wg.position.set(s * wx, Rw, wz); wg.rotation.z = s * c.camber * D2R; chair.add(wg);
        const sp = new THREE.Group(); wg.add(sp); wheels.push(sp);
        const t = M(new THREE.TorusGeometry(Rw - 0.035, 0.04, 8, 32), tire, 0, 0, 0, sp, 0.012); t.rotation.y = Math.PI / 2;
        const rm = M(new THREE.TorusGeometry((Rw - 0.035) * 0.86, 0.014, 6, 32), rimM, s * 0.05, 0, 0, sp, 0); rm.rotation.y = Math.PI / 2;
        M(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), hub, 0, 0, 0, sp, 0.008).rotation.z = Math.PI / 2;
        for (let n = 0; n < 8; n++) { const q = n / 8 * Math.PI; const m = M(new THREE.BoxGeometry(0.008, (Rw - 0.06) * 2, 0.008), hub, 0, 0, 0, sp, 0); m.rotation.x = q; }
        for (let n = 0; n < 6; n++) { const q = n / 6 * Math.PI * 2; M(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 4), hub, s * 0.025, Math.cos(q) * (Rw - 0.035) * 0.86, Math.sin(q) * (Rw - 0.035) * 0.86, sp, 0).rotation.z = Math.PI / 2; }
      }
      M(new THREE.BoxGeometry(hw * 1.7, 0.03, 0.16), frame, 0, fY, fZ, chair, 0.01);
      R.geo = { seatY, hw, sd, z0, z1, Rw, wx, wz, fY, fZ };
    }
    function layout() {
      wheels = []; casters = []; build();
      const c = R.cfg;
      R.dy = c.seat * k - SIT + 0.02 + (J ? (c.jLift ?? 0.09) : 0);   /* s666c jointed Noble sits a little higher on fuller legs (Ben: his hands were clipping the wheels) */
      arms.forEach(A => { A.UA = J ? A.rUA : 0.27 * c.armReach; A.FA = J ? A.rFA : 0.26 * c.armReach;
        if (A.uM) A.up.remove(A.uM); if (A.fM) A.fo.remove(A.fM);
        const th = c.armThick ?? 1;   // optional: thicker, more muscular arms (a host's setting; 1 = as tuned)
        A.uM = M(new THREE.CapsuleGeometry(0.085 * th, Math.max(0.02, A.UA - 0.1), 4, 10), A.sleeve, 0, -A.UA / 2, 0, A.up, 0.02, 0.085 * th);
        A.fM = M(new THREE.CapsuleGeometry(0.075 * th, Math.max(0.02, A.FA - 0.12), 4, 10), A.sleeve, 0, -A.FA / 2 + 0.02, 0, A.fo, 0.02, 0.075 * th); A.cM.position.y = -A.FA + 0.07;
        if (A.bM) { A.up.remove(A.bM); A.bM = null; } if (A.fbM) { A.fo.remove(A.fbM); A.fbM = null; }
        if (c.bicep) { A.bM = M(new THREE.SphereGeometry(0.1 * th, 14, 10), A.sleeve, 0, -A.UA * 0.42, 0.035 * th, A.up, 0.02, 0.1 * th); A.bM.scale.set(1, 1.25, 1.05);   // bicep
          A.fbM = M(new THREE.SphereGeometry(0.085 * th, 12, 10), A.sleeve, 0, -A.FA * 0.28, 0, A.fo, 0.02, 0.085 * th); A.fbM.scale.set(1, 1.3, 1); }   // forearm bulge
        A.cM.scale.setScalar(th > 1 ? 0.5 + 0.5 * th : 1); });
      const thighU = 0.36, shinU = c.shin * k + (J ? (c.jLift ?? 0.09) : 0);
      P.legs.forEach((p, i) => { const s = i ? 1 : -1, K = R.knees[i]; p.position.set(s * c.legSpread * k / 2, SIT + 0.08, -0.04); p.rotation.x = -c.thigh * D2R;
        if (K.thighM) p.remove(K.thighM); if (K.shinM) K.knee.remove(K.shinM);
        if (J) { /* s666b NOBLE'S LEGS (Ben: "help on the legs"): the jointed foxes' leg shapes: a THIGH full at the hip slimming to the knee, a CALF
             full below the knee slimming to the ankle, a domed KNEE GUARD on the outer corner of the bent knee, a flared BOOT CUFF over the boot
             (white + bright blue rims on his blue legs, like Hope) */
          const lathe = (pts, len, rs) => { const sc = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r * rs, y * len))), sm = sc.getPoints(28); sm[0].x = 0; sm[sm.length - 1].x = 0; const g = new THREE.LatheGeometry(sm, 20); g.computeVertexNormals(); return g; };
          K.thighM = M(lathe([[0, -0.5], [0.5, -0.47], [0.76, -0.36], [0.86, -0.18], [0.95, 0.04], [1, 0.22], [0.93, 0.38], [0.64, 0.47], [0, 0.5]], thighU, 0.138), K.legMat, 0, -thighU / 2, 0, p, 0.02, 0.138);
          K.shinM = M(lathe([[0, -0.5], [0.46, -0.48], [0.55, -0.37], [0.62, -0.18], [0.8, 0.02], [0.97, 0.2], [1, 0.32], [0.9, 0.43], [0.58, 0.48], [0, 0.5]], shinU, 0.12), K.legMat, 0, -shinU / 2, 0, K.knee, 0.02, 0.12);
          if (K.extra) K.extra.forEach(o => o.parent && o.parent.remove(o)); K.extra = [];
          const wht = R.wht || (R.wht = toon('#f3f2f2')), blu = R.blu || (R.blu = toon('#38bdf8', { emissive: new THREE.Color('#38bdf8'), emissiveIntensity: 0.25 }));
          const ka = c.knee * D2R, out = new THREE.Vector3(0, 1 - Math.cos(ka), Math.sin(ka)).normalize();
          const cap = M(new THREE.SphereGeometry(0.082, 16, 12), wht, out.x * 0.07, out.y * 0.07, out.z * 0.07, K.knee, 0.012, 0.07); cap.scale.set(1.1, 0.95, 0.75); cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), out);
          const rim = M(new THREE.TorusGeometry(0.078, 0.011, 5, 20), blu, out.x * 0.086, out.y * 0.086, out.z * 0.086, K.knee, 0); rim.quaternion.copy(cap.quaternion); rim.scale.set(1.1, 0.95, 1);
          const cuffG = new THREE.LatheGeometry([[0.14, -0.058], [0.136, -0.046], [0.12, -0.018], [0.11, 0.018], [0.104, 0.046], [0.096, 0.058]].map(([x, y]) => new THREE.Vector2(x, y)), 22);
          const cy = -shinU + 0.05, cuff = M(cuffG, wht, 0, cy, 0.01, K.knee, 0.012, 0.124);
          const r1 = M(new THREE.TorusGeometry(0.1, 0.014, 6, 22), blu, 0, cy + 0.058, 0.01, K.knee, 0); r1.rotation.x = Math.PI / 2;
          const r2 = M(new THREE.TorusGeometry(0.139, 0.01, 5, 22), blu, 0, cy - 0.058, 0.01, K.knee, 0); r2.rotation.x = Math.PI / 2;
          K.extra.push(cap, rim, cuff, r1, r2);
        } else {
        K.thighM = M(new THREE.CapsuleGeometry(0.095, thighU - 0.1, 4, 10), K.legMat, 0, -thighU / 2, 0, p, 0.022, 0.095);
        K.shinM = M(new THREE.CapsuleGeometry(0.085, Math.max(0.02, shinU - 0.12), 4, 10), K.legMat, 0, -shinU / 2, 0, K.knee, 0.022, 0.085); }
        K.knee.position.set(0, -thighU, 0); K.knee.rotation.x = c.knee * D2R;
        if (K.boot) { K.boot.position.set(0, -shinU - 0.02, 0.05); K.boot.scale.copy(K.bs).multiplyScalar(c.boot); } });
    }
    R.set = cfg => { Object.assign(R.cfg, cfg); layout(); }; R.arms = arms; R.body = body; R.armOv = [null, null];
    R.update = (dt, speed) => {
      const c = R.cfg, bs = fox.scale.x || 1, sp = speed / bs, G = R.geo, moving = sp > 0.05;
      body.position.y += R.dy; R.t = (R.t || 0) + dt; if (R.glowMat) R.glowMat.emissiveIntensity = 1.3 + Math.sin(R.t * 3) * 0.35 + (moving ? 0.4 : 0);
      wheels.forEach(w => w.rotation.x += sp * dt / G.Rw); casters.forEach(w => w.rotation.x += sp * dt / Math.max(0.02, c.caster * k / 2));
      const vm = sp / k / 100, f = moving ? cl(0.35 + vm * 0.55, 0.35, 1.8) : 0; R.push = moving ? (R.push + dt * f) % 1 : R.push;
      R.amt = (R.amt || 0) + ((moving ? 1 : 0) - (R.amt || 0)) * Math.min(1, dt * 5);
      const rimR = (G.Rw - 0.035) * 0.86, ph = R.push, amp = c.push;
      let reach = true;
      [arms[1], arms[0]].forEach(A => { const i = A.i;   /* s667k the left paw first: the right one mirrors it */
        let ang, out = 0, rr = rimR;
        if (ph < 0.55) ang = -0.75 * amp + (0.95 * amp + 0.75 * amp) * (ph / 0.55);                 // contact: back-top → front
        else { const q = (ph - 0.55) / 0.45; ang = 0.95 * amp - (0.95 * amp + 0.75 * amp) * q; out = 0.06 * Math.sin(q * Math.PI); rr = rimR + 0.1 * Math.sin(q * Math.PI); }
        ang = -0.3 + (ang + 0.3) * R.amt; out *= R.amt; rr = rimR + (rr - rimR) * R.amt;
        const wx = A.side * (G.wx + 0.05 + (J ? (c.jOut ?? 0.045) : 0) + out),   /* s666c jointed: his real paw is bigger, so it sits a little further out on the rim (no clipping into the wheel) */ y = G.Rw + Math.cos(ang) * rr - body.position.y, z = G.wz + Math.sin(ang) * rr;
        const T = v1.set(wx, y, z);
        if (i === 1 && R.throwT > 0) T.set(A.side * 0.3, A.S.y + 0.45, 0.35 + (0.25 - R.throwT) * 1.6);
        { const ov = R.armOv && R.armOv[i]; if (ov && ov.w > 0) T.lerp(ov.T, Math.min(1, ov.w)); }   // a host (Fox Fighters) can pose a hand: punches, the shoe grab, the sword
        if (!solve(A, T.clone())) reach = false;
      });
      if (J) { u.grip = [1, 1]; u.fcurl = [R.cfg.curl || [0.9, 1, 1, 1], R.cfg.curl || [0.9, 1, 1, 1]]; }   /* s666 jointed: fingers closed on the push rims */
      R.info = { seatCm: c.seat, reachOk: reach, pushes: Math.round((moving ? cl(0.35 + vm * 0.55, 0.35, 1.8) : 0) * 60), wheelCm: c.wheel };
    };
    layout();
    return R;
  }
  return { attach };
}
