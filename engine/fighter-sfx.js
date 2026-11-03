// s191 FIGHTER SOUNDS (Ben): one synth sound kit for the fighter gear, shared by every map that uses engine/fighter-gear.js
// (Meru 2 walk, Pearl Sail 3D, Salt Building, any new battle map). Tuned in Fighter Gear Lab → SOUNDS; saved in localStorage 'fighter.sfx'.
// Mostly Web Audio synths (light on phones) + Ben's recorded sword sounds in audio/sword/ (s239). The game's mute (engine/mute-all.js) silences it like everything else.
//   SFX.play('cut') · SFX.loopStart('charge') · SFX.loopLevel(0..1) · SFX.loopStop() · SFX.get() / SFX.set(evt, { s, v, p }) / SFX.reset()
export const SFX_EVENTS = [
  { key: 'draw', label: 'DRAW SWORD', styles: ['recDraw', 'shink', 'shing', 'whoosh', 'click', 'off'] },
  { key: 'sheath', label: 'SHEATH SWORD', styles: ['recSheath', 'click', 'shink', 'swish', 'off'] },
  { key: 'cut', label: 'SWORD CUT', styles: ['recSwing', 'whoosh', 'shing', 'swish', 'zap', 'off'] },
  { key: 'spin', label: 'SPIN CUT', styles: ['recSwing', 'whoosh', 'shing', 'swish', 'zap', 'off'] },
  { key: 'charge', label: 'POWER CHARGE (hold)', styles: ['hum', 'rising', 'crackle', 'off'] },
  { key: 'power', label: 'POWER SWING', styles: ['boom', 'shing', 'zap', 'off'] },
  { key: 'laser', label: 'LASER SHOT', styles: ['recLaser', 'blaster', 'pew', 'zap', 'off'] },
  { key: 'holster', label: 'LASER HOLSTER', styles: ['click', 'swish', 'off'] },
  { key: 'punch', label: 'PUNCH', styles: ['whoosh', 'thud', 'swish', 'off'] },
  { key: 'kick', label: 'KICK', styles: ['thud', 'whoosh', 'off'] },
  { key: 'shield', label: 'SHIELD HIT', styles: ['ping', 'glass', 'zap', 'thud', 'off'] },
  { key: 'shieldDown', label: 'SHIELD DOWN', styles: ['boom', 'glass', 'zap', 'off'] },
  { key: 'shieldUp', label: 'SHIELD UP', styles: ['rise', 'ping', 'shing', 'off'] },
  { key: 'hurt', label: 'BEN HIT (no shield)', styles: ['hurt', 'thud', 'off'] },
  { key: 'lowHp', label: 'LOW HP HEARTBEAT', styles: ['heart', 'off'] },
  { key: 'pickup', label: 'POWER-UP PICKUP', styles: ['chime', 'rise', 'ping', 'off'] },
  { key: 'botAim', label: 'ROBOT · TARGET LOCK', styles: ['beep', 'servo', 'off'] },
  { key: 'botWind', label: 'ROBOT · WIND-UP / CHARGE', styles: ['whine', 'servo', 'off'] },
  { key: 'botShot', label: 'ROBOT · LASER SHOT', styles: ['recBotLaser', 'enemyzap', 'pew', 'zap', 'off'] },
  { key: 'botLunge', label: 'ROBOT · LUNGE / PUNCH', styles: ['punchbot', 'servo', 'whoosh', 'off'] },
  { key: 'botBash', label: 'SHIELD ROBOT · BASH', styles: ['bash', 'thud', 'off'] },
  { key: 'botBlock', label: 'SHIELD ROBOT · SHIELD HIT', styles: ['clang', 'forcefield', 'ping', 'off'] },
  { key: 'botShieldBreak', label: 'SHIELD ROBOT · SHIELD BREAKS', styles: ['glass', 'boom', 'off'] },
  { key: 'botStagger', label: 'ROBOT · STAGGERED', styles: ['spark', 'servo', 'off'] },
  { key: 'swordHit', label: 'SWORD HITS A ROBOT', styles: ['recMetal', 'slice', 'clank', 'shing', 'off'] },
  { key: 'hitSword', label: 'SWORD HITS A SWORD', styles: ['recSword', 'recMetal', 'shing', 'off'] },
  { key: 'hitMetal', label: 'SWORD HITS METAL', styles: ['recMetal', 'clank', 'shing', 'off'] },
  { key: 'hitWood', label: 'SWORD HITS WOOD', styles: ['recWood', 'thud', 'off'] },
  { key: 'hitStone', label: 'SWORD HITS STONE', styles: ['recStone', 'clank', 'off'] },
  { key: 'hitFlesh', label: 'SWORD HITS A CREATURE', styles: ['recFlesh', 'slice', 'thud', 'off'] },
  { key: 'hitCloth', label: 'SWORD HITS CLOTH', styles: ['recCloth', 'swish', 'off'] },
  { key: 'laserHitMetal', label: 'LASER HITS METAL', styles: ['recLzMetal', 'sizzle', 'off'] },
  { key: 'laserHitWood', label: 'LASER HITS WOOD', styles: ['recLzWood', 'sizzle', 'off'] },
  { key: 'laserHitStone', label: 'LASER HITS STONE / GLASS', styles: ['recLzStone', 'recLzStone2', 'recLzStone3', 'sizzle', 'off'] },
  { key: 'laserHitCloth', label: 'LASER HITS CLOTH / PLANTS', styles: ['recLzCloth', 'sizzle', 'off'] },
  { key: 'laserHitFlesh', label: 'LASER HITS A CREATURE', styles: ['recLzFlesh', 'sizzle', 'off'] },
  { key: 'laser3', label: 'LASER SHOT · TRIPLE SHOT', styles: ['recLaser3', 'recLaser', 'blaster', 'off'] },
  { key: 'laserHit', label: 'LASER HITS A ROBOT', styles: ['recLzThick', 'recLzThin', 'recLzMetal', 'sizzle', 'clank', 'zap', 'off'] },
  { key: 'botHit', label: 'ROBOT · HIT (other)', styles: ['clank', 'thud', 'off'] },
  { key: 'botStep', label: 'WALKING ROBOT · FOOTSTEP', styles: ['recWalk', 'metalstep', 'stomp', 'clank', 'off'] },
  { key: 'stompHeavy', label: 'BLASTER WALKER · HEAVY STEP THUD', styles: ['stomp', 'metalstep', 'off'] },
  { key: 'botTread', label: 'GLOVE ROBOT · TANK TREADS', styles: ['recTank', 'tread', 'servo', 'off'] },
  { key: 'botHum', label: 'DRONE · ROTOR WHIR', styles: ['recDrone', 'rotor', 'buzz', 'whine', 'off'] },
  { key: 'botVoice', label: 'ROBOT · SPOTS YOU (voice line)', styles: ['recVoice', 'chirp', 'off'] },
  { key: 'botChirp', label: 'ROBOT · VOICE CHIRP', styles: ['chirp', 'beep', 'off'] },
  { key: 'botCharge', label: 'ROBOT · LASER CHARGE-UP', styles: ['chargeup', 'whine', 'off'] },
  { key: 'botPop', label: 'ROBOT · POPS UP', styles: ['servo', 'clank', 'off'] },
  { key: 'botSwoop', label: 'DRONE · DIVE', styles: ['dive', 'whoosh', 'off'] },
  { key: 'kill', label: 'OPPONENT DESTROYED', styles: ['recExplode', 'crunch', 'pop', 'boom', 'zap', 'off'] },
  { key: 'gate', label: 'GATE DESTROYED', styles: ['recGate', 'bigboom', 'boom', 'glass', 'off'] }];
