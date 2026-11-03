// MERU 2.0 — s105: CLUSTER BUILDINGS · first pass (Ben s104h, roster MERU_CLUSTER_ROSTER.md, data L.CLUSTER_BUILDINGS).
// 24 buildings in the 4 skyline clusters. Outside: a DOOR SIGN over every glass entrance, a CROWN SIGN near the top of every tower (front +
// back face), a PYLON SIGN beside the two landmark entrances (Spire, Sail). Battle buildings look taken over: boarded door + lobby windows,
// red TAKEN OVER door sign, tape, robots or bandits at the door and the family member / manager waiting nearby (quiet until Ben's script).
// Own buildings: the WOODSHOP (plank shed, gable roof) and the TOWN DUMP (fenced yard, scrap, shed, skip).
// Inside (quick fade, like the castle keep): one LOBBY per building in a row far under the map (LY), front desk + its keeper, the
// building's sign on the back wall, lifts, and a few props by kind (hq sofas, news screens, relic cases, mailboxes, paintings, benches).
// Draws: signs 1 + exterior bins ≤4 + 2 roofs; lobbies 4 + 1 (only while you are in one).
import { makeRoomKit } from './meru2-roomkit.js';
import { save } from '../engine/save.js';
import { CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { CLUSTER_LINES, CLUSTER_EXTRAS, OFFICE_FLOORS } from './meru2-cluster-lines.js';
export function buildClusters({ THREE, scene, kit, cols, L, bases, touch, go, sayTo }) {
  const CB = L.CLUSTER_BUILDINGS || [], K = makeRoomKit({ THREE, touch });
  const EG = new THREE.Group(); EG.name = 'meruClusters'; scene.add(EG);
  const IG = new THREE.Group(); IG.name = 'meruClusterLobbies'; IG.visible = false;
  const POOLS = [], pool = (x, y, z, r, c, ry = null) => POOLS.push({ x, y, z, r, c, ry });   // s728r soft additive LIGHT POOLS (lab + back rooms), ONE merged mesh in IG scene.add(IG);
  const ext = K.Bin(), lob = K.Bin(), spots = [], OUT = [], ROOMS = [], FRM = {}, FOFF = /[?&]nofactory=1/.test(location.search);   // s133 FRM: door frames for worlds/meru2-factory.js · FOFF = the old static factory look
  const ACC = { garden: '#2f7d5a', pearl: '#2e4a6b', spire: '#5d6f82', deco: '#c9a24a' };
  const LOOK = { garden: ['#f3f2f2', '#2f7d5a', '#1e3d2f'], pearl: ['#e7e4dc', '#2e4a6b', '#16263c'], spire: ['#cbd5e1', '#5d6f82', '#334155'], deco: ['#e2d2b4', '#ec3013', '#7a1d2a'] };
  // ---------- sign atlas: 4 x 8 cells of 512 x 256 (0-23 the buildings, 24+ red battle doors, KEEP OUT, DANGER) ----------
  const atlas = document.createElement('canvas'); atlas.width = 2048; atlas.height = 2048; const g = atlas.getContext('2d'), CELLS = [];
  const cellOf = (kick, title, red) => { CELLS.push({ kick, title, red }); return CELLS.length - 1; };
  function drawCells() { g.clearRect(0, 0, 2048, 2048); CELLS.forEach((c, i) => { const x = (i % 4) * 512, y = Math.floor(i / 4) * 256, ink = '#201e1d', red = '#ec3013', white = '#f3f2f2';
    g.fillStyle = c.red ? red : ink; g.fillRect(x, y, 512, 256); g.fillStyle = c.red ? ink : red; g.fillRect(x, y, 20, 256);
    g.textBaseline = 'alphabetic'; let s = 30; g.font = `700 ${s}px Archivo, Helvetica, sans-serif`; const kw = g.measureText(c.kick).width; if (kw > 440) { s = Math.floor(30 * 440 / kw); g.font = `700 ${s}px Archivo, Helvetica, sans-serif`; }
    g.fillStyle = c.red ? ink : red; g.fillText(c.kick, x + 44, y + 62); g.fillStyle = white; g.fillRect(x + 44, y + 80, 440, 4);
    const T = c.title; g.font = '900 120px Archivo, Helvetica, sans-serif'; const tw = g.measureText(T).width;
    if (tw <= 440 * 1.6 || T.indexOf(' ') < 0) { const s2 = Math.min(120, Math.floor(120 * 440 / tw)); g.font = `900 ${s2}px Archivo, Helvetica, sans-serif`; g.fillText(T, x + 44, y + 160 + s2 * 0.36); }
    else { const w = T.split(' '), cut = Math.ceil(w.length / 2), a = w.slice(0, cut).join(' '), b = w.slice(cut).join(' '); g.font = '900 80px Archivo, Helvetica, sans-serif'; const m = Math.max(g.measureText(a).width, g.measureText(b).width), s2 = Math.min(80, Math.floor(80 * 440 / m));
      g.font = `900 ${s2}px Archivo, Helvetica, sans-serif`; g.fillText(a, x + 44, y + 108 + s2 * 0.8); g.fillText(b, x + 44, y + 108 + s2 * 1.85); } }); tex.needsUpdate = true; }
  const tex = new THREE.CanvasTexture(atlas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const signM = new THREE.MeshBasicMaterial({ map: tex, color: 0xe8e8e8 });
  function Quads() { const P = [], U = [], I = []; return { add(cx, cy, cz, ry, w, h, ci) { const c = Math.cos(ry), s = Math.sin(ry), u0 = (ci % 4) / 4, v0 = 1 - (Math.floor(ci / 4) + 1) / 8, u1 = u0 + 0.25, v1 = v0 + 0.125, n = P.length / 3;
      for (const [lx, ly, uu, vv] of [[-w / 2, -h / 2, u0, v0], [w / 2, -h / 2, u1, v0], [w / 2, h / 2, u1, v1], [-w / 2, h / 2, u0, v1]]) { P.push(cx + lx * c, cy + ly, cz - lx * s); U.push(uu, vv); } I.push(n, n + 1, n + 2, n, n + 2, n + 3); },
    mesh(parent) { if (!P.length) return null; const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); G.setIndex(I); G.computeBoundingSphere(); const m = new THREE.Mesh(G, signM); parent.add(m); return m; } }; }
  const qOut = Quads(), qIn = Quads(), KEEP = cellOf('BY ORDER OF THE BANDITS', 'KEEP OUT', true), DANGER = cellOf('ROBOTS GONE WILD', 'DANGER', true);
  // ---------- helpers ----------
  let veil = null, busy = false, toastS = '', toastT = 0;
  const toast = (s, t = 3) => { toastS = s; toastT = t; };
  const fade = fn => { if (busy) return; busy = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity 0.26s', zIndex: '40' }); document.body.appendChild(veil); }
    requestAnimationFrame(() => { veil.style.opacity = '1'; }); setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; busy = false; }, 140); } }, 290); };
  // s106 LINES: one box with choices (keepers: YES, PUT ME TO WORK! first · GOODBYE last); repeat visits vary
  const seen = {};
  const voice = (f, key, name, role, x, z, r, keeper) => { const LN = CLUSTER_LINES[key]; if (!LN || !sayTo) return; const T = { key, obj: f, name, role, r };
    spots.push({ key: 'cl:talk:' + key, x, z, r, prompt: 'TALK \u00b7 ' + name.toUpperCase(), use: () => { const n = seen[key] = (seen[key] || 0) + 1, ln = text => ({ who: key, role: role.toUpperCase(), text });
      if (LN.say) { sayTo(T, [ln(LN.say[(n - 1) % LN.say.length])]); return; }
      const hi = n === 1 || LN.hello.length < 2 ? LN.hello[0] : LN.hello[1 + (n - 2) % (LN.hello.length - 1)];
      const ch = [...(keeper && LN.work ? [{ text: CHOICE_WORK, pick: () => sayTo(T, [ln(LN.work)]) }] : []), ...(LN.fight ? [{ text: "I'LL TAKE IT BACK", pick: () => sayTo(T, [ln(LN.fight)], () => { if (LN.toast) toast(LN.toast, 3); }) }] : []),
        ...LN.ask.map(([q, a]) => ({ text: q, pick: () => sayTo(T, [ln(a)]) })), { text: CHOICE_BYE, bye: true, pick: () => {} }];
      sayTo(T, [{ ...ln(hi), choices: ch }]); } }); };
  const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const frameOf = D => { const cs = Math.cos(D.ry), sn = Math.sin(D.ry); return (lx, lz) => [D.x + lx * cs + lz * sn, D.z - lx * sn + lz * cs]; };
  const fox = (key, name, role, opt, x, y, z, ry, parent) => { const f = kit.makeFox({ key, name, gear: 'none', crest: '', mood: 'neutral', ...opt }); f.position.set(x, y, z); f.rotation.y = ry; (parent || scene).add(f); f.userData.rosterShop = role; return f; };
  const robot = (x, z, ry, s = 1) => { const c = Math.cos(ry), sn = Math.sin(ry), P = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
    const b = (k, col, w, h, d, lx, y, lz) => { const [wx, wz] = P(lx * s, lz * s); ext.box(k, col, w * s, h * s, d * s, wx, y * s, wz, ry); };
    for (const sx of [-0.42, 0.42]) b('mat', '#24282c', 0.26, 0.5, 0.95, sx, 0.25, 0); b('gls', '#6b737b', 0.9, 1.0, 0.62, 0, 1.0, 0); b('gls', '#ec3013', 0.92, 0.1, 0.64, 0, 1.36, 0);
    for (const sx of [-0.56, 0.56]) b('gls', '#5d636b', 0.18, 0.75, 0.2, sx, 1.05, 0.05); b('gls', '#8a9099', 0.62, 0.44, 0.52, 0, 1.78, 0); b('glo', '#ff3b1f', 0.48, 0.1, 0.04, 0, 1.82, 0.27); b('mat', '#24282c', 0.04, 0.4, 0.04, 0.2, 2.18, 0);
    cols.push({ c: [x, z, 0.6 * s] }); };
  const lobBot = (B, x, z, ry) => { const c = Math.cos(ry), sn = Math.sin(ry), b = (k, col, w, h, d, lx, y, lz) => B(k, col, w, h, d, x + lx * c + lz * sn, y, z - lx * sn + lz * c, ry);
    for (const sx of [-0.42, 0.42]) b('mat', '#24282c', 0.26, 0.5, 0.95, sx, 0.25, 0); b('gls', '#6b737b', 0.9, 1.0, 0.62, 0, 1.0, 0); b('gls', '#2e86b8', 0.92, 0.1, 0.64, 0, 1.36, 0);
    for (const sx of [-0.56, 0.56]) b('gls', '#5d636b', 0.18, 0.75, 0.2, sx, 1.05, 0.05); b('gls', '#8a9099', 0.62, 0.44, 0.52, 0, 1.78, 0); b('glo', '#3fd3ff', 0.48, 0.1, 0.04, 0, 1.82, 0.27); b('mat', '#24282c', 0.04, 0.4, 0.04, 0.2, 2.18, 0); };
  const tape = (W, w0, w1, lz, y) => { const n = Math.max(2, Math.round((w1 - w0) / 0.6)); for (let i = 0; i < n; i++) { const a = w0 + (w1 - w0) * i / n, b2 = w0 + (w1 - w0) * (i + 1) / n, [x, z] = W((a + b2) / 2, lz); ext.box('glo', i % 2 ? '#f3f2f2' : '#ec3013', (b2 - a), 0.1, 0.03, x, y, z, W.ry); } };
  // ---------- resolve every building: its door frame (D) + footprint ----------
  const byKey = {}; for (const b of bases) if (b.cb) byKey[b.cb] = b;
  CB.forEach((c, i) => { c.cell = cellOf(c.kick, c.title, false); });
  const battleCell = {}; CB.filter(c => c.battle).forEach(c => { battleCell[c.key] = cellOf(c.title, 'TAKEN OVER', true); });
  drawCells(); if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('900 80px Archivo'), document.fonts.load('700 30px Archivo')]).then(drawCells).catch(() => {});
  const LY = -150, LZ = -1600, LX0 = -330, LS = 28, RW = 20, RD = 20;
  let nLobby = 0;
  for (const c0 of CB) {   // s130: once the SALT BUILDING battle is won (flag saltBuildingCleared) it is a normal tower: lobby, the Salt Cousin keeps the desk, 2 staff (lobby slot 40, so no other room moves)
    const c = c0.battle === 'salt' && save.flag('saltBuildingCleared') ? { ...c0, battle: null, kind: 'hq', keeper: ['saltCousinIn', 'Salt Cousin', 'Salt Building'], lobbyAt: 40 } : c0.battle === 'pepper' && save.flag('pepperBuildingCleared') ? { ...c0, battle: null, kind: 'hq', keeper: ['pepperCousinIn', 'Pepper Cousin', 'Pepper Building'], lobbyAt: 42 } : c0.battle === 'factory' && save.flag('robotFactoryCleared') ? { ...c0, battle: null, kind: 'hq', keeper: ['mfForemanIn', 'Foreman', 'Robot Factory'], lobbyAt: 45 } : c0;   // s133: the ROBOT FACTORY once Maker Prime is down (slot 45; Machine Fleet HQ back room = slot 46)   // s132: the PEPPER BUILDING the same way (slot 42; Pepper HQ back room = slot 43)
    let D = null, b = null;
    if (c.own) { const [x, z] = L.skyShift(c.at[0], c.at[1]), F = FACE[c.face], half = F[0] ? c.own.w / 2 : c.own.d / 2; D = { x: x + F[0] * half, z: z + F[1] * half, fx: F[0], fz: F[1], ry: Math.atan2(F[0], F[1]), lm: false, half, cx: x, cz: z }; }
    else { b = byKey[c.key]; if (!b || !b.doorAt) { console.warn('cluster building without a tower', c.key); continue; } D = { ...b.doorAt, cx: b.x, cz: b.z }; }
    const W = frameOf(D); W.ry = D.ry; c.D = D; if (b) c.BT = { x: b.x, z: b.z, w: b.w, d: b.d, h: b.h }; FRM[c0.key] = { D, BT: c.BT };
    if (b) {   // ---- tower signs ----
      const big = b.h >= 150, pod = !big && b.w > 19 && b.h > 30 ? 4 : 0, lzT = -pod / 2, faceW = (D.fx ? b.d : b.w) - pod;
      const DH = D.lm ? 5.6 : 4.2, dsw = D.lm ? 8 : 4.4, dsy = DH + 0.9 + 0.3 + dsw / 4 + 0.4;
      { const [x, z] = W(0, (pod ? lzT : 0) + 0.16); qOut.add(x, dsy, z, D.ry, dsw, dsw / 2, c.battle ? battleCell[c.key] : c.cell); }
      if (big) { for (const s of [1]) { const [x, z] = W(-13 * s, 6); for (const sx of [-3.4, 3.4]) { const [px, pz] = W(-13 * s + sx, 6); ext.box('mat', '#201e1d', 0.3, 10.4, 0.3, px, 5.2, pz, D.ry); cols.push({ c: [px, pz, 0.35] }); }
          qOut.add(x, 8, z + 0, D.ry, 8, 4, c.cell); const [bx, bz] = W(-13 * s, 5.84); qOut.add(bx, 8, bz, D.ry + Math.PI, 8, 4, c.cell); ext.box('mat', '#201e1d', 8.4, 4.4, 0.1, ...((p => [p[0], 8, p[1]])(W(-13 * s, 5.92))), D.ry); } }
      else if (b.h >= 30) { const sw = Math.min(faceW * 0.8, 18), sh = sw / 2, y = b.h - sh / 2 - 2.5, off = (D.half - pod / 2) + 0.2;
        qOut.add(D.cx + D.fx * off, y, D.cz + D.fz * off, D.ry, sw, sh, c.cell); qOut.add(D.cx - D.fx * off, y, D.cz - D.fz * off, D.ry + Math.PI, sw, sh, c.cell); }
      if (c.battle) {   // ---- taken over: boards, tape, keep-out sign, guards at the door, a worried fox nearby ----
        const DW = D.lm ? 8 : 4.4;
        for (const r of [0.62, -0.62]) { const [x, z] = W(0, 0.32); ext.box('mat', '#8b6a48', DW + 0.8, 0.32, 0.08, x, DH / 2, z, D.ry, 0, r); }
        for (const yy of [1.0, 3.0]) { const [x, z] = W(0, 0.24); ext.box('mat', '#a77b4f', DW + 0.6, 0.3, 0.08, x, yy, z, D.ry); }
        const lim = (D.fx ? b.d : b.w) / 2 - 1.6; for (let lx = -lim; lx <= lim; lx += 3.1) { if (Math.abs(lx) < DW / 2 + 1.4) continue; const [x, z] = W(lx, 0.14); ext.box('mat', '#9a7a52', 2.5, 1.9, 0.08, x, 2.4, z, D.ry); const [x2, z2] = W(lx, 0.2);
          for (const r of [0.65, -0.65]) ext.box('mat', '#6b4a32', 2.9, 0.22, 0.06, x2, 2.4, z2, D.ry, 0, r); }
        { const [x, z] = W(0, 0.42); qOut.add(x, 2.2, z, D.ry, 2.4, 1.2, c.battle === 'factory' || c.battle === 'pearl' ? DANGER : KEEP); }
        tape(W, -DW / 2 - 2.2, DW / 2 + 2.2, 1.6, 1.0); for (const sx of [-DW / 2 - 2.2, DW / 2 + 2.2]) { const [x, z] = W(sx, 1.6); ext.box('mat', '#201e1d', 0.12, 1.1, 0.12, x, 0.55, z, D.ry); cols.push({ c: [x, z, 0.2] }); }
        const robots = c.battle === 'factory' || c.battle === 'pearl';
        for (const s of [-1, 1]) { const [x, z] = W(s * (DW / 2 + 1.4), 3.2); if (robots) { if (c.battle === 'pearl' || FOFF) robot(x, z, D.ry); } else { const f = fox(c.battle + 'Bandit' + (s < 0 ? 0 : 1), 'Bandit', c.title + ' (taken over)', { outfit: 'coat', torso: ['#201e1d', '#3d3b3a', '#111111'], gear: 'sword', mood: 'stern' }, x, 0, z, D.ry); OUT.push(f); cols.push({ c: [x, z, 0.45] }); } }
        if (c.battle === 'factory' && FOFF) { for (const s of [-1, 1]) { const [x, z] = W(s * 9, 9); robot(x, z, D.ry + s * 0.5); const [bx, bz] = W(s * 7.5, 6.5); for (let k = 0; k < 4; k++) { const [x2, z2] = W(s * 7.5 + (k - 1.5) * 1, 6.5); ext.box('gls', k % 2 ? '#f3f2f2' : '#ec3013', 1, 0.34, 0.4, x2, 0.9, z2, D.ry); }
            for (const sx of [-1.8, 1.8]) { const [x3, z3] = W(s * 7.5 + sx, 6.5); ext.box('mat', '#3d3b3a', 0.14, 1.1, 0.7, x3, 0.55, z3, D.ry); } cols.push({ c: [bx, bz, 2.1] });
            const [cx2, cz2] = W(s * 11.5, 4); ext.box('mat', '#8b6a48', 1.1, 1.1, 1.1, cx2, 0.55, cz2, D.ry + 0.4); ext.box('mat', '#8b6a48', 1, 1, 1, cx2 + 0.3, 1.6, cz2 - 0.2, D.ry + 0.9); cols.push({ c: [cx2, cz2, 0.9] }); } }
        if (c.talker) { const [k, nm, role] = c.talker, sd = (D.fx ? b.d : b.w) / 2 + (c.battle === 'factory' ? 10 : 5), [x, z] = W(-sd, 6), [dx, dz] = W(0, 2); const f = fox(k, nm, role, { outfit: c.battle === 'factory' ? 'coat' : c.cl === 'deco' ? 'vest' : 'suit', torso: c.battle === 'factory' ? ['#facc15', '#4b5563', '#1f2937'] : LOOK[c.cl], mood: 'neutral' }, x, 0, z, Math.atan2(dx - x, dz - z)); OUT.push(f); cols.push({ c: [x, z, 0.45] }); voice(f, k, nm, role, x, z, 2.6, false); }
        if (c.battle === 'salt') spots.push({ key: 'cl:battle:' + c.key, x: W(0, 2.4)[0], z: W(0, 2.4)[1], r: 2.4, prompt: 'BATTLE \u00b7 SALT BUILDING \u00b7 TAKE IT BACK', play: { label: 'Salt Building', url: 'Salt Building.dc.html?embed=1' } });   // s130: the battle map (worlds/salt-building.js)
        else if (c.battle === 'pepper') spots.push({ key: 'cl:battle:' + c.key, x: W(0, 2.4)[0], z: W(0, 2.4)[1], r: 2.4, prompt: 'BATTLE \u00b7 PEPPER BUILDING \u00b7 TAKE IT BACK', play: { label: 'Pepper Building', url: 'Pepper Building.dc.html?embed=1' } });   // s132: worlds/pepper-building.js
        else if (c.battle !== 'pearl' && !(c.battle === 'factory' && !FOFF)) spots.push({ key: 'cl:battle:' + c.key, x: W(0, 2.4)[0], z: W(0, 2.4)[1], r: 2.4, prompt: c.title + ' \u00b7 TAKEN OVER', use: () => toast(c.battle === 'factory' ? 'ROBOTS GONE WILD \u00b7 STREET BATTLE COMING NEXT' : 'BANDITS INSIDE \u00b7 BATTLE MAP COMING NEXT', 3) });
        continue; }
    }
    if (c.own && c.kind === 'wood') {   // ---- WOODSHOP: plank shed, gable roof, double doors, windows, log pile ----
      const { w, d, h } = c.own, cx = D.cx, cz = D.cz;
      ext.box('mat', '#8b6a48', w, h, d, cx, h / 2, cz); ext.box('mat', '#5a3d26', w + 0.2, 0.3, d + 0.2, cx, 0.15, cz);
      for (let k = -w / 2 + 1; k < w / 2; k += 1.4) { const [x, z] = W(k, 0.04); ext.box('mat', '#6b4a32', 0.08, h, 0.06, x, h / 2, z, D.ry); }
      { const [x, z] = W(0, 0.1); ext.box('mat', '#201e1d', 2.6, 2.9, 0.12, x, 1.45, z, D.ry); for (const sx of [-0.62, 0.62]) { const [dx, dz] = W(sx, 0.16); ext.box('mat', '#5a3d26', 1.16, 2.7, 0.08, dx, 1.35, dz, D.ry); } }
      for (const sx of [-w / 2 + 2.4, w / 2 - 2.4]) { const [x, z] = W(sx, 0.1); ext.box('mat', '#201e1d', 1.9, 1.3, 0.1, x, 2.2, z, D.ry); const [x2, z2] = W(sx, 0.14); ext.box('glo', '#ffe1a8', 1.6, 1.0, 0.04, x2, 2.2, z2, D.ry); }
      { const [x, z] = W(0, 0.2); qOut.add(x, 3.75, z, D.ry, 3.4, 1.7, c.cell); }
      for (let k = 0; k < 7; k++) { const [x, z] = W(w / 2 + 1.6, -d / 2 + 2 + (k % 3) * 0.7); ext.cyl('mat', '#7a5236', 0.32, 2.4, x, 0.32 + Math.floor(k / 3) * 0.55, z, 8, 0, Math.PI / 2, 1, D.ry + Math.PI / 2); }
      { const [x, z] = W(w / 2 + 1.6, -d / 2 + 2.7); cols.push({ c: [x, z, 1.4] }); }
      { const roof = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 3), new THREE.MeshLambertMaterial({ color: 0x7a4a33 })); roof.rotation.set(-Math.PI / 2, D.ry + Math.PI / 2, 0, 'YXZ'); roof.scale.set((d / 2 + 0.7) / 0.866, w + 0.8, 2.0); roof.position.set(cx, h + 1.0, cz); roof.castShadow = !touch; EG.add(roof); }
    }
    if (c.own && c.kind === 'dump') {   // ---- TOWN DUMP: fenced yard (gate on the door face), scrap piles, shed, skip ----
      const { w, d, h } = c.own, cx = D.cx, cz = D.cz, R0 = Math.random;
      const Wc = (lx, lz) => [cx + lx * Math.cos(D.ry) + lz * Math.sin(D.ry), cz - lx * Math.sin(D.ry) + lz * Math.cos(D.ry)], fw = D.fx ? d : w, fd = D.fx ? w : d;   // local: z = toward the gate
      const fence = (x0, z0, x1, z1, gap) => { const len = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(len / 2.4); for (let i = 0; i < n; i++) { const a = i / n, b2 = (i + 1) / n, mx = (a + b2) / 2, lxm = x0 + (x1 - x0) * mx, lzm = z0 + (z1 - z0) * mx; if (gap && Math.abs(lxm) < 2.6 && Math.abs(lzm - fd / 2) < 0.1) continue;
          const [px, pz] = Wc(x0 + (x1 - x0) * a, z0 + (z1 - z0) * a); ext.box('mat', '#3d3b3a', 0.14, h + 0.2, 0.14, px, (h + 0.2) / 2, pz); const [qx, qz] = Wc(lxm, lzm); ext.box('mat', '#4f5d2f', len / n - 0.1, h - 0.2, 0.06, qx, h / 2, qz, D.ry + (Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 0 : Math.PI / 2)); } };
      fence(-fw / 2, -fd / 2, fw / 2, -fd / 2); fence(-fw / 2, fd / 2, fw / 2, fd / 2, true); fence(-fw / 2, -fd / 2, -fw / 2, fd / 2); fence(fw / 2, -fd / 2, fw / 2, fd / 2);
      for (const s of [-1, 1]) { const [x, z] = Wc(s * 3.8, fd / 2 + 1.0); ext.box('mat', '#4f5d2f', 2.4, h - 0.2, 0.06, x, h / 2, z, D.ry + s * 1.1); }
      { const [x, z] = Wc(-4.6, fd / 2 + 0.3); for (const sx of [-1.6, 1.6]) { const [px, pz] = Wc(-4.6 + sx, fd / 2 + 0.3); ext.box('mat', '#201e1d', 0.14, 3.6, 0.14, px, 1.8, pz); } qOut.add(x, 3.3, z, D.ry, 3.6, 1.8, c.cell); }
      const SCR = ['#6b6f75', '#8a5a3a', '#5d636b', '#a33a2a', '#c9c2b0', '#3d3b3a'];
      for (let p = 0; p < 6; p++) { const lx = -fw / 2 + 3 + (p % 3) * (fw - 6) / 2, lz = -fd / 2 + 3 + Math.floor(p / 3) * 4.2; for (let k = 0; k < 9; k++) { const [x, z] = Wc(lx + (R0() - 0.5) * 3, lz + (R0() - 0.5) * 2.4), s = 0.5 + R0() * 0.9;
          if (k % 3) ext.box('mat', SCR[(R0() * SCR.length) | 0], s * 1.4, s * 0.7, s, x, s * 0.35 + (k > 5 ? 0.6 : 0), z, R0() * 3, R0() * 0.4, R0() * 0.4); else ext.sph('mat', SCR[(R0() * SCR.length) | 0], s * 0.7, x, s * 0.4, z, 0.7); } }
      { const [x, z] = Wc(fw / 2 - 3.4, -fd / 2 + 2.6); ext.box('mat', '#c9c2b0', 5, 3, 4, x, 1.5, z, D.ry); ext.box('mat', '#3d3b3a', 5.4, 0.2, 4.4, x, 3.1, z, D.ry); const [dx, dz] = Wc(fw / 2 - 3.4, -fd / 2 + 4.62); ext.box('mat', '#201e1d', 1.2, 2.2, 0.06, dx, 1.1, dz, D.ry); }
      { const [x, z] = Wc(fw / 2 - 2.4, fd / 2 - 2.4); ext.box('gls', '#2e5a3a', 2.6, 1.4, 1.6, x, 0.8, z, D.ry); ext.box('mat', '#24282c', 2.8, 0.12, 1.8, x, 1.56, z, D.ry); }
      { const [x, z] = Wc(6.2, fd / 2 + 4.2); ext.box('gls', '#2e5a3a', 2.4, 2.4, 6.4, x, 1.6, z, D.ry + Math.PI / 2); ext.box('gls', '#f3f2f2', 2.3, 1.9, 2.0, ...((q => [q[0], 1.4, q[1]])(Wc(9.6, fd / 2 + 4.2))), D.ry + Math.PI / 2); for (const sx of [3.6, 7.0, 9.8]) for (const sz of [-1.1, 1.1]) { const [tx, tz] = Wc(sx, fd / 2 + 4.2 + sz); ext.cyl('mat', '#201e1d', 0.5, 0.36, tx, 0.5, tz, 10, Math.PI / 2, 0, 1, D.ry); } cols.push({ c: [x, z, 1.6] }, { c: Wc(9.6, fd / 2 + 4.2).concat(1.4) }); }
      const [kx, kz] = Wc(-1.5, fd / 2 + 2.6), [k, nm, role] = c.keeper; const f = fox(k, nm, role, { outfit: 'vest', torso: ['#facc15', '#4b5563', '#1f2937'], mood: 'warm' }, kx, 0, kz, D.ry); f.userData.rosterRole = 'keeper'; OUT.push(f); cols.push({ c: [kx, kz, 0.45] }); voice(f, k, nm, role, kx, kz, 2.6, true);
      for (const [ek, en, er, tier] of CLUSTER_EXTRAS[c.key] || []) { const [ex, ez] = tier === 'talker' ? Wc(-fw / 2 + 4.5, fd / 2 - 1.6) : Wc(4, fd / 2 + 7.4), [lx, lz] = Wc(0, fd / 2 + 3);
        const e = fox(ek, en, er, { outfit: tier === 'talker' ? 'coat' : 'vest', torso: tier === 'talker' ? ['#8a8f96', '#4b5563', '#2a2d31'] : ['#facc15', '#4b5563', '#1f2937'], mood: 'neutral' }, ex, 0, ez, Math.atan2(lx - ex, lz - ez)); OUT.push(e); cols.push({ c: [ex, ez, 0.45] }); voice(e, ek, en, er, ex, ez, 2.6, false); }
      continue; }
    // ---- the LOBBY (quick fade) ----
    const i = c.lobbyAt ?? nLobby++, OX = LX0 + i * LS, RH = c.kind === 'wood' ? 4.6 : 6, acc = ACC[c.cl] || '#ec3013', Y = LY;
    const ib = (a0, a1, c0, c1) => cols.push({ f: [OX + a0, OX + a1, LZ + c0, LZ + c1], y0: LY - 3, y1: LY + 12 }), ir = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
    const B = (k, col, w, h, d, x, y, z, ry = 0, rx = 0, rz = 0) => lob.box(k, col, w, h, d, OX + x, Y + y, LZ + z, ry, rx, rz);
    const floor = { hq: '#d8d2c6', news: '#3a3f47', relic: '#6b4a32', apt: '#bfb6a6', gallery: '#ecebe8', office: '#9aa0a6', wood: '#8a6440' }[c.kind] || '#cfc9bf', wall = c.kind === 'wood' ? '#a77b4f' : c.kind === 'news' ? '#d9d4cc' : '#efece6';
    B('mat', floor, RW, 0.1, RD, 0, -0.05, 0); B('mat', '#d9d4cc', RW, 0.3, RD, 0, RH + 0.15, 0);
    B('mat', wall, RW, RH, 0.3, 0, RH / 2, -RD / 2); ib(-RW / 2, RW / 2, -RD / 2 - 0.15, -RD / 2 + 0.15);
    for (const s of [-1, 1]) { B('mat', wall, 0.3, RH, RD, s * RW / 2, RH / 2, 0); ib(s * RW / 2 - 0.15, s * RW / 2 + 0.15, -RD / 2, RD / 2); const pw = (RW - 3.2) / 2; B('mat', wall, pw, RH, 0.3, s * (1.6 + pw / 2), RH / 2, RD / 2); ib(s > 0 ? 1.6 : -RW / 2, s > 0 ? RW / 2 : -1.6, RD / 2 - 0.15, RD / 2 + 0.15); }
    B('mat', wall, 3.2, RH - 3.4, 0.3, 0, 3.4 + (RH - 3.4) / 2, RD / 2); ib(-1.6, 1.6, RD / 2 - 0.1, RD / 2 + 0.4);
    for (const sx of [-0.78, 0.78]) B('glass', '#bcd4e6', 1.5, 3.3, 0.06, sx, 1.65, RD / 2 - 0.05); B('gls', '#d7ad52', 3.4, 0.14, 0.12, 0, 3.4, RD / 2 - 0.12); for (const sx of [-1.66, 1.66]) B('gls', '#d7ad52', 0.12, 3.4, 0.12, sx, 1.7, RD / 2 - 0.12);
    B('mat', '#201e1d', 2.4, 0.02, RD / 2 + 5.6, 0, 0.01, RD / 4 - 2.8); B('mat', acc, 2.0, 0.025, RD / 2 + 5.4, 0, 0.012, RD / 4 - 2.8);
    // front desk + keeper + back-wall sign
    B('mat', acc, 5.4, 1.05, 0.9, 0, 0.525, -6); B('gls', '#201e1d', 5.8, 0.08, 1.1, 0, 1.09, -6); B('glo', '#9fc4e0', 0.6, 0.4, 0.04, 1.6, 1.4, -6.3, Math.PI); B('mat', '#201e1d', 0.5, 0.06, 0.3, 1.6, 1.16, -6.3); ib(-2.9, 2.9, -6.55, -5.45);
    qIn.add(OX, Y + (RH > 5 ? 4.2 : 3.0), LZ - RD / 2 + 0.17, 0, RH > 5 ? 5 : 4.4, RH > 5 ? 2.5 : 2.2, c.cell);
    B('gls', '#d7ad52', RW - 0.4, 0.1, 0.05, 0, RH - 0.5, -RD / 2 + 0.17);
    const [kk, kn, kr] = c.keeper || ['', 'Keeper', c.title], look = c.kind === 'relic' ? { outfit: 'robe', torso: ['#7a5236', '#d7ad52', '#3d2a1c'] } : c.kind === 'wood' ? { outfit: 'vest', torso: ['#d6c3a0', '#7a5236', '#3d2a1c'] } : c.kind === 'news' ? { outfit: 'coat', torso: LOOK[c.cl] } : { outfit: 'suit', torso: LOOK[c.cl] };
    const keeper = fox(kk, kn, kr, { ...look, mood: 'warm' }, OX, Y, LZ - 7.4, 0, IG); keeper.userData.rosterRole = 'keeper'; ir(0, -7.4, 0.45); voice(keeper, kk, kn, kr, OX, LZ - 5, 2.4, true);
    // s106b the roster's talkers / greeters / crowd in the lobby (walkway x 0 stays clear)
    const EX = []; { const SP = { talker: [[-6.5, -1.5], [6.8, -4.6]], greeter: [[3.4, 7.2], [-3.4, 7.2], [6.6, 6.4]], crowd: [[-4.4, -3.2], [4.4, -3.2]], bot: [[-3.4, 7.2]] }, used = { talker: 0, greeter: 0, crowd: 0, bot: 0 };
      const CROWD = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#4f7d3a', '#e2d2b4', '#2a3d20']];
      for (const [ek, en, er, tier] of CLUSTER_EXTRAS[c.key] || []) { if (CLUSTER_LINES[ek] && CLUSTER_LINES[ek].movedTo) continue; const p = SP[tier] && SP[tier][used[tier]++]; if (!p) continue; const [x, z] = p, ry = Math.atan2(0 - x, 1 - z);
        if (tier === 'bot') { const o = new THREE.Object3D(); o.position.set(OX + x, Y, LZ + z); o.rotation.y = ry; IG.add(o); lobBot(B, x, z, ry); ir(x, z, 0.6); voice(o, ek, en, er, OX + x, LZ + z, 2.4, false); continue; }
        const lk = tier === 'talker' ? { outfit: c.kind === 'news' ? 'coat' : 'suit', torso: LOOK[c.cl] } : tier === 'greeter' ? { outfit: c.kind === 'wood' ? 'vest' : 'coat', torso: ['#201e1d', ACC[c.cl] || '#ec3013', '#111111'] } : { outfit: ['coat', 'vest', 'robe'][EX.length % 3], torso: CROWD[EX.length % 3] };
        const e = fox(ek, en, er, { ...lk, mood: tier === 'crowd' ? 'neutral' : 'warm' }, OX + x, Y, LZ + z, ry, IG); if (tier === 'crowd') e.userData.crowd = true; ir(x, z, 0.45); EX.push(e);
        if (tier !== 'crowd') voice(e, ek, en, er, OX + x, LZ + z, 2.4, false); } }
    // lifts (towers) on the left wall
    if (c.kind !== 'wood') for (const lz of [-4, 0]) { B('gls', '#9aa0a6', 0.06, 2.7, 1.7, -RW / 2 + 0.18, 1.35, lz); B('mat', '#201e1d', 0.04, 2.7, 0.03, -RW / 2 + 0.22, 1.35, lz); B('gls', '#d7ad52', 0.1, 0.14, 2.0, -RW / 2 + 0.2, 2.78, lz); for (const s of [-1, 1]) B('gls', '#d7ad52', 0.1, 2.8, 0.12, -RW / 2 + 0.2, 1.4, lz + s * 0.95); B('glo', '#ffd23a', 0.04, 0.24, 0.5, -RW / 2 + 0.2, 3.1, lz); B('glo', '#f3f2f2', 0.04, 0.18, 0.12, -RW / 2 + 0.2, 1.3, lz + 1.15); }
    // plants in the corners + pendants
    for (const [px, pz] of [[-RW / 2 + 1.1, RD / 2 - 1.1], [RW / 2 - 1.1, RD / 2 - 1.1], [-RW / 2 + 1.1, -RD / 2 + 1.1], [RW / 2 - 1.1, -RD / 2 + 1.1]]) { lob.cyl('mat', '#201e1d', 0.42, 0.8, OX + px, Y + 0.4, LZ + pz, 12); lob.sph('mat', '#4f7d3a', 0.75, OX + px, Y + 1.35, LZ + pz, 1.1); lob.sph('mat', '#3f6d2e', 0.5, OX + px + 0.2, Y + 1.9, LZ + pz - 0.1); ir(px, pz, 0.6); }
    for (const pz of [-6, -0.5, 5]) K.pendant(lob, OX, LZ + pz, Y + RH - 1.4, Y + RH, acc);
    // props by kind (the walkway door → desk stays clear: nothing within 2 m of x 0)
    const sofa = (x, z, ry) => { /* s181 FOX SCALE: seat 0.62 (was 0.45), back up to 1.27 */ B('mat', acc, 1.0, 0.62, 2.4, x, 0.31, z, ry); B('mat', acc, 0.25, 1.2, 2.4, x + (ry ? 0 : 0.45) * Math.sign(x || 1), 0.67, z, ry); ir(x, z - 0.6, 0.8); ir(x, z + 0.6, 0.8); };
    if (c.kind === 'hq') { sofa(5.6, 2, 0); sofa(-5.4, 4.6, 0); B('gls', '#201e1d', 1.2, 0.5, 1.6, 4.2, 0.25, 2); ir(4.2, 2, 0.7); for (const s of [-1, 1]) { B('mat', '#201e1d', 0.08, 4.6, 0.08, s * 4.2, 2.3, -RD / 2 + 0.6); B('mat', acc, 0.04, 2.2, 1.2, s * 4.2, 3.4, -RD / 2 + 1.2); } }
    if (c.kind === 'news') { for (const lz of [-3.6, -0.6, 2.4]) { B('mat', '#201e1d', 0.08, 1.6, 2.6, RW / 2 - 0.2, 2.8, lz); B('glo', lz > 0 ? '#3a6ea5' : '#5a86b8', 0.04, 1.36, 2.36, RW / 2 - 0.26, 2.8, lz); }
      if (c.key === 'newspaper') for (let k = 0; k < 6; k++) { B('mat', k % 2 ? '#e7e4dc' : '#f3f2f2', 0.9, 0.3, 0.6, 5.2 + (k % 2) * 1.1, 0.15 + Math.floor(k / 2) * 0.3, 3.4); if (k === 0) ir(5.7, 3.4, 0.9); }
      else { B('glo', '#ec3013', 1.8, 0.5, 0.06, 0, RH - 0.55, -RD / 2 + 0.2); } sofa(-5.4, 4.4, 0); }
    if (c.kind === 'relic') { for (const [x, z] of [[-5, -0.4], [5, -0.4], [-5, 2.8], [5, 2.8]]) { B('mat', '#3d2a1c', 1.6, 0.9, 1.0, x, 0.45, z); B('glass', '#bcd4e6', 1.5, 0.7, 0.9, x, 1.25, z); lob.oct((x + z) % 2 ? 'gls' : 'gls', (x > 0) === (z > 1) ? '#d7ad52' : '#ec3013', 0.18, OX + x, Y + 1.15, LZ + z, 1.3); ir(x - 0.5, z, 0.65); ir(x + 0.5, z, 0.65); }
      B('mat', '#201e1d', 0.06, 1.6, 2.6, RW / 2 - 0.2, 2.6, -1); for (let r = 0; r < 4; r++) B('glo', '#f3f2f2', 0.04, 0.08, 1.8 - (r % 2) * 0.5, RW / 2 - 0.25, 3.1 - r * 0.32, -1.2); B('glo', '#ec3013', 0.04, 1.4, 0.1, RW / 2 - 0.25, 2.6, -2.15); }
    if (c.kind === 'apt') { for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) { B('gls', '#c9c2b0', 0.12, 0.42, 0.5, RW / 2 - 0.2, 1.1 + r * 0.48, -2.4 + q * 0.56); B('mat', '#201e1d', 0.02, 0.05, 0.3, RW / 2 - 0.27, 1.22 + r * 0.48, -2.4 + q * 0.56); } sofa(-5.4, 4.4, 0); B('gls', '#201e1d', 1.0, 0.4, 1.4, 6, 0.2, 3.4); ir(6, 3.4, 0.7); }
    if (c.kind === 'gallery') { [['#ec3013', -3.6], ['#2e4a6b', -0.4], ['#ffd23a', 2.8]].forEach(([col, lz]) => { B('mat', '#201e1d', 0.08, 1.7, 2.3, RW / 2 - 0.2, 2.6, lz); B('glo', col, 0.04, 1.4, 2.0, RW / 2 - 0.26, 2.6, lz); });
      for (const [x, z, k] of [[-4.6, 1.8, 0], [4.6, 3.6, 1]]) { B('mat', '#f3f2f2', 0.8, 1.1, 0.8, x, 0.55, z); if (k) lob.oct('gls', '#f3f2f2', 0.42, OX + x, Y + 1.5, LZ + z, 1.4); else lob.sph('gls', '#f3f2f2', 0.38, OX + x, Y + 1.5, LZ + z, 1.3); ir(x, z, 0.6); } }
    if (c.kind === 'office') { B('mat', '#201e1d', 0.06, 2.0, 1.8, RW / 2 - 0.2, 2.2, -0.6); B('glo', '#ec3013', 0.04, 1.8, 0.08, RW / 2 - 0.25, 2.2, -1.42); for (let r = 0; r < 3; r++) B('glo', '#f3f2f2', 0.04, 0.12, 1.3, RW / 2 - 0.25, 2.8 - r * 0.5, -0.5);
      for (let k = 0; k < 3; k++) { B('mat', acc, 0.6, 0.45, 0.6, 7.4, 0.225, 1.6 + k * 0.9); B('mat', acc, 0.12, 0.6, 0.6, 7.7, 0.7, 1.6 + k * 0.9); } ir(7.4, 2.5, 1.4); }
    if (c.kind === 'wood') { for (const x of [-5.6, 5.6]) { B('mat', '#a77b4f', 3.2, 0.12, 1.3, x, 0.9, 1.2); for (const sx of [-1.4, 1.4]) B('mat', '#6b4a32', 0.12, 0.9, 1.1, x + sx, 0.45, 1.2); B('gls', '#9aa0a6', 0.5, 0.04, 0.3, x + 0.6, 0.98, 1.0); ir(x - 0.8, 1.2, 0.9); ir(x + 0.8, 1.2, 0.9); }
      for (let k = 0; k < 6; k++) B('mat', k % 2 ? '#c9a27a' : '#b08a5e', 0.12, 3.4, 0.24, RW / 2 - 0.5 - (k % 2) * 0.1, 1.7, -4 + k * 0.5, 0, 0, 0.12); B('mat', '#7a5236', 0.12, 0.12, 4, RW / 2 - 0.25, 3.2, -2.8); }
    if (c.kind !== 'wood') {   // s728k LOBBY DRESS for every tower lobby (BUILD_PLAN interiors, audit ~37): walkway x 0 + the roster spots + kind props stay clear
      const C = (k, col, r, h, x, y, z, n = 12) => lob.cyl(k, col, r, h, OX + x, Y + y, LZ + z, n), S = (k, col, r, x, y, z, sy = 1) => lob.sph(k, col, r, OX + x, Y + y, LZ + z, sy), bz = -RD / 2 + 0.17, lw = -RW / 2 + 0.17, rw = RW / 2 - 0.17;
      B('gls', '#3d3b3a', 0.36, 0.06, 0.26, -1.4, 1.16, -6.1); for (let k = 0; k < 3; k++) B('mat', '#f3efe2', 0.3, 0.012, 0.22, -1.4, 1.2 + k * 0.014, -6.1, k * 0.08);
      C('gls', '#201e1d', 0.05, 0.12, -0.6, 1.19, -6.2, 8); C('gls', '#d7ad52', 0.07, 0.05, 0.4, 1.16, -5.75, 10); S('gls', '#d7ad52', 0.03, 0.4, 1.2, -5.75); B('gls', '#201e1d', 0.7, 0.14, 0.04, 0, 1.2, -5.5, 0, -0.3); B('glo', '#f3f2f2', 0.6, 0.06, 0.01, 0, 1.21, -5.47, 0, -0.3);
      B('mat', '#201e1d', 3.0, 0.1, 0.5, -6, 0.48, -RD / 2 + 0.6); for (const x of [-7.3, -4.7]) B('mat', '#201e1d', 0.08, 0.48, 0.45, x, 0.24, -RD / 2 + 0.6); B('mat', acc, 2.9, 0.06, 0.46, -6, 0.56, -RD / 2 + 0.6); B('mat', '#201e1d', 3.0, 0.5, 0.06, -6, 0.85, -RD / 2 + 0.36); ib(-7.5, -4.5, -RD / 2 + 0.3, -RD / 2 + 0.9);
      B('mat', '#3d3b3a', 0.6, 0.5, 0.6, -3.9, 0.25, -RD / 2 + 0.7); ir(-3.9, -RD / 2 + 0.7, 0.4); B('mat', '#f3efe2', 0.4, 0.04, 0.3, -3.9, 0.52, -RD / 2 + 0.7, 0.2); B('mat', '#2e86b8', 0.3, 0.02, 0.24, -3.85, 0.55, -RD / 2 + 0.65, -0.3);
      B('gls', '#f3f2f2', 0.06, 0.06, 0.06, -6, 3.6, bz + 0.02); C('mat', '#f3f2f2', 0.42, 0.05, -6, 3.6, bz + 0.04, 20); B('mat', '#201e1d', 0.04, 0.3, 0.02, -6, 3.72, bz + 0.08); B('mat', '#201e1d', 0.22, 0.04, 0.02, -5.92, 3.6, bz + 0.08); S('gls', acc, 0.04, -6, 3.6, bz + 0.09);
      B('mat', '#201e1d', 0.06, 2.2, 1.8, lw, 1.9, 4.2); B('gls', '#d7ad52', 0.07, 0.1, 1.9, lw + 0.01, 3.05, 4.2); B('mat', acc, 0.07, 0.28, 1.7, lw + 0.01, 2.8, 4.2); for (let r = 0; r < 6; r++) B('glo', '#f3f2f2', 0.02, 0.08, 1.1 - (r % 3) * 0.2, lw + 0.04, 2.45 - r * 0.26, 4.0);
      C('mat', '#e5e7eb', 0.22, 1.0, -RW / 2 + 0.6, 0.5, 6.6, 12); C('glass', '#7dd3fc', 0.17, 0.48, -RW / 2 + 0.6, 1.24, 6.6, 12); B('gls', '#2e86b8', 0.08, 0.06, 0.1, -RW / 2 + 0.85, 0.85, 6.6); ir(-RW / 2 + 0.6, 6.6, 0.35);
      C('gls', '#201e1d', 0.18, 0.04, -2.5, 0.02, RD / 2 - 1.0, 12); C('gls', '#201e1d', 0.03, 1.8, -2.5, 0.92, RD / 2 - 1.0, 6); for (let k = 0; k < 4; k++) { const a = k * 1.571; B('gls', '#201e1d', 0.3, 0.03, 0.03, -2.5 + Math.cos(a) * 0.13, 1.72, RD / 2 - 1.0 + Math.sin(a) * 0.13, -a); } B('mat', '#7a5236', 0.35, 0.8, 0.2, -2.38, 1.3, RD / 2 - 1.0); ir(-2.5, RD / 2 - 1.0, 0.3);
      C('mat', '#201e1d', 0.18, 0.55, 2.4, 0.28, RD / 2 - 0.8, 12); for (const [dx, col] of [[-0.05, acc], [0.07, '#2e4a6b'], [0.0, '#f3f2f2']]) { C('mat', col, 0.025, 0.7, 2.4 + dx, 0.6, RD / 2 - 0.8 + dx, 6); S('mat', col, 0.06, 2.4 + dx, 0.98, RD / 2 - 0.8 + dx); } ir(2.4, RD / 2 - 0.8, 0.25);
      B('mat', '#3d3b3a', 3.0, 0.02, 1.3, 0, 0.022, RD / 2 - 1.0); B('mat', acc, 2.6, 0.022, 0.08, 0, 0.026, RD / 2 - 1.5);
      for (const [x, z] of [[lw, -7], [lw, 7.6], [rw, -7], [rw, 7.6]]) { B('gls', '#d7ad52', 0.06, 0.3, 0.16, x, 3.0, z); B('glo', '#fff1c8', 0.1, 0.2, 0.12, x + (x < 0 ? 0.08 : -0.08), 3.18, z); }
      for (const [x, z] of [[lw, -7], [lw, 7.6], [rw, -7], [rw, 7.6]]) pool(OX + x + (x < 0 ? 0.06 : -0.06), Y + 3.0, LZ + z, 1.0, '#ffc878', x < 0 ? Math.PI / 2 : -Math.PI / 2);   // s728r sconce washes
      pool(OX, Y + 0.03, LZ - 4.4, 2.4, '#ffd8a0'); pool(OX + lw + 0.06, Y + 2.0, LZ + 4.2, 1.2, acc, Math.PI / 2); pool(OX, Y + 0.03, LZ + RD / 2 - 1.0, 1.6, '#fff1c8');   // the desk front, the directory board, the door mat
      C('gls', '#ec3013', 0.13, 0.55, RW / 2 - 0.35, 0.65, 8.2, 10); B('gls', '#201e1d', 0.05, 0.12, 0.08, RW / 2 - 0.35, 0.98, 8.2); B('mat', '#ec3013', 0.04, 0.3, 0.3, rw, 1.55, 8.2);
      for (const [x, z] of [[-RW / 2 + 0.5, RD / 2 - 0.5], [RW / 2 - 0.5, -RD / 2 + 0.5]]) { B('mat', '#f3f2f2', 0.2, 0.08, 0.2, x, RH - 0.1, z); S('gls', '#201e1d', 0.12, x, RH - 0.18, z, 0.7); } }
    if (c.key === 'saltHQ') {   // s130 FAMILY FAVOUR: a BACK ROOM door (back wall, right); the doormen only let you in after the Salt Building is taken back (flag saltFavour)
      B('mat', '#3d2a1c', 1.8, 2.8, 0.12, 5.6, 1.4, -RD / 2 + 0.22); B('gls', '#d7ad52', 2.0, 0.12, 0.14, 5.6, 2.86, -RD / 2 + 0.24); B('glo', '#ec3013', 0.5, 0.12, 0.04, 5.6, 3.1, -RD / 2 + 0.3);
      const BX = LX0 + 41 * LS, BW = 12, BD = 12, B2 = (k, col, w, h, d, x, y, z, ry = 0) => lob.box(k, col, w, h, d, BX + x, LY + y, LZ + z, ry), ib2 = (a0, a1, c0, c1) => cols.push({ f: [BX + a0, BX + a1, LZ + c0, LZ + c1], y0: LY - 3, y1: LY + 12 });
      B2('mat', '#5a1d26', BW, 0.1, BD, 0, -0.05, 0); B2('mat', '#2a1a14', BW, 0.3, BD, 0, 4.15, 0); for (const sd of [-1, 1]) { B2('mat', '#6a3a2e', 0.3, 4, BD, sd * BW / 2, 2, 0); ib2(sd * BW / 2 - 0.15, sd * BW / 2 + 0.15, -BD / 2, BD / 2); B2('mat', '#6a3a2e', BW, 4, 0.3, 0, 2, sd * BD / 2); ib2(-BW / 2, BW / 2, sd * BD / 2 - 0.15, sd * BD / 2 + 0.15); }
      B2('gls', '#5c3a24', 3.2, 0.1, 2.0, 0, 0.8, -1.6); B2('mat', '#2f6b45', 3.0, 0.04, 1.8, 0, 0.86, -1.6); for (const [x, z] of [[-1.4, -0.8], [1.4, -0.8], [-1.4, -2.4], [1.4, -2.4]]) B2('mat', '#3d2b1d', 0.1, 0.8, 0.1, x, 0.4, z); ib2(-1.6, 1.6, -2.6, -0.6);
      for (let k = 0; k < 6; k++) B2('gls', ['#ec3013', '#f3f2f2', '#2e4a6b'][k % 3], 0.14, 0.12 + k * 0.03, 0.14, -1 + k * 0.4, 0.95, -1.6); lob.tor('gls', '#e6b45a', 0.7, 0.05, BX, LY + 3.4, LZ - 1.6, Math.PI / 2); for (let k = 0; k < 6; k++) lob.sph('glo', '#fff1c8', 0.09, BX + Math.cos(k) * 0.7, LY + 3.45, LZ - 1.6 + Math.sin(k) * 0.7);
      B2('gls', '#3d4148', 1.2, 1.4, 0.9, 4.6, 0.7, -5.2); B2('gls', '#e6b45a', 0.3, 0.3, 0.04, 4.6, 0.9, -4.73); ib2(4.0, 5.2, -5.7, -4.7); B2('mat', '#201e1d', 1.6, 2.8, 0.1, 0, 1.4, BD / 2 - 0.2);
      const boss = fox('saltBossBack', 'Old Salt', 'Head of the Salt family', { outfit: 'suit', torso: LOOK.pearl, mood: 'warm' }, BX, LY, LZ - 3.4, 0, IG); boss.userData.rosterRole = 'talker'; cols.push({ c: [BX, LZ - 3.4, 0.45], y0: LY - 3, y1: LY + 12 }); voice(boss, 'saltBossBack', 'Old Salt', 'Head of the Salt family', BX, LZ - 2.6, 2.2, false); backRoomDress(lob, cols, BX, LY, LZ, { rug: '#1f3a6b', trim: '#e6b45a', seat: '#2e4a6b', sofa: '#2e4a6b', paint: '#1e293b', fur1: '#c9c4bb', fur2: '#e9e3d6', coat: '#1f3a6b' }, pool);   // s728j + s728r pools
      spots.push({ key: 'cl:salt:back', x: OX + 5.6, z: LZ - RD / 2 + 1.2, r: 1.8, y: [LY - 1, LY + 3], prompt: 'BACK ROOM \u00b7 SALT FAMILY', use: () => { if (!save.flag('saltFavour')) { toast('THE DOORMEN SHAKE THEIR HEADS \u00b7 FAMILY AND FRIENDS ONLY', 3); return; } fade(() => { IG.visible = true; go(BX, LY, LZ + BD / 2 - 1.6, Math.PI); }); } },
        { key: 'cl:salt:backout', x: BX, z: LZ + BD / 2 - 0.9, r: 1.6, y: [LY - 1, LY + 3], prompt: 'LEAVE \u00b7 BACK TO THE LOBBY', use: () => fade(() => go(OX + 5.6, LY, LZ - RD / 2 + 2.2, 0)) },
        { key: 'cl:salt:safe', x: BX + 4.6, z: LZ - 4.2, r: 1.5, y: [LY - 1, LY + 3], prompt: 'THE FAMILY SAFE', use: () => { if (save.flag('saltFavourGift')) { toast('EMPTY \u00b7 OLD SALT GAVE YOU WHAT WAS IN IT', 3); return; } save.setFlag('saltFavourGift'); save.addGold(150); save.give('energyPod', 2); toast('A THANK-YOU FROM THE FAMILY \u00b7 +150 G \u00b7 2 ENERGY FILL PODS', 3.5); } }); }
    if (c.key === 'pepperHQ') {   // s132 PEPPER FAVOUR (same as Salt): BACK ROOM after the Pepper Building is taken back (flag pepperFavour)
      B('mat', '#3d2a1c', 1.8, 2.8, 0.12, 5.6, 1.4, -RD / 2 + 0.22); B('gls', '#d7ad52', 2.0, 0.12, 0.14, 5.6, 2.86, -RD / 2 + 0.24); B('glo', '#ec3013', 0.5, 0.12, 0.04, 5.6, 3.1, -RD / 2 + 0.3);
      const BX = LX0 + 43 * LS, BW = 12, BD = 12, B2 = (k, col, w, h, d, x, y, z, ry = 0) => lob.box(k, col, w, h, d, BX + x, LY + y, LZ + z, ry), ib2 = (a0, a1, c0, c1) => cols.push({ f: [BX + a0, BX + a1, LZ + c0, LZ + c1], y0: LY - 3, y1: LY + 12 });
      B2('mat', '#2a3d20', BW, 0.1, BD, 0, -0.05, 0); B2('mat', '#2a1a14', BW, 0.3, BD, 0, 4.15, 0); for (const sd of [-1, 1]) { B2('mat', '#3d2a1c', 0.3, 4, BD, sd * BW / 2, 2, 0); ib2(sd * BW / 2 - 0.15, sd * BW / 2 + 0.15, -BD / 2, BD / 2); B2('mat', '#3d2a1c', BW, 4, 0.3, 0, 2, sd * BD / 2); ib2(-BW / 2, BW / 2, sd * BD / 2 - 0.15, sd * BD / 2 + 0.15); }
      B2('gls', '#5c3a24', 3.2, 0.1, 2.0, 0, 0.8, -1.6); B2('mat', '#2f6b45', 3.0, 0.04, 1.8, 0, 0.86, -1.6); for (const [x, z] of [[-1.4, -0.8], [1.4, -0.8], [-1.4, -2.4], [1.4, -2.4]]) B2('mat', '#3d2b1d', 0.1, 0.8, 0.1, x, 0.4, z); ib2(-1.6, 1.6, -2.6, -0.6);
      for (let k = 0; k < 6; k++) B2('gls', ['#ec3013', '#f3f2f2', '#2e4a6b'][k % 3], 0.14, 0.12 + k * 0.03, 0.14, -1 + k * 0.4, 0.95, -1.6); lob.tor('gls', '#e6b45a', 0.7, 0.05, BX, LY + 3.4, LZ - 1.6, Math.PI / 2); for (let k = 0; k < 6; k++) lob.sph('glo', '#fff1c8', 0.09, BX + Math.cos(k) * 0.7, LY + 3.45, LZ - 1.6 + Math.sin(k) * 0.7);
      B2('gls', '#3d4148', 1.2, 1.4, 0.9, 4.6, 0.7, -5.2); B2('gls', '#e6b45a', 0.3, 0.3, 0.04, 4.6, 0.9, -4.73); ib2(4.0, 5.2, -5.7, -4.7); B2('mat', '#201e1d', 1.6, 2.8, 0.1, 0, 1.4, BD / 2 - 0.2);
      const boss = fox('pepperBossBack', 'Pepper', 'Head of the Pepper family', { outfit: 'suit', torso: LOOK.deco, mood: 'warm' }, BX, LY, LZ - 3.4, 0, IG); boss.userData.rosterRole = 'talker'; cols.push({ c: [BX, LZ - 3.4, 0.45], y0: LY - 3, y1: LY + 12 }); voice(boss, 'pepperBossBack', 'Pepper', 'Head of the Pepper family', BX, LZ - 2.6, 2.2, false); backRoomDress(lob, cols, BX, LY, LZ, { rug: '#7a1f1a', trim: '#d7ad52', seat: '#5a1f1a', sofa: '#5a1f1a', paint: '#2a1a14', fur1: '#b8692e', fur2: '#d98a4a', coat: '#7a1f1a' }, pool);   // s728j + s728r pools
      spots.push({ key: 'cl:pepper:back', x: OX + 5.6, z: LZ - RD / 2 + 1.2, r: 1.8, y: [LY - 1, LY + 3], prompt: 'BACK ROOM \u00b7 PEPPER FAMILY', use: () => { if (!save.flag('pepperFavour')) { toast('THE DOORMEN CHECK YOUR POCKETS \u00b7 FAMILY AND FRIENDS ONLY', 3); return; } fade(() => { IG.visible = true; go(BX, LY, LZ + BD / 2 - 1.6, Math.PI); }); } },
        { key: 'cl:pepper:backout', x: BX, z: LZ + BD / 2 - 0.9, r: 1.6, y: [LY - 1, LY + 3], prompt: 'LEAVE \u00b7 BACK TO THE LOBBY', use: () => fade(() => go(OX + 5.6, LY, LZ - RD / 2 + 2.2, 0)) },
        { key: 'cl:pepper:safe', x: BX + 4.6, z: LZ - 4.2, r: 1.5, y: [LY - 1, LY + 3], prompt: 'THE FAMILY SAFE', use: () => { if (save.flag('pepperFavourGift')) { toast('EMPTY \u00b7 PEPPER GAVE YOU WHAT WAS IN IT', 3); return; } save.setFlag('pepperFavourGift'); save.addGold(150); save.give('energyPod', 2); toast('A THANK-YOU FROM THE FAMILY \u00b7 +150 G \u00b7 2 ENERGY FILL PODS', 3.5); } }); }
    if (c.key === 'mfHQ') {   // s133 MACHINE FLEET FAVOUR: the PROTOTYPE LAB behind the lobby (back wall, right); the guard bot lets you in once the Robot Factory is taken back (flag mfFavour)
      B('mat', '#334155', 1.8, 2.8, 0.12, 5.6, 1.4, -RD / 2 + 0.22); B('gls', '#9aa0a6', 2.0, 0.12, 0.14, 5.6, 2.86, -RD / 2 + 0.24); B('glo', '#3fd3ff', 0.5, 0.12, 0.04, 5.6, 3.1, -RD / 2 + 0.3);
      const BX = LX0 + 46 * LS, BW = 12, BD = 12, B2 = (k, col, w, h, d, x, y, z, ry = 0) => lob.box(k, col, w, h, d, BX + x, LY + y, LZ + z, ry), ib2 = (a0, a1, c0, c1) => cols.push({ f: [BX + a0, BX + a1, LZ + c0, LZ + c1], y0: LY - 3, y1: LY + 12 });
      B2('mat', '#3d4148', BW, 0.1, BD, 0, -0.05, 0); B2('mat', '#24282c', BW, 0.3, BD, 0, 4.15, 0); for (const sd of [-1, 1]) { B2('mat', '#cbd5e1', 0.3, 4, BD, sd * BW / 2, 2, 0); ib2(sd * BW / 2 - 0.15, sd * BW / 2 + 0.15, -BD / 2, BD / 2); B2('mat', '#cbd5e1', BW, 4, 0.3, 0, 2, sd * BD / 2); ib2(-BW / 2, BW / 2, sd * BD / 2 - 0.15, sd * BD / 2 + 0.15); B2('mat', '#5d6f82', BW, 1.0, 0.32, 0, 0.5, sd * BD / 2); }
      for (const sx of [-2.5, 2.5]) B2('glo', '#f3f2f2', 0.3, 0.05, BD - 2, sx, 3.98, 0);
      B2('gls', '#5d6f82', 3.2, 0.12, 1.4, -3, 0.95, -4.4); for (const [x, z] of [[-4.4, -4.9], [-1.6, -4.9], [-4.4, -3.9], [-1.6, -3.9]]) B2('mat', '#24282c', 0.1, 0.9, 0.1, x, 0.45, z); B2('mat', '#9aa0a6', 0.5, 0.3, 0.4, -3.8, 1.16, -4.5); B2('glo', '#3fd3ff', 0.3, 0.2, 0.04, -2.4, 1.2, -4.2); ib2(-4.6, -1.4, -5.1, -3.7);
      B2('mat', '#201e1d', 1.0, 0.9, 1.0, 0, 0.45, -1.6); B2('gls', '#cbd5e1', 0.5, 0.32, 2.0, 0, 1.3, -1.6); B2('gls', '#5d6f82', 2.0, 0.06, 0.7, 0, 1.3, -1.3); B2('gls', '#ec3013', 0.06, 0.4, 0.5, 0, 1.6, -2.3); B2('glo', '#3fd3ff', 0.3, 0.18, 0.05, 0, 1.3, -2.62); ib2(-0.6, 0.6, -2.2, -1.0);
      B2('glo', '#2e86b8', 0.04, 1.6, 2.6, BW / 2 - 0.2, 2.2, -1); for (let r = 0; r < 4; r++) B2('glo', '#f3f2f2', 0.04, 0.05, 2.0 - (r % 2) * 0.6, BW / 2 - 0.24, 2.7 - r * 0.32, -1);
      B2('gls', '#3d4148', 1.2, 2.0, 0.9, 4.6, 1.0, -5.2); B2('glo', '#ffd23a', 0.3, 0.3, 0.04, 4.6, 1.2, -4.73); ib2(4.0, 5.2, -5.7, -4.7); B2('mat', '#201e1d', 1.6, 2.8, 0.1, 0, 1.4, BD / 2 - 0.2);
      { const o = new THREE.Object3D(); o.position.set(BX - 3, LY + 1.4, LZ - 1.4); IG.add(o); lobBot(B2, -3, -1.4, 0.5); cols.push({ c: [BX - 3, LZ - 1.4, 0.6], y0: LY - 3, y1: LY + 12 }); voice(o, 'mfProto', 'Proto', 'Prototype robot', BX - 3, LZ - 0.4, 2.4, false); }
      { // s728h LAB DRESS (BUILD_PLAN interiors, audit 7.5): walkway from the back-room door (z +6) to the console kept clear (x ±1.2).
        const C2 = (k, col, r, h, x, y, z, n = 12, top = 1) => lob.cyl(k, col, r, h, BX + x, LY + y, LZ + z, n, 0, 0, top), S2 = (k, col, r, x, y, z, sy = 1) => lob.sph(k, col, r, BX + x, LY + y, LZ + z, sy);
        // test circle round Proto: yellow / black floor ring
        for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; B2('mat', i % 2 ? '#ffd23a' : '#201e1d', 0.5, 0.012, 0.16, -3 + Math.cos(a) * 1.15, 0.01, -1.4 + Math.sin(a) * 1.15, -a + Math.PI / 2); }
        // left wall: pegboard of tools over a parts workbench (gears, a robot arm, a soldering lamp)
        B2('mat', '#c9a86a', 0.05, 1.5, 3.2, -BW / 2 + 0.2, 2.3, 2.2); for (let i = 0; i < 9; i++) B2('mat', ['#201e1d', '#ec3013', '#9aa0a6'][i % 3], 0.05, 0.4 + (i % 3) * 0.12, 0.08, -BW / 2 + 0.25, 2.3 + ((i * 7) % 5) * 0.1 - 0.2, 0.9 + i * 0.32);
        B2('mat', '#3d4148', 0.9, 0.9, 3.2, -BW / 2 + 0.6, 0.45, 2.2); B2('gls', '#5d6f82', 0.95, 0.06, 3.25, -BW / 2 + 0.6, 0.93, 2.2); ib2(-BW / 2, -BW / 2 + 1.1, 0.5, 3.9);
        for (const [z, r] of [[1.1, 0.16], [1.5, 0.1], [1.8, 0.13]]) C2('gls', '#c9a227', r, 0.04, -BW / 2 + 0.6, 0.98, z, 10);
        B2('gls', '#cbd5e1', 0.14, 0.14, 0.7, -BW / 2 + 0.6, 1.04, 2.7); B2('gls', '#cbd5e1', 0.12, 0.5, 0.12, -BW / 2 + 0.6, 1.3, 3.05); S2('gls', '#9aa0a6', 0.09, -BW / 2 + 0.6, 1.04, 2.35);
        B2('mat', '#201e1d', 0.03, 0.5, 0.03, -BW / 2 + 0.5, 1.2, 3.5); C2('gls', '#ffd23a', 0.1, 0.1, -BW / 2 + 0.5, 1.45, 3.45, 10); B2('glo', '#fff1c8', 0.12, 0.01, 0.12, -BW / 2 + 0.5, 1.39, 3.45);
        // right wall: 3 CHARGING PODS (glass tubes, cyan rings); the middle one holds a spare robot head
        for (const z of [1.2, 2.8, 4.4]) { C2('mat', '#3d4148', 0.55, 0.2, BW / 2 - 0.9, 0.1, z, 16); C2('glass', '#cfe9ff', 0.5, 2.2, BW / 2 - 0.9, 1.3, z, 16); C2('mat', '#3d4148', 0.55, 0.2, BW / 2 - 0.9, 2.5, z, 16); C2('glo', '#3fd3ff', 0.56, 0.05, BW / 2 - 0.9, 0.24, z, 16); cols.push({ c: [BX + BW / 2 - 0.9, LZ + z, 0.6], y0: LY - 3, y1: LY + 12 }); }
        B2('gls', '#cbd5e1', 0.45, 0.4, 0.4, BW / 2 - 0.9, 1.3, 2.8); B2('glo', '#3fd3ff', 0.02, 0.07, 0.1, BW / 2 - 1.13, 1.35, 2.7); B2('glo', '#3fd3ff', 0.02, 0.07, 0.1, BW / 2 - 1.13, 1.35, 2.9);
        // front wall: shelf of SPARE HEADS: one has a red eye (the hack: not every unit came back clean)
        B2('mat', '#5d6f82', 3.0, 0.06, 0.5, 1.2, 1.5, -BD / 2 + 0.45); B2('mat', '#5d6f82', 3.0, 0.06, 0.5, 1.2, 0.8, -BD / 2 + 0.45); ib2(-0.3, 2.7, -BD / 2 + 0.15, -BD / 2 + 0.75);
        [[0.1, 1.5], [0.9, 1.5], [1.7, 1.5], [2.4, 0.8], [0.4, 0.8]].forEach(([x, y], i) => { B2('gls', i === 2 ? '#9aa0a6' : '#cbd5e1', 0.4, 0.34, 0.36, x, y + 0.2, -BD / 2 + 0.45); const ec = i === 2 ? '#ff3a20' : '#3fd3ff'; B2('glo', ec, 0.08, 0.06, 0.02, x - 0.09, y + 0.24, -BD / 2 + 0.64); B2('glo', i === 2 ? '#3fd3ff' : ec, 0.08, 0.06, 0.02, x + 0.09, y + 0.24, -BD / 2 + 0.64); });
        // diagnostic screen (right wall) gets a red error row
        B2('glo', '#ff3a20', 0.04, 0.06, 1.2, BW / 2 - 0.25, 1.65, -1.4);
        // back wall: a robot SCHEMATIC in cyan lines (left of the door), cable spools + parts crates (right of the door)
        B2('mat', '#1e293b', 2.6, 2.0, 0.05, -3.6, 2.2, BD / 2 - 0.2); for (const [w, h, x, y] of [[0.8, 0.04, -3.6, 2.9], [0.04, 0.6, -3.98, 2.6], [0.04, 0.6, -3.22, 2.6], [0.8, 0.04, -3.6, 2.3], [1.4, 0.04, -3.6, 2.1], [0.04, 0.9, -3.6, 1.6], [0.04, 0.7, -4.3, 1.75], [0.04, 0.7, -2.9, 1.75]]) B2('glo', '#3fd3ff', w, h, 0.02, x, y, BD / 2 - 0.24);
        for (const [x, z] of [[3.2, 4.8], [4.3, 4.6]]) { C2('mat', '#7a5236', 0.5, 0.08, x, 0.04, z, 14); C2('mat', '#201e1d', 0.32, 0.6, x, 0.38, z, 14); C2('mat', '#7a5236', 0.5, 0.08, x, 0.72, z, 14); cols.push({ c: [BX + x, LZ + z, 0.55], y0: LY - 3, y1: LY + 12 }); }
        for (const [x, y, z, r] of [[-4.6, 0.35, 4.9, 0.1], [-3.6, 0.35, 4.9, -0.05], [-4.1, 1.05, 4.9, 0.2]]) B2('mat', '#4b5563', 0.9, 0.7, 0.8, x, y, z, r); ib2(-5.1, -3.1, 4.4, 5.4);
        for (const x of [-1.2, 1.2]) for (let z = 0.4; z < 5.6; z += 0.8) B2('mat', '#ffd23a', 0.08, 0.012, 0.4, x, 0.012, z);
        for (const z of [1.2, 2.8, 4.4]) pool(BX + BW / 2 - 0.9, LY + 0.03, LZ + z, 1.1, '#3fd3ff');   // s728r cyan under the charging pods
        pool(BX - 3, LY + 0.03, LZ - 1.4, 1.8, '#9fe6ff'); pool(BX - BW / 2 + 0.6, LY + 0.97, LZ + 3.45, 0.5, '#fff1c8'); pool(BX + 1.2, LY + 1.55, LZ - BD / 2 + 0.47, 0.9, '#ff6a4a', 0); pool(BX - 3.6, LY + 2.2, LZ + BD / 2 - 0.26, 1.6, '#3fd3ff', Math.PI); }
      ROOMS[46] = { c: { key: 'mfLab', room: 'meruMachineFleetHQ', title: 'MACHINE FLEET · PROTOTYPE LAB' }, i: 46, ox: BX, keeper: null, ex: [], rh: 4.3, out: null };
      spots.push({ key: 'cl:mf:back', x: OX + 5.6, z: LZ - RD / 2 + 1.2, r: 1.8, y: [LY - 1, LY + 3], prompt: 'BACK ROOM · PROTOTYPE LAB', use: () => { if (!save.flag('mfFavour')) { toast('THE GUARD BOT BEEPS NO · STAFF AND FRIENDS OF THE FLEET ONLY', 3); return; } fade(() => { IG.visible = true; go(BX, LY, LZ + BD / 2 - 1.6, Math.PI); }); } },
        { key: 'cl:mf:backout', x: BX, z: LZ + BD / 2 - 0.9, r: 1.6, y: [LY - 1, LY + 3], prompt: 'LEAVE · BACK TO THE LOBBY', use: () => fade(() => go(OX + 5.6, LY, LZ - RD / 2 + 2.2, 0)) },
        { key: 'cl:mf:locker', x: BX + 4.6, z: LZ - 4.2, r: 1.5, y: [LY - 1, LY + 3], prompt: 'THE PARTS LOCKER', use: () => { if (save.flag('mfFavourGift')) { toast('EMPTY · THE ENGINEERS GAVE YOU WHAT WAS IN IT', 3); return; } save.setFlag('mfFavourGift'); save.addGold(150); save.give('energyPod', 2); toast('A THANK-YOU FROM THE FLEET · +150 G · 2 ENERGY FILL PODS', 3.5); } }); }
    if (c.key === 'saltHQ' && !ROOMS[41]) ROOMS[41] = { c: { key: 'saltBack', room: c.room, title: 'SALT FAMILY · BACK ROOM' }, i: 41, ox: LX0 + 41 * LS, keeper: null, ex: [], rh: 4.3, out: null };   // s133: back rooms in the room list so the floor + the camera hold
    if (c.key === 'pepperHQ' && !ROOMS[43]) ROOMS[43] = { c: { key: 'pepperBack', room: c.room, title: 'PEPPER FAMILY · BACK ROOM' }, i: 43, ox: LX0 + 43 * LS, keeper: null, ex: [], rh: 4.3, out: null };
    const R = { c, i, ox: OX, keeper, ex: EX, rh: RH, out: (() => { const [x, z] = W(0, D.lm ? 9 : 6); return { x, z, yaw: D.ry }; })() }; ROOMS[i] = R;
    const [sx, sz] = W(0, D.lm ? 4.6 : 2.2);
    spots.push({ key: 'cl:in:' + c.key, x: sx, z: sz, r: D.lm ? 3 : 2.4, prompt: 'ENTER \u00b7 ' + c.title, use: () => fade(() => { IG.visible = true; go(OX, LY, LZ + RD / 2 - 4, Math.PI); }) },
      { key: 'cl:out:' + c.key, x: OX, z: LZ + RD / 2 - 1.1, r: 2.0, y: [LY - 1, LY + 3], prompt: 'LEAVE \u00b7 ' + c.title, use: () => fade(() => { go(R.out.x, 0.6, R.out.z, R.out.yaw); IG.visible = false; }) });
  }
  // s106c SPIRE OFFICES FLOORS: the lobby lift (choice box) → 3 small floors in the lobby row (lawyer, accountant, dentist)
  const offR = ROOMS.find(r => r && r.c.key === 'offices');
  if (offR && sayTo) { const FR = [], liftIn = (ox) => ({ x: ox - RW / 2 + 2.2, z: LZ - 2 });
    const liftMenu = (from, obj) => { const T = { key: 'officeLift', obj, name: 'LIFT', role: 'SPIRE OFFICES', r: 2.6 }, goTo = R => fade(() => { const p = liftIn(R.ox); go(p.x, LY, p.z, Math.PI / 2); });
      const ch = [...FR.filter(R => R !== from).map(R => ({ text: R.c.title.replace('OFFICES \u00b7 ', ''), pick: () => goTo(R) })), ...(from !== offR ? [{ text: 'LOBBY', pick: () => goTo(offR) }] : []), { text: 'STAY HERE', bye: true, pick: () => {} }];
      sayTo(T, [{ who: 'officeLift', role: 'SPIRE OFFICES', text: from === offR ? 'Going up. Which floor?' : 'Which floor?', choices: ch }]); };
    const liftSpot = (R, ox) => { const o = new THREE.Object3D(), p = liftIn(ox); o.position.set(ox - RW / 2 + 0.6, LY + 1.4, LZ - 2); IG.add(o); spots.push({ key: 'cl:lift:' + R.i, x: p.x - 0.4, z: p.z, r: 2.2, y: [LY - 1, LY + 3], prompt: 'LIFT \u00b7 PICK A FLOOR', use: () => liftMenu(R, o) }); };
    liftSpot(offR, offR.ox);
    OFFICE_FLOORS.forEach(([label, kp, extras], fi) => { const i = nLobby++, OX = LX0 + i * LS, RH = 4.2, Y = LY, acc = ACC.spire;
      const ir = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 }), ib = (a0, a1, c0, c1) => cols.push({ f: [OX + a0, OX + a1, LZ + c0, LZ + c1], y0: LY - 3, y1: LY + 12 });
      const B = (k, col, w, h, d, x, y, z, ry = 0, rx = 0, rz = 0) => lob.box(k, col, w, h, d, OX + x, Y + y, LZ + z, ry, rx, rz);
      B('mat', ['#7a5236', '#9aa0a6', '#e7e4dc'][fi], RW, 0.1, RD, 0, -0.05, 0); B('mat', '#d9d4cc', RW, 0.3, RD, 0, RH + 0.15, 0);
      for (const s of [-1, 1]) { B('mat', '#efece6', RW, RH, 0.3, 0, RH / 2, s * RD / 2); ib(-RW / 2, RW / 2, s * RD / 2 - 0.15, s * RD / 2 + 0.15); B('mat', '#efece6', 0.3, RH, RD, s * RW / 2, RH / 2, 0); ib(s * RW / 2 - 0.15, s * RW / 2 + 0.15, -RD / 2, RD / 2); }
      // lift doors (left wall) + floor number
      B('gls', '#9aa0a6', 0.06, 2.7, 1.7, -RW / 2 + 0.18, 1.35, -2); B('mat', '#201e1d', 0.04, 2.7, 0.03, -RW / 2 + 0.22, 1.35, -2); B('gls', '#d7ad52', 0.1, 0.14, 2.0, -RW / 2 + 0.2, 2.78, -2); B('glo', '#ffd23a', 0.04, 0.3, 0.3, -RW / 2 + 0.2, 3.15, -2);
      // red rule + plate on the back (right) wall, desk along z at x 5, keeper behind it
      B('glo', '#ec3013', 0.04, 0.14, 8, RW / 2 - 0.2, 3.2, 0); B('mat', '#201e1d', 0.06, 0.9, 4, RW / 2 - 0.2, 2.5, 0); B('glo', '#f3f2f2', 0.04, 0.12, 3.2, RW / 2 - 0.25, 2.6, 0);
      B('mat', acc, 0.9, 1.05, 4.4, 5, 0.525, 0); B('gls', '#201e1d', 1.1, 0.08, 4.8, 5, 1.09, 0); ib(4.45, 5.55, -2.2, 2.2);
      for (const pz of [-5, 0, 5]) K.pendant(lob, OX, LZ + pz, Y + RH - 1.2, Y + RH, acc);
      for (const [px, pz] of [[RW / 2 - 1.1, RD / 2 - 1.1], [RW / 2 - 1.1, -RD / 2 + 1.1]]) { lob.cyl('mat', '#201e1d', 0.42, 0.8, OX + px, Y + 0.4, LZ + pz, 12); lob.sph('mat', '#4f7d3a', 0.75, OX + px, Y + 1.35, LZ + pz, 1.1); ir(px, pz, 0.6); }
      if (fi === 0) { for (let k = 0; k < 4; k++) { B('mat', '#5a3d26', 0.5, 3.2, 1.8, -2 + k * 2.2 - 0, 1.6, -RD / 2 + 0.5); for (let r = 0; r < 4; r++) B('gls', ['#7a1d2a', '#2e4a6b', '#4f5d2f', '#d7ad52'][(k + r) % 4], 0.36, 0.5, 1.6, -2 + k * 2.2, 0.6 + r * 0.75, -RD / 2 + 0.75); ib(-2.3 + k * 2.2, -1.7 + k * 2.2, -RD / 2, -RD / 2 + 1); }
        for (const z of [-4.2, 3.6]) { B('mat', '#7a1d2a', 0.7, 0.5, 0.7, 2.8, 0.25, z); B('mat', '#7a1d2a', 0.15, 0.6, 0.7, 2.5, 0.75, z); ir(2.8, z, 0.5); } }
      if (fi === 1) { for (let k = 0; k < 5; k++) { B('gls', '#9aa0a6', 0.8, 1.4, 0.7, -3 + k * 1, 0.7, -RD / 2 + 0.5); for (let r = 0; r < 3; r++) B('mat', '#201e1d', 0.3, 0.04, 0.02, -3 + k * 1, 0.35 + r * 0.42, -RD / 2 + 0.86); } ib(-3.5, 1.5, -RD / 2, -RD / 2 + 0.9);
        B('mat', '#201e1d', 0.5, 0.18, 0.4, 5, 1.22, 1.2); for (let k = 0; k < 6; k++) B('mat', '#f3f2f2', 0.3, 0.04, 0.24, 5 - 0.1, 1.15 + k * 0.05, -1.2 + (k % 2) * 0.05); }
      if (fi === 2) { B('mat', '#2e86b8', 0.9, 0.7, 2.0, 0.5, 0.45, -5.6); B('mat', '#2e86b8', 0.9, 0.9, 0.2, 0.5, 1.0, -6.6, 0, 0.5); B('mat', '#3d3b3a', 0.2, 0.5, 0.2, 0.5, 0.25, -5.6); ib(0, 1, -6.8, -4.6);
        B('mat', '#3d3b3a', 0.06, 2.2, 0.06, 1.6, 1.1, -6.6); B('gls', '#3d3b3a', 0.9, 0.06, 0.06, 1.2, 2.2, -6.6); B('glo', '#fff6d8', 0.4, 0.14, 0.3, 0.8, 2.12, -6.6); ir(1.6, -6.6, 0.3);
        for (let k = 0; k < 3; k++) { B('mat', acc, 0.6, 0.45, 0.6, -4 + k * 0.9, 0.225, 7.4); B('mat', acc, 0.6, 0.6, 0.12, -4 + k * 0.9, 0.7, 7.7); } ib(-4.4, -1.4, 7.0, 8.0); }
      const [kk, kn, kr] = kp, keeper = fox(kk, kn, kr, { outfit: fi === 2 ? 'coat' : 'suit', torso: fi === 2 ? ['#f3f2f2', '#2e86b8', '#9aa0a6'] : LOOK.spire, mood: 'warm' }, OX + 6.6, Y, LZ, -Math.PI / 2, IG); keeper.userData.rosterRole = 'keeper'; ir(6.6, 0, 0.45);
      voice(keeper, kk, kn, kr, OX + 4, LZ, 2.4, true);
      const EX = [], SP = { greeter: [[2.4, 4.2]], crowd: [[-3.1, 6.1]] };
      for (const [ek, en, er, tier] of extras) { const p = SP[tier]; if (!p) continue; const [x, z] = p[0], e = fox(ek, en, er, tier === 'crowd' ? { outfit: 'vest', torso: ['#2e4a6b', '#e7e4dc', '#16263c'], mood: 'neutral' } : { outfit: 'coat', torso: fi === 2 ? ['#f3f2f2', '#2e86b8', '#9aa0a6'] : ['#201e1d', acc, '#111111'], mood: 'warm' }, OX + x, Y, LZ + z, tier === 'crowd' ? Math.PI : -Math.PI * 0.75, IG);
        if (tier === 'crowd') e.userData.crowd = true; ir(x, z, 0.45); EX.push(e); if (tier !== 'crowd') voice(e, ek, en, er, OX + x, LZ + z, 2.4, false); }
      const R = { c: { key: 'officeFloor' + (fi + 1), room: offR.c.room, title: 'OFFICES \u00b7 ' + label }, i, ox: OX, keeper, ex: EX, rh: RH, ry0: -Math.PI / 2, out: offR.out }; ROOMS[i] = R; FR.push(R); liftSpot(R, OX); }); }
  const em = ext.build(EG); for (const k in em) if (k === 'mat' && !touch) em[k].castShadow = true;
  qOut.mesh(EG); lob.build(IG); qIn.mesh(IG);
  // ---------- walk contract ----------
  const roomAt = (x, z, y) => { if (y < LY - 10 || y > LY + 12) return null; const R = ROOMS[Math.round((x - LX0) / LS)]; return R && Math.abs(x - R.ox) < RW / 2 + 0.5 && Math.abs(z - LZ) < RD / 2 + 0.5 ? R : null; };
  const inside = P => !!P && !!roomAt(P.x, P.z, P.y);
  const groundAt = (x, z, y) => (roomAt(x, z, y) ? LY : null);
  const where = P => { const R = P && roomAt(P.x, P.z, P.y); return R ? { key: R.c.room, label: R.c.title, music: 'civic' } : null; };
  function camFix(camera, P) { const R = roomAt(P.x, P.z, P.y); if (!R) return; const c = camera.position, m = 0.45, tx = P.x, ty = P.y + 1.4, tz = P.z, dx = c.x - tx, dy = c.y - ty, dz = c.z - tz; let t = 1;
    const bx0 = R.ox - RW / 2 + m, bx1 = R.ox + RW / 2 - m, bz0 = LZ - RD / 2 + m, bz1 = LZ + RD / 2 - m, top = LY + R.rh - 0.5;
    if (dx > 0) t = Math.min(t, (bx1 - tx) / dx); else if (dx < 0) t = Math.min(t, (bx0 - tx) / dx); if (dz > 0) t = Math.min(t, (bz1 - tz) / dz); else if (dz < 0) t = Math.min(t, (bz0 - tz) / dz); if (dy > 0) t = Math.min(t, (top - ty) / dy);
    t = Math.max(0.15, Math.min(1, t)); const hd = Math.hypot(dx, dz) * t; c.set(tx + dx * t, Math.max(LY + 0.5, ty + dy * t), tz + dz * t); if (hd < 3) c.y = Math.min(top, Math.max(c.y, ty + 1.2 + (3 - hd) * 0.7)); camera.lookAt(tx, ty, tz); }
  const turn = (a, b2) => { let d = a - b2; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
  function tick(dt, P) { if ((toastT -= dt) <= 0) toastS = '';
    const R = P && roomAt(P.x, P.z, P.y); if (R) { IG.visible = true; if (dt && R.ex) for (const e of R.ex) kit.animFox(e, dt, 0, false); const f = R.keeper; if (f && dt) { const dx = P.x - f.position.x, dz = P.z - f.position.z, want = Math.hypot(dx, dz) < 7 ? Math.atan2(dx, dz) : (R.ry0 || 0); f.rotation.y += turn(want, f.rotation.y) * Math.min(1, dt * 4); kit.animFox(f, dt, 0, false); } }
    else { if (IG.visible && !busy) IG.visible = false; if (dt && P) for (const f of OUT) if (f.visible !== false && Math.hypot(f.position.x - P.x, f.position.z - P.z) < 60) kit.animFox(f, dt, 0, false); } }
  function setNight(on) { signM.color.set(on ? 0xffffff : 0xe8e8e8); }
  const addRoom = (c, rh = 6) => { const i = nLobby++, R = { c, i, ox: LX0 + i * LS, keeper: null, ex: [], rh, out: null }; ROOMS[i] = R; return R; };   // s108: extra rooms in the lobby row (Meru Daily newsroom)
  if (POOLS.length) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g2 = cv.getContext('2d'), gr = g2.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
    const P3 = [], UV = [], CO = [], IX = [], cc = new THREE.Color(), o3 = new THREE.Object3D(), v3 = new THREE.Vector3();
    POOLS.forEach((p, n) => { o3.position.set(p.x, p.y, p.z); if (p.ry == null) o3.rotation.set(-Math.PI / 2, 0, 0); else o3.rotation.set(0, p.ry, 0); o3.scale.setScalar(p.r * 2); o3.updateMatrix(); cc.set(p.c);
      for (const [u, w] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) { v3.set(u, w, 0).applyMatrix4(o3.matrix); P3.push(v3.x, v3.y, v3.z); UV.push(u + 0.5, w + 0.5); CO.push(cc.r, cc.g, cc.b); } IX.push(n * 4, n * 4 + 1, n * 4 + 2, n * 4, n * 4 + 2, n * 4 + 3); });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P3, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(CO, 3)); geo.setIndex(IX);
    const pm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 })); pm.renderOrder = 3; pm.name = 'clusterLightPools'; IG.add(pm); }
  return { _go: go, addRoom, frames: FRM, geo: { LX0, LS, LY, LZ, RW, RD }, IG, spots, tick, setNight, groundAt, inside, where, camFix, toast: () => toastS, rooms: ROOMS, stats: { buildings: CB.length, lobbies: ROOMS.filter(Boolean).length, outside: OUT.length, cells: CELLS.length } };
}

