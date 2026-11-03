// KUFA STATION [dsfOutKu] (s350): the copper trading station the Runabout Vole flies to. Built far away at (OX, 0, 0), only shown
// while you are aboard. From the 2D: a GARDEN in the middle under a copper-framed glass dome (Sister Holly, the pond, two benches),
// a ring deck round it, CATWALK gates out over open space to the pods: IMPORT / EXPORT [dsfOutKu_imex] N, CREW FOR HIRE
// [dsfOutKu_crew] E, MAPS & CHARTS [dsfOutKu_charts] S, RELIC EXCHANGE [dsfOutKu_relics] W, OPERATIONS [dsfOutKu_ops] NE,
// and BERTH 2 (SW) where the Vole docks. Kufa, the copper world, fills the sky below.
import { FONT } from '../engine/textures.js';
import { canvas, pol, angOf, D } from './dsf-look.js?v=350e';
const CU = '#d08a4a';
export const KU = { OX: 7000, hw: 34, hd: 34, h: 14, door: { x: 999, z: 999 }, garden: 8, ring: 15,
  pods: [{ key: 'dsfOutKu_imex', name: 'IMPORT / EXPORT', sub: 'CONTRACTS · FACTOR KIA', th: 0, dist: 28, w: 16, d: 11 }, { key: 'dsfOutKu_crew', name: 'CREW FOR HIRE', sub: 'HIRING HALL · KANE', th: 90, dist: 28, w: 16, d: 11 },
    { key: 'dsfOutKu_charts', name: 'MAPS & CHARTS', sub: 'CHART HOUSE · OLD MERRIT', th: 180, dist: 28, w: 16, d: 11 }, { key: 'dsfOutKu_relics', name: 'RELIC EXCHANGE', sub: 'ASSAY · VETCH', th: 270, dist: 28, w: 16, d: 11 },
    { key: 'dsfOutKu_ops', name: 'OPERATIONS', sub: 'STATION OPS · SUB-WARDEN', th: 45, dist: 29, w: 16, d: 11 }, { key: 'berth', name: 'BERTH 2', sub: 'U.S.S. VOLE · DOCKED', th: 225, dist: 24, w: 10, d: 7 }] };
for (const p of KU.pods) p.inner = p.dist - p.d / 2;
// pod-local (x across, z toward the centre) → station-local world
export const podPt = (p, lx, lz) => { const t = p.th * D, [cx, cz] = pol(p.dist, p.th); return [cx + lx * Math.cos(t) - lz * Math.sin(t), cz + lx * Math.sin(t) + lz * Math.cos(t)]; };
const toPod = (p, x, z) => { const t = p.th * D, [cx, cz] = pol(p.dist, p.th), dx = x - cx, dz = z - cz; return [dx * Math.cos(t) + dz * Math.sin(t), -dx * Math.sin(t) + dz * Math.cos(t)]; };
const spokeUV = (th, x, z) => { const t = th * D; return [x * Math.sin(t) - z * Math.cos(t), x * Math.cos(t) + z * Math.sin(t)]; };
export const KU_AT = (() => { const P = k => KU.pods.find(p => p.key === k); return {
  kuImex: podPt(P('dsfOutKu_imex'), -4.0, 2.2), kuCrew: podPt(P('dsfOutKu_crew'), -3.5, -2.4), kuHandA: podPt(P('dsfOutKu_crew'), 2.2, -3.4), kuHandB: podPt(P('dsfOutKu_crew'), 4.0, -3.4), kuHandC: podPt(P('dsfOutKu_crew'), 6.0, -3.4),
  kuCharts: podPt(P('dsfOutKu_charts'), 0, -3.2), kuRelic: podPt(P('dsfOutKu_relics'), 0, -2.6), kuOps: podPt(P('dsfOutKu_ops'), -2.8, -1.4), kuDuty: podPt(P('dsfOutKu_ops'), 5.6, -3.4),
  kuGarden: [2.4, 1.2], kuSitA: [-5.6, 3.2], kuSitB: [5.6, 3.6], kuWater: [-1.4, -3.6], arrive: podPt(P('berth'), 0, 1.4), lock: podPt(P('berth'), 0, -2.6) }; })();
