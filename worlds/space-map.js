// 8 GATES · SPACE MAP [spaceMap] (s369). s380: THE GRID + the deep (worlds/space-deep.js), 20 % wider galaxy, slow only in the swoop view. One flat flight plane, 3D look, top-down tilted camera.
// Planets sit BELOW the plane so the ship flies over everything; each charted world's DOCK floats above its planet.
// Over any item the ship slows to 30 % (Ben); slowed over a dock = the ACTIONS bar says DOCK AT <WORLD> (E on desktop).
// DOCK goes straight to the world's 3D page; a world with no 3D page yet = dock LOCKED. P1-P4 have no dock (players build them).
// Data: worlds/space-galaxy.js (from the 2D map). Ship: the 2D '8g' scout (worlds/space-ship-scout.svg) rebuilt in 3D.
// HUD: Game HUD (vehicle 'ship': 1 LASER · 2 SPECIAL · 3 BOOST). v1 = flight + docking; pirates, creatures, fuel, trade later.
import * as THREE from '../vendor/three/three.module.js';
import { makeGradient } from '../village-game.js';
import { save } from '../engine/save.js';
import { foxShield } from '../engine/fox-shield.js?v=s606';
import { SFX } from '../engine/fighter-sfx.js';
import { loadSpaceSamples, playSample, loopVoice } from '../engine/space-samples.js?v=s590b';
import { spaceLofi, themeTitle } from '../engine/space-lofi.js?v=s459';
import { createDockWalk } from './space-dockwalk.js?v=s599a';
import { createConvoys } from './trade-convoys.js?v=s601b';
import { createEvents } from './space-events.js?v=s603';
import { SPECIAL_SHOP, SPECIAL_NAME, TIER_K, TIER_CD, ROMAN, fit as sFit, active as sActive, nextSlot as sNext, buy as sBuy, buyTier as sTier, cycleSlot as sCycle, shopRows as sRows, slotsFor } from './space-fitting.js?v=s604';
import { OFFICERS, CARGO, RUNS, fee as dFee, fleet as dFleet, buyCargo, deals as tDeals, freeShips, shipSpec as dShip, nextRunMs as dNext, migrate as dMigrate, goodsIn, goodsOut, gate as dGate, begin as dBegin, effective as dEff, haggle as dHaggle, sign as dSign, cancel as dCancel, settleDeals, goodName, dealLine, WORLD_NAME, RISK as D_RISK, canRun as dCanRun, runOne as dRunOne, lostRun as dLost, finish as dFinish, stored as dStored, rentOf as dRent, storeOne as dStore, takeOne as dTake } from './trade-deals.js?v=s601d';
import { USE as PP_USE } from './player-farm.js?v=s601d';
import { createCabin } from './ship-cabin.js?v=s599i';
import { createCombat } from './space-combat.js?v=s606';
import { escortKit } from './space-escort.js?v=s523';
import { createDeep } from './space-deep.js?v=s605';
import { createExplore } from './space-explore.js?v=s606a';
import { createDamage } from './ship-damage.js?v=s606a';
import { createNests } from './space-nests.js?v=s469';
import { createSplit, rockLook } from './space-split.js?v=s598y';
import { createFleets } from './space-fleets.js?v=s596a';
import { createCreatures } from './space-creatures.js?v=s598v';
import { GOODS, HOLD_CAP, priceAt } from './space-trade.js?v=s601d'
import { createMarket, LICENCE_COST, EVENT_MIN } from './trade-market.js?v=s599a';
import { boardAt, bulkLot, doneList, markDone, offerLine } from './trade-private.js?v=s601d';
import { routes as tRoutes, BUILD_GOODS, ROUTE, SHIPS, shipOf, setShip, portAvail, portTake, portNext, routeFor, addRoute, setEscort, dropRoute, nextRunMs } from './trade-routes.js?v=s599e';
import { RESEARCH, PROGRAMMES, tiers, buyTier, shipMods } from './space-yard.js?v=s385';
import { installKit, loadLooks, flyingHull, flyRoster, HULL_FLY_SCALE, FLEET_PRE } from './space-installs.js?v=s596a';
import { shipPilot } from '../engine/ship-pilot.js?v=s571a';
import { createScope } from './space-scope.js?v=s590a';
import { WORLDS, FRONTIER, PIRATES, DSF, STATIONS, INSTALLS, NEBULAE, START_KEY, LAST_DOCK, NAMES, CELL, NESTS, MACHINE_YARD } from './space-galaxy.js?v=s519';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k * k * (3 - 2 * k), angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
// value noise (3D, seamless on spheres)
const hash = (x, y, z) => { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi, u = ease(xf), v = ease(yf), w = ease(zf);
  const c = (a, b, d) => hash(xi + a, yi + b, zi + d);
  return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v), lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const fbm = (x, y, z, o = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, z * f); f *= 2.03; a *= 0.5; } return s / (1 - Math.pow(0.5, o)); };

