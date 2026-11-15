// s729 AVATAR ARMOUR (Ben, BUILD_PLAN "NEXT: AVATAR ARMOUR"): each Player Planet species gets its own armour set, shaped for its body.
// Called from armor-sets.js dressArmor when set.species matches the fox's species kit. Same 8 part slots (chest … crest) so the
// Armor Workshop edits them like any set; the labels change per species (SPECIES_PARTS). add(parent, obj) registers a part for removal.
export const SPECIES_PARTS = {
  alien: { chest: 'CIRCUIT CUIRASS', shoulders: 'FLOATING SHARDS', helmet: 'HALO + THIRD EYE', gloves: 'LIGHT BRACERS', belt: 'GRAV BELT', boots: 'HOVER GREAVES', cape: 'PLASMA TRAIN', crest: 'CREST IN THE CIRCUITS' },
  gorilla: { chest: 'CORE PLATE', shoulders: 'HYDRAULIC PAULDRONS', helmet: 'ROLL CAGE + LAMP', gloves: 'KNUCKLE RAMS', belt: 'POWER CELL BELT', boots: 'STOMP GREAVES', cape: 'EXHAUST PACK', crest: 'CREST IN THE CORE' },
  bear: { chest: 'IRONWOOD BREASTPLATE', shoulders: 'LOG-END PAULDRONS', helmet: 'IRON BROW + RUNE', gloves: 'BRAWLER WRAPS', belt: 'PAW BUCKLE + HATCHET', boots: 'TIMBER GREAVES', cape: 'FUR CLOAK + COLLAR', crest: 'CREST IN THE WOOD' },
  eagle: { chest: 'FEATHER-SCALE CUIRASS', shoulders: 'FEATHER-BLADE PAULDRONS', helmet: 'STORM COMB', gloves: 'TALON VAMBRACES', belt: 'LION BELT + TAIL RINGS', boots: 'TALON GREAVES', cape: 'STORM WING GUARDS', crest: 'CREST ON THE SCALES' },
  lizard: { chest: 'SUNSTONE PECTORAL', shoulders: 'STEPPED PAULDRONS', helmet: 'SAIL GUARD', gloves: 'CLAW BRACERS', belt: 'SASH + TAIL RINGS', boots: 'SANDSTONE GREAVES', cape: 'WOVEN TABARD', crest: 'CREST IN THE SUN' },
  fly: { chest: 'FLIGHT HARNESS', shoulders: 'SHELL SPAULDERS', helmet: 'AVIATOR CAP + GOGGLES', gloves: 'FLIGHT GAUNTLETS', belt: 'TOOL BELT', boots: 'FLIGHT BOOTS', cape: 'SCARF + JET PACK', crest: 'CREST ON THE HARNESS' },
  bee: { chest: 'HONEYCOMB CUIRASS', shoulders: 'POLLEN BASKETS', helmet: 'COMB CROWN', gloves: 'WAX BRACERS', belt: 'ABDOMEN BANDS + DIPPER', boots: 'LACQUER GREAVES', cape: 'WING FRAMES', crest: 'CREST ON THE CUIRASS' },
  mantis: { chest: 'THORAX PLATES', shoulders: 'SHOULDER LAMES', helmet: 'HEAD CROWN', gloves: 'FOREARM BRACERS', belt: 'ABDOMEN PLATES', boots: 'LEG GREAVES', cape: 'WING COVERS', crest: 'CREST ON THE THORAX' },
};
export function dressMantis({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.mantis, pt = set.parts, TR = toon(set.trim || '#e9e1bf'), DS = { side: THREE.DoubleSide };
  const GL = new THREE.MeshToonMaterial({ color: set.glow || '#f5a524', emissive: new THREE.Color(set.glow || '#f5a524'), emissiveIntensity: 0.7, gradientMap: TR.gradientMap });
  const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;
  // THORAX: 3 overlapping lames down each flank (insect segments), a gap down the middle for the crest, bone edges, a glow line on the top lame
  if (pt.chest.on) { const g = G(P.body, pt.chest, 0, lift0, 0), m = toon(pt.chest.col, DS);
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const y = 0.98 - k * 0.12, r = 0.375 + k * 0.012, a0 = s > 0 ? 0.3 : Math.PI * 2 - 1.75, al = 1.45;
      const b = M(new THREE.CylinderGeometry(r, r + 0.02, 0.11, 18, 1, true, a0, al), m, 0, y, 0, g, 0); b.scale.set(1.05, 1, 1.14);
      const e = M(new THREE.CylinderGeometry(r + 0.022, r + 0.024, 0.02, 18, 1, true, a0, al), toon(set.trim || '#e9e1bf', DS), 0, y - 0.055, 0, g, 0); e.scale.set(1.05, 1, 1.14);
      if (!k) { const gl = M(new THREE.CylinderGeometry(r + 0.004, r + 0.006, 0.014, 18, 1, true, a0 + 0.15, al - 0.3), GL, 0, y + 0.02, 0, g, 0); gl.scale.set(1.05, 1, 1.14); } } }
  // HEAD CROWN: a ridged plate over the top of the triangle head, a swept-back fin, two horn tips over the eyes, a glow gem
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col, DS);
    const cr = M(new THREE.CylinderGeometry(0.1, 0.1, 0.78, 20, 1, true, -Math.PI / 2, Math.PI), m, 0, 0.255, -0.01, g, 0.012); cr.rotation.z = Math.PI / 2; cr.scale.set(1, 1, 1.25);
    M(new THREE.BoxGeometry(0.72, 0.018, 0.022), TR, 0, 0.27, 0.115, g, 0);
    const fin = M(new THREE.ConeGeometry(0.06, 0.24, 4), m, 0, 0.42, -0.04, g, 0.01); fin.scale.set(0.3, 1, 1); fin.rotation.x = -0.55;
    for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.026, 0.12, 5), TR, s * 0.33, 0.35, 0.03, g, 0.006); h.rotation.set(0.35, 0, -s * 0.5); }
    M(new THREE.SphereGeometry(0.026, 10, 8), GL, 0, 0.3, 0.12, g, 0.005); }
  // SHOULDER LAMES: a cap + two stepped bands like segments, bone rims, a spine pointing up + back
  if (pt.shoulders.on) for (const [i, arm] of (P.arms || []).entries()) { const s = i ? -1 : 1, g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col, DS);
    M(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), m, 0, 0, 0, g, 0.014, 0.13).scale.set(1.15, 0.85, 1.1);
    for (let k = 0; k < 2; k++) { const y = -0.04 - k * 0.055, r = 0.15 + k * 0.012; M(new THREE.CylinderGeometry(r - 0.012, r, 0.05, 16, 1, true), m, 0, y, 0, g, 0).scale.set(1.15, 1, 1.1);
      M(new THREE.TorusGeometry(r, 0.009, 5, 18), TR, 0, y - 0.025, 0, g, 0).rotation.x = Math.PI / 2; }
    const sp = M(new THREE.ConeGeometry(0.03, 0.14, 5), TR, s * 0.07, 0.09, -0.05, g, 0.006); sp.rotation.set(-0.5, 0, -s * 0.5); }
  // FOREARM BRACERS (on the forearm the scythe sits on): a sleeve, 2 bone rings, a back fin, a glow stud
  if (pt.gloves.on) (P.fore || P.arms || []).forEach((fo, i) => { const g = G(fo, pt.gloves, 0, -0.12, 0), m = toon(pt.gloves.col);
    M(new THREE.CylinderGeometry(0.082, 0.07, 0.17, 12), m, 0, 0, 0, g, 0.013, 0.08);
    for (const y of [0.08, -0.08]) M(new THREE.TorusGeometry(y > 0 ? 0.082 : 0.07, 0.01, 5, 16), TR, 0, y, 0, g, 0).rotation.x = Math.PI / 2;
    const f = M(new THREE.ConeGeometry(0.04, 0.16, 4), m, 0, 0.0, -0.08, g, 0.008); f.scale.set(0.25, 1, 1); f.rotation.x = 0.35;
    M(new THREE.SphereGeometry(0.018, 8, 6), GL, 0, 0, 0.078, g, 0); });
  // ABDOMEN PLATES: a dorsal plate on every segment of the long abdomen, a glow keel on every other one + a waist band
  if (pt.belt.on) { const m = toon(pt.belt.col, DS);
    if (L && L.abSeg) L.abSeg.forEach((sg, k) => { const r = 0.12 - Math.abs(k - 2) * 0.012, g = G(sg, pt.belt, 0, 0, 0);
      M(new THREE.SphereGeometry(r * 1.08, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), k % 2 ? toon(set.trim || '#e9e1bf', DS) : m, 0, 0, -0.06, g, 0.008).scale.set(1.2, 0.92, 1.08);
      if (!(k % 2)) M(new THREE.SphereGeometry(0.016, 8, 6), GL, 0, r * 0.95, -0.06, g, 0); });
    const g = G(P.body, pt.belt, 0, 0.64 + lift0, 0); const b = M(new THREE.TorusGeometry(0.3, 0.03, 8, 32), TR, 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1); }
  // LEG GREAVES: a shin sleeve + a knee cap + a bone ring (slim, the mantis legs are thin)
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col);
    M(new THREE.CylinderGeometry(0.068, 0.056, 0.15, 10), m, 0, 0, 0, g, 0.012, 0.068);
    M(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), m, 0, 0.09, 0.035, g, 0.01, 0.06).rotation.x = 1.2;
    M(new THREE.TorusGeometry(0.058, 0.009, 5, 14), TR, 0, -0.075, 0, g, 0).rotation.x = Math.PI / 2; });
  // WING COVERS (tegmina): a hard opaque plate over each folded wing, a bone vein, a glowing eye-spot near the tip
  if (pt.cape.on && L && L.wings) L.wings.forEach(wg => { const g = G(wg, pt.cape, 0, 0, 0), m = toon(pt.cape.col);
    M(new THREE.SphereGeometry(0.16, 18, 12), m, 0, -0.33, -0.045, g, 0.01).scale.set(1.0, 2.25, 0.16);
    M(new THREE.BoxGeometry(0.014, 0.6, 0.01), TR, 0, -0.33, -0.072, g, 0);
    const es = M(new THREE.SphereGeometry(0.045, 12, 8), TR, 0, -0.56, -0.068, g, 0); es.scale.z = 0.25;
    const ed = M(new THREE.SphereGeometry(0.026, 10, 8), GL, 0, -0.56, -0.076, g, 0); ed.scale.z = 0.3; });
}