// s473 Kufa's versions of the station console games (engines: dsf-docking.js + dsf-cargo-scan.js, opts.theme)
export const KU_GAMES = (() => { const P = k => KU.pods.find(p => p.key === k), [ox, oz] = podPt(P('dsfOutKu_ops'), 0, -1.0), [ix, iz] = podPt(P('dsfOutKu_imex'), 0.3, -1.6); return {
  dock: { at: { x: ox, z: oz }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'Operations · SUB-WARDEN KASPAR', kicker: 'Kufa Station · Sub-Warden Kaspar', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. A copper dust storm drifts across the plot: never route a ship through it.', holo: '#ffa060', holoRgb: '255,160,96', bg: 'rgba(20,12,6,0.88)',
    tags: { shuttle: 'SKIFF', freighter: 'COPPER', tug: 'CARAVAN' }, watchNames: ['Grain in', 'Copper out', 'Ink and incense', 'Long run to Zion'], stat: 'kuDock', pw: 5.2, maxD: 3.5, maxY: 5.0, standZ: 3.6,
    storm: { r: 15, speed: 7 }, hazardWord: 'DUSTED', hazardNote: ' flew through the copper dust.' } },
  scan: { at: { x: ix, z: iz }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'Import / Export · FACTOR KIA', kicker: 'Import / Export · Factor Kia', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Watch the card: halfway through, the contract changes.',
    names: { drum: 'COPPER DRUM', sack: 'GRAIN', tin: 'INK TIN', ring: 'CABLE SPOOL', plate: 'COPPER SHEET', bulb: 'INCENSE', crystal: 'RELIC', rod: 'COPPER BAR' }, dockNames: ['Berth 2', 'Gaya grain barge', 'Nebo ink run', 'Zion long run'],
    amend: true, stat: 'kuScan', scan: '#ffa060', scanRgb: '255,160,96', idleTitle: 'CARGO SCAN · IMPORT / EXPORT' } } }; })();
