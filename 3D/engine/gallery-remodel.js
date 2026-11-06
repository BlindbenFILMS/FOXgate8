// Blind Canvas gallery: remodel pass ("New Wing" style everywhere).
// 1) carve: cut pieces out of Ben's PlayCanvas building (triangles whose centre falls in a region) — visuals and collision
// 2) build: new wing-style pieces (wide walkways, rails, the eye portal) that replace what was cut
import * as THREE from '../vendor/three/three.module.js';
import { TEXMEM, lean } from './gallery-texmem.js';
import { woodify } from './gallery-wing.js';
import { TOOLS, ALLY_TIPS, SPECTRUM } from './kiosk-art.js';
import { stainedGlass } from './gallery-stained.js';

// regions are boxes {min:[x,y,z], max:[x,y,z]} or x-axis cylinders {cyl:{x0,x1,y,z,r}}
export const CARVES = [
  // the music room's high glass band (one 53 m strip, 12.56-14.47 m) that the skywalk climbs through: cut, and rebuilt with an arch
  // for the skywalk to pass under (gallery-game.js, 'skywalk arch')
  { name: 'skywalk glass band', only: 'Arch', min: [-177.8, 12.4, -28], max: [-177.58, 14.6, 26] },
  // the old narrow bridge (deck + curbs) from the opening platform through the eye and down
  { name: 'old bridge', min: [-38.2, -3.3, -1.35], max: [-6.25, 3.15, 1.35] },
  // the eye's pupil and iris tunnel (rebuilt bigger so the wide walkway fits through)
  { name: 'iris', cyl: { x0: -31.9, x1: -26.1, y: 3.9, z: 0.1, r: 4.6 } },
  // the opening platform: its black pit walls and the welcome screen's block (rebuilt as one wide oak plaza with a screen totem)
  { name: 'opening platform', min: [-13.2, -5.2, -10.2], max: [7.3, 0.15, 10.2] },
  { name: 'welcome block', min: [-8.7, 1.6, -5.3], max: [-8.2, 2.1, -4.7] },
  // the old kiosks (one centred Tools kiosk at the spawn; the two by the walkway rebuilt bigger and further from the rails)
  { name: 'spawn kiosks', min: [6.3, -1.9, -3.6], max: [9.6, 2.6, 4.2] },
  { name: 'walkway kiosk south', min: [-22, -1.9, -7.0], max: [-14.2, 2.6, -2.5] },
  { name: 'walkway kiosk north', min: [-22.2, -1.9, 1.5], max: [-17.8, 2.6, 5.6] },
  // the little building north of the Wall of Why hallway (rebuilt as a twin of the New Artists Wing)
  { name: 'north annex', min: [-86, -3.2, -77], max: [-54, 15, -27.7] },
  // the welcome plaza's old furniture: the big "to move" cube by the spawn, and the boards that floated out past the rails
  { name: 'move cube', min: [2.0, -0.8, 4.1], max: [4.0, 3.6, 6.1] },
  { name: 'intro board north', min: [-4.4, 0.3, 14.5], max: [4.3, 5.5, 15.5] },
  { name: 'intro board south', min: [-4.4, 0.3, -15.4], max: [4.3, 5.5, -14.4] },
  { name: 'tip board north', min: [-21.9, -0.1, 13.6], max: [-13.5, 4.9, 14.6] },
  { name: 'tip board south', min: [-21.9, -0.1, -14.2], max: [-13.5, 4.9, -13.2] },
  // 'Hope Floating in Braille' in the middle of the entry hall: pool, rim, floating dots, logo frame and label (rebuilt against the left wall)
  { name: 'braille piece', min: [-56.2, -3.3, -5.9], max: [-47.5, 3.4, 4.7] },
  { name: 'braille pool water', only: 'Cube__30__1', min: [-53.0, -4.2, -5.4], max: [-48.0, -2.8, 4.1] },
  // the white shell walls that rose either side of the plaza and the lake, hiding the city: cut away (deck level and the eye stay)
  { name: 'shell wall north', only: 'Arch__1_', min: [-26.2, 0.6, 13.75], max: [7.6, 30, 30] },
  { name: 'shell wall south', only: 'Arch__1_', min: [-26.2, 0.6, -30], max: [7.6, 30, -13.75] },
  { name: 'shell trim north', only: 'TRIM___right___White_ext___2nd', min: [-26.2, 0.6, 13.75], max: [7.6, 30, 30] },
  { name: 'shell trim south', only: 'TRIM___right___White_ext___2nd', min: [-26.2, 0.6, -30], max: [7.6, 30, -13.75] },
  // the main hall's painted sky ceiling (12.6 m) and the roof sheet above it (14.5 m), over the bays between the beams:
  // cut out so the new stained-glass roof (gallery-roof.js) shows against the real sky
  { name: 'main hall ceiling', only: 'Arch', min: [-116.6, 12.2, -21.9], max: [-76.6, 14.9, 21.9] },
  // the iris platform over the music room (ring floor at 14.81): its tall outer rim and the tube round the pupil, cut down to the
  // floor so it's an open ring to walk round and look down from (gallery-elevator.js adds glass rails and the lift)
  { name: 'iris platform rim + pupil tube', only: 'Arch', min: [-213.2, 15.0, -7.8], max: [-198.8, 21.5, 7.6] },
  { name: 'iris platform rim + pupil tube (2)', only: 'Arch__1_', min: [-213.2, 15.0, -7.8], max: [-198.8, 21.5, 7.6] },
  // the music room's ceiling: the eye-shaped opening's faceted rings (black bands, white upstands, the deck, the tall outer wall
  // and the old support out to the iris), rebuilt smooth in gallery-eyelid.js
  { name: 'eyelid rings', only: 'Arch__1_', ell: [-208.08, -0.45, 14.3, 26.3], y: [7.3, 15.5] },
  { name: 'eyelid rings (2)', only: 'Arch', ell: [-208.08, -0.45, 14.3, 26.3], y: [7.3, 15.5] },
  // the ring floor itself (its teal top and its underside): rebuilt as stained glass in gallery-elevator.js
  { name: 'iris ring floor', only: 'Arch', min: [-212.2, 14.4, -7.2], max: [-198.9, 14.99, 6.2] },
  { name: 'iris ring floor (2)', only: 'Arch__1_', min: [-212.2, 14.4, -7.2], max: [-198.9, 14.99, 6.2] },
  // the skywalk (gallery-skywalk.js): the 2nd floor's low edge wall between the two interview screens (rebuilt in two parts
  // with a gap), and the two big black screen frames (rebuilt smaller, further apart)
  { name: 'skywalk gap (2nd floor edge wall)', only: 'mesh_32', min: [-146.2, 5.8, -1.5], max: [-145.2, 6.7, 0.5] },
  { name: 'old 2nd floor screen frames', only: 'mesh_35', min: [-146, 9, -6], max: [-145.3, 10, 6.5] },
  // (27 Oct) the entry hall's step-and-repeat board: its black backing box (rebuilt beside the shirt studio, gallery-studio.js)
  { name: 'step-and-repeat backing', only: 'mesh_34', min: [-41, -2, 12.3], max: [-40, -0.5, 12.8] },
  // (27 Oct, Ben) the entry hall, opened up: the two broken wall stubs left from the old braille pit (floor kept), the low
  // strip of its edge, and the white trim bands that jutted in from the west side like the lip of a hall
  { name: 'entry stubs (below floor)', only: 'ENTRANCE_floor', min: [-57, -8, -6], max: [-52.5, -3.45, 5] },
  { name: 'entry stubs (above floor)', only: 'ENTRANCE_floor', min: [-57, -3.3, -6], max: [-52.5, 3, 5] },
  { name: 'braille pit edge strip', only: 'mesh_32', min: [-56.7, -4, -6], max: [-56, -3.2, 4.5] },
  { name: 'entry west trim lip north', only: 'TRIM___right___White_ext___2nd', min: [-66, -6.5, 3.5], max: [-62.5, 13.5, 24] },
  { name: 'entry west trim lip south', only: 'TRIM___right___White_ext___2nd', min: [-66, -6.5, -26], max: [-62.5, 13.5, -3.5] },
  // (27 Oct, s14) the Stevie Wonder screens' old black frames on the west wall (the bigger screens moved in toward the doorway)
  { name: 'old Stevie frames', only: 'mesh_35', min: [-63.6, -4, -13], max: [-62.6, 0, 13] },
  // (s31, Ben) the big hall's wide black frames behind the two Six Views walls (the walls now hug their content)
  { name: 'old Six Views frames north', only: 'mesh_35', min: [-169, -4, 20.8], max: [-151, 7, 21.45] },
  { name: 'old Six Views frames south', only: 'mesh_35', min: [-169, -4, -21.5], max: [-151, 7, -20.85] },
  // (Ben, 28 Oct) Meditate with Morten: the old flat blue pond, its rim and the five little stones (rebuilt in gallery-zen.js)
  { name: 'morten pond water', only: 'Cube__30__1', min: [-257.4, -9, 5.4], max: [-244.0, -2.8, 9.5] },
  { name: 'morten pond rim', min: [-257.4, -3.5, 5.4], max: [-244.6, -2.5, 9.6] },   // (the floor stays: ENTRANCE_floor covers it)
  { name: 'morten stones', only: 'mesh_24', min: [-262, -4, 21], max: [-254, -2, 32] },
  // (Ben, 28 Oct) the old pond's sunken basin walls that still stood 0.75 m proud as a low beam from the Morten card to the gravel
  // garden (they reach down to -8, so the rim carve above missed them), and the west half of the door's north black jamb (the
  // jamb now ends at the threshold, where the stepping stones start; its east half, mesh_34 #3, stays)
  { name: 'morten pond basin', only: 'Arch__1_', min: [-257.4, -9, 5.8], max: [-243.5, -2.5, 9.6] },
  { name: 'morten door jamb west', only: 'mesh_34', min: [-248.5, -1, 3.2], max: [-247.3, 1, 4.2] },
  // the old platform's back rim east of the plaza (the cherry garden starts there now)
  { name: 'old platform rim', min: [7.35, -6, -17.5], max: [13, 3.2, 17.5] },
];

