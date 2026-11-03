// MERU 2.0 — s35 (Ben): the BANK's sign for the TRAIN. A big rooftop letter board on the bank's road-side edge (facing the line on the
// ring-road median, both faces so the street side reads too): dark board, gold frame + rule, BANK OF MERU in white, a red M-coin roundel,
// steel legs on the roof. Lamp heads along the top; the board glows warm at night (setNight).
export function buildBankSign({ THREE, scene, L, city }) {
  const b = L.BUILDINGS.find(q => q.key === 'bank'); if (!b || !b.f) return null;
  const bd = city && city.blds ? city.blds.find(q => q.b === b) : null, h = bd ? bd.h : 16;
  // which edge faces the train line: the side whose wall is nearest any line point
  const [x0, x1, z0, z1] = b.f, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, line = L.TRAIN.line;
  const near = (x, z) => Math.min(...line.map(p => Math.hypot(p[0] - x, p[1] - z)));
  const sides = [['N', cx, z0, 0, -1], ['S', cx, z1, 0, 1], ['W', x0, cz, -1, 0], ['E', x1, cz, 1, 0]].sort((p, q) => near(p[1], p[2]) - near(q[1], q[2]));
  const [sd, ex, ez, nx, nz] = sides[0], along = sd === 'N' || sd === 'S', len = along ? x1 - x0 : z1 - z0, W = Math.min(26, len * 0.62), H = W * 0.2, ry = Math.atan2(nx, nz);
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = Math.round(2048 * H / W); const g = cv.getContext('2d'), ch = cv.height;
  g.fillStyle = '#16141a'; g.fillRect(0, 0, 2048, ch); g.strokeStyle = '#c9a227'; g.lineWidth = 18; g.strokeRect(14, 14, 2048 - 28, ch - 28); g.fillStyle = '#c9a227'; g.fillRect(60, ch - 70, 2048 - 120, 10);
  const R = ch * 0.3, rx = 60 + R + 20; g.fillStyle = '#ec3013'; g.beginPath(); g.arc(rx, ch / 2 - 10, R, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#ffd23a'; g.stroke();
  g.fillStyle = '#ffffff'; g.font = '900 ' + Math.round(R * 1.3) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', rx, ch / 2 - 4);
  g.textAlign = 'left'; let s = ch * 0.56; g.font = '900 ' + s + 'px Archivo, sans-serif'; const tx = rx + R + 50; while (g.measureText('BANK OF MERU').width > 2048 - tx - 70 && s > 20) { s -= 4; g.font = '900 ' + s + 'px Archivo, sans-serif'; }
  g.fillText('BANK OF MERU', tx, ch / 2 - 6);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const face = new THREE.MeshBasicMaterial({ map: tex, color: 0xd8d8d8 }), dark = new THREE.MeshLambertMaterial({ color: '#201e1d' }), steel = new THREE.MeshLambertMaterial({ color: '#8a9099' }), lamp = new THREE.MeshBasicMaterial({ color: 0xfff1c8 });
  const G = new THREE.Group(); G.name = 'bankTrainSign'; G.position.set(ex - nx * 2.2, h, ez - nz * 2.2); G.rotation.y = ry; scene.add(G);
  const y0 = 1.4;
  for (const f of [0, Math.PI]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), face); p.position.set(0, y0 + H / 2, 0); p.rotation.y = f; p.translateZ(0.13); G.add(p); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, H + 0.3, 0.22), dark); back.position.set(0, y0 + H / 2, 0); G.add(back);
  for (const u of [-0.4, -0.13, 0.13, 0.4]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.25, y0 + 0.2, 0.25), steel); lg.position.set(u * W, (y0 + 0.2) / 2, 0); G.add(lg);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.4), steel); br.position.set(u * W, 0.4, -1.0); br.rotation.x = 0.55; G.add(br); }
  const lamps = []; for (let i = 0; i < 7; i++) { const u = (i / 6 - 0.5) * W * 0.9; for (const sz of [1, -1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.7), steel); arm.position.set(u, y0 + H + 0.25, sz * 0.4); G.add(arm); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.24), lamp); hd.position.set(u, y0 + H + 0.25, sz * 0.75); G.add(hd); lamps.push(hd); } }
  // the SIDEWALK ENTRANCE canopy over the street door (b.door2): red awning on two brass posts, gold fascia, a pair of planters
  if (b.door2 && b.face2) { const F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[b.face2], [dx, dz] = b.door2, C = new THREE.Group(); C.position.set(dx, 0, dz); C.rotation.y = Math.atan2(F[0], F[1]); scene.add(C);
    const red = new THREE.MeshLambertMaterial({ color: '#ec3013' }), gold = new THREE.MeshLambertMaterial({ color: '#c9a227' }), soff = new THREE.MeshLambertMaterial({ color: '#f3f2f2' });
    const add = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; C.add(o); return o; };
    add(new THREE.BoxGeometry(6.4, 0.16, 2.4), red, 0, 5.15, 1.2, 0.12); add(new THREE.BoxGeometry(6.4, 0.04, 2.3), soff, 0, 5.05, 1.2, 0.12); add(new THREE.BoxGeometry(6.5, 0.36, 0.1), gold, 0, 4.95, 2.4);
    for (const x of [-3.0, 3.0]) { add(new THREE.CylinderGeometry(0.07, 0.07, 5.0, 8), gold, x, 2.5, 2.3); add(new THREE.CylinderGeometry(0.4, 0.32, 0.7, 12), new THREE.MeshLambertMaterial({ color: '#3d3b3a' }), x + Math.sign(x) * 0.9, 0.35, 0.6); add(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshLambertMaterial({ color: '#4f8a5c' }), x + Math.sign(x) * 0.9, 0.95, 0.6); } }
  return { G, side: sd, setNight(on) { face.color.set(on ? 0xffffff : 0xd8d8d8); for (const l of lamps) l.visible = on; } };
}
