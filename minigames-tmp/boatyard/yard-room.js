// JON'S BOATWORKS [jonBoatworks] — the floating workshop on its own (no imports), so a world can mount it without the job.
// buildYard(ctx): ctx { THREE, M, toon, canvasTex, scene, grad, addOutline?, origin {x,y?,z}, rotY, mounted }. mounted = inside a city shell:
// no open-sea water, foam, islands or clouds; a small wet slip under the lift; Y.decks / Y.deckY / Y.cols / Y.world(x,z) in world space.
export const PAINTS = { red: { name: 'RED', col: '#d8432f' }, teal: { name: 'TEAL', col: '#2f9a8f' }, yellow: { name: 'YELLOW', col: '#f2c94c' }, navy: { name: 'NAVY', col: '#1f3a5f' } };
export const PK = Object.keys(PAINTS);
export const DY = 0.4, RAISE = 1.4;

// ---------------- the floating workshop ----------------
export function buildYard(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, rotY = 0, mounted = false } = ctx, root = new T3.Group(); root.position.set(origin.x, origin.y || 0, origin.z); root.rotation.y = rotY; scene.add(root);
  const Y = { root, cut: [], front: [] }, ink = toon('#201e1d'), yel = toon('#f2c94c'), navy = toon('#1f3a5f'), red = toon('#e2453f'), wood = toon('#b8945f'), woodD = toon('#7a5a3a'), white = toon('#fbf8ec'), rope = toon('#d9c08a');
  const waterT = CTX(256, 256, c => { c.fillStyle = '#3aa0c4'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#7cc8e0'; c.lineWidth = 3; for (let i = 0; i < 18; i++) { const x = (i * 53) % 256, y = (i * 97) % 256; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - 5, x + 22, y); c.stroke(); } });
  waterT.wrapS = waterT.wrapT = T3.RepeatWrapping; waterT.repeat.set(16, 16); Y.waterT = waterT;
  const water = new T3.Mesh(mounted ? new T3.PlaneGeometry(11.7, 3.5).translate(1.65, 0, 0) : new T3.PlaneGeometry(90, 90), new T3.MeshToonMaterial({ map: waterT, gradientMap: ctx.grad })); water.rotation.x = -Math.PI / 2; water.receiveShadow = true; if (mounted) { water.position.y = 0.06; waterT.repeat.set(2, 0.6); } root.add(water);
  const plankT = CTX(256, 256, c => { c.fillStyle = '#b8945f'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = i % 3 ? '#b08a55' : '#c29e68'; c.fillRect(i * 32, 0, 30, 256); c.fillStyle = '#6b4a2c'; c.fillRect(i * 32 + 30, 0, 2, 256); c.fillRect(i * 32 + 14, (i * 77) % 256, 3, 3); } });
  plankT.wrapS = plankT.wrapT = T3.RepeatWrapping; plankT.repeat.set(5, 3); const deckM = new T3.MeshToonMaterial({ map: plankT, gradientMap: ctx.grad });
  const deck = (x0, x1, z0, z1) => { const m = M(new T3.BoxGeometry(x1 - x0, 0.3, z1 - z0), deckM, (x0 + x1) / 2, DY - 0.15, (z0 + z1) / 2, root, 0.02); for (let x = x0 + 0.8; x < x1; x += 2.4) for (const z of [z0 + 0.3, z1 - 0.3]) M(new T3.CylinderGeometry(0.28, 0.28, 0.9, 12), red, x, 0.02, z, root, 0.01).rotation.z = Math.PI / 2; return m; };
  deck(-7.5, 7.5, -6.2, -1.75); deck(-7.5, 7.5, 1.75, 2.9); deck(-7.5, -4.2, -1.75, 1.75);
  for (const x of [-3, 0, 3]) for (const z of [-1.82, 1.82]) { const t = M(new T3.TorusGeometry(0.2, 0.08, 6, 14), ink, x, DY - 0.2, z, root, 0.008); }
  // lift: four yellow posts, top beams, sling bars
  Y.lift = { top: 4.4 };
  Y.liftFront = []; for (const x of [-3.1, 3.1]) for (const z of [-1.95, 1.95]) { const fc = root.children.length; M(new T3.BoxGeometry(0.24, 4.0, 0.24), yel, x, DY + 2.0, z, root, 0.015); for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.25, 0.08, 0.25), ink, x, DY + 0.4 + i * 0.8, z, root, 0); if (z > 0) Y.liftFront.push(...root.children.slice(fc)); }
  for (const z of [-1.95, 1.95]) { const m = M(new T3.BoxGeometry(6.5, 0.26, 0.26), yel, 0, 4.4, z, root, 0.015); if (z > 0) Y.liftFront.push(m); }
  for (const x of [-3.1, 3.1]) M(new T3.BoxGeometry(0.26, 0.26, 4.1), yel, x, 4.4, 0, root, 0.015);
  M(new T3.BoxGeometry(0.6, 0.4, 0.5), navy, -3.1, 4.75, -1.95, root, 0.01);
  Y.slings = [-1.3, 1.3].map(x => { M(new T3.BoxGeometry(0.1, 0.1, 4.0), ink, x, 4.3, 0, root, 0); const g = { x, cabs: [], bot: M(new T3.BoxGeometry(0.22, 0.05, 1), toon('#3a6ea5'), x, 0, 0, root, 0) }; for (let i = 0; i < 2; i++) g.cabs.push(M(new T3.BoxGeometry(0.03, 1, 0.03), ink, x, 2, 0, root, 0)); return g; });
  // shed on the back deck
  const wallT = CTX(256, 256, c => { c.fillStyle = '#5a7a8c'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 256; i += 32) { c.fillStyle = '#4a6878'; c.fillRect(0, i + 29, 256, 3); } c.fillStyle = '#6a8a9a'; for (let i = 0; i < 30; i++) c.fillRect((i * 71) % 256, (i * 37) % 256, 18, 2); }); wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1);
  const wall = new T3.Mesh(new T3.PlaneGeometry(15, 3.6), new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad, side: mounted ? T3.DoubleSide : T3.FrontSide })); wall.position.set(0, DY + 1.8, -6.1); root.add(wall);
  for (const x of [-7.4, 7.4]) { const sw = new T3.Mesh(new T3.PlaneGeometry(3.6, 3.6), wall.material); sw.position.set(x, DY + 1.8, -4.3); sw.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; root.add(sw); }
  const roof = M(new T3.BoxGeometry(15.4, 0.14, 4.4), toon('#8f2b1e'), 0, DY + 3.75, -4.2, root, 0.02); roof.rotation.x = 0.16;
  for (const x of [-7.3, -2.5, 2.5, 7.3]) M(new T3.BoxGeometry(0.18, 3.3, 0.18), woodD, x, DY + 1.65, -2.35, root, 0.01);
  const signT = CTX(1024, 160, c => { c.fillStyle = '#1f3a5f'; c.fillRect(0, 0, 1024, 160); c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 1024, 12); c.fillRect(0, 148, 1024, 12); c.fillStyle = '#fbf8ec'; c.font = '900 92px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("JON'S BOATWORKS", 512, 84); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(5.2, 0.8), new T3.MeshBasicMaterial({ map: signT })); s.position.set(0, DY + 3.1, -2.28); root.add(s); }
  const pegT = CTX(512, 256, c => { c.fillStyle = '#c9a06a'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#9a7444'; for (let y = 12; y < 256; y += 20) for (let x = 12; x < 512; x += 20) c.fillRect(x, y, 3, 3); c.fillStyle = '#201e1d'; c.fillRect(40, 40, 16, 140); c.fillRect(20, 40, 56, 30); c.fillRect(120, 60, 120, 14); c.fillRect(220, 40, 30, 54); c.beginPath(); c.arc(330, 110, 50, 0, 7); c.lineWidth = 12; c.strokeStyle = '#201e1d'; c.stroke(); c.fillRect(420, 40, 14, 160); c.fillRect(400, 40, 54, 20); });
  { const p = new T3.Mesh(new T3.PlaneGeometry(3.4, 1.7), new T3.MeshBasicMaterial({ map: pegT })); p.position.set(-3.6, DY + 1.9, -6.08); root.add(p); }
  M(new T3.BoxGeometry(3.4, 0.9, 0.9), wood, -3.6, DY + 0.45, -5.5, root, 0.02); M(new T3.BoxGeometry(3.5, 0.08, 1.0), woodD, -3.6, DY + 0.94, -5.5, root, 0.01);
  PK.forEach((k, i) => { M(new T3.CylinderGeometry(0.16, 0.16, 0.3, 14), toon(PAINTS[k].col), -4.8 + i * 0.42, DY + 1.13, -5.4, root, 0.008, 0.16); M(new T3.CylinderGeometry(0.165, 0.165, 0.03, 14), toon('#d7dde3'), -4.8 + i * 0.42, DY + 1.29, -5.4, root, 0); });
  // prop rack (decor) + rope + life rings + crates
  for (let i = 0; i < 3; i++) { const p = propMesh(T3, toon, i + 2, false, ctx.addOutline); p.rotation.y = Math.PI / 2; p.position.set(2.6 + i * 1.0, DY + 2.0, -6.0); root.add(p); }
  M(new T3.TorusGeometry(0.4, 0.09, 8, 20), rope, 5.6, DY + 0.1, -4.2, root, 0.01).rotation.x = Math.PI / 2; M(new T3.TorusGeometry(0.3, 0.08, 8, 20), rope, 5.6, DY + 0.25, -4.2, root, 0.01).rotation.x = Math.PI / 2;
  for (const [x, z] of [[-7.15, -2.35], [6.6, -3.0]]) { const lr = new T3.Group(); lr.position.set(x, DY + 1.2, z); root.add(lr); for (let i = 0; i < 8; i++) { const s = M(new T3.TorusGeometry(0.34, 0.1, 6, 6, Math.PI / 4), i % 2 ? white : red, 0, 0, 0, lr, 0.006); s.rotation.z = i * Math.PI / 4; } }
  M(new T3.BoxGeometry(0.8, 0.6, 0.8), wood, 6.4, DY + 0.3, -5.2, root, 0.015); M(new T3.BoxGeometry(0.6, 0.45, 0.6), woodD, 6.5, DY + 0.82, -5.2, root, 0.015);
  // lanterns on the front catwalk (front list = hidden when the camera is close)
  Y.lamps = []; for (const x of [-6.8, -4.6, 4.6, 6.8]) { const fc = root.children.length; M(new T3.BoxGeometry(0.1, 1.6, 0.1), woodD, x, DY + 0.8, 2.8, root, 0.006); const l = M(new T3.BoxGeometry(0.22, 0.28, 0.22), new T3.MeshBasicMaterial({ color: 0xffe08a }), x, DY + 1.7, 2.8, root, 0.008); Y.lamps.push(l); Y.front.push(...root.children.slice(fc)); }
  { const fc = root.children.length; for (let x = -7.4; x <= 7.4; x += 1.0) M(new T3.BoxGeometry(0.07, 0.7, 0.07), woodD, x, DY + 0.35, 2.85, root, 0); M(new T3.BoxGeometry(15, 0.07, 0.07), woodD, 0, DY + 0.7, 2.85, root, 0); Y.front.push(...root.children.slice(fc)); }
  // bollards + foam along the pontoon edges
  for (const x of [-4.0, 4.0, 7.0]) for (const z of [-1.95, 1.95]) { const fc = root.children.length; M(new T3.CylinderGeometry(0.11, 0.13, 0.32, 10), ink, x, DY + 0.16, z + (z > 0 ? 0.25 : -0.25), root, 0.008, 0.12); M(new T3.CylinderGeometry(0.17, 0.17, 0.06, 10), ink, x, DY + 0.34, z + (z > 0 ? 0.25 : -0.25), root, 0.006, 0.17); if (z > 0) Y.front.push(...root.children.slice(fc)); }
  const foamM = new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }); Y.foamM = foamM;
  if (!mounted) for (const [x, z, w, d] of [[1.65, -1.72, 11.7, 0.18], [1.65, 1.72, 11.7, 0.18], [0, -6.28, 15.2, 0.2], [0, 2.98, 15.2, 0.2], [7.58, -1.65, 0.2, 9.3], [-7.58, -1.65, 0.2, 9.3], [-4.12, 0, 0.18, 3.5]]) { const f = new T3.Mesh(new T3.PlaneGeometry(w, d), foamM); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.015, z); root.add(f); }
  // window + hanging lamps in the shed
  const winT = CTX(256, 160, c => { c.fillStyle = '#ffe9b0'; c.fillRect(0, 0, 256, 160); const gr = c.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#fff6d8'); gr.addColorStop(1, '#f2c06a'); c.fillStyle = gr; c.fillRect(10, 10, 236, 140); c.fillStyle = '#7a5a3a'; c.fillRect(0, 0, 256, 10); c.fillRect(0, 150, 256, 10); c.fillRect(0, 0, 10, 160); c.fillRect(246, 0, 10, 160); c.fillRect(123, 0, 10, 160); c.fillRect(0, 75, 256, 10); });
  { const w = new T3.Mesh(new T3.PlaneGeometry(1.7, 1.06), new T3.MeshBasicMaterial({ map: winT })); w.position.set(0.2, DY + 1.85, -6.08); root.add(w); }
  for (const x of [-3.6, 0.2, 3.6]) { M(new T3.CylinderGeometry(0.01, 0.01, 0.7, 4), ink, x, DY + 3.25, -3.9, root, 0); M(new T3.ConeGeometry(0.28, 0.24, 14, 1, true), toon('#1f3a5f', { side: T3.DoubleSide }), x, DY + 2.8, -3.9, root, 0.008); M(new T3.SphereGeometry(0.08, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff0c0 }), x, DY + 2.7, -3.9, root, 0); }
  // far islands, a lighthouse and clouds (fog fades them)
  if (!mounted) { const isl = toon('#5f8f4a'), sandI = toon('#e8d6a8');
  for (const [x, z, r, h] of [[-38, -52, 9, 4], [-22, -60, 6, 2.6], [24, -56, 11, 5], [44, -40, 7, 3]]) { const m = M(new T3.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), isl, x, -0.2, z, root, 0); m.scale.y = h / r; M(new T3.CylinderGeometry(r * 1.08, r * 1.12, 0.5, 18), sandI, x, 0, z, root, 0); }
  { const lh = new T3.Group(); lh.position.set(28, 4.5, -56); root.add(lh); for (let i = 0; i < 4; i++) M(new T3.CylinderGeometry(0.75 - i * 0.08, 0.8 - i * 0.08, 1.4, 12), i % 2 ? red : white, 0, 0.7 + i * 1.4, 0, lh, 0); M(new T3.CylinderGeometry(0.55, 0.55, 0.8, 10), toon('#fff0b0'), 0, 6.1, 0, lh, 0); M(new T3.ConeGeometry(0.75, 0.8, 10), red, 0, 6.9, 0, lh, 0); }
  const cloudM = new T3.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (const [x, y, z, k] of [[-30, 17, -62, 1.2], [6, 21, -66, 1.6], [34, 15, -60, 1], [-8, 13, -58, 0.8]]) { const c = new T3.Group(); c.position.set(x, y, z); c.scale.set(k * 1.6, k * 0.7, k); root.add(c); for (let i = 0; i < 5; i++) { const b = new T3.Mesh(new T3.SphereGeometry(2.2 - Math.abs(i - 2) * 0.4, 12, 8), cloudM); b.position.set((i - 2) * 2.4, Math.abs(i - 2) < 1 ? 0.8 : 0, 0); c.add(b); } } }
  Y.spots = { ben: { x: -0.8, z: 2.3 }, jon: { x: -2.3, z: 2.3 }, jonWork: { x: -1.6, z: -4.7 }, owner: { x: -5.4, z: -4.3 }, talk: { x: -6.0, z: 0.9 } };
  if (mounted) { root.updateMatrixWorld(true); const v = new T3.Vector3(), rect = (x0, x1, z0, z1) => { const xs = [], zs = []; for (const [x, z] of [[x0, z0], [x1, z1]]) { v.set(x, 0, z); root.localToWorld(v); xs.push(v.x); zs.push(v.z); } return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]; };
    Y.world = (x, z) => { v.set(x, 0, z); root.localToWorld(v); return { x: v.x, z: v.z }; };
    Y.deckY = DY; Y.decks = [rect(-7.5, 7.5, -6.2, -1.75), rect(-7.5, 7.5, 1.75, 2.9), rect(-7.5, -4.2, -1.75, 1.75)];
    Y.cols = [rect(-4.2, 7.6, -1.75, 1.75), rect(-7.5, 7.5, -6.3, -5.95), rect(-7.55, -7.25, -6.2, -2.4), rect(7.25, 7.55, -6.2, -2.4), rect(-5.3, -1.9, -5.95, -5.05), rect(-7.5, 7.5, 2.8, 2.95), rect(6.0, 6.8, -5.6, -4.8)]; }
  return Y;
}

export function propMesh(T3, toon, n, bent, outline) {
  const g = new T3.Group(), col = bent ? '#a0603a' : '#d9b45a', hub = new T3.Mesh(new T3.CylinderGeometry(0.07, 0.07, 0.14, 12), toon(col)); hub.rotation.z = Math.PI / 2; if (outline) outline(hub, 0.006, 0.07); g.add(hub);
  for (let i = 0; i < n; i++) { const pv = new T3.Group(); pv.rotation.x = i * Math.PI * 2 / n; g.add(pv); const b = new T3.Mesh(new T3.BoxGeometry(0.03, 0.26, 0.11), toon(col)); b.position.y = 0.16; b.rotation.y = 0.5; if (bent && i % 2 === 0) { b.rotation.z = 0.7; b.scale.y = 0.7; b.position.y = 0.12; } if (outline) outline(b, 0.005); pv.add(b); }
  return g; }