const inRegion = (R, x, y, z) => {
  if (R.ell) { const [cx, cz, rx, rz] = R.ell; return y >= R.y[0] && y <= R.y[1] && ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2 <= 1; }
  if (R.cyl) { const c = R.cyl; return x >= c.x0 && x <= c.x1 && Math.hypot(y - c.y, z - c.z) <= c.r; }
  return x >= R.min[0] && x <= R.max[0] && y >= R.min[1] && y <= R.max[1] && z >= R.min[2] && z <= R.max[2];
};
export const carved = (x, y, z, list = CARVES) => list.some(R => !R.only && inRegion(R, x, y, z));   // (regions limited to one mesh never drop data)

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
        if (list.some(R => (!R.only || R.only === o.name) && inRegion(R, v.x, v.y, v.z))) { m.makeScale(0, 0, 0); o.setMatrixAt(i, m); changed = true; hidden++; }
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
      if (list.some(R => (!R.only || R.only === o.name) && inRegion(R, v.x, v.y, v.z))) { removed++; continue; }
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
  const blueM = new THREE.MeshBasicMaterial({ color: 0x15309a });
  const railGlass = stainedGlass({ cell: 0.42, y0: -3.4, y1: 4.0, opacity: 0.68 });   // deeper blues as the ramp goes down into the hall   // deep cobalt: the bridge into the stained-glass eye and the ramp down inside
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
      piece(len + 0.02, 0.06, 0.1, blueM, 1.05, s * (W / 2 - 0.02), false);   // deep blue handrail (matches the eye's glass)
      piece(len + 0.02, 1.0, 0.06, railGlass, 0.55, s * (W / 2 - 0.02), true).renderOrder = 4;   // stained-glass panel (the eye's style), and you can't fall off
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
  // (the welcome film's stand is built with the rest of the plaza furniture in buildKiosks)
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
  const out = { col: [], arts: [], screens: [], canvases: [], list: [] };
  for (const R of data.rooms || []) {
    const O = new THREE.Vector3(...R.O);
    const room = buildWing({ dim: R.dim || 1, scene, wing: { artists: R.artists }, O, rotY: R.rotY, doorW: R.doorW, wood, resolveImg, L: R.L, title: R.title, logo: R.logo, endVideo: R.endVideo, floorLogo: R.floorLogo, fillLogo: R.fillLogo, doorSign: R.doorSign, bayW: R.bayW, Wd: R.Wd, lip: R.lip ?? 1, frontWall: R.frontWall !== false, doorZ: R.doorZ || 0, sideDoor: R.sideDoor || null, hang: R.hang || null, titleY: R.titleY || 3.0, frontWins: R.frontWins || null });
    // the partner's logo out in the hall, on an ink panel, to lead people to the room (loads with the room)
    // a free-standing ink display board (for a photo hung on the low wall across the hall); a red bar on top
    for (const hb of R.hallBoards || []) {
      const [sx, sy, sz] = hb.size, b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), new THREE.MeshLambertMaterial({ color: 0x1d1c1b })); b.position.set(...hb.p); scene.add(b);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(sx + 0.02, 0.07, sz + 0.02), new THREE.MeshBasicMaterial({ color: 0xec3013 })); bar.position.set(hb.p[0], hb.p[1] + sy / 2 + 0.035, hb.p[2]); scene.add(bar);
    }
    for (const hl of R.hallLogos || []) {
      const lm = new THREE.MeshBasicMaterial({ color: 0x1d1c1b }); const m = new THREE.Mesh(new THREE.PlaneGeometry(hl.w, hl.h), lm);
      m.position.set(...hl.c); m.rotation.y = hl.rotY || 0; scene.add(m);
      const img = new Image(); img.onload = () => { const cv = document.createElement('canvas'); cv.width = 1600; cv.height = Math.round(1600 * hl.h / hl.w); const c = cv.getContext('2d');
        c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, cv.width, cv.height); c.fillStyle = '#ec3013'; c.fillRect(0, 0, cv.width, 14);
        const k = Math.min(cv.width * 0.86 / img.width, cv.height * 0.78 / img.height), iw = img.width * k, ih = img.height * k; c.drawImage(img, (cv.width - iw) / 2, (cv.height - ih) / 2 + 6, iw, ih);
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; lm.map = t; lm.color.set(0xffffff); lm.needsUpdate = true; };
      img.src = resolveImg(hl.img || R.floorLogo || R.logo);
    }
    out.col.push(...room.col); out.arts.push(...room.arts); out.screens.push(...room.screens); out.canvases.push(...room.canvases); out.list.push({ O, room, key: R.key, park: !!R.park });   // (a room out in the park is its own building: always drawn)
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
  const K = Math.min(260, 1400 / Math.max(wM, hM)) * TEXMEM.scale; const W = Math.round(wM * K), H = Math.round(hM * K);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  const px = m => m * K;   // metres -> pixels
  if (s.style === 'bio') {
    x.fillStyle = '#3d4046'; x.fillRect(0, 0, W, H); x.fillStyle = '#ec3013'; x.fillRect(0, 0, W, px(0.05));
    const pad = px(0.18); let y = pad + px(0.12);
    x.fillStyle = '#ff9783'; x.font = `800 ${px(0.1)}px ${FONT}`; x.fillText('ARTIST', pad, y); y += px(0.3);
    x.fillStyle = '#fff'; x.font = `800 ${px(0.26)}px ${FONT}`; for (const l of wrapT(x, s.title.toUpperCase(), W - pad * 2)) { x.fillText(l, pad, y); y += px(0.28); }
    x.font = `600 ${px(0.1)}px ${FONT}`; x.fillStyle = '#e9e5e5'; for (const sub of s.sub || []) for (const l of wrapT(x, sub, W - pad * 2)) { x.fillText(l, pad, y); y += px(0.14); }
    y += px(0.06); x.fillStyle = '#ec3013'; x.fillRect(pad, y, px(0.4), px(0.025)); y += px(0.2);
    // body text as big as the board allows (short bios read from further away), 0.105–0.16 m
    let bs = 0.16; const fits = z => { x.font = `400 ${px(z)}px ${FONT}`; let n = 0; for (const p of s.bio || []) n += wrapT(x, p, W - pad * 2).length; return y + n * px(z * 1.35) <= H - pad; };
    while (bs > 0.105 && !fits(bs)) bs -= 0.005;
    x.font = `400 ${px(bs)}px ${FONT}`; x.fillStyle = '#f3f2f2';
    for (const p of s.bio || []) { for (const l of wrapT(x, p, W - pad * 2)) { if (y > H - pad) break; x.fillText(l, pad, y); y += px(bs * 1.35); } y += px(0.05); }
  } else {
    const F = s.scale || 1, q = m => px(m * F);   // bigger cards get bigger type
    x.fillStyle = '#1d1c1b'; x.fillRect(0, 0, W, H); x.fillStyle = '#ec3013'; x.fillRect(0, 0, q(0.035), H);   // (27 Oct, Ben) black card, white type
    const pad = q(0.16); let y = pad + q(0.2);
    const tsz = s.plaque ? 0.17 : 0.24;
    x.fillStyle = '#ffffff'; x.font = `800 ${q(tsz)}px ${FONT}`; for (const l of wrapT(x, s.title, W - pad * 2).slice(0, 2)) { x.fillText(l, pad, y); y += q(tsz * 1.08); }
    if (s.artist) { x.font = `500 ${q(0.14)}px ${FONT}`; x.fillStyle = '#e9e5e5'; x.fillText(s.artist, pad, y); y += q(0.24); }
    if (s.quote && !s.plaque) {
      x.font = `italic 400 ${q(0.14)}px ${FONT}`; x.fillStyle = '#f3f2f2';
      const lines = wrapT(x, s.quote, W - pad * 2); const room = Math.floor((H - y - q(0.3)) / q(0.19));
      lines.slice(0, Math.max(0, room)).forEach((l, i, arr) => { x.fillText(i === arr.length - 1 && lines.length > arr.length ? l + ' …' : l, pad, y); y += q(0.19); });
    }
    x.fillStyle = '#ff9783'; x.font = `800 ${q(0.085)}px ${FONT}`; x.fillText('APPROACH TO VIEW · READ ALOUD', pad, H - q(0.1));
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return lean(t);
}

