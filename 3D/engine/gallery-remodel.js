// Blind Canvas gallery: remodel pass ("New Wing" style everywhere).
// 1) carve: cut pieces out of Ben's PlayCanvas building (triangles whose centre falls in a region) — visuals and collision
// 2) build: new wing-style pieces (wide walkways, rails, the eye portal) that replace what was cut
import * as THREE from '../vendor/three/three.module.js';
import { woodify } from './gallery-wing.js';

// regions are boxes {min:[x,y,z], max:[x,y,z]} or x-axis cylinders {cyl:{x0,x1,y,z,r}}
export const CARVES = [
  // the old narrow bridge (deck + curbs) from the opening platform through the eye and down
  { name: 'old bridge', min: [-38.2, -3.3, -1.35], max: [-6.25, 3.15, 1.35] },
  // the eye's pupil and iris tunnel (rebuilt bigger so the wide walkway fits through)
  { name: 'iris', cyl: { x0: -31.9, x1: -26.1, y: 3.9, z: 0.1, r: 4.6 } },
  // the opening platform: its black pit walls and the welcome screen's block (rebuilt as one wide oak plaza with a screen totem)
  { name: 'opening platform', min: [-13.2, -5.2, -10.2], max: [7.3, 0.15, 10.2] },
  { name: 'welcome block', min: [-8.7, 1.6, -5.3], max: [-8.2, 2.1, -4.7] },
  // the little building north of the Wall of Why hallway (rebuilt as a twin of the New Artists Wing)
  { name: 'north annex', min: [-86, -3.2, -77], max: [-54, 15, -27.7] },
];

const inRegion = (R, x, y, z) => {
  if (R.cyl) { const c = R.cyl; return x >= c.x0 && x <= c.x1 && Math.hypot(y - c.y, z - c.z) <= c.r; }
  return x >= R.min[0] && x <= R.max[0] && y >= R.min[1] && y <= R.max[1] && z >= R.min[2] && z <= R.max[2];
};
export const carved = (x, y, z, list = CARVES) => list.some(R => inRegion(R, x, y, z));

export function carveWorld(world, list = CARVES) {
  const v = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), m = new THREE.Matrix4();
  let cut = 0, hidden = 0;
  world.updateMatrixWorld(true);
  world.traverse(o => {
    if (!o.isMesh) return;
    if (o.isInstancedMesh) {
      o.geometry.computeBoundingBox(); const ctr = o.geometry.boundingBox.getCenter(new THREE.Vector3());
      let changed = false;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m); v.copy(ctr).applyMatrix4(m).applyMatrix4(o.matrixWorld);
        if (carved(v.x, v.y, v.z, list)) { m.makeScale(0, 0, 0); o.setMatrixAt(i, m); changed = true; hidden++; }
      }
      if (changed) o.instanceMatrix.needsUpdate = true;
      return;
    }
    const g = o.geometry, pos = g.attributes.position; if (!pos) return;
    const idx = g.index ? g.index.array : null, n = idx ? idx.length : pos.count;
    const keep = [];
    let removed = 0;
    for (let t = 0; t < n; t += 3) {
      const i0 = idx ? idx[t] : t, i1 = idx ? idx[t + 1] : t + 1, i2 = idx ? idx[t + 2] : t + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
      v.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      if (carved(v.x, v.y, v.z, list)) { removed++; continue; }
      keep.push(i0, i1, i2);
    }
    if (!removed) return;
    cut += removed;
    const ng = g.clone(); ng.setIndex(keep); o.geometry = ng;
    if (!keep.length) o.visible = false;
  });
  return { cut, hidden };
}

