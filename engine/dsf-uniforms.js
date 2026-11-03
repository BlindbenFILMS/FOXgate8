// DEEP SPACE FOX · UNIFORMS (s608, DSF Uniform Workshop.dc.html). Ported from the 2D game's WARDROBE (deep_space_fox_012.html):
//   DUTY      black body, the DIVISION colour as a yoke across shoulders + upper chest (seam dips at the centre), grey undershirt V, rank pips
//             on the wearer's right collar, the gold STATION 8 badge pinned on the yoke seam, wearer's left breast.
//   TRADE     Quirk's bar: quilted brocade, a deep lapel over a contrasting shirt, big padded shoulders, a clasp. No badge.
//   SUIT      Garok's: twill, notched lapels, waistcoat with 3 buttons, open collar, pocket square where the 8 would be. No badge.
//   CONSTABLE Odd the O's: plain brown tunic, a standing collar, one strap from the right shoulder to the left hip, a belt, a PEWTER 8.
// Painted on a canvas wrapped round the fox's torso (front = u 0.5) + a few 3D bits (collar, pips, badge, shoulder caps, pads).
export const UNIFORM_KEY = 'dsf.uniforms.v1';
export const KITS = [['duty', 'DUTY'], ['trade', 'TRADE'], ['suit', 'SUIT'], ['constable', 'CONSTABLE']];
export const DIVS = [['command', 'COMMAND'], ['ops', 'OPERATIONS'], ['science', 'SCIENCES']];
export const RANKS = [[0, 'CREWMAN'], [-1, 'ENSIGN'], [1, 'LT. (JG)'], [2, 'LIEUTENANT'], [3, 'COMMANDER'], [4, 'CAPTAIN']];
export const UNIFORM_DEFAULTS = {
  div: { command: { hi: '#c0392b', mid: '#c82b2a', lo: '#c32f2a' }, ops: { hi: '#d59a2b', mid: '#d2952a', lo: '#cc8f26' }, science: { hi: '#2f7fa8', mid: '#2b7aa3', lo: '#28739a' } },   // s608 Ben: one flat yoke colour (3 tones nearly equal)
  duty: { bodyHi: '#1d2128', bodyMid: '#12151a', bodyLo: '#080a0d', collar: '#8d949e', badge: '#e0b23f' },
  trade: { cols: ['#c08a2e', '#8a5c14', '#452c08'], trim: '#f7d67a', shirt: '#3a2340' },
  suit: { cols: ['#4e3a56', '#33253c', '#1a1122'], shirt: '#efe6dc', vest: '#3d2c47', trim: '#8a5a72', square: '#c9a24a' },
  constable: { hi: '#8a6640', mid: '#5f4527', lo: '#301f10', collar: '#c7a271', strap: '#3f2a15', badge: '#9aa3ad' },
  wear: { player: { kit: 'duty', div: 'command', pips: 0 }, hope: { kit: 'duty', div: 'science', pips: 1 }, noble: { kit: 'duty', div: 'ops', pips: 1 } } };
// the 2D cast, verbatim kits (Space Station 8)
export const CREW = [
  { key: 'benny', name: 'CAPT. BENNY', kit: 'duty', div: 'command', pips: 4, fur: '#d2792f' },
  { key: 'korra', name: 'KORRA', kit: 'duty', div: 'command', pips: 3, fur: '#c98a5a' },
  { key: 'warf', name: 'WARF', kit: 'duty', div: 'ops', pips: 3, fur: '#6b4a2c' },
  { key: 'bashad', name: 'DR. BASHAD', kit: 'duty', div: 'science', pips: 2, fur: '#fb923c' },
  { key: 'dacks', name: 'DACKS', kit: 'duty', div: 'science', pips: 2, fur: '#e8d6c0' },
  { key: 'obrain', name: "O'BRAIN", kit: 'duty', div: 'ops', pips: 0, fur: '#c0662a' },
  { key: 'oddo', name: 'ODD the O', kit: 'constable', fur: '#d9c49a' },
  { key: 'quirk', name: 'QUIRK', kit: 'trade', cols: ['#c08a2e', '#8a5c14', '#452c08'], trim: '#f7d67a', shirt: '#3a2340', fur: '#e8a24a' },
  { key: 'garok', name: 'GAROK', kit: 'suit', fur: '#d3c0b0' } ];