// s731 BEE · HIVEGUARD AMBERPLATE (Ben: a different world's style, made for the bee): dark lacquered plate under a raised HONEYCOMB of gold cells
// filled with glowing honey (laid onto the real cuirass by raycast, ringing the crest), honey drips, pollen-basket pauldrons (gold cages round a
// glowing pollen ball), a comb crown with hex prongs + antenna rings, cream wax bracers, gold abdomen bands + a stinger sheath, gold filigree wing frames.
export function trimCuffs({ toon }, fox, set) { const u = fox.userData, P = u.P; if (!P) return; const km = u.kneeMat0 || (u.kneeMat0 = P.kneeMat); if (!km) return; const tm = toon(set.trim || '#e6b45a'); fox.traverse(o => { if (o.isMesh && (o.material === km || o.userData.cuffTrim)) { o.material = tm; o.userData.cuffTrim = true; } }); }
export function dressBee({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.bee, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const GOLD = toon(set.trim || '#e0a82e', { emissive: new THREE.Color('#5a3a08'), emissiveIntensity: 0.3 }), LAQ = toon(set.torso[0]);
  const HON = new THREE.MeshToonMaterial({ color: set.glow || '#ffb020', emissive: new THREE.Color(set.glow || '#ffb020'), emissiveIntensity: 0.55, gradientMap: GOLD.gradientMap });
  const WAX = c => toon(c || '#f3e3b0'), hexG = (r, h) => new THREE.CylinderGeometry(r, r, h, 6);
  // HONEYCOMB CUIRASS: cast rays at the real breastplate so the cells sit on it (works with the tall build), skip the crest + the neck
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); const yB = -9   /* s736 Ben approved the bee as it was: keep the old placement (the group is remapped with the torso) */, FR = toon(pt.chest.col); body.updateMatrixWorld(true);
    const tg = body.children.filter(o => o.isMesh && o.geometry && o.geometry.type === 'LatheGeometry' && o.visible && !o.userData.crest && !o.userData.neck && !(u.armorAdd || []).includes(o) && o.material && o.material.side !== THREE.BackSide);
    let cx = 0, cy = 1.07 + (P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0); const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); const c = new THREE.Vector3(); cm.geometry.boundingBox.getCenter(c); cx = c.x; cy = c.y; }
    const rc = new THREE.Raycaster(), inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), dW = V(0, 0, -1).transformDirection(body.matrixWorld), sc = pt.chest.s || 1, R = 0.037 * sc, dx = 0.074 * sc, dy = 0.064 * sc, low = {};
    for (let j = -4; j <= 4; j++) for (let i = -6; i <= 6; i++) { const x = cx + i * dx + (j & 1 ? dx / 2 : 0), y = cy + j * dy + (pt.chest.y || 0); if (Math.hypot(x - cx, y - cy) < 0.205) continue;
      rc.set(body.localToWorld(V(x, y, 1.5)), dW); const h = rc.intersectObjects(tg, false)[0]; if (!h) continue; const p = h.point.clone().applyMatrix4(inv), n = h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv);
      if (n.z < 0.25 || p.z < 0.08 || p.y < yB) continue; const c = new THREE.Group(); c.position.copy(p).addScaledVector(n, 0.004 + (pt.chest.z || 0)); c.quaternion.setFromUnitVectors(V(0, 1, 0), n); g.add(c);
      M(hexG(R, 0.022), FR, 0, 0.01, 0, c, 0.006, R); M(hexG(R * 0.7, 0.02), HON, 0, 0.016, 0, c, 0);
      if (!low[i] || low[i].y > p.y) low[i] = p; }
    for (const [i, p] of Object.entries(low)) if (+i % 2) { const d = M(new THREE.SphereGeometry(0.016, 10, 8), HON, p.x, p.y - 0.05, p.z + 0.004, g, 0); d.scale.set(1, 1.5, 1); M(new THREE.CylinderGeometry(0.006, 0.011, 0.03, 6), HON, p.x, p.y - 0.03, p.z + 0.003, g, 0); } }
  // COMB CROWN: a gold band round the fuzzy head, hex prongs across the front half, an amber hex gem, rings at the antenna roots
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col), y0 = 0.2, r0 = Math.sqrt(0.38 * 0.38 - y0 * y0) + 0.012;
    const band = M(new THREE.CylinderGeometry(r0 + 0.004, r0 + 0.012, 0.07, 32, 1, true), m, 0, y0 + 0.02, 0, g, 0.01); band.scale.set(1.08, 1, 0.98); band.material = toon(pt.helmet.col, { side: THREE.DoubleSide });
    for (let k = -3; k <= 3; k++) { const a = k * 0.36, x = Math.sin(a) * r0 * 1.08, z = Math.cos(a) * r0 * 0.98, hgt = k === 0 ? 0.16 : 0.1 - Math.abs(k) * 0.012;
      const pr = M(new THREE.CylinderGeometry(0.004, 0.03, hgt, 6), m, x, y0 + 0.055 + hgt / 2, z, g, 0.006); pr.rotation.y = a; pr.rotation.x = -0.18; }
    const gem = M(hexG(0.04, 0.02), HON, 0, y0 + 0.03, r0 * 0.98 + 0.012, g, 0.006, 0.04); gem.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) M(new THREE.TorusGeometry(0.03, 0.009, 6, 14), GOLD, s * 0.12, 0.335, 0.12, g, 0).rotation.x = Math.PI / 2; }
  // POLLEN BASKETS: a lacquer cap, a gold cage of curved ribs round a glowing pollen ball, a gold rim
  if (pt.shoulders.on) for (const arm of P.arms || []) { const g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col);
    M(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), LAQ, 0, -0.01, 0, g, 0.014, 0.135).scale.set(1.15, 0.7, 1.1);
    M(new THREE.SphereGeometry(0.08, 14, 10), HON, 0, 0.07, 0, g, 0.008, 0.08);
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, pts = []; for (let q = 0; q <= 8; q++) { const b = q / 8 * Math.PI; pts.push(V(Math.cos(a) * Math.sin(b) * 0.11, 0.07 + Math.cos(b) * 0.1, Math.sin(a) * Math.sin(b) * 0.11)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.009, 5), m)); }
    M(new THREE.TorusGeometry(0.15, 0.014, 6, 20), m, 0, -0.01, 0, g, 0).rotation.x = Math.PI / 2; }
  // WAX BRACERS: a cream wax sleeve, a ring of dark hex studs, a gold cuff, a honey drip off the cuff
  if (pt.gloves.on) (P.fore || P.arms || []).forEach(fo => { const g = G(fo, pt.gloves, 0, -0.12, 0), m = WAX(pt.gloves.col);
    M(new THREE.CylinderGeometry(0.082, 0.072, 0.17, 12), m, 0, 0, 0, g, 0.013, 0.08);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, st = M(hexG(0.018, 0.012), LAQ, Math.sin(a) * 0.08, 0.01, Math.cos(a) * 0.08, g, 0); st.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.sin(a), 0, Math.cos(a))); }
    M(new THREE.TorusGeometry(0.074, 0.013, 6, 16), GOLD, 0, -0.085, 0, g, 0).rotation.x = Math.PI / 2;
    const d = M(new THREE.SphereGeometry(0.017, 8, 6), HON, 0, -0.11, 0.07, g, 0); d.scale.set(1, 1.5, 1); });
  // ABDOMEN BANDS: 3 gold lacquer bands over the striped bum + a gold stinger sheath; a waist belt with a honey dipper on the hip
  if (pt.belt.on) { const m = toon(pt.belt.col, { side: THREE.DoubleSide });
    if (L && L.ab) { const g = G(L.ab, { ...pt.belt, s: 1 }, 0, 0, 0); for (const gz of [-0.19, -0.03, 0.11]) { const r = Math.sqrt(0.32 * 0.32 - gz * gz) + 0.012, z = -0.27 + gz * 1.3;
        const b = M(new THREE.CylinderGeometry(r, r, 0.07, 28, 1, true), m, 0, 0, z, g, 0); b.rotation.x = Math.PI / 2; b.scale.set(1, 1, 0.95); M(new THREE.TorusGeometry(r + 0.002, 0.008, 5, 28), HON, 0, 0, z - 0.035, g, 0).scale.set(1, 0.95, 1); }
      const sh = M(new THREE.ConeGeometry(0.045, 0.1, 6), m, 0, 0, -0.69, g, 0.006); sh.rotation.x = -Math.PI / 2; }
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, g = G(body, pt.belt, 0, 0.64 + lift0, 0); const b = M(new THREE.TorusGeometry(0.3, 0.032, 8, 32), m, 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1);
    const dp = new THREE.Group(); dp.position.set(0.3, -0.04, 0.12); dp.rotation.set(0.15, 0, 0.25); g.add(dp); M(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), toon('#8a5a2a'), 0, 0.02, 0, dp, 0.005);
    for (let k = 0; k < 4; k++) M(new THREE.SphereGeometry(0.03 - Math.abs(k - 1.5) * 0.004, 10, 8), GOLD, 0, -0.1 - k * 0.022, 0, dp, 0.004).scale.set(1, 0.6, 1);
    M(new THREE.SphereGeometry(0.016, 8, 6), HON, 0, -0.2, 0, dp, 0).scale.set(1, 1.6, 1); }
  // LACQUER GREAVES: a dark shin plate with a gold hex knee + rim
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col);
    M(new THREE.CylinderGeometry(0.078, 0.066, 0.16, 12), m, 0, 0, 0, g, 0.012, 0.078);
    const kn = M(hexG(0.05, 0.02), GOLD, 0, 0.1, 0.06, g, 0.006, 0.05); kn.rotation.x = Math.PI / 2; M(hexG(0.032, 0.02), HON, 0, 0.1, 0.068, g, 0).rotation.x = Math.PI / 2;
    M(new THREE.TorusGeometry(0.068, 0.01, 5, 14), GOLD, 0, -0.08, 0, g, 0).rotation.x = Math.PI / 2; });
  // WING FRAMES: gold filigree round each wing (follows the buzzing wing), two struts + an amber root stud
  if (pt.cape.on && L && L.wings) L.wings.forEach(({ g: wg, s }) => { const g = G(wg, { ...pt.cape, s: 1 }, 0, 0, 0), m = toon(pt.cape.col);
    for (const [px, py, rz, rx, ry] of [[s * 0.45, 0.12, s * 0.22, 0.445, 0.14], [s * 0.32, -0.12, -s * 0.25, 0.28, 0.09]]) { const f = new THREE.Group(); f.position.set(px, py, 0.004); f.rotation.z = rz; g.add(f);
      const pts = []; for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; pts.push(V(Math.cos(a) * rx, Math.sin(a) * ry, 0)); } f.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 60, 0.008, 5, true), m));
      for (const t of [0.3, -0.25]) { const c = new THREE.CatmullRomCurve3([V(-rx, 0, 0), V(0, t * ry, 0), V(rx * 0.85, t * ry * 1.6, 0)]); f.add(new THREE.Mesh(new THREE.TubeGeometry(c, 12, 0.005, 4), m)); } }
    M(hexG(0.03, 0.02), HON, s * 0.02, 0.0, 0.01, g, 0.005, 0.03).rotation.x = Math.PI / 2; });
}