const FINAL_SHARED = {"draw":{"s":"recDraw","v":1,"p":1},"sheath":{"s":"recSheath","v":1,"p":1},"cut":{"s":"recSwing","v":1,"p":1},"spin":{"s":"recSwing","v":1.1,"p":0.85},"charge":{"s":"hum","v":0.6,"p":1.8},"power":{"s":"boom","v":1,"p":1},"laser":{"s":"recLaser","v":1,"p":1},"holster":{"s":"click","v":0.6,"p":1.2},"punch":{"s":"whoosh","v":0.6,"p":1.3},"kick":{"s":"thud","v":0.8,"p":1},"shield":{"s":"ping","v":0.7,"p":1},"shieldDown":{"s":"glass","v":0.9,"p":1},"shieldUp":{"s":"rise","v":0.6,"p":1},"hurt":{"s":"hurt","v":0.8,"p":1},"lowHp":{"s":"heart","v":0.6,"p":1},"pickup":{"s":"chime","v":0.7,"p":1},"botAim":{"s":"beep","v":0.5,"p":1},"botWind":{"s":"whine","v":0.55,"p":1},"botShot":{"s":"recBotLaser","v":0.8,"p":1},"botLunge":{"s":"punchbot","v":0.7,"p":1},"botBash":{"s":"bash","v":0.8,"p":1},"botBlock":{"s":"clang","v":0.75,"p":1},"botShieldBreak":{"s":"glass","v":0.9,"p":0.8},"botStagger":{"s":"spark","v":0.6,"p":1},"swordHit":{"s":"recMetal","v":1.3,"p":1},"laserHit":{"s":"recLzThick","v":1.2,"p":1},"botHit":{"s":"clank","v":0.55,"p":1},"botSwoop":{"s":"dive","v":0.6,"p":1},"botStep":{"s":"recWalk","v":0.8,"p":1},"botTread":{"s":"off","v":0.8,"p":1},"botHum":{"s":"recDrone","v":0.7,"p":1},"botChirp":{"s":"chirp","v":0.45,"p":1},"botCharge":{"s":"chargeup","v":0.55,"p":1},"botPop":{"s":"servo","v":0.55,"p":1.2},"kill":{"s":"recExplode","v":1.3,"p":1},"gate":{"s":"recGate","v":1.3,"p":1}};   /* s252 Ben's final shared FIGHTER SOUNDS */
const DEF0 = { draw: { s: 'recDraw', v: 1, p: 1 }, sheath: { s: 'recSheath', v: 1, p: 1 }, cut: { s: 'recSwing', v: 1, p: 1 }, spin: { s: 'recSwing', v: 1.1, p: 0.85 },
  hitSword: { s: 'recSword', v: 1.3, p: 1 }, hitMetal: { s: 'recMetal', v: 1.3, p: 1 }, hitWood: { s: 'recWood', v: 1.3, p: 1 }, hitStone: { s: 'recStone', v: 1.3, p: 1 }, hitFlesh: { s: 'recFlesh', v: 1.3, p: 1 }, hitCloth: { s: 'recCloth', v: 1.3, p: 1 },
  charge: { s: 'hum', v: 0.6, p: 1 }, power: { s: 'boom', v: 1, p: 1 }, laser: { s: 'recLaser', v: 1, p: 1 }, holster: { s: 'click', v: 0.6, p: 1.2 },
  punch: { s: 'whoosh', v: 0.6, p: 1.3 }, kick: { s: 'thud', v: 0.8, p: 1 },
  shield: { s: 'ping', v: 0.7, p: 1 }, shieldDown: { s: 'glass', v: 0.9, p: 1 }, shieldUp: { s: 'rise', v: 0.6, p: 1 },
  hurt: { s: 'hurt', v: 0.8, p: 1 }, lowHp: { s: 'heart', v: 0.6, p: 1 }, pickup: { s: 'chime', v: 0.7, p: 1 },
  botAim: { s: 'beep', v: 0.5, p: 1 }, botWind: { s: 'whine', v: 0.55, p: 1 }, botShot: { s: 'recBotLaser', v: 0.8, p: 1 }, botLunge: { s: 'punchbot', v: 0.7, p: 1 },
  botBash: { s: 'bash', v: 0.8, p: 1 }, botBlock: { s: 'clang', v: 0.75, p: 1 }, botShieldBreak: { s: 'glass', v: 0.9, p: 0.8 }, botStagger: { s: 'spark', v: 0.6, p: 1 },
  swordHit: { s: 'recMetal', v: 1.3, p: 1 }, laserHit: { s: 'recLzThick', v: 1.2, p: 1 }, laser3: { s: 'recLaser3', v: 1, p: 1 }, laserHitMetal: { s: 'recLzMetal', v: 1.2, p: 1 }, laserHitWood: { s: 'recLzWood', v: 1.2, p: 1 }, laserHitStone: { s: 'recLzStone', v: 1.2, p: 1 }, laserHitCloth: { s: 'recLzCloth', v: 1.2, p: 1 }, laserHitFlesh: { s: 'recLzFlesh', v: 1.2, p: 1 },
  botHit: { s: 'clank', v: 0.55, p: 1 }, botSwoop: { s: 'dive', v: 0.6, p: 1 }, botStep: { s: 'recWalk', v: 0.8, p: 1 }, botTread: { s: 'off', v: 0.8, p: 1 }, botHum: { s: 'recDrone', v: 0.7, p: 1 }, botVoice: { s: 'recVoice', v: 1, p: 1 }, stompHeavy: { s: 'stomp', v: 1.1, p: 0.8 }, botChirp: { s: 'chirp', v: 0.45, p: 1 }, botCharge: { s: 'chargeup', v: 0.55, p: 1 }, botPop: { s: 'servo', v: 0.55, p: 1.2 },
  kill: { s: 'recExplode', v: 1.3, p: 1 }, gate: { s: 'recGate', v: 1.3, p: 1 } }; const DEF = { ...DEF0, ...FINAL_SHARED, scopeIn: { s: 'recScopeIn', v: 1.6, p: 1 }, scopeTag: { s: 'recScopeTag', v: 1.4, p: 1 }, scopeOut: { s: 'recScopeOut', v: 1.5, p: 1 }, freed: { s: 'recFreed', v: 1.6, p: 1 }, glitch: { s: 'recGlitch', v: 1.6, p: 1 } };
