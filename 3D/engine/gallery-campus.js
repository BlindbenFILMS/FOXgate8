// Blind Canvas gallery: the park campus (4 Oct). You start in the middle of the cherry blossom park beside the big tree, facing
// the museum; round you, at the ends of the park's walks:
//  · BLIND CAN CINEMA (east, behind you): an old-time picture house. A cream art-deco front with a stepped tower and sunburst,
//    a marquee with chasing bulbs ("BLIND CAN CINEMA" in red on top, NOW SHOWING and the film's title on its lightbox), a ticket
//    booth, poster cases; inside, red seats in rows (sit and watch), a starry ceiling, red curtains and the big screen. It runs a
//    little programme of films, one after another.
//  · the WHY House (north, on your left): a small gabled house with a round "?" window, the guest book on its porch. Inside,
//    visitors' own stories (words, a photo of them or their art, their voice) hang on the walls; the story stand by the door
//    adds yours (gallery-notes.js draws the cards into the slots given here).
//  · the Academy of Music for the Blind (south, on your right): the AMB room moved out of the museum into its own building
//    (gallery.json rooms[amb], built by buildWing); this adds its outside: a logo parapet over the door, a piano-key frieze
//    round the top of the walls and an ink plinth.
// Plus, back in the museum: the AMB room's old doorway is closed with a sign that takes you to its new building, and a board by
// the Wall of Why points to the WHY House ("leave your own").
import * as THREE from '../vendor/three/three.module.js';
import { CAMPUS, RING } from './gallery-garden-plan.js';
import { lectern } from './gallery-remodel.js';
import { makePlant, makeBench } from './gallery-props.js';

const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
const DECO = '"Limelight", "Poiret One", Archivo, Arimo, Helvetica, Arial, sans-serif';
export const CINEMA_PROGRAM = [
  { file: 'blindcan_capitol', title: 'Blind Artists Use A.I. to Make Art', kicker: 'As seen on the news' },
  { file: 'goalball', title: 'Goalball', kicker: 'The game played by ear' },
  { file: 'bcp_teaser', title: 'The Blind Canvas Project', kicker: 'The teaser' },
  { file: 'bcp_ora_film', title: 'Blind Canvas × Ora', kicker: 'Imagining together' },
];
// where "take me there" lands you: just outside each door, facing it
export const CAMPUS_STOPS = {
  why: { x: 40, z: 21.6, face: 0, name: 'The WHY House' },
  amb: { x: 40, z: -21.4, face: Math.PI, name: 'Academy of Music for the Blind' },
  cinema: { x: 67.5, z: 0, face: Math.PI / 2, name: 'BLIND CAN Cinema' },
  park: { x: CAMPUS.spawn.x, z: CAMPUS.spawn.z, face: CAMPUS.spawn.face, name: 'The Park' },
  museum: { x: -10, z: 0, face: -Math.PI / 2, name: 'The Museum' },
};
// the signpost by the big tree, and the walks it sends you on (along the paths, round the tree; the last point is the door)
export const SIGNPOST = { x: 29.6, z: 2.1 };   // just ahead of where you start, a little to the left: the first thing you see
export const SIGN_DEST = [
  { to: 'museum', label: 'THE MUSEUM', icon: '🏛', sub: 'The Blind Canvas Project gallery', route: [[27.5, -0.8], [19, 0], [7, 0], [-10, 0]] },
  { to: 'cinema', label: 'BLIND CAN CINEMA', icon: '🎬', sub: 'Films, all day', route: [[33, -5], [37, -6.5], [46, -6], [56, -1], [61, 0], [68, 0]] },
  { to: 'why', label: 'THE WHY HOUSE', icon: '?', sub: 'Stories · add your own', route: [[33, 5.5], [36.5, 9], [40, 14.5], [40, 21.6], [40, 23.6]] },
  { to: 'amb', label: 'ACADEMY OF MUSIC', icon: '🎹', sub: 'for the Blind', route: [[33, -5.5], [36.5, -9], [40, -14.5], [40, -21.4], [40, -23]] },
];

