// 8 GATES 3D · Blind Canvas Project gallery
// The building, signs, artworks, videos and learning panels come from Ben's PlayCanvas project
// (exported to gallery/gallery.glb + gallery/gallery.json by tools in g3d_checks). You walk it as a fox.
import * as THREE from '../vendor/three/three.module.js';
import { GLTFLoader } from '../vendor/three/addons/GLTFLoader.js';
import { MeshBVH } from '../vendor/three/three-mesh-bvh.js';
import { mergeGeometries } from '../vendor/three/addons/BufferGeometryUtils.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';
import { crestTex } from './textures.js';
import { buildGuides } from './gallery-guides.js';
import { buildWorld } from './gallery-world.js';
import { GARDEN, RING, CAMPUS, planGarden } from './gallery-garden-plan.js';
import { makePlant, makeBench } from './gallery-props.js';
import { caneKit, loadCane, CANE_DEFAULTS } from './avatars/cane.js';
import { chairKit, loadChair, CHAIR_DEFAULTS } from './avatars/chair.js';
import { artAnimator } from './gallery-anim.js';
import { buildVisionSpots, visionOverlay } from './gallery-vision.js';
import { buildSimWalls } from './gallery-simwall.js';
import { buildBraille, patchOldBraille } from './gallery-braille.js';
import { buildCampus, CAMPUS_STOPS, SIGN_DEST } from './gallery-campus.js';
import { floorPianoSound } from './gallery-floorpiano.js';
import { TEXMEM, lean } from './gallery-texmem.js';
import { buildCommentSpots } from './gallery-comments.js';
import { stainedGlass } from './gallery-stained.js';
import { buildElevator } from './gallery-elevator.js';
import { buildSkywalk } from './gallery-skywalk.js';
import { buildEyelid } from './gallery-eyelid.js';
import { buildRingGlass } from './gallery-ringglass.js';
import { buildZen } from './gallery-zen.js';   // (28 Oct) Meditate with Morten: the garden room
import { buildFunProps } from './gallery-fun-props.js';   // (27 Oct) the props kit: edit that file to add props
import { makeWood, woodify, isWhiteFloorMat, isPaletteMat, buildWing, buildDoor } from './gallery-wing.js';
import { buildKiosks, carveWorld, carved, buildEntrance, buildRooms, buildBioWalls, CARVES, canvasBox, cardTexture } from './gallery-remodel.js';

const BASE = 'gallery/';
const SPAWN = new URLSearchParams(location.search).get('at') === 'theatre' ? { x: 81.4, y: 0.5, z: -5.4, face: Math.PI / 2 } : new URLSearchParams(location.search).get('at') === 'cinema' ? { x: 62, y: 0.5, z: 0, face: Math.PI / 2 } : new URLSearchParams(location.search).get('at') === 'chess' ? { x: 64.4, y: 0.5, z: 31.6, face: 0 } : new URLSearchParams(location.search).get('at') === 'sim' ? { x: -149, y: -3.2, z: 0, face: -Math.PI / 2 } : { x: CAMPUS.spawn.x, y: 0.5, z: CAMPUS.spawn.z, face: CAMPUS.spawn.face };   // (?at=chess: start by the chess tables)   // in the middle of the park beside the big tree, facing the museum (the cinema behind you)