// s732 FLY · SKYRACER FLIGHT RIG (Ben: a different world's style for the fly): a racing pilot's rig. Gunmetal under an oil-slick IRIDESCENT
// shell (teal → violet, vertex shaded), brown leather straps + brass buckles, a red racing stripe to match his eyes. Leather harness over the
// chest (raycast onto the real cuirass), layered shell spaulders with a racing roundel, an aviator cap with brass goggles pushed up, flared
// gauntlets, a tool belt with pouches + a fuel can, buckled flight boots, a red scarf that streams behind + a twin jet pack whose nozzles fire
// when the wings buzz (armorFx, ticked by tickArmor).
export function dressFly({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.fly, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z), lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;
  const BR = toon(set.trim || '#d9a93e', { emissive: new THREE.Color('#4a3008'), emissiveIntensity: 0.25 }), LEA = toon('#6b3f22'), LED = toon('#3e2414'), RED = toon(set.stripe || '#c0261c');
  const GLW = new THREE.MeshBasicMaterial({ color: set.glow || '#3fe0d0', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
  const irid = (geo, c0, c1) => { const p = geo.attributes.position, col = [], a = new THREE.Color(c0 || '#2fc4c0'), b = new THREE.Color(c1 || '#7a4ad8'), c = new THREE.Color(); geo.computeBoundingBox(); const bb = geo.boundingBox, h = (bb.max.y - bb.min.y) || 1;
    for (let i = 0; i < p.count; i++) { const k = (p.getY(i) - bb.min.y) / h, w = 0.5 + 0.5 * Math.sin(k * 5 + p.getX(i) * 9); c.copy(a).lerp(b, w).lerp(new THREE.Color('#1a2230'), 0.25); col.push(c.r, c.g, c.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return geo; };
  const IR = toon('#ffffff', { vertexColors: true });
  body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), rc = new THREE.Raycaster();
  const tg = body.children.filter(o => o.isMesh && o.visible && !o.userData.crest && !o.userData.neck && !(u.armorAdd || []).includes(o) && o.material && o.material.side !== THREE.BackSide && o.geometry && o.geometry.type !== 'TorusGeometry');
  const surf = (x, y, back) => { rc.set(body.localToWorld(V(x, y, back ? -1.5 : 1.5)), V(0, 0, back ? 1 : -1).transformDirection(body.matrixWorld)); const h = rc.intersectObjects(tg, false)[0]; if (!h) return null; return { p: h.point.clone().applyMatrix4(inv), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv) }; };
  let cy = 1.07 + lift0; { const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); cy = (cm.geometry.boundingBox.min.y + cm.geometry.boundingBox.max.y) / 2 + cm.position.y; } }
  const strap = (pts, g, mat, r = 0.022) => { const q = pts.map(([x, y, b]) => { const h = surf(x, y, b); return h ? h.p.addScaledVector(h.n, 0.016) : null; }).filter(Boolean); if (q.length < 2) return null; const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q), 24, r, 6), mat); tb.scale.z = 1; g.add(tb); return q; };
  const buckle = (x, y, g, b) => { const h = surf(x, y, b); if (!h) return; const k = new THREE.Group(); k.position.copy(h.p).addScaledVector(h.n, 0.03); k.quaternion.setFromUnitVectors(V(0, 0, 1), h.n); g.add(k); M(new THREE.BoxGeometry(0.075, 0.06, 0.016), BR, 0, 0, 0, k, 0.005); M(new THREE.BoxGeometry(0.045, 0.03, 0.02), LED, 0, 0, 0.002, k, 0); };
  u.armorFx = [];
  // FLIGHT HARNESS: two leather straps over the shoulders past the crest to a belly strap, brass buckles, a red racing stripe down the left strap
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); g.userData.built = true; const yB = (wst => wst ? wst.position.y : 0.64)(body.children.find(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.29)) + 0.06   /* the real waist (after the tall build) */, m = toon(pt.chest.col);
    for (const s of [-1, 1]) { strap([[s * 0.17, cy + 0.3], [s * 0.21, cy + 0.18], [s * 0.225, cy], [s * 0.2, cy - 0.2], [s * 0.15, cy - 0.3]], g, m); strap([[s * 0.17, cy + 0.28, true], [s * 0.2, cy + 0.05, true], [s * 0.18, cy - 0.25, true]], g, m); buckle(s * 0.225, cy + 0.02, g); }
    strap([[-0.3, cy - 0.27], [-0.15, cy - 0.31], [0, cy - 0.32], [0.15, cy - 0.31], [0.3, cy - 0.27]], g, m, 0.024); buckle(0, cy - 0.32, g);
    strap([[0.17 + 0.012, cy + 0.29], [0.21 + 0.014, cy + 0.18]], g, RED, 0.009); }
  // AVIATOR CAP + GOGGLES: a leather cap over the top + back of the head with a seam + ear flaps, brass goggles pushed up on the brow (red lenses)
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col, { side: THREE.DoubleSide });
    const cap = M(new THREE.SphereGeometry(0.315, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.42), m, 0, 0.0, -0.02, g, 0.012); cap.scale.set(1.06, 0.98, 0.94); cap.rotation.x = -0.35;
    const seam = M(new THREE.TorusGeometry(0.3, 0.007, 4, 30, Math.PI), LED, 0, 0.0, -0.02, g, 0); seam.rotation.set(0, Math.PI / 2, 0); seam.rotation.x = -0.35; seam.scale.set(1.06, 0.98, 0.94);
    for (const s of [-1, 1]) { const fl = M(new THREE.BoxGeometry(0.03, 0.16, 0.12), m, s * 0.29, -0.06, -0.12, g, 0.008); fl.rotation.z = s * 0.15; M(new THREE.SphereGeometry(0.016, 8, 6), BR, s * 0.305, -0.13, -0.12, g, 0); }
    const gg = new THREE.Group(); gg.position.set(0, 0.2, 0.16); gg.rotation.x = -0.75; g.add(gg);
    for (const s of [-1, 1]) { const lg = new THREE.Group(); lg.position.set(s * 0.075, 0, 0.04); gg.add(lg); M(new THREE.CylinderGeometry(0.058, 0.05, 0.045, 18), BR, 0, 0, 0, lg, 0.008, 0.058).rotation.x = Math.PI / 2;
      M(new THREE.CircleGeometry(0.044, 18), new THREE.MeshToonMaterial({ color: '#e04a3a', emissive: new THREE.Color('#7a1010'), emissiveIntensity: 0.4, gradientMap: BR.gradientMap }), 0, 0, 0.024, lg, 0); M(new THREE.CircleGeometry(0.012, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.015, 0.015, 0.026, lg, 0); }
    M(new THREE.BoxGeometry(0.04, 0.018, 0.02), BR, 0, 0, 0.04, gg, 0); }
  // SHELL SPAULDERS: 3 overlapping iridescent shell plates, a red + white racing roundel on top
  if (pt.shoulders.on) for (const [i, arm] of (P.arms || []).entries()) { const s = i ? -1 : 1, g = G(arm, pt.shoulders, 0, 0.03, 0);
    for (let k = 0; k < 3; k++) { const sh = M(irid(new THREE.SphereGeometry(0.14 - k * 0.012, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), set.glow, set.glow2), IR, 0, -k * 0.055, 0, g, 0.012, 0.14); sh.scale.set(1.15, 0.6, 1.1); }
    const rd = new THREE.Group(); rd.position.set(s * 0.09, 0.05, 0); rd.rotation.z = -s * 0.9; g.add(rd); [[0.05, '#f3f2f2'], [0.036, RED.color.getStyle()], [0.018, '#f3f2f2']].forEach(([r, c], j) => M(new THREE.CylinderGeometry(r, r, 0.01, 18), toon(c), 0, 0.005 + j * 0.003, 0, rd, j ? 0 : 0.005)); }
  // FLIGHT GAUNTLETS: a flared leather cuff with a brass buckle strap + a red stripe
  if (pt.gloves.on) (P.fore || P.arms || []).forEach(fo => { const g = G(fo, pt.gloves, 0, -0.14, 0), m = toon(pt.gloves.col);
    M(new THREE.CylinderGeometry(0.1, 0.072, 0.16, 14), m, 0, 0, 0, g, 0.012, 0.09); M(new THREE.TorusGeometry(0.1, 0.008, 4, 16), RED, 0, 0.075, 0, g, 0).rotation.x = Math.PI / 2;
    M(new THREE.TorusGeometry(0.082, 0.012, 5, 16), LED, 0, -0.02, 0, g, 0).rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.04, 0.035, 0.02), BR, 0, -0.02, 0.088, g, 0.004); });
  // TOOL BELT: a leather belt, a brass buckle, 2 pouches + a little fuel can on the hips
  if (pt.belt.on) { const g = G(body, pt.belt, 0, 0.64 + lift0, 0), m = toon(pt.belt.col); const b = M(new THREE.TorusGeometry(0.3, 0.035, 8, 32), m, 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1);
    M(new THREE.BoxGeometry(0.09, 0.07, 0.03), BR, 0, 0, 0.34, g, 0.005);
    for (const s of [-1, 1]) { const pc = M(new THREE.BoxGeometry(0.09, 0.1, 0.06), LEA, s * 0.27, -0.05, 0.16, g, 0.008); pc.rotation.y = s * 0.6; M(new THREE.BoxGeometry(0.095, 0.03, 0.065), LED, s * 0.27, 0.0, 0.16, g, 0).rotation.y = s * 0.6; }
    const can = new THREE.Group(); can.position.set(0.0, -0.06, -0.33); g.add(can); M(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 12), RED, 0, 0, 0, can, 0.006, 0.045).rotation.z = Math.PI / 2; M(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8), BR, 0.07, 0, 0, can, 0).rotation.z = Math.PI / 2; }
  // FLIGHT BOOTS: leather shin, two brass buckle straps, an iridescent shin guard
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col);
    M(new THREE.CylinderGeometry(0.082, 0.07, 0.17, 12), m, 0, 0, 0, g, 0.012, 0.08);
    for (const y of [0.04, -0.04]) { M(new THREE.TorusGeometry(y > 0 ? 0.083 : 0.076, 0.009, 4, 14), LED, 0, y, 0, g, 0).rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.03, 0.022, 0.014), BR, 0.06, y, 0.055, g, 0).rotation.y = 0.8; }
    const gd = M(irid(new THREE.CylinderGeometry(0.088, 0.078, 0.15, 12, 1, true, -0.9, 1.8), set.glow, set.glow2), toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), 0, 0.01, 0.004, g, 0); });
  // SCARF + JET PACK: a red scarf knotted at the neck whose tail streams + flutters behind; a brass twin jet between the wing roots, nozzles fire on a buzz
  if (pt.cape.on) { const nk = body.children.find(o => o.userData.neck), ny = nk ? nk.position.y : 1.24 + lift0, g = G(body, { ...pt.cape, s: 1 }, 0, 0, 0); g.userData.built = true; const _f = 0, m = toon(pt.cape.col, { side: THREE.DoubleSide });
    const ring = M(new THREE.TorusGeometry(0.2, 0.05, 8, 24), m, 0, ny + 0.0, 0, g, 0.01); ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.05, 0.9);
    M(new THREE.SphereGeometry(0.06, 10, 8), m, 0.12, ny - 0.03, 0.16, g, 0.008);
    let par = new THREE.Group(); par.position.set(0.1, ny - 0.02, -0.17); par.rotation.set(-0.5, 0.3, 0); g.add(par); const segs = [];
    for (let k = 0; k < 5; k++) { const sg = new THREE.Group(); sg.position.y = k ? -0.12 : 0; par.add(sg); const b = M(new THREE.BoxGeometry(0.1 - k * 0.008, 0.125, 0.014), m, 0, -0.06, 0, sg, 0.006); if (k === 4) { b.geometry = new THREE.BoxGeometry(0.09, 0.125, 0.014); for (const x of [-0.03, 0, 0.03]) M(new THREE.BoxGeometry(0.012, 0.04, 0.015), m, x, -0.14, 0, sg, 0); } segs.push(sg); par = sg; }
    const bk = surf(0, 1.25, true), bz = bk ? bk.p.z - 0.07 : -0.42, pk = new THREE.Group(); pk.position.set(0, 1.22, bz); g.add(pk); const flames = [];
    M(new THREE.BoxGeometry(0.12, 0.22, 0.06), LED, 0, 0, 0.04, pk, 0.008);
    for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 14), BR, s * 0.075, 0, 0, pk, 0.01, 0.055); M(new THREE.SphereGeometry(0.055, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), BR, s * 0.075, 0.14, 0, pk, 0.008);
      M(new THREE.CylinderGeometry(0.035, 0.05, 0.07, 12, 1, true), toon('#2a2c30', { side: THREE.DoubleSide }), s * 0.075, -0.175, 0, pk, 0.006); M(new THREE.TorusGeometry(0.056, 0.008, 4, 14), RED, s * 0.075, 0.07, 0, pk, 0).rotation.x = Math.PI / 2;
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.26, 10, 1, true), GLW); fl.rotation.x = Math.PI; fl.position.set(s * 0.075, -0.33, 0); pk.add(fl); fl.visible = false; flames.push(fl);
      const pilot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), GLW); pilot.position.set(s * 0.075, -0.2, 0); pk.add(pilot); }
    u.armorFx.push(t => { const on = L && L.buzz > 0, w = on ? 1 : 0.35; segs.forEach((sg, k) => { sg.rotation.x = (k ? 0.18 : 0) - (on ? 0.55 : 0) * (k ? 0.25 : 1) + Math.sin(t * (on ? 14 : 3) - k * 0.9) * (0.08 + k * 0.03) * w; sg.rotation.z = Math.sin(t * (on ? 11 : 2.2) - k * 0.7) * 0.06 * w; });
      flames.forEach((f, i) => { f.visible = on; if (on) { const k = 0.8 + Math.random() * 0.45; f.scale.set(k * 0.9, k, k * 0.9); } }); }); }
}

// s733 LIZARD · SUNSTONE SENTINEL (Ben: a different world's style, made for the lizard): a desert temple guard. Carved sandstone + terracotta
// tiles, turquoise inlay, beaten copper, a stepped-fret weave. SUN PECTORAL = a ring of tiles + copper rays round the crest (raycast onto the
// cuirass), stepped ziggurat pauldrons, a copper SAIL GUARD along the base of the orange head sail + a brow band, claw bracers, a fret-woven
// sash, copper rings down the long tail + a copper spear tip, carved greaves, a fret tabard that sways.
const fretTex = (THREE, a, b, c) => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const g = cv.getContext('2d'); g.fillStyle = a; g.fillRect(0, 0, 256, 64);
  g.fillStyle = b; g.fillRect(0, 0, 256, 7); g.fillRect(0, 57, 256, 7); g.strokeStyle = b; g.lineWidth = 6; g.lineCap = 'square';
  for (let x = 0; x < 256; x += 32) { g.beginPath(); g.moveTo(x + 4, 50); g.lineTo(x + 4, 16); g.lineTo(x + 26, 16); g.lineTo(x + 26, 40); g.lineTo(x + 14, 40); g.lineTo(x + 14, 28); g.stroke(); }
  g.fillStyle = c; for (let x = 16; x < 256; x += 32) g.fillRect(x + 12, 46, 6, 6); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t; };