const KEY = 'fighter.sfx';
const last = {};
let cfg = load(), ctx = null, out = null, noiseBuf = null, loop = null;
function load() { let o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  if (!o._s247) { o.laserHit = { ...(o.laserHit || {}), s: 'recLzThick' }; o._s247 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  if (!o._s246) { o.laserHit = { ...(o.laserHit || {}), s: 'recLzMetal', v: 1.2, p: 1 }; o._s246 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }   /* s246 Ben's recorded laser hits */
  if (!o._s242) { for (const k of ['kill', 'gate', 'swordHit', 'hitMetal', 'hitWood', 'hitStone', 'hitFlesh', 'hitCloth', 'hitSword']) if (o[k]) o[k].v = Math.max(o[k].v || 1, 1.3); o._s242 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  if (!o._s241) { o.botTread = { ...(o.botTread || {}), s: 'off' }; o._s241 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }   /* s241 Ben: tank sound off for now */
  if (!o._s240) { for (const [k, st, v] of [['laser', 'recLaser', 1], ['botShot', 'recBotLaser', 0.8], ['botStep', 'recWalk', 0.8], ['botTread', 'recTank', 0.8], ['botHum', 'recDrone', 0.7], ['kill', 'recExplode', 1], ['gate', 'recGate', 1]]) o[k] = { ...(o[k] || {}), s: st, v, p: 1 }; o._s240 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }   /* s240 Ben's recorded laser + robot sounds */
  if (!o._s239) { for (const [k, st] of [['draw', 'recDraw'], ['sheath', 'recSheath'], ['cut', 'recSwing'], ['spin', 'recSwing'], ['swordHit', 'recMetal']]) o[k] = { ...(o[k] || {}), s: st, v: k === 'spin' ? 1.1 : 1, p: k === 'spin' ? 0.85 : 1 }; o._s239 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }   /* s239 Ben's recorded sword sounds */
  if (!o._s219) { if (o.botStep && o.botStep.s === 'stomp') o.botStep.s = 'metalstep'; if (o.botHum && o.botHum.s === 'buzz') o.botHum.s = 'rotor'; o._s219 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  if (!o._s202) { if (o.cut && o.cut.v != null) o.cut.v = Math.min(3, o.cut.v * 2); if (o.spin && o.spin.v != null) o.spin.v = Math.min(3, o.spin.v * 2); if (o.laser && o.laser.v != null) o.laser.v = Math.min(3, o.laser.v * 1.25); o._s202 = 1; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }   /* s202 Ben: sword x2, laser +25% */ const r = { _s202: 1, _s219: 1, _s239: 1, _s240: 1, _s241: 1, _s242: 1, _s246: 1, _s247: 1 }; for (const k in DEF) r[k] = { ...DEF[k], ...(o[k] || {}) }; return r; }
try { addEventListener('storage', e => { if (e.key === KEY) cfg = load(); }); } catch (e) {}
// s239 BEN'S RECORDED SWORD SOUNDS (audio/sword/*.mp3): fetched once at load, decoded when audio starts, played with pitch = rate and a little random variation
const REC = { recDraw: ['sword/draw'], recSheath: ['sword/sheath'], recSwing: ['sword/swing'], recSword: ['sword/hit-sword'], recMetal: ['sword/hit-metal-1', 'sword/hit-metal-2'], recWood: ['sword/hit-wood-1', 'sword/hit-wood-2'], recStone: ['sword/hit-stone'], recFlesh: ['sword/hit-flesh'], recCloth: ['sword/hit-cloth'],
  recLaser: ['robots/laser'], recLzMetal: ['laser/hit-metal'], recLzThin: ['laser/hit-metal-thin'], recLzThick: ['laser/hit-metal-thick'], recLaser3: ['laser/shot-3#0.08-0.8', 'laser/shot-3#0.9-1.75', 'laser/shot-3#1.95-2.75'], recPlasmaWind: ['robots/plasma-cannon#0-1.55'], recPlasmaFire: ['robots/plasma-cannon#1.55-4.5'], recPlasma: ['robots/plasma-cannon#0-4.5'], recBoxerPunch: ['robots/boxer-punch#2.7-3.32'], recLzWood: ['laser/hit-wood'], recLzStone: ['laser/hit-stone#0.1-0.7'], recLzStone2: ['laser/hit-stone#1.22-1.8'], recLzStone3: ['laser/hit-stone#2.35-2.95'],   /* s249 the file had 3 impacts: one per style */ recLzCloth: ['laser/hit-cloth'], recLzFlesh: ['laser/hit-flesh', 'laser/hit-flesh-2'], recBotLaser: ['robots/bot-laser'], recExplode: ['robots/explode'], recGate: ['robots/gate-closed'], recVoice: ['robots/voice-help', 'robots/voice-cleanup', 'robots/voice-biologics', 'robots/voice-angry'], recVoiceHelp: ['robots/voice-help'], recVoiceCleanup: ['robots/voice-cleanup'], recVoiceBiologics: ['robots/voice-biologics'], recVoiceAngry: ['robots/voice-angry'],
  recWalk: ['robots/robot-walk'], recTank: ['robots/tank-roll'], recDrone: ['robots/drone-hover'],
  /* s695 BEN'S RUNWAY ROBOT SOUNDS (ROBOT_SOUND_PROMPTS.md → audio/robots/): levelled + trimmed on load, loops crossfaded */
  recTankIdle: ['robots/tank-idle'], recTankTurn: ['robots/tank-turn'], recTankWind: ['robots/tank-windup'], recTankLunge: ['robots/tank-lunge'], recCannonCharge: ['robots/tank-cannon-charge'], recCannonFire: ['robots/tank-cannon-fire-1', 'robots/tank-cannon-fire-2', 'robots/tank-cannon-fire-3'], recTankPop: ['robots/tank-pop'],
  recDroneFly: ['robots/drone-fly'], recDroneAim: ['robots/drone-aim'], recDroneCharge: ['robots/drone-charge'], recDroneShot: ['robots/drone-shot-1', 'robots/drone-shot-2', 'robots/drone-shot-3'], recDroneWarn: ['robots/drone-dive-warn'], recDroneDive: ['robots/drone-dive'], recDroneFall: ['robots/drone-fall'],
  recWalkStep: ['robots/walker-step-1', 'robots/walker-step-2', 'robots/walker-step-3', 'robots/walker-step-4'], recWalkIdle: ['robots/walker-shuffle'], recWalkWind: ['robots/walker-windup'], recWalkBash: ['robots/walker-bash'], recWalkBlock: ['robots/walker-block-1', 'robots/walker-block-2', 'robots/walker-block-3'], recShieldBreak: ['robots/walker-shield-break'], recStagger: ['robots/walker-stagger'], recWalkAim: ['robots/walker-aim'],
  recChirp: ['robots/robot-chirp-1', 'robots/robot-chirp-2', 'robots/robot-chirp-3'], recGlitch: ['robots/robot-glitch'], recBotHit: ['robots/robot-hit-1', 'robots/robot-hit-2', 'robots/robot-hit-3'], recBotDown: ['robots/robot-down'], recFreed: ['robots/robot-freed'],
  recScopeIn: ['robots/scope-in'], recScopeTag: ['robots/scope-tag'], recScopeOut: ['robots/scope-out'] };
const REC_GAIN = { recLzStone2: 1.4, recLzStone3: 1.4, recLzThin: 1.4, recLzThick: 1.4, recPlasmaWind: 1.3, recPlasmaFire: 1.4, recPlasma: 1.3, recBoxerPunch: 1.5, recLzMetal: 1.4, recLzWood: 1.4, recLzStone: 1.4, recLzCloth: 1.3, recLzFlesh: 1.4, recVoice: 2.4, recVoiceHelp: 2.4, recVoiceCleanup: 2.4, recVoiceBiologics: 2.4, recVoiceAngry: 2.4, recExplode: 1.5, recGate: 1.3, recMetal: 1.5, recWood: 1.5, recStone: 1.5, recCloth: 1.4, recFlesh: 1.5, recSword: 1.4 };   // s242 Ben: louder explosion + sword hits
const LOOP_STY = { recWalk: 1, recTank: 1, recDrone: 1, recTankIdle: 1, recDroneFly: 1, recWalkIdle: 1 };   // s240 movement sounds = one LOOP per robot, volume follows distance (SFX.near)
const RAW = {}, BUF = {};
for (const names of Object.values(REC)) for (const n0 of names) { const n = n0.split('#')[0]; if (RAW[n]) continue; try { RAW[n] = fetch(new URL('../audio/' + n + '.mp3', import.meta.url)).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null); } catch (e) {} }
// s242 every recording is LEVELLED on load (the files range from peak 0.02 to 0.8) and one-shots lose their leading silence (hits land on the frame)
const LOOPN = { 'robots/robot-walk': 1, 'robots/drone-fly': 1, 'robots/tank-move': 1, 'robots/tank-roll': 1, 'robots/tank-idle': 1, 'robots/drone-hover': 1, 'robots/walker-shuffle': 1, 'laser/shot-3': 1, 'robots/plasma-cannon': 1, 'robots/boxer-punch': 1, 'laser/hit-stone': 1 };   // no trim (loops + files cut into #start-end segments)
function level(n, b) { if (!b) return b; let pk = 0, lead = b.length; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; if (v > 0.02 * Math.max(pk, 0.05) && i < lead && v > 0.004) lead = i; } }
  if (pk < 1e-4) return b; const gain = 0.9 / pk, cut = LOOPN[n] ? 0 : Math.max(0, lead - Math.floor(b.sampleRate * 0.004)), len = b.length - cut; const o = ctx.createBuffer(b.numberOfChannels, len, b.sampleRate);
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c), od = o.getChannelData(c); for (let i = 0; i < len; i++) od[i] = d[i + cut] * gain; } return o; }
function decodeAll() { for (const n in RAW) if (!BUF[n]) BUF[n] = RAW[n].then(ab => ab ? new Promise(res => ctx.decodeAudioData(ab.slice(0), res, () => res(null))) : null).then(b => { b = level(n, b); BUF[n] = b || false; return b; }); }
const DIP_EVT = { botShot: 1, botBash: 1, botLunge: 1, swordHit: 1, laserHit: 1, kill: 1, gate: 1, hurt: 1, botVoice: 1, shield: 1, power: 1 };
const WIND = new Map(), ATTACK_EVT = { botBash: 1, botLunge: 1, botShot: 1, botSwoop: 1, botStagger: 1, kill: 1 };
let lastVoiceN = -1, duck = 1, duckT = 0;
function playRec(style, t, p, v) { const names = REC[style]; let i = (Math.random() * names.length) | 0; if (style === 'recVoice' && names.length > 1 && i === lastVoiceN) i = (i + 1) % names.length; if (style.startsWith('recVoice')) { if (style === 'recVoice') lastVoiceN = i; p = 1; duck = 0.35; clearTimeout(duckT);  } const seg = names[i].split('#'), n = seg[0], b = BUF[n]; if (!b || b instanceof Promise) return; const [s0, s1] = seg[1] ? seg[1].split('-').map(Number) : [0, 0]; if (style.startsWith('recVoice')) duckT = setTimeout(() => { duck = 1; }, b.duration * 1000 / p);
  const src = ctx.createBufferSource(); src.buffer = b; src.playbackRate.value = p; const g = ctx.createGain(); g.gain.value = v * 1.1 * (REC_GAIN[style] || 1); src.connect(g); g.connect(out); if (seg[1]) src.start(t, s0, Math.max(0.05, s1 - s0)); else src.start(t); return { src, g }; }
