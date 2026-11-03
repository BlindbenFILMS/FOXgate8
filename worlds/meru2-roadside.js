// MERU 2.0 — ROAD SIDE (Ben, s33): every building round the fountain faces the plaza, so from the ring road you saw only blank backs.
// (1) BACK DOORS: a real sliding glass door on the road-side wall wherever the room behind it is free (planned here, saved to
//     localStorage 'meru2.backDoors' with the layout it was planned for; worlds/meru2-layout.js opens them on the next load).
// (2) ROOFTOP BILLBOARD facing the road (lit), (3) a big PAINTED WALL SIGN on the road-side wall, (4) the front sign mirrored on the
//     back (the city draws it over a back door; a sign band where there is none). WAYFINDING: (5) fingerposts where each yellow side
//     path leaves the main road, (6) a name plaque at each side-path mouth, (7) arrows painted on the bricks, (8) a TOWN MAP at the fountain.
export function planBackDoors({ L, cols, city }) {
  const ring = { W: -160, E: 160, N: -140, S: 150 }, R = ['N', 'E', 'S', 'W'], out = {}, TOWN = [-158, 158, -138, 148];
  const hit = (a, c) => c.f ? a[0] < c.f[1] && a[1] > c.f[0] && a[2] < c.f[3] && a[3] > c.f[2] : c.c ? c.c[0] + c.c[2] > a[0] && c.c[0] - c.c[2] < a[1] && c.c[1] + c.c[2] > a[2] && c.c[1] - c.c[2] < a[3] : false;
  for (const b of L.BUILDINGS) { if (b.fixedBack) { out[b.key] = { door: b.door2.slice(), face: b.face2, fixed: true }; continue; }
    if (!b.f || !b.door || b.open || (b.door2 && !b.backDoor) || /^station/.test(b.key)) continue; const [x0, x1, z0, z1] = b.f, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!(cx > TOWN[0] && cx < TOWN[1] && cz > TOWN[2] && cz < TOWN[3])) continue;
    const dist = { N: z0 - ring.N, S: ring.S - z1, W: x0 - ring.W, E: ring.E - x1 }, sides = R.filter(sd => sd !== b.face && !(b.solid || []).includes(sd)).sort((p, q) => dist[p] - dist[q]);
    const inner = cols.filter(c => (c.f && c.f[0] >= x0 + 0.3 && c.f[1] <= x1 - 0.3 && c.f[2] >= z0 + 0.3 && c.f[3] <= z1 - 0.3) || (c.c && c.c[0] > x0 + 0.3 && c.c[0] < x1 - 0.3 && c.c[1] > z0 + 0.3 && c.c[1] < z1 - 0.3)), outer = cols.filter(c => !inner.includes(c) && !(c.f && (c.f[1] - c.f[0] > 30 || c.f[3] - c.f[2] > 30 || c.f[1] - c.f[0] < 0.6 || c.f[3] - c.f[2] < 0.6)));
    let pick = null;
    for (const sd of sides.slice(0, 2)) { const along = sd === 'N' || sd === 'S', a0 = along ? x0 : z0, a1 = along ? x1 : z1, mid = (a0 + a1) / 2, wall = sd === 'N' ? z0 : sd === 'S' ? z1 : sd === 'W' ? x0 : x1, dir = sd === 'N' || sd === 'W' ? -1 : 1;
      for (const off of [0, 3, -3, 6, -6, 9, -9, 12, -12, 15, -15]) { const a = mid + off; if (a < a0 + 3.5 || a > a1 - 3.5) continue;
        const ib = along ? [a - 2.6, a + 2.6, Math.min(wall, wall - dir * 3.5), Math.max(wall, wall - dir * 3.5)] : [Math.min(wall, wall - dir * 3.5), Math.max(wall, wall - dir * 3.5), a - 2.6, a + 2.6];
        const ob = along ? [a - 2.6, a + 2.6, Math.min(wall, wall + dir * 3), Math.max(wall, wall + dir * 3)] : [Math.min(wall, wall + dir * 3), Math.max(wall, wall + dir * 3), a - 2.6, a + 2.6];
        if (inner.some(c => hit(ib, c)) || outer.some(c => hit(ob, c))) continue; pick = { door: along ? [a, wall] : [wall, a], face: sd }; break; }
      if (pick) break; }
    out[b.key] = pick || { none: true, face: sides[0] }; }
  return out;
}