const clone = o => JSON.parse(JSON.stringify(o));
export function loadUniforms() { let s = {}; try { s = JSON.parse(localStorage.getItem(UNIFORM_KEY) || '{}') || {}; } catch (e) {}
  const D = clone(UNIFORM_DEFAULTS), out = {}; for (const k in D) out[k] = typeof D[k] === 'object' && !Array.isArray(D[k]) ? deep(D[k], s[k] || {}) : (s[k] ?? D[k]); return out; }
function deep(a, b) { const o = { ...a }; for (const k in b) o[k] = a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) ? deep(a[k], b[k]) : b[k]; return o; }
export function saveUniforms(u) { try { localStorage.setItem(UNIFORM_KEY, JSON.stringify(u)); } catch (e) {} }
// the base fox for a kit: a plain tee in the body colours, so the sleeves are the uniform's
export function uniformOutfit(U, w) { const k = w.kit;
  const torso = k === 'duty' ? [U.duty.bodyHi, U.duty.bodyMid, U.duty.bodyLo] : k === 'constable' ? [U.constable.hi, U.constable.mid, U.constable.lo] : (w.cols || U[k].cols).slice();
  return { outfit: 'tee', torso }; }
// ---------- the painter: a 1024x512 canvas, x = round the body (front centre at 512), y = neck (top) to hem (bottom) ----------
function paint(U, w) { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d'), W = 1024, H = 512, cx = 512, k = w.kit;
  const vgrad = (a, b, d) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(0.5, b); gr.addColorStop(1, d); return gr; };
  const front = (fn) => { g.save(); g.translate(cx, 0); fn(); g.restore(); };   // draw in a frame centred on the front, 1 unit = 8 px wide, 6 px tall
  if (k === 'duty') { const D = U.div[w.div] || U.div.ops, B = U.duty;
    g.fillStyle = vgrad(B.bodyHi, B.bodyMid, B.bodyLo); g.fillRect(0, 0, W, H);
    // THE YOKE: shoulders + upper chest in the division colour, the seam dips at the front centre (and at the back, so the shot from behind is not plain black)
    const yg = g.createLinearGradient(0, 0, 0, H * 0.46); yg.addColorStop(0, D.hi); yg.addColorStop(0.6, D.mid); yg.addColorStop(1, D.lo); g.fillStyle = yg;
    const seam = x => { const d = Math.cos(((x - cx) / W) * Math.PI * 2); return H * (0.46 + 0.012 * Math.pow(Math.abs(d), 3)); };   // s608 Ben: ~25 % of the 8 badge on the colour, and the seam nearly level so the red comes down the shoulders + sides to the same height
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); for (let x = W; x >= 0; x -= 8) g.lineTo(x, seam(x)); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 7; g.beginPath(); for (let x = 0; x <= W; x += 8) x ? g.lineTo(x, seam(x)) : g.moveTo(x, seam(x)); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, H * 0.06); g.lineTo(W, H * 0.06); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, seam(cx) + 6); g.lineTo(cx, H); g.stroke();
    // the grey undershirt V at the neck
    front(() => { g.fillStyle = B.collar; g.beginPath(); g.moveTo(-70, 0); g.lineTo(70, 0); g.lineTo(44, 60); g.lineTo(0, 84); g.lineTo(-44, 60); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(-70, 0); g.lineTo(-44, 60); g.lineTo(0, 84); g.lineTo(44, 60); g.lineTo(70, 0); g.stroke(); }); }
  else if (k === 'trade') { const T = { ...U.trade, ...(w.cols ? { cols: w.cols } : {}), ...(w.trim ? { trim: w.trim } : {}), ...(w.shirt ? { shirt: w.shirt } : {}) }, C = T.cols;
    g.fillStyle = vgrad(C[0], C[1], C[2]); g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(0,0,0,0.30)'; g.lineWidth = 5; for (let i = -12; i <= 24; i++) { g.beginPath(); g.moveTo(i * 48, 0); g.lineTo(i * 48 + 260, H); g.stroke(); g.beginPath(); g.moveTo(i * 48 + 260, 0); g.lineTo(i * 48, H); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 3; for (let i = -12; i <= 24; i++) { g.beginPath(); g.moveTo(i * 48 + 10, 0); g.lineTo(i * 48 + 270, H); g.stroke(); }
    front(() => { g.fillStyle = T.shirt; g.beginPath(); g.moveTo(-60, 0); g.lineTo(60, 0); g.lineTo(38, 250); g.lineTo(0, 290); g.lineTo(-38, 250); g.closePath(); g.fill();
      g.globalAlpha = 0.55; g.strokeStyle = T.trim; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 10); g.lineTo(0, 260); g.stroke(); g.globalAlpha = 1;
      for (const s of [-1, 1]) { g.fillStyle = T.trim; g.beginPath(); g.moveTo(s * 60, 0); g.lineTo(s * 130, 10); g.quadraticCurveTo(s * 95, 150, s * 20, 280); g.lineTo(s * 38, 250); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 5; g.stroke(); }
      g.fillStyle = T.trim; g.strokeStyle = '#3a2606'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 285, 20, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }); }
  else if (k === 'suit') { const S = U.suit, C = S.cols;
    g.fillStyle = vgrad(C[0], C[1], C[2]); g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,0.045)'; g.lineWidth = 4; for (let i = -20; i <= 40; i++) { g.beginPath(); g.moveTo(i * 40, 0); g.lineTo(i * 40 + 220, H); g.stroke(); }
    front(() => { g.fillStyle = S.shirt; g.beginPath(); g.moveTo(-56, 0); g.lineTo(56, 0); g.lineTo(42, 190); g.lineTo(-42, 190); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.10)'; g.beginPath(); g.moveTo(-56, 0); g.lineTo(0, 110); g.lineTo(56, 0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.30)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-56, 0); g.lineTo(0, 110); g.lineTo(56, 0); g.stroke();
      g.fillStyle = S.vest; g.beginPath(); g.moveTo(-68, 120); g.lineTo(68, 120); g.lineTo(54, 400); g.lineTo(0, 440); g.lineTo(-54, 400); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 4; g.stroke();
      g.fillStyle = S.trim; for (let b = 0; b < 3; b++) { g.beginPath(); g.arc(0, 240 + b * 52, 9, 0, Math.PI * 2); g.fill(); }
      for (const s of [-1, 1]) { const lg = g.createLinearGradient(0, 0, 0, 300); lg.addColorStop(0, C[0]); lg.addColorStop(1, C[1]); g.fillStyle = lg;
        g.beginPath(); g.moveTo(s * 54, 0); g.lineTo(s * 145, 8); g.lineTo(s * 115, 85); g.lineTo(s * 152, 116); g.quadraticCurveTo(s * 115, 200, s * 46, 300); g.lineTo(s * 30, 250); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 5; g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 4; g.beginPath(); g.moveTo(s * 50, 12); g.lineTo(s * 38, 240); g.stroke(); }
      g.fillStyle = S.square; g.beginPath(); g.moveTo(100, 210); g.lineTo(165, 210); g.lineTo(158, 180); g.lineTo(132, 196); g.lineTo(108, 176); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 3; g.stroke(); }); }
  else if (k === 'constable') { const K = U.constable;
    g.fillStyle = vgrad(K.hi, K.mid, K.lo); g.fillRect(0, 0, W, H);
    front(() => { g.fillStyle = K.strap; g.beginPath(); g.moveTo(-130, 20); g.lineTo(-62, 14); g.lineTo(160, 450); g.lineTo(90, 470); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 5; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-108, 18); g.lineTo(118, 458); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 5; g.beginPath(); g.moveTo(-60, 60); g.lineTo(-60, 400); g.stroke(); });
    g.fillStyle = '#2e1e0f'; g.fillRect(0, H * 0.82, W, H * 0.07); g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 4; g.strokeRect(-4, H * 0.82, W + 8, H * 0.07); }
  const tx = new THREE_.CanvasTexture(c); tx.colorSpace = THREE_.SRGBColorSpace; tx.anisotropy = 4; return tx; }
