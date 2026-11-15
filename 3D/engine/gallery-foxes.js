// THE GALLERY'S FOXES (13 Nov 2026, Ben): every visitor is the 8 GATES game's fox (Design's hand-back in ../gamefox/), made light enough for phones.
// The game's fox is about 200 separate parts (about 125 draws). Here the parts that never move on their own are merged into a few skinned meshes
// that bend with the fox's joints (about 10 draws). The original parts stay where they are, but on a layer the camera never draws ("ghosts"),
// because the game's 250 animations read them (arm reach, hand shapes, faces). So the merged fox moves exactly as the game's fox does.
//   const FX = await setupFoxes({ THREE, scene });
//   FX.make(look) → a fox, already scaled for metres     look = { head, shirt: 'suit' | 'tee' | 'sweat', art, gear: 'none' | 'sun' | 'cane' | 'chair' }
//   FX.tick(fox, dt, speed)      every frame (speed in metres a second); plays the fox's emote / sit on top
//   FX.emote(fox, name)          one of FX.EMOTES (null stops it) · fox.userData.sit = true holds the sit-on-the-ground pose
//   FX.GF                        the game-fox kit itself (HEADS, arts, firstLook, randomLook, skateboard …)
import { gameFox } from '../gamefox/game-fox.js';

export const MIRROR_LAYER = 5;   // (13 Nov) what the shirt studio's mirrors draw: foxes + the studio
export const FOX_SCALE_GAME = 0.56;   // the game's fox is ~3.1 units tall: ~1.75 m in the gallery
export const EMOTES = [   // [key, button label, spoken name]
  ['wave', 'WAVE', 'Wave hello'], ['s_high5', 'HIGH FIVE', 'High five'], ['groove', 'DANCE', 'Dance'], ['p_sit', 'SIT', 'Sit on the ground'],
  ['clap', 'CLAP', 'Clap'], ['cheer', 'CHEER', 'Cheer'], ['bow', 'BOW', 'Take a bow'], ['point', 'POINT', 'Point'], ['think', 'THINK', 'Think'],
  ['laugh', 'LAUGH', 'Laugh'], ['nod', 'YES', 'Nod yes'], ['shake', 'NO', 'Shake no'], ['shrug', 'SHRUG', 'Shrug'], ['s_selfie', 'SELFIE', 'Take a selfie'], ['s_hug', 'HUG', 'Hug'],
];
const LOOPS = new Set(['groove', 'p_sit', 'clap', 'think']);   // these keep going until you move or pick another

