// 8 GATES — TABLE SHUFFLEBOARD [shuffleboard] · minigame #16 (TABLE GAMES).
// A long waxed table in a lounge room that fits inside any building on any world (?world=meru|gaya|… restyles the room).
// Slide your weights to the far end: 1 · 2 · 3 zones, a weight hanging over the edge is a HANGER worth 4. Knock the others off.
// 1–5 players: VS FOXES (CPU: Hope, Noble + two DRAFT foxes) · PASS & PLAY on one phone · ONLINE peer to peer (engine/duel-net.js, up to 5).
// Controls: drag the puck sideways to pick a lane, SWIPE UP on it to slide (swipe speed = power) · or HOLD the THROW button: the ghost
// puck walks down the table, let go where you want it to stop. Desktop: ←/→ (A/D) lane, hold Space to charge.
// MERGE: createShuffleboard({ container, onState, opts }) stands alone (the DC page uses it). buildShuffleTable(ctx) builds just the
// table + room from a Meru-style ctx ({ THREE, M, toon, scene, origin }) if a world wants the table in one of its own interiors.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { canvasTex, crestTex, FONT } from '../../engine/textures.js';

// ---------------- rules + table numbers (game units ≈ metres) ----------------
export const SHUFFLE = { name: 'TABLE SHUFFLEBOARD', room: 'shuffleboard', key: 'shuffleboard' };
export const TABLE = { L: 5.4, W: 0.62, R: 0.048, H: 0.034, TY: 0.82, GUT: 0.09, Z0: 0.22, RELEASE: 0.5, MU: 0.75 };
export const ZONES = { three: 0.3, two: 0.75, foul: 1.35 };           // measured back from the far edge
export const COLS = [['RED', '#ec3013', 'R'], ['BLUE', '#38bdf8', 'B'], ['GOLD', '#ffd23a', 'Y'], ['GREEN', '#22c55e', 'G'], ['PURPLE', '#a78bfa', 'P']];
export const CPU_FOXES = [   // Hope + Noble come from engine/cast.js; the other two are DRAFT names for Ben
  { name: 'HOPE', cast: 'hope', line: 'I hear where the weights stop.' }, { name: 'NOBLE', cast: 'noble', line: 'Knock-offs are my thing.' },
  { name: 'RUSTY', look: { ...PLAYER_MALE, fur: '#b45309', furDark: '#7c2d12', tailMid: '#b45309' }, outfit: 'vest', line: 'Slow and steady.' },
  { name: 'MAPLE', look: { ...PLAYER_FEMALE, fur: '#d97706', furDark: '#92400e' }, outfit: 'dress', line: 'Hangers or nothing.' }];
export const LEVELS = { easy: { name: 'EASY', sv: 0.06, sx: 0.04, knock: 0.25 }, medium: { name: 'MEDIUM', sv: 0.032, sx: 0.022, knock: 0.6 }, hard: { name: 'HARD', sv: 0.016, sx: 0.011, knock: 0.9 } };
export const THEMES = {   // DRAFT palettes, one per world: walls, trim, floor, accent, neon
  tavern: { name: 'Tavern', wall: '#6b3f2c', trim: '#2a1810', floor: '#8a5a3a', accent: '#e6b45a', neon: '#ff5a3c' },
  meru: { name: 'Meru', wall: '#3b4a7a', trim: '#151b3d', floor: '#7a5a46', accent: '#e6b45a', neon: '#7dd3fc' },
  gaya: { name: 'Gaya', wall: '#2f5d4a', trim: '#16302a', floor: '#7d6243', accent: '#a7f3d0', neon: '#34d399' },
  jidda: { name: 'Jidda', wall: '#2a6f8f', trim: '#103747', floor: '#c9a46a', accent: '#fde68a', neon: '#38bdf8' },
  kufa: { name: 'Kufa', wall: '#b9814a', trim: '#5a3818', floor: '#a0703f', accent: '#fef3c7', neon: '#f59e0b' },
  luxor: { name: 'Luxor', wall: '#3b3330', trim: '#141010', floor: '#5d4a40', accent: '#e6b45a', neon: '#f43f5e' },
  nebo: { name: 'Nebo', wall: '#4a3a6a', trim: '#221934', floor: '#6b4f3a', accent: '#f9a8d4', neon: '#c084fc' },
  ur: { name: 'Ur', wall: '#9a6a3a', trim: '#4a2e14', floor: '#b08452', accent: '#fde68a', neon: '#fb923c' },
  zion: { name: 'Zion', wall: '#7a4a2a', trim: '#3a2010', floor: '#8c6038', accent: '#fcd34d', neon: '#ef4444' },
  home: { name: 'Home', wall: '#5a6a3a', trim: '#2a3318', floor: '#8a6a44', accent: '#fef08a', neon: '#a3e635' },
  earth: { name: 'Earth', wall: '#4a4f58', trim: '#1f2329', floor: '#6a5038', accent: '#e5e7eb', neon: '#60a5fa' },
  station: { name: 'Deep Space Fox', wall: '#1e2a3a', trim: '#0b1220', floor: '#334155', accent: '#7dd3fc', neon: '#22d3ee' } };
export const SAVE_KEYS = { wins: 'shuffleboard.wins', games: 'shuffleboard.games', onlineWins: 'shuffleboard.onlineWins', hangers: 'shuffleboard.hangers', bestFrame: 'shuffleboard.bestFrame', firstWin: 'shuffleboard.firstWin', settings: 'shuffleboard.settings' };
const PREF_KEY = SAVE_KEYS.settings;   // per-device settings (guide, sound) — localStorage, game-prefixed