let THREE_ = null;
// dress a fox (made with uniformOutfit) in its uniform. Safe to call again.
export function dressUniform({ THREE, M, toon }, fox, U, w) { THREE_ = THREE; const u = fox.userData, P = u.P; if (!P || !P.body) return;
  (u.uniAdd || []).forEach(o => o.parent && o.parent.remove(o)); u.uniAdd = [];
  const add = (p, o) => { p.add(o); u.uniAdd.push(o); return o; }, lift = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, k = w.kit;
  const root = add(P.body, new THREE.Group()); root.position.y = lift;
  // the garment shell: a lathe a hair outside the tee, front at u = 0.5
  const prof = [[0.255, 0.43], [0.3, 0.5], [0.282, 0.64], [0.29, 0.92], [0.33, 1.06], [0.315, 1.14], [0.255, 1.205], [0.16, 1.25]].map(([r, y]) => new THREE.Vector2(r * 1.04, y));
  const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 48, -Math.PI, Math.PI * 2), new THREE.MeshToonMaterial({ map: paint(U, w), gradientMap: toon('#ffffff').gradientMap }));
  shell.scale.z = 1.12; root.add(shell);
  // where a point on the shell sits: a = angle round (0 = front), y = height
  const rAt = y => { for (let i = 1; i < prof.length; i++) if (y <= prof[i].y) { const a = prof[i - 1], b = prof[i], f = (y - a.y) / (b.y - a.y); return a.x + (b.x - a.x) * f; } return prof[prof.length - 1].x; };
  const onShell = (a, y, out = 0.012) => new THREE.Vector3(Math.sin(a) * (rAt(y) + out), y, Math.cos(a) * (rAt(y) + out) * 1.12);
  // s608 Ben: the shoulders BLEND: a low, flat cap in the yoke's own mid tone that melts into the shell (thin outline, no seam ring, a soft lit top)
  const shoulderCaps = (hi, mid) => { for (const arm of P.arms || []) { const g = add(arm, new THREE.Group()); g.position.y = -0.005;
    const cp = M(new THREE.SphereGeometry(0.118, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), toon(mid), 0, 0, 0, g, 0.006, 0.118); cp.scale.set(1.12, 0.52, 1.1);
    const lt = M(new THREE.SphereGeometry(0.08, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.35), toon('#' + new THREE.Color(mid).lerp(new THREE.Color(hi), 0.55).getHexString()), 0, 0.012, 0, g, 0, 0.08); lt.scale.set(1.12, 0.5, 1.1); } };
  const badge8 = (pos, metal, dark) => { const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = Math.atan2(pos.x, pos.z / 1.12) * 0.9; root.add(g);
    const ov = M(new THREE.SphereGeometry(0.05, 16, 12), toon(metal, { emissive: new THREE.Color(metal), emissiveIntensity: 0.15 }), 0, 0, 0, g, 0.006); ov.scale.set(0.75, 1, 0.3);
    for (const [y, r] of [[0.016, 0.013], [-0.014, 0.017]]) M(new THREE.TorusGeometry(r, 0.0045, 5, 16), toon(dark), 0, y, 0.016, g, 0); };
  if (k === 'duty') { const D = U.div[w.div] || U.div.ops;
    shoulderCaps(D.hi, D.lo);
    const col = M(new THREE.CylinderGeometry(0.15, 0.17, 0.06, 22, 1, true), toon(U.duty.collar, { side: THREE.DoubleSide }), 0, 1.255, 0, root, 0.006);
    // pips on the wearer's right collar (-x), the gold 8 on the yoke seam over the wearer's left breast (+x)
    const n = Math.abs(w.pips || 0), hollow = (w.pips || 0) < 0;
    for (let i = 0; i < n; i++) { const p = onShell(-0.34 - i * 0.13, 1.17, 0.008), hol = hollow && i === n - 1;
      const pm = hol ? new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 5, 14), toon('#0b0d11')) : new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), toon('#e9eef5', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15 }));
      pm.position.copy(p); pm.rotation.y = Math.atan2(p.x, p.z); root.add(pm); }
    badge8(onShell(0.5, 0.995, 0.018), U.duty.badge, '#2a1e05'); }
  else if (k === 'trade') { const T = { ...U.trade, ...(w.cols ? { cols: w.cols } : {}), ...(w.trim ? { trim: w.trim } : {}) };
    for (const arm of P.arms || []) { const g = add(arm, new THREE.Group()); g.position.y = 0.04;   // the loud padded shoulders, deep rather than tall
      const pd = M(new THREE.SphereGeometry(0.17, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), toon(T.cols[0]), 0, 0, 0, g, 0.016, 0.17); pd.scale.set(1.25, 0.6, 1.2);
      const rm = M(new THREE.TorusGeometry(0.2, 0.02, 6, 22), toon(T.trim), 0, 0.005, 0, g, 0); rm.rotation.x = Math.PI / 2; rm.scale.set(1.05, 1, 1); } }
  else if (k === 'suit') { const S = U.suit; shoulderCaps(S.cols[1], S.cols[2]); }
  else if (k === 'constable') { const K = U.constable; shoulderCaps(K.hi, K.lo);
    M(new THREE.CylinderGeometry(0.16, 0.175, 0.12, 22, 1, true), toon(K.collar, { side: THREE.DoubleSide }), 0, 1.25, 0, root, 0.008);
    badge8(onShell(0.5, 0.995, 0.018), K.badge, '#2a2e33'); }
  // s608 Ben: trousers closer to the black of the uniform (and the boots one step lighter so the feet still read)
  { const base = k === 'duty' ? U.duty.bodyLo : k === 'constable' ? U.constable.lo : (w.cols || U[k].cols)[2], c = new THREE.Color(base).multiplyScalar(k === 'duty' ? 0.55 : 0.7), legM = toon('#' + c.getHexString()), bootM = toon('#' + new THREE.Color(base).lerp(new THREE.Color('#2a2e36'), 0.35).getHexString());
    (P.legs || []).forEach(p => p.traverse(o => { if (!o.isMesh || o.material.side === THREE.BackSide) return; const isBoot = o.geometry.type === 'SphereGeometry' && Math.abs((o.geometry.parameters || {}).radius - 0.14) < 0.001; o.material = isBoot ? bootM : legM; })); }
  // the armour crest decal is not on a tee, but hide any 8-crest decal the base fox carries so the badge is the only 8
  P.body.traverse(o => { if (o.isMesh && o.material && o.material.emissiveMap && o.material.map === o.material.emissiveMap) o.visible = false; });
}

