// 8 GATES — creature FX for every creature: soft shadow blob, white hit flash + squash, spawn / despawn by type.
// fx.attach(g) once after build; per frame call fx.pre(g) BEFORE animate and fx.post(g, dt) AFTER; fx.hit(g); fx.spawn(g); fx.despawn(g, done).
const DIG = /^(crab|scarab|serpent|wyrm|worm|mole|spore|thorn|beast)$/, FLY = /^(hornet|queen|moths|belt|octo|flamingo)$/, FADE = /^(devil|stealth|corsair|gang|crew|night|shrike|fed|urbeast)$/;
export function creatureFx(THREE) {
  let blobTex = null;
  const tex = () => { if (blobTex) return blobTex; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.6, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); blobTex = new THREE.CanvasTexture(c); return blobTex; };
  const white = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const ease = k => k * k * (3 - 2 * k), back = k => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
  function attach(g) {
    const U = g.userData; if (U.fx) return;
    const face = new Set(); if (U.cface) U.cface.g.traverse(o => face.add(o)); if (U.face && U.face.tex) g.traverse(o => { if (o.isMesh && o.material && o.material.map === U.face.tex) face.add(o); });
    const box = new THREE.Box3().setFromObject(g), sz = box.getSize(new THREE.Vector3()), r = Math.max(0.35, Math.min(2.6, Math.max(sz.x, sz.z) * 0.42));
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex(), transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.025; blob.scale.set(r * 2, r * 2 * 0.8, 1); blob.renderOrder = 1; g.add(blob);
    const meshes = []; g.traverse(o => { if (o.isMesh && o !== blob && !face.has(o) && o.material && !Array.isArray(o.material) && o.material.side !== THREE.BackSide && !o.material.transparent) meshes.push(o); });
    U.fx = { blob, meshes, base: g.scale.clone(), flash: 0, squash: 0, y: 0, spawnT: -1, outT: -1, kind: DIG.test(U.family) ? 'dig' : FLY.test(U.family) ? 'fly' : FADE.test(U.family) ? 'fade' : 'drop', h: sz.y, swapped: false };
  }
  function pre(g) { const F = g.userData.fx; if (!F) return; g.position.y -= F.y; F.y = 0; g.scale.copy(F.base); }
  function post(g, dt) {
    const F = g.userData.fx; if (!F) return;
    // hit flash: swap to white for a few frames
    if (F.flash > 0) { F.flash -= dt; if (!F.swapped) { F.meshes.forEach(m => { m.userData.fxMat = m.material; m.material = white; }); F.swapped = true; } }
    if (F.flash <= 0 && F.swapped) { F.meshes.forEach(m => { m.material = m.userData.fxMat; }); F.swapped = false; }
    // squash on impact
    let sx = 1, sy = 1; if (F.squash > 0) { F.squash -= dt; const k = Math.max(0, F.squash / 0.22), w = Math.sin(k * Math.PI) * 0.18; sx = 1 + w; sy = 1 - w; }
    // spawn / despawn
    let y = 0, sc = 1, op = 1;
    if (F.spawnT >= 0) { F.spawnT += dt; const k = Math.min(1, F.spawnT / (F.kind === 'drop' ? 0.7 : 0.8));
      if (F.kind === 'dig') y = -F.h * (1 - ease(k)); else if (F.kind === 'drop') { y = k < 0.75 ? 7 * (1 - Math.pow(k / 0.75, 2)) : Math.sin((k - 0.75) / 0.25 * Math.PI) * 0.25; if (k >= 0.75 && !F.landed) { F.landed = true; F.onLand && F.onLand(); sx *= 1.25; sy *= 0.75; } } else if (F.kind === 'fly') { y = 4 * (1 - ease(k)); sc = 0.4 + 0.6 * ease(k); } else sc = Math.max(0.01, back(k));
      if (k >= 1) F.spawnT = -1; }
    if (F.outT >= 0) { F.outT += dt; const k = Math.min(1, F.outT / 0.7); if (F.kind === 'dig') y = -F.h * ease(k); else if (F.kind === 'fly') { y = 4 * ease(k); sc = 1 - 0.6 * k; } else sc = Math.max(0.01, 1 - ease(k)); op = 1 - k; if (k >= 1) { F.outT = -1; g.visible = false; const d = F.done; F.done = null; d && d(); } }
    F.y = y; g.position.y += y; g.scale.multiply(new THREE.Vector3(sx * sc, sy * sc, sx * sc));
    F.blob.material.opacity = op * Math.max(0.2, 1 - Math.max(0, y) / 6); F.blob.position.y = 0.025 - y / Math.max(0.01, g.scale.y);   // the shadow stays on the ground
  }
  return {
    attach, pre, post,
    hit(g) { const F = g.userData.fx; if (!F) return; F.flash = 0.07; F.squash = 0.22; },
    spawn(g, onLand) { const F = g.userData.fx; if (!F) return; F.spawnT = 0; F.outT = -1; F.landed = false; F.onLand = onLand; g.visible = true; },
    despawn(g, done) { const F = g.userData.fx; if (!F) { done && done(); return; } F.outT = 0; F.done = done; },
    kindOf: g => g.userData.fx && g.userData.fx.kind,
  };
}
