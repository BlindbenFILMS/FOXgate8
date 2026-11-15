// SKATE PARK for the Blind Canvas gallery (13 Nov 2026, Ben): the 8 GATES skate game, small enough to stand between the BLIND CAN CINEMA and the WHY HOUSE,
// and skated ON THE MAP ITSELF: no other screen. No gallery file is changed; the trees on that ground come out (Ben's OK).
//   const park = setupSkatePark({ THREE, scene, GF, at: { x: 61.5, z: 26.5 }, face: 0, video, ground, logos });   logos = [{ url, u, v, w, h, y }] BLACK stencils with no background (park metres from its middle; w × h = the box the logo is fitted into): on the pad, or upright facing the path when y (its height) is given   GF = await gameFox(…) · ground(x, z) = your floor height outside the park
//   park.update(dt, visitorPosition)        every frame: starts / stops the film on the big screen
//   const sk = makeSkater({ THREE, GF, fox, board, heightAt: park.heightAt, rails: park.rails });   board = await GF.skateboard()
//   every frame: GF.tick(fox, dt, 0); sk.update(dt, { x, z, jump, trick });   x, z = the way the visitor steers (world, length 0..1) · jump / trick = true on the frame the button goes down
//   The skater works ANYWHERE on the map (pass your own heightAt and no rails); the park only adds its ramps + rails. Off the board: remove it and set fox.position.y to the floor.
// THE PARK (24 × 28 m; local +v = the far side): a concrete pad · a quarter pipe on each long edge (a wide mini half-pipe) · a kicker · a ledge · two yellow rails ·
//   a SKATE PARK sign on the path side · the BIG SCREEN (9.6 × 5.4 m, its middle 5.4 m up) on the far side, facing the path, for the WHITE CANE commercial.
// RIDING: steer + push with the stick · JUMP = ollie (on a rail: hop off) · TRICK = kickflip in the air (land before it ends or you bail), manual on the ground · land on a yellow rail to GRIND.
export function setupSkatePark({ THREE, scene, GF, at = { x: 61.5, z: 26.5 }, face = 0, video = '', ground = () => 0, logos = [] }) {
  const W = 24, D = 28, HW = W / 2, HD = D / 2, INK = '#1d1c1b', RED = '#ec3013', WHITE = '#f3f2f2', YEL = '#f5c518', flat = c => new THREE.MeshBasicMaterial({ color: c });
  const G0 = new THREE.Group(); G0.position.set(at.x, 0.02, at.z); G0.rotation.y = face; scene.add(G0);
  const cs = Math.cos(face), sn = Math.sin(face), toLocal = (x, z) => { const dx = x - at.x, dz = z - at.z; return [dx * cs - dz * sn, dx * sn + dz * cs]; };
  const QR = 3.2, QD = 2.6, QH = QR - Math.sqrt(QR * QR - QD * QD), Q0 = HW - 3.6, QV0 = -8, QV1 = 5, qp = d => d <= 0 ? 0 : d >= QD ? QH : QR - Math.sqrt(QR * QR - d * d);
  const KICK = { u0: -1.2, u1: 1.2, v0: -6.4, v1: -3.6, h: 0.75 }, LEDGE = { u0: -5.5, u1: -3.5, v0: 6, v1: 10.5, h: 0.42 };
  const hLocal = (u, v) => { if (Math.abs(u) > HW || Math.abs(v) > HD) return null; let h = 0;
    if (v > QV0 && v < QV1) h = qp(Math.abs(u) - Q0);
    if (u > KICK.u0 && u < KICK.u1 && v > KICK.v0 && v < KICK.v1) h = Math.max(h, (v - KICK.v0) / (KICK.v1 - KICK.v0) * KICK.h);
    if (u > LEDGE.u0 && u < LEDGE.u1 && v > LEDGE.v0 && v < LEDGE.v1) h = Math.max(h, LEDGE.h);
    return h; };
  const heightAt = (x, z) => { const [u, v] = toLocal(x, z), h = hLocal(u, v); return h == null ? ground(x, z) : h + 0.02; };
  const add = (m, x, y, z) => { m.position.set(x, y, z); G0.add(m); return m; }, box = (w, h, d, mat, x, y, z) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), x, y, z);
  // the ground is pale concrete; everything you ride UP is WOOD (Ben, 13 Nov: more contrast between the ground and the ramps)
  const wood = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); for (let i = 0; i < 8; i++) { g.fillStyle = ['#c9965c', '#bf8a50', '#d0a066', '#b98448'][i % 4]; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(70,40,15,0.55)'; g.fillRect(0, i * 32, 256, 2); g.fillRect((i * 83) % 256, i * 32, 2, 32); }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(0.5, 0.5); return new THREE.MeshToonMaterial({ map: tx, gradientMap: GF.toon('#ffffff').gradientMap }); })();
  { const g = new THREE.PlaneGeometry(W, D); g.rotateX(-Math.PI / 2); add(new THREE.Mesh(g, flat('#d6d3cd')), 0, 0, 0); }
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); for (let d = 0.2; d <= QD + 1e-6; d += 0.2) sh.lineTo(d, qp(d)); sh.lineTo(3.6, QH); sh.lineTo(3.6, 0); sh.closePath();   // a quarter pipe = one plywood solid: the curve, the deck, its ends + back
    const g = new THREE.ExtrudeGeometry(sh, { depth: QV1 - QV0, bevelEnabled: false }); if (s < 0) g.rotateY(Math.PI); add(new THREE.Mesh(g, wood), s * Q0, 0.005, s < 0 ? QV1 : QV0); }
  { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(KICK.v1 - KICK.v0, 0); s.lineTo(KICK.v1 - KICK.v0, KICK.h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: KICK.u1 - KICK.u0, bevelEnabled: false }); g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, wood), KICK.u1, 0.005, KICK.v0); }
  box(LEDGE.u1 - LEDGE.u0, LEDGE.h, LEDGE.v1 - LEDGE.v0, GF.toon('#8f8b84'), (LEDGE.u0 + LEDGE.u1) / 2, LEDGE.h / 2, (LEDGE.v0 + LEDGE.v1) / 2); box(0.1, 0.06, LEDGE.v1 - LEDGE.v0, flat(YEL), LEDGE.u1, LEDGE.h, (LEDGE.v0 + LEDGE.v1) / 2); box(0.1, 0.06, LEDGE.v1 - LEDGE.v0, flat(YEL), LEDGE.u0, LEDGE.h, (LEDGE.v0 + LEDGE.v1) / 2);
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, QV1 - QV0, 10), flat(INK)); c.rotation.x = Math.PI / 2; add(c, s * (Q0 + QD), QH, (QV0 + QV1) / 2); box(0.3, 0.06, D, flat(INK), s * (HW - 0.15), 0.03, 0); box(W, 0.06, 0.3, flat(s < 0 ? RED : INK), 0, 0.03, s * (HD - 0.15)); }
  // logos painted on the pad (Ben, 13 Nov): BLACK, with no background, straight on the concrete. Each picture is turned into a black stencil:
  // a picture with its own transparency keeps its shape; a card on a dark ground keeps its bright parts; a card on a light ground keeps its dark parts. Their tops point to the far side, so they read from the path.
  const decal = (m, u, y, v) => { m.rotation.set(-Math.PI / 2, 0, Math.PI); return add(m, u, y, v); };
  logos.forEach(({ url, u = 0, v = 0, w = 6, h = 6, y = null }) => { if (!url) return; const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })), m = y == null ? decal(mesh, u, 0.012, v) : (mesh.rotation.y = Math.PI, add(mesh, u, y, v)), img = new Image();   /* y given = an upright logo at that height, facing the path */ img.crossOrigin = 'anonymous';
    img.onload = () => { const s = Math.min(1, 768 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.max(2, Math.round(img.width * s)); c.height = Math.max(2, Math.round(img.height * s)); const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height), px = d.data, at = (x, y) => (y * c.width + x) * 4, corners = [at(1, 1), at(c.width - 2, 1), at(1, c.height - 2), at(c.width - 2, c.height - 2)];
      const clear = corners.every(i => px[i + 3] < 24), lum = i => (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255, dark = corners.reduce((q, i) => q + lum(i), 0) / 4 < 0.5;
      for (let i = 0; i < px.length; i += 4) { const k = clear ? px[i + 3] / 255 : dark ? lum(i) : 1 - lum(i); px[i] = 29; px[i + 1] = 28; px[i + 2] = 27; px[i + 3] = Math.round(255 * Math.min(1, Math.max(0, (k - 0.12) / 0.6))); }
      g.putImageData(d, 0, 0); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; const asp = c.width / c.height, fw = Math.min(w, h * asp); m.scale.set(fw, fw / asp, 1); m.material.map = tx; m.material.opacity = 1; m.material.needsUpdate = true; };
    img.src = url; });
  // two yellow rails
  const rails = [[3.5, 1.5, 3.5, 8.5, 0.45], [-7, -11, 0, -11, 0.4]].map(([u0, v0, u1, v1, h]) => { const len = Math.hypot(u1 - u0, v1 - v0), bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, len, 10), flat(YEL)); bar.rotation.set(Math.PI / 2, 0, 0); bar.rotation.y = 0; bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(u1 - u0, 0, v1 - v0).normalize()); add(bar, (u0 + u1) / 2, h, (v0 + v1) / 2);
    for (const t of [0.08, 0.5, 0.92]) box(0.05, h, 0.05, flat(INK), u0 + (u1 - u0) * t, h / 2, v0 + (v1 - v0) * t);
    G0.updateMatrixWorld(true); const a = G0.localToWorld(new THREE.Vector3(u0, 0, v0)), b = G0.localToWorld(new THREE.Vector3(u1, 0, v1)); return { x0: a.x, z0: a.z, x1: b.x, z1: b.z, h: h + 0.04, len }; });
  // the signs: SKATE PARK on the path side, the BIG SCREEN on the far side (both face the path)
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const go = () => { draw(c.getContext('2d'), w, h); t.needsUpdate = true; }; go(); if (document.fonts && document.fonts.load) document.fonts.load('800 80px Archivo').then(go, () => {}); return t; };
  const facePath = m => { m.rotation.y = Math.PI; return m; };
  box(5.2, 1.3, 0.12, flat(INK), -6.5, 1.45, -HD - 0.9); box(5.2, 0.08, 0.16, flat(RED), -6.5, 2.14, -HD - 0.9); for (const x of [-8.6, -4.4]) box(0.1, 0.8, 0.1, flat(INK), x, 0.4, -HD - 0.9);
  facePath(add(new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(1000, 220, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = WHITE; g.font = '800 150px Archivo, Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText('SKATE PARK', 8, h / 2 + 8); }) })), -6.5, 1.45, -HD - 0.97));
  const TW = 9.6, TH = 5.4, TY = 5.4, TZ = HD + 1.2, poster = canvasTex(960, 540, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.font = '800 40px Archivo, Arial, sans-serif'; g.fillText('BLIND CANVAS PROJECT', 48, 110); g.fillStyle = WHITE; g.font = '800 104px Archivo, Arial, sans-serif'; g.fillText('THE WHITE CANE', 44, 270); g.fillText('COMMERCIAL', 44, 380); g.font = '600 38px Archivo, Arial, sans-serif'; g.fillText(video ? 'starts as you come near' : 'plays here: the film is still to be added', 48, 470); });
  box(TW + 0.4, TH + 0.4, 0.3, flat(INK), 0, TY, TZ + 0.18); box(TW, 1.0, 0.1, flat(WHITE), 0, TY - TH / 2 - 0.85, TZ + 0.05);   /* a white sponsor board under the screen (upright logos go on it) */ box(TW + 0.4, 0.14, 0.36, flat(RED), 0, TY + TH / 2 + 0.27, TZ + 0.18); for (const x of [-3.4, 3.4]) box(0.34, TY - TH / 2, 0.34, flat(INK), x, (TY - TH / 2) / 2, TZ + 0.2);
  const screenMat = new THREE.MeshBasicMaterial({ map: poster }), tv = facePath(add(new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), screenMat), 0, TY, TZ));
  let vd = null; if (video) { vd = document.createElement('video'); vd.src = video; vd.muted = true; vd.loop = true; vd.playsInline = true; vd.setAttribute('playsinline', ''); vd.crossOrigin = 'anonymous'; vd.preload = 'none';
    vd.addEventListener('playing', () => { if (screenMat.map === poster) { const t = new THREE.VideoTexture(vd); t.colorSpace = THREE.SRGBColorSpace; screenMat.map = t; screenMat.needsUpdate = true; } }); }
  G0.updateMatrixWorld(true); const tvPos = tv.getWorldPosition(new THREE.Vector3()), entrance = G0.localToWorld(new THREE.Vector3(0, 0, -HD - 2.5));
  function update(dt, p) { if (!vd || !p) return; const near = Math.hypot(p.x - tvPos.x, p.z - tvPos.z) < 70; if (near && vd.paused) { const q = vd.play(); if (q && q.catch) q.catch(() => {}); } else if (!near && !vd.paused) vd.pause(); }   // muted: a browser only lets a film start by itself without sound
  return { group: G0, heightAt, rails, update, tv, tvPos, entrance, size: { w: W, d: D }, dispose: () => { scene.remove(G0); if (vd) { vd.pause(); vd.removeAttribute('src'); } } };
}

