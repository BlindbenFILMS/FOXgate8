// MERU 2.0 — s182 RUINS CAVE INSIDE [meruRuinsInterior] (Ben s181: port the Meru 1 cave behind the mouth, quick fade in).
// Layout = the 2D caveLayout() fractions shared with Meru 1 (worlds/meru-caves.js: CH chambers, RIV rivers, BRIDGE, SERP stones,
// RUBBLE cave-in, sealed DOOR, CAGE, CHESTS, FIRE). Built in Meru 1 cave coords inside a group under the desert (world x -487..-453,
// z -40..40, y -90). Lines + story beats verbatim from meru-caves.js (CALL_OUT, PARLEY, RESCUE, FREED, READY, RING_HANDOVER, DIALOGUE).
// Story: Snag calls you out → march to Rook → parley (fight · ransom · join) → the fight (shared light combat, engine/combat.js) →
// Max's cage: 3-pin LOCKPICK card → maxFreed → "Stay close" = maxFollowing: Max follows you out and across Meru 2 to the castle.
// Also: blast the cave-in (2 RANGE), the door lifts as you come near, bats + rats, 2 chests (gold + Shard Pin / Gate Coin),
// knocked down = wake by the river, the mouth guards talk, LIFT THE BLACK STONE RING at the Sage's desk (ringJob).
// Contract (meru2-walk.js, chained into news): busy, tick(dt, P, fox), prompt, talk, camFix, toast, quit; + groundAt, where, inside,
// clamp (walk via HZ.clamp), attack / on / hp / max / heal / foes (life wrap). Hook window.__cave.
import * as CV from './meru-caves.js';
import { createCombat } from '../engine/combat.js';
import { PLAYER_FEMALE } from '../fox-kit.js?v=s673';
import { BOSS_FOX, bossExtras } from '../engine/bosses.js?v=sd3';

const OX = -770, OZ = -230, CY = -90, MOUTH = [-430.4, 0], OUT = [-428.4, 0];
const SAGE_RING = [-377.4, -61.0];
const GUARD_LINES = [[{ who: 'npc', text: 'Keep walking, stranger. The boss does not take visitors.' }], [{ who: 'npc', text: 'Cave is ours. You want in, you talk to ROOK.' }]];

