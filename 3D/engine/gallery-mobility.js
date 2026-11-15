// THE MOBILITY COURSE BUILDING (13 Nov 2026, Ben): Design's Ora-VNC™ mobility course room (../gamefox/mobility-course.js), standing on the lawn between
// the Academy of Music and BLIND CAN Cinema. Outside: an ink block with corner pillars of stacked foam cubes (the course's own red, yellow, green + blue),
// a band of white jigsaw foam tiles round its foot, a red canopy over the door and the sign ORA-VNC™ MOBILITY COURSE. A path of the same white tiles runs
// from the east walk to the door: follow the white path. Inside: the course room itself (10 x 6 m), its door in the short wall that faces the walk.
//   const mob = await buildMobility({ THREE, scene, ground, RES });
//   mob.col → solid meshes (the walls round the door, the pillars) · mob.course → the course · mob.inRoom(x, z) → standing inside the room
import { MOBILITY } from './gallery-garden-plan.js';

export async function buildMobility({ THREE, scene, ground = () => 0, RES = u => u }) {
  const { setupMobilityCourse } = await import('../gamefox/mobility-course.js');
  const M = MOBILITY, Y = ground(M.x, M.z), INK = '#1d1c1b', RED = '#ec3013', WHITE = '#f3f2f2', FOAM = ['#f2cf1c', '#2fa24a', '#1c82d6', '#dc2a22'];
  const route = 1 + Math.floor(Math.random() * 12);   // a different version of the course on each visit (the real course has several, so nobody learns one)
  const FY = 0.05;   // the course's floor stands a little above the lawn, so no grass shows through it
  const course = setupMobilityCourse({ THREE, scene, at: { x: M.x, z: M.z }, y: Y + FY, face: -Math.PI / 2, setup: 'weave', level: 1, route });
  const root = new THREE.Group(); root.position.y = Y; scene.add(root); const col = [];
  const cv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), flat = c => new THREE.MeshBasicMaterial({ color: c });
  const box = (w, h, d, m, x, y, z, solid = true, ry = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.y = ry; root.add(b); if (solid) { b.updateMatrixWorld(true); col.push(b); } return b; };
  const plane = (w, h, m, x, y, z, ry = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; root.add(p); return p; };
  const teeth = (g, x0, y0, len, dir, p, d, col) => { g.fillStyle = col; for (let q = 0; q < len / (2 * p); q++) { const a = (2 * q + 0.5) * p; if (dir === 'up') g.fillRect(x0 + a, y0 - d, p, d + 1); else g.fillRect(x0 + a, y0 - 1, p, d + 1); } };

  // ---- the shell: walls 4 m high round the room (the room's own walls stand just inside), a door 1.4 m wide in the north wall ----
  const H = 4.0, T = 0.3, X0 = M.x0, X1 = M.x1, Z0 = M.z0, Z1 = M.z1, DW = 1.4, DH = 2.3, cx = M.x, cz = (Z0 + Z1) / 2;
  const inkM = lam('#232120');
  { const f = box(X1 - X0 - 2 * T, 0.12, Z1 - Z0 - 2 * T, inkM, cx, FY - 0.06, cz); f.visible = false; }   // the floor you walk on (solid, out of sight under the course's own floor)
  box(T, H, Z1 - Z0, inkM, X0 + T / 2, H / 2, cz); box(T, H, Z1 - Z0, inkM, X1 - T / 2, H / 2, cz); box(X1 - X0, H, T, inkM, cx, H / 2, Z0 + T / 2);
  const sideW = (X1 - X0 - DW) / 2; box(sideW, H, T, inkM, X0 + sideW / 2, H / 2, Z1 - T / 2); box(sideW, H, T, inkM, X1 - sideW / 2, H / 2, Z1 - T / 2); box(DW, H - DH, T, inkM, cx, DH + (H - DH) / 2, Z1 - T / 2);
  box(DW, 0.06, T + 0.02, flat(RED), cx, DH + 0.03, Z1 - T / 2, false);   // a red rule along the top of the doorway
  box(X1 - X0 + 0.1, 0.16, Z1 - Z0 + 0.1, inkM, cx, H + 0.08, cz, false); box(X1 - X0 + 0.14, 0.1, Z1 - Z0 + 0.14, flat(RED), cx, H + 0.21, cz, false);   // the roof + its red rim
  // ---- a band of white foam tiles round the foot (jigsaw teeth along the top edge) ----
  const bandT = cv(512, 128, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f2ec'; g.fillRect(0, 40, w, h - 40); teeth(g, 0, 41, w, 'up', w / 24, 12, '#f4f2ec');
    g.strokeStyle = 'rgba(40,38,36,.45)'; g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 40); g.lineTo(i * w / 4, h); g.stroke(); } });
  bandT.wrapS = THREE.RepeatWrapping;
  const band = (len, x, z, ry) => { const t = bandT.clone(); t.needsUpdate = true; t.repeat.set(len / 2.4, 1); plane(len, 0.72, new THREE.MeshBasicMaterial({ map: t }), x, 0.36, z, ry); };
  band(X1 - X0, cx, Z0 - 0.005, Math.PI); band(Z1 - Z0, X0 - 0.005, cz, -Math.PI / 2); band(Z1 - Z0, X1 + 0.005, cz, Math.PI / 2); band(sideW, X0 + sideW / 2, Z1 + 0.005, 0); band(sideW, X1 - sideW / 2, Z1 + 0.005, 0);
  // ---- the corner pillars: foam cubes stacked to the roof, every other one turned ----
  const foamM = FOAM.map(c => new THREE.MeshLambertMaterial({ map: cv(128, 128, (g, w) => { g.fillStyle = c; g.fillRect(0, 0, w, w); g.strokeStyle = 'rgba(0,0,0,.38)'; g.lineWidth = 3; for (let e = 0; e < 4; e++) { g.save(); g.translate(64, 64); g.rotate(e * Math.PI / 2); g.translate(-64, -64); g.beginPath(); for (let q = 0; q < 8; q++) { const y = q % 2 ? 13 : 5; if (q) g.lineTo(q * 16, y); else g.moveTo(0, y); g.lineTo((q + 1) * 16, y); } g.stroke(); g.restore(); } }) }));
  const cubeG = new THREE.BoxGeometry(0.62, 0.62, 0.62); let k = 0;
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(cubeG, foamM[(k++) % 4]); c.position.set(x, 0.31 + i * 0.62, z); c.rotation.y = i % 2 ? 0.35 : 0; root.add(c); if (i < 3) { c.updateMatrixWorld(true); col.push(c); } }
  // ---- the canopy + the sign over the door ----
  box(2.6, 0.12, 1.2, flat(RED), cx, DH + 0.12, Z1 + 0.6, false);
  const drawSign = (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.fillRect(36, 34, 150, 10);
    g.font = '800 46px Archivo, Arial, sans-serif'; g.fillText('ORA-VNC™', 36, 100); g.fillStyle = WHITE; let fs = 140; do { g.font = '800 ' + fs + 'px Archivo, Arial, sans-serif'; fs -= 4; } while (g.measureText('MOBILITY COURSE').width > w - 72 && fs > 40); g.fillText('MOBILITY COURSE', 32, 222);
    g.font = '600 34px Archivo, Arial, sans-serif'; g.fillStyle = '#ff9783'; g.fillText('VISUAL NAVIGATION CHALLENGE · STEP IN AND WALK IT', 36, 276); };
  const signT = cv(1024, 300, drawSign), SW = 5.0, SH = SW * 300 / 1024; plane(SW, SH, new THREE.MeshBasicMaterial({ map: signT }), cx, DH + 0.22 + SH / 2, Z1 + 0.02);
  if (document.fonts && document.fonts.load) document.fonts.load('800 80px Archivo').then(() => { const c = signT.image; drawSign(c.getContext('2d'), c.width, c.height); signT.needsUpdate = true; }).catch(() => {});   // redrawn once Archivo is in
  // the logos beside the door: Ora (who made the course) and the Blind Canvas Project
  const logo = (url, w, h, x) => { const m = new THREE.MeshBasicMaterial({ color: INK }); plane(w + 0.12, h + 0.12, flat(INK), x, 1.55, Z1 + 0.012); const p = plane(w, h, m, x, 1.55, Z1 + 0.02); new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.color.set('#ffffff'); m.needsUpdate = true; }); };
  logo(RES('gallery/img/ora_card_16x9_black_269773142.webp'), 1.25, 0.7, cx - 1.75); logo(RES('gallery/img/bcp_logo_white.webp'), 0.8, 0.8, cx + 1.75);
  // ---- inside: the room's wall that faces the walk gets the doorway ----
  { let w = null; course.group.traverse(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 6 && Math.abs(o.position.x - 5) < 0.01) w = o; });
    if (w) { const m = w.material, CH = 2.7, pw = (6 - DW) / 2; w.visible = false;
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, CH), m); p.position.set(5, CH / 2, s * (DW / 2 + pw / 2)); p.rotation.y = -Math.PI / 2; course.group.add(p); }
      const l = new THREE.Mesh(new THREE.PlaneGeometry(DW, CH - DH), m); l.position.set(5, DH + (CH - DH) / 2, 0); l.rotation.y = -Math.PI / 2; course.group.add(l); } }
  // ---- follow the white path: foam tiles from the east walk to the door, a flat yellow tile on the way, cubes beside it ----
  { const P = M.path, L = P.z1 - P.z0, tt = cv(256, 128, (g, w, h) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,38,36,.5)'; g.lineWidth = 2;
      g.beginPath(); for (let q = 0; q < 12; q++) { const x0 = 128 + (q % 2 ? 4 : -4); g.moveTo(x0, q * h / 12); g.lineTo(x0, (q + 1) * h / 12); } g.stroke(); g.beginPath(); for (let q = 0; q < 24; q++) { const y0 = q % 2 ? 4 : 0; g.moveTo(q * w / 24, y0); g.lineTo((q + 1) * w / 24, y0); } g.stroke(); });
    tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(1, L / 0.6);
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(P.w, L), new THREE.MeshLambertMaterial({ map: tt, polygonOffset: true, polygonOffsetFactor: -2 })); pm.rotation.x = -Math.PI / 2; pm.position.set(P.x, 0.025, (P.z0 + P.z1) / 2); root.add(pm);
    const yl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshLambertMaterial({ color: FOAM[0], polygonOffset: true, polygonOffsetFactor: -3 })); yl.rotation.x = -Math.PI / 2; yl.position.set(P.x + 0.3, 0.03, -9.4); root.add(yl);
    for (const [x, z, y, c, ry] of [[P.x + 1.3, -15.2, 0.31, 3, 0.4], [P.x - 1.25, -12.6, 0.31, 2, 0], [P.x - 1.25, -12.6, 0.93, 1, 0.5], [P.x + 1.2, -7.2, 0.31, 0, 0.2]]) { const c2 = new THREE.Mesh(cubeG, foamM[c]); c2.position.set(x, y, z); c2.rotation.y = ry; root.add(c2); c2.updateMatrixWorld(true); col.push(c2); } }
  root.updateMatrixWorld(true);
  // standing inside the room (10 x 6 m; in the world it runs north–south: x 59.5..65.5, z -28..-18)
  const inRoom = (x, z, m = 0) => x > M.x - 3 + m && x < M.x + 3 - m && z > M.z - 5 + m && z < M.z + 5 - m;
  return { col, course, root, inRoom, door: new THREE.Vector3(cx, Y, Z1 + 1.2), y: Y + FY };
}
