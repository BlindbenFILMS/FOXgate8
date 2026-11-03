// 8 GATES — NEBO · THE CANDY SHOP [neboCandyShop] · CANDY SHIFT. Ben works Angelica's candy shop in Nebo Town Square.
// Built on the Meru Burgers / Jidda Smoothie engine pattern + engine/restaurant-kit.js. Steps come from the original 2D sweets game:
//   TAFFY:   FLAVOR (tap bottle) → BOIL (stir circles, OFF THE HEAT in SOFT BALL) → PULL (drag to the green zone ×3) → CUT (swipe at the markers) → BOX
//   GUMMY:   FLAVOR → BOIL (FIRM BALL) → PIPE (hold on each mould, let go at the line) → DUST (sweep the shaker) → BOX
//   ROCK:    BOIL (HARD CRACK) → ROPE (swipe side to side, let go at the flag) → CUT → BOX            (day 2+)
//   TRUFFLE: TEMPER (hold to warm, let go to cool, stay in the band) → ROLL (circle each one) → COAT (drag into CHOCOLATE or MINT) → BOX
//   BOX:     candies hop in → swipe across the lid to tie the bow → drag the box to the right customer.
// Two modes: WALK (Game HUD mounted: walk around the shop, talk to Angelica, read the NOW HIRING card) and the SHIFT (own HUD, like Sizzle's).
// Save keys nebo.candy.*, flag candyUniform. MERGE: the room is buildCandyShop(ctx) in candy-shop.js; this file runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { ROOM, PAL, FLAVORS, COATS, buildCandyShop, bearGeo, bearShape, stripeTex, sweetMesh } from './candy-shop.js';
import { candyAudio } from './candy-audio.js';

export const SHOP = { name: 'THE CANDY SHOP', owner: 'ANGELICA', room: 'neboCandyShop' };
export const HEATS = { soft: { name: 'SOFT BALL', lo: 36, hi: 50 }, firm: { name: 'FIRM BALL', lo: 56, hi: 68 }, hard: { name: 'HARD CRACK', lo: 78, hi: 90 } };
export const CANDIES = {
  taffy: { name: 'TAFFY', heat: 'soft', steps: ['flavor', 'boil', 'pull', 'cut', 'box'], price: 6, day: 1, pieces: 6, flav: ['strawberry', 'lemon', 'blueberry', 'honey'] },
  gummy: { name: 'GUMMY BEARS', heat: 'firm', steps: ['flavor', 'boil', 'pipe', 'dust', 'box'], price: 7, day: 1, flav: ['strawberry', 'lemon', 'apple', 'blueberry'] },
  truffle: { name: 'TRUFFLES', steps: ['temper', 'roll', 'coat', 'box'], price: 8, day: 1, coats: ['cocoa', 'mint'] },
  rock: { name: 'PEPPERMINT ROCK', heat: 'hard', steps: ['boil', 'rope', 'cut', 'box'], price: 9, day: 2, pieces: 6 } };
export const STEPS = {
  flavor: ['FLAVOR', 'Add the flavor', 'Tap the bottle the ticket asks for. It goes in the pot.'],
  boil: ['BOIL', 'Boil the sugar', 'Circle your finger on the pot to stir. Tap OFF THE HEAT inside the band.'],
  pull: ['PULL', 'Pull the taffy', 'Drag the taffy away from the hook into the green zone, then let go. Three pulls.'],
  cut: ['CUT', 'Cut the pieces', 'Swipe down across the rope at each red marker.'],
  pipe: ['PIPE', 'Fill the bear moulds', 'Hold on a mould to fill it. Let go when the bar is in the green.'],
  dust: ['DUST', 'Dust with sugar', 'Sweep your finger over the bears until every one is frosted.'],
  rope: ['ROLL', 'Roll the rope', 'Swipe back and forth on the rope to roll it out. Let go when it reaches the flag.'],
  temper: ['TEMPER', 'Temper the chocolate', 'Hold to warm, let go to cool. Keep the needle in the band.'],
  roll: ['ROLL', 'Roll the truffles', 'Circle your finger on each truffle until it is round.'],
  coat: ['COAT', 'Coat the truffles', 'Drag each truffle into the bowl the ticket asks for.'],
  box: ['BOX', 'Box it up', 'Swipe across the box to tie the bow, then slide it across the counter to the customer.'] };
export const UPGRADES = [
  { id: 'thermo', name: 'COPPER THERMOMETER', cost: 40, line: 'The sugar bands are wider.' },
  { id: 'marble', name: 'COOL MARBLE', cost: 35, line: 'Taffy and rock stay warm longer.' },
  { id: 'squeeze', name: 'SQUEEZE BOTTLE', cost: 30, line: 'Jelly fills slower. Easier to stop.' },
  { id: 'ribbon', name: 'SILK RIBBON', cost: 45, line: '+2g on every box.' },
  { id: 'musicbox', name: 'MUSIC BOX', cost: 60, line: 'Happy customers tip 25% more.' }];
const SAVE = { day: 'nebo.candy.day', best: 'nebo.candy.best', upg: 'nebo.candy.upg.', stars: 'nebo.candy.stars', boxes: 'nebo.candy.boxes' };
// Nebo townsfolk from the 2D brief (square + garden)
const CUSTOMERS = [
  { name: 'ROWAN', torso: ['#6f9a4a', '#efe2c4', '#3d6322'] }, { name: 'PICA', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#c9a132', '#fbf6ee', '#7a5a1e'] },
  { name: 'TARN', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#3f5d47', '#e6b45a', '#2b4232'], outfit: 'coat' }, { name: 'ASPEN', torso: ['#d9f99d', '#fbf6ee', '#4f7a30'] },
  { name: 'WREN', fur: '#c9682a', furDark: '#8a4213', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], outfit: 'dress' }, { name: 'FABLE', torso: ['#7a3f5c', '#ff9ec4', '#46203a'], outfit: 'robe' },
  { name: 'BRACKEN', fur: '#8a5a32', furDark: '#5a3a1e', torso: ['#5f4420', '#d3b48a', '#2b1e0e'], outfit: 'coat' }, { name: 'NETTLE', torso: ['#2c4a1c', '#b7d49a', '#1a2e10'] },
  { name: 'SEDGE', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] }, { name: 'HAZEL', fur: '#b8762c', furDark: '#7a4c1e', torso: ['#9fb36a', '#fbf6ee', '#4a5a2a'], outfit: 'dress' },
  { name: 'PIPPIN', torso: ['#f2d970', '#fbf6ee', '#a8862a'] }, { name: 'BRAMBLE', fur: '#dedcd6', furDark: '#a8a6a0', torso: ['#e04a5a', '#fbf6ee', '#8f2b1e'] }];
const LINES = { order: ['Something sweet, please!', 'One box for the walk home.', 'My sweet tooth is calling.', 'Wrap it nicely, please.', 'It smells like a party in here!', 'For the harvest play!'],
  react: [['Not what I asked for.', 'Hmm. They are... sticky.'], ['They will do. Thank you.', 'Not bad at all.'], ['Lovely! Thank you!', 'Oh, these are good.'], ['PERFECT! Nebo has its sweets back!', 'Best box in the forest!']], wrong: 'I did ask for ' };
export const ANGELICA = { name: 'ANGELICA', role: 'Candy Maker', key: 'neboCandyMaker',
  hello: 'Any chance you are looking for a job? We got great candies here, super fun to make.',
  topics: [['How do I make candy?', ['Sugar and heat, and the heat is the whole of it. Soft ball is chewy, firm ball springs, hard crack goes like glass.', 'Boil it to the band the sweet wants, call it off, then it is your hands: pull it, pipe it, roll it or temper it.']],
    ['How did you get into the candy business?', ['My mother kept bees at the top of the ridge and I kept eating the honey, so she gave me a pan and told me to make my own trouble.', 'Thirty years of it. I still cannot walk past a rolling boil without putting a finger in the water.']],
    ['Sounds SWEET! Put me to work.', ['Apron is on the hook and it is your size. Ticket is on the rail.'], 'work'],
    ['I will come back.', ['Door is open. It smells better in here than out there.'], 'bye']] };
// music-box waltz in 3/4 (the 2D sweet shop's tune)
const MUSIC = (() => { const sc = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84], mel = [5, 7, 8, 7, 5, 4, 5, 3, 2, 3, 5, 4, 3, 5, 7, 5, 8, 9, 8, 7, 5, 7, 4, 5, 7, 8, 9, 8, 7, 5, 4, 5, 3, 5, 4, 2], notes = [];
  mel.forEach((i, b) => notes.push({ b, m: sc[i], d: 0.62, v: 'box' })); for (let b = 0; b < 36; b += 3) { const root = [36, 41, 43, 36][(b / 3) % 4]; notes.push({ b, m: root, d: 0.42, v: 'bass' }, { b: b + 1, m: root + 16, d: 0.26, v: 'pluck' }, { b: b + 2, m: root + 19, d: 0.26, v: 'pluck' }); }
  return { notes, beats: 36, spb: 0.29 }; })();
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

