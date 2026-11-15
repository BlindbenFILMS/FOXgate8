// s728at 3D FOX MOUTH on the PLAYER fox (Ben). s728bb DEEP POLISH: everything is now FITTED TO THE REAL FACE SURFACE.
// At build, rays are cast at the fox's own head (snout + skull + face mask + cheeks, not hair / ears / ink) to trace the MOUTH SEAM: round the
// front of the snout and back along each side to the cheek, at several heights. From that outline:
//  • UPPER LIP: one smooth tapered ink stroke lying ON the surface (so it never floats off the face); its corners slide up the surface for a
//    smile / down for a frown / one side for a smirk, with a small centre notch under the nose + corner dimples.
//  • LOWER JAW: lofted from the same outline (each outline point sweeps down + in to a rounded chin), so it matches the snout's width
//    exactly; cream, vertex shaded, inked, hinged at the cheek. A lower-lip line + pout for sad.
//  • INSIDE: a dark roof under the snout + a dark floor on the jaw + a dark cavity, tongue, upper teeth row + 2 fangs (shown when open).
// The upper parts ride a pivot that follows the snout's talk lift. Driven by the speech engine (u.mp) via u.m3dTick (animFox); the painted
// canvas mouth is skipped (face.m3d). Rest emotions from EMO (jaw crack, clench, pout, grin, nervous wobble).
const EMO = { happy: { jaw: 0.0 }, excited: { jaw: 0.14 }, joy: { jaw: 0.14 }, surprised: { jaw: 0.24 }, shock: { jaw: 0.34 }, amazed: { jaw: 0.22 }, curious: { jaw: 0.07 },
  sad: { jaw: 0.02, pout: 1 }, guilty: { pout: 0.6 }, hopeful: { jaw: 0.03 }, stern: { clench: 1 }, determined: { clench: 0.8 }, brave: { clench: 0.6 },
  grumpy: { clench: 1, pout: 0.4 }, frustrated: { clench: 1 }, nervous: { jaw: 0.04, wob: 1 } };
