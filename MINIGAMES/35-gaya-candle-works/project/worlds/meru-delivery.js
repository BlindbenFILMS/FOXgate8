// MERU — the Burgers delivery fox, Bun, on a loop round the whole town: picks up a white TO GO bag (burger on it) from Sizzle at
// the counter, walks it out to a customer in each part of town (the Square, the Castle Path, the Ruins Path, the Lake road, the
// Arena Path, the Crestview House lobby, the Lakeside Tower lobby), hands it over (sound plays), the customer takes the burger
// out and eats it in three bites, and Bun walks back for the next bag. Paths are scripted waypoints along the roads.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
export function createDelivery({ THREE, scene, makeFox, animFox, M, toon, look, owner, counter, inside, door, stops, onHandoff, canvasTex }) {
  const bun = makeFox({ key: 'deliveryBun', name: 'Bun', outfit: 'vest', torso: ['#ffffff', '#c42d3c', '#7a1d2a'], crest: 'B', mood: 'happy', look }); scene.add(bun);
  // the bag + the burger
  const bagT = canvasTex(128, 160, c => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, 128, 160); c.fillStyle = '#e8e4da'; c.fillRect(0, 0, 128, 14);
    c.fillStyle = '#f59e0b'; c.beginPath(); c.ellipse(64, 70, 34, 20, 0, Math.PI, 0); c.fill(); c.fillStyle = '#16a34a'; c.fillRect(30, 70, 68, 6); c.fillStyle = '#7c2d12'; c.fillRect(32, 76, 64, 10); c.fillStyle = '#f59e0b'; c.fillRect(32, 86, 64, 8);
    c.fillStyle = '#c42d3c'; c.font = '900 24px Archivo, Arial'; c.textAlign = 'center'; c.fillText('TO GO', 64, 126); c.fillStyle = '#1e1e24'; c.font = '700 12px Archivo, Arial'; c.fillText('BURGERS', 64, 146); });
  const bagMat = new THREE.MeshToonMaterial({ map: bagT }), bagSide = toon('#f4f2ec');
  const mkBag = () => { const g = new THREE.Group(); M(new THREE.BoxGeometry(0.3, 0.36, 0.17), [bagSide, bagSide, bagSide, bagSide, bagMat, bagMat], 0, 0, 0, g, 0.01); M(new THREE.BoxGeometry(0.3, 0.05, 0.17), toon('#e8e4da'), 0, 0.2, 0, g, 0); g.visible = false; scene.add(g); return g; };
  const mkBurger = () => { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f59e0b'), 0, 0.03, 0, g, 0.004); M(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 12), toon('#16a34a'), 0, 0.02, 0, g, 0); M(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12), toon('#7c2d12'), 0, -0.005, 0, g, 0); M(new THREE.CylinderGeometry(0.075, 0.07, 0.03, 12), toon('#f59e0b'), 0, -0.035, 0, g, 0.004); g.visible = false; scene.add(g); return g; };
  const bag = mkBag();
  const meals = stops.map(() => ({ bag: mkBag(), burger: mkBurger(), t: -1 }));
  const v = new THREE.Vector3();
  const hand = (c, right = true, out = v) => { const a = c.userData.P && c.userData.P.arms[right ? 1 : 0]; if (!a) return out.copy(c.position).setY(1.1); return a.localToWorld(out.set(0, -0.52, 0.1)); };
  // the route plan
  const D = door, SPEED = 4.2;
  let si = 0, phase = 'toCounter', path = [D, inside, counter], pi = 0, wait = 0, carrying = false, fx = D.x, fz = D.z, face = 0, ownerArm = 0;
  function setPath(p) { path = p; pi = 0; }
  function walk(dt) { const t = path[Math.min(pi + 1, path.length - 1)]; const dx = t.x - fx, dz = t.z - fz, d = Math.hypot(dx, dz); if (d < 0.05) { pi++; return pi >= path.length - 1; } const s = Math.min(d, SPEED * dt); fx += dx / d * s; fz += dz / d * s; let df = Math.atan2(dx, dz) - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 10); return false; }
  return {
    bun,
    update(dt, active) {
      bun.visible = active; if (!active) return;
      let spd = 0, armOut = 0;
      if (phase === 'toCounter') { spd = SPEED; if (walk(dt)) { phase = 'take'; wait = 1.6; } }
      else if (phase === 'take') { wait -= dt; spd = 0; let df = Math.atan2(owner.x - fx, owner.z - fz) - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 8);
        ownerArm = wait > 0.6 ? 1 : 0; if (wait < 0.8) { carrying = true; armOut = 1; } if (wait <= 0) { phase = 'out'; setPath([counter, inside, D, ...stops[si].path, stops[si].stand]); } }
      else if (phase === 'out') { spd = SPEED; if (walk(dt)) { phase = 'hand'; wait = 1.4; } }
      else if (phase === 'hand') { wait -= dt; const c = stops[si].npc; let df = Math.atan2(c.x - fx, c.z - fz) - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 8); armOut = 1;
        if (wait < 0.7 && carrying) { carrying = false; meals[si].t = 0; onHandoff && onHandoff(stops[si].npc); bun.userData.hop = 1; }
        if (wait <= 0) { phase = 'back'; setPath([stops[si].stand, ...stops[si].path.slice().reverse(), D, inside, counter]); si = (si + 1) % stops.length; } }
      else if (phase === 'back') { spd = SPEED; if (walk(dt)) { phase = 'take'; wait = 1.6; } }
      bun.position.set(fx, 0.06, fz); bun.rotation.y = face; animFox(bun, dt, spd);
      const arm = bun.userData.P && bun.userData.P.arms[1]; if (arm) { if (armOut) { arm.rotation.x = -1.3; arm.rotation.z = 0.15; } else if (carrying) { arm.rotation.x = -0.35; } }
      bag.visible = carrying || (phase === 'take' && wait < 1.2); if (bag.visible) { if (carrying) hand(bun).sub(v.set(0, 0.1, 0)); else hand(owner.c); bag.position.copy(v); bag.rotation.y = face; }
      // Sizzle reaches across the counter with it
      { const oa = owner.c.userData.P && owner.c.userData.P.arms[1]; if (oa && phase === 'take') { oa.rotation.x = -1.35 * Math.max(ownerArm, wait > 0 ? 0.6 : 0); oa.rotation.z = 0.2; } }
      // the customers: bag in the left hand, burger out, three bites, gone
      meals.forEach((m, i) => { const c = stops[i].npc; if (m.t < 0) { m.bag.visible = m.burger.visible = false; return; } m.t += dt; const t = m.t;
        const la = c.c.userData.P && c.c.userData.P.arms[0], ra = c.c.userData.P && c.c.userData.P.arms[1];
        m.bag.visible = t < 6.5; if (m.bag.visible) { if (la) { la.rotation.x = -0.5; } hand(c.c, false, v); m.bag.position.copy(v).add({ x: 0, y: -0.12, z: 0 }); m.bag.rotation.y = c.face; }
        const bites = clamp((t - 1.0) / 4.8, 0, 1), bitePh = (t - 1.0) / 1.6; m.burger.visible = t > 0.8 && t < 6.2;
        if (m.burger.visible && ra) { const lift = t < 1.0 ? 0.6 : 0.6 + 0.9 * Math.max(0, Math.sin(bitePh * Math.PI * 2)); ra.rotation.x = -lift; ra.rotation.z = 0.25; hand(c.c, true, v); m.burger.position.copy(v); m.burger.scale.setScalar(Math.max(0.25, 1 - bites * 0.75)); }
        c.c.userData.lineMood = t > 0.5 && t < 7 ? 'happy' : null; if (t > 8) m.t = -1; });
    },
  };
}
