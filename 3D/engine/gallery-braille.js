// Blind Canvas gallery: 'Hope Floating in Braille', an island on the welcome plaza.
// In the middle, a glass block in a slim steel frame with the Blind Canvas Project logo suspended inside it in black (an
// office-lobby sign), lit from its base. On each side of the glass a tiled pool of moving, glowing water with the four braille
// cells of H-O-P-E floating and bobbing on it, and a black label along the outer rim. Both sides read correctly, so visitors
// can walk all the way round it. Local frame: the glass runs along x; side A's visitors stand at -z, side B's at +z.
// The old piece (centre of the entry hall) is carved out in gallery-remodel.js CARVES; patchOldBraille() fills its floor.
import * as THREE from '../vendor/three/three.module.js';

// on the plaza at the end away from the museum, the glass running north-south so one face looks at the museum and one at the garden
export const BRAILLE = { x: 4.4, z: 0, floor: 0.02, yaw: Math.PI / 2, poolW: 7.0, poolD: 2.0, GW: 5.0, GH: 2.6, GD: 0.42 };

const tex = (w, h, draw, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };

export function patchOldBraille({ scene, wood, woodify }) {   // the floor where the old piece's pool was sunk into the entry hall
  const wm = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood, 4, true); wm.polygonOffset = true; wm.polygonOffsetFactor = -1;
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 11.0), wm); patch.rotation.x = -Math.PI / 2; patch.position.set(-51.85, -3.38 + 0.004, -0.6); scene.add(patch);
}

