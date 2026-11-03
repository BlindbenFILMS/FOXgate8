// MERU 2.0 — step 10 ART PASS 6: shared interior kit. Static props are queued by material (mat = Lambert, gls = glossy Phong,
// glass = clear Phong, glo = unlit) with a vertex colour each, then merged into ONE mesh per material per room (4 draws).
// Also: small canvas textures (planks, slate, sign bands) and floor / wall plane helpers. Used by meru2-shoprooms.js + meru2-funrooms.js.
export function makeRoomKit({ THREE, touch }) {
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), M4 = new THREE.Matrix4(), V = new THREE.Vector3(), S = new THREE.Vector3(), Cc = new THREE.Color();
  const GEO = {}, geo = (k, f) => GEO[k] || (GEO[k] = (g => g.index ? g.toNonIndexed() : g)(f()));
  const rnd = (() => { let s = 1234567; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  function Bin() {
    const L = { mat: [], gls: [], glass: [], glo: [] };
    const put = (kind, g0, col, x, y, z, sx, sy, sz, ry = 0, rx = 0, rz = 0) => { const g = g0.clone(); E.set(rx, ry, rz, 'YXZ'); M4.compose(V.set(x, y, z), Q.setFromEuler(E), S.set(sx, sy, sz)); g.applyMatrix4(M4);
      Cc.set(col); const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = Cc.r; a[i * 3 + 1] = Cc.g; a[i * 3 + 2] = Cc.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); L[kind].push(g); };
    return {
      box: (k, col, w, h, d, x, y, z, ry = 0, rx = 0, rz = 0) => put(k, geo('b', () => new THREE.BoxGeometry(1, 1, 1)), col, x, y, z, w, h, d, ry, rx, rz),
      cyl: (k, col, r, h, x, y, z, n = 10, rx = 0, rz = 0, top = 1, ry = 0) => put(k, geo('c' + n + '_' + top, () => new THREE.CylinderGeometry(top, 1, 1, n)), col, x, y, z, r, h, r, ry, rx, rz),
      ecyl: (k, col, rx_, rz_, h, x, y, z, n = 24) => put(k, geo('c' + n + '_1', () => new THREE.CylinderGeometry(1, 1, 1, n)), col, x, y, z, rx_, h, rz_),
      sph: (k, col, r, x, y, z, sy = 1, n = 8) => put(k, geo('s' + n, () => new THREE.SphereGeometry(1, n, Math.max(4, n - 2))), col, x, y, z, r, r * sy, r),
      tor: (k, col, R, t, x, y, z, rx = 0, ry = 0) => put(k, geo('t' + t, () => new THREE.TorusGeometry(1, t, 5, 18)), col, x, y, z, R, R, R, ry, rx),
      etor: (k, col, rx_, rz_, t, x, y, z, sz = 1) => put(k, geo('t' + t + 'e', () => new THREE.TorusGeometry(1, t, 6, 32)), col, x, y, z, rx_, rz_, sz, 0, Math.PI / 2),
      oct: (k, col, r, x, y, z, sy = 1) => put(k, geo('o', () => new THREE.OctahedronGeometry(1)), col, x, y, z, r, r * sy, r),
      build(group) { const out = {};
        const MAT = { mat: () => new THREE.MeshLambertMaterial({ vertexColors: true }), gls: () => new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 80, specular: 0x777777 }),
          glass: () => new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, shininess: 120, specular: 0xffffff }), glo: () => new THREE.MeshBasicMaterial({ vertexColors: true }) };
        for (const k in L) { const list = L[k]; if (!list.length) continue; let n = 0; for (const g of list) n += g.attributes.position.count;
          const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
          for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
          const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.BufferAttribute(col, 3));
          const m = new THREE.Mesh(bg, MAT[k]()); if (k === 'mat' && !touch) m.receiveShadow = true; if (k === 'glass') m.renderOrder = 2; group.add(m); out[k] = m; }
        return out; } };
  }
  const flat = (G, tex, w, d, x, y, z, rep, mat) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; if (rep) tex.repeat.set(w / rep, d / rep);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat || new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); if (!touch) m.receiveShadow = true; G.add(m); return m; };
  const wallPlane = (G, tex, w, h, x, y, z, ry = 0, basic) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, color: 0xdddddd }) : new THREE.MeshLambertMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const planks = (base, dark) => CT(256, 256, (g, w, h) => { const bw = 32; Cc.set(base);
    for (let r = 0; r < 8; r++) { let x = -((r * 97) % 200); while (x < w) { const L = 90 + rnd() * 140, k = 0.82 + rnd() * 0.3;
        g.fillStyle = `rgb(${Cc.r * 255 * k | 0},${Cc.g * 255 * k | 0},${Cc.b * 255 * k | 0})`; g.fillRect(x, r * bw, L, bw);
        g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { const y = r * bw + 4 + rnd() * (bw - 8); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * 0.3, y + rnd() * 4 - 2, x + L * 0.6, y + rnd() * 4 - 2, x + L, y); g.stroke(); }
        g.fillStyle = dark; g.fillRect(x, r * bw, 2, bw); x += L; }
      g.fillStyle = dark; g.fillRect(0, r * bw, w, 2); } });
  const slate = () => CT(256, 256, (g, w) => { g.fillStyle = '#2b2a2e'; g.fillRect(0, 0, w, w); const t = 64;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const k = 0.8 + rnd() * 0.35; g.fillStyle = `rgb(${92 * k | 0},${88 * k | 0},${104 * k | 0})`; g.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
      for (let s = 0; s < 40; s++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; g.fillRect(i * t + 2 + rnd() * (t - 6), j * t + 2 + rnd() * (t - 6), 2 + rnd() * 5, 1 + rnd() * 2); } } });
  const signTex = txt => CT(512, 96, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 18, h); g.fillStyle = '#f3f2f2'; g.font = '800 56px Archivo, Helvetica, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 40, h / 2 + 3); });
  const pendant = (b, x, z, y, top = 7, col = '#201e1d') => { b.box('mat', '#201e1d', 0.012, top - y, 0.012, x, (top + y) / 2, z); b.cyl('mat', col, 0.34, 0.32, x, y, z, 12, 0, 0, 0.18); b.sph('glo', '#fff1c8', 0.1, x, y - 0.14, z); };
  return { CT, Bin, flat, wallPlane, planks, slate, signTex, pendant, rnd, Cc };
}
