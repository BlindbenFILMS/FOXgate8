// MERU 2.0 — art pass: MORE THINGS IN THE WIND (Ben: "what else can sway in the wind? keep going").
// One cloth shader (wind from the west, same as the clouds) drives: red MERU BANNERS on poles along the four Town Square paths,
// WINDSOCKS on the jetty ends, KITES flying over Pearl Island (string + ribbon tail), SAILBOATS at anchor on the lake (rocking hull,
// billowing sail), a WASHING LINE by the pearl shack. Phone: fewer of each.
export function buildBreeze({ THREE, scene, L, city, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Breeze'; scene.add(root);
  const uT = { value: 0 }, colliders = [], R = Math.random, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // cloth: uv.x = 0 at the fixed edge (pole / line), free = uv.x (flag) or uv.x * (1 - uv.y) (banner hung on two edges) or 1 - uv.y (laundry hung from the top)
  const cloth = ({ mode = 0, ...opts }) => { const m = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, ...opts });
    m.onBeforeCompile = sh => { sh.uniforms.uT = uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wq = modelMatrix * vec4(position, 1.0); float f = ${mode === 1 ? 'uv.x * (1.0 - uv.y) * 0.6' : mode === 2 ? '(1.0 - uv.y)' : 'uv.x'};
      float gust = 0.65 + 0.35 * sin(uT * 0.7 + wq.x * 0.02 + wq.z * 0.015);
      transformed.z += f * gust * (0.28 * sin(uv.x * 6.0 - uT * 5.5 + wq.x * 0.3) + 0.1 * sin(uv.x * 13.0 + uv.y * 4.0 - uT * 9.0));
      transformed.x += f * gust * 0.06 * sin(uT * 3.0 + wq.z);`); };
    m.customProgramCacheKey = () => 'cloth' + mode; return m; };
  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  const POLE = lam(0x2a2d33), WOOD = lam(0x8b6a48), WHITE = lam(0xf3f2f2);
  const blocked = (x, z, r) => (city.colliders || []).some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false);

  // ---------- BANNERS: two-banner poles along the four Town Square paths ----------
  // Meru crest banner (navy + gold + red, the castle colours): gold border, red band, gold ring + navy disc + white M, MERU in gold, swallowtail
  const banTex = CT(96, 256, (g, w, h) => { g.fillStyle = '#1b2350'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8323e'; g.fillRect(0, 0, w, 22);
    g.fillStyle = '#e6b45a'; g.fillRect(0, 22, w, 5); g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
    g.beginPath(); g.arc(w / 2, 104, 36, 0, 7); g.fill(); g.fillStyle = '#151b3d'; g.beginPath(); g.arc(w / 2, 104, 29, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.font = '900 42px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, 106);
    g.fillStyle = '#e6b45a'; g.font = '900 26px Archivo, sans-serif'; g.fillText('MERU', w / 2, 184); g.fillRect(16, 204, w - 32, 3);
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(0, h); g.lineTo(w / 2, h - 30); g.lineTo(w, h); g.fill(); g.globalCompositeOperation = 'source-over'; });
  const banM = cloth({ map: banTex, mode: 1, alphaTest: 0.5 });
  { const banG = new THREE.PlaneGeometry(1.1, 2.6, 6, 8), poles = [];
    for (const P of L.PATHS) for (let k = 0; k < P.p.length - 1; k++) { const [ax, az] = P.p[k], [bx, bz] = P.p[k + 1], len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
      for (let t = 32; t < len; t += 32) { const x0 = ax + (bx - ax) * t / len, z0 = az + (bz - az) * t / len; if (Math.abs(x0) > 158 || Math.abs(z0) > 145 || Math.hypot(x0, z0) < 16) continue;
        for (const s of [-1, 1]) { const x = x0 + nx * 6.2 * s, z = z0 + nz * 6.2 * s; if (blocked(x, z, 0.8) || L.BUILDINGS.some(b => b.f && x > b.f[0] - 1.5 && x < b.f[1] + 1.5 && z > b.f[2] - 1.5 && z < b.f[3] + 1.5) || poles.some(([a, b]) => Math.hypot(a - x, b - z) < 6)) continue; poles.push([x, z, Math.atan2(bx - ax, bz - az)]); } } }
    if (touch) poles.splice(Math.ceil(poles.length / 2));
    const pg = new THREE.CylinderGeometry(0.09, 0.13, 6.4, 8); pg.translate(0, 3.2, 0); const pI = new THREE.InstancedMesh(pg, POLE, poles.length), aI = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.07, 0.07), POLE, poles.length * 2);
    const bI = new THREE.InstancedMesh(banG, banM, poles.length * 2), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
    poles.forEach(([x, z, ry], i) => { M4.compose(V(x, 0, z), Q.identity(), V(1, 1, 1)); pI.setMatrixAt(i, M4); colliders.push({ c: [x, z, 0.3] });
      for (const [j, y] of [[0, 6.0], [1, 3.1]]) { const yy = j ? 3.25 : 6.15; M4.compose(V(x, yy, z), Q.setFromEuler(E.set(0, ry, 0)), V(1, 1, 1)); aI.setMatrixAt(i * 2 + j, M4); }
      for (const [j, s] of [[0, 1], [1, -1]]) { M4.compose(V(x + Math.cos(ry) * 0.68 * s, 4.7, z - Math.sin(ry) * 0.68 * s), Q.setFromEuler(E.set(0, ry + (s < 0 ? Math.PI : 0), 0)), V(1, 1, 1)); bI.setMatrixAt(i * 2 + j, M4); } });
    aI.count = poles.length * 2; for (let i = 0; i < poles.length; i++) { const [x, z, ry] = poles[i]; for (const [j, yy] of [[0, 6.0], [1, 3.4]]) { M4.compose(V(x, yy, z), Q.setFromEuler(E.set(0, ry + Math.PI / 2, 0)), V(1, 1, 1)); aI.setMatrixAt(i * 2 + j, M4); } }
    root.add(pI, aI, bI); }

  // ---------- WINDSOCKS on the jetty ends ----------
  const socks = []; { const tex = CT(128, 32, (g, w, h) => { for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : '#f97316'; g.fillRect(i * w / 5, 0, w / 5 + 1, h); } });
    const sm = cloth({ map: tex });
    for (const [x, y, z] of [[63, 0.9, 267], [-124, 0.9, 263], [271, 1.2, 349], [155, 0.9, 226]]) { const g = new THREE.Group(); g.position.set(x, y, z); root.add(g);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.5, 6), POLE); p.position.y = 2.25; g.add(p); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 4, 12), POLE); ring.position.set(0.1, 4.4, 0); ring.rotation.y = Math.PI / 2; g.add(ring);
      const cg = new THREE.CylinderGeometry(0.3, 0.12, 1.8, 12, 6, true); cg.rotateZ(-Math.PI / 2); cg.translate(1.0, 0, 0); const uv = cg.attributes.uv, P = cg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (P.getX(i) - 0.1) / 1.8, uv.getX(i));
      const sock = new THREE.Mesh(cg, sm); sock.position.set(0.1, 4.4, 0); g.add(sock); socks.push({ sock, ph: R() * 6 }); colliders.push({ c: [x, z, 0.2], y0: y - 0.5 }); } }

  // ---------- KITES over Pearl Island ----------
  const kites = []; { const KC = [['#ec3013', '#ffd23a'], ['#38bdf8', '#f3f2f2'], ['#c084fc', '#7dff6a']];
    for (let i = 0; i < (touch ? 2 : 3); i++) { const t = -2.2 + i * 0.7, [ax, az] = L.islandPt ? L.islandPt(t, 40) : [206 + Math.cos(t) * 40, 356 + Math.sin(t) * 40], ay = L.islandAt ? Math.max(0.3, L.islandAt(ax, az)) : 0.5;
      const tex = CT(64, 64, (g, w, h) => { g.fillStyle = KC[i][0]; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w, h * 0.42); g.lineTo(w / 2, h); g.lineTo(0, h * 0.42); g.fill(); g.fillStyle = KC[i][1]; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w, h * 0.42); g.lineTo(w / 2, h * 0.42); g.fill(); g.beginPath(); g.moveTo(w / 2, h); g.lineTo(0, h * 0.42); g.lineTo(w / 2, h * 0.42); g.fill();
        g.strokeStyle = '#201e1d'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h * 0.42); g.lineTo(w, h * 0.42); g.stroke(); });
      const k = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide })); root.add(k);
      const tg = new THREE.PlaneGeometry(0.22, 5, 1, 10); tg.translate(0, -2.5, 0); const tuv = tg.attributes.uv; for (let q = 0; q < tuv.count; q++) tuv.setXY(q, 1 - tuv.getY(q), tuv.getX(q));
      const tail = new THREE.Mesh(tg, cloth({ color: new THREE.Color(KC[i][1]) })); k.add(tail); tail.position.y = -1.4;
      const sg = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(17 * 3), 3)), str = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: 0xf3f2f2, transparent: true, opacity: 0.7 })); str.frustumCulled = false; root.add(str);
      const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), WOOD); stake.position.set(ax, ay + 0.4, az); root.add(stake);
      kites.push({ k, str, a: [ax, ay + 0.7, az], ph: R() * 6, h: 24 + i * 6, d: 22 + i * 5 }); } }

  // ---------- SAILBOATS at anchor on the lake ----------
  const boats = []; { const sailTex = CT(64, 64, (g, w, h) => { g.fillStyle = '#f6f3ec'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 8; y < h; y += 10) g.fillRect(0, y, w, 2); });
    const sailM = cloth({ map: sailTex }), HC = ['#2e4a6b', '#ec3013', '#f3f2f2', '#3f9a5e', '#201e1d'];
    const spots = []; for (let k = 0; k < 600 && spots.length < (touch ? 3 : 5); k++) { const x = -280 + R() * 560, z = 270 + R() * 160; if (!L.inLake(x, z) || L.lakeShoreD(x, z) < 34 || (L.islandR && L.islandR(x, z) < 80) || spots.some(([a, b]) => Math.hypot(a - x, b - z) < 60) || Math.abs(x - 75) < 30 && z < 320 || (x > 140 && x < 300 && z < 300)) continue; spots.push([x, z]); }
    spots.forEach(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -Math.PI / 2 + (R() - 0.5) * 0.6; root.add(g);
      const hs = new THREE.Shape(); hs.moveTo(-0.9, -2.6); hs.quadraticCurveTo(-1.1, 0.6, 0, 3.0); hs.quadraticCurveTo(1.1, 0.6, 0.9, -2.6); hs.closePath();
      const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.75, bevelEnabled: false }); hg.rotateX(Math.PI / 2); hg.translate(0, 0.45, 0); const hull = new THREE.Mesh(hg, lam(HC[i % HC.length])); g.add(hull);
      const deck = new THREE.Mesh(new THREE.ShapeGeometry(hs), lam(0xb08b5e)); deck.rotation.x = -Math.PI / 2; deck.position.y = 0.49; g.add(deck);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 7.5, 6), WHITE); mast.position.set(0, 4.2, 0.6); g.add(mast); const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6), WHITE); boom.rotation.x = Math.PI / 2; boom.position.set(0, 1.2, -1.0); g.add(boom);
      const sg = new THREE.BufferGeometry(), N = 8, pos = [], uv = [], idx = []; for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) { const v = r / N, u = c / N * (1 - v); pos.push(0, 1.25 + v * 6.2, 0.55 - u * 3.1); uv.push(u, v); }
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = r * (N + 1) + c; idx.push(p, p + 1, p + N + 1, p + 1, p + N + 2, p + N + 1); } sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
      const sail = new THREE.Mesh(sg, sailM); sail.rotation.y = 0.35; sail.position.z = 0.05; g.add(sail); const sail2 = new THREE.Mesh(sg, sailM); sail2.scale.set(1, 0.85, -0.7); sail2.position.z = 0.75; g.add(sail2);
      boats.push({ g, ph: R() * 6, y: 0 }); colliders.push({ c: [x, z, 2.6], y0: -3 }); (L.LAKE.extraBlocks || (L.LAKE.extraBlocks = [])).push([x, z, 3.4]); }); }

  // ---------- WASHING LINE by the pearl shack ----------
  { const sh = L.LAKE && L.LAKE.island && L.LAKE.island.shack; if (sh) { const [sx, sz] = sh, y = (L.islandAt ? L.islandAt(sx, sz) : 0.5), ax = sx + 4, az = sz - 3, bx = sx + 4, bz = sz + 5;
    for (const [x, z] of [[ax, az], [bx, bz]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.4, 6), WOOD); p.position.set(x, y + 1.2, z); root.add(p); colliders.push({ c: [x, z, 0.2] }); }
    const ln = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 8, 4), WHITE); ln.rotation.x = Math.PI / 2; ln.position.set(ax, y + 2.3, (az + bz) / 2); root.add(ln);
    const LC = ['#f3f2f2', '#38bdf8', '#ec3013', '#ffd23a', '#f3f2f2', '#3f9a5e'];
    LC.forEach((c, i) => { const w = 0.6 + R() * 0.4, h = 0.6 + R() * 0.5, g = new THREE.PlaneGeometry(w, h, 4, 4); g.translate(0, -h / 2, 0); const m = new THREE.Mesh(g, cloth({ color: new THREE.Color(c), mode: 2 })); m.position.set(ax, y + 2.28, az + 0.8 + i * 1.2); m.rotation.y = Math.PI / 2; root.add(m); }); } }

  function tick(dt, now, cam) { const t = now / 1000; uT.value = t % 10000;
    for (const s of socks) { s.sock.rotation.y = 0.25 * Math.sin(t * 0.4 + s.ph); s.sock.rotation.z = -0.15 - 0.15 * Math.sin(t * 0.7 + s.ph); }
    for (const K of kites) { const sw = Math.sin(t * 0.6 + K.ph), sw2 = Math.sin(t * 1.3 + K.ph * 2), x = K.a[0] + K.d + sw * 4, y = K.a[1] + K.h + sw2 * 2.5, z = K.a[2] + Math.cos(t * 0.45 + K.ph) * 5;
      K.k.position.set(x, y, z); K.k.rotation.set(0, -Math.PI / 2, sw * 0.35); const P = K.str.geometry.attributes.position;
      for (let i = 0; i <= 16; i++) { const u = i / 16, sag = Math.sin(Math.PI * u) * 3; P.setXYZ(i, K.a[0] + (x - K.a[0]) * u, K.a[1] + (y - 1.4 - K.a[1]) * u - sag, K.a[2] + (z - K.a[2]) * u); } P.needsUpdate = true; }
    for (const B of boats) { B.g.position.y = 0.05 + Math.sin(t * 1.1 + B.ph) * 0.12; B.g.rotation.z = Math.sin(t * 0.9 + B.ph) * 0.06; B.g.rotation.x = Math.sin(t * 0.7 + B.ph * 1.7) * 0.03; } }
  return { tick, colliders, stats: { banners: root.children[2] ? root.children[2].count / 2 : 0, socks: socks.length, kites: kites.length, boats: boats.length } };
}
