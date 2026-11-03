// s427 RECORDED SPACE SOUNDS (Runway batch 1, sfx/*.mp3). A tiny sample player for the Space Map: one-shots + engine LOOPS.
// Recorded sound first, the synth kit (engine/fighter-sfx.js) is the fallback for anything not here. Mute = window.__8gMuted.
// LOOPS: Runway fades most "loops" in/out, so at load each loop buffer is trimmed past its fades and its seam is crossfaded
// (the last 0.35 s blended into the first) → it loops with no click or dip.
const V = 's447';
export const ONE_SHOTS = { shipLaser: 0.45, enemyLaser: 0.4, missile: 0.9, torpedo: 1, hullHit: 0.6, shieldHit: 0.55, shieldDown: 1, shieldUp: 1,
  shipExplodeSmall: 1, shipExplodeBig: 2, asteroidBump: 0.7, asteroidBreak: 0.8, boostStart: 1,
  // s428 batch 2 (Runway, 45 more)
  burstStart: 0.9, burstEnd: 1, flyBy: 2, lowHull: 1, scannerPing: 1, pickupCrate: 0.8, refuel: 2, towLatch: 1, dockLand: 2, undock: 2, swoopIn: 1,
  lanceCharge: 2, lanceFire: 3, stationTurret: 0.8, stargateOpen: 3, stargateJump: 2, siloHatch: 1, oreDrop: 1, buoyLight: 1,
  mothScreech: 2, mothPulse: 1, mothLaser: 0.5, serpentHiss: 1, creatureHit: 0.5, creatureDie: 2,
  machineSpot: 1, machineGlitch: 0.7, machineDown: 1, unhack: 2, pirateAlarm: 1, pirateBaseGun: 1, pirateTaunt: 2,
  thrustPuff: 0.4, thrustStart: 1, thrustStop: 1, footstepMetal: 0.3, teleport: 2, menuOpen: 0.5, menuSelect: 0.25, toast: 0.8, questStep: 1,
  // s590b the 9 SPECIAL WEAPONS (Runway batch 7, Ben)
  specTorpedo: 2, specMissile: 2.5, specLance: 2.5, specRail: 2, specFlak: 2, specMines: 2, specWeb: 2, specArc: 2, specEmp: 2.5 };   // value = max play length (s), the rest fades
export const LOOPS = ['thrustSmallLoop', 'thrustHeavyLoop', 'thrustHugeLoop', 'thrustBurstLoop', 'thrustPirateLoop', 'thrustMachineLoop', 'engineSmallLoop', 'engineLoop', 'engineHeavyLoop', 'engineHugeLoop', 'boostLoop', 'burstLoop', 'enginePirateLoop', 'engineMachineLoop', 'energyShieldHum', 'mothWings', 'nestPulse', 'shipyardWeld', 'mineArm'];
let ctx = null, master = null, loading = null; const buf = {}, last = {};
// s430 MIXER (Space Install Workshop → SOUNDS): a volume per sound (0-2, 1 = as recorded) + ALL, saved in localStorage space.sfx.v1
export const GROUPS = { SPACE: ['shipLaser', 'enemyLaser', 'missile', 'torpedo', 'hullHit', 'shieldHit', 'shieldDown', 'shieldUp', 'shipExplodeSmall', 'shipExplodeBig', 'asteroidBump', 'asteroidBreak', 'burstStart', 'burstEnd', 'boostStart', 'lowHull', 'scannerPing', 'pickupCrate', 'refuel', 'towLatch', 'dockLand', 'undock', 'swoopIn', 'flyBy'],
  THRUST: ['thrustSmallLoop', 'thrustHeavyLoop', 'thrustHugeLoop', 'thrustBurstLoop', 'thrustPirateLoop', 'thrustMachineLoop', 'thrustPuff', 'thrustStart', 'thrustStop'],
  'OLD ENGINES (not used)': ['engineSmallLoop', 'engineLoop', 'engineHeavyLoop', 'engineHugeLoop', 'burstLoop', 'boostLoop', 'enginePirateLoop', 'engineMachineLoop'],
  STATION: ['lanceCharge', 'lanceFire', 'stationTurret', 'stargateOpen', 'stargateJump', 'mineArm', 'siloHatch', 'oreDrop', 'shipyardWeld', 'buoyLight'],
  CREATURE: ['mothScreech', 'mothWings', 'mothPulse', 'mothLaser', 'serpentHiss', 'creatureHit', 'creatureDie', 'nestPulse'],
  MACHINE: ['machineSpot', 'machineGlitch', 'machineDown', 'unhack'], PIRATE: ['pirateAlarm', 'pirateBaseGun', 'pirateTaunt'],
  SPECIALS: ['specTorpedo', 'specMissile', 'specLance', 'specRail', 'specFlak', 'specMines', 'specWeb', 'specArc', 'specEmp'],
  DOCK: ['footstepMetal', 'energyShieldHum', 'teleport', 'menuOpen', 'menuSelect', 'toast', 'questStep'] };