// ------------------------------------------------------------ the welcome plaza: one family of light, museum-style furniture
// screen stands (two slim legs, a thin ink bezel, the red rule on top), reading lecterns (a slim blade on a floor plate),
// and free-standing exhibition panels on twin legs. Laid out as an avenue: lecterns flank the spawn, screens face in from both
// sides, big panels stand along the plaza edges, and the walkway onto the bridge stays clear.
export const FRONT = {
  // the welcome film: the only screen out front, standing in the lake beside the bridge (right-hand side walking in), halfway to
  // the eye, turned to the plaza so you can watch from the platform's edge (gallery.json vids[0] sits in this stand)
  // (27 Oct, Ben) now HANGING in the first room, right over the main walkway past the bottom of the ramp: you see it through the
  // eye as you climb the ramp and walk under it; two-sided, on long cables from the roof
  film: { hang: true, x: -48, z: 0, y: 5.0, w: 7.2, h: 4.05, ceil: 23.8 },   // (s14: up 2.8 m, so it sits in the iris as you climb)
  // the learning screens stand back along the plaza's edges, facing in (gallery.json edu points match these)
  screens: [
    { x: -4.25, z: 12.9, img: 'TOOLS' },                                // Tools for the blind
    { x: -7.0, z: -12.0, img: 'ALLY_TIPS', k: 2, bottom: 0.6 },   // (z -12: the wide screen's turned end stays inside the rail)          // Tips to be loved by the blind (s23: twice the size, where blindness tip 2 stood)
    // (27 Oct, Ben) the BLINDNESS IS A SPECTRUM screen beside it is gone; the round vision-simulator spot in the plaza stays
    { x: -1.2, z: -12.6, img: null, yaw: 0, w: 4.2, h: 4.0, bottom: 0.6 },   // (s24) legs + red rule for the plaza's Six Views screen (gallery-simwall draws the film)
  ],
  panels: [
    // (s23, Ben) the south copy of the intro graphic is gone (a repeat; the north one stays); tip 2 took tip 1's place; tip 1
    // stands out in the park between the museum and the Academy of Music, just off the south walk, facing the walk
    { x: 0.6, z: 12.9, img: 'gallery/img/bcp_intro_virtualgallary_graphic_270129099.webp', w: 5.6, ar: 1.70 },
    { x: -8.6, z: 12.9, img: 'gallery/img/blindness_tip_final_02_270309764.webp', w: 4.6, ar: 1.72 },
    { x: 34.7, z: -20.4, face: [28.5, -21.0], img: 'gallery/img/blindness_tip_final_01_270309773.webp', w: 4.6, ar: 1.72 },   // (s33: forward, clear of the trees, right beside the south walk) (28 Oct, Ben: moved across the walk; PAINT TOGETHER took its old spot)
  ],
  lean: 0.35,                                                           // screens turn this much toward the arriving visitor (east)
};
const SPAWN_XZ = [3.6, 0];
export const faceYaw = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);   // yaw that turns local +z toward (tx, tz)

