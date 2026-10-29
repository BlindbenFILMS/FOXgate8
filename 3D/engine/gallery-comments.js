// Blind Canvas gallery: COMMENT SPOTS (11 Oct). Visitors' floating notes can only be left on these: a slightly raised,
// sunflower-yellow pad with an ink rim, and a sign beside it that says YOUR COMMENTS HERE with a smiley. Step onto one and
// the LEAVE NOTE button appears (and the ACTIONS button offers it too); step off and it goes away.
// The spots are on the park's walks, in the WHY House, on the welcome deck and in the Wall of Why hallway: nowhere a film plays.
// Each spot: x, z, y (its floor), face (the way the sign faces: towards the path / the room), w x d (pad size), name (said aloud),
// sign: where the sign stands on the pad's edge ('back' = the side away from where it faces, 'left'/'right' of that).
export const COMMENT_SPOTS = [
  { id: 'deck', name: 'the welcome deck', x: 2.4, z: 9.6, y: 0.02, face: -Math.PI / 2, w: 2.2, d: 2.2, sign: 'back' },
  { id: 'ring-ne', name: 'the ring path, north-east', x: 57.58, z: 15.93, y: 0, face: -2.307, w: 2.2, d: 2.2, sign: 'back' },
  { id: 'ring-se', name: 'the ring path, south-east', x: 57.27, z: -16.27, y: 0, face: -0.834, w: 2.2, d: 2.2, sign: 'back' },
  { id: 'north-walk', name: 'the north walk, by the WHY House', x: 18.97, z: 32.81, y: 0, face: 1.077, w: 2.2, d: 2.2, sign: 'back' },
  { id: 'south-walk', name: 'the south walk, by the Academy of Music', x: 18.41, z: -33.85, y: 0, face: 2.065, w: 2.2, d: 2.2, sign: 'back' },
  { id: 'why', name: 'outside the WHY House', x: 33.6, z: 23.0, y: 0, face: Math.PI, w: 2.2, d: 2.2, sign: 'back' },   // (Ben, 28 Oct) moved out front, left of the door on the lawn (inside, the art easels have the room)
  { id: 'hall', name: 'the Wall of Why hallway', x: -66.6, z: 0, y: -3.327, face: Math.PI / 2,   // (Ben, 28 Oct) turned round: it faces you as you walk in from the eye
    w: 2.0, d: 2.2, sign: 'back', signTop: 3.0 },   // (Ben: in the middle of the walk, so its board is raised for a fox to just walk under)
];
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
const PAD_H = 0.07;   // how high the pad stands (the fox steps up onto it)

