// s479 HULL RUN (Luxor Station · Bike Bay): a MAG-WHEEL bike race round the OUTSIDE of Luxor Station, in a spacesuit.
// Ben's picks: mag-wheel bike (rides up the walls + upside down under the keel), race Rider Kel + Mech Dune, 8 tokens a lap,
// an oxygen meter with refill pickups, 1 long lap, lofi racing music, sleek suit with a FISHBOWL helmet (the fox's face shows),
// the ship's buttons: 1 LASER (zap space rocks) · 2 HOP (mag release: jump gaps + rocks) · 3 BOOST, stick ◀ ▶ steer, ▼ brake.
// The track is a glowing mag-rail on the hull: out of the launch door → up the west wall → a spiral round the NW obelisk →
// across the roof → up + over the stepped pyramid + the gold capstone → a corkscrew round your docked ship → down the east
// wall → upside down under the keel → up the west wall to the line. Station console game (dsf-console): camPose = chase cam
// whose UP is the track normal, so the view rolls with you on the walls and underneath.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const CTRL = [ // [x, y, z, nx, ny, nz] station-local (Luxor Station: walls ±24, roof 5.5, court capstone 11.6, keel down to -10.2, ship at z 34.5)
  [-26.2, 1.8, -4, -1, 0, 0], [-26.2, 2.2, -12, -1, 0, 0], [-26.2, 2.6, -20, -1, 0, 0],
  [-28, 3.4, -25, 0, 0, 1], [-25, 5.0, -28, 1, 0, 0], [-28, 6.6, -31, 0, 0, -1], [-31, 8.2, -28, -1, 0, 0], [-28, 9.8, -25, 0, 0, 1],
  [-22, 7.8, -22, 0, 1, 0], [-14, 6.5, -18, 0, 1, 0], [-4, 6.5, -14, 0, 1, 0],
  [0, 8.8, -7.6, 0, 0.7, -0.7], [0, 12.5, -2.2, 0, 0.92, -0.4], [0, 12.7, 2.2, 0, 0.92, 0.4], [0, 8.8, 7.6, 0, 0.7, 0.7],
  [2, 6.6, 15, 0, 1, 0], [1, 7.6, 24, 0, 1, 0],
  [0, 9.6, 29.5, 0, 1, 0], [6.93, 5.6, 31.4, 0.87, 0.5, 0], [6.93, -2.4, 33.4, 0.87, -0.5, 0], [0, -6.4, 35.4, 0, -1, 0], [-6.93, -2.4, 37.4, -0.87, -0.5, 0], [-6.93, 5.6, 39.4, -0.87, 0.5, 0], [0, 9.6, 41.4, 0, 1, 0],
  [8, 8.4, 44, 0, 1, 0], [15, 7.6, 37, 0, 1, 0], [15.5, 6.8, 26, 0, 1, 0], [16, 6.5, 18, 0, 1, 0],
  [22, 6.5, 17, 0, 1, 0], [25.7, 5.8, 15.6, 0.7, 0.7, 0], [26.2, 2.6, 13, 1, 0, 0], [26.2, -0.6, 10, 1, 0, 0],
  [24.6, -2.8, 8, 0.7, -0.7, 0], [20, -5.4, 6, 0.45, -0.9, 0], [13, -8.8, 4.5, 0.3, -0.95, 0], [5, -11.8, 3.4, 0.1, -1, 0], [-5, -11.8, 2.6, -0.1, -1, 0],
  [-13, -8.8, 2, -0.3, -0.95, 0], [-20, -5.4, 2, -0.45, -0.9, 0], [-24.6, -2.8, 2.5, -0.7, -0.7, 0], [-26.2, -0.4, 1.5, -1, 0, 0]];
