// layout-level clash checks (footprints, towers, roads, lake, train). Run in the page.
export function layoutClash(bases) {
  const L = window.__meru2.K.L, out = [], line = [...L.TRAIN.line, L.TRAIN.line[0]];
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };
  const rectD = (r, p) => { let d = 1e9; for (let x = r[0]; x <= r[1]; x += 1) for (const z of [r[2], r[3]]) d = Math.min(d, segD(x, z, p)); for (let z = r[2]; z <= r[3]; z += 1) for (const x of [r[0], r[1]]) d = Math.min(d, segD(x, z, p)); const cx = (r[0] + r[1]) / 2, cz = (r[2] + r[3]) / 2; if (segD(cx, cz, p) < Math.min(r[1] - r[0], r[3] - r[2]) / 2) d = 0; return d; };
  const B = L.BUILDINGS.filter(b => b.f).map(b => ({ k: b.key, r: b.f, open: b.open })), T = bases.map((t, i) => ({ k: 'tower' + i + '@' + t.x + ',' + t.z, r: [t.x - t.w / 2, t.x + t.w / 2, t.z - t.d / 2, t.z + t.d / 2], h: t.h }));
  const ov = (a, b) => Math.min(a[1], b[1]) - Math.max(a[0], b[0]) > 0.2 && Math.min(a[3], b[3]) - Math.max(a[2], b[2]) > 0.2;
  const all = B.concat(T); for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (ov(all[i].r, all[j].r)) out.push('OVERLAP ' + all[i].k + ' x ' + all[j].k);
  for (const a of all) for (const R of L.ROADS) { const d = rectD(a.r, R.p); if (d < R.w / 2 + 0.5) out.push('ROAD ' + a.k + ' d=' + d.toFixed(1) + ' w=' + R.w + ' road@' + JSON.stringify(R.p[0])); }
  for (const a of all) { let wet = 0, n = 0; for (let x = a.r[0]; x <= a.r[1]; x += 2) for (let z = a.r[2]; z <= a.r[3]; z += 2) { n++; if (L.inLake(x, z)) wet++; } if (wet) out.push('LAKE ' + a.k + ' ' + wet + '/' + n); }
  for (const a of T) { const d = rectD(a.r, line); if (d < 4) out.push('TRAIN ' + a.k + ' d=' + d.toFixed(1)); }
  for (const a of B) { const d = rectD(a.r, line); if (d < 3.5) out.push('TRAIN-B ' + a.k + ' d=' + d.toFixed(1)); }
  for (const P of L.PATHS) for (const a of T) { const d = rectD(a.r, P.p); if (d < 3) out.push('PATH ' + P.key + ' x ' + a.k); }
  out.forEach(s => console.log('LC ' + s)); console.log('LC done ' + out.length); return out;
}
