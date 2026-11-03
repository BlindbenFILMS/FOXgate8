// ARMORY [dsfArmory] interior (s352): gun-metal + safety orange. Quartermaster Drav (DRAFT name) behind the counter, the
// weapon wall (blades left, lasers right, the 8 shield in the middle), TARGET RANGE lane east (five shots, targets drop),
// GRINDSTONE west (sparks fly), the 8 ARMOUR stand, and a crate of SENTRY DRONES sent back from Pearl Sail (Machine Fleet hint).
import { roomKit } from './dsf-room-kit.js?v=352';
export const AB = { OX: 11400, hw: 9, hd: 8, h: 5.4, door: { x: 0, z: 7.2 }, enter: { x: 0, z: 4.6 }, hiring: { x: -7.0, z: 5.6 }, keeper: { x: 0, z: -4.9 }, range: { x: 6.6, z: 3.3 }, wheel: { x: -6.2, z: -1.4 }, crate: { x: -6.8, z: -6.3 } };
export function buildArmory(K) {
  const R = roomKit(K, AB), { THREE, g, anims, B, C, S, plane, flat, lit, sign, tex, canvas, FONT, toon, basic, rr, LOW, block, circle, spots, glowSprite } = R;
  const { hw, hd } = AB, OR = '#ff8a6a', steel = toon('#6a6e74'), dark = toon('#1e1e20'), bright = toon('#d8dde4'), gold = toon('#c9a24a'), wood = toon('#4a3a2a');
  const plate = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#3c3c3e'; c.fillRect(0, 0, w, w); c.fillStyle = '#4c4c4f'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.save(); c.translate(i * 64 + 32, j * 64 + 32); c.rotate((i + j) % 2 ? 0.8 : -0.8); c.fillRect(-18, -4, 36, 8); c.restore(); } c.strokeStyle = '#2a2a2c'; c.lineWidth = 4; c.strokeRect(0, 0, w, w); }), [hw / 2, hd / 2]);
  R.shell({ wall: '#2a2828', floor: plate, ceil: '#141414', trim: OR, title: ['ARMORY', 'SWORDS · LASERS · SHIELDS'] });
  const haz = tex(canvas(512, 32, (c, W, H) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, W, H); c.fillStyle = OR; for (let x = -32; x < W; x += 32) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + 16, 0); c.lineTo(x + 32, 0); c.lineTo(x + 16, H); c.fill(); } }), [4, 1]), hazM = toon('#ffffff', { map: haz });
  plane(hw * 2 - 0.4, 0.22, hazM, 0, 1.0, -hd + 0.17); for (const s of [-1, 1]) plane(hd * 2 - 0.4, 0.22, hazM, s * (hw - 0.17), 1.0, 0, -s * Math.PI / 2);
  // counter + a glass case with a laser in it
  B(6.4, 1.05, 1.1, dark, 0, 0.53, -3.6); B(6.6, 0.08, 1.3, steel, 0, 1.09, -3.6); B(6.6, 0.05, 0.05, basic(OR), 0, 1.0, -2.94); block(-3.3, 3.3, -4.2, -3.0);
  { const glass = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.2, depthWrite: false }); B(1.6, 0.5, 0.8, glass, 2.0, 1.38, -3.6); B(0.42, 0.14, 0.1, steel, 2.0, 1.26, -3.6); B(0.1, 0.2, 0.08, dark, 1.86, 1.16, -3.6); glowSprite(2.26, 1.26, -3.6, 0xff3b2f, 0.4, 0.6, g); }
  // weapon wall: blades left, lasers right, the 8 shield in the middle
  const wz = -hd + 0.2;
  B(3.4, 2.1, 0.06, toon('#3a2a1a'), -2.6, 2.5, wz);
  for (let i = 0; i < 5; i++) { const x = -3.9 + i * 0.65; B(0.08, 1.25, 0.03, bright, x, 2.75, wz + 0.08); B(0.4, 0.06, 0.08, gold, x, 2.1, wz + 0.08); B(0.07, 0.32, 0.07, toon('#3a2414'), x, 1.9, wz + 0.08); S(0.05, gold, x, 1.72, wz + 0.08); }
  B(3.4, 2.1, 0.06, toon('#2c3036'), 2.6, 2.5, wz);
  for (let i = 0; i < 6; i++) { const x = 1.6 + (i % 3) * 1.0, y = 3.0 - Math.floor(i / 3) * 0.9; B(0.5, 0.17, 0.09, steel, x, y, wz + 0.1); B(0.24, 0.07, 0.07, dark, x + 0.34, y + 0.03, wz + 0.1); B(0.11, 0.26, 0.09, dark, x - 0.14, y - 0.18, wz + 0.1); B(0.04, 0.04, 0.04, basic('#ff3b2f'), x + 0.47, y + 0.03, wz + 0.1); }
  sign(['BLADES'], 1.4, 0.4, OR, -2.6, 3.85, wz + 0.05); sign(['LASERS'], 1.4, 0.4, OR, 2.6, 3.85, wz + 0.05);
  const sh = tex(canvas(256, 256, (c, w) => { c.translate(w / 2, w / 2); c.fillStyle = '#c9d0d8'; c.beginPath(); c.arc(0, 0, 124, 0, 7); c.fill(); c.strokeStyle = OR; c.lineWidth = 18; c.beginPath(); c.arc(0, 0, 100, 0, 7); c.stroke(); c.fillStyle = '#201e1d'; c.font = `900 150px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', 0, 10); }));
  plane(1.5, 1.5, lit(sh), 0, 3.4, wz + 0.06);
  // the 8 ARMOUR stand (behind the counter line, west)
  { const x = -4.7, z = -6.6; B(0.9, 0.5, 0.6, dark, x, 0.25, z); C(0.05, 0.05, 1.0, steel, x, 0.95, z, 6); const pl = toon('#c9d0d8'); B(0.8, 0.75, 0.42, pl, x, 1.75, z); S(0.2, pl, x - 0.5, 2.02, z); S(0.2, pl, x + 0.5, 2.02, z); S(0.24, toon('#b9c0c8'), x, 2.4, z); plane(0.42, 0.42, lit(sh), x, 1.8, z + 0.22);
    sign(['8 ARMOUR', 'MADE TO FIT'], 0.86, 0.36, OR, x, 0.26, z + 0.31); block(x - 0.6, x + 0.6, z - 0.4, z + 0.4); }
  // TARGET RANGE (east lane): partition, shooting bench, three pop-up targets
  const RG = AB.range, lane0 = 4.3, lx = (lane0 + hw) / 2;
  B(0.2, 2.6, hd + 1.7, dark, lane0, 1.3, -hd + (hd + 1.7) / 2); flat(hw - lane0 - 0.2, hd + 1.5, toon('#242426'), lx, 0.01, -hd + (hd + 1.5) / 2);
  B(hw - lane0, 1.0, 0.5, dark, lx, 0.5, 1.8); B(hw - lane0, 0.06, 0.6, toon(OR), lx, 1.03, 1.8); block(lane0 - 0.15, hw, -hd, 2.05);
  sign(['TARGET RANGE', 'LANE 1 · FIVE SHOTS'], 2.6, 0.8, OR, lx, 3.2, 2.08);
  for (const z of [-5.5, -2.5]) { B(hw - lane0 - 0.4, 0.05, 0.12, basic('#ffe2c0'), lx, AB.h - 0.05, z); }
  const ring = tex(canvas(256, 256, (c, w) => { c.translate(w / 2, w / 2); for (let i = 5; i > 0; i--) { c.fillStyle = i % 2 ? '#f3f2f2' : OR; c.beginPath(); c.arc(0, 0, i * 24, 0, 7); c.fill(); } c.fillStyle = '#201e1d'; c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fill(); }));
  B(hw - lane0 - 0.2, 0.2, 0.3, dark, lx, 0.1, -6.8);
  const targets = [5.3, 6.65, 8.0].map(x => { const p = new THREE.Group(); p.position.set(x, 0.2, -6.8); g.add(p); C(0.03, 0.03, 1.2, steel, 0, 0.6, 0, 6, p); plane(0.8, 0.8, lit(ring), 0, 1.4, 0.03, 0, p); B(0.84, 0.84, 0.03, dark, 0, 1.4, 0, p); return { p, x, down: 0, a: 0 }; });
  const boltGeo = new THREE.BoxGeometry(0.05, 0.05, 0.6), boltM = new THREE.MeshBasicMaterial({ color: 0xff3b2f, toneMapped: false }), shots = [];
  let busy = false;
  function fire(X, i, hit) { const t = targets[i], m = new THREE.Mesh(boltGeo, boltM); g.add(m); shots.push({ m, t, hit, u: 0, x0: RG.x + rr(-0.1, 0.1), tx: t.x + (hit ? rr(-0.1, 0.1) : rr(0.5, 0.7) * (Math.random() < 0.5 ? -1 : 1)), X }); X.audio.tone(1400, 0.12, 0.04, 'square', 0.3); }
  anims.push(dt => { for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i]; s.u += dt * 2.6; const u = Math.min(1, s.u); s.m.position.set(s.x0 + (s.tx - s.x0) * u, 1.45, 1.5 + (-6.8 - 1.5) * u); if (u >= 1) { g.remove(s.m); shots.splice(i, 1); if (s.hit) { s.t.down = 1.6; s.X.audio.tone(620, 0.15, 0.05, 'triangle'); } } }
    for (const t of targets) { if (t.down > 0) t.down -= dt; t.a += ((t.down > 0 ? -Math.PI / 2 : 0) - t.a) * Math.min(1, dt * 9); t.p.rotation.x = t.a; } });
  function shoot(X) { if (busy) { X.toast('Still firing.'); return; } busy = true; let hits = 0;
    for (let k = 0; k < 5; k++) setTimeout(() => { const hit = Math.random() < 0.72; if (hit) hits++; fire(X, Math.floor(Math.random() * 3), hit); }, k * 520);
    setTimeout(() => { busy = false; const best = Math.max(hits, (X.save.data.stats || {}).dsfRangeBest || 0); X.save.setStat('dsfRangeBest', best); X.note('TARGET RANGE', hits + ' of 5 on target · best ' + best + '. DRAV: \u201C' + (hits >= 4 ? 'Clean. Very clean.' : hits >= 2 ? 'Not bad. Breathe out first.' : 'The wall thanks you.') + '\u201D'); }, 5 * 520 + 700); }
  function rangeMenu(X) { X.prompt('TARGET RANGE', 'Lane 1 · best ' + ((X.save.data.stats || {}).dsfRangeBest || 0) + ' of 5', [['FIRE FIVE SHOTS', () => shoot(X)]].concat(X.range ? [['PHASER RANGE · FULL ROUND', () => X.range()]] : []).concat([['NOT NOW', null]])); }
  // GRINDSTONE (west): the stone turns slowly; SHARPEN spins it fast and throws sparks toward you
  const WH = AB.wheel; B(0.9, 0.9, 0.6, dark, WH.x, 0.45, WH.z); for (const s of [-1, 1]) B(0.05, 0.5, 0.08, steel, WH.x + s * 0.14, 1.1, WH.z);
  const wp = new THREE.Group(); wp.position.set(WH.x, 1.35, WH.z); g.add(wp); C(0.45, 0.45, 0.16, toon('#8a8478'), 0, 0, 0, 20, wp).rotation.z = Math.PI / 2; B(0.17, 0.08, 0.06, toon('#5a554c'), 0, 0.42, 0, wp);
  sign(['GRINDSTONE', 'SHARPEN YOUR BLADE'], 1.8, 0.55, OR, -hw + 0.18, 2.6, WH.z, Math.PI / 2); circle(WH.x, WH.z, 0.7);
  const SN = LOW ? 16 : 40, sp = new Float32Array(SN * 3), sv = new Float32Array(SN * 3), sl = new Float32Array(SN); for (let i = 0; i < SN; i++) sp[i * 3 + 1] = -100;
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffc04a, size: 0.07, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sparks.position.copy(wp.position); sparks.frustumCulled = false; g.add(sparks);
  let sharpT = 0;
  anims.push(dt => { wp.rotation.x += (sharpT > 0 ? 18 : 0.6) * dt; if (sharpT > 0) sharpT -= dt;
    for (let i = 0; i < SN; i++) { if (sl[i] > 0) { sl[i] -= dt; sv[i * 3 + 1] -= 9.8 * dt; for (let k = 0; k < 3; k++) sp[i * 3 + k] += sv[i * 3 + k] * dt; if (sl[i] <= 0) sp[i * 3 + 1] = -100; }
      else if (sharpT > 0 && Math.random() < 0.4) { sp[i * 3] = rr(-0.05, 0.05); sp[i * 3 + 1] = -0.05; sp[i * 3 + 2] = 0.45; sv[i * 3] = rr(-1, 1); sv[i * 3 + 1] = rr(0.5, 2.5); sv[i * 3 + 2] = rr(1.5, 3.5); sl[i] = rr(0.3, 0.7); } }
    sg.attributes.position.needsUpdate = true; });
  function sharpen(X) { if (sharpT > 0) return; sharpT = 2.4; X.audio.tone(1800, 2.2, 0.03, 'sawtooth', 0.8); const n = ((X.save.data.stats || {}).dsfSharpened || 0) + 1; X.save.setStat('dsfSharpened', n); setTimeout(() => X.toast('Shhhhk. Your blade comes away bright. Drav nods.'), 2400); }
  // workbench (west wall)
  B(1.0, 0.95, 2.4, wood, -hw + 0.8, 0.48, 2.2); B(0.3, 0.25, 0.3, steel, -hw + 0.9, 1.08, 1.4); for (let i = 0; i < 4; i++) B(0.06, 0.04, 0.42, i % 2 ? steel : toon('#3a2414'), -hw + 0.65 + (i % 2) * 0.25, 0.98, 2.2 + i * 0.3).rotation.y = rr(-0.3, 0.3); block(-hw, -hw + 1.4, 0.9, 3.5);
  // SENTRY DRONES crate (north-west): sent back from Pearl Sail; the middle drone's eye flickers red → cyan
  const CR = AB.crate; B(2.0, 0.8, 1.4, toon('#4a4636'), CR.x, 0.4, CR.z); B(2.0, 0.08, 1.4, toon('#5a5444'), CR.x + 0.1, 0.72, CR.z - 1.0).rotation.x = -1.2;
  sign(['RETURNED · PEARL SAIL', 'SENTRY DRONES · DO NOT POWER'], 1.9, 0.5, OR, CR.x, 0.42, CR.z + 0.71, 0, '#2a2618');
  const eyes = []; for (let i = 0; i < 3; i++) { const x = CR.x - 0.6 + i * 0.6, z = CR.z + (i - 1) * 0.12; S(0.3, steel, x, 0.85, z); const em = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xff2a10 : 0x2a2a2c, toneMapped: false }); const e = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.07), em); e.position.set(x, 0.92, z + 0.3); g.add(e); eyes.push(em); }
  block(CR.x - 1.05, CR.x + 1.05, CR.z - 1.3, CR.z + 0.75);
  let real = 0, flick = 2;
  anims.push(dt => { flick -= dt; if (real > 0) real -= dt; else if (flick < 0) { real = 0.25; flick = rr(2, 5); } eyes[1].color.set(real > 0 ? 0x5fe3ff : 0xff2a10); });
  R.lamps([[-5, -2], [0, -1], [-5, 3.5], [2, 3.5], [lx, -4]], '#ffd8b0'); R.motes(0xffd8b0); R.hiring("ARMORER'S APPRENTICE · ASK DRAV");
  spots.push({ key: 'armRange', x: RG.x, z: RG.z, r: 1.3, run: X => rangeMenu(X) },
    { key: 'armWheel', x: WH.x, z: WH.z + 1.4, r: 1.2, run: X => X.prompt('GRINDSTONE', 'Armory', [['SHARPEN YOUR BLADE', () => sharpen(X)], ['NOT NOW', null]]) },
    { key: 'armCrate', x: CR.x, z: CR.z + 1.6, r: 1.4, run: X => { real = 2.2; X.audio.tone(140, 0.3, 0.05, 'square', 0.5); X.note('SENTRY DRONES', 'One eye flicks cyan: \u201C...we did not fire... it fired us...\u201D Then red again.'); if (!X.save.flag('dsfArmoryDrone')) X.save.setFlag('dsfArmoryDrone'); } });
  return { g, anims, walk: R.walk, spots, rangeMenu, sharpen };
}
