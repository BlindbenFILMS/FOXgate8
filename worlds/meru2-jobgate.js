// s664 JOB GATE (Ben: "job circles only appear after interacting with the help wanted sign OR the shopkeeper or someone who works there; all
// the circles being open can confuse the player who is just playing through"). One place for every Meru job module (none of them changed):
// - every yellow job ring on the floor (flat RingGeometry, yellow, 0.7-1.4 m) is found by a scene scan and moved to a hidden camera layer until
//   its place is HIRED; the module still shows / hides it as before (layers do not touch .visible)
// - a ring's PLACE = the building it stands in (city box key); rings outside any building belong to the spot (35 m around where you were hired)
// - HIRED = you talked to someone there (prompt TALK · …) or used the NOW HIRING sign; saved for good (localStorage meru.hired.v1)
// - until then the START · <JOB> prompt is hidden and pressing TALK on a hidden ring only says who to see
export function createJobGate({ THREE, scene, camera, city }) {
  const KEY = 'meru.hired.v1', HID = 7, R_OUT = 35;
  let S = { b: [], p: [] }; try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && Array.isArray(v.b)) S = { b: v.b, p: Array.isArray(v.p) ? v.p : [] }; } catch (e) {}
  const B = new Set(S.b), save = () => { S.b = [...B]; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const boxAt = (x, z, y = 0) => { for (const bd of city.blds || []) if (y < bd.h && x > bd.x0 && x < bd.x1 && z > bd.z0 && z < bd.z1) return bd.b.key; return null; };
  const hiredAt = (x, z, y) => { const k = boxAt(x, z, y); if (k) return B.has(k); for (const q of S.p) if (Math.hypot(q[0] - x, q[1] - z) < R_OUT) return true; return false; };
  const rings = []; const seen = new WeakSet(), _v = new THREE.Vector3(), _c = new THREE.Color(), hsl = {};
  // s664b ring shapes used by the job modules: (1) a flat yellow RingGeometry (0.6-1.45 m), (2) a yellow CYLINDER disc (r 0.45-0.62, under 3 cm tall)
  // with a dark INK disc on top that makes it read as a ring (both hidden together), (3) a flat yellow TORUS (museum, r 0.45-0.9)
  const yellow = m => { if (!m || !m.color) return false; _c.copy(m.color).getHSL(hsl); return hsl.h >= 0.09 && hsl.h <= 0.18 && hsl.s >= 0.6 && hsl.l >= 0.4; };
  const dark = m => { if (!m || !m.color) return false; _c.copy(m.color).getHSL(hsl); return hsl.l < 0.22; };
  const flat = o => Math.abs(Math.abs(o.rotation.x) - Math.PI / 2) < 0.15, upright = o => Math.abs(o.rotation.x) < 0.1 && Math.abs(o.rotation.z) < 0.1;
  const add = o => { o.getWorldPosition(_v); const r = { o, x: _v.x, z: _v.z, y: _v.y, on: null }; rings.push(r); return r; };
  function scan() { scene.updateMatrixWorld(); const discs = [], inks = [];
    scene.traverse(o => { if (!o.isMesh || seen.has(o)) return; const g = o.geometry; if (!g) return; const pr = g.parameters || {}, m = Array.isArray(o.material) ? o.material[0] : o.material, sy = o.scale.y || 1;
      if (g.type === 'RingGeometry') { seen.add(o); const ro = pr.outerRadius || 0, ri = pr.innerRadius || 0; if (o.visible && ro >= 0.6 && ro <= 1.45 && ri / ro >= 0.55 && yellow(m) && flat(o)) add(o); return; }
      if (g.type === 'TorusGeometry') { seen.add(o); if (o.visible && pr.radius >= 0.45 && pr.radius <= 0.9 && pr.tube <= 0.08 && yellow(m) && flat(o)) add(o); return; }
      if (g.type === 'CylinderGeometry' && (pr.height || 1) * sy < 0.03 && Math.abs((pr.radiusTop || 0) - (pr.radiusBottom || 0)) < 0.01 && upright(o)) { const rr = pr.radiusTop * (o.scale.x || 1);
        if (rr >= 0.45 && rr <= 0.62 && yellow(m)) { seen.add(o); discs.push(o); } else if (rr >= 0.3 && rr < 0.5 && dark(m)) { seen.add(o); inks.push(o); } } });
    const ip = inks.map(o => { o.getWorldPosition(_v); return { o, x: _v.x, y: _v.y, z: _v.z, used: false }; });
    for (const d of discs) { if (!d.visible) continue; const r = add(d); const q = ip.find(k => !k.used && Math.abs(k.x - r.x) < 0.06 && Math.abs(k.z - r.z) < 0.06 && Math.abs(k.y - r.y) < 0.03); if (q) { q.used = true; r.ink = q.o; } } }
  let t = 0, raw = null;
  // s664c the distance cull (meru2-blockout propCull) also writes layers 0 / 1 on these meshes, so a hidden ring is put back on layer HID EVERY frame
  // (cheap: ~140 rings); a hired ring is handed back once (layer 0) and the cull owns it again
  function tick(dt) { t -= dt; const re = t <= 0; if (re) t = 0.3;
    for (const r of rings) { if (re) r.on = hiredAt(r.x, r.z, r.y);
      if (!r.on) { r.o.layers.set(HID); if (r.ink) r.ink.layers.set(HID); r.was = false; } else if (!r.was) { r.was = true; r.o.layers.set(0); if (r.ink) r.ink.layers.set(0); } } }
  const isStart = s => typeof s === 'string' && /^(\u2713 )?START \u00b7 /.test(s);
  function hire(P) { const k = boxAt(P.x, P.z, P.y || 0); if (k) { if (!B.has(k)) { B.add(k); save(); t = 0; return true; } return false; }
    if (!S.p.some(q => Math.hypot(q[0] - P.x, q[1] - P.z) < 8)) { S.p.push([Math.round(P.x * 10) / 10, Math.round(P.z * 10) / 10]); save(); t = 0; return true; } return false; }
  return {
    scan, tick, hiredAt, hire, isStart,
    filter(prompt, P) { raw = prompt; return isStart(prompt) && !hiredAt(P.x, P.z, P.y || 0) ? null : prompt; },
    // before talk: true = blocked (a hidden ring); also hires the place when you talk to someone / use the NOW HIRING sign
    talk(prompt, P) { if (isStart(raw) && !hiredAt(P.x, P.z, P.y || 0)) return 'TALK TO SOMEONE WHO WORKS HERE OR THE NOW HIRING SIGN';
      if (typeof prompt === 'string' && (/^TALK \u00b7 /.test(prompt) || /HIRING/.test(prompt))) { if (hire(P)) return { hired: true }; } return null; },
    get count() { return rings.length; }, get hired() { return { b: [...B], p: S.p.slice() }; },
    reset() { B.clear(); S.p = []; save(); t = 0; },
  };
}
