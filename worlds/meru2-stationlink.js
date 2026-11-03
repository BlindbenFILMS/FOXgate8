import { floraRemove } from './meru2-flora.js';
// MERU 2.0 — s35 TRAIN STATIONS after the Town Layout move. A moved station whose street lift (worlds/meru2-train.js, lift at the platform
// point nearest the building) is still more than 5 m from any of its doors gets a SIDE DOOR on the wall facing the lift + a COVERED WALK:
// stone strip with ink edging, red canopy on ink posts, a name board at the lift end (station name) and a TRAINS board over the door.
// Today: Lake Station (east wall → its lift at the west end of the platform). Town Square Station needs none: its south door opens on the lift.
export function buildStationLinks({ THREE, scene, L, T, cols, nature, touch }) {
  const G = new THREE.Group(); G.name = 'meru2StationLinks'; scene.add(G); const out = [];
  const mats = {}, M = c => mats[c] || (mats[c] = new THREE.MeshToonMaterial({ color: c }));
  const box = (w, h, d, c, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); m.rotation.y = ry; if (!touch) m.receiveShadow = true; G.add(m); return m; };
  const board = (txt, w, h, x, y, z, ry) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w); const g = cv.getContext('2d');
    g.fillStyle = '#ec3013'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 14, cv.height); g.fillStyle = '#ffffff'; let s = cv.height * 0.56; g.font = '900 ' + s + 'px Archivo, sans-serif';
    while (g.measureText(txt).width > cv.width - 50 && s > 12) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.textBaseline = 'middle'; g.fillText(txt, 30, cv.height / 2 + 2);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xe8e8e8 });
    for (const f of [0, Math.PI]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.position.set(x, y, z); p.rotation.y = ry + f; p.translateZ(0.07); G.add(p); } box(w + 0.1, h + 0.1, 0.1, '#201e1d', x, y, z, ry); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  for (const st of T.stops) { const b = st.b; if (!b || !b.orig || !b.f) continue;   // unmoved stations: their side door opens on the lift (BACK_DOORS)
    const foot = T.toW(st.key, st.liftA, 12.8), doors = [b.door, b.door2].filter(Boolean);
    if (doors.some(d => Math.hypot(d[0] - foot.x, d[1] - foot.z) < 5)) { out.push({ key: st.key, link: false }); continue; }
    const [x0, x1, z0, z1] = b.f, cx = clamp(foot.x, x0 + 3, x1 - 3), cz = clamp(foot.z, z0 + 3, z1 - 3);
    const walls = [['W', x0, cz], ['E', x1, cz], ['N', cx, z0], ['S', cx, z1]].map(([s, x, z]) => ({ s, x, z, d: Math.hypot(foot.x - x, foot.z - z) })).sort((p, q) => p.d - q.d);
    const shell = !!b.fixedBack && !!b.door2, w = shell ? { s: b.face2, x: b.door2[0], z: b.door2[1] } : walls[0], [nx, nz] = F[w.s], ax = w.x + nx * 0.3, az = w.z + nz * 0.3, dx = foot.x - ax, dz = foot.z - az, len = Math.hypot(dx, dz), ux = dx / len, uz = dz / len, ry = Math.atan2(ux, uz), mx = (ax + foot.x) / 2, mz = (az + foot.z) / 2;
    if (!shell) { b.door2 = [w.x, w.z]; b.face2 = w.s; }   // the side door (taxi / map / back-door planner read it)
    // the walk: stone strip + ink edging, posts every ~4 m, red canopy (white soffit)
    box(3.2, 0.05, len, '#cfc9c0', mx, 0.03, mz, ry); for (const sd of [-1.68, 1.68]) box(0.16, 0.07, len, '#201e1d', mx + uz * sd, 0.035, mz - ux * sd, ry);
    const n = Math.max(1, Math.round(len / 4)); for (let i = 0; i <= n; i++) { const t = 0.4 + (len - 0.8) * i / n, px = ax + ux * t, pz = az + uz * t;
      for (const sd of [-1.75, 1.75]) { const qx = px + uz * sd, qz = pz - ux * sd; box(0.16, 4.6, 0.16, '#201e1d', qx, 2.3, qz, ry); cols.push({ c: [qx, qz, 0.18], y1: 4.5 }); } }
    box(4.0, 0.22, len + 0.6, '#ec3013', mx, 4.72, mz, ry); box(3.8, 0.04, len + 0.4, '#f3f2f2', mx, 4.59, mz, ry);
    // the side door on the wall: gold frame + glass, the same look as the front door
    if (!shell) { const dy = Math.atan2(nx, nz), g = new THREE.Group(); g.position.set(w.x + nx * 0.15, 0, w.z + nz * 0.15); g.rotation.y = dy; G.add(g);
      for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.6, 0.36), M('#ffc64a')); p.position.set(sx * 1.7, 1.8, 0); g.add(p); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.36, 0.36), M('#ffc64a')); top.position.y = 3.5; g.add(top);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.3), new THREE.MeshBasicMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0.4, depthWrite: false })); gl.position.set(0, 1.65, 0.05); g.add(gl); }
    // boards: TRAINS over the door end, the station name at the lift end (both read from either side)
    board('TRAINS \u00b7 LIFT', 3.0, 0.6, ax + ux * 1.2, 4.15, az + uz * 1.2, ry);
    board(b.label.toUpperCase(), 3.4, 0.6, foot.x - ux * 1.2, 4.15, foot.z - uz * 1.2, ry);
    // clear the lawn under it (trees, shrubs, grass)
    const segD = (x, z) => { const t = clamp((x - ax) * ux + (z - az) * uz, 0, len); return Math.hypot(x - ax - ux * t, z - az - uz * t); };
    floraRemove((x, z) => segD(x, z) < 2.6); if (nature && nature.clearGrass) nature.clearGrass((x, z) => segD(x, z) < 1.8);
    out.push({ key: st.key, link: true, door: [w.x, w.z], face: w.s, foot: [foot.x, foot.z], len }); }
  return { G, out };
}
