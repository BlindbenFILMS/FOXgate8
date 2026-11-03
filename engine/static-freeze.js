// s651 STATIC FREEZE (Ben: "freeze what never moves"): three.js recomposes every object's matrix every frame (≈ 74 k objects in Meru,
// ≈ 40 ms a frame in the preview). freezer(scene, camera) watches each object's position / rotation / scale; an object that has not
// moved for 2 full checks gets matrixAutoUpdate = false (its matrix stays as it is, no recompute). The moment its values change again it
// wakes up (matrixAutoUpdate = true). Objects near the camera are checked EVERY frame (doors, rides, NPCs wake at once); the rest in a
// rolling sweep (~4000 a frame). Foxes (userData.P) and their parts are never frozen (they animate every frame anyway).
// ?nofreeze=1 = off. window.__freeze = { frozen, total }.
export function freezer(scene, camera, { perFrame = 4000, hotR = 35 } = {}) {
  const list = [], snap = [], calm = new Uint8Array(0); let C = calm, idx = 0, hot = [], hotT = 0, frozen = 0;
  const skip = o => { for (let p = o; p; p = p.parent) if (p.userData && (p.userData.P || p.userData.noFreeze)) return true; return o.isCamera || o.isLight; };
  function collect() { list.length = 0; scene.traverse(o => { if (o !== scene && o.matrixAutoUpdate !== false && !skip(o)) list.push(o); }); C = new Uint8Array(list.length); snap.length = list.length;
    for (let i = 0; i < list.length; i++) snap[i] = rec(list[i]); }
  const rec = o => { const p = o.position, q = o.quaternion, s = o.scale; return [p.x, p.y, p.z, q.x, q.y, q.z, q.w, s.x, s.y, s.z]; };
  const same = (o, a) => { const p = o.position, q = o.quaternion, s = o.scale; return a[0] === p.x && a[1] === p.y && a[2] === p.z && a[3] === q.x && a[4] === q.y && a[5] === q.z && a[6] === q.w && a[7] === s.x && a[8] === s.y && a[9] === s.z; };
  function check(i) { const o = list[i]; if (!o || !o.parent) return; const a = snap[i];
    if (same(o, a)) { if (C[i] < 2) { C[i]++; if (C[i] === 2 && o.matrixAutoUpdate) { o.updateMatrix(); o.matrixAutoUpdate = false; frozen++; } } }
    else { snap[i] = rec(o); if (!o.matrixAutoUpdate) { o.matrixAutoUpdate = true; frozen--; o.matrixWorldNeedsUpdate = true; } C[i] = 0; } }
  const V = { x: 0, z: 0 };
  function rebuildHot() { hot = []; const cx = camera.position.x, cz = camera.position.z, r2 = hotR * hotR; for (let i = 0; i < list.length; i++) { const e = list[i].matrixWorld.elements, dx = e[12] - cx, dz = e[14] - cz; if (dx * dx + dz * dz < r2) hot.push(i); } }
  let started = false, rescanT = 0, logT = 3;
  return { start() { if (/[?&]nofreeze=1/.test(location.search)) return; collect(); rebuildHot(); started = true; },
    tick(dt) { if (!started) return; if ((hotT -= dt) <= 0) { hotT = 1; rebuildHot(); } if ((rescanT -= dt) <= 0) { rescanT = 20; const n0 = list.length; let n = 0; scene.traverse(() => n++); if (Math.abs(n - n0) > 50) { for (const o of list) if (!o.matrixAutoUpdate) o.matrixAutoUpdate = true; frozen = 0; collect(); rebuildHot(); } }
      for (const i of hot) check(i); for (let k = 0; k < perFrame && list.length; k++) { check(idx); idx = (idx + 1) % list.length; }
      window.__freeze = { frozen, total: list.length, hot: hot.length }; if ((logT -= dt) <= 0 && /[?&]loadlog=1/.test(location.search)) { logT = 10; console.log('[freeze] ' + frozen + ' of ' + list.length + ' still · ' + hot.length + ' near'); } },
    stop() { for (const o of list) if (o && !o.matrixAutoUpdate) o.matrixAutoUpdate = true; started = false; } };
}
