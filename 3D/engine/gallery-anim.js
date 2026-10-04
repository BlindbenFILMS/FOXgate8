// Blind Canvas gallery: living paintings.
// Each artwork that has an animated version (gallery/anim/<image>.mp4, square, silent, ping-pong loop) fades from the
// still image into the animation while a visitor stands in front of it, and back to the still when they walk away.
// Only a couple play at once (a small pool of <video> elements), so phones stay smooth.
import * as THREE from '../vendor/three/three.module.js';

export function artAnimator({ items, maxActive = 2, fade = 0.9, range = 9 }) {
  // items: [{ mesh: () => Object3D|null (a canvas box, face on its local +z), w, h, url }]
  const slots = [];
  for (let i = 0; i < maxActive; i++) {
    const video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.preload = 'auto'; video.crossOrigin = 'anonymous';
    const tex = new THREE.VideoTexture(video); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const s = { video, tex, mat, plane: null, item: null, a: 0, target: 0, ready: false, failed: new Set() };
    video.addEventListener('playing', () => { s.ready = true; });
    video.addEventListener('error', () => { if (s.item) { s.failed.add(s.item.url); release(s); } });
    slots.push(s);
  }
  const dead = new Set();   // urls that failed to load: never retry them this visit
  const c = new THREE.Vector3(), n = new THREE.Vector3(), d = new THREE.Vector3(), q = new THREE.Quaternion();

  function attach(s, it, mesh) {
    s.item = it; s.a = 0; s.target = 1; s.ready = false; s.mat.opacity = 0;
    s.plane = new THREE.Mesh(new THREE.PlaneGeometry(it.w, it.h), s.mat);
    s.plane.position.z = 0.037; s.plane.renderOrder = 3; mesh.add(s.plane);
    s.video.src = it.url; s.video.currentTime = 0;
    const p = s.video.play(); if (p && p.catch) p.catch(() => {});
  }
  function release(s) {
    if (s.item && s.failed.has(s.item.url)) dead.add(s.item.url);
    if (s.plane) { s.plane.parent && s.plane.parent.remove(s.plane); s.plane.geometry.dispose(); s.plane = null; }
    s.item = null; s.a = 0; s.target = 0; s.ready = false; s.mat.opacity = 0;
    s.video.pause(); s.video.removeAttribute('src'); s.video.load();
  }

  let checkT = 0;
  function update(dt, px, py, pz, busy = false) {   // busy: the visitor is running, so start nothing new (fade out what's playing)
    checkT -= dt;
    if (checkT <= 0) {
      checkT = 0.25;
      // the closest animated paintings you're standing in front of
      const cand = [];
      for (const it of items) {
        if (dead.has(it.url)) continue;
        const m = it.mesh(); if (!m || !m.parent) continue;
        m.getWorldPosition(c); m.getWorldQuaternion(q); n.set(0, 0, 1).applyQuaternion(q);
        d.set(px - c.x, py + 1.2 - c.y, pz - c.z);
        const along = d.dot(n); if (along < 0.3 || along > range) continue;
        const lat = Math.sqrt(Math.max(0, d.lengthSq() - along * along));
        if (lat > Math.max(it.w, it.h) / 2 + 2.5) continue;
        cand.push([d.length(), it]);
      }
      cand.sort((a, b) => a[0] - b[0]);
      if (busy) cand.length = 0;
      const want = new Set(cand.slice(0, slots.length).map(x => x[1]));
      for (const s of slots) if (s.item && !want.has(s.item)) s.target = 0;            // walked away: fade back to the still
      for (const it of want) {
        if (slots.some(s => s.item === it)) { slots.find(s => s.item === it).target = 1; continue; }
        const free = slots.find(s => !s.item) || slots.find(s => s.target === 0 && s.a < 0.05);
        if (free) { if (free.item) release(free); attach(free, it, it.mesh()); }
      }
    }
    for (const s of slots) {
      if (!s.item) continue;
      if (!s.plane.parent || !s.plane.parent.parent) { release(s); continue; }   // the painting was streamed out
      const goal = s.target && s.ready ? 1 : 0;
      s.a += Math.sign(goal - s.a) * Math.min(Math.abs(goal - s.a), dt / fade);
      s.mat.opacity = s.a * s.a * (3 - 2 * s.a);   // smoothstep
      if (s.target === 0 && s.a <= 0) release(s);
    }
  }
  return { update, slots, items, dead, count: () => slots.filter(s => s.item).length };
}