const VKEY = 'space.sfx.v1', VDEF = { mothWings: 0.45, mothScreech: 0.6, mothPulse: 0.7, nestPulse: 0.7 };   // s430 the moths were too loud
let VOL = {}; try { VOL = JSON.parse(localStorage.getItem(VKEY) || '{}') || {}; } catch (e) {}
// s434 THRUST OPTIONS (Ben): OPTION 1 = the in-house renders (sfx/thrust*.wav), OPTION 2 = Runway (sfx/thrust2/*.mp3). localStorage space.thrust.v1 = '1' | '2' (default 2)
export const THRUST_KEYS = ['thrustSmallLoop', 'thrustHeavyLoop', 'thrustHugeLoop', 'thrustBurstLoop', 'thrustPirateLoop', 'thrustMachineLoop', 'thrustPuff', 'thrustStart', 'thrustStop'];
export const getThrustOpt = () => { try { return localStorage.getItem('space.thrust.v1') === '1' ? '1' : '2'; } catch (e) { return '2'; } };
export const setThrustOpt = o => { try { localStorage.setItem('space.thrust.v1', o); } catch (e) {} };
const pick = k => THRUST_KEYS.includes(k) && getThrustOpt() === '2' && buf[k + '@2'] ? k + '@2' : k;
export const getVol = k => VOL[k] ?? VDEF[k] ?? 1;
export function setVol(k, v) { VOL[k] = v; try { localStorage.setItem(VKEY, JSON.stringify(VOL)); } catch (e) {} if (master && k === '_all') master.gain.value = 0.8 * v; }
export function resetVols() { VOL = {}; try { localStorage.removeItem(VKEY); } catch (e) {} if (master) master.gain.value = 0.8; }
addEventListener('storage', e => { if (e.key === VKEY) { try { VOL = JSON.parse(e.newValue || '{}') || {}; if (master) master.gain.value = 0.8 * getVol('_all'); } catch (er) {} } });
function ac() { if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; } const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); master = ctx.createGain(); master.gain.value = 0.8 * getVol('_all'); master.connect(ctx.destination); return ctx; }
function seamless(b) { const sr = b.sampleRate, d0 = b.getChannelData(0); let pk = 0; for (const v of d0) pk = Math.max(pk, Math.abs(v));
  const env = (i, w) => { let s = 0; for (let k = i; k < Math.min(d0.length, i + w); k++) s += d0[k] * d0[k]; return Math.sqrt(s / w); }, W = Math.floor(sr * 0.05);
  let mid = 0; for (let i = Math.floor(d0.length * 0.3); i < d0.length * 0.7; i += W) mid += env(i, W); mid /= Math.max(1, Math.floor(d0.length * 0.4 / W));
  let a = 0; while (a < d0.length / 3 && env(a, W) < mid * 0.6) a += W; let e = d0.length - W; while (e > d0.length * 0.6 && env(e, W) < mid * 0.6) e -= W; e += W;
  const X = Math.floor(sr * 0.35), len = Math.max(sr, e - a - X), out = ctx.createBuffer(b.numberOfChannels, len, sr);
  for (let c = 0; c < b.numberOfChannels; c++) { const s = b.getChannelData(c), o = out.getChannelData(c); for (let i = 0; i < len; i++) o[i] = s[a + i];
    for (let i = 0; i < X; i++) { const k = i / X, g1 = Math.sqrt(k), g0 = Math.sqrt(1 - k); o[i] = s[a + i] * g1 + s[a + len + i] * g0; } }
  return out; }
export function loadSpaceSamples() { if (loading) return loading; return (loading = loadAll()); }
async function loadAll() { if (!ac()) return; const all = [...Object.keys(ONE_SHOTS), ...LOOPS];
  // s433: .mp3 (Runway) first, else .wav (the in-house renders: thrust*.wav are made seamless already, so not re-trimmed)
  await Promise.all(THRUST_KEYS.map(async k => { try { const r = await fetch(new URL('../sfx/thrust2/' + k + '.mp3?v=' + V, import.meta.url)); if (!r.ok) return; const b = await ctx.decodeAudioData(await r.arrayBuffer()); buf[k + '@2'] = LOOPS.includes(k) ? seamless(b) : b; } catch (e) {} }));
  await Promise.all(all.map(async k => { try { let wav = false, r = await fetch(new URL('../sfx/' + k + '.mp3?v=' + V, import.meta.url)); if (!r.ok) { wav = true; r = await fetch(new URL('../sfx/' + k + '.wav?v=' + V, import.meta.url)); } if (!r.ok) return; const b = await ctx.decodeAudioData(await r.arrayBuffer()); buf[k] = LOOPS.includes(k) && !wav ? seamless(b) : b; } catch (e) {} })); }
export const hasSample = k => !!buf[pick(k)];
export function playSample(k0, o = {}) { const k = pick(k0); if (window.__8gMuted || !buf[k] || !ac()) return false; const now = performance.now(); if (now - (last[k] || 0) < (o.gap ?? 45)) return true; last[k] = now;
  const t = ctx.currentTime, s = ctx.createBufferSource(), g = ctx.createGain(), L = Math.min(buf[k].duration, o.len || ONE_SHOTS[k0] || buf[k].duration), v = (o.v ?? 1) * 0.9 * getVol(k0);
  s.buffer = buf[k]; s.playbackRate.value = (o.p || 1) * (0.97 + Math.random() * 0.06); g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + L * 0.75); g.gain.linearRampToValueAtTime(0.0001, t + L);
  s.connect(g); g.connect(master); s.start(t); s.stop(t + L + 0.05); return true; }
// a looping voice you steer every frame: set(vol 0..1, rate)
export function loopVoice(k0) { const k = pick(k0); if (!buf[k] || !ac()) return null; const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = buf[k]; s.loop = true; g.gain.value = 0; s.connect(g); g.connect(master); s.start();
  return { set(v, r = 1) { const T = ctx.currentTime; g.gain.setTargetAtTime(window.__8gMuted ? 0 : v * getVol(k0), T, 0.12); s.playbackRate.setTargetAtTime(r, T, 0.2); }, stop() { try { s.stop(); } catch (e) {} } }; }
export const sampleCtx = () => ctx;
