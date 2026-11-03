// s679 MERU CARS: ONE shared car model for every Meru place (gas station, garage, valet, Rob's drive, rentals) + the BOLT'S TOWING truck.
// Lifted verbatim from worlds/meru2-gas.js mkCar / the tow truck so the look never changes. meruCars(THREE) → { CARC, mkCar(parent, opt), mkTow(parent) }
// mkCar opt: col, hood (open bonnet), screen (dirty windscreen). Returns C = { g, shell, col, wheels, opt, paint(c) }.
export const CARC = ['#2e86b8', '#3f9a5e', '#ffd23a', '#c75b9b', '#f28c28', '#ec3013', '#f3f2f2', '#6f8f9a'];
export function meruCars(THREE) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), LMc = {};
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', STEEL = '#9aa3ab', DARK = '#3d3b3a', GLASS = '#3a4a58';
  const mk = () => { const pos = [], nor = [], col = [];
    const putM = (geo, m4, hex) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m4); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => putM(geo, new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)), hex);
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, putM, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 7), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), RG = mk(), { box, cyl, sph } = R0;
  const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const Cy = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, s);
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const subMesh = R => new THREE.Mesh(R.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textBaseline = 'middle'; let f = fs; x.font = '900 ' + f + 'px Archivo, sans-serif'; while (x.measureText(txt).width > w - 24 && f > 10) { f -= 2; x.font = '900 ' + f + 'px Archivo, sans-serif'; } x.fillText(txt, 12, h / 2 + 2); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const CAB = (() => { const sh = new THREE.Shape(); sh.moveTo(-1.25, 0.87); sh.lineTo(0.85, 0.87); sh.lineTo(0.38, 1.48); sh.lineTo(-1.0, 1.48); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 1.7, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(0.85, 0, 0); return g; })();
  function mkCar(par, opt = {}) { const g = new THREE.Group(); g.rotation.order = 'YXZ'; par.add(g); const shell = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshLambertMaterial({ vertexColors: true })); g.add(shell);
    const C = { g, shell, col: opt.col || CARC[0], wheels: [], opt };
    C.paint = c => { C.col = c; const R = mk(); if (opt.hood) { R.box(1.9, 0.5, 2.95, c, 0, 0.62, -0.625); for (const s of [-1, 1]) R.box(0.06, 0.5, 1.25, c, s * 0.92, 0.62, 1.475); R.box(1.9, 0.5, 0.06, c, 0, 0.62, 2.07); R.box(1.8, 0.04, 1.2, INK, 0, 0.42, 1.47);
        R.box(0.9, 0.3, 0.6, DARK, 0, 0.6, 1.5); R.box(0.3, 0.2, 0.26, INK, -0.55, 0.62, 1.7); R.box(0.2, 0.02, 0.14, RED, -0.55, 0.73, 1.7); R.cyl(0.06, 0.06, 0.05, YEL, -0.22, 0.78, 1.3, 10); } else R.box(1.9, 0.5, 4.2, c, 0, 0.62, 0);
      R.box(1.92, 0.12, 4.24, DARK, 0, 0.36, 0); for (const z of [2.12, -2.12]) R.box(1.94, 0.2, 0.16, DARK, 0, 0.48, z); for (const s of [-1, 1]) { R.box(0.36, 0.14, 0.04, '#fff6c8', s * 0.6, 0.74, 2.1); R.box(0.36, 0.12, 0.04, RED, s * 0.62, 0.76, -2.1); }
      R.box(0.8, 0.14, 0.03, INK, 0, 0.62, 2.11); R.put(CAB, 0, 0, 0, c); for (const s of [-1, 1]) R.box(0.02, 0.4, 1.3, GLASS, s * 0.858, 1.19, -0.25); R.box(1.5, 0.52, 0.02, GLASS, 0, 1.18, -1.135, 0, 0.39);
      if (!opt.screen) R.box(1.56, 0.74, 0.02, GLASS, 0, 1.18, 0.615, 0, -0.695); else R.box(1.56, 0.74, 0.02, '#6f8a9a', 0, 1.18, 0.605, 0, -0.695);
      for (const s of [-1, 1]) for (const z of [1.35, -1.35]) R.box(0.06, 0.2, 0.9, DARK, s * 0.96, 0.78, z); R.box(0.04, 0.03, 0.18, INK, 0.96, 0.95, -0.1); R.box(0.04, 0.03, 0.18, INK, -0.96, 0.95, -0.1);
      shell.geometry.dispose(); shell.geometry = R.geo(); };
    C.paint(C.col);
    for (const sx of [1, -1]) for (const z of [1.35, -1.35]) { const w = new THREE.Group(); const t = mm(Cy(0.36, 0.36, 0.26, 16), LM(INK), 0, 0, 0, 0, 0, Math.PI / 2), h = mm(Cy(0.2, 0.2, 0.27, 12), LM(STEEL), 0, 0, 0, 0, 0, Math.PI / 2); w.add(t, h);
      w.position.set(sx * 0.85, 0.36, z); g.add(w); C.wheels.push({ g: w, t, sx, front: z > 0, home: w.position.clone() }); }
    return C; }
    function mkTow(par) { const TRK = new THREE.Group(); TRK.rotation.order = 'YXZ'; par.add(TRK); const R = mk(); R.box(2.2, 0.5, 6.0, DARK, 0, 0.6, 0); R.box(2.1, 1.5, 1.9, RED, 0, 1.55, 1.95); R.box(2.1, 0.9, 1.0, RED, 0, 1.25, 3.35 - 0.6); R.box(2.12, 0.12, 2.9, WHITE, 0, 1.5, 2.4); R.box(1.9, 0.6, 0.04, GLASS, 0, 1.95, 2.92, 0, -0.2); for (const s of [-1, 1]) R.box(0.02, 0.55, 1.0, GLASS, s * 1.06, 1.95, 2.1);
    R.box(2.2, 0.12, 3.8, '#5a5654', 0, 0.9, -1.0); for (const s of [-1, 1]) R.box(0.08, 0.4, 3.8, RED, s * 1.06, 1.1, -1.0); R.box(2.24, 0.24, 0.2, YEL, 0, 0.55, 3.0); for (const s of [-1, 1]) { R.box(0.3, 0.16, 0.04, '#fff6c8', s * 0.75, 1.15, 3.11); R.box(0.26, 0.14, 0.04, RED, s * 0.85, 0.75, -3.0); }
    R.box(0.3, 1.6, 0.3, STEEL, 0, 1.75, -2.5, 0, -0.4); R.box(0.24, 0.24, 1.2, STEEL, 0, 2.45, -3.0, 0, 0.35); R.cyl(0.2, 0.2, 0.7, INK, 0, 1.2, -2.2, 10, 0, Math.PI / 2); R.box(1.9, 0.12, 0.3, YEL, 0, 3.0 - 0.6 + 0.02, 1.95);
    for (const s of [-1, 1]) for (const z of [2.0, -1.9]) { R.cyl(0.46, 0.46, 0.34, INK, s * 0.96, 0.46, z, 16, 0, Math.PI / 2); R.cyl(0.26, 0.26, 0.35, STEEL, s * 0.96, 0.46, z, 10, 0, Math.PI / 2); }
    TRK.add(subMesh(R)); for (const s of [-1, 1]) { const t = label("BOLT'S TOWING", WHITE, RED, 512, 96, 52); const p = mm(new THREE.PlaneGeometry(1.5, 0.3), new THREE.MeshBasicMaterial({ map: t }), s * 1.062, 1.25, 1.9, 0, s * Math.PI / 2, 0); TRK.add(p); } return TRK; }
  return { CARC, mkCar, mkTow };
}
