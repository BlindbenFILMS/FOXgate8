// MERU 2.0 — s122 FORTUNE TELLER DELUXE PART C: PRIZES (Ben's answers s121), plugged into worlds/meru2-fortune-jobs.js as PZ.
// STAR HAT / HOOD (first job you finish, worn on your head everywhere in Meru 2; Ora's YOUR PRIZES picks HAT · HOOD · OFF) ·
// YOUR NAME ON THE STAR CHART (first FULL SHIFT: a new fox-head constellation drawn on the chart, its 5 stars twinkle, "THE <NAME>").
// Stats: mftHat (owned), mftHatWear ('hat' | 'hood' | 'off'), mftChart (name on the chart).
export function ftPrizes(X) {
  const { THREE, G, LM, CT, save, NAVY, GOLD, YEL } = X;
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const own = () => !!save.stat('mftHat', false), mode = () => save.stat('mftHatWear', 'hat');
  // ================= the STAR HAT + STAR HOOD (built for P.head) =================
  const stars = (g, r, y0, n, dy) => { for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.028), LM(YEL)), a = k * 2.1; s.position.set(Math.sin(a) * r(k), y0 + k * dy, Math.cos(a) * r(k)); g.add(s); } };
  const hatMesh = () => { const g = new THREE.Group();
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.025, 20), LM(NAVY)); brim.position.y = 0.3; g.add(brim);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.18, 0.05, 16), LM(GOLD)); band.position.y = 0.335; g.add(band);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.175, 0.52, 14), LM(NAVY)); cone.position.set(0, 0.6, -0.03); cone.rotation.x = -0.18; g.add(cone);
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), LM(YEL)); tip.position.set(0, 0.87, -0.08); g.add(tip);
    stars(g, k => 0.15 - k * 0.025, 0.42, 5, 0.075); return g; };
  const hoodMesh = () => { const g = new THREE.Group();
    const cowl = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), new THREE.MeshLambertMaterial({ color: NAVY, side: THREE.DoubleSide })); cowl.position.set(0, 0.06, -0.05); cowl.scale.set(1, 1.05, 1.1); g.add(cowl);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.02, 6, 20), LM(GOLD)); trim.position.set(0, 0.06, 0.03); trim.rotation.x = 0.35; g.add(trim);
    const pt = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.36, 10), LM(NAVY)); pt.position.set(0, 0.3, -0.24); pt.rotation.x = -1.0; g.add(pt);
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), LM(YEL)); tip.position.set(0, 0.42, -0.4); g.add(tip);
    stars(g, () => 0.27, 0.12, 4, 0.04); return g; };
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const m = own() ? mode() : 'off';
    if (worn && worn.k === m && worn.fox === fox && (!worn.m || worn.m.parent === P.head)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { k: m, fox, m: null };
    if (m === 'off') return; const h = m === 'hood' ? hoodMesh() : hatMesh(); h.traverse(o => { o.renderOrder = 2; }); P.head.add(h); worn.m = h; }
  // ================= YOUR NAME ON THE STAR CHART (overlay on the chart: 5 x 2.5 at (-80, 2.9, -71.78)) =================
  const PTS = [[150, 300], [184, 352], [222, 432], [260, 352], [294, 300]];
  const ovT = CT(1024, 512, () => {}); const OV = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshBasicMaterial({ map: ovT, transparent: true, depthWrite: false })); OV.position.set(-80, 2.9, -71.76); OV.renderOrder = 3; G.add(OV);
  const TW = PTS.map(([u, v]) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: YEL, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.16); s.position.set(-80 + (u / 1024 - 0.5) * 5, 2.9 - (v / 512 - 0.5) * 2.5, -71.72); G.add(s); return s; });
  let chKey = '';
  function drawChart() { const on = !!save.stat('mftChart', false), k = on + name(); if (k === chKey) return; chKey = k; const c = ovT.userData.c.getContext('2d'); c.clearRect(0, 0, 1024, 512); OV.visible = on; TW.forEach(s => { s.visible = on; }); if (!on) { ovT.needsUpdate = true; return; }
    c.strokeStyle = YEL; c.lineWidth = 3; c.beginPath(); PTS.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.moveTo(PTS[1][0], PTS[1][1]); c.lineTo(PTS[3][0], PTS[3][1]); c.stroke();
    PTS.forEach(([x, y]) => { c.fillStyle = YEL; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
    c.fillStyle = YEL; c.textBaseline = 'middle'; let fs = 30; const t = 'THE ' + name(); do { c.font = '900 ' + fs + 'px Archivo, sans-serif'; } while (c.measureText(t).width > 300 && --fs > 14); c.fillText(t, 110, 462); ovT.needsUpdate = true; }
  drawChart();
  // ================= prizes =================
  const LINES = {
    hat: ['The stars chose you. Wear this star hat. Lumi waited years for hers.', 'STAR HAT'],
    chart: ['A new star rose tonight. Lumi drew it on the chart. It has your name.', 'YOUR NAME ON THE STAR CHART'] };
  function gift(shift) { const got = [];
    if (!own()) { save.setStat('mftHat', true); save.setStat('mftHatWear', 'hat'); got.push('hat'); }
    if (shift && !save.stat('mftChart', false)) { save.setStat('mftChart', true); drawChart(); got.push('chart'); }
    return got; }
  const line = ks => ks.length > 1 ? 'A star hat, and a new star on the chart with your name. Well worked.' : LINES[ks[0]][0], label = ks => ks.map(k => LINES[k][1]).join(' + ');
  // Ora's YOUR PRIZES (choices: first a wear pick, last GOODBYE)
  function menu(sayTo, kT, ln, bye) { const ch = [], on = !!save.stat('mftChart', false);
    if (!own()) { sayTo(kT, [{ ...ln('Finish one job and the stars will notice. Then ask again.'), choices: [{ text: bye, bye: true, pick: () => {} }] }]); return; }
    const m = mode(), set = v => () => { save.setStat('mftHatWear', v); X.shimmer && X.shimmer(); };
    if (m !== 'hat') ch.push({ text: 'WEAR THE STAR HAT', pick: set('hat') }); if (m !== 'hood') ch.push({ text: 'WEAR THE STAR HOOD', pick: set('hood') }); if (m !== 'off') ch.push({ text: 'TAKE IT OFF', pick: set('off') });
    ch.push({ text: bye, bye: true, pick: () => {} });
    sayTo(kT, [{ ...ln(on ? 'Your star hat, and your star on the chart. Hat or hood today?' : 'Your star hat. Finish a FULL SHIFT and the chart learns your name.'), choices: ch }]); }
  function tick(dt, t, fox) { applyWear(fox); if (OV.visible) TW.forEach((s, i) => { s.material.opacity = 0.35 + 0.35 * Math.max(0, Math.sin(t * 2.2 + i * 1.7)); }); }
  return { gift, line, label, menu, tick, drawChart, applyWear };
}
