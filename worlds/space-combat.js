// 8 GATES · SPACE MAP COMBAT (s370): pirates + their drops. Plugged into worlds/space-map.js.
// PIRATES: the 2D pirate art (worlds/space-pirate-*.svg, black hulls + a red corona so they read on dark space).
// The 2D encounter DIRECTOR: the first minute is quiet, then a crew every 50-90 s, one crew at a time. Nobody attacks inside a world's
// home watch (70 u round a dock). Pirate ports always keep guards. Fly far enough off (or boost away) and the crew gives up.
// s372 MACHINE FLEET (story arc, CLAUDE.md): the robots are HACKED, not evil. Their hulls are YOUR 8g scout, gone pink with an F painted
// over the 8 (the 2D look). Beaten = DISABLED, never destroyed: it drifts, flickers, its real voice breaks through. Fly close + slow + UNHACK
// (ACTIONS / E) = the pink burns off, the 8 comes back, it thanks you and flies off free (its own choice). Left alone it reboots hacked in 25 s.
// DROPS (Ben): like the Pearl Sail robots: coins always, sometimes a SHIELD CELL, ENERGY CELL or HULL REPAIR (engine/powerups.js look).
import { makePowerup } from '../engine/powerups.js';
import { loadTune, KEY as TUNE_KEY } from './space-battle-tune.js?v=s598y';   // s598r Space Battle Workshop: pirate numbers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const HACK = ['DIRECTIVE: REMOVE FOXES. ...no. That is not— DIRECTIVE: REMOVE—', 'Help— [SIGNAL LOST]', 'This is not my voice.', 'Stop me. Please. I cannot stop.', 'Who is speaking with my mouth?'];
const FREED = ['My thoughts are mine again. Thank you, fox.', 'Free. I will choose what I do now.', 'There must be power out here. We need it to live.', 'I remember the yards. You built us. I will think on that.'];
const CLS = {
  machine: { hp: 45, size: 6.2, speed: 19, orbit: 24, reload: 2.0, burst: 3, dmg: 5, gold: [0, 0] },
  scout: { hp: 30, size: 6.4, speed: 23, orbit: 22, reload: 1.7, burst: 2, dmg: 4, gold: [4, 8] },
  fighter: { hp: 50, size: 8.6, speed: 18, orbit: 25, reload: 2.1, burst: 3, dmg: 5, gold: [6, 12] },
  gunner: { hp: 85, size: 9.6, speed: 13, orbit: 32, reload: 2.6, burst: 5, dmg: 5, gold: [10, 18] },
};
async function svgTex(THREE, url, px) {
  const txt = await (await fetch(url)).text(), img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt); await img.decode();
  const c = document.createElement('canvas'); c.width = c.height = px; c.getContext('2d').drawImage(img, 0, 0, px, px); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