const ZONES = [[0, 'BIKE BAY · LAUNCH DOOR'], [0.1, 'THE NW OBELISK'], [0.2, 'THE ROOF'], [0.29, 'OVER THE CAPSTONE'], [0.4, 'CORKSCREW · YOUR SHIP'], [0.6, 'THE EAST WALL'], [0.7, 'UPSIDE DOWN · THE KEEL'], [0.93, 'THE WEST WALL']];
const LOFI = (() => { const n = [], ch = [[50, 53, 57, 60, 64], [43, 47, 50, 53, 57], [48, 52, 55, 59, 62], [45, 48, 52, 55, 60]];   // Dm9 · G9 · Cmaj9 · Am9, 96 bpm, swung
  ch.forEach((c, k) => { const at = k * 4; c.forEach((m, i) => n.push({ b: at + i * 0.04, m, d: 3.6, v: 'keys' })); n.push({ b: at, m: c[0] - 12, d: 1.6, v: 'bass' }, { b: at + 2.5, m: c[0] - 12 + (k % 2 ? 7 : 3), d: 1.2, v: 'bass' });
    [0, 2.5].forEach(o => n.push({ b: at + o, m: 0, d: 0.3, v: 'kick' })); [1, 3].forEach(o => n.push({ b: at + o, m: 0, d: 0.2, v: 'snare' }));
    for (let h = 0; h < 8; h++) n.push({ b: at + h * 0.5 + (h % 2 ? 0.08 : 0), m: 0, d: 0.05, v: 'hat' });
    [[0.75, 2], [1.75, 4], [3.25, 3]].forEach(([o, i]) => n.push({ b: at + o, m: c[i] + 12, d: 0.6, v: 'lead' })); });
  return { notes: n, beats: 16, spb: 60 / 96 }; })();
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeHullRun(K, { at, room, ox = 0, mkPlayer, mkFox, animFox, audio, save, LOW, where = 'Bike Bay · launch door', kicker = 'Luxor Station · Hull Run' }) {
  const { THREE, glowSprite } = K;
  const root = new THREE.Group(); root.position.set(ox, 0, 0); root.visible = false; K.scene.add(root);   // in the scene at the station's OX (room-local coordinates + ox = world)
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  // ---------- the track ----------
  const pts = CTRL.map(c => V3(c[0], c[1], c[2])), nrm = CTRL.map(c => V3(c[3], c[4], c[5]).normalize()), NC = CTRL.length;
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5), L = curve.getLength(), N = LOW ? 700 : 1100, W = 4.4, HW = W / 2;
  const S = []; for (let j = 0; j < N; j++) { const u = j / N, t = curve.getUtoTmapping(u), p = curve.getPointAt(u), T = curve.getTangentAt(u).normalize(), f = t * NC, i0 = Math.floor(f) % NC, fr = f - Math.floor(f), e = fr * fr * (3 - 2 * fr);
    const n = nrm[i0].clone().lerp(nrm[(i0 + 1) % NC], e); n.addScaledVector(T, -n.dot(T)).normalize(); const r = V3().crossVectors(T, n).normalize(); S.push({ p, T, n, r }); }
  // smooth the normals a little more (no sudden roll)
  for (let pass = 0; pass < 3; pass++) for (let j = 0; j < N; j++) { const a = S[(j - 1 + N) % N].n, b = S[(j + 1) % N].n, q = S[j]; q.n = q.n.clone().multiplyScalar(2).add(a).add(b).addScaledVector(q.T, 0).normalize(); q.n.addScaledVector(q.T, -q.n.dot(q.T)).normalize(); q.r = V3().crossVectors(q.T, q.n).normalize(); }
  const frame = d => { const x = ((d % L) + L) % L / L * N, j = Math.floor(x) % N, k = x - Math.floor(x), A = S[j], B = S[(j + 1) % N];
    return { p: A.p.clone().lerp(B.p, k), T: A.T.clone().lerp(B.T, k).normalize(), n: A.n.clone().lerp(B.n, k).normalize(), r: A.r.clone().lerp(B.r, k).normalize() }; };
  const GAPS = [[0.46, 0.475], [0.78, 0.795]].map(([a, b]) => [a * L, b * L]), inGap = d => { const m = ((d % L) + L) % L; return GAPS.some(([a, b]) => m > a && m < b); };
  { // ribbon (gaps left open), glowing edges, chevrons
    const tc = document.createElement('canvas'); tc.width = 128; tc.height = 256; const c = tc.getContext('2d'); c.fillStyle = '#1a1d24'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#262a33'; for (let y = 0; y < 256; y += 32) c.fillRect(0, y, 128, 2);
    c.strokeStyle = 'rgba(255,196,90,0.55)'; c.lineWidth = 8; c.beginPath(); c.moveTo(34, 150); c.lineTo(64, 110); c.lineTo(94, 150); c.stroke(); c.fillStyle = '#5fe3ff'; c.fillRect(0, 0, 6, 256); c.fillRect(122, 0, 6, 256);
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
    const pos = [], uv = [], idx = [], ep = [], step = L / N; let vi = 0;
    for (let j = 0; j <= N; j++) { const q = S[j % N], d = j * step, gap = inGap(d), a = q.p.clone().addScaledVector(q.r, -HW).addScaledVector(q.n, 0.05), b = q.p.clone().addScaledVector(q.r, HW).addScaledVector(q.n, 0.05);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z); uv.push(0, d / 4, 1, d / 4); if (j > 0 && !gap && !inGap(d - step)) idx.push(vi - 2, vi, vi - 1, vi - 1, vi, vi + 1); vi += 2; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    root.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, toneMapped: false })));
    // under-glow pylons every ~10 m (the mag-rail is clamped to the hull) + edge lamps
    for (let d = 0; d < L; d += LOW ? 16 : 10) { const q = frame(d); if (inGap(d)) continue; for (const s of [-1, 1]) glowSprite(q.p.x + q.r.x * s * HW + q.n.x * 0.15, q.p.y + q.r.y * s * HW + q.n.y * 0.15, q.p.z + q.r.z * s * HW + q.n.z * 0.15, s < 0 ? '#5fe3ff' : '#ffc35a', 0.9, 0.85, root); }
    for (const [a, b] of GAPS) for (const d of [a - 1, b + 1]) { const q = frame(d), m = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.6), new THREE.MeshBasicMaterial({ color: '#f2c230', side: THREE.DoubleSide, toneMapped: false })); m.position.copy(q.p).addScaledVector(q.n, 0.07); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(q.r, q.T, q.n)); root.add(m); } }
  // start gate
  { const q = frame(0), g = new THREE.Group(); g.position.copy(q.p); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(q.r, q.n, q.T.clone().negate())); root.add(g); const m = K.toon('#e8b42a');
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.4, 0.25), m); p.position.set(s * (HW + 0.3), 1.7, 0); g.add(p); }
    const bc = document.createElement('canvas'); bc.width = 1024; bc.height = 192; const c = bc.getContext('2d'); c.fillStyle = '#17110f'; c.fillRect(0, 0, 1024, 192); c.strokeStyle = '#e8b42a'; c.lineWidth = 12; c.strokeRect(6, 6, 1012, 180); c.fillStyle = '#e8b42a'; c.font = '900 110px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('HULL RUN', 36, 100); c.fillStyle = '#f3f2f2'; c.font = '900 48px Archivo, sans-serif'; c.fillText('START · FINISH', 640, 100);
    const t = new THREE.CanvasTexture(bc); t.colorSpace = THREE.SRGBColorSpace; const b = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.9, 0.85), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, toneMapped: false })); b.position.set(0, 3.2, 0); g.add(b); }
  // ---------- pickups + hazards (positions as a fraction of the lap, lane u in -1.4..1.4) ----------
  const coinTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(52, 46, 6, 64, 64, 60); gr.addColorStop(0, '#fff6c2'); gr.addColorStop(0.55, '#ffd23a'); gr.addColorStop(1, '#c98a00'); x.fillStyle = gr; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.lineWidth = 7; x.strokeStyle = '#8a5a00'; x.stroke(); x.fillStyle = '#8a5a00'; x.font = '900 64px Archivo, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('8', 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const items = []; const put = (f, u, kind) => { const d = f * L, q = frame(d), o = new THREE.Group(); o.position.copy(q.p).addScaledVector(q.r, u).addScaledVector(q.n, 0.9); root.add(o);
    if (kind === 'token') { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: coinTex, transparent: true, depthWrite: false, toneMapped: false })); sp.scale.set(1.1, 1.1, 1); o.add(sp); }
    else if (kind === 'o2') { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.75, 14), K.toon('#f3f2f2')); m.quaternion.setFromUnitVectors(V3(0, 1, 0), q.n); o.add(m); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.14, 14), new THREE.MeshBasicMaterial({ color: '#5fe3ff', toneMapped: false })); b.quaternion.copy(m.quaternion); o.add(b); glowSprite(0, 0, 0, '#5fe3ff', 1.6, 0.6, o); }
    else if (kind === 'boost') { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), new THREE.MeshBasicMaterial({ color: '#8fb8ff', toneMapped: false })); o.add(m); glowSprite(0, 0, 0, '#5f8fff', 1.7, 0.7, o); }
    else if (kind === 'rock') { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), K.toon('#8a7a68')); m.rotation.set(f * 9, f * 5, 0); o.add(m); o.position.addScaledVector(q.n, -0.1); }
    else if (kind === 'beam') { o.position.copy(q.p).addScaledVector(q.n, 0.2); const em = K.toon('#2a2220'); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 0.3), em); p.position.copy(q.r).multiplyScalar(s * (HW + 0.3)).addScaledVector(q.n, 1.1); p.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(q.r, q.n, q.T)); o.add(p); }
      const bm = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.6, 2.0), new THREE.MeshBasicMaterial({ color: '#ffc35a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); bm.position.copy(q.n).multiplyScalar(1.1); bm.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(q.r, q.n, q.T)); o.add(bm); o.userData.bm = bm; }
    items.push({ kind, d, u, o, got: false }); };
  [[0.04, 0], [0.13, 1], [0.24, -1], [0.33, 0], [0.43, 1.2], [0.57, -1.2], [0.73, 0.8], [0.88, -0.6]].forEach(([f, u]) => put(f, u, 'token'));
  [[0.09, -1.1], [0.27, 1.1], [0.5, 0], [0.69, -1], [0.84, 1]].forEach(([f, u]) => put(f, u, 'o2'));
  [[0.17, 0], [0.37, -1], [0.62, 1], [0.8, 0]].forEach(([f, u]) => put(f, u, 'boost'));
  [[0.07, 0.9], [0.21, -0.9], [0.35, 0.7], [0.52, -0.6], [0.66, 0.9], [0.75, -1], [0.9, 0.6]].forEach(([f, u]) => put(f, u, 'rock'));
  [[0.31, 0], [0.71, 0]].forEach(([f, u]) => put(f, u, 'beam'));
  // ---------- riders ----------
  const bikeOf = (col) => { const g = new THREE.Group(), body = K.toon(col), dark = K.toon('#1a1d24'), ring = new THREE.MeshBasicMaterial({ color: '#5fe3ff', toneMapped: false });
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.3, 4, 10), body); hull.rotation.x = Math.PI / 2; hull.position.y = 0.62; g.add(hull);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.5, 10), body); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.68, 1.05); g.add(nose);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.7), dark); seat.position.set(0, 0.92, -0.25); g.add(seat);
    for (const z of [-0.72, 0.72]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.09, 8, 22), dark); w.rotation.y = Math.PI / 2; w.position.set(0, 0.42, z); g.add(w); const gw = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 6, 22), ring); gw.rotation.y = Math.PI / 2; gw.position.set(0.1, 0.42, z); g.add(gw); }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.06), dark); bar.position.set(0, 1.1, 0.55); g.add(bar);
    glowSprite(0, 0.7, 1.35, '#fff1c0', 1.2, 0.9, g); const th = glowSprite(0, 0.62, -1.0, '#5fe3ff', 1.4, 0.8, g); g.userData.th = th; return g; };
  function suitUp(f) { const P = f.userData.P; f.updateMatrixWorld(true);
    // FISHBOWL helmet round the head (the face shows through), gold collar ring, O2 pack on the back
    const hb = new THREE.Box3().setFromObject(P.head), c = hb.getCenter(V3()), sz = hb.getSize(V3()), ws = P.head.getWorldScale(V3()).x || 1, r = Math.max(sz.x, sz.y, sz.z) * 0.62 / ws;
    const lc = P.head.worldToLocal(c.clone()); const glass = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), new THREE.MeshBasicMaterial({ color: '#cfefff', transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false })); glass.position.copy(lc); P.head.add(glass);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(r * 1.005, 16, 12, 0.6, 0.9, 0.5, 0.6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false })); shine.position.copy(lc); P.head.add(shine);
    const col = new THREE.Mesh(new THREE.TorusGeometry(r * 0.72, r * 0.09, 8, 24), K.toon('#e8b42a')); col.rotation.x = Math.PI / 2; col.position.copy(lc).add(V3(0, -r * 0.82, 0)); P.head.add(col);
    const bb = new THREE.Box3().setFromObject(P.body), bc = P.body.worldToLocal(bb.getCenter(V3())), bs = bb.getSize(V3()), bws = P.body.getWorldScale(V3()).x || 1;
    for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(bs.x * 0.13 / bws, bs.x * 0.13 / bws, bs.y * 0.34 / bws, 12), K.toon('#f3f2f2')); t.position.set(bc.x + s * bs.x * 0.15 / bws, bc.y + bs.y * 0.12 / bws, bc.z - bs.z * 0.55 / bws); P.body.add(t); }
    const lt = new THREE.Mesh(new THREE.BoxGeometry(bs.x * 0.5 / bws, bs.y * 0.04 / bws, 0.02), new THREE.MeshBasicMaterial({ color: '#5fe3ff', toneMapped: false })); lt.position.set(bc.x, bc.y + bs.y * 0.3 / bws, bc.z - bs.z * 0.72 / bws); P.body.add(lt); }
  function rider(fox, col, name) { const g = new THREE.Group(); root.add(g); const b = bikeOf(col); g.add(b); fox.scale.multiplyScalar(0.62); fox.position.set(0, 0.62, -0.18); g.add(fox); suitUp(fox); return { g, b, fox, name, d: 0, u: 0, v: 0, hop: 0, done: false, t: 0 }; }
  let me = null, rivals = [], built = false;
  function build() { if (built) return; built = true;
    me = rider(mkPlayer(), '#ec3013', 'YOU');
    rivals = [rider(mkFox({ key: 'lxKelSuit', torso: ['#f3f2f2', '#1a3fb8', '#122a7a'], outfit: 'suit', look: { fur: '#e8843a', furDark: '#a24a16' }, mood: 'determined' }), '#1a3fb8', 'KEL'),
      rider(mkFox({ key: 'lxDuneSuit', torso: ['#f3f2f2', '#3a6a3a', '#1a301a'], outfit: 'suit', look: { fur: '#c86a32', furDark: '#7a3a14' }, mood: 'determined' }), '#3a8a4a', 'DUNE')];
    rivals[0].top = 12.6; rivals[0].ph = 0.3; rivals[1].top = 12.1; rivals[1].ph = 2.2; }
  // ---------- music: lofi racing loop through the station mixer ----------
  let bus = null, mStart = 0, mBar = 0; const AC = () => audio && audio.ctx && !audio.muted ? audio.ctx : null; let noiseB = null;
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), dur = nt.d * LOFI.spb; g.connect(bus);
    if (nt.v === 'kick') { const o = ac.createOscillator(); o.frequency.setValueAtTime(110, at0); o.frequency.exponentialRampToValueAtTime(42, at0 + 0.18); g.gain.setValueAtTime(0.28, at0); g.gain.exponentialRampToValueAtTime(0.0001, at0 + 0.3); o.connect(g); o.start(at0); o.stop(at0 + 0.32); return; }
    if (nt.v === 'snare' || nt.v === 'hat') { if (!noiseB) { noiseB = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate); const ch = noiseB.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; } const s = ac.createBufferSource(), f = ac.createBiquadFilter(); s.buffer = noiseB; f.type = nt.v === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = nt.v === 'hat' ? 7000 : 1800; s.connect(f); f.connect(g); g.gain.setValueAtTime(nt.v === 'hat' ? 0.03 : 0.09, at0); g.gain.exponentialRampToValueAtTime(0.0001, at0 + (nt.v === 'hat' ? 0.05 : 0.18)); s.start(at0); s.stop(at0 + 0.2); return; }
    const o = ac.createOscillator(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = nt.v === 'keys' ? 1400 : nt.v === 'lead' ? 2400 : 600; o.type = nt.v === 'bass' ? 'sine' : nt.v === 'lead' ? 'triangle' : 'triangle'; o.frequency.setValueAtTime(hz(nt.m), at0); if (nt.v === 'keys') o.detune.value = (Math.random() - 0.5) * 14;
    const pk = nt.v === 'bass' ? 0.12 : nt.v === 'lead' ? 0.035 : 0.022; o.connect(lp); lp.connect(g); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(pk, at0 + (nt.v === 'keys' ? 0.06 : 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.start(at0); o.stop(at0 + dur + 0.05); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.55; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.1; mBar = 0; }
    const Lb = LOFI.beats * LOFI.spb; while (mStart + mBar * Lb < ac.currentTime + 0.9) { const base = mStart + mBar * Lb; LOFI.notes.forEach(nt => { const a = base + nt.b * LOFI.spb; if (a > ac.currentTime - 0.02) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { const b = bus; b.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2); setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 900); } catch (e) {} } bus = null; }
  const blip = (f, d = 0.12, v = 0.05, type = 'triangle', f2) => { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + d + 0.02); };
  // ---------- the race ----------
  const IN = { steer: 0, brake: false, boost: false, keys: new Set() };
  let G = null, open = false, card = 'intro', msg = '', msgT = 0, bolts = [];
  const say = (t, s = 1.4) => { msg = t; msgT = s; };
  function fresh() { build(); me.d = 0; me.u = 0; me.v = 0; me.hop = 0; me.done = false; rivals.forEach((r, i) => { r.d = 0; r.u = i ? 1.4 : -1.4; r.v = 0; r.done = false; r.t = 0; }); me.u = 0;
    items.forEach(it => { it.got = false; it.o.visible = true; }); return { t: -3.2, o2: 100, boostE: 60, tokens: 0, hits: 0, slip: 0, slow: 0, lastCount: 4, place: 0, finish: null, lasT: 0, best: save.stat('lxHullBest', 0) }; }
  function placeOf() { const all = [me, ...rivals].map(r => r.done ? 1e6 - r.t : r.d); const mine = all[0]; return 1 + all.slice(1).filter(v => v > mine).length; }
  function finish(won) { G.finish = { place: placeOf(), time: G.t, tokens: G.tokens, o2out: !won };
    let gold = 0; if (won) { gold = [0, 40, 20, 10][G.finish.place] + G.tokens * 5 + (G.tokens === 8 ? 40 : 0); save.addGold(gold); save.setStat('lxHullRaces', save.stat('lxHullRaces', 0) + 1); if (G.finish.place === 1) save.setStat('lxHullWins', save.stat('lxHullWins', 0) + 1); const t100 = Math.round(G.t * 100); const prev = save.stat('lxHullBest', 0); if (!prev || t100 < prev) { save.setStat('lxHullBest', t100); G.finish.newBest = true; } if (!save.flag('lxHullDone')) save.setFlag('lxHullDone'); }
    G.finish.gold = gold; card = 'done'; killMusic(); blip(won ? 660 : 160, 0.5, 0.06, won ? 'triangle' : 'square', won ? 990 : 90); }
  function step(dt) { if (!G || card) return; G.t += dt;
    if (G.t < 0) { const c = Math.ceil(-G.t); if (c !== G.lastCount) { G.lastCount = c; blip(c ? 520 : 880, 0.18, 0.05, 'square'); } say(c ? String(c) : 'GO!', 0.5); return; } if (G.lastCount !== 0) { G.lastCount = 0; blip(880, 0.3, 0.06, 'square'); say('GO! MAG LOCK ON', 1.2); }
    // you
    const k = IN.keys, steer = (k.has('ArrowLeft') || k.has('KeyA') ? -1 : 0) + (k.has('ArrowRight') || k.has('KeyD') ? 1 : 0) || IN.steer, brake = IN.brake || k.has('ArrowDown') || k.has('KeyS'), boosting = (IN.boost || k.has('Digit3') || k.has('ShiftLeft')) && G.boostE > 0;
    const top = boosting ? 18.5 : 12.8, acc = brake ? -14 : boosting ? 9 : 5.5; me.v = clamp(me.v + acc * dt, 0, top); if (me.v > top) me.v = lerp(me.v, top, dt * 2);
    if (G.slow > 0) { G.slow -= dt; me.v = Math.min(me.v, 5.5); } if (boosting) { G.boostE = Math.max(0, G.boostE - 26 * dt); } else G.boostE = Math.min(100, G.boostE + 2 * dt);
    me.u = clamp(me.u + steer * 4.2 * dt, -1.6, 1.6); me.hop = Math.max(0, me.hop - dt); const air = me.hop > 0; const d0 = me.d; me.d += me.v * dt;
    G.o2 -= (boosting ? 2.6 : 2.0) * dt; if (G.o2 < 25 && Math.floor(G.t * 2) % 4 === 0) say('OXYGEN LOW · GRAB A WHITE CANISTER', 0.6); if (G.o2 <= 0) { G.o2 = 0; finish(false); return; }
    // gaps, rocks, beams, pickups
    if (!air && inGap(me.d) && !inGap(d0)) { G.slow = 1.1; G.o2 -= 6; G.slip++; say('MAG LOCK LOST! HOP (2) THE GAPS', 1.5); blip(150, 0.3, 0.06, 'sawtooth', 70); }
    for (const it of items) { if (it.got) continue; const dd = me.d - it.d; if (dd < -1.4 || dd > 1.4) continue; const du = Math.abs(me.u - it.u);
      if (it.kind === 'rock') { if (!air && du < 1.15 && Math.abs(dd) < 0.9) { it.got = true; it.o.visible = false; G.slow = 0.9; G.o2 -= 5; G.hits++; say('ROCK! ZAP THEM (1) OR HOP (2)', 1.4); blip(110, 0.25, 0.08, 'sawtooth', 60); } continue; }
      if (it.kind === 'beam') { const on = (G.t % 4.4) < 2.2; it.o.userData.bm.material.opacity = on ? 0.32 : (G.t % 4.4) > 3.6 && Math.sin(G.t * 30) > 0 ? 0.14 : 0.02; if (on && Math.abs(dd) < 0.6 && !it.hitNow) { it.hitNow = true; G.slow = 0.8; G.o2 -= 4; say('SCORCHED BY A MIRROR BEAM', 1.3); blip(300, 0.3, 0.06, 'sawtooth', 120); } if (Math.abs(dd) > 1) it.hitNow = false; continue; }
      if (du < 1.0 && Math.abs(dd) < 1.2) { it.got = true; it.o.visible = false;
        if (it.kind === 'token') { G.tokens++; say('TOKEN ' + G.tokens + ' / 8' + (G.tokens === 8 ? ' · ALL EIGHT!' : ''), 1.1); blip(1175, 0.12, 0.05); setTimeout(() => blip(1568, 0.16, 0.05), 80); }
        else if (it.kind === 'o2') { G.o2 = Math.min(100, G.o2 + 28); say('OXYGEN +28', 1); blip(660, 0.2, 0.05, 'sine', 990); }
        else { G.boostE = Math.min(100, G.boostE + 35); say('BOOST CELL', 0.9); blip(523, 0.18, 0.05, 'square', 1046); } } }
    for (const it of items) if (it.kind === 'beam') { const on = (G.t % 4.4) < 2.2; it.o.userData.bm.material.opacity = on ? 0.32 : (G.t % 4.4) > 3.6 && Math.sin(G.t * 30) > 0 ? 0.14 : 0.02; }
    // rivals: rubber band toward you, weave, hop the gaps
    for (const r of rivals) { if (r.done) continue; const gapTo = r.d - me.d, band = gapTo > 35 ? 0.9 : gapTo < -35 ? 1.08 : 1; r.v = lerp(r.v, r.top * band * (inGap(r.d) ? 1 : 1), dt * 1.2); r.d += r.v * dt; r.u = Math.sin(r.d * 0.04 + r.ph) * 1.1; r.hop = inGap(r.d + 3) ? 0.4 : Math.max(0, r.hop - dt); if (r.d >= L) { r.done = true; r.t = G.t; } }
    if (me.d >= L) { me.done = true; me.t = G.t; finish(true); }
    G.lasT -= dt; if (msgT > 0) msgT -= dt; }
  function fire() { if (!G || card || G.t < 0 || G.lasT > 0) return; G.lasT = 0.35; blip(1800, 0.14, 0.05, 'sawtooth', 300);
    let best = null; for (const it of items) { if (it.kind !== 'rock' || it.got) continue; const dd = it.d - me.d; if (dd > 0.5 && dd < 30 && Math.abs(it.u - me.u) < 1.5 && (!best || dd < best.d - me.d)) best = it; }
    const a = frame(me.d), from = a.p.clone().addScaledVector(a.r, me.u).addScaledVector(a.n, 1.0), to = best ? best.o.position.clone() : from.clone().addScaledVector(a.T, 25);
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]), ln = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#5fe3ff', transparent: true, opacity: 1, toneMapped: false })); root.add(ln); bolts.push({ ln, t: 0.18 });
    if (best) { best.got = true; best.o.visible = false; say('ROCK ZAPPED', 0.8); blip(200, 0.2, 0.06, 'square', 60); } }
  function hop() { if (!G || card || G.t < 0 || me.hop > 0) return; me.hop = 0.75; blip(392, 0.2, 0.05, 'triangle', 784); }
  function pose(r, dt, T) { const a = frame(r.d), up = r.hop > 0 ? Math.sin(Math.PI * (1 - r.hop / (r === me ? 0.75 : 0.4))) * 1.4 : 0;
    r.g.position.copy(a.p).addScaledVector(a.r, r.u).addScaledVector(a.n, 0.12 + up); const x = V3().crossVectors(a.n, a.T); r.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, a.n, a.T));
    const P = r.fox.userData.P; if (P) { if (P.legs) P.legs.forEach((l, i) => { l.rotation.x = -1.35; l.rotation.z = i ? -0.18 : 0.18; }); if (P.arms) P.arms.forEach(l => { l.rotation.x = -1.25; }); if (P.body) P.body.rotation.x = 0.35; }
    if (r.b.userData.th) r.b.userData.th.material.opacity = 0.5 + 0.4 * Math.min(1, r.v / 13) + (r === me && G && G.boostE > 0 && (IN.boost || IN.keys.has('Digit3')) ? 0.3 : 0); }
  // keys (desktop): steer A/D or arrows, S/down brake, 1 laser, 2 hop, 3 boost
  const KEYS = /^(ArrowLeft|ArrowRight|ArrowDown|ArrowUp|KeyA|KeyD|KeyS|KeyW|Digit1|Digit2|Digit3|ShiftLeft|Space)$/;
  const onKD = e => { if (!open || card || !KEYS.test(e.code)) return; e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) { if (e.code === 'Digit1') fire(); if (e.code === 'Digit2' || e.code === 'Space') hop(); } IN.keys.add(e.code); };
  const onKU = e => { if (!KEYS.test(e.code)) return; IN.keys.delete(e.code); };
  const camP = V3(), camL = V3(), camU = V3(0, 1, 0);
  return {
    title: 'HULL RUN', where, W: 200, H: 140,
    pad: [{ k: 1, label: 'LASER', sub: 'ZAP ROCKS' }, { k: 2, label: 'HOP', sub: 'GAPS + ROCKS' }, { k: 3, label: 'BOOST', sub: 'HOLD' }],
    sticks: [['\u25c0', 'STEER', -1, 0], ['\u25bc', 'BRAKE', 0, -1], ['\u25b6', 'STEER', 1, 0]],
    surface: { c: V3(ox, -50, 0), u: V3(1, 0, 0), v: V3(0, 0, 1), n: V3(0, 1, 0), w: 1, h: 1 },
    stand: { x: ox + at.x, z: at.z, face: -Math.PI / 2 },
    camPose(camTo, lookTo, upTo) { if (!built) build(); const a = frame(me.d), p = a.p.clone().addScaledVector(a.r, me.u);
      const back = card === 'intro' ? 7.5 : 5.2, hi = card === 'intro' ? 3.2 : 2.2; camTo.copy(p).addScaledVector(a.T, -back).addScaledVector(a.n, hi); lookTo.copy(p).addScaledVector(a.T, 5).addScaledVector(a.n, 0.8); camTo.x += ox; lookTo.x += ox; upTo.copy(a.n); return 62; },
    begin() { open = true; build(); root.visible = true; card = 'intro'; G = fresh(); for (const r of [me, ...rivals]) pose(r, 0, 0); addEventListener('keydown', onKD, true); addEventListener('keyup', onKU, true); },
    end() { open = false; killMusic(); root.visible = false; removeEventListener('keydown', onKD, true); removeEventListener('keyup', onKU, true); IN.keys.clear(); IN.steer = 0; IN.brake = IN.boost = false; },
    tick(dt, T, fly) { if (!open) return; if (fly > 0.85) { step(dt); if (!card) music(); } for (const r of [me, ...rivals]) pose(r, dt, T);
      for (const it of items) if (it.o.visible && it.kind !== 'beam') { it.o.rotation.y += dt * 1.6; it.o.scale.setScalar(1 + 0.08 * Math.sin(T * 4 + it.d)); }
      for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.t -= dt; b.ln.material.opacity = Math.max(0, b.t / 0.18); if (b.t <= 0) { root.remove(b.ln); b.ln.geometry.dispose(); bolts.splice(i, 1); } } },
    down() {}, move() {}, up() {},
    padPress(k, d) { if (k === 1 && d) fire(); if (k === 2 && d) hop(); if (k === 3) IN.boost = !!d; },
    padStick(x, y) { IN.steer = x; IN.brake = y < -0.5; },
    hud() { if (card === 'intro') return { card: { kicker, title: 'Hull Run', body: 'Mag-wheel race round the OUTSIDE of the station: up the walls, over the capstone, a corkscrew round your ship, upside down under the keel. Beat Kel + Dune, grab the 8 tokens, keep your oxygen up. 1 laser · 2 hop · 3 boost, steer ◀ ▶.' + (G && G.best ? ' Best lap ' + (G.best / 100).toFixed(2) + ' s.' : ''), buttons: ['SUIT UP · RACE', 'NOT NOW'] } };
      if (card === 'done' && G.finish) { const f = G.finish, pl = ['', '1ST', '2ND', '3RD'][f.place]; return { card: { kicker: 'Hull Run · ' + (f.o2out ? 'out of oxygen' : 'finish'), title: f.o2out ? 'OXYGEN OUT' : pl + ' PLACE', mood: f.o2out ? 'Your suit pulled you back to the launch door. Grab the white canisters next time.' : f.place === 1 ? 'Kel and Dune eat your space dust.' : 'So close. Use the boost on the long roof run.',
        notes: [f.o2out ? '' : 'Time ' + f.time.toFixed(2) + ' s' + (f.newBest ? ' · NEW BEST' : ''), 'Tokens ' + f.tokens + ' / 8' + (f.tokens === 8 ? ' · ALL EIGHT' : '')].concat(f.gold ? ['+' + f.gold + ' G'] : []).filter(Boolean), buttons: ['RACE AGAIN', 'BACK TO THE BIKE BAY'] } }; }
      if (!G) return {}; const zone = ZONES.slice().reverse().find(z => ((me.d % L) / L) >= z[0]); const pl = ['', '1ST', '2ND', '3RD'][placeOf()];
      return { showStats: true, stats: [['Place', pl, placeOf() === 1 ? '#8fe38f' : null], ['Tokens', G.tokens + ' / 8'], ['O2', Math.round(G.o2) + '%', G.o2 < 25 ? '#ec3013' : null], ['Boost', Math.round(G.boostE) + '%']], where: msgT > 0 ? msg : (zone ? zone[1] : ''), alert: G.o2 < 25, pad: this.pad, sticks: this.sticks }; },
    cardPick(i) { const c = this.hud().card, b = c && c.buttons[i]; if (!b || /NOT NOW|BACK TO/.test(b)) return 'leave'; G = fresh(); card = null; },
  };
}
