// s676 Character Workshop: non-fox models (Machine Fleet, Pearl Sail bots, power-ups, gems). build(id, ctx) → { obj, tick(t, dt), frame: [lookY, dist] }
// ids: 'machine:<type>' · 'bot:<type>[:<variant>]' · 'pu:<key>' · 'gem:<id>'
export async function build(id, ctx) { const r = await build0(id, ctx), T = ctx.THREE, B = new T.Box3(), b = new T.Box3(); r.obj.updateMatrixWorld(true);
  r.obj.traverse(o => { if (!o.isMesh || !o.visible || !o.geometry) return; const mt = Array.isArray(o.material) ? o.material[0] : o.material; if (mt && (mt.transparent || mt.side === T.BackSide)) return; o.geometry.computeBoundingBox(); b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); B.union(b); });   /* solid parts only: no beams, glows or ink shells */
  let s = B.getSize(new T.Vector3());
  const big = kind0(id) === 'veh' || kind0(id) === 'fun' ? 3.2 : 2.6;
  if (s.y > big && kind0(id) !== 'inst') { const k = big / s.y; r.obj.scale.multiplyScalar(k); B.min.multiplyScalar(k); B.max.multiplyScalar(k); s = B.getSize(new T.Vector3()); r.shrunk = k; }
  if ((kind0(id) === 'veh' || kind0(id) === 'fun') && Math.max(s.x, s.z) > 4.5) { const k = 4.5 / Math.max(s.x, s.z); r.obj.scale.multiplyScalar(k); B.min.multiplyScalar(k); B.max.multiplyScalar(k); s = B.getSize(new T.Vector3()); r.shrunk = k; }   /* wide rides (the hang glider) too */
  if (false) { const k = 2.6 / s.y; r.obj.scale.multiplyScalar(k); B.min.multiplyScalar(k); B.max.multiplyScalar(k); s = B.getSize(new T.Vector3()); r.shrunk = k; }   /* giants (The Rig) shrink to fit the dojo; the name tag says so */
  if (!B.isEmpty() && s.y > 0) r.frame = [B.min.y + s.y * 0.5, Math.min(12, Math.max(2.2, Math.max(s.y * 2.6, s.x * 2.4, s.z * 2.4)))];   /* s676c frame from the model's real size */
  return r; }
const kind0 = id => id.split(':')[0];
async function build0(id, ctx) {
  const { THREE } = ctx, [kind, a, b] = id.split(':');
  if (kind === 'machine') { const m = await import('../worlds/ore-machines.js'); let L = m.LOOK0[a]; try { const sv = m.loadMachines(); if (sv && sv.look && sv.look[a]) L = { ...L, ...sv.look[a] }; } catch (e) {}
    const obj = m.buildMachine(ctx, a, L); return { obj, tick: (t, dt) => m.poseMachine(obj, { t, dt, mode: 'idle', hacked: 0 }), frame: a === 'rig' ? [1.6, 8] : [0.9, 5.2] }; }
  if (kind === 'bot') { const m = await import('../worlds/pearl-bots.js'); let L = m.LOOK0[a]; try { const sv = m.loadBots(); if (sv && sv.look && sv.look[a]) L = { ...L, ...sv.look[a] }; } catch (e) {}
    const obj = m.buildBot(ctx, a, L, b || ''); return { obj, tick: (t, dt) => m.poseBot(obj, a, { t, dt, mode: 'idle' }), frame: a === 'gate' ? [1.6, 7.5] : a === 'drone' ? [1.4, 4.5] : [0.8, 4.5] }; }
  if (kind === 'inst') { const K = await import('../worlds/space-installs.js'); const kit = K.installKit(THREE, {}), looks = K.loadLooks(), inst = kit.build(a, looks[a] || {}, {}); const obj = new THREE.Group(); obj.add(inst.group);
    inst.group.updateMatrixWorld(true); const B = new THREE.Box3().setFromObject(inst.group), s = B.getSize(new THREE.Vector3()), k = 3.2 / Math.max(s.x, s.y, s.z, 0.01); inst.group.scale.multiplyScalar(k); inst.group.position.y = -B.min.y * k + 0.15;   /* space models scaled to the dojo */
    return { obj, tick: (t, dt) => { try { inst.tick(dt, new THREE.Vector3()); } catch (e) {} obj.rotation.y += dt * 0.15; }, frame: [1.4, 6], shrunk: k }; }
  if (kind === 'veh' || kind === 'fun') { let obj;
    if (kind === 'veh') { const K = await import('./vehicle-kit.js'); obj = K.vehicleKit(ctx).make(a); }
    else { const F = await import('./vehicle-fun.js'); const X = { ...ctx, scene: new THREE.Group(), St: { t: 0, shake: 0, score: 0 }, C: { x: 0, z: 0, y: 0, yaw: 0, speed: 0 }, props: [], npcs: [], audio: { tone() {}, burst() {} }, rr: (a2, b2) => a2 + Math.random() * (b2 - a2), damp: (a2, b2) => b2 }; obj = F.funKit(X).make(a); }
    const sc = obj.userData.V && obj.userData.V.spec && obj.userData.V.spec.scale; if (sc) obj.scale.multiplyScalar(sc);
    const W = new THREE.Group(); W.add(obj); return { obj: W, tick: (t, dt) => { W.rotation.y += dt * 0.25; }, frame: [1, 5] }; }
  if (kind === 'car') { const K = await import('./meru-cars.js?v=s679'), mc = K.meruCars(THREE), W = new THREE.Group(); if (a === 'suv') { const R = await import('./royal-suv.js?v=s679b'); const s = new THREE.Group(); s.scale.setScalar(1.15); W.add(s); R.buildRoyalSUV(THREE, s, {}); } else if (a === 'tow') mc.mkTow(W); else { const C = mc.mkCar(W, { col: b || K.CARC[0] }); }
    return { obj: W, tick: (t, dt) => { W.rotation.y += dt * 0.25; }, frame: [1, 7] }; }
  if (kind === 'human') { const HKm = await import('./human-kit.js?v=s692c'); const HK = HKm.humanKit({ THREE, grad: ctx.grad });   /* s689 Kyoto humans: jointed, with working hands */
    const g = HK.make({ ...HKm.HUMAN_PRESETS[a] }); const obj = new THREE.Group(); obj.add(g); const P = HK.restPose(g);
    return { obj, tick: (t, dt) => { HK.update(g, P, dt); }, frame: [1.1, 4.6] }; }
  if (kind === 'pu') { const m = await import('./powerups.js'); const obj = new THREE.Group(), p = m.makePowerup(THREE, a); p.position.y = 0.6; obj.add(p);
    return { obj, tick: (t, dt) => { p.rotation.y += dt * 1.4; p.position.y = 0.6 + Math.sin(t * 2) * 0.05; }, frame: [0.6, 3.2] }; }
  if (kind === 'gem') { const m = await import('./gems.js'); const g = m.allGems()[a]; const obj = new THREE.Group(); if (!g) return { obj, tick() {}, frame: [0.5, 2] };
    const gm = m.makeGem(ctx, g, 1); gm.position.y = 0.55; obj.add(gm); return { obj, tick: (t, dt) => m.tickGem(gm, dt), frame: [0.55, 2.8] }; }
  return { obj: new THREE.Group(), tick() {}, frame: [1, 4] };
}