export function buildBraille({ scene, resolveImg }) {
  const B = BRAILLE, F = 0, g = new THREE.Group(); g.position.set(B.x, B.floor, B.z); g.rotation.y = B.yaw; scene.add(g); const col = [], tickers = [];
  const stone = new THREE.MeshLambertMaterial({ color: 0xf1eee9 }), ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const steel = new THREE.MeshLambertMaterial({ color: 0x8d9298 }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const box = (p, w, h, d, m, x, y, z, solid) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); p.add(b); if (solid) col.push(b); return b; };

  // shared textures (both pools use the same ones, so the water drifts as one)
  const labelT = tex(2048, 92, (c, w, h) => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 6);
    c.fillStyle = '#fff'; c.font = '800 44px Archivo, Arimo, Arial, sans-serif'; c.textBaseline = 'middle'; c.fillText('HOPE FLOATING IN BRAILLE', 40, h / 2 + 3);
    const cells = [[1, 2, 5], [1, 3, 5], [1, 2, 3, 4], [1, 5]], dot = (n, cx) => { const cl = n > 3 ? 1 : 0, row = (n - 1) % 3; c.beginPath(); c.arc(cx + cl * 18, 26 + row * 18, 6, 0, Math.PI * 2); c.fill(); };
    cells.forEach((cell, i) => cell.forEach(n => dot(n, w - 340 + i * 70))); c.font = '600 26px Archivo, Arimo, Arial, sans-serif'; c.fillStyle = '#ff9783'; c.fillText('H  O  P  E', w - 340, h - 14);
  });
  const basinT = tex(1024, 300, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1e6f86'); gr.addColorStop(1, '#0d3f52'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.10)'; c.lineWidth = 2; for (let x = 0; x <= w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  });
  const causticT = () => tex(512, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(190,245,255,.55)'; c.lineWidth = 3;
    for (let i = 0; i < 26; i++) { const y0 = Math.random() * h; c.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + Math.sin(x / 40 + i) * 14 + Math.sin(x / 13 + i * 2) * 5; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  }, [2.6, 0.8]);
  const cA = causticT(), cB = causticT();
  const ripple = tex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 160; i++) { const x = Math.random() * w, y = Math.random() * h, r = 10 + Math.random() * 40; const gr = c.createRadialGradient(x, y, r * 0.6, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); } }, [2.2, 0.7]);
  const glowT = tex(64, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(170,240,255,1)'); gr.addColorStop(0.6, 'rgba(120,210,240,.25)'); gr.addColorStop(1, 'rgba(120,210,240,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const shadowM = new THREE.MeshBasicMaterial({ map: tex(64, 64, c => { const gr = c.createRadialGradient(32, 32, 4, 32, 32, 30); gr.addColorStop(0, 'rgba(0,30,40,.5)'); gr.addColorStop(1, 'rgba(0,30,40,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false });
  const tileM = new THREE.MeshLambertMaterial({ color: 0xcfe7ee }), dotM = new THREE.MeshLambertMaterial({ color: 0xfaf8f4 }), dotGeo = new THREE.CylinderGeometry(0.17, 0.19, 0.08, 24);
  const dots = [];

  const W = B.poolW, D = B.poolD, RIM = 0.22, RH = 0.36, GD = B.GD, GAP = 0.18, WY = F + RH - 0.09;
  // one side: a pool between the glass's plinth and the visitor (this side's visitor stands at -z, facing +z)
  function side(rotY) {
    const s = new THREE.Group(); s.rotation.y = rotY; g.add(s);
    const zi = -(GD / 2 + 0.15 + GAP), zo = zi - D;   // inner (glass side) and outer edges of the water
    box(s, W + RIM * 2, RH, RIM, stone, 0, F + RH / 2, zo - RIM / 2, true);                       // outer rim
    box(s, W + RIM * 2, RH, RIM, stone, 0, F + RH / 2, zi + RIM / 2, true);                       // inner rim (against the plinth)
    for (const k of [-1, 1]) box(s, RIM, RH, D, stone, k * (W / 2 + RIM / 2), F + RH / 2, (zi + zo) / 2, true);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(W + RIM * 2 - 0.1, RH - 0.06), new THREE.MeshBasicMaterial({ map: labelT }));
    lab.position.set(0, F + RH / 2 + 0.01, zo - RIM - 0.002); lab.rotation.y = Math.PI; s.add(lab);
    const basin = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: basinT })); basin.rotation.x = -Math.PI / 2; basin.position.set(0, F + 0.02, (zi + zo) / 2); s.add(basin);
    for (const [zz, ry] of [[zo + 0.001, 0], [zi - 0.001, Math.PI]]) { const iw = new THREE.Mesh(new THREE.PlaneGeometry(W, RH - 0.06), tileM); iw.position.set(0, F + RH / 2, zz); iw.rotation.y = ry; s.add(iw); }
    for (const k of [-1, 1]) { const iw = new THREE.Mesh(new THREE.PlaneGeometry(D, RH - 0.06), tileM); iw.position.set(k * (W / 2 - 0.001), F + RH / 2, (zi + zo) / 2); iw.rotation.y = -k * Math.PI / 2; s.add(iw); }
    for (const [t, y] of [[cA, 0.05], [cB, 0.07]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(0, F + y, (zi + zo) / 2); s.add(m); }
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ color: 0x5fc6d8, map: ripple, transparent: true, opacity: 0.42, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, WY, (zi + zo) / 2); s.add(surf);
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); spill.rotation.x = -Math.PI / 2; spill.position.set(0, WY + 0.005, (zi + zo) / 2); s.add(spill);   // the glass's light, brightest by the glass
    // H O P E: four cells of 2 x 3 dots, reading left to right for this side's visitor (+x is on their left); dot 1 furthest away
    const cells = [[1, 2, 5], [1, 3, 5], [1, 2, 3, 4], [1, 5]], CW = 0.48, CG = 0.85, cellsW = 4 * CW + 3 * CG;
    cells.forEach((cell, i) => cell.forEach(n => {
      const c2 = n > 3 ? 1 : 0, row = (n - 1) % 3;
      const x = cellsW / 2 - (i * (CW + CG) + c2 * CW), z = zi - 0.45 - row * 0.55;
      const d = new THREE.Mesh(dotGeo, dotM); d.position.set(x, WY + 0.03, z); s.add(d);
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), shadowM); sh.rotation.x = -Math.PI / 2; sh.position.set(x + 0.04, F + 0.03, z + 0.05); s.add(sh);
      dots.push({ d, ph: Math.random() * Math.PI * 2, y: WY + 0.03 });
    }));
    return s;
  }
  side(0); side(Math.PI);

  // ---- the glass block with the logo inside, in a slim steel frame on a low lit plinth
  const GW = B.GW, GH = B.GH, gb = F + 0.32;
  box(g, GW + 0.3, 0.32, GD + 0.3, ink, 0, F + 0.16, 0, true);
  for (const k of [-1, 1]) { const led = new THREE.Mesh(new THREE.PlaneGeometry(GW, 0.05), new THREE.MeshBasicMaterial({ color: 0xd8f7ff })); led.position.set(0, gb + 0.002, k * (GD / 2 + 0.07)); led.rotation.x = -Math.PI / 2; g.add(led); }   // LED strips in the plinth, both faces
  const glassM = new THREE.MeshLambertMaterial({ color: 0xbfe6ef, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(GW, GH, GD), glassM); glass.position.set(0, gb + GH / 2, 0); glass.renderOrder = 4; g.add(glass); col.push(glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(GW, GH, GD)), new THREE.LineBasicMaterial({ color: 0xe9fbff, transparent: true, opacity: 0.85 })); edges.position.copy(glass.position); g.add(edges);
  const sheenT = tex(512, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.save(); c.translate(w * 0.3, 0); c.rotate(0.5); const gr = c.createLinearGradient(-60, 0, 60, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(-60, -200, 120, 700); c.fillRect(110, -200, 30, 700); c.restore(); });
  const haloT = tex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(190,240,255,.9)'); gr.addColorStop(1, 'rgba(190,240,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const T = 0.07;
  for (const k of [-1, 1]) box(g, T, GH + T * 2, GD + 0.06, steel, k * (GW / 2 + T / 2), gb + GH / 2, 0, true);
  box(g, GW + T * 2, T, GD + 0.06, steel, 0, gb + GH + T / 2, 0, false);
  box(g, GW + T * 2, T, GD + 0.06, steel, 0, gb - T / 2 + 0.02, 0, false);
  box(g, GW * 0.4, 0.02, GD + 0.08, red, 0, gb + GH + T + 0.01, 0, false);
  // for each face: a sheen on the near face, the logo (black, reading the right way round), a glow behind it on the far face
  const logoMats = [];
  for (const k of [-1, 1]) {   // k = -1: side A (visitor at -z); +1: side B
    const ry = k < 0 ? Math.PI : 0;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(GW, GH), new THREE.MeshBasicMaterial({ map: sheenT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sh.position.set(0, gb + GH / 2, k * (GD / 2 + 0.004)); sh.rotation.y = ry; sh.renderOrder = 6; g.add(sh);
    const lm = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }); logoMats.push(lm);
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(GW * 0.82, GH * 0.82), lm); lg.position.set(0, gb + GH / 2, k * 0.012); lg.rotation.y = ry; lg.renderOrder = 4; g.add(lg);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(GW - 0.1, GH - 0.1), new THREE.MeshBasicMaterial({ map: haloT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); hl.position.set(0, gb + GH / 2, -k * (GD / 2 - 0.02)); hl.rotation.y = ry; hl.renderOrder = 3; g.add(hl);
  }
  { const img = new Image(); img.onload = () => {
      const t = tex(1024, Math.round(1024 * GH / GW), (c, w, h) => { const k = Math.min(w * 0.94 / img.width, h * 0.94 / img.height), iw = img.width * k, ih = img.height * k; c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#111'; c.fillRect(0, 0, w, h); });
      for (const m of logoMats) { m.map = t; m.opacity = 0.96; m.needsUpdate = true; } };
    img.src = resolveImg('gallery/img/blind_canvas_project_logo__270692239.webp'); }

  // ---- motion: the water drifts, the caustics shimmer, the dots bob
  let t = 0;
  tickers.push(dt => {
    t += dt;
    ripple.offset.set(t * 0.012, t * 0.007); cA.offset.set(t * 0.02, t * 0.011); cB.offset.set(-t * 0.017, t * 0.015);
    for (const o of dots) { o.d.position.y = o.y + Math.sin(t * 1.3 + o.ph) * 0.025; o.d.rotation.z = Math.sin(t * 0.9 + o.ph) * 0.05; o.d.rotation.x = Math.cos(t * 0.8 + o.ph) * 0.05; }
  });
  g.updateMatrixWorld(true);
  return { group: g, col, tick: dt => tickers.forEach(f => f(dt)) };
}
