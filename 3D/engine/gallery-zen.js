// Blind Canvas gallery: MEDITATE WITH MORTEN, redesigned as a quiet garden room (Ben, 28 Oct).
// The room: x -264..-246, z -6..33.5, floor y -3.37. One way in (from the curved hall, east side, z -4.5..3).
//  • the old flat blue pond is carved (gallery-remodel.js CARVES 'morten pond') and rebuilt here as a raised oval koi pond on the
//    east side: stone coping, a pebble bed under clear water (shader: depth, soft caustics, ripples from the bamboo spout), lily
//    pads, two lotus flowers, three koi, and a shishi-odoshi (bamboo tube that fills, tips and knocks, window.__zenTok for sound)
//  • a sitting circle facing Morten's meditation film: five cushions on low oak plinths on a round straw mat, two benches behind,
//    one stone bench at the pond. Every seat is sittable (returned as benches for gallery-game.js BENCHES).
//  • three paper lanterns over the circle, soft light pools on the floor, bamboo in the corners, a pale pebble border round the pond
//  • the south side (a low parapet onto the open deck) glazed floor to 3.8 m, so the room has no way out but the door
//  • a big MEDITATE WITH MORTEN sign beside the door, in the curved hall (eye level, ink + white)
// Phone budget: shared materials, instanced bamboo, ~60 draws in all, only drawn while the camera is near the room.
import * as THREE from '../vendor/three/three.module.js';

const FY = -3.37, FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
export const ZEN = { pond: { x: -249.6, z: 20.2, rx: 2.3, rz: 4.2 }, film: [-260.2, -0.9, 28.1], room: [-266, -8, -243, 36] };

const tex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
const ellipse = (rx, rz, n = 64) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push(new THREE.Vector2(Math.cos(a) * rx, Math.sin(a) * rz)); } return p; };