// ------------------------------------------------------------ the new entrance: one wide, continuous walkway
// profile points (x, y) along z = 0; the deck is W wide, honey oak, with ink fascia and rails, and goes through a rebuilt eye
export function buildEntrance({ scene, wood }) {
  const g = new THREE.Group(); scene.add(g);
  const col = [];
  const W = 5.6;
  const deckM = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood);
  const inkM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const redM = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const P = [[-13.0, 0.0], [-19.5, 0.0], [-25.6, 2.5], [-32.0, 2.5], [-44.5, -3.38], [-45.5, -3.38]];   // lands 2 m short of 'Hope Floating in Braille'
  const seg = (x0, y0, x1, y1, rails = true) => {
    if (x1 < x0) [x0, y0, x1, y1] = [x1, y1, x0, y0];   // keep the angle in (-90°, 90°) so "up" stays up
    const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const piece = (w, h, d, mat, oy, oz, collide) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      const off = new THREE.Vector3(0, oy, oz).applyAxisAngle(new THREE.Vector3(0, 0, 1), ang);
      m.position.set(mx + off.x, my + off.y, off.z); m.rotation.z = ang; g.add(m); if (collide) col.push(m); return m;
    };
    piece(len + 0.02, 0.3, W, deckM, -0.13, 0, true);                       // deck (top 0.02 above the line)
    for (const s of [-1, 1]) {
      piece(len + 0.02, 0.5, 0.12, inkM, -0.2, s * (W / 2 + 0.06), false);   // fascia
      if (!rails) continue;
      piece(len + 0.02, 0.06, 0.1, redM, 1.05, s * (W / 2 - 0.02), false);   // red handrail (the wing's red rule)
      piece(len + 0.02, 1.0, 0.06, new THREE.MeshLambertMaterial({ color: 0x1d1c1b, transparent: true, opacity: 0.18 }), 0.55, s * (W / 2 - 0.02), true);   // glass panel: you can't fall off
    }
    // posts every ~2 m
    const n = rails ? Math.max(1, Math.round(len / 2)) : -1;
    for (let i = 0; i <= n; i++) {
      const t = i / n, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t;
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.08), inkM); p.position.set(px, py + 0.52, s * (W / 2 - 0.02)); g.add(p); }
    }
  };
  for (let i = 0; i < P.length - 1; i++) seg(P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], i < P.length - 2);   // the landing is open: step off any side
  // the opening plaza: one wide oak deck (x -13..7.3, z -13.5..13.5, out to where the bowl rises) on a gallery-white plinth, railed where it drops away
  const PX0 = -13, PX1 = 7.3, PZ = 13.5, wallM = new THREE.MeshLambertMaterial({ color: 0xeceae6 });
  const glassM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b, transparent: true, opacity: 0.18 });
  const bx = (w, h, d, m, x, y, z, collide) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); if (collide) col.push(b); return b; };
  bx(PX1 - PX0, 0.3, PZ * 2, deckM, (PX0 + PX1) / 2, -0.13, 0, true);
  // plinth faces: white, ink band on top (the wing's baseboard colour)
  bx(0.2, 5, PZ * 2, wallM, PX0 - 0.1, -2.8, 0, true);
  for (const s of [-1, 1]) bx(PX1 - PX0, 5, 0.2, wallM, (PX0 + PX1) / 2, -2.8, s * (PZ + 0.1), true);
  bx(0.14, 0.5, PZ * 2 + 0.28, inkM, PX0 - 0.1, -0.2, 0, false);
  for (const s of [-1, 1]) bx(PX1 - PX0, 0.5, 0.14, inkM, (PX0 + PX1) / 2, -0.2, s * (PZ + 0.1), false);
  const rail = (x0, z0, x1, z1) => {   // red handrail + glass + ink posts along a straight edge at deck level
    const len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(-(z1 - z0), x1 - x0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    const r = bx(len, 0.06, 0.1, redM, mx, 1.07, mz, false); r.rotation.y = ang;
    const gl = bx(len, 1.0, 0.06, glassM, mx, 0.57, mz, true); gl.rotation.y = ang;
    const n = Math.max(1, Math.round(len / 2)); for (let i = 0; i <= n; i++) bx(0.08, 1.05, 0.08, inkM, x0 + (x1 - x0) * i / n, 0.54, z0 + (z1 - z0) * i / n, false);
  };
  rail(PX0, -PZ, PX0, -W / 2); rail(PX0, W / 2, PX0, PZ);
  rail(PX0, -PZ, PX1, -PZ); rail(PX0, PZ, PX1, PZ);
  // skirt under the low end of the down-ramp, so nobody can wander into the wedge beneath it
  { const xa = -44.7, xb = -38.5, yb = 2.5 + (xb + 32) / (-44.5 + 32) * (-3.38 - 2.5), ya = -3.38, len = Math.hypot(xb - xa, yb - ya), ang = Math.atan2(yb - ya, xb - xa);
    const sk = new THREE.Mesh(new THREE.BoxGeometry(len, 3.2, W + 0.24), wallM); sk.rotation.z = ang;
    const off = new THREE.Vector3(0, -1.6 - 0.28, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), ang);
    sk.position.set((xa + xb) / 2 + off.x, (ya + yb) / 2 + off.y, 0); g.add(sk); col.push(sk); }
  // welcome screen totem (the screen itself is gallery.json vids[0], placed on top of this stand)
  { const T = new THREE.Group(); T.position.set(-9, 0, -6); T.rotation.y = -0.393; g.add(T);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.5, 0.25), inkM); post.position.y = 0.75; T.add(post);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 1.6), inkM); base.position.y = 0.04; T.add(base); col.push(post); }
  // the eye: a bigger iris tunnel (teal) with an ink pupil rim, so the 4.6 m walkway passes through comfortably
  const cy = 3.9, cz = 0.1, x0 = -31.9, x1 = -26.1, rIn = 3.5, rOut = 4.55;
  const iris = new THREE.Mesh(new THREE.CylinderGeometry(rIn, rIn, x1 - x0, 48, 1, true), new THREE.MeshLambertMaterial({ color: 0x14a59e, side: THREE.DoubleSide }));
  iris.rotation.z = Math.PI / 2; iris.position.set((x0 + x1) / 2, cy, cz); g.add(iris);
  const face = (x, flip) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 64), new THREE.MeshLambertMaterial({ color: 0x22b8b0, side: THREE.DoubleSide }));
    ring.rotation.y = Math.PI / 2; ring.position.set(x, cy, cz); g.add(ring);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(rIn, 0.16, 10, 64), inkM); rim.rotation.y = Math.PI / 2; rim.position.set(x, cy, cz); g.add(rim);
    const outer = new THREE.Mesh(new THREE.TorusGeometry(rOut, 0.12, 10, 64), inkM); outer.rotation.y = Math.PI / 2; outer.position.set(x, cy, cz); g.add(outer);
  };
  face(x1, 0); face(x0, 1);
  g.updateMatrixWorld(true);
  return { group: g, col };
}