export function dressLizard({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.lizard, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z), lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;
  const SAND = toon(set.torso[0]), TERR = toon(set.torso[1]), OBS = toon('#2a1c16'), CU = toon(set.trim || '#c87533', { emissive: new THREE.Color('#4a2208'), emissiveIntensity: 0.25 });
  const TQ = toon(set.glow || '#2ec4b6', { emissive: new THREE.Color(set.glow || '#2ec4b6'), emissiveIntensity: 0.3 }), FRET = fretTex(THREE, set.torso[0], set.torso[1], set.glow || '#2ec4b6');
  body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), rc = new THREE.Raycaster();
  const tg = body.children.filter(o => o.isMesh && o.visible && o.geometry && o.geometry.type === 'LatheGeometry' && !o.userData.crest);
  const surf = (x, y) => { rc.set(body.localToWorld(V(x, y, 1.5)), V(0, 0, -1).transformDirection(body.matrixWorld)); const h = rc.intersectObjects(tg, false)[0]; if (!h) return null; return { p: h.point.clone().applyMatrix4(inv), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv) }; };
  let cx = 0, cy = 1.07 + lift0; { const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); const c = V(0, 0, 0); cm.geometry.boundingBox.getCenter(c); cx = c.x + cm.position.x; cy = c.y + cm.position.y;   /* s737 the tall build MOVES the crest decal */ } }
  u.armorFx = u.armorFx || [];
  // SUNSTONE PECTORAL: 14 carved tiles (turquoise inlay) ring the crest with copper rays between them, a terracotta inner ring
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); g.userData.built = true; const yB = (wst => wst ? wst.position.y : 0.64)(body.children.find(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.29)) + 0.06   /* the real waist (after the tall build) */, m = toon(pt.chest.col), sc = pt.chest.s || 1, R0 = 0.245 * sc, N = 14;
    for (let k = 0; k < N * 2; k++) { const a = k / (N * 2) * Math.PI * 2 + Math.PI / 2, tile = !(k % 2), r = R0 + (tile ? 0 : 0.012), h = surf(cx + Math.cos(a) * r, cy + Math.sin(a) * r + (pt.chest.y || 0)); if (!h || h.n.z < 0.2) continue;
      const q = new THREE.Group(); q.position.copy(h.p).addScaledVector(h.n, 0.006 + (pt.chest.z || 0)); q.quaternion.setFromUnitVectors(V(0, 0, 1), h.n); q.rotateZ(a - Math.PI / 2); g.add(q);
      if (tile) { M(new THREE.BoxGeometry(0.075 * sc, 0.06 * sc, 0.022), m, 0, 0, 0.011, q, 0.006); M(new THREE.BoxGeometry(0.03 * sc, 0.03 * sc, 0.01), TQ, 0, 0, 0.024, q, 0); M(new THREE.BoxGeometry(0.075 * sc, 0.01, 0.012), TERR, 0, -0.03 * sc, 0.02, q, 0); }
      else { const ray = M(new THREE.ConeGeometry(0.022 * sc, 0.075 * sc, 4), CU, 0, 0.012, 0.012, q, 0.004); ray.scale.z = 0.35; } } }
  // SAIL GUARD: copper rails along both sides of the sail base with a ring at every spine, a brow band round the back of the skull, turquoise studs
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col), base = zz => 0.8 * Math.sqrt(Math.max(0, 0.1296 - (zz + 0.02) ** 2));
    for (const s of [-1, 1]) { const pts = []; for (let k = 0; k <= 12; k++) { const zz = 0.16 - k / 12 * 0.56; pts.push(V(s * 0.034, base(zz) - 0.015, zz)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.014, 6), m)); }
    for (let k = 0; k < 5; k++) { const zz = 0.16 - ((k + 0.3) / 5) * 0.56, r = M(new THREE.TorusGeometry(0.036, 0.01, 5, 12), m, 0, base(zz) - 0.01, zz, g, 0); r.rotation.x = Math.PI / 2; r.scale.set(1, 1.6, 1); M(new THREE.SphereGeometry(0.014, 8, 6), TQ, 0.045, base(zz) - 0.012, zz, g, 0); M(new THREE.SphereGeometry(0.014, 8, 6), TQ, -0.045, base(zz) - 0.012, zz, g, 0); }
  }
  // STEPPED PAULDRONS: a 3-tier ziggurat on each shoulder, sandstone + obsidian tiers, copper edges, a turquoise capstone
  if (pt.shoulders.on) for (const arm of P.arms || []) { const g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col);
    M(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), OBS, 0, -0.02, 0, g, 0.012, 0.13).scale.set(1.15, 0.75, 1.1);
    [[0.3, 0.27, -0.01, m], [0.23, 0.21, 0.035, OBS], [0.16, 0.15, 0.075, m]].forEach(([w, d, y, mt]) => { M(new THREE.BoxGeometry(w, 0.045, d), mt, 0, y, 0, g, 0.008); M(new THREE.BoxGeometry(w + 0.012, 0.012, d + 0.012), CU, 0, y - 0.022, 0, g, 0); });
    M(new THREE.BoxGeometry(0.07, 0.04, 0.07), TQ, 0, 0.11, 0, g, 0.006); }
  // CLAW BRACERS: a copper sleeve, a turquoise band, 3 swept claw spikes on the outside
  if (pt.gloves.on) (P.fore || P.arms || []).forEach((fo, i) => { const s = i ? -1 : 1, g = G(fo, pt.gloves, 0, -0.12, 0), m = toon(pt.gloves.col);
    M(new THREE.CylinderGeometry(0.084, 0.072, 0.17, 12), m, 0, 0, 0, g, 0.013, 0.08); M(new THREE.TorusGeometry(0.084, 0.012, 5, 16), TQ, 0, 0.05, 0, g, 0).rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) { const c = M(new THREE.ConeGeometry(0.02, 0.1, 5), OBS, s * 0.08, 0.04 - k * 0.05, -0.02, g, 0.005); c.rotation.set(-0.3, 0, -s * 1.1); } });
  // SASH + TAIL RINGS: a fret-woven sash with a copper sun clasp; copper bands with turquoise studs down the tail, a copper spear tip
  if (pt.belt.on) { const g = G(body, pt.belt, 0, 0.64 + lift0, 0), tx = FRET.clone(); tx.needsUpdate = true; tx.repeat.set(3, 1);
    const sh = M(new THREE.CylinderGeometry(0.305, 0.3, 0.11, 36, 1, true), new THREE.MeshToonMaterial({ map: tx, gradientMap: SAND.gradientMap, side: THREE.DoubleSide }), 0, 0, 0, g, 0); sh.scale.set(1.04, 1, 1.12);
    M(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), CU, 0, 0, 0.345, g, 0.005).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.028, 0.028, 0.024, 6), TQ, 0, 0, 0.356, g, 0).rotation.x = Math.PI / 2;
    if (L && L.segs) { const m = toon(pt.belt.col, { side: THREE.DoubleSide }), NS = L.segs.length; L.segs.forEach((sg, k) => { const r = 0.15 * (1 - k / NS) + 0.025, len = 0.17, gq = G(sg, { ...pt.belt, y: 0, z: 0, s: 1 }, 0, 0, 0);
      if (k % 2 === 0 && k < NS - 1) { const b = M(new THREE.CylinderGeometry(r * 0.96 + 0.012, r + 0.012, 0.055, 16, 1, true), m, 0, 0, -len / 2, gq, 0); b.rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.014 + r * 0.06, 8, 6), TQ, 0, r + 0.014, -len / 2, gq, 0); }
      if (k === NS - 1) { const tip = M(new THREE.ConeGeometry(0.05, 0.2, 4), m, 0, 0, -len - 0.1, gq, 0.006); tip.rotation.x = -Math.PI / 2; tip.scale.set(1, 1, 0.35); tip.rotation.y = 0; M(new THREE.TorusGeometry(r * 0.9 + 0.01, 0.01, 5, 12), TQ, 0, 0, -len + 0.005, gq, 0); } }); } }
  // SANDSTONE GREAVES: a carved shin, a stepped knee plate, a copper rim + a fret band
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col);
    M(new THREE.CylinderGeometry(0.08, 0.068, 0.17, 12), m, 0, 0, 0, g, 0.012, 0.08);
    M(new THREE.BoxGeometry(0.1, 0.05, 0.03), m, 0, 0.1, 0.07, g, 0.006); M(new THREE.BoxGeometry(0.065, 0.035, 0.03), OBS, 0, 0.12, 0.09, g, 0.005); M(new THREE.BoxGeometry(0.025, 0.02, 0.012), TQ, 0, 0.12, 0.108, g, 0);
    M(new THREE.TorusGeometry(0.07, 0.01, 5, 14), CU, 0, -0.08, 0, g, 0).rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.081, 0.008, 5, 14), TERR, 0, 0.03, 0, g, 0).rotation.x = Math.PI / 2; });
  // WOVEN TABARD: a fret-woven front panel hanging from the sash with copper weights, it sways as he moves
  if (pt.cape.on) { const g = G(body, pt.cape, 0, 0.6 + lift0, 0.375), tx = FRET.clone(); tx.needsUpdate = true; tx.repeat.set(1, 1); tx.rotation = Math.PI / 2; tx.center.set(0.5, 0.5);
    const pv = new THREE.Group(); g.add(pv); const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.34, 1, 6), new THREE.MeshToonMaterial({ map: tx, color: pt.cape.col, gradientMap: SAND.gradientMap, side: THREE.DoubleSide })); pl.position.y = -0.17; pv.add(pl);
    M(new THREE.BoxGeometry(0.22, 0.03, 0.02), CU, 0, -0.35, 0, pv, 0.004); for (const x of [-0.07, 0, 0.07]) M(new THREE.ConeGeometry(0.014, 0.05, 4), CU, x, -0.39, 0, pv, 0).rotation.x = Math.PI;
    const base = pl.geometry.attributes.position.array.slice();
    u.armorFx.push(t => { const lg = P.legs && P.legs[0] ? P.legs[0].rotation.x : 0, lg2 = P.legs && P.legs[1] ? P.legs[1].rotation.x : 0; pv.rotation.x = 0.06 + Math.max(0, -Math.min(lg, lg2)) * 0.5 + Math.sin(t * 1.6) * 0.02;
      const a = pl.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const d = -(base[i + 1] - 0.17); a[i + 2] = base[i + 2] + Math.sin(t * 2.4 + d * 8) * 0.012 * d * 3; } pl.geometry.attributes.position.needsUpdate = true; }); }
}