const tex = (w, h, draw, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
const fitText = (c, text, maxW, size, weight = 800, font = FONT, min = 10) => { let fs = size; c.font = `${weight} ${fs}px ${font}`; while (fs > min && c.measureText(text).width > maxW) { fs -= 2; c.font = `${weight} ${fs}px ${font}`; } return fs; };
function wrap(c, text, maxW) { const out = []; let line = ''; for (const w of String(text).split(/\s+/)) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }

export function buildCampus({ scene, wood, woodify, vids = [], resolveImg = u => u, lowEnd = false }) {
  const col = [], benches = [], screens = [], tickers = [], near = [];
  const root = new THREE.Group(); scene.add(root);
  // a box: world position, optional per-face materials [+x,-x,+y,-y,+z,-z]; solid ones go in the collision list
  const box = (w, h, d, m, x, y, z, solid = true, parent = root) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); if (solid) col.push(b); return b; };
  const plane = (w, h, m, x, y, z, ry = 0, parent = root) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; parent.add(p); return p; };
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const white = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
  const oak = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood);
  const loadInto = (mat, url, after) => { new THREE.TextureLoader().load(resolveImg(url), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true; after && after(t); }); };
  const img = (url, cb) => { const im = new Image(); im.onload = () => cb(im); im.src = resolveImg(url); return im; };

  // ============================================================ the WHY House (north)
  const why = (() => {
    const R = CAMPUS.why, cx = (R.x0 + R.x1) / 2, WH = 5.4, T = 0.3, DOOR = 3.4, DH = 3.6, RIDGE = 4.0;
    const W = R.x1 - R.x0, D = R.z1 - R.z0;
    // outside: warm cream clapboard; inside: gallery white
    const siding = (w, h) => new THREE.MeshLambertMaterial({ map: tex(256, 256, (c, cw, ch) => {
      c.fillStyle = '#efe4cf'; c.fillRect(0, 0, cw, ch);
      for (let y = 0; y < ch; y += 32) { const g = c.createLinearGradient(0, y, 0, y + 32); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,30,.35)'); c.fillStyle = g; c.fillRect(0, y, cw, 32); }
    }, [w / 2, h / 2]) });
    const inner = new THREE.MeshLambertMaterial({ color: 0xf3efe8 });
    // a wall from (x0,z0) to (x1,z1), y0..y1; ext = the face index that looks outside
    const wall = (x0, x1, z0, z1, y0, y1, ext) => {
      const w = x1 - x0, d = z1 - z0, h = y1 - y0, sm = siding(Math.max(w, d), h);
      const mats = [sm, sm, sm, sm, sm, sm]; mats[ext ^ 1] = inner;   // (+x/-x, +z/-z pairs: the other face of the pair is inside)
      return box(w, h, d, mats, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    };
    // floor, walls (a door in the middle of the front), ceiling
    box(W, 0.12, D, oak, cx, 0, (R.z0 + R.z1) / 2);
    wall(R.x0, cx - DOOR / 2, R.z0, R.z0 + T, 0, WH, 5); wall(cx + DOOR / 2, R.x1, R.z0, R.z0 + T, 0, WH, 5); wall(cx - DOOR / 2, cx + DOOR / 2, R.z0, R.z0 + T, DH, WH, 5);
    wall(R.x0, R.x1, R.z1 - T, R.z1, 0, WH, 4);
    wall(R.x0, R.x0 + T, R.z0, R.z1, 0, WH, 1); wall(R.x1 - T, R.x1, R.z0, R.z1, 0, WH, 0);
    box(W, 0.1, D, new THREE.MeshLambertMaterial({ color: 0xfbfaf7 }), cx, WH + 0.05, (R.z0 + R.z1) / 2, false);
    for (const x of [cx - 4.5, cx, cx + 4.5]) box(0.5, 0.04, D - 3, new THREE.MeshBasicMaterial({ color: 0xfff6e2 }), x, WH - 0.01, (R.z0 + R.z1) / 2, false);   // light strips
    // door frame: an ink portal with the red inner edge (the gallery's doorways)
    for (const s of [-1, 1]) { box(0.28, DH, 0.5, ink, cx + s * (DOOR / 2 + 0.14), DH / 2, R.z0 + 0.15, false); box(0.05, DH, 0.52, red, cx + s * (DOOR / 2 - 0.02), DH / 2, R.z0 + 0.15, false); }
    box(DOOR + 0.56, 0.28, 0.5, ink, cx, DH + 0.14, R.z0 + 0.15, false);
    // the gable roof: ridge running front to back, charcoal slates, a red ridge cap
    const roofM = new THREE.MeshLambertMaterial({ map: tex(128, 128, (c, w, h) => { c.fillStyle = '#2b2a29'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.06)'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 2); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 0 : 16; x < w; x += 32) c.fillRect(x, y, 2, 16); }, [6, 4]) });
    const half = W / 2 + 0.6, slope = Math.atan2(RIDGE, W / 2), len = Math.hypot(half, RIDGE * half / (W / 2));
    for (const s of [-1, 1]) { const r = box(len, 0.22, D + 1.2, roofM, cx + s * half / 2, WH + RIDGE / 2 - 0.25 + 0.15, (R.z0 + R.z1) / 2, false); r.rotation.z = s * -slope; }
    box(0.36, 0.2, D + 1.3, red, cx, WH + RIDGE + 0.06, (R.z0 + R.z1) / 2, false);
    // the gables: clapboard triangles, front and back, each with a round window and a big red "?"
    { const tri = new THREE.Shape(); tri.moveTo(-W / 2, 0); tri.lineTo(W / 2, 0); tri.lineTo(0, RIDGE); tri.closePath();
      const gm = siding(W, RIDGE); gm.side = THREE.DoubleSide;
      const qT = tex(256, 256, (c, w, h) => {
        const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, '#2e5fd8'); g.addColorStop(1, '#0d1f4f'); c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 14, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#1d1c1b'; c.lineWidth = 16; c.stroke();
        c.fillStyle = '#ec3013'; c.font = `800 190px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 10);
      });
      const qM = new THREE.MeshBasicMaterial({ map: qT, transparent: true });
      for (const [z, ry] of [[R.z0 - 0.01, Math.PI], [R.z1 + 0.01, 0]]) {
        const m = new THREE.Mesh(new THREE.ShapeGeometry(tri), gm); m.position.set(cx, WH, z); m.rotation.y = ry; root.add(m);
        plane(2.4, 2.4, qM, cx, WH + 1.65, z + (ry ? -0.02 : 0.02), ry);
      } }
    // porch: a cantilevered ink canopy over the door with a red edge, on two slim braces
    box(5.6, 0.18, 2.0, ink, cx, DH + 0.75, R.z0 - 1.0, false); box(5.6, 0.06, 0.04, red, cx, DH + 0.69, R.z0 - 2.0, false);
    for (const s of [-1, 1]) { const b = box(0.08, 1.4, 0.08, ink, cx + s * 2.4, DH + 0.2, R.z0 - 0.55, false); b.rotation.x = -0.75; }
    box(4.4, 0.12, 1.6, new THREE.MeshLambertMaterial({ color: 0xd8d2c8 }), cx, 0.06, R.z0 - 0.8, false);   // the porch step (flush, no trip)
    // the name: an ink plate over the porch
    const nameT = tex(1600, 240, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 18, h);
      c.fillStyle = '#ff9783'; c.font = `800 40px ${FONT}`; c.fillText('THE BLIND CANVAS PROJECT', 70, 72); c.fillStyle = '#fff'; fitText(c, 'THE WHY HOUSE', w - 120, 128); c.fillText('THE WHY HOUSE', 66, 196); });
    plane(6.4, 0.96, new THREE.MeshBasicMaterial({ map: nameT }), cx, DH + 1.4, R.z0 - 0.02, Math.PI);
    // windows either side of the door (lit warm from within)
    const winT = tex(128, 192, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe7b0'); g.addColorStop(1, '#f2b866'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8); c.fillRect(0, 0, 8, h); c.fillRect(w - 8, 0, 8, h); c.fillRect(w / 2 - 4, 0, 8, h); c.fillRect(0, h / 2 - 4, w, 8); });
    const winM = new THREE.MeshBasicMaterial({ map: winT });
    for (const x of [cx - 5.6, cx + 5.6]) plane(1.6, 2.4, winM, x, 2.2, R.z0 - 0.02, Math.PI);
    for (const z of [R.z0 + 4, R.z0 + 8, R.z0 + 12]) { plane(1.6, 2.4, winM, R.x0 - 0.02, 2.6, z, -Math.PI / 2); plane(1.6, 2.4, winM, R.x1 + 0.02, 2.6, z, Math.PI / 2); }
    for (const [w, d, x, z] of [[0.08, D, R.x0 - 0.04, (R.z0 + R.z1) / 2], [0.08, D, R.x1 + 0.04, (R.z0 + R.z1) / 2], [W, 0.08, cx, R.z1 + 0.04], [cx - DOOR / 2 - R.x0, 0.08, (R.x0 + cx - DOOR / 2) / 2, R.z0 - 0.04], [cx - DOOR / 2 - R.x0, 0.08, (R.x1 + cx + DOOR / 2) / 2, R.z0 - 0.04]]) box(w, 0.42, d, ink, x, 0.21, z, false);   // an ink plinth
    // inside: the header over the back wall, a rug, two benches facing the stories, the story stand by the door
    const headT = tex(2400, 180, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 12, w, 12);
      c.fillStyle = '#fff'; fitText(c, 'WHY DO YOU CREATE?  WHY DO YOU CARE?', w * 0.62, 84); c.fillText('WHY DO YOU CREATE?  WHY DO YOU CARE?', 50, 112);
      c.fillStyle = '#ff9783'; c.font = `700 40px ${FONT}`; c.textAlign = 'right'; c.fillText('Stories, art and voices from visitors like you', w - 50, 108); });
    plane(W - 1.2, 0.9, new THREE.MeshBasicMaterial({ map: headT }), cx, WH - 0.62, R.z1 - T - 0.02, Math.PI);
    const rug = plane(8, 6, new THREE.MeshLambertMaterial({ map: tex(512, 384, (c, w, h) => { c.fillStyle = '#7a1f22'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e9c98a'; c.lineWidth = 10; c.strokeRect(24, 24, w - 48, h - 48); c.lineWidth = 3; c.strokeRect(46, 46, w - 92, h - 92); c.fillStyle = 'rgba(233,201,138,.5)'; c.font = `800 140px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 8); }) }), cx, 0.065, R.z0 + 10.5);
    rug.rotation.set(-Math.PI / 2, 0, Math.PI);   // (the ? reads the right way up as you come in) rug.material.polygonOffset = true; rug.material.polygonOffsetFactor = -2;
    for (const x of [cx - 3.6, cx + 3.6]) { const b = makeBench(2.6); b.group.position.set(x, 0.06, R.z0 + 9.2); root.add(b.group); box(2.6, 0.55, 0.65, null, x, 0.33, R.z0 + 9.2).visible = false; benches.push({ x, z: R.z0 + 9.2, ry: 0, len: 2.6, dir: 1, name: 'Bench · facing the stories' }); }
    for (const x of [R.x0 + 1.1, R.x1 - 1.1]) { const p = makePlant(2.3); p.group.position.set(x, 0.06, R.z0 + 1.2); root.add(p.group); box(0.8, 1.6, 0.8, null, x, 0.8, R.z0 + 1.2).visible = false; }
    // the story stand: just inside the door, on your right as you come in, reading towards the door
    const standT = tex(1024, 720, (c, w, h) => { c.fillStyle = '#f9f8f6'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 14, h);
      c.fillStyle = '#ec3013'; c.font = `800 34px ${FONT}`; c.fillText('THE WHY HOUSE', 56, 86);
      c.fillStyle = '#1d1c1b'; c.font = `800 92px ${FONT}`; c.fillText('Add your story.', 52, 200);
      c.font = `500 38px ${FONT}`; c.fillStyle = '#3d4046'; ['Why do you create? Why do you care?', 'Write it, record it in your own voice,', 'and add a photo of you or your art.', 'It hangs here on these walls.'].forEach((l, i) => c.fillText(l, 56, 290 + i * 54));
      c.fillStyle = '#ec3013'; c.font = `800 36px ${FONT}`; c.fillText('WALK UP · TAP ADD YOUR STORY', 56, 620); });
    const stand = { x: cx + 3.2, z: R.z0 + 2.4 };
    { const g = new THREE.Group(); g.position.set(stand.x, 0.06, stand.z); g.rotation.y = Math.PI; root.add(g); lectern(g, ink, red, null, standT); box(0.8, 1.2, 0.6, null, stand.x, 0.6, stand.z).visible = false; }
    // the story slots: the back wall (5 x 2) and both side walls (4 x 2): world centre, facing direction, size
    const slots = [], CW = 2.7, CH = 1.66, rows = [3.35, 1.5];
    for (const y of rows) for (const i of [2, 1, 3, 0, 4]) slots.push({ p: [cx + (i - 2) * 3.3, y, R.z1 - T - 0.025], ry: Math.PI, w: CW, h: CH });
    for (const y of rows) for (const k of [3, 2, 1, 0]) { const z = R.z0 + 3.2 + k * 3.4;
      slots.push({ p: [R.x0 + T + 0.025, y, z], ry: Math.PI / 2, w: CW, h: CH }); slots.push({ p: [R.x1 - T - 0.025, y, z], ry: -Math.PI / 2, w: CW, h: CH }); }
    return { slots, station: { x: stand.x, z: stand.z, r: 2.2 }, rect: R, guestbook: { p: [cx - 3.4, R.z0 - 1.25], face: Math.PI } };
  })();

  // ============================================================ the Academy of Music for the Blind's outside (south)
  {
    const A = CAMPUS.amb, cx = (A.x0 + A.x1) / 2, H = 6.4;
    // the logo parapet over the door
    const parT = tex(2048, 300, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 14, w, 14);
      c.fillStyle = '#ff9783'; c.font = `800 34px ${FONT}`; c.fillText('THE BLIND CANVAS PROJECT  ·  LOS ANGELES', 560, 92);
      c.fillStyle = '#fff'; const fs = fitText(c, 'ACADEMY OF MUSIC FOR THE BLIND', w - 620, 104); c.fillText('ACADEMY OF MUSIC FOR THE BLIND', 556, 92 + fs + 22); });
    const parM = new THREE.MeshBasicMaterial({ map: parT });
    const par = box(A.x1 - A.x0 + 0.2, 3.0, 0.4, [ink, ink, ink, ink, parM, ink], cx, H + 1.6, A.z1 + 0.16, false);   // (its +z face looks out over the park)
    img('gallery/img/amb_logo_270127889.webp', im => { const c = parT.image.getContext('2d'); const k = Math.min(440 / im.width, 236 / im.height); c.drawImage(im, 60 + (440 - im.width * k) / 2, 24 + (236 - im.height * k) / 2, im.width * k, im.height * k); parT.needsUpdate = true; });
    // a piano-key frieze round the top of the walls, and an ink plinth
    const keysT = tex(512, 64, (c, w, h) => { c.fillStyle = '#f7f5f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; for (let i = 0; i <= 14; i++) c.fillRect(i * (w / 14) - 1, 0, 2, h); const blk = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]; for (const i of blk) c.fillRect((i + 0.68) * (w / 14), 0, (w / 14) * 0.64, h * 0.6); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 4); });
    const keys = (len, along) => { const t = keysT.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 3.6, 1); return new THREE.MeshLambertMaterial({ map: t }); };
    const L = A.z1 - A.z0, W = A.x1 - A.x0;
    box(0.08, 0.9, L, keys(L), A.x0 - 0.04, H - 0.6, (A.z0 + A.z1) / 2, false); box(0.08, 0.9, L, keys(L), A.x1 + 0.04, H - 0.6, (A.z0 + A.z1) / 2, false);
    box(W, 0.9, 0.08, keys(W), cx, H - 0.6, A.z0 - 0.04, false);
    for (const [w, d, x, z] of [[0.1, L, A.x0 - 0.05, (A.z0 + A.z1) / 2], [0.1, L, A.x1 + 0.05, (A.z0 + A.z1) / 2], [W, 0.1, cx, A.z0 - 0.05]]) box(w, 0.45, d, ink, x, 0.225, z, false);
    for (const s of [-1, 1]) { const p = makePlant(2.4); p.group.position.set(cx + s * 6.2, 0, A.z1 + 1.4); root.add(p.group); box(0.8, 1.6, 0.8, null, cx + s * 6.2, 0.8, A.z1 + 1.4).visible = false; }
  }

  // ============================================================ BLIND CAN CINEMA (east)
  const cinema = (() => {
    const C = CAMPUS.cinema, cz = (C.z0 + C.z1) / 2, H = 9, T = 0.4, W = C.z1 - C.z0, D = C.x1 - C.x0, ENT = 5.2, EH = 4.0, FX = C.x0;
    // materials: a cream terracotta front, red brick sides and back, red velvet and a starry ceiling inside
    const cream = new THREE.MeshLambertMaterial({ map: tex(256, 256, (c, w, h) => { c.fillStyle = '#eadbbf'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,90,50,.18)'; c.lineWidth = 2; for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let y = 0; y < h; y += 64) for (let x = (y / 64) % 2 ? 0 : 64; x < w; x += 128) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 64); c.stroke(); } }, [W / 4, H / 4]) });
    const brick = (len, h) => new THREE.MeshLambertMaterial({ map: tex(256, 256, (c, w, hh) => { c.fillStyle = '#7e3328'; c.fillRect(0, 0, w, hh); for (let y = 0; y < hh; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { c.fillStyle = `hsl(${8 + Math.random() * 8},${45 + Math.random() * 10}%,${27 + Math.random() * 8}%)`; c.fillRect(x + 1, y + 1, 30, 14); } }, [len / 2, h / 2]) });
    const velvet = new THREE.MeshLambertMaterial({ map: tex(128, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? '#5e151c' : '#8a222b'); c.fillStyle = g; c.fillRect(0, 0, w, h); }, [12, 1]) });
    const wallIn = new THREE.MeshLambertMaterial({ color: 0x4a1418 });
    const wall = (x0, x1, z0, z1, y0, y1, ext, extM, intM = wallIn) => { const mats = [extM, extM, extM, extM, extM, extM]; mats[ext ^ 1] = intM; return box(x1 - x0, y1 - y0, z1 - z0, mats, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); };
    // floor (a red carpet), walls, the front with its entrance, a starry ceiling
    const carpet = new THREE.MeshLambertMaterial({ map: tex(256, 256, (c, w, h) => { c.fillStyle = '#6b1a20'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8893c'; for (let y = 0; y < h; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < w; x += 64) { c.save(); c.translate(x + 16, y + 16); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore(); } }, [D / 3, W / 3]) });
    box(D, 0.12, W, carpet, (C.x0 + C.x1) / 2, 0, cz);
    wall(C.x1 - T, C.x1, C.z0, C.z1, 0, H, 0, brick(W, H));
    wall(C.x0, C.x1, C.z0, C.z0 + T, 0, H, 5, brick(D, H)); wall(C.x0, C.x1, C.z1 - T, C.z1, 0, H, 4, brick(D, H));
    wall(FX, FX + T, C.z0, cz - ENT / 2, 0, 11, 1, cream); wall(FX, FX + T, cz + ENT / 2, C.z1, 0, 11, 1, cream); wall(FX, FX + T, cz - ENT / 2, cz + ENT / 2, EH, 11, 1, cream);
    box(D, 0.2, W, [wallIn, wallIn, new THREE.MeshLambertMaterial({ color: 0x3a1a16 }), wallIn, wallIn, wallIn], (C.x0 + C.x1) / 2, H + 0.1, cz, false);   // the roof
    { const stars = plane(D - 0.8, W - 0.8, new THREE.MeshBasicMaterial({ map: tex(1024, 1024, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7); g.addColorStop(0, '#1b2a5a'); g.addColorStop(1, '#0a0f24'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { const r = Math.random() < 0.08 ? 2.6 : 1.2; c.fillStyle = `rgba(255,${240 + Math.random() * 15},${200 + Math.random() * 50},${0.5 + Math.random() * 0.5})`; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2); c.fill(); } }) }), (C.x0 + C.x1) / 2, H - 0.02, cz);
      stars.rotation.x = Math.PI / 2; }   // an "atmospheric" ceiling: the night sky of the old picture palaces
    // the screen, the curtains, the stage
    const SX = C.x1 - T - 0.06, VH = 6.4, VW = VH * 16 / 9, SY = 1.4 + VH / 2;
    box(0.04, VH + 0.5, VW + 0.5, ink, SX + 0.02, SY, cz, false);
    const posterMat = new THREE.MeshBasicMaterial({ color: 0x111111 }), dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.06, VH, VW), [dark, posterMat, dark, dark, dark, dark]); scr.position.set(SX - 0.03, SY, cz); root.add(scr);
    for (const s of [-1, 1]) { const cw = (W - T * 2 - VW) / 2 + 0.2; box(0.25, H - 0.3, cw, velvet, SX - 0.4, (H - 0.3) / 2, cz + s * (VW / 2 + cw / 2 - 0.2), false); }
    box(0.3, 1.1, W - T * 2, velvet, SX - 0.45, H - 0.75, cz, false);   // the valance
    box(0.06, 0.06, W - T * 2, new THREE.MeshBasicMaterial({ color: 0xe0b45a }), SX - 0.62, H - 1.32, cz, false);   // gold trim
    const stageM = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood);
    box(2.0, 0.5, W - T * 2, [ink, ink, stageM, ink, ink, ink], SX - 1.0 - 0.3, 0.25, cz);
    // seats: five rows, a centre aisle and two side aisles; sit on any row to watch (facing the screen)
    const ROWS = [77.6, 79.3, 81.0, 82.7, 84.4], BLOCK = [[C.z0 + T + 1.1, cz - 1.4], [cz + 1.4, C.z1 - T - 1.1]], SEAT = 0.58;
    const seats = [];
    for (const x of ROWS) for (const [z0, z1] of BLOCK) { const n = Math.floor((z1 - z0) / SEAT); for (let i = 0; i < n; i++) seats.push([x, z0 + SEAT / 2 + i * SEAT + ((z1 - z0) - n * SEAT) / 2]);
      box(0.75, 0.52, z1 - z0, null, x - 0.05, 0.32, (z0 + z1) / 2).visible = false; benches.push({ x, z: (z0 + z1) / 2, ry: Math.PI / 2, len: z1 - z0, dir: 1, top: 0.6, name: 'Cinema seat · watch the film' }); }
    { const seatRed = new THREE.MeshLambertMaterial({ color: 0xa3222c }), m4 = new THREE.Matrix4(), I = (geo, mat) => new THREE.InstancedMesh(geo, mat, seats.length);
      const cushion = I(new THREE.BoxGeometry(0.5, 0.14, 0.5).translate(0.02, 0.5, 0), seatRed), back = I(new THREE.BoxGeometry(0.12, 0.72, 0.5).translate(-0.24, 0.86, 0), seatRed), frame = I(new THREE.BoxGeometry(0.56, 0.5, 0.06).translate(-0.02, 0.25, 0.28), ink);
      seats.forEach(([x, z], i) => { m4.makeTranslation(x, 0.06, z); cushion.setMatrixAt(i, m4); back.setMatrixAt(i, m4); frame.setMatrixAt(i, m4); });
      root.add(cushion, back, frame); }
    // sconces down both walls, little aisle lights
    const sconceM = new THREE.MeshBasicMaterial({ color: 0xffd28a });
    for (let x = C.x0 + 3; x < C.x1 - 3; x += 3.2) for (const s of [-1, 1]) { const sc = box(0.5, 0.8, 0.12, sconceM, x, 4.2, cz + s * (W / 2 - T - 0.07), false); }
    for (const x of ROWS) for (const s of [-1, 1]) box(0.12, 0.06, 0.12, sconceM, x + 0.6, 0.1, cz + s * 1.25, false);
    // ---- the front: pilasters, a stepped tower with a sunburst, the marquee with chasing bulbs, poster cases, the ticket booth
    const gold = new THREE.MeshLambertMaterial({ color: 0xc9a14a });
    for (const z of [C.z0 + 0.4, cz - 6.4, cz + 6.4, C.z1 - 0.4]) { box(0.36, 11.6, 0.6, ink, FX - 0.18, 5.8, z, false); box(0.38, 11.6, 0.08, red, FX - 0.19, 5.8, z + (z < cz ? 0.34 : -0.34), false); }
    box(0.5, 2.6, 8.4, cream, FX + 0.1, 12.3, cz, false); box(0.52, 0.12, 8.6, ink, FX + 0.1, 13.66, cz, false); box(0.6, 0.18, W + 0.4, ink, FX + 0.1, 11.09, cz, false);
    const sun = plane(7.6, 2.4, new THREE.MeshBasicMaterial({ transparent: true, map: tex(1024, 320, (c, w, h) => { c.translate(w / 2, h + 10); for (let i = 0; i < 17; i++) { const a = Math.PI + (i + 0.5) / 17 * Math.PI; c.fillStyle = i % 2 ? '#c9a14a' : '#ec3013'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, h * 1.05, a - 0.07, a + 0.07); c.fill(); } c.fillStyle = '#1d1c1b'; c.beginPath(); c.arc(0, 0, 110, Math.PI, 0); c.fill(); c.fillStyle = '#f3e3b4'; c.font = '800 70px ' + FONT; c.textAlign = 'center'; c.fillText('★', 0, -26); }) }), FX - 0.16, 12.2, cz, -Math.PI / 2);
    // the marquee box
    const MZ = 14.4, MD = 2.9, MY0 = 4.35, MY1 = 5.95, MX = FX - MD;
    box(MD, MY1 - MY0, MZ, ink, FX - MD / 2, (MY0 + MY1) / 2, cz, false);
    box(MD - 0.1, 0.02, MZ - 0.1, new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), FX - MD / 2, MY0 - 0.012, cz, false);   // the glowing underside
    // its lightbox: NOW SHOWING + the title, in black marquee letters on white (redrawn when the film changes)
    const lb = { cv: document.createElement('canvas') }; lb.cv.width = 2048; lb.cv.height = 200; lb.t = new THREE.CanvasTexture(lb.cv); lb.t.colorSpace = THREE.SRGBColorSpace; lb.t.anisotropy = 8;
    plane(MZ - 0.5, (MY1 - MY0) - 0.36, new THREE.MeshBasicMaterial({ map: lb.t }), MX - 0.012, (MY0 + MY1) / 2, cz, -Math.PI / 2);
    const sideT = tex(512, 200, (c, w, h) => { c.fillStyle = '#fdf8ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; c.textAlign = 'center'; fitText(c, 'NOW SHOWING', w - 40, 88, 800, FONT); c.fillText('NOW SHOWING', w / 2, 132); });
    for (const s of [-1, 1]) plane(MD - 0.4, (MY1 - MY0) - 0.36, new THREE.MeshBasicMaterial({ map: sideT }), FX - MD / 2, (MY0 + MY1) / 2, cz + s * (MZ / 2 + 0.012), s > 0 ? 0 : Math.PI);
    // its crown: BLIND CAN CINEMA in red on ink, standing on the marquee
    const crownT = tex(2048, 300, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff3b1f'; c.shadowBlur = 28; c.fillStyle = '#ff4a2e'; fitText(c, 'BLIND CAN CINEMA', w - 120, 210, 800, FONT); c.fillText('BLIND CAN CINEMA', w / 2, h / 2 + 8); c.shadowBlur = 0; c.fillStyle = '#ffd9cf'; c.fillText('BLIND CAN CINEMA', w / 2, h / 2 + 8); });
    const CRH = 1.7, CRZ = MZ - 1.4;
    box(0.3, CRH + 0.2, CRZ + 0.2, ink, FX - MD + 0.75, MY1 + (CRH + 0.2) / 2, cz, false);
    plane(CRZ, CRH, new THREE.MeshBasicMaterial({ map: crownT }), FX - MD + 0.59, MY1 + 0.1 + CRH / 2, cz, -Math.PI / 2);
    // bulbs: round the crown and along the marquee's front and sides, chasing
    const bulbPts = [];
    { const N = 46; for (let i = 0; i < N; i++) bulbPts.push([MX - 0.06, MY0 + 0.1, cz - MZ / 2 + (i + 0.5) * MZ / N]);
      for (const s of [-1, 1]) for (let i = 0; i < 9; i++) bulbPts.push([MX + (i + 0.5) * MD / 9, MY0 + 0.1, cz + s * (MZ / 2 + 0.06)]);
      const cx0 = FX - MD + 0.56, y0 = MY1 + 0.15, y1 = MY1 + CRH + 0.05, z0 = cz - CRZ / 2 - 0.05, z1 = cz + CRZ / 2 + 0.05;
      for (let i = 0; i <= 40; i++) bulbPts.push([cx0, y1, z0 + (z1 - z0) * i / 40]);
      for (let i = 1; i < 6; i++) { bulbPts.push([cx0, y1 - (y1 - y0) * i / 6, z1]); bulbPts.push([cx0, y1 - (y1 - y0) * i / 6, z0]); } }
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbPts.length);
    { const m4 = new THREE.Matrix4(); bulbPts.forEach((p, i) => { m4.makeTranslation(...p); bulbs.setMatrixAt(i, m4); bulbs.setColorAt(i, new THREE.Color(0xffd27a)); }); root.add(bulbs); }
    const on = new THREE.Color(0xfff1c4), off = new THREE.Color(0x8a5a22); let chase = 0, chaseT = 0;
    tickers.push(dt => { chaseT += dt; if (chaseT < 0.14) return; chaseT = 0; chase = (chase + 1) % 3; for (let i = 0; i < bulbPts.length; i++) bulbs.setColorAt(i, (i % 3) === chase ? off : on); bulbs.instanceColor.needsUpdate = true; });
    // the entrance: red doors swung open, a red carpet out front
    for (const s of [-1, 1]) { const dw = ENT / 2 - 0.1; box(0.08, EH - 0.2, dw, new THREE.MeshLambertMaterial({ color: 0x8e1c24 }), FX + T + 0.06, (EH - 0.2) / 2, cz + s * (ENT / 2 + dw / 2), false); box(0.1, 0.08, 0.5, gold, FX + T + 0.12, 1.2, cz + s * (ENT / 2 + 0.4), false); }   // folded back against the wall inside
    const runner = plane(5.5, 3.0, new THREE.MeshLambertMaterial({ color: 0xa3222c }), FX - 2.75, 0.03, cz); runner.rotation.x = -Math.PI / 2; runner.material.polygonOffset = true; runner.material.polygonOffsetFactor = -2;
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const px = FX - 1 - i * 1.8, pz = cz + s * 2.1; box(0.1, 0.95, 0.1, gold, px, 0.475, pz, false); const k = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), gold); k.position.set(px, 1.0, pz); root.add(k); }
    { const rope = new THREE.MeshLambertMaterial({ color: 0x8e1c24 }); for (const s of [-1, 1]) box(3.6, 0.06, 0.06, rope, FX - 2.8, 0.82, cz + s * 2.1, false); }
    // poster cases: this film on the left, the next on the right
    const posters = [];
    for (const s of [-1, 1]) { const pz = cz + s * 8.6;
      box(0.2, 3.4, 2.5, ink, FX - 0.1, 2.4, pz, false); box(0.22, 0.06, 2.5, gold, FX - 0.11, 4.13, pz, false); box(0.22, 0.06, 2.5, gold, FX - 0.11, 0.67, pz, false);
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 768; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      plane(2.2, 3.1, new THREE.MeshBasicMaterial({ map: t }), FX - 0.21, 2.4, pz, -Math.PI / 2); posters.push({ cv, t }); }
    // the ticket booth: to the left of the doors, glass all round, a little dome, TICKETS
    { const bx = FX - 1.0, bz = cz - 4.0;
      box(1.5, 1.0, 1.5, gold, bx, 0.5, bz); const gl = box(1.4, 1.5, 1.4, new THREE.MeshLambertMaterial({ color: 0xbfe6ef, transparent: true, opacity: 0.35 }), bx, 1.75, bz, false);
      box(1.56, 0.12, 1.56, ink, bx, 2.55, bz, false); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.78, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xa3222c })); dome.position.set(bx, 2.6, bz); root.add(dome);
      plane(1.2, 0.34, new THREE.MeshBasicMaterial({ map: tex(512, 140, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.font = `800 92px ${FONT}`; c.fillText('TICKETS', w / 2, 104); }) }), bx - 0.79, 2.32, bz, -Math.PI / 2);
      const p = makePlant(2.2); p.group.position.set(FX - 1.0, 0, cz + 4.2); root.add(p.group); box(0.8, 1.6, 0.8, null, FX - 1.0, 0.8, cz + 4.2).visible = false; }
    // the programme: one film after another
    const prog = CINEMA_PROGRAM.map(f => { const v = vids.find(v => (v.local || '').endsWith('/' + f.file + '.mp4')); return { ...f, u: v ? v.u : 'gallery/video/' + f.file + '.mp4', local: 'gallery/video/' + f.file + '.mp4', poster: 'gallery/img2/cinema_' + f.file + '.webp', im: null }; });
    prog.forEach(p => { p.im = img(p.poster, () => draw()); });
    let cur = 0;
    const screen = { u: prog[0].u, local: prog[0].local, box: scr, faces: [1], posterMat, vol: 0.9, dist: 30, reach: 40, minVol: 0.05, p: [SX, SY, cz], zone: new THREE.Box3(new THREE.Vector3(C.x0 + 0.2, -1, C.z0), new THREE.Vector3(C.x1, H + 1.5, C.z1)), cinema: true };
    screens.push(screen);
    function poster(P, f, label) {
      const c = P.cv.getContext('2d'), w = P.cv.width, h = P.cv.height; c.fillStyle = '#1a0d10'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a14a'; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
      c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.font = `800 34px ${FONT}`; c.fillText(label, w / 2, 84);
      const im = f.im; if (im && im.complete && im.naturalWidth) { const iw = w - 70, ih = Math.min(330, iw * im.naturalHeight / im.naturalWidth); c.drawImage(im, 35, 120, iw, ih); }
      let fs = 54, L; do { c.font = `800 ${fs}px ${FONT}`; L = wrap(c, f.title, w - 80); fs -= 4; } while (L.length > 3 && fs > 30);
      c.fillStyle = '#fff'; L.slice(0, 3).forEach((l, i) => c.fillText(l, w / 2, 530 + i * (fs + 12)));
      c.fillStyle = '#e8d9b8'; c.font = `500 26px ${FONT}`; c.fillText(f.kicker || '', w / 2, 500);
      c.fillStyle = '#ec3013'; c.font = `800 28px ${FONT}`; c.fillText('BLIND CAN CINEMA', w / 2, h - 50); P.t.needsUpdate = true;
    }
    function draw() {
      const f = prog[cur], c = lb.cv.getContext('2d'), w = lb.cv.width, h = lb.cv.height;
      c.fillStyle = '#fdf8ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; c.textAlign = 'center';
      c.font = `800 40px ${FONT}`; c.fillText('NOW SHOWING  ·  ' + (f.kicker || '').toUpperCase(), w / 2, 56);
      fitText(c, f.title.toUpperCase(), w - 120, 108); c.fillText(f.title.toUpperCase(), w / 2, 168); lb.t.needsUpdate = true;
      poster(posters[0], f, 'NOW SHOWING'); poster(posters[1], prog[(cur + 1) % prog.length], 'COMING UP NEXT');
      if (f.im && f.im.complete) { const t = new THREE.Texture(f.im); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; if (posterMat.map) posterMat.map.dispose(); posterMat.map = t; posterMat.color.set(0xffffff); posterMat.needsUpdate = true; }
    }
    draw();
    function next() { cur = (cur + 1) % prog.length; screen.u = prog[cur].u; screen.local = prog[cur].local; draw(); return screen.u; }
    return { screen, next, now: () => prog[cur], rect: C };
  })();

  // ============================================================ back in the museum: the AMB room's old doorway, the Wall of Why's pointer
  const boardT = (kicker, title, lines, cta) => tex(1024, 768, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 16);
    c.fillStyle = '#ff9783'; c.font = `800 36px ${FONT}`; c.fillText(kicker, 60, 100);
    c.fillStyle = '#fff'; c.font = `800 82px ${FONT}`; let y = 200; for (const l of title) { fitText(c, l, w - 120, 82); c.fillText(l, 58, y); y += 88; }
    c.font = `500 36px ${FONT}`; c.fillStyle = '#e9e5e5'; y += 20; for (const l of lines) { c.fillText(l, 60, y); y += 48; }
    c.fillStyle = '#ec3013'; c.fillRect(60, h - 120, w - 120, 76); c.fillStyle = '#fff'; c.font = `800 38px ${FONT}`; c.textAlign = 'center'; c.fillText(cta, w / 2, h - 70); });
  const gotos = [];
  {   // the AMB doorway at the north end of the Wall of Why hallway: closed now, with a sign
    const y0 = -3.14, z = -27.85, x = -70.25;
    box(8.6, 7.2, 0.4, new THREE.MeshLambertMaterial({ color: 0xeceae6 }), x, y0 + 3.6, z);
    plane(4.6, 3.45, new THREE.MeshBasicMaterial({ map: boardT('THE ACADEMY HAS MOVED', ['Academy of Music', 'for the Blind'], ['Its film, its students and their music', 'have a building of their own now,', 'out in the cherry blossom park.'], 'TAP TO GO THERE  →') }), x, y0 + 2.3, z + 0.21, 0);
    gotos.push({ x, y: y0, z: z + 1.6, r: 3.2, to: 'amb', label: 'Academy of Music for the Blind · in the park' });
  }
  {   // the Wall of Why: a board on the low east wall across from the portraits
    const y0 = -3.14, x = -66.3, z = 14.5;
    box(0.12, 2.9, 3.6, ink, x, y0 + 1.45 + 0.6, z, false); box(0.14, 0.07, 3.62, red, x, y0 + 3.55, z, false);
    plane(3.4, 2.55, new THREE.MeshBasicMaterial({ map: boardT('THE WALL OF WHY', ['Add your own why'], ['Write it, say it in your own voice, add', 'a photo of you or your art. It hangs on', 'the walls of the WHY House, in the park.'], 'TAP TO GO TO THE WHY HOUSE  →') }), x - 0.07, y0 + 2.05, z, -Math.PI / 2);
    gotos.push({ x: x - 1.6, y: y0, z, r: 3.0, to: 'why', label: 'The WHY House · leave your own why' });
  }
  near.push(pl => { for (const g of gotos) if (Math.hypot(pl.x - g.x, pl.z - g.z) < g.r && Math.abs(pl.y - g.y) < 2.2) return { kind: 'goto', item: { z: g.to.length, to: g.to }, label: g.label }; return null; });

  // ============================================================ the Academy's grand piano (play it: gallery-piano.js)
  // In the middle of the AMB building, between the visitors' bench and the film wall: you sit with your back to the door and play
  // towards the screen. Gloss-black case with the lid propped open, 5 octaves of keys (C2-C7) that dip as notes play, a bench.
  const piano = (() => {
    const PX = 40, PZ = -46.6, Y0 = 0.06, g = new THREE.Group(); g.position.set(PX, Y0, PZ); root.add(g);
    const gloss = new THREE.MeshPhongMaterial({ color: 0x0d0d0f, specular: 0x5a5a66, shininess: 90 }), innerM = new THREE.MeshLambertMaterial({ color: 0x8a6a3a }), brass = new THREE.MeshLambertMaterial({ color: 0xc9a14a });
    // the case outline seen from above (x across, y = -z towards the tail): the straight bass side on the left, the curved treble side on the right
    const S = new THREE.Shape(); S.moveTo(-0.76, 0); S.lineTo(0.76, 0); S.lineTo(0.76, 0.55);
    S.bezierCurveTo(0.76, 1.0, 0.2, 1.05, 0.12, 1.45); S.bezierCurveTo(0.05, 1.8, -0.1, 2.05, -0.45, 2.05); S.bezierCurveTo(-0.7, 2.05, -0.76, 1.95, -0.76, 1.8); S.closePath();
    const caseGeo = new THREE.ExtrudeGeometry(S, { depth: 0.32, bevelEnabled: false, curveSegments: 14 }); caseGeo.rotateX(-Math.PI / 2); caseGeo.translate(0, 0.68, 0);   // (shape y -> -z; the case from 0.68 to 1.0 m)
    const body = new THREE.Mesh(caseGeo, gloss); body.position.z = -0.05; g.add(body);
    const sound = new THREE.Mesh(new THREE.ShapeGeometry(S, 14), innerM); sound.rotation.x = -Math.PI / 2; sound.position.set(0, 0.985, -0.05); sound.scale.set(0.96, 0.96, 1); g.add(sound);   // the soundboard
    // the lid, hinged on the straight side, propped open
    const lidPivot = new THREE.Group(); lidPivot.position.set(-0.76, 1.0, -0.05); lidPivot.rotation.z = 0.62; g.add(lidPivot);
    const lid = new THREE.Mesh(new THREE.ShapeGeometry(S, 14), new THREE.MeshPhongMaterial({ color: 0x0d0d0f, specular: 0x5a5a66, shininess: 90, side: THREE.DoubleSide })); lid.rotation.x = -Math.PI / 2; lid.position.set(0.76, 0.012, 0); lidPivot.add(lid);
    const prop = box(0.025, 0.95, 0.025, brass, 0, 0, 0, false, g); prop.position.set(0.55, 1.4, -0.9); prop.rotation.z = 0.35;
    // legs (with brass castors), the lyre and pedals
    for (const [x, z] of [[-0.66, -0.15], [0.66, -0.15], [-0.5, -1.85]]) { box(0.12, 0.68, 0.12, gloss, x, 0.34, z, false, g); const c = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), brass); c.position.set(x, 0.04, z); g.add(c); }
    box(0.22, 0.6, 0.04, gloss, 0, 0.32, -0.2, false, g); for (const x of [-0.06, 0, 0.06]) box(0.035, 0.02, 0.12, brass, x, 0.05, -0.12, false, g);
    // the keyboard: key bed, cheek blocks, fallboard and music desk
    const KW = 1.42, WN = 36, ww = KW / WN, kz = 0.11;
    box(KW + 0.12, 0.09, 0.3, gloss, 0, 0.66, kz - 0.05, false, g);
    for (const x of [-(KW / 2 + 0.035), KW / 2 + 0.035]) box(0.07, 0.13, 0.3, gloss, x, 0.75, kz - 0.05, false, g);
    box(KW, 0.11, 0.04, gloss, 0, 0.8, -0.04, false, g);
    const desk = box(0.95, 0.3, 0.025, gloss, 0, 1.13, -0.12, false, g); desk.rotation.x = -0.25;
    const sheet = plane(0.42, 0.28, new THREE.MeshBasicMaterial({ map: tex(256, 176, (c, w, h) => { c.fillStyle = '#f6f1e4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a3a3a'; c.lineWidth = 1.2; for (let st = 0; st < 3; st++) for (let l = 0; l < 5; l++) { const y = 26 + st * 50 + l * 5; c.beginPath(); c.moveTo(14, y); c.lineTo(w - 14, y); c.stroke(); } c.fillStyle = '#222'; for (let i = 0; i < 26; i++) { c.beginPath(); c.ellipse(24 + i * 8.6, 22 + (i % 3) * 50 + ((i * 7) % 9), 2.6, 2, -0.4, 0, 6.3); c.fill(); } }) }), 0, 1.14, -0.105, 0, g);
    sheet.rotation.x = -0.25;
    // keys: instanced, so each one can dip when it's played (white C2..C7, then the black ones)
    const isBlack = m => [1, 3, 6, 8, 10].includes(m % 12), keys = new Map(), wK = [], bK = [];
    let wi = 0; for (let m = 36; m <= 96; m++) { if (isBlack(m)) bK.push([m, -KW / 2 + wi * ww]); else { wK.push([m, -KW / 2 + (wi + 0.5) * ww]); wi++; } }
    const whiteIM = new THREE.InstancedMesh(new THREE.BoxGeometry(ww * 0.92, 0.022, 0.15), new THREE.MeshLambertMaterial({ color: 0xf6f3ea }), wK.length);
    const blackIM = new THREE.InstancedMesh(new THREE.BoxGeometry(ww * 0.58, 0.03, 0.095), new THREE.MeshLambertMaterial({ color: 0x141414 }), bK.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), X = new THREE.Vector3(1, 0, 0);
    const place = (im, i, x, y, z, dip) => { q.setFromAxisAngle(X, dip ? 0.06 : 0); m4.compose(new THREE.Vector3(x, y - (dip ? 0.008 : 0), z), q, one); im.setMatrixAt(i, m4); im.instanceMatrix.needsUpdate = true; };
    wK.forEach(([m, x], i) => { keys.set(m, { im: whiteIM, i, x, y: 0.72, z: kz + 0.02 }); place(whiteIM, i, x, 0.72, kz + 0.02, false); });
    bK.forEach(([m, x], i) => { keys.set(m, { im: blackIM, i, x, y: 0.745, z: kz - 0.02 }); place(blackIM, i, x, 0.745, kz - 0.02, false); });
    g.add(whiteIM, blackIM);
    // the bench (sit and play), a little brass name plate
    const benchM = new THREE.MeshPhongMaterial({ color: 0x111113, specular: 0x444444, shininess: 60 }), cush = new THREE.MeshLambertMaterial({ color: 0x2a2a2e });
    box(0.92, 0.07, 0.36, benchM, 0, 0.47, 0.72, false, g); box(0.88, 0.04, 0.32, cush, 0, 0.525, 0.72, false, g);
    for (const x of [-0.4, 0.4]) for (const z of [0.58, 0.86]) box(0.05, 0.46, 0.05, benchM, x, 0.23, z, false, g);
    plane(0.2, 0.035, new THREE.MeshBasicMaterial({ map: tex(256, 44, (c, w, h) => { c.fillStyle = '#c9a14a'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2010'; c.font = `800 26px ${FONT}`; c.textAlign = 'center'; c.fillText('AMB', w / 2, 32); }) }), 0, 0.8, -0.018, 0, g);
    // solid: the case (and the bench, low, so you can step up to it)
    box(1.55, 1.0, 2.05, null, PX, Y0 + 0.5, PZ - 1.0).visible = false;
    const bench = { x: PX, z: PZ + 0.72, ry: 0, len: 0.9, dir: -1, top: Y0 + 0.55, name: 'Piano bench' };
    benches.push(bench);
    near.push(pl => Math.hypot(pl.x - PX, pl.z - (PZ + 0.9)) < 2.4 && Math.abs(pl.y - Y0) < 1.5 ? { kind: 'piano', item: { z: 3 }, label: 'Grand piano · play it' } : null);
    return { x: PX, y: Y0 + 1.0, z: PZ - 0.8, bench, press(m, down) { const k = keys.get(m); if (k) place(k.im, k.i, k.x, k.y, k.z, down); } };
  })();

  // ============================================================ the signpost by the big tree: an oak post with an arrow for each place
  {
    const P = SIGNPOST, g = new THREE.Group(); g.position.set(P.x, 0, P.z); root.add(g);
    const oakM = new THREE.MeshLambertMaterial({ color: 0x9a6a3c }), capM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
    box(0.22, 3.6, 0.22, oakM, 0, 1.8, 0, false, g); box(0.34, 0.12, 0.34, capM, 0, 3.66, 0, false, g); box(0.5, 0.18, 0.5, capM, 0, 0.09, 0, false, g);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), red); ball.position.y = 3.83; g.add(ball);
    box(0.5, 2, 0.5, null, P.x, 1, P.z).visible = false;
    // each arrow points at its place (as the crow flies from the post), names on both faces
    const arrowShape = (L, H) => { const s = new THREE.Shape(); s.moveTo(0, -H / 2); s.lineTo(L - H * 0.55, -H / 2); s.lineTo(L, 0); s.lineTo(L - H * 0.55, H / 2); s.lineTo(0, H / 2); s.closePath(); return s; };
    const L = 2.1, AH = 0.44;
    SIGN_DEST.forEach((D, i) => {
      const end = D.route[D.route.length - 1], ang = Math.atan2(end[0] - P.x, end[1] - P.z);   // the direction to the door
      const arm = new THREE.Group(); arm.position.y = 3.1 - i * 0.56; arm.rotation.y = ang - Math.PI / 2; g.add(arm);
      const geo = new THREE.ExtrudeGeometry(arrowShape(L, AH), { depth: 0.06, bevelEnabled: false }); geo.translate(0.08, 0, -0.03);
      const face = tex(1024, 214, (c, w, h) => { c.fillStyle = '#f4ead6'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10);
        c.textBaseline = 'middle'; c.fillStyle = '#ec3013'; c.font = `800 96px ${FONT}`; c.fillText(D.icon, 26, h / 2 + 4); c.fillStyle = '#1d1c1b'; fitText(c, D.label, w - 340, 92); c.fillText(D.label, 150, h / 2 + 4); });
      const mats = [new THREE.MeshLambertMaterial({ color: 0xf4ead6 }), new THREE.MeshLambertMaterial({ color: 0x1d1c1b })];
      const m = new THREE.Mesh(geo, mats); arm.add(m);
      // the name, as a plane on each face (reads left to right from both sides)
      for (const side of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(L - AH * 0.6, AH - 0.04), new THREE.MeshBasicMaterial({ map: face }));
        pl.position.set(0.08 + (L - AH * 0.6) / 2, 0, side * 0.035); if (side < 0) pl.rotation.y = Math.PI; arm.add(pl); }
    });
    near.push(pl => Math.hypot(pl.x - P.x, pl.z - P.z) < 2.6 && Math.abs(pl.y) < 2 ? { kind: 'signpost', item: { z: 1 }, label: 'Signpost · where to?' } : null);
  }

  // which part of the campus you're in (for the place label)
  const inR = (x, z, R) => x > R.x0 && x < R.x1 && z > R.z0 && z < R.z1;
  const zoneAt = (x, y, z) => {
    if (y < -1.5 || y > 12) return null;
    if (inR(x, z, CAMPUS.why)) return 'why';
    if (inR(x, z, CAMPUS.amb)) return 'amb';
    if (inR(x, z, CAMPUS.cinema)) return 'cinema';
    if (x > 7.4) return 'park';
    return null;
  };
  root.updateMatrixWorld(true);
  return { group: root, col, benches, screens, near, why, cinema, piano, zoneAt, tick: dt => tickers.forEach(f => f(dt)) };
}