// s728j BACK ROOM DRESS (Salt + Pepper favour rooms, 12 × 12, door at z +6, card table at z -1.6, safe front-right, boss behind the table).
// Walkway door → table kept clear (x ±1.2). Rug, 5 chairs, ledger + cash box, drinks cabinet, sofa + coffee table, gramophone, bookshelf,
// family portrait behind the boss, floor lamp, wall sconces, a globe, a plant. Colours per family (th).
function backRoomDress(lob, cols, BX, LY, LZ, th, pool = null) {
  const B2 = (k, col, w, h, d, x, y, z, ry = 0) => lob.box(k, col, w, h, d, BX + x, LY + y, LZ + z, ry), C2 = (k, col, r, h, x, y, z, n = 12, top = 1) => lob.cyl(k, col, r, h, BX + x, LY + y, LZ + z, n, 0, 0, top), S2 = (k, col, r, x, y, z, sy = 1) => lob.sph(k, col, r, BX + x, LY + y, LZ + z, sy);
  const ib2 = (a0, a1, c0, c1) => cols.push({ f: [BX + a0, BX + a1, LZ + c0, LZ + c1], y0: LY - 3, y1: LY + 12 }), rg = (x, z, r) => cols.push({ c: [BX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  B2('mat', th.trim, 5.2, 0.015, 3.8, 0, 0.008, -1.6); B2('mat', th.rug, 4.9, 0.02, 3.5, 0, 0.012, -1.6);
  for (const [x, z, ry] of [[-1.0, -0.15, 0], [0, -0.15, 0], [1.0, -0.15, 0], [-2.15, -1.6, Math.PI / 2], [2.15, -1.6, -Math.PI / 2]]) { const f = ry ? [Math.sign(-ry) * 0.24, 0] : [0, 0.24]; B2('mat', '#3d2b1d', 0.44, 0.45, 0.44, x, 0.225, z, ry); B2('gls', th.seat, 0.5, 0.08, 0.5, x, 0.49, z, ry); B2('gls', th.seat, ry ? 0.06 : 0.5, 0.6, ry ? 0.5 : 0.06, x + f[0], 0.83, z + f[1]); }
  ib2(-1.3, 1.3, -0.4, 0.15); ib2(-2.4, -1.9, -1.9, -1.3); ib2(1.9, 2.4, -1.9, -1.3);
  B2('gls', '#5a1f1a', 0.5, 0.06, 0.36, -0.7, 0.9, -1.9, 0.2); B2('mat', '#f3efe2', 0.46, 0.02, 0.32, -0.7, 0.94, -1.9, 0.2); B2('gls', '#3d4148', 0.4, 0.18, 0.28, 0.8, 0.96, -1.9, -0.15); B2('gls', th.trim, 0.1, 0.04, 0.04, 0.8, 1.07, -1.76);
  B2('gls', '#3d2a1c', 0.6, 1.1, 2.0, -5.55, 0.55, -3.0); B2('gls', th.trim, 0.64, 0.05, 2.04, -5.55, 1.12, -3.0); ib2(-5.9, -5.2, -4.05, -1.95);
  [['#3f7d4a', 0.32], ['#7a1f1a', 0.28], ['#c9a227', 0.24], ['#2e4a6b', 0.3], ['#f3efe2', 0.22], ['#3f7d4a', 0.34]].forEach(([c, h], i) => { C2('glass', c, 0.06, h, -5.55, 1.15 + h / 2, -3.7 + i * 0.28, 8); C2('glass', c, 0.025, 0.1, -5.55, 1.2 + h, -3.7 + i * 0.28, 6); });
  B2('mat', '#3d2a1c', 0.5, 0.04, 0.3, -5.5, 1.16, -2.1); for (let k = 0; k < 3; k++) C2('glass', '#cfe9ff', 0.04, 0.09, -5.6 + k * 0.1, 1.23, -2.1, 8);
  B2('mat', th.sofa, 0.9, 0.42, 2.4, -5.35, 0.21, 2.5); B2('mat', th.sofa, 0.25, 0.55, 2.4, -5.72, 0.7, 2.5); for (const dz of [-1.15, 1.15]) B2('mat', th.sofa, 0.9, 0.62, 0.2, -5.35, 0.31, 2.5 + dz); for (const dz of [-0.6, 0.6]) B2('gls', th.sofa, 0.7, 0.14, 1.0, -5.3, 0.49, 2.5 + dz); ib2(-5.9, -4.85, 1.25, 3.75);
  B2('gls', '#5c3a24', 0.7, 0.06, 1.2, -4.1, 0.42, 2.5); for (const [dx, dz] of [[-0.3, -0.55], [0.3, -0.55], [-0.3, 0.55], [0.3, 0.55]]) B2('mat', '#3d2b1d', 0.05, 0.4, 0.05, -4.1 + dx, 0.2, 2.5 + dz); ib2(-4.5, -3.7, 1.85, 3.15); C2('gls', th.trim, 0.12, 0.04, -4.1, 0.47, 2.2, 12); B2('mat', '#f3efe2', 0.24, 0.015, 0.32, -4.1, 0.46, 2.8, 0.3);
  B2('gls', '#3d2a1c', 0.5, 0.7, 0.5, -5.5, 0.35, 0.6); ib2(-5.8, -5.2, 0.3, 0.9); C2('gls', '#201e1d', 0.2, 0.03, -5.5, 0.72, 0.6, 16); B2('gls', th.trim, 0.04, 0.04, 0.3, -5.4, 0.76, 0.6); C2('gls', th.trim, 0.04, 0.35, -5.4, 0.9, 0.85, 8, 6);
  B2('gls', '#3d2a1c', 0.42, 2.6, 2.6, 5.75, 1.3, 1.5); ib2(5.5, 6, 0.2, 2.8); const bk = ['#7a1f1a', '#2e4a6b', '#3f7d4a', '#c9a227', '#201e1d', '#f3efe2'];
  for (let r = 0; r < 4; r++) { B2('mat', '#2a1a14', 0.44, 0.04, 2.5, 5.73, 0.35 + r * 0.6, 1.5); for (let i = 0; i < 9; i++) { const h = 0.32 + ((i * 7 + r * 3) % 5) * 0.035; B2('mat', bk[(i + r) % 6], 0.3, h, 0.2, 5.68, 0.37 + r * 0.6 + h / 2, 0.45 + i * 0.25 + (i > 5 ? 0.15 : 0)); } }
  B2('gls', th.trim, 2.2, 1.7, 0.08, 0, 2.5, -5.78); B2('mat', th.paint, 1.95, 1.45, 0.02, 0, 2.5, -5.72); for (const [dx, c, r] of [[-0.42, th.fur1, 0.2], [0.42, th.fur2, 0.18]]) { S2('mat', c, r, dx, 2.7, -5.7, 0.6); B2('mat', th.coat, r * 2.8, 0.55, 0.02, dx, 2.15, -5.7); }
  B2('glo', '#fff1c8', 0.6, 0.06, 0.04, 0, 3.45, -5.74);
  for (const [x, z] of [[-5.85, -1.6], [-5.85, 3.6], [5.85, -1.6], [5.85, 3.9]]) { B2('gls', th.trim, 0.06, 0.3, 0.16, x, 2.6, z); B2('glo', '#fff1c8', 0.1, 0.18, 0.12, x + (x < 0 ? 0.08 : -0.08), 2.75, z); }
  C2('gls', th.trim, 0.2, 0.05, -5.2, 0.03, 4.9, 12); C2('gls', '#201e1d', 0.025, 1.6, -5.2, 0.85, 4.9, 6); C2('mat', '#f3efe2', 0.32, 0.4, -5.2, 1.75, 4.9, 14, 0.6); S2('glo', '#fff1c8', 0.1, -5.2, 1.62, 4.9); rg(-5.2, 4.9, 0.32);
  C2('gls', '#5c3a24', 0.2, 0.06, 5.0, 0.03, 4.8, 12); C2('gls', '#5c3a24', 0.05, 0.75, 5.0, 0.4, 4.8, 6); S2('mat', '#2e86b8', 0.3, 5.0, 1.08, 4.8); S2('mat', '#3f7d4a', 0.16, 5.12, 1.18, 4.62, 0.7); lob.tor('gls', th.trim, 0.33, 0.025, BX + 5.0, LY + 1.08, LZ + 4.8, Math.PI / 2); rg(5.0, 4.8, 0.36);
  C2('mat', '#3d3b3a', 0.3, 0.55, -5.2, 0.28, -5.2, 12); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; S2('mat', k % 2 ? '#3d6b4a' : '#4f8a5c', 0.24, -5.2 + Math.cos(a) * 0.2, 0.85 + (k % 3) * 0.12, -5.2 + Math.sin(a) * 0.2, 1.3); } rg(-5.2, -5.2, 0.35);
  for (const x of [-1.2, 1.2]) for (let z = 0.6; z < 5.6; z += 0.8) B2('mat', th.trim, 0.07, 0.012, 0.36, x, 0.02, z);
  if (pool) { const W = '#ffc878'; pool(BX, LY + 0.03, LZ - 1.6, 2.6, W); pool(BX, LY + 2.3, LZ - 5.7, 1.3, '#fff1c8', 0); pool(BX - 5.2, LY + 0.03, LZ + 4.9, 1.2, W);   // s728r table, portrait, floor lamp
    for (const [x, z] of [[-5.85, -1.6], [-5.85, 3.6], [5.85, -1.6], [5.85, 3.9]]) pool(BX + (x < 0 ? -5.78 : 5.78), LY + 2.7, LZ + z, 0.9, W, x < 0 ? Math.PI / 2 : -Math.PI / 2); }
}