export function buildCommentSpots({ THREE, scene, spots = COMMENT_SPOTS }) {
  const group = new THREE.Group(); group.name = 'comment-spots'; scene.add(group);
  const col = [];
  const tex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const smiley = (c, x, y, r, ink, face) => {
    c.fillStyle = face; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.lineWidth = r * 0.12; c.strokeStyle = ink; c.stroke();
    c.fillStyle = ink; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * r * 0.34, y - r * 0.22, r * 0.1, r * 0.16, 0, 0, Math.PI * 2); c.fill(); }
    c.beginPath(); c.arc(x, y + r * 0.02, r * 0.55, 0.18 * Math.PI, 0.82 * Math.PI); c.lineWidth = r * 0.12; c.lineCap = 'round'; c.stroke();
  };
  // the pad's top: sunflower yellow, a dashed ink border, a speech bubble with a smiley in the middle
  const padTex = tex(512, 512, (c, w, h) => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h);   // (Ben, 28 Oct: every sign black with white)
    c.strokeStyle = '#f3f2f2'; c.lineWidth = 14; c.setLineDash([34, 22]); c.strokeRect(34, 34, w - 68, h - 68); c.setLineDash([]);
    c.fillStyle = '#1d1c1b'; c.strokeStyle = '#f3f2f2'; c.lineWidth = 12;
    c.beginPath(); c.moveTo(130, 140); c.lineTo(382, 140); c.quadraticCurveTo(406, 140, 406, 164); c.lineTo(406, 318); c.quadraticCurveTo(406, 342, 382, 342); c.lineTo(230, 342); c.lineTo(172, 396); c.lineTo(180, 342); c.lineTo(130, 342); c.quadraticCurveTo(106, 342, 106, 318); c.lineTo(106, 164); c.quadraticCurveTo(106, 140, 130, 140); c.closePath(); c.fill(); c.stroke();
    smiley(c, 256, 240, 72, '#1d1c1b', '#f3f2f2');
  });
  // the sign: YOUR COMMENTS HERE, with a big smiley
  const signTex = tex(840, 560, (c, w, h) => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f3f2f2'; c.fillRect(18, 18, w - 36, 6); c.fillRect(18, 18, 6, h - 36); c.fillRect(w - 24, 18, 6, h - 36);
    c.fillStyle = '#ec3013'; c.fillRect(18, h - 54, w - 36, 36);
    smiley(c, 168, 252, 118, '#1d1c1b', '#f3f2f2');
    c.fillStyle = '#ffffff'; c.textBaseline = 'alphabetic';
    const fit = (txt, max, size) => { let s = size; c.font = `900 ${s}px ${FONT}`; while (c.measureText(txt).width > max && s > 30) { s -= 2; c.font = `900 ${s}px ${FONT}`; } return s; };
    const L = 318, M = w - L - 44;
    fit('YOUR', M, 110); c.fillText('YOUR', L, 168);
    const s2 = fit('COMMENTS', M, 110); c.font = `900 ${s2}px ${FONT}`; c.fillText('COMMENTS', L, 168 + s2 + 6);
    c.font = `900 ${s2}px ${FONT}`; c.fillText('HERE', L, 168 + 2 * s2 + 12);
    c.fillStyle = '#ffffff'; c.font = `800 26px ${FONT}`; c.textAlign = 'center'; c.fillText('STEP ON · TAP LEAVE NOTE', w / 2, h - 27);
  });
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const yellow = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });   // (was sunflower yellow; now ink, Ben 28 Oct)
  const topM = new THREE.MeshLambertMaterial({ map: padTex });
  const signM = new THREE.MeshBasicMaterial({ map: signTex });
  const list = [];
  for (const S of spots) {
    const g = new THREE.Group(); g.position.set(S.x, S.y, S.z); g.rotation.y = S.face; group.add(g);
    // the pad: an ink rim, a yellow slab, the painted top
    const rim = new THREE.Mesh(new THREE.BoxGeometry(S.w + 0.14, PAD_H - 0.01, S.d + 0.14), ink); rim.position.y = (PAD_H - 0.01) / 2; g.add(rim);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(S.w, PAD_H, S.d), [yellow, yellow, topM, yellow, yellow, yellow]); slab.position.y = PAD_H / 2 + 0.002; g.add(slab);
    // what the fox stands on (invisible, just the pad's top)
    const c = new THREE.Mesh(new THREE.BoxGeometry(S.w + 0.14, PAD_H, S.d + 0.14)); c.position.set(S.x, S.y + PAD_H / 2, S.z); c.rotation.y = S.face; c.updateMatrixWorld(true); col.push(c);
    // the sign: on the pad's back edge, off to one side so it never stands in the way, facing the same way as the spot
    const sx = S.w / 2 - 0.25, sz = -S.d / 2 + 0.08, BW = 1.5, BH = 1.0, top = S.signTop || 2.15;
    // (22 Oct) a thick board (thicker than the post), and the post stops inside it, so it never crosses the words on either face
    const T = 0.2, postTop = top - BH + 0.3;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, postTop, 0.09), ink); post.position.set(sx, postTop / 2, sz); g.add(post);
    const board = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.08, BH + 0.08, T), ink); board.position.set(sx - BW / 2 + 0.2, top - BH / 2, sz); g.add(board);
    for (const [dz, ry] of [[T / 2 + 0.002, 0], [-T / 2 - 0.002, Math.PI]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), signM); f.position.set(sx - BW / 2 + 0.2, top - BH / 2, sz + dz); f.rotation.y = ry; g.add(f); }
    { const w = new THREE.Vector3(sx, 0.6, sz).applyAxisAngle(new THREE.Vector3(0, 1, 0), S.face); const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.2, 0.16)); m.position.set(S.x + w.x, S.y + 0.6, S.z + w.z); m.updateMatrixWorld(true); col.push(m); }
    list.push({ ...S, top: S.y + PAD_H });
  }
  // are you standing on one? (in the pad's own frame, with a little give at the edges)
  function at(x, y, z) {
    for (const S of list) {
      const dx = x - S.x, dz = z - S.z, c = Math.cos(S.face), s = Math.sin(S.face);
      const lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) < S.w / 2 + 0.1 && Math.abs(lz) < S.d / 2 + 0.1 && Math.abs(y - S.top) < 0.6) return S;
    }
    return null;
  }
  // where to stand when you're taken to one: the pad's centre
  const arrive = S => ({ x: S.x, z: S.z, y: S.top, face: S.face + Math.PI });   // (facing the sign, so the camera behind you sees it and the notes)
  return { group, col, list, at, arrive };
}