// s734 GRYPHON · STORM AERIE PLATE (Ben: a different world's style, made for the gryphon): a sky-knight of a storm peak. Bright steel cut into
// FEATHERS, deep crimson enamel, electric-blue lightning. Overlapping steel feather-scales over the chest (raycast, hung in rows like real
// scale mail), fanned feather-blade pauldrons, a steel comb down the middle of the head with backswept blades + a crimson gem, talon vambraces,
// a lion-head buckle + steel tail rings + a crimson tuft cuff, feathered greaves, and steel-edged primaries that CRACKLE with lightning when
// the wings spread (armorFx).
export function dressEagle({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.eagle, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z), lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;
  const ST = toon(set.torso[0]), STD = toon('#7d8794'), CR = toon(set.torso[1]), DK = toon(set.torso[2]), DS = { side: THREE.DoubleSide };
  const ZAP = new THREE.MeshBasicMaterial({ color: set.glow || '#9fe8ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const leaf = (w, l) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(w, -l * 0.3, w * 0.3, -l); sh.lineTo(0, -l * 1.08); sh.lineTo(-w * 0.3, -l); sh.quadraticCurveTo(-w, -l * 0.3, 0, 0); return new THREE.ShapeGeometry(sh, 4); };
  const bolt = (h, w) => { const sh = new THREE.Shape(); sh.moveTo(w * 0.2, h / 2); sh.lineTo(-w * 0.5, 0.02 * h); sh.lineTo(0, 0.02 * h); sh.lineTo(-w * 0.2, -h / 2); sh.lineTo(w * 0.5, -0.04 * h); sh.lineTo(0, -0.04 * h); sh.closePath(); return new THREE.ShapeGeometry(sh); };
  body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), rc = new THREE.Raycaster();
  const tg = body.children.filter(o => o.isMesh && o.visible && o.geometry && ['LatheGeometry', 'CylinderGeometry', 'BoxGeometry'].includes(o.geometry.type) && !o.userData.crest && !o.userData.neck && !(u.armorAdd || []).includes(o) && o.material && o.material.side !== THREE.BackSide);   /* the lower torso is boxes + a cylinder */
  const skipR = new Set([...(P.arms || []), ...(P.legs || []), P.head, P.tail, ...(u.armorAdd || [])].filter(Boolean)), okHit = h => { if (!h.object.visible || !h.object.material || h.object.material.side === THREE.BackSide || h.object.userData.crest || h.object.userData.neck) return false; for (let o = h.object; o && o !== body; o = o.parent) { if (skipR.has(o) || !o.visible) return false; } return true; };   /* s734 hit the OUTERMOST visible torso shell (the lower front is not the lathe) */
  const surf = (x, y, bk) => { rc.set(body.localToWorld(V(x, y, bk ? -1.5 : 1.5)), V(0, 0, bk ? 1 : -1).transformDirection(body.matrixWorld)); const h = rc.intersectObject(body, true).find(okHit); if (!h) return null; return { p: h.point.clone().applyMatrix4(inv), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv) }; };
  let cx = 0, cy = 1.07 + lift0; { const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); const c = V(0, 0, 0); cm.geometry.boundingBox.getCenter(c); cx = c.x + cm.position.x; cy = c.y + cm.position.y;   /* s737 the tall build MOVES the crest decal */ } }
  u.armorFx = u.armorFx || [];
  // FEATHER-SCALE CUIRASS: rows of steel feathers hanging down, each row over the one below, crimson-tipped every other column
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); g.userData.built = true; const yB = (wst => wst ? wst.position.y : 0.64)(body.children.find(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.29)) + 0.06   /* the real waist (after the tall build) */, m = toon(pt.chest.col, DS), tip = toon(set.torso[1], DS), sc = pt.chest.s || 1, F = leaf(0.05 * sc, 0.1 * sc), Fo = leaf(0.058 * sc, 0.112 * sc), Fi = leaf(0.022 * sc, 0.05 * sc), dx = 0.07 * sc, dy = 0.066 * sc, INK = new THREE.MeshBasicMaterial({ color: '#2a2e36', side: THREE.DoubleSide });
    for (const bk of [false, true]) for (let j = 3; j >= -9; j--) for (let i = -7; i <= 7; i++) { const x = cx + i * dx + (j & 1 ? dx / 2 : 0), y = cy + j * dy + (pt.chest.y || 0); if (!bk && Math.hypot(x - cx, (y - cy) * 1.05) < 0.215) continue;   /* front ring round the crest + the whole back */
      const h = surf(x, y + 0.03, bk); if (!h || h.object === 'belt' || (bk ? h.n.z > -0.15 || h.p.z > -0.06 : h.n.z < 0.05 || h.p.z < 0.04) || h.p.y < yB) continue; const q = new THREE.Group(); q.position.copy(h.p).addScaledVector(h.n, 0.004 + (j + 6) * 0.0016 + (pt.chest.z || 0));
      q.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(h.n, V(0, 0, 0), V(0, 1, 0))); g.add(q); const o = new THREE.Mesh(Fo, INK);   /* keep every feather hanging DOWN, front + back */ o.position.set(0, 0.004 * sc, -0.0012); q.add(o); q.add(new THREE.Mesh(F, (i + j) & 1 ? m : STD)); if (!((i + 40) % 2)) { const t2 = new THREE.Mesh(Fi, tip); t2.position.set(0, -0.04 * sc, 0.002); q.add(t2); } } }
  // STORM COMB: a steel comb down the middle of the skull with a crimson edge, 2 backswept steel blades each side, a crimson gem at the widow's peak
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col, DS), R = 0.335;
    { const sh = new THREE.Shape(); const N = 14; for (let k = 0; k <= N; k++) { const a = 0.35 + k / N * 1.95, r = R + 0.01; (k ? sh.lineTo : sh.moveTo).call(sh, Math.cos(a) * r, Math.sin(a) * r); } for (let k = N; k >= 0; k--) { const a = 0.35 + k / N * 1.95, r = R + 0.03 + Math.sin(k / N * Math.PI) * 0.035; sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      const cg = new THREE.ExtrudeGeometry(sh, { depth: 0.024, bevelEnabled: false }); cg.translate(0, 0, -0.012); const comb = M(cg, m, 0, 0.01, 0, g, 0.008); comb.rotation.y = -Math.PI / 2;
      const eg = []; for (let k = 0; k <= N; k++) { const a = 0.35 + k / N * 1.95, r = R + 0.03 + Math.sin(k / N * Math.PI) * 0.035; eg.push(V(0, Math.sin(a) * r + 0.01, Math.cos(a) * r)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(eg), 30, 0.01, 5), CR)); }
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(leaf(0.05, 0.26 - k * 0.06), m); b.position.set(s * (0.2 + k * 0.04), 0.2 - k * 0.07, -0.08 - k * 0.04); b.rotation.set(-2.0 + k * 0.2, s * 0.5, s * 0.25); g.add(b); }
    const gem = M(new THREE.OctahedronGeometry(0.035), toon(set.torso[1], { emissive: new THREE.Color(set.torso[1]), emissiveIntensity: 0.35 }), 0, 0.27, 0.2, g, 0.006); gem.scale.set(0.8, 1.2, 0.6); gem.rotation.x = -0.6; }
  // FEATHER-BLADE PAULDRONS: a steel dome + 5 steel feather blades fanned out over the arm, a crimson boss with a lightning bolt
  if (pt.shoulders.on) for (const [i, arm] of (P.arms || []).entries()) { const s = i ? -1 : 1, g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col, DS);
    M(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), m, 0, -0.01, 0, g, 0.012, 0.135).scale.set(1.15, 0.7, 1.1);
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(leaf(0.06, 0.2 + (k === 2 ? 0.04 : 0)), k % 2 ? STD : m); b.position.set(s * 0.1, 0.04, (k - 2) * 0.05); b.rotation.set(0, s * Math.PI / 2, 0); b.rotateZ(s * (0.35 + (k - 2) * 0.0)); b.rotateX(-(k - 2) * 0.28); g.add(b); }
    const bs = M(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 18), CR, s * 0.02, 0.085, 0, g, 0.006, 0.055); bs.rotation.z = -s * 0.5;
    const bl = new THREE.Mesh(bolt(0.07, 0.05), toon(set.glow || '#9fe8ff', { emissive: new THREE.Color(set.glow || '#9fe8ff'), emissiveIntensity: 0.6 })); bl.position.set(s * 0.025, 0.098, 0); bl.rotation.set(-Math.PI / 2, 0, 0); bl.rotateY(s * 0.5); g.add(bl); }
  // TALON VAMBRACES: a steel sleeve, a crimson band, 3 curved talon blades down the outside
  if (pt.gloves.on) (P.fore || P.arms || []).forEach((fo, i) => { const s = i ? -1 : 1, g = G(fo, pt.gloves, 0, -0.12, 0), m = toon(pt.gloves.col);
    M(new THREE.CylinderGeometry(0.084, 0.072, 0.17, 12), m, 0, 0, 0, g, 0.013, 0.08); M(new THREE.TorusGeometry(0.084, 0.012, 5, 16), CR, 0, 0.055, 0, g, 0).rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) { const pts = []; for (let q = 0; q <= 6; q++) { const t = q / 6; pts.push(V(s * (0.085 + t * 0.05 - t * t * 0.03), 0.06 - k * 0.05 - t * 0.04, -0.01 - t * 0.04)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.009, 5), DK)); } });
  // LION BELT + TAIL RINGS: steel belt, a lion-head buckle (crimson mane), steel rings down the lion tail + a crimson cuff above the tuft
  if (pt.belt.on) { const g = G(body, pt.belt, 0, 0.64 + lift0, 0), m = toon(pt.belt.col); const b = M(new THREE.TorusGeometry(0.3, 0.034, 8, 32), m, 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1);
    const lh = new THREE.Group(); lh.position.set(0, 0, 0.35); g.add(lh); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, c = M(new THREE.ConeGeometry(0.02, 0.05, 4), CR, Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0, lh, 0); c.rotation.z = a - Math.PI / 2; }
    M(new THREE.SphereGeometry(0.045, 12, 10), m, 0, 0, 0.01, lh, 0.006, 0.045).scale.set(1, 1, 0.6); M(new THREE.SphereGeometry(0.02, 8, 6), STD, 0, -0.015, 0.035, lh, 0); for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.008, 6, 4), DK, s * 0.016, 0.01, 0.036, lh, 0);
    if (L && L.tf) { const tm = toon(pt.belt.col, DS); L.tf.forEach((sg, k) => { if (k % 2) return; const r = M(new THREE.CylinderGeometry(0.06, 0.066, 0.05, 14, 1, true), tm, 0, 0, -0.08, G(sg, { ...pt.belt, y: 0, z: 0, s: 1 }, 0, 0, 0), 0); r.rotation.x = Math.PI / 2; });
      const last = L.tf[L.tf.length - 1], cf = M(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 14, 1, true), toon(set.torso[1], DS), 0, 0, -0.19, G(last, { ...pt.belt, y: 0, z: 0, s: 1 }, 0, 0, 0), 0); cf.rotation.x = Math.PI / 2; } }
  // TALON GREAVES: a steel shin with 3 overlapping feather plates down the front, a crimson knee boss, a steel rim
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col, DS);
    M(new THREE.CylinderGeometry(0.08, 0.068, 0.17, 12), m, 0, 0, 0, g, 0.012, 0.08);
    for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(leaf(0.045, 0.08), k % 2 ? STD : m); f.position.set(0, 0.07 - k * 0.05, 0.082 + k * 0.002); f.rotation.x = -0.05; g.add(f); }
    M(new THREE.SphereGeometry(0.03, 10, 8), CR, 0, 0.1, 0.075, g, 0.005).scale.set(1, 1, 0.6); M(new THREE.TorusGeometry(0.07, 0.01, 5, 14), STD, 0, -0.08, 0, g, 0).rotation.x = Math.PI / 2; });
  // STORM WING GUARDS: a steel shell over each wing's coverts with a crimson edge; steel edges on the 4 longest primaries that crackle with lightning when the wings spread
  if (pt.cape.on && L && L.wings) { const zaps = [];
    L.wings.forEach(({ w, fs, s }) => { const g = G(w, { ...pt.cape, s: 1 }, 0, 0, 0), m = toon(pt.cape.col, DS);
      const sh = M(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI, 0, Math.PI), m, 0, -0.1, 0.005, g, 0.01); sh.scale.set(0.62, 1.32, 0.62); sh.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2;
      const ed = []; for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI; ed.push(V(0, -0.1 + Math.cos(a) * 0.224, 0.005 + Math.sin(a) * 0.106 * 0)); } 
      fs.forEach((f, k) => { if (k < 3) return; const l = 0.5 + k * 0.06, e = new THREE.Mesh(new THREE.BoxGeometry(0.014, l * 0.8, 0.006), m); e.position.set(0.035, l * 0.5, 0.004); e.rotation.z = -0.08; f.add(e); add(f, e);
        const zp = new THREE.Mesh(bolt(l * 0.7, 0.06), ZAP); zp.position.set(0, l * 0.55, 0.01); f.add(zp); add(f, zp); zaps.push(zp); }); });
    u.armorFx.push(t => { const k = L.spread || 0; ZAP.opacity = k > 0.3 ? (Math.random() < 0.7 ? 0.5 + Math.random() * 0.5 : 0.05) * k : 0; zaps.forEach((z, i) => { z.scale.x = Math.random() < 0.5 ? 1 : -1; z.rotation.z = Math.sin(t * 40 + i) * 0.08; }); }); }
}

// s736 BEAR · IRONWOOD BULWARK (Ben: a different world's style, made for the big bear): a deep-forest guardian. Dark oak PLANKS (wood grain)
// bound with blackened iron straps + rivets over the chest + back, LOG-END pauldrons (growth rings, iron rim, a fur ruff), an iron brow band
// with a glowing green RUNE stone, leather brawler wraps with iron knuckle cuffs, a bear-paw buckle + a hand-axe on the hip, timber greaves
// with fur tops, a shaggy FUR CLOAK + fur collar that sway (armorFx).
const woodTex = (THREE, c0, c1) => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = c0; g.fillRect(0, 0, 64, 256);
  g.strokeStyle = c1; for (let k = 0; k < 9; k++) { g.lineWidth = 1 + (k % 3); g.beginPath(); const x0 = 4 + k * 7; g.moveTo(x0, 0); for (let y = 0; y <= 256; y += 16) g.lineTo(x0 + Math.sin(y * 0.05 + k) * 3, y); g.stroke(); }
  g.fillStyle = c1; g.beginPath(); g.ellipse(30, 150, 6, 12, 0, 0, Math.PI * 2); g.fill(); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
const ringTex = (THREE, c0, c1) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = c1; g.fillRect(0, 0, 128, 128); g.fillStyle = c0; g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.fill();
  g.strokeStyle = c1; for (let r = 8; r < 58; r += 7) { g.lineWidth = 1.5 + (r % 3); g.beginPath(); g.ellipse(64 + (r % 5) * 0.4, 64, r, r * 0.96, 0, 0, Math.PI * 2); g.stroke(); } g.fillStyle = c1; g.beginPath(); g.arc(64, 64, 4, 0, Math.PI * 2); g.fill();
  g.lineWidth = 3; g.beginPath(); g.moveTo(64, 64); g.lineTo(100, 30); g.stroke(); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