export function addFoxMouth3D(THREE, fox) {
  const u = fox.userData, P = u.P, f = u.face, L = (f && f.L) || {}, head = P.head, sn = P.snout; if (!sn || u.m3d) return;
  fox.updateMatrixWorld(true);
  sn.geometry.computeBoundingBox(); sn.updateMatrix(); const b = sn.geometry.boundingBox.clone().applyMatrix4(sn.matrix);
  const len = b.max.z - b.min.z, w = b.max.x - b.min.x, h = b.max.y - b.min.y, gm = sn.material && sn.material.gradientMap;
  const V = (x, y, z) => new THREE.Vector3(x, y, z), toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: gm || null, ...o });
  const INKC = 0x1e293b, LK = new THREE.MeshBasicMaterial({ color: INKC }), INK = new THREE.MeshBasicMaterial({ color: INKC, side: THREE.BackSide });
  // ---- 1. trace the seam with rays (head space) ----
  const skip = new Set(); [...(P.hair || []), ...(P.ears || [])].forEach(o => o && o.traverse(q => skip.add(q)));
  const allow = new Set(); const sk0 = head.children.find(c => c.isMesh); [sn, sk0].forEach(r => r && r.traverse(q => allow.add(q))); if (P.nose) P.nose.traverse(q => skip.add(q)); if (P.shine) skip.add(P.shine);
  const targets = []; head.traverse(o => { if (!o.isMesh || skip.has(o) || !allow.has(o) || !o.visible) return; const m = o.material; if (!m || Array.isArray(m) || m.side === THREE.BackSide) return; o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius < 0.05) return; targets.push(o); });
  const rc = new THREE.Raycaster(), hw = head.matrixWorld, hwInv = hw.clone().invert();
  const cast = (o, d) => { const ow = o.clone().applyMatrix4(hw), dw = d.clone().transformDirection(hw); rc.set(ow, dw); rc.far = 10; const hit = rc.intersectObjects(targets, false)[0]; return hit ? hit.point.clone().applyMatrix4(hwInv) : null; };
  const C = V(0, 0, b.min.z + len * 0.55), zTip = b.max.z;
  const yBottom = z => { const p = cast(V(0, b.min.y - 2, z), V(0, 1, 0)); return p && p.y < b.min.y + h * 0.6 ? p.y : null; };
  const NT = 15, NS = 4, LVN = 9, LVD = h * 0.05, samples = [];   // samples: { t (-1..1), dir/origin fn }
  let ybF = yBottom(zTip - len * 0.12) ?? (b.min.y + h * 0.1);
  for (let s = -1; s <= 1; s += 2) for (let k = NS; k >= 1; k--) samples.push({ t: s * (0.7 + 0.3 * k / NS), kind: 'side', s, z: C.z - (k / NS) * len * 0.38 });
  for (let i = 0; i <= NT; i++) { const th = (i / NT * 2 - 1) * Math.PI / 2; samples.push({ t: (i / NT * 2 - 1) * 0.7, kind: 'arc', th }); }
  samples.sort((a, c) => a.t - c.t);
  for (const S of samples) {
    if (S.kind === 'arc') { const ze = C.z + Math.cos(S.th) * len * 0.3; S.base = (yBottom(ze) ?? ybF) - h * (L.mouthDrop ?? 0.2); }   /* s728bk (Ben: the mouth sat up in the nose): lower + further back, under the snout tip */
    else S.base = null;
  }
  const arcSide = samples.filter(S => S.kind === 'arc'), frontBase = arcSide[Math.floor(arcSide.length / 2)].base;
  arcSide.forEach(S => { S.base = S.base + (frontBase - S.base) * 0.8; });   /* s728be a level seam: the corners sit as high as the front, so a smile reads as a smile from the front */
  const baseSide = arcSide[0].base; samples.forEach(S => { if (S.base == null) S.base = baseSide + h * 0.02 * (Math.abs(S.t) - 0.7) / 0.3; });
  for (const S of samples) { S.lv = []; for (let k = 0; k < LVN; k++) { const y = S.base + (k - 3) * LVD; let p;
      if (S.kind === 'arc') { const d = V(Math.sin(S.th), 0, Math.cos(S.th)); p = cast(V(C.x, y, C.z).addScaledVector(d, 3), d.clone().negate()); }
      else p = cast(V(S.s * 3, y, S.z), V(-S.s, 0, 0));
      S.lv.push(p || (k ? S.lv[k - 1].clone().setY(y) : V(S.kind === 'arc' ? Math.sin(S.th) * w * 0.45 : S.s * w * 0.45, y, S.kind === 'arc' ? C.z + Math.cos(S.th) * len * 0.42 : S.z))); } }
  /* s728bt SMOOTH the traced outline (rays near the centre dipped into the snout tip: a notch that showed as 2 lines down the chin + bumps in the lip) */
  for (let k = 0; k < LVN; k++) for (let pass = 0; pass < 6; pass++) { const src = samples.map(S => S.lv[k].clone()); for (let i = 1; i < samples.length - 1; i++) { const a = src[i - 1], c = src[i + 1], p = samples[i].lv[k]; const mx = (a.x + c.x) / 2, mz = (a.z + c.z) / 2; p.x += (mx - p.x) * 0.5; p.z = Math.max(p.z, p.z + (mz - p.z) * 0.5); } }
  const outward = (p, k) => { const d = V(p.x, 0, p.z - C.z); if (d.lengthSq() < 1e-6) d.set(0, 0, 1); d.normalize(); return p.clone().addScaledVector(d, k); };
  const at = (S, dy) => { const kf = Math.min(LVN - 1.001, Math.max(0, dy / LVD + 3)), k0 = Math.floor(kf); return S.lv[k0].clone().lerp(S.lv[k0 + 1], kf - k0); };
  // ---- 2. pivot that follows the snout lift ----
  const piv = new THREE.Group(); piv.position.copy(sn.position); piv.rotation.x = sn.rotation.x; head.add(piv); piv.updateMatrix(); const pivInv = piv.matrix.clone().invert();
  const toPiv = p => p.clone().applyMatrix4(pivInv);
  // ---- 3. lower jaw lofted from the seam ----
  const seam = samples.map(S => outward(at(S, 0), w * 0.012)), hingeZ = C.z - len * 0.4, hingeY = baseSide;
  const jaw = new THREE.Group(); jaw.position.set(0, hingeY, hingeZ); head.add(jaw);
  const cJ = new THREE.Color(L.chinPatchCol || L.chin || L.muzzle || '#ffe9d0'), R = 10, n = seam.length;
  const zMid = seam.reduce((a, p) => a + p.z, 0) / seam.length - hingeZ;
  const jawGeo = (inflate) => { const pos = [], col = [], idx = [], c = new THREE.Color(); for (let i = 0; i < n; i++) { const O = seam[i], t = samples[i].t, dep = h * (0.34 - 0.08 * Math.abs(t)), ox = O.x, oy = O.y - hingeY, oz = O.z - hingeZ;
      for (let j = 0; j <= R; j++) { const ph = j / R * Math.PI / 2, sp = Math.sin(ph), sh = 1 - 0.55 * (1 - Math.cos(ph)), x = ox * sh, y = oy - dep * sp, z = zMid + (oz - zMid) * sh;   /* s728bs the outline SHRINKS toward its middle as it goes down (no fold where the columns met) */ pos.push(x, y, z);
        c.copy(cJ).multiplyScalar(0.84 + 0.12 * (1 - Math.abs(t)) + 0.05 * Math.cos(ph)); col.push(c.r, c.g, c.b); } }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < R; j++) { const a = i * (R + 1) + j, d = a + R + 1; idx.push(a, a + 1, d, d, a + 1, d + 1); }
    { const c0 = pos.length / 3; let cx = 0, cy = 0, cz = 0; for (let i = 0; i < n; i++) { const q = (i * (R + 1) + R) * 3; cx += pos[q]; cy += pos[q + 1]; cz += pos[q + 2]; } pos.push(cx / n, cy / n - h * 0.03, cz / n); col.push(cJ.r * 0.9, cJ.g * 0.9, cJ.b * 0.9); for (let i = 0; i < n - 1; i++) idx.push(c0, (i + 1) * (R + 1) + R, i * (R + 1) + R); }   /* bottom cap */
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    if (inflate) { const p = g.attributes.position, nn = g.attributes.normal; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + nn.getX(i) * inflate, p.getY(i) + nn.getY(i) * inflate, p.getZ(i) + nn.getZ(i) * inflate); }
    return g; };
  const JG = jawGeo(0), jm = new THREE.Mesh(JG, toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); jaw.add(jm); jm.castShadow = true;
  const ji = new THREE.Mesh(jawGeo(w * 0.022), INK); jaw.add(ji);
  // ---- 4. inside: roof (pivot), floor (jaw), cavity, tongue, teeth, fangs ----
  const DARK = toon('#3a1418', { side: THREE.DoubleSide });
  const fan = (pts, par) => { const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length, cy = pts.reduce((a, p) => a + p.y, 0) / pts.length, cz = pts.reduce((a, p) => a + p.z, 0) / pts.length, pos = [cx, cy, cz], idx = [];
    pts.forEach(p => pos.push(cx + (p.x - cx) * 0.94, p.y, cz + (p.z - cz) * 0.94)); for (let i = 1; i < pts.length; i++) idx.push(0, i, i + 1);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, DARK); par.add(m); return m; };
  fan(samples.map(S => toPiv(at(S, -h * 0.04))), piv);
  fan(seam.map(p => V(p.x, p.y - hingeY - h * 0.05, p.z - hingeZ)), jaw);
  const cav = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), DARK); cav.position.set(0, baseSide - h * 0.1, C.z - len * 0.1); cav.scale.set(w * 0.24, 0.001, len * 0.2); head.add(cav);
  const front = samples[Math.floor(n / 2)], fJ = V(0, seam[Math.floor(n / 2)].y - hingeY, seam[Math.floor(n / 2)].z - hingeZ);
  // s728bm TONGUE: a real tongue shape (flat, wide at the root, rounded tip), vertex-shaded darker at the back + a centre groove, a soft dark
  // edge; it slides forward + lifts on L / TH and wiggles a little while talking
  const tgG = (() => { const g = new THREE.SphereGeometry(1, 28, 16), p = g.attributes.position, col = [], c = new THREE.Color(), cT = new THREE.Color('#e0647a'), cB = new THREE.Color('#9e3346');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), zz = p.getZ(i), wd = 1 - 0.35 * Math.max(0, zz); p.setX(i, x * wd); p.setY(i, y * (y > 0 ? 0.55 : 0.35) - (y > 0 ? 0.25 * Math.exp(-(x * x) / 0.02) * y : 0));
      c.copy(cT).lerp(cB, Math.max(0, -zz) * 0.7 + Math.exp(-(x * x) / 0.01) * (y > 0 ? 0.35 : 0)); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g; })();
  const tg = new THREE.Group(); jaw.add(tg); { const m = new THREE.Mesh(tgG, toon('#ffffff', { vertexColors: true })); tg.add(m); const o = new THREE.Mesh(tgG, new THREE.MeshBasicMaterial({ color: 0x5a1a26, side: THREE.BackSide })); o.scale.setScalar(1.06); tg.add(o); }
  tg.scale.set(w * 0.22, h * 0.09, len * 0.2); const tg0 = V(0, fJ.y + h * 0.05, fJ.z - len * 0.14); tg.position.copy(tg0);
  // s728bm TEETH: a pink GUM strip along the upper seam, a row of rounded incisors following the arc of the snout, 2 curved upper FANGS, and a
  // smaller LOWER row + 2 little lower canines riding the jaw; ivory with a faint edge so they read
  const TM = toon('#fbf6ea'), TI = new THREE.MeshBasicMaterial({ color: 0x8b7f6a, side: THREE.BackSide }), GUM = toon('#c4566a');
  const teethG = new THREE.Group(); piv.add(teethG); const lowG = new THREE.Group(); jaw.add(lowG);
  const arcs = samples.filter(S => S.kind === 'arc'), na = arcs.length, mid = (na - 1) / 2;
  const inner = (S, dy, k) => { const p = toPiv(at(S, dy)), c = toPiv(V(0, p.y, C.z)); return p.lerp(c, k); };
  const tooth = (par, p, sz, ln, curve) => { const g = new THREE.CapsuleGeometry(sz, ln, 4, 10), q = g.attributes.position; for (let i = 0; i < q.count; i++) { const y = q.getY(i); q.setX(i, q.getX(i) * (0.55 + 0.45 * Math.min(1, Math.max(0, (y + ln) / ln)))); q.setZ(i, q.getZ(i) * 0.6 + curve * Math.max(0, -y) * Math.max(0, -y) * 4); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, TM); m.position.copy(p); par.add(m); const o = new THREE.Mesh(g, TI); o.scale.setScalar(1.12); m.add(o); return m; };
  { const gp = arcs.filter((S, i) => Math.abs(i - mid) / mid < 0.85).map(S => inner(S, -h * 0.045, 0.04)); void gp;   /* s728bp gum strip removed (it poked out in front of the snout) */ }
  for (let i = 0; i < na; i++) { const d = Math.abs(i - mid) / mid; if (d > 0.45 || (i - Math.round(mid)) % 2) continue; tooth(teethG, inner(arcs[i], -h * 0.06, 0.2), w * 0.019 * (1 - d * 0.3), h * 0.03 * (1 - d * 0.35), 0); }
  for (const s of [-1, 1]) { const i = Math.round(mid + s * mid * 0.78); tooth(teethG, inner(arcs[i], -h * 0.06, 0.2), w * 0.022, h * 0.055, -0.04); }
  for (let i = 0; i < na; i++) { const d = Math.abs(i - mid) / mid; if (d > 0.4 || (i - Math.round(mid)) % 2) continue; const O = seam[samples.indexOf(arcs[i])], t = tooth(lowG, V(O.x * 0.82, O.y - hingeY + h * 0.01, O.z - hingeZ - len * 0.04), w * 0.015, h * 0.02, 0); t.rotation.x = Math.PI; }
  for (const s of [-1, 1]) { const i = Math.round(mid + s * mid * 0.6), O = seam[samples.indexOf(arcs[i])], t = tooth(lowG, V(O.x * 0.82, O.y - hingeY + h * 0.015, O.z - hingeZ - len * 0.04), w * 0.016, h * 0.03, 0.03); t.rotation.x = Math.PI; }
  // ---- 5. live lip stroke ----
  const taper = (pts, r0, r1, seg = 64) => { const cv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), RR = 8, pos = [], idx = [], fr = cv.computeFrenetFrames(seg, false);
    for (let i = 0; i <= seg; i++) { const t = i / seg, p = cv.getPointAt(t), rad = r1 + (r0 - r1) * Math.pow(Math.sin(t * Math.PI), 0.6); for (let j = 0; j <= RR; j++) { const a = j / RR * Math.PI * 2, N = fr.normals[i], B = fr.binormals[i]; pos.push(p.x + rad * (Math.cos(a) * N.x + Math.sin(a) * B.x), p.y + rad * (Math.cos(a) * N.y + Math.sin(a) * B.y), p.z + rad * (Math.cos(a) * N.z + Math.sin(a) * B.z)); } }
    for (let i = 0; i < seg; i++) for (let j = 0; j < RR; j++) { const a = i * (RR + 1) + j, c = a + RR + 1; idx.push(a, c, a + 1, c, c + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const lr = w * 0.027, upper = new THREE.Mesh(new THREE.BufferGeometry(), LK); piv.add(upper);
  const caps = [0, 1].map(() => { const c = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), LK); piv.add(c); return c; });
  const dimples = [0, 1].map(() => { const d = new THREE.Mesh(new THREE.BufferGeometry(), LK); piv.add(d); return d; });
  const notch = new THREE.Mesh(new THREE.BufferGeometry(), LK); piv.add(notch);
  const lower = new THREE.Mesh(new THREE.BufferGeometry(), LK); jaw.add(lower);
  function buildLips(s) {
    const pts = samples.map(S => { const a = Math.abs(S.t), side = Math.sign(S.t) || 1, cor = Math.max(0, (a - 0.45) / 0.55), tl = Math.max(-0.9, Math.min(0.9, s.smile + side * s.smirk * 0.8));
      const dy = tl * h * (0.18 * a * a + 0.08 * cor * cor - 0.03) - s.press * h * 0.02 * (1 - a); return toPiv(outward(at(S, dy), w * 0.018)); });
    const k0 = Math.max(0, Math.round(s.round * 2.5 + s.open * 1.5)), use = pts.slice(k0, pts.length - k0);   // round / open: corners pull in
    upper.geometry.dispose(); upper.geometry = taper(use, lr * (1.15 + s.press * 0.4), lr * 0.4); caps[0].position.copy(use[0]); caps[1].position.copy(use[use.length - 1]); caps.forEach(c => c.scale.setScalar(lr * 0.42));
    dimples.forEach((d, k) => { const side = k ? 1 : -1, tl = Math.max(-0.9, Math.min(0.9, s.smile + side * s.smirk * 0.8)), dd = Math.min(0.5, Math.abs(tl) - 0.12); d.visible = dd > 0.02 && !k0; if (!d.visible) return; const e = k ? use[use.length - 1] : use[0], up = Math.sign(tl);
      d.geometry.dispose(); d.geometry = taper([e.clone(), e.clone().add(V(side * w * 0.012, up * h * 0.05 * (0.4 + dd), -len * 0.025)), e.clone().add(V(side * w * 0.02, up * h * 0.1 * (0.4 + dd), -len * 0.03))], lr * 0.95, lr * 0.25, 16); });
    // centre notch: a short line from the lip up toward the nose
    { const mid = pts[Math.floor(pts.length / 2)]; notch.visible = false; if (0) notch.geometry = taper([mid.clone(), mid.clone().add(V(0, h * 0.06, -len * 0.004))], lr * 0.75, lr * 0.45, 8); }
    const lw = samples.map((S, i) => [S, i]).filter(([S]) => Math.abs(S.t) < 0.5).map(([S, i]) => { const O = seam[i], a = Math.abs(S.t), dep = h * (0.34 - 0.08 * a), ph = 0.3 + s.pout * 0.15; return V(O.x * Math.cos(ph) * 1.02, O.y - hingeY - dep * Math.sin(ph) + s.pout * h * 0.02, O.z - hingeZ + w * 0.01 + s.pout * len * 0.04 * (1 - a * 2)); });
    lower.visible = s.open > 0.07 || s.pout > 0.15; if (lower.visible) { lower.geometry.dispose(); lower.geometry = taper(lw, lr * (0.75 + s.pout * 0.35), lr * 0.3, 32); }
  }
  const M = { piv, jaw, cav, tg, teethG, lowG, mo: 0, key: '', s: { smile: 0, smirk: 0, round: 0, press: 0, open: 0, pout: 0, jaw: 0, clench: 0 } };
  u.m3d = M; if (f) { f.m3d = true; f.key = ''; }
  const ease = (a, c, k) => a + (c - a) * k;
  u.m3dTick = dt => { const mp = u.mp || {}, mood = u.lineMood || u.mood, E = EMO[mood] || {}, talking = (u.mouth || 0) > 0.05 && u.talking, k = Math.min(1, dt * 10), S2 = M.s;
    piv.rotation.x = sn.rotation.x;
    const op = Math.min(1, (mp.open ?? u.mouth ?? 0) * 1.35) * (1 - (mp.press || 0) * 0.9); M.mo += (op - M.mo) * Math.min(1, dt * 22);
    S2.jaw = ease(S2.jaw, talking ? 0 : (E.jaw || 0) + (E.wob ? Math.sin(performance.now() / 70) * 0.02 : 0), k); S2.clench = ease(S2.clench, talking ? 0 : (E.clench || 0), k); S2.pout = ease(S2.pout, talking ? 0 : (E.pout || 0), k);
    for (const q of ['smile', 'smirk', 'round']) S2[q] = ease(S2[q], mp[q] || 0, Math.min(1, dt * 14)); S2.press = ease(S2.press, Math.max(mp.press || 0, S2.clench * 0.8), k);
    const m = Math.max(0, M.mo + S2.jaw); S2.open = m;
    jaw.rotation.x = m * 0.52; jaw.position.y = hingeY - m * h * 0.14 + S2.clench * h * 0.01; jaw.position.z = hingeZ + S2.pout * len * 0.02;
    teethG.visible = m > 0.06; lowG.visible = m > 0.14;   /* s728bq only when the mouth is open (the smile's mp.teeth showed them through the closed lip as 2 lines) */ cav.scale.y = Math.max(0.001, m * h * 0.38); cav.position.y = baseSide - m * h * 0.14;
    { const tq = mp.tongue || 0, wig = talking ? Math.sin(performance.now() / 90) * 0.08 : 0; tg.position.set(0, tg0.y + tq * h * 0.1, tg0.z + tq * len * 0.12); tg.rotation.x = -tq * 0.35 - m * 0.1; tg.rotation.z = wig * 0.5; tg.visible = m > 0.04; }
    const key = [S2.smile, S2.smirk, S2.round, S2.press, S2.open, S2.pout].map(v => Math.round(v * 30)).join(','); if (key !== M.key) { M.key = key; buildLips(S2); } };
  buildLips(M.s); return M;
}
