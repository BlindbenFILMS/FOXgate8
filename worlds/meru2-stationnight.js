import { makeNightLit } from './meru2-nightlit.js';
// MERU 2.0 — s35 STATIONS AT NIGHT (Ben). With worlds/meru2-nightlit.js: warm pools along every platform under the canopy lights, a light
// column inside each glass LIFT shaft + a pool at its foot and on the platform landing, the TICKET MACHINE + METRO totem glow, pools at
// every station door (front + side) and along the covered walks (worlds/meru2-stationlink.js) and under the Bank's sidewalk canopy.
// The station shells' windows already light up (meru2-city.js night windows).
export function buildStationNight({ THREE, scene, L, T, links = [] }) {
  const NL = makeNightLit(THREE), PY = T.PLAT_Y, F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, G = new THREE.Group(); G.name = 'stationNight'; scene.add(G);
  for (const st of T.stops) { const W = (a, ls) => T.toW(st.key, a, ls), la = st.liftA;
    for (let a = -46; a <= 46; a += 8) { const w = W(a, 4.9); NL.pool(w.x, PY + 0.03, w.z, 3.2, '#fff1c8', 0.42); }
    { const w = W(la, 9.4); NL.beam([w.x, 12.0, w.z], [w.x, 0.08, w.z], 1.2, '#ffe2a8', 0.2, false); NL.pool(w.x, 0.05, w.z, 3.0, '#ffe2a8', 0.55); const p = W(la, 7.0); NL.pool(p.x, PY + 0.04, p.z, 2.6, '#ffe2a8', 0.5); }
    { const m = W(la + 3.3, 10.6); NL.pool(m.x, 0.05, m.z, 1.8, '#ff9a7a', 0.45); }
    const b = st.b; if (b) for (const [d, fc] of [[b.door, b.face], [b.door2, b.face2]]) { if (!d || !fc) continue; const [nx, nz] = F[fc]; NL.pool(d[0] + nx * 2.2, 0.05, d[1] + nz * 2.2, 3.4, '#ffd9a0', 0.5); } }
  for (const k of links) { if (!k.link || !k.door || !k.foot) continue; const n = Math.max(2, Math.round(k.len / 4)); for (let i = 0; i <= n; i++) { const t = i / n; NL.pool(k.door[0] + (k.foot[0] - k.door[0]) * t, 0.06, k.door[1] + (k.foot[1] - k.door[1]) * t, 2.4, '#ffd9a0', 0.42); } }
  { const bk = L.BUILDINGS.find(q => q.key === 'bank'); if (bk && bk.door2 && bk.face2) { const [nx, nz] = F[bk.face2]; NL.pool(bk.door2[0] + nx * 1.4, 0.05, bk.door2[1] + nz * 1.4, 3.8, '#ffd9a0', 0.55); NL.beam([bk.door2[0] + nx * 1.2, 5.0, bk.door2[1] + nz * 1.2], [bk.door2[0] + nx * 1.5, 0.05, bk.door2[1] + nz * 1.5], 1.5, '#fff1c8', 0.18, false); } }
  NL.done(G);
  return { tick: (dt, night) => NL.tick(dt, night), n: NL.n };
}