const { L, W, R, TY, Z0, MU } = TABLE, FOUL = L - ZONES.foul, LANE = W / 2 - R - 0.012;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const loadPrefs = () => { try { return { guide: true, sound: true, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch (e) { return { guide: true, sound: true }; } };

// ---------------- the rules (pure, shared by every client) ----------------
// value of one weight: 4 hanger (overhangs the far edge) · 3 / 2 / 1 by the zone it has fully crossed into · 0 = dead
export function zoneOf(z) { if (z > L) return 0; if (z + R > L) return 4; if (z - R >= L - ZONES.three) return 3; if (z - R >= L - ZONES.two) return 2; if (z >= FOUL) return 1; return 0; }
export const ZONE_NAME = { 4: 'HANGER', 3: '3 ZONE', 2: '2 ZONE', 1: '1 ZONE', 0: 'DEAD' };
// rule 'table' (classic): only the owner of the furthest weight scores, every one of their weights past all the others' best
// rule 'every': every weight on the board scores its zone (good for 3–5 players)
export function scoreFrame(pucks, ids, rule) {
  const on = pucks.filter(p => p.alive && !p.fall && !p.dead && zoneOf(p.z) > 0), pts = Object.fromEntries(ids.map(i => [i, 0])), counted = [];
  if (!on.length) return { pts, counted, lead: null };
  if (rule === 'every') { for (const p of on) if (p.owner in pts) { pts[p.owner] += zoneOf(p.z); counted.push(p.id); } return { pts, counted, lead: null }; }
  const lead = on.reduce((a, b) => b.z > a.z ? b : a), best = Math.max(-1, ...on.filter(p => p.owner !== lead.owner).map(p => p.z));
  for (const p of on) if (p.owner === lead.owner && p.z > best) { pts[p.owner] = (pts[p.owner] || 0) + zoneOf(p.z); counted.push(p.id); }
  return { pts, counted, lead: lead.owner };
}
// fixed-step physics (only + − × ÷ √ so every phone gets the same result from the same throw)
const STEP = 1 / 240, E = 0.86;
export function stepPhysics(pucks, onEvent) {
  let moving = false;
  for (const p of pucks) {
    if (!p.alive || p.fall) continue; const sp = Math.sqrt(p.vx * p.vx + p.vz * p.vz); if (sp <= 0) continue;
    const dec = MU * STEP; if (sp <= dec) { p.vx = 0; p.vz = 0; continue; } const k = (sp - dec) / sp; p.vx *= k; p.vz *= k; p.x += p.vx * STEP; p.z += p.vz * STEP; moving = true;
  }
  for (let i = 0; i < pucks.length; i++) { const a = pucks[i]; if (!a.alive || a.fall) continue;
    for (let j = i + 1; j < pucks.length; j++) { const b = pucks[j]; if (!b.alive || b.fall) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz; if (d2 >= 4 * R * R || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
      if (rel > 0) { const j2 = (1 + E) / 2 * rel; a.vx -= j2 * nx; a.vz -= j2 * nz; b.vx += j2 * nx; b.vz += j2 * nz; onEvent && onEvent('hit', a, b, rel); }
      const o = (2 * R - d) / 2; a.x -= nx * o; a.z -= nz * o; b.x += nx * o; b.z += nz * o; moving = true; } }
  for (const p of pucks) { if (!p.alive || p.fall) continue; if (p.x > W / 2 || p.x < -W / 2 || p.z > L || p.z < -0.05) { p.fall = p.z > L ? 'end' : 'side'; p.vx *= 0.5; p.vz *= 0.5; onEvent && onEvent('fall', p); } }
  return moving;
}
// where a straight throw at speed v stops (no collisions) — the ghost puck + the CPU both use it
export const stopZ = (z0, v) => z0 + v * v / (2 * MU);
export const speedFor = (z0, z1) => Math.sqrt(Math.max(0, 2 * MU * (z1 - z0)));

// ---------------- local test network (two tabs on one computer) when engine/duel-net.js is not in the repo ----------------
function localNet({ game, code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10), seen = new Set(); let bc;
  try { bc = new BroadcastChannel('8g-net-' + game + '-' + code); } catch (e) { onStatus && onStatus('offline'); return { id, send() {}, leave() {} }; }
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; if (!seen.has(m.from)) { seen.add(m.from); onJoin && onJoin(m.from); } if (m.type === '_bye') { seen.delete(m.from); onLeave && onLeave(m.from); return; } onMsg && onMsg(m.type, m.data, m.from); };
  setTimeout(() => { onStatus && onStatus('local'); bc.postMessage({ from: id, type: '_hey' }); }, 0);
  return { id, send(type, data, to) { try { bc.postMessage({ from: id, to: to || null, type, data }); } catch (e) {} }, leave() { try { bc.postMessage({ from: id, type: '_bye' }); bc.close(); } catch (e) {} } };
}
async function connectNet(o) {
  try { const m = await import(new URL('engine/duel-net.js', document.baseURI).href); if (m && m.connectDuel) return await m.connectDuel(o); } catch (e) {}
  return localNet(o);
}

// ---------------- 3D: room + table (also usable from a world's own scene) ----------------
function feltTex() {   // the playfield: maple, wax sheen, the zone lines and big numbers (drawn upside down so they read from the thrower's end)
  const Hc = 2048, Wc = Math.round(Hc * W / L);
  return canvasTex(Wc, Hc, (g, w, h) => {
    const zy = z => z / L * h; g.fillStyle = '#ead2a8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? 'rgba(160,110,60,0.08)' : 'rgba(255,240,210,0.10)'; g.fillRect(i * w / 9, 0, w / 9, h); }
    for (let i = 0; i < 140; i++) { g.strokeStyle = 'rgba(150,100,50,' + rr(0.05, 0.14) + ')'; g.lineWidth = rr(0.5, 1.6); const x = rr(0, w); g.beginPath(); g.moveTo(x, rr(0, h)); g.lineTo(x + rr(-2, 2), rr(0, h)); g.stroke(); }
    const band = (z0, z1, col) => { g.fillStyle = col; g.fillRect(0, zy(z0), w, zy(z1) - zy(z0)); };
    band(L - ZONES.three, L, 'rgba(236,48,19,0.16)'); band(L - ZONES.two, L - ZONES.three, 'rgba(56,189,248,0.12)'); band(FOUL, L - ZONES.two, 'rgba(255,210,58,0.12)');
    const line = (z, col, wd) => { g.fillStyle = col; g.fillRect(0, zy(z) - wd / 2, w, wd); };
    line(L - ZONES.three, '#201e1d', 5); line(L - ZONES.two, '#201e1d', 5); line(FOUL, '#ec3013', 7); line(TABLE.RELEASE, '#201e1d', 4); line(L - 0.004, '#201e1d', 6);
    const num = (t, z, sz) => { g.save(); g.translate(w / 2, zy(z)); g.rotate(Math.PI); g.font = `900 ${sz}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(32,30,29,0.78)'; g.fillText(t, 0, 0); g.restore(); };
    num('3', L - ZONES.three / 2, 96); num('2', L - (ZONES.two + ZONES.three) / 2, 110); num('1', L - (ZONES.foul + ZONES.two) / 2, 120);
    g.save(); g.translate(w / 2, zy(FOUL - 0.12)); g.rotate(Math.PI); g.font = `800 22px ${FONT}`; g.textAlign = 'center'; g.fillStyle = '#ec3013'; g.fillText('FOUL LINE', 0, 0); g.restore();
    g.save(); g.translate(w / 2, zy(TABLE.RELEASE + 0.1)); g.rotate(Math.PI); g.font = `800 20px ${FONT}`; g.textAlign = 'center'; g.fillStyle = 'rgba(32,30,29,0.6)'; g.fillText('RELEASE BEFORE THIS LINE', 0, 0); g.restore();
  });
}
function plankTex(col) { return canvasTex(256, 256, (g, w, h) => { const c = new THREE.Color(col); g.fillStyle = col; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { const k = 0.86 + ((i * 37) % 5) * 0.06; g.fillStyle = '#' + c.clone().multiplyScalar(k).getHexString(); g.fillRect(i * 32, 0, 31, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(i * 32 + 31, 0, 1, h); g.fillRect(i * 32, (i * 97) % h, 31, 1); } }, [6, 8]); }
export function buildShuffleTable(ctx) {
  const { M, toon, scene, origin = new THREE.Vector3() } = ctx, T = ctx.theme || THEMES.tavern, root = new THREE.Group(); root.position.copy(origin); scene.add(root);
  const wood = toon('#7a4a2a'), woodD = toon('#4a2a16'), rail = toon('#3a2214'), brass = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshToonMaterial({ map: feltTex(), gradientMap: ctx.grad })); top.rotation.x = -Math.PI / 2; top.position.set(0, TY, L / 2); top.receiveShadow = true; root.add(top);
  const GW = TABLE.GUT, outer = W / 2 + GW;
  M(new THREE.BoxGeometry(W + 2 * GW + 0.12, 0.16, L + 0.5), wood, 0, TY - 0.13, L / 2 + 0.1, root, 0.02);                   // body
  for (const s of [-1, 1]) {
    M(new THREE.BoxGeometry(GW, 0.02, L + 0.2), toon('#1e1a17'), s * (W / 2 + GW / 2), TY - 0.06, L / 2 + 0.05, root, 0);       // side gutters
    M(new THREE.BoxGeometry(0.06, 0.09, L + 0.5), rail, s * (outer + 0.03), TY + 0.0, L / 2 + 0.1, root, 0.015);                 // side rails
    for (const z of [0.25, L / 2, L - 0.15]) M(new THREE.BoxGeometry(0.1, TY - 0.2, 0.1), woodD, s * (W / 2 + 0.02), (TY - 0.2) / 2, z, root, 0.015);
    M(new THREE.BoxGeometry(0.02, 0.025, L + 0.3), brass, s * (outer + 0.062), TY + 0.03, L / 2 + 0.1, root, 0);
  }
  M(new THREE.BoxGeometry(W + 2 * GW, 0.02, 0.3), toon('#1e1a17'), 0, TY - 0.06, L + 0.16, root, 0);                              // end gutter
  M(new THREE.BoxGeometry(W + 2 * GW + 0.12, 0.12, 0.06), rail, 0, TY + 0.0, L + 0.34, root, 0.015);
  M(new THREE.BoxGeometry(W + 2 * GW + 0.12, 0.05, 0.06), rail, 0, TY - 0.03, -0.16, root, 0.012);
  M(new THREE.BoxGeometry(W + 0.5, 0.04, 0.36), woodD, 0, 0.12, L / 2, root, 0.012);                                              // foot bar
  return { root, top, theme: T };
}
function buildRoom(ST, T) {
  const { M, toon, scene } = ST, g = new THREE.Group(); scene.add(g);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 14), new THREE.MeshToonMaterial({ map: plankTex(T.floor), gradientMap: ST.grad })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 2.5); floor.receiveShadow = true; g.add(floor);
  const wall = toon(T.wall), trim = toon(T.trim), acc = toon(T.accent);
  M(new THREE.BoxGeometry(9, 4, 0.2), wall, 0, 2, L + 2.0, g, 0); M(new THREE.BoxGeometry(9, 0.9, 0.24), trim, 0, 0.45, L + 1.98, g, 0);
  for (const s of [-1, 1]) { M(new THREE.BoxGeometry(0.2, 4, 14), wall, s * 3.4, 2, 2.5, g, 0); M(new THREE.BoxGeometry(0.24, 0.9, 14), trim, s * 3.38, 0.45, 2.5, g, 0); M(new THREE.BoxGeometry(0.06, 0.06, 14), acc, s * 3.27, 0.92, 2.5, g, 0); }
  M(new THREE.BoxGeometry(9, 0.06, 0.06), acc, 0, 0.92, L + 1.88, g, 0);
  const neon = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#0b0a12'; c.fillRect(0, 0, w, h); c.shadowColor = T.neon; c.shadowBlur = 24; c.fillStyle = T.neon; c.font = `900 78px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SHUFFLE', w / 2, h / 2 + 4); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), new THREE.MeshBasicMaterial({ map: neon })); sign.position.set(0, 2.75, L + 1.89); sign.rotation.y = Math.PI; g.add(sign);
  // the scoreboard on the far wall (redrawn when the score changes)
  const sbC = document.createElement('canvas'); sbC.width = 512; sbC.height = 256; const sbT = new THREE.CanvasTexture(sbC); sbT.colorSpace = THREE.SRGBColorSpace;
  const sb = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.85), new THREE.MeshBasicMaterial({ map: sbT })); sb.position.set(0, 1.85, L + 1.89); sb.rotation.y = Math.PI; g.add(sb);
  M(new THREE.BoxGeometry(1.82, 0.97, 0.05), trim, 0, 1.85, L + 1.93, g, 0);
  // frames + benches + plants (decoration only: cut first on a slow phone)
  for (const s of [-1, 1]) for (const z of [0.6, 3.2]) { M(new THREE.BoxGeometry(0.04, 0.7, 0.9), trim, s * 3.28, 2.0, z, g, 0); M(new THREE.BoxGeometry(0.03, 0.56, 0.76), toon(s < 0 ? T.accent : T.neon), s * 3.26, 2.0, z, g, 0); }
  for (const s of [-1, 1]) { M(new THREE.BoxGeometry(0.5, 0.08, 2.4), toon('#5a3a22'), s * 2.7, 0.46, 3.6, g, 0.015); for (const z of [2.6, 4.6]) M(new THREE.BoxGeometry(0.4, 0.42, 0.08), toon('#3a2214'), s * 2.7, 0.21, z, g, 0.012); }
  for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 10), toon('#a0522d'), s * 2.9, 0.21, L + 1.5, g, 0.015); for (let i = 0; i < 5; i++) { const b = M(new THREE.SphereGeometry(0.22, 8, 6), toon('#2f7a3a'), s * 2.9 + rr(-0.12, 0.12), 0.6 + i * 0.12, L + 1.5 + rr(-0.12, 0.12), g, 0.015, 0.22); b.scale.y = 1.3; } }
  // pendant lamps over the table (layer 1: the top-down END inset camera never sees them)
  const lamps = [];
  for (const z of [L / 2 - 0.4, L - 0.6]) { const lg = new THREE.Group(); lg.position.set(0, 2.75, z); g.add(lg);
    M(new THREE.CylinderGeometry(0.006, 0.006, 1.2, 4), toon('#111'), 0, 0.6, 0, lg, 0); const sh = M(new THREE.ConeGeometry(0.26, 0.2, 18, 1, true), toon(T.trim, { side: THREE.DoubleSide }), 0, 0, 0, lg, 0.012, 0.26);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); bulb.position.y = -0.08; lg.add(bulb); lg.traverse(o => o.layers.set(1)); lamps.push(lg); }
  function drawBoard(players, target, frame, turnId) {
    const c = sbC.getContext('2d'); c.fillStyle = '#0b0a12'; c.fillRect(0, 0, 512, 256); c.strokeStyle = T.accent; c.lineWidth = 8; c.strokeRect(6, 6, 500, 244);
    c.fillStyle = T.accent; c.font = `900 26px ${FONT}`; c.textAlign = 'left'; c.fillText(frame ? 'FRAME ' + frame + '  ·  TO ' + target : 'SHUFFLEBOARD', 22, 40);
    const n = Math.max(1, players.length), rowH = Math.min(46, 190 / n);
    players.forEach((p, i) => { const y = 58 + i * rowH; c.fillStyle = p.col; c.fillRect(22, y + 4, rowH - 12, rowH - 12); c.fillStyle = p.id === turnId ? '#ffffff' : '#cfcac4'; c.font = `900 ${Math.round(rowH * 0.6)}px ${FONT}`; c.textAlign = 'left'; c.fillText(p.name, 22 + rowH, y + rowH * 0.62); c.textAlign = 'right'; c.fillText(String(p.score), 488, y + rowH * 0.62); });
    sbT.needsUpdate = true;
  }
  drawBoard([], 15, 0, null);
  return { g, drawBoard, lamps };
}
function puckTex(col, letter, dark) {
  return canvasTex(128, 128, (g) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, 64, 0, 7); g.fill(); g.strokeStyle = dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke();
    g.fillStyle = dark ? '#201e1d' : '#ffffff'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 70); });
}

