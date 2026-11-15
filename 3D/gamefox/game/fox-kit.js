// Shared 3D fox model + face animation, used by every Meru scene.
// 12 Nov (p49) FOX FAST (MERU_LOAD_PLAN.md SESSION 10). A fox cost 23.5 ms to build (measured on Ben's PC, 36 real town foxes): merging its parts 9 ms, normals 2.8 ms, 6 raycasts onto the skull 3.3 ms.
// Three things, none of which changes what is built: (1) the merge loop writes straight into the arrays; (2) cvn(g) = three's own vertex normals, remembered by CONTENT (the bits of the positions + the index): 89 % of the calls
// repeat between foxes; (3) the skull raycasts for the cheek + hair roots are remembered by the skull's content + the ray. ?foxfast=0 or localStorage fox.fast.off = '1' = the old way. kit.fastCheck(spec) proves old = new.
const FF = { ver: 'ff1', on: !(typeof location !== 'undefined' && /[?&]foxfast=0/.test(location.search)) && !(() => { try { return localStorage.getItem('fox.fast.off') === '1'; } catch (e) { return false; } })(), nor: new Map(), ray: new Map(), hit: 0, miss: 0 };
const ffH = a => { const u = a instanceof Float32Array ? new Uint32Array(a.buffer, a.byteOffset, a.length) : a; let h1 = 0x811c9dc5 | 0, h2 = 0x9747b28c | 0; for (let i = 0; i < u.length; i++) { const v = u[i]; h1 = Math.imul(h1 ^ v, 16777619); h2 = Math.imul((h2 + v) | 0, 0x85ebca6b) ^ (h2 >>> 13); } return (h1 >>> 0).toString(36) + '.' + (h2 >>> 0).toString(36) + '.' + u.length; };
const ffPlain = p => p && p.isBufferAttribute && !p.isInterleavedBufferAttribute && p.array instanceof Float32Array && p.itemSize === 3 && !p.normalized;
const ffKey = g => ffH(g.attributes.position.array) + (g.index ? '/' + ffH(g.index.array) : '/n');
function cvn(g) { const p = g.attributes.position; if (!FF.on || !ffPlain(p) || (g.morphAttributes && g.morphAttributes.position)) return g.computeVertexNormals();
  const k = ffKey(g), c = FF.nor.get(k), n = g.attributes.normal;
  if (c && (!n || (ffPlain(n) && n.array.length === c.array.length))) { if (n) n.array.set(c.array); else g.setAttribute('normal', c.clone()); g.attributes.normal.needsUpdate = true; FF.hit++; return; }
  g.computeVertexNormals(); FF.miss++; const m = g.attributes.normal; if (!c && ffPlain(m) && FF.nor.size < 8000) FF.nor.set(k, m.clone()); }
function ffSkullHit(rc, sk0, dv) { if (!FF.on || !ffPlain(sk0.geometry.attributes.position)) { const h = rc.intersectObject(sk0)[0]; return h ? h.point : dv.clone().multiplyScalar(0.38); }
  const g = sk0.geometry, k = ffKey(g) + '|' + dv.x + ',' + dv.y + ',' + dv.z; let v = FF.ray.get(k);
  if (v === undefined) { const h = rc.intersectObject(sk0)[0]; v = h ? [h.point.x, h.point.y, h.point.z] : null; if (FF.ray.size < 20000) FF.ray.set(k, v); FF.miss++; } else { if (!g.boundingSphere) g.computeBoundingSphere(); FF.hit++; }
  return v ? dv.clone().set(v[0], v[1], v[2]) : dv.clone().multiplyScalar(0.38); }
export const LOOK_KEY = 'meru.foxLook.v1';
import { uniqueFace } from './engine/meru-faces.js?v=s717'; import { addFoxMouth3D } from './engine/fox-mouth3d.js?v=s728bu';   // s715 every keeper + towns fox gets a unique face (one table)
// s617 foxes that get elbows, knees + fingers by default (besides the player): the Meru shop keepers, so the shared shop kit can pose them
export const JOINT_KEYS = new Set(['max', 'noble', 'flora', 'cocoa', 'madameStitch', 'snipBarber', 'laceShoes', 'grannyCrust', 'bramKeeper', 'reelBait', 'bankManager', 'dotGas', 'sgtBiscuit', 'bhAce', 'mbrSizzle', 'csBoss', 'casSteward', 'drLimber', 'bean', 'sirPercy', 'mftOra', 'galleryOwner', 'galleryPainter', 'boltGas', 'birdieGolf', 'mgrPlum', 'hwTilly', 'gearsHobby', 'honeyHosp', 'fisherman', 'lnMott', 'mrPenny', 'mfEngineer', 'mamaKeys', 'quillMuseum', 'paperReporter', 'pepperProperty', 'mpoSpade', 'policeChief', 'stampsPost', 'radioDJ', 'bigTallRock', 'mrsSage', 'saltConsigliere', 'railSkate', 'tabReporter', 'tvAnchor', 'vaxSales', 'relicGarden', 'relicLakeside', 'relicSpire', 'relicDeco', 'officeLawyer', 'officeAccountant', 'officeDentist', 'barracksGuardCaptain', 'chiefEmber', 'outletSkip', 'outletPatch', 'outletOllie', 'outletBarnaby', 'outletMagpieScoop', 'barracksMasterOfArms', 'hope']);   // s662s HOPE is jointed (elbows, knees, fingers); her cane arm uses the real arm (engine/cane.js)   // s617b: every Meru shop / job keeper that goes through the shared shop kit
// FOX_SHAPE (Ben, s149 Fox Workshop): the shared head shape for every fox (snout, under the snout, ears, eyes). Colours stay per fox.
export const FOX_SHAPE = {"snoutLength":0.52,"earHeight":0.81,"earWidth":0.86,"earSpread":0.71,"earBack":0.32,"eyeSize":1.5,"eyeSpacing":72,"eyeY":80,"lashes":0,"muzzleWedge":0.31,"underDepth":1.6,"jawTuck":0.36,"muzzleLow":1.4,"throat":0,"chinLine":0.44,"underRise":0.59,"chinPatch":1.6};
export const ALL_CHIN = { chinPatch: 1.6, chin: '#fff5f5', chinPatchCol: '#ffd9ad' };   /* s672d Ben: his soft peach patch round the mouth on every fox */   // s669 Ben: Hope's chin tuft (size 1.6 + near-white) on EVERY fox (a look can opt out with keepChin: true)
export const DEFAULT_LOOK = { ...{"armorAccent":"#38bdf8","snout":"#f9a96a","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffe4c4","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.85,"headHeight":0.97,"cheeks":2,"chinPoint":1.5,"snoutLength":0.61,"snoutSize":0.77,"earHeight":0.98,"earWidth":0.75,"earSpread":0.82,"earTilt":0.52,"earBack":0.37,"fluffSize":0.86,"headTuft":0,"eyeSize":1.3,"eyeSpacing":64,"eyeY":86,"irisSize":1.08,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.28,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53}, ...FOX_SHAPE };
// s608 Ben's saved PLAYER FEMALE (Fox Workshop). NPCs built from her get no bow; the player version (PLAYER_FEMALE_HERO) wears his cyan bow.
export const PLAYER_FEMALE = {"armorAccent":"#38bdf8","snout":"#f9a96a","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffe4c4","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.85,"headHeight":0.97,"cheeks":2,"chinPoint":1.5,"snoutLength":0.61,"snoutSize":0.77,"earHeight":0.98,"earWidth":0.75,"earSpread":0.87,"earTilt":0.52,"earBack":0.37,"fluffSize":0.86,"headTuft":0,"eyeSize":1.3,"eyeSpacing":64,"eyeY":86,"irisSize":1.08,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.28,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53,"muzzleWedge":0.31,"underDepth":1.6,"jawTuck":0.36,"muzzleLow":1.4,"throat":0,"chinLine":0.44,"underRise":0.59,"chinPatch":1.6};
export const PLAYER_FEMALE_HERO = { ...PLAYER_FEMALE, ...{"hairBow":"bow","bowCol":"#40d0ff","bowCol2":"#be185d","bowSize":0.74} };
export const PLAYER_MALE = { ...{"armorAccent":"#38bdf8","snout":"#f3b26b","fur":"#f2741f","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffe4c4","leg":"#e2e8f0","boot":"#0f172a","paw":"#f2741f","nose":"#0b0a12","tailBase":"#d9560f","tailMid":"#f2741f","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.95,"headHeight":0.97,"cheeks":1.57,"chinPoint":1.01,"snoutLength":0.61,"snoutSize":0.85,"earHeight":0.98,"earWidth":1.5,"earSpread":0.82,"earTilt":0.52,"earBack":1,"fluffSize":1.8,"headTuft":1.14,"eyeSize":1.3,"eyeSpacing":64,"eyeY":86,"irisSize":1.08,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.28,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53}, ...FOX_SHAPE };   // same orange as Hope
// Hope: a bright orange fox, cream-white muzzle and chin, black ears, orange paws, white tail tip
const HOPE_SAVED = (() => { try { return JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('hope.look.v1')) || 'null') || {}; } catch (e) { return {}; } })();   // s668 Fox Workshop → HOPE → SAVE
export const HOPE_LOOK_BASE = { ...PLAYER_FEMALE, fur: '#f2741f', furDark: '#c2410c', snout: '#f6d2ad', muzzle: '#f7c896', chin: '#ffffff', fluff: '#ffffff', ear: '#1c1917', earInner: '#3f2a22', paw: '#f2741f', tailBase: '#d9560f', tailMid: '#f2741f', tailTip: '#ffffff', ink: '#1c1917' };
export const HOPE_LOOK = { ...HOPE_LOOK_BASE, ...HOPE_SAVED };
export const KING_MIGHT = { ...PLAYER_MALE, elder: 1, fur: '#d9733a', paw: '#d9733a' /* s717 hands = fur */, furDark: '#9a4a22', muzzle: '#f1c9a6', snout: '#e8b48a', chin: '#f4f1ec', fluff: '#f4f4f6', tailMid: '#e8945a', tailTip: '#ffffff', browColor: '#f8fafc', browWeight: 10, beard: '#eef0f4', eyeSize: 1.05, irisSize: 0.9, eyeY: 96, headTuft: 0.6, fluffSize: 1.9, cheeks: 1.7, chinPoint: 0.8, headWidth: 1.0, earBack: 0.6, blush: 0, armorAccent: '#c42d3c', bodyScale: 1.08 };
// s662 WEAPON LOOK: a scratched-metal wear map (seeded, so every fox's sword wears the same), a fresnel RIM LIGHT on toon metal, and an additive
// white EDGE material (additive, so the back-sheath copy hides it like the blade halo). Returns clones; the fox's own gold / navy stay untouched.
export function wearTex(THREE) { if (wearTex.t) return wearTex.t; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); let s = 8;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647; x.fillStyle = '#e9e9e9'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.18)'; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
  x.lineCap = 'round'; for (let i = 0; i < 70; i++) { const px = r() * 256, py = r() * 256, a = r() * Math.PI, L = 6 + r() * 26, dark = r() < 0.55;
    x.strokeStyle = dark ? `rgba(20,16,10,${0.16 + r() * 0.2})` : `rgba(255,255,255,${0.35 + r() * 0.4})`; x.lineWidth = dark ? 1.4 : 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L * 0.4); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return (wearTex.t = t); }
export function rimLit(m, col = '#ffffff', k = 0.7, p = 2.6) { const c = new m.constructor().color.set(col); m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
  `{ float fr = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), ${p.toFixed(2)}); gl_FragColor.rgb += vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)}) * fr * ${k.toFixed(2)}; }\n#include <dithering_fragment>`); };
  m.customProgramCacheKey = () => 'rim' + col + k + p; return m; }
export function weaponLook(THREE, gold, navy) { const W = wearTex(THREE);
  const g = rimLit(gold.clone(), '#fff1c4', 0.75, 2.4); g.map = W; const n = rimLit(navy.clone(), '#7fb8ff', 0.35, 3); n.map = W;
  const steel = rimLit(new THREE.MeshToonMaterial({ color: '#c9d1d9', gradientMap: gold.gradientMap, map: W }), '#ffffff', 0.8, 2.2);
  const edge = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  return { gold: g, navy: n, steel, edge, wear: W }; }
