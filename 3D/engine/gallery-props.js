// Blind Canvas gallery: small furnishings that make rooms feel lived in: potted plants and benches.
// Each returns a Group standing on its local floor (y = 0) plus a simple box for collision.
import * as THREE from '../vendor/three/three.module.js';

let leafTex = null;
function leaves() {
  if (leafTex) return leafTex;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 384; const c = cv.getContext('2d');
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // a few stems, then many layered leaves (fiddle-leaf fig): darker inside, lighter at the tips
  c.strokeStyle = '#4b3a2a'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(128, 384); c.quadraticCurveTo(128 + (i - 1) * 30, 260, 128 + (i - 1) * 46, 120); c.stroke(); }
  for (let i = 0; i < 70; i++) {
    const x = 128 + (r() - 0.5) * 200 * (0.5 + r() * 0.5), y = 30 + r() * 250, a = (x - 128) / 120 + (r() - 0.5) * 0.8, L = 26 + r() * 24;
    const g = 70 + r() * 70; c.fillStyle = `rgb(${30 + r() * 30},${g + 40},${40 + r() * 30})`;
    c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, -L / 2, L * 0.42, L * 0.62, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(200,230,180,0.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -L); c.stroke(); c.restore();
  }
  leafTex = new THREE.CanvasTexture(cv); leafTex.colorSpace = THREE.SRGBColorSpace; return leafTex;
}

let PM = null;   // shared materials, so every plant (and bench) in a room merges into a few draws
const pm = () => PM || (PM = { pot: new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), rim: new THREE.MeshBasicMaterial({ color: 0xec3013 }), soil: new THREE.MeshLambertMaterial({ color: 0x3a2a1e }), leaf: new THREE.MeshLambertMaterial({ map: leaves(), transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }), oak: new THREE.MeshLambertMaterial({ color: 0xb98a5a }) });
export function makePlant(height = 2.1) {
  const g = new THREE.Group(), P = pm();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.62, 18), P.pot); pot.position.y = 0.31; g.add(pot);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 18), P.rim); rim.position.y = 0.6; g.add(rim);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.31, 18), P.soil); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.58; g.add(soil);
  const mat = P.leaf;
  for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.25, height), mat); p.position.y = 0.55 + height / 2; p.rotation.y = (i / 3) * Math.PI; g.add(p); }
  return { group: g, size: [0.8, 1.6, 0.8] };
}

export function makeBench(len = 2.6) {
  const g = new THREE.Group();
  const oak = pm().oak, ink = pm().pot;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.62), oak); seat.position.y = 0.46; g.add(seat);
  for (const x of [-len / 2 + 0.2, len / 2 - 0.2]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.56), ink); leg.position.set(x, 0.22, 0); g.add(leg); }
  return { group: g, size: [len, 0.6, 0.65] };
}