export async function createCandyShift({ container, onState = () => {}, startIn = 'walk', musicUrl, embed = false, onExit = null }) {
  const ST = createStage(container, { bg: '#2a1424' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS, sun, touch } = ST;
  sun.position.set(2, 9, 5); sun.intensity = 1.2; Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 }); sun.shadow.camera.updateProjectionMatrix();
  { const pl = new THREE.PointLight(0xffd9a0, 0.9, 9, 1.6); pl.position.set(0, 3.4, 1.5); scene.add(pl); }
  const K = buildCandyShop({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.slabTop, BT = K.backTop, CT = K.top;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd08a, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); s.position.copy(l.position).add(V3(0, -0.15, 0)); s.scale.setScalar(1.3); scene.add(s); return s; });
  const rockTex = stripeTex(canvasTex);
  let PAUSE = false, raf = 0;
  const clock = new THREE.Clock();
  const rigs = await loadCastRigs().catch(() => ({}));
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  const noWeapons = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };

  // ---------- cast ----------
  const angelica = noWeapons(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#f0a8c8', furDark: '#c0709a', muzzle: '#fff0f6', chin: '#ffffff', snout: '#ffd9e8', paw: '#e79ac2', tailBase: '#e79ac2', tailMid: '#ffd9e8', tailTip: '#ffffff', earInner: '#9d174d', blush: 0.5 }, torso: ['#f6c9dd', '#d17aa6', '#6d3350'], outfit: 'dress', crest: '', gear: 'none', mood: 'happy' }));
  angelica.position.set(K.angelica.x, 0, K.angelica.z); angelica.rotation.y = 0;
  // the worker (always Ben in the uniform) and the walker (whoever the HUD's FOX SWAP picked)
  const ben = noWeapons(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbf6ee', '#fbf6ee', PAL.pink], crest: '', gear: 'none', mood: 'happy' })); ben.visible = false;
  const lollyPrint = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 92); g.fillStyle = '#fbf6ee'; g.fillRect(-6, 0, 12, 70); g.strokeStyle = PAL.ink; g.lineWidth = 6; g.strokeRect(-6, 0, 12, 70);
    g.beginPath(); g.arc(0, -10, 54, 0, 7); g.fillStyle = PAL.pink; g.fill(); g.stroke(); g.strokeStyle = '#fbf6ee'; g.lineWidth = 10; g.beginPath(); for (let a = 0; a < 16; a += 0.2) g.lineTo(Math.cos(a) * a * 3.1, -10 + Math.sin(a) * a * 3.1); g.stroke(); g.restore();
    g.save(); g.translate(128, 200); g.rotate(-0.05); g.fillStyle = PAL.plum; g.fillRect(-120, -28, 240, 56); g.font = 'italic 900 40px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd23a'; g.fillText('CANDY SHOP', 0, 2); g.restore(); });
  const uniParts = dinerUniform(ST, ben, { print: lollyPrint, printY: 1.17, stripe: PAL.pink, towelCol: PAL.pink }).parts;
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniParts.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); };
  let heroKey = null, hero = null;
  const readHero = () => { try { const v = localStorage.getItem('meru.combatHero.v1'); return v === 'hope' || v === 'noble' ? v : 'player'; } catch (e) { return 'player'; } };
  function setHero(k) { if (k === heroKey) return; const old = hero; heroKey = k; hero = noWeapons(cast.make(k, { mood: 'happy' })); if (old) { hero.position.copy(old.position); hero.rotation.y = old.rotation.y; scene.remove(old); } else { hero.position.set(K.door.x, 0, K.door.z - 1.0); hero.rotation.y = Math.PI; } }
  setHero(readHero());
  const browser = noWeapons(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#e6e4de', furDark: '#a8a6a0' }, torso: ['#c9a132', '#fbf6ee', '#7a5a1e'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); browser.position.set(-4.9, 0, 2.3); browser.rotation.y = -Math.PI / 2;
  const custFox = CUSTOMERS.map(cu => { const f = noWeapons(kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; return f; });

  // ---------- helpers: screen ↔ world ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), up = V3(0, 1, 0);
  const scr = v => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * CW(), y: (1 - p.y) / 2 * CHh(), z: p.z }; };
  function rayAt(p) { ndc.set(p.sx / CW() * 2 - 1, -(p.sy / CHh() * 2 - 1)); ray.setFromCamera(ndc, camera); return ray; }
  function planeAt(p, y) { rayAt(p); plane.set(up, -y); const o = V3(); return ray.ray.intersectPlane(plane, o) ? o : null; }
  const sdist = (p, v) => { const s = scr(v); return Math.hypot(s.x - p.sx, s.y - p.sy); };
  const P = (x, y, z) => V3(x, y, z);
  const flash = (txt, col = '#ffd23a', t = 1.3) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const upg = id => !!save.stat(SAVE.upg + id, 0);

  // ---------- audio (candy-audio.js: synthesized sound design + the music-box score) ----------
  const CA = candyAudio({ musicUrl: musicUrl === undefined ? new URL('../../audio/nebo/NEBO-CANDY.mp3', import.meta.url).href : musicUrl });
  const buzz = ms => { try { if (touch && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const SFXMAP = { snip: 'chop', mark: 'arrive', serve: 'slide', coin: 'register' };
  function sfx(kind, o) { if (kind === 'snip' || kind === 'fold' || kind === 'pop' || kind === 'plop') buzz(12); else if (kind === 'good') buzz([10, 40, 14]); else if (kind === 'bad') buzz(40); CA.play(SFXMAP[kind] || kind, o); }
  function audioOn() { CA.unlock(); }
  // ---------- game state ----------
  const S = { phase: startIn === 'intro' ? 'intro' : 'walk', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, next: 2, toSpawn: 0, total: 0, done: null, react: null, reactT: 0, demo: false, hintT: 0, focus: 'counter',
    talk: null, toast: null, toastT: 0, prompt: null, sayWalk: null, clk: 0 };
  const orders = []; let W = null, idSeq = 1;
  const DM = { on: false, list: [], cap: ['', ''], t: 0, day0: 1 };

  // ---------- dynamic props ----------
  const dyn = new THREE.Group(); scene.add(dyn);
  const potG = K.potGroup;
  const syrup = new THREE.Mesh(new THREE.CircleGeometry(K.potR - 0.01, 28), toon('#f6efe0')); syrup.rotation.x = -Math.PI / 2; syrup.position.y = 0.14; potG.add(syrup); syrup.visible = false;
  const syrupMat = new THREE.MeshToonMaterial({ color: '#f6efe0', gradientMap: grad }); syrup.material = syrupMat;
  // a swirl of lighter sugar that turns with the spoon, and the same sheen on the tempered chocolate
  const swirlT = canvasTex(128, 128, g => { g.clearRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.lineWidth = 5 - k; g.beginPath(); for (let a = 0; a < 9; a += 0.1) { const rr2 = 6 + a * 6 + k * 3; g.lineTo(64 + Math.cos(a + k * 2.1) * rr2, 64 + Math.sin(a + k * 2.1) * rr2); } g.stroke(); } });
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(K.potR - 0.02, 28), new THREE.MeshBasicMaterial({ map: swirlT, transparent: true, depthWrite: false, opacity: 0.5 })); swirl.rotation.x = -Math.PI / 2; swirl.position.y = 0.143; potG.add(swirl); swirl.visible = false;
  const chocSheen = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), new THREE.MeshBasicMaterial({ map: swirlT, transparent: true, depthWrite: false, opacity: 0 })); chocSheen.rotation.x = -Math.PI / 2; chocSheen.position.set(0, 0.212, 0); K.temperGroup.add(chocSheen);
  const scorchRing = new THREE.Mesh(new THREE.RingGeometry(K.potR - 0.06, K.potR - 0.005, 28), new THREE.MeshBasicMaterial({ color: 0x3a1a08, transparent: true, opacity: 0 })); scorchRing.rotation.x = -Math.PI / 2; scorchRing.position.y = 0.142; potG.add(scorchRing);
  const foam = new THREE.Mesh(new THREE.TorusGeometry(K.potR + 0.01, 0.04, 8, 24), toon('#f0e4cc')); foam.rotation.x = Math.PI / 2; foam.position.y = 0.31; foam.visible = false; potG.add(foam);
  const bubbles = []; for (let i = 0; i < 16; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })); b.visible = false; potG.add(b); bubbles.push({ m: b, t: rr(0, 1), x: 0, z: 0 }); }
  const spoon = new THREE.Group(); { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.5, 8), toon('#a8763a')); h.position.y = 0.25; addOutline(h, 0.004); spoon.add(h); const s = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 6), toon('#c9975a')); s.scale.set(1, 0.4, 1.3); addOutline(s, 0.004, 0.04); spoon.add(s); }
  spoon.position.set(0, 0.15, 0); potG.add(spoon); spoon.visible = false;
  const knife = new THREE.Group(); { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.26), toon('#d7dde3')); bl.position.y = -0.04; addOutline(bl, 0.004); knife.add(bl); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.14), toon(PAL.ink)); hd.position.set(0, 0.02, -0.18); addOutline(hd, 0.004); knife.add(hd); } knife.visible = false; scene.add(knife);
  const pipeBag = new THREE.Group(); { const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 14), toon('#fbf6ee')); c.rotation.x = Math.PI; c.position.y = 0.13; addOutline(c, 0.005); pipeBag.add(c); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 8), toon(PAL.gold)); tip.rotation.x = Math.PI; tip.position.y = -0.01; pipeBag.add(tip); } pipeBag.visible = false; scene.add(pipeBag);
  const shaker = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.16, 14), new THREE.MeshToonMaterial({ color: '#eef6f8', gradientMap: grad, transparent: true, opacity: 0.6 })); b.position.y = 0.08; shaker.add(b); const sug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 12), toon('#fbf6ee')); sug.position.y = 0.05; shaker.add(sug); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#c9ced4')); cap.position.y = 0.16; addOutline(cap, 0.004, 0.052); shaker.add(cap); }
  shaker.rotation.z = Math.PI * 0.8; shaker.visible = false; scene.add(shaker);
  const sugarBits = []; for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.008), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.visible = false; scene.add(m); sugarBits.push({ m, life: 0, v: V3() }); } let sbI = 0;
  const zone = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.3, depthWrite: false })); zone.rotation.x = -Math.PI / 2; zone.visible = false; zone.renderOrder = 5; scene.add(zone);
  const flag = new THREE.Group(); { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), toon(PAL.ink)); pole.position.y = 0.15; flag.add(pole); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide })); fl.position.set(0.06, 0.26, 0); flag.add(fl); flag.userData.fl = fl; } flag.visible = false; scene.add(flag);
  const markers = []; for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.004, 0.24), new THREE.MeshBasicMaterial({ color: 0xec3013 })); m.visible = false; m.renderOrder = 6; scene.add(m); markers.push(m); }
  const touchTex = canvasTex(128, 128, g => { g.clearRect(0, 0, 128, 128); g.strokeStyle = '#ffd23a'; g.lineWidth = 10; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,210,58,0.85)'; g.beginPath(); g.arc(64, 64, 20, 0, 7); g.fill(); g.strokeStyle = '#201e1d'; g.lineWidth = 4; g.beginPath(); g.arc(64, 64, 20, 0, 7); g.stroke(); });
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: touchTex, depthTest: false, transparent: true })); hand.scale.setScalar(0.14); hand.renderOrder = 40; hand.visible = false; scene.add(hand);
  const hints = hintRings(ST);
  // box with a hinged lid + ribbon + bow
  const boxG = new THREE.Group(); scene.add(boxG); boxG.visible = false;
  const lid = new THREE.Group(), ribbon = new THREE.Group(); { const base = M(new THREE.BoxGeometry(0.34, 0.08, 0.26), toon(PAL.pink), 0, 0.04, 0, boxG, 0.006); base.material = [toon(PAL.pink), toon(PAL.pink), toon('#fbe3ec'), toon(PAL.pink), toon(PAL.pink), toon(PAL.pink)];
    M(new THREE.BoxGeometry(0.31, 0.004, 0.23), toon('#fbf6ee'), 0, 0.075, 0, boxG, 0);
    lid.position.set(0, 0.08, -0.13); boxG.add(lid); M(new THREE.BoxGeometry(0.36, 0.03, 0.28), toon(PAL.plum), 0, 0.015, 0.14, lid, 0.006); lid.rotation.x = -1.9;
    M(new THREE.BoxGeometry(0.37, 0.034, 0.03), toon('#ffd23a'), 0, 0.105, 0, ribbon, 0.003); M(new THREE.BoxGeometry(0.03, 0.034, 0.29), toon('#ffd23a'), 0, 0.105, 0, ribbon, 0.003);
    for (const s of [-1, 1]) { const lp = M(new THREE.TorusGeometry(0.035, 0.01, 6, 14), toon('#ffd23a'), s * 0.035, 0.13, 0, ribbon, 0.003); lp.rotation.y = Math.PI / 2; lp.scale.set(1, 1, 0.6); } boxG.add(ribbon); ribbon.visible = false; }
  const boxItems = new THREE.Group(); boxG.add(boxItems);

  // ---------- cameras ----------
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 };
  const { SAFE, shotFor, setSafe } = cameraFit(ST);
  const port = () => CW() < CHh();
  const yawBack = Math.PI;   // camera on the +z side looking at the back of the kitchen
  function stationPts(id) { const out = [];
    if (id === 'flavor') out.push(P(K.pot.x - 0.3, BT, K.pot.z + 0.3), P(K.pot.x, BT + 0.55, K.pot.z), P(-1.45, BT, K.back.z - 0.25), P(-1.45, BT + 0.35, K.back.z), P(-2.6, BT, K.back.z + 0.15));
    else if (id === 'boil') out.push(P(K.pot.x - 0.32, BT + 0.05, K.pot.z - 0.3), P(K.pot.x + 0.45, BT + 0.05, K.pot.z + 0.32), P(K.pot.x, BT + 0.62, K.pot.z), P(K.pot.x - 0.3, BT + 0.5, K.pot.z + 0.2));
    else if (id === 'temper') out.push(P(K.temper.x - 0.3, BT, K.temper.z - 0.28), P(K.temper.x + 0.3, BT, K.temper.z + 0.32), P(K.temper.x, BT + 0.45, K.temper.z));
    else if (id === 'pull') out.push(P(K.hook.x - 0.15, T, K.slab.z - 0.32), P(K.hook.x + 1.85, T, K.slab.z + 0.32), P(K.hook.x, T + 0.45, K.slab.z));
    else if (id === 'cut' || id === 'rope') out.push(P(-1.75, T, K.slab.z - 0.3), P(0.35, T, K.slab.z + 0.3), P(-0.7, T + 0.3, K.slab.z));
    else if (id === 'roll') out.push(P(-1.55, T, K.slab.z - 0.25), P(0.05, T, K.slab.z + 0.25), P(-0.75, T + 0.2, K.slab.z));
    else if (id === 'coat') out.push(P(-1.55, T, K.slab.z - 0.5), P(0.8, T, K.slab.z + 0.5), P(-0.4, T + 0.25, K.slab.z));
    else if (id === 'pipe' || id === 'dust') out.push(P(K.mould.x - 0.62, T, K.mould.z - 0.36), P(K.mould.x + 0.52, T, K.mould.z + 0.4), P(K.mould.x, T + 0.3, K.mould.z));
    else if (id === 'box') { const o = W && W.o, sp = o ? K.spots[o.spot] : K.spots[2]; out.push(P(sp.x - 0.45, CT, CZ() - 0.45), P(sp.x + 0.65, CT, CZ() - 0.45), P(sp.x - 0.7, 2.3, sp.z), P(sp.x + 0.7, 2.3, sp.z), P(sp.x, CT, sp.z)); }
    else out.push(P(-3.2, CT, CZ()), P(2.6, CT, CZ()), ...K.spots.flatMap(s => [P(s.x, 2.75, s.z), P(s.x, 0.6, s.z)]), P(K.box.x, CT + 0.2, K.box.z));
    return out; }
  const CZ = () => K.counter.z;
  // On a tall phone the slab steps follow one cluster at a time (the next truffle, the next cut), and the pull + rope look along the slab so the drag runs down the screen.
  function stepShot(id) { const pt = port(); if (id === 'box' || id === 'counter') return shotFor('s:' + id + (W && W.o ? W.o.spot : ''), () => stationPts(id), id === 'box' ? (pt ? 1.12 : 0.92) : (pt ? 0.62 : 0.5), 0, 0.05);
    if (pt && W && W.st && stepId() === id && STEP[id].cluster) { const c = STEP[id].cluster(W.st); return shotFor('c:' + id + ':' + c.key, () => c.pts, 1.1, yawBack, 0.05); }
    if (pt && (id === 'pull' || id === 'rope')) return shotFor('a:' + id, () => stationPts(id), 1.0, Math.PI / 2, 0.04);
    return shotFor('s:' + id, () => stationPts(id), pt ? (id === 'boil' || id === 'temper' ? 1.05 : 1.12) : (id === 'flavor' ? 0.8 : 0.95), yawBack, 0.05); }
  const wideShot = () => shotFor('wide', () => [P(-4.6, 0.05, -0.3), P(-1.8, 0.05, 2.0), P(-4.6, 2.3, -0.3), P(-1.8, 2.3, 2.0), P(-3.2, 2.4, 1.6)], port() ? 0.14 : 0.16, Math.PI - 0.32, 0.08);
  function glideTo(shot, dur = 1.2) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  // walk camera (third person, orbit with lookBy/zoomBy like the town)
  const WC = { yaw: 0, pitch: 0.5, dist: 6.4, dragT: 0, pov: false };
  camera.position.set(K.door.x, 2.4, K.door.z + 2.6); CAM.look.set(K.door.x, 1.1, K.door.z - 2);

  // ---------- walk mode ----------
  const keys = new Set(), stick = { x: 0, y: 0 };
  const near = (a, b, r) => Math.hypot(a.x - b.x, a.z - b.z) < r;
  function collide(p, r = 0.32) { const B = K.bounds; p.x = clamp(p.x, B.x0, B.x1); p.z = clamp(p.z, B.z0, B.z1);
    for (const c of K.colliders) { if (c.round) { const dx = p.x - c.cx, dz = p.z - c.cz, d = Math.hypot(dx, dz), m = c.round + r; if (d < m && d > 1e-4) { p.x = c.cx + dx / d * m; p.z = c.cz + dz / d * m; } continue; }
      if (p.x > c.x0 - r && p.x < c.x1 + r && p.z > c.z0 - r && p.z < c.z1 + r) { const ox = Math.min(p.x - (c.x0 - r), c.x1 + r - p.x), oz = Math.min(p.z - (c.z0 - r), c.z1 + r - p.z); if (ox < oz) p.x = p.x - (c.x0 - r) < c.x1 + r - p.x ? c.x0 - r : c.x1 + r; else p.z = p.z - (c.z0 - r) < c.z1 + r - p.z ? c.z0 - r : c.z1 + r; } }
    for (const f of [angelica, browser]) { if (!f.visible) continue; const dx = p.x - f.position.x, dz = p.z - f.position.z, d = Math.hypot(dx, dz), m = 0.32 + r; if (d < m && d > 1e-4) { p.x = f.position.x + dx / d * m; p.z = f.position.z + dz / d * m; } } }
  function walkStep(dt) { let ix = stick.x, iy = stick.y; if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    const L = Math.min(1, Math.hypot(ix, iy)); let spd = 0;
    if (!S.talk && L > 0.08) { const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || L > 0.92, fw = V3(Math.sin(WC.yaw + Math.PI), 0, Math.cos(WC.yaw + Math.PI)), rt = V3(-fw.z, 0, fw.x), mv = fw.multiplyScalar(iy).add(rt.multiplyScalar(ix)).normalize();
      spd = (run ? 3.4 : 2.2) * L; const p = hero.position.clone().addScaledVector(mv, spd * dt); collide(p); hero.position.copy(p); const want = Math.atan2(mv.x, mv.z); let d = want - hero.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; hero.rotation.y += d * Math.min(1, dt * 12);
      if (WC.dragT <= 0) { let dy = (hero.rotation.y + Math.PI) - WC.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; WC.yaw += dy * Math.min(1, dt * 1.2) * Math.min(1, Math.abs(iy) + 0.2); } }
    WC.dragT -= dt; kit.animFox(hero, dt, spd, false); S.stepT = (S.stepT || 0) - dt * spd * 1.35; if (spd > 0.3 && S.stepT <= 0) { S.stepT = 1; sfx('footstep', { v: 0.8 }); }
    // camera: orbit behind, kept inside the room
    const tgt = hero.position.clone().add(V3(0, 1.15, 0)), cp = tgt.clone().add(V3(Math.sin(WC.yaw) * Math.cos(WC.pitch), Math.sin(WC.pitch), Math.cos(WC.yaw) * Math.cos(WC.pitch)).multiplyScalar(WC.dist));
    // dollhouse camera: it may pull back through the front wall (that wall is see-through from outside) and rides up the side/back walls
    { const want = Math.hypot(cp.x - tgt.x, cp.z - tgt.z); cp.x = clamp(cp.x, -ROOM.W / 2 + 0.3, ROOM.W / 2 - 0.3); cp.z = clamp(cp.z, -ROOM.D / 2 + 0.3, ROOM.D / 2 + 4); const got = Math.hypot(cp.x - tgt.x, cp.z - tgt.z); cp.y += Math.max(0, want - got) * 0.8; cp.y = clamp(cp.y, 0.6, ROOM.H + 3); }
    if (WC.pov) { cp.copy(hero.position).add(V3(0, 1.6, 0)); tgt.copy(cp).add(V3(Math.sin(hero.rotation.y), -0.1, Math.cos(hero.rotation.y))); hero.visible = false; } else hero.visible = true;
    camera.position.lerp(cp, Math.min(1, dt * 6)); CAM.look.lerp(tgt, Math.min(1, dt * 8)); camera.lookAt(CAM.look);
    // prompts: Angelica / the card in the window
    S.prompt = null; S.near = null;
    if (!S.talk) { if (near(hero.position, angelica.position, 2.3)) { S.prompt = 'Talk to ANGELICA'; S.near = 'angelica'; } else if (near(hero.position, K.hiring, 1.4)) { S.prompt = 'Read the NOW HIRING card'; S.near = 'card'; } else if (near(hero.position, { x: K.door.x, z: K.door.z + 0.2 }, 1.1)) { S.prompt = 'Leave for NEBO TOWN SQUARE'; S.near = 'door'; } }
    angelica.userData.lookAt = near(hero.position, angelica.position, 4) ? hero.position.clone().add(V3(0, 1.5, 0)) : null;
    browser.userData.lookAt = near(hero.position, browser.position, 2.2) ? hero.position.clone().add(V3(0, 1.5, 0)) : null;
    if (!S.greeted && hero.position.z < K.door.z - 1.2) { S.greeted = true; S.toast = 'ANGELICA: "' + ANGELICA.hello + '"'; S.toastT = 5; angelica.userData.talking = true; setTimeout(() => angelica.userData.talking = false, 1800); sfx('bell'); } }
  // Angelica's talk tree for the Game HUD dialog box: { name, role, text, choices, step, total, more, required }
  function talk() { if (S.phase !== 'walk' || S.talk) return; audioOn(); sfx('page');
    if (S.near === 'angelica') { S.talk = { who: 'angelica', lines: null, i: 0, asked: {} }; angelica.userData.talking = true; setTimeout(() => angelica.userData.talking = false, 1500); }
    else if (S.near === 'card') S.talk = { who: 'card', lines: ['NOW HIRING. There is a card in the window that says NOW HIRING and it has been there a while.', 'Ask ANGELICA at the counter.'], i: 0 };
    else if (S.near === 'door') api.leave(); }
  function dialog() { const t = S.talk; if (!t) return null;
    if (t.who === 'card') return { name: 'NOW HIRING', role: 'A card in the window', text: t.lines[t.i], step: t.i + 1, total: t.lines.length };
    if (!t.lines) return { name: ANGELICA.name, role: ANGELICA.role, text: ANGELICA.hello, choices: topics().map(([q, , k], i) => ({ text: q, asked: !!t.asked[i] && !k, bye: k === 'bye' })) };
    return { name: ANGELICA.name, role: ANGELICA.role, text: t.lines[t.i], step: t.i + 1, total: t.lines.length }; }
  // Nebo's forest TRUFFLES (Parsnip the pig finds them): "Angelica in the candy shop takes eight off you for a box of mints. The rest she buys, and she pays properly."
  const TRUFFLE_ID = 'truffle', MINTS_ID = 'mints', TRUFFLE_PRICE = 6;
  function topics() { const tp = ANGELICA.topics.slice(), n = save.count(TRUFFLE_ID); if (n > 0) tp.splice(2, 0, ['I found TRUFFLES in the forest. (' + n + ')', null, 'truffles']); return tp; }
  function sellTruffles() { let n = save.count(TRUFFLE_ID); const lines = []; if (!n) return ['Nothing in your pockets but crumbs.']; if (n >= 8) { save.take(TRUFFLE_ID, 8); save.give(MINTS_ID, 1); n -= 8; lines.push('Eight of those and you have earned a box of mints. Here.'); }
    if (n > 0) { save.take(TRUFFLE_ID, n); save.addGold(n * TRUFFLE_PRICE); lines.push('The rest I will buy, and I pay properly. ' + n * TRUFFLE_PRICE + ' gold.'); sfx('coin'); } else lines.push('Bring me more when the pig finds them.'); return lines; }
  function choose(i) { const t = S.talk; if (!t || t.who !== 'angelica' || t.lines) return; const tp = topics()[i]; if (!tp) return; if (tp[2] === 'truffles') { t.lines = sellTruffles(); t.i = 0; t.after = null; sfx('page'); return; } t.asked[i] = true; t.lines = tp[1]; t.i = 0; t.after = tp[2] || null; angelica.userData.talking = true; setTimeout(() => angelica.userData.talking = false, 1800); }
  function nextLine() { const t = S.talk; if (!t) return; if (!t.lines) return; if (t.i < t.lines.length - 1) { t.i++; angelica.userData.talking = true; setTimeout(() => angelica.userData.talking = false, 1500); return; }
    if (t.who === 'card') { S.talk = null; return; } const after = t.after; t.lines = null; t.after = null; if (after === 'work') { S.talk = null; if (!S.demo) save.setFlag('candyHired'); toIntro(); } else if (after === 'bye') S.talk = null; }

  // ---------- orders + customers ----------
  const availCandies = () => Object.keys(CANDIES).filter(k => CANDIES[k].day <= S.day);
  function makeOrder(kind, flav) { const used = new Set(orders.map(o => o.ci)); let ci = Math.floor(rr(0, CUSTOMERS.length)); for (let k = 0; k < CUSTOMERS.length && used.has(ci); k++) ci = (ci + 1) % CUSTOMERS.length;
    const takenSpots = new Set(orders.filter(o => o.st !== 'leave').map(o => o.spot)); const spot = [2, 1, 0].find(s => !takenSpots.has(s)); if (spot == null) return null;
    const candy = kind || pick(availCandies()), C = CANDIES[candy], f = flav || (C.coats ? pick(C.coats) : C.flav ? pick(C.flav) : null), patMax = S.demo ? 999 : Math.max(150, 230 - (S.day - 1) * 15);
    const fox = custFox[ci]; fox.visible = true; fox.position.set(K.door.x, 0, K.door.z + 0.3); fox.rotation.y = Math.PI; fox.userData.mood = 'happy';
    const o = { id: idSeq++, ci, name: CUSTOMERS[ci].name, candy, flav: f, spot, pat: patMax, patMax, st: 'walk', f: fox, line: pick(LINES.order) }; orders.push(o); return o; }
  function custStep(dt) { for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot], f = o.f; let spd = 0;
      if (o.st === 'walk') { const d = Math.hypot(sp.x - f.position.x, sp.z - f.position.z); if (d > 0.05) { const s = Math.min(d, 1.9 * dt); f.position.x += (sp.x - f.position.x) / d * s; f.position.z += (sp.z - f.position.z) / d * s; f.rotation.y = Math.atan2(sp.x - f.position.x, sp.z - f.position.z); spd = 2; } else { o.st = 'wait'; f.rotation.y = Math.PI; say(o.name + ': "' + o.line + '"', 3); sfx('arrive'); } }
      else if (o.st === 'wait') { if (!S.react && !S.demo) o.pat -= dt; f.rotation.y = damp(f.rotation.y, Math.PI, 6, dt); if (o.pat <= 0) { o.st = 'leave'; f.userData.mood = 'sad'; S.lost++; flash(o.name + ' WALKED OUT', '#ec3013', 1.6); sfx('bad'); if (W && W.o === o) abortJob(); } }
      else if (o.st === 'leave') { const d = Math.hypot(K.door.x - f.position.x, K.door.z + 0.4 - f.position.z); if (d > 0.1) { const s = Math.min(d, 2.2 * dt); f.position.x += (K.door.x - f.position.x) / d * s; f.position.z += (K.door.z + 0.4 - f.position.z) / d * s; f.rotation.y = Math.atan2(K.door.x - f.position.x, K.door.z + 0.4 - f.position.z); spd = 2.2; } else { f.visible = false; orders.splice(i, 1); } }
      kit.animFox(f, dt, spd); } }

  // ---------- the current job ----------
  const tick = () => S.clk;   // game clock (stirring etc.), so slow frames never read as 'stopped stirring'
  function startJob(o) { const C = CANDIES[o.candy]; W = { o, C, steps: C.steps.slice(), i: -1, scores: {}, notes: [], wrong: false, t0: S.t, d: {} }; f2(o.f, 'curious'); nextStep(); }
  function f2(f, m) { f.userData.mood = m; }
  function stepId() { return W && W.i >= 0 ? W.steps[W.i] : null; }
  function nextStep() { if (B.down && B.p) { B.down = false; pUp(B.p); } W.i++; W.busy = false; const id = stepId(); W.st = { t: 0 }; S.focus = id; STEP[id].enter(W.st); glideTo(stepShot(id), 0.9); sfx('step'); }
  function commit(id, score, note) { if (!W || W.busy || stepId() !== id) return; W.busy = true; const sc = Math.round(clamp(score, 0, 100)); W.scores[id] = sc; if (note) W.notes.push(note);
    const [w, c] = sc >= 90 ? ['PERFECT', '#22c55e'] : sc >= 75 ? ['GREAT', '#22c55e'] : sc >= 55 ? ['GOOD', '#ffd23a'] : sc >= 35 ? ['OKAY', '#e6b45a'] : ['ROUGH', '#ec3013'];
    if (id !== 'box') { flash(STEPS[id][0] + ' · ' + w + ' ' + sc, c, 1.1); sfx(sc >= 75 ? 'good' : sc >= 45 ? 'step' : 'bad'); if (sc >= 90) { const pts = stationPts(id), cc = V3(); pts.forEach(q => cc.add(q)); cc.multiplyScalar(1 / pts.length); FX.sparkle(cc, 14, 0xffe27a); sfx('sparkle', { d: 0.15 }); } }
    setTimeout(() => { if (!W || stepId() !== id) return; STEP[id].leave && STEP[id].leave(W.st); if (W.i < W.steps.length - 1) nextStep(); else finishOrder(); }, id === 'box' ? 50 : 800); }
  function clearJob() { while (dyn.children.length) dyn.remove(dyn.children[0]); syrup.visible = false; swirl.visible = false; spoon.visible = false; foam.visible = false; scorchRing.material.opacity = 0; bubbles.forEach(b => b.m.visible = false); K.thermCol.scale.y = 0.02; K.burners.forEach(b => b.glow.material.opacity = 0);
    knife.visible = pipeBag.visible = shaker.visible = zone.visible = flag.visible = false; markers.forEach(m => m.visible = false); boxG.visible = false; ribbon.visible = false; while (boxItems.children.length) boxItems.remove(boxItems.children[0]); K.chocSurf.material = toon('#4a2c18'); drag = null; }
  function abortJob() { clearJob(); W = null; S.focus = 'counter'; glideTo(stepShot('counter'), 0.9); }
  function finishOrder() { const o = W.o, C = W.C, vals = Object.entries(W.scores).filter(([k]) => k !== 'box').map(([, v]) => v), avg = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    let stars = avg >= 85 ? 3 : avg >= 65 ? 2 : avg >= 40 ? 1 : 0; if (W.wrong) stars = Math.max(0, stars - 1);
    const pf = clamp(o.pat / o.patMax, 0, 1), price = C.price + (upg('ribbon') ? 2 : 0), pay = stars ? price : Math.ceil(price / 2), tip = stars ? Math.round(price * [0, 0.2, 0.5, 0.9][stars] * (0.5 + 0.5 * pf) * (upg('musicbox') ? 1.25 : 1)) : 0;
    S.earned += pay; S.tips += tip; S.served++; S.starList.push(stars); if (!S.demo) save.setStat(SAVE.boxes, save.stat(SAVE.boxes, 0) + 1);
    const flavName = o.flav ? (FLAVORS[o.flav] || COATS[o.flav]).name : '';
    const line = W.wrong ? LINES.wrong + flavName + '...' : pick(LINES.react[stars]);
    S.react = { who: o.name, word: ['GRUMPY', 'OKAY', 'HAPPY', 'THRILLED'][stars], col: ['#ec3013', '#e6b45a', '#ffd23a', '#22c55e'][stars], stars, tip, pay, line, avg: Math.round(avg), notes: W.notes.slice(0, 2) }; S.reactT = S.demo ? 2.4 : 3.2;
    f2(o.f, stars >= 2 ? 'excited' : stars === 1 ? 'neutral' : 'sad'); o.f.userData.talking = true; setTimeout(() => { o.f.userData.talking = false; }, 1600); o.f.userData.hop = stars >= 3 ? 1 : 0; sfx(stars >= 2 ? 'happy' : 'sad'); setTimeout(() => sfx('coin'), 450); FX.emote(o.f, stars); if (stars === 3) { CA.jingle('thrilled'); FX.confetti(o.f.position.clone().add(V3(0, 2.6, 0))); }
    o.st = 'served'; o.leaveIn = 1.4; W.o.box = true; W = null; }

  // ---------- pointer plumbing ----------
  let drag = null; const PTR = new Map();
  const evp = e => { const r = renderer.domElement.getBoundingClientRect(); return { sx: e.clientX - r.left, sy: e.clientY - r.top, id: e.pointerId }; };
  function pDown(p) { audioOn(); if (S.phase === 'walk') { PTR.set(p.id, p); return; } const id = stepId(); if (S.phase !== 'shift' || !id || W.busy || S.react) return; W.st.down = true; STEP[id].down && STEP[id].down(W.st, p); }
  function pMove(p) { if (S.phase === 'walk') { const q = PTR.get(p.id); if (q) { api.lookBy(p.sx - q.sx, p.sy - q.sy); PTR.set(p.id, p); } return; } const id = stepId(); if (!id || W.busy) return; STEP[id].move && STEP[id].move(W.st, p); W.st.last = p; }
  function pUp(p) { PTR.delete(p.id); const id = stepId(); if (!id || W.busy) { if (W) W.st.down = false; return; } W.st.down = false; STEP[id].up && STEP[id].up(W.st, p); }
  const onPD = e => { if (S.demo) return; renderer.domElement.setPointerCapture && renderer.domElement.setPointerCapture(e.pointerId); pDown(evp(e)); }, onPM = e => { if (S.demo) return; pMove(evp(e)); }, onPU = e => { if (S.demo) return; pUp(evp(e)); };
  renderer.domElement.addEventListener('pointerdown', onPD); renderer.domElement.addEventListener('pointermove', onPM); renderer.domElement.addEventListener('pointerup', onPU); renderer.domElement.addEventListener('pointercancel', onPU);
  renderer.domElement.addEventListener('wheel', e => { if (S.phase === 'walk') { e.preventDefault(); api.zoomBy(1 + clamp(e.deltaY * 0.001, -0.2, 0.2)); } }, { passive: false });
  // demo pointer: the same handlers, driven from world points (the glowing touch ring shows where)
  const B = { p: null, down: false };
  function botAt(v, press) { const s = scr(v), p = { sx: s.x, sy: s.y, id: 99 }; hand.visible = true; hand.position.copy(v); hand.scale.setScalar(press ? 0.11 : 0.14); B.v = v.clone();
    if (press && !B.down) { B.down = true; pDown(p); } else if (B.down && press) pMove(p); else if (B.down && !press) { B.down = false; pUp(p); } B.p = p; }

  // ---------- the steps ----------
  const lerpC = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(t, 0, 1));
  const heatOf = () => { const h = HEATS[W.C.heat]; const w = upg('thermo') ? 3 : 0; return { ...h, lo: h.lo - w, hi: h.hi + w }; };
  const flavCol = () => W.d.flav ? FLAVORS[W.d.flav].col : '#f6efe0';
  const STEP = {
    flavor: { enter(s) { s.pick = null; },
      cluster() { return { key: 0, pts: [P(-3.55, BT, K.back.z - 0.3), P(-1.3, BT, K.back.z + 0.3), P(-2.4, BT + 0.35, K.back.z)] }; },
      down(s, p) { if (s.pick) return; rayAt(p); let best = null, bd = 1e9; for (const [k, b] of Object.entries(K.bottles)) { const d = sdist(p, P(b.x, b.y + 0.14, b.z)); if (d < bd) { bd = d; best = k; } } if (best && bd < Math.max(44, CW() * 0.07)) api.pickFlavor(best); },
      update(s, dt) { if (!s.pick) return; s.t2 = (s.t2 || 0) + dt; const b = K.bottles[s.pick], g = b.g, k = clamp(s.t2 / 0.7, 0, 1), from = V3(b.x, b.y, b.z), to = V3(K.pot.x + 0.14, BT + 0.45, K.pot.z);
        if (s.t2 < 1.5) { const q = s.t2 < 0.7 ? k : s.t2 < 1.0 ? 1 : 1 - clamp((s.t2 - 1.0) / 0.5, 0, 1); g.position.lerpVectors(from, to, q); g.position.y += Math.sin(q * Math.PI) * 0.25; g.rotation.z = s.t2 > 0.6 && s.t2 < 1.05 ? 1.9 : q * 0.5; if (s.t2 > 0.7 && s.t2 < 1.0 && !s.dropped) { s.dropped = true; syrup.visible = true; syrupMat.color.set(lerpC('#f6efe0', FLAVORS[s.pick].col, 0.55)); sfx('plop'); FX.sparkle(V3(K.pot.x, BT + 0.35, K.pot.z), 6, 0xffffff); puff(K.pot.x, BT + 0.4, K.pot.z, 0xffffff, 2); } }
        else { g.position.copy(from); g.rotation.z = 0; if (!s.sent) { s.sent = true; commit('flavor', 100); } } },
      bot(s, dt) { if (!s.pick && s.t > 0.9) { const k = W.o.flav, b = K.bottles[k]; botAt(V3(b.x, b.y + 0.15, b.z), true); setTimeout(() => botAt(V3(b.x, b.y + 0.15, b.z), false), 120); } },
      info(s) { return { want: W.o.flav, picked: s.pick }; }, hint() { const b = K.bottles[W.o.flav]; return { p: V3(b.x, BT, b.z), r: 0.14 }; } },
    boil: { enter(s) { sfx('whoosh'); s.temp = 18; s.scorch = 0; s.on = true; s.stirAt = -9; s.over = false; s.ang = 0; s.passed = {}; syrup.visible = true; if (!W.d.flav) syrupMat.color.set('#f6efe0'); spoon.visible = true; s.prevA = null; },
      update(s, dt) { if (!s.on) return; const now = tick(), rate = Math.max(3.2, 9.4 - s.temp * 0.055) * (S.demo ? 1 : 1); s.temp = clamp(s.temp + dt * rate, 18, 100); const stirring = now - s.stirAt < 0.3;
        s.scorch = s.temp > 32 ? clamp(s.scorch + dt * (stirring ? -11 : 13), 0, 100) : clamp(s.scorch - dt * 6, 0, 100); if (s.scorch >= 100 && !s.over) { s.over = true; foam.visible = true; sfx('bad'); flash('IT BOILED OVER!', '#ec3013', 1.2); }
        for (const [v, n] of [[30, 'THREAD'], [36, 'SOFT BALL'], [56, 'FIRM BALL'], [78, 'HARD CRACK']]) if (s.temp >= v && !s.passed[n]) { s.passed[n] = 1; sfx('mark'); if (n === heatOf().name) flash(n + ' · TAKE IT OFF IN THE BAND', '#ffd23a', 1.2); }
        if (s.temp >= 99) api.offHeat(); },
      down(s, p) { s.prevA = null; this.move(s, p); },
      move(s, p) { if (!s.down || !s.on) return; const c = scr(V3(K.pot.x, K.potY + 0.15, K.pot.z)), r = scr(V3(K.pot.x + K.potR, K.potY + 0.15, K.pot.z)), R = Math.max(30, Math.abs(r.x - c.x)), d = Math.hypot(p.sx - c.x, p.sy - c.y);
        if (d > R * 2.6) { s.prevA = null; return; } const a = Math.atan2(p.sy - c.y, p.sx - c.x); if (s.prevA != null) { let da = a - s.prevA; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; if (Math.abs(da) > 0.03) { s.stirAt = tick(); s.ang += da; if (Math.random() < 0.15) sfx('stir'); } } s.prevA = a; },
      up(s) { s.prevA = null; },
      bot(s, dt) { const h = heatOf(), mid = (h.lo + h.hi) / 2; s.ba = (s.ba || 0) + dt * 7; botAt(V3(K.pot.x + Math.cos(s.ba) * 0.12, K.potY + 0.15, K.pot.z + Math.sin(s.ba) * 0.12), true); if (s.on && s.temp >= mid) { botAt(V3(K.pot.x, K.potY + 0.15, K.pot.z), false); api.offHeat(); } },
      info(s) { const h = heatOf(); return { temp: s.temp, lo: h.lo, hi: h.hi, band: h.name, scorch: s.scorch, on: s.on, stirring: tick() - s.stirAt < 0.3 }; }, hint(s) { return tick() - s.stirAt > 0.6 && s.temp > 28 ? { p: V3(K.pot.x, BT + 0.02, K.pot.z), r: 0.3 } : null; },
      score(s) { const h = heatOf(), mid = (h.lo + h.hi) / 2, half = (h.hi - h.lo) / 2, off = Math.abs(s.temp - mid); let band, note = null;
        if (off <= half) band = 100 - off / half * 10; else { band = clamp(90 - (off - half) * 3.4, 0, 90); note = s.temp < h.lo ? 'Off the heat early: it never reached ' + h.name.toLowerCase() + '.' : 'Cooked past ' + h.name.toLowerCase() + '.'; }
        const clean = clamp(100 - s.scorch * 1.15, 0, 100); if (s.over) note = 'It boiled over the rim.'; else if (s.scorch > 55) note = note || 'Caught on the base. Keep the spoon moving.'; return [band * 0.6 + clean * 0.4 - (s.over ? 18 : 0), note]; } },
    pull: { enter(s) { s.warm = 100; s.n = 0; s.ds = []; s.str = 0; s.blobCol = new THREE.Color(FLAVORS[W.d.flav || 'strawberry'].deep); s.target = 1.35; s.z0 = 1.12; s.z1 = 1.58; syrup.visible = false; spoon.visible = false;
        s.rope = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14).rotateZ(Math.PI / 2).translate(0.5, 0, 0), toon('#ffffff')); s.rope.material = new THREE.MeshToonMaterial({ color: s.blobCol, gradientMap: grad }); addOutline(s.rope, 0.004); dyn.add(s.rope);
        s.blob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), s.rope.material); addOutline(s.blob, 0.006, 0.09); dyn.add(s.blob); s.hx = 0; s.place = 0;
        zone.visible = true; zone.scale.set(s.z1 - s.z0, 1, 1); zone.position.set(K.hook.x + (s.z0 + s.z1) / 2, T + 0.004, K.slab.z); },
      update(s, dt) { if (s.n < 3) { s.warm -= dt * 3.2 * (upg('marble') ? 0.7 : 1); if (s.warm <= 0) { s.warm = 0; commit('pull', this.score(s)[0] - 12, 'It seized before you finished. Work taffy while it is warm.'); return; } }
        if (!s.down) s.str = damp(s.str, 0, 10, dt); const len = Math.max(0.02, s.str), r = clamp(0.07 * Math.sqrt(0.22 / Math.max(0.22, len)), 0.025, 0.07);
        const hk = V3(K.hook.x, K.hook.y - 0.06, K.slab.z); s.rope.position.copy(hk); s.rope.scale.set(len, r, r); const end = hk.clone().add(V3(len, Math.min(0, -(len - 0.1) * 0.12), 0)); s.rope.lookAt(end); s.rope.rotateY(-Math.PI / 2);
        s.blob.position.copy(end); s.blob.scale.setScalar(clamp(1 - len * 0.25, 0.55, 1)); s.rope.material.color.copy(s.blobCol); },
      down(s, p) { const h = planeAt(p, T + 0.12); if (!h || Math.abs(h.z - K.slab.z) > 0.45 || h.x < K.hook.x - 0.3) return; s.pulling = true; sfx('stretch'); },
      move(s, p) { if (!s.pulling) return; const h = planeAt(p, T + 0.12); if (!h) return; s.str = clamp(h.x - K.hook.x, 0, 2.1); },
      up(s) { if (!s.pulling) return; s.pulling = false; const d = s.str; if (d < 0.55) { flash('PULL FURTHER · INTO THE GREEN', '#ffffff', 1); return; }
        s.n++; s.ds.push(d); sfx('fold'); s.blobCol.lerp(new THREE.Color(FLAVORS[W.d.flav || 'strawberry'].col), 0.5).lerp(new THREE.Color('#fbf6ee'), 0.12);
        flash(d < s.z0 ? 'SHORT · PULL ' + s.n + ' / 3' : d > s.z1 ? 'TOO FAR · IT TORE A LITTLE' : 'FOLD! · PULL ' + s.n + ' / 3', d < s.z0 || d > s.z1 ? '#e6b45a' : '#22c55e', 0.9); if (s.n >= 3) commit('pull', ...this.score(s)); },
      bot(s, dt) { s.bt = (s.bt || 0) + dt; const cyc = s.bt % 1.4, x = cyc < 0.8 ? K.hook.x + 0.15 + Math.min(1, cyc / 0.7) * (s.target - 0.15) : K.hook.x + s.target; botAt(V3(x, T + 0.12, K.slab.z), cyc < 0.85); },
      info(s) { return { n: s.n, want: 3, warm: s.warm, d: s.str, z0: s.z0, z1: s.z1, max: 2.1, zone: s.str < 0.05 ? '' : s.str < s.z0 ? 'KEEP PULLING' : s.str > s.z1 ? 'TOO FAR' : 'LET GO NOW' }; },
      hint(s) { return s.down ? null : { p: V3(K.hook.x + 0.2, T, K.slab.z), r: 0.16 }; },
      score(s) { if (!s.n) return [0, 'The taffy was never pulled.']; const cnt = clamp(100 - Math.abs(s.n - 3) * 33, 0, 100), mean = s.ds.reduce((a, b) => a + b, 0) / s.ds.length, dev = s.ds.reduce((a, b) => a + Math.abs(b - mean), 0) / s.ds.length;
        const acc = clamp(100 - Math.abs(mean - s.target) * 140, 0, 100), even = clamp(100 - dev * 220, 0, 100); return [cnt * 0.4 + acc * 0.32 + even * 0.28, mean < s.z0 - 0.08 ? 'Pulls stopped short of the zone.' : mean > s.z1 + 0.05 ? 'Pulled past the zone and the strands tore.' : null]; },
      leave(s) { zone.visible = false; dyn.remove(s.rope, s.blob); W.d.taffyCol = '#' + s.blobCol.getHexString(); } },
    rope: { enter(s) { s.L = 0.45; s.warm = 100; s.target = 1.6; s.lo = 1.45; s.hi = 1.75; s.x0 = -1.65; syrup.visible = false; spoon.visible = false; s.V = Math.PI * 0.075 * 0.075 * 0.45; s.spin = 0;
        s.tex = rockTex.clone(); s.tex.needsUpdate = true; s.tex.wrapS = THREE.RepeatWrapping; s.mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 18).rotateZ(Math.PI / 2).translate(0.5, 0, 0), [new THREE.MeshToonMaterial({ map: s.tex, gradientMap: grad }), toon('#fbf6ee'), toon('#fbf6ee')]); addOutline(s.mesh, 0.004); dyn.add(s.mesh);
        flag.visible = true; flag.position.set(s.x0 + s.target, T, K.slab.z - 0.14); zone.visible = true; zone.scale.set(s.hi - s.lo, 1, 0.5); zone.position.set(s.x0 + (s.lo + s.hi) / 2, T + 0.004, K.slab.z); },
      update(s, dt) { s.warm -= dt * 3 * (upg('marble') ? 0.7 : 1); if (s.warm <= 0) { commit('rope', this.score(s)[0] - 10, 'It cooled before it was rolled out.'); return; } const r = Math.sqrt(s.V / (Math.PI * s.L)); s.mesh.scale.set(s.L, r, r); s.mesh.position.set(s.x0, T + r, K.slab.z); s.mesh.rotation.x = s.spin; s.tex.repeat.set(Math.max(1, s.L * 6), 1); flag.userData.fl.material.color.set(s.L >= s.lo && s.L <= s.hi ? 0x22c55e : s.L > s.hi ? 0xec3013 : 0xec3013); },
      down(s, p) { const h = planeAt(p, T + 0.05); if (!h || Math.abs(h.z - K.slab.z) > 0.45) return; s.rolling = true; s.px = h.x; s.pz = h.z; },
      move(s, p) { if (!s.rolling) return; const h = planeAt(p, T + 0.05); if (!h) return; const dx = Math.hypot(h.x - s.px, h.z - (s.pz ?? h.z)), sg = Math.sign((h.z - (s.pz ?? h.z)) || (h.x - s.px)) || 1; s.px = h.x; s.pz = h.z; s.L = clamp(s.L + dx * 0.2, 0.45, 2.3); s.spin += dx * 18 * sg; if (dx > 0.02 && Math.random() < 0.35) sfx('roll'); if (s.L >= 2.25) commit('rope', ...this.score(s)); },
      up(s) { if (!s.rolling) return; s.rolling = false; if (s.L >= 1.2) commit('rope', ...this.score(s)); else flash('KEEP ROLLING · TO THE FLAG', '#ffffff', 0.9); },
      bot(s, dt) { s.bt = (s.bt || 0) + dt; const x = s.x0 + 0.5 + Math.sin(s.bt * 7) * 0.35; botAt(V3(x, T + 0.06, K.slab.z), s.L < s.target - 0.02); },
      info(s) { return { L: s.L, lo: s.lo, hi: s.hi, max: 2.3, warm: s.warm }; }, hint(s) { return s.rolling ? null : { p: V3(s.x0 + 0.3, T, K.slab.z), r: 0.18 }; },
      score(s) { const off = Math.abs(s.L - s.target); return [clamp(100 - Math.max(0, off - 0.04) * 260, 0, 100), off > 0.2 ? (s.L < s.target ? 'Rope is short and thick: chunky coins.' : 'Rolled too thin: the coins will shatter.') : null]; },
      leave(s) { flag.visible = false; zone.visible = false; dyn.remove(s.mesh); W.d.ropeL = s.L; } },
    cut: { enter(s) { const rock = W.o.candy === 'rock'; s.x0 = rock ? -1.65 : -1.6; s.L = rock ? clamp(W.d.ropeL || 1.6, 1.0, 2.3) : 1.7; s.n = W.C.pieces; s.cuts = []; s.r = rock ? clamp(Math.sqrt(Math.PI * 0.075 * 0.075 * 0.45 / (Math.PI * s.L)), 0.03, 0.08) : 0.05;
        s.mat = rock ? [new THREE.MeshToonMaterial({ map: rockTex, gradientMap: grad }), toon('#fbf6ee'), toon('#fbf6ee')] : new THREE.MeshToonMaterial({ color: W.d.taffyCol || FLAVORS[W.d.flav || 'strawberry'].col, gradientMap: grad }); s.rock = rock;
        s.marks = []; for (let i = 1; i < s.n; i++) s.marks.push(s.x0 + s.L * i / s.n); s.g = new THREE.Group(); dyn.add(s.g); this.rebuild(s); knife.visible = true; knife.position.set(s.x0 + s.L + 0.3, T + 0.2, K.slab.z); },
      cluster(s) { const m = s.left && s.left.length ? s.left[0] : s.x0 + s.L / 2; return { key: s.left ? s.left.length : 0, pts: [P(m - 0.5, T, K.slab.z - 0.3), P(m + 0.5, T, K.slab.z + 0.3), P(m, T + 0.25, K.slab.z)] }; },
      rebuild(s) { while (s.g.children.length) s.g.remove(s.g.children[0]); const xs = [s.x0, ...s.cuts, s.x0 + s.L]; for (let i = 0; i < xs.length - 1; i++) { const a = xs[i] + (i ? 0.012 : 0), b = xs[i + 1] - (i < xs.length - 2 ? 0.012 : 0), m = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, Math.max(0.01, b - a), 16), s.mat); m.rotation.z = Math.PI / 2; m.position.set((a + b) / 2, T + s.r, K.slab.z); addOutline(m, 0.004, s.r); s.g.add(m); }
        const left = s.marks.filter(mx => !s.cuts.some(c => Math.abs(c - mx) < s.L / s.n / 2)); markers.forEach((m, i) => { m.visible = i < left.length; if (i < left.length) m.position.set(left[i], T + 0.003, K.slab.z); }); s.left = left; },
      update(s, dt) { s.chop = Math.max(0, (s.chop || 0) - dt * 5); knife.position.y = T + 0.1 + s.r + 0.05 + (s.chop > 0 ? -0.06 * s.chop : 0.06); },
      down(s, p) { const h = planeAt(p, T + 0.1); s.prev = h; s.p0 = p; if (h) knife.position.set(h.x, knife.position.y, h.z); },
      move(s, p) { const h = planeAt(p, T + 0.1); if (!h) return; knife.position.x = h.x; knife.position.z = h.z; if (!s.down || !s.prev) { s.prev = h; return; } const a = s.prev, zr = K.slab.z; if ((a.z - zr) * (h.z - zr) < 0) { const k = (zr - a.z) / (h.z - a.z), x = a.x + (h.x - a.x) * k; this.cutAt(s, x); } s.prev = h; },
      up(s, p) { if (s.p0 && Math.hypot(p.sx - s.p0.sx, p.sy - s.p0.sy) < 10) { const h = planeAt(p, T + 0.05); if (h && Math.abs(h.z - K.slab.z) < 0.16) this.cutAt(s, h.x); } s.prev = null; },
      cutAt(s, x) { if (x < s.x0 + 0.05 || x > s.x0 + s.L - 0.05 || s.cuts.some(c => Math.abs(c - x) < 0.06)) return; s.cuts.push(x); s.cuts.sort((a, b) => a - b); s.chop = 1; knife.position.x = x; sfx('snip'); this.rebuild(s); if (s.cuts.length >= s.n - 1) commit('cut', ...this.score(s)); },
      bot(s, dt) { const tx = s.left[0]; if (tx == null) return; s.bt = (s.bt || 0) + dt; const k = clamp(s.bt / 0.45, 0, 1); botAt(V3(tx, T + 0.1, K.slab.z - 0.28 + k * 0.56), k < 1); if (s.bt > 0.6) s.bt = 0; },
      info(s) { return { n: s.cuts.length, want: s.n - 1 }; }, hint(s) { return s.left && s.left[0] != null ? { p: V3(s.left[0], T, K.slab.z), r: 0.1 } : null; },
      score(s) { const xs = [s.x0, ...s.cuts, s.x0 + s.L], gaps = []; for (let i = 0; i < xs.length - 1; i++) gaps.push(xs[i + 1] - xs[i]); const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length, dev = gaps.reduce((a, b) => a + Math.abs(b - mean), 0) / gaps.length / mean;
        return [clamp(100 - dev * 260, 0, 100), dev > 0.18 ? 'The pieces came out uneven.' : null]; },
      leave(s) { knife.visible = false; markers.forEach(m => m.visible = false); W.d.pieces = s.cuts.length + 1; dyn.remove(s.g); } },
    pipe: { enter(s) { s.fill = [0, 0, 0, 0, 0, 0]; s.lock = [0, 0, 0, 0, 0, 0]; s.over = 0; s.act = -1; syrup.visible = false; spoon.visible = false; const col = FLAVORS[W.d.flav || 'strawberry'].col; s.col = col;
        s.jelly = K.cells.map(c => { const m = new THREE.Mesh(bearGeo(THREE, 0.0098, 0.04), new THREE.MeshToonMaterial({ color: col, gradientMap: grad, transparent: true, opacity: 0.85 })); m.position.set(c.x, c.y, c.z); m.scale.y = 0.01; m.visible = false; dyn.add(m); return m; }); pipeBag.visible = true; pipeBag.position.set(K.bag.x, T + 0.15, K.bag.z); },
      cellAt(p) { const h = planeAt(p, T + 0.04); let bi = -1, bd = 9; K.cells.forEach((c, i) => { const d = h ? Math.hypot(h.x - c.x, h.z - c.z) : 9, d2 = sdist(p, V3(c.x, c.y, c.z)); const dd = Math.min(d / 0.16, d2 / 46); if (dd < bd) { bd = dd; bi = i; } }); return bd < 1 ? bi : -1; },
      down(s, p) { const i = this.cellAt(p); if (i < 0 || s.lock[i]) return; s.act = i; sfx('squeeze'); },
      move(s, p) { if (s.act < 0) return; const i = this.cellAt(p); if (i >= 0 && i !== s.act && !s.lock[i]) { this.release(s); s.act = i; } },
      up(s) { this.release(s); },
      release(s) { const i = s.act; if (i < 0) return; s.act = -1; const f = s.fill[i]; if (f >= 0.85) { s.lock[i] = 1; flash(f > 1.08 ? 'OVERFLOW!' : f > 1.03 ? 'A BIT FULL' : 'FULL · NICE', f > 1.08 ? '#ec3013' : f > 1.03 ? '#e6b45a' : '#22c55e', 0.7); sfx(f > 1.08 ? 'bad' : 'pop'); if (f > 1.08) s.over++; } else if (f > 0.02) flash('TOP IT UP · HOLD AGAIN', '#ffffff', 0.7); if (s.lock.every(Boolean)) { s.setT = 0.6; } },
      update(s, dt) { if (s.act >= 0) { const i = s.act; s.fill[i] = Math.min(1.2, s.fill[i] + dt * (upg('squeeze') ? 0.42 : 0.55)); if (s.fill[i] >= 1.18) { this.release(s); } pipeBag.position.lerp(V3(K.cells[i].x, T + 0.2, K.cells[i].z), Math.min(1, dt * 14)); pipeBag.scale.set(1 + Math.sin(S.t * 20) * 0.04, 0.92, 1); }
        else { pipeBag.position.lerp(V3(K.bag.x, T + 0.15, K.bag.z), Math.min(1, dt * 6)); pipeBag.scale.set(1, 1, 1); }
        s.jelly.forEach((m, i) => { m.visible = s.fill[i] > 0.01; m.scale.y = Math.max(0.01, s.fill[i]); m.material.color.set(s.act === i && s.fill[i] >= 0.85 && s.fill[i] <= 1.03 ? lerpC(s.col, '#ffffff', 0.25 + 0.2 * Math.sin(S.t * 18)) : s.col); });
        if (s.setT != null) { s.setT -= dt; if (s.setT <= 0 && !s.sent) { s.sent = true; commit('pipe', ...this.score(s)); } } },
      bot(s, dt) { const i = s.lock.findIndex(v => !v); if (i < 0) { if (s.act < 0) hand.visible = false; return; } const c = K.cells[i]; botAt(V3(c.x, c.y + 0.02, c.z), s.fill[i] < 0.93); },
      info(s) { const i = s.act >= 0 ? s.act : s.lock.findIndex(v => !v); return { n: s.lock.filter(Boolean).length, want: 6, fill: i >= 0 ? s.fill[i] : 0, active: s.act >= 0 }; },
      hint(s) { const i = s.lock.findIndex(v => !v); return s.act < 0 && i >= 0 ? { p: V3(K.cells[i].x, T, K.cells[i].z), r: 0.12 } : null; },
      score(s) { let tot = 0; s.fill.forEach(f => { const off = f < 0.85 ? 0.85 - f : f > 1.03 ? f - 1.03 : 0; tot += clamp(100 - off * 400, 0, 100); }); return [tot / 6 - s.over * 6, s.over ? s.over + ' bear(s) overflowed past the line.' : null]; },
      leave(s) { pipeBag.visible = false; W.d.bears = s.jelly; s.jelly.forEach(m => { m.material.opacity = 1; m.material.transparent = false; m.userData.pop = rr(0, 0.3); }); } },
    dust: { enter(s) { s.bears = W.d.bears || []; s.cov = s.bears.map(() => 0); s.bears.forEach(m => { m.scale.y = 1; m.position.y = T + 0.05; }); shaker.visible = true; shaker.position.set(K.shaker.x, T + 0.25, K.shaker.z); s.prev = null;
        s.dust = s.bears.map(m => { const d = new THREE.Mesh(bearGeo(THREE, 0.0099, 0.004), new THREE.MeshToonMaterial({ color: '#fbf6ee', gradientMap: grad, transparent: true, opacity: 0 })); d.position.set(m.position.x, T + 0.1, m.position.z); dyn.add(d); return d; }); },
      down(s, p) { s.prev = planeAt(p, T + 0.06); },
      move(s, p) { const h = planeAt(p, T + 0.06); if (!h) return; shaker.position.set(h.x + 0.04, T + 0.3, h.z - 0.02); if (!s.down || !s.prev) { s.prev = h; return; } const mv = Math.hypot(h.x - s.prev.x, h.z - s.prev.z); s.prev = h; if (mv < 0.002) return;
        s.bears.forEach((m, i) => { const d = Math.hypot(h.x - m.position.x, h.z - m.position.z); if (d < 0.17) s.cov[i] += mv * 9 * (1 - d / 0.2); });
        for (let k = 0; k < 2; k++) { const b = sugarBits[sbI = (sbI + 1) % sugarBits.length]; b.m.visible = true; b.m.position.set(h.x + rr(-0.05, 0.05), T + 0.26, h.z + rr(-0.05, 0.05)); b.v.set(rr(-0.1, 0.1), -1.2, rr(-0.1, 0.1)); b.life = 0.25; } if (Math.random() < 0.25) sfx('shake');
        if (s.cov.every(c => c >= 1) && !s.sent) { s.sent = true; setTimeout(() => commit('dust', ...this.score(s)), 250); } },
      update(s, dt) { s.dust.forEach((d, i) => d.material.opacity = clamp(s.cov[i], 0, 1) * 0.75); s.bears.forEach((m, i) => { if (m.userData.pop > 0) { m.userData.pop -= dt; m.position.y = T + 0.05 + Math.max(0, Math.sin(m.userData.pop * 10)) * 0.04; } }); if (!s.down) shaker.position.lerp(V3(K.shaker.x, T + 0.25, K.shaker.z), Math.min(1, dt * 3)); },
      bot(s, dt) { s.bt = (s.bt || 0) + dt; const row = Math.floor(s.bt / 0.9) % 2, k = (s.bt % 0.9) / 0.9, x = K.mould.x - 0.48 + (row ? 1 - k : k) * 0.8, z = K.mould.z - 0.16 + row * 0.32; botAt(V3(x, T + 0.06, z), true); },
      info(s) { const c = s.cov.reduce((a, b) => a + Math.min(1, b), 0) / Math.max(1, s.cov.length); return { cov: c, n: s.cov.filter(c => c >= 1).length, want: s.cov.length }; },
      hint(s) { const i = s.cov.findIndex(c => c < 1); return i >= 0 && !s.down ? { p: V3(s.bears[i].position.x, T, s.bears[i].position.z), r: 0.12 } : null; },
      score(s) { const heavy = s.cov.filter(c => c > 3.2).length; return [100 - heavy * 6 - Math.max(0, s.t - 8) * 2, heavy ? 'Some bears got buried in sugar.' : null]; },
      leave(s) { shaker.visible = false; sugarBits.forEach(b => b.m.visible = false); } },
    temper: { enter(s) { s.c = 30; s.warm = false; s.prog = 0; s.out = 0; s.hot = 0; s.started = false; },
      update(s, dt) { s.c = clamp(s.c + dt * (s.warm ? 7.5 : -5.2), 24, 72); const lo = 44, hi = 52, inB = s.c >= lo && s.c <= hi; if (inB) { s.started = true; s.prog = Math.min(100, s.prog + dt * 16.5); } else if (s.started) s.out += dt; if (s.c > 60) s.hot = Math.max(s.hot, s.c);
        K.burners[1].glow.material.opacity = s.warm ? 0.8 : damp(K.burners[1].glow.material.opacity, 0, 4, dt); const sm = K.chocSurf.material; sm.color.set(inB ? lerpC('#5c3a22', '#7a4a2a', 0.5 + 0.5 * Math.sin(S.t * 6)) : s.c > hi ? '#6b4a32' : '#3e2414'); K.chocSurf.rotation.z += dt * (s.warm ? 2 : 0.6);
        if (s.warm && Math.random() < dt * 3) puff(K.temper.x, BT + 0.4, K.temper.z, 0xffffff, 1); if (s.prog >= 100 && !s.sent) { s.sent = true; s.warm = false; commit('temper', ...this.score(s)); } },
      down(s) { s.warm = true; }, up(s) { s.warm = false; },
      bot(s, dt) { const want = s.c < 47 || (s.warm && s.c < 49); botAt(V3(K.temper.x, BT + 0.3, K.temper.z), want); },
      info(s) { return { c: s.c, lo: 44, hi: 52, min: 24, max: 72, prog: s.prog, warming: s.warm }; }, hint(s) { return s.prog < 5 && !s.warm ? { p: V3(K.temper.x, BT + 0.02, K.temper.z), r: 0.28 } : null; },
      score(s) { return [100 - s.out * 5 - (s.hot ? 15 : 0), s.hot ? 'Overheated: the chocolate lost its temper.' : s.out > 3 ? 'The needle wandered out of the band.' : null]; },
      leave() { K.burners[1].glow.material.opacity = 0; } },
    roll: { enter(s) { s.x = [-1.35, -0.95, -0.55, -0.15]; s.prog = [0, 0, 0, 0]; s.act = -1; s.prevA = null;
        s.balls = s.x.map((x, i) => { const g = new THREE.IcosahedronGeometry(0.08, 2), pos = g.attributes.position, base = Float32Array.from(pos.array), lump = new Float32Array(pos.array.length); for (let k = 0; k < pos.count; k++) { const vx = base[k * 3], vy = base[k * 3 + 1], vz = base[k * 3 + 2], n = 1 + 0.28 * Math.sin(vx * 60 + i) * Math.cos(vz * 50 - i) + 0.18 * Math.sin(vy * 70); lump[k * 3] = vx * n * 1.15; lump[k * 3 + 1] = vy * n * 0.7; lump[k * 3 + 2] = vz * n * 1.1; }
          const m = new THREE.Mesh(g, toon('#4a2c18')); addOutline(m, 0.006, 0.08); m.userData = { base, lump }; m.position.set(x, T + 0.065, K.slab.z); dyn.add(m); this.morph(m, 0); return m; }); },
      cluster(s) { const i = s.act >= 0 ? s.act : Math.max(0, s.prog.findIndex(v => v < 1)); return { key: i, pts: [P(s.x[i] - 0.3, T, K.slab.z - 0.3), P(s.x[i] + 0.3, T, K.slab.z + 0.3), P(s.x[i], T + 0.2, K.slab.z)] }; },
      morph(m, k) { const { base, lump } = m.userData, a = m.geometry.attributes.position.array; for (let i = 0; i < a.length; i++) a[i] = lump[i] + (base[i] - lump[i]) * k; m.geometry.attributes.position.needsUpdate = true; m.geometry.computeVertexNormals(); },
      pickAt(s, p) { let bi = -1, bd = 1e9; s.balls.forEach((m, i) => { const d = sdist(p, m.position); if (d < bd) { bd = d; bi = i; } }); const r = Math.abs(scr(V3(s.x[0] + 0.08, T, K.slab.z)).x - scr(V3(s.x[0], T, K.slab.z)).x); return bd < Math.max(48, r * 3) ? bi : -1; },
      down(s, p) { s.act = this.pickAt(s, p); s.prevA = null; },
      move(s, p) { if (!s.down) return; const i = this.pickAt(s, p); if (i >= 0 && i !== s.act) { s.act = i; s.prevA = null; } if (s.act < 0 || s.prog[s.act] >= 1) return; const c = scr(s.balls[s.act].position), a = Math.atan2(p.sy - c.y, p.sx - c.x);
        if (s.prevA != null) { let da = a - s.prevA; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; const i2 = s.act; s.prog[i2] = Math.min(1, s.prog[i2] + Math.abs(da) / (Math.PI * 3.2)); s.balls[i2].rotation.y += da; this.morph(s.balls[i2], s.prog[i2]); if (Math.random() < 0.1) sfx('roll', { v: 0.7 }); if (s.prog[i2] >= 1) { sfx('pop'); FX.sparkle(s.balls[i2].position, 5, 0xffe2a8); flash('ROUND! ' + s.prog.filter(v => v >= 1).length + ' / 4', '#22c55e', 0.6); if (s.prog.every(v => v >= 1)) commit('roll', ...this.score(s)); } } s.prevA = a; },
      up(s) { s.act = -1; s.prevA = null; },
      bot(s, dt) { const i = s.prog.findIndex(v => v < 1); if (i < 0) return; s.ba = (s.ba || 0) + dt * 9; botAt(V3(s.x[i] + Math.cos(s.ba) * 0.07, T + 0.07, K.slab.z + Math.sin(s.ba) * 0.07), true); },
      info(s) { return { n: s.prog.filter(v => v >= 1).length, want: 4, cur: s.prog[Math.max(0, s.prog.findIndex(v => v < 1))] || 1 }; }, hint(s) { const i = s.prog.findIndex(v => v < 1); return i >= 0 && !s.down ? { p: V3(s.x[i], T, K.slab.z), r: 0.1 } : null; },
      score(s) { return [100 - Math.max(0, s.t - 12) * 3, null]; },
      leave(s) { W.d.balls = s.balls; W.d.ballX = s.x; } },
    coat: { enter(s) { s.balls = W.d.balls || []; s.x = W.d.ballX || [-1.3, -0.8, -0.3, 0.2]; s.done = s.balls.map(() => null); s.car = -1; s.anim = []; s.x = s.x.slice();
        s.balls.forEach(m => { m.material = toon('#4a2c18'); }); },
      cluster(s) { const i = s.car >= 0 ? s.car : Math.max(0, s.done.findIndex(v => !v)); return { key: i, pts: [P(s.x[i] - 0.25, T, K.slab.z - 0.5), P(0.82, T, K.slab.z + 0.5), P(s.x[i], T + 0.25, K.slab.z)] }; },
      bowlAt(v) { for (const [k, b] of Object.entries(K.coat)) if (Math.hypot(v.x - b.x, v.z - b.z) < 0.27) return k; return null; },
      dunk(s, i, k) { s.done[i] = k; const m = s.balls[i], b = K.coat[k]; s.anim.push({ i, k, t: 0, from: m.position.clone(), b }); sfx('poof', { d: 0.3 }); if (k !== W.o.flav) { W.wrong = true; flash('THE TICKET SAYS ' + COATS[W.o.flav].name, '#ec3013', 1); } },
      down(s, p) { let bi = -1, bd = 1e9; s.balls.forEach((m, i) => { if (s.done[i]) return; const d = sdist(p, m.position); if (d < bd) { bd = d; bi = i; } }); if (bi >= 0 && bd < 64) { s.car = bi; sfx('stretch'); } },
      move(s, p) { if (s.car < 0) return; const h = planeAt(p, T + 0.12); if (h) s.balls[s.car].position.set(clamp(h.x, -2.0, 1.3), T + 0.12, clamp(h.z, K.slab.z - 0.5, K.slab.z + 0.5)); },
      up(s) { if (s.car < 0) return; const i = s.car, m = s.balls[i], k = this.bowlAt(m.position); s.car = -1; if (k) this.dunk(s, i, k); else m.position.set(s.x[i], T + 0.065, K.slab.z); },
      update(s, dt) { for (let j = s.anim.length - 1; j >= 0; j--) { const a = s.anim[j], m = s.balls[a.i]; a.t += dt; const k = clamp(a.t / 0.9, 0, 1);
          if (k < 0.4) { m.position.lerpVectors(a.from, V3(a.b.x, a.b.y + 0.02, a.b.z), k / 0.4); } else if (k < 0.6) { m.rotation.x += dt * 14; if (!a.c) { a.c = 1; m.material = toon(COATS[a.k].col); puff(a.b.x, a.b.y + 0.1, a.b.z, a.k === 'mint' ? 0xbfeccd : 0x9a6a4a, 2); } } else m.position.lerpVectors(V3(a.b.x, a.b.y + 0.05, a.b.z), V3(s.x[a.i], T + 0.065, K.slab.z + 0.0), (k - 0.6) / 0.4);
          if (k >= 1) { s.anim.splice(j, 1); if (s.done.every(Boolean) && !s.anim.length) commit('coat', 100, null); } } },
      bot(s, dt) { const i = s.done.findIndex(v => !v); if (i < 0) { hand.visible = false; return; } s.bt = (s.bt || 0) + dt; const b = K.coat[W.o.flav], k = clamp(s.bt / 0.8, 0, 1), from = V3(s.x[i], T + 0.07, K.slab.z), to = V3(b.x, T + 0.12, b.z);
        botAt(from.clone().lerp(to, k), k < 1); if (s.bt > 1.0) s.bt = 0; },
      info(s) { return { n: s.done.filter(Boolean).length, want: s.balls.length, coat: W.o.flav }; }, hint(s) { return s.car < 0 ? { p: V3(K.coat[W.o.flav].x, T, K.coat[W.o.flav].z), r: 0.2 } : null; },
      leave(s) { W.d.coated = s.done.slice(); } },
    box: { enter(s) { s.sub = 'fill'; s.t = 0; boxG.visible = true; const sp0 = K.spots[W.o.spot]; boxG.position.set(sp0.x + 0.15, CT, CZ() - 0.12); lid.rotation.x = -1.9; ribbon.visible = false; while (boxItems.children.length) boxItems.remove(boxItems.children[0]);
        const o = W.o, kind = o.candy, items = []; const n = kind === 'truffle' ? 4 : 6;
        for (let i = 0; i < n; i++) { const opts = kind === 'taffy' ? { col: W.d.taffyCol || FLAVORS[W.d.flav || 'strawberry'].col } : kind === 'gummy' ? { col: FLAVORS[W.d.flav || 'strawberry'].col, dust: true } : kind === 'truffle' ? { col: COATS[(W.d.coated && W.d.coated[i]) || o.flav].col } : { tex: rockTex, grad };
          const m = sweetMesh(THREE, toon, addOutline, kind, opts); const tx = kind === 'truffle' ? -0.07 + (i % 2) * 0.14 : -0.1 + (i % 3) * 0.1, tz = kind === 'truffle' ? -0.05 + Math.floor(i / 2) * 0.1 : -0.05 + Math.floor(i / 3) * 0.1; m.userData = { to: V3(tx, 0.06, tz), t: -i * 0.12 }; m.scale.setScalar(kind === 'truffle' ? 1.4 : 1.3); m.position.set(tx - 0.6, 0.4, tz); m.visible = false; boxItems.add(m); items.push(m); }
        s.items = items; s.home = boxG.position.clone(); s.giveT = 0; },
      update(s, dt) { if (s.sub === 'fill') { let all = true; s.items.forEach(m => { const u = m.userData; u.t += dt; if (u.t < 0) { all = false; return; } m.visible = true; const k = clamp(u.t / 0.35, 0, 1); m.position.lerpVectors(V3(u.to.x - 0.5, 0.35, u.to.z), u.to, k); m.position.y += Math.sin(k * Math.PI) * 0.18; if (k < 1) all = false; else if (!u.p) { u.p = 1; sfx('plop'); } }); if (all) { s.ct = (s.ct || 0) + dt; lid.rotation.x = -1.9 * (1 - clamp(s.ct / 0.35, 0, 1)); if (s.ct > 0.4) { s.sub = 'tie'; } } }
        else if (s.sub === 'tied') { s.tt += dt; ribbon.scale.setScalar(1 + Math.sin(clamp(s.tt / 0.3, 0, 1) * Math.PI) * 0.3); if (s.tt > 0.45) { s.sub = 'give'; say('ANGELICA: "Now hand it over to ' + W.o.name + '!"', 3); } }
        else if (s.sub === 'back') { boxG.position.lerp(s.home, Math.min(1, dt * 8)); if (boxG.position.distanceTo(s.home) < 0.01) s.sub = 'give'; }
        else if (s.sub === 'gone') { s.giveT += dt; const sp = K.spots[W.o.spot]; boxG.position.lerp(V3(sp.x, 1.05, sp.z - 0.1), Math.min(1, dt * 5)); if (s.giveT > 0.5 && !s.sent) { s.sent = true; boxG.visible = false; commit('box', 100); } } },
      boxScreen() { const c = scr(boxG.position.clone().add(V3(0, 0.06, 0))), a = scr(boxG.position.clone().add(V3(-0.19, 0.06, 0))), b = scr(boxG.position.clone().add(V3(0.19, 0.06, 0))), d = scr(boxG.position.clone().add(V3(0, 0.06, -0.15))), e = scr(boxG.position.clone().add(V3(0, 0.06, 0.15))); return { c, w: Math.max(40, Math.hypot(b.x - a.x, b.y - a.y)), h: Math.max(30, Math.hypot(e.x - d.x, e.y - d.y)) }; },
      down(s, p) { const B2 = this.boxScreen(); if (s.sub === 'tie') { s.sw = { x0: p.sx, y0: p.sy, minX: p.sx, maxX: p.sx, hit: Math.hypot(p.sx - B2.c.x, p.sy - B2.c.y) < B2.w } }
        else if (s.sub === 'give') { if (Math.abs(p.sx - B2.c.x) < B2.w * 0.9 && Math.abs(p.sy - B2.c.y) < B2.h * 1.2 + 20) { s.drag = true; sfx('stretch'); } } },
      move(s, p) { if (s.sub === 'tie' && s.sw) { const B2 = this.boxScreen(); s.sw.minX = Math.min(s.sw.minX, p.sx); s.sw.maxX = Math.max(s.sw.maxX, p.sx); if (Math.abs(p.sy - B2.c.y) < B2.h * 1.3 + 24 && Math.abs(p.sx - B2.c.x) < B2.w) s.sw.hit = true;
          if (s.sw.hit && s.sw.maxX - s.sw.minX > B2.w * 0.7 && s.sw.minX < B2.c.x && s.sw.maxX > B2.c.x) { s.sw = null; ribbon.visible = true; s.sub = 'tied'; s.tt = 0; sfx('zip'); sfx('sparkle', { d: 0.12 }); FX.sparkle(boxG.position.clone().add(V3(0, 0.15, 0)), 12, 0xffd23a); flash('BOW TIED!', '#22c55e', 0.7); } }
        else if (s.sub === 'give' && s.drag) { const h = planeAt(p, CT); if (h) boxG.position.set(clamp(h.x, -5.4, 2.6), CT, clamp(h.z, CZ() - 0.3, CZ() + 0.45)); } },
      up(s) { s.sw = null; if (s.sub !== 'give' || !s.drag) return; s.drag = false; const bx = boxG.position; let who = null; for (const o of orders) { if (o.st !== 'wait') continue; const sp = K.spots[o.spot]; if (Math.abs(bx.x - sp.x) < 0.6 && bx.z > CZ() + 0.12) who = o; }
        if (who === W.o) { s.sub = 'gone'; sfx('serve'); } else if (who) { flash(who.name + ': "That is not mine!"', '#e6b45a', 1.1); who.f.userData.hop = 1; sfx('bad'); s.sub = 'back'; } else s.sub = 'back'; },
      bot(s, dt) { if (s.sub === 'tie') { s.bt = (s.bt || 0) + dt; const k = clamp(s.bt / 0.6, 0, 1); botAt(boxG.position.clone().add(V3(-0.25 + k * 0.5, 0.06, 0)), k < 1); if (s.bt > 0.8) s.bt = 0; }
        else if (s.sub === 'give') { s.bt2 = (s.bt2 || 0) + dt; const sp = K.spots[W.o.spot], k = clamp(s.bt2 / 0.9, 0, 1); botAt(s.home.clone().lerp(V3(sp.x, CT, CZ() + 0.35), k).add(V3(0, 0.06, 0)), k < 1); } else if (B.down && B.v) botAt(B.v, false); },
      info(s) { return { sub: s.sub, who: W.o.name }; },
      hint(s) { if (s.sub === 'tie') return { p: boxG.position.clone(), r: 0.24 }; if (s.sub === 'give' && !s.drag) { const sp = K.spots[W.o.spot]; return { p: V3(sp.x, CT + 0.01, CZ() + 0.28), r: 0.22 }; } return null; },
      leave() {} } };
  const hintPt = { p: V3(), r: 0.2 };

  // ---------- shift flow ----------
  function setCastFor(phase) { const work = phase === 'glide' || phase === 'shift'; hero.visible = phase === 'walk' && !WC.pov; browser.visible = phase === 'walk'; ben.visible = phase === 'intro' || phase === 'done'; angelica.visible = true;
    if (phase === 'intro' || phase === 'done') { ben.position.set(-2.7, 0, 1.75); ben.rotation.y = -0.25; angelica.position.set(K.angelica.x, 0, K.angelica.z); } if (!work) custFox.forEach(f => f.visible = false); }
  function toIntro() { if (DM.on) return demoStop(); S.phase = 'intro'; S.done = null; S.talk = null; clearJob(); W = null; orders.length = 0; setUniform(true); setCastFor('intro'); glideTo(wideShot(), 1.1); }
  function toWalk() { if (DM.on) demoStop(); S.phase = 'walk'; S.done = null; S.talk = null; clearJob(); W = null; orders.length = 0; setCastFor('walk'); setHero(readHero()); if (hero.position.z < K.counter.z + 0.8) { hero.position.set(-2.6, 0, 1.9); hero.rotation.y = Math.PI; } WC.yaw = 0; WC.dragT = 0; }
  function startShift(demoList) { if (!(S.phase === 'intro' || S.phase === 'done' || demoList)) return; audioOn(); clearJob(); W = null; orders.forEach(o => o.f.visible = false); orders.length = 0;
    const N = demoList ? demoList.length : 3 + Math.min(3, S.day - 1);
    Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: demoList ? 0.3 : 1.2, done: null, react: null, toSpawn: N, total: N, glideT: 1.3, focus: 'counter' });
    S.queue = demoList ? demoList.slice() : null; setUniform(!!save.flag('candyUniform')); setCastFor('glide'); glideTo(stepShot('counter'), 1.3); say('ANGELICA: "Sugar on the left, the slab in the middle, moulds on the right. Box it at the counter. Go go go!"', 5); }
  function endShift() { const d = S.day, n = S.starList.length, avg = n ? S.starList.reduce((a, b) => a + b, 0) / n : 0, wage = 8 + 4 * d, total = wage + S.earned + S.tips, eod = n >= 3 && avg >= 2.5 && !S.lost, newDay = n >= Math.ceil(S.total * 0.66) && avg >= 2, unlock = [];
    if (!S.demo) { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + S.starList.reduce((a, b) => a + b, 0)); if (n >= 3 && !save.flag('candyUniform')) { save.setFlag('candyUniform'); unlock.push('CANDY SHOP UNIFORM · paper hat, pink towel + lollipop tee'); } if (newDay) { save.setStat(SAVE.day, d + 1); if (d + 1 === CANDIES.rock.day) unlock.push('NEW SWEET · PEPPERMINT ROCK'); } if (eod) save.addXp(25); }
    S.done = { day: d, served: n, lost: S.lost, avg: avg.toFixed(1), wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: S.starList.reduce((a, b) => a + b, 0) };
    if (newDay && !S.demo) S.day = d + 1; S.phase = 'done'; clearJob(); setCastFor('done'); setUniform(!!save.flag('candyUniform') || S.demo); CA.jingle('day'); glideTo(wideShot(), 1.2); say(eod ? 'ANGELICA: "EMPLOYEE OF THE DAY! The whole square can smell it!"' : n >= 3 ? 'ANGELICA: "Good shift. Same coppers tomorrow?"' : 'ANGELICA: "Sticky day. Tomorrow will be sweeter."', 5); }
  function shiftStep(dt) { S.t += dt;
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; flash('DOORS OPEN!', '#22c55e', 1.2); } }
    custStep(dt);
    for (const o of orders) if (o.st === 'served') { o.leaveIn -= dt; if (o.leaveIn <= 0) { o.st = 'leave'; } }
    if (S.react) { S.reactT -= dt; if (S.reactT <= 0) S.react = null; }
    if (S.phase !== 'shift') return;
    S.next -= dt; const waiting = orders.filter(o => o.st === 'walk' || o.st === 'wait').length;
    if (S.toSpawn > 0 && S.next <= 0 && waiting < (S.demo ? 1 : 2)) { const q = S.queue && S.queue.shift(); if (makeOrder(q && q[0], q && q[1])) { S.toSpawn--; S.next = S.demo ? 0.4 : rr(9, 15); } }
    if (!W && !S.react) { const o = orders.filter(x => x.st === 'wait').sort((a, b) => a.id - b.id)[0]; if (o) startJob(o); else if (S.focus !== 'counter') { S.focus = 'counter'; glideTo(stepShot('counter'), 0.9); } }
    if (W) { const id = stepId(), st = W.st; st.t += dt; STEP[id].update && STEP[id].update(st, dt); if (S.demo && !W.busy && STEP[id].bot && st.t > 0.6) STEP[id].bot(st, dt); }
    if (!W && S.toSpawn === 0 && !orders.some(o => o.st === 'walk' || o.st === 'wait' || o.st === 'served') && !S.react) { if (S.demo) demoStop(); else endShift(); } }
  // pot visuals (boil step + the flavour drop)
  function potFx(dt) { const id = stepId(), s = W && W.st; const boiling = id === 'boil' && s && s.on;
    K.burners[0].glow.material.opacity = damp(K.burners[0].glow.material.opacity, boiling ? 0.85 : 0, 6, dt);
    if (id === 'boil' && s) { const tN = (s.temp - 18) / 82, base = lerpC('#f6efe0', '#d9902e', tN); if (W.d.flav) base.lerp(new THREE.Color(FLAVORS[W.d.flav].col), 0.4); syrupMat.color.copy(base); K.thermCol.scale.y = clamp(s.temp / 100, 0.02, 1) * 0.36; scorchRing.material.opacity = s.scorch / 100 * 0.8;
      swirl.visible = true; swirl.rotation.z = -s.ang; swirl.material.opacity = 0.18 + 0.32 * (1 - tN); spoon.visible = true; const stir = tick() - s.stirAt < 0.3; s.sa = (s.sa || 0); spoon.position.set(Math.cos(s.ang) * 0.11, 0.15, Math.sin(s.ang) * 0.11); spoon.rotation.set(Math.sin(s.ang) * 0.35, 0, -Math.cos(s.ang) * 0.35);
      bubbles.forEach((b, i) => { b.t += dt * (0.6 + tN * 2.4); if (b.t > 1) { b.t = 0; const a = rr(0, 6.28), r = rr(0, K.potR - 0.04); b.x = Math.cos(a) * r; b.z = Math.sin(a) * r; } b.m.visible = s.on && i < 4 + tN * 12; b.m.position.set(b.x, 0.145, b.z); b.m.scale.setScalar(0.4 + Math.sin(b.t * Math.PI) * (0.6 + tN)); });
      if (s.on && Math.random() < dt * (1 + tN * 5)) puff(K.pot.x + rr(-0.1, 0.1), K.potY + 0.4, K.pot.z, 0xffffff, 1); }
    else { bubbles.forEach(b => b.m.visible = false); swirl.visible = id === 'flavor' && syrup.visible; }
    if (id === 'temper' && s) { const inB = s.c >= 44 && s.c <= 52; chocSheen.material.opacity = damp(chocSheen.material.opacity, inB ? 0.55 : s.c > 52 ? 0.15 : 0.05, 4, dt); chocSheen.rotation.z += dt * (s.warm ? 1.6 : 0.5); } else chocSheen.material.opacity = 0; }
  function sugarFx(dt) { sugarBits.forEach(b => { if (b.life <= 0) { b.m.visible = false; return; } b.life -= dt; b.m.position.addScaledVector(b.v, dt); }); }

  // ---------- demo ----------
  const DEMO_CAP = { flavor: ['TAP', 'Tap the bottle the ticket asks for.'], boil: ['CIRCLE', 'Stir in circles, then OFF THE HEAT in the band.'], pull: ['DRAG', 'Drag the taffy to the green zone and let go. Three times.'], cut: ['SWIPE', 'Swipe across the rope at each red marker.'],
    temper: ['HOLD', 'Hold to warm, let go to cool. Keep the needle in the band.'], roll: ['CIRCLE', 'Circle each truffle until it is round.'], coat: ['DRAG', 'Drag each truffle into the MINT bowl.'], box: ['SWIPE', 'Swipe across the box to tie the bow, then slide it across the counter.'], pipe: ['HOLD', 'Hold on a mould, let go in the green.'], dust: ['SWEEP', 'Sweep the shaker over the bears.'], rope: ['SWIPE', 'Roll side to side to the flag.'] };
  function demoStart() { if (DM.on) return; DM.on = true; S.demo = true; DM.day0 = S.day; startShift([['taffy', 'strawberry'], ['truffle', 'mint']]); }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; B.down = false; S.day = DM.day0; S.react = null; orders.forEach(o => o.f.visible = false); orders.length = 0; clearJob(); W = null; S.phase = 'intro'; S.done = null; setUniform(true); setCastFor('intro'); glideTo(wideShot(), 1.1); }

  // ---------- visual effects: sparkles, confetti, emotes, burner flames, steam, window light, dust motes ----------
  const FX = (() => {
    const starT = canvasTex(64, 64, g => { g.clearRect(0, 0, 64, 64); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(32, 0); g.quadraticCurveTo(36, 28, 64, 32); g.quadraticCurveTo(36, 36, 32, 64); g.quadraticCurveTo(28, 36, 0, 32); g.quadraticCurveTo(28, 28, 32, 0); g.fill(); });
    const sp = []; for (let i = 0; i < 40; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: starT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; m.renderOrder = 35; scene.add(m); sp.push({ m, life: 0, v: V3(), s: 0.1 }); } let spI = 0;
    const cfCols = [0xff9ec4, 0xffd23a, 0x8fd6a8, 0x8fb0d8, 0xfbf6ee, 0xe04a5a], cf = []; for (let i = 0; i < 46; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({ color: cfCols[i % cfCols.length], side: THREE.DoubleSide })); m.visible = false; scene.add(m); cf.push({ m, life: 0, v: V3(), w: V3() }); }
    const emoT = ['?', '…', '♪', '♥'].map((ch, i) => canvasTex(128, 128, g => { g.clearRect(0, 0, 128, 128); g.fillStyle = '#000'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.strokeStyle = ['#8fb0d8', '#e6b45a', '#ffd23a', '#ff9ec4'][i]; g.lineWidth = 8; g.stroke(); g.fillStyle = ['#cfd8e8', '#ffffff', '#ffd23a', '#ff6fa8'][i]; g.font = '900 64px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, i === 1 ? 54 : 68); }));
    const emo = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoT[3], depthTest: false, transparent: true })); emo.scale.setScalar(0.55); emo.renderOrder = 38; emo.visible = false; scene.add(emo); let emoF = null, emoLife = 0;
    // gas flames: a ring of little blue-and-orange tongues on each burner
    const flames = K.burners.map(b => { const g = new THREE.Group(); g.position.set(b.x, BT + 0.05, b.z); scene.add(g); const out = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }), inn = new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
      const tongues = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, t = new THREE.Group(); t.position.set(Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17); const o = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.09, 6), out); o.position.y = 0.045; const n = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 6), inn); n.position.y = 0.025; t.add(o, n); g.add(t); tongues.push(t); } g.visible = false; return { g, tongues, on: 0 }; });
    const steam = []; for (let i = 0; i < 18; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(m); steam.push({ m, life: 0, v: V3(), s0: 0.2 }); } let stI = 0;
    // warm light falling through the front windows + motes drifting in it (walk / intro only)
    const beamT = canvasTex(64, 256, g => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,226,168,0.55)'); gr.addColorStop(1, 'rgba(255,226,168,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); }), beams = new THREE.Group();
    for (const x of [-3.6, -0.6]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 3.6), new THREE.MeshBasicMaterial({ map: beamT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0.5 })); m.position.set(x, 1.45, ROOM.D / 2 - 1.35); m.rotation.x = -0.95; beams.add(m); } scene.add(beams);
    const NM = 70, mg = new THREE.BufferGeometry(), mp = new Float32Array(NM * 3), mv = []; for (let i = 0; i < NM; i++) { mp[i * 3] = rr(-4.8, 0.6); mp[i * 3 + 1] = rr(0.3, 3.2); mp[i * 3 + 2] = rr(1.6, 4.8); mv.push(rr(0, 6)); } mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xffe9c4, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false })); scene.add(motes);
    return {
      sparkle(p, n = 10, col = 0xffffff) { for (let i = 0; i < n; i++) { const q = sp[spI = (spI + 1) % sp.length]; q.m.visible = true; q.m.material.color.setHex(col); q.m.position.copy(p).add(V3(rr(-0.08, 0.08), rr(0, 0.08), rr(-0.08, 0.08))); q.v.set(rr(-0.6, 0.6), rr(0.4, 1.2), rr(-0.6, 0.6)); q.life = rr(0.5, 0.85); q.s = rr(0.07, 0.14); } },
      confetti(p) { cf.forEach(c => { c.m.visible = true; c.m.position.copy(p).add(V3(rr(-0.2, 0.2), 0, rr(-0.2, 0.2))); c.v.set(rr(-1.3, 1.3), rr(1.2, 2.8), rr(-1.3, 1.3)); c.w.set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); c.life = rr(1.3, 2.1); }); },
      emote(f, stars) { emoF = f; emoLife = 2.6; emo.material.map = emoT[stars]; emo.material.needsUpdate = true; emo.visible = true; },
      update(dt, t) {
        sp.forEach(q => { if (q.life <= 0) { q.m.visible = false; return; } q.life -= dt; q.v.y -= dt * 1.2; q.m.position.addScaledVector(q.v, dt); q.m.scale.setScalar(q.s * Math.min(1, q.life * 3)); q.m.material.rotation += dt * 4; });
        cf.forEach(c => { if (c.life <= 0) { c.m.visible = false; return; } c.life -= dt; c.v.y -= dt * 4.2; c.v.multiplyScalar(1 - dt * 0.9); c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.w.x * dt; c.m.rotation.y += c.w.y * dt; if (c.m.position.y < 0.02) { c.m.position.y = 0.02; c.v.set(0, 0, 0); c.w.set(0, 0, 0); } });
        if (emoLife > 0 && emoF) { emoLife -= dt; emo.visible = emoF.visible; emo.position.copy(emoF.position).add(V3(0, 3.0 + Math.sin(t * 5) * 0.06, 0)); emo.scale.setScalar(0.55 * Math.min(1, (2.6 - emoLife) * 6) * Math.min(1, emoLife * 3)); } else emo.visible = false;
        const id = stepId(), s = W && W.st, on = [!!(id === 'boil' && s && s.on), !!(id === 'temper' && s && s.warm)];
        flames.forEach((F, i) => { F.on = damp(F.on, on[i] ? 1 : 0, 10, dt); F.g.visible = F.on > 0.02; F.tongues.forEach((tg, k) => { const fl = 0.75 + 0.35 * Math.sin(t * 23 + k * 2.1) + 0.15 * Math.sin(t * 41 + k); tg.scale.set(F.on, F.on * fl, F.on); }); });
        const sources = []; if (on[0]) sources.push([K.pot.x, K.potY + 0.34, K.pot.z, 0.6 + (s.temp - 18) / 40]); if (id === 'temper' && s && s.c > 38) sources.push([K.temper.x, BT + 0.36, K.temper.z, 0.6]);
        sources.forEach(([x, y, z, rate]) => { if (Math.random() < dt * 9 * rate) { const q = steam[stI = (stI + 1) % steam.length]; q.m.position.set(x + rr(-0.08, 0.08), y, z + rr(-0.08, 0.08)); q.v.set(rr(-0.05, 0.05), rr(0.25, 0.45), rr(-0.05, 0.05)); q.life = 1; q.s0 = rr(0.18, 0.3); } });
        steam.forEach(q => { if (q.life <= 0) { q.m.material.opacity = 0; return; } q.life -= dt * 0.6; q.m.position.addScaledVector(q.v, dt); q.m.scale.setScalar(q.s0 * (1 + (1 - q.life) * 1.3)); q.m.material.opacity = Math.sin(Math.max(0, q.life) * Math.PI) * 0.22 * clamp(camera.position.distanceTo(q.m.position) / 1.6, 0, 1); });
        const amb = S.phase === 'walk' || S.phase === 'intro' || S.phase === 'done'; beams.visible = amb && K.frontG.visible; motes.visible = amb;
        if (amb) { const a = mg.attributes.position.array; for (let i = 0; i < NM; i++) { mv[i] += dt * 0.4; a[i * 3] += Math.sin(mv[i]) * dt * 0.05; a[i * 3 + 1] += Math.cos(mv[i] * 0.7) * dt * 0.04; } mg.attributes.position.needsUpdate = true; motes.material.opacity = 0.45 + Math.sin(t) * 0.15; } } }; })();
  function audioStep(dt) { const id = stepId(), s = W && W.st; CA.song(S.phase === 'shift' || S.phase === 'glide' ? 'shift' : 'shop');
    const boiling = !!(id === 'boil' && s && s.on), tN = boiling ? (s.temp - 18) / 82 : 0;
    CA.loop('boil', boiling ? 0.2 + tN * 0.8 : 0); CA.loop('burner', boiling || (id === 'temper' && s && s.warm) ? 1 : 0); CA.loop('pipe', id === 'pipe' && s && s.act >= 0 ? 1 : 0); CA.loop('warm', id === 'temper' && s && s.warm ? 1 : 0); CA.loop('room', 1);
    CA.update(dt); FX.update(dt, S.clk); }
  // ---------- frame ----------
  let hudT = 0, heroT = 0;
  function step(dt) {
    S.clk += dt; if (S.flashT > 0) { S.flashT -= dt; if (S.flashT <= 0) S.flash = null; } if (S.sayT > 0) { S.sayT -= dt; if (S.sayT <= 0) S.say = ''; } if (S.sayWalkT > 0) { S.sayWalkT -= dt; if (S.sayWalkT <= 0) S.sayWalk = null; } if (S.toastT > 0) { S.toastT -= dt; if (S.toastT <= 0) S.toast = null; }
    if (S.phase === 'walk') { heroT -= dt; if (heroT <= 0) { heroT = 0.5; setHero(readHero()); } walkStep(dt); }
    else if (S.phase === 'debug') { camera.lookAt(CAM.look); } else { if (CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = CAM.t * CAM.t * (3 - 2 * CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); if (CAM.t >= 1) CAM.from = null; }
      else { const sh = S.phase === 'intro' || S.phase === 'done' ? wideShot() : stepShot(S.focus || 'counter'); camera.position.lerp(sh.pos, Math.min(1, dt * 3)); CAM.look.lerp(sh.look, Math.min(1, dt * 3)); } camera.lookAt(CAM.look); }
    if (S.phase === 'glide' || S.phase === 'shift') shiftStep(dt);
    potFx(dt); sugarFx(dt);
    { let want = 0; const dz = { x: K.door.x, z: K.door.z + 0.4 }; for (const f of [hero, ...custFox]) if (f && f.visible && Math.hypot(f.position.x - dz.x, f.position.z - dz.z) < 1.3) want = 1.25; const dp = K.doorPivot; if (dp) { const was = dp.rotation.y; dp.rotation.y = damp(dp.rotation.y, want, 5, dt); if (was < 0.05 && dp.rotation.y >= 0.05 && S.phase !== 'debug') sfx('bell', { v: 0.6 }); } }
    // the shop's people
    kit.animFox(angelica, dt, 0); kit.animFox(browser, dt, 0); if (ben.visible) { kit.animFox(ben, dt, 0); const BP = ben.userData.P; BP.arms[1].rotation.x = -2.4 + Math.sin(S.t * 6 + performance.now() / 160) * 0.3; BP.arms[1].rotation.z = 0.5; S.t += S.phase === 'intro' || S.phase === 'done' ? dt : 0; }
    if (S.phase === 'shift' || S.phase === 'glide') { angelica.userData.lookAt = W ? V3(K.slab.x, 1.2, K.slab.z) : null; }
    // hint ring
    const id = stepId(); let h = null; if (id && !W.busy && S.phase === 'shift' && STEP[id].hint) { const q = STEP[id].hint(W.st); if (q) h = q; } S.hintT += dt; hints.place(h, S.hintT, dt);
    if (!S.demo || !W) hand.visible = false;
    lampGl.forEach((s, i) => s.material.opacity = 0.42 + Math.sin(S.hintT * 1.3 + i) * 0.05);
    // dollhouse cut-away: front-wall dressing hides when the camera is outside it; the ceiling, lamps and pans hide above it and during the shift
    K.frontG.visible = camera.position.z < ROOM.D / 2 - 0.3; K.ceilG.visible = camera.position.y < ROOM.H - 0.3 && S.phase !== 'shift' && S.phase !== 'glide'; lampGl.forEach(s2 => s2.visible = K.ceilG.visible);
    audioStep(dt); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.05; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onKD = e => { if (S.phase === 'walk') { if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); if (S.talk) { const d = dialog(); if (d && !d.choices) nextLine(); } else talk(); return; } if (/^Digit[1-4]$/.test(e.code) && S.talk && dialog().choices) { choose(+e.code.slice(5) - 1); return; } keys.add(e.code); if (e.code === 'Space') { e.preventDefault(); api.jump(); } return; }
    if (S.phase === 'shift' && !S.demo) { const id = stepId(); if (id === 'boil' && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); api.offHeat(); } if (id === 'temper' && e.code === 'Space') { e.preventDefault(); if (W && !W.busy) W.st.warm = true; } if (id === 'flavor' && /^Digit[1-5]$/.test(e.code)) api.pickFlavor(Object.keys(FLAVORS)[+e.code.slice(5) - 1]); if (id === 'coat' && (e.code === 'Digit1' || e.code === 'Digit2')) api.pickCoat(e.code === 'Digit1' ? 'cocoa' : 'mint'); } };
  const onKU = e => { keys.delete(e.code); if (e.code === 'Space' && stepId() === 'temper' && W && !S.demo) W.st.warm = false; }, onBlur = () => keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- HUD state for the page ----------
  function hud() { const id = stepId(), st = W && W.st, info = id && STEP[id].info ? STEP[id].info(st) : null;
    const tk = o => { const C = CANDIES[o.candy], fv = o.flav ? (FLAVORS[o.flav] || COATS[o.flav]) : null; return { id: o.id, name: o.name, candy: C.name, flav: fv ? fv.name : C.name === 'PEPPERMINT ROCK' ? 'STRIPED' : '', col: fv ? fv.col : '#e04a5a', pat: clamp(o.pat / o.patMax, 0, 1), cur: !!(W && W.o === o), arriving: o.st === 'walk' }; };
    const std = S.phase === 'walk' ? { place: 'Nebo · The Candy Shop', quest: { text: save.flag('candyUniform') ? 'THE CANDY SHOP · Talk to ANGELICA to work another shift' : 'THE CANDY SHOP · Talk to ANGELICA about the NOW HIRING card' }, prompt: S.talk ? null : S.prompt, dialog: dialog(), toast: S.toast, gold: save.data.gold, items: Object.entries(save.data.items || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n, label: id })), day: save.stat('worldDay', 1) } : null;
    return { phase: S.phase, day: S.day, gold: save.data.gold, uniform: !!save.flag('candyUniform'), served: S.served, total: S.total, lost: S.lost, earned: S.earned, tips: S.tips, stars: S.starList.length ? (S.starList.reduce((a, b) => a + b, 0) / S.starList.length).toFixed(1) : '',
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.id - b.id).map(tk), step: id ? { id, label: STEPS[id][0], title: STEPS[id][1], text: STEPS[id][2], list: W.steps.map((s, i) => ({ label: STEPS[s][0], st: i < W.i ? 'done' : i === W.i ? 'now' : 'todo' })), info, candy: W.C.name, who: W.o.name, flav: W.o.flav ? (FLAVORS[W.o.flav] || COATS[W.o.flav]).name : '', flavCol: W.o.flav ? (FLAVORS[W.o.flav] || COATS[W.o.flav]).col : '#e04a5a', busy: W.busy } : null,
      waiting: S.phase === 'shift' && !W && !S.react, flash: S.flash, say: S.say, react: S.react, done: S.done, demo: S.demo ? DEMO_CAP[id] || ['', 'A customer is coming in.'] : null, demoN: S.demo ? 'BOX ' + Math.min(S.total, S.served + 1) + ' / ' + S.total : '',
      menu: availCandies().map(k => CANDIES[k].name), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), flavors: Object.entries(FLAVORS).map(([k, f]) => ({ k, name: f.name, col: f.col })), coats: Object.entries(COATS).map(([k, c]) => ({ k, name: c.name, col: c.col })),
      walk: std, sayWalk: S.sayWalk, boxesSold: save.stat(SAVE.boxes, 0), musicOn: CA.musicOn, sfxOn: CA.sfxOn, embed: !!(embed || onExit) }; }

  // ---------- API (page buttons + the Game HUD contract) ----------
  const api = {
    leave() { sfx('bell'); const msg = { type: '8gates:leave', room: SHOP.room, to: 'neboTownSquare', gold: save.data.gold };
      if (onExit) { onExit(msg); return; } if (embed && window.parent !== window) { try { window.parent.postMessage(msg, '*'); } catch (e) {} return; }
      S.toast = 'The door opens onto NEBO TOWN SQUARE once the shop is placed in the Nebo map.'; S.toastT = 3; },
    hud, setSafe(top, bottom, left = 0) { setSafe(top, bottom, left); }, startShift: () => startShift(), endShift, toIntro, toWalk, demoStart, demoStop,
    pickFlavor(k) { if (stepId() !== 'flavor' || W.busy || W.st.pick || !FLAVORS[k]) return; audioOn(); W.st.pick = k; W.d.flav = k; if (k !== W.o.flav) { W.wrong = true; flash('THE TICKET SAYS ' + FLAVORS[W.o.flav].name, '#ec3013', 1.2); sfx('bad'); } else sfx('pop'); },
    pickCoat(k) { if (stepId() !== 'coat' || W.busy) return; const s = W.st, i = s.done.findIndex((v, j) => !v && !s.anim.some(a => a.i === j)); if (i >= 0) STEP.coat.dunk(s, i, k); },
    offHeat() { if (stepId() !== 'boil' || W.busy || !W.st.on) return; const s = W.st; s.on = false; sfx('off'); spoon.visible = false; puff(K.pot.x, K.potY + 0.4, K.pot.z, 0xffffff, 3); const [sc, note] = STEP.boil.score(s); commit('boil', sc, note); },
    warm(on) { if (stepId() === 'temper' && W && !W.busy && !S.demo) W.st.warm = !!on; },
    buyUpgrade(id) { const u = UPGRADES.find(x => x.id === id); if (!u || upg(id) || !save.spend(u.cost)) return; save.setStat(SAVE.upg + id, 1); sfx('coin'); },
    setPaused(v) { PAUSE = !!v; },
    // Game HUD contract (walk mode)
    start() {}, talk, choose, closeDialog() { S.talk = null; }, nextLine, clearToast() { S.toast = null; },
    melee() { if (S.phase !== 'walk') return; const BP = hero.userData.P; hero.userData.talking = true; setTimeout(() => hero.userData.talking = false, 900); S.toast = 'You wave. ANGELICA waves back with a wooden spoon.'; S.toastT = 2.2; angelica.userData.hop = 1; sfx('wave'); },
    range() { if (S.phase !== 'walk') return; S.toast = 'ANGELICA: "Not in here, sweetheart. Lasers melt the fudge."'; S.toastT = 2.6; },
    jump() { if (S.phase === 'walk' && hero) { hero.userData.hop = 1; sfx('hop'); } }, meleeUp() {},
    useItem(id) { S.toast = id === 'chocolates' ? 'ANGELICA: "Box of Chocolates? Save those for someone sweet."' : 'Save that for outside.'; S.toastT = 2.4; }, closeWheel() {}, skipTime() {},
    setHudPad() {}, setStick(x, y) { stick.x = x; stick.y = y; },
    eyeLook(dx, dy) { WC.yaw -= dx * 0.008; WC.pitch = clamp(WC.pitch + dy * 0.005, 0.05, 1.2); WC.dragT = 2; }, eyeRelease() {}, togglePov() { WC.pov = !WC.pov; return WC.pov; },
    lookBy(dx, dy) { WC.dragT = 2.5; WC.yaw -= dx * 0.006; WC.pitch = clamp(WC.pitch + dy * 0.0048, 0.05, 1.2); }, zoomBy(f) { WC.dist = clamp(WC.dist * f, 3, 9.5); },
    getCam() { return { dist: WC.dist, pitch: WC.pitch }; }, setCam(d, p) { if (d != null) WC.dist = clamp(d, 3, 9.5); if (p != null) WC.pitch = clamp(p, 0.05, 1.2); },
    mapData() { const hp = hero ? hero.position : V3(); return { p: [hp.x, hp.z, hero ? hero.rotation.y : 0], b: [['COUNTER', -1.6, K.counter.z], ['STOVE', K.pot.x, K.pot.z], ['SLAB', K.slab.x, K.slab.z], ['MOULDS', K.mould.x, K.mould.z], ['DOOR', K.door.x, K.door.z]], f: [[angelica.position.x, angelica.position.z], [browser.position.x, browser.position.z]], e: [], q: [angelica.position.x, angelica.position.z, 'ANGELICA'] }; },
    setMinimap() {}, toggleSound() { CA.setMuted(!CA.muted); return CA.muted; }, toggleMusic() { CA.setMusic(!CA.musicOn); sfx('click'); }, toggleSfx() { CA.setSfx(!CA.sfxOn); sfx('click'); }, click() { audioOn(); sfx('click'); }, cycleWeather() {},
    // test hooks
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _W: () => W, _K: K, _ca: CA, _orders: () => orders, _scrAt: (x, y, z) => scr(V3(x, y, z)), _size: (w = 'hero') => { const o = { hero, ben, angelica }[w]; const b = new THREE.Box3().setFromObject(o); const v = b.getSize(V3()); return [v.x, v.y, v.z, camera.position.toArray(), o.position.toArray()]; }, _scr: scr, _stepId: stepId,
    _tp(x, z, ry = Math.PI) { hero.position.set(x, 0, z); hero.rotation.y = ry; WC.yaw = ry + Math.PI; }, _view(p, l) { S.phase = 'debug'; setCastFor('walk'); camera.position.set(...p); CAM.look.set(...l); }, _press(p, kind) { if (kind === 'down') pDown(p); else if (kind === 'move') pMove(p); else pUp(p); },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); CA.destroy(); } };
  if (S.phase === 'intro') { setUniform(true); setCastFor('intro'); const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); } else setCastFor('walk');
  frame();
  return api; }
