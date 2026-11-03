// MERU TAVERN — the POOL TABLE + its long green lamp, lifted from Tavern Pool (3D-foxgate8 repo, 3D-GAMES/g/tavern-games/minigames/tavern/pool-hall.js,
// buildPoolHall: "THE TABLE" + "the long lamp over the table", Luxor colours = Dabb's Table). Same sizes (POOL.S 1.7, bed height 1.05), rails in
// segments between the 6 pockets, felt cushions, diamonds, pocket cups, 6 legs; the lamp shade hangs at 2.95 m. Plus a racked set of balls.
// o = { x, z, a } (a = degrees, 0 = long side runs north-south). Returns { group, box: [x0, x1, z0, z1] half sizes for colliders }.
export const POOL_K = 1.33;   // Ben: 33% bigger than Tavern Pool (footprint, balls, lamp; bed height kept)
export const POOL = { S: 1.7 * POOL_K, Y: 1.05, R: 0.032, PC: 0.064, PM: 0.058, RAIL: 0.2 };
export const POOL_LOOK = { felt: '#1d6b4c', rail: '#5a2614', shade: '#2f5a3a' };   // Dabb's Table (Luxor)
const POCKETS = [[0, 0, 'c'], [1, 0, 'c'], [0, 1, 'm'], [1, 1, 'm'], [0, 2, 'c'], [1, 2, 'c']];
export const POOL_SIZE = (() => { const { S } = POOL, OW = S + 2 * POOL.RAIL * S / 1.7 * 0.9, OL = 2 * S + 2 * POOL.RAIL * S / 1.7 * 0.9; return [OW / 2 + 0.05, OL / 2 + 0.05]; })();