function ac() { if (ctx) { if (window.__8gMuted) { if (ctx.state === 'running') AudioContext.prototype.suspend.call(ctx).catch(() => {}); out.gain.value = 0; return ctx; } out.gain.value = 0.5; if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }   /* s267 hard mute */
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination); decodeAll();
  const n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return ctx; }
// ---- building blocks ----
const env = (g, t, a, peak, dur) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
function noise(t, dur, type, f0, f1, peak, q = 1, a = 0.01) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); const g = ctx.createGain(); env(g, t, a, peak, dur); s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); }
function osc(t, dur, type, f0, f1, peak, a = 0.005) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); const g = ctx.createGain(); env(g, t, a, peak, dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05); }
const ring = (t, p, v, dur = 0.35) => { for (const [f, k] of [[2200, 1], [3310, 0.6], [5120, 0.35]]) osc(t, dur, 'sine', f * p, f * p * 0.995, 0.12 * v * k, 0.002); };
const R = {
  whoosh: (t, p, v) => noise(t, 0.2, 'bandpass', 380 * p, 2600 * p, 0.55 * v, 1.4, 0.05),
  swish: (t, p, v) => noise(t, 0.15, 'lowpass', 1400 * p, 500 * p, 0.45 * v, 0.7, 0.03),
  shing: (t, p, v) => { noise(t, 0.12, 'highpass', 2500 * p, 6000 * p, 0.3 * v, 0.8, 0.01); ring(t + 0.02, p, v); },
  shink: (t, p, v) => { noise(t, 0.26, 'bandpass', 1800 * p, 7000 * p, 0.35 * v, 3, 0.08); ring(t + 0.22, p * 1.1, v * 0.8, 0.28); },
  zap: (t, p, v) => { osc(t, 0.14, 'sawtooth', 1400 * p, 180 * p, 0.22 * v); noise(t, 0.06, 'highpass', 3000, 5000, 0.15 * v); },
  click: (t, p, v) => { osc(t, 0.03, 'square', 2000 * p, 1600 * p, 0.12 * v, 0.001); osc(t + 0.06, 0.04, 'square', 1400 * p, 1100 * p, 0.14 * v, 0.001); noise(t + 0.06, 0.04, 'bandpass', 3000 * p, 2500 * p, 0.2 * v, 2, 0.002); },
  thud: (t, p, v) => { osc(t, 0.14, 'sine', 140 * p, 50 * p, 0.7 * v, 0.003); noise(t, 0.05, 'lowpass', 900 * p, 300 * p, 0.35 * v, 0.7, 0.003); },
  pew: (t, p, v) => osc(t, 0.1, 'square', 1900 * p, 380 * p, 0.16 * v, 0.002),
  blaster: (t, p, v) => { noise(t, 0.05, 'highpass', 2600 * p, 4000 * p, 0.3 * v, 0.8, 0.002); osc(t, 0.12, 'sawtooth', 900 * p, 160 * p, 0.2 * v, 0.002); osc(t, 0.14, 'sine', 170 * p, 55 * p, 0.45 * v, 0.003); },
  ping: (t, p, v) => { osc(t, 0.22, 'sine', 1500 * p, 1100 * p, 0.25 * v, 0.002); osc(t, 0.12, 'triangle', 760 * p, 600 * p, 0.18 * v, 0.002); noise(t, 0.04, 'highpass', 4000, 6000, 0.12 * v, 0.8, 0.001); },
  glass: (t, p, v) => { noise(t, 0.5, 'highpass', 3000 * p, 1500 * p, 0.45 * v, 0.6, 0.002); for (let i = 0; i < 6; i++) osc(t + i * 0.035, 0.2, 'sine', (2400 + Math.random() * 2600) * p, 1800 * p, 0.08 * v, 0.001); osc(t, 0.3, 'sine', 120 * p, 45 * p, 0.5 * v, 0.004); },
  rise: (t, p, v) => { osc(t, 0.35, 'sine', 300 * p, 1300 * p, 0.2 * v, 0.03); osc(t + 0.05, 0.3, 'triangle', 600 * p, 2000 * p, 0.1 * v, 0.03); },
  // s198 robots + Ben + pickups
  beep: (t, p, v) => { osc(t, 0.05, 'square', 1800 * p, 1800 * p, 0.09 * v, 0.002); osc(t + 0.08, 0.06, 'square', 2400 * p, 2400 * p, 0.09 * v, 0.002); },
  whine: (t, p, v) => { osc(t, 0.4, 'sawtooth', 160 * p, 1100 * p, 0.09 * v, 0.05); osc(t, 0.4, 'sine', 320 * p, 2200 * p, 0.05 * v, 0.05); },
  servo: (t, p, v) => { osc(t, 0.18, 'square', 110 * p, 220 * p, 0.12 * v, 0.01); noise(t, 0.18, 'bandpass', 900 * p, 1400 * p, 0.12 * v, 4, 0.01); },
  enemyzap: (t, p, v) => { osc(t, 0.16, 'sawtooth', 620 * p, 90 * p, 0.2 * v, 0.002); osc(t, 0.16, 'square', 310 * p, 70 * p, 0.08 * v, 0.002); noise(t, 0.05, 'bandpass', 1500, 800, 0.15 * v, 1, 0.002); },
  punchbot: (t, p, v) => { osc(t, 0.12, 'square', 90 * p, 260 * p, 0.12 * v, 0.005); noise(t + 0.02, 0.16, 'bandpass', 500 * p, 1800 * p, 0.35 * v, 1.2, 0.04); osc(t + 0.12, 0.08, 'sine', 150 * p, 60 * p, 0.4 * v, 0.002); },
  bash: (t, p, v) => { noise(t, 0.2, 'lowpass', 1600 * p, 200 * p, 0.6 * v, 0.8, 0.004); osc(t, 0.25, 'sine', 120 * p, 45 * p, 0.7 * v, 0.003); for (const [f, k] of [[420, 1], [1130, 0.5]]) osc(t, 0.3, 'triangle', f * p, f * p * 0.98, 0.1 * v * k, 0.002); },
  clang: (t, p, v) => { for (const [f, k] of [[520, 1], [1390, 0.6], [2710, 0.35], [4100, 0.2]]) osc(t, 0.5, 'sine', f * p, f * p * 0.99, 0.13 * v * k, 0.001); noise(t, 0.05, 'highpass', 3000, 5000, 0.2 * v, 0.7, 0.001); osc(t, 0.35, 'sawtooth', 70 * p, 65 * p, 0.05 * v, 0.01); },
  forcefield: (t, p, v) => { osc(t, 0.3, 'sine', 900 * p, 300 * p, 0.18 * v, 0.003); osc(t, 0.3, 'sawtooth', 60 * p, 58 * p, 0.08 * v, 0.01); noise(t, 0.25, 'bandpass', 2500 * p, 900 * p, 0.12 * v, 3, 0.003); },
  spark: (t, p, v) => { for (let i = 0; i < 6; i++) noise(t + i * 0.045 + Math.random() * 0.02, 0.03, 'highpass', 4000 * p, 6000 * p, 0.25 * v, 0.8, 0.001); osc(t, 0.3, 'square', 180 * p, 90 * p, 0.05 * v, 0.01); },
  clank: (t, p, v) => { for (const [f, k] of [[700, 1], [1870, 0.5], [3300, 0.25]]) osc(t, 0.14, 'sine', f * p, f * p * 0.97, 0.12 * v * k, 0.001); noise(t, 0.04, 'bandpass', 2500 * p, 1500 * p, 0.25 * v, 1, 0.001); },
  dive: (t, p, v) => { osc(t, 0.45, 'sine', 1400 * p, 300 * p, 0.12 * v, 0.02); noise(t, 0.45, 'bandpass', 3000 * p, 600 * p, 0.2 * v, 2, 0.06); },
  hurt: (t, p, v) => { osc(t, 0.12, 'sine', 160 * p, 55 * p, 0.6 * v, 0.002); noise(t, 0.06, 'lowpass', 1200, 300, 0.35 * v, 0.7, 0.002);
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(620 * p, t + 0.02); o.frequency.exponentialRampToValueAtTime(380 * p, t + 0.2); f.type = 'bandpass'; f.frequency.value = 1100 * p; f.Q.value = 3; env(g, t + 0.02, 0.01, 0.2 * v, 0.2); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 0.3); },   // a body thump + a short fox yelp
  heart: (t, p, v) => { osc(t, 0.12, 'sine', 70 * p, 45 * p, 0.6 * v, 0.004); osc(t + 0.18, 0.12, 'sine', 62 * p, 40 * p, 0.45 * v, 0.004); },
  chime: (t, p, v) => { [0, 4, 7, 12].forEach((s, i) => osc(t + i * 0.06, 0.3, 'sine', 880 * p * Math.pow(2, s / 12), 880 * p * Math.pow(2, s / 12), 0.12 * v, 0.003)); },
  slice: (t, p, v) => { noise(t, 0.09, 'highpass', 3500 * p, 7000 * p, 0.4 * v, 0.8, 0.001); for (const [f, k] of [[880, 1], [2350, 0.55], [4100, 0.3]]) osc(t, 0.22, 'sine', f * p, f * p * 0.97, 0.13 * v * k, 0.001); osc(t, 0.08, 'square', 140 * p, 60 * p, 0.25 * v, 0.002); },   // a sharp metal cut + ring
  sizzle: (t, p, v) => { noise(t, 0.18, 'bandpass', 4200 * p, 1800 * p, 0.35 * v, 2.5, 0.001); osc(t, 0.1, 'sawtooth', 1300 * p, 400 * p, 0.12 * v, 0.001); osc(t, 0.06, 'sine', 300 * p, 120 * p, 0.25 * v, 0.002); },   // a hot zap burning into metal
  stomp: (t, p, v) => { osc(t, 0.09, 'sine', 120 * p, 50 * p, 0.55 * v, 0.002); noise(t, 0.05, 'lowpass', 1400 * p, 400 * p, 0.3 * v, 0.8, 0.002); osc(t + 0.01, 0.05, 'square', 900 * p, 700 * p, 0.04 * v, 0.001); },   /* heavy metal foot */
  buzz: (t, p, v) => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(); o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.setValueAtTime(140 * p, t); o.frequency.linearRampToValueAtTime(155 * p, t + 0.35); o2.frequency.value = 143 * p; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900 * p; f.Q.value = 2; const g = ctx.createGain(); env(g, t, 0.06, 0.12 * v, 0.4); o.connect(f); o2.connect(f); f.connect(g); g.connect(out); for (const x of [o, o2]) { x.start(t); x.stop(t + 0.45); } },
  chirp: (t, p, v) => { const n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) { const f0 = (600 + Math.random() * 900) * p; osc(t + i * 0.07, 0.06, 'square', f0, f0 * (Math.random() < 0.5 ? 1.6 : 0.6), 0.07 * v, 0.003); } },   /* R2-ish robot babble */
  chargeup: (t, p, v) => { osc(t, 0.85, 'sawtooth', 220 * p, 1800 * p, 0.08 * v, 0.05); osc(t, 0.85, 'sine', 440 * p, 3600 * p, 0.06 * v, 0.05); for (let i = 0; i < 5; i++) osc(t + i * 0.16, 0.04, 'square', (1200 + i * 300) * p, (1200 + i * 300) * p, 0.05 * v, 0.002); },
  rotor: (t, p, v) => { const d = 0.44, s2 = ctx.createBufferSource(); s2.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100 * p; f.Q.value = 0.9; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    const n = Math.round(d * 26 * p); for (let i = 0; i < n; i++) { const tt = t + i * d / n; g.gain.setValueAtTime(0.03 * v, tt); g.gain.linearRampToValueAtTime(0.26 * v, tt + d / n * 0.25); g.gain.linearRampToValueAtTime(0.03 * v, tt + d / n); }   /* blade chop: fast amplitude flutter */
    g.gain.setValueAtTime(0.03 * v, t + d); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.03); s2.connect(f); f.connect(g); g.connect(out); s2.start(t, Math.random()); s2.stop(t + d + 0.06);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 420 * p; const og = ctx.createGain(); env(og, t, 0.04, 0.05 * v, d); o.connect(og); og.connect(out); o.start(t); o.stop(t + d + 0.05); },   /* drone rotors: chopping air + a motor whine */
  metalstep: (t, p, v) => { osc(t, 0.07, 'sine', 95 * p, 45 * p, 0.45 * v, 0.002); for (const [f, k] of [[620, 1], [1480, 0.6], [2790, 0.35]]) osc(t + 0.004, 0.16, 'sine', f * p, f * p * 0.985, 0.09 * v * k, 0.001); noise(t, 0.035, 'bandpass', 3200 * p, 2000 * p, 0.25 * v, 1.5, 0.001); },   /* metal foot CLANK on a hard floor */
  tread: (t, p, v) => { const d = 0.26; const s2 = ctx.createBufferSource(); s2.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700 * p; f.Q.value = 1; const g = ctx.createGain(); env(g, t, 0.02, 0.32 * v, d); s2.connect(f); f.connect(g); g.connect(out); s2.start(t, Math.random()); s2.stop(t + d + 0.05);
    for (let i = 0; i < 6; i++) { const tt = t + i * d / 6; osc(tt, 0.025, 'square', (180 + Math.random() * 40) * p, 120 * p, 0.07 * v, 0.001); noise(tt, 0.02, 'bandpass', 1800 * p, 1200 * p, 0.09 * v, 3, 0.001); }
    osc(t, d, 'sawtooth', 55 * p, 58 * p, 0.08 * v, 0.03); },   /* tank treads: rumble + clacking track links + a motor drone */
  ...Object.fromEntries(Object.keys(REC).map(k => [k, (t, p, v) => playRec(k, t, p, v)])),   // returns { src, g } so a wind-up can be cut short
  crunch: (t, p, v) => { noise(t, 0.28, 'lowpass', 3200 * p, 300 * p, 0.6 * v, 0.9, 0.003); osc(t, 0.18, 'square', 220 * p, 60 * p, 0.25 * v, 0.002); for (let i = 0; i < 4; i++) osc(t + 0.03 + i * 0.04, 0.05, 'square', (900 + Math.random() * 1400) * p, 300 * p, 0.07 * v, 0.001); },
  pop: (t, p, v) => { osc(t, 0.12, 'sine', 900 * p, 140 * p, 0.5 * v, 0.002); noise(t, 0.1, 'bandpass', 2000 * p, 600 * p, 0.35 * v, 1.2, 0.002); },
  bigboom: (t, p, v) => { noise(t, 0.9, 'lowpass', 3000 * p, 80 * p, 0.85 * v, 0.7, 0.005); osc(t, 0.8, 'sine', 90 * p, 28 * p, 0.95 * v, 0.004); osc(t + 0.05, 0.5, 'sawtooth', 300 * p, 40 * p, 0.2 * v, 0.003); for (let i = 0; i < 5; i++) noise(t + 0.12 + i * 0.07, 0.12, 'bandpass', (1500 + Math.random() * 2500) * p, 500 * p, 0.25 * v, 2, 0.002); ring(t + 0.02, p * 0.6, v * 0.6, 0.7); },
  boom: (t, p, v) => { noise(t, 0.45, 'lowpass', 2400 * p, 120 * p, 0.7 * v, 0.8, 0.01); osc(t, 0.4, 'sine', 110 * p, 38 * p, 0.8 * v, 0.004); ring(t, p * 0.8, v * 0.7, 0.5); },
};
export const SFX = {
  get: () => JSON.parse(JSON.stringify(cfg)), defaults: () => JSON.parse(JSON.stringify(DEF)),
  set(evt, part) { cfg[evt] = { ...cfg[evt], ...part }; try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} },
  reset() { cfg = JSON.parse(JSON.stringify(DEF)); try { localStorage.removeItem(KEY); } catch (e) {} },
  play(evt, o = {}) { if (window.__8gMuted) { ac(); return; } if (window.__8gSfxOff) return;   /* s662q a lab plays its own recorded file instead */ const now = performance.now(), bk = o.bot || (BOT_EVT(evt) ? window.__sfxBot : null),   /* s695c Ben: the player's laser went muffled: the last robot's 'behind a wall' setting leaked onto player sounds; only robot events read it now */ bc = bk ? botCfg(bk, evt) : null, lk = bc ? bk + evt : evt; if (now - (last[lk] || 0) < 45) return; last[lk] = now; const c = bc || cfg[evt]; if (!c || c.s === 'off' || !R[c.s]) return; if (!ac()) return; const t = ctx.currentTime + 0.005; try { const oc = bk ? (o.occ ?? window.__sfxOcc ?? 1) : 1;   /* s263 robots behind walls are muffled */ const h = R[c.s](t, c.p * (o.p || 1) * (0.97 + Math.random() * 0.06), c.v * (o.v ?? 1) * oc); const who = o.inst || window.__sfxInst;
      if (DIP_EVT[evt]) dipLoops(evt === 'botVoice' ? 0.35 : 0.6, evt === 'botVoice' ? 1400 : 250); /* s250 Ben: the WIND-UP sound ends the moment that robot actually attacks */ if (who) { if (evt === 'botWind' || evt === 'botCharge') { if (h && h.src) WIND.set(who, h); } else if (ATTACK_EVT[evt]) { const w = WIND.get(who); if (w) { WIND.delete(who); try { const n = ctx.currentTime; w.g.gain.cancelScheduledValues(n); w.g.gain.setTargetAtTime(0.0001, n, 0.03); w.src.stop(n + 0.15); } catch (e) {} } } } } catch (e) {} },
  // the charge sound runs while the button is held: loopLevel(c) bends it up as the blade fills
  loopStart(evt = 'charge') { SFX.loopStop(); const c = cfg[evt]; if (!c || c.s === 'off' || !ac()) return; const t = ctx.currentTime, g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25 * c.v, t + 0.12); g.connect(out);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 4; f.connect(g);
    const a = ctx.createOscillator(), b = ctx.createOscillator(); a.type = c.s === 'rising' ? 'sine' : 'sawtooth'; b.type = 'sine'; a.connect(f); b.connect(f);
    const trem = ctx.createOscillator(), tg = ctx.createGain(); trem.frequency.value = 7; tg.gain.value = 0.25 * c.v * 0.4; trem.connect(tg); tg.connect(g.gain);
    let nz = null; if (c.s === 'crackle') { nz = ctx.createBufferSource(); nz.buffer = noiseBuf; nz.loop = true; const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 4000; const ng = ctx.createGain(); ng.gain.value = 0.05 * c.v; nz.connect(nf); nf.connect(ng); ng.connect(g); nz.start(); }
    for (const o of [a, b, trem]) o.start(); loop = { a, b, f, g, trem, nz, p: c.p, v: c.v }; SFX.loopLevel(0); },
  loopLevel(k) { if (!loop || !ctx) return; const t = ctx.currentTime, L = loop, f0 = 110 * L.p * (1 + 3 * k); L.a.frequency.setTargetAtTime(f0, t, 0.05); L.b.frequency.setTargetAtTime(f0 * 2.01, t, 0.05); L.f.frequency.setTargetAtTime(500 + 3500 * k, t, 0.05); L.trem.frequency.setTargetAtTime(6 + 18 * k, t, 0.05); },
  loopStop() { if (!loop || !ctx) { loop = null; return; } const L = loop, t = ctx.currentTime; loop = null; try { L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(0.0001, t, 0.03); for (const o of [L.a, L.b, L.trem, L.nz]) if (o) o.stop(t + 0.15); } catch (e) {} },
};
// s240 PROXIMITY LOOPS: call SFX.near(robot, 'botStep' | 'botTread' | 'botHum', vol, rate) every few frames while it moves near you.
// Returns false when that event is set to a synth style (the caller plays its one-shot instead). Max 6 loops (the loudest win); silent ones fade out.
const LOOPS = new Map(), seenKind = new Map();
SFX.near = (id, evt, v = 1, p = 1, bot, pan = 0) => { const bk = bot || window.__sfxBot, c = (bk && botCfg(bk, evt)) || cfg[evt]; if (!c) return false; if (c.s === 'off') return true; if (!LOOP_STY[c.s]) return false; if (!ac() || window.__8gMuted) return true;
  const b = BUF[REC[c.s][0]]; if (!b || b instanceof Promise) return true; evt = evt + ':' + c.s; const now = performance.now(), tv = (bk ? (window.__sfxOcc ?? 1) : 1) * Math.min(2.6, v * c.v * (c.s === 'recWalk' ? 2.2 : c.s === 'recDrone' ? 0.6 : 1)) * 0.75 * duck;   /* s243 walkers as loud as drones; loops duck under a voice line */ let L = LOOPS.get(id);
  if (L && L.evt !== evt) { endLoop(id, L); L = null; }
  /* s254 VARIETY FIRST (Ben): every robot TYPE gets its sound before any type gets a second one; at most 2 of one type
     (the 2nd at half volume); a type that just arrived is the NEWCOMER: +30% for 2.5 s and it never loses its slot to a type already playing */
  const kind = bk || evt; if (!seenKind.has(kind) || now - seenKind.get(kind).last > 3000) seenKind.set(kind, { first: now, last: now }); else seenKind.get(kind).last = now;
  const same = [...LOOPS].filter(([k, q]) => q.kind === kind && k !== id);
  if (!L) { if (same.length >= 2) { const lo = same.reduce((a, b) => a[1].tv < b[1].tv ? a : b); if (lo[1].tv >= tv) return true; endLoop(lo[0], lo[1]); }
    if (LOOPS.size >= 6) { const cnt = {}; for (const q of LOOPS.values()) cnt[q.kind] = (cnt[q.kind] || 0) + 1; let lo = null, lk = null;
      for (const [k, q] of LOOPS) { const sc = (cnt[q.kind] > 1 ? -10 : 0) + q.tv - (now - seenKind.get(q.kind)?.first < 2500 ? -5 : 0); if (!lo || sc < lo.sc) { lo = { q, sc }; lk = k; } }
      if (lo && cnt[kind] && lo.q.kind !== kind && cnt[lo.q.kind] <= 1) return true; endLoop(lk, lo.q); }
    const src = ctx.createBufferSource(); src.buffer = b; src.loop = true; const g = ctx.createGain(); g.gain.value = 0.0001; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000; lp.Q.value = 0.5; const pn = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    src.connect(lp); lp.connect(g); if (pn) { g.connect(pn); pn.connect(bus()); } else g.connect(bus()); src.start(0, Math.random() * b.duration); L = { src, g, lp, pn, evt, t: now, tv, kind, born: now, det: 0.96 + Math.random() * 0.08 }; LOOPS.set(id, L); }
  { const mates = [...LOOPS.values()].filter(q => q.kind === kind).sort((a, b) => a.born - b.born), rank = mates.indexOf(L), sk = seenKind.get(kind); const mul = (rank > 0 ? 0.5 : 1) * (now - sk.first < 2500 ? 1.3 : 1); L.t = now; L.tv = tv * mul; }
  L.raw = L.tv; L.v = v; L.pan = pan; L.rate = c.p * p * L.det; mixLoops(); return true; };
