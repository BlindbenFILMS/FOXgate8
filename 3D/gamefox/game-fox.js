// GAME FOX for the gallery · the 8 GATES game's own fox (fox-kit.js + engine/cast.js) with any MASTER head (no hats), an ART SHIRT and gear.
// Made 13 Nov 2026 from Ben Art Shirt.dc.html, so the shirt studio, the gallery and the workshop all build a visitor the same way. No game file and no gallery file is changed.
//   const GF = await gameFox({ THREE, scene, root, gallery });     root = URL of the 8 GATES project root (fox-kit.js, engine/ …) · gallery = URL of the gallery's 3D/ folder (the paintings)
//   GF.HEADS [{ k, name, fur, grp, sex }]   grp CAST · LEAD · HERO · GUARD · TOWN (engine/workshop-roster.js, the Character Workshop's own list) · sex 'm' | 'f'
//   GF.arts  [{ key, url, thumb, title }]   WALK THROUGH FEAR first · GF.SHIRTS · GF.DEFAULT_ART
//   GF.make(look, opt) → fox                look = { head, shirt: 'suit' | 'tee' | 'sweat', art, gear: 'none' | 'sun' | 'cane' | 'chair', pants }   opt.lookOver = look keys laid over the head (the mannequins' plain fur)
//   GF.wear(fox, artKey)                    another painting on the same fox (no rebuild)
//   GF.tick(fox, dt, speed)                 every frame: walk / idle + the gear's rig · GF.pose(fox, name, t, k) after it = one of the game's animations (engine/fox-poses.js FOX_ANIMS)
//   SKATE: const board = await GF.skateboard() · every frame GF.tick(fox, dt, 0) then GF.skate(fox, board, 'sk_push' | 'sk_ollie' | 'sk_kickflip' | 'sk_grind' | 'sk_manual' | 'sk_whack' | 'sk_bail' | null, t) · GF.SKATE = that list. Off the board: remove it + fox.position.y = 0.
//   BEN'S ARRIVAL RULES (13 Nov): GF.firstLook('m' | 'f') = PLAYER MALE / PLAYER FEMALE in the ART SUIT, Walk Through Fear on the front, the Blind Canvas Project logo on the back ·
//   GF.randomLook(taken) = every later visitor: a random male or female head nobody here has, the ART SUIT, a random painting nobody here wears. taken = the looks already in the room.
import { artPrints, DEFAULT_ART } from './fox-art-prints.js';
export const SHIRTS = [['suit', 'ART SUIT'], ['tee', 'ART TEE'], ['sweat', 'ART SWEATSHIRT']];
// the four heroes the master list keeps in fox-workshop.js CHARACTERS (copied: that file pulls in every species kit)
const CHARS = { grand: { eyes: ['#a78bfa', '#a78bfa'] }, ulric: { look: { headWidth: 1.12, cheeks: 1.4, eyeSize: 1.08, eyeTilt: -0.12, browWeight: 4, blush: 0.2 }, eyes: ['#65a30d', '#65a30d'], mood: 'warm' }, lucius: { eyes: ['#eab308', '#eab308'] }, jamos: { eyes: ['#16a34a', '#16a34a'] } };
export async function gameFox({ THREE, scene, root, gallery }) {
  window.__allHands = true;   // every head gets real finger hands: the cane + chair rigs need them to use the fox's own arms
  const U = f => new URL(f, root).href;
  const [FK, CS, FP, CA, CH, WR, BS, MF] = await Promise.all(['fox-kit.js?v=s776i', 'engine/cast.js?v=s339c', 'engine/fox-poses.js?v=s648k', 'engine/cane.js', 'engine/chair.js', 'engine/workshop-roster.js?v=s728ds', 'engine/bosses.js?v=s728e', 'engine/meru-faces.js?v=s717'].map(f => import(U(f))));   // the same URLs the game imports them under
  const grad = (() => { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]), t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  const addOutline = (mesh, t = 0.04, radius) => { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; };
  const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; };
  const crestTex = (letter, ring, bg = '#070a13', fg = '#ffffff') => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = ring; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.fillStyle = fg; g.font = '900 70px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)], clamp = (v, a, b) => Math.max(a, Math.min(b, v)), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
  const kit = FK.foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: false });
  const cast = CS.castKit({ THREE, M, toon, makeFox: kit.makeFox }, {}), rigs = await Promise.all([CA.loadCane(root), CH.loadChair(root)]).then(([cane, chair]) => ({ cane, chair })).catch(() => ({})), CK = CA.caneKit({ THREE, M, toon }), HK = CH.chairKit({ THREE, M, toon });
  const prints = artPrints({ THREE, base: gallery }), arts = await prints.list();

  // ---- HEADS: the master list. Only what belongs to the head goes onto the body (face, fur, ears, hair, glasses). NO HATS (Ben): hats, crowns, circlets + tiaras stay off. ----
  const UF = MF.UNIQUE_FACES || {}, BODY = ['bodyScale', 'legLength', 'leg', 'boot', 'armorAccent', 'shirt', 'crestSize', 'sportCrest', 'hat', 'hatSize', 'hatY', 'hatX', 'hatZ', 'hatColor', 'hatBand'];
  const headLook = l => { const o = { ...l }; for (const k of BODY) delete o[k]; return o; }, clean = x => String(x).replace(/ · (LEADER|HERO|HEROINE)$/, '').replace(/^(KING|QUEEN|PRINCE|PRINCESS|SIR|MRS?\.?|MS\.?|DR\.?|PROF\.?|SGT\.?|OFFICER|CHIEF|CAPTAIN|GUARD)\s+/, '');   /* no titles in the gallery (Ben): PRINCE MAX is MAX */
  const HEADS = [{ k: 'player', name: 'PLAYER MALE', fur: FK.PLAYER_MALE.fur, grp: 'CAST', sex: 'm', def: null },
    { k: 'playerF', name: 'PLAYER FEMALE', fur: (FK.PLAYER_FEMALE_HERO || FK.PLAYER_FEMALE).fur, grp: 'CAST', sex: 'f', def: { key: 'playerF', look: headLook(FK.PLAYER_FEMALE_HERO || FK.PLAYER_FEMALE), mood: 'happy' } },
    { k: 'hope', name: 'HOPE', fur: FK.HOPE_LOOK.fur, grp: 'CAST', sex: 'f', def: { key: 'hope', look: headLook(FK.HOPE_LOOK), eyes: ['#f472b6', '#2dd4bf'], bow: true, mood: 'happy' } },
    { k: 'noble', name: 'NOBLE', fur: FK.PLAYER_MALE.fur, grp: 'CAST', sex: 'm', def: { key: 'noble', eyes: ['#dc2626', '#dc2626'], mood: 'determined' } },
    { k: 'max', name: 'MAX', fur: CS.MAX_LOOK.fur, grp: 'CAST', sex: 'm', def: { key: 'max', look: headLook(CS.MAX_LOOK), eyes: ['#0f172a', '#0f172a'], mood: 'warm', glasses: 'royal' } }];
  for (const w of Object.values(WR.WORLDS)) for (const it of (w.cast || [])) { let d = null, fem = false;
    if (it.kind === 'def' && it.def && !it.def.species) { const x = it.def; fem = !!x.female; d = { key: x.key, look: headLook({ ...(x.female ? FK.PLAYER_FEMALE : FK.PLAYER_MALE), ...(x.look || {}) }), eyes: x.eyes, mood: x.mood, bow: x.bow, glasses: x.glasses }; }
    else if (it.kind === 'boss' && BS.BOSS_FOX[it.key]) { const x = BS.BOSS_FOX[it.key]; d = { key: x.key, look: headLook(x.look), eyes: x.eyes, mood: x.mood, glasses: x.glasses }; }   // King Might, Princess Michelle, Prince Lox
    else if (it.kind === 'char' && CHARS[it.key]) { const c = CHARS[it.key]; d = { key: 'ws_' + it.key, look: headLook({ ...FK.PLAYER_MALE, ...(c.look || {}) }), eyes: c.eyes, mood: c.mood }; }
    if (!d || HEADS.some(h => h.k === d.key || h.k === it.key)) continue;
    for (const k of Object.keys(d)) if (d[k] == null) delete d[k];
    const lab = String(it.label), hero = /HERO/.test(lab) || !!(it.def && it.def.hero), lead = / · LEADER$/.test(lab) || it.kind === 'boss' || /^(KING|PRINCE|PRINCESS)\b/.test(lab) || /^lead_/.test(d.key), uf = UF[d.key] && UF[d.key].look;
    HEADS.push({ k: d.key, name: clean(lab), fur: (uf && uf.fur) || d.look.fur, grp: hero ? 'HERO' : lead ? 'LEAD' : /^guard_/i.test(d.key) ? 'GUARD' : 'TOWN', sex: fem || /^PRINCESS/.test(lab) || d.look.lashes >= 1 || (uf && uf.lashes >= 1) ? 'f' : 'm', def: d, boss: it.kind === 'boss' ? it.key : null }); }

  // ---- the art shirts: prints laid on the kit's own tee + jacket (children of the torso mesh: the kit moves + scales it after the build) ----
  const TEE = [[0.27, 0.5], [0.285, 0.6], [0.26, 0.72], [0.28, 0.95], [0.31, 1.1], [0.22, 1.21]], SUIT = [[0.24, 0.42], [0.29, 0.5], [0.26, 0.66], [0.27, 0.95], [0.33, 1.12], [0.24, 1.21]];
  const rAt = (pr, y) => { for (let i = 0; i < pr.length - 1; i++) { const [r0, y0] = pr[i], [r1, y1] = pr[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return pr[pr.length - 1][0]; };
  const band = (pr, Y0, Y1, out, segs, phi0, len) => { const pts = []; for (let i = 0; i <= 20; i++) { const y = Y0 + (Y1 - Y0) * i / 20; pts.push(new THREE.Vector2(rAt(pr, y) + out, y)); } const g = new THREE.LatheGeometry(pts, segs, phi0, len), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setZ(i, z > 0 ? z * 1.1 : z * 0.92); } g.computeVertexNormals(); return g; };
  const shellGeo = band(TEE, 0.505, 1.205, 0.008, 40, -Math.PI, Math.PI * 2), chestGeo = band(SUIT, 0.6, 1.12, 0.016, 24, -0.8, 1.6), backGeo = band(SUIT, 0.79, 1.2, 0.016, 24, Math.PI - 0.8, 1.6);
  const vHalf = (g, a, b) => { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, a + (b - a) * uv.getY(i)); return g; };
  const upGeo = vHalf(new THREE.CylinderGeometry(0.108, 0.094, 0.29, 16, 1, true), 0.5, 1), capGeo = vHalf(new THREE.SphereGeometry(0.108, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.9, 1), elbGeo = vHalf(new THREE.SphereGeometry(0.094, 14, 10), 0.45, 0.55);
  const torsoOf = (P, y0) => P.body.children.find(c => { if (!c.isMesh || c.geometry.type !== 'LatheGeometry') return false; c.geometry.computeBoundingBox(); const b = c.geometry.boundingBox; return Math.abs(b.min.y - y0) < 0.03 && b.max.y > 1.2; });
  const panelMat = () => new THREE.MeshToonMaterial({ gradientMap: grad, transparent: true, alphaTest: 0.05, polygonOffset: true, polygonOffsetFactor: -2 });
  function wear(fox, key) { const s = fox.userData.gf; if (!s) return; key = key || DEFAULT_ART; s.look.art = key; const m = s.mats, on = s.look.shirt === 'sweat' || s.look.shirt === 'tee';
    m.wrap.map = prints.wrapTrue(key); m.wrap.needsUpdate = true; m.front.map = prints.chest(key); m.front.needsUpdate = true; m.back.map = prints.logo(); m.back.needsUpdate = true;
    m.slv.forEach((x, i) => { x.map = on ? prints.sleeve(key, i ? 1 : -1) : null; x.needsUpdate = true; }); }
  function make(look0 = {}, opt = {}) {
    const look = { head: 'player', shirt: 'suit', art: DEFAULT_ART, gear: 'none', pants: '#111a2e', ...look0 }, kind = look.shirt, suit = kind === 'suit', gear = look.gear;
    const hd = HEADS.find(h => h.k === look.head) || HEADS[0], hdef = { ...(hd.def || {}), crown: false }, gl = gear === 'sun' || gear === 'cane' || hdef.glasses ? 'royal' : null;   /* every pair of sunglasses is Prince Max's: dark lenses in a gold frame (Ben, 13 Nov) */
    if (opt.lookOver) hdef.look = { ...(hdef.look || CS.CAST.player.look), ...opt.lookOver };
    const fox = cast.make('player', { outfit: suit ? 'suit' : 'tee', torso: suit ? ['#2a2e34', '#1a1d22', '#0c0e10'] : ['#141414', '#141414', '#0c0c0c'], gear: 'none', legColor: look.pants, merged: false, joints: true, ...hdef, glasses: gl, chair: gear === 'chair' }); scene.add(fox);
    fox.userData.alwaysPose = true; fox.scale.setScalar(1);   // one size for every visitor, whatever the head's own build
    const P = fox.userData.P, torso = torsoOf(P, suit ? 0.42 : 0.5), lift = P.arms[0].position.y - 1.12, mats = { wrap: new THREE.MeshToonMaterial({ gradientMap: grad, polygonOffset: true, polygonOffsetFactor: -2 }), slv: [0, 1].map(() => new THREE.MeshToonMaterial({ gradientMap: grad })), front: panelMat(), back: panelMat() };
    if (hd.boss && BS.BOSS_FOX[hd.boss]) { try {   // a BOSS head (King Might's whiskers + goatee): engine/bosses.js makes them on a whole fox, so one is built aside and only what it did to the HEAD comes over
      const donor = kit.makeFox({ ...BS.BOSS_FOX[hd.boss], ...hdef, joints: true, gear: 'none', glasses: gl }), dH = donor.userData.P.head, pairs = new Map();
      const walk = (d, b) => { pairs.set(d, b); const n = Math.min(d.children.length, b.children.length); for (let i = 0; i < n; i++) walk(d.children[i], b.children[i]); }; walk(dH, P.head);
      BS.bossExtras(hd.boss, donor, { THREE, M, toon });
      const alive = new Set(); dH.traverse(o => alive.add(o));
      for (const [d, b] of pairs) { if (d === dH) continue; if (!alive.has(d)) { if (b.parent) b.parent.remove(b); continue; } b.visible = d.visible; b.position.copy(d.position); b.quaternion.copy(d.quaternion); b.scale.copy(d.scale); }
      donor.updateMatrixWorld(true); const bx = new THREE.Box3(), cv = new THREE.Vector3(), onTop = o => { bx.setFromObject(o); if (bx.isEmpty()) return o.position.y > 0.18; return dH.worldToLocal(bx.getCenter(cv)).y > 0.1; }, added = [];   // no hats: what sits on TOP of the head (crown, tiara) is left behind
      dH.traverse(o => { if (!pairs.has(o) && pairs.has(o.parent) && !onTop(o)) added.push(o); }); for (const o of added) pairs.get(o.parent).add(o);
      scene.remove(donor);
    } catch (e) { console.warn('boss head', hd.boss, e); } }
    const put = m => { if (torso) torso.add(m); else { m.position.y += lift; P.body.add(m); } return m; };
    if (suit) {   // ART SUIT (Ben): the painting as a square on the chest, the Blind Canvas Project logo across the back, no crest
      const limbs = [...P.legs, ...P.arms, P.head, P.tail]; P.body.children.forEach(c => { if (c === torso || limbs.includes(c)) return; let crest = false; c.traverse(o => { const ms = o.isMesh ? (Array.isArray(o.material) ? o.material : [o.material]) : []; if (ms.some(m => m && m.map)) crest = true; }); if (c.position.z > 0.2 || crest) c.visible = false; });
      (P.badges || []).forEach(b => { b.visible = false; b.scale.setScalar(0.0001); });
      put(new THREE.Mesh(chestGeo, mats.front)); put(new THREE.Mesh(backGeo, mats.back));
      for (const sx of [-1, 1]) { const a = sx * 0.85, lp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.03), toon('#0c0e10')); lp.position.set(Math.sin(a) * 0.3, 0.92, Math.cos(a) * 0.32); lp.rotation.y = a; lp.rotation.z = sx * 0.12; put(lp); }
      const tm = P.tail.children.find(c => c.isMesh); if (tm) { tm.rotation.order = 'ZXY'; tm.rotation.z = 1.15; }   // the tail swept aside so the logo shows
    } else {   // ART TEE + ART SWEATSHIRT: one print wrapped round the body + the painting's edges on the sleeves
      put(new THREE.Mesh(shellGeo, mats.wrap));
      P.arms.forEach((a, i) => { let s = null, trim = null; a.traverse(c => { if (!c.isMesh) return; const gp = c.geometry.parameters || {}; if (!s && c.geometry.type === 'CylinderGeometry' && Math.abs((gp.radiusTop || 0) - 0.095) < 0.003) s = c; if (!trim && c.geometry.type === 'TorusGeometry' && Math.abs((gp.radius || 0) - 0.1) < 0.003) trim = c; });
        if (kind !== 'sweat') { if (s) s.material = mats.slv[i]; else { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.15, 16, 1, true), mats.slv[i]); t.position.y = -0.06; a.add(t); } return; }
        if (s) s.visible = false; if (trim) trim.visible = false;   // the sweatshirt: long art sleeves that bend with the elbow, a dark rib cuff
        const fore = P.fore && P.fore[i], elbow = fore ? fore.position.y : -0.26, up = new THREE.Mesh(upGeo, mats.slv[i]); up.scale.y = (0.02 - elbow) / 0.29; up.position.y = (0.02 + elbow) / 2; a.add(up);
        const cap = new THREE.Mesh(capGeo, mats.slv[i]); cap.position.y = 0.02; cap.scale.y = 0.8; a.add(cap);
        if (fore) { const hand = P.hands && P.hands[i] && P.hands[i].g, wrist = hand && hand.parent === fore ? hand.position.y + 0.05 : -0.2, L = Math.max(0.08, -wrist);
          const lo = new THREE.Mesh(vHalf(new THREE.CylinderGeometry(0.094, 0.082, L, 16, 1, true), 0, 0.5), mats.slv[i]); lo.position.y = -L / 2; fore.add(lo); fore.add(new THREE.Mesh(elbGeo, mats.slv[i]));
          const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.05, 16), toon('#141414')); cuff.position.y = -L - 0.015; fore.add(cuff); } });
    }
    // GEAR: the game's own rigs (Hope's cane in the LEFT paw so right-paw gestures stay free; Noble's chair). What a rig holds is put back after every pose.
    const st = fox.userData.gf = { look, mats, keep: [], keepS: [], seated: false };
    if (gear === 'cane') { fox.userData.gait = 'light'; fox.userData.rig = CK.attach(fox, { ...(rigs.cane || CA.CANE_DEFAULTS), arm: 1 }); const H = P.hands && P.hands[1]; st.keep = [P.arms[1], P.fore && P.fore[1], H && H.g, H && H.hg, H && H.th, H && H.th2, ...((H && H.fingers) || []).flatMap(x => [x.a, x.b])].filter(Boolean); }
    if (gear === 'chair') { fox.userData.rig = HK.attach(fox, rigs.chair || CH.CHAIR_DEFAULTS); st.seated = true; st.keep = [P.body, ...P.legs, P.tail]; if (!P.shin) P.shin = [new THREE.Group(), new THREE.Group()];
      const tl = P.tail, tm = tl.children.find(c => c.isMesh); tl.position.x = 0.33; tl.position.z = -0.02; tl.position.y -= 0.05; if (tm) { tm.rotation.order = 'YXZ'; tm.rotation.set(2.0, 0.12, 0); tm.scale.multiplyScalar(0.45); }   /* (Ben, 13 Nov) the tail stays IN the chair: tucked low on the seat along the outside of the left thigh, pointing forward, small and flat (tilted past level so its curl comes back down); clear of the backrest and of the art on the shirt */ }
    st.keepS = st.keep.map(() => ({ p: new THREE.Vector3(), q: new THREE.Quaternion() }));
    wear(fox, look.art); return fox;
  }
  const tick = (fox, dt, speed = 0) => { kit.animFox(fox, dt, speed, false); const s = fox.userData.gf; if (s && s.seated) fox.userData.P.tail.rotation.set(0, 0, 0); };   // seated: no tail wag (it would sweep through the chair)
  function pose(fox, name, t, k = 1) { const s = fox.userData.gf; if (!s || !FP.FOX_ANIMS[name] || k < 0.002) return;
    s.keep.forEach((o, i) => { s.keepS[i].p.copy(o.position); s.keepS[i].q.copy(o.quaternion); });
    try { FP.applyPose(THREE, fox, name, t, k); } catch (e) { if (!s.err) { s.err = true; console.warn('pose', name, e); } }
    finally { s.keep.forEach((o, i) => { o.position.copy(s.keepS[i].p); if (!(s.seated && o === fox.userData.P.body)) o.quaternion.copy(s.keepS[i].q); }); } }
  const firstLook = (sex = 'm') => ({ head: sex === 'f' ? 'playerF' : 'player', shirt: 'suit', art: DEFAULT_ART, gear: 'none' });
  function randomLook(taken = []) { const sex = Math.random() < 0.5 ? 'm' : 'f', free = h => h.sex === sex && h.grp !== 'GUARD' && h.k !== 'player' && h.k !== 'playerF' && !taken.some(t => t.head === h.k);
    const hs = HEADS.filter(free), as = arts.filter(a => a.key !== DEFAULT_ART && !taken.some(t => t.art === a.key)), h = pick(hs.length ? hs : HEADS.filter(x => x.sex === sex)), a = pick(as.length ? as : arts);
    return { head: h.k, shirt: 'suit', art: a.key, gear: 'none' }; }
  // ---- SKATE (Ben, 13 Nov): the game's own skateboard + skate animations ----
  let VKp = null; const SKATE = ['sk_push', 'sk_ollie', 'sk_kickflip', 'sk_grind', 'sk_manual', 'sk_whack', 'sk_bail'].filter(k => FP.FOX_ANIMS[k]);
  const skateboard = async () => { VKp = VKp || import(U('engine/vehicle-kit.js')).then(m => m.vehicleKit({ THREE, M, toon })); const b = (await VKp).make('skate'); scene.add(b); return b; };
  function skate(fox, board, name, t) {   // every frame AFTER tick(fox, dt, 0): the board under the fox (as the game's Fox Animation Lab places it), the fox on its deck, the skate animation on top
    const S = fox.scale.x, A = name && FP.FOX_ANIMS[name], tt = A ? ((t % A.dur) + A.dur) % A.dur : 0, hop = A && /ollie|kickflip/.test(name) ? Math.max(0, Math.sin(Math.max(0, Math.min(1, (tt - 0.5) / 0.8)) * Math.PI)) * 0.4 : 0;
    board.rotation.order = 'YXZ'; board.scale.setScalar(1.6 * S); board.position.set(fox.position.x, hop * S, fox.position.z); board.rotation.set(0, fox.rotation.y + Math.PI / 2, name === 'sk_kickflip' && tt > 0.55 && tt < 1.05 ? (tt - 0.55) / 0.5 * Math.PI * 2 : 0);
    fox.position.y = (0.312 + hop) * S;   /* as MERU: the board 1.6 times its model, lengthways along the ride; the host turns the fox side-on (its yaw = the ride's direction - 90°, so it faces the way it rides) */ if (A) pose(fox, name, t, 1); }
  return { THREE, kit, FP, HEADS, arts, SHIRTS, DEFAULT_ART, prints, toon, M, make, wear, tick, pose, firstLook, randomLook, SKATE, skateboard, skate };
}
