// QUIRK'S BAR SHIFT (s360): Ben's 2D game (minigames/dsf/logic/quirks-bar.js) played BEHIND THE REAL BAR, rules 1:1
// (4 shifts, customers on 4 stools + a queue of 4, patience, 10 drinks: 4 on tap + 6 shaken from the speed rail,
// ice 2 cubes a grab, one drink in four neat, pour bands, shake band, wrong drink = down the drain, score = served*0.46 +
// accuracy*0.34 + patience*0.2 - wrong*3). The fox steps behind the bar on the red ring, the camera looks down onto the
// bar top: real foxes sit on the stools with a ticket in front of each, a brass beer tap, an ice well, six bottles,
// the mixing glass + shaker tin, a lit FILL gauge and a SHAKE dial. Portrait: the console kit turns the view 90°,
// tickets redraw upright and the gauge turns with the view.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BOTTLES = [{ key: 'amber', fill: '#d9a84e', cap: '#8f6b28' }, { key: 'rose', fill: '#d9628a', cap: '#8f2b4e' }, { key: 'teal', fill: '#2fbfae', cap: '#1c7a70' },
  { key: 'violet', fill: '#8a6ad9', cap: '#4e3a8f' }, { key: 'green', fill: '#6f9d4a', cap: '#3f6b28' }, { key: 'cream', fill: '#e8dcc0', cap: '#a89670' }];
const BFILL = {}; BOTTLES.forEach(b => { BFILL[b.key] = b.fill; });
const DRINKS = [
  { name: 'Root Beer', kind: 'tap', colour: '#95561f', head: true, ice: 6 }, { name: 'Slug-o-Kola', kind: 'tap', colour: '#3f9455', head: true, ice: 6 },
  { name: 'Bloodvine', kind: 'tap', colour: '#b02334', head: false, ice: 0 }, { name: 'Romulon Ale', kind: 'tap', colour: '#2f6bcf', head: true, ice: 6 },
  { name: 'Warp Core Breech', kind: 'shaken', colour: '#2fd6c0', mix: ['teal', 'violet'], ice: 6 }, { name: 'Samerian Sunset', kind: 'shaken', colour: '#e06a8a', mix: ['rose', 'amber'], ice: 6 },
  { name: 'Black Hole', kind: 'shaken', colour: '#5a3fa0', mix: ['violet', 'green'], ice: 6 }, { name: 'Tranyo', kind: 'shaken', colour: '#e8913a', mix: ['amber', 'cream'], ice: 6 },
  { name: 'Kanor', kind: 'shaken', colour: '#cfc63f', mix: ['amber', 'green'], ice: 6 }, { name: 'Raktajine', kind: 'shaken', colour: '#53341f', mix: ['cream', 'violet'], ice: 0 }];
const ICE_PER_GRAB = 2, MAX_QUEUE = 4, POUR_RATE = 30, SHAKE_PER = 11;
const ICE_PILE = [[-3.2, 8.2, -12], [0.7, 9.2, 16], [3.9, 7.4, -6], [-2.5, 4.2, 22], [1.5, 4.9, -18], [-0.4, 0.8, 9]];
const SPECIES = [{ fur: '#ee7d24', dark: '#b8531a', inner: '#f9ecd9', cloth: '#1f3350', clothDark: '#16263c' }, { fur: '#dedcd6', dark: '#a8a6a0', inner: '#f6f4ef', cloth: '#4a3a5c', clothDark: '#332745' },
  { fur: '#9a6f4a', dark: '#6b4a2c', inner: '#d9bb96', cloth: '#3f5d47', clothDark: '#2b4232' }, { fur: '#f0e6da', dark: '#bfae99', inner: '#f8f2ea', cloth: '#8f2b1e', clothDark: '#661a10' },
  { fur: '#8fb8d6', dark: '#5c86a8', inner: '#e0f0fa', cloth: '#2f4a3a', clothDark: '#1f3327' }, { fur: '#c8a86a', dark: '#95783f', inner: '#f2e6c8', cloth: '#3a2f4a', clothDark: '#261f33' }];
const SHIFTS = [{ name: 'Quiet shift', total: 6, every: 5.6, patience: 26, pourTol: 13, shakeTol: 20, need: 5 }, { name: 'Freighter crews in', total: 9, every: 4.6, patience: 23, pourTol: 11, shakeTol: 17, need: 6 },
  { name: 'Docking day rush', total: 12, every: 3.8, patience: 20, pourTol: 9.5, shakeTol: 14, need: 7 }, { name: 'Station\u2019s birthday', total: 15, every: 3.2, patience: 18, pourTol: 8, shakeTol: 12, need: 8 }];