export function buildKiosks({ scene, resolveImg = u => u }) {
  const g = new THREE.Group(); scene.add(g); const col = []; let filmFrame = null;
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const loader = new THREE.TextureLoader();
  const art = { TOOLS, ALLY_TIPS };
  const box = (parent, w, h, d, m, x, y, z, collide) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); if (collide) col.push(b); return b; };
  // (29 Oct, Ben: visitors got behind the plaza signs and stuck) an invisible solid block filling the space BEHIND every screen
  // stand and panel, floor to top, a little wider than the sign: you can walk up to the front, never round the back. Rays (the
  // camera) see past it ('see'), so the view doesn't jump when you stand beside one.
  const blockBehind = (t, w, top, depth = 1.2) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, Math.max(2.2, top), depth)); b.visible = false; b.userData.see = true; b.userData.dyn = true;
    b.position.set(0, Math.max(2.2, top) / 2, 0.04 - depth / 2);   /* from just in front of the face (a fast step can't slip under the screen) to 1.2 m behind */ t.add(b); col.push(b); };
  const texMat = (src, base = 0x2b2928) => { const m = new THREE.MeshBasicMaterial({ color: base }); loader.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; m.map = t; m.color.set(0xffffff); m.needsUpdate = true; }); return m; };
  // facing: the screens look across the avenue, turned a little toward the visitor arriving from the spawn
  const inward = (z) => Math.atan2(FRONT.lean, -Math.sign(z));
  // a screen stand: legs to the floor, a slim foot rail, bezel + red rule; img = null leaves the face empty (a video box goes there)
  const stand = (x, z, yaw, w, h, bottom, img) => {
    const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = yaw; g.add(t);
    const lx = w / 2 - Math.min(0.45, w * 0.18);
    for (const s of [-1, 1]) box(t, 0.07, bottom + h * 0.55, 0.07, ink, s * lx, (bottom + h * 0.55) / 2, -0.09, true);   // legs
    box(t, lx * 2 + 0.07, 0.05, 0.07, ink, 0, 0.025, -0.09, false);                       // foot rail
    for (const s of [-1, 1]) box(t, 0.07, 0.04, 0.6, ink, s * lx, 0.02, -0.09, false);    // feet
    if (img) {
      box(t, w + 0.08, h + 0.08, 0.06, ink, 0, bottom + h / 2, -0.03, true);              // bezel / back
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), img === 'ALLY_TIPS' ? allyTipsMat() : texMat(art[img] || img)); scr.position.set(0, bottom + h / 2, 0.002); t.add(scr);
    }
    box(t, w + 0.08, 0.04, 0.08, red, 0, bottom + h + 0.06, -0.03, false);                // the red rule
    blockBehind(t, w, bottom + h + 0.1);
    return t;
  };
  // the welcome film, hanging: an ink frame round the two-sided screen (the film box from gallery.json sits inside it), a red rule
  // along the top, a slim header bar, and two cables up to the roof
  { const f = FRONT.film, t = new THREE.Group(); t.position.set(f.x, f.y, f.z); g.add(t);
    filmFrame = t;   // (Ben, 28 Oct) the game hides the frame, bar and cables with the film once you're past it (the eye stays clear)
    const W = f.w, H = f.h, D = 0.3, fr = 0.14;
    box(t, D, fr, W + fr * 2, ink, 0, H / 2 + fr / 2, 0, false); box(t, D, fr, W + fr * 2, ink, 0, -H / 2 - fr / 2, 0, false);
    box(t, D, H, fr, ink, 0, 0, W / 2 + fr / 2, false); box(t, D, H, fr, ink, 0, 0, -W / 2 - fr / 2, false);
    box(t, D + 0.02, 0.08, W + fr * 2 + 0.02, red, 0, H / 2 + fr + 0.04, 0, false);
    box(t, 0.1, 0.12, W * 0.8, ink, 0, H / 2 + fr + 0.5, 0, false);   // the hanging bar
    const steel = new THREE.MeshLambertMaterial({ color: 0x9a958e });
    for (const s of [-1, 1]) { const cz = s * W * 0.36; box(t, 0.025, 0.5, 0.025, steel, 0, H / 2 + fr + 0.27, cz, false); const len = f.ceil - (f.y + H / 2 + fr + 0.56); box(t, 0.025, len, 0.025, steel, 0, H / 2 + fr + 0.56 + len / 2, cz, false); } }
  filmFrame && filmFrame.traverse(o => { o.userData.dyn = true; });   // (kept out of the merge, so it can hide on its own)
  for (const k of FRONT.screens) stand(k.x, k.z, k.yaw ?? inward(k.z), k.w || 2.4 * (k.k || 1), k.h || 1.8 * (k.k || 1), k.bottom ?? 0.95, k.img);
  // (28 Oct, Ben) a LARGE Tips to be Loved by the Blind kiosk in the Vision Simulator room, on the south wall between the Diabetic
  // Retinopathy and Cataracts cards (the room floor is at -3.38)
  { const t = stand(-160.1, -21.25, 0, 6.0, 4.5, 0.35, 'ALLY_TIPS'); t.position.y = -3.38; }
  // (28 Oct, Ben) and a LARGE TOOLS FOR THE BLIND kiosk opposite, on the north wall between the Retinitis Pigmentosa + Glaucoma cards
  { const t = stand(-160.1, 20.85, Math.PI, 6.0, 4.5, 0.35, 'TOOLS'); t.position.y = -3.38; }
  // (27 Oct, Ben) the Stevie Wonder screens hang on walls like mounted TVs: a gallery-white wall behind each (floor to above the
  // screen, the screen's back flush on it), an ink mounting plate just inside the screen's edge, and a red rule along the top
  { const wallM = new THREE.MeshLambertMaterial({ color: 0xeceae6 }), FL = -3.38, X = -63.25, T = 0.32, top = 1.75;
    for (const s of [-1, 1]) { const z0 = 4.85, z1 = 11.45, zc = s * (z0 + z1) / 2, L = z1 - z0;
      box(g, T, top - FL, L, wallM, X - T / 2, (top + FL) / 2, zc, true);                           // the wall
      box(g, T + 0.04, 0.12, L + 0.04, ink, X - T / 2, FL + 0.06, zc, false);                     // an ink skirting
      box(g, T + 0.02, 0.06, L + 0.02, red, X - T / 2, top + 0.03, zc, false);                     // the red rule on top
      box(g, 0.04, 3.1, 5.4, ink, X + 0.02, -0.75, s * 8.13, false); } }                          // the mounting plate behind the screen
  // exhibition panels along the plaza edges (they replace the old boards that floated out past the rails)
  for (const pn of FRONT.panels) {
    const h = pn.w / pn.ar, bottom = 0.85, yaw = pn.face ? faceYaw(pn.x, pn.z, pn.face[0], pn.face[1]) : pn.z > 0 ? Math.PI : 0;
    const t = new THREE.Group(); t.position.set(pn.x, 0, pn.z); t.rotation.y = yaw; g.add(t);
    for (const s of [-1, 1]) box(t, 0.08, bottom + h, 0.08, ink, s * (pn.w / 2 - 0.3), (bottom + h) / 2, -0.08, true);
    for (const s of [-1, 1]) box(t, 0.08, 0.04, 0.7, ink, s * (pn.w / 2 - 0.3), 0.02, -0.08, false);
    box(t, pn.w + 0.1, h + 0.1, 0.06, ink, 0, bottom + h / 2, -0.035, true);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(pn.w, h), texMat(resolveImg(pn.img))); face.position.set(0, bottom + h / 2, 0.001); t.add(face);
    box(t, pn.w + 0.1, 0.045, 0.08, red, 0, bottom + h + 0.075, -0.035, false);
    blockBehind(t, pn.w, bottom + h + 0.1);
  }
  g.updateMatrixWorld(true);
  return { group: g, col, filmFrame };
}