// THE SKATER: one fox on one board, anywhere on the map. heightAt(x, z) = the floor (park.heightAt, or your own) · rails = park.rails or []
export function makeSkater({ THREE, GF, fox, board, heightAt, rails = [] }) {
  const S = fox.scale.x, MAX = 9, GRAV = 16, BSC = 1.6, LIFT = 0.17 * BSC + 0.04,   /* the board as MERU rides it (worlds/meru2-yards.js): 1.6 times its model, lengthways along the ride, the fox side-on on its deck */ st = { v: 0, head: fox.rotation.y, y: heightAt(fox.position.x, fox.position.z), vy: 0, air: false, rail: null, rt: 0, name: null, t: 0, flip: 0, manual: 0, bail: 0, jumpT: 9 };
  function update(dt, inp = {}) {
    const p = fox.position, mag = Math.min(1, Math.hypot(inp.x || 0, inp.z || 0)), go = mag > 0.1 && st.bail <= 0; st.t += dt; st.jumpT += dt; if (st.bail > 0) st.bail -= dt;
    if (st.rail) { const r = st.rail; st.rt += st.v * dt / r.len; p.x = r.x0 + (r.x1 - r.x0) * st.rt; p.z = r.z0 + (r.z1 - r.z0) * st.rt; st.y = r.h;   // grinding: along the rail, hop off with JUMP or at its end
      if (st.rt >= 1 || st.rt <= 0 || inp.jump) { st.rail = null; st.air = true; st.vy = inp.jump ? 4.2 : 1.6; st.v = Math.abs(st.v); st.jumpT = inp.jump ? 0 : 9; } }
    else {
      if (go) { let d = Math.atan2(inp.x, inp.z) - st.head; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; st.head += d * Math.min(1, dt * (st.air ? 1.2 : 3.4)); }
      const hx = Math.sin(st.head), hz = Math.cos(st.head), e = 0.35, slope = (heightAt(p.x + hx * e, p.z + hz * e) - heightAt(p.x, p.z)) / e;
      if (!st.air) st.v += ((go ? 6 * mag * (1 - st.v / MAX) : 0) - 0.55 * st.v - 9.8 * slope * 0.85) * dt;   // push, roll out, and the ramps give and take speed
      const nx = p.x + hx * st.v * dt, nz = p.z + hz * st.v * dt, h1 = heightAt(nx, nz);
      if (!st.air) { const rise = st.v * slope;
        if (h1 - st.y > 0.3) st.v *= -0.35;   // a wall (the side of the ledge, the end of a pipe): bump back
        else { p.x = nx; p.z = nz; if (rise > 0.6 && h1 < st.y + rise * dt - 0.03) { st.air = true; st.vy = rise; } else if (st.y - h1 > 0.25) { st.air = true; st.vy = 0; } else st.y = h1;   // off a lip with the climb it had · off a drop
          if (!st.air && inp.jump) { st.air = true; st.vy = 4.4 + Math.abs(st.v) * 0.12; st.jumpT = 0; } else if (!st.air && inp.trick) st.manual = 1.2; } }
      else { p.x = nx; p.z = nz; st.vy -= GRAV * dt; st.y += st.vy * dt; if (inp.trick && st.flip <= 0) st.flip = 0.5;
        if (st.vy < 0) for (const r of rails) { const dx = r.x1 - r.x0, dz = r.z1 - r.z0, t = ((p.x - r.x0) * dx + (p.z - r.z0) * dz) / (r.len * r.len); if (t < 0.03 || t > 0.97 || st.y > r.h + 0.3 || st.y < r.h - 0.35) continue;
          if (Math.hypot(p.x - (r.x0 + dx * t), p.z - (r.z0 + dz * t)) < 0.55) { const fwd = hx * dx + hz * dz >= 0; st.rail = r; st.rt = t; st.air = false; st.vy = 0; st.flip = 0; st.v = (fwd ? 1 : -1) * Math.max(3, Math.abs(st.v)); st.head = Math.atan2(fwd ? dx : -dx, fwd ? dz : -dz); break; } }
        if (st.air && st.y <= h1) { st.y = h1; st.air = false; st.vy = 0; if (st.flip > 0.08) { st.bail = 1.1; st.v *= 0.3; } st.flip = 0; } }
    }
    if (st.flip > 0) st.flip = Math.max(0, st.flip - dt); if (st.manual > 0) st.manual -= dt;
    const name = st.bail > 0 ? 'sk_bail' : st.rail ? 'sk_grind' : st.flip > 0 ? 'sk_kickflip' : st.air && st.jumpT < 0.9 ? 'sk_ollie' : st.manual > 0 ? 'sk_manual' : go && !st.air ? 'sk_push' : null;
    if (name !== st.name) { st.name = name; st.t = 0; }
    fox.rotation.y = st.head - Math.PI / 2;   /* side-on, FACING the way he rides (Ben: he was skating backwards) */ p.y = st.y + LIFT * S; board.rotation.order = 'YXZ'; board.scale.setScalar(BSC * S); board.position.set(p.x, st.y, p.z); board.rotation.set(0, st.head, st.flip > 0 ? (1 - st.flip / 0.5) * Math.PI * 2 : 0);
    if (name && GF.FP.FOX_ANIMS[name]) GF.pose(fox, name, st.t, 1);
  }
  return { update, state: st };
}
