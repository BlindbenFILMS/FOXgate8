import { floraRemove } from './meru2-flora.js';
// MERU 2.0 — the TOWN LAYOUT move (Ben, Town Layout Workshop, s33): every moved building's INSIDE goes with its shell.
// worlds/meru2-layout.js moves the shells (BUILDINGS f / door / face, b.orig keeps the old ones, MOVES lists the transforms).
// This file moves everything the interior builders made: scene objects added while they ran are re-parented into one group per
// moved building (local coordinates = the OLD world coordinates, so their own logic keeps working), colliders + spots are moved,
// and their per-frame logic gets the player / camera in that old frame (RL.frame). Rotations are whole quarter turns.
export function makeRelocator({ THREE, scene, L }) {
  const MV = L.MOVES || [], H = Math.PI / 2;
  const rot = (q, dx, dz) => { for (let i = 0; i < q; i++) { const t = dx; dx = -dz; dz = t; } return [dx, dz]; };
  const fwd = (m, x, z) => { const [a, b] = rot(m.q, x - m.o[0], z - m.o[1]); return [m.n[0] + a, m.n[1] + b]; };
  const inv = (m, x, z) => { const [a, b] = rot((4 - m.q) % 4, x - m.n[0], z - m.n[1]); return [m.o[0] + a, m.o[1] + b]; };
  const inR = (r, x, z) => x > r[0] && x < r[1] && z > r[2] && z < r[3];
  for (const m of MV) { const G = new THREE.Group(); G.name = 'moved:' + m.key; G.rotation.y = -m.q * H; const [rx, rz] = rot(m.q, m.o[0], m.o[1]); G.position.set(m.n[0] - rx, 0, m.n[1] - rz); G.userData.relYaw = -m.q * H; scene.add(G); m.G = G;
    const [x0, x1, z0, z1] = m.fo, d = 8; m.old = [x0 - 1 - (m.face0 === 'W' ? d : 0), x1 + 1 + (m.face0 === 'E' ? d : 0), z0 - 1 - (m.face0 === 'N' ? d : 0), z1 + 1 + (m.face0 === 'S' ? d : 0)];
    m.oldIn = [x0 + 0.2, x1 - 0.2, z0 + 0.2, z1 - 0.2]; const [a0, a1, b0, b1] = m.fn; m.nw = [a0 - 6, a1 + 6, b0 - 6, b1 + 6]; m.nin = [a0, a1, b0, b1]; m.inset = [a0 + 0.5, a1 - 0.5, b0 + 0.5, b1 - 0.5]; }
  const groups = new Set(MV.map(m => m.G));
  const byOld = (x, z) => MV.find(m => inR(m.old, x, z));
  // ---------- re-parent everything a builder made ----------
  let snap = null; const box3 = new THREE.Box3(), v = new THREE.Vector3(), M4 = new THREE.Matrix4();
  const fullIn = (bb, m) => bb.min.x >= m.old[0] && bb.max.x <= m.old[1] && bb.min.z >= m.old[2] && bb.max.z <= m.old[3];
  function place(o, depth = 0) {
    if (o.userData && o.userData.keepWhole) return;   // s93: moving vehicles (lake speedboats, ferry) stay in one piece
    if (o.isInstancedMesh) { let sx = 0, sz = 0, n = o.count || 0, mm = null, ok = true; for (let i = 0; i < n; i++) { o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); const m = byOld(v.x, v.z); if (i === 0) mm = m; if (m !== mm || !m) { ok = false; break; } } if (ok && mm) mm.G.add(o); return; }
    o.updateWorldMatrix(true, true); box3.setFromObject(o); if (box3.isEmpty()) { o.getWorldPosition(v); const m = byOld(v.x, v.z); if (m) m.G.add(o); return; }
    const m = MV.find(q => fullIn(box3, q)); if (m) { m.G.add(o); return; }
    if (o.children.length && depth < 4) { o.updateWorldMatrix(true, false); const pm = o.matrixWorld.clone(); for (const c of [...o.children]) { c.updateWorldMatrix(true, true); box3.setFromObject(c); let hit = !box3.isEmpty() && MV.find(q => fullIn(box3, q));
        if (c.isInstancedMesh) { const k = MV.length; place0(c, pm); continue; }
        if (hit) { c.applyMatrix4(pm); hit.G.add(c); } else if (c.children.length) { c.applyMatrix4(pm); scene.add(c); place(c, depth + 1); } } } }
  function place0(c, pm) { let mm = null; for (let i = 0; i < (c.count || 0); i++) { c.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(c.matrixWorld); const m = byOld(v.x, v.z); if (i === 0) mm = m; if (m !== mm) return; } if (mm) { c.applyMatrix4(pm); mm.G.add(c); } }
  const moved = new Set();
  const api = {
    MV, fwd, inv,
    mark() { snap = new Set(scene.children); },
    collect() { if (!snap || !MV.length) return; for (const c of [...scene.children]) if (!snap.has(c) && !groups.has(c) && !c.isCamera && !c.isLight) place(c); snap = null; },
    cols(cols, i0) { for (let i = i0; i < cols.length; i++) { const c = cols[i]; if (c.f) { const m = MV.find(q => c.f[0] >= q.old[0] - 0.01 && c.f[1] <= q.old[1] + 0.01 && c.f[2] >= q.old[2] - 0.01 && c.f[3] <= q.old[3] + 0.01); if (!m) continue;
          const [ax, az] = fwd(m, c.f[0], c.f[2]), [bx, bz] = fwd(m, c.f[1], c.f[3]); c.f = [Math.min(ax, bx), Math.max(ax, bx), Math.min(az, bz), Math.max(az, bz)]; moved.add(c); }
        else if (c.c) { const m = byOld(c.c[0], c.c[1]); if (!m) continue; const [x, z] = fwd(m, c.c[0], c.c[1]); c.c = [x, z, c.c[2]]; moved.add(c); } } },
    // a spot inside a moved building: x / z read in the new place, use(P) runs in the old frame
    spot(s) { if (!s || s.x == null) return s; const m = byOld(s.x, s.z); if (!m) return s; const PL = api.P(m);
      return new Proxy(s, { get(t, k) { if (k === 'x') return fwd(m, t.x, t.z)[0]; if (k === 'z') return fwd(m, t.x, t.z)[1]; if (k === 'use' && typeof t.use === 'function') return P => api.within(m, () => t.use(PL)); return Reflect.get(t, k); } }); },
    _P: new Map(),
    P(m) { if (this._P.has(m)) return this._P.get(m); const ref = { P: null };
      const px = new Proxy({}, { get(_, k) { const t = ref.P; if (k === 'x') return inv(m, t.x, t.z)[0]; if (k === 'z') return inv(m, t.x, t.z)[1]; if (k === 'yaw') return t.yaw + m.q * H; const r = t[k]; return r; },
        set(_, k, val) { const t = ref.P; if (k === 'x' || k === 'z') { const [lx, lz] = inv(m, t.x, t.z), [wx, wz] = fwd(m, k === 'x' ? val : lx, k === 'z' ? val : lz); t.x = wx; t.z = wz; return true; } if (k === 'yaw') { t.yaw = val - m.q * H; return true; } t[k] = val; return true; },
        has(_, k) { return k in ref.P; } });
      const out = { px, ref }; this._P.set(m, out); return out; },
    _far: null,
    frame(P) { const m = MV.find(q => inR(q.nw, P.x, P.z)), cv = new THREE.Vector3();
      if (m) { const p = api.P(m); p.ref.P = P; return { m, P: p.px, cam: c => { const [x, z] = inv(m, c.x, c.z); return cv.set(x, c.y, z); } }; }
      if (MV.some(q => inR(q.old, P.x, P.z))) { if (!api._far) api._far = new Proxy({}, { get(_, k) { if (k === 'x' || k === 'z') return 1e5; return api._farP ? api._farP[k] : undefined; }, set(_, k, val) { if (k !== 'x' && k !== 'z' && api._farP) api._farP[k] = val; return true; } });
        api._farP = P; return { m: null, P: api._far, cam: () => cv.set(1e5, 50, 1e5) }; }
      return { m: null, P, cam: c => c }; },
    // run fn with scene.add / scene.remove going into building m's group (darts, pops, notes made at run time)
    within(m, fn) { if (!m) return fn(); const sa = scene.add, sr = scene.remove, tl = scene.userData.toLocal;
      scene.add = function (...o) { m.G.add(...o); return scene; }; scene.remove = function (...o) { for (const x of o) { if (x && x.parent === m.G) m.G.remove(x); else sr.call(scene, x); } return scene; };
      scene.userData.toLocal = p => { m.G.updateMatrixWorld(true); return m.G.worldToLocal(p); };
      try { return fn(); } finally { scene.add = sa; scene.remove = sr; scene.userData.toLocal = tl; } },
    camWrap(m, camera, fn) { if (!m) return fn(); m.G.updateMatrixWorld(true); const W = m.G.matrixWorld, I = W.clone().invert(); camera.applyMatrix4(I); camera.updateMatrixWorld(); try { fn(); } finally { camera.applyMatrix4(W); camera.updateMatrixWorld(); } },
    ground(f) { return (x, z, y) => { const m = MV.find(q => inR(q.nin, x, z)); if (m) { const [lx, lz] = inv(m, x, z); return f(lx, lz, y); } if (MV.some(q => inR(q.oldIn, x, z))) return null; return f(x, z, y); }; },
    fwdAny(x, z, yaw = 0) { const m = MV.find(q => inR(q.old, x, z)); if (!m) return [x, z, yaw]; const [a, b] = fwd(m, x, z); return [a, b, yaw - m.q * H]; },
    wpos: (() => { const w = new WeakMap(); return o => { let p = w.get(o); if (!p) { p = new THREE.Vector3(); w.set(o, p); } return o.getWorldPosition(p); }; })(),
    pyaw(o) { let y = 0, p = o.parent; while (p) { y += p.rotation ? p.rotation.y : 0; p = p.parent; } return y; },
    // clear outdoor things (trees, benches, lamps, tufts…) that now stand inside a moved building
    clear(cols) { if (!MV.length) return 0; let n = 0; const ins = (x, z) => MV.some(q => inR(q.inset, x, z));
      for (let i = cols.length - 1; i >= 0; i--) { const c = cols[i]; if (moved.has(c)) continue; if (c.c ? ins(c.c[0], c.c[1]) : c.f && ins((c.f[0] + c.f[1]) / 2, (c.f[2] + c.f[3]) / 2) && (c.f[1] - c.f[0]) < 12 && (c.f[3] - c.f[2]) < 12 && MV.some(q => c.f[0] > q.inset[0] && c.f[1] < q.inset[1] && c.f[2] > q.inset[2] && c.f[3] < q.inset[3])) { cols.splice(i, 1); n++; } }
      n += floraRemove(ins);
      const Z = new THREE.Matrix4().makeScale(0, 0, 0);
      scene.traverse(o => { if (!o.isInstancedMesh) return; let p = o; while (p) { if (groups.has(p)) return; p = p.parent; } /* s35: lamp poles inside a moved building go too */ o.updateWorldMatrix(true, false); let hit = false;
        for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); if (ins(v.x, v.z)) { o.setMatrixAt(i, Z); hit = true; n++; } } if (hit) o.instanceMatrix.needsUpdate = true; });
      return n; },
  };
  return api;
}
