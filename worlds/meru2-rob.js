import { applyD, endPose, driveD, lifeD, workD, WHEEL } from '../engine/fox-poses.js?v=s648k';   // s636 jointed driver + Rob in King Might's SUV, getting in + out
// MERU 2.0 — s318 ROB · PART 1 (Ben's script, BUILD_PLAN "ROB & THE MACHINE FLEET HQ"): after the ARENA, King Might has sent you to the
// Machine Fleet HQ (the PEARL SAIL). ROB, a Meru Guard officer (dark-grey guard armour, M crest, officer's cap), waits outside the arena gate.
// Talk → he leads you to a black ROYAL SUV (M crest) on the arena road. You drive (he sits beside you, both seen through the glass), he gives
// TURN-BY-TURN directions (spoken line + big arrow card + a glowing line on the road). 15 s off the route, 2 missed turns or crashes = ROB
// TAKES THE WHEEL and drives you there. Traffic on the road; a crash makes Rob complain and counts as a miss. At the Pearl Sail a glowing
// PARKING BOX: drive in → it parks itself → you both get out → Rob heads for the front doors (PART 2: kiosk, door blast, battle).
// s319 PART 2 + THE DRIVING DUET: Rob + you chat between his directions (ROB_DUET, Ben's words; box under the nav card, pauses for a direction,
// resumes). At the Pearl Sail: the locked doors, the VIDEO KIOSK (closed screen, static, the fake MAJOR MORRIS = the hack talking), Rob's charge
// + GET CLEAR + the blast + smoke, 2 waves of hacked Machine Fleet robots out of the doorway (pearl-bots.js models, engine/combat.js fight),
// Rob is hit and sits by the road (arrow) → his lines → the blasted door opens the Pearl Sail battle (floor 1). Flags robDoorBlown → robBattleWon → robHurtTalk.
// Flags: robMet → robArrived. Shown while tournamentWon && !pearlFinale (?rob=1 forces it for testing). Voice files audio/vo/rob-*.mp3 play if present.
import { buildBot, poseBot, loadBots, pulseEyes } from './pearl-bots.js';
import { WS } from '../engine/world-sfx.js?v=s713';   // s711 Runway sounds (audio/meru)
import { buildRoyalSUV } from '../engine/royal-suv.js?v=s679b';
import { createCombat } from '../engine/combat.js';
const PI = Math.PI, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const VOU = id => 'audio/vo/' + id + (id === 'duet-rob-5' ? '.wav' : '.mp3') + '?v=3';   // s322 ?v=2: Ben's improved Rob takes (busts the browser cache)   // every Rob line = audio/vo/<id>.mp3 (ROB_SCRIPT.md)
export const ROB_LINES = {
  hi: [{ who: 'npc', voUrl: VOU('rob-hi-1'), text: 'KING MIGHT ORDERED ME TO GO WITH YOU,' }, { who: 'npc', voUrl: VOU('rob-hi-2'), text: 'AND I HAVE A CAR WAITING FOR US AT THE END OF THIS PATH. MY NAME IS ROB!' },
    { who: 'player', voUrl: VOU('rob-ben-drive'), text: 'NICE TO MEET YOU, BUT I AM GONNA DRIVE! LEAD THE WAY!' }],
  nav: { go: ['rob-nav-go', 'STRAIGHT DOWN THE ARENA ROAD.'], right: ['rob-nav-right', 'TURN RIGHT AT THE LAKESIDE ROAD.'], stay: ['rob-nav-stay', 'STAY ON IT, ALL THE WAY TO THE END.'],
    left: ['rob-nav-left', 'TURN LEFT AT THE END, TOWARD THE PEARL SAIL.'], park: ['rob-nav-park', 'PARK IN THE GLOWING BOX BY THE DOORS.'], missed: ['rob-missed', 'YOU MISSED THE TURN! TURN AROUND.'],
    wrong: ['rob-wrong', 'WRONG WAY! TURN AROUND.'], crash: ['rob-crash', 'WATCH IT! THIS IS THE KING\u2019S CAR!'], take: ['rob-take', 'THAT\u2019S IT. I\u2019M DRIVING!'],
    here: ['rob-here', 'WE\u2019RE HERE. LET\u2019S FIND THE FRONT DOORS.'], car: ['rob-car', 'HERE SHE IS. HOP IN, DRIVER.'],
    crash2: ['rob-crash-2', 'EASY! THAT ONE IS COMING OUT OF MY PAY.'], good: ['rob-nav-good', 'GOOD. KEEP GOING.'], almost: ['rob-nav-almost', 'ALMOST THERE.'], slow: ['rob-nav-slow', 'SLOW DOWN, THE TURN IS COMING UP.'] },
  hey: ['rob-ben-hey', 'HEY! I HAD THAT!'],
};
// s319 THE DRIVING DUET (ROB_SCRIPT.md 21-34, Ben's words): [who, file, text]
export const ROB_DUET = [
  ['rob', 'duet-rob-1', 'THIS IS A GREAT TIME TO VISIT MERU! SOME LOVE THE IRONY OF A TOURNAMENT FOR PEACE DAY.'],
  ['ben', 'duet-ben-1', 'YES, AND I LOVE THAT KING MIGHT CHOSE HIS BIRTHDAY FOR THE PEACE DAY ANNUAL CELEBRATION.'],
  ['rob', 'duet-rob-2', 'YOU KNOW WHAT THEY SAY, IT\u2019S GOOD TO BE KING.'],
  ['ben', 'duet-ben-2', 'I AM LUCKY TO BE ABLE TO LEARN FROM HIM.'],
  ['rob', 'duet-rob-3', 'HOW DOES IT FEEL TO BE THE LEADER OF THE FIRST NEW PLANET TO EVER BE DISCOVERED?'],
  ['ben', 'duet-ben-3', 'IT IS A HUGE HONOR AND A HEAVY RESPONSIBILITY.'],
  ['rob', 'duet-rob-4', 'TELL ME ABOUT THE NEW PLANET YOU DISCOVERED.'],   // s329 new take
  ['ben', 'duet-ben-4a', 'THE WILDNESS OF THE PLANET SURPRISES ME EVERY DAY,'],
  ['ben', 'duet-ben-4b', 'WE HOPE TO FIND RAW CRYSTAL UNDER THE MOUNTAINS.'],
  ['rob', 'duet-rob-5', 'A NEW SOURCE FOR RAW CRYSTAL COULD FINALLY HELP HEAL THE CRYSTAL-GROWN WORLDS.'],   // s329: replaces 5a + 5b (WAV, trimmed before "that")
  ['ben', 'duet-ben-5', 'VERY TRUE. SO WHAT DO YOU THINK IS GOING ON WITH THE MACHINE MALFUNCTION?'],
  ['rob', 'duet-rob-6a', 'I HAVE NO IDEA. MY FATHER IS WITH THE MERU GUARD STATIONED AT THE BUILDING,'],
  ['rob', 'duet-rob-6b', 'HE WILL KNOW WHAT\u2019S HAPPENING.'] ];
// s319 PART 2 (ROB_SCRIPT.md 36-59). who 'npc' = the one you're talking to; other names show as their own speaker
const OFF = 'MERU GUARD \u00b7 OFFICER', MOR = 'ON THE KIOSK SCREEN';
export const ROB_P2 = {
  locked: [['player', 'p2-ben-locked', 'LOCKED.'], ['npc', 'p2-rob-kiosk', 'THERE\u2019S A VIDEO KIOSK. I\u2019LL RING IT.']],
  kiosk: [['npc', 'p2-kiosk-1', 'BUILDING IS CLOSED FOR MAINTENANCE UNTIL FURTHER NOTICE DUE TO SYSTEMS MALFUNCTION.'], ['ROB', 'p2-rob-1a', 'LET ME TALK TO MAJOR MORRIS, ASSIGNED TO THIS BUILDING.', OFF], ['ROB', 'p2-rob-1b', 'HE IS MY FATHER AND HE IS NOT ANSWERING HIS PHONE.', OFF]],
  morris: [['MAJOR MORRIS', 'p2-morris-1', 'HELLO SON! WHY ARE YOU BOTHERING THE FINE FOXES AT THE FRONT DOOR?', MOR], ['ROB', 'p2-rob-2', 'WE NEED TO COME IN.', OFF],
    ['MAJOR MORRIS', 'p2-morris-2a', 'THE BUILDING DOORS ARE LOCKED UNTIL THE MALFUNCTION IS FIXED.', MOR], ['MAJOR MORRIS', 'p2-morris-2b', 'SO TELL YOUR MOTHER I WON\u2019T BE HOME FOR DINNER.', MOR]],
  charge: [['npc', 'p2-rob-3', 'GET CLEAR OF THE DOOR, IT\u2019S GONNA BLOW!']],
  key: [['npc', 'p2-rob-key', 'BUILDING’S CLOSED? GOOD THING I BROUGHT A KEY... WELL, ACTUALLY, A DOOR BUSTER CHARGE.']],
  why: [['player', 'p2-ben-1', 'WHY DID YOU DO THAT?'], ['npc', 'p2-rob-4a', 'THAT WASN\u2019T MY FATHER!'], ['npc', 'p2-rob-4b', 'MY MOTHER LEFT ON A RELIGIOUS RETREAT TO GAYA LAST NIGHT,'], ['npc', 'p2-rob-4c', 'MY FATHER DROPPED HER AT THE SPACEDOCK HIMSELF...']],
  hurt: [['npc', 'p2-rob-hit', 'I’M HIT! OH DEAR HEAVENS, IT HURTS... THEY NEARLY BURNED MY LEG OFF!'], ['player', 'p2-ben-2', 'WE GOT TO GET YOU TO THE HOSPITAL!'], ['npc', 'p2-rob-5a', 'NO TIME, MY DAD COULD NEED HELP IN THAT BUILDING.'], ['npc', 'p2-rob-5b', 'PLEASE GO, I WILL CALL FOR BACKUP.']],
  again: [['npc', 'p2-rob-5b', 'PLEASE GO, I WILL CALL FOR BACKUP.']],
  bark: { fight1: ['p2-rob-fight-1', 'HERE THEY COME!'], fight2: ['p2-rob-fight-2', 'MORE OF THEM! STAY CLOSE!'], bot1: ['p2-bot-1', 'IN... TRUDER. PLEASE... RUN. INTRUDER.'], bot2: ['p2-bot-2', 'THESE ARE NOT... MY ORDERS... ENGAGE.'] } };
const L2 = a => a.map(([who, id, text, role]) => ({ who, role, text, voUrl: VOU(id) }));
// world points (Meru 2): arena gate x 360 z 0 · arena road z 50 (x 160..380) · lakeside road x 360 (z 50..200) · Pearl Sail door (383, 222.6)
const ROB0 = [353.5, 3.2], CAR0 = { x: 326, z: 51.6, yaw: PI / 2 };
const WALK = [[353.5, 3.2], [344, 8], [334, 34], [327.5, 46.4]];
const ROUTE = [[326, 51.8], [358.2, 51.8], [358.2, 327.8], [391, 327.8], [396, 333.5]];   // driving line (right-hand lane) · live spine: (360,50)→(360,326)→(410,326)
const TURNS = [{ i: 1, dir: 'right', say: 'right' }, { i: 2, dir: 'left', say: 'left' }];
const BOX = { x: 396.5, z: 335.6, yaw: 0, w: 3.6, l: 6.4 };
const DOOR = [402.5, 341.4];   // the Pearl Sail door (404, 344.6) faces N onto the lakeside road