// ---------------- the game ----------------
export async function createShuffleboard({ container, onState = () => {}, opts = {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), T = THEMES[opts.world] || THEMES.tavern; scene.background = new THREE.Color(T.trim);
  const camera = new THREE.PerspectiveCamera(55, CW() / CH(), 0.05, 60); camera.layers.enable(1);
  const mini = new THREE.OrthographicCamera(-0.5, 0.5, 1, -1, 0.05, 2); mini.position.set(0, TY + 0.6, L - 0.72); mini.up.set(0, 0, 1); mini.lookAt(0, TY, L - 0.72);
  const gd = new Uint8Array([90, 170, 255]), grad = new THREE.DataTexture(gd, 3, 1, THREE.RedFormat); grad.needsUpdate = true;
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.02, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const ST = { THREE, scene, toon, M, grad };
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x6a4a3a, 1.25));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.5); key.position.set(1.5, 6, 1.5); key.target.position.set(0, TY, L / 2); scene.add(key, key.target);
  if (!touch) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 4, bottom: -4, near: 1, far: 12 }); key.shadow.bias = -0.0008; }
  const room = buildRoom(ST, T), table = buildShuffleTable({ ...ST, theme: T });
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);

  // ---- audio (synth; nothing to download) ----
  let ac = null, slideG = null, prefs = loadPrefs();
  function audio() { if (ac || !prefs.sound) return ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); const n = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ac.createBufferSource(); src.buffer = n; src.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.7; slideG = ac.createGain(); slideG.gain.value = 0; src.connect(bp).connect(slideG).connect(ac.destination); src.start(); } catch (e) { ac = null; } return ac; }
  function tone(f, d = 0.12, v = 0.15, type = 'triangle', at = 0) { const a = audio(); if (!a || !prefs.sound) return; try { const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at; o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
  const clack = v => { tone(1700 + rr(-200, 200), 0.05, clamp(v * 0.25, 0.04, 0.3), 'square'); tone(820, 0.08, clamp(v * 0.12, 0.02, 0.15)); };
  const thud = () => { tone(140, 0.22, 0.25, 'sine'); tone(90, 0.3, 0.2, 'sine', 0.04); };
  const chime = n => { [523, 659, 784, 1047].slice(0, Math.max(1, Math.min(4, n))).forEach((f, i) => tone(f, 0.22, 0.12, 'triangle', i * 0.09)); };
  let chargeOsc = null;
  function chargeTone(d) { const a = audio(); if (!a || !prefs.sound) return; try { if (!chargeOsc) { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; g.gain.value = 0.05; o.connect(g).connect(a.destination); o.start(); chargeOsc = { o, g }; } chargeOsc.o.frequency.setTargetAtTime(180 + d * 120, a.currentTime, 0.02); } catch (e) {} }
  function chargeToneOff() { if (chargeOsc) { try { chargeOsc.o.stop(); } catch (e) {} chargeOsc = null; } }

  // ---- pucks ----
  const puckMeshes = new Map(), puckGeo = new THREE.CylinderGeometry(R, R * 1.04, TABLE.H, 28), capGeo = new THREE.CylinderGeometry(R * 0.8, R * 0.8, 0.006, 28), steel = toon('#c9ced6');
  const texCache = {};
  function puckMesh(p) {
    let m = puckMeshes.get(p.id); if (m) return m;
    const pl = players.find(q => q.id === p.owner), ci = pl ? pl.slot : 0, [, col, letter] = COLS[ci], k = ci + letter;
    texCache[k] = texCache[k] || puckTex(col, letter, ci === 2);
    m = new THREE.Group(); const base = M(puckGeo, steel, 0, TABLE.H / 2, 0, m, 0.006, R);
    const cap = new THREE.Mesh(capGeo, [toon(col), new THREE.MeshToonMaterial({ map: texCache[k], gradientMap: grad }), toon(col)]); cap.position.y = TABLE.H + 0.002; cap.rotation.y = -Math.PI / 2; m.add(cap); base.castShadow = !touch;
    scene.add(m); puckMeshes.set(p.id, m); return m;
  }
  function clearPucks() { for (const m of puckMeshes.values()) scene.remove(m); puckMeshes.clear(); }
  // aim guide: dashed line + ghost ring
  const guideMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
  const aimLine = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 1), guideMat); aimLine.rotation.x = -Math.PI / 2; scene.add(aimLine);
  const ghost = new THREE.Mesh(new THREE.RingGeometry(R * 0.82, R * 1.08, 28), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })); ghost.rotation.x = -Math.PI / 2; scene.add(ghost);
  const ringHi = new THREE.Mesh(new THREE.RingGeometry(R * 1.15, R * 1.45, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })); ringHi.rotation.x = -Math.PI / 2; scene.add(ringHi);

  // ---- state ----
  let players = [], pucks = [], mode = 'menu', phase = 'menu', cfg = { target: 15, rule: 'table', level: 'medium' }, frame = 0, throwN = 0, order = [], perPlayer = 4;
  let lane = 0, laneZ = Z0, charge = null, flash = null, frameCard = null, done = null, say = '', view = 'aim', settleT = 0, cpuT = 0, cpuPlan = null, waitSync = 0, laneHold = 0, lastAimSend = 0;
  let safe = { top: 0, bottom: 0, left: 0, right: 0 }, net = null, N = null, lastSeen = {}, practiceBest = save.stat(SAVE_KEYS.bestFrame, 0), frameStartN = 0, nextId = 1, dirty = true, lastHud = '';
  const me = () => players.find(p => p.me) || null;
  const total = () => players.length * perPlayer;
  const curPlayer = () => { if (!order.length) return null; return players.find(p => p.id === order[throwN % order.length]) || null; };
  const localTurn = () => { const c = curPlayer(); return !!c && phase === 'aim' && (c.kind === 'me' || c.kind === 'local'); };
  const left = p => perPlayer - pucks.filter(q => q.owner === p.id).length;

  function makeFoxFor(p) {
    let f;
    if (p.cast) f = cast.make(p.cast, { gear: 'none' });
    else if (p.kind === 'me') f = cast.make('player', { gear: 'none' });
    else f = kit.makeFox({ torso: p.col, crest: '8', look: p.look || (p.slot % 2 ? PLAYER_FEMALE : PLAYER_MALE), outfit: p.outfit || 'vest', eyes: ['#38bdf8', '#38bdf8'], mood: 'happy' });
    const box = new THREE.Box3().setFromObject(f), h = box.max.y - box.min.y || 2; f.scale.multiplyScalar(1.5 / h); f.userData.k = f.scale.x;
    return f;
  }
  function spotFor(i, n) { const s = i % 2 ? -1 : 1, k = Math.floor(i / 2); return { x: s * (1.35 + k * 0.5), z: L - 0.45 + k * 0.6, ry: s > 0 ? -Math.PI / 2 - 0.35 : Math.PI / 2 + 0.35 }; }
  function placeFoxes(snap) {
    const cur = curPlayer(); let k = 0;
    for (const p of players) { if (!p.fox) continue; const u = p.fox.userData; let s;
      if (p === cur && phase !== 'menu' && !done) s = { x: -0.78, z: -0.22, ry: 0.65 }; else s = spotFor(k++, players.length);
      if (p.gone) s = { x: 2.4, z: 5 + k, ry: 0 };
      u.to = s; if (snap) { p.fox.position.set(s.x, 0, s.z); p.fox.rotation.y = s.ry; } }
  }
  function removeFoxes() { for (const p of players) if (p.fox) { scene.remove(p.fox); p.fox = null; } }

  // ---- setup ----
  function setPlayers(list) {
    removeFoxes(); clearPucks(); for (const f of demo) scene.remove(f); demo = []; pending = null;
    players = list.map((p, i) => ({ id: p.id || 'p' + i, slot: i, name: p.name || COLS[i][0], col: COLS[i][1], colName: COLS[i][0], kind: p.kind, me: p.kind === 'me', cast: p.cast, look: p.look, outfit: p.outfit, score: 0, gone: false, line: p.line || '' }));
    players.forEach(p => p.fox = makeFoxFor(p));
  }
  function startMatch(c) {
    cfg = { ...cfg, ...c }; perPlayer = mode === 'practice' ? 4 : players.length === 2 ? 4 : 3;
    frame = 0; done = null; frameCard = null; players.forEach(p => { p.score = 0; }); nextFrame(); emit(true);
    if (mode !== 'practice' && mode !== 'net') try { save.setStat(SAVE_KEYS.games, save.stat(SAVE_KEYS.games) + 1); } catch (e) {}
  }
  function nextFrame() {
    frame++; clearPucks(); pucks = []; throwN = 0; frameCard = null;
    const n = players.length, start = (frame - 1) % n; order = []; for (let k = 0; k < perPlayer * n; k++) order.push(players[(start + k) % n].id);
    beginTurn();
  }
  function beginTurn() {
    while (throwN < order.length && curPlayer() && curPlayer().gone) throwN++;
    if (throwN >= order.length) { endFrame(); return; }
    phase = 'aim'; lane = 0; laneZ = Z0; charge = null; view = 'aim'; cpuPlan = null; cpuT = 0;
    const c = curPlayer(); say = (c.me ? 'Your throw' : c.name + "'s throw") + '. ' + left(c) + ' left.';
    if (c.kind === 'cpu') { cpuT = rr(0.8, 1.4); cpuPlan = planCpu(c); }
    placeFoxes(false); room.drawBoard(players, cfg.target, mode === 'practice' ? 0 : frame, c.id); emit(true); if (pending) runPending();
  }
  // ---- throwing ----
  function throwPuck(x, z, vx, vz, fromNet) {
    const c = curPlayer(); if (!c || phase !== 'aim') return;
    const p = { id: nextId++, owner: c.id, x, z, vx, vz, alive: true, fall: null, n: throwN, sink: 0 }; pucks.push(p);
    phase = 'slide'; view = 'follow'; charge = null; chargeToneOff(); flash = null; settleT = 0; audio();
    if (c.fox) c.fox.userData.push = 1;
    if (mode === 'net' && c.me && !fromNet && N) N.send('ev', { k: 'throw', fn: frame, n: throwN, x, z, vx, vz });
    say = c.name + ' slides.'; emit(true);
  }
  function throwStraight(v, ang = 0) { const s = Math.sin(ang), co = Math.cos(ang); throwPuck(lane, laneZ, v * s, v * co); }
  function afterSettle() {
    // dead weights (never crossed the foul line) come off; then the score so far
    const thrown = pucks[pucks.length - 1]; let msg = '', col = '#ffd23a';
    for (const p of pucks) if (p.alive && !p.fall && p.z < FOUL) { p.alive = false; p.dead = true; }
    const knocked = pucks.filter(p => p.fall && p.knockFlag && p !== thrown).length;
    if (thrown) { const zv = thrown.alive && !thrown.fall ? zoneOf(thrown.z) : 0; msg = thrown.fall ? (thrown.fall === 'end' ? 'OFF THE END' : 'IN THE GUTTER') : thrown.dead ? 'DEAD · SHORT OF THE FOUL LINE' : ZONE_NAME[zv];
      if (zv === 4) { col = '#ec3013'; chime(4); const pl = players.find(q => q.id === thrown.owner); if (pl && pl.me) try { save.setStat(SAVE_KEYS.hangers, save.stat(SAVE_KEYS.hangers) + 1); } catch (e) {} } else if (zv === 3) chime(3); else if (zv) chime(1); else col = '#8a847e';
      if (knocked) msg += ' · ' + knocked + ' KNOCKED OFF'; }
    for (const p of pucks) p.knockFlag = false;
    flash = msg ? { txt: msg, col, t: 2.2 } : null; say = msg ? msg.toLowerCase() + '.' : say;
    if (mode === 'net' && N) { const c = curPlayer(); if (c && c.me) N.send('ev', { k: 'sync', fn: frame, n: throwN, P: pucks.map(p => [p.id, p.owner, p.x, p.z, p.alive && !p.fall ? 1 : 0]) }); }
    throwN++; phase = 'between'; settleT = 0.9; emit(true);
  }
  function endFrame() {
    const ids = players.map(p => p.id), res = scoreFrame(pucks, ids, mode === 'practice' ? 'every' : cfg.rule);
    const rows = players.map(p => ({ name: p.me && mode !== 'local' ? 'YOU' : p.name, col: p.col, pts: res.pts[p.id] || 0, total: p.score + (res.pts[p.id] || 0) }));
    players.forEach(p => p.score += res.pts[p.id] || 0);
    for (const p of pucks) { const m = puckMeshes.get(p.id); if (m) m.userData.glow = res.counted.includes(p.id) ? 1 : 0; }
    const got = rows.filter(r => r.pts > 0); let title;
    if (mode === 'practice') { const n = rows[0].pts; title = n + (n === 1 ? ' POINT' : ' POINTS') + ' THIS FRAME'; if (n > practiceBest) { practiceBest = n; try { save.best(SAVE_KEYS.bestFrame, n); } catch (e) {} title += ' · NEW BEST'; } }
    else title = !got.length ? 'NOBODY SCORES' : got.length === 1 ? got[0].name + ' SCORES ' + got[0].pts : got.map(r => r.name + ' +' + r.pts).join(' · ');
    frameCard = { title, frame, rows, t: 0 }; phase = 'frameEnd'; view = 'end'; say = title.toLowerCase() + '.'; if (got.length) chime(3);
    room.drawBoard(players, cfg.target, mode === 'practice' ? 0 : frame, null);
    players.forEach(p => { if (p.fox) p.fox.userData.mood = (res.pts[p.id] || 0) > 0 ? 'excited' : 'neutral'; });
    // match over?
    if (mode !== 'practice') { const live = players.filter(p => !p.gone), top = Math.max(...live.map(p => p.score)), lead = live.filter(p => p.score === top);
      if ((top >= cfg.target && lead.length === 1) || live.length < 2) finish(lead[0] || live[0]); }
    emit(true);
  }
  function finish(winner) {
    const m = me(), won = !!m && winner && winner.id === m.id, cpuN = players.filter(p => p.kind === 'cpu').length; let gold = 0, newBest = false;
    if (mode === 'cpu' && won) { gold = 5 + 5 * cpuN + (cfg.level === 'hard' ? 5 : 0); try { save.addGold(gold); save.setStat(SAVE_KEYS.wins, save.stat(SAVE_KEYS.wins) + 1); if (!save.flag(SAVE_KEYS.firstWin)) { save.setFlag(SAVE_KEYS.firstWin); newBest = true; } } catch (e) {} }
    if (mode === 'net') { gold = won ? 15 : 3; try { save.addGold(gold); if (won) save.setStat(SAVE_KEYS.onlineWins, save.stat(SAVE_KEYS.onlineWins) + 1); } catch (e) {} }
    const rank = players.slice().sort((a, b) => b.score - a.score);
    done = { winner: winner ? (winner.me && mode !== 'local' ? 'YOU' : winner.name) : '—', winCol: winner ? winner.col : '#fff', won, local: mode === 'local', online: mode === 'net', gold, first: newBest,
      rows: rank.map(p => ({ name: p.me && mode !== 'local' ? 'YOU' : p.name, col: p.col, v: String(p.score) + (p.gone ? ' · LEFT' : '') })), frames: frame };
    if (winner && winner.fox) winner.fox.userData.mood = 'excited'; tone(523, 0.2, 0.15); tone(659, 0.2, 0.15, 'triangle', 0.15); tone(1047, 0.4, 0.15, 'triangle', 0.3);
    say = (done.winner === 'YOU' ? 'You win' : done.winner + ' wins') + '.';
    if (mode === 'net') { net.st = 'room'; net.ready = false; for (const k in net.peers) net.peers[k].ready = false; }
  }

  // ---- CPU ----
  function planCpu(c) {
    const lv = LEVELS[cfg.level] || LEVELS.medium, mine = pucks.filter(p => p.alive && !p.fall && p.owner === c.id), theirs = pucks.filter(p => p.alive && !p.fall && p.owner !== c.id && zoneOf(p.z) > 0);
    const myBest = Math.max(-1, ...mine.map(p => p.z)), lead = theirs.length ? theirs.reduce((a, b) => b.z > a.z ? b : a) : null;
    const lastShot = left(c) === 1, blocked = (x, z1) => pucks.some(p => p.alive && !p.fall && Math.abs(p.x - x) < 2 * R + 0.01 && p.z > Z0 && p.z < z1 + R);
    if (lead && lead.z > myBest && Math.random() < lv.knock && !pucks.some(p => p !== lead && p.alive && !p.fall && Math.abs(p.x - lead.x) < 2 * R && p.z < lead.z && p.z > Z0)) {
      return { x: clamp(lead.x, -LANE, LANE), v: speedFor(Z0, Math.min(L + 0.4, lead.z + rr(0.7, 1.1))), kind: 'knock' };
    }
    let zT = L - (cfg.level === 'hard' && lastShot ? 0.03 : rr(0.08, 0.2)); const lanes = []; for (let x = -LANE; x <= LANE + 1e-6; x += 0.035) if (!blocked(x, zT)) lanes.push(x);
    let x = lanes.length ? lanes.sort((a, b) => Math.abs(a) - Math.abs(b))[Math.floor(Math.random() * Math.min(4, lanes.length))] : rr(-LANE, LANE);
    if (!lanes.length) zT = L - 0.5;
    return { x, v: speedFor(Z0, zT), kind: 'draw' };
  }
  function cpuGo(c) { const lv = LEVELS[cfg.level] || LEVELS.medium, p = cpuPlan || planCpu(c); const x = clamp(p.x + gauss() * lv.sx, -LANE, LANE), v = Math.max(0.5, p.v * (1 + gauss() * lv.sv)), ang = gauss() * lv.sx * 0.15; lane = x; throwStraight(v, ang); }

  // ---- input: drag the puck sideways, swipe up to slide ----
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TY), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
  function tablePoint(e) { const r = renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; }
  let drag = null;
  const onDown = e => { audio(); if (!localTurn() || charge != null || frameCard || done) return; const p = tablePoint(e); drag = { id: e.pointerId, p0: p, lane0: lane, z0: laneZ, s: [[e.clientX, e.clientY, performance.now()]] }; try { renderer.domElement.setPointerCapture(e.pointerId); } catch (er) {} };
  const onMove = e => { if (!drag || drag.id !== e.pointerId) return; drag.s.push([e.clientX, e.clientY, performance.now()]); if (drag.s.length > 12) drag.s.shift(); const p = tablePoint(e); if (p && drag.p0) { lane = clamp(drag.lane0 + (p.x - drag.p0.x), -LANE, LANE); laneZ = clamp(drag.z0 + Math.max(0, p.z - drag.p0.z) * 0.6, Z0, TABLE.RELEASE - R); } sendAim(); };
  const onUp = e => { if (!drag || drag.id !== e.pointerId) return; const s = drag.s, now = performance.now(); drag.s.push([e.clientX, e.clientY, now]); let a = s[s.length - 1]; for (let i = s.length - 1; i >= 0; i--) { a = s[i]; if (now - s[i][2] > 90) break; }
    const b = s[s.length - 1], dt = Math.max(0.016, (b[2] - a[2]) / 1000), dy = a[1] - b[1], dx = b[0] - a[0], H = CH(), sp = dy / dt / H, travel = s[0][1] - b[1]; drag = null;
    if (sp > 0.7 && travel > 24 && localTurn()) { const v = clamp(0.35 + 1.05 * Math.pow(sp, 0.85), 0.6, 4.4), ang = clamp(-dx / Math.max(1, dy) * 0.3, -0.07, 0.07); throwStraight(v, ang); }
    else if (laneZ > Z0 + 0.001) laneZ = Z0; };
  renderer.domElement.addEventListener('pointerdown', onDown); renderer.domElement.addEventListener('pointermove', onMove); renderer.domElement.addEventListener('pointerup', onUp); renderer.domElement.addEventListener('pointercancel', () => { drag = null; laneZ = Z0; });
  // ---- hold-to-throw meter: the ghost walks down the table and back, let go where you want it to stop ----
  const CH_MIN = 0.9, CH_MAX = L + 0.35, CH_RATE = 1.7;
  const chargeD = t => { const span = CH_MAX - CH_MIN, q = (t * CH_RATE) % (2 * span); return CH_MIN + (q < span ? q : 2 * span - q); };
  function chargeStart() { audio(); if (!localTurn() || frameCard || done || charge != null) return; charge = { t: 0 }; emit(true); }
  function chargeEnd() { if (charge == null) return; const d = chargeD(charge.t); charge = null; chargeToneOff(); if (!localTurn()) return; const v = speedFor(laneZ, laneZ + d) * (1 + gauss() * 0.012); throwStraight(v, 0); }
  const keys = {};
  const onKey = e => { if (e.repeat && e.code === 'Space') { e.preventDefault(); return; } if (/^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || '')) return;
    const down = e.type === 'keydown';
    if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') { keys[e.code] = down; if (localTurn()) e.preventDefault(); }
    if (e.code === 'Space' && localTurn()) { e.preventDefault(); if (down) chargeStart(); else chargeEnd(); }
    if (down && e.code === 'KeyV') cycleView(); };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  function sendAim() { if (mode !== 'net' || !N) return; const c = curPlayer(); if (!c || !c.me) return; const t = performance.now(); if (t - lastAimSend < 90) return; lastAimSend = t; N.send('ev', { k: 'aim', fn: frame, n: throwN, x: +lane.toFixed(4), z: +laneZ.toFixed(4) }); }
  function cycleView() { if (phase === 'menu') return; view = { aim: 'end', end: 'top', top: 'aim', follow: 'end' }[view] || 'aim'; emit(true); }

  // ---- online (engine/duel-net.js; falls back to two tabs on one computer) ----
  const netCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; return k; };
  function members() { if (!net || !N) return []; const all = [{ id: N.id, j: net.j, ready: net.ready, playing: mode === 'net' && phase !== 'menu' && !done, me: true, name: net.name }, ...Object.entries(net.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, 5); }
  const hostId = () => { const m = members(); return m.length ? m[0].id : null; };
  function netOpen() { net = { st: 'menu', code: '', peers: {}, ready: false, j: 0, status: '', msg: '', ping: null, cfg: { target: 15, rule: 'table' } }; emit(true); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (!net) netOpen(); if (code.length < 4) { net.msg = 'Type the 4-letter room code from your friend.'; emit(true); return; }
    netLeave(true); Object.assign(net, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', ping: null }); lastSeen = {}; emit(true);
    const tok = net.tok = (net.tok || 0) + 1;
    const C = await connectNet({ game: 'shuffle', code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => recv(t, d, id), onStatus: s => { if (net) { net.status = s; emit(true); } } });
    if (!net || tok !== net.tok) { C.leave(); return; } N = C; hello(); try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(net.timer); net.timer = setInterval(tick, 1000); emit(true);
  }
  function netLeave(keep) { if (N) { try { N.send('ev', { k: 'bye' }); N.leave(); } catch (e) {} } N = null; if (net) { clearInterval(net.timer); net.tok = (net.tok || 0) + 1; } lastSeen = {}; if (mode === 'net' && !keep) toMenu();
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} if (!keep) net = null; emit(true); }
  function hello(to) { if (!N || !net) return; N.send('hi', { v: 1, j: net.j, ready: net.ready, cfg: net.cfg, playing: mode === 'net' && phase !== 'menu' && !done }, to); }
  function tick() { if (!N) return; N.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(lastSeen)) if (now - lastSeen[id] > 25000) gone(id); }
  function gone(id) { if (!net || !lastSeen[id]) return; delete lastSeen[id]; delete net.peers[id];
    const p = players.find(q => q.id === id); if (mode === 'net' && p && !done && !p.gone) { p.gone = true; flash = { txt: p.name + ' LEFT', col: '#ec3013', t: 2 }; const live = players.filter(q => !q.gone); if (live.length < 2) { endFrame(); if (!done) finish(live[0]); } else if (curPlayer() === p && phase === 'aim') { throwN++; beginTurn(); } placeFoxes(false); }
    emit(true); maybeStart(); }
  function recv(t, d, id) {
    if (!net || !N || !d) return; const now = performance.now(), known = !!lastSeen[id];
    if (t === 'hi') { lastSeen[id] = now; net.peers[id] = { ...(net.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (d.cfg && hostId() === id) net.cfg = { target: [11, 15, 21].includes(+d.cfg.target) ? +d.cfg.target : 15, rule: d.cfg.rule === 'every' ? 'every' : 'table' }; if (!known) setTimeout(() => hello(id), 0); emit(true); setTimeout(maybeStart, 0); return; }
    if (!known) return; lastSeen[id] = now;
    if (t === 'pg') { if (d.t != null) N.send('pg', { e: d.t }, id); else if (d.e != null) { net.ping = Math.max(1, Math.round(now - d.e)); } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { if (net.peers[id]) net.peers[id].ready = !!d.on; emit(true); setTimeout(maybeStart, 0); }
    else if (d.k === 'cfg') { if (hostId() === id) { net.cfg = { target: [11, 15, 21].includes(+d.target) ? +d.target : 15, rule: d.rule === 'every' ? 'every' : 'table' }; net.ready = false; for (const k in net.peers) net.peers[k].ready = false; emit(true); } }
    else if (d.k === 'start') netStart(d);
    else if (d.k === 'bye') gone(id);
    else if (mode === 'net' && !done) {
      const pl = players.find(q => q.id === id); if (!pl) return;
      if (d.k === 'aim') { if (d.fn === frame && d.n === throwN) { pl.aimX = clamp(+d.x || 0, -LANE, LANE); pl.aimZ = clamp(+d.z || Z0, Z0, TABLE.RELEASE); } }
      else if (d.k === 'throw') { pending = { ...d, from: id }; runPending(); }
      else if (d.k === 'sync' && Array.isArray(d.P) && (phase === 'slide' || phase === 'syncWait') && d.fn === frame && d.n === throwN) applySync(d.P);
    }
  }
  // a throw that arrives a moment before this phone reaches that turn waits here (frame + throw number must match)
  let pending = null;
  function runPending() { const d = pending, c = curPlayer(); if (!d || !c) return; if (d.fn < frame || (d.fn === frame && d.n < throwN)) { pending = null; return; }
    if (phase !== 'aim' || d.fn !== frame || d.n !== throwN || c.id !== d.from) return; pending = null; lane = clamp(+d.x || 0, -LANE, LANE); laneZ = clamp(+d.z || Z0, Z0, TABLE.RELEASE); throwPuck(lane, laneZ, +d.vx || 0, +d.vz || 0, true); }
  function applySync(P) {
    for (const [pid, owner, x, z, on] of P) { let p = pucks.find(q => q.id === pid); if (!p) { p = { id: pid, owner, x, z, vx: 0, vz: 0, alive: true, fall: null }; pucks.push(p); }
      p.x = x; p.z = z; p.vx = 0; p.vz = 0;
      if (on) { p.alive = true; p.fall = null; p.dead = false; } else if (z < FOUL && z <= L && Math.abs(x) <= W / 2) { p.alive = false; p.dead = true; } else if (!p.fall) p.fall = z > L ? 'end' : 'side'; }
    pucks = pucks.filter(p => P.some(q => q[0] === p.id)); afterSettle(); }
  function maybeStart() { if (!net || !N || net.st !== 'room' || hostId() !== N.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready)) return;
    const d = { k: 'start', ids: m.map(x => x.id), cfg: net.cfg, mid: Date.now() }; N.send('ev', d); netStart(d); }
  function netStart(d) { if (!net || !N || !Array.isArray(d.ids)) return; if (!d.ids.includes(N.id)) { net.msg = 'A game started without you. You join the next one.'; emit(true); return; }
    mode = 'net'; net.st = 'play'; net.ready = false; for (const k in net.peers) net.peers[k].ready = false; const ids = d.ids.slice(0, 5);
    setPlayers(ids.map((id, i) => ({ id, kind: id === N.id ? 'me' : 'net', name: COLS[i][0] })));
    startMatch({ target: [11, 15, 21].includes(+(d.cfg && d.cfg.target)) ? +d.cfg.target : 15, rule: d.cfg && d.cfg.rule === 'every' ? 'every' : 'table' }); placeFoxes(true); }
  function netReady() { if (!net || !N) return; net.ready = !net.ready; N.send('ev', { k: 'ready', on: net.ready }); emit(true); setTimeout(maybeStart, 0); }
  function netCfg(p) { if (!net || !N || hostId() !== N.id) return; net.cfg = { ...net.cfg, ...p }; net.ready = false; for (const k in net.peers) net.peers[k].ready = false; N.send('ev', { k: 'cfg', ...net.cfg }); emit(true); }

  // ---- public controls ----
  function startLocal({ kind = 'cpu', seats = [], target = 15, rule = 'table', level = 'medium' } = {}) {
    if (N) netLeave(); net = null; mode = kind;
    let list;
    if (kind === 'practice') list = [{ kind: 'me', name: 'YOU' }];
    else if (kind === 'cpu') { const n = clamp(seats.length || 1, 1, 4); list = [{ kind: 'me', name: 'YOU' }, ...CPU_FOXES.slice(0, n).map(f => ({ kind: 'cpu', ...f }))]; }
    else { const n = clamp(seats.length || 2, 2, 5); list = Array.from({ length: n }, (_, i) => ({ kind: i ? 'local' : 'me', name: COLS[i][0] })); }
    setPlayers(list); startMatch({ target, rule, level }); placeFoxes(true);
  }
  function toMenu() { mode = 'menu'; phase = 'menu'; done = null; frameCard = null; flash = null; charge = null; chargeToneOff(); order = []; clearPucks(); pucks = []; removeFoxes(); players = []; view = 'aim'; room.drawBoard([], 15, 0, null); demoFoxes(); emit(true); }
  function rematch() { if (mode === 'net') { if (!net.ready) netReady(); return; } const kind = mode; const seats = players.filter(p => !p.me); startLocal({ kind, seats: kind === 'cpu' ? seats : players, target: cfg.target, rule: cfg.rule, level: cfg.level }); }
  function continueFrame() { if (phase !== 'frameEnd' || done || mode === 'net') return; nextFrame(); }
  let demo = [];
  function demoFoxes() { for (const f of demo) scene.remove(f); demo = []; const a = cast.make('hope'), b = cast.make('noble'); [a, b].forEach((f, i) => { const box = new THREE.Box3().setFromObject(f), h = box.max.y - box.min.y || 2; f.scale.multiplyScalar(1.5 / h); f.position.set(i ? 0.95 : -0.95, 0, 1.4 + i * 0.6); f.rotation.y = i ? -Math.PI / 2 : Math.PI / 2; f.userData.mood = 'happy'; demo.push(f); });
    clearPucks(); pucks = [[0.1, L - 0.12, 1], [-0.15, L - 0.5, 0], [0.18, L - 0.95, 1], [-0.05, L + 0.02, 0]].map(([x, z, o], i) => ({ id: 1000 + i, owner: o ? 'dB' : 'dA', x, z, vx: 0, vz: 0, alive: true })); players = [{ id: 'dA', slot: 1 }, { id: 'dB', slot: 0 }]; pucks.forEach(puckMesh); players = []; }

  // ---- camera ----
  const camPos = new THREE.Vector3(0, 1.8, -1.3), camLook = new THREE.Vector3(0, TY, 2.4), tP = new THREE.Vector3(), tL = new THREE.Vector3();
  function camTarget(dt, tm) {
    const asp = CW() / Math.max(1, CH() - safe.top - safe.bottom), port = asp < 0.9; camera.fov = port ? 62 : 50;
    if (phase === 'menu') { const a = Math.sin(tm * 0.15) * 0.5; tP.set(Math.sin(a) * 2.2, 1.7, L / 2 - Math.cos(a) * 3.6 - 1.2); tL.set(0, TY, L / 2 + 0.6); return; }
    if (view === 'follow') { const mv = pucks.filter(p => p.alive && !p.fall).reduce((a, p) => (Math.abs(p.vz) + Math.abs(p.vx) > (a ? Math.abs(a.vz) + Math.abs(a.vx) : 0.02) ? p : a), null), z = mv ? mv.z : (pucks[pucks.length - 1] || { z: 2 }).z;
      const fz = clamp(z - (port ? 1.1 : 1.0), -1.2, L - (port ? 1.95 : 1.6)); tP.set(0, port ? 1.85 : 1.5, fz); tL.set(0, TY, Math.min(fz + 2.4, L - 0.2)); return; }
    if (view === 'end') { tP.set(0, port ? 2.15 : 1.75, L - (port ? 2.0 : 1.75)); tL.set(0, TY, L - 0.45); return; }
    if (view === 'top') { const vis = Math.max(120, CH() - safe.top - safe.bottom), tn = 2 * Math.tan(camera.fov * Math.PI / 360), d = Math.max(1.9 / (tn * vis / CH()), 1.05 / (tn * CW() / CH())); tP.set(0, TY + d, L - 0.72 - 0.01); tL.set(0, TY, L - 0.72); return; }
    if (port) { tP.set(0, 2.0, -1.35); tL.set(0, TY, 2.6); } else { tP.set(0, 1.75, -0.55); tL.set(0, TY, 2.7); }
  }

  // ---- loop ----
  let raf = 0, last = performance.now(), tm = 0, acc = 0, dead = false, tscale = 1;
  function frameLoop() {
    if (dead) return; raf = requestAnimationFrame(frameLoop); const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000) * tscale; last = now; tm += dt;
    const w = CW(), h = CH(); if (renderer.domElement.width !== Math.round(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(h * renderer.getPixelRatio())) renderer.setSize(w, h);
    // lane keys + held lane buttons
    const kd = (keys.ArrowLeft || keys.KeyA ? 1 : 0) - (keys.ArrowRight || keys.KeyD ? 1 : 0) + laneHold;   // world −x is screen right
    if (kd && localTurn() && charge == null) { lane = clamp(lane + kd * 0.32 * dt, -LANE, LANE); sendAim(); dirty = true; }
    if (charge != null) { charge.t += dt; chargeTone(chargeD(charge.t) / CH_MAX); dirty = true; }
    // physics
    if (phase === 'slide') { acc += dt; let moving = true, n = 0; while (acc >= STEP && n < 40 * tscale) { acc -= STEP; n++; moving = stepPhysics(pucks, (k, a, b, v) => { if (k === 'hit') { clack(v); if (curPlayer()) { a.knockFlag = a.knockFlag || a.owner !== curPlayer().id; b.knockFlag = b.knockFlag || b.owner !== curPlayer().id; } } else if (k === 'fall') thud(); }); }
      const sp = pucks.reduce((s, p) => s + (p.alive && !p.fall ? Math.abs(p.vx) + Math.abs(p.vz) : 0), 0); if (slideG && ac) slideG.gain.setTargetAtTime(prefs.sound ? clamp(sp * 0.05, 0, 0.12) : 0, ac.currentTime, 0.05);
      if (!moving) { settleT += dt; if (settleT > 0.35) { if (slideG && ac) slideG.gain.setTargetAtTime(0, ac.currentTime, 0.05); const c = curPlayer();
        if (mode === 'net' && c && !c.me) { phase = 'syncWait'; waitSync = 0; } else afterSettle(); } } dirty = true; }
    if (phase === 'syncWait') { waitSync += dt; if (waitSync > 5) afterSettle(); }
    if (phase === 'between') { settleT -= dt; if (settleT <= 0) beginTurn(); }
    if (phase === 'aim') { const c = curPlayer(); if (c && c.kind === 'cpu') { cpuT -= dt; if (cpuPlan) lane = damp(lane, cpuPlan.x, 4, dt); if (cpuT <= 0) cpuGo(c); } if (c && c.kind === 'net') { lane = damp(lane, c.aimX ?? 0, 10, dt); laneZ = damp(laneZ, c.aimZ ?? Z0, 10, dt); } }
    if (frameCard) { frameCard.t += dt; if (frameCard.t > (mode === 'net' ? 3.6 : 4.2) && !done) nextFrame(); }
    if (flash) { flash.t -= dt; if (flash.t <= 0) { flash = null; dirty = true; } }
    // pucks
    for (const p of pucks) { const m = puckMesh(p); if (p.fall) { p.sink = Math.min(1, (p.sink || 0) + dt * 3); if (p.vx || p.vz) { p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= 0.9; p.vz *= 0.9; } }
      if (p.dead) { m.visible = false; continue; } m.visible = true; const gx = p.fall === 'side' ? Math.sign(p.x) * (W / 2 + TABLE.GUT / 2) : p.x, gz = p.fall === 'end' ? Math.min(p.z, L + 0.16) : p.z;
      m.position.set(p.fall ? damp(m.position.x, gx, 10, dt) : p.x, TY + (p.fall ? -0.06 * smooth(0, 1, p.sink) : 0), p.fall ? damp(m.position.z, gz, 10, dt) : p.z); m.rotation.z = p.fall ? 0.2 * Math.sin(p.sink * 6) * (1 - p.sink) : 0;
      const gl = m.userData.glow || 0; m.scale.setScalar(1 + (phase === 'frameEnd' && gl ? 0.08 * (1 + Math.sin(tm * 6)) : 0)); }
    // the puck in hand + guides
    const c = curPlayer(), aiming = phase === 'aim' && !!c, handId = 'hand';
    let hm = puckMeshes.get(handId); if (aiming) { if (!hm || hm.userData.owner !== c.id) { if (hm) { scene.remove(hm); puckMeshes.delete(handId); } hm = puckMesh({ id: handId, owner: c.id }); hm.userData.owner = c.id; } hm.visible = true; hm.position.set(lane, TY, laneZ); } else if (hm) hm.visible = false;
    const showG = aiming && (c.kind === 'me' || c.kind === 'local'); aimLine.visible = showG; ringHi.visible = aiming; if (aiming) { ringHi.position.set(lane, TY + 0.002, laneZ); ringHi.material.opacity = 0.5 + 0.4 * Math.sin(tm * 5); }
    if (showG) { const zEnd = charge != null ? laneZ + chargeD(charge.t) : L; aimLine.scale.y = Math.max(0.01, zEnd - laneZ); aimLine.position.set(lane, TY + 0.003, (laneZ + zEnd) / 2); }
    ghost.visible = showG && charge != null && prefs.guide; if (ghost.visible) { const gz = laneZ + chargeD(charge.t); ghost.position.set(lane, TY + 0.004, Math.min(gz, L + 0.3)); const zv = zoneOf(gz); ghost.material.color.set(gz > L ? '#8a847e' : zv >= 3 ? '#ec3013' : zv === 2 ? '#38bdf8' : zv === 1 ? '#ffd23a' : '#ffffff'); }
    // foxes
    for (const p of players) { const f = p.fox; if (!f) continue; const u = f.userData, to = u.to || { x: f.position.x, z: f.position.z, ry: f.rotation.y }, dx = to.x - f.position.x, dz = to.z - f.position.z, d = Math.hypot(dx, dz), sp = d > 0.02 ? Math.min(2.2, d * 4) : 0;
      if (sp) { f.position.x += dx / d * Math.min(d, sp * dt); f.position.z += dz / d * Math.min(d, sp * dt); f.rotation.y = damp(f.rotation.y, Math.atan2(dx, dz), 10, dt); } else f.rotation.y = damp(f.rotation.y, to.ry, 6, dt);
      kit.animFox(f, dt, sp); u.push = Math.max(0, (u.push || 0) - dt * 1.6); const P = u.P; if (P && P.body && !u.chair) { P.body.rotation.x = 0.35 * Math.sin(Math.min(1, u.push) * Math.PI); if (P.arms && u.push > 0) { P.arms[1].rotation.x = -1.4 * Math.sin(u.push * Math.PI); } } }
    for (const f of demo) kit.animFox(f, dt, 0);
    // camera
    camTarget(dt, tm); const k = phase === 'menu' ? 1.5 : view === 'follow' ? 4 : 3; camPos.x = damp(camPos.x, tP.x, k, dt); camPos.y = damp(camPos.y, tP.y, k, dt); camPos.z = damp(camPos.z, tP.z, k, dt); camLook.x = damp(camLook.x, tL.x, k, dt); camLook.y = damp(camLook.y, tL.y, k, dt); camLook.z = damp(camLook.z, tL.z, k, dt);
    camera.position.copy(camPos); camera.lookAt(camLook); if (view === 'top' && phase !== 'menu') camera.layers.disable(1); else camera.layers.enable(1); camera.aspect = w / h; const off = (safe.top - safe.bottom) / 2; camera.setViewOffset(w, h, 0, -off, w, h); camera.updateProjectionMatrix();
    renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h); renderer.render(scene, camera);
    // END inset: the scoring end from straight above
    const mr = miniRect(); if (mr) { const hh = 0.5 * mr.h / mr.w; mini.left = -0.5; mini.right = 0.5; mini.top = hh; mini.bottom = -hh; mini.position.z = L + 0.2 - hh; mini.lookAt(0, TY, mini.position.z); mini.updateProjectionMatrix(); const y = h - mr.y - mr.h; renderer.setScissorTest(true); renderer.setScissor(mr.x, y, mr.w, mr.h); renderer.setViewport(mr.x, y, mr.w, mr.h); renderer.render(scene, mini); renderer.setScissorTest(false); }
    if (dirty) emit();
  }
  function miniRect() { if (phase === 'menu' || done || view === 'top' || view === 'end') return null; const w = CW(), h = CH(), port = h > w, mw = Math.round(port ? Math.min(92, w * 0.24) : Math.min(104, w * 0.13)), avail = h - safe.top - safe.bottom - 24, mh = Math.round(Math.min(mw * 2.4, avail)); if (mh < 90) return null; return { x: w - mw - Math.max(10, safe.right), y: safe.top + 12, w: mw, h: mh }; }

  // ---- HUD snapshot for the DC page ----
  function hud() {
    const c = curPlayer(), m = me(), live = phase !== 'menu', mr = miniRect();
    return { phase, mode, view, frame, target: cfg.target, rule: cfg.rule, level: cfg.level, guide: prefs.guide, sound: prefs.sound, practiceBest,
      players: players.map(p => ({ id: p.id, name: p.me && mode !== 'local' ? 'YOU' : p.name, col: p.col, colName: p.colName, score: p.score, left: live ? left(p) : 0, per: perPlayer, turn: !!c && c.id === p.id && (phase === 'aim' || phase === 'slide' || phase === 'syncWait'), kind: p.kind, me: !!p.me, gone: !!p.gone })),
      turn: c && /^(aim|slide|syncWait|between)$/.test(phase) ? { name: c.me && mode !== 'local' ? 'YOU' : c.name, col: c.col, kind: c.kind, line: c.line } : null, myTurn: localTurn(), charging: charge != null, chargeD: charge != null ? chargeD(charge.t) : 0, chargeZone: charge != null ? ZONE_NAME[zoneOf(laneZ + chargeD(charge.t))] || (laneZ + chargeD(charge.t) > L ? 'OFF THE END' : '') : '',
      flash: flash ? { txt: flash.txt, col: flash.col } : null, frameCard: frameCard ? { title: frameCard.title, frame: frameCard.frame, rows: frameCard.rows, canNext: !done } : null, done, say, mini: mr,
      throwsLeft: order.length - throwN, net: net ? { st: net.st, code: net.code, status: net.status, msg: net.msg, ping: net.ping, ready: net.ready, cfg: net.cfg, me: N ? N.id : null, host: hostId(), members: members().map((x, i) => ({ id: x.id, me: x.me, ready: !!x.ready, playing: !!x.playing, slot: i, name: COLS[i][0], col: COLS[i][1] })), full: !!N && members().length >= 5 && !members().some(x => x.me) } : null };
  }
  function emit(force) { dirty = false; const h = hud(), s = JSON.stringify(h); if (!force && s === lastHud) return; lastHud = s; onState(h); }
  const emitT = setInterval(() => { if (charge != null || phase === 'slide') emit(); }, 120);

  const ro = new ResizeObserver(() => { dirty = true; }); ro.observe(container);
  const onHide = () => { if (N) { try { N.send('ev', { k: 'bye' }); } catch (e) {} } }; addEventListener('pagehide', onHide);
  toMenu(); frameLoop();
  const rm = /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) { netOpen(); netJoin(rm[1]); }

  return {
    hud, startLocal, toMenu, rematch, continueFrame, chargeStart, chargeEnd, cycleView, setView(v) { view = v; emit(true); },
    lanePress(dir) { laneHold = dir; if (!dir) dirty = true; }, nudge(dir) { if (localTurn() && charge == null) { lane = clamp(lane + dir * 0.03, -LANE, LANE); sendAim(); emit(true); } },
    setPref(k, v) { prefs = { ...prefs, [k]: v }; try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} if (k === 'sound' && !v && slideG && ac) slideG.gain.value = 0; emit(true); },
    setSafe(top, bottom, l = 0, r = 0) { safe = { top, bottom, left: l, right: r }; dirty = true; },
    netOpen, netJoin, netCreate() { netJoin(netCode()); }, netLeave() { netLeave(false); }, netReady, netCfg, netClose() { netLeave(false); net = null; emit(true); },
    debug: () => ({ pucks, players, order, throwN, phase, frame }),
    testSpeed(k) { tscale = clamp(+k || 1, 0.25, 8); },
    testThrow(x, v, ang = 0) { if (!localTurn()) return false; lane = clamp(x, -LANE, LANE); laneZ = Z0; throwStraight(v, ang); return true; },   // console / automated tests
    destroy() { dead = true; cancelAnimationFrame(raf); clearInterval(emitT); netLeave(true); ro.disconnect(); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('pagehide', onHide); chargeToneOff(); try { ac && ac.close(); } catch (e) {} renderer.dispose(); renderer.domElement.remove(); },
  };
}
