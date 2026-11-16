// THE MOBILITY COURSE BUILDING (13 Nov 2026, Ben): Design's Ora-VNC™ mobility course room (../gamefox/mobility-course.js), standing on the lawn between
// the Academy of Music and BLIND CAN Cinema. Outside: an ink block with corner pillars of stacked foam cubes (the course's own red, yellow, green + blue),
// a band of white jigsaw foam tiles round its foot, a red canopy over the door and the sign ORA-VNC™ MOBILITY COURSE. A path of the same white tiles runs
// from the east walk to the door: follow the white path.
// (15 Nov, Ben) moved back off the ring path · a LOBBY (6 x 3.6 m) between the door and the course: room to walk in, the course's film on the left wall,
// ABOUT THE COURSE on the right wall, HOW TO WALK IT beside the door; the course's own front wall is gone, so its whole 6 m width opens off the lobby
// (the START pad no longer sits behind a doorway full of cubes) · the shell stands 0.15 m clear of the room's walls and every sign / tile band is
// lifted off its wall with a depth offset: no more flickering walls.
//   const mob = await buildMobility({ THREE, scene, ground, RES });
//   mob.col → solid meshes · mob.course → the course · mob.inRoom(x, z, m) → in the course room · mob.inLobby(x, z) · mob.screen → the film screen (a gallery video screen)
import { MOBILITY } from './gallery-garden-plan.js';
// (15 Nov, Ben) turned 90° and moved north of the cinema, its door facing west like the cinema's: everything is built in the building's OWN frame
// (the room's centre at 0, 0; the door towards +z) inside a group turned by MOBILITY.rot; the course itself is turned to match

export const FILM = { vimeo: 'https://player.vimeo.com/video/936308338', file: 'video/ora_vnc_course.mp4' };   // Ora's film of the course (on oraclinical.com); the .mp4, when it is in gallery/video/, plays on the lobby wall