export function dressBear({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.bear, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z), lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;
  const FE = toon(set.trim || '#3a3d42'), RIV = toon('#a7adb5'), LEA = toon('#4a2c1a'), FUR = toon(set.fur || '#e8e0d0'), FURD = toon('#b8ab96');
  const RUNE = new THREE.MeshToonMaterial({ color: set.glow || '#7cf2a0', emissive: new THREE.Color(set.glow || '#7cf2a0'), emissiveIntensity: 0.8, gradientMap: FE.gradientMap });
  const WOOD = c => new THREE.MeshToonMaterial({ map: woodTex(THREE, c || set.torso[0], '#5a3a20'), gradientMap: FE.gradientMap });
  const tuft = (par, x, y, z, dx, dy, dz, r, h, mat) => { const f = M(new THREE.ConeGeometry(r, h, 5), mat, x, y, z, par, 0); f.quaternion.setFromUnitVectors(V(0, 1, 0), V(dx, dy, dz).normalize()); f.position.addScaledVector(V(dx, dy, dz).normalize(), h * 0.4); return f; };
  body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), rc = new THREE.Raycaster();
  const skipR = new Set([...(P.arms || []), ...(P.legs || []), P.head, P.tail, ...(u.armorAdd || [])].filter(Boolean)), okHit = h => { if (!h.object.visible || !h.object.material || h.object.material.side === THREE.BackSide || h.object.userData.crest || h.object.userData.neck) return false; for (let o = h.object; o && o !== body; o = o.parent) { if (skipR.has(o) || !o.visible) return false; } return true; };
  const surf = (x, y, bk) => { rc.set(body.localToWorld(V(x, y, bk ? -1.5 : 1.5)), V(0, 0, bk ? 1 : -1).transformDirection(body.matrixWorld)); const h = rc.intersectObject(body, true).find(okHit); if (!h) return null; return { p: h.point.clone().applyMatrix4(inv), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv).normalize() }; };
  let cx = 0, cy = 1.07 + lift0; { const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); const c = V(0, 0, 0); cm.geometry.boundingBox.getCenter(c); cx = c.x + cm.position.x; cy = c.y + cm.position.y;   /* s737 the tall build MOVES the crest decal */ } }
  const belt = 0.64 + lift0, nk = body.children.find(o => o.userData.neck), ny = nk ? nk.position.y : 1.24 + lift0;
  u.armorFx = u.armorFx || [];
  const ironBand = (g, y, bk, r = 0.021) => { const q = []; for (let x = -0.34; x <= 0.341; x += 0.04) { const h = surf(x, y, bk); if (h && (bk ? h.n.z < -0.1 : h.n.z > 0.1)) q.push(h.p.addScaledVector(h.n, 0.03)); } if (q.length < 3) return []; g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q), 40, r, 6), FE)); return q; };
  // IRONWOOD BREASTPLATE: vertical oak planks following the cuirass (front round the crest + the back), iron straps across with rivets
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); g.userData.built = true; const yB = (wst => wst ? wst.position.y : 0.64)(body.children.find(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.29)) + 0.06   /* the real waist (after the tall build) */, W = WOOD(pt.chest.col), Wd = WOOD('#5a3c24'), pw = 0.072 * (pt.chest.s || 1), dy = 0.038, y0 = yB, y1 = ny - 0.02;
    for (const bk of [false, true]) for (let i = -5; i <= 5; i++) { const x = cx + i * pw; for (let y = y0; y <= y1; y += dy) { if (!bk && Math.hypot(x - cx, y - cy) < 0.215) continue; const h = surf(x, y + (pt.chest.y || 0), bk); if (!h || (bk ? h.n.z > -0.12 : h.n.z < 0.12)) continue;
        const q = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.006, dy + 0.004, 0.022), (i & 1) ? Wd : W); q.position.copy(h.p).addScaledVector(h.n, 0.012 + (pt.chest.z || 0)); q.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(h.n, V(0, 0, 0), V(0, 1, 0))); g.add(q); } }
    for (const bk of [false, true]) for (const y of bk ? [yB + 0.08, (yB + ny) / 2, ny - 0.08] : [yB + 0.04, ny - 0.08]) { const q = ironBand(g, y, bk); q.forEach((p, k) => { if (k % 2) M(new THREE.SphereGeometry(0.013, 8, 6), RIV, p.x, p.y, p.z + (bk ? -0.012 : 0.012), g, 0); }); } }
  // LOG-END PAULDRONS: a thick log slice (growth rings) on each shoulder, an iron rim with rivets, a shaggy fur ruff underneath
  if (pt.shoulders.on) { const RT = new THREE.MeshToonMaterial({ map: ringTex(THREE, '#c89a62', '#6b4326'), gradientMap: FE.gradientMap });
    for (const [i, arm] of (P.arms || []).entries()) { const sd = i ? -1 : 1, g = G(arm, pt.shoulders, 0, 0.05, 0), bark = WOOD(pt.shoulders.col);
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; tuft(g, Math.cos(a) * 0.15, -0.02, Math.sin(a) * 0.15, Math.cos(a), -0.7, Math.sin(a), 0.04, 0.14, k % 2 ? FUR : FURD); }
      const lg = new THREE.Group(); lg.position.set(sd * 0.13, 0.08, 0); lg.rotation.z = -sd * (Math.PI / 2 - 0.35); g.add(lg); M(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 22, 1, false), [bark, RT, RT], 0, 0.02, 0, lg, 0.012, 0.15);
      M(new THREE.TorusGeometry(0.152, 0.016, 6, 24), FE, 0, 0.062, 0, lg, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; M(new THREE.SphereGeometry(0.013, 6, 4), RIV, Math.cos(a) * 0.135, 0.066, Math.sin(a) * 0.135, lg, 0); } } }
  // IRON BROW + RUNE: a hammered iron band across the brow between the ears, rivets, a carved oak plate in the middle with a glowing rune stone
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col, { side: THREE.DoubleSide });
    const band = M(new THREE.CylinderGeometry(0.43, 0.445, 0.075, 34, 1, true, -1.15, 2.3), m, 0, 0.2, 0, g, 0.01); band.scale.set(1.12, 1, 1.0);
    for (let k = -3; k <= 3; k++) { const a = k * 0.32; M(new THREE.SphereGeometry(0.011, 6, 4), RIV, Math.sin(a) * 0.445 * 1.12, 0.2, Math.cos(a) * 0.45, g, 0); }
    const pl = new THREE.Group(); pl.position.set(0, 0.24, 0.415); pl.rotation.x = -0.35; g.add(pl); M(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 6), WOOD('#6b4a2e'), 0, 0, 0, pl, 0.008, 0.075).rotation.x = Math.PI / 2;
    const rs = M(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), RUNE, 0, 0, 0.012, pl, 0.005, 0.04); rs.rotation.x = Math.PI / 2;
    for (const [x0, y0, x1, y1] of [[0, 0.03, 0, -0.03], [0, 0.0, 0.022, 0.022], [0, -0.008, -0.022, 0.014]]) { const d = V(x1 - x0, y1 - y0, 0), l = d.length(), r = M(new THREE.BoxGeometry(0.008, l, 0.006), new THREE.MeshBasicMaterial({ color: '#0d2a18' }), (x0 + x1) / 2, (y0 + y1) / 2, 0.029, pl, 0); r.rotation.z = Math.atan2(-d.x, d.y); }
    const glow = new THREE.PointLight(set.glow || '#7cf2a0', 0.0, 0.6); pl.add(glow); u.armorFx.push(t => { RUNE.emissiveIntensity = 0.65 + Math.sin(t * 2.2) * 0.25; }); }
  // BRAWLER WRAPS: stacked leather wraps up the forearm, an iron cuff with 3 knuckle studs, a fur tuft at the elbow end
  if (pt.gloves.on) (P.fore || P.arms || []).forEach(fo => { const g = G(fo, pt.gloves, 0, -0.12, 0), m = toon(pt.gloves.col);
    for (let k = 0; k < 4; k++) { const w = M(new THREE.TorusGeometry(0.08 - k * 0.003, 0.018, 6, 16), k % 2 ? LEA : m, 0, 0.06 - k * 0.036, 0, g, 0); w.rotation.x = Math.PI / 2 + (k % 2 ? 0.12 : -0.12); }
    M(new THREE.CylinderGeometry(0.084, 0.08, 0.05, 12), FE, 0, -0.095, 0, g, 0.01, 0.084); for (let k = -1; k <= 1; k++) M(new THREE.SphereGeometry(0.016, 8, 6), RIV, k * 0.035, -0.095, 0.082, g, 0);
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; tuft(g, Math.sin(a) * 0.075, 0.09, Math.cos(a) * 0.075, Math.sin(a), 0.5, Math.cos(a), 0.024, 0.07, k % 2 ? FUR : FURD); } });
  // PAW BUCKLE + HATCHET: a thick leather belt, an iron bear-paw buckle, a hand-axe hanging on the right hip
  if (pt.belt.on) { const g = G(body, pt.belt, 0, belt, 0), m = toon(pt.belt.col); const b = M(new THREE.TorusGeometry(0.3, 0.042, 8, 32), m, 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1.25);
    const pw = new THREE.Group(); pw.position.set(0, 0, 0.35); g.add(pw); M(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 18), FE, 0, -0.01, 0, pw, 0.006, 0.06).rotation.x = Math.PI / 2;
    M(new THREE.SphereGeometry(0.026, 10, 8), RIV, 0, -0.02, 0.014, pw, 0).scale.set(1.2, 0.9, 0.5); for (let k = -1.5; k <= 1.5; k++) M(new THREE.SphereGeometry(0.011, 8, 6), RIV, k * 0.02, 0.022 - Math.abs(k) * 0.006, 0.014, pw, 0).scale.z = 0.5;
    const ax = new THREE.Group(); ax.position.set(0.33, -0.06, 0.1); ax.rotation.set(0.1, 0.6, 0.15); g.add(ax); M(new THREE.CylinderGeometry(0.014, 0.016, 0.34, 8), WOOD('#8a6038'), 0, -0.05, 0, ax, 0.005);
    const hd = M(new THREE.BoxGeometry(0.02, 0.07, 0.09), FE, 0, 0.09, 0.04, ax, 0.006); const ed = M(new THREE.BoxGeometry(0.012, 0.1, 0.03), RIV, 0, 0.09, 0.095, ax, 0); M(new THREE.TorusGeometry(0.02, 0.006, 4, 10), LEA, 0, 0.0, 0, ax, 0).rotation.x = Math.PI / 2; }
  // TIMBER GREAVES: 3 oak slats round the shin bound by 2 iron bands, a shaggy fur top
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), W = WOOD(pt.boots.col);
    M(new THREE.CylinderGeometry(0.075, 0.066, 0.17, 10), LEA, 0, 0, 0, g, 0.01, 0.075);
    for (const a of [-0.9, 0, 0.9]) { const sl = M(new THREE.BoxGeometry(0.06, 0.17, 0.02), W, Math.sin(a) * 0.082, 0, Math.cos(a) * 0.082, g, 0.005); sl.rotation.y = a; }
    for (const y of [0.05, -0.05]) M(new THREE.TorusGeometry(0.088, 0.01, 5, 14), FE, 0, y, 0, g, 0).rotation.x = Math.PI / 2;
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; tuft(g, Math.sin(a) * 0.085, 0.09, Math.cos(a) * 0.085, Math.sin(a), -0.8, Math.cos(a), 0.028, 0.08, k % 2 ? FUR : FURD); } });
  // FUR CLOAK + COLLAR: a shaggy collar of fur tufts round the neck + a pelt hanging down the back with tufted edges, swaying as he walks
  if (pt.cape.on) { const g = G(body, { ...pt.cape, s: 1 }, 0, 0, 0), m = toon(pt.cape.col, { side: THREE.DoubleSide }); g.userData.built = true;
    for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, r = 0.24; tuft(g, Math.sin(a) * r, ny - 0.04, Math.cos(a) * r * 0.95, Math.sin(a), -0.55, Math.cos(a), 0.055, 0.17, k % 2 ? FUR : FURD); }
    const bk = surf(0, ny - 0.1, true), bz = bk ? bk.p.z - 0.06 : -0.36, pv = new THREE.Group(); pv.position.set(0, ny - 0.04, bz); g.add(pv);
    const pg = new THREE.PlaneGeometry(0.62, 0.78, 6, 8); pg.translate(0, -0.39, 0); { const p = pg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -Math.abs(x) * 0.15 * (0.4 + (-y) * 0.6)); p.setX(i, x * (0.7 + (-y) * 0.45)); } pg.computeVertexNormals(); }
    const pl = new THREE.Mesh(pg, m); pv.add(pl); const base = pg.attributes.position.array.slice();
    const edge = []; for (let k = 0; k < 13; k++) { const t = k / 12, x = (t - 0.5) * 0.62 * 1.15, f = M(new THREE.ConeGeometry(0.045, 0.14, 5), k % 2 ? FUR : FURD, x, -0.8, -0.01, pv, 0); f.rotation.x = Math.PI; edge.push(f); }
    u.armorFx.push(t => { const lg = P.legs && P.legs[0] ? P.legs[0].rotation.x : 0, lg2 = P.legs && P.legs[1] ? P.legs[1].rotation.x : 0, sw = Math.max(Math.abs(lg), Math.abs(lg2)); pv.rotation.x = -0.12 - sw * 0.35 + Math.sin(t * 1.4) * 0.02;
      const a = pg.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const d = -base[i + 1]; a[i + 2] = base[i + 2] - Math.sin(t * 2 + d * 5 + base[i] * 4) * 0.02 * d; } pg.attributes.position.needsUpdate = true;
      edge.forEach((f, k) => { f.position.z = -0.01 - Math.sin(t * 2 + 0.8 * 5 + f.position.x * 4) * 0.016; }); }); }
}

// s737 GORILLA · TITAN EXO-FRAME (Ben: a different world's style, made for the big gorilla): a heavy-industry power suit from a machine world.
// Graphite panels with safety-yellow edges + black / yellow HAZARD stripes, a glowing orange reactor ring round the crest, hydraulic
// pauldrons with a working PISTON down each upper arm (it slides with the elbow), a roll cage + headlamp over the domed skull, big knuckle rams
// for his knuckle-walking fists, a belt of glowing power cells, stomp greaves with pistons, and an exhaust pack on the back that puffs smoke.
const hazTex = (THREE, a, b) => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); g.fillStyle = a; g.fillRect(0, 0, 64, 64); g.fillStyle = b;
  for (let k = -64; k < 128; k += 24) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 12, 0); g.lineTo(k + 12 - 64, 64); g.lineTo(k - 64, 64); g.closePath(); g.fill(); } const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