export function buildCave({ THREE, scene, kit, M, toon, grad, save, sayTo, touch = false, audio = () => null, terrainAt = () => 0, groundY = () => 0, meleeK = () => 1, go }) {
  const C = CV.CAVE, at = CV.at, flag = k => { try { return !!save.flag(k); } catch (e) { return false; } };
  const G = new THREE.Group(); G.name = 'meruRuinsCave'; G.position.set(OX, CY, OZ); G.visible = false; scene.add(G);
  const loc = P => ({ x: P.x - OX, z: P.z - OZ }), W = (x, z) => [x + OX, z + OZ];
  const inRect = (x, z, y) => y > CY - 6 && y < CY + 10 && Math.abs(x - OX - C.x) < C.w / 2 + 2 && Math.abs(z - OZ - C.z) < C.d / 2 + 2;
  const LL = (a, b) => { const p = at(a, b); return [p.x, p.z]; };
  const mat = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...o });
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const add = (geo, m, x, y, z, par = G) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); par.add(o); return o; };
  const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.4, 'rgba(255,255,255,0.35)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glow = (c, x, y, z, s, op = 0.5, par = G) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp.position.set(x, y, z); sp.scale.setScalar(s); par.add(sp); return sp; };
  const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(11);
  // ---------- toast + fade ----------
  let toastS = '', toastT = 0; const toast = (s, t = 3) => { toastS = s; toastT = t; };
  let veil = null, fading = false;
  const fade = fn => { if (fading) return; fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '45' }); document.body.appendChild(veil); }
    requestAnimationFrame(() => { veil.style.opacity = '1'; }); setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 140); } }, 300); };
  const aud = { burst(d, f, v) { const c = audio(); if (!c) return; const b = c.createBuffer(1, Math.max(1, c.sampleRate * d | 0), c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length); const n = c.createBufferSource(); n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; const g = c.createGain(); g.gain.value = v; n.connect(bp); bp.connect(g); g.connect(c.destination); n.start(); },
    tone(f, d, v, type = 'sine') { const c = audio(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d + 0.02); } };

  // ================= THE CAVE (art) =================
  const stoneT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#8a7a66'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 260; i++) { const v = 100 + Math.random() * 80 | 0; g.fillStyle = 'rgba(' + v + ',' + (v - 14) + ',' + (v - 30) + ',0.35)'; const s = 3 + Math.random() * 12; g.fillRect(Math.random() * 128, Math.random() * 128, s, s * (0.5 + Math.random())); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  { const sh = add(BOX(C.w + 8, 9, C.d + 8), new THREE.MeshBasicMaterial({ color: '#120d0a', side: THREE.BackSide }), C.x, 4.2, C.z); sh.castShadow = sh.receiveShadow = false;
    const base = add(new THREE.PlaneGeometry(C.w + 6, C.d + 6), mat('#211a14'), C.x, -0.3, C.z); base.rotation.x = -Math.PI / 2; }
  for (const [x0, x1, y0, y1] of CV.CH) { const [a, b] = LL(x0, y0), [c, d] = LL(x1, y1); const t = stoneT.clone(); t.needsUpdate = true; t.repeat.set((c - a) / 4, (d - b) / 4);
    const m = add(new THREE.PlaneGeometry(c - a, d - b), mat('#6e604e', { map: t }), (a + c) / 2, 0.01, (b + d) / 2); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; }
  // rock walls: instanced boulders on every cell next to a floor (3 layers up to the roof)
  { const cs = 1.0, nx = Math.ceil(C.w / cs) + 2, nz = Math.ceil(C.d / cs) + 2, cells = [];
    for (let i = -1; i < nx; i++) for (let j = -1; j < nz; j++) { const x = C.x - C.w / 2 + i * cs + cs / 2, z = C.z - C.d / 2 + j * cs + cs / 2; if (C.camOK(x, z)) continue; let near = false; for (let a = -1; a <= 1 && !near; a++) for (let b = -1; b <= 1 && !near; b++) if (C.camOK(x + a * cs, z + b * cs)) near = true; if (near) cells.push([x, z]); }
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.85, 0), mat('#4a3c30'), cells.length * 3), dm = new THREE.Object3D(), col = new THREE.Color(); let k = 0;
    for (const [x, z] of cells) for (let l = 0; l < 3; l++) { const s = 0.62 + R() * 0.3; dm.position.set(x + (R() - 0.5) * 0.3, l * 2.5 + 1.1, z + (R() - 0.5) * 0.3); dm.rotation.set(R() * 0.6, R() * 3, R() * 0.6); dm.scale.set(s, s * (2.1 + R()), s); dm.updateMatrix(); rocks.setMatrixAt(k, dm.matrix); rocks.setColorAt(k++, col.set(R() < 0.5 ? '#5e4c3c' : '#4c3d31')); }
    rocks.receiveShadow = true; G.add(rocks); }
  // rivers, bridge, serpent stones
  const waterM = mat('#1f4a6e', { emissive: new THREE.Color('#0e2a44'), emissiveIntensity: 0.6 });
  for (const [x0, x1, y0, y1] of CV.RIV) { const [a, b] = LL(x0, y0), [c, d] = LL(x1, y1); const m = add(new THREE.PlaneGeometry(c - a, d - b), waterM, (a + c) / 2, -0.15, (b + d) / 2); m.rotation.x = -Math.PI / 2; }
  const WOOD = mat('#6b4a35'), WOODD = mat('#3a2618'), GOLD = mat('#e0a84a'), DARK = mat('#1b1830');
  { const R0 = CV.RIV[0], BR = CV.BRIDGE; const [a, b] = LL(BR.xc, R0[2] - 0.008), [, d] = LL(0, R0[3] + 0.008), w = BR.w * C.w;
    for (let z = b; z < d; z += 0.42) add(BOX(w, 0.1, 0.36), WOOD, a, 0.05, z + 0.2);
    for (const s of [-1, 1]) { add(BOX(0.1, 0.1, d - b), WOODD, a + s * w / 2, 0.55, (b + d) / 2); for (let z = b; z <= d; z += 1.4) add(BOX(0.1, 0.6, 0.1), WOODD, a + s * w / 2, 0.3, z); } }
  { const R1 = CV.RIV[1]; for (let v = R1[2]; v <= R1[3]; v += 0.009) { const [x, z] = LL(CV.serpX(v), v), s = 0.75 + R() * 0.3; const st = add(new THREE.CylinderGeometry(s, s * 1.1, 0.3, 9), mat(R() < 0.5 ? '#8a7d66' : '#9a8d74'), x + (R() - 0.5) * 0.3, 0.02, z); st.rotation.y = R() * 3; } }
  // the cave-in
  const RUB = at(0.5, 0.099), rub = new THREE.Group(); G.add(rub);
  { const RB = CV.RUBBLE, [a, b] = LL(RB[0], RB[2]), [c, d] = LL(RB[1], RB[3]); for (let i = 0; i < 9; i++) { const s = 0.4 + R() * 0.45; add(new THREE.DodecahedronGeometry(s, 0), mat('#6b5a46'), a + 0.3 + R() * (c - a - 0.6), s * 0.7 + (i > 5 ? 0.6 : 0), b + R() * (d - b), rub); }
    for (let i = 0; i < 3; i++) add(BOX(1.4, 0.18, 0.2), WOOD, a + 0.7 + i * 0.9, 0.4 + i * 0.2, (b + d) / 2, rub).rotation.z = 0.5 - i * 0.4; }
  // the sealed door + its golden crest (lifts as you come near)
  const door = new THREE.Group(); G.add(door);
  { const [x, z] = LL(0.5, 0.660), w = 0.11 * C.w; for (const s of [-1, 1]) add(BOX(0.5, 4.4, 0.6), mat('#3a3448'), x + s * (w / 2 + 0.25), 2.2, z); add(BOX(w + 1.0, 0.5, 0.7), mat('#3a3448'), x, 4.5, z);
    add(BOX(w, 4.0, 0.3), mat('#2a2533'), 0, 2.0, 0, door); door.position.set(x, 0, z);
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#1f2650'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#e0a84a'; g.font = '900 92px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; for (const sz of [-0.16, 0.16]) { const e = add(new THREE.CircleGeometry(0.85, 32), new THREE.MeshBasicMaterial({ map: t }), 0, 2.2, sz, door); if (sz < 0) e.rotation.y = Math.PI; add(new THREE.TorusGeometry(0.9, 0.07, 6, 32), GOLD, 0, 2.2, sz * 1.06, door); } }
  // the Hollow: abandoned crate, spear, mat + CRYSTALS (violet / teal, slow pulse)
  { const [x, z] = LL(0.80, 0.452); add(BOX(1.0, 0.9, 1.0), WOOD, x - 0.6, 0.45, z); const sp = add(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), WOOD, x + 0.4, 1.1, z); sp.rotation.z = -0.5; add(new THREE.CylinderGeometry(0.9, 0.9, 0.03, 16), mat('#6b4a7a'), x + 0.3, 0.02, z + 0.4); }
  const CRY = [['#b98bff', 0.17, 0.43], ['#6fe0d0', 0.84, 0.58], ['#b98bff', 0.2, 0.62], ['#6fe0d0', 0.13, 0.30], ['#d7c2ff', 0.42, 0.648], ['#6fe0d0', 0.58, 0.648]].map(([c, a, b], i) => { const [x, z] = LL(a, b), base = new THREE.Color(c), m = new THREE.MeshBasicMaterial({ color: base.clone() });
    for (let k = 0; k < 4; k++) { const h = 0.35 + R() * 0.7, s = add(new THREE.OctahedronGeometry(0.17, 0), m, x + (R() - 0.5) * 0.6, h * 0.5, z + (R() - 0.5) * 0.6); s.scale.set(1, h * 3, 1); s.rotation.set((R() - 0.5) * 0.8, R() * 3, (R() - 0.5) * 0.8); }
    return { m, base, g: glow(c, x, 0.8, z, 2.6, 0.3), ph: i * 1.3 }; });
  // torches on the chamber walls
  const flameM = new THREE.MeshBasicMaterial({ color: '#ffb347' }), coreM = new THREE.MeshBasicMaterial({ color: '#fff1b8' }), FL = [];
  for (const [a, b] of [[0.448, 0.049], [0.552, 0.049], [0.14, 0.137], [0.86, 0.137], [0.14, 0.287], [0.86, 0.287], [0.18, 0.467], [0.82, 0.467], [0.18, 0.607], [0.82, 0.607], [0.12, 0.757], [0.88, 0.757], [0.12, 0.937], [0.88, 0.937]]) {
    const [x, z] = LL(a, b); add(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 6), DARK, x, 0.8, z); const f = add(new THREE.ConeGeometry(0.16, 0.42, 7), flameM, x, 1.82, z), co = add(new THREE.ConeGeometry(0.07, 0.22, 6), coreM, x, 1.76, z);
    FL.push({ f, co, h: glow('#ff9a40', x, 1.85, z, 2.6, 0.55), pool: glow('#ff8a30', x, 0.1, z, 4.2, 0.18), ph: R() * 9 }); }
  // the bandit camp: fire, table, bedrolls, cage, chests
  { const [x, z] = LL(0.664, 0.928); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.DodecahedronGeometry(0.2, 0), mat('#5a5040'), x + Math.cos(a) * 0.65, 0.12, z + Math.sin(a) * 0.65); }
    const f1 = add(new THREE.ConeGeometry(0.42, 1.0, 8), new THREE.MeshBasicMaterial({ color: '#ff8a2a' }), x, 0.5, z), f2 = add(new THREE.ConeGeometry(0.22, 0.6, 8), coreM, x, 0.4, z); FL.push({ f: f1, co: f2, h: glow('#ff8a3a', x, 0.9, z, 5, 0.6), pool: glow('#ff7a2a', x, 0.1, z, 7, 0.22), ph: 1 }); }
  { const [x, z] = LL(0.33, 0.918); add(BOX(2.2, 0.12, 0.9), WOOD, x, 0.75, z); for (const s of [-1, 1]) add(BOX(0.12, 0.75, 0.8), WOODD, x + s * 0.95, 0.37, z); add(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 10), mat('#cbd5e1'), x - 0.6, 0.91, z); add(new THREE.SphereGeometry(0.11, 8, 6), mat('#7dd3fc'), x, 0.92, z); add(BOX(0.16, 0.26, 0.16), mat('#4ade80'), x + 0.6, 0.94, z); }
  for (const [a, b, r] of [[0.24, 0.93, 0.3], [0.76, 0.95, -0.2], [0.80, 0.90, 0.5]]) { const [x, z] = LL(a, b); add(BOX(0.9, 0.12, 2.0), mat('#7a5a3a'), x, 0.06, z).rotation.y = r; }
  let cageBars; { const CG = CV.CAGE, [x, z] = LL(CG.x, CG.y), g = new THREE.Group(); g.position.set(x, 0, z); G.add(g); add(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 20), mat('#3a3448'), 0, 0.07, 0, g); add(new THREE.CylinderGeometry(1.45, 1.45, 0.18, 20), mat('#3a3448'), 0, 2.6, 0, g);
    cageBars = new THREE.Group(); g.add(cageBars); const barM = mat('#9aa0b0'); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; add(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 5), barM, Math.cos(a) * 1.35, 1.3, Math.sin(a) * 1.35, cageBars); } }
  const chestLids = CV.CHESTS.map(c => { const g = new THREE.Group(); g.position.set(c.x, 0, c.z); G.add(g); add(BOX(1.0, 0.55, 0.65), WOOD, 0, 0.28, 0, g); const lid = new THREE.Group(); lid.position.set(0, 0.55, -0.32); g.add(lid); add(BOX(1.04, 0.2, 0.68), mat('#7a5236'), 0, 0.1, 0.32, lid); add(BOX(0.16, 0.18, 0.06), GOLD, 0, 0.05, 0.67, lid); return lid; });
  for (let i = 0; i < 2; i++) if (flag('caveChest' + i)) chestLids[i].rotation.x = -1.9;

  // ================= PEOPLE + FIGHT =================
  const CB = createCombat({ THREE, scene: G, audio: aud, move: (o, nx, nz) => { if (C.walk(nx, nz)) { o.x = nx; o.z = nz; } else if (C.walk(nx, o.z)) o.x = nx; else if (C.walk(o.x, nz)) o.z = nz; } });
  const mk = p => { const bf = p.key === 'rook' ? BOSS_FOX.rook : null; let f;
    if (bf) { f = kit.makeFox({ ...bf, ...p, outfit: bf.outfit, torso: bf.torso, crest: bf.crest, eyes: bf.eyes, look: bf.look }); try { bossExtras('rook', f, { THREE, M, toon }); f.scale.multiplyScalar(bf.scale || 1); } catch (e) { console.warn('rook look', e); } }
    else f = kit.makeFox(p.female ? { ...p, look: PLAYER_FEMALE } : { ...p });
    G.add(f); f.position.set(p.x, 0.06, p.z); f.rotation.y = p.face; return { ...p, c: f, speedNow: 0 }; };
  const bandits = CV.BANDITS.map(mk), bn = k => bandits.find(b => b.key === k);
  bandits.forEach(n => { const f = CB.add(n, n.fight); f.anim = (dt, spd) => kit.animFox(n.c, dt, spd, false); });
  const downAll = () => bandits.forEach(n => { const f = n.ctl; f.down = true; f.hp = 0; f.state = 'down'; n.c.rotation.x = -Math.PI / 2; });
  if (flag('banditsDown')) downAll();
  const banditsDown = () => bandits.every(b => b.ctl.down), banditsActive = () => bandits.some(b => b.ctl.hostile && !b.ctl.down);
  const critters = CV.CRITTERS.filter((p, i) => !touch || i % 4 !== 3).map(p => { const m = CV.makeCritter({ THREE, scene: G, M, toon }, p); const n = { key: p.key, x: p.x, z: p.z, face: 0, c: m.c, speedNow: 0 }; const f = CB.add(n, m.opts); let t = R() * 9; f.anim = (dt, spd) => { t += dt; m.anim(t, spd); }; return { n, f, dT: 0 }; });
  const maxN = mk(CV.MAX_CAGED), maxF = maxN.c;
  const placeMax = () => { if (flag('maxHome')) { maxF.visible = false; return; } maxF.visible = true; if (flag('maxFollowing')) return;
    G.add(maxF); const p = flag('maxFreed') ? CV.MAX_FREE : CV.MAX_CAGED; maxN.x = p.x; maxN.z = p.z; maxF.position.set(p.x, 0.06, p.z); maxF.userData.mood = flag('maxFreed') ? 'happy' : 'sad'; };
  placeMax(); if (flag('maxFreed') || flag('maxHome')) cageBars.visible = false;
  const campOf = () => flag('banditsDown') ? 'down' : flag('banditsJoined') ? 'gang' : (flag('ringJob') || flag('ransomNamed')) ? 'joined' : 'idle';
  let camp = campOf();
  const chestsOpen = () => (flag('caveChest0') ? 1 : 0) + (flag('caveChest1') ? 1 : 0);
  // talk anchors (sayTo needs an object to face + measure)
  const TK = {}, tk = n => TK[n.key] || (TK[n.key] = { key: 'cave_' + n.key, obj: n.c, name: n.name, role: n.role, ry: n.c.rotation.y, r: 3.4 });
  const say = (n, lines, then, must = true) => { const t = tk(n); t.ry = n.c.rotation.y; sayTo(t, lines, then, must); };
  // a story.js branch tree → Meru 2 lines (the last root line carries the choices; a pick plays its replies, then its action)
  const tree = (n, T, act) => { const R0 = T.nodes[T.start], lines = R0.lines.map(l => ({ ...l }));
    if (R0.choices && R0.choices.length) { const last = lines[lines.length - 1]; last.choices = R0.choices.map(c => ({ text: c.text, pick: () => { if (c.set) save.setFlag(c.set); const rep = (T.nodes[c.go] && T.nodes[c.go].lines) || []; const done = () => act && act(c.do); if (rep.length) say(n, rep.map(l => ({ ...l })), done); else done(); } })); }
    say(n, lines, null, false); };
  const goL = (x, z, yaw) => { const [wx, wz] = W(x, z); go(wx, CY, wz, yaw); };
  function doAct(a) {
    if (a === 'fight') { camp = 'fight'; CB.engage(bandits.map(b => b.key)); toast('FIGHT! 1 MELEE \u00b7 2 RANGE', 2.5); }
    if (a === 'release') { camp = flag('ringJob') ? 'joined' : 'ransom'; const s = bn('snag'); s.x = s.ctl.home[0]; s.z = s.ctl.home[1]; s.face = s.ctl.home[2]; goL(PL.x, CV.RELEASE_Z, Math.PI); }
    if (a === 'lock') startLock(); }
  function callOut(g) { camp = 'called'; aud.tone(300, 0.2, 0.05, 'square'); say(g, CV.CALL_OUT, () => { goL(CV.MARCH.player.x, CV.MARCH.player.z, 0);
    setTimeout(() => { for (const k of ['rook', 'vix', 'snag']) { const b = bn(k), p = CV.MARCH[k]; b.x = p.x; b.z = p.z; b.face = Math.atan2(CV.MARCH.player.x - p.x, CV.MARCH.player.z - p.z); } }, 320);
    setTimeout(() => { camp = 'parley'; tree(bn('rook'), CV.PARLEY(), doAct); }, 620); }); }
  function freeMax() { save.setFlag('maxFreed'); cageBars.visible = false; maxN.x = CV.MAX_FREE.x; maxN.z = CV.MAX_FREE.z; maxF.userData.mood = 'happy'; toast('The lock pops open!', 2.5); aud.tone(880, 0.3, 0.05, 'triangle');
    setTimeout(() => tree(maxN, CV.FREED(chestsOpen()), null), 600); }
  function ringHandover() { save.setFlag('banditsJoined'); save.setFlag('hasSageRing', false); camp = 'gang'; freeMax(); setTimeout(() => toast('WELCOMED INTO THE GANG', 3), 2400); }
  function openChest(i) { save.setFlag('caveChest' + i); const h = CV.HAUL[i]; save.addGold(h.gold); try { save.addRelic(h.relic); } catch (e) {} chestLids[i].rotation.x = -1.9; try { save.addXp(25); } catch (e) {} toast('+' + h.gold + ' GOLD \u00b7 ' + h.name, 3); aud.tone(660, 0.3, 0.05, 'triangle'); }
  const resetHome = () => bandits.forEach(n => { if (!n.ctl.down) { n.x = n.ctl.home[0]; n.z = n.ctl.home[1]; n.face = n.ctl.home[2]; } });
  function knockedDown() { toast('Knocked down. You come round by the river.', 3.5); CB.reset(flag('banditsDown') ? f => f.critter : null); if (!flag('banditsDown')) camp = campOf(); const p = at(0.5, 0.26); goL(p.x, p.z, 0); }
  // talk lines per person (null = nothing to say right now)
  function talkFor(n) {
    if (n === maxN) { if (flag('maxHome') || flag('maxFollowing')) return null; if (flag('maxFreed')) return () => tree(maxN, CV.READY(chestsOpen()), null); if (!banditsDown() && !flag('banditsJoined')) return () => say(maxN, CV.MAX_BUSY, null, false); return () => tree(maxN, CV.RESCUE(String((save.data && save.data.name) || 'BEN').toUpperCase()), doAct); }
    if (n.ctl.down || n.ctl.hostile || ['idle', 'called', 'parley', 'fight'].includes(camp)) return null;
    if (n.key === 'rook' && !flag('maxFreed')) { if (flag('ringJob') && flag('hasSageRing')) return () => say(n, CV.RING_HANDOVER, ringHandover); if (flag('ringJob')) return () => say(n, CV.ROOK_RING, null, false); if (flag('ransomNamed')) return () => say(n, CV.ROOK_RANSOM, null, false); }
    if (CV.DIALOGUE[n.key]) return () => say(n, CV.DIALOGUE[n.key], null, false); return null; }

  // ================= THE LOCKPICK CARD =================
  let lock = null, card = null;
  function mkCard() { card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 128px);max-width:380px;margin:0 auto;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:38;display:none;pointer-events:auto;box-sizing:border-box';
    card.innerHTML = '<div style="background:#201e1d;color:#f3f2f2;padding:8px 12px;font:900 13px Archivo,sans-serif;letter-spacing:.12em;display:flex;justify-content:space-between;gap:8px"><span>MAX\u2019S CAGE \u00b7 PICK THE LOCK</span><span data-n></span></div>'
      + '<div style="margin:14px 12px 10px;height:34px;background:#cfcac3;border:2px solid #201e1d;position:relative"><div data-z style="position:absolute;top:0;bottom:0;background:#3fdc7a"></div><div data-p style="position:absolute;top:-8px;bottom:-8px;width:6px;margin-left:-3px;background:#ec3013"></div></div>'
      + '<div data-m style="padding:0 12px 12px;font:700 14px Archivo,sans-serif;line-height:1.3;text-wrap:pretty"></div>'
      + '<button data-b style="display:block;width:100%;min-height:56px;background:#ec3013;color:#fff;border:0;border-top:2px solid #201e1d;font:900 16px Archivo,sans-serif;letter-spacing:.1em;text-align:left;padding:0 14px;cursor:pointer">PRESS \u00b7 SET THE PIN</button>';
    document.body.appendChild(card); card.querySelector('[data-b]').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); lockPress(); }); card.addEventListener('pointerdown', e => e.stopPropagation()); }
  function startLock() { lock = { pins: 3, set: 0, pos: 0.06, dir: 1, speed: 0.43, zone: 0.42, msg: 'PRESS when the pick is in the GREEN.' }; if (!card) mkCard(); card.style.display = 'block'; drawLock(); }
  function drawLock() { if (!card || !lock) return; const z = card.querySelector('[data-z]'); z.style.left = ((0.5 - lock.zone / 2) * 100) + '%'; z.style.width = (lock.zone * 100) + '%'; card.querySelector('[data-p]').style.left = (lock.pos * 100) + '%'; card.querySelector('[data-n]').textContent = 'PIN ' + Math.min(lock.set + 1, lock.pins) + ' OF ' + lock.pins; card.querySelector('[data-m]').textContent = lock.msg; }
  function lockPress() { if (!lock) return; const lk = lock; if (Math.abs(lk.pos - 0.5) < lk.zone / 2) { lk.set++; lk.msg = 'Pin ' + lk.set + ' of ' + lk.pins + ' set.'; aud.tone(700 + lk.set * 120, 0.12, 0.05, 'triangle'); if (lk.set >= lk.pins) { lock = null; card.style.display = 'none'; freeMax(); return; } }
    else { lk.msg = 'PRESS when the pick is in the GREEN.'; aud.tone(160, 0.12, 0.05, 'square'); } drawLock(); }

  // ================= ENTER / LEAVE =================
  let on = false, PL = { x: 0, z: 0 }, foxRef = null, lastP = null;
  function enter() { fade(() => { CB.reset(f => f.critter); critters.forEach(q => { q.n.c.visible = true; q.dT = 0; }); if (!flag('banditsDown')) { CB.reset(f => !f.critter); camp = campOf(); } else downAll();
    CV.state.doorOpen = 0; G.visible = true; const p = at(0.5, 0.075); goL(p.x, p.z, 0); snapMax(); toast('RUINS CAVE', 2); }); }
  function leave() { fade(() => { if (!flag('banditsDown') && camp === 'fight') { CB.reset(f => !f.critter); camp = campOf(); } if (['called', 'parley'].includes(camp)) { camp = campOf(); resetHome(); }
    G.visible = false; go(OUT[0], terrainAt(OUT[0], OUT[1]) + 0.3, OUT[1], Math.PI / 2); snapMax(); }); }

  // ================= MAX FOLLOWS (maxFollowing → maxHome) =================
  const trail = []; let snapPend = false;
  const following = () => flag('maxFollowing') && !flag('maxHome');
  function snapMax() { snapPend = true; trail.length = 0; }
  function followTick(dt, P) { if (flag('maxHome')) { if (maxF.visible) maxF.visible = false; return; } if (!following()) return; if (maxF.parent !== scene) scene.add(maxF);
    const hide = P.car || P.boat || P.ferry || P.ab || P.tank || P.heli || P.skate || P.bike || P.veh || P.carousel || P.swim; maxF.visible = !hide; if (hide) { snapPend = true; return; }
    const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), lp = trail[trail.length - 1]; if (!lp || Math.hypot(P.x - lp[0], P.z - lp[1]) > 0.5) { trail.push([P.x, P.z, P.y]); if (trail.length > 40) trail.shift(); }
    const mp = maxF.position, far = Math.hypot(mp.x - P.x, mp.z - P.z) > 22 || Math.abs(mp.y - P.y) > 3;
    if (snapPend || far) { snapPend = false; mp.set(P.x - fx * 2, P.y, P.z - fz * 2); maxF.rotation.y = P.yaw; kit.animFox(maxF, dt, 0, false); return; }
    const tg = trail.length > 5 ? trail[trail.length - 6] : [P.x - fx * 2, P.z - fz * 2], dx = tg[0] - mp.x, dz = tg[1] - mp.z, d = Math.hypot(dx, dz), dp = Math.hypot(P.x - mp.x, P.z - mp.z);
    let spd = 0; if (d > 0.3 && dp > 1.6) { spd = Math.min(d * 3, 9.5); mp.x += dx / d * spd * dt; mp.z += dz / d * spd * dt; const want = Math.atan2(dx, dz); maxF.rotation.y += Math.atan2(Math.sin(want - maxF.rotation.y), Math.cos(want - maxF.rotation.y)) * Math.min(1, dt * 8); }
    else { const want = Math.atan2(P.x - mp.x, P.z - mp.z); maxF.rotation.y += Math.atan2(Math.sin(want - maxF.rotation.y), Math.cos(want - maxF.rotation.y)) * Math.min(1, dt * 4); }
    mp.y = groundY(mp.x, mp.z, P.y); kit.animFox(maxF, dt, spd, false); }

  // ================= PER FRAME =================
  const inCave = P => !!P && inRect(P.x, P.z, P.y);
  const near = (P, x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
  let tAcc = 0, parleyAway = 0, stealCd = 0;
  function tick(dt, P, fox) { tAcc += dt; toastT = Math.max(0, toastT - dt); stealCd = Math.max(0, stealCd - dt); foxRef = fox; lastP = P;
    if (lock) { lock.pos += lock.dir * lock.speed * dt; if (lock.pos > 1) { lock.pos = 1; lock.dir = -1; } if (lock.pos < 0) { lock.pos = 0; lock.dir = 1; } drawLock(); }
    followTick(dt, P);
    on = inCave(P); if (!fading) G.visible = on; if (!on) return;
    PL = loc(P); const t = tAcc;
    for (const o of FL) { const f = 0.85 + Math.sin(t * 13 + o.ph) * 0.08 + Math.sin(t * 29 + o.ph * 3) * 0.06; o.f.scale.set(1, f, 1); o.co.scale.set(1, f, 1); o.h.material.opacity = 0.5 * f; }
    for (const c of CRY) { const p = 0.5 + 0.5 * Math.sin(t * 0.9 + c.ph); c.m.color.copy(c.base).multiplyScalar(0.7 + 0.45 * p); c.g.material.opacity = 0.18 + 0.22 * p; }
    waterM.emissiveIntensity = 0.55 + Math.sin(t * 1.7) * 0.12;
    { const st = CV.state, nd = Math.hypot(PL.x - CV.DOOR.x, PL.z - CV.DOOR.z) < 5; st.doorOpen = Math.max(0, Math.min(1, st.doorOpen + (nd ? dt : -dt * 0.5) * 1.2)); door.position.y = st.doorOpen * 4.2;
      if (st.rubble <= 0 && rub.visible) { rub.children.forEach(m => { m.position.y -= dt * 3; }); if (rub.children[0].position.y < -2) rub.visible = false; } }
    for (const n of bandits) { const f = n.ctl; if (f.hostile || f.down) continue; const d = Math.hypot(PL.x - n.x, PL.z - n.z), want = d < 8 ? Math.atan2(PL.x - n.x, PL.z - n.z) : f.home[2]; n.face += Math.atan2(Math.sin(want - n.face), Math.cos(want - n.face)) * Math.min(1, dt * 4); }
    const r = CB.update(dt, { x: PL.x, z: PL.z, y: P.y - CY, face: P.yaw }, fox); CB.pose(fox);
    for (const q of critters) if (q.f.down) { q.dT += dt; if (q.dT > 1.4) q.n.c.visible = false; }
    if (r.playerDown && !fading) knockedDown();
    if (banditsActive() && camp !== 'fight') { camp = 'fight'; CB.engage(bandits.map(b => b.key)); toast('FIGHT! 1 MELEE \u00b7 2 RANGE', 2.5); }
    if (camp === 'fight' && banditsDown()) { camp = 'down'; save.setFlag('banditsDown'); toast('The crew is down. Get Max out.', 3.5); aud.tone(520, 0.4, 0.05, 'triangle'); }
    if (camp === 'idle' && !flag('maxFreed') && !fading) { const s = bn('snag'); if (!s.ctl.down && Math.hypot(PL.x - s.x, PL.z - s.z) < 7) callOut(s); }
    if (camp === 'called' || camp === 'parley') { const rk = bn('rook'); parleyAway = Math.hypot(PL.x - rk.x, PL.z - rk.z) > 9 ? parleyAway + dt : 0; if (parleyAway > 1.2) { camp = campOf(); resetHome(); parleyAway = 0; } }
    if (!following() && maxF.visible) { const d = Math.hypot(PL.x - maxN.x, PL.z - maxN.z), want = d < 7 ? Math.atan2(PL.x - maxN.x, PL.z - maxN.z) : Math.PI; maxF.rotation.y += Math.atan2(Math.sin(want - maxF.rotation.y), Math.cos(want - maxF.rotation.y)) * Math.min(1, dt * 4); maxF.position.set(maxN.x, 0.06, maxN.z); kit.animFox(maxF, dt, 0, false); } }

  // ================= PROMPTS + E =================
  function nearTalk() { let best = null, bd = 9; for (const n of [...bandits, maxN]) { if (n === maxN && (following() || !maxF.visible)) continue; const d = Math.hypot(PL.x - n.x, PL.z - n.z), rr = n === maxN ? 3.2 : 2.6; if (d < rr && d < bd) { const fn = talkFor(n); if (fn) { bd = d; best = { n, fn }; } } } return best; }
  function guardNear(P) { const CM = window.__ruinsJobs && window.__ruinsJobs.LF && window.__ruinsJobs.LF.CM; if (!CM || !CM.GUARD || flag('maxFreed')) return null; for (let i = 0; i < CM.GUARD.length; i++) { const g = CM.GUARD[i]; if (Math.hypot(P.x - g.x, P.z - g.z) < 2.6 && Math.abs(P.y) < 3) return { g, i }; } return null; }
  function spot(P) { if (fading) return null; if (lock) return { p: 'PRESS \u00b7 SET THE PIN', use: lockPress };
    if (!on) { if (P.y > -3 && P.y < 4) { if (P.x > -435 && P.x < -422.5 && Math.abs(P.z) < 6.5) return { p: 'ENTER \u00b7 RUINS CAVE', use: enter };
        const gn = guardNear(P); if (gn) return { p: 'TALK \u00b7 BANDIT GUARD', use: () => sayTo({ key: 'caveGuard' + gn.i, obj: gn.g.f, name: 'Bandit Guard', role: 'Rook\u2019s crew', ry: gn.g.f.rotation.y, r: 2.6 }, GUARD_LINES[gn.i % 2]) };
        if (flag('ringJob') && !flag('hasSageRing') && near(P, SAGE_RING[0], SAGE_RING[1], 1.2)) return { p: 'LIFT THE BLACK STONE RING', use: steal }; } return null; }
    if (Math.hypot(CV.EXIT_SPOT.x - PL.x, CV.EXIT_SPOT.z - PL.z) < 2.4) return { p: 'LEAVE \u00b7 BACK TO THE RUINS', use: leave };
    if (CV.state.rubble > 0 && Math.hypot(RUB.x - PL.x, RUB.z - PL.z) < 3.4) return { p: 'BLAST THE CAVE-IN WITH 2 RANGE', use: () => toast('A CAVE-IN \u00b7 BLAST IT WITH 2 RANGE', 2) };
    if (!['called', 'parley', 'fight'].includes(camp)) for (let i = 0; i < 2; i++) if (!flag('caveChest' + i) && Math.hypot(CV.CHESTS[i].x - PL.x, CV.CHESTS[i].z - PL.z) < 1.6) return { p: 'OPEN THE CHEST', use: () => openChest(i) };
    const nt = nearTalk(); if (nt) return { p: 'TALK \u00b7 ' + String(nt.n.name).toUpperCase(), use: nt.fn };
    return null; }
  function steal() { if (stealCd > 0) { toast('Caught! The Sage pulls his hand away. Try again later.', 3); return; } if (Math.random() < 0.3) { stealCd = 20; toast('Caught! The Sage pulls his hand away. Try again later.', 3); } else { save.setFlag('hasSageRing'); toast('BLACK STONE RING \u00b7 Take it to the bandit camp', 3.5); } }
  function camFix(camera) { if (!on || !lastP) return; const P = lastP, c = camera.position, tx = P.x, ty = P.y + 1.4, tz = P.z, dx = c.x - tx, dy = c.y - ty, dz = c.z - tz; let t = 1;
    while (t > 0.15 && !C.camOK(tx + dx * t - OX, tz + dz * t - OZ)) t -= 0.05; t = Math.max(0.15, t);
    c.set(tx + dx * t, Math.min(CY + 6.4, Math.max(CY + 0.6, ty + dy * t)), tz + dz * t); const hd = Math.hypot(dx, dz) * t; if (hd < 3) c.y = Math.min(CY + 6.4, Math.max(c.y, ty + 1.2 + (3 - hd) * 0.6)); camera.lookAt(tx, ty, tz); }
  const LABEL = b => b < 0.13 ? 'PASSAGE' : b < 0.33 ? 'THE CROSSING' : b < 0.40 ? 'PASSAGE' : b < 0.655 ? 'THE HOLLOW' : b < 0.71 ? 'THE SEALED DOOR' : b < 0.86 ? 'THE ROOST' : 'BANDIT CAMP';
  function attack(kind, P, fox, k = 1) { if (!inCave(P)) return false; if (lock || fading) return true; const L0 = loc(P);
    const hit = CV.state.rubble > 0 ? [{ x: RUB.x, z: RUB.z, r: 1.5, onHit: how => { if (how === 'range') { CV.state.rubble--; aud.burst(0.2, 300, 0.3); toast(CV.state.rubble > 0 ? 'THE CAVE-IN SHIFTS' : 'THE WAY IS CLEAR', 1.6); } else toast('TOO SOLID \u00b7 USE 2 RANGE', 1.6); } }] : [];
    CB.attack(kind, { x: L0.x, z: L0.z, y: P.y - CY, face: P.yaw }, fox, { meleeDmg: 30 * (k || meleeK()), laserDmg: 15, hit: hit.length ? hit : undefined }); return true; }
  const API = {
    busy: () => (lock ? 'lock' : null), tick, camFix: c => camFix(c), toast: () => (toastT > 0 ? toastS : ''), quit() { if (lock) { lock = null; if (card) card.style.display = 'none'; toast('LOCKPICK PUT AWAY \u00b7 TALK TO MAX TO TRY AGAIN', 3); } },
    prompt: P => { const s = spot(P); return s ? s.p : null; }, talk: P => { const s = spot(P); if (!s) return false; s.use(); return true; }, useItem: () => false,
    groundAt: (x, z, y) => (inRect(x, z, y) ? CY : null), inside: P => inCave(P), on: () => on, where: P => { if (!inCave(P)) return null; const L0 = loc(P); return { key: 'meruRuinsInterior', label: 'RUINS CAVE \u00b7 ' + LABEL((L0.z - C.z) / C.d + 0.5), music: 'ruins' }; },
    clamp(px, pz, nx, nz) { const a = nx - OX, b = nz - OZ, ax = px - OX, bz = pz - OZ; if (C.walk(a, b)) return { x: nx, z: nz }; if (C.walk(a, bz)) return { x: nx, z: pz }; if (C.walk(ax, b)) return { x: px, z: nz }; return { x: px, z: pz }; },
    attack, hp: () => Math.round(CB.P.hp), max: () => CB.P.max, heal: n => { CB.P.hp = Math.min(CB.P.max, CB.P.hp + n); return Math.round(CB.P.hp); }, foes: () => CB.alive().filter(f => f.hostile).length,
    debug: { enter, leave, camp: () => camp, freeMax, startLock, CB, bandits, maxN, tpCamp: () => { const p = at(0.5, 0.86); goL(p.x, p.z, 0); }, tpMax: () => { const p = at(0.5, 0.905); goL(p.x, p.z, 0); }, downAll: () => { downAll(); camp = 'fight'; } } };
  window.__cave = API; return API;
}