export async function buildMobility({ THREE, scene, ground = () => 0, RES = u => u }) {
  const { setupMobilityCourse } = await import('../gamefox/mobility-course.js');
  const M = MOBILITY, Y = ground(M.x, M.z), INK = '#1d1c1b', RED = '#ec3013', WHITE = '#f3f2f2', FOAM = ['#f2cf1c', '#2fa24a', '#1c82d6', '#dc2a22'];
  const route = 1 + Math.floor(Math.random() * 12);   // a different version of the course on each visit (the real course has several, so nobody learns one)
  const FY = 0.05;   // the course's floor stands a little above the lawn, so no grass shows through it
  const ROT = M.rot || 0, course = setupMobilityCourse({ THREE, scene, at: { x: M.x, z: M.z }, y: Y + FY, face: -Math.PI / 2 + ROT, setup: 'weave', level: 1, route });
  const root = new THREE.Group(); root.position.set(M.x, Y, M.z); root.rotation.y = ROT; scene.add(root); root.updateMatrixWorld(true); const col = [];
  const wr = new THREE.Group(); wr.position.y = Y; scene.add(wr);   // the outside path, in world coordinates
  const cv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), flat = c => new THREE.MeshBasicMaterial({ color: c });
  const lift = (m, f = -2) => { m.polygonOffset = true; m.polygonOffsetFactor = f; m.polygonOffsetUnits = f * 2; return m; };   // drawn over the wall it lies on, at any distance
  const box = (w, h, d, m, x, y, z, solid = true, ry = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.y = ry; root.add(b); if (solid) { b.updateMatrixWorld(true); col.push(b); } return b; };
  const plane = (w, h, m, x, y, z, ry = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; root.add(p); return p; };
  const teeth = (g, x0, y0, len, dir, p, d, col) => { g.fillStyle = col; for (let q = 0; q < len / (2 * p); q++) { const a = (2 * q + 0.5) * p; if (dir === 'up') g.fillRect(x0 + a, y0 - d, p, d + 1); else g.fillRect(x0 + a, y0 - 1, p, d + 1); } };
  const fontsIn = f => { if (document.fonts && document.fonts.load) document.fonts.load('800 80px Archivo').then(f).catch(() => {}); };

  // ---- the shell: walls 4 m high, a door 1.8 m wide in the front wall (it faces the walk) ----
  const H = 4.0, T = 0.3, G = M.gap || 0.15, X0 = -3 - G - T, X1 = 3 + G + T, Z0 = -5 - G - T, Z1 = 5 + (M.lobby || 3.6) + T, DW = 1.8, DH = 2.4, cx = 0, cz = (Z0 + Z1) / 2;
  const RZ = 5, LZ = Z1 - T, IX0 = -3, IX1 = 3, CH = 2.7;   // the room's front edge · the lobby's front (inside) · the lobby's side walls (in line with the room's)
  const inkM = lam('#232120');
  { const f = box(X1 - X0 - 2 * T, 0.12, Z1 - Z0 - 2 * T, inkM, cx, FY - 0.06, cz); f.visible = false; }   // the floor you walk on (solid, out of sight under the floors)
  box(T, H, Z1 - Z0, inkM, X0 + T / 2, H / 2, cz); box(T, H, Z1 - Z0, inkM, X1 - T / 2, H / 2, cz); box(X1 - X0, H, T, inkM, cx, H / 2, Z0 + T / 2);
  const sideW = (X1 - X0 - DW) / 2; box(sideW, H, T, inkM, X0 + sideW / 2, H / 2, Z1 - T / 2); box(sideW, H, T, inkM, X1 - sideW / 2, H / 2, Z1 - T / 2); box(DW, H - DH, T, inkM, cx, DH + (H - DH) / 2, Z1 - T / 2);
  box(DW, 0.06, T + 0.02, flat(RED), cx, DH + 0.03, Z1 - T / 2, false);   // a red rule along the top of the doorway
  box(X1 - X0 + 0.1, 0.16, Z1 - Z0 + 0.1, inkM, cx, H + 0.08, cz, false); box(X1 - X0 + 0.14, 0.1, Z1 - Z0 + 0.14, flat(RED), cx, H + 0.215, cz, false);   // the roof + its red rim
  // ---- a band of white foam tiles round the foot (jigsaw teeth along the top edge) ----
  const bandT = cv(512, 128, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f2ec'; g.fillRect(0, 40, w, h - 40); teeth(g, 0, 41, w, 'up', w / 24, 12, '#f4f2ec');
    g.strokeStyle = 'rgba(40,38,36,.45)'; g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 40); g.lineTo(i * w / 4, h); g.stroke(); } });
  bandT.wrapS = THREE.RepeatWrapping;
  const band = (len, x, z, ry) => { const t = bandT.clone(); t.needsUpdate = true; t.repeat.set(len / 2.4, 1); plane(len, 0.72, lift(new THREE.MeshBasicMaterial({ map: t })), x, 0.36, z, ry); };
  const o = 0.02; band(X1 - X0, cx, Z0 - o, Math.PI); band(Z1 - Z0, X0 - o, cz, -Math.PI / 2); band(Z1 - Z0, X1 + o, cz, Math.PI / 2); band(sideW, X0 + sideW / 2, Z1 + o, 0); band(sideW, X1 - sideW / 2, Z1 + o, 0);
  // ---- the corner pillars: foam cubes stacked to the roof, every other one turned ----
  const foamM = FOAM.map(c => new THREE.MeshLambertMaterial({ map: cv(128, 128, (g, w) => { g.fillStyle = c; g.fillRect(0, 0, w, w); g.strokeStyle = 'rgba(0,0,0,.38)'; g.lineWidth = 3; for (let e = 0; e < 4; e++) { g.save(); g.translate(64, 64); g.rotate(e * Math.PI / 2); g.translate(-64, -64); g.beginPath(); for (let q = 0; q < 8; q++) { const y = q % 2 ? 13 : 5; if (q) g.lineTo(q * 16, y); else g.moveTo(0, y); g.lineTo((q + 1) * 16, y); } g.stroke(); g.restore(); } }) }));
  const cubeG = new THREE.BoxGeometry(0.62, 0.62, 0.62); let k = 0;
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(cubeG, foamM[(k++) % 4]); c.position.set(x, 0.31 + i * 0.62, z); c.rotation.y = i % 2 ? 0.35 : 0; root.add(c); if (i < 3) { c.updateMatrixWorld(true); col.push(c); } }
  // ---- the canopy + the sign over the door ----
  box(2.8, 0.12, 1.2, flat(RED), cx, DH + 0.12, Z1 + 0.6, false);
  const drawSign = (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.fillRect(36, 34, 150, 10);
    g.font = '800 46px Archivo, Arial, sans-serif'; g.fillText('ORA-VNC™', 36, 100); g.fillStyle = WHITE; let fs = 140; do { g.font = '800 ' + fs + 'px Archivo, Arial, sans-serif'; fs -= 4; } while (g.measureText('MOBILITY COURSE').width > w - 72 && fs > 40); g.fillText('MOBILITY COURSE', 32, 222);
    g.font = '600 34px Archivo, Arial, sans-serif'; g.fillStyle = '#ff9783'; g.fillText('VISUAL NAVIGATION CHALLENGE · STEP IN AND WALK IT', 36, 276); };
  const signT = cv(1024, 300, drawSign), SW = 5.0, SH = SW * 300 / 1024; plane(SW, SH, lift(new THREE.MeshBasicMaterial({ map: signT })), cx, DH + 0.24 + SH / 2, Z1 + 0.03);
  fontsIn(() => { const c = signT.image; drawSign(c.getContext('2d'), c.width, c.height); signT.needsUpdate = true; });   // redrawn once Archivo is in
  // the logos beside the door: Ora (who made the course) and the Blind Canvas Project
  const logo = (url, w, h, x, y = 1.55, z = Z1 + 0.03, ry = 0) => { const m = lift(new THREE.MeshBasicMaterial({ color: INK }), -3); plane(w + 0.12, h + 0.12, lift(flat(INK)), x, y, z, ry); const p = plane(w, h, m, x, y, z + (ry ? 0 : 0.002), ry); new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.color.set('#ffffff'); m.transparent = true; m.alphaTest = 0.04; m.needsUpdate = true;   /* (a white logo on clear: its clear parts show the ink card, not a white square) */ }); return p; };
  logo(RES('gallery/img/ora_card_16x9_black_269773142.webp'), 1.25, 0.7, cx - 1.95); logo(RES('gallery/img/bcp_logo_white.webp'), 0.8, 0.8, cx + 1.95);

  // ---- inside: the course room's front wall comes out, so the room opens off the lobby along its whole width ----
  { let w = null; course.group.traverse(q => { if (q.isMesh && q.geometry.type === 'PlaneGeometry' && q.geometry.parameters.width === 6 && Math.abs(q.position.x - 5) < 0.01) w = q; }); if (w) w.visible = false;
    const lip = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.5), new THREE.MeshLambertMaterial({ color: '#dedbd4', side: THREE.DoubleSide })); lip.position.set(5, CH - 0.25, 0); lip.rotation.y = -Math.PI / 2; course.group.add(lip); }   // a header over the opening, under the room's ceiling
  // ---- THE LOBBY: pale walls like the room's, a dark floor, a ceiling at the room's height with light panels ----
  const LD = LZ - RZ, LC = (RZ + LZ) / 2, paleM = lam('#dedbd4');
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(IX1 - IX0 + 0.3, LD), lam('#2b2a29')); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, FY, LC); root.add(fl);
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(IX1 - IX0 + 0.3, LD + 0.02), lam('#d6d4cf')); ce.rotation.x = Math.PI / 2; ce.position.set(cx, CH + FY, LC); root.add(ce);
    for (const x of [cx - 1.6, cx + 1.6]) { const lp = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), lift(flat('#ffffff'))); lp.rotation.x = Math.PI / 2; lp.position.set(x, CH + FY - 0.005, LC); root.add(lp); }
    plane(LD, CH, paleM, IX0, FY + CH / 2, LC, Math.PI / 2); plane(LD, CH, paleM, IX1, FY + CH / 2, LC, -Math.PI / 2);   // side walls, in line with the room's (the shell is 0.15 m behind them)
    const fw = (IX1 - IX0 - DW) / 2; for (const s of [-1, 1]) plane(fw, CH, paleM, cx + s * (DW / 2 + fw / 2), FY + CH / 2, LZ - 0.06, Math.PI); plane(DW, CH - DH, paleM, cx, FY + DH + (CH - DH) / 2, LZ - 0.06, Math.PI);   // the front wall round the door
    const dk = new THREE.Mesh(new THREE.PlaneGeometry(IX1 - IX0 + 0.3, 0.12), lift(lam('#3a3836'))); dk.rotation.x = -Math.PI / 2; dk.position.set(cx, FY + 0.003, RZ + 0.06); root.add(dk); }   // a dark line on the floor where the course begins
  // a wall panel: ink card, red rule, title + text (wrapped), drawn again once Archivo is in
  const wrap = (g, text, maxW) => { const out = []; for (const para of text.split('\n')) { let line = ''; for (const wd of para.split(' ')) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > maxW && line) { out.push(line); line = wd; } else line = t; } out.push(line); } return out; };
  const panel = (w, h, x, y, z, ry, draw) => { const K = 300, t = cv(Math.round(w * K), Math.round(h * K), (g, W, Hh) => draw(g, W, Hh)); fontsIn(() => { draw(t.image.getContext('2d'), t.image.width, t.image.height); t.needsUpdate = true; }); return plane(w, h, lift(new THREE.MeshBasicMaterial({ map: t })), x, y, z, ry); };
  const card = (title, kicker, rows, foot) => (g, W, Hh) => { g.fillStyle = INK; g.fillRect(0, 0, W, Hh); g.fillStyle = RED; g.fillRect(40, 40, 140, 10); g.textBaseline = 'alphabetic';
    g.fillStyle = '#ff9783'; g.font = '800 28px Archivo, Arial, sans-serif'; g.fillText(kicker, 40, 92); g.fillStyle = WHITE; let ts = 64; do { g.font = '800 ' + ts + 'px Archivo, Arial, sans-serif'; ts -= 2; } while (g.measureText(title).width > W - 80 && ts > 30); g.fillText(title, 38, 156);
    g.font = '600 22px Archivo, Arial, sans-serif'; const fl = foot ? wrap(g, foot, W - 80) : [], footTop = foot ? Hh - 30 - fl.length * 28 : Hh - 30;
    let s = 32; const fit = sz => { let yy = 206; for (const [, txt] of rows) { g.font = '500 ' + sz + 'px Archivo, Arial, sans-serif'; yy += sz * 1.35 + wrap(g, txt, W - 80).length * sz * 1.28 + sz * 0.5; } return yy; };
    while (s > 16 && fit(s) > footTop - 10) s -= 1;   // the text is fitted to the card
    let yy = 206; for (const [b, txt] of rows) { g.font = '800 ' + Math.round(s * 1.02) + 'px Archivo, Arial, sans-serif'; g.fillStyle = '#ffd23a'; g.fillText(b, 40, yy + s); yy += s * 1.35; g.font = '500 ' + s + 'px Archivo, Arial, sans-serif'; g.fillStyle = WHITE; for (const l of wrap(g, txt, W - 80)) { g.fillText(l, 40, yy + s); yy += s * 1.28; } yy += s * 0.5; }
    if (foot) { g.font = '600 22px Archivo, Arial, sans-serif'; g.fillStyle = '#b9b4ac'; let fy = footTop + 22; for (const l of fl) { g.fillText(l, 40, fy); fy += 28; } } };
  // ABOUT THE COURSE (the right-hand wall as you come in), from Ora's three pages (MOBILITY_COURSE_FACTS.md); the button on screen opens the full ABOUT page
  panel(3.3, 2.3, IX1 - 0.012, FY + 1.42, LC, -Math.PI / 2, card('ABOUT THE COURSE', 'ORA-VNC™ · VISUAL NAVIGATION CHALLENGE', [
    ['WHAT IT IS', 'Ora designed this mobility course to measure how well people with inherited retinal diseases find their way through a space, and whether a new treatment helps them do it better.'],
    ['WHERE IT IS USED', 'In 20+ clinical trials of gene and cell therapies. The FDA accepts it as a primary endpoint in the United States.'],
    ['NO ONE COURSE FITS ALL', 'Central loss (LHON), light perception only (LCA), side vision loss (RP): the course is set up for each kind of sight loss and each level of severity, in several versions so nobody learns one by heart.'],
    ['HOW IT IS SCORED', 'Every walk is filmed and scored by certified, masked graders at an independent reading center.']],
    'Sources: Ora Clinical. This room is our stand-in: its size, light steps and layouts are ours. Tap ABOUT THIS COURSE (top left) for the full page.'));
  // HOW TO WALK IT (on the front wall, left of the door as you come in)
  const fw = (IX1 - IX0 - DW) / 2;
  panel(fw - 0.3, 1.9, cx + (DW / 2 + fw / 2), FY + 1.45, LZ - 0.08, Math.PI, card('WALK IT', 'HOW THE COURSE WORKS', [
    ['1 · START', 'Step on the START pad. The clock starts.'], ['2 · FOLLOW', 'Keep to the white tiles all the way to END.'], ['3 · FAULTS', 'Touching a cube or stepping off the tiles is a fault.']],
    'Pass here: 3 faults or fewer in 3 minutes (our stand-in).'));
  logo(RES('gallery/img/ora_card_16x9_black_269773142.webp'), 1.1, 0.62, cx - (DW / 2 + fw / 2), FY + 1.6, LZ - 0.08, Math.PI);
  // THE FILM (the left-hand wall): Ora's film of the course. A gallery video screen: it plays (with sound) while you're in the lobby or the course, once the .mp4 is in place
  const posT = cv(960, 540, (g, W, Hh) => { g.fillStyle = INK; g.fillRect(0, 0, W, Hh); g.fillStyle = RED; g.fillRect(48, 70, 120, 10); g.font = '800 38px Archivo, Arial, sans-serif'; g.fillText('ORA-VNC™', 48, 136);
    g.fillStyle = WHITE; g.font = '800 92px Archivo, Arial, sans-serif'; g.fillText('THE FILM', 44, 236); g.font = '600 34px Archivo, Arial, sans-serif'; g.fillStyle = '#ff9783'; g.fillText('The mobility course, from Ora', 48, 292);
    g.fillStyle = WHITE; g.beginPath(); g.moveTo(W - 230, Hh / 2 - 70); g.lineTo(W - 110, Hh / 2); g.lineTo(W - 230, Hh / 2 + 70); g.closePath(); g.fill(); g.font = '800 30px Archivo, Arial, sans-serif'; g.fillText('TAP  WATCH THE FILM', 48, Hh - 60); });
  fontsIn(() => {});
  const posterMat = new THREE.MeshBasicMaterial({ map: posT }), dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
  const scrW = 3.0, scrH = scrW * 9 / 16, scr = new THREE.Mesh(new THREE.BoxGeometry(scrW, scrH, 0.04), [dark, dark, dark, dark, dark, posterMat]);
  scr.position.set(IX0 + 0.04, FY + 1.55, LC); scr.rotation.y = -Math.PI / 2;   /* its -z face (the picture) turned to face into the lobby */ scr.userData.dyn = true; root.add(scr); scr.updateMatrixWorld(true);
  { const fr = new THREE.Mesh(new THREE.BoxGeometry(0.03, scrH + 0.14, scrW + 0.14), flat(INK)); fr.position.set(IX0 + 0.016, FY + 1.55, LC); root.add(fr); }
  const zone = new THREE.Box3(); for (const [x, y, z] of [[IX0 - 0.2, -1, -5.2], [IX1 + 0.2, 6, LZ + 0.4]]) for (const xx of [x, x === IX0 - 0.2 ? IX1 + 0.2 : IX0 - 0.2]) zone.expandByPoint(root.localToWorld(new THREE.Vector3(xx, y, z)));   // (world box round the lobby + the room)
  zone.expandByPoint(root.localToWorld(new THREE.Vector3(IX0 - 0.2, 6, LZ + 0.4))); zone.expandByPoint(root.localToWorld(new THREE.Vector3(IX1 + 0.2, -1, -5.2)));

  // ---- follow the white path: foam tiles from the door to the cinema's forecourt (world coordinates), a flat yellow tile on the way, cubes beside it ----
  { const P = M.path, tt = cv(256, 128, (g, w, h) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,38,36,.5)'; g.lineWidth = 2;
      g.beginPath(); for (let q = 0; q < 12; q++) { const x0 = 128 + (q % 2 ? 4 : -4); g.moveTo(x0, q * h / 12); g.lineTo(x0, (q + 1) * h / 12); } g.stroke(); g.beginPath(); for (let q = 0; q < 24; q++) { const y0 = q % 2 ? 4 : 0; g.moveTo(q * w / 24, y0); g.lineTo((q + 1) * w / 24, y0); } g.stroke(); });
    tt.wrapT = THREE.RepeatWrapping;
    for (let i = 0; i < P.pts.length - 1; i++) { const [ax, az] = P.pts[i], [bx, bz] = P.pts[i + 1], L = Math.hypot(bx - ax, bz - az) + (i ? P.w : 0), t = tt.clone(); t.needsUpdate = true; t.repeat.set(1, L / 0.6);
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(P.w, L), new THREE.MeshLambertMaterial({ map: t, polygonOffset: true, polygonOffsetFactor: -2 - i, polygonOffsetUnits: -4 - 2 * i })); pm.rotation.order = 'YXZ'; pm.rotation.y = Math.atan2(bx - ax, bz - az); pm.rotation.x = -Math.PI / 2;
      pm.position.set((ax + bx) / 2, 0.03 + i * 0.002, (az + bz) / 2); wr.add(pm); }
    const at = (k, d, side) => { const [ax, az] = P.pts[k], [bx, bz] = P.pts[k + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L; return [ax + ux * d - uz * side, az + uz * d + ux * side]; };   // a point d along leg k, side metres to its right
    { const [x, z] = at(0, 2.6, 0.3), yl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshLambertMaterial({ color: FOAM[0], polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 })); yl.rotation.x = -Math.PI / 2; yl.position.set(x, 0.04, z); wr.add(yl); }
    for (const [kk, d, sd, y, c, ry] of [[0, 1.2, 1.3, 0.31, 3, 0.4], [0, 4.0, -1.25, 0.31, 2, 0], [0, 4.0, -1.25, 0.93, 1, 0.5], [1, 5.5, 1.2, 0.31, 0, 0.2]]) { const [x, z] = at(kk, d, sd), c2 = new THREE.Mesh(cubeG, foamM[c]); c2.position.set(x, y, z); c2.rotation.y = ry; wr.add(c2); c2.updateMatrixWorld(true); col.push(c2); } }
  root.updateMatrixWorld(true);
  // standing in the course room (10 x 6 m; in the world it runs north–south) · in the lobby
  const cR = Math.cos(ROT), sR = Math.sin(ROT), loc = (x, z) => { const dx = x - M.x, dz = z - M.z; return [dx * cR - dz * sR, dx * sR + dz * cR]; };   // world → the building's own frame
  const inRoom = (x, z, m = 0) => { const [u, v] = loc(x, z); return u > -3 + m && u < 3 - m && v > -5 + m && v < 5 - m; };
  const inLobby = (x, z) => { const [u, v] = loc(x, z); return u > IX0 && u < IX1 && v >= RZ - 0.01 && v < LZ + 0.2; };
  const sp = scr.getWorldPosition(new THREE.Vector3());
  return { col, course, root, inRoom, inLobby, door: root.localToWorld(new THREE.Vector3(cx, 0, Z1 + 1.2)), y: Y + FY, screen: { box: scr, posterMat, p: [sp.x, sp.y, sp.z], zone } };
}