export async function createGallery({ container, onProgress = () => {}, onNear = () => {}, onZone = () => {}, onSplash = () => {}, onPad = () => {}, onLite = () => {} }) {
  const lowEnd = /iPhone|iPad|Android/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);   // (iPads say they're Macs)
  TEXMEM.scale = lowEnd ? 0.6 : 1;   // (signs, cards and boards drawn smaller on phones: a third of the memory, still sharp there)
  const NOWORLD = new URLSearchParams(location.search).has('noworld');   // (testing) the museum without the lake, flags and city
  const renderer = new THREE.WebGLRenderer({ antialias: !lowEnd || devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowEnd ? 1.5 : 2));
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', 'The 3D Blind Canvas gallery. Move with the arrow keys or the joystick; the Actions button reads out what is near you.');   // (22 Oct)
  container.appendChild(renderer.domElement);
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  renderer.setSize(W(), H());
  const scene = new THREE.Scene();
  // draw-call saver: a mesh with a material array draws once per geometry group (a box = 6). Join neighbouring groups that use
  // the same material object, and point every face at the first copy, so a canvas or screen box draws 2-3 times, not 6.
  function compactGroups(mesh) {
    if (!mesh || !mesh.isMesh || !Array.isArray(mesh.material) || mesh.userData.compact) return;
    const g = mesh.geometry, mats = mesh.material; if (!g.groups || g.groups.length < 2) return;
    const first = mats.map((m, i) => mats.indexOf(m)), out = [];
    const sorted = g.groups.map(gr => ({ start: gr.start, count: gr.count, mi: first[gr.materialIndex] })).sort((a, b) => a.start - b.start);
    for (const gr of sorted) { const L = out[out.length - 1]; if (L && L.mi === gr.mi && L.start + L.count === gr.start) L.count += gr.count; else out.push({ ...gr }); }
    // a box's faces are px,nx,py,ny,pz,nz: same-material faces that aren't neighbours can be joined by reordering the index
    if (g.index && out.length > new Set(out.map(o => o.mi)).size) {
      const idx = g.index.array, order = [...new Set(sorted.map(o => o.mi))], parts = []; let start = 0; const ng = [];
      for (const mi of order) { let n = 0; for (const gr of sorted) if (gr.mi === mi) { parts.push(idx.slice(gr.start, gr.start + gr.count)); n += gr.count; } ng.push({ start, count: n, mi }); start += n; }
      const merged = new idx.constructor(idx.length); let o = 0; for (const p of parts) { merged.set(p, o); o += p.length; }
      g.setIndex(new THREE.BufferAttribute(merged, 1)); out.length = 0; out.push(...ng);
    }
    g.clearGroups(); for (const o of out) g.addGroup(o.start, o.count, o.mi); mesh.userData.compact = true;
  }
  scene.background = new THREE.Color(0xbfd9ec);
  scene.fog = new THREE.Fog(0xbfd9ec, 120, 420);
  const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.08, 900);
  scene.add(new THREE.HemisphereLight(0xf4f6ff, 0x6b5a48, 1.6));
  const sun = new THREE.DirectionalLight(0xfff3e0, 1.5); sun.position.set(-60, 120, 40); scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // ---------------------------------------------------------------- the building
  const data = await (await fetch(BASE + 'gallery.json')).json();
  // artwork/poster images (12 Oct): each is its own file now, fetched only when you get near it (the old 9 MB pack had to
  // download in full before you could play). Phones get the half-size copies in gallery/img-m/ (sharp on a phone screen, a
  // quarter of the memory); a painting opened full screen still shows the full-size one.
  const SMALL_ART = lowEnd || new URLSearchParams(location.search).has('small');
  const RES = u => (u && SMALL_ART && u.startsWith('gallery/img/')) ? 'gallery/img-m/' + u.slice(12) : u;
  // (22 Oct) and every painting has a tiny copy (gallery/img-s/, 192 px): shown first, from far away, so walls are never bare
  // as you walk up; the sharp copy replaces it as you come near, and goes back to the tiny one when you walk away
  const TINY = u => (u && u.startsWith('gallery/img/')) ? 'gallery/img-s/' + u.slice(12) : u;
  data.signs.forEach(s => { if (s.img) { s.key = s.img; s.imgTiny = TINY(s.img); s.img = RES(s.img); } }); data.vids.forEach(v => { v.poster = RES(v.poster); });
  const IMGURL = {}; try { for (const k of Object.keys(await (await fetch(BASE + 'img.index.json')).json())) IMGURL[k] = RES(k); } catch (e) { console.warn('image list', e); }   // (the list of art, for the shirt picker)
  const gltf = await new Promise((res, rej) => new GLTFLoader().load((window.GMEDIA || (u => u))(BASE + 'gallery.glb'), res, e => e.total && onProgress(e.loaded / e.total), rej));
  const world = gltf.scene; scene.add(world); world.updateMatrixWorld(true);
  // remodel: cut out the old pieces we rebuild in the New Wing style, and drop their signs/art/screens
  // (the big bio blocks are cut from the building only: their card and portrait already sit on the slim walls built below)
  const carveInfo = carveWorld(world, [...CARVES, ...(data.bioWalls || []).map(b => ({ name: 'bio wall ' + b.name, ...b.carve }))]);
  // (Ben, 28 Oct) the Vision Simulator room (the two big screens): its walls a calm warm grey (black was too much). The walls are
  // part of the big merged building meshes, so it's done per vertex: every wall face inside the room that faces into it gets
  // SIM_WALL vertex colours (that mesh gets its own copy of the material with vertex colours on; everything else stays white).
  // (s-polish) skin planes only on THIN walls whose room face sits on the room's edge (one used to stand in the walkway to the AMB).
  { const RB = { x0: -177.6, x1: -145.9, z0: -22.7, z1: 22.3, y0: -3.6, y1: 13.6 }, CX = -160.5, CZ = 0; let nV = 0, SIM_SKIN = null; const SIM_WALL = new THREE.Color().setRGB(0.64, 0.615, 0.585, THREE.SRGBColorSpace), SIM_SCR = new THREE.Color().setRGB(0.42, 0.4, 0.38, THREE.SRGBColorSpace);   // side walls #a39d95; the two screen walls (north + south) a deeper #6b6661 so the screens lead
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    world.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      if (o.isInstancedMesh) {   // (the walls that are instances of one box: inside the room = black; across its edge = a black skin on the room side)
        const IM = new THREE.Matrix4(), ib = new THREE.Box3(), unit = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5)), gb = o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox);
        const W1 = new THREE.Color(1, 1, 1), K = SIM_WALL; let any = false;
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, IM); IM.premultiply(o.matrixWorld); ib.copy(gb).applyMatrix4(IM);
          if (ib.max.x < RB.x0 || ib.min.x > RB.x1 + 0.6 || ib.max.z < RB.z0 || ib.min.z > RB.z1 || ib.max.y < RB.y0 || ib.min.y > RB.y1 || ib.max.y - ib.min.y < 2) continue;
          if (!o.instanceColor) for (let j = 0; j < o.count; j++) o.setColorAt(j, W1);
          if (ib.min.x >= RB.x0 && ib.max.x <= RB.x1 && ib.min.z >= RB.z0 && ib.max.z <= RB.z1) { o.setColorAt(i, Math.abs((ib.min.z + ib.max.z) / 2) > 18 && ib.max.x - ib.min.x > ib.max.z - ib.min.z ? SIM_SCR : K); any = true; nV++; continue; }
          // straddles the room's edge (the east wall, shared with the main gallery): skin only its room-facing side
          const y0 = Math.max(ib.min.y, RB.y0), y1 = Math.min(ib.max.y, RB.y1), skinM = SIM_SKIN || (SIM_SKIN = new THREE.MeshLambertMaterial({ color: SIM_WALL }));
          const skin = (w, x, z, ry, thick, edge) => { if (w < 0.2 || y1 - y0 < 0.2 || thick > 1.2 || edge > 1.2) return; const p = new THREE.Mesh(new THREE.PlaneGeometry(w, y1 - y0), skinM); p.position.set(x, (y0 + y1) / 2, z); p.rotation.y = ry; scene.add(p); nV++; (window.__simSkins = window.__simSkins || []).push([+x.toFixed(2), +z.toFixed(2), +w.toFixed(2), +y0.toFixed(2), +y1.toFixed(2)]); };
          const zA = Math.max(ib.min.z, RB.z0), zB = Math.min(ib.max.z, RB.z1), xA = Math.max(ib.min.x, RB.x0), xB = Math.min(ib.max.x, RB.x1);
          if (ib.max.x > RB.x1 && ib.min.x > CX) skin(zB - zA, ib.min.x - 0.015, (zA + zB) / 2, -Math.PI / 2, ib.max.x - ib.min.x, Math.abs(ib.min.x - RB.x1));
          else if (ib.min.x < RB.x0 && ib.max.x < CX) skin(zB - zA, ib.max.x + 0.015, (zA + zB) / 2, Math.PI / 2, ib.max.x - ib.min.x, Math.abs(ib.max.x - RB.x0));
          else if (ib.max.z > RB.z1 && ib.min.z > CZ) skin(xB - xA, (xA + xB) / 2, ib.min.z - 0.015, Math.PI, ib.max.z - ib.min.z, Math.abs(ib.min.z - RB.z1));
          else if (ib.min.z < RB.z0 && ib.max.z < CZ) skin(xB - xA, (xA + xB) / 2, ib.max.z + 0.015, 0, ib.max.z - ib.min.z, Math.abs(ib.max.z - RB.z0));
        }
        if (o.instanceColor) o.instanceColor.needsUpdate = true; return;
      }
      const bs = new THREE.Box3().setFromObject(o); if (bs.max.x < RB.x0 || bs.min.x > RB.x1 || bs.max.z < RB.z0 || bs.min.z > RB.z1 || bs.max.y < RB.y0 || bs.min.y > RB.y1) return;
      const geo = o.geometry, pos = geo.attributes.position, idx = geo.index, tri = idx ? idx.count / 3 : pos.count / 3, M = o.matrixWorld; let col = null;
      for (let t = 0; t < tri; t++) {
        const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
        a.fromBufferAttribute(pos, i0).applyMatrix4(M); b.fromBufferAttribute(pos, i1).applyMatrix4(M); c.fromBufferAttribute(pos, i2).applyMatrix4(M);
        const mx = (a.x + b.x + c.x) / 3, my = (a.y + b.y + c.y) / 3, mz = (a.z + b.z + c.z) / 3;
        if (mx < RB.x0 || mx > RB.x1 || mz < RB.z0 || mz > RB.z1 || my < RB.y0 || my > RB.y1) continue;
        n.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a)).normalize(); if (Math.abs(n.y) > 0.6) continue;   // (floors + ceilings stay)
        if (n.x * (CX - mx) + n.z * (CZ - mz) <= 0) continue;   // (only the faces looking into the room: the other side of each wall stays)
        if (!col) { col = geo.attributes.color && geo.attributes.color.itemSize === 3 ? geo.attributes.color : new THREE.Float32BufferAttribute(new Float32Array(pos.count * 3).fill(1), 3); }
        const WC = Math.abs(n.z) > 0.7 && Math.abs(mz) > 18 ? SIM_SCR : SIM_WALL; for (const i of [i0, i1, i2]) col.setXYZ(i, WC.r, WC.g, WC.b); nV++;
      }
      if (col) { geo.setAttribute('color', col); col.needsUpdate = true; o.material = Array.isArray(o.material) ? o.material.map(m => { const k = m.clone(); k.vertexColors = true; return k; }) : Object.assign(o.material.clone(), { vertexColors: true }); }
    });
    console.log('[sim room] wall faces:', nV, 'skins:', window.__simSkins); }
  // 'skywalk arch' (22 Oct): the glass band carved above, rebuilt in its own material with an arched opening where the skywalk
  // passes through it (the skywalk deck is at ~11.07 m there; you walk under the arch's 14.2 m crown)
  { let src = null; world.traverse(o => { if (!src && o.isMesh && o.name === 'Arch' && !Array.isArray(o.material) && o.material.name === 'PaletteMaterial003') src = o; });
    if (src) {
      const X = -177.69, Z0 = -27.45, Z1 = 25.54, Y0 = 12.56, Y1 = 14.47, a = -1.95, b = 1.15, ys = 13.45, crown = 14.2, S = new THREE.Shape();
      S.moveTo(Z0, Y0); S.lineTo(a, Y0); S.lineTo(a, ys);
      for (let i = 1; i <= 16; i++) { const t = Math.PI - i / 16 * Math.PI; S.lineTo((a + b) / 2 + Math.cos(t) * (b - a) / 2, ys + Math.sin(t) * (crown - ys)); }
      S.lineTo(b, Y0); S.lineTo(Z1, Y0); S.lineTo(Z1, Y1); S.lineTo(Z0, Y1); S.closePath();
      const band = new THREE.Mesh(new THREE.ShapeGeometry(S), src.material); band.name = 'Arch skywalk band';
      band.position.set(X, 0, 0); band.rotation.y = -Math.PI / 2; scene.add(band); band.updateMatrixWorld(true); world.attach(band);
    } }
  const ctrOf = c => c.reduce((a, v) => [a[0] + v[0] / 4, a[1] + v[1] / 4, a[2] + v[2] / 4], [0, 0, 0]);
  data.signs = data.signs.filter(sg => !carved(...ctrOf(sg.c)));
  data.arts = data.arts.filter(a => !carved(...(a.c ? ctrOf(a.c) : a.p)));
  data.vids = data.vids.filter(v => v.keep || !carved(...v.p));   // (keep: placed on purpose inside a carved region, like the hanging welcome film)
  const colGeos = [];
  const wood = makeWood();   // honey oak planks, drawn here (no file)
  world.traverse(o => {
    if (!o.isMesh) return;
    const old = o.material, mats = Array.isArray(old) ? old : [old];
    const conv = mats.map(m => {   // Lambert: cheap on phones, and no black metal without an env map
      const n = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, emissive: m.emissive, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissiveIntensity ?? 1, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, side: m.side, vertexColors: m.vertexColors });
      n.name = m.name || '';   // kept so add-ons can find things (the park's tree cards)
      if (m.metalness > 0.5 && !m.map) n.color.multiplyScalar(0.85);
      if (isPaletteMat(n)) woodify(n, wood, 4, true);   // New Wing look: white floors become hardwood, grey walls go gallery white
      return n;
    });
    o.material = Array.isArray(old) ? conv : conv[0];
    o.matrixAutoUpdate = false;
    // walls/floors to collide with (skip see-through decals)
    const m0 = mats[0]; if (m0.transparent && m0.opacity < 0.2) return;
    const see = m0.transparent || m0.alphaTest > 0 || (m0.opacity ?? 1) < 0.95;   // (glass, tree cards: you can see through them)
    if (o.isInstancedMesh) {
      for (let i = 0; i < o.count; i++) { const mi = new THREE.Matrix4(); o.getMatrixAt(i, mi); const g = o.geometry.clone(); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(o.matrixWorld, mi)); g.userData.lab = (see ? 'see:' : 'glb:') + o.name + '#' + i; colGeos.push(g); }
    } else { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); g.userData.lab = (see ? 'see:' : 'glb:') + (o.name || (o.parent && o.parent.name) || '?'); colGeos.push(g); }
  });
  // New Artists Wing: built from Ben's artist pages, entered through a doorway in the main hall (quick fade, like our interiors)
  // joined to the south end of the Wall of Why hallway (x -74..-66), running out over the lawn; walk straight in
  // the New Artists Wing (22 Oct: split in two, the same size either side of the hall). North: off the hall's north corridor;
  // south: where the AMB's old room was, at the end of the south corridor. The artists are shared out, first half north.
  const WING_O = new THREE.Vector3(-69.9, -3.14, 22.0), WING_S_O = new THREE.Vector3(-69.9, -3.14, -31.8), WING_L = 64;
  const WA = data.wing ? data.wing.artists : [], half = Math.ceil(WA.length / 2);
  // (22 Oct) community photos for the wings' bare walls: the south half's spare bay and both end walls
  const COMM = ['group_photo_blind_can_square_50kb_270309875', 'ben_and_lorrane_square_50kb_270309880', '2_steves_square_50kb_270309872', 'bcp_wall_at_arvo_square_50kb_270309879', 'com1_square_50kb_270309876', 'art_and_people_square_50kb_270309873', 'combranding_all_community_square_50kb_270309881', 'group_photo_blind_can_square_50kb_270309875'].map(n => 'gallery/img/' + n + '.webp');
  const wingTitle = list => ({ kicker: 'THE BLIND CANVAS PROJECT', lines: ['New Artists', 'Wing'], sub: list.map(a => a.name).join(' · ') });
  const wings = !data.wing ? [] : [
    Object.assign(buildWing({ scene, wing: { artists: WA.slice(0, half) }, O: WING_O, rotY: Math.PI / 2, doorW: 8.4, wood, resolveImg: RES, L: WING_L, spacious: true, title: wingTitle(WA.slice(0, half)), community: COMM.slice(6) }), { O: WING_O }),
    Object.assign(buildWing({ scene, wing: { artists: WA.slice(half) }, O: WING_S_O, rotY: -Math.PI / 2, doorW: 8.4, wood, resolveImg: RES, L: WING_L, spacious: true, title: wingTitle(WA.slice(half)), fillLogo: 'gallery/img/blind_canvas_project_logo__270692239.webp', community: COMM.slice(0, 6) }), { O: WING_S_O }),   // (its spare bay gets the logo)
  ];
  const wing = wings.length ? { col: wings.flatMap(w => w.col), arts: wings.flatMap(w => w.arts), screens: wings.flatMap(w => w.screens), canvases: wings.flatMap(w => w.canvases),
    bounds: { containsPoint: p => wings.some(w => w.bounds.containsPoint(p)) }, load() { wings.forEach(w => w.load()); }, unload() { wings.forEach(w => w.unload()); } } : null;
  const doors = [];
  if (wing) for (const m of wing.col) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); g.userData.lab = 'wing'; colGeos.push(g); }
  const entrance = buildEntrance({ scene, wood });
  const glbRay = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0);
  const kiosks = buildKiosks({ scene, resolveImg: RES, groundAt: (x, y, z) => { glbRay.set(new THREE.Vector3(x, y, z), DOWN); glbRay.far = 30; const h = glbRay.intersectObject(world, true)[0]; return h ? h.point.y : -1e9; } });
  const rooms = buildRooms({ scene, data, wood, resolveImg: RES, buildWing });
  // the park campus: BLIND CAN CINEMA, the WHY House, the AMB building's outside, and the museum's signs pointing to them
  const campus = NOWORLD ? null : buildCampus({ scene, wood, woodify, vids: data.vids, resolveImg: RES, lowEnd, camera, sky: () => outdoors.sky ? outdoors.sky() : 'golden' });
  // comment spots (11 Oct): the only places a floating note can be left: a raised yellow pad and a YOUR COMMENTS HERE sign
  const comments = NOWORLD ? null : buildCommentSpots({ THREE, scene });
  const braille = buildBraille({ scene, resolveImg: RES });   // 'Hope Floating in Braille': an island on the welcome plaza, at the end away from the museum
  patchOldBraille({ scene, wood, woodify });
  const lift = buildElevator({ scene, resolveImg: RES });   // the lift from the music room up through the pupil to the eye platform
  const skywalk = buildSkywalk({ scene, wood, woodify });   // the ramp from the 2nd floor up to the eye platform
  const eyelid = buildEyelid({ scene, wood, woodify });   // the music room's eye-shaped ceiling, rebuilt smooth
  const ringGlass = buildRingGlass({ scene, data, resolveImg: RES });   // the outer ring's big windows: stained-glass versions of the art
  const zen = buildZen({ scene });
  const bioWalls = buildBioWalls({ scene, data });
  // the Six Views severity lecterns: solid, so you walk round them
  const simCol = (data.simKiosks || []).map(k => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.9)); m.position.set(k.p[0], k.p[1] + 0.8, k.p[2]); m.rotation.y = k.face || 0; m.updateMatrixWorld(true); return m; });
  // invisible edges: the plaza's open side above the lake (the other sides have railings)
  // the cherry blossom garden east of the plaza: a lawn terrace level with the plaza, walled by hedges (invisible walls behind them)
  const edgeCol = [];
  if (!NOWORLD) {
    const B = (w, h, d, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); m.position.set(x, y, z); m.rotation.y = ry; m.updateMatrixWorld(true); edgeCol.push(m); };
    const G = GARDEN, gw = G.x1 - G.x0, gd = G.z1 - G.z0, gx = (G.x0 + G.x1) / 2;
    B(gw, 0.6, gd, gx, G.y - 0.3, 0);                                                      // the lawn
    // hedges: north, south, east, and west beside the lake. Each wall covers the whole 0.9 m hedge plus the terrace edge
    // behind it, so you walk up to the leaves rather than into them (22 Oct)
    B(gw, 3, 1.1, gx, 1.5, G.z1 - 0.35); B(gw, 3, 1.1, gx, 1.5, G.z0 + 0.35); B(1.1, 3, gd, G.x1 - 0.35, 1.5, 0);
    const sl = G.z1 - G.plaza.z; B(1.1, 3, sl, G.x0 + 0.35, 1.5, G.plaza.z + sl / 2); B(1.1, 3, sl, G.x0 + 0.35, 1.5, -G.plaza.z - sl / 2);
    const plan = planGarden();
    for (const [x, z] of plan.lanterns) B(0.7, 1.6, 0.7, x, 0.8, z);
    for (const [x, z] of plan.poles) B(0.5, 3, 0.5, x, 1.5, z);   // the light poles (27 Oct)
    for (const [x, z, ry] of plan.benches) B(2.5, 0.6, 0.7, x, 0.3, z, ry);
    // (27 Oct) the start platform where the big tree stood: two round steps you walk up (ground + collision)
    for (const [r, h] of [[6.2, 0.2], [5.3, 0.4]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32)); m.position.set(RING.x, G.y + h / 2, RING.z); m.updateMatrixWorld(true); edgeCol.push(m); }
    // (27 Oct) the name sign + the two tall flags are gone: no colliders for them
  }
  // furnishings: plants at the plaza corners and the main hall entrance, benches on the plaza looking out over the lake
  const propCol = [];
  const propsG = new THREE.Group(); scene.add(propsG);
  const place = (p, x, z, ry = 0) => { const y = (() => { glbRay.set(new THREE.Vector3(x, 4, z), DOWN); glbRay.far = 12; const h = glbRay.intersectObject(world, true)[0]; return h ? h.point.y : 0; })(); p.group.position.set(x, y, z); p.group.rotation.y = ry; propsG.add(p.group); const cb = new THREE.Mesh(new THREE.BoxGeometry(...p.size)); cb.position.set(x, y + p.size[1] / 2, z); cb.rotation.y = ry; cb.updateMatrixWorld(true); propCol.push(cb); };
  for (const [x, z] of [[6.4, 12.4], [6.4, -12.4], [-12.2, 12.4], [-12.2, -12.4]]) place(makePlant(2.3), x, z);   // (the two that stood on the main hall's ramps came out, 11 Oct: ramps stay clear)
  for (const z of [7.6, -7.6]) place(makeBench(2.8), 5.6, z, Math.PI / 2);
  // (27 Oct) fun props (engine/gallery-fun-props.js): built once, still ones merged below, moving ones ticked every frame
  const fun = (() => {
    const floorAt = (x, z) => { glbRay.set(new THREE.Vector3(x, 30, z), DOWN); glbRay.far = 60; const hits = glbRay.intersectObjects([world, ...(campus ? [campus.group] : [])], true).filter(h => h.face && h.face.normal.y > 0.5 && h.point.y < 12); return hits.length ? hits[0].point.y : 0; };
    try { const f = buildFunProps({ floorAt, CAMPUS }); scene.add(f.group, f.moving); return f; }
    catch (e) { console.warn('fun props skipped', e); return { group: new THREE.Group(), moving: new THREE.Group(), col: [], inside: [], tick() {} }; }
  })();
  // glass in the building's tall wall openings: you see out to the trees and the city, and can't walk out
  const winCol = [];
  {
    const glassM = new THREE.MeshBasicMaterial({ color: 0xcfe3ec, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
    const sheenTex = (() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d'); const g = c.createLinearGradient(0, 0, 64, 256); g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.42, 'rgba(255,255,255,0.0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(0.56, 'rgba(255,255,255,0.0)'); g.addColorStop(0.7, 'rgba(255,255,255,0.18)'); g.addColorStop(0.74, 'rgba(255,255,255,0.0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(cv); })();
    const sheenM = new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const frameM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
    for (const w of data.windows || []) {
      const [xa, xb] = w.x, [ya, yb] = w.y, cx = (xa + xb) / 2, cy = (ya + yb) / 2, W = xb - xa, H = yb - ya;
      const g = new THREE.Group(); g.position.set(cx, cy, w.z); scene.add(g);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), stainedGlass({ cell: 0.85, y0: ya, y1: yb, opacity: 0.45 })); pane.renderOrder = 4; g.add(pane);   // stained glass, in the eye facade's style
      for (let k = 1; k < Math.max(2, Math.round(H / 3.2)); k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.08), frameM); b.position.y = -H / 2 + k * H / Math.max(2, Math.round(H / 3.2)); g.add(b); }   // slim transoms
      const c = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.2)); c.position.set(cx, cy, w.z); c.updateMatrixWorld(true); winCol.push(c);
    }
  }
  for (const [lab, list] of Object.entries({ entrance: entrance.col, rooms: rooms.col, kiosks: kiosks.col, bioWalls: bioWalls.col, braille: braille.col, lift: lift.col, skywalk: skywalk.col, simKiosks: simCol, ringLow: ringGlass.col, zen: zen.col, edges: edgeCol, props: propCol, funProps: fun.col, windows: winCol, campus: campus ? campus.col : [], comments: comments ? comments.col : [] })) for (const m of list) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); g.userData.lab = (m.userData.see ? 'see:' : '') + lab + (m.name ? ':' + m.name : ''); colGeos.push(g); }   // (28 Oct: see = a window's blocker: solid, but rays see past it)
  // one position-only collision mesh with a BVH (fast rays on phones)
  let total = 0; for (const g of colGeos) total += (g.index ? g.index.count : g.attributes.position.count);
  const P = new Float32Array(total * 3); let k = 0;
  const colSrc = [];   // (debug: which thing each run of triangles came from, so a walk check can name what's in the way)
  for (const g of colGeos) { colSrc.push([k / 9, g.userData.lab || '?']); const pa = g.attributes.position, ix = g.index; const n = ix ? ix.count : pa.count; for (let i = 0; i < n; i++) { const j = ix ? ix.getX(i) : i; P[k++] = pa.getX(j); P[k++] = pa.getY(j); P[k++] = pa.getZ(j); } g.dispose(); }
  const colGeo = new THREE.BufferGeometry(); colGeo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  // draw-call saver: inside each built group (rooms, the wing, the walkway, kiosks), merge still meshes that share a material
  function mergeStatic(root) {
    // (12 Oct) also boxes with a material per face (a building's walls, its painted front, its roof: up to 6 draws each): each face
    // set joins the other things in the group that share its material. And merges stay local (40 m cells), so the occlusion
    // can still skip the parts of a group that are behind a wall.
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), buckets = new Map(), m4 = new THREE.Matrix4(), wp = new THREE.Vector3();
    const KEEP = ['position', 'normal', 'uv'], split = new Set();
    const add = (o, mat, piece) => {
      const ga = o.geometry, keys = KEEP.filter(k => ga.attributes[k]).join(',');
      o.getWorldPosition(wp); const key = mat.uuid + '|' + keys + '|' + o.renderOrder + '|' + Math.floor(wp.x / 40) + ',' + Math.floor(wp.z / 40) + ',' + Math.floor(wp.y / 14);
      if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push({ o, mat, piece });
    };
    root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.children.length || !o.visible || o.userData.dyn) return;
      const ga = o.geometry; if (!ga || !ga.attributes.position) return;
      if (!Array.isArray(o.material)) { add(o, o.material, null); return; }
      if (!ga.groups.length || o.material.some(m => !m || m.userData.dyn)) return;
      split.add(o); for (const gr of ga.groups) { const m = o.material[gr.materialIndex]; if (m && m.visible !== false) add(o, m, gr); }
    });
    const pieceGeo = (o, gr) => {
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const k of Object.keys(g.attributes)) if (!KEEP.includes(k)) g.deleteAttribute(k);
      if (gr) { const out = new THREE.BufferGeometry(); for (const k of Object.keys(g.attributes)) { const a = g.attributes[k], n = a.itemSize; out.setAttribute(k, new THREE.BufferAttribute(a.array.slice(gr.start * n, (gr.start + gr.count) * n), n)); } g.dispose(); g = out; }
      else g.clearGroups();
      g.applyMatrix4(m4.multiplyMatrices(inv, o.matrixWorld)); return g;
    };
    let saved = 0; const gone = new Set();
    for (const list of buckets.values()) {
      if (list.length < 2 && !split.has(list[0].o)) continue;
      const geos = list.map(e => pieceGeo(e.o, e.piece));
      const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false); if (geos.length > 1) geos.forEach(g => g.dispose()); if (!merged) continue;
      const mm = new THREE.Mesh(merged, list[0].mat); mm.renderOrder = list[0].o.renderOrder; mm.matrixAutoUpdate = false; root.add(mm); mm.updateMatrix();
      for (const e of list) gone.add(e.o); saved += list.length - 1;
    }
    for (const o of gone) o.parent && o.parent.remove(o);
    return saved;
  }
  // (22 Oct) film screens are never merged: their face material is swapped to the film when it plays, so they must stay their own mesh
  for (const v of [...(wing ? wing.screens : []), ...rooms.screens, ...(campus ? campus.screens : [])]) v.box.userData.dyn = true;
  // (27 Oct) the same for the paintings in the New Artists Wing and the rooms: a living painting fades in on its own canvas box, so
  // merging the box away left those 24 still (the main hall's art is never merged, which is why it moved and these didn't)
  for (const cv of [...(wing ? wing.canvases : []), ...rooms.canvases]) if (cv.mesh) cv.mesh.userData.dyn = true;
  { let saved = 0; for (const g of [entrance.group, kiosks.group, bioWalls.group, propsG, fun.group, ringGlass && ringGlass.group, zen && zen.group, ...wings.map(w => w.group), campus && campus.group, braille.group, comments && comments.group, skywalk.group, eyelid && eyelid.group, ...rooms.list.map(r => r.room.group)]) if (g) saved += mergeStatic(g); console.log('[perf] merged', saved, 'static meshes'); }
  // (28 Oct, Ben: in the Academy of Music the stage lights, the drums and the wall lamps popped in and out as he walked) the AMB's
  // two rooms are one open space with the house lights down: nothing in them is skipped as "small and far" or "behind a wall".
  // (Outside the building the campus still hides its inside-only parts, and the rooms' art still loads by distance.)
  if (campus) { const A1 = CAMPUS.amb, A2 = CAMPUS.amb2, inA = (x, z) => (x > A1.x0 - 0.8 && x < A1.x1 + 0.8 && z > A1.z0 - 0.8 && z < A1.z1 + 0.2) || (x > A2.x0 && x < A2.x1 + 0.8 && z > A2.z0 - 0.8 && z < A2.z1 + 0.8) || (x > CAMPUS.why.x0 && x < CAMPUS.why.x1 && z > CAMPUS.why.z0 && z < CAMPUS.why.z1), c = new THREE.Vector3();   // (28 Oct: + the WHY House, seen through its windows)
    scene.traverse(o => { if (!(o.isMesh || o.isPoints) || !o.geometry) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const bs = o.geometry.boundingSphere; if (!bs || bs.radius > 12) return;
      o.updateWorldMatrix(true, false); c.copy(bs.center).applyMatrix4(o.matrixWorld); if (c.y > -1 && c.y < 9 && inA(c.x, c.z)) o.userData.noCull = true; }); }
  // phones: small far things (a plaque, a stool, a frame on a wall 60 m away) are a few pixels but each costs a draw call.
  // Every quarter second, anything smaller than ~0.5 degree on screen is skipped; it comes back long before it's big enough to see.
  // (From the park you see the whole museum: this saves ~300 of its ~830 draws.)
  // (works on draw layers, not .visible, so nothing that shows or hides itself is disturbed; the list is made once, after everything is built)
  // Lite mode (12 Oct): for older phones. 1x resolution, small things drop out sooner, the view ends at ~330 m in the haze
  // (the far city and trees), art and labels draw from shorter range. Turns itself on if the phone keeps struggling.
  const LITE = { on: false, near: 28, k: 0.012, art: 90, label: 40, userOff: false };
  function setLite(on, auto) {
    if (on === LITE.on) return; LITE.on = on; if (!auto && !on) LITE.userOff = true;
    LITE.near = on ? 22 : 36; LITE.k = on ? 0.016 : 0.009; LITE.art = on ? 75 : 110; LITE.label = on ? 32 : 50;   // (28 Oct, Ben: things popped in; pushed ~25 % further)
    if (!LITE.fog) LITE.fog = scene.fog ? [scene.fog.near, scene.fog.far] : null, LITE.far = camera.far;
    if (scene.fog && LITE.fog) { scene.fog.near = on ? 90 : LITE.fog[0]; scene.fog.far = on ? 330 : LITE.fog[1]; }
    camera.far = on ? 360 : LITE.far; camera.updateProjectionMatrix();
    Q.max = on ? 1 : Q.max0; if (Q.pr > Q.max) { Q.pr = Q.max; renderer.setPixelRatio(Q.pr); renderer.setSize(W(), H()); }
    onLite(on, !!auto);
  }
  let DETAIL = null;
  const DETAIL_ON = new URLSearchParams(location.search).get('detail') !== 'all';
  function detailCull() {
    if (!DETAIL_ON) return; const cp = camera.position;
    if (!DETAIL) { DETAIL = []; scene.traverse(o => {
        if (!(o.isMesh || o.isLineSegments) || o.isInstancedMesh || o.isSkinnedMesh || !o.geometry || o.userData.noCull || (o.layers.mask !== 1 && !o.userData.occ)) return;
        if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const bs = o.geometry.boundingSphere; if (!bs || !isFinite(bs.radius)) return;
        o.updateWorldMatrix(true, false); const r = bs.radius * o.matrixWorld.getMaxScaleOnAxis();
        if (r < 2.5) DETAIL.push({ o, lc: bs.center.clone(), r, off: false }); });
      console.log('[perf] small things that skip drawing when far:', DETAIL.length); }
    const c = new THREE.Vector3();
    for (const D of DETAIL) { c.copy(D.lc).applyMatrix4(D.o.matrixWorld); const d = c.distanceTo(cp), k = D.r / Math.max(d, 0.1);
      if (!D.off) { if (d > LITE.near && k < LITE.k) { D.o.layers.set(1); D.off = true; D.o.userData.far = true; } }
      else if (d <= LITE.near || k > LITE.k * 1.2) { D.off = false; D.o.userData.far = false; if (!D.o.userData.occ) D.o.layers.set(0); } }
  }
  const bvh = new MeshBVH(colGeo);
  const ray = new THREE.Ray();
  const cast = (ox, oy, oz, dx, dy, dz, far) => { ray.origin.set(ox, oy, oz); ray.direction.set(dx, dy, dz); const h = bvh.raycastFirst(ray, THREE.DoubleSide, 0, far); return h && h.distance <= far ? h : null; };
  const colWhat = fi => { let lo = 0, hi = colSrc.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (colSrc[m][0] <= fi) lo = m; else hi = m - 1; } return colSrc[lo][1]; };

  // ---------------------------------------------------------------- occlusion (12 Oct, phones): skip what's behind walls
  // The camera only knows what's in front of it, not what's behind a wall, so from the 2nd floor it drew the whole park, the
  // campus buildings, the music room and the wing (~250 of ~450 draws). Everything is grouped into 14 m tiles; a few times a
  // second each tile is tested with rays from the camera against the walls (glass, tree cards, invisible edges and small props
  // don't block). A tile no ray reaches is skipped; tiles near you always draw. It's where you stand that counts, not where you
  // look, so turning round never makes anything pop in. (?occ=off turns it off, for comparison.)
  const OCC_ON = new URLSearchParams(location.search).get('occ') !== 'off';
  const OCC_MS = +(new URLSearchParams(location.search).get('occms') || 1.5);   // (time per frame for the rays; tests raise it)
  const SEE_THROUGH = /^(see:|windows|edges|props|kiosks|comments|simKiosks|braille|lift)/;
  let OCC = null;
  const occDir = new THREE.Vector3();
  function occBuild() {
    OCC = { tiles: [], order: [], i: 0, pass: 0, from: new THREE.Vector3(1e9, 0, 0), hidden: 0 };
    const map = new Map(), box = new THREE.Box3(), sz = new THREE.Vector3(), c = new THREE.Vector3(), skip = new Set([player, lift.group]);
    const walk = o => {
      if (skip.has(o) || o.userData.noCull || o.userData.dyn || o.isSprite || o.isSkinnedMesh || o.isInstancedMesh) return;   // (28 Oct: batches (the art spotlights + fixtures, the floor piano's keys, things placed after the tiles were made) were filed under one tile at their unset bounds, the plaza, and vanished everywhere whenever that tile was behind a wall. A batch is one draw: never worth hiding)
      if ((o.isMesh || o.isLineSegments || o.isPoints) && o.geometry && o.geometry.attributes.position) {
        o.updateWorldMatrix(true, false);
        if (o.isInstancedMesh) { o.computeBoundingBox(); box.copy(o.boundingBox).applyMatrix4(o.matrixWorld); }
        else { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); }
        box.getSize(sz);
        if (isFinite(sz.x) && Math.max(sz.x, sz.z) <= 48) {   // (bigger things, like the museum's shell, always draw)
          box.getCenter(c); const key = Math.floor(c.x / 14) + ',' + Math.floor(c.z / 14) + ',' + Math.floor((c.y + 5) / 7);
          let T = map.get(key); if (!T) { T = { box: new THREE.Box3(), objs: [], miss: 0, hidden: false }; map.set(key, T); OCC.tiles.push(T); }
          T.box.union(box); T.objs.push(o);
        }
      }
      for (const ch of o.children) walk(ch);
    };
    for (const ch of scene.children) walk(ch);
    for (const T of OCC.tiles) {   // where to aim: the middle, the corners (pulled in a little) and the middle of each face
      const b = T.box, mid = b.getCenter(new THREE.Vector3()), P = [mid];
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) P.push(new THREE.Vector3(x, y, z).lerp(mid, 0.12));
      for (const [ax, v] of [['x', b.min.x], ['x', b.max.x], ['y', b.max.y], ['z', b.min.z], ['z', b.max.z]]) { const q = mid.clone(); q[ax] = v; P.push(q.lerp(mid, 0.05)); }
      T.pts = P; T.boxX = b.clone().expandByScalar(0.6);
    }
    console.log('[perf] occlusion tiles:', OCC.tiles.length);
  }
  function occSeen(e, p, bx) {   // is there a clear line from the eye to this point (or to something of this tile on the way)?
    occDir.subVectors(p, e); let len = occDir.length(); if (len < 0.5) return true; occDir.divideScalar(len);
    let ox = e.x, oy = e.y, oz = e.z;
    for (let k = 0; k < 6; k++) {
      const h = cast(ox, oy, oz, occDir.x, occDir.y, occDir.z, len);
      if (!h || h.distance > len - 0.3 || bx.containsPoint(h.point)) return true;
      if (!SEE_THROUGH.test(colWhat(h.face.a / 3))) return false;
      const s = h.distance + 0.04; ox += occDir.x * s; oy += occDir.y * s; oz += occDir.z * s; len -= s;
    }
    return true;
  }
  // art and signs stream in and out as you walk: each becomes its own small tile (aimed at tightly, so the wall it hangs on
  // hides it from the far side of that wall)
  const occBox = new THREE.Box3();
  function occAdd(root) {
    if (!OCC) return; occBox.setFromObject(root); if (occBox.isEmpty()) return;
    const b = occBox.clone(), mid = b.getCenter(new THREE.Vector3()), P = [mid], objs = [];
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) P.push(new THREE.Vector3(x, y, z).lerp(mid, 0.1));
    root.traverse(o => { if (o.isMesh || o.isLineSegments) objs.push(o); });
    const T = { box: b, boxX: b.clone().expandByScalar(0.12), pts: P, objs, miss: 0, hidden: false, root };
    OCC.tiles.push(T); root.userData.occT = T;
  }
  function occRemove(root) { const T = root.userData.occT; if (!T || !OCC) return; if (T.hidden) OCC.hidden--; T.hidden = false; T.objs = []; const i = OCC.tiles.indexOf(T); if (i >= 0) OCC.tiles.splice(i, 1); }
  function occSet(T, hide) { if (hide === T.hidden) return; T.hidden = hide; OCC.hidden += hide ? 1 : -1; for (const o of T.objs) { o.userData.occ = hide; o.layers.set(hide || o.userData.far ? 1 : 0); } }
  function occCull() {
    if (!OCC_ON || NOWORLD) return; if (!OCC) occBuild();
    const e = camera.position, t0 = performance.now();
    for (const T of OCC.tiles) if (T.hidden && T.box.distanceToPoint(e) < 12) { T.miss = 0; occSet(T, false); }   // walking up to something: it's there at once
    if (OCC.i >= OCC.order.length) {   // start a new pass once you've moved; nearest tiles first
      const still = OCC.pass > 0 && e.distanceToSquared(OCC.from) < 0.16;
      if (still && (OCC.idle >= 2 || !OCC.tiles.some(T => T.miss === 1))) return;   // (standing still: up to two more passes settle anything half-decided)
      OCC.idle = still ? (OCC.idle || 0) + 1 : 0;
      OCC.from.copy(e); OCC.pass++; OCC.i = 0;
      for (const T of OCC.tiles) T.d = T.box.distanceToPoint(e);
      OCC.order = OCC.tiles.slice().sort((a, b) => a.d - b.d);
    }
    while (OCC.i < OCC.order.length && performance.now() - t0 < OCC_MS) {
      const T = OCC.order[OCC.i++]; if (T.root && !T.root.visible) continue;   // (art too far to draw anyway)
      if (LITE.on && Pl.x < -66 && T.box.min.x > -12) { T.miss = 2; occSet(T, true); continue; }   // Lite, inside the museum: the park (only glimpsed down the entrance) is skipped
      let seen = T.box.distanceToPoint(e) < 12;
      if (!seen) for (const q of T.pts) if (occSeen(e, q, T.boxX)) { seen = true; break; }
      if (seen) { T.miss = 0; occSet(T, false); } else if (++T.miss >= 2) occSet(T, true);   // gone only after two passes agree (no flicker)
    }
  }

  // ---------------------------------------------------------------- signs & artworks (PlayCanvas UI elements, rebuilt as planes, streamed in near you)
  const texLoader = new THREE.TextureLoader();
  const quad = c => { const g = new THREE.BufferGeometry(); const [a, b, cc, d] = c; g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...cc, ...a, ...cc, ...d], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); return g; };
  function wrapLines(ctx, text, maxW) {
    const out = [];
    for (const para of String(text).split('\n')) {
      const words = para.split(/\s+/); let line = '';
      for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
      out.push(line);
    }
    return out;
  }
  function textTexture(s) {
    const K = Math.min(1.6, 1024 / Math.max(s.w, s.h)) * TEXMEM.scale;
    const cv = document.createElement('canvas'); cv.width = Math.round(s.w * K); cv.height = Math.round(s.h * K);
    const ctx = cv.getContext('2d');
    ctx.font = `${s.b ? 700 : 400} ${s.fs * K}px Arimo, Archivo, Helvetica, Arial, sans-serif`;
    const lines = wrapLines(ctx, s.s, cv.width - 2);
    const lh = Math.max(s.lh, s.fs * 1.0) * K, th = lines.length * lh;
    const c = s.col; ctx.fillStyle = `rgb(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0})`;
    ctx.textBaseline = 'middle'; ctx.textAlign = s.al[0] < 0.34 ? 'left' : s.al[0] > 0.66 ? 'right' : 'center';
    const x = s.al[0] < 0.34 ? 1 : s.al[0] > 0.66 ? cv.width - 1 : cv.width / 2;
    const y0 = (cv.height - th) * (1 - s.al[1]) + lh / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lh));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return lean(t);
  }
  // titles on the building's beams: white text on an ink plate with room around it (they used to be white-on-white and touch the edges)
  function plateSign(s) {
    const c = s.c.map(v => new THREE.Vector3(...v)), u = c[1].clone().sub(c[0]), v = c[3].clone().sub(c[0]); const boxW = u.length(); u.normalize(); v.normalize();
    const n = new THREE.Vector3().crossVectors(u, v).normalize(), ctr = c[0].clone().add(c[1]).add(c[2]).add(c[3]).multiplyScalar(0.25);
    const K = 220, fsM = Math.min(0.34, (s.fs || 48) * 0.0068), F = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
    const mc = document.createElement('canvas').getContext('2d'); mc.font = `800 ${fsM * K}px ${F}`;
    const maxW = (boxW - 0.6) * K; let lines = [s.s.toUpperCase()];
    if (mc.measureText(lines[0]).width > maxW && lines[0].includes(': ')) lines = lines[0].split(/:\s+/).map((l, i, a) => i < a.length - 1 ? l + ':' : l);
    else if (mc.measureText(lines[0]).width > maxW) { const words = lines[0].split(/\s+/); lines = ['']; for (const w of words) { const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w; if (mc.measureText(t).width > maxW && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t; } }
    const tw = Math.max(...lines.map(l => mc.measureText(l).width)) / K, padX = 0.32, padY = 0.2, lh = fsM * 1.12;
    const W = tw + padX * 2, H = lines.length * lh + padY * 2;
    const cv = document.createElement('canvas'); cv.width = Math.round(W * K); cv.height = Math.round(H * K); const x = cv.getContext('2d');
    x.fillStyle = '#1d1c1b'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#ec3013'; x.fillRect(0, 0, cv.width, Math.round(0.035 * K));
    x.fillStyle = '#ffffff'; x.font = `800 ${fsM * K}px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => x.fillText(l, cv.width / 2, (padY + lh * (i + 0.5)) * K + 0.02 * K));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: t }));
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, n)); m.position.copy(ctr).addScaledVector(n, 0.03); m.renderOrder = 2;
    return m;
  }
  const signs = data.signs.map(s => {
    const c = s.c, ctr = new THREE.Vector3(); c.forEach(v => ctr.add(new THREE.Vector3(...v))); ctr.multiplyScalar(0.25);
    return { s, ctr, mesh: null };
  });
  // arts point at their image sign
  const arts = data.arts.map(a => {
    let ctr = new THREE.Vector3(...a.p), img = null;
    if (a.c) { ctr = new THREE.Vector3(); a.c.forEach(v => ctr.add(new THREE.Vector3(...v))); ctr.multiplyScalar(0.25); }
    let best = 1e9; for (const sg of signs) if (sg.s.img) { const d = sg.ctr.distanceTo(ctr); if (d < best) { best = d; img = sg.s.img; } }
    const n = a.c ? new THREE.Vector3().subVectors(new THREE.Vector3(...a.c[1]), new THREE.Vector3(...a.c[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...a.c[3]), new THREE.Vector3(...a.c[0]))).normalize() : new THREE.Vector3();
    const { desc, imgDesc } = splitDesc(a.d);
    return { title: a.t, desc, imgDesc, img: best < 1.5 ? img : null, ctr, n, au: a.au || null, aus: !!a.aus, bio: !!a.bio, vn: a.vn || null, artist: a.artist || null };
  });
  // 'Hope Floating in Braille' is two pools now, one either side of the walk: its card reads from beside either one
  { const i = arts.findIndex(a => /^HOPE FLOATING IN BRAILLE$/i.test(a.title || ''));
    if (i >= 0) { const a = arts[i]; arts.splice(i, 1, ...braille.spots.map(p => ({ ...a, ctr: new THREE.Vector3(p.x, p.y, p.z) }))); } }
  if (wing) arts.push(...wing.arts);
  arts.push(...rooms.arts);
  function showSign(sg) {
    if (sg.mesh) return; const s = sg.s;
    if (s.k === 'c') { const far = sg.d > SHARP; sg.tiny = far && !!s.imgTiny; sg.mesh = canvasBox(sg.tiny ? { ...s, img: s.imgTiny } : s, texLoader); compactGroups(sg.mesh); scene.add(sg.mesh); occAdd(sg.mesh); return; }
    if (s.k === 't' && s.plate) { sg.mesh = plateSign(s); sg.mesh.traverse(o => { o.userData.noCull = true; }); scene.add(sg.mesh); return; }   // (28 Oct, Ben: room signs came in late) wayfinding plates: never occlusion-tested, never culled as small
    if (s.k === 'l') { sg.mesh = new THREE.Mesh(quad(s.c), new THREE.MeshBasicMaterial({ map: cardTexture(s), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); sg.mesh.renderOrder = 2; scene.add(sg.mesh); occAdd(sg.mesh); return; }
    let mat;
    if (s.k === 't') mat = new THREE.MeshBasicMaterial({ map: textTexture(s), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: true });
    else { mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...s.col), transparent: true, opacity: s.op ?? 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); if (s.img) texLoader.load(s.img, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.needsUpdate = true; if (!sg.mesh) t.dispose(); }); }
    sg.mesh = new THREE.Mesh(quad(s.c), mat); sg.mesh.renderOrder = s.k === 't' ? 3 : 2; scene.add(sg.mesh); occAdd(sg.mesh);
  }
  function hideSign(sg) { if (!sg.mesh) return; occRemove(sg.mesh); scene.remove(sg.mesh); sg.mesh.geometry.dispose(); for (const m of [].concat(sg.mesh.material)) { if (m.map) m.map.dispose(); if (m !== sideShared) m.dispose(); } sg.mesh = null; }
  const sideShared = null;
  // how far out art loads (22 Oct: further, so it's there before you can see it): phones load the tiny copies out to 95 m and the
  // sharp ones within SHARP; computers load everything out to 140 m
  const NEAR = lowEnd ? 120 : 175, FAR = NEAR + (lowEnd ? 25 : 35), SHARP = lowEnd ? 55 : 1e9;   // (28 Oct: further again)
  const swapArt = (sg, tiny) => { const face = [].concat(sg.mesh.material)[4]; if (!face) return; sg.tiny = tiny; const want = sg.mesh;
    texLoader.load(tiny ? sg.s.imgTiny : sg.s.img, t => { if (sg.mesh !== want || sg.tiny !== tiny) { t.dispose(); return; } t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; const old = face.map; face.map = t; face.color.set(0xffffff); face.needsUpdate = true; if (old) old.dispose(); }); };   // (phones keep less art in memory: running out reloads the page)   // load art well before it can be seen, so walls never fill in as you watch

  // ---------------------------------------------------------------- video screens (zone video: play while you stand in the room)
  // "Six Views": the vision-simulator room's two big screens show one film through six eye conditions, live (severity set from a kiosk)
  const simWallVids = data.vids.filter(v => v.simwall);
  data.vids = data.vids.filter(v => !v.simwall);
  const simwalls = simWallVids.length ? buildSimWalls({ scene, walls: simWallVids, src: (window.GMEDIA || (u => u))(BASE + 'video/sim_hero.mp4'), kiosk: data.simKiosk, kiosks: data.simKiosks, zone: data.simZone }) : null;
  const vids = data.vids.map(v => {
    const posterMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    if (v.poster) texLoader.load(v.poster, t => { t.colorSpace = THREE.SRGBColorSpace; posterMat.map = t; posterMat.color.set(0xffffff); posterMat.needsUpdate = true; });
    const dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.01, 1.01), [posterMat, posterMat, dark, dark, dark, dark]);
    box.position.set(...v.p); box.quaternion.set(...v.q); box.scale.set(...v.s); scene.add(box);
    const zone = v.tmin ? new THREE.Box3(new THREE.Vector3(...v.tmin), new THREE.Vector3(...v.tmax)).expandByScalar(0.6) : null;
    if (zone) { zone.min.y -= 1; zone.max.y += 2.6; }
    if (zone && /stevie_wonder/.test(v.local || '')) zone.max.x += 4;   // (29 Oct, Ben) the Stevie Wonder film starts a little sooner (4 m before the room)   // tall enough that steps, platforms and jumps don't drop you out of the room (which flicked the screen back to its poster)
    return { ...v, box, posterMat, zone };
  });
  if (wing) vids.push(...wing.screens);
  vids.push(...rooms.screens);
  if (campus) vids.push(...campus.screens);
  for (const v of vids) compactGroups(v.box);   // a screen box draws 2 times, not 6   // a two-sided interview screen in the middle of each bay of the New Artists Wing
  // living paintings: the animated version of an artwork fades in over the still while you stand in front of it
  const ANIMS = new Set(data.anims || []);
  const animOf = k => { const b = k && k.split('/').pop().replace(/\.\w+$/, ''); return b && ANIMS.has(b) ? (window.GMEDIA || (u => u))(BASE + 'anim/' + b + '.mp4') : null; };
  const animItems = [];
  for (const sg of signs) if (sg.s.k === 'c') { const u = animOf(sg.s.key || sg.s.img); if (u) { const c = sg.s.c; animItems.push({ mesh: () => sg.mesh, w: Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]), h: Math.hypot(c[3][0] - c[0][0], c[3][1] - c[0][1], c[3][2] - c[0][2]), url: u }); } }
  for (const cv of [...(wing ? wing.canvases : []), ...rooms.canvases]) { const u = animOf(cv.key); if (u) animItems.push({ mesh: () => cv.mesh, w: cv.w, h: cv.h, url: u }); }
  // the world outside: the lake under the bridge, flags, cherry trees and the city
  let outdoors = { update() {} }; if (!NOWORLD) try { outdoors = buildWorld({ scene, camera, renderer, resolveImg: RES, lowEnd, groundAt: (x, y, z) => { const h = cast(x, y + 0.55, z, 0, -1, 0, 40); return h ? h.point.y : -1e9; } }); } catch (e) { console.warn("outdoors", e); }
  const guides = buildGuides({ scene, guides: data.guides, groundAt: (x, y, z) => { const h = cast(x, y + 0.55, z, 0, -1, 0, 30); return h ? h.point.y : -1e9; } });
  // gallery lighting: a soft warm pool on the wall round every painting, from a small spotlight above it (drawn, no real lights)
  const spotTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
    const g = c.createRadialGradient(128, 70, 10, 128, 120, 150); g.addColorStop(0, 'rgba(255,236,205,0.95)'); g.addColorStop(0.45, 'rgba(255,226,190,0.45)'); g.addColorStop(1, 'rgba(255,220,180,0)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); return t; })();
  const spotMat = new THREE.MeshBasicMaterial({ map: spotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.32, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const fixGeo = new THREE.CylinderGeometry(0.07, 0.11, 0.26, 10); fixGeo.rotateX(0.7); const fixMat = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const spotItems = [];
  for (const sg of signs) if (sg.s.k === 'c') { const c = sg.s.c; spotItems.push({ mesh: () => sg.mesh, w: Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]), h: Math.hypot(c[3][0] - c[0][0], c[3][1] - c[0][1], c[3][2] - c[0][2]) }); }
  for (const cv of [...(wing ? wing.canvases : []), ...rooms.canvases]) spotItems.push({ mesh: () => cv.mesh, w: cv.w, h: cv.h });
  // all the pools and fixtures are two instanced meshes (2 draw calls in total), placed when each painting streams in
  const poolGeo = new THREE.PlaneGeometry(1, 1), poolIM = new THREE.InstancedMesh(poolGeo, spotMat, Math.max(1, spotItems.length)), fixIM = new THREE.InstancedMesh(fixGeo, fixMat, Math.max(1, spotItems.length));
  poolIM.renderOrder = 1; poolIM.frustumCulled = fixIM.frustumCulled = false; scene.add(poolIM, fixIM); poolIM.userData.noCull = fixIM.userData.noCull = true;
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0), lm4 = new THREE.Matrix4(), om4 = new THREE.Matrix4();
  for (let i = 0; i < spotItems.length; i++) { poolIM.setMatrixAt(i, ZERO); fixIM.setMatrixAt(i, ZERO); }
  const shownIn = m => { for (let o = m; o; o = o.parent) if (!o.visible) return false; return !!m.parent; };
  function lightArt() {
    let dirty = false;
    spotItems.forEach((it, i) => {
      const m = it.mesh(), on = !!(m && shownIn(m));
      if (on === !!it.lit && (!on || it.litMesh === m)) return;
      it.lit = on; it.litMesh = m; dirty = true;
      if (!on) { poolIM.setMatrixAt(i, ZERO); fixIM.setMatrixAt(i, ZERO); return; }
      m.updateWorldMatrix(true, false);
      lm4.compose(new THREE.Vector3(0, 0.35, -0.03), new THREE.Quaternion(), new THREE.Vector3(it.w + 2.2, it.h + 2.4, 1)); poolIM.setMatrixAt(i, om4.multiplyMatrices(m.matrixWorld, lm4));
      lm4.makeTranslation(0, it.h / 2 + 1.25, 0.45); fixIM.setMatrixAt(i, om4.multiplyMatrices(m.matrixWorld, lm4));
    });
    if (dirty) { poolIM.instanceMatrix.needsUpdate = fixIM.instanceMatrix.needsUpdate = true; }
  }
  { const SND = new Set(data.animSound || []); for (const it of animItems) it.sound = [...SND].some(b => it.url.includes('/anim/' + b + '.mp4')); }   // (29 Oct, Ben) living paintings that keep their sound
  const animator = artAnimator({ items: animItems, maxActive: lowEnd ? 2 : 3 });
  const localFail = new Set();
  const video = document.createElement('video'); video.crossOrigin = 'anonymous'; video.playsInline = true; video.setAttribute('playsinline', ''); video.loop = true; video.muted = true; video.preload = 'auto';
  const vidTex = new THREE.VideoTexture(video); vidTex.colorSpace = THREE.SRGBColorSpace;
  const vidMat = new THREE.MeshBasicMaterial({ map: vidTex });
  let hls = null, curUrl = null, soundOK = false, vidFail = new Set();
  let hushPaused = false; const zPend = { u: null, t: 0 };   // the film we paused because an artwork was opened
  let pendingSeek = null;   // a watch party asked for a time before the film had loaded
  video.addEventListener('loadedmetadata', () => { if (pendingSeek && pendingSeek.u === curUrl) { try { video.currentTime = pendingSeek.t % (video.duration || 1e9); } catch (e) {} } pendingSeek = null; });
  // a host's live camera / screen share can take over one screen (LIVE.idx); everything else shows the room film or its poster
  const LIVE = { idx: -1, mat: null, el: null, tex: null };
  function applyScreens(url = curUrl) { vids.forEach((v, i) => { for (const f of (v.faces || [0, 1])) v.box.material[f] = i === LIVE.idx && LIVE.mat ? LIVE.mat : (url && v.u === url && !vidFail.has(url)) ? vidMat : v.posterMat; }); }
  function liveShow(idx, stream) {
    liveClear(true);
    const el = document.createElement('video'); el.muted = true; el.playsInline = true; el.setAttribute('playsinline', ''); el.autoplay = true; el.srcObject = stream;
    const p = el.play(); if (p && p.catch) p.catch(() => {});
    const tex = new THREE.VideoTexture(el); tex.colorSpace = THREE.SRGBColorSpace;
    Object.assign(LIVE, { idx, el, tex, mat: new THREE.MeshBasicMaterial({ map: tex }) }); applyScreens();
  }
  function liveClear(quiet) { if (LIVE.el) { LIVE.el.pause(); LIVE.el.srcObject = null; } if (LIVE.tex) LIVE.tex.dispose(); if (LIVE.mat) LIVE.mat.dispose(); Object.assign(LIVE, { idx: -1, mat: null, el: null, tex: null }); if (!quiet) applyScreens(); }
  // (a screen's own world position: p when given, as rooms' screens get merged into their room's meshes and then sit at the origin)
  const vidPos = v => v.wp || (v.wp = v.p ? new THREE.Vector3(...v.p) : v.box.getWorldPosition(new THREE.Vector3()));
  const screenPos = i => vidPos(vids[i]);
  function nearestScreen(x, y, z) {   // the screen of the room you're in, or else the closest one in sight range
    const p = new THREE.Vector3(x, y + 0.5, z); let best = -1, bd = 1e9;
    vids.forEach((v, i) => { const inZone = (v.zone && v.zone.containsPoint(p)) || (v.zones && v.zones.some(q => q.containsPoint(p))); const d = screenPos(i).distanceTo(p) - (inZone ? 1000 : 0) - (v.box.scale.y * v.box.scale.z > 40 ? 8 : 0); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  // (29 Oct, Ben) the main screen's film has 2 s of black at the start: it starts (and loops back) at 2 s
  const SKIP = { bcp_teaser: 2 }, skipOf = u => { const v = vids.find(v => v.u === u), k = v && v.local ? Object.keys(SKIP).find(n => v.local.includes(n)) : null; return k ? SKIP[k] : 0; };
  video.addEventListener('loadedmetadata', () => { const s = skipOf(curUrl); if (s && video.currentTime < s) try { video.currentTime = s; } catch (e) {} });
  video.addEventListener('timeupdate', () => { const s = skipOf(curUrl); if (s && video.currentTime < s - 0.05 && !video.seeking) try { video.currentTime = s; } catch (e) {} });
  async function playUrl(url) {
    if (url === curUrl) return; curUrl = url;
    applyScreens(url);
    if (hls) { hls.destroy(); hls = null; }
    video.pause(); video.removeAttribute('src'); video.load();
    if (!url || vidFail.has(url)) return;
    const fail = () => { vidFail.add(url); if (curUrl === url) { curUrl = null; playUrl(url); } };
    // the gallery's own copy (in the site, 3D/gallery/video/) first; the original Vimeo stream if that fails
    const loc = (vids.find(v => v.u === url && v.local) || {}).local;
    if (loc && !localFail.has(url)) {
      video.onerror = () => { localFail.add(url); if (curUrl === url) { curUrl = null; if (/^https?:/.test(url)) playUrl(url); else fail(); } };
      video.src = (window.GMEDIA || (u => u))(loc); video.muted = !soundOK; video.play().catch(() => {}); return;
    }
    if (!/^https?:/.test(url)) return fail();
    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = url;
      else {
        if (!window.Hls) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/hls/hls.light.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
        if (!window.Hls.isSupported()) return fail();
        hls = new window.Hls({ capLevelToPlayerSize: true, maxBufferLength: 20 }); hls.on(window.Hls.Events.ERROR, (e, d) => { if (d.fatal) fail(); });
        hls.loadSource(url); hls.attachMedia(video);
      }
      video.onerror = fail;
      video.muted = !soundOK; await video.play().catch(() => {});
    } catch (e) { fail(); }
  }
  // Browsers only allow video WITH sound after the visitor has tapped once. The first tap (the Enter button, or any touch/key)
  // "blesses" our one shared video element by playing it with sound inside that tap; after that every zone autoplays with audio.
  const unlockSound = () => {
    if (soundOK) return; soundOK = true; video.muted = false;
    if (curUrl) { video.play().catch(() => {}); return; }
    const first = vids.find(v => v.local); if (!first) return;
    video.src = (window.GMEDIA || (u => u))(first.local); video.volume = 0;
    video.play().then(() => { if (!curUrl) { video.pause(); video.removeAttribute('src'); video.load(); } video.volume = 1; }).catch(() => { video.volume = 1; });
  };
  addEventListener('pointerdown', unlockSound, { once: false }); addEventListener('keydown', unlockSound);
  // (28 Oct, Ben: "the main gallery film isn't playing") when the browser won't let the film's sound play, Chrome doesn't refuse
  // it: the film just freezes on its first (black) frame. So if a film with sound hasn't moved for 1.5 s, it plays on muted
  // (the picture runs) and the next tap or key tries the sound again.
  { let lastT = -1, still = 0; setInterval(() => {
      if (!curUrl || video.paused || video.muted || video.readyState < 3 || window.HUSH) { lastT = -1; still = 0; return; }
      if (Math.abs(video.currentTime - lastT) < 0.01) { if ((still += 0.5) >= 1.5) { video.muted = true; soundOK = false; still = 0; video.play().catch(() => {}); } }
      else still = 0;
      lastT = video.currentTime; }, 500); }

  // ---------------------------------------------------------------- learning stations (tools, ally tips, spectrum, wall of why)
  const edu = data.edu.map(e => ({ ...e, pos: new THREE.Vector3(...e.p) }));

  // ---------------------------------------------------------------- the fox
  const grad = makeGradient();
  const cache = new Map();
  const toon = (c, extra) => { const key = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(key)) cache.set(key, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(key); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const FOX_SCALE = 0.62;   // kit foxes are ~2.7 units; the gallery is in metres
  let player = null, look = 'male', extra = 'none', guitarHold = null;
  // the player's merch: Blind Canvas Project logo on the black tee, "Walk Through Fear" on the back of the hoodie
  const printTex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; draw(c, w, h, () => { t.needsUpdate = true; }); return t; };
  // ---- the BCP tee: one artwork on the front (different per visitor), Ben's logo on the back
  const backLogo = printTex(640, 640, (c, w, h, up) => {
    const img = new Image(); img.onload = () => { c.clearRect(0, 0, w, h); const lw = 600, lh = lw * img.height / img.width; c.drawImage(img, (w - lw) / 2, (h - lh) / 2, lw, lh); up(); };
    img.src = RES('gallery/img/bcp_logo_white.webp');
  });
  const ART_KEYS = Object.keys(IMGURL).filter(k => /\/wix_/.test(k));
  const DEFAULT_ART = 'gallery/img/wix_walk_through_fear.webp';
  const artCache = new Map();
  const frontArt = key => {
    key = IMGURL[key] ? key : DEFAULT_ART;
    if (!artCache.has(key)) artCache.set(key, printTex(512, 512, (c, w, h, up) => { const img = new Image(); img.onload = () => { c.fillStyle = '#f3f2f2'; c.fillRect(0, 0, w, h); c.drawImage(img, 14, 14, w - 28, h - 28); up(); }; img.src = RES(key); }));
    return artCache.get(key);
  };
  // the all-over art tee: the picture across the front half, mirrored out to the sides so it meets itself seamlessly at the back
  const wrapCache = new Map();
  const wrapArt = key => {
    key = IMGURL[key] ? key : DEFAULT_ART;
    if (!wrapCache.has(key)) wrapCache.set(key, printTex(1024, 512, (c, w, h, up) => { const img = new Image(); img.onload = () => {
      c.save(); c.translate(w, 0); c.scale(-1, 1);   // the lathe runs the other way round: flip so the picture reads left to right from the front
      c.drawImage(img, 256, 0, 512, 512);
      c.save(); c.translate(256, 0); c.scale(-1, 1); c.drawImage(img, 0, 0, 512, 512); c.restore();          // mirrored to the left side
      c.save(); c.translate(1280, 0); c.scale(-1, 1); c.drawImage(img, 0, 0, 512, 512); c.restore();         // and to the right side
      c.restore(); up(); }; img.src = RES(key); }));
    return wrapCache.get(key);
  };
  // (27 Oct) the art tee's sleeves: the painting's left / right edge strip, stretched down the arm and mirrored so it meets itself round the back
  const sleeveCache = new Map();
  const sleeveArt = (key, side) => {
    key = IMGURL[key] ? key : DEFAULT_ART; const ck = key + '|' + side;
    if (!sleeveCache.has(ck)) sleeveCache.set(ck, printTex(256, 512, (c, w, h, up) => { const img = new Image(); img.onload = () => {
      const sw = img.width * 0.26, sx = side < 0 ? img.width * 0.06 : img.width * 0.68;   // (27 Oct) a strip just in from the edge: the very edge is often dark and read as a missing sleeve
      c.drawImage(img, sx, 0, sw, img.height, 0, 0, w / 2, h);
      c.save(); c.translate(w, 0); c.scale(-1, 1); c.drawImage(img, sx, 0, sw, img.height, 0, 0, w / 2, h); c.restore(); up(); }; img.src = RES(key); }));
    return sleeveCache.get(ck);
  };
  // fur palettes: 0 is Ben's fox (the first visitor in a room); the rest are shades of orange, red and white
  const PALETTES = [
    {},
    { fur: '#e2552c', furDark: '#a8331a', snout: '#f39a6a', muzzle: '#f8a983', tailBase: '#a8331a', tailMid: '#e8693c', paw: '#e2552c' },
    { fur: '#c7302a', furDark: '#7f1a16', snout: '#e8826b', muzzle: '#f09a84', tailBase: '#7f1a16', tailMid: '#d54a3a', paw: '#c7302a' },
    { fur: '#f59a3a', furDark: '#c86a1c', snout: '#fbc07e', muzzle: '#ffcf98', tailBase: '#c86a1c', tailMid: '#f8b060', paw: '#f59a3a' },
    { fur: '#f1ede7', furDark: '#c9c2b8', snout: '#ffffff', muzzle: '#ffffff', chin: '#ffffff', tailBase: '#d8d1c7', tailMid: '#efe9e1', paw: '#e8e2da', earInner: '#e79aa8' },
    { fur: '#f3b27c', furDark: '#d0773e', snout: '#fbd2a8', muzzle: '#ffe0bf', tailBase: '#d0773e', tailMid: '#f6c393', paw: '#f3b27c' },
    { fur: '#a4221d', furDark: '#62110e', snout: '#d8705e', muzzle: '#e48a78', tailBase: '#62110e', tailMid: '#bf3a30', paw: '#a4221d' },
    { fur: '#f6f2ee', furDark: '#d0473a', snout: '#ffffff', muzzle: '#ffffff', chin: '#ffffff', tailBase: '#d0473a', tailMid: '#f2ddd6', paw: '#d0473a', earInner: '#e07a8a' },
    { fur: '#e8743a', furDark: '#b24e22', snout: '#f6b48a', muzzle: '#fbc6a0', tailBase: '#b24e22', tailMid: '#ef9156', paw: '#e8743a' },
  ];
  // (29 Oct, Ben) hands always match the body fur
  const palOf = i => { const p = PALETTES[i | 0] || {}; return { ...p, paw: p.fur || PLAYER_MALE.fur }; };
  const randomStyle = (taken = []) => { const free = ART_KEYS.filter(k => k !== DEFAULT_ART && !taken.includes(k)), pool = free.length ? free : ART_KEYS.filter(k => k !== DEFAULT_ART);   // (28 Oct, Ben: an art no other fox here wears)
    return { pal: 1 + Math.floor(Math.random() * (PALETTES.length - 1)), art: pool[Math.floor(Math.random() * pool.length)] || DEFAULT_ART }; };
  let style = { pal: 0, art: DEFAULT_ART };
  // merge each fox's still parts per joint (about 57 draw calls down to ~15) so a room full of visitors stays light on phones
  // (12 Oct, phones) the fox's body, legs, arms and tail were ~25 separate draws (a mesh per colour per joint). Now each kind
  // of surface (toon fur/clothes, black outline, flat colours) is one skinned mesh: every part follows its joint as a bone, its
  // colour baked into the vertices. The head stays as it was (a camera head or face mask swaps its parts out).
  function skinFox(root, extraKeep) {
    if (new URLSearchParams(location.search).has('noskin')) return;   // (?noskin: the old way, to compare)
    const P = root.userData.P || {}, keep = new Set([root, ...(extraKeep || [])]);
    for (const v of Object.values(P)) { if (Array.isArray(v)) v.forEach(x => x && x.isObject3D && keep.add(x)); else if (v && v.isObject3D) keep.add(v); }
    root.updateMatrixWorld(true);
    const inHead = o => { for (let q = o; q; q = q.parent) if (q === P.head) return true; return false; };
    const shown = o => { for (let q = o; q && q !== root; q = q.parent) if (!q.visible) return false; return true; };
    const boneOf = o => { let q = o.parent; while (q && !keep.has(q)) q = q.parent; return q || root; };
    // two passes: the body (onto the fox), then the head's own parts (onto the head, so a camera head still hides them all)
    const run = (attach, headPart) => {
    const sets = new Map();
    attach.traverse(c => {
      if (!c.isMesh || c.isSkinnedMesh || c.isInstancedMesh || keep.has(c) || c.userData.keep || inHead(c) !== headPart || !shown(c)) return;
      const m = c.material, g = c.geometry; if (Array.isArray(m) || !g || !g.attributes.position || !g.attributes.position.count) return;
      if (m.map || m.transparent || m.alphaTest || !m.color || (m.emissive && m.emissive.getHex())) return;
      const key = m === outlineMat ? 'outline' : m.isMeshToonMaterial ? 'toon|' + (m.gradientMap ? m.gradientMap.uuid : '') + '|' + m.side : m.isMeshBasicMaterial ? 'basic|' + m.side : null;
      if (!key) return; if (!sets.has(key)) sets.set(key, { mat: m, list: [] }); sets.get(key).list.push(c);
    });
    const bones = [], bi = new Map(), inv = new THREE.Matrix4().copy(attach.matrixWorld).invert(), m4 = new THREE.Matrix4(), meshes = [], gone = new Set();
    for (const [key, { mat, list }] of sets) {
      if (list.length < 2) continue;
      const pos = [], nor = [], col = [], idx = [], wt = [];
      for (const c of list) {
        const b = boneOf(c); if (!bi.has(b)) { bi.set(b, bones.length); bones.push(b); } const k = bi.get(b);
        const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); g.applyMatrix4(m4.multiplyMatrices(inv, c.matrixWorld));
        const pa = g.attributes.position, na = g.attributes.normal, ca = c.material.vertexColors ? g.attributes.color : null, n = pa.count, cl = c.material.color, flip = m4.determinant() < 0;   // (a mirrored part: turn its triangles round, or they face inwards)
        for (let t = 0; t < n; t++) { const i = flip ? (t % 3 === 1 ? t + 1 : t % 3 === 2 ? t - 1 : t) : t; pos.push(pa.getX(i), pa.getY(i), pa.getZ(i)); if (na) nor.push(na.getX(i), na.getY(i), na.getZ(i)); else nor.push(0, 1, 0); if (ca) col.push(cl.r * ca.getX(i), cl.g * ca.getY(i), cl.b * ca.getZ(i)); else col.push(cl.r, cl.g, cl.b); idx.push(k, 0, 0, 0); wt.push(1, 0, 0, 0); }
        g.dispose();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(idx, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(wt, 4));
      let mat2 = mat; if (key !== 'outline') { geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); mat2 = mat.clone(); mat2.color.setRGB(1, 1, 1); mat2.vertexColors = true; }
      const sm = new THREE.SkinnedMesh(geo, mat2); sm.frustumCulled = false; sm.castShadow = key !== 'outline'; sm.userData.noCull = true; meshes.push(sm);
      for (const c of list) gone.add(c);
    }
    // take them out, but anything that hung from one of them (a part that wasn't merged) stays, moved up to its parent
    for (const c of gone) { for (const ch of [...c.children]) if (!gone.has(ch)) c.parent.attach(ch); }
    for (const c of gone) c.parent && c.parent.remove(c);
    if (!meshes.length) return;
    const skel = new THREE.Skeleton(bones);
    for (const sm of meshes) { attach.add(sm); sm.updateMatrixWorld(true); sm.bind(skel, sm.matrixWorld); }
    };
    run(root, false);
    if (P.head) run(P.head, true);
  }
  function bakeLocal(root, extraKeep) {   // per animated joint: merge every still mesh beneath it (any depth) by material; outlines into one
    const P = root.userData.P || {}, keep = new Set([root, ...(extraKeep || [])]);
    for (const v of Object.values(P)) { if (Array.isArray(v)) v.forEach(x => x && x.isObject3D && keep.add(x)); else if (v && v.isObject3D) keep.add(v); }
    root.updateMatrixWorld(true);
    const EMPTY = new THREE.BufferGeometry(), inv = new THREE.Matrix4(), m = new THREE.Matrix4();
    const ok = o => o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !Array.isArray(o.material) && !o.material.map && !o.material.transparent && !o.userData.keep && !keep.has(o);
    for (const A of keep) {
      inv.copy(A.matrixWorld).invert(); const groups = new Map(), outl = [];
      const visit = o => { for (const c of o.children) { if (keep.has(c)) continue; if (c.isMesh && (c.material === outlineMat || c.material === outlineMat)) { if (c.geometry !== EMPTY) outl.push(c); } else if (ok(c)) { const k = c.material.uuid; if (!groups.has(k)) groups.set(k, { mat: c.material, list: [] }); groups.get(k).list.push(c); } visit(c); } };
      visit(A);
      const merge = list => { const pos = [], nor = []; for (const c of list) { const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); m.multiplyMatrices(inv, c.matrixWorld); g.applyMatrix4(m); pos.push(...g.attributes.position.array); if (g.attributes.normal) nor.push(...g.attributes.normal.array); } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (nor.length === pos.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); else out.computeVertexNormals(); out.computeBoundingSphere(); return out; };
      for (const { mat, list } of groups.values()) { if (list.length < 2) continue; const mm = new THREE.Mesh(merge(list), mat); mm.castShadow = true; A.add(mm); list.forEach(c => { c.geometry = EMPTY; c.castShadow = false; }); }
      const ol = outl.filter(c => c.parent && c.parent.geometry === EMPTY || true); if (ol.length > 1) { A.add(new THREE.Mesh(merge(ol), outlineMat)); ol.forEach(c => c.geometry = EMPTY); }
    }
    // drop the emptied meshes that carry nothing alive beneath them
    const dead = []; root.traverse(o => { if (o.isMesh && o.geometry === EMPTY && !o.children.some(c => !(c.isMesh && c.geometry === EMPTY))) dead.push(o); });
    for (const o of dead.reverse()) if (o.parent && !o.children.length) o.parent.remove(o);
    return root;
  }

  // the museum avatars: the suited fox with a long white cane, or in a wheelchair (tuned rigs from the 8 GATES workshops).
  // The suit is open over an art shirt: Walk Through Fear on the front, the BCP logo across the back (and on the chair's backrest).
  const AVB = new URL('./avatars/', import.meta.url).href;
  const [caneCfg, chairCfg] = await Promise.all([loadCane(AVB).catch(() => CANE_DEFAULTS), loadChair(AVB).catch(() => CHAIR_DEFAULTS)]);
  const CK = caneKit({ THREE, M, toon }), HK = chairKit({ THREE, M, toon });
  const SUIT_BACK_ART = 'gallery/img/wix_curating_hope.webp';   // the art across the suit's back (the chair keeps the BCP logo on its backrest)
  const SUIT = { torso: ['#2a2e34', '#1a1d22', '#0c0e10'], outfit: 'suit', glasses: 'sun', crest: 'none', eyes: ['#3a3a44', '#3a3a44'], mood: 'happy' };
  function makeSuitFox(ex, st, wrap = false) {   // wrap: the all-over art tee instead of the suit (same tuned cane / chair rigs)
    const chair = ex === 'chair';
    const f = makeFox({ key: 'suit-' + ex, ...SUIT, chair, look: { ...PLAYER_MALE, ...palOf(st.pal), tailSide: chair ? 1.75 : 1.15, tailLift: chair ? 0.6 : PLAYER_MALE.tailLift }, prints: wrap ? { wrap: wrapArt(st.art), sleeves: [sleeveArt(st.art, -1), sleeveArt(st.art, 1)], short: wrap === 'short', tee: '#141414' } : { front: frontArt(st.art || DEFAULT_ART), frontW: 1.2, back: chair ? frontArt(SUIT_BACK_ART) : backLogo }, ...(wrap ? { outfit: 'tee', torso: ['#141414', '#141414', '#0c0c0c'], glasses: ex === 'glasses' || ex === 'cane' ? 'sun' : null } : {}) });   // cane: the BCP logo across his back; chair: art on the back (the backrest carries the logo)
    if (chair && f.userData.P && f.userData.P.tail) { const t = f.userData.P.tail; t.position.x = 0.48; t.position.z = 0.05; t.position.y += 0.06; }   // in the chair the tail comes out at his side, over the wheel, not through the backrest
    if (ex === 'chair') f.userData.rig = HK.attach(f, { ...chairCfg, backLogo });
    else if (ex === 'cane') f.userData.rig = CK.attach(f, caneCfg);
    // merge the still parts (about 90 draw calls -> ~30): run the rig for a few test frames, keep every part it moves
    // (and every group, since rigs pose groups) as its own joint, and bake the rest beneath them
    try {
      const keep = new Set(), snap = new Map();
      f.traverse(o => { if (!o.isMesh) keep.add(o); o.updateMatrix(); snap.set(o, o.matrix.clone()); });
      for (const [dt, sp] of [[0.12, 0], [0.16, 1.4], [0.21, 2.6], [0.11, 0.8], [0.27, 3.5], [0.4, 0]]) animFox(f, dt, sp, false);
      f.traverse(o => { o.updateMatrix(); if (!o.matrix.equals(snap.get(o))) keep.add(o); });
      bakeLocal(f, keep); skinFox(f, keep);
    } catch (e) { console.warn('suit bake skipped', e); }
    f.scale.setScalar(FOX_SCALE); return f;
  }
  function makeVisitorFox(lk, ex, st = { pal: 0, art: DEFAULT_ART }) {   // every visitor wears the BCP tee
    if (lk === 'wraptee') { try { return makeSuitFox(ex, st, 'short'); } catch (e) { console.warn('art tee avatar failed, using the BCP tee', e); } }   // (27 Oct) short sleeves
    if (lk === 'wrap') { try { return makeSuitFox(ex, st, true); } catch (e) { console.warn('wrap tee avatar failed, using the BCP tee', e); } }
    if (lk === 'suit') { try { return makeSuitFox(ex, st); } catch (e) { console.warn('suit avatar failed, using the BCP tee', e); } }
    const opts = { torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'warm', look: { ...(lk === 'female' ? PLAYER_FEMALE : PLAYER_MALE), ...palOf(st.pal), tailSide: 1.15 },   // tail swept to the side so the back print shows
      outfit: 'tee', prints: { front: frontArt(st.art), frontW: 1.45, back: backLogo }, gear: 'none', cane: ex === 'cane', glasses: ex === 'glasses' || ex === 'cane', chair: ex === 'chair' };
    let f;
    try { f = makeFox(opts); if (!f.userData.P || !f.userData.P.arms) throw new Error('no tee outfit'); }
    catch (e) { console.warn('fox-kit has no BCP tee (an older fox-kit.js?), using a plain outfit', e); f = makeFox({ ...opts, outfit: 'vest', prints: null, look: { ...opts.look, tailSide: 0 } }); }   // never let the fox stop the gallery loading
    bakeLocal(f); skinFox(f); f.scale.setScalar(FOX_SCALE); return f;
  }
  function buildPlayer() {
    const pos = player ? player.position.clone() : null;
    if (player) scene.remove(player);
    const old = player; player = makeVisitorFox(look, extra, style); if (pos) player.position.copy(pos);
    scene.add(player); if (guitarHold && old && guitarHold.parent === old) player.add(guitarHold);   // (changed outfit mid-song: keep the guitar)
  }
  // ---------------------------------------------------------------- cinema staff (22 Oct): a fox selling tickets in the booth out front and one
  // working the snack bar in the lobby, in red usher vests with gold trim; they stand at their posts and look about
  const staff = [];
  if (campus && campus.cinema.staff) for (const s of campus.cinema.staff) {
    try {
      const f = makeFox({ torso: ['#a3222c', '#7a1820', '#c9a14a'], crest: '8', mood: 'warm', look: { ...(s.role === 'tickets' ? PLAYER_FEMALE : PLAYER_MALE), tailSide: 0.6 }, outfit: 'vest', prints: null, gear: 'none' });
      bakeLocal(f); skinFox(f); f.scale.setScalar(FOX_SCALE); f.position.set(s.x, s.role === 'tickets' ? 0.4 : 0.3, s.z);   // (on a step behind the counter, so you see more than a head)
      f.rotation.y = s.face; if (s.role === 'snacks' && campus.cinema.snack && campus.cinema.snack.root) (campus.cinema.snack.frame || campus.cinema.snack.root).add(f);   // (in the snack bar's frame, but not its inside-only group: seen from the door) else scene.add(f);   // (the snack bar fox lives in the snack bar's own frame: it was turned to face the door)
      staff.push({ f, s, t: Math.random() * 10 });
    } catch (e) { console.warn('cinema staff fox', e); }
  }
  // (cinema polish s3) two audience foxes already in their seats, watching the screen
  if (campus && campus.cinema.audience) for (const a of campus.cinema.audience) {
    try {
      const f = makeFox({ torso: [['#2e5fd8', '#1d3f99', '#f6c443'], ['#2ea44f', '#1d6b34', '#f4f2ee']][a.n % 2], crest: '8', mood: 'warm', look: { ...(a.n % 2 ? PLAYER_FEMALE : PLAYER_MALE), tailSide: 0.6 }, outfit: 'coat', prints: null, gear: 'none' });
      bakeLocal(f); skinFox(f); f.scale.setScalar(FOX_SCALE); f.userData.sit = true; f.rotation.y = Math.PI / 2; scene.add(f);
      const P = f.userData.P; let hip = 0.5; if (P && P.legs && P.legs[0]) { f.position.set(0, 0, 0); f.updateMatrixWorld(true); const v = new THREE.Vector3(); P.legs[0].getWorldPosition(v); hip = v.y; }
      f.position.set(a.x + 0.06, a.top - hip + 0.03, a.z);
      staff.push({ f, s: { x: a.x, z: a.z, face: Math.PI / 2, role: 'audience' }, t: Math.random() * 10 });
    } catch (e) { console.warn('cinema audience fox', e); }
  }
  // the snack bar fox's job (22 Oct): scoop a box of popcorn at the machine and set it out on the counter, then fill a drink at the
  // soda fountain and set that out, over and over. The counter holds seven; when it's full the oldest one is cleared away first.
  const snackJob = (() => {
    const K = campus && campus.cinema.snack; if (!K) return null;
    const carry = new THREE.Group(); carry.scale.setScalar(1 / FOX_SCALE);   // (in the fox's own frame, in metres: held in front of its chest)
    const W = { lane: K.SB.z + 1.05, popX: K.PM.x, sodaX: K.SF.x - 0.75 };
    const plan = []; let step = null, item = null, kindNext = 'box', order = 0;
    const go = (x, z, face, then) => plan.push({ t: 'walk', x, z, face, then });
    const freeSlot = () => { let s = K.slots.find(s => !s.item); if (!s) { s = K.slots.reduce((a, b) => (a.item.userData.at || 0) < (b.item.userData.at || 0) ? a : b); K.root.remove(s.item); s.item = null; } return s; };
    const queue = () => { const kind = kindNext; kindNext = kind === 'box' ? 'cup' : 'box'; const slot = freeSlot();
      if (kind === 'box') { go(W.popX, W.lane, 0); plan.push({ t: 'work', dur: 1.8, kind }); }
      else { go(W.sodaX, K.SF.z, Math.PI / 2); plan.push({ t: 'work', dur: 2.6, kind }); }
      go(slot.x, W.lane, Math.PI); plan.push({ t: 'place', dur: 0.9, slot }); plan.push({ t: 'wait', dur: 1.2 + Math.random() }); };
    return (st, dt) => {
      const f = st.f; if (!carry.parent) f.add(carry);
      if (!step) { if (!plan.length) queue(); step = plan.shift(); step.e = 0; }
      step.e += dt; let speed = 0, reach = 0;
      if (step.t === 'walk') {
        const dx = step.x - f.position.x, dz = step.z - f.position.z, d = Math.hypot(dx, dz), v = 1.1 * dt;
        if (d > 0.03) { const want = Math.atan2(dx, dz); let a = want - f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); f.rotation.y += a * Math.min(1, dt * 8); f.position.x += dx / d * Math.min(v, d); f.position.z += dz / d * Math.min(v, d); speed = 1.1 / FOX_SCALE * 0.6; }
        else { let a = step.face - f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); f.rotation.y += a * Math.min(1, dt * 8); if (Math.abs(a) < 0.05) step = null; }
      } else if (step.t === 'work') {
        reach = 1;
        if (!item) { item = step.kind === 'box' ? K.makeBox() : K.makeCup(); item.position.set(0, 0.62, 0.36); carry.add(item); if (step.kind === 'cup') { item.userData.soda.scale.y = 0.02; item.userData.lid.visible = item.userData.straw.visible = false; } }
        if (step.kind === 'box') { const k = Math.min(1, step.e / step.dur); item.children.forEach((c, i) => { if (i > 1) c.visible = i - 2 < k * 14; }); }   // scooping: the box fills up
        else { const k = Math.min(1, Math.max(0, (step.e - 0.4) / (step.dur - 0.9))); item.userData.soda.scale.y = Math.max(0.02, k); item.userData.soda.position.y = 0.1 * Math.max(0.02, k) + 0.005; K.stream.visible = k > 0 && k < 1; if (k >= 1) item.userData.lid.visible = item.userData.straw.visible = true; }
        if (step.e >= step.dur) { K.stream.visible = false; step = null; }
      } else if (step.t === 'place') {
        reach = 1;
        if (step.e >= step.dur && item) { carry.remove(item); item.position.set(step.slot.x, K.counterY, K.counterZ); item.rotation.set(0, 0, 0); item.userData.at = ++order; K.root.add(item); step.slot.item = item; item = null; step = null; }
      } else if (step.e >= step.dur) step = null;
      animFox(f, dt, speed, false);
      // arms: forward to the machine, out over the counter, or holding what it carries in front
      const P = f.userData.P; if (P && P.arms) { const want = reach ? -1.25 : item ? -0.7 : null; if (want != null) for (const a of P.arms) { a.rotation.x = want; } }
    };
  })();
  // the walk-on floor piano (22 Oct): whoever stands on a key plays it, you and every other visitor (from where their fox stands,
  // so it needs no messages of its own); keys go down and light up; others' notes are softer the further you are from it
  const FP = campus && campus.floorPiano, fpSound = FP ? floorPianoSound() : null; let fpOn = new Map();
  function floorPianoTick() {
    const dMe = Math.hypot(Pl.x - FP.x, Pl.z - FP.z), heard = Math.abs(Pl.y - FP.y) < 4 ? Math.max(0, 1 - dMe / 40) ** 2 : 0;
    const now = new Map(), feet = [['me', Pl.x, Pl.y, Pl.z]]; for (const [id, r] of remotes) if (r.placed) feet.push([id, r.x, r.y, r.z]);
    for (const [id, x, y, z] of feet) { if (Math.abs(y - FP.y) > 0.5) continue; const k = FP.keyAt(x, z, fpOn.get(id)); if (k) now.set(id, k); }   // (a jump lifts you off the key)
    const held = new Set(now.values());
    for (const [id, k] of fpOn) if (now.get(id) !== k) { fpSound.off(id); if (!held.has(k)) FP.press(k, false); }
    for (const [id, k] of now) if (fpOn.get(id) !== k) { FP.press(k, true); fpSound.on(id, k.m, id === 'me' ? 1 : heard); }
    fpOn = now;
  }
  // ---------------------------------------------------------------- other visitors (multiplayer)
  const remotes = new Map();
  const tagSprite = (text, bg = 'rgba(20,19,18,.88)', fg = '#ffffff', w = 512) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = 112; const c = cv.getContext('2d');
    c.font = '800 54px Archivo, Arial, sans-serif'; const tw = Math.min(w - 20, c.measureText(text).width + 48);
    c.fillStyle = bg; c.fillRect((w - tw) / 2, 8, tw, 96); c.fillStyle = '#ec3013'; c.fillRect((w - tw) / 2, 8, 8, 96);
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2 + 4, 58, w - 40);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true })); sp.scale.set(1.6 * w / 512, 0.35, 1); sp.renderOrder = 5; return sp;
  };
  const bubbleTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 60, 52, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#141312'; c.lineWidth = 6; c.stroke(); c.font = '64px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('👋', 64, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function showWave(fox) {
    fox.userData.hop = 1;
    const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex, transparent: true })); b.scale.setScalar(0.55); b.userData.t = 2.4; b.userData.fox = fox; scene.add(b); waves.push(b);
  }
  const waves = [];
  function remoteUpsert(id, st, prof) {
    let r = remotes.get(id);
    if (!r) { r = { id, prof: { name: 'Visitor', look: 'male', extra: 'none' }, fox: null, tag: null, x: 0, y: 0, z: 0, face: 0, tx: 0, ty: 0, tz: 0, tface: 0, speed: 0, air: false, last: performance.now(), placed: false }; remotes.set(id, r); }
    if (prof) {
      const changed = !r.fox || prof.look !== r.prof.look || prof.extra !== r.prof.extra || prof.pal !== r.prof.pal || prof.art !== r.prof.art;
      const renamed = prof.name !== r.prof.name;
      r.prof = { ...r.prof, ...prof };
      if (changed) { if (r.fox) scene.remove(r.fox); r.fox = makeVisitorFox(r.prof.look, r.prof.extra, { pal: r.prof.pal | 0, art: r.prof.art }); r.fox.visible = r.placed; scene.add(r.fox); }
      if (renamed || !r.tag) { if (r.tag) { scene.remove(r.tag); r.tag.material.map.dispose(); } r.tag = tagSprite(r.prof.name || 'Visitor'); r.tag.visible = r.placed; scene.add(r.tag); }
    }
    if (st) {
      [r.tx, r.ty, r.tz, r.tface, r.speed] = st; r.air = !!st[5]; r.sit = !!st[6]; r.last = performance.now();   // (st[6]: sitting on a bench or a cinema seat)
      if (!r.placed || Math.hypot(r.tx - r.x, r.tz - r.z) > 8 || Math.abs(r.ty - r.y) > 4) { r.x = r.tx; r.y = r.ty; r.z = r.tz; r.face = r.tface; }
      r.placed = true;
    }
    if (!r.fox) { r.fox = makeVisitorFox(r.prof.look, r.prof.extra, { pal: r.prof.pal | 0, art: r.prof.art }); scene.add(r.fox); }
    if (!r.tag) { r.tag = tagSprite(r.prof.name || 'Visitor'); scene.add(r.tag); }
    return r;
  }
  // ---- camera heads: a visitor's own camera worn on their fox, as a little TV screen for a head, or as a face mask
  const camHeads = new Map();   // 'me' | peer id -> { mode: 'screen' | 'mask', el, tex }
  const camInk = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), camRed = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const camOval = (() => {   // the mask's shape: a soft-edged oval (alpha)
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d');
    const g = c.createRadialGradient(64, 64, 40, 64, 64, 63); g.addColorStop(0, '#fff'); g.addColorStop(0.75, '#fff'); g.addColorStop(1, '#000');
    c.fillStyle = '#000'; c.fillRect(0, 0, 128, 128); c.save(); c.translate(64, 64); c.scale(1, 1.0); c.translate(-64, -64); c.fillStyle = g; c.beginPath(); c.arc(64, 64, 63, 0, Math.PI * 2); c.fill(); c.restore();
    return new THREE.CanvasTexture(cv);
  })();
  function setCam(key, mode, stream) {
    const old = camHeads.get(key); if (old) { old.tex.dispose(); old.el.pause(); old.el.srcObject = null; camHeads.delete(key); }
    if (!mode || !stream) return;
    const el = document.createElement('video'); el.muted = true; el.playsInline = true; el.setAttribute('playsinline', ''); el.autoplay = true; el.srcObject = stream;
    const p = el.play(); if (p && p.catch) p.catch(() => {});
    const tex = new THREE.VideoTexture(el); tex.colorSpace = THREE.SRGBColorSpace;
    camHeads.set(key, { mode, el, tex });
  }
  addEventListener('pointerdown', () => { for (const e of camHeads.values()) if (e.el.paused) e.el.play().catch(() => {}); }, { passive: true });
  function wearCam(fox, e) {
    if (!fox || fox.userData.camE === e) return;
    const P = fox.userData.P || {}, head = P.head; if (!head) return;
    const old = fox.userData.camObj;
    if (old) { head.remove(old); old.traverse(o => { if (o.isMesh) { o.geometry.dispose(); if (o.material !== camInk && o.material !== camRed) o.material.dispose(); } }); }
    for (const o of fox.userData.camHidden || []) o.visible = true;
    fox.userData.camObj = null; fox.userData.camHidden = null; fox.userData.camE = e;
    if (!e) return;
    const g = new THREE.Group(), hide = [];
    if (e.mode === 'screen') {   // a little TV for a head: ink bezel, the camera picture, the red rule on top
      for (const c of head.children) if (c.visible) hide.push(c);
      const bz = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.22), camInk); g.add(bz);
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.66), new THREE.MeshBasicMaterial({ map: e.tex, toneMapped: false })); sc.position.z = 0.112; g.add(sc);
      const rule = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.035, 0.225), camRed); rule.position.y = 0.4; g.add(rule);
      for (const sx of [-1, 1]) { const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), camInk); ant.position.set(sx * 0.16, 0.52, -0.02); ant.rotation.z = -sx * 0.45; g.add(ant); }
      g.position.set(0, 0.06, 0.02);
    } else {                     // the face mask: your face, cut to a soft oval, worn where the fox's face was
      for (const o of P.faceParts || []) if (o.visible) hide.push(o);
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 20, Math.PI / 2 - 0.8, 1.6, Math.PI / 2 - 0.88, 1.66), new THREE.MeshBasicMaterial({ map: e.tex, alphaMap: camOval, transparent: true, alphaTest: 0.03, toneMapped: false }));
      g.add(m); g.position.set(0, -0.04, 0.0);
    }
    hide.forEach(o => { o.visible = false; }); head.add(g); fox.userData.camObj = g; fox.userData.camHidden = hide;
  }
  function remoteRemove(id) { setCam(id, null); const r = remotes.get(id); if (!r) return; if (campus && campus.band.guitar && campus.band.guitar.heldBy === id) { const Gt = campus.band.guitar; Gt.rest.parent.add(Gt.group); Gt.group.position.copy(Gt.rest.pos); Gt.group.rotation.copy(Gt.rest.rot); Gt.heldBy = null; } if (r.fox) scene.remove(r.fox); if (r.tag) scene.remove(r.tag); remotes.delete(id); }
  function updateRemotes(dt) {
    const now = performance.now();
    for (const r of remotes.values()) {
      if (now - r.last > 25000) { remoteRemove(r.id); continue; }
      r.x = damp(r.x, r.tx, 10, dt); r.y = damp(r.y, r.ty, 12, dt); r.z = damp(r.z, r.tz, 10, dt);
      let d = r.tface - r.face; d = Math.atan2(Math.sin(d), Math.cos(d)); r.face += d * Math.min(1, dt * 10);
      const far = Math.hypot(r.x - Pl.x, r.z - Pl.z) > 90 || Math.abs(r.y - Pl.y) > 60;
      r.fox.visible = r.placed && !far; r.tag.visible = r.placed && !far;
      if (!r.fox.visible) continue;
      r.fox.position.set(r.x, r.y + (r.prof.extra === 'chair' ? 0 : 0.02), r.z); r.fox.rotation.y = r.face;
      if (r.fox.userData.hop > 0) r.fox.userData.hop = r.fox.userData.hop;
      wearCam(r.fox, camHeads.get(r.id));
      r.fox.userData.sit = !!r.sit && r.prof.extra !== 'chair';   // friends sitting together: the same seated pose you see on your own fox
      animFox(r.fox, dt, r.sit ? 0 : (r.speed || 0) / FOX_SCALE * 0.6, r.air && !r.sit);
      r.tag.position.set(r.x, r.y + 2.15, r.z);
    }
    for (let i = waves.length - 1; i >= 0; i--) { const b = waves[i]; b.userData.t -= dt; const f = b.userData.fox; b.position.set(f.position.x, f.position.y + 2.6 + (2.4 - b.userData.t) * 0.15, f.position.z); b.material.opacity = Math.min(1, b.userData.t * 2); if (b.userData.t <= 0) { scene.remove(b); waves.splice(i, 1); } }
  }
  buildPlayer();

  let G_pupil = null;
  const Pl = { x: SPAWN.x, y: SPAWN.y, z: SPAWN.z, vy: 0, vx: 0, vz: 0, lean: 0, face: SPAWN.face, ground: false, speed: 0 };
  // (29 Oct, Ben) the view tilts up to the walls: less floor, more art. A lower camera angle, and the camera aims a little above
  // the fox's head. Computers more, phones just slightly (was pitch 0.28, aimed at the head).
  const PHONE_CAM = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window || new URLSearchParams(location.search).has('phonepreview');
  const REST_PITCH = PHONE_CAM ? 0.24 : 0.17, AIM_UP = PHONE_CAM ? 0.15 : 0.45;
  const St = { yaw: SPAWN.face + Math.PI, pitch: REST_PITCH, dist: 4.2, camDist: 4.2 };
  // if the phone's graphics reset (WebGL context lost), reload and put the visitor back where they were
  {
    try { const r = JSON.parse(sessionStorage.getItem('8gates.gallery.resume') || 'null'); sessionStorage.removeItem('8gates.gallery.resume');
      if (r && Date.now() - r.t < 120000) { Pl.x = r.p[0]; Pl.y = r.p[1]; Pl.z = r.p[2]; Pl.face = r.p[3]; St.yaw = r.p[3] + Math.PI; } } catch (e) {}
    renderer.domElement.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      try { sessionStorage.setItem('8gates.gallery.resume', JSON.stringify({ t: Date.now(), p: [Pl.x, Pl.y + 0.3, Pl.z, Pl.face] })); } catch (err) {}
      const m = document.createElement('div'); m.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:#0b0a12;color:#f3f2f2;font:800 18px Archivo,Arimo,sans-serif;text-align:center;padding:24px';
      m.textContent = 'The graphics needed a quick reset. Bringing you back to where you were…'; document.body.appendChild(m);
      setTimeout(() => location.reload(), 1200);
    }, false);
    // and if the browser itself gives up and reloads the tab (phones do this when memory runs out), the last spot is kept too
    setInterval(() => { if (Pl.ground) try { sessionStorage.setItem('8gates.gallery.resume', JSON.stringify({ t: Date.now(), p: [Pl.x, Pl.y + 0.3, Pl.z, Pl.face] })); } catch (err) {} }, 3000);
  }
  const input = { f: 0, b: 0, l: 0, r: 0, run: 0, jx: 0, jy: 0, jump: 0 };

  function groundAt(x, y, z) { const h = cast(x, y + 0.55, z, 0, -1, 0, 30); return h ? h.point.y : -1e9; }
  { const gy = groundAt(Pl.x, 1.5, Pl.z); if (gy > -100) Pl.y = gy; }

  const tmp = new THREE.Vector3();
  // ---------------------------------------------------------------- follow a friend (tours): walk the breadcrumb trail of their positions
  const F = { id: null, crumbs: [], best: 1e9, stuckT: 0, onEnd: null };
  const nearProviders = [Pl => lift.near(Pl)], tickers = [];
  if (campus) nearProviders.push(...campus.near);
  function placeNear(r, slot) {
    // behind them, or (slot n, when the host gathers everyone) round them in a ring; the first clear spot with floor wins
    const tries = slot == null ? [[r.tface + Math.PI, 1.6]] : [0, 1, 2, 3, 4, 5].map(k => [r.tface + 0.9 + (slot + k) * 2.39996, 2.2 + ((slot + k) % 3) * 0.7]);
    tries.push([r.tface + Math.PI, 1.2]);
    let bx = r.tx + 0.3, bz = r.tz + 0.3;
    for (const [a, rad] of tries) { const x = r.tx + Math.sin(a) * rad, z = r.tz + Math.cos(a) * rad; if (!cast(r.tx, r.ty + 0.9, r.tz, Math.sin(a), 0, Math.cos(a), rad + 0.4) && groundAt(x, r.ty + 1, z) > r.ty - 0.6) { bx = x; bz = z; break; } }
    Pl.x = bx; Pl.z = bz; Pl.y = r.ty + 0.05; Pl.vy = 0; Pl.vx = Pl.vz = 0; Pl.face = slot == null ? r.tface : Math.atan2(r.tx - bx, r.tz - bz); St.yaw = Pl.face + Math.PI; St.camDist = 1; streamT = 0;
    fadeEl.style.opacity = 1; setTimeout(() => fadeEl.style.opacity = 0, 160);
  }
  function followStart(id, onEnd) { const r = remotes.get(id); if (!r || !r.placed) return false; if (F.id) followStop('switch'); F.id = id; F.crumbs = []; F.best = 1e9; F.stuckT = 0; F.onEnd = onEnd || null; if (Math.hypot(r.tx - Pl.x, r.tz - Pl.z) > 25 || Math.abs(r.ty - Pl.y) > 3) placeNear(r); return true; }
  function followStop(why) { if (!F.id) return; const cb = F.onEnd; F.id = null; F.crumbs = []; F.onEnd = null; if (cb) cb(why); }
  function followRecord() {
    const r = remotes.get(F.id); if (!r) { followStop('left'); return; }
    const L = F.crumbs[F.crumbs.length - 1];
    if (!L || Math.hypot(r.tx - L[0], r.tz - L[2]) > 0.7 || Math.abs(r.ty - L[1]) > 0.8) { if (L && Math.hypot(r.tx - L[0], r.tz - L[2]) > 10) F.crumbs = []; F.crumbs.push([r.tx, r.ty, r.tz]); if (F.crumbs.length > 400) F.crumbs.shift(); }
  }
  function followAuto(dt) {
    const r = remotes.get(F.id); if (!r) { followStop('left'); return null; }
    const dl = Math.hypot(r.tx - Pl.x, r.tz - Pl.z);
    if (dl > 30 || (dl > 4 && !F.crumbs.length)) { placeNear(r); F.crumbs = []; return null; }   // they went through a door, or we fell far behind
    if (dl < 2.2 && Math.abs(r.ty - Pl.y) < 1.5) { F.crumbs = []; F.best = 1e9; F.stuckT = 0; return null; }  // close enough: wait beside them
    while (F.crumbs.length && Math.hypot(F.crumbs[0][0] - Pl.x, F.crumbs[0][2] - Pl.z) < 0.6) { F.crumbs.shift(); F.best = 1e9; F.stuckT = 0; }
    const c = F.crumbs[0] || [r.tx, r.ty, r.tz], d = Math.hypot(c[0] - Pl.x, c[2] - Pl.z) || 1;
    if (d < F.best - 0.15) { F.best = d; F.stuckT = 0; }
    else if ((F.stuckT += dt) > 2) { Pl.x = c[0]; Pl.y = c[1] + 0.05; Pl.z = c[2]; Pl.vy = 0; F.crumbs.shift(); F.best = 1e9; F.stuckT = 0; return null; }   // stuck on something: hop to the trail
    return { ux: (c[0] - Pl.x) / d, uz: (c[2] - Pl.z) / d, run: dl > 5 };
  }

  // ---------------------------------------------------------------- walk me there (the signpost): follow a path to a door; moving yourself stops it
  const AW = { pts: null, i: 0, to: null, best: 1e9, stuckT: 0, onEnd: null };
  function walkTo(to, onEnd) {
    const D = SIGN_DEST.find(d => d.to === to); if (!D) return false; if (Pl.sit) standUp(); if (F.id) followStop('walk');
    // start at the first point ahead of us (skip ones behind, so it doesn't double back)
    let i0 = 0, bd = 1e9; D.route.forEach((p, i) => { const d = Math.hypot(p[0] - Pl.x, p[1] - Pl.z); if (d < bd) { bd = d; i0 = i; } });
    if (i0 < D.route.length - 1) { const a = D.route[i0], b = D.route[i0 + 1]; if ((b[0] - a[0]) * (Pl.x - a[0]) + (b[1] - a[1]) * (Pl.z - a[1]) > 0) i0++; }
    Object.assign(AW, { pts: D.route, i: i0, to, best: 1e9, stuckT: 0, onEnd: onEnd || null }); return true;
  }
  function walkStop(why) { if (!AW.pts) return; const cb = AW.onEnd, to = AW.to; AW.pts = null; AW.onEnd = null; if (cb) cb(why, to); }
  function walkAuto(dt) {
    let c = AW.pts[AW.i]; let d = Math.hypot(c[0] - Pl.x, c[1] - Pl.z);
    if (d < (AW.i === AW.pts.length - 1 ? 0.45 : 1.1)) {
      AW.i++; AW.best = 1e9; AW.stuckT = 0;
      if (AW.i >= AW.pts.length) { const t = CAMPUS_STOPS[AW.to]; if (t) { Pl.face = t.face; St.yaw = t.face + Math.PI; } walkStop('arrived'); return null; }
      c = AW.pts[AW.i]; d = Math.hypot(c[0] - Pl.x, c[1] - Pl.z);
    }
    if (d < AW.best - 0.15) { AW.best = d; AW.stuckT = 0; }
    else if ((AW.stuckT += dt) > 2.5) { Pl.x = c[0]; Pl.z = c[1]; Pl.y = groundAt(c[0], Pl.y + 2, c[1]); Pl.vy = 0; AW.best = 1e9; AW.stuckT = 0; return null; }   // stuck on something: hop on
    return { ux: (c[0] - Pl.x) / d, uz: (c[1] - Pl.z) / d };
  }

  const BODY_R = +(new URLSearchParams(location.search).get("body")) || 0.42, PUSH_DIRS = Array.from({ length: 12 }, (_, a) => [Math.sin(a * Math.PI / 6), Math.cos(a * Math.PI / 6)]), pushN = new THREE.Vector3();
  function pushOut(R) {
    for (let it = 0; it < 3; it++) {
      let deep = 0, nx = 0, nz = 0;
      for (const [ux, uz] of PUSH_DIRS) for (const h of [0.5, 1.0, 1.55]) {
        const r = cast(Pl.x, Pl.y + h, Pl.z, ux, 0, uz, R + 0.02); if (!r || Math.abs(r.face.normal.y) >= 0.55) continue;
        pushN.copy(r.face.normal); pushN.y = 0; if (pushN.lengthSq() < 1e-6) continue; pushN.normalize();
        let d = pushN.x * ux + pushN.z * uz; if (d > 0) { pushN.negate(); d = -d; }   // (the normal facing us)
        const gap = r.distance * -d, pen = R - gap;   // how far the wall's plane is from our centre, and how far inside we are
        if (pen > deep) { deep = pen; nx = pushN.x; nz = pushN.z; }
      }
      if (deep < 0.005) return;
      const step = Math.min(deep, 0.25);
      let ok = true; for (const h of [0.5, 1.0, 1.55]) { const r = cast(Pl.x, Pl.y + h, Pl.z, nx, 0, nz, step + 0.05); if (r && Math.abs(r.face.normal.y) < 0.55) ok = false; }
      if (!ok) return;   // wedged between two walls: leave it rather than pop through one
      Pl.x += nx * step; Pl.z += nz * step;
    }
  }
  // (28 Oct, Ben) movement + camera follow restored to the version Ben uploaded (gallery-design-kit)
  let HOLD = false;
  function move(dt) {
    // camera-relative input
    // (28 Oct, Ben: a jerk on letting go of LEFT / RIGHT while holding UP) the keys are on / off, so the direction jumped 45°
    // at once; they now ease (about 0.15 s) like a stick would, and the fox and the camera follow the change smoothly
    { const kx = input.r - input.l, kz = input.f - input.b, k = Math.min(1, dt * 5);
      // (28 Oct, Ben) only a key LET GO while the other direction is still held eases out; pressing a key, or letting go of the
      // last one, is instant (so stopping, turning, then walking on goes exactly where you press, with nothing left over)
      const ease = (cur, want, other) => want ? want : (other ? cur + (0 - cur) * k : 0);
      St.kx = ease(St.kx || 0, kx, kz); St.kz = ease(St.kz || 0, kz, kx);
      if (!kx && Math.abs(St.kx) < 0.02) St.kx = 0; if (!kz && Math.abs(St.kz) < 0.02) St.kz = 0; }
    let ix = input.jx + St.kx, iz = input.jy + St.kz;
    if (HOLD) { ix = 0; iz = 0; }   /* (29 Oct) a painting game is on: the fox stands still, taps and swipes belong to the game */
    const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
    let mag = Math.min(1, il);
    let run = input.run || mag > 0.92;
    let sp = (run ? 6.2 : 3.4) * mag * (extra === 'chair' ? 0.95 : 1);
    // (27 Oct) assisted turning, no rails: while you hold the stick, "forward" eases only slowly towards where the camera
    // looks, so the camera can swing round behind your fox without yanking your path. Hold the stick to one side and
    // you curve that way in a smooth arc; let go (or drag to look) and the stick lines up with the screen again.
    { const held = mag > 0.05, looked = performance.now() - St.lastLook < 250;
      if (St.moveYaw == null || !held || looked) St.moveYaw = St.yaw;
      else { let d = St.yaw - St.moveYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > 2.4) St.moveYaw = St.yaw; else St.moveYaw += d * Math.min(1, dt * 0.55); } }
    const fx = -Math.sin(St.moveYaw), fz = -Math.cos(St.moveYaw);   // forward on the ground
    let dx = (fx * iz + -fz * ix) * sp * dt, dz = (fz * iz + fx * ix) * sp * dt;
    // following a friend: walk their path behind them; moving yourself stops it
    if (AW.pts) {
      if (mag > 0.05) walkStop('moved');
      else { const a = walkAuto(dt); if (a) { mag = 1; run = true; sp = 6.2 * (extra === 'chair' ? 0.95 : 1); dx = a.ux * sp * dt; dz = a.uz * sp * dt; } }
    }
    if (F.id) {
      if (mag > 0.05) followStop('moved');
      else { const a = followAuto(dt); if (a) { mag = 1; run = a.run; sp = (run ? 6.2 : 3.4) * (extra === 'chair' ? 0.95 : 1); dx = a.ux * sp * dt; dz = a.uz * sp * dt; } }
    }
    if (mag > 0.05) { const want = Math.atan2(dx, dz); let d = want - Pl.face; d = Math.atan2(Math.sin(d), Math.cos(d)); Pl.face += d * Math.min(1, dt * 12); }
    // walls: rays at knee, chest and head; slide along what we hit. R is the body's radius: wide enough for the fox's
    // shoulders, swinging arms and tail (and the wheelchair) so nothing of it sinks into a wall (22 Oct)
    const R = BODY_R;
    for (let pass = 0; pass < 2; pass++) {
      const len = Math.hypot(dx, dz); if (len < 1e-5) break;
      const ux = dx / len, uz = dz / len; let hit = null;
      for (const h of [0.5, 1.0, 1.55]) { const r = cast(Pl.x, Pl.y + h, Pl.z, ux, 0, uz, len + R); if (r && Math.abs(r.face.normal.y) < 0.55 && (!hit || r.distance < hit.distance)) hit = r; }
      if (!hit) break;
      const n = tmp.copy(hit.face.normal); n.y = 0; n.normalize(); if (n.x * ux + n.z * uz > 0) n.negate();
      const allowed = Math.max(0, hit.distance - R);
      const into = dx * n.x + dz * n.z;   // negative
      dx -= n.x * into; dz -= n.z * into;   // slide
      if (allowed > 0.001) { Pl.x += ux * Math.min(allowed, len) * 0.9; Pl.z += uz * Math.min(allowed, len) * 0.9; dx *= 0.1; dz *= 0.1; }
    }
    // also block the sideways slide if it walks into another wall
    { const len = Math.hypot(dx, dz); if (len > 1e-5) { let ok = true; for (const h of [0.5, 1.0, 1.55]) { const r = cast(Pl.x, Pl.y + h, Pl.z, dx / len, 0, dz / len, len + R); if (r && Math.abs(r.face.normal.y) < 0.55) ok = false; } if (ok) { Pl.x += dx; Pl.z += dz; } } }
    // and keep the body clear all round: sliding along a wall at a shallow angle, or walking into a corner, can leave the
    // body closer than R to a wall (the fox then looks half inside it, and a thin wall or a glass pane can be slipped
    // through). Feel round in 12 directions and step back out along the wall's normal, never into another wall.
    if (!Pl.sit) pushOut(R);
    // ground: step up to 0.55 m, ramps, falls
    const gy = groundAt(Pl.x, Pl.y, Pl.z);
    if (input.jump && Pl.ground && extra !== 'chair') { Pl.vy = 6.2; Pl.ground = false; } input.jump = 0;
    if (Pl.ground && gy > Pl.y - 0.45 && Pl.vy <= 0) { Pl.y = damp(Pl.y, gy, 30, dt); Pl.vy = 0; }
    else { Pl.vy -= 22 * dt; Pl.y += Pl.vy * dt; Pl.ground = false; if (Pl.y <= gy) { Pl.y = gy; Pl.vy = 0; Pl.ground = true; } }
    if (Pl.y < -60) respawn();
    // in the lake (jumped off a rail, or squeezed past one): no swimming, back to the plaza
    if (!NOWORLD && Pl.y < -2.6 && Pl.x > -43 && Pl.x < GARDEN.x0 + 0.5 && !(Math.abs(Pl.z) < 3.6 && Pl.x < -12)) { respawn(); onSplash(); }
    Pl.speed = Math.hypot(dx, dz) / Math.max(dt, 1e-4) + (mag > 0.05 ? sp * 0.3 : 0);
  }
  // ---------------------------------------------------------------- "See through their eyes": two floor spots in the main hall (between Ben's and April & Melissa's screens)
  const vSpots = buildVisionSpots({ scene, groundAt, spots: [
    // (Ben, 27 Oct) the second main-hall spot (x -97.8, in line with the BEN FOX film) removed
    { x: -88.7, y: -3.3, z: 0, cond: 'cataracts', textYaw: Math.PI / 2, look: [-117.6, 0.16, -0.18], signSide: -1 },      // main hall, centred, toward the entrance
    { x: -2.5, y: 0.5, z: 0, cond: 'glaucoma', textYaw: Math.PI / 2, look: [-30, 2.5, 0], signSide: 1 },                 // welcome platform, looking down the walkway
    { x: -69.9, y: -2.5, z: -64.0, cond: 'amd', textYaw: Math.PI, look: [-69.9, 0.6, -95.8] },                           // New Artists Wing (south), facing its far wall
    { x: -69.9, y: -2.5, z: 54, cond: 'floaters', textYaw: 0, look: [-69.9, 0.5, 86] },                                // New Artists Wing
    { x: -224, y: -2.5, z: 0, cond: 'cataracts', textYaw: Math.PI / 2, look: [-205, -1, 0] },                            // music room, back area
    { x: -258, y: -2.5, z: 2, cond: 'glaucoma', textYaw: 0, look: [-261.5, -1.0, 29.2] },                               // meditation area, facing Morten
  ] });
  if (vSpots.signGroup) mergeStatic(vSpots.signGroup);   // 8 pole signs: a handful of draws in all
  const V = { spot: null, py: 0, pp: 0, pts: [], gi: 0, gt: 0, from: null };
  const vOverlay = visionOverlay({ container, onExit: () => exitVision(), onGuided: on => { if (on) { V.gt = 0; V.from = [St.yaw, St.pitch]; } } });
  const lookAngles = (from, to) => { const v = to.clone().sub(from).normalize(); return [Math.atan2(-v.x, -v.z), Math.asin(clamp(-v.y, -1, 1))]; };
  function enterVision(spot) {
    V.spot = spot; joyBase.style.display = joyKnob.style.display = 'none'; Pl.x = spot.x; Pl.z = spot.z; Pl.y = spot.y; Pl.vy = 0; Pl.speed = 0; for (const k in input) input[k] = 0;
    const eye = new THREE.Vector3(spot.x, spot.y + 1.55, spot.z);
    const screen = new THREE.Vector3(...(spot.look || (data.vids[3] && data.vids[3].p) || [-117.6, 0.16, -0.18]));
    [St.yaw, St.pitch] = lookAngles(eye, screen); Pl.face = St.yaw + Math.PI; V.py = St.yaw; V.pp = St.pitch;
    // guided look: the big screen, then the paintings you can actually see from here, in a sweep round the room
    const seen = [];
    for (const sg of signs) if (sg.s.k === 'c') { const d = sg.ctr.distanceTo(eye); if (d > 34) continue; const dir = sg.ctr.clone().sub(eye).normalize(); const h = cast(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, d); if (!h || h.distance > d - 0.6) seen.push(sg.ctr.clone()); }
    seen.sort((a, b) => Math.atan2(a.z - eye.z, -(a.x - eye.x)) - Math.atan2(b.z - eye.z, -(b.x - eye.x)));
    V.pts = [screen, ...seen.filter((_, i) => i % Math.max(1, Math.ceil(seen.length / 6)) === 0)].map(p => lookAngles(eye, p));
    V.gi = 0; V.gt = 0; V.from = [St.yaw, St.pitch]; V.home = [St.yaw, St.pitch];
    vOverlay.open(spot.cond); onNear(null); nearKey = 'vision-locked';
  }
  function exitVision() { if (!V.spot) return; const sp = V.spot; V.spot = null; vOverlay.close(); joyRest(); St.pitch = REST_PITCH; St.camDist = 1.2; { let d = 1.6; for (const h of [0.5, 1.0, 1.55]) { const r = cast(sp.x, sp.y + h, sp.z, 1, 0, 0, 1.6 + BODY_R); if (r && Math.abs(r.face.normal.y) < 0.55) d = Math.min(d, r.distance - BODY_R); } Pl.x = sp.x + Math.max(0, d); } pushOut(BODY_R); nearKey = null; }
  function updateVision(dt, now) {
    for (const sp of vSpots) sp.glow.material.opacity = 0.32 + Math.sin(now / 420 + sp.z) * 0.18;
    let yr = 0, pr = 0;
    if (V.spot) {
      Pl.x = V.spot.x; Pl.z = V.spot.z; Pl.y = V.spot.y; Pl.speed = 0;
      const ix = input.jx + (input.r - input.l), iy = input.jy + (input.f - input.b);
      if (Math.abs(ix) + Math.abs(iy) > 0.05 || now - St.lastLook < 200) { if (vOverlay.st.guided) vOverlay.setGuided(false); }
      St.yaw -= ix * 1.7 * dt; St.pitch -= iy * 1.1 * dt;
      if (vOverlay.st.guided && V.pts.length) {   // ease between points, dwell, move on
        const TR = 2.8, DW = 2.4; V.gt += dt; const to = V.pts[V.gi % V.pts.length];
        if (V.gt < TR) { const k = V.gt / TR, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; let dy = to[0] - V.from[0]; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw = V.from[0] + dy * e; St.pitch = V.from[1] + (to[1] - V.from[1]) * e; }
        else if (V.gt > TR + DW) { V.gt = 0; V.from = [St.yaw, St.pitch]; V.gi++; }
      }
      St.pitch = clamp(St.pitch, -0.65, 0.85);

      // through the fox's own eyes
      const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
      const eye = new THREE.Vector3(Pl.x, Pl.y + 1.55, Pl.z); camera.position.copy(eye); camera.lookAt(eye.clone().sub(dir)); player.visible = false; Pl.face = St.yaw + Math.PI;
    }
    { let dyw = St.yaw - V.py; dyw = Math.atan2(Math.sin(dyw), Math.cos(dyw)); yr = dyw / Math.max(dt, 1e-3); pr = (St.pitch - V.pp) / Math.max(dt, 1e-3); V.py = St.yaw; V.pp = St.pitch; }   // how fast the view turns (eyes lead, floaters lag)
    vOverlay.update(dt, clamp(yr, -6, 6), clamp(pr, -6, 6));
  }
  function respawn() { if (V.spot) exitVision(); Pl.x = SPAWN.x; Pl.z = SPAWN.z; Pl.y = groundAt(SPAWN.x, 1.5, SPAWN.z); Pl.vy = 0; Pl.vx = Pl.vz = 0; Pl.face = SPAWN.face; St.yaw = SPAWN.face + Math.PI; }

  const DBG = { freeCam: false };
  // (27 Oct) camera shots: hold the camera on a fixed view (a chess board), eased in and back out to the normal follow camera
  const SHOT = { pos: null, at: null, k: 1, out: false, fP: new THREE.Vector3(), fA: new THREE.Vector3(), toP: new THREE.Vector3(), toA: new THREE.Vector3(), look: new THREE.Vector3(), tmp: new THREE.Vector3() };
  function shotFrom() { SHOT.fP.copy(camera.position); camera.getWorldDirection(SHOT.tmp); SHOT.fA.copy(camera.position).addScaledVector(SHOT.tmp, 3); SHOT.k = 0; }
  function applyShot(dt) {
    if (!SHOT.pos && !SHOT.out) return;
    SHOT.k = Math.min(1, SHOT.k + dt / 0.9); const k = SHOT.k, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    if (SHOT.out) { SHOT.toP.copy(camera.position); camera.getWorldDirection(SHOT.tmp); SHOT.toA.copy(camera.position).addScaledVector(SHOT.tmp, 3); if (k >= 1) { SHOT.out = false; return; } }
    else { SHOT.toP.copy(SHOT.pos); SHOT.toA.copy(SHOT.at); player.visible = true; }
    camera.position.lerpVectors(SHOT.fP, SHOT.toP, e); SHOT.look.lerpVectors(SHOT.fA, SHOT.toA, e); camera.lookAt(SHOT.look);
  }
  St.lastLook = 0;
  const camRay = new THREE.Vector3(), camSide = new THREE.Vector3(), camUp = new THREE.Vector3();
  function updateCamera(dt) {
    // first person (tap the eye button): the camera at the fox's eyes; walking turns you the way you go, as usual
    if (St.fp) {
      const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
      const moving = Pl.speed > 0.6 && (Math.abs(input.jx) + Math.abs(input.jy) + input.f + input.b + input.l + input.r) > 0.1;
      if (moving && performance.now() - St.lastLook > 900) { let d = Pl.face + Math.PI - St.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); St.yaw += d * Math.min(1, dt * 3.0 * clamp((Math.cos(d) + 0.75) / 0.6, 0, 1)); }
      const eye = new THREE.Vector3(Pl.x, Pl.y + 1.5, Pl.z); camera.position.copy(eye); camera.lookAt(eye.sub(dir)); St.camDist = 0.55; player.visible = false; return;
    }
    // follow (27 Oct, stronger): while walking, the camera swings round behind the fox, fully for anything up to a right
    // angle and fading out only when you walk back toward the camera (so it never spins); not just after a drag to look.
    // Walking on a guided route or a tour follows too (no stick needed).
    const moving = Pl.speed > 0.6 && ((Math.abs(input.jx) + Math.abs(input.jy) + input.f + input.b + input.l + input.r) > 0.1 || !!AW.pts || !!F.id);
    if (moving && performance.now() - St.lastLook > 900) {
      const behind = Pl.face + Math.PI; let d = behind - St.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      const w = clamp((Math.cos(d) + 0.75) / 0.6, 0, 1);
      St.yaw += d * Math.min(1, dt * 3.0 * w);
    }
    const head = new THREE.Vector3(Pl.x, Pl.y + 1.35, Pl.z);
    const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
    // walls never come between you and the fox: a small fan of rays (centre, left, right, up, down) and the camera sits in front of the nearest hit
    camSide.set(Math.cos(St.yaw), 0, -Math.sin(St.yaw)); camUp.crossVectors(dir, camSide).normalize();
    let near = St.dist;
    for (const [sx, sy] of [[0, 0], [0.35, 0], [-0.35, 0], [0, 0.28], [0, -0.22]]) {
      camRay.copy(dir).multiplyScalar(St.dist).addScaledVector(camSide, sx).addScaledVector(camUp, sy);
      const len = camRay.length(); camRay.divideScalar(len);
      const h = cast(head.x, head.y, head.z, camRay.x, camRay.y, camRay.z, len + 0.35);
      if (h) near = Math.min(near, (h.distance - 0.35) * (St.dist / len));
    }
    const want = Math.max(0.55, near);
    St.camDist = want < St.camDist ? want : damp(St.camDist, want, 3, dt);
    camera.position.copy(head).addScaledVector(dir, St.camDist);
    camera.lookAt(head.x, head.y + AIM_UP, head.z);   // (29 Oct) aim a little above the head: more wall in view
    player.visible = St.camDist > 1.1;   // squeezed against a wall: go first-person rather than fill the screen with fox
  }

  // ---------------------------------------------------------------- input: keys, mouse drag, touch joystick (left) + drag look (right)
  const el = renderer.domElement;
  const keyMap = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  const onKeyDown = e => { if (e.target.closest && e.target.closest('input,textarea')) return; const k = keyMap[e.code]; if (k) { input[k] = 1; e.preventDefault(); } if (e.code === 'Space') { input.jump = 1; e.preventDefault(); } };
  const onKeyUp = e => { const k = keyMap[e.code]; if (k) input[k] = 0; };
  addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp);
  addEventListener('blur', () => { for (const k in input) input[k] = 0; });
  // phones/tablets: the Meru joystick. Touch anywhere on the left side of the screen and it appears under your thumb; let go and it hides
  const touchUI = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window || new URLSearchParams(location.search).has('phonepreview');   // (?phonepreview: the phone preview page shows the joystick on a computer too; drag it with the mouse)
  const PHONE_PREVIEW = new URLSearchParams(location.search).has('phonepreview');
  // (28 Oct, Ben) dragging the screen no longer turns the camera: only the LOOK AROUND button does (?draglook brings it back)
  const DRAG_LOOK = new URLSearchParams(location.search).has('draglook');
  const JR = 50;   // knob travel (same as Meru)
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;border-radius:50%;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5;transition:opacity .2s;';
  // arrows round the middle: N, E, S, W
  joyBase.innerHTML = '<svg viewBox="0 0 112 112" width="112" height="112" style="position:absolute;left:-2px;top:-2px" aria-hidden="true"><g fill="#f3f2f2"><path d="M56 9 L64 19 L48 19 Z"/><path d="M56 103 L64 93 L48 93 Z"/><path d="M9 56 L19 48 L19 64 Z"/><path d="M103 56 L93 48 L93 64 Z"/></g></svg>';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;border-radius:50%;background:#ec3013;border:2px solid #f3f2f2;box-sizing:border-box;transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5;transition:opacity .2s;';
  joyBase.setAttribute('aria-hidden', 'true'); joyKnob.setAttribute('aria-hidden', 'true');
  container.append(joyBase, joyKnob);
  // the LOOK AROUND eye, always in the bottom right corner: tap = first person on/off; press (and drag) = look around, and on
  // letting go the view swings back to the normal camera angle
  St.fp = false;
  const lookBtn = document.createElement('div');
  lookBtn.setAttribute('role', 'button'); lookBtn.setAttribute('tabindex', '0'); lookBtn.setAttribute('aria-pressed', 'false');
  lookBtn.setAttribute('aria-label', 'Look around. Tap for first person view, press and drag to look around');
  lookBtn.style.cssText = 'position:fixed;right:calc(12px + env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));z-index:9;display:flex;align-items:center;gap:8px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:pointer;';
  lookBtn.innerHTML = '<span style="font:800 10px/1 Archivo,Arimo,sans-serif;letter-spacing:.14em;color:#f3f2f2;background:rgba(29,28,27,.72);padding:6px 8px;pointer-events:none">LOOK AROUND</span>' +
    '<span class="eye" style="width:56px;height:56px;border-radius:50%;border:2px solid #f3f2f2;background:rgba(29,28,27,.72);display:flex;align-items:center;justify-content:center;pointer-events:none;transition:background .15s">' +
    '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M2 16 C8 7 24 7 30 16 C24 25 8 25 2 16 Z" fill="none" stroke="#f3f2f2" stroke-width="2.4" stroke-linejoin="round"/><circle cx="16" cy="16" r="5.2" fill="#f3f2f2"/><circle cx="16" cy="16" r="2.2" fill="#1d1c1b"/></svg></span>';
  document.body.appendChild(lookBtn);
  const lookEye = lookBtn.querySelector('.eye');
  // LEAVE NOTE, just above it: opens the note composer for the spot you're standing on (text, voice, photo)
  const noteBtn = document.createElement('div');
  noteBtn.setAttribute('role', 'button'); noteBtn.setAttribute('tabindex', '0'); noteBtn.setAttribute('aria-label', 'Leave a note on this comment spot');
  lookBtn.style.bottom = 'calc(84px + env(safe-area-inset-bottom))';   // (28 Oct, Ben) LOOK AROUND back where it was; the ACTION button (gallery.html) above it, LEAVE NOTE above that
  noteBtn.style.cssText = lookBtn.style.cssText; noteBtn.style.bottom = 'calc(220px + env(safe-area-inset-bottom))';
  noteBtn.innerHTML = '<span style="font:800 10px/1 Archivo,Arimo,sans-serif;letter-spacing:.14em;color:#f3f2f2;background:rgba(29,28,27,.72);padding:6px 8px;pointer-events:none">LEAVE NOTE</span>' +
    '<span style="width:56px;height:56px;border-radius:50%;border:2px solid #f3f2f2;background:rgba(29,28,27,.72);display:flex;align-items:center;justify-content:center;pointer-events:none">' +
    '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M5 6 H27 V21 H14 L8 27 V21 H5 Z" fill="none" stroke="#f3f2f2" stroke-width="2.4" stroke-linejoin="round"/><path d="M11 13.5 H21 M16 8.5 V18.5" stroke="#ec3013" stroke-width="2.6" stroke-linecap="round"/></svg></span>';
  document.body.appendChild(noteBtn);
  // it only shows while you stand on a comment spot (the yellow pads with a YOUR COMMENTS HERE sign)
  let padHere = null;
  const openNote = () => { if (padHere && window.NOTES && window.NOTES.openCompose) window.NOTES.openCompose(padHere); };
  noteBtn.addEventListener('click', e => { e.stopPropagation(); openNote(); });
  noteBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNote(); } });
  const LK = { id: null, t0: 0, x: 0, y: 0, moved: 0, held: false, snap: null };
  const homeAngles = () => V.spot && V.home ? V.home : [Pl.face + Math.PI, St.fp ? 0.04 : REST_PITCH];
  const setFP = on => { if (V.spot || studio) return; St.fp = on; St.yaw = Pl.face + Math.PI; St.pitch = on ? 0.04 : REST_PITCH; if (!on) St.camDist = 1.2;
    lookBtn.setAttribute('aria-pressed', on); lookEye.style.background = on ? '#ec3013' : 'rgba(29,28,27,.72)'; };
  const snapBack = () => { const [ty, tp] = homeAngles(); LK.snap = { fy: St.yaw, fp: St.pitch, ty, tp, t: 0 }; };
  lookBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); LK.id = e.pointerId; LK.t0 = performance.now(); LK.x = e.clientX; LK.y = e.clientY; LK.moved = 0; LK.held = false; LK.snap = null; try { lookBtn.setPointerCapture(e.pointerId); } catch (err) {} });
  lookBtn.addEventListener('pointermove', e => {
    if (e.pointerId !== LK.id) return; const dx = e.clientX - LK.x, dy = e.clientY - LK.y; LK.x = e.clientX; LK.y = e.clientY; LK.moved += Math.abs(dx) + Math.abs(dy);
    if (!LK.held && (LK.moved > 10 || performance.now() - LK.t0 > 280)) { LK.held = true; lookEye.style.outline = '3px solid #ec3013'; }
    if (LK.held) { St.lastLook = performance.now(); const k = e.pointerType === 'mouse' ? 0.006 : 0.01; St.yaw -= dx * k; const fp = St.fp || V.spot; St.pitch = clamp(St.pitch + dy * k * 0.8, fp ? -0.9 : -0.35, fp ? 0.9 : 1.2); }
  });
  const lookUp = e => { if (e.pointerId !== LK.id) return; LK.id = null; lookEye.style.outline = 'none';
    if (!LK.held && LK.moved <= 10 && performance.now() - LK.t0 < 280) setFP(!St.fp); else snapBack(); LK.held = false; };
  lookBtn.addEventListener('pointerup', lookUp); lookBtn.addEventListener('pointercancel', lookUp);
  lookBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFP(!St.fp); } });
  addEventListener('keydown', e => { if (e.code === 'KeyV' && !(e.target.closest && e.target.closest('input,textarea'))) setFP(!St.fp); });
  function lookTick(dt) {
    lookBtn.style.display = studio ? 'none' : 'flex'; { const ab = document.getElementById('actBtn'); if (ab) ab.style.display = studio ? 'none' : 'flex'; } { const p = comments && !V.spot ? comments.at(Pl.x, Pl.y, Pl.z) : null; if (p !== padHere) { padHere = p; onPad(p); } }
    noteBtn.style.display = studio || V.spot || !window.NOTES || !padHere ? 'none' : 'flex';
    if (!LK.snap || LK.id != null) return;
    const s = LK.snap; s.t += dt; const k = Math.min(1, s.t / 0.35), e = 1 - Math.pow(1 - k, 3);
    let dy = s.ty - s.fy; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    St.yaw = s.fy + dy * e; St.pitch = s.fp + (s.tp - s.fp) * e; St.lastLook = performance.now() - 700;
    if (k >= 1) LK.snap = null;
  }
  // on touch screens the joystick rests, faint, at the bottom left so players can see it's there; touching anywhere on the left half moves it under the thumb
  const joyRest = () => {
    if (!touchUI) { joyBase.style.display = joyKnob.style.display = 'none'; return; }
    const r = el.getBoundingClientRect(), x = 26 + 56 + 'px', y = r.height - 56 - Math.max(30, r.height * 0.06) + 'px';
    joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.opacity = '0.55'; joyKnob.style.opacity = '0.7';
    joyBase.style.left = joyKnob.style.left = x; joyBase.style.top = joyKnob.style.top = y;
  };
  const ptrs = new Map();
  el.addEventListener('pointerdown', e => {
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = !V.spot && !SHOT.pos && (e.pointerType !== 'mouse' || PHONE_PREVIEW) && touchUI && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.opacity = joyKnob.style.opacity = '1'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  });
  el.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; }
    else if (DRAG_LOOK) { St.lastLook = performance.now(); const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, St.fp ? -0.9 : -0.35, St.fp ? 0.9 : 1.2); }
    p.x = e.clientX; p.y = e.clientY;
  });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyRest(); } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.004, 1.6, 9); e.preventDefault(); }, { passive: false });

  // ---------------------------------------------------------------- loop
  let firstStream = true; let raf = 0, last = performance.now(), streamT = 0, nearKey = null, zoneT = 0;
  // the Fox Studio: the camera circles your fox, framed in the part of the screen the studio panel leaves free
  let studio = null;   // { x, y } px to shift the picture (panel on the right: x; panel at the bottom: y)
  const studioView = () => { if (studio) camera.setViewOffset(W(), H(), studio.x || 0, studio.y || 0, W(), H()); else camera.clearViewOffset(); };
  const fit = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.fov = camera.aspect < 1 ? 70 : 60; camera.updateProjectionMatrix(); St.dist = camera.aspect < 1 ? 5.2 : 4.2; studioView(); };
  const ro = new ResizeObserver(() => { fit(); if (![...ptrs.values()].some(p => p.joy)) joyRest(); }); ro.observe(container); fit(); joyRest();
  // ---- benches you can sit on (the plaza's two, the garden's ring): seat along the bench's local x
  const BENCHES = [];
  for (const z of [7.6, -7.6]) BENCHES.push({ x: 5.6, z, ry: Math.PI / 2, len: 2.8 });
  if (!NOWORLD) for (const [x, z, ry] of planGarden().benches) BENCHES.push({ x, z, ry, len: 2.4 });
  if (campus) BENCHES.push(...campus.benches);
  BENCHES.push(...zen.benches);   // Meditate with Morten: cushions, benches, the pond bench   // the WHY House's benches, the cinema's rows of seats
  const benchTop = b => (b.top ??= (() => { const y = groundAt(b.x, 4, b.z); return y > -50 ? y - 0.1 : 0.5; })());
  function benchNear() {
    if (extra === 'chair') return null;   // (the wheelchair is already a seat)
    let best = null, bd = 1.5;   // the nearest one (rows of cinema seats are close together)
    for (const b of BENCHES) { const dx = Pl.x - b.x, dz = Pl.z - b.z, c = Math.cos(b.ry), s = Math.sin(b.ry);
      const along = dx * c - dz * s, across = dx * s + dz * c;
      if (Math.abs(along) < b.len / 2 + 0.3 && Math.abs(across) < bd && Math.abs(Pl.y - (benchTop(b) - 0.5)) < 1.2) { best = b; bd = Math.abs(across); } }
    return best;
  }
  const hipV = new THREE.Vector3();
  function sitOn(b) {
    if (!b || Pl.sit || !player) return;
    const dx = Pl.x - b.x, dz = Pl.z - b.z, c = Math.cos(b.ry), s = Math.sin(b.ry);
    const along = clamp(dx * c - dz * s, -(b.len / 2 - 0.45), b.len / 2 - 0.45), side = b.dir || Math.sign(dx * s + dz * c) || 1;   // (dir: seats that face one way, like the cinema's)
    const nx = s * side, nz = c * side;   // facing out from the side you walked up on
    const P = player.userData.P; let hip = 0.5; if (P && P.legs && P.legs[0]) { player.updateMatrixWorld(true); P.legs[0].getWorldPosition(hipV); hip = hipV.y - player.position.y; }
    Pl.sit = { gy: Pl.y, nx, nz, name: b.name || 'Bench' };
    Pl.x = b.x + c * along + nx * 0.06; Pl.z = b.z - s * along + nz * 0.06; Pl.y = benchTop(b) - hip + 0.03; Pl.vy = 0; Pl.vx = Pl.vz = 0; Pl.speed = 0;
    Pl.face = Math.atan2(nx, nz); St.yaw = Pl.face + Math.PI; St.pitch = 0.22; player.userData.sit = true; nearKey = null;
    if (b.look) { Pl.face = Math.atan2(b.look[0] - Pl.x, b.look[2] - Pl.z); St.yaw = Pl.face + Math.PI; St.pitch = 0.04; St.camDist = 1.4; }   // (a cinema seat: turn to the screen and look at it)
    if (b.pitch != null) { St.pitch = b.pitch; if (b.camDist) St.camDist = b.camDist; }   // (27 Oct) a chess stool: look down over your fox's shoulder at the board
    if (b.chess != null) Pl.sit.chess = b.chess;
  }
  function standUp() {
    if (!Pl.sit) return; const s = Pl.sit; Pl.sit = null; if (player) player.userData.sit = false;
    Pl.y = s.gy; Pl.vy = 0; Pl.vx = Pl.vz = 0;
    // step off the way you're facing, unless something's there (the piano: you face its keys), then behind, then to either side
    const clear = (ux, uz) => { for (const h of [0.75, 0.95, 1.55]) { const r = cast(Pl.x, Pl.y + h, Pl.z, ux, 0, uz, 0.75 + BODY_R); if (r && Math.abs(r.face.normal.y) < 0.55) return false; } return true; };
    const tries = [[s.nx, s.nz], [-s.nx, -s.nz], [s.nz, -s.nx], [-s.nz, s.nx]], go = tries.find(([ux, uz]) => clear(ux, uz)) || tries[1];
    Pl.x += go[0] * 0.75; Pl.z += go[1] * 0.75; Pl.face = Math.atan2(go[0], go[1]); St.yaw = Pl.face + Math.PI; pushOut(BODY_R); nearKey = null;
  }
  // ---- the room's film, full screen (the same video the screen shows; tap ✕ or Esc to come back)
  function filmHere() {
    const i = nearestScreen(Pl.x, Pl.y, Pl.z); if (i < 0) return false;
    const v = vids[i], p = new THREE.Vector3(Pl.x, Pl.y + 0.5, Pl.z);
    // (22 Oct) only when you walk up to the screen, like walking up to a painting: within 5 m of it (plus half its width, for the
    // big end-wall screens), and in its own room (not where its sound carries, like the AMB's stage room or the park)
    const inRoom = v.zone ? v.zone.containsPoint(p) : true;
    if (v.half == null) { const bb = new THREE.Box3().setFromObject(v.box), sz = bb.isEmpty() ? null : bb.getSize(new THREE.Vector3()); v.half = sz ? Math.max(sz.x, sz.z) / 2 : 1; }
    const near = vidPos(v).distanceTo(p) < 5 + Math.min(v.half, 6);
    return !!(inRoom && near && curUrl && v.u === curUrl && video.readyState >= 2);
  }
  let filmOv = null;
  function fullFilm() {
    if (filmOv) return;
    const was = { muted: video.muted, style: video.getAttribute('style') };
    filmOv = document.createElement('div'); filmOv.setAttribute('role', 'dialog'); filmOv.setAttribute('aria-label', 'Film, full screen');
    filmOv.style.cssText = 'position:fixed;inset:0;z-index:40;background:#000;display:flex;align-items:center;justify-content:center';
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
    const x = document.createElement('button'); x.textContent = '\u2715 Close'; x.setAttribute('aria-label', 'Close full screen');
    x.style.cssText = 'position:absolute;top:calc(12px + env(safe-area-inset-top));right:calc(12px + env(safe-area-inset-right));min-height:48px;padding:0 16px;border:2px solid #f3f2f2;background:rgba(29,28,27,.8);color:#f3f2f2;font:800 13px/1 Archivo,Arimo,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;z-index:2';
    filmOv.append(video, x); document.body.appendChild(filmOv);
    video.muted = false; video.play().catch(() => {});
    try { (filmOv.requestFullscreen || filmOv.webkitRequestFullscreen || (() => {})).call(filmOv); } catch (e) {}
    const close = () => { if (!filmOv) return; removeEventListener('keydown', onKey);
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
      video.remove(); if (was.style == null) video.removeAttribute('style'); else video.setAttribute('style', was.style); video.muted = was.muted; filmOv.remove(); filmOv = null; video.play().catch(() => {}); };
    const onKey = e => { if (e.code === 'Escape') close(); };
    x.onclick = close; addEventListener('keydown', onKey); x.focus();
  }
  function nearest() {
    const p = new THREE.Vector3(Pl.x, Pl.y + 1.2, Pl.z); let best = null, bd = 1e9;
    if (V.spot) return null;
    if (Pl.sit && Pl.sit.name === 'Piano bench') return { kind: 'piano', item: { z: 4 }, label: 'Play the piano' };
    if (Pl.sit && Pl.sit.name === 'Drum stool') return { kind: 'drums', item: { z: 4 }, label: 'Play the drums' };
    if (Pl.sit && Pl.sit.name === 'Guitar stool') return { kind: 'guitar', item: { z: 4 }, label: 'Play the guitar' };
    if (Pl.sit && Pl.sit.chess != null) return { kind: 'chess', item: { z: 9, seated: true }, label: 'Play chess · ' + Pl.sit.name };   // (27 Oct) talking chess: reopen the board
    if (Pl.sit) return { kind: 'sit', item: { z: 0, up: true, name: Pl.sit.name }, label: 'Stand up' };
    if (simwalls && simwalls.kioskPositions.some(k => Math.hypot(Pl.x - k.x, Pl.z - k.z) < 2.6 && Math.abs(Pl.y - k.y) < 2)) return { kind: 'simctl', item: simwalls, label: 'Change the wall severity' };
    for (const sp of vSpots) if (Math.hypot(Pl.x - sp.x, Pl.z - sp.z) < sp.r + 0.15 && Math.abs(Pl.y - sp.y) < 1.2) return { kind: 'vision', item: sp, label: 'See through their eyes' };
    for (const sp of vSpots) if (sp.signPos && Math.hypot(Pl.x - sp.signPos.x, Pl.z - sp.signPos.z) < 1.6 && Math.abs(Pl.y - sp.y) < 1.2) return { kind: 'vision', item: sp, label: 'See through their eyes' };
    for (const f of nearProviders) { const n = f(Pl); if (n) return n; }   // add-ons: the guest book, visitors' notes
    for (const a of arts) { const d = a.ctr.distanceTo(p); if (d < 4.2 && d < bd) { bd = d; best = { kind: 'art', item: a, label: 'VIEW · ' + (a.title || 'ARTWORK') }; } }
    for (const e of edu) { const d = e.pos.distanceTo(p); if (d < e.r + 1 && d < bd + 1.5) { bd = d; best = { kind: 'edu', item: e, label: (e.prompt || 'LEARN MORE').replace(/^Press E to /i, '') }; } }
    if (!best) { const b = benchNear(); if (b) best = { kind: 'sit', item: b, label: 'Sit on the bench' }; }
    if (!best && filmHere()) best = { kind: 'film', item: { z: curUrl }, label: 'Watch the film full screen' };   // (z: the film, so the button's words change with it)
    if (!best && padHere) best = { kind: 'comment', item: { z: padHere.x * 7 + padHere.z, spot: padHere }, label: 'Leave a comment · ' + padHere.name };
    return best;
  }
  let doorT = 0, cineT = 0;
  const fadeEl = document.createElement('div'); fadeEl.style.cssText = 'position:absolute;inset:0;background:#0b0a12;opacity:0;pointer-events:none;transition:opacity .28s;z-index:6'; container.appendChild(fadeEl);
  function travel(d) {
    if (d.wing && wing) wing.load();
    fadeEl.style.opacity = 1;
    setTimeout(() => { const t = d.to; Pl.x = t.x; Pl.z = t.z; Pl.y = t.y; Pl.vy = 0; Pl.vx = Pl.vz = 0; Pl.face = t.face; St.yaw = t.face + Math.PI; St.camDist = 1; streamT = 0; St.zoneName = null; setTimeout(() => fadeEl.style.opacity = 0, 120); }, 300);
  }
  let faceLocal = null;   // the fox Animoji: the visitor's tracked face drives their own fox
  const Q = { max: renderer.getPixelRatio(), max0: renderer.getPixelRatio(), pr: renderer.getPixelRatio(), t: 0, n: 0, slow: 0, born: performance.now() };
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const rawDt = (now - last) / 1000, dt = Math.min(0.05, rawDt); last = now;
    // adaptive resolution: if frames run slow for a few seconds, render fewer pixels (down to 1x); speed back up when smooth
    if (rawDt < 0.5) { Q.t += rawDt; Q.n++; if (Q.t > 2.5) { const ms = Q.t / Q.n * 1000; Q.t = Q.n = 0;
      // only when needed: still slow at 1x, or very slow (under ~18 fps) whatever the resolution
      if (!LITE.on && !LITE.userOff && performance.now() - Q.born > 10000 && ((ms > 40 && Q.pr <= 1) || ms > 55) && ++Q.slow >= 2) setLite(true, true);
      else if (ms <= 40) Q.slow = 0;
      if (ms > 30 && Q.pr > 1) { Q.pr = Math.max(1, Q.pr - 0.25); renderer.setPixelRatio(Q.pr); renderer.setSize(W(), H()); }
      else if (ms < 17 && Q.pr < Q.max) { Q.pr = Math.min(Q.max, Q.pr + 0.25); renderer.setPixelRatio(Q.pr); renderer.setSize(W(), H()); } } }
    if (studio) { Pl.speed = 0; studio.t = (studio.t || 0) + dt; St.yaw = Pl.face + Math.sin(studio.t * 0.45) * 1.25; St.pitch = 0.1;   // a slow swing from one side of your fox to the other
      St.dist = studio.dist || 3.2; St.lastLook = performance.now(); }
    else if (Pl.sit) { Pl.speed = 0; if (Math.abs(input.jx) + Math.abs(input.jy) + input.f + input.b + input.l + input.r > 0.35) standUp(); }   // sitting: push the stick to get up
    else if (!V.spot && !(lift.moving() && lift.riding())) move(dt);   // riding the lift: hold still
    player.position.set(Pl.x, Pl.y + (extra === 'chair' ? 0 : 0.02), Pl.z); player.rotation.y = Pl.face;
    if (faceLocal) player.userData.faceCtl = faceLocal;
    wearCam(player, camHeads.get('me'));
    animFox(player, dt, Pl.speed / FOX_SCALE * 0.6, !Pl.ground);
    for (const st of staff) { const far = Math.hypot(st.s.x - Pl.x, st.s.z - Pl.z) > 60; st.f.visible = !far; if (far) continue; st.t += dt;
      if (st.s.role === 'snacks' && snackJob) { snackJob(st, dt); continue; }
      if (st.s.role === 'audience') { animFox(st.f, dt, 0, false); continue; }
      animFox(st.f, dt, 0, false); st.f.rotation.y = st.s.face + Math.sin(st.t * 0.35) * 0.35; }
    if (FP) floorPianoTick();
    updateRemotes(dt);
    if (F.id) followRecord();
    for (const f of tickers) f(dt);
    braille.tick(dt);
    { fun.tick(dt, performance.now() / 1000);   // (27 Oct) fun props: animate, and show inside-only ones while the camera is in their building
      if (fun.inside.length) { const cp = camera.position, R = { why: [CAMPUS.why], amb: [CAMPUS.amb, CAMPUS.amb2], amb2: [CAMPUS.amb2], cinema: [CAMPUS.cinema] };
        for (const [o, k] of fun.inside) o.visible = (R[k] || []).some(r => cp.x > r.x0 - 1 && cp.x < r.x1 + 1 && cp.z > r.z0 - 1 && cp.z < r.z1 + 1 && cp.y < 12); } }
    if (campus) {
      campus.tick(dt); if (campus.cinema.player) campus.cinema.player(Pl.x, Pl.y, Pl.z, dt);
      // showtimes: in the cinema the film is locked to the clock (everyone sees the same frame); between shows it waits at the start
      const cs = campus.cinema.screens.find(x => x.u === curUrl);   // (22 Oct: two screens, each on its own showtimes)
      if (curUrl && cs && video.readyState >= 1 && !window.HUSH) {
        if (cs.F && isFinite(video.duration) && video.duration > 5 && Math.abs(cs.F.len - video.duration) > 0.5) { cs.F.len = video.duration; cs.F.every = Math.max(cs.F.every, Math.ceil(video.duration / 60) + 2); }   // (the film's real length, once known)
        const S = cs.show();
        if (S.on) { cineT -= dt; if (cineT <= 0 && Math.abs(video.currentTime - S.t) > 2 && S.t < (video.duration || 1e9) - 1) { cineT = 3; try { video.currentTime = S.t; } catch (e) {} }   // (at most one seek every 3 s, so a slow connection isn't kept seeking)
          if (video.paused) video.play().catch(() => {}); }
        else if (!video.paused || video.currentTime > 0.5) { video.pause(); try { video.currentTime = 0; } catch (e) {} }
      }
    }
    lift.tick(dt, Pl);
    ringGlass.tick(Pl);
    zen.tick(dt, performance.now() / 1000, camera.position, Pl, camera.quaternion);
    // running: a smoothed pace, so a burst of speed holds back the heavy loading (art, films, living paintings) until you slow down
    St.pace = damp(St.pace || 0, Pl.speed || 0, 1.5, dt); const fast = St.pace > 5.4;
    animator.update(dt, Pl.x, Pl.y, Pl.z, fast);
    if (simwalls) simwalls.update(dt, Pl.x, Pl.y, Pl.z);
    guides.update(dt, Pl.x, Pl.z);
    outdoors.update(dt);
    lookTick(dt);
    if (!DBG.freeCam && !V.spot) { updateCamera(dt); applyShot(dt); }
    updateVision(dt, now);
    doorT -= dt;
    for (const d of doors) {
      d.portal.material.opacity = 0.78 + Math.sin(now / 400) * 0.12;
      if (doorT > 0) continue;
      const lx = Pl.x - d.pos.x, lz = Pl.z - d.pos.z, along = lx * Math.cos(d.face) - lz * Math.sin(d.face), across = lx * Math.sin(d.face) + lz * Math.cos(d.face);
      if (Math.abs(along) < 1.5 && Math.abs(across) < 0.55 && Math.abs(Pl.y - d.pos.y) < 2) { doorT = 1.2; travel(d); }
    }
    streamT -= dt;
    if (streamT <= 0) {
      streamT = 0.25; const p = new THREE.Vector3(Pl.x, Pl.y, Pl.z); detailCull();
      { const inWing = !!wing && wing.bounds.containsPoint(p), cz = campus && campus.zoneAt(Pl.x, Pl.y, Pl.z); St.inWing = inWing; St.campusZone = cz || null;
        const zn = inWing ? 'New Artists Wing' : cz ? CAMPUS_STOPS[cz].name : 'The Gallery'; if (zn !== St.zoneName) { St.zoneName = zn; onZone(zn); } }
      for (const w of wings) { const dW = Math.hypot(Pl.x - w.O.x, Pl.z - w.O.z); if (dW < (fast ? 100 : lowEnd ? 120 : 160)) w.load(); else if (dW > (lowEnd ? 155 : 215)) w.unload(); }
      for (const r of rooms.list) { const dR = Math.hypot(Pl.x - r.O.x, Pl.z - r.O.z); if (dR < (fast ? 90 : lowEnd ? 110 : 140)) r.room.load(); else if (dR > (lowEnd ? 150 : 220)) r.room.unload(); }   // far rooms let their paintings go (memory)
      // rooms behind walls still draw (the camera doesn't know about walls): hide a room's whole group unless you're close to it
      { const pp2 = new THREE.Vector3(Pl.x, Pl.y + 1, Pl.z); for (const r of rooms.list) r.room.group.visible = r.park || r.room.bounds.distanceToPoint(pp2) < 95; for (const w of wings) w.group.visible = w.bounds.distanceToPoint(pp2) < 95; }
      // nearest first, a few per tick (no hitch), far enough out that it all arrives before you can see it
      const want = []; let swaps = 0; for (const sg of signs) { const d = sg.ctr.distanceTo(p); sg.d = d;
        if (sg.s.plate) { if (!sg.mesh) want.push([-1, sg]); else sg.mesh.visible = true; continue; }   // (28 Oct) room signs (MUSIC ROOM, MAIN GALLERY…): ~27 cheap plates, loaded first, at any distance, and kept
        if (d < NEAR) { if (!sg.mesh) want.push([d, sg]); else { sg.mesh.visible = d < ((sg.s.k === 't' || sg.s.k === 'l') ? LITE.label : LITE.art);
          if (sg.s.k === 'c' && sg.s.imgTiny && swaps < 4) { if (sg.tiny && d < SHARP) { swapArt(sg, false); swaps++; } else if (!sg.tiny && d > SHARP + 18) { swapArt(sg, true); swaps++; } } } } else if (d > FAR) hideSign(sg); }   // (a few swaps a tick, nearest first is fine)   // loaded far out (no pop-in of images), but only drawn when close enough to matter: labels 38 m, art 70 m
      want.sort((a, b) => a[0] - b[0]); for (const [, sg] of want.slice(0, firstStream ? 60 : fast ? 4 : 14)) showSign(sg);   // running: a few at a time, nearest first
      firstStream = false;
      lightArt();
      // which video zone are we in?
      let zUrl = null; const pp = new THREE.Vector3(Pl.x, Pl.y + 0.5, Pl.z);
      for (const v of vids) if ((v.zone && v.zone.containsPoint(pp)) || (v.zones && v.zones.some(z => z.containsPoint(pp)))) { zUrl = v.u; break; }
      // films: only start once you've settled in a room (running past a doorway doesn't spin up a film for a second)
      if (zUrl !== zPend.u) { zPend.u = zUrl; zPend.t = 0; } else zPend.t += 0.25;
      if (!zUrl || zUrl === curUrl || zPend.t >= (fast ? 1.5 : 0.25)) playUrl(zUrl);
      if (window.HUSH) { if (!video.paused) { video.pause(); hushPaused = true; } } else if (hushPaused) { hushPaused = false; if (video.paused && (video.currentSrc || video.src)) video.play().catch(() => {}); }   // the room film pauses while an artwork is open, and picks up where it left off
      if (zUrl) { let dmin = 1e9; for (const v of vids) if (v.u === zUrl) dmin = Math.min(dmin, vidPos(v).distanceTo(pp)); const vv = vids.filter(v => v.u === zUrl).reduce((b, v) => ((v.vol ?? 0.8) > (b.vol ?? 0.8) ? v : b));   /* (29 Oct, Ben: Dave's + Raquel's interviews were silent) a film on 2 screens takes the louder one's settings (the 2nd-floor copies are vol 0) */ const zs = vv.zone ? vv.zone.getSize(new THREE.Vector3()) : null, reach = vv.reach || Math.max(vv.dist || 20, zs ? Math.hypot(zs.x, zs.z) * 1.1 : 0); const zg = vv.zone && vv.zone.containsPoint(pp) ? 1 : (vv.zones || []).reduce((g, z, i) => z.containsPoint(pp) ? Math.min(g, (vv.zoneGains && vv.zoneGains[i]) ?? 1) : g, 1); video.volume = clamp((vv.vol ?? 0.8) * Math.max(vv.minVol ?? 0.45, 1 - dmin / reach) * zg * (LIVE.idx >= 0 ? (vids[LIVE.idx] && vids[LIVE.idx].u === zUrl ? 0 : 0.12) : 1), 0, 1); }   /* (29 Oct, Ben) the screen showing a host's camera or screen share is silent: its film makes no sound at all while it's live (films elsewhere drop to a murmur, as before) */   // (zg: some places hear it quieter, e.g. the AMB's stage room)   // a live host talk: the room film drops to a murmur   // never silent while you're in the zone
      if (!V.spot) { const n = nearest(); const key = n ? n.kind + n.label + (n.item && n.item.z) : null; if (key !== nearKey) { nearKey = key; onNear(n); } }
    }
    // (Ben, 28 Oct) the hanging welcome film: there as you come in through the eye, gone once you've walked under it, so looking
    // back from inside you see the eye door clear
    // (29 Oct, Ben) the PUPIL HALLWAY: a black tube from the eye's iris in to just in front of the hanging welcome film, so from
    // outside the pupil reads black round the screen. It fades out as you walk into the eye (the room opens up) and stays hidden
    // inside, so looking back you see the eye clear.
    if (!NOWORLD) { if (!G_pupil) { const L = -26.1 - -47.7, m = new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.BackSide, transparent: true, fog: false });
        G_pupil = new THREE.Mesh(new THREE.CylinderGeometry(4.63, 3.48, L, 40, 1, true), m); G_pupil.rotation.z = Math.PI / 2; G_pupil.position.set(-26.1 - L / 2, 3.9, 0.1); G_pupil.renderOrder = -1; scene.add(G_pupil); }
      const cx = camera.position.x, k = Math.max(0, Math.min(1, (cx + 27) / 7));   // 1 from x -20 outward, 0 by x -27
      G_pupil.visible = k > 0.01; G_pupil.material.opacity = k; G_pupil.material.depthWrite = k > 0.99; }
    { const wv = vids[0]; if (wv && wv.keep) { wv.box.visible = camera.position.x > wv.p[0] - 0.4; if (kiosks.filmFrame) kiosks.filmFrame.visible = wv.box.visible; } }
    occCull();
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  function splitDesc(d) {
    const s = String(d || '').replace(/\t+/g, ' ').trim();
    const m = s.match(/\/\s*IMAGE DESCRIPTION\s*[:\-]?\s*/i);
    if (!m) return { desc: s, imgDesc: '' };
    return { desc: s.slice(0, m.index).trim(), imgDesc: s.slice(m.index + m[0].length).trim() };
  }

  return {
    arts, edu, notesConfig: data.notes ? { ...data.notes, ...(campus ? { guestbook: campus.why.guestbook, why: { slots: campus.why.slots, station: campus.why.station } } : {}) } : null,
    setGuided() {}, setLite: on => { if (!on) LITE.userOff = true; setLite(!!on, false); }, lite: () => LITE.on, guided: () => St.guided !== false,
    setLook(l, x) { look = l || look; extra = x || 'none'; buildPlayer(); },
    // (27 Oct) a head-and-shoulders portrait of a fox look, drawn on the main renderer (no second WebGL context) and
    // copied out as an image: the Joe / Jane cards on the way in
    portrait(l, x, px = 220) {
      const f = makeVisitorFox(l, x, style); for (let i = 0; i < 3; i++) animFox(f, 0.05, 0, false);
      const S = new THREE.Scene(); S.add(new THREE.HemisphereLight(0xffffff, 0x8a6a5a, 2.2)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(2, 4, 5); S.add(dl);
      S.add(f); f.position.set(0, 0, 0); f.rotation.y = 0.3; f.updateMatrixWorld(true);
      const h = new THREE.Box3().setFromObject(f).max.y, cam = new THREE.PerspectiveCamera(28, 1, 0.05, 50); cam.position.set(0.2, h - 0.35, 1.9); cam.lookAt(0, h - 0.45, 0);
      const pr = renderer.getPixelRatio(), css = px / pr, vp = new THREE.Vector4(), cc = new THREE.Color(); renderer.getViewport(vp); renderer.getClearColor(cc); const ca = renderer.getClearAlpha();
      const rt = renderer.getRenderTarget(); renderer.setRenderTarget(null);
      renderer.setScissorTest(true); renderer.setViewport(0, 0, css, css); renderer.setScissor(0, 0, css, css); renderer.setClearColor(0x1d2a6b, 1); renderer.clear(); renderer.render(S, cam);
      const c = document.createElement('canvas'); c.width = c.height = px; const H = renderer.domElement.height;
      c.getContext('2d').drawImage(renderer.domElement, 0, H - px, px, px, 0, 0, px, px);
      renderer.setScissorTest(false); renderer.setViewport(vp); renderer.setClearColor(cc, ca); renderer.setRenderTarget(rt);
      S.remove(f);
      return c.toDataURL('image/webp', 0.88);
    },
    // multiplayer hooks (the page wires these to engine/gallery-net.js)
    localState: () => [+Pl.x.toFixed(2), +Pl.y.toFixed(2), +Pl.z.toFixed(2), +Pl.face.toFixed(2), +Math.min(9, Pl.speed).toFixed(1), Pl.ground ? 0 : 1, Pl.sit ? 1 : 0],   // [x, y, z, face, speed, air, sitting]
    remote: { upsert: remoteUpsert, remove: remoteRemove, count: () => remotes.size, arts: () => [...remotes.values()].map(r => r.prof && r.prof.art).filter(Boolean), names: () => [...remotes.values()].map(r => r.prof.name), list: () => [...remotes.values()].map(r => ({ id: r.id, name: r.prof.name || 'Visitor', placed: r.placed, x: r.tx, y: r.ty, z: r.tz })), wave: id => { const r = remotes.get(id); if (r && r.fox) showWave(r.fox); } },
    wave() { showWave(player); },
    style: () => ({ ...style }),
    setStyle(st) { style = { pal: st.pal | 0, art: st.art || DEFAULT_ART }; buildPlayer(); },
    randomStyle,
    jump() { input.jump = 1; },
    setRun(v) { input.run = v ? 1 : 0; },
    respawn,
    setNight: v => outdoors.setNight && outdoors.setNight(v), isNight: () => !!(outdoors.isNight && outdoors.isNight()),
    setSky: m => outdoors.setSky && outdoors.setSky(m),
    simwall: () => simwalls,
    // visiting together: follow / go to a friend, and the zone film for watch parties
    follow: (id, onEnd) => followStart(id, onEnd), unfollow: () => followStop('stopped'), following: () => F.id,
    goTo(id, slot) { const r = remotes.get(id); if (!r || !r.placed) return false; if (V.spot) exitVision(); if (F.id) followStop('gathered'); placeNear(r, slot); return true; },
    live: { show: (i, st) => liveShow(i, st), clear: () => liveClear(), nearest: (x, y, z) => nearestScreen(x, y, z), active: () => LIVE.idx, pos: i => screenPos(i).toArray() },
    studioCam(v) { if (v && !studio && v.face != null) { Pl.face = v.face; } if (v && studio) v.t = studio.t; studio = v || null; if (!v) { St.pitch = REST_PITCH; fit(); } else studioView(); },   // facing the fox's front first
    wrapArt: k => wrapArt(k), sleeveArt: (k, s) => sleeveArt(k, s),   // (27 Oct) the shirt studio's mannequins wear the same prints
    shirtArts() {   // every artwork that can go on a shirt, Walk Through Fear first, with titles where the gallery has them
      const title = new Map(); const rev = new Map(Object.entries(IMGURL).map(([k, u]) => [u, k]));
      for (const a of arts) { const k = a.img && rev.get(a.img); if (k && a.title && !title.has(k)) title.set(k, a.title); }
      const list = ART_KEYS.map(k => ({ key: k, url: IMGURL[k], title: title.get(k) || k.replace(/^.*\/wix_|\.webp$/g, '').replace(/_/g, ' ') }));
      list.sort((a, b) => (b.key === DEFAULT_ART) - (a.key === DEFAULT_ART)); return list;
    },
    palettes: () => PALETTES.map((p, i) => ({ i, fur: p.fur || PLAYER_MALE.fur, dark: p.furDark || PLAYER_MALE.furDark, tip: p.tailTip || '#ffffff' })),
    elevator: { act: n => lift.act(n, Pl), state: lift.state }, ringGlass,
    comments: comments && {
      here: () => padHere, list: comments.list,
      go(id) { const S = comments.list.find(s => s.id === id); if (!S) return; if (V.spot) exitVision(); if (Pl.sit) standUp(); travel({ to: comments.arrive(S) }); },
      dist: S => Math.hypot(S.x - Pl.x, S.z - Pl.z),
    },
    campus: campus && {
      go(to) { const t = CAMPUS_STOPS[to]; if (!t) return; if (Pl.sit) standUp(); travel({ to: { x: t.x, z: t.z, y: groundAt(t.x, 3, t.z), face: t.face } }); },
      walk: (to, onEnd) => walkTo(to, onEnd), stopWalk: () => walkStop('stopped'), walking: () => AW.pts ? AW.to : null, dests: SIGN_DEST,
      piano: campus.piano, playPiano() { if (!(Pl.sit && Pl.sit.name === 'Piano bench')) { if (Pl.sit) standUp(); sitOn(campus.piano.bench); } }, standUp: () => standUp(),
      band: campus.band, playAt(which) { const b = which === 'piano' ? campus.piano.bench : campus.band[which] && campus.band[which].bench; if (!b || (Pl.sit && Pl.sit.name === b.name)) return; if (Pl.sit) standUp(); sitOn(b); },
      // the guitar goes from its stand into the fox's lap (neck to its left) while you play, and back after
      holdGuitar(on) { const Gt = campus.band.guitar; if (!Gt || !player) return; const gt = Gt.group;
        if (on) { if (!guitarHold) { guitarHold = new THREE.Group(); guitarHold.scale.setScalar(1 / FOX_SCALE); } if (guitarHold.parent !== player) player.add(guitarHold);
          guitarHold.add(gt); gt.position.set(0.02, Gt.bench.top + 0.2 - Pl.y, 0.24); gt.rotation.set(-0.12, 0.1, -1.2); }
        else { Gt.rest.parent.add(gt); gt.position.copy(Gt.rest.pos); gt.rotation.copy(Gt.rest.rot); } },
      // someone else picked up the guitar (or put it back): it goes into their fox's lap on your screen too
      holdGuitarFor(id, on) { const Gt = campus.band.guitar, r = remotes.get(id); if (!Gt) return; const gt = Gt.group;
        if (on && r && r.fox) { let h = r.fox.userData.guitarHold; if (!h) { h = new THREE.Group(); h.scale.setScalar(1 / FOX_SCALE); r.fox.add(h); r.fox.userData.guitarHold = h; }
          h.add(gt); gt.position.set(0.02, Gt.bench.top + 0.2 - r.y, 0.24); gt.rotation.set(-0.12, 0.1, -1.2); Gt.heldBy = id; }
        else if (!on && Gt.heldBy === id) { Gt.rest.parent.add(gt); gt.position.copy(Gt.rest.pos); gt.rotation.copy(Gt.rest.rot); Gt.heldBy = null; } },
      showtime: () => campus.cinema.showAt(Pl.x, Pl.z), filmTitle: () => campus.cinema.filmAt(Pl.x, Pl.z).title,
      zone: () => St.campusZone, why: campus.why, nowShowing: () => campus.cinema.filmAt(Pl.x, Pl.z).title, nextFilm: () => playUrl(campus.cinema.next()), group: campus.group,
    },
    sit: b => (b && b.up) || Pl.sit ? standUp() : sitOn(b), fullFilm: () => fullFilm(), sitting: () => !!Pl.sit,
    camHead: { local: (mode, stream) => setCam('me', mode, stream), remote: (id, mode, stream) => setCam(id, mode, stream) },
    face: { local: c => { faceLocal = c; if (!c && player) player.userData.faceCtl = null; }, remote: (id, c) => { const r = remotes.get(id); if (r && r.fox) r.fox.userData.faceCtl = c; } },
    film: {
      url: () => curUrl, time: () => video.currentTime || 0, ready: () => video.readyState >= 1, local: u => { const v = vids.find(v => v.u === u); return (v && v.local) || u; },
      seek(u, t) { if (u !== curUrl) return false; if (video.readyState >= 1) { try { video.currentTime = t % (video.duration || 1e9); } catch (e) {} } else pendingSeek = { u, t }; if (video.paused) video.play().catch(() => {}); return true; },
    },
    vision: { enter: sp => enterVision(sp), exit: () => exitVision(), locked: () => !!V.spot, spots: vSpots, overlay: vOverlay },
    unlockAudio() { unlockSound(); },
    goWing() { const d = doors.find(x => x.wing); if (d) travel(d); },
    // (28 Oct, Ben) the museum map: fade straight to a room. t = { x, y, z, face, wing? }
    goSpot(t) { if (V.spot) exitVision(); if (Pl.sit) standUp(); if (AW.pts) walkStop('moved'); if (F.id) followStop('moved'); travel({ to: t, wing: !!t.wing }); },
    // add-ons (notes, guest book): draw into the scene, add things you can walk up to, run each frame
    chess: fun.chess || null,
    hold(on) { HOLD = !!on; if (on) { input.jx = input.jy = 0; Pl.vx = Pl.vz = 0; } joyBase.style.visibility = joyKnob.style.visibility = on ? 'hidden' : ''; },   // (29 Oct) painting games: hold the fox still
    camShot(pos, at) { shotFrom(); SHOT.pos = new THREE.Vector3(...pos); SHOT.at = new THREE.Vector3(...at); SHOT.out = false; },   // (27 Oct) hold the camera on a view
    camSave() { SHOT.saved = { yaw: St.yaw, pitch: St.pitch, camDist: St.camDist, fp: St.fp }; },   // remember the view before a shot (camRelease goes back to it)
    camRelease() { if (!SHOT.pos) return; shotFrom(); SHOT.pos = null; SHOT.out = true; const s = SHOT.saved; if (s) { SHOT.saved = null; St.yaw = s.yaw; St.pitch = s.pitch; St.camDist = s.camDist; St.fp = s.fp; St.lastLook = performance.now(); } },
    walkToPoint(x, z, onEnd) { if (Pl.sit) standUp(); if (F.id) followStop('walk'); Object.assign(AW, { pts: [[x, z]], i: 0, to: null, best: 1e9, stuckT: 0, onEnd: onEnd || null }); },   // walk your fox to a spot (moving yourself stops it)   // (27 Oct) fox chess tables (gallery-fun-props.js), played by engine/gallery-chess.js
    world: { THREE, scene, camera, canvas: renderer.domElement, merge: g => mergeStatic(g),   // (29 Oct) for the modules built after load (the shirt booth): their still parts in a few draws
      groundAt: (x, y, z) => groundAt(x, y, z), pos: () => [Pl.x, Pl.y, Pl.z], addNear: f => nearProviders.push(f), onTick: f => tickers.push(f), refreshNear: () => { nearKey = null; } },
    debug: { move: dt => move(dt), nearest: () => nearest(), guides, THREE, DBG, video, animator, Pl, St, input, scene, camera, renderer, vids, signs, teleport(x, y, z, face) { Pl.vx = Pl.vz = 0; Pl.x = x; Pl.z = z; Pl.y = y ?? groundAt(x, 30, z); Pl.vy = 0; if (face != null) { Pl.face = face; St.yaw = face + Math.PI; } }, groundAt, cast, colSrc, colWhat, occ: () => OCC && { tiles: OCC.tiles.length, hidden: OCC.hidden, pass: OCC.pass }, occTiles: () => OCC && OCC.tiles, occSeen, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tex: renderer.info.memory.textures, geo: renderer.info.memory.geometries }) },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); if (hls) hls.destroy(); video.pause(); renderer.dispose(); el.remove(); joyBase.remove(); lookBtn.remove(); noteBtn.remove(); joyKnob.remove(); },
  };
}
