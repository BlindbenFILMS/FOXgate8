// THE MERU BOSSES for the Fox Workshop showcase (s149). Same looks as the battle files:
//   BARNACLE  (worlds/salt-building.js BARNACLE + bandit mask band, ×1.3)
//   JALAPEÑO JACK (worlds/pepper-building.js JACK + mask, hat, scarf, grapple hook)
//   ROOK      (worlds/meru-caves.js BANDITS 'rook', the cave bandit boss)
//   IRON WARDEN v2 (s149 workshop redesign: tall knight robot; the arena still uses its old makeRobot boss)
//   MAKER PRIME v2 (s149 workshop redesign: factory titan; the factory boss room still uses its wall machine)
// If a boss changes in its battle file, copy the change here too.
import { PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT } from '../fox-kit.js';

export const BOSS_FOX = {
  barnacle: { key: 'barnacle', name: 'BARNACLE', torso: ['#3a1a1a', '#2a1010', '#120808'], crest: '', outfit: 'vest', gear: 'none', eyes: ['#ffd23a', '#ffd23a'], mood: 'stern', scale: 1.3,
    look: { ...PLAYER_MALE, fur: '#7a6a5a', furDark: '#4a3f36', tailBase: '#4a3f36', tailMid: '#7a6a5a', tailTip: '#e9e6e0' } },
  jack: { key: 'jack', name: 'JALAPEÑO JACK', torso: ['#6f6a4c', '#4a4632', '#26241a'], crest: '', outfit: 'tee', scale: 1.15, worn: 'jack', gear: 'none', eyes: ['#ffd23a', '#ffd23a'], mood: 'stern',
    look: { ...PLAYER_MALE, fur: '#b8401f', furDark: '#6b2210', tailBase: '#6b2210', tailMid: '#b8401f', tailTip: '#3f6d2e', leg: '#3a3628', boot: '#1c1814' } },
  lox: { key: 'lox', name: 'LOX', outfit: 'armor', torso: ['#9b2b1f', '#5e1a14', '#1c1210'], crest: 'L', gear: 'none', eyes: ['#f59e0b', '#f59e0b'], mood: 'stern', scale: 1.15,
    look: { ...PLAYER_MALE, fur: '#a8401c', furDark: '#5a1e0e', muzzle: '#e9cbb0', snout: '#d9a882', chin: '#efe2d2', fluff: '#e9dccb', ear: '#141312', earInner: '#3a1410', paw: '#141312', tailBase: '#5a1e0e', tailMid: '#a8401c', tailTip: '#1c1210', ink: '#141312', armorAccent: '#f59e0b', browWeight: 10, blush: 0, eyeTilt: 0.18, pupil: 0.55, eyePatch: 'L', scar: 1, headTuft: 0.8, cheeks: 1.4, chinPoint: 1.2 } },
  sumo: { key: 'sumo', name: 'OYAKATA FOX', outfit: 'boxer', torso: ['#1d4ed8', '#1d4ed8', '#1d4ed8'], crest: '', gear: 'none', eyes: ['#5a3a1a', '#5a3a1a'], mood: 'happy', scale: 1.3,
    look: { ...PLAYER_MALE, headWidth: 1.25, headHeight: 0.92, cheeks: 2, chinPoint: 0.3, fluffSize: 1.6, eyeSize: 1.0, eyeSpacing: 66, eyeY: 92, irisSize: 0.9, browWeight: 9, blush: 0.45, headTuft: 0, earHeight: 0.8, legLength: 1.75 } },
  michelle: { key: 'michelle', name: 'PRINCESS MICHELLE', outfit: 'armor', torso: ['#3b52a8', '#1b2a66', '#0d1636'], crest: 'M', gear: 'none', eyes: ['#3b82f6', '#3b82f6'], mood: 'determined', scale: 1.0,
    look: { ...PLAYER_FEMALE, fur: '#d9733a', furDark: '#9a4a22', muzzle: '#f1c9a6', snout: '#e8b48a', chin: '#f4f1ec', fluff: '#f4f4f6', tailMid: '#e8945a', tailTip: '#ffffff', ear: '#1c1917', earInner: '#5a2a3a', paw: '#1c1917', armorAccent: '#e6b45a', leg: '#1b2a66', boot: '#0d1636', lashes: 1, blush: 0.25, earSpread: 0.95 } },
  king: { key: 'king', name: 'KING MIGHT', outfit: 'robe', torso: ['#3b52a8', '#1b2a66', '#0d1636'], crest: 'M', crown: true, gear: 'none', eyes: ['#e6b45a', '#e6b45a'], mood: 'stern', scale: 1.06,
    look: { ...KING_MIGHT, leg: '#1b2a66', boot: '#0d1636', earSpread: 1.0 } },   // face = the KING_MIGHT preset as it was
  rook: { key: 'rook', name: 'ROOK', outfit: 'coat', torso: ['#6b5642', '#463627', '#221912'], crest: '', scale: 1.15, worn: 'rook', gear: 'laser', eyes: ['#9acd32', '#9acd32'], mood: 'smug',
    look: { ...PLAYER_MALE, leg: '#2e2620', boot: '#1c1612', fur: '#8a5a32', furDark: '#4e3018', muzzle: '#cbb8a2', snout: '#b89a7c', chin: '#d8cbbb', fluff: '#bfae98', ear: '#2a1d14', earInner: '#5a3a2a', paw: '#2a1d14', nose: '#1a1210', tailBase: '#4e3018', tailMid: '#8a5a32', tailTip: '#d8cbbb', ink: '#1a1210',
      snoutLength: 0.78, snoutSize: 0.9, headWidth: 1.05, headHeight: 0.9, cheeks: 0.7, chinPoint: 0.6, fluffSize: 0.5, headTuft: 0, earHeight: 0.68, earWidth: 1.1, earSpread: 0.9, earTilt: 0.7, earBack: 0.75,
      eyeSize: 1.0, eyeSpacing: 60, eyeY: 92, eyeTilt: 0.28, irisSize: 0.85, pupil: 0.5, browWeight: 9, blush: 0, whiskers: 0, lashes: 0, muzzleWedge: 0.2 } },
};
export const BOSS_INFO = {
  barnacle: 'Salt Building roof · drives the stolen FORKLIFT (600 HP): rush, fork slam, crate lobs, calls 3 bandits · then the paws-only duel.',
  jack: 'Pepper Building roof · battle-worn work shirt + bandolier, no insignia · 600 HP: SWAP with 4 decoys (only he has a shadow), ZIP between the water tanks, 3-card fan · then the duel.',
  lox: 'Luxor · the leader on the spiked L throne. One-eyed, scarred, fights with boxing gloves · 15% bigger than you, built like a heavyweight wrestler.',
  sumo: 'Kyoto · OYAKATA FOX, the big fat sumo. Blue mawashi with white sagari cords, topknot, huge belly that wobbles. Yokozuna rope, red war-paint. Pick a pose below.',
  michelle: 'Meru · Princess Michelle, King Might\u2019s daughter. Sleek navy + gold armour robe to the floor with the Meru M on the breastplate, a gold tiara, a short gold-lined cape, bracers. Pick a pose below.',
  king: 'Meru · King Might, the old master. Navy floor-length robe, gold sash with the Meru M, gold bracers, rings + chain, a taller crown. Calm until he fights. Pick a pose below.',
  rook: 'Ruins Cave · cracked leather duster + one iron pauldron, no insignia · the bandit boss (95 HP, laser, ranged) with Snag, Rell, Vix and Cutter · holds Prince Max in the cage.',
  warden: 'Meru Arena round 3 · 700 HP · black-iron knight robot: stomp SHOCKWAVES (jump), rocket punch, spin attack, charges into the wall → STUNNED, hit it then. Pick a pose below.',
  suds: 'Pearl Sail roof · SUDS-9, the window-cleaning robot · 280 HP, 3 phases (RINSE CYCLE): LOW sweep (jump it) · HIGH sweep (duck it) · soap spray bubbles (cut them) · squeegee cyclone. BONK his head from above. Pick a pose below.',
  prime: 'Robot Factory boss · factory titan: claw + drill build arms, welder + grabber tool arms, red laser eye, hopper drops mini-bots. Break the 2 ARMS, the HOPPER and the EYE, then the CORE. Pick a pose below.',
};
// accessories the battle files add on top of the fox
export function bossExtras(key, f, { THREE, M, toon }) {
  const P = f.userData.P; if (!P) return;
  if (key === 'barnacle') { const b = M(new THREE.TorusGeometry(0.41, 0.06, 6, 24), toon('#141312'), 0, 0.06, 0, P.head, 0); b.rotation.x = Math.PI / 2; b.scale.set(1.04, 1.04, 1.6); }
  if (key === 'lox') {   // BOXING GLOVES (red, white cuff) over the fists + iron shoulder spikes (Luxor: iron braziers and spikes)
    for (const p of P.arms || []) { p.children.forEach(c => { if (c.position.y < -0.34) c.visible = false; }); const gl = M(new THREE.SphereGeometry(0.15, 16, 12), toon('#c8261c'), 0, -0.44, 0.03, p, 0.022, 0.15); gl.scale.set(1, 1.05, 1.2); M(new THREE.SphereGeometry(0.06, 10, 8), toon('#c8261c'), (p.position.x > 0 ? -1 : 1) * 0.11, -0.4, 0.06, p, 0.012, 0.06); M(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 14), toon('#f7f1e6'), 0, -0.31, 0.01, p, 0.008, 0.11); M(new THREE.TorusGeometry(0.105, 0.012, 6, 16), toon('#141312'), 0, -0.31, 0.01, p, 0).rotation.x = Math.PI / 2;
      for (const k of [-1, 0, 1]) { const sp = M(new THREE.ConeGeometry(0.035, 0.14, 6), toon('#3a3634'), k * 0.07, 0.1, 0, p, 0.008); sp.rotation.z = (p.position.x > 0 ? -1 : 1) * 0.3; } }
  }
  if (key === 'jack') {   // flat hat + chilli stalk, grapple hook in the right paw
    { const hat = new THREE.Group(); hat.position.set(0, 0.3, -0.02); hat.rotation.set(-0.22, 0, 0.12); P.head.add(hat);   // battered flat-brim hat pushed back on the head, between the ears
      const felt = toon('#2a2620'), band = toon('#3f6d2e');
      M(new THREE.CylinderGeometry(0.46, 0.47, 0.035, 28), felt, 0, 0, 0, hat, 0.012, 0.47).scale.set(1, 1, 0.92);
      const cr = M(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 22), felt, 0, 0.11, 0, hat, 0.014, 0.25); cr.scale.set(1, 1, 0.9);
      M(new THREE.SphereGeometry(0.2, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), felt, 0, 0.2, 0, hat, 0.012, 0.2).scale.set(1, 0.35, 0.9);
      M(new THREE.CylinderGeometry(0.252, 0.252, 0.05, 22, 1, true), band, 0, 0.04, 0, hat, 0).scale.set(1, 1, 0.9);
      const st = M(new THREE.CylinderGeometry(0.03, 0.018, 0.16, 8), band, 0.2, 0.08, 0.1, hat, 0.008); st.rotation.z = -0.6;
      M(new THREE.BoxGeometry(0.1, 0.012, 0.06), toon('#120e0b'), -0.3, 0.02, 0.24, hat, 0).rotation.y = 0.6; }   // a notch torn in the brim
    const hk = M(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI * 1.3), toon('#9aa0a6'), 0, -0.5, 0.05, P.arms[1], 0.01); hk.rotation.y = Math.PI / 2;
  }
  if (key === 'king') king(f, P, { THREE, M, toon });
  if (key === 'michelle') michelle(f, P, { THREE, M, toon });
  if (key === 'jack' || key === 'rook') strip(P, THREE, toon);
  if (key === 'lox' || key === 'jack' || key === 'rook' || key === 'sumo') heavy(P, THREE);
  if (key === 'sumo') sumo(f, P, { THREE, M, toon });
  if (key === 'jack' || key === 'rook') worn(key, P, { THREE, M, toon });
}
// KING MIGHT (Ben, s149): the old master. Lean (slimmer torso), long white beard, navy robe, gold sash + M medallion, bracers, rings, chain,
// a taller crown; poses on f.userData.posePose (the workshop calls it after animFox): royal · fight · palm · taunt · victory · hurt · stunned
function king(f, P, { THREE, M, toon }) {
  const gold = toon('#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.35 }), B = P.body, keep = new Set([P.head, ...(P.arms || []), ...(P.legs || []), P.tail].filter(Boolean));
  let crestMap = null; for (const c of [...B.children]) { if (Array.isArray(c.material)) { crestMap = c.material[1] && c.material[1].map; B.remove(c); } }   // the robe's chest badge moves onto the sash
  for (const c of B.children) { if (keep.has(c) || !c.isMesh) continue; c.scale.x *= 0.9; c.scale.z *= 0.92; c.position.x *= 0.9; }   // lean
  // crown: the kit crown, taller + bigger, with an extra ring of spikes
  // CROWN (s149g): the kit crown is hidden; a new one sits ON the skull: solid band, 5 spires standing on its rim (base = rim), ball tips, gems
  P.head.children.forEach(c => { if (c.isGroup && Math.abs(c.position.y - 0.36) < 0.01) c.visible = false; });
  { const cw = new THREE.Group(); cw.position.set(0, 0.33, -0.03); cw.rotation.x = -0.1; P.head.add(cw); const R0 = 0.215, BH = 0.1, red = toon('#c42d3c', { emissive: new THREE.Color('#c42d3c'), emissiveIntensity: 0.6 }), blue = toon('#3b82f6', { emissive: new THREE.Color('#3b82f6'), emissiveIntensity: 0.6 });
    M(new THREE.CylinderGeometry(R0, R0 * 1.04, BH, 28), gold, 0, 0, 0, cw, 0.012, R0); M(new THREE.TorusGeometry(R0 * 1.02, 0.014, 6, 32), gold, 0, BH / 2, 0, cw, 0).rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(R0 * 1.05, 0.016, 6, 32), gold, 0, -BH / 2, 0, cw, 0).rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, h = k === 0 ? 0.24 : 0.17, x = Math.sin(a) * R0 * 0.96, z = Math.cos(a) * R0 * 0.96, sp = M(new THREE.ConeGeometry(0.05, h, 4), gold, x, BH / 2 + h / 2 - 0.005, z, cw, 0.008); sp.rotation.y = -a + Math.PI / 4; sp.rotation.x = Math.cos(a) * 0.12; sp.rotation.z = -Math.sin(a) * 0.12;
      M(new THREE.SphereGeometry(0.022, 8, 6), gold, x * 1.08, BH / 2 + h - 0.005, z * 1.08, cw, 0); M(new THREE.SphereGeometry(0.026, 8, 6), k === 0 ? blue : red, Math.sin(a) * R0 * 1.03, 0, Math.cos(a) * R0 * 1.03, cw, 0); } }
  P.head.children.slice().forEach(c => { if (c.isMesh && c.geometry && c.geometry.type === 'SphereGeometry' && Math.abs(Math.abs(c.position.x) - 0.36) < 0.01 && Math.abs(c.position.y - 0.1) < 0.01) P.head.remove(c); });   // the white tufts beside the ears
  P.head.children.forEach(c => { if (c.isMesh && c.geometry && c.geometry.type === 'SphereGeometry' && Math.abs((c.geometry.parameters || {}).radius - 0.11) < 0.001) c.visible = false; });   // ear-root clumps off (s149j)
  // WHISKER MOUSTACHE + thin goatee (s149h, replaces the big beard): long thin white whiskers sweeping out + down from the snout, a slim chin tuft
  P.head.children.slice().forEach(c => { if (c.isMesh && c.geometry && c.geometry.type === 'ConeGeometry' && c.position.y < -0.2 && c.position.z > 0.1 && Math.abs(c.position.x) < 0.25) c.visible = false; });   // the kit's elder beard cones
  { const wm = toon('#f4f5f8'), tip = P.nose ? P.nose.position : new THREE.Vector3(0, -0.045, 0.5);
    // s149i: TAPERED whiskers (thick at the root, hair-thin at the tip) rooted in a soft whisker pad on each side of the muzzle, sweeping out, drooping, tips flicking up
    const whisk = (pts, r0, r1) => { const cv = new THREE.CatmullRomCurve3(pts), S = 28, g0 = new THREE.TubeGeometry(cv, S, r0, 6, false), p = g0.attributes.position, v = new THREE.Vector3();
      for (let ii = 0; ii <= S; ii++) { const c = cv.getPointAt(ii / S), k = (r0 + (r1 - r0) * Math.pow(ii / S, 0.8)) / r0; for (let jj = 0; jj <= 6; jj++) { const n = ii * 7 + jj; v.fromBufferAttribute(p, n).sub(c).multiplyScalar(k).add(c); p.setXYZ(n, v.x, v.y, v.z); } } g0.computeVertexNormals(); return M(g0, wm, 0, 0, 0, P.head, 0); };
    for (const s of [-1, 1]) { const rx = s * 0.075, ry = tip.y - 0.075, rz = tip.z - 0.085; M(new THREE.SphereGeometry(0.045, 10, 8), wm, rx, ry, rz, P.head, 0).scale.set(1.1, 0.8, 0.9);
      for (const [len, drop, flick, r0, dy] of [[0.62, 0.42, 0.06, 0.016, 0.01], [0.5, 0.55, 0.04, 0.013, -0.015], [0.34, 0.2, 0.03, 0.01, 0.025]]) { const pts = [];
        for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push(new THREE.Vector3(rx + s * u * len, ry + dy - Math.sin(u * Math.PI * 0.85) * len * drop * 0.6 - u * len * drop * 0.25 + Math.pow(u, 6) * flick * 3, rz - u * len * 0.28)); } whisk(pts, r0, 0.0025); } }
    const gp = []; for (let k = 0; k <= 8; k++) { const u = k / 8; gp.push(new THREE.Vector3(Math.sin(u * 2.4) * 0.012, -0.36 - u * 0.24, 0.26 - u * 0.04)); } whisk(gp, 0.022, 0.004); }
  // gold sash (wraps the robe: tilted ring raycast onto the torso) + the M medallion where it crosses the chest
  const torso = B.children.filter(c => c.isMesh && !keep.has(c) && c.geometry && (c.geometry.computeBoundingBox(), c.geometry.boundingBox.max.y - c.geometry.boundingBox.min.y > 0.5)); B.updateMatrixWorld(true);
  const ring = (cy, tilt, mat, w, out = 0.02) => { const C0 = new THREE.Vector3(0, cy, 0), u = new THREE.Vector3(Math.cos(tilt), -Math.sin(tilt), 0), v = new THREE.Vector3(0, 0, 1), rc = new THREE.Raycaster(), pts = [];
    for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, d = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a)), o = C0.clone().addScaledVector(d, 1.5), wo = B.localToWorld(o.clone()), wc = B.localToWorld(C0.clone()); rc.set(wo, wc.sub(wo).normalize()); const h = rc.intersectObjects(torso, false)[0]; if (h) pts.push(B.worldToLocal(h.point.clone()).addScaledVector(d, out)); }
    if (pts.length > 10) B.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, w, 5, true), mat)); return pts; };
  const ly = P.legs && P.legs[0] ? P.legs[0].position.y - 0.5 : 0;
  ring(0.95 + ly, 0.72, gold, 0.045);
  if (crestMap) { const mx = 0.1, my = 0.95 - 0.1 * Math.tan(0.72) + ly, rc = new THREE.Raycaster(), o = B.localToWorld(new THREE.Vector3(mx, my, 2)); rc.set(o, B.localToWorld(new THREE.Vector3(mx, my, 0)).sub(o).normalize()); const h = rc.intersectObjects(torso, false)[0], z = h ? B.worldToLocal(h.point.clone()).z + 0.105 : 0.42;   // s149i: in front of the sash tube
    const md = M(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 32), [gold, new THREE.MeshBasicMaterial({ map: crestMap, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), gold], mx, my, z, B, 0.008); md.rotation.set(Math.PI / 2 - 0.2, Math.PI / 2, 0, 'XYZ'); md.renderOrder = 5; }   // s149g: lower on the sash, in front of the chain + sash (top layer)
  // gold chain: links hanging from the collar down the chest
  { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, 1.22 + ly, 0.12), new THREE.Vector3(-0.12, 1.06 + ly, 0.3), new THREE.Vector3(0.04, 0.98 + ly, 0.34), new THREE.Vector3(0.16, 1.08 + ly, 0.3), new THREE.Vector3(0.22, 1.22 + ly, 0.12)]);
    for (let k = 0; k <= 16; k++) { const p = c.getPoint(k / 16), l = M(new THREE.TorusGeometry(0.018, 0.006, 5, 10), gold, p.x, p.y, p.z, B, 0); l.rotation.set(k % 2 ? Math.PI / 2 : 0, 0.3, 0); } const pe = c.getPoint(0.5); M(new THREE.OctahedronGeometry(0.04, 0), toon('#3b82f6', { emissive: new THREE.Color('#3b82f6'), emissiveIntensity: 0.5 }), pe.x, pe.y - 0.05, pe.z + 0.01, B, 0.006); }
  // bracers + rings
  for (const a of P.arms || []) { const paw = a.children.find(c => c.isGroup && Math.abs(c.position.y + 0.4) < 0.01); if (paw) { paw.position.y = -0.5; paw.scale.setScalar(1.15); }   // s149g: HANDS out past the wide sleeve
    const br = M(new THREE.CylinderGeometry(0.085, 0.095, 0.1, 14), gold, 0, -0.42, 0, a, 0.008, 0.095); M(new THREE.TorusGeometry(0.092, 0.012, 6, 16), toon('#3b82f6'), 0, -0.42, 0, a, 0).rotation.x = Math.PI / 2;
    if (paw) for (const [dx, dz] of [[-0.04, 0.07], [0.0, 0.075]]) { const r = M(new THREE.TorusGeometry(0.03, 0.009, 5, 12), gold, dx, -0.03, dz, paw, 0); r.rotation.x = Math.PI / 2; } }
  regalPoses(f, P, { THREE, M, toon });
}
// PRINCESS MICHELLE (Ben, s149): King Might's look as a sleek ARMOUR ROBE: the kit armour (navy plates, gold accent, M crest decal)
// + a segmented armoured skirt to the floor (gold trim rings, front panel), a short gold-lined cape, gold tiara with a blue gem, bracers + a ring
function michelle(f, P, { THREE, M, toon }) {
  const gold = toon('#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.35 }), navy = toon('#1b2a66'), navyL = toon('#3b52a8'), navyD = toon('#0d1636'), blue = toon('#3b82f6', { emissive: new THREE.Color('#3b82f6'), emissiveIntensity: 0.6 }), B = P.body;
  const ly = P.legs && P.legs[0] ? P.legs[0].position.y - 0.5 : 0;
  // armoured skirt: 3 overlapping flared bands from the waist to the floor, gold rims, a front panel with the M stripe
  for (const [y0, y1, r0, r1, c] of [[0.68, 0.38, 0.29, 0.36, '#3b52a8'], [0.46, 0.18, 0.34, 0.42, '#1b2a66'], [0.26, 0.02, 0.4, 0.48, '#0d1636']]) { const h = y0 - y1; M(new THREE.CylinderGeometry(r0, r1, h, 28, 1, true), toon(c, { side: THREE.DoubleSide }), 0, (y0 + y1) / 2 + ly, 0, B, 0, r1).scale.z = 0.86; const rg = M(new THREE.TorusGeometry(r1, 0.016, 6, 32), gold, 0, y1 + ly, 0, B, 0); rg.rotation.x = Math.PI / 2; rg.scale.set(1, 0.86, 1); }   // s149: solid double-sided bands, rims squashed to match (no floating hoops)
  { const fp = M(new THREE.BoxGeometry(0.2, 0.62, 0.02), navyL, 0, 0.33 + ly, 0.39, B, 0.008); fp.rotation.x = -0.12; for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.018, 0.62, 0.025), gold, s * 0.1, 0, 0.002, fp, 0); M(new THREE.OctahedronGeometry(0.035, 0), blue, 0, 0.22, 0.02, fp, 0); }
  P.legs.forEach(p => p.visible = false);
  M(new THREE.TorusGeometry(0.3, 0.03, 6, 30), gold, 0, 0.66 + ly, 0, B, 0.006).rotation.x = Math.PI / 2;   // gold belt
  // short cape: back half-shell from the shoulders, gold lining
  { const cp = new THREE.CylinderGeometry(0.34, 0.46, 0.75, 20, 1, true, Math.PI * 0.6, Math.PI * 0.8); const c = M(cp, navyD, 0, 0.82 + ly, -0.04, B, 0.012); c.rotation.x = 0.08; const ln = M(cp.clone(), gold, 0, 0.82 + ly, -0.03, B, 0); ln.scale.set(0.97, 0.98, 0.97); ln.material = toon('#e6b45a', { side: THREE.BackSide }); c.material = toon('#0d1636', { side: THREE.FrontSide }); }
  // TIARA (s149j): hugs the brow. Points raycast onto the skull along a front arc; spires stand on the band, tilted with the head's slope
  { const H = P.head; H.updateMatrixWorld(true); const tg = H.children.filter(c => c.isMesh && c.geometry && c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius > 0.3 || (c.isMesh && c.children.some(k => k.material && k.material.map))); const rc = new THREE.Raycaster(), pts = [];
    for (let k = 0; k <= 16; k++) { const a = -1.15 + k / 16 * 2.3, y = 0.27 - Math.abs(a) * 0.04, dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), o = new THREE.Vector3(0, y, 0).addScaledVector(dir, 1.2), wo = H.localToWorld(o.clone()); rc.set(wo, H.localToWorld(new THREE.Vector3(0, y, 0)).sub(wo).normalize()); const h = rc.intersectObjects(H.children.filter(c => c.isMesh), true)[0]; if (h) pts.push(H.worldToLocal(h.point.clone()).addScaledVector(dir, 0.012)); }
    if (pts.length > 6) { const cv = new THREE.CatmullRomCurve3(pts); M(new THREE.TubeGeometry(cv, 40, 0.017, 6, false), gold, 0, 0, 0, H, 0);
      for (const [u, h] of [[0.5, 0.15], [0.36, 0.1], [0.64, 0.1], [0.2, 0.06], [0.8, 0.06]]) { const p = cv.getPointAt(u), sp = M(new THREE.ConeGeometry(0.024, h, 4), gold, p.x, p.y + h / 2 - 0.004, p.z, H, 0.005); sp.rotation.x = -0.2; }
      const c = cv.getPointAt(0.5); M(new THREE.OctahedronGeometry(0.034, 0), blue, c.x, c.y + 0.005, c.z + 0.02, H, 0); } }
  // EAR ROOTS (s149j): the round fur clumps under the ears are flattened + tucked into the skull so the ears grow out of the head cleanly
  P.head.children.forEach(c => { if (c.isMesh && c.geometry && c.geometry.type === 'SphereGeometry' && Math.abs((c.geometry.parameters || {}).radius - 0.11) < 0.001) { c.visible = false; } });
  // bracers + a ring
  for (const a of P.arms || []) { M(new THREE.CylinderGeometry(0.085, 0.095, 0.1, 14), gold, 0, -0.3, 0, a, 0.008, 0.095); M(new THREE.TorusGeometry(0.092, 0.01, 6, 16), blue, 0, -0.3, 0, a, 0).rotation.x = Math.PI / 2; }
  regalPoses(f, P, { THREE, M, toon });
}
// OYAKATA FOX (Ben, s149): a BIG FAT FOX SUMO. Boxer base (bare fur torso) + heavy build, then: a huge belly + chest, fat arms + paws (gloves off),
// blue mawashi (thick waist wrap + front/back strap + white sagari cords), a topknot. Poses: stance · shiko · tsuppari · tachiai · salt · victory · hurt · stunned
function sumo(f, P, { THREE, M, toon }) {
  const L = f.userData.face ? f.userData.face.L : null, furC = (L && L.fur) || '#f2741f', fur = toon(furC), cream = toon((L && L.fluff) || '#ffe4c4'), blueM = toon('#1d4ed8'), blueD = toon('#1e3a8a'), white = toon('#f8fafc'), B = P.body;
  const ly = P.legs && P.legs[0] ? P.legs[0].position.y - 0.5 : 0;
  B.children.forEach(c => { if (c.isMesh && c.geometry && c.geometry.type === 'LatheGeometry') { c.geometry.computeBoundingBox(); if (c.geometry.boundingBox.min.y < 0.5) c.visible = false; } });   // boxer shorts off (the mawashi replaces them)
  // BELLY + chest + love handles
  const belly = new THREE.Group(); belly.position.set(0, 0.82 + ly, 0.12); B.add(belly); f.userData.belly = belly;
  M(new THREE.SphereGeometry(0.5, 28, 20), fur, 0, 0, 0, belly, 0.03, 0.5).scale.set(1.15, 1.0, 1.0); M(new THREE.SphereGeometry(0.36, 22, 16), cream, 0, -0.02, 0.2, belly, 0, 0.36).scale.set(1.15, 1.1, 0.9);
  M(new THREE.SphereGeometry(0.035, 10, 8), toon('#c9844e'), 0, 0.02, 0.5, belly, 0);   // belly button
  for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.22, 16, 12), fur, s * 0.24, 1.18 + ly, 0.22, B, 0.02, 0.22).scale.set(1.1, 0.8, 0.7); M(new THREE.SphereGeometry(0.24, 16, 12), fur, s * 0.4, 0.8 + ly, -0.02, B, 0.02, 0.24).scale.set(0.7, 1, 1); }
  // fat arms + paws (boxer gloves off) · s149l: arms 30% longer
  for (const a of P.arms || []) { a.scale.set(1.08, 1.3, 1.08); a.children.forEach(c => { if (c.position.y < -0.29) c.visible = false; }); M(new THREE.SphereGeometry(0.12, 14, 10), fur, 0, -0.12, 0, a, 0.015, 0.12).scale.set(1, 1.3, 1); M(new THREE.SphereGeometry(0.1, 14, 10), toon((L && L.paw) || furC), 0, -0.4, 0.02, a, 0.014, 0.1); }
  for (const l of P.legs || []) { M(new THREE.SphereGeometry(0.17, 14, 12), fur, 0, -0.1, 0.02, l, 0.016, 0.17).scale.set(1, 1.25, 1.05); M(new THREE.SphereGeometry(0.12, 12, 10), fur, 0, -0.32, 0.03, l, 0.012, 0.12).scale.set(1, 1.1, 1); }   // big thighs + calves
  // MAWASHI: thick blue wrap round the belly bottom, a front strap down between the legs, a knot at the back, white sagari cords hanging in front
  // s149l: everything round the waist is CONFORMED to the body (rays cast in onto the torso + belly), so it hugs the form and stays clear of the arms
  const torsoT = []; B.updateMatrixWorld(true); belly.children.forEach(c => c.isMesh && torsoT.push(c)); B.children.forEach(c => { if (c.isMesh && c.visible && c.geometry && !Array.isArray(c.material)) { c.geometry.computeBoundingBox(); const s = new THREE.Vector3(); c.geometry.boundingBox.getSize(s); if (Math.max(s.x, s.z) >= 0.3) torsoT.push(c); } });
  const conform = (y, out, n = 48) => { const rc = new THREE.Raycaster(), pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), c0 = new THREE.Vector3(0, y, 0.03), o = c0.clone().addScaledVector(d, 2), wo = B.localToWorld(o.clone()); rc.set(wo, B.localToWorld(c0.clone()).sub(wo).normalize()); const h = rc.intersectObjects(torsoT, false)[0]; pts.push(h ? B.worldToLocal(h.point.clone()).addScaledVector(d, out) : c0.clone().addScaledVector(d, 0.5)); } return pts; };
  B.userData.conform = conform;
  { for (const [y, r, m] of [[0.47, 0.06, blueM], [0.54, 0.065, blueM], [0.61, 0.06, blueM], [0.66, 0.025, blueD]]) M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(conform(y + ly, r * 0.7), true), 96, r, 8, true), m, 0, 0, 0, B, r > 0.03 ? 0.01 : 0);
    const F = conform(0.4 + ly, 0.04)[0], K = conform(0.4 + ly, 0.04)[24];
    const fs = M(new THREE.BoxGeometry(0.26, 0.4, 0.07), blueM, 0, 0.3 + ly, Math.min(F.z, 0.5) - 0.02, B, 0.012); fs.rotation.x = 0.1; const bs = M(new THREE.BoxGeometry(0.22, 0.4, 0.07), blueM, 0, 0.34 + ly, K.z + 0.02, B, 0.012); bs.rotation.x = -0.12;
    M(new THREE.BoxGeometry(0.28, 0.22, 0.12), blueD, 0, 0.6 + ly, conform(0.6 + ly, 0.06)[24].z - 0.02, B, 0.012);   // back knot
    const FF = conform(0.47 + ly, 0.1); for (let k = -4; k <= 4; k++) { const p = FF[(k + 48) % 48], sg = M(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), white, p.x * 0.9, 0.3 + ly, p.z - 0.02, B, 0.004); sg.rotation.x = 0.08; } }
  // TOPKNOT (chonmage): a dark fur bun folded on the crown + a white tie
  { const tk = new THREE.Group(); tk.position.set(0, 0.36, -0.06); P.head.add(tk); const dk = toon((L && L.furDark) || '#c2410c'); M(new THREE.CapsuleGeometry(0.06, 0.16, 4, 10), dk, 0, 0.02, 0.06, tk, 0.01).rotation.x = Math.PI / 2 - 0.2; M(new THREE.SphereGeometry(0.09, 12, 10), dk, 0, 0, -0.06, tk, 0.01); M(new THREE.TorusGeometry(0.06, 0.014, 6, 14), white, 0, 0.02, -0.01, tk, 0); }
  // stars (stunned) + salt grains
  const stars = new THREE.Group(); stars.position.y = 0.75; P.head.add(stars); for (let k = 0; k < 3; k++) M(new THREE.OctahedronGeometry(0.06, 0), toon('#ffd23a', { emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0.8 }), Math.cos(k * 2.1) * 0.34, 0, Math.sin(k * 2.1) * 0.34, stars, 0.006); stars.visible = false;
  const salt = [...Array(14)].map(() => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.visible = false; B.add(s); return { s, v: new THREE.Vector3(), t: 0 }; });
  // ── DELUXE (s149k): yokozuna rope with zigzag paper, wrist tape, red war-paint on the cheeks
  { const rope = toon('#f5f1e6'), y0 = 0.7 + ly, rx = 0.75, rz = 0.65, cz = 0.05;
    const base = new THREE.CatmullRomCurve3(B.userData.conform(y0, 0.075, 64), true);
    for (const ph of [0, Math.PI]) { const pts = []; for (let k = 0; k < 220; k++) { const u = k / 220, p = base.getPointAt(u), d = new THREE.Vector3(p.x, 0, p.z - cz).normalize(), tw = u * Math.PI * 2 * 26 + ph; pts.push(p.clone().addScaledVector(d, 0.03 * Math.cos(tw)).add(new THREE.Vector3(0, 0.03 * Math.sin(tw), 0))); }
      M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 300, 0.034, 6, true), rope, 0, 0, 0, B, 0.008); }
    { const bk = base.getPointAt(0.5); for (const s of [-1, 1]) M(new THREE.TorusGeometry(0.1, 0.03, 6, 14), rope, s * 0.1, y0 + 0.04, bk.z - 0.03, B, 0.008).rotation.y = s * 0.4; }   // back knot loops
    for (const u of [0.92, 0.96, 0, 0.04, 0.08]) { const p = base.getPointAt(u), a = Math.atan2(p.x, p.z - cz), g = new THREE.Group(); g.position.set(p.x, y0 - 0.03, p.z + 0.02); g.rotation.y = a; B.add(g);
      for (let k = 0; k < 4; k++) M(new THREE.BoxGeometry(0.075, 0.07, 0.006), rope, (k % 2 ? 0.025 : -0.025), -0.035 - k * 0.062, 0, g, 0.004); } }   // shide (paper zigzags)
  for (const a of P.arms || []) M(new THREE.CylinderGeometry(0.098, 0.098, 0.08, 14), toon('#f5f1e6'), 0, -0.31, 0, a, 0.006, 0.1);
  { const H = P.head; H.updateMatrixWorld(true); const hits = H.children.filter(c => c.isMesh), rc = new THREE.Raycaster(), paint = toon('#c81e1e');
    const stroke = (x0, y0, x1, y1, w) => { const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, o = H.localToWorld(new THREE.Vector3(x, y, 1.2)); rc.set(o, H.localToWorld(new THREE.Vector3(x, y, 0)).sub(o).normalize()); const h = rc.intersectObjects(hits, true)[0]; if (h) { const p = H.worldToLocal(h.point.clone()); p.z += 0.01; pts.push(p); } }
      if (pts.length > 4) { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, w, 5, false), m = M(g, paint, 0, 0, 0, H, 0); m.renderOrder = 3; } };
    for (const s of [-1, 1]) { stroke(s * 0.24, -0.04, s * 0.36, -0.14, 0.014); stroke(s * 0.22, -0.1, s * 0.31, -0.19, 0.011); } }
  // ── FX pools: stomp ring + dust, palm afterimages, sweat
  const fxm = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 40), fxm(0xfff3d6)); ring.material.side = THREE.DoubleSide; ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; f.add(ring); let ringT = 0;
  const dust = [...Array(10)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), fxm(0xd8c7a8)); f.add(m); return { m, v: new THREE.Vector3(), t: 0 }; });
  const ghosts = [...Array(12)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), fxm(0xffd9a0)); m.scale.set(1, 1.15, 0.6); f.add(m); return { m, t: 0 }; }); let gi = 0, gT = 0;
  const sweat = [...Array(8)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 5), new THREE.MeshBasicMaterial({ color: 0x9fd8ff })); m.visible = false; f.add(m); return { m, v: new THREE.Vector3(), t: 0 }; });
  const toF = (o, v) => { o.updateWorldMatrix(true, false); f.updateWorldMatrix(true, false); return f.worldToLocal(o.localToWorld(v)); };
  const stomp = (x, z, big) => { ringT = big ? 0.55 : 0.4; ring.position.x = x; ring.position.z = z; dust.forEach((d, k) => { const a = k / 10 * Math.PI * 2, sp = big ? 2.2 : 1.4; d.m.position.set(x + Math.cos(a) * 0.3, 0.08, z + Math.sin(a) * 0.3); d.v.set(Math.cos(a) * sp, 0.4 + Math.random() * 0.6, Math.sin(a) * sp); d.t = 0.6; }); };
  const sweatBurst = () => { const p = toF(P.head, new THREE.Vector3(0, 0.2, 0)); sweat.forEach(s => { s.m.position.copy(p); s.v.set((Math.random() - 0.5) * 2.4, 1.2 + Math.random() * 1.4, (Math.random() - 0.5) * 1.2); s.t = 0.8; s.m.visible = true; }); };
  const ghost = arm => { const g = ghosts[gi++ % ghosts.length]; g.m.position.copy(toF(arm, new THREE.Vector3(0, -0.45, 0.05))); g.t = 0.22; };
  const U = f.userData; U.pose = 'stance'; U.pt = 0; const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); let wob = 0, wv = 0, lastS = -1, lastSalt = -1, lastP = -1, lastT = -1, lastH = -1, lastGo = -1, prevPose = '';
  U.posePose = (t, dt) => { const pose = U.pose || 'stance'; if (pose !== prevPose) { prevPose = pose; lastS = lastSalt = lastP = lastT = lastH = lastGo = -1; } U.pt = (U.pt || 0) + dt; const pt = U.pt, A = P.arms, Lg = P.legs;
    let a0 = [-0.3, -0.62], a1 = [-0.3, 0.62], l0 = [0, -0.5], l1 = [0, 0.5], bx = 0.18, by = 0, bz = 0, bzp = 0, hx = -0.1, hz = 0, dy = -0.1, mood = 'stern'; stars.visible = false;
    if (pose === 'stance') { const bo = Math.abs(Math.sin(t * 3)); a0 = [-0.6 - 0.1 * bo, -0.62]; a1 = [-0.6 - 0.1 * bo, 0.62]; l0 = [0, -0.6]; l1 = [0, 0.6]; bx = 0.26; by = 0.1 * Math.sin(t * 1.5); dy = -0.16 + 0.04 * bo; mood = 'determined'; if (bo < 0.06) wv = Math.max(wv, 0.9); }
    if (pose === 'shiko') { const c = pt % 2.4, side = Math.floor(pt / 2.4) % 2 ? 1 : 0, up = ease(c / 0.8) * (1 - ease((c - 0.95) / 0.15)); l0 = [0, side ? -0.5 : -0.5 - 1.0 * up]; l1 = [0, side ? 0.5 + 1.0 * up : 0.5]; bz = (side ? -1 : 1) * 0.22 * up; a0 = [-0.2, -0.9 + 0.3 * up]; a1 = [-0.2, 0.9 - 0.3 * up]; dy = -0.15 + 0.08 * up; mood = 'determined';
      const cyc = Math.floor(pt / 2.4); if (c > 1.08 && cyc !== lastS) { lastS = cyc; wv = 4; stomp(side ? 0.45 : -0.45, 0, true); } }
    if (pose === 'tsuppari') { const c = (pt * 9) % 2, a = c < 1 ? ease(c) : 1 - ease(c - 1), bb = 1 - a; a1 = [-1.6 * a - 0.15, 0.12]; a0 = [-1.6 * bb - 0.15, -0.12]; by = 0.22 * (a - bb); bx = 0.32; dy = -0.16; l0 = [0, -0.6]; l1 = [0, 0.6]; mood = 'determined'; wv = Math.max(wv, 1.2);
      gT -= dt; if (gT <= 0) { gT = 0.035; ghost(a > bb ? A[1] : A[0]); } const h = Math.floor(pt / 1.2); if (h !== lastH) { lastH = h; sweatBurst(); } }
    if (pose === 'tachiai') { const c = pt % 2.0, crouch = ease(c / 0.5) * (1 - ease((c - 0.6) / 0.1)), go = ease((c - 0.6) / 0.15) * (1 - ease((c - 1.4) / 0.5)); bx = 0.18 + 0.5 * crouch + 0.35 * go; dy = -0.12 - 0.25 * crouch; bzp = go * 0.6; a0 = [-0.4 - 1.0 * go + 0.5 * crouch, -0.3]; a1 = [-0.4 - 1.0 * go + 0.5 * crouch, 0.3]; mood = 'determined'; if (go > 0.9) wv = Math.max(wv, 2);
      const cyc = Math.floor(pt / 2); if (c > 0.62 && cyc !== lastGo) { lastGo = cyc; stomp(0, 0, false); } }
    if (pose === 'press') { const c = pt % 2.6, crouch = ease(c / 0.3) * (1 - ease((c - 0.3) / 0.08)), air = c > 0.38 && c < 1.0 ? (c - 0.38) / 0.62 : -1, land = c >= 1.0 ? 1 - ease((c - 1.3) / 0.8) : 0;
      if (air >= 0) { dy = -0.1 + Math.sin(air * Math.PI) * 1.5; bx = 0.2 + 1.1 * ease(air); a0 = [-2.6, -0.9]; a1 = [-2.6, 0.9]; l0 = [0.5, -0.4]; l1 = [0.5, 0.4]; bzp = air * 0.9; mood = 'determined'; }
      else if (c >= 1.0) { dy = -0.3 * land - 0.1; bx = 0.2 + 1.0 * land; bzp = 0.9 * land; a0 = [-1.2 * land - 0.3, -0.9]; a1 = [-1.2 * land - 0.3, 0.9]; mood = land > 0.5 ? 'determined' : 'happy'; }
      else { dy = -0.12 - 0.25 * crouch; bx = 0.3 + 0.3 * crouch; a0 = [0.4 * crouch, -0.4]; a1 = [0.4 * crouch, 0.4]; mood = 'determined'; }
      const cyc = Math.floor(pt / 2.6); if (c >= 1.0 && cyc !== lastP) { lastP = cyc; wv = 6; stomp(0, 0.9, true); sweatBurst(); } }
    if (pose === 'taunt') { const c = (pt * 2.6) % 2, sl = c < 1 ? ease(c) : 1 - ease(c - 1); a0 = [-0.75 + 0.35 * sl, -0.15]; a1 = [-0.75 + 0.35 * sl, 0.15]; hx = -0.35; hz = 0.08 * Math.sin(t * 5); bx = -0.08; dy = -0.08 + 0.03 * sl; mood = 'happy';
      const k = Math.floor(pt * 1.3); if (k !== lastT) { lastT = k; wv = 3.5; } }
    if (pose === 'salt') { const c = pt % 2.6, th = ease((c - 0.4) / 0.25) * (1 - ease((c - 1.3) / 0.6)); a1 = [-0.3 - 2.4 * th, 0.4 + 0.3 * th]; a0 = [-0.15, -0.4]; hx = -0.25 * th; dy = -0.08; mood = 'happy'; const cyc = Math.floor(pt / 2.6); if (c > 0.62 && cyc !== lastSalt) { lastSalt = cyc; A[1].updateWorldMatrix(true, false); const p = B.worldToLocal(A[1].localToWorld(new THREE.Vector3(0, -0.45, 0))); salt.forEach(q => { q.s.position.copy(p); q.v.set((Math.random() - 0.5) * 1.6, 2 + Math.random() * 1.8, 0.8 + Math.random() * 1.4); q.t = 1.3; q.s.visible = true; }); } }
    if (pose === 'victory') { const pump = Math.abs(Math.sin(t * 3)); a1 = [-2.6 - 0.3 * pump, 0.3]; a0 = [-0.6, -0.25]; hx = -0.25; dy = -0.05 + 0.04 * pump; l0 = [0, -0.55]; l1 = [0, 0.55]; mood = 'happy'; if (pump > 0.98) wv = Math.max(wv, 1.4); }
    if (pose === 'hurt') { const c = pt % 1.3, k = Math.exp(-c * 4); bx = -0.3 * k + 0.1; a0 = [-0.6 * k, -0.9 * k - 0.3]; a1 = [-0.6 * k, 0.9 * k + 0.3]; hx = -0.3 * k; mood = 'surprised'; const cyc = Math.floor(pt / 1.3); if (cyc !== lastH) { lastH = cyc; wv = 4; sweatBurst(); } }
    if (pose === 'stunned') { bz = Math.sin(t * 2) * 0.12; bx = 0.1; hx = 0.25; hz = Math.sin(t * 2 + 1) * 0.25; a0 = [0.1, -0.3]; a1 = [0.1, 0.3]; mood = 'sad'; stars.visible = true; stars.rotation.y = t * 3; if (Math.sin(t * 2) > 0.995) wv = Math.max(wv, 1); }
    B.position.z = bzp;
    A[0].rotation.x = a0[0]; A[0].rotation.z = a0[1]; A[1].rotation.x = a1[0]; A[1].rotation.z = a1[1]; Lg[0].rotation.x = l0[0]; Lg[0].rotation.z = l0[1]; Lg[1].rotation.x = l1[0]; Lg[1].rotation.z = l1[1];
    B.rotation.set(bx, by, bz); B.position.y = dy + 0.16; P.head.rotation.x = hx; P.head.rotation.z = hz; U.lineMood = mood;
    wob += wv * dt; wv -= (wob * 60 + wv * 6) * dt; const w = Math.max(-0.12, Math.min(0.12, wob * 0.12)); belly.scale.set(1 + w * 0.6, 1 - w, 1 + w * 0.4);
    for (const q of salt) { if (!q.s.visible) continue; q.t -= dt; if (q.t <= 0) { q.s.visible = false; continue; } q.v.y -= 6 * dt; q.s.position.addScaledVector(q.v, dt); }
    if (ringT > 0) { ringT -= dt; const k = 1 - ringT / 0.55; ring.scale.setScalar(1 + k * 3.5); ring.material.opacity = Math.max(0, ringT * 1.6); } else ring.material.opacity = 0;
    for (const d of dust) { if (d.t <= 0) { d.m.material.opacity = 0; continue; } d.t -= dt; d.v.multiplyScalar(1 - 3 * dt); d.m.position.addScaledVector(d.v, dt); d.m.scale.setScalar(1 + (0.6 - d.t) * 2); d.m.material.opacity = Math.max(0, d.t) * 1.1; }
    for (const g of ghosts) { if (g.t <= 0) { g.m.material.opacity = 0; continue; } g.t -= dt; g.m.material.opacity = Math.max(0, g.t / 0.22) * 0.55; }
    for (const s of sweat) { if (!s.m.visible) continue; s.t -= dt; if (s.t <= 0) { s.m.visible = false; continue; } s.v.y -= 7 * dt; s.m.position.addScaledVector(s.v, dt); } };
}
// shared royal poses (King Might + Princess Michelle): royal · fight · palm · taunt · victory · hurt · stunned
function regalPoses(f, P, { THREE, M, toon }) {
  const B = P.body;
  // stars for the stunned pose + palm glow
  const stars = new THREE.Group(); stars.position.y = 0.75; P.head.add(stars); for (let k = 0; k < 3; k++) { const s = M(new THREE.OctahedronGeometry(0.06, 0), toon('#ffd23a', { emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0.8 }), Math.cos(k * 2.1) * 0.32, 0, Math.sin(k * 2.1) * 0.32, stars, 0.006); } stars.visible = false;
  const pg = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); pg.scale.setScalar(0.5); pg.position.set(0, -0.5, 0.1); P.arms[1].add(pg);
  const U = f.userData; U.pose = 'royal'; U.pt = 0; const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
  U.posePose = (t, dt) => { const pose = U.pose || 'royal'; U.pt = (U.pt || 0) + dt; const pt = U.pt, A = P.arms, Lg = P.legs, s0 = -1, s1 = 1;
    let a0 = [0, 0], a1 = [0, 0], l0 = 0, l1 = 0, by = 0, bx = 0, bz = 0, hx = 0, hz = 0, mood = 'stern', glow = 0; stars.visible = false;
    if (pose === 'royal') { a0 = [0.55, -s0 * 0.22]; a1 = [0.55, -s1 * 0.22]; hx = -0.05 + Math.sin(t * 0.8) * 0.02; mood = 'stern'; }
    if (pose === 'fight') { l0 = 0.28; l1 = -0.36; by = -0.35; a1 = [-1.3 + Math.sin(t * 3) * 0.05, s1 * 0.12]; a0 = [-0.75 + Math.sin(t * 3 + 1) * 0.05, s0 * 0.3]; mood = 'determined'; B.position.y = -0.02 * Math.abs(Math.sin(t * 3)); }
    if (pose === 'palm') { const c = pt % 1.5, st = ease((c - 0.25) / 0.12) * (1 - ease((c - 0.75) / 0.35)); l0 = 0.3; l1 = -0.45 * (0.5 + st * 0.5); by = -0.35 + 0.45 * st; a1 = [-0.6 - 1.0 * st, s1 * 0.1]; a0 = [0.35 * st - 0.6, s0 * 0.35]; glow = st; mood = 'determined'; }
    if (pose === 'taunt') { a1 = [-1.4 + Math.sin(pt * 9) * 0.18, s1 * 0.05]; a0 = [0.55, -s0 * 0.22]; hz = 0.15; hx = -0.08; mood = 'smug'; }
    if (pose === 'victory') { a1 = [-3.0 + Math.sin(t * 2) * 0.05, s1 * 0.18]; a0 = [-0.1, s0 * 0.55]; hx = -0.2; mood = 'happy'; B.position.y = 0.02 * Math.abs(Math.sin(t * 2)); }
    if (pose === 'hurt') { const k = Math.exp(-(pt % 1.3) * 4); bx = -0.32 * k; a0 = [-0.5 * k, s0 * 0.7 * k]; a1 = [-0.5 * k, s1 * 0.7 * k]; hx = -0.25 * k; mood = 'surprised'; }
    if (pose === 'stunned') { bz = Math.sin(t * 2.2) * 0.1; bx = 0.12; hx = 0.25; hz = Math.sin(t * 2.2 + 1) * 0.25; a0 = [0.1, s0 * 0.15]; a1 = [0.15, s1 * 0.15]; mood = 'sad'; stars.visible = true; stars.rotation.y = t * 3; }
    A[0].rotation.x = a0[0]; A[0].rotation.z = a0[1]; A[1].rotation.x = a1[0]; A[1].rotation.z = a1[1]; Lg[0].rotation.x = l0; Lg[1].rotation.x = l1;
    B.rotation.set(bx, by, bz); P.head.rotation.x = hx; P.head.rotation.z = hz; U.lineMood = mood; pg.material.opacity = glow * 0.9; pg.scale.setScalar(0.3 + glow * 0.4); };
}
// NO INSIGNIA: drop the crest badge (multi-material discs) + dull the gold trim to old iron / brass
function strip(P, THREE, toon) {
  const iron = toon('#4f4a44'), brass = toon('#7a6a44'), kill = [];
  P.body.traverse(o => { if (!o.isMesh) return; if (Array.isArray(o.material) || o.userData.crest) { kill.push(o); return; } const c = o.material && o.material.color; if (c && c.getHexString() === 'e6b45a') o.material = o.geometry.type === 'SphereGeometry' ? iron : brass; });
  for (const o of kill) o.parent && o.parent.remove(o);
}
// HEAVYWEIGHT BUILD: barrel chest + huge shoulders, thick arms and legs, wide stance, short neck (head sits lower, a touch smaller)
function heavy(P, THREE) {
  const B = P.body, keep = new Set([P.head, ...(P.arms || []), ...(P.legs || []), P.tail].filter(Boolean));
  for (const c of B.children) { if (keep.has(c)) continue; c.position.x *= 1.42; c.position.z *= 1.15; let small = false; if (c.geometry) { c.geometry.computeBoundingBox(); const sz = new THREE.Vector3(); c.geometry.boundingBox.getSize(sz); small = (Math.max(sz.x, sz.z) < 0.3 || Array.isArray(c.material)) && !c.userData.crest; } if (small) { c.position.z += 0.12; continue; } c.scale.x *= 1.42; c.scale.z *= 1.28; }   // small bits (the crest badge) move out with the chest but keep their size
  for (const a of P.arms || []) { a.position.x *= 1.5; a.position.y -= 0.03; a.scale.x *= 1.5; a.scale.z *= 1.5; a.scale.y *= 1.06; }
  for (const l of P.legs || []) { l.position.x *= 1.55; l.scale.x *= 1.5; l.scale.z *= 1.4; }
  if (P.head) { P.head.scale.multiplyScalar(0.9); P.head.position.y -= 0.1; }
}
// BATTLE-WORN: patches, rips, straps, bandages, a scuffed plate (added after the heavy build, on the wide chest: front z ≈ 0.5, sides x ≈ 0.5)
function worn(key, P, { THREE, M, toon }) {
  // SASH: a strap that wraps the torso (a tilted ring raycast onto the chest meshes, pushed 2 cm out) → its points, for shells / buckles
  const torsoMeshes = []; P.body.children.forEach(c => { if (c.isMesh && c.geometry && c !== P.tail && !Array.isArray(c.material)) { c.geometry.computeBoundingBox(); const s = new THREE.Vector3(); c.geometry.boundingBox.getSize(s); if (Math.max(s.x, s.z) >= 0.3) torsoMeshes.push(c); } });
  P.body.updateMatrixWorld(true);
  const sash = (cy, tilt, col, w = 0.035, out = 0.022) => { const C0 = new THREE.Vector3(0, cy, 0), n = new THREE.Vector3(Math.sin(tilt), Math.cos(tilt), 0), u = new THREE.Vector3(Math.cos(tilt), -Math.sin(tilt), 0), v = new THREE.Vector3(0, 0, 1), rc = new THREE.Raycaster(), pts = [];
    for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, d = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a)), o = C0.clone().addScaledVector(d, 1.5), wo = P.body.localToWorld(o.clone()), wc = P.body.localToWorld(C0.clone());
      rc.set(wo, wc.sub(wo).normalize()); const h = rc.intersectObjects(torsoMeshes, false)[0]; if (h) pts.push(P.body.worldToLocal(h.point.clone()).addScaledVector(d, out)); }
    if (pts.length < 10) return []; const curve = new THREE.CatmullRomCurve3(pts, true), m = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, w, 5, true), toon(col)); m.scale.set(1, 1, 1); P.body.add(m); return pts.filter(p => p.z > 0.2); };
  const B = P.body, ly = (P.legs && P.legs[0] ? P.legs[0].position.y - 0.5 : 0.25), ink = toon('#1c1814'), rip = toon('#120e0b');
  const patch = (c, x, y, z, w, h, ry = 0, rz = 0) => { const p = M(new THREE.BoxGeometry(w, h, 0.012), toon(c), x, y + ly, z, B, 0.006); p.rotation.set(0, ry, rz); for (const s of [-1, 1]) M(new THREE.BoxGeometry(w * 0.9, 0.006, 0.014), ink, 0, s * h * 0.42, 0.002, p, 0); return p; };
  const tear = (x, y, z, ry = 0, rz = 0.5, l = 0.12) => { const t = M(new THREE.BoxGeometry(l, 0.016, 0.012), rip, x, y + ly, z, B, 0); t.rotation.set(0, ry, rz); };
  const wrap = (p, y0, n, c) => { for (let k = 0; k < n; k++) { const r = M(new THREE.TorusGeometry(0.075, 0.018, 6, 16), toon(c), 0, y0 - k * 0.045, 0, p, 0); r.rotation.x = Math.PI / 2 + (k % 2 ? 0.18 : -0.18); } };
  if (key === 'jack') {   // grubby khaki work shirt, faded green bandolier with chilli-shell loops, rope belt, patched + torn, bandaged left forearm
    const front = sash(0.95 + ly, 0.78, '#3e4a26', 0.042);
    front.forEach((p, k) => { if (k % 2) return; const sh = M(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 8), toon(k % 4 ? '#b8401f' : '#3f6d2e'), p.x, p.y, p.z + 0.03, B, 0.006); sh.rotation.z = 0.78; });
    sash(0.6 + ly, 0, '#8a7350', 0.032, 0.012);   // rope belt, snug on the waist
    patch('#8a7a58', -0.24, 1.0, 0.47, 0.13, 0.11, -0.4, 0.15); patch('#5d6b3a', 0.3, 0.72, 0.43, 0.12, 0.1, 0.55, -0.2); patch('#7a6d52', -0.46, 0.92, 0.12, 0.1, 0.12, -1.35);
    tear(0.18, 1.1, 0.49, 0.3, 0.6); tear(-0.12, 0.7, 0.5, -0.2, -0.4, 0.1); tear(0.44, 1.0, 0.2, 1.2, 0.3, 0.09);
    if (P.arms && P.arms[0]) wrap(P.arms[0], -0.18, 4, '#e8e0cc');
  }
  if (key === 'rook') {   // cracked brown leather duster, one scuffed iron pauldron (left), cross straps + pouches, patched elbows, bandaged right wrist
    const pg = new THREE.Group(); pg.position.set(-0.56, 1.2 + ly, 0); pg.rotation.z = 0.45; B.add(pg);
    M(new THREE.SphereGeometry(0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#5c5852'), 0, 0, 0, pg, 0.02, 0.24).scale.set(1, 0.7, 1.05);
    for (const [dx, dz] of [[0.1, 0.12], [-0.08, 0.15], [0.02, -0.14]]) M(new THREE.SphereGeometry(0.018, 6, 4), toon('#2e2b28'), dx, 0.14, dz, pg, 0);
    M(new THREE.BoxGeometry(0.2, 0.01, 0.015), rip, 0.02, 0.12, 0.17, pg, 0).rotation.y = 0.4;   // dent / scratch
    for (const s of [-1, 1]) sash(0.92 + ly, s * 0.7, '#2f241a', 0.036);
    { const rc = new THREE.Raycaster(), o = P.body.localToWorld(new THREE.Vector3(0, 0.92 + ly, 2)); rc.set(o, P.body.localToWorld(new THREE.Vector3(0, 0.92 + ly, 0)).sub(o).normalize()); const h = rc.intersectObjects(torsoMeshes, false)[0], z = h ? P.body.worldToLocal(h.point.clone()).z + 0.04 : 0.51; M(new THREE.BoxGeometry(0.1, 0.1, 0.03), toon('#4f4a44'), 0, 0.92 + ly, z, B, 0.006); }   // plain iron buckle where the straps cross   // plain iron buckle where the straps cross
    { const bp = sash(0.7 + ly, 0, '#2f241a', 0.036, 0.012); for (const t of [0.2, 0.5, 0.8]) { const p = bp[Math.floor(t * (bp.length - 1))]; if (p) M(new THREE.BoxGeometry(0.11, 0.12, 0.06), toon('#4a3828'), p.x, p.y - 0.07, p.z + 0.02, B, 0.008).rotation.y = Math.atan2(p.x, p.z); } }   // belt + 3 pouches sitting on it
    patch('#3e2f22', 0.3, 1.02, 0.45, 0.13, 0.12, 0.5, 0.1); patch('#7a6248', -0.2, 0.5, 0.5, 0.12, 0.1, -0.3, -0.1);
    tear(-0.25, 1.06, 0.47, -0.4, -0.5); tear(0.1, 0.42, 0.52, 0.1, 0.5, 0.14); tear(0.48, 0.9, 0.18, 1.2, -0.3, 0.1);
    if (P.arms && P.arms[1]) wrap(P.arms[1], -0.28, 3, '#d9cfb8');
  }
}
// IRON WARDEN v2 (Ben, s149): TALL KNIGHT robot in black iron + molten orange. Long limbs, armour plates, crested helmet, cape plates,
// piston fists, glowing core, exhaust stacks, hydraulic pistons, rivets + dents, visor expressions, hazard-stripe pauldrons, sparks + smoke.
// Poses (g.userData.pose): stance · taunt · stomp · rocket · spin · stunned · hurt. Built at real size (~3.1 m tall).
export function ironWarden({ THREE, M, toon, grad }) {
  const IRON = '#1c1a19', MID = '#56504a', LIGHT = '#8a837b', CHROME = '#c4beb6', DENT = '#0e0d0c', ORANGE = '#ff7a1a';   // s149b: more contrast (black frame · gunmetal plates · pale steel joints)
  const iron = toon(IRON), mid = toon(MID), light = toon(LIGHT), chrome = toon(CHROME), dentM = toon(DENT);
  const glowM = () => new THREE.MeshToonMaterial({ color: ORANGE, gradientMap: grad, emissive: new THREE.Color(ORANGE), emissiveIntensity: 1.6 });
  const glow = glowM(), coreM = glowM();
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const hazT = CT(128, 32, (g, w, h) => { g.fillStyle = '#141312'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5b301'; for (let x = -h; x < w + h; x += 24) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 12, h); g.lineTo(x + 12 + h, 0); g.lineTo(x + h, 0); g.fill(); } }); hazT.wrapS = THREE.RepeatWrapping; hazT.repeat.set(3, 1);
  const haz = new THREE.MeshToonMaterial({ map: hazT, gradientMap: grad, side: THREE.DoubleSide });
  const BX = (w, h, d) => { const r = Math.min(0.06, Math.min(w, h, d) * 0.3), g0 = new THREE.BoxGeometry(w, h, d, 3, 3, 3), p = g0.attributes.position, hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), q = new THREE.Vector3();   // s149b: ROUNDED box (less boxy)
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); const dd = v.sub(q); if (dd.lengthSq() > 1e-9) { dd.normalize().multiplyScalar(r); p.setXYZ(k, q.x + dd.x, q.y + dd.y, q.z + dd.z); } } g0.computeVertexNormals(); return g0; }, CY = (a, b, h, n = 14) => new THREE.CylinderGeometry(a, b, h, n), SP = (r, w = 14, h = 10) => new THREE.SphereGeometry(r, w, h);
  const G = (p, x = 0, y = 0, z = 0) => { const q = new THREE.Group(); q.position.set(x, y, z); p.add(q); return q; };
  const rivets = (p, pts) => pts.forEach(([x, y, z]) => M(SP(0.018, 6, 4), light, x, y, z, p, 0));
  const dent = (p, x, y, z, r = 0.04, ry = 0) => { const d = M(SP(r, 8, 6), dentM, x, y, z, p, 0); d.scale.set(1, 0.7, 0.18); d.rotation.y = ry; };
  const line = (p, w, h, x, y, z, ry = 0) => { const l = M(BX(w, h, 0.006), dentM, x, y, z, p, 0); l.rotation.y = ry; };
  const g = new THREE.Group(), R = {};
  // ---- hips + legs ----
  const hips = R.hips = G(g, 0, 1.5, 0);
  M(BX(0.62, 0.3, 0.42), iron, 0, 0, 0, hips, 0.03); M(BX(0.66, 0.06, 0.46), light, 0, 0.14, 0, hips, 0.01);
  for (const s of [-1, 1]) { const t = M(BX(0.26, 0.36, 0.04), mid, s * 0.17, -0.22, 0.24, hips, 0.015); t.rotation.x = 0.18; rivets(t, [[-0.09, 0.14, 0.025], [0.09, 0.14, 0.025]]); const sd = M(BX(0.04, 0.34, 0.32), mid, s * 0.35, -0.2, 0, hips, 0.015); sd.rotation.z = s * 0.22; M(BX(0.27, 0.025, 0.045), glow, s * 0.17, -0.38, 0.26, hips, 0).rotation.x = 0.18; }
  R.legs = [-1, 1].map(s => { const th = G(hips, s * 0.2, -0.1, 0);
    M(BX(0.24, 0.6, 0.28), mid, 0, -0.3, 0, th, 0.025); const tp = M(BX(0.27, 0.46, 0.05), iron, 0, -0.28, 0.16, th, 0.015); rivets(tp, [[-0.1, 0.2, 0.03], [0.1, 0.2, 0.03], [-0.1, -0.2, 0.03], [0.1, -0.2, 0.03]]); line(tp, 0.2, 0.012, 0, 0.02, 0.028);
    M(CY(0.05, 0.05, 0.36, 10), iron, 0, -0.36, -0.17, th, 0.01);   // piston sleeve (thigh back)
    const kn = G(th, 0, -0.62, 0); M(SP(0.14), light, 0, 0, 0, kn, 0.015); const kg = M(BX(0.24, 0.22, 0.07), iron, 0, 0.02, 0.15, kn, 0.015); kg.rotation.x = -0.2; M(SP(0.03, 8, 6), glow, 0, 0.02, 0.19, kn, 0);
    const rod = M(CY(0.028, 0.028, 0.5, 8), chrome, 0, -0.08, -0.16, kn, 0.008);   // piston rod (into the shin)
    M(CY(0.15, 0.11, 0.6, 6), iron, 0, -0.34, 0, kn, 0.025); const gr = M(BX(0.25, 0.52, 0.05), mid, 0, -0.3, 0.14, kn, 0.015); gr.rotation.x = 0.05; rivets(gr, [[0, 0.22, 0.03], [0, -0.22, 0.03]]); dent(gr, 0.06, -0.05, 0.03, 0.035);
    M(CY(0.05, 0.05, 0.22, 10), iron, 0, -0.22, -0.15, kn, 0.01);
    const ft = G(kn, 0, -0.66, 0); M(SP(0.1, 10, 8), light, 0, 0, 0, ft, 0.01); M(BX(0.32, 0.14, 0.52), iron, 0, -0.04, 0.08, ft, 0.02); M(BX(0.34, 0.11, 0.16), mid, 0, -0.045, 0.33, ft, 0.012); M(BX(0.02, 0.03, 0.4), glow, s * 0.165, -0.02, 0.08, ft, 0);
    return { th, kn, ft, rod, s }; });
  // ---- waist + chest ----
  M(CY(0.22, 0.26, 0.28, 16), light, 0, 0.3, 0, hips, 0.015); for (const y of [0.22, 0.32, 0.42]) M(new THREE.TorusGeometry(0.235, 0.014, 6, 20), iron, 0, y, 0, hips, 0).rotation.x = Math.PI / 2;
  const ch = R.chest = G(hips, 0, 0.58, 0);
  M(BX(0.88, 0.62, 0.5), iron, 0, 0.16, 0, ch, 0.035); M(BX(0.64, 0.3, 0.42), mid, 0, -0.2, 0, ch, 0.025);
  for (const s of [-1, 1]) { const fp = M(BX(0.44, 0.52, 0.07), mid, s * 0.2, 0.16, 0.27, ch, 0.015); fp.rotation.y = -s * 0.32; rivets(fp, [[-0.17, 0.21, 0.04], [0.17, 0.21, 0.04], [-0.17, -0.21, 0.04], [0.17, -0.21, 0.04]]); line(fp, 0.3, 0.012, 0, -0.06, 0.038); }
  for (const s of [-1, 1]) { const tr = M(BX(0.025, 0.5, 0.02), glow, s * 0.42, 0.16, 0.25, ch, 0); tr.rotation.y = -s * 0.32; }   // orange seam lines down the chest edges
  dent(ch, 0.27, 0.32, 0.33, 0.05, -0.3); dent(ch, -0.3, 0.02, 0.33, 0.04, 0.3); dent(ch, 0.12, -0.26, 0.22, 0.035);
  R.core = M(CY(0.12, 0.12, 0.08, 22), coreM, 0, 0.14, 0.33, ch, 0.008, 0.12); R.core.rotation.x = Math.PI / 2;
  M(new THREE.TorusGeometry(0.16, 0.035, 8, 24), light, 0, 0.14, 0.34, ch, 0.008); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; M(BX(0.03, 0.06, 0.03), iron, Math.cos(a) * 0.2, 0.14 + Math.sin(a) * 0.2, 0.33, ch, 0).rotation.z = a; }
  for (const y of [-0.12, -0.24]) M(BX(0.5, 0.02, 0.01), glow, 0, y, 0.215, ch, 0);   // vent slots under the core
  M(CY(0.2, 0.24, 0.14, 14), light, 0, 0.5, 0, ch, 0.012);
  // ---- head: crested helmet + visor ----
  const hd = R.head = G(ch, 0, 0.62, 0.02);
  M(BX(0.34, 0.36, 0.36), iron, 0, 0.12, 0, hd, 0.025); const fc = M(BX(0.3, 0.24, 0.07), mid, 0, 0.07, 0.19, hd, 0.012); fc.rotation.x = -0.12;
  M(BX(0.38, 0.06, 0.1), iron, 0, 0.23, 0.17, hd, 0.012); for (const s of [-1, 1]) { const ck = M(BX(0.05, 0.24, 0.24), mid, s * 0.18, 0.04, 0.07, hd, 0.01); ck.rotation.y = s * 0.2; }
  const vc = document.createElement('canvas'); vc.width = 128; vc.height = 40; const vg = vc.getContext('2d'), vt = new THREE.CanvasTexture(vc); vt.colorSpace = THREE.SRGBColorSpace;
  const visor = M(new THREE.PlaneGeometry(0.27, 0.085), new THREE.MeshBasicMaterial({ map: vt, toneMapped: false }), 0, 0.13, 0.232, hd, 0); visor.rotation.x = -0.12;
  let vNow = ''; const face = e => { if (e === vNow) return; vNow = e; vg.fillStyle = '#0b0a09'; vg.fillRect(0, 0, 128, 40); vg.save(); vg.shadowColor = ORANGE; vg.shadowBlur = 8; vg.fillStyle = '#ffb066'; vg.strokeStyle = '#ffb066'; vg.lineWidth = 6; vg.lineCap = 'round';
    if (e === 'stunned') { for (const cx of [36, 92]) { vg.beginPath(); for (let k = 0; k < 40; k++) { const a = k * 0.45, r = k * 0.38; vg.lineTo(cx + Math.cos(a) * r, 20 + Math.sin(a) * r); } vg.lineWidth = 3; vg.stroke(); } }
    else if (e === 'hurt') { for (const [x0, d] of [[20, 1], [108, -1]]) { vg.beginPath(); vg.moveTo(x0, 8); vg.lineTo(x0 + d * 24, 20); vg.lineTo(x0, 32); vg.stroke(); } }
    else if (e === 'taunt') { for (const [x0, x1] of [[14, 54], [74, 114]]) { vg.beginPath(); vg.moveTo(x0, 24); vg.quadraticCurveTo((x0 + x1) / 2, 10, x1, 24); vg.stroke(); } }
    else { for (const [x0, x1, y0, y1] of [[12, 54, 10, 24], [116, 74, 10, 24]]) { vg.beginPath(); vg.moveTo(x0, y0); vg.lineTo(x1, y1); vg.lineTo(x1, y1 + 6); vg.lineTo(x0, y0 + 10); vg.closePath(); vg.fill(); } }
    vg.restore(); vt.needsUpdate = true; };
  face('angry');
  for (const [h, z, l] of [[0.22, -0.02, 0.5], [0.15, -0.06, 0.34], [0.09, -0.1, 0.2]]) M(BX(0.045, h, l), iron, 0, 0.3 + h / 2, z, hd, 0.01);   // stacked crest fins
  M(BX(0.05, 0.03, 0.5), glow, 0, 0.53, -0.02, hd, 0);
  // ---- back: cape plates + exhaust stacks ----
  R.cape = [-1, 0, 1].map(i => { const c = G(ch, i * 0.27, 0.4, -0.27); c.rotation.set(0.1, 0, -i * 0.07); const up = M(BX(0.26, 0.72, 0.04), iron, 0, -0.36, 0, c, 0.012); rivets(up, [[0, 0.3, -0.025], [0, -0.3, -0.025]]);
    const lo = G(c, 0, -0.72, 0); M(BX(0.24, 0.72, 0.04), mid, 0, -0.36, 0, lo, 0.012); M(BX(0.24, 0.04, 0.045), glow, 0, -0.7, 0, lo, 0); if (i === 1) dent(lo, 0.04, -0.3, -0.025, 0.04); return { c, lo, i }; });
  R.stacks = [-1, 1].map(s => { const st = G(ch, s * 0.3, 0.5, -0.3); M(CY(0.07, 0.085, 0.55, 12), iron, 0, 0, 0, st, 0.012, 0.085); M(new THREE.TorusGeometry(0.075, 0.015, 6, 14), light, 0, 0.1, 0, st, 0).rotation.x = Math.PI / 2; const tip = M(CY(0.06, 0.06, 0.03, 12), glow, 0, 0.27, 0, st, 0); return { st, tip }; });
  // ---- shoulders + arms ----
  R.arms = [-1, 1].map(s => { const sh = G(ch, s * 0.56, 0.3, 0);
    const pa = M(new THREE.SphereGeometry(0.27, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), iron, s * 0.04, 0.02, 0, sh, 0.02, 0.27); pa.scale.set(1.15, 0.8, 1.1);
    const hb = M(new THREE.CylinderGeometry(0.31, 0.31, 0.08, 24, 1, true), haz, s * 0.04, 0.0, 0, sh, 0); hb.scale.set(1.0, 1, 0.96);
    const p2 = M(new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mid, s * 0.07, -0.1, 0, sh, 0.016, 0.25); p2.scale.set(1.1, 0.5, 1.05);
    rivets(sh, [[s * 0.04, 0.21, 0.12], [s * 0.04, 0.21, -0.12], [s * 0.2, 0.12, 0]]); dent(pa, 0.1, 0.16, 0.15, 0.04, 0.4);
    const up = G(sh, s * 0.08, -0.08, 0); M(BX(0.2, 0.5, 0.22), mid, 0, -0.27, 0, up, 0.02); M(CY(0.045, 0.045, 0.32, 10), iron, 0, -0.32, -0.13, up, 0.008);
    const el = G(up, 0, -0.56, 0); M(SP(0.12), light, 0, 0, 0, el, 0.012); const erod = M(CY(0.025, 0.025, 0.38, 8), chrome, 0, 0.1, -0.13, el, 0.006);
    M(BX(0.29, 0.52, 0.31), iron, 0, -0.28, 0, el, 0.025); const fp = M(BX(0.31, 0.4, 0.05), mid, 0, -0.28, 0.17, el, 0.012); rivets(fp, [[-0.11, 0.16, 0.03], [0.11, 0.16, 0.03], [-0.11, -0.16, 0.03], [0.11, -0.16, 0.03]]); M(BX(0.02, 0.3, 0.02), glow, 0, -0.28, 0.2, el, 0);
    const wr = G(el, 0, -0.56, 0); const pist = [-1, 1].map(k => M(CY(0.03, 0.03, 0.2, 8), chrome, k * 0.08, 0.0, 0, wr, 0.006));
    const fi = G(wr, 0, -0.06, 0); M(BX(0.36, 0.32, 0.36), iron, 0, -0.14, 0, fi, 0.025); M(BX(0.38, 0.06, 0.38), light, 0, 0.02, 0, fi, 0.01);
    for (let k = 0; k < 4; k++) M(BX(0.075, 0.08, 0.11), light, -0.12 + k * 0.08, -0.26, 0.14, fi, 0.008); M(BX(0.1, 0.12, 0.1), mid, s * 0.17, -0.1, 0.1, fi, 0.008);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); fl.position.y = 0.3; fl.visible = false; fi.add(fl);
    return { sh, up, el, wr, fi, fl, pist, s }; });
  // ---- FX: sparks, smoke, stomp ring ----
  const smT = CT(64, 64, (c, w) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); });
  const SPK = [...Array(28)].map(() => { const m = new THREE.Mesh(BX(0.03, 0.03, 0.09), new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; g.add(m); return { m, v: new THREE.Vector3(), t: 0 }; });
  const SMK = [...Array(22)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smT, color: 0x6b6560, transparent: true, depthWrite: false })); s.visible = false; g.add(s); return { s, v: new THREE.Vector3(), t: 0, life: 1 }; });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 40), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
  const wp = new THREE.Vector3(), at = o => { o.updateWorldMatrix(true, false); o.getWorldPosition(wp); return g.worldToLocal(wp.clone()); };
  let si = 0, mi = 0; const spark = (p, n = 6, sp = 3) => { for (let k = 0; k < n; k++) { const q = SPK[si++ % SPK.length]; q.m.position.copy(p); q.v.set((Math.random() - 0.5) * sp, Math.random() * sp * 0.8 + 0.5, (Math.random() - 0.5) * sp); q.t = 0.35 + Math.random() * 0.25; q.m.visible = true; } };
  const smoke = (p, col = 0x6b6560, up = 0.8, size = 0.3) => { const q = SMK[mi++ % SMK.length]; q.s.position.copy(p); q.s.material.color.setHex(col); q.v.set((Math.random() - 0.5) * 0.2, up, (Math.random() - 0.5) * 0.2 - 0.1); q.t = q.life = 1.4; q.size = size; q.s.visible = true; };
  let puffT = 0, fxT = 0, lastStomp = -1;
  // ---- poses ----
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x), lerp = (a, b, k) => a + (b - a) * k;
  g.userData.R = R; g.userData.pose = 'stance'; g.userData.pt = 0;
  g.userData.idle = (t, dt = 0.016) => { const U = g.userData, pose = U.pose || 'stance'; U.pt = (U.pt || 0) + dt; const pt = U.pt;
    // base: fight stance
    let hy = 1.47 - 0.035 * Math.abs(Math.sin(t * 4)), chx = 0.12, chy = 0, chz = 0, hx = -0.05, hz = 0, hy2 = 0, wide = 0.14, kneeB = 0.42, thx = -0.24, ftx = -0.18;
    const A = R.arms.map(a => ({ ux: -0.85, uz: a.s * 0.22, ex: -1.55, fx: 0, fo: 0, fl: false })); let L = R.legs.map(() => ({ tx: thx, tz: 0, k: kneeB, f: ftx }));
    let expr = 'angry', capeK = 1, shake = 0;
    if (pose === 'stance') { A[0].ux += Math.sin(t * 4) * 0.06; A[1].ux -= Math.sin(t * 4) * 0.06; A[1].ex -= 0.15; }
    if (pose === 'taunt') { hy = 1.49; chx = -0.12; hz = 0.22; hx = -0.15; expr = 'taunt'; A[1].ux = -1.35; A[1].uz = 0.1; A[1].ex = -0.5 - (0.5 + 0.5 * Math.sin(pt * 7)) * 0.9; A[0].ux = 0.1; A[0].uz = -0.75; A[0].ex = -1.9; kneeB = 0.15; L = L.map(l => ({ ...l, tx: -0.08, k: 0.15, f: -0.06 })); }
    if (pose === 'stomp') { const c = pt % 1.8, up = ease(c / 0.7) * (1 - ease((c - 0.72) / 0.12)); L[1] = { tx: -1.25 * up - 0.1, tz: 0.08, k: 1.5 * up + 0.2, f: -0.4 * up }; L[0].k = 0.5; chx = 0.05 - 0.15 * up + (c > 0.84 && c < 1.1 ? 0.25 : 0); A.forEach(a => { a.ux = -1.0 - 0.9 * up; a.ex = -1.2 + 0.5 * up; a.uz = a.s * (0.35 + 0.3 * up); });
      const cyc = Math.floor(pt / 1.8); if (c > 0.84 && lastStomp !== cyc) { lastStomp = cyc; ring.material.opacity = 0.9; ring.scale.setScalar(0.3); const fp = at(R.legs[1].ft); fp.y = 0.05; spark(fp, 10, 4); for (let k = 0; k < 4; k++) smoke(fp.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8)), 0x8a8078, 0.4, 0.45); }
      if (c > 0.84 && c < 1.0) shake = 0.04; }
    if (pose === 'rocket') { const c = pt % 2.2, wind = ease(c / 0.4) * (1 - ease((c - 0.4) / 0.1)), out = ease((c - 0.45) / 0.35) * (1 - ease((c - 1.35) / 0.45)); const a = A[1];
      a.ux = lerp(-0.85, 0.5, wind); a.ex = lerp(-1.55, -1.9, wind); if (c > 0.4) { a.ux = -1.57; a.ex = -0.05; a.uz = 0.02; } a.fo = out * 1.6; a.fl = out > 0.05 && c < 1.35; chy = -0.35 * wind + 0.25 * (c > 0.4 && c < 1.4 ? 1 : 0); expr = 'angry'; if (a.fl && Math.random() < 0.5) smoke(at(R.arms[1].fi), 0x7a6e66, 0.3, 0.25); }
    if (pose === 'spin') { const sp = ease(pt / 0.6); chy = pt * 11 * sp; A.forEach(a => { a.ux = -0.2; a.uz = a.s * 1.45; a.ex = -0.15; }); kneeB = 0.6; L = L.map(l => ({ ...l, k: 0.6, tz: l.tz })); hy = 1.42; capeK = 3; if ((fxT += dt) > 0.12) { fxT = 0; spark(at(R.arms[Math.random() < 0.5 ? 0 : 1].fi), 3, 3); } }
    if (pose === 'stunned') { expr = 'stunned'; chx = 0.4; hx = 0.45; hz = Math.sin(t * 2.2) * 0.3; chz = Math.sin(t * 2.2 + 1) * 0.08; hy = 1.38; A.forEach(a => { a.ux = 0.1; a.uz = a.s * 0.12; a.ex = -0.25; }); L = L.map(l => ({ ...l, tx: -0.4, k: 0.75, f: -0.3 })); capeK = 0.4;
      if ((fxT += dt) > 0.14) { fxT = 0; const hp = at(R.head); hp.y += 0.25; spark(hp, 4, 2.4); if (Math.random() < 0.6) smoke(hp, 0x5a5550, 0.6, 0.3); } }
    if (pose === 'hurt') { const c = pt % 1.4, k = Math.exp(-c * 5); expr = c < 0.6 ? 'hurt' : 'angry'; chx = -0.4 * k + 0.1; hx = -0.4 * k; hy = 1.47 - 0.08 * k; A.forEach(a => { a.ux = -0.5 + 0.6 * k; a.uz = a.s * (0.3 + 0.5 * k); a.ex = -1.0 + 0.6 * k; }); shake = 0.03 * k;
      if (c < dt * 1.5 || (U.lastHurt ?? -1) !== Math.floor(pt / 1.4)) { U.lastHurt = Math.floor(pt / 1.4); const cp = at(R.core); spark(cp, 14, 4.5); for (let q = 0; q < 3; q++) smoke(cp, 0x4a4540, 0.7, 0.35); } }
    // apply
    R.hips.position.set((Math.random() - 0.5) * shake, hy, (Math.random() - 0.5) * shake);
    R.chest.rotation.set(chx, chy, chz); R.head.rotation.set(hx, hy2, hz);
    R.legs.forEach((l, i) => { const q = L[i]; l.th.rotation.set(q.tx, 0, l.s * wide + (q.tz || 0) * l.s); l.kn.rotation.x = q.k; l.ft.rotation.x = q.f - (q.tx + q.k) * 0.4; l.rod.scale.y = 1 + q.k * 0.25; });
    R.arms.forEach((a, i) => { const q = A[i]; a.up.rotation.set(q.ux, 0, q.uz); a.el.rotation.x = q.ex; a.fi.position.y = -0.06 - q.fo; a.pist.forEach(p => { p.scale.y = 1 + q.fo * 5; p.position.y = -q.fo / 2; }); a.fl.visible = q.fl; if (q.fl) a.fl.scale.set(1, 0.8 + Math.random() * 0.5, 1); });
    R.cape.forEach(c => { c.c.rotation.x = 0.1 + Math.sin(t * 1.6 + c.i) * 0.04 * capeK + (pose === 'spin' ? 0.5 : 0); c.lo.rotation.x = 0.06 + Math.sin(t * 1.6 + c.i + 0.8) * 0.06 * capeK + (pose === 'spin' ? 0.3 : 0); });
    face(expr); coreM.emissiveIntensity = (pose === 'stunned' ? 0.6 + Math.random() * 0.8 : 1.4 + Math.sin(t * 4) * 0.35);
    glow.emissiveIntensity = pose === 'stunned' ? 0.5 + 0.5 * Math.abs(Math.sin(t * 9)) : 1.6;
    if ((puffT += dt) > 0.35) { puffT = 0; for (const s of R.stacks) { const p = at(s.tip); smoke(p, 0x5a5550, 0.9, 0.2); } }
    // fx update
    for (const q of SPK) { if (!q.m.visible) continue; q.t -= dt; if (q.t <= 0) { q.m.visible = false; continue; } q.v.y -= 9 * dt; q.m.position.addScaledVector(q.v, dt); q.m.lookAt(q.m.position.clone().add(q.v)); q.m.material.opacity = Math.min(1, q.t * 4); }
    for (const q of SMK) { if (!q.s.visible) continue; q.t -= dt; if (q.t <= 0) { q.s.visible = false; continue; } q.s.position.addScaledVector(q.v, dt); const k = 1 - q.t / q.life; q.s.scale.setScalar((q.size || 0.3) * (1 + k * 2.5)); q.s.material.opacity = 0.55 * (1 - k); }
    if (ring.material.opacity > 0) { ring.scale.multiplyScalar(1 + dt * 4.5); ring.material.opacity = Math.max(0, ring.material.opacity - dt * 1.6); }
  };
  return g;
}
// MAKER PRIME v2 (Ben, s149): FACTORY TITAN in rusty orange + teal glow, hazard yellow, red laser eye. Huge upper body, 2 big BUILD ARMS
// (left CLAW, right DRILL) + 2 small TOOL ARMS (welder, grabber), thick legs, HOPPER on the back that drops mini-bots, glowing core.
// Poses (g.userData.pose): stance · taunt · laser · combo · build · slam · stunned · hurt. Built at real size (~3.4 m tall).
export function makerPrime({ THREE, M, toon, grad }) {
  const RUST = '#a8521f', RUSTD = '#5e2c12', RUSTL = '#dd8a48', IRON = '#2a2522', STEEL = '#a9a39c', DENT = '#1a120d', TEAL = '#2ee6d0', RED = '#ff2a1a', YEL = '#f5b301';
  const rust = toon(RUST), rustD = toon(RUSTD), rustL = toon(RUSTL), iron = toon(IRON), steel = toon(STEEL), dentM = toon(DENT), yel = toon(YEL);
  const GL = c => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, emissive: new THREE.Color(c), emissiveIntensity: 1.6 });
  const teal = GL(TEAL), coreM = GL(TEAL), eyeM = GL(RED);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const hazT = CT(128, 32, (g, w, h) => { g.fillStyle = '#141312'; g.fillRect(0, 0, w, h); g.fillStyle = YEL; for (let x = -h; x < w + h; x += 24) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 12, h); g.lineTo(x + 12 + h, 0); g.lineTo(x + h, 0); g.fill(); } }); hazT.wrapS = THREE.RepeatWrapping; hazT.repeat.set(4, 1);
  const haz = new THREE.MeshToonMaterial({ map: hazT, gradientMap: grad, side: THREE.DoubleSide });
  const BX = (w, h, d) => { const r = Math.min(0.08, Math.min(w, h, d) * 0.3), g0 = new THREE.BoxGeometry(w, h, d, 3, 3, 3), p = g0.attributes.position, hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), q = new THREE.Vector3();
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); const dd = v.sub(q); if (dd.lengthSq() > 1e-9) { dd.normalize().multiplyScalar(r); p.setXYZ(k, q.x + dd.x, q.y + dd.y, q.z + dd.z); } } g0.computeVertexNormals(); return g0; };
  const CY = (a, b, h, n = 16) => new THREE.CylinderGeometry(a, b, h, n), SP = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
  const G = (p, x = 0, y = 0, z = 0) => { const q = new THREE.Group(); q.position.set(x, y, z); p.add(q); return q; };
  const rivets = (p, pts) => pts.forEach(([x, y, z]) => M(SP(0.022, 6, 4), steel, x, y, z, p, 0));
  const spot = (p, x, y, z, r, ry = 0, m = rustD) => { const d = M(SP(r, 10, 6), m, x, y, z, p, 0); d.scale.set(1, 0.75, 0.15); d.rotation.y = ry; };   // rust patch / dent
  const g = new THREE.Group(), R = {};
  // ---- hips + thick legs ----
  const hips = R.hips = G(g, 0, 1.38, 0);
  M(BX(0.95, 0.38, 0.62), iron, 0, 0, 0, hips, 0.03); M(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 28, 1, true), haz, 0, 0.12, 0, hips, 0).scale.set(1, 1, 0.68);
  R.legs = [-1, 1].map(s => { const th = G(hips, s * 0.36, -0.12, 0);
    M(BX(0.4, 0.56, 0.44), rust, 0, -0.28, 0, th, 0.03); spot(th, s * 0.08, -0.2, 0.225, 0.07); rivets(th, [[-0.14, -0.06, 0.225], [0.14, -0.06, 0.225]]);
    const kn = G(th, 0, -0.58, 0); M(SP(0.21), steel, 0, 0, 0, kn, 0.015); M(BX(0.3, 0.24, 0.1), rustL, 0, 0.02, 0.2, kn, 0.015).rotation.x = -0.2; M(SP(0.04, 8, 6), teal, 0, 0.03, 0.26, kn, 0);
    const rod = M(CY(0.035, 0.035, 0.5, 8), steel, 0, -0.1, -0.22, kn, 0.008);
    M(CY(0.22, 0.3, 0.62, 10), rust, 0, -0.34, 0, kn, 0.03); M(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 20, 1, true), haz, 0, -0.6, 0, kn, 0); spot(kn, s * -0.1, -0.3, 0.24, 0.06, 0.3);
    const ft = G(kn, 0, -0.68, 0); M(BX(0.56, 0.2, 0.7), iron, 0, -0.04, 0.1, ft, 0.025); for (const x of [-0.18, 0, 0.18]) { const c = M(new THREE.ConeGeometry(0.06, 0.18, 8), steel, x, -0.08, 0.5, ft, 0.008); c.rotation.x = Math.PI / 2; }
    return { th, kn, ft, rod, s }; });
  // ---- spine + huge torso ----
  for (const y of [0.24, 0.34, 0.44]) M(CY(0.3, 0.32, 0.08, 16), y === 0.34 ? steel : iron, 0, y, 0, hips, 0.01);
  const ch = R.chest = G(hips, 0, 0.92, 0);
  M(BX(1.5, 0.95, 0.92), rust, 0, 0, 0, ch, 0.04); M(BX(1.1, 0.4, 0.78), rustD, 0, -0.55, 0, ch, 0.03);
  M(BX(1.3, 0.14, 0.95), haz, 0, -0.38, 0, ch, 0); const fp = M(BX(0.9, 0.62, 0.08), rustL, 0, 0.06, 0.47, ch, 0.02); rivets(fp, [[-0.38, 0.25, 0.045], [0.38, 0.25, 0.045], [-0.38, -0.25, 0.045], [0.38, -0.25, 0.045]]);
  spot(ch, 0.55, 0.25, 0.465, 0.11, -0.1); spot(ch, -0.6, -0.15, 0.465, 0.09, 0.1); spot(ch, 0.3, -0.3, 0.52, 0.05, 0, dentM); spot(fp, -0.25, 0.2, 0.045, 0.05, 0, dentM);
  // CORE + HEART (s149f): the SUMO-crest heart (same parametric curve: blue #38bdf8 fill, thick white outline, white highlight) beating
  // on a dark navy core disc with a teal ring; everything stays inside the circle (no light spill)
  const coreT = CT(256, 256, (c) => { const g2 = c.createRadialGradient(128, 128, 20, 128, 128, 128); g2.addColorStop(0, '#13304a'); g2.addColorStop(0.8, '#0b1430'); g2.addColorStop(1, '#050a18'); c.fillStyle = g2; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill(); c.strokeStyle = TEAL; c.lineWidth = 12; c.beginPath(); c.arc(128, 128, 116, 0, 7); c.stroke(); c.strokeStyle = 'rgba(46,230,208,0.35)'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 102, 0, 7); c.stroke(); });
  R.core = M(new THREE.CircleGeometry(0.19, 40), new THREE.MeshBasicMaterial({ map: coreT, toneMapped: false }), 0, 0.04, 0.532, ch, 0); R.coreRing = R.core.material;
  M(CY(0.19, 0.19, 0.06, 32), iron, 0, 0.04, 0.5, ch, 0, 0.19).rotation.x = Math.PI / 2;
  const PH = []; for (let k = 0; k <= 96; k++) { const tt = k / 96 * Math.PI * 2, f = 13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt); PH.push([128 + 4.625 * 16 * Math.sin(tt) ** 3, 128.5 - 4.625 * (f + 2.75)]); }
  const hPath = c => { c.beginPath(); PH.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  const fillT = CT(256, 256, (c) => { hPath(c); c.fillStyle = '#ffffff'; c.fill(); }), lineT = CT(256, 256, (c) => { c.lineJoin = 'round'; hPath(c); c.lineWidth = 14; c.strokeStyle = '#ffffff'; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(93, 83, 14, 9, -0.6, 0, 7); c.fill(); });
  R.heart = G(ch, 0, 0.04, 0.534); R.heartFill = new THREE.MeshBasicMaterial({ map: fillT, color: 0x38bdf8, transparent: true, toneMapped: false, depthWrite: false });
  { const hf = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.27), R.heartFill), hl = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.27), new THREE.MeshBasicMaterial({ map: lineT, transparent: true, toneMapped: false, depthWrite: false })); hl.position.z = 0.002; R.heart.add(hf, hl); }
  R.coreGlass = M(new THREE.SphereGeometry(0.19, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, shininess: 160, specular: 0xffffff, depthWrite: false }), 0, 0.04, 0.53, ch, 0); R.coreGlass.rotation.x = Math.PI / 2; R.coreGlass.scale.set(1, 0.35, 1);
  for (const s of [-1, 1]) { const tb = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.12, 0.2, 0.52), new THREE.Vector3(s * 0.2, 0.26, 0.5), new THREE.Vector3(s * 0.3, 0.2, 0.48)]); M(new THREE.TubeGeometry(tb, 10, 0.014, 6, false), steel, 0, 0, 0, ch, 0); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.26; M(BX(0.05, 0.1, 0.04), yel, Math.cos(a) * 0.3, 0.04 + Math.sin(a) * 0.3, 0.52, ch, 0).rotation.z = a; }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) M(BX(0.2, 0.025, 0.02), teal, s * 0.58, 0.3 - k * 0.08, 0.465, ch, 0);   // teal vents
  // ---- head: low dome sunk between the shoulders + red LASER EYE ----
  const hd = R.head = G(ch, 0, 0.64, 0.3); hd.scale.setScalar(1.35);   // bigger head so the face reads
  const dome = M(new THREE.SphereGeometry(0.34, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), iron, 0, 0, 0, hd, 0.02, 0.34); dome.scale.set(1.1, 0.8, 1);
  M(new THREE.TorusGeometry(0.35, 0.04, 8, 28), rustL, 0, 0.0, 0, hd, 0).rotation.x = Math.PI / 2;
  const eyeP = R.eye = G(hd, 0, 0.19, 0.25);   // s149d: raised clear of the brim
  // EYE (s149d): a camera-lens eye. Iron housing + 6 hex bolts, a yellow focus ring that turns, a dark glass dome, an iris disc with
  // shutter blades + a red glowing pupil that dilates, a hot white core, a glint, and a soft red halo sprite
  M(CY(0.17, 0.17, 0.12, 24), iron, 0, 0, 0, eyeP, 0.012).rotation.x = Math.PI / 2;
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; M(CY(0.018, 0.018, 0.02, 6), steel, Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.065, eyeP, 0).rotation.x = Math.PI / 2; }
  R.focus = G(eyeP, 0, 0, 0.07); M(new THREE.TorusGeometry(0.13, 0.022, 8, 28), yel, 0, 0, 0, R.focus, 0.004); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; M(BX(0.02, 0.012, 0.03), iron, Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0.012, R.focus, 0).rotation.z = a; }
  // HUMAN EYE inside the lens (s149e, cyclops): a white eyeball with pink veins that turns in its socket, a red-amber iris with fibres,
  // a black pupil that dilates, a wet glint; the robot lens parts stay round it
  const scleraT = CT(256, 256, (c) => { const g2 = c.createRadialGradient(128, 128, 30, 128, 128, 128); g2.addColorStop(0, '#fffaf4'); g2.addColorStop(0.75, '#f3e6dc'); g2.addColorStop(1, '#d9b8a8'); c.fillStyle = g2; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(200,40,40,0.55)'; c.lineCap = 'round'; for (let k = 0; k < 16; k++) { let a = k / 16 * Math.PI * 2 + Math.random() * 0.3, r = 128, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 6; s++) { r -= 10 + Math.random() * 6; a += (Math.random() - 0.5) * 0.25; x = 128 + Math.cos(a) * r; y = 128 + Math.sin(a) * r; c.lineTo(x, y); c.lineWidth *= 0.8; } c.stroke(); } });
  const irisT = CT(256, 256, (c) => { const g2 = c.createRadialGradient(128, 128, 20, 128, 128, 128); g2.addColorStop(0, '#ffb340'); g2.addColorStop(0.45, '#e2401c'); g2.addColorStop(0.9, '#7a1208'); g2.addColorStop(1, '#2a0503'); c.fillStyle = g2; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill();
    for (let k = 0; k < 140; k++) { const a = Math.random() * Math.PI * 2, r0 = 34 + Math.random() * 20, r1 = 90 + Math.random() * 36; c.strokeStyle = Math.random() < 0.5 ? 'rgba(255,210,120,0.35)' : 'rgba(90,10,5,0.35)'; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); c.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0); c.lineTo(128 + Math.cos(a + 0.08) * r1, 128 + Math.sin(a + 0.08) * r1); c.stroke(); }
    c.strokeStyle = 'rgba(20,2,1,0.9)'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 122, 0, 7); c.stroke(); });
  R.ball = G(eyeP, 0, 0, 0.0);
  M(new THREE.SphereGeometry(0.118, 28, 20), new THREE.MeshPhongMaterial({ map: scleraT, shininess: 60, specular: 0x666666 }), 0, 0, 0, R.ball, 0);
  R.iris = M(new THREE.CircleGeometry(0.066, 36), new THREE.MeshBasicMaterial({ map: irisT, toneMapped: false }), 0, 0, 0.117, R.ball, 0);
  R.eyeBall = M(new THREE.CircleGeometry(0.03, 28), new THREE.MeshBasicMaterial({ color: 0x050202 }), 0, 0, 0.1185, R.ball, 0);
  R.eyeHot = M(new THREE.CircleGeometry(0.012, 14), new THREE.MeshBasicMaterial({ color: 0xff4020, transparent: true, opacity: 0, toneMapped: false }), 0, 0, 0.119, R.ball, 0);
  M(new THREE.CircleGeometry(0.014, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }), -0.028, 0.03, 0.124, eyeP, 0); M(new THREE.CircleGeometry(0.006, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 0.022, -0.018, 0.124, eyeP, 0);
  M(new THREE.SphereGeometry(0.122, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, shininess: 160, specular: 0xffffff }), 0, 0, 0.0, eyeP, 0).rotation.x = Math.PI / 2;
  { const hT = CT(64, 64, (c) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,60,30,0.9)'); r.addColorStop(1, 'rgba(255,60,30,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); }); R.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: hT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); R.halo.position.z = 0.1; R.halo.scale.setScalar(0.42); eyeP.add(R.halo); }
  for (const s of [-1, 1]) M(BX(0.05, 0.22, 0.05), steel, s * 0.22, 0.2, 0.05, hd, 0.008).rotation.z = s * 0.4;   // antenna horns
  // ---- FACE (s149c): slit pupil that looks around, sliding eyelid shutters, 2 tilting brow plates, a jaw with an LED mouth ----

  R.lidT = M(BX(0.32, 0.14, 0.05), rustD, 0, 0.2, 0.13, eyeP, 0.008); R.lidB = M(BX(0.32, 0.1, 0.05), rustD, 0, -0.18, 0.13, eyeP, 0.008);
  R.brows = [-1, 1].map(s => { const p = G(hd, s * 0.12, 0.4, 0.28); M(BX(0.2, 0.06, 0.09), rustL, s * 0.04, 0, 0, p, 0.008); M(BX(0.2, 0.015, 0.092), yel, s * 0.04, -0.025, 0, p, 0); return p; });
  const jw = R.jaw = G(hd, 0, -0.06, 0.12); M(BX(0.48, 0.24, 0.3), iron, 0, -0.1, 0.06, jw, 0.015); for (const s of [-1, 1]) M(SP(0.05, 8, 6), steel, s * 0.25, -0.04, 0.06, jw, 0.006);
  const mc = document.createElement('canvas'); mc.width = 128; mc.height = 48; const mg = mc.getContext('2d'), mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace;
  M(new THREE.PlaneGeometry(0.38, 0.14), new THREE.MeshBasicMaterial({ map: mt, toneMapped: false }), 0, -0.1, 0.212, jw, 0);
  let mNow = ''; const mouth = (e, t) => { const key = e === 'scan' || e === 'wavy' || e === 'hum' ? e + Math.floor(t * 10) : e; if (key === mNow) return; mNow = key; mg.fillStyle = '#0b0a09'; mg.fillRect(0, 0, 128, 48); mg.save(); mg.shadowColor = TEAL; mg.shadowBlur = 6; mg.strokeStyle = '#9ffcf0'; mg.fillStyle = '#9ffcf0'; mg.lineWidth = 5; mg.lineCap = 'round'; mg.lineJoin = 'round';
    if (e === 'smirk') { mg.beginPath(); mg.moveTo(18, 26); mg.lineTo(70, 26); mg.quadraticCurveTo(100, 24, 112, 12); mg.stroke(); }
    else if (e === 'smile') { mg.beginPath(); mg.moveTo(16, 16); mg.quadraticCurveTo(64, 44, 112, 16); mg.stroke(); }
    else if (e === 'o') { mg.beginPath(); mg.ellipse(64, 24, 14, 12, 0, 0, 7); mg.stroke(); }
    else if (e === 'hum') { mg.beginPath(); for (let x = 14; x <= 114; x += 3) mg.lineTo(x, 24 + Math.sin(x * 0.2 + t * 6) * 4); mg.stroke(); }
    else if (e === 'snarl') { mg.beginPath(); for (let k = 0; k <= 8; k++) mg.lineTo(10 + k * 13.5, k % 2 ? 16 : 32); mg.stroke(); }
    else if (e === 'grin') { mg.beginPath(); mg.moveTo(10, 14); mg.quadraticCurveTo(64, 50, 118, 14); mg.stroke(); mg.lineWidth = 3; for (let k = 1; k < 7; k++) { const x = 10 + k * 15.4, y = 14 + Math.sin(k / 7 * Math.PI) * 17; mg.beginPath(); mg.moveTo(x, y - 7); mg.lineTo(x, y + 2); mg.stroke(); } }
    else if (e === 'shout') { mg.lineWidth = 5; mg.strokeRect(30, 6, 68, 36); mg.lineWidth = 3; for (let k = 1; k < 4; k++) { mg.beginPath(); mg.moveTo(30 + k * 17, 6); mg.lineTo(30 + k * 17, 14); mg.stroke(); } }
    else if (e === 'grimace') { mg.lineWidth = 4; mg.strokeRect(14, 14, 100, 20); for (let k = 1; k < 7; k++) { mg.beginPath(); mg.moveTo(14 + k * 14.3, 14); mg.lineTo(14 + k * 14.3, 34); mg.stroke(); } }
    else if (e === 'wavy') { mg.beginPath(); for (let x = 10; x <= 118; x += 3) mg.lineTo(x, 24 + Math.sin(x * 0.12 + t * 8) * 9); mg.stroke(); }
    else { mg.lineWidth = 4; for (let k = 0; k < 9; k++) { const on = (Math.floor(t * 10) + k) % 9 < 3; mg.globalAlpha = on ? 1 : 0.25; mg.fillRect(10 + k * 12.5, 18, 8, 12); } mg.globalAlpha = 1; }
    mg.restore(); mt.needsUpdate = true; };
  mouth('snarl', 0);
  const beamG = new THREE.CylinderGeometry(0.035, 0.035, 1, 8); beamG.rotateX(Math.PI / 2); beamG.translate(0, 0, 0.5);
  const beam = new THREE.Mesh(beamG, new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); beam.visible = false; eyeP.add(beam);
  // ---- back: the HOPPER ----
  const hop = R.hop = G(ch, 0, 0.55, -0.55); { const hb = M(CY(0.55, 0.3, 0.8, 4), rust, 0, 0.1, 0, hop, 0.03); hb.rotation.y = Math.PI / 4; M(new THREE.CylinderGeometry(0.56, 0.56, 0.1, 4, 1, true), haz, 0, 0.42, 0, hop, 0).rotation.y = Math.PI / 4; M(BX(0.7, 0.06, 0.7), iron, 0, 0.5, 0, hop, 0.01);
    spot(hop, 0.2, 0.1, -0.35, 0.08); const chute = M(BX(0.3, 0.5, 0.3), iron, 0.62, -0.5, -0.1, ch, 0.015); chute.rotation.z = -0.3; { const cs = M(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 4, 1, true), haz, 0, -0.2, 0, chute, 0); cs.rotation.y = Math.PI / 4; } R.chuteMouth = G(ch, 0.75, -0.8, -0.1); M(SP(0.05, 8, 6), teal, 0, 0.1, 0.16, R.chuteMouth, 0); }
  // ---- POLISH (s149c): hydraulic hoses chest → shoulders, an amber beacon on the hopper, hazard stripes on the chute ----
  for (const s of [-1, 1]) for (const dz of [-0.18, 0.18]) { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.55, 0.38, dz), new THREE.Vector3(s * 0.78, 0.62, dz * 1.2), new THREE.Vector3(s * 0.95, 0.42, dz * 0.8)]); M(new THREE.TubeGeometry(c, 16, 0.035, 6, false), dz < 0 ? iron : rustD, 0, 0, 0, ch, 0.008); }
  R.beacon = M(SP(0.045, 10, 8), GL('#ffb020'), 0.22, 0.57, 0.22, hop, 0.004); M(CY(0.05, 0.06, 0.04, 10), iron, 0.22, 0.53, 0.22, hop, 0.004);
  R.beam2 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.04), new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); R.beam2.position.set(0.11, 0, 0); const bp = G(hop, 0.22, 0.57, 0.22); bp.add(R.beam2); R.beaconSpin = bp;
  // ---- 2 BIG BUILD ARMS: left CLAW, right DRILL ----
  R.arms = [-1, 1].map(s => { const sh = G(ch, s * 0.92, 0.2, 0);
    M(SP(0.32), steel, 0, 0, 0, sh, 0.02, 0.32); M(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 24, 1, true), haz, 0, 0, 0, sh, 0).rotation.z = Math.PI / 2;
    const pd = M(new THREE.SphereGeometry(0.36, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), rustL, s * 0.05, 0.1, 0, sh, 0.02, 0.36); pd.scale.set(1.15, 0.75, 1.1); rivets(sh, [[s * 0.05, 0.37, 0.15], [s * 0.05, 0.37, -0.15]]);
    const up = G(sh, s * 0.06, -0.12, 0); M(BX(0.34, 0.66, 0.36), rust, 0, -0.34, 0, up, 0.025); M(CY(0.05, 0.05, 0.36, 10), iron, 0, -0.38, -0.2, up, 0.008);
    const el = G(up, 0, -0.7, 0); M(SP(0.16), steel, 0, 0, 0, el, 0.012); const erod = M(CY(0.03, 0.03, 0.4, 8), steel, 0, 0.12, -0.2, el, 0.006);
    M(BX(0.46, 0.72, 0.5), rust, 0, -0.38, 0, el, 0.03); M(BX(0.48, 0.12, 0.52), haz, 0, -0.66, 0, el, 0); spot(el, s * 0.1, -0.3, 0.255, 0.07); M(BX(0.03, 0.4, 0.02), teal, 0, -0.34, 0.26, el, 0);
    const tl = G(el, 0, -0.8, 0); let fingers = [], bit = null;
    if (s < 0) { M(BX(0.36, 0.16, 0.36), iron, 0, 0, 0, tl, 0.015); fingers = [0, 2.1, 4.2].map(a => { const f = G(tl, Math.sin(a) * 0.12, -0.06, Math.cos(a) * 0.12); f.rotation.y = a; const f1 = M(BX(0.08, 0.32, 0.08), steel, 0, -0.14, 0, f, 0.008); const tip = M(new THREE.ConeGeometry(0.05, 0.16, 8), yel, 0, -0.36, 0.03, f, 0.006); tip.rotation.x = Math.PI + 0.4; return f; }); }
    else { M(CY(0.2, 0.22, 0.14, 18), iron, 0, 0, 0, tl, 0.015); M(new THREE.TorusGeometry(0.21, 0.03, 6, 20), teal, 0, -0.08, 0, tl, 0).rotation.x = Math.PI / 2; bit = G(tl, 0, -0.1, 0); const cone = M(new THREE.ConeGeometry(0.2, 0.62, 14), steel, 0, -0.31, 0, bit, 0.012); cone.rotation.x = Math.PI;
      for (let k = 0; k < 7; k++) { const r = 0.18 * (1 - k / 7), sp = M(new THREE.TorusGeometry(r, 0.022, 5, 14), yel, 0, -0.06 - k * 0.075, 0, bit, 0); sp.rotation.x = Math.PI / 2 + 0.3; sp.rotation.y = k * 0.9; } }
    return { sh, up, el, tl, fingers, bit, s }; });
  // ---- 2 small TOOL ARMS under the chest: left WELDER, right GRABBER ----
  const welT = CT(64, 64, (c) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(220,255,250,1)'); r.addColorStop(0.35, 'rgba(46,230,208,0.8)'); r.addColorStop(1, 'rgba(46,230,208,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); });
  R.tools = [-1, 1].map(s => { const b0 = G(ch, s * 0.6, -0.5, 0.35); M(SP(0.08, 10, 8), steel, 0, 0, 0, b0, 0.008); const a1 = G(b0, 0, 0, 0); M(BX(0.09, 0.09, 0.36), iron, 0, 0, 0.18, a1, 0.008); const a2 = G(a1, 0, 0, 0.36); M(SP(0.06, 8, 6), steel, 0, 0, 0, a2, 0.006); M(BX(0.07, 0.07, 0.3), rustL, 0, 0, 0.15, a2, 0.008);
    const hd2 = G(a2, 0, 0, 0.32); let flame = null, jaws = [];
    if (s < 0) { M(CY(0.04, 0.025, 0.12, 8), steel, 0, 0, 0.04, hd2, 0.006).rotation.x = Math.PI / 2; flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: welT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flame.position.z = 0.14; flame.scale.setScalar(0.18); hd2.add(flame); }
    else jaws = [-1, 1].map(k => { const j = G(hd2, k * 0.03, 0, 0); M(BX(0.025, 0.04, 0.14), yel, 0, 0, 0.07, j, 0.005); return j; });
    return { b0, a1, a2, hd2, flame, jaws, s }; });
  // ---- mini-bot (the hopper drops it) ----
  const mb = new THREE.Group(); { M(SP(0.17, 14, 10), rust, 0, 0.22, 0, mb, 0.012); M(new THREE.CylinderGeometry(0.175, 0.175, 0.05, 16, 1, true), haz, 0, 0.18, 0, mb, 0); M(SP(0.05, 8, 6), eyeM, 0, 0.26, 0.15, mb, 0); for (const s of [-1, 1]) M(BX(0.05, 0.14, 0.05), iron, s * 0.09, 0.06, 0, mb, 0.006); } mb.visible = false; g.add(mb);
  // ---- FX pools ----
  const smT = CT(64, 64, (c) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); });
  const SPK = [...Array(32)].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.1), new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; g.add(m); return { m, v: new THREE.Vector3(), t: 0 }; });
  const SMK = [...Array(22)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smT, color: 0x6b6560, transparent: true, depthWrite: false })); s.visible = false; g.add(s); return { s, v: new THREE.Vector3(), t: 0, life: 1 }; });
  const DEB = [...Array(8)].map((_, k) => { const m = M(BX(0.14 + (k % 3) * 0.05, 0.05, 0.1 + (k % 2) * 0.06), k % 3 ? rust : yel, 0, 0, 0, g, 0.006); m.visible = false; return { m, v: new THREE.Vector3(), w: new THREE.Vector3(), t: 0 }; });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 40), new THREE.MeshBasicMaterial({ color: 0x2ee6d0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
  const wp = new THREE.Vector3(), at = o => { o.updateWorldMatrix(true, false); o.getWorldPosition(wp); return g.worldToLocal(wp.clone()); };
  let si = 0, mi = 0; const spark = (p, n = 6, sp = 3, col = 0xffc04a) => { for (let k = 0; k < n; k++) { const q = SPK[si++ % SPK.length]; q.m.position.copy(p); q.m.material.color.setHex(col); q.v.set((Math.random() - 0.5) * sp, Math.random() * sp * 0.8 + 0.5, (Math.random() - 0.5) * sp); q.t = 0.35 + Math.random() * 0.25; q.m.visible = true; } };
  const smoke = (p, col = 0x6b6560, up = 0.8, size = 0.3) => { const q = SMK[mi++ % SMK.length]; q.s.position.copy(p); q.s.material.color.setHex(col); q.v.set((Math.random() - 0.5) * 0.2, up, (Math.random() - 0.5) * 0.2 - 0.1); q.t = q.life = 1.4; q.size = size; q.s.visible = true; };
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
  let puffT = 0, fxT = 0, lastSlam = -1, lastHurt = -1;
  g.userData.R = R; g.userData.pose = 'stance'; g.userData.pt = 0;
  g.userData.idle = (t, dt = 0.016) => { const U = g.userData, pose = U.pose || 'stance'; U.pt = (U.pt || 0) + dt; const pt = U.pt;
    let hy = 1.36 - 0.03 * Math.abs(Math.sin(t * 3)), chx = 0.08, chy = 0, chz = 0, hx = 0, hyw = Math.sin(t * 0.8) * 0.3, shake = 0, drill = 6, claw = 0.3 + 0.15 * Math.sin(t * 3), weld = 0.6, eyeK = 1, coreK = 1.4 + Math.sin(t * 4) * 0.35;
    const A = R.arms.map(a => ({ ux: -0.7, uz: a.s * 0.35, ex: -1.2 })), T = R.tools.map(q => ({ y: q.s * 0.3 + Math.sin(t * 5 + q.s) * 0.2, x: 0.3, e: -0.6 }));
    let L = R.legs.map(l => ({ tx: -0.2, k: 0.38, f: -0.18 })), beamOn = false, mbK = -1;
    const moodC = Math.floor(t / 3.2) % 4, ex0 = ['smirk', 'hum', 'snarl', 'smile'][moodC];
    let ex = ex0, brow = [0.15, 0.05, 0.35, -0.1][moodC], lid = 0.05, jaw = 0, lx = Math.sin(t * 0.9) * 0.5, ly = Math.sin(t * 1.3) * 0.25;
    if (pose === 'stance') { A[0].ux += Math.sin(t * 3) * 0.06; A[1].ux -= Math.sin(t * 3) * 0.06; }
    if (pose === 'taunt') { ex = 'grin'; brow = -0.25; lid = 0.3; jaw = 0.2 + 0.2 * Math.abs(Math.sin(pt * 6)); lx = 0; ly = 0; chx = -0.08; hx = 0.05; hyw = Math.sin(pt * 3) * 0.15; A.forEach(a => { a.ux = -2.1 - 0.15 * Math.sin(pt * 5); a.uz = a.s * 0.7; a.ex = -1.5; }); drill = 40; claw = 0.5 + 0.5 * Math.abs(Math.sin(pt * 8)); T.forEach(q => { q.y = q.s * 0.6 * Math.sin(pt * 8); }); if ((fxT += dt) > 0.08) { fxT = 0; spark(at(R.arms[1].bit), 3, 3.5); } }
    if (pose === 'laser') { ex = 'shout'; brow = 0.45; lid = 0; jaw = 0.5; lx = 0; ly = -0.3; beamOn = true; hyw = Math.sin(pt * 1.4) * 0.85; chy = hyw * 0.25; chx = 0.15; eyeK = 2; A.forEach(a => { a.ux = -0.5; a.uz = a.s * 0.55; a.ex = -0.9; }); }
    if (pose === 'combo') { ex = (pt % 2.2) < 0.9 ? 'snarl' : 'shout'; brow = 0.5; lid = 0.35; jaw = 0.15; lx = 0; ly = 0; const c = pt % 2.2; const sw = ease(c / 0.35) * (1 - ease((c - 0.7) / 0.3)), th = ease((c - 0.9) / 0.25) * (1 - ease((c - 1.6) / 0.4));
      A[0].ux = -0.7 - 0.9 * sw; A[0].uz = -0.35 + 1.4 * sw; A[0].ex = -1.2 + 0.9 * sw; claw = c > 0.3 && c < 0.6 ? 0.05 : 0.8 * sw + 0.2; chy = 0.45 * sw - 0.4 * th;
      A[1].ux = -0.7 - 0.9 * th; A[1].uz = 0.35 - 0.3 * th; A[1].ex = -1.2 + 1.15 * th; drill = 8 + 50 * th; if (th > 0.6 && (fxT += dt) > 0.05) { fxT = 0; spark(at(R.arms[1].bit), 4, 4); } }
    if (pose === 'build') { ex = (pt % 3.2) > 2.9 ? 'o' : (pt % 3.2) > 1.2 ? 'smile' : 'hum'; brow = 0.05; lid = 0.1; lx = 0.9; ly = -0.6; const c = pt % 3.2; mbK = c; T.forEach(q => { q.x = -0.4; q.y = q.s * 0.9 + 0.2; q.e = -1.2; }); weld = 1.2; hyw = 0.4; chy = -0.15; if (c > 0.5 && c < 1.4 && (fxT += dt) > 0.07) { fxT = 0; spark(at(R.tools[0].hd2), 2, 1.5, 0x9ffcf0); } if (c > 0.2 && c < 0.6 && Math.random() < 0.3) smoke(at(R.hop).add(new THREE.Vector3(0, 0.6, 0)), 0x7a706a, 0.6, 0.25); }
    if (pose === 'slam') { ex = (pt % 2.0) > 0.85 && (pt % 2.0) < 1.4 ? 'shout' : 'snarl'; brow = 0.55; lid = 0.3; jaw = (pt % 2.0) > 0.85 && (pt % 2.0) < 1.4 ? 0.9 : 0.1; lx = 0; ly = -0.4; const c = pt % 2.0, up = ease(c / 0.7), down = ease((c - 0.75) / 0.15), k = up * (1 - down); A.forEach(a => { a.ux = -0.7 - 2.1 * k - (down > 0 && c < 1.5 ? 0.4 * (1 - ease((c - 0.9) / 0.6)) : 0); a.uz = a.s * 0.2; a.ex = -1.2 + 1.1 * Math.max(k, down * (1 - ease((c - 1.3) / 0.5))); }); chx = 0.08 - 0.2 * k + 0.45 * down * (1 - ease((c - 1.3) / 0.5)); L = L.map(l => ({ ...l, k: 0.38 + 0.3 * down * (1 - ease((c - 1.3) / 0.5)) }));
      const cyc = Math.floor(pt / 2.0); if (c > 0.9 && lastSlam !== cyc) { lastSlam = cyc; ring.material.opacity = 0.9; ring.scale.setScalar(0.35); ring.position.set(0, 0.03, 1.4); const p = new THREE.Vector3(0, 0.05, 1.4); spark(p, 14, 4.5); for (let q = 0; q < 5; q++) smoke(p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 0.8)), 0x8a8078, 0.4, 0.5); } if (c > 0.9 && c < 1.08) shake = 0.06; }
    if (pose === 'stunned') { ex = 'wavy'; brow = -0.45; lid = 0.55 + 0.25 * Math.sin(t * 3); jaw = 0.35; lx = Math.sin(t * 5) * 0.8; ly = Math.cos(t * 5) * 0.5; chx = 0.35; hx = 0.35; hyw = Math.sin(t * 2) * 0.35; chz = Math.sin(t * 2 + 1) * 0.07; hy = 1.28; eyeK = Math.random() < 0.3 ? 0.1 : 0.6; coreK = Math.random() < 0.35 ? 0.05 : 0.4 + Math.random(); drill = 0.5; claw = 0.9; A.forEach(a => { a.ux = 0.05; a.uz = a.s * 0.18; a.ex = -0.2; }); T.forEach(q => { q.x = 0.9; q.e = 0.2; q.y = q.s * 0.2; }); weld = 0; L = L.map(l => ({ ...l, tx: -0.35, k: 0.7, f: -0.3 }));
      if ((fxT += dt) > 0.13) { fxT = 0; spark(at(Math.random() < 0.5 ? R.core : R.head), 4, 2.4); if (Math.random() < 0.6) smoke(at(R.head), 0x5a5550, 0.6, 0.3); } }
    if (pose === 'hurt') { const c0 = pt % 1.6; ex = c0 < 0.25 ? 'o' : c0 < 0.8 ? 'grimace' : 'snarl'; brow = c0 < 0.7 ? -0.35 : 0.4; lid = c0 < 0.7 ? 0.65 : 0.25; jaw = c0 < 0.7 ? 0.3 : 0; lx = 0; ly = 0; const c = pt % 1.6, k = Math.exp(-c * 5); chx = -0.45 * k + 0.08; hx = -0.4 * k; hy = 1.36 - 0.08 * k; shake = 0.04 * k; A.forEach(a => { a.ux = -0.4 + 0.5 * k; a.uz = a.s * (0.4 + 0.6 * k); a.ex = -0.9 + 0.6 * k; }); eyeK = c < 0.3 ? 0.2 : 1;
      const cyc = Math.floor(pt / 1.6); if (cyc !== lastHurt) { lastHurt = cyc; const cp = at(R.core); spark(cp, 16, 5); for (let q = 0; q < 3; q++) smoke(cp, 0x4a4540, 0.7, 0.35); DEB.forEach((d, n) => { if (n > 4) return; d.m.position.copy(cp).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.5, 0.2)); d.v.set((Math.random() - 0.5) * 4, 2 + Math.random() * 3, 1 + Math.random() * 2.5); d.w.set(Math.random() * 10, Math.random() * 10, Math.random() * 10); d.t = 2.2; d.m.visible = true; }); } }
    // apply
    R.hips.position.set((Math.random() - 0.5) * shake, hy, (Math.random() - 0.5) * shake); R.chest.rotation.set(chx, chy, chz); R.head.rotation.set(hx, hyw, 0);
    R.legs.forEach((l, i) => { const q = L[i]; l.th.rotation.set(q.tx, 0, l.s * 0.1); l.kn.rotation.x = q.k; l.ft.rotation.x = q.f - (q.tx + q.k) * 0.4; l.rod.scale.y = 1 + q.k * 0.25; });
    R.arms.forEach((a, i) => { const q = A[i]; a.up.rotation.set(q.ux, 0, q.uz); a.el.rotation.x = q.ex; if (a.bit) a.bit.rotation.y += dt * drill; a.fingers.forEach(f => { f.rotation.x = claw * 0.7; }); });
    R.tools.forEach((q, i) => { const o = T[i]; q.b0.rotation.set(o.x, o.y, 0); q.a2.rotation.x = o.e; if (q.flame) { q.flame.visible = weld > 0; q.flame.scale.setScalar((0.12 + Math.random() * 0.1) * weld); } q.jaws.forEach((j, k) => { j.rotation.y = (k ? -1 : 1) * (0.15 + 0.15 * Math.sin(t * 9)); }); });
    { U.blink = (U.blink ?? 2.5) - dt; if (U.blink < 0) U.blink = 2 + Math.random() * 3; const bl = U.blink < 0.12 ? 1 : 0, ld = Math.max(lid, bl);
      R.lidT.position.y = 0.22 - 0.15 * ld; R.lidB.position.y = -0.2 + 0.1 * ld; R.brows.forEach((p, k) => { p.rotation.z = (k ? 1 : -1) * -brow; p.position.y = 0.4 - Math.max(0, brow) * 0.03; }); R.jaw.rotation.x = jaw * 0.35;
      const dil = pose === 'stunned' ? 0.6 + 0.4 * Math.sin(t * 7) : beamOn ? 0.55 : pose === 'taunt' ? 1.25 : pose === 'hurt' ? 0.7 : 1; R.eyeBall.scale.setScalar(dil); R.eyeHot.scale.setScalar(dil * 1.6); R.eyeHot.material.opacity = beamOn ? 0.9 : 0;
      R.ball.rotation.set(-ly * 0.45, lx * 0.5, 0);
      R.focus.rotation.z = Math.sin(t * 0.7) * 0.6 + (beamOn ? t * 4 : 0); R.halo.material.opacity = (beamOn ? 1 : 0.55) * eyeK; R.halo.scale.setScalar(beamOn ? 0.62 + Math.random() * 0.08 : 0.42); mouth(ex, t); }
    { const hit = pose === 'hurt' ? Math.exp(-(pt % 1.6) * 2.2) : 0, stn = pose === 'stunned', rate = stn ? 0.8 : pose === 'hurt' || pose === 'slam' || pose === 'combo' ? 2.2 : pose === 'taunt' ? 1.6 : 1.1, ph = (t * rate) % 1,
        beat = Math.exp(-(((ph - 0.05) / 0.05) ** 2)) + 0.6 * Math.exp(-(((ph - 0.22) / 0.05) ** 2));
      R.heart.scale.setScalar(0.92 + 0.14 * beat); const col = U.hcol || (U.hcol = new THREE.Color()); col.set('#38bdf8'); if (hit > 0) col.lerp(new THREE.Color(hit > 0.3 ? '#ff1a1a' : '#ff9a1a'), Math.min(1, hit * 2.2)); if (stn) col.lerp(new THREE.Color('#a78bfa'), 0.7);
      R.heartFill.color.copy(col).multiplyScalar(stn && Math.random() < 0.25 ? 0.35 : 0.85 + 0.3 * beat); R.coreRing.color.setScalar(0.8 + 0.25 * beat); }
    R.beaconSpin.rotation.y = t * 5; R.beacon.material.emissiveIntensity = 1 + Math.abs(Math.sin(t * 5)) * 1.5;
    eyeM.emissiveIntensity = 1.6 * eyeK;  teal.emissiveIntensity = pose === 'stunned' ? 0.3 + Math.random() * 0.6 : 1.6;
    beam.visible = beamOn; if (beamOn) { R.eye.rotation.x = 0.3; const e = at(R.eye), tip = new THREE.Vector3(0, 0, 1); R.eye.updateWorldMatrix(true, false); const d = tip.applyMatrix3(new THREE.Matrix3().setFromMatrix4(R.eye.matrixWorld)).normalize(); const dl = d.clone().transformDirection(new THREE.Matrix4().copy(g.matrixWorld).invert()); const tt = dl.y < -0.05 ? -e.y / dl.y : 6; beam.scale.set(1, 1, tt / (R.eye.getWorldScale(new THREE.Vector3()).z || 1)); beam.material.opacity = 0.7 + Math.random() * 0.3; if ((fxT += dt) > 0.05) { fxT = 0; const hit = e.clone().addScaledVector(dl, tt); hit.y = 0.04; spark(hit, 3, 3, 0xff6a3a); if (Math.random() < 0.3) smoke(hit, 0x3a3532, 0.5, 0.25); } } else R.eye.rotation.x = 0;
    // mini-bot: drops from the chute, lands, toddles forward, poof
    if (mbK >= 0) { const c0 = at(R.chuteMouth); mb.visible = mbK > 0.5 && mbK < 3.0; if (mbK < 1.0) { const k = ease((mbK - 0.5) / 0.5); mb.position.set(c0.x + 0.2, c0.y * (1 - k), c0.z); mb.rotation.y = 0; } else { const k = (mbK - 1.0) / 2.0; mb.position.set(c0.x + 0.2 + k * 0.4, Math.abs(Math.sin(mbK * 14)) * 0.05, c0.z + k * 2.6); mb.rotation.y = Math.sin(mbK * 14) * 0.2; } if (mbK > 2.9 && mbK < 2.95) { spark(mb.position.clone().add(new THREE.Vector3(0, 0.2, 0)), 8, 3); smoke(mb.position.clone(), 0x7a706a, 0.5, 0.35); } } else mb.visible = false;
    if ((puffT += dt) > 0.5) { puffT = 0; smoke(at(R.hop).add(new THREE.Vector3(0, 0.6, 0)), 0x5a5550, 0.7, 0.22); }
    for (const q of SPK) { if (!q.m.visible) continue; q.t -= dt; if (q.t <= 0) { q.m.visible = false; continue; } q.v.y -= 9 * dt; q.m.position.addScaledVector(q.v, dt); q.m.lookAt(q.m.position.clone().add(q.v)); q.m.material.opacity = Math.min(1, q.t * 4); }
    for (const q of SMK) { if (!q.s.visible) continue; q.t -= dt; if (q.t <= 0) { q.s.visible = false; continue; } q.s.position.addScaledVector(q.v, dt); const k = 1 - q.t / q.life; q.s.scale.setScalar((q.size || 0.3) * (1 + k * 2.5)); q.s.material.opacity = 0.55 * (1 - k); }
    for (const d of DEB) { if (!d.m.visible) continue; d.t -= dt; if (d.t <= 0) { d.m.visible = false; continue; } if (d.m.position.y > 0.03) { d.v.y -= 9 * dt; d.m.position.addScaledVector(d.v, dt); d.m.rotation.x += d.w.x * dt; d.m.rotation.y += d.w.y * dt; } else { d.m.position.y = 0.03; d.v.set(0, 0, 0); } }
    if (ring.material.opacity > 0) { ring.scale.multiplyScalar(1 + dt * 4.5); ring.material.opacity = Math.max(0, ring.material.opacity - dt * 1.6); }
  };
  return g;
}

