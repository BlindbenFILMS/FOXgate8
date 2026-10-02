// Blind Canvas gallery: floor arrows that guide visitors round corners (behind the big screen, at the hallway junction).
// Each guide is a trail of red chevrons along a polyline on the floor, with an optional label at its start.
// A soft wave of light runs along each trail in the walking direction, so the way to go reads even at a glance.
import * as THREE from '../vendor/three/three.module.js';

const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';

function arrowTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
  // a fat chevron pointing to the top of the canvas (= the walking direction)
  const path = () => { c.beginPath(); c.moveTo(128, 22); c.lineTo(232, 150); c.lineTo(184, 150); c.lineTo(128, 82); c.lineTo(72, 150); c.lineTo(24, 150); c.closePath(); };
  c.lineJoin = 'miter';
  path(); c.lineWidth = 22; c.strokeStyle = 'rgba(29,28,27,0.85)'; c.stroke();
  path(); c.fillStyle = '#ec3013'; c.fill();
  c.beginPath(); c.moveTo(128, 170); c.lineTo(212, 236); c.lineTo(172, 236); c.lineTo(128, 202); c.lineTo(84, 236); c.lineTo(44, 236); c.closePath();
  c.lineWidth = 16; c.strokeStyle = 'rgba(29,28,27,0.7)'; c.stroke(); c.fillStyle = 'rgba(236,48,19,0.75)'; c.fill();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function labelTexture(text) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 160; const c = cv.getContext('2d');
  c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, 1024, 160); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 14, 160);
  let fs = 70; c.font = `800 ${fs}px ${FONT}`;
  while (c.measureText(text + '  ↑').width > 940 && fs > 30) { fs -= 2; c.font = `800 ${fs}px ${FONT}`; }
  c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; c.fillText(text, 50, 84);
  c.fillStyle = '#ec3013'; c.fillText('↑', 50 + c.measureText(text + '  ').width, 84);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildGuides({ scene, guides, groundAt, spacing = 2.0 }) {
  if (!guides || !guides.length) return { update() {} };
  const tex = arrowTexture();
  const geo = new THREE.PlaneGeometry(1.2, 1.2); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  // sample every trail at even spacing
  const pts = [];
  for (const g of guides) {
    const P = g.pts; let s = 0, carry = spacing * 0.5;
    for (let i = 0; i < P.length - 1; i++) {
      const [x0, z0] = P[i], [x1, z1] = P[i + 1], L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L;
      for (let d = carry; d <= L; d += spacing) { pts.push({ x: x0 + dx * d, z: z0 + dz * d, a: Math.atan2(-dx, -dz), s: s + d, y0: g.y ?? -1 }); }
      carry = spacing - ((L - carry) % spacing); s += L;
    }
    if (g.label) {
      const [x0, z0] = P[0], [x1, z1] = P[1], L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L;
      const lx = x0 - dx * 0.9, lz = z0 - dz * 0.9, y = groundAt(lx, g.y ?? -1, lz);
      const lm = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.53), new THREE.MeshBasicMaterial({ map: labelTexture(g.label), transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
      lm.geometry.rotateX(-Math.PI / 2); lm.rotation.y = Math.atan2(-dx, -dz); lm.position.set(lx, (y > -100 ? y : -3.35) + 0.025, lz); lm.renderOrder = 2; scene.add(lm);
    }
  }
  const im = new THREE.InstancedMesh(geo, mat, pts.length); im.renderOrder = 2; im.frustumCulled = false;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
  pts.forEach((p, i) => { const y = groundAt(p.x, p.y0, p.z); p.y = (y > -100 ? y : -3.35) + 0.02; q.setFromAxisAngle(up, p.a); m4.compose(new THREE.Vector3(p.x, p.y, p.z), q, one); im.setMatrixAt(i, m4); im.setColorAt(i, col.setScalar(1)); });
  im.instanceMatrix.needsUpdate = true; scene.add(im);
  let t = 0;
  return {
    count: pts.length, pts,
    update(dt, px, pz) {
      t += dt;
      // only animate when someone is near a trail
      let near = false; for (let i = 0; i < pts.length; i += 3) if (Math.abs(pts[i].x - px) < 30 && Math.abs(pts[i].z - pz) < 30) { near = true; break; }
      if (!near) return;
      for (let i = 0; i < pts.length; i++) { const w = 0.5 + 0.5 * Math.sin(pts[i].s * 0.55 - t * 3.2); im.setColorAt(i, col.setScalar(0.5 + 0.5 * w * w)); }
      im.instanceColor.needsUpdate = true;
    },
  };
}