export function dressGorilla({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.gorilla, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const GR = toon(set.torso[0]), YL = toon(set.trim || '#f2b705'), ST = toon('#9aa0a8'), BK = toon('#16181b');
  const OR = new THREE.MeshToonMaterial({ color: set.glow || '#ff7a1a', emissive: new THREE.Color(set.glow || '#ff7a1a'), emissiveIntensity: 0.9, gradientMap: GR.gradientMap });
  const HZ = (rx = 1, ry = 1) => { const t = hazTex(THREE, set.trim || '#f2b705', '#16181b'); t.repeat.set(rx, ry); return new THREE.MeshToonMaterial({ map: t, gradientMap: GR.gradientMap }); };
  // s737b the gorilla kit adds its silverback saddle, shoulder pads + ruff AFTER the tall build: map them now (same as fox-kit remapBody) so the rays hit where they will be
  if (P.mapY && P.hero) for (const c of body.children) { const q = c.userData; if (q.built || (c.position.y === q.mY && c.scale.y === q.mSY)) continue; const y = c.position.y, sy = c.scale.y, Hh = P.hero; let ny, nsy = sy; if (y < Hh.lo && c.children.length) { ny = Hh.hip0 + Hh.dL + (y - Hh.hip0) * Hh.k; nsy = sy * Hh.k; } else ny = P.mapY(y); c.position.y = ny; c.scale.y = nsy; q.mY = ny; q.mSY = nsy; }
  body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), rc = new THREE.Raycaster();
  const skipR = new Set([...(P.arms || []), ...(P.legs || []), P.head, P.tail, ...(u.armorAdd || [])].filter(Boolean)), okHit = h => { if (!h.object.visible || !h.object.material || h.object.material.side === THREE.BackSide || h.object.userData.crest || h.object.userData.neck) return false; for (let o = h.object; o && o !== body; o = o.parent) { if (skipR.has(o) || !o.visible) return false; } return true; };
  const surf = (x, y, bk) => { rc.set(body.localToWorld(V(x, y, bk ? -1.5 : 1.5)), V(0, 0, bk ? 1 : -1).transformDirection(body.matrixWorld)); const h = rc.intersectObject(body, true).find(okHit); if (!h) return null; return { p: h.point.clone().applyMatrix4(inv), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv).normalize() }; };
  let cx = 0, cy = 1.3; { const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); const c = V(0, 0, 0); cm.geometry.boundingBox.getCenter(c); cx = c.x + cm.position.x; cy = c.y + cm.position.y;   /* s737 the tall build MOVES the crest decal */ } }
  const yB = (w => w ? w.position.y : 0.64)(body.children.find(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.29)), nk = body.children.find(o => o.userData.neck), ny = nk ? nk.position.y : yB + 0.6;
  const place = (g, h, off) => { const q = new THREE.Group(); q.position.copy(h.p).addScaledVector(h.n, off); q.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(h.n, V(0, 0, 0), V(0, 1, 0))); g.add(q); return q; };
  u.armorFx = u.armorFx || [];
  // CORE PLATE: graphite panels (yellow edges, bolts) front + back, a hazard band at the waist, a glowing reactor ring + 4 vent slats round the crest
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); g.userData.built = true; const m = toon(pt.chest.col), pw = 0.118, ph = 0.094, H1 = HZ(2, 1);
    for (const bk of [false, true]) for (let j = 0; ; j++) { const y = yB + 0.1 + j * ph + (pt.chest.y || 0); if (y > ny - 0.03) break; for (let i = -3; i <= 3; i++) { const x = cx + i * pw; if (!bk && Math.hypot(x - cx, y - cy) < 0.235) continue; const h = surf(x, y, bk); if (!h || (bk ? h.n.z > -0.15 : h.n.z < 0.15)) continue;
        const q = place(g, h, 0.012 + (pt.chest.z || 0)); M(new THREE.BoxGeometry(pw - 0.01, ph - 0.01, 0.024), m, 0, 0, 0, q, 0.006); M(new THREE.BoxGeometry(pw - 0.004, 0.008, 0.026), YL, 0, ph / 2 - 0.006, 0.001, q, 0);
        for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), ST, sx * (pw / 2 - 0.016), -ph / 2 + 0.016, 0.014, q, 0).rotation.x = Math.PI / 2; } }
    for (const bk of [false, true]) for (let i = -3; i <= 3; i++) { const h = surf(cx + i * pw, yB + 0.05, bk); if (!h || (bk ? h.n.z > -0.15 : h.n.z < 0.15)) continue; const q = place(g, h, 0.012); M(new THREE.BoxGeometry(pw, 0.05, 0.026), H1, 0, 0, 0, q, 0.005); }
    { const h = surf(cx, cy, false); if (h) { const q = place(g, h, 0.004); const ring = M(new THREE.TorusGeometry(0.205, 0.016, 8, 40), OR, 0, 0, 0.012, q, 0); M(new THREE.TorusGeometry(0.228, 0.014, 6, 40), BK, 0, 0, 0.006, q, 0);
      for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2, v = M(new THREE.BoxGeometry(0.06, 0.02, 0.02), YL, Math.cos(a) * 0.235, Math.sin(a) * 0.235, 0.01, q, 0.004); v.rotation.z = a; }
      u.armorFx.push(t => { OR.emissiveIntensity = 0.75 + Math.sin(t * 3) * 0.2 + (Math.random() < 0.03 ? 0.4 : 0); }); } } }
  // HYDRAULIC PAULDRONS: a boxy yellow shoulder block with hazard stripes + a graphite cap, a PISTON down the outside of the upper arm (rod rides on the forearm)
  if (pt.shoulders.on) (P.arms || []).forEach((arm, i) => { const s = i ? -1 : 1, g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col);
    M(new THREE.BoxGeometry(0.26, 0.11, 0.25), m, s * 0.02, 0.02, 0, g, 0.012); M(new THREE.BoxGeometry(0.27, 0.04, 0.26), HZ(3, 0.5), s * 0.02, -0.045, 0, g, 0.006); M(new THREE.BoxGeometry(0.2, 0.04, 0.2), GR, s * 0.02, 0.09, 0, g, 0.008);
    for (const z of [-0.08, 0.08]) M(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), ST, s * 0.15, 0.02, z, g, 0).rotation.z = Math.PI / 2;
    const fo = P.fore && P.fore[i]; if (!fo) return; const py = fo.position.y, cyl = M(new THREE.CylinderGeometry(0.026, 0.026, 0.16, 10), ST, s * 0.115, -0.1, -0.02, G(arm, { y: 0, z: 0, s: 1 }, 0, 0, 0), 0.006);
    const rg = G(fo, { y: 0, z: 0, s: 1 }, 0, 0, 0), rod = M(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), toon('#e6e8eb'), s * 0.115, 0.04, -0.02, rg, 0.004); M(new THREE.SphereGeometry(0.022, 8, 6), BK, s * 0.115, -0.07, -0.02, rg, 0); });
  // ROLL CAGE + LAMP: two graphite roll bars over the domed skull, yellow side guards over the ears, a headlamp that glows on the front bar
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col), R = 0.39;
    const b1 = M(new THREE.TorusGeometry(R, 0.024, 8, 30, Math.PI), m, 0, 0.06, -0.04, g, 0.006); b1.rotation.y = Math.PI / 2; b1.scale.set(1, 1.05, 1.05);
    const b2 = M(new THREE.TorusGeometry(R + 0.01, 0.024, 8, 30, Math.PI), m, 0, 0.06, -0.04, g, 0.006); b2.scale.set(1.05, 1.05, 1);
    for (const sd of [-1, 1]) { const gd = M(new THREE.BoxGeometry(0.05, 0.14, 0.16), YL, sd * 0.4, 0.06, -0.04, g, 0.008); M(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), BK, sd * 0.43, 0.06, -0.04, g, 0).rotation.z = Math.PI / 2; }
    const lp = new THREE.Group(); lp.position.set(0, 0.06 + R * 1.05 * Math.sin(1.1), -0.04 + R * 1.05 * Math.cos(1.1)); lp.rotation.x = 1.1 - Math.PI / 2; g.add(lp);
    M(new THREE.CylinderGeometry(0.045, 0.05, 0.05, 14), BK, 0, 0, 0.02, lp, 0.006).rotation.x = Math.PI / 2; M(new THREE.CircleGeometry(0.036, 14), new THREE.MeshBasicMaterial({ color: '#fff4c8' }), 0, 0, 0.047, lp, 0); }
  // KNUCKLE RAMS: a heavy graphite forearm ram with a yellow hazard band, 4 steel knuckle studs at the wrist, a small piston on the outside
  if (pt.gloves.on) (P.fore || P.arms || []).forEach((fo, i) => { const s = i ? -1 : 1, g = G(fo, pt.gloves, 0, -0.15, 0), m = toon(pt.gloves.col);
    M(new THREE.BoxGeometry(0.19, 0.2, 0.19), m, 0, 0, 0, g, 0.012); M(new THREE.BoxGeometry(0.2, 0.05, 0.2), HZ(3, 0.6), 0, 0.06, 0, g, 0.006);
    for (let k = 0; k < 4; k++) M(new THREE.BoxGeometry(0.035, 0.035, 0.04), ST, -0.06 + k * 0.04, -0.105, 0.085, g, 0.004);
    M(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), ST, s * 0.105, -0.01, -0.03, g, 0.004); });
  // POWER CELL BELT: a graphite belt, 5 glowing orange cells in yellow cradles on the front + sides, a hazard buckle
  if (pt.belt.on) { const g = G(body, pt.belt, 0, 0.64 + (P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0), 0), m = toon(pt.belt.col); const b = M(new THREE.TorusGeometry(0.3, 0.04, 8, 32), m, 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1.2);
    M(new THREE.BoxGeometry(0.11, 0.08, 0.03), HZ(1, 1), 0, 0, 0.355, g, 0.006);
    for (const a of [-1.3, -0.8, 0.8, 1.3]) { const cg = new THREE.Group(); cg.position.set(Math.sin(a) * 0.33, -0.01, Math.cos(a) * 0.37); cg.rotation.y = a; g.add(cg); M(new THREE.BoxGeometry(0.06, 0.1, 0.04), YL, 0, 0, 0, cg, 0.005); M(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 10), OR, 0, 0, 0.02, cg, 0); } }
  // STOMP GREAVES: a boxy graphite shin, a yellow knee block with hazard stripes, a piston up the back
  if (pt.boots.on) (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col);
    M(new THREE.BoxGeometry(0.16, 0.18, 0.17), m, 0, 0, 0.005, g, 0.012); M(new THREE.BoxGeometry(0.13, 0.07, 0.04), HZ(2, 0.7), 0, 0.09, 0.09, g, 0.006);
    M(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 8), ST, 0, 0.02, -0.095, g, 0.004); M(new THREE.BoxGeometry(0.17, 0.03, 0.18), YL, 0, -0.09, 0.005, g, 0.004); });
  // EXHAUST PACK: a graphite power pack on the back, 2 exhaust stacks with orange-glowing mouths that puff smoke now and then, cooling fins
  if (pt.cape.on) { const g = G(body, { ...pt.cape, s: 1 }, 0, 0, 0); g.userData.built = true; const m = toon(pt.cape.col), bk = surf(0, ny - 0.18, true), bz = bk ? bk.p.z - 0.1 : -0.45, pk = new THREE.Group(); pk.position.set(0, ny - 0.2, bz); g.add(pk);
    M(new THREE.BoxGeometry(0.42, 0.36, 0.16), m, 0, 0, 0, pk, 0.01); M(new THREE.BoxGeometry(0.43, 0.05, 0.17), HZ(4, 0.6), 0, -0.15, 0, pk, 0.005);
    for (let k = 0; k < 5; k++) M(new THREE.BoxGeometry(0.3, 0.014, 0.03), BK, 0, -0.08 + k * 0.045, -0.09, pk, 0);
    const puffs = [], SM = new THREE.MeshBasicMaterial({ color: '#9a9690', transparent: true, opacity: 0.5, depthWrite: false }), tops = [];
    for (const sd of [-1, 1]) { M(new THREE.CylinderGeometry(0.045, 0.05, 0.36, 12), ST, sd * 0.15, 0.24, -0.02, pk, 0.008, 0.05); M(new THREE.TorusGeometry(0.046, 0.012, 6, 14), BK, sd * 0.15, 0.42, -0.02, pk, 0).rotation.x = Math.PI / 2;
      M(new THREE.CircleGeometry(0.036, 12), OR, sd * 0.15, 0.421, -0.02, pk, 0).rotation.x = -Math.PI / 2; tops.push(V(sd * 0.15, 0.44, -0.02)); }
    for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), SM.clone()); p.visible = false; pk.add(p); puffs.push({ m: p, t: 9 }); }
    let next = 1;
    u.armorFx.push(t => { const dt = 1 / 60; next -= dt; if (next < 0) { next = 1.2 + Math.random() * 1.6; for (let k = 0; k < 2; k++) { const q = puffs.find(p => p.t > 1.4); if (q) { q.t = 0; q.o = tops[k].clone(); } } }
      puffs.forEach(p => { p.t += dt; const on = p.t < 1.4; p.m.visible = on; if (!on) return; const k = p.t / 1.4; p.m.position.copy(p.o).add(V(Math.sin(p.t * 3) * 0.03, k * 0.45, -k * 0.12)); p.m.scale.setScalar(0.6 + k * 2.2); p.m.material.opacity = 0.55 * (1 - k); }); }); }
}