export function buildPoolTable({ THREE: T3, M, toon, grad, parent, o, look = {} }) {
  const TV = { ...POOL_LOOK, ...look }, { S, Y } = POOL, OW = S + 2 * POOL.RAIL * S / 1.7 * 0.9, OL = 2 * S + 2 * POOL.RAIL * S / 1.7 * 0.9;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t; };
  const tmat = tex => new T3.MeshToonMaterial({ map: tex, gradientMap: grad });
  const g = new T3.Group(); g.position.set(o.x, 0, o.z); g.rotation.y = (o.a || 0) * Math.PI / 180; parent.add(g);
  const tbl = new T3.Group(); g.add(tbl);
  const wood = toon(TV.rail), woodD = toon('#2a140a'), brass = toon('#d9a441');
  const railW = (OW - S) / 2, felt = TV.felt;
  const feltT = CT(256, 512, c => { c.fillStyle = felt; c.fillRect(0, 0, 256, 512); { const lg = c.createRadialGradient(128, 256, 30, 128, 256, 300); lg.addColorStop(0, 'rgba(255,240,200,0.16)'); lg.addColorStop(0.6, 'rgba(255,240,200,0.04)'); lg.addColorStop(1, 'rgba(0,0,0,0.22)'); c.fillStyle = lg; c.fillRect(0, 0, 256, 512); } for (let i = 0; i < 2600; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'; c.fillRect(Math.random() * 256, Math.random() * 512, 2, 2); } c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 512 * 0.8); c.lineTo(256, 512 * 0.8); c.stroke(); c.beginPath(); c.arc(128, 512 * 0.8, 256 * 0.17, 0, Math.PI); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.4)'; for (const v of [0.28, 0.5, 0.75]) { c.beginPath(); c.arc(128, 512 * v, 3, 0, 7); c.fill(); } });
  const bed = new T3.Mesh(new T3.PlaneGeometry(S, 2 * S), tmat(feltT)); bed.rotation.x = -Math.PI / 2; bed.position.y = Y; bed.receiveShadow = true; tbl.add(bed);
  M(new T3.BoxGeometry(OW - 0.06, 0.34, OL - 0.06), woodD, 0, Y - 0.2, 0, tbl, 0.025);
  M(new T3.BoxGeometry(OW * 0.8, 0.42, OL * 0.84), wood, 0, Y - 0.55, 0, tbl, 0.02);
  for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) { const leg = M(new T3.BoxGeometry(0.24, Y - 0.32, 0.24), wood, sx * (OW / 2 - 0.25), (Y - 0.32) / 2, sz * (OL / 2 - 0.3), tbl, 0.02); leg.scale.x = sz ? 1 : 0.8; M(new T3.BoxGeometry(0.34, 0.1, 0.34), woodD, sx * (OW / 2 - 0.25), 0.05, sz * (OL / 2 - 0.3), tbl, 0.01); }
  // rails in segments between the pockets + felt cushions on their inner edge
  const cushM = toon(new T3.Color(felt).multiplyScalar(0.8).getStyle()), diamond = toon('#f6f0dc');
  const seg = (x0, z0, x1, z1, nx, nz) => { const len = Math.hypot(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ry = Math.abs(nx) > 0 ? 0 : Math.PI / 2;
    M(ry ? new T3.BoxGeometry(len, 0.13, railW) : new T3.BoxGeometry(railW, 0.13, len), wood, cx + nx * railW / 2, Y + 0.03, cz + nz * railW / 2, tbl, 0.018);
    const c = new T3.Mesh(ry ? new T3.BoxGeometry(len - 0.04, 0.07, 0.05) : new T3.BoxGeometry(0.05, 0.07, len - 0.04), cushM); c.position.set(cx + nx * 0.025, Y + 0.035, cz + nz * 0.025); tbl.add(c);
    for (const k of [0.25, 0.5, 0.75]) { const d = new T3.Mesh(new T3.CircleGeometry(0.018, 8), diamond); d.rotation.x = -Math.PI / 2; d.position.set(x0 + (x1 - x0) * k + nx * railW * 0.55, Y + 0.098, z0 + (z1 - z0) * k + nz * railW * 0.55); tbl.add(d); } };
  const hx = S / 2, hz = S, pc = POOL.PC * S * 1.25, pm = POOL.PM * S * 1.1;
  seg(-hx, -hz + pc, -hx, -pm, -1, 0); seg(-hx, pm, -hx, hz - pc, -1, 0); seg(hx, -hz + pc, hx, -pm, 1, 0); seg(hx, pm, hx, hz - pc, 1, 0);
  seg(-hx + pc, -hz, hx - pc, -hz, 0, -1); seg(-hx + pc, hz, hx - pc, hz, 0, 1);
  // corner blocks + pocket cups
  const black = new T3.MeshBasicMaterial({ color: 0x050505 }), cup = toon('#2a2522');
  for (const [u, v, k] of POCKETS) { const x = (u - 0.5) * S, z = (v - 1) * S, rad = (k === 'c' ? POOL.PC : POOL.PM) * S * 1.08;
    const hole = new T3.Mesh(new T3.CircleGeometry(rad, 20), black); hole.rotation.x = -Math.PI / 2; hole.position.set(x, Y + 0.004, z); tbl.add(hole);
    const ox = Math.sign(u - 0.5) * railW * 0.35, oz = k === 'c' ? Math.sign(v - 1) * railW * 0.35 : 0;
    M(new T3.CylinderGeometry(rad * 1.25, rad * 1.1, 0.13, 16), cup, x + ox, Y + 0.03, z + oz, tbl, 0.015, rad * 1.25);
    const ring = new T3.Mesh(new T3.CircleGeometry(rad * 1.02, 20), black); ring.rotation.x = -Math.PI / 2; ring.position.set(x + ox * 0.6, Y + 0.098, z + oz * 0.6); tbl.add(ring);
    M(new T3.CylinderGeometry(rad * 0.75, rad * 0.5, 0.26, 12), cup, x + ox, Y - 0.17, z + oz, tbl, 0.01, rad * 0.75); }
  // a rack of balls (red / blue + the black in the middle, as Tavern Pool plays it) and the cue ball behind the line
  { const BR = POOL.R * S, n = 16, im = new T3.InstancedMesh(new T3.SphereGeometry(BR, 14, 10), new T3.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), n), m4 = new T3.Matrix4(), c3 = new T3.Color(); let k = 0;
    im.name = 'poolRack';   // s87: the Barkeep's RACK THE TABLE job hides it while you rack
    const COLS = ['#e0442a', '#2f6fd8']; for (let r = 0; r < 5; r++) for (let i = 0; i <= r; i++, k++) { const x = (i - r / 2) * BR * 2.02, z = -0.5 * S - r * BR * 1.75; im.setMatrixAt(k, m4.makeTranslation(x, Y + BR, z)); im.setColorAt(k, c3.set(r === 2 && i === 1 ? '#17161a' : COLS[(k + r) % 2])); }
    im.setMatrixAt(k, m4.makeTranslation(0.05, Y + BR, 0.62 * S)); im.setColorAt(k, c3.set('#f6f3ee')); im.castShadow = true; tbl.add(im); }
  // a cue resting on the rail
  { const cue = M(new T3.CylinderGeometry(0.012, 0.02, 1.45 * POOL_K, 8), toon('#c9a26a'), hx + railW * 0.5, Y + 0.12, 0.2, tbl, 0.01); cue.rotation.x = Math.PI / 2; }
  // the long lamp over the table (green shade, brass trim, lit underside, two hanging rods) + a soft pool of light on the felt
  const lampG = new T3.Group(); g.add(lampG);
  const LK = POOL_K; M(new T3.BoxGeometry(0.62 * LK, 0.26, 2.5 * LK), toon(TV.shade), 0, 2.95, 0, lampG, 0.025); M(new T3.BoxGeometry(0.66 * LK, 0.05, 2.56 * LK), brass, 0, 2.83, 0, lampG, 0.01);
  const under = new T3.Mesh(new T3.PlaneGeometry(0.5 * LK, 2.36 * LK), new T3.MeshBasicMaterial({ color: 0xfff2cc })); under.rotation.x = Math.PI / 2; under.position.set(0, 2.815, 0); lampG.add(under);
  for (const s of [-1, 1]) M(new T3.CylinderGeometry(0.015, 0.015, 1.4, 4), toon('#201e1d'), 0, 3.8, s * 0.9 * LK, lampG, 0);
  { const lt = CT(64, 128, (c, w, h) => { const q = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, h / 2); q.addColorStop(0, 'rgba(255,240,200,0.32)'); q.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = q; c.fillRect(0, 0, w, h); });
    const p = new T3.Mesh(new T3.PlaneGeometry(S * 1.1, 2 * S * 1.05), new T3.MeshBasicMaterial({ map: lt, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); p.rotation.x = -Math.PI / 2; p.position.y = Y + 0.006; tbl.add(p); }
  return { group: g, lampG, half: [OW / 2 + 0.05, OL / 2 + 0.05] };
}