export async function setupFoxes({ THREE, scene }) {
  const GF = await gameFox({ THREE, scene, root: new URL('../gamefox/game/', import.meta.url).href, gallery: new URL('../', import.meta.url).href });
  const ANIMS = GF.FP.FOX_ANIMS, emotes = EMOTES.filter(e => ANIMS[e[0]]), SAMPLE = ['wave', 's_high5', 'groove', 'p_sit', 'clap', 'bow', 'life_sit'].filter(k => ANIMS[k]);
  const isOutline = m => m && m.isMeshBasicMaterial && m.side === THREE.BackSide;
  const plain = m => !m.onBeforeCompile || m.onBeforeCompile === THREE.Material.prototype.onBeforeCompile;

  // ---- the merge: find every part that moves (walk, idle, the emotes), then skin the rest onto those joints ----
  function lighten(f) {
    const keep = new Set(), snap = new Map(), vis0 = new Map();
    f.traverse(o => { if (!o.isMesh) keep.add(o); o.updateMatrix(); snap.set(o, o.matrix.clone()); vis0.set(o, o.visible); });
    const moved = () => f.traverse(o => { o.updateMatrix(); const s0 = snap.get(o); if (!s0 || !o.matrix.equals(s0)) keep.add(o); if (vis0.has(o) && vis0.get(o) !== o.visible) o.traverse(c => { c.userData.keep = true; keep.add(c); }); });
    for (const [dt, sp] of [[0.12, 0], [0.16, 1.4], [0.21, 2.6], [0.11, 0.8], [0.27, 3.5], [0.4, 0], [1.3, 0], [2.1, 0]]) { GF.tick(f, dt, sp); moved(); }
    for (const a of SAMPLE) for (const t of [0.15, 0.6, 1.1, 1.8]) { GF.tick(f, 0.016, 0); GF.pose(f, a, t, 1); moved(); }
    f.traverse(o => { const m = snap.get(o); if (m) m.decompose(o.position, o.quaternion, o.scale); if (vis0.has(o)) o.visible = vis0.get(o); });   // every part back exactly as built
    skin(f, keep);
  }
  function skin(root, keep) {
    const P = root.userData.P || {};
    for (const v of Object.values(P)) { if (Array.isArray(v)) v.forEach(x => x && x.isObject3D && keep.add(x)); else if (v && v.isObject3D) keep.add(v); }
    root.updateMatrixWorld(true);
    const inHead = o => { for (let q = o; q; q = q.parent) if (q === P.head) return true; return false; };
    const shown = o => { for (let q = o; q && q !== root; q = q.parent) if (!q.visible) return false; return true; };
    const boneOf = o => { let q = o.parent; while (q && !keep.has(q)) q = q.parent; return q || root; };
    const run = (attach, headPart) => {   // two passes: the body (onto the fox), then the head's own parts (onto the head, so hiding the head hides them all)
      const sets = new Map();
      attach.traverse(c => {
        if (!c.isMesh || c.isSkinnedMesh || c.isInstancedMesh || keep.has(c) || c.userData.keep || inHead(c) !== headPart || !shown(c)) return;
        const m = c.material, g = c.geometry; if (Array.isArray(m) || !g || !g.attributes.position || !g.attributes.position.count) return;
        if (!plain(m) || m.map || m.transparent || m.alphaTest || !m.color || (m.emissive && m.emissive.getHex())) return;
        const po = (m.polygonOffset ? m.polygonOffsetFactor + ',' + m.polygonOffsetUnits : '') + '|' + m.depthWrite + m.depthTest + '|' + m.side;
        const key = isOutline(m) ? 'outline|' + m.uuid : m.isMeshToonMaterial ? 'toon|' + (m.gradientMap ? m.gradientMap.uuid : '') + '|' + po : m.isMeshBasicMaterial ? 'basic|' + po : m.isMeshLambertMaterial ? 'lambert|' + po : null;
        if (!key) return; if (!sets.has(key)) sets.set(key, { mat: m, list: [] }); sets.get(key).list.push(c);
      });
      const bones = [], bi = new Map(), inv = new THREE.Matrix4().copy(attach.matrixWorld).invert(), m4 = new THREE.Matrix4(), meshes = [], gone = [];
      for (const [key, { mat, list }] of sets) {
        if (list.length < 2) continue;
        let n = 0; for (const c of list) n += c.geometry.index ? c.geometry.index.count : c.geometry.attributes.position.count;
        const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), idx = new Uint16Array(n * 4), wt = new Float32Array(n * 4); let v = 0;
        const out = key.startsWith('outline');
        for (const c of list) {
          const b = boneOf(c); if (!bi.has(b)) { bi.set(b, bones.length); bones.push(b); } const k = bi.get(b);
          const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); m4.multiplyMatrices(inv, c.matrixWorld); g.applyMatrix4(m4);
          const pa = g.attributes.position, na = g.attributes.normal, ca = c.material.vertexColors ? g.attributes.color : null, cl = c.material.color, flip = m4.determinant() < 0, cnt = pa.count;
          for (let t = 0; t < cnt; t++, v++) { const i = flip ? (t % 3 === 1 ? t + 1 : t % 3 === 2 ? t - 1 : t) : t;   // (a mirrored part: turn its triangles round, or they face inwards)
            pos[v * 3] = pa.getX(i); pos[v * 3 + 1] = pa.getY(i); pos[v * 3 + 2] = pa.getZ(i);
            if (na) { nor[v * 3] = na.getX(i); nor[v * 3 + 1] = na.getY(i); nor[v * 3 + 2] = na.getZ(i); } else nor[v * 3 + 1] = 1;
            if (ca) { col[v * 3] = cl.r * ca.getX(i); col[v * 3 + 1] = cl.g * ca.getY(i); col[v * 3 + 2] = cl.b * ca.getZ(i); } else { col[v * 3] = cl.r; col[v * 3 + 1] = cl.g; col[v * 3 + 2] = cl.b; }
            idx[v * 4] = k; wt[v * 4] = 1; }
          g.dispose(); gone.push(c);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
        geo.setAttribute('skinIndex', new THREE.BufferAttribute(idx, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(wt, 4));
        let mat2 = mat; if (!out) { geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); mat2 = mat.clone(); mat2.color.setRGB(1, 1, 1); mat2.vertexColors = true; }
        const sm = new THREE.SkinnedMesh(geo, mat2); sm.frustumCulled = false; sm.userData.noCull = true; sm.userData.foxSkin = true; meshes.push(sm);
      }
      for (const c of gone) c.layers.set(31);   // the ghosts: still there for the game's pose code, never drawn
      if (!meshes.length) return;
      const skel = new THREE.Skeleton(bones);
      for (const sm of meshes) { attach.add(sm); sm.updateMatrixWorld(true); sm.bind(skel, sm.matrixWorld); }
    };
    run(root, false);
    if (P.head) run(P.head, true);
  }

  function make(look) {
    const f = GF.make(look); if (f.parent) f.parent.remove(f);
    try { lighten(f); } catch (e) { console.warn('[foxes] merge skipped', e); }
    f.scale.setScalar(FOX_SCALE_GAME); f.userData.gameFox = true; f.userData.look = { ...look };
    f.traverse(o => { if (o.isMesh && o.layers.isEnabled(0)) o.layers.enable(MIRROR_LAYER); });   // the shirt studio's mirrors see foxes
    return f;
  }
  function emote(f, name) {
    const u = f.userData; if (!name || !ANIMS[name]) { if (u.emote) u.emote.out = true; return; }
    u.emote = { name, t: 0, k: 0, out: false, len: LOOPS.has(name) ? Infinity : ANIMS[name].dur };
  }
  const SEAT = ANIMS.life_sit ? 'life_sit' : ANIMS.town_sit ? 'town_sit' : null;
  function tick(f, dt, speed = 0) {
    const u = f.userData;
    if (u.skate) { GF.tick(f, dt, 0); u.skate.sk.update(dt, u.skate.inp); u.skate.inp.jump = u.skate.inp.trick = false; return; }   // on the skateboard: the rider moves + poses the fox
    if (u.skateRemote) { const R = u.skateRemote; GF.tick(f, dt, 0); R.t += dt; if (R.board) GF.skate(f, R.board, R.name, R.t); return; }   // another visitor riding: their board + skate move
    GF.tick(f, dt, speed / FOX_SCALE_GAME);
    if (u.sit && SEAT) { u.seatT = (u.seatT || 0) + dt; GF.pose(f, SEAT, u.seatT, 1); return; }   // sitting on a bench / seat (the gallery puts the fox on it)
    const E = u.emote; if (!E) return;
    if (speed > 0.4) E.out = true;   // walking off ends an emote
    E.t += dt; if (E.t > E.len) E.out = true;
    E.k = E.out ? Math.max(0, E.k - dt / 0.3) : Math.min(1, E.k + dt / 0.25);
    if (E.out && E.k <= 0) { u.emote = null; return; }
    GF.pose(f, E.name, E.t, E.k);
  }
  // a fox that never moves (the studio's mannequins): skin every part onto its own joint as it stands; hidden parts stay hidden
  function lightenStill(f) { const keep = new Set(); f.traverse(o => { if (!o.isMesh) keep.add(o); }); try { skin(f, keep); } catch (e) { console.warn('[foxes] still merge skipped', e); } return f; }
  return { GF, make, tick, emote, lightenStill, EMOTES: emotes, SCALE: FOX_SCALE_GAME, LAYER: MIRROR_LAYER, DEFAULT_ART: GF.DEFAULT_ART };
}