// ------------------------------------------------------------ extra rooms in the New Wing style (gallery.json "rooms")
export function buildRooms({ scene, data, wood, resolveImg, buildWing }) {
  const out = { col: [], arts: [], screens: [], list: [] };
  for (const R of data.rooms || []) {
    const O = new THREE.Vector3(...R.O);
    const room = buildWing({ scene, wing: { artists: R.artists }, O, rotY: R.rotY, doorW: R.doorW, wood, resolveImg, L: R.L, title: R.title, doorSign: R.doorSign });
    out.col.push(...room.col); out.arts.push(...room.arts); out.screens.push(...room.screens); out.list.push({ O, room, key: R.key });
  }
  return out;
}

// ------------------------------------------------------------ restyled art (gallery.json signs of kind 'c' and 'l')
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
function wrapT(ctx, text, maxW) { const out = []; for (const para of String(text).split('\n')) { let line = ''; for (const w of para.split(/\s+/)) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); } return out; }
const sideM = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
// a frameless canvas: the artwork on the face of a shallow white-sided box, sitting proud of the wall
export function canvasBox(s, texLoader) {
  const c = s.c.map(v => new THREE.Vector3(...v));
  const u = c[1].clone().sub(c[0]), v = c[3].clone().sub(c[0]); const w = u.length(), h = v.length(); u.normalize(); v.normalize();
  const n = new THREE.Vector3().crossVectors(u, v).normalize();
  const ctr = c[0].clone().add(c[1]).add(c[2]).add(c[3]).multiplyScalar(0.25);
  const face = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), [sideM, sideM, sideM, sideM, face, sideM]);
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, n)); m.position.copy(ctr).addScaledVector(n, 0.045);
  if (s.img) texLoader.load(s.img, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; face.map = t; face.color.set(0xffffff); face.needsUpdate = true; });
  return m;
}
// wall label / bio board, drawn to the rectangle's own proportions
export function cardTexture(s) {
  const c = s.c.map(v => new THREE.Vector3(...v)); const wM = c[1].distanceTo(c[0]), hM = c[3].distanceTo(c[0]);
  const K = Math.min(260, 1400 / Math.max(wM, hM)); const W = Math.round(wM * K), H = Math.round(hM * K);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  const px = m => m * K;   // metres -> pixels
  if (s.style === 'bio') {
    x.fillStyle = '#3d4046'; x.fillRect(0, 0, W, H); x.fillStyle = '#ec3013'; x.fillRect(0, 0, W, px(0.05));
    const pad = px(0.18); let y = pad + px(0.12);
    x.fillStyle = '#ff9783'; x.font = `800 ${px(0.1)}px ${FONT}`; x.fillText('ARTIST', pad, y); y += px(0.3);
    x.fillStyle = '#fff'; x.font = `800 ${px(0.26)}px ${FONT}`; for (const l of wrapT(x, s.title.toUpperCase(), W - pad * 2)) { x.fillText(l, pad, y); y += px(0.28); }
    x.font = `600 ${px(0.1)}px ${FONT}`; x.fillStyle = '#e9e5e5'; for (const sub of s.sub || []) for (const l of wrapT(x, sub, W - pad * 2)) { x.fillText(l, pad, y); y += px(0.14); }
    y += px(0.06); x.fillStyle = '#ec3013'; x.fillRect(pad, y, px(0.4), px(0.025)); y += px(0.2);
    x.font = `400 ${px(0.105)}px ${FONT}`; x.fillStyle = '#f3f2f2';
    for (const p of s.bio || []) { for (const l of wrapT(x, p, W - pad * 2)) { if (y > H - pad) break; x.fillText(l, pad, y); y += px(0.142); } y += px(0.05); }
  } else {
    x.fillStyle = '#f9f8f6'; x.fillRect(0, 0, W, H); x.fillStyle = '#1d1c1b'; x.fillRect(0, 0, px(0.035), H);
    const pad = px(0.16); let y = pad + px(0.2);
    const tsz = s.plaque ? 0.17 : 0.24;
    x.fillStyle = '#1d1c1b'; x.font = `800 ${px(tsz)}px ${FONT}`; for (const l of wrapT(x, s.title, W - pad * 2).slice(0, 2)) { x.fillText(l, pad, y); y += px(tsz * 1.08); }
    if (s.artist) { x.font = `500 ${px(0.12)}px ${FONT}`; x.fillStyle = '#5a5654'; x.fillText(s.artist, pad, y); y += px(0.2); }
    if (s.quote && !s.plaque) {
      x.font = `italic 400 ${px(0.115)}px ${FONT}`; x.fillStyle = '#2b2928';
      const lines = wrapT(x, s.quote, W - pad * 2); const room = Math.floor((H - y - px(0.3)) / px(0.155));
      lines.slice(0, Math.max(0, room)).forEach((l, i, arr) => { x.fillText(i === arr.length - 1 && lines.length > arr.length ? l + ' …' : l, pad, y); y += px(0.155); });
    }
    x.fillStyle = '#ec3013'; x.font = `800 ${px(0.075)}px ${FONT}`; x.fillText('APPROACH TO VIEW · READ ALOUD', pad, H - px(0.12));
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
