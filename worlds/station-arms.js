import { loadSpaceSamples, playSample } from '../engine/space-samples.js?v=s447';
// 8 GATES · STATION ARMS (s394). Every weapon from the 2D space map (ARMS + ARM_BRIEF, verbatim) and the 2D STATION BATTLE PLAN
// (stationBatteries + stationDrill + lasersHushed). A world station only fires while its fleet is AT WAR with you.
// THE DRILL (2D): everything counts off the TORPEDO SALVO (3 rounds, every 4 s, inside 800 u):
//   every 2nd salvo → the LANCE (charge 0.57 s, burns 1.4 s, slow-tracking so it can be dodged)
//   every 3rd salvo → its own world's SPECIALITY (Meru = EMP), else the lance again; 6 = speciality wins
//   TWIN LASERS (light battery) fire paired bolts ~4 a second, and go QUIET 1 s before + 1 s after every salvo.
// createStationFx(THREE, scene) = the look of every weapon (used by the Station Workshop's WEAPONS panel; the map can reuse it).
export const ARMS = [
  { k: 'TWIN_LASERS', n: 'TWIN LASERS', world: 'shasta', brief: 'Rapid paired bolts. Always firing.', d: 'Paired bolts. Every world builds them; no world is proud of them.' },
  { k: 'RED_CANNON', n: 'LASER CANNON · THE LANCE', world: 'shasta', brief: 'One-second burn. Cuts hull and rock.', d: 'A one-second burn out to 400 units. Cuts rock as well as hull. Every yard will bolt one on for nothing — it is the gun everybody has.' },
  { k: 'PLASMA_TORPEDO', n: 'TORPEDO', world: 'jidda', brief: 'Heavy single round. Slow, hits hard.', d: 'Forty-five in a single round. Five cells a shot is what stops you.' },
  { k: 'WEB', n: 'WEB', world: 'ur', brief: 'Holds a ship still four seconds.', d: 'Kills nothing. Holds a ship still for four seconds, which kills plenty.' },
  { k: 'MINES', n: 'MINES', world: 'gaya', brief: 'Dropped behind you. Rewards running.', d: 'Laid behind you and left there. Rewards running away.' },
  { k: 'MISSILE', n: 'MISSILE', world: 'luxor', brief: 'Homes on your lock. Never misses.', d: 'Homes onto your scan lock, or the nearest enemy. Slow, and it does not miss.' },
  { k: 'FLAK', n: 'FLAK', world: 'kufa', brief: 'Close cone. Shreds rock and drones.', d: 'A close cone of shot. Shreds rock and drones, feeble against a hull.' },
  { k: 'ARC', n: 'ARC', world: 'nebo', brief: 'Strikes one, leaps to the next.', d: 'Strikes one, then leaps to the next, and the next.' },
  { k: 'EMP', n: 'EMP', world: 'meru', brief: 'Strips cells and shields. No hull damage.', d: 'Takes cells, not hull. Drops shields and stalls a station’s batteries.' },
  { k: 'RAIL', n: 'RAIL', world: 'zion', brief: 'Pierces everything in the line.', d: 'Pierces everything standing in the line, all the way out.' },
  { k: 'TRACTOR_BEAM', n: 'TRACTOR', tool: true, brief: 'Tows rock, cargo and salvage.', d: 'Tows rock, cargo hulls and salvage. Costs you a gun slot to carry.' },
  { k: 'CLOAK', n: 'CLOAK', tool: true, brief: 'Unseen and untouchable. Drains cells.', d: 'Nothing can see you, and nothing can shoot you. Costs you a gun slot.' },
];
// 2D numbers (60 fps frames → seconds; 2D units × 0.1 × 1.2 → map units)
export const PLAN = { hp: 2600, torpCd: 4, torpRange: 96, torpDmg: 18, lasCd: 16 / 60, lasRange: 96, lasDmg: 5, hush: 1, lanceCharge: 34 / 60, lanceFire: 85 / 60, lanceRange: 96, lanceDmg: 1.7 * 60, seeRange: 204 };
export const SPECIALITY = { shasta: null, luxor: 'MISSILE', ur: 'WEB', gaya: 'MINES', meru: 'EMP', zion: 'RAIL', nebo: 'ARC', kufa: 'FLAK', jidda: 'PLASMA_TORPEDO' };
// the role each weapon plays in a WORLD STATION's battle plan (2D stationBatteries)
export function roleOf(k, world) {
  if (k === 'PLASMA_TORPEDO' && SPECIALITY[world] !== k) return { on: true, t: 'SALVO · 3 rounds every 4 s, the drill counts off it' };
  if (k === 'TWIN_LASERS') return { on: true, t: 'LIGHT BATTERY · paired bolts ~4 a second, silent 1 s either side of a salvo' };
  if (k === 'RED_CANNON') return { on: true, t: 'THE LANCE · from the dish, every 2nd salvo (charge 0.6 s, burns 1.4 s, slow track)' };
  if (SPECIALITY[world] === k) return { on: true, t: 'SPECIALITY · every 3rd salvo (6th: the speciality wins over the lance)' };
  return { on: false, t: 'ON BOARD · NOT IN THE 2D BATTLE PLAN (to discuss)' };
}
// the drill order for salvo n (2D stationDrill)
export const drill = n => n % 3 === 0 ? 'special' : n % 2 === 0 ? 'lance' : null;

