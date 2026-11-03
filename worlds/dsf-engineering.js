// ENGINEERING · MAIN CORE · DAMAGE CONTROL [dsfEngineering] interior (s351): Chief O'Brain's engine room.
// The MAIN CORE in the middle: a green plasma column inside a glass sleeve, floor to ceiling, with energy rings riding up it,
// a railing round it and an overhead catwalk ring. South of it the CHIEF'S console (O'Brain stands there), the DIAGNOSTIC
// station (west), the DAMAGE CONTROL corner (east: fire-suit rack, red alarm light, a suppression cart), the sealed ORE SHAFT
// hatch (north-west, cave later) and a powered-down repair drone in its cradle (Machine Fleet hint). Conduits glow green.
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const EB = { OX: 10800, hw: 13, hd: 11, h: 9, door: { x: 0, z: 10.2 }, enter: { x: 0, z: 7.6 }, hiring: { x: 10.4, z: 8.6 }, keeper: { x: 0, z: 0.4 }, core: { x: 0, z: -4.5, r: 1.6, rail: 3.2 }, diag: { x: -7.0, z: 2.0 }, hatch: { x: -8.5, z: -7.0 }, drone: { x: 8.2, z: -6.8 }, dc: { x: 9.0, z: 2.4 }, pit: { x: 6.9, z: -2.2, hw: 2.32, hd: 1.66 } };
export function buildEngineering(K) {
  const { THREE, scene, M, BOX, toon, basic, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(EB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#0e1610') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h } = EB, GREEN = '#8fe38f', CO = EB.core, wallM = toon('#1e3420'), steel = toon('#3a4440'), dark = toon('#1a201c'), hazard = toon('#e0b020');
  // floor: deck plates with a hazard ring round the core
  const plate = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#2c3430'; c.fillRect(0, 0, w, w); c.strokeStyle = '#1a201c'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, w - 4); c.fillStyle = '#3a4440'; for (const [x, y] of [[16, 16], [240, 16], [16, 240], [240, 240]]) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } }));
  plate.wrapS = plate.wrapT = THREE.RepeatWrapping; plate.repeat.set(0.25, 0.25);
  // s356: the floor has a hole for the CONDUIT DECK pit (worlds/dsf-conduit.js covers it with sliding plates)
  { const PT = EB.pit, sh = new THREE.Shape(); sh.moveTo(-hw, -hd); sh.lineTo(hw, -hd); sh.lineTo(hw, hd); sh.lineTo(-hw, hd); sh.lineTo(-hw, -hd);
    const ho = new THREE.Path(); ho.moveTo(PT.x - PT.hw, -PT.z - PT.hd); ho.lineTo(PT.x - PT.hw, -PT.z + PT.hd); ho.lineTo(PT.x + PT.hw, -PT.z + PT.hd); ho.lineTo(PT.x + PT.hw, -PT.z - PT.hd); ho.lineTo(PT.x - PT.hw, -PT.z - PT.hd); sh.holes.push(ho);
    { const hh = new THREE.Path(); hh.absarc(EB.hatch.x, -EB.hatch.z, 1.1, 0, Math.PI * 2, true); sh.holes.push(hh); }
    const f = new THREE.Mesh(new THREE.ShapeGeometry(sh), toon('#ffffff', { map: plate })); f.rotation.x = -Math.PI / 2; g.add(f);
    const hz = tex(canvas(512, 64, (c, W, H) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#e0b020' : '#1a1a1a'; c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32 + 32, 0); c.lineTo(i * 32 + 64, H); c.lineTo(i * 32 + 32, H); c.fill(); } })); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(4, 1);
    const ring = new THREE.Mesh(new THREE.RingGeometry(CO.rail + 0.2, CO.rail + 0.6, 48), new THREE.MeshBasicMaterial({ map: hz, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(CO.x, 0.012, CO.z); g.add(ring); }
  // shell: dark green bulkheads with ribs, glowing conduits running up the walls
  B(hw * 2, h, 0.3, wallM, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wallM, s * hw, h / 2, 0);
  B(hw - 1.6, h, 0.3, wallM, -(hw + 1.6) / 2, h / 2, hd); B(hw - 1.6, h, 0.3, wallM, (hw + 1.6) / 2, h / 2, hd); B(3.2, h - 3.4, 0.3, wallM, 0, 3.4 + (h - 3.4) / 2, hd);
  for (const s of [-1, 1]) B(0.2, 3.4, 0.4, basic(GREEN), s * 1.6, 1.7, hd); B(3.4, 0.2, 0.4, basic(GREEN), 0, 3.4, hd);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#141a16', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  const conM = new THREE.MeshBasicMaterial({ color: 0x6fe36f, toneMapped: false });
  for (const x of [-10, -6, 6, 10]) { B(0.6, h, 0.5, steel, x, h / 2, -hd + 0.4); C(0.12, 0.12, h, conM, x + 0.5, h / 2, -hd + 0.55, 8); }
  for (const z of [-7, -2, 3, 7]) for (const s of [-1, 1]) { B(0.5, h, 0.6, steel, s * (hw - 0.4), h / 2, z); C(0.1, 0.1, h, conM, s * (hw - 0.75), h / 2, z + 0.5, 8); }
  anims.push((dt, t) => { conM.color.setHSL(0.33, 0.7, 0.55 + Math.sin(t * 2.2) * 0.08); });
  sign(['ENGINEERING', 'MAIN CORE · DAMAGE CONTROL'], 7.0, 1.2, GREEN, 0, 5.2, hd - 0.17, Math.PI);
  // ---- THE MAIN CORE: plasma column + glass sleeve + rings riding up + top / bottom collars + railing + catwalk ring
  const plasma = new THREE.MeshBasicMaterial({ color: 0x5fff6a, toneMapped: false });
  const col = C(CO.r * 0.55, CO.r * 0.55, h, plasma, CO.x, h / 2, CO.z, 20);
  C(CO.r, CO.r, h - 1.4, new THREE.MeshBasicMaterial({ color: 0xbfffcf, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }), CO.x, 0.7 + (h - 1.4) / 2, CO.z, 28);
  for (const y of [0.35, h - 0.35]) C(CO.r + 0.35, CO.r + 0.35, 0.7, steel, CO.x, y, CO.z, 28);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; B(0.12, h - 1.4, 0.12, steel, CO.x + Math.cos(a) * (CO.r + 0.05), 0.7 + (h - 1.4) / 2, CO.z + Math.sin(a) * (CO.r + 0.05)); }
  const rings = []; for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(CO.r * 0.75, 0.06, 6, 28), new THREE.MeshBasicMaterial({ color: 0xc8ffb0, transparent: true, opacity: 0.9, toneMapped: false })); r.rotation.x = Math.PI / 2; r.position.set(CO.x, 1, CO.z); g.add(r); rings.push(r); }
  const glow = new THREE.PointLight(0x6fff7a, 2.4, 18, 1.6); glow.position.set(CO.x, 4.5, CO.z); g.add(glow);
  const S = { boost: 0 };
  anims.push((dt, t) => { S.boost = Math.max(0, S.boost - dt); const b = S.boost > 0 ? 1 : 0;
    rings.forEach((r, i) => { const u = ((t * (0.35 + b * 0.5) + i / rings.length) % 1); r.position.y = 0.8 + u * (h - 1.6); r.material.opacity = Math.sin(u * Math.PI) * 0.9; });
    const p = 0.5 + Math.sin(t * 3.1) * 0.06 + b * 0.18; plasma.color.setHSL(0.35, 1, p); col.scale.x = col.scale.z = 1 + Math.sin(t * 6) * 0.03 + b * 0.12; glow.intensity = 2.4 + Math.sin(t * 3.1) * 0.4 + b * 2; });
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; C(0.05, 0.05, 1.1, toon(GREEN), CO.x + Math.cos(a) * CO.rail, 0.55, CO.z + Math.sin(a) * CO.rail, 6); }
  { const tr = new THREE.Mesh(new THREE.TorusGeometry(CO.rail, 0.05, 6, 48), toon(GREEN)); tr.rotation.x = Math.PI / 2; tr.position.set(CO.x, 1.1, CO.z); g.add(tr); }
  circles.push([CO.x, CO.z, CO.rail + 0.1]);
  { const cw = new THREE.Mesh(new THREE.RingGeometry(CO.r + 0.6, CO.r + 2.2, 40), toon('#2c3430', { side: THREE.DoubleSide })); cw.rotation.x = -Math.PI / 2; cw.position.set(CO.x, 5.6, CO.z); g.add(cw);
    const cr = new THREE.Mesh(new THREE.TorusGeometry(CO.r + 2.2, 0.05, 6, 48), toon(GREEN)); cr.rotation.x = Math.PI / 2; cr.position.set(CO.x, 6.6, CO.z); g.add(cr);
    for (const s of [-1, 1]) B(0.8, 0.12, hw - CO.r - 2.2, toon('#2c3430'), CO.x + s * (CO.r + 2.2 + (hw - CO.r - 2.2) / 2), 5.6, CO.z).rotation.y = Math.PI / 2; }
  sign(['MAIN CORE', 'DO NOT LEAN ON THE GLASS'], 4.0, 1.0, GREEN, CO.x, 7.4, CO.z + CO.r + 2.25, 0);
  // the Chief's console (beside O'Brain, south of the core) with a live core readout
  const read = document.createElement('canvas'); read.width = 512; read.height = 256; const rt = tex(read);
  const drawRead = pct => { const c = read.getContext('2d'); c.fillStyle = '#0a120c'; c.fillRect(0, 0, 512, 256); c.strokeStyle = GREEN; c.lineWidth = 6; c.strokeRect(3, 3, 506, 250); c.fillStyle = GREEN; c.font = `900 44px ${FONT}`; c.fillText('CORE OUTPUT', 24, 60); c.font = `900 110px ${FONT}`; c.fillText(pct + '%', 24, 180); c.fillStyle = '#1e3420'; c.fillRect(300, 110, 180, 40); c.fillStyle = GREEN; c.fillRect(300, 110, 180 * pct / 100, 40); c.fillStyle = '#f3f2f2'; c.font = `900 30px ${FONT}`; c.fillText('TARGET 94%', 300, 200); rt.needsUpdate = true; };
  drawRead(91);
  { const cg = new THREE.Group(); cg.position.set(2.6, 0, 0.6); cg.rotation.y = -0.5; g.add(cg); M(BOX(1.8, 1.0, 0.9), dark, 0, 0.5, 0, cg, 0); const top = M(BOX(1.9, 0.08, 1.0), steel, 0, 1.04, 0, cg, 0); void top;
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: rt, toneMapped: false })); sc.position.set(0, 1.6, -0.3); sc.rotation.x = -0.25; cg.add(sc); M(BOX(1.7, 0.9, 0.05), steel, 0, 1.6, -0.35, cg, 0).rotation.x = -0.25; }
  blocks.push([1.6, 3.6, -0.1, 1.3]);
  // DIAGNOSTIC station (west): a wall-height schematic of the station + a stand-up console
  const dg = EB.diag; { const sch = tex(canvas(512, 512, (c, w) => { c.fillStyle = '#0a120c'; c.fillRect(0, 0, w, w); c.strokeStyle = GREEN; c.lineWidth = 6; c.translate(w / 2, w / 2); for (const r of [200, 150, 60, 25]) { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); } for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.strokeRect(-6, -150, 12, 90); c.restore(); } c.fillStyle = '#ec3013'; c.beginPath(); c.arc(0, 175, 14, 0, 7); c.fill(); c.fillStyle = '#f3f2f2'; c.font = `900 28px ${FONT}`; c.textAlign = 'center'; c.fillText('BAY 4', 0, 225); }));
    plane(3.2, 3.2, new THREE.MeshBasicMaterial({ map: sch, toneMapped: false }), -hw + 0.35, 3.0, dg.z, Math.PI / 2);
    B(0.9, 1.1, 1.6, dark, dg.x - 2.4, 0.55, dg.z); B(1.0, 0.06, 1.7, toon(GREEN), dg.x - 2.4, 1.13, dg.z); blocks.push([dg.x - 2.9, dg.x - 1.9, dg.z - 0.8, dg.z + 0.8]);
    sign(['DIAGNOSTIC', 'RUN A CORE CHECK'], 2.0, 0.6, GREEN, -hw + 0.35, 5.0, dg.z, Math.PI / 2); }
  // DAMAGE CONTROL (east): fire-suit rack, red rotating alarm, a suppression cart, extinguishers
  const DC = EB.dc;
  { B(0.5, 2.6, 3.4, steel, hw - 0.5, 1.3, DC.z); for (let i = 0; i < 4; i++) { const z = DC.z - 1.2 + i * 0.8; B(0.35, 1.3, 0.55, toon('#d86a2a'), hw - 0.9, 1.4, z); B(0.36, 0.12, 0.56, toon('#e0e0d0'), hw - 0.9, 1.2, z); M(new THREE.SphereGeometry(0.22, 10, 8), toon('#c8d0d8'), hw - 0.9, 2.3, z, g, 0); }
    blocks.push([hw - 1.3, hw, DC.z - 1.8, DC.z + 1.8]);
    sign(['DAMAGE CONTROL', 'FIRE CREWS · SUITS'], 2.8, 0.8, '#ec3013', hw - 0.35, 3.4, DC.z, -Math.PI / 2, '#160c0c');
    const al = new THREE.Group(); al.position.set(hw - 0.5, 4.4, DC.z); g.add(al); C(0.22, 0.22, 0.3, new THREE.MeshBasicMaterial({ color: 0xff3b2f, toneMapped: false }), 0, 0, 0, 12, al);
    const beam = M(BOX(0.06, 0.12, 0.9), new THREE.MeshBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.5, toneMapped: false }), 0, 0, 0.45, al, 0); void beam; anims.push(dt => { al.rotation.y += dt * 2.5; });
    B(1.4, 0.9, 0.8, toon('#c83a2a'), DC.x - 1.6, 0.6, DC.z + 2.6); C(0.28, 0.28, 1.0, toon('#c83a2a'), DC.x - 1.6, 1.55, DC.z + 2.6, 12); blocks.push([DC.x - 2.4, DC.x - 0.8, DC.z + 2.2, DC.z + 3.0]);
    for (const z of [DC.z - 2.6, DC.z + 4.2]) { C(0.13, 0.13, 0.6, toon('#c83a2a'), hw - 0.5, 0.4, z, 10); } }
  // ORE SHAFT hatch (north-west), s367: a hazard ring round a real hole in the deck. SEALED = the lid is down; OPEN (oreHatchOpen) = the lid swings up
  // on its hinge, a ladder goes down a lit shaft, warm work light glows up out of the hole, the sign turns green. ENG.setHatch(open, animate).
  const HT = EB.hatch, HR = 1.1, hatch = { open: false, a: 0, to: 0 };
  { const hz2 = tex(canvas(256, 256, (c, w) => { c.translate(w / 2, w / 2); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#e0b020' : '#1a1a1a'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 124, i * Math.PI / 8, (i + 1) * Math.PI / 8); c.fill(); } c.fillStyle = '#3a4440'; c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fill(); c.strokeStyle = '#1a201c'; c.lineWidth = 8; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-80, -60 + i * 40); c.lineTo(80, -60 + i * 40); c.stroke(); } }));
    const hzM = new THREE.MeshBasicMaterial({ map: hz2, toneMapped: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(HR, 1.4, 40), hzM); ring.rotation.x = -Math.PI / 2; ring.position.set(HT.x, 0.02, HT.z); g.add(ring);
    // the shaft below the hole: steel tube, rungs down the east side, a work lamp at the bottom
    const sh = C(HR, HR, 5.2, toon('#232a26', { side: THREE.BackSide }), HT.x, -2.6, HT.z, 24); void sh;
    const glowM = new THREE.MeshBasicMaterial({ color: 0xffc36a, toneMapped: false }); const bot = new THREE.Mesh(new THREE.CircleGeometry(HR, 24), glowM); bot.rotation.x = -Math.PI / 2; bot.position.set(HT.x, -5.15, HT.z); g.add(bot);
    for (const s of [-1, 1]) B(0.07, 6.1, 0.07, toon('#c8ccd2'), HT.x + 0.85, -2.1, HT.z + s * 0.3);
    for (let i = 0; i < 14; i++) B(0.06, 0.06, 0.66, toon('#c8ccd2'), HT.x + 0.85, -5 + i * 0.4, HT.z);
    const grab = [C(0.04, 0.04, 0.9, hazard, HT.x + 0.9, 0.45, HT.z - 0.3, 6), C(0.04, 0.04, 0.9, hazard, HT.x + 0.9, 0.45, HT.z + 0.3, 6), B(0.08, 0.08, 0.68, hazard, HT.x + 0.9, 0.9, HT.z)];
    const beamM = new THREE.MeshBasicMaterial({ color: 0xffc36a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
    const beam = C(HR * 0.5, HR * 0.9, 2.4, beamM, HT.x, 1.2, HT.z, 20); beam.visible = false;
    const lamp = new THREE.PointLight(0xffc36a, 0, 7, 1.6); lamp.position.set(HT.x, 0.6, HT.z); g.add(lamp);
    // the lid on its west hinge (rotation.z lifts the east edge up and over)
    const piv = new THREE.Group(); piv.position.set(HT.x - HR, 0.03, HT.z); g.add(piv);
    C(HR, HR, 0.08, steel, HR, 0.04, 0, 24, piv); const lidUV = new THREE.CircleGeometry(HR - 0.02, 32), uv = lidUV.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + (uv.getX(i) - 0.5) * HR / 1.4, 0.5 + (uv.getY(i) - 0.5) * HR / 1.4);
    const top = new THREE.Mesh(lidUV, hzM); top.rotation.x = -Math.PI / 2; top.position.set(HR, 0.085, 0); piv.add(top);
    C(0.07, 0.07, 0.9, dark, 0, 0.04, 0, 8, piv).rotation.x = Math.PI / 2; B(0.12, 0.1, 0.5, hazard, HR * 1.8, 0.12, 0, piv);
    C(0.06, 0.06, 1.6, hazard, HT.x + 1.9, 0.8, HT.z + 0.8, 6); circles.push([HT.x + 1.9, HT.z + 0.8, 0.2]);
    const sSeal = sign(['ORE SHAFT', 'SEALED · CHIEF ONLY'], 1.8, 0.7, '#e0b020', HT.x + 1.9, 1.9, HT.z + 0.84, 0, '#161208');
    const sOpen = sign(['ORE SHAFT', 'OPEN · LADDER DOWN'], 1.8, 0.7, GREEN, HT.x + 1.9, 1.9, HT.z + 0.84, 0); sOpen.visible = false;
    const hole = [HT.x, HT.z, HR - 0.1];
    hatch.set = (open, anim) => { hatch.open = !!open; hatch.to = open ? 1.95 : 0; if (!anim) { hatch.a = hatch.to; piv.rotation.z = hatch.a; } sSeal.visible = !open; sOpen.visible = !!open; beam.visible = !!open && !LOW; for (const m of grab) m.visible = !!open;
      const k = circles.indexOf(hole); if (open && k < 0) circles.push(hole); if (!open && k >= 0) circles.splice(k, 1); };
    anims.push((dt, t) => { if (hatch.a !== hatch.to) { const d = hatch.to - hatch.a, st = dt * 1.4; hatch.a = Math.abs(d) < st ? hatch.to : hatch.a + Math.sign(d) * st; piv.rotation.z = hatch.a * (1 + Math.sin(Math.min(1, hatch.a / 1.95) * Math.PI) * 0.04); }
      const k = Math.min(1, hatch.a / 1.95), fl = 0.92 + Math.sin(t * 17) * 0.04 + (Math.sin(t * 3.3) > 0.97 ? -0.3 : 0);
      lamp.intensity = k * 9 * fl; beamM.opacity = k * 0.09 * fl; glowM.color.setHSL(0.1, 1, 0.45 + 0.2 * k * fl); }); }
  // the repair DRONE R-8 in its charging cradle (north-east). s364c: powered down, its eye flickers dark blue then cyan.
  // s367 ENG.setR8(mode): 'cradle' (asleep) · 'empty' (he went down the shaft with you) · 'free' (oreR8Free: the real R-8 model floats beside the cradle)
  const DR = EB.drone, eyeM = new THREE.MeshBasicMaterial({ color: 0x1a3fb8, toneMapped: false }); let bd, r8 = null, r8Mode = 'cradle';
  { B(2.0, 0.3, 1.6, steel, DR.x, 0.15, DR.z); for (const s of [-1, 1]) B(0.15, 2.4, 0.15, steel, DR.x + s * 0.9, 1.2, DR.z - 0.6); B(1.95, 0.15, 0.15, steel, DR.x, 2.4, DR.z - 0.6);
    bd = new THREE.Group(); bd.position.set(DR.x, 1.25, DR.z); bd.rotation.x = 0.35; g.add(bd); M(new THREE.SphereGeometry(0.55, 14, 10), toon('#c8ccd2'), 0, 0, 0, bd, 0); M(BOX(0.9, 0.18, 0.5), toon('#e0b020'), 0, -0.15, 0, bd, 0);
    const eye = M(new THREE.SphereGeometry(0.13, 10, 8), eyeM, 0, 0.05, 0.5, bd, 0); void eye; for (const s of [-1, 1]) { const arm = M(BOX(0.1, 0.6, 0.1), toon('#8a9098'), s * 0.6, -0.4, 0, bd, 0); arm.rotation.z = s * 0.4; }
    blocks.push([DR.x - 1.0, DR.x + 1.0, DR.z - 0.8, DR.z + 0.8]);
    const s0 = sign(['REPAIR DRONE R-8', 'QUARANTINED · DO NOT WAKE'], 2.2, 0.6, '#ff6a4a', DR.x, 3.0, DR.z - 0.52, 0, '#160c0c');
    const s1 = sign(['R-8 CRADLE', 'EMPTY · R-8 WENT DOWN THE SHAFT'], 2.2, 0.6, '#e0b020', DR.x, 3.0, DR.z - 0.52, 0, '#161208'); s1.visible = false;
    const s2 = sign(['R-8 · REPAIR DRONE', 'FREE · ON THE TEAM'], 2.2, 0.6, '#5fe3ff', DR.x, 3.0, DR.z - 0.52, 0, '#0a1418'); s2.visible = false;
    const padM = new THREE.MeshBasicMaterial({ color: 0x1a3fb8, toneMapped: false }); B(1.6, 0.04, 0.2, padM, DR.x, 0.32, DR.z + 0.5);
    hatch.r8 = mode => { r8Mode = mode; bd.visible = mode === 'cradle'; s0.visible = mode === 'cradle'; s1.visible = mode === 'empty'; s2.visible = mode === 'free'; padM.color.set(mode === 'free' ? 0x5fe3ff : mode === 'empty' ? 0x3a4440 : 0x1a3fb8);
      if (mode === 'free' && !r8) { r8 = new THREE.Group(); r8.position.set(DR.x - 1.9, 1.5, DR.z + 1.0); g.add(r8);
        import('./ore-machines.js?v=s364aj').then(OM => { const ctx = { THREE, M, toon, glowTex: K.glowTex || (K.glowTexture && K.glowTexture()) }, look = { ...(OM.loadMachines().look.r8 || {}) }; const m = OM.buildMachine(ctx, 'r8', look); m.scale.setScalar((look.size || 1.3) * 0.8); r8.add(m); r8.userData.m = m; r8.userData.OM = OM; }).catch(() => {}); }
      if (r8) r8.visible = mode === 'free'; };
    anims.push((dt, t) => { if (r8Mode === 'cradle') { const f = Math.sin(t * 13) > 0.92 || Math.sin(t * 0.7) > 0.97; eyeM.color.set(f ? 0x5fe3ff : 0x1a3fb8); bd.position.y = 1.25 + (f ? 0.02 : 0); }
      if (r8 && r8.visible) { r8.position.y = 1.5 + Math.sin(t * 1.8) * 0.12; r8.rotation.y = 0.6 + Math.sin(t * 0.5) * 0.5; const m = r8.userData.m; if (m) try { r8.userData.OM.poseMachine(m, { mode: 'idle', dt, t, hacked: false }); } catch (e) {} } }); }
  // NOW HIRING
  sign(['NOW HIRING', 'DAMAGE CONTROL · ASK THE CHIEF'], 2.4, 1.1, '#ec3013', EB.hiring.x, 1.9, EB.hiring.z - 0.06, 0, '#160c0c'); B(2.5, 1.2, 0.08, toon('#2a1a12'), EB.hiring.x, 1.9, EB.hiring.z - 0.12); C(0.05, 0.05, 1.3, steel, EB.hiring.x, 0.65, EB.hiring.z - 0.12, 6); circles.push([EB.hiring.x, EB.hiring.z - 0.12, 0.45]);
  // green motes drifting up round the core + steam puffs from a vent
  if (!LOW) { const n = 60, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = rr(0, 7), r = rr(CO.rail, CO.rail + 4); pos[i * 3] = CO.x + Math.cos(a) * r; pos[i * 3 + 1] = rr(0, h); pos[i * 3 + 2] = CO.z + Math.sin(a) * r; } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x9fff9f, size: 0.06, transparent: true, opacity: 0.6, depthWrite: false })); g.add(pts);
    anims.push(dt => { for (let i = 0; i < n; i++) { pos[i * 3 + 1] += dt * 0.4; if (pos[i * 3 + 1] > h) pos[i * 3 + 1] = 0; } geo.attributes.position.needsUpdate = true; }); }
  { const puffs = []; const pm = new THREE.MeshBasicMaterial({ color: 0xdfe8e0, transparent: true, opacity: 0, depthWrite: false }); for (let i = 0; i < (LOW ? 3 : 6); i++) { const p = M(new THREE.SphereGeometry(0.3, 8, 6), pm.clone(), -10.6, 0.3, -9.6, g, 0); puffs.push({ m: p, t: i * 0.5 }); }
    B(1.2, 0.1, 0.8, toon('#1a201c'), -10.6, 0.05, -9.6); anims.push(dt => { for (const p of puffs) { p.t = (p.t + dt) % 3; const u = p.t / 3; p.m.position.y = 0.3 + u * 3; p.m.scale.setScalar(0.6 + u * 2); p.m.material.opacity = Math.sin(u * Math.PI) * 0.25; } }); }
  function surge(t = 2.6) { S.boost = Math.max(S.boost, t); }
  function diagnose() { S.boost = 3.0; drawRead(94); setTimeout(() => drawRead(91), 6000); }
  function walk(x, z) { if (x < -hw + 0.6 || x > hw - 0.6 || z < -hd + 0.8 || z > hd - 0.4) return Math.abs(x) < 1.4 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  function setHatch(open, anim) { hatch.set(open, anim); }
  function setR8(mode) { hatch.r8(mode); }
  return { g, anims, walk, diagnose, surge, blocks, circles, setHatch, setR8 };
}