/* s257 THE MIX (Ben: multiple robots should work together, not compete):
   all movement loops share one BUS with a gentle compressor; the NEAREST robot leads at full level, the others step back (60% · 40% · 30%…);
   distance = darker sound (low-pass 900 Hz far → 7 kHz close); each robot sits left / right where it is; small per-robot speed offsets so
   footsteps never phase into one smeared stomp; the loop bus dips briefly under shots, hits and voices; total level capped. */
let LBUS = null, busDip = 1;
function bus() { if (LBUS) return LBUS.in; const inp = ctx.createGain(), comp = ctx.createDynamicsCompressor(), lv = ctx.createGain(); comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.02; comp.release.value = 0.25; inp.connect(comp); comp.connect(lv); lv.connect(out); LBUS = { in: inp, lv }; return inp; }
const RANK_MUL = [1, 0.6, 0.4, 0.3, 0.25, 0.2];
function mixLoops() { if (!ctx) return; const n = ctx.currentTime, L2 = [...LOOPS.values()].sort((a, b) => (b.raw || 0) - (a.raw || 0)); let sum = 0;
  L2.forEach((q, i) => { q.mix = (q.raw || 0) * RANK_MUL[Math.min(i, RANK_MUL.length - 1)]; sum += q.mix; }); const cap = sum > 1.6 ? 1.6 / sum : 1;
  for (const q of L2) { q.g.gain.setTargetAtTime(Math.max(0.0001, q.mix * cap * busDip), n, 0.1); const cl = Math.max(0, Math.min(1, (q.v || 0) / 1.5)); q.lp.frequency.setTargetAtTime(900 + cl * cl * 6100, n, 0.15); if (q.pn) q.pn.pan.setTargetAtTime(Math.max(-0.85, Math.min(0.85, q.pan || 0)), n, 0.1); q.src.playbackRate.setTargetAtTime(q.rate || 1, n, 0.1); } }