// SUDS-9 (Ben, s149): the Pearl Sail window cleaner as a STREET FIGHTER robot. V-shaped heavy chest + narrow waist, a 2.4 m squeegee pole used like a bo staff,
// the soap-nozzle arm cannon, soap tank on the back (glowing level window), yellow safety harness, red stripes, amber beacon, an LED visor face
// with expressions + LED mouth + tilting brows. s149m: the squeegee is his HAND now (hook-hand style), no pole. FX: soap bubbles, swoosh arcs, sparks, flying bolts, smoke.
// Poses (g.userData.pose): stance · taunt · sweepL · sweepH · spray · cyclone · victory · hurt · stunned. Built at real size (~2.9 m, pole up to 3.4 m).
export function suds9({ THREE, M, toon, grad }) {
  const GREY = '#5a5f68', GREYL = '#8f97a3', DARK = '#1f2226', RED = '#ec3013', YEL = '#ffd23a', STEEL = '#c3c9d0', TANK = '#2e7fb8', SOAP = '#9fe8ff';
  const grey = toon(GREY), greyL = toon(GREYL), dark = toon(DARK), red = toon(RED), yel = toon(YEL), steel = toon(STEEL), tank = toon(TANK);
  const GL = c => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, emissive: new THREE.Color(c), emissiveIntensity: 1.4 });
  const soap = GL(SOAP), amber = GL('#ffb020');
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const BX = (w, h, d) => { const r = Math.min(0.07, Math.min(w, h, d) * 0.3), g0 = new THREE.BoxGeometry(w, h, d, 3, 3, 3), p = g0.attributes.position, hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), q = new THREE.Vector3();
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); const dd = v.sub(q); if (dd.lengthSq() > 1e-9) { dd.normalize().multiplyScalar(r); p.setXYZ(k, q.x + dd.x, q.y + dd.y, q.z + dd.z); } } g0.computeVertexNormals(); return g0; };
  const CY = (a, b2, h, n = 16) => new THREE.CylinderGeometry(a, b2, h, n), SP = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
  const G = (p, x = 0, y = 0, z = 0) => { const q = new THREE.Group(); q.position.set(x, y, z); p.add(q); return q; };
  const rivets = (p, pts) => pts.forEach(([x, y, z]) => M(SP(0.02, 6, 4), steel, x, y, z, p, 0));
  const g = new THREE.Group(), R = {};
  // ---- hips, harness belt, spray bottle + carabiner ----
  const hips = R.hips = G(g, 0, 1.28, 0);
  M(BX(0.8, 0.3, 0.54), dark, 0, 0, 0, hips, 0.03); M(new THREE.CylinderGeometry(0.43, 0.43, 0.09, 26, 1, true), yel, 0, 0.09, 0, hips, 0).scale.set(1, 1, 0.68);
  M(new THREE.TorusGeometry(0.06, 0.016, 6, 14), steel, 0.3, -0.02, 0.29, hips, 0); M(BX(0.12, 0.08, 0.04), steel, 0, 0.09, 0.3, hips, 0.004);
  { const sb = G(hips, -0.45, -0.08, 0.08); M(CY(0.065, 0.075, 0.22, 10), tank, 0, 0, 0, sb, 0.006); M(BX(0.06, 0.08, 0.06), dark, 0, 0.15, 0, sb, 0.004); M(CY(0.012, 0.012, 0.09, 6), steel, 0, 0.17, 0.05, sb, 0).rotation.x = Math.PI / 2; }
  R.legs = [-1, 1].map(s => { const th = G(hips, s * 0.26, -0.1, 0);
    M(BX(0.3, 0.48, 0.34), grey, 0, -0.24, 0, th, 0.025); M(BX(0.31, 0.07, 0.35), red, 0, -0.07, 0, th, 0); rivets(th, [[-0.1, -0.2, 0.172], [0.1, -0.2, 0.172]]);
    const kn = G(th, 0, -0.5, 0); M(SP(0.15), steel, 0, 0, 0, kn, 0.012); M(BX(0.24, 0.2, 0.08), greyL, 0, 0.02, 0.16, kn, 0.012).rotation.x = -0.2;
    const rod = M(CY(0.028, 0.028, 0.4, 8), steel, 0, -0.05, -0.18, kn, 0.006);
    M(BX(0.34, 0.5, 0.38), grey, 0, -0.28, 0, kn, 0.025); M(BX(0.36, 0.06, 0.4), yel, 0, -0.47, 0, kn, 0);
    const ft = G(kn, 0, -0.56, 0); M(BX(0.4, 0.16, 0.6), dark, 0, -0.02, 0.08, ft, 0.02); M(BX(0.42, 0.05, 0.62), yel, 0, -0.1, 0.08, ft, 0);
    return { th, kn, ft, rod, s }; });
  // ---- waist + V-shaped chest ----
  for (const y of [0.2, 0.3]) M(CY(0.26, 0.28, 0.08, 16), y === 0.3 ? steel : dark, 0, y, 0, hips, 0.01);
  { const ab = G(hips, 0, 0.44, 0); M(BX(0.7, 0.32, 0.5), grey, 0, 0, 0, ab, 0.025); for (const y of [-0.06, 0.06]) M(BX(0.5, 0.02, 0.02), dark, 0, y, 0.255, ab, 0); M(BX(0.02, 0.24, 0.02), dark, 0, 0, 0.255, ab, 0); }
  const ch = R.chest = G(hips, 0, 0.98, 0);
  M(BX(1.36, 0.78, 0.82), grey, 0, 0, 0, ch, 0.04); M(BX(0.96, 0.3, 0.68), grey, 0, -0.42, 0, ch, 0.03); M(BX(1.38, 0.13, 0.84), red, 0, 0.3, 0, ch, 0);
  for (const s of [-1, 1]) { M(BX(0.46, 0.26, 0.05), greyL, s * 0.3, 0.1, 0.41, ch, 0.012); rivets(ch, [[s * 0.5, 0.2, 0.44], [s * 0.1, 0.2, 0.44]]); }
  { const t = CT(256, 96, (c) => { c.fillStyle = '#1f2226'; c.fillRect(0, 0, 256, 96); c.strokeStyle = YEL; c.lineWidth = 6; c.strokeRect(5, 5, 246, 86); c.fillStyle = '#f3f2f2'; c.font = '900 54px Archivo, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SUDS-9', 128, 52); });
    M(new THREE.PlaneGeometry(0.56, 0.21), new THREE.MeshBasicMaterial({ map: t }), 0, -0.2, 0.413, ch, 0); }
  for (const s of [-1, 1]) { const st = M(BX(0.1, 0.92, 0.03), yel, s * 0.42, -0.08, 0.425, ch, 0.006); st.rotation.z = s * 0.12; M(BX(0.1, 0.5, 0.03), yel, s * 0.42, 0.12, -0.425, ch, 0.006); }   // harness straps
  // ---- soap tank (back) + glowing level window ----
  const tk = R.tank = G(ch, 0, 0.02, -0.66);
  M(CY(0.3, 0.3, 1.0, 18), tank, 0, 0, 0, tk, 0.025, 0.3); for (const y of [-0.38, 0.38]) M(new THREE.TorusGeometry(0.31, 0.03, 6, 22), steel, 0, y, 0, tk, 0).rotation.x = Math.PI / 2;
  M(BX(0.1, 0.62, 0.06), soap, 0, 0, -0.3, tk, 0); M(CY(0.09, 0.1, 0.16, 10), dark, 0, 0.58, 0, tk, 0.008); R.tankTop = G(tk, 0, 0.7, 0);
  { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.15, 0.62, -0.62), new THREE.Vector3(-0.55, 0.62, -0.4), new THREE.Vector3(-0.82, 0.4, -0.1)]); M(new THREE.TubeGeometry(c, 16, 0.04, 6, false), dark, 0, 0, 0, ch, 0.006); }
  // ---- head: box head, red headband, LED visor, LED mouth grille, tilting brows, ear vents, antenna, beacon ----
  M(CY(0.13, 0.16, 0.16, 12), dark, 0, 0.45, 0.04, ch, 0.01);
  const hd = R.head = G(ch, 0, 0.5, 0.06);
  M(BX(0.6, 0.5, 0.54), grey, 0, 0.26, 0, hd, 0.03); M(BX(0.62, 0.08, 0.56), red, 0, 0.45, 0, hd, 0);
  M(BX(0.52, 0.22, 0.05), dark, 0, 0.29, 0.27, hd, 0.01); M(BX(0.42, 0.13, 0.05), dark, 0, 0.09, 0.26, hd, 0.01);
  const vc = document.createElement('canvas'); vc.width = 256; vc.height = 96; const vg = vc.getContext('2d'), vt = new THREE.CanvasTexture(vc); vt.colorSpace = THREE.SRGBColorSpace;
  M(new THREE.PlaneGeometry(0.47, 0.18), new THREE.MeshBasicMaterial({ map: vt, toneMapped: false }), 0, 0.29, 0.297, hd, 0);
  const mc = document.createElement('canvas'); mc.width = 128; mc.height = 40; const mg = mc.getContext('2d'), mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace;
  M(new THREE.PlaneGeometry(0.36, 0.1), new THREE.MeshBasicMaterial({ map: mt, toneMapped: false }), 0, 0.09, 0.287, hd, 0);
  R.brows = [-1, 1].map(s => { const p = G(hd, s * 0.12, 0.42, 0.29); M(BX(0.2, 0.05, 0.07), dark, s * 0.02, 0, 0, p, 0.006); return p; });
  for (const s of [-1, 1]) { M(CY(0.1, 0.1, 0.08, 16), dark, s * 0.32, 0.27, 0, hd, 0.008).rotation.z = Math.PI / 2; M(new THREE.TorusGeometry(0.1, 0.018, 6, 16), yel, s * 0.365, 0.27, 0, hd, 0).rotation.y = Math.PI / 2; }
  M(CY(0.012, 0.012, 0.36, 6), steel, 0.34, 0.6, -0.08, hd, 0.004); M(SP(0.03, 8, 6), red, 0.34, 0.78, -0.08, hd, 0);
  M(CY(0.07, 0.08, 0.08, 10), dark, 0, 0.55, 0, hd, 0.006); R.beacon = M(SP(0.085, 12, 10), amber, 0, 0.63, 0, hd, 0.008);
  R.beamB = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.06), new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); R.beamB.position.x = 0.15; R.beaconSpin = G(hd, 0, 0.63, 0); R.beaconSpin.add(R.beamB);
  const EC = '#ff3a20';
  let vKey = ''; const visor = (e, lx, bl) => { const key = e + '|' + Math.round(lx * 8) + '|' + bl; if (key === vKey) return; vKey = key; const c = vg; c.fillStyle = '#07090b'; c.fillRect(0, 0, 256, 96); c.save(); c.shadowColor = EC; c.shadowBlur = 12; c.fillStyle = EC; c.strokeStyle = EC; c.lineWidth = 10; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const s of [-1, 1]) { const cx = 128 + s * 58 + lx * 16, cy = 50; c.save(); c.translate(cx, cy);
      if (bl) c.fillRect(-34, -3, 68, 6);
      else if (e === 'angry') { c.rotate(-s * 0.36); c.fillRect(-36, -10, 72, 20); }
      else if (e === 'focus') { c.rotate(-s * 0.22); c.fillRect(-36, -5, 72, 10); }
      else if (e === 'happy' || (e === 'wink' && s > 0)) { c.beginPath(); c.moveTo(-30, 12); c.quadraticCurveTo(0, -28, 30, 12); c.stroke(); }
      else if (e === 'wink') { c.fillRect(-30, -3, 60, 6); }
      else if (e === 'x') { c.beginPath(); c.moveTo(-20, -20); c.lineTo(20, 20); c.moveTo(20, -20); c.lineTo(-20, 20); c.stroke(); }
      else if (e === 'o') { c.beginPath(); c.arc(0, 0, 20, 0, 7); c.stroke(); }
      else { c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill(); }
      c.restore(); }
    c.restore(); c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < 96; y += 4) c.fillRect(0, y, 256, 1); vt.needsUpdate = true; };
  let mKey = ''; const mouth = (e, t) => { const key = e === 'wavy' ? e + Math.floor(t * 10) : e; if (key === mKey) return; mKey = key; mg.fillStyle = '#07090b'; mg.fillRect(0, 0, 128, 40); mg.save(); mg.shadowColor = EC; mg.shadowBlur = 6; mg.strokeStyle = '#ff7a5a'; mg.lineWidth = 4; mg.lineCap = 'round'; mg.lineJoin = 'round';
    if (e === 'smirk') { mg.beginPath(); mg.moveTo(20, 22); mg.lineTo(72, 22); mg.quadraticCurveTo(100, 20, 110, 10); mg.stroke(); }
    else if (e === 'grin') { mg.beginPath(); mg.moveTo(12, 10); mg.quadraticCurveTo(64, 42, 116, 10); mg.stroke(); mg.lineWidth = 2.5; for (let k = 1; k < 7; k++) { const x = 12 + k * 14.8, y = 10 + Math.sin(k / 7 * Math.PI) * 15; mg.beginPath(); mg.moveTo(x, y - 6); mg.lineTo(x, y + 1); mg.stroke(); } }
    else if (e === 'snarl') { mg.beginPath(); for (let k = 0; k <= 8; k++) mg.lineTo(10 + k * 13.5, k % 2 ? 12 : 28); mg.stroke(); }
    else if (e === 'shout') { mg.strokeRect(34, 5, 60, 30); for (let k = 1; k < 4; k++) { mg.beginPath(); mg.moveTo(34 + k * 15, 5); mg.lineTo(34 + k * 15, 12); mg.stroke(); } }
    else if (e === 'grimace') { mg.strokeRect(14, 11, 100, 18); for (let k = 1; k < 7; k++) { mg.beginPath(); mg.moveTo(14 + k * 14.3, 11); mg.lineTo(14 + k * 14.3, 29); mg.stroke(); } }
    else if (e === 'wavy') { mg.beginPath(); for (let x = 10; x <= 118; x += 3) mg.lineTo(x, 20 + Math.sin(x * 0.12 + t * 8) * 8); mg.stroke(); }
    else { mg.beginPath(); mg.moveTo(22, 20); mg.lineTo(106, 20); mg.stroke(); }
    mg.restore(); mt.needsUpdate = true; };
  // ---- arms: +x = SQUEEGEE (bo-staff pole), −x = SOAP CANNON ----
  R.arms = [-1, 1].map(s => { const sh = G(ch, s * 0.84, 0.2, 0);
    M(SP(0.25), dark, 0, 0, 0, sh, 0.02, 0.25); const pd = M(new THREE.SphereGeometry(0.33, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), greyL, s * 0.04, 0.06, 0, sh, 0.02, 0.33); pd.scale.set(1.12, 0.72, 1.1);
    M(new THREE.CylinderGeometry(0.37, 0.37, 0.07, 22, 1, true), red, s * 0.04, 0.06, 0, sh, 0).scale.set(1, 1, 1); M(new THREE.TorusGeometry(0.37, 0.022, 6, 24), yel, s * 0.04, 0.02, 0, sh, 0).rotation.x = Math.PI / 2;
    const up = G(sh, s * 0.05, -0.1, 0); M(BX(0.26, 0.5, 0.28), grey, 0, -0.26, 0, up, 0.02); M(CY(0.04, 0.04, 0.3, 8), dark, 0, -0.3, -0.17, up, 0.006);
    const el = G(up, 0, -0.55, 0); M(SP(0.13), steel, 0, 0, 0, el, 0.01); M(CY(0.025, 0.025, 0.34, 8), steel, 0, 0.1, -0.17, el, 0.005);
    let hand = null, pg = null, slide = null, noz = null, sqTip = null;
    if (s > 0) { M(BX(0.32, 0.5, 0.34), grey, 0, -0.3, 0, el, 0.025); M(BX(0.34, 0.08, 0.36), yel, 0, -0.5, 0, el, 0);
      // s149m: SQUEEGEE HAND (a hook-hand that is a squeegee): wrist socket + swivel collar, a short steel neck, a wide blade with a yellow rubber edge
      hand = G(el, 0, -0.58, 0); M(CY(0.13, 0.15, 0.12, 16), dark, 0, 0, 0, hand, 0.01); M(new THREE.TorusGeometry(0.145, 0.025, 6, 18), yel, 0, -0.04, 0, hand, 0).rotation.x = Math.PI / 2;
      pg = G(hand, 0, -0.06, 0); slide = G(pg, 0, 0, 0);
      M(CY(0.05, 0.06, 0.26, 10), steel, 0, -0.13, 0, slide, 0.008); rivets(slide, [[0, -0.08, 0.06], [0, -0.18, 0.06]]);
      const sq = G(slide, 0, -0.28, 0); M(BX(0.22, 0.12, 0.16), dark, 0, 0, 0, sq, 0.01); M(BX(0.95, 0.14, 0.15), grey, 0, -0.1, 0, sq, 0.02); M(BX(0.97, 0.03, 0.155), red, 0, -0.04, 0, sq, 0); M(BX(0.97, 0.06, 0.17), yel, 0, -0.19, 0, sq, 0);
      for (const s2 of [-1, 1]) M(BX(0.04, 0.2, 0.17), dark, s2 * 0.48, -0.12, 0, sq, 0.006);
      sqTip = G(sq, 0, -0.22, 0); }
    else { M(CY(0.17, 0.17, 0.5, 16), tank, 0, -0.3, 0, el, 0.02, 0.17); for (const y of [-0.1, -0.5]) M(new THREE.TorusGeometry(0.175, 0.022, 6, 18), steel, 0, y, 0, el, 0).rotation.x = Math.PI / 2;
      M(BX(0.05, 0.3, 0.04), soap, 0, -0.3, 0.17, el, 0); M(CY(0.1, 0.06, 0.2, 12), steel, 0, -0.64, 0, el, 0.008); M(new THREE.TorusGeometry(0.06, 0.015, 6, 12), red, 0, -0.74, 0, el, 0).rotation.x = Math.PI / 2;
      hand = G(el, 0, -0.62, 0); noz = G(el, 0, -0.78, 0); }
    return { sh, up, el, hand, pg, slide, noz, sqTip, s }; });
  R.noz = R.arms[0].noz; R.sqTip = R.arms[1].sqTip;
  // ---- FX ----
  const swG = new THREE.RingGeometry(1.0, 1.85, 40, 1, 0, Math.PI * 0.8); swG.rotateX(-Math.PI / 2);
  R.swoosh = new THREE.Mesh(swG, new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); g.add(R.swoosh);
  const BUB = [...Array(46)].map((_, k) => { const m = new THREE.Mesh(SP(1, 12, 8), new THREE.MeshPhongMaterial({ color: [0xcff6ff, 0xffd6f4, 0xffffff, 0xd8ffe8][k % 4], transparent: true, opacity: 0.5, shininess: 200, specular: 0xffffff, depthWrite: false })); m.visible = false; g.add(m); return { m, v: new THREE.Vector3(), t: 0, life: 1, s: 0.1 }; });
  const SPK = [...Array(28)].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.1), new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; g.add(m); return { m, v: new THREE.Vector3(), t: 0 }; });
  const smT = CT(64, 64, (c) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); });
  const SMK = [...Array(14)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smT, color: 0x5a5a60, transparent: true, depthWrite: false })); s.visible = false; g.add(s); return { s, v: new THREE.Vector3(), t: 0, life: 1, size: 0.3 }; });
  const DEB = [...Array(8)].map((_, k) => { const m = M(k % 2 ? CY(0.05, 0.05, 0.04, 6) : BX(0.18, 0.03, 0.12), k % 3 ? steel : yel, 0, 0, 0, g, 0); m.visible = false; return { m, v: new THREE.Vector3(), w: new THREE.Vector3(), t: 0 }; });
  const wp = new THREE.Vector3(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), at = o => { o.updateWorldMatrix(true, false); o.getWorldPosition(wp); return g.worldToLocal(wp.clone()); };
  const dirOf = (o, v) => { o.getWorldQuaternion(qa); g.getWorldQuaternion(qb); return v.clone().applyQuaternion(qa).applyQuaternion(qb.invert()); };
  let bi = 0, si = 0, mi = 0; const bubble = (p, v, s) => { const q = BUB[bi++ % BUB.length]; q.m.position.copy(p); q.v.copy(v); q.s = s; q.t = q.life = 1.2 + Math.random() * 0.8; q.m.visible = true; };
  const spark = (p, n = 6, sp = 3) => { for (let k = 0; k < n; k++) { const q = SPK[si++ % SPK.length]; q.m.position.copy(p); q.v.set((Math.random() - 0.5) * sp, Math.random() * sp * 0.8 + 0.5, (Math.random() - 0.5) * sp); q.t = 0.35 + Math.random() * 0.25; q.m.visible = true; } };
  const smoke = (p, up = 0.7, size = 0.28) => { const q = SMK[mi++ % SMK.length]; q.s.position.copy(p); q.v.set((Math.random() - 0.5) * 0.2, up, (Math.random() - 0.5) * 0.2); q.t = q.life = 1.3; q.size = size; q.s.visible = true; };
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
  let fxT = 0, lastHurt = -1, lastLand = -1;
  g.userData.R = R; g.userData.pose = 'stance'; g.userData.pt = 0;
  g.userData.idle = (t, dt = 0.016) => { const U = g.userData, pose = U.pose || 'stance'; U.pt = (U.pt || 0) + dt; const pt = U.pt;
    const A = R.arms.map(a => ({ ux: -0.3, uz: a.s * 0.25, ex: -0.5, hy: 0, px: 0, pz: 0, slide: 0 }));
    let L = R.legs.map(l => ({ tx: -0.2, k: 0.4, z: l.s * 0.12 })), lift = 0, chx = 0.05, chy = 0, chz = 0, hipY = 0, hx = 0, hyw = 0, hz = 0, eye = 'angry', lx = 0, mo = 'flat', brow = 0.3, shake = 0, sw = 0, swY = 0.3, swR = 0, tankK = 1, spray = false, bub = 0, bubSrc = null, blinkOk = true;
    const legs = (tx, k, z) => { L = R.legs.map(l => ({ tx, k, z: l.s * z })); };
    if (pose === 'stance') { const b = Math.abs(Math.sin(t * 3)); legs(-0.3 - 0.06 * b, 0.55 + 0.12 * b, 0.16); chy = -0.35; chx = 0.12; hyw = 0.3;
      Object.assign(A[1], { ux: -0.75, uz: 0.3, ex: -1.0, px: -0.3, pz: 0 }); Object.assign(A[0], { ux: -1.05, uz: -0.25, ex: -1.3 }); lx = Math.sin(t * 0.9) * 0.4; mo = ['flat', 'snarl', 'flat', 'smirk'][Math.floor(t / 2.6) % 4]; brow = 0.35; }
    if (pose === 'sweepL' || pose === 'sweepH') { const hi = pose === 'sweepH', c = pt % 1.8, wind = ease(c / 0.45), go = ease((c - 0.5) / 0.22), back = ease((c - 1.1) / 0.6), yaw = (1.1 * wind - 2.5 * go) * (1 - back);
      chy = yaw; chx = hi ? -0.12 : 0.35 * Math.max(wind, 1 - back); if (hi) legs(-0.15, 0.3, 0.14); else legs(-0.5, 0.95, 0.26);
      Object.assign(A[1], { ux: hi ? -1.68 : -1.05, uz: 0.35, ex: -0.15 }); Object.assign(A[0], { ux: -0.4, uz: -0.75, ex: -0.8 });
      sw = c > 0.5 && c < 1.1 ? 0.75 * (1 - ease((c - 0.72) / 0.38)) : 0; swY = hi ? 2.25 : 0.95; swR = yaw - Math.PI / 2;
      eye = c < 0.5 ? 'focus' : 'angry'; mo = c > 0.5 && c < 1.1 ? 'shout' : 'snarl'; brow = 0.5; bub = c > 0.5 && c < 0.95 ? 1 : 0; bubSrc = R.sqTip; }
    if (pose === 'spray') { const c = pt % 2.6, on = c > 0.35 && c < 2.0, aim = ease(c / 0.3) * (1 - ease((c - 2.1) / 0.4)); chy = 0.45 * aim; hyw = -0.35 * aim; legs(-0.25, 0.45, 0.2);
      Object.assign(A[0], { ux: -0.3 - 1.27 * aim, uz: -0.25 + 0.25 * aim, ex: -0.5 + 0.5 * aim }); Object.assign(A[1], { ux: 0.15, uz: 0.35, ex: -0.4 });
      eye = on ? 'focus' : 'angry'; mo = on ? 'shout' : 'smirk'; brow = 0.45; spray = on; tankK = on ? 1.8 + Math.sin(t * 20) * 0.4 : 1; shake = on ? 0.012 : 0; }
    if (pose === 'cyclone') { const c = pt % 2.4, up = ease(c / 0.35), down = ease((c - 1.6) / 0.35), air = up * (1 - down), spin = ease((c - 0.3) / 1.35) * Math.PI * 8;
      lift = 0.75 * air; hipY = spin; legs(-0.2 - 0.9 * air, 0.3 + 1.3 * air, 0.12); Object.assign(A[1], { ux: -0.1, uz: 0.3 + 1.25 * air, ex: -0.1 }); Object.assign(A[0], { ux: -0.1, uz: -0.3 - 1.15 * air, ex: -0.2 });
      sw = air > 0.5 && c > 0.35 && c < 1.65 ? 0.6 : 0; swY = 2.35 + lift; swR = spin + Math.PI; eye = 'angry'; mo = air > 0.3 ? 'shout' : 'snarl'; brow = 0.55; bub = air > 0.5 ? 1.3 : 0; bubSrc = R.sqTip;
      const cyc = Math.floor(pt / 2.4); if (c > 1.95 && cyc !== lastLand) { lastLand = cyc; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; bubble(new THREE.Vector3(Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5), new THREE.Vector3(Math.cos(a) * 1.6, 0.6, Math.sin(a) * 1.6), 0.08); } } }
    if (pose === 'taunt') { legs(-0.15, 0.3, 0.16); Object.assign(A[1], { ux: -1.45, uz: 0.15, ex: -0.25, px: 0, hy: pt * 12 }); Object.assign(A[0], { ux: -0.25, uz: -0.5, ex: -1.7 + 0.35 * Math.abs(Math.sin(pt * 4)) });
      chy = -0.2; hx = -0.1; hz = 0.1 * Math.sin(pt * 3); eye = (pt % 2.4) > 2.0 ? 'wink' : 'happy'; mo = 'grin'; brow = -0.2; bub = 0.35; bubSrc = R.sqTip; blinkOk = false; }
    if (pose === 'victory') { legs(-0.05, 0.1, 0.18); Object.assign(A[1], { ux: -0.4, uz: 0.35, ex: -1.4, px: 0 }); Object.assign(A[0], { ux: -2.9 - 0.15 * Math.abs(Math.sin(t * 3)), uz: -0.25, ex: -0.3 });
      eye = 'happy'; mo = 'grin'; hx = -0.15; brow = -0.25; bub = 0.7; bubSrc = R.tankTop; blinkOk = false; }
    if (pose === 'hurt') { const c = pt % 1.6, k = Math.exp(-c * 5); chx = -0.5 * k + 0.05; hx = -0.45 * k; hz = 0.2 * k * Math.sin(t * 40); shake = 0.05 * k; legs(-0.1 + 0.25 * k, 0.4, 0.16);
      Object.assign(A[0], { ux: -0.2 - 0.6 * k, uz: -0.3 - 0.9 * k, ex: -0.6 }); Object.assign(A[1], { ux: -0.2 - 0.6 * k, uz: 0.3 + 0.9 * k, ex: -0.6 });
      eye = c < 0.3 ? 'x' : 'o'; mo = c < 0.7 ? 'grimace' : 'snarl'; brow = -0.3; blinkOk = false;
      const cyc = Math.floor(pt / 1.6); if (cyc !== lastHurt) { lastHurt = cyc; const cp = at(R.chest); spark(cp, 14, 5); smoke(cp, 0.7, 0.32); const tp = at(R.tankTop); for (let q = 0; q < 12; q++) bubble(tp, new THREE.Vector3((Math.random() - 0.5) * 2.5, 1 + Math.random() * 2, -0.5 - Math.random()), 0.05 + Math.random() * 0.07);
        DEB.forEach(d => { d.m.position.copy(cp).add(new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 0.4, 0.3)); d.v.set((Math.random() - 0.5) * 4, 2 + Math.random() * 3, 1 + Math.random() * 2.5); d.w.set(Math.random() * 12, Math.random() * 12, Math.random() * 12); d.t = 2.2; d.m.visible = true; }); } }
    if (pose === 'stunned') { const sc = pt % 3; hx = 0.3; hz = Math.sin(t * 2) * 0.25; chx = 0.35; chz = Math.sin(t * 2 + 1) * 0.08; hyw = sc < 0.6 ? ease(sc / 0.6) * Math.PI * 2 : 0; legs(-0.35, 0.75, 0.2);
      Object.assign(A[0], { ux: 0.1, uz: -0.15, ex: -0.2 }); Object.assign(A[1], { ux: 0.05, uz: 0.2, ex: -0.3, px: 0.3 }); eye = 'x'; mo = 'wavy'; brow = -0.4; blinkOk = false; bub = 0.5; bubSrc = R.head;
      if ((fxT += dt) > 0.15) { fxT = 0; spark(at(R.head).add(new THREE.Vector3(0, 0.4, 0)), 3, 2.2); if (Math.random() < 0.4) smoke(at(R.head).add(new THREE.Vector3(0, 0.5, 0)), 0.6, 0.25); } }
    // apply
    R.legs.forEach((l, i) => { const q = L[i]; l.th.rotation.set(q.tx, 0, q.z); l.kn.rotation.x = q.k; l.ft.rotation.x = -(q.tx + q.k); l.rod.scale.y = 1 + q.k * 0.3; });
    const q0 = L[0], cz = Math.cos(q0.z), drop = 1.06 - 0.5 * Math.cos(q0.tx) * cz - 0.56 * Math.cos(q0.tx + q0.k) * cz;
    R.hips.position.set((Math.random() - 0.5) * shake, 1.28 - drop + lift, (Math.random() - 0.5) * shake); R.hips.rotation.y = hipY;
    R.chest.rotation.set(chx, chy, chz); R.head.rotation.set(hx, hyw, hz);
    R.arms.forEach((a, i) => { const q = A[i]; a.up.rotation.set(q.ux, 0, q.uz); a.el.rotation.x = q.ex; a.hand.rotation.y = q.hy || 0; if (a.pg) { a.pg.rotation.set(q.px || 0, 0, q.pz || 0); a.slide.position.y = q.slide || 0; } });
    U.blink = (U.blink ?? 2.5) - dt; if (U.blink < 0) U.blink = 2 + Math.random() * 3; const bl = blinkOk && U.blink < 0.12;
    visor(eye, lx, bl); mouth(mo, t); R.brows.forEach((p, k) => { p.rotation.z = (k ? 1 : -1) * -brow; p.position.y = 0.42 - Math.max(0, brow) * 0.025; });
    R.beaconSpin.rotation.y = t * (pose === 'victory' ? 12 : 5); amber.emissiveIntensity = 1 + Math.abs(Math.sin(t * 5)) * 1.4; soap.emissiveIntensity = 1.2 * tankK;
    R.swoosh.material.opacity = sw; R.swoosh.position.y = swY; R.swoosh.rotation.y = swR;
    if (spray) { U.st = (U.st || 0) - dt; if (U.st <= 0) { U.st = 0.035; const d = dirOf(R.noz, new THREE.Vector3(0, -1, 0)); bubble(at(R.noz), d.multiplyScalar(4 + Math.random() * 1.5).add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.3) * 0.6, (Math.random() - 0.5) * 0.6)), 0.06 + Math.random() * 0.09); } }
    if (bub > 0 && bubSrc && Math.random() < bub * dt * 30) bubble(at(bubSrc), new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 0.8), 0.04 + Math.random() * 0.06);
    for (const q of BUB) { if (!q.m.visible) continue; q.t -= dt; if (q.t <= 0) { q.m.visible = false; continue; } q.v.y += 0.7 * dt; q.v.multiplyScalar(1 - 1.6 * dt); q.m.position.addScaledVector(q.v, dt); q.m.position.x += Math.sin(t * 6 + q.life * 9) * 0.004;
      const k = q.t / q.life, pop = q.t < 0.1 ? 1 + (0.1 - q.t) * 6 : 1; q.m.scale.setScalar(q.s * pop * (1 + 0.06 * Math.sin(t * 9 + q.life * 5))); q.m.material.opacity = (q.t < 0.1 ? q.t * 5 : 0.5) * Math.min(1, (1 - k) * 8 + 0.2); }
    for (const q of SPK) { if (!q.m.visible) continue; q.t -= dt; if (q.t <= 0) { q.m.visible = false; continue; } q.v.y -= 9 * dt; q.m.position.addScaledVector(q.v, dt); q.m.lookAt(q.m.position.clone().add(q.v)); q.m.material.opacity = Math.min(1, q.t * 4); }
    for (const q of SMK) { if (!q.s.visible) continue; q.t -= dt; if (q.t <= 0) { q.s.visible = false; continue; } q.s.position.addScaledVector(q.v, dt); const k = 1 - q.t / q.life; q.s.scale.setScalar(q.size * (1 + k * 2.5)); q.s.material.opacity = 0.55 * (1 - k); }
    for (const d of DEB) { if (!d.m.visible) continue; d.t -= dt; if (d.t <= 0) { d.m.visible = false; continue; } if (d.m.position.y > 0.03) { d.v.y -= 9 * dt; d.m.position.addScaledVector(d.v, dt); d.m.rotation.x += d.w.x * dt; d.m.rotation.y += d.w.y * dt; } else { d.m.position.y = 0.03; d.v.set(0, 0, 0); } }
  };
  return g;
}