// (27 Oct, Ben) TIPS TO BE LOVED BY THE BLIND: a new screen graphic, drawn in the gallery's card style (black ground, white type,
// red accents) with the six tips from the kiosk's Learn panel as big short lines. 4:3, the stand's 2.4 x 1.8 m screen.
function allyTipsMat() {
  const W = 1600, H = 1200, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const tips = [['Offer your elbow,', 'not your hand'], ['Paint a picture', 'with words'], ['Say hello', 'and goodbye'], ['Ask before', 'you touch'], ['Invite us', 'along'], ['Give us', 'a little time']];
  const heart = (x, y, s) => { c.beginPath(); c.moveTo(x, y + s * 0.3); c.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3); c.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.78, x, y + s); c.bezierCurveTo(x, y + s * 0.78, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3); c.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3); c.closePath(); };
  const draw = () => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, W, H); c.fillStyle = '#ec3013'; c.fillRect(0, 0, W, 22);
    const P = 84; c.textBaseline = 'alphabetic';
    c.fillStyle = '#ff9783'; c.font = `800 34px ${FONT}`; c.fillText('THE BLIND CANVAS PROJECT \u00b7 LEARN', P, 104);
    c.fillStyle = '#ffffff'; c.font = `800 112px ${FONT}`; c.fillText('TIPS TO BE', P, 236);
    c.fillStyle = '#ec3013'; c.fillText('LOVED', P, 352); const lw = c.measureText('LOVED ').width;
    c.fillStyle = '#ffffff'; c.fillText('BY THE BLIND', P + lw, 352);
    c.fillStyle = '#ec3013'; heart(W - P - 80, 112, 160); c.fill();
    c.fillStyle = '#f3f2f2'; c.fillRect(P, 404, W - P * 2, 6);
    const colW = (W - P * 2 - 60) / 2, rowH = 196;
    tips.forEach(([a, b], i) => { const x = P + (i % 2) * (colW + 60), y = 470 + Math.floor(i / 3 * 0) + (i >> 1) * rowH;
      c.fillStyle = '#ec3013'; c.font = `800 92px ${FONT}`; c.fillText(String(i + 1), x, y + 84);
      c.fillStyle = '#ffffff'; c.font = `800 60px ${FONT}`; c.fillText(a, x + 96, y + 50); c.fillStyle = '#e9e5e5'; c.font = `500 60px ${FONT}`; c.fillText(b, x + 96, y + 118); });
    c.fillStyle = '#ec3013'; c.fillRect(0, H - 92, W, 92); c.fillStyle = '#ffffff'; c.font = `800 44px ${FONT}`; c.fillText('WALK UP TO LEARN MORE \u00b7 READ ALOUD', P, H - 30);
  };
  draw();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { draw(); t.needsUpdate = true; });
  return new THREE.MeshBasicMaterial({ map: t });
}

