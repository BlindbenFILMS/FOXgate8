// FOLLOW A PAINTING WITH THE ART ALIVE TRACKER, on top of MindAR (used by the AR viewer, index.html, and eyeball.html).
// MindAR recognises which painting is in view and measures it now and then; the tracker (./lk-tracker.js) follows the
// painting itself in every camera frame in between, and keeps hold when MindAR briefly loses it. One painting at a time.
//
//   import { follower } from './lib/lk-follow.js';
//   const F = follower({ mindar, camera, renderer, THREE });
//   each frame, FIRST (before anything else changes anchor.group.matrix):  F.capture(anchors, skip)
//        skip(anchor) → a matrix your own code wrote last frame (e.g. a smoothing filter), so it isn't taken for MindAR's
//   then:  F.step(anchor, h)   the painting to follow (h = height / width), or F.step(null) when none
//          → true while the tracker is steering it: anchor.group.matrix is set and anchor.group.visible is true
//   F.active(anchor)   is the tracker steering this one?        F.drop()   forget it (a new camera size, letting it go)
//   F.info             { mode: 'find' | 'track' | 'hold' | null, points } for debugging
import { tracker, homography } from './lk-tracker.js';

export function follower({ mindar, camera, renderer, THREE, agree = 0.04, snapAfter = 3 }) {
  const S = new WeakMap(), st = a => { let s = S.get(a); if (!s) S.set(a, s = {}); return s; };
  const _v = new THREE.Vector3(), _c1 = new THREE.Vector3(), _c2 = new THREE.Vector3(), _c3 = new THREE.Vector3(), _t = new THREE.Vector3();
  let cur = null, trk = null, curH = 1;
  const F = { info: { mode: null, points: 0 } };
  const cornersOf = h => [[-0.5, h / 2], [0.5, h / 2], [0.5, -h / 2], [-0.5, -h / 2]];   // top-left, top-right, bottom-right, bottom-left (MindAR: 1 unit = the painting's width)

  // has MindAR just written a new measurement of this painting?
  F.capture = (anchors, skip) => {
    for (const a of anchors) { const s = st(a), g = a.group;
      if (!a.visible) { s.fresh = false; continue; }
      if (g.matrix !== s.mine && g.matrix !== s.last && !(skip && g.matrix === skip(a))) { s.last = g.matrix; s.fresh = true; s.scale = _v.setFromMatrixColumn(g.matrix, 0).length(); } }
  };
  // MindAR's newest measurement, as the painting's corners in the camera picture (0..1); only once per measurement
  function measured(a) {
    const s = st(a); if (!s.fresh) return null;
    s.fresh = false;
    const rc = renderer.domElement.getBoundingClientRect(), rv = mindar.video.getBoundingClientRect();
    camera.updateMatrixWorld();
    return { c: cornersOf(curH).map(([x, y]) => { _v.set(x, y, 0).applyMatrix4(s.last).project(camera);
      const sx = rc.left + (_v.x + 1) / 2 * rc.width, sy = rc.top + (1 - _v.y) / 2 * rc.height;
      return [(sx - rv.left) / rv.width, (sy - rv.top) / rv.height]; }) };
  }
  // the painting's 3D pose from its four corners in the camera picture (a plane's homography, with MindAR's scale)
  function pose(a, c) {
    const s = st(a), rc = renderer.domElement.getBoundingClientRect(), rv = mindar.video.getBoundingClientRect(), e = camera.projectionMatrix.elements;
    const ab = c.map(([x, y]) => { const nx = (rv.left + x * rv.width - rc.left) / rc.width * 2 - 1, ny = 1 - (rv.top + y * rv.height - rc.top) / rc.height * 2;
      return [(nx + e[8]) / e[0], (ny + e[9]) / e[5]]; });   // camera rays (x/w, y/w), w = distance in front
    const H = homography(cornersOf(curH), ab);
    if (!H.every(Number.isFinite)) return null;
    let f = 2 * s.scale / (Math.hypot(H[0], H[3], H[6]) + Math.hypot(H[1], H[4], H[7]));
    if (H[8] * f < 0) f = -f;   // in front of the camera
    _c1.set(H[0] * f, H[3] * f, -H[6] * f); _c2.set(H[1] * f, H[4] * f, -H[7] * f); _t.set(H[2] * f, H[5] * f, -H[8] * f);   // (three.js looks down −z)
    _c1.normalize(); _c2.addScaledVector(_c1, -_c2.dot(_c1)).normalize(); _c3.crossVectors(_c1, _c2);
    const m = new THREE.Matrix4().makeBasis(_c1.multiplyScalar(s.scale), _c2.multiplyScalar(s.scale), _c3.multiplyScalar(s.scale)).setPosition(_t);
    m.premultiply(camera.matrixWorld);
    return m.elements.every(Number.isFinite) ? m : null;
  }
  F.drop = () => { if (cur) st(cur).on = false; cur = null; trk = null; F.info = { mode: null, points: 0 }; };
  F.active = a => !!(a && S.get(a) && S.get(a).on);
  F.step = (a, h = 1) => {
    if (!a) { if (cur) F.drop(); return false; }
    if (a !== cur) { F.drop(); cur = a; curH = h; trk = tracker({ detect: () => measured(a), agree, snapAfter }); }
    const v = mindar.video, s = st(a); if (!v || !v.videoWidth) return s.on = false;
    const r = trk.update(v, v.videoWidth, v.videoHeight);
    F.info = { mode: r && r.mode, points: r ? r.points || 0 : 0 };
    if (r && s.scale && (r.mode !== 'hold' || s.mine)) {
      const m = r.mode === 'hold' ? s.mine : pose(a, r.c);
      if (m) { a.group.matrix = s.mine = m; a.group.visible = true; return s.on = true; }
    }
    return s.on = false;
  };
  return F;
}