export function createStationFx(THREE, scene) {
  const fx = [], V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const add = (m, o) => { scene.add(m); fx.push({ m, t: 0, ...o }); return m; };
  const gm = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const spark = (c, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(s); return sp; };
  const boom = (p, c, s = 3) => add(spark(c, s), { kind: 'boom', p: p.clone(), life: 0.45, s });
  // s408 the PEARL SAIL blast (twin lasers): a solid glowing capsule + a soft halo riding on it + a muzzle flash pop
  const capG = new THREE.CapsuleGeometry(0.22, 2.0, 3, 8); capG.rotateX(Math.PI / 2);
  const pearl = (from, to, c, speed, life) => { const m = new THREE.Mesh(capG, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); const gl = spark(c, 3.6); m.add(gl); m.position.copy(from); m.lookAt(to); const dir = to.clone().sub(from).normalize(); boom(from, c, 3.8); return add(m, { kind: 'bolt', v: dir.multiplyScalar(speed), life, to: to.clone(), c, pearl: true }); };
  const bolt = (from, to, c, speed, size, life, kind = 'bolt') => { const m = new THREE.Mesh(new THREE.BoxGeometry(size * 0.25, size * 0.25, size * 2.2), gm(c)); m.position.copy(from); m.lookAt(to); const dir = to.clone().sub(from).normalize(); return add(m, { kind, v: dir.multiplyScalar(speed), life, to: to.clone(), c }); };
  const beam = (from, to, c, w, life, kind = 'beam', o = {}) => { const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); g.translate(0, 0.5, 0); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, gm(c, 0.9)), core = new THREE.Mesh(g, gm('#ffffff', 0.95)); core.scale.set(0.35, 0.35, 1); m.add(core);
    scene.add(m); const e = { m, t: 0, kind, from: from.clone(), to: to.clone(), w, life, c, ...o }; fx.push(e); place(e); return e; };
  const _pa = new THREE.Vector3(), place = e => { const L = e.from.distanceTo(e.to), h = e.grow != null ? e.grow : 1, tl = e.tail || 0; _pa.copy(e.from).lerp(e.to, tl); e.m.position.copy(_pa); e.m.lookAt(e.to); e.m.scale.set(e.w, e.w, Math.max(0.001, L * (h - tl))); };
  const cRed = new THREE.Color('#ff2a2a'), cDeep = new THREE.Color('#8a0a06'), cWhite = new THREE.Color('#ffffff'), cHot = new THREE.Color('#ff7a5a');
  const beamGhost = e => { const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); g.translate(0, 0.5, 0); g.rotateX(Math.PI / 2); const m = new THREE.Mesh(g, gm('#ff3a2a', 0.22)); m.position.copy(e.from); m.lookAt(e.to); const L = e.from.distanceTo(e.to); m.scale.set(1.6, 1.6, L); return add(m, { kind: 'ghost', life: 1.3, w0: 1.6 }); };
  const ring = (p, c, r0, r1, life) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), gm(c, 0.8)); m.rotation.x = -Math.PI / 2; m.position.copy(p); return add(m, { kind: 'ring', r0, r1, life }); };
  const API = {
    // from / to are world Vector3s. tgt = Object3D (optional) for tracking.
    fire(k, from, to, o = {}) { const T = to.clone(); loadSpaceSamples(); const S2 = { TWIN_LASERS: ['stationTurret', 0.5], PLASMA_TORPEDO: ['torpedo', 0.7], RED_CANNON: ['lanceCharge', 0.8], MISSILE: ['missile', 0.6], FLAK: ['stationTurret', 0.6], EMP: ['mothPulse', 0.6], ARC: ['machineGlitch', 0.6], RAIL: ['pirateBaseGun', 0.6], TRACTOR_BEAM: ['towLatch', 0.6], CLOAK: ['teleport', 0.5], MINES: ['oreDrop', 0.5], WEB: ['machineGlitch', 0.5] }[k]; if (S2) playSample(S2[0], { v: S2[1] }); if (k === 'RED_CANNON') setTimeout(() => playSample('lanceFire', { v: 0.85 }), ((o.charge ?? PLAN.lanceCharge) * 1000) | 0);   // s428 recorded station weapons
      switch (k) {
        case 'TWIN_LASERS': { const side = V().crossVectors(T.clone().sub(from), V(0, 1, 0)).normalize().multiplyScalar(1.4); pearl(from.clone().add(side), T.clone().add(side.clone().multiplyScalar(0.2)), o.col || '#ff3b2a', 60, 1.6); pearl(from.clone().sub(side), T.clone().sub(side.clone().multiplyScalar(0.2)), o.col || '#ff3b2a', 60, 1.6); break; }
        case 'PLASMA_TORPEDO': { const d = T.clone().sub(from), side = V().crossVectors(d, V(0, 1, 0)).normalize(); for (let s = -1; s <= 1; s++) { const m = add(spark('#ff7a3a', 2.6), { kind: 'torp', v: d.clone().normalize().multiplyScalar(26).add(side.clone().multiplyScalar(s * 2.9)), life: 3, c: '#ff7a3a' }); m.position.copy(from); } break; }
        case 'RED_CANNON': { const REL = 0.85, LW = o.width || 1, e = beam(from, T, '#ff2a2a', LW, (o.charge ?? PLAN.lanceCharge) + (o.burn ?? PLAN.lanceFire) + REL, 'lance', { charge: o.charge ?? PLAN.lanceCharge, burn: o.burn ?? PLAN.lanceFire, rel: REL, tgt: o.tgt || null, grow: 0, tail: 0, fromFn: o.from || null, lw: LW }); e.m.visible = false; e.glow = { p: from.clone() }; if (!o.from) e.glow = add(spark('#ff4a3a', 1), { kind: 'hold', life: e.life, p: from.clone(), grow: e.charge }); break; }
        case 'EMP': { ring(from, '#7fd0ff', 2, 90, 1.1); ring(from.clone().add(V(0, 0.4, 0)), '#ffffff', 2, 70, 0.9); boom(from, '#7fd0ff', 12); break; }
        case 'WEB': { const m = add(spark('#e6e6ff', 2), { kind: 'web', v: T.clone().sub(from).normalize().multiplyScalar(30), life: 2.4, to: T.clone() }); m.position.copy(from); break; }
        case 'MINES': { for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), new THREE.MeshBasicMaterial({ color: '#ffb340' })); m.position.copy(from); const a = i / 4 * Math.PI * 2; add(m, { kind: 'mine', v: V(Math.cos(a) * 6, 0, Math.sin(a) * 6), life: 6 }); } break; }
        case 'MISSILE': { const m = add(spark('#ffd23a', 2.2), { kind: 'missile', v: V(0, 14, 0), life: 4, tgt: o.tgt || null, to: T.clone() }); m.position.copy(from); break; }
        case 'FLAK': { const d = T.clone().sub(from).normalize(); for (let i = 0; i < 14; i++) { const j = d.clone().add(V((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.5)).normalize(); const m = add(spark('#ffcf7a', 0.9), { kind: 'flak', v: j.multiplyScalar(40 + Math.random() * 10), life: 0.7 }); m.position.copy(from); } break; }
        case 'ARC': { let a = from.clone(); const pts = [T, T.clone().add(V(12, 0, 6)), T.clone().add(V(4, 0, 18))]; pts.forEach((b, i) => { setTimeout(() => { beam(a, b, '#a5f3fc', 0.18, 0.35, 'zap'); boom(b, '#a5f3fc', 3); a = b; }, i * 120); }); break; }
        case 'RAIL': { const far = from.clone().add(T.clone().sub(from).normalize().multiplyScalar(140)); beam(from, far, '#ffffff', 0.16, 0.5, 'rail'); beam(from, far, '#7fd0ff', 0.4, 0.35, 'rail'); break; }
        case 'TRACTOR_BEAM': { const e = beam(from, T, '#6ee7b7', 0.55, 2.2, 'tractor', { tgt: o.tgt || null }); e.m.material.opacity = 0.35; break; }
        case 'CLOAK': { ring(from, '#9aa3b2', 4, 34, 1.4); if (o.hide) { o.hide(true); setTimeout(() => o.hide(false), 2400); } break; }
      } },
    clear() { for (const e of fx) { scene.remove(e.m); e.m.geometry && e.m.geometry.dispose(); } fx.length = 0; },
    update(dt, target) {
      for (let i = fx.length - 1; i >= 0; i--) { const e = fx[i]; e.t += dt; const u = e.life ? e.t / e.life : 1;
        if (e.kind === 'bolt' || e.kind === 'flak' || e.kind === 'torp') { e.m.position.addScaledVector(e.v, dt); if (e.kind === 'flak') e.m.material.opacity = 1 - u; if (target && e.kind !== 'flak' && e.m.position.distanceTo(target) < 3) { boom(e.m.position, e.c || '#ffffff', e.kind === 'torp' ? 6 : 2.5); e.t = e.life; } }
        else if (e.kind === 'web') { e.m.position.addScaledVector(e.v, dt); if (target && e.m.position.distanceTo(target) < 3) { ring(target, '#e6e6ff', 1, 6, 0.6); e.t = e.life; } }
        else if (e.kind === 'mine') { e.m.position.addScaledVector(e.v, dt); e.v.multiplyScalar(Math.exp(-dt * 0.8)); e.m.rotation.y += dt * 2; e.m.material.color.set(Math.sin(e.t * 12) > 0 ? '#ffb340' : '#ff3a2a'); }
        else if (e.kind === 'missile') { const T = target || e.to, d = T.clone().sub(e.m.position), L = d.length(); e.v.lerp(d.normalize().multiplyScalar(30), Math.min(1, dt * 2)); e.m.position.addScaledVector(e.v, dt); if (L < 3) { boom(e.m.position, '#ffd23a', 6); e.t = e.life; } }
        else if (e.kind === 'lance' || e.kind === 'tractor') { if (e.fromFn) { e.from.copy(e.fromFn()); if (e.glow) e.glow.p.copy(e.from); } if (target) { const want = target.clone(); e.to.lerp(want, Math.min(1, dt * (e.kind === 'lance' ? 1.1 : 4))); }   // the lance tracks SLOWLY (2D 0.018 rad / frame): it can be dodged
          if (e.kind === 'lance') { const c = e.charge, B = e.burn, R = e.rel; if (e.t < c) { e.m.visible = false; } else { e.m.visible = true; const k = e.t - c; e.grow = Math.min(1, k / (B * 0.17));
              if (k < B) { e.tail = 0; e.m.material.opacity = 0.9; e.m.children[0].material.opacity = 0.95; e.m.material.color.copy(cRed); e.m.children[0].material.color.copy(cWhite); e.w = e.lw * (1.0 + Math.sin(e.t * 40) * 0.12); }
              else { // s399 THE RELEASE (Ben: a natural fade): the beam LETS GO of the dish: its tail runs down to the target, it thins + cools white → red → deep red, sheds embers, leaves a heat ghost, and flares where it lands
                const r = Math.min(1, (k - B) / R), ease = 1 - Math.pow(1 - r, 2.2); e.tail = ease * 0.985; e.w = e.lw * (1.0 - 0.72 * r) * (1 + Math.sin(e.t * 55) * 0.18 * (1 - r));
                e.m.material.color.copy(cRed).lerp(cDeep, r); e.m.children[0].material.color.copy(cWhite).lerp(cHot, Math.min(1, r * 1.6)); e.m.material.opacity = 0.9 * (1 - r * r); e.m.children[0].material.opacity = 0.95 * Math.max(0, 1 - r * 1.5);
                if (!e.ghost) { e.ghost = true; const gl = beamGhost(e); }
                if (Math.random() < 0.85) { _pa.copy(e.from).lerp(e.to, e.tail + Math.random() * (1 - e.tail) * 0.25); const em = add(spark(Math.random() < 0.5 ? '#ff4a2a' : '#ffb07a', 0.5 + Math.random() * 0.6), { kind: 'ember', v: new THREE.Vector3((Math.random() - 0.5) * 3, 0.8 + Math.random() * 1.6, (Math.random() - 0.5) * 3), life: 0.8 + Math.random() * 0.7 }); em.position.copy(_pa); }
                if (r >= 1 && !e.flared) { e.flared = true; boom(e.to, '#ff6a4a', 7); ring(e.to.clone(), '#ff4a2a', 1, 9, 0.5); } } } }
          place(e); }
        else if (e.kind === 'ember') { e.m.position.addScaledVector(e.v, dt); e.v.multiplyScalar(Math.exp(-dt * 1.6)); e.m.material.opacity = (1 - u) * (0.7 + Math.random() * 0.3); e.m.scale.multiplyScalar(1 - dt * 0.6); }
        else if (e.kind === 'ghost') { e.m.material.opacity = 0.22 * (1 - u) * (1 - u); e.m.scale.x = e.m.scale.y = e.w0 * (1 + u * 2.2); }
        else if (e.kind === 'hold') { e.m.position.copy(e.p); const k = Math.min(1, e.t / e.grow); e.m.scale.setScalar(1 + k * 6 + Math.sin(e.t * 30) * 0.4); e.m.material.opacity = e.t < e.grow ? 0.5 + k * 0.5 : 0.9 * (1 - (e.t - e.grow) / (e.life - e.grow)); }
        else if (e.kind === 'ring') { const s = e.r0 + (e.r1 - e.r0) * u; e.m.scale.setScalar(s); e.m.material.opacity = 0.8 * (1 - u); }
        else if (e.kind === 'boom') { e.m.position.copy(e.p); e.m.scale.setScalar(e.s * (1 + u * 1.5)); e.m.material.opacity = 1 - u; }
        else if (e.kind === 'zap' || e.kind === 'rail' || e.kind === 'beam') { e.m.material.opacity = 0.9 * (1 - u); }
        if (e.t >= e.life) { scene.remove(e.m); if (e.m.geometry && e.m.geometry !== capG) e.m.geometry.dispose(); if (e.pearl) { e.m.material.dispose(); e.m.children.forEach(c => c.material && c.material.dispose()); } fx.splice(i, 1); } } },
  };
  return API;
}