function dipLoops(k = 0.55, ms = 260) { busDip = k; mixLoops(); clearTimeout(dipLoops.t); dipLoops.t = setTimeout(() => { busDip = 1; mixLoops(); }, ms); }
function endLoop(id, L) { LOOPS.delete(id); setTimeout(mixLoops, 0); try { const t = ctx.currentTime; L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(0.0001, t, 0.12); L.src.stop(t + 0.6); } catch (e) {} }
SFX._buf = () => Object.fromEntries(Object.entries(BUF).map(([k, b]) => [k, b instanceof Promise ? 'loading' : b ? b.duration.toFixed(2) : 'fail']));
SFX.nearStopAll = () => { for (const [k, L] of LOOPS) endLoop(k, L); };
setInterval(() => { const now = performance.now(); for (const [k, L] of LOOPS) if (now - L.t > 650 || window.__8gMuted) endLoop(k, L); }, 200);
// s244 ROBOT SOUND WORKSHOP: each robot can have its OWN sound for any of its slots (else it uses the shared FIGHTER SOUNDS row).
// Maps set window.__sfxBot = botKey(robot) while a robot acts (or pass { bot }) → play() / near() pick that robot's sound. Saved in localStorage 'robot.sfx'.
export const ROBOTS_SFX = [
  { key: 'guard-sword', name: 'SWORD GUARD', type: 'guard', v: 'sword', slots: ['botStep', 'botVoice', 'botChirp', 'botWind', 'botBash', 'botBlock', 'botShieldBreak', 'botStagger', 'swordHit', 'laserHit', 'kill'] },
  { key: 'guard-pistol', name: 'PISTOL GUARD', type: 'guard', v: 'pistol', slots: ['botStep', 'botVoice', 'botChirp', 'botAim', 'botCharge', 'botShot', 'botBlock', 'botShieldBreak', 'swordHit', 'laserHit', 'kill'] },
  { key: 'crawler-gloves', name: 'GLOVE TANK', type: 'crawler', v: 'gloves', slots: ['botTread', 'botVoice', 'botChirp', 'botWind', 'botLunge', 'botPop', 'swordHit', 'laserHit', 'kill'] },
  { key: 'crawler-cannon', name: 'CANNON TANK', type: 'crawler', v: 'cannon', slots: ['botTread', 'botVoice', 'botChirp', 'botAim', 'botCharge', 'botShot', 'botPop', 'swordHit', 'laserHit', 'kill'] },
  { key: 'drone', name: 'DRONE', type: 'drone', v: '', slots: ['botHum', 'botVoice', 'botChirp', 'botAim', 'botCharge', 'botSwoop', 'botShot', 'swordHit', 'laserHit', 'kill'] },
  { key: 'turret', name: 'FLOOR TURRET', type: 'turret', v: '', slots: ['botPop', 'botVoice', 'botAim', 'botCharge', 'botShot', 'swordHit', 'laserHit', 'kill'] },
  { key: 'gate', name: 'GATE', type: 'gate', v: '', slots: ['swordHit', 'laserHit', 'gate'] },
  { key: 'wall', name: 'WALLS', type: 'wall', v: '', slots: ['swordHit', 'laserHit'] },
  { key: 'boss', name: 'BOSS', type: 'boss', v: '', slots: ['botStep', 'botVoice', 'botWind', 'botLunge', 'botShot', 'swordHit', 'laserHit', 'kill'] }];
