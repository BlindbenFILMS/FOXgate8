// MERU 2.0 — exterior polish round 11: TRAIN LINE + STATIONS OUTSIDE. Dressing on top of worlds/meru2-train.js (the loop is rebuilt from
// L.TRAIN.line with the same curve, so it lines up with the guideway).
// LINE: a concrete FOOTING under every pillar + a red band round each pillar shaft; a thin LIGHT LINE along both guideway faces under the red
// band (dark by day, warm white at night). STATIONS at street level: a stone APRON round the lift foot, a red MERU METRO totem (M roundel +
// station name, both faces) beside the lift, warm LIGHT POOLS on the ground under the platform at night. On the platform: an amber
// ALL STATIONS · LOOP board hanging from the canopy (both faces). Existing names only, no people or lines. ~7 draws.
export function buildTrainSide({ THREE, scene, L, train, touch }) {
  const root = new THREE.Group(); root.name = 'meru2TrainSide'; scene.add(root); const parts = [], col = new THREE.Color(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), INK = '#201e1d', RED = '#ec3013', STONE = '#cfc9c0', STONED = '#a9a39a', CON = '#9a958d';
  const part = (geo, c, x, y, z, ry = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of ['uv', 'uv1']) if (g.attributes[k]) g.deleteAttribute(k); const n = g.attributes.position.count, a = new Float32Array(n * 3); col.set(c); for (let i = 0; i < n; i++) a.set([col.r, col.g, col.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(a, 3)); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(1, 1, 1))); parts.push(g); };
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const onRoad = (x, z, m = 0.5) => L.ROADS.some(r => segD(x, z, r.p) < r.w / 2 + m), inBld = (x, z, skip) => L.BUILDINGS.some(b => b.key !== skip && x > b.f[0] && x < b.f[1] && z > b.f[2] && z < b.f[3]);
  const curve = new THREE.CatmullRomCurve3(L.TRAIN.line.map(([x, z]) => V(x, 0, z)), true, 'catmullrom', 0.3), LEN = curve.getLength(), N = Math.ceil(LEN);
  const S = []; for (let i = 0; i < N; i++) { const p = curve.getPointAt(i / N), t = curve.getTangentAt(i / N), l = Math.hypot(t.x, t.z) || 1; S.push([p.x, p.z, t.x / l, t.z / l]); }
  const tanAt = (x, z) => { let b = S[0], bd = 1e18; for (const s of S) { const d = (s[0] - x) ** 2 + (s[1] - z) ** 2; if (d < bd) { bd = d; b = s; } } return b; };
  const M4 = new THREE.Matrix4();

  // ---------- pillars: footing + red band ----------
  const pil = train.colliders.filter(c => c.c && c.c[2] === 1 && c.y1 === 5.5).map(c => c.c);
  { const ft = new THREE.InstancedMesh(B(2.7, 0.24, 2.7).translate(0, 0.12, 0), new THREE.MeshToonMaterial({ color: CON }), pil.length), bd = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.95, 0.96, 0.32, 12).translate(0, 2.0, 0), new THREE.MeshToonMaterial({ color: RED }), pil.length);
    pil.forEach(([x, z], i) => { const [, , tx, tz] = tanAt(x, z); M4.makeRotationY(Math.atan2(tx, tz)).setPosition(x, 0, z); ft.setMatrixAt(i, M4); bd.setMatrixAt(i, M4); }); ft.receiveShadow = true; root.add(ft, bd); }

  // ---------- guideway light line (both faces, under the red band) ----------
  const lineM = new THREE.MeshBasicMaterial({ color: 0x55524d, side: THREE.DoubleSide });
  { const pos = [], step = touch ? 3 : 2, n = Math.ceil(LEN / step), at = s => { const p = curve.getPointAt(((s % LEN) + LEN) % LEN / LEN), t = curve.getTangentAt(((s % LEN) + LEN) % LEN / LEN), l = Math.hypot(t.x, t.z) || 1; return [p.x, p.z, t.x / l, t.z / l]; };
    let A = at(0); for (let i = 0; i < n; i++) { const Bq = at((i + 1) * step); for (const sd of [-2.79, 2.79]) { const q = [[A, 7.3], [Bq, 7.3], [Bq, 7.37], [A, 7.37]].map(([p, y]) => [p[0] + p[3] * sd, y, p[1] - p[2] * sd]); for (const j of [0, 1, 2, 0, 2, 3]) pos.push(...q[j]); } A = Bq; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeBoundingSphere(); root.add(new THREE.Mesh(g, lineM)); }

  // ---------- stations ----------
  const totems = [], pools = [], boards = [], grassOff = [], PY = train.PLAT_Y;
  for (const st of train.stops) { const W = (a, ls) => train.toW(st.key, a, ls), la = st.liftA, own = null, inB = (x, z) => inBld(x, z, own);
    { const lw = W(la, 9.4); grassOff.push({ c: [lw.x, lw.z, 2.4] });
      for (const [hw, l0, l1] of [[5.5, 6.5, 12.6], [2.6, 7.4, 11.6]]) { const c = W(la, (l0 + l1) / 2), cs = [W(la - hw, l0), W(la + hw, l0), W(la - hw, l1), W(la + hw, l1)]; if (cs.some(p => onRoad(p.x, p.z, 0.2) || inB(p.x, p.z))) continue;
        part(B(l1 - l0, 0.04, hw * 2), STONE, c.x, 0.02, c.z, c.yaw); part(B(l1 - l0 + 0.2, 0.02, hw * 2 + 0.2), STONED, c.x, 0.01, c.z, c.yaw); for (const o of [-hw / 2, hw / 2]) { const q = W(la + o, (l0 + l1) / 2); grassOff.push({ c: [q.x, q.z, Math.max(hw, (l1 - l0) / 2) * 0.75] }); } break; } }
    for (const [da, ls] of [[-3.4, 9.6], [-3.4, 12.2], [5.6, 9.6], [-6, 9.6], [-3.4, 14], [5.6, 13], [-8, 12], [8, 11]]) { const w = W(la + da, ls); if (onRoad(w.x, w.z, 0.8) || inB(w.x, w.z)) continue;
      part(B(0.95, 3.2, 0.3), RED, w.x, 1.6, w.z, w.yaw); part(B(1.05, 0.12, 0.4), INK, w.x, 0.06, w.z, w.yaw); grassOff.push({ c: [w.x, w.z, 0.8] }); totems.push([w.x, w.z, w.yaw, st.label.toUpperCase()]); train.colliders.push({ c: [w.x, w.z, 0.55], y1: 4 }); break; }
    for (let a = -46; a <= 46; a += 8) { const w = W(a, 4.9); if (!inBld(w.x, w.z)) pools.push([w.x, w.z]); }
    { const w = W(la + 7, 4.9); boards.push([w.x, w.z, w.yaw]); for (const o of [-1.4, 1.4]) { const h = W(la + 7 + o, 4.9); part(B(0.04, 0.8, 0.04), INK, h.x, 11.88, h.z, h.yaw); } part(B(0.12, 0.62, 3.5), INK, w.x, 11.2, w.z, w.yaw); } }

  // ---------- merge ----------
  { let n = 0; for (const g of parts) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); cl.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(cl, 3)); G.computeBoundingSphere();
    const m = new THREE.Mesh(G, new THREE.MeshToonMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); m.receiveShadow = true; root.add(m); }
  // quads on a face: list [x, y, z, yaw, w, h, off], uv rect per item
  const faces = (list, uvs, mat) => { const P = [], U = []; list.forEach(([x, y, z, yaw, w, h, off], i) => { const [u0, v0, u1, v1] = uvs(i), s = Math.sin(yaw), c = Math.cos(yaw);
      for (const f of [1, -1]) { const q = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([lx, ly]) => { const X = lx * f; return [x + c * X + s * off * f, y + ly, z - s * X + c * off * f]; }), uv = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
        for (const j of [0, 1, 2, 0, 2, 3]) { P.push(...q[j]); U.push(...uv[j]); } } });
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); root.add(new THREE.Mesh(G, mat)); };
  if (totems.length) { const n = totems.length, cv = document.createElement('canvas'); cv.width = 128 * n; cv.height = 432; const g = cv.getContext('2d');
    totems.forEach(([, , , name], i) => { const x0 = i * 128; g.fillStyle = '#ec3013'; g.fillRect(x0, 0, 128, 432); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x0 + 64, 70, 48, 0, 7); g.fill(); g.fillStyle = '#ec3013'; g.font = '900 64px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', x0 + 64, 74);
      g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('MERU', x0 + 12, 140); g.fillText('METRO', x0 + 12, 164); g.fillRect(x0 + 12, 196, 104, 3);
      g.font = '800 19px Archivo, sans-serif'; const words = name.split(' '); let line = '', y = 212; for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > 104 && line) { g.fillText(line, x0 + 12, y); y += 24; line = w; } else line = t; } if (line) g.fillText(line, x0 + 12, y); });
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    faces(totems.map(([x, z, yaw]) => [x, 1.65, z, yaw, 0.85, 2.9, 0.16]), i => [i / n, 0, (i + 1) / n, 1], new THREE.MeshBasicMaterial({ map: tex })); }
  const boardM = new THREE.MeshBasicMaterial({ color: 0xbbbbbb });
  if (boards.length) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 80; const g = cv.getContext('2d'); g.fillStyle = '#14181c'; g.fillRect(0, 0, 512, 80); g.fillStyle = '#ffb347'; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('\u25cf ALL STATIONS \u00b7 LOOP', 22, 42, 470);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; boardM.map = tex;
    faces(boards.map(([x, z, yaw]) => [x, 11.2, z, yaw + Math.PI / 2, 3.3, 0.52, 0.065]), () => [0, 0, 1, 1], boardM); }
  // night light pools under the platforms
  let poolM = null; { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,226,170,0.85)'); r.addColorStop(1, 'rgba(255,226,170,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    poolM = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(7, 7).rotateX(-Math.PI / 2), poolM, pools.length); pools.forEach(([x, z], i) => { M4.makeTranslation(x, 0.06, z); im.setMatrixAt(i, M4); }); im.visible = false; root.add(im); poolM.im = im; }
  return { grassOff, stats: { pillars: pil.length, totems: totems.length, boards: boards.length, pools: pools.length },
    setNight(on) { lineM.color.set(on ? 0xfff0c8 : 0x55524d); boardM.color.set(on ? 0xffffff : 0xbbbbbb); poolM.im.visible = on; } };
}
