// 8 GATES — ARCADE room [arcadeSlots / arcadePinball]. The small generic arcade both machines stand in (neon carpet, signs,
// two background cabinets, light cones). No world dressing, so it fits inside any building.
// buildArcadeRoom({ THREE, toon, M, grad, touch, scene }, { signs: ['ARCADE', 'JACKPOT'] }) → { tick(dt, nowMs) }
import { canvasTex, FONT } from '../../engine/textures.js';
import { glowTex } from './pinball-machine.js';

export function buildArcadeRoom({ THREE, toon, M, grad, touch, scene }, { signs = ['ARCADE', 'HIGH SCORE'] } = {}) {
  const carpet = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#120f26'; g.fillRect(0, 0, w, h); let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cols = ['#ff4fd8', '#38bdf8', '#ffd23a', '#22c55e', '#a78bfa']; g.lineCap = 'round'; g.globalAlpha = 0.42;
    for (let i = 0; i < 46; i++) { const x = rnd() * w, y = rnd() * h, c = cols[i % cols.length], k = i % 4; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 5; g.save(); g.translate(x, y); g.rotate(rnd() * 6.3);
      if (k === 0) { g.beginPath(); g.moveTo(-18, 0); for (let j = 1; j <= 4; j++) g.quadraticCurveTo(-18 + j * 9 - 4.5, j % 2 ? -10 : 10, -18 + j * 9, 0); g.stroke(); }
      else if (k === 1) { g.beginPath(); g.arc(0, 0, 9, 0, 7); g.stroke(); } else if (k === 2) { g.beginPath(); g.moveTo(0, -11); g.lineTo(10, 8); g.lineTo(-10, 8); g.closePath(); g.stroke(); } else { g.fillRect(-3, -3, 6, 6); }
      g.restore(); } }, [5, 5]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshToonMaterial({ map: carpet, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !touch; scene.add(floor);
  const wallTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#2c2450'; g.fillRect(0, 0, w, h); g.fillStyle = '#382e66'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h); g.fillStyle = '#ec3013'; g.fillRect(0, h - 10, w, 4); g.fillStyle = '#ffd23a'; g.fillRect(0, h - 4, w, 2); }, [4, 1]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), new THREE.MeshToonMaterial({ map: wallTex, gradientMap: grad })); wall.position.set(0, 2.5, -3.6); scene.add(wall);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), toon('#241d44')); sw.position.set(s * 4.6, 2.5, 1); sw.rotation.y = -s * Math.PI / 2; scene.add(sw); }
  const glow = glowTex(THREE);
  const neonSign = (txt, col, x, y, sc) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(512, 128, (g, w, h) => { g.font = '900 86px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 24; g.fillStyle = '#ffffff'; g.fillText(txt, w / 2, h / 2 + 4); g.shadowBlur = 10; g.fillStyle = col; g.globalAlpha = 0.6; g.fillText(txt, w / 2, h / 2 + 4); }) })); m.scale.setScalar(sc); m.position.set(x, y, -3.58); scene.add(m);
    const hl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); hl.scale.set(3.4 * sc, 1.4 * sc, 1); hl.position.set(x, y, -3.5); scene.add(hl); return { m, hl }; };
  const neonA = neonSign(signs[0], '#ff4fd8', -1.6, 3.2, 1.5), neonB = neonSign(signs[1], '#38bdf8', 2.1, 3.35, 0.8);
  const neonL = new THREE.PointLight(0xff4fd8, 0.9, 5); neonL.position.set(-1.6, 3, -3.0); scene.add(neonL);
  // two background cabinets (lit screens flicker through colours)
  const bgScreens = [];
  for (const [x, col] of [[-1.9, '#38bdf8'], [1.9, '#22c55e']]) { const cb = new THREE.Group(); cb.position.set(x * 1.5, 0, -3.0); cb.scale.setScalar(1.45); scene.add(cb); M(new THREE.BoxGeometry(0.7, 1.75, 0.6), toon('#1b1733'), 0, 0.875, 0, cb, 0.015); M(new THREE.BoxGeometry(0.72, 0.18, 0.62), toon(col), 0, 1.84, 0, cb, 0.015);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.42), new THREE.MeshBasicMaterial({ color: col })); scr.position.set(0, 1.35, 0.305); cb.add(scr); bgScreens.push({ m: scr, c: new THREE.Color(col) }); M(new THREE.BoxGeometry(0.7, 0.08, 0.3), toon('#2a2448'), 0, 0.98, 0.42, cb, 0.012);
    const sg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); sg.scale.set(1.2, 1.0, 1); sg.position.set(0, 1.35, 0.35); cb.add(sg); }
  // ceiling light cones (soft additive pools)
  for (const x of [-2.4, 2.4]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4.4, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe9c4', transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); c.position.set(x, 2.6, -0.8); scene.add(c); }

  function tick(dt, now) {
    const t = now / 1000; bgScreens.forEach((b, i) => { const k = 0.6 + 0.4 * Math.sin(t * (3 + i) + i * 2) * Math.sin(t * 0.7 + i); b.m.material.color.copy(b.c).multiplyScalar(k); });
    const fl = Math.sin(t * 23) > 0.97 ? 0.4 : 1; neonA.m.material.opacity = fl; neonA.hl.material.opacity = 0.35 * fl; neonL.intensity = 0.9 * fl;
  }
  return { tick, floor };
}
