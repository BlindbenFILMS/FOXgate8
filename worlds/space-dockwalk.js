// 8 GATES · SPACE MAP · DOCK WALK (s416, Ben: "dock, zoom in, the fox gets out and walks on the platform: NO load screens; pause for the
// animation; an energy shield keeps the air in; the ship sits on top of the dock, fully visible"). Meru's dock first.
// One page, no fade: LAND (the ship flies onto the BERTH PAD on the dock's south side and settles; the camera swoops down) → STEP OUT
// (the hatch glows, the fox walks down onto the deck) → WALK (stick / WASD along the deck inside a pulsing ENERGY-SHIELD TUBE) →
// the TELEPORT PAD at the west end ("Teleport to MERU" = the world's 3D page) or back to the SHIP ("Board ship" = undock).
// The fox is the CAST player (engine/cast.js), built the first time you land, so the space map stays light until then.
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs } from '../engine/cast.js';
import { crestTex } from '../engine/textures.js';
import { rr, pick, clamp, smooth, damp } from '../village-game.js';
import { shuttleInterior } from './shuttle-interior.js?v=s569';
import { corvetteInterior } from './corvette-interior.js?v=s569';
import { gunnerInterior } from './gunner-interior.js?v=s569';
import { flagshipInterior } from './flagship-interior.js?v=s569';
const lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
export function createDockWalk(X) {
  const { THREE, scene, grad, dotTex, LOW, toast, snd } = X;
  const cache = new Map(), toon = (c, ex) => { const k = c + (ex ? JSON.stringify(ex) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...ex })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0a0d14, side: THREE.BackSide });
  const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) { if (!geo.boundingSphere) geo.computeBoundingSphere(); const r = radius || geo.boundingSphere.radius || 1, o = new THREE.Mesh(geo, outlineMat); o.scale.setScalar(1 + outline / r); m.add(o); } (parent || scene).add(m); return m; };
  const glowM = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  let fox = null, animFox = null, building = null;
  async function ensureFox() { if (fox) return fox; if (building) return building; building = (async () => { const fk = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
      animFox = fk.animFox; const cast = castKit({ THREE, M, toon, makeFox: fk.makeFox }, await loadCastRigs()); fox = cast.make('player', { holster: true }); fox.userData._b0 = fox.scale.x; fox.scale.multiplyScalar(0.68); fox.userData._b = fox.scale.x; fox.visible = false; scene.add(fox); return fox; })(); return building; }
  // ---------- the walk deck overlay on a dock (built once per dock) ----------
  const decks = new Map(), PADS_BUILT = [];
  function deckFor(d) { if (decks.has(d.key)) return decks.get(d.key); if (d.padWalk) return padFor(d); const K = d.K, G = new THREE.Group(); scene.add(G);
    const y = d.Y + 0.15, z0 = d.wz + 2.6 * K, w = 2.3, xT = d.wx - (d.len / 2 - 3) * K, pad = { x: d.x, z: d.wz + 3.0 * K + 1.2, r: 4.6 }, xE = pad.x - pad.r + 0.4;
    // the deck: a long plank on struts off the spine, glowing edges, lamps
    M(new THREE.BoxGeometry(xE - xT + 2, 0.16, w), toon('#e8ecf2'), (xT + xE) / 2, y, z0, G, 0.03);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(xE - xT + 2, 0.05, 0.06), glowM('#7fd0ff', 0.9)); e.position.set((xT + xE) / 2, y + 0.1, z0 + s * w / 2); G.add(e); }
    for (let x = xT; x < xE; x += 3) { M(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), toon('#3b4150'), x, y - 0.6, z0 - w * 0.3, G, 0); const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#ffe7a3', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); l.scale.setScalar(0.32); l.position.set(x, y + 0.3, z0 + w / 2 - 0.05); G.add(l); }
    // the ENERGY-SHIELD TUBE: a half-cylinder of pulsing light over the deck + a dome over the berth pad (keeps the air in)
    const shG = new THREE.CylinderGeometry(1.7, 1.7, xE - xT + 1.5, 24, 1, true, 0, Math.PI); shG.rotateZ(Math.PI / 2); shG.rotateX(-Math.PI / 2);
    const shTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); for (let i = 0; i < 256; i += 8) { x.fillStyle = 'rgba(255,255,255,' + (0.08 + 0.12 * (i % 32 === 0)) + ')'; x.fillRect(0, i, 64, 2); } const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,0.6)'); g.addColorStop(0.5, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0.6)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 6); return t; })();
    const shM = glowM('#7fd0ff', 0.3); shM.map = shTex; const sh = new THREE.Mesh(shG, shM); sh.position.set((xT + xE) / 2, y + 0.08, z0); G.add(sh);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(pad.r + 0.4, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), shM.clone()); dome.material.opacity = 0.14; dome.scale.y = 0.6; dome.position.set(pad.x, y, pad.z); G.add(dome);
    // the BERTH PAD (the ship lands ON it, fully visible) + a short gangway across to the deck
    M(new THREE.CylinderGeometry(pad.r, pad.r * 1.05, 0.3, 32), toon('#cfd5df'), pad.x, y - 0.05, pad.z, G, 0.03); const ring = new THREE.Mesh(new THREE.RingGeometry(pad.r - 0.5, pad.r - 0.25, 48), glowM('#6ee7b7', 0.8)); ring.rotation.x = -Math.PI / 2; ring.position.set(pad.x, y + 0.12, pad.z); G.add(ring);
    M(new THREE.BoxGeometry(2.0, 0.12, 1.2), toon('#e8ecf2'), xE + 0.6, y, z0, G, 0.02);
    M(new THREE.BoxGeometry(1.6, 0.6, 1.2), toon('#3b4150'), pad.x, y - 0.6, pad.z - pad.r, G, 0.02);   // a clamp under the pad onto the spine
    // the TELEPORT PAD at the west end
    const tp = { x: xT + 0.6, z: z0 }; M(new THREE.CylinderGeometry(0.95, 1.05, 0.14, 24), toon('#3b4150'), tp.x, y + 0.08, tp.z, G, 0.02); const tr = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.85, 32), glowM('#9fe8ff', 0.9)); tr.rotation.x = -Math.PI / 2; tr.position.set(tp.x, y + 0.17, tp.z); G.add(tr);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 18, 1, true), glowM('#9fe8ff', 0.0)); col.position.set(tp.x, y + 1.4, tp.z); G.add(col);
    const nm = d.mods || 6, capX = d.wx + (-d.len / 2 + 8 + (d.len - 16) * (nm - 0.5) / nm) * K + 1.6;   // s417: the FIRST CAPSULE from the ship end = the door into the Meru Spacedock interior
    const D = { G, y, z0, w, xT, xE, pad, tp, sh, shM, dome, ring, tr, col, beam: 0, capX }; decks.set(d.key, D); return D; }
  // ---------- s442 INSTALL LANDING PADS (Ben: "a pad to land at the shipyard, mine, stargate and fuel depot, an office to walk to; like the Meru
  // dock; interiors later"). Same walk as the dock: the ship lands ON the round pad (east), the fox walks a shielded walkway west to the OFFICE
  // door (BIG roof sign + eye-level door sign, Ben's low-vision rule). d = { key, padWalk: true, name, office, x, z, tint } (x/z = pad centre).
  const signTex = (txt, sub, bg, fg) => { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 512, 160); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(6, 6, 500, 148);
    g.fillStyle = fg; g.font = '900 64px Archivo, Arial Black, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 26, sub ? 62 : 82, 460); if (sub) { g.font = '800 30px Archivo, Arial, sans-serif'; g.fillText(sub, 28, 122, 460); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  function padFor(d) { const G = new THREE.Group(); scene.add(G); const D_anim = [], PS = 0.55; /* s444 (Ben): the pad + office are a SMALL add-on: built full size, shown at 55 % round the pad centre */ const y = d.y ?? 0.15, z0 = d.z, w = 2.3, pad = { x: d.x, z: d.z, r: 4.6 }, xE = pad.x - pad.r + 0.4, xT = xE - 9, col0 = d.tint || '#7fd0ff';
    // round pad, glowing ring, a landing H
    M(new THREE.CylinderGeometry(pad.r, pad.r * 1.08, 0.4, 32), toon('#cfd5df'), pad.x, y - 0.1, pad.z, G, 0.03); M(new THREE.CylinderGeometry(pad.r * 0.7, pad.r * 0.5, 1.4, 16), toon('#3b4150'), pad.x, y - 1.0, pad.z, G, 0.03);
    const ring = new THREE.Mesh(new THREE.RingGeometry(pad.r - 0.5, pad.r - 0.25, 48), glowM('#6ee7b7', 0.8)); ring.rotation.x = -Math.PI / 2; ring.position.set(pad.x, y + 0.12, pad.z); G.add(ring);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.3, 0.03, 2.2), toon('#ffd23a'), pad.x + s * 0.8, y + 0.12, pad.z, G, 0); M(new THREE.BoxGeometry(1.6, 0.03, 0.3), toon('#ffd23a'), pad.x, y + 0.12, pad.z, G, 0);
    // the walkway + its energy-shield tube
    M(new THREE.BoxGeometry(xE - xT + 1, 0.16, w), toon('#e8ecf2'), (xT + xE) / 2, y, z0, G, 0.03); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(xE - xT + 1, 0.05, 0.06), glowM('#7fd0ff', 0.9)); e.position.set((xT + xE) / 2, y + 0.1, z0 + s * w / 2); G.add(e); }
    for (let x = xT + 1.5; x < xE; x += 3) { const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#ffe7a3', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); l.scale.setScalar(0.7); l.position.set(x, y + 0.5, z0 - w / 2 + 0.1); G.add(l); }
    const shG = new THREE.CylinderGeometry(1.7, 1.7, xE - xT + 0.5, 24, 1, true, 0, Math.PI); shG.rotateZ(Math.PI / 2); shG.rotateX(-Math.PI / 2);
    const shTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); for (let i = 0; i < 256; i += 8) { x.fillStyle = 'rgba(255,255,255,' + (0.08 + 0.12 * (i % 32 === 0)) + ')'; x.fillRect(0, i, 64, 3); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
    const shM = glowM('#7fd0ff', 0.3); shM.map = shTex; const sh = new THREE.Mesh(shG, shM); sh.position.set((xT + xE) / 2, y + 0.08, z0); G.add(sh);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(pad.r + 0.4, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), shM.clone()); dome.material.opacity = 0.14; dome.scale.y = 0.6; dome.position.set(pad.x, y, pad.z); G.add(dome);
    // s443 THE OFFICE, a sleek building per install (Ben: "less boxy, unique to the location"), door facing the walkway (+x) at x = ox + FR
    const ox = xT - 2.6, T = d.inst || 'yard', glassM = glowM('#9fe8ff', 0.55), lit = glowM('#ffe2a8', 0.85), wh = toon('#eef2f7'), dk = toon('#3b4150'), tn = toon(col0); let FR = 2.1, roofY = 4.2;
    const V2 = (x, y) => new THREE.Vector2(x, y);
    if (T === 'yard') { // SHIPYARD: a swept hangar shell (half-tube) with a glass nose band + a little gantry crane on its back
      const pod = new THREE.CapsuleGeometry(1.8, 1.8, 8, 22); pod.rotateX(Math.PI / 2); const h = M(pod, wh, ox, y + 1.2, z0, G, 0.04); h.scale.set(1.2, 0.85, 1);   // a sleek hangar pod
      const bandG = new THREE.CylinderGeometry(2.17, 2.17, 3.4, 28, 1, true, -0.9, 1.8); bandG.rotateX(Math.PI / 2); const band = new THREE.Mesh(bandG, glassM); band.scale.set(1, 0.86, 1); band.position.set(ox, y + 1.25, z0); band.rotation.y = 0; G.add(band);
      for (const zz of [-1.7, 1.7]) { const rr = M(new THREE.TorusGeometry(2.16, 0.09, 6, 28), tn, ox, y + 1.2, z0 + zz, G, 0); rr.scale.set(1, 0.85, 1); }
      M(new THREE.BoxGeometry(4.4, 0.35, 3.6), dk, ox, y + 0.05, z0, G, 0.02);
      M(new THREE.BoxGeometry(0.15, 2.0, 0.15), dk, ox - 0.6, y + 3.4, z0 - 1.2, G, 0); M(new THREE.BoxGeometry(3.0, 0.14, 0.14), tn, ox + 0.6, y + 4.4, z0 - 1.2, G, 0); M(new THREE.BoxGeometry(0.05, 1.0, 0.05), dk, ox + 1.9, y + 3.9, z0 - 1.2, G, 0); FR = 2.25; roofY = 5.0; }
    else if (T === 'mine') { // MINING: a low armoured dome with ribs, ore-lit ports, a drill mast with a turning bit
      M(new THREE.SphereGeometry(2.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d8d2c4'), ox, y, z0, G, 0.04).scale.y = 0.85; for (let i = 0; i < 6; i++) { const r = M(new THREE.TorusGeometry(2.42, 0.07, 5, 20, Math.PI), dk, ox, y, z0, G, 0); r.rotation.y = i / 6 * Math.PI; r.scale.y = 0.85; }
      for (let i = 0; i < 5; i++) { const an = -0.9 + i * 0.45, p = new THREE.Mesh(new THREE.CircleGeometry(0.28, 14), glowM('#f59e0b', 0.9)); p.position.set(ox + Math.cos(an) * 2.2, y + 0.9, z0 + Math.sin(an) * 2.2); p.lookAt(ox + Math.cos(an) * 5, y + 0.9, z0 + Math.sin(an) * 5); G.add(p); }
      M(new THREE.CylinderGeometry(0.12, 0.16, 3.0, 8), dk, ox - 0.4, y + 3.0, z0, G, 0); const bit = M(new THREE.ConeGeometry(0.35, 0.9, 8), toon('#f59e0b'), ox - 0.4, y + 4.7, z0, G, 0.02); bit.rotation.x = Math.PI; D_anim.push(t => { bit.rotation.y = t * 3; }); FR = 2.05; roofY = 4.6; }
    else if (T === 'gate') { // STARGATE: a slender glass spire inside a floating halo ring, echoing the gate
      const sp = M(new THREE.LatheGeometry([V2(0, 0), V2(1.9, 0), V2(1.7, 1.2), V2(1.1, 3.4), V2(0.4, 5.4), V2(0, 5.8)], 24), wh, ox, y, z0, G, 0.04);
      for (let i = 0; i < 4; i++) { const g2 = new THREE.Mesh(new THREE.CylinderGeometry(1.75 - i * 0.33, 1.65 - i * 0.33, 0.3, 24, 1, true), glassM); g2.position.set(ox, y + 0.9 + i * 1.1, z0); G.add(g2); }
      const halo = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 40), glowM('#93c5fd', 0.9)); halo.position.set(ox, y + 3.6, z0); halo.rotation.x = Math.PI / 2 - 0.2; G.add(halo); D_anim.push(t => { halo.rotation.z = t * 0.5; halo.position.y = y + 3.6 + Math.sin(t * 1.2) * 0.15; }); FR = 1.85; roofY = 6.4; }
    else { // FUEL DEPOT: a rounded capsule tank on its side, glowing fuel bands, a pump mast
      const cg = new THREE.CapsuleGeometry(1.7, 2.6, 8, 20); cg.rotateX(Math.PI / 2); M(cg, wh, ox - 0.2, y + 1.8, z0, G, 0.04); for (const zz of [-1.1, 0, 1.1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.07, 6, 28), glowM('#6ee7b7', 0.9)); r.position.set(ox - 0.2, y + 1.8, z0 + zz); G.add(r); }
      M(new THREE.BoxGeometry(3.4, 0.4, 3.0), dk, ox - 0.2, y + 0.2, z0, G, 0.02); M(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8), tn, ox - 1.6, y + 4.2, z0 + 1.0, G, 0); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#6ee7b7', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fl.position.set(ox - 1.6, y + 5.4, z0 + 1.0); G.add(fl); D_anim.push(t => fl.scale.setScalar(0.8 + 0.3 * Math.sin(t * 4))); FR = 1.95; roofY = 5.4; }
    // the door (on every one): a glowing arch at x = ox + FR, a short canopy, the eye-level door sign beside it
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), glowM('#9fe8ff', 0.75)); door.rotation.y = Math.PI / 2; door.position.set(ox + FR + 0.02, y + 1.0, z0); G.add(door);
    M(new THREE.BoxGeometry(0.9, 0.08, 1.8), tn, ox + FR + 0.35, y + 2.15, z0, G, 0.02); M(new THREE.BoxGeometry(0.4, 2.2, 0.12), dk, ox + FR + 0.1, y + 1.1, z0 - 0.75, G, 0); M(new THREE.BoxGeometry(0.4, 2.2, 0.12), dk, ox + FR + 0.1, y + 1.1, z0 + 0.75, G, 0);
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.0), new THREE.MeshBasicMaterial({ map: signTex(d.office || d.name, 'OFFICE', '#201e1d', '#f3f2f2'), toneMapped: false, side: THREE.DoubleSide })); roof.position.set(ox + 0.6, y + roofY + 0.9, z0); roof.rotation.y = 0.35; G.add(roof); M(new THREE.BoxGeometry(0.12, 1.4, 0.12), dk, ox + 0.4, y + roofY, z0, G, 0);
    const dsn = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.56), new THREE.MeshBasicMaterial({ map: signTex(d.office || d.name, null, '#ec3013', '#ffffff'), toneMapped: false })); dsn.rotation.y = Math.PI / 2; dsn.position.set(ox + FR + 0.12, y + 1.6, z0 + 1.6); G.add(dsn);
    // s443 CONNECTED TO ITS INSTALL: a lit truss boom from under the pad back to the shipyard / mine / gate / depot, with a pipe + running lights
    if (d.ix !== undefined) { const ax = pad.x, az = pad.z, bx = d.ix, bz = d.iz, L = Math.hypot(bx - ax, bz - az), stop = 0, Lb = Math.max(1, L - pad.r * PS - 3) /* s447: runs right into the install (pads sit at its rim, so this stays short) */, ang = Math.atan2(bz - az, bx - ax), mx = ax + Math.cos(ang) * (pad.r * PS + Lb / 2), mz = az + Math.sin(ang) * (pad.r * PS + Lb / 2);
      const boom = new THREE.Group(); boom.position.set(mx, y - 0.5, mz); boom.rotation.y = -ang; boom.scale.set(1, 0.45, 0.45); scene.add(boom); G.userData.boom = boom;
      for (const s of [-1, 1]) for (const yy of [-0.35, 0.35]) M(new THREE.BoxGeometry(Lb, 0.12, 0.12), dk, 0, yy, s * 0.5, boom, 0);
      const pipe = M(new THREE.CylinderGeometry(0.22, 0.22, Lb, 10), tn, 0, 0, 0, boom, 0.02); pipe.rotation.z = Math.PI / 2;
      for (let x = -Lb / 2 + 1; x < Lb / 2; x += 2.5) { M(new THREE.BoxGeometry(0.1, 0.8, 1.1), dk, x, 0, 0, boom, 0); const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); l.scale.setScalar(0.6); l.position.set(x, 0.55, 0); boom.add(l); D_anim.push(t => { l.material.opacity = 0.4 + 0.6 * Math.max(0, Math.sin(t * 4 - x * 0.6)); }); } }
    const tp = { x: xT + 0.4, z: z0 }, tr = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.85, 32), glowM('#9fe8ff', 0.9)); tr.rotation.x = -Math.PI / 2; tr.position.set(tp.x, y + 0.12, tp.z); G.add(tr);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 18, 1, true), glowM('#9fe8ff', 0.0)); col.position.set(tp.x, y + 1.4, tp.z); G.add(col);
    G.scale.setScalar(PS); G.position.set(pad.x * (1 - PS), y * (1 - PS), pad.z * (1 - PS)); const sx = v => pad.x + (v - pad.x) * PS, sz = v => pad.z + (v - pad.z) * PS;
    const D = { G, y, z0: sz(z0), w: w * PS, xT: sx(xT), xE: sx(xE), pad: { x: pad.x, z: pad.z, r: pad.r * PS }, tp: { x: sx(tp.x), z: sz(tp.z) }, sh, shM, dome, ring, tr, col, beam: 0, capX: -1e9, kind: 'pad', door, anim: D_anim, s: PS }; decks.set(d.key, D); PADS_BUILT.push(D); return D; }
  // ---------- s570 THE WALK-IN INTERIORS IN SPACE (Ben: "write the interiors into space; park nose EAST, ramp down, walk in and out") ----------
  // The same interior builders as the planet (shuttle / corvette / gunner / flagship-interior.js), built once per hull type, hung INSIDE the docked hull (scale 1 / S, at the deck
  // floor). While docked the ship grows to WALK SCALE (1 m = the dock fox's metre), so the fox fits the rooms. Inside: the hull hides, the side-rail camera + cutaway, R.near() prompts,
  // the PILOT SEAT / bridge = TAKE OFF. Ramp + interior ground in hull units: ramp (hinge → foot) slopes, inside = R.blocked in metres.
  const BOX = (w2, h2, d2) => new THREE.BoxGeometry(w2, h2, d2), basic = (c, o, tr) => new THREE.MeshBasicMaterial({ color: c, transparent: o != null || !!tr, opacity: o ?? 1, toneMapped: false });
  const glowSprite = (x, y, z, c, s, o, par) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: c, transparent: true, opacity: o ?? 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(s); sp.position.set(x, y, z); (par || scene).add(sp); return sp; };
  const signK = (parent, text, w2, h2, x, y, z, ry = 0, o = {}) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); M(BOX(w2 + 0.4, h2 + 0.4, 0.25), toon('#201e1d'), 0, 0, -0.08, g, 0); const p = new THREE.Mesh(new THREE.PlaneGeometry(w2, h2), new THREE.MeshBasicMaterial({ map: signTex(text, o.sub, o.bg || '#201e1d', o.fg || '#f3f2f2'), toneMapped: false })); p.position.z = 0.06; g.add(p); return g; };
  const INT = { hullShuttle: [shuttleInterior, 6.3, 1.5], hullCorvette: [corvetteInterior, 7.2, 1], hullGunship: [gunnerInterior, 7.9, 1], hullFlagWalk: [flagshipInterior, 9.5, 1] }, built = new Map();
  const _iv = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Vector3();
  function interiorFor(type, api) { if (built.has(type)) return built.get(type); const E = INT[type]; if (!E) return null; const [fn, Sb, SK] = E;
    const R2 = fn({ THREE, M, BOX, toon, basic, glowSprite, sign: signK, grad, note: (a, b) => toast(a + ' · ' + b, 3.2), hull: api, S: Sb / SK }); R2.k = SK; R2.Sb = Sb;
    for (const l of R2.lights || []) R2.g.remove(l); R2.g.updateMatrixWorld(true); const bx = new THREE.Box3(); R2.CEIL = []; R2.CUT = [];
    R2.g.children.forEach(m => { bx.setFromObject(m); if (bx.isEmpty()) return; const x0 = bx.min.x, x1 = bx.max.x, y0 = bx.min.y, y1 = bx.max.y; if (m.isMesh && y0 >= R2.h - 0.45) { R2.CEIL.push(m); return; } if ((x1 - x0 < 0.6 || bx.max.z - bx.min.z < 0.6) && y1 - y0 > 0.08 && y1 > 1.0) R2.CUT.push({ m, x: (x0 + x1) / 2 }); });
    R2.g.visible = false; built.set(type, R2); return R2; }
  // ---------- the walk ----------
  const W = { ship: null, on: false, phase: null, t: 0, d: null, D: null, x: 0, z: 0, face: 0, sp: 0, prompt: null, cam: { look: new THREE.Vector3(), pos: new THREE.Vector3() } };
  function shipGround(x, z) { const S = W.ship, D = W.D, R2 = S.R, A = S.api, dims = A.dims, zH = dims.hinge, zF = A.rampFoot[2], rw = dims.doorW * 0.9; S.grp.updateMatrixWorld(true); _iv.copy(S.grp.matrixWorld).invert(); _p.set(x, fox.position.y, z).applyMatrix4(_iv); const lx = _p.x, lz = _p.z;
    if (Math.abs(lx) < rw && lz >= zH - 0.03 && lz <= zF + 0.12) { const u = clamp((lz - zH) / Math.max(0.01, zF - zH), 0, 1); _q.set(lx, dims.floor * (1 - u), lz).applyMatrix4(S.grp.matrixWorld); return { x, z, y: _q.y + 0.02, where: 'ramp' }; }
    if (lz < zH) { const sc = R2.Sb / R2.k, mx = lx * sc, mz = lz * sc; if (R2.blocked(mx, mz)) return null; R2.PL.x = mx; R2.PL.z = mz; R2.PL.gy = 0; _q.set(lx, dims.floor, lz).applyMatrix4(S.grp.matrixWorld); return { x, z, y: _q.y + 0.02, where: 'in' }; }
    const s = D.s || 1; if (x >= D.xT && x <= D.xE + 1.2 * s && Math.abs(z - D.z0) < D.w / 2 - 0.25) return { x, z, y: D.y + 0.1, where: 'deck' }; return null; }
  const API = {
    W, ensureFox, interior: (type, api) => interiorFor(type, api), get fox() { return fox; }, get animFox() { return animFox; },   /* s599 the flight CABIN (worlds/ship-cabin.js) */
    metreK: d => { const D = deckFor(d); return (fox ? fox.userData._b / (fox.userData._b0 || 1) : 0.68) * (D.s || 1); },   // world units per interior metre on this dock
    dockShip(o) { const R2 = interiorFor(o.type, o.api); if (!R2) { W.ship = null; return; } if (R2.g.parent !== o.group) o.group.add(R2.g); R2.g.scale.setScalar(R2.k / R2.Sb); R2.g.position.set(0, o.api.dims.floor, 0); R2.g.visible = true; if (o.api.plug) o.api.plug.visible = false; W.ship = { R: R2, grp: o.group, body: o.body, api: o.api, Sb: R2.Sb, inside: false }; },
    undockShip() { const S = W.ship; if (!S) return; S.R.g.visible = false; if (S.api.plug) S.api.plug.visible = true; if (S.body) S.body.visible = true; S.R.CEIL.forEach(m => { m.visible = true; }); S.R.CUT.forEach(q => { q.m.visible = true; }); W.ship = null; },
    canWalk: d => !!d && (d.key === 'meru' || !!d.padWalk), padFor: d => deckFor(d),
    pad(d) { const D = deckFor(d); return { x: D.pad.x, z: D.pad.z, y: D.y + 1.0 * (D.s || 1) }; },
    async resume(d, big) { const D = deckFor(d); await ensureFox(); fox.scale.setScalar(fox.userData._b * (D.s || 1)); Object.assign(W, { big: big || null, tpS: false, stepT: 0, on: true, phase: 'walk', t: 0, d, D, sp: 0, prompt: null, left: false }); await ensureFox(); fox.visible = true; fox.position.set(D.capX + 1.4, D.y + 0.1, D.z0); fox.rotation.y = Math.PI / 2; },
    async begin(d, big) { const D = deckFor(d); await ensureFox(); fox.scale.setScalar(fox.userData._b * (D.s || 1)); Object.assign(W, { big: big || null, tpS: false, stepT: 0, on: true, phase: 'land', t: 0, d, D, x: D.xE - 0.3, z: D.z0, face: -Math.PI / 2, sp: 0, prompt: null }); await ensureFox(); },
    // s569 STERN-IN (Ben: the big walk-in ships back up to the dock, only the open RAMP touches the deck; first time the walk starts in the COCKPIT, after that at the ramp).
    // big = { nose:[x,y,z], door:[x,y,z] (top of the ramp, inside the stern door), foot:[x,y,z] (ramp foot on the pad), first }: the fox walks door → foot → the deck end.
    stepOut(big) { const D = W.D; W.big = big || null; W.t = 0; snd && snd('holster');
      if (big && W.ship) { const s = D.s || 1; W.path = [big.door, big.foot, [D.xE - 0.8 * s, D.y + 0.1, D.z0]]; W.pi = 0; W.pk = 0; W.phase = 'out'; W.waitRamp = true; fox.visible = false; fox.position.set(...big.door); fox.rotation.y = -Math.PI / 2; return; }   /* s570d (Ben): the regular landing: the ship settles, the RAMP DROPS, then the fox walks out of the door, down the ramp onto the deck */
      if (big) { const deck = [D.xE + 0.2, D.y + 0.1, D.z0]; W.path = [big.door, big.foot, deck]; W.pi = 0; W.pk = 0; W.phase = big.first ? 'cockpit' : 'out'; fox.visible = !big.first; fox.position.set(...big.door); if (big.first) toast('From the COCKPIT down through the ship to the ramp…', 2.4); return; }
      W.phase = 'out'; fox.visible = true; fox.position.set(D.pad.x - 1.2 * (D.s || 1), D.y + 0.1, D.pad.z - 1.4 * (D.s || 1)); fox.rotation.y = -Math.PI / 2; },
    board() { if (W.ship) { W.phase = 'in'; W.t = 0; W.prompt = null; W.inShipBoard = true; return; } W.phase = 'in'; W.t = 0; W.prompt = null; if (W.big) { W.path = [[fox.position.x, fox.position.y, fox.position.z], W.big.foot, W.big.door]; W.pi = 0; W.pk = 0; } },
    end() { W.on = false; W.phase = null; W.big = null; if (fox) fox.visible = false; },
    tickPads(t) { for (const D of PADS_BUILT) if (D.anim.length) for (const f of D.anim) f(t); },
    update(dt, ix, iz, onTeleport, onBoarded, onInterior) { if (!W.on) return; const D = W.D; W.t += dt; const t = W.t;
      D.shM.map.offset.y -= dt * 0.35; D.shM.opacity = 0.26 + 0.08 * Math.sin(t * 2.4); D.dome.material.opacity = 0.11 + 0.05 * Math.sin(t * 2.1); D.ring.material.opacity = 0.6 + 0.3 * Math.sin(t * 4); D.tr.material.opacity = 0.6 + 0.35 * Math.sin(t * 3);
      if (!fox) return;
      const P = { x: fox.position.x, z: fox.position.z };
      const pathStep = (spd) => { const a = W.path[W.pi], b = W.path[W.pi + 1]; if (!b) return true; const L = Math.max(0.01, Math.hypot(b[0] - a[0], b[2] - a[2], b[1] - a[1])); W.pk = Math.min(1, W.pk + dt * spd / L); fox.position.set(lerp(a[0], b[0], W.pk), lerp(a[1], b[1], W.pk), lerp(a[2], b[2], W.pk)); fox.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]); animFox(fox, dt, 3); if (W.pk >= 1) { W.pi++; W.pk = 0; } return W.pi >= W.path.length - 1; };
      if (W.phase === 'cockpit') { if (t > 2.4) { W.phase = 'out'; W.t = 0; fox.visible = true; } }
      else if (W.phase === 'out' && W.big && W.waitRamp && W.ship && (W.ship.api.ramp || 0) < 0.97) { fox.visible = false; }
      else if (W.phase === 'out' && W.big) { if (W.waitRamp) { W.waitRamp = false; fox.visible = true; window.__spaceSnd && window.__spaceSnd('holster'); } if (pathStep(2.0 * (D.s || 1))) { W.where = 'deck'; W.phase = 'walk'; W.t = 0; W.big.first = false; window.__spaceSnd && window.__spaceSnd('land', { v: 0.5 }); toast(W.ship ? 'Stick / WASD to walk. Walk up the RAMP into the ship; the BRIDGE = take off.' : 'Stick / WASD to walk. Walk back up the RAMP to board.', 3.4); } }
      else if (W.phase === 'out') { const k = Math.min(1, t / 1.1), ex = D.xE + 0.2, ez = D.z0; fox.position.x = lerp(D.pad.x - 1.2 * (D.s || 1), ex, ease(k)); fox.position.z = lerp(D.pad.z - 1.4 * (D.s || 1), ez, ease(k)); fox.position.y = D.y + 0.1; fox.rotation.y = Math.atan2(ex - (D.pad.x - 1.2 * (D.s || 1)), ez - (D.pad.z - 1.4 * (D.s || 1))); animFox(fox, dt, 3); if (k >= 1) { W.phase = 'walk'; W.t = 0; window.__spaceSnd && window.__spaceSnd('land', { v: 0.5 }); toast(W.d.padWalk ? 'Stick / WASD to walk. The shield keeps the air in. Walk to the ' + (W.d.office || W.d.name) + ' OFFICE door.' : 'Stick / WASD to walk. The shield keeps the air in. Walk into the dock to go aboard MERU SPACEDOCK.', 4); } }
      else if (W.phase === 'walk') { const mag = Math.min(1, Math.hypot(ix, iz)), V2 = 4.2 * (D.s || 1); W.sp = lerp(W.sp, mag * V2, 1 - Math.exp(-dt * 8));
        if (mag > 0.1) { const th = Math.atan2(ix, iz); let df = th - fox.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); fox.rotation.y += df * Math.min(1, dt * 10); }
        if (W.ship) { const nx = fox.position.x + Math.sin(fox.rotation.y) * W.sp * dt, nz = fox.position.z + Math.cos(fox.rotation.y) * W.sp * dt; const g = shipGround(nx, nz) || shipGround(nx, fox.position.z) || shipGround(fox.position.x, nz); if (g) { fox.position.set(g.x, g.y, g.z); W.where = g.where; } else W.where = W.where || 'deck'; }
        else { fox.position.x += Math.sin(fox.rotation.y) * W.sp * dt; fox.position.z += Math.cos(fox.rotation.y) * W.sp * dt;
        fox.position.x = clamp(fox.position.x, D.xT, D.xE + 1.2 * (D.s || 1)); fox.position.z = clamp(fox.position.z, D.z0 - D.w / 2 + 0.25, D.z0 + D.w / 2 - 0.25); fox.position.y = D.y + 0.1; } animFox(fox, dt, W.sp); if (W.sp > 0.4 && (W.stepT = (W.stepT || 0) - dt * W.sp / 3.2) <= 0) { W.stepT = 0.34; window.__spaceSnd && window.__spaceSnd('step'); }
        if (fox.position.x < D.capX && onInterior && !W.gone) { W.gone = true; W.sp = 0; onInterior(); return; }
        if (W.ship) { const S = W.ship, R2 = S.R, ins = W.where === 'in'; S.inside = ins; if (S.body) S.body.visible = !ins; for (const m of R2.CEIL) m.visible = !ins; const fxm = R2.PL.x; for (const q of R2.CUT) q.m.visible = !ins || q.x < fxm + 0.5; for (const a of R2.anims || []) a(dt, t);
          if (ins) { const Z = R2.zoneOf(), nr0 = R2.near(), ck = (Z === 'cockpit' || Z === 'bridge') && (!nr0 || /PILOT|CAPTAIN/.test(nr0.label)); const nr = ck ? null : nr0; W.nearR = nr; W.prompt = ck ? 'Take off' : nr ? (nr.text || 'Use ' + nr.label) : null;   /* anywhere on the bridge (not at the holo table) = TAKE OFF */ W.cam.look.copy(fox.position); W.cam.look.y += 0.3 * ((D.s || 1)); _q.set(1, 0, 0).transformDirection(S.grp.matrixWorld); const kM = API.metreK(W.d), nv = R2.nav || {}, zo = 1 + 1.4 * clamp((R2.PL.z - (R2.hd - 8)) / 8, 0, 1), Dr = (nv.D || 7) * kM * zo, Up = (nv.up || R2.h + 2) * kM * zo;   /* s570c zooms out as you near the ramp */ W.cam.pos.set(fox.position.x + _q.x * Dr, fox.position.y + Up, fox.position.z + _q.z * Dr); return; } W.nearR = null; }
        const S1 = D.s || 1, nearTP = Math.hypot(fox.position.x - D.tp.x, fox.position.z - D.tp.z) < 1.2 * S1, nearShip = !W.ship && fox.position.x > D.xE - 0.6 * S1;
        W.prompt = nearTP ? (W.d.padWalk ? 'Enter the ' + (W.d.office || W.d.name) + ' office' : W.d.open ? 'Teleport to ' + W.d.name : W.d.name + ' · opening soon') : nearShip ? 'Board ship' : null; }
      else if (W.phase === 'tele') { D.col.material.opacity = Math.min(0.75, t * 0.9); D.col.scale.y = 1 + t * 0.5; fox.scale.setScalar(Math.max(0.001, fox.userData._s * (1 - Math.max(0, t - 0.9) / 0.6))); if (t > 1.6 && !W.gone) { W.gone = true; onTeleport && onTeleport(); } if (!W.tpS) { W.tpS = true; window.__spaceSnd && window.__spaceSnd('teleport'); } }
      else if (W.phase === 'in' && W.inShipBoard) { if (t > 0.4) { W.inShipBoard = false; fox.visible = false; W.on = false; onBoarded && onBoarded(); } }
      else if (W.phase === 'in' && W.big) { if (pathStep(2.8 * (D.s || 1)) || t > 4) { fox.visible = false; W.on = false; onBoarded && onBoarded(); } }
      else if (W.phase === 'in') { const sx = D.pad.x - 1.2 * (D.s || 1), sz = D.pad.z - 1.4 * (D.s || 1), k = Math.min(1, t / 1.0); fox.position.x = lerp(P.x, sx, k * 0.2); fox.position.z = lerp(P.z, sz, k * 0.2); animFox(fox, dt, 3); if (t > 1.0) { fox.visible = false; W.on = false; onBoarded && onBoarded(); } }
      // camera: low, close, from the south, the fox in front, the deck + the ship behind
      const cs = D.s || 1;
      if (W.ship && W.phase === 'land') { W.cam.look.set(D.xE + 9 * cs, D.y + 0.6 * cs, D.z0); W.cam.pos.set(D.xE + 5 * cs - 30 * cs, D.y + 26 * cs, D.z0 - 34 * cs); return; }   /* s570d the landing, wide from the dock side */
      if (W.big && !W.ship && (W.phase === 'cockpit' || W.phase === 'land')) { const k = W.phase === 'cockpit' ? ease(Math.min(1, t / 2.4)) : 0, n = W.big.nose, d2 = W.big.door; W.cam.look.set(lerp(n[0], d2[0], k), lerp(n[1], d2[1], k) + 0.4 * cs, lerp(n[2], d2[2], k)); W.cam.pos.set(W.cam.look.x + 3.0 * cs, W.cam.look.y + 6.5 * cs, W.cam.look.z + 8.0 * cs); return; }   /* s569 the camera flies down the ship from the cockpit to the ramp */
      const fx = W.phase === 'land' ? D.pad.x : fox.position.x, fz = W.phase === 'land' ? D.pad.z : fox.position.z;
      if (W.big) { const onR = W.where === 'ramp', zf = W.ship ? (onR ? 2.4 : 3.2) : 1; W.cam.look.set(fx, fox.position.y + 0.3 * cs, fz); W.cam.pos.set(fx - 4.5 * cs * zf, fox.position.y + 4.4 * cs * zf, fz - 5.8 * cs * zf); return; }   /* s570c the fox CENTRED; on the ramp + the deck the camera pulls right out so you see a small fox on the space dock */   /* from the dock side (north-west): the fox in front, the ship behind it */   /* s569 big ship parked south: watch from along the deck (west) so the hull never hides the fox */
      W.cam.look.set(fx - 1.2 * cs, D.y + 0.9 * cs, fz - 0.5 * cs); W.cam.pos.set(fx + 1.0 * cs, D.y + (W.phase === 'land' ? 5.5 : 3.4) * cs, fz + (W.phase === 'land' ? 10 : 6.8) * cs); },
    talk() { if (!W.on || W.phase !== 'walk' || !W.prompt) return false; const D = W.D;
      if (W.prompt === 'Take off') { API.board(); return true; } if (W.nearR && W.ship && W.ship.inside) { W.nearR.act(); return true; }
      if (W.prompt.startsWith('Enter the ')) { snd && snd('menu'); toast((W.d.office || W.d.name) + ' OFFICE · the interior is coming next. Board your ship to leave.', 4); if (W.onOffice) W.onOffice(W.d); return true; }
      if (W.prompt.startsWith('Teleport')) { W.phase = 'tele'; W.t = 0; W.gone = false; fox.userData._s = fox.scale.x; snd && snd('shieldUp'); W.prompt = null; return true; }
      if (W.prompt === 'Board ship') { API.board(); return true; }
      if (W.prompt.includes('opening soon')) { toast(W.d.name + ' is still being built.'); return true; } return false; },
  };
  return API;
}
