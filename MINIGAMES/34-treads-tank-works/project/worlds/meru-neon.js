// MERU — animated NEON signs at eye level on the square's buildings: a beer mug filling and foaming (Tavern), a burger stacking
// itself (Burgers), a ball rolling into pins that scatter (Meru Lanes), reels landing 7-7-7 (Casino), a bubbling potion (Item
// Shop), a sword glinting over a shield (Armory), a crystal ball with stars (Fortune Teller), VACANCY / NO VACANCY (apartments).
// Each is a canvas drawn with glowing strokes (additive, so only the tubes show), hung inside a front window or on a stand.
// Redrawn ~12 times a second, only while you are within 55 m.
export function createNeon({ THREE, glowTex }) {
  const signs = [];
  const tube = (x, col, w, path) => { x.save(); x.lineCap = x.lineJoin = 'round'; x.shadowColor = col; x.shadowBlur = 16; x.strokeStyle = col; x.lineWidth = w; x.beginPath(); path(x); x.stroke(); x.shadowBlur = 6; x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = Math.max(1, w * 0.32); x.beginPath(); path(x); x.stroke(); x.restore(); };
  const word = (x, txt, cx, cy, size, col, on = true) => { if (!on) return; x.save(); x.font = `900 ${size}px Archivo, Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = col; x.shadowBlur = 18; x.strokeStyle = col; x.lineWidth = size * 0.14; x.strokeText(txt, cx, cy); x.shadowBlur = 4; x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = size * 0.045; x.strokeText(txt, cx, cy); x.restore(); };
  const circ = (cx, cy, r) => x => x.arc(cx, cy, r, 0, Math.PI * 2);
  const DRAW = {
    beer(x, W, H, t) { const u = (t % 3.2) / 3.2, lvl = Math.min(1, u * 1.4), cx = W * 0.42, top = H * 0.16, bot = H * 0.72, mw = W * 0.34;
      tube(x, '#ffb020', 7, p => { p.moveTo(cx - mw / 2, top); p.lineTo(cx - mw / 2 + 6, bot); p.lineTo(cx + mw / 2 - 6, bot); p.lineTo(cx + mw / 2, top); });
      tube(x, '#ffb020', 7, p => { p.moveTo(cx + mw / 2 - 2, top + 22); p.bezierCurveTo(cx + mw / 2 + 42, top + 22, cx + mw / 2 + 42, bot - 34, cx + mw / 2 - 4, bot - 30); });
      const ly = bot - (bot - top - 8) * lvl; tube(x, '#ffd23a', 5, p => { p.moveTo(cx - mw / 2 + 8, ly); p.lineTo(cx + mw / 2 - 8, ly); });
      for (let i = 0; i < 4; i++) { const by = bot - 10 - ((t * 40 + i * 23) % Math.max(8, bot - ly - 10)); if (by > ly + 4) tube(x, '#fff3c0', 2.5, circ(cx - mw / 4 + i * mw / 6, by, 3)); }
      if (lvl > 0.92) { for (let i = 0; i < 5; i++) tube(x, '#ffffff', 4, circ(cx - mw / 2 + 10 + i * (mw - 20) / 4, top - 6 - Math.sin(t * 6 + i) * 3, 9)); const dr = ((t * 30) % 60); tube(x, '#ffffff', 3, p => { p.moveTo(cx - mw / 2 + 4, top + dr * 0.5); p.lineTo(cx - mw / 2 + 4, top + dr * 0.5 + 10); }); }
      word(x, 'BEER', W * 0.42, H * 0.88, H * 0.13, '#ff4fd8', Math.sin(t * 2.4) > -0.6); word(x, 'ON TAP', W * 0.8, H * 0.5, H * 0.09, '#5fe3ff', Math.floor(t * 1.5) % 2 === 0); },
    burger(x, W, H, t) { const cx = W * 0.5, u = t % 4, n = Math.min(5, Math.floor(u * 2.2)), bw = W * 0.5, base = H * 0.66, blink = u > 3 && Math.floor(u * 8) % 2;
      const layer = (k, y0) => { const yy = y0 - (k === n - 1 ? Math.max(0, (1 - (u * 2.2 - k)) * 30) : 0); return yy; };
      if (n > 0 && !blink) tube(x, '#ff9a2a', 7, p => { const y = layer(0, base); p.moveTo(cx - bw / 2, y - 10); p.lineTo(cx + bw / 2, y - 10); p.quadraticCurveTo(cx + bw / 2, y + 6, cx, y + 6); p.quadraticCurveTo(cx - bw / 2, y + 6, cx - bw / 2, y - 10); });
      if (n > 1 && !blink) tube(x, '#ff3b3b', 9, p => { const y = layer(1, base - 26); p.moveTo(cx - bw / 2 + 4, y); p.lineTo(cx + bw / 2 - 4, y); });
      if (n > 2 && !blink) tube(x, '#ffd23a', 5, p => { const y = layer(2, base - 40); p.moveTo(cx - bw / 2 + 2, y); p.lineTo(cx + bw / 2 - 2, y); p.lineTo(cx + bw / 2 - 14, y + 10); });
      if (n > 3 && !blink) tube(x, '#5cff6a', 5, p => { const y = layer(3, base - 52); p.moveTo(cx - bw / 2, y); for (let i = 0; i <= 8; i++) p.lineTo(cx - bw / 2 + i * bw / 8, y + (i % 2 ? 6 : -2)); });
      if (n > 4 && !blink) tube(x, '#ff9a2a', 7, p => { const y = layer(4, base - 64); p.moveTo(cx - bw / 2, y); p.quadraticCurveTo(cx, y - 56, cx + bw / 2, y); p.closePath(); });
      for (let i = 0; i < 3; i++) { const s = (t * 0.8 + i * 0.33) % 1; tube(x, 'rgba(230,240,255,' + (1 - s).toFixed(2) + ')', 3, p => { const sx = cx - 20 + i * 20, sy = base - 130 - s * 30; p.moveTo(sx, sy + 20); p.bezierCurveTo(sx - 8, sy + 12, sx + 8, sy + 6, sx, sy); }); }
      word(x, 'BURGERS', cx, H * 0.86, H * 0.13, '#ff4fd8'); },
    bowling(x, W, H, t) { const u = (t % 3.4) / 3.4, laneY = H * 0.6, hitAt = 0.55, bx = W * 0.08 + (W * 0.62) * Math.min(1, u / hitAt);
      tube(x, '#5fe3ff', 3, p => { p.moveTo(W * 0.04, laneY + 22); p.lineTo(W * 0.96, laneY + 22); });
      const pins = [[0, 0], [1, -1], [1, 1], [2, -2], [2, 0], [2, 2]];
      pins.forEach(([c, r], i) => { const px = W * 0.74 + c * 15, py = laneY + r * 9; let ox = 0, oy = 0, rot = 0; if (u > hitAt) { const k = (u - hitAt) / (1 - hitAt); ox = (14 + i * 9) * k * (r >= 0 ? 1 : 0.6); oy = -Math.sin(k * Math.PI) * (30 + i * 6) + k * 10 * (r - 0.5); rot = k * (2 + i) * (r >= 0 ? 1 : -1); }
        x.save(); x.translate(px + ox, py + oy); x.rotate(rot); tube(x, i % 2 ? '#ffffff' : '#ff3b3b', 4, p => { p.moveTo(0, 10); p.bezierCurveTo(-7, 6, -6, -4, -2, -6); p.bezierCurveTo(-4, -10, -3, -16, 0, -16); p.bezierCurveTo(3, -16, 4, -10, 2, -6); p.bezierCurveTo(6, -4, 7, 6, 0, 10); }); x.restore(); });
      if (u < hitAt + 0.05) { tube(x, '#3b82f6', 7, circ(bx, laneY + 4, 14)); for (let i = 0; i < 3; i++) tube(x, '#5fe3ff', 2, p => { p.moveTo(bx - 22 - i * 12, laneY + 4 + (i - 1) * 6); p.lineTo(bx - 30 - i * 12, laneY + 4 + (i - 1) * 6); }); }
      word(x, 'STRIKE!', W * 0.5, H * 0.24, H * 0.17, '#ffd23a', u > hitAt && Math.floor(t * 8) % 2 === 0); word(x, 'MERU LANES', W * 0.5, H * 0.88, H * 0.1, '#ff4fd8'); },
    casino(x, W, H, t) { const u = t % 3.6, syms = ['7', '\u2605', '\u2666', 'BAR', '\u2663']; const rw = W * 0.24;
      for (let i = 0; i < 3; i++) { const cx = W * 0.22 + i * (rw + 8), stop = 0.9 + i * 0.45, s = u < stop ? syms[Math.floor(t * 14 + i * 3) % syms.length] : '7';
        tube(x, '#ffd23a', 4, p => p.rect(cx - rw / 2, H * 0.22, rw, H * 0.42)); word(x, s, cx, H * 0.43, H * (s === 'BAR' ? 0.12 : 0.22), u < stop ? '#ffffff' : '#ff3b3b'); }
      word(x, 'JACKPOT', W * 0.5, H * 0.82, H * 0.15, Math.floor(t * 6) % 2 ? '#ff4fd8' : '#5fe3ff', u > 2.3); word(x, 'CASINO', W * 0.5, H * 0.82, H * 0.15, '#ffd23a', u <= 2.3); },
    potion(x, W, H, t) { const cx = W * 0.4, cy = H * 0.52, r = H * 0.2;
      tube(x, '#5fe3ff', 6, p => { p.moveTo(cx - 12, cy - r - 30); p.lineTo(cx - 12, cy - r + 2); p.moveTo(cx + 12, cy - r + 2); p.lineTo(cx + 12, cy - r - 30); p.moveTo(cx - 18, cy - r - 30); p.lineTo(cx + 18, cy - r - 30); }); tube(x, '#5fe3ff', 6, circ(cx, cy, r));
      tube(x, '#c084fc', 4, p => { p.moveTo(cx - r + 8, cy + 4); p.quadraticCurveTo(cx, cy + 4 + Math.sin(t * 3) * 5, cx + r - 8, cy + 4); });
      for (let i = 0; i < 4; i++) { const s = (t * 0.7 + i * 0.25) % 1; tube(x, '#e9d5ff', 2.5, circ(cx - 14 + i * 9, cy + r - 10 - s * (r + 40), 3 + i % 2)); }
      word(x, 'ITEMS', W * 0.76, H * 0.42, H * 0.13, '#5cff6a'); word(x, 'OPEN', W * 0.76, H * 0.62, H * 0.1, '#ff4fd8', Math.floor(t * 1.3) % 2 === 0); },
    armory(x, W, H, t) { const cx = W * 0.38, cy = H * 0.5;
      tube(x, '#ff3b3b', 6, p => { p.moveTo(cx - 40, cy - 46); p.lineTo(cx + 40, cy - 46); p.lineTo(cx + 36, cy + 10); p.quadraticCurveTo(cx, cy + 56, cx, cy + 56); p.quadraticCurveTo(cx, cy + 56, cx - 36, cy + 10); p.closePath(); });
      x.save(); x.translate(cx, cy); x.rotate(-0.7 + Math.sin(t * 1.2) * 0.08); tube(x, '#e5e7eb', 5, p => { p.moveTo(0, -78); p.lineTo(6, -66); p.lineTo(6, 40); p.lineTo(-6, 40); p.lineTo(-6, -66); p.closePath(); }); tube(x, '#ffd23a', 5, p => { p.moveTo(-22, 42); p.lineTo(22, 42); p.moveTo(0, 42); p.lineTo(0, 62); }); x.restore();
      const g = (t * 0.8) % 1; tube(x, '#ffffff', 3, p => { const gx = cx - 50 + g * 100, gy = cy - 52 + g * 100; p.moveTo(gx - 8, gy); p.lineTo(gx + 8, gy); p.moveTo(gx, gy - 8); p.lineTo(gx, gy + 8); });
      word(x, 'ARMS', W * 0.78, H * 0.45, H * 0.15, '#ffd23a'); word(x, '& ARMOR', W * 0.78, H * 0.64, H * 0.09, '#5fe3ff'); },
    fortune(x, W, H, t) { const cx = W * 0.5, cy = H * 0.46, r = H * 0.22;
      tube(x, '#c084fc', 6, circ(cx, cy, r)); tube(x, '#e6b45a', 6, p => { p.moveTo(cx - r * 0.8, cy + r + 10); p.lineTo(cx + r * 0.8, cy + r + 10); p.lineTo(cx + r * 0.6, cy + r - 4); p.lineTo(cx - r * 0.6, cy + r - 4); p.closePath(); });
      tube(x, '#5fe3ff', 3, p => { p.ellipse(cx, cy, r * 0.45, r * 0.25, 0, 0, Math.PI * 2); }); tube(x, '#5fe3ff', 3, circ(cx + Math.sin(t) * 6, cy, 6));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.4, on = Math.sin(t * 3 + i * 1.7) > 0; if (on) tube(x, '#ffffff', 2.5, p => { const sx = cx + Math.cos(a) * (r + 26), sy = cy + Math.sin(a) * (r + 22); p.moveTo(sx - 6, sy); p.lineTo(sx + 6, sy); p.moveTo(sx, sy - 6); p.lineTo(sx, sy + 6); }); }
      word(x, 'FORTUNES', cx, H * 0.88, H * 0.12, '#ff4fd8'); },
    vacancy(x, W, H, t, s) { word(x, 'PENTHOUSE', W * 0.5, H * 0.3, H * 0.2, '#5fe3ff'); const free = !(s && s.rented); word(x, free ? 'VACANCY' : 'NO VACANCY', W * 0.5, H * 0.68, H * (free ? 0.24 : 0.17), free ? '#5cff6a' : '#ff3b3b', free ? Math.floor(t * 1.2) % 2 === 0 : true); },
  };
  return {
    add(parent, o) {
      const pxW = 256, pxH = Math.round(256 * o.h / o.w), cv = document.createElement('canvas'); cv.width = pxW; cv.height = pxH; const x = cv.getContext('2d');
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
      const g = new THREE.Group(); g.position.set(o.x, o.y, o.z); g.rotation.y = o.ry || 0; parent.add(g);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h), mat); m.renderOrder = 4; g.add(m);
      if (o.backing) { const b = new THREE.Mesh(new THREE.BoxGeometry(o.w + 0.16, o.h + 0.16, 0.06), new THREE.MeshBasicMaterial({ color: 0x0b0b12 })); b.position.z = -0.05; g.add(b); const fr = new THREE.Mesh(new THREE.BoxGeometry(o.w + 0.26, o.h + 0.26, 0.04), new THREE.MeshBasicMaterial({ color: 0x2a2a34 })); fr.position.z = -0.08; g.add(fr); }
      if (o.post) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, o.y - o.h / 2 + 0.05, 6), new THREE.MeshBasicMaterial({ color: 0x1e1e24 })); p.position.y = -(o.y - o.h / 2) / 2 - o.h / 2 + 0.02; g.add(p); }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(o.glow || '#ff4fd8'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.3 })); glow.scale.set(o.w * 1.6, o.h * 1.6, 1); glow.position.z = 0.05; g.add(glow);
      const s = { o, x, cv, tex, mat, glow, g, wp: new THREE.Vector3(), acc: 1, t: Math.random() * 10 }; signs.push(s); return s;
    },
    update(dt, P, night, state) {
      for (const s of signs) { s.t += dt; s.acc += dt; if (!s.wpSet) { s.g.getWorldPosition(s.wp); s.wpSet = true; }
        const d = Math.hypot(P.x - s.wp.x, P.z - s.wp.z); s.g.visible = d < 90; if (d > 55 || s.acc < 0.08) continue; s.acc = 0;
        const { x, cv } = s; x.clearRect(0, 0, cv.width, cv.height); x.fillStyle = '#000'; x.fillRect(0, 0, cv.width, cv.height); DRAW[s.o.kind](x, cv.width, cv.height, s.t, state && state[s.o.state]); s.tex.needsUpdate = true;
        s.glow.material.opacity = (0.18 + night * 0.35) * (0.9 + Math.sin(s.t * 9) * 0.05); }
    },
  };
}
