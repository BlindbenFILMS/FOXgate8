// MERU 2.0 — TAVERN DECK (Ben, s34): an outdoor seating deck on the tavern's road-side wall, off the back door (meru2-layout BACK_DOORS.tavern),
// running along the wall to the sidewalk. Flush timber boards (no step), a rail round the open sides with two gaps (sidewalk + the main-path end),
// bistro tables with red umbrellas + chairs, planters, string lights on the rail posts. Built from the live layout, so it follows the tavern if it moves.
import { floraRemove } from './meru2-flora.js';
export function buildTavDeck({ THREE, scene, L, cols, heightAt = () => 0, touch, roadD = () => 99 }) {
  const b = L.BUILDINGS.find(q => q.key === 'tavern'); if (!b || !b.door2) return null;
  const F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[b.face2], [ox, oz] = F, ux = -oz, uz = ox;   // v = out of the wall, u = along it
  const f = b.f, along = !!oz, wall = oz < 0 ? f[2] : oz > 0 ? f[3] : ox < 0 ? f[0] : f[1], dA = along ? b.door2[0] : b.door2[1];
  const lo = along ? f[0] : f[2], hi = along ? f[1] : f[3], a0 = Math.max(lo + 0.3, dA - 27), a1 = Math.min(hi - 0.3, Math.max(dA + 2.6, dA + 2.6));
  const W = (a, v) => along ? [a, wall + oz * v] : [wall + ox * v, a];   // a = coordinate along the wall, v = metres out
  // s34 (Ben): the deck stops 0.4 m short of the sidewalk (it used to jut out over it when the tavern moved closer to the road)
  let DEP = 8; { const SW = (L.SIDEWALK || 3.3) + 0.4; for (let v = 0.5; v <= 8; v += 0.1) { if ([a0, (a0 + a1) / 2, a1].some(a => roadD(...W(a, v)) < SW)) { DEP = Math.max(3, Math.floor((v - 0.1) * 10) / 10); break; } } }
  const rect = (() => { const p = W(a0, 0), q = W(a1, DEP); return [Math.min(p[0], q[0]), Math.max(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[1], q[1])]; })();
  const G = new THREE.Group(); G.name = 'tavernDeck'; scene.add(G);
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), Y = heightAt((rect[0] + rect[1]) / 2, (rect[2] + rect[3]) / 2);
  const ry = Math.atan2(-uz, ux);   // local +x = along the wall (s34 fix: was atan2(ux, uz), which laid the boards + rails out across the sidewalk and road)
  const put = (geo, mat, a, y, v, rot = 0) => { const m = new THREE.Mesh(geo, mat), [x, z] = W(a, v); m.position.set(x, Y + y, z); m.rotation.y = ry + rot; G.add(m); return m; };
  // clear the lawn under the deck (+1 m): trees, shrubs, flowers, instanced props (not the city lamps), small colliders
  const R1 = [rect[0] - 1, rect[1] + 1, rect[2] - 1, rect[3] + 1], inR = (x, z) => x > R1[0] && x < R1[1] && z > R1[2] && z < R1[3];
  let n = floraRemove(inR) || 0; const M4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  scene.traverse(o => { if (!o.isInstancedMesh || o.userData.lamp || o.parent === G) return; o.updateWorldMatrix(true, false); let hit = false;
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M4); v3.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); if (inR(v3.x, v3.z) && v3.y < 6) { o.setMatrixAt(i, Z); hit = true; n++; } } if (hit) o.instanceMatrix.needsUpdate = true; });
  for (let i = cols.length - 1; i >= 0; i--) { const c = cols[i]; if (c._keep) continue; let x, z, small;
    if (c.c) { x = c.c[0]; z = c.c[1]; small = c.c[2] < 2.5; } else if (c.f) { x = (c.f[0] + c.f[1]) / 2; z = (c.f[2] + c.f[3]) / 2; small = c.f[1] - c.f[0] < 4 && c.f[3] - c.f[2] < 4; } else continue;
    if (small && inR(x, z) && !(x > f[0] && x < f[1] && z > f[2] && z < f[3])) { cols.splice(i, 1); n++; } }
  // boards: one plank texture, a dark fascia round the edge
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#6b4a35'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) { const k = 0.9 + ((i * 5) % 7) / 30; g.fillStyle = 'rgb(' + (150 * k | 0) + ',' + (104 * k | 0) + ',' + (68 * k | 0) + ')'; g.fillRect(0, i * 32 + 1.5, 256, 29); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(((i * 97) % 200), i * 32 + 2, 2, 28); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; const LEN = a1 - a0; tex.repeat.set(LEN / 4, DEP / 2.2);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(LEN, DEP), new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.rotation.x = -Math.PI / 2;
    const h = new THREE.Group(); h.add(m); const [x, z] = W((a0 + a1) / 2, DEP / 2); h.position.set(x, Y + 0.08, z); h.rotation.y = ry; m.receiveShadow = !touch; G.add(h); }
  const DARK = lam('#3a2618'), RAIL = lam('#4a3424'), BRASS = lam('#e0a84a');
  put(new THREE.BoxGeometry(LEN + 0.2, 0.16, 0.2), DARK, (a0 + a1) / 2, 0.04, DEP + 0.05);
  for (const a of [a0 - 0.05, a1 + 0.05]) put(new THREE.BoxGeometry(0.2, 0.16, DEP), DARK, a, 0.04, DEP / 2);
  // rail: outer edge + the two ends; gaps = 3 m to the sidewalk in the middle of the outer edge, 3 m at the end nearer the main path
  const midGap = [(a0 + a1) / 2 - 1.5, (a0 + a1) / 2 + 1.5], pathEnd = Math.abs(W(a1, 0)[along ? 0 : 1]) < Math.abs(W(a0, 0)[along ? 0 : 1]) ? a1 : a0, endGap = [Math.max(0.8, DEP - 4.2), Math.max(2.2, DEP - 1.2)];
  const runs = [];   // [aStart, vStart, aEnd, vEnd]
  runs.push([a0, DEP, midGap[0], DEP], [midGap[1], DEP, a1, DEP]);
  for (const a of [a0, a1]) { if (a === pathEnd) runs.push([a, 0.4, a, endGap[0]], [a, endGap[1], a, DEP]); else runs.push([a, 0.4, a, DEP]); }
  const postGeo = new THREE.BoxGeometry(0.14, 1.0, 0.14), lightPts = [];
  for (const [pa, pv, qa, qv] of runs) { const L1 = Math.hypot(qa - pa, qv - pv); if (L1 < 0.3) continue; const ma = (pa + qa) / 2, mv = (pv + qv) / 2, rot = pa === qa ? Math.PI / 2 : 0;
    put(new THREE.BoxGeometry(L1, 0.08, 0.1), RAIL, ma, 1.02, mv, rot); put(new THREE.BoxGeometry(L1, 0.06, 0.06), RAIL, ma, 0.5, mv, rot);
    const np = Math.max(1, Math.round(L1 / 2.4)); for (let i = 0; i <= np; i++) { const t = i / np, a = pa + (qa - pa) * t, v = pv + (qv - pv) * t; put(postGeo, RAIL, a, 0.55, v); lightPts.push([a, v]); }
    const p = W(pa, pv), q = W(qa, qv); cols.push({ f: [Math.min(p[0], q[0]) - 0.12, Math.max(p[0], q[0]) + 0.12, Math.min(p[1], q[1]) - 0.12, Math.max(p[1], q[1]) + 0.12], _keep: true }); }
  // string lights: warm bulbs on tall poles at the four corners + over the middle, swagged along the outer edge
  const BULB = new THREE.MeshBasicMaterial({ color: '#ffc070' }), bulbG = new THREE.SphereGeometry(0.07, 6, 4), poleG = new THREE.CylinderGeometry(0.05, 0.06, 3.2, 6);
  const poles = [[a0 + 0.1, DEP - 0.1], [a1 - 0.1, DEP - 0.1], [a0 + 0.1, 0.5], [a1 - 0.1, 0.5]]; for (const [a, v] of poles) put(poleG, RAIL, a, 1.6, v);
  const swag = (pa, pv, qa, qv) => { const k = Math.max(4, Math.round(Math.hypot(qa - pa, qv - pv) / 1.1)); for (let i = 1; i < k; i++) { const t = i / k; put(bulbG, BULB, pa + (qa - pa) * t, 3.1 - Math.sin(t * Math.PI) * 0.45, pv + (qv - pv) * t); } };
  swag(a0 + 0.1, DEP - 0.1, a1 - 0.1, DEP - 0.1); swag(a0 + 0.1, 0.5, a0 + 0.1, DEP - 0.1); swag(a1 - 0.1, 0.5, a1 - 0.1, DEP - 0.1);
  // bistro tables + umbrellas + 4 chairs each, two rows, the door approach (door ± 2.6 m) kept clear
  const TOP = lam('#2e2018'), LEG = lam('#201e1d'), UMB = [lam('#c42d3c'), lam('#f3f2f2')], CH = lam('#c42d3c');
  const seats = [];   // s89: chair spots for the beer-garden patrons (worlds/meru2-tavern-life.js)
  // s174 (Ben: "too small next to the foxes"): FOX SCALE K = 1.35 (same as Lanes Court + the fountain games' tables). Tables 5.4 m apart, the back row
  // staggered half a step so the bigger umbrellas don't touch; door + sidewalk gap clearances widened. Seat y lifted to the taller chair.
  const K = 1.35, SP = 5.4, gk = g => g.scale(K, K, K), putK = (geo, mat, a, y, v, rot) => put(gk(geo), mat, a, y * K, v, rot);
  const rows = DEP >= 7.2 ? [2.3, Math.min(DEP - 2.0, 5.9)] : [Math.max(2.8, DEP / 2)];
  const tabs = []; rows.forEach((v, r) => { for (let a = a0 + 3.0 + r * SP / 2; a <= a1 - 2.6; a += SP) { if (Math.abs(a - dA) < 4.2 && v < 4.5) continue; if (Math.abs(a - midGap[0] - 1.5) < 3.2 && v > 4.5) continue; tabs.push([a, v]); } });
  const chairG = gk(new THREE.BoxGeometry(0.5, 0.08, 0.5)), backG = gk(new THREE.BoxGeometry(0.5, 0.5, 0.06)), cLeg = gk(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 5));
  tabs.forEach(([a, v], i) => { putK(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16), TOP, a, 0.78, v); putK(new THREE.CylinderGeometry(0.05, 0.08, 0.75, 6), LEG, a, 0.4, v);
    putK(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6), LEG, a, 1.35, v); const um = putK(new THREE.ConeGeometry(1.35, 0.5, 8, 1, true), UMB[i % 2], a, 2.45, v); um.material.side = THREE.DoubleSide;
    for (let k = 0; k < 4; k++) { const ang = k * Math.PI / 2 + Math.PI / 4, ca = a + Math.cos(ang) * 0.95 * K, cv = v + Math.sin(ang) * 0.95 * K, face = -ang + Math.PI / 2;
      { const [sx, sz] = W(ca, cv), [tx, tz] = W(a, v); seats.push({ x: sx, z: sz, y: Y + 0.47 * (K - 1), ry: Math.atan2(tx - sx, tz - sz), t: i }); }
      put(chairG, CH, ca, 0.47 * K, cv, face); put(cLeg, LEG, ca, 0.23 * K, cv); put(backG, CH, ca + Math.cos(ang) * 0.24 * K, 0.75 * K, cv + Math.sin(ang) * 0.24 * K, face); }
    const [x, z] = W(a, v); cols.push({ c: [x, z, 1.0], _keep: true }); });
  // planters by the door + at the sidewalk gap
  const PL = lam('#5e564c'), LEAF = lam('#3f7a52');
  for (const [a, v] of [[dA - 2.7, 0.8], [dA + 2.7 < a1 - 0.5 ? dA + 2.7 : dA - 4.5, 0.8], [midGap[0] - 0.6, DEP - 0.7], [midGap[1] + 0.6, DEP - 0.7]]) {
    put(new THREE.BoxGeometry(0.9, 0.6, 0.9), PL, a, 0.3, v); put(new THREE.SphereGeometry(0.55, 8, 6), LEAF, a, 0.95, v); const [x, z] = W(a, v); cols.push({ c: [x, z, 0.55], _keep: true }); }
  // DECK sign on the rail by the sidewalk gap
  { const s = document.createElement('canvas'); s.width = 512; s.height = 128; const q = s.getContext('2d'); q.fillStyle = '#201e1d'; q.fillRect(0, 0, 512, 128); q.fillStyle = '#ffc070'; q.font = '900 64px Archivo, Arial'; q.textBaseline = 'middle'; q.fillText('TAVERN DECK', 22, 66);
    const t = new THREE.CanvasTexture(s); t.colorSpace = THREE.SRGBColorSpace; const m = put(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }), midGap[0] - 1.6, 1.45, DEP + 0.08); m.rotation.y = ry + Math.PI; }
  // s181 DECK DUETS (Ben s174: the 5 seated pairs live HERE): up to 5 tables spread along the deck are kept for the duet pairs (meru2-duets.js), at least 2 left for patrons
  const dN = Math.min(5, Math.max(0, tabs.length - 2)), duetT = dN < 2 ? [...Array(dN).keys()] : [...new Set([...Array(dN).keys()].map(k => Math.round(k * (tabs.length - 1) / (dN - 1))))];
  if (typeof window !== 'undefined') window.__m2deck = { rect, door: b.door2, tables: tabs.length, cleared: n, seats, duetT };
  return { rect, group: G, seats, duetT };
}
