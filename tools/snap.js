// screenshot helper: the preview iframe does not run frames on its own. snap(view) places the orbit camera, ticks the world and renders once.
export function snap({ tx = 0, tz = 0, dist = 60, pitch = 0.45, yaw = 0.5, night } = {}) {
  const M = window.__meru2, { scene, camera, renderer } = M.K, C = M.orbit; Object.assign(C, { goal: null, tx, tz, dist, pitch, yaw });
  if (night != null) M.setTime(night ? 1 : 0);
  const cp = Math.cos(pitch), sp = Math.sin(pitch); camera.position.set(tx + Math.sin(yaw) * cp * dist, sp * dist + 4, tz + Math.cos(yaw) * cp * dist); camera.lookAt(tx, 0, tz); camera.updateMatrixWorld();
  const now = performance.now(); for (const k of ['city', 'signs', 'nature', 'districts', 'breeze']) try { M[k].tick(0.016, now, camera.position); } catch (e) {}
  if (M.mist) try { M.mist.tick(0.016, now, camera.position); } catch (e) {}
  if (M.walkers) try { M.walkers.tick(0.016, now, camera.position); } catch (e) {}
  renderer.render(scene, camera);
}
// eye-level shot: stand at (x, z), look toward (lx, lz)
export function eye(x, z, lx, lz, h = 1.7, night) {
  const M = window.__meru2, { scene, camera, renderer } = M.K; if (night != null) M.setTime(night ? 1 : 0);
  camera.position.set(x, h, z); camera.lookAt(lx, h * 0.8, lz); camera.updateMatrixWorld(); const now = performance.now();
  for (const k of ['city', 'signs', 'nature', 'districts', 'breeze']) try { M[k].tick(0.016, now, camera.position); } catch (e) {}
  if (M.mist) try { M.mist.tick(0.016, now, camera.position); } catch (e) {}
  if (M.walkers) try { M.walkers.tick(0.016, now, camera.position); } catch (e) {}
  renderer.render(scene, camera);
}