// ---------- s608 THE DUTY UNIFORM AS ONE SUIT (Ben) ----------
// One equipable suit (DUTY only), worn anywhere in space (ship + every station). 2 gem slots: WORLD (the DEEP SPACE GEM) + ANY.
// The suit itself: +6 % to PILOT, TALK, SUPER CHARGE, XP and ARMOUR. Each rank pip adds +2 % ARMOUR (a hollow ensign pip counts as one).
// Free: you get it as STEWARD; the pips are earned by quests (stat dsfPips). The player picks the division.
export const SUIT_KEY = 'dsfSuit';
export const SUIT = { id: 'dsfDuty', name: 'SPACE STATION 8 DUTY UNIFORM', kit: 'duty', where: 'space', slots: ['world', 'any'], world: 'dsf',
  bonus: [['pilot', 6], ['talk', 6], ['super', 6], ['xp', 6], ['armor', 6]], pipStat: 'armor', pipVal: 2, armor: 14, kg: 3 };
export const pipCount = p => Math.abs(p || 0);
// what the suit gives on its own (before its 2 gems)
export function suitBonus(pips) { const out = SUIT.bonus.map(([s, v]) => [s, v]); const n = pipCount(pips); if (n) out.push([SUIT.pipStat, n * SUIT.pipVal]); return out; }