export const HERO_BUILD = { legs: 1.85 / 1.5, torso: 1.22, head: 0.92, neck: -0.029 };   // s662z10 Ben: a slightly shorter neck   // s662z4 Ben: the opposite: head settles DOWN onto the collar   // s662u Ben's TALL HERO (Fox Proportions Lab D)
export function loadLook() { try { return { ...DEFAULT_LOOK, ...JSON.parse(localStorage.getItem(LOOK_KEY) || '{}') }; } catch (e) { return { ...DEFAULT_LOOK }; } }
export function foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: MERGE_DEFAULT = false }) {
  // ---------- foxes ----------
  const crestTexes = { '8': crestTex('8', '#38bdf8'), U: crestTex('U', '#eab308'), L: crestTex('L', '#eab308'), J: crestTex('J', '#1e3a8a', '#ffffff', '#1e3a8a'), G: crestTex('G', '#38bdf8'), M: crestTex('M', '#e6b45a', '#151b3d') };
  const crestStyle = { X: ['#ec3013', '#140808', '#ec3013'], '8': ['#ffffff', '#0b1430', '#ffffff'],   /* s776i X = the BANDITS' mark */ U: ['#eab308', '#2a1606', '#fff3c4'], L: ['#eab308', '#2a0a0a', '#fff3c4'], J: ['#1e3a8a', '#ffffff', '#1e3a8a'], G: ['#38bdf8', '#120d2a', '#ffffff'], M: ['#ffffff', '#0b1430', '#ffffff'], S: ['#9cc4e4', '#13233a', '#e8f6ff'] };
  const crestCache = {};
  function armorCrest(letter) {
    if (crestCache[letter]) return crestCache[letter];
    const [ring, bg, fg] = crestStyle[letter] || crestStyle['8'];
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#38bdf8'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#0e7fb8'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
    g.fillStyle = '#7dd3fc'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
    g.fillStyle = ring; g.beginPath(); g.arc(128, 128, 106, 0, 7); g.fill();
    g.fillStyle = bg; g.beginPath(); g.arc(128, 128, 90, 0, 7); g.fill();
    g.strokeStyle = ring; g.globalAlpha = 0.35; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 80, 0, 7); g.stroke(); g.globalAlpha = 1;
    if (letter === '8') {
      g.lineCap = 'round'; g.lineJoin = 'round';
      const eight = () => { g.beginPath(); g.ellipse(128, 92, 30, 28, 0, 0, 7); g.moveTo(128 + 36, 166); g.ellipse(128, 166, 36, 32, 0, 0, 7); };
      g.strokeStyle = '#7dd3fc'; g.lineWidth = 25; eight(); g.stroke();
      g.strokeStyle = fg; g.lineWidth = 18; eight(); g.stroke();
      g.fillStyle = '#05070f'; g.beginPath(); g.ellipse(128, 92, 19, 17, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(128, 166, 24, 21, 0, 0, 7); g.fill();
    } else {
      const thin = letter === 'S';   /* s683c Ben: Shasta's S is THIN so it never reads as the player's 8 */
      g.font = (thin ? '300 150px' : '900 168px') + ' "Archivo", "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = thin ? 5 : 12; g.strokeStyle = ring; g.strokeText(letter, 128, 140); g.fillStyle = fg; g.fillText(letter, 128, 140);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; crestCache[letter] = t; return t;
  }
  // brow (inner, outer) lift, upper-lid drop, iris scale, resting mouth
  const MOOD = {
    neutral: { bi: 0, bo: 0, lid: 0, iris: 1, mouth: 'w' }, happy: { bi: -4, bo: -2, lid: 0, iris: 1, mouth: 'smile' },
    excited: { bi: -8, bo: -6, lid: 0, iris: 1, mouth: 'grin', closed: true }, surprised: { bi: -12, bo: -10, lid: -0.15, iris: 0.68, mouth: 'o' },
    sad: { bi: -9, bo: 4, lid: 0.32, iris: 1, mouth: 'frown' }, stern: { bi: 9, bo: -2, lid: 0.28, iris: 0.95, mouth: 'flat' },
    smug: { bi: 4, bo: -2, lid: 0.38, iris: 1, mouth: 'smirk', browR: -9 }, determined: { bi: 7, bo: -1, lid: 0.18, iris: 1, mouth: 'flat' },
    warm: { bi: -3, bo: 0, lid: 0.16, iris: 1, mouth: 'smile' }, curious: { bi: -2, bo: 0, lid: 0, iris: 1, mouth: 'o', browL: -9 },
    shock: { bi: -15, bo: -13, lid: -0.28, iris: 0.52, mouth: 'o' }, sleepy: { bi: -3, bo: 3, lid: 0.62, iris: 1, mouth: 'w' },
    wink: { bi: -4, bo: -3, lid: 0, iris: 1, mouth: 'smirk', wink: true, browR: -6 }, squint: { bi: 10, bo: 5, lid: 0.55, iris: 0.9, mouth: 'frown' },
    joy: { bi: -8, bo: -6, lid: 0, iris: 1, mouth: 'grin', closed: true, blush: 0.55 }, shy: { bi: -7, bo: 3, lid: 0.3, iris: 1, mouth: 'smile', blush: 0.75 }, proud: { bi: 2, bo: -4, lid: 0.3, iris: 1, mouth: 'smirk' },
    nervous: { bi: -9, bo: 5, lid: -0.05, iris: 0.8, mouth: 'w', blush: 0.3 }, confused: { bi: 2, bo: 0, lid: 0.1, iris: 0.95, mouth: 'smirk', browL: -10, browR: 7 }, disgust: { bi: 10, bo: -3, lid: 0.45, iris: 0.95, mouth: 'frown', browR: -5 },
    bored: { bi: 0, bo: 3, lid: 0.55, iris: 1, mouth: 'flat' }, love: { bi: -6, bo: -2, lid: 0.25, iris: 1.12, mouth: 'smile', blush: 0.8 },   // s609y
    relieved: { bi: -6, bo: 4, lid: 0.35, iris: 1, mouth: 'smile' }, embarrassed: { bi: -8, bo: 4, lid: 0.2, iris: 0.9, mouth: 'w', blush: 0.95 }, mischief: { bi: 8, bo: -6, lid: 0.32, iris: 0.95, mouth: 'smirk', browR: -8 },
    frustrated: { bi: 11, bo: -1, lid: 0.3, iris: 0.92, mouth: 'flat' }, amazed: { bi: -12, bo: -10, lid: -0.2, iris: 1.15, mouth: 'o' }, guilty: { bi: -8, bo: 5, lid: 0.3, iris: 0.92, mouth: 'frown', blush: 0.25 },
    brave: { bi: 6, bo: -3, lid: 0.12, iris: 1, mouth: 'flat' }, hopeful: { bi: -9, bo: -2, lid: 0, iris: 1.1, mouth: 'smile' }, grumpy: { bi: 12, bo: 2, lid: 0.42, iris: 0.95, mouth: 'frown' }, sly: { bi: 5, bo: -4, lid: 0.45, iris: 0.9, mouth: 'smirk', browL: -6 },   // s609z   // s609 new faces
  };
  const moodOf = (text, base, isPlayer) => {
    if (/^Shh|Lower your voice/.test(text)) return 'surprised';
    if (/\.\.\.|graves|die |eats .* alive|rotting|ghost/.test(text)) return isPlayer ? 'curious' : 'sad';
    if (/!/.test(text)) return isPlayer ? 'happy' : 'excited';
    if (/\?$/.test(text)) return 'curious';
    return base;
  };
  const SUN = { w: 33, h: 27 };
  // s609q MOUTH SYSTEM (Ben: "polish the mouth for speaking + expression, lip-sync"). One parametric mouth (u.mp, eased every frame):
  //   open (jaw) · wide · round (pucker) · smile (-1 frown .. 1 grin) · smirk (one corner) · teeth / lteeth (upper / lower teeth + fox canines)
  //   · tongue (raised) · bite (upper teeth on the lower lip) · press (lips pressed) · fw (the fox "w" of a closed mouth)
  // EXPRESSION = MOUTH_MOOD[mood] · SPEECH = a viseme timeline built from the line's letters (digraphs th / sh / ch / oo / ee / ou / ph,
  // vowels longer, consonants short, a quick close between words, pauses at , . ! ?), each viseme eased into the next (co-articulation)
  // and laid over the mood (a happy fox talks smiling, a sad one with the corners down).
  const MP0 = { open: 0, wide: 0.5, round: 0, smile: 0, smirk: 0, teeth: 0, lteeth: 0, tongue: 0, bite: 0, press: 0, fw: 0 };
  const MOUTH_MOOD = { neutral: { smile: 0.08, fw: 1 }, happy: { smile: 0.7, wide: 0.6 }, excited: { smile: 0.95, open: 0.5, teeth: 0.75, wide: 0.78, tongue: 0.25 },
    surprised: { open: 0.38, round: 0.8, wide: 0.3, teeth: 0.2 }, sad: { smile: -0.7, wide: 0.42 }, stern: { smile: -0.3, wide: 0.55, press: 0.6 }, smug: { smile: 0.4, smirk: 1, wide: 0.5 },
    determined: { smile: -0.1, press: 0.45, wide: 0.55 }, warm: { smile: 0.45, wide: 0.55 }, curious: { open: 0.12, round: 0.75, wide: 0.28 }, shock: { open: 0.78, round: 0.5, wide: 0.42, teeth: 0.35, lteeth: 0.35 },
    sleepy: { smile: 0, fw: 1, wide: 0.42 }, wink: { smile: 0.5, smirk: 0.9, wide: 0.55 }, squint: { smile: -0.55, press: 0.7, wide: 0.5 },
    joy: { smile: 1, open: 0.35, teeth: 0.9, lteeth: 0.4, wide: 0.82 }, shy: { smile: 0.35, wide: 0.38, press: 0.3 }, proud: { smile: 0.55, smirk: 0.5, wide: 0.6 }, nervous: { smile: -0.15, open: 0.06, teeth: 0.6, wide: 0.62 },
    confused: { smile: -0.2, smirk: 0.8, wide: 0.45 }, disgust: { smile: -0.8, open: 0.14, teeth: 0.7, lteeth: 0.5, wide: 0.6, smirk: 0.4, tongue: 0.2 }, bored: { smile: -0.15, wide: 0.5, press: 0.3 }, love: { smile: 0.6, wide: 0.5 },
    relieved: { smile: 0.5, open: 0.1, wide: 0.55 }, embarrassed: { smile: 0.15, open: 0.06, teeth: 0.75, wide: 0.7 }, mischief: { smile: 0.75, smirk: 1, teeth: 0.7, open: 0.07, wide: 0.6 }, frustrated: { smile: -0.5, press: 0.9, wide: 0.55 },
    amazed: { open: 0.6, round: 0.85, wide: 0.4, teeth: 0.3 }, guilty: { smile: -0.4, wide: 0.4, press: 0.4 }, brave: { smile: 0.1, press: 0.6, wide: 0.6 }, hopeful: { smile: 0.4, open: 0.08, wide: 0.5 }, grumpy: { smile: -0.75, press: 0.7, wide: 0.5 }, sly: { smile: 0.45, smirk: 1, wide: 0.5 } };
  const VIS = { rest: { open: 0.02 }, gap: { open: 0.1 }, MBP: { open: 0, press: 1 }, AI: { open: 0.85, wide: 0.7, teeth: 0.55, lteeth: 0.25 }, E: { open: 0.42, wide: 0.95, teeth: 0.95, lteeth: 0.6, smile: 0.22 },
    O: { open: 0.7, round: 0.78, wide: 0.45, teeth: 0.15 }, U: { open: 0.3, round: 1, wide: 0.22 }, FV: { open: 0.16, bite: 1, teeth: 1, wide: 0.6 }, L: { open: 0.5, tongue: 1, teeth: 0.6, wide: 0.62 },
    TH: { open: 0.24, tongue: 0.8, teeth: 0.85, wide: 0.6 }, C: { open: 0.2, teeth: 0.85, lteeth: 0.75, wide: 0.68 }, SH: { open: 0.22, teeth: 0.8, lteeth: 0.6, round: 0.45, wide: 0.45 }, H: { open: 0.38, wide: 0.55, teeth: 0.3 } };
  const V1 = { a: 'AI', i: 'AI', e: 'E', y: 'E', o: 'O', u: 'U', w: 'U', q: 'U', m: 'MBP', b: 'MBP', p: 'MBP', f: 'FV', v: 'FV', l: 'L', h: 'H', r: 'SH', j: 'SH' };
  const V2 = { th: 'TH', sh: 'SH', ch: 'SH', oo: 'U', ee: 'E', ou: 'O', ow: 'O', ph: 'FV', qu: 'U', ck: 'C', ng: 'C', wh: 'U' };
  const BABBLE = ['AI', 'C', 'E', 'MBP', 'O', 'L', 'AI', 'gap', 'U', 'E', 'C', 'AI', 'FV', 'O', 'gap'];
  function visemeTimeline(text) { const s = String(text).toLowerCase(), out = [], U = 1 / 13; let t = 0;
    const push = (v, d, ci) => { out.push({ t0: t, d, v, ci }); t += d; };
    for (let i = 0; i < s.length; i++) { const c = s[i], two = c + (s[i + 1] || ''), isL = ch => /[a-z]/.test(ch || '');
      if (isL(c)) { if (V2[two]) { push(V2[two], U * 1.6, i + 1); i++; continue; } const vow = /[aeiouy]/.test(c), silentE = c === 'e' && !isL(s[i + 1]) && isL(s[i - 1]) && isL(s[i - 2]);
        push(silentE ? (out.length ? out[out.length - 1].v : 'rest') : V1[c] || 'C', silentE ? U * 0.45 : vow ? U * 1.3 : U * 0.85, i); }
      else if (c === ' ') push('gap', U * 0.55, i); else if (/[,;:]/.test(c)) push('rest', 0.22, i); else if (/[.!?…]/.test(c)) push('rest', 0.3, i); else push(out.length ? out[out.length - 1].v : 'rest', U * 0.3, i); }
    return out; }
  // closed fist paw (learned on the humans): rounded palm, a row of 4 knuckle pads, curled finger row under it, thumb wrapped across the front
  // s609 HANDS: the jointed player gets an ARTICULATED paw instead of the solid fist: a palm, 4 fingers (2 bones each, 1 on phones) and a
  // thumb, all on pivots. u.grip = [left, right] 0 open .. 1 fist, u.point = [l, r] keeps the index finger out. animFox curls them every frame.
  let HANDS = false;
  // HAND ANATOMY (s609e, Ben's deep dive). Hand frame: fingers hang along -y, the palm faces -z, the THUMB sits on the -sd side
  // (index next to it, pinky on the +sd side). g = the WRIST pivot (top of the palm, Euler order YXZ: y = forearm twist, x = wrist flex,
  // z = side bend). Fingers: middle longest, pinky shortest, knuckles on a gentle arc. Thumb = 2 bones on the palm side near the wrist.
  function pawHand(p, L0) { const L = L0 || p.userData.L || DEFAULT_LOOK, pm = toon(L.paw), pad = toon(L.pad || '#3a2a26'), sd = p.position.x >= 0 ? 1 : -1;
    const g = new THREE.Group(); g.position.set(0, -0.31, 0.01); g.rotation.order = 'YXZ'; p.add(g); const hg = new THREE.Group(); hg.position.y = -0.092; g.add(hg);
    M(new THREE.CapsuleGeometry(0.056, 0.06, 4, 10), pm, 0, 0.02, 0, g, 0.01);   // WRIST: a slim stub that stays inside the cuff when the wrist bends (s609f)
    const palm = M(new THREE.SphereGeometry(0.084, 14, 10), pm, 0, 0.0, -0.005, hg, 0.018, 0.085); palm.scale.set(1.08, 1.0, 0.78);
    M(new THREE.SphereGeometry(0.03, 10, 8), pad, sd * 0.008, -0.012, -0.058, hg, 0).scale.set(1.3, 1, 0.45);   // palm pad
    M(new THREE.SphereGeometry(0.026, 10, 8), pad, -sd * 0.04, 0.025, -0.05, hg, 0).scale.set(1, 1.3, 0.45);    // thumb-base pad
    const two = !FOX_PHONE, fingers = [], LEN = [[0.038, 0.028], [0.044, 0.032], [0.04, 0.029], [0.032, 0.024]], RAD = [0.023, 0.024, 0.0225, 0.02], ARC = [-0.056, -0.06, -0.057, -0.05];
    for (let k = 0; k < 4; k++) { const x = -sd * (1.5 - k) * 0.037, a = new THREE.Group(); a.position.set(x, ARC[k], 0.01); hg.add(a); const r = RAD[k], [la, lb] = LEN[k];
      M(new THREE.CapsuleGeometry(r, two ? la : la + lb, 4, 8), pm, 0, two ? -la / 2 - r * 0.4 : -(la + lb) / 2 - r * 0.4, 0, a, 0.008);
      let b = null; if (two) { b = new THREE.Group(); b.position.set(0, -la - r * 0.6, 0); a.add(b); M(new THREE.CapsuleGeometry(r * 0.93, lb, 4, 8), pm, 0, -lb / 2 - r * 0.3, 0, b, 0.007); M(new THREE.SphereGeometry(r * 0.62, 8, 6), pad, 0, -lb - r * 0.3, -r * 0.62, b, 0); M(new THREE.ConeGeometry(r * 0.42, r * 1.1, 6), pad, 0, -lb - r * 0.95, r * 0.35, b, 0).rotation.x = -0.35; }   // + a little claw
      fingers.push({ a, b, k }); }
    const th = new THREE.Group(); th.position.set(-sd * 0.058, 0.0, -0.012); hg.add(th); M(new THREE.CapsuleGeometry(0.026, 0.034, 4, 8), pm, 0, -0.03, 0, th, 0.008);
    const th2 = new THREE.Group(); th2.position.y = -0.058; th.add(th2); M(new THREE.CapsuleGeometry(0.023, 0.026, 4, 8), pm, 0, -0.024, 0, th2, 0.007); M(new THREE.SphereGeometry(0.015, 8, 6), pad, 0, -0.034, -0.012, th2, 0);
    p.userData.hand = { g, hg, fingers, th, th2, sd, grip: 0.3, pt: 0, tu: 0, op: 0, fw: 0, wx: 0, wz: 0, ext: 0, ph: Math.random() * 6 }; hg.position.y = -0.052; return g; }
  // GAUNTLET STAYS SOLID (s609f, Ben): the wrist pivot sits on the RIM of the lowest cuff on the forearm (sleeve, plate, armour gauntlet,
  // EVA glove), so the palm always hangs below it and only the slim wrist stub tucks inside. Re-measured whenever the forearm's parts change.
  const _bb = new THREE.Box3(), _mi = new THREE.Matrix4();
  function fitCuff(H, fore, P) { if (!fore) return; fore.updateMatrixWorld(true); _mi.copy(fore.matrixWorld).invert(); let lo = 0;
    fore.traverse(o => { if (!o.isMesh || !o.visible || o.material === outlineMat || (o.material && o.material.side === THREE.BackSide)) return; for (let a = o; a && a !== fore; a = a.parent) if (a === H.g || a === P.sword || a === P.gun || (a.userData && a.userData.notCuff)) return;
      const ty = o.geometry.type, gp = o.geometry.parameters || {}; if (o.name !== 'merged') { if (!/Cylinder|Capsule|Lathe|Sphere/.test(ty)) return; const r = gp.radius || Math.max(gp.radiusTop || 0, gp.radiusBottom || 0); if (r && r < 0.06) return; }
      o.geometry.computeBoundingBox(); _bb.copy(o.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(_mi, o.matrixWorld)); if (_bb.max.y - _bb.min.y > 0.02) lo = Math.min(lo, _bb.min.y); });
    H.cuffY = lo; H.g.position.y = lo + 0.018; H.cuffN = H.fcount; }
  function pawFist(p, L0) { if (HANDS) return pawHand(p, L0); const L = L0 || p.userData.L || DEFAULT_LOOK, pm = toon(L.paw), sd = p.position.x >= 0 ? 1 : -1, g = new THREE.Group(); g.position.set(0, -0.4, 0.01); p.add(g);
    const palm = M(new THREE.SphereGeometry(0.088, 14, 10), pm, 0, 0.005, -0.01, g, 0.02, 0.09); palm.scale.set(1.05, 1.05, 0.95);
    for (let k = 0; k < 4; k++) { const x = (k - 1.5) * 0.04; M(new THREE.SphereGeometry(0.028, 10, 8), pm, x, -0.025, 0.066, g, 0.008, 0.028).scale.set(1, 0.95, 1.05); M(new THREE.SphereGeometry(0.024, 8, 6), pm, x * 0.95, -0.065, 0.045, g, 0.006, 0.024); }
    const th = M(new THREE.CapsuleGeometry(0.024, 0.05, 4, 8), pm, -sd * 0.05, -0.01, 0.07, g, 0.007); th.rotation.set(0.2, 0, sd * 1.25);
    return g; }
  function drawFace(g, f) {
    const W = 256; g.clearRect(0, 0, W, W);
    const md = { ...(MOOD[f.mood] || MOOD.neutral), ...(f.fm || {}) }, L = f.L || DEFAULT_LOOK, ES = L.eyeSize, EX = L.eyeSpacing, EY = L.eyeY, INK = L.ink;
    // muzzle + chin
    const jd = (f.mouth || 0) * 32; g.fillStyle = L.muzzle; g.beginPath(); g.ellipse(128, 176 - jd * 0.15, 66 + jd * 0.45, 46 + jd * 0.55, 0, 0, 7); g.fill(); { const ml = L.muzzleLow ?? 1; g.beginPath(); g.ellipse(128, 200 + jd * 0.3, (60 + jd * 0.4) * ml, (30 + jd * 0.3) * ml, 0, 0, 7); g.fill(); } { const tg2 = g.createRadialGradient(128, 150 - jd * 0.4, 4, 128, 160 - jd * 0.3, 52); tg2.addColorStop(0, L.snout || L.muzzle); tg2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg2; g.globalAlpha = 0.55 + jd * 0.01; g.beginPath(); g.ellipse(128, 156 - jd * 0.4, 46, 26, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    { const cp = L.chinPatch ?? 1; g.fillStyle = L.chinPatchCol || L.chin;   /* s672c the pale patch round the mouth has its own colour */ g.beginPath(); g.ellipse(128, 222 + jd - (cp - 1) * 10, (42 + jd * 0.2) * cp, (24 + jd * 0.25) * cp, 0, 0, 7); g.fill(); }
    { const mc = L.muzzle; g.save(); g.strokeStyle = mc; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const a = Math.PI * (0.05 + i / 25 * 0.9), ex = 128 + Math.cos(a) * 64 * (1 + jd * 0.006), ey = 176 - jd * 0.15 + Math.sin(a) * 44 - 44 * 0.15; if (Math.sin(a) > 0.5) continue; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * 6, ey - Math.abs(Math.sin(a)) * 5 - 2); g.stroke(); } g.restore(); }
    { const ct = f.m3d ? 0 : (L.chinTuft ?? 1); if (ct > 0.02) {   /* s728bh the 3D jaw replaces the painted chin tuft (it read as teeth under the chin) */ g.save(); g.fillStyle = L.chinTuftCol || L.chin;   /* s672 own chin-tuft colour */ for (const [dx, dy, rz] of [[-10, 0, 0.3], [0, 4, 0], [10, 0, -0.3]]) { g.beginPath(); g.ellipse(128 + dx * Math.min(1.6, 0.6 + 0.4 * ct), 240 + jd + dy + 4 * ct, 5 * Math.min(1.5, 0.5 + 0.5 * ct), 9 * ct, rz, 0, 7); g.fill(); } g.restore(); } }
    if (L.elder) { g.fillStyle = 'rgba(235,235,240,0.55)'; for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI, r = 58 + (i % 3) * 6; g.beginPath(); g.ellipse(128 + Math.cos(a) * r * 0.9, 178 + Math.sin(a) * r * 0.55, 6, 3, a, 0, 7); g.fill(); } }
    const BLU = Math.max(L.blush, md.blush || 0); const cl = -(f.mouth || 0) * 8; for (const x of [128 - EX - 4, 128 + EX + 4]) { const bg2 = g.createRadialGradient(x, 150 + cl, 2, x, 150 + cl, 22); bg2.addColorStop(0, `rgba(244,114,182,${BLU})`); bg2.addColorStop(1, 'rgba(244,114,182,0)'); g.fillStyle = bg2; g.beginPath(); g.ellipse(x, 150 + cl, 22, 12, 0, 0, 7); g.fill(); if (BLU > 0.15) { g.save(); g.strokeStyle = `rgba(219,39,119,${BLU * 1.2})`; g.lineWidth = 2; g.lineCap = 'round'; for (let q = 0; q < 3; q++) { g.beginPath(); g.moveTo(x - 8 + q * 7, 146 + cl); g.lineTo(x - 11 + q * 7, 153 + cl); g.stroke(); } g.restore(); } }
    if ((f.mouth || 0) > 0.08) { const sh = g.createLinearGradient(0, 190, 0, 214); sh.addColorStop(0, 'rgba(120,53,15,0)'); sh.addColorStop(1, `rgba(120,53,15,${0.25 * f.mouth})`); g.fillStyle = sh; g.beginPath(); g.ellipse(128, 204, 44, 14, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(30,41,59,0.45)'; g.lineWidth = 2; g.lineCap = 'round';
    if (L.whiskers > 0.5) for (const s of [-1, 1]) for (const dy of [0, 9]) { g.beginPath(); g.moveTo(128 + s * 56, 170 + dy + cl * 0.5); g.lineTo(128 + s * 84, 164 + dy * 1.5 + cl); g.stroke(); }
    { const bx = 128, by2 = EY - 4 * ES, tg3 = g.createRadialGradient(bx, by2, 1, bx, by2, 16 * ES), c3 = new THREE.Color(L.snout || L.muzzle), rgb = 'rgba(' + Math.round(c3.r * 255) + ',' + Math.round(c3.g * 255) + ',' + Math.round(c3.b * 255) + ','; tg3.addColorStop(0, rgb + '0.95)'); tg3.addColorStop(0.6, rgb + '0.6)'); tg3.addColorStop(1, rgb + '0)'); g.fillStyle = tg3; g.beginPath(); g.ellipse(bx, by2, 13 * ES, 17 * ES, 0, 0, 7); g.fill(); }
    // eye area: soft darker socket, light brow fur, a few fur flicks at the outer corners
    for (const side of [-1, 1]) { const cx = 128 + side * EX, cy = EY; g.save(); const sg = g.createRadialGradient(cx, cy + 2, 18 * ES, cx, cy, 40 * ES); sg.addColorStop(0, 'rgba(150,60,20,0.12)'); sg.addColorStop(1, 'rgba(120,40,10,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(cx, cy, 40 * ES, 34 * ES, 0, 0, 7); g.fill();
      const lg = g.createRadialGradient(cx - side * 4, cy - 30 * ES, 2, cx, cy - 26 * ES, 26 * ES); lg.addColorStop(0, 'rgba(255,214,170,0.55)'); lg.addColorStop(1, 'rgba(255,214,170,0)'); g.fillStyle = lg; g.beginPath(); g.ellipse(cx, cy - 26 * ES, 28 * ES, 12 * ES, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(160,60,15,0.55)'; g.lineWidth = 2.2; g.lineCap = 'round'; for (let q = 0; q < 3; q++) { const a0 = -0.35 + q * 0.32, x0 = cx + side * 25 * ES * Math.cos(a0), y0 = cy + 2 + 22 * ES * Math.sin(a0); g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + side * 7 * ES, y0 - 1, x0 + side * 11 * ES, y0 - 4 + q * 2); g.stroke(); }
      g.restore(); }
    // eyes
    const eye = (cx, cy, side, col) => {
      g.save(); g.translate(cx, cy); g.rotate(-side * L.eyeTilt); g.translate(-cx, -cy); const hw = 25 * ES, hh = 24 * ES, open = Math.max(0, (1 - f.blink) * (1 - Math.max(0, md.lid + Math.max(0, (f.mouth || 0) - 0.5) * 0.35)));
      g.lineCap = 'round'; g.lineJoin = 'round';
      if (md.closed || open < 0.14 || (md.wink && side > 0)) {
        g.strokeStyle = '#1e293b'; g.lineWidth = 6; g.beginPath();
        if (md.closed || (md.wink && side > 0)) { g.moveTo(cx - hw, cy + 6); g.quadraticCurveTo(cx, cy - 18, cx + hw, cy + 6); }
        else { g.moveTo(cx - hw, cy + 2); g.quadraticCurveTo(cx, cy + 10, cx + hw, cy + 2); g.moveTo(cx + side * hw, cy + 2); g.lineTo(cx + side * (hw + 7), cy - 4); }
        g.stroke(); g.restore(); return;
      }
      const ry = hh * open * (1 - Math.min(0, md.lid)), top = cy + hh - ry * 2 + (hh - ry) * -0.0, ccy = cy + (hh - ry) * 0.55;
      g.save(); g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.clip();
      const ir = 17 * ES * L.irisSize * md.iris, ix = cx + f.look * 8 * ES, iy = ccy + 3 + (f.lookY || 0) * 7 * ES;
      const gr = g.createRadialGradient(ix, iy + ir * 0.35, ir * 0.1, ix, iy, ir); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, col); gr.addColorStop(0.8, col); gr.addColorStop(1, '#0f2a2a');
      g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
      g.fillStyle = 'rgba(12,18,30,0.5)'; g.beginPath(); g.ellipse(ix, iy - ir * 0.45, ir, ir * 0.6, 0, Math.PI, 0); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 1.4; for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2; g.beginPath(); g.moveTo(ix + Math.cos(a) * ir * 0.35, iy + Math.sin(a) * ir * 0.35); g.lineTo(ix + Math.cos(a) * ir * 0.8, iy + Math.sin(a) * ir * 0.8); g.stroke(); }
      g.strokeStyle = '#0b1430'; g.lineWidth = 2.5; g.beginPath(); g.arc(ix, iy, ir - 1, 0, 7); g.stroke();
      g.fillStyle = '#0b0a12'; g.beginPath(); g.ellipse(ix, iy + 1, 4.5 * md.iris * L.pupil * ES, 10 * md.iris * L.pupil * ES, 0, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ix - 6 * ES, iy - 7 * ES, 7.5 * ES, 6 * ES, -0.4, 0, 7); g.fill(); g.beginPath(); g.arc(ix - 1 * ES, iy - 11 * ES, 1.8 * ES, 0, 7); g.fill(); { const sx2 = ix + 7 * ES, sy2 = iy - 8 * ES, k = 3.2 * ES; g.beginPath(); g.moveTo(sx2, sy2 - k); g.lineTo(sx2 + k * 0.28, sy2); g.lineTo(sx2, sy2 + k); g.lineTo(sx2 - k * 0.28, sy2); g.closePath(); g.moveTo(sx2 - k, sy2); g.lineTo(sx2, sy2 + k * 0.28); g.lineTo(sx2 + k, sy2); g.lineTo(sx2, sy2 - k * 0.28); g.closePath(); g.fill(); } g.beginPath(); g.arc(ix + 6 * ES, iy + 6 * ES, 2.6 * ES, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(ix, iy + ir * 0.7, ir * 0.55, ir * 0.14, 0, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); g.lineWidth = 7.5; g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, side > 0 ? Math.PI * 1.3 : Math.PI * 1.08, side > 0 ? Math.PI * 1.92 : Math.PI * 1.7); g.stroke();
      if (L.lashes > 0.5) { g.lineWidth = 4.5; for (const [k0, k1] of [[0.35, 0.8], [0.62, 1.05]]) { g.beginPath(); g.moveTo(cx + side * hw * (1 - k0 * 0.15), ccy - ry * k0); g.quadraticCurveTo(cx + side * (hw + 6), ccy - ry * k1, cx + side * (hw + 10), ccy - ry * k1 - 6); g.stroke(); } }
      g.lineWidth = 2.2; g.strokeStyle = 'rgba(30,41,59,0.6)'; g.beginPath(); g.ellipse(cx, ccy, hw * 0.92, ry, 0, Math.PI * 0.18, Math.PI * 0.82); g.stroke(); g.restore();
    };
    eye(128 - EX, EY, -1, f.eyeL); eye(128 + EX, EY, 1, f.eyeR);
    if (L.scar) {   // FACIAL SCAR (s149, Lox): a pale slash from brow to cheek through the eye that is not patched, with stitch ticks
      const sx = L.eyePatch === 'R' ? -1 : 1, cx = 128 + sx * EX, x0 = cx - sx * 4, y0 = EY - 46 * ES, x1 = cx + sx * 16, y1 = EY + 52 * ES;
      const gap = 30 * ES, ta = (EY - gap - y0) / (y1 - y0), tb = (EY + gap - y0) / (y1 - y0), segs = [[0, ta], [tb, 1]], pt = t2 => [x0 + (x1 - x0) * t2, y0 + (y1 - y0) * t2];   // the scar skips the eyeball (stops at the lids)
      g.save(); g.lineCap = 'round'; for (const [lw, col] of [[9, 'rgba(70,20,16,0.85)'], [4, '#f2c6b4']]) { g.strokeStyle = col; g.lineWidth = lw; for (const [a0, a1] of segs) { const [ax, ay] = pt(a0), [bx, by] = pt(a1); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); } }
      g.strokeStyle = 'rgba(70,20,16,0.9)'; g.lineWidth = 2.5; for (let k = 1; k < 6; k++) { const t2 = k / 6, px = x0 + (x1 - x0) * t2, py = y0 + (y1 - y0) * t2; if (Math.abs(py - EY) < gap + 4) continue; g.beginPath(); g.moveTo(px - 7, py - 1.5 * sx); g.lineTo(px + 7, py + 1.5 * sx); g.stroke(); } g.restore(); }
    if (L.eyePatch) {   // EYE PATCH (s149, Lox): black patch over one eye + the strap running up over the brow and round the side
      const sx = L.eyePatch === 'R' ? 1 : -1, cx = 128 + sx * EX, rw = 30 * ES, rh = 27 * ES;
      g.save(); g.fillStyle = '#141312'; g.beginPath(); g.ellipse(cx, EY + 2, rw, rh, sx * 0.15, 0, 7); g.fill(); g.strokeStyle = '#3a3634'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, EY + 2, rw - 5, rh - 5, sx * 0.15, 0, 7); g.stroke(); g.restore(); }
    if (f.sun) {   // sunglasses painted onto the face so the lenses wrap the head exactly
      const lw = SUN.w * ES, lh = SUN.h * ES;
      g.lineJoin = 'round'; g.strokeStyle = '#111827'; g.lineWidth = 6; g.beginPath(); g.moveTo(128 - EX + lw * 0.7, EY - lh * 0.45); g.quadraticCurveTo(128, EY - lh * 0.75, 128 + EX - lw * 0.7, EY - lh * 0.45); g.stroke();
      for (const s of [-1, 1]) { const cx = 128 + s * EX; g.save(); g.translate(cx, EY); g.rotate(-s * L.eyeTilt * 0.5);
        g.fillStyle = '#0b0f19'; g.beginPath(); g.ellipse(0, 0, lw, lh, 0, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#111827'; g.stroke();
        g.strokeStyle = 'rgba(148,163,184,0.55)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, lw * 0.7, lh * 0.66, 0, Math.PI * 1.1, Math.PI * 1.45); g.stroke(); g.restore(); }
    }
    // brows
    g.strokeStyle = L.browColor || INK; g.lineWidth = L.browWeight; g.lineCap = 'round';
    for (const [cx, side] of [[128 - EX, -1], [128 + EX, 1]]) {
      const extra = side < 0 ? (md.browL || 0) : (md.browR || 0);
      const ix = cx - side * 14 * ES, ox = cx + side * 20 * ES, by = EY - 40 * ES - (f.browUp || 0) * 7, iy = by + md.bi + extra, oy = by - 2 + md.bo + extra, mxB = (ix + ox) / 2, myB = Math.min(iy, oy) - 5, bw = L.browWeight;
      g.save(); g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(ix, iy - bw * 0.55); g.quadraticCurveTo(mxB, myB - bw * 0.45, ox, oy - bw * 0.12); g.lineTo(ox, oy + bw * 0.12); g.quadraticCurveTo(mxB, myB + bw * 0.45, ix, iy + bw * 0.55); g.closePath(); g.fill(); g.beginPath(); g.arc(ix, iy, bw * 0.55, 0, 7); g.fill(); g.restore();
      if (L.elder) { g.save(); g.lineWidth = 3; g.strokeStyle = 'rgba(30,41,59,0.55)'; g.beginPath(); g.moveTo(ix, iy + 6); g.quadraticCurveTo((ix + ox) / 2, Math.min(iy, oy) + 1, ox, oy + 6); g.stroke(); g.lineWidth = 4; g.strokeStyle = L.browColor || '#fff'; for (let t = 0; t < 3; t++) { const px = ox + side * (2 + t * 5), py = oy + t * 4; g.beginPath(); g.moveTo(px - side * 8, py); g.lineTo(px, py + 5); g.stroke(); } g.restore(); }
    }
    if (L.elder) { g.save(); g.strokeStyle = 'rgba(120,60,20,0.45)'; g.lineWidth = 2.5; g.lineCap = 'round';
      for (const s of [-1, 1]) { const cx = 128 + s * EX; g.beginPath(); g.moveTo(cx + s * 26 * ES, EY + 6); g.lineTo(cx + s * 36 * ES, EY + 2); g.moveTo(cx + s * 26 * ES, EY + 12); g.lineTo(cx + s * 35 * ES, EY + 14); g.stroke(); }
      g.beginPath(); g.moveTo(112, 44); g.quadraticCurveTo(128, 40, 144, 44); g.moveTo(116, 54); g.quadraticCurveTo(128, 51, 140, 54); g.stroke(); g.restore(); }
    // mouth
    // s609q MOUTH: one parametric shape from f.mp (see MOUTH SYSTEM). Closed = a line (fox "w" / smile / frown / pressed); open = a lip outline
    // whose corners rise with the smile + pull in with the pucker, upper lip with a small centre notch, dark inside, tongue, upper + lower
    // teeth with little fox canines, FV = upper teeth resting on the lower lip.
    if (!f.m3d) { const P = f.mp || { ...MP0, open: f.mouth || 0, fw: 1 }, mx = 128, my = 212, INKM = '#1e293b', op = f.m3d ? 0 : P.open, rd = P.round, sm = P.smile, sk = P.smirk;
      g.save(); g.fillStyle = 'rgba(120,53,15,0.16)'; g.beginPath(); g.ellipse(mx, my + 22 + op * 20, 12 + op * 5, 4, 0, 0, 7); g.fill(); g.restore();   // shade under the lower lip
      let w = (16 + P.wide * 20) * (1 + Math.max(0, sm) * 0.12); w += ((10 + op * 11) - w) * rd;
      const cyL = my - 2 - sm * 9 + sk * 2, cyR = my - 2 - sm * 9 - sk * 8;
      g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INKM;
      const corners = (lx, ly, rx, ry, k) => { if (k < 0.15) return; g.save(); g.lineWidth = 4; g.strokeStyle = 'rgba(30,41,59,' + Math.min(0.6, k * 0.7) + ')'; for (const [x, y, s2] of [[lx, ly, -1], [rx, ry, 1]]) { g.beginPath(); g.arc(x + s2 * 3, y - 2, 5, s2 > 0 ? Math.PI * 0.55 : Math.PI * -0.55, s2 > 0 ? Math.PI * 1.15 : Math.PI * 0.15, s2 < 0); g.stroke(); } g.restore(); };
      if (op < 0.06) { const wc = w * 0.74, mid = my + 3 + sm * 6, fw = P.fw * Math.max(0, 1 - Math.abs(sm) * 1.6) * (1 - P.press), Lx = mx - wc, Rx = mx + wc;
        g.lineWidth = 8.5 + P.press * 3; g.beginPath(); g.moveTo(Lx, cyL);
        if (fw > 0.05) { g.quadraticCurveTo(mx - wc * 0.5, mid + 5 * fw, mx, mid - 4 * fw); g.quadraticCurveTo(mx + wc * 0.5, mid + 5 * fw, Rx, cyR); }
        else g.bezierCurveTo(mx - wc * 0.5, mid + sm * 7, mx + wc * 0.5, mid + sm * 7, Rx, cyR);
        g.stroke(); if (P.press > 0.3) { g.save(); g.lineWidth = 4; g.strokeStyle = 'rgba(30,41,59,' + (0.25 + P.press * 0.3) + ')'; g.beginPath(); g.moveTo(mx - 7, my + 11); g.quadraticCurveTo(mx, my + 14, mx + 7, my + 11); g.stroke(); g.restore(); }
        corners(Lx, cyL, Rx, cyR, Math.abs(sm) + P.press * 0.4); }
      else { w *= 1.12 + op * 0.18; const d0 = 10 + op * 62 * (1 - rd * 0.2), topY = my - 4 - op * 12, d = Math.min(d0, 244 - topY), botY = topY + d, mY = topY + d * 0.48, Lx = mx - w, Rx = mx + w, Ly = cyL + (mY - cyL) * rd * 0.85, Ry = cyR + (mY - cyR) * rd * 0.85, notch = 3 * (1 - rd) * (1 - P.bite);
        /* s728bw (Ben: too boxy, the dark didn't fill it): a rounder lip outline, control points pulled in so the corners are soft points and the top + bottom are smooth arcs */
        const MP = new Path2D(), ci = 0.22 + rd * 0.25; MP.moveTo(Lx, Ly); MP.bezierCurveTo(Lx + w * ci, Ly - (Ly - topY) * 0.95, mx - w * 0.62, topY, mx, topY + notch); MP.bezierCurveTo(mx + w * 0.62, topY, Rx - w * ci, Ry - (Ry - topY) * 0.95, Rx, Ry);
        const lo = 0.9 + rd * 0.1; MP.bezierCurveTo(Rx - w * (ci + 0.05), Ry + (botY - Ry) * lo, mx + w * 0.7, botY, mx, botY); MP.bezierCurveTo(mx - w * 0.7, botY, Lx + w * (ci + 0.05), Ly + (botY - Ly) * lo, Lx, Ly); MP.closePath();
        { const gr = g.createRadialGradient(mx, topY + d * 0.42, 1, mx, topY + d * 0.5, Math.max(w, d) * 0.9); gr.addColorStop(0, '#12040a'); gr.addColorStop(0.7, '#2a0a14'); gr.addColorStop(1, '#4a1424'); g.fillStyle = gr; } g.fill(MP); g.save(); g.clip(MP);
        const ty = botY - d * 0.2 - P.tongue * d * 0.45; g.fillStyle = '#e8627c'; g.beginPath(); g.ellipse(mx, ty + d * 0.3, w * 0.48, Math.max(4, d * 0.26), 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,170,185,0.5)'; g.beginPath(); g.ellipse(mx - w * 0.12, ty + d * 0.18, w * 0.14, Math.max(1.5, d * 0.06), 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(150,35,65,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(mx, ty + 3); g.lineTo(mx, ty + d * 0.2); g.stroke();
        const uT = Math.max(P.teeth * Math.min(9, d * 0.34), P.bite * d * 0.8); if (uT > 0.6) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(mx - w * 0.78, topY - 6); g.lineTo(mx + w * 0.78, topY - 6); g.lineTo(mx + w * 0.7, topY + uT * 0.7); g.quadraticCurveTo(mx, topY + uT * 1.25, mx - w * 0.7, topY + uT * 0.7); g.closePath(); g.fill(); if (P.teeth > 0.35) for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(mx + s2 * w * 0.48 - 3.5, topY + uT - 1); g.lineTo(mx + s2 * w * 0.48 + 3.5, topY + uT - 1); g.lineTo(mx + s2 * w * 0.48, topY + uT + 6); g.closePath(); g.fill(); } }
        const lT = P.lteeth * Math.min(7, d * 0.26); if (lT > 0.6) { g.fillStyle = '#f6f3ef'; g.beginPath(); g.moveTo(mx - w * 0.6, botY + 6); g.lineTo(mx + w * 0.6, botY + 6); g.lineTo(mx + w * 0.55, botY - lT * 0.6); g.quadraticCurveTo(mx, botY - lT * 1.2, mx - w * 0.55, botY - lT * 0.6); g.closePath(); g.fill(); if (P.lteeth > 0.4) for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(mx + s2 * w * 0.42 - 3, botY - lT + 1); g.lineTo(mx + s2 * w * 0.42 + 3, botY - lT + 1); g.lineTo(mx + s2 * w * 0.42, botY - lT - 5); g.closePath(); g.fill(); } }
        g.restore(); g.lineWidth = 7.5; g.stroke(MP);
        if (P.bite > 0.3) { g.save(); g.lineWidth = 4; g.strokeStyle = 'rgba(30,41,59,0.5)'; g.beginPath(); g.moveTo(mx - w * 0.6, botY + 6); g.quadraticCurveTo(mx, botY + 9, mx + w * 0.6, botY + 6); g.stroke(); g.restore(); }
        corners(Lx, Ly, Rx, Ry, Math.max(0, sm) * (1 - rd)); } }
  }
  function latheColored(profile, colorAt, segs = 20) {
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs);
    const p = geo.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
    for (let i = 0; i < p.count; i++) { colorAt(p.getY(i), col); c.set([col.r, col.g, col.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); cvn(geo); return geo;
  }
  const vcToon = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
  // s609h: an outline shell for any geometry: every vertex pushed out along its (smoothed) normal; seams welded by position first
  function inflate(geo, t) { const g = geo.clone(), p = g.attributes.position, n = g.attributes.normal, acc = new Map(), key = i => [p.getX(i), p.getY(i), p.getZ(i)].map(v => Math.round(v * 1e4)).join(',');
    for (let i = 0; i < p.count; i++) { const k = key(i), a = acc.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); acc.set(k, a); }
    for (let i = 0; i < p.count; i++) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; p.setXYZ(i, p.getX(i) + a[0] / l * t, p.getY(i) + a[1] / l * t, p.getZ(i) + a[2] / l * t); }
    g.deleteAttribute('color'); cvn(g); return g; }
  // s609i HAIR LOCK: a tapered, slightly flattened tube along a curve (root sunk in the skull, tip to a point), vertex colour root → tip
  function lockGeo(pts, r0, flat, cRoot, cTip, seg = 10, sides = 7) { const curve = new THREE.CatmullRomCurve3(pts), fr = curve.computeFrenetFrames(seg, false), pos = [], col = [], idx = [], c = new THREE.Color(), p = new THREE.Vector3();
    for (let i = 0; i <= seg; i++) { const t = i / seg, r = r0 * Math.pow(1 - t, 0.75) * (1 + 0.25 * Math.sin(Math.PI * Math.min(1, t * 1.6))) + 0.002; curve.getPointAt(t, p); const N = fr.normals[i], B = fr.binormals[i]; c.copy(cRoot).lerp(cTip, Math.pow(t, 0.8));
      for (let j = 0; j < sides; j++) { const a = j / sides * Math.PI * 2, ca = Math.cos(a) * r, sa = Math.sin(a) * r * flat; pos.push(p.x + N.x * ca + B.x * sa, p.y + N.y * ca + B.y * sa, p.z + N.z * ca + B.z * sa); col.push(c.r, c.g, c.b); } }
    for (let i = 0; i < seg; i++) for (let j = 0; j < sides; j++) { const a = i * sides + j, b = i * sides + (j + 1) % sides, d = a + sides, e = b + sides; idx.push(a, b, d, b, e, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); cvn(g); return g; }
  // the cupped ear SHELL (ear-group space: root at y≈-0.07 sunk in the skull, tip at y≈0.47, front = +z)
  function earShell(L) { const k = ['ear', L.fur, L.ear, L.earInner, L.fluff, L.muzzle].join('|'); if (geoCache.has(k)) return geoCache.get(k);
    const NU = 11, NV = 12, W = 0.175, H = 0.54, Y0 = -0.075, pos = [], col = [], idx = [], cFur = new THREE.Color(L.fur), cInk = new THREE.Color(L.ear), cIn = new THREE.Color(L.earInner), cFl = new THREE.Color(L.fluff || L.muzzle), c = new THREE.Color();
    const half = v => W * Math.pow(1 - v, 0.9) * (1 + 0.22 * Math.sin(Math.PI * v * 0.9));   // gently convex sides
    const thick = v => 0.05 * (1 - v) + 0.008, cup = (u, v) => 0.075 * (1 - u * u) * Math.pow(1 - v, 0.55) * Math.min(1, v * 5 + 0.25);
    const P3 = (u, v, side) => { const x = u * half(v), y = Y0 + v * H - 0.06 * u * u * Math.pow(1 - v, 2), zm = -0.07 * v * v - cup(u, v) + 0.035 * (1 - v); return [x, y, zm + side * thick(v) / 2]; };
    const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const front = [], back = [];
    for (let iv = 0; iv <= NV; iv++) for (let iu = 0; iu <= NU; iu++) { const u = iu / NU * 2 - 1, v = iv / NV;
      front.push(pos.length / 3); pos.push(...P3(u, v, 1)); { const rim = Math.max(sm(0.62, 0.9, Math.abs(u)), sm(0.82, 0.97, v)); c.copy(cIn).lerp(cFl, sm(0.4, 0.05, v) * (1 - Math.abs(u) * 0.6)).lerp(cInk, rim); col.push(c.r, c.g, c.b); }
      back.push(pos.length / 3); pos.push(...P3(u, v, -1)); { c.copy(cFur).lerp(cInk, sm(0.22, 0.48, v)); col.push(c.r, c.g, c.b); } }
    const F = (iu, iv) => front[iv * (NU + 1) + iu], B = (iu, iv) => back[iv * (NU + 1) + iu];
    for (let iv = 0; iv < NV; iv++) for (let iu = 0; iu < NU; iu++) { idx.push(F(iu, iv), F(iu + 1, iv), F(iu + 1, iv + 1), F(iu, iv), F(iu + 1, iv + 1), F(iu, iv + 1)); idx.push(B(iu, iv), B(iu + 1, iv + 1), B(iu + 1, iv), B(iu, iv), B(iu, iv + 1), B(iu + 1, iv + 1)); }
    for (let iv = 0; iv < NV; iv++) { idx.push(F(0, iv), F(0, iv + 1), B(0, iv), B(0, iv), F(0, iv + 1), B(0, iv + 1)); idx.push(F(NU, iv), B(NU, iv), F(NU, iv + 1), B(NU, iv), B(NU, iv + 1), F(NU, iv + 1)); }
    for (let iu = 0; iu < NU; iu++) idx.push(F(iu, 0), B(iu, 0), F(iu + 1, 0), B(iu, 0), B(iu + 1, 0), F(iu + 1, 0));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); cvn(g); geoCache.set(k, g); return g; }
  let LOOK = loadLook(); const geoCache = new Map();
  const C3 = h => new THREE.Color(h);
  const tailGeoFor = L => { const k = 'tail' + L.tailBase + L.tailMid + L.tailTip + L.tailCurl; if (geoCache.has(k)) return geoCache.get(k); const g = (() => {
    const prof = [[0, 0], [0.08, 0.06], [0.17, 0.2], [0.25, 0.38], [0.29, 0.55], [0.27, 0.72], [0.2, 0.86], [0.1, 0.96], [0, 1.02]];
    const o1 = C3(L.tailBase), o2 = C3(L.tailMid), wh = C3(L.tailTip);
    const g = latheColored(prof, (y, c) => y > 0.74 ? c.copy(wh) : c.copy(o1).lerp(o2, y / 0.74), 18);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, p.getZ(i) - y * y * L.tailCurl); p.setY(i, y * 0.95); }
    cvn(g); return g;
  })(); geoCache.set(k, g); return g; };
  function foxSkull(r, ws, hs, p0, pl, t0, tl, L = LOOK) {
    const g = p0 == null ? new THREE.SphereGeometry(r, ws, hs) : new THREE.SphereGeometry(r, ws, hs, p0, pl, t0, tl);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i) / r, y = p.getY(i) / r, z = p.getZ(i) / r;
      const cheek = Math.exp(-(((y + 0.28) / 0.3) ** 2)); x *= 1 + 0.26 * L.cheeks * cheek * (0.6 + 0.4 * Math.max(0, z));
      if (y < -0.35) { const t = Math.min(1, (-0.35 - y) / 0.65); x *= 1 - 0.5 * L.chinPoint * t; z += 0.16 * L.chinPoint * t * Math.max(0, z); }
      if (y > 0.2) y -= (y - 0.2) * 0.32;                                   // flatter, wider fox crown
      if (y > 0) x *= 1 + 0.06 * Math.min(1, y * 2);                          // broad between the ears
      if (z < 0) { z *= 0.74; if (y > 0) y *= 1 - 0.14 * (-z); } else z *= 1 - 0.1 * Math.max(0, y);
      if (z > 0) z += 0.2 * z * Math.exp(-(((y - 0.02) / 0.34) ** 2)) * Math.exp(-((x / 0.5) ** 2));   // profile: forehead slopes forward into the snout (fox 'stop')
      if (y < -0.5 && z < 0.3) y += (-0.5 - y) * (L.jawTuck ?? 0.25);
      if (z > 0.1 && y < -0.22) { const tt = Math.min(1, (-0.22 - y) / 0.6); z -= (L.throat ?? 0.35) * tt * (z - 0.1); y += 0.12 * (L.throat ?? 0.35) * tt * Math.max(0, z); }   // throat: lower front recedes under the snout (fox jaw line)                       // tuck the jaw so the head is not a ball underneath
      if (z > 0 && y < 0.15 && y > -0.6) { const br = Math.exp(-((x / 0.42) ** 2)) * Math.exp(-(((y + 0.18) / 0.3) ** 2)); z += (L.muzzleWedge ?? 0.26) * br * z; }  // muzzle wedge running into the snout
      { const ruff = Math.exp(-(((y + 0.35) / 0.22) ** 2)) * Math.max(0, 1 - Math.abs(z) * 0.6); x *= 1 + 0.12 * L.cheeks * ruff; }  // cheek ruff flares out (triangle face)
      p.setXYZ(i, x * r, y * r, z * r);
    }
    cvn(g); return g;
  }
  const snoutGeoFor = L => { const k = 'snout' + (L.snout || L.muzzle) + (L.underSnout || L.chin) + '|' + (L.underDepth ?? 1) + '|' + (L.underWidth ?? 1) + '|' + (L.chinLine ?? 0) + '|' + (L.underRise ?? 0.45); if (geoCache.has(k)) return geoCache.get(k); const gg = (() => {
    const prof = [[0, 0], [0.18, 0.0], [0.185, 0.05], [0.17, 0.13], [0.14, 0.21], [0.1, 0.28], [0.062, 0.33], [0.026, 0.37], [0, 0.38]];
    const top = C3(L.snout || L.muzzle), wh = C3(L.underSnout || L.chin), uD = L.underDepth ?? 1, uW = L.underWidth ?? 1, cL = (L.chinLine ?? 0) * 0.05, uR = L.underRise ?? 0.45;
    const g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 22); g.rotateX(Math.PI / 2);
    const p = g.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const t = Math.min(1, Math.max(0, p.getZ(i) / 0.38)); if (p.getY(i) < 0) p.setY(i, p.getY(i) * (1 - uR * Math.pow(t, 1.3))); else p.setY(i, p.getY(i) * (1 - 0.18 * t)); p.setX(i, p.getX(i) * (1 - 0.12 * t)); const y = p.getY(i); p.setX(i, p.getX(i) * 1.2 * (1 + (uW - 1) * smooth(0.02, -0.08, y))); p.setY(i, y * (y > 0 ? 0.78 : 0.62 * uD) + p.getZ(i) * 0.12); col.copy(top).lerp(wh, smooth(-0.03 + cL, -0.09 + cL, y)); c.set([col.r, col.g, col.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); cvn(g); return g;
  })(); geoCache.set(k, gg); return gg; };
  let _glowT = null;
  function glowTexFor() { if (_glowT) return _glowT; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); _glowT = new THREE.CanvasTexture(c); _glowT.colorSpace = THREE.SRGBColorSpace; return _glowT; }
  function makeFox({ key, name, torso, crest, bow, glasses, legColor, cane, chair, crown, boxRobe, headGuard, robeCol, eyes = ['#38bdf8', '#38bdf8'], mood = 'neutral', look, gear = 'none', outfit = 'armor', merged, joints }) {
    { const UF = uniqueFace(key); if (UF) { look = { ...(look || {}), ...UF.look }; if (UF.look.fur) { if (!UF.look.chinPatchCol) look.chinPatchCol = UF.look.chin || UF.look.muzzle || look.chinPatchCol; if (!UF.look.paw) look.paw = UF.look.fur; if (!UF.look.tailMid) look.tailMid = UF.look.fur; if (!UF.look.tailBase) look.tailBase = UF.look.furDark || UF.look.fur; } if (UF.eyes) eyes = UF.eyes; if (UF.mood) mood = UF.mood; } }   /* s715 UNIQUE FACES (engine/meru-faces.js) */
    const L = { ...LOOK, ...(look || {}) }; if (!L.keepChin) { L.chinPatchCol0 = L.chinPatchCol; const tc = L.chinTuftCol, us = L.underSnout || L.chin; Object.assign(L, ALL_CHIN); if (tc) L.chinTuftCol = tc; if (us) L.underSnout = us; if (L.chinPatchCol0) L.chinPatchCol = L.chinPatchCol0; }   /* s672b the white chin no longer turns the under-snout (round the mouth) white */ const listed = key === 'player' || JOINT_KEYS.has(key) || /^robDriveMe|^aviaryFalconer|^fountainPainter/.test(key || ''); joints = joints ?? listed; HANDS = !!(joints && (listed || (typeof window !== 'undefined' && window.__allHands)));   // s642 PERF: background foxes (walkers, path people, kids, life, fans …) get joints but NO finger bones (a plain paw); the player, keepers + the hero NPCs keep full hands
    if (look && look.fur) { if (!look.chinPatchCol && (look.chin || look.muzzle)) L.chinPatchCol = look.chin || look.muzzle; if (!look.paw) L.paw = look.fur; if (!look.tailMid) L.tailMid = look.fur; if (!look.tailBase) L.tailBase = look.furDark || look.fur; }   // s715b (Ben: grey faces with orange hands): a fox that sets its own fur gets paws + tail in that fur unless it picks them itself
    if (typeof torso === 'string') { const c = new THREE.Color(torso); torso = [torso, '#' + c.clone().multiplyScalar(0.72).getHexString(), '#' + c.clone().multiplyScalar(0.42).getHexString()]; }   // one colour → light / mid / dark
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const P = { body };
    const fur = toon(L.fur), furDark = toon(L.furDark), white = toon(L.fluff), ink = toon(L.ear), leg = toon(L.leg), boot = toon(L.boot);
    const legX = chair ? 0 : 0.5 * (L.legLength - 1), lift = (chair ? 0.28 : 0) + legX;
    P.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.14, 0.5 + lift, 0); p.scale.y = L.legLength; body.add(p);
      M(new THREE.CapsuleGeometry(0.095, 0.24, 4, 10), leg, 0, -0.2, 0, p, 0.025);
      M(new THREE.SphereGeometry(0.14, 14, 10), boot, 0, -0.42, 0.05, p, 0.022, 0.14).scale.set(1, 0.62, 1.35);
      if (chair) p.rotation.x = -1.45; return p; });
    const t0 = C3(torso[0]), t1 = C3(torso[1]), t2 = C3(torso[2]);
    if (outfit === 'armor') {
      // ---- armour ----
      const accent = toon(L.armorAccent || '#38bdf8', { emissive: new THREE.Color(L.armorAccent || '#38bdf8'), emissiveIntensity: 0.25 }); const shadeHex = c => '#' + new THREE.Color(torso[0]).lerp(new THREE.Color(L.armorAccent || '#38bdf8'), c).getHexString(); const accentShade = toon(shadeHex(0.9)), accentShadeD = toon('#' + new THREE.Color(L.armorAccent || '#38bdf8').multiplyScalar(0.78).getHexString()); const under = toon(torso[2]), plate = toon(torso[0]), plateMid = toon(torso[1]), trim = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), steel = toon('#94a3b8');
      M(latheColored([[0, 0.42], [0.22, 0.42], [0.27, 0.5], [0.24, 0.66], [0.25, 0.9], [0.27, 1.12], [0.14, 1.24], [0, 1.25]], (y, c) => c.copy(t2), 20), vcToon, 0, lift, 0, body, 0.025);
      const cuirass = latheColored([[0.255, 0.66], [0.3, 0.7], [0.335, 0.82], [0.36, 0.98], [0.355, 1.08], [0.32, 1.17], [0.22, 1.23], [0.1, 1.255], [0, 1.26]],
        (y, c) => c.copy(t1).lerp(t0, smooth(0.7, 1.15, y)), 28);
      const cp = cuirass.attributes.position; for (let i = 0; i < cp.count; i++) { const z = cp.getZ(i); if (z > 0) cp.setZ(i, z * 1.12); else cp.setZ(i, z * 0.9); } cvn(cuirass);
      M(cuirass, vcToon, 0, lift, 0, body, 0.03);
      { const r1 = M(new THREE.TorusGeometry(0.3, 0.028, 8, 32), trim, 0, 0.7 + lift, 0.01, body, 0); r1.rotation.x = Math.PI / 2; r1.scale.set(1, 1.08, 1); }
      { const st = M(new THREE.BoxGeometry(0.035, 0.12, 0.03), trim, 0, 0.73 + lift, 0.345, body, 0); st.rotation.x = -0.2; }   // s149: gold centre strip shortened so it stops below the crest
      // s662z5 (Ben): the steel collar bar is gone; a short fur NECK rises out of the breastplate instead
      { const nk = M(new THREE.CylinderGeometry(0.15, 0.2, 0.1, 22), fur, 0, 1.24 + lift, -0.01, body, 0.016, 0.2);   /* s663b/c Ben: neck 33 % then 25 % shorter */ nk.userData.neck = true;
        /* s665 the cream neck bib was removed (Ben: "something weird under her nose": it poked out under the chin) */ }
      // crest medallion
      const crestM = new THREE.MeshToonMaterial({ map: armorCrest(crest), gradientMap: grad, emissive: 0xffffff, emissiveMap: armorCrest(crest), emissiveIntensity: 0.18 });
      // s149: the crest is a DECAL that hugs the breastplate (projected onto the cuirass lathe profile) instead of a disc standing off it
      { const PR = [[0.255, 0.66], [0.3, 0.7], [0.335, 0.82], [0.36, 0.98], [0.355, 1.08], [0.32, 1.17], [0.22, 1.23], [0.1, 1.255]], rAt = y => { const sm = (k, y0) => { const f = Math.max(0, Math.min(1, (y0 - PR[k - 1][1]) / (PR[k][1] - PR[k - 1][1]))); return PR[k - 1][0] + (PR[k][0] - PR[k - 1][0]) * f; }; let r = 0, wsum = 0; for (const d of [-0.03, -0.015, 0, 0.015, 0.03]) { const yy = y + d; let v = PR[PR.length - 1][0]; if (yy <= PR[0][1]) v = PR[0][0]; else for (let k = 1; k < PR.length; k++) if (yy <= PR[k][1]) { v = sm(k, yy); break; } const w = 1 - Math.abs(d) * 20; r += v * w; wsum += w; } return r / wsum; };   // smoothed profile (no kink line)
        // s662z6 the tall build stretches the breastplate (about the hips, x k) but only SHIFTS the crest: so the crest hugs the profile the plate will
        // have AFTER the stretch (each crest row reads the plate radius at its pre-stretch height) and is never cut by it
        const HB = !chair && L.heroBuild !== false, hip0 = 0.5 + lift, kT = HB ? HERO_BUILD.torso : 1, dLg = HB ? 0.5 * (L.legLength * HERO_BUILD.legs - L.legLength) : 0, CZ = HB ? 0.006 : 0;
        const CY0 = 1.07, RD = 0.18, dC = HB ? dLg + (CY0 + lift - hip0) * (kT - 1) : 0, pre = y => HB ? (y + lift + dC - hip0 - dLg) / kT + hip0 - lift : y;
        const zAt = (x, y, off) => { const r = rAt(pre(y)) + off; return Math.sqrt(Math.max(0, r * r - x * x)) * 1.12; };
        const decal = (rad, off, N = 22) => { const pos = [], uv = [], idx = []; for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const u = i / N, v = j / N, x = (u * 2 - 1) * rad, y = CY0 + (v * 2 - 1) * rad; pos.push(x, y, zAt(x, y, off)); uv.push(u, v); }
          for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const p = j * (N + 1) + i, cx = ((i + 0.5) / N * 2 - 1), cy = ((j + 0.5) / N * 2 - 1); if (cx * cx + cy * cy > 1.08) continue; idx.push(p, p + 1, p + N + 2, p, p + N + 2, p + N + 1); }
          const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gg.setIndex(idx); cvn(gg); gg.translate(0, lift, 0); return gg; };
        const rimPts = []; for (let k = 0; k <= 64; k++) { const an = k / 64 * Math.PI * 2, x = Math.cos(an) * (RD + 0.012), y = CY0 + Math.sin(an) * (RD + 0.012); rimPts.push(new THREE.Vector3(x, y + lift, zAt(x, y, 0.014 + CZ))); }
        const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 96, 0.016, 6, true), accent); rim.userData.crest = true; body.add(rim);
        const cm = new THREE.MeshBasicMaterial({ map: crestM.map, color: 0xeeeeee, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });   // unlit: no toon shading band across the curved crest
        const med = new THREE.Mesh(decal(RD, 0.012 + CZ), cm); med.userData.crest = true; body.add(med); }
      // waist + faulds
      M(new THREE.CylinderGeometry(0.29, 0.28, 0.1, 28), under, 0, 0.64 + lift, 0, body, 0.018, 0.29);
      M(new THREE.BoxGeometry(0.13, 0.1, 0.04), trim, 0, 0.64 + lift, 0.3, body, 0.012);
      for (let k = -2; k <= 2; k++) { const ang = k * 0.62, f = M(new THREE.BoxGeometry(0.17, 0.2, 0.035), k % 2 ? accentShadeD : accentShade, Math.sin(ang) * 0.29, 0.5 + lift, Math.cos(ang) * 0.29, body, 0.012); f.rotation.set(0.28, ang, 0); M(new THREE.BoxGeometry(0.17, 0.03, 0.04), accent, 0, -0.085, 0.002, f, 0); M(new THREE.BoxGeometry(0.03, 0.14, 0.04), accent, 0, 0.01, 0.004, f, 0); }
      // pauldrons: two layered domes each
      for (const s of [-1, 1]) {
        const pg = new THREE.Group(); pg.position.set(s * 0.36, 1.17 + lift, 0); pg.rotation.z = -s * 0.42; body.add(pg);
        M(new THREE.SphereGeometry(0.19, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), accentShade, 0, 0, 0, pg, 0.02, 0.19).scale.set(1, 0.75, 1.05);
        M(new THREE.TorusGeometry(0.19, 0.024, 6, 24), accent, 0, 0.0, 0, pg, 0).rotation.x = Math.PI / 2;
        const p2 = M(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), accentShadeD, 0, -0.07, 0, pg, 0.018, 0.17); p2.scale.set(1.05, 0.55, 1.08);
        M(new THREE.SphereGeometry(0.03, 8, 6), steel, 0, 0.13, 0, pg, 0); M(new THREE.TorusGeometry(0.175, 0.016, 6, 24), accent, 0, -0.075, 0, pg, 0).rotation.x = Math.PI / 2;
      }
      // s662z BOOT CUFFS (Ben: blue like the shoulders above the black boots): a flared armour cuff in the pauldron blue + a bright accent rim
      // s662z7 polish: the cuff is a flared lathe (soft roll at the top, a wider lip over the boot), a raised FRONT POINT like a greave, rims top + bottom
      const cuffG = new THREE.LatheGeometry([[0.136, -0.062], [0.132, -0.05], [0.118, -0.02], [0.108, 0.02], [0.104, 0.05], [0.096, 0.064]].map(([x, y]) => new THREE.Vector2(x, y)), 24);
      const cuffM = legColor ? toon('#f3f2f2') : accentShade;   /* s665 coloured legs (Hope's blue) get WHITE cuffs + knee guards so they stand out; the rims stay bright blue */
      for (const lg of P.legs || []) { M(cuffG, cuffM, 0, -0.318, 0.012, lg, 0.014, 0.136).userData.keepCol = true; { const t1 = M(new THREE.TorusGeometry(0.1, 0.014, 6, 24), accent, 0, -0.256, 0.012, lg, 0); t1.rotation.x = Math.PI / 2; t1.userData.keepCol = true; } { const t2 = M(new THREE.TorusGeometry(0.135, 0.01, 5, 24), accentShadeD, 0, -0.378, 0.012, lg, 0); t2.rotation.x = Math.PI / 2; t2.userData.keepCol = true; }
        const tip = M(new THREE.ConeGeometry(0.045, 0.09, 4), accent, 0, -0.29, 0.128, lg, 0.008); tip.rotation.set(0.12, Math.PI / 4, 0); tip.userData.keepCol = true; tip.scale.set(1, 1, 0.4); }
      P.kneeMat = cuffM; P.kneeRim = accent;   // knee guards (made in jointLimbs) wear the armour blue
          P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.42, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
        M(new THREE.CapsuleGeometry(0.07, 0.26, 4, 10), under, 0, -0.17, 0, p, 0.02);
        M(new THREE.CylinderGeometry(0.095, 0.085, 0.17, 14), plate, 0, -0.28, 0, p, 0.016, 0.095);
        M(new THREE.TorusGeometry(0.093, 0.016, 6, 18), trim, 0, -0.2, 0, p, 0).rotation.x = Math.PI / 2;
        M(new THREE.SphereGeometry(0.06, 10, 8), steel, 0, -0.13, 0.02, p, 0.012, 0.06);
        pawFist(p, L); return p; });
      P.legs.forEach(p => { M(new THREE.CylinderGeometry(0.105, 0.095, 0.2, 14), plate, 0, -0.28, 0.005, p, 0.016, 0.105); M(new THREE.SphereGeometry(0.075, 10, 8), plateMid, 0, -0.14, 0.06, p, 0.012, 0.075).scale.set(1, 0.8, 0.7); M(new THREE.TorusGeometry(0.1, 0.014, 6, 18), trim, 0, -0.19, 0.005, p, 0).rotation.x = Math.PI / 2; });
    } else {
      // ---- clothes (everyone who is not a guard) ----
      const C = { light: toon(torso[0]), mid: toon(torso[1]), dark: toon(torso[2]), gold: toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), cream: toon('#f7f1e6'), ink: toon('#1e293b'), fur: toon('#f8fafc') };
      const lathe = (pts, col, segs = 26, squash = 1.1) => { const gg = latheColored(pts, (y, c) => typeof col === 'function' ? col(y, c) : c.copy(col), segs); const pp = gg.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); pp.setZ(i, z > 0 ? z * squash : z * 0.92); } cvn(gg); return gg; };
      const badge = (x, y, z, r = 0.075, rx = -0.2) => { r *= L.crestSize || 1; const tex = armorCrest(crest); const bm = M(new THREE.CylinderGeometry(r, r, 0.02, 28), [C.gold, new THREE.MeshToonMaterial({ map: tex, gradientMap: grad }), C.gold], x, y + lift, z, body, 0.008, r); bm.rotation.set(Math.PI / 2 + rx, Math.PI / 2, 0, 'XYZ'); bm.userData.badgeR = r; (P.badges || (P.badges = [])).push(bm); return bm; };
      const sleeve = (mat, cuffMat, wide = false) => [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.4, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
        if (wide) { M(new THREE.CylinderGeometry(0.075, 0.15, 0.34, 14, 1, true), mat, 0, -0.2, 0, p, 0.016, 0.15); M(new THREE.TorusGeometry(0.148, 0.018, 6, 18), cuffMat, 0, -0.37, 0, p, 0).rotation.x = Math.PI / 2; }
        else { M(new THREE.CapsuleGeometry(0.078, 0.26, 4, 10), mat, 0, -0.17, 0, p, 0.02); M(new THREE.CylinderGeometry(0.088, 0.088, 0.07, 14), cuffMat, 0, -0.31, 0, p, 0.012, 0.088); }
        pawFist(p, L); return p; });
      const kind = outfit;
      if (kind === 'robe') {          // advisor's robe: floor length, wide sleeves, sash
        M(lathe([[0.3, 0.06], [0.36, 0.08], [0.33, 0.4], [0.28, 0.7], [0.29, 0.95], [0.33, 1.12], [0.24, 1.22], [0.12, 1.26], [0, 1.27]], (y, c) => c.copy(t1).lerp(t2, smooth(0.9, 0.1, y))), vcToon, 0, lift - 0.02, 0, body, 0.03);
        M(new THREE.TorusGeometry(0.29, 0.045, 8, 28), C.gold, 0, 0.72 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        const tie = M(new THREE.BoxGeometry(0.08, 0.36, 0.03), C.gold, 0.12, 0.54 + lift, 0.31, body, 0.01); tie.rotation.z = 0.12;
        M(new THREE.BoxGeometry(0.1, 0.62, 0.03), C.light, 0, 0.98 + lift, 0.33, body, 0.01).rotation.x = -0.18;
        M(new THREE.TorusGeometry(0.2, 0.06, 8, 22, Math.PI * 1.3), C.light, 0, 1.22 + lift, 0.02, body, 0.012).rotation.set(Math.PI / 2, 0, -Math.PI * 0.15 + Math.PI);
        badge(-0.17, 1.03, 0.34, 0.065);
        P.arms = sleeve(C.mid, C.gold, true);
        P.legs.forEach(p => p.visible = false);
      } else if (kind === 'coat' || kind === 'dress') {   // officer's long coat; the dress version flares
        const flare = kind === 'dress' ? 0.42 : 0.33;
        M(lathe([[flare, 0.22], [flare - 0.02, 0.3], [0.29, 0.6], [0.27, 0.72], [0.3, 0.95], [0.34, 1.1], [0.27, 1.2], [0.12, 1.25], [0, 1.26]], (y, c) => c.copy(t1).lerp(t0, smooth(0.6, 1.15, y))), vcToon, 0, lift, 0, body, 0.03);
        M(new THREE.TorusGeometry(0.275, 0.03, 8, 28), C.dark, 0, 0.72 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        M(new THREE.BoxGeometry(0.11, 0.08, 0.035), C.gold, 0, 0.72 + lift, 0.3, body, 0.01);
        for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(0.022, 8, 6), C.gold, sx * 0.1, 0.84 + k * 0.1 + lift, 0.31 + k * 0.012, body, 0);
        M(new THREE.CylinderGeometry(0.17, 0.2, 0.11, 22), C.mid, 0, 1.24 + lift, 0, body, 0.014, 0.2);
        for (const s of [-1, 1]) { const ep = M(new THREE.BoxGeometry(0.2, 0.04, 0.2), C.gold, s * 0.36, 1.2 + lift, 0, body, 0.012); ep.rotation.z = -s * 0.3; for (let k = -2; k <= 2; k++) M(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4), C.gold, k * 0.04, -0.05, 0.1, ep, 0); }
        if (kind === 'dress') M(new THREE.TorusGeometry(0.4, 0.018, 6, 30), C.gold, 0, 0.24 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        badge(-0.15, 1.02, 0.32);
        P.arms = sleeve(C.mid, C.gold);
      } else if (kind === 'vest') {   // shirt, open vest, neck scarf
        M(lathe([[0, 0.42], [0.23, 0.42], [0.28, 0.52], [0.25, 0.68], [0.27, 0.95], [0.32, 1.12], [0.22, 1.22], [0.1, 1.26], [0, 1.27]], C3((L.shirt || '#f7f1e6'))), vcToon, 0, lift, 0, body, 0.028);
        const vest = M(lathe([[0.27, 0.52], [0.275, 0.66], [0.29, 0.95], [0.335, 1.12], [0.25, 1.21]], (y, c) => c.copy(t1), 26), vcToon, 0, lift, 0, body, 0.026);
        vest.geometry = vest.geometry.clone(); { const pp = vest.geometry.attributes.position; for (let i = 0; i < pp.count; i++) if (pp.getZ(i) > 0.2 && Math.abs(pp.getX(i)) < 0.08) pp.setZ(i, pp.getZ(i) - 0.02); }
        M(new THREE.BoxGeometry(0.04, 0.58, 0.04), C.dark, -0.07, 0.86 + lift, 0.3, body, 0); M(new THREE.BoxGeometry(0.04, 0.58, 0.04), C.dark, 0.07, 0.86 + lift, 0.3, body, 0);
        M(new THREE.TorusGeometry(0.28, 0.035, 8, 28), C.ink, 0, 0.58 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        M(new THREE.BoxGeometry(0.1, 0.07, 0.03), C.gold, 0, 0.58 + lift, 0.3, body, 0.01);
        M(new THREE.BoxGeometry(0.14, 0.12, 0.08), toon('#6b4a35'), 0.2, 0.52 + lift, 0.2, body, 0.012).rotation.y = 0.5;
        M(new THREE.TorusGeometry(0.17, 0.055, 8, 22), C.dark, 0, 1.24 + lift, 0.02, body, 0.012).rotation.x = Math.PI / 2;
        const tail2 = M(new THREE.BoxGeometry(0.08, 0.2, 0.03), C.dark, 0.06, 1.12 + lift, 0.2, body, 0.008); tail2.rotation.z = -0.2;
        badge(0.15, 1.02, 0.33, 0.06);
        P.arms = sleeve(toon((L.shirt || '#f7f1e6')), C.mid);
      } else if (kind === 'tee') {    // plain T-shirt (diner crew): ringer collar + short sleeves
        M(lathe([[0, 0.5], [0.27, 0.5], [0.285, 0.6], [0.26, 0.72], [0.28, 0.95], [0.31, 1.1], [0.22, 1.21], [0.1, 1.25], [0, 1.26]], (y, c) => c.copy(t0)), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.TorusGeometry(0.135, 0.028, 8, 24), C.dark, 0, 1.235 + lift, 0.02, body, 0.008).rotation.x = Math.PI / 2;
        M(new THREE.TorusGeometry(0.272, 0.022, 6, 28), C.dark, 0, 0.52 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.4, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
          M(new THREE.CylinderGeometry(0.095, 0.105, 0.14, 14), C.light, 0, -0.06, 0, p, 0.014, 0.105); M(new THREE.TorusGeometry(0.1, 0.016, 6, 16), C.dark, 0, -0.13, 0, p, 0).rotation.x = Math.PI / 2;
          M(new THREE.CapsuleGeometry(0.06, 0.2, 4, 10), toon(L.fur), 0, -0.24, 0, p, 0.018); pawFist(p, L); return p; });
      } else if (kind === 'boxer') {  // bare-chested boxer: torso[0] shorts · torso[1] waistband · torso[2] gloves
        M(lathe([[0, 0.7], [0.27, 0.7], [0.27, 0.95], [0.3, 1.1], [0.22, 1.21], [0.1, 1.25], [0, 1.26]], (y, c) => c.copy(C3(L.fur))), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.SphereGeometry(0.17, 14, 10), white, 0, 0.98 + lift, 0.18, body, 0.01, 0.17).scale.set(1, 1.25, 0.45);
        M(lathe([[0, 0.4], [0.3, 0.4], [0.335, 0.5], [0.3, 0.62], [0.28, 0.72], [0, 0.72]], (y, c) => c.copy(t0)), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.TorusGeometry(0.285, 0.05, 8, 28), toon(torso[1]), 0, 0.71 + lift, 0, body, 0.008).rotation.x = Math.PI / 2;
        for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.035, 0.26, 0.02), toon(torso[1]), sx * 0.3, 0.55 + lift, 0.05, body, 0).rotation.z = sx * 0.12;
        P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.38, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
          M(new THREE.CapsuleGeometry(0.065, 0.24, 4, 10), fur, 0, -0.2, 0, p, 0.018); const gl = M(new THREE.SphereGeometry(0.15, 14, 10), toon(torso[2]), 0, -0.42, 0.03, p, 0.022, 0.15); gl.scale.set(1, 1.05, 1.2); M(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12), toon('#fbf8ec'), 0, -0.31, 0.01, p, 0.008, 0.1); return p; });
      } else if (kind === 'swimsuit' || kind === 'trunks' || kind === 'boxsport' || kind === 'boxtank') {   // s608 SWIM + BOXING (sporty, covered): torso[0] main · torso[1] trim · torso[2] gloves / dark
        const furLegs = () => P.legs.forEach(p => p.children.forEach(c => { if (!c.isMesh) return; const foot = c.geometry.type === 'SphereGeometry' && Math.abs((c.geometry.parameters || {}).radius - 0.14) < 0.001; c.material = foot ? toon(L.paw) : fur; }));
        const main = toon(torso[0]), trimM = toon(torso[1]), dark = toon(torso[2]);
        // fur body under everything (the boxer's), so arms + neck read as the fox
        // s608 BOX FIT (Fox Workshop props → window.__8G_BOXFIT): shoulders, sports-top length, tank cut
        const BF = (typeof window !== 'undefined' && window.__8G_BOXFIT) || {}, boxK = kind === 'boxsport' || kind === 'boxtank', sh = boxK ? (BF.shoulders ?? 1) : 0.6, topLen = BF.topLen ?? 0.82, tankCut = BF.tankCut || 'classic', strapSt = BF.straps || 'racerback';
        M(lathe([[0, 0.45], [0.27, 0.45], [0.27, 0.95], [0.3 + 0.035 * sh, 1.07], [0.3 + 0.03 * sh, 1.13], [0.24, 1.2], [0.13, 1.245], [0, 1.26]], (y, c) => c.copy(C3(L.fur))), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.SphereGeometry(0.16, 14, 10), white, 0, 1.0 + lift, 0.19, body, 0.008, 0.16).scale.set(1, 1.2, 0.42);
        if (boxK) for (const sx of [-1, 1]) { const tr = M(new THREE.SphereGeometry(0.12, 14, 10), kind === 'boxtank' ? toon(torso[1]) : kind === 'boxsport' ? main : fur, sx * 0.17, 1.2 + lift, -0.03, body, 0.012, 0.12); tr.scale.set(1.25 * sh, 0.55, 0.9); }   // trapezius: the slope from the neck to the shoulder
        if (kind === 'swimsuit') {   // a sporty one-piece: racer back, high scoop neck, boy-short legs, a stripe down each side
          // s608 Ben: shaped like the female boxer's top up top: over the shoulders, scooped neck front + back, trimmed armholes
          { const rr = 0.3 + 0.03 * sh, tg = lathe([[0, 0.4], [0.29, 0.4], [0.315, 0.5], [0.285, 0.64], [0.28, 0.95], [0.317 + 0.035 * sh, 1.07], [0.317 + 0.03 * sh, 1.13], [0.257, 1.2], [0.19, 1.24], [0.165, 1.255]], (y, c) => c.copy(t0)), tp = tg.attributes.position, Y0 = 1.08, Y1 = 1.255, sF = 0.11, sB = 0.06, rim = [];
            for (let k = 0; k < tp.count; k++) { const x = tp.getX(k), y = tp.getY(k), z = tp.getZ(k); if (y <= Y0) continue; const az = Math.atan2(x, z), c2 = Math.cos(az), d = (c2 > 0 ? sF : sB) * c2 * c2 * Math.pow((y - Y0) / (Y1 - Y0), 1.3); tp.setY(k, y - d); if (y > Y1 - 0.001) rim.push([az, x, y - d, z]); }
            cvn(tg); M(tg, vcToon, 0, lift, 0, body, 0.028);
            if (rim.length > 6) { rim.sort((a2, b2) => a2[0] - b2[0]); const pts = []; for (const [, x, y, z] of rim) { if (!pts.length || Math.hypot(pts[pts.length - 1].x - x, pts[pts.length - 1].z - z) > 0.01) pts.push(new THREE.Vector3(x * 1.02, y + lift + 0.004, z * 1.02)); }
              M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.017, 6, true), trimM, 0, 0, 0, body, 0); }
            for (const sx of [-1, 1]) { const ah = M(new THREE.TorusGeometry(0.118, 0.017, 6, 20), trimM, sx * (rr - 0.005), 1.04 + lift, 0, body, 0); ah.rotation.set(0, Math.PI / 2, 0); ah.scale.set(1, 1.25, 1);
              const tr = M(new THREE.SphereGeometry(0.12, 14, 10), main, sx * 0.17, 1.2 + lift, -0.03, body, 0.012, 0.12); tr.scale.set(0.75, 0.55, 0.9); } }
          for (const sx of [-1, 1]) { const st = M(new THREE.BoxGeometry(0.035, 0.66, 0.04), trimM, sx * 0.295, 0.78 + lift, 0, body, 0.004); st.rotation.z = -sx * 0.04; }
          P.legs.forEach(p => { M(new THREE.CylinderGeometry(0.115, 0.11, 0.12, 14), main, 0, -0.04, 0, p, 0.01, 0.115); M(new THREE.TorusGeometry(0.11, 0.014, 5, 16), trimM, 0, -0.1, 0, p, 0).rotation.x = Math.PI / 2; });
        } else if (kind === 'trunks') {   // swim trunks with a drawstring + side stripe
          M(lathe([[0, 0.4], [0.3, 0.4], [0.33, 0.5], [0.3, 0.62], [0.285, 0.7], [0, 0.7]], (y, c) => c.copy(t0)), vcToon, 0, lift, 0, body, 0.028);
          M(new THREE.TorusGeometry(0.287, 0.032, 8, 28), trimM, 0, 0.69 + lift, 0, body, 0.006).rotation.x = Math.PI / 2;
          for (const sx of [-1, 1]) { M(new THREE.BoxGeometry(0.03, 0.26, 0.03), trimM, sx * 0.31, 0.55 + lift, 0, body, 0); M(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 5), toon('#f3f2f2'), sx * 0.03, 0.63 + lift, 0.29, body, 0); }
          P.legs.forEach(p => M(new THREE.CylinderGeometry(0.12, 0.115, 0.16, 14), main, 0, -0.06, 0, p, 0.01, 0.12));
        } else {   // BOXING: shorts with a wide waistband, a sports top (boxsport) or a tank top (boxtank)
          M(lathe([[0, 0.38], [0.31, 0.38], [0.345, 0.5], [0.31, 0.62], [0.29, 0.72], [0, 0.72]], (y, c) => c.copy(t0)), vcToon, 0, lift, 0, body, 0.028);
          M(new THREE.TorusGeometry(0.29, 0.055, 8, 28), trimM, 0, 0.71 + lift, 0, body, 0.008).rotation.x = Math.PI / 2;
          for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.035, 0.3, 0.02), trimM, sx * 0.32, 0.54 + lift, 0.04, body, 0).rotation.z = sx * 0.12;
          P.legs.forEach(p => M(new THREE.CylinderGeometry(0.125, 0.12, 0.2, 14), main, 0, -0.08, 0, p, 0.01, 0.125));
          if (kind === 'boxsport') {   // s608 Ben: a sports top that LOOPS ROUND THE ARMS (tank-style armholes, no tube straps): cropped, wide underband, scooped neck front + back, trimmed armholes
            const t = topLen, rr = 0.3 + 0.03 * sh;
            const tg = lathe([[0, t], [0.282, t], [0.29, t + 0.06], [0.31, Math.min(0.98, t + 0.16)], [0.317 + 0.035 * sh, 1.07], [0.317 + 0.03 * sh, 1.13], [0.257, 1.2], [0.19, 1.24], [0.165, 1.255]], (y, c) => c.copy(t0)), tp = tg.attributes.position, Y0 = 1.08, Y1 = 1.255, sF = BF.sportScoopFront ?? 0.11, sB = BF.sportScoopBack ?? 0.06, rim = [];
            for (let k = 0; k < tp.count; k++) { const x = tp.getX(k), y = tp.getY(k), z = tp.getZ(k); if (y <= Y0) continue; const az = Math.atan2(x, z), c2 = Math.cos(az), d = (c2 > 0 ? sF : sB) * c2 * c2 * Math.pow((y - Y0) / (Y1 - Y0), 1.3); tp.setY(k, y - d); if (y > Y1 - 0.001) rim.push([az, x, y - d, z]); }
            cvn(tg); M(tg, vcToon, 0, lift, 0, body, 0.026);
            if (rim.length > 6) { rim.sort((a2, b2) => a2[0] - b2[0]); const pts = []; for (const [, x, y, z] of rim) { if (!pts.length || Math.hypot(pts[pts.length - 1].x - x, pts[pts.length - 1].z - z) > 0.01) pts.push(new THREE.Vector3(x * 1.02, y + lift + 0.004, z * 1.02)); }
              M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.017, 6, true), trimM, 0, 0, 0, body, 0); }
            const ub = M(new THREE.TorusGeometry(0.284, 0.032, 8, 28), trimM, 0, t + 0.02 + lift, 0, body, 0.004); ub.rotation.x = Math.PI / 2; ub.scale.set(1, 1.1, 1);
            for (const sx of [-1, 1]) { const ah = M(new THREE.TorusGeometry(0.118, 0.017, 6, 20), trimM, sx * (rr - 0.005), 1.04 + lift, 0, body, 0); ah.rotation.set(0, Math.PI / 2, 0); ah.scale.set(1, 1.25, 1); } }
          else {   // a ribbed tank top: wide straps over each shoulder (narrow for the MUSCLE cut), deep armholes trimmed, a V-neck trim, side panels
            const musc = tankCut === 'muscle', tm = toon(torso[1]), rr = 0.3 + 0.03 * sh;
            // s608 Ben: a real tank-top neckline: the top is open round the neck and SCOOPS down a little below the chin at the front, less at the back
            const tg = lathe([[0, 0.62], [0.285, 0.62], [0.29, 0.95], [0.317 + 0.035 * sh, 1.07], [0.317 + 0.03 * sh, 1.13], [0.257, 1.2], [0.19, 1.24], [0.165, 1.255]], (y, c) => c.copy(t1)), tp = tg.attributes.position, Y0 = 1.1, Y1 = 1.255, sF = BF.scoopFront ?? 0.09, sB = BF.scoopBack ?? 0.035, rim = [];
            for (let k = 0; k < tp.count; k++) { const x = tp.getX(k), y = tp.getY(k), z = tp.getZ(k); if (y <= Y0) continue; const az = Math.atan2(x, z), c2 = Math.cos(az), d = (c2 > 0 ? sF : sB) * c2 * c2 * Math.pow((y - Y0) / (Y1 - Y0), 1.3); tp.setY(k, y - d); if (y > Y1 - 0.001) rim.push([az, x, y - d, z]); }
            cvn(tg); M(tg, vcToon, 0, lift, 0, body, 0.026);
            if (rim.length > 6) { rim.sort((a2, b2) => a2[0] - b2[0]); const pts = []; for (const [, x, y, z] of rim) { if (!pts.length || Math.hypot(pts[pts.length - 1].x - x, pts[pts.length - 1].z - z) > 0.01) pts.push(new THREE.Vector3(x * 1.02, y + lift + 0.004, z * 1.02)); }
              M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.017, 6, true), main, 0, 0, 0, body, 0); }
            for (let k = 0; k < 5; k++) M(new THREE.TorusGeometry(0.288, 0.006, 4, 30), toon('#' + new THREE.Color(torso[1]).multiplyScalar(0.88).getHexString()), 0, 0.68 + k * 0.06 + lift, 0, body, 0).rotation.x = Math.PI / 2;
            for (const sx of [-1, 1]) {   // s608 Ben: no long strap slabs; the shirt itself goes over the shoulder (like the female top), armholes trimmed
              const ah = M(new THREE.TorusGeometry(musc ? 0.13 : 0.115, 0.016, 6, 20), main, sx * (rr - 0.005), (musc ? 1.01 : 1.04) + lift, 0, body, 0); ah.rotation.set(0, Math.PI / 2, 0); ah.scale.set(1, 1.25, 1);
              M(new THREE.BoxGeometry(0.03, 0.42, 0.06), main, sx * 0.29, 0.82 + lift, 0, body, 0.004); }
          } }
        furLegs();
        const boxing = kind === 'boxsport' || kind === 'boxtank';
        P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.38, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
          M(new THREE.CapsuleGeometry(0.065, 0.24, 4, 10), fur, 0, -0.2, 0, p, 0.018);
          if (boxing) { const dl = M(new THREE.SphereGeometry(0.085, 14, 10), fur, 0, -0.035, 0, p, 0.014, 0.085); dl.scale.set(1.05 * sh, 1.15 * sh, 1.05 * sh); const bi = M(new THREE.SphereGeometry(0.07, 12, 8), fur, 0, -0.16, 0.012, p, 0.01, 0.07); bi.scale.set(0.95, 1.4, 0.95); const gl = M(new THREE.SphereGeometry(0.15, 14, 10), dark, 0, -0.42, 0.03, p, 0.022, 0.15); gl.scale.set(1, 1.05, 1.2); M(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12), toon('#fbf8ec'), 0, -0.31, 0.01, p, 0.008, 0.1); }
          else pawFist(p, L); return p; });
        if (L.sportCrest && crest) badge(0, kind === 'trunks' || kind === 'boxtank' ? 0.62 : 1.0, 0.3, 0.075, -0.1);   /* s686 Ben: a hero's crest on swim / boxing kit (opt-in: look.sportCrest; the s684 pass sits it on the cloth) */
      } else if (kind === 'suit') {   // fitted jacket, lapels, cravat
        M(lathe([[0, 0.42], [0.24, 0.42], [0.29, 0.5], [0.26, 0.66], [0.27, 0.95], [0.33, 1.12], [0.24, 1.21], [0.1, 1.26], [0, 1.27]], (y, c) => c.copy(t1).lerp(t2, smooth(0.7, 0.4, y))), vcToon, 0, lift, 0, body, 0.03);
        for (const sx of [-1, 1]) { const lp = M(new THREE.BoxGeometry(0.1, 0.36, 0.025), C.dark, sx * 0.09, 1.02 + lift, 0.32, body, 0.008); lp.rotation.set(-0.2, 0, sx * 0.32); }
        M(new THREE.BoxGeometry(0.1, 0.2, 0.03), C.cream, 0, 1.08 + lift, 0.33, body, 0).rotation.x = -0.2;
        M(new THREE.OctahedronGeometry(0.05, 0), C.gold, 0, 1.12 + lift, 0.355, body, 0.008).scale.set(1, 0.7, 0.4);
        for (let k = 0; k < 2; k++) M(new THREE.SphereGeometry(0.022, 8, 6), C.gold, 0, 0.75 + k * 0.1 + lift, 0.31, body, 0);
        M(new THREE.TorusGeometry(0.262, 0.026, 8, 28), C.dark, 0, 0.6 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        M(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 22), C.cream, 0, 1.24 + lift, 0, body, 0.012, 0.2);
        badge(-0.17, 1.02, 0.31, 0.055);
        P.arms = sleeve(C.mid, C.cream);
      } else if (kind === 'royal') {  // the King: gown, cape, ermine
        M(lathe([[0.36, 0.06], [0.4, 0.08], [0.36, 0.4], [0.3, 0.7], [0.3, 0.95], [0.34, 1.12], [0.24, 1.22], [0.12, 1.26], [0, 1.27]], (y, c) => c.copy(t1).lerp(t0, smooth(0.3, 1.1, y))), vcToon, 0, lift - 0.02, 0, body, 0.03);
        const cape = M(new THREE.CylinderGeometry(0.34, 0.52, 1.18, 28, 1, true, Math.PI * 0.62, Math.PI * 0.76), toon('#c42d3c', { side: THREE.DoubleSide }), 0, 0.62 + lift, -0.02, body, 0.03); cape.material.side = THREE.DoubleSide;
        const erm = toon('#ffffff'); M(new THREE.TorusGeometry(0.28, 0.08, 10, 30), erm, 0, 1.18 + lift, 0, body, 0.02).rotation.x = Math.PI / 2;
        for (let k = 0; k < 10; k++) { const a2 = k / 10 * Math.PI * 2; M(new THREE.BoxGeometry(0.025, 0.04, 0.02), C.ink, Math.sin(a2) * 0.35, 1.18 + lift, Math.cos(a2) * 0.35, body, 0).rotation.y = a2; }
        M(new THREE.TorusGeometry(0.38, 0.05, 8, 30), erm, 0, 0.08 + lift, 0, body, 0.012).rotation.x = Math.PI / 2;
        M(new THREE.TorusGeometry(0.3, 0.035, 8, 28), C.gold, 0, 0.72 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        badge(0, 0.98, 0.34, 0.11);
        P.arms = sleeve(C.mid, erm, true);
        P.legs.forEach(p => p.visible = false);
      }
    }
    // head
    const head = new THREE.Group(); head.position.y = 1.6 + lift + (L.headScale - 1) * 0.3; head.scale.setScalar(L.headScale); body.add(head); P.head = head;
    const LOD = (merged ?? MERGE_DEFAULT) && FOX_PHONE && !CAST_KEYS.has(key), skull = M(foxSkull(0.4, LOD ? 26 : 40, LOD ? 20 : 30, null, 0, 0, 0, L), fur, 0, 0, 0, head, 0.04, 0.4); skull.scale.set(L.headWidth, L.headHeight, 1);
    const SZ = 0.3, SL = L.snoutLength * 1.6, tipZ = SZ + 0.345 * SL; const snoutMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, emissive: new THREE.Color(L.snout || L.muzzle), emissiveIntensity: 0.32 }); const snout = M(snoutGeoFor(L), snoutMat, 0, -0.06, SZ, head, 0.022); snout.scale.set(L.snoutSize * 0.86, L.snoutSize * 0.92, SL); snout.rotation.x = 0.02; P.snout = snout;
    { // NOSE BRIDGE: a fur ridge that rounds up from the forehead and runs down the top of the snout, so the profile is one curve
      const bg = new THREE.SphereGeometry(1, LOD ? 12 : 20, LOD ? 9 : 14), p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i); p.setY(i, y - Math.max(0, z) * 0.35 * (y > 0 ? 0.6 : 1)); } p.needsUpdate = true; cvn(bg);
      const br = M(bg, fur, 0, 0.07, SZ + 0.02, head, 0.022); br.scale.set(0.15 * L.snoutSize, 0.15, 0.27 * SL + 0.08); br.rotation.x = 0.22; P.bridge = br; }

    P.nose = M(new THREE.SphereGeometry(0.055, 14, 10), toon(L.nose), 0, -0.045, tipZ, head, 0.012, 0.055); P.nose.scale.set(1.3 * L.snoutSize, 0.85 * L.snoutSize, 0.9);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); shine.position.set(-0.02, -0.027, tipZ + 0.048); head.add(shine); P.shine = shine;
    const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fctx = fc.getContext('2d');
    const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 4;
    const faceMat = new THREE.MeshToonMaterial({ map: ftex, transparent: true, alphaTest: 0.04, gradientMap: grad, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });   // s609r: stronger, the coarse skull's chords poke out under the muzzle (concave chin)
    const mask = new THREE.Mesh(foxSkull(0.405, LOD ? 26 : 40, LOD ? 22 : 32, Math.PI / 2 - 0.85, 1.7, Math.PI / 2 - 0.75, 1.5, L), faceMat); skull.add(mask);
    // s609j SIDES OF THE FACE + CHEEK RUFF (Ben). (1) CHEEK PATCH: a cream shell hugging the lower side of the skull, from under the eye back
    // toward the jaw hinge, vertex-coloured so the fur blends into it (orange at the top edge → cream), its lower edge pinked into points.
    // (2) RUFF: the old 2 cones are now a fan of curved, tapered locks per side (lockGeo) sweeping back + out + a little down, longest in the
    // middle, rooted on the cheek and sunk in, cream at the root → white tips, inked; a short second layer underneath for depth; they
    // spring with head turns + puff out when shocked (P.ruff, animFox). L.fluffSize scales them (0 = none).
    P.ruff = []; if (L.fluffSize > 0.05) { const FS = L.fluffSize, hw = L.headWidth, hh = L.headHeight, cFl = new THREE.Color(L.fluff || L.muzzle), cW = cFl.clone().lerp(new THREE.Color('#ffffff'), 0.6), cFur = new THREE.Color(L.fur), cIn = cFl.clone().lerp(cFur, 0.18);
      const rc = new THREE.Raycaster(), sk0 = new THREE.Mesh(skull.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), dv = new THREE.Vector3();
      const surf = (x, y, z) => { dv.set(x, y, z).normalize(); rc.set(dv.clone().multiplyScalar(2), dv.clone().negate()); const p = ffSkullHit(rc, sk0, dv); return new THREE.Vector3(p.x * hw, p.y * hh, p.z); };
      for (const s of [-1, 1]) {
        // cheek patch: a band of the skull itself (foxSkull, a hair larger, child of the skull so it follows every head shape), cream with the
        // fur blending in along the top + back edges, the lower edge cut into points
        { const ph0 = s > 0 ? Math.PI / 2 + 0.5 : Math.PI / 2 - 1.6, g = foxSkull(0.407, LOD ? 12 : 22, LOD ? 6 : 12, ph0, 1.1, 1.58, 0.62, L), p = g.attributes.position, cc = [], c = new THREE.Color(), NW = (LOD ? 12 : 22) + 1, NH = (LOD ? 6 : 12) + 1;
          for (let i = 0; i < p.count; i++) { const iu = i % NW, iv = Math.floor(i / NW), u = iu / (NW - 1), v = iv / (NH - 1), back = s > 0 ? u : 1 - u;
            const dx = (back - 0.38) / 0.42, dy = (v - 0.62) / 0.5, e = Math.sqrt(dx * dx + dy * dy), tuft = 0.5 + 0.5 * Math.cos(back * Math.PI * 7), pt = v > 0.7 ? tuft * (v - 0.7) / 0.3 : 0;   // soft oval of cream, low + forward, the bottom edge breaking into points
            const k = Math.min(1, Math.max(0, (e - 0.62 - pt * 0.35) / 0.3)); c.copy(cIn).lerp(cFur, k * k * (3 - 2 * k)); cc.push(c.r, c.g, c.b); }
          g.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3)); cvn(g); skull.add(new THREE.Mesh(g, vcToon)); }
        // s609t CHEEK POINTS, final polish (Ben). 2 per side. Each one GROWS OUT of the cheek: its root starts inside the head along the cheek's own
        // surface normal (so there is no stuck-on blob or hard seam), widens where it leaves the fur, then tapers to a fine tip that flicks UP
        // a little at the end (the fox cheek tuft). Flattened like a lock of fur, cream at the root blending to white, inked only past the root.
        // A soft cream wisp sits over each root to blend the join, and a tiny under-tuft fills the gap between the two.
        const fan = [[-0.13, 0.78, 0.09, 0.5, 0.0], [-0.23, 0.67, 0.06, 0.85, 0.05]];   // s609v (Ben): both a little lower + pointing a little more down   // s609u (Ben): shorter, top one straighter
        fan.forEach(([y, ln, zf, dn, hook], j) => { const at = surf(s * 0.39, y, zf + 0.04), nrm = new THREE.Vector3(at.x / hw, at.y / hh, at.z).normalize(), L2 = 0.1 * ln * Math.sqrt(FS), cs = Math.cos(dn), sn = Math.sin(dn), W = 0.052 * Math.min(1.25, Math.sqrt(FS));
          const dir = new THREE.Vector3(s * cs, -sn, -0.38).normalize(), up = new THREE.Vector3(0, 1, 0);
          const P0 = nrm.clone().multiplyScalar(-0.045), P1 = nrm.clone().multiplyScalar(0.01).addScaledVector(dir, L2 * 0.25);
          const P2 = P1.clone().addScaledVector(dir, L2 * 0.42), P3 = P2.clone().addScaledVector(dir, L2 * 0.38).addScaledVector(up, L2 * hook * 0.6), P4 = P3.clone().addScaledVector(dir, L2 * 0.22).addScaledVector(up, L2 * hook * 1.2);
          const geo = lockGeo([P0, P1, P2, P3, P4], W, 0.62, cIn, cW, LOD ? 6 : 10, LOD ? 5 : 7), gr = new THREE.Group(); gr.position.copy(at); head.add(gr);
          const m = new THREE.Mesh(geo, vcToon); m.castShadow = true; gr.add(m); m.add(new THREE.Mesh(inflate(geo, 0.0065), outlineMat));
          const wisp = M(new THREE.SphereGeometry(1, 10, 8), toon(L.fluff || L.muzzle), 0, 0, 0, gr, 0); wisp.scale.set(W * 0.95, W * 0.7, W * 0.55); wisp.position.copy(nrm).multiplyScalar(0.004).addScaledVector(dir, L2 * 0.1); wisp.lookAt(wisp.position.clone().add(nrm).add(gr.position)); 
          gr.userData = { s, w: 0.72 + j * 0.1, layer: 0 }; P.ruff.push(gr); });
         } }
    // s609i HAIR + TOP OF THE HEAD (Ben's deep dive). (1) CROWN SHADING: a cap over the skull top, vertex-coloured: fur at the brow line deepening
    // to a darker crown + a darker stripe down the middle of the forehead, so the top of the head reads as a shape, not a flat dome.
    // (2) FORELOCK: 5 curved, tapered locks rooted along an arc on the front of the crown, rising then sweeping forward + to one side,
    // tips curling down; root fur → dark tips. (3) CROWN FRINGE + NAPE: short locks round the back of the crown and down the nape so the
    // silhouette is furry from every side. Locks are springs: they lag + bounce with head turns, hops and steps, and stand up in shock.
    // L.headTuft scales the hair (0 = none: helmets set it to 0). All locks sit ON the actual skull surface (raycast), sunk at the root.
    { const cF = new THREE.Color(L.fur), cD = new THREE.Color(L.furDark), cap = foxSkull(0.4, LOD ? 24 : 36, LOD ? 8 : 12, 0, Math.PI * 2, 0, 0.78, L), cp = cap.attributes.position, cc = [], c = new THREE.Color();
      for (let i = 0; i < cp.count; i++) { const x = cp.getX(i) / 0.4, y = cp.getY(i) / 0.4, z = cp.getZ(i) / 0.4, edge = Math.max(0, Math.min(1, (y - 0.42) / 0.3)), back = Math.max(0, -z) * 0.5, stripe = Math.exp(-Math.pow(x / 0.13, 2)) * Math.max(0, Math.min(1, z * 2.2 + 0.2)) * 0.55;
        c.copy(cF).lerp(cD, Math.min(0.75, edge * (0.28 + back) + stripe * edge)); cc.push(c.r, c.g, c.b); }
      cap.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3)); const capM = new THREE.Mesh(cap, vcToon); capM.scale.setScalar(1.006); skull.add(capM); }
    P.hair = []; if (L.headTuft > 0.05) { const hw = L.headWidth, hh = L.headHeight, HT = L.headTuft, rc = new THREE.Raycaster(), sk0 = new THREE.Mesh(skull.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), sv = new THREE.Vector3(), dv = new THREE.Vector3();
      const surf = (x, y, z) => { dv.set(x / hw, y / hh, z).normalize(); rc.set(sv.copy(dv).multiplyScalar(2), dv.clone().negate()); const p = ffSkullHit(rc, sk0, dv); return new THREE.Vector3(p.x * hw, p.y * hh, p.z); };
      const cF = new THREE.Color(L.fur), cD = new THREE.Color(L.furDark), cMid = cF.clone().lerp(cD, 0.45), seg = LOD ? 6 : 10, sides = LOD ? 5 : 7;
      const sw = L.hairBow && L.hairBow !== 'none' ? -Math.sign(L.bowSide ?? 0.55) || -1 : 1;   // sweep away from a hair bow
      const add = (root, pts, r0, flat, cT, w, kind, ol = 0.009) => { const g = new THREE.Group(); g.position.copy(root); head.add(g); const geo = lockGeo(pts.map(p => new THREE.Vector3(...p)), r0, flat, cF, cT, seg, sides);
        const m = new THREE.Mesh(geo, vcToon); m.castShadow = true; g.add(m); if (ol > 0) m.add(new THREE.Mesh(inflate(geo, ol), outlineMat)); g.userData = { w, kind, bx: 0, bz: 0 }; P.hair.push(g); return g; };
      // FORELOCK (front of the crown)
      [[-0.13, 0.78, 0.8], [-0.065, 0.95, 0.95], [0, 1.1, 1.0], [0.065, 0.98, 1.1], [0.13, 0.8, 1.25]].forEach(([x, ln, sp], j) => { const root = surf(x, 0.88, 0.46 - Math.abs(x) * 0.5), L2 = 0.09 * ln * HT, s2 = sw * sp, wob = (j % 2 ? 1 : -1) * 0.01;
        add(root, [[0, -0.035, -0.01], [s2 * 0.012 + x * 0.1, L2 * 0.3, 0], [s2 * 0.045 + wob + x * 0.2, L2 * 0.6, L2 * 0.2], [s2 * 0.085 + x * 0.25, L2 * 0.7, L2 * 0.5], [s2 * 0.11 - wob + x * 0.28, L2 * 0.54, L2 * 0.76]], 0.064 - Math.abs(x) * 0.12, 0.72, cD, 1.0 - Math.abs(x) * 2.5, 'front', 0.008); });
      // CROWN FRINGE (back of the crown, between + behind the ears)
      for (let j = 0; j < 7; j++) { const a = (j / 6 - 0.5) * 2.1, x = Math.sin(a) * 0.62, z = -Math.cos(a) * 0.62, root = surf(x, 0.66, z), L2 = (0.085 + (j % 2) * 0.02) * HT, ox = Math.sin(a), oz = -Math.cos(a);
        add(root, [[0, -0.025, 0], [ox * L2 * 0.4, L2 * 0.16, oz * L2 * 0.4], [ox * L2 * 0.85, L2 * 0.04, oz * L2 * 0.85], [ox * L2 * 1.15, -L2 * 0.2, oz * L2 * 1.1]], 0.05, 0.55, cF.clone().lerp(cD, 0.3), 0.5, 'crown', 0); }
      // NAPE (down the back of the head into the collar)
      if (!(key === 'player' || L.napeHair === false)) for (let j = 0; j < 5; j++) { const a = (j / 4 - 0.5) * 1.5, x = Math.sin(a) * 0.5, root = surf(x, -0.02, -0.86),   /* s663d Ben: no nape locks on the player (top + crown hair kept) */ L2 = (0.1 + (j === 2 ? 0.025 : 0)) * HT;
        add(root, [[0, 0.025, 0.025], [x * 0.08, -L2 * 0.25, -L2 * 0.3], [x * 0.13, -L2 * 0.65, -L2 * 0.36], [x * 0.16, -L2 * 1.0, -L2 * 0.22]], 0.055, 0.5, cF.clone().lerp(cD, 0.15), 0.35, 'nape', 0); }
      if (crown || headGuard) P.hair.forEach(h => { if (h.userData.kind !== 'nape') h.visible = false; }); }
    // s609h EARS (Ben: "a BIIIG improve on the ears and where they meet the head"): one cupped SHELL per ear (convex back, hollow front,
    // thick at the root, thin at the tip, tip bending back, root curving down to sit on the round skull), vertex-coloured: fur at the root
    // shading into the dark back + a dark rim round a pink inner bowl that fades to cream at the base, a fan of cream fluff in the bowl, and a
    // fur ROOT on the head shaped + tilted to the ear's own base so the ear grows OUT of the head (sunk below it, no seam when it moves).
    const earG = earShell(L), earO = inflate(earG, 0.016);
    P.ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.24 * L.earSpread, 0.27 * L.headHeight / 0.96, -0.02 - L.earBack * 0.12); e.rotation.order = 'ZXY'; e.rotation.z = -s * L.earTilt; e.rotation.y = s * 0.16; e.scale.set(L.earWidth, L.earHeight, 1); e.userData.baseTilt = L.earTilt; e.userData.baseX = -L.earBack * 0.4; e.userData.baseY = s * 0.16; head.add(e);
      const sh = new THREE.Mesh(earG, vcToon); e.add(sh); sh.add(new THREE.Mesh(earO, outlineMat));
      const flc = toon(L.fluff || L.muzzle);
      for (const [x, h, rz, rx] of [[0, 0.2, 0, 0.32], [-0.045, 0.16, 0.32, 0.36], [0.045, 0.16, -0.32, 0.36], [-0.08, 0.1, 0.62, 0.4], [0.08, 0.1, -0.62, 0.4], [-0.02, 0.13, 0.15, 0.55], [0.025, 0.12, -0.18, 0.55]]) {
        const t = M(new THREE.ConeGeometry(0.024, h, 5), flc, x, 0.0 + h * 0.42, 0.018 - Math.abs(x) * 0.15, e, 0); t.rotation.set(rx - 0.3, 0, rz); }   // cream fluff fanning out of the bowl
      // the ROOT: a fur mound on the skull, as wide as the ear base and tilted with it, a darker ring where the back of the ear starts, + tufts over the seam
      const rt = new THREE.Group(); rt.position.copy(e.position); rt.position.y -= 0.055; rt.rotation.z = -s * L.earTilt * 0.85; head.add(rt);
      const mnd = M(new THREE.SphereGeometry(1, 18, 12), fur, 0, 0, -0.01, rt, 0); mnd.scale.set(0.175 * L.earWidth, 0.07, 0.12);
      for (const [dx, h, rz] of [[-0.11, 0.07, 0.8], [-0.04, 0.08, 0.3], [0.04, 0.075, -0.25], [0.11, 0.065, -0.7]]) { const t = M(new THREE.ConeGeometry(0.026, h, 5), fur, dx * L.earWidth, 0.035, 0.075, rt, 0); t.rotation.set(0.9, 0, rz); }
      
      return e; });
    if (bow) { const b = new THREE.Group(); b.position.set(0, 0.36, 0.12); b.rotation.x = -0.35; head.add(b);
      const wm = L.hopeBowCol ? toon(L.hopeBowCol) : white, gc = L.hopeBowGem || '#38bdf8';   /* s668 Hope's bow colours (Fox Workshop: HOPE'S BOW) */
      for (const s of [-1, 1]) { const w = M(new THREE.SphereGeometry(1, 14, 10), wm, s * 0.11, 0, 0, b, 0.012); w.scale.set(0.11, 0.075, 0.045); w.rotation.z = s * 0.25; }
      M(new THREE.BoxGeometry(0.075, 0.07, 0.06), toon(L.hopeBowKnot || '#1e293b'), 0, 0, 0.01, b, 0.01); M(new THREE.SphereGeometry(0.018, 6, 4), toon(gc, { emissive: new THREE.Color(gc), emissiveIntensity: 0.6 }), 0, 0, 0.045, b, 0); }
    // s608 HAIR BOW (look keys, Fox Workshop): hairBow 'bow' | 'ribbon' | 'lace' (none by default, so NPCs are unchanged), bowCol, bowCol2, bowSize, bowSide (-1..1 round the head), bowTilt
    if (L.hairBow && L.hairBow !== 'none') { const st = L.hairBow, c1 = L.bowCol || '#ec4899', c2 = L.bowCol2 || '#' + new THREE.Color(c1).multiplyScalar(0.7).getHexString();
      const m1 = toon(c1), m2 = toon(c2), mIn = toon('#' + new THREE.Color(c1).multiplyScalar(0.78).getHexString()), hw = L.headWidth || 1, hh = L.headHeight || 1;
      const side = L.bowSide ?? 0.55, ang = side * 1.25, pol = 0.62 - Math.abs(side) * 0.05, r0 = 0.42;
      const n = new THREE.Vector3(Math.sin(ang) * Math.sin(pol) * hw, Math.cos(pol) * hh, Math.cos(ang) * Math.sin(pol)).normalize();
      // sit it ON the skull: find the skull's real surface along n (the vertices that point that way) instead of guessing a radius
      let rs = r0; try { const sp = skull.geometry.attributes.position, v = new THREE.Vector3(); let sum = 0, cnt = 0, best = 0;
        for (let k = 0; k < sp.count; k++) { v.fromBufferAttribute(sp, k).multiply(skull.scale).add(skull.position); const d = v.length(), dot = v.dot(n) / (d || 1); if (dot > 0.985) { sum += d; cnt++; } if (dot > best) { best = dot; rs = d; } }
        if (cnt) rs = sum / cnt; } catch (e) {}
      const bg = new THREE.Group(); bg.position.copy(n).multiplyScalar(rs + 0.008); bg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); bg.rotateZ((L.bowTilt || 0) + side * 0.35); bg.scale.setScalar((L.bowSize || 1) * 0.92); head.add(bg);
      const ex = (shape, d = 0.028) => new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 10 });
      const loopS = (k = 1) => { const s2 = new THREE.Shape(); s2.moveTo(0, 0); s2.bezierCurveTo(0.05 * k, 0.1 * k, 0.21 * k, 0.12 * k, 0.21 * k, 0.0); s2.bezierCurveTo(0.21 * k, -0.12 * k, 0.05 * k, -0.1 * k, 0, 0); return s2; };
      const bowAt = (grp, sc = 1) => { const b = new THREE.Group(); b.scale.setScalar(sc); grp.add(b);
        if (st === 'lace') {   // a white lace edge peeking round each loop: a dotted, scalloped canvas cut out with alphaTest
          const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x2 = cv.getContext('2d'); x2.fillStyle = '#ffffff'; x2.fillRect(0, 0, 64, 64); x2.globalCompositeOperation = 'destination-out';
          for (const [px, py, pr] of [[16, 16, 7], [48, 16, 7], [16, 48, 7], [48, 48, 7], [32, 32, 9], [32, 0, 4], [0, 32, 4], [64, 32, 4], [32, 64, 4]]) { x2.beginPath(); x2.arc(px, py, pr, 0, Math.PI * 2); x2.fill(); }
          const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(30, 30);
          const laceM = new THREE.MeshToonMaterial({ color: L.bowCol2 || '#ffffff', alphaMap: tx, alphaTest: 0.5, transparent: true, side: THREE.DoubleSide, gradientMap: grad });
          for (const s of [-1, 1]) { const lc = new THREE.Mesh(new THREE.ShapeGeometry(loopS(1.28), 16), laceM); lc.position.set(s * 0.01, 0, -0.012); lc.scale.x = s; b.add(lc); } }
        for (const s of [-1, 1]) { const lp = M(ex(loopS()), m1, 0, 0, -0.014, b, 0.008); lp.scale.x = s; lp.rotation.z = s * 0.08;
          const fold = M(new THREE.ShapeGeometry(loopS(0.55), 8), mIn, s * 0.025, 0, 0.03, b, 0); fold.scale.x = s; fold.rotation.z = s * 0.08;
          const tl = new THREE.Shape(); tl.moveTo(-0.028, 0); tl.lineTo(0.028, 0); tl.lineTo(0.07, -0.17); tl.lineTo(0.045, -0.15); tl.lineTo(0.03, -0.185); tl.lineTo(-0.012, -0.02); tl.lineTo(-0.028, 0);
          const tm = M(ex(tl, 0.012), st === 'lace' ? m1 : m1, s * 0.012, -0.02, -0.01, b, 0.006); tm.scale.x = s; tm.rotation.z = s * 0.12; }
        const kn = M(new THREE.SphereGeometry(0.045, 14, 10), m2, 0, 0, 0.018, b, 0.008, 0.045); kn.scale.set(0.95, 1.15, 0.8);
        M(new THREE.SphereGeometry(0.012, 8, 6), toon('#ffffff'), -0.012, 0.018, 0.052, b, 0); return b; };
      if (st === 'ribbon') {   // an alice band over the crown, ear to ear, with a small bow on it
        const band = M(new THREE.TorusGeometry(r0 + 0.012, 0.024, 8, 40, Math.PI), m1, 0, 0.03, 0.06, head, 0.006); band.rotation.set(-0.38, 0, 0); band.scale.set(hw * 1.02, hh * 1.03, 1);
        for (const s of [-1, 1]) M(new THREE.TorusGeometry(r0 + 0.012, 0.008, 5, 40, Math.PI), m2, 0, 0.03, 0.06 + s * 0.018, head, 0).rotation.set(-0.38, 0, 0);
        bowAt(bg, 0.7); } else bowAt(bg, 1); }
    // s608 RING-WALK ROBE: a satin boxing robe, open at the front, shawl collar, sleeves, a tied belt, a hood folded down at the back, a gold 8 patch on the back
    if (boxRobe) { const rc = robeCol || (torso && torso[0]) || '#c0392b', tc = (torso && torso[1]) || '#f3f2f2', rM = toon(rc, { side: THREE.DoubleSide }), tM = toon(tc), lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;
      const rb = new THREE.CylinderGeometry(0.335, 0.47, 0.84, 34, 2, true, 0.42, Math.PI * 2 - 0.84); rb.translate(0, -0.42, 0); const rm = M(rb, rM, 0, 1.24 + lift0, 0, body, 0.012); rm.scale.z = 1.1;
      for (const s of [-1, 1]) { const a = s * 0.42, lp = M(new THREE.BoxGeometry(0.055, 0.84, 0.03), tM, Math.sin(a) * 0.41, 0.82 + lift0, Math.cos(a) * 0.41 * 1.1, body, 0.004); lp.rotation.set(0.12, a, s * 0.1); }
      M(new THREE.TorusGeometry(0.29, 0.07, 10, 30), tM, 0, 1.22 + lift0, -0.01, body, 0.008).rotation.x = Math.PI / 2;
      const hood = M(new THREE.SphereGeometry(0.22, 16, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), rM, 0, 1.27 + lift0, -0.33, body, 0.01, 0.22); hood.scale.set(1.2, 0.7, 0.9); hood.rotation.x = -0.4;
      const belt = M(new THREE.TorusGeometry(0.335, 0.03, 6, 30), tM, 0, 0.74 + lift0, 0, body, 0); belt.rotation.x = Math.PI / 2; belt.scale.y = 1.1;
      M(new THREE.SphereGeometry(0.045, 10, 8), tM, 0.12, 0.74 + lift0, 0.36, body, 0.006); for (const s of [-1, 1]) { const tl = M(new THREE.BoxGeometry(0.04, 0.22, 0.02), tM, 0.12 + s * 0.025, 0.62 + lift0, 0.37, body, 0.004); tl.rotation.z = s * 0.18; }
      const pt = M(new THREE.CircleGeometry(0.13, 28), toon('#e6b45a'), 0, 1.0 + lift0, -0.5, body, 0); pt.rotation.y = Math.PI; const p8 = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshBasicMaterial({ map: crestTex('8', '#38bdf8'), transparent: true })); p8.position.set(0, 1.0 + lift0, -0.505); p8.rotation.y = Math.PI; body.add(p8);
      (P.arms || []).forEach(p => { M(new THREE.CapsuleGeometry(0.09, 0.2, 4, 10), rM, 0, -0.18, 0, p, 0.012); M(new THREE.TorusGeometry(0.09, 0.016, 5, 16), tM, 0, -0.3, 0, p, 0).rotation.x = Math.PI / 2; }); }
    // s608 HEAD GUARD (sparring): padded cap, forehead + cheek pads, chin strap, open face, ears through
    if (headGuard) { const gc = typeof headGuard === 'string' ? headGuard : (torso && torso[0]) || '#c0392b', gM = toon(gc), wM = toon('#f3f2f2'), hw = L.headWidth || 1, hh = L.headHeight || 1, g = new THREE.Group(); g.position.set(0, 0.0, -0.01); g.rotation.x = -0.18; g.scale.set(hw * 1.06, hh * 1.02, 1.08); head.add(g);
      M(new THREE.SphereGeometry(0.43, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.42), gM, 0, 0.02, 0, g, 0.014, 0.43);
      const fh = M(new THREE.TorusGeometry(0.4, 0.06, 10, 26, Math.PI * 0.55), gM, 0, 0.12, 0, g, 0.01); fh.rotation.set(Math.PI / 2, 0, Math.PI * 0.225);
      for (const s of [-1, 1]) { const cp = M(new THREE.CapsuleGeometry(0.07, 0.14, 4, 10), gM, s * 0.33, -0.08, 0.16, g, 0.01); cp.rotation.set(0.2, 0, s * 0.15); M(new THREE.TorusGeometry(0.075, 0.012, 5, 14), wM, s * 0.33, -0.08, 0.24, g, 0); }
      const ch = M(new THREE.TorusGeometry(0.31, 0.018, 6, 24, Math.PI), toon('#201e1d'), 0, -0.12, 0.1, g, 0); ch.rotation.set(0, 0, Math.PI);
      M(new THREE.BoxGeometry(0.05, 0.2, 0.42), wM, 0, 0.42, -0.02, g, 0.006); }
    if (L.elder) {
      const beardM = toon(L.beard || '#eef0f4');
      for (let i = 0; i < 7; i++) { const t2 = (i - 3) / 3, b = M(new THREE.ConeGeometry(0.075, 0.26 - Math.abs(t2) * 0.06, 6), beardM, t2 * 0.2, -0.33 + Math.abs(t2) * 0.05, 0.2 - Math.abs(t2) * 0.06, head, 0.014); b.rotation.set(Math.PI - 0.35, 0, t2 * 0.35); }
      for (const s of [-1, 1]) { const tm = M(new THREE.SphereGeometry(0.13, 12, 8), beardM, s * 0.36, 0.1, -0.05, head, 0.012, 0.13); tm.scale.set(0.5, 0.9, 1); }
    }
    /* s673 HATS (Ben: every avatar, HAT on / off + size, up / down, left / right): L.hat = 'none' | 'crown' | 'top' | 'cap' | 'beanie' | 'cowboy' | 'wizard';
       L.hatSize (1), L.hatY (up / down, m), L.hatX (left / right, m), L.hatColor, L.hatBand. A crowned fox (King Might) is L.hat 'crown' unless the look says otherwise. */
    const hatK = L.hat ?? (crown ? 'crown' : 'none'); crown = false;
    if (hatK && hatK !== 'none') { const hg = new THREE.Group(); hg.name = 'hat'; hg.position.set(L.hatX || 0, 0.36 + (L.hatY || 0), -0.02 + (L.hatZ || 0));   /* s673b hatZ = forward / backward */ hg.rotation.set(-0.12, 0, -(L.hatX || 0) * 1.2); hg.scale.setScalar(L.hatSize || 1); head.add(hg); P.hat = hg;
      const hc = toon(L.hatColor || ({ top: '#1f2937', cap: '#2563eb', beanie: '#dc2626', cowboy: '#92400e', wizard: '#4338ca' }[hatK] || '#e6b45a')), hb = toon(L.hatBand || ({ top: '#b91c1c', cap: '#f3f2f2', beanie: '#f3f2f2', cowboy: '#3b1d0a', wizard: '#fde047' }[hatK] || '#c42d3c'));
      if (hatK === 'crown') { const gold = toon(L.hatColor || '#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.4 });
        M(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 20, 1, true), gold, 0, 0, 0, hg, 0.015, 0.22);
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; M(new THREE.ConeGeometry(0.045, 0.14, 4), gold, Math.sin(a) * 0.2, 0.11, Math.cos(a) * 0.2, hg, 0.01); M(new THREE.SphereGeometry(0.025, 6, 4), toon(L.hatBand || '#c42d3c', { emissive: new THREE.Color(L.hatBand || '#c42d3c'), emissiveIntensity: 0.6 }), Math.sin(a) * 0.215, 0.0, Math.cos(a) * 0.215, hg, 0); } }
      else if (hatK === 'circlet') { const gold = toon(L.hatColor || '#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.35 }); const band = M(new THREE.TorusGeometry(0.36, 0.016, 8, 44), gold, 0, -0.12, 0.06, hg, 0.006); band.rotation.x = Math.PI / 2 + 0.17; band.scale.set(1.04, 0.86, 1);   /* oval: hugs the back of the head too */   /* sits ON the brow, dipping to the forehead at the front */
        const pt = M(new THREE.ConeGeometry(0.028, 0.065, 4), gold, 0, -0.13, 0.37, hg, 0.006); pt.rotation.x = 0.17; M(new THREE.SphereGeometry(0.022, 10, 8), toon(L.hatBand || '#2b4fd0', { emissive: new THREE.Color(L.hatBand || '#2b4fd0'), emissiveIntensity: 0.5 }), 0, -0.18, 0.375, hg, 0.004); }   /* s681 Prince Max: a thin gold circlet with a blue stone */
      /* s682 LEADER HEADWEAR (Ben: each planet leader unique) */
      else if (hatK === 'frost') { const sil = toon(L.hatColor || '#dbe7f3', { emissive: new THREE.Color('#9cc4e4'), emissiveIntensity: 0.3 }), ice = toon(L.hatBand || '#bfe6ff', { emissive: new THREE.Color('#7dd3fc'), emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
        const band = M(new THREE.TorusGeometry(0.34, 0.014, 8, 44), sil, 0, -0.1, 0.05, hg, 0.005); band.rotation.x = Math.PI / 2 + 0.17; band.scale.set(1.04, 0.86, 1);
        for (let k = -3; k <= 3; k++) { const a2 = k * 0.26, h2 = 0.2 - Math.abs(k) * 0.035, sp = M(new THREE.ConeGeometry(0.03, h2, 4), ice, Math.sin(a2) * 0.355, -0.04 + h2 / 2 - Math.abs(k) * 0.012, 0.05 + Math.cos(a2) * 0.3, hg, 0.005); sp.rotation.z = -a2 * 0.4; } }   /* GRETA: a silver band with a fan of ice spikes */
      else if (hatK === 'shells') { const band = M(new THREE.TorusGeometry(0.34, 0.03, 8, 40), toon(L.hatColor || '#f5deb3'), 0, -0.1, 0.05, hg, 0.008); band.rotation.x = Math.PI / 2 + 0.17; band.scale.set(1.04, 0.86, 1);
        const cols = ['#fda4af', '#fef3c7', '#99f6e4', '#fdba74', '#f9a8d4'];
        for (let k = -2; k <= 2; k++) { const a2 = k * 0.42, sh2 = M(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(cols[k + 2]), Math.sin(a2) * 0.36, -0.06, 0.05 + Math.cos(a2) * 0.31, hg, 0.008); sh2.scale.set(1, 0.7, 0.5); sh2.rotation.set(-1.2, a2, 0); }
        const star = M(new THREE.ConeGeometry(0.06, 0.04, 5), toon(L.hatBand || '#f97316'), 0, 0.02, 0.37, hg, 0.006); star.rotation.x = Math.PI / 2; }   /* JORA: a woven band of sea shells + a starfish */
      else if (hatK === 'beret') { const d = M(new THREE.SphereGeometry(0.27, 24, 12), toon(L.hatColor || '#241a38'), -0.04, 0.02, -0.02, hg, 0.014); d.scale.set(1.1, 0.34, 1.05); d.rotation.z = 0.18; M(new THREE.TorusGeometry(0.24, 0.02, 6, 30), toon('#120c1c'), 0, -0.03, 0, hg, 0.006).rotation.x = Math.PI / 2;
        M(new THREE.SphereGeometry(0.03, 10, 8), toon(L.hatBand || '#c4b5fd', { emissive: new THREE.Color(L.hatBand || '#c4b5fd'), emissiveIntensity: 0.5 }), 0.17, 0.02, 0.17, hg, 0.005); }   /* KASIM: a dark tilted beret with a violet pin */
      else if (hatK === 'leaves') { const lf = toon(L.hatColor || '#4ade80'), lf2 = toon('#15803d'), band = M(new THREE.TorusGeometry(0.34, 0.018, 6, 40), toon('#6b4423'), 0, -0.1, 0.05, hg, 0.005); band.rotation.x = Math.PI / 2 + 0.17; band.scale.set(1.04, 0.86, 1);
        for (let k = 0; k < 14; k++) { const a2 = k / 14 * Math.PI * 2, l2 = M(new THREE.SphereGeometry(0.06, 8, 6), k % 2 ? lf : lf2, Math.sin(a2) * 0.355, -0.08, 0.05 + Math.cos(a2) * 0.3, hg, 0.006); l2.scale.set(0.5, 0.25, 1.1); l2.rotation.set(0.5, a2, 0.3); }
        for (const sx of [-0.12, 0.12]) M(new THREE.SphereGeometry(0.045, 10, 8), toon(L.hatBand || '#fde68a', { emissive: new THREE.Color(L.hatBand || '#fde68a'), emissiveIntensity: 0.4 }), sx, -0.04, 0.37, hg, 0.006); }   /* NOVA: a crown of leaves with two blossoms */
      else if (hatK === 'ziggurat') { const gold = toon(L.hatColor || '#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.3 });
        for (let k = 0; k < 3; k++) M(new THREE.CylinderGeometry(0.22 - k * 0.055, 0.24 - k * 0.055, 0.07, 4), gold, 0, 0.0 + k * 0.07, 0, hg, 0.008).rotation.y = Math.PI / 4;
        M(new THREE.SphereGeometry(0.035, 10, 8), toon(L.hatBand || '#2dd4bf', { emissive: new THREE.Color(L.hatBand || '#2dd4bf'), emissiveIntensity: 0.6 }), 0, 0.23, 0, hg, 0.005); }   /* UZAN: a stepped gold ziggurat crown with a teal stone */
      else if (hatK === 'furcrown') { const fr = toon(L.hatBand || '#f8fafc'), st = toon(L.hatColor || '#9cb3cc'); const ring = M(new THREE.TorusGeometry(0.29, 0.07, 10, 32), fr, 0, -0.03, 0, hg, 0.012); ring.rotation.x = Math.PI / 2;
        for (let k = 0; k < 6; k++) { const a2 = k / 6 * Math.PI * 2; M(new THREE.ConeGeometry(0.04, 0.16, 5), st, Math.sin(a2) * 0.24, 0.1, Math.cos(a2) * 0.24, hg, 0.006); } }   /* SOREN: a snow-fur ring with steel peaks */
      else if (hatK === 'top') { M(new THREE.CylinderGeometry(0.32, 0.32, 0.025, 28), hc, 0, -0.01, 0, hg, 0.014); M(new THREE.CylinderGeometry(0.19, 0.2, 0.34, 24), hc, 0, 0.16, 0, hg, 0.016); M(new THREE.CylinderGeometry(0.205, 0.205, 0.06, 24), hb, 0, 0.03, 0, hg, 0.008); }
      else if (hatK === 'cap') { const d = M(new THREE.SphereGeometry(0.24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hc, 0, -0.03, 0, hg, 0.016); d.scale.set(1, 0.7, 1); const br = M(new THREE.CylinderGeometry(0.19, 0.19, 0.018, 22, 1, false, -Math.PI / 2, Math.PI), hc, 0, -0.03, 0.2, hg, 0.01); br.scale.set(1, 1, 0.8); M(new THREE.SphereGeometry(0.03, 8, 6), hb, 0, 0.14, 0, hg, 0.006); }
      else if (hatK === 'beanie') { const d = M(new THREE.SphereGeometry(0.25, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), hc, 0, -0.05, 0, hg, 0.016); d.scale.set(1, 0.85, 1); M(new THREE.CylinderGeometry(0.255, 0.26, 0.07, 24), hb, 0, -0.04, 0, hg, 0.01); M(new THREE.SphereGeometry(0.07, 12, 8), hb, 0, 0.18, 0, hg, 0.01); }
      else if (hatK === 'cowboy') { const br = M(new THREE.CylinderGeometry(0.4, 0.4, 0.025, 30), hc, 0, -0.01, 0, hg, 0.014); br.scale.set(1, 1, 0.85); const cr = M(new THREE.SphereGeometry(0.2, 22, 14), hc, 0, 0.08, 0, hg, 0.016); cr.scale.set(1, 0.9, 1.15); M(new THREE.CylinderGeometry(0.205, 0.205, 0.045, 22), hb, 0, 0.02, 0, hg, 0.008).scale.set(1, 1, 1.15); }
      else if (hatK === 'wizard') { M(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 28), hc, 0, -0.01, 0, hg, 0.014); const c = M(new THREE.ConeGeometry(0.21, 0.6, 24), hc, 0, 0.29, -0.03, hg, 0.016); c.rotation.x = -0.18; M(new THREE.CylinderGeometry(0.215, 0.215, 0.05, 24), hb, 0, 0.03, 0, hg, 0.008); } }
    if (crown) { const cw = new THREE.Group(); cw.position.set(0, 0.36, -0.02); cw.rotation.x = -0.12; head.add(cw); const gold = toon('#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.4 });
      M(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 20, 1, true), gold, 0, 0, 0, cw, 0.015, 0.22);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; M(new THREE.ConeGeometry(0.045, 0.14, 4), gold, Math.sin(a) * 0.2, 0.11, Math.cos(a) * 0.2, cw, 0.01); M(new THREE.SphereGeometry(0.025, 6, 4), toon('#c42d3c', { emissive: new THREE.Color('#c42d3c'), emissiveIntensity: 0.6 }), Math.sin(a) * 0.215, 0.0, Math.cos(a) * 0.215, cw, 0); } }
    if (L.eyePatch) {   // EYE PATCH STRAP (s149): a black band that hugs the skull: through the patch, over the far brow, round the back (raycast onto the head)
      g.updateMatrixWorld(true); const sx = L.eyePatch === 'R' ? 1 : -1, uv = mask.geometry.attributes.uv, pos = mask.geometry.attributes.position, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
      const atUV = (px, py) => { const tu = px / 256, tv = 1 - py / 256; let bi = 0, bd = 1e9; for (let k = 0; k < uv.count; k++) { const d = (uv.getX(k) - tu) ** 2 + (uv.getY(k) - tv) ** 2; if (d < bd) { bd = d; bi = k; } } return head.worldToLocal(mask.localToWorld(V3().fromBufferAttribute(pos, bi))); };
      const E = atUV(128 + sx * L.eyeSpacing, L.eyeY + 2), T = atUV(128 - sx * (L.eyeSpacing + 40), L.eyeY - 62), Bk = V3(0, E.y + 0.06, -0.5);
      const n = T.clone().sub(E).cross(Bk.clone().sub(E)).normalize(), c = n.clone().multiplyScalar(n.dot(E)), u = E.clone().sub(c).normalize(), v = n.clone().cross(u).normalize();
      const rc = new THREE.Raycaster(), tgt = [skull, mask], pts = [];
      for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, d = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a)), o = c.clone().addScaledVector(d, 1.4);
        rc.set(head.localToWorld(o.clone()), head.localToWorld(c.clone()).sub(head.localToWorld(o.clone())).normalize()); const h = rc.intersectObjects(tgt, false)[0];
        if (h) pts.push(head.worldToLocal(h.point.clone()).addScaledVector(d, 0.014)); }
      if (pts.length > 8) { const band = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.022, 6, true), toon('#141312')); head.add(band); P.patchBand = band; } }
    const ROYAL = glasses === 'royal';   /* s681 PRINCE MAX: dark lenses in a GOLD frame, squarer than Hope's round sunglasses */
    if (glasses === 'sun' || ROYAL) {   // SUN LAYER (s149): the lenses + bridge also go on a copy of the face mask pulled 7 cm toward the camera, so they sit ON TOP of the snout / nose bridge from any angle
      { const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sg = sc.getContext('2d'), ES = L.eyeSize, EX = L.eyeSpacing, EY = L.eyeY, lw = SUN.w * ES, lh = SUN.h * ES;
        sg.lineJoin = 'round'; sg.lineCap = 'round'; sg.strokeStyle = ROYAL ? '#e6b45a' : '#111827'; sg.lineWidth = ROYAL ? 10 : 16; sg.beginPath(); sg.moveTo(128 - EX + lw * 0.55, EY - lh * 0.25); sg.quadraticCurveTo(128, EY - lh * 0.55, 128 + EX - lw * 0.55, EY - lh * 0.25); sg.stroke();
        for (const s of [-1, 1]) { sg.save(); sg.translate(128 + s * EX, EY); sg.rotate(-s * L.eyeTilt * 0.5); sg.fillStyle = '#0b0f19'; sg.beginPath(); if (ROYAL) sg.roundRect(-lw * 1.05, -lh * 0.82, lw * 2.1, lh * 1.64, lh * 0.35); else sg.ellipse(0, 0, lw, lh, 0, 0, 7); sg.fill(); sg.lineWidth = ROYAL ? 6 : 5; sg.strokeStyle = ROYAL ? '#e6b45a' : '#111827'; sg.stroke();
          sg.strokeStyle = 'rgba(148,163,184,0.55)'; sg.lineWidth = 3; sg.lineCap = 'round'; sg.beginPath(); sg.ellipse(0, 0, lw * 0.7, lh * 0.66, 0, Math.PI * 1.1, Math.PI * 1.45); sg.stroke(); sg.restore(); }
        const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace; st.anisotropy = 4;
        const sm = new THREE.MeshBasicMaterial({ map: st, transparent: true, alphaTest: 0.04, depthWrite: false });
        sm.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  mvPosition.z += 0.16; gl_Position = projectionMatrix * mvPosition;'); };
        const sunL = new THREE.Mesh(mask.geometry, sm); sunL.renderOrder = 4; skull.add(sunL); P.sunLayer = sunL; }
      // side shields + arms back to the ears,
      // starting from the painted lens's outer edge, found through the face mask's UVs
      const fr = toon(ROYAL ? '#e6b45a' : '#111827'), shield = toon('#0b0f19'); g.updateMatrixWorld(true);
      const pos = mask.geometry.attributes.position, uv = mask.geometry.attributes.uv, nrm = mask.geometry.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(mask.matrixWorld);
      const at = (px, py) => { const tu = px / 256, tv = 1 - py / 256; let bi = 0, bd = 1e9; for (let i = 0; i < uv.count; i++) { const d = (uv.getX(i) - tu) ** 2 + (uv.getY(i) - tv) ** 2; if (d < bd) { bd = d; bi = i; } }
        const p = head.worldToLocal(mask.localToWorld(new THREE.Vector3().fromBufferAttribute(pos, bi))), n = new THREE.Vector3().fromBufferAttribute(nrm, bi).applyMatrix3(nm).normalize(); return { p, n }; };
      const rc = new THREE.Raycaster(), hitSide = (sx, y, z) => { rc.set(head.localToWorld(new THREE.Vector3(sx * 2, y, z)), new THREE.Vector3(-sx, 0, 0)); const h = rc.intersectObject(skull, false)[0]; if (!h) return null; return head.worldToLocal(h.point.clone()); };
      const Zf = new THREE.Vector3(0, 0, 1);
      const seg = (A, B, w, h, mat) => { const d = B.clone().sub(A), m = M(new THREE.BoxGeometry(w, h, d.length()), mat, (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2, head, 0.006); m.quaternion.setFromUnitVectors(Zf, d.normalize()); return m; };
      const lw = SUN.w * L.eyeSize;
      { // 3D BRIDGE (s149): a black bar from lens to lens that arches over the nose ridge, so the orange never splits the glasses
        const lh = SUN.h * L.eyeSize, iy = L.eyeY - lh * 0.25, A = at(128 - (L.eyeSpacing - lw * 0.6), iy), B = at(128 + (L.eyeSpacing - lw * 0.6), iy);
        const my = (A.p.y + B.p.y) / 2, front = [P.bridge, skull, P.snout].filter(Boolean); rc.set(head.localToWorld(new THREE.Vector3(0, my, 2)), head.localToWorld(new THREE.Vector3(0, my, 0)).sub(head.localToWorld(new THREE.Vector3(0, my, 2))).normalize());
        const hm = rc.intersectObjects(front, false)[0], mid = hm ? head.worldToLocal(hm.point.clone()).add(new THREE.Vector3(0, 0, 0.014)) : A.p.clone().lerp(B.p, 0.5).add(new THREE.Vector3(0, 0, 0.08));
        const a0 = A.p.clone().addScaledVector(A.n, 0.008), b0 = B.p.clone().addScaledVector(B.n, 0.008), ma = a0.clone().lerp(mid, 0.5), mb = b0.clone().lerp(mid, 0.5); ma.z = Math.max(ma.z, mid.z - 0.02); mb.z = Math.max(mb.z, mid.z - 0.02);
        for (const [p, q] of [[a0, ma], [ma, mid], [mid, mb], [mb, b0]]) seg(p, q, 0.03, 0.026, fr); }
      for (const cs of [-1, 1]) { const e = at(128 + cs * (L.eyeSpacing + lw - 2), L.eyeY), sx = Math.sign(e.p.x) || cs;
        const hinge = e.p.clone().addScaledVector(e.n, 0.006), pts = [hinge];
        for (const back of [0.08, 0.2, 0.32]) { const q = hitSide(sx, hinge.y, hinge.z - back); if (q) pts.push(q.add(new THREE.Vector3(sx * 0.01, 0, 0))); }
        for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], 0.014, 0.02, fr);
        if (pts[1]) { const sh = seg(pts[0], pts[1], 0.008, 0.07, shield); sh.position.y -= 0.006; }
      }
    } else if (glasses) { const lens = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.42 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 22), toon('#334155')); r.position.set(s * 0.13, 0.03, 0.43); r.scale.x = 0.95 / 1.14; skull.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(0.095, 22), lens); l.position.set(s * 0.13, 0.03, 0.432); l.scale.x = 0.95 / 1.14; skull.add(l); } M(new THREE.BoxGeometry(0.08, 0.018, 0.018), toon('#334155'), 0, 0.05, 0.44, skull, 0); }
    if (cane) { const c = M(new THREE.CylinderGeometry(0.017, 0.017, 1.25, 6), white, 0, -0.9, 0.22, P.arms[1], 0.012); c.rotation.x = 0.35; M(new THREE.SphereGeometry(0.035, 6, 4), toon('#dc2626'), 0, -0.62, 0, c, 0); }
    const tail = new THREE.Group(); tail.position.set(0, 0.6 + lift, -0.24); body.add(tail); P.tail = tail;
    const tm = M(tailGeoFor(L), vcToon, 0, 0, 0, tail, 0.03); tm.rotation.x = -L.tailLift; tm.scale.setScalar(L.tailSize);
    if (chair) {
      const ch = new THREE.Group(); g.add(ch); P.wheels = [];
      M(new THREE.BoxGeometry(0.7, 0.08, 0.6), toon('#334155'), 0, 0.6, 0, ch, 0.025); M(new THREE.BoxGeometry(0.7, 0.75, 0.08), toon('#334155'), 0, 1.0, -0.3, ch, 0.025);
      for (const s of [-1, 1]) { const w = M(new THREE.TorusGeometry(0.42, 0.045, 8, 28), toon('#0f172a'), s * 0.43, 0.45, -0.05, ch, 0.015); w.rotation.y = Math.PI / 2; M(new THREE.TorusGeometry(0.36, 0.015, 4, 20), toon('#cbd5e1'), 0, 0, 0, w, 0); P.wheels.push(w); M(new THREE.SphereGeometry(0.08, 8, 6), toon('#0f172a'), s * 0.3, 0.08, 0.32, ch, 0.01, 0.08); }
      M(new THREE.BoxGeometry(0.5, 0.05, 0.25), toon('#334155'), 0, 0.12, 0.4, ch, 0.015);
    }
    const hold = { left: gear === 'laser' || gear === 'both', right: gear === 'sword' || gear === 'both' };
    if (gear === 'laser') { hold.right = true; hold.left = false; }
    const glowCyan = new THREE.MeshToonMaterial({ color: '#e8f8ff', gradientMap: grad, emissive: new THREE.Color(L.armorAccent || '#38bdf8'), emissiveIntensity: 0.9 });
    const gold = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), navy = toon('#1b2350'), steelL = toon('#cbd5e1'), wht = toon('#f3f4f6'), acc = toon(L.armorAccent || '#38bdf8', { emissive: new THREE.Color(L.armorAccent || '#38bdf8'), emissiveIntensity: 0.35 });
    const swLook = (gear === 'sword' || gear === 'both') ? weaponLook(THREE, gold, navy) : null;   // s662 WEAPON LOOK POLISH: worn + rim-lit metal for the sword
    if (gear === 'sword' || gear === 'both') {
      const gold = swLook.gold, navy = swLook.navy; P.swLook = swLook;
      const sw = new THREE.Group(); sw.position.set(0, -0.42, 0.04); sw.scale.setScalar(0.8); P.arms[1].add(sw); P.sword = sw;
      // s237 POLISHED HILT (Ben): grip 20% bigger with gold ferrules + criss-cross wrap, faceted pommel with a navy band,
      // a shaped crossguard (quillons taper + sweep up to round finials), and a gold boss behind the 8 crest with a navy inner ring
      M(new THREE.CylinderGeometry(0.042, 0.048, 0.288, 12), navy, 0, -0.044, 0, sw, 0.016, 0.048);
      for (let k = 0; k < 7; k++) { const w = M(new THREE.TorusGeometry(0.047, 0.0075, 4, 14), gold, 0, -0.165 + k * 0.041, 0, sw, 0); w.rotation.x = Math.PI / 2 + (k % 2 ? 0.2 : -0.2); }
      M(new THREE.CylinderGeometry(0.056, 0.05, 0.034, 14), gold, 0, 0.09, 0, sw, 0.014, 0.056); M(new THREE.CylinderGeometry(0.05, 0.058, 0.03, 14), gold, 0, -0.186, 0, sw, 0.014, 0.058);
      for (const [y, r] of [[0.09, 0.057], [-0.186, 0.059]]) for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.4; M(new THREE.SphereGeometry(0.009, 6, 4), swLook.steel, Math.cos(a) * r, y, Math.sin(a) * r, sw, 0); }   // s662 ferrule rivets
      M(new THREE.IcosahedronGeometry(0.064, 1), gold, 0, -0.238, 0, sw, 0.016, 0.064).scale.set(1, 0.92, 1);
      M(new THREE.TorusGeometry(0.062, 0.009, 4, 18), navy, 0, -0.238, 0, sw, 0).rotation.x = Math.PI / 2;
      M(new THREE.SphereGeometry(0.022, 8, 6), gold, 0, -0.302, 0, sw, 0.006, 0.022);
      { const q = new THREE.Shape(), H = [[0, -0.044], [0.09, -0.032], [0.17, -0.016], [0.215, 0.006], [0.236, 0.034], [0.222, 0.052], [0.19, 0.03], [0.12, 0.028], [0.05, 0.036], [0, 0.04]];
        q.moveTo(-H[0][0], H[0][1]); for (const [u, v] of H) q.lineTo(u, v); for (let i = H.length - 1; i >= 0; i--) q.lineTo(-H[i][0], H[i][1]); q.closePath();
        const qg = new THREE.ExtrudeGeometry(q, { depth: 0.056, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 2, curveSegments: 6 }); qg.translate(0, 0, -0.028);
        M(qg, gold, 0, 0.13, 0, sw, 0.016).rotation.y = Math.PI / 2;
        for (const sz of [-1, 1]) { M(new THREE.SphereGeometry(0.03, 10, 8), gold, 0, 0.172, sz * 0.236, sw, 0.008, 0.03); M(new THREE.SphereGeometry(0.014, 6, 4), navy, 0, 0.172, sz * 0.236, sw, 0).scale.set(1.8, 0.7, 0.7); } }
      { const boss = M(new THREE.CylinderGeometry(0.104, 0.104, 0.092, 32), gold, 0, 0.13, 0, sw, 0.016, 0.104); boss.rotation.z = Math.PI / 2;
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, st = M(new THREE.BoxGeometry(0.096, 0.016, 0.016), gold, 0, 0.13 + Math.sin(a) * 0.104, Math.cos(a) * 0.104, sw, 0); st.rotation.x = -a; } }
      // s238 the hilt's own 8 texture, drawn for readability at tiny sizes: deep navy disc, thin cyan ring, one huge heavy white 8 with a dark edge
      if (!sw.userData) sw.userData = {};
      // s776i HILT CREST = the bearer's faction (Ben): the player + party keep the 8; MERU guards / captains / royals the M; BANDITS their own mark
      // (X = crossed blades, red on black); any other crest letter draws in its armour colours. Bandits never carry the 8 or a planet letter.
      const HILT = { '8': ['#0b1430', '#38bdf8', '#ffffff', '8'], M: ['#1b2350', '#e6b45a', '#ffffff', 'M'], X: ['#140808', '#ec3013', '#ec3013', 'X'] };
      const hk = /bandit/i.test(String(key || '') + ' ' + String(name || '')) ? 'X' : (crest && (HILT[crest] || crestStyle[crest]) ? crest : '8');
      const hiltTex = (() => { foxKit._hilt = foxKit._hilt || {}; if (foxKit._hilt[hk]) return foxKit._hilt[hk]; const cs = crestStyle[hk], [bg, ring, fg, ch] = HILT[hk] || [cs[1], cs[0], cs[2], hk];
        const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
        x.fillStyle = bg; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill(); x.strokeStyle = ring; x.lineWidth = 14; x.beginPath(); x.arc(128, 128, 112, 0, Math.PI * 2); x.stroke();
        if (hk === 'X') { x.lineCap = 'round'; for (const [a0, a1] of [[[64, 64], [192, 192]], [[192, 64], [64, 192]]]) { x.strokeStyle = '#05091a'; x.lineWidth = 46; x.beginPath(); x.moveTo(...a0); x.lineTo(...a1); x.stroke(); x.strokeStyle = fg; x.lineWidth = 30; x.beginPath(); x.moveTo(...a0); x.lineTo(...a1); x.stroke(); } for (const [px, py] of [[64, 64], [192, 64]]) { x.fillStyle = '#e6b45a'; x.fillRect(px - 22, py - 6, 44, 12); } }
        else { x.font = '900 ' + (ch.length > 1 || ch === 'M' ? 190 : 222) + 'px "Arial Black", Archivo, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 16; x.strokeStyle = '#05091a'; x.strokeText(ch, 128, 140); x.fillStyle = fg; x.fillText(ch, 128, 140); }
        const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace || t.colorSpace; foxKit._hilt[hk] = t; return t; })();
      for (const sx of [-1, 1]) { const cd = new THREE.Mesh(new THREE.CircleGeometry(0.084, 32), new THREE.MeshBasicMaterial({ map: hiltTex, toneMapped: false })); cd.position.set(sx * 0.0505, 0.13, 0); cd.rotation.y = sx * Math.PI / 2; sw.add(cd);   // the 8 crest medallion, both faces
        const nr = new THREE.Mesh(new THREE.RingGeometry(0.084, 0.093, 32), new THREE.MeshBasicMaterial({ color: '#1b2350' })); nr.position.set(sx * 0.0504, 0.13, 0); nr.rotation.y = sx * Math.PI / 2; sw.add(nr);
        M(new THREE.TorusGeometry(0.097, 0.012, 6, 32), gold, sx * 0.049, 0.13, 0, sw, 0).rotation.y = Math.PI / 2; }
      // s662k TWO-TONE DIAMOND BLADE (Ben: "like the war hammer spike, two tones meeting in the middle"): a diamond cross-section with a centre RIDGE,
      // the right half bright (bladeMat, still the charge / pulse material) and the left half a deep tone (bladeMat2, follows the glow at 40 %), meeting on the ridge
      const diamond = sd => { const W = 0.051, T = 0.02, Y1 = 1.0, Y2 = 1.16, v = [], tri = (a, b, c) => { const cx = (a[0] + b[0] + c[0]) / 3, cz = (a[2] + b[2] + c[2]) / 3, ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2], nx = uy * wz - uz * wy, nz = ux * wy - uy * wx; if (nx * cx + nz * cz < 0) v.push(...a, ...c, ...b); else v.push(...a, ...b, ...c); };
        for (const s of sd) for (const z of [T, -T]) { const R0 = [0, 0, z], R1 = [0, Y1, z], E0 = [s * W, 0, 0], E1 = [s * W, Y1, 0], TP = [0, Y2, 0]; tri(R0, E0, E1); tri(R0, E1, R1); tri(R1, E1, TP); }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); cvn(geo); return geo; };
      const bg = diamond([1, -1]);
      const bladeMat = glowCyan.clone(); const blade = M(diamond([1]), bladeMat, 0, 0.16, 0, sw, 0); blade.rotation.y = Math.PI / 2; P.bladeMat = bladeMat;
      { const bm2 = glowCyan.clone(); bm2.color.set('#1f6fa8'); bm2.userData.noTint = true; P.bladeMat2 = bm2; const b2 = new THREE.Mesh(diamond([-1]), bm2); blade.add(b2);   // child of the bright half: hides with it on the back
        b2.onBeforeRender = () => { b2.material.emissiveIntensity = bladeMat.emissiveIntensity * 0.4; }; }
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.35), new THREE.MeshBasicMaterial({ map: glowTexFor(), color: new THREE.Color(L.armorAccent || '#38bdf8'), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); halo.position.set(0, 0.75, 0); sw.add(halo); P.bladeHalo = halo; halo.visible = false; const bo = new THREE.Mesh(bg, outlineMat); bo.scale.set(1.5, 1.025, 1.85); bo.position.y = -0.012; blade.add(bo);
      // s662k the centre fuller strip is gone: the two tones meet on the ridge
      // s662 EMITTER COLLAR (steel ring, gold band, glowing vents) where the energy blade leaves the guard + white-hot EDGES along both sides and the tip
      M(new THREE.CylinderGeometry(0.036, 0.044, 0.05, 14), swLook.steel, 0, 0.19, 0, sw, 0.01, 0.044);
      M(new THREE.TorusGeometry(0.041, 0.007, 4, 16), gold, 0, 0.205, 0, sw, 0).rotation.x = Math.PI / 2;
      for (const sz of [-1, 1]) M(new THREE.BoxGeometry(0.046, 0.026, 0.012), swLook.edge, 0, 0.185, sz * 0.036, sw, 0);
      for (const sz of [-1, 1]) { M(new THREE.BoxGeometry(0.026, 0.98, 0.008), swLook.edge, 0, 0.66, sz * 0.052, sw, 0);
        M(new THREE.BoxGeometry(0.026, 0.17, 0.008), swLook.edge, 0, 1.24, sz * 0.026, sw, 0).rotation.x = -sz * 0.274; }
    }
    if (gear === 'laser' || gear === 'both') {
      const arm = gear === 'laser' ? P.arms[1] : P.arms[0]; arm.children.filter(c => c.isMesh && c.geometry.type === 'SphereGeometry' && Math.abs(c.position.y + 0.4) < 0.01).forEach(c => c.scale.setScalar(0.75));
      const gn = new THREE.Group(); gn.position.set(0, -0.44, 0.1); gn.scale.setScalar(0.8); arm.add(gn); P.gun = gn;
      M(new THREE.BoxGeometry(0.13, 0.17, 0.42), wht, 0, 0.02, 0.14, gn, 0.016);
      M(new THREE.BoxGeometry(0.135, 0.05, 0.3), acc, 0, 0.1, 0.12, gn, 0.01);
      M(new THREE.BoxGeometry(0.1, 0.2, 0.1), navy, 0, -0.13, 0.0, gn, 0.014).rotation.x = -0.25;
      M(new THREE.BoxGeometry(0.04, 0.06, 0.12), navy, 0, -0.07, 0.12, gn, 0.008);
      const br = M(new THREE.CylinderGeometry(0.045, 0.055, 0.26, 14), steelL, 0, 0.03, 0.44, gn, 0.012, 0.055); br.rotation.x = Math.PI / 2;
      for (const z of [0.36, 0.46]) M(new THREE.TorusGeometry(0.056, 0.012, 6, 16), acc, 0, 0.03, z, gn, 0);
      const tipMat = glowCyan.clone(); M(new THREE.SphereGeometry(0.045, 12, 8), tipMat, 0, 0.03, 0.58, gn, 0.008, 0.045); P.tipMat = tipMat;
      const tipGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexFor(), color: new THREE.Color(L.armorAccent || '#38bdf8'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); tipGlow.position.set(0, 0.03, 0.6); tipGlow.scale.setScalar(0.3); gn.add(tipGlow); P.tipGlow = tipGlow;
      M(new THREE.BoxGeometry(0.02, 0.05, 0.16), glowCyan, 0.068, 0.01, 0.12, gn, 0); M(new THREE.BoxGeometry(0.02, 0.05, 0.16), glowCyan, -0.068, 0.01, 0.12, gn, 0);
      M(new THREE.BoxGeometry(0.03, 0.05, 0.04), navy, 0, 0.13, 0.3, gn, 0.006);
      gn.children.forEach(c => { c.position.y += 0.13; c.position.z += 0.06; });
      const pawM = toon(L.paw);
      for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(0.05, 10, 8), pawM, 0, 0.03 - k * 0.055, 0.125, gn, 0.012, 0.05).scale.set(1.25, 0.9, 0.9);
      M(new THREE.SphereGeometry(0.048, 10, 8), pawM, 0.075, 0.09, 0.07, gn, 0.012, 0.048).scale.set(0.8, 0.8, 1.3);
    }
    if (legColor) { const lm = toon(legColor); P.legs.forEach(p => p.children.forEach(c => { if (c.isMesh && !c.userData.keepCol && !(c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius === 0.14)) c.material = lm; })); }
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material !== faceMat) o.castShadow = true; });
    g.userData = { hold, P, phase: rr(0, 6), amt: 0, blink: rr(1, 4), blinkT: 0, chair: !!chair, base: mood, mood, moodT: 0, look: 0, lookT: rr(1, 3), lookTo: 0, mouth: 0, talking: false, hop: 0, hopY: 0,
      face: { ctx: fctx, tex: ftex, eyeL: eyes[0], eyeR: eyes[1], key: '', L, sun: glasses === 'sun' || glasses === 'royal' }, lookAt: null };
    // PHONE PERF (step 3): MERGED FOX. Static meshes are baked into one mesh per moving part (+ one ink shell per part).
    // Off for Hope + Noble (their cane + chair rigs read the raw parts) and for the chair pose. The player has no rig: merged too (s32, ~200 → ~45 draws).
    /* s684 CREST ON TOP (Ben: the crest was cut off by lapels / vest edges): every clothing badge is pushed out onto the outermost cloth in front of it */
    if (P.badges) { const rcB = new THREE.Raycaster(), bodyMs = []; body.traverse(o => { if (o.isMesh && !P.badges.includes(o) && o.material !== outlineMat && !(o.parent && P.badges.includes(o.parent)) && !(P.arms || []).some(a => { let q = o; while (q) { if (q === a) return true; q = q.parent; } return false; })) bodyMs.push(o); }); g.updateMatrixWorld(true);
      for (const bm of P.badges) { const lp = bm.position.clone(), o = body.localToWorld(new THREE.Vector3(lp.x, lp.y, 2)), d = body.localToWorld(new THREE.Vector3(lp.x, lp.y, 0)).sub(o).normalize(); rcB.set(o, d); const hit = rcB.intersectObjects(bodyMs, false)[0]; if (hit) { const hp = body.worldToLocal(hit.point.clone()), n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : null, nb = n ? n.applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion()).invert()) : null;
          const yaw = nb ? Math.max(-0.6, Math.min(0.6, Math.atan2(nb.x, nb.z))) : 0, pitch = nb ? Math.max(-0.5, Math.min(0.5, -Math.atan2(nb.y, Math.hypot(nb.x, nb.z)))) : 0;
          /* s684c (Ben: the top of Uzan's U sank into his robe): sample the cloth at the badge's TOP + BOTTOM edge too, stand it out past the furthest one, and tilt it with the cloth */
          let zMax = hp.z; const br = bm.userData.badgeR || 0.08; for (const dy of [br, -br]) { rcB.set(body.localToWorld(new THREE.Vector3(lp.x, lp.y + dy, 2)), d); const h2 = rcB.intersectObjects(bodyMs, false)[0]; if (h2) zMax = Math.max(zMax, body.worldToLocal(h2.point.clone()).z); }
          const z = zMax + 0.016;   /* turn the badge to face the way the cloth faces, so a curved coat side never swallows half of it */
          if (z > lp.z || Math.abs(yaw) > 0.08 || Math.abs(pitch) > 0.08) { const pv = new THREE.Group(); pv.position.set(lp.x, lp.y, Math.max(z, lp.z)); pv.rotation.set(pitch, yaw, 0, 'YXZ'); body.add(pv); body.remove(bm); bm.position.set(0, 0, 0.004); pv.add(bm); } } } }
    if (!chair && L.heroBuild !== false) { heroBuild(P); if (!joints) for (const a of P.arms || []) a.scale.y *= 1.3; }   // s662u TALL HERO build · s714 (Ben: all foxes equally tall) now EVERY fox, jointed or not; unjointed arms get the jointed foxes' 30 % longer reach
    if (joints) jointLimbs(g, P, !!chair);   // s666 a chair fox (Noble) gets jointed arms + fingers only
    HANDS = false; if (P.arms && P.arms[0] && P.arms[0].userData.hand) { P.hands = P.arms.map(a => a.userData.hand); P.handBones = P.hands.flatMap(h => [h.g, h.th, h.th2, ...h.fingers.flatMap(f => f.b ? [f.a, f.b] : [f.a])]); }   // s609 ELBOWS + KNEES (the Fox Fighters split, kept as children so every existing arm / leg pose still works)
    if ((merged ?? MERGE_DEFAULT) && !chair && key !== 'hope' && key !== 'noble') mergeFoxParts(g, P);
    if (P.mapY) for (const c of body.children) c.userData.built = true;   // s662v everything made inside makeFox is already in hero space
    if (L.mouth3d) try { addFoxMouth3D(THREE, g); } catch (e) { console.warn('mouth3d', e); }   /* s728bv Ben: back to the painted mouth on the player (more expressive); the 3D mouth is opt-in only (look.mouth3d: true) */
    g.scale.setScalar(L.bodyScale); g.userData.foxKey = key || ''; g.userData.foxName = name || '';   // s104g: the CHARACTER ROSTER reads these
    scene.add(g); return g;
  }
  const FOX_PHONE = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches, CAST_KEYS = new Set(['player', 'hope', 'noble']), _m4 = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _n3 = new THREE.Matrix3(), _v = new THREE.Vector3(), _c = new THREE.Color();
  function mergeFoxParts(g, P) {
    const bones = new Set([g]); const addB = o => { if (!o) return; if (Array.isArray(o)) o.forEach(addB); else if (o.isObject3D) bones.add(o); };
    for (const k in P) addB(P[k]);
    const live = new Set([P.bladeMat, P.tipMat].filter(Boolean));
    const okMat = m => m && !Array.isArray(m) && (m === outlineMat || (m.isMeshToonMaterial && !m.map && !m.transparent && !live.has(m)));
    const ok = new Map(); const can = o => { if (ok.has(o)) return ok.get(o); let r = o.isMesh && !bones.has(o) && o.visible && okMat(o.material) && !o.isSkinnedMesh && !o.isInstancedMesh;
      if (r) for (const c of o.children) if (!can(c)) { r = false; break; } ok.set(o, r); return r; };
    const isAnchor = o => bones.has(o) || (o.isMesh && !can(o)) || (!o.isMesh && [...o.children].some(c => !can(c) && !(c.children.length === 0 && !c.isMesh)) && hasKept(o));
    const kept = new Map(); const hasKept = o => { if (kept.has(o)) return kept.get(o); let r = false; for (const c of o.children) if ((c.isMesh && !can(c)) || bones.has(c) || (!c.isMesh && hasKept(c))) { r = true; break; } if (!o.isMesh && !bones.has(o) && o.children.length === 0) r = true; kept.set(o, r); return r; };
    g.updateMatrixWorld(true);
    const bins = new Map(), take = [];   // anchor -> sig -> [meshes]
    g.traverse(o => { if (!o.isMesh || !can(o)) return; if (o.parent && o.parent.isMesh && can(o.parent)) { /* merged with its parent's walk */ }
      let a = o.parent; while (a && !(bones.has(a) || (a.isMesh && !can(a)) || (!a.isMesh && hasKept(a)))) a = a.parent; if (!a) return;
      const m = o.material, sig = m === outlineMat ? 'ink' : [m.emissive ? m.emissive.getHex() : 0, m.emissiveIntensity, m.side].join('|');
      let A = bins.get(a); if (!A) bins.set(a, A = new Map()); let L = A.get(sig); if (!L) A.set(sig, L = []); L.push(o); take.push(o); });
    for (const [a, A] of bins) { _inv.copy(a.matrixWorld).invert();
      for (const [sig, list] of A) { if (list.length < 2 && sig !== 'ink') { if (list.length === 1 && list[0].parent === a) { const i = take.indexOf(list[0]); if (i >= 0) take.splice(i, 1); continue; } }
        let nv = 0, ni = 0; for (const o of list) { const gg = o.geometry; nv += gg.attributes.position.count; ni += gg.index ? gg.index.count : gg.attributes.position.count; }
        const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new (nv > 65535 ? Uint32Array : Uint16Array)(ni); let vo = 0, io = 0;
        for (const o of list) { const gg = o.geometry; if (!gg.attributes.normal) cvn(gg); _m4.multiplyMatrices(_inv, o.matrixWorld); _n3.getNormalMatrix(_m4); const flip = _m4.determinant() < 0;
          const p = gg.attributes.position, n = gg.attributes.normal, vc = o.material.vertexColors && gg.attributes.color, base = o.material.color || _c.set(0xffffff), c = gg.attributes.color;
          if (FF.on && p.isBufferAttribute && n.isBufferAttribute && !p.isInterleavedBufferAttribute && !n.isInterleavedBufferAttribute && !p.normalized && !n.normalized && p.itemSize === 3 && n.itemSize === 3 && (!vc || (c.isBufferAttribute && !c.isInterleavedBufferAttribute && !c.normalized && c.itemSize >= 3))) {   /* p49 FOX FAST: the same arithmetic as the loop below (Vector3.applyMatrix4 / applyMatrix3 / normalize written out), without two small arrays + two TypedArray.set calls per vertex */
            const pa = p.array, na = n.array, ca = vc ? c.array : null, cs = vc ? c.itemSize : 0, e4 = _m4.elements, e3 = _n3.elements, br = base.r, bgn = base.g, bb = base.b;
            for (let i = 0, j = vo * 3; i < p.count; i++, j += 3) { const x = pa[i * 3], y = pa[i * 3 + 1], z = pa[i * 3 + 2], w = 1 / (e4[3] * x + e4[7] * y + e4[11] * z + e4[15]);
              pos[j] = (e4[0] * x + e4[4] * y + e4[8] * z + e4[12]) * w; pos[j + 1] = (e4[1] * x + e4[5] * y + e4[9] * z + e4[13]) * w; pos[j + 2] = (e4[2] * x + e4[6] * y + e4[10] * z + e4[14]) * w;
              const u1 = na[i * 3], u2 = na[i * 3 + 1], u3 = na[i * 3 + 2], nx = e3[0] * u1 + e3[3] * u2 + e3[6] * u3, ny = e3[1] * u1 + e3[4] * u2 + e3[7] * u3, nz = e3[2] * u1 + e3[5] * u2 + e3[8] * u3, sc = 1 / (Math.sqrt(nx * nx + ny * ny + nz * nz) || 1);
              nor[j] = nx * sc; nor[j + 1] = ny * sc; nor[j + 2] = nz * sc;
              if (ca) { col[j] = ca[i * cs] * br; col[j + 1] = ca[i * cs + 1] * bgn; col[j + 2] = ca[i * cs + 2] * bb; } else { col[j] = br; col[j + 1] = bgn; col[j + 2] = bb; } }
          } else for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).applyMatrix4(_m4); pos.set([_v.x, _v.y, _v.z], (vo + i) * 3); _v.fromBufferAttribute(n, i).applyMatrix3(_n3).normalize(); nor.set([_v.x, _v.y, _v.z], (vo + i) * 3);
            const r = vc ? c.getX(i) * base.r : base.r, gr = vc ? c.getY(i) * base.g : base.g, b = vc ? c.getZ(i) * base.b : base.b; col[(vo + i) * 3] = r; col[(vo + i) * 3 + 1] = gr; col[(vo + i) * 3 + 2] = b; }
          if (gg.index) { const ix = gg.index.array; for (let i = 0; i < ix.length; i += 3) { idx[io++] = ix[i] + vo; idx[io++] = (flip ? ix[i + 2] : ix[i + 1]) + vo; idx[io++] = (flip ? ix[i + 1] : ix[i + 2]) + vo; } }
          else for (let i = 0; i < p.count; i += 3) { idx[io++] = vo + i; idx[io++] = vo + (flip ? i + 2 : i + 1); idx[io++] = vo + (flip ? i + 1 : i + 2); }
          vo += p.count; }
        const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setIndex(new THREE.BufferAttribute(idx, 1)); G.computeBoundingSphere();
        let mat; if (sig === 'ink') mat = outlineMat; else { G.setAttribute('color', new THREE.BufferAttribute(col, 3)); const m0 = list[0].material; mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: m0.gradientMap || grad, side: m0.side }); if (m0.emissive) { mat.emissive.copy(m0.emissive); mat.emissiveIntensity = m0.emissiveIntensity; } }
        const me = new THREE.Mesh(G, mat); me.name = 'merged'; me.userData.merged = list.length; me.userData.built = true;   /* s662v baked AFTER heroBuild: already in hero space, never remapped */ if (sig !== 'ink') me.castShadow = me.receiveShadow = true; a.add(me); } }
    for (const o of take) if (o.parent) o.parent.remove(o);
    // drop groups left empty by the merge (not bones)
    const empty = []; g.traverse(o => { if (!o.isMesh && !bones.has(o) && o.children.length === 0 && !o.isSprite && !o.isLight) empty.push(o); }); for (const o of empty) if (o.parent) o.parent.remove(o);
    g.userData.mergedFox = true; }
  // s662u TALL HERO (Ben, Fox Proportions Lab build D): jointed foxes (arms 30 % longer) get legs to match (x HERO_BUILD.legs), a torso 22 % longer and a
  // head at 92 %. Built parts are moved / stretched here once. Anything strapped onto the body LATER (sword sheath, holster, strap, armour sets, back
  // weapons, charms) was tuned on the old body, so P.mapY moves it the same way: remapBody() runs at the start of every animFox (cheap: a few children),
  // and re-maps a child whenever someone sets its position again (fits, sliders). A container group sitting low (armour chest groups at y 0) is mapped
  // as a whole (affine about the hips, scale.y with the torso) so its plates still cover the longer chest. Set look.heroBuild = false to opt a fox out.
  function heroBuild(P) { const B = P.body; if (!B || !P.legs || !P.arms || P.mapY) return;
    const s0 = P.legs[0].scale.y, s1 = s0 * HERO_BUILD.legs, dL = 0.5 * (s1 - s0), hip0 = P.legs[0].position.y, sh0 = P.arms[0].position.y, k = HERO_BUILD.torso, up = (k - 1) * (sh0 + 0.06 - hip0);
    const lo = hip0 - 0.08, hi = sh0 + 0.06;
    const map = y => y < lo ? y + dL : y <= hi ? hip0 + dL + (y - hip0) * k : y + dL + up;
    const limbs = new Set([...P.legs, ...P.arms, P.head, P.tail].filter(Boolean));
    for (const c of B.children) { c.userData.built = true;
      if (P.legs.includes(c)) { c.scale.y = s1; c.position.y += dL; continue; }
      if (c === P.head) { c.position.y = map(c.position.y) + HERO_BUILD.neck; continue; }   // s662z3 a short neck: room between the chin and the crest
      const y = c.position.y, flat = Math.abs(c.rotation.z) + Math.abs(c.rotation.x) < 0.05;
      if (!limbs.has(c) && c.isMesh && c.geometry && flat) { const gb = c.geometry.boundingBox || (c.geometry.computeBoundingBox(), c.geometry.boundingBox), sy = c.scale.y, bc = (gb.min.y + gb.max.y) / 2, cy = y + bc * sy, hg = (gb.max.y - gb.min.y) * sy;
        // s662z5 TALL PIECES baked at the origin (the torso + cuirass lathes) stretch WITH the torso about the hips (they used to only move, leaving a grey bar under the shoulders)
        if (hg > 0.3 && cy > lo && cy < hi + 0.2 && !c.userData.crest) { c.position.y = hip0 + dL + (y - hip0) * k; c.scale.y = sy * k; continue; }
        const ny = map(cy), sc = cy >= lo && cy < sh0 - 0.12 && !c.userData.crest ? k : 1; c.scale.y = sy * sc; c.position.y = ny - bc * sy * sc; continue; }
      c.position.y = map(y); if (!limbs.has(c) && y >= lo && y <= hi && y < sh0 - 0.12 && flat) c.scale.y *= k; }   // s662v tilted or shoulder-height parts (pauldrons) only MOVE: stretching them skewed them wide
    if (P.head) P.head.scale.multiplyScalar(HERO_BUILD.head);
    P.mapY = map; P.hero = { dL, hip0, k, lo, hi }; }
  function remapBody(P) { const B = P.body, H = P.hero; for (const c of B.children) { const u = c.userData; if (u.built) continue;
      if (c.position.y === u.mY && c.scale.y === u.mSY) continue;
      const y = c.position.y, sy = c.scale.y; let ny, nsy = sy;
      if (y < H.lo && c.children.length) { ny = H.hip0 + H.dL + (y - H.hip0) * H.k; nsy = sy * H.k; } else ny = P.mapY(y);
      c.position.y = ny; c.scale.y = nsy; u.mY = ny; u.mSY = nsy; } }
  // s609 JOINTS: each arm gets a FOREARM child at the elbow, each leg a SHIN child at the knee. Everything below the joint (sleeve end, paw, sword,
  // gun, boot, guards) moves into it; a capsule / cylinder that crosses the joint is cut in two. animFox bends them (u.elbow / u.knee override).
  const ELB = 0.2, KNE = 0.17, ARMK = 1.3, ANK = -0.19, SOLE = 0.337;   // s662w ANK: the ankle pivot in the shin · SOLE: knee → sole (shin-local, before the leg's y scale)   // ARMK: jointed arms are 30 % longer (Fox Fighters used 35 %) so a bent elbow can show below the pauldron
  // stretch a split limb: positions along it × k, tubes (capsule / cylinder) stretched, round parts (paws, balls, rings) keep their shape
  const stretchKids = (o, k, skip) => { for (const c of o.children) { if (c === skip || c.userData.jk) continue; c.userData.jk = 1; c.position.y *= k; const ty = c.geometry && c.geometry.type; if (c.isMesh && (ty === 'CapsuleGeometry' || ty === 'CylinderGeometry')) c.scale.y *= k; } };
  function splitAt(limb, part, J) { const st = [...limb.children];
    for (const c of st) { if (c === part || c.userData.jointPart) continue; const gp = c.geometry && c.geometry.parameters, ty = c.geometry && c.geometry.type;
      if (c.isMesh && gp && (ty === 'CapsuleGeometry' || ty === 'CylinderGeometry')) { const half = ty === 'CapsuleGeometry' ? gp.length / 2 + gp.radius : gp.height / 2, top = c.position.y + half, bot = c.position.y - half;
        if (top > -J + 0.01 && bot < -J - 0.01 && Math.abs(c.rotation.x) < 0.01 && Math.abs(c.rotation.z) < 0.01) { const ol = c.children.find(o => o.isMesh && o.material && o.material.side === THREE.BackSide), olT = ol ? Math.max(0.008, (ol.scale.x - 1) * (gp.radius || gp.radiusTop || 0.08)) : 0.014;
          const mk = (y0, y1, par, off) => { const h = y0 - y1; let geo; if (ty === 'CapsuleGeometry') { const r = gp.radius; geo = new THREE.CapsuleGeometry(r, Math.max(0.01, h - r), gp.capSegments || 4, gp.radialSegments || 10); } else { const f = y => gp.radiusTop + (gp.radiusBottom - gp.radiusTop) * ((top - y) / (top - bot)); geo = new THREE.CylinderGeometry(f(y0), f(y1), h, gp.radialSegments || 14, 1, gp.openEnded); }
            const m = M(geo, c.material, c.position.x, (y0 + y1) / 2 + off, c.position.z, par, olT, ty === 'CylinderGeometry' ? Math.max(gp.radiusTop, gp.radiusBottom) : undefined); m.scale.copy(c.scale); m.castShadow = c.castShadow; m.visible = c.visible; m.userData.jointPart = true; return m; };
          const pad = ty === 'CapsuleGeometry' ? gp.radius * 0.5 : 0.0; mk(top, -J - pad, limb, 0); mk(-J + pad, bot, part, J); limb.remove(c); continue; } }
      if (c.position.y < -J - 0.005) { part.add(c); c.position.y += J; } } }
  function jointLimbs(g, P, armsOnly) { if (!P.arms || !P.legs) return; if (armsOnly) { const L0 = P.legs; P.legs = []; try { jointLimbs(g, P); } finally { P.legs = L0; P.shin = null; P.foot = null; } return; }   /* s666 armsOnly: Noble's chair rig builds its own seated legs, so only his arms + hands get joints */
    P.fore = P.arms.map(a => { const f = new THREE.Group(); f.name = 'forearm'; f.userData.fore = true; f.position.set(0, -ELB, 0); a.add(f); splitAt(a, f, ELB);
      stretchKids(a, ARMK, f); stretchKids(f, ARMK); f.position.y = -ELB * ARMK; f.userData.jk = 1; a.userData.jn = a.children.length; f.userData.jn = f.children.length; return f; });
    P.armK = ARMK; P.elb = ELB; P.kne = KNE;
    P.shin = P.legs.map(l => { const f = new THREE.Group(); f.name = 'shin'; f.userData.shin = true; f.position.set(0, -KNE, 0); l.add(f); splitAt(l, f, KNE); l.userData.jn = l.children.length; return f; });
    // s662x NATURAL LEGS (Ben: "top of the legs bigger than the bottom"): the thigh becomes a tapered lathe (full at the hip, slimming to the knee),
    // the shin a calf shape (a little swell below the knee, slim at the ankle); same material + ink, same length + joint
    // s662y polish: the outlines are run through a smooth spline (no facets), 22 sides, a slight FRONT-TO-BACK flattening (legs are deeper than wide
    // only at the calf), a rounded KNEE CAP on the front of the joint (hides the seam when the knee bends) and a soft ankle that tucks into the boot
    const lathe = (pts, squash = 1) => { const c = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y))), sm = c.getPoints(28); sm[0].x = 0; sm[sm.length - 1].x = 0;
      const g = new THREE.LatheGeometry(sm, 22); if (squash !== 1) g.scale(1, 1, squash); cvn(g); return g; };
    P.legs.forEach((l, i) => { const sh = P.shin[i];
      const th = l.children.find(c => c.isMesh && c.userData.jointPart && c.geometry.type === 'CapsuleGeometry'), cf = sh.children.find(c => c.isMesh && c.userData.jointPart && c.geometry.type === 'CapsuleGeometry');
      const swap = (m, g) => { if (!m) return; m.geometry = g; for (const o of m.children) if (o.isMesh && o.material && o.material.side === THREE.BackSide) { o.geometry = g; o.scale.set(1.12, 1.05, 1.12); } };
      swap(th, lathe([[0, -0.135], [0.07, -0.128], [0.112, -0.1], [0.13, -0.05], [0.145, 0.01], [0.152, 0.06], [0.142, 0.1], [0.1, 0.126], [0, 0.134]], 0.96));   // THIGH: full at the hip, slimming to the knee
      swap(cf, lathe([[0, -0.162], [0.052, -0.155], [0.062, -0.12], [0.07, -0.06], [0.09, 0.0], [0.112, 0.06], [0.12, 0.1], [0.108, 0.138], [0.07, 0.156], [0, 0.162]], 1.06));   // CALF: full below the knee, slim ankle
      if (cf) { const cap = M(new THREE.SphereGeometry(0.075, 16, 12), P.kneeMat || cf.material, 0, 0.03, 0.09, sh, 0.012, 0.075); cap.scale.set(1.05, 0.9, 0.82); cap.userData.jointPart = true;
        if (P.kneeRim) { const kr = M(new THREE.TorusGeometry(0.074, 0.01, 5, 20), P.kneeRim, 0, 0.03, 0.093, sh, 0); kr.scale.set(1.05, 0.9, 0.82); kr.position.z = 0.1; kr.userData.jointPart = true; } } });   // KNEE CAP (armour: a blue knee guard with a bright rim)
    // s662z2 UPPER-ARM MUSCLE (Ben: show the difference from upper to lower arm): the upper-arm tube becomes a shoulder → BICEP swell → slimmer elbow
    // shape, plus a rounded bicep on the front and a triceps line at the back. Same material, ink and length (the arm's 30 % stretch is on the mesh scale)
    P.arms.forEach(a => { const up = a.children.find(c => c.isMesh && c.userData.jointPart && c.geometry.type === 'CapsuleGeometry'); if (!up) return;
      const gp = up.geometry.parameters, r = gp.radius, h = gp.length / 2 + r;
      const prof = [[0, -h], [r * 0.62, -h * 0.94], [r * 0.86, -h * 0.72], [r * 1.0, -h * 0.4], [r * 1.24, -0.02 * h], [r * 1.32, h * 0.3], [r * 1.16, h * 0.66], [r * 0.7, h * 0.94], [0, h]];
      const g = lathe(prof, 1); up.geometry = g; for (const o of up.children) if (o.isMesh && o.material && o.material.side === THREE.BackSide) { o.geometry = g; o.scale.set(1.12, 1.04, 1.12); }
      const bi = M(new THREE.SphereGeometry(r * 0.8, 16, 12), up.material, 0, h * 0.12, r * 0.78, up, 0.012, r * 0.8); bi.scale.set(1.0, 1.5, 0.8); bi.userData.jointPart = true;   // BICEP
      const tr = M(new THREE.SphereGeometry(r * 0.7, 14, 10), up.material, 0, h * 0.22, -r * 0.72, up, 0.012, r * 0.7); tr.scale.set(0.95, 1.6, 0.75); tr.userData.jointPart = true; });   // TRICEPS
    // s662w ANKLES: the boot moves into a FOOT pivot at the ankle so it can roll heel → toe and stay flat on the ground (legTick)
    P.foot = P.shin.map(sh => { const boot = sh.children.find(c => c.isMesh && c.geometry.type === 'SphereGeometry' && Math.abs((c.geometry.parameters.radius || 0) - 0.14) < 1e-3); const ft = new THREE.Group(); ft.name = 'foot'; ft.userData.jk = 1;
      ft.position.set(0, ANK, 0); sh.add(ft); if (boot) { sh.remove(boot); boot.position.y -= ANK; ft.add(boot); } return ft; }); }
  // parts strapped on later (armour gauntlets / boots, gear) move into the forearm / shin when they sit below the joint
  function rejoint(P) { for (let i = 0; i < 2; i++) { const a = P.arms[i], l = P.legs[i];
      if (a && a.children.length !== a.userData.jn) { for (const c of [...a.children]) if (c !== P.fore[i] && !c.userData.jointPart && !c.userData.jk && c.position.y < -ELB - 0.005) { P.fore[i].add(c); c.position.y += ELB; } stretchKids(a, ARMK, P.fore[i]); a.userData.jn = a.children.length; }
      { const f = P.fore[i]; if (f && f.children.length !== f.userData.jn) { stretchKids(f, ARMK); f.userData.jn = f.children.length; } }
      if (l && l.children.length !== l.userData.jn) { for (const c of [...l.children]) if (c !== P.shin[i] && !c.userData.jointPart && c.position.y < -KNE - 0.005) { P.shin[i].add(c); c.position.y += KNE; } l.userData.jn = l.children.length; } } }
  // arm angle incl. the elbow, for things held in the paw (sword, gun) that are levelled against the whole arm
  const armX = o => { const p = o.parent; return p ? p.rotation.x + (p.userData.fore && p.parent ? p.parent.rotation.x : 0) : 0; };
  // HAND TICK. u.grip [l, r] 0 open .. 1 fist · u.point index out · u.spread fan · u.thumbUp · u.oppose (thumb faces the fingers, for grabbing)
  // · u.fcurl [[i, m, r, p], …] + u.fcK per-finger curl override (finger wave, counting) · u.wrist [[flex, side], …] wrist offsets.
  // ANATOMY: at rest the palm faces the thigh, thumb forward; fingers CASCADE (index least curled, pinky most); curling fingers converge toward
  // the thumb; a fist folds all knuckles, tips into the palm, and the thumb wraps OUTSIDE across index + middle.
  const _DN = new THREE.Vector3(0, -1, 0), _d1 = new THREE.Vector3(), _d2 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  const TH = { rest: [-0.3, -0.82, -0.48], open: [-0.78, -0.58, -0.22], fist: [0.86, -0.2, -0.47], up: [-1, 0.1, -0.12], op: [-0.32, -0.48, -0.82] };
  const TB = { rest: [-0.058, 0.0, -0.012], open: [-0.06, 0.004, -0.008], fist: [-0.048, -0.026, -0.046], up: [-0.064, -0.01, -0.03], op: [-0.056, 0.0, -0.034] };
  const TK = { rest: 0.35, open: 0.04, fist: 0.5, up: 0.0, op: 0.28 };
  const lerp3 = (o, a, w, sd) => { o[0] += (a[0] * sd - o[0]) * w; o[1] += (a[1] - o[1]) * w; o[2] += (a[2] - o[2]) * w; };
  function handTick(c, dt, mv) { const u = c.userData, P = u.P; if (!P.hands) return; const hold = u.hold || {}, G = u.grip || [], PT = u.point || [], FC = u.fcurl || [], TU = u.thumbUp || [], OP = u.oppose || [], WR = u.wrist || [];
    for (let i = 0; i < 2; i++) { const H = P.hands[i], s = H.sd, held = i === 0 ? hold.left : hold.right, F = P.fore && P.fore[i];
      if (F) { let n = 0; F.traverse(() => n++); H.fcount = n; if (H.cuffN !== n) fitCuff(H, F, P); }
      let tg = G[i] != null ? G[i] : held ? 1 : mv ? 0.45 : 0.3 + Math.sin(u.phase * 0.7 + i) * 0.04;
      H.grip = damp(H.grip, tg, 16, dt); H.pt = damp(H.pt, PT[i] ? 1 : 0, 16, dt); H.tu = damp(H.tu, TU[i] || 0, 14, dt); H.op = damp(H.op, OP[i] || 0, 14, dt); H.fw = damp(H.fw, FC[i] ? (u.fcK ?? 1) : 0, 14, dt);
      const gq = H.grip, sp = Math.min(1.8, u.spread ?? 1) * (1 - gq), casc = 0.17 * Math.sin(Math.PI * Math.min(1, gq * 1.1));
      for (const f of H.fingers) { let q = Math.max(0, Math.min(1, gq + (f.k - 1.5) * casc)); if (f.k === 0) q *= 1 - H.pt; if (FC[i]) H.fl = FC[i]; if (H.fl && H.fw > 0.001) q += (H.fl[f.k] - q) * H.fw;
        const mic = (1 - gq) * 0.05 * Math.sin(u.phase * 0.9 + f.k * 1.3 + H.ph);   // tiny living drift in the fingers
        if (f.b) { f.a.rotation.x = 0.08 + q * 1.62 + mic; f.b.rotation.x = 0.05 + q * 1.85 + mic * 0.6; } else f.a.rotation.x = 0.1 + q * 2.3 + mic;
        f.a.rotation.z = (f.k - 1.5) * 0.15 * sp * s - s * f.k * 0.07 * q; }   // fan when open · converge toward the thumb when curled
      // thumb: blend rest → open (spread) → fist (grip) → opposed (grab) → up (thumbs up / finger guns)
      const wo = Math.max(0, Math.min(1, (0.34 - gq) / 0.34)) * Math.min(1.2, u.spread ?? 1), wf = Math.max(0, Math.min(1, (gq - 0.36) / 0.56)), D = [TH.rest[0] * s, TH.rest[1], TH.rest[2]], B = [TB.rest[0] * s, TB.rest[1], TB.rest[2]];
      let bend = TK.rest; const step = (k, w) => { if (w <= 0) return; lerp3(D, TH[k], w, s); lerp3(B, TB[k], w, s); bend += (TK[k] - bend) * w; };
      step('open', Math.min(1, wo)); step('fist', wf); step('op', H.op); step('up', H.tu);
      _d1.set(D[0], D[1], D[2]).normalize(); _q1.setFromUnitVectors(_DN, _d1); H.th.quaternion.copy(_q1); H.th.position.set(B[0], B[1], B[2]);
      _d2.set(s * 0.7, -0.05, -0.4).normalize().multiplyScalar(bend * 1.4).add(_d1).normalize(); _q2.setFromUnitVectors(_DN, _d2); H.th2.quaternion.copy(_q1.invert().multiply(_q2));
      // wrist: palm toward the thigh (forearm turned so the thumb leads), a slight relaxed flex; straight when gripping a weapon
      const W = WR[i] || [0, 0]; H.wx = damp(H.wx, Math.max(-0.55, Math.min(0.55, (held ? 0 : 0.12) + W[0])), 18, dt); H.wz = damp(H.wz, Math.max(-0.5, Math.min(0.5, W[1])), 18, dt);
      H.g.rotation.set(H.wx, s * 1.37, H.wz * s);
      // s609w (Ben): the paw sits UP in the cuff at rest (little wrist showing) and slides OUT when it reaches (wave, point, grab: u.handExt)
      const EX = u.handExt || []; H.ext = damp(H.ext, held ? 0.35 : (EX[i] || 0), 10, dt); H.hg.position.y = -0.052 - 0.042 * H.ext; } }
  function bendJoints(c, dt, mv, air) { const u = c.userData, P = u.P; if (!P.fore || u.chair) return; rejoint(P);
    const E = u.elbow || [], K = u.knee || [], hold = u.hold || {};
    for (let i = 0; i < 2; i++) { P.arms[i].rotation.y = 0; P.legs[i].rotation.y = 0; P.legs[i].rotation.z = 0; P.fore[i].rotation.y = 0; P.shin[i].rotation.y = 0; P.shin[i].rotation.z = 0; }   // pose IK leaves twist behind
    for (let i = 0; i < 2; i++) { const ax = P.arms[i].rotation.x; let e = air ? -0.35 : -(0.16 + Math.max(0, -ax) * 0.45 + (mv ? 0.3 * u.amt : 0) + 0.85 * (u.legRun || 0));
      if ((i === 0 && hold.left) || (i === 1 && hold.right)) e = 0; if (E[i] != null) e = E[i];
      const snap = (i === 0 && hold.left) || (i === 1 && hold.right); P.fore[i].rotation.x = snap ? e : damp(P.fore[i].rotation.x, e, 14, dt); P.fore[i].rotation.z = E[i + 2] != null ? E[i + 2] : 0;
      const cs = Math.cos(u.phase) * (i ? 1 : -1); let k = air ? 0.9 : 0.06 + (mv ? Math.max(0, cs) * 1.1 * u.amt : 0); if (K[i] != null) k = K[i];
      P.shin[i].rotation.x = damp(P.shin[i].rotation.x, k, 16, dt); } }
  // s662w LEG MOVEMENT (Ben: "all of it"): a real walk cycle (heel strike, knee bends as the foot passes, push off the toes), ANKLES that roll heel →
  // toe and keep the boot flat, RUN (higher knee lift, longer stride, lean), hip sway + the body riding on the stance leg (the planted foot stays on
  // the ground: the body height is solved from the legs), IDLE weight shifts, a FIGHTING STANCE while the sword is out, JUMP (tuck in the air, knees
  // absorb the landing), u.legPose = 'crouch' | 'kneel' | 'sit', and feet that plant on slopes + stairs when the map gives u.groundAt(x, z) → y.
  // A pose system that drives the legs sets u.legOff = true (or u.knee) and this stays out of its way. Jointed foxes only (P.foot).
  const _lv = new THREE.Vector3(), _lw = new THREE.Vector3(), _lm = new THREE.Matrix4(), _lm2 = new THREE.Matrix4();
  const SOLE_PTS = [[0, -0.147, 0.05], [0, -0.125, 0.21], [0, -0.125, -0.1]].map(([x, y, z]) => new THREE.Vector3(x, y, z));   // boot bottom in foot-local space: centre, toe, heel (boot centre 0, -0.06, 0.05; radius 0.14 x 0.62 / 1.35)
  function legReach(h, k, s) { const ky = -KNE * s, sy = -SOLE * s * Math.cos(k), sz = -SOLE * Math.sin(k), y = ky + sy, z = sz;   // foot in hip space (leg scale s on y only), then the hip turn
    return { y: -(y * Math.cos(h) - z * Math.sin(h)), z: y * Math.sin(h) + z * Math.cos(h) }; }   // y = how far below the hip, z = forward
  const flatFoot = (h, k, s, wp) => Math.atan2(Math.sin(-h + wp), s * Math.cos(-h + wp)) - k;   // foot pitch that gives the boot a world pitch wp
  const LP = { crouch: { h: [-1.0, -1.0], k: [1.75, 1.75], lean: 0.3 }, kneel: { h: [0.05, -1.5], k: [1.75, 2.0], lean: 0.12 }, sit: { h: [-1.45, -1.45], k: [1.45, 1.45], lean: 0, noGround: true } };
  function legTick(c, dt, speed, mv, air) { const u = c.userData, P = u.P, L = P.legs, S = P.shin, F = P.foot, s = L[0].scale.y || 1, B = P.body;
    const ss = x => x * x * (3 - 2 * x), cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), TAU = Math.PI * 2;
    const run = u.runK ?? cl((speed - 3.4) / 2.6), amt = u.amt, ph = u.phase, LIGHT = u.gait === 'light';   /* s665 Hope: a lighter, bouncier step (shorter stride, more spring, higher push-off) */
    u.legRun = damp(u.legRun || 0, run * amt, 6, dt); const R = u.legRun;
    // landing
    if (u.wasAir && !air) u.land = 1; u.wasAir = air; u.land = Math.max(0, (u.land || 0) - dt / 0.32); const ld = Math.sin(Math.PI * Math.min(1, u.land * 1.0)) * (u.land > 0 ? 1 : 0);
    // idle weight shift
    if (!mv && !air) { u.wsT = (u.wsT ?? 3 + Math.random() * 3) - dt; if (u.wsT < 0) { u.wsT = 4 + Math.random() * 4; u.wsTo = u.wsTo ? 0 : (Math.random() < 0.5 ? -1 : 1); } } else u.wsTo = 0;
    u.ws = damp(u.ws || 0, u.wsTo || 0, 2.2, dt);
    const drawn = !!(u.rig && u.rig.drawn) && !mv && !air; u.stK = damp(u.stK || 0, drawn ? 1 : 0, 7, dt);
    const lp = LP[u.legPose]; u.lpK = damp(u.lpK || 0, lp ? 1 : 0, 6, dt); if (lp) u.lpLast = u.legPose; const LPu = LP[u.lpLast] || null;
    const H = [0, 0], K = [0, 0], WP = [0, 0], Z = [0, 0];
    for (let i = 0; i < 2; i++) { const p = ((ph + (i ? Math.PI : 0)) % TAU + TAU) % TAU, A = (0.5 + 0.28 * R) * amt * (LIGHT ? 0.86 : 1);
      let h = A * Math.sin(p) - 0.1 * R, k = 0.07, wp = 0;
      if (Math.cos(p) < 0) { const sp = (p - Math.PI / 2) / Math.PI; k += (0.85 + 1.05 * R) * amt * Math.sin(Math.PI * sp); wp = (-0.12 - 0.15 * R) * amt * Math.sin(Math.PI * sp); }   // SWING: knee lifts the foot through, toes up to clear
      else { const tp = ((p - 1.5 * Math.PI + TAU) % TAU) / Math.PI;   // STANCE 0 heel strike → 1 toe off
        k += (0.14 + 0.2 * R) * amt * Math.sin(Math.PI * Math.min(1, tp * 2.4));   // the knee takes the load after the heel lands
        wp = amt * (tp < 0.16 ? -0.3 * (1 - tp / 0.16) : tp > 0.72 ? (0.55 + 0.25 * R + (LIGHT ? 0.25 : 0)) * ss((tp - 0.72) / 0.28) : 0); }   // heel strike (toes up) · push off (heel up)
      // idle weight shift: the loaded leg straight, the other soft + a little forward
      const load = i ? -u.ws : u.ws; k += Math.max(0, -load) * 0.28 * (1 - amt); h -= Math.max(0, -load) * 0.08 * (1 - amt);
      // fighting stance (sword out): feet apart, left foot forward, knees bent
      h = h * (1 - u.stK) + u.stK * (i ? -0.32 : 0.16); k = k * (1 - u.stK) + u.stK * (i ? 0.5 : 0.42);
      // jump: tuck in the air, absorb on landing
      if (air) { h = i ? -0.85 : -0.45; k = i ? 1.45 : 1.05; wp = 0.25; }
      h -= 0.42 * ld; k += 0.95 * ld;
      // crouch / kneel / sit
      if (LPu) { h = h * (1 - u.lpK) + u.lpK * LPu.h[i]; k = k * (1 - u.lpK) + u.lpK * LPu.k[i]; wp = wp * (1 - u.lpK) + u.lpK * (u.lpLast === 'kneel' && i === 0 ? 0.9 : 0); }
      if (u.knee && u.knee[i] != null) k = u.knee[i];
      H[i] = h; K[i] = k; WP[i] = wp; }
    // slopes + stairs: each foot reaches for its own ground (2-bone, the knee bends to shorten the leg), the body drops to the lower foot
    let dRoot = 0; const G = [0, 0];
    if (u.groundAt && !air && u.lpK < 0.5) { c.updateMatrixWorld(true); c.getWorldPosition(_lv); const g0 = u.groundAt(_lv.x, _lv.z); const wsc = c.getWorldScale(_lw).y || 1;
      for (let i = 0; i < 2; i++) { const q = legReach(H[i], K[i], s); _lw.set(L[i].position.x, 0, q.z).applyQuaternion(c.quaternion).multiplyScalar(wsc); const gi = u.groundAt(_lv.x + _lw.x, _lv.z + _lw.z);
        G[i] = gi == null || g0 == null || !isFinite(gi) ? 0 : Math.max(-0.45, Math.min(0.45, (gi - g0) / wsc)); }
      dRoot = Math.min(0, G[0], G[1]);
      for (let i = 0; i < 2; i++) { const need = G[i] - dRoot; if (need > 0.004) {   /* s662z11 fix: only the HIGHER foot shortens, by how much higher its ground is (was the whole leg length: Meru crouched) */ const want = legReach(H[i], K[i], s).y - need; let lo = K[i], hi = 2.6; for (let n = 0; n < 18; n++) { const m = (lo + hi) / 2; if (legReach(H[i] - (m - K[i]) * 0.45, m, s).y > want) lo = m; else hi = m; } const k2 = (lo + hi) / 2; H[i] -= (k2 - K[i]) * 0.45; K[i] = k2; } } }
    // write the legs + feet; the body rides on the leg that reaches lowest (the planted one)
    const rest = legReach(0, 0.07, s).y; let reach = -1e9;
    const SPRD = (u.legSpread ?? 0.055) * (1 - 0.6 * amt);   /* s662z9 Ben: legs a little apart at rest (closer while walking so the feet track under the hips) */
    for (let i = 0; i < 2; i++) { L[i].rotation.x = H[i]; L[i].rotation.z = (i ? 1 : -1) * (SPRD + 0.13 * u.stK + 0.04 * u.lpK * (u.lpLast === 'crouch' ? 1 : 0)) + (i ? -1 : 1) * 0.03 * u.ws * (1 - amt); S[i].rotation.x = K[i];
      F[i].rotation.x = Math.max(-0.9, Math.min(1.2, flatFoot(H[i], K[i], s, WP[i]))); F[i].rotation.z = -L[i].rotation.z * 0.9; F[i].rotation.y = (i ? 1 : -1) * 0.1 * (1 - amt);   /* soles flat side-to-side + toes turned slightly out at rest */ reach = Math.max(reach, legReach(H[i], K[i], s).y - (G[i] - dRoot)); }
    const noG = LPu && LPu.noGround && u.lpK > 0.5;
    // s662z8 GROUNDING BY MEASUREMENT (verifier: boots sank 29-40 cm in crouch / kneel): the true lowest points (3 sole points per boot + the knee caps
    // when kneeling) are pushed through the real chain body → leg → shin → foot, and the body is raised / lowered so the lowest contact sits on its ground
    let gy = 0; if (!noG) { B.position.y = 0; B.updateMatrix(); let lo = 1e9; const kneelK = u.lpLast === 'kneel' ? u.lpK : 0;
      for (let i = 0; i < 2; i++) { L[i].updateMatrix(); S[i].updateMatrix(); F[i].updateMatrix(); _lm.multiplyMatrices(B.matrix, L[i].matrix).multiply(S[i].matrix); _lm2.multiplyMatrices(_lm, F[i].matrix);
        for (const p of SOLE_PTS) { _lv.copy(p).applyMatrix4(_lm2); lo = Math.min(lo, _lv.y - G[i] + dRoot); }
        if (kneelK > 0.3) { _lv.set(0, 0.03, 0.12).applyMatrix4(_lm); lo = Math.min(lo, _lv.y - G[i] + dRoot); } }
      gy = -lo + dRoot; }
    B.position.y = gy + (u.hopY || 0) + (R > 0 ? 0.05 * R * Math.max(0, -Math.cos(2 * ph)) : 0) + (LIGHT ? 0.03 * amt * Math.max(0, -Math.cos(2 * ph)) : 0);
    B.position.x = 0.035 * u.ws * (1 - amt); B.rotation.z = 0.045 * amt * Math.sin(ph) * (1 - 0.5 * R) - 0.03 * u.ws * (1 - amt);
    u.leanX = 0.16 * R + 0.1 * u.stK + 0.18 * ld + (LPu ? LPu.lean * u.lpK : 0); }
  const tmpV = new THREE.Vector3();
  function animFox(c, dt, speed, air = false) {
    const u = c.userData, P = u.P, mv = speed > 0.2; if (P.mapY) remapBody(P); u.phase += dt * (mv ? 3 + speed * 1.4 : 1.4); u.amt = damp(u.amt, mv ? Math.min(1, speed / 4) : 0, 10, dt);
    const mood = u.lineMood || u.mood, md = MOOD[mood] || MOOD.neutral, lively = mood === 'excited' || mood === 'happy';
    const sw = Math.sin(u.phase) * 0.9 * u.amt;
    if (u.hop > 0) { u.hop = Math.max(0, u.hop - dt * 2.6); }
    u.hopY = Math.sin((1 - u.hop) * Math.PI) * (u.hop > 0 ? 0.22 : 0);
    if (!u.chair) {
      P.legs[0].rotation.x = air ? -0.6 : sw; P.legs[1].rotation.x = air ? 0.4 : -sw;
      P.arms[0].rotation.x = air ? -2.3 : -sw * 0.8; P.arms[1].rotation.x = air ? -2.3 : sw * 0.8;
      P.body.position.y = Math.abs(Math.sin(u.phase)) * 0.06 * u.amt + u.hopY + (mv ? 0 : Math.sin(u.phase * 1.3) * 0.008);
    } else { P.wheels.forEach(w => w.rotation.x += speed * dt / 0.42); P.arms.forEach(a => a.rotation.x = -0.5 + Math.sin(u.phase) * 0.4 * u.amt); P.body.position.y = u.hopY * 0.4; }
    if (u.talking && !mv && !u.chair) { const ga = (u.talkStyle && u.talkStyle.gest) ?? 1; P.arms[1].rotation.x = -0.5 * ga + Math.sin(u.phase * 2.2 * ((u.talkStyle && u.talkStyle.rate) || 1)) * 0.25 * ga; P.arms[1].rotation.z = 0.12 + 0.23 * ga; if (ga > 1.2) { P.arms[0].rotation.x = -0.4 + Math.sin(u.phase * 2.6 + 1) * 0.3; } } else { P.arms[1].rotation.z = 0.12; }
    P.arms[0].rotation.z = -0.12;
    if (u.hold && !air) { if (u.hold.right && !(u.talking && !mv)) { P.arms[1].rotation.x = P.arms[1].rotation.x * 0.35 - 0.55; P.arms[1].rotation.z = 0.18; } if (u.hold.left) { P.arms[0].rotation.x = P.arms[0].rotation.x * 0.35 - 0.75; P.arms[0].rotation.z = -0.16; } }
    u.pulseT = (u.pulseT || 0) + dt;
    bendJoints(c, dt, mv, air); if (P.foot && !u.chair && !u.legOff) legTick(c, dt, speed, mv, air); handTick(c, dt, mv);
    if (P.sword) { P.sword.rotation.set(0.95 - armX(P.sword), 0, -0.5); const p = 0.5 + 0.5 * Math.sin(u.pulseT * 3.2); P.bladeMat.emissiveIntensity = 0.4 + p * 1.6; P.bladeMat.color.setRGB(1, 1, 1).lerp(P.bladeMat.emissive, 0.15 + p * 0.65);  }
    if (P.tipMat) { const p = Math.pow(0.5 + 0.5 * Math.sin(u.pulseT * 5.0 + 1), 2); P.tipMat.emissiveIntensity = 0.6 + p * 2.6; P.tipGlow.scale.setScalar(0.18 + p * 0.32); P.tipGlow.material.opacity = 0.35 + p * 0.65; }
    if (P.gun) { P.gun.rotation.set(-armX(P.gun) - 0.05, 0, 0); }
    P.body.rotation.x = damp(P.body.rotation.x, (mv ? 0.08 * u.amt : (mood === 'sad' ? 0.06 : mood === 'excited' ? -0.05 : 0)) + (P.foot && !u.legOff ? u.leanX || 0 : 0), 6, dt);
    // tail + ears by mood
    const wag = (lively ? 2.6 : mv ? 1 : 0.6) * (u.wagMul ?? 1);   // u.wagMul: per-fox wag speed (1 = default)
    P.tail.rotation.y = Math.sin(u.phase * wag) * (lively ? 0.55 : 0.32); P.tail.rotation.x = (mood === 'sad' ? 0.5 : -0.1) + Math.sin(u.phase * 0.5) * 0.08;
    const earX = mood === 'sad' ? 0.55 : mood === 'shock' ? 0.5 : mood === 'sleepy' ? 0.42 : mood === 'stern' || mood === 'determined' ? 0.28 : mood === 'surprised' || lively ? -0.18 : 0;
    const earZ = mood === 'sad' ? 0.35 : 0;
    // s609h EAR LIFE: both ears swivel toward where the fox looks, lag + flop when the head turns (spring), one-ear TWITCHES at random,
    // perk up + forward when surprised / excited, swing back + out when sad, scared or sleepy (airplane ears)
    { const hy0 = P.head.rotation.y, dh = (hy0 - (u.earHy ?? hy0)) / Math.max(dt, 1e-3); u.earHy = hy0; u.earV = (u.earV || 0) + ((-dh * 0.06) - (u.earLag || 0)) * Math.min(1, dt * 30) - (u.earV || 0) * Math.min(1, dt * 6); u.earLag = Math.max(-0.4, Math.min(0.4, (u.earLag || 0) + (u.earV || 0) * dt * 10));
      u.twT = (u.twT ?? rr(1.5, 4)) - dt; if (u.twT < 0) { u.twT = rr(1.8, 5.5); u.twE = Math.random() < 0.5 ? 0 : 1; u.twK = 0.28; } u.twK = Math.max(0, (u.twK || 0) - dt);
      const back = mood === 'sad' || mood === 'shock' || mood === 'sleepy' || mood === 'squint' || mood === 'nervous' || mood === 'shy' || mood === 'disgust' || mood === 'embarrassed' || mood === 'guilty' ? 1 : mood === 'bored' || mood === 'grumpy' || mood === 'frustrated' ? 0.5 : 0, perk = mood === 'surprised' || lively || mood === 'curious' || mood === 'joy' || mood === 'proud' || mood === 'love' || mood === 'amazed' || mood === 'hopeful' || mood === 'brave' || mood === 'mischief' ? 1 : 0, lk = (u.look || 0) * 0.3;
      P.ears.forEach((e, i) => { const s = i ? 1 : -1, tw = u.twE === i && u.twK > 0 ? Math.sin(u.twK / 0.28 * Math.PI) : 0;
        e.rotation.x = damp(e.rotation.x, (e.userData.baseX || 0) + earX - perk * 0.08 - tw * 0.32 + Math.abs(u.earLag || 0) * 0.3, 10, dt);
        e.rotation.z = damp(e.rotation.z, -s * ((e.userData.baseTilt ?? 0.3) + earZ + back * 0.28 - perk * 0.12 + tw * 0.1), 8, dt);
        e.rotation.y = damp(e.rotation.y, (e.userData.baseY || 0) + lk + (u.earLag || 0) * 0.8 - s * back * 0.35 + s * tw * 0.4, 9, dt); }); }
    // head: look at a target, idle tilt
    let hy = 0, hx = mood === 'sad' ? 0.12 : 0, hz = 0; if (u.talking) { const ts = u.talkStyle || {}, ga = ts.gest ?? 1, mt = u.mt || 0; hx += (u.mouth || 0) * 0.06 * ga + Math.sin(mt * 2.1) * 0.025 * ga; hy += Math.sin(mt * 0.9) * 0.08 * ga; hz = Math.sin(mt * 1.3 + 0.7) * 0.05 * ga; } u.hz = damp(u.hz || 0, hz, 6, dt);
    if (u.lookAt) { c.updateWorldMatrix(true, false); tmpV.copy(u.lookAt); c.worldToLocal(tmpV); hy = clamp(Math.atan2(tmpV.x, tmpV.z), -0.85, 0.85); hx += clamp(-Math.atan2(tmpV.y - 1.6, Math.hypot(tmpV.x, tmpV.z)) * 0.5, -0.25, 0.25); }
    P.head.rotation.y = damp(P.head.rotation.y, hy, 6, dt); P.head.rotation.x = damp(P.head.rotation.x, hx, 6, dt);
    P.head.rotation.z = damp(P.head.rotation.z, (mood === 'curious' ? 0.16 : 0) + Math.sin(u.phase * 0.35) * 0.04 + (u.hz || 0), 5, dt);
    // s609i HAIR SPRING: locks lag the head (turns + nods), bounce with hops / steps, sway a little at rest, stand up when shocked
    if (((P.hair && P.hair.length) || (P.ruff && P.ruff.length)) && dt > 1e-4) { const H = u.hairS || (u.hairS = { px: P.head.rotation.x, py: P.head.rotation.y, pb: 0, ox: 0, oz: 0, vx: 0, vz: 0, up: 0 }), by = P.body.position.y + c.position.y;
      const wx = (P.head.rotation.x + P.body.rotation.x - H.px) / dt, wy = (P.head.rotation.y + P.body.rotation.y - H.py) / dt, vb = (by - H.pb) / dt; H.px = P.head.rotation.x + P.body.rotation.x; H.py = P.head.rotation.y + P.body.rotation.y; H.pb = by;
      const stepK = (u.amt || 0), step = stepK * (Math.abs(Math.sin(u.phase)) - 0.64) * 2.2, sway2 = stepK * Math.sin(u.phase) * 0.5;   // s609s WALK BOB: two bounces per stride (each footfall) + a side-to-side sway
      const tx = clamp(-wx * 0.07 + vb * 0.06 + step * 0.45, -0.6, 0.6), tz = clamp(wy * 0.09 + sway2 * 0.35, -0.6, 0.6);
      H.vx += ((tx - H.ox) * 160 - H.vx * 11) * dt; H.ox += H.vx * dt; H.vz += ((tz - H.oz) * 160 - H.vz * 11) * dt; H.oz += H.vz * dt; H.ox = clamp(H.ox, -0.7, 0.7); H.oz = clamp(H.oz, -0.7, 0.7);
      H.up = damp(H.up, mood === 'shock' ? 1 : mood === 'surprised' ? 0.45 : 0, 12, dt);
      const mo = u.mouth || 0; H.tk = damp(H.tk || 0, u.talking ? mo : 0, 18, dt);   // s609s TALK: the hair flutters with the jaw, like the ruff
      for (const g of P.hair || []) { const d = g.userData, w = d.w, sway = Math.sin(u.phase * 0.8 + g.position.x * 20) * 0.03 * w, tf = H.tk * (d.kind === 'front' ? 0.16 : d.kind === 'crown' ? 0.09 : 0.05) * (0.7 + 0.3 * Math.sin(u.mt * 23 + g.position.x * 31));
        g.rotation.x = d.bx + H.ox * w + sway - tf - (d.kind === 'front' ? H.up * 0.45 : d.kind === 'crown' ? -H.up * 0.3 : 0); g.rotation.z = d.bz + H.oz * w + sway * 0.6 + tf * 0.4 * Math.sign(g.position.x || 1); } }
    // s609j RUFF SPRING: cheek fluff swings opposite to head turns, bounces with the hair spring, puffs out in shock, flutters when talking
    if (P.ruff && P.ruff.length && u.hairS) { const H = u.hairS, puff = H.up || 0, tk = u.talking ? (u.mouth || 0) * 0.08 : 0;
      for (const g of P.ruff) { const d = g.userData; g.rotation.y = -d.s * (H.oz * 0.6 * d.w) + d.s * puff * 0.25; g.rotation.z = d.s * (H.ox * 0.4 * d.w + puff * 0.3 + tk) + Math.sin(u.phase * 0.9 + d.w * 7) * 0.025; } }
    if (u.talking && P.ears) { u.earT = (u.earT || 0) - dt; if (u.earT < 0) { u.earT = 1.2 + Math.random() * 1.6; u.earK = 0.25; } u.earK = Math.max(0, (u.earK || 0) - dt); if (u.earK > 0) { const e = P.ears[u.earT > 2 ? 0 : 1]; e.rotation.x -= Math.sin(u.earK / 0.25 * Math.PI) * 0.14; } }
    // face
    u.blink -= dt; if (u.blink < 0) { u.blinkT = 0.14; u.blink = rr(2, 5); } u.blinkT = Math.max(0, u.blinkT - dt);
    let bl = u.blinkT > 0 ? Math.sin((u.blinkT / 0.14) * Math.PI) : 0;
    u.lookT -= dt; if (u.lookT < 0) { u.lookT = rr(1.2, 3.5); u.lookTo = u.lookAt || u.talking ? 0 : pick([-1, -0.6, 0, 0, 0.6, 1]); }
    u.look = damp(u.look, u.lookTo, 8, dt);
    u.mt = (u.mt || 0) + dt; { const ts = u.talkStyle || { rate: 1, amp: 1, base: 0.25 };
      let V = null, VN = null, kN = 0, amp = ts.amp ?? 1;
      if (u.say && u.say.text) { const S2 = u.say; if (!S2.tl) { S2.tl = visemeTimeline(S2.text); S2.j = 0; } S2.t += dt * (ts.rate || 1); const TL = S2.tl, last = TL[TL.length - 1], end = last ? last.t0 + last.d : 0;
        let j = S2.j || 0; while (j < TL.length - 1 && TL[j + 1].t0 <= S2.t) j++; S2.j = j; const seg = TL[j];
        if (seg && S2.t < end) { V = seg.v; const nx = TL[j + 1], fr = (S2.t - seg.t0) / seg.d; if (nx && fr > 0.55) { VN = nx.v; kN = (fr - 0.55) / 0.45 * 0.5; } }
        S2.shown = S2.t >= end ? S2.text.length : Math.min(S2.text.length, seg ? seg.ci + 1 : 0); u.talking = S2.t < end + 0.2; if (S2.t > end + 0.8) { u.say = null; u.talking = false; } }
      else if (u.talking) { const r = u.mt * 7.5 * (ts.rate || 1), k = Math.floor(r); V = BABBLE[k % BABBLE.length]; VN = BABBLE[(k + 1) % BABBLE.length]; kN = Math.max(0, (r - k - 0.6) / 0.4) * 0.5; amp *= 0.75 + 0.25 * Math.sin(u.mt * 3.7); }
      const MB = { ...MP0, ...(MOUTH_MOOD[mood] || MOUTH_MOOD.neutral) }; let T;
      if (V) { const mixV = (A, B, k) => { const o = {}; for (const q in MP0) o[q] = (A[q] ?? 0) + ((B ? B[q] ?? 0 : A[q] ?? 0) - (A[q] ?? 0)) * k; return o; }, vv = mixV({ ...VIS[V], wide: VIS[V].wide ?? MB.wide }, VN ? { ...VIS[VN], wide: VIS[VN].wide ?? MB.wide } : null, kN);
        T = { ...vv, open: vv.open * amp, smile: MB.smile * 0.7 + vv.smile, smirk: MB.smirk * 0.6, fw: 0 }; }
      else { T = MB; const hp2 = u.faceHold && u.faceHold.mp; if (hp2) T = { ...MB, ...hp2 }; const hm = u.faceHold && u.faceHold.mouth; if (hm != null && hm > T.open) T = { ...T, open: hm, teeth: Math.max(MB.teeth, hm * 0.6), lteeth: Math.max(MB.lteeth, hm * 0.3), round: MB.round * 0.5 }; }
      const mp = u.mp || (u.mp = { ...MP0, fw: 1 }), rate = V ? 30 : 12; for (const q in MP0) mp[q] = damp(mp[q], T[q] ?? MP0[q], rate, dt);
      u.mouth = mp.open; u.vis = V || 'rest'; }
    if (u.m3dTick) u.m3dTick(dt);
    if (u.faceHold) { const h = u.faceHold; if (h.look != null) u.look = h.look; if (h.blink != null) bl = Math.max(bl, h.blink); u.lookY = h.lookY || 0; } else u.lookY = damp(u.lookY || 0, 0, 8, dt);   // s609 fox-poses face control
    { const mo = u.mouth || 0; if (P.snout) { const a = damp(u.snoutA || 0, -mo * 0.24, 20, dt); u.snoutA = a; P.snout.rotation.x = 0.02 + a;
        if (!u.snoutBase) { const o = P.snout.position.clone(); u.snoutBase = [P.nose, P.shine, P.bridge].filter(Boolean).map(m => [m, m.position.clone(), m.rotation.x]); u.snoutO = o; }
        const c = Math.cos(a), sn = Math.sin(a), O = u.snoutO; for (const [m, p0, r0] of u.snoutBase) { const dy = p0.y - O.y, dz = p0.z - O.z; m.position.set(p0.x, O.y + dy * c - dz * sn, O.z + dy * sn + dz * c); m.rotation.x = r0 + a; } } u.browUp = damp(u.browUp || 0, u.talking ? Math.max(0, mo - 0.55) * 2.2 : 0, 10, dt); }
    // s609x EYES + BROWS EASE between moods (Ben: in POINT the eyes snapped wide open): lid, iris, brows glide; happy-closed eyes close gradually
    { const MT = MOOD[mood] || MOOD.neutral, fm = u.fm || (u.fm = { bi: MT.bi || 0, bo: MT.bo || 0, lid: MT.lid || 0, iris: MT.iris ?? 1, cl: MT.closed ? 1 : 0, wk: MT.wink ? 1 : 0, browL: MT.browL || 0, browR: MT.browR || 0 });
      for (const q of ['bi', 'bo', 'browL', 'browR']) fm[q] = damp(fm[q], MT[q] || 0, 8, dt); fm.iris = damp(fm.iris, MT.iris ?? 1, 7, dt); fm.cl = damp(fm.cl, MT.closed && (Math.floor((u.mt || 0) / 0.75) % 2 === 1) ? 1 : 0, 9, dt);   // s609z3 (Ben): happy-closed eyes only HALF the time (excited / joy, talking or not) fm.wk = damp(fm.wk, MT.wink ? 1 : 0, 10, dt);
      fm.lid = damp(fm.lid, MT.lid || 0, 6, dt); }
    const fmo = u.fm ? { bi: Math.round(u.fm.bi), bo: Math.round(u.fm.bo), browL: Math.round(u.fm.browL), browR: Math.round(u.fm.browR), iris: Math.round(u.fm.iris * 20) / 20, lid: Math.round(Math.max(u.fm.lid, u.fm.cl * 0.92) * 20) / 20, closed: u.fm.cl > 0.6, wink: u.fm.wk > 0.5 } : null;
    const mq = u.mp ? Object.keys(MP0).map(q => Math.round(u.mp[q] * 10)).join(',') : '', f = u.face, key = `${Math.round(bl * 4)}|${mood}|${mq}|${fmo ? Object.values(fmo).join(',') : ''}|${Math.round(u.mouth * 5)}|${Math.round((u.browUp || 0) * 3)}|${Math.round(u.look * 4)}|${Math.round((u.lookY || 0) * 4)}`;
    if (key !== f.key) { f.key = key; drawFace(f.ctx, { m3d: !!f.m3d, fm: fmo, mp: u.mp ? Object.fromEntries(Object.keys(MP0).map(q => [q, Math.round(u.mp[q] * 10) / 10])) : null, vis: u.vis, browUp: Math.round((u.browUp || 0) * 3) / 3, L: f.L, sun: f.sun, eyeL: f.eyeL, eyeR: f.eyeR, blink: Math.round(bl * 4) / 4, mood, mouth: Math.round(u.mouth * 5) / 5, look: Math.round(u.look * 4) / 4, lookY: Math.round((u.lookY || 0) * 4) / 4 }); f.tex.needsUpdate = true; }
    if (u.rig) u.rig.update(dt, speed);   // Hope's cane, Noble's chair (engine/cast.js)
    gripFix(c, u, P);
  }
  // s662 GRIP (Ben: "really look at the hand and how it would hold things"): the sword used to float beside the paw (grip through the palm + wrist,
  // fingers closed on nothing). Now, after every pose has set the sword's angle, the paw turns at the wrist so its knuckle line runs ALONG the grip
  // (pinky → index toward the blade), and the sword slides so the grip passes through the curled fingers, index right under the guard.
  // The sword's own angle (what every swing pose sets) is kept, so poses still aim the blade. u.gripFix = false turns it off for a fox.
  const _gA = new THREE.Vector3(), _gB = new THREE.Vector3(), _gK = new THREE.Vector3(), _gC = new THREE.Vector3(), _gD = new THREE.Vector3(), _gH = new THREE.Vector3(), _gQ = new THREE.Quaternion(), _gI = new THREE.Quaternion(), _gM = new THREE.Matrix4(), _gY = new THREE.Vector3(0, 1, 0);
  function gripFix(c, u, P) { const sw = P.sword, H = P.hands && P.hands[1], F = P.fore && P.fore[1];
    if (!sw || !H || !F || !H.fingers || sw.parent !== F || u.gripFix === false || !c.visible || !sw.visible) return;
    const fi = H.fingers, ix = fi.find(f => f.k === 0), pk = fi.find(f => f.k === 3); if (!ix || !pk) return;
    const loc = (o, v) => o.getWorldPosition(v).applyMatrix4(_gM);
    F.updateMatrixWorld(true); _gM.copy(F.matrixWorld).invert();
    loc(ix.a, _gA); loc(pk.a, _gB); const span = _gA.distanceTo(_gB); _gA.sub(_gB).normalize();   // knuckle line, pinky → index
    _gD.copy(_gY).applyQuaternion(sw.quaternion);   // grip direction toward the blade (fore space)
    // s662e (Ben: "the hand looks broken"): the wrist only bends up to WMAX toward where the pose aims the sword; the rest of the difference
    // turns the SWORD to sit straight through the fist (a natural wrist, the blade follows the paw)
    const ang = _gA.angleTo(_gD), WMAX = 0.4; _gQ.setFromUnitVectors(_gA, _gD); if (ang > WMAX) _gQ.slerp(_gI, 1 - WMAX / ang);
    H.g.quaternion.premultiply(_gQ); _gA.applyQuaternion(_gQ);   // bend the wrist a little
    _gQ.setFromUnitVectors(_gD, _gA); sw.quaternion.premultiply(_gQ); _gD.copy(_gA);   // the sword lines up with the knuckles
    F.updateMatrixWorld(true);
    _gK.set(0, 0, 0); _gC.set(0, 0, 0); for (const f of fi) { _gK.add(loc(f.a, _gB)); _gC.add(loc(f.b || f.a, _gB)); } _gK.multiplyScalar(1 / fi.length); _gC.multiplyScalar(1 / fi.length); loc(H.hg, _gH);
    _gB.copy(_gK).lerp(_gC, 0.6).addScaledVector(_gH.sub(_gK), 0.35);   // the hole inside the curled fingers
    const s = sw.scale.x || 1, yc = 0.073 - (span / 2 + 0.024) / s;   // fist centre on the grip: index finger just under the guard ferrule
    sw.position.copy(_gB).addScaledVector(_gD, -yc * s); }


  // p49 FOX FAST, THE PROOF: build one spec the old way and the fast way and compare every object (type, name, children, matrix) and every mesh (each attribute's bits, the index, material type + colour + side). The map runs it on real town foxes once per FF.ver.
  function fastCheck(spec) { const was = FF.on, sig = f => { const out = []; f.updateMatrixWorld(true); f.traverse(o => { let s = o.type + '|' + o.name + '|' + o.children.length + '|' + o.visible + '|' + Array.from(o.matrix.elements, v => v.toFixed(6)).join(',');
        if (o.isMesh) { const g = o.geometry, m = o.material; s += '|' + Object.keys(g.attributes).sort().map(k => k + ':' + ffH(g.attributes[k].array)).join(';') + '|' + (g.index ? ffH(g.index.array) : 'n') + '|' + (m && m.type) + '|' + (m && m.color ? m.color.getHex() : '') + '|' + (m && m.side) + '|' + (m && m.vertexColors); } out.push(s); }); return out; };
    let a, b, t0 = 0, t1 = 0, t2 = 0; try { FF.on = false; t0 = performance.now(); a = makeFox(spec); t1 = performance.now(); FF.on = true; b = makeFox(spec); t2 = performance.now(); } finally { FF.on = was; }
    const A = sig(a), B = sig(b); let bad = -1; if (A.length !== B.length) bad = Math.min(A.length, B.length); else for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) { bad = i; break; }
    for (const f of [a, b]) if (f && f.parent) f.parent.remove(f);
    return { ok: bad < 0, n: A.length, at: bad, a: bad >= 0 ? String(A[bad]).slice(0, 200) : '', b: bad >= 0 ? String(B[bad] || '').slice(0, 200) : '', msOld: t1 - t0, msNew: t2 - t1 }; }
  return { makeFox, animFox, MOOD, moodOf, setLook(l) { LOOK = { ...DEFAULT_LOOK, ...l }; }, getLook: () => ({ ...LOOK }), fastCheck, fast: FF };
}
