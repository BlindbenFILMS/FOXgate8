// MERU 2.0 — s728d INTERIOR AUDIT (merged-aware). Open the game with ?audit=1: once the walk is in, every walk-in shell (L.BUILDINGS with f + room)
// gets a DETAIL score per 100 m²: instanced props count one per instance, small meshes count 1, MERGED meshes (room-kit bins, one mesh for many parts)
// count triangles / 16. Processed in slices across frames (no hitch). Panel: inverted Modernist, emptiest first, COPY puts the list on the clipboard.
export function runAudit({ THREE, scene, L }) {   // s728g also counts cluster rooms (window.__m2clusters)
  const B = L.BUILDINGS.filter(b => b.f && b.room && !b.open).map(b => ({ key: b.key, label: b.label, f: b.f, y0: -0.5, y1: 9 }));
  // s728g + the CLUSTER rooms (Town 2 lobbies + their upstairs / extra rooms, built off-map in the lobby row): ox ± RW/2, LZ ± RD/2, LY .. LY + rh
  const CL = window.__m2clusters; if (CL && CL.rooms && CL.geo) { const { LY, LZ, RW, RD } = CL.geo; CL.rooms.forEach(r => { if (!r || !r.c) return; B.push({ key: 'cl:' + (r.c.key || r.i), label: (r.c.title || r.c.label || r.c.key || ('ROOM ' + r.i)) + ' · CLUSTER', f: [r.ox - RW / 2, r.ox + RW / 2, LZ - RD / 2, LZ + RD / 2], y0: LY - 0.5, y1: LY + (r.rh || 6) + 1 }); }); }
  const R = new Map(B.map(b => [b.key, { b, small: 0, inst: 0, merged: 0, a: (b.f[1] - b.f[0]) * (b.f[3] - b.f[2]) }]));
  const hit = (x, y, z) => { for (const b of B) { const f = b.f; if (y > b.y0 && y < b.y1 && x > f[0] && x < f[1] && z > f[2] && z < f[3]) return R.get(b.key); } return null; };
  const list = []; scene.updateMatrixWorld(true); scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position) list.push(o); });
  const v = new THREE.Vector3(), mm = new THREE.Matrix4(); let i = 0;
  const panel = document.createElement('div'); panel.style.cssText = 'position:fixed;right:12px;top:12px;z-index:99999;width:min(360px,92vw);max-height:80vh;overflow:auto;background:#201e1d;color:#f3f2f2;border:2px solid #f3f2f2;font-family:Archivo,sans-serif;padding:12px';
  panel.innerHTML = '<div style="font-weight:900;font-size:16px">INTERIOR AUDIT</div><div id="__audS" style="font-size:13px;margin-top:6px">counting…</div>'; document.body.appendChild(panel);
  const step = () => { const t0 = performance.now(); while (i < list.length && performance.now() - t0 < 8) { const o = list[i++], g = o.geometry, tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
      if (o.isInstancedMesh) { for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, mm); v.setFromMatrixPosition(mm).applyMatrix4(o.matrixWorld); const r = hit(v.x, v.y, v.z); if (r) r.inst++; } continue; }
      if (!g.boundingSphere) g.computeBoundingSphere();
      if (tris > 200 && g.boundingSphere.radius > 6) { const pa = g.attributes.position, ix = g.index, n = ix ? ix.count : pa.count, acc = new Map();   // s728h big merged meshes (one mesh for many rooms): count per triangle
        for (let t = 0; t < n; t += 3) { const k = ix ? ix.getX(t) : t; v.fromBufferAttribute(pa, k).applyMatrix4(o.matrixWorld); const r = hit(v.x, v.y, v.z); if (r) acc.set(r, (acc.get(r) || 0) + 1); }
        for (const [r, c] of acc) r.merged += Math.round(c / 16); continue; }
      v.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld); const r = hit(v.x, v.y, v.z); if (!r) continue;
      if (g.boundingSphere.radius > 1.5 && tris > 200) r.merged += Math.round(tris / 16); else r.small++; }
    document.getElementById('__audS').textContent = 'counting… ' + Math.round(i / list.length * 100) + ' %';
    if (i < list.length) { requestAnimationFrame(step); return; } done(); };
  const done = () => { const rows = [...R.values()].map(r => ({ key: r.b.key, label: r.b.label, d: (r.small + r.inst + r.merged) / r.a * 100, s: r.small, n: r.inst, m: r.merged })).sort((p, q) => p.d - q.d);
    const txt = rows.map(r => r.key + ' · ' + r.d.toFixed(1) + ' (small ' + r.s + ', inst ' + r.n + ', merged ' + r.m + ')').join('\n'); window.__auditRows = rows;
    panel.innerHTML = '<div style="display:flex;gap:8px;align-items:center"><div style="font-weight:900;font-size:16px;flex:1">INTERIOR AUDIT · DETAIL / 100 M²</div><button id="__audC" style="min-height:44px;padding:0 14px;background:#ec3013;color:#fff;border:0;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left">COPY</button><button id="__audX" style="min-height:44px;padding:0 14px;background:#f3f2f2;color:#201e1d;border:0;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left">CLOSE</button></div>'
      + '<div style="font-size:12px;margin:6px 0 8px">Emptiest first. Under 40 = worth a look.</div>'
      + rows.map(r => '<div style="display:flex;gap:8px;border-top:2px solid #f3f2f2;padding:6px 0;font-size:14px"><div style="flex:1;font-weight:800">' + r.label.toUpperCase() + '</div><div style="font-weight:900;color:' + (r.d < 40 ? '#ec3013' : '#f3f2f2') + '">' + r.d.toFixed(1) + '</div></div>').join('');
    document.getElementById('__audC').onclick = () => { try { navigator.clipboard.writeText(txt); } catch (e) {} }; document.getElementById('__audX').onclick = () => panel.remove(); console.log('[audit]\n' + txt); };
  requestAnimationFrame(step);
}