export function buildKufa(K) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(KU.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], podBlocks = {}, circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const sign = (lines, w, h, fg, x, y, z, ry, p, bg = '#1a120a') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const copper = toon(CU), dark = toon('#2a2018'), plate = toon('#5a4a3a');
  // ---- the sky: stars all round and KUFA, the copper world, below ----
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#02030a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(255,255,255,${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); } const ng = c.createRadialGradient(w * 0.7, h * 0.25, 10, w * 0.7, h * 0.25, 400); ng.addColorStop(0, 'rgba(208,138,74,0.25)'); ng.addColorStop(1, 'rgba(208,138,74,0)'); c.fillStyle = ng; c.fillRect(0, 0, w, h); }));
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })); g.add(sky);
    const pt = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#a8602a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { c.fillStyle = pick(['#c87a3a', '#8a4a20', '#d89a5a', '#6a3a1a', '#b86a30']); c.fillRect(0, rnd() * h, w, rr(6, 40)); } for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(40,20,10,0.35)'; c.beginPath(); c.arc(rnd() * w, rnd() * h, rr(4, 24), 0, 7); c.fill(); } }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 24), new THREE.MeshBasicMaterial({ map: pt })); planet.position.set(180, -700, -260); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(545, 48, 24), new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false })); halo.position.copy(planet.position); g.add(halo); }
  // ---- the garden under the dome ----
  { const gr = new THREE.Mesh(new THREE.CircleGeometry(KU.garden, 48), toon('#3a5a2a')); gr.rotation.x = -Math.PI / 2; gr.position.y = 0.01; g.add(gr);
    const path = new THREE.Mesh(new THREE.RingGeometry(KU.garden - 1.4, KU.garden, 48), toon('#8a7258')); path.rotation.x = -Math.PI / 2; path.position.y = 0.015; g.add(path);
    for (const a of [0, 90, 180, 270]) { const [x, z] = pol(KU.garden / 2, a), p = M(BOX(1.6, 0.02, KU.garden), toon('#8a7258'), x, 0.016, z, g, 0); p.rotation.y = -a * D; }
    for (const a of [45, 135, 225, 315]) { const [x, z] = pol(4.4, a), bed = M(BOX(2.6, 0.5, 2.6), toon('#4a3020'), x, 0.25, z, g, 0); bed.rotation.y = -a * D; circles.push([x, z, 1.7]);
      for (let i = 0; i < (LOW ? 5 : 10); i++) { const px = x + rr(-1, 1), pz = z + rr(-1, 1), c = pick(['#4f8a3a', '#6aa04a', '#3a6a2a']); M(new THREE.SphereGeometry(rr(0.2, 0.42), 8, 6), toon(c), px, 0.7, pz, g, 0); if (rnd() < 0.4) M(new THREE.SphereGeometry(0.1, 6, 5), toon(pick(['#f2d98b', '#e07a5a', '#f3f2f2', '#c890ff'])), px, 1.0, pz, g, 0); } }
    // the pond where the small Kufan waits for fish
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshBasicMaterial({ color: 0x3a7a9a, transparent: true, opacity: 0.9 })); pond.rotation.x = -Math.PI / 2; pond.position.set(0, 0.05, -5.6); g.add(pond); const rim = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.16, 6, 32), copper); rim.rotation.x = Math.PI / 2; rim.position.set(0, 0.1, -5.6); g.add(rim); circles.push([0, -5.6, 1.9]);
    const rip = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 24), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.6 })); rip.rotation.x = -Math.PI / 2; rip.position.set(0.4, 0.07, -5.4); g.add(rip); anims.push((dt, t) => { const k = (t * 0.5) % 1; rip.scale.setScalar(1 + k * 5); rip.material.opacity = 0.6 * (1 - k); });
    for (const [x, z, ry] of [[-5.6, 4.2, 0.6], [5.6, 4.6, -0.6]]) { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); M(BOX(2.4, 0.12, 0.7), toon('#6a4a2a'), 0, 0.5, 0, b, 0); M(BOX(2.4, 0.6, 0.1), toon('#6a4a2a'), 0, 0.85, 0.35, b, 0); for (const s of [-1, 1]) M(BOX(0.1, 0.5, 0.6), copper, s * 1.1, 0.25, 0, b, 0); circles.push([x, z + 0.4, 1.1]); }
    // two small copper-leaf trees
    for (const [x, z] of [[3.6, -2.4], [-3.4, 0.6]]) { M(new THREE.CylinderGeometry(0.12, 0.18, 2.2, 8), toon('#5a3a1a'), x, 1.1, z, g, 0); const cr = M(new THREE.IcosahedronGeometry(1.1, 0), toon('#c87a3a'), x, 2.6, z, g, 0); anims.push((dt, t) => { cr.rotation.y = Math.sin(t * 0.4 + x) * 0.1; }); circles.push([x, z, 0.5]); }
    // the dome: copper ribs + glass
    const R = KU.garden + 0.3; const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false })); g.add(glass);
    for (let k = 0; k < 6; k++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(R, 0.08, 6, 32, Math.PI), copper); rib.rotation.y = k * Math.PI / 6; g.add(rib); }
    for (const y of [0.2, 3.2]) { const rr2 = Math.sqrt(R * R - y * y), ring = new THREE.Mesh(new THREE.TorusGeometry(rr2, 0.1, 6, 48), copper); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
    sign(['THE GARDEN', 'SISTER HOLLY · MIND THE BEDS'], 3.2, 0.9, '#9ff09f', 0, 1.6, 7.8, Math.PI, g); { const ps = M(BOX(0.1, 1.2, 0.1), copper, 0, 0.6, 7.86, g, 0); void ps; } }
  // ---- the ring deck, rail with gaps at the catwalks, lamps ----
  const SPOKES = KU.pods.map(p => p.th);
  { const dt2 = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#5a4a3a'; c.fillRect(0, 0, w, w); c.strokeStyle = '#3a2e22'; c.lineWidth = 3; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, w); c.stroke(); } })); dt2.wrapS = dt2.wrapT = THREE.RepeatWrapping; dt2.repeat.set(6, 6);
    const deck = new THREE.Mesh(new THREE.RingGeometry(KU.garden, KU.ring, 96, 1), toon('#ffffff', { map: dt2, side: THREE.DoubleSide })); deck.rotation.x = -Math.PI / 2; g.add(deck);
    const under = new THREE.Mesh(new THREE.CylinderGeometry(KU.ring, KU.garden - 2, 3, 48, 1, true), toon('#3a2e22', { side: THREE.DoubleSide })); under.position.y = -1.5; g.add(under);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(KU.ring, 0.12, 6, 96), basic(CU, 0.9)); edge.rotation.x = Math.PI / 2; edge.position.y = 0.05; g.add(edge);
    const sorted = [...SPOKES].sort((a, b) => a - b); for (let i = 0; i < sorted.length; i++) { const a0 = sorted[i] + 6, a1 = (i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 360) - 6; const pg = new THREE.Group(); pg.rotation.y = -(a0 - 90) * D; g.add(pg);
      const rail = new THREE.Mesh(new THREE.TorusGeometry(KU.ring - 0.3, 0.05, 6, 40, (a1 - a0) * D), copper); rail.rotation.x = Math.PI / 2; rail.position.y = 1.05; pg.add(rail);
      for (let a = a0; a <= a1; a += 7.5) { const [x, z] = pol(KU.ring - 0.3, a); M(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 6), copper, x, 0.52, z, g, 0); } }
    for (const a of [22.5, 67.5, 112.5, 135, 157.5, 202.5, 247.5, 292.5, 315, 337.5]) { const [x, z] = pol(KU.ring - 0.8, a); M(new THREE.CylinderGeometry(0.07, 0.09, 3.2, 8), dark, x, 1.6, z, g, 0); M(new THREE.SphereGeometry(0.24, 10, 8), basic('#ffcf8a'), x, 3.3, z, g, 0); circles.push([x, z, 0.35]); }
    // the four catwalk gates (2D dsfSpoke0/90/180/270) + the extra ops / berth gates
    for (const p of KU.pods) { const [x, z] = pol(KU.ring + 0.2, p.th), gg = new THREE.Group(); gg.position.set(x, 0, z); gg.rotation.y = -p.th * D; g.add(gg);
      for (const s of [-1, 1]) M(BOX(0.3, 3.6, 0.3), copper, s * 1.7, 1.8, 0, gg, 0); M(BOX(3.7, 0.3, 0.3), copper, 0, 3.6, 0, gg, 0); sign(['CATWALK', p.name], 2.6, 0.7, CU, 0, 4.2, 0.18, 0, gg);
      // the catwalk over open space
      const len = p.inner - KU.ring, [mx, mz] = pol(KU.ring + len / 2, p.th), cw = M(BOX(2.8, 0.18, len + 0.4), toon('#4a3e32'), mx, -0.09, mz, g, 0); cw.rotation.y = -p.th * D;
      for (const s of [-1, 1]) { const [rx, rz] = [mx + s * 1.35 * Math.cos(p.th * D), mz + s * 1.35 * Math.sin(p.th * D)]; const r = M(BOX(0.06, 0.06, len), copper, rx, 1.05, rz, g, 0); r.rotation.y = -p.th * D; for (let k = 0; k <= Math.floor(len / 2); k++) { const [px, pz] = pol(KU.ring + 0.4 + k * len / Math.floor(len / 2 || 1), p.th); M(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 5), copper, px + s * 1.35 * Math.cos(p.th * D), 0.52, pz + s * 1.35 * Math.sin(p.th * D), g, 0); } }
      const strip = M(BOX(0.12, 0.02, len), basic(CU, 0.8), mx, 0.02, mz, g, 0); strip.rotation.y = -p.th * D; } }
  // ---- the pods ----
  const podGroups = {}; let opsHolo = null;
  for (const p of KU.pods) { const pg = new THREE.Group(), [cx, cz] = pol(p.dist, p.th); pg.position.set(cx, 0, cz); pg.rotation.y = -p.th * D; g.add(pg); podGroups[p.key] = pg; podBlocks[p.key] = [];
    const W = p.w, Dd = p.d, H = 5.4, wall = toon('#3a2e24', { side: THREE.DoubleSide }), blk = (x0, x1, z0, z1) => podBlocks[p.key].push([x0, x1, z0, z1]);
    const B = (w, h, d, mat, x, y, z) => M(BOX(w, h, d), mat, x, y, z, pg, 0); const C = (r1, r2, h, mat, x, y, z, seg = 14) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, pg, 0);
    { const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, Dd), toon('#4a3a2c')); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; pg.add(fl); const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, Dd), toon('#241a12', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = H; pg.add(ce);
      B(W, 0.4, Dd, toon('#3a2e22'), 0, -0.2, 0); }
    B(W, H, 0.3, wall, 0, H / 2, -Dd / 2); for (const s of [-1, 1]) B(0.3, H, Dd, wall, s * W / 2, H / 2, 0);
    B(W / 2 - 1.5, H, 0.3, wall, -(W / 2 + 1.5) / 2, H / 2, Dd / 2); B(W / 2 - 1.5, H, 0.3, wall, (W / 2 + 1.5) / 2, H / 2, Dd / 2); B(3, H - 3.4, 0.3, wall, 0, 3.4 + (H - 3.4) / 2, Dd / 2);
    for (const s of [-1, 1]) B(0.16, 3.4, 0.4, basic(CU), s * 1.5, 1.7, Dd / 2); B(3.2, 0.16, 0.4, basic(CU), 0, 3.4, Dd / 2);
    B(W + 0.4, 0.3, Dd + 0.4, copper, 0, H + 0.15, 0); for (const z of [-Dd / 4, Dd / 4]) B(W - 2, 0.05, 0.4, basic('#ffe2b0'), 0, H - 0.04, z);
    // signs: the BIG one on the roof edge facing the ring, the eye-level one beside the door (both sides of it on the inner face)
    sign([p.name, p.sub], Math.min(W - 1, 9), 1.5, CU, 0, H + 1.1, Dd / 2 + 0.2, 0, pg); { const r = B(Math.min(W - 1, 9) + 0.2, 1.7, 0.1, dark, 0, H + 1.1, Dd / 2 + 0.12); void r; }
    sign([p.name, p.sub.split(' · ')[0]], 2.4, 0.9, CU, 2.9, 1.7, Dd / 2 + 0.17, 0, pg);
    sign([p.name], Math.min(W - 2, 6), 0.8, CU, 0, 4.2, -Dd / 2 + 0.17, 0, pg);
    // a porthole onto space in the side walls
    for (const s of [-1, 1]) { const ph = new THREE.Mesh(new THREE.CircleGeometry(0.7, 24), new THREE.MeshBasicMaterial({ color: 0x0a1020 })); ph.position.set(s * (W / 2 - 0.17), 2.4, -1); ph.rotation.y = -s * Math.PI / 2; pg.add(ph); const fr = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 6, 24), copper); fr.position.copy(ph.position); fr.rotation.y = ph.rotation.y; pg.add(fr); }
    if (p.key === 'dsfOutKu_imex') {   /* s473: the trade desk made way for the CARGO SCAN belt (KU_GAMES.scan) */
      sign(['MANIFEST', 'COPPER OUT · ZION · LONG RUN', 'GRAIN IN · GAYA', 'INK IN · NEBO', 'INCENSE · STANDING ORDER'], 4.2, 2.6, CU, 0, 2.9, -Dd / 2 + 0.18, 0, pg);
      for (const [x, z] of [[-6.6, -4.4], [6.6, -4.4], [6.6, -3.2]]) { B(1.0, 0.8, 1.0, toon('#7a5a34'), x, 0.4, z); for (let i = 0; i < 3; i++) B(0.7, 0.12, 0.22, toon('#e8a060', { emissive: new THREE.Color('#5a2a0a'), emissiveIntensity: 0.4 }), x, 0.86 + i * 0.13, z - 0.25 + i * 0.25); } blk(-7.2, -6.0, -5.0, -3.8); blk(6.0, 7.2, -5.0, -2.6);
      for (const x of [-5.6, 5.6]) { const sp = C(0.6, 0.6, 0.9, toon('#c87a3a'), x, 0.6, 2.6, 18); sp.rotation.z = Math.PI / 2; blk(x - 0.6, x + 0.6, 1.9, 3.3); } }
    if (p.key === 'dsfOutKu_crew') { B(3.0, 1.0, 1.1, toon('#5a3a22'), -3.5, 0.5, -1.2); blk(-5.0, -2.0, -1.8, -0.6); B(7.0, 0.5, 0.8, toon('#6a4a2a'), 4.1, 0.25, -4.4); B(7.0, 0.8, 0.12, toon('#6a4a2a'), 4.1, 0.9, -4.85); blk(0.6, 7.6, -5.2, -4.0);
      sign(['HANDS FOR HIRE', 'BRIN · DECK HAND · 9 YRS', 'TOLL · GUNNER', '? · HAS NOT SAID'], 3.6, 2.2, CU, -3.5, 3.0, -Dd / 2 + 0.18, 0, pg); }
    if (p.key === 'dsfOutKu_charts') { B(4.4, 0.95, 2.6, toon('#5a3a22'), 0, 0.48, -0.6); blk(-2.2, 2.2, -1.9, 0.7);
      const mt = tex(canvas(512, 320, (c, w, h) => { c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8a6a3a'; c.lineWidth = 1; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(w / 2, h / 2, 20 + i * 24, 0, 7); c.stroke(); } c.fillStyle = '#3a2a1a'; for (let i = 0; i < 40; i++) c.fillRect(rnd() * w, rnd() * h, 3, 3); c.fillStyle = '#b3121b'; for (const [x, y] of [[120, 90], [380, 230], [256, 160]]) { c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); } c.font = `900 22px ${FONT}`; c.fillText('X', 395, 222); }));
      const map = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.3), new THREE.MeshBasicMaterial({ map: mt })); map.rotation.x = -Math.PI / 2; map.position.set(0, 0.97, -0.6); pg.add(map);
      const orr = new THREE.Group(); orr.position.set(0, 3.6, -0.6); pg.add(orr); M(new THREE.SphereGeometry(0.32, 14, 10), basic('#ffcf7a'), 0, 0, 0, orr, 0); for (const [r, c] of [[0.9, '#c87a3a'], [1.4, '#7fb8de'], [1.9, '#9ff09f']]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 4, 40), copper); ring.rotation.x = Math.PI / 2; orr.add(ring); M(new THREE.SphereGeometry(0.14, 10, 8), toon(c), r, 0, 0, orr, 0); }
      anims.push(dt => { orr.rotation.y += dt * 0.3; }); B(0.04, H - 3.6, 0.04, copper, 0, (H + 3.6) / 2, -0.6);
      for (const s of [-1, 1]) { B(0.6, 3.0, 4.0, toon('#3a2a1a'), s * (W / 2 - 0.5), 1.5, -2.6); for (let i = 0; i < 4; i++) for (let k = 0; k < 5; k++) { const sc = C(0.09, 0.09, 0.5, toon(pick(['#e8dcc0', '#d8c8a8'])), s * (W / 2 - 0.6), 0.5 + i * 0.7, -4.2 + k * 0.8, 8); sc.rotation.z = Math.PI / 2; } blk(s > 0 ? W / 2 - 0.9 : -W / 2, s > 0 ? W / 2 : -W / 2 + 0.9, -4.7, -0.5); } }
    if (p.key === 'dsfOutKu_relics') { const gt = B(4.0, 0.12, 1.6, new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.55, toneMapped: false }), 0, 1.0, -1.2); void gt; B(4.0, 0.9, 1.6, dark, 0, 0.45, -1.2); blk(-2.1, 2.1, -2.1, -0.3);
      sign(['PUT IT ON THE GLASS'], 2.6, 0.5, '#9fe8ff', 0, 1.6, -0.38, 0, pg); const lamp = C(0.25, 0.4, 0.3, copper, 1.4, 2.4, -1.4, 12); void lamp; B(0.04, 1.3, 0.04, copper, 1.4, 1.7, -1.4);
      for (const s of [-1, 1]) { B(1.2, 1.1, 3.6, dark, s * (W / 2 - 1.0), 0.55, 1.0); const cs = B(1.1, 0.8, 3.4, new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.2, depthWrite: false }), s * (W / 2 - 1.0), 1.5, 1.0); void cs; for (let i = 0; i < 4; i++) { const sh = M(new THREE.OctahedronGeometry(0.18, 0), basic(pick(['#9fe8ff', '#c890ff', '#f2d98b'])), s * (W / 2 - 1.0), 1.4, -0.3 + i * 0.85, pg, 0); anims.push((dt, t) => { sh.rotation.y = t + i; }); } blk(s > 0 ? W / 2 - 1.7 : -W / 2, s > 0 ? W / 2 : -W / 2 + 1.7, -0.9, 2.9); }
      sign(['WANTED', 'ANYTHING WITH NINE NOTCHES'], 3.0, 1.0, CU, 4.0, 3.0, -Dd / 2 + 0.18, 0, pg); }
    if (p.key === 'dsfOutKu_ops') { C(1.6, 1.8, 1.0, dark, 0, 0.5, -1.0, 24); blk(-1.9, 1.9, -2.9, 0.9);
      const holo = opsHolo = M(new THREE.SphereGeometry(0.9, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffa060, wireframe: true, transparent: true, opacity: 0.55 }), 0, 2.2, -1.0, pg, 0); anims.push(dt => { holo.rotation.y += dt * 0.4; });
      for (let i = 0; i < 4; i++) { const s = B(2.4, 1.3, 0.06, basic(pick(['#ffb070', '#9fd8ff']), 0.8), -5.4 + i * 3.6, 2.6, -Dd / 2 + 0.2); void s; } B(14, 0.9, 0.8, dark, 0, 0.45, -Dd / 2 + 0.6); blk(-7, 7, -Dd / 2, -Dd / 2 + 1.2); }
    if (p.key === 'berth') { const lk = new THREE.Group(); lk.position.set(0, 1.75, -Dd / 2 + 0.2); pg.add(lk); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.18, 8, 32), toon('#e8c45a')); lk.add(ring); const disc = new THREE.Mesh(new THREE.CircleGeometry(1.35, 32), toon('#4a5058')); lk.add(disc);
      const lampM = new THREE.MeshBasicMaterial({ color: 0x3ad26a, toneMapped: false }); M(BOX(0.6, 0.22, 0.1), lampM, 0, 3.75, -Dd / 2 + 0.25, pg, 0); sign(['U.S.S. VOLE', 'BOARD · RETURN TO DEEP SPACE FOX'], 3.4, 0.8, '#7fd8ff', 0, 4.4, -Dd / 2 + 0.2, 0, pg, '#0b1218');
      const v = new THREE.Group(); v.position.set(-3, 1.2, -Dd / 2 - 7); pg.add(v); const vh = toon('#c8ccd2'); M(BOX(11, 2.4, 4.0), vh, 0, 0, 0, v, 0); M(BOX(2.0, 0.5, 3.0), basic('#7fd8ff', 0.85), 5.4, 0.75, 0, v, 0); for (const s of [-1, 1]) M(BOX(8, 0.9, 1.0), toon('#5a6068'), -1, -0.7, s * 3.0, v, 0); M(BOX(0.2, 0.2, 4.1), basic('#b3121b'), 2, 0.5, 0, v, 0);
      M(BOX(3.0, 3.0, 7.0), toon('#4a4e54'), 0, 1.5, -Dd / 2 - 3.5, pg, 0); }
  }
  function podAt(x, z) { for (const p of KU.pods) { const [lx, lz] = toPod(p, x, z); if (Math.abs(lx) < p.w / 2 && lz > -p.d / 2 && lz < p.d / 2 + 0.3) return p; } return null; }
  function walk(x, z) { const r = Math.hypot(x, z); for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    if (r < KU.ring - 0.6) return true;
    for (const p of KU.pods) { const [u, v] = spokeUV(p.th, x, z); if (Math.abs(v) < 1.15 && u > KU.ring - 1 && u < p.inner + 0.4) return true;
      const [lx, lz] = toPod(p, x, z); if (Math.abs(lx) < p.w / 2 - 0.5 && lz > -p.d / 2 + 0.5 && lz < p.d / 2 - 0.3) { for (const [a, b, c, d] of podBlocks[p.key]) if (lx > a - 0.3 && lx < b + 0.3 && lz > c - 0.3 && lz < d + 0.3) return false; return true; } }
    return false; }
  function clampCam(v) { const p = podAt(v.x, v.z); if (p) { v.y = Math.min(v.y, 5.0); return; } const r = Math.hypot(v.x, v.z); if (r < KU.garden + 0.3) v.y = Math.min(v.y, Math.sqrt(Math.max(1, (KU.garden) ** 2 - r * r)) - 0.3); else v.y = Math.min(v.y, 9); }
  function label(x, z) { const p = podAt(x, z); if (p) return 'Kufa Station · ' + (p.key === 'berth' ? 'Berth 2' : p.name.charAt(0) + p.name.slice(1).toLowerCase()); const r = Math.hypot(x, z); return 'Kufa Station · ' + (r < KU.garden ? 'The Garden' : r < KU.ring ? 'The Ring' : 'Catwalk'); }
  return { g, anims, walk, clampCam, label, podAt, podBlocks, circles, setHolo(v) { if (opsHolo) opsHolo.visible = v; },
    // the console games keep station-local axis-aligned blocks; the IMPORT / EXPORT pod is at th 0 (no turn), so shift them into pod space
    imexBlocks: { push: ([a, b, c, d]) => { const p = KU.pods.find(q => q.key === 'dsfOutKu_imex'), [cx, cz] = pol(p.dist, p.th); podBlocks[p.key].push([a - cx, b - cx, c - cz, d - cz]); } } };
}