export function buildZen({ scene }) {
  const g = new THREE.Group(); g.name = 'zen'; scene.add(g);
  const col = [], benches = [], tickers = [];
  const dyn = o => { o.traverse(m => { m.userData.dyn = true; }); return o; };   // (29 Oct) moves in a ticker: kept out of the static merge (gallery-game.js merges the rest of the garden into a few draws)
  const M = {
    ink: new THREE.MeshLambertMaterial({ color: 0x1d1c1b }),
    oak: new THREE.MeshLambertMaterial({ color: 0xb08356 }),
    stone: new THREE.MeshLambertMaterial({ color: 0xa8a39a }),
    stoneD: new THREE.MeshLambertMaterial({ color: 0x77736c }),
    bamboo: new THREE.MeshLambertMaterial({ color: 0x8fa35a }),
    leaf: new THREE.MeshLambertMaterial({ color: 0x5f7d3a, side: THREE.DoubleSide }),
    cushion: new THREE.MeshLambertMaterial({ color: 0x3b4a5c }),
    cushion2: new THREE.MeshLambertMaterial({ color: 0x8a5a44 }),
    paper: new THREE.MeshBasicMaterial({ color: 0xffe2b0 }),
    glass: new THREE.MeshLambertMaterial({ color: 0xdfe6e8, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }),
  };
  const box = (w, h, d, m, x, y, z, parent = g) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); return b; };
  const cyl = (r0, r1, h, m, x, y, z, seg = 16, parent = g) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.position.set(x, y, z); parent.add(c); return c; };
  const solid = (w, h, d, x, y, z, ry = 0, see = false) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); b.position.set(x, y, z); b.rotation.y = ry; b.updateMatrixWorld(true); if (see) b.userData.see = true; col.push(b); return b; };

  // ---------------------------------------------------------------- the koi pond
  const P = ZEN.pond, WY = FY + 0.24, CO = 0.42;   // water level; coping width
  { const pg = new THREE.Group(); pg.position.set(P.x, 0, P.z); g.add(pg);
    // pale pebble border on the floor
    const peb = tex(512, 512, (c, w, h) => { c.fillStyle = '#d9d4ca'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i++) { const x = rnd() * w, y = rnd() * h, r = 2 + rnd() * 6, l = 170 + rnd() * 70 | 0; c.fillStyle = `rgb(${l},${l - 6},${l - 14})`; c.beginPath(); c.ellipse(x, y, r, r * (0.6 + rnd() * 0.4), rnd() * 3, 0, 7); c.fill(); } });
    peb.wrapS = peb.wrapT = THREE.RepeatWrapping;
    const ring = new THREE.Shape(ellipse(P.rx + CO + 0.75, P.rz + CO + 0.75)); ring.holes.push(new THREE.Path(ellipse(P.rx + CO - 0.05, P.rz + CO - 0.05)));
    const rg = new THREE.ShapeGeometry(ring, 48); rg.rotateX(-Math.PI / 2);
    { const uv = rg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.5, uv.getY(i) * 0.5); }
    const pm = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ map: peb })); pm.position.y = FY + 0.012; pg.add(pm);
    // coping: a stone ring, softly bevelled
    const cop = new THREE.Shape(ellipse(P.rx + CO, P.rz + CO)); cop.holes.push(new THREE.Path(ellipse(P.rx, P.rz)));
    const cg = new THREE.ExtrudeGeometry(cop, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 48 }); cg.rotateX(-Math.PI / 2);
    const cm = new THREE.Mesh(cg, M.stone); cm.position.y = FY + 0.0; pg.add(cm);
    // pond bed: dark pebbles
    const bed = tex(512, 512, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gr.addColorStop(0, '#3a4a45'); gr.addColorStop(1, '#1c2624'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const x = rnd() * w, y = rnd() * h, r = 3 + rnd() * 8, l = 40 + rnd() * 50 | 0; c.fillStyle = `rgb(${l},${l + 8},${l + 4})`; c.beginPath(); c.ellipse(x, y, r, r * 0.7, rnd() * 3, 0, 7); c.fill(); } });
    const bg = new THREE.ShapeGeometry(new THREE.Shape(ellipse(P.rx + 0.02, P.rz + 0.02)), 48); bg.rotateX(-Math.PI / 2);
    { const uv = bg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + P.rz) / (2 * P.rz), (uv.getY(i) + P.rz) / (2 * P.rz)); }
    const bm = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ map: bed })); bm.position.y = FY + 0.03; pg.add(bm);
    // the water
    const wmat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
      uniforms: { uT: { value: 0 }, uR: { value: new THREE.Vector2(P.rx, P.rz) }, uDrip: { value: new THREE.Vector2(0, P.rz - 0.55) }, uPulse: { value: 0 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `precision mediump float; varying vec2 vP; uniform float uT, uPulse; uniform vec2 uR, uDrip;
        void main(){
          float r = length(vP / uR);
          vec3 deep = vec3(0.07, 0.20, 0.21), shallow = vec3(0.24, 0.46, 0.43), sky = vec3(0.78, 0.86, 0.88);
          vec3 col = mix(deep, shallow, smoothstep(0.0, 1.0, r * r));
          float w = sin(vP.x * 3.1 + uT * 0.7) * sin(vP.y * 2.3 - uT * 0.55) + sin((vP.x + vP.y) * 4.7 + uT * 1.1) * 0.5;
          col += vec3(0.05, 0.08, 0.07) * smoothstep(0.6, 1.4, w);                                   // soft caustic shimmer
          float d = length(vP - uDrip);
          float rip = sin(d * 13.0 - uT * 3.4) * exp(-d * 0.9) * (0.55 + uPulse);
          col += sky * 0.10 * smoothstep(0.3, 1.0, rip);                                              // rings from the spout
          col = mix(col, sky, 0.10 + 0.22 * smoothstep(0.55, 1.0, r));                                // the sky in it, more at the edges
          col *= 1.0 - 0.35 * smoothstep(0.86, 1.0, r);                                               // the shade under the coping
          gl_FragColor = vec4(col, 0.64 + 0.26 * r);
        }` });
    const wg = new THREE.ShapeGeometry(new THREE.Shape(ellipse(P.rx + 0.02, P.rz + 0.02)), 48); wg.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(wg, wmat); water.position.y = WY; water.renderOrder = 5; pg.add(water);
    let pulse = 0;
    tickers.push((dt, t) => { wmat.uniforms.uT.value = t; pulse = Math.max(0, pulse - dt * 0.8); wmat.uniforms.uPulse.value = pulse; });
    // lily pads + lotus
    const padM = new THREE.MeshLambertMaterial({ color: 0x4f7a3a, side: THREE.DoubleSide }), lotusM = new THREE.MeshLambertMaterial({ color: 0xf3d6dc }), lotusC = new THREE.MeshLambertMaterial({ color: 0xe8c04a });
    const pads = [];
    for (const [x, z, r] of [[-0.9, -2.4, 0.42], [0.7, -1.6, 0.34], [-1.1, 1.2, 0.38], [1.0, 2.2, 0.3], [0.2, -3.2, 0.28], [-0.4, 2.9, 0.33]]) {
      const pd = new THREE.Mesh(new THREE.CircleGeometry(r, 18, 0.3, Math.PI * 2 - 0.5), padM); pd.rotation.x = -Math.PI / 2; pd.rotation.z = rnd() * 6; pd.position.set(x, WY + 0.006, z); pg.add(pd); pads.push(dyn(pd)); }
    for (const [x, z] of [[-0.9, -2.4], [-1.1, 1.2]]) {
      const fl = new THREE.Group(); fl.position.set(x + 0.05, WY + 0.02, z + 0.05); pg.add(fl);
      for (let i = 0; i < 8; i++) { const pt = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), lotusM); pt.scale.set(0.55, 0.5, 1.4); const a = i / 8 * Math.PI * 2; pt.position.set(Math.cos(a) * 0.07, 0.05, Math.sin(a) * 0.07); pt.rotation.y = -a + Math.PI / 2; pt.rotation.x = -0.6; fl.add(pt); }
      cyl(0.035, 0.03, 0.04, lotusC, 0, 0.08, 0, 10, fl); }
    tickers.push((dt, t) => { pads.forEach((p, i) => { p.rotation.z += Math.sin(t * 0.13 + i) * dt * 0.02; }); });
    // koi: three, under the surface, circling at their own pace
    const koiM = [new THREE.MeshLambertMaterial({ color: 0xe8622c }), new THREE.MeshLambertMaterial({ color: 0xf2ede4 }), new THREE.MeshLambertMaterial({ color: 0xd9a032 })];
    const koi = [0, 1, 2].map(i => { const k = dyn(new THREE.Group()); pg.add(k);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), koiM[i]); body.scale.set(0.9, 0.55, 2.6); k.add(body);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 6), koiM[i]); tail.rotation.x = -Math.PI / 2; tail.scale.set(1, 1, 0.25); tail.position.z = -0.3; k.add(tail);
      if (i === 1) { const spot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), koiM[0]); spot.position.set(0, 0.05, 0.1); spot.scale.set(1, 0.4, 1.4); k.add(spot); }
      return { k, tail, r: 0.45 + i * 0.17, sp: 0.16 + i * 0.05, ph: i * 2.1, dir: i === 1 ? -1 : 1 }; });
    koi.forEach(f => dyn(f.k));
    tickers.push((dt, t) => { for (const f of koi) { const a = f.ph + t * f.sp * f.dir, wob = 1 + 0.12 * Math.sin(t * 0.37 + f.ph);
      const x = Math.cos(a) * P.rx * f.r * wob, z = Math.sin(a) * P.rz * f.r * wob, ax = -Math.sin(a) * P.rx * f.dir, az = Math.cos(a) * P.rz * f.dir;
      f.k.position.set(x, WY - 0.06, z); f.k.rotation.y = Math.atan2(ax, az); f.tail.rotation.y = Math.sin(t * 6 + f.ph) * 0.4; } });
    // the shishi-odoshi at the north end: water runs from a spout into a bamboo tube that tips when full, knocks on a stone, and rises
    const so = new THREE.Group(); so.position.set(0.15, FY, P.rz + CO + 0.55); pg.add(so);
    cyl(0.07, 0.07, 1.25, M.bamboo, 0.55, 0.62, 0, 10, so); cyl(0.072, 0.072, 0.03, M.ink, 0.55, 1.0, 0, 10, so);
    const spout = cyl(0.04, 0.04, 0.6, M.bamboo, 0.55, 1.18, -0.28, 8, so); spout.rotation.x = Math.PI / 2 - 0.25;
    for (const x of [-0.32, 0.32]) cyl(0.035, 0.035, 0.55, M.oak, x, 0.28, -0.2, 8, so);
    const pivot = new THREE.Group(); pivot.position.set(0, 0.52, -0.2); so.add(pivot);
    const tube = cyl(0.06, 0.06, 1.0, M.bamboo, 0, 0, 0, 10, pivot); tube.rotation.x = Math.PI / 2; tube.position.z = -0.15;
    const knock = cyl(0.16, 0.2, 0.18, M.stoneD, 0, 0.09, 0.4, 10, so);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xdff1f4, transparent: true, opacity: 0.55, depthWrite: false })); so.add(stream);
    dyn(pivot); dyn(stream);
    const st = { fill: 0, tip: 0, phase: 'fill' }, REST = 0.28, DOWN = -0.55;
    tickers.push((dt, t) => {
      if (st.phase === 'fill') { st.fill += dt / 7; if (st.fill >= 1) { st.phase = 'tip'; } }
      else if (st.phase === 'tip') { st.tip = Math.min(1, st.tip + dt * 5); if (st.tip >= 1) { st.phase = 'pour'; window.__zenTok = (window.__zenTok || 0) + 1; pulse = 1; } }
      else if (st.phase === 'pour') { st.fill = Math.max(0, st.fill - dt * 2.5); if (!st.fill) st.phase = 'rise'; }
      else { st.tip = Math.max(0, st.tip - dt * 1.6); if (!st.tip) { st.phase = 'fill'; } }
      pivot.rotation.x = REST + (DOWN - REST) * (st.tip < 1 ? st.tip * st.tip : 1) - st.fill * 0.04;
      // the stream from the spout tip into the tube's mouth (or into the pond while the tube is down)
      const sx = 0.55 - 0.0, sy = 1.18 - 0.07, sz = -0.56, ey = st.tip > 0.5 ? WY - FY : 0.6;
      stream.position.set(0.3, (sy + ey) / 2, sz); stream.scale.y = sy - ey; stream.material.opacity = 0.45 + 0.1 * Math.sin(t * 20);
    });
    // (pass 2) river rocks set into the coping and a few in the pebbles, with moss; a low splash ring where the tube pours
    { const rk = new THREE.IcosahedronGeometry(1, 1), moss = new THREE.MeshLambertMaterial({ color: 0x6d8a45 });
      for (const [a, s, h, m] of [[0.35, 0.34, 0.6, 1], [0.5, 0.22, 0.7, 0], [2.6, 0.4, 0.55, 1], [2.8, 0.2, 0.8, 0], [4.1, 0.3, 0.6, 1], [5.4, 0.26, 0.65, 0], [5.55, 0.16, 0.8, 0]]) {
        const x = Math.cos(a) * (P.rx + CO * 0.6), zz = Math.sin(a) * (P.rz + CO * 0.6), r = new THREE.Mesh(rk, a % 2 > 1 ? M.stoneD : M.stone); r.scale.set(s * 1.3, s * h, s); r.rotation.y = a * 3; r.position.set(x, FY + 0.3 + s * h * 0.35, zz); pg.add(r);
        if (m) { const mo = new THREE.Mesh(rk, moss); mo.scale.set(s * 0.9, s * h * 0.35, s * 0.7); mo.position.set(x, FY + 0.3 + s * h * 0.95, zz); pg.add(mo); } } }
    const spl = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.12, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); spl.rotation.x = -Math.PI / 2; spl.position.set(0.3, WY + 0.01, P.rz - 0.15); pg.add(spl); dyn(spl);
    tickers.push(() => { spl.material.opacity = pulse * 0.5; spl.scale.setScalar(1 + (1 - pulse) * 4); });
    // you can't walk into the pond (coping and all)
    const pc = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.2, 24)); pc.scale.set(P.rx + CO + 0.05, 1, P.rz + CO + 0.05); pc.position.set(P.x, FY + 0.6, P.z); pc.updateMatrixWorld(true); col.push(pc);
    solid(1.2, 1.4, 0.9, P.x + 0.15, FY + 0.7, P.z + P.rz + CO + 0.45);
  }

  // ---------------------------------------------------------------- the sitting circle, facing the meditation film
  const [VX, VY, VZ] = ZEN.film, FA = Math.atan2(-0.641, 0.767);   // the film faces +x, -z (into the room)
  const at = (r, deg) => [VX + Math.cos(FA + deg * Math.PI / 180) * r, VZ + Math.sin(FA + deg * Math.PI / 180) * r];
  const faceFilm = (x, z) => Math.atan2(VX - x, VZ - z);
  { // round straw mat under the circle
    const [mx, mz] = at(6.4, 0);
    const mt = tex(512, 512, (c, w, h) => { c.fillStyle = '#c9b88e'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 4) { c.fillStyle = (y / 4) % 2 ? 'rgba(120,96,52,0.18)' : 'rgba(255,248,220,0.12)'; c.fillRect(0, y, w, 2); }
      c.strokeStyle = '#2b2a28'; c.lineWidth = 18; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 14, 0, 7); c.stroke();
      c.strokeStyle = '#8a6a3c'; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 34, 0, 7); c.stroke(); });
    const mat = new THREE.Mesh(new THREE.CircleGeometry(3.7, 48), new THREE.MeshLambertMaterial({ map: mt })); mat.rotation.x = -Math.PI / 2; mat.rotation.z = FA; mat.position.set(mx, FY + 0.014, mz); g.add(mat);
    // five cushions on low round oak plinths
    [-36, -18, 0, 18, 36].forEach((deg, i) => { const [x, z] = at(5.6, deg), ry = faceFilm(x, z);
      const s = new THREE.Group(); s.position.set(x, FY, z); s.rotation.y = ry; g.add(s);
      cyl(0.36, 0.38, 0.26, M.oak, 0, 0.13, 0, 20, s); cyl(0.385, 0.385, 0.02, M.ink, 0, 0.255, 0, 20, s);
      const cu = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 10), i % 2 ? M.cushion2 : M.cushion); cu.scale.set(1, 0.36, 1); cu.position.y = 0.35; s.add(cu);   // (pass 2) a round, puffy zafu
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 6), M.ink); btn.scale.y = 0.4; btn.position.y = 0.472; s.add(btn);
      solid(0.75, 0.45, 0.75, x, FY + 0.22, z);
      benches.push({ x, z, ry, len: 0.7, dir: 1, top: FY + 0.48, name: 'Meditation cushion', look: [VX, VY, VZ] }); });
    // two low oak benches behind them
    [-24, 24].forEach(deg => { const [x, z] = at(8.2, deg), ry = faceFilm(x, z);
      const s = new THREE.Group(); s.position.set(x, FY, z); s.rotation.y = ry; g.add(s);
      box(2.0, 0.08, 0.5, M.oak, 0, 0.44, 0, s); for (const lx of [-0.8, 0.8]) box(0.08, 0.4, 0.42, M.ink, lx, 0.2, 0, s);
      solid(2.0, 0.48, 0.5, x, FY + 0.24, z, ry);
      benches.push({ x, z, ry, len: 2.0, dir: 1, top: FY + 0.5, name: 'Meditation bench', look: [VX, VY, VZ] }); });
    // three paper lanterns over the circle, and soft pools of light on the floor
    const glowT = tex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,214,150,0.55)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    const glowM = new THREE.MeshBasicMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const lan = [], halos = [];
    const haloT = tex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,200,130,0.45)'); gr.addColorStop(0.35, 'rgba(255,190,120,0.16)'); gr.addColorStop(1, 'rgba(255,190,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    const haloM = new THREE.MeshBasicMaterial({ map: haloT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    [-24, 0, 24].forEach((deg, i) => { const [x, z] = at(deg ? 8.2 : 9.4, deg),   // (28 Oct) the side two over the benches: at ±44 they hung in front of Inner Peace + The Gray Zone
      l = new THREE.Group(); l.position.set(x, FY + 3.7, z); g.add(l);   // (pass 2) up and behind the sitters, so they never cover the film
      const shade = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), M.paper); shade.scale.y = 1.25; l.add(shade);
      for (const y of [-0.4, 0.4]) cyl(0.14, 0.14, 0.04, M.ink, 0, y, 0, 12, l);
      cyl(0.008, 0.008, 3.0, M.ink, 0, 1.9, 0, 4, l);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), haloM); halo.renderOrder = 6; l.add(halo); halos.push(halo);
      const gp = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), glowM); gp.rotation.x = -Math.PI / 2; gp.position.set(x, FY + 0.03, z); gp.renderOrder = 3; g.add(gp);
      lan.push({ l: dyn(l), ph: i * 1.7 }); });
    tickers.push((dt, t, cam) => { for (const L of lan) L.l.rotation.z = Math.sin(t * 0.5 + L.ph) * 0.025; for (const h of halos) h.quaternion.copy(cam.q); });
    // (pass 2) BREATHE: a soft warm ring round the mat that swells in (4 s) and fades out (6 s), a pace to breathe along with
    const brM = new THREE.MeshBasicMaterial({ color: 0xffc98a, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
    const br = new THREE.Mesh(new THREE.RingGeometry(3.72, 3.98, 64), brM); br.rotation.x = -Math.PI / 2; br.position.set(mx, FY + 0.02, mz); br.renderOrder = 3; g.add(br); dyn(br);
    tickers.push((dt, t) => { const c = t % 10, k = c < 4 ? 0.5 - 0.5 * Math.cos(c / 4 * Math.PI) : 0.5 + 0.5 * Math.cos((c - 4) / 6 * Math.PI); brM.opacity = 0.08 + 0.34 * k; br.scale.setScalar(0.985 + 0.03 * k); });
  }
  // a stone bench at the pond's south end, looking over the water
  { const x = P.x, z = P.z - P.rz - CO - 1.5, s = new THREE.Group(); s.position.set(x, FY, z); g.add(s);
    box(1.8, 0.14, 0.52, M.stone, 0, 0.42, 0, s); for (const lx of [-0.6, 0.6]) box(0.36, 0.36, 0.44, M.stoneD, lx, 0.18, 0, s);
    solid(1.8, 0.5, 0.52, x, FY + 0.25, z);
    benches.push({ x, z, ry: 0, len: 1.8, dir: 1, top: FY + 0.49, name: 'Pond bench', look: [P.x, WY, P.z + 1.2] }); }

  // ---------------------------------------------------------------- (pass 2) the way in: stepping stones from the door to the circle,
  // lined with four low stone lanterns (toro) that glow warm, so you always see where the path goes (flat: you walk over them)
  { const pts = [[-247.6, -0.8], [-250.2, 2.0], [-252.4, 5.4], [-253.4, 9.6], [-254.0, 13.8], [-254.6, 18.2]], stones = [];
    for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.round(L / 0.95);
      for (let k = 0; k < n; k++) { const f = (k + 0.5) / n; stones.push([ax + (bx - ax) * f + (rnd() - 0.5) * 0.18, az + (bz - az) * f + (rnd() - 0.5) * 0.18, 0.34 + rnd() * 0.1, rnd() * 3]); } }
    const sg = new THREE.CylinderGeometry(1, 1, 0.04, 9); sg.translate(0, 0.02, 0);
    const sm = new THREE.InstancedMesh(sg, new THREE.MeshLambertMaterial({ color: 0xbdb7ac }), stones.length), o = new THREE.Object3D();
    stones.forEach(([x, z, r, a], i) => { o.position.set(x, FY + 0.004, z); o.rotation.set(0, a, 0); o.scale.set(r * 1.15, 1, r); o.updateMatrix(); sm.setMatrixAt(i, o.matrix); }); g.add(sm);
    const winM = new THREE.MeshBasicMaterial({ color: 0xffc27a });
    for (const [x, z, ry] of [[-249.2, -1.6, 0.6], [-251.6, 7.4, -0.3], [-251.9, 12.4, 0.2], [-252.4, 15.0, -0.2]]) {
      const t = new THREE.Group(); t.position.set(x, FY, z); t.rotation.y = ry; g.add(t);
      box(0.46, 0.08, 0.46, M.stoneD, 0, 0.04, 0, t); box(0.16, 0.5, 0.16, M.stone, 0, 0.33, 0, t); box(0.4, 0.06, 0.4, M.stone, 0, 0.61, 0, t);
      box(0.32, 0.26, 0.32, M.stone, 0, 0.77, 0, t); for (const s of [1, -1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.14), winM); w.position.set(0, 0.78, s * 0.162); if (s < 0) w.rotation.y = Math.PI; t.add(w); }
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.2, 4), M.stoneD); roof.rotation.y = Math.PI / 4; roof.position.y = 1.0; t.add(roof); cyl(0.04, 0.05, 0.08, M.stone, 0, 1.13, 0, 8, t);
      solid(0.46, 1.15, 0.46, x, FY + 0.58, z, ry); } }
  // ---------------------------------------------------------------- (pass 2) a raked gravel garden in the open middle (karesansui):
  // pale gravel raked in long lines round three stones, framed by a low ink curb (step over it; the stones are solid)
  { const GX = -258.4, GZ = 9.8, GW = 4.2, GD = 5.6, rocks = [[-0.9, -1.4, 0.42], [0.8, 0.6, 0.3], [-0.4, 1.7, 0.22]];
    const gt = tex(512, 682, (c, w, h) => { c.fillStyle = '#e4e0d6'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { const l = 205 + rnd() * 45 | 0; c.fillStyle = `rgb(${l},${l - 3},${l - 9})`; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
      const sx = w / GW, sz = h / GD, R = rocks.map(([x, z, r]) => [(x + GW / 2) * sx, (z + GD / 2) * sz, r * sx]);
      c.lineWidth = 3; c.strokeStyle = 'rgba(120,112,98,0.42)';
      for (let y = 10; y < h; y += 14) { c.beginPath(); let pen = false; for (let x = 0; x <= w; x += 4) { const near = R.some(([rx, rz, rr]) => Math.hypot(x - rx, y - rz) < rr * 2.4); if (near) { pen = false; continue; } if (!pen) { c.moveTo(x, y); pen = true; } else c.lineTo(x, y); } c.stroke(); }
      for (const [rx, rz, rr] of R) for (let k = 1; k <= 4; k++) { c.beginPath(); c.ellipse(rx, rz, rr * (1 + k * 0.34), rr * (1 + k * 0.34) * 0.92, 0, 0, 7); c.stroke(); } });
    const gp = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD), new THREE.MeshLambertMaterial({ map: gt })); gp.rotation.x = -Math.PI / 2; gp.position.set(GX, FY + 0.05, GZ); g.add(gp);
    for (const [w, d, x, z] of [[GW + 0.24, 0.12, 0, GD / 2 + 0.06], [GW + 0.24, 0.12, 0, -GD / 2 - 0.06], [0.12, GD, GW / 2 + 0.06, 0], [0.12, GD, -GW / 2 - 0.06, 0]]) box(w, 0.1, d, M.ink, GX + x, FY + 0.05, GZ + z);
    const rk = new THREE.IcosahedronGeometry(1, 1);
    for (const [x, z, r] of rocks) { const m = new THREE.Mesh(rk, M.stoneD); m.scale.set(r * 1.25, r * 0.85, r); m.rotation.y = x * 2; m.position.set(GX + x, FY + 0.05 + r * 0.45, GZ + z); g.add(m); solid(r * 2.2, 0.8, r * 2, GX + x, FY + 0.4, GZ + z); }
    // a low stone seat at the garden's east edge, to sit and look over the raked lines
    { const x = GX + GW / 2 + 1.0, zz = GZ, s = new THREE.Group(); s.position.set(x, FY, zz); s.rotation.y = -Math.PI / 2; g.add(s);
      box(1.5, 0.12, 0.48, M.stone, 0, 0.42, 0, s); for (const lx of [-0.5, 0.5]) box(0.32, 0.36, 0.4, M.stoneD, lx, 0.18, 0, s);
      solid(0.48, 0.5, 1.5, x, FY + 0.25, zz);
      benches.push({ x, z: zz, ry: -Math.PI / 2, len: 1.5, dir: 1, top: FY + 0.49, name: 'Garden bench', look: [GX, FY + 0.1, GZ] }); } }

  // ---------------------------------------------------------------- bamboo in the corners (instanced)
  { // (Ben, 28 Oct) only in the gaps between the art: not in front of a card, a label, a film or the blindness tip (the NE corner one hid the Inner Peace card, the SW ones the Mirror card + the tip)
    const groves = [[-263.0, 24.2, 6], [-263.0, 8.4, 5], [-247.3, 6.4, 6]];
    const culms = [], leaves = [];
    for (const [gx, gz, n] of groves) { for (let i = 0; i < n; i++) { const x = gx + (rnd() - 0.5) * 1.3, z = gz + (rnd() - 0.5) * 1.3, h = 3.2 + rnd() * 1.8; culms.push([x, z, h, (rnd() - 0.5) * 0.08]);
        for (let k = 0; k < 4; k++) leaves.push([x + (rnd() - 0.5) * 0.7, FY + h * (0.55 + rnd() * 0.45), z + (rnd() - 0.5) * 0.7, rnd() * 6]); }
      solid(1.5, 2.5, 1.5, gx, FY + 1.25, gz); }
    const cg = new THREE.CylinderGeometry(0.035, 0.045, 1, 6); cg.translate(0, 0.5, 0);
    const cm = new THREE.InstancedMesh(cg, M.bamboo, culms.length), o = new THREE.Object3D();
    culms.forEach(([x, z, h, lean], i) => { o.position.set(x, FY, z); o.rotation.set(lean, 0, lean * 0.7); o.scale.set(1, h, 1); o.updateMatrix(); cm.setMatrixAt(i, o.matrix); }); g.add(cm);
    const lg = new THREE.PlaneGeometry(0.9, 0.5); 
    const lm = new THREE.InstancedMesh(lg, M.leaf, leaves.length);
    leaves.forEach(([x, y, z, r], i) => { o.position.set(x, y, z); o.rotation.set(-0.9 + rnd() * 0.5, r, 0.3); o.scale.set(1, 1, 1); o.updateMatrix(); lm.setMatrixAt(i, o.matrix); }); g.add(lm); }

  // ---------------------------------------------------------------- the south side: glass, floor to 3.8 m, so the room has one door
  { const x0 = -266.2, x1 = -246.3, z = -6.5, H = 3.8, w = x1 - x0, cx = (x0 + x1) / 2;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, H), M.glass); pane.position.set(cx, FY + H / 2, z); pane.renderOrder = 4; g.add(pane);
    box(w, 0.1, 0.14, M.ink, cx, FY + H, z); const n = Math.round(w / 2.5); for (let k = 0; k <= n; k++) box(0.08, H, 0.12, M.ink, x0 + w * k / n, FY + H / 2, z);
    solid(w, H + 1.5, 0.3, cx, FY + (H + 1.5) / 2, z, 0, true); }

  // ---------------------------------------------------------------- the sign beside the door, in the curved hall
  { const sT = tex(768, 512, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 20, w, 20); c.fillRect(44, 48, 96, 14);
      c.fillStyle = '#f3f2f2'; c.font = `800 112px ${FONT}`; c.fillText('MEDITATE', 40, 190); c.fillText('WITH', 40, 300); c.fillText('MORTEN', 40, 410); });
    // an eye-level plaque on the east face of the door's north jamb (the small sign over the door stays)
    const s = new THREE.Group(); s.position.set(-240.72, FY, 3.7); s.rotation.y = Math.PI / 2; g.add(s);
    box(1.34, 1.0, 0.04, M.ink, 0, 1.45, 0, s);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.867), new THREE.MeshBasicMaterial({ map: sT })); face.position.set(0, 1.45, 0.022); s.add(face); }
  g.updateMatrixWorld(true);
  const R = ZEN.room; let wasSat = false;
  return { group: g, col, benches,
    tick(dt, t, cam, Pl, camQ) {
      g.visible = cam.x > R[0] - 14 && cam.x < R[2] + 14 && cam.z > R[1] - 14 && cam.z < R[3] + 14 && cam.y < 14;
      if (!g.visible) return;
      const sat = !!(Pl && Pl.sit && /^Meditation/.test(Pl.sit.name)); if (sat && !wasSat) window.__zenBell = (window.__zenBell || 0) + 1; wasSat = sat;   // (pass 2) sitting down rings a singing bowl
      const C = { q: camQ };
      for (const f of tickers) f(dt, t, C);
    } };
}