// a reading lectern (local +z faces the reader): floor plate, slim blade, tilted top with a thin ink frame and the red rule
export function lectern(t, ink, red, col, faceTex, W = 1.42, H = 1.0) {
  const box = (w, h, d, m, x, y, z, parent = t) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); return b; };
  box(0.8, 0.03, 0.56, ink, 0, 0.015, -0.05);
  const blade = box(0.3, 0.92, 0.05, ink, 0, 0.49, -0.12); if (col) col.push(blade);
  const top = new THREE.Group(); top.position.set(0, 1.02, 0); top.rotation.x = -0.62; t.add(top);
  const fr = box(W + 0.08, H + 0.08, 0.05, ink, 0, 0, -0.03, top); if (col) col.push(fr);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: faceTex })); face.position.z = 0.0; top.add(face);
  box(W + 0.08, 0.035, 0.07, red, 0, H / 2 + 0.06, -0.03, top);
  return { top, face };
}

function howToTexture() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 720; const c = cv.getContext('2d');
  c.fillStyle = '#f9f8f6'; c.fillRect(0, 0, 1024, 720); c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, 14, 720);
  c.fillStyle = '#ec3013'; c.font = `800 28px ${FONT}`; c.fillText('WELCOME TO THE GALLERY', 52, 70);
  c.fillStyle = '#1d1c1b'; c.font = `800 74px ${FONT}`; c.fillText('How to move', 52, 152);
  c.fillRect(52, 182, 920, 4);
  const col = (x, head, rows) => {
    c.fillStyle = '#ec3013'; c.font = `800 26px ${FONT}`; c.fillText(head, x, 238);
    rows.forEach(([k, v], i) => { const y = 296 + i * 70; c.fillStyle = '#1d1c1b'; c.font = `800 30px ${FONT}`; c.fillText(k, x, y); c.fillStyle = '#5a5654'; c.font = `500 26px ${FONT}`; c.fillText(v, x, y + 32); });
  };
  col(52, 'ON A PHONE', [['Left thumb', 'joystick to walk'], ['Drag the screen', 'look around'], ['Pinch', 'zoom in and out'], ['Tap the red button', 'open the art near you']]);
  col(540, 'ON A COMPUTER', [['W A S D  or  arrows', 'walk  (Shift to run)'], ['Drag the mouse', 'look around'], ['Mouse wheel', 'zoom in and out'], ['E  ·  Esc', 'open the art  ·  close it']]);
  c.fillStyle = '#ec3013'; c.font = `800 22px ${FONT}`; c.fillText('☰  MENU: READ ALOUD, NIGHT MODE, FRIENDS AND MORE', 52, 676);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ------------------------------------------------------------ slim bio walls (gallery.json "bioWalls")