export const SLOT_LABEL = { botStep: 'MOVING · FOOTSTEPS', botTread: 'MOVING · TANK TREADS', botHum: 'MOVING · ROTORS', botVoice: 'SPOTS YOU · VOICE LINE', botChirp: 'CHATTER · CHIRPS', botAim: 'TARGET LOCK', botCharge: 'LASER CHARGE-UP', botWind: 'WIND-UP', botBash: 'SWORD SLASH / BASH', botLunge: 'PUNCH / LUNGE', botShot: 'FIRES', botSwoop: 'DIVE', botPop: 'POPS UP', botBlock: 'SHIELD TAKES A HIT', botShieldBreak: 'SHIELD BREAKS', botStagger: 'STAGGERED', swordHit: 'HIT BY YOUR SWORD', laserHit: 'HIT BY YOUR LASER', kill: 'DESTROYED', gate: 'DESTROYED' };
export const botKey = e => !e ? null : e.type === 'crawler' ? 'crawler-' + ((e.var || e.v) === 'cannon' ? 'cannon' : 'gloves') : e.type === 'guard' ? 'guard-' + ((e.var || e.v) === 'pistol' ? 'pistol' : 'sword') : e.type;
// s245 Ben: each robot has its OWN spot-you line by default (not random, not shared)
const BOT_DEF = {   /* s259 drones quieter (hum ×0.55, dive ×0.45) */
  "guard-sword": {"botStep":{"s":"recWalk","v":3,"p":2},"botVoice":{"s":"recVoiceHelp","v":3,"p":0.4},"botWind":{"s":"recVoiceAngry","v":1.95,"p":1},"botBash":{"s":"recSwing","v":3,"p":0.64},"botBlock":{"s":"clang","v":3,"p":0.84},"botShieldBreak":{"s":"bigboom","v":3,"p":0.98},"botStagger":{"s":"hurt","v":3,"p":1.14},"swordHit":{"s":"recMetal","v":3,"p":0.98},"laserHit":{"s":"recLzThick","v":0.75,"p":1.68},"botChirp":{"s":"chirp","v":3,"p":0.4},"kill":{"s":"recExplode","v":3,"p":1.1}},
  "guard-pistol": {"botVoice":{"s":"recVoiceCleanup","v":3,"p":1},"laserHit":{"s":"recLzThick","v":3,"p":1},"botShot":{"s":"recBotLaser","v":3,"p":0.94},"botAim":{"s":"beep","v":3,"p":1.12},"botCharge":{"s":"recVoiceAngry","v":2.1,"p":1},"kill":{"s":"recExplode","v":3,"p":1},"swordHit":{"s":"recMetal","v":2.75,"p":1},"botShieldBreak":{"s":"glass","v":3,"p":0.7},"botBlock":{"s":"clang","v":3,"p":1.32},"botStep":{"s":"recWalk","v":2.55,"p":1.36}},
  "crawler-gloves": {"botVoice":{"s":"recVoiceCleanup","v":3,"p":0.4},"botLunge":{"s":"recBoxerPunch","v":3,"p":1},"laserHit":{"s":"recLzThick","v":3,"p":1.46},"botTread":{"s":"recTank","v":1.65,"p":2},"botWind":{"s":"recVoiceAngry","v":2.9,"p":2},"kill":{"s":"recExplode","v":3,"p":2},"swordHit":{"s":"recMetal","v":3,"p":1}},
  "crawler-cannon": {"botTread":{"s":"recTank","v":1.65,"p":2},"botVoice":{"s":"recVoiceHelp","v":3,"p":1},"botCharge":{"s":"recPlasmaWind","v":3,"p":1.38},"botAim":{"s":"off","v":1,"p":1},"botShot":{"s":"recPlasmaFire","v":3,"p":1.16},"laserHit":{"s":"recLzThick","v":3,"p":1},"kill":{"s":"recExplode","v":3,"p":1.62},"swordHit":{"s":"recMetal","v":3,"p":1}},
  "drone": {"botVoice":{"s":"recVoiceBiologics","v":3,"p":1.24},"laserHit":{"s":"recLzThin","v":3,"p":1.8},"botHum":{"s":"recDrone","v":0.63,"p":1.56},"botChirp":{"s":"chirp","v":3,"p":2},"botShot":{"s":"recBotLaser","v":3,"p":2},"swordHit":{"s":"recMetal","v":3,"p":1},"kill":{"s":"recExplode","v":3,"p":2},"botSwoop":{"s":"recDrone","v":1.35,"p":2},"botCharge":{"s":"chargeup","v":3,"p":1}},
  "turret": {"botVoice":{"s":"recVoiceBiologics","v":3,"p":2},"laserHit":{"s":"recLzThin","v":3,"p":0.52},"botAim":{"s":"beep","v":3,"p":1},"botCharge":{"s":"recPlasmaWind","v":3,"p":2},"botShot":{"s":"recPlasmaFire","v":3,"p":2},"kill":{"s":"recExplode","v":3,"p":1.3},"botPop":{"s":"recPlasmaWind","v":3,"p":1.02},"swordHit":{"s":"recMetal","v":3,"p":1}},
  "gate": {"laserHit":{"s":"recLzStone","v":3,"p":0.66},"swordHit":{"s":"recStone","v":3,"p":1},"gate":{"s":"recExplode","v":3,"p":0.56}},
  "boss": {"botStep":{"s":"recWalk","v":3,"p":2},"botVoice":{"s":"recVoiceHelp","v":3,"p":0.4},"botWind":{"s":"recVoiceAngry","v":1.95,"p":1},"botBash":{"s":"recSwing","v":3,"p":0.64},"botBlock":{"s":"clang","v":3,"p":0.84},"botShieldBreak":{"s":"bigboom","v":3,"p":0.98},"botStagger":{"s":"hurt","v":3,"p":1.14},"swordHit":{"s":"recMetal","v":3,"p":0.98},"laserHit":{"s":"recLzThick","v":0.75,"p":1.68},"botChirp":{"s":"chirp","v":3,"p":0.4},"kill":{"s":"recExplode","v":3,"p":1.1},"botLunge":{"s":"recSwing","v":3,"p":0.64},"botShot":{"s":"recSwing","v":3,"p":0.64}},
  "wall": {"swordHit":{"s":"recStone","v":2,"p":1},"laserHit":{"s":"recLzStone","v":2,"p":1}} };

