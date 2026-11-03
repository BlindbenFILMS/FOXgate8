// s679b KING MIGHT'S ROYAL SUV (Rob's drive, worlds/meru2-rob.js), lifted verbatim so the Character Workshop can show it.
// buildRoyalSUV(THREE, suv, { touch }) fills the group: body, glass cabin, chrome, crests, dashboard, seats; suv.userData.wheels = the 4 wheel groups.
export function buildRoyalSUV(THREE, suv, { touch = false } = {}) {
  const PI = Math.PI, S = suv.userData;
  const toonM = c => new THREE.MeshToonMaterial({ color: c });
  const box = (g, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const canvasTex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const crestT = canvasTex(128, 128, (g, w) => { g.fillStyle = '#26292d'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 2, 0, 7); g.fill(); g.strokeStyle = '#e6b45a'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 8, 0, 7); g.stroke(); g.fillStyle = '#f3f2f2'; g.font = '900 76px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, w / 2 + 5); });
    const blk = toonM('#121418'), chr = toonM('#c9ced6'), tyre = toonM('#0c0c0e'), gold = toonM('#e6b45a'), arch = toonM('#1c1f24'), lea = toonM('#5a3a26');
    const glass = new THREE.MeshPhongMaterial({ color: 0x9fc6e0, transparent: true, opacity: 0.26, shininess: 120, depthWrite: false, side: THREE.DoubleSide });
    const tint = new THREE.MeshPhongMaterial({ color: 0x0b0f14, transparent: true, opacity: 0.88, shininess: 140, side: THREE.DoubleSide });
    box(suv, 2.12, 0.78, 4.96, blk, 0, 0.86, 0);   // lower body (front face z 2.48)
    box(suv, 2.04, 0.12, 1.46, blk, 0, 1.31, 1.73); box(suv, 0.5, 0.03, 1.4, blk, 0, 1.385, 1.73);   // hood + centre ridge
    box(suv, 1.98, 0.09, 2.95, blk, 0, 2.1, -0.945);   // roof: ends at the top of the windscreen (z 0.53)
    for (const sx of [-0.84, 0.84]) box(suv, 0.05, 0.05, 2.5, chr, sx, 2.17, -1.0);   // roof rails
    const ws = box(suv, 1.9, 0.92, 0.03, glass, 0, 1.665, 0.765); ws.rotation.x = -0.536; ws.renderOrder = 2;   // raked windscreen (clear: you see both foxes)
    for (const sx of [-0.97, 0.97]) { const ap = box(suv, 0.08, 0.92, 0.08, blk, sx, 1.665, 0.765); ap.rotation.x = -0.536; }   // A pillars
    for (const [z, w] of [[-0.55, 0.1], [-1.5, 0.12], [-2.4, 0.14]]) for (const sx of [-0.985, 0.985]) box(suv, 0.06, 0.83, w, blk, sx, 1.67, z);   // B / C / D pillars
    const sideG = (pts, mat) => { const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]); const geo = new THREE.ShapeGeometry(sh); for (const sx of [-0.99, 0.99]) { const m = new THREE.Mesh(geo, mat); m.rotation.y = -PI / 2; m.position.x = sx; m.renderOrder = 2; suv.add(m); } };
    sideG([[1.0, 1.27], [0.53, 2.06], [-0.55, 2.06], [-0.55, 1.27]], glass);   // front side glass (clear)
    sideG([[-0.55, 1.27], [-0.55, 2.06], [-2.38, 2.06], [-2.44, 1.27]], tint);   // rear side glass (privacy tint)
    { const bw = box(suv, 1.9, 0.78, 0.03, tint, 0, 1.66, -2.45); bw.rotation.x = 0.12; }   // tinted back window
    for (const sx of [-1.072, 1.072]) { box(suv, 0.02, 0.035, 3.45, chr, sx, 1.268, -0.7); box(suv, 0.02, 0.04, 4.1, chr, sx, 0.98, 0); box(suv, 0.22, 0.05, 2.3, chr, sx * 1.045, 0.5, 0.05);   // belt line, body line, running boards
      for (const z of [1.55, -1.55]) box(suv, 0.04, 0.32, 1.22, arch, sx * 1.012, 1.02, z);   // wheel-arch flares
      box(suv, 0.1, 0.12, 0.2, blk, sx * 1.07, 1.36, 0.82); }   // mirrors
    const grT = canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#c9ced6'; g.fillRect(0, 0, w, h); g.fillStyle = '#0d0f12'; g.fillRect(8, 8, w - 16, h - 16); g.fillStyle = '#9aa1aa'; for (let x = 18; x < w - 12; x += 14) g.fillRect(x, 12, 4, h - 24); g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(w / 2, h / 2, 16, 0, 7); g.fill(); g.fillStyle = '#26292d'; g.font = '900 22px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, h / 2 + 1); });
    { const gr = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.48), new THREE.MeshBasicMaterial({ map: grT })); gr.position.set(0, 0.92, 2.5); suv.add(gr); }   // ONE grille plane in front of the body (no stacked slats = no flicker)
    for (const sx of [-1, 1]) { const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.09), new THREE.MeshBasicMaterial({ color: 0xfff6dc })); hl.position.set(sx * 0.8, 1.14, 2.5); suv.add(hl); const drl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.03), new THREE.MeshBasicMaterial({ color: 0xbfe6ff })); drl.position.set(sx * 0.8, 1.06, 2.5); suv.add(drl);
      const tl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.08), new THREE.MeshBasicMaterial({ color: 0xd01e1e })); tl.position.set(sx * 0.72, 1.16, -2.5); tl.rotation.y = PI; suv.add(tl); }
    box(suv, 2.0, 0.22, 0.2, blk, 0, 0.55, 2.52); box(suv, 1.86, 0.04, 0.06, gold, 0, 0.42, 2.6); box(suv, 2.0, 0.22, 0.16, blk, 0, 0.55, -2.52); box(suv, 1.2, 0.03, 0.04, chr, 0, 0.66, -2.61);   // bumpers (gold lip = royal)
    for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.24, 24), new THREE.MeshBasicMaterial({ map: crestT })); d.position.set(s * 1.084, 0.78, 0.15); d.rotation.y = s * PI / 2; suv.add(d); }
    { const d = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ map: crestT })); d.position.set(0, 1.405, 2.05); d.rotation.x = -PI / 2; suv.add(d); }
    box(suv, 1.9, 0.18, 0.32, blk, 0, 1.34, 0.82);   // dashboard
    { const sw = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 6, 16), blk); sw.position.set(-0.45, 1.5, 0.6); sw.rotation.x = -0.5; suv.add(sw); }
    for (const sx of [-0.45, 0.45]) box(suv, 0.52, 0.72, 0.12, lea, sx, 1.24, -0.78);   // leather seat backs
    S.wheels = []; for (const [x, z] of [[-0.98, 1.55], [0.98, 1.55], [-0.98, -1.55], [0.98, -1.55]]) { const wg = new THREE.Group(); wg.position.set(x, 0.46, z); suv.add(wg); const spin = new THREE.Group(); wg.add(spin);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.34, 20), tyre); t.rotation.z = PI / 2; spin.add(t); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.36, 16), chr); h.rotation.z = PI / 2; spin.add(h);
      for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.05, 0.4), blk); sp.rotation.x = k * PI / 5; spin.add(sp); } S.wheels.push(wg); }
    suv.traverse(o => { if (o.isMesh) { o.castShadow = !touch; } });
  return suv;
}