// The artists' bio boards used to sit on big 6.4 m x 6.6 m blocks with a black band, the portrait on the far side.
// Each block is carved out (its region is in the data) and replaced by a slim wall cut to the bio card: the card on
// the front, the square portrait and the artist's name on the back. Local +z faces the card's reader.
export function buildBioWalls({ scene, data }) {
  const g = new THREE.Group(); scene.add(g); const col = [];
  const white = new THREE.MeshLambertMaterial({ color: 0xf4f2ee }), ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const nameTex = (name, w, h) => {
    const K = 300, cv = document.createElement('canvas'); cv.width = Math.round(w * K); cv.height = Math.round(h * K); const x = cv.getContext('2d');
    x.fillStyle = '#1d1c1b'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#ec3013'; x.fillRect(0, 0, cv.width, 0.03 * K);
    let fs = 0.25 * K; x.font = `800 ${fs}px ${FONT}`; while (x.measureText(name).width > cv.width * 0.9 && fs > 40) { fs -= 4; x.font = `800 ${fs}px ${FONT}`; }
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, cv.width / 2, cv.height / 2 + 0.015 * K);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return lean(t);
  };
  for (const B of data.bioWalls || []) {
    const [nx, nz] = B.n, H = B.top - B.bottom, T = B.t, W = B.w;
    const t = new THREE.Group(); t.position.set(B.c[0] - nx * (0.02 + T / 2), B.bottom, B.c[2] - nz * (0.02 + T / 2)); t.rotation.y = Math.atan2(nx, nz); g.add(t);
    const box = (w, h, d, m, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(0, y, 0); t.add(b); return b; };
    col.push(box(W, H - 0.16, T, white, 0.11 + (H - 0.16) / 2));   // the wall, standing on a dark recessed base
    box(W - 0.08, 0.11, T - 0.08, ink, 0.055);                        // shadow-gap base, so it looks like it floats
    box(W + 0.02, 0.05, T + 0.02, ink, H - 0.025);                    // thin ink cap
    // the name, on the back above the portrait
    const by = B.floorBack - B.bottom + 0.5 + B.ps + 0.32, bw = B.ps, bh = 0.4;
    const band = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshBasicMaterial({ map: nameTex(B.name.replace(/&amp;/g, '&'), bw, bh) }));
    band.position.set(0, by, -T / 2 - 0.004); band.rotation.y = Math.PI; t.add(band);
  }
  g.updateMatrixWorld(true);
  return { group: g, col };
}