/* s695 the new recorded robot sounds become the defaults (v ≈ level after load-time levelling); kills POWER DOWN (hacked robots, not explosions) */
{ const o = (s, v = 1.6, p = 1) => ({ s, v, p }), U = (k, m) => { BOT_DEF[k] = { ...(BOT_DEF[k] || {}), ...m }; };
  U('guard-sword', { botWind: o('recWalkWind'), botBash: o('recWalkBash'), botBlock: o('recWalkBlock'), botShieldBreak: o('recShieldBreak'), botStagger: o('recStagger'), botChirp: o('recChirp', 1.3), laserHit: o('recBotHit', 1.4), kill: o('recBotDown') });
  U('guard-pistol', { botAim: o('recWalkAim'), botChirp: o('recChirp', 1.3), botBlock: o('recWalkBlock'), botShieldBreak: o('recShieldBreak'), botStagger: o('recStagger'), laserHit: o('recBotHit', 1.4), kill: o('recBotDown') });
  U('crawler-gloves', { botTread: o('recTank', 1.3), botWind: o('recTankWind'), botLunge: o('recTankLunge'), botPop: o('recTankPop'), botChirp: o('recChirp', 1.3), laserHit: o('recBotHit', 1.4), kill: o('recBotDown') });
  U('crawler-cannon', { botTread: o('recTank', 1.3), botAim: o('recTankTurn'), botCharge: o('recCannonCharge'), botShot: o('recCannonFire'), botPop: o('recTankPop'), botChirp: o('recChirp', 1.3), laserHit: o('recBotHit', 1.4), kill: o('recBotDown') });
  U('drone', { botHum: o('recDrone', 0.9), botAim: o('recDroneAim'), botCharge: o('recDroneCharge'), botShot: o('recDroneShot', 1.4), botSwoop: o('recDroneDive', 1.4), botChirp: o('recChirp', 1.2, 1.15), laserHit: o('recBotHit', 1.4), kill: o('recDroneFall') });
  U('turret', { botAim: o('recDroneAim'), botCharge: o('recDroneCharge'), botShot: o('recDroneShot', 1.4, 0.85), botPop: o('recTankPop'), laserHit: o('recBotHit', 1.4), kill: o('recBotDown') });
  U('boss', { botWind: o('recWalkWind', 1.8, 0.75), botLunge: o('recTankLunge', 1.8, 0.8), laserHit: o('recBotHit', 1.5, 0.85) }); }
const RKEY = 'robot.sfx'; let RB = {}; try { RB = JSON.parse(localStorage.getItem(RKEY) || '{}') || {}; } catch (e) {}
if (!RB._s695) { for (const k in RB) if (RB[k] && typeof RB[k] === 'object') for (const ev of ['botTread', 'botHum', 'botWind', 'botBash', 'botBlock', 'botShieldBreak', 'botStagger', 'botChirp', 'botAim', 'botCharge', 'botShot', 'botSwoop', 'botLunge', 'botPop', 'laserHit', 'kill']) delete RB[k][ev]; RB._s695 = 1; try { localStorage.setItem(RKEY, JSON.stringify(RB)); } catch (e) {} }   /* s695 the new recordings replace old lab picks once */
function BOT_EVT(evt) { return /^bot/.test(evt) || evt === 'laserHit' || evt === 'kill' || evt === 'gate' || evt === 'swordHit' || evt === 'block'; }
function botCfg(bk, evt) { return (RB[bk] && RB[bk][evt]) || (BOT_DEF[bk] && BOT_DEF[bk][evt]) || null; }
const saveRB = () => { try { localStorage.setItem(RKEY, JSON.stringify(RB)); } catch (e) {} };
const ALL_STY = [...new Set([...Object.keys(REC), ...Object.keys(R)])];
SFX.botGet = (bk, evt) => (RB[bk] && RB[bk][evt]) ? { ...RB[bk][evt], own: true } : (BOT_DEF[bk] && BOT_DEF[bk][evt]) ? { ...BOT_DEF[bk][evt], own: false } : { ...(cfg[evt] || { s: 'off', v: 1, p: 1 }), own: false };
SFX.botSet = (bk, evt, part) => { const cur = SFX.botGet(bk, evt); delete cur.own; RB[bk] = RB[bk] || {}; RB[bk][evt] = { ...cur, ...part }; saveRB(); };
SFX.botClear = (bk, evt) => { if (RB[bk]) { if (evt) delete RB[bk][evt]; else delete RB[bk]; saveRB(); } };
SFX.botTest = (bk, evt) => { const c = SFX.botGet(bk, evt); if (LOOP_STY[c.s]) { const id = 'test:' + bk + evt; let n = 0; const iv = setInterval(() => { SFX.near(id, evt, 1, 1, bk); if (++n > 12) clearInterval(iv); }, 150); return; } SFX.play(evt, { bot: bk }); };
SFX.stylesFor = evt => { const ev = SFX_EVENTS.find(x => x.key === evt); const own = ev ? ev.styles : []; return [...new Set([...own, ...ALL_STY.filter(k => k.startsWith('rec')), ...ALL_STY])].filter(k => k !== 'off').concat(['off']); };
SFX.recNames = REC;
window.__fighterSfx = SFX;
