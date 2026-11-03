// MERU 2.0 — DUETS engine (s150). Foxes who talk to each other: when you come within ~9 m of a group, it plays one scene (census rows
// from meru_voice/meru_voice.json + the new rows in meru2-duets-lines.js), line by line, A → B → A …, then rests and rotates to its next scene.
// One group at a time (the nearest). Caption = a Modernist box over the speaker's head (constant screen size); mouth via userData.say;
// the listener turns its head to the speaker. Voice: MERU/vo/<id>.mp3 if the pack is in the project (probe once), else caption only.
import { GROUPS, SCENES } from './meru2-duets-lines.js?v=deck1';
import { applyD as SIT_A, neutralD } from '../engine/fox-poses.js?v=s648k';   // s625: duet companions are jointed (talk gestures in the walk); seated ones sit with joints
const SIT_D = () => { const D = neutralD(); D.l = [[0.03, 0.44, 0.2], [0.03, 0.44, 0.2]]; D.lpole = [[0, 0.3, 1], [0, 0.3, 1]]; D.lean = 0.06; D.mood = 'warm'; return D; };
export function buildDuets({ THREE, scene, camera, isMuted, touch, kit, groundAt }) {
  const byKey = new Map(); scene.traverse(o => { const k = (o.userData && o.userData.mk && o.userData.mk.key) || o.name; if (k && !byKey.has(k)) byKey.set(k, o); });
  let census = {}; fetch('meru_voice/meru_voice.json').then(r => r.json()).then(j => { for (const c of j.items) (census[c.scene] = census[c.scene] || []).push([c.fox, c.delivery, c.text, c.id, c.seconds]); }).catch(() => {});
  // voice files: the project's MERU/vo/ if Ben copies the pack in, else straight from the census pack in the 3D-foxgate8 repo (jsDelivr CDN, then raw GitHub)
  const VO_BASES = ['MERU/vo/', 'https://cdn.jsdelivr.net/gh/BlindbenFILMS/3D-foxgate8@main/meru_voice/vo/', 'https://raw.githubusercontent.com/BlindbenFILMS/3D-foxgate8/main/meru_voice/vo/'];
  let voOK = null, VO = ''; (async () => { for (const b of VO_BASES) { try { const r = await fetch(b + 'plaza-chess-01.mp3', { method: b.startsWith('http') ? 'GET' : 'HEAD' }); if (r.ok) { VO = b; voOK = true; return; } } catch (e) {} } voOK = false; })();
  // companions: a fox who only exists for a duet, placed beside its partner and facing it (e.g. Maren next to the Fisherman)
  for (const G of GROUPS) for (const [name, sp] of Object.entries(G.spawn || {})) { if (sp.at && kit && !byKey.has(sp.spec.key)) { const f = kit.makeFox({ joints: true, ...sp.spec }), [x, z] = sp.at; f.position.set(x, groundAt ? groundAt(x, z) : 0, z); f.rotation.y = Math.atan2(-x, -z); scene.add(f); byKey.set(sp.spec.key, f); continue; }
    const near = sp.nearKey ? [].concat(sp.nearKey).map(k => byKey.get(k)).find(Boolean) : (G.foxes[sp.near] || []).map(k => byKey.get(k)).find(Boolean); if (!near || !kit || byKey.has(sp.spec.key) || (G.foxes[name] || []).some(k => byKey.has(k))) continue;
    const f = kit.makeFox({ joints: true, ...sp.spec }); near.updateWorldMatrix(true, false); const e = near.matrixWorld.elements, ry = Math.atan2(e[8], e[10]), ox = Math.cos(ry) * sp.off[0] + Math.sin(ry) * sp.off[1], oz = -Math.sin(ry) * sp.off[0] + Math.cos(ry) * sp.off[1];
    f.position.set(e[12] + ox, 0, e[14] + oz); f.rotation.y = Math.atan2(e[12] - f.position.x, e[14] - f.position.z); scene.add(f); byKey.set(sp.spec.key, f); }
  // s181 DECK DUETS: spawn.cafe = [table slot, side] → seated ALL DAY on a TAVERN DECK chair (window.__m2deck.duetT from meru2-tavdeck.js; patrons skip those tables), sit pose below
  const SEATED = []; { const C = typeof window !== 'undefined' && window.__m2deck; if (C && C.seats && C.seats.length && C.duetT && C.duetT.length && kit) { const pick = C.duetT;
    for (const G of GROUPS) for (const [name, sp] of Object.entries(G.spawn || {})) { if (!sp.cafe || byKey.has(sp.spec.key)) continue; const t = pick[sp.cafe[0] % pick.length], S = C.seats.filter(s => s.t === t)[sp.cafe[1] * 2]; /* chairs 0 + 2 = opposite sides */ if (!S) continue;
      const f = kit.makeFox({ joints: true, ...sp.spec }); f.userData.seated = true; f.position.set(S.x, S.y + 0.04, S.z); /* seat y is absolute (deck height), same as the tavern patrons */ f.rotation.y = S.ry; f.userData.ph = Math.random() * 9; scene.add(f); byKey.set(sp.spec.key, f); SEATED.push(f); } } }
  const sitT = (dt, P) => { if (!SEATED.length || !kit.animFox) return; const t = performance.now() / 1000; for (const f of SEATED) { if (Math.hypot(P.x - f.position.x, P.z - f.position.z) > (touch ? 30 : 45)) continue; kit.animFox(f, dt, 0, false); const Q = f.userData && f.userData.P; if (!Q) continue; if (Q.fore && SIT_D) { const D = SIT_D(); D.a = [[0.04, -0.36, 0.25], [0.04, -0.36, 0.25]]; D.palm = [[-0.3, 1, 0.2], [-0.3, 1, 0.2]]; D.head = [0.05, Math.sin(t * 0.4 + f.userData.ph) * 0.3, 0]; SIT_A(THREE, f, D, t, 1); continue; }
    if (Q.legs) Q.legs.forEach(l => { l.rotation.x = -1.45; }); if (!Q.fore && Q.hero && Q.body) Q.body.position.y = -Q.hero.dL; if (Q.arms) Q.arms.forEach((a, i) => { a.rotation.x = -0.75 + Math.sin(t * 0.7 + f.userData.ph + i) * 0.06; }); } };
  const groups = GROUPS.map(G => { const who = {}; for (const [name, keys] of Object.entries(G.foxes)) { const o = keys.map(k => byKey.get(k)).find(Boolean); if (o) who[name] = o; }
    return { G, who, list: [...G.census.map(s => ({ census: s })), ...G.scenes.map(s => ({ id: s }))], si: 0, rest: 0 }; });
  const shown = o => { let p = o; while (p) { if (p.visible === false) return false; p = p.parent; } return true; };
  const wp = new THREE.Vector3(), wq = new THREE.Vector3(), headAt = (o, v) => { o.getWorldPosition(v); v.y += (o.scale.y || 1) * 1.75; return v; };
  // caption sprite
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const cap = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, sizeAttenuation: false })); cap.renderOrder = 999; cap.visible = false; scene.add(cap);
  function drawCap(name, text) { cx.clearRect(0, 0, 1024, 256); cx.font = '700 44px Archivo, Arial, sans-serif'; const words = text.split(' '), lines = []; let ln = '';
    for (const w of words) { const t = ln ? ln + ' ' + w : w; if (cx.measureText(t).width > 640 && ln) { lines.push(ln); ln = w; } else ln = t; } if (ln) lines.push(ln); lines.length = Math.min(lines.length, 3);
    const W = Math.min(1000, Math.max(...lines.map(l => cx.measureText(l).width), 200) + 56), H = 56 + lines.length * 54; cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H); cx.fillStyle = '#ffd23a'; cx.fillRect(0, 0, W, 6);
    cx.font = '800 26px Archivo, Arial, sans-serif'; cx.fillText(name, 28, 38); cx.font = '700 44px Archivo, Arial, sans-serif'; cx.fillStyle = '#fff'; lines.forEach((l, i) => cx.fillText(l, 28, 88 + i * 54));
    tex.needsUpdate = true; cap.userData.w = W / 1024; cap.userData.h = H / 256; tex.repeat.set(W / 1024, H / 256); tex.offset.set(0, 1 - H / 256); }
  const NAME = n => n.replace(/\b(ONE|TWO|THREE|ZERO)\b/g, '').replace(/\s+/g, ' ').trim();
  let cur = null, el = null;   // cur = { g, rows, i, t, dur }
  function rowsOf(g, item) { const rs = item.census ? (census[item.census] || []) : (SCENES[item.id] || []).map((r, i) => [r[0], r[1], r[2], item.id + '-' + String(i + 1).padStart(2, '0'), 0]); return rs.filter(r => g.who[r[0]]); }
  function startLine() { const r = cur.rows[cur.i], sp = cur.g.who[r[0]]; cur.t = 0; cur.dur = Math.max(1.4, r[4] || (0.9 + r[2].length * 0.062)) + 0.45; cur.sp = sp;
    sp.userData.say = { text: r[2], t: 0 }; sp.userData.talkStyle = r[1] === 'shout' ? { rate: 1.15, amp: 1.2, base: 0.3, gest: 1.3 } : r[1] === 'whisper' ? { rate: 0.85, amp: 0.5, base: 0.15, gest: 0.5 } : { rate: 1, amp: 1, base: 0.25, gest: 1 };
    sp.userData.lineMood = r[1] === 'laugh' ? 'happy' : r[1] === 'shout' ? 'excited' : r[1] === 'sigh' ? 'sad' : null; cur.text = r[2]; cur.mood = sp.userData.lineMood || (r[1] === 'whisper' ? 'nervous' : null); cur.n = (cur.n || 0) + 1;
    drawCap(NAME(r[0]), r[2]); cap.visible = true;
    if (el) { el.pause(); el = null; } if (voOK && !/^nx-/.test(r[3]) && !(isMuted && isMuted()) && !window.__voK) { el = new Audio(VO + r[3] + '.mp3'); el.volume = 0.9; el.onended = () => { if (cur) cur.dur = Math.min(cur.dur, cur.t + 0.4); }; el.onloadedmetadata = () => { if (cur && isFinite(el.duration)) cur.dur = el.duration + 0.45; }; el.play().catch(() => {}); } }
  function endLine() { if (cur && cur.sp) { cur.sp.userData.say = null; cur.sp.userData.lineMood = null; } }
  function stop() { endLine(); if (el) { el.pause(); el = null; } cap.visible = false; if (cur) Object.values(cur.g.who).forEach(o => { o.userData.lookAt = null; }); cur = null; }
  return {
    talkers() { return cur && cur.sp ? { sp: cur.sp, who: Object.values(cur.g.who), text: cur.text || '', mood: cur.mood, line: cur.g.G.id + ':' + cur.n } : null; },   // s625: the walk's talk gestures (talkD / listenD) read this
    groups, stop, get cur() { return cur && { g: cur.g.G.id, i: cur.i, n: cur.rows.length, t: cur.t, dur: cur.dur }; }, ticks: 0,
    tick(dt, P) { this.ticks++; sitT(dt, P);
      for (const g of groups) g.rest = Math.max(0, g.rest - dt);
      if (cur) { const g = cur.g, c = Object.values(g.who).filter(shown); let mx = 0, mz = 0; c.forEach(o => { o.getWorldPosition(wp); mx += wp.x / c.length; mz += wp.z / c.length; });
        if (!c.length || Math.hypot(P.x - mx, P.z - mz) > 15) { stop(); return; }
        cur.t += dt; const sp = cur.sp; headAt(sp, wp); cap.position.copy(wp); cap.position.y += 0.55; const k = touch ? 0.24 : 0.17; cap.scale.set(k * cap.userData.w * 4, k * cap.userData.h, 1); cap.center.set(0.5, 0);
        for (const o of Object.values(g.who)) if (o !== sp) o.userData.lookAt = headAt(sp, wq).clone();
        if (cur.t >= cur.dur) { endLine(); cur.i++; if (cur.i >= cur.rows.length) { g.rest = 14 + Math.random() * 8; g.si++; stop(); } else startLine(); }
        return; }
      let best = null, bd = 9; for (const g of groups) { if (g.rest > 0) continue; const c = Object.values(g.who); if (c.length < Math.min(2, Object.keys(g.G.foxes).length) || !c.every(shown)) continue;
        const pts = c.map(o => { o.getWorldPosition(wp); return [wp.x, wp.z]; }); let spread = 0; for (const a of pts) for (const b of pts) spread = Math.max(spread, Math.hypot(a[0] - b[0], a[1] - b[1])); if (spread > 14) continue;   // they must actually stand together
        const d = Math.min(...pts.map(p => Math.hypot(P.x - p[0], P.z - p[1]))); if (d < bd) { bd = d; best = g; } }
      if (!best) return; for (let n = 0; n < best.list.length; n++) { const item = best.list[(best.si + n) % best.list.length], rows = rowsOf(best, item); if (rows.length >= 2 || (rows.length && Object.keys(best.G.foxes).length === 1)) { best.si += n; cur = { g: best, rows, i: 0 }; startLine(); return; } }
      best.rest = 30; } };
}
