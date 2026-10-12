// MERU 2.0 — art pass: SIGNATURE SIGNS. One fun, animated sign per building (neon tubes drawn on canvas, frames swapped by UV offset),
// colours from the old 2D Meru shop trims (casino gold, lanes sky, tavern butter, item cyan, fortune violet, burgers orange, armory steel).
// Plus a few 3D roof toys: a spinning burger, the bank's gold coin, a casino chip, the tavern's swinging pub board.
// Names only (no new text). Each sign hides when the camera is inside its building or far away (phone: nearer).
export function buildSigns({ THREE, scene, CT, L, city, touch }) {
  const root = new THREE.Group(); scene.add(root);
  const P = touch ? 40 : 64, FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const BK = new THREE.MeshLambertMaterial({ color: 0x1d1b22 }), STEEL = new THREE.MeshLambertMaterial({ color: 0x3a3d44 });
  const signs = [], spin = [], neonMats = [];
  const dim = c => c + '40';
  const glow = (g, col, lw, path, on = 1) => { g.save(); g.lineCap = g.lineJoin = 'round';
    if (on) { g.shadowColor = col; g.shadowBlur = lw * 2.2; g.strokeStyle = col; g.lineWidth = lw; path(); g.stroke(); g.stroke(); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = lw * 0.32; path(); g.stroke(); }
    else { g.strokeStyle = dim(col); g.lineWidth = lw * 0.7; path(); g.stroke(); } g.restore(); };
  const text = (g, t, x, y, px, col, maxW, on = 1, font = '900 ') => { g.save(); g.font = font + px + 'px Archivo, sans-serif'; const m = g.measureText(t).width; if (maxW && m > maxW) { px *= maxW / m; g.font = font + px + 'px Archivo, sans-serif'; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (on) { g.shadowColor = col; g.shadowBlur = px * 0.3; g.strokeStyle = col; g.lineWidth = px * 0.11; g.strokeText(t, x, y); g.strokeText(t, x, y); g.shadowBlur = 0; g.strokeStyle = '#fff'; g.lineWidth = px * 0.03; g.strokeText(t, x, y); }
    else { g.strokeStyle = dim(col); g.lineWidth = px * 0.07; g.strokeText(t, x, y); } g.restore(); };
  const circ = (g, x, y, r) => () => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };
  const poly = (g, pts, close = true) => () => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); };
  // atlas of F frames stacked; tick swaps tex.offset
  function neon(w, h, F, draw) { const W = Math.round(w * P), H = Math.round(h * P);
    const tex = CT(W, H * F, (g) => { for (let f = 0; f < F; f++) { g.save(); g.translate(0, f * H); g.beginPath(); g.rect(0, 0, W, H); g.clip(); draw(g, W, H, f); g.restore(); } });
    tex.repeat.set(1, 1 / F); tex.offset.y = 1 - 1 / F;
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: 0xc4c4c4, side: THREE.DoubleSide }); neonMats.push(m);
    return { mesh: new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), tex, F }; }
  const B = k => L.BUILDINGS.find(b => b.key === k);
  // a sign group on a building's door face: at the roof edge (roof: true, on struts over the parapet) or on the wall (y given)
  function mount(key, o) { const b = B(key); if (!b) return null; const F = FACE[b.face], ry = Math.atan2(F[0], F[1]), h = city.heightOf(key);
    const g = new THREE.Group(); g.rotation.y = ry; const cs = Math.cos(ry), sn = Math.sin(ry), al = o.along || 0, inset = o.roof ? -(o.inset ?? 0.8) : (o.out ?? 0.35);
    g.position.set(b.door[0] + F[0] * inset + cs * al, 0, b.door[1] + F[1] * inset - sn * al); root.add(g);
    const y0 = o.roof ? h + (o.lift ?? 1.1) : o.y; const S = { b, g, h, y0, anim: [], cx: (b.f[0] + b.f[1]) / 2, cz: (b.f[2] + b.f[3]) / 2 }; signs.push(S);
    if (o.w) { const n = neon(o.w, o.h, o.F || 1, o.draw); n.mesh.position.set(0, y0 + o.h / 2, 0.14); g.add(n.mesh); S.anim.push({ n, fps: o.fps || 2, mode: o.mode || 'loop' });
      if (o.backer !== false) { const bk = new THREE.Mesh(new THREE.BoxGeometry(o.w + 0.4, o.h + 0.4, 0.2), BK); bk.position.set(0, y0 + o.h / 2, 0); g.add(bk); }
      if (o.roof) { const sh = y0 - h + 0.1; for (const sx of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.16, sh + o.h * 0.6, 0.16), STEEL); st.position.set(sx * o.w * 0.32, h - 0.1 + (sh + o.h * 0.6) / 2, -0.3); g.add(st);
        const br = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.2), STEEL); br.position.set(sx * o.w * 0.32, h + 0.6, -1.1); br.rotation.x = -0.55; g.add(br); } } }
    return S; }
  const tub = (g, col, lw) => (path, on = 1) => glow(g, col, lw, path, on);

  // ---------- CASINO: rooftop marquee, chasing bulbs, suits light up in turn + a spinning chip ----------
  { const S = mount('casino', { roof: true, w: 24, h: 7, F: 4, fps: 3, inset: 1.2, draw: (g, W, H, f) => {
      const n = 46; for (let i = 0; i < n; i++) { const u = i / n, per = 2 * (W + H) - 0.4 * H; let d = u * per, x, y; const m = 0.1 * H;
        if (d < W - 2 * m) { x = m + d; y = m; } else if ((d -= W - 2 * m) < H - 2 * m) { x = W - m; y = m + d; } else if ((d -= H - 2 * m) < W - 2 * m) { x = W - m - d; y = H - m; } else { d -= W - 2 * m; x = m; y = H - m - Math.min(d, H - 2 * m); }
        glow(g, '#ffd23a', H * 0.02, circ(g, x, y, H * 0.022), (i + f) % 4 === 0); }
      text(g, 'CASINO', W / 2, H * 0.42, H * 0.46, '#f0b429', W * 0.82);
      ['\u2660', '\u2665', '\u2666', '\u2663'].forEach((s, k) => text(g, s, W * (0.2 + k * 0.2), H * 0.79, H * 0.26, k % 2 ? '#ff3fb4' : '#52e3ff', 0, k <= f, '400 ')); } });
    if (S) { const r = 2.6, mats = [new THREE.MeshLambertMaterial({ color: 0xe8e2d6 }), ...[0, 1].map(() => new THREE.MeshLambertMaterial({ map: CT(256, 256, (g, w) => { g.fillStyle = '#c0242a'; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
        g.fillStyle = '#f3f2f2'; for (let k = 0; k < 8; k++) { g.save(); g.translate(128, 128); g.rotate(k * Math.PI / 4); g.fillRect(-16, -128, 32, 34); g.restore(); } g.strokeStyle = '#ffd23a'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 70, 0, 7); g.stroke();
        g.fillStyle = '#ffd23a'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 20 : 48; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.fill(); }) }))];
      const chip = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.5, 32), mats); chip.rotation.x = Math.PI / 2; const piv = new THREE.Group(); piv.position.set(9.5, S.h + 1.1 + r, -4); piv.add(chip); S.g.add(piv);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.2, 8), STEEL); post.position.set(9.5, S.h + 0.6, -4); S.g.add(post); spin.push({ o: piv, v: 0.9 }); } }

  // ---------- MERU LANES: the ball rolls down the lane, frame 4 = pins fly ----------
  mount('bowling', { roof: true, along: -12, w: 18, h: 6, F: 4, fps: 2.2, draw: (g, W, H, f) => {
    text(g, 'MERU LANES', W * 0.5, H * 0.22, H * 0.3, '#38bdf8', W * 0.9);
    glow(g, '#ff3fb4', H * 0.025, poly(g, [[W * 0.05, H * 0.86], [W * 0.95, H * 0.86]], false));
    const pin = (x, y, s, rot, on) => { g.save(); g.translate(x, y); g.rotate(rot); const k = H * 0.16 * s; glow(g, '#f3f2f2', H * 0.018, () => { g.beginPath(); g.moveTo(-0.28 * k, 0); g.quadraticCurveTo(-0.42 * k, -0.55 * k, -0.18 * k, -0.85 * k); g.quadraticCurveTo(-0.3 * k, -1.2 * k, 0, -1.25 * k); g.quadraticCurveTo(0.3 * k, -1.2 * k, 0.18 * k, -0.85 * k); g.quadraticCurveTo(0.42 * k, -0.55 * k, 0.28 * k, 0); g.closePath(); }, on);
      glow(g, '#ec3013', H * 0.014, poly(g, [[-0.2 * k, -0.85 * k], [0.2 * k, -0.85 * k]], false), on); g.restore(); };
    const hit = f === 3; [[0.8, 0], [0.85, 0], [0.9, 0], [0.95, 0]].forEach(([u], i) => pin(W * u + (hit ? (i - 1.5) * W * 0.03 : 0), H * 0.84 - (hit ? H * (0.12 + (i % 2) * 0.16) : 0), 1, hit ? (i - 1.5) * 0.9 : 0, 1));
    if (hit) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; glow(g, '#ffd23a', H * 0.015, poly(g, [[W * 0.86 + Math.cos(a) * H * 0.14, H * 0.6 + Math.sin(a) * H * 0.14], [W * 0.86 + Math.cos(a) * H * 0.26, H * 0.6 + Math.sin(a) * H * 0.26]], false)); }
    const bx = W * [0.14, 0.36, 0.58, 0.76][f], by = H * 0.74, br = H * 0.1; glow(g, '#38bdf8', H * 0.025, circ(g, bx, by, br));
    for (let k = 0; k < 3; k++) { const a = f * 1.4 + k * 0.7; glow(g, '#38bdf8', H * 0.012, circ(g, bx + Math.cos(a) * br * 0.45, by + Math.sin(a) * br * 0.45, br * 0.12)); }
    for (let k = 0; k < 3; k++) glow(g, '#52e3ff', H * 0.012, poly(g, [[bx - br * (1.6 + k * 0.5), by - br * 0.5 + k * br * 0.5], [bx - br * (1.15 + k * 0.4), by - br * 0.5 + k * br * 0.5]], false), f < 3); } });

  // ---------- ITEM SHOP: a potion flask with bubbles rising ----------
  mount('itemshop', { roof: true, w: 9, h: 5, F: 4, fps: 3, draw: (g, W, H, f) => {
    const x = W * 0.22, y = H * 0.6, r = H * 0.26, c = tub(g, '#5fe3ff', H * 0.03);
    c(() => { g.beginPath(); g.arc(x, y, r, -Math.PI * 0.36, Math.PI * 1.36); g.lineTo(x - r * 0.32, y - r * 1.55); g.lineTo(x + r * 0.32, y - r * 1.55); g.closePath(); });
    glow(g, '#c58bff', H * 0.02, poly(g, [[x - r * 0.86, y + r * 0.1], [x + r * 0.86, y + r * 0.1]], false));
    for (let k = 0; k < 4; k++) { const p = ((k * 0.25 + f * 0.25) % 1); glow(g, '#7dff6a', H * 0.012, circ(g, x + Math.sin(k * 2.3) * r * 0.4, y + r * 0.7 - p * r * 2.2, r * (0.07 + 0.04 * (k % 2))), p < 0.92); }
    text(g, 'ITEM', W * 0.68, H * 0.33, H * 0.34, '#5fe3ff', W * 0.56); text(g, 'SHOP', W * 0.68, H * 0.72, H * 0.34, '#f0b429', W * 0.56); } });

  // ---------- ARMORY: shield + crossed swords, a glint runs up the blades ----------
  mount('armory', { roof: true, w: 9, h: 5.5, F: 4, fps: 3, draw: (g, W, H, f) => {
    const x = W * 0.25, y = H * 0.52, s = H * 0.34;
    glow(g, '#e8453c', H * 0.03, () => { g.beginPath(); g.moveTo(x - s * 0.8, y - s * 0.8); g.lineTo(x + s * 0.8, y - s * 0.8); g.quadraticCurveTo(x + s * 0.85, y + s * 0.4, x, y + s); g.quadraticCurveTo(x - s * 0.85, y + s * 0.4, x - s * 0.8, y - s * 0.8); g.closePath(); });
    for (const sd of [-1, 1]) { const ax = x + sd * s * 1.05, ay = y + s * 1.05, bx = x - sd * s * 1.05, by2 = y - s * 1.05; glow(g, '#cbd5e1', H * 0.022, poly(g, [[ax, ay], [bx, by2]], false));
      const gx = ax + (bx - ax) * 0.2, gy = ay + (by2 - ay) * 0.2; glow(g, '#ffd23a', H * 0.02, poly(g, [[gx - sd * s * 0.2 - s * 0.2, gy - s * 0.2 + sd * 0], [gx + s * 0.2, gy + s * 0.2]], false));
      const u = 0.3 + f * 0.2; if (f < 3) glow(g, '#ffffff', H * 0.03, circ(g, ax + (bx - ax) * u, ay + (by2 - ay) * u, H * 0.012)); }
    if (f === 3) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.3; glow(g, '#ffffff', H * 0.012, poly(g, [[x + Math.cos(a) * s * 0.18, y + Math.sin(a) * s * 0.18], [x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4]], false)); }
    text(g, 'ARMORY', W * 0.7, H * 0.52, H * 0.3, '#cbd5e1', W * 0.52); } });

  // ---------- FORTUNE TELLER: crystal ball with an eye that looks round and blinks, stars twinkle ----------
  mount('fortune', { roof: true, w: 9, h: 4.2, F: 4, fps: 1.6, lift: 0.9, draw: (g, W, H, f) => {
    const x = W * 0.22, y = H * 0.5, r = H * 0.32; glow(g, '#c084fc', H * 0.03, circ(g, x, y, r)); glow(g, '#c084fc', H * 0.025, poly(g, [[x - r * 0.7, y + r * 1.25], [x + r * 0.7, y + r * 1.25], [x + r * 0.45, y + r * 0.95], [x - r * 0.45, y + r * 0.95]]));
    const open = [1, 1, 0.45, 0.05][f], px = [0, -0.35, 0, 0][f]; glow(g, '#ffd23a', H * 0.018, () => { g.beginPath(); g.moveTo(x - r * 0.6, y); g.quadraticCurveTo(x, y - r * 0.6 * open, x + r * 0.6, y); g.quadraticCurveTo(x, y + r * 0.6 * open, x - r * 0.6, y); });
    if (open > 0.3) glow(g, '#52e3ff', H * 0.02, circ(g, x + px * r, y, r * 0.16 * open));
    [[0.46, 0.22], [0.92, 0.2], [0.5, 0.82], [0.95, 0.8], [0.08, 0.15]].forEach(([u, v], k) => { const sx = W * u, sy = H * v, q = H * 0.06; glow(g, '#f3f2f2', H * 0.01, poly(g, [[sx, sy - q], [sx + q * 0.25, sy - q * 0.25], [sx + q, sy], [sx + q * 0.25, sy + q * 0.25], [sx, sy + q], [sx - q * 0.25, sy + q * 0.25], [sx - q, sy], [sx - q * 0.25, sy - q * 0.25]]), (k + f) % 2 === 0); });
    text(g, 'FORTUNE', W * 0.68, H * 0.5, H * 0.32, '#c084fc', W * 0.5); } });

  // ---------- BURGERS: neon name + chevrons chasing down to the door, a giant burger spinning on the roof ----------
  { const S = mount('burgers', { roof: true, w: 10, h: 3.2, F: 3, fps: 4, draw: (g, W, H, f) => {
      text(g, 'BURGERS', W * 0.4, H * 0.5, H * 0.56, '#f97316', W * 0.72);
      for (let k = 0; k < 3; k++) { const cx = W * 0.88, cy = H * (0.22 + k * 0.28), q = H * 0.12; glow(g, '#ffd23a', H * 0.035, poly(g, [[cx - q, cy - q * 0.5], [cx, cy + q * 0.5], [cx + q, cy - q * 0.5]], false), k === f); } } });
    if (S) { const bg = new THREE.Group(), M = c => new THREE.MeshLambertMaterial({ color: c }), add = (geo, c, y) => { const m = new THREE.Mesh(geo, M(c)); m.position.y = y; bg.add(m); return m; };
      add(new THREE.CylinderGeometry(2.6, 2.4, 0.7, 24), '#d98a3a', 0.35); add(new THREE.CylinderGeometry(2.75, 2.75, 0.18, 14), '#6fbf3a', 0.8);
      add(new THREE.CylinderGeometry(2.6, 2.6, 0.6, 24), '#5a3020', 1.18); const ch = add(new THREE.BoxGeometry(4.4, 0.12, 4.4), '#ffc93c', 1.53); ch.rotation.y = Math.PI / 4;
      add(new THREE.CylinderGeometry(2.3, 2.3, 0.22, 20), '#e0442c', 1.7); const top = add(new THREE.SphereGeometry(2.6, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#e09a45', 1.8); top.scale.y = 0.62;
      const seeds = []; for (let k = 0; k < 18; k++) { const a = k * 2.4, rr = 0.6 + (k % 5) * 0.38, yy = 1.8 + 1.6 * Math.sqrt(Math.max(0, 1 - (rr / 2.6) ** 2)) * 1.0; const sd = new THREE.Mesh(new THREE.SphereGeometry(0.11, 5, 3), M('#fff4d6')); sd.scale.set(1, 0.5, 1.6); sd.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr); sd.rotation.y = a; bg.add(sd); }
      bg.position.set(0, S.h + 5.4, -6); S.g.add(bg); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 5.6, 8), STEEL); post.position.set(0, S.h + 2.8, -6); S.g.add(post); spin.push({ o: bg, v: 0.6, bob: 0.25, y: S.h + 5.4 }); } }

  // ---------- BANK: a giant gold coin spinning over the pediment ----------
  { const S = mount('bank', { roof: true, w: 0, h: 0 }); if (S) { const face = CT(256, 256, (g) => { const r = g.createRadialGradient(110, 100, 10, 128, 128, 128); r.addColorStop(0, '#ffe58a'); r.addColorStop(1, '#c48a1c'); g.fillStyle = r; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
      g.strokeStyle = '#9a6a12'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke(); g.fillStyle = '#9a6a12'; g.font = '900 150px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 128, 138); });
    const gm = new THREE.MeshPhongMaterial({ map: face, shininess: 90, specular: 0xfff0b0 }), coin = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.55, 40), [new THREE.MeshPhongMaterial({ color: 0xc9962a, shininess: 90 }), gm, gm]); coin.rotation.x = Math.PI / 2;
    const piv = new THREE.Group(); piv.position.set(0, S.h + 6.5, -10); piv.add(coin); S.g.add(piv); const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.4), new THREE.MeshLambertMaterial({ color: 0xece6d8 })); plinth.position.set(0, S.h + 1.3, -10); S.g.add(plinth);
    spin.push({ o: piv, v: 0.8, bob: 0.2, y: S.h + 6.5 }); } }

  // ---------- POLICE: star badge, red / blue sweep ----------
  mount('police', { roof: true, w: 12, h: 4, F: 2, fps: 2.5, lift: 1.3, draw: (g, W, H, f) => {
    const x = W * 0.14, y = H * 0.5, r = H * 0.36, st = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; st.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } glow(g, '#ffd23a', H * 0.03, poly(g, st));
    text(g, 'POLICE', W * 0.58, H * 0.5, H * 0.52, '#e8f2ff', W * 0.62);
    glow(g, '#ff2a2a', H * 0.05, poly(g, [[W * 0.3, H * 0.1], [W * 0.56, H * 0.1]], false), f === 0); glow(g, '#2a6bff', H * 0.05, poly(g, [[W * 0.6, H * 0.1], [W * 0.86, H * 0.1]], false), f === 1);
    glow(g, '#2a6bff', H * 0.05, poly(g, [[W * 0.3, H * 0.9], [W * 0.56, H * 0.9]], false), f === 1); glow(g, '#ff2a2a', H * 0.05, poly(g, [[W * 0.6, H * 0.9], [W * 0.86, H * 0.9]], false), f === 0); } });

  // ---------- CAR RENTAL: a neon car, wheels turning, speed lines ----------
  mount('carRental', { roof: true, w: 8, h: 4, F: 3, fps: 5, draw: (g, W, H, f) => {
    const y = H * 0.56, c = '#ec3013'; glow(g, c, H * 0.03, poly(g, [[W * 0.22, y], [W * 0.24, y - H * 0.16], [W * 0.38, y - H * 0.19], [W * 0.48, y - H * 0.36], [W * 0.68, y - H * 0.36], [W * 0.78, y - H * 0.19], [W * 0.9, y - H * 0.15], [W * 0.92, y], [W * 0.84, y], [W * 0.3, y]]));
    for (const u of [0.36, 0.78]) { const wx = W * u, wr = H * 0.1; glow(g, '#f3f2f2', H * 0.025, circ(g, wx, y + H * 0.02, wr)); for (let k = 0; k < 3; k++) { const a = f * 0.7 + k * 2.09; glow(g, '#f3f2f2', H * 0.012, poly(g, [[wx, y + H * 0.02], [wx + Math.cos(a) * wr, y + H * 0.02 + Math.sin(a) * wr]], false)); } }
    for (let k = 0; k < 3; k++) glow(g, '#52e3ff', H * 0.018, poly(g, [[W * (0.04 + (f % 2) * 0.03), y - H * (0.3 - k * 0.11)], [W * (0.16 + (f % 2) * 0.03), y - H * (0.3 - k * 0.11)]], false));
    text(g, 'CAR RENTAL', W * 0.5, H * 0.86, H * 0.22, '#f3f2f2', W * 0.9); } });

  // ---------- TAVERN: neon script over the door (one letter on the blink) + a painted pub board swinging on an iron bracket ----------
  { const S = mount('tavern', { y: 6.9, out: 0.45, w: 8, h: 1.9, F: 2, mode: 'flicker', draw: (g, W, H, f) => {
      'TAVERN'.split('').forEach((ch, i) => text(g, ch, W * (0.12 + i * 0.152), H * 0.52, H * 0.8, '#ffd166', 0, !(f === 1 && i === 4), 'italic 900 ')); glow(g, '#ff8c3a', H * 0.04, poly(g, [[W * 0.06, H * 0.92], [W * 0.94, H * 0.92]], false)); } });
    if (S) { const brk = new THREE.Group(); brk.position.set(5.6, 5.9, 0); S.g.add(brk); const IR = new THREE.MeshLambertMaterial({ color: 0x24282c });
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.2), IR); arm.position.z = 1.1; brk.add(arm); const st = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.5), IR); st.position.set(0, -0.5, 0.6); st.rotation.x = 0.75; brk.add(st);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), IR); plate.position.set(0, -0.15, 0.03); brk.add(plate);
      const sw = new THREE.Group(); sw.position.set(0, -0.05, 1.5); brk.add(sw); for (const sx of [-0.55, 0.55]) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.03), IR); ch.position.set(0, -0.15, sx); sw.add(ch); }
      const bt = CT(256, 200, (g, w, h) => { g.fillStyle = '#1f3b2c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d6a842'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
        g.fillStyle = '#f3e3b0'; g.fillRect(84, 60, 70, 82); g.fillStyle = '#e0a02a'; g.fillRect(90, 78, 58, 60); g.fillStyle = '#fffaf0'; for (const [x, r] of [[92, 16], [112, 20], [134, 17], [150, 12]]) { g.beginPath(); g.arc(x, 62, r, 0, 7); g.fill(); }
        g.strokeStyle = '#f3e3b0'; g.lineWidth = 9; g.beginPath(); g.arc(158, 100, 20, -1.3, 1.3); g.stroke(); g.fillStyle = '#d6a842'; g.font = 'italic 900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('TAVERN', w / 2, 182); });
      const bm = new THREE.MeshLambertMaterial({ map: bt }), board = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 1.8), [IR, IR, IR, IR, bm, bm]); board.position.y = -1.0; board.rotation.y = Math.PI / 2; sw.add(board);
      const b2 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), bm), b3 = b2.clone(); b2.position.set(0.05, -1.0, 0); b2.rotation.y = Math.PI / 2; b3.position.set(-0.05, -1.0, 0); b3.rotation.y = -Math.PI / 2; sw.add(b2, b3); board.visible = false;
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 1.8), IR); edge.scale.set(0.9, 1.04, 1.03); edge.position.y = -1.0; sw.add(edge);
      spin.push({ o: sw, swing: 0.12 }); } }

  // ---------- apartments: big rooftop channel letters ----------
  mount('crest', { roof: true, lift: 2.6, inset: 1.2, w: 30, h: 4.5, F: 2, mode: 'flicker', draw: (g, W, H, f) => {
    const t = 'CRESTVIEW'; t.split('').forEach((ch, i) => { const x = W * (0.07 + i * 0.107); g.fillStyle = 'rgba(40,36,30,0.9)'; g.fillRect(x - W * 0.045, H * 0.08, W * 0.09, H * 0.84); text(g, ch, x, H * 0.52, H * 0.82, '#fff1c4', W * 0.085, !(f === 1 && i === 3)); }); } });
  mount('lake', { roof: true, lift: 2.6, inset: 1.2, w: 32, h: 5, F: 3, fps: 2, draw: (g, W, H, f) => {
    text(g, 'LAKESIDE', W * 0.5, H * 0.38, H * 0.6, '#52e3ff', W * 0.92);
    glow(g, '#38bdf8', H * 0.04, () => { g.beginPath(); for (let x = 0; x <= W; x += W / 80) { const y = H * 0.84 + Math.sin(x / W * Math.PI * 8 + f * 2.1) * H * 0.06; x ? g.lineTo(x, y) : g.moveTo(x, y); } }); } });

  // ---------- the lake + barracks workshops ----------
  mount('boathouse', { roof: true, w: 13, h: 4.6, F: 3, fps: 3, draw: (g, W, H, f) => {
    const y = H * 0.5; glow(g, '#f3f2f2', H * 0.03, poly(g, [[W * 0.18, y - H * 0.06], [W * 0.56, y - H * 0.06], [W * 0.66, y + H * 0.02], [W * 0.6, y + H * 0.12], [W * 0.24, y + H * 0.12]])); glow(g, '#ec3013', H * 0.025, poly(g, [[W * 0.34, y - H * 0.06], [W * 0.4, y - H * 0.24], [W * 0.5, y - H * 0.24]], false));
    for (let k = 0; k < 3; k++) { const s = ((k + f) % 3) / 3; glow(g, '#38bdf8', H * 0.02, () => { g.beginPath(); g.moveTo(W * (0.16 - s * 0.1), y + H * (0.1 - k * 0.06)); g.quadraticCurveTo(W * (0.1 - s * 0.08), y + H * 0.18, W * (0.04 - s * 0.03), y + H * (0.1 - k * 0.04)); }); }
    glow(g, '#38bdf8', H * 0.02, () => { g.beginPath(); for (let x = W * 0.06; x <= W * 0.94; x += W / 60) { const yy = y + H * 0.2 + Math.sin(x / W * 30 + f * 2) * H * 0.02; x > W * 0.06 ? g.lineTo(x, yy) : g.moveTo(x, yy); } });
    text(g, 'SPEEDBOAT BAY', W * 0.5, H * 0.86, H * 0.2, '#ffd23a', W * 0.9); glow(g, '#ffd23a', H * 0.03, circ(g, W * 0.82, H * 0.38, H * 0.12), f !== 2); } });
  mount('boatworks', { roof: true, w: 12, h: 4.6, F: 2, fps: 1.5, draw: (g, W, H, f) => {
    const x = W * 0.18, y = H * 0.44, s = H * 0.28; glow(g, '#ffd23a', H * 0.03, () => { g.beginPath(); g.moveTo(x, y - s); g.lineTo(x, y + s); g.moveTo(x - s * 0.5, y - s * 0.55); g.lineTo(x + s * 0.5, y - s * 0.55); g.moveTo(x - s * 0.8, y + s * 0.3); g.quadraticCurveTo(x - s * 0.7, y + s * 1.05, x, y + s); g.quadraticCurveTo(x + s * 0.7, y + s * 1.05, x + s * 0.8, y + s * 0.3); });
    glow(g, '#ffd23a', H * 0.025, circ(g, x, y - s * 1.15, s * 0.16)); text(g, "JON'S", W * 0.62, H * 0.3, H * 0.28, '#f97316', W * 0.6, f === 0 || true); text(g, 'BOATWORKS', W * 0.62, H * 0.66, H * 0.28, '#38bdf8', W * 0.64);
    glow(g, '#f3f2f2', H * 0.02, circ(g, x + s * 0.9, y - s * 0.9, H * 0.02), f === 1); } });
  mount('tankWorks', { roof: true, w: 13, h: 4.6, F: 3, fps: 2.5, draw: (g, W, H, f) => {
    const y = H * 0.48, c = '#7dff6a', kick = f === 1 ? -W * 0.012 : 0; glow(g, c, H * 0.028, poly(g, [[W * 0.06 + kick, y + H * 0.1], [W * 0.1 + kick, y - H * 0.06], [W * 0.38 + kick, y - H * 0.06], [W * 0.42 + kick, y + H * 0.1]])); glow(g, c, H * 0.028, poly(g, [[W * 0.16 + kick, y - H * 0.06], [W * 0.2 + kick, y - H * 0.2], [W * 0.3 + kick, y - H * 0.2], [W * 0.33 + kick, y - H * 0.06]]));
    glow(g, c, H * 0.024, poly(g, [[W * 0.3 + kick, y - H * 0.14], [W * 0.5 + kick * 2, y - H * 0.14]], false)); glow(g, c, H * 0.02, () => { g.beginPath(); g.roundRect(W * 0.07 + kick, y + H * 0.1, W * 0.34, H * 0.13, H * 0.06); });
    if (f === 1) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; glow(g, '#ffd23a', H * 0.018, poly(g, [[W * 0.53 + Math.cos(a) * H * 0.04, y - H * 0.14 + Math.sin(a) * H * 0.04], [W * 0.53 + Math.cos(a) * H * 0.12, y - H * 0.14 + Math.sin(a) * H * 0.12]], false)); }
    text(g, 'TANK WORKS', W * 0.78, H * 0.48, H * 0.26, '#ffd23a', W * 0.4); } });

  // ---------- tick ----------
  let night = false, cullT = 0; const far = touch ? 150 : 260;
  function tick(dt, now, cam) { const t = now / 1000;
    if ((cullT -= dt) <= 0) { cullT = 0.25; for (const S of signs) { const [x0, x1, z0, z1] = S.b.f, inB = cam.x > x0 && cam.x < x1 && cam.z > z0 && cam.z < z1 && cam.y < S.h + 1; S.g.visible = !inB && Math.hypot(cam.x - S.cx, cam.z - S.cz) < far; } }
    for (const S of signs) { if (!S.g.visible) continue; for (const a of S.anim) { const F = a.n.F; if (F < 2) continue; let fr;
      if (a.mode === 'flicker') { const k = Math.floor(t * 9), r = Math.sin(k * 12.9898 + S.cx) * 43758.5453; fr = (r - Math.floor(r)) < 0.12 || (Math.floor(t / 4) % 3 === 0 && (k % 9) < 2) ? 1 : 0; }
      else fr = Math.floor(t * a.fps) % F; a.n.tex.offset.y = 1 - (fr + 1) / F; } }
    for (const s of spin) { if (s.swing) { s.o.rotation.x = Math.sin(t * 1.3) * s.swing + Math.sin(t * 2.9) * s.swing * 0.3; continue; } s.o.rotation.y += dt * s.v; if (s.bob) s.o.position.y = s.y + Math.sin(t * 1.6) * s.bob; } }
  function setNight(on) { night = on; for (const m of neonMats) m.color.set(on ? 0xffffff : 0xc4c4c4); }
  return { tick, setNight, stats: { signs: signs.length } };
}