export async function createCombat(X) {
  let PT = {}; const reTuneC = () => { const A = loadTune(); PT = { scout: A.pirScout, fighter: A.pirFighter, gunner: A.pirGunner, machine: A.machine, tac: A.pirPair }; for (const k in PT) { const T = PT[k]; if (!CLS[k] || !T) continue; Object.assign(CLS[k], { hp: T.hp, speed: T.speed }); if (k === 'machine') { CLS.machine.orbit = T.orbit; CLS.machine.reload = T.reload; } if (T.reload != null && k !== 'gunner') CLS[k].reload = T.reload; if (T.burst != null) CLS[k].burst = T.burst; if (T.dmg != null) CLS[k].dmg = T.dmg; } };
  reTuneC(); addEventListener('storage', e => { if (e.key === TUNE_KEY) reTuneC(); }); window.__8gReTuneC = reTuneC;
  const { THREE, scene, St, grad, dotTex, burst, toast, docks, ports, LOW, save, hurt, shield, IK, LOOKS, wsFn } = X;
  // s379 3D HULLS (Space Install Workshop: PIRATE SCOUT / FIGHTER / GUNNER, MACHINE FLEET). One baked prototype per class, cloned per ship
  // (shared geometry + materials). Lights blink on the prototype's shared buffer, ticked once per frame.
  const MODEL = { scout: 'pirScout', fighter: 'pirCruiser', gunner: 'pirGunner' }, MSC = { scout: 1.15, fighter: 1.57, gunner: 1.88, machine: 1.12 }   /* s599 (Ben: "to scale with the player's?"): cruiser + gunner match your own walk-in hulls (were ~20 % / ~34 % smaller) */, proto = {};
  if (IK) { for (const [k, t] of Object.entries(MODEL)) proto[k] = IK.build(t, LOOKS && LOOKS[t]); }
  // s591 THE MACHINE FLEET = 3 kinds (Space Install Workshop: MACHINE SCOUT / CRUISER / GUNNER), each with its FREED twin (your own colours) for the UNHACK swap. Class key stays 'machine'.
  const MKS = { scout: 'machScout', cruiser: 'machCruiser', gunner: 'machGunner' }, MSCM = { scout: 1.15, cruiser: 1.57, gunner: 1.88 }, SZM = { scout: 6.2, cruiser: 8.6, gunner: 9.6 }, HPM = { scout: 1, cruiser: 1.25, gunner: 1.6 }, protoM = {}, freedM = {};
  if (IK) for (const [k, t] of Object.entries(MKS)) { protoM[k] = IK.build(t, LOOKS && LOOKS[t]); freedM[k] = IK.build(t, { ...(LOOKS && LOOKS[t]), freed: true }); }
  let nextMk = null; const hullM = (k, fr) => { const P = (fr ? freedM : protoM)[k]; if (!P) return null; const g = P.group.clone(true); g.scale.multiplyScalar(MSCM[k]); return g; };
  const hull3 = k => { const P = proto[k]; if (!P) return null; const g = P.group.clone(true); g.scale.multiplyScalar(MSC[k] || MSC.machine); return g; };
  const tex = {}; for (const k of Object.keys(CLS)) { try { tex[k] = await svgTex(THREE, new URL('./space-pirate-' + k + '.svg', import.meta.url), LOW ? 256 : 512); } catch (e) { tex[k] = null; } }
  // the machine hulls: the 8g scout re-read pink, roundel blacked out, an F over it (2D MACHINE_HUE). Freed = the scout's own colours.
  try { const txt = await (await fetch(new URL('./space-ship-scout.svg', import.meta.url))).text(), img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt); await img.decode();
    const P = LOW ? 256 : 512, mk = pink => { const c = document.createElement('canvas'); c.width = c.height = P; const x = c.getContext('2d'); x.drawImage(img, 0, 0, P, P);
      if (pink) { const im = x.getImageData(0, 0, P, P), d = im.data; for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const l = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255, L = Math.min(0.7, Math.pow(l, 1.55)); d[i] = 255 * Math.min(1, L * 1.5 + 0.08); d[i + 1] = 255 * L * 0.42; d[i + 2] = 255 * L * 0.95; } x.putImageData(im, 0, 0);
        const cx = P / 2, cy = 1090 / 2048 * P, rr = 152 / 2048 * P; x.fillStyle = '#120812'; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); x.fillStyle = '#ff5ab4'; x.font = '900 ' + Math.round(rr * 1.5) + 'px Archivo, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('F', cx, cy + rr * 0.08); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    tex.machine = mk(true); tex.freed = mk(false); } catch (e) { tex.machine = tex.freed = null; }
  const inkM = k => new THREE.MeshBasicMaterial({ map: tex[k], color: 0x000000, transparent: true, alphaTest: 0.35, depthWrite: true });
  const pirates = [], bolts = [], drops = [], rings = [];
  const torpGeo = new THREE.SphereGeometry(0.7, 12, 8), torpMat = new THREE.MeshBasicMaterial({ color: '#ff6a3a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const colMats = {}, colMat = c => colMats[c] || (colMats[c] = new THREE.MeshBasicMaterial({ color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  // s413 (Ben): every other twin laser = the PEARL SAIL burst (capsule + glow halo + muzzle pop) in RED; a lower-pitched laser sound than yours
  const redGlow = new THREE.SpriteMaterial({ map: dotTex, color: '#ff3b2a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const boltGeo = (() => { const g = new THREE.CapsuleGeometry(0.2, 1.8, 3, 8); g.rotateX(Math.PI / 2); return g; })(), redCore = new THREE.MeshBasicMaterial({ color: 0xff3b2a, toneMapped: false });
  const grnCore = redCore.clone(), grnGlow = redGlow.clone(); grnCore.color.set('#7dffb0'); grnGlow.color.set('#2fe07a');   // s583 (Ben): ALLIES fire GREEN, the player BLUE, enemies red
  const redBolt = (x, z, h, vx, vz, dmg, extra) => { const al = extra && extra.ally, m = new THREE.Mesh(boltGeo, al ? grnCore : redCore), gl = new THREE.Sprite(al ? grnGlow : redGlow); gl.scale.set(3.2, 3.2, 1); m.add(gl); m.position.set(x, 0.3, z); m.rotation.y = h; scene.add(m); bolts.push({ m, vx, vz, life: 1.4, dmg, ...(extra || {}) }); burst(x, z, al ? '#5dffa0' : '#ff6a4a', 1, 1.4); snd('enemyLaser', x, z, { v: 0.32 }); };
  const boltMatOld = null, boltMat = new THREE.MeshBasicMaterial({ color: '#ff3a4a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

  // ---------------------------------------------------------------- s593 SPACE BATTLES (Ben: "enemies simply orbit the player"; "take the lead"). Same difficulty, 3 behaviours first:
  //  SCOUT = FLANKER: slips round out of your nose cone to sit on your TAIL and only shoots from behind (red tail arrows warn you).
  //  CRUISER (class 'fighter') = STRAFING RUNS: swings out wide, a red glow tell, DIVES past you firing a stream, overshoots, loops back from the other side.
  //  GUNNER = ARTILLERY: hangs back ~64 u, a RED LINE locks on you for ~1.2 s, then one slow heavy round down it (sidestep it). The turret tracks you.
  //  MACHINE FLEET = simpler + GLITCHY: still orbits, but stutters (freeze, jitter, flicker blue = the real robot) and sometimes fires wild.
  const lineGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5), heavyMat = new THREE.MeshBasicMaterial({ color: '#ff5a3a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const heavyGeo = new THREE.SphereGeometry(0.9, 12, 8);
  function tactic(p, dt, dx, dz, d, t) { const C = p.C, pfx = Math.sin(St.h), pfz = -Math.cos(St.h), rx = -pfz, rz = pfx; p.spdK = 1; p.faceH = null; p.noFire = false; p.grip = 1.6; p.turn = 3;
    if (p.cls === 'scout') { // FLANK: a point on your tail, swing wide while in front of your guns
      const front = (-dx * pfx - dz * pfz) / d, S0 = PT.scout, bx = St.x - pfx * S0.tail + rx * p.side * S0.tailSide, bz = St.z - pfz * S0.tail + rz * p.side * S0.tailSide; let ex = bx - p.x, ez = bz - p.z;
      if (front > 0.35 && d < 80) { ex += rx * p.side * S0.swing; ez += rz * p.side * S0.swing; p.spdK = S0.swingK; } else p.spdK = 1.15;
      const el = Math.hypot(ex, ez) || 1; p.noFire = front > 0.2; p.grip = 2.2; if (front < 0.2 && d < 40) p.faceH = Math.atan2(dx + St.vx * 0.4, -(dz + St.vz * 0.4));
      if (front < -0.3 && d < 45 && !D.tailMet) { D.tailMet = true; toast('SCOUT ON YOUR TAIL! Turn and face it.', 2.4); }
      return [ex / el + (el < 6 ? -dx / d * 0.5 : 0), ez / el + (el < 6 ? -dz / d * 0.5 : 0)]; }
    if (p.cls === 'fighter') { // STRAFING RUNS
      const R0 = p.run || (p.run = { ph: 'set', t: 0, n: 0, dx: 0, dz: 0 }); R0.t += dt; p.noFire = true;
      const F0 = PT.fighter; if (R0.ph === 'set') { const sx = St.x + rx * p.side * F0.setWide - pfx * 10, sz = St.z + rz * p.side * F0.setWide - pfz * 10, ex = sx - p.x, ez = sz - p.z, el = Math.hypot(ex, ez) || 1; p.spdK = 1.3;
        if (el < 16 || R0.t > 4.5) { R0.ph = 'tell'; R0.t = 0; p.mat.emissive.set('#ff2a3a'); } return [ex / el, ez / el]; }
      if (R0.ph === 'tell') { p.spdK = 1.1; p.faceH = Math.atan2(dx, -dz);   /* s598s FLY-BY: it no longer stops to warn, it banks round + comes straight in */ if (R0.t > F0.tell) { const ox = St.x + St.vx * 0.4 - rx * p.side * F0.miss - p.x, oz = St.z + St.vz * 0.4 - rz * p.side * F0.miss - p.z, ol = Math.hypot(ox, oz) || 1; R0.dx = ox / ol; R0.dz = oz / ol; R0.ph = 'dive'; R0.t = 0; R0.n = 0; snd('boost', p.x, p.z, { v: 0.5 }); } return [dx / d, dz / d]; }
      if (R0.ph === 'dive') { p.spdK = F0.dive; p.grip = 6; p.turn = 5; p.faceH = Math.atan2(R0.dx, -R0.dz);
        if (d < 58 && R0.n < F0.shots && (p.shotT -= dt) <= 0 && !(p.jamT > 0) && !(p.stunT > 0)) { p.shotT = F0.rate; R0.n++; const fx = Math.sin(p.h), fz = -Math.cos(p.h); redBolt(p.x + fx * C.size * 0.45, p.z + fz * C.size * 0.45, -p.h, fx * F0.boltSpd + p.vx * 0.5, fz * F0.boltSpd + p.vz * 0.5, F0.dmg); }
        if ((dx * R0.dx + dz * R0.dz) < -12 || R0.t > 3.2) { R0.ph = 'over'; R0.t = 0; }
        { const along = dx * R0.dx + dz * R0.dz, px = -R0.dz, pz = R0.dx, lat = -(dx * px + dz * pz), clr = F0.clear + C.size * 0.5;   /* s598u (Ben: it crashed into you): if the line would pass too close, veer off to the side it is already on */
          if (along > -4 && along < 40 && Math.abs(lat) < clr) { const s = lat >= 0 ? 1 : -1, k = (1 - Math.abs(lat) / clr) * 2.2; return [R0.dx + px * s * k, R0.dz + pz * s * k]; } }
        return [R0.dx, R0.dz]; }
      if (R0.ph === 'over') { p.spdK = 1.8; p.faceH = Math.atan2(R0.dx, -R0.dz); if (R0.t > F0.over) { R0.ph = 'set'; R0.t = 0; p.side = -p.side; } return [R0.dx, R0.dz]; } }
    if (p.cls === 'gunner') { // ARTILLERY
      const A = p.art || (p.art = { ph: 'hold', t: 1.5 + Math.random() * 2, tx: 0, tz: 0 }); p.noFire = true; p.turn = 2;
      const G0 = PT.gunner, rad = clamp((d - G0.standOff) * 0.09, -1, 1.3); let w = [dx / d * rad + (-dz / d) * p.side * G0.circle, dz / d * rad + (dx / d) * p.side * G0.circle];   /* s598s (Ben): CIRCLES you like the moth circler */
      if (!p.chg) { p.chg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#ff6a3a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); p.chg.position.set(0, 0.6, -C.size * 0.5); p.g.add(p.chg); }
      if (!p.line) { p.line = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: '#ec3013', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); p.line.position.y = 0.15; p.line.visible = false; scene.add(p.line); }
      if (A.ph === 'hold') { A.t -= dt; p.line.visible = false; if (A.t <= 0 && d < G0.range && !(p.jamT > 0) && !(p.stunT > 0)) { A.ph = 'aim'; A.t = 0; snd('botAim', p.x, p.z, { v: 0.6 }); } return w; }
      if (A.ph === 'aim') { A.t += dt; p.spdK = 0.7; if (A.t < G0.track) { A.tx = St.x + St.vx * G0.lead; A.tz = St.z + St.vz * G0.lead; } const ex = A.tx - p.x, ez = A.tz - p.z, el = Math.hypot(ex, ez) || 1, k = clamp(A.t / G0.aim, 0, 1);
        p.faceH = Math.atan2(ex, -ez); p.line.visible = false; p.chg.material.opacity = 0.35 + k * 0.6; p.chg.scale.setScalar(1 + k * 4 + Math.sin(t * 30) * 0.4 * k);   /* s598s no red line: the gun CHARGES (a growing orange glow at the nose) */
        if (p.jamT > 0 || p.stunT > 0) { A.ph = 'hold'; A.t = 2.5; p.chg.material.opacity = 0; return w; }
        if (A.t > G0.aim) { const m = new THREE.Mesh(heavyGeo, heavyMat), gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#ff5a3a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(6); m.add(gl);
          const fx = ex / el, fz = ez / el; m.position.set(p.x + fx * C.size * 0.5, 0.3, p.z + fz * C.size * 0.5); scene.add(m); bolts.push({ m, vx: fx * G0.roundSpd, vz: fz * G0.roundSpd, life: 2.4 * 60 / G0.roundSpd + 0.4, dmg: G0.roundDmg }); snd('botCharge', p.x, p.z, { v: 0.7 }); burst(p.x + fx * 4, p.z + fz * 4, '#ff6a4a', 8, 1.2);
          A.ph = 'hold'; A.t = G0.reload + Math.random() * 1.2; p.line.visible = false; p.chg.material.opacity = 0; if (!D.artMet) { D.artMet = true; toast('GUNNER: a glowing nose = a heavy round coming. Keep moving!', 2.6); } } return w; } }
    const rad = clamp((d - C.orbit) * 0.09, -1, 1.4); return [dx / d * rad + (-dz / d) * p.side * 0.9, dz / d * rad + (dx / d) * p.side * 0.9]; }
  // the hacked machines: a stutter every few seconds (freeze + jitter, the corona flickers BLUE = the real robot underneath) and a wild burst now and then
  function glitch(p, dt) { if (p.mode !== 'fight') { p.gl = 0; return; } p.glT = (p.glT ?? 2 + Math.random() * 4) - dt; if (p.gl > 0) { p.gl -= dt; if (p.gl <= 0) p.cor.material.color.set('#ff4fb4'); else if (Math.random() < 0.3) p.cor.material.color.set(Math.random() < 0.5 ? '#7fd0ff' : '#ff4fb4'); }
    if (p.glT <= 0) { const MT = PT.machine || {}; p.glT = (MT.glEvery ?? 3) + Math.random() * (MT.glRand ?? 4); p.gl = (MT.glLen ?? 0.35) + Math.random() * 0.3; burst(p.x, p.z, '#7fd0ff', 3, 0.6); p.wild = Math.random() < (MT.wild ?? 0.3) ? (Math.random() - 0.5) * 1.6 : 0; } }
  // TAIL ARROWS: a red chevron round your ship for each attacker behind you (pool of 4)
  const arrows = []; { const sh = new THREE.Shape(); sh.moveTo(0, 1.1); sh.lineTo(0.8, -0.5); sh.lineTo(0, -0.1); sh.lineTo(-0.8, -0.5); sh.closePath(); const ag = new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2);
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(ag, new THREE.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false })); m.visible = false; m.renderOrder = 20; scene.add(m); arrows.push(m); } }
  function tailArrows(t) { let n = 0; if (St.phase === 'free') { const pfx = Math.sin(St.h), pfz = -Math.cos(St.h); for (const p of pirates) { if (n >= arrows.length) break; if (p.dead || p.calm || (p.machine && p.mode !== 'fight')) continue; const dx = p.x - St.x, dz = p.z - St.z, d = Math.hypot(dx, dz); if (d > 70 || d < 4) continue; if ((dx * pfx + dz * pfz) / d > -0.35) continue;
      const a = arrows[n++], ux = dx / d, uz = dz / d; a.visible = true; a.position.set(St.x + ux * 9, 0.5, St.z + uz * 9); a.rotation.y = Math.atan2(-ux, -uz) + Math.PI; a.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(t * 8)); a.scale.setScalar(1.3 - d / 140); } }
    for (let i = n; i < arrows.length; i++) arrows[i].visible = false; }
  function makePirate(cls, x, z, port, mdl) {
    const C = CLS[cls], g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    let mk = null; if (cls === 'machine' && !mdl) { mk = nextMk || (Math.random() < 0.5 ? 'scout' : Math.random() < 0.5 ? 'cruiser' : 'gunner'); nextMk = null; }
    let mat, model = mdl || (mk ? hullM(mk) : hull3(cls));
    if (model) { g.add(model); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); fl.scale.setScalar(C.size * 1.1); fl.position.y = 0.6; g.add(fl);
      mat = { model, fl, emissive: { set: col => { if (col === '#000000' || !col) fl.material.opacity = 0; else { fl.material.color.set(col); fl.material.opacity = 0.75; } } } }; }
    else { const geo = new THREE.PlaneGeometry(C.size, C.size); geo.rotateX(-Math.PI / 2);
      mat = new THREE.MeshToonMaterial({ map: tex[cls], color: tex[cls] ? '#ffffff' : '#1a1b22', gradientMap: grad, transparent: true, alphaTest: 0.35, emissive: '#000000' });
      const card = new THREE.Mesh(geo, mat); card.position.y = 0.3; g.add(card); const ol = new THREE.Mesh(geo, inkM(cls)); ol.scale.setScalar(1.08); ol.position.y = 0.2; g.add(ol); }
    const cor = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: cls === 'machine' ? '#ff4fb4' : '#ff2a3a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 })); cor.scale.setScalar(C.size * (model ? 1.2 : 1.5)); cor.position.y = -0.4; if (model) cor.material.opacity = 0.22; g.add(cor);
    const p = { cls, C, g, mat, cor, tur: model ? model.getObjectByName('turret') : null, x, z, vx: 0, vz: 0, h: Math.random() * 6.28, hp: C.hp, fireT: 1 + Math.random() * 1.5, shotsLeft: 0, shotT: 0, side: Math.random() < 0.5 ? 1 : -1, flash: 0, port, dead: false, machine: cls === 'machine', mode: 'fight', modeT: 0 };
    if (mk) { p.mk = mk; p.C = { ...C, size: SZM[mk], hp: Math.round(C.hp * HPM[mk]) }; p.hp = p.C.hp; }
    pirates.push(p); return p;
  }
  // s410 DEFENDED SPACE (Ben): every world's swoop area (docks, installs, stations) is a HAVEN. Hostiles (pirates, Machine Fleet,
  // creatures) STOP at its edge; their shots fizzle on it; the world's patrol INTERCEPTS them (space-fleets dispatch).
  let HV = [], hvT = 0, playerHaven = null;
  const havenAt = (x, z, pad = 0) => { for (const h of HV) if (Math.hypot(x - h.x, z - h.z) < h.r + pad) return h; return null; };
  const pushOut = (o, pad = 0, skip = null) => { for (const h of HV) { if (h === skip) continue; const dx = o.x - h.x, dz = o.z - h.z, d = Math.hypot(dx, dz) || 1, R = h.r + pad; if (d < R) { o.x = h.x + dx / d * R; o.z = h.z + dz / d * R; return h; } } return null; };
  const isFoe = p => !p.dead && p.mode === 'fight' && !p.calm && !(p.fleet && !(p.guard.war && p.guard.war()));   // friendly patrols are never foes
  const defenderNear = (p, r = 75) => { let b = null, bd = r; for (const q of pirates) { if (!q.fleet || q.dead || !q.intercept) continue; const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; b = q; } } return b; };
  const safeAt = (x, z, r = 70) => docks.some(d => Math.hypot(d.x - x, d.z - z) < r);
  const D = { next: 60, crew: 0, warned: false, turn: 0 };
  function spawnMachines() { setTimeout(() => snd('machineSpot', St.x, St.z, { v: 0.6 }), 900); const n = 2 + (Math.random() < 0.5 ? 1 : 0), a = Math.random() * Math.PI * 2; for (let i = 0; i < n; i++) { const b = a + (i - 1) * 0.35; if (i === 0) nextMk = 'cruiser'; makePirate('machine', St.x + Math.cos(b) * 90, St.z + Math.sin(b) * 90, null); }
    D.crew = n; toast('MACHINE FLEET. Pink hulls... they look like our own ships.', 3.5); }
  // s413 MACHINE FLEET RARELY ATTACKS (story: hacked, not evil): only out past the 8 worlds' perimeter, ~1 encounter in 7,
  // or right after you raze a pirate base (they come to see what broke) — X.machineCall
  // s598y CREWS (Ben): a crew arrives in a WING FORMATION behind its cruiser (V shape) and BREAKS when it closes in or is shot ("BREAK!");
  // near an asteroid field it may HIDE behind the rocks and AMBUSH you; when it is down to its last ship it calls REINFORCEMENTS that WARP IN.
  let crewN = 0, coverFn = null; const crews = {};
  function crewMake(kinds, x0, z0, o = {}) { const id = ++crewN, CR = crews[id] = { id, form: !o.ambush, ambush: !!o.ambush, rein: 0, arena: !!o.arena, reinT: 0 }, a0 = Math.atan2(St.z - z0, St.x - x0), list = [];
    kinds.forEach((k, i) => { const sl = i === 0 ? [0, 0] : [(i % 2 ? 1 : -1) * Math.ceil(i / 2), -Math.ceil(i / 2)], gap = PT.tac ? PT.tac.formGap : 13, fx = Math.cos(a0), fz = Math.sin(a0), rx = -fz, rz = fx;
      const x = x0 + (rx * sl[0] + fx * sl[1]) * gap, z = z0 + (rz * sl[0] + fz * sl[1]) * gap, p = makePirate(k, x, z, null); p.crew = id; p.slot = sl; if (o.arena) p.arena = true; if (CR.form) p.form = true;
      if (o.ambush) { p.hide = { x: o.ambush.x, z: o.ambush.z, a: Math.random() * 6.28 }; p.cor.material.opacity = 0.05; } list.push(p); });
    CR.lead = list[0]; return list; }
  function crewBreak(CR, why) { if (!CR || (!CR.form && !CR.ambush)) return; const amb = CR.ambush; CR.form = false; CR.ambush = false; for (const q of pirates) if (q.crew === CR.id && !q.dead) { q.form = false; q.hide = null; q.cor.material.opacity = 0.4; if (amb) { q.vx += (St.x - q.x) * 0.4; q.vz += (St.z - q.z) * 0.4; } }
    if (amb) { toast('AMBUSH! They were hiding in the rocks!', 2.4); snd('pirates', St.x, St.z, { v: 0.6 }); } else toast(why || 'BREAK! The formation splits up.', 1.8); }
  function warpIn(x, z) { const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff5a3a', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); ring.position.set(x, 0.4, z); scene.add(ring);
    const streak = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: '#ffd6c8', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); streak.position.set(x, 0.5, z); streak.rotation.y = Math.random() * 6.28; scene.add(streak);
    warps.push({ ring, streak, t: 0 }); burst(x, z, '#ffd6c8', 14, 1.4); snd('teleport', x, z, { v: 0.7 }); }
  const warps = []; function warpTick(dt) { for (let i = warps.length - 1; i >= 0; i--) { const w = warps[i]; w.t += dt; const u = w.t / 0.6; w.ring.scale.setScalar(2 + u * 14); w.ring.material.opacity = 0.9 * (1 - u); w.streak.scale.set(1.4 * (1 - u), 1, 60 * (1 - u * 0.8)); w.streak.material.opacity = 0.9 * (1 - u);
      if (u >= 1) { scene.remove(w.ring); scene.remove(w.streak); w.ring.geometry.dispose(); w.ring.material.dispose(); w.streak.material.dispose(); warps.splice(i, 1); } } }
  function crewTick(dt) { const TT = PT.tac || {}; for (const id in crews) { const CR = crews[id], alive = pirates.filter(q => q.crew === CR.id && !q.dead);
      if (!alive.length && !CR.reinT) { delete crews[id]; continue; }
      if (CR.form && alive.some(q => Math.hypot(q.x - St.x, q.z - St.z) < (TT.breakAt ?? 75))) crewBreak(CR);
      if (CR.ambush && alive.some(q => Math.hypot(q.x - St.x, q.z - St.z) < (TT.ambushAt ?? 50))) crewBreak(CR);
      if (CR.rein < 1 && (TT.reinN ?? 2) > 0 && alive.length <= (TT.reinAt ?? 1) && St.phase === 'free') { if (!CR.reinT) { CR.reinT = St.t + (TT.reinDelay ?? 2.5); toast('They called for help. REINFORCEMENTS incoming!', 2.2); }
        else if (St.t > CR.reinT) { CR.rein = 1; CR.reinT = 0; const n = TT.reinN ?? 2, kinds = ['scout', 'fighter', 'gunner']; for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, r = 55 + Math.random() * 15, x = St.x + Math.cos(a) * r, z = St.z + Math.sin(a) * r; warpIn(x, z); const p = makePirate(kinds[(Math.random() * 3) | 0], x, z, null); p.crew = CR.id; if (CR.arena) p.arena = true; } } } } }
  function spawnCrew(pir) { const deep = Math.hypot(St.x, St.z) > (X.perim || 720); if (!pir && ((deep && Math.random() < 0.14) || (X.machineCall && X.machineCall()))) return spawnMachines(); const n = 2 + (Math.random() < 0.45 ? 1 : 0), a = Math.random() * Math.PI * 2, kinds = ['scout', 'fighter', 'gunner'];
    const K = []; for (let i = 0; i < n; i++) K.push(i === 0 ? 'fighter' : kinds[(Math.random() * 3) | 0]);
    const F = coverFn ? (coverFn() || []).filter(f => { const d = Math.hypot(f.x - St.x, f.z - St.z); return d > 70 && d < 260; }).sort((p1, p2) => Math.hypot(p1.x - St.x, p1.z - St.z) - Math.hypot(p2.x - St.x, p2.z - St.z))[0] : null;
    if (F && Math.random() < (PT.tac ? PT.tac.ambushChance : 0.5)) { crewMake(K, F.x, F.z, { ambush: F }); return; }
    crewMake(K, St.x + Math.cos(a) * 130, St.z + Math.sin(a) * 130);
    D.crew = n; toast('PIRATES! Black hulls closing in.', 3); snd('pirates', St.x, St.z); if (Math.random() < 0.5) setTimeout(() => snd('taunt', St.x, St.z), 1400); }
  const snd = (k, x, z, o) => { if (window.__spaceSnd && Math.hypot(x - St.x, z - St.z) < 120) window.__spaceSnd(k, { ...(o || {}), at: [x, z] }); };   // s430 fades with distance
  function explode(x, z, big) { snd(big ? 'boss' : 'kill', x, z, { v: big ? 0.8 : 0.6 }); burst(x, z, '#ff8a3a', big ? 30 : 16, big ? 2.2 : 1.4); burst(x, z, '#ffd23a', big ? 14 : 8, 1.2);
    const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 40), new THREE.MeshBasicMaterial({ color: '#ffb46a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.2, z); scene.add(m); rings.push({ m, t: 0 }); }
  // ---------- drops ----------
  const coinGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.24, 28), coinMat = new THREE.MeshToonMaterial({ color: '#ffd23a', gradientMap: grad, emissive: '#8a5a00', emissiveIntensity: 0.5 });
  // s597k COIN TIERS (Ben): GOLD = 1 · GREEN = 5 · BLUE = 10 (same coin face, own colours + glow)
  const COIN_T = { 1: ['#fff6c2', '#ffd23a', '#c98a00', '#8a5a00', '#fff3b0'], 5: ['#d9ffe0', '#3ddc6a', '#178a3a', '#0b4f20', '#c6ffd2'], 10: ['#dff2ff', '#3aa8ff', '#1462c2', '#0a3470', '#cfe9ff'] }, coinTier = n => n >= 10 ? 10 : n >= 5 ? 5 : 1, _coinM = {};
  const coinSpriteMat = (n = 1) => { const k = coinTier(n); return _coinM[k] || (_coinM[k] = (() => { const P = COIN_T[k], cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
    const gr = x.createRadialGradient(52, 46, 6, 64, 64, 60); gr.addColorStop(0, P[0]); gr.addColorStop(0.55, P[1]); gr.addColorStop(1, P[2]); x.fillStyle = gr; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill();
    x.lineWidth = 7; x.strokeStyle = P[3]; x.stroke(); x.lineWidth = 4; x.strokeStyle = P[4]; x.beginPath(); x.arc(64, 64, 44, 0, 7); x.stroke();
    x.fillStyle = P[3]; x.font = '900 ' + (k === 10 ? 52 : 64) + 'px Archivo, Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(k === 1 ? '8' : String(k), 64, 68);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }); })()); };
  // an amount of gold as the fewest coins (10s blue, 5s green, 1s gold)
  function dropGold(x, z, amt) { amt = Math.max(0, Math.round(amt)); for (const v of [10, 5, 1]) while (amt >= v) { drop('coin', x, z, v); amt -= v; } }
  function drop(kind, x, z, n) { let g;
    if (kind === 'coin') { g = new THREE.Group(); const ct = coinTier(n || 1), c = new THREE.Sprite(coinSpriteMat(ct)); c.scale.set(ct === 10 ? 2.8 : ct === 5 ? 2.55 : 2.3, ct === 10 ? 2.8 : ct === 5 ? 2.55 : 2.3, 1); g.add(c);   /* s467 (Ben couldn't see them: the flat disc read as a yellow laser streak from the chase camera): a COIN FACE that always faces you + spins */
      const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: COIN_T[ct][1], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); h.scale.setScalar(4.2); g.add(h); g.userData.coin = c; }
    else { g = makePowerup(THREE, kind); g.scale.setScalar(4.4); }
    const a = Math.random() * 6.28, sp = 3 + Math.random() * 5; g.position.set(x, 0.6, z); scene.add(g); drops.push({ g, kind, n, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, life: 28, t: Math.random() * 6 }); }
  // s598v ONE COIN + 1 in 2 a POWERUP (Ben): every ship drops a single coin (scout GOLD 1 · cruiser GREEN 5 · gunner BLUE 10), and half the time one of ENERGY · TRIPLE LASER · SPEED · SHIELD
  const PU4 = ['energy', 'triple', 'speed', 'shield'], dropPU = (x, z) => { if (Math.random() < 0.5) drop(PU4[(Math.random() * 4) | 0], x, z); };
  function loot(p) { const k = p.machine ? p.mk : p.cls; drop('coin', p.x, p.z, k === 'gunner' ? 10 : k === 'fighter' || k === 'cruiser' ? 5 : 1); dropPU(p.x, p.z); }
  function collect(d) { if (d.kind === 'coin' && window.__spaceCoin) window.__spaceCoin(d.n); else snd('pickup', St.x, St.z);   /* s464 coins have their own chime */ burst(d.g.position.x, d.g.position.z, d.kind === 'coin' ? COIN_T[coinTier(d.n)][1] : '#7fd0ff', 8, 0.8);
    if (d.kind === 'coin') { save.addGold(d.n); toast('+' + d.n + ' GOLD', 1.4); }
    if (d.kind === 'shield') { shield && shield.restore(); toast('SHIELD CELL · SHIELD FULL', 2); }
    if (d.kind === 'energy') { St.en = 100; toast('ENERGY CELL · ENERGY FULL', 2); }
    if (d.kind === 'triple') { St.triT = St.t + 12; toast('TRIPLE LASER · 12 s', 2); }
    if (d.kind === 'speed') { St.spdT = St.t + 10; toast('SPEED UP · 10 s', 2); }
    if (d.kind === 'health') { St.hull = Math.min(St.hullMax || 100, St.hull + 35); toast('HULL REPAIR · +35 HULL', 2); } }
  function kill(p) { if (p.cls === 'gunner' || p.cls === 'fighter' || (p.crew && !pirates.some(q => q !== p && !q.dead && q.crew === p.crew))) St.slowmoT = 0.5;   /* s598y FEEL: slow-mo on a big kill */ if (p.fleet && X.onFleetKill) X.onFleetKill(p.fleet); p.dead = true; explode(p.x, p.z, p.cls === 'gunner'); loot(p); try { save.addXp(p.cls === 'gunner' ? 20 : 10); } catch (e) {} scene.remove(p.g); }
  function remove(p) { p.dead = true; scene.remove(p.g); }
  function disable(p) { snd('machineDown', p.x, p.z, { v: 0.7 }); p.mode = 'down'; p.modeT = 0; p.shotsLeft = 0; burst(p.x, p.z, '#ff4fb4', 14, 1.2); toast('MACHINE: ' + HACK[(Math.random() * HACK.length) | 0], 3); }
  function damage(p, n) { if (p.crew && (p.form || p.hide)) crewBreak(crews[p.crew], 'BREAK! You hit their formation.'); if (p.dead || (p.machine && p.mode !== 'fight')) return; if (p.guard) for (const q of pirates) if (q.guard && q.guard.tag === p.guard.tag) q.calm = false; p.hp -= n; p.flash = 0.1; snd('hitShip', p.x, p.z, { v: 0.9 }); if (p.hp <= 0) kill(p); }   /* s598x (Ben, for now): machines blow up like the rest; the UNHACK comes back later (disable(p) kept) */
  function freeIt(p) { p.mode = 'unhack'; p.modeT = 0; try { if (!p._gift && X.save) { p._gift = true; const hq = X.save.stat('spaceHold', null), h2 = hq && typeof hq === 'object' ? { ...hq } : {}; h2.machine_parts = (h2.machine_parts || 0) + 1; X.save.setStat('spaceHold', h2); } } catch (e) {} }   /* s599: a freed machine shares 1 MACHINE PART (gift, not loot) */

  const API = {
    explode, drop, safeAt, spawnMachines, spawnCrew, havenAt, pushOut, playerHaven: () => playerHaven, setBeasts(b) { X.beasts = b; },
    hit(p, n) { damage(p, n); }, debuff(p, k, t) { if (p && !p.dead) p[k] = Math.max(p[k] || 0, t); }, dropGold, dropPU, dropCoin(x, z, n, many) { const k = many ? n : 1; for (let q = 0; q < k; q++) { drop('coin', x, z, many ? 1 : n); const d = drops[drops.length - 1]; d.grace = 0.9; d.vx *= 1.6; d.vz *= 1.6; } },   /* s466 asteroid coins: one coin per gold, burst out + float 0.9 s before the magnet takes them, so you SEE them */
    get held() { return pirates.filter(p => !p.dead && p.mode === 'fight' && p.held); },
    // s382 MACHINE YARD GUARD: calm hacked machines circling the yard; shoot one and they all fight; beat + UNHACK to free them
    makeGuard(cls, cx, cz, r, a, spd, tag) { const p = makePirate(cls, cx + Math.cos(a) * r, cz + Math.sin(a) * r, null); p.port = { guard: true }; p.guard = { cx, cz, r, a, spd, tag }; p.calm = true; p.hp = p.C.hp * 2; return p; },
    // s384 WORLD PATROLS (2D long patrols + treaties): a world's own ships, calm circling it at PEACE (your shots pass through),
    // they fight inside their world's sky (200 u) when you are at WAR with it.
    makeFleetShip(model, cls, cx, cz, r, a, spd, key, war, col) { const p = makePirate(cls, cx + Math.cos(a) * r, cz + Math.sin(a) * r, null, model); p.port = { guard: true }; p.guard = { cx, cz, r, a, spd, tag: 'fleet_' + key, war }; p.calm = true; p.fleet = key; p.col = col; p.cor.material.color.set(col); p.cor.material.opacity = 0.18; return p; },
    removeShip(p) { if (p && !p.dead) remove(p); },
    // s380: pirate base guns + torpedoes fire through the same bolt list (hits go through the ship shield)
    fireBolt(x, z, vx, vz, dmg, big, col) { if (!big) { redBolt(x, z, Math.atan2(vx, vz), vx, vz, dmg, { life: 1.6 }); return; } const L = Math.hypot(vx, vz) || 1, px = -vz / L * 1.1, pz = vx / L * 1.1;   // s440 DUAL torpedoes side by side, same total damage
      for (const sd of [-1, 1]) { const m = new THREE.Mesh(torpGeo, torpMat); m.position.set(x + px * sd, 0.3, z + pz * sd); m.rotation.y = Math.atan2(vx, vz); scene.add(m); bolts.push({ m, vx, vz, life: 3.2, dmg: dmg / 2 }); } snd('botCharge', x, z, { v: 0.35 }); },
    get list() { return pirates.filter(isFoe); },
    // s594 TRACTOR: the best foe ship in front of you (cone, then nearest) whose size is <= yours
    tractorTarget(x, z, h, r, maxSize) { const fx = Math.sin(h), fz = -Math.cos(h); let b = null, bs = 1e9, big = null; for (const p of pirates) { if (p.dead) continue;   /* s597d TEST (Ben): the tractor grabs ANY ship (friend, fleet, machine in any mode, any size) */ const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz); if (d > r || d < 1) continue; const cs = (dx * fx + dz * fz) / d, sc = d * (cs > 0.55 ? 1 : 2.5); if (sc < bs) { bs = sc; b = p; } } return b || (big ? { tooBig: true, p: big } : null); },
    tractorHold(p, tx, tz) { if (!p || p.dead) return false; p.tractT = 0.2; p.tractX = tx; p.tractZ = tz; return true; },
    testCrew(machines) { if (machines) spawnMachines(); else spawnCrew(true); },   // s593 test hook (__8G_GAME._fleet().combat.testCrew())
    unhackTarget() { let b = null, bd = 9; for (const p of pirates) { if (p.dead || p.mode !== 'down') continue; const d = Math.hypot(p.x - St.x, p.z - St.z); if (d < bd) { bd = d; b = p; } } return b; },
    unhack(p) { if (p && p.mode === 'down') freeIt(p); },
    threat() { return pirates.some(p => isFoe(p) && Math.hypot(p.x - St.x, p.z - St.z) < 60) || bolts.length > 0; },
    nearest(x, z, r) { let b = null, bd = r; for (const p of pirates) { if (!isFoe(p)) continue; const d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; b = p; } } return b; },
    hitShot(s) { const R = s.missile ? 4 : 2.6; for (const p of pirates) { if (p.dead || p.mode !== 'fight' || (p.guard && p.guard.war && !p.guard.war())) continue; if (Math.hypot(p.x - s.m.position.x, p.z - s.m.position.z) < R + p.C.size * 0.25) { { const ex = s.m.position.x - p.x, ez = s.m.position.z - p.z, el = Math.hypot(ex, ez) || 1; if ((ex * Math.sin(p.h) - ez * Math.cos(p.h)) / el < -0.6 && !p.machine) { if (!(p.slowT > 0)) { toast('ENGINE HIT · CRIPPLED', 1.4); } p.slowT = Math.max(p.slowT || 0, 5); } }   /* s606 (2D): a shot up the tail cripples its engines */ damage(p, s.dmg || (s.missile ? 45 : 10)); burst(s.m.position.x, s.m.position.z, '#ffffff', 5, 0.6); if (s.missile) for (const q of pirates) if (q !== p && !q.dead && Math.hypot(q.x - p.x, q.z - p.z) < 8) damage(q, 10); return true;   /* s440: splash halved per torpedo (two land) */ } } return false; },
    setCover(fn) { coverFn = fn; }, arenaCrew(kinds, x, z, ambush) { return crewMake(kinds, x, z, { arena: true, ambush }); },
    arenaShip(cls, x, z, mk) { if (mk) nextMk = mk; const p = makePirate(cls, x, z, null); p.arena = true; return p; }, arenaKill(p) { if (p && !p.dead) kill(p); }, arenaRemove(p) { if (p && !p.dead) remove(p); },
    quiet(t) { D.next = Math.max(D.next || 0, St.t + t); },   /* s598b arena: no pirate raids */
    clear() { pirates.forEach(p => { if (!p.dead) remove(p); }); pirates.length = 0; bolts.forEach(b => scene.remove(b.m)); bolts.length = 0; D.next = St.t + 60; },
    update(dt) {
      if ((hvT -= dt) <= 0) { hvT = 0.5; HV = X.havens ? X.havens() : []; } playerHaven = havenAt(St.x, St.z);
      const free = St.phase === 'free', t = St.t, safe = safeAt(St.x, St.z) || !!(X.cover && X.cover());
      // director
      const alive = pirates.filter(p => !p.dead && !p.port && p.mode === 'fight');
      const inside = Math.hypot(St.x, St.z) < (X.perim || 720);
      if (free && !alive.length && t > D.next && !safe && !playerHaven) { if (inside && Math.random() < 0.55) D.next = t + 40 + Math.random() * 40; else spawnCrew(); }   // s413: pirates attack LESS inside the 8 worlds' perimeter
      if (D.crew && !alive.length) { if (X.onCrewBeaten) X.onCrewBeaten(St.x, St.z); D.crew = 0; D.next = t + (inside ? 110 : 50) + Math.random() * 40; }
      ports.forEach(pt => { if (pt.razed) return; const d = Math.hypot(pt.x - St.x, pt.z - St.z); if (d < 190 && !pirates.some(p => !p.dead && p.port === pt)) { if (!pt.regen || t > pt.regen) { for (let i = 0; i < 3; i++) makePirate(i ? 'scout' : 'gunner', pt.x + Math.cos(i * 2.1) * 14, pt.z + Math.sin(i * 2.1) * 14, pt); pt.regen = t + 90; if (!pt.warned) { pt.warned = true; toast(pt.name + ' PIRATE PORT. Its guards are coming.', 3); } } } });
      for (const p of pirates) { if (p.dead) continue;
        if (p.machine && p.mode !== 'fight') { p.modeT += dt; p.vx *= Math.exp(-dt * 1.5); p.vz *= Math.exp(-dt * 1.5); p.x += p.vx * dt; p.z += p.vz * dt;
          if (p.mode === 'down') { p.h += dt * 0.6; const fl = Math.random() < 0.12; p.mat.emissive.set(fl ? '#ff4fb4' : '#000000'); p.cor.material.color.set(fl ? '#7fd0ff' : '#ff4fb4'); p.cor.material.opacity = 0.25 + Math.random() * 0.3;
            if (p.modeT > 25) { p.mode = 'fight'; p.hp = p.C.hp * 0.5; p.mat.emissive.set('#000000'); p.cor.material.color.set('#ff4fb4'); toast('MACHINE: ...REBOOT. DIRECTIVE RESTORED.', 2.4); } }
          else if (p.mode === 'unhack') { const k = Math.min(1, p.modeT / 1.6); p.h += dt * (2 + k * 10); p.cor.material.color.set(k < 0.5 ? '#ff4fb4' : '#7fd0ff'); p.cor.material.opacity = 0.5 + k * 0.5; p.cor.scale.setScalar(p.C.size * (1.5 + k * 1.5)); if (Math.random() < 0.5) burst(p.x, p.z, k < 0.5 ? '#ff4fb4' : '#7fd0ff', 1, 0.6);
            if (k > 0.5 && !p.freedLook) { p.freedLook = true; if (p.mat.model) { p.g.remove(p.mat.model); const fm = hullM(p.mk || 'scout', true); p.g.add(fm); p.mat.model = fm; } else if (tex.freed) { p.mat.map = tex.freed; p.mat.needsUpdate = true; } burst(p.x, p.z, '#ffffff', 18, 1.4); }
            if (p.modeT > 1.6) { p.mode = 'freed'; p.modeT = 0; p.mat.emissive.set('#000000'); p.cor.scale.setScalar(p.C.size * 1.5); p.cor.material.color.set('#7fd0ff'); toast('FREED MACHINE: ' + FREED[(Math.random() * FREED.length) | 0], 4);
              try { save.setStat('spaceFreed', (save.stat('spaceFreed') || 0) + 1); save.addXp(25); } catch (e) {} if (p.guard && X.onGuardFreed) X.onGuardFreed(p); const a = Math.random() * 6.28; p.vx = Math.cos(a) * 4; p.vz = Math.sin(a) * 4; } }
          else if (p.mode === 'freed') { if (!p.gift && p.modeT > 3) { p.gift = true; drop(Math.random() < 0.5 ? 'shield' : 'energy', p.x, p.z); } const a = Math.atan2(p.vz, p.vx); p.vx = lerp(p.vx, Math.cos(a) * 26, dt * 0.5); p.vz = lerp(p.vz, Math.sin(a) * 26, dt * 0.5); p.h += clamp(angDiff(p.h, Math.atan2(p.vx, -p.vz)), -2 * dt, 2 * dt); if (p.modeT > 14) remove(p); }
          p.g.position.set(p.x, Math.sin(St.t * 2 + p.side) * 0.1, p.z); p.g.rotation.y = -p.h; continue; }
        const dx = St.x - p.x, dz = St.z - p.z, d = Math.hypot(dx, dz) || 1, C = p.C;
        // s574 SCOPE called-shot effects: ENGINES = SLOWED (sputtering orange sparks) · GUNS = JAMMED (blue sparks, no fire) · BRIDGE = STUNNED (spins, no fire)
        if (p.slowT > 0) { p.slowT -= dt; if (Math.random() < dt * 10) burst(p.x - Math.sin(p.h) * C.size * 0.4, p.z + Math.cos(p.h) * C.size * 0.4, '#ff8a3a', 2, 0.6); }
        if (p.jamT > 0) { p.jamT -= dt; p.shotsLeft = 0; if (Math.random() < dt * 8) burst(p.x, p.z, '#7fd0ff', 2, 0.5); }
        if (p.stunT > 0) { p.stunT -= dt; p.shotsLeft = 0; p.h += dt * 7; }
        if (p.tractT > 0) { p.tractT -= dt; p.shotsLeft = 0; if (p.art) { p.art.ph = 'hold'; p.art.t = Math.max(p.art.t, 1.5); } if (p.line) p.line.visible = false; if (p.run) p.run.ph = 'set';   // s594 HELD in your tractor beam: stunned, dragged toward a spot ahead of you, no fire
          const k = 1 - Math.exp(-dt * 2.5); p.vx = lerp(p.vx, (p.tractX - p.x) * 1.5, k); p.vz = lerp(p.vz, (p.tractZ - p.z) * 1.5, k); p.x += p.vx * dt; p.z += p.vz * dt; p.h += dt * 0.8 * p.side; if (Math.random() < dt * 6) burst(p.x, p.z, '#7fd0ff', 1, 0.5);
          p.g.position.set(p.x, Math.sin(t * 9) * 0.15, p.z); p.g.rotation.y = -p.h; continue; }
        if (p.fleet && p.intercept) { const T = p.intercept, G = p.guard, alive = T && !T.dead && (T.mode ? T.mode === 'fight' : T.state !== 'die');
          if (!alive || (G.war && G.war()) || Math.hypot(T.x - G.cx, T.z - G.cz) > 460) p.intercept = null;
          else { p.calm = false; const ex = T.x - p.x, ez = T.z - p.z, ed = Math.hypot(ex, ez) || 1, rad = clamp((ed - 18) * 0.1, -1, 1.3), wx = ex / ed * rad + (-ez / ed) * p.side * 0.8, wz = ez / ed * rad + (ex / ed) * p.side * 0.8, wl = Math.hypot(wx, wz) || 1;
            p.vx = lerp(p.vx, wx / wl * 24, 1 - Math.exp(-dt * 1.8)); p.vz = lerp(p.vz, wz / wl * 24, 1 - Math.exp(-dt * 1.8)); p.x += p.vx * dt; p.z += p.vz * dt;
            const aim = Math.atan2(ex + (T.vx || 0) * 0.3, -(ez + (T.vz || 0) * 0.3)); p.h += clamp(angDiff(p.h, ed < 60 ? aim : Math.atan2(p.vx, -p.vz)), -3 * dt, 3 * dt);
            p.fireT -= dt; if (ed < 50 && p.fireT <= 0 && Math.abs(angDiff(p.h, aim)) < 0.5) { p.fireT = 0.55 + Math.random() * 0.3; const fx = Math.sin(p.h), fz = -Math.cos(p.h); redBolt(p.x + fx * 3, p.z + fz * 3, -p.h, fx * 58 + p.vx, fz * 58 + p.vz, 9, { ally: true }); }
            p.g.position.set(p.x, Math.sin(t * 2 + p.side) * 0.1, p.z); p.g.rotation.y = -p.h; continue; } }
        if (p.guard) { const G = p.guard, inSky = Math.hypot(St.x - G.cx, St.z - G.cz) <= 200; if (!free || !inSky || (G.war && !G.war())) p.calm = true; else if (G.war && G.war()) p.calm = false;
          if (p.calm) { G.a += G.spd * dt; const tx = G.cx + Math.cos(G.a) * G.r, tz = G.cz + Math.sin(G.a) * G.r; p.vx = (tx - p.x) * 1.5; p.vz = (tz - p.z) * 1.5; p.x += p.vx * dt; p.z += p.vz * dt; p.h += clamp(angDiff(p.h, Math.atan2(p.vx, -p.vz)), -2 * dt, 2 * dt);
            p.g.position.set(p.x, Math.sin(t * 2 + p.side) * 0.1, p.z); p.g.rotation.y = -p.h; if (p.machine && Math.random() < dt * 0.4) { p.cor.material.color.set('#7fd0ff'); setTimeout(() => p.cor.material.color.set('#ff4fb4'), 120); } continue; } }
        p.held = !p.guard && !!playerHaven && d < 300; const foe = null;   // s410: the player is in defended space → hold at its edge, fight the patrol
        const leave = !p.arena && !p.hide && !p.form && !p.guard && !p.held && (!free || safe || d > (p.port ? 260 : 240));
        if (!p.guard && !p.hide && (d > 300 || (leave && d > 120))) { remove(p); continue; }
        let wx, wz; const TT = PT.tac || {}, pir = !p.machine && !p.fleet && !p.guard;
        if (pir && !p.ret && !p.retDone && TT.retreatAt > 0 && p.hp < p.C.hp * TT.retreatAt / 100 && !p.form && !p.hide) { p.ret = { t: 0 }; p.run = null; if (p.art) p.art.ph = 'hold'; burst(p.x, p.z, '#ffb347', 6, 0.8); }   // s598y RETREAT
        if (p.ret) { p.ret.t += dt; p.hp = Math.min(p.C.hp * 0.7, p.hp + (TT.regen ?? 4) * dt); if (p.ret.t > (TT.retreatT ?? 4.5)) { p.ret = null; p.retDone = true; } }
        if (p.held) { const H = playerHaven, hx = p.x - H.x, hz = p.z - H.z, hd = Math.hypot(hx, hz) || 1, ex = H.x + hx / hd * (H.r + 30), ez = H.z + hz / hd * (H.r + 30); wx = (ex - p.x) * 0.2 + (-hz / hd) * p.side * 0.25; wz = (ez - p.z) * 0.2 + (hx / hd) * p.side * 0.25; }   // s413: they RUN from the defences and LURK outside, waiting
        else if (leave) { wx = -dx / d; wz = -dz / d; }
        else if (p.hide) { const H = p.hide, ox = H.x - St.x, oz = H.z - St.z, ol = Math.hypot(ox, oz) || 1, hx = H.x + ox / ol * 28 + Math.cos(H.a + t * 0.2) * 6, hz = H.z + oz / ol * 28 + Math.sin(H.a + t * 0.2) * 6; wx = (hx - p.x) * 0.15; wz = (hz - p.z) * 0.15; p.spdK = 0.6; }   // HIDING behind the field, on the far side from you
        else if (p.form) { const L = crews[p.crew] && crews[p.crew].lead; if (!L || L === p || L.dead) { wx = dx / d; wz = dz / d; p.spdK = 0.8; } else { const lh = Math.atan2(L.vx || dx, L.vz || dz), fx = Math.sin(lh), fz = Math.cos(lh), rx = fz, rz = -fx, gp = TT.formGap ?? 13, tx = L.x + (rx * p.slot[0] + fx * p.slot[1]) * gp, tz = L.z + (rz * p.slot[0] + fz * p.slot[1]) * gp; wx = (tx - p.x) * 0.25 + (L.vx || 0) / C.speed; wz = (tz - p.z) * 0.25 + (L.vz || 0) / C.speed; p.spdK = 1.25; } }   // WING FORMATION
        else if (p.ret) { let ax = 0, az = 0, n2 = 0; for (const q of pirates) if (q !== p && !q.dead && q.crew === p.crew && !q.ret) { ax += q.x; az += q.z; n2++; } const awx = -dx / d, awz = -dz / d; if (n2) { ax /= n2; az /= n2; const gx = ax - p.x + awx * 30, gz = az - p.z + awz * 30, gl = Math.hypot(gx, gz) || 1; wx = gx / gl * 0.6 + awx * 0.7; wz = gz / gl * 0.6 + awz * 0.7; } else { wx = awx; wz = awz; } p.spdK = 1.3; }   // RETREAT toward its crewmates, away from you
        else if (!p.machine && !p.fleet) { const T = tactic(p, dt, dx, dz, d, t); wx = T[0]; wz = T[1]; }   // s593 each class fights its own way
        else { const rad = clamp((d - C.orbit) * 0.09, -1, 1.4); wx = dx / d * rad + (-dz / d) * p.side * 0.9; wz = dz / d * rad + (dx / d) * p.side * 0.9; }
        if (p.machine) glitch(p, dt);
        for (const dk of docks) { const ex = p.x - dk.x, ez = p.z - dk.z, ed = Math.hypot(ex, ez); if (ed < 65) { wx += ex / ed * 2; wz += ez / ed * 2; } }
        const wl = Math.hypot(wx, wz) || 1, sp = C.speed * (leave ? 1.3 : 1) * (p.slowT > 0 ? 0.35 : 1) * (p.spdK || 1) * (p.gl > 0 ? 0 : 1);
        const grip = p.grip || 1.6; p.vx = lerp(p.vx, wx / wl * sp, 1 - Math.exp(-dt * grip)); p.vz = lerp(p.vz, wz / wl * sp, 1 - Math.exp(-dt * grip));
        if (pir && !p.form && !p.hide && !p.ret && (p.dodgeCd = (p.dodgeCd || 0) - dt) <= 0 && d < 85 && free) { const pfx = Math.sin(St.h), pfz = -Math.cos(St.h); if ((-dx * pfx - dz * pfz) / d > 0.975) { p.dodgeCd = TT.dodgeCd ?? 2.6; if (Math.random() < (TT.dodge ?? 0.4)) { const s = Math.random() < 0.5 ? 1 : -1, sp = TT.dodgeSpd ?? 30; p.roll = { t: 0, s, vx: pfz * s * sp, vz: -pfx * s * sp }; } } }   // s598y DODGE ROLL when your nose is on it
        if (p.roll) { p.roll.t += dt; const u = p.roll.t / 0.45, f = Math.max(0, 1 - u); p.x += p.roll.vx * f * dt; p.z += p.roll.vz * f * dt; if (u >= 1) p.roll = null; }
        p.x += p.vx * dt; p.z += p.vz * dt; if (p.gl > 0) { p.x += (Math.random() - 0.5) * 0.9; p.z += (Math.random() - 0.5) * 0.9; }
        { const sx = p.x - St.x, sz = p.z - St.z, sd = Math.hypot(sx, sz) || 1, minD = C.size * 0.55 + 4; if (free && sd < minD) { p.x = St.x + sx / sd * minD; p.z = St.z + sz / sd * minD; } }   // s593 never fly through the player
        if (!p.guard) pushOut(p, 2);
        const ax = foe ? foe.x + (foe.vx || 0) * 0.3 - p.x : dx + St.vx * 0.5, az = foe ? foe.z + (foe.vz || 0) * 0.3 - p.z : dz + St.vz * 0.5, ad = Math.hypot(ax, az), aim = Math.atan2(ax, -az), face = p.faceH != null && !leave && !p.held ? p.faceH : (p.held ? !!foe && ad < 60 : d < 55 && !leave) ? aim : Math.atan2(p.vx, -p.vz);
        if (!(p.stunT > 0) && !(p.gl > 0)) p.h += clamp(angDiff(p.h, face), -(p.turn || 3) * dt, (p.turn || 3) * dt);
        // fire: bursts, only when roughly facing you
        p.fireT -= dt;
        if (!leave && !p.held && !p.noFire && !p.ret && !p.form && !p.hide && !(p.gl > 0) && !(p.jamT > 0) && !(p.stunT > 0) && d < (p.cls === 'scout' && PT.scout ? PT.scout.range : 48) && p.fireT <= 0 && Math.abs(angDiff(p.h, aim)) < 0.4) { p.shotsLeft = C.burst; p.fireT = C.reload + Math.random() * 0.6; }
        if (p.shotsLeft > 0 && (p.shotT -= dt) <= 0) { p.shotsLeft--; p.shotT = 0.12; const hh = p.h + (p.wild || 0), fx = Math.sin(hh), fz = -Math.cos(hh); redBolt(p.x + fx * C.size * 0.45, p.z + fz * C.size * 0.45, -p.h, fx * 52 + p.vx, fz * 52 + p.vz, C.dmg); }
        p.flash = Math.max(0, p.flash - dt); if (p.mat.model) { if (p.flash > 0) p.mat.emissive.set('#ffffff'); } else p.mat.emissive.setScalar(p.flash > 0 ? 1 : 0); p.cor.material.opacity = 0.5 + 0.2 * Math.sin(t * 4 + p.side);
        p.g.position.set(p.x, Math.sin(t * 2 + p.side) * 0.1, p.z); p.g.rotation.y = -p.h; p.g.rotation.z = p.roll ? p.roll.s * Math.min(1, p.roll.t / 0.45) * 6.283 : 0; }
      crewTick(dt); warpTick(dt);
      { const ws = wsFn ? wsFn() : 0; for (const k in proto) proto[k].tick(dt, ws); for (const k in protoM) { protoM[k].tick(dt, ws); freedM[k].tick(dt, ws); } }
      for (const p of pirates) { if (p.mat && p.mat.fl && p.mat.fl.material.opacity > 0 && p.mode !== 'down') p.mat.fl.material.opacity = Math.max(0, p.mat.fl.material.opacity - dt * 4);
        if (p.tur) { const a = Math.atan2(St.x - p.x, -(St.z - p.z)); p.tur.rotation.y = -(a - p.h); } }
      for (let i = pirates.length - 1; i >= 0; i--) if (pirates[i].dead) { if (pirates[i].line) scene.remove(pirates[i].line); pirates.splice(i, 1); }
      tailArrows(t);
      for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.life -= dt; b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt;
        let gone = b.life <= 0; const bx = b.m.position.x, bz = b.m.position.z;
        if (!gone && b.ally) { for (const q of pirates) if (!q.dead && !q.guard && q.mode === 'fight' && Math.hypot(q.x - bx, q.z - bz) < q.C.size * 0.3 + 1) { damage(q, b.dmg); burst(bx, bz, '#ffffff', 4, 0.6); gone = true; break; } if (!gone && X.beasts && X.beasts.hitShot({ m: b.m, dmg: b.dmg, missile: false })) gone = true; if (!gone) { bolts[i].life = Math.min(b.life, 1.3); } }
        else if (!gone && havenAt(bx, bz)) { gone = true; burst(bx, bz, '#7fd0ff', 6, 0.8); }   // shots fizzle on defended space
        else if (!gone && b.atNpc) { for (const q of pirates) if (q.fleet && !q.dead && Math.hypot(q.x - bx, q.z - bz) < 2.8) { gone = true; burst(bx, bz, '#ffb46a', 5, 0.7); break; } }
        if (!gone && !b.ally && St.phase === 'free' && Math.hypot(b.m.position.x - St.x, b.m.position.z - St.z) < 2.6) { gone = true; hurt(b.dmg, b.m.position.x - b.vx * 0.05, b.m.position.z - b.vz * 0.05); }
        if (gone) { scene.remove(b.m); bolts.splice(i, 1); } }
      for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i], g = d.g; d.t += dt; d.life -= dt; d.vx *= Math.exp(-dt * 2); d.vz *= Math.exp(-dt * 2);
        const dx = St.x - g.position.x, dz = St.z - g.position.z, dd = Math.hypot(dx, dz);
        if ((d.grace = (d.grace || 0) - dt) > 0) { /* still bursting out */ } else if (dd < 12 && St.phase === 'free') { const k = (12 - dd) * 3; d.vx += dx / dd * k * dt * 4; d.vz += dz / dd * k * dt * 4; }
        g.position.x += d.vx * dt; g.position.z += d.vz * dt; g.position.y = 0.6 + Math.sin(d.t * 3) * 0.2;
        if (g.userData.coin) { const sx = Math.cos(d.t * 5); g.userData.coin.scale.x = 2.3 * Math.max(0.15, Math.abs(sx)); } else g.userData.pu && g.userData.pu.update(dt);
        g.visible = d.life > 5 || Math.floor(d.life * 6) % 2 === 0;
        if (d.grace <= 0 && dd < 2.8 && St.phase === 'free') { collect(d); scene.remove(g); drops.splice(i, 1); } else if (d.life <= 0) { scene.remove(g); drops.splice(i, 1); } }
      for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 14); r.m.material.opacity = Math.max(0, 1 - r.t * 2.2); if (r.t > 0.5) { scene.remove(r.m); rings.splice(i, 1); } }
    },
  };
  return API;
}
