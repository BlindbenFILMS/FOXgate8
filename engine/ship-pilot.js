// s571 PILOT FOX IN THE COCKPIT (Ben: "show the fox sitting in the cockpit of the scout on close-ups; and on the other ships in flight").
// shipPilot({ THREE, grad }) → { attach(inst, type) → Promise<handle | null> }. inst = space-installs build() result (group + api).
// handle.show(on): the seated cast player fox (engine/cast.js) + a dark cockpit well behind the glass; the hull glass (api.glass) turns
// see-through while shown, back to its old solid tint when hidden (the far map view keeps the old look and costs nothing).
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs } from './cast.js';
import { crestTex } from './textures.js';
import { rr, pick, clamp, smooth, damp } from '../village-game.js';
// walk-ins: interior metres (x = port seat, c = seat cushion height), S = interior metres per hull unit, u = spot along the nose (0 = nose root, 1 = tip)
const FACE = 0;   // the cast fox's face looks down -z at rotation 0 = the ships' nose
const SEATS = { hullShuttle: { x: -1.1, c: 1.4, S: 4.2, u: 0.5, k: 1.35 }, hullCorvette: { x: -1.8, c: 1.6, S: 7.2, u: 0.5, k: 1.5 }, hullGunship: { x: -1.8, c: 1.6, S: 7.9, u: 0.5, k: 1.5 }, hullFlagWalk: { x: 0, c: 3.1, S: 9.5, z: -3.15, k: 1.4 } };   // c = cushion height, raised so the fox reads through the band (flight view only; the interior keeps its own seats)
export function shipPilot({ THREE, grad }) {
  const cache = new Map(), toon = (c, ex) => { const k = c + (ex ? JSON.stringify(ex) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...ex })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0a0d14, side: THREE.BackSide });
  const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) { if (!geo.boundingSphere) geo.computeBoundingSphere(); const r = radius || geo.boundingSphere.radius || 1, o = new THREE.Mesh(geo, outlineMat); o.scale.setScalar(1 + outline / r); m.add(o); } if (parent) parent.add(m); return m; };
  let kitP = null;
  const kit = () => kitP || (kitP = (async () => { const fk = foxKit({ THREE, scene: new THREE.Group(), toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }); return castKit({ THREE, M, toon, makeFox: fk.makeFox }, await loadCastRigs()); })());
  // a seated fox, feet forward (+z), arms out to the controls; returned inside a holder whose origin = the seat cushion, height h (or scale s)
  async function seated(o) { const cast = await kit(), f = cast.make('player'), P = f.userData.P || {};
    (P.legs || []).forEach(l => { l.rotation.x = -1.45; }); (P.arms || []).forEach(a => { a.rotation.x = -0.75; a.rotation.z = 0; });
    if (P.tail) P.tail.rotation.x = 0.9;
    const H = new THREE.Group(); H.add(f); f.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(f), hh = Math.max(0.01, bb.max.y - bb.min.y);
    const k = o.h ? o.h / hh : o.s; f.scale.multiplyScalar(k); f.position.y = -bb.min.y * k; H.userData.fox = f; return H; }
  const dark = () => new THREE.MeshBasicMaterial({ color: '#141821', side: THREE.BackSide });
  // the cockpit well for the walk-ins: the nose's own core section, shrunk 4 % and drawn from the inside, + a bulkhead at the nose root + a console
  function well(api, seat, S) { const pit = api.dims.pit; if (pit) return pitWell(api, seat, S, pit);
    const g = new THREE.Group(), NR = 10, R0 = api.ring(0), n = R0.pts.length, pos = [], ind = [];
    for (let k = 0; k <= NR; k++) { const R2 = api.ring(k / NR), cy = (R2.p.yb + R2.p.yt) / 2; for (let j = 0; j <= n; j++) { const [x, y] = R2.pts[j % n]; pos.push(x * 0.96, cy + (y - cy) * 0.96, R2.p.z); } }
    for (let k = 0; k < NR; k++) for (let j = 0; j < n; j++) { const a = k * (n + 1) + j, b = a + n + 1; ind.push(a, a + 1, b, a + 1, b + 1, b); }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(ind); gg.computeVertexNormals();
    const shell = new THREE.Mesh(gg, new THREE.MeshBasicMaterial({ color: '#141821', side: THREE.FrontSide })); g.add(shell);   // (this winding faces inward)
    const sh = new THREE.Shape(); R0.pts.forEach(([x, y], i) => i ? sh.lineTo(x * 0.96, y) : sh.moveTo(x * 0.96, y)); const cap = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: '#0e1118', side: THREE.DoubleSide })); cap.position.z = R0.p.z - 0.005; g.add(cap);
    furnish(g, api, seat, S); return g; }
  // the flagship: a dark box under its canopy sheet (api.dims.pit) + the console + the captain's chair
  function pitWell(api, seat, S, b) { const g = new THREE.Group(), box = new THREE.Mesh(new THREE.BoxGeometry(b.w * 2, b.y1 - b.y0, b.z1 - b.z0), new THREE.MeshBasicMaterial({ color: '#141821', side: THREE.BackSide }));
    box.position.set(0, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2); g.add(box); furnish(g, api, seat, S); return g; }
  function furnish(g, api, seat, S) { const Y0 = (api.dims.Y0 ?? 0.45) + (seat.c - 0.8) / S, z = seat.z, cx = seat.x * 0.5 / S;
    const con = new THREE.Mesh(new THREE.BoxGeometry(3.2 / S, 1.0 / S, 0.9 / S), toon('#3b4150')); con.position.set(cx, Y0 + 0.5 / S, z - 1.4 / S); g.add(con);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(3.2 / S, 0.06 / S, 0.06 / S), new THREE.MeshBasicMaterial({ color: '#7fd0d8', toneMapped: false })); strip.position.set(cx, Y0 + 0.98 / S, z - 0.94 / S); g.add(strip);
    for (const [dx, c] of [[-0.8, '#5dffa0'], [0.8, '#7fd0ff']]) { const s2 = new THREE.Mesh(new THREE.PlaneGeometry(1.1 / S, 0.5 / S), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); s2.position.set(cx + dx / S, Y0 + 1.25 / S, z - 1.4 / S + 0.46 / S); s2.rotation.x = -0.5; g.add(s2); }
    const chair = (x) => { const c = toon('#ec3013'); const a = new THREE.Mesh(new THREE.BoxGeometry(1.0 / S, 0.26 / S, 1.0 / S), c); a.position.set(x, Y0 + 0.67 / S, z); g.add(a); const b = new THREE.Mesh(new THREE.BoxGeometry(1.0 / S, 1.3 / S, 0.22 / S), c); b.position.set(x, Y0 + 1.4 / S, z + 0.55 / S); g.add(b); };
    chair(seat.x / S); if (seat.x) chair(-seat.x / S); }
  async function attach(inst, type) { const api = inst && inst.api; if (!api) return null; const root = inst.group.children[0];
    let H, W = null, par = root;
    if (type === 'ship') { if (!api.pilot) return null; H = await seated({ h: api.pilot.h }); H.position.set(api.pilot.x, api.pilot.y, api.pilot.z); H.rotation.y = FACE; }
    else { const s = SEATS[type]; if (!s || !api.ring || !api.dims) return null; const body = root.children.find(c => c.isGroup && Math.abs(c.position.y + 0.12) < 0.05) || root; par = body;
      const Y0 = api.dims.Y0 ?? 0.45, z = s.z ?? api.prof(s.u).z, seat = { x: s.x, c: s.c, z };
      W = well(api, seat, s.S); body.add(W);
      H = await seated({ s: (s.k || 1) / s.S });   /* k: a little bigger than life so the pilot reads through the glass */ H.position.set(s.x / s.S, Y0 + s.c / s.S, z); H.rotation.y = FACE; }
    par.add(H); let G = api.glass; if (!G) inst.group.traverse(o => { if (!G && o.name === 'bandGlass' && o.userData.glow) G = o.userData.glow.material; }); const op0 = G ? G.opacity : 1;
    const h = { fox: H, well: W, on: true, show(on) { on = !!on; if (on === h.on) return; h.on = on; H.visible = on; if (W) W.visible = on; if (G) { G.opacity = on ? (type === 'ship' ? 0.3 : 0.32) : op0; G.depthWrite = !on; } },
      dispose() { H.removeFromParent(); if (W) W.removeFromParent(); if (G) { G.opacity = op0; G.depthWrite = true; } } };
    h.on = false; h.show(true); return h; }
  return { attach };
}