// s738 GREY ALIEN · ORBITAL WARDEN (Ben: a different world's style, made for the big-skulled thin alien): zero-gravity elegance from a world
// with no gravity to fight. Pearl ceramic + violet glass + glowing cyan CIRCUIT lines; parts FLOAT (shoulder shards hover + bob, a halo ring
// orbits above the dome with 3 little moons, soft hover discs glow under the feet), a third-eye gem, light bracers on the thin arms, a grav belt
// with a floating emitter, and a translucent violet PLASMA TRAIN that ripples behind.
export function dressAlien({ THREE, M, toon }, fox, set, add, G) {
  const u = fox.userData, P = u.P, L = u.alien, pt = set.parts, body = P.body, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const PE = toon(set.torso[0]), VI = toon(set.torso[1]), DK = toon(set.torso[2]), SIL = toon('#c9ccd8');
  const CY = new THREE.MeshBasicMaterial({ color: set.glow || '#4ff0ff' }), CYa = new THREE.MeshBasicMaterial({ color: set.glow || '#4ff0ff', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  if (P.mapY && P.hero) for (const c of body.children) { const q = c.userData; if (q.built || (c.position.y === q.mY && c.scale.y === q.mSY)) continue; const y = c.position.y, sy = c.scale.y, Hh = P.hero; let ny, nsy = sy; if (y < Hh.lo && c.children.length) { ny = Hh.hip0 + Hh.dL + (y - Hh.hip0) * Hh.k; nsy = sy * Hh.k; } else ny = P.mapY(y); c.position.y = ny; c.scale.y = nsy; q.mY = ny; q.mSY = nsy; }
  body.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(body.matrixWorld).invert(), rc = new THREE.Raycaster();
  const skipR = new Set([...(P.arms || []), ...(P.legs || []), P.head, P.tail, ...(u.armorAdd || [])].filter(Boolean)), okHit = h => { if (!h.object.visible || !h.object.material || h.object.material.side === THREE.BackSide || h.object.userData.crest || h.object.userData.neck) return false; for (let o = h.object; o && o !== body; o = o.parent) { if (skipR.has(o) || !o.visible) return false; } return true; };
  const surf = (x, y, bk) => { rc.set(body.localToWorld(V(x, y, bk ? -1.5 : 1.5)), V(0, 0, bk ? 1 : -1).transformDirection(body.matrixWorld)); const h = rc.intersectObject(body, true).find(okHit); if (!h) return null; return { p: h.point.clone().applyMatrix4(inv), n: h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv).normalize() }; };
  let cx = 0, cy = 1.3; { const cm = body.children.find(o => o.userData.crest && o.geometry && o.geometry.type === 'BufferGeometry'); if (cm) { cm.geometry.computeBoundingBox(); const c = V(0, 0, 0); cm.geometry.boundingBox.getCenter(c); cx = c.x + cm.position.x; cy = c.y + cm.position.y; } }
  const yB = (w => w ? w.position.y : 0.64)(body.children.find(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.29)), nk = body.children.find(o => o.userData.neck), ny = nk ? nk.position.y : yB + 0.6;
  const line = (g, pts, bk, r = 0.007, mat = CY) => { const q = pts.map(([x, y]) => { const h = surf(x, y, bk); return h ? h.p.addScaledVector(h.n, 0.03) : null; }).filter(Boolean); if (q.length < 2) return null; g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q), q.length * 6, r, 5), mat)); return q; };
  u.armorFx = u.armorFx || [];
  // CIRCUIT CUIRASS: 2 smooth pearl shell plates (front + back) laid on the cuirass, violet glass side panels, glowing circuit traces + nodes round the crest
  if (pt.chest.on) { const g = G(body, { ...pt.chest, s: 1 }, 0, 0, 0); g.userData.built = true; const m = toon(pt.chest.col);
    const shell = (bk, col) => { const NX = 14, NY = 10, pos = [], idx = []; for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { const x = (i / NX - 0.5) * 0.66, y = yB + 0.06 + j / NY * (ny - yB - 0.1), h = surf(x, y, bk); const p = h ? h.p.addScaledVector(h.n, 0.016) : V(x, y, 0); pos.push(p.x, p.y, p.z); }
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; const ok = [a, b, c, d].every(k => Math.abs(pos[k * 3 + 2]) > 0.05); if (!ok) continue; if (!bk) { const mx = (i + 0.5) / NX - 0.5, my = yB + 0.06 + (j + 0.5) / NY * (ny - yB - 0.1); if (Math.hypot(mx * 0.66 - cx, my - cy) < 0.2) continue; } bk ? idx.push(a, b, c, b, d, c) : idx.push(a, c, b, b, c, d); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); const ms = new THREE.Mesh(geo, col); g.add(ms); return ms; };
    shell(false, m); shell(true, m);
    for (const bk of [false, true]) for (const sd of [-1, 1]) { line(g, [[sd * 0.3, yB + 0.08], [sd * 0.31, yB + 0.25], [sd * 0.29, ny - 0.12]], bk, 0.02, VI); }
    for (const sd of [-1, 1]) { line(g, [[sd * 0.06, yB + 0.08], [sd * 0.08, cy - 0.25], [sd * 0.22, cy - 0.12], [sd * 0.24, cy + 0.06], [sd * 0.16, ny - 0.1]], false); line(g, [[sd * 0.24, cy - 0.06], [sd * 0.3, cy - 0.02]], false);
      line(g, [[sd * 0.04, yB + 0.1], [sd * 0.12, yB + 0.3], [sd * 0.12, cy], [sd * 0.2, ny - 0.12]], true); line(g, [[sd * 0.12, cy - 0.1], [sd * 0.25, cy - 0.1]], true); }
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6, h = surf(cx + Math.cos(a) * 0.225, cy + Math.sin(a) * 0.225, false); if (h) M(new THREE.SphereGeometry(0.016, 10, 8), CY, h.p.x + h.n.x * 0.03, h.p.y + h.n.y * 0.03, h.p.z + h.n.z * 0.03, g, 0.004); }
    u.armorFx.push(t => { CY.color.setHSL(0.51, 1, 0.6 + Math.sin(t * 2.4) * 0.08); }); }
  // HALO + THIRD EYE: a thin pearl halo with a cyan inner glow floats + slowly turns over the dome, 3 little moons orbit it, a third-eye gem on the brow
  if (pt.helmet.on && L && L.H) { const g = G(L.H, pt.helmet, 0, 0, 0), m = toon(pt.helmet.col), hv = new THREE.Group(); hv.position.set(0, 0.6, -0.02); hv.rotation.x = -0.28; g.add(hv);
    M(new THREE.TorusGeometry(0.3, 0.018, 8, 48), m, 0, 0, 0, hv, 0.006).rotation.x = Math.PI / 2; const gl = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 48), CYa); gl.rotation.x = Math.PI / 2; hv.add(gl);
    const moons = [0, 1, 2].map(k => { const mo = M(new THREE.SphereGeometry(0.03, 12, 8), k ? PE : CY, 0, 0, 0, hv, k ? 0.004 : 0); return mo; });
    const eye = new THREE.Group(); eye.position.set(0, 0.32, 0.37); eye.rotation.x = -0.55; g.add(eye); const dm = M(new THREE.SphereGeometry(0.035, 14, 10), CY, 0, 0, 0, eye, 0.006); dm.scale.set(0.7, 1.2, 0.45);
    for (const sd of [-1, 1]) { const w = M(new THREE.ConeGeometry(0.014, 0.08, 4), SIL, sd * 0.045, 0, -0.005, eye, 0.003); w.rotation.z = sd * Math.PI / 2; w.scale.z = 0.4; }
    u.armorFx.push(t => { hv.position.y = 0.6 + Math.sin(t * 1.3) * 0.02; hv.rotation.y = t * 0.4; moons.forEach((mo, k) => { const a = t * (0.9 + k * 0.25) + k * 2.1; mo.position.set(Math.cos(a) * 0.3, Math.sin(a * 2) * 0.02, Math.sin(a) * 0.3); }); }); }
  // FLOATING SHARDS: two pearl crescent shards hover over each shoulder (not touching), violet glass undersides, cyan edges, they bob + tilt
  if (pt.shoulders.on) { const sh = []; (P.arms || []).forEach((arm, i) => { const sd = i ? -1 : 1, g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col, { side: THREE.DoubleSide });
    [[0.2, 0.0, 0.11, 0.2, 1.0], [0.15, -0.05, 0.08, 0.16, 0.85]].forEach(([r, y, w, x, sc], k) => { const pv = new THREE.Group(); pv.position.set(sd * x, 0.1 + y, 0); g.add(pv);
      const cr = M(new THREE.SphereGeometry(r * 0.6, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.32), m, 0, 0, 0, pv, 0.006); cr.scale.set(1.3 * sc, 0.5, 1.1 * sc); cr.rotation.z = -sd * (0.5 + k * 0.4);
      const un = M(new THREE.SphereGeometry(r * 0.56, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.32), VI, 0, -0.012, 0, pv, 0); un.scale.copy(cr.scale); un.rotation.copy(cr.rotation);
      sh.push({ pv, b: pv.position.clone(), k, sd }); }); });
    u.armorFx.push(t => sh.forEach(q => { q.pv.position.y = q.b.y + Math.sin(t * 1.6 + q.k * 1.3 + q.sd) * 0.018; q.pv.rotation.x = Math.sin(t * 1.1 + q.k) * 0.08; })); }
  // LIGHT BRACERS: a slim pearl bracer with a violet glass window + 2 glowing bands on each thin forearm; a silver ring on each long finger
  if (pt.gloves.on) { (P.fore || P.arms || []).forEach(fo => { const g = G(fo, pt.gloves, 0, -0.12, 0), m = toon(pt.gloves.col);
      M(new THREE.CylinderGeometry(0.075, 0.064, 0.18, 14), m, 0, 0, 0, g, 0.01, 0.075); M(new THREE.BoxGeometry(0.05, 0.1, 0.02), VI, 0, 0, 0.07, g, 0.004);
      for (const y of [0.07, -0.07]) M(new THREE.TorusGeometry(y > 0 ? 0.075 : 0.066, 0.006, 4, 18), CY, 0, y, 0, g, 0).rotation.x = Math.PI / 2; });
    (P.hands || []).forEach(h0 => { const h = h0 && (h0.isObject3D ? h0 : h0.g); if (!h) return; const g = G(h, { y: 0, z: 0, s: 1 }, 0, 0, 0); for (let k = -1; k <= 1; k++) { const r = M(new THREE.TorusGeometry(0.022, 0.006, 4, 12), SIL, k * 0.036, -0.12, 0.028, g, 0); r.rotation.set(Math.PI / 2 + 0.25, 0, k * 0.12); } }); }
  // GRAV BELT: a thin silver belt with a cyan light line, a floating emitter disc behind the waist (it turns), a glowing buckle
  if (pt.belt.on) { const g = G(body, pt.belt, 0, yB, 0), m = toon(pt.belt.col); g.userData.built = true; const b = M(new THREE.TorusGeometry(0.3, 0.028, 8, 32), m, 0, 0, 0, g, 0.008); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.12, 1);
    const ln = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.006, 4, 40), CY); ln.rotation.x = Math.PI / 2; ln.scale.set(1.04, 1.12, 1); g.add(ln);
    const bk = M(new THREE.OctahedronGeometry(0.045), CY, 0, 0, 0.345, g, 0.005); bk.scale.set(1, 1.3, 0.5);
    const em = new THREE.Group(); em.position.set(0, 0.02, -0.46); g.add(em); M(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), PE, 0, 0, 0, em, 0.006, 0.1).rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.07, 0.008, 4, 24), CY, 0, 0, -0.012, em, 0);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), CYa); gl.position.z = -0.02; gl.rotation.y = Math.PI; em.add(gl);
    u.armorFx.push(t => { em.rotation.z = t * 1.2; em.position.y = 0.02 + Math.sin(t * 1.7) * 0.012; }); }
  // HOVER GREAVES: a slim pearl shin shell, a violet knee lens, a cyan ankle ring + a soft glowing hover disc under each foot
  if (pt.boots.on) { const discs = []; (P.shin || P.legs || []).forEach(sh => { const g = G(sh, pt.boots, 0, P.shin ? -0.09 : -0.3, 0), m = toon(pt.boots.col);
    M(new THREE.CylinderGeometry(0.072, 0.06, 0.18, 14), m, 0, 0, 0, g, 0.01, 0.072); const kn = M(new THREE.SphereGeometry(0.035, 12, 8), VI, 0, 0.1, 0.06, g, 0.005); kn.scale.z = 0.6;
    M(new THREE.TorusGeometry(0.062, 0.007, 4, 18), CY, 0, -0.09, 0, g, 0).rotation.x = Math.PI / 2;
    const d = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.16, 28), CYa); d.rotation.x = -Math.PI / 2; d.position.set(0, -0.26, 0.06); g.add(d); discs.push(d); });
    u.armorFx.push(t => discs.forEach((d, i) => { const k = 1 + Math.sin(t * 3 + i * 1.7) * 0.12; d.scale.set(k, k, 1); })); }
  // PLASMA TRAIN: a translucent violet train hanging from two floating pins behind the shoulders, a cyan hem, rippling
  if (pt.cape.on) { const g = G(body, { ...pt.cape, s: 1 }, 0, 0, 0); g.userData.built = true; const bk = surf(0, ny - 0.12, true), bz = bk ? bk.p.z - 0.07 : -0.4, pv = new THREE.Group(); pv.position.set(0, ny - 0.08, bz); g.add(pv);
    const mat = new THREE.MeshToonMaterial({ color: pt.cape.col, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false, gradientMap: PE.gradientMap, emissive: new THREE.Color(pt.cape.col), emissiveIntensity: 0.25 });
    const H0 = ny - 0.08 - 0.25, pg = new THREE.PlaneGeometry(0.56, H0, 6, 10); pg.translate(0, -H0 / 2, 0); { const p = pg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = -p.getY(i) / H0; p.setX(i, x * (0.75 + y * 0.6)); p.setZ(i, -Math.abs(x) * 0.12); } }
    const pl = new THREE.Mesh(pg, mat); pl.renderOrder = 2; pv.add(pl); const base = pg.attributes.position.array.slice();
    const hem = []; for (let k = 0; k <= 10; k++) hem.push(V(0, 0, 0)); const hm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hem.map((p, k) => V((k / 10 - 0.5) * 0.9, -H0, 0))), 20, 0.008, 4), CY); pv.add(hm);
    for (const sd of [-1, 1]) M(new THREE.OctahedronGeometry(0.03), CY, sd * 0.24, 0.02, 0.01, pv, 0.004);
    u.armorFx.push(t => { const a = pg.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const d = -base[i + 1] / H0; a[i + 2] = base[i + 2] - d * 0.08 - Math.sin(t * 1.8 + d * 5 + base[i] * 5) * 0.03 * d; } pg.attributes.position.needsUpdate = true; hm.position.z = -0.08 - Math.sin(t * 1.8 + 5) * 0.03; }); }
}
