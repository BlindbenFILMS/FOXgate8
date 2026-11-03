// MILITIA BUNKROOM [dsfBarracks] interior (s352): olive + amber. Sergeant Holt (DRAFT name) at the DUTY ROSTER, four double
// bunks with footlockers (west), the mess table (east), a training mat + punching dummy (DRILL), the READY RACK of helmets,
// and UNIT-9's empty FLEET LIAISON POST in the north-east corner (Machine Fleet hint: it walked out mid-watch).
import { roomKit } from './dsf-room-kit.js?v=352';
export const MB = { OX: 12000, hw: 11, hd: 9, h: 5.2, door: { x: 0, z: 8.2 }, enter: { x: 0, z: 5.8 }, hiring: { x: 8.6, z: 6.6 }, keeper: { x: 0, z: -6.6 }, dummy: { x: 6.2, z: -3.0 }, post: { x: 9.4, z: -7.6 }, mess: { x: 6.2, z: 2.6 }, wren: { x: 4.4, z: 2.0 }, rook: { x: -7.4, z: -0.8 } };
export function buildBarracks(K) {
  const R = roomKit(K, MB), { THREE, g, anims, B, C, S, plane, flat, lit, sign, tex, canvas, FONT, toon, basic, rr, block, circle, spots } = R;
  const { hw, hd, h } = MB, AMB = '#ffb36a', OLIVE = '#4a5a3a', dark = toon('#1e2226'), steel = toon('#6a7078'), wood = toon('#5a4630'), wallM = toon('#2a2e34');
  const conc = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#4a4c46'; c.fillRect(0, 0, w, w); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; c.fillRect(Math.random() * w, Math.random() * w, 3, 3); } c.strokeStyle = '#3a3c36'; c.lineWidth = 3; c.strokeRect(0, 0, w, w); }), [hw / 2, hd / 2]);
  R.shell({ wall: '#2a2e34', floor: conc, ceil: '#181a1e', trim: AMB, title: ['MILITIA', 'BUNKROOM · SPACE STATION 8'] });
  for (const s of [-1, 1]) flat(0.12, hd * 2 - 2.6, basic('#e8c45a'), s * 1.7, 0.012, -0.9);
  // four double bunks along the west wall, footlockers at the foot
  const eight = tex(canvas(128, 128, (c, w) => { c.fillStyle = AMB; c.font = `900 110px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', w / 2, w / 2 + 6); }));
  const sheet = toon('#d8d4c8'), blanket = toon(OLIVE), pillow = toon('#f0ece0'), locker = toon('#3c4a34');
  for (const z of [-6.2, -2.6, 1.0, 4.6]) { const x0 = -hw + 0.15, L = 2.1, xc = x0 + L / 2;
    for (const [dx, dz] of [[0.05, -0.5], [L - 0.05, -0.5], [0.05, 0.5], [L - 0.05, 0.5]]) B(0.07, 2.3, 0.07, steel, x0 + dx, 1.15, z + dz);
    for (const y of [0.45, 1.65]) { B(L, 0.08, 1.0, steel, xc, y - 0.08, z); B(L - 0.1, 0.18, 0.92, sheet, xc, y + 0.05, z); B(L - 0.6, 0.06, 0.94, blanket, xc + 0.25, y + 0.16, z); B(0.4, 0.12, 0.7, pillow, x0 + 0.3, y + 0.2, z); }
    for (const y of [0.85, 1.15, 1.45]) B(0.04, 0.04, 0.96, steel, x0 + L - 0.05, y, z);
    B(0.6, 0.45, 0.9, locker, x0 + L + 0.4, 0.23, z); plane(0.3, 0.3, lit(eight), x0 + L + 0.71, 0.25, z, Math.PI / 2);
    block(-hw, x0 + L + 0.75, z - 0.6, z + 0.6); }
  // DUTY ROSTER on the north wall, amber banners, the alert beacon, Holt's lectern
  const roster = tex(canvas(1024, 600, (c, W, H) => { c.fillStyle = '#20241e'; c.fillRect(0, 0, W, H); c.strokeStyle = AMB; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); c.fillStyle = AMB; c.font = `900 64px ${FONT}`; c.textBaseline = 'top'; c.fillText('DUTY ROSTER · MILITIA', 40, 30);
    [['HOLT', 'SERGEANT', 'DAY'], ['WREN', 'CORPORAL', 'DAY'], ['ROOK', 'PRIVATE', 'NIGHT'], ['STEWARD', 'YOU', 'OPEN'], ['UNIT-9', 'FLEET LIAISON', 'MISSING']].forEach((r, i) => { const y = 130 + i * 88; c.fillStyle = i === 4 ? '#ff5a3a' : '#f3f2f2'; c.font = `800 46px ${FONT}`; c.fillText(r[0], 40, y); c.fillText(r[1], 360, y); c.fillText(r[2], 760, y); c.fillStyle = '#3a3e36'; c.fillRect(40, y + 64, W - 80, 3); if (i === 4) { c.strokeStyle = '#ff5a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(30, y + 24); c.lineTo(700, y + 24); c.stroke(); } }); }));
  plane(4.4, 2.6, lit(roster), 0, 3.1, -hd + 0.18);
  const ban = tex(canvas(256, 512, (c, w, H) => { c.fillStyle = '#5a3a1a'; c.fillRect(0, 0, w, H); c.fillStyle = AMB; c.fillRect(0, 0, w, 24); c.fillRect(0, H - 60, w, 14); c.font = `900 170px ${FONT}`; c.textAlign = 'center'; c.fillText('8', w / 2, 280); }));
  for (const s of [-1, 1]) plane(1.2, 2.6, toon('#ffffff', { map: ban }), s * 3.4, 3.3, -hd + 0.18);
  const beaconM = new THREE.MeshBasicMaterial({ color: 0xff3b2f, toneMapped: false, transparent: true }); C(0.18, 0.22, 0.3, beaconM, 0, 4.75, -hd + 0.3, 12);
  anims.push((dt, t) => { beaconM.opacity = 0.35 + 0.25 * Math.sin(t * 1.2); });
  B(0.6, 1.1, 0.5, wood, 1.6, 0.55, -6.9); plane(0.4, 0.5, toon('#e8e0c8'), 1.6, 1.12, -6.9).rotation.x = -1.2; block(1.25, 1.95, -7.2, -6.6);
  // mess table (east)
  const MS = MB.mess; B(1.2, 0.08, 3.6, wood, MS.x, 0.78, MS.z); for (const dx of [-0.5, 0.5]) for (const dz of [-1.6, 1.6]) B(0.08, 0.74, 0.08, steel, MS.x + dx, 0.37, MS.z + dz);
  for (const s of [-1, 1]) { B(0.4, 0.06, 3.6, wood, MS.x + s * 0.95, 0.46, MS.z); for (const dz of [-1.5, 1.5]) B(0.06, 0.44, 0.06, steel, MS.x + s * 0.95, 0.22, MS.z + dz); }
  for (let i = 0; i < 4; i++) { const x = MS.x + (i % 2 ? 0.3 : -0.3), z = MS.z - 1.2 + i * 0.8; B(0.36, 0.03, 0.26, toon('#7a8088'), x, 0.84, z); C(0.05, 0.045, 0.1, toon('#e8e0c8'), x + 0.12, 0.9, z + 0.08, 8); }
  block(MS.x - 1.2, MS.x + 1.2, MS.z - 1.85, MS.z + 1.85);
  sign(['MESS', 'HOT TRAYS AT 0600'], 1.8, 0.55, AMB, hw - 0.18, 2.6, MS.z, -Math.PI / 2);
  // training mat + punching dummy (DRILL: it rocks back on its spring)
  const DM = MB.dummy; flat(3.4, 3.4, toon('#34404a'), DM.x, 0.015, DM.z); for (const [w, d, x, z] of [[3.4, 0.1, 0, -1.7], [3.4, 0.1, 0, 1.7], [0.1, 3.4, -1.7, 0], [0.1, 3.4, 1.7, 0]]) flat(w, d, basic(AMB), DM.x + x, 0.02, DM.z + z);
  C(0.4, 0.45, 0.15, dark, DM.x, 0.08, DM.z, 14); const dp = new THREE.Group(); dp.position.set(DM.x, 0.15, DM.z); g.add(dp);
  const leather = toon('#8a6a4a'); C(0.06, 0.06, 0.9, steel, 0, 0.45, 0, 8, dp); C(0.3, 0.3, 0.95, leather, 0, 1.35, 0, 14, dp); S(0.3, leather, 0, 1.82, 0, dp); S(0.22, toon('#9a7a5a'), 0, 2.25, 0, dp); B(0.95, 0.12, 0.12, toon('#6a4a2a'), 0, 1.6, 0, dp); C(0.31, 0.31, 0.06, dark, 0, 1.1, 0, 14, dp);
  circle(DM.x, DM.z, 0.6);
  let wob = 0, wobV = 0; anims.push(dt => { wobV += (-wob * 30 - wobV * 3) * dt; wob += wobV * dt; dp.rotation.x = wob; });
  let drilling = false;
  function drill(X) { if (drilling) return; drilling = true; for (let k = 0; k < 3; k++) setTimeout(() => { wobV -= 5; X.audio.tone(90, 0.15, 0.08, 'square', 0.5); }, k * 420);
    setTimeout(() => { drilling = false; const n = ((X.save.data.stats || {}).dsfDrills || 0) + 1; X.save.setStat('dsfDrills', n); X.note('DRILL', n === 1 ? 'HOLT: \u201CGood form. Again tomorrow.\u201D' : 'Drill ' + n + '. HOLT: \u201CYou are getting dangerous.\u201D'); }, 1500); }
  // UNIT-9's FLEET LIAISON POST (north-east alcove): empty cradle, painted foot pads, a dangling cable, a lamp that flickers
  const PT = MB.post, pf = toon('#3a3e44');
  for (const s of [-1, 1]) { B(0.2, 3.0, 1.6, wallM, PT.x + s * 1.0, 1.5, -hd + 0.8); B(0.06, 3.0, 0.06, basic(AMB), PT.x + s * 0.88, 1.5, PT.z + 0.02); } B(2.2, 0.2, 1.6, pf, PT.x, 3.0, -hd + 0.8);
  C(0.6, 0.7, 0.12, dark, PT.x, 0.06, -8.3, 18); for (const s of [-1, 1]) flat(0.32, 0.5, basic('#e8c45a'), PT.x + s * 0.28, 0.13, -8.3);
  B(0.04, 1.6, 0.04, dark, PT.x + 0.5, 2.1, -8.7); S(0.07, toon('#c9a24a'), PT.x + 0.5, 1.26, -8.7);
  const flM = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, toneMapped: false, transparent: true }); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.2), flM); fl.rotation.x = Math.PI / 2; fl.position.set(PT.x, 2.88, -8.3); g.add(fl);
  let fk = 0; anims.push(dt => { fk -= dt; if (fk < 0) { fk = rr(0.05, 0.6); flM.opacity = Math.random() < 0.3 ? 0.1 : 0.9; } });
  sign(['UNIT-9', 'FLEET LIAISON POST'], 2.0, 0.55, AMB, PT.x, 3.5, PT.z + 0.21);
  sign(['NO ORDER GIVEN', 'WHERE DID YOU GO?'], 0.9, 0.45, '#e8c45a', PT.x - 0.45, 1.6, -hd + 0.18, 0, '#2a2618');
  block(PT.x - 1.15, hw, -hd, PT.z + 0.2);
  // READY RACK by the door (south wall, west)
  B(4.0, 0.5, 0.1, wood, -5, 1.9, hd - 0.2); const helm = new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(helm, toon(i % 2 ? AMB : OLIVE)); m.position.set(-6.6 + i * 0.8, 2.0, hd - 0.4); m.castShadow = true; g.add(m); }
  sign(['READY RACK'], 1.6, 0.4, AMB, -5, 2.6, hd - 0.17, Math.PI); block(-7.2, -2.8, hd - 0.7, hd);
  R.lamps([[-4, -5], [4, -5], [-4, 1], [4, 1], [-4, 6], [4, 6]], '#ffe0b0'); R.motes(0xffe0b0, 24); R.hiring('NIGHT WATCH · ASK HOLT');
  spots.push({ key: 'milDummy', x: DM.x, z: DM.z + 1.7, r: 1.2, run: X => X.prompt('PUNCHING DUMMY', 'Training mat', [['DRILL · THREE STRIKES', () => drill(X)], ['NOT NOW', null]]) },
    { key: 'milPost', x: PT.x, z: PT.z + 1.6, r: 1.4, run: X => { X.audio.tone(220, 0.6, 0.03, 'sine', 0.7); X.note('UNIT-9 · LIAISON POST', 'The cradle is still warm. Last log, scratched on the frame: \u201Cthis is not my order.\u201D'); if (!X.save.flag('dsfUnit9')) X.save.setFlag('dsfUnit9'); } });
  return { g, anims, walk: R.walk, spots, drill };
}
