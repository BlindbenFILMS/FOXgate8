// MERU 2.0 — s100 CASTLE DELUXE PART C1 (the 10 prizes), built + ticked inside worlds/meru2-castle-jobs.js as PZ.
// One prize per finished job count (16 jobs, both keepers count): 1 ROYAL CAPE (worn) · 2 KNIGHT OF MERU outfit (worn + Tailor) · 3 TITLE SQUIRE ·
// 4 LIBRARY CARD (Madam Vellum: READ A BOOK) · 5 YOUR OWN ROOM (the ROYAL CHAMBER off the hall, bed = rest) · 6 YOUR PORTRAIT in the ROYAL GALLERY ·
// 7 TITLE KNIGHT · 8 TREASURY SHARE (daily gold) · 10 A ROYAL HORSE to ride (yard stable) · 12 KEY TO THE CASTLE (the great door, see meru2-castle.js door()) ·
// 14 YOUR NAME IN THE COUNCIL (council roll board) · 16 TITLE LORD / LADY (you pick).
// Stats casCape / casCapeOn / casKnight / casTitle (-1..2) / casLady / casCard / casRead / casRoom / casGallery / casShare / casShareDay / casDayN /
// casHorse / casKey / casCouncil.
export function casPrizes(X) {
  const { THREE, G, scene, kit, box, cyl, LM, CT, cols, colB, IX, IZ, IY, OY, save, wear, heal, toast, ding, tone, sayTo, hour, paint, PW = 160, PH = 200, castle } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#1f2650', DARK = '#3d2a1c', WOOD = '#6b4a32', CAPE = '#a8323e';
  const st = (k, d) => save.stat('cas' + k, d), set = (k, v) => save.setStat('cas' + k, v);
  const nDone = () => { const o = save.stat('casDone', null) || {}; return Object.keys(o).filter(k => o[k]).length; };
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const fit = (c, t, x, y, w, px, wt = 900) => { let s = px; c.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (s > 10 && c.measureText(t).width > w) { s -= 2; c.font = wt + ' ' + s + 'px Archivo, sans-serif'; } c.fillText(t, x, y); };
  const W = (lx, y, lz) => new THREE.Vector3(IX + lx, y, IZ + lz);
  const plane = (par, tex, w, h, x, y, z, ry = 0, basic = true) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshLambertMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const title = () => st('Title', -1), lady = () => !!st('Lady', false);
  const titleName = () => { const t = title(); return t < 0 ? '' : t === 0 ? 'SQUIRE' : t === 1 ? 'SIR' : lady() ? 'LADY' : 'LORD'; };
  const styled = () => (titleName() ? titleName() + ' ' : '') + name();
  // ---------- game day ----------
  let lastH = null; const day = () => st('DayN', 0);
  const dayTick = () => { const h = hour ? hour() : 12; if (lastH != null && h < lastH - 12) set('DayN', day() + 1); lastH = h; };
  // ================= worn: the ROYAL CAPE (on P.body, hangs from the shoulders) =================
  const KNIGHT = { outfit: 'armor', torso: ['#c9ced6', NAVY, GOLD], name: 'KNIGHT OF MERU' };
  const capeMesh = () => { const g = new THREE.Group(); g.position.set(0, 0.84, -0.24); const c = new THREE.Group(); g.add(c); box(c, 0.54, 0.82, 0.025, CAPE, 0, -0.41, -0.02); box(c, 0.56, 0.06, 0.03, GOLD, 0, -0.8, -0.02); box(c, 0.6, 0.08, 0.1, GOLD, 0, 0, 0.02);
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), LM(GOLD)); b.position.set(s * 0.2, -0.02, 0.4); g.add(b); } g.userData.c = c; return g; };
  let worn = null;
  function applyWear(fox, P) { const U = fox && fox.userData && fox.userData.P; if (!U || !U.body) return; const on = !!(st('Cape', false) && st('CapeOn', true));
    if (!(worn && worn.on === on && worn.U === U && (!worn.m || worn.m.parent))) { if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, U, m: null }; if (on) { worn.m = capeMesh(); U.body.add(worn.m); } }
    if (worn.m) { const sp = P ? Math.min(6, P.sp || 0) : 0, c = worn.m.userData.c, k = riding ? 0.55 : 0.08 + sp * 0.09; c.rotation.x += (k + Math.sin(performance.now() / 260) * 0.03 * (sp > 0.5 ? 1 : 0.3) - c.rotation.x) * 0.15; } }
  // ================= the ROYAL GALLERY (throne room, west wall north of the library door) =================
  const GZ = [-17.4, -14.6, -11.8], GX = -9.7;
  const face = (g, o) => { g.fillStyle = o.bg; g.fillRect(0, 0, PW, PH); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, PH * 0.62, PW, PH * 0.38); g.fillStyle = o.fur; g.beginPath(); g.moveTo(40, 74); g.lineTo(52, 26); g.lineTo(70, 60); g.lineTo(90, 60); g.lineTo(108, 26); g.lineTo(120, 74); g.quadraticCurveTo(124, 122, 80, 142); g.quadraticCurveTo(36, 122, 40, 74); g.fill();
    g.fillStyle = o.coat; g.fillRect(28, 142, 104, 58); g.fillStyle = GOLD; g.fillRect(74, 150, 12, 50); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(58, 108); g.quadraticCurveTo(80, 148, 102, 108); g.quadraticCurveTo(80, 120, 58, 108); g.fill();
    g.fillStyle = o.eye || INK; for (const x of [64, 96]) { g.beginPath(); g.arc(x, 92, 5, 0, 7); g.fill(); } g.fillStyle = INK; g.beginPath(); g.arc(80, 122, 5, 0, 7); g.fill();
    if (o.crown) { const y = o.crown < 1 ? 30 : 22, s = o.crown; g.fillStyle = GOLD; g.beginPath(); g.moveTo(80 - 26 * s, y + 18); g.lineTo(80 - 26 * s, y); g.lineTo(80 - 13 * s, y + 10); g.lineTo(80, y - 4); g.lineTo(80 + 13 * s, y + 10); g.lineTo(80 + 26 * s, y); g.lineTo(80 + 26 * s, y + 18); g.fill(); }
    g.strokeStyle = GOLD; g.lineWidth = 10; g.strokeRect(5, 5, PW - 10, PH - 10); g.fillStyle = GOLD; g.font = 'italic 900 15px Archivo, sans-serif'; g.fillText('Umber', PW - 62, PH - 16); };
  const GAL = [{ n: 'KING MIGHT', r: 'THE CROWN', o: { bg: NAVY, fur: '#d9822f', coat: '#474d59', eye: '#b8862a', crown: 1 } }, { n: 'PRINCE MAX', r: 'THE HEIR', o: { bg: '#7a1f2b', fur: '#e8742a', coat: '#2a4a9a', crown: 0.7 } }, { n: 'you', r: '' }];
  const GALT = GAL.map(() => CT(PW, PH, () => {})), GLAB = GAL.map(() => CT(320, 72, () => {}));
  GAL.forEach((q, i) => { const z = GZ[i]; box(G, 0.06, 1.98, 1.62, DARK, IX + GX - 0.02, 2.4, IZ + z); plane(G, GALT[i], 1.4, 1.75, IX + GX + 0.03, 2.4, IZ + z, Math.PI / 2, false); box(G, 0.04, 0.3, 1.24, INK, IX + GX - 0.01, 1.2, IZ + z); plane(G, GLAB[i], 1.2, 0.27, IX + GX + 0.025, 1.2, IZ + z, Math.PI / 2); });
  plane(G, CT(512, 72, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = GOLD; c.fillRect(0, 0, 12, h); c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; c.font = '900 40px Archivo, sans-serif'; c.fillText('THE ROYAL GALLERY', 28, h / 2 + 2); }), 2.4, 0.34, IX + GX + 0.03, 3.62, IZ + GZ[1], Math.PI / 2);
  const labDraw = (i, n, r, on = true) => { const c = GLAB[i].userData.c.getContext('2d'); c.fillStyle = on ? YEL : '#d6d2cb'; c.fillRect(0, 0, 320, 72); c.fillStyle = INK; c.fillRect(0, 0, 10, 72); c.textBaseline = 'middle'; fit(c, n, 22, 26, 286, 30); c.fillStyle = '#5c5856'; fit(c, r, 22, 56, 286, 16, 700); GLAB[i].needsUpdate = true; };
  GAL.slice(0, 2).forEach((q, i) => { face(GALT[i].userData.c.getContext('2d'), q.o); GALT[i].needsUpdate = true; labDraw(i, q.n, q.r); });
  let galKey = '';
  function drawGallery() { const on = !!st('Gallery', false), k = on + styled(); if (k === galKey) return; galKey = k; const c = GALT[2].userData.c.getContext('2d');
    if (on) { if (paint) { c.clearRect(0, 0, PW, PH); paint(c, 3); } else face(c, { bg: '#7a1f2b', fur: '#e8742a', coat: NAVY }); }
    else { c.fillStyle = '#d6d2cb'; c.fillRect(0, 0, PW, PH); c.fillStyle = '#bdb6aa'; for (let i = 0; i < 6; i++) c.fillRect(i * 28 + 6, 0, 10, PH); c.fillStyle = INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 64px Archivo, sans-serif'; c.fillText('?', PW / 2, PH / 2); c.textAlign = 'left'; }
    GALT[2].needsUpdate = true; labDraw(2, on ? styled() : 'RESERVED', on ? 'FRIEND OF THE COURT' : '6 JOBS FOR THE COURT', on); }
  // ================= the COUNCIL ROLL (council room, south wall, east of the fireplace) =================
  const CR = CT(640, 400, () => {}); { const x = 25.6, z = -0.27; box(G, 3.2, 2.1, 0.06, INK, IX + x, 2.9, IZ + z + 0.02); plane(G, CR, 3.0, 1.88, IX + x, 2.9, IZ + z - 0.02, Math.PI); }
  const COUNCIL = [['KING MIGHT', 'THE CROWN'], ['PRINCE MAX', 'THE HEIR'], ['STEWARD BARNABY', 'THE HOUSE'], ['MADAM VELLUM', 'THE LIBRARY'], ['LADY ROSE', 'THE COUNCIL'], ['SIR HUGO', 'THE COUNCIL'], ['LORD OAK', 'THE COUNCIL'], ['MAESTRO UMBER', 'THE ARTS']];
  let crKey = '';
  function drawCouncil() { const on = !!st('Council', false), k = on + styled(); if (k === crKey) return; crKey = k; const c = CR.userData.c.getContext('2d'), w = 640, h = 400;
    c.fillStyle = WHITE; c.fillRect(0, 0, w, h); c.fillStyle = NAVY; c.fillRect(0, 0, w, 62); c.fillStyle = GOLD; c.fillRect(0, 0, 14, 62); c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; fit(c, 'THE COUNCIL OF MERU', 30, 33, w - 50, 32);
    COUNCIL.forEach(([n, r], i) => { const x = 20 + (i % 2) * 310, y = 80 + (i >> 1) * 50; c.fillStyle = INK; c.fillRect(x, y + 42, 290, 2); fit(c, n, x, y + 16, 290, 24); c.fillStyle = '#5c5856'; fit(c, r, x, y + 34, 290, 14, 700); });
    const y = 294; c.fillStyle = on ? YEL : '#d6d2cb'; c.fillRect(20, y, w - 40, 86); c.fillStyle = INK; c.fillRect(20, y, 12, 86); fit(c, 'THE NEW SEAT', 46, y + 22, 300, 20, 800);
    fit(c, on ? styled() : '?  \u00b7  14 JOBS FOR THE COURT', 46, y + 56, w - 90, 32); CR.needsUpdate = true; }
  // ================= YOUR OWN ROOM: the ROYAL CHAMBER (local x -22..-10, z 7..19; doorway in the hall's west wall z 15..18) =================
  const RM = new THREE.Group(); G.add(RM);
  { const bx = -19, bz = 8.7; box(RM, 2.0, 0.45, 2.6, DARK, IX + bx, 0.25, IZ + bz); box(RM, 1.9, 0.2, 2.5, '#f3efe2', IX + bx, 0.57, IZ + bz); box(RM, 1.96, 0.08, 1.7, CAPE, IX + bx, 0.7, IZ + bz + 0.4); box(RM, 1.97, 0.03, 0.12, GOLD, IX + bx, 0.75, IZ + bz - 0.4);
    box(RM, 1.4, 0.16, 0.45, '#ffffff', IX + bx, 0.75, IZ + bz - 0.95); box(RM, 2.1, 1.6, 0.12, DARK, IX + bx, 1.0, IZ + bz - 1.32);
    for (const a of [-0.98, 0.98]) for (const b of [-1.28, 1.28]) box(RM, 0.1, 2.6, 0.1, DARK, IX + bx + a, 1.3, IZ + bz + b);
    box(RM, 2.1, 0.1, 2.7, CAPE, IX + bx, 2.62, IZ + bz); box(RM, 2.12, 0.05, 2.72, GOLD, IX + bx, 2.56, IZ + bz); for (const s of [-1, 1]) box(RM, 0.04, 1.4, 2.6, CAPE, IX + bx + s * 1.02, 1.95, IZ + bz);
    box(RM, 1.2, 0.55, 0.6, WOOD, IX + bx, 0.28, IZ + bz + 1.75); box(RM, 1.22, 0.05, 0.62, GOLD, IX + bx, 0.4, IZ + bz + 1.75); colB(bx - 1.05, bx + 1.05, bz - 1.4, bz + 2.1);
    box(RM, 0.6, 0.7, 0.5, WOOD, IX - 17.3, 0.35, IZ + 7.6); cyl(RM, 0.05, 0.05, 0.22, '#f3efe2', IX - 17.3, 0.81, IZ + 7.6, 6); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); fl.position.set(IX - 17.3, 0.97, IZ + 7.6); RM.add(fl); colB(-17.65, -16.95, 7.3, 7.9);
    box(RM, 0.8, 2.4, 1.6, DARK, IX - 21.4, 1.2, IZ + 15.6); box(RM, 0.02, 2.2, 0.02, INK, IX - 20.99, 1.2, IZ + 15.6); for (const s of [-1, 1]) box(RM, 0.04, 0.12, 0.04, GOLD, IX - 20.98, 1.25, IZ + 15.6 + s * 0.1); colB(-21.85, -20.95, 14.75, 16.45);
    box(RM, 5, 0.02, 4, NAVY, IX - 15.6, 0.04, IZ + 13.4); box(RM, 5.2, 0.018, 4.2, GOLD, IX - 15.6, 0.035, IZ + 13.4); }
  const winM = new THREE.MeshBasicMaterial({ color: '#cfe3ff' }), sunM = new THREE.MeshBasicMaterial({ color: '#ffe2a0', transparent: true, opacity: 0.22, depthWrite: false });
  { box(RM, 0.08, 2.3, 1.7, '#2a2440', IX - 21.73, 3.2, IZ + 12.5); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), winM); p.position.set(IX - 21.68, 3.2, IZ + 12.5); p.rotation.y = Math.PI / 2; RM.add(p); box(RM, 0.1, 0.06, 1.4, '#2a2440', IX - 21.66, 3.4, IZ + 12.5); box(RM, 0.1, 2.0, 0.06, '#2a2440', IX - 21.66, 3.2, IZ + 12.5); }
  const SUN = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2).rotateX(-Math.PI / 2), sunM); SUN.position.set(IX - 19.8, 0.05, IZ + 12.5); SUN.renderOrder = 2; RM.add(SUN);
  // the door (shut until the prize) + the name plate on the hall side
  const DOOR = new THREE.Group(); G.add(DOOR); { box(DOOR, 0.14, 3.55, 2.96, DARK, IX - 10, 1.78, IZ + 16.5); for (const y of [0.7, 2.8]) box(DOOR, 0.16, 0.1, 2.96, '#3d3b3a', IX - 10, y, IZ + 16.5); box(DOOR, 0.16, 3.55, 0.04, INK, IX - 10, 1.78, IZ + 16.5);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 12), LM(GOLD)); r.position.set(IX - 9.9, 1.4, IZ + 16.8); r.rotation.y = Math.PI / 2; DOOR.add(r); }
  cols.push({ f: [IX - 10.3, IX - 9.7, IZ + 15, IZ + 18], y0: IY - 3, y1: IY + 15, get on() { return !st('Room', false); } });
  const NP = CT(320, 96, () => {}); box(G, 0.04, 0.38, 1.04, INK, IX - 9.73, 1.85, IZ + 14.0); plane(G, NP, 0.96, 0.3, IX - 9.69, 1.85, IZ + 14.0, Math.PI / 2);
  let npKey = ''; function drawPlate() { const on = !!st('Room', false), k = on + styled(); if (k === npKey) return; npKey = k; const c = NP.userData.c.getContext('2d'); c.fillStyle = on ? YEL : INK; c.fillRect(0, 0, 320, 96); c.fillStyle = on ? INK : GOLD; c.fillRect(0, 0, 12, 96); c.textBaseline = 'middle';
    c.fillStyle = on ? INK : '#ffffff'; fit(c, on ? styled() : 'PRIVATE', 26, 36, 280, 34); c.fillStyle = on ? '#5c5856' : YEL; fit(c, on ? 'YOUR CHAMBER' : 'ROYAL GUEST ONLY', 26, 74, 280, 18, 800); NP.needsUpdate = true; }
  const BED = [-17.4, 9.0], DOOR_AT = [-9.2, 16.5];
  const inKeep = P => !!(castle && castle.inside(P));
  const atL = (P, q, r) => inKeep(P) && Math.hypot(P.x - IX - q[0], P.z - IZ - q[1]) < r;
  // ================= the ROYAL HORSE (yard, by the stable; ride anywhere outdoors) =================
  const HOME = [-238.6, -418.8, Math.PI / 2], HW = '#efeae0', HM = '#cfc6b8';
  const H = new THREE.Group(); H.name = 'royalHorse'; H.visible = false; scene.add(H);
  const legs = []; let hHead = null, hTail = null, hBody = null;
  { hBody = new THREE.Group(); H.add(hBody); box(hBody, 0.62, 0.66, 1.6, HW, 0, 1.22, 0); box(hBody, 0.66, 0.5, 0.95, CAPE, 0, 1.18, -0.05); box(hBody, 0.67, 0.05, 0.95, GOLD, 0, 0.94, -0.05);
    box(hBody, 0.5, 0.14, 0.7, INK, 0, 1.6, -0.05); box(hBody, 0.52, 0.04, 0.72, GOLD, 0, 1.68, -0.05); box(hBody, 0.44, 0.16, 0.08, INK, 0, 1.72, 0.26); box(hBody, 0.44, 0.2, 0.08, INK, 0, 1.74, -0.36);
    const n = box(hBody, 0.32, 0.8, 0.38, HW, 0, 1.75, 0.82); n.rotation.x = 0.5; const mn = box(hBody, 0.08, 0.8, 0.22, HM, 0, 1.82, 0.7); mn.rotation.x = 0.5;
    hHead = new THREE.Group(); hHead.position.set(0, 2.1, 1.02); hBody.add(hHead); box(hHead, 0.3, 0.32, 0.62, HW, 0, 0, 0.22); box(hHead, 0.26, 0.24, 0.2, HM, 0, -0.05, 0.56); for (const s of [-1, 1]) { box(hHead, 0.07, 0.16, 0.05, HW, s * 0.1, 0.22, 0.02); const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), LM(INK)); e.position.set(s * 0.155, 0.06, 0.24); hHead.add(e); }
    box(hHead, 0.32, 0.04, 0.04, GOLD, 0, 0.08, 0.36); box(hHead, 0.04, 0.2, 0.04, GOLD, 0.16, -0.02, 0.36);
    hTail = new THREE.Group(); hTail.position.set(0, 1.4, -0.82); hBody.add(hTail); const t = box(hTail, 0.1, 0.7, 0.12, HM, 0, -0.32, -0.08); t.rotation.x = -0.25;
    for (const [x, z] of [[-0.22, 0.6], [0.22, 0.6], [-0.22, -0.6], [0.22, -0.6]]) { const l = new THREE.Group(); l.position.set(x, 0.92, z); H.add(l); box(l, 0.15, 0.86, 0.15, HW, 0, -0.43, 0); box(l, 0.17, 0.12, 0.18, '#3d3b3a', 0, -0.86, 0.01); legs.push(l); } }
  const hCol = { c: [HOME[0], HOME[1], 0.75], y0: OY - 2, y1: OY + 3, get on() { return H.visible && !riding; } }; cols.push(hCol);
  let riding = false, hPh = 0, last = null, away = 0;
  const parkAt = (x, y, z, ry) => { H.position.set(x, y, z); H.rotation.y = ry; hCol.c[0] = x; hCol.c[1] = z; hCol.y0 = y - 2; hCol.y1 = y + 3; };
  parkAt(HOME[0], OY, HOME[1], HOME[2]);
  const nearHorse = P => H.visible && !riding && !inKeep(P) && Math.hypot(P.x - H.position.x, P.z - H.position.z) < 2.3 && Math.abs((P.y || 0) - H.position.y) < 2.5;
  const neigh = () => { tone(520, 0.04, 0.25, 'sawtooth'); tone(440, 0.035, 0.35, 'sawtooth', 0.18); };
  function mount(P) { riding = true; P.yaw = H.rotation.y; P.x = H.position.x; P.z = H.position.z; neigh(); toast('ON THE ROYAL HORSE \u00b7 ' + (X.touch ? 'TALK' : 'E') + ' TO GET OFF', 2.6); }
  function dismount(P, quiet) { if (!riding) return; riding = false; const p = last || P; if (!p) { parkAt(HOME[0], OY, HOME[1], HOME[2]); return; } parkAt(p.x, p.y || 0, p.z, p.yaw || 0); if (P && !quiet) { P.x += Math.cos(p.yaw || 0) * 1.4; P.z -= Math.sin(p.yaw || 0) * 1.4; toast('THE HORSE WAITS HERE \u00b7 SHE GOES HOME IF YOU LEAVE HER', 2.6); } away = 0; }
  function poseRide(fox, P, dt) { const sp = P.sp || 0; hPh += dt * (2 + sp * 1.6); const a = Math.min(1, sp / 3) * 0.55;
    legs.forEach((l, i) => { l.rotation.x = Math.sin(hPh + (i === 0 || i === 3 ? 0 : Math.PI)) * a; }); hBody.position.y = Math.abs(Math.sin(hPh)) * 0.06 * Math.min(1, sp / 3); hHead.rotation.x = Math.sin(hPh * 2) * 0.06 * Math.min(1, sp / 3);
    if (!fox) return; fox.position.y += 1.06 + hBody.position.y; const U = fox.userData && fox.userData.P; if (U && U.legs) U.legs.forEach((l, i) => { l.rotation.x = -1.1; l.rotation.z = (i ? -1 : 1) * 0.45; }); }
  // ================= lore books (Madam Vellum, with the LIBRARY CARD) =================
  const BOOKS = [['THE EIGHT GATES', ['Meru sits at the centre of the Nine worlds.', 'Eight gates lead out from here, one to each of the others.']],
    ['FOXES OF MERU', ['Meru foxes build in golden sandstone and light their streets with flame.', 'The navy banner with the Meru crest flies over every gate.']],
    ['THE ARENA YEARS', ['Each birthday, King Might holds a tournament in the Arena.', 'This year the prize is the STAFF.']],
    ['KING MIGHT\u2019S MARCH', ['The King\u2019s guards hold Castle Ridge and the road below it.', 'Prince Max was once caged by bandits in the ruins caves.']],
    ['STARS OVER THE RIDGE', ['The Machine Fleet once malfunctioned and attacked the Meru transport.', 'Brave foxes held the bridge until it was over.']],
    ['PEARLS OF THE LAKE', ['Divers find hull pearls at five spots on Meru lake.', 'Nelly the sea monster lives there too. Swim politely.']],
    ['THE IRON WARDEN', ['The Iron Warden is the Arena\u2019s hardest machine.', 'Keep moving. Never stand still in front of it.']],
    ['A GUIDE TO CASTLE RIDGE', ['Throne room, library, council room, treasury. A royal chamber off the hall.', 'Staff use the small door on the east side.']]];
  function books(kT, ln) { const rd = st('Read', null) || {}; sayTo(kT, [{ ...ln('Your card is good for any shelf. Which book?'), choices: [...BOOKS.map(([t, ls], i) => ({ text: (rd[i] ? '\u2713 ' : '') + t, pick: () => { const r = { ...(st('Read', null) || {}) }; r[i] = true; set('Read', r);
      tone(660, 0.03, 0.2, 'triangle'); sayTo(kT, ls.map(s => ln(s))); } })), { text: 'GOODBYE', bye: true, pick: () => {} }] }]); }
  // ================= prizes =================
  const LINES = {
    cape: ['A royal cape, for loyal hands. Wear it in the halls.', 'ROYAL CAPE'],
    knight: ['Knight armour in the King\u2019s colours. The Tailor keeps a set for you.', 'KNIGHT OF MERU OUTFIT'],
    squire: ['By the King\u2019s leave, you are a Squire of Meru now.', 'TITLE \u00b7 SQUIRE'],
    card: ['Madam Vellum sends a library card. Any book on her shelves, any time.', 'LIBRARY CARD'],
    room: ['The royal chamber off the hall is yours. Rest in your bed any time.', 'YOUR OWN ROOM'],
    gallery: ['Maestro Umber\u2019s portrait of you hangs in the royal gallery now.', 'YOUR PORTRAIT IN THE GALLERY'],
    sir: ['Kneel. Rise, Knight of Meru. The court calls you Sir now.', 'TITLE \u00b7 KNIGHT'],
    share: ['A share of the treasury is yours. Collect it from me once a day.', 'TREASURY SHARE'],
    horse: ['A royal horse waits by the yard stable. Ride her anywhere in Meru.', 'A ROYAL HORSE'],
    key: ['The key to the castle. The great door opens for you now.', 'KEY TO THE CASTLE'],
    council: ['Your name is on the council roll. A seat of your own.', 'YOUR NAME IN THE COUNCIL'],
    lord: ['Every job in the castle. The King makes you a Lord or a Lady. Which?', 'TITLE \u00b7 LORD / LADY'] };
  const line = k => LINES[k] || null;
  function gift() { const n = nDone();
    if (!st('Cape', false)) { set('Cape', true); set('CapeOn', true); return 'cape'; }
    if (n >= 2 && !st('Knight', false)) { set('Knight', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === KNIGHT.name)) save.setStat('tailorOutfits', [...list, KNIGHT]); save.setOutfit && save.setOutfit(KNIGHT); wear && wear(KNIGHT); return 'knight'; }
    if (n >= 3 && title() < 0) { set('Title', 0); return 'squire'; }
    if (n >= 4 && !st('Card', false)) { set('Card', true); return 'card'; }
    if (n >= 5 && !st('Room', false)) { set('Room', true); drawPlate(); return 'room'; }
    if (n >= 6 && !st('Gallery', false)) { set('Gallery', true); drawGallery(); return 'gallery'; }
    if (n >= 7 && title() < 1) { set('Title', 1); return 'sir'; }
    if (n >= 8 && !st('Share', false)) { set('Share', true); return 'share'; }
    if (n >= 10 && !st('Horse', false)) { set('Horse', true); H.visible = true; return 'horse'; }
    if (n >= 12 && !st('Key', false)) { set('Key', true); return 'key'; }
    if (n >= 14 && !st('Council', false)) { set('Council', true); drawCouncil(); return 'council'; }
    if (n >= 16 && title() < 2) { set('Title', 2); return 'lord'; }
    return null; }
  function onFinish() { const gf = gift(); if (gf) { ding(); tone(1318, 0.05, 0.6, 'triangle', 0.15); setTimeout(() => toast('PRIZE \u00b7 ' + LINES[gf][1], 2.8), 2700); } return gf; }
  const needPick = () => title() >= 2 && st('Lady', null) == null;
  const pickChoices = () => [{ text: 'LORD', pick: () => { set('Lady', false); ding(); toast('LORD ' + name() + ' OF MERU', 2.6); } }, { text: 'LADY', pick: () => { set('Lady', true); ding(); toast('LADY ' + name() + ' OF MERU', 2.6); } }, { text: 'LATER', bye: true, pick: () => {} }];
  const choices = gf => (gf === 'lord' ? pickChoices() : null);
  const SHARE = () => [20, 30, 50][Math.max(0, title())];
  const shareOk = () => !!st('Share', false) && st('ShareDay', -1) !== day();
  function perks(kT, ln) { const own = [['cape', st('Cape', false)], ['knight armour', st('Knight', false)], ['library card', st('Card', false)], ['your room', st('Room', false)], ['your portrait', st('Gallery', false)], ['treasury share', st('Share', false)], ['the horse', st('Horse', false)], ['the castle key', st('Key', false)], ['a council seat', st('Council', false)]].filter(q => q[1]).map(q => q[0]);
    const ch = []; if (st('Cape', false)) ch.push({ text: st('CapeOn', true) ? 'CAPE OFF' : 'CAPE ON', pick: () => { set('CapeOn', !st('CapeOn', true)); toast(st('CapeOn', true) ? 'ROYAL CAPE ON' : 'ROYAL CAPE OFF', 1.6); } });
    if (shareOk()) ch.push({ text: 'MY TREASURY SHARE \u00b7 ' + SHARE() + ' G', pick: () => { set('ShareDay', day()); save.addGold(SHARE()); tone(1800, 0.04, 0.2, 'triangle'); tone(2400, 0.03, 0.3, 'triangle', 0.1); toast('TREASURY SHARE \u00b7 +' + SHARE() + ' GOLD \u00b7 AGAIN TOMORROW', 2.6); } });
    else if (st('Share', false)) ch.push({ text: 'SHARE \u00b7 BACK TOMORROW', pick: () => toast('ONE SHARE A DAY \u00b7 COME BACK TOMORROW', 2) });
    if (needPick()) ch.push({ text: 'LORD OR LADY?', pick: () => sayTo(kT, [{ ...ln('Lord or Lady of Meru. Your choice.'), choices: pickChoices() }]) });
    sayTo(kT, [{ ...ln(own.length ? 'Yours so far: ' + own.join(', ') + '.' : 'Serve the court and the King rewards you.'), choices: [...ch, { text: 'GOODBYE', bye: true, pick: () => {} }] }]); }
  // ================= prompt + talk =================
  function prompt(P) { if (riding) return 'GET OFF THE HORSE'; if (nearHorse(P)) return 'RIDE \u00b7 THE ROYAL HORSE';
    if (atL(P, BED, 1.5) && st('Room', false)) return 'REST \u00b7 YOUR BED'; if (atL(P, DOOR_AT, 1.4) && !st('Room', false)) return 'PRIVATE \u00b7 ROYAL CHAMBER'; return null; }
  function talk(P) { if (riding) { dismount(P); return true; } if (nearHorse(P)) { mount(P); return true; }
    if (atL(P, BED, 1.5) && st('Room', false)) { if (heal) heal(9999); tone(523, 0.05, 0.4); tone(659, 0.05, 0.4, 'sine', 0.15); tone(784, 0.05, 0.6, 'sine', 0.3); toast('A ROYAL NAP \u00b7 FULL HEALTH', 2.4); return true; }
    if (atL(P, DOOR_AT, 1.4) && !st('Room', false)) { tone(180, 0.06, 0.2, 'triangle'); toast('LOCKED \u00b7 5 JOBS FOR THE COURT EARNS A ROOM', 2.4); return true; } return false; }
  // ================= per frame (called every frame, after the walk has posed the fox) =================
  let rT = 0;
  const vis = () => { H.visible = !!st('Horse', false); DOOR.visible = !st('Room', false); drawPlate(); drawGallery(); drawCouncil(); };
  function tick(dt, P, fox, busy) { dayTick(); if (!P) return;
    if (riding) { const bad = busy || P.car || P.boat || P.swim || P.ab || P.skate || P.tank || P.heli || P.ferry || P.carousel || inKeep(P) || (last && Math.hypot(P.x - last.x, P.z - last.z) > 6);
      if (bad) dismount(null, true); else { H.position.set(P.x, P.y || 0, P.z); H.rotation.y = P.yaw || 0; poseRide(fox, P, dt); last = { x: P.x, y: P.y || 0, z: P.z, yaw: P.yaw || 0 }; } }
    else { last = null; legs.forEach(l => { l.rotation.x *= 0.85; }); hBody.position.y = 0; if (H.visible) { hTail.rotation.z = Math.sin(performance.now() / 600) * 0.25; if (hHead) hHead.rotation.x = -0.15 + Math.sin(performance.now() / 1300) * 0.08; }
      const home = Math.hypot(H.position.x - HOME[0], H.position.z - HOME[1]) < 0.5; if (!home && H.visible) { away = Math.hypot(P.x - H.position.x, P.z - H.position.z) > 40 ? away + dt : 0; if (away > 20) { parkAt(HOME[0], OY, HOME[1], HOME[2]); away = 0; } } }
    applyWear(fox, P);
    if ((rT -= dt) <= 0) { rT = 1.5; vis(); if (inKeep(P)) { const h = hour ? hour() : 12, dayL = h >= 7 && h < 18; winM.color.set(dayL ? '#cfe3ff' : h >= 18 && h < 20 ? '#ffb070' : '#1a1e3a'); SUN.visible = dayL; } } }
  vis();
  return { gift, onFinish, line, choices, perks, books, prompt, talk, tick, applyWear, nDone, styled, titleName, speedK: () => (riding ? 2.0 : 1), riding: () => riding, mount, dismount, horse: H, card: () => !!st('Card', false), drawGallery, drawCouncil };
}
