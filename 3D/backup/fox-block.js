  // ---------- foxes ----------
  const crestTexes = { '8': crestTex('8', '#38bdf8'), U: crestTex('U', '#eab308'), L: crestTex('L', '#eab308'), J: crestTex('J', '#1e3a8a', '#ffffff', '#1e3a8a'), G: crestTex('G', '#38bdf8') };
  // brow (inner, outer) lift, upper-lid drop, iris scale, resting mouth
  const MOOD = {
    neutral: { bi: 0, bo: 0, lid: 0, iris: 1, mouth: 'w' }, happy: { bi: -4, bo: -2, lid: 0, iris: 1, mouth: 'smile' },
    excited: { bi: -8, bo: -6, lid: 0, iris: 1, mouth: 'grin', closed: true }, surprised: { bi: -12, bo: -10, lid: -0.15, iris: 0.68, mouth: 'o' },
    sad: { bi: -9, bo: 4, lid: 0.32, iris: 1, mouth: 'frown' }, stern: { bi: 9, bo: -2, lid: 0.28, iris: 0.95, mouth: 'flat' },
    smug: { bi: 4, bo: -2, lid: 0.38, iris: 1, mouth: 'smirk', browR: -9 }, determined: { bi: 7, bo: -1, lid: 0.18, iris: 1, mouth: 'flat' },
    warm: { bi: -3, bo: 0, lid: 0.16, iris: 1, mouth: 'smile' }, curious: { bi: -2, bo: 0, lid: 0, iris: 1, mouth: 'o', browL: -9 },
  };
  const moodOf = (text, base, isPlayer) => {
    if (/^Shh|Lower your voice/.test(text)) return 'surprised';
    if (/\.\.\.|graves|die |eats .* alive|rotting|ghost/.test(text)) return isPlayer ? 'curious' : 'sad';
    if (/!/.test(text)) return isPlayer ? 'happy' : 'excited';
    if (/\?$/.test(text)) return 'curious';
    return base;
  };
  function drawFace(g, f) {
    const W = 256; g.clearRect(0, 0, W, W);
    const md = MOOD[f.mood] || MOOD.neutral;
    // muzzle + chin
    g.fillStyle = '#fdba74'; g.beginPath(); g.ellipse(128, 168, 62, 44, 0, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(128, 196, 40, 22, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(244,114,182,0.42)'; for (const x of [62, 194]) { g.beginPath(); g.ellipse(x, 154, 17, 9, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(30,41,59,0.45)'; g.lineWidth = 2; g.lineCap = 'round';
    for (const s of [-1, 1]) for (const dy of [0, 9]) { g.beginPath(); g.moveTo(128 + s * 48, 166 + dy); g.lineTo(128 + s * 72, 162 + dy * 1.4); g.stroke(); }
    // eyes
    const eye = (cx, cy, side, col) => {
      const hw = 25, hh = 22, open = Math.max(0, (1 - f.blink) * (1 - Math.max(0, md.lid)));
      g.lineCap = 'round'; g.lineJoin = 'round';
      if (md.closed || open < 0.14) {
        g.strokeStyle = '#1e293b'; g.lineWidth = 6; g.beginPath();
        if (md.closed) { g.moveTo(cx - hw, cy + 6); g.quadraticCurveTo(cx, cy - 18, cx + hw, cy + 6); }
        else { g.moveTo(cx - hw, cy + 2); g.quadraticCurveTo(cx, cy + 10, cx + hw, cy + 2); g.moveTo(cx + side * hw, cy + 2); g.lineTo(cx + side * (hw + 7), cy - 4); }
        g.stroke(); return;
      }
      const ry = hh * open * (1 - Math.min(0, md.lid)), top = cy + hh - ry * 2 + (hh - ry) * -0.0, ccy = cy + (hh - ry) * 0.55;
      g.save(); g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.clip();
      const ir = 17 * md.iris, ix = cx + f.look * 8, iy = ccy + 3;
      const gr = g.createLinearGradient(0, iy - ir, 0, iy + ir); gr.addColorStop(0, '#1e1b2e'); gr.addColorStop(0.45, col); gr.addColorStop(1, '#ffffff');
      g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
      g.fillStyle = '#0b0a12'; g.beginPath(); g.ellipse(ix, iy + 1, 4.5 * md.iris, 10 * md.iris, 0, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ix - 6, iy - 7, 5.5, 0, 7); g.fill(); g.beginPath(); g.arc(ix + 6, iy + 6, 2.6, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = '#1e293b'; g.lineWidth = 6.5; g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke();
      g.beginPath(); g.moveTo(cx + side * hw * 0.92, ccy - ry * 0.35); g.lineTo(cx + side * (hw + 9), ccy - ry * 0.75 - 4); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.ellipse(cx, ccy, hw * 0.92, ry, 0, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
    };
    eye(78, 108, -1, f.eyeL); eye(178, 108, 1, f.eyeR);
    // brows
    g.strokeStyle = '#1e293b'; g.lineWidth = 6; g.lineCap = 'round';
    for (const [cx, side] of [[78, -1], [178, 1]]) {
      const extra = side < 0 ? (md.browL || 0) : (md.browR || 0);
      const ix = cx - side * 14, ox = cx + side * 20, iy = 74 + md.bi + extra, oy = 72 + md.bo + extra;
      g.beginPath(); g.moveTo(ix, iy); g.quadraticCurveTo((ix + ox) / 2, Math.min(iy, oy) - 5, ox, oy); g.stroke();
    }
    // mouth
    const m = f.mouth, mx = 128, my = 182; g.strokeStyle = '#1e293b'; g.lineWidth = 4;
    if (m > 0.08 || md.mouth === 'grin') {
      const open = Math.max(m, md.mouth === 'grin' ? 0.55 : 0), w = 15 + open * 8 + (md.mouth === 'grin' ? 8 : 0), h = 5 + open * 17;
      const off = md.mouth === 'smirk' ? 5 : 0;
      g.fillStyle = '#5b1a2a'; g.beginPath(); g.moveTo(mx - w + off, my - 2); g.quadraticCurveTo(mx + off, my - 2 - (md.mouth === 'grin' ? -2 : 3), mx + w + off, my - 2); g.quadraticCurveTo(mx + off, my + h * 1.5, mx - w + off, my - 2); g.fill(); g.stroke();
      g.save(); g.clip(); g.fillStyle = '#f0708a'; g.beginPath(); g.ellipse(mx + off, my + h * 1.05, w * 0.6, h * 0.55, 0, 0, 7); g.fill(); g.restore();
    } else {
      g.beginPath();
      if (md.mouth === 'w') { g.moveTo(mx - 14, my - 4); g.quadraticCurveTo(mx - 7, my + 6, mx, my - 2); g.quadraticCurveTo(mx + 7, my + 6, mx + 14, my - 4); }
      else if (md.mouth === 'smile') { g.moveTo(mx - 18, my - 6); g.quadraticCurveTo(mx, my + 12, mx + 18, my - 6); }
      else if (md.mouth === 'o') { g.ellipse(mx, my + 1, 6, 7, 0, 0, 7); g.fillStyle = '#5b1a2a'; g.fill(); }
      else if (md.mouth === 'frown') { g.moveTo(mx - 12, my + 4); g.quadraticCurveTo(mx, my - 6, mx + 12, my + 4); }
      else if (md.mouth === 'smirk') { g.moveTo(mx - 12, my); g.quadraticCurveTo(mx + 4, my + 4, mx + 16, my - 8); }
      else { g.moveTo(mx - 11, my + 1); g.lineTo(mx + 11, my + 1); }
      g.stroke();
    }
    g.strokeStyle = '#1e293b'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx, 158); g.lineTo(mx, my - 4); g.stroke();
  }
  function latheColored(profile, colorAt, segs = 20) {
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs);
    const p = geo.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
    for (let i = 0; i < p.count; i++) { colorAt(p.getY(i), col); c.set([col.r, col.g, col.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); geo.computeVertexNormals(); return geo;
  }
  const vcToon = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
  const C3 = h => new THREE.Color(h);
  const tailGeo = (() => {
    const prof = [[0, 0], [0.08, 0.06], [0.17, 0.2], [0.25, 0.38], [0.29, 0.55], [0.27, 0.72], [0.2, 0.86], [0.1, 0.96], [0, 1.02]];
    const o1 = C3('#c2410c'), o2 = C3('#fb923c'), wh = C3('#ffffff');
    const g = latheColored(prof, (y, c) => y > 0.74 ? c.copy(wh) : c.copy(o1).lerp(o2, y / 0.74), 18);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, p.getZ(i) - y * y * 0.42); p.setY(i, y * 0.95); }
    g.computeVertexNormals(); return g;
  })();
  function makeFox({ key, torso, crest, bow, glasses, cane, chair, eyes = ['#f472b6', '#2dd4bf'], mood = 'neutral' }) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const P = { body };
    const fur = toon('#f07a2a'), furDark = toon('#c2410c'), white = toon('#ffffff'), ink = toon('#1e293b'), leg = toon('#e2e8f0'), boot = toon('#0f172a');
    const lift = chair ? 0.28 : 0;
    P.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.14, 0.5 + lift, 0); body.add(p);
      M(new THREE.CapsuleGeometry(0.095, 0.24, 4, 10), leg, 0, -0.2, 0, p, 0.025);
      M(new THREE.SphereGeometry(0.14, 14, 10), boot, 0, -0.42, 0.05, p, 0.022, 0.14).scale.set(1, 0.62, 1.35);
      if (chair) p.rotation.x = -1.45; return p; });
    const t0 = C3(torso[0]), t1 = C3(torso[1]), t2 = C3(torso[2]);
    const tunic = latheColored([[0, 0.4], [0.24, 0.4], [0.32, 0.47], [0.3, 0.56], [0.25, 0.68], [0.26, 0.8], [0.31, 0.98], [0.35, 1.1], [0.3, 1.2], [0.14, 1.26], [0, 1.27]],
      (y, c) => y < 0.6 ? c.copy(t2) : y > 1.13 ? c.copy(t0).lerp(t1, 0.25) : c.copy(t1).lerp(t0, (y - 0.6) * 0.35), 22);
    M(tunic, vcToon, 0, lift, 0, body, 0.03);
    M(new THREE.TorusGeometry(0.255, 0.035, 8, 26), toon(torso[2]), 0, 0.68 + lift, 0, body, 0).rotation.x = Math.PI / 2;
    M(new THREE.BoxGeometry(0.09, 0.07, 0.03), toon('#e6b45a'), 0, 0.68 + lift, 0.27, body, 0.01);
    M(new THREE.SphereGeometry(0.15, 14, 10), white, 0, 1.13 + lift, 0.2, body, 0.02, 0.15).scale.set(1.1, 0.75, 0.55);
    for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.15, 14, 10), white, s * 0.33, 1.14 + lift, 0, body, 0.022, 0.15).scale.set(1.05, 0.62, 1.05);
    const cr = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshToonMaterial({ map: crestTexes[crest], gradientMap: grad })); cr.position.set(0, 0.94 + lift, 0.3); cr.rotation.x = -0.18; body.add(cr);
    P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.39, 1.1 + lift, 0); body.add(p);
      M(new THREE.CapsuleGeometry(0.075, 0.26, 4, 10), toon(torso[1]), 0, -0.17, 0, p, 0.022);
      M(new THREE.SphereGeometry(0.095, 12, 8), fur, 0, -0.38, 0.01, p, 0.02, 0.095); return p; });
    // head
    const head = new THREE.Group(); head.position.y = 1.6 + lift; body.add(head); P.head = head;
    const skull = M(new THREE.SphereGeometry(0.4, 32, 24), fur, 0, 0, 0, head, 0.04, 0.4); skull.scale.set(1.14, 0.96, 1);
    const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fctx = fc.getContext('2d');
    const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 4;
    const faceMat = new THREE.MeshToonMaterial({ map: ftex, transparent: true, alphaTest: 0.04, gradientMap: grad, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.403, 36, 28, Math.PI / 2 - 0.85, 1.7, Math.PI / 2 - 0.75, 1.5), faceMat); skull.add(mask);
    M(new THREE.SphereGeometry(0.048, 12, 8), toon('#0b0a12'), 0, -0.05, 0.402, skull, 0).scale.set(1.35, 0.85, 0.8);
    for (const s of [-1, 1]) for (const [dy, dz, len, rz] of [[-0.06, 0.08, 0.24, 0.3], [-0.16, 0.04, 0.2, 0.75], [0.04, 0.02, 0.18, -0.05]]) {
      const t = M(new THREE.ConeGeometry(0.075, len, 6), white, s * 0.43, dy, dz, head, 0.018); t.rotation.z = s * (Math.PI / 2 + rz);
    }
    for (const [x, rz, h] of [[-0.08, 0.35, 0.2], [0, 0, 0.24], [0.08, -0.35, 0.2]]) { const t = M(new THREE.ConeGeometry(0.07, h, 6), fur, x, 0.38, 0.12, head, 0.018); t.rotation.set(0.5, 0, rz); }
    P.ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.24, 0.27, -0.02); e.rotation.z = -s * 0.3; head.add(e);
      const outer = M(new THREE.ConeGeometry(0.17, 0.48, 4), ink, 0, 0.22, 0, e, 0.022); outer.rotation.y = Math.PI / 4; outer.scale.z = 0.5;
      const inner = M(new THREE.ConeGeometry(0.1, 0.32, 4), toon('#9d174d'), 0, 0.17, 0.05, e, 0); inner.rotation.y = Math.PI / 4; inner.scale.z = 0.35;
      const fl = M(new THREE.ConeGeometry(0.06, 0.2, 5), white, 0, 0.06, 0.08, e, 0); fl.rotation.x = 0.4;
      return e; });
    if (bow) { const b = new THREE.Group(); b.position.set(0, 0.36, 0.12); b.rotation.x = -0.35; head.add(b);
      for (const s of [-1, 1]) { const w = M(new THREE.SphereGeometry(1, 14, 10), white, s * 0.11, 0, 0, b, 0.012); w.scale.set(0.11, 0.075, 0.045); w.rotation.z = s * 0.25; }
      M(new THREE.BoxGeometry(0.075, 0.07, 0.06), toon('#1e293b'), 0, 0, 0.01, b, 0.01); M(new THREE.SphereGeometry(0.018, 6, 4), toon('#38bdf8', { emissive: new THREE.Color('#38bdf8'), emissiveIntensity: 0.6 }), 0, 0, 0.045, b, 0); }
    if (glasses) { const lens = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.42 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 22), toon('#334155')); r.position.set(s * 0.13, 0.03, 0.43); r.scale.x = 0.95 / 1.14; skull.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(0.095, 22), lens); l.position.set(s * 0.13, 0.03, 0.432); l.scale.x = 0.95 / 1.14; skull.add(l); } M(new THREE.BoxGeometry(0.08, 0.018, 0.018), toon('#334155'), 0, 0.05, 0.44, skull, 0); }
    if (cane) { const c = M(new THREE.CylinderGeometry(0.017, 0.017, 1.25, 6), white, 0, -0.9, 0.22, P.arms[1], 0.012); c.rotation.x = 0.35; M(new THREE.SphereGeometry(0.035, 6, 4), toon('#dc2626'), 0, -0.62, 0, c, 0); }
    const tail = new THREE.Group(); tail.position.set(0, 0.6 + lift, -0.24); body.add(tail); P.tail = tail;
    const tm = M(tailGeo, vcToon, 0, 0, 0, tail, 0.03); tm.rotation.x = -1.05;
    if (chair) {
      const ch = new THREE.Group(); g.add(ch); P.wheels = [];
      M(new THREE.BoxGeometry(0.7, 0.08, 0.6), toon('#334155'), 0, 0.6, 0, ch, 0.025); M(new THREE.BoxGeometry(0.7, 0.75, 0.08), toon('#334155'), 0, 1.0, -0.3, ch, 0.025);
      for (const s of [-1, 1]) { const w = M(new THREE.TorusGeometry(0.42, 0.045, 8, 28), toon('#0f172a'), s * 0.43, 0.45, -0.05, ch, 0.015); w.rotation.y = Math.PI / 2; M(new THREE.TorusGeometry(0.36, 0.015, 4, 20), toon('#cbd5e1'), 0, 0, 0, w, 0); P.wheels.push(w); M(new THREE.SphereGeometry(0.08, 8, 6), toon('#0f172a'), s * 0.3, 0.08, 0.32, ch, 0.01, 0.08); }
      M(new THREE.BoxGeometry(0.5, 0.05, 0.25), toon('#334155'), 0, 0.12, 0.4, ch, 0.015);
    }
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material !== faceMat) o.castShadow = true; });
    g.userData = { P, phase: rr(0, 6), amt: 0, blink: rr(1, 4), blinkT: 0, chair: !!chair, base: mood, mood, moodT: 0, look: 0, lookT: rr(1, 3), lookTo: 0, mouth: 0, talking: false, hop: 0, hopY: 0,
      face: { ctx: fctx, tex: ftex, eyeL: eyes[0], eyeR: eyes[1], key: '' }, lookAt: null };
    scene.add(g); return g;
  }
  const tmpV = new THREE.Vector3();
  function animFox(c, dt, speed, air = false) {
    const u = c.userData, P = u.P, mv = speed > 0.2; u.phase += dt * (mv ? 3 + speed * 1.4 : 1.4); u.amt = damp(u.amt, mv ? Math.min(1, speed / 4) : 0, 10, dt);
    const mood = u.lineMood || u.mood, md = MOOD[mood] || MOOD.neutral, lively = mood === 'excited' || mood === 'happy';
    const sw = Math.sin(u.phase) * 0.9 * u.amt;
    if (u.hop > 0) { u.hop = Math.max(0, u.hop - dt * 2.6); }
    u.hopY = Math.sin((1 - u.hop) * Math.PI) * (u.hop > 0 ? 0.22 : 0);
    if (!u.chair) {
      P.legs[0].rotation.x = air ? -0.6 : sw; P.legs[1].rotation.x = air ? 0.4 : -sw;
      P.arms[0].rotation.x = air ? -2.3 : -sw * 0.8; P.arms[1].rotation.x = air ? -2.3 : sw * 0.8;
      P.body.position.y = Math.abs(Math.sin(u.phase)) * 0.06 * u.amt + u.hopY + (mv ? 0 : Math.sin(u.phase * 1.3) * 0.008);
    } else { P.wheels.forEach(w => w.rotation.x += speed * dt / 0.42); P.arms.forEach(a => a.rotation.x = -0.5 + Math.sin(u.phase) * 0.4 * u.amt); P.body.position.y = u.hopY * 0.4; }
    if (u.talking && !mv && !u.chair) { P.arms[1].rotation.x = -0.5 + Math.sin(u.phase * 2.2) * 0.25; P.arms[1].rotation.z = 0.35; } else { P.arms[1].rotation.z = 0.12; }
    P.arms[0].rotation.z = -0.12;
    P.body.rotation.x = damp(P.body.rotation.x, mv ? 0.08 * u.amt : (mood === 'sad' ? 0.06 : mood === 'excited' ? -0.05 : 0), 6, dt);
    // tail + ears by mood
    const wag = lively ? 2.6 : mv ? 1 : 0.6;
    P.tail.rotation.y = Math.sin(u.phase * wag) * (lively ? 0.55 : 0.32); P.tail.rotation.x = (mood === 'sad' ? 0.5 : -0.1) + Math.sin(u.phase * 0.5) * 0.08;
    const earX = mood === 'sad' ? 0.55 : mood === 'stern' || mood === 'determined' ? 0.28 : mood === 'surprised' || lively ? -0.18 : 0;
    const earZ = mood === 'sad' ? 0.35 : 0;
    P.ears.forEach((e, i) => { const s = i ? 1 : -1; const flick = i === 1 && (u.phase % 7) < 0.22 ? -0.35 : 0; e.rotation.x = damp(e.rotation.x, earX + flick, 10, dt); e.rotation.z = damp(e.rotation.z, -s * (0.3 + earZ), 8, dt); });
    // head: look at a target, idle tilt
    let hy = 0, hx = mood === 'sad' ? 0.12 : 0;
    if (u.lookAt) { c.updateWorldMatrix(true, false); tmpV.copy(u.lookAt); c.worldToLocal(tmpV); hy = clamp(Math.atan2(tmpV.x, tmpV.z), -0.85, 0.85); hx += clamp(-Math.atan2(tmpV.y - 1.6, Math.hypot(tmpV.x, tmpV.z)) * 0.5, -0.25, 0.25); }
    P.head.rotation.y = damp(P.head.rotation.y, hy, 6, dt); P.head.rotation.x = damp(P.head.rotation.x, hx, 6, dt);
    P.head.rotation.z = damp(P.head.rotation.z, (mood === 'curious' ? 0.16 : 0) + Math.sin(u.phase * 0.35) * 0.04, 5, dt);
    // face
    u.blink -= dt; if (u.blink < 0) { u.blinkT = 0.14; u.blink = rr(2, 5); } u.blinkT = Math.max(0, u.blinkT - dt);
    const bl = u.blinkT > 0 ? Math.sin((u.blinkT / 0.14) * Math.PI) : 0;
    u.lookT -= dt; if (u.lookT < 0) { u.lookT = rr(1.2, 3.5); u.lookTo = u.lookAt || u.talking ? 0 : pick([-1, -0.6, 0, 0, 0.6, 1]); }
    u.look = damp(u.look, u.lookTo, 8, dt);
    u.mouth = u.talking ? Math.max(0, Math.sin(u.phase * 7.5)) * 0.85 + 0.1 : damp(u.mouth, 0, 14, dt);
    const f = u.face, key = `${Math.round(bl * 4)}|${mood}|${Math.round(u.mouth * 5)}|${Math.round(u.look * 4)}`;
    if (key !== f.key) { f.key = key; drawFace(f.ctx, { eyeL: f.eyeL, eyeR: f.eyeR, blink: Math.round(bl * 4) / 4, mood, mouth: Math.round(u.mouth * 5) / 5, look: Math.round(u.look * 4) / 4 }); f.tex.needsUpdate = true; }
  }