export async function createSpace({ container, options = {}, onState = () => {}, onNavigate = u => { location.href = encodeURI(u); } }) {
  // s383 SOUND: the shared fighter sound kit (engine/fighter-sfx.js, tuned in Fighter Gear Lab) + an engine hum. window.__8gMuted = mute.
  // s426 SPACE SOUNDS: every event goes through the shared fighter kit (engine/fighter-sfx.js, tuned in Fighter Gear Lab → SOUNDS; the same
  // recorded explosions as Pearl Sail). Space names map onto its keys here.
  const SND_ALIAS = { boss: 'gate', bigBoom: 'gate', boom: 'kill', rock: 'hitStone', rockShot: 'laserHitStone', hitShip: 'laserHitMetal', hitBeast: 'laserHitFlesh', machineDown: 'botShieldBreak', machineSpot: 'botVoice', boost: 'botSwoop', land: 'stompHeavy', alarm: 'botAim' };
  // s427 RECORDED (Runway batch 1, sfx/): these events play the recording when it has loaded, else the synth above
  const SND_REC = { laser: ['shipLaser', 0.55], enemyLaser: ['enemyLaser', 0.4], power: ['missile', 0.7], botCharge: ['torpedo', 0.6], shield: ['shieldHit', 0.6], shieldDown: ['shieldDown', 0.7], shieldUp: ['shieldUp', 0.6], hurt: ['hullHit', 0.7], hitShip: ['hullHit', 0.85],
    kill: ['shipExplodeSmall', 0.95], boom: ['shipExplodeSmall', 0.95], gate: ['shipExplodeBig', 0.9], boss: ['shipExplodeBig', 0.9], bigBoom: ['shipExplodeBig', 0.9], rock: ['asteroidBump', 0.6], rockShot: ['asteroidBreak', 0.8], boost: ['burstStart', 0.6], boostEnd: ['burstEnd', 0.45],
    pickup: ['pickupCrate', 0.6], refuel: ['refuel', 0.6], holster: ['towLatch', 0.6], botAim: ['scannerPing', 0.5], land: ['dockLand', 0.6], undock: ['undock', 0.55], swoop: ['swoopIn', 0.35], lowHp: ['lowHull', 0.5],
    hitBeast: ['creatureHit', 1.0], beastDie: ['creatureDie', 0.7], mothPulse: ['mothPulse', 0.7], mothCharge: ['mothScreech', 0.6], serpent: ['serpentHiss', 0.6], machineSpot: ['machineSpot', 0.6], machineDown: ['machineDown', 0.65], unhack: ['unhack', 0.7],
    pirates: ['pirateAlarm', 0.45], taunt: ['pirateTaunt', 0.55], baseGun: ['pirateBaseGun', 0.6], buoy: ['buoyLight', 0.6], menu: ['menuOpen', 0.5], teleport: ['teleport', 0.6], step: ['footstepMetal', 0.35], gateJump: ['stargateJump', 0.7], thrustStart: ['thrustStart', 0.5], thrustStop: ['thrustStop', 0.5], puff: ['thrustPuff', 0.4],
    // s590b SPECIAL WEAPONS (Runway batch 7): one recording per special
    specTorpedo: ['specTorpedo', 0.7], specMissile: ['specMissile', 0.7], specLance: ['specLance', 0.7], specRail: ['specRail', 0.7], specFlak: ['specFlak', 0.7], specMines: ['specMines', 0.65], specWeb: ['specWeb', 0.65], specArc: ['specArc', 0.7], specEmp: ['specEmp', 0.75] };
  const SPEC_SND = { PLASMA_TORPEDO: 'specTorpedo', MISSILE: 'specMissile', RED_CANNON: 'specLance', RAIL: 'specRail', FLAK: 'specFlak', MINES: 'specMines', WEB: 'specWeb', ARC: 'specArc', EMP: 'specEmp' };
  const REC_ONLY = new Set(['thrustStart', 'thrustStop', 'puff']);
  loadSpaceSamples();
  // s430 DISTANCE: a sound with o.at = [x, z] fades with distance from your ship (full within 12 u, silent past 120 u, squared falloff)
  const fall = o => { if (!o || !o.at) return 1; const d = Math.hypot(o.at[0] - St.x, o.at[1] - St.z); if (d < 12) return 1; const k2 = Math.max(0, 1 - (d - 12) / 108); return k2 * k2; };
  const snd = (k, o = {}) => { const f = fall(o); if (f < 0.02) return; if (f < 1) o = { ...o, v: (o.v ?? 1) * f }; const r = SND_REC[k]; if (r && playSample(r[0], { ...o, v: (o.v ?? 1) * r[1] / 0.6 })) return; if (REC_ONLY.has(k)) return; if (k === 'enemyLaser') k = 'laser', o = { ...o, p: 0.7 }; try { SFX.play(SND_ALIAS[k] || k, o); } catch (e) {} }; window.__spaceSnd = snd;
  // s431 THRUST (Ben: "no engine sounds, the sound of MOVING"): synth thrust = two layers of looping noise: a soft low RUSH (bandpass) that
  // swells with your SPEED and a bright JET layer (highpass) for burst; a quick puff when you start / stop. Used until the Runway THRUST files arrive.
  const HUM = { ctx: null }; const humStart = () => { if (HUM.ctx) { if (HUM.ctx.state === 'suspended') HUM.ctx.resume(); return; } try { const C = new (window.AudioContext || window.webkitAudioContext)(), N = C.createBuffer(1, C.sampleRate * 3, C.sampleRate), d = N.getChannelData(0);
    let b0 = 0, b1 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.99 * b0 + w * 0.06; b1 = 0.96 * b1 + w * 0.2; d[i] = (b0 + b1 + w * 0.08) * 0.9; }   // soft "pinkish" noise: air, not hiss
    const lay = (type, f, q) => { const s = C.createBufferSource(), fl = C.createBiquadFilter(), g = C.createGain(); s.buffer = N; s.loop = true; s.loopStart = Math.random(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(C.destination); s.start(0, Math.random() * 2); return { fl, g }; };
    HUM.ctx = C; HUM.rush = lay('bandpass', 500, 0.6); HUM.jet = lay('highpass', 2400, 0.4); HUM.wob = lay('lowpass', 160, 0.7); HUM.last = 0; } catch (e) {} };
  // s409 SPACE LOFI (engine/space-lofi.js): cruise "Nebula Drift", crossfades into battle "Red Shift" when danger is near, back when it's gone
  const LOFI = spaceLofi(); const musicStart = () => { LOFI.start(); LOFI.resume(); };
  const ENG = {}; const engStart = () => { if (ENG.started) return; let HT0 = 'ship'; try { HT0 = HULLT; } catch (e) { return; } const ck = { hullCruiser: 'thrustHeavyLoop', hullGunner: 'thrustHeavyLoop', hullFlagship: 'thrustHugeLoop', hullColony: 'thrustHugeLoop' }[HT0] || 'thrustSmallLoop';
    const probe = loopVoice('energyShieldHum'); if (!probe) return; ENG.started = true;   // s431: recordings loaded. The old ENGINE loops are no longer used (Ben); THRUST loops when they exist, else the synth thrust
    ENG.cruise = loopVoice(ck) || loopVoice('thrustSmallLoop'); { ENG.boost = loopVoice('thrustBurstLoop'); ENG.walk = probe; ENG.moth = loopVoice('mothWings'); ENG.mine = loopVoice('mineArm'); ENG.weld = loopVoice('shipyardWeld'); ENG.nest = loopVoice('nestPulse'); ENG.pir = loopVoice('thrustPirateLoop'); ENG.mac = loopVoice('thrustMachineLoop'); } };
  addEventListener('pointerdown', engStart); addEventListener('keydown', engStart);
  addEventListener('pointerdown', humStart); addEventListener('keydown', humStart); addEventListener('pointerdown', musicStart); addEventListener('keydown', musicStart);
  const LOW = options.quality === 'low';
  try { await document.fonts.load('900 40px Archivo'); } catch (e) {}
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1.5 : 2)); renderer.setSize(W(), H());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#03040a');
  const camera = new THREE.PerspectiveCamera(50, W() / H(), 1, 4000);
  scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x1a1030, 1.1));
  const sun = new THREE.DirectionalLight(0xfff2e0, 2.4); sun.position.set(-0.55, 1, -0.35); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, ex) => { const k = c + (ex ? JSON.stringify(ex) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...ex })); return cache.get(k); };
  const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
  const ink = new THREE.MeshBasicMaterial({ color: 0x05060c, side: THREE.BackSide }); ink.visible = options.outlines !== false;
  const M = (geo, mat, x = 0, y = 0, z = 0, parent = scene, out = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); if (out) { const o = new THREE.Mesh(geo, ink); o.scale.setScalar(1 + out); m.add(o); } return m; };

  // ---------- textures ----------
  function puffTex(seed) {
    const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), im = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const dx = i / S - 0.5, dy = j / S - 0.5, r = Math.hypot(dx, dy) * 2, n = fbm(i / 22 + seed * 7, j / 22, seed * 3.1, 5);
      const a = clamp((1 - r) * 1.25, 0, 1) ** 1.6 * clamp(n * 1.7 - 0.45, 0, 1), k = (j * S + i) * 4;
      im.data[k] = im.data[k + 1] = im.data[k + 2] = 255; im.data[k + 3] = a * 255;
    }
    x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const PUFFS = [puffTex(1), puffTex(2), puffTex(3)];
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const col = h => new THREE.Color(h);
  function planetTex(w) {
    const TW = LOW ? 192 : 288, TH = TW / 2, c = document.createElement('canvas'); c.width = TW; c.height = TH;
    const x = c.getContext('2d'), im = x.createImageData(TW, TH), base = col(w.tint), dk = base.clone().multiplyScalar(0.5), lt = base.clone().lerp(col('#ffffff'), 0.45), tmp = new THREE.Color();
    const sea = col('#2b5fa8'), land = col('#4f9a52'), snow = col('#f4f7fc'), rock = col('#7d8494'), seed = w.key.length * 13.7 + w.x * 0.01;
    for (let j = 0; j < TH; j++) { const lat = (j / TH - 0.5) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
      for (let i = 0; i < TW; i++) { const lon = i / TW * Math.PI * 2, px = cl * Math.cos(lon) * 2.2, py = sl * 2.2, pz = cl * Math.sin(lon) * 2.2;
        const n = fbm(px + seed, py, pz, 5), n2 = fbm(px * 2.6, py * 2.6 + seed, pz * 2.6, 3), pole = Math.abs(sl);
        switch (w.look) {
          case 'snow': { const ridge = 1 - Math.abs(n * 2 - 1); tmp.copy(snow).lerp(col('#cfdcef'), n2 * 0.6); if (ridge > 0.8) tmp.lerp(rock, (ridge - 0.8) * 4); break; }
          case 'ocean': case 'earth': case 'ice': { const L = n > (w.look === 'earth' ? 0.52 : 0.6); tmp.copy(L ? (w.look === 'ice' ? col('#dfe9f5') : land) : (w.look === 'ice' ? col('#7fb4e0') : sea)); if (!L) tmp.lerp(col(w.look === 'ice' ? '#a9d0f0' : '#1c3f7a'), n2 * 0.5); else tmp.lerp(dk, n2 * 0.35); if (pole > 0.82) tmp.copy(snow); if (n2 > 0.66) tmp.lerp(snow, 0.75); break; }
          case 'jungle': { tmp.copy(base).lerp(col('#22663a'), n * 0.9); if (Math.abs(n2 - 0.5) < 0.03) tmp.copy(col('#3a8fd0')); break; }
          case 'fresh': { tmp.copy(dk).lerp(lt, n); if (n2 > 0.62) tmp.lerp(snow, (n2 - 0.62) * 2.2); break; }
          default: { const band = 0.5 + 0.5 * Math.sin(lat * (w.look === 'canyon' ? 9 : 14) + n * 7); tmp.copy(dk).lerp(lt, band * 0.7 + n2 * 0.3); if (w.look === 'stone' && n > 0.62) tmp.lerp(col('#4d525c'), 0.6); if (w.look === 'salt' && n2 > 0.6) tmp.lerp(snow, 0.55); if (w.look === 'gem' && n2 > 0.7) tmp.copy(col('#ff5ad1')); }
        }
        const k = (j * TW + i) * 4; im.data[k] = tmp.r * 255; im.data[k + 1] = tmp.g * 255; im.data[k + 2] = tmp.b * 255; im.data[k + 3] = 255; } }
    x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  // big readable labels (Ben has low vision): fixed screen size, black outline
  const labels = [];
  function label(text, sub, c = '#ffffff', subC = '#ffd23a', big = 1, far = 0) {
    const cv = document.createElement('canvas'), x = cv.getContext('2d'), F = 72;
    x.font = '900 ' + F + 'px Archivo, sans-serif'; const w1 = x.measureText(text).width; x.font = '800 ' + (F * 0.46) + 'px Archivo, sans-serif'; const w2 = sub ? x.measureText(sub).width : 0;
    cv.width = Math.ceil(Math.max(w1, w2) + 40); cv.height = sub ? F * 1.75 : F * 1.2;
    x.lineJoin = 'round'; x.textBaseline = 'top'; x.font = '900 ' + F + 'px Archivo, sans-serif'; x.strokeStyle = '#000'; x.lineWidth = 14; x.strokeText(text, 20, 8); x.fillStyle = c; x.fillText(text, 20, 8);
    if (sub) { x.font = '800 ' + (F * 0.46) + 'px Archivo, sans-serif'; x.lineWidth = 9; x.strokeText(sub, 20, F * 1.12); x.fillStyle = subC; x.fillText(sub, 20, F * 1.12); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false }));
    s.center.set(0, 0); s.renderOrder = 20; s.userData = { asp: cv.width / cv.height, h: cv.height / F, big, far }; scene.add(s); labels.push(s); return s;
  }
  let labelK = 0.05;
  const sizeLabels = () => { const phone = Math.min(W(), H()) < 520, land = phone && W() > H(); labelK = land ? 0.062 : phone ? 0.034 : 0.04; labels.forEach(s => { const u = s.userData, k = labelK * u.big * u.h; s.scale.set(k * u.asp, k, 1); }); };

  // ---------- stars ----------
  for (const [n, y, spread, sz, o] of [[LOW ? 1400 : 2600, -160, 2600, 2.2, 0.9], [LOW ? 900 : 1600, -420, 3600, 3.4, 0.7], [LOW ? 260 : 500, -900, 5200, 7, 0.55]]) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), cl = new Float32Array(n * 3), cc = new THREE.Color();
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * spread; p[i * 3 + 1] = y + (Math.random() - 0.5) * 60; p[i * 3 + 2] = (Math.random() - 0.5) * spread; cc.setHSL(Math.random() < 0.7 ? 0.6 : 0.08, 0.5, 0.75 + Math.random() * 0.25); cl.set([cc.r, cc.g, cc.b], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(cl, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: sz, map: dotTex, vertexColors: true, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending })));
  }
  // s379d STARFIELD (Ben: "please add stars"): a dome round the camera with 3 kinds: a dense dust of tiny stars, a MILKY WAY band
  // (tilted, thicker, bluish-violet), and bright stars with soft halos + 4-point glints. All twinkle in the shader. One draw each.
  const sky = (() => { const G = new THREE.Group(); G.frustumCulled = false; scene.add(G); const R = 2600, v = new THREE.Vector3(), cc = new THREE.Color();
    // s379g (Ben: "less retro, more modern"): no 4-point cross. Hot white core, tight bloom, wide faint halo + one thin soft lens streak.
    const glint = (() => { const N = 128, h = N / 2, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
      const g = x.createRadialGradient(h, h, 0, h, h, h); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.06, 'rgba(255,255,255,1)'); g.addColorStop(0.14, 'rgba(255,255,255,0.7)'); g.addColorStop(0.3, 'rgba(255,255,255,0.28)'); g.addColorStop(0.6, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, N, N);
      x.globalCompositeOperation = 'lighter'; x.save(); x.translate(h, h); x.scale(1, 0.05); const s = x.createRadialGradient(0, 0, 0, 0, 0, h); s.addColorStop(0, 'rgba(255,255,255,0.95)'); s.addColorStop(0.4, 'rgba(255,255,255,0.35)'); s.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = s; x.beginPath(); x.arc(0, 0, h, 0, 6.283); x.fill(); x.restore();
      const t = new THREE.CanvasTexture(c); return t; })();
    const layer = (n, pick, sizeR, tex, tw) => { const P = new Float32Array(n * 3), C = new Float32Array(n * 3), S = new Float32Array(n), Ph = new Float32Array(n);
      for (let i = 0; i < n; i++) { pick(v, cc); v.normalize().multiplyScalar(R); P.set([v.x, v.y, v.z], i * 3); C.set([cc.r, cc.g, cc.b], i * 3); S[i] = sizeR(); Ph[i] = Math.random() * 6.283; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(S, 1)); g.setAttribute('aPh', new THREE.BufferAttribute(Ph, 1));
      const mat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, map: { value: tex }, uPx: { value: renderer.getPixelRatio() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
        vertexShader: tw === 'BLOOM'
          ? 'attribute float aSize; attribute float aPh; uniform float uT; uniform float uPx; varying vec3 vC; varying float vK; void main(){ float per = 14.0 + fract(aPh * 7.13) * 16.0; float u = fract(uT / per + aPh * 0.159); float b = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.06, 0.16, u)); vK = 0.38 + 0.62 * b; vC = color; gl_PointSize = aSize * uPx * (0.22 + 0.78 * b); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
          : 'attribute float aSize; attribute float aPh; uniform float uT; uniform float uPx; varying vec3 vC; varying float vK; void main(){ float tw = ' + tw + '; vK = tw; vC = color; gl_PointSize = aSize * uPx * (0.75 + 0.35 * tw); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform sampler2D map; varying vec3 vC; varying float vK; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.a * vK, t.a * vK); }' });
      const pts = new THREE.Points(g, mat); pts.frustumCulled = false; G.add(pts); return mat; };
    const dir = (v) => { v.randomDirection(); };   // full sphere: the low views look down past the plane too
    const starCol = (cc, k) => { const r = Math.random(); if (r < 0.12) cc.setHSL(0.07 + Math.random() * 0.05, 0.75, 0.75); else if (r < 0.2) cc.setHSL(0.13, 0.6, 0.82); else cc.setHSL(0.58 + Math.random() * 0.08, 0.35 + Math.random() * 0.3, 0.78 + Math.random() * 0.2); cc.multiplyScalar(k); };
    // milky way: a great circle tilted across the sky
    const band = new THREE.Vector3(0.35, 0.25, 0.9).normalize(), bu = new THREE.Vector3().crossVectors(band, new THREE.Vector3(0, 1, 0)).normalize(), bv = new THREE.Vector3().crossVectors(band, bu);
    const inBand = (v, cc) => { const a = Math.random() * 6.283, off = (Math.random() + Math.random() + Math.random() - 1.5) * 0.18; v.copy(bu).multiplyScalar(Math.cos(a)).addScaledVector(bv, Math.sin(a)).addScaledVector(band, off); 
      const k = Math.random(); if (k < 0.3) cc.setHSL(0.72 + Math.random() * 0.08, 0.5, 0.55); else starCol(cc, 0.8); cc.multiplyScalar(0.9 + 0.6 * (1 - Math.abs(off) / 0.3)); };
    const mats = [
      layer(LOW ? 3600 : 7000, (v, cc) => { dir(v); starCol(cc, 0.9 + Math.random() * 0.6); }, () => 3.6 + Math.random() * 4.2, dotTex, '0.6 + 0.4 * sin(uT * (1.2 + fract(aPh) * 2.0) + aPh)'),
      layer(LOW ? 3000 : 6000, inBand, () => 3.2 + Math.random() * 3.6, dotTex, '0.75 + 0.25 * sin(uT * 1.6 + aPh)'),
      layer(LOW ? 90 : 160, (v, cc) => { dir(v); starCol(cc, 1.1); }, () => 26 + Math.random() * 24, glint, 'BLOOM'),
    ];
    // a faint milky-way glow: big soft sprites along the band
    const mwTex = PUFFS ? PUFFS[0] : dotTex; for (let i = 0; i < (LOW ? 14 : 26); i++) { const a = (i / (LOW ? 14 : 26)) * 6.283; v.copy(bu).multiplyScalar(Math.cos(a)).addScaledVector(bv, Math.sin(a)); v.normalize().multiplyScalar(R * 0.98);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mwTex, color: i % 3 ? '#3b3a7a' : '#5a3a7a', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.copy(v); s.scale.setScalar(R * 0.42); G.add(s); }
    G.userData.tick = t => { for (const mt of mats) mt.uniforms.uT.value = t; };
    return G; })();
  // ---------- nebulae: drifting gas, like the Meru door-blast smoke, one colour per region ----------
  const puffs = [];
  NEBULAE.forEach((nb, ni) => { const N = LOW ? 12 : 22, c0 = col(nb.col[0]), c1 = col(nb.col[1]);
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.85, high = i % 7 === 0;
      const m = new THREE.SpriteMaterial({ map: PUFFS[i % 3], color: c0.clone().lerp(c1, Math.random()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: high ? 0.07 : 0.16 + Math.random() * 0.16, rotation: Math.random() * 6.28 });
      const s = new THREE.Sprite(m), sc = (high ? 50 : 90) + Math.random() * (high ? 40 : 150); s.scale.set(sc, sc, 1);
      s.position.set(nb.x + Math.cos(a) * nb.rx * r, high ? 6 + Math.random() * 6 : -30 - Math.random() * 110, nb.z + Math.sin(a) * nb.rz * r); scene.add(s);
      puffs.push({ s, m, spin: (Math.random() - 0.5) * 0.04, bx: s.position.x, bz: s.position.z, ph: Math.random() * 6.28, o: m.opacity }); } });

  // ---------- planets, docks, installations ----------
  let names = {}; try { names = JSON.parse(localStorage.getItem(NAMES) || '{}') || {}; } catch (e) {}
  const bodies = [], zones = [], docks = [], spinners = [];
  function atmoMat(c) { return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { c: { value: col(c).lerp(col('#ffffff'), 0.25) } },
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vP = mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; varying vec3 vN; varying vec3 vP; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(-vP))); gl_FragColor = vec4(c, pow(f, 3.0) * 1.1); }' }); }
  function ringTex() { const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); for (let r = S / 2; r > S / 2 * 0.7; r -= 1) { const k = (S / 2 - r) / (S / 2 * 0.3), a = 0.15 + 0.85 * Math.abs(Math.sin(k * 23) * Math.sin(k * 7.3 + 1)); x.strokeStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; x.lineWidth = 1.5; x.beginPath(); x.arc(S / 2, S / 2, r, 0, 7); x.stroke(); } return new THREE.CanvasTexture(c); }
  function makePlanet(w, frontier) {
    const R = w.r, y = -R - 7, g = new THREE.Group(); g.position.set(w.x, y, w.z); scene.add(g);
    const globe = M(new THREE.SphereGeometry(R, LOW ? 40 : 64, LOW ? 24 : 40), new THREE.MeshToonMaterial({ map: planetTex(w), gradientMap: grad, emissive: col(w.tint), emissiveIntensity: 0.06 }), 0, 0, 0, g, 0.015);
    globe.rotation.z = 0.3; spinners.push({ o: globe, s: 0.02 + (w.x % 7) * 0.001 });
    w.atmo = M(new THREE.SphereGeometry(R * 1.1, 48, 32), atmoMat(w.tint), 0, 0, 0, g); w.g = g; w.globe = globe;
    if (w.ring) { const r = M(new THREE.RingGeometry(R * 1.3, R * 1.75, 96, 1), new THREE.MeshBasicMaterial({ map: ringTex(), color: w.ring, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }), 0, 0, 0, g); r.rotation.x = -Math.PI / 2 + 0.32; r.rotation.y = 0.2; }
    const nm = names[w.key] || w.name, sub = frontier ? 'UNCHARTED' : w.player ? (names[w.key] ? 'PLAYER ' + w.player + ' WORLD' : 'NAME ME') + (w.dock ? ' · YOUR HOME' : ' · NO DOCK YET') : null;
    const lb = label(nm, sub, '#ffffff', w.player ? '#7fd0ff' : '#ffd23a', 1.25); lb.position.set(w.x - R * 0.9, 2, w.z + R * 0.75); lb.userData.planet = true; w.lab = lb;
    bodies.push(w); zones.push({ kind: 'planet', w, x: w.x, z: w.z, r: R, name: nm });
  }
  WORLDS.forEach(w => makePlanet(w, false)); FRONTIER.forEach(w => makePlanet(w, true));

  // each charted world's dock floats ABOVE its planet (unique per world: spokes, hub, colours)
  // s376: the WORLD DOCK = Space Install Workshop's long straight gantry (worlds/space-installs.js), floating over the planet.
  // You dock in its BERTH RING at the east end; the beacon glows inside the ring. Models build lazily near the ship (see INST below).
  const IK = installKit(THREE, { low: LOW, outlines: options.outlines !== false, grad }), LOOKS = loadLooks();
  const MAPSC = { dock: 0.6, yard: 0.6, fuel: 0.65, mine: 0.7, gate: 0.7 }, MAPY = { dock: -3.4, yard: -8.5, fuel: -9.5, mine: -10, gate: -4 };
  const INST = [];   // { type, wkey, tint, x, y, z, inst }
  let ppOwn = {}; try { ppOwn = JSON.parse(localStorage.getItem('pp.space.v1') || '{}') || {}; } catch (e) {}   // s519 player planets: only the space installs BUILT on the planet (never a stargate); s520 no 'dock' yet = a LANDING ZONE (the ship lands on the planet)
  function makeDock(w, i) {
    const landing = !!w.player && !(ppOwn[w.key] || []).includes('dock'), open = !!w.url, sc = MAPSC.dock * (LOOKS.dock.size || 1), L = LOOKS.dock, bx = (L.ring ? L.length / 2 + 6 : L.length / 2 + 1) * sc, Y = MAPY.dock;
    const g = new THREE.Group(); g.position.set(w.x + bx, Y, w.z); scene.add(g);
    const beacon = M(new THREE.RingGeometry(2.2 * sc / 0.6, 2.7 * sc / 0.6, 40), glow(open ? '#6ee7b7' : '#ec3013', 0.6), 0, 0.15, 0, g); beacon.rotation.x = -Math.PI / 2;
    if (!landing && !w.player) INST.push({ type: 'dock', wkey: w.key, tint: w.tint, x: w.x, y: Y, z: w.z, sc });
    if (!landing && w.player) INST.push({ type: 'homeStation', wkey: w.key, tkey: w.key, x: w.x + bx, y: -2, z: w.z, sc: 0.55, fr: 15, frange: 55 });   // s521 the player planet's OWN station (smallest; DSF design)
    const lb = landing ? label('LAND ON ' + (names[w.key] || w.name), 'NO DOCK YET · YOUR SHIP LANDS ON THE PLANET', '#ffffff', '#7fd0ff', 0.8) : label((names[w.key] || w.name) + (w.player ? ' STATION' : ' DOCK'), w.player ? 'YOUR HOME STATION · OPEN' : open ? 'OPEN' : 'OPENING SOON', '#ffffff', open ? '#6ee7b7' : '#ff8a6a', 0.8); lb.position.set(w.x + bx - 2, 1, w.z - 11);
    const d = { kind: 'dock', landing, key: w.key, name: (names[w.key] || w.name), x: w.x + bx, z: w.z, r: 9, url: w.url, open, g, beacon, lights: [], Y, wx: w.x, wz: w.z, len: L.length, K: sc, mods: L.modules };
    docks.push(d); zones.push(d);
  }
  WORLDS.filter(w => w.dock).forEach(makeDock);

  // installations round each charted world (2D INSTALLS): mine + asteroid belt, shipyard, fuel depot, stargate. Look-only in v1.
  const rocks = [], depots = [], MINES = [];
  WORLDS.filter(w => w.dock).forEach(w => {
    for (const [k, I] of Object.entries(INSTALLS)) { if (w.player && (k === 'gate' || !(ppOwn[w.key] || []).includes(k))) continue; const x = w.x + I.dx, z = w.z + I.dz;
      INST.push({ type: k, wkey: w.key, tint: w.tint, x, y: MAPY[k], z, sc: MAPSC[k] });
      if (k === 'mine') { // s411 THE BELT (Ben: spread out, staggered, SOLID): 4 staggered rings of big rocks ON the flight plane round the mine, gaps to weave through
        // s411c (Ben: not too dense, room to fly through): rock surfaces stay ≥ ~9 u apart (the ship is ~7 u wide): 3 lanes 18 u apart, rocks ~18 u apart along each lane
        const mi = MINES.length; MINES.push({ x, z, R: 76 }); const spacing = LOW ? 20 : 18;
        [34, 52, 70].forEach((rr, ri) =>   /* s445: lanes moved out so the mine's pad + office sit right at the mine, inside the belt */ { const n = Math.max(6, Math.round(Math.PI * 2 * rr / spacing)), off = (ri % 2) * 0.5;
          const os = 0.04 * Math.pow(18 / rr, 1.5) * 1.6;   // 2D: belt rocks ORBIT their rig, slowly (inner lanes a little faster)
          for (let q = 0; q < n; q++) { const a = (q + off + (Math.random() - 0.5) * 0.16) / n * Math.PI * 2, r = rr + (Math.random() - 0.5) * 2.4; rocks.push({ x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, y: (Math.random() - 0.5) * 1.2, s: 1.3 + Math.random() * 1.5, rx: Math.random() * 6, ry: Math.random() * 6, sp: (Math.random() - 0.5) * 0.5, alive: 1, back: 0, mine: mi, solid: true, cx: x, cz: z, orR: r, oa: a, os }); } });
        for (let n = 0; n < (LOW ? 10 : 22); n++) { const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 50; if (Math.cos(a) < -0.5 && r < 40) continue; /* s447 keep the west side clear for the pad + office */ rocks.push({ x: x + Math.cos(a) * r, z: z + Math.sin(a) * r, y: -9 - Math.random() * 3, s: 0.5 + Math.random() * 0.8, rx: Math.random() * 6, ry: Math.random() * 6, sp: (Math.random() - 0.5) * 0.8, alive: 1, back: 0 }); } }
      const lb = label(I.label, null, I.col, null, 0.5); lb.position.set(x + 9, 0, z + 5);
      zones.push({ kind: 'install', ik: k, wkey: w.key, wname: w.name, name: w.name + ' ' + I.label, x, z, r: k === 'mine' ? 9 : 12 }); if (k === 'fuel') depots.push({ x, z, name: w.name + ' FUEL DEPOT' }); }
  });
  let instCheck = 0; const instQ = [];
  function buildInst(e) { if (e.inst || e.gone || e.virtual) return; const it = IK.build(e.type, e.look ? { ...LOOKS[e.type], ...e.look } : LOOKS[e.type], { tint: e.tint }); e.api = it.api; const holder = new THREE.Group(); holder.position.set(e.x, e.y, e.z); holder.scale.setScalar(e.sc); holder.add(it.group); scene.add(holder);
    const dispose = it.dispose; e.inst = { group: holder, tick: it.tick, dispose() { dispose(); holder.removeFromParent(); } }; if (e.onBuild) e.onBuild(it.api); }
  const deep = createDeep({ THREE, scene, INST, zones, rocks, label: (...a) => { const l = label(...a); sizeLabels(); return l; }, unlabel: l => { scene.remove(l); const i = labels.indexOf(l); if (i >= 0) labels.splice(i, 1); l.material.map.dispose(); l.material.dispose(); }, PUFFS, dotTex, LOW, bodies, depots, IK, LOOKS, toon, nameOf: k => names[k] }); let EXP = null, DMG = null;   /* s605 EXPLORATION · s606 DAMAGE */
  const nests = createNests({ THREE, scene, toon, label: (...a) => { const l = label(...a); sizeLabels(); return l; }, INST, LOW, dotTex, F: deep.F, saveF: deep.saveF });
  const RL = rockLook(THREE, LOW), rockMesh = new THREE.InstancedMesh(RL.geo, new THREE.MeshLambertMaterial({ color: '#8a7a6a', map: RL.map }), rocks.length); scene.add(rockMesh);   /* s463 the belt rocks share the polished lumpy look */
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  // Deep Space Fox station: s380 the 3D station (Space Install Workshop → DEEP SPACE FOX), built lazily like the installs
  // s385 (Ben): every world gets its own uniquely shaped STATION. Deep Space Fox = Meru's, Kufa Station = Kufa's (space-galaxy STATIONS).
  for (const S of STATIONS) { const g = new THREE.Group(); g.position.set(S.x, -2, S.z); scene.add(g);
    const beacon = M(new THREE.RingGeometry(2.4, 3.2, 40), glow('#6ee7b7', 0.6), 0, 0, 0, g); beacon.rotation.x = -Math.PI / 2;
    INST.push({ type: S.type, wkey: S.key, tkey: S.tkey, x: S.x, y: S.y, z: S.z, sc: S.sc, fr: 15, frange: 55 });
    const lb = label(S.name, S.sub, '#ffffff', S.url ? '#6ee7b7' : '#ff8a6a', 1); lb.position.set(S.x + 16, 1, S.z - 12); if (!S.url) beacon.material.color.set('#ec3013');
    const d = { kind: 'dock', key: S.key, tkey: S.tkey, station: true, name: S.name, x: S.x, z: S.z, r: 16, url: S.url, open: !!S.url, g, beacon, lights: [], Y: -2 }; docks.push(d); zones.push(d); }
  // pirate bases: worlds/space-deep.js (3D model, hull, guns, held depot)

  // ---------- the ship: the 2D 8g scout, extruded, the 2D art printed on its top ----------
  const ship = new THREE.Group(), bank = new THREE.Group(); ship.add(bank); scene.add(ship);
  let SS = 3.0;   // half-length in units (s566: grows with the ship you fly)
  const SPACE_SHIP_BOOST = 0.95;   // s567 (Ben: "the player's ships are too big in the galaxy"): 1.8 → 0.95, the scout now matches its hit size (SS 3.0 ≈ half its length); the fleet keeps its ratios (WALK_LEN)   // s556 (Ben): on the space map your ship looks 1.8x bigger = 75 % of the walk-in SHUTTLE's length (parked on a planet it stays 13 m)
  // s377: the 3D player ship (Space Install Workshop → PLAYER SHIP, worlds/space-installs.js). Nose = -z. Lasers fire from its gun barrels.
  // s565 THE FLEET (Ben): up to 3 ships (space-installs flyRoster: your flying hull + the walk-in GUNNER / FLAGSHIP with FLY THIS HULL ticked). SWITCH FOX swaps the ship you fly (space.flyNow).
  // Walk-ins fly at a length relative to the scout (WALK_LEN). s419: the hull you fly (Space Install Workshop → FLY THIS HULL).
  const ROSTER = flyRoster(LOOKS), WALK_LEN = { hullShuttle: 1.1, hullCorvette: 1.4, hullGunship: 1.55, hullFlagWalk: 1.8 }, guns = []; let SHIP3 = null, scoutLen = 0;
  let HULLT = (() => { try { const s = localStorage.getItem('space.flyNow'); if (ROSTER.includes(s)) return s; } catch (e) {} return ROSTER[0]; })();
  const lenOf = o => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); return Math.max(0.01, b.max.z - b.min.z); };
  // s571 PILOT FOX (Ben): a seated cast fox in the cockpit, built the first time the camera is close, shown only on close-ups (launch, landing, docks, slow swoops)
  const PKIT = shipPilot({ THREE, grad }); let PILOT = null, pilotFor = null;
  function pilotTick() { if (!SHIP3) return; const busyWalk = St.phase === 'walk' || (WALK && WALK.W && WALK.W.on) || (TU.on && TU.view === 'dome') || St.phase === 'cabin';
    SHIP3.group.getWorldPosition(_pw); const d = camera.position.distanceTo(_pw), thr = 15 * ((SHIP3.fit && SHIP3.fit.half) || 2.6), near = !busyWalk && d < (PILOT && PILOT.on ? thr * 1.1 : thr);
    if (near && pilotFor !== SHIP3) { const inst = SHIP3; pilotFor = inst; if (PILOT) { PILOT.dispose(); PILOT = null; } PKIT.attach(inst, HULLT).then(h => { if (!h) return; if (SHIP3 !== inst) { h.dispose(); return; } PILOT = h; h.show(false); }).catch(e => console.warn('pilot', e)); }
    if (PILOT) PILOT.show(near); }
  const _pw = new THREE.Vector3();
  function buildShip(T) { if (SHIP3) bank.remove(SHIP3.group); if (PILOT) { PILOT.dispose(); PILOT = null; } pilotFor = null; HULLT = T; SHIP3 = IK.build(T, LOOKS[T] || {}); let k = (HULL_FLY_SCALE[T] || 1.12) * SPACE_SHIP_BOOST;
    if (WALK_LEN[T]) { if (!scoutLen) { const s0 = IK.build('ship', LOOKS.ship || {}); s0.group.scale.multiplyScalar((HULL_FLY_SCALE.ship || 1.12) * SPACE_SHIP_BOOST); scoutLen = lenOf(s0.group); } if (SHIP3.api.snapRamp) SHIP3.api.snapRamp(0); k = scoutLen * WALK_LEN[T] / lenOf(SHIP3.group); }
    SHIP3.group.scale.multiplyScalar(k); { const bb = new THREE.Box3().setFromObject(SHIP3.group), hx = Math.max(-bb.min.x, bb.max.x), hz = Math.max(-bb.min.z, bb.max.z); SHIP3.fit = { r: Math.max(hx, hz) * 1.12, hx, hz, h: Math.max(1.5, (bb.max.y - bb.min.y) * 1.05), hy: (bb.max.y - bb.min.y) / 2, cy: (bb.max.y + bb.min.y) / 2, half: hz }; }
    bank.add(SHIP3.group); try { fitShield(); } catch (e) {}   /* before the shield exists (first build) this just skips */
    /* s567b (Ben: "the corvette + gunner fire funny on the right side"): root cause = the twin shots used api.guns[0] + the LAST gun, which on the walk-ins is a different gun on each side
       (the gunner's last guns are the turret barrels). Now the lasers fire from ONE MIRRORED PAIR: the outermost left gun that has a right twin at (-x, y, z); the turret barrels are left out. */
    guns.length = 0; const GP = SHIP3.api.turret ? SHIP3.api.guns.slice(0, -2) : SHIP3.api.guns.slice(); let best = null;
    for (const p of GP) { if (p[0] >= -0.02) continue; const q = GP.find(r => Math.abs(r[0] + p[0]) < 0.03 && Math.abs(r[1] - p[1]) < 0.03 && Math.abs(r[2] - p[2]) < 0.03); if (q && (!best || -p[0] > -best[0][0] + 0.01 || (Math.abs(p[0] - best[0][0]) <= 0.01 && p[2] < best[0][2]))) best = [p, q]; }
    const mk = p => { const o = new THREE.Object3D(); o.position.set(...p); SHIP3.group.children[0].add(o); return o; };
    if (best) { const L = mk(best[0]), Rr = mk(best[1]); guns.push(L, L, Rr, Rr); } else { GP.forEach(p => guns.push(mk(p))); while (guns.length < 4) guns.push(guns[guns.length - 1]); if (guns.length > 4) { const g4 = [guns[0], guns[1], guns[guns.length - 2], guns[guns.length - 1]]; guns.length = 0; guns.push(...g4); } } }
  buildShip(HULLT);
  // engine trail
  const TRAIL = IK.trail({ color: HULLT === 'ship' ? LOOKS.ship.engine : LOOKS[HULLT].glow }); TRAIL.length = LOOKS.ship.trailLen || 1; TRAIL.width = LOOKS.ship.trailWidth || 1; scene.add(TRAIL.points); const _back = new THREE.Vector3(), _carry = new THREE.Vector3();
  // shots
  // s408 (Ben): the player's twin lasers = the PEARL SAIL blast, scaled for space: a solid glowing capsule + a soft glow halo riding on it + a muzzle flash pop
  const shots = [], boltGeo = new THREE.SphereGeometry(0.34, 12, 8), boltMat = new THREE.MeshBasicMaterial({ color: 0xeaf8ff, toneMapped: false }), missMat = glow('#ffd23a', 1);   // s583 (Ben): the player's lasers = BLUE SPACE-PLASMA BALLS (white-hot core + a flickering blue shell + a short trail)
  const pops = []; const glowPop = (x, y, z, c, s) => { let p = pops.find(q => !q.on); if (!p) { p = { sp: new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })) }; scene.add(p.sp); pops.push(p); } Object.assign(p, { on: true, life: 0.22, s }); p.sp.material.color.set(c); p.sp.position.set(x, y, z); p.sp.visible = true; };
  const fx = []; function burst(x, z, c, n = 10, sz = 1) { for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: c, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); s.position.set(x, -1, z); scene.add(s); const a = Math.random() * 6.28, v = 4 + Math.random() * 10; fx.push({ s, vx: Math.cos(a) * v, vz: Math.sin(a) * v, life: 0.6 + Math.random() * 0.4, sz: sz * (0.8 + Math.random()) }); } }

  // ---------- state ----------
  const St = { fuel: 100, hull: 100, phase: 'start', paused: false, x: 0, z: 0, vx: 0, vz: 0, h: 0, y: 0, en: 100, boost: false, boostKey: false, slowF: 1, toast: null, toastT: 0, zone: null, dockable: null, anim: null, fade: 0, dist: 1, cool1: 0, cool2: 0, nameAsk: null, hudPad: false, t: 0 };
  // s378 CAMERA MODES (Ben): TOP (the old view) · LOW (low angle, north up) · CHASE (behind the ship, turns with it, stick = relative) · SWOOP (high in open space + fights, low + cinematic near docks / installs / planets). V or C cycles; the page's VIEW chip too.
  const CAM_MODES = ['swoop', 'low', 'chase', 'top'], CAM_KEY = 'space.camMode.v1';
  let camMode = 'swoop'; try { const q = localStorage.getItem(CAM_KEY); if (CAM_MODES.includes(q)) camMode = q; } catch (e) {}
  let camYaw = 0, swoopK = 0, camToast = 0, camOrbit = 0;
  function setCamMode(md) { if (!CAM_MODES.includes(md)) return; camMode = md; try { localStorage.setItem(CAM_KEY, md); } catch (e) {} toast('CAMERA · ' + ({ swoop: 'SWOOP (stick steers left / right)', low: 'LOW ANGLE', chase: 'CHASE (stick steers left / right)', top: 'TOP DOWN' })[md], 2); lastSig = ''; }
  const onCamKey = e => { if ((e.code === 'KeyV' || e.code === 'KeyC') && !e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) setCamMode(CAM_MODES[(CAM_MODES.indexOf(camMode) + 1) % CAM_MODES.length]); };
  window.addEventListener('keydown', onCamKey);
  const input = { jx: 0, jy: 0 }, keys = new Set();
  let V = 20, VB = 48, ACC = 30, ACCB = 80, FUEL_BURN = 100 / 140, MOD = shipMods(tiers(save)); const SLOW = 0.3;
  function applyMods() { MOD = shipMods(tiers(save)); if (save.stat('cargoPod', 0)) MOD = { ...MOD, cargo: (MOD.cargo || 0) + 4 };   /* s599 the towed CARGO POD */ V = 20 * MOD.speed; VB = 48 * MOD.speed; ACC = 30 * MOD.speed; ACCB = 80 * MOD.speed; FUEL_BURN = 100 / 140 * MOD.burn; St.hullMax = MOD.hull; St.hull = Math.min(St.hull, St.hullMax); }   // a full tank = ~140 s of full thrust (2D: half a tank = as far out as you can go and get back)
  // s412 TESTING (Ben): always start at MERU's dock for now. ?from=<key> still picks another dock. Set TEST_START = null to go back to the last dock.
  const TEST_START = 'meru';
  let startDock = null; try { const q = new URLSearchParams(location.search).get('from'); if (q) localStorage.setItem(LAST_DOCK, q); startDock = q || TEST_START || localStorage.getItem(LAST_DOCK); } catch (e) {}
  const sd = docks.find(d => d.key === startDock);
  if (sd) { St.x = sd.x; St.z = sd.z + 0.01; St.y = sd.Y; } else { const p = WORLDS.find(w => w.key === START_KEY); St.x = p.x; St.z = p.z; St.y = 0; }
  for (const e of INST) if (Math.hypot(e.x - St.x, e.z - St.z) < 260) buildInst(e);
  window.__spaceDbg = { sizes() { const L = o => { const b = new THREE.Box3().setFromObject(o); return +(Math.max(b.max.x - b.min.x, b.max.z - b.min.z)).toFixed(2); }; const out = { player: SHIP3 ? [HULLT, L(SHIP3.group)] : null, pirates: [], fleets: [] }; for (const p of (combat && combat.list) || []) { const o = Object.values(p).find(v => v && v.isObject3D); if (o) out.pirates.push([p.kind || p.cls || p.k, L(o)]); } return out; }, relaunch(key = 'p1') { const lw = WORLDS.find(w => w.key === key); St.x = lw.x; St.z = lw.z; St.y = -7.5; St.h = 0; St.vx = St.vz = 0; St.phase = 'launch'; St.anim = { t: 0, w: lw }; St.fade = 1; }, get docks() { return docks; }, land(key) { const d = docks.find(q => q.key === key); if (d) { St.x = d.x; St.z = d.z; St.vx = St.vz = 0; St.menu = { d, tab: 'main' }; api.dockGo(); } return St.phase; }, get deep() { return deep; }, get nests() { return nests; }, get beasts() { return beasts; }, ports: PIRATES, get swoopK() { return swoopK; }, get zone() { return St.zone && St.zone.name; }, get spd() { return Math.hypot(St.vx, St.vz) / V; }, jump(x, z) { St.x = x; St.z = z; St.vx = St.vz = 0; instCheck = 0; }, zoom(d) { St.dist = d; }, INST };
  applyMods(); St.hull = St.hullMax;
  try { const f = parseFloat(localStorage.getItem('space.fuel.v1')); if (isFinite(f)) St.fuel = clamp(f, 0, 100); } catch (e) {}
  let fuelSaveT = 0; const saveFuel = () => { try { localStorage.setItem('space.fuel.v1', St.fuel.toFixed(1)); } catch (e) {} };
  const toast = (t, s = 2.6) => { St.toast = t; St.toastT = s; };
  dFleet(save); if (dMigrate(save)) setTimeout(() => toast('Old trade routes closed. Cargo ships now need a DEAL: visit a dock TRADE OFFICE.', 6), 5000);   /* s601 */
  // s370 SHIP SHIELD (Pearl Sail's: engine/fox-shield.js, sized for the ship) → hull behind it
  /* s566b: the SCOUT keeps its tuned size (SS 3.0, shield r 3.75 h 1.5 cy 0.35); every other hull scales RELATIVE to the scout (measured once), so the scout's gameplay never changes */
  let scoutHalf = 0, scoutR = 0, scoutH = 0;
  function fitShield() { const f = SHIP3 && SHIP3.fit; if (!f) return; if (!scoutHalf) { if (HULLT === 'ship') { scoutHalf = f.half; scoutR = f.r; scoutH = f.h; } else { const s0 = IK.build('ship', LOOKS.ship || {}); s0.group.scale.multiplyScalar((HULL_FLY_SCALE.ship || 1.12) * SPACE_SHIP_BOOST); s0.group.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(s0.group); scoutHalf = Math.max(-bb.min.z, bb.max.z); scoutR = Math.max(Math.max(-bb.min.x, bb.max.x), scoutHalf) * 1.12; scoutH = Math.max(1.5, (bb.max.y - bb.min.y) * 1.05); } }
    if (HULLT === 'ship') { SS = 3.0; SH.resize(3.75, 1.5, 0.35); return; } SS = 3.0 * f.half / scoutHalf;   /* gameplay size: relative to the scout */
    SH.resize(f.hx * 1.12, Math.max(1.5, f.hy * 2.1), f.cy, f.hz * 1.1); }   /* s566c the SHIELD: an ellipsoid sized from the hull's own box (nose, stern, turret, wing tips inside) */   // s566 the shield fits round the ship you fly; SS (hit size) follows
  const SH = foxShield({ THREE }, ship, { hitDeep: 2.2, r: SS * 1.25, h: 1.5, cy: 0.35, lite: LOW, threat: () => combat && combat.threat(), say: (tx) => toast(tx, 1.6), barYaw: () => 0 });
  fitShield(); let combat = null, hullFlash = 0, fleets = null, ESC = null;
  // s599 SHIP ITEMS (Bridge ITEMS tab + the ITEM button): kept in save stat shipItems, pinned one in shipPin. Docks sell them (Bridge → ITEMS while docked).
  const SHIP_ITEMS = [['repair', 'REPAIR KIT', 'Hull +40.', 30], ['fuel', 'FUEL CELL', 'Fuel +35.', 20], ['shield', 'SHIELD CELL', 'Shields back to full.', 25], ['cell', 'ENERGY CELL', 'Energy +50.', 20]];
  const sItems = () => { const v = save.stat('shipItems', null); return v && typeof v === 'object' ? { ...v } : { repair: 2, fuel: 1, shield: 1, cell: 1 }; };
  function useShipItem(k) { k = k || save.stat('shipPin', 'repair'); const I = sItems(), d = SHIP_ITEMS.find(x => x[0] === k); if (!d) return; if (!I[k]) { toast('No ' + d[1] + ' left. Docks sell them.'); return; }
    if (k === 'repair') { if (St.hull >= St.hullMax && !(DMG && DMG.list.length)) { toast('Hull is full.'); return; } St.hull = Math.min(St.hullMax, St.hull + 40); burst(St.x, St.z, '#6ee7b7', 8, 0.8); const fx1 = DMG && DMG.fixOne(); if (fx1) setTimeout(() => toast(fx1 + ' REPAIRED.', 2.4), 1500); }
    if (k === 'fuel') { if (St.fuel >= 100) { toast('Fuel is full.'); return; } St.fuel = Math.min(100, St.fuel + 35); }
    if (k === 'shield') SH.restore();
    if (k === 'cell') { St.en = Math.min(100, St.en + 50); }
    I[k]--; save.setStat('shipItems', I); snd('pickup', { v: 0.6 }); toast(d[1] + ' · ' + d[2], 1.4); emit(true); }
  function hurt(d, fx, fz) { if (St.phase === 'cabin') { if (fx != null) { SH.absorb(d / MOD.shield, fx, fz, 0.35); SH.restore(); snd('shield', { v: 0.4 }); } return; }   /* s599: out of the seat = the shields hold (hits show, no damage) */ if (St.phase !== 'free') return; if (St.god) { if (fx != null) { SH.absorb(d / MOD.shield, fx, fz, 0.35); SH.restore(); snd('shield', { v: 0.5 }); } return; }   /* s598z5: invincible, but the shield still SHOWS each hit (red flash + blue pulse) */   /* s598 workshop GOD MODE */ if (!(DMG && DMG.shieldsOff()) && SH.absorb(d / MOD.shield, fx, fz, 0.35)) { snd('shield', { v: 0.6 }); return; } snd('hurt', { v: 0.7 }); St.hull = Math.max(0, St.hull - d); if (DMG && St.hull > 0) DMG.hit(d); hullFlash = 0.3; burst(St.x, St.z, '#ff5a3a', 6, 0.7); if (St.hull <= 0) towed(); }
  function towed() { deep.release(); const near = docks.filter(d => d.open).sort((a, b) => Math.hypot(a.x - St.x, a.z - St.z) - Math.hypot(b.x - St.x, b.z - St.z))[0]; St.phase = 'tow'; St.anim = { t: 0, d: near }; St.vx = St.vz = 0; burst(St.x, St.z, '#ff8a3a', 26, 2); }
  // s600 SPACE FUEL (Ben): TOW TUG only, called from the OUT OF FUEL card. First tow free, then 100 G; short of gold = the rest is owed (tugDebt, paid from your next gold). Drops you at the nearest FUEL DEPOT with a full tank.
  const TUG_PRICE = 100;
  function tugAsk() { if (St.phase !== 'free' || St.tugAsk || (typeof AR !== 'undefined' && AR && AR.on)) return; St.dryAgain = null; const first = !save.stat('tugUsed', 0), gold = save.data ? save.data.gold : 0;
    St.tugAsk = { first, price: first ? 0 : TUG_PRICE, owe: first ? 0 : Math.max(0, TUG_PRICE - gold), debt: save.stat('tugDebt', 0) }; St.paused = true; input.jx = input.jy = 0; keys.clear(); St.boostKey = St.boostBtn = false; snd('lowHp', { v: 0.8 }); emit(true); }
  function tugCall() { const A = St.tugAsk; if (!A) return; St.tugAsk = null; St.paused = false; const gold = save.data ? save.data.gold : 0; let msg = '';
    if (A.first) { save.setStat('tugUsed', 1); msg = 'First tow free.'; }
    else { save.setStat('tugUsed', save.stat('tugUsed', 0) + 1); const pay = Math.min(gold, TUG_PRICE), owe = TUG_PRICE - pay; if (pay) save.spend(pay); if (owe) save.setStat('tugDebt', save.stat('tugDebt', 0) + owe); msg = owe ? 'Paid ' + pay + ' G, you owe ' + owe + ' G.' : 'Paid ' + TUG_PRICE + ' G.'; }
    let b = null, bd = 1e9; for (const p of depots) { const dd = Math.hypot(p.x - St.x, p.z - St.z); if (dd < bd) { bd = dd; b = p; } } if (!b) return;
    deep.release(); St.tractor = null; St.auto = false; St.phase = 'tow'; St.anim = { t: 0, d: { x: b.x, z: b.z, Y: 0, name: b.name }, fuelTow: true, msg }; St.vx = St.vz = 0; snd('holster'); emit(true); }
  function tugLater() { if (!St.tugAsk) return; St.tugAsk = null; St.paused = false; St.dryAgain = St.t + 45; toast('Engines at 30 %. Skim green gas or limp to a FUEL DEPOT.', 4); emit(true); }
  // s410 DEFENDED SPACE: the swoop areas of every world's docks, installs + stations (not pirate bases / nests / the machine yard / finds)
  const HAVEN_T = new Set(['dock', 'yard', 'fuel', 'mine', 'gate', 'dsf', 'kufaStation', 'shastaStation', 'luxorStation', 'urStation', 'gayaStation', 'zionStation', 'neboStation', 'jiddaStation', 'homeStation']);
  const havenList = () => INST.filter(e => HAVEN_T.has(e.type) && !e.virtual && (e.tkey || WORLDS.some(w => w.key === e.wkey))).map(e => ({ x: e.x, z: e.z, r: (e.frange || (e.type === 'dock' ? 45 : 32)) + 6, wk: e.tkey || e.wkey }));
  let HAVENS = null; const havens = () => { if (!HAVENS) HAVENS = havenList(); return fleets ? HAVENS.filter(h => !fleets.atWar(h.wk)) : HAVENS; };
  combat = await createCombat({ THREE, scene, St, save, havens, perim: CELL * 1.6, machineCall: () => !!deep && !!deep.F && deep.F._razeAt && St.t - deep.F._razeAt < 180, onGuardFreed: p => deep.guardFreed(p), onFleetKill: k => fleets && fleets.onKill(k), onCrewBeaten: (x, z) => fleets && fleets.crewBeaten(x, z), grad, dotTex, burst, toast, docks, ports: PIRATES, LOW, save, hurt, shield: SH, IK, LOOKS, cover: () => deep.inCover(), wsFn: () => H() * 0.5 / Math.tan(camera.fov * Math.PI / 360) });
  // s371 space creatures (engine/last-kit.js): serpents in 3 mine belts, moth nests in 3 nebulae, 2 octopuses roaming the deep lanes
  const W_ = k => WORLDS.find(w => w.key === k), mineOf = k => ({ x: W_(k).x + INSTALLS.mine.dx, z: W_(k).z + INSTALLS.mine.dz });
  const homes = [...['ur', 'nebo', 'zion'].map(k => ({ fam: 'belt', ...mineOf(k) })), ...[0, 1, 3].map(i => ({ fam: 'vmoth', x: NEBULAE[i].x, z: NEBULAE[i].z })), { fam: 'octo', x: -CELL * 1.5, z: -CELL * 1.5 }, { fam: 'octo', x: CELL * 1.5, z: CELL * 1.5 }];
  const keepOut = WORLDS.filter(w => !w.frontier).map(w => ({ x: w.x, z: w.z, r: CELL * 0.42 }));   // s441 creature-free world neighbourhoods
  let SCOPE = null;   // s574 THE SCOPE (worlds/space-scope.js), made just below once combat + creatures exist
  const beasts = createCreatures({ THREE, scene, St, toon, ink, burst, toast, combat, hurt, homes, LOW, keepOut, save, IK, LOOKS, puff: PUFFS[0], nose: () => SS, safe: (x, z) => combat.safeAt(x, z) });
  try { SCOPE = createScope({ THREE, scene, camera, container, St, combat, beasts, burst, toast, snd, glowPop, dotTex, W, H, ship: () => ({ x: St.x, z: St.z }), muzzle: (i, out) => { const g = guns.length ? guns[i % guns.length] : null; if (g) g.getWorldPosition(out); else out.set(St.x, 0.3, St.z); return out; }, getEn: () => St.en, spendEn: n => { St.en = Math.max(0, St.en - n); },
    equip: k => { specEq = k; toast('EQUIPPED ON 2 · ' + (SPEC_N[k] || k), 2); }, equipped: () => specEq,   /* s581 the scope's weapon rail: EQUIP puts a weapon on button 2 */
    hold: (e, t) => { if (webbed.some(w => w.e === e)) return; webbed.push({ e, until: St.t + t, x: e.x, z: e.z, sheet: cocoon(e), t0: St.t }); },
    ring: (x, z, r, col) => { const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); ring.position.set(x, 0.3, z); scene.add(ring); beams.push({ mm: ring, life: 0.7, t: 0.7, ring: r }); }, power: () => (MOD && MOD.power) || 1 }); } catch (e) { console.warn('scope', e); }
  const splits = createSplit({ THREE, scene, St, WORLDS, CELL, burst, snd, hurt, combat, beasts, toast, LOW, shipR: () => SS * 1.15, mines: () => INST.filter(e => e.type === 'mine'), save, V }); if (combat.setCover) combat.setCover(() => splits.fields);   /* s598y pirate ambush cover */ window.__spaceSplit = splits;
  fleets = createFleets({ THREE, scene, IK, LOOKS, WORLDS, LOW, FLEET_PRE }); fleets.attach({ St, combat, toast, burst, save, beasts }); combat.setBeasts(beasts);
  deep.attach({ St, combat, toast, burst, save, V, onRaze: () => fleets.favorAll(2), holdCap: () => HOLD_CAP + MOD.cargo, scanT: () => tiers(save).scanner || 0 });
  try { EXP = createExplore({ THREE, scene, label: (...a) => { const l = label(...a); sizeLabels(); return l; }, deep, fleets, combat, St, toast, burst, save, snd, V, LOW, bodies, nameOf: k => names[k], emit: f => emit(f), arena: () => typeof AR !== 'undefined' && AR && AR.on,
    setCourse: (x, z, name) => { St.course = { x, z, name }; St.auto = false; toast('COURSE SET · ' + name, 2.4); emit(true); } }); deep.hook = EXP; } catch (e) { console.warn('explore', e); }
  DMG = createDamage({ THREE, scene, St, toast, snd, burst, dotTex, LOW }); DMG.onChange = (k, on) => { if (k === 'shields') SH.disable(on); emit(true); }; if (DMG.broken('shields')) SH.disable(true);   /* s606 SHIP DAMAGE */ nests.attach({ St, combat, beasts, toast, burst, save });
  const _thr = combat.threat; combat.threat = () => _thr() || beasts.threat();

  // ---------- input ----------
  const onKey = (e, down) => { if (St.phase === 'start' || St.paused) return; const k = e.code;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) { down ? keys.add(k) : keys.delete(k); e.preventDefault(); }
    if (k === 'Space' || k === 'ShiftLeft') { if (down && !St.boostKey && St.phase === 'free') snd('boost', { v: 0.5 }); if (!down && St.boostKey && St.phase === 'free') snd('boostEnd'); St.boostKey = down; e.preventDefault(); }
    if (!down && k === 'Digit2') api.rangeUp(); if (down && !e.repeat) { if (k === 'Digit1') api.melee(); if (k === 'Digit2') api.range(); if (k === 'KeyE') api.talk(); if (k === 'KeyY') api.turret(); if (k === 'Escape' && TU.on) TU.exit(); } };
  const kd = e => onKey(e, true), ku = e => onKey(e, false); addEventListener('keydown', kd); addEventListener('keyup', ku);
  renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); api.zoomBy(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });

  // ---------- zones ----------
  function zoneAt(x, z) { let best = null, bd = 1e9; for (const q of zones) { const d = Math.hypot(x - q.x, z - q.z); if (d < q.r && (q.kind === 'dock' ? d - 100 : d) < bd) { bd = q.kind === 'dock' ? d - 100 : d; best = q; } } return best; }
  function nearestWorld(x, z) { let b = null, bd = 1e9; for (const w of bodies) { const d = Math.hypot(x - w.x, z - w.z); if (d < bd) { bd = d; b = w; } } return { w: b, d: bd }; }

  // ---------- fire ----------
  // s576 (Ben: "make the missile LOOK like a big missile, with a blue particle trail"): a finned rocket (nose +z), built once, cloned per shot (shared geometry)
  const MSL = (() => { const g = new THREE.Group(), tm = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad }), body = tm('#e9edf3'), red = tm('#ec3013'), dark = tm('#2a2e3a'), ink = new THREE.MeshBasicMaterial({ color: 0x0a0d14, side: THREE.BackSide });
    const add = (geo, mat, x, y, z, rx = 0, rz = 0, o = 0.06) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.rotation.set(rx, 0, rz); g.add(me); if (o) { const k = new THREE.Mesh(geo, ink); k.scale.setScalar(1 + o); me.add(k); } return me; };
    const HP = Math.PI / 2; add(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 12), body, 0, 0, 0, HP); add(new THREE.ConeGeometry(0.3, 0.8, 12), red, 0, 0, 1.5, HP); add(new THREE.CylinderGeometry(0.31, 0.31, 0.16, 12), red, 0, 0, 0.55, HP, 0, 0);
    add(new THREE.CylinderGeometry(0.24, 0.32, 0.36, 12), dark, 0, 0, -1.26, HP); for (let i = 0; i < 4; i++) { const f = add(new THREE.BoxGeometry(0.06, 0.62, 0.62), red, 0, 0, -0.78, 0, 0, 0.1); f.rotation.z = i * HP; f.geometry.translate(0, 0.42, 0); }
    for (let i = 0; i < 4; i++) { const f = add(new THREE.BoxGeometry(0.04, 0.26, 0.3), dark, 0, 0, 0.75, 0, 0, 0.12); f.rotation.z = i * HP + Math.PI / 4; f.geometry.translate(0, 0.34, 0); }
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x5fb8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fl.scale.set(1.8, 1.8, 1); fl.position.z = -1.6; g.add(fl);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xe8f6ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); core.scale.set(0.8, 0.8, 1); core.position.z = -1.5; g.add(core);
    g.scale.setScalar(0.9); return g; })();
  function fire(missile) { const fw = new THREE.Vector3(Math.sin(St.h), 0, -Math.cos(St.h));
    const list = missile ? [0, 3] : [0, 3];   // s440 (Ben): DUAL torpedoes (one from each outer gun), same total damage: each carries half
    const TT = !missile && SHIP3.api.turret && !TU.on ? SHIP3.api.turret : null, BK = 1; if (TT) SHIP3.group.updateMatrixWorld(true);   /* s568 (Ben): Gunner + Flagship fire the laser burst from the BIG TURRET BARRELS, 25 % bigger */
    for (const [n, gi] of list.entries()) { const g = TT ? TT.muzzles[n % 2] : guns[gi], wp = new THREE.Vector3(); g.getWorldPosition(wp); if (TT) TT.fire(n % 2); const m = new THREE.Mesh(missile ? new THREE.SphereGeometry(0.28, 10, 8) : boltGeo, missile ? missMat : boltMat); m.position.set(wp.x, TT ? wp.y + 0.1 : 0.2, wp.z); m.rotation.y = -St.h; if (TT) m.renderOrder = 9; scene.add(m); if (!missile) { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x2f8fff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })), gs = TT ? 1.5 : 3.0; gl.scale.set(gs, gs, 1); if (TT) gl.renderOrder = 9; m.add(gl);
        const sh = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9fe0ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); sh.scale.set(gs * 0.55, gs * 0.55, 1); if (TT) sh.renderOrder = 9; m.add(sh); glowPop(wp.x, TT ? wp.y + 0.1 : 0.2, wp.z, 0x7df9ff, TT ? 1.6 : 3.6); }   /* s568c (Ben): the walk-in bursts leave the BARREL TIPS at barrel height (over the hull + the 8 crest), thin + small glow so the two bolts read as two */
      if (!missile) { const pw = 1 + 0.25 * (MOD.power - 1) / 0.18; if (TT) m.scale.setScalar(0.6 * pw); else m.scale.setScalar(pw); } const sp = missile ? 34 : 95; shots.push({ m, vx: fw.x * sp + St.vx, vz: fw.z * sp + St.vz, life: (missile ? 2.4 : 1.1) * MOD.reach, missile, tgt: null, seek: missile ? SEEK.torpedo : null, dir: [fw.x, fw.z], dmg: missile ? 45 * MOD.special / 2 : 10 * MOD.power });
      if (!missile && St.triT > St.t && n === 0) for (const s of [-1, 1]) { const a = St.h + s * 0.16, ax = Math.sin(a), az = -Math.cos(a), m2 = m.clone(); m2.material = m.material; m2.position.set(St.x + ax * SS, m.position.y, St.z + az * SS); m2.rotation.y = -a; scene.add(m2); shots.push({ m: m2, vx: ax * sp + St.vx, vz: az * sp + St.vz, life: 1.1 * MOD.reach, missile: false, tgt: null, seek: null, dir: [ax, az], dmg: 10 * MOD.power }); } } }   /* s598v TRIPLE LASER powerup: two extra bolts fanned out */
  // s411 SOLID BELT ROCKS, the 2D rules (Space_world: "a rock carries mass, so the shield takes the whole of it and shoves the rock back
  // out — you are pushed apart instead of grinding through it"): SHIELD UP = the shield absorbs the hit (8, frag 4), you are pushed
  // off it AND the rock is shoved away; SHIELD DOWN = hull -8 + a knock-back + a short grace. s411 (Ben): any pirate / machine /
  // creature that rams a rock while chasing you takes the hit too, so you can weave the belt to shake them. Belt serpents slip through.
  let beltWarn = false;
  const shove = (r, nx, nz, k) => { r.x -= nx * k; r.z -= nz * k; if (r.orR) { const dx = r.x - r.cx, dz = r.z - r.cz; r.orR = Math.min(76, Math.max(28, Math.hypot(dx, dz))); r.oa = Math.atan2(dz, dx); } };
  function beltHits(dt) { if (!MINES.length) return; const t = St.t;
    const bodies2 = [{ me: true, o: St, r: SS * 1.15 }]; for (const p of combat.list) bodies2.push({ o: p, r: p.C.size * 0.32, ship: true }); for (const c of beasts.list) if (c.fam !== 'belt') bodies2.push({ o: c, r: c.fam === 'vmoth' ? 4 : 5, beast: true });
    for (const B2 of bodies2) { const o = B2.o; if (B2.me && St.phase !== 'free') continue; if ((o._rockCd || 0) > t) continue;
      let mi = -1; for (let i = 0; i < MINES.length; i++) if (Math.abs(MINES[i].x - o.x) < MINES[i].R + 6 && Math.abs(MINES[i].z - o.z) < MINES[i].R + 6) { mi = i; break; } if (mi < 0) continue;
      for (const r of rocks) { if (r.mine !== mi || !r.alive) continue; const dx = o.x - r.x, dz = o.z - r.z, d = Math.hypot(dx, dz), R = r.s * 0.95 + B2.r; if (d >= R) continue;
        const nx = dx / (d || 1), nz = dz / (d || 1), hx = r.x + nx * r.s, hz = r.z + nz * r.s, dmg = 8; if (B2.me || Math.hypot(o.x - St.x, o.z - St.z) < 70) snd('rock', { v: B2.me ? 0.7 : 0.4 });
        o.x = r.x + nx * (R + 0.2); o.z = r.z + nz * (R + 0.2); const vn = (o.vx || 0) * nx + (o.vz || 0) * nz; if (vn < 0) { o.vx -= vn * nx; o.vz -= vn * nz; }
        if (B2.me) { if (SH.absorb(dmg / MOD.shield, hx, hz, 0.35)) { o.vx += nx * 6; o.vz += nz * 6; shove(r, nx, nz, 3.1); o._rockCd = t + 0.17; snd('shield', { v: 0.6 }); burst(hx, hz, '#cbd5e1', 8, 0.8); }
          else { St.hull = Math.max(0, St.hull - dmg); hullFlash = 0.3; o.vx += nx * 5; o.vz += nz * 5; o._rockCd = t + 0.75; snd('hurt', { v: 0.6 }); burst(hx, hz, '#c9a27a', 10, 1); if (St.hull <= 0) towed(); }
          if (!beltWarn) { beltWarn = true; toast('ASTEROID! The belt is solid. Your shield bounces you off; weave through to shake off anyone chasing you.', 4.5); } }
        else { o.vx = (o.vx || 0) + nx * 5; o.vz = (o.vz || 0) + nz * 5; shove(r, nx, nz, 2); o._rockCd = t + 0.6; burst(hx, hz, '#c9a27a', 8, 0.9);
          if (B2.ship) combat.hit(o, dmg + 4); else beasts.hitShot({ m: { position: { x: o.x, z: o.z } }, dmg: dmg + 4, missile: false }); }
        break; } } }
  const beltCoin = r => { const tier = r.s > 2.2 ? 2 : r.s >= 1.3 ? 1 : 0; if (tier && splits && splits.spawnPieces && r.cx != null) { splits.spawnPieces(r.x, r.z, tier - 1, r.cx, r.cz); return; } if (combat && combat.dropCoin) combat.dropCoin(r.x, r.z, tier === 2 ? 4 : tier ? 2 : 1, true); };   /* s597j: BIG belt rock → 2 MEDIUM → 2 SMALL → 1 coin each (the pieces live in space-split) */   /* s469 (Ben): EVERY asteroid drops coins when destroyed, the mine belts too */
  function hitRocks(s) { for (let i = 0; i < rocks.length; i++) { const r = rocks[i]; if (!r.alive || r.tw) continue; if (Math.hypot(r.x - s.m.position.x, r.z - s.m.position.z) < r.s + (s.missile ? 1.4 : 0.6)) { r.alive = 0; r.back = 25; beltCoin(r); burst(r.x, r.z, s.missile ? '#ffd23a' : '#f59e0b', s.missile ? 18 : 9, s.missile ? 1.6 : 1); snd(s.missile ? 'boom' : 'rockShot', { v: s.missile ? 0.7 : 0.5 }); if (s.missile) for (const q of rocks) if (q.alive && Math.hypot(q.x - r.x, q.z - r.z) < 5) { q.alive = 0; q.back = 25; beltCoin(q); } return true; } } return false; }

  // ---------- fuel ----------
  function refuel() { snd('refuel'); const need = 100 - St.fuel, cost = Math.ceil(need / 5), gold = save.data ? save.data.gold : 0; let to = 100, msg;
    if (gold >= cost) { save.spend(cost); msg = 'TANK FULL · ' + cost + ' gold'; } else if (gold > 0) { save.spend(gold); to = Math.min(100, St.fuel + gold * 5); msg = 'All your gold bought ' + Math.round(to - St.fuel) + ' % fuel.'; } else { to = Math.max(St.fuel, 30); msg = 'The depot crew tops you up to 30 %. Pay next time.'; }
    St.fill = { t: 0, from: St.fuel, to, msg }; St.depot = null; snd('pickup'); }
  // ---------- dock / undock ----------
  // s374 DOCK MENU: slowing over a dock + DOCK opens the station: GO DOWN (world's 3D page, or OPENING SOON) · TRADE · LEAVE
  const hold = () => { const h = save.stat('spaceHold', null); return h && typeof h === 'object' ? { ...h } : {}; }, holdN = h => Object.values(h).reduce((a, b) => a + b, 0);
  function yardData(m) { const T = tiers(save), gold = save.data ? save.data.gold : 0, FL = dFleet(save);
    return { yard: true, fit: sRows(save, HULLT, m.d.key, gold), title: m.d.name, tab: m.prog ? 'prog' : 'yard', fleetN: FL.length, fleetFree: freeShips(save).length, cargo: Object.entries(CARGO).filter(([, c]) => c[3]).map(([k, c]) => ({ k, n: c[0], crates: c[1], every: c[2], cost: c[3], own: FL.filter(x => x.size === k).length, can: gold >= c[3] })), gold, fuel: Math.round(St.fuel), hold: 0, cap: 0, goods: [],
      progs: PROGRAMMES.map(p => { const done = p.keys.reduce((a, k) => a + T[k], 0), max = p.keys.reduce((a, k) => a + RESEARCH[k].max, 0); return { k: p.k, n: p.n, d: p.d, done, max, soon: p.keys.every(k => RESEARCH[k].soon) }; }),
      prog: m.prog ? (() => { const p = PROGRAMMES.find(x => x.k === m.prog); return { n: p.n, d: p.d, ladders: p.keys.map(k => { const R = RESEARCH[k], tt = T[k]; return { k, n: R.n, step: R.step, d: R.d, t: tt, max: R.max, cost: tt < R.max ? R.cost[tt] : null, soon: !!R.soon, can: !R.soon && tt < R.max && gold >= R.cost[tt] }; }) }; })() : null }; }
  function menuData() { const m = St.menu; if (!m) return null; if (m.yard) return yardData(m); const d = m.d, h = hold(), n = holdN(h), gold = save.data ? save.data.gold : 0;
    const tk = d.tkey || d.key, war = fleets.atWar(tk), md = fleets.mood(tk);
    return { key: d.key, name: d.name, title: d.name + (d.station ? '' : ' DOCK'), station: !!d.station, warName: (WORLDS.find(w => w.key === tk) || {}).name || d.name, open: d.open && !war, war, mood: (d.station ? ((WORLDS.find(w => w.key === tk) || {}).name || '') + ' · ' : '') + md.t, moodCol: md.c, repair: (() => { const miss = Math.max(0, Math.round((St.hullMax || 100) - St.hull)), L = DMG ? DMG.list : []; if (!miss && !L.length) return null; const cost = DMG ? DMG.repairCost(miss) : Math.ceil(miss / 2); return { cost, can: gold >= cost, line: (miss ? 'HULL +' + miss : '') + (L.length ? (miss ? ' · ' : '') + L.map(x => x.n).join(' · ') : '') }; })(), peaceCost: fleets.price(tk), canWar: !fleets.allied(tk) && !war, tab: m.tab, hold: n, cap: HOLD_CAP + MOD.cargo, gold, fuel: Math.round(St.fuel),
      goods: GOODS.filter(g => (!g.frontier && !g.exportOnly) || (h[g.key] || 0) > 0).map(g => { const port = portKey(d), pr = MKT.buyPrice(g, port), sp = MKT.sellPrice(g, port), have = h[g.key] || 0, sh = MKT.shortage(g, port), av = sh ? 0 : portAvail(g, d.key), nx = av < 1 && !sh ? portNext(g, d.key) : 0, best = MKT.bestSale(g.key, port), paid = MKT.paid(g.key), ev = MKT.event(); return { key: g.key, name: g.name + (g.frontier ? ' (FRONTIER)' : ''), d: g.d, price: pr, sell: sp, trend: MKT.trend(g, port), lux: !!g.lux, contra: g.key === 'beta2_good', spoils: !!({ gaya_goat: 1, shasta_sheep: 1, kufa_camel: 1, nebo_bees: 1, shasta_ice_core: 1 })[g.key], event: ev.good === g.key && (ev.port === port || (ev.kind === 'SHORTAGE' && g.home !== port)) ? ev.kind : '', best: best ? { port: best.name, p: best.p, age: best.age, gain: best.p - pr } : null, paid, shortage: sh, have, home: g.home === d.key, mat: !!g.mat, stock: isFinite(av) ? av : null, restock: nx ? Math.ceil(nx / 60000) : 0, canBuy: !g.frontier && gold >= pr && n < HOLD_CAP + MOD.cargo && av > 0, canSell: have > 0 }; }),
      market: (() => { const port = portKey(d), ev = MKT.event(), T = MKT.tier(port), A = MKT.active(); return { event: ev.text, eventLeft: MKT.eventLeft(), rep: T.name, repN: T.n, repNext: T.next, repPct: Math.round(T.k * 100), licence: MKT.licence(), licCost: LICENCE_COST, licHere: port === 'meru', contracts: MKT.offers(port).map(o => ({ ...o, have: h[o.good] || 0 })), active: A.list.map(a => ({ ...a, left: Math.max(0, Math.ceil((a.due - Date.now()) / 60000)), have: h[a.good] || 0 })) }; })(),
      private: (() => { if (d.station || !OFFICERS[portKey(d)]) return null; const now = Date.now(), room = HOLD_CAP + MOD.cargo - n;
        return privBoard(portKey(d)).map(o => ({ ...o, mins: Math.max(1, Math.ceil((o.exp - now) / 60000)), have: h[o.good] || 0, room, cost: o.price * o.n, can: o.kind === 'buy' ? (h[o.good] || 0) >= o.n : gold >= o.price * o.n })); })(),
      storage: (() => { if (d.station || !OFFICERS[portKey(d)]) return null; const port = portKey(d), P = dStored(save, port), keys = [...new Set([...Object.keys(h), ...Object.keys(P)])];   /* s601b DOCK STORAGE */
        return keys.map(k => ({ key: k, name: goodName(k), aboard: h[k] || 0, kept: P[k] ? P[k][0] : 0, rent: P[k] ? dRent(P[k]) : 0, canTake: !!P[k] && n < HOLD_CAP + MOD.cargo })).filter(r => r.aboard || r.kept); })(),
      office: (() => { const port = portKey(d); if (d.station || !OFFICERS[port]) return null; const O = OFFICERS[port], T = MKT.tier(port), gt = dGate(save, port, { tierI: T.i, tierName: T.name, atWar: war }), N = m.neg, F = dFleet(save);   /* s601 TRADE OFFICE */
        const offer = gt.ok && N && N.step === 'offer' ? (() => { const e = dEff(port, N); return { name: goodName(N.good), dir: N.dir, price: e, base: N.base, crates: N.crates, runs: N.runs, fee: dFee(N.runs), run: e * N.crates, total: e * N.crates * N.runs, pat: N.pat }; })() : null;
        return { n: O.n, role: (WORLD_NAME[port] || '') + ' TRADE OFFICER', world: WORLD_NAME[port] || '', line: gt.ok ? ((N && N.line) || gt.line) : gt.line, ok: gt.ok, stand: T.name + (T.next ? ' · ' + T.n + ' / ' + T.next + ' CRATES TRADED' : ''), need: O.tier === 2 ? 'TRUSTED' : 'KNOWN', step: gt.ok ? (N ? N.step : 'dir') : 'gate', dir: N && N.dir,
          goods: gt.ok && N && N.step === 'good' ? (N.dir === 'in' ? goodsIn(port) : goodsOut()).map(g => ({ key: g.key, name: g.name, price: N.dir === 'in' ? MKT.buyPrice(g, port) : MKT.sellPrice(g, port), home: g.home === port })) : [],
          offer, runsOpts: RUNS, free: freeShips(save).length, fleet: F.length, here: tDeals(save).filter(x => x.port === port).map(x => ({ id: x.id, t: dealLine(save, x), last: (x.log || [])[0] || '' })) }; })() }; }
  // s599 CARGO YOU CAN SEE: crates on the hull (1 per 2 in the hold, up to 6) + the towed CARGO POD (+4 crates, bought at any dock, follows on a line)
  let CONV = null, EVT = null; const crateG = new THREE.Group(), crateM = new THREE.MeshToonMaterial({ color: '#c8a46a', gradientMap: grad }), bandM = new THREE.MeshBasicMaterial({ color: '#5a3a22' }); let crateN = -1, crateFor = null, crateT = 0;
  const pod = new THREE.Group(); { const pb = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 1.6), new THREE.MeshToonMaterial({ color: '#d8dce2', gradientMap: grad })); pod.add(pb); const st = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.12, 1.64), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); st.position.y = 0.1; pod.add(st); } pod.visible = false; scene.add(pod);
  const podLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.8 })); podLine.visible = false; scene.add(podLine);
  const podOn = () => !!save.stat('cargoPod', 0), _pp = new THREE.Vector3(), _pf = new THREE.Vector3();
  function cargoLook(dt) { if (!SHIP3) return; if ((crateT -= dt) <= 0) { crateT = 0.5; const n = Math.min(6, Math.ceil(holdN(hold()) / 2));
      if (n !== crateN || crateFor !== SHIP3) { crateN = n; crateFor = SHIP3; if (crateG.parent) crateG.parent.remove(crateG); crateG.clear(); const gs = SHIP3.group.scale.x || 1, F = SHIP3.fit || { half: 3, hy: 1, cy: 1 }, cs = F.half * 0.16 / gs, top = (F.cy + F.hy) / gs - cs * 0.3;
        for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(cs, cs * 0.8, cs), crateM), col = i % 3, row = Math.floor(i / 3); b.position.set((col - 1) * cs * 1.15, top + row * cs * 0.82, F.half * 0.25 / gs); crateG.add(b); const bd = new THREE.Mesh(new THREE.BoxGeometry(cs * 1.02, cs * 0.12, cs * 1.02), bandM); bd.position.copy(b.position); crateG.add(bd); }
        SHIP3.group.add(crateG); } }
    const on = podOn() && (St.phase === 'free' || St.phase === 'cabin'); pod.visible = podLine.visible = on; if (!on) return; const F = SHIP3.fit || { half: 3 }; SHIP3.group.getWorldPosition(_pp); _pf.set(Math.sin(St.h), 0, -Math.cos(St.h));
    const tx = _pp.x - _pf.x * F.half * 3.2, tz = _pp.z - _pf.z * F.half * 3.2; if (!pod.userData.init) { pod.position.set(tx, _pp.y, tz); pod.userData.init = true; } const k = 1 - Math.exp(-dt * 3); pod.position.x += (tx - pod.position.x) * k; pod.position.z += (tz - pod.position.z) * k; pod.position.y = _pp.y;
    pod.scale.setScalar(F.half * 0.9); pod.rotation.y = Math.atan2(_pp.x - pod.position.x, _pp.z - pod.position.z); const a2 = podLine.geometry.attributes.position; a2.setXYZ(0, _pp.x - _pf.x * F.half, _pp.y, _pp.z - _pf.z * F.half); a2.setXYZ(1, pod.position.x, pod.position.y, pod.position.z); a2.needsUpdate = true; }
  // s599 THE MACHINE FLEET TRADE POST: once the Machine Yard's guards are freed, slow over the yard = trade with the Fleet (MACHINE PARTS cheap, they pay well for ICE CORES)
  const YARD_D = { key: 'myard', port: 'myard', tkey: 'meru', name: 'MACHINE YARD', station: true, open: false, x: MACHINE_YARD.x, z: MACHINE_YARD.z };
  // s599 RIVAL TRADE POSTS: the 3 rival player planets (BABEL, DELOS, AKSUM) have no dock yet, but their traders meet you in orbit: slow over the planet + E
  const rivalPost = () => { if (St.phase !== 'free') return null; for (const w of WORLDS) if (w.player && w.key !== 'p1' && Math.hypot(St.x - w.x, St.z - w.z) < (w.r || 20) + 40) return w; return null; };
  const yardPost = () => !!save.stat('spaceYardGuardFree', 0) && Math.hypot(St.x - MACHINE_YARD.x, St.z - MACHINE_YARD.z) < 70;
  // s599 THE LIVING MARKET (worlds/trade-market.js): moving prices, events, memory, rep, contracts, licence, contraband, spoilage
  const MKT = createMarket({ GOODS, basePrice: priceAt }); MKT.eventNews();
  const mktTimer = setInterval(() => { if (dead) { clearInterval(mktTimer); return; } const n = MKT.eventNews(); if (n) { const B = bulkLot(evNow(), MKT.buyPrice); toast(n + (B ? ' · ' + B.who + ' at ' + (WORLD_NAME[B.port] || B.port) + ': ' + B.n + ' ' + B.name + ' at ' + B.price + ' G a crate.' : ''), 6); snd('buoy'); } const h = hold(), sp = MKT.spoil(h); if (sp.lost.length) { save.setStat('spaceHold', sp.hold); toast('IN THE HOLD · ' + sp.lost.map(([k, q]) => q + ' ' + ((GOODS.find(g => g.key === k) || {}).name || k)).join(', ') + ' lost on the trip. Fly faster with live cargo.', 4); emit(true); } }, 15000);
  const portKey = d => d.port || (d.station ? (d.tkey || d.key) : d.key);
  const evNow = () => ({ ...MKT.event(), ms: EVENT_MIN * 60000 }), privBoard = port => boardAt(port, { buyPrice: MKT.buyPrice, sellPrice: MKT.sellPrice, done: doneList(save), ev: evNow() });   /* s601c PRIVATE TRADES */
  function openMenu(d) { snd('menu'); St.menu = { d, tab: 'main' }; St.vx = St.vz = 0; const port = portKey(d), h = hold();
    const sp = MKT.spoil(h); let msg = sp.lost.length ? 'Lost on the trip: ' + sp.lost.map(([k, q]) => q + ' ' + ((GOODS.find(g => g.key === k) || {}).name || k)).join(', ') + '. ' : '';
    const sc = MKT.scan(h, !d.station); if (sc) { const fine = Math.min(save.data.gold || 0, sc.fine); if (fine) save.spend(fine); msg += 'PATROL SCAN · ' + sc.n + ' REAVER BULLION seized + a ' + fine + ' G fine. '; snd('shieldDown'); }
    const dl = MKT.deliver(port, h); for (const x of dl) { save.addGold(x.pay); msg += 'CONTRACT DONE · ' + x.c.n + ' ' + x.c.name + ' · +' + x.pay + ' G. '; } if (dl.length) snd('pickup');
    { const PO = save.stat('privOrders', null); if (Array.isArray(PO) && PO.length) { const keep = [], now = Date.now(); for (const o of PO) { if (o.exp < now) { msg += 'ORDER EXPIRED · ' + o.who + ' gave up on the ' + o.name + '. '; continue; }   /* s602 tavern orders, settled at the dock */
      if (o.port === port && (h[o.good] || 0) >= o.n) { h[o.good] -= o.n; if (!h[o.good]) delete h[o.good]; MKT.onUnload(o.good, o.n); save.addGold(o.price * o.n); MKT.addRep(port, o.n); msg += 'PRIVATE ORDER DONE · ' + o.n + ' ' + o.name + ' for ' + o.who + ' · +' + o.price * o.n + ' G. '; snd('pickup'); } else keep.push(o); } save.setStat('privOrders', keep); } }
    save.setStat('spaceHold', h); MKT.remember(port, GOODS.filter(g => !g.frontier).map(g => [g.key, MKT.sellPrice(g, port)])); if (msg) toast(msg.trim(), 5); emit(true); }
  // s416 DOCK WALK (Meru first): land ON the berth pad, step out, walk the shielded deck — no load screen
  const WALK = createDockWalk({ THREE, scene, grad, dotTex, LOW, toast: (a, b) => toast(a, b), snd: k => snd(k) });
  const CAB = createCabin({ THREE, WALK, getShip: () => SHIP3, toast: (a, b) => toast(a, b), snd: k => snd(k), data: () => { let th = null, bd = 1e9; for (const p of (combat && combat.list) || []) { if (p.dead) continue; const d = Math.hypot(p.x - St.x, p.z - St.z); if (d < bd) { bd = d; th = Math.round(d) + 'u'; } } return { hp: St.hull / (St.hullMax || 100) * 100, en: St.en, fuel: St.fuel, heading: ((St.h * 180 / Math.PI) % 360 + 360) % 360, speed: Math.hypot(St.vx, St.vz), course: St.course && St.course.name, courseD: St.course ? Math.round(Math.hypot(St.course.x - St.x, St.course.z - St.z)) : 0, threat: bd < 160 ? th : null }; } });   // s599 BRIDGE button: walk your cabin / sit in the scout
  // s442 INSTALL PADS: a landing pad + office beside each world's SHIPYARD, MINE, STARGATE and FUEL DEPOT (built when you come near)
  const PAD_NAME = { yard: 'SHIPYARD', mine: 'MINING', gate: 'STARGATE', fuel: 'FUEL DEPOT' };
  // s446 (Ben): ATTACHED to the install + on its LEVEL: the pad touches the install's west rim (the walkway + office run on west, away from it)
  // at the install's deck height. Footprint radius + deck height per type, measured from the models (per unit of e.sc).
  const PAD_FIT = { yard: { r: 20.7, lv: 6.9 }, mine: { r: 11, lv: 8.0 }, fuel: { r: 21.1, lv: 6.2 }, gate: { r: 20, lv: 2 } };
  const PADS = INST.filter(e => PAD_NAME[e.type] && WORLDS.some(w => w.key === e.wkey)).map(e => { const W0 = WORLDS.find(w => w.key === e.wkey), F = PAD_FIT[e.type], out = F.r * e.sc + 2.0;
    return { key: 'pad_' + e.wkey + '_' + e.type, padWalk: true, name: W0.name + ' ' + PAD_NAME[e.type], office: W0.name + ' ' + PAD_NAME[e.type], x: e.x - out, z: e.z, y: e.y + F.lv * e.sc, tint: W0.tint, open: true, inst: e.type, wkey: e.wkey, ix: e.x, iz: e.z, built: false }; });
  let padT = 0;
  function padsTick(dt) { WALK.tickPads(St.t); if ((padT -= dt) > 0) return; padT = 0.5; St.padHere = null; for (const p of PADS) { const d = Math.hypot(p.x - St.x, p.z - St.z); if (!p.built && d < 260) { p.built = true; WALK.padFor(p); } if (d < 6 && Math.hypot(St.vx, St.vz) < V * 0.5) St.padHere = p; } }
  window.__spacePads = PADS; window.__spaceInst = INST;
  // s464 COIN PICKUP SOUND (Ben: "a different sound for coins"): a bright two-note coin chime (B6 → E7, with a shimmer), a touch higher
  // for bigger coins; quick pickups in a row climb in pitch (a combo)
  let coinAC = null, coinRun = 0, coinLast = 0; window.__spaceCoin = (n = 1) => { if (window.__8gMuted) return; try { coinAC = coinAC || new (window.AudioContext || window.webkitAudioContext)(); if (coinAC.state === 'suspended') coinAC.resume();
      const T = coinAC.currentTime, now = performance.now(); coinRun = now - coinLast < 700 ? Math.min(coinRun + 1, 6) : 0; coinLast = now; const up = Math.pow(2, (coinRun + (n >= 3 ? 2 : 0)) / 12), out = coinAC.createGain(); out.gain.value = 0.16; out.connect(coinAC.destination);
      [[1976 * up, 0, 0.09], [2637 * up, 0.075, 0.32]].forEach(([f, d, len]) => { for (const [mul, typ, v] of [[1, 'square', 0.35], [2, 'sine', 0.5], [3.01, 'sine', 0.15]]) { const o = coinAC.createOscillator(), g = coinAC.createGain(), lp = coinAC.createBiquadFilter(); o.type = typ; o.frequency.value = f * mul; lp.type = 'lowpass'; lp.frequency.value = 7000; o.connect(lp); lp.connect(g); g.connect(out);
        g.gain.setValueAtTime(0.0001, T + d); g.gain.linearRampToValueAtTime(v, T + d + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, T + d + len); o.start(T + d); o.stop(T + d + len + 0.02); } }); } catch (e) {} };
  // s447 location sounds driven by the models: the mining arm calls __spaceArm on each move / grab / hatch / drop; the shipyard weld calls __spaceWeld
  const _wp = new THREE.Vector3(), locFall = root => { root.getWorldPosition(_wp); const d = Math.hypot(_wp.x - St.x, _wp.z - St.z), q = Math.max(0, 1 - d / 90); return q * q; };
  window.__spaceArm = (ev, root, len) => { if (St.phase === 'start') return; const f = locFall(root); if (f < 0.03) return; if (ev === 'move') playSample('mineArm', { v: 0.55 * f, p: 0.85, gap: 0, len }); else if (ev === 'grab') playSample('asteroidBump', { v: 0.35 * f, p: 1.3, gap: 0 }); else if (ev === 'hatch') playSample('siloHatch', { v: 0.6 * f, gap: 0 }); else if (ev === 'drop') setTimeout(() => playSample('oreDrop', { v: 0.6 * f, gap: 0 }), 250); };
  let weldOn = 0; window.__spaceWeld = (on, root) => { if (on) weldOn = Math.max(weldOn, locFall(root)); };
  // s569 STERN-IN DOCKING (Ben): the walk-in ships (Shuttle, Corvette, Gunner, Flagship) back up to the berth NOSE OUT into space (south, away from the spine), so only the open RAMP
  // touches the pad: the ramp foot lands on the pad centre, the hull hangs out over space. The fox walks off the ramp (first time per ship: the camera flies down the ship from the cockpit).
  const WALK_SB = { hullShuttle: 6.3, hullCorvette: 7.2, hullGunship: 7.9, hullFlagWalk: 9.5 };
  /* s570 (Ben): parked NOSE EAST, the ramp foot on the END OF THE DECK so you walk straight off the deck up the ramp; the ship at WALK SCALE */
  function bigPose(P, d) { if (!WALK_LEN[HULLT] || !SHIP3.api.rampFoot) return null; const D = WALK.padFor(d), s = D.s || 1, kH = WALK.metreK(d) * WALK_SB[HULLT], foot = SHIP3.api.rampFoot[2] * kH, fx = D.xE + 0.8 * s; return { x: fx + foot, z: D.z0, y: D.y + 0.04, h: Math.PI / 2, kH }; }
  function bigInfo(B, mayFirst) { const D2 = SHIP3.api.dims, kH = B.kH, ox = B.x, oz = B.z, oy = B.y; let first = false; if (mayFirst) { try { const o = JSON.parse(localStorage.getItem('space.cockpit.v1') || '{}'); first = !o[HULLT]; o[HULLT] = 1; localStorage.setItem('space.cockpit.v1', JSON.stringify(o)); } catch (e) {} }
    return { nose: [ox + ((D2.noseLen || 1.2) - D2.front) * kH, oy + (D2.floor + 0.3) * kH, oz], door: [ox - D2.hinge * kH + 0.15, oy + D2.floor * kH + 0.05, oz], foot: [ox - SHIP3.api.rampFoot[2] * kH, oy + 0.05, oz], first }; }
  function beginLand(d) { if (WALK_SB[HULLT]) WALK.dockShip({ type: HULLT, group: SHIP3.group, body: SHIP3.group.children[0], api: SHIP3.api }); St.phase = 'land'; St.anim = { t: 0, d, x0: St.x, z0: St.z, h0: St.h, y0: St.y }; St.vx = St.vz = 0; WALK.begin(d); }
  function beginDock(d) { snd('shieldUp');
    St.phase = 'docking'; St.anim = { t: 0, d, x0: St.x, z0: St.z, h0: St.h }; St.vx = St.vz = 0; }
  function beginUndock() { St.phase = 'undock'; St.anim = { t: 0 }; snd('undock'); }

  // ---------- minimap ----------
  let mini = null, miniT = 0;
  function drawMini() { if (!mini) return; const c = mini, x = c.getContext('2d'), w = c.width, h = c.height, R = 520, k = Math.min(w, h) / (2 * R);
    if (DMG && DMG.navOff()) { x.fillStyle = '#05060c'; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.fillStyle = Math.random() < 0.5 ? '#2a2c33' : '#4a4d57'; x.fillRect(Math.random() * w, Math.random() * h, 3, 2); } x.fillStyle = '#ec3013'; x.font = '900 ' + Math.round(w / 9) + 'px Archivo, sans-serif'; x.fillText('NAV DOWN', w * 0.08, h * 0.55); return; }   /* s606 */
    x.fillStyle = '#05060c'; x.fillRect(0, 0, w, h); const tx = v => w / 2 + (v - St.x) * k, tz = v => h / 2 + (v - St.z) * k;
    for (const b of bodies) { x.fillStyle = b.tint; x.beginPath(); x.arc(tx(b.x), tz(b.z), Math.max(3, b.r * k), 0, 7); x.fill(); }
    x._k = k; window.__spaceSplit && window.__spaceSplit.mini(x, tx, tz, k); deep.mini(x, tx, tz); EXP && EXP.mini(x, tx, tz); nests.mini(x, tx, tz, k); fleets.mini(x, tx, tz);
    x.fillStyle = '#6ee7b7'; for (const p of depots) { x.fillRect(tx(p.x) - 3, tz(p.z) - 3, 6, 6); }
    for (const d of docks) { x.strokeStyle = d.open ? '#6ee7b7' : '#ec3013'; x.lineWidth = 2; x.beginPath(); x.arc(tx(d.x), tz(d.z), Math.max(4, d.r * k), 0, 7); x.stroke(); }
    x.fillStyle = '#ff3a4a'; for (const p of combat.list) { x.beginPath(); x.arc(tx(p.x), tz(p.z), 3.5, 0, 7); x.fill(); }
    x.fillStyle = '#c070c8'; for (const p of beasts.list) { x.beginPath(); x.arc(tx(p.x), tz(p.z), 5, 0, 7); x.fill(); }
    x.save(); x.translate(w / 2, h / 2); x.rotate(St.h); x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(0, -7); x.lineTo(5, 6); x.lineTo(-5, 6); x.closePath(); x.fill(); x.restore(); }

  // ---------- HUD ----------
  let lastSig = '';
  function emit(force) {
    const z = St.zone, d = St.dockable, nw = nearestWorld(St.x, St.z), sv = save && save.data;
    const place = 'Space · ' + (nw.d < 140 ? (EXP && EXP.uncharted(nw.w.key) ? 'Uncharted world' : names[nw.w.key] || nw.w.name) : 'Deep space');
    let note = null;
    if (St.course && St.phase === 'free') { const cd = Math.round(Math.hypot(St.course.x - St.x, St.course.z - St.z)), br = Math.round(((Math.atan2(St.course.z - St.z, St.course.x - St.x) * 180 / Math.PI + 90) % 360 + 360) % 360); note = { title: (St.auto ? 'AUTOPILOT · ' : 'COURSE · ') + St.course.name, sub: cd + 'u · BRG ' + String(br).padStart(3, '0') + (St.auto ? ' · touch the stick to take over' : ' · steer to it') }; }
    if (St.phase === 'free' && z) { if (z.kind === 'dock') note = { title: z.name + (z.station ? '' : ' DOCK'), sub: z.open ? (d ? 'Slowed. Press DOCK.' : 'Slowing down…') : 'Opening soon. This world is still being built.' };
      else if (z.kind === 'planet' && z.w.player) note = { title: (names[z.w.key] || z.w.name) + ' WORLD', sub: z.w.dock ? 'Your home planet. Slow over the dock and land.' : 'No dock yet. The players build one.' };
      else note = deep.note(z) || { title: z.name, sub: camMode === 'swoop' ? 'Swoop view · the ship slows here' : 'Let go of the stick to stop' }; }
    const fuelCost = Math.ceil((100 - St.fuel) / 5), prompt = (typeof AR !== 'undefined' && AR && AR.on && !(St.phase === 'free' && St.unhackT)) ? null : St.phase === 'walk' ? WALK.W.prompt : St.phase === 'cabin' ? CAB.C.prompt : St.menu ? null : St.phase === 'free' && yardPost() ? 'Trade with the Machine Fleet' : rivalPost() ? 'Trade with ' + ((names[rivalPost().key]) || rivalPost().name) : St.phase === 'free' && St.unhackT ? 'Unhack the machine' : St.phase === 'free' && St.padHere ? 'Land on the ' + St.padHere.office + ' pad' : St.phase === 'free' && St.depot ? 'Refuel · ' + fuelCost + ' G' : St.phase === 'free' && St.yardZ && !St.tow ? 'Shipyard' : St.phase === 'free' && d ? 'Dock at ' + d.name : (window.__spaceSplit && window.__spaceSplit.prompt()) || deep.prompt();
    const scopeH = SCOPE && !TU.on ? SCOPE.hud() : null;
    const hud = { scope: scopeH, phase: St.phase, hp: Math.round(St.hull), items: (() => { const I = sItems(); return SHIP_ITEMS.filter(x => I[x[0]]).map(([id, label]) => ({ id, label, n: I[id] })); })(), hpMax: St.hullMax, en: Math.round(St.en), gold: sv ? sv.gold : 0, place, slot: (() => { const k = specEq || sActive(save, HULLT); if (!k) return { name: 'NONE', n: slotsFor(HULLT) }; const t = specEq ? 0 : (sFit(save).owned[k] || 1) - 1; return { name: SPECIAL_NAME[k] + (specEq ? ' · TEST' : ' ' + ROMAN[t]), en: specEq ? 0 : SPECIAL_SHOP[k][2], n: slotsFor(HULLT) }; })(), board: St.board ? { taps: St.board.taps, need: St.board.need, left: Math.max(0, Math.ceil(St.board.left)) } : null, quest: St.evQuest ? St.evQuest : ESC && ESC.on ? ESC.hudQuest() : { title: 'Space', text: 'Fly over a dock. The ship slows. Press DOCK.' }, say: St.say || null, prompt, toast: St.toast, note, fade: St.fade, damage: DMG ? DMG.list : [], nameAsk: St.nameAsk, buoyCard: St.buoyCard || null, dockMenu: menuData(), boosting: St.boost, fuel: Math.round(St.fuel), lowFuel: St.lowBanT > 0 && St.fuel > 0 && St.phase === 'free', tugAsk: St.tugAsk || null, speed: Math.round(Math.hypot(St.vx, St.vz) / V * 100), camMode, turretAvail: tuAvail(), turretOn: TU.on, hull: HULLT };
    const sig = JSON.stringify([specEq, JSON.stringify(save.stat('shipFit', null)), St.board && St.board.taps, St.board && Math.ceil(St.board.left), St.evQuest && St.evQuest.text, St.lowBanT > 0, !!St.tugAsk, scopeH, HULLT, tuAvail(), TU.on, St.say && St.say.text, ESC && ESC.ph, St.padHere && St.padHere.key, St.menu && fleets.atWar(St.menu.d.tkey || St.menu.d.key), camMode, !!St.tow, St.skimming, hud.phase, hud.en, place, prompt, St.toast, note && note.title, note && note.sub, Math.round(St.fade * 20), St.nameAsk && St.nameAsk.key, St.buoyCard && JSON.stringify(St.buoyCard), DMG && DMG.list.map(x => x.k).join(), St.boost, Math.round(St.hull), !!St.unhackT, Math.round(St.fuel), !!St.depot, St.menu && JSON.stringify([St.menu.tab, St.menu.prog, hold(), tiers(save), save.data && save.data.gold])]);
    if (force || sig !== lastSig) { lastSig = sig; onState(hud); }
  }

  // s565 THE TURRET IN SPACE (Ben's picks): the GUNNER + FLAGSHIP have a manned turret. TURRET button (HUD, above ACTIONS) or Y = take / leave the seat. While you sit there the AUTOPILOT
  // chases the nearest pirate and circles it; no pirate = it hunts the nearest target of any kind (creature, rock, machine); nothing = it holds its heading slowly. Your stick / WASD / drag
  // swings the turret all the way round, 1 / MELEE fires its twin barrels (the normal shot pipeline, so pirates, creatures, rocks + hacked machines all react as to your lasers).
  // Time runs SLOW only while enemies are near (120 u). The CAMERA button toggles the view: ABOVE (the map camera + an aim line) / DOME (inside the turret, looking where you aim).
  const TU = { on: false, view: 'top', aim: 0, held: false, cd: 0, side: 0, near: false, tgt: null, orbit: 1, name: '' };
  const aimLine = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 60).rotateX(-Math.PI / 2).translate(0, 0, -30), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false })); aimLine.visible = false; scene.add(aimLine);
  const aimRing = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.1, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false })); aimRing.visible = false; scene.add(aimRing);
  const tuOv = document.createElement('div'); tuOv.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3;display:none;font-family:Archivo,sans-serif';
  tuOv.innerHTML = '<div data-x style="position:absolute;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border:3px solid #ec3013;border-radius:50%;box-sizing:border-box;transition:width .12s,height .12s,margin .12s,border-color .12s,box-shadow .12s"><div data-xl style="position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:6px;background:#ec3013;color:#fff;font:900 11px Archivo,sans-serif;letter-spacing:.12em;padding:2px 6px;white-space:nowrap;display:none">HIT</div></div><div style="position:absolute;left:50%;top:max(64px,calc(env(safe-area-inset-top) + 56px));transform:translateX(-50%);background:#201e1d;color:#f3f2f2;border:2px solid #f3f2f2;padding:8px 14px;display:flex;gap:14px;align-items:baseline;white-space:nowrap"><span style="font-weight:900;font-size:18px;letter-spacing:.04em">TURRET</span><span data-t style="font-weight:800;font-size:14px;color:#ffd23a">AUTOPILOT</span><span data-s style="font-weight:800;font-size:14px;color:#7fc8ff"></span></div>';
  container.appendChild(tuOv); const tuXL = tuOv.querySelector('[data-xl]'), tuX = tuOv.querySelector('[data-x]'), tuT = tuOv.querySelector('[data-t]'), tuS = tuOv.querySelector('[data-s]'); const _tE = new THREE.Vector3(), _tM = new THREE.Vector3();
  const tuAvail = () => !!(SHIP3 && SHIP3.api.turret) && St.phase === 'free' && !St.menu;
  TU.enter = () => { if (TU.on || !tuAvail()) return; TU.on = true; TU.aim = St.h; TU.held = false; TU.view = 'dome'; TU.spin = 0; if (SHIP3.api.turret.setBarrel) SHIP3.api.turret.setBarrel(0.68);   /* s568e (Ben): start IN THE DOME, short barrels in the turret so you see more */ tuOv.style.display = 'block'; snd('menu', { v: 0.5 }); toast('TURRET · stick aims · 1 fires · AUTOPILOT flies · CAMERA = view', 3.2); emit(true); };
  TU.exit = () => { if (!TU.on) return; TU.on = false; TU.held = false; if (SHIP3.api.turret) { SHIP3.api.turret.release(); if (SHIP3.api.turret.setBarrel) SHIP3.api.turret.setBarrel(1); } tuOv.style.display = 'none'; aimLine.visible = aimRing.visible = false; emit(true); };
  TU.pick = () => { const x = St.x, z = St.z, R2 = 260; let p = combat.nearest(x, z, R2), kind = 'PIRATE'; if (!p) { p = beasts.nearest(x, z, R2); kind = 'CREATURE'; }
    if (!p) { let bd = R2; for (const r of rocks) { if (!r.alive) continue; const d = Math.hypot(r.x - x, r.z - z); if (d < bd) { bd = d; p = r; kind = 'ROCK'; } } } TU.tgt = p || null; TU.name = p ? kind : ''; TU.near = !!combat.nearest(x, z, 120) || !!beasts.nearest(x, z, 120); };
  TU.steer = () => { const p = TU.tgt; if (!p) return [Math.sin(St.h) * 0.35, -Math.cos(St.h) * 0.35]; const dx = St.x - p.x, dz = St.z - p.z, d = Math.hypot(dx, dz) || 1, rad = TU.name === 'ROCK' ? 26 : 34;
    const tx = -dz / d * TU.orbit, tz = dx / d * TU.orbit, pull = clamp((d - rad) / rad, -1, 1), vx = tx - dx / d * pull, vz = tz - dz / d * pull, l = Math.hypot(vx, vz) || 1; return [vx / l * 0.75, vz / l * 0.75]; };
  TU.tick = (rdt2, ix2, iz2) => { if (!tuAvail()) { TU.exit(); return; } TU.pickT = (TU.pickT || 0) - rdt2; if (TU.pickT <= 0) { TU.pickT = 0.5; TU.pick(); }
    const sx = clamp(ix2, -1, 1); TU.spin += (sx * 3.4 - TU.spin) * Math.min(1, rdt2 * 6); TU.aim += TU.spin * rdt2 + (TU.drag || 0); TU.drag = 0; TU.aim = Math.atan2(Math.sin(TU.aim), Math.cos(TU.aim));   /* s568e: spins all the way round with no limit, eases in + out, drag aims too */ const T2 = SHIP3.api.turret; T2.aim(-(TU.aim - St.h), 0.08);
    TU.cd -= rdt2; if ((TU.held || keys.has('Digit1')) && TU.cd <= 0) { TU.cd = 0.14 / MOD.rate; const i = TU.side; TU.side = 1 - TU.side; T2.fire(i); SHIP3.group.updateMatrixWorld(true); T2.muzzles[i].getWorldPosition(_tM); const fx = Math.sin(TU.aim), fz = -Math.cos(TU.aim), m = new THREE.Mesh(boltGeo, boltMat); m.position.set(_tM.x, _tM.y + 0.1, _tM.z); m.rotation.y = -TU.aim; m.scale.set(0.55, 0.55, 1.25); m.renderOrder = 9; scene.add(m);   /* s568e from the barrel tips, at barrel height */
      shots.push({ m, vx: fx * 110 + St.vx, vz: fz * 110 + St.vz, life: 1.2 * MOD.reach, missile: false, tgt: null, dmg: 12 * MOD.power }); glowPop(_tM.x, _tM.y + 0.1, _tM.z, 0xffd23a, 1.6); snd('laser', { v: 0.5 }); }
    const top = TU.view === 'top'; aimLine.visible = aimRing.visible = top; if (top) { aimLine.position.set(St.x, 0.25, St.z); aimLine.rotation.y = -TU.aim; aimRing.position.set(St.x + Math.sin(TU.aim) * 58, 0.3, St.z - Math.cos(TU.aim) * 58); }
    if (top) { tuX.style.display = 'none'; const H = tuHit(); aimRing.position.set(H.x, 0.3, H.z); aimRing.material.color.set(H.o ? 0xff3a2a : 0xffd23a); aimRing.scale.setScalar(H.o ? 1.4 + Math.sin(St.t * 10) * 0.1 : 1); } else tuX.style.display = 'block';
    tuX.style.display = top ? 'none' : 'block'; tuT.textContent = TU.tgt ? 'AUTOPILOT · CIRCLING THE ' + TU.name : 'AUTOPILOT · HOLDING COURSE'; tuS.textContent = TU.near ? 'SLOW TIME' : ''; };
  // s588 (Ben): the turret's red circle SITS ON WHAT THE SHOT WILL HIT: march the aim line from the ship, the first ship / creature / rock it crosses (within 120 u) is the hit; the circle slides onto it, shrinks + glows + says HIT. Nothing in the line = it rests at the far end, dim.
  const _tp = new THREE.Vector3(), TUH = { sx: null, sy: null, lock: null };
  function tuHit() { const fx = Math.sin(TU.aim), fz = -Math.cos(TU.aim), R = 120; let best = null, bt = R;
    const test = (x, z, r, o) => { const dx = x - St.x, dz = z - St.z, t = dx * fx + dz * fz; if (t <= 2 || t >= bt) return; const px = dx - fx * t, pz = dz - fz * t; if (px * px + pz * pz < r * r) { bt = t; best = o; } };
    for (const e of enemiesNear(St.x, St.z, R + 10)) test(e.x, e.z, Math.max(2.4, e.C ? e.C.size * 0.5 : 3), e);
    for (const r of rocks) if (r.alive && Math.abs(r.x - St.x) < R && Math.abs(r.z - St.z) < R) test(r.x, r.z, r.s * 0.95, r);
    return { x: St.x + fx * bt, z: St.z + fz * bt, o: best, t: bt }; }
  function tuMark() { const H = tuHit(), W0 = container.clientWidth || innerWidth, H0 = container.clientHeight || innerHeight; camera.updateMatrixWorld(); _tp.set(H.x, H.o ? 0.4 : 0.3, H.z).project(camera);
    let sx = (_tp.x * 0.5 + 0.5) * W0, sy = (-_tp.y * 0.5 + 0.5) * H0; if (_tp.z > 1 || !isFinite(sx)) { sx = W0 / 2; sy = H0 * 0.42; } sx = clamp(sx, 30, W0 - 30); sy = clamp(sy, 70, H0 - 30);
    if (TUH.sx == null) { TUH.sx = sx; TUH.sy = sy; } const k = H.o ? 0.45 : 0.25; TUH.sx += (sx - TUH.sx) * k; TUH.sy += (sy - TUH.sy) * k; tuX.style.transform = 'translate(' + TUH.sx.toFixed(1) + 'px,' + TUH.sy.toFixed(1) + 'px)';
    const lk = !!H.o; if (lk !== TUH.lock) { TUH.lock = lk; const z = lk ? 40 : 54; tuX.style.width = tuX.style.height = z + 'px'; tuX.style.margin = (-z / 2) + 'px 0 0 ' + (-z / 2) + 'px'; tuX.style.borderColor = lk ? '#ff3a2a' : 'rgba(236,48,19,0.5)'; tuX.style.boxShadow = lk ? '0 0 0 2px rgba(255,255,255,0.85), 0 0 18px 4px rgba(255,58,42,0.6)' : 'none'; tuXL.style.display = lk ? 'block' : 'none'; if (lk) snd('menu', { v: 0.18 }); }
    if (TU.view === 'top') aimRing.position.set(H.x, 0.3, H.z); return H; }
  TU.cam = () => { if (TU.view !== 'dome') return; const T2 = SHIP3.api.turret; T2.eye.getWorldPosition(_tE); const fx = Math.sin(TU.aim), fz = -Math.cos(TU.aim); camera.position.set(_tE.x - fx * 1.2, _tE.y + 0.75, _tE.z - fz * 1.2); camera.lookAt(_tE.x + fx * 40, _tE.y - 3.5, _tE.z + fz * 40);   /* s568g a step back + up so both barrels show */ tuMark(); };
  // s568 TEST SPECIALS (Ben: "for testing, SPECIAL cycles to the next special weapon each press"): every 2D ARM (station-arms ARMS, minus the twin lasers) as a player weapon,
  // all through the normal shot pipeline so pirates / creatures / rocks react. TORPEDO (dual, as before) · MISSILE (homes) · THE LANCE (1.4 s burn along your nose) · RAIL (pierces the line)
  // · FLAK (close cone) · MINES (3 dropped behind) · WEB (holds what it hits 4 s) · ARC (leaps 4 targets) · EMP (pulse ring, stalls everything near 1.6 s). No energy cost while testing.
  const SPECS = ['PLASMA_TORPEDO', 'MISSILE', 'RED_CANNON', 'RAIL', 'FLAK', 'MINES', 'WEB', 'ARC', 'EMP'];
  const SPEC_N = { PLASMA_TORPEDO: 'TORPEDO · heavy single round', MISSILE: 'MISSILE · homes on the nearest', RED_CANNON: 'THE LANCE · one-second burn', RAIL: 'RAIL · pierces the whole line', FLAK: 'FLAK · close cone, shreds rock + drones', MINES: 'MINES · dropped behind you', WEB: 'WEB · holds a ship still 4 s', ARC: 'ARC · strikes one, leaps to the next', EMP: 'EMP · stalls everything near' };
  let specI = -1, specEq = null; const beams = [], webbed = [], webMat = new THREE.MeshBasicMaterial({ color: 0xbfe4ff, wireframe: true, transparent: true, opacity: 0.9, toneMapped: false });
  // s579 THE WEB (Ben): fired as the ball, it BLOOMS into a spider web 3x the ball's size right after launch, flies a SHORT way, and catches EVERY ship it sweeps over (clusters too); each caught ship wears a small web while held
  // s583 WEB LOOK (Ben: "the web needs help"): a real ORB WEB: 14 slightly wavy radial threads, a SPIRAL capture thread, glowing dew beads where they cross, an ice-blue halo (player blue)
  const webTex = (() => { const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), C = S / 2, N = 14, R = S * 0.47; x.lineCap = 'round'; x.lineJoin = 'round';
    const halo = x.createRadialGradient(C, C, 0, C, C, R); halo.addColorStop(0, 'rgba(120,190,255,0.35)'); halo.addColorStop(0.6, 'rgba(60,140,255,0.10)'); halo.addColorStop(1, 'rgba(40,110,255,0)'); x.fillStyle = halo; x.fillRect(0, 0, S, S);
    const ang = Array.from({ length: N }, (_, i) => i / N * 6.283 + (Math.sin(i * 7.3) * 0.08)), thread = (w, col, blur) => { x.strokeStyle = col; x.lineWidth = w; x.shadowColor = '#6fc0ff'; x.shadowBlur = blur; };
    thread(11, '#e8f6ff', 18); for (const a of ang) { x.beginPath(); x.moveTo(C, C); for (let k = 1; k <= 6; k++) { const r = R * k / 6, w = Math.sin(k * 1.9 + a * 3) * 4; x.lineTo(C + Math.cos(a) * r - Math.sin(a) * w, C + Math.sin(a) * r + Math.cos(a) * w); } x.stroke(); }
    thread(7, '#ffffff', 14); x.beginPath(); const turns = 7, steps = turns * N; for (let s = 0; s <= steps; s++) { const k = s / steps, a = ang[s % N] + Math.floor(s / N) * 0 , r = R * (0.12 + 0.86 * k), sag = 0.9; const a0 = ang[s % N], a1 = ang[(s + 1) % N];
      const px = C + Math.cos(a0) * r, py = C + Math.sin(a0) * r; if (!s) x.moveTo(px, py); else { const pa = ang[(s - 1 + N) % N], am = pa + ((a0 - pa + 6.283) % 6.283) / 2, rm = r * sag; x.quadraticCurveTo(C + Math.cos(am) * rm, C + Math.sin(am) * rm, px, py); } void a; void a1; } x.stroke();
    x.shadowBlur = 16; x.fillStyle = '#ffffff'; for (let s = 0; s <= steps; s += 2) { const k = s / steps, r = R * (0.12 + 0.86 * k), a0 = ang[s % N]; x.beginPath(); x.arc(C + Math.cos(a0) * r, C + Math.sin(a0) * r, 7, 0, 6.283); x.fill(); }
    x.beginPath(); x.arc(C, C, 14, 0, 6.283); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  // s585 THE NET IN THE WIND (Ben): the flying web is a subdivided sheet whose vertices billow: travelling ripples back along the flight line, a cupped belly (the middle trails behind), flapping corners, and it squashes along its path while it is still opening
  const netGeo = new THREE.PlaneGeometry(2, 2, 24, 24).rotateX(-Math.PI / 2);
  const netMat = () => new THREE.ShaderMaterial({ uniforms: { map: { value: webTex }, uT: { value: 0 }, uA: { value: 0 }, uOpen: { value: 0 }, uSpin: { value: 0 } }, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    vertexShader: 'uniform float uT; uniform float uOpen; uniform float uSpin; varying vec2 vUv; varying float vSh; void main(){ vUv = uv; vec3 p = position; float r = length(p.xz); float a = atan(p.z, p.x);' +
      ' float wave = sin(p.z * 3.2 - uT * 11.0) * 0.16 + sin(p.x * 2.6 + uT * 8.0) * 0.1 + sin(a * 3.0 + uT * 6.0 + uSpin) * 0.12 * r;' +
      ' float belly = (1.0 - r * r) * 0.55 * uOpen; float flap = pow(max(0.0, r - 0.55), 2.0) * sin(a * 5.0 - uT * 9.0) * 0.9;' +
      ' p.y += wave * r + flap; p.z += belly + sin(a * 4.0 + uT * 7.0) * 0.08 * r; p.x *= mix(0.55, 1.0, uOpen) * (1.0 + 0.06 * sin(uT * 5.0)); p.z *= mix(1.25, 1.0, uOpen);' +
      ' vSh = 0.75 + 0.25 * sin(p.z * 3.2 - uT * 11.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'uniform sampler2D map; uniform float uA; varying vec2 vUv; varying float vSh; void main(){ vec4 c = texture2D(map, vUv); gl_FragColor = vec4(c.rgb * vSh, c.a * uA); }' });
  const webPlaneGeo = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
  const webSheet = (op) => { const me = new THREE.Mesh(webPlaneGeo, new THREE.MeshBasicMaterial({ map: webTex, transparent: true, opacity: op, depthWrite: false, depthTest: false, side: THREE.DoubleSide, toneMapped: false })); me.renderOrder = 12; return me; };
  // s584 THE COCOON (Ben: "the web gun needs help"): a caught ship is WRAPPED: a spinning wire cocoon round it + a web sheet over it + 6 tether threads out to the sides; it shudders as it struggles, and the threads SNAP (a white spark burst) when it breaks free
  const cocoonGeo = new THREE.IcosahedronGeometry(1, 1), tetherGeo = new THREE.PlaneGeometry(0.18, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
  function cocoon(e) { const g = new THREE.Group(), R = Math.max(2.2, e.C ? e.C.size * 0.5 : 2.6), cm = new THREE.MeshBasicMaterial({ color: 0xcfe9ff, wireframe: true, transparent: true, opacity: 0.85, depthWrite: false, depthTest: false, toneMapped: false });
    const c1 = new THREE.Mesh(cocoonGeo, cm); c1.scale.set(R, R * 0.55, R); c1.renderOrder = 12; g.add(c1); const sh = webSheet(0.95); sh.scale.setScalar(R * 1.15); sh.position.y = R * 0.3; g.add(sh);
    const tm = new THREE.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.8, depthWrite: false, depthTest: false, side: THREE.DoubleSide, toneMapped: false }), teth = [];
    for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(tetherGeo, tm); t.rotation.y = i / 6 * 6.283 + 0.3; t.scale.z = R * (1.6 + Math.random() * 0.8); t.renderOrder = 11; g.add(t); teth.push(t); }
    scene.add(g); g.userData = { c1, sh, cm, tm, R, teth }; return g; }
  const freeCocoon = (w) => { const g = w.sheet, U = g.userData; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; burst(w.e.x + Math.cos(a) * U.R, w.e.z + Math.sin(a) * U.R, '#e8f6ff', 1, 1); } scene.remove(g); U.cm.dispose(); U.tm.dispose(); U.sh.material.dispose(); };
  // s580 THE LANCE (Ben: "more like it has FIRE in it, not dots"): a 400 u flame beam: scrolling fire noise rushing away from the nose, a white-hot core, yellow → orange → red edges that lick and flicker, embers thrown off along it
  const lanceGeo = new THREE.PlaneGeometry(3.2, 400, 1, 1).rotateX(-Math.PI / 2);
  const lanceMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uA: { value: 1 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float uT; uniform float uA; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); } float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); } float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * n(p); p *= 2.03; a *= 0.5; } return v; }' +
      ' void main(){ float along = (1.0 - vUv.y) * 400.0; vec2 q = vec2(vUv.x * 4.0, along * 0.12 - uT * 9.0); float f = fbm(q) * 0.65 + fbm(q * 2.3 + vec2(0.0, -uT * 6.0)) * 0.35; float x = abs(vUv.x - 0.5) * 2.0; float w = (0.55 + f * 0.55) * (0.35 + 0.65 * smoothstep(0.0, 14.0, along)); float body = smoothstep(w, w * 0.25, x); float core = smoothstep(0.28, 0.0, x) * (0.75 + 0.25 * sin(along * 0.3 - uT * 30.0)); float tail = smoothstep(400.0, 300.0, along) * smoothstep(0.0, 6.0, along);' +
      ' vec3 c = mix(vec3(0.75, 0.05, 0.02), vec3(1.0, 0.45, 0.05), smoothstep(0.15, 0.6, body * f + core * 0.5)); c = mix(c, vec3(1.0, 0.86, 0.35), smoothstep(0.45, 0.95, body * f + core)); c = mix(c, vec3(1.0, 0.98, 0.9), core * 0.8); float a = (body * (0.35 + f) + core) * tail * uA; gl_FragColor = vec4(c * a, a); }' });
  // s583 MINES (Ben: "a smaller circle with energy spikes all round it, pulsing"): makeMine(col) = a hot core + 12 energy spikes on a sphere + a breathing glow; BLUE = the player's, RED = a mine that can hurt the player
  const spikeGeo = new THREE.ConeGeometry(0.11, 0.9, 5).translate(0, 0.75, 0), mineCoreGeo = new THREE.IcosahedronGeometry(0.42, 1);
  function makeMine(hostile) { const col = hostile ? 0xff3a3a : 0x3aa0ff, hot = hostile ? 0xffb0a0 : 0xd8f2ff, g = new THREE.Group(), core = new THREE.Mesh(mineCoreGeo, new THREE.MeshBasicMaterial({ color: hot, toneMapped: false })); g.add(core);
    const sm = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), spikes = [];
    for (let i = 0; i < 12; i++) { const y = 1 - (i + 0.5) / 12 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996, sp = new THREE.Mesh(spikeGeo, sm); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); g.add(sp); spikes.push(sp); }
    const glw = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); glw.scale.set(3.4, 3.4, 1); g.add(glw);
    g.userData.tick = (t, dt) => { const p = 0.5 + 0.5 * Math.sin(t * 6); glw.scale.setScalar(2.6 + p * 1.8); glw.material.opacity = 0.55 + p * 0.45; core.scale.setScalar(0.85 + p * 0.25); spikes.forEach((s, i) => s.scale.set(1, 0.55 + 0.6 * (0.5 + 0.5 * Math.sin(t * 9 + i * 1.7)), 1)); g.rotation.y += dt * 1.4; g.rotation.x += dt * 0.6; };
    g.userData.dispose = () => { core.material.dispose(); sm.dispose(); glw.material.dispose(); }; return g; }
  window.__spaceMakeMine = makeMine;
  // s583 LANCE touch-up: a wide soft HEAT HALO under the flame + a white-hot MUZZLE BULB at the nose (children of the beam, so they move with it)
  const lanceHaloTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 4; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(0.5, 'rgba(255,120,40,0.55)'); g.addColorStop(1, 'rgba(255,90,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 4); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const lanceHaloGeo = new THREE.PlaneGeometry(11, 400).rotateX(-Math.PI / 2), lanceHaloMat = new THREE.MeshBasicMaterial({ map: lanceHaloTex, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const lanceBulbMat = new THREE.SpriteMaterial({ map: dotTex, color: 0xffd080, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const railRingGeo = new THREE.TorusGeometry(1, 0.08, 4, 28);   // a ring standing across the line of fire
  // s583 ARC = forked LIGHTNING: a jagged white core + a violet-blue glow, re-jittered for its short life
  function zap(x0, z0, x1, z1) { const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = -(z1 - z0) / L, nz = (x1 - x0) / L, N = Math.max(4, Math.round(L / 9)); let px = x0, pz = z0;
    for (let i = 1; i <= N; i++) { const k = i / N, j = i < N ? (Math.random() - 0.5) * Math.min(7, L * 0.12) : 0, qx = x0 + (x1 - x0) * k + nx * j, qz = z0 + (z1 - z0) * k + nz * j; beam(px, pz, qx, qz, 0xffffff, 0.28, 0.35); beam(px, pz, qx, qz, 0x8a7dff, 0.34, 1.6);
      if (Math.random() < 0.3 && i < N) { const a = Math.random() * 6.28, bl = 3 + Math.random() * 5; beam(qx, qz, qx + Math.cos(a) * bl, qz + Math.sin(a) * bl, 0xc8c0ff, 0.2, 0.3); } px = qx; pz = qz; } glowPop(x1, 0.3, z1, 0xb8a8ff, 4.5); burst(x1, z1, '#c8c0ff', 8, 1); }
  const WEB = { R0: 0.9, GROW: 4, BLOOM: 0.22, SPEED: 44, LIFE: 0.95, HOLD: 4, CATCH: 1.35 };   // ball radius, x3 size, bloom time, short range (~36 u), hold 4 s, catch radius = web radius x1.15
  const fwdV = () => [Math.sin(St.h), -Math.cos(St.h)];
  const shotAt = (x, z, vx, vz, life, dmg, opt = {}) => { const m = opt.obj || new THREE.Mesh(opt.geo || boltGeo, opt.mat || boltMat); if (!opt.obj && !opt.geo && opt.show !== false) { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x2f8fff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.set(3, 3, 1); m.add(gl); } m.position.set(x, opt.obj ? 0.6 : 0.2, z); m.visible = opt.show !== false; if (opt.s) m.scale.setScalar(opt.s); m.rotation.y = Math.atan2(vx, vz); scene.add(m); const s = { m, vx, vz, life, missile: !!opt.missile, tgt: null, dmg, web: !!opt.web }; shots.push(s); return s; };
  const beam = (x0, z0, x1, z1, col, life, w) => { const L = Math.max(0.1, Math.hypot(x1 - x0, z1 - z0)), g = new THREE.PlaneGeometry(w, L).rotateX(-Math.PI / 2), mm = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); mm.position.set((x0 + x1) / 2, 0.3, (z0 + z1) / 2); mm.rotation.y = Math.atan2(x1 - x0, z1 - z0); scene.add(mm); const b = { mm, life, t: life }; beams.push(b); return b; };
  const lineShots = (x0, z0, dx, dz, len, dmg) => { for (let d = 4; d < len; d += 5) shotAt(x0 + dx * d, z0 + dz * d, 0, 0, 0.03, dmg, { show: false }); };
  const enemiesNear = (x, z, r) => { const out = []; for (const p of combat.list) if (Math.hypot(p.x - x, p.z - z) < r) out.push(p); for (const c of beasts.list) if (Math.hypot(c.x - x, c.z - z) < r) out.push(c); return out.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z)); };
  // s586 GUIDANCE (Ben): the MISSILE is HEAT-SEEKING (finds the nearest ship / creature anywhere within 170 u, turns hard, almost always hits); the TWO TORPEDOES are TARGET-GUIDED only toward a target IN THE DIRECTION FIRED (a 40° cone, 110 u) and turn half as hard.
  // ENERGY: the torpedo pair 15 EN, the missile 30 EN (twice). DAMAGE: one missile = the two torpedoes together (45).
  const SEEK = { torpedo: { range: 110, cone: 0.7, turn: 1.6, speed: 40 }, missile: { range: 170, cone: 0, turn: 5.5, speed: 46 } }, SPEC_EN = { PLASMA_TORPEDO: 15, MISSILE: 30 };
  function special(k, paid) { if (!paid && SPEC_EN[k]) { if (St.en < SPEC_EN[k]) { toast('NOT ENOUGH ENERGY · ' + SPEC_EN[k] + ' EN', 1.4); snd('denied', { v: 0.5 }); return; } St.en -= SPEC_EN[k]; } if (SPEC_SND[k]) snd(SPEC_SND[k]); else snd('power', { v: 0.6 }); const [fx, fz] = fwdV(), x = St.x + fx * SS, z = St.z + fz * SS, P2 = MOD.special;
    if (k === 'PLASMA_TORPEDO') { fire(true); return; }
    if (k === 'MISSILE') { const s = shotAt(x, z, fx * 30 + St.vx, fz * 30 + St.vz, 4.5, 45 * P2, { obj: MSL.clone(), missile: true, rocket: true }); s.seek = SEEK.missile; s.dir = [fx, fz]; return; }   /* s576 the MISSILE = the finned rocket */
    if (k === 'RAIL') { beam(x, z, x + fx * 360, z + fz * 360, 0xffffff, 0.22, 0.28); beam(x, z, x + fx * 360, z + fz * 360, 0x3aa0ff, 0.5, 2.2); lineShots(x, z, fx, fz, 360, 26 * P2); glowPop(x, 0.3, z, 0x9fe0ff, 6);   /* s583 RAIL: needle + sleeve + shock rings */
      for (let d = 10, n = 0; d < 360; d += 30, n++) { const rg = new THREE.Mesh(railRingGeo, new THREE.MeshBasicMaterial({ color: 0x8fd4ff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })); rg.position.set(x + fx * d, 0.3, z + fz * d); rg.rotation.y = Math.atan2(fx, fz); rg.scale.setScalar(0.01); scene.add(rg); beams.push({ mm: rg, life: 0.5, t: 0.5 + n * 0.025, ring: 3.2, shared: 1 }); } return; }
    if (k === 'RED_CANNON') { const mm = new THREE.Mesh(lanceGeo, lanceMat.clone()); { const hl = new THREE.Mesh(lanceHaloGeo, lanceHaloMat); hl.position.y = -0.05; mm.add(hl); const bb = new THREE.Sprite(lanceBulbMat); bb.scale.set(7, 7, 1); bb.position.set(0, 0.2, -198); mm.add(bb); mm.userData.bulb = bb; } mm.position.set(x + fx * 200, 0.3, z + fz * 200); mm.rotation.y = Math.atan2(fx, fz); scene.add(mm); beams.push({ mm, life: 1.4, t: 1.4, lance: 1, fire: 1 }); glowPop(x, 0.3, z, 0xff7a2a, 5); return; }   /* s580 THE LANCE = a river of FIRE */
    if (k === 'FLAK') { for (let i = 0; i < 9; i++) { const a = St.h + (i - 4) * 0.07 + (Math.random() - 0.5) * 0.05, sp = 80 + Math.random() * 20; shotAt(x, z, Math.sin(a) * sp + St.vx, -Math.cos(a) * sp + St.vz, 0.45, 5 * P2, { s: 0.6 }); } return; }
    if (k === 'MINES') { for (let i = 0; i < 3; i++) { const d = SS + 3 + i * 4, g = makeMine(false); const s = shotAt(St.x - fx * d, St.z - fz * d, 0, 0, 12, 30 * P2, { obj: g }); g.position.y = 0.5; s.mineFx = (dt2, q) => { q.mt = (q.mt || Math.random() * 6) + dt2; g.userData.tick(q.mt * (q.life < 2 ? 2.2 : 1), dt2); }; s.mineObj = g; } return; }   /* s583 the spiked, pulsing mine (blue = yours) */
    if (k === 'WEB') { const g = new THREE.Group(), ball = new THREE.Mesh(new THREE.IcosahedronGeometry(WEB.R0, 1), webMat), sh = new THREE.Mesh(netGeo, netMat()); sh.renderOrder = 12; sh.material.uniforms.uSpin.value = Math.random() * 6.28; g.add(ball, sh); const s = shotAt(x, z, fx * WEB.SPEED + St.vx, fz * WEB.SPEED + St.vz, WEB.LIFE, 1, { obj: g, web: true }); g.position.y = 0.3; s.ball = ball; s.sheet = sh; s.age = 0; s.caught = new Set(); return; }
    if (k === 'ARC') { let px = x, pz = z, dmg = 16 * P2; const hit = new Set(); for (let j = 0; j < 4; j++) { const e = enemiesNear(px, pz, j ? 90 : 160).find(q => !hit.has(q)); if (!e) break; hit.add(e); zap(px, pz, e.x, e.z); shotAt(e.x, e.z, 0, 0, 0.03, dmg, { show: false }); px = e.x; pz = e.z; dmg *= 0.7; } if (!hit.size) toast('ARC · nothing in reach (160 u)', 1.4); return; }
    if (k === 'EMP') { for (const [w0, col, life, delay] of [[0.86, 0x7df9ff, 0.7, 0], [0.94, 0x3aa0ff, 0.85, 0.12], [0.0, 0x1f6fd6, 0.6, 0]]) { const ring = new THREE.Mesh(new THREE.RingGeometry(w0, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: w0 ? 0.95 : 0.35, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); ring.position.set(St.x, 0.3, St.z); scene.add(ring); beams.push({ mm: ring, life, t: life + delay, ring: 70 }); }
      glowPop(St.x, 0.4, St.z, 0xbff4ff, 16); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; burst(St.x + Math.cos(a) * 6, St.z + Math.sin(a) * 6, '#7df9ff', 1, 1.6); }   /* s583 EMP: flash + 2 staggered rings + a blue disc */ for (const e of enemiesNear(St.x, St.z, 70)) { shotAt(e.x, e.z, 0, 0, 0.03, 4, { show: false }); webbed.push({ e, until: St.t + 1.6, x: e.x, z: e.z }); } } }
  // s594 TRACTOR BEAM on a ship: held = stunned + pulled to a spot 14 u ahead of your nose; a crackling cyan beam; breaks past 70 u or when it dies
  const tbMat = new THREE.MeshBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }), tbBeam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5), tbMat); tbBeam.visible = false; tbBeam.renderOrder = 8; scene.add(tbBeam);
  // s597f BELT ROCKS ON THE TRACTOR (Ben: "nothing in range right next to asteroids" = the mine-belt rocks were not towable): HOLD 2 grabs the belt rock off your nose, up to 3 ride behind you, within 32 u of a MINE = refined, DOUBLE coins.
  const beltTow = [], btBeams = [0, 1, 2].map(() => { const b = new THREE.Mesh(tbBeam.geometry, tbMat); b.visible = false; b.renderOrder = 8; scene.add(b); return b; });
  function beltGrab(Rr) { if (beltTow.length >= 1) return null; const fx = Math.sin(St.h), fz = -Math.cos(St.h); let best = null, bs = 1e9;
    for (const r of rocks) { if (!r.alive || r.tw || r.y < -5) continue; const dx = r.x - St.x, dz = r.z - St.z, d = Math.hypot(dx, dz); if (d > Rr + r.s || d < 0.5) continue; const off = Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d))), sc = off > 0.75 + Math.atan2(r.s, Math.max(4, d)) ? d * 3 : d; if (sc < bs) { bs = sc; best = r; } }
    if (!best) return null; best.tw = true; if (best.orR) { best.orR0 = best.orR; best.orR = 0; } beltTow.push(best); snd('towLatch', { v: 0.7 }); toast((best.s > 2.2 ? 'BIG' : 'MEDIUM') + ' ROCK UNDER TOW. Fly OVER the MINE: +2. Press 2 to let go.', 3); return best; }
  function beltRelease() { if (!beltTow.length) return false; for (const r of beltTow) r.tw = false; beltTow.length = 0; toast('Rocks released.', 2); snd('boostEnd', { v: 0.35 }); return true; }
  // s597g DELIVERY PULSE + CHIME (Ben): two gold rings swell out of the mine + a soft rising major chord (synth, no file)
  const mpMat = () => new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }), mPulses = [];
  let acx = null; function chime() { if (window.__8gMuted) return; try { acx = acx || new (window.AudioContext || window.webkitAudioContext)(); if (acx.state === 'suspended') acx.resume(); const t0 = acx.currentTime, out = acx.createGain(); out.gain.value = 0.22; out.connect(acx.destination);
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => { for (const [mul, typ, v] of [[1, 'sine', 1], [2, 'triangle', 0.18]]) { const o = acx.createOscillator(), g = acx.createGain(), t = t0 + i * 0.09; o.type = typ; o.frequency.value = f * mul; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 * v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 1.4); o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.5); } }); } catch (e) {} }
  function mineDeliver(x, z) { chime(); glowPop(x, 0.4, z, 0xffd23a, 12); for (const [d, w] of [[0, 0.9], [0.22, 0.94]]) { const mm = new THREE.Mesh(new THREE.RingGeometry(w, 1, 48).rotateX(-Math.PI / 2), mpMat()); mm.position.set(x, 0.4, z); mm.visible = false; mm.renderOrder = 8; scene.add(mm); mPulses.push({ mm, t: -d }); } }
  window.__8gMineDeliver = mineDeliver;
  function mPulseTick(dt) { for (let i = mPulses.length - 1; i >= 0; i--) { const p = mPulses[i]; p.t += dt; if (p.t < 0) continue; const k = p.t / 1.1; p.mm.visible = true; p.mm.scale.setScalar(4 + k * 40); p.mm.material.opacity = 0.9 * (1 - k) * (1 - k); if (k >= 1) { scene.remove(p.mm); p.mm.geometry.dispose(); p.mm.material.dispose(); mPulses.splice(i, 1); } } }
  const beltVal = r => 1;   /* s597j: ANY rock towed over a mine = 2 (beltVal x2) */
  function beltTowTick(dt) { btBeams.forEach((b, i) => { const r = beltTow[i]; b.visible = !!r; if (!r) return; const ex = r.x - St.x, ez = r.z - St.z; b.position.set(St.x, 0.3, St.z); b.rotation.y = Math.atan2(-ex, -ez); b.scale.set(0.8 + Math.sin(St.t * 30 + i) * 0.25, 1, Math.hypot(ex, ez)); });
    if (!beltTow.length) return; if (St.phase !== 'free') { beltRelease(); return; }
    beltTow.forEach((r, idx) => { const bk = SS + 8 + idx * 5.5, bx = St.x - Math.sin(St.h) * bk + Math.cos(St.h) * (idx - 1) * 2.2, bz = St.z + Math.cos(St.h) * bk + Math.sin(St.h) * (idx - 1) * 2.2, kk = 1 - Math.exp(-dt * 3); r.x += (bx - r.x) * kk; r.z += (bz - r.z) * kk; });
    const M = MINES.find(e => Math.hypot(e.x - St.x, e.z - St.z) < 10); if (!M) return; mineDeliver(M.x, M.z); let g = 0;   /* s597g: fly OVER the mine */ for (const r of beltTow) { g += beltVal(r) * 2; r.tw = false; r.alive = 0; r.back = 25; burst(r.x, r.z, '#f59e0b', 10, 1.2); if (r.orR0) { r.orR = r.orR0; } }
    const n2 = beltTow.length; beltTow.length = 0; if (save) save.addGold(g); toast('DELIVERED TO THE MINE · +' + g + ' GOLD', 3); emit(true); }
  function tractorTick(dt) { const T = St.tractor; if (!T) { tbBeam.visible = false; return; } const gone = T.dead || St.phase !== 'free' || !St.tractorHeld, ex = T.x - St.x, ez = T.z - St.z, el = Math.hypot(ex, ez);
    if (gone || el > 70) { bubbleStun(T); St.tractor = null; tbBeam.visible = false; if (!gone) toast('Tractor broke: too far.', 1.6); return; }
    const fx = Math.sin(St.h), fz = -Math.cos(St.h); const spd = Math.hypot(St.vx, St.vz); St.tbBk = (St.tbBk || 0) + ((spd > 5 ? 1 : 0) - (St.tbBk || 0)) * Math.min(1, dt * 2.5);   /* s597h (Ben): moving = it is TOWED behind you like the rocks; it swings round your side */
    const sa = Math.PI * St.tbBk * (St.tbSide || 1), cs = Math.cos(sa), sn = Math.sin(sa), dx2 = fx * cs - fz * sn, dz2 = fx * sn + fz * cs, rr = SS + 14 - St.tbBk * 2 + (T.C ? T.C.size * 0.3 * St.tbBk : 0), hx = St.x + dx2 * rr, hz = St.z + dz2 * rr; if (T._tb) { const k = Math.min(1, dt * 4); T.x += (hx - T.x) * k; T.z += (hz - T.z) * k; if ('vx' in T) T.vx = T.vz = 0; } else combat.tractorHold(T, hx, hz); St.en = Math.max(0, St.en - dt * 2);
    tbBeam.visible = true; tbBeam.position.set(St.x, 0.35, St.z); tbBeam.rotation.y = Math.atan2(-ex, -ez); tbBeam.scale.set(1.2 + Math.sin(St.t * 30) * 0.35, 1, el); tbMat.opacity = 0.45 + Math.random() * 0.3; }
  // s597h ENERGY BUBBLE (Ben): let go of a tractored ship / creature = it sits STUNNED inside a cyan energy bubble for HALF as long as you held it (rides the WEB hold list)
  const bubGeo = new THREE.SphereGeometry(1, 20, 14), bubWire = new THREE.IcosahedronGeometry(1.04, 1);
  function bubbleStun(T) { if (!T || T.dead) return; const held = St.t - (St.tbT0 || St.t); St.tbT0 = 0; if (held < 0.15 || webbed.some(w => w.e === T)) return; const Rb = Math.max(2.4, T.C ? T.C.size * 0.6 : (T.D && T.D.size) || 3.2);
    const g = new THREE.Group(), m1 = new THREE.MeshBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), m2 = new THREE.MeshBasicMaterial({ color: 0xbff4ff, wireframe: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const a = new THREE.Mesh(bubGeo, m1), b = new THREE.Mesh(bubWire, m2); a.renderOrder = b.renderOrder = 12; g.add(a, b); g.scale.setScalar(Rb); scene.add(g);
    webbed.push({ e: T, until: St.t + held / 2, x: T.x, z: T.z, bubble: g, bm: [m1, m2], R: Rb, t0: St.t }); snd('shieldUp', { v: 0.5 }); glowPop(T.x, 0.5, T.z, 0x7fd0ff, Rb * 2); }
  function specialsTick(dt) { tractorTick(dt); beltTowTick(dt); mPulseTick(dt); for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.t -= dt; if (b.ring) { b.mm.visible = b.t <= b.life; b.mm.scale.setScalar(1 + Math.max(0, 1 - b.t / b.life) * b.ring); }   /* s583: staggered rings wait hidden */
      if (b.lance && b.t > 0) { const [fx, fz] = fwdV(), x = St.x + fx * SS, z = St.z + fz * SS; b.mm.position.set(x + fx * 200, 0.3, z + fz * 200); b.mm.rotation.y = Math.atan2(fx, fz);
        if (b.fire) { const U = b.mm.material.uniforms, life = 1 - b.t / b.life; U.uT.value += dt; U.uA.value = Math.min(1, life * 8) * Math.min(1, b.t * 4); b.mm.scale.x = 0.85 + Math.sin(St.t * 40) * 0.08 + Math.random() * 0.1; lanceHaloMat.opacity = 0.55 * U.uA.value + Math.random() * 0.1; if (b.mm.userData.bulb) b.mm.userData.bulb.scale.setScalar((6 + Math.random() * 2.5) * U.uA.value);
          if (Math.random() < 0.7) { const d = 6 + Math.random() * 120; burst(x + fx * d + (Math.random() - 0.5) * 2, z + fz * d + (Math.random() - 0.5) * 2, Math.random() < 0.5 ? '#ffb03a' : '#ff5a1f', 1, 0.6); } if (Math.random() < 0.5) burst(x + fx * 2, z + fz * 2, '#ffe08a', 1, 0.5); } b.tk = (b.tk || 0) - dt; if (b.tk <= 0) { b.tk = 0.1; lineShots(x, z, fx, fz, 400, 3 * MOD.special); } }
      b.mm.material.opacity = 0.9 * Math.min(1, Math.max(0, b.t / b.life)); if (b.t <= 0) { scene.remove(b.mm); if (!b.fire && !b.shared) b.mm.geometry.dispose(); b.mm.material.dispose(); beams.splice(i, 1); } }
    for (let i = webbed.length - 1; i >= 0; i--) { const w = webbed[i]; if (w.sheet) { const U = w.sheet.userData, left = w.until - St.t, k = Math.min(1, (St.t - w.t0) / 0.18), fade = Math.min(1, left * 1.2), sh = left < 1.2 ? 0.25 : 0.08;   /* wraps in fast, struggles harder in its last second */
          w.sheet.position.set(w.e.x + (Math.random() - 0.5) * sh, 0.6, w.e.z + (Math.random() - 0.5) * sh); w.sheet.scale.setScalar(0.4 + 0.6 * (1 - Math.pow(1 - k, 3))); U.c1.rotation.y += 0.02; U.c1.rotation.x = Math.sin(St.t * 3) * 0.15; U.sh.rotation.y -= 0.006;
          U.cm.opacity = 0.85 * fade; U.sh.material.opacity = 0.95 * fade; U.tm.opacity = 0.8 * fade; U.teth.forEach((t, j) => { t.scale.x = 1 + 0.3 * Math.sin(St.t * 7 + j); }); }
        if (w.bubble) { const left = w.until - St.t, k = Math.min(1, (St.t - w.t0) / 0.2), fade = Math.min(1, left * 2), wob = 1 + Math.sin(St.t * 9) * 0.04; w.bubble.position.set(w.e.x, 0.5, w.e.z); w.bubble.scale.setScalar(w.R * (0.3 + 0.7 * k) * wob); w.bubble.children[1].rotation.y += 0.03; w.bm[0].opacity = (0.16 + 0.08 * Math.sin(St.t * 14)) * fade; w.bm[1].opacity = 0.55 * fade * (left < 1 ? 0.5 + 0.5 * Math.sin(St.t * 30) : 1); }
        if (St.t > w.until || w.e.dead) { if (w.sheet) freeCocoon(w); if (w.bubble) { scene.remove(w.bubble); w.bm.forEach(x => x.dispose()); } webbed.splice(i, 1); continue; } w.e.x = w.x; w.e.z = w.z; if (w.e.vx != null) { w.e.vx = 0; w.e.vz = 0; } if (w.sheet || w.bubble) { if (w.e.cool != null) w.e.cool = Math.max(w.e.cool, 0.3); w.e.shotsLeft = 0; w.e.fireT = Math.max(w.e.fireT || 0, 0.3); w.e.jamT = Math.max(w.e.jamT || 0, 0.2); } } }   /* s584: a wrapped ship cannot fire */
  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, dead = false;
  const camPos = new THREE.Vector3(St.x, 80, St.z + 50), camLook = new THREE.Vector3(St.x, 0, St.z);
  function step() {
    raf = requestAnimationFrame(step); const rdt = Math.min(0.05, clock.getDelta()); if (St.paused) { renderer.render(scene, camera); return; } if (St.slowmoT > 0) St.slowmoT -= rdt; const dt = rdt * (TU.on && TU.near ? 0.35 : 1) * (SCOPE ? SCOPE.timeK() : 1) * (St.slowmoT > 0 ? 0.3 : 1);   /* s598y FEEL: slow-mo on a big kill */   /* s574 the SCOPE freezes time, then runs its volley in slow motion */   // s565 SLOW TIME only while you sit in the turret near enemies
    St.t += dt; const t = St.t;
    // input vector (screen up = north = -z)
    let ix = input.jx, iz = -input.jy;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1; if (keys.has('KeyW') || keys.has('ArrowUp')) iz -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iz += 1;
    if (St.phase === 'cabin') { CAB.tick(rdt, ix, iz); St.vx *= Math.exp(-dt * 3); St.vz *= Math.exp(-dt * 3); }
    if (camYaw) { const cy = Math.cos(camYaw), sy = Math.sin(camYaw), wx = ix * cy - iz * sy, wz = ix * sy + iz * cy; ix = wx; iz = wz; }
    if (TU.on) { const rx = input.jx + ((keys.has('KeyD') || keys.has('ArrowRight')) ? 1 : 0) - ((keys.has('KeyA') || keys.has('ArrowLeft')) ? 1 : 0); TU.tick(rdt, rx, iz); [ix, iz] = TU.steer(); }   /* s568e raw stick x (not camera-turned) swings the turret */   // s565 in the turret: your stick aims, the AUTOPILOT flies
    if (St.auto && DMG && DMG.navOff()) { St.auto = false; toast('NAVIGATION DAMAGED · autopilot off.', 2.4); }
    if (St.auto && St.course && St.phase === 'free' && !St.menu) { if (Math.hypot(ix, iz) > 0.2) { St.auto = false; toast('Autopilot off. You have the stick.', 2); } else { const dx = St.course.x - St.x, dz = St.course.z - St.z, dd = Math.hypot(dx, dz); if (dd < 45) { St.auto = false; St.course = null; toast('Arrived. Autopilot off.', 2.4); } else { ix = dx / dd; iz = dz / dd; } } }   /* s599 BRIDGE AUTOPILOT */
    let mag = Math.min(1, Math.hypot(ix, iz)); if (St.phase !== 'free' || St.menu) mag = 0;
    if (St.menu) { St.vx *= Math.exp(-dt * 4); St.vz *= Math.exp(-dt * 4); St.x = lerp(St.x, St.menu.d.x, dt * 2); St.z = lerp(St.z, St.menu.d.z, dt * 2); }
    let turn = 0;
    St.boost = St.phase === 'free' && (St.boostKey || St.boostBtn) && St.en > 1 && mag > 0.1 && St.fuel > 0 && !(DMG && !DMG.canBoost());
    if (St.phase === 'free') {
      if (mag > 0.12) { const th = Math.atan2(ix, -iz), df = angDiff(St.h, th); turn = clamp(df * 2.4, -2.1, 2.1) * (podOn() ? 0.85 : 1);   /* s599 (Ben): less twitchy left / right */ St.h += turn * dt; const align = clamp(Math.cos(df), 0.15, 1);
        const dry = St.fuel <= 0, a = (St.boost ? ACCB : ACC) * mag * align * (dry ? 0.3 : 1) * (DMG ? DMG.speedK() : 1);
        St.fuel = Math.max(0, St.fuel - FUEL_BURN * mag * (St.boost ? 2.5 : 1) * deep.burnK() * dt); if (St.fuel < 25 && St.fuel > 0 && !St.lowWarn) { St.lowWarn = true; St.lowBanT = 6; snd('lowHp', { v: 0.7 }); } if (St.fuel <= 0 && !St.dryWarn) { St.dryWarn = true; tugAsk(); }   /* s600 SPACE FUEL: banner at a quarter, tug card when dry */ St.vx += Math.sin(St.h) * a * dt; St.vz += -Math.cos(St.h) * a * dt; }
      const drag = mag > 0.12 ? (St.boost ? ACCB / VB : ACC / V) : 1.05; const f = Math.exp(-drag * dt); St.vx *= f; St.vz *= f;
      St.zone = zoneAt(St.x, St.z);
      if (St.fuel >= 25) St.lowWarn = false; if (St.fuel >= 10) { St.dryWarn = false; St.dryAgain = null; } if (St.fuel <= 0 && St.dryAgain && St.t > St.dryAgain && !St.menu) tugAsk();
      if (St.t > (St.privT ?? 150) && !St.menu) { St.privT = St.t + 420; const near = docks.filter(q => q.open !== undefined && !q.station && OFFICERS[portKey(q)]).sort((a, b) => Math.hypot(a.x - St.x, a.z - St.z) - Math.hypot(b.x - St.x, b.z - St.z)).slice(0, 3);   /* s601c COMMS CALLS */
        for (const q of near.sort(() => Math.random() - 0.5)) { const o = privBoard(portKey(q))[0]; if (o) { toast('COMMS · ' + (WORLD_NAME[o.port] || o.port) + ' · ' + offerLine(o) + '. Board in the TRADE OFFICE.', 6); snd('buoy'); break; } } }
      if (St.t > (St.dealT || 0)) { St.dealT = St.t + 5; const nw = settleDeals(save, { atWar: k => fleets.atWar(k), jam: !save.stat('spaceYardGuardFree', 0) }); if (nw.length) toast('TRADE · ' + nw.slice(0, 2).join(' · '), 5); }   /* s601 deal runs */
      if (St.t > (St.debtT || 0)) { St.debtT = St.t + 0.5; const debt = save.stat('tugDebt', 0), gold = save.data ? save.data.gold : 0; if (debt > 0 && gold > 0) { const p = Math.min(debt, gold); save.spend(p); save.setStat('tugDebt', debt - p); toast(debt - p ? 'TUG DEBT · paid ' + p + ' G, ' + (debt - p) + ' G left.' : 'TUG DEBT PAID OFF · ' + p + ' G.', 3); } }   /* s600: the tug is paid from your next gold */
      // s380 (Ben): slow ONLY while the camera is swooped in on something; any other time = normal speed
      const nearPadS = PADS.some(p => Math.abs(p.x - St.x) < 14 && Math.abs(p.z - St.z) < 14);   // s444 (Ben): no long slow-down over a whole install, only right at its landing pad (+ docks)
    const swoopSlow = camMode === 'swoop' && St.zone && St.zone.kind !== 'planet' && (St.zone.kind === 'dock' || nearPadS) ? clamp((swoopK - 0.35) / 0.55, 0, 1) : 0; St.slowF = lerp(St.slowF, lerp(1, SLOW, swoopSlow), 1 - Math.exp(-dt * 3));
      const cap = (St.boost ? VB : V) * St.slowF * deep.towK() * (St.spdT > St.t ? 1.5 : 1),   /* s598v SPEED UP powerup */ sp = Math.hypot(St.vx, St.vz); if (sp > cap) { const k = lerp(1, cap / sp, 1 - Math.exp(-dt * 4)); St.vx *= k; St.vz *= k; }
      St.x += St.vx * dt; St.z += St.vz * dt;
      const rr = Math.hypot(St.x, St.z); if (rr > 2600) { St.x *= 2600 / rr; St.z *= 2600 / rr; St.vx *= 0.5; St.vz *= 0.5; }
      St.unhackT = Math.hypot(St.vx, St.vz) < V * 0.6 ? combat.unhackTarget() : null;
      St.yardZ = St.zone && St.zone.ik === 'yard' && Math.hypot(St.vx, St.vz) < V * 0.45 ? St.zone : null;
      St.depot = St.zone && St.zone.ik === 'fuel' && Math.hypot(St.vx, St.vz) < V * 0.45 && St.fuel < 99.5 && !St.fill ? St.zone : null;
      if (St.fill) { const F = St.fill; F.t += dt; const k = Math.min(1, F.t / 1.4); St.fuel = lerp(F.from, F.to, k); if (Math.random() < 0.5) burst(St.x + (Math.random() - 0.5) * 3, St.z + (Math.random() - 0.5) * 3, '#6ee7b7', 1, 0.5); if (k >= 1) { St.fill = null; St.lowWarn = St.fuel < 25; St.dryWarn = false; toast(F.msg, 3); } }
      St.dockable = St.zone && St.zone.kind === 'dock' && Math.hypot(St.vx, St.vz) < V * 0.45 ? St.zone : null;
      St.en = clamp(St.en + (St.boost ? -16 : 9) * dt, 0, 100);
      // P planets: name your world the first time you are over it
      if (St.zone && St.zone.kind === 'planet' && St.zone.w.player && St.zone.w.key === 'p1' && !St.menu && !names[St.zone.w.key] && !St.nameAsk && !St.asked && St.t - (St.freeAt || 0) > 5 && Math.hypot(St.vx, St.vz) < 3) { St.asked = true; St.nameAsk = { key: St.zone.w.key, player: St.zone.w.player }; }
    }
    // dock + undock animations
    if (St.phase === 'docking') { const A = St.anim; A.t += dt; const k = ease(clamp(A.t / 1.6, 0, 1)); St.x = lerp(A.x0, A.d.x, k); St.z = lerp(A.z0, A.d.z, k); St.h = A.h0 + angDiff(A.h0, 0) * k;
      St.y = lerp(0, A.d.Y + 0.4, ease(clamp((A.t - 0.9) / 1.2, 0, 1))); St.fade = clamp((A.t - 1.9) / 0.6, 0, 1);
      if (A.t > 2.6 && !A.gone) { A.gone = true; try { localStorage.setItem(LAST_DOCK, A.d.key); if (A.d.key === 'meru' || A.d.key === 'dsf') { localStorage.setItem('pp.visitMeru', String(Date.now())); if (ESC) localStorage.setItem('pp.shipment', 'delivered'); } } catch (e) {} saveFuel(); onNavigate(A.d.url); } }
    { const docked = (St.phase === 'land' || St.phase === 'walk') && WALK.W.d, want = (docked && WALK.W.d.padWalk ? 0.55 : 1) * (docked && WALK_SB[HULLT] ? WALK.metreK(WALK.W.d) / (WALK.W.d.padWalk ? 0.55 : 1) * WALK_SB[HULLT] / SHIP3.group.scale.x : 1);   /* s570 docked walk-ins grow to WALK SCALE (1 interior metre = the dock fox's metre) */ St.shipS = lerp(St.shipS || 1, want, 1 - Math.exp(-dt * 2.5)); ship.scale.setScalar(St.shipS); }   // s444 the ship sits small on the little pad
    if (St.phase === 'land') { const A = St.anim; A.t += dt; const P0 = WALK.pad(A.d), B = bigPose(P0, A.d), P = B || P0, k = ease(clamp(A.t / 2.4, 0, 1)); St.x = lerp(A.x0, P.x, k); St.z = lerp(A.z0, P.z, k); St.h = A.h0 + angDiff(A.h0, B ? B.h : -Math.PI / 2) * k;
      St.y = lerp(A.y0, P.y, ease(clamp((A.t - 0.6) / 1.8, 0, 1))); St.vx = St.vz = 0; WALK.update(dt, 0, 0);
      if (A.t > 2.9 && WALK.W.on && WALK.W.phase === 'land') { try { WALK.stepOut(B ? bigInfo(B, true) : undefined); St.phase = 'walk'; } catch (e) { console.warn(e); } } }
    if (St.phase === 'walk') { St.vx = St.vz = 0; WALK.update(dt, ix, iz, () => { try { localStorage.setItem(LAST_DOCK, WALK.W.d.key); if (WALK.W.d.key === 'meru' || WALK.W.d.key === 'dsf') localStorage.setItem('pp.visitMeru', String(Date.now())); } catch (e) {} saveFuel(); onNavigate(WALK.W.d.url); }, () => { St.phase = 'undock'; St.anim = { t: 0 }; WALK.end(); WALK.undockShip(); toast('Undocked.', 2); },
      () => { try { localStorage.setItem(LAST_DOCK, WALK.W.d.key); localStorage.setItem('pp.visitMeru', String(Date.now())); sessionStorage.setItem('dock.from', 'space'); } catch (e) {} saveFuel(); onNavigate('Meru Spacedock.dc.html'); }); }   // s417: the first capsule = into the MERU SPACEDOCK interior
    if (St.phase === 'launch') { const A = St.anim; A.t += dt; const k = clamp(A.t / 4.2, 0, 1); St.y = lerp(-7.5, 0, ease(k)); St.z = A.w.z - 18 * ease(k); St.x = A.w.x; St.h = 0; St.vz = -4 * (1 - k); St.fade = Math.max(0, 1 - A.t / 0.9);
      if (A.t > 4.6) { St.y = 0; St.phase = 'free'; St.freeAt = St.t; let ms = null; try { ms = new URLSearchParams(location.search).get('mission'); } catch (e) {}
        if (ms === 'escort' && !ESC) { ESC = escortKit({ THREE, scene, St, WORLDS, INSTALLS, combat, toast, say: (name, text) => { St.say = { name, text }; emit(true); }, snd, jumped: () => { instCheck = 0; St.snapCam = true; } }); toast('Escort the CARGO SHIP to the LUXOR STARGATE. Follow the red line.', 5); }
        else toast('In orbit above ' + (names[A.w.key] || A.w.name) + '. Fly south to MERU, the centre of the Nine Worlds.', 5); } }
    if (ESC) ESC.tick(dt, St.t);
    if (St.phase === 'undock') { const A = St.anim; A.t += dt; St.y = lerp(St.y, 0, 1 - Math.exp(-dt * 2.5)); St.fade = Math.max(0, St.fade - dt * 1.5); if (A.t > 1.5) { St.y = 0; St.phase = 'free'; if (!St.toast) toast('Undocked. Fly over a dock and slow down to dock.', 3.5); } St.vz = -2 * clamp(A.t - 0.8, 0, 1); St.z += St.vz * dt; }
    if (St.phase === 'tow') { const A = St.anim; A.t += dt; St.fade = clamp(A.t / 0.8, 0, 1) * (A.t < 2.2 ? 1 : clamp(1 - (A.t - 2.2) / 0.6, 0, 1));
      if (A.t > 1 && !A.moved) { A.moved = true; St.x = A.d.x; St.z = A.d.z + 0.01; St.y = A.d.Y; St.h = 0; if (A.fuelTow) { St.fuel = 100; St.lowWarn = St.dryWarn = false; St.lowBanT = 0; saveFuel(); } else { St.hull = 60; St.fuel = Math.max(St.fuel, 50); } SH.restore(); combat.clear(); camLook.set(St.x, 0, St.z); camPos.set(St.x, 80, St.z + 40); }
      if (A.t > 2.2) { St.phase = 'undock'; St.anim = { t: 0 }; if (A.fuelTow) { snd('refuel'); toast('TOW TUG · ' + A.d.name + '. Tank full. ' + A.msg, 4.5); } else toast('SHIP DISABLED. A tug towed you to ' + A.d.name + (A.d.station ? '' : ' DOCK') + '. Hull 60.', 4.5); } }
    arenaTick(dt); padsTick(dt); SH.update(dt); combat.update(dt); beasts.update(dt); beltHits(dt); splits.update(dt); deep.update(dt); if (DMG) DMG.update(dt); if (EXP) { try { EXP.update(dt); } catch (e) { console.warn('explore', e); } } nests.update(dt); fleets.update(dt); specialsTick(dt); hullFlash = Math.max(0, hullFlash - dt);
    if (St.lowBanT > 0) St.lowBanT -= dt;
    if (St.toastT > 0) { St.toastT -= dt; if (St.toastT <= 0) St.toast = null; }
    St.cool1 -= dt; St.cool2 -= dt;
    // ship pose
    ship.position.set(St.x, St.y + Math.sin(t * 1.6) * 0.08, St.z); ship.rotation.y = -St.h; bank.rotation.z = lerp(bank.rotation.z, -turn * 0.16, 1 - Math.exp(-dt * 6)); bank.rotation.x = lerp(bank.rotation.x, mag * 0.08, 1 - Math.exp(-dt * 4));
    const thr = St.phase === 'free' ? mag * (St.boost ? 2.2 : 1) * (St.slowF < 0.6 ? 0.5 : 1) : St.phase === 'launch' ? 1.6 : St.phase === 'undock' ? 0.6 : 0.2;
    SHIP3.api.setThrust(thr, St.boost); SHIP3.tick(dt); if (WALK_LEN[HULLT] && SHIP3.api.setRamp) SHIP3.api.setRamp(St.phase === 'walk' || (St.phase === 'land' && St.anim && St.anim.t > 2.4) ? 1 : 0);   /* s569 the ramp drops onto the dock */ if (SHIP3.api.turret && !TU.on) SHIP3.api.turret.aim(0, 0.04);   /* s568 flying: the big barrels face forward */
    if (!ENG.started && St.phase !== 'start' && ((ENG._try = (ENG._try || 0) - dt) <= 0)) { ENG._try = 0.5; engStart(); }   // s429: retry until the recordings have loaded (the first tap often comes before they finish)
    window.__spaceEng = ENG;
    const spdK = Math.min(1, Math.hypot(St.vx, St.vz) / (V * 1.6));   // s431 thrust follows how fast you MOVE
    if (ENG.started) { if (ENG.walk) ENG.walk.set(St.phase === 'walk' && !document.hidden ? 0.22 : 0, 1); const on = !St.paused && St.phase !== 'start' && St.phase !== 'walk' && !document.hidden, k = spdK; if (ENG.cruise) ENG.cruise.set(on ? k * 0.75 : 0, 0.8 + k * 0.4); if (ENG.boost) ENG.boost.set(on && St.boost ? 0.45 : 0, 1); if (ENG.walk) ENG.walk.set(St.phase === 'walk' && !document.hidden ? 0.22 : 0, 1);
      let pd = 1e9, md = 1e9; for (const p of combat.list) { const dd = Math.hypot(p.x - St.x, p.z - St.z); if (p.machine) md = Math.min(md, dd); else pd = Math.min(pd, dd); } if (ENG.pir) ENG.pir.set(on ? Math.max(0, 1 - pd / 70) * 0.35 : 0, 1); if (ENG.mac) ENG.mac.set(on ? Math.max(0, 1 - md / 70) * 0.3 : 0, 1);
      { // s428 ambience: moth wings near a moth, the mining arm near a mine, welding near a shipyard, the throb near a nest (each fades in within 60 u)
        const nearT = (arr, f) => { let b = 1e9; for (const q of arr) if (f(q)) b = Math.min(b, Math.hypot(q.x - St.x, q.z - St.z)); return b; }, fade = (dd, r, v) => { if (!on) return 0; const q = Math.max(0, 1 - dd / (r * 1.4)); return q * q * v; };   /* s447 squared falloff over a wider range: quieter the further you fly */
        if (ENG.moth) { const dm = nearT(beasts.list, q => q.fam === 'vmoth' && !q.dead), km = on ? Math.max(0, 1 - dm / 80) : 0; ENG.moth.set(km * km * 0.3, 1); } if (ENG.mine) ENG.mine.set(0, 1);  if (ENG.weld) { ENG.weld.set(on ? weldOn * 0.6 : 0, 1); weldOn *= 0.8; }
        if (ENG.nest && nests.nests) ENG.nest.set(fade(nearT(nests.nests.map(q => q.N), () => true), 80, 0.4), 1); } if (HUM.g) HUM.g.gain.value = 0; }
    if (HUM.ctx && !ENG.cruise) { const on = !window.__8gMuted && !St.paused && St.phase !== 'start' && St.phase !== 'walk' && !document.hidden, k = spdK, ih = Math.min(1, thr / 2.2), T = HUM.ctx.currentTime;
      HUM.rush.g.gain.setTargetAtTime(on ? k * 0.1 + ih * 0.03 : 0, T, 0.18); HUM.rush.fl.frequency.setTargetAtTime(380 + k * 700 + ih * 200, T, 0.25);
      HUM.wob.g.gain.setTargetAtTime(on ? k * 0.08 : 0, T, 0.3); HUM.jet.g.gain.setTargetAtTime(on && St.boost ? 0.07 + k * 0.05 : 0, T, St.boost ? 0.08 : 0.25); HUM.jet.fl.frequency.setTargetAtTime(St.boost ? 1800 : 3200, T, 0.2);
      const mv = k > 0.12 ? 1 : 0; if (on && mv !== HUM.last) { HUM.last = mv; snd(mv ? 'thrustStart' : 'thrustStop', { v: 0.5 }); } }
    // trail
    { _back.set(-Math.sin(St.h), 0, Math.cos(St.h)); _carry.set(St.vx || 0, 0, St.vz || 0); const on = St.phase !== 'docking' || St.fade < 0.2;
      { const TL = LOOKS[HULLT] || LOOKS.ship; TRAIL.length = TL.trailLen || LOOKS.ship.trailLen || 1; TRAIL.width = TL.trailWidth || LOOKS.ship.trailWidth || 1; }   // s573 (Ben): each hull's own TRAIL LENGTH + SIZE (bigger on the Gunner + Flagship)
      for (const e of SHIP3.api.engines) TRAIL.emit(e, _back, _carry, on ? thr : 0, St.boost, dt); TRAIL.update(dt, H() * 0.5 / Math.tan(camera.fov * Math.PI / 360)); }
    // shots + fx
    for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i]; s.life -= dt;
      if (s.web) { s.age += dt; const k = Math.min(1, s.age / WEB.BLOOM), e3 = 1 - Math.pow(1 - k, 3), R = WEB.R0 * (1 + (WEB.GROW - 1) * e3);   /* s579: bloom from ball to web, then sweep */
        if (s.sheet) { const U = s.sheet.material.uniforms; U.uT.value += dt; U.uOpen.value = e3; U.uA.value = e3 * Math.min(1, s.life / 0.2 + 0.15); s.sheet.scale.setScalar(R); s.sheet.rotation.y = Math.atan2(s.vx, s.vz) + Math.sin(St.t * 3) * 0.12;   /* s585 billowing net, facing its flight */ if (Math.random() < 0.5) { const a = Math.random() * 6.28; burst(s.m.position.x + Math.cos(a) * R, s.m.position.z + Math.sin(a) * R, '#cfeaff', 1, 0.4); } s.ball.scale.setScalar(1 - 0.75 * e3); s.ball.rotation.y += dt * 3; s.vx *= 1 - dt * 1.2; s.vz *= 1 - dt * 1.2; }
        for (const e of enemiesNear(s.m.position.x, s.m.position.z, R * WEB.CATCH + 1.2)) { if (s.caught.has(e)) continue; s.caught.add(e); if (webbed.some(w => w.e === e)) continue;
          webbed.push({ e, until: St.t + WEB.HOLD, x: e.x, z: e.z, sheet: cocoon(e), t0: St.t }); burst(e.x, e.z, '#e8f4ff', 18, 1.4); glowPop(e.x, 0.8, e.z, 0xcfe9ff, 6); beam(s.m.position.x, s.m.position.z, e.x, e.z, 0xe8f6ff, 0.25, 0.25); }
        if (s.life <= 0 && s.caught.size) toast(s.caught.size > 1 ? 'WEBBED x' + s.caught.size + ' · held 4 s' : 'WEBBED · held 4 s', 1.2); }
      if (s.missile) { const G = s.seek || SEEK.torpedo, px = s.m.position.x, pz = s.m.position.z; let pt = null;
        if (s.lock && !s.lock.dead && s.lock.state !== 'die' && (!s.lock.mode || s.lock.mode === 'fight')) pt = s.lock;
        else { s.lock = null; let bd = G.range; for (const e of enemiesNear(px, pz, G.range)) { const dx = e.x - px, dz = e.z - pz, d = Math.hypot(dx, dz) || 1; if (G.cone && (dx * s.dir[0] + dz * s.dir[1]) / d < Math.cos(G.cone)) continue; if (d < bd) { bd = d; pt = e; } } if (pt && G === SEEK.missile) s.lock = pt; }   /* the missile locks on; torpedoes re-check their cone */
        if (pt) s.tgt = { x: pt.x, z: pt.z, alive: 1, pirate: 1 }; else if (!s.tgt || !s.tgt.alive || s.tgt.pirate) { let bd = 60; s.tgt = null; for (const r of rocks) { if (!r.alive) continue; const d = Math.hypot(r.x - s.m.position.x, r.z - s.m.position.z); if (d < bd) { bd = d; s.tgt = r; } } }
        if (s.tgt) { const G = s.seek || SEEK.torpedo, dx = s.tgt.x - s.m.position.x, dz = s.tgt.z - s.m.position.z, d = Math.hypot(dx, dz) || 1, k2 = Math.min(1, dt * G.turn); s.vx = lerp(s.vx, dx / d * G.speed, k2); s.vz = lerp(s.vz, dz / d * G.speed, k2); }
        if (!s.m.isMesh) { const a = Math.atan2(s.vx, s.vz); s.m.rotation.y = a; s.m.rotation.z += dt * 4; const tx = s.m.position.x - Math.sin(a) * 1.6, tz = s.m.position.z - Math.cos(a) * 1.6; burst(tx, tz, '#5fb8ff', 2, 0.9); if (Math.random() < 0.5) burst(tx, tz, '#d8f0ff', 1, 0.5); const fl = s.m.children[s.m.children.length - 2]; if (fl) fl.scale.setScalar(1.6 + Math.random() * 0.6); } else if (Math.random() < 0.6) burst(s.m.position.x, s.m.position.z, '#ff8a3a', 1, 0.5); }   /* s576 the blue exhaust trail + the missile turns to its heading */
      if (!s.missile && !s.web && !s.mineFx && s.m.visible && s.m.isMesh && s.m.children.length) { const c0 = s.m.children[0]; c0.material.opacity = 0.75 + Math.random() * 0.25; if (s.m.children[1]) s.m.children[1].scale.setScalar(c0.scale.x * (0.45 + Math.random() * 0.2)); if (Math.random() < 0.45) burst(s.m.position.x, s.m.position.z, '#4fa8ff', 1, 0.35); }
      if (s.mineFx) s.mineFx(dt, s);
      s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt; if (!s.missile && !s.mineFx) s.m.rotation.y = Math.atan2(s.vx, s.vz);
      if (s.life <= 0 || (!s.web && (combat.hitShot(s) || beasts.hitShot(s) || deep.hitShot(s) || nests.hitShot(s) || splits.hitShot(s) || hitRocks(s)))) {   /* s579 the web never stops on a hit: it sweeps on and catches the whole cluster */ if (s.missile && s.life <= 0) burst(s.m.position.x, s.m.position.z, '#ffd23a', 12, 1.3); scene.remove(s.m); if (s.mineObj) { s.mineObj.userData.dispose(); burst(s.m.position.x, s.m.position.z, '#4fa8ff', 16, 1.4); glowPop(s.m.position.x, 0.5, s.m.position.z, 0x3aa0ff, 7); } else if (s.web && s.sheet) { s.sheet.material.dispose(); s.ball.geometry.dispose(); burst(s.m.position.x, s.m.position.z, '#e8f4ff', 8, 1); } else if (s.missile) { if (s.m.isMesh) s.m.geometry.dispose(); else burst(s.m.position.x, s.m.position.z, '#5fb8ff', 10, 1.2); } else { s.m.children.forEach(c => c.material && c.material.dispose()); if (s.m.visible) glowPop(s.m.position.x, 0.2, s.m.position.z, 0x7df9ff, 2.4); }   /* s580: invisible line shots (LANCE / RAIL) no longer pop dots */ shots.splice(i, 1); } }
    for (const p of pops) if (p.on) { p.life -= dt; const k = Math.max(0, p.life / 0.22); p.sp.scale.setScalar(p.s * (1.4 - k * 0.4)); p.sp.material.opacity = k; if (p.life <= 0) { p.on = false; p.sp.visible = false; } }
    for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.life -= dt; f.s.position.x += f.vx * dt; f.s.position.z += f.vz * dt; f.vx *= 0.95; f.vz *= 0.95; f.s.material.opacity = clamp(f.life * 1.6, 0, 1); f.s.scale.setScalar(f.sz * (1 + (1 - f.life))); if (f.life <= 0) { scene.remove(f.s); f.s.material.dispose(); fx.splice(i, 1); } }
    // rocks
    for (let i = 0; i < rocks.length; i++) { const r = rocks[i]; if (!r.alive) { r.back -= dt; if (r.back <= 0) { r.alive = 1; r.init = 0; if (r.orR0 && !r.orR) r.orR = r.orR0; } }
      if (r.alive && r.init && Math.abs(r.x - St.x) + Math.abs(r.z - St.z) > 420) continue; r.init = 1;
      if (r.orR) { r.oa += r.os * dt; r.x = r.cx + Math.cos(r.oa) * r.orR; r.z = r.cz + Math.sin(r.oa) * r.orR; }   // s381 phones: far rocks keep their last pose
      r.ry += r.sp * dt; _e.set(r.rx, r.ry, 0); _q.setFromEuler(_e); const sc = r.alive ? r.s : 0.0001; _s.set(sc, sc * 0.8, sc); _v.set(r.x, r.y, r.z); _m.compose(_v, _q, _s); rockMesh.setMatrixAt(i, _m); }
    rockMesh.instanceMatrix.needsUpdate = true;
    // install models: build within 260 u of the ship (one per frame, no hitch), drop past 380; tick the ones on screen-ish
    instCheck -= dt; if (instCheck <= 0) { instCheck = 0.4; for (const e of INST) { const dd = Math.hypot(e.x - St.x, e.z - St.z); e.near = dd < 170; e.vis = dd < 235; if (!e.inst && !e.virtual && dd < 260 && !instQ.includes(e)) instQ.push(e); else if (e.inst && dd > 380) { e.inst.dispose(); e.inst = null; } } instQ.sort((a, b) => Math.hypot(a.x - St.x, a.z - St.z) - Math.hypot(b.x - St.x, b.z - St.z)); }
    if (instQ.length) buildInst(instQ.shift());
    { const ws = H() * 0.5 / Math.tan(camera.fov * Math.PI / 360); for (const e of INST) if (e.inst) { e.inst.group.visible = !!e.vis; if (e.near) e.inst.tick(dt, ws); } }
    // world motion
    spinners.forEach(s => { if (s.z) s.o.rotation.z += s.s * dt; else s.o.rotation.y += s.s * dt; });
    puffs.forEach(p => { p.m.rotation += p.spin * dt; p.s.position.x = p.bx + Math.sin(t * 0.05 + p.ph) * 6; p.s.position.z = p.bz + Math.cos(t * 0.04 + p.ph) * 5; });
    docks.forEach(d => { const near = St.zone === d, pulse = 0.5 + 0.5 * Math.sin(t * (near ? 6 : 2.4)); d.beacon.material.opacity = (near ? 0.55 : 0.25) + pulse * 0.4; d.beacon.scale.setScalar(1 + (near ? pulse * 0.25 : 0));
      d.beacon.material.color.set(!d.open ? '#ec3013' : St.dockable === d ? '#6ee7b7' : near ? '#ffd23a' : '#6ee7b7'); d.lights.forEach((l, i) => { l.material.opacity = (Math.sin(t * 3 + i) > 0.2) ? 1 : 0.25; }); });
    // labels fade with distance
    labels.forEach(l => { const d = Math.hypot(l.position.x - St.x, l.position.z - St.z); l.material.opacity = clamp((l.userData.far || (l.userData.big >= 1 ? 520 : 170)) / Math.max(1, d) - 0.6, 0, 1); if (camMode === 'swoop' && !l.userData.planet) l.material.opacity = 0; /* s448 (Ben): the swoop / chase view shows only the planet names */ l.visible = l.material.opacity > 0.02; });
    // camera (s378 modes). pitch = angle above the plane, dist = distance from the look point.
    const asp = W() / H(), narrow = Math.pow(Math.max(1, 1.05 / asp), 0.75), spd = Math.hypot(St.vx, St.vz) / V;
    // s379c FOCUS (Ben: the swoop should show off every 3D model, like docking): the nearest install / dock / station / port within range is the
    // camera's focus: the look point slides toward it, the camera closes in, and idling there slowly circles it.
    let focus = null; { let bd = 1e9; const cand = (x, z, r, range) => { const d = Math.hypot(x - St.x, z - St.z); if (d < range && d < bd) { bd = d; focus = { x, z, r }; } };
      for (const e of INST) { if (e.gone) continue; cand(e.x, e.z, e.fr || (e.type === 'dock' ? 16 : 9), (e.frange || (e.type === 'dock' ? 45 : 32)) * (e.type === 'dock' ? 0.55 : 0.7)); }   /* s469 (Ben): smaller swoop areas, planets (their dock) most */
      for (const S of STATIONS) { const d = Math.hypot(S.x - St.x, S.z - St.z); if (d < 60) { focus = { x: S.x, z: S.z, r: 26 * (S.sc || 0.7) }; bd = d; } } }   /* s450 (Ben: the swoop was weird at stations): stations are focus targets too, with their real size */
    St._focusOn = !!focus; if (focus) St._lf = focus; St._fw = lerp(St._fw || 0, focus ? 1 : 0, 1 - Math.exp(-dt * 1.4)); if (St._fw < 0.01) St._lf = null;   /* s469 smooth: the focus fades in / out instead of snapping */
    if (focus && St.phase === 'free' && Math.hypot(St.vx, St.vz) / V < 0.08 && !St.menu) St.idleT = (St.idleT || 0) + dt; else St.idleT = 0;
    { let near = focus ? 1 : 0; if (!near && St.zone && St.zone.kind !== 'planet') near = 1;
      const fight = (combat.list && combat.list.some(p => Math.hypot(p.x - St.x, p.z - St.z) < 90)) || (beasts.list && beasts.list.some(p => Math.hypot(p.x - St.x, p.z - St.z) < 70));
      const want = (St.phase === 'docking' || St.menu) ? 1 : fight && !focus ? 0 : near ? (spd < 0.75 ? 1 : 0.55) : St.boost ? 0 : spd < 0.25 ? 0.35 : 0.1; St._swOut = want < swoopK - 0.02; St._want = lerp(St._want == null ? want : St._want, want, 1 - Math.exp(-dt * 2)); swoopK = lerp(swoopK, St._want, 1 - Math.exp(-dt * (St._want > swoopK ? 0.8 : 1.1)));   /* s469 (Ben): smoother in + out */   /* s450 leaving the swoop = twice the approach speed */ if (want > 0.5 && !St._swS) { St._swS = true; snd('swoop'); } else if (want < 0.2) St._swS = false; }
    let pitch, dist, yawT = 0, ahead = 0.7;
    if (camMode === 'top') { pitch = 0.95; dist = 58; }
    else if (camMode === 'low') { pitch = 0.56; dist = 50; ahead = 0.9; }
    else if (camMode === 'chase') { pitch = 0.36; dist = 34; yawT = St.h; ahead = 0.5; }
    else { const k = ease(clamp(swoopK, 0, 1)); pitch = lerp(0.62, 0.34, k); dist = lerp(56, 33, k); ahead = lerp(0.6, 0.45, k); yawT = St.h;
      const lf = St._lf; if (lf && lf.r > 12) { const big = clamp((lf.r - 12) / 12, 0, 1) * St._fw; St._bigF = big * k; dist = lerp(dist, Math.min(95, 33 + lf.r * 1.6), big * k); pitch = lerp(pitch, 0.55, big * k); } else St._bigF = 0; }   /* s451: just pull back + up for big stations */   // s450b big stations: frame the ship AND the whole station   // s450 big stations: the swoop frames the whole station instead of diving into it   // s378c (Ben): swoop = low angle in open space → lower + closer near things, and it turns with the ship like CHASE
    const fk = camMode === 'swoop' && St._lf ? ease(clamp(swoopK, 0, 1)) * St._fw : 0, fF = St._lf;
    const base = dist * St.dist * narrow * (St.boost ? 1.12 : 1) * (St.phase === 'docking' ? 0.7 : 1) * (1 - fk * 0.22), lead = St.phase === 'free' ? ahead : 0;
    if (camMode === 'swoop' && St.idleT > 1.5) { camOrbit = (camOrbit || 0) + dt * 0.22 * Math.min(1, (St.idleT - 1.5) / 2); } else if (camOrbit) camOrbit *= Math.exp(-dt * 2);
    if (camOrbit) yawT += camOrbit;
    camYaw = (camMode === 'chase' || camMode === 'swoop') ? camYaw + angDiff(camYaw, yawT) * (1 - Math.exp(-dt * 2.4)) : camYaw + angDiff(camYaw, 0) * (1 - Math.exp(-dt * 4));
    if (Math.abs(camYaw) < 1e-4 && camMode !== 'chase' && camMode !== 'swoop') camYaw = 0;
    const cfx = Math.sin(camYaw), cfz = -Math.cos(camYaw), lowK = clamp((0.95 - pitch) / 0.6, 0, 1), fwdPush = base * 0.22 * lowK + (asp < 1 ? 3 : 0);
    _v.set(St.x + St.vx * lead + cfx * fwdPush * (1 - fk), 0, St.z + St.vz * lead + cfz * fwdPush * (1 - fk));
    if (fk) { const bf = St._bigF || 0; let ox = (fF.x - _v.x) * fk * 0.5, oz = (fF.z - _v.z) * fk * 0.5; const ol = Math.hypot(ox, oz), cap = lerp(10, 4, bf); if (ol > cap) { ox *= cap / ol; oz *= cap / ol; } _v.x += ox; _v.z += oz; }   /* s451 (Ben: the station knocked the ship off screen): the look point never leaves the ship by more than 10 u (4 at stations) */   /* s450b: no forward push / lead for big targets: the look point sits between ship + station */ camLook.lerp(_v, 1 - Math.exp(-dt * 3));
    _s.set(camLook.x - cfx * Math.cos(pitch) * base, Math.sin(pitch) * base, camLook.z - cfz * Math.cos(pitch) * base); camPos.lerp(_s, 1 - Math.exp(-dt * (camMode === 'chase' || camMode === 'swoop' ? 3 : 2.5)));
    if (WALK.W.on) { camYaw = 0; const fast = !!WALK.W.ship && WALK.W.phase === 'walk'; camLook.lerp(WALK.W.cam.look, 1 - Math.exp(-dt * (fast ? 9 : 2.4))); camPos.lerp(WALK.W.cam.pos, 1 - Math.exp(-dt * (fast ? 3.2 : 1.8))); }   /* s570c walking a docked walk-in: the look point sticks to the fox (centred), the camera glides */   // s416 dock walk camera
    sky.position.copy(camPos); sky.userData.tick(t);
    camera.position.copy(camPos); camera.lookAt(camLook); if (TU.on) TU.cam(); if (SCOPE) { SCOPE.cam(rdt); camera.updateMatrixWorld(); SCOPE.update(rdt); }
    if (St.phase === 'launch') { const A = St.anim, k = ease(clamp((A.t - 1.4) / 3.0, 0, 1)), cl = _s.set(St.x + 2.4, St.y - 3.2, St.z + 11), lk = _v.set(St.x, St.y + 1.5, St.z - 6); camera.position.lerpVectors(cl, camPos, k); _v.lerpVectors(lk, camLook, k); camera.lookAt(_v); if (k < 1) { camPos.copy(camera.position); } }   // s520: one shot: under + behind the climbing ship → swings up into the map view
    { // danger for the music: enemies close (pirates, creatures, an angry station), plus the hull ringing
      // s436 (Ben): the battle song fades in GRADUALLY as any enemy closes in (moths, creatures, pirates, machines): 0 at the edge of its range, full within 35 u
      let dz = 0; const near = (x, z, r) => { const d = Math.hypot(x - St.x, z - St.z); return d <= 35 ? 1 : Math.max(0, 1 - (d - 35) / (r - 35)); };
      for (const p of combat.list) if (!p.dead && p.mode !== 'down' && !p.calm) dz = Math.max(dz, near(p.x, p.z, 160));
      // s441: near a world (its planet, yard, depot, gate) creatures only count while they are actually attacking you
      const atWorld = keepOut.some(q => Math.hypot(q.x - St.x, q.z - St.z) < q.r + 40);
      for (const p of beasts.list) if (!p.dead && p.state !== 'die' && (!atWorld || p._near)) dz = Math.max(dz, near(p.x, p.z, p.fam === 'vmoth' ? 190 : 150));
      if (combat.threat()) dz = Math.max(dz, 0.9); if (St.phase !== 'free' || St.menu || St.paused) dz *= 0.3;
      if (camMode === 'swoop' && St._focusOn && swoopK > 0.6) dz = 0; /* s441 (Ben): never battle music in the SWOOP view. s453: only the real swoop (zoomed in on a location), not the camera's open-space dip */
      LOFI.danger(dz * dz * (3 - 2 * dz));
      // s432 the WORLD SONG: the nearest of the 9 centre worlds within 0.55 CELL (its whole neighbourhood: dock, installs, station), else open space
      if ((St._mw = (St._mw || 0) - dt) <= 0) { St._mw = 0.5; let wk = 'deep', bd = CELL * 0.55; for (const w of WORLDS) { const dd = Math.hypot(w.x - St.x, w.z - St.z); if (dd < bd) { bd = dd; wk = w.key; } }
        if (LOFI.world(wk) && St.phase === 'free') toast('NOW PLAYING · ' + (wk === 'deep' ? 'OPEN SPACE' : (WORLDS.find(w => w.key === wk) || {}).name) + ' · ' + themeTitle(wk), 2.6); } }
    if (St.phase === 'free' && St.hull > 0 && St.hull < (St.hullMax || 100) * 0.25 && (St._hb = (St._hb || 0) - dt) <= 0) { St._hb = 1.1; snd('lowHp', { v: 0.6 }); }   // s426 low-hull heartbeat
    if ((fuelSaveT -= dt) <= 0) { fuelSaveT = 4; saveFuel(); }
    if ((miniT -= dt) <= 0) { miniT = 0.12; drawMini(); }
    if (combat && !CONV) CONV = createConvoys({ THREE, scene, IK, LOOKS, save, combat, toast: (a, b) => toast(a, b), snd: k => snd(k), WORLDS, deals: tDeals, shipSpec: dShip, goodName, RISK: D_RISK, WORLD_NAME, canRun: dCanRun, runOne: dRunOne, lostRun: dLost, finish: dFinish, place: k => docks.find(q => q.key === k && !q.station) || WORLDS.find(w => w.key === k) }); if (CONV) { try { CONV.tick(dt, St); } catch (e) { console.warn('convoys', e); CONV = { tick() {} }; } }
    if (combat && !EVT) { try { EVT = createEvents({ THREE, scene, St, combat, toast: (a, b) => toast(a, b), snd: k => snd(k), save, docks, WORLDS, deep, MKT, fleets, IK, LOOKS, burst, portKey, WORLD_NAME, arena: () => typeof AR !== 'undefined' && AR && AR.on,   /* s603 SPACE EVENTS */
      giveItem: k => { const I = sItems(); I[k] = (I[k] || 0) + 1; save.setStat('shipItems', I); },
      addCrates: n => { const h = hold(), q = Math.max(0, Math.min(n, HOLD_CAP + MOD.cargo - holdN(h))); const P = GOODS.filter(g => !g.frontier && !g.exportOnly && !g.limited); for (let i = 0; i < q; i++) { const g = P[Math.floor(Math.random() * P.length)]; h[g.key] = (h[g.key] || 0) + 1; } if (q) save.setStat('spaceHold', h); return q; },
      blueprint: () => { const L = [['house2', 'BIG HOUSE'], ['house3', 'VILLA'], ['apts', 'APARTMENT BLOCK'], ['smelter', 'SMELTER'], ['refinery', 'CRYSTAL REFINERY'], ['plant', 'CRYSTAL POWER PLANT'], ['school', 'SCHOOL'], ['clinic', 'CLINIC'], ['turret', 'DEFENCE TURRET'], ['police', 'POLICE STATION'], ['lighthouse', 'LIGHTHOUSE'], ['harbour', 'HARBOUR'], ['shipyard', 'SHIPYARD'], ['fuel', 'FUEL YARD'], ['smine', 'SPACE MINE CONTROL'], ['whbig', 'BIG WAREHOUSE']].filter(([k]) => !save.flag('ppBP_' + k)); if (!L.length) return null; const b = L[Math.floor(Math.random() * L.length)]; save.setFlag('ppBP_' + b[0]); return b[1]; } }); } catch (e) { console.warn('events', e); EVT = { tick() {}, course: () => null, boardTap() {} }; } }
    if (EVT) { try { EVT.tick(dt); } catch (e) { console.warn('events', e); } }
    cargoLook(dt);
    if (St.phase === 'cabin') CAB.cam(camera, rdt);
    pilotTick(); emit(); renderer.render(scene, camera);
  }
  const onResize = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); sizeLabels(); };
  const ro = new ResizeObserver(onResize); ro.observe(container); onResize();
  // settle the camera before the first frame
  camLook.set(St.x, 0, St.z); camPos.set(St.x, 80, St.z + 40);
  step(); emit(true);

  function rename(key, nm) { const w = WORLDS.find(q => q.key === key); if (!w) return; names[key] = nm; try { localStorage.setItem(NAMES, JSON.stringify(names)); } catch (e) {}
    const old = w.lab; const lb = label(nm, 'PLAYER ' + w.player + ' WORLD' + (w.dock ? ' · YOUR HOME' : ' · NO DOCK YET'), '#ffffff', '#7fd0ff', 1.25); lb.position.copy(old.position); lb.userData.planet = true; scene.remove(old); labels.splice(labels.indexOf(old), 1); w.lab = lb; sizeLabels();
    const z = zones.find(q => q.w === w); if (z) z.name = nm; }

  // s598 BATTLE ARENA (Space Battle Workshop: Space Map.dc.html?arena=vmoth in a frame). Once you are flying it moves you to the emptiest open space,
  // then the workshop spawns / clears enemies, heals you, toggles GOD MODE by postMessage { type: '8g:arena', cmd }.
  var ARENA = (() => { try { return new URLSearchParams(location.search).get('arena'); } catch (e) { return null; } })(); var AR = { on: !!ARENA, fam: ARENA || 'vmoth', ready: false, x: 0, z: 0, mine: [] };
  // s598c: the arena sits OUT PAST everything on the map (worlds, stations, docks, installs, zones, fields, nests, creature homes), 600 u clear of the furthest
  // s598g: the map ends at r 2600 (the ship is clamped there), so the arena = the emptiest point INSIDE r 2400: furthest from every world, zone, dock, station, base, home + field
  function arenaSpot() { const P = []; for (const w of WORLDS) P.push([w.x, w.z]); for (const z of zones) P.push([z.x, z.z]); for (const d of docks) if (d && d.x != null) P.push([d.x, d.z]); for (const h of homes) P.push([h.x, h.z]); for (const f of ((splits && splits.fields) || [])) P.push([f.x, f.z]);
    try { for (const q of STATIONS) P.push([q.x, q.z]); } catch (e) {} try { for (const q of (deep && deep.bases) || []) P.push([q.x, q.z]); } catch (e) {} try { for (const e of INST) P.push([e.x, e.z]); } catch (e) {}
    let best = { x: 0, z: 2300 }, bs = -1; for (let i = -24; i <= 24; i++) for (let j = -24; j <= 24; j++) { const x = i * 100, z = j * 100; if (Math.hypot(x, z) > 2400) continue; let md = 1e9; for (const [px, pz] of P) { const d = Math.hypot(px - x, pz - z); if (d < md) md = d; } if (md > bs) { bs = md; best = { x, z }; } }
    AR.clear = Math.round(bs); return best; }
  function arenaSpawn(n, role) { const fam = AR.fam, PIR = { pirScout: 'scout', pirFighter: 'fighter', pirGunner: 'gunner', pirPair: 'pair' }[fam];
    if (fam === 'machine') { const L = role === 'trio' ? ['cruiser', 'scout', 'gunner'] : [role || 'scout']; L.forEach((mk, k) => { const a = Math.random() * 6.28 + k * 2.1, r = 65 + Math.random() * 15, p = combat.arenaShip('machine', St.x + Math.cos(a) * r, St.z + Math.sin(a) * r, mk); if (p) AR.mine.push(p); }); toast('SUMMONED · MACHINE ' + (role === 'trio' ? 'FLEET' : String(role || 'scout').toUpperCase()) + '', 2.4); return; }   /* s598w */
    if (fam === 'pirPair' && (role === 'crew' || role === 'ambush')) { const a = Math.random() * 6.28, K = ['fighter', 'scout', 'gunner', 'scout']; if (role === 'crew') { const L = combat.arenaCrew(K, St.x + Math.cos(a) * 150, St.z + Math.sin(a) * 150); AR.mine.push(...L); toast('SUMMONED · A CREW IN WING FORMATION', 1.8); } else { const fx = St.x + Math.cos(a) * 110, fz = St.z + Math.sin(a) * 110, F = splits.addField ? splits.addField(fx, fz, 6) : { x: fx, z: fz }; const L = combat.arenaCrew(K.slice(0, 3), F.x, F.z, F); AR.mine.push(...L); toast('SUMMONED · AN AMBUSH IN THE ROCKS (fly toward the asteroids)', 2.4); } return; }   /* s598y */
    if (PIR) { const L = PIR === 'pair' ? ['gunner', 'fighter'] : Array(n).fill(PIR); L.forEach((cl, k) => { const a = Math.random() * 6.28 + k * 3.14, r = 70 + Math.random() * 15, p = combat.arenaShip(cl, St.x + Math.cos(a) * r, St.z + Math.sin(a) * r); if (p) AR.mine.push(p); }); toast('SUMMONED · ' + fam.replace('pir', 'PIRATE ').toUpperCase(), 1.6); return; }   /* s598r pirates */
    for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, r = 38 + Math.random() * 8, c = beasts.spawn(fam, { fam, x: fam === 'belt' ? St.x : St.x + Math.cos(a) * r, z: fam === 'belt' ? St.z : St.z + Math.sin(a) * r },   /* s598j a serpent's 'belt' = where you are */ { a: k % 2 ? Math.PI * 1.5 : Math.PI * 0.5, dx: fam === 'belt' ? Math.cos(a) * 30 : 0, dz: fam === 'belt' ? Math.sin(a) * 30 : 0, noBack: true, prov: 1e9, role: role || (n > 1 ? (k % 2 ? 'strafe' : 'circle') : undefined) }); if (c) { c.arena = true; AR.mine.push(c); } } toast('SUMMONED · ' + (role === 'strafe' ? 'FLY-OVER ' : role === 'circle' ? 'CIRCLER ' : '') + fam.toUpperCase(), 1.6); }
  function arenaClear() { for (const c of AR.mine) { if (c.C) combat.arenaRemove(c); else beasts.remove(c); } AR.mine.length = 0; combat.clear && combat.clear(); }
  function arenaTick() { if (!AR || !AR.on) return; if (AR.ready) { St.fuel = 100; combat.quiet && combat.quiet(30); for (const c of beasts.list) if (!c.arena && Math.hypot(c.x - St.x, c.z - St.z) < 300) beasts.remove(c);
      return; }
    if (St.phase !== 'free' && St.phase !== 'start') { St.phase = 'free'; St.anim = null; St.fade = 0; }   /* s598d: straight into flight, no take-off shot */
    if (St.phase !== 'free') return; AR.ready = true; St.dist = 1.8; St.god = true;   /* s598i (Ben): always invincible in the arena */   /* s598g zoomed out so the circling moths stay on screen */ combat.clear && combat.clear(); const p = arenaSpot(); AR.x = p.x; AR.z = p.z; St.x = p.x; St.z = p.z; St.vx = St.vz = 0; St.fuel = Math.max(St.fuel, 100); camLook.set(St.x, 0, St.z); camPos.set(St.x, 80, St.z + 50); 
    toast('BATTLE ARENA · open space, nobody else here.', 2.4); arenaSpawn(2); try { parent.postMessage({ type: '8g:arena-ready' }, '*'); } catch (e) {} }
  if (AR.on) addEventListener('message', e => { const d = e.data || {}; if (d.type !== '8g:arena') return; if (d.fam) AR.fam = d.fam;
    if (d.cmd === 'spawn') arenaSpawn(d.n || 1, d.role); else if (d.cmd === 'clear') arenaClear(); else if (d.cmd === 'kill') { for (const c of AR.mine) { if (c.C) combat.arenaKill(c); else beasts.kill && beasts.kill(c); } AR.mine = AR.mine.filter(c => !c.C); } else if (d.cmd === 'heal') { St.hull = 100; St.en = 100; St.fuel = 100; SH.restore && SH.restore(); toast('REPAIRED', 1); } else if (d.cmd === 'god') { St.god = !!d.on; toast(St.god ? 'GOD MODE ON' : 'GOD MODE OFF', 1.2); } else if (d.cmd === 'back') { St.x = AR.x; St.z = AR.z; St.vx = St.vz = 0; } else if (d.cmd === 'tune') { window.__8gReTune && window.__8gReTune(); window.__8gReTuneC && window.__8gReTuneC(); } });
  const api = window.__8G_GAME = {
    start() { if (St.phase !== 'start') return; let back = false; try { back = new URLSearchParams(location.search).get('walk') === '1'; } catch (e) {}
      if (back && sd && WALK.canWalk(sd)) { const P0 = WALK.pad(sd), B = bigPose(P0, sd), P = B || P0; St.x = P.x; St.z = P.z; St.y = P.y; St.h = B ? B.h : -Math.PI / 2; St.vx = St.vz = 0; St.phase = 'walk'; if (B) WALK.dockShip({ type: HULLT, group: SHIP3.group, body: SHIP3.group.children[0], api: SHIP3.api }); WALK.resume(sd, B ? bigInfo(B, false) : null); if (B && SHIP3.api.snapRamp) SHIP3.api.snapRamp(1); camLook.set(St.x, 0, St.z); emit(true); return; }   // s417: back out of the Meru Spacedock: on the deck, walk to your ship
      let lw = null; try { const q = new URLSearchParams(location.search).get('launch'); if (q) lw = WORLDS.find(w => w.key === q); } catch (e) {}
      if (lw) { St.x = lw.x; St.z = lw.z; St.y = -7.5; St.h = 0; St.vx = St.vz = 0; St.phase = 'launch'; St.anim = { t: 0, w: lw }; St.fade = 1; snd('undock'); for (const e of INST) if (Math.hypot(e.x - St.x, e.z - St.z) < 260) buildInst(e); emit(true); return; }   // s520 TAKE-OFF SHOT (reusable: any world key)
      if (sd) { St.fade = 0.6; beginUndock(); } else { St.phase = 'free'; St.freeAt = St.t; toast('Steer with the stick. 3 = BOOST. Fly over a dock to slow down and DOCK.', 4.5); } emit(true); },
    dockGo() { const m = St.menu; if (!m) return; if (WALK.canWalk(m.d) && !fleets.atWar(m.d.tkey || m.d.key)) { St.menu = null; beginLand(m.d); emit(true); return; } if (fleets.atWar(m.d.tkey || m.d.key)) { toast(m.d.name + ' will not let you land. You are at war.'); return; } if (!m.d.open) { toast(m.d.name + ' is still being built. Trade here for now.'); return; } St.menu = null; beginDock(m.d); },
    yardProg(k) { if (St.menu && St.menu.yard) { St.menu.prog = k || null; emit(true); } },
    yardBuy(k) { const R = RESEARCH[k]; if (!R || !St.menu) return; const T = tiers(save); if (buyTier(save, k)) { applyMods(); if (k === 'hull') St.hull = Math.min(St.hullMax, St.hull + 9); burst(St.x, St.z, '#7dd3fc', 16, 1.2); toast(R.n + ' · TIER ' + (T[k] + 1) + ' FITTED', 2.2); } else if (!R.soon && T[k] < R.max) toast('Not enough gold: ' + R.cost[T[k]] + ' G.'); emit(true); },
    declareWar() { const m = St.menu; if (m && fleets.declare(m.d.tkey || m.d.key)) { snd('shieldDown'); emit(true); } },
    proposePeace() { const m = St.menu; if (m && fleets.peace(m.d.tkey || m.d.key)) { snd('shieldUp'); emit(true); } },
    dockLeave() { St.menu = null; emit(true); },
    boardTap() { EVT && EVT.boardTap(); emit(true); }, eventTest(k) { EVT && EVT.test(k); }, _exp() { return EXP; }, exploreTest(k) { if (!EXP) return; if (k === 'buoy') { const b = deep.finds.filter(it => it.kind === 'buoy').sort((p, q) => Math.hypot(p.x - St.x, p.z - St.z) - Math.hypot(q.x - St.x, q.z - St.z))[0]; St.x = b.x + 3; St.z = b.z + 3; St.vx = St.vz = 0; } if (k === 'edge') { St.x = 0; St.z = -(820); } if (k === 'frontier') { const B = bodies.find(q => q.key === 'beta1'); St.x = B.x; St.z = B.z + B.r * 0.5; St.vx = St.vz = 0; } emit(true); },   /* s605 test hooks */ eventStop() { EVT && EVT.stop(); },
    officeOpen() { if (!St.menu) return; St.menu.tab = 'office'; St.menu.neg = null; snd('menu'); emit(true); },
    officeDir(dir) { const m = St.menu; if (!m) return; m.neg = { step: 'good', dir, line: dir === 'in' ? 'What do you want shipped to your planet?' : 'What does your planet have to sell?' }; snd('menu'); emit(true); },
    officeGood(key) { const m = St.menu; if (!m || !m.neg) return; const port = portKey(m.d), g = GOODS.find(x => x.key === key); if (!g) return; const T = MKT.tier(port), dir = m.neg.dir, base = dir === 'in' ? MKT.buyPrice(g, port) : MKT.sellPrice(g, port);
      const N = dBegin(save, port, dir, key, base, T.i); N.step = 'offer'; N.line = 'My offer: ' + dEff(port, N) + ' G a crate, ' + N.crates + ' crates a run. Market is ' + base + '.'; m.neg = N; snd('menu'); emit(true); },
    officeAsk() { const m = St.menu; if (!m || !m.neg || m.neg.step !== 'offer') return; const port = portKey(m.d), k = dHaggle(save, port, m.neg, MKT.tier(port).i); snd(k === 'agree' ? 'pickup' : k === 'counter' ? 'menu' : 'shieldDown'); if (k === 'mad') m.neg = null; emit(true); },
    officeRuns(n) { const m = St.menu; if (!m || !m.neg || !RUNS.includes(n)) return; m.neg.runs = n; snd('menu'); emit(true); },
    officeSign() { const m = St.menu; if (!m || !m.neg || m.neg.step !== 'offer') return; const port = portKey(m.d), N = m.neg, r = dSign(save, port, N);
      if (r.ok) { m.neg = { step: 'dir', line: r.line }; snd('shieldUp'); toast('DEAL SIGNED · ' + goodName(N.good) + (N.dir === 'in' ? ' from ' : ' to ') + (WORLD_NAME[port] || port) + ' · ' + N.runs + ' runs.', 4); } else { N.line = r.line; snd('shieldDown'); } emit(true); },
    officeBack() { const m = St.menu; if (!m) return; m.neg = null; snd('menu'); emit(true); },
    storeIt(k) { const m = St.menu; if (!m) return; const h = hold(); if (!h[k]) return; h[k]--; if (!h[k]) delete h[k]; save.setStat('spaceHold', h); dStore(save, portKey(m.d), k); snd('menu'); emit(true); },
    takeIt(k) { const m = St.menu; if (!m) return; const h = hold(); if (holdN(h) >= HOLD_CAP + MOD.cargo) { toast('Hold full: ' + (HOLD_CAP + MOD.cargo) + ' crates.'); return; } const r = dTake(save, portKey(m.d), k); if (!r.ok) { if (r.rent) toast('The rent is ' + r.rent + ' G.'); return; } h[k] = (h[k] || 0) + 1; save.setStat('spaceHold', h); snd('pickup'); toast('Took 1 ' + goodName(k) + ' · rent ' + r.rent + ' G', 1.8); emit(true); },
    privOpen() { if (!St.menu) return; St.menu.tab = 'private'; snd('menu'); emit(true); },
    privTake(id) { const m = St.menu; if (!m) return; const port = portKey(m.d), o = privBoard(port).find(x => x.id === id); if (!o) { toast('That offer is gone.'); emit(true); return; } const h = hold();
      if (o.kind === 'buy') { if ((h[o.good] || 0) < o.n) { toast('They want ' + o.n + ' ' + o.name + '. You have ' + (h[o.good] || 0) + ' aboard.'); return; } h[o.good] -= o.n; if (!h[o.good]) delete h[o.good]; save.setStat('spaceHold', h); MKT.onUnload(o.good, o.n); save.addGold(o.price * o.n); MKT.addRep(port, o.n); markDone(save, o.id); snd('pickup'); toast('PRIVATE SALE · ' + o.n + ' ' + o.name + ' to ' + o.who.toLowerCase() + ' · +' + o.price * o.n + ' G', 4); }
      else { const cost = o.price * o.n; if (!save.spend(cost)) { toast('The whole lot costs ' + cost + ' G.'); return; } const q = Math.max(0, Math.min(o.n, HOLD_CAP + MOD.cargo - holdN(h))); if (q) { h[o.good] = (h[o.good] || 0) + q; save.setStat('spaceHold', h); MKT.onLoad(o.good, o.price, q); } for (let i = q; i < o.n; i++) dStore(save, port, o.good); MKT.addRep(port, o.n); markDone(save, o.id); snd('pickup');
        toast('BOUGHT THE LOT · ' + o.n + ' ' + o.name + ' for ' + cost + ' G · ' + q + ' aboard' + (o.n - q ? ', ' + (o.n - q) + ' in dock storage here' : '') + '.', 5); }
      emit(true); },
    dealCancel(id) { dCancel(save, id); snd('shieldDown'); toast('Deal cancelled. That cargo ship is free again.'); emit(true); },
    yardCargoBuy(size) { const C = CARGO[size]; if (!C) return; if (!buyCargo(save, size)) { toast('A ' + C[0] + ' costs ' + C[3] + ' gold.'); return; } snd('shieldUp'); toast(C[0] + ' joins your cargo fleet. Sign a deal at any dock TRADE OFFICE.', 4); emit(true); },
    unloadOrbit() { const m = St.menu; if (!m || m.d.key !== 'p1') return; const h = hold(), st = { g: 0, t: 60, s: 30, m: 10, c: 8, ...((save.data.stats || {}).ppStock || {}) }, got = []; for (const k of Object.keys(h)) { const u = PP_USE[k]; if (!u || u.cap) continue; const q = h[k]; if (u.food) { st.f = Math.round(((st.f ?? 60) + q * u.food) * 10) / 10; got.push('+' + q * u.food + ' FOOD'); } else { st[u.k] = (st[u.k] || 0) + q * u.per; got.push('+' + q * u.per + ' ' + u.n); } delete h[k]; MKT.onUnload(k, q); }
      if (!got.length) { toast('Nothing to unload here. Live animals have to be landed by hand.'); return; } save.setStat('spaceHold', h); save.setStat('ppStock', st); snd('pickup'); toast('SENT DOWN TO ' + (names.p1 || 'EPHRAIM') + ' · ' + got.join(' · '), 4); emit(true); },
    get atHomeDock() { return !!(St.menu && St.menu.d.key === 'p1'); },
    buyPod() { if (podOn()) return; if (!save.spend(150)) { toast('A CARGO POD costs 150 gold.'); return; } save.setStat('cargoPod', 1); applyMods(); snd('shieldUp'); toast('CARGO POD · +4 crates, towed behind. Turns a little slower.', 3.2); emit(true); },
    get pod() { return podOn(); },
    dockTab(tab) { if (St.menu && tab === 'trade' && fleets.atWar(St.menu.d.tkey || St.menu.d.key)) { toast('No trade with a world you are at war with.'); return; } if (St.menu) { St.menu.tab = tab; emit(true); } },
    buy(k) { const m = St.menu; if (!m) return; const g = GOODS.find(x => x.key === k); if (!g || g.frontier || g.exportOnly) return; const port = portKey(m.d), pr = MKT.buyPrice(g, port), h = hold(); if (holdN(h) >= HOLD_CAP + MOD.cargo) { toast('Hold full: ' + (HOLD_CAP + MOD.cargo) + ' crates.'); return; } if (MKT.shortage(g, port) || portAvail(g, m.d.key) < 1) { toast('Sold out here. Buy ' + g.name + ' at its home world.'); return; } if (!save.spend(pr)) { toast('Not enough gold.'); return; } portTake(g, m.d.key); h[k] = (h[k] || 0) + 1; save.setStat('spaceHold', h); MKT.onLoad(k, pr); MKT.push(port, k, 0.05); MKT.addRep(port, 1); emit(true); },
    sell(k) { const m = St.menu; if (!m) return; const g = GOODS.find(x => x.key === k), port = portKey(m.d), pr = MKT.sellPrice(g, port), h = hold(), paid = MKT.paid(k); if (!h[k]) return; h[k]--; if (!h[k]) delete h[k]; save.setStat('spaceHold', h); save.addGold(pr); MKT.onUnload(k); MKT.push(port, k, -0.08); MKT.addRep(port, 1); toast('Sold ' + g.name + ' · +' + pr + ' G' + (paid != null ? (pr >= paid ? ' · PROFIT +' + (pr - paid) : ' · LOSS ' + (pr - paid)) : ''), 1.8); emit(true); },
    // s599 BRIDGE MENU data (Space Map.dc.html opens the Bridge on MENU / I)
    bridgeData() { const sv = save.data || {}, dd = (x, z) => Math.round(Math.hypot(x - St.x, z - St.z)), ang = (x, z) => Math.atan2(z - St.z, x - St.x);
      const KN = { scout: 'SCOUT', fighter: 'CRUISER', gunner: 'GUNNER', cruiser: 'CRUISER' }, FAM = { belt: 'STAR SERPENT', vmoth: 'VOID MOTH', octo: 'DEEPHAND' }, contacts = [];
      for (const p of (combat && combat.list) || []) { if (p.dead) continue; const d = dd(p.x, p.z); if (d > 150) continue; const mach = !!(p.machine || p.mach || /mach/i.test(p.kind || p.type || '')); contacts.push({ k: 'c' + contacts.length, n: (mach ? 'MACHINE ' : 'PIRATE ') + (KN[p.kind || p.k || p.type] || 'SHIP'), sub: mach ? 'SIGNAL NOT ITS OWN' : (p.stun ? 'STUNNED' : 'HOSTILE CONTACT'), d, a: ang(p.x, p.z), st: mach ? 'hacked' : 'hostile', crest: mach ? 'machine' : 'pirate' }); }
      for (const p of (beasts && beasts.list) || []) { if (p.dead || p.state === 'die') continue; const d = dd(p.x, p.z); if (d > 150) continue; contacts.push({ k: 'b' + contacts.length, n: FAM[p.fam] || 'CREATURE', sub: 'WILD', d, a: ang(p.x, p.z), st: 'beast' }); }
      const sig = [...STATIONS.map(q => ({ k: q.key, n: q.name, kind: 'STATION', x: q.x, z: q.z, crest: 'buoy', model: q.type })), { k: 'myard', n: 'MACHINE YARD', kind: 'HACKED FLEET', x: MACHINE_YARD.x, z: MACHINE_YARD.z, crest: 'machine', model: 'machineYard' },
        ...NESTS.map(n => ({ k: n.key, n: n.name, kind: 'NEST · ' + n.beasts, x: n.x, z: n.z, crest: 'beast', model: n.fam === 'vmoth' ? 'voidMoth' : null })), ...PIRATES.map(p => ({ k: 'pir' + p.name, n: p.name, kind: 'PIRATE PORT', x: p.x, z: p.z, crest: 'pirate', model: 'pirBase' })),
        ...FRONTIER.map(f => ({ k: f.key, n: f.name, kind: 'NEW WORLD', x: f.x, z: f.z, crest: f.key, model: 'planet:' + f.key }))].map(o => ({ ...o, d: dd(o.x, o.z), b: String(Math.round(((ang(o.x, o.z) * 180 / Math.PI + 90) % 360 + 360) % 360)).padStart(3, '0') })).sort((a, b) => a.d - b.d).slice(0, 12);
      const ev = MKT.event(), A = MKT.active(), h = hold();
      return { you: { x: St.x / CELL, z: St.z / CELL }, hull: HULLT, hp: Math.round(St.hull), hpMax: St.hullMax, en: Math.round(St.en), fuel: Math.round(St.fuel), gold: sv.gold || 0, contacts: contacts.sort((a, b) => a.d - b.d), signals: sig,
        fleets: WORLDS.filter(w => !w.player).map(w => { const m = fleets ? fleets.mood(w.key) : { t: '', c: '#f3f2f2' }; return { k: w.key, n: w.name, c: w.tint, m: fleets && fleets.atWar(w.key) ? 'AT WAR' : m.t, mc: fleets && fleets.atWar(w.key) ? '#ff6a4d' : m.c }; }),
        event: ev.text, eventLeft: MKT.eventLeft(), contracts: A.list.map(a => ({ n: a.n, name: a.name, to: a.toName, left: Math.max(0, Math.ceil((a.due - Date.now()) / 60000)), pay: a.pay, have: h[a.good] || 0 })),
        hold: Object.entries(h).map(([k, q]) => { const g = GOODS.find(x => x.key === k); const best = MKT.bestSale(k, null); return { k, n: g ? g.name : k, q, paid: MKT.paid(k), best: best ? best.name + ' ' + best.p + ' G' : '' }; }), holdN: holdN(h), cap: HOLD_CAP + MOD.cargo, items: (() => { const I = sItems(), pin = save.stat('shipPin', 'repair'), dk = !!St.menu; return SHIP_ITEMS.map(([k, n, d, pr]) => ({ k, n, d, q: I[k] || 0, pin: pin === k, buy: dk ? pr : 0 })); })(), onItem: k => useShipItem(k), onPin: k => { save.setStat('shipPin', k); emit(true); }, onBuyItem: k => { const d = SHIP_ITEMS.find(x => x[0] === k); if (!d || !St.menu) return; if (!save.spend(d[3])) { toast('Not enough gold.'); return; } const I = sItems(); I[k] = (I[k] || 0) + 1; save.setStat('shipItems', I); snd('pickup', { v: 0.4 }); emit(true); },
        market: GOODS.filter(g => !g.frontier).map(g => { const best = MKT.bestSale(g.key, null); return { k: g.key, n: g.name, lux: !!g.lux, best: best ? { port: best.name, p: best.p, age: best.age } : null }; }),
        course: St.course ? { name: St.course.name, auto: !!St.auto } : null, xp: sv.xp || 0 }; },
    async cockpitWalk() { if (St.phase !== 'free' || St.menu) { toast('Slow down first: you can only leave the seat in open space.'); return; } St.auto = false; St.phase = 'cabin'; St.boostKey = St.boostBtn = false; const ok = await CAB.enter(HULLT); if (!ok) { St.phase = 'free'; return; } emit(true); },
    flyShip() { if (St.phase !== 'cabin') return; CAB.exit(); St.phase = 'free'; St.freeAt = St.t; toast('Back at the controls.', 1.8); emit(true); },
    get cabinScout() { return St.phase === 'cabin' && CAB.C.scout; },
    // s599 Bridge WEAPONS tab: the real special on button 2
    get specials() { return SPECS.map(k => ({ k, n: (SPEC_N[k] || k).split(' · ')[0], d: (SPEC_N[k] || '').split(' · ')[1] || '', on: (specEq || SPECS[Math.max(0, specI)]) === k })); },
    slotNext() { const k = sNext(save, HULLT); snd('menu'); toast(k ? 'SLOT · ' + SPECIAL_NAME[k] + ' ' + ROMAN[(sFit(save).owned[k] || 1) - 1] : 'No specials fitted.', 1.4); emit(true); },
    fitBuy(k) { const r = sBuy(save, k); if (!r.ok) { toast(r.why); return; } specEq = null; snd('shieldUp'); toast(SPECIAL_NAME[k] + ' bought' + (sFit(save).slots.includes(k) ? ' and fitted' : ' · stored: fit it in a slot') + '.', 3); emit(true); },
    fitTier(k) { const r = sTier(save, k); if (!r.ok) { toast(r.why); return; } snd('shieldUp'); toast(SPECIAL_NAME[k] + ' · TIER ' + ROMAN[r.tier - 1], 2.4); emit(true); },
    fitSlot(i) { sCycle(save, HULLT, i); specEq = null; snd('menu'); emit(true); },
    equipSpecial(k) { if (k === null) { specEq = null; toast('TEST OFF · back to your fitted slots', 2); emit(true); return; } if (!SPECS.includes(k)) return; specEq = k; specI = SPECS.indexOf(k); toast('EQUIPPED ON 2 · ' + (SPEC_N[k] || k), 2); emit(true); },
    setCourse(x, z, name, auto) { if (x == null) { St.course = null; St.auto = false; emit(true); return; } St.course = { x: x * CELL, z: z * CELL, name }; St.auto = !!auto; toast((auto ? 'AUTOPILOT · ' : 'COURSE SET · ') + name, 2.4); emit(true); },
    contractTake(id) { const m = St.menu; if (!m) return; const o = MKT.offers(portKey(m.d)).find(x => x.id === id); if (!o) return; if (!MKT.take(o)) { toast('Three contracts at a time.'); return; } snd('pickup'); toast('CONTRACT TAKEN · ' + o.n + ' ' + o.name + ' to ' + o.toName + ' within ' + o.mins + ' min.', 3); emit(true); },
    licenceBuy() { if (MKT.licence()) return; if (!save.spend(LICENCE_COST)) { toast('The FRONTIER LICENCE costs ' + LICENCE_COST + ' gold.'); return; } MKT.buyLicence(); snd('shieldUp'); toast('FRONTIER LICENCE · frontier goods now sell at full price.', 3); emit(true); },
    setStick(x, y) { input.jx = x; input.jy = y; },
    setHudPad(on) { St.hudPad = !!on; if (on) input.jx = input.jy = 0; },
    tugCall() { tugCall(); }, tugLater() { tugLater(); },
    setPaused(on) { St.paused = !!on; if (on) { input.jx = input.jy = 0; keys.clear(); St.boostKey = St.boostBtn = false; } },
    talk() { if (AR && AR.on && !St.unhackT) return;   /* s598c arena: no docking / landing (s598w: UNHACK still works) */ if (St.phase === 'walk') { WALK.talk(); emit(true); return; } if (St.phase === 'cabin') { if (CAB.talk() === 'fly') api.flyShip(); emit(true); return; } if (St.phase !== 'free' || St.menu) return; if (yardPost()) { openMenu(YARD_D); St.menu.tab = 'trade'; emit(true); return; } { const rw = rivalPost(); if (rw) { openMenu({ key: rw.key, port: rw.key, tkey: rw.key, name: names[rw.key] || rw.name, station: true, open: false, x: rw.x, z: rw.z }); St.menu.tab = 'trade'; emit(true); return; } }   /* s599 the Fleet trade post */ if (St.padHere) { beginLand(St.padHere); emit(true); return; }   /* s442 land on an install pad */ if (St.dockable && WALK.canWalk(St.dockable) && !fleets.atWar(St.dockable.tkey || St.dockable.key)) { beginLand(St.dockable); emit(true); return; } /* s417: DOCK AT MERU = straight into the landing */ if (St.depot) { refuel(); return; } if (!St.tow && !St.dockable && !St.unhackT && window.__spaceSplit && window.__spaceSplit.talk()) { emit(true); return; } if ((St.tow || !St.yardZ) && !St.dockable && !St.unhackT && deep.talk()) return; if (St.yardZ) { const z = St.yardZ; St.menu = { yard: true, d: { key: z.wkey, name: z.wname + ' SHIPYARD', x: z.x, z: z.z }, prog: null }; St.vx = St.vz = 0; emit(true); return; } if (St.unhackT) { combat.unhack(St.unhackT); snd('unhack'); St.unhackT = null; return; } if (St.dockable) openMenu(St.dockable); else if (St.zone && St.zone.kind === 'dock') toast('Too fast. Let the ship slow down first.'); },
    scope() { if (SCOPE && !TU.on) SCOPE.toggle(); },   /* s574 THE SCOPE (HUD: banner scope icon, the menu circle when foes are near, menu ENTER SCOPE; Q / 4) */
    melee() { if (SCOPE && SCOPE.on) return; if (TU.on) { TU.held = true; return; } if (St.phase !== 'free' || St.cool1 > 0) return; St.cool1 = 0.16 / MOD.rate / (DMG ? DMG.rateK() : 1); fire(false); snd('laser', { v: 0.55 }); },
    meleeUp() { TU.held = false; },
    turret() { if (TU.on) TU.exit(); else TU.enter(); },
    testShip() { if (St.phase !== 'free' && St.phase !== 'start') return null; TU.exit(); const ALL = ['ship', 'hullShuttle', 'hullCorvette', 'hullGunship', 'hullFlagWalk'],   /* s566d (Ben): SCOUT + the walk-in ships */ nx = ALL[(ALL.indexOf(HULLT) + 1) % ALL.length]; buildShip(nx); glowPop(St.x, 0.5, St.z, 0x7df9ff, 14); emit(true); return nx; },   // s566 TEST: cycle every hull (not saved)
    get hullName() { return HULLT; },
    _fleet() { return { AR, get beasts() { return beasts; }, St, TU, SH, shots, buildShip, beginLand, docks, WALK, ROSTER, get ship() { return SHIP3; }, get hull() { return HULLT; }, get pilot() { return PILOT; }, get combat() { return combat; }, get scope() { return SCOPE; }, special: k => special(k) }; },
    swapFox() { if (St.phase !== 'free' || St.menu || ROSTER.length < 2) { if (ROSTER.length < 2) toast('ONE SHIP IN YOUR FLEET. Tick FLY THIS HULL (FLEET) for a walk-in ship in the Space Install Workshop.', 3.5); return; } TU.exit(); const nx = ROSTER[(ROSTER.indexOf(HULLT) + 1) % ROSTER.length]; buildShip(nx); try { localStorage.setItem('space.flyNow', nx); } catch (e) {} snd('teleport', { v: 0.5 }); glowPop(St.x, 0.5, St.z, 0x7df9ff, 14); toast('NOW FLYING · ' + ({ ship: 'SCOUT', hullShuttle: 'SHUTTLE', hullCorvette: 'CRUISER', hullGunship: 'GUNNER', hullFlagWalk: 'FLAGSHIP' }[nx] || nx), 2.4); emit(true); },
    towing() { return !!(St.tractor || St.tow || beltTow.length || (splits && splits.towing)); },
    releaseTow() { let any = false; if (St.tractor) { bubbleStun(St.tractor); St.tractor._tb = false; St.tractor = null; St.tbBk = 0; snd('boostEnd', { v: 0.35 }); any = true; } if (St.tow) { deep.release(); toast('Tractor off. The wreck drifts here.', 2); snd('boostEnd', { v: 0.4 }); any = true; } St.tractorHeld = false; if (beltRelease()) any = true; if (splits && splits.releaseAll && splits.releaseAll()) any = true; emit(true); return any; },
    range() { if (SCOPE && SCOPE.on) return; if (St.phase !== 'free') return; if (api.towing()) { St.b2Rel = true; api.releaseTow(); return; }   /* s597i (Ben): a tow STAYS on until you press 2 again; one thing at a time; no specials while towing */ St.b2Down = true; St.b2Hold = false; clearTimeout(St.b2Tm);   /* s597c (Ben): TAP 2 = the special fires on RELEASE · HOLD 2 (0.25 s) = TRACTOR BEAM while held */
      St.b2Tm = setTimeout(() => { if (!St.b2Down) return; St.b2Hold = true; api.tractorTry(); }, 250); },
    tractorTry() { if (St.phase !== 'free' || api.towing()) return; if (deep.tractor()) { St.tractorHeld = true; emit(true); return; }
      if ((splits.grab && splits.grab(55)) || beltGrab(55)) { emit(true); return; }   /* s597e asteroids: latched, they ride behind you to the mine */
      { let T = combat.tractorTarget(St.x, St.z, St.h, 55, 99);   /* s597d TEST: any ship, or a creature if one is nearer */
        { const fx = Math.sin(St.h), fz = -Math.cos(St.h); let bc = null, bs = T ? Math.hypot(T.x - St.x, T.z - St.z) * 1.0 : 1e9; for (const cr of (beasts && beasts.list) || []) { if (cr.dead) continue; const dx = cr.x - St.x, dz = cr.z - St.z, d = Math.hypot(dx, dz); if (d > 55 || d < 1) continue; const sc = d * ((dx * fx + dz * fz) / d > 0.55 ? 1 : 2.5); if (sc < bs) { bs = sc; bc = cr; } } if (bc) { T = bc; T._tb = true; } } if (T && T.tooBig) { if (!St.tbWarn || St.t > St.tbWarn) { St.tbWarn = St.t + 3; toast('TOO BIG for your tractor. It holds ships your size or smaller.', 2.2); } } else if (T) { St.tractor = T; St.tbT0 = St.t; St.tractorHeld = true; snd('holster', { v: 0.8 }); if (!St.tbMet) { St.tbMet = true; toast('TRACTOR LOCK! It is stunned and in tow. Fire your lasers (1). Press 2 to let go.', 3); } emit(true); return; } if (!T) { toast('TRACTOR BEAM · nothing in reach. Get closer to a rock, ship or wreck.', 1.8); snd('denied', { v: 0.4 }); } } },   /* s594 (Ben): PRESS + HOLD SPECIAL near a wreck / ship = TRACTOR BEAM; let go = it disengages */
    fireSpecial() { if (St.cool2 > 0) return; if (api.towing()) { toast('No specials while towing. Press 2 to let go.', 1.6); return; } if (specEq) { St.cool2 = 0.35 / (DMG ? DMG.rateK() : 1); special(specEq); return; }   /* s604: the Bridge TEST pick wins; else your ACTIVE SLOT (fitting shop) */
      const k = sActive(save, HULLT); if (!k) { toast('No special fitted. Fit one at any SHIPYARD.', 2); return; } const P = SPECIAL_SHOP[k], t = sFit(save).owned[k] || 1; if (St.en < P[2]) { toast('NOT ENOUGH ENERGY · ' + P[2] + ' EN', 1.4); snd('denied', { v: 0.5 }); return; }
      St.en -= P[2]; St.cool2 = P[3] * TIER_CD[t - 1] / (DMG ? DMG.rateK() : 1); const ms = MOD.special || 1; MOD = { ...MOD, special: ms * TIER_K[t - 1] }; try { special(k, true); } finally { MOD = { ...MOD, special: ms }; } },   /* s581: a weapon EQUIPPED from the scope fires every time; none = the old test cycle */   /* s568 TEST: each press = the next special weapon (old: torpedo, 15 energy) */
    rangeUp() { clearTimeout(St.b2Tm); if (St.b2Rel) { St.b2Rel = false; St.b2Down = St.b2Hold = false; return; } const tap = St.b2Down && !St.b2Hold; St.b2Down = St.b2Hold = false; if (tap && St.phase === 'free' && !(SCOPE && SCOPE.on)) api.fireSpecial(); },
    jump() { St.boostBtn = true; }, jumpUp() { St.boostBtn = false; },
    useItem(id) { useShipItem(SHIP_ITEMS.some(x => x[0] === id) ? id : null); }, closeWheel() {}, choose() {}, closeDialog() { St.say = null; emit(true); }, nextLine() { St.say = null; emit(true); }, clearToast() { St.toast = null; },
    skipTime() {}, cycleWeather() {}, toggleSound() { window.__8gMuted = !window.__8gMuted; if (!window.__8gMuted) musicStart(); toast(window.__8gMuted ? 'SOUND OFF' : 'SOUND ON', 1.4); },
    eyeLook(dx) { if (TU.on) TU.drag = (TU.drag || 0) + dx * 0.008; }, eyeRelease() {}, togglePov() { if (TU.on) { TU.view = TU.view === 'top' ? 'dome' : 'top'; toast('TURRET VIEW · ' + (TU.view === 'top' ? 'ABOVE' : 'DOME'), 1.4); return false; } setCamMode(CAM_MODES[(CAM_MODES.indexOf(camMode) + 1) % CAM_MODES.length]); return false; }, setCamMode, getCamMode() { return camMode; }, lookBy(dx) { if (TU.on) TU.drag = (TU.drag || 0) + dx * 0.006; },
    zoomBy(f) { St.dist = clamp(St.dist * f, 0.55, 2.2); }, getCam() { return { dist: St.dist, pitch: 1.08 }; }, setCam(d) { if (d != null) St.dist = clamp(d, 0.55, 2.2); },
    mapData() { const open = docks.filter(d => d.open); let q = open[0], qd = 1e9; for (const d of open) { const dd = Math.hypot(d.x - St.x, d.z - St.z); if (dd < qd) { qd = dd; q = d; } }
      if (St.fuel < 25) { let bd = 1e9, b = null; for (const p of depots) { const dd = Math.hypot(p.x - St.x, p.z - St.z); if (dd < bd) { bd = dd; b = p; } } if (b) q = { x: b.x, z: b.z, name: b.name.replace(' FUEL DEPOT', '') + ' fuel' }; }
      { const ev = EVT && EVT.course && EVT.course(); if (ev && St.fuel >= 25) q = ev; }   /* s603 event marker */
      const crs = deep.course(); if (crs && St.fuel >= 25) q = crs; if (DMG && DMG.navOff()) q = null;
      return { p: [St.x, St.z, St.h], indoor: false, b: [...bodies.map(b => [EXP && EXP.uncharted(b.key) ? 'Uncharted world' : names[b.key] || b.name, b.x, b.z]), ...STATIONS.map(q => [q.name, q.x, q.z]), ...deep.bases.filter(b => b.known).map(b => [b.name + (b.razed ? ' (razed)' : ' base'), b.x, b.z])], f: [], e: [...combat.list, ...beasts.list].map(p => [p.x, p.z]), q: q ? [q.x, q.z, q.name + (St.fuel < 25 ? '' : ' dock')] : null }; },
    setMinimap(c) { mini = c || null; },
    setName(key, nm) { nm = String(nm || '').trim().toUpperCase().slice(0, 14); const fr = St.nameAsk && St.nameAsk.frontier; St.nameAsk = null;
      if (fr) { if (nm) { names[key] = nm; try { localStorage.setItem(NAMES, JSON.stringify(names)); } catch (e) {} deep.relabelWorld(key); toast('NEW WORLD CHARTED · ' + nm + '.', 3.5); } emit(true); return; }   /* s605 frontier: the sacred name stays unless you change it */
      if (nm) { rename(key, nm); toast('Welcome to ' + nm + '.'); } emit(true); },
    buoyClaim() { EXP && EXP.claim(); emit(true); },
    dockRepair() { const m = St.menu; if (!m || m.yard) return; const miss = Math.max(0, Math.round((St.hullMax || 100) - St.hull)), n = DMG ? DMG.list.length : 0; if (!miss && !n) return; const cost = DMG ? DMG.repairCost(miss) : Math.ceil(miss / 2); if (!save.spend(cost)) { toast('Repairs cost ' + cost + ' G.', 2.4); return; } St.hull = St.hullMax; DMG && DMG.fixAll(); SH.restore(); snd('refuel'); toast('REPAIRED · hull full' + (n ? ', ' + n + ' system' + (n > 1 ? 's' : '') + ' fixed' : '') + ' · -' + cost + ' G', 3.5); emit(true); },
    damageTest(k) { if (!DMG) return; if (k === 'all') { for (const [q] of DMG.SYS) DMG.D.sys[q] = 1; DMG.onChange('shields', true); } else if (k) { DMG.D.sys[k] = 1; DMG.onChange(k, true); } else DMG.fixAll(); emit(true); }, buoyCourse() { EXP && EXP.course(); emit(true); }, buoyClose() { EXP && EXP.close(); emit(true); },
    skipName() { St.nameAsk = null; emit(true); },
    setOptions(o) { ink.visible = o.outlines !== false; },
    destroy() { dead = true; LOFI.stop(); for (const v of Object.values(ENG)) v && v.stop(); removeEventListener('pointerdown', engStart); removeEventListener('keydown', engStart); removeEventListener('pointerdown', musicStart); removeEventListener('keydown', musicStart); removeEventListener('pointerdown', humStart); removeEventListener('keydown', humStart); try { HUM.ctx && HUM.ctx.close(); } catch (e) {} cancelAnimationFrame(raf); removeEventListener('keydown', onCamKey); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); renderer.dispose(); renderer.domElement.remove(); if (window.__8G_GAME === api) window.__8G_GAME = null; },
    get state() { return St; }, get combat() { return combat; }, get deep() { return deep; }, get nests() { return nests; }, get beasts() { return beasts; },
  };
  return api;
}