function rng(seed) { let s = seed + 0x9e3779b9; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// the 2D lounge loop: walking bass, brushed tick, a lazy vibe melody
const MUSIC = (() => { const notes = [], bass = [38, 45, 41, 48, 36, 43, 40, 47];
  bass.forEach((m, i) => { notes.push({ b: i * 4, m, d: 3.4, v: 'bass' }); notes.push({ b: i * 4 + 2, m: m + 7, d: 1.4, v: 'bass' }); });
  [[1, 74], [2.5, 77], [4, 79], [6.5, 77], [9, 74], [10.5, 72], [13, 69], [17, 76], [18.5, 79], [21, 81], [23.5, 79], [25, 76], [27.5, 72], [30, 74]].forEach(p => notes.push({ b: p[0], m: p[1], d: 1.8, v: 'vibe' }));
  for (let b = 0; b < 32; b += 1) notes.push({ b: b + 0.5, m: 92, d: 0.07, v: 'tick' }); return { notes, beats: 32, spb: 0.44 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
let CID = 0;

export function makeBarShift(K, { group, OX, OZ = 0, audio, save, LOW, makeFox, animFox, portrait = () => false, hooks = {}, theme: V = {} }) {
  const { THREE, glowSprite, toon } = K;
  // s478 per-station versions: V = { title, where, kicker, names: [10 drink names], stat, shiftNames }  (OZ shifts the bar in z like OX does in x)
  const DR = V.names ? DRINKS.map((d, i) => ({ ...d, name: V.names[i] || d.name })) : DRINKS, PFX = V.stat || 'dsfBar', BOSS = V.boss || 'Quirk';
  // bar-local layout (the bar top is z -6.5..-7.9 at y 1.24; the barkeep side is -z)
  const YT = 1.24, SX = [-3.4, -2.0, -0.6, 0.8], TZ = -6.78, TW = 1.28, TD = 0.46, SEATZ = -5.72;
  const TAP = { x: 1.75, z: -7.35 }, STN = { x: -0.15, z: -7.4 }, ICE = { x: -1.55, z: -7.4, r: 0.4 }, GAU = { x: 0.85, z: -7.42 }, BZ = -7.45, BX = BOTTLES.map((_, i) => -2.4 - i * 0.47);
  const CX = -1.3, CZ = -6.925, SW = 7.2, SH = 2.75, STAND = { x: CX, z: -9.0 };
  const RED = '#ec3013', GOLD = '#f0c040', INK = '#f3f2f2';
  const root = new THREE.Group(); group.add(root);
  const tx = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const mesh = (geo, mat, x, y, z, p = root) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  const flat = (geo, mat, x, y, z, p = root) => { const m = mesh(geo, mat, x, y, z, p); m.rotation.x = -Math.PI / 2; return m; };
  const add = (c, o = 0) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const brass = toon('#c8a050', { emissive: new THREE.Color('#4a3008'), emissiveIntensity: 0.45 }), steel = toon('#b9c2c8', { emissive: new THREE.Color('#1c2228'), emissiveIntensity: 0.3 }), dark = toon('#141010');
  const yawers = [];
  const yawG = (x, y, z, p = root) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); yawers.push(g); return g; };

  // ---- tickets: one mat in front of each stool (canvas redraws upright for portrait)
  const tickets = SX.map((x, i) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 184; const t = tx(cv);
    const m = flat(new THREE.PlaneGeometry(TW, TD), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, YT + 0.006, TZ); m.rotation.z = Math.PI; m.visible = false;
    const glass = new THREE.Group(); glass.position.set(x + 0.42, YT, TZ - 0.02); root.add(glass); glass.visible = false;
    mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.26, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#dff2ff', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }), 0, 0.13, 0, glass);
    const gl = mesh(new THREE.CylinderGeometry(0.1, 0.082, 0.2, 16), toon('#95561f'), 0, 0.105, 0, glass);
    return { cv, t, m, key: '', glass, gl, drinkT: 0 }; });
  const frameSh = new THREE.Shape(); frameSh.moveTo(-TW / 2 - 0.07, -TD / 2 - 0.07); frameSh.lineTo(TW / 2 + 0.07, -TD / 2 - 0.07); frameSh.lineTo(TW / 2 + 0.07, TD / 2 + 0.07); frameSh.lineTo(-TW / 2 - 0.07, TD / 2 + 0.07); frameSh.closePath();
  { const h = new THREE.Path(); h.moveTo(-TW / 2, -TD / 2); h.lineTo(-TW / 2, TD / 2); h.lineTo(TW / 2, TD / 2); h.lineTo(TW / 2, -TD / 2); h.closePath(); frameSh.holes.push(h); }
  const tFrame = flat(new THREE.ShapeGeometry(frameSh), add('#ffffff'), 0, YT + 0.008, TZ);
  // ---- the beer tap: brass column, swan neck, red-knob lever, drip tray
  const tapG = new THREE.Group(); tapG.position.set(TAP.x, YT, 0); root.add(tapG);
  mesh(new THREE.BoxGeometry(0.52, 0.03, 0.42), toon('#2a2e32'), 0, 0.015, TAP.z, tapG); for (let i = -2; i <= 2; i++) mesh(new THREE.BoxGeometry(0.46, 0.012, 0.018), steel, 0, 0.034, TAP.z + i * 0.07, tapG);
  mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 20), brass, 0, 0.025, -7.82, tapG); mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.75, 16), brass, 0, 0.4, -7.82, tapG);
  { const neck = mesh(new THREE.TorusGeometry(0.235, 0.034, 8, 20, Math.PI), brass, 0, 0.75, -7.585, tapG); neck.rotation.y = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.14, 10), brass, 0, 0.68, TAP.z, tapG); }
  const lever = new THREE.Group(); lever.position.set(0, 0.78, -7.86); tapG.add(lever); mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.36, 8), dark, 0, 0.18, 0, lever); const knobM = toon(RED, { emissive: new THREE.Color('#5a0a04'), emissiveIntensity: 0.6 }); mesh(new THREE.SphereGeometry(0.085, 14, 10), knobM, 0, 0.38, 0, lever);
  const tapGlow = glowSprite(0, 1.16, -7.86, 0xffd27a, 0.9, 0, tapG);
  // ---- the ice well (cubes pile, tongs)
  mesh(new THREE.CylinderGeometry(ICE.r, ICE.r - 0.03, 0.14, 28, 1, true), steel, ICE.x, YT + 0.07, ICE.z); { const r = mesh(new THREE.TorusGeometry(ICE.r, 0.02, 6, 32), steel, ICE.x, YT + 0.14, ICE.z); r.rotation.x = Math.PI / 2; }
  flat(new THREE.CircleGeometry(ICE.r - 0.02, 28), toon('#2a4a5a'), ICE.x, YT + 0.02, ICE.z);
  const cubeG = new THREE.BoxGeometry(0.085, 0.085, 0.085), cubeM = toon('#e6f8ff', { emissive: new THREE.Color('#5ab8d8'), emissiveIntensity: 0.25, transparent: true, opacity: 0.9 });
  { const N = LOW ? 14 : 22, im = new THREE.InstancedMesh(cubeG, cubeM, N), o = new THREE.Object3D(); for (let i = 0; i < N; i++) { const a = i * 2.4, r = Math.sqrt(i / N) * (ICE.r - 0.1); o.position.set(ICE.x + Math.cos(a) * r, YT + 0.06 + (1 - r / ICE.r) * 0.07 + (i % 3) * 0.015, ICE.z + Math.sin(a) * r); o.rotation.set(a, a * 0.7, a * 1.3); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } root.add(im); }
  const iceGlow = flat(new THREE.RingGeometry(ICE.r + 0.04, ICE.r + 0.12, 40), add('#9fe8ff'), ICE.x, YT + 0.02, ICE.z);
  const tongs = new THREE.Group(); root.add(tongs); tongs.visible = false; for (const s of [-1, 1]) { const b = mesh(new THREE.BoxGeometry(0.025, 0.025, 0.36), steel, s * 0.06, 0.06, -0.16, tongs); b.rotation.y = s * 0.12; }
  const carry = [0, 1].map(i => mesh(cubeG, cubeM, (i - 0.5) * 0.09, 0, 0.02, tongs));
  // ---- the speed rail: six bottles
  mesh(new THREE.BoxGeometry(BX[0] - BX[5] + 0.42, 0.05, 0.3), brass, (BX[0] + BX[5]) / 2, YT + 0.025, BZ);
  const bottles = BOTTLES.map((b, i) => { const g = new THREE.Group(); g.position.set(BX[i], YT + 0.05, BZ); root.add(g);
    const body = toon(b.fill, { emissive: new THREE.Color(b.fill), emissiveIntensity: 0.25, transparent: true, opacity: 1 }), cap = toon(b.cap, { transparent: true, opacity: 1 });
    mesh(new THREE.CylinderGeometry(0.1, 0.105, 0.34, 16), body, 0, 0.17, 0, g); const sh = mesh(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), body, 0, 0.34, 0, g); void sh;
    mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.14, 10), body, 0, 0.47, 0, g); mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 10), cap, 0, 0.55, 0, g);
    mesh(new THREE.CylinderGeometry(0.106, 0.106, 0.11, 16, 1, true), toon('#f3f2f2', { transparent: true, opacity: 1 }), 0, 0.17, 0, g).material.color.set('#f3ead6');
    const ring = flat(new THREE.RingGeometry(0.15, 0.22, 28), add(GOLD), BX[i], YT + 0.055, BZ);
    return { g, body, cap, ring, k: 0, key: b.key }; });
  // ---- the vessel: mixing glass (layers, ice, foam) + the shaker tin
  const ves = new THREE.Group(); root.add(ves); ves.visible = false; const GH = 0.4;
  mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.44, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#dff2ff', transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide }), 0, 0.22, 0, ves);
  { const r = mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), 0, 0.44, 0, ves); r.rotation.x = Math.PI / 2; }
  mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 24), new THREE.MeshBasicMaterial({ color: '#cfe4f0', transparent: true, opacity: 0.5 }), 0, 0.01, 0, ves);
  const liqG = new THREE.CylinderGeometry(0.186, 0.15, 1, 24); liqG.translate(0, 0.5, 0);
  const liq = [0, 1, 2].map(() => { const m = mesh(liqG, toon('#95561f', { transparent: true, opacity: 1 }), 0, 0.02, 0, ves); m.visible = false; return m; }); liq[2].scale.set(1.02, 1, 1.02);
  const foam = mesh(new THREE.CylinderGeometry(0.19, 0.188, 1, 24), toon('#f6ecd2'), 0, 0, 0, ves); foam.visible = false;
  const vCubes = ICE_PILE.map(p => { const c = mesh(cubeG, cubeM, p[0] * 0.024, 0.04 + (13 - p[1]) / 28 * GH * 0.7, (p[2] > 0 ? 0.05 : -0.05), ves); c.rotation.set(p[2] * 0.02, p[2] * 0.05, 0); c.visible = false; return c; });
  const tin = mesh(new THREE.CylinderGeometry(0.215, 0.2, 0.32, 24), steel, 0, 0.58, 0, ves); tin.visible = false; { const r = mesh(new THREE.TorusGeometry(0.205, 0.018, 6, 28), steel, 0, 0.42, 0, tin); r.position.y = -0.16; r.rotation.x = Math.PI / 2; }
  // streams (tap + bottle) and the spill splash
  const streamM = new THREE.MeshBasicMaterial({ color: '#95561f', toneMapped: false }), stream = mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), streamM, 0, 0, 0); stream.visible = false;
  // ---- the station mat + the SHAKE dial + the FILL gauge
  mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.012, 36), toon('#1a1614'), STN.x, YT + 0.006, STN.z);
  const dcv = document.createElement('canvas'); dcv.width = dcv.height = 256; const dtex = tx(dcv); const dial = flat(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({ map: dtex, transparent: true, depthWrite: false, toneMapped: false }), STN.x, YT + 0.014, STN.z); dial.visible = false;
  const gcv = document.createElement('canvas'); gcv.width = 80; gcv.height = 256; const gtex = tx(gcv); const gYaw = yawG(GAU.x, YT + 0.012, GAU.z);
  mesh(new THREE.BoxGeometry(0.36, 0.02, 0.94), brass, 0, -0.01, 0, gYaw); const gauge = flat(new THREE.PlaneGeometry(0.28, 0.86), new THREE.MeshBasicMaterial({ map: gtex, toneMapped: false }), 0, 0, 0, gYaw);
  const stnGlow = flat(new THREE.RingGeometry(0.47, 0.56, 40), add('#ffffff'), STN.x, YT + 0.016, STN.z);
  // ---- next-step ring + pops + the banner
  const hint = flat(new THREE.RingGeometry(0.86, 1, 40), add('#ffffff'), 0, YT + 0.02, 0); hint.visible = false;
  const popTex = ok => tx(canvas(128, 128, (c) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#120d08'; c.lineWidth = 30; const d = () => { c.beginPath(); if (ok) { c.moveTo(26, 66); c.lineTo(54, 94); c.lineTo(104, 34); } else { c.moveTo(32, 32); c.lineTo(96, 96); c.moveTo(96, 32); c.lineTo(32, 96); } c.stroke(); }; d(); c.strokeStyle = ok ? '#8fe38f' : RED; c.lineWidth = 16; d(); }));
  const popOk = popTex(true), popBad = popTex(false), pops = [0, 1, 2, 3, 4, 5].map(() => { const m = flat(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: popOk, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0); m.visible = false; m.rotation.z = Math.PI; return { m, t: 0 }; });
  function pop(x, z, ok) { const p = pops.find(q => q.t <= 0) || pops[0]; p.t = 1.1; p.m.material.map = ok ? popOk : popBad; p.m.material.needsUpdate = true; p.m.position.set(x, YT + 0.4, z); p.m.visible = true; }
  const fcv = document.createElement('canvas'); fcv.width = 768; fcv.height = 300; const ftex = tx(fcv), fl = yawG(CX, YT + 0.75, CZ + 0.2); const fMat = new THREE.MeshBasicMaterial({ map: ftex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
  flat(new THREE.PlaneGeometry(2.3, 0.9), fMat, 0, 0, 0, fl); let flT = 0, flLife = 2;
  function banner(a, b, col = GOLD, life = 1.8) { const c = fcv.getContext('2d'), w = fcv.width, h = fcv.height; c.clearRect(0, 0, w, h); c.textAlign = 'left'; c.textBaseline = 'middle';
    const fit = (t, s) => { c.font = `900 ${s}px ${FONT}`; const tw = c.measureText(t).width; return tw > w - 60 ? s * (w - 60) / tw : s; };
    c.fillStyle = 'rgba(18,13,8,0.92)'; c.fillRect(0, b ? 0 : 50, w, b ? h : 200); c.strokeStyle = col; c.lineWidth = 10; c.strokeRect(5, (b ? 0 : 50) + 5, w - 10, (b ? h : 200) - 10);
    c.font = `900 ${fit(a.toUpperCase(), 120)}px ${FONT}`; c.fillStyle = col; c.fillText(a.toUpperCase(), 30, b ? 110 : 150); if (b) { c.font = `900 ${fit(b.toUpperCase(), 64)}px ${FONT}`; c.fillStyle = INK; c.fillText(b.toUpperCase(), 30, 226); }
    ftex.needsUpdate = true; flT = flLife = life; }
  // ---- the stand behind the bar (red ring) + the big hanging sign over the shift end of the bar (Ben: big, high contrast)
  const fr = flat(new THREE.RingGeometry(0.75, 0.95, 48), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.95 }), STAND.x, 0.04, STAND.z), fi = flat(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.18, depthWrite: false }), STAND.x, 0.035, STAND.z);
  const hang = new THREE.Group(); hang.position.set(CX, 4.3, -6.7); root.add(hang);
  for (const sx of [-1.4, 1.4]) mesh(new THREE.CylinderGeometry(0.02, 0.02, 4.7, 6), toon('#111'), sx, 2.35, 0, hang);
  mesh(new THREE.BoxGeometry(3.3, 1.0, 0.06), toon('#2a1a0c'), 0, 0, -0.04, hang);
  mesh(new THREE.PlaneGeometry(3.2, 0.92), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 294, (c, w, h) => { c.fillStyle = '#0e0d0c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e0a13c'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.textBaseline = 'middle'; c.fillStyle = '#e0a13c'; c.font = `900 118px ${FONT}`; c.fillText('BAR SHIFT', 40, 100); c.fillStyle = INK; c.font = `900 56px ${FONT}`; c.fillText('BEHIND THE BAR \u00b7 RED RING', 40, 212); })), toneMapped: false }), 0, 0, 0, hang);

  // ---- customers: real foxes on the stools (pooled, made on first use)
  const pool = [], actors = new Map();
  function mkFox(spi, k) { const S = SPECIES[spi]; const c = makeFox({ key: 'qbGuest' + k, torso: [S.cloth, S.clothDark, '#14100c'], look: { fur: S.fur, furDark: S.dark, muzzle: S.inner, chin: S.inner, fluff: S.inner, snout: S.fur, paw: S.dark, tailBase: S.dark, tailMid: S.fur, tailTip: S.inner }, outfit: ['vest', 'coat', 'suit', 'dress'][k % 4], eyes: ['#38bdf8', '#38bdf8'], mood: 'neutral' });
    root.add(c); c.visible = false; return c; }
  function getFox(spi) { let f = pool.find(p => !p.busy && p.sp === spi); if (!f && pool.length >= (LOW ? 10 : 14)) f = pool.find(p => !p.busy); if (!f) { f = { c: mkFox(spi, pool.length), sp: spi, busy: false }; pool.push(f); } f.busy = true; f.c.visible = true; return f; }
  const seatAt = (a) => a.slot >= 0 ? [SX[a.slot], SEATZ] : a.q >= 0 ? [CX + 1.4 - a.q * 0.95, -3.7] : [a.x, -1.0];
  function syncActors(dt, T) { const want = new Map(); if (s) { s.stools.forEach((g, i) => g && want.set(g.id, { slot: i, q: -1, g })); s.queue.forEach((g, k) => want.set(g.id, { slot: -1, q: k, g })); }
    for (const [id, w] of want) { let a = actors.get(id); if (!a) { const f = getFox(w.g.spi), x = w.slot >= 0 ? SX[w.slot] : CX + 1.4 - w.q * 0.95; a = { f, c: f.c, x, z: -1.6, out: false, drink: 0, face: Math.PI, mood: 'neutral' }; actors.set(id, a); } a.slot = w.slot; a.q = w.q; a.g = w.g; }
    for (const [id, a] of actors) if (!want.has(id) && !a.out) { a.out = true; a.slot = -1; a.q = -1; }
    for (const [id, a] of actors) { const c = a.c; if (a.drink > 0) a.drink -= dt;
      const [tx2, tz2] = a.drink > 0 ? [a.x, a.z] : seatAt(a), dx = tx2 - a.x, dz = tz2 - a.z, d = Math.hypot(dx, dz); let spd = 0;
      if (d > 0.04) { const st = Math.min(d, (a.out ? 2.2 : 2.0) * dt); a.x += dx / d * st; a.z += dz / d * st; spd = 2.0; a.face = Math.atan2(dx, dz); }
      else if (a.out && a.drink <= 0) { a.f.busy = false; c.visible = false; actors.delete(id); continue; } else a.face = Math.PI;
      let df = a.face - c.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); c.rotation.y += df * Math.min(1, dt * 8);
      const g = a.g, pf = g && !a.out ? clamp(g.pat / g.max, 0, 1) : 1; c.userData.mood = a.out ? (a.mood || 'happy') : pf > 0.5 ? 'neutral' : pf > 0.25 ? 'stern' : 'sad';
      animFox(c, dt, spd); const P2 = c.userData.P, seated = !a.out && a.slot >= 0 && d <= 0.04 || a.drink > 0;
      c.position.set(a.x, seated ? 0.36 : 0, a.z);
      if (seated && P2 && P2.legs) { P2.legs[0].rotation.x = P2.legs[1].rotation.x = -1.35; if (P2.arms) { P2.arms[0].rotation.x = -0.9; P2.arms[1].rotation.x = a.drink > 0 ? -1.9 + Math.sin(T * 6) * 0.1 : -0.9; } } } }
  function clearActors() { for (const [, a] of actors) { a.f.busy = false; a.c.visible = false; } actors.clear(); }

  // ---- sound through the station mixer
  let bus = null, mStart = 0, mBar = 0, noise = null;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.014); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + dur + 0.03); }
  function burst(o) { const ac = AC(); if (!ac) return; if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 1.2, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; src.buffer = noise; src.loop = true; f.type = o.type || 'bandpass'; f.Q.value = o.q == null ? 1 : o.q; f.frequency.setValueAtTime(o.f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, o.f1), t + o.dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur); src.connect(f); f.connect(g); g.connect(audio.master || ac.destination); src.start(t); src.stop(t + o.dur + 0.05); }
  function sfx(k) { if (k === 'ticket') tone(880, 0.06, 0.035, 'triangle', 1180); else if (k === 'pour') burst({ f0: 900, f1: 500, dur: 0.2, gain: 0.035, type: 'lowpass', q: 0.8 });
    else if (k === 'bottle') tone(560, 0.06, 0.04, 'square', 780); else if (k === 'shake') burst({ f0: 2400, f1: 1400, dur: 0.07, gain: 0.05, type: 'bandpass', q: 1.6 });
    else if (k === 'serve') [0, 7, 12].forEach((v, i) => setTimeout(() => tone(midiHz(76 + v), 0.14, 0.045, 'triangle'), i * 55));
    else if (k === 'great') [0, 4, 7, 12].forEach((v, i) => setTimeout(() => tone(midiHz(76 + v), 0.2, 0.05, 'triangle'), i * 80));
    else if (k === 'bad') tone(170, 0.24, 0.06, 'square', 108); else if (k === 'walk') { tone(300, 0.18, 0.05, 'square', 150); setTimeout(() => tone(220, 0.22, 0.05, 'square', 120), 190); }
    else if (k === 'arrive') tone(640, 0.07, 0.028, 'sine', 820); else if (k === 'close') [0, 5, 9, 12].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.26, 0.05, 'triangle'), i * 110)); }
  let pourHiss = 0;
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.02;
    if (nt.v === 'bass') { o.type = 'triangle'; peak = 0.046; } else if (nt.v === 'vibe') { o.type = 'sine'; peak = 0.036; } else { o.type = 'square'; peak = 0.007; }
    o.frequency.setValueAtTime(midiHz(nt.m), at0); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(peak, at0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.connect(g); g.connect(bus); o.start(at0); o.stop(at0 + dur + 0.03); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.9) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- the game (the 2D rules)
  let s = null, overlay = 'intro', cardInfo = null, open = false, ending = false, shakeFrom = null, shakeDir = 0, finishT = 0;
  function fresh(round) { const cfg = SHIFTS[round % SHIFTS.length], rand = rng(round * 5431 + 7), orders = [];
    const iced = DR.filter(x => (x.ice || 0) > 0), plain = DR.filter(x => (x.ice || 0) === 0), plainAt = {};
    for (let g = 0; g * 4 < cfg.total; g++) plainAt[g * 4 + Math.floor(rand() * 4)] = true;
    for (let i = 0; i < cfg.total; i++) { const pool2 = plainAt[i] ? plain : iced, d = pool2[Math.floor(rand() * pool2.length)], mixTargets = (d.mix || []).map(() => 30 + Math.floor(rand() * 16)), spi = Math.floor(rand() * SPECIES.length);
      orders.push({ drink: d, spi, target: 58 + Math.floor(rand() * 30), mixTargets, shakeTarget: 45 + Math.floor(rand() * 34) }); }
    return { round, cfg, orders, nextIn: 0.9, spawned: 0, stools: [null, null, null, null], queue: [], active: null, vessel: null, served: 0, walked: 0, wrong: 0, accSum: 0, accN: 0, patSum: 0, dumped: 0, done: false, title: 0, shaking: false, drag: null, iceDrag: null, greats: 0 }; }
  const ticket = () => s && s.active != null ? s.stools[s.active] : null;
  const vesselHome = v => v.drink.kind === 'tap' ? TAP : STN;
  function takeOrder(i) { if (!s.stools[i]) return; sfx('ticket'); const g = s.stools[i]; s.active = i;
    s.vessel = { drink: g.drink, phase: (g.drink.ice || 0) > 0 ? 'ice' : (g.drink.kind === 'tap' ? 'empty' : 'loading'), ice: 0, fill: 0, pours: [], step: 0, pouring: false, shake: 0, strokes: 0, spilled: false, readyT: 0, x: vesselHome(g.drink.kind === 'tap' ? { drink: g.drink } : { drink: g.drink }).x, z: vesselHome({ drink: g.drink }).z, pop: 0.4 }; }
  function startPour(key) { const v = s.vessel; if (!v || !ticket() || v.drink.kind !== 'shaken' || v.phase !== 'loading') return;
    if (key !== v.drink.mix[v.step]) { sfx('bad'); const bi = BOTTLES.findIndex(b => b.key === key); if (bi >= 0) pop(BX[bi], BZ, false); s.wrong++; return; }
    sfx('pour'); v.pouring = true; if (v.pours.length <= v.step) v.pours.push({ key, amount: 0 }); }
  function endPour() { const v = s.vessel; if (!v || !v.pouring) return; sfx('bottle'); v.pouring = false; v.step++; v.phase = v.step >= v.drink.mix.length ? 'shaking' : 'loading'; }
  function serve(i) { const g = s.stools[i], v = s.vessel; if (!g || !v || v.phase !== 'ready') return;
    if (g.drink.name !== v.drink.name) { sfx('bad'); pop(SX[i], TZ, false); s.wrong++; s.vessel = null; s.active = null; banner('Wrong drink', 'Down the drain', RED, 1.4); return; }
    const cfg = s.cfg; let acc;
    if (v.drink.kind === 'tap') acc = v.spilled ? 0 : clamp(100 - Math.abs(v.fill - g.target) * (100 / (cfg.pourTol * 2.6)), 0, 100);
    else { const shakeAcc = clamp(100 - Math.abs(v.shake - g.shakeTarget) * (100 / (cfg.shakeTol * 2.6)), 0, 100); let pourAcc = 0; const tg = g.mixTargets || [];
      tg.forEach((t, j) => { const got = v.pours[j] ? v.pours[j].amount : 0; pourAcc += clamp(100 - Math.abs(got - t) * (100 / (cfg.pourTol * 2.6)), 0, 100); }); pourAcc = tg.length ? pourAcc / tg.length : 0; acc = v.spilled ? 0 : pourAcc * 0.55 + shakeAcc * 0.45; }
    const patLeft = clamp(g.pat / g.max, 0, 1) * 100, great = acc >= 82; sfx(great ? 'great' : 'serve'); pop(SX[i], TZ, true); if (great) s.greats++;
    const a = actors.get(g.id); if (a) { a.drink = 1.3; a.mood = great ? 'excited' : 'happy'; if (great) a.c.userData.hop = 1; }
    const tk = tickets[i]; tk.drinkT = 1.3; tk.gl.material.color.set(v.drink.colour);
    banner(great ? 'Perfect pour' : acc >= 50 ? 'Served' : 'Served \u00b7 rough', Math.round(acc) + '% \u00b7 ' + v.drink.name, great ? '#8fe38f' : GOLD, 1.2);
    s.stools[i] = null; s.vessel = null; s.active = null; s.served++; s.accSum += acc; s.accN++; s.patSum += patLeft; hooks.serve && hooks.serve(great); }
  function step(dt) { if (overlay || !s || s.done) return; if (s.title > 0) { s.title -= dt; return; } const cfg = s.cfg;
    s.nextIn -= dt;
    if (s.nextIn <= 0 && s.spawned < cfg.total) { const o = s.orders[s.spawned], seat = s.stools.indexOf(null), g = { id: ++CID, drink: o.drink, spi: o.spi, target: o.target, mixTargets: o.mixTargets, shakeTarget: o.shakeTarget, pat: cfg.patience, max: cfg.patience };
      if (seat >= 0) { s.stools[seat] = g; sfx('arrive'); s.spawned++; s.nextIn = cfg.every; } else if (s.queue.length < MAX_QUEUE) { s.queue.push(g); s.spawned++; s.nextIn = cfg.every; } else s.nextIn = 0.6; }
    let open2 = s.stools.indexOf(null); while (open2 >= 0 && s.queue.length) { s.stools[open2] = s.queue.shift(); open2 = s.stools.indexOf(null); }
    s.stools.forEach((g, i) => { if (!g) return; g.pat -= dt; if (g.pat <= 0) { sfx('walk'); pop(SX[i], TZ, false); s.walked++; const a = actors.get(g.id); if (a) a.mood = 'sad';
      if (s.active === i) { s.active = null; s.vessel = null; s.dumped = 2.2; banner('Walked out', 'Poured away', RED, 1.4); } s.stools[i] = null; hooks.walk && hooks.walk(); } });
    if (s.dumped > 0) s.dumped -= dt;
    const v = s.vessel;
    if (v && v.pouring) { const cur = v.pours[v.step], below = v.pours.slice(0, v.step).reduce((a, p) => a + p.amount, 0); cur.amount += POUR_RATE * dt;
      if (below + cur.amount >= 112) { sfx('bad'); v.pouring = false; v.spilled = true; v.step = v.drink.mix.length; v.phase = 'shaking'; banner('Overflowed', 'Shake it anyway', RED, 1.2); } }
    if (v && v.phase === 'pouring') { v.fill = Math.min(118, v.fill + POUR_RATE * dt); if (v.fill >= 118) { sfx('bad'); v.phase = 'ready'; v.spilled = true; banner('Overflowed', 'Serve it or lose it', RED, 1.2); } }
    if (s.spawned >= cfg.total && s.stools.every(g => !g) && !s.queue.length) { s.done = true; sfx('close'); banner('Last orders', 'Shift closed', GOLD, 1.6); finishT = 1.1; } }
  function finish() { const cfg = s.cfg, tot = cfg.total, served = s.served, acc = s.accN ? Math.round(s.accSum / s.accN) : 0, keep = s.accN ? Math.round(s.patSum / s.accN) : 0, rate = Math.round(served / tot * 100);
    const score = clamp(Math.round(rate * 0.46 + acc * 0.34 + keep * 0.2) - s.wrong * 3, 0, 100), passed = served >= cfg.need, stars = !passed ? 0 : score >= 90 ? 3 : score >= 75 ? 2 : 1, gold = stars * 10;
    const prev = save.stat(PFX + 'Best', 0), isBest = save.best(PFX + 'Best', score); save.setStat(PFX + 'Shifts', save.stat(PFX + 'Shifts', 0) + 1);
    if (passed) { save.setStat(PFX + 'Round', s.round + 1); if (!save.flag(PFX + 'Done')) save.setFlag(PFX + 'Done'); } if (gold) save.addGold(gold);
    const col = (x, a2, b2) => x >= a2 ? '#8fe38f' : x >= b2 ? '#ffd23a' : RED, notes = [];
    if (s.walked) notes.push(s.walked + ' customer' + (s.walked > 1 ? 's' : '') + ' walked out.'); if (s.wrong) notes.push(s.wrong + ' wrong pour' + (s.wrong > 1 ? 's' : '') + ' down the drain.');
    if (!s.walked && served === tot) notes.push('Served the whole room without losing one.'); if (!passed) notes.push(BOSS + ' wanted ' + cfg.need + ' served. You got ' + served + '.');
    overlay = 'card'; cardInfo = { kicker: cfg.name + (passed ? ' \u00b7 closed out' : ' \u00b7 ' + BOSS + ' is not pleased'), title: score + ' / 100', stars,
      mood: !passed ? 'Not enough served. ' + BOSS + ' wants the shift run again.' : score >= 90 ? 'A blinding shift. ' + BOSS + ' almost smiled.' : score >= 75 ? 'Good shift. The till is happy.' : 'The drinks went out, more or less.',
      best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(prev, score), gold: gold ? '+' + gold + ' G' : '',
      rows: [{ name: 'Served', val: String(rate), pct: rate + '%', color: col(rate, 75, 45) }, { name: 'Accuracy', val: String(acc), pct: acc + '%', color: col(acc, 75, 45) }, { name: 'Patience', val: String(keep), pct: keep + '%', color: col(keep, 60, 30) }],
      notes, buttons: [!passed ? 'RUN THE SHIFT AGAIN' : s.round + 1 >= 4 ? 'OPEN UP AGAIN' : 'NEXT SHIFT', 'LEAVE THE BAR'] }; }
  function startShift() { const r = save.stat(PFX + 'Round', 0) % SHIFTS.length; s = fresh(r); s.title = 1.7; banner(s.cfg.name, s.cfg.total + ' customers \u00b7 serve ' + s.cfg.need, GOLD, 1.8); }

  // ---- what to do next (ring + top-bar line)
  function next() { if (!s || overlay || s.done || s.title > 0) return null; const v = s.vessel, tk = ticket();
    if (!v || !tk) { let bi = -1, bp = 9; s.stools.forEach((g, i) => { if (g && g.pat / g.max < bp) { bp = g.pat / g.max; bi = i; } }); return bi >= 0 ? { kind: 'ticket', i: bi } : null; }
    if (s.drag) return { kind: 'ticket', i: s.active };
    if (v.phase === 'ice') return s.iceDrag ? { kind: 'at', x: v.x, z: v.z, r: 0.34 } : { kind: 'at', x: ICE.x, z: ICE.z, r: ICE.r + 0.1 };
    if (v.drink.kind === 'tap' && (v.phase === 'empty' || v.phase === 'pouring')) return { kind: 'tap' };
    if (v.phase === 'loading') { const bi = BOTTLES.findIndex(b => b.key === v.drink.mix[v.step]); return { kind: 'at', x: BX[bi], z: BZ, r: 0.24 }; }
    if (v.phase === 'shaking') return { kind: 'at', x: STN.x, z: STN.z, r: 0.5 };
    if (v.phase === 'ready') return { kind: 'at', x: v.x, z: v.z, r: 0.34 }; return null; }
  function hintLine() { if (!s) return ''; if (s.title > 0) return s.cfg.name; if (s.done) return 'Last orders'; if (s.dumped > 0 && !s.vessel) return 'Poured away'; const v = s.vessel, tk = ticket();
    if (!v || !tk) return s.stools.some(g => g) ? 'Tap a customer to take their order' : 'Waiting for customers';
    const pre = tk.drink.name + ' \u00b7 '; let tol = s.cfg.pourTol;
    if (v.phase === 'ice') { const left = (v.drink.ice || 0) - v.ice; return pre + (left > ICE_PER_GRAB ? 'drag ice to the glass \u00b7 ' + left + ' more' : 'last of the ice'); }
    if (v.drink.kind === 'tap') { if (v.phase === 'empty') return pre + 'hold the tap'; if (v.phase === 'pouring') return pre + (v.fill > tk.target + tol ? 'too full' : 'let go in the green band'); return pre + (v.spilled ? 'overflowed \u00b7 ' : '') + 'drag it to the customer'; }
    if (v.phase === 'loading') return pre + (v.pouring ? 'let go in the green band' : 'hold the lit bottle'); if (v.phase === 'shaking') return pre + (v.strokes ? 'shake into the gold band' : 'drag side to side to shake');
    return pre + 'drag it to the customer'; }

  // ---- live canvases
  function rr2(c, x, y, w, h) { c.fillRect(x, y, w, h); }
  function drawTicket(i, g) { const T2 = tickets[i], pf = clamp(g.pat / g.max, 0, 1), act = s.active === i, pr = portrait(), key = g.id + '|' + act + '|' + Math.round(pf * 40) + '|' + pr; if (key === T2.key) return; T2.key = key;
    const c = T2.cv.getContext('2d'), W2 = T2.cv.width, H2 = T2.cv.height; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = act ? '#2a0d08' : '#120d08'; c.fillRect(0, 0, W2, H2);
    // portrait draws in a 184 x 512 upright space (screen right = canvas down)
    let w = W2, h = H2; if (pr) { c.setTransform(0, 1, -1, 0, W2, 0); w = H2; h = W2; }
    c.strokeStyle = act ? RED : '#c8a050'; c.lineWidth = act ? 16 : 8; c.strokeRect(c.lineWidth / 2, c.lineWidth / 2, w - c.lineWidth, h - c.lineWidth);
    const d = g.drink, pcol = pf > 0.5 ? '#2f9d4a' : pf > 0.25 ? '#e07a1f' : '#e0321f';
    const glyph = (gx, gy, s2) => { if (d.kind === 'tap') { c.beginPath(); c.moveTo(gx - 26 * s2, gy - 34 * s2); c.lineTo(gx + 26 * s2, gy - 34 * s2); c.lineTo(gx + 20 * s2, gy + 34 * s2); c.lineTo(gx - 20 * s2, gy + 34 * s2); c.closePath(); c.fillStyle = d.colour; c.fill(); if (d.head) { c.fillStyle = '#f6ecd2'; c.fillRect(gx - 26 * s2, gy - 34 * s2, 52 * s2, 14 * s2); } c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); }
      else { const tg = g.mixTargets || [], tot = tg.reduce((a, t) => a + t, 0) || 1; let y0 = gy + 34 * s2; d.mix.forEach((k, j) => { const hh = 68 * s2 * (tg[j] || 0) / tot; c.fillStyle = BFILL[k]; c.fillRect(gx - 24 * s2, y0 - hh, 48 * s2, hh); y0 -= hh; }); c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(gx - 24 * s2, gy - 34 * s2, 48 * s2, 68 * s2); }
      if (d.ice) { c.fillStyle = '#bfefff'; c.fillRect(gx + 40 * s2, gy - 30 * s2, 28 * s2, 28 * s2); c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(gx + 40 * s2, gy - 30 * s2, 28 * s2, 28 * s2); } };
    c.textBaseline = 'middle'; c.textAlign = 'left';
    if (!pr) { glyph(62, 82, 1); const nm = d.name.toUpperCase(); let fs = 54; c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(nm).width, room = w - 160; if (tw > room) { fs *= room / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = INK; c.fillText(nm, 140, 60);
      c.font = `800 34px ${FONT}`; c.fillStyle = '#e0a13c'; c.fillText((d.kind === 'tap' ? 'ON TAP' : 'SHAKEN') + ' \u00b7 ' + (d.ice ? 'ICE' : 'NEAT'), 140, 108);
      c.fillStyle = '#3a3836'; rr2(c, 20, 146, w - 40, 22); c.fillStyle = pcol; rr2(c, 20, 146, (w - 40) * pf, 22); }
    else { glyph(70, 110, 1.15); c.font = `900 44px ${FONT}`; c.fillStyle = '#e0a13c'; c.fillText(d.kind === 'tap' ? 'TAP' : 'SHAKE', 20, 220); c.fillStyle = INK; c.fillText(d.ice ? 'ICE' : 'NEAT', 20, 272);
      c.fillStyle = '#3a3836'; rr2(c, w - 46, 300, 24, h - 320); c.fillStyle = pcol; const ph = (h - 320) * pf; rr2(c, w - 46, h - 20 - ph, 24, ph);
      if (act) { c.fillStyle = RED; c.font = `900 40px ${FONT}`; c.fillText('NOW', 20, 340); } }
    c.setTransform(1, 0, 0, 1, 0, 0); T2.t.needsUpdate = true; }
  let gKey = '';
  function drawGauge() { const v = s && s.vessel, tk = ticket(); const lvl = L => clamp(L / 120, 0, 1); let key = 'off', layers = [], fillL = 0, fillC = '#000', band = null, head = false;
    if (v && tk && v.phase !== 'ready' && (v.drink.kind === 'tap' || v.phase === 'loading' || v.phase === 'shaking' && v.pours.length)) {
      const tol = s.cfg.pourTol; if (v.drink.kind === 'tap') { fillL = v.fill; fillC = v.drink.colour; band = [tk.target - tol, tk.target + tol]; head = v.drink.head && v.fill > 10; }
      else { let acc = 0; v.pours.forEach(p => { layers.push([acc, acc + p.amount, BFILL[p.key]]); acc += p.amount; }); fillL = acc; if (v.phase === 'loading') { const t = (tk.mixTargets || [])[v.step] || 0, below = v.pours.slice(0, v.step).reduce((a, p) => a + p.amount, 0); band = [below + t - tol, below + t + tol]; } }
      key = Math.round(fillL * 2) + '|' + (band ? band.map(Math.round).join(',') : '') + '|' + layers.length + '|' + fillC; }
    if (key === gKey) return; gKey = key; const c = gcv.getContext('2d'), w = gcv.width, h = gcv.height, y = L => h - 10 - lvl(L) * (h - 20);
    c.fillStyle = '#120d08'; c.fillRect(0, 0, w, h); c.fillStyle = '#26201c'; c.fillRect(10, 10, w - 20, h - 20);
    for (let k = 0; k <= 12; k++) { c.fillStyle = k % 4 === 0 ? '#c8a050' : '#5a4a38'; c.fillRect(10, y(k * 10) - 1, k % 4 === 0 ? 20 : 12, 2); }
    if (key !== 'off') { if (layers.length) layers.forEach(([a, b, col]) => { c.fillStyle = col; c.fillRect(16, y(b), w - 32, y(a) - y(b)); }); else { c.fillStyle = fillC; c.fillRect(16, y(fillL), w - 32, y(0) - y(fillL)); if (head) { c.fillStyle = '#f6ecd2'; c.fillRect(16, y(fillL), w - 32, 8); } }
      if (band) { c.fillStyle = 'rgba(80,230,120,0.32)'; c.fillRect(6, y(band[1]), w - 12, y(band[0]) - y(band[1])); c.strokeStyle = '#6ff09a'; c.lineWidth = 5; c.strokeRect(6, y(band[1]), w - 12, y(band[0]) - y(band[1])); }
      c.fillStyle = '#ffffff'; c.fillRect(0, y(fillL) - 3, w, 6); if (fillL > 100) { c.fillStyle = RED; c.fillRect(0, y(100) - 3, w, 6); } }
    c.strokeStyle = '#c8a050'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); gtex.needsUpdate = true; }
  let dKey = '';
  function drawDial() { const v = s && s.vessel, tk = ticket(); if (!v || !tk) return; const tol = s.cfg.shakeTol, tg = tk.shakeTarget, sf = x => clamp(x / 125, 0, 1), key = Math.round(v.shake) + '|' + tg + '|' + tol; if (key === dKey) return; dKey = key;
    const c = dcv.getContext('2d'), w = dcv.width, cx = w / 2, R = w / 2 - 16, a0 = -Math.PI / 2, A = x => a0 + sf(x) * Math.PI * 2; c.clearRect(0, 0, w, w); c.lineCap = 'butt';
    c.strokeStyle = 'rgba(18,13,8,0.9)'; c.lineWidth = 26; c.beginPath(); c.arc(cx, cx, R, 0, 6.283); c.stroke();
    c.strokeStyle = GOLD; c.lineWidth = 26; c.beginPath(); c.arc(cx, cx, R, A(Math.max(0, tg - tol)), A(tg + tol)); c.stroke();
    const inB = Math.abs(v.shake - tg) <= tol; c.strokeStyle = inB ? '#8fe38f' : '#ffffff'; c.lineWidth = 12; c.beginPath(); c.arc(cx, cx, R, a0, A(v.shake)); c.stroke(); dtex.needsUpdate = true; }

  // ---- 3D each frame
  let portraitWas = null;
  function layout() { const p = portrait(); if (p === portraitWas) return; portraitWas = p; for (const y of yawers) y.rotation.y = p ? Math.PI / 2 : Math.PI; for (const t of tickets) t.key = ''; }
  const shakeAxis = () => portrait() ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  function render3D(dt, T) { layout(); const pul = 0.5 + 0.5 * Math.sin(T * 5);
    fi.material.opacity = 0.12 + 0.1 * Math.sin(T * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); fr.visible = fi.visible = !open; hang.visible = !open;
    syncActors(dt, T);
    // tickets
    for (let i = 0; i < 4; i++) { const T2 = tickets[i], g = s && open ? s.stools[i] : null; T2.m.visible = !!g; if (g) drawTicket(i, g); if (T2.drinkT > 0) T2.drinkT -= dt; T2.glass.visible = T2.drinkT > 0; }
    // next-step guidance
    const nx = open ? next() : null; hint.visible = false; tFrame.material.opacity = 0; tapGlow.material.opacity = 0;
    if (nx) { if (nx.kind === 'ticket' && nx.i != null) { tFrame.position.x = SX[nx.i]; tFrame.material.opacity = 0.35 + 0.55 * pul; }
      else if (nx.kind === 'tap') { tapGlow.material.opacity = 0.4 + 0.5 * pul; hint.visible = true; hint.position.set(TAP.x, YT + 0.04, -7.6); hint.scale.setScalar(0.5 + 0.03 * pul); hint.material.opacity = 0.3 + 0.5 * pul; }
      else { hint.visible = true; hint.position.set(nx.x, YT + 0.06, nx.z); hint.scale.setScalar(nx.r * (1 + 0.06 * pul)); hint.material.opacity = 0.3 + 0.5 * pul; } }
    const v = s && open ? s.vessel : null, tk = ticket();
    iceGlow.material.opacity = v && v.phase === 'ice' ? 0.25 + 0.4 * pul : 0; stnGlow.material.opacity = v && v.phase === 'shaking' ? 0.2 + 0.4 * pul : 0;
    // tap lever + knob
    const pouringTap = v && v.phase === 'pouring'; lever.rotation.x += ((pouringTap ? -0.55 : 0) - lever.rotation.x) * Math.min(1, dt * 14); knobM.emissiveIntensity = v && v.drink.kind === 'tap' && v.phase !== 'ready' ? 0.9 + 0.4 * pul : 0.5;
    // tongs + carried ice
    tongs.visible = !!(v && s.iceDrag); if (tongs.visible) tongs.position.set(s.iceDrag.X, YT + 0.42, s.iceDrag.Z);
    // bottles: the wanted one glows + rises, the rest dim; a pouring bottle flies over the glass and tips
    for (let i = 0; i < 6; i++) { const b = bottles[i], loading = v && v.phase === 'loading', want = loading && v.drink.mix[v.step] === b.key, pouring = v && v.pouring && v.pours[v.step] && v.pours[v.step].key === b.key;
      b.k += ((pouring ? 1 : 0) - b.k) * Math.min(1, dt * 12); const k = b.k * b.k * (3 - 2 * b.k);
      const hx = BX[i], hy = YT + 0.05 + (want && !pouring ? 0.06 + 0.03 * Math.sin(T * 5) : 0), px = v ? v.x + 0.42 : hx, py = YT + 0.9, pz = v ? v.z : BZ;
      b.g.position.set(hx + (px - hx) * k, hy + (py - hy) * k, BZ + (pz - BZ) * k); b.g.rotation.z = 2.25 * k;
      const o = loading && !want ? 0.38 : 1; b.body.opacity = b.cap.opacity = o; b.body.emissiveIntensity = want ? 0.5 + 0.4 * pul : 0.25; b.ring.material.opacity = want ? 0.35 + 0.5 * pul : 0; }
    // vessel
    ves.visible = !!v; stream.visible = false; dial.visible = false;
    if (v) { const home = s.drag ? { x: s.drag.X, z: s.drag.Z } : vesselHome(v); v.x += (home.x - v.x) * Math.min(1, dt * (s.drag ? 30 : 9)); v.z += (home.z - v.z) * Math.min(1, dt * (s.drag ? 30 : 9));
      v.pop = Math.max(0, v.pop - dt); const sc = 1 - v.pop * 1.6; ves.scale.setScalar(Math.max(0.3, sc)); ves.position.set(v.x, YT + (s.drag ? 0.3 : 0), v.z); ves.rotation.set(0, 0, 0);
      if (s.shaking && v.phase === 'shaking') { const ax = shakeAxis(), o = Math.sin(T * 34) * 0.06; ves.position.addScaledVector(ax, o); if (ax.x) ves.rotation.z = Math.sin(T * 34) * 0.12; else ves.rotation.x = Math.sin(T * 34) * 0.12; }
      const yOf = L => GH * clamp(L / 100, 0, 1.12), shaken = v.drink.kind === 'shaken';
      for (const m of liq) m.visible = false; foam.visible = false;
      if (!shaken) { if (v.fill > 0.5) { const m = liq[0]; m.visible = true; m.material.color.set(v.drink.colour); m.material.opacity = 1; m.position.y = 0.02; m.scale.y = yOf(v.fill); if (v.drink.head && v.fill > 10) { foam.visible = true; foam.scale.y = v.phase === 'ready' ? 0.05 : 0.03; foam.position.y = 0.02 + yOf(v.fill) + foam.scale.y / 2 - 0.01; } } }
      else { const poured = v.pours.reduce((a, p) => a + p.amount, 0);
        if (v.phase === 'ready') { const m = liq[2]; m.visible = true; m.material.color.set(v.drink.colour); m.material.opacity = 1; m.position.y = 0.02; m.scale.y = yOf(Math.max(60, poured)); }
        else { let acc = 0; v.pours.forEach((p, j) => { if (j > 1) return; const m = liq[j]; m.visible = p.amount > 0.3; m.material.color.set(BFILL[p.key]); m.material.opacity = 1; m.position.y = 0.02 + yOf(acc); m.scale.y = Math.max(0.001, yOf(acc + p.amount) - yOf(acc)); acc += p.amount; });
          const bo = clamp(v.shake / 100, 0, 0.9); if (bo > 0.02 && poured > 0) { const m = liq[2]; m.visible = true; m.material.color.set(v.drink.colour); m.material.opacity = bo; m.position.y = 0.02; m.scale.y = yOf(poured) + 0.005; } } }
      vCubes.forEach((c, i) => { c.visible = i < Math.min(v.ice, vCubes.length); });
      // shaker tin: on while shaking, lifts off when it is ready
      if (shaken && v.phase === 'shaking') { tin.visible = true; tin.position.y = 0.58; } else if (shaken && v.phase === 'ready' && v.readyT > 0) { v.readyT -= dt; tin.visible = true; tin.position.y = 0.58 + (0.7 - v.readyT) * 0.9; } else tin.visible = false;
      // streams
      const top = YT + 0.02 + (shaken ? yOf(v.pours.reduce((a, p) => a + p.amount, 0)) : yOf(v.fill));
      if (pouringTap) { stream.visible = true; streamM.color.set(v.drink.colour); const y0 = YT + 0.61; stream.position.set(TAP.x, (y0 + top) / 2, TAP.z); stream.scale.set(1, Math.max(0.01, y0 - top), 1); }
      if (v.pouring && v.pours[v.step]) { stream.visible = true; streamM.color.set(BFILL[v.pours[v.step].key]); const y0 = YT + 0.54; stream.position.set(v.x + 0.02, (y0 + top) / 2, v.z); stream.scale.set(0.8, Math.max(0.01, y0 - top), 0.8); }
      if (shaken && (v.phase === 'loading' || v.phase === 'shaking')) { dial.visible = true; dial.position.set(STN.x, YT + 0.014, STN.z); drawDial(); } }
    drawGauge();
    for (const p of pops) { if (p.t > 0) { p.t -= dt; p.m.position.y += dt * 0.35; p.m.material.opacity = Math.min(1, p.t / 0.3); p.m.rotation.z = portrait() ? Math.PI / 2 : Math.PI; } p.m.visible = p.t > 0; }
    flT = Math.max(0, flT - dt); fMat.opacity = flT > 0 ? Math.min(1, flT / 0.3, (flLife - flT) / 0.12 + 0.01) : 0;
    if (finishT > 0) { finishT -= dt; if (finishT <= 0 && s && s.done && open && !ending) finish(); } }

  const toL = (gx, gy) => ({ X: CX - (gx / 100 - SW / 2), Z: CZ - (gy / 100 - SH / 2) });
  return {
    title: V.title || 'BAR SHIFT', where: V.where || 'Quirk\u2019s Bar \u00b7 behind the bar', W: SW * 100, H: SH * 100,
    surface: { c: new THREE.Vector3(OX + CX, YT + 0.1, OZ + CZ), u: new THREE.Vector3(-1, 0, 0), v: new THREE.Vector3(0, 0, -1), n: new THREE.Vector3(0, 1, 0), w: SW, h: SH, maxD: V.maxD || 5.0, maxY: V.maxY || 8.3 },
    stand: { x: OX + STAND.x, z: OZ + STAND.z, face: 0 }, _s: () => s,
    idle(dt, T) { if (!open) render3D(dt, T); },
    begin() { open = true; ending = false; overlay = 'intro'; cardInfo = null; s = fresh(save.stat(PFX + 'Round', 0) % SHIFTS.length); for (const t of tickets) t.key = '';
      const seen = new Set(); for (const o of s.orders.slice(0, 6)) if (!seen.has(o.spi) && pool.length < 6) { seen.add(o.spi); const f = getFox(o.spi); f.busy = false; f.c.visible = false; }
      hooks.open && hooks.open(true); },
    end() { ending = true; killMusic(); if (s) { s.vessel = null; s.active = null; s.drag = s.iceDrag = null; s.shaking = false; } clearActors(); s = null; open = false; for (const t of tickets) { t.m.visible = false; t.drinkT = 0; } hooks.open && hooks.open(false); },
    tick(dt, T, fly) { if (!open) return; dt = Math.min(0.045, dt); if (fly > 0.85 && !ending && overlay === null && s && !s.done) music(); else if (overlay !== null || ending) killMusic(); if (fly > 0.85) step(dt); render3D(dt, T); },
    down(gx, gy) { if (overlay || !s || s.done || s.title > 0) return; const { X, Z } = toL(gx, gy), v = s.vessel, dist = (p) => Math.hypot(X - p.x, Z - p.z);
      if (v && v.drink.kind === 'tap' && (v.phase === 'empty' || v.phase === 'pouring') && X > TAP.x - 0.55 && X < TAP.x + 0.6 && Z < -6.98 && Z > -8.3) { sfx('pour'); v.phase = 'pouring'; return; }
      if (v && v.phase === 'ready' && dist(v) < 0.55) { s.drag = { X, Z }; return; }
      if (v && v.phase === 'ice' && dist(ICE) < ICE.r + 0.2) { sfx('bottle'); s.iceDrag = { X, Z }; return; }
      if (v && v.drink.kind === 'shaken' && v.phase === 'loading' && Z < -6.98 && Z > -8.3) { for (let i = 0; i < 6; i++) if (Math.abs(X - BX[i]) < 0.235) { startPour(BOTTLES[i].key); return; } }
      if (v && v.phase === 'shaking' && dist(STN) < 0.7) { shakeFrom = portrait() ? Z : X; shakeDir = 0; s.shaking = true; return; }
      if (Z > TZ - TD / 2 - 0.08) for (let i = 0; i < 4; i++) if (Math.abs(X - SX[i]) < TW / 2 + 0.06 && s.stools[i]) { takeOrder(i); return; } },
    move(gx, gy) { if (overlay || !s) return; const { X, Z } = toL(gx, gy);
      if (s.iceDrag) { s.iceDrag.X = X; s.iceDrag.Z = Z; return; } if (s.drag) { s.drag.X = X; s.drag.Z = Z; return; }
      const v = s.vessel; if (s.shaking && v && v.phase === 'shaking') { const a = portrait() ? Z : X, dx = a - (shakeFrom == null ? a : shakeFrom), dir = dx > 0.05 ? 1 : dx < -0.05 ? -1 : 0;
        if (dir !== 0 && dir !== shakeDir) { shakeDir = dir; shakeFrom = a; sfx('shake'); v.strokes++; v.shake = Math.min(125, v.shake + SHAKE_PER); } } },
    up() { if (overlay || !s) return; const v = s.vessel;
      if (s.drag) { const p = s.drag; s.drag = null; let hit = -1; SX.forEach((x, i) => { if (Math.abs(p.X - x) < 0.75 && p.Z > -7.15) hit = i; }); if (hit >= 0) serve(hit); return; }
      if (s.iceDrag) { const p = s.iceDrag; s.iceDrag = null; if (!v || v.phase !== 'ice') return; if (Math.hypot(p.X - v.x, p.Z - v.z) > 0.6) return; sfx('shake'); const need = v.drink.ice || 0; v.ice = Math.min(need, v.ice + ICE_PER_GRAB); if (v.ice >= need) v.phase = v.drink.kind === 'tap' ? 'empty' : 'loading'; return; }
      if (v && v.pouring) { endPour(); return; } if (v && v.phase === 'pouring') { v.phase = 'ready'; return; }
      if (s.shaking) { shakeFrom = null; s.shaking = false; if (v && v.strokes > 0) { v.phase = 'ready'; v.readyT = 0.7; } } },
    hud() { if (overlay === 'intro') { const c = s ? s.cfg : SHIFTS[0], r = s ? s.round % 4 + 1 : 1;
        return { card: { kicker: (V.kicker || 'Quirk\u2019s Bar') + ' \u00b7 Shift ' + r + ' of 4 \u00b7 ' + c.name, title: 'Bar Shift', body: 'Tap a customer to take the order. Ice first, then HOLD the tap or the lit bottle and let go in the green band. Shaken drinks: drag side to side into the gold band. Drag the drink to the customer. Serve ' + c.need + ' of ' + c.total + '.', buttons: ['YES, PUT ME TO WORK!', 'NOT NOW'] } }; }
      if (overlay === 'card' && cardInfo) return { card: cardInfo };
      if (!s) return {}; const q = s.queue.length;
      return { where: hintLine(), showStats: true, stats: [['Served', s.served + '/' + s.cfg.total, s.served >= s.cfg.need ? '#8fe38f' : INK], ['Queue', String(q), q >= MAX_QUEUE ? RED : q ? '#ffd23a' : INK], ['Walked', String(s.walked), s.walked ? RED : INK]] }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); overlay = null; startShift(); return; } return 'leave'; }
      if (overlay === 'card') { if (i === 0) { overlay = null; cardInfo = null; clearActors(); startShift(); return; } return 'leave'; } },
  };
}
