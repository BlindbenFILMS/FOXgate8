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
import { lean } from './gallery-texmem.js';
import { CAMPUS, RING } from './gallery-garden-plan.js';
import { lectern } from './gallery-remodel.js';
import { makePlant, makeBench } from './gallery-props.js';
import { buildAmbPolish, AMB_FLOOR } from './gallery-amb.js';

const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
const DECO = '"Limelight", "Poiret One", Archivo, Arimo, Helvetica, Arial, sans-serif';
// what's on at BLIND CAN CINEMA: one film, shown at fixed SHOWTIMES so everyone watches together. A show starts every `every`
// minutes on the clock (:00, :15, :30, :45 — the same moment for every visitor, wherever they are); between shows the screen and
// the marquee count down to the next one. Everyone in the cinema sees the same frame (the film is locked to the clock).
// (Ben, 29 Oct) Screen 1 (the left theatre as you face the doors, under the SURFING poster): SURFING FOR VISION, about 30 min,
// a show every 45 minutes so there's a break between (the festival film it replaced is gone from the cinema)
export const CINEMA_SHOW = { file: 'surfing_for_vision', hls: true, title: 'Surfing For Vision', kicker: 'A film by Ben Fox', len: 1814.2, every: 45 };   // (29 Oct) kept as 10-second pieces in gallery/video/surfing_for_vision/ (one 62 MB file was too big to copy across)
// Screen 2 (22 Oct): its own film on its own showtimes: Blind CAN's White Cane commercial (one minute, every two minutes)
// (Ben, 27 Oct) WHAT IS GOALBALL? replaces the White Cane commercial (len is corrected from the video once it loads)
export const CINEMA_SHOW2 = { file: 'goalball', title: 'What Is Goalball?', kicker: 'A Ben Fox film', len: 300, every: 8 };
export const CINEMA_PROGRAM = [CINEMA_SHOW, CINEMA_SHOW2];
export function showtime(nowMs = Date.now(), F = CINEMA_SHOW) {   // { on, t (seconds into the film), start, next (ms of the next show), nextIn (s) }
  const P = F.every * 60, s = nowMs / 1000, t = s % P, start = (s - t) * 1000, next = start + P * 1000;
  return t < F.len ? { on: true, t, start, next, nextIn: (next - nowMs) / 1000 } : { on: false, t: 0, start, next, nextIn: (next - nowMs) / 1000 };
}
const hhmm = ms => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
// where "take me there" lands you: just outside each door, facing it
export const CAMPUS_STOPS = {
  why: { x: 40, z: 21.6, face: 0, name: 'The WHY House' },
  amb: { x: 40, z: -21.4, face: Math.PI, name: 'Academy of Music for the Blind' },
  cinema: { x: 67.5, z: 0, face: Math.PI / 2, name: 'BLIND CAN Cinema' },
  park: { x: CAMPUS.parkStop.x, z: CAMPUS.parkStop.z, face: CAMPUS.parkStop.face, name: 'The Park' },
  museum: { x: -10, z: 0, face: -Math.PI / 2, name: 'The Museum' },
  chess: { x: -5.6, z: 50.2, face: 0, name: 'Talking Chess' },   // (28 Oct, Ben) the end of the walk north of the WHY House
  paint: { x: -5.4, z: -49.6, face: -2.36, name: 'Paint Together' },   // (28 Oct, Ben) the end of the walk north of the Academy of Music
};
// the signpost by the big tree, and the walks it sends you on (along the paths, round the tree; the last point is the door)
export const SIGNPOST = { x: 29.6, z: 2.1 };   // just ahead of where you start, a little to the left: the first thing you see
export const SIGN_DEST = [
  { to: 'museum', label: 'THE MUSEUM', icon: '🏛', sub: 'The Blind Canvas Project gallery', route: [[27.5, -0.8], [19, 0], [7, 0], [-10, 0]] },
  { to: 'cinema', label: 'BLIND CAN CINEMA', icon: '🎬', sub: 'Films, all day', route: [[33, -5], [37, -6.5], [46, -6], [56, -1], [61, 0], [68, 0]] },
  { to: 'why', label: 'THE WHY HOUSE', icon: '?', sub: 'Stories · add your own', route: [[33, 5.5], [36.5, 9], [40, 14.5], [40, 21.6], [40, 23.6]] },
  { to: 'amb', label: 'ACADEMY OF MUSIC', icon: '🎹', sub: 'for the Blind', route: [[33, -5.5], [36.5, -9], [40, -14.5], [40, -21.4], [40, -23]] },
  { to: 'chess', label: 'TALKING CHESS', icon: '♞', sub: 'Two tables at the end of the walk', route: [[33, 5.5], [30, 13], [29.5, 18.2], [25, 27], [18, 40], [8, 46], [-5.6, 50.2]] },
  { to: 'paint', label: 'PAINT TOGETHER', icon: '🖌', sub: 'A big shared canvas', route: [[33, -5.5], [30, -13], [29.5, -18.2], [25, -27], [18, -40], [8, -46], [-5.4, -49.6]] },
];

const texLive = (w, h, draw, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };   // (one that's drawn on again later)
const tex = (w, h, draw, rep) => lean(texLive(w, h, draw, rep));   // (drawn once: its canvas is let go after upload, gallery-texmem.js)
const fitText = (c, text, maxW, size, weight = 800, font = FONT, min = 10) => { let fs = size; c.font = `${weight} ${fs}px ${font}`; while (fs > min && c.measureText(text).width > maxW) { fs -= 2; c.font = `${weight} ${fs}px ${font}`; } return fs; };
function wrap(c, text, maxW) { const out = []; let line = ''; for (const w of String(text).split(/\s+/)) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }

export function buildCampus({ scene, wood, woodify, vids = [], resolveImg = u => u, lowEnd = false, camera: cam = null, sky = null }) {
  const col = [], benches = [], screens = [], tickers = [], near = [];
  const root = new THREE.Group(); scene.add(root);
  const inside = [];   // (22 Oct) [object, rect]: drawn only while the camera is inside that building (their many small moving parts cost draws)
  // a box: world position, optional per-face materials [+x,-x,+y,-y,+z,-z]; solid ones go in the collision list
  const box = (w, h, d, m, x, y, z, solid = true, parent = root) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); if (solid) col.push(b); return b; };
  const plane = (w, h, m, x, y, z, ry = 0, parent = root) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; parent.add(p); return p; };
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const white = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
  const oak = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood);
  const loadInto = (mat, url, after) => { new THREE.TextureLoader().load(resolveImg(url), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true; after && after(t); }); };
  const img = (url, cb) => { const im = new Image(); im.onload = () => cb(im); im.src = resolveImg(url); return im; };
  // (22 Oct) a floor rug or inlay carrying the Blind Canvas Project logo, tinted to suit: drawBg paints the cloth, then the logo is
  // laid on at (lx, ly, size) in canvas pixels once it loads; the canvas is let go after that upload (gallery-texmem.js)
  const LOGO_URL = 'gallery/img/bcp_logo_white.webp', logoWait = [];
  const logoIm = img(LOGO_URL, () => { logoWait.splice(0).forEach(f => f()); });
  const tinted = (im, col) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; };
  const logoRug = (pw, ph, cw, ch, drawBg, logos, x, y, z, rz = 0, solidM = false) => {
    const t = texLive(cw, ch, drawBg);
    const put = () => { const c = t.image.getContext('2d'); for (const [lx, ly, size, col, alpha = 1, rot = 0] of logos) { const tl = tinted(logoIm, col), k = size / Math.max(tl.width, tl.height); c.save(); c.globalAlpha = alpha; c.translate(lx, ly); c.rotate(rot); c.drawImage(tl, -tl.width * k / 2, -tl.height * k / 2, tl.width * k, tl.height * k); c.restore(); } t.needsUpdate = true; lean(t); };
    if (logoIm.complete && logoIm.naturalWidth) put(); else logoWait.push(put);
    const m = new THREE.MeshLambertMaterial({ map: t }); m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2;
    const r = plane(pw, ph, m, x, y, z); r.rotation.set(-Math.PI / 2, 0, rz); return r;
  };
  const rugEdge = (c, w, h, base, line) => { c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = line; c.lineWidth = Math.max(6, w / 50); c.strokeRect(w * 0.045, h * 0.06, w * 0.91, h * 0.88); c.lineWidth = Math.max(2, w / 170); c.strokeRect(w * 0.09, h * 0.12, w * 0.82, h * 0.76); };

  // ============================================================ the WHY House (north)
  const why = (() => {
    const R = CAMPUS.why, cx = (R.x0 + R.x1) / 2, WH = 6.0, T = 0.3, DOOR = 3.4, DH = 3.6, RIDGE = 4.0;   // (28 Oct: taller, for the high windows over the stories)
    const W = R.x1 - R.x0, D = R.z1 - R.z0;
    // outside: warm cream clapboard; inside: gallery white
    // (28 Oct) ONE clapboard texture for every wall piece: each box's UVs are scaled to its size in metres (a board every 0.25 m)
    const sideT = texLive(256, 256, (c, cw, ch) => {
      c.fillStyle = '#efe4cf'; c.fillRect(0, 0, cw, ch);
      for (let y = 0; y < ch; y += 32) { const g = c.createLinearGradient(0, y, 0, y + 32); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,30,.35)'); c.fillStyle = g; c.fillRect(0, y, cw, 32); }
    }); sideT.wrapS = sideT.wrapT = THREE.RepeatWrapping;
    const sideM = new THREE.MeshLambertMaterial({ map: sideT });
    const inner = new THREE.MeshLambertMaterial({ color: 0xf3efe8 });
    const metreUV = (geo, w, h, d) => { const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
      for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / 2, uv.getY(i) * dims[f][1] / 2); } uv.needsUpdate = true; };
    // a wall from (x0,z0) to (x1,z1), y0..y1; ext = the face index that looks outside
    const wall = (x0, x1, z0, z1, y0, y1, ext) => {
      const w = x1 - x0, d = z1 - z0, h = y1 - y0;
      const mats = [sideM, sideM, sideM, sideM, sideM, sideM]; mats[ext ^ 1] = inner;   // (+x/-x, +z/-z pairs: the other face of the pair is inside)
      const b = box(w, h, d, mats, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); metreUV(b.geometry, w, h, d); return b;
    };
    // (28 Oct, Ben: windows you can SEE THROUGH, in and out) a wall with real openings: holes [s0, s1, y0, y1, door?] along it;
    // each window gets clear glass, an ink frame + cross, and an unseen blocker (no walking or camera through it)
    const glassM = new THREE.MeshBasicMaterial({ color: 0xd6e8ee, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    const wallH = (alongX, a0, a1, b0, b1, y0, y1, ext, holes) => {
      const seg = (s0, s1, p0, p1) => { if (s1 - s0 > 0.01 && p1 - p0 > 0.01) alongX ? wall(s0, s1, b0, b1, p0, p1, ext) : wall(b0, b1, s0, s1, p0, p1, ext); };
      const bm = (b0 + b1) / 2, dd = b1 - b0 + 0.06;
      const put = (sl, h, dl, s, y, m, solid = false) => alongX ? box(sl, h, dl, m, s, y, bm, solid) : box(dl, h, sl, m, bm, y, s, solid);
      let cur = a0;
      for (const [h0, h1, hy0, hy1, door] of [...holes].sort((p, q) => p[0] - q[0])) {
        seg(cur, h0, y0, y1); seg(h0, h1, y0, hy0); seg(h0, h1, hy1, y1); cur = h1;
        if (door) continue;
        const sm = (h0 + h1) / 2, ym = (hy0 + hy1) / 2, fw = h1 - h0;
        put(fw + 0.2, 0.12, dd + 0.06, sm, hy0, ink); put(fw + 0.2, 0.1, dd, sm, hy1, ink);
        put(0.1, hy1 - hy0, dd, h0, ym, ink); put(0.1, hy1 - hy0, dd, h1, ym, ink);
        put(0.06, hy1 - hy0, 0.08, sm, ym, ink); put(fw, 0.06, 0.08, sm, ym, ink);
        const g = put(fw, hy1 - hy0, 0.02, sm, ym, glassM); g.renderOrder = 2; g.userData.noCull = true;
        { const bl = put(fw, hy1 - hy0, b1 - b0, sm, ym, null, true); bl.visible = false; bl.userData.see = true; }
      }
      seg(cur, a1, y0, y1);
    };
    // floor, walls (a door in the middle of the front, a big window either side; high windows over the stories on both sides), ceiling
    box(W, 0.12, D, oak, cx, 0, (R.z0 + R.z1) / 2);
    wallH(true, R.x0, R.x1, R.z0, R.z0 + T, 0, WH, 5, [[cx - 6.8, cx - 4.4, 0.8, 3.4], [cx - DOOR / 2, cx + DOOR / 2, 0, DH, true], [cx + 4.4, cx + 6.8, 0.8, 3.4]]);
    wall(R.x0, R.x1, R.z1 - T, R.z1, 0, WH, 4);
    const hi = [0, 1, 2, 3].map(k => { const z = R.z0 + 3.2 + k * 3.4; return [z - 1.15, z + 1.15, 3.55, 5.35]; });
    wallH(false, R.z0, R.z1, R.x0, R.x0 + T, 0, WH, 1, hi); wallH(false, R.z0, R.z1, R.x1 - T, R.x1, 0, WH, 0, hi);
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
      const gT = sideT.clone(); gT.repeat.set(0.5, 0.5); gT.needsUpdate = true; const gm = new THREE.MeshLambertMaterial({ map: gT, side: THREE.DoubleSide });
      const qT = texLive(512, 512, (c, w, h) => {
        const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, '#2e5fd8'); g.addColorStop(1, '#0d1f4f'); c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 14, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#1d1c1b'; c.lineWidth = 16; c.stroke();
      });
      // (22 Oct) the Blind Canvas Project logo in the round window, in place of the "?"
      img('gallery/img/blind_canvas_project_logo__270692239.webp', im => { const c = qT.image.getContext('2d'), w = qT.image.width, k = Math.min(w * 0.7 / im.width, w * 0.7 / im.height);
        c.save(); c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 22, 0, Math.PI * 2); c.clip(); c.drawImage(im, (w - im.width * k) / 2, (w - im.height * k) / 2 + 4, im.width * k, im.height * k); c.restore(); qT.needsUpdate = true; });
      const qM = new THREE.MeshBasicMaterial({ map: qT, transparent: true });
      for (const [z, ry] of [[R.z0 - 0.01, Math.PI], [R.z1 + 0.01, 0]]) {
        const m = new THREE.Mesh(new THREE.ShapeGeometry(tri), gm); m.position.set(cx, WH, z); m.rotation.y = ry; root.add(m);
        plane(2.4, 2.4, qM, cx, WH + 1.65, z + (ry ? -0.02 : 0.02), ry);
      } }
    // porch: a cantilevered ink canopy over the door with a red edge, on two slim braces
    box(5.6, 0.18, 1.2, ink, cx, DH + 0.75, R.z0 - 0.6, false); box(5.6, 0.06, 0.04, red, cx, DH + 0.69, R.z0 - 1.2, false);   // (28 Oct: 1.2 m deep, so it no longer hides the name)
    for (const s of [-1, 1]) { const b = box(0.08, 1.1, 0.08, ink, cx + s * 2.4, DH + 0.3, R.z0 - 0.35, false); b.rotation.x = -0.75; }
    box(4.4, 0.12, 1.6, new THREE.MeshLambertMaterial({ color: 0xd8d2c8 }), cx, 0.06, R.z0 - 0.8, false);   // the porch step (flush, no trip)
    // the name: an ink plate over the porch
    const nameT = tex(1600, 240, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 18, h);
      c.fillStyle = '#fff'; c.font = `800 40px ${FONT}`; c.fillText('THE BLIND CANVAS PROJECT', 70, 72); fitText(c, 'THE WHY HOUSE', w - 120, 128); c.fillText('THE WHY HOUSE', 66, 196); });
    plane(6.4, 0.96, new THREE.MeshBasicMaterial({ map: nameT }), cx, WH - 0.58, R.z0 - 0.02, Math.PI);   // (28 Oct: up over the canopy's line, readable from the path)
    // the eye-level door sign beside the door (every building, Ben s348)
    const doorT = tex(800, 400, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 14);
      c.fillStyle = '#fff'; c.font = `800 44px ${FONT}`; c.fillText('THE', 44, 110); fitText(c, 'WHY HOUSE', w - 88, 150); c.fillText('WHY HOUSE', 40, 250); c.font = `700 40px ${FONT}`; c.fillText('Stories · add your own', 44, 340); });
    plane(1.5, 0.75, new THREE.MeshBasicMaterial({ map: doorT }), cx + 3.15, 1.65, R.z0 - 0.02, Math.PI);
    for (const [w, d, x, z] of [[0.08, D, R.x0 - 0.04, (R.z0 + R.z1) / 2], [0.08, D, R.x1 + 0.04, (R.z0 + R.z1) / 2], [W, 0.08, cx, R.z1 + 0.04], [cx - DOOR / 2 - R.x0, 0.08, (R.x0 + cx - DOOR / 2) / 2, R.z0 - 0.04], [cx - DOOR / 2 - R.x0, 0.08, (R.x1 + cx + DOOR / 2) / 2, R.z0 - 0.04]]) box(w, 0.42, d, ink, x, 0.21, z, false);   // an ink plinth
    // inside: the header over the back wall, a rug, two benches facing the stories, the story stand by the door
    const headT = tex(2400, 180, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 12, w, 12);
      c.fillStyle = '#fff'; fitText(c, 'WHY DO YOU CREATE?  WHY DO YOU CARE?', w * 0.5, 84); c.fillText('WHY DO YOU CREATE?  WHY DO YOU CARE?', 50, 112);
      c.fillStyle = '#fff'; c.font = `700 40px ${FONT}`; c.textAlign = 'right'; c.fillText('Stories, art and voices from visitors like you', w - 50, 108); });
    plane(W - 1.2, 0.9, new THREE.MeshBasicMaterial({ map: headT }), cx, 4.0, R.z1 - T - 0.02, Math.PI);   // (Ben, 28 Oct) bottom at 3.55, same gap over the story cards as the side windows
    // the rug (Ben, 28 Oct: BLACK): ink with a white border and the Blind Canvas Project logo woven in white
    logoRug(8, 6, 768, 576, (c, w, h) => rugEdge(c, w, h, '#1d1c1b', '#f3f2f2'), [[384, 288, 330, '#f3f2f2', 0.92]], cx, 0.065, R.z0 + 5.4, Math.PI);   // (Ben, 28 Oct) moved up to just inside the door   // (reads the right way up as you come in)
    for (const x of [cx - 3.6, cx + 3.6]) { const b = makeBench(2.6); b.group.position.set(x, 0.06, R.z0 + 9.2); root.add(b.group); box(2.6, 0.55, 0.65, null, x, 0.33, R.z0 + 9.2).visible = false; benches.push({ x, z: R.z0 + 9.2, ry: 0, len: 2.6, dir: 1, name: 'Bench · facing the stories' }); }
    for (const x of [R.x0 + 1.1, R.x1 - 1.1]) { const p = makePlant(2.3); p.group.position.set(x, 0.06, R.z0 + 1.2); root.add(p.group); box(0.8, 1.6, 0.8, null, x, 0.8, R.z0 + 1.2).visible = false; }
    // the story stand: in the middle of the room on the line from the door, reading towards the door
    const standT = tex(1024, 720, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 14, h);
      c.fillStyle = '#fff'; c.font = `800 34px ${FONT}`; c.fillText('THE WHY HOUSE', 56, 86);
      c.font = `800 92px ${FONT}`; c.fillText('Add your story.', 52, 200);
      c.font = `500 38px ${FONT}`; ['Why do you create? Why do you care?', 'Write it, record it in your own voice,', 'and add a photo of you or your art.', 'It hangs here on these walls.'].forEach((l, i) => c.fillText(l, 56, 290 + i * 54));
      c.fillStyle = '#ec3013'; c.fillRect(56, 576, 600, 4); c.fillStyle = '#fff'; c.font = `800 36px ${FONT}`; c.fillText('WALK UP · TAP ADD YOUR STORY', 56, 630); });
    const stand = { x: cx, z: R.z0 + 9.4 };   // (Ben, 28 Oct) just behind the rug, straight ahead as you come in the door   // (22 Oct) in the middle of the room, straight ahead as you come in the door
    { const g = new THREE.Group(); g.position.set(stand.x, 0.06, stand.z); g.rotation.y = Math.PI; root.add(g); lectern(g, ink, red, null, standT); box(0.8, 1.2, 0.6, null, stand.x, 0.6, stand.z).visible = false; }
    // the story slots (Ben, 28 Oct: ONE ROW, no slot above another): the back wall 5, both side walls 4, at eye height
    const slots = [], CW = 2.7, CH = 1.66, rows = [2.0];
    for (const y of rows) for (const i of [2, 1, 3, 0, 4]) slots.push({ p: [cx + (i - 2) * 3.3, y, R.z1 - T - 0.025], ry: Math.PI, w: CW, h: CH });
    for (const y of rows) for (const k of [3, 2, 1, 0]) { const z = R.z0 + 3.2 + k * 3.4;
      slots.push({ p: [R.x0 + T + 0.025, y, z], ry: Math.PI / 2, w: CW, h: CH }); slots.push({ p: [R.x1 - T - 0.025, y, z], ry: -Math.PI / 2, w: CW, h: CH }); }
    return { slots, station: { x: stand.x, z: stand.z, r: 2.2 }, rect: R, guestbook: { p: [cx - 3.4, R.z0 - 1.25], face: Math.PI } };
  })();

  // ============================================================ the Academy of Music for the Blind's outside (south)
  {
    const A = CAMPUS.amb, cx = (A.x0 + A.x1) / 2, H = 6.4 + AMB_FLOOR - 0.06;   // (28 Oct: the rooms stand 0.36 m up now, for the front steps)
    // the logo parapet over the door
    const parT = texLive(2048, 300, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 14, w, 14);
      c.fillStyle = '#ff9783'; c.font = `800 34px ${FONT}`; c.fillText('THE BLIND CANVAS PROJECT  ·  LOS ANGELES', 560, 92);
      c.fillStyle = '#fff'; const fs = fitText(c, 'ACADEMY OF MUSIC FOR THE BLIND', w - 620, 104); c.fillText('ACADEMY OF MUSIC FOR THE BLIND', 556, 92 + fs + 22); });
    const parM = new THREE.MeshBasicMaterial({ map: parT });
    const par = box(A.x1 - A.x0 + 0.2, 3.0, 0.4, [ink, ink, ink, ink, parM, ink], cx, H + 1.6, A.z1 + 0.16, false);   // (its +z face looks out over the park)
    img('gallery/img/amb_logo_270127889.webp', im => { const c = parT.image.getContext('2d'); const k = Math.min(440 / im.width, 236 / im.height); c.drawImage(im, 60 + (440 - im.width * k) / 2, 24 + (236 - im.height * k) / 2, im.width * k, im.height * k); parT.needsUpdate = true; });
    // a piano-key frieze round the top of the walls, and an ink plinth
    const keysT = texLive(512, 64, (c, w, h) => { c.fillStyle = '#f7f5f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; for (let i = 0; i <= 14; i++) c.fillRect(i * (w / 14) - 1, 0, 2, h); const blk = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]; for (const i of blk) c.fillRect((i + 0.68) * (w / 14), 0, (w / 14) * 0.64, h * 0.6); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 4); });
    const keys = (len, along) => { const t = keysT.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 3.6, 1); return new THREE.MeshLambertMaterial({ map: t }); };
    const L = A.z1 - A.z0, W = A.x1 - A.x0;
    const B2 = CAMPUS.amb2;   // the east wall shows either side of the stage room, which joins it part way along
    box(0.08, 0.9, L, keys(L), A.x0 - 0.04, H - 0.6, (A.z0 + A.z1) / 2, false); box(W, 0.9, 0.08, keys(W), cx, H - 0.6, A.z0 - 0.04, false);
    for (const [z0, z1] of [[A.z0, B2.z0], [B2.z1, A.z1]]) { const l = z1 - z0; if (l > 0.2) { box(0.08, 0.9, l, keys(l), A.x1 + 0.04, H - 0.6, (z0 + z1) / 2, false); } }
    // (28 Oct) the ink plinth now wraps the raised floor slab's edge (it runs 0.6 m past the walls)
    for (const [z0, z1] of [[A.z0, B2.z0 - 0.7], [B2.z1 + 0.7, A.z1 + 0.3]]) box(0.7, 0.45, z1 - z0, ink, A.x1 + 0.35, 0.225, (z0 + z1) / 2, false);   // (runs butt end to end: no two overlap, so no corner flicker)
    for (const [w, d, x, z] of [[0.7, A.z1 + 0.3 - A.z0, A.x0 - 0.35, (A.z0 + A.z1 + 0.3) / 2], [W + 1.4, 0.7, cx, A.z0 - 0.35]]) box(w, 0.45, d, ink, x, 0.225, z, false);
    // the stage room's outside: the same piano-key frieze and ink plinth, and its name over the north wall
    { const w2 = B2.x1 - B2.x0, d2 = B2.z1 - B2.z0, c2 = (B2.x0 + B2.x1) / 2, z2 = (B2.z0 + B2.z1) / 2;
      box(w2, 0.9, 0.08, keys(w2), c2, H - 0.6, B2.z1 + 0.04, false); box(w2, 0.9, 0.08, keys(w2), c2, H - 0.6, B2.z0 - 0.04, false); box(0.08, 0.9, d2, keys(d2), B2.x1 + 0.04, H - 0.6, z2, false);
      for (const [w, d, x, z] of [[B2.x1 - A.x1, 0.7, (A.x1 + B2.x1) / 2, B2.z1 + 0.35], [B2.x1 - A.x1, 0.7, (A.x1 + B2.x1) / 2, B2.z0 - 0.35], [0.7, d2 + 1.4, B2.x1 + 0.35, z2]]) box(w, 0.45, d, ink, x, 0.225, z, false);
      const nT = tex(1600, 220, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 16, h);
        c.fillStyle = '#ff9783'; c.font = `800 38px ${FONT}`; c.fillText('ACADEMY OF MUSIC FOR THE BLIND', 60, 70); c.fillStyle = '#fff'; fitText(c, 'THE STAGE', w - 120, 116); c.fillText('THE STAGE', 56, 178); });
      plane(9, 1.24, new THREE.MeshBasicMaterial({ map: nT }), c2, 3.4, B2.z1 + 0.09, 0); }
    for (const s of [-1, 1]) { const p = makePlant(2.4); p.group.position.set(cx + s * 11.0, 0, A.z1 - 3.4); root.add(p.group); box(0.8, 1.6, 0.8, null, cx + s * 11.0, 0.8, A.z1 - 3.4).visible = false; }   // (28 Oct: moved round the corners, clear of the ramps)
    buildAmbPolish({ root, col, tickers, inside, sky, CAMPUS, lowEnd });   // (28 Oct) the concert-hall front, steps + ramps, windows, warm light, the stage lights
  }

  // ============================================================ BLIND CAN CINEMA (east)
  const cinema = (() => {
    const out2 = {};
    const C = CAMPUS.cinema, cz = (C.z0 + C.z1) / 2, H = 9, T = 0.4, W = C.z1 - C.z0, D = C.x1 - C.x0, ENT = 5.2, EH = 4.0, FX = C.x0;
    // materials: a cream terracotta front, red brick sides and back, red velvet and a starry ceiling inside
    const cream = new THREE.MeshLambertMaterial({ map: tex(256, 256, (c, w, h) => { c.fillStyle = '#eadbbf'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,90,50,.18)'; c.lineWidth = 2; for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let y = 0; y < h; y += 64) for (let x = (y / 64) % 2 ? 0 : 64; x < w; x += 128) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 64); c.stroke(); } }, [W / 4, H / 4]) });
    const brick = (len, h) => new THREE.MeshLambertMaterial({ map: tex(256, 256, (c, w, hh) => { c.fillStyle = '#9c8470'; c.fillRect(0, 0, w, hh); for (let y = 0; y < hh; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { c.fillStyle = `hsl(${8 + Math.random() * 8},${45 + Math.random() * 10}%,${27 + Math.random() * 8}%)`; c.fillRect(x + 1, y + 1, 30, 14); } }, [len / 2, h / 2]) });
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
    // ---- inside (22 Oct): a lobby with a snack bar as you come in, then two theatres side by side behind it (Screen 1 south,
    // Screen 2 north), each through its own doorway from the lobby, with its own screen, curtains, stage and four rows of seats
    const goldM = new THREE.MeshLambertMaterial({ color: 0xc9a14a }), sconceM = new THREE.MeshBasicMaterial({ color: 0xffd28a });
    const LX = 82.0, PT = 0.3, DW = 2.4, DH = 3.4;   // the lobby's back wall (x), its thickness, the theatre doorways
    const TH = [{ z0: C.z0 + T, z1: cz - 0.15, n: 1 }, { z0: cz + 0.15, z1: C.z1 - T, n: 2 }]; for (const t of TH) t.c = (t.z0 + t.z1) / 2;
    { const zs = [C.z0 + T, TH[0].c - DW / 2, TH[0].c + DW / 2, TH[1].c - DW / 2, TH[1].c + DW / 2, C.z1 - T];
      for (let i = 0; i < 6; i += 2) box(PT, H, zs[i + 1] - zs[i], wallIn, LX + PT / 2, H / 2, (zs[i] + zs[i + 1]) / 2);
      for (const t of TH) { box(PT, H - DH, DW, wallIn, LX + PT / 2, DH + (H - DH) / 2, t.c);
        for (const s of [-1, 1]) box(PT + 0.12, DH, 0.12, goldM, LX + PT / 2, DH / 2, t.c + s * (DW / 2 + 0.06), false);
        box(PT + 0.12, 0.12, DW + 0.24, goldM, LX + PT / 2, DH + 0.06, t.c, false); } }
    box(C.x1 - T - LX - PT, H, 0.3, wallIn, (LX + PT + C.x1 - T) / 2, H / 2, cz);   // between the theatres
    // over each doorway, on the lobby side: SCREEN n and what's showing (redrawn with the showtimes)
    const doorSigns = TH.map(t => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 300; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      box(0.12, 1.3, 4.3, ink, LX - 0.06, DH + 1.2, t.c, false); plane(4.2, 1.2, new THREE.MeshBasicMaterial({ map: tx }), LX - 0.13, DH + 1.2, t.c, -Math.PI / 2); return { cv, tx, n: t.n }; });
    // the theatres (s3 cinema polish, Ben: "only a few more chairs, proper space between rows, a middle aisle to walk down"):
    // 3 STEPPED rows (floor, +0.2, +0.4 m; the aisles stay flat), 4 seats a side of a 1.6 m centre aisle, 1.6 m from row to row,
    // wide side aisles and cross aisles at the back and the front. 24 seats a theatre (was 20).
    const stageM = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood), seats = [], ROWS = [{ x: 88.6, y: 0 }, { x: 87.0, y: 0.2 }, { x: 85.4, y: 0.4 }];
    const AISLE = 0.8, SEAT0 = 1.15, PITCH = 0.72, PER = 4, SEATEND = SEAT0 + (PER - 1) * PITCH + 0.45;
    const AUD = { '1:1:1:1': 1, '2:0:-1:2': 1 };   // seats kept for the two audience foxes (theatre:row:side:seat)
    const audience = [], cinG = new THREE.Group(); root.add(cinG); inside.push([cinG, 'cinema']);
    const riserM = new THREE.MeshLambertMaterial({ color: 0x4a1418 }), aisleM = new THREE.MeshBasicMaterial({ color: 0xffb35a });
    const radT = tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(0.45, 'rgba(255,190,110,0.35)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    const exitT = tex(256, 100, (c, w, h) => { c.fillStyle = '#0f7a3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 70px ${FONT}`; c.fillText('EXIT', w / 2, h / 2 + 4); });
    const exitM = new THREE.MeshBasicMaterial({ map: exitT });
    const dyn = o => { o.traverse(k => { k.userData.dyn = true; }); return o; };
    const theatres = TH.map(t => {
      const W2 = t.z1 - t.z0, SX = C.x1 - T - 0.06, VW = Math.min(W2 - 2.2, 8.4), VH = VW * 9 / 16, SY = 0.95 + VH / 2;
      box(0.04, VH + 0.4, VW + 0.4, ink, SX + 0.02, SY, t.c, false);
      const posterMat = new THREE.MeshBasicMaterial({ color: 0x111111 }), dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.06, VH, VW), [dark, posterMat, dark, dark, dark, dark]); scr.position.set(SX - 0.03, SY, t.c); root.add(scr);
      for (const s of [-1, 1]) { const cw = (W2 - VW) / 2 + 0.2; box(0.25, H - 0.3, cw, velvet, SX - 0.4, (H - 0.3) / 2, t.c + s * (VW / 2 + cw / 2 - 0.2), false); }
      box(0.3, 1.1, W2, velvet, SX - 0.45, H - 0.75, t.c, false); box(0.06, 0.06, W2, goldM, SX - 0.62, H - 1.32, t.c, false);
      box(1.3, 0.45, W2, [ink, ink, stageM, ink, ink, ink], SX - 0.95, 0.225, t.c); box(0.04, 0.04, W2, goldM, SX - 1.6, 0.45, t.c, false);
      // THE CURTAINS: two velvet halves in front of the screen, closed between shows, opening as the film starts (tick below)
      const CH = H - 1.36, curt = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, CH, 1), velvet); m.position.set(SX - 0.18, 0.06 + CH / 2, t.c); cinG.add(dyn(m)); return { m, s }; });
      // the rows: a riser under each raised row (solid, so you step up onto it), gold nosing, a step light at each aisle end
      ROWS.forEach((r, ri) => {
        for (const side of [-1, 1]) { const za = t.c + side * AISLE, zb = t.c + side * SEATEND, zc = (za + zb) / 2, zl = Math.abs(zb - za);
          if (r.y > 0) { box(1.6, r.y, zl, riserM, r.x, r.y / 2, zc); box(0.05, 0.04, zl, goldM, r.x + 0.8, r.y - 0.02, zc, false); }
          for (const z of [za + side * 0.12, zb - side * 0.12]) box(0.03, 0.05, 0.16, aisleM, r.x + 0.82, Math.max(0.05, r.y - 0.08), z, false);
          for (let k = 0; k < PER; k++) { const z = t.c + side * (SEAT0 + k * PITCH), x = r.x, y = r.y; seats.push([x, z, y]);
            box(0.62, 0.5, 0.62, null, x - 0.02, y + 0.31, z).visible = false;
            if (AUD[t.n + ':' + ri + ':' + side + ':' + k]) audience.push({ x, z, y, top: 0.5 + y, n: audience.length });
            else benches.push({ x, z, ry: Math.PI / 2, len: 0.9, dir: 1, top: 0.5 + y, name: 'Cinema seat · Screen ' + t.n, look: [SX, SY, t.c] }); } } });
      // the centre aisle's floor lights: two warm strips from the back cross aisle to the front
      for (const s of [-1, 1]) box(ROWS[0].x + 0.8 - (LX + PT + 1.2), 0.015, 0.04, aisleM, (ROWS[0].x + 0.8 + LX + PT + 1.2) / 2, 0.07, t.c + s * (AISLE - 0.1), false);
      // HOUSE LIGHTS: fan sconces on the side walls with a wash of light up the wall; they dim when the film starts
      const houseM = new THREE.MeshBasicMaterial({ color: 0xffd28a }), washM = new THREE.MeshBasicMaterial({ ...ADD, map: radT, opacity: 0.5 });
      for (let x = LX + 1.9; x < C.x1 - 2; x += 2.7) for (const [z, n] of [[t.z0 + 0.07, 1], [t.z1 - 0.07, -1]]) {
        box(0.5, 0.7, 0.12, houseM, x, 4.2, z, false); box(0.58, 0.06, 0.16, goldM, x, 3.84, z, false);
        const w = plane(2.0, 3.0, washM, x, 4.6, z + n * 0.08, n > 0 ? 0 : Math.PI, cinG); dyn(w); }
      // EXIT over the doorway (theatre side), green on white letters
      box(0.08, 0.5, 1.3, ink, LX + PT + 0.04, DH + 0.45, t.c, false); plane(1.2, 0.44, exitM, LX + PT + 0.09, DH + 0.45, t.c, Math.PI / 2);
      // THE PROJECTOR: a lit window high in the back wall, and its beam to the screen during the film (with a flicker)
      const PY = 6.7, PXb = LX + PT + 0.02; box(0.1, 0.7, 1.0, ink, PXb + 0.03, PY, t.c, false); const lensM = new THREE.MeshBasicMaterial({ color: 0x3a2e20 }); plane(0.6, 0.42, lensM, PXb + 0.09, PY, t.c, Math.PI / 2);
      const dx = SX - 0.1 - PXb, dy = SY - PY, L = Math.hypot(dx, dy);
      const beamG = new THREE.CylinderGeometry(1, 0.06, L, 20, 1, true).rotateZ(-Math.PI / 2).scale(1, VH / 2, VW / 2);
      const beamM = new THREE.MeshBasicMaterial({ ...ADD, color: 0xfff1d6, opacity: 0, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(beamG, beamM); beam.position.set(PXb + dx / 2, PY + dy / 2, t.c); beam.rotation.z = Math.atan2(dy, dx); beam.visible = false; cinG.add(dyn(beam));
      return { ...t, scr, posterMat, SX, SY, VW, VH, curt, houseM, washM, beam, beamM, lensM, zone: new THREE.Box3(new THREE.Vector3(LX + PT, -1, t.z0), new THREE.Vector3(C.x1, H + 1.5, t.z1)) };
    });
    out2.audience = audience;
    { // full-size seats: a cushion at sitting height, a tall padded back leaning back a little with a round top roll, armrests with
      // gold caps, a black base (seat faces +x, the screen)
      const seatRed = new THREE.MeshLambertMaterial({ color: 0xa3222c }), m4 = new THREE.Matrix4(), I = (geo, mat) => new THREE.InstancedMesh(geo, mat, seats.length);
      const cushion = I(new THREE.BoxGeometry(0.54, 0.13, 0.56).translate(0.02, 0.42, 0), seatRed), back = I(new THREE.BoxGeometry(0.12, 0.6, 0.56).rotateZ(0.12).translate(-0.27, 0.72, 0), seatRed);   // (low enough that a seated fox shows over it)
      const roll = I(new THREE.CylinderGeometry(0.075, 0.075, 0.56, 10).rotateX(Math.PI / 2).translate(-0.31, 1.03, 0), seatRed);
      const armL = I(new THREE.BoxGeometry(0.5, 0.07, 0.07).translate(-0.02, 0.64, -0.31), ink), armR = I(new THREE.BoxGeometry(0.5, 0.07, 0.07).translate(-0.02, 0.64, 0.31), ink);
      const caps = I(new THREE.BoxGeometry(0.1, 0.075, 0.08).translate(0.2, 0.645, -0.31), goldM), caps2 = I(new THREE.BoxGeometry(0.1, 0.075, 0.08).translate(0.2, 0.645, 0.31), goldM),   // (28 Oct, Ben) a small gold cap on the front of EACH arm (the old cap was one bar right across the seat front, so it looked closed)
        frame = I(new THREE.BoxGeometry(0.46, 0.36, 0.5).translate(-0.04, 0.18, 0), ink);
      seats.forEach(([x, z, y], i) => { m4.makeTranslation(x, 0.06 + y, z); for (const m of [cushion, back, roll, armL, armR, caps, caps2, frame]) m.setMatrixAt(i, m4); });
      root.add(cushion, back, roll, armL, armR, caps, caps2, frame); }
    // ---- (s3) the lobby: two lit film posters in gold frames on the south wall with fan sconces over them, a sconce either side
    // of the middle of the back wall, and warm pools of light on the floor
    const lobbyPosters = [];
    { const SZ = C.z0 + T, washM = new THREE.MeshBasicMaterial({ ...ADD, map: radT, opacity: 0.45 }), poolM = new THREE.MeshBasicMaterial({ ...ADD, map: radT, opacity: 0.28, polygonOffset: true, polygonOffsetFactor: -4 });
      // (Ben, 27 Oct) Ben's posters on both side walls: ABLE ARTISTS by the entrance; by the theatre doors, the poster of the
      // film showing inside (south = Screen 1, SURFING WHILE BLIND; north = Screen 2, WHAT IS GOALBALL?) under a NOW SHOWING plate
      const nowT = n => tex(512, 96, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 8, w, 8); c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 48px ${FONT}`; c.fillText('NOW SHOWING · SCREEN ' + n, w / 2, h / 2 - 2); });
      for (const [wz, ry, n] of [[SZ, 0, 1], [C.z1 - T, Math.PI, 2]]) { const k = n === 1 ? 1 : -1;
        for (const [x, url, now] of [[76.0, 'gallery/img2/poster_able_artists_' + n + '.jpg', false], [79.7, n === 1 ? 'gallery/img2/poster_surfing_while_blind.jpg' : 'gallery/img2/poster_what_is_goalball.jpg', true]]) {
          box(1.78, 2.32, 0.08, goldM, x, 1.95, wz + k * 0.04, false);
          const pm = new THREE.MeshBasicMaterial({ color: 0x111111 }); loadInto(pm, url); plane(1.62, 2.16, pm, x, 1.95, wz + k * 0.09, ry);
          if (now) { box(1.7, 0.34, 0.06, ink, x, 3.34, wz + k * 0.03, false); plane(1.62, 0.3, new THREE.MeshBasicMaterial({ map: nowT(n) }), x, 3.34, wz + k * 0.07, ry); }
          box(0.5, 0.36, 0.12, sconceM, x, 3.85, wz + k * 0.06, false); box(0.6, 0.05, 0.16, goldM, x, 3.65, wz + k * 0.08, false); dyn(plane(1.8, 2.4, washM, x, 4.2, wz + k * 0.1, ry, cinG)); } }
      for (const [x, z, s] of [[77.2, -7.6, 4.5], [77.0, 0, 6], [77.2, 7.6, 4.5]]) { const p = plane(s, s, poolM, x, 0.075, z, 0, cinG); p.rotation.x = -Math.PI / 2; dyn(p); }
      // EXIT over the front doors, inside
      box(0.08, 0.5, 1.3, ink, FX + T + 0.04, EH + 0.5, cz, false); plane(1.2, 0.44, exitM, FX + T + 0.09, EH + 0.5, cz, Math.PI / 2); }
    // ---- the snack bar, along the lobby's north wall (22 Oct, evening): a red counter with a gold top and a lit glass candy case in
    // its front; behind it the back counter with a popcorn machine (popping) and a soda fountain turned to face the door; a lit menu
    // board. Popcorn boxes and drinks carry the Blind Canvas Project logo. The fox behind it fills them and sets them out
    // (gallery-game.js runs the fox; this builds the props and hands over the pieces it moves: snack).
    const n0 = root.children.length, PMW = { x: 0, z: 0 };   // (Ben: the snack bar now faces the front doors, between the theatre doors: built in its old frame, then turned)
    const SB = { x0: 75.0, x1: 79.6, z: C.z1 - T - 2.3 }, BZ = C.z1 - T - 0.3;   // front counter (its middle line), back counter
    const snack = {}, snackG = new THREE.Group(); root.add(snackG); inside.push([snackG, 'cinema']);
    { const cx = (SB.x0 + SB.x1) / 2, L = SB.x1 - SB.x0, D = 0.7, redM = new THREE.MeshLambertMaterial({ color: 0xa3222c }), fz = SB.z - D / 2;
      // the counter, built round its candy window: ends, a kick plate, a band under the top, the top, a dark back to the case
      const WX0 = SB.x0 + 0.9, WX1 = SB.x1 - 0.9, WY0 = 0.22, WY1 = 0.86;
      box(WX0 - SB.x0, 1.0, D, redM, (SB.x0 + WX0) / 2, 0.5, SB.z, false); box(SB.x1 - WX1, 1.0, D, redM, (WX1 + SB.x1) / 2, 0.5, SB.z, false);
      box(WX1 - WX0, WY0, D, redM, cx, WY0 / 2, SB.z, false); box(WX1 - WX0, 1.0 - WY1, D, redM, cx, (WY1 + 1.0) / 2, SB.z, false);
      box(WX1 - WX0, WY1 - WY0, 0.05, new THREE.MeshLambertMaterial({ color: 0x2a1a14 }), cx, (WY0 + WY1) / 2, SB.z + D / 2 - 0.03, false);
      box(L + 0.1, 0.06, D + 0.12, goldM, cx, 1.03, SB.z, false);
      box(L, 1.0, D, null, cx, 0.5, SB.z).visible = false;   // (solid)
      // the candy: two shelves of little boxes in bright wrappers, lit warm, behind glass with a gold frame
      const glassM = new THREE.MeshLambertMaterial({ color: 0xd8f0f6, transparent: true, opacity: 0.22, depthWrite: false });
      const shelfM = new THREE.MeshLambertMaterial({ color: 0xf2e6c8 }), lightM = new THREE.MeshBasicMaterial({ color: 0xfff1c4 });
      for (const y of [WY0 + 0.02, (WY0 + WY1) / 2]) box(WX1 - WX0, 0.02, D - 0.12, shelfM, cx, y, SB.z, false);
      box(WX1 - WX0 - 0.1, 0.02, 0.06, lightM, cx, WY1 - 0.02, SB.z - 0.15, false);
      const wraps = [0xec3013, 0xf6c443, 0x2e5fd8, 0x2ea44f, 0xff7ab8, 0x8a4fd8, 0xff9a2e, 0xffffff];
      { const geo = new THREE.BoxGeometry(0.16, 0.2, 0.08), N = 2 * Math.floor((WX1 - WX0 - 0.1) / 0.19);
        const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), N), m4 = new THREE.Matrix4(), per = N / 2;
        for (let i = 0; i < N; i++) { const row = i < per ? 0 : 1, k = i % per; m4.makeTranslation(WX0 + 0.14 + k * 0.19, (row ? (WY0 + WY1) / 2 : WY0 + 0.02) + 0.11, SB.z - 0.08 + (k % 2) * 0.1); im.setMatrixAt(i, m4); im.setColorAt(i, new THREE.Color(wraps[(i * 5 + row) % wraps.length])); }
        root.add(im); }
      box(WX1 - WX0, WY1 - WY0, 0.02, glassM, cx, (WY0 + WY1) / 2, fz + 0.01, false);
      for (const [w, h, x, y] of [[WX1 - WX0 + 0.08, 0.04, cx, WY0], [WX1 - WX0 + 0.08, 0.04, cx, WY1], [0.04, WY1 - WY0, WX0, (WY0 + WY1) / 2], [0.04, WY1 - WY0, WX1, (WY0 + WY1) / 2]]) box(w, h, 0.05, goldM, x, y, fz, false);
      const candyT = tex(512, 96, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.font = `800 60px ${FONT}`; c.fillText('CANDY', w / 2, 70); });
      plane(0.9, 0.17, new THREE.MeshBasicMaterial({ map: candyT }), cx, WY0 - 0.11 + 0.0, fz - 0.005, Math.PI);
      // the back counter
      { const bx1 = SB.x1 - 1.6; box(bx1 - SB.x0, 0.95, 0.6, [ink, ink, goldM, ink, ink, ink], (SB.x0 + bx1) / 2, 0.475, BZ); }   // (stops short of the fountain, so the fox can stand at it)
    }
    // the Blind Canvas Project logo, for the popcorn boxes and cups (drawn in when it loads)
    const logoCups = [];
    const bcpLogo = img('gallery/img/bcp_logo_white.webp', () => logoCups.forEach(f => f()));
    const logoTex = (w, h, draw) => { const t = texLive(w, h, (c) => draw(c, null)); const redraw = () => { const c = t.image.getContext('2d'); draw(c, bcpLogo.complete && bcpLogo.naturalWidth ? bcpLogo : null); t.needsUpdate = true; }; logoCups.push(redraw); redraw(); return t; };
    const logoAt = (c, im, x, y, s) => { if (!im) return; const k = s / Math.max(im.width, im.height); c.drawImage(im, x - im.width * k / 2, y - im.height * k / 2, im.width * k, im.height * k); };
    const boxT = logoTex(256, 256, (c, im) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#d8232a'; c.fillRect(i * 32, 0, 32, 256); }
      c.fillStyle = '#1d2a6b'; c.beginPath(); c.arc(128, 128, 78, 0, Math.PI * 2); c.fill(); logoAt(c, im, 128, 128, 120); });
    const cupT = logoTex(256, 256, (c, im) => { c.fillStyle = '#1d2a6b'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 256, 26); c.fillRect(0, 230, 256, 26); logoAt(c, im, 128, 128, 150); });
    const boxM = new THREE.MeshLambertMaterial({ map: boxT }), cupM = new THREE.MeshLambertMaterial({ map: cupT }), cornM = new THREE.MeshLambertMaterial({ color: 0xfff1c9 }), lidM = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
    const kernelGeo = new THREE.IcosahedronGeometry(0.03, 0);
    // a popcorn box: open-topped, flared, heaped with popcorn (local origin at its foot)
    const makeBox = () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.24, 4, 1, true), boxM); b.rotation.y = Math.PI / 4; b.position.y = 0.12; b.material.side = THREE.DoubleSide; g.add(b);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.01, 0.155), boxM); base.position.y = 0.005; g.add(base);
      for (let i = 0; i < 14; i++) { const k = new THREE.Mesh(kernelGeo, cornM); const a = i * 2.4, r = (i % 4) * 0.032; k.position.set(Math.cos(a) * r, 0.23 + (3 - (i % 4)) * 0.018, Math.sin(a) * r); k.rotation.set(i, i * 2, 0); g.add(k); }
      return g; };
    // a drink: a cup with the logo, a lid and a straw; its soda (shown filling) is a dark column inside
    const makeCup = () => { const g = new THREE.Group(); const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.2, 14, 1, true), cupM); cup.position.y = 0.1; cup.material.side = THREE.DoubleSide; g.add(cup);
      const soda = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.043, 0.19, 12), new THREE.MeshLambertMaterial({ color: 0x3a1a10 })); soda.position.y = 0.1; g.add(soda); g.userData.soda = soda;
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.063, 0.063, 0.015, 14), lidM); lid.position.y = 0.205; g.add(lid); g.userData.lid = lid;
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6), new THREE.MeshLambertMaterial({ color: 0xec3013 })); straw.position.set(0.015, 0.27, 0); straw.rotation.z = 0.12; g.add(straw); g.userData.straw = straw;
      return g; };
    // the popcorn machine: a glass cabinet on the back counter, red roof, a kettle hanging inside, popcorn piled up and popping
    const PM = { x: SB.x0 + 0.85, y: 0.95, z: BZ };
    { const glass = new THREE.MeshLambertMaterial({ color: 0xcfeaf2, transparent: true, opacity: 0.28, depthWrite: false });
      box(0.95, 0.1, 0.55, new THREE.MeshLambertMaterial({ color: 0xa3222c }), PM.x, PM.y + 0.05, PM.z, false);
      box(0.95, 0.85, 0.55, glass, PM.x, PM.y + 0.52, PM.z, false);
      box(1.0, 0.16, 0.6, new THREE.MeshLambertMaterial({ color: 0xa3222c }), PM.x, PM.y + 1.03, PM.z, false);
      const signT = tex(512, 96, (c, w, h) => { c.fillStyle = '#a3222c'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.font = `900 66px ${FONT}`; c.fillText('POPCORN', w / 2, 72); });
      plane(0.92, 0.15, new THREE.MeshBasicMaterial({ map: signT }), PM.x, PM.y + 1.03, PM.z - 0.305, Math.PI);
      for (const s of [-1, 1]) for (const t of [-1, 1]) box(0.03, 0.85, 0.03, goldM, PM.x + s * 0.46, PM.y + 0.52, PM.z + t * 0.26, false);
      const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.16, 16), new THREE.MeshLambertMaterial({ color: 0xb8bcc2 })); kettle.position.set(PM.x, PM.y + 0.74, PM.z); kettle.userData.dyn = true; root.add(kettle);
      box(0.88, 0.14, 0.5, cornM, PM.x, PM.y + 0.17, PM.z, false);   // the pile's bed
      // (Ben) a real heap of popcorn on it: kernels mounded up in the middle of the glass case, highest toward the back
      { const NP = 260, heap = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.034, 0), cornM, NP), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
        for (let i = 0; i < NP; i++) { const u = Math.random() * 2 - 1, w = Math.random() * 2 - 1, hgt = Math.max(0, 1 - (u * u * 0.9 + w * w * 0.7)) * 0.2;
          v.set(PM.x + u * 0.42, PM.y + 0.24 + Math.random() * hgt, PM.z + w * 0.22); const s = 0.8 + Math.random() * 0.5; sc.set(s, s, s); m4.compose(v, q.setFromEuler(e.set(i, i * 1.7, i * 0.3)), sc); heap.setMatrixAt(i, m4); }
        snackG.add(heap); }
      // popping: kernels burst out of the kettle and tumble down onto the pile, over and over
      const N = 56, pop = new THREE.InstancedMesh(kernelGeo, cornM, N), P = [], m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
      const spawn = p => { p.x = PM.x + (Math.random() - 0.5) * 0.18; p.y = PM.y + 0.74; p.z = PM.z + (Math.random() - 0.5) * 0.18; p.vx = (Math.random() - 0.5) * 0.9; p.vy = 0.6 + Math.random() * 1.1; p.vz = (Math.random() - 0.5) * 0.6; p.r = Math.random() * 6; p.wait = Math.random() * 0.45; };   // (Ben: keep it popping: short waits, never a long pause)
      for (let i = 0; i < N; i++) { const p = {}; spawn(p); p.wait = Math.random() * 1.2; P.push(p); }
      pop.frustumCulled = false; snackG.add(pop);
      pop.userData.dyn = true; let kt = 0;
      tickers.push(dt0 => { if (!snackG.visible) return; const dt = Math.min(dt0, 0.05); kt += dt; kettle.rotation.z = Math.sin(kt * 23) * 0.05; kettle.position.y = PM.y + 0.74 + Math.abs(Math.sin(kt * 17)) * 0.008;   // (runs whenever the snack bar is drawn: you're in the cinema)
        for (let i = 0; i < N; i++) { const p = P[i];
          if (p.wait > 0) { p.wait -= dt; m4.makeScale(0, 0, 0); pop.setMatrixAt(i, m4); continue; }
          p.vy -= 3.2 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.r += dt * 8;
          if (Math.abs(p.x - PM.x) > 0.42) { p.vx = -p.vx * 0.5; p.x = PM.x + Math.sign(p.x - PM.x) * 0.42; }
          if (Math.abs(p.z - PM.z) > 0.23) { p.vz = -p.vz * 0.5; p.z = PM.z + Math.sign(p.z - PM.z) * 0.23; }
          if (p.y < PM.y + 0.25) spawn(p);
          m4.compose(v.set(p.x, p.y, p.z), q.setFromEuler(e.set(p.r, p.r * 1.3, 0)), one); pop.setMatrixAt(i, m4); }
        pop.instanceMatrix.needsUpdate = true; });
    }
    // the soda fountain, turned to face the door (west): a tall cabinet with a lit Blind Canvas Project panel, four taps, a drip tray
    const SF = { x: SB.x1 - 0.45, y: 0.95, z: BZ };
    { const g = new THREE.Group(); g.position.set(SF.x, SF.y, SF.z); g.rotation.y = Math.PI / 2; root.add(g);   // (its front, built facing -z, now faces -x)
      const steel = new THREE.MeshLambertMaterial({ color: 0x9aa0a6 }), darkM = new THREE.MeshLambertMaterial({ color: 0x2b2a29 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.55), [steel, steel, steel, steel, steel, steel]); body.position.set(0, 0.5, 0.0); g.add(body);
      const panelT = logoTex(256, 256, (c, im) => { c.fillStyle = '#1d2a6b'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#ec3013'; c.fillRect(0, 216, 256, 40); c.fillStyle = '#fff'; c.font = `900 30px ${FONT}`; c.textAlign = 'center'; c.fillText('SODA', 128, 246); logoAt(c, im, 128, 104, 170); });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), new THREE.MeshBasicMaterial({ map: panelT })); panel.position.set(0, 0.74, -0.281); panel.rotation.y = Math.PI; g.add(panel);
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.18), darkM); tray.position.set(0, 0.03, -0.36); g.add(tray);
      for (let i = 0; i < 4; i++) { const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8), darkM); tap.position.set(-0.165 + i * 0.11, 0.43, -0.31); g.add(tap);
        const lever = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.02), new THREE.MeshLambertMaterial({ color: [0xec3013, 0xf6c443, 0x2e5fd8, 0x2ea44f][i] })); lever.position.set(-0.165 + i * 0.11, 0.5, -0.33); g.add(lever); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.57), darkM); top.position.set(0, 1.03, 0); g.add(top);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.95, 0.6), ink); stand.position.set(0, -0.475, 0); g.add(stand);   // it stands on its own cabinet
    }
    // the stream, while a cup fills (shown by the fox's routine)
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), new THREE.MeshLambertMaterial({ color: 0x3a1a10 })); stream.position.set(SF.x - 0.31, SF.y + 0.3, SF.z); stream.visible = false; stream.userData.dyn = true; root.add(stream);
    // a few boxes and drinks already out on the counter
    const slots = []; for (let i = 0; i < 7; i++) slots.push({ x: SB.x0 + 0.5 + i * 0.6, item: null });
    const counterY = 1.06, counterZ = SB.z - 0.05;
    const put = (slot, kind) => { const it = kind === 'box' ? makeBox() : makeCup(); it.traverse(o => { o.userData.dyn = true; }); it.position.set(slot.x, counterY, counterZ); snackG.add(it); slot.item = it; return it; };   // (dyn: the fox moves these, so never merged)
    put(slots[1], 'box'); put(slots[2], 'cup'); put(slots[5], 'cup'); put(slots[6], 'box');
    Object.assign(snack, { PM, SF, SB, BZ, slots, counterY, counterZ, makeBox, makeCup, stream, root: snackG });
    // (s3) the snack bar's lit MENU BOARD on the wall over the back counter, ringed with bulbs
    { const mx = (SB.x0 + SB.x1) / 2, mz = C.z1 - T - 0.05, MW = 3.8, MH = 1.3, MY = 3.0;
      const menuT = tex(1024, 350, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#a3222c'; c.fillRect(0, 0, w, 112); c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#ffd27a'; c.font = `900 84px ${FONT}`; c.fillText('SNACK BAR', w / 2, 60); c.fillStyle = '#ffffff'; c.font = `800 62px ${FONT}`; ['POPCORN', 'SODA', 'CANDY'].forEach((s, i) => c.fillText(s, w * (i + 0.5) / 3, 192));
        c.fillStyle = '#ff9783'; c.font = `700 44px ${FONT}`; c.fillText('ENJOY THE SHOW', w / 2, 290); });
      box(MW + 0.2, MH + 0.2, 0.08, goldM, mx, MY, mz, false); plane(MW, MH, new THREE.MeshBasicMaterial({ map: menuT }), mx, MY, mz - 0.05, Math.PI);
      const pts = []; for (let i = 0; i <= 14; i++) { const x = mx - MW / 2 - 0.05 + i * (MW + 0.1) / 14; pts.push([x, MY + MH / 2 + 0.14], [x, MY - MH / 2 - 0.14]); } for (let i = 1; i < 5; i++) { const y = MY - MH / 2 - 0.14 + i * (MH + 0.28) / 5; pts.push([mx - MW / 2 - 0.17, y], [mx + MW / 2 + 0.17, y]); }
      const mb = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), sconceM, pts.length), m4 = new THREE.Matrix4(); pts.forEach(([x, y], i) => { m4.makeTranslation(x, y, mz - 0.07); mb.setMatrixAt(i, m4); }); snackG.add(mb);
      box(SB.x1 - SB.x0 + 0.4, 0.12, 0.1, goldM, mx, 2.2, mz - 0.03, false); }
    // (s3) a little steam off the popcorn machine's roof
    { const SN = 12, sp = new Float32Array(SN * 3), sc = new Float32Array(SN * 3), sl = Array.from({ length: SN }, () => Math.random()), sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
      const steam = new THREE.Points(sg, new THREE.PointsMaterial({ ...ADD, map: radT, size: 0.42, vertexColors: true })); steam.frustumCulled = false; snackG.add(dyn(steam));
      tickers.push(dt => { if (!snackG.visible) return; for (let i = 0; i < SN; i++) { let k = sl[i] += dt * 0.22; if (k > 1) k = sl[i] -= 1;
        sp[i * 3] = PM.x + Math.sin(i * 2.1 + k * 3) * 0.22; sp[i * 3 + 1] = PM.y + 1.15 + k * 0.9; sp[i * 3 + 2] = PM.z + Math.cos(i * 1.7) * 0.14; const a = Math.sin(k * Math.PI) * 0.3; sc[i * 3] = a; sc[i * 3 + 1] = a * 0.96; sc[i * 3 + 2] = a * 0.9; }
        sg.attributes.position.needsUpdate = true; sg.attributes.color.needsUpdate = true; }); }
    // (s3) sounds: a chime on the door as you come in, popcorn popping near the machine (own little audio, off under HUSH)
    { let ac = null, outG = null, nb = null, wasIn = null, popT = 0;
      const get = () => { if (window.HUSH) return null; if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ac = new AC(); outG = ac.createGain(); outG.gain.value = 0.8; outG.connect(ac.destination);
          nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.04), ac.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); }
        if (ac.state === 'suspended') ac.resume(); return ac.state === 'running' ? ac : null; };
      for (const e of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) addEventListener(e, () => { if (ac && ac.state !== 'running') ac.resume().catch(() => {}); }, { passive: true, capture: true });   /* (29 Oct) caught on the way down */
      const pop = v => { const a = get(); if (!a) return; const s = a.createBufferSource(); s.buffer = nb; s.playbackRate.value = 0.8 + Math.random() * 0.5; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 1800; f.Q.value = 1.4; const g = a.createGain(); g.gain.value = v; s.connect(f); f.connect(g); g.connect(outG); s.start(); };
      const chime = () => { const a = get(); if (!a) return; const t0 = a.currentTime; [[1318.5, 0], [1046.5, 0.34]].forEach(([fq, dt]) => { for (const [type, mul, vol] of [['sine', 1, 0.11], ['triangle', 2, 0.025]]) { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = fq * mul; g.gain.setValueAtTime(0, t0 + dt); g.gain.linearRampToValueAtTime(vol, t0 + dt + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t0 + dt + 1.5); o.connect(g); g.connect(outG); o.start(t0 + dt); o.stop(t0 + dt + 1.6); } }); };
      out2.player = (x, y, z, dt) => { const inB = x > FX + T && x < C.x1 && z > C.z0 && z < C.z1 && y < 6;
        if (wasIn === false && inB && Math.abs(z - cz) < ENT / 2 + 0.6 && x < FX + 3) chime(); wasIn = inB;
        const d = Math.hypot(x - PMW.x, z - PMW.z); if (inB && d < 8) { popT -= dt; if (popT <= 0) { popT = 0.06 + Math.random() * 0.35; pop(0.08 * (1 - d / 8)); } } }; }
    for (const x of [SB.x0 - 0.12, SB.x1 + 0.12]) box(0.24, 1.0, 1.6, null, x, 0.5, C.z1 - T - 1.6).visible = false;   // (no squeezing round the ends)
    { const O = [77.3, 9.3], pivot = new THREE.Group(), inner = new THREE.Group(); pivot.position.set(LX - 1.3, 0, cz); pivot.rotation.y = Math.PI / 2; inner.position.set(-O[0], 0, -O[1]); pivot.add(inner);
      for (const o of root.children.slice(n0)) inner.add(o); root.add(pivot);
      PMW.x = LX - 1.3 + (PM.z - O[1]); PMW.z = cz - (PM.x - O[0]); snack.root = snackG; snack.frame = inner; }
    // the lobby: a gold rope line to the doors, posters on the south wall
    // (Ben) the rope line now stops at the front door (no ropes inside)
    // (22 Oct) a navy runner between the ropes, gold-edged, with the Blind Canvas Project logo in gold, read as you walk in
    logoRug(3.8, 4.8, 448, 566, (c, w, h) => rugEdge(c, w, h, '#1d2a6b', '#c9a14a'), [[224, 283, 280, '#e9c98a', 0.95]], 77.0, 0.068, cz, -Math.PI / 2);
    out2.staff = [{ x: 77.3, z: C.z1 - T - 1.25, face: Math.PI, role: 'snacks' }, { x: FX - 1.0, z: cz - 4.0, face: -Math.PI / 2, role: 'tickets' }];
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
      for (let i = 1; i < 6; i++) { bulbPts.push([cx0, y1 - (y1 - y0) * i / 6, z1]); bulbPts.push([cx0, y1 - (y1 - y0) * i / 6, z0]); }
      // (s1 cinema polish) chasing bulbs round both poster cases too
      for (const s of [-1, 1]) { const pz = cz + s * 8.6, px = FX - 0.26;
        for (let i = 0; i <= 8; i++) { const z = pz - 1.3 + i * 2.6 / 8; bulbPts.push([px, 4.26, z], [px, 0.54, z]); }
        for (let i = 1; i < 9; i++) { const y = 0.54 + i * 3.72 / 9; bulbPts.push([px, y, pz - 1.36], [px, y, pz + 1.36]); } } }
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbPts.length);
    { const m4 = new THREE.Matrix4(); bulbPts.forEach((p, i) => { m4.makeTranslation(...p); bulbs.setMatrixAt(i, m4); bulbs.setColorAt(i, new THREE.Color(0xffd27a)); }); root.add(bulbs); }
    const on = new THREE.Color(0xfff1c4), off = new THREE.Color(0x8a5a22); let chase = 0, chaseT = 0;
    tickers.push(dt => { chaseT += dt; if (chaseT < 0.14) return; chaseT = 0; chase = (chase + 1) % 3; for (let i = 0; i < bulbPts.length; i++) bulbs.setColorAt(i, (i % 3) === chase ? off : on); bulbs.instanceColor.needsUpdate = true; });
    // the entrance: red doors swung open, a red carpet out front
    for (const s of [-1, 1]) { const dw = ENT / 2 - 0.1; box(0.08, EH - 0.2, dw, new THREE.MeshLambertMaterial({ color: 0x8e1c24 }), FX + T + 0.06, (EH - 0.2) / 2, cz + s * (ENT / 2 + dw / 2), false); box(0.1, 0.08, 0.5, gold, FX + T + 0.12, 1.2, cz + s * (ENT / 2 + 0.4), false); }   // folded back against the wall inside
    // (s1 cinema polish) the red carpet: woven red with a gold border and a small gold diamond, out to the walk; brass posts on round
    // feet with velvet ropes that sag between them
    { const CL = 7.4, CW = 3.6;
      const carpetT = tex(256, 512, (c, w, h) => { c.fillStyle = '#9e1f28'; c.fillRect(0, 0, w, h); c.fillStyle = '#86161f'; for (let y = 0; y < h; y += 6) c.fillRect(0, y, w, 2);
        c.fillStyle = '#c9a14a'; c.fillRect(10, 0, 10, h); c.fillRect(w - 20, 0, 10, h); c.fillRect(28, 0, 3, h); c.fillRect(w - 31, 0, 3, h);
        for (let y = 40; y < h; y += 96) { c.save(); c.translate(w / 2, y); c.rotate(Math.PI / 4); c.fillRect(-9, -9, 18, 18); c.restore(); } }, [1, 2]);
      const runner = plane(CW, CL, new THREE.MeshLambertMaterial({ map: carpetT, polygonOffset: true, polygonOffsetFactor: -2 }), FX - CL / 2, 0.03, cz); runner.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      const knobG = new THREE.SphereGeometry(0.1, 10, 8), footG = new THREE.CylinderGeometry(0.17, 0.2, 0.05, 14), rope = new THREE.MeshLambertMaterial({ color: 0x8e1c24 });
      for (const s of [-1, 1]) { const pz = cz + s * 2.1, xs = [0, 1, 2, 3].map(i => FX - 0.9 - i * 1.95);
        for (const px of xs) { box(0.08, 0.95, 0.08, gold, px, 0.475, pz, false); const k = new THREE.Mesh(knobG, gold); k.position.set(px, 1.0, pz); root.add(k); const f = new THREE.Mesh(footG, gold); f.position.set(px, 0.03, pz); root.add(f); }
        for (let i = 0; i < 3; i++) { const a = new THREE.Vector3(xs[i], 0.9, pz), b = new THREE.Vector3(xs[i + 1], 0.9, pz), m = a.clone().lerp(b, 0.5); m.y -= 0.2;
          root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 10, 0.03, 6), rope)); } } }
    // poster cases: this film on the left, the next on the right
    const posters = [];
    for (const s of [-1, 1]) { const pz = cz + s * 8.6;
      box(0.2, 3.4, 2.5, ink, FX - 0.1, 2.4, pz, false); box(0.22, 0.06, 2.5, gold, FX - 0.11, 4.13, pz, false); box(0.22, 0.06, 2.5, gold, FX - 0.11, 0.67, pz, false);
      // (s1 cinema polish) framed and lit: gold sides, a deco hood on top with a lamp strip under it, a little ledge below
      for (const t of [-1, 1]) box(0.24, 3.52, 0.07, gold, FX - 0.12, 2.4, pz + t * 1.22, false);
      box(0.55, 0.16, 2.9, ink, FX - 0.27, 4.42, pz, false); box(0.57, 0.04, 2.92, gold, FX - 0.27, 4.52, pz, false); box(0.04, 0.03, 2.5, sconceM, FX - 0.5, 4.33, pz, false);
      box(0.36, 0.1, 2.7, ink, FX - 0.18, 0.4, pz, false);
      // (Ben) Ben Fox's film posters: SURFING WHILE BLIND on the left, WHAT IS GOALBALL? on the right (3:4)
      const pm = new THREE.MeshBasicMaterial({ color: 0x111111 }); loadInto(pm, s < 0 ? 'gallery/img2/poster_surfing_while_blind.jpg' : 'gallery/img2/poster_what_is_goalball.jpg');
      plane(2.3, 3.07, pm, FX - 0.21, 2.4, pz, -Math.PI / 2); posters.push({ fixed: true }); }
    // the ticket booth: to the left of the doors, glass all round, a little dome, TICKETS
    // (s1 cinema polish) the ticket booth: clear glass so you see the fox inside, gold corner posts, a warm light in its ceiling, a
    // round brass speaking grille with a ledge and ticket slot in front, TICKETS on a deep band, a red dome with a gold finial
    { const bx = FX - 1.0, bz = cz - 4.0;
      box(1.5, 1.0, 1.5, gold, bx, 0.5, bz); box(1.54, 0.08, 1.54, ink, bx, 1.04, bz, false);
      box(1.4, 1.42, 1.4, new THREE.MeshLambertMaterial({ color: 0xd6f1f6, transparent: true, opacity: 0.14, depthWrite: false }), bx, 1.79, bz, false);
      for (const s of [-1, 1]) for (const t of [-1, 1]) box(0.07, 1.44, 0.07, gold, bx + s * 0.7, 1.79, bz + t * 0.7, false);
      box(1.3, 0.03, 1.3, sconceM, bx, 2.49, bz, false);
      const grille = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), new THREE.MeshBasicMaterial({ map: tex(128, 128, (c, w, h) => { c.fillStyle = '#c9a14a'; c.beginPath(); c.arc(64, 64, 64, 0, 7); c.fill(); c.strokeStyle = '#5a4520'; c.lineWidth = 5; for (const r of [16, 32, 48]) { c.beginPath(); c.arc(64, 64, r, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(64, 4); c.lineTo(64, 124); c.moveTo(4, 64); c.lineTo(124, 64); c.stroke(); }) }));
      grille.position.set(bx - 0.715, 1.72, bz); grille.rotation.y = -Math.PI / 2; root.add(grille);
      box(0.32, 0.05, 0.9, gold, bx - 0.86, 1.1, bz, false); box(0.02, 0.05, 0.5, ink, bx - 0.712, 1.16, bz, false);
      box(1.56, 0.4, 1.56, ink, bx, 2.7, bz, false); box(1.6, 0.05, 1.6, gold, bx, 2.92, bz, false);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.78, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xa3222c })); dome.position.set(bx, 2.94, bz); root.add(dome);
      box(0.05, 0.5, 0.05, gold, bx, 3.95, bz, false); const fin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), gold); fin.position.set(bx, 4.24, bz); root.add(fin);
      plane(1.4, 0.34, new THREE.MeshBasicMaterial({ map: tex(512, 124, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.font = `800 92px ${FONT}`; c.fillText('TICKETS', w / 2, 96); }) }), bx - 0.79, 2.7, bz, -Math.PI / 2); }
    // ---- (s1 cinema polish) the art-deco front
    { const creamF = new THREE.MeshLambertMaterial({ color: 0xeadbbf }), stone = new THREE.MeshLambertMaterial({ color: 0x2c2826 });
      // the tower steps up twice more over the sunburst, each step capped in ink, then a gold spire with a red tip
      box(0.5, 1.0, 5.4, cream, FX + 0.1, 14.22, cz, false); box(0.52, 0.1, 5.6, ink, FX + 0.1, 14.77, cz, false);
      box(0.5, 0.8, 2.6, cream, FX + 0.1, 15.22, cz, false); box(0.52, 0.1, 2.8, ink, FX + 0.1, 15.67, cz, false);
      box(0.08, 1.6, 0.08, gold, FX + 0.1, 16.5, cz, false); { const tip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), red); tip.position.set(FX + 0.1, 17.35, cz); root.add(tip); }
      for (const s of [-1, 1]) for (const k of [0.9, 1.9]) box(0.12, 2.0, 0.1, gold, FX - 0.17, 12.3, cz + s * k, false);   // gold ribs either side of the sunburst's heart
      // fluted fins on the wall above the crown, four a side, gold-edged
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const z = cz + s * (4.5 + i * 0.46); box(0.34, 2.8, 0.16, creamF, FX - 0.17, 9.5, z, false); box(0.04, 2.8, 0.16, gold, FX - 0.35, 9.5, z, false); }
      // a zigzag frieze under the top band, gold on ink, from end pilaster to end pilaster
      const zig = tex(512, 64, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a14a'; c.lineWidth = 7; c.beginPath(); for (let x = 0; x <= w; x += 32) c.lineTo(x, (x / 32) % 2 ? 14 : 50); c.stroke(); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 5); c.fillRect(0, h - 5, w, 5); }, [10, 1]);
      plane(W - 1.2, 0.55, new THREE.MeshLambertMaterial({ map: zig }), FX - 0.03, 10.65, cz, -Math.PI / 2);
      // a dark stone plinth along the foot of the front, and a gold frame round the doors
      for (const s of [-1, 1]) { const za = cz + s * ENT / 2, zb = s < 0 ? C.z0 : C.z1; box(0.14, 0.62, Math.abs(zb - za), stone, FX - 0.07, 0.31, (za + zb) / 2, false); box(0.14, EH, 0.14, gold, FX - 0.07, EH / 2, za + s * 0.07, false); }
      box(0.14, 0.14, ENT + 0.28, gold, FX - 0.07, EH + 0.07, cz, false);
      // the EYE-LEVEL DOOR SIGN, right of the doors (the plant that stood there is gone): big white CINEMA on ink, ENTER pointing in
      const signT = tex(1024, 640, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 26); c.fillRect(0, h - 26, w, 26); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#ffd27a'; c.font = `800 82px ${FONT}`; c.fillText('BLIND CAN', 56, 136); c.fillStyle = '#ffffff'; fitText(c, 'CINEMA', w - 112, 250, 900, FONT); c.fillText('CINEMA', 50, 370);
        c.fillStyle = '#ffffff'; c.font = `800 104px ${FONT}`; c.fillText('◀ ENTER', 56, 540); });
      box(0.1, 1.84, 2.94, gold, FX - 0.05, 1.72, cz + 4.5, false); plane(2.8, 1.75, new THREE.MeshBasicMaterial({ map: signT }), FX - 0.11, 1.72, cz + 4.5, -Math.PI / 2);
      // the brick sides and back: piers, a dark plinth and a cream coping, so the long walls aren't flat
      const pier = brick(0.7, H), cx = (C.x0 + C.x1) / 2;
      for (const [z, n] of [[C.z0, -1], [C.z1, 1]]) { for (const x of [77.4, 81.2, 85, 88.8]) box(0.7, H, 0.22, pier, x, H / 2, z + n * 0.11, false);
        box(D, 0.7, 0.16, stone, cx, 0.35, z + n * 0.08, false); box(D, 0.32, 0.3, creamF, cx, H - 0.1, z + n * 0.1, false); }
      for (const z of [-7.5, -2.5, 2.5, 7.5]) box(0.22, H, 0.7, pier, C.x1 + 0.11, H / 2, cz + z, false);
      box(0.16, 0.7, W, stone, C.x1 + 0.08, 0.35, cz, false); box(0.3, 0.32, W + 0.6, creamF, C.x1 + 0.1, H - 0.1, cz, false);
    }
    // ---- (s1 cinema polish) the glow out front: a halo on every bulb and warm pools on the ground under the marquee, the poster
    // cases and the booth. No real lights; faint by day, warm at golden hour, full at night (sky() from the world)
    { const glowM = [];
      const radT = tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(0.45, 'rgba(255,190,110,0.35)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
      const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: radT };
      const halo = new THREE.PointsMaterial({ ...add, size: 0.7, opacity: 0.7 }); glowM.push([halo, 0.9]);
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(bulbPts.flat().map((v, i) => i % 3 === 0 ? v - 0.05 : v), 3));
      const haloP = new THREE.Points(hg, halo); haloP.userData.dyn = true; root.add(haloP);
      const poolM = new THREE.MeshBasicMaterial({ ...add, opacity: 0.5, polygonOffset: true, polygonOffsetFactor: -4 }); glowM.push([poolM, 0.55]);
      const pool = (w, d, x, z) => { const p = plane(w, d, poolM, x, 0.06, z); p.rotation.x = -Math.PI / 2; p.userData.dyn = true; };
      pool(5.5, 15, FX - 2.4, cz); for (const s of [-1, 1]) pool(3.2, 4, FX - 1.2, cz + s * 8.6); pool(3, 3, FX - 1.0, cz - 4.0);
      let gk = 0.7; tickers.push(dt => { let m = 'golden'; try { m = sky ? sky() : 'golden'; } catch (e) {} const tg = m === 'night' ? 1 : m === 'golden' ? 0.7 : 0.2; gk += (tg - gk) * Math.min(1, dt * 1.5); for (const [mt, b] of glowM) mt.opacity = b * gk; }); }
    // the shows (22 Oct: one per screen): each screen's film at fixed showtimes, locked to the clock so everyone in that theatre
    // sees the same frame; between shows a countdown. The left poster case is Screen 1's film, the right Screen 2's.
    const shows = theatres.map((th, i) => {
      const F = CINEMA_PROGRAM[i] || CINEMA_SHOW, film = { ...F, u: 'cinema' + th.n + ':' + F.file, local: F.hls ? 'gallery/video/' + F.file + '/index.m3u8' : (window.GMEDIA || (u => u))('gallery/video/' + F.file + '.mp4'), im: null };   /* (29 Oct) hls: the film as streaming pieces */
      const screen = { u: film.u, local: film.local, box: th.scr, faces: [1], posterMat: th.posterMat, vol: 0.9, dist: 20, reach: 30, minVol: 0.05, p: [th.SX, th.SY, th.c], zone: th.zone, cinema: true, F, show: () => showtime(Date.now(), F) };
      screens.push(screen);
      const sh = { F, film, screen, th };
      sh.setPoster = () => { const im = film.im; if (!im || !im.complete || !im.naturalWidth) return; const t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; if (th.posterMat.map) th.posterMat.map.dispose(); th.posterMat.map = t; th.posterMat.color.set(0xffffff); th.posterMat.needsUpdate = true; };
      film.im = img('gallery/img2/cinema_' + F.file + '.webp', () => { draw(true); sh.setPoster(); });
      sh.cd = { cv: document.createElement('canvas') }; sh.cd.cv.width = 1024; sh.cd.cv.height = 576; sh.cd.t = new THREE.CanvasTexture(sh.cd.cv); sh.cd.t.colorSpace = THREE.SRGBColorSpace;
      sh.cdPlane = plane(th.VW * 0.9, th.VH * 0.9, new THREE.MeshBasicMaterial({ map: sh.cd.t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), th.SX - 0.26, th.SY, th.c, -Math.PI / 2); sh.cdPlane.userData.dyn = true; sh.cdPlane.visible = false;   // (s3: projected onto the closed curtains)
      // (s3) curtains open over 5 s as the film starts and close after it ends; house lights dim as they open; the projector beam
      let tt = 0; tickers.push(dt => { tt += dt; const cp = cam && cam.position; if (cp && Math.hypot(cp.x - 84, cp.z - th.c) > 45) return;
        const S = showtime(Date.now(), F), P = F.every * 60; let k = S.on ? Math.min(1, S.t / 5) : Math.max(0, 1 - ((P - S.nextIn) - F.len) / 5); k = k * k * (3 - 2 * k);
        const half = th.VW / 2 + 0.3, w = half - (half - 0.45) * k; for (const { m, s } of th.curt) { m.scale.z = w; m.position.z = th.c + s * (half - w / 2); }
        const lit = 1 - 0.85 * k; th.houseM.color.setRGB(lit, lit * 0.82, lit * 0.54); th.washM.opacity = 0.5 * lit;
        th.beam.visible = k > 0.02; th.beamM.opacity = 0.05 * k * (0.86 + 0.14 * Math.sin(tt * 37) * Math.sin(tt * 13.1)); th.lensM.color.setRGB(0.23 + 0.77 * k, 0.18 + 0.76 * k, 0.12 + 0.72 * k); });
      return sh;
    });
    function filmPoster(P, sh) {
      const film = sh.film, c = P.cv.getContext('2d'), w = P.cv.width, h = P.cv.height; c.fillStyle = '#1a0d10'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a14a'; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
      c.fillStyle = '#ffd27a'; c.textAlign = 'center'; c.font = `800 34px ${FONT}`; c.fillText('NOW SHOWING · SCREEN ' + sh.th.n, w / 2, 84);
      const im = film.im; if (im && im.complete && im.naturalWidth) { const iw = w - 70, ih = Math.min(330, iw * im.naturalHeight / im.naturalWidth); c.drawImage(im, 35, 120, iw, ih); }
      let fs = 54, L; do { c.font = `800 ${fs}px ${FONT}`; L = wrap(c, film.title, w - 80); fs -= 4; } while (L.length > 3 && fs > 30);
      c.fillStyle = '#fff'; L.slice(0, 3).forEach((l, i) => c.fillText(l, w / 2, 530 + i * (fs + 12)));
      c.fillStyle = '#e8d9b8'; c.font = `500 26px ${FONT}`; c.fillText(film.kicker, w / 2, 500);
      c.fillStyle = '#ec3013'; c.font = `800 28px ${FONT}`; c.fillText('Every ' + sh.F.every + ' min · BLIND CAN CINEMA', w / 2, h - 50); P.t.needsUpdate = true;
    }
    let lastKey = '', lastMin = -1;
    function draw(force) {
      const SS = shows.map(sh => showtime(Date.now(), sh.F)), key = SS.map(S => S.on ? 'on' + Math.floor(S.start / 60000) : 'off' + Math.ceil(S.nextIn)).join('|'); if (key === lastKey && !force) return; lastKey = key;
      const S = SS[0], film = shows[0].film, c = lb.cv.getContext('2d'), w = lb.cv.width, h = lb.cv.height;
      c.fillStyle = '#fdf8ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d1c1b'; c.textAlign = 'center';
      c.font = `800 40px ${FONT}`; c.fillText(S.on ? 'SCREEN 1 · NOW SHOWING  ·  STARTED ' + hhmm(S.start) : 'SCREEN 1 · NEXT SHOWTIME ' + hhmm(S.next) + '  ·  IN ' + mmss(S.nextIn), w / 2, 56);
      fitText(c, film.title.toUpperCase(), w - 120, 108); c.fillText(film.title.toUpperCase(), w / 2, 168); lb.t.needsUpdate = true;
      const m = Math.floor(Date.now() / 60000); if (m !== lastMin || force) { lastMin = m; shows.forEach((sh, i) => posters[i] && !posters[i].fixed && filmPoster(posters[i], sh)); lobbyPosters.forEach((P, i) => shows[i] && filmPoster(P, shows[i])); }
      shows.forEach((sh, i) => { const S = SS[i], film = sh.film;
        // the sign over its doorway in the lobby
        { const ds = doorSigns[i], g = ds.cv.getContext('2d'), W2 = ds.cv.width, H2 = ds.cv.height; g.fillStyle = '#1d1c1b'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#ec3013'; g.fillRect(0, H2 - 14, W2, 14);
          g.textAlign = 'center'; g.fillStyle = '#ffd27a'; g.font = `800 64px ${FONT}`; g.fillText('SCREEN ' + sh.th.n, W2 / 2, 82);
          g.fillStyle = '#fff'; fitText(g, film.title, W2 - 80, 56, 700); g.fillText(film.title, W2 / 2, 168);
          g.fillStyle = '#ff9783'; g.font = `600 40px ${FONT}`; g.fillText(S.on ? 'Now showing · started ' + hhmm(S.start) : 'Next show ' + hhmm(S.next) + ' · in ' + mmss(S.nextIn), W2 / 2, 238); ds.tx.needsUpdate = true; }
        sh.cdPlane.visible = !S.on;
        if (!S.on) {   // the countdown on its screen
          const g = sh.cd.cv.getContext('2d'), W2 = sh.cd.cv.width, H2 = sh.cd.cv.height; g.fillStyle = '#0b0a0c'; g.fillRect(0, 0, W2, H2);
          const im = film.im; if (im && im.complete && im.naturalWidth) { g.globalAlpha = 0.35; g.drawImage(im, 0, 0, W2, H2); g.globalAlpha = 1; }
          g.textAlign = 'center'; g.fillStyle = '#ffd27a'; g.font = `800 40px ${FONT}`; g.fillText('SCREEN ' + sh.th.n + '  ·  NEXT SHOWTIME  ·  ' + hhmm(S.next), W2 / 2, 120);
          g.fillStyle = '#fff'; g.font = `800 190px ${FONT}`; g.fillText(mmss(S.nextIn), W2 / 2, 330);
          g.font = `800 40px ${FONT}`; fitText(g, film.title.toUpperCase(), W2 - 120, 44); g.fillText(film.title.toUpperCase(), W2 / 2, 430);
          g.fillStyle = '#ff9783'; g.font = `600 28px ${FONT}`; g.fillText('Take a seat · everyone watches together', W2 / 2, 500); sh.cd.t.needsUpdate = true;
        } });
    }
    draw(true);
    // redraw once a second, only when you're near enough to see it
    let acc = 0; tickers.push(dt => { acc += dt; if (acc < 0.5) return; acc = 0; const cp = cam && cam.position; if (!cp || Math.hypot(cp.x - (C.x0 + C.x1) / 2, cp.z - cz) < 140) draw(false); });
    const at = (x, z) => shows.find(sh => x > LX && z > sh.th.z0 - 0.2 && z < sh.th.z1 + 0.2) || shows[0];   // the screen whose theatre you're in (else Screen 1)
    return { screen: shows[0].screen, screens: shows.map(sh => sh.screen), next: () => shows[0].screen.u, now: () => shows[0].film, show: () => showtime(Date.now(), shows[0].F),
      showAt: (x, z) => showtime(Date.now(), at(x, z).F), filmAt: (x, z) => at(x, z).film, rect: C, staff: out2.staff, snack, audience: out2.audience, player: out2.player };
  })();

  // ============================================================ back in the museum: the AMB room's old doorway, the Wall of Why's pointer
  const boardT = (kicker, title, lines, cta) => tex(1024, 768, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 16);
    c.fillStyle = '#ff9783'; c.font = `800 36px ${FONT}`; c.fillText(kicker, 60, 100);
    c.fillStyle = '#fff'; c.font = `800 82px ${FONT}`; let y = 200; for (const l of title) { fitText(c, l, w - 120, 82); c.fillText(l, 58, y); y += 88; }
    c.font = `500 36px ${FONT}`; c.fillStyle = '#e9e5e5'; y += 20; for (const l of lines) { c.fillText(l, 60, y); y += 48; }
    c.fillStyle = '#ec3013'; c.fillRect(60, h - 120, w - 120, 76); c.fillStyle = '#fff'; c.font = `800 38px ${FONT}`; c.textAlign = 'center'; c.fillText(cta, w / 2, h - 70); });
  const gotos = [];
  {   // the south corridor (the AMB's old way in) now leads on to the New Artists Wing's south half (22 Oct): roof over its open end
    box(8.6, 0.3, 4.4, new THREE.MeshLambertMaterial({ color: 0xf6f5f3 }), -70.25, 4.75, -29.8, false);
  }
  {   // the Wall of Why: a board on the low east wall across from the portraits
    const y0 = -3.14, x = -66.3, z = 14.5;
    box(0.12, 2.9, 3.6, ink, x, y0 + 1.45 + 0.6, z, false); box(0.14, 0.07, 3.62, red, x, y0 + 3.55, z, false);
    plane(3.4, 2.55, new THREE.MeshBasicMaterial({ map: boardT('THE WALL OF WHY', ['Add your own why'], ['Write it, say it in your own voice, add', 'a photo of you or your art. It hangs on', 'the walls of the WHY House, in the park.'], 'TAP TO GO TO THE WHY HOUSE  →') }), x - 0.07, y0 + 2.05, z, -Math.PI / 2);
    gotos.push({ x: x - 1.6, y: y0, z, r: 3.0, to: 'why', label: 'The WHY House · leave your own why' });
  }
  near.push(pl => { for (const g of gotos) if (Math.hypot(pl.x - g.x, pl.z - g.z) < g.r && Math.abs(pl.y - g.y) < 2.2) return { kind: 'goto', item: { z: g.to.length, to: g.to }, label: g.label }; return null; });

  // ============================================================ the Academy's grand piano (play it: gallery-piano.js)
  // On the stage in the AMB's second room (22 Oct; it stood in the middle of the main room): turned to face the room's doorway,
  // so you sit behind it and play out to the room. Gloss-black case with the lid propped open, 5 octaves of keys (C2-C7) that dip
  // as notes play, a bench. (Built facing -z, then the whole group turned: STAGE.ry; W() maps its local x/z into the world.)
  const STAGE = { x0: 63.9, x1: 69.4, z0: -47.5, z1: -32.5, y: AMB_FLOOR, top: AMB_FLOOR + 0.45, ry: Math.PI / 2 };
  const W = (X, Z, lx, lz) => [X + lx * Math.cos(STAGE.ry) + lz * Math.sin(STAGE.ry), Z - lx * Math.sin(STAGE.ry) + lz * Math.cos(STAGE.ry)];
  {   // the stage itself: an ink-sided platform with a plank top, a step along its front, a red edge
    const S = STAGE, cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2, w = S.x1 - S.x0, d = S.z1 - S.z0, h = S.top - S.y;
    const plank = woodify(new THREE.MeshLambertMaterial({ color: 0xd9c4a8 }), wood);
    box(w, h, d, [ink, ink, plank, ink, ink, ink], cx, S.y + h / 2, cz);
    box(0.6, h / 2, d - 1.2, [ink, ink, plank, ink, ink, ink], S.x0 - 0.3, S.y + h / 4, cz);
    box(0.05, 0.05, d, red, S.x0 + 0.02, S.top - 0.03, cz, false);
  }
  const piano = (() => {
    const PX = 66.1, PZ = -44.2, Y0 = STAGE.top, g = new THREE.Group(); g.position.set(PX, Y0, PZ); g.rotation.y = STAGE.ry; root.add(g); inside.push([g, 'amb']);
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
    { const [cx, cz] = W(PX, PZ, 0, -1.0); box(2.05, 1.0, 1.55, null, cx, Y0 + 0.5, cz).visible = false; }   // (turned a quarter: its length runs along x)
    const [bx, bz] = W(PX, PZ, 0, 0.72), [nx, nz] = W(PX, PZ, 0, 0.9), [ax, az] = W(PX, PZ, 0, -0.8);
    const bench = { x: bx, z: bz, ry: STAGE.ry, len: 0.9, dir: -1, top: Y0 + 0.55, name: 'Piano bench' };
    benches.push(bench);
    near.push(pl => Math.hypot(pl.x - nx, pl.z - nz) < 1.7 && Math.abs(pl.y - Y0) < 1.2 ? { kind: 'piano', item: { z: 3 }, label: 'Grand piano · play it' } : null);
    return { x: ax, y: Y0 + 1.0, z: az, bench, press(m, down) { const k = keys.get(m); if (k) place(k.im, k.i, k.x, k.y, k.z, down); } };
  })();

  // ============================================================ the band corner (22 Oct): a drum kit east of the piano and an electric
  // guitar on its stand (with a little amp) to the west, all facing the film wall like the piano. Sit on the drum stool or the guitar
  // stool and play (gallery-band.js); the drums jump when they're hit and the guitar's strings shiver.
  const band = (() => {
    const Y0 = STAGE.top, out = { drums: null, guitar: null };
    const chrome = new THREE.MeshPhongMaterial({ color: 0xc8ccd2, specular: 0xffffff, shininess: 80 }), blackM = new THREE.MeshLambertMaterial({ color: 0x151515 });
    const brassC = new THREE.MeshPhongMaterial({ color: 0xc99a3a, specular: 0xffe2a0, shininess: 70, side: THREE.DoubleSide });
    const shellM = new THREE.MeshPhongMaterial({ color: 0xc81e14, specular: 0x884444, shininess: 60 }), headM = new THREE.MeshLambertMaterial({ color: 0xf2efe6 });
    const cyl = (rt, rb, h, m, seg = 20) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    const dyn = o => { o.traverse(c => { c.userData.dyn = true; }); return o; };
    const stool = (g, x, z) => { const s = cyl(0.19, 0.19, 0.08, blackM); s.position.set(x, 0.52, z); g.add(s); const p = cyl(0.025, 0.025, 0.48, chrome, 8); p.position.set(x, 0.25, z); g.add(p);
      for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.28), chrome); const a = i * 2.094; l.position.set(x + Math.sin(a) * 0.12, 0.03, z + Math.cos(a) * 0.12); l.rotation.y = a; g.add(l); } };
    // ---------------- the drum kit
    {
      // (the kit is built at a natural size, then scaled up K so it reads from across the room; its stool stays normal size)
      const DX = 65.3, DZ = -40, K = 1.35, SZ = 1.38, g = new THREE.Group(); g.position.set(DX, Y0, DZ); g.rotation.y = STAGE.ry; g.scale.setScalar(K); root.add(g); inside.push([g, 'amb']);
      const pieces = {};
      // a drum: shell + two heads + chrome hoops, in its own group so it can jump when hit
      const drum = (name, r, h, x, y, z, tiltX = 0, logo = null) => {
        const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.x = tiltX; g.add(d);
        d.add(cyl(r, r, h, shellM)); for (const s of [1, -1]) { const hd = cyl(r * 0.99, r * 0.99, 0.004, headM); hd.position.y = s * h / 2; d.add(hd); const hp = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 24), chrome); hp.rotation.x = Math.PI / 2; hp.position.y = s * h / 2; d.add(hp); }
        if (logo) { const f = new THREE.Mesh(new THREE.CircleGeometry(r * 0.97, 28), new THREE.MeshBasicMaterial({ map: logo })); f.position.y = -h / 2 - 0.003; f.rotation.x = Math.PI / 2; d.add(f); }
        d.userData.base = { y, s: 1, rx: tiltX }; pieces[name] = dyn(d); return d; };
      const cymbal = (name, r, x, y, z, tilt) => {
        const st = cyl(0.012, 0.012, y, chrome, 8); st.position.set(x, y / 2, z); g.add(st);
        for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.3), chrome); const a = i * 2.094; l.position.set(x + Math.sin(a) * 0.13, 0.04, z + Math.cos(a) * 0.13); l.rotation.y = a; g.add(l); }
        const c = new THREE.Group(); c.position.set(x, y + 0.02, z); c.rotation.x = tilt; g.add(c);
        const geo = new THREE.ConeGeometry(r, 0.035, 32, 1, true); const m = new THREE.Mesh(geo, brassC); c.add(m); const bell = new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 12, 6, 0, 6.283, 0, 1.4), brassC); bell.position.y = 0.012; c.add(bell);
        c.userData.base = { y: y + 0.02, s: 1, rx: tilt }; pieces[name] = dyn(c); return c; };
      // the kick drum, lying on its side, the AMB logo on its front head (facing the film wall, away from the drummer)
      // the front head: the real AMB logo on black (drawn in when the image loads)
      const kickLogo = texLive(512, 512, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); });
      img('gallery/img/amb_logo_270127889.webp', im => { const c = kickLogo.image.getContext('2d'), w = 512; c.fillStyle = '#111'; c.fillRect(0, 0, w, w);
        c.strokeStyle = '#ec3013'; c.lineWidth = 14; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 12, 0, 6.283); c.stroke();
        const k = Math.min(w * 0.74 / im.width, w * 0.6 / im.height); c.drawImage(im, (w - im.width * k) / 2, (w - im.height * k) / 2, im.width * k, im.height * k); kickLogo.needsUpdate = true; });
      kickLogo.center.set(0.5, 0.5); kickLogo.rotation = Math.PI;
      const kick = drum('kick', 0.29, 0.42, 0, 0.31, -0.05, Math.PI / 2, kickLogo);
      for (const s of [1, -1]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.25), chrome); sp.position.set(s * 0.26, 0.05, -0.32); sp.rotation.x = 0.5; g.add(sp); }   // spurs
      const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.24), blackM); pedal.position.set(0, 0.04, 0.3); pedal.rotation.x = -0.18; g.add(pedal);
      drum('snare', 0.18, 0.13, -0.38, 0.66, 0.5, -0.12);
      { const st = cyl(0.012, 0.012, 0.58, chrome, 8); st.position.set(-0.38, 0.29, 0.5); g.add(st); }
      drum('tom1', 0.14, 0.2, -0.17, 0.82, 0.02, -0.35); drum('tom2', 0.16, 0.22, 0.18, 0.83, 0.02, -0.35);
      { const m = cyl(0.012, 0.012, 0.25, chrome, 8); m.position.set(0, 0.68, 0); g.add(m); }
      drum('floor', 0.22, 0.36, 0.56, 0.48, 0.42);
      for (const [lx, lz] of [[0.4, 0.3], [0.72, 0.3], [0.56, 0.62]]) { const l = cyl(0.01, 0.01, 0.3, chrome, 6); l.position.set(lx, 0.15, lz); g.add(l); }
      // hi-hat: two cymbals on one stand, left of the snare
      cymbal('hihat', 0.17, -0.78, 0.92, 0.42, -0.08); { const top = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.03, 32, 1, true), brassC); top.rotation.x = Math.PI; top.position.y = 0.035; pieces.hihat.add(top); dyn(top); }
      cymbal('crash', 0.24, -0.62, 1.36, -0.22, -0.28); cymbal('ride', 0.28, 0.82, 1.22, -0.08, -0.22);
      { const sg = new THREE.Group(); sg.position.set(DX, Y0, DZ); sg.rotation.y = STAGE.ry; root.add(sg); stool(sg, 0, SZ); }
      // sticks resting on the snare
      for (const s of [-0.03, 0.03]) { const st = cyl(0.007, 0.007, 0.4, new THREE.MeshLambertMaterial({ color: 0xd9b27a }), 6); st.rotation.z = Math.PI / 2; st.rotation.y = 0.3 + s * 3; st.position.set(-0.38, 0.74, 0.5 + s); g.add(st); }
      // solid: the kit (walk round it); the stool stays clear so you can sit on it
      { const [cx, cz] = W(DX, DZ, 0, 0.2); box(1.55, 1.8, 2.5, null, cx, Y0 + 0.9, cz).visible = false; }
      { const [cx, cz] = W(DX, DZ, 0, 0.25); logoRug(3.0, 3.0, 512, 512, (c, w, h) => rugEdge(c, w, h, '#232226', '#ec3013'), [[256, 436, 120, '#f4f2ee', 0.95], [256, 76, 120, '#f4f2ee', 0.95, Math.PI]], cx, Y0 + 0.006, cz, STAGE.ry); }   // (22 Oct) the drum rug, with the logo
      const [sx, sz] = W(DX, DZ, 0, SZ), [nx, nz] = W(DX, DZ, 0, SZ + 0.2);
      const bench = { x: sx, z: sz, ry: STAGE.ry, len: 0.9, dir: -1, top: Y0 + 0.56, name: 'Drum stool' };
      benches.push(bench);
      near.push(pl => Math.hypot(pl.x - nx, pl.z - nz) < 1.5 && Math.abs(pl.y - Y0) < 1.2 ? { kind: 'drums', item: { z: 3 }, label: 'Drum kit · play it' } : null);
      const hits = new Map();
      tickers.push(dt => { for (const [k, t] of hits) { const p = pieces[k], b = p.userData.base, a = Math.max(0, 1 - t / 0.35), w = Math.sin(t * 38) * a;
        if (k === 'crash' || k === 'ride' || k === 'hihat') { p.rotation.x = b.rx + w * (k === 'hihat' ? 0.05 : 0.16); p.rotation.z = Math.sin(t * 27) * a * 0.08; }
        else { const sq = 1 - a * 0.07 * Math.abs(Math.sin(t * 50)); p.scale.set(1 + (1 - sq) * 0.5, sq, 1 + (1 - sq) * 0.5); }
        if (a <= 0) { hits.delete(k); p.rotation.x = b.rx; p.rotation.z = 0; p.scale.setScalar(1); } else hits.set(k, t + dt); } });
      out.drums = { x: DX, y: Y0 + 1.0, z: DZ, bench, hit(k) { if (pieces[k]) hits.set(k, 0); } };
    }
    // ---------------- the electric guitar on its stand, an amp beside it, a stool
    {
      const GX = 64.9, GZ = -36, g = new THREE.Group(); g.position.set(GX, Y0, GZ); g.rotation.y = STAGE.ry; root.add(g); inside.push([g, 'amb']);
      // the stand: a tripod with a padded cradle and a neck yoke
      for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5, l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.36), blackM); l.position.set(Math.sin(a) * 0.15, 0.03, Math.cos(a) * 0.15); l.rotation.y = a; g.add(l); }
      { const p = cyl(0.014, 0.014, 0.95, blackM, 8); p.position.set(0, 0.5, -0.1); p.rotation.x = -0.12; g.add(p);
        const cr = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.08), blackM); cr.position.set(0, 0.3, 0.02); g.add(cr);
        const y = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI), blackM); y.position.set(0, 0.98, -0.14); g.add(y); }
      // the guitar: a red double-cut body (white pickguard), maple neck, six strings
      const gt = new THREE.Group(); g.add(gt);
      const R = [[0, -0.25], [0.1, -0.235], [0.17, -0.15], [0.175, -0.06], [0.115, 0.04], [0.12, 0.12], [0.155, 0.2], [0.11, 0.235], [0.05, 0.16], [0, 0.17]];
      const right = new THREE.SplineCurve(R.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(40), S = new THREE.Shape();
      S.moveTo(0, -0.25); for (const p of right) S.lineTo(p.x, p.y); for (let i = right.length - 1; i >= 0; i--) { const p = right[i]; const x = -p.x * (p.y > 0.1 ? 0.92 : 1); S.lineTo(x, p.y > 0.1 ? p.y - 0.02 : p.y); } S.closePath();
      const bodyGeo = new THREE.ExtrudeGeometry(S, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 6 }); bodyGeo.translate(0, 0, -0.0225);
      gt.add(new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ color: 0xd2231a, specular: 0xffffff, shininess: 110 })));
      const pg = new THREE.Mesh(new THREE.ShapeGeometry(S, 6), new THREE.MeshLambertMaterial({ color: 0xf6f3ea })); pg.scale.set(0.62, 0.62, 1); pg.position.set(0.035, -0.02, 0.03); gt.add(pg);
      const maple = new THREE.MeshLambertMaterial({ color: 0xe0b878 }), rose = new THREE.MeshLambertMaterial({ color: 0x3a2418 });
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.022), maple); neck.position.set(0, 0.43, 0.01); gt.add(neck);
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.5, 0.006), rose); board.position.set(0, 0.43, 0.024); gt.add(board);
      for (let f = 1; f <= 12; f++) { const fy = 0.68 - 0.5 * (1 - Math.pow(2, -f / 12)) * 1.6; const fr = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.003, 0.004), chrome); fr.position.set(0, fy, 0.028); gt.add(fr); }
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.17, 0.016), maple); head.position.set(0.012, 0.77, 0.004); head.rotation.z = -0.08; gt.add(head);
      for (let i = 0; i < 6; i++) { const pk = cyl(0.007, 0.007, 0.03, chrome, 6); pk.rotation.z = Math.PI / 2; pk.position.set(0.055, 0.71 + i * 0.022, 0.006); gt.add(pk); }
      for (const py of [-0.1, -0.02, 0.06]) { const pu = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.02, 0.008), blackM); pu.position.set(0, py, 0.036); gt.add(pu); }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.01), chrome); bridge.position.set(0, -0.16, 0.034); gt.add(bridge);
      for (const [kx, ky] of [[0.1, -0.12], [0.11, -0.17], [0.07, -0.2]]) { const k = cyl(0.012, 0.012, 0.015, chrome, 10); k.rotation.x = Math.PI / 2; k.position.set(kx, ky, 0.034); gt.add(k); }
      const strings = [], strM = new THREE.MeshBasicMaterial({ color: 0xe9e9e9 });
      for (let i = 0; i < 6; i++) { const sx = -0.021 + i * 0.0084, s = new THREE.Mesh(new THREE.BoxGeometry(0.0014 + (5 - i) * 0.0002, 0.84, 0.0014), strM); s.position.set(sx, 0.26, 0.04); s.userData.bx = sx; gt.add(s); strings.push(s); }
      gt.position.set(0, 0.55, 0.02); gt.rotation.x = -0.14; dyn(gt);
      const rest = { pos: gt.position.clone(), rot: gt.rotation.clone(), parent: g };
      // the amp, beside the stand
      const amp = new THREE.Group(); amp.position.set(-0.75, 0, -0.25); amp.rotation.y = 0.35; g.add(amp);
      const ampBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.28), new THREE.MeshLambertMaterial({ color: 0x1b1a19 })); ampBox.position.y = 0.25; amp.add(ampBox);
      const grille = plane(0.48, 0.3, new THREE.MeshLambertMaterial({ map: tex(256, 160, (c, w, h) => { c.fillStyle = '#3a3633'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.35)'; for (let x = 0; x < w; x += 6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
        c.fillStyle = '#ec3013'; c.font = `900 italic 34px ${FONT}`; c.textAlign = 'center'; c.fillText('AMB', w / 2, h - 22); }) }), 0, 0.2, 0.141, 0, amp);
      const panel = plane(0.48, 0.1, new THREE.MeshLambertMaterial({ map: tex(256, 54, (c, w, h) => { c.fillStyle = '#c9a14a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(30 + i * 40, h / 2, 10, 0, 6.283); c.fill(); } }) }), 0, 0.42, 0.141, 0, amp);
      stool(g, 0.55, 1.1);
      box(0.5, 1.0, 0.5, null, GX, Y0 + 0.5, GZ).visible = false;
      { const [cx, cz] = W(GX, GZ, -0.75, -0.25); box(0.42, 0.55, 0.62, null, cx, Y0 + 0.27, cz).visible = false; }
      const [sx, sz] = W(GX, GZ, 0.55, 1.1), [nx, nz] = W(GX, GZ, 0.4, 1.1);
      const bench = { x: sx, z: sz, ry: STAGE.ry, len: 0.9, dir: -1, top: Y0 + 0.56, name: 'Guitar stool' };
      benches.push(bench);
      near.push(pl => Math.hypot(pl.x - nx, pl.z - nz) < 1.4 && Math.abs(pl.y - Y0) < 1.2 ? { kind: 'guitar', item: { z: 3 }, label: 'Electric guitar · play it' } : null);
      const shake = new Array(6).fill(0); let tt = 0;
      tickers.push(dt => { tt += dt; for (let i = 0; i < 6; i++) { if (shake[i] <= 0) continue; shake[i] = Math.max(0, shake[i] - dt * 1.6); strings[i].position.x = strings[i].userData.bx + Math.sin(tt * (90 + i * 13)) * 0.0022 * shake[i]; } });
      out.guitar = { x: GX, y: Y0 + 1.0, z: GZ, bench, group: gt, rest, pluck(i) { if (i >= 0 && i < 6) shake[i] = 1; } };
    }
    return out;
  })();

  // ============================================================ the walk-on floor piano (22 Oct): two octaves of giant keys on the stage
  // room's floor, in front of the stage, for the audience to play along. Stand on a key to play it (everyone nearby hears it, and
  // sees it go down and light up); several people can play at once. Low notes on the left as you face the stage.
  const floorPiano = (() => {
    const FX0 = 53.9, KL = 2.2, BL = 1.15, KW = 0.5, Z0 = -43.75, Y = AMB_FLOOR, LO = 60;   // white keys run x FX0..FX0+KL; C4 at Z0
    const isBlack = m => [1, 3, 6, 8, 10].includes(m % 12), keys = [];
    let wi = 0; for (let m = LO; m <= LO + 24; m++) { if (isBlack(m)) { keys.push({ m, black: true, z0: Z0 + wi * KW - 0.15, z1: Z0 + wi * KW + 0.15, x0: FX0 + KL - BL, x1: FX0 + KL }); } else { keys.push({ m, black: false, z0: Z0 + wi * KW, z1: Z0 + (wi + 1) * KW, x0: FX0, x1: FX0 + KL }); wi++; } }
    const Z1 = Z0 + wi * KW, cz = (Z0 + Z1) / 2;
    box(KL + 0.4, 0.04, Z1 - Z0 + 0.4, ink, FX0 + KL / 2, Y + 0.02, cz, false);   // the black surround
    box(KL + 0.4, 0.07, Z1 - Z0 + 0.4, null, FX0 + KL / 2, Y + 0.035, cz).visible = false;   // what you stand on (the keys' tops)
    box(0.08, 0.045, Z1 - Z0 + 0.4, red, FX0 - 0.2, Y + 0.023, cz, false);         // a red edge where you step on
    const whites = keys.filter(k => !k.black), blacks = keys.filter(k => k.black);
    const wIM = new THREE.InstancedMesh(new THREE.BoxGeometry(KL - 0.06, 0.06, KW - 0.05), new THREE.MeshLambertMaterial({ color: 0xffffff }), whites.length);
    const bIM = new THREE.InstancedMesh(new THREE.BoxGeometry(BL, 0.08, 0.3), new THREE.MeshLambertMaterial({ color: 0xffffff }), blacks.length);
    const m4 = new THREE.Matrix4(), cW = new THREE.Color(0xf7f4ec), cB = new THREE.Color(0x151515), hue = new THREE.Color();
    whites.forEach((k, i) => { k.im = wIM; k.i = i; }); blacks.forEach((k, i) => { k.im = bIM; k.i = i; });
    const draw = (k, down) => { m4.makeTranslation((k.x0 + k.x1) / 2, Y + (k.black ? 0.05 : 0.04) - (down ? 0.016 : 0), (k.z0 + k.z1) / 2); k.im.setMatrixAt(k.i, m4);   // (28 Oct: a pressed key sinks 16 mm, staying above the surround's top: at 30 mm the two met and flickered)
      k.im.setColorAt(k.i, down ? hue.setHSL(((k.m - LO) % 12) / 12, 0.85, k.black ? 0.45 : 0.62) : k.black ? cB : cW); k.im.instanceMatrix.needsUpdate = true; k.im.instanceColor.needsUpdate = true; };
    for (const k of keys) draw(k, false);
    wIM.frustumCulled = bIM.frustumCulled = false; root.add(wIM, bIM);
    // the sign, beside it (thick, its post inside)
    { const sT = tex(1024, 560, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 22, w, 22);
        c.fillStyle = '#fff'; c.textAlign = 'center'; fitText(c, 'THE FLOOR PIANO', w - 80, 104); c.fillText('THE FLOOR PIANO', w / 2, 140);
        // a row of little keys
        for (let i = 0; i < 14; i++) { c.fillStyle = '#f7f4ec'; c.fillRect(120 + i * 56, 200, 50, 150); } for (const i of [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]) { c.fillStyle = '#151515'; c.fillRect(120 + i * 56 + 36, 200, 30, 92); }
        c.fillStyle = '#ffd27a'; c.font = `800 46px ${FONT}`; c.fillText('Step on a key to play it', w / 2, 430); c.fillStyle = '#ff9783'; c.font = `600 38px ${FONT}`; c.fillText('Play along with the band · bring friends!', w / 2, 492); });
      const SX = FX0 - 1.2, SZ = Z1 + 0.9, g = new THREE.Group(); g.position.set(SX, Y - 0.06, SZ); g.rotation.y = -Math.PI / 2 + 0.5; root.add(g);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), ink); post.position.y = 0.65; g.add(post);
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.86, 1.02, 0.18), ink); board.position.y = 1.55; g.add(board);
      for (const [dz, ry] of [[0.092, 0], [-0.092, Math.PI]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.98), new THREE.MeshBasicMaterial({ map: sT })); f.position.set(0, 1.55, dz); f.rotation.y = ry; g.add(f); }
      box(0.2, 1.2, 0.2, null, SX, Y + 0.6, SZ).visible = false; }
    // (28 Oct) the note names, big, on an ink strip along the near end of the keys (C's in red with their octave)
    { const NM = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], lt = tex(2048, 180, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; const kw = w / whites.length;
        whites.forEach((k, i) => { const n = NM[[0, 2, 4, 5, 7, 9, 11].indexOf(k.m % 12)], isC = n === 'C'; c.fillStyle = isC ? '#ff9783' : '#ffffff'; c.font = `800 ${isC ? 96 : 110}px ${FONT}`; c.fillText(isC ? 'C' + (Math.floor(k.m / 12) - 1) : n, (i + 0.5) * kw, h / 2 + 4); if (isC) { c.fillStyle = '#ec3013'; c.fillRect(i * kw + 10, h - 16, kw - 20, 10); } }); });
      const g = new THREE.PlaneGeometry(Z1 - Z0, 0.6); g.rotateX(-Math.PI / 2); g.rotateY(-Math.PI / 2);
      const m = new THREE.MeshBasicMaterial({ map: lt }); m.polygonOffset = true; m.polygonOffsetFactor = -2;
      const p = new THREE.Mesh(g, m); p.position.set(FX0 - 0.62, Y + 0.006, cz); root.add(p); }
    // which key is under a point (black keys first: they sit on top, at the far end)
    const inKey = (k, x, z, m) => x >= k.x0 - m && x <= k.x1 + m && z >= k.z0 - m && z <= k.z1 + m;
    const keyAt = (x, z, prev) => { if (prev && inKey(prev, x, z, 0.12) && (prev.black || !blacks.some(b => inKey(b, x, z, -0.08)))) return prev;   // (28 Oct) stay on the key you're on until you're well off it: no flicker on the line
      if (x < FX0 || x > FX0 + KL || z < Z0 || z > Z1) return null; for (const k of blacks) if (x >= k.x0 && x <= k.x1 && z >= k.z0 && z <= k.z1) return k; for (const k of whites) if (z >= k.z0 && z < k.z1) return k; return null; };
    // (28 Oct) a column of coloured light rises from a key while it's held, and fades when you step off (a pool of 8)
    const colT = tex(16, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const glows = Array.from({ length: 8 }, () => { const m = new THREE.MeshBasicMaterial({ map: colT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, side: THREE.DoubleSide });
      const o = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 12, 1, true), m); o.visible = false; o.userData.dyn = true; root.add(o); return { o, m, k: null, a: 0, on: false }; });
    const glowOn = (k, down) => { if (down) { const gl = glows.find(g => g.k === k) || glows.find(g => !g.o.visible) || glows.reduce((a, b) => a.a < b.a ? a : b); gl.k = k; gl.on = true;
        gl.o.position.set(k.black ? FX0 + KL - BL / 2 : FX0 + KL * 0.3, Y + 1.25, (k.z0 + k.z1) / 2); gl.m.color.setHSL(((k.m - LO) % 12) / 12, 0.85, 0.6); gl.o.visible = true; }
      else for (const g of glows) if (g.k === k) g.on = false; };
    tickers.push(dt => { for (const g of glows) { if (!g.o.visible) continue; g.a += ((g.on ? 0.55 : 0) - g.a) * Math.min(1, dt * (g.on ? 10 : 3)); g.m.opacity = g.a; if (!g.on && g.a < 0.01) { g.o.visible = false; g.k = null; } } });
    return { keys, keyAt, press: (k, down) => { draw(k, down); glowOn(k, down); }, y: Y, x: FX0 + KL / 2, z: cz };
  })();

  // ============================================================ the signpost by the big tree: an oak post with an arrow for each place
  // (27 Oct, Ben) REMOVED for a calmer park (the park map ☰ still has "take me there")
  if (false) {
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
    if (inR(x, z, CAMPUS.amb) || inR(x, z, CAMPUS.amb2)) return 'amb';
    if (inR(x, z, CAMPUS.cinema)) return 'cinema';
    if (x > 7.4) return 'park';
    return null;
  };
  // show the inside-only things when the camera is in their building (with a little margin at the doors)
  { const R = { amb: [CAMPUS.amb, CAMPUS.amb2], cinema: [{ x0: CAMPUS.cinema.x0 - 4, x1: CAMPUS.cinema.x1, z0: CAMPUS.cinema.z0, z1: CAMPUS.cinema.z1 }] };
    let acc = 1; tickers.push(dt => { acc += dt; if (acc < 0.3) return; acc = 0; const cp = cam && cam.position; if (!cp) return;
      for (const [o, k] of inside) o.visible = R[k].some(r => cp.x > r.x0 - 1 && cp.x < r.x1 + 1 && cp.z > r.z0 - 1 && cp.z < r.z1 + 1 && cp.y < 12); }); }
  root.updateMatrixWorld(true);
  return { group: root, col, benches, screens, near, why, cinema, piano, band, floorPiano, zoneAt, tick: dt => tickers.forEach(f => f(dt)) };
}