import { lofi } from '../engine/lofi.js?v=1';
import { loadPlantCam, plantShot, CHARGE_AT } from './rob-plant-cam.js?v=11';
import { battleMusic } from '../engine/battle-music.js?v=s267';
export function buildRob({ THREE, scene, kit, CAST, train = null, sceneAudio = () => {}, save, sayTo, touch, isMuted = () => false, ground = () => 0, vBlock = () => false, pearlB = null, meleeK = () => 1, dlgCtl = null }) {
  // s320 DEMO (?robdemo=1): the whole chain plays itself from the arena gate to the blasted door, with the voices. Its story flags live in memory only (your save is untouched).
  const demo = typeof location !== 'undefined' && /[?&]robdemo=1/.test(location.search);
  const plantStart = typeof location !== 'undefined' && /[?&]rob=plant/.test(location.search);   // s338g (Ben): ?rob=plant = start at the Pearl Sail doors right before Rob sets the charge (flags in memory only, your save is untouched)
  const playStart = typeof location !== 'undefined' && /[?&]rob=play/.test(location.search);   // s338h (Ben): ?rob=play = the whole Rob chain, YOU play it, from the demo's start spot at the arena gate (flags in memory only)
  if (playStart) { const real = save, DF = { tournamentWon: true, pearlFinale: false, robMet: false, robArrived: false, robDoorBlown: false, robBattleWon: false, robHurtTalk: false }; save = Object.create(real); save.flag = k => (k in DF ? DF[k] : real.flag(k)); save.setFlag = (k, v = true) => { DF[k] = v; }; save.addGold = () => {}; save.addXp = () => {}; }
  if (plantStart) { const real = save, DF = { tournamentWon: true, pearlFinale: false, robMet: true, robArrived: true, robDoorBlown: false, robBattleWon: false, robHurtTalk: false }; save = Object.create(real); save.flag = k => (k in DF ? DF[k] : real.flag(k)); save.setFlag = (k, v = true) => { DF[k] = v; }; save.addGold = () => {}; save.addXp = () => {}; }
  if (demo) { const real = save, DF = { tournamentWon: true, pearlFinale: false, robMet: false, robArrived: false, robDoorBlown: false, robBattleWon: false, robHurtTalk: false }; save = Object.create(real); save.flag = k => (k in DF ? DF[k] : real.flag(k)); save.setFlag = (k, v = true) => { DF[k] = v; }; save.addGold = () => {}; save.addXp = () => {}; }
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), T = new THREE.Vector3();
  const force = typeof location !== 'undefined' && /[?&]rob=([12]|plant|play)/.test(location.search); let plantGo = plantStart, playGo = playStart;
  if (typeof location !== 'undefined' && /[?&]rob=2/.test(location.search)) { save.setFlag('robMet'); save.setFlag('robArrived'); }   // ?rob=2 = straight to PART 2 at the doors
  const active = () => force || demo || (save.flag('tournamentWon') && !save.flag('pearlFinale'));
  const toonM = c => new THREE.MeshToonMaterial({ color: c }), lam = c => new THREE.MeshLambertMaterial({ color: c });
  const box = (g, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const canvasTex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const crestT = canvasTex(128, 128, (g, w) => { g.fillStyle = '#26292d'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 2, 0, 7); g.fill(); g.strokeStyle = '#e6b45a'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 8, 0, 7); g.stroke(); g.fillStyle = '#f3f2f2'; g.font = '900 76px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, w / 2 + 5); });
  const GUARD = { outfit: 'armor', torso: ['#5a5f67', '#44484f', '#26292d'], crest: 'M', eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#e6b45a' } };
  // ================= ROB =================
  const rob = kit.makeFox({ key: 'robMorris', name: 'Rob', ...GUARD, mood: 'warm' }); scene.add(rob); rob.userData.noCull = true;
  { const P0 = rob.userData.P, hd = P0 && P0.head; if (hd) { const cap = new THREE.Group(); cap.position.set(0, 0.3, 0.02); hd.add(cap);   // officer's peaked cap
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.12, 18), toonM('#3b3f45')); crown.position.y = 0.04; crown.scale.z = 1.08; cap.add(crown); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.2, 0.05, 18), toonM('#3b3f45')); top.position.y = 0.12; cap.add(top);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.04, 18), toonM('#e6b45a')); band.position.y = 0.0; cap.add(band); const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 18, 1, false, -0.9, 1.8), toonM('#111111')); visor.position.set(0, -0.03, 0.08); visor.scale.set(1, 1, 1.5); cap.add(visor);
      const badge = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), new THREE.MeshBasicMaterial({ map: crestT })); badge.position.set(0, 0.06, 0.19); cap.add(badge); if (P0.ears) P0.ears.forEach(e => { e.position.y += 0.02; }); } }
  // ================= the ROYAL SUV (black, M crest, glass cabin so you see both foxes) =================
  const suv = new THREE.Group(); scene.add(suv); const S = suv.userData; suv.scale.setScalar(1.15);
  buildRoyalSUV(THREE, suv, { touch });   /* s679b the SUV model lives in engine/royal-suv.js (shared with the Character Workshop) */
  // s321 THE WALKING PATH (Ben): a paved path from the arena gate to the royal SUV, lamps along it (path readability rule)
  { const pts = [[360.5, 1.2], ...WALK, [327.4, 48.4]], pg = new THREE.Group(); pg.name = 'robWalkPath'; scene.add(pg);
    const pave = new THREE.MeshLambertMaterial({ color: 0xd8ccb4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), edge = new THREE.MeshLambertMaterial({ color: 0x8f8676, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    const gy = (x, z) => (ground(x, z) || 0) + 0.04;
    for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), yw = Math.atan2(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, L), pave); m.rotation.set(-PI / 2, 0, yw); m.position.set(cx, gy(cx, cz), cz); m.receiveShadow = true; pg.add(m);
      for (const sd of [-1, 1]) { const ex = cx + Math.cos(yw) * sd * 1.25, ez = cz - Math.sin(yw) * sd * 1.25, e = new THREE.Mesh(new THREE.PlaneGeometry(0.18, L), edge); e.rotation.set(-PI / 2, 0, yw); e.position.set(ex, gy(ex, ez) + 0.005, ez); pg.add(e); }
      if (i) { const c = new THREE.Mesh(new THREE.CircleGeometry(1.2, 20), pave); c.rotation.x = -PI / 2; c.position.set(ax, gy(ax, az), az); pg.add(c); }
      const nL = Math.max(1, Math.round(L / 13)); for (let k = 0; k < nL; k++) { const t = (k + 0.5) / nL, x = lerp(ax, bx, t) + Math.cos(yw) * 1.9 * (k % 2 ? 1 : -1), z = lerp(az, bz, t) - Math.sin(yw) * 1.9 * (k % 2 ? 1 : -1), y0 = ground(x, z) || 0;
        box(pg, 0.12, 2.6, 0.12, toonM('#26292d'), x, y0 + 1.3, z); box(pg, 0.26, 0.32, 0.26, new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), x, y0 + 2.75, z); box(pg, 0.34, 0.06, 0.34, toonM('#26292d'), x, y0 + 2.94, z); } }
    S.path = pg; }
  // the player + Rob seated inside (the walk's fox is hidden while you drive)
  const seatFox = f => { const P0 = f.userData.P; if (P0 && P0.fore) return; if (P0 && P0.legs) for (const l of P0.legs) l.rotation.x = -1.45; };
  // s636 (Ben: "do that for KING MIGHT'S CAR on the way to the Pearl Sail"): a DRIVER'S DOOR on the SUV (left side, hinged at its front edge),
  // the jointed you: walk up, pull the door open, slide into the seat, paws to a steering wheel ring, door shuts, THEN drive; steering,
  // hand over hand, HORN (H / ITEM via the walk), brace on a crash. Rob sits beside you: talks with his paws on his duet lines, points at
  // turns. GETTING OUT: door opens, you climb out + stand by it, door shuts. Input held during both.
  const SDOOR = new THREE.Group(); SDOOR.position.set(-1.02, 0, 0.45); suv.add(SDOOR); { const dm = new THREE.MeshLambertMaterial({ color: 0x15171a }); const pn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 1.3), dm); pn.position.set(0, 0.88, -0.65); SDOOR.add(pn); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.22), new THREE.MeshLambertMaterial({ color: 0xc9ced3 })); hd.position.set(-0.04, 1.12, -1.08); SDOOR.add(hd); }
  const SW = new THREE.Group(); { const ring = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r, 0.022, 8, 28), new THREE.MeshLambertMaterial({ color: 0x201e1d })); SW.add(ring); for (const a of [0, 2.09, 4.19]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, WHEEL.r, 0.016), new THREE.MeshLambertMaterial({ color: 0x3a3836 })); s.position.set(Math.sin(a) * WHEEL.r / 2, -Math.cos(a) * WHEEL.r / 2, 0); s.rotation.z = a; SW.add(s); } const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 14), new THREE.MeshLambertMaterial({ color: 0xe6b45a })); hub.rotation.x = Math.PI / 2; SW.add(hub); } SW.visible = false;
  const SEATL = [-0.45, 0.3, -0.3], OUTL = [-1.75, 0, -0.3], SC_IN = 1 / 1.15 * 0.84, SC_OUT = 1 / 1.15, sm3 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  function wheelOn(on) { const FPj = meIn.userData.P; if (!FPj || !FPj.fore) return; if (SW.parent !== FPj.body) FPj.body.add(SW); SW.visible = on; const sh = FPj.arms[0].position; SW.position.set(0, sh.y + WHEEL.y, sh.z + WHEEL.z); SW.rotation.set(-WHEEL.tilt, 0, (D.steer || 0) * 1.05); }
  function seqTick(dt) { const Q = D.seq; if (!Q) return false; Q.t += dt; const t = Q.t, st = performance.now() / 1000, FPj = meIn.userData.P, sx = FPj && FPj.arms ? Math.abs(FPj.arms[0].position.x) : 0.42; D.sp = 0;
    if (Q.ph === 'in') { const slide = sm3((t - 0.6) / 0.6); SDOOR.rotation.y = 1.1 * (sm3((t - 0.1) / 0.4) - sm3((t - 1.25) / 0.4));
      meIn.position.set(OUTL[0] + (SEATL[0] - OUTL[0]) * slide, OUTL[1] + (SEATL[1] - OUTL[1]) * slide, SEATL[2]); meIn.scale.setScalar(SC_OUT + (SC_IN - SC_OUT) * slide); meIn.rotation.set(0, -Math.PI / 2 * (1 - slide), 0);
      if (FPj && FPj.fore) { if (t < 0.6) applyD(THREE, meIn, workD('door', t, { k: Math.min(1, t / 0.5), side: 1 }), t, 1); else { applyD(THREE, meIn, driveD({ steer: 0, sx, t: st }), st, slide); wheelOn(slide > 0.5); } }
      if (t >= 1.7) { SDOOR.rotation.y = 0; D.seq = null; } return true; }
    const rise = sm3((t - 0.35) / 0.6); SDOOR.rotation.y = 1.1 * (sm3(t / 0.35) - sm3((t - 1.05) / 0.4)); wheelOn(rise < 0.4);
    meIn.position.set(SEATL[0] + (OUTL[0] - SEATL[0]) * rise, SEATL[1] + (OUTL[1] - SEATL[1]) * rise, SEATL[2]); meIn.scale.setScalar(SC_IN + (SC_OUT - SC_IN) * rise); meIn.rotation.set(0, -Math.PI / 2 * rise, 0);
    if (FPj && FPj.fore) applyD(THREE, meIn, rise < 0.6 ? driveD({ steer: 0, sx, t: st }) : workD('door', t, { k: 0.4, side: -1 }), st, 1);
    if (t >= 1.45) { SDOOR.rotation.y = 0; const done = Q.done; D.seq = null; meIn.position.set(...SEATL); meIn.scale.setScalar(SC_IN); meIn.rotation.set(0, 0, 0); endPose(meIn); SW.visible = false; done && done(); } return true; }
  function riders(dt) { if (!D.inCar || D.seq) return; const st = performance.now() / 1000, FPj = meIn.userData.P;
    if (FPj && FPj.fore) { D.hornT = Math.max(0, (D.hornT || 0) - dt); D.brace = Math.max(0, (D.brace || 0) - dt * 2); applyD(THREE, meIn, driveD({ steer: clamp(D.steer || 0, -1, 1), speed: Math.abs(D.sp || 0), horn: D.hornT > 0 ? 1 : 0, reverse: (D.sp || 0) < -0.6 ? 1 : 0, brace: D.brace, sx: Math.abs(FPj.arms[0].position.x), t: st }), st, 1); wheelOn(true); }
    const RP = robIn.userData.P; if (RP && RP.fore) { const talking = DU.play || (D.nav && D.nav.dist != null && D.nav.dist < 40); const L = lifeD(talking ? 'sitTalk' : 'sit', st, { ph: 3 }); if (D.nav && D.nav.dir && D.nav.dist < 40 && /left|right/i.test(D.nav.dir)) { const s = /left/i.test(D.nav.dir) ? 1 : -1; L.a[s > 0 ? 0 : 1] = [0.3, 0.1, 0.42]; L.pt = s > 0 ? [1, 0] : [0, 1]; L.g = s > 0 ? [0.9, 0.35] : [0.35, 0.9]; L.head[1] = s * 0.5; }   // Rob points at the turn
      applyD(THREE, robIn, L, st, 1); } }
  const meIn = kit.makeFox({ ...CAST.player, key: 'robDriveMe', joints: true }); meIn.visible = false; suv.add(meIn); meIn.position.set(-0.45, 0.3, -0.3); meIn.scale.setScalar(1 / 1.15 * 0.84);
  const robIn = kit.makeFox({ key: 'robSeat', name: 'Rob', ...GUARD, mood: 'warm', joints: true }); robIn.visible = false; suv.add(robIn); robIn.position.set(0.45, 0.3, -0.3); robIn.scale.setScalar(1 / 1.15 * 0.84);
  { const hd = rob.userData.P && rob.userData.P.head, hd2 = robIn.userData.P && robIn.userData.P.head; if (hd && hd2) { const c = hd.children[hd.children.length - 1]; if (c && c.isGroup) hd2.add(c.clone()); } }
  // ================= route line, nav arrow, parking box =================
  const line = new THREE.Group(); scene.add(line); line.visible = false; const lineMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
  const dashes = []; { const gy = (x, z) => (ground(x, z) || 0) + 0.06; for (let i = 0; i < ROUTE.length - 1; i++) { const [ax, az] = ROUTE[i], [bx, bz] = ROUTE[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 3); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = lerp(ax, bx, t), z = lerp(az, bz, t); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.0), lineMat); m.rotation.x = -PI / 2; m.rotation.z = -Math.atan2(bx - ax, bz - az); m.position.set(x, gy(x, z), z); line.add(m); dashes.push({ m, s: 0 }); } } }
  const boxG = new THREE.Group(); scene.add(boxG); boxG.visible = false; boxG.position.set(BOX.x, (ground(BOX.x, BOX.z) || 0) + 0.05, BOX.z); boxG.rotation.y = BOX.yaw;
  { const bm = new THREE.MeshBasicMaterial({ color: 0x7cff9b, transparent: true, opacity: 0.85, depthWrite: false }); for (const [w, d, x, z] of [[BOX.w, 0.16, 0, BOX.l / 2], [BOX.w, 0.16, 0, -BOX.l / 2], [0.16, BOX.l, BOX.w / 2, 0], [0.16, BOX.l, -BOX.w / 2, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), bm); m.rotation.x = -PI / 2; m.position.set(x, 0, z); boxG.add(m); }
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(BOX.w, BOX.l), new THREE.MeshBasicMaterial({ color: 0x7cff9b, transparent: true, opacity: 0.18, depthWrite: false })); fill.rotation.x = -PI / 2; boxG.add(fill); boxG.userData.fill = fill;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(BOX.w, 3, BOX.l), new THREE.MeshBasicMaterial({ color: 0x7cff9b, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 1.5; boxG.add(beam); boxG.userData.beam = beam; }
  const carRing = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.75, 40), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); carRing.rotation.x = -PI / 2; scene.add(carRing); carRing.visible = false;
  // ================= traffic (simple cars on the two roads, stop for the SUV) =================
  const TRAF = []; { const cols = ['#2e86b8', '#ec3013', '#f3f2f2', '#3f9a5e', '#ffd23a'];
    const lanes = [{ a: [380, 48.2], b: [165, 48.2] }, { a: [165, 51.8], b: [352, 51.8] }, { a: [361.8, 322], b: [361.8, 55] }, { a: [358.2, 60], b: [358.2, 318] }];
    // s327 (Ben: follow traffic): 12 cars; your lane (lakeside northbound) runs a little slower than the SUV so you follow them; cars keep their distance
    [[0, 0.1, 10], [0, 0.42, 10], [0, 0.74, 10], [1, 0.25, 9], [1, 0.72, 9], [2, 0.12, 10], [2, 0.45, 10], [2, 0.78, 10], [3, 0.16, 7.5], [3, 0.4, 7.5], [3, 0.63, 7.5], [3, 0.86, 7.5]].forEach(([li, t0, sp], i) => { const g = new THREE.Group(); scene.add(g); const m = toonM(cols[i % cols.length]), gl = toonM('#9fc6e0'), dk = toonM('#16181b');
      box(g, 1.8, 0.62, 4.2, m, 0, 0.66, 0); box(g, 1.62, 0.5, 2.1, m, 0, 1.22, -0.25); box(g, 1.66, 0.4, 1.9, gl, 0, 1.22, -0.25); box(g, 1.7, 0.08, 2.0, m, 0, 1.5, -0.25); box(g, 1.82, 0.16, 0.12, dk, 0, 0.42, 2.1); box(g, 1.82, 0.16, 0.12, dk, 0, 0.42, -2.1);
      for (const sx of [-0.62, 0.62]) { box(g, 0.34, 0.12, 0.04, new THREE.MeshBasicMaterial({ color: 0xfff6dc }), sx, 0.78, 2.11); box(g, 0.34, 0.12, 0.04, new THREE.MeshBasicMaterial({ color: 0xb01010 }), sx, 0.8, -2.11); }
      for (const [x, z] of [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 12), toonM('#0c0c0e')); t.rotation.z = PI / 2; t.position.set(x, 0.34, z); g.add(t); }
      g.visible = false; TRAF.push({ g, L: lanes[li], li, t: t0, sp, cur: sp }); }); }
  function trafAhead() { let best = 1e9; const fx = Math.sin(D.yaw), fz = Math.cos(D.yaw); for (const c of TRAF) { if (!c.g.visible) continue; const dx = c.g.position.x - D.x, dz = c.g.position.z - D.z, a = dx * fx + dz * fz, sd = Math.abs(dx * fz - dz * fx); if (a > 0 && sd < 2.2 && a < best) best = a; } return best; }
  function stepTraffic(dt, on) { for (const c of TRAF) { c.g.visible = on; if (!on) continue; const [ax, az] = c.L.a, [bx, bz] = c.L.b, L = Math.hypot(bx - ax, bz - az), x = lerp(ax, bx, c.t), z = lerp(az, bz, c.t), yaw = Math.atan2(bx - ax, bz - az);
      const fx = Math.sin(yaw), fz = Math.cos(yaw), dx = D.x - x, dz = D.z - z, ahead = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx), block = ahead > 0 && ahead < 10 && side < 2.4 && D.inCar && Math.cos(angD(D.yaw, yaw)) > -0.3;   /* not for the oncoming SUV in the other lane */
      let gap = 1e9; for (const o of TRAF) if (o !== c && o.li === c.li && o.t > c.t) gap = Math.min(gap, (o.t - c.t) * L); const fol = gap < 10;
      c.cur = damp(c.cur, block || fol ? 0 : gap < 18 ? Math.min(c.sp, (gap - 9) * 1.2) : c.sp, block || fol ? 6 : 1.5, dt); c.t += c.cur * dt / L; if (c.t > 1) { const free = TRAF.every(o => o === c || o.li !== c.li || o.t * L > 12); if (Math.hypot(D.x - ax, D.z - az) > 18 && free) c.t = 0; else c.t = 1; }   /* never pop back in on top of the SUV */ c.g.position.set(x, ground(x, z) || 0, z); c.g.rotation.y = yaw; } }
  // ================= state =================
  const D = { st: 'idle', x: CAR0.x, z: CAR0.z, yaw: CAR0.yaw, sp: 0, steer: 0, inCar: false, auto: false, miss: 0, off: 0, wrongT: 0, lastNode: -1, missedNode: -1, crashCd: 0, camT: 0, said: {}, nav: null, parkT: 0, toast: '', toastT: 0, walkI: 0, bump: 0 };
  let me = null, voEl = null;
  // s321 SPEECH QUEUE: every spoken line (directions, walk-and-talk, barks) plays one after another as a CAPTION (bottom, over the road) with its voice,
  // waits for dialogue boxes, and moves the speaker's mouth (fox-kit lip sync: userData.say) with an expression per line (MOODS)
  const MOODS = { 'rob-hi-1': 'happy', 'rob-hi-2': 'excited', 'rob-ben-drive': 'excited', 'rob-car': 'happy', 'rob-radio': 'smug', 'rob-crash': 'surprised', 'rob-crash-2': 'stern', 'rob-missed': 'stern', 'rob-wrong': 'surprised', 'rob-take': 'stern', 'rob-ben-hey': 'surprised', 'rob-here': 'determined', 'rob-nav-good': 'happy', 'rob-nav-slow': 'stern',
    'p2-ben-locked': 'curious', 'p2-rob-kiosk': 'determined', 'p2-rob-key': 'smug', 'p2-rob-hit': 'sad', 'p2-rob-1a': 'stern', 'p2-rob-1b': 'sad', 'p2-rob-2': 'determined', 'p2-rob-3': 'excited', 'p2-ben-1': 'surprised', 'p2-rob-4a': 'stern', 'p2-rob-4b': 'sad', 'p2-rob-4c': 'sad', 'p2-ben-2': 'sad', 'p2-rob-5a': 'determined', 'p2-rob-5b': 'sad', 'p2-rob-fight-1': 'determined', 'p2-rob-fight-2': 'determined',
    'duet-rob-1': 'happy', 'duet-ben-1': 'happy', 'duet-rob-2': 'smug', 'duet-ben-2': 'warm', 'duet-rob-3': 'curious', 'duet-ben-3': 'determined', 'duet-rob-4': 'curious', 'duet-ben-4a': 'excited', 'duet-ben-4b': 'determined', 'duet-rob-5': 'warm', 'duet-rob-5a': 'curious', 'duet-ben-5': 'curious', 'duet-rob-6a': 'sad', 'duet-rob-6b': 'determined' };
  const SPK = { q: [], cur: null, gap: 0 };
  const FEED = { guard: null, morris: null }; let lastP = null;
  const lipFox = who => (who === 'YOU' || who === 'ben' ? (D.inCar ? meIn : me) : who === 'ROB' || who === 'rob' ? (D.inCar ? robIn : rob) : who === 'KIOSK' ? FEED.guard : who === 'MORRIS' ? FEED.morris : null);
  function lip(who, id, text, o = {}) { const f = lipFox(who); if (!f) return null; const u = f.userData; u.say = { text, t: 0 }; u.talking = true; u.lineMood = MOODS[id] || null; u.moodClr = 0; u.lipT = 0; u.lipMax = text.split(' ').length * 0.3 + 0.5; u.lipEl = null; u.lipDlg = !!o.dlg; return f; }
  function mouthStop(f) { const u = f.userData; u.say = null; u.talking = false; u.mouth = 0; u.moodClr = 1.2; }
  function mouthTick(dt) { for (const f of [rob, robIn, meIn, me, FEED.guard, FEED.morris]) { if (!f || !f.userData.say) continue; const u = f.userData; u.lipT += dt; const el = u.lipDlg ? window.__voEl : u.lipEl;   // s326 (Ben): the mouth stops when the line's audio ends
      if (el ? (u.lipT > 0.35 && (el.ended || el.error || el.paused)) : u.lipT > u.lipMax) mouthStop(f); } }
  function spkPlay(it) { SPK.cur = it; it.t = 0; it.ended = false; it.dur = Math.max(1.6, it.text.split(' ').length * 0.3 + 0.6); const lf = lip(it.who, it.id, it.text);
    if (!isMuted()) try { const el = new Audio(VOU(it.id)); el.addEventListener('loadedmetadata', () => { if (SPK.cur === it && isFinite(el.duration)) it.dur = el.duration + 0.25; }); el.addEventListener('ended', () => { it.ended = true; }); el.play().catch(() => {}); it.el = el; if (lf) lf.userData.lipEl = el; } catch (e) {} }
  function spkEnd(it) { const f = lipFox(it.who); if (f) mouthStop(f); SPK.cur = null; SPK.gap = 0.25; if (it.done) it.done(); }
  function spkStop() { const c = SPK.cur; if (c && c.el) try { c.el.pause(); } catch (e) {} SPK.cur = null; }
  function speak(id, text, who = 'ROB', o = {}) { if (o.now || !DU.play) duetCut(); const it = { id, text, who, done: o.done }; if (o.now) { spkStop(); SPK.q.length = 0; spkPlay(it); } else SPK.q.push(it); }
  function spkTick(dt) { for (const f of [rob, robIn, meIn, me]) if (f && f.userData.moodClr > 0) { f.userData.moodClr -= dt; if (f.userData.moodClr <= 0) f.userData.lineMood = null; }
    const c = SPK.cur; if (c) { c.t += dt; const playing = c.el && !c.ended && !c.el.paused && !c.el.error && c.t < 14; if (c.ended || (!playing && c.t >= c.dur)) spkEnd(c); return; }
    SPK.gap -= dt; if (SPK.q.length && SPK.gap <= 0 && !(dlgCtl && dlgCtl.on()) && !DU.play) spkPlay(SPK.q.shift()); }
  const spkBusy = () => !!SPK.cur || SPK.q.length > 0;
  const dWho = (ln, key) => (!ln ? null : ln.who === 'player' ? 'YOU' : ln.who === 'ROB' || (ln.who === 'npc' && key === 'robMorris') ? 'ROB' : ln.who === 'MAJOR MORRIS' ? 'MORRIS' : ln.who === 'npc' && key === 'robKiosk' ? 'KIOSK' : null);
  const AD = { ln: null, t: 0 };
  function dlgLip(dt) { if (!dlgCtl || !dlgCtl.on()) { AD.ln = null; return; } const ln = dlgCtl.line(), key = dlgCtl.key ? dlgCtl.key() : ''; if (!ln || (key !== 'robMorris' && key !== 'robKiosk')) return;
    if (ln !== AD.ln) { AD.ln = ln; AD.t = 0; const id = String(ln.voUrl || '').replace(/^.*\//, '').replace('.mp3', ''), who = dWho(ln, key); if (who) lip(who, id, ln.text, { dlg: true }); return; }
    AD.t += dt; const nx = dlgCtl.peek ? dlgCtl.peek() : null, w0 = dWho(ln, key);   // s326 (Ben): back-to-back lines by the SAME speaker run on (no NEXT tap); a player line in between still waits
    if (!nx || ln.choices || !w0 || w0 === 'YOU' || dWho(nx, key) !== w0) return; const el = window.__voEl, done = el && !isMuted() ? AD.t > 0.35 && (el.ended || el.error || el.paused) : AD.t > ln.text.split(' ').length * 0.3 + 0.6;
    if (done) { AD.ln = null; dlgCtl.next(); } }
  const sayL = (L, t, who = 'ROB') => speak(L[0], L[1], who, { now: true });
  const NOW = { missed: 1, wrong: 1, crash: 1, crash2: 1, take: 1 };
  const say = k => { const L = ROB_LINES.nav[k]; if (L) speak(L[0], L[1], 'ROB', { now: !!NOW[k] }); };
  const robT = { key: 'robMorris', obj: rob, name: 'Rob', role: 'MERU GUARD \u00b7 OFFICER', ry: PI / 2, r: 3.2 };
  function place() { suv.position.set(D.x, ground(D.x, D.z) || 0, D.z); suv.rotation.y = D.yaw; for (let i = 0; i < 4; i++) { const w = S.wheels[i]; w.children[0].rotation.x += D.sp * 0.02; if (i < 2) w.rotation.y = D.steer * 0.5; } }
  function setup() { const st = save.flag('robArrived') ? 'arrived' : save.flag('robMet') ? 'atCar' : 'wait';
    if (st === 'arrived') { Object.assign(D, { x: BOX.x, z: BOX.z, yaw: BOX.yaw }); rob.position.set(DOOR[0], ground(DOOR[0], DOOR[1]) || 0, DOOR[1]); rob.rotation.y = 0; DU.i = ROB_DUET.length; p2Init(); }
    else { Object.assign(D, { x: CAR0.x, z: CAR0.z, yaw: CAR0.yaw }); const p = st === 'atCar' ? [CAR0.x + 2.4 * Math.cos(CAR0.yaw), CAR0.z - 2.4 * Math.sin(CAR0.yaw)] : ROB0; rob.position.set(p[0] + (st === 'atCar' ? 0 : 0), ground(p[0], p[1]) || 0, p[1]); rob.rotation.y = st === 'atCar' ? PI : PI / 2; if (st === 'atCar') { rob.position.set(CAR0.x - 1.5, 0, CAR0.z + 2.6); rob.position.y = ground(rob.position.x, rob.position.z) || 0; } }
    D.st = st; place(); }
  // ================= s319 THE DRIVING DUET =================
  const DU = { i: 0, t: 0, dur: 0, gap: 2.5, el: null, play: false, ended: false };
  const duetDone = () => DU.i >= ROB_DUET.length, duetWho = () => (DU.play && ROB_DUET[DU.i] ? ROB_DUET[DU.i][0] : null);
  function duetCut() { if (DU.el) { try { DU.el.pause(); } catch (e) {} DU.el = null; } if (DU.play && ROB_DUET[DU.i]) { const f = lipFox(ROB_DUET[DU.i][0]); if (f) mouthStop(f); } if (DU.play) { DU.play = false; DU.gap = 0.8; } }
  function dirSoon() { if (!D.inCar || D.auto || D.st !== 'drive') return false; const r = onRoute(D.x, D.z);
    return !D.said.go || (r.i === 0 && !D.said.right && distTo(1, D.x, D.z) < 85) || (r.i === 1 && !D.said.stay) || (r.i === 1 && !D.said.left && distTo(2, D.x, D.z) < 68) || (r.i >= 2 && !D.said.park); }
  function duetTick(dt) { if (duetDone()) return; const blocked = spkBusy() || dirSoon() || D.st === 'parking' || (dlgCtl && dlgCtl.on());
    if (DU.play) { if (SPK.cur) { duetCut(); return; } DU.t += dt; if (DU.t >= DU.dur || DU.ended) { DU.play = false; DU.el = null; DU.i++; const nx = ROB_DUET[DU.i]; DU.gap = nx && nx[0] === ROB_DUET[DU.i - 1][0] ? 0.15 : 0.5; } return; }
    if (blocked) return; DU.gap -= dt; if (DU.gap > 0) return;
    if (D.inCar && DU.i === 4 && !D.said.good1 && !D.auto && D.st === 'drive') return;   // s330: TELL ME waits for GOOD, KEEP GOING after the turn
    if (D.inCar && !D.auto && D.st === 'drive') { const r = onRoute(D.x, D.z), est = ROB_DUET[DU.i][2].split(' ').length * 0.3 + 1.1, v = Math.max(4, Math.abs(D.sp));   // s321: only start a duet line that can finish before the next direction
      const dd = r.i === 0 && !D.said.right ? distTo(1, D.x, D.z) - 70 : r.i === 1 && !D.said.left ? distTo(2, D.x, D.z) - 55 : r.i === 1 && !D.said.park ? distTo(2, D.x, D.z) + 8 : r.i >= 2 && !D.said.park ? Math.max(0, (0.25 - r.t) * r.L) : 1e9; if (dd / v < est) return; }
    const [who0, id, text] = ROB_DUET[DU.i]; const lf = lip(who0, id, text); Object.assign(DU, { play: true, t: 0, ended: false, dur: Math.max(2.2, text.split(' ').length * 0.3 + 0.6) });
    if (!isMuted()) try { const el = new Audio(VOU(id)); el.addEventListener('loadedmetadata', () => { if (DU.el === el && isFinite(el.duration)) DU.dur = el.duration + 0.35; }); el.addEventListener('ended', () => { if (DU.el === el) DU.ended = true; }); el.play().catch(() => {}); DU.el = el; if (lf) lf.userData.lipEl = el; } catch (e) {} }
  // ================= s319 PART 2 · THE FRONT DOORS =================
  const DW = [DOOR[0] + 1.5, 341.45],   /* s335 (Ben: camera blocked, grey shapes): the doors stood INSIDE the Pearl Sail's round glass entrance pod (x 402.1-405.9, front z 342.0); they now stand at the pod's front */ OUT = [0, -1], SIDE = [1, 0], at = (o, sd) => [DW[0] + OUT[0] * o + SIDE[0] * sd, DW[1] + OUT[1] * o + SIDE[1] * sd];
  const gAt = (x, z) => ground(x, z) || 0, gy0 = gAt(...at(2.5, 0)), faceOut = Math.atan2(OUT[0], OUT[1]), faceIn = faceOut + PI;
  const SP = { ring: at(2.6, 0), kiosk: at(1.0, 3.4), robKiosk: at(1.5, 2.15), charge: at(0.85, -0.95),   /* s335: Rob stands beside the charge, not in front of it */ cover: at(25.2, 4.2), pCover: at(25.2, -3.2), hireAt: at(1.8, 0) };   // s328: cover ACROSS the lakeside road (the road stays clear)   // s321: cover far from the door (room for the robots to come out + fight)
  const p2G = new THREE.Group(); scene.add(p2G); p2G.visible = false;
  const basic = (c, o = 1, add) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1 || !!add, opacity: o, depthWrite: !(o < 1 || add), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  // the video kiosk (screen = a canvas: CLOSED card · static · the fake Major Morris)
  const scr = document.createElement('canvas'); scr.width = 256; scr.height = 184; const sg = scr.getContext('2d'), scrT = new THREE.CanvasTexture(scr); scrT.colorSpace = THREE.SRGBColorSpace;
  let kScr = null; const kiosk = new THREE.Group(); p2G.add(kiosk); kiosk.position.set(SP.kiosk[0], gAt(...SP.kiosk), SP.kiosk[1]); kiosk.rotation.y = faceOut;
  { const dk = toonM('#26292d'), st = toonM('#6b737b'); box(kiosk, 0.2, 1.2, 0.2, st, 0, 0.6, 0); box(kiosk, 0.7, 0.08, 0.5, st, 0, 0.04, 0); box(kiosk, 1.08, 0.11, 0.5, dk, 0, 1.975, 0); box(kiosk, 1.08, 0.11, 0.5, dk, 0, 1.225, 0); for (const sx of [-0.495, 0.495]) box(kiosk, 0.09, 0.64, 0.5, dk, sx, 1.6, 0); box(kiosk, 0.9, 0.64, 0.04, dk, 0, 1.6, -0.23); box(kiosk, 0.8, 0.52, 0.46, st, 0, 0.94, -0.01);   // s326: a video BOOTH (open screen cavity + cabinet) so a real 3D fox can sit in the feed
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.64), new THREE.MeshBasicMaterial({ map: scrT })); sc.position.set(0, 1.6, 0.255); kiosk.add(sc); kScr = sc;
    box(kiosk, 0.12, 0.12, 0.06, basic(0xec3013), 0.38, 1.21, 0.25); box(kiosk, 0.1, 0.06, 0.08, toonM('#111111'), 0, 2.07, 0.2);
    const lb = canvasTex(256, 40, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MACHINE FLEET \u00b7 CALL', 10, h / 2 + 1); });
    const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.14), new THREE.MeshBasicMaterial({ map: lb })); lm.position.set(0, 1.225, 0.256); kiosk.add(lm); }
  // s326 THE FEED (Ben): a real Meru Guard fox on the kiosk: a young guard reads the CLOSED notice (robot voice, heavy static), then MAJOR MORRIS (cap, light static). Overlay = scanlines + noise + tears
  { const bg = canvasTex(128, 96, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2f4a63'); gr.addColorStop(1, '#121c26'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.06)'; for (let x = 8; x < w; x += 22) g.fillRect(x, 0, 2, h); g.fillStyle = '#ec3013'; g.fillRect(0, h - 10, w, 3); });
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.64), new THREE.MeshBasicMaterial({ map: bg })); bm.position.set(0, 1.6, -0.205); kiosk.add(bm); }
  const ovC = document.createElement('canvas'); ovC.width = 128; ovC.height = 92; const ovT = new THREE.CanvasTexture(ovC); ovT.colorSpace = THREE.SRGBColorSpace;
  const ovM = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.64), new THREE.MeshBasicMaterial({ map: ovT, transparent: true, depthWrite: false })); ovM.position.set(0, 1.6, 0.252); ovM.renderOrder = 3; ovM.visible = false; kiosk.add(ovM);
  function feedFox(key, name, cap, look = GUARD) { const f = kit.makeFox({ key, name, ...look, mood: 'stern' }); f.visible = false; f.userData.noCull = true; kiosk.add(f);
    if (cap) { const hd = f.userData.P && f.userData.P.head; if (hd) { const c = new THREE.Group(); c.position.set(0, 0.3, 0.02); hd.add(c); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.12, 18), toonM('#3b3f45')); cr.position.y = 0.04; c.add(cr); const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.2, 0.05, 18), toonM('#3b3f45')); tp.position.y = 0.12; c.add(tp); const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.035, 18), toonM('#e6b45a')); bd.position.y = 0.0; c.add(bd); const vz = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.14), toonM('#16181b')); vz.position.set(0, -0.02, 0.2); c.add(vz); } }
    return f; }
  function feedFit(f) { if (f.userData.fit) return; f.userData.fit = 1; f.scale.setScalar(1); f.position.set(0, 0, 0); f.rotation.set(0, 0, 0); kiosk.updateMatrixWorld(true); const hd = f.userData.P && f.userData.P.head, hp = V(0, 1.45, 0);
    if (hd) { hd.getWorldPosition(hp); kiosk.worldToLocal(hp); } const s0 = 0.74 / Math.max(0.6, hp.y); f.scale.setScalar(s0); f.position.set(0, 1.56 - hp.y * s0, -0.02); }
  FEED.guard = feedFox('kioskClerk', 'HQ Clerk', false, { outfit: 'suit', torso: ['#2b3038', '#1f232a', '#f3f2f2'], eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#ec3013' } });   /* s334 (Ben): the first face on the kiosk = an HQ employee in a suit */ FEED.morris = feedFox('kioskMorris', 'Major Morris', true);
  let ovAcc = 0; function feedTick(dt, t) { const fm = scrMode === 'guard' ? FEED.guard : scrMode === 'morris' ? FEED.morris : null;
    for (const f of [FEED.guard, FEED.morris]) { const on = f === fm; if (on && !f.visible) feedFit(f); f.visible = on; if (on) { kit.animFox(f, dt, 0, false); f.rotation.y = 0; } }
    ovM.visible = !!fm; if (!fm) { kScr.visible = true; return; } const heavy = scrMode === 'guard'; kScr.visible = Math.random() < (heavy ? 0.06 : 0.025);   // the odd frame of full static
    ovAcc += dt; if (ovAcc < 0.05) return; ovAcc = 0; const g = ovC.getContext('2d'), w = 128, h = 92; g.clearRect(0, 0, w, h);
    g.fillStyle = heavy ? 'rgba(120,170,220,0.16)' : 'rgba(120,170,220,0.08)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
    for (let i = 0; i < (heavy ? 520 : 140); i++) { const v = Math.random() * 255 | 0; g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (heavy ? 0.55 : 0.4) + ')'; g.fillRect(Math.random() * w | 0, Math.random() * h | 0, 1 + (Math.random() * 2 | 0), 1); }
    if (Math.random() < (heavy ? 0.5 : 0.18)) { const y = Math.random() * h | 0; g.fillStyle = 'rgba(220,230,240,0.35)'; g.fillRect(0, y, w, 2 + Math.random() * 5); }
    g.fillStyle = '#ec3013'; g.fillRect(4, 4, 6, 6); g.fillStyle = '#fff'; g.font = '700 8px Archivo, sans-serif'; g.fillText(heavy ? 'HQ \u00b7 LIVE' : 'MAJ. MORRIS \u00b7 LIVE', 13, 10); ovT.needsUpdate = true; }
  const kAnchor = new THREE.Object3D(); kAnchor.position.copy(kiosk.position); scene.add(kAnchor);
  const kT = { key: 'robKiosk', obj: kAnchor, name: 'Kiosk', role: 'MACHINE FLEET HQ \u00b7 DISTORTED VOICE', ry: faceOut, r: 30 }, robT2 = { ...robT, r: 30 };
  let scrMode = 'off', scrLast = '', scrAcc = 0;
  function drawScreen(t) { const g = sg, w = 256, h = 184;
    if (scrMode === 'off') { g.fillStyle = '#0b0d10'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, 0, w, h * 0.35); return; }
    const fl = scrMode === 'guard' || scrMode === 'morris' || Math.random() < 0.03;
    if (scrMode === 'static' || fl) { const im = g.createImageData(w, h), d = im.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } g.putImageData(im, 0, 0); return; }
    if (scrMode === 'closed') { g.fillStyle = '#10161c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, 34); g.fillStyle = '#fff'; g.font = '900 19px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MACHINE FLEET HQ', 12, 18);
      g.font = '900 30px Archivo, sans-serif'; g.fillText('BUILDING', 12, 72); g.fillText('CLOSED', 12, 104); g.fillStyle = '#ffd23a'; g.font = '800 15px Archivo, sans-serif'; g.fillText('SYSTEMS MALFUNCTION', 12, 140); g.fillStyle = '#9aa0a6'; g.fillText('UNTIL FURTHER NOTICE', 12, 162); }
    else { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#36506a'); gr.addColorStop(1, '#16222e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const cx = 128, cy = 104;
      g.fillStyle = '#2a3440'; g.fillRect(60, 150, 136, 40); g.fillStyle = '#e6b45a'; g.fillRect(118, 156, 20, 14);   // uniform + crest
      g.fillStyle = '#d9772b'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 26, cy - 34); g.lineTo(cx + s * 58, cy - 78); g.lineTo(cx + s * 62, cy - 22); g.fill(); }
      g.beginPath(); g.ellipse(cx, cy, 50, 46, 0, 0, 7); g.fill(); g.fillStyle = '#f3ead8'; g.beginPath(); g.ellipse(cx, cy + 22, 30, 22, 0, 0, 7); g.fill();
      g.fillStyle = '#3b3f45'; g.beginPath(); g.moveTo(cx - 52, cy - 30); g.lineTo(cx + 52, cy - 30); g.lineTo(cx + 44, cy - 62); g.lineTo(cx - 44, cy - 62); g.fill(); g.fillStyle = '#e6b45a'; g.fillRect(cx - 50, cy - 36, 100, 7); g.fillStyle = '#111'; g.fillRect(cx - 54, cy - 30, 108, 6);
      const red = Math.sin(t * 2.3) > 0.93; g.fillStyle = red ? '#ff2a1a' : '#16120e'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 19, cy - 4, 6, 8, 0, 0, 7); g.fill(); }   // the hack shows in his eyes
      g.fillStyle = '#16120e'; g.beginPath(); g.ellipse(cx, cy + 11, 7, 5, 0, 0, 7); g.fill(); const op = D.p2Talk ? Math.max(0, Math.sin(t * 15)) * 6 : 0; g.fillRect(cx - 9, cy + 26, 18, 2 + op);
      g.fillStyle = '#000'; g.fillRect(0, h - 24, w, 24); g.fillStyle = '#ec3013'; g.fillRect(8, h - 17, 10, 10); g.fillStyle = '#fff'; g.font = '800 13px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LIVE \u00b7 MAJOR MORRIS', 24, h - 12); }
    g.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);   // scanlines
    if (Math.random() < 0.3) { const y = Math.random() * h | 0, hh = 4 + Math.random() * 16 | 0; g.drawImage(scr, 0, y, w, hh, (Math.random() - 0.5) * 30, y, w, hh); }   // tear
  }
  function screenTick(dt, t) { feedTick(dt, t); scrAcc += dt; if (scrMode === scrLast && (scrMode === 'off' || scrAcc < 0.05)) return; scrAcc = 0; scrLast = scrMode; drawScreen(t); scrT.needsUpdate = true; }
  drawScreen(0);
  // the locked doors, the charge, rings, the arrow over Rob, the scorch
  const doorG = new THREE.Group(); p2G.add(doorG); doorG.position.set(DW[0], gAt(...DW), DW[1]); doorG.rotation.y = faceOut;
  const panels = [-1, 1].map(sd => { const g = new THREE.Group(); doorG.add(g); g.position.set(sd * 0.68, 1.5, 0.14); box(g, 1.32, 3.0, 0.14, toonM('#59606a'), 0, 0, 0); box(g, 1.2, 0.08, 0.16, basic(0xec3013), 0, 1.3, 0.01); box(g, 0.08, 0.5, 0.18, toonM('#c7ccd3'), -sd * 0.5, 0, 0); return { g, sd, v: null }; });
  const charge = new THREE.Group(); doorG.add(charge); charge.position.set(0, 1.3, 0.27); charge.visible = false;   // (s326 plant moves it in from 0.95)   // s322 bigger charge: box + 2 blocks + wires + timer screen + a big red button
  box(charge, 0.56, 0.36, 0.12, toonM('#2a2d33'), 0, 0, 0); for (const x of [-0.19, 0.19]) box(charge, 0.14, 0.3, 0.1, toonM('#c9b27a'), x, 0, 0.1); for (const [x, c] of [[-0.06, '#ec3013'], [0.06, '#3a7bd5']]) box(charge, 0.015, 0.34, 0.015, toonM(c), x, 0, 0.16);
  const cLed = box(charge, 0.05, 0.05, 0.04, basic(0xff2a1a), 0.22, 0.15, 0.08); const cBtn = box(charge, 0.09, 0.05, 0.09, basic(0xd81e1e), 0, -0.13, 0.12);
  { const cc = toonM('#b9b4aa'), cs = toonM('#8f8a80'); for (const sd of [4.2, -3.2]) { const g = new THREE.Group(); p2G.add(g); const [x, z] = at(24.0, sd); g.position.set(x, gAt(x, z), z); g.rotation.y = faceOut;   // concrete jersey barriers = the cover
      box(g, 2.8, 0.55, 0.7, cc, 0, 0.275, 0); box(g, 2.8, 0.5, 0.36, cc, 0, 0.8, 0); box(g, 2.8, 0.06, 0.4, cs, 0, 1.06, 0); for (const k of [-1, 1]) box(g, 0.5, 0.12, 0.72, toonM('#ffd23a'), k * 0.9, 0.5, 0); } }
  const tmrC = document.createElement('canvas'); tmrC.width = 96; tmrC.height = 48; const tmrT = new THREE.CanvasTexture(tmrC); tmrT.colorSpace = THREE.SRGBColorSpace; let tmrV = -1;
  function drawTimer(v) { if (v === tmrV) return; tmrV = v; const g = tmrC.getContext('2d'); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 96, 48); if (v >= 0) { g.fillStyle = '#ff2a1a'; g.font = '900 34px Archivo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0:' + String(v).padStart(2, '0'), 48, 26); } else if (v === -1) { g.fillStyle = '#ff2a1a'; g.font = '900 21px Archivo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ARM? Y/N', 48, 26); }   /* s333 (Ben) */ tmrT.needsUpdate = true; }
  drawTimer(-2); { const tm = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: tmrT })); tm.position.set(0, 0.07, 0.171); charge.add(tm); }   // timer screen on top of the wires
  // s326 HANDS for the plant close-up (Ben: lose the bodies, just Rob's hands): armoured forearm + paw, the right one with a pointing finger
  const HANDS = [0, 1].map(i => { const g = new THREE.Group(); doorG.add(g); g.visible = false; const sl = toonM('#44484f'), fur = toonM('#d9772b');
    const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.6, 10).rotateX(PI / 2).translate(0, 0, 0.36), sl); g.add(fa); const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10).rotateX(PI / 2).translate(0, 0, 0.08), toonM('#e6b45a')); g.add(cuff);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), fur); paw.scale.set(1, 0.8, 1.15); g.add(paw);
    if (i) { const fg = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.07, 3, 6).rotateX(PI / 2).translate(0, -0.01, -0.09), fur); g.add(fg); } return g; });
  const shoulderW = V(), handL = V();
  function handW() { const A = rob.userData.P, arm = A && A.arms && A.arms[1]; if (!arm) return V(rob.position.x, rob.position.y + 1.0, rob.position.z); rob.updateMatrixWorld(true); return arm.localToWorld(V(0, -0.5, 0.12)); }
  const tw2 = () => { const p = doorG.localToWorld(V(0, 1.3, 0.4)); return [p.x, p.y, p.z]; };
  function carryCharge() { if (charge.parent !== p2G) { p2G.add(charge); charge.scale.setScalar(1); } charge.visible = true; if (tmrV !== -1) drawTimer(-1); charge.position.copy(handW()); charge.rotation.set(0, rob.rotation.y + PI, 0);   // Rob carries it over in his right paw
    try { if (!D.boomEl && !isMuted()) { D.boomEl = new Audio(VOU('p2-sfx-boom')); D.boomEl.preload = 'auto'; D.boomEl.load(); } } catch (e) {} }
  function handAt(i, x, y, z) { const g = HANDS[i]; g.visible = true; g.position.set(x, y, z); handL.set(i ? 0.6 : -0.6, 1.05, 1.6);   /* Rob's side = door-local -x (the close-up camera sits on +x) */ doorG.localToWorld(shoulderW.copy(handL)); g.lookAt(shoulderW); }
  const coverRing = (() => { const m = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.3, 40), new THREE.MeshBasicMaterial({ color: 0x7cff9b, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -PI / 2; p2G.add(m); m.visible = false; m.position.set(SP.pCover[0], gAt(...SP.pCover) + 0.06, SP.pCover[1]); return m; })();
  const ringM = (r0, r1, c) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -PI / 2; p2G.add(m); m.visible = false; return m; };
  const doorRing = ringM(1.1, 1.4, 0xffd23a); doorRing.position.set(SP.ring[0], gAt(...SP.ring) + 0.06, SP.ring[1]);
  const clearRing = ringM(6.0, 6.35, 0xff2a1a); clearRing.position.set(DW[0], gAt(...DW) + 0.07, DW[1]);
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), basic(0x111111, 0.55)); scorch.rotation.x = -PI / 2; scorch.position.set(...[at(1.2, 0)].map(p => [p[0], gAt(...p) + 0.05, p[1]])[0]); scorch.visible = false; p2G.add(scorch);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), basic(0xffd23a)); arrow.rotation.x = PI; arrow.visible = false; p2G.add(arrow);
  // blast fx: flash, debris, smoke
  const glowTex = canvasTex(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const smokeTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 32); r.addColorStop(0, 'rgba(90,90,96,0.9)'); r.addColorStop(1, 'rgba(90,90,96,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); p2G.add(flash); flash.visible = false;
  // s325 FIREBALL (Ben): additive fire sprites that bloom yellow → orange → red, embers with gravity, flames licking the door frame for a few seconds
  const fireTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(255,250,220,1)'); r.addColorStop(0.25, 'rgba(255,205,90,0.95)'); r.addColorStop(0.55, 'rgba(255,110,20,0.6)'); r.addColorStop(1, 'rgba(160,20,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const FIRE = []; for (let i = 0; i < (touch ? 16 : 26); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); sp.visible = false; p2G.add(sp); FIRE.push({ sp, t: 0, life: 0 }); }
  function fire(x, y, z, o) { const q = FIRE.find(f => !f.sp.visible); if (!q) return; Object.assign(q, { t: -(o.delay || 0), life: o.life, s0: o.s0, s1: o.s1, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, g: o.g || 0, lick: !!o.lick, x0: x, z0: z }); q.sp.position.set(x, y, z); q.sp.scale.setScalar(0.01); q.sp.material.opacity = 0; q.sp.visible = true; }
  function fireTick(dt) { for (const q of FIRE) { if (!q.sp.visible) continue; q.t += dt; if (q.t < 0) continue; const k = q.t / q.life; if (k >= 1) { q.sp.visible = false; continue; }
      q.vy -= q.g * dt; q.sp.position.x += q.vx * dt; q.sp.position.y += q.vy * dt; q.sp.position.z += q.vz * dt; q.vx *= 1 - dt * 2.5; q.vz *= 1 - dt * 2.5;
      const e = 1 - Math.pow(1 - Math.min(1, k * 2.2), 3); q.sp.scale.setScalar(q.lick ? q.s0 * (0.8 + 0.35 * Math.sin(q.t * 23 + q.x0 * 7)) : lerp(q.s0, q.s1, e));
      q.sp.material.color.setRGB(1, lerp(1, 0.45, k), lerp(0.85, 0.12, Math.min(1, k * 1.6))); q.sp.material.opacity = (k < 0.08 ? k / 0.08 : 1) * (1 - k) * (q.lick ? 0.85 : 1); } }
  const SMK = [], DEB = [], BEAMS = []; for (let i = 0; i < (touch ? 14 : 22); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 })); sp.visible = false; p2G.add(sp); SMK.push({ sp, life: 0, t: 0 }); }
  function puff(x, y, z, n = 3, big = 1) { for (let k = 0; k < n; k++) { const q = SMK.find(o => o.t >= o.life) || SMK[(Math.random() * SMK.length) | 0]; Object.assign(q, { t: 0, life: 2.2 + Math.random() * 1.6, s0: (0.8 + Math.random() * 0.8) * big, vx: (Math.random() - 0.5) * 1.6, vz: (Math.random() - 0.5) * 1.6 }); q.sp.position.set(x + (Math.random() - 0.5) * 1.2, y, z + (Math.random() - 0.5) * 1.2); q.sp.visible = true; } }
  function fxTick(dt) { for (const q of SMK) { if (q.t >= q.life) { q.sp.visible = false; continue; } q.t += dt; const k = q.t / q.life; q.sp.position.x += q.vx * dt; q.sp.position.z += q.vz * dt; q.sp.position.y += dt * 1.3; q.sp.scale.setScalar(q.s0 * (1 + k * 3)); q.sp.material.opacity = 0.75 * (1 - k); }
    if (flash.visible) { D.flT += dt; const k = D.flT / 0.45; flash.scale.setScalar(4 + k * 10); flash.material.opacity = Math.max(0, 1 - k); if (k >= 1) flash.visible = false; }
    fireTick(dt);
    for (let i = DEB.length - 1; i >= 0; i--) { const d = DEB[i]; d.vy -= 18 * dt; d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt; d.m.rotation.x += d.sp * dt; d.m.rotation.z += d.sp * dt; if (d.m.position.y < d.gy) { d.m.position.y = d.gy; d.vx *= 0.4; d.vz *= 0.4; d.vy = Math.abs(d.vy) > 2 ? -d.vy * 0.25 : 0; d.sp *= 0.3; } }
    for (const p of panels) if (p.v) { const v = p.v; v.vy -= 18 * dt; p.g.position.x += v.vx * dt; p.g.position.y += v.vy * dt; p.g.position.z += v.vz * dt; if (p.g.position.y > 0.1) p.g.rotation.x = Math.min(PI / 2, p.g.rotation.x + dt * 3.2); else { p.g.position.y = 0.1; p.g.rotation.x = PI / 2; v.vx = v.vz = v.vy = 0; } }
    for (let i = BEAMS.length - 1; i >= 0; i--) { const b = BEAMS[i]; b.t += dt; b.m.material.opacity = 0.95 * (1 - b.t / 0.16); if (b.t > 0.16) { b.m.parent.remove(b.m); b.m.material.dispose(); BEAMS.splice(i, 1); } }
    if (save.flag('robDoorBlown') && Math.random() < dt * 1.2) { const [x, z] = at(0.6, (Math.random() - 0.5) * 1.6); puff(x, gAt(x, z) + 1.2, z, 1, 0.7); } }   // thin smoke from the doorway
  function panelsDown() { for (const p of panels) { p.v = null; p.g.position.set(p.sd * 1.1, 0.1, 3.2 + Math.abs(p.sd) * 0.3); p.g.rotation.set(PI / 2, p.sd * 0.4, 0); } }
  // sounds (own tiny synth; the dialogue voices come from audio/vo/ through the walk)
  const AC = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} return isMuted() ? null : ac; };
  const aud = { burst(d, f, v) { const c = AC(); if (!c) return; const b = c.createBuffer(1, Math.max(1, c.sampleRate * d | 0), c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length); const n = c.createBufferSource(); n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = f; const g = c.createGain(); g.gain.value = v; n.connect(bp); bp.connect(g); g.connect(c.destination); n.start(); },
    tone(f, d, v, type = 'sine') { const c = AC(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d + 0.02); } };
  const sfx = (id, v = 1, fb) => { if (isMuted()) return; try { const el = new Audio(VOU(id)); el.volume = v; el.play().catch(() => { if (fb) fb(); }); } catch (e) { if (fb) fb(); } };   // Ben's recorded p2-sfx-* (synth fallback)
  const ringSfx = () => { for (const k of [0, 0.5]) setTimeout(() => { aud.tone(660, 0.3, 0.05, 'triangle'); setTimeout(() => aud.tone(880, 0.3, 0.05, 'triangle'), 140); }, k * 1000); };
  // s325 ROBOT SOUNDS (Ben): loops for walking legs / treads / drone rotors (volume by how many move + how close), attack sounds per type, hit + break-up
  const RA = 'audio/robots/', SND = { loops: {}, last: {} };
  function rsfx(f, v = 0.6, gap = 0.08) { if (isMuted()) return; const n = performance.now(); if (n - (SND.last[f] || 0) < gap * 1000) return; SND.last[f] = n; try { const el = new Audio(f); el.volume = Math.min(1, v); el.play().catch(() => {}); } catch (e) {} }
  const LOOPF = { walk: RA + 'robot-walk.mp3', tread: RA + 'tank-move.mp3', fly: RA + 'drone-fly.mp3' };
  function loopsTick(dt, P, on) { const W = { walk: 0, tread: 0, fly: 0 };
    if (on && !isMuted()) for (const q of bots) { if (!q.w.visible || (q.f && q.f.down)) continue; const x = q.w.position.x, z = q.w.position.z, sp = q.px == null ? 0 : Math.hypot(x - q.px, z - q.pz) / Math.max(dt, 1e-3); q.px = x; q.pz = z;
      const near = 1 / (1 + Math.hypot(x - P.x, z - P.z) / 7), k = q.type === 'drone' ? 'fly' : q.type === 'crawler' ? 'tread' : 'walk'; W[k] += (k === 'fly' ? 0.7 : Math.min(1, 0.15 + sp / 2.5)) * near; }
    for (const k in LOOPF) { let el = SND.loops[k]; const v = Math.min(0.55, W[k] * 0.45);
      if (v > 0.02 && !el) { try { el = SND.loops[k] = new Audio(LOOPF[k]); el.loop = true; el.volume = 0; el.play().catch(() => {}); } catch (e) {} }
      if (el) { el.volume += (v - el.volume) * Math.min(1, dt * 4); if (v <= 0.02 && el.volume < 0.02) { el.pause(); delete SND.loops[k]; } } } }
  function loopsStop() { for (const k in SND.loops) try { SND.loops[k].pause(); } catch (e) {} SND.loops = {}; }
  const ATK = { crawler: RA + 'boxer-punch.mp3', cannon: RA + 'plasma-cannon.mp3', drone: RA + 'bot-laser.mp3', guard: RA + 'boxer-punch.mp3', pistol: RA + 'laser.mp3' };
  // ---------- the robots (Pearl Sail models + the shared light combat) ----------
  let CB = null, CG = null, BL = null, nB = 0; const bots = [], tnC = {};
  const toonC = c => tnC[c] || (tnC[c] = new THREE.MeshToonMaterial({ color: c })), outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  const Mk = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline && !touch) { geo.computeBoundingBox(); const s3 = new THREE.Vector3(); geo.boundingBox.getSize(s3); const o = new THREE.Mesh(geo, outlineMat); if (radius) o.scale.setScalar(1 + outline / radius); else o.scale.set(1 + 2 * outline / Math.max(s3.x, 0.01), 1 + 2 * outline / Math.max(s3.y, 0.01), 1 + 2 * outline / Math.max(s3.z, 0.01)); m.add(o); } (parent || p2G).add(m); return m; };
  function ensureCB() { if (CB) return; CG = new THREE.Group(); CG.position.y = gy0; scene.add(CG); BL = loadBots();
    CB = createCombat({ THREE, scene: CG, audio: aud, move: (o, nx, nz, r = 0.45) => { if (!vBlock(nx, nz, r)) { o.x = nx; o.z = nz; } else if (!vBlock(nx, o.z, r)) o.x = nx; else if (!vBlock(o.x, nz, r)) o.z = nz; } }); }
  const WAVES = [[['crawler', 'gloves'], ['drone', ''], ['crawler', 'gloves'], ['drone', '']], [['drone', ''], ['drone', ''], ['guard', 'sword'], ['crawler', 'cannon'], ['crawler', 'gloves'], ['drone', '']]];   // s327: wave 2 opens with drones flying out of the building
  const FOPT = { crawler: { hp: 45, dmg: 9, speed: 3, cd: 1.5, reach: 1.7 }, cannon: { hp: 45, dmg: 11, speed: 2, ranged: true, cd: 2.2, wind: 0.8 }, drone: { hp: 25, dmg: 7, speed: 4, fly: 2.0, cd: 1.6 }, guard: { hp: 90, dmg: 13, speed: 2.4, cd: 1.7, reach: 1.8 } };
  function spawnBot(type, v, k) { ensureCB(); const w = new THREE.Group(); CG.add(w); const b = buildBot({ THREE, M: Mk, toon: toonC, glowTex, outlineMat }, type, BL.look[type], v); b.rotation.y = -PI / 2; w.add(b);
    const sd = (k % 2 ? 1 : -1) * (0.8 + (k >> 1) * 1.4), [x0, z0] = at(0.1, sd * 0.25), [x1, z1] = at(2.8 + Math.random(), sd); w.position.set(x0, 0.06, z0); w.rotation.y = faceOut;
    bots.push({ w, b, type, v, t: 0, x0, z0, x1, z1, f: null, n: null, key: 'robBot' + (++nB), dT: 0, atkT: 0 }); aud.tone(220, 0.25, 0.04, 'sawtooth');
    if (type === 'drone') { rsfx(RA + 'drone-fly.mp3', 0.95, 0.25); aud.burst(0.7, 500, 0.18); } }   // s327: the rotor whine as each drone bursts out of the doors
  function beamFx(a, b, col) { const L = a.distanceTo(b); if (L < 0.01) return; const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 6, 1, true).translate(0, 0.5, 0).rotateX(PI / 2), basic(col, 0.95, true)); m.position.copy(a); m.lookAt(b); m.scale.set(1, 1, L); CG.add(m); BEAMS.push({ m, t: 0 }); }
  function botsTick(dt, P, fox) { const t = performance.now() / 1000; try { pulseEyes(THREE, t); } catch (e) {}
    for (const q of bots) { q.t += dt;
      if (!q.f) { const k = Math.min(1, q.t / 0.8), e = k * (2 - k); q.w.position.set(lerp(q.x0, q.x1, e), 0.06 + (q.type === 'drone' ? 2 * e : 0), lerp(q.z0, q.z1, e)); poseBot(q.b, q.type, { mode: 'idle', speed: 3, dt, t });
        if (k >= 1) { q.n = { key: q.key, x: q.x1, z: q.z1, face: faceOut, c: q.w, speedNow: 0 }; q.f = CB.add(q.n, FOPT[q.v === 'cannon' ? 'cannon' : q.type]);
          q.f.anim = (dt2, spd) => { const f = q.f; if (q.lastSt === 'wind' && f.state !== 'wind' && !f.down) rsfx(ATK[q.v === 'cannon' || q.v === 'pistol' ? q.v : q.type] || ATK.crawler, 0.7, 0.05); q.lastSt = f.state; let mode = 'idle', p = 0; if (f.state === 'wind') { mode = 'tell'; p = f.t / f.wind; q.atkT = 0.3; } else if (q.atkT > 0) { q.atkT -= dt2; mode = 'atk'; p = 1 - q.atkT / 0.3; } poseBot(q.b, q.type, { mode, p, speed: spd, dt: dt2, t }); };
          CB.engage([q.key]); }
        continue; }
      if (q.hp0 != null && q.f.hp < q.hp0 && !q.f.down) rsfx('audio/laser/hit-metal' + (Math.random() < 0.5 ? '' : '-thin') + '.mp3', 0.55); q.hp0 = q.f.hp;
      if (q.f.down && !q.dead) { q.dead = 1; rsfx(RA + 'explode.mp3', 0.6, 0.02); }
      if (q.f.down) { q.dT += dt; if (q.dT > 1.1 && q.w.visible) { q.w.visible = false; puff(q.w.position.x, gy0 + 0.8, q.w.position.z, 3, 0.8); aud.burst(0.35, 260, 0.3); } } }
    loopsTick(dt, P, true);
    if (demo) CB.P.hp = CB.P.max;   // the demo never gets knocked down
    const r = CB.update(dt, { x: P.x, z: P.z, y: P.y - gy0, face: P.yaw }, fox); if (fox) CB.pose(fox);
    if (r.playerDown) { CB.P.hp = Math.round(CB.P.max * 0.6); D.toast = 'KNOCKED DOWN! UP YOU GET, KEEP FIGHTING'; D.toastT = 2.6; } }
  const botsLeft = () => bots.filter(q => q.w.visible && (!q.f || !q.f.down)).length, waveDown = () => bots.filter(q => q.wave === D.wave && q.f && q.f.down).length;
  function robFight(dt) { D.rShot = (D.rShot || 0) - dt; const al = bots.filter(q => q.f && !q.f.down); if (!al.length) return; let best = al[0], bd = 1e9; for (const q of al) { const d = Math.hypot(q.n.x - rob.position.x, q.n.z - rob.position.z); if (d < bd) { bd = d; best = q; } }
    const face = Math.atan2(best.n.x - rob.position.x, best.n.z - rob.position.z); rob.rotation.y += angD(face, rob.rotation.y) * Math.min(1, dt * 6);
    if (D.rShot <= 0 && bd < 34 && Math.abs(angD(face, rob.rotation.y)) < 0.3) { const ok = CB.attack('range', { x: rob.position.x, z: rob.position.z, y: 0, face }, rob, { laserDmg: 7, shotCd: 0, onShot: (a, b) => { beamFx(a, b, 0x7df9ff); rsfx('audio/laser/shot-3.mp3', 0.45); } }); if (ok) D.rShot = 1.6 + Math.random() * 0.7; } }
  function crouch(f, k) { const A = f.userData.P; if (!A || k <= 0) return; if (A.legs) for (const l of A.legs) l.rotation.x = -1.1 * k; f.position.y = gAt(f.position.x, f.position.z) - 0.32 * k; f.rotation.x = 0.18 * k; }
  function robHurtPose(k) { seatFox(rob); rob.position.y = gAt(rob.position.x, rob.position.z) - 0.4 * k; rob.rotation.x = -0.22 * k; rob.userData.mood = 'sad'; }
  function robHit() { if (D.robHit) return; D.robHit = true; D.fallT = 0; const q = bots.find(o => o.f && !o.f.down); if (q) beamFx(new THREE.Vector3(q.n.x, 1.1, q.n.z), new THREE.Vector3(rob.position.x, rob.position.y - gy0 + 1.0, rob.position.z), 0xff3b3b); aud.burst(0.2, 500, 0.3); D.toast = 'ROB IS HIT!'; D.toastT = 2.2; }
  function robWalk(dt, tgt, sp = 3.4) { const dx = tgt[0] - rob.position.x, dz = tgt[1] - rob.position.z, d = Math.hypot(dx, dz); if (d < 0.25) { kit.animFox(rob, dt, 0, false); return true; }
    const s3 = Math.min(d, sp * dt); rob.position.x += dx / d * s3; rob.position.z += dz / d * s3; rob.position.y = gAt(rob.position.x, rob.position.z); rob.rotation.y += angD(Math.atan2(dx, dz), rob.rotation.y) * Math.min(1, dt * 8); kit.animFox(rob, dt, sp, false); return false; }
  // ---------- the Part 2 beats ----------
  const Q = { s: 'door', t: 0 }, go2 = st => { Q.s = st; Q.t = 0; };
  const talkP2 = (tk, lines, then) => sayTo(tk, L2(lines), then, true);
  function p2Init() { const blown = save.flag('robDoorBlown'), won = save.flag('robBattleWon'); scorch.visible = blown; if (blown) panelsDown(); charge.visible = false; scrMode = 'off';
    if (won || blown) { rob.position.set(SP.cover[0], gAt(...SP.cover), SP.cover[1]); rob.rotation.y = faceOut; }
    if (won) { D.robHit = true; D.fallT = 1; go2(save.flag('robHurtTalk') ? 'done' : 'down'); } else go2(blown ? 'preFight' : 'door'); }
  function startLocked() { go2('locked'); speak('p2-ben-locked', 'LOCKED.', 'YOU', { done: () => { go2('toKiosk'); scrMode = 'closed'; speak('p2-rob-kiosk', ROB_P2.locked[1][2], 'ROB'); } }); }   // s321: Rob says it as he walks to the kiosk
  function boom(P) { go2('boom'); save.setFlag('robDoorBlown'); charge.visible = false; scorch.visible = true; const [fx0, fz0] = at(0.8, 0), fy = gAt(fx0, fz0);
    flash.visible = true; D.flT = 0; flash.position.set(fx0, fy + 1.6, fz0); puff(fx0, fy + 1.2, fz0, touch ? 10 : 14, 1.5);
    for (const p of panels) p.v = { vx: p.sd * 1.5, vy: 4.5, vz: 6 };   // door-local frame: +z = out of the door
    for (let i = 0; i < 10; i++) { const m = box(p2G, 0.2 + Math.random() * 0.25, 0.08 + Math.random() * 0.15, 0.2 + Math.random() * 0.3, toonM(i % 3 ? '#59606a' : '#26292d'), fx0, fy + 1.5, fz0); const a = Math.random() * PI - PI / 2 + faceOut, v = 5 + Math.random() * 6; DEB.push({ m, vx: Math.sin(a) * v, vz: Math.cos(a) * v, vy: 3 + Math.random() * 6, sp: (Math.random() - 0.5) * 12, gy: gAt(fx0, fz0) + 0.05 }); }
    { const ox = OUT[0], oz = OUT[1];
      for (let i = 0; i < (touch ? 9 : 14); i++) { const a = (Math.random() - 0.5) * 2.4 + faceOut, v = 2 + Math.random() * 5; fire(fx0 + (Math.random() - 0.5) * 0.6, fy + 0.7 + Math.random() * 1.6, fz0 + (Math.random() - 0.5) * 0.6, { delay: Math.random() * 0.12, life: 0.7 + Math.random() * 0.7, s0: 0.6, s1: 2.4 + Math.random() * 1.8, vx: Math.sin(a) * v, vz: Math.cos(a) * v, vy: 1 + Math.random() * 2.5 }); }
      for (let i = 0; i < (touch ? 4 : 7); i++) { const sd = (i / 3 - 1) * 1.1; fire(fx0 - ox * 0.5 + Math.cos(faceOut) * sd, fy + 0.3 + (i % 3) * 0.7, fz0 - oz * 0.5 - Math.sin(faceOut) * sd, { delay: 0.3 + Math.random() * 0.3, life: 2.5 + Math.random() * 2, s0: 0.7 + Math.random() * 0.4, s1: 0, vy: 0.15, lick: true }); }   // flames licking the frame
      puff(fx0, fy + 2.2, fz0, touch ? 6 : 9, 2.2); }
    if (!D.boomA) { aud.burst(1.4, 180, 0.9); aud.burst(0.4, 1400, 0.25); } D.boomA = 0; const near = Math.hypot(P.x - DW[0], P.z - DW[1]) < 6; D.shake = near ? 1.4 : 0.9; if (near) { D.toast = 'TOO CLOSE TO THE BLAST!'; D.toastT = 2; } }
  function startWave(i) { ensureCB(); CG.visible = true; D.wave = i; go2(i ? 'wave2' : 'wave1'); D.spawnQ = WAVES[i].map(x => x.slice()); D.spawnT = 0.5; D.gapT = 0; D.barked = 0; sayL(ROB_P2.bark[i ? 'fight2' : 'fight1'], 2.4); if (!i) CB.P.hp = CB.P.max; }
  function finishBattle() { loopsStop(); save.setFlag('robBattleWon'); go2('down'); try { save.addGold(60); save.addXp(120); } catch (e) {} D.toast = 'ROBOTS DOWN \u00b7 +60 G \u00b7 +120 XP'; D.toastT = 3; for (const q of bots) if (q.f && q.f.down) q.w.visible = false; }
  function p2Tick(dt, P, fox) { Q.t += dt; p2G.visible = true; if (CG) CG.visible = /wave/.test(Q.s) || bots.some(q => q.w.visible); const t = performance.now() / 1000; fxTick(dt); screenTick(dt, t);
    D.p2Talk = Q.s === 'morris';
    doorRing.visible = Q.s === 'door' && !D.walkTo && duetDone(); if (doorRing.visible) doorRing.material.opacity = 0.5 + 0.4 * Math.sin(t * 5);
    clearRing.visible = Q.s === 'count'; if (clearRing.visible) clearRing.material.opacity = 0.5 + 0.45 * Math.sin(t * 12);
    if (charge.visible) cLed.visible = Math.sin(t * (Q.s === 'count' ? 10 + Q.t * 8 : 5)) > 0;
    arrow.visible = Q.s === 'down'; if (arrow.visible) arrow.position.set(rob.position.x, gAt(rob.position.x, rob.position.z) + 2.1 + 0.15 * Math.sin(t * 4), rob.position.z);
    const dP = p => Math.hypot(P.x - p[0], P.z - p[1]);
    switch (Q.s) {
      case 'door': if (D.walkTo) return false; if (doorRing.visible && dP(SP.ring) < 1.6) startLocked(); break;
      case 'locked': rob.rotation.y += angD(Math.atan2(P.x - rob.position.x, P.z - rob.position.z), rob.rotation.y) * Math.min(1, dt * 5); break;
      case 'toKiosk': if (robWalk(dt, SP.robKiosk)) { rob.rotation.y += angD(Math.atan2(SP.kiosk[0] - rob.position.x, SP.kiosk[1] - rob.position.z), rob.rotation.y) * Math.min(1, dt * 6); if (!spkBusy() && Q.t > 0.6) { go2('ring'); ringSfx(); scrMode = 'closed'; } } return true;
      case 'kiosk': if (Q.t > 0.45 && scrMode === 'static') scrMode = 'guard'; break;
      case 'ring': if (Q.t > 1.5) { go2('kiosk'); scrMode = 'static'; aud.burst(0.4, 4000, 0.1); talkP2(kT, ROB_P2.kiosk, () => { go2('static'); scrMode = 'static'; sfx('p2-sfx-static', 0.9, () => aud.burst(1.3, 4000, 0.12)); }); } break;
      case 'static': if (Q.t > 1.4) { go2('morris'); scrMode = 'morris'; talkP2(kT, ROB_P2.morris, () => { go2('out'); scrMode = 'static'; sfx('p2-sfx-out', 0.9, () => aud.burst(0.7, 4000, 0.14)); }); } break;
      case 'out': if (Q.t > 0.8) { scrMode = 'closed';   /* s332 (Ben): the kiosk goes back to the BUILDING CLOSED notice for the charge */ go2('reveal'); talkP2(robT2, ROB_P2.key, () => go2('toDoor')); } break;   // s324 (Ben): the KEY line before the charge; WHY + THAT WASN'T MY FATHER after the blast
      case 'toDoor': carryCharge(); if (robWalk(dt, SP.charge)) { rob.rotation.y = faceIn; go2('plant'); } return true;
      case 'plant': { const A = rob.userData.P, T0 = Q.t, sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);   // s327 REBUILT (Ben): SHOT 1 side-on: Rob lifts the charge he carried over and presses it onto the doors (clank) · SHOT 2 tight on the device: his paw presses the red button, the timer starts and ticks · THEN the line
        kit.animFox(rob, dt, 0, false); rob.rotation.y += angD(faceIn, rob.rotation.y) * Math.min(1, dt * 8); if (!charge.visible && T0 < 1.7) carryCharge();
        if (T0 < 2.4 && A && A.arms) { const up = sm(T0 / 0.8); A.arms[1].rotation.x = -1.5 * up; A.arms[1].rotation.z = 0.05; A.arms[0].rotation.x = -1.3 * sm((T0 - 0.6) / 0.6) * (1 - sm((T0 - 2.0) / 0.4)); }
        if (T0 < 1.7) { const hp = handW(), tw = doorG.localToWorld(V(0, 1.3, 0.27)), k = sm((T0 - 0.7) / 1.0); charge.position.copy(hp.lerp(tw, k)); charge.rotation.set(0, faceOut, 0); }
        else if (charge.parent !== doorG) { doorG.add(charge); charge.position.set(0, 1.3, 0.27); charge.rotation.set(0, 0, 0); aud.tone(240, 0.16, 0.08, 'square'); aud.burst(0.12, 650, 0.22); puff(...tw2(), 2, 0.35); }
        if (T0 < 2.45) { const cl = doorG.worldToLocal(charge.getWorldPosition(V())); handAt(0, cl.x - 0.34, cl.y - 0.02, cl.z + 0.04); handAt(1, cl.x + 0.34, cl.y - 0.02, cl.z + 0.04); }   // s337 two paws carry + press the charge on (the body is hidden in the close-up)
        if (T0 >= 2.4) { const mv = sm((T0 - 2.4) / 0.6), pk = T0 > 3.0 && T0 < 3.4 ? Math.sin((T0 - 3.0) / 0.4 * PI) : 0, rr = sm((T0 - 3.7) / 0.6);
          if (rr < 1) handAt(1, lerp(0.42, 0.0, mv) + 0.45 * rr, lerp(1.0, 1.17, mv) - 0.3 * rr, lerp(0.9, 0.45, mv) - 0.08 * pk + 0.9 * rr); else HANDS[1].visible = false;
          if (T0 > 3.15 && !D.btn) { D.btn = 1; aud.tone(1400, 0.1, 0.06, 'square'); }
          cBtn.scale.y = T0 > 3.15 && T0 < 3.5 ? 0.4 : 1; cBtn.material.color.setHex(T0 > 3.15 && T0 < 3.9 ? 0xff6a5a : 0xd81e1e);
          if (T0 > 3.3 && tmrV < 0) { drawTimer(10); aud.tone(1700, 0.16, 0.06, 'square'); D.tick = 1.0; }
          if (tmrV >= 0) { D.tick -= dt; if (D.tick <= 0) { D.tick = 1.0; drawTimer(Math.max(0, tmrV - 1)); aud.tone(900, 0.06, 0.06, 'square'); } } }
        if (T0 > 5.6) { HANDS[0].visible = HANDS[1].visible = false; go2('count'); speak('p2-rob-3', ROB_P2.charge[0][2], 'ROB', { now: true }); } return true; }
      case 'why': if (lastP) { rob.rotation.y += angD(Math.atan2(P.x - rob.position.x, P.z - rob.position.z), rob.rotation.y) * Math.min(1, dt * 6); P.yaw += angD(Math.atan2(rob.position.x - P.x, rob.position.z - P.z), P.yaw) * Math.min(1, dt * 6); } break;   // s326: face each other for the close-ups
      case 'count': { const CT = 8; if (Q.t > 0.9) { if (robWalk(dt, SP.cover, 5.6)) { rob.rotation.y += angD(Math.atan2(DW[0] - rob.position.x, DW[1] - rob.position.z), rob.rotation.y) * Math.min(1, dt * 6); crouch(rob, 1); } } else kit.animFox(rob, dt, 0, false);
        const left = CT - Q.t; drawTimer(Math.max(0, Math.ceil(left))); if (charge.visible) cLed.visible = Math.sin(t * (6 + Q.t * 4)) > 0; const iv = lerp(1.0, 0.12, clamp(Q.t / CT, 0, 1)); D.beep = (D.beep || 0) - dt; if (D.beep <= 0 && !D.boomA) { D.beep = iv; aud.tone(1500, 0.06, 0.05, 'square'); }
        if (left <= 1.42 && !D.boomA && !isMuted()) { try { const el = D.boomEl || new Audio(VOU('p2-sfx-boom')); el.currentTime = 0; el.play().then(() => {}).catch(() => { D.boomA = 0; }); D.boomA = 1; } catch (e) {} }   // s325: p2-sfx-boom = fuse beeps then the BANG at 1.4 s, so it starts 1.4 s before the door goes
        coverRing.visible = true; coverRing.material.opacity = 0.5 + 0.4 * Math.sin(t * 6); D.toast = 'GET CLEAR \u00b7 TAKE COVER BEHIND THE BARRIER \u00b7 ' + Math.max(1, Math.ceil(left)); D.toastT = 0.3; if (left <= 0) { coverRing.visible = false; boom(P); } return true; }
      case 'boom': kit.animFox(rob, dt, 0, false); crouch(rob, Q.t < 1.2 ? 1 : 1 - (Q.t - 1.2) / 0.6); if (Q.t > 1.8) { rob.rotation.x = 0; rob.position.y = gAt(rob.position.x, rob.position.z); go2('why'); talkP2(robT2, ROB_P2.why, () => startWave(0)); } return true;
      case 'preFight': if (dP(SP.ring) < 30) startWave(0); break;
      case 'wave1': case 'wave2': {
        if (D.spawnQ.length) { D.spawnT -= dt; if (D.spawnT <= 0) { const [ty, v] = D.spawnQ.shift(); spawnBot(ty, v, WAVES[D.wave].length - D.spawnQ.length - 1); bots[bots.length - 1].wave = D.wave; D.spawnT = 0.7; } }
        botsTick(dt, P, fox);
        if (!D.barked && Q.t > (D.wave ? 5 : 7) && !spkBusy()) { D.barked = 1; sayL(ROB_P2.bark[D.wave ? 'bot2' : 'bot1'], 2.8, 'ROBOT'); }
        if (!D.robHit) { kit.animFox(rob, dt, 0, false); robFight(dt); } else { D.fallT = Math.min(1, (D.fallT || 0) + dt * 2.5); kit.animFox(rob, dt, 0, false); robHurtPose(D.fallT); }
        if (D.wave === 1 && !D.robHit && (waveDown() >= 2 || Q.t > 12)) robHit();
        if (!D.spawnQ.length && botsLeft() === 0 && Q.t > 2) { D.gapT += dt; if (D.gapT > 1.4) { if (!D.wave) startWave(1); else { if (!D.robHit) robHit(); finishBattle(); } } }
        return true; }
      case 'down': case 'done': kit.animFox(rob, dt, 0, false); robHurtPose(1); if (bots.length) botsTick(dt, P, null); return true;
    }
    kit.animFox(rob, dt, 0, false); return true; }
  function p2Talk(P) { const nr = Math.hypot(P.x - rob.position.x, P.z - rob.position.z) < 3.4;
    if (Q.s === 'door' && doorRing.visible && Math.hypot(P.x - SP.ring[0], P.z - SP.ring[1]) < 2.8) { startLocked(); return true; }
    if (Q.s === 'down' && nr) { talkP2(robT, ROB_P2.hurt, () => { save.setFlag('robHurtTalk'); go2('done'); }); return true; }
    if (Q.s === 'done' && nr) { talkP2(robT, ROB_P2.again, null); return true; } return false; }
  function p2Prompt(P) { const nr = Math.hypot(P.x - rob.position.x, P.z - rob.position.z) < 3.4; if (Q.s === 'door' && doorRing.visible && Math.hypot(P.x - SP.ring[0], P.z - SP.ring[1]) < 2.8) return 'TRY THE FRONT DOORS'; if ((Q.s === 'down' || Q.s === 'done') && nr) return 'TALK \u00b7 ROB'; return null; }
  function p2Quest() { if (!duetDone()) return 'Find the front doors of the Pearl Sail'; switch (Q.s) { case 'door': return 'Try the front doors of the Pearl Sail'; case 'count': return 'GET CLEAR · take cover behind the barrier!'; case 'plant': return 'Rob is setting a charge on the door'; case 'reveal': return 'Listen to Rob'; case 'wave1': return 'Fight off the robots (wave 1 / 2)'; case 'wave2': return 'Fight off the robots (wave 2 / 2)'; case 'preFight': return 'Get back to the Pearl Sail doors'; case 'down': return 'Check on Rob'; case 'done': return 'Go into the Pearl Sail through the blasted door'; default: return 'Machine Fleet HQ \u00b7 the front doors'; } }
  // ================= s320 THE DEMO DIRECTOR =================
  const DM = { s: 'intro', t: 0, lt: 0, endT: 0, li: null, atk: 0, mv: null };
  const dmGo = st => { DM.s = st; DM.t = 0; }, dmMove = (p, stop = 0.6, mx = 1) => { DM.mv = [p[0], p[1], stop, mx]; };
  if (demo) window.__walkAuto = P => { const m = DM.mv; if (!m) return [0, 0, 0]; const dx = m[0] - P.x, dz = m[1] - P.z, d = Math.hypot(dx, dz); if (d < m[2]) return [0, 0, 0]; return [dx / d, dz / d, Math.min(m[3], (d - m[2]) / 1.5 + 0.15)]; };
  function dmDialog(dt) { if (!dlgCtl || !dlgCtl.on()) { DM.li = null; return false; } const ln = dlgCtl.line(); if (ln !== DM.li) { DM.li = ln; DM.lt = 0; DM.endT = 0; } DM.lt += dt;
    const el = window.__voEl, playing = el && !el.ended && !el.error && !el.paused && DM.lt < 15; if (playing) DM.endT = 0; else DM.endT += dt;
    const words = ln && ln.text ? ln.text.split(' ').length : 4; if (DM.lt > words * 0.3 + 0.8 && DM.endT > 0.6 && !(ln && ln.choices)) dlgCtl.next(); return true; }
  // s320b: the walk may put you back at your saved spot after load → teleport with the walk's own tp (moves the camera too); a STUCK guard teleports you next to the target
  const dmTp = (x, z, yaw) => { const W = window.__meru2Walk; if (W && W.tp) W.tp(x, z, 0, yaw); };
  function dmStuck(dt, P) { const m = DM.mv; if (!m || D.inCar) { DM.stT = 0; DM.bestD = null; return; } const d = Math.hypot(P.x - m[0], P.z - m[1]); if (d < m[2] + 0.3) { DM.stT = 0; DM.bestD = null; return; }
    if (DM.bestD == null || d < DM.bestD - 0.4 || DM.mvK !== m[0] + ',' + m[1] && Math.abs(d - DM.bestD) > 3) { DM.bestD = d; DM.stT = 0; DM.mvK = m[0] + ',' + m[1]; return; } DM.stT += dt;
    if (DM.stT > 3) { const k = (m[2] + 0.8) / d; dmTp(m[0] + (P.x - m[0]) * k, m[1] + (P.z - m[1]) * k, Math.atan2(m[0] - P.x, m[1] - P.z)); DM.stT = 0; DM.bestD = null; } }
  function dmTick(dt, P, fox) { if (!demo) return; DM.t += dt; DM.atk -= dt; dmStuck(dt, P); DM.mv = null; const pos = o => [o.position.x, o.position.z], dP = p => Math.hypot(P.x - p[0], P.z - p[1]);
    if (dmDialog(dt)) return;
    switch (DM.s) {
      case 'intro': if (DM.t < 0.1) { D.toast = 'DEMO \u00b7 ROB & THE MACHINE FLEET HQ'; D.toastT = 3; } if (dP([362, 0]) > 3) dmTp(362, 0, -PI / 2); if (DM.t > 2.5) dmGo('toRob'); break;
      case 'toRob': if (D.st !== 'wait') { dmGo('follow'); break; } dmMove(pos(rob), 2.0, 0.6); if (dP(pos(rob)) < 2.6) talk(P); break;
      case 'follow': if (D.inCar) { dmGo('drive'); break; } if (D.st === 'lead') dmMove(pos(rob), 3.4, 0.5); else if (D.st === 'atCar') { const rx = Math.cos(D.yaw), rz = -Math.sin(D.yaw), ring = [D.x - rx * 2.4, D.z - rz * 2.4]; dmMove(ring, 0.4, 0.6); if (nearCar(P) && dP(ring) < 1.2 && !walkTalk()) getIn(P); }   /* s322: the demo lets the current duet line finish before getting in */ break;
      case 'drive': if (D.st === 'arrived' && !D.inCar) dmGo('p2'); break;
      case 'p2': if (DM.t < 1.2) break;
        if (Q.s === 'door') { if (doorRing.visible) dmMove(SP.ring, 0.3, 0.6); }
        else if (Q.s === 'count') dmMove(SP.pCover, 0.4, 1);
        else if (/wave/.test(Q.s)) { const al = bots.filter(q => q.f && !q.f.down); if (al.length) { let b = al[0], bd = 1e9; for (const q of al) { const d = dP([q.n.x, q.n.z]); if (d < bd) { bd = d; b = q; } }
            P.yaw += angD(Math.atan2(b.n.x - P.x, b.n.z - P.z), P.yaw) * Math.min(1, dt * 10); if (bd > 1.6) dmMove([b.n.x, b.n.z], 1.5, 0.8);
            if (DM.atk <= 0 && Math.abs(angD(Math.atan2(b.n.x - P.x, b.n.z - P.z), P.yaw)) < 0.35) { if (bd < 2.2) { attack('melee', P, fox, 1); DM.atk = 0.5; } else if (bd < 12) { attack('range', P, fox, 1); DM.atk = 0.45; } } } }
        else if (Q.s === 'down') { dmMove(pos(rob), 2.2, 0.6); if (dP(pos(rob)) < 2.8) p2Talk(P); }
        else if (Q.s === 'done') dmGo('exit');
        break;
      case 'exit': if (DM.t < 1) break; dmMove(SP.hireAt, 0.4, 0.5); if (dP(SP.hireAt) < 1.0) { dmGo('end'); D.toast = 'END OF DEMO \u00b7 THE BATTLE CARD TAKES YOU INTO THE PEARL SAIL'; D.toastT = 6; } break;
      case 'end': if (DM.t > 4 && window.__walkAuto) window.__walkAuto = null; break;   // your controls come back
    } }
  const fightOn = () => active() && D.st === 'arrived' && /wave/.test(Q.s);

  setup();
  // ---------------- route maths ----------------
  function onRoute(x, z) { let best = { d: 1e9 }; for (let i = 0; i < ROUTE.length - 1; i++) { const [ax, az] = ROUTE[i], [bx, bz] = ROUTE[i + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz, t = clamp(((x - ax) * vx + (z - az) * vz) / L2, 0, 1), px = ax + vx * t, pz = az + vz * t, d = Math.hypot(x - px, z - pz); if (d < best.d) best = { d, i, t, px, pz, yaw: Math.atan2(vx, vz), L: Math.sqrt(L2) }; } return best; }
  const distTo = (i, x, z) => Math.hypot(ROUTE[i][0] - x, ROUTE[i][1] - z);
  function navInfo() { const r = onRoute(D.x, D.z); const inBox = Math.hypot(D.x - BOX.x, D.z - BOX.z);
    if (r.i >= ROUTE.length - 3 && r.t > 0.35 || inBox < 22) return { dir: 'park', dist: Math.round(inBox), text: 'PARK IN THE GLOWING BOX', r };
    const tn = TURNS.find(q => q.i > r.i || (q.i === r.i + 1)) || TURNS[TURNS.length - 1], d = distTo(tn.i, D.x, D.z);
    return { dir: d < 90 ? tn.dir : 'straight', dist: Math.round(d), text: d < 90 ? (tn.dir === 'right' ? 'TURN RIGHT · LAKESIDE ROAD' : 'TURN LEFT · TO THE PEARL SAIL') : r.i === 0 ? 'STRAIGHT · ARENA ROAD' : 'STAY ON THE LAKESIDE ROAD', r }; }
  // ---------------- the vehicle controller (P.veh) ----------------
  const ctl = { kind: 'robSuv', honk() { if (!D.inCar || D.seq) return false; D.hornT = 0.55; if (!isMuted() && WS.play('car-horn', 0.85)) return true; try { const c = window.__8gAC; if (c) for (const f of [349, 440]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.02); g.gain.setValueAtTime(0.06, c.currentTime + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.55); } } catch (e) {} return true; },
    drive(dt, ix, iy, P, vBlock, keys) { const k = keys || new Set(); D.camT += dt; D.crashCd = Math.max(0, D.crashCd - dt); if (seqTick(dt)) { place(); seat(P); return; } riders(dt);
      if (D.st === 'parking') { D.parkT += dt; const t = clamp(D.parkT / 1.6, 0, 1); D.x = lerp(D.px0, BOX.x, t * t * (3 - 2 * t)); D.z = lerp(D.pz0, BOX.z, t * t * (3 - 2 * t)); D.yaw = D.yaw + angD(BOX.yaw, D.yaw) * Math.min(1, dt * 3); D.sp = 0; place(); seat(P); if (D.parkT > 2.2) { if (duetDone()) arrive(P); else { D.st = 'parkedTalk'; D.ptT = 0; D.auto = false; D.nav = null; } } return; }
      if (D.st === 'parkedTalk') { D.ptT += dt; D.sp = 0; place(); seat(P); if (duetDone() && !DU.play && D.ptT > 0.8) arrive(P); return; }   // s319 polish: finish the duet in the parked car
      let thr, st;
      if (D.auto || D.demo) { const a = autoDrive(dt); thr = a[0]; st = a[1]; D.brake = a[2]; }   // s320 demo: the autopilot steers but you are still the driver (Rob gives directions)
      else { const up = k.has('KeyW') || k.has('ArrowUp'), dn = k.has('KeyS') || k.has('ArrowDown'), lf = k.has('KeyA') || k.has('ArrowLeft'), rt = k.has('KeyD') || k.has('ArrowRight');
        thr = clamp(iy + (up ? 1 : 0) - (dn ? 1 : 0), -1, 1); st = clamp(ix + (rt ? 1 : 0) - (lf ? 1 : 0), -1, 1); if (D.brake) thr = 0; }
      const max = 17, want = thr > 0.1 ? thr * max : thr < -0.1 ? thr * 5 : 0; D.sp += clamp(want - D.sp, -dt * (D.brake ? 22 : 11), dt * 7); if (!want) D.sp *= Math.pow(0.35, dt);
      D.steer = damp(D.steer, st, 8, dt); const turn = D.steer * 1.6 * dt * clamp(Math.abs(D.sp) / 7, 0, 1) * Math.sign(D.sp || 1);
      const ny = D.yaw - turn, nx = D.x + Math.sin(ny) * D.sp * dt, nz = D.z + Math.cos(ny) * D.sp * dt;
      let hit = vBlock(nx, nz, 1.4) ? 'world' : null;
      // s320c (Ben's demo froze 43 m before the left turn: something solid sits in the lakeside road lane at ~(358, 287)): stuck on the ROUTE for 0.5 s = the royal SUV drives through world props (traffic still blocks)
      if (hit === 'world') { D.blockAt = [Math.round(nx * 10) / 10, Math.round(nz * 10) / 10]; D.ghostT = (D.ghostT || 0) + dt; if (D.ghostT > 0.5 && onRoute(nx, nz).d < 3.5) hit = null; } else D.ghostT = Math.max(0, (D.ghostT || 0) - dt * 0.25); for (const c of TRAF) if (c.g.visible && Math.hypot(c.g.position.x - nx, c.g.position.z - nz) < 2.7) hit = 'car'; if (hit) { D.hits = (D.hits || 0) + 1; D.lastHit = hit; }
      if (hit) { if (Math.abs(D.sp) > 5 && D.crashCd <= 0 && !D.auto) { D.crashCd = 3; D.brace = 1; crash(); } D.sp = -D.sp * 0.25; D.yaw = ny; } else { D.x = nx; D.z = nz; D.yaw = ny; }
      place(); seat(P); if (!D.auto) watch(dt); else if (Math.hypot(D.x - BOX.x, D.z - BOX.z) < 2.2) park(); else if (inBox() && Math.abs(D.sp) < 7) park();
      if (!D.auto && inBox() && Math.abs(D.sp) < 7) park(); },
    cam(camera, CAM, dt) { const port = camera.aspect < 1, fx = Math.sin(D.yaw), fz = Math.cos(D.yaw), gy = ground(D.x, D.z) || 0, t = D.camT;
      // s318 (Ben): get in → zoom in from the FRONT on the two foxes through the windscreen → swing round into the drive camera
      const back = port ? 11.5 : 9, hg = port ? 5.0 : 3.8, side = 1.8;
      const chase = V(D.x - fx * back + fz * side * 0, gy + hg, D.z - fz * back - fx * side * 0), sideOff = V(fz, 0, -fx).multiplyScalar(side);
      chase.add(sideOff);
      let pos, look;
      if (t < 2.2) { const k = t / 2.2, e = k * k * (3 - 2 * k), d = lerp(15, 5.2, e); pos = V(D.x + fx * d - fz * 0.8, gy + lerp(3.2, 2.0, e), D.z + fz * d + fx * 0.8); look = V(D.x + fx * 0.3, gy + 1.7, D.z + fz * 0.3); }
      else if (t < 4.0) { const k = (t - 2.2) / 1.8, e = k * k * (3 - 2 * k), a = V(D.x + fx * 5.2 - fz * 0.8, gy + 2.0, D.z + fz * 5.2 + fx * 0.8); pos = a.lerp(chase, e); const ar = Math.atan2(pos.x - D.x, pos.z - D.z); pos = V(D.x + Math.sin(ar) * lerp(5.2, back, e), lerp(gy + 2.0, chase.y, e), D.z + Math.cos(ar) * lerp(5.2, back, e)); look = V(D.x + fx * lerp(0.3, 4, e), gy + lerp(1.7, 1.2, e), D.z + fz * lerp(0.3, 4, e)); }
      else if (D.st !== 'parkedTalk' || !D.cp) { D.cp = D.cp || chase.clone(); D.cp.x = damp(D.cp.x, chase.x, 3.2, dt); D.cp.y = damp(D.cp.y, chase.y, 3.2, dt); D.cp.z = damp(D.cp.z, chase.z, 3.2, dt); pos = D.cp; look = V(D.x + fx * 5, gy + 1.2, D.z + fz * 5); }
      if (D.st === 'parkedTalk' && D.cp) { const k = Math.min(1, D.ptT / 2.5), e = k * k * (3 - 2 * k), sw = Math.sin(D.ptT * 0.12) * 0.6, fp = V(D.x + fx * 5.4 - fz * (0.9 + sw), gy + 2.0, D.z + fz * 5.4 + fx * (0.9 + sw));   // slow front shot through the windscreen
        D.cp.x = damp(D.cp.x, fp.x, 1.6 * e + 0.2, dt); D.cp.y = damp(D.cp.y, fp.y, 1.6 * e + 0.2, dt); D.cp.z = damp(D.cp.z, fp.z, 1.6 * e + 0.2, dt); pos = D.cp; look = V(D.x + fx * 0.3, gy + 1.65, D.z + fz * 0.3); }
      if (t < 4.0) D.cp = pos.clone(); camera.position.copy(pos); camera.lookAt(look); CAM.yaw = D.yaw + PI; },
    prompt: () => D.st === 'parking' ? null : D.st === 'parkedTalk' ? 'TALK \u00b7 SKIP LINE' : D.auto ? 'ROB IS DRIVING' : null,
    btn(n) { if (n === 3) D.brake = true; if (n === 1) honk(); }, btnUp(n) { if (n === 3) D.brake = false; },
    talk() { if (D.st === 'parkedTalk' && !duetDone()) { const was = DU.play; duetCut(); if (was) DU.i++; DU.gap = 0.2; return; } if (D.auto || Math.abs(D.sp) > 1) return; },   // no getting out on the way (Rob's orders)
    off(P) { D.seq = null; D.seqOutDone = true; exitCar(P, false); D.seqOutDone = false; SDOOR.rotation.y = 0; SW.visible = false; meIn.position.set(...SEATL); meIn.scale.setScalar(SC_IN); meIn.rotation.set(0, 0, 0); endPose(meIn); } };   // s636 fix: forced exits (teleports, jail, fast travel) are instant
  function seat(P) { const fx = Math.sin(D.yaw), fz = Math.cos(D.yaw), rx = Math.cos(D.yaw), rz = -Math.sin(D.yaw); P.x = D.x - rx * 0.5 - fx * 0.35; P.z = D.z - rz * 0.5 - fz * 0.35; P.y = (ground(D.x, D.z) || 0) + 0.55; P.yaw = D.yaw; P.sp = 0; P.vy = 0; P.ground = true; P.swim = false; }
  const inBox = () => { const dx = D.x - BOX.x, dz = D.z - BOX.z, c = Math.cos(BOX.yaw), s = Math.sin(BOX.yaw), u = dx * c - dz * s, v = dx * s + dz * c; return Math.abs(u) < BOX.w / 2 + 0.6 && Math.abs(v) < BOX.l / 2 + 0.6; };
  let ac = null; function honk() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (isMuted()) return; if (WS.play('car-horn', 0.85)) return; const t = ac.currentTime; for (const f of [392, 494]) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.4); } } catch (e) {} }
  function crash() { D.miss++; say(D.miss >= 2 ? 'crash2' : 'crash'); D.bump = 0.5; if (D.miss >= 2) takeOver(); }
  function watch(dt) { const n = navInfo(), r = n.r; D.nav = n;
    // spoken directions, once each
    if (r.i === 0 && !D.said.go) { D.said.go = 1; if (distTo(1, D.x, D.z) > 80) say('go'); }   // s321: the right turn comes right after you get in, so it is HERE SHE IS → TURN RIGHT
    if (r.i === 0 && distTo(1, D.x, D.z) < 70 && !D.said.right) { D.said.right = 1; say('right'); }
    if (r.i === 1 && r.t > 0.12 && !D.said.stay) { D.said.stay = 1; say('stay'); }
    if (r.i === 1 && distTo(2, D.x, D.z) < 55 && !D.said.left) { D.said.left = 1; say('left'); }
    if (r.i >= 2 && r.t > 0.25 && !D.said.park) { D.said.park = 1; say('park'); }
    if (r.i === 1 && r.t > 0.03 && r.d < 5 && !D.said.good1 && D.said.right && !DU.play) { D.said.good1 = 1; say('good', 2); } /* s330: always said after the right turn, before TELL ME */   // s319b spare lines: made the turn
    if (r.i === 1 && distTo(2, D.x, D.z) < 95 && Math.abs(D.sp) > 14 && !D.said.slow && D.said.left !== 1 && !spkBusy() && !DU.play) { D.said.slow = 1; say('slow', 2.4); }
    if (r.i >= 2 && Math.hypot(D.x - BOX.x, D.z - BOX.z) < 40 && D.said.park && !D.said.almost && !spkBusy() && !DU.play) { D.said.almost = 1; say('almost', 2); }
    // off the route / missed turns / wrong way
    const off = r.d > 9; if (off) { D.off += dt; const near = TURNS.find(q => distTo(q.i, D.x, D.z) < 34 && q.i !== D.missedNode); if (near && D.missedNode !== near.i) { D.missedNode = near.i; D.miss++; say('missed'); } } else D.off = Math.max(0, D.off - dt * 0.5);
    const wrong = !off && Math.abs(D.sp) > 3 && Math.cos(angD(D.yaw, r.yaw)) < -0.5; D.wrongT = wrong ? D.wrongT + dt : 0; if (D.wrongT > 2.5 && !D.said.wrongNow) { D.said.wrongNow = 1; say('wrong'); setTimeout(() => { D.said.wrongNow = 0; }, 6000); }
    if (D.wrongT > 2.5) D.off += dt;
    if (D.off > 15 || D.miss >= 2) takeOver(); }
  // ---------------- ROB TAKES THE WHEEL ----------------
  function takeOver() { if (D.auto) return; D.auto = true; say('take'); speak(ROB_LINES.hey[0], ROB_LINES.hey[1], 'YOU'); const r = onRoute(D.x, D.z); if (r.d > 6) { D.x = r.px; D.z = r.pz; D.yaw = r.yaw; D.sp = 4; D.cp = null; D.camT = 4; } }
  function autoDrive(dt) { const r = onRoute(D.x, D.z); let i = r.i, s = r.t * r.L + 9, tx, tz; while (i < ROUTE.length - 1) { const L = Math.hypot(ROUTE[i + 1][0] - ROUTE[i][0], ROUTE[i + 1][1] - ROUTE[i][1]); if (s <= L) { const t = s / L; tx = lerp(ROUTE[i][0], ROUTE[i + 1][0], t); tz = lerp(ROUTE[i][1], ROUTE[i + 1][1], t); break; } s -= L; i++; }
    if (tx == null || i >= ROUTE.length - 2 && r.t > 0.3) { tx = BOX.x; tz = BOX.z + 2; }
    const want = Math.atan2(tx - D.x, tz - D.z), err = angD(want, D.yaw), nextTurn = TURNS.find(q => q.i > r.i), dT = nextTurn ? distTo(nextTurn.i, D.x, D.z) : 99, dB = Math.hypot(D.x - BOX.x, D.z - BOX.z);
    const top = D.demo && !D.auto ? 7.2 : 12; let vMax = dB < 25 ? 4 : dT < 22 ? 5.5 : top; { const ta = trafAhead(); if (ta < 20) vMax = Math.min(vMax, Math.max(0, (ta - 7.5) * 0.8)); }   // s327: the autopilot follows traffic   // s322: the demo driver takes it easy so the whole duet fits the drive const fx = Math.sin(D.yaw), fz = Math.cos(D.yaw); for (const c of TRAF) { if (!c.g.visible) continue; const dx = c.g.position.x - D.x, dz = c.g.position.z - D.z, ah = dx * fx + dz * fz, sd = Math.abs(dx * fz - dz * fx); if (ah > 0 && ah < 14 && sd < 2.8 && Math.cos(angD(c.g.rotation.y, D.yaw)) > 0.5) vMax = Math.min(vMax, ah < 7 ? 0 : c.cur * 0.9); }   /* Rob brakes for the car in front */
    return [D.sp < vMax - 0.3 ? 0.8 : 0, clamp(-err * 2.2, -1, 1), D.sp > vMax + 1]; }
  // ---------------- parking + arrival ----------------
  function park() { if (D.st === 'parking') return; D.st = 'parking'; D.parkT = 0; D.px0 = D.x; D.pz0 = D.z; D.sp = 0; D.nav = null; boxG.visible = false; }
  function arrive(P) { save.setFlag('robArrived'); D.st = 'arrived'; say('here', 3.2); exitCar(P, true); }
  function exitCar(P, arrived) { if (!D.inCar) return; if (meIn.userData.P && meIn.userData.P.fore && !D.seqOutDone) { if (!D.seq) D.seq = { ph: 'out', t: 0, done: () => { D.seqOutDone = true; exitCar(P, arrived); D.seqOutDone = false; } }; return; } D.inCar = false; D.auto = false; P.veh = null; meIn.visible = false; robIn.visible = false; line.visible = false; boxG.visible = false;
    const rx = Math.cos(D.yaw), rz = -Math.sin(D.yaw); P.x = D.x - rx * 2.2; P.z = D.z - rz * 2.2; P.y = ground(P.x, P.z) || 0; P.yaw = D.yaw; rob.visible = true; rob.position.set(D.x + rx * 2.2, ground(D.x + rx * 2.2, D.z + rz * 2.2) || 0, D.z + rz * 2.2); rob.rotation.y = D.yaw;
    if (arrived) { D.walkTo = DOOR.slice(); } if (me) me.visible = true; }
  function trafAheadPlace() { const L3 = TRAF.filter(c => c.li === 3), Z = [74, 98, 124, 152]; L3.forEach((c, i) => { c.t = (Z[i % Z.length] - 60) / 258; c.cur = c.sp; }); }   // s328 (Ben): cars on the road in front of you
  function getIn(P) { trafAheadPlace(); D.inCar = true; D.st = 'drive'; D.camT = 0; D.cp = null; D.auto = false; D.miss = 0; D.off = 0; D.missedNode = -1; D.said = {}; D.sp = 0; D.demo = demo; duetCut(); DU.gap = 1.2; if (!DU.started) Object.assign(DU, { i: 0, t: 0, gap: 2.5, play: false, el: null }); DU.started = true;   /* s322: the duet carries on from the walk */ P.veh = ctl; P.car = false; P.boat = false; P.ab = null; rob.visible = false; meIn.visible = true; robIn.visible = true; seatFox(meIn); seatFox(robIn); if (meIn.userData.P && meIn.userData.P.fore) D.seq = { ph: 'in', t: 0 }; line.visible = true; boxG.visible = true; carRing.visible = false; seat(P); D.said.car = 1; say('car'); speak('rob-radio', 'YOU CAN CHANGE THE RADIO, BUT KING HAS HIS FAVORITES SAVED.', 'ROB'); /* s330 (Ben) */ }
  // ---------------- per frame (meru2-walk.js news chain) ----------------
  // s327 SCENE AUDIO (Ben): the lake lapping is turned way down for the whole scene; the zone music gives way to: car RADIO lofi → background lofi once you are out → BATTLE music when the robots come out → lofi again after
  const LF = lofi({ muted: isMuted }); let BM = null, musK = '', ovK = '';
  function musicTick(P, on) { let want = null; const scene = on && D.st !== 'wait';
    if (scene) { if (D.inCar) want = 'radio'; else if (D.st === 'arrived') want = /wave/.test(Q.s) ? 'battle' : Q.s === 'done' && Math.hypot(P.x - DW[0], P.z - DW[1]) > 45 ? null : 'bg'; }
    if (want !== musK) { musK = want; if (want === 'radio' || want === 'bg') { LF.play(want); if (BM) try { BM.stop(); } catch (e) {} } else if (want === 'battle') { LF.stop(); try { if (!BM) BM = battleMusic(); BM.start(); } catch (e) {} } else { LF.stop(); if (BM) try { BM.stop(); } catch (e) {} } }
    const ov = scene && !(D.st === 'arrived' && Q.s === 'done' && !want) ? (want ? 'm0' : 'm1') : ''; if (ov !== ovK) { ovK = ov; sceneAudio(ov ? { music: want ? 0 : 1, amb: 0.12 } : null); }
    if (want === 'battle' && BM && BM.intensity) try { BM.intensity(Math.min(1, 0.55 + botsLeft() * 0.1)); } catch (e) {} LF.tick(); }
  // s327 THE TRAIN (Ben): it rolls over the lakeside road bridge (z 280) just as you drive under it, with the rumble + clack of the rails
  // s328 THE TRAIN (Ben): the scene DRIVES it: it rolls into frame over the lakeside road as you drive up and is right over the road as you pass under (train.scriptS); released to its schedule after
  const TR = { on: false, sc: null, S: 0, ct: 0, rt: 0, after: 0 }, CROSS = [358.2, 280], VT = 11;
  function crossS() { const pts = train.line; let acc = 0, best = 1e9, sc = 0; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], ax = a[0] ?? a.x, az = a[1] ?? a.z, bx = b[0] ?? b.x, bz = b[1] ?? b.z, l = Math.hypot(bx - ax, bz - az);
      const dx = bx - ax, dz = bz - az, u = clamp(((CROSS[0] - ax) * dx + (CROSS[1] - az) * dz) / (l * l || 1), 0, 1), d = Math.hypot(ax + dx * u - CROSS[0], az + dz * u - CROSS[1]); if (d < best) { best = d; sc = acc + u * l; } acc += l; } return sc; }
  function trainTick(dt) { if (!train || !train.line) return; const T = train;   // s338 (Ben: a frozen, flickering train vanished then came back): the scene takes the train the moment you get in (no jump later), measured on the real rail curve, and paces it so it reaches the bridge as you near it
    const rem = () => (D.z < 60 && D.x < 352 ? Math.max(0, 358.2 - D.x) + (276 - 51.8) : 276 - D.z), driving = D.inCar && D.st === 'drive' && rem() > 0;
    if (driving && !TR.on) { if (TR.sc == null) TR.sc = T.sAt ? T.sAt(CROSS[0], CROSS[1]) : crossS(); TR.on = true; TR.after = 0; TR.R1 = Math.max(40, rem() * 0.33); TR.S = TR.sc - VT * ((rem() - TR.R1) / 8.5); T.scriptS = TR.S; T.scriptV = VT; }
    if (!TR.on) return;
    if (driving) { const PT = T.PITCH || 24, R = rem(), vc = D.x < 352 && D.z < 60 ? 8.5 : Math.max(4, Math.abs(D.sp)), R1 = TR.R1 || 60,   // s338c (Ben: start it 33 % earlier): the FRONT car reaches the bridge with a third of the drive left; the LAST car is over the road as you pass under
        want = R > R1 ? TR.sc - VT * ((R - R1) / vc) : TR.sc + 3 * PT * (1 - R / R1), vv = clamp(VT + (want - TR.S) * (R < 120 ? 0.6 : 0.15), 5, 17); TR.S += vv * dt; T.scriptV = vv; }
    else { TR.S += VT * dt; T.scriptV = VT; TR.after += dt; if (TR.after > 9) { T.release(VT); TR.on = false; return; } }
    T.scriptS = TR.S;
    if (isMuted() || !T.carF) return; let dm = 1e9; for (const F of T.carF) dm = Math.min(dm, Math.hypot(F.x - D.x, F.z - D.z)); const vol = Math.max(0, 1 - dm / 95) * Math.min(1, (T.scriptV || 0) / 6); if (vol < 0.01) return;
    TR.rt -= dt; if (TR.rt <= 0) { TR.rt = 0.16; aud.burst(0.34, 85, 0.5 * vol); aud.burst(0.2, 260, 0.12 * vol); }
    TR.ct -= dt; if (TR.ct <= 0) { TR.ct = Math.max(0.3, 13 / Math.max(T.scriptV || 4, 4)); aud.burst(0.045, 1900, 0.32 * vol); setTimeout(() => aud.burst(0.045, 1700, 0.28 * vol), 95); } }
  function tick(dt, P, fox) { me = fox; const on = active();
    if (playGo && on && P && window.__meru2Walk) { if (playGo === true) playGo = performance.now(); if (performance.now() - playGo > 12000) playGo = false; else if (Math.hypot(P.x - 362, P.z) > 25) { Object.assign(P, { x: 362, z: 0, vy: 0, sp: 0, car: false }); P.y = ground(362, 0) || 0; P.yaw = -PI / 2; } }   // s338i: the game's own start (fountain) lands a moment later, so hold the arena gate spot for 12 s
    if (plantGo && on && D.st === 'arrived' && P) { plantGo = false; const [px, pz] = at(3.6, 1.2); Object.assign(P, { x: px, z: pz, vy: 0, sp: 0, car: false }); P.y = ground(px, pz) || 0; P.yaw = Math.atan2(DW[0] - px, DW[1] - pz); rob.position.set(SP.robKiosk[0], ground(...SP.robKiosk) || 0, SP.robKiosk[1]); scrMode = 'closed'; go2('reveal'); talkP2(robT2, ROB_P2.key, () => go2('toDoor')); } musicTick(P, on); if (on) trainTick(dt); if (on) { lastP = P; dmTick(dt, P, fox); spkTick(dt); dlgLip(dt); mouthTick(dt); } rob.visible = on && !D.inCar; suv.visible = on; stepTraffic(dt, on && (D.inCar || Math.hypot(P.x - 358, P.z - 190) < 200));
    if (D.toastT > 0) D.toastT -= dt;
    if (!on) { carRing.visible = false; p2G.visible = false; if (CG) CG.visible = false; return; }
    if (D.st === 'arrived') { duetTick(dt); if (p2Tick(dt, P, fox)) return; }
    if ((D.st === 'lead' || D.st === 'atCar') && DU.started && (DU.i < 4 || DU.play)) duetTick(dt);   // s326: the walk carries duet lines 1-4; HOW DOES IT FEEL is the first line in the car
    if (D.inCar && !isMuted()) { if (!D.eng) D.eng = WS.loop('car-drive'); const k = clamp(Math.abs(D.sp) / 17, 0, 1); D.eng.set(0.3 + k * 0.45, 0.75 + k * 0.5); } else if (D.eng) { D.eng.stop(); D.eng = null; }   // s711 recorded engine
    if (D.inCar) { if (fox) fox.visible = false; meIn.position.y = 0.3 + Math.sin(performance.now() / 160) * 0.004 * Math.abs(D.sp); const t = performance.now() / 1000;
      dashes.forEach((q, i) => { q.m.material.opacity = 0.5; }); lineMat.opacity = 0.35 + 0.25 * Math.sin(t * 4); boxG.userData.fill.material.opacity = 0.14 + 0.12 * Math.sin(t * 5); kit.animFox(meIn, dt, 0, false); kit.animFox(robIn, dt, 0, false); seatFox(meIn); seatFox(robIn); duetTick(dt); return; }
    // Rob walking (leading you to the car / to the doors)
    if (D.st === 'lead' || D.walkTo) { let tgt = D.walkTo; if (D.st === 'lead') { const p = WALK[D.walkI]; tgt = p; if (!p) { D.st = 'atCar'; tgt = null; rob.rotation.y = PI; } }
      if (tgt) { const dx = tgt[0] - rob.position.x, dz = tgt[1] - rob.position.z, d = Math.hypot(dx, dz), wait = D.st === 'lead' && Math.hypot(P.x - rob.position.x, P.z - rob.position.z) > 9;
        if (d > 0.3 && !wait) { const s = Math.min(d, 3.4 * dt); rob.position.x += dx / d * s; rob.position.z += dz / d * s; rob.position.y = ground(rob.position.x, rob.position.z) || 0; rob.rotation.y += angD(Math.atan2(dx, dz), rob.rotation.y) * Math.min(1, dt * 8); kit.animFox(rob, dt, 3.4, false); }
        else { if (d <= 0.3) { if (D.st === 'lead') D.walkI++; else { D.walkTo = null; rob.rotation.y = 0; } } kit.animFox(rob, dt, 0, false); if (wait) rob.rotation.y += angD(Math.atan2(P.x - rob.position.x, P.z - rob.position.z), rob.rotation.y) * Math.min(1, dt * 5); } return; } }
    kit.animFox(rob, dt, 0, false);
    carRing.visible = D.st === 'atCar'; if (carRing.visible) { const rx = Math.cos(D.yaw), rz = -Math.sin(D.yaw); carRing.position.set(D.x - rx * 2.4, (ground(D.x, D.z) || 0) + 0.06, D.z - rz * 2.4); carRing.material.opacity = 0.5 + 0.4 * Math.sin(performance.now() / 200); } }
  const nearRob = P => rob.visible && Math.hypot(P.x - rob.position.x, P.z - rob.position.z) < 3.2;
  const walkTalk = () => DU.started && !D.inCar && (DU.play || DU.i < 4);
  const nearCar = P => { const rx = Math.cos(D.yaw), rz = -Math.sin(D.yaw); return Math.hypot(P.x - (D.x - rx * 2.4), P.z - (D.z - rz * 2.4)) < 2.6; };
  function talk(P) { if (!active() || D.inCar) return false; if (D.st === 'arrived') return p2Talk(P);
    if (D.st === 'wait' && nearRob(P)) { sayTo(robT, ROB_LINES.hi.map(l => ({ ...l })), () => { save.setFlag('robMet'); D.st = 'lead'; D.walkI = 1; Object.assign(DU, { i: 0, gap: 0.9, play: false }); DU.started = true; }, true); return true; }   // s322 (Ben): the meeting stays in the dialogue box; the DUET starts on the walk to the car
    if (D.st === 'atCar' && nearCar(P)) { if (walkTalk()) { D.toast = 'ROB IS STILL TALKING…'; D.toastT = 1.4; return true; } getIn(P); return true; }
    return false; }
  function prompt(P) { if (!active() || D.inCar) return null; if (D.st === 'arrived') return p2Prompt(P); if (D.st === 'wait' && nearRob(P)) return 'TALK \u00b7 ROB'; if (D.st === 'atCar' && nearCar(P)) return walkTalk() ? 'LISTEN TO ROB\u2026' : 'GET IN \u00b7 DRIVE THE ROYAL SUV'; return null; }
  function quest() { if (!active()) return null; if (D.st === 'wait') return 'Meet the Meru Guard outside the arena'; if (D.st === 'lead' || D.st === 'atCar') return 'Follow Rob to the car'; if (D.st === 'parkedTalk') return 'Parked at the Pearl Sail \u00b7 talking with Rob'; if (D.inCar) return D.auto ? 'Rob is driving to the Pearl Sail' : 'Drive to the Machine Fleet HQ · the Pearl Sail'; if (D.st === 'parking') return 'Park in the glowing box'; if (D.st === 'parkedTalk') return 'Parked at the Pearl Sail \u00b7 talking with Rob'; if (D.st === 'arrived') return p2Quest(); return null; }
  function nav() { return D.inCar && !D.auto && D.nav && D.st === 'drive' ? { dir: D.nav.dir, dist: D.nav.dist, text: D.nav.text, miss: D.miss, off: Math.round(Math.min(15, D.off)) } : D.inCar && D.auto ? { dir: 'rob', dist: Math.round(Math.hypot(D.x - BOX.x, D.z - BOX.z)), text: 'ROB IS DRIVING', miss: D.miss, off: 0 } : null; }
  const duet = () => (!active() ? null : SPK.cur ? { who: SPK.cur.who, text: SPK.cur.text } : DU.play && ROB_DUET[DU.i] ? { who: ROB_DUET[DU.i][0] === 'rob' ? 'ROB' : 'YOU', text: ROB_DUET[DU.i][2] } : null);   // s321: the caption (speech queue first, else the duet)
  // the blasted door = the way into the Pearl Sail battle (the walk shows its BATTLE card); before the blast the doors stay shut
  const hire = P => (active() && D.st === 'arrived' && Q.s === 'done' && pearlB && pearlB.hiring && Math.hypot(P.x - SP.hireAt[0], P.z - SP.hireAt[1]) < 2.8 ? { b: pearlB, x: SP.hireAt[0], z: SP.hireAt[1] } : null);
  function attack(kind, P, fox, k, o = {}) { if (!fightOn() || !CB) return false; const G0 = V(0, gy0, 0);
    CB.attack(kind, { x: P.x, z: P.z, y: P.y - gy0, face: P.yaw }, fox, { meleeDmg: 30 * (k || meleeK()), laserDmg: o.laserDmg || 15, reach: o.reach, cd: o.cd, cone: o.cone, noSwing: o.noSwing, shotCd: o.shotCd, from: o.from ? o.from.clone().sub(G0) : null, onShot: o.onShot ? (a, b, h) => o.onShot(a.add(G0), b.add(G0), h) : null }); return true; }
  // s321 CINEMATIC SHOTS (Ben): the kiosk centred (Rob at its side), a close-up of Rob's hands on the charge, a wide shot of the blast from behind the barriers
  const CC = { k: 0, tp: V(), tl: V(), cl: V(), key: null, fov0: null }, PCF = { c: null, t: 0 };
  function camShot() { if (!active() || D.st !== 'arrived') return null; const port = typeof innerWidth !== 'undefined' && innerWidth < innerHeight;
    if (/^(toKiosk|ring|kiosk|static|morris|out)$/.test(Q.s)) { const ky = kiosk.position.y + 1.62, [cx, cz] = at(1.0 + (port ? 2.9 : 2.2), 3.4 - (port ? 0.2 : 0.45)), [lx, lz] = at(1.13, 3.4);   // s323: LOCKED on the kiosk screen, level with it; aimed a little low so the screen sits in the UPPER part of the frame, above the dialogue box
      return [V(cx, ky, cz), V(lx, ky, lz), 1]; }   /* s325 (Ben): screen dead centre */
    if (Q.s === 'toDoor' || Q.s === 'plant') {   // s331: shots from the PLANT CAM WORKSHOP (worlds/rob-plant-cam.js, localStorage rob.plantCam.v1)
      const now = performance.now(); if (!PCF.c || now - PCF.t > 1000) { PCF.c = loadPlantCam(); PCF.t = now; }
      const res = (v, sh) => v === 'charge' ? CHARGE_AT : [-(rob.position.z - DW[1]), rob.position.x - DW[0], sh.lookH ?? 1.15];
      const sh = plantShot(PCF.c, Q.s, Q.s === 'plant' ? Q.t : Q.t, port, res); if (!sh) return null;
      const w3 = q => { const [x, z] = at(q[0], q[1]); return V(x, gy0 + q[2], z); };
      return [w3(sh.p), w3(sh.l), 1, false, sh.fov, sh.hideRob, sh.blend, sh.key]; }
    if (Q.s === 'why' && dlgCtl && dlgCtl.on() && lastP) { const ln = dlgCtl.line(), pl = ln && ln.who === 'player', f = pl ? me : rob, o = pl ? rob : f === rob && me ? me : null;   // s326: dialogue close-ups, the speaker facing the camera
      const hp = f && f.userData.P && f.userData.P.head ? f.userData.P.head.getWorldPosition(V()) : V(pl ? lastP.x : rob.position.x, gy0 + 1.45, pl ? lastP.z : rob.position.z), op = pl ? V(rob.position.x, 0, rob.position.z) : V(lastP.x, 0, lastP.z);
      const dx = op.x - hp.x, dz = op.z - hp.z, dl = Math.hypot(dx, dz) || 1, fx = dx / dl, fz = dz / dl; return [V(hp.x + fx * 1.9 + fz * 0.35, hp.y + 0.06, hp.z + fz * 1.9 - fx * 0.35), V(hp.x, hp.y - 0.04, hp.z), 1, pl, null, false, 0, null, f]; }   // s338f: 1.9 m (was 1.35: the lens sat inside the other fox / ink shells); sh[8] = the speaker
    if (Q.s === 'boom' || (Q.s === 'count' && Q.t > 6.4)) { const [cx, cz] = at(port ? 9 : 7.5, port ? -5.5 : -4.5);   /* door blast shot (unchanged) */ return [V(cx, gy0 + 1.9, cz), V(DW[0], gy0 + 1.5, DW[1]), 1]; }   // on the door for the blast
    return null; }
  const QT = new THREE.Quaternion(), CAMD = new THREE.Object3D();
  function camFix(c, dt = 0.016) { if (!c || !c.position) return; const sh = camShot(); CC.k = sh ? Math.min(1, CC.k + dt / (CC.k > 0 ? 0.6 : 0.6)) : Math.max(0, CC.k - dt / 0.5);
    if (sh) { if (sh[7]) { const nk = sh[7] !== CC.key; if (CC.k > 0.5 && sh[6] > 0 && !nk) { CC.tp.copy(sh[0]); CC.tl.copy(sh[1]); } else if (CC.k > 0.5 && sh[6] > 0 && nk && CC.bl == null) { CC.bl = 0; CC.bp = CC.tp.clone(); CC.bt = CC.tl.clone(); } if (CC.bl != null) { CC.bl = Math.min(1, CC.bl + dt / sh[6]); const e2 = CC.bl * CC.bl * (3 - 2 * CC.bl); CC.tp.copy(CC.bp).lerp(sh[0], e2); CC.tl.copy(CC.bt).lerp(sh[1], e2); if (CC.bl >= 1) { CC.bl = null; CC.key = sh[7]; } } else { CC.tp.copy(sh[0]); CC.tl.copy(sh[1]); CC.key = sh[7]; } }   // s331 workshop shots: blend > 0 = glide into the next shot, 0 = a clean cut
      else { const cut = sh[2] && CC.tp.distanceToSquared(sh[0]) > 9 && CC.k > 0.5; CC.tp.copy(sh[0]); CC.tl.copy(sh[1]); if (cut) CC.k = 1; CC.key = null; } }   // a new shot far away = a clean cut
    { const clear = active() && D.st === 'arrived' && /^(toDoor|plant|count|boom)$/.test(Q.s);   // s335 (Ben: view blocked): town foxes near the doors step out of the scene while Rob sets the charge
      if (clear && CC.npc && performance.now() - CC.npcT > 1000) { for (const o of CC.npc) o.visible = true; CC.npc = null; }   // re-scan each second (foxes that wander in, online friends)
      if (clear && !CC.npc) { CC.npc = []; CC.npcT = performance.now(); const mine = new Set([rob, me, robIn, meIn, FEED.guard, FEED.morris].filter(Boolean)); scene.traverse(o => { if (!o.userData || !o.userData.P || mine.has(o) || !o.visible) return; const wp = o.getWorldPosition(V()); if (Math.hypot(wp.x - DW[0], wp.z - DW[1]) < 14) CC.npc.push(o); }); }
      if (clear && CC.npc) for (const o of CC.npc) o.visible = false;   // every frame (town life re-shows them)
      else if (!clear && CC.npc) { for (const o of CC.npc) o.visible = true; CC.npc = null; } }
    { const hideMe = !!sh && (Q.s === 'toDoor' || Q.s === 'plant' || Q.s === 'boom' || Q.s === 'count'),   /* s336: your fox never stands in a scripted shot (blast cam too) */ hide = hideMe && !!sh[5]; if (hideMe) { if (hide) rob.visible = false; if (me) me.visible = false; CC.hid = 1; } else if (CC.hid) { CC.hid = 0; if (me) me.visible = true; } if (sh && sh[3] && me) me.visible = true; }
    { const spk = sh && Q.s === 'why' ? sh[8] : null;   // s338f (Ben: faces covered by the back of another head): FACE CUTAWAY = every mesh (foxes, ink shells, props) between the lens and the speaker's face, or round the lens, is hidden while the line plays
      if (CC.fh) { for (const o of CC.fh) o.visible = true; CC.fh = null; }
      if (spk) { const now = performance.now(); if (!CC.fc || now - CC.fcT > 1000) { CC.fcT = now; CC.fc = []; const own = new Set(); spk.traverse(q => own.add(q)); scene.traverse(o => { if (!o.isMesh || own.has(o) || o.isInstancedMesh || !o.geometry) return; o.getWorldPosition(CC.v1 || (CC.v1 = V())); if (CC.v1.distanceTo(CC.tp) < 9) CC.fc.push(o); }); }
        const hd = spk.userData.P && spk.userData.P.head ? spk.userData.P.head.getWorldPosition(V()) : CC.tl.clone(), a = CC.tp, d = hd.clone().sub(a), Ld = d.length(), end = Math.max(0.05, Ld - 0.3), bb = CC.bb || (CC.bb = new THREE.Box3()); d.normalize(); CC.fh = [];
        const hit = () => { if (bb.containsPoint(a)) return true; let t0 = 0, t1 = end; for (const k of ['x', 'y', 'z']) { const o = a[k], dk = d[k], mn = bb.min[k], mx = bb.max[k]; if (Math.abs(dk) < 1e-6) { if (o < mn || o > mx) return false; continue; } let u0 = (mn - o) / dk, u1 = (mx - o) / dk; if (u0 > u1) [u0, u1] = [u1, u0]; t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) return false; } return true; };
        for (const o of CC.fc) { if (!o.visible) continue; let vis = true; for (let p = o.parent; p; p = p.parent) if (!p.visible) { vis = false; break; } if (!vis) continue; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld).expandByScalar(0.06); if (hit()) { o.visible = false; CC.fh.push(o); } } }
      else CC.fc = null; }
    { const plant = !!sh && CC.k > 0.3 && (Q.s === 'toDoor' || Q.s === 'plant');   // s338d (Ben: walk shot covered, close-ups darker): CUTAWAY = anything between the camera and its target steps out of the shot + a soft FILL light rides with the camera on the plant close-ups
      if (plant && !CC.occ) { CC.occ = []; CC.hidO = []; const keep = new Set([rob, me, charge, ...(HANDS || [])].filter(Boolean)); scene.traverse(o => { if (!o.isMesh || !o.visible || o.isInstancedMesh && o.count > 400) return; for (let p = o; p; p = p.parent) if (keep.has(p)) return; o.updateWorldMatrix(true, false); if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const bs = o.geometry.boundingSphere, wp = bs.center.clone().applyMatrix4(o.matrixWorld); if (Math.hypot(wp.x - DW[0], wp.z - DW[1]) < 22 + bs.radius) CC.occ.push(o); }); }
      if (plant) { for (const o of CC.hidO) o.visible = true; CC.hidO.length = 0; const dir = CC.tl.clone().sub(CC.tp), far = dir.length() - 0.35; if (far > 0.1) { CC.ray = CC.ray || new THREE.Raycaster(); CC.ray.set(CC.tp, dir.normalize()); CC.ray.far = far; CC.ray.near = 0; for (const h of CC.ray.intersectObjects(CC.occ, false)) if (h.object.visible) { h.object.visible = false; CC.hidO.push(h.object); } } }
      else if (CC.occ) { for (const o of CC.hidO) o.visible = true; CC.occ = null; CC.hidO = null; }
      if (!CC.fill) { CC.fill = new THREE.SpotLight(0xfff4e6, 0, 9, 0.55, 0.5, 2); scene.add(CC.fill); scene.add(CC.fill.target); CC.fill2 = new THREE.PointLight(0xffffff, 0, 6, 2); scene.add(CC.fill2); }   // s338e (Ben: close-ups still dim): a BRIGHT camera light (spot on the charge + a soft point round it)
      const on = plant && Q.s === 'plant', fw = on ? 60 : 0; CC.fill.intensity = on ? fw : 0; CC.fill2.intensity = on ? 12 : 0; /* stays visible (intensity 0 when off): toggling visible recompiles every shader = a hitch */
      { const want = on ? 0.42 : 0; if (CC.glow !== want) { CC.glow = want; for (const root of [doorG, ...HANDS]) root.traverse(q => { if (!q.isMesh || !q.material || !q.material.emissive || q.material.isMeshBasicMaterial) return; const m = q.material; if (!m.userData.em0) m.userData.em0 = m.emissive.clone(); m.emissive.copy(m.userData.em0); if (want) m.emissive.add(m.color.clone().multiplyScalar(want)); }); } }   // s338f (Ben: still dim): the doors, charge + paws glow up as if lit by a camera lamp
      if (on) { CC.fill.position.copy(CC.tp).add(V(0, 0.25, 0)); CC.fill.target.position.copy(CC.tl); CC.fill.target.updateMatrixWorld(); CC.fill2.position.copy(CC.tp).lerp(CC.tl, 0.4).add(V(0, 0.35, 0)); } }
    if (CC.k > 0) { const e = CC.k * CC.k * (3 - 2 * CC.k); CAMD.position.copy(CC.tp); CAMD.up.set(0, 1, 0); CAMD.lookAt(CC.tl); QT.copy(CAMD.quaternion); if (CAMD.isObject3D && !CAMD.isCamera) QT.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), PI));   // Object3D.lookAt faces +z; a camera looks down -z
      c.position.lerp(CC.tp, e); c.quaternion.slerp(QT, e);
      if (sh && sh[4]) { if (CC.fov0 == null) CC.fov0 = c.fov; const f = CC.fov0 + (sh[4] - CC.fov0) * e; if (Math.abs(c.fov - f) > 0.01) { c.fov = f; c.updateProjectionMatrix(); } } }
    if (CC.fov0 != null && (!sh || !sh[4])) { const f = CC.k > 0 ? c.fov + (CC.fov0 - c.fov) * Math.min(1, dt * 6) : CC.fov0; c.fov = f; c.updateProjectionMatrix(); if (CC.k <= 0 || Math.abs(f - CC.fov0) < 0.05) { c.fov = CC.fov0; c.updateProjectionMatrix(); CC.fov0 = null; } }
    if (!(D.shake > 0)) return; D.shake = Math.max(0, D.shake - dt * 1.6); const k = D.shake * 0.35; c.position.x += (Math.random() - 0.5) * k; c.position.y += (Math.random() - 0.5) * k; c.position.z += (Math.random() - 0.5) * k; }
  return { busy: () => null, tick, prompt, camFix, toast: () => (D.toastT > 0 ? D.toast : ''), quit() { loopsStop(); LF.stop(); if (train && train.scriptS != null) try { train.release(VT); } catch (e) {} TR.on = false; if (BM) try { BM.stop(); } catch (e) {} sceneAudio(null); }, camLock: () => CC.k > 0.01, talk, useItem: () => false, nav, quest, D, ctl, getIn, takeOver, duet, hire, attack,
    on: () => fightOn(), hp: () => (CB ? Math.round(CB.P.hp) : 100), max: () => (CB ? CB.P.max : 100), heal: n => { if (!CB) return 100; CB.P.hp = Math.min(CB.P.max, CB.P.hp + n); return Math.round(CB.P.hp); }, foes: () => (CB ? botsLeft() : 0),
    demo: DM, p2: { rob: () => rob, Q, go2, startWave, boom: P => boom(P), bots, DU, SP, kill: () => { for (const q of bots) if (q.f && !q.f.down) { q.f.hp = 0; q.f.down = true; q.f.state = 'down'; } } },
    testDrive(P) { save.setFlag('robMet'); D.st = 'atCar'; Object.assign(D, { x: CAR0.x, z: CAR0.z, yaw: CAR0.yaw }); place(); getIn(P); } };
}