export function buildRoadside({ THREE, scene, L, city, fronts, back, heightAt, touch }) {
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const G = new THREE.Group(); G.name = 'roadside'; scene.add(G);
  const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, RY = { N: Math.PI, S: 0, E: Math.PI / 2, W: -Math.PI / 2 }, ACC = ['#ec3013', '#ffd23a', '#2e8bd8', '#3f9a5e', '#ff3fb4', '#f97316'];
  const dark = new THREE.MeshLambertMaterial({ color: 0x201e1d }), steel = new THREE.MeshLambertMaterial({ color: 0x3a3836 }), BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const put = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const plane = (tex, w, h, x, y, z, ry, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: !!opt.alpha, alphaTest: opt.alpha ? 0.4 : 0, side: opt.both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const fit = (g, txt, max, w) => { let s = max; g.font = '900 ' + s + 'px Archivo, Arial'; while (g.measureText(txt).width > w && s > 12) { s -= 2; g.font = '900 ' + s + 'px Archivo, Arial'; } return s; };
  const BL = (city.blds || []).filter(bd => { const b = bd.b; return b.door && !b.open && !/^station/.test(b.key) && Math.abs((bd.x0 + bd.x1) / 2) < 158 && (bd.z0 + bd.z1) / 2 > -138 && (bd.z0 + bd.z1) / 2 < 148; });
  BL.forEach((bd, bi) => { const b = bd.b, pl = back[b.key]; if (!pl) return; const sd = pl.face, [nx, nz] = DIR[sd], ry = RY[sd], along = sd === 'N' || sd === 'S';
    const len = along ? bd.x1 - bd.x0 : bd.z1 - bd.z0, cx = (bd.x0 + bd.x1) / 2, cz = (bd.z0 + bd.z1) / 2, wall = sd === 'N' ? bd.z0 : sd === 'S' ? bd.z1 : sd === 'W' ? bd.x0 : bd.x1;
    const at = (a, out) => along ? [a, wall + nz * out] : [wall + nx * out, a], mid = along ? cx : cz, acc = ACC[bi % ACC.length], name = b.label.toUpperCase(), h = bd.h || 7, hasDoor = !pl.none;
    // (2) rooftop billboard, set back 1 m from the road-side edge, on two posts, lit by three lamp heads (s35: not the Bank: its own train sign, worlds/meru2-banksign.js)
    if (b.key !== 'bank') { const bw = Math.min(14, len * 0.72), bh = Math.min(3.6, bw * 0.3), y0 = h + 0.9, [px, pz] = at(mid, -1.0);
      const t = CT(1024, 288, (g, w, H) => { g.fillStyle = '#16141a'; g.fillRect(0, 0, w, H); g.fillStyle = acc; g.fillRect(0, 0, w, 26); g.fillRect(0, H - 26, w, 26); g.fillStyle = '#f3f2f2'; const s = fit(g, name, 150, w - 80); g.textBaseline = 'middle'; g.fillText(name, 40, H / 2 - 6);
        g.font = '800 34px Archivo, Arial'; g.fillStyle = acc; g.fillText(hasDoor ? 'BACK DOOR BELOW · FRONT ON THE PLAZA' : 'ENTRANCE ON THE FOUNTAIN PLAZA', 42, H - 52); });
      plane(t, bw, bh, px + nx * 0.16, y0 + bh / 2 + 0.5, pz + nz * 0.16, ry); put(BOX(along ? bw + 0.3 : 0.2, bh + 0.3, along ? 0.2 : bw + 0.3), dark, px - nx * 0.06, y0 + bh / 2 + 0.5, pz - nz * 0.06);   // s34: face 6 cm off the box (was 2: flickered)
      for (const o of [-bw * 0.35, bw * 0.35]) { const [qx, qz] = at(mid + o, -1.0); put(BOX(0.22, bh + 1.2, 0.22), steel, qx - nx * 0.25, y0 + (bh + 1.2) / 2 - 0.1, qz - nz * 0.25); }
      for (const o of [-bw * 0.33, 0, bw * 0.33]) { const [qx, qz] = at(mid + o, -1.0 + 0.7); put(BOX(0.5, 0.14, 0.5), dark, qx, y0 + bh + 0.85, qz); const lm = put(BOX(0.42, 0.04, 0.42), new THREE.MeshBasicMaterial({ color: 0xfff2cc }), qx, y0 + bh + 0.77, qz); } }
    // (3) s34 (Ben: "layered funny and flickering"): the painted lettering sat 6 cm off a wall full of trims (fins, panels, balconies) and its
    // drop shadow read as a second layer. Now ONE crisp NAME BOARD: dark board with a gold rule, name in white, mounted 0.55 m out on two
    // brackets (clear of every trim), above the back door's own sign or at eye level when there is no door. Opaque, so nothing fights it.
    // walls WITH a back door skip it: the door already carries its sign band + the vertical marquee, and a third name fought them
    if (!hasDoor) { const y0 = 2.2, y1 = Math.min(h - 0.6, y0 + 1.6), pw = Math.min(len * 0.6, 16); if (y1 - y0 > 0.9) { const ph = y1 - y0, OUT = 0.55, [px, pz] = at(mid, OUT);
        const t = CT(1024, Math.max(64, Math.round(1024 * ph / pw)), (g, w, H) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, H); g.fillStyle = '#ffd23a'; g.fillRect(0, H - Math.max(6, H * 0.08), w, Math.max(6, H * 0.08)); g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#f3f2f2'; fit(g, name, Math.round(H * 0.62), w - 64); g.fillText(name, 32, H * 0.47); });
        plane(t, pw, ph, px + nx * 0.07, (y0 + y1) / 2, pz + nz * 0.07, ry); put(BOX(along ? pw + 0.16 : 0.12, ph + 0.16, along ? 0.12 : pw + 0.16), dark, px, (y0 + y1) / 2, pz);
        for (const o of [-pw * 0.38, pw * 0.38]) { const [qx, qz] = at(mid + o, OUT / 2); put(BOX(along ? 0.08 : OUT, 0.08, along ? OUT : 0.08), steel, qx, (y0 + y1) / 2, qz); } } }
    // (4) the front sign on the back: the city already hangs it over a back door; a sign band where there is none
    if (!hasDoor) { const [px, pz] = at(mid, 0.12), t = CT(512, 112, (g, w, H) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, H); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 16, H); g.fillStyle = '#f3f2f2'; fit(g, name, 64, w - 60); g.textBaseline = 'middle'; g.fillText(name, 34, H / 2 + 3); });
      plane(t, 4.4, 0.96, px, Math.min(h - 0.8, 5.3), pz, ry); }
  });
  // (5)(6)(7) wayfinding along the yellow side paths
  const links = (fronts && fronts.links) || [], groups = [];
  for (const k of links) { const end = k.pts[k.pts.length - 1], g = groups.find(q => Math.hypot(q.end[0] - end[0], q.end[1] - end[1]) < 7); if (g) g.list.push(k); else groups.push({ end, list: [k] }); }
  const arrowT = CT(128, 128, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w - 14, 70); g.lineTo(w / 2 + 20, 70); g.lineTo(w / 2 + 20, 118); g.lineTo(w / 2 - 20, 118); g.lineTo(w / 2 - 20, 70); g.lineTo(14, 70); g.closePath(); g.fill(); });
  const arrowM = new THREE.MeshBasicMaterial({ map: arrowT, transparent: true, depthWrite: false, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -4 }), arrowG = new THREE.PlaneGeometry(1.3, 1.3).rotateX(-Math.PI / 2), arrows = [];
  for (const k of links) { const P = k.pts; for (let i = P.length - 1; i > 0; i--) { const [ax, az] = P[i], [bx, bz] = P[i - 1], L2 = Math.hypot(bx - ax, bz - az); if (L2 < 3) continue; const ux = (bx - ax) / L2, uz = (bz - az) / L2;
      for (let s = 3.5; s < L2 - 1.5; s += 7) arrows.push([ax + ux * s, az + uz * s, Math.atan2(ux, uz)]); } }
  if (arrows.length && /[?&]patharrows=1/.test(location.search)) {   // Ben (s33): arrows off the ground const im = new THREE.InstancedMesh(arrowG, arrowM, arrows.length), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1);
    arrows.forEach(([x, z, a], i) => { M4.compose(V.set(x, heightAt(x, z) + 0.085, z), Q.setFromEuler(E.set(0, a + Math.PI, 0)), ONE); im.setMatrixAt(i, M4); }); im.renderOrder = 1; G.add(im); }
  const postM = new THREE.MeshLambertMaterial({ color: 0x2a2826 }), capM = new THREE.MeshLambertMaterial({ color: 0xc9a227 });
  for (const gr of groups) { const [ex, ez] = gr.end, k0 = gr.list[0], P = k0.pts, [qx, qz] = P[P.length - 2], L2 = Math.hypot(qx - ex, qz - ez) || 1, ux = (qx - ex) / L2, uz = (qz - ez) / L2, px = -uz, pz = ux;
    // fingerpost on one side of the side-path mouth, set back off the main road
    const fx = ex + ux * 1.2 + px * 2.2, fz = ez + uz * 1.2 + pz * 2.2, y = heightAt(fx, fz); put(BOX(0.16, 3.2, 0.16), postM, fx, y + 1.6, fz); put(BOX(0.28, 0.12, 0.28), capM, fx, y + 3.26, fz);
    gr.list.slice(0, 4).forEach((k, i) => { const Q = k.pts, [ax, az] = Q[Q.length - 1], [bx, bz] = Q[Q.length - 2], l = Math.hypot(bx - ax, bz - az) || 1, dx = (bx - ax) / l, dz = (bz - az) / l, name = k.label.toUpperCase();
      const armT = flip => CT(512, 112, (g, w, H) => { g.save(); if (flip) { g.translate(w, 0); g.scale(-1, 1); } g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w - 50, 0); g.lineTo(w, H / 2); g.lineTo(w - 50, H); g.lineTo(0, H); g.closePath(); g.fill(); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 14, H); g.restore(); g.fillStyle = '#201e1d'; fit(g, name, 58, w - 110); g.textBaseline = 'middle'; g.fillText(name, flip ? 80 : 30, H / 2 + 3); });
      const ar = Math.atan2(dx, dz) - Math.PI / 2, ax2 = fx + dx * 0.98, az2 = fz + dz * 0.98, ay = y + 2.75 - i * 0.5; plane(armT(false), 1.9, 0.42, ax2 + Math.sin(ar) * 0.01, ay, az2 + Math.cos(ar) * 0.01, ar); plane(armT(true), 1.9, 0.42, ax2 - Math.sin(ar) * 0.01, ay, az2 - Math.cos(ar) * 0.01, ar + Math.PI); });
    // name plaque on the other side of the mouth: a low stone with a slanted face
    gr.list.slice(0, 2).forEach((k, i) => { const qx2 = ex + ux * 1.4 - px * (2.3 + i * 1.3), qz2 = ez + uz * 1.4 - pz * (2.3 + i * 1.3), y2 = heightAt(qx2, qz2), name = k.label.toUpperCase();
      put(BOX(1.2, 0.7, 0.5), new THREE.MeshLambertMaterial({ color: 0x9a8e7c }), qx2, y2 + 0.35, qz2, Math.atan2(px, pz));
      const t = CT(512, 160, (g, w, H) => { g.fillStyle = '#2a2826'; g.fillRect(0, 0, w, H); g.strokeStyle = '#c9a227'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, H - 16); g.fillStyle = '#ffd23a'; fit(g, '→ ' + name, 70, w - 60); g.textBaseline = 'middle'; g.fillText('→ ' + name, 30, H / 2 + 4); });
      const m = plane(t, 1.1, 0.34, qx2 - ux * 0.27, y2 + 0.78, qz2 - uz * 0.27, Math.atan2(-ux, -uz)); m.rotateX(-0.6); }); }
  // (8) the TOWN MAP board at the fountain (two-sided), drawn from the live layout
  { const S = 1.5, t = CT(1024, 768, (g, w, H) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, H); const k = 2.6, X = x => w / 2 + x * k, Z = z => H / 2 + 20 + z * k;
      g.strokeStyle = '#9a9690'; g.lineWidth = 12 * k / 2.6 * 0.6; g.strokeRect(X(-160), Z(-140), 320 * k, 290 * k);
      g.strokeStyle = '#ffd23a'; g.lineWidth = 8; g.beginPath(); g.moveTo(X(-180), Z(0)); g.lineTo(X(180), Z(0)); g.moveTo(X(0), Z(-170)); g.lineTo(X(0), Z(170)); g.stroke();
      g.lineWidth = 4; for (const k2 of links) { g.beginPath(); k2.pts.forEach(([x, z], i) => i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.stroke(); }
      for (const bd of BL) { g.fillStyle = '#201e1d'; g.fillRect(X(bd.x0), Z(bd.z0), (bd.x1 - bd.x0) * k, (bd.z1 - bd.z0) * k); }
      g.fillStyle = '#7fb3d5'; g.beginPath(); g.arc(X(0), Z(0), 8 * k / 2.6 * 2.6, 0, 7); g.fill();
      g.textBaseline = 'middle'; for (const bd of BL) { const nm = bd.b.label.toUpperCase(); g.font = '800 15px Archivo, Arial'; const tw = g.measureText(nm).width, cx = X((bd.x0 + bd.x1) / 2), cz = Z((bd.z0 + bd.z1) / 2); g.fillStyle = '#f3f2f2'; g.fillText(nm, cx - tw / 2, cz); }
      g.fillStyle = '#ec3013'; g.beginPath(); g.arc(X(11), Z(11), 9, 0, 7); g.fill(); g.font = '900 18px Archivo, Arial'; g.fillText('YOU ARE HERE', X(11) + 14, Z(11));
      g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, 44); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 14, 44); g.fillStyle = '#f3f2f2'; g.font = '900 28px Archivo, Arial'; g.fillText('MERU · TOWN MAP · FOLLOW THE YELLOW BRICKS', 28, 23);
      g.font = '800 18px Archivo, Arial'; g.fillStyle = '#201e1d'; g.fillText('↑ CASTLE', X(0) + 8, Z(-150)); g.fillText('LAKE ↓', X(0) + 8, Z(150)); g.fillText('← RUINS', X(-158), Z(0) - 14); g.fillText('ARENA →', X(118), Z(0) - 14); });
    const x = 11.2, z = 11.2, ry = Math.atan2(-x, -z) + Math.PI, y = heightAt(x, z), bw = 3.6 * S / 1.5, bh = 2.7 * S / 1.5;
    plane(t, bw, bh, x + Math.sin(ry) * 0.05, y + 1.0 + bh / 2, z + Math.cos(ry) * 0.05, ry); plane(t, bw, bh, x - Math.sin(ry) * 0.1, y + 1.0 + bh / 2, z - Math.cos(ry) * 0.1, ry + Math.PI); put(BOX(bw + 0.2, bh + 0.2, 0.08), dark, x - Math.sin(ry) * 0.025, y + 1.0 + bh / 2, z - Math.cos(ry) * 0.025, ry);
    for (const o of [-1, 1]) put(BOX(0.14, 1.2 + bh, 0.14), postM, x + Math.cos(ry) * o * (bw / 2 - 0.1), y + (1.2 + bh) / 2, z - Math.sin(ry) * o * (bw / 2 - 0.1)); }
  return { group: G };
}
