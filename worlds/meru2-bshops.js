// MERU 2.0 — s79 TOWN 2 INTERIOR 21: the two Barracks Road shops, copies of Penny's Minimart + Bolt's Gas with new keepers.
// Each copy is built in its ORIGINAL's frame (meru2-bmart.js / meru2-bgas.js), then everything it made goes into its own moved group
// (pure shift, no turn); colliders become live views (the shops move their keeper colliders at run time); the player / camera reach it
// through a second relocator (P proxy, camWrap, within) so the two copies never touch the originals.
import { makeRelocator } from './meru2-relocate.js';
import { buildBarracksMart } from './meru2-bmart.js';
import { buildBarracksGas } from './meru2-bgas.js';
import { bshopsLook } from './meru2-bshops-look.js';   // s97 look pass
export function buildBarracksShops({ THREE, scene, cols, args }) {
  const MV = [
    { key: 'bmart', q: 0, o: [-172, -92], n: [48, -291], fo: [-188, -172, -104, -80], fn: [32, 48, -303, -279], face0: 'E' },
    { key: 'bgas', q: 0, o: [378, 74], n: [78, -286], fo: [378, 392, 68, 80], fn: [78, 92, -292, -280], face0: 'W' }];
  const RL2 = makeRelocator({ THREE, scene, L: { MOVES: MV } });
  const [MA, MB] = MV;
  const view = (c, dx, dz) => { const cc = [0, 0, 0], ff = [0, 0, 0, 0];
    return new Proxy(c, { get(t, k) { if (k === 'c') { const s = t.c; if (!s) return s; cc[0] = s[0] + dx; cc[1] = s[1] + dz; cc[2] = s[2]; return cc; }
      if (k === 'f') { const s = t.f; if (!s) return s; ff[0] = s[0] + dx; ff[1] = s[1] + dx; ff[2] = s[2] + dz; ff[3] = s[3] + dz; return ff; } return t[k]; } }); };
  const build = (m, fn) => { const snap = new Set(scene.children), i0 = cols.length, api = fn(args);
    for (const c of [...scene.children]) if (!snap.has(c) && c !== m.G && !c.isCamera) m.G.add(c);
    const dx = m.n[0] - m.o[0], dz = m.n[1] - m.o[1]; for (let i = i0; i < cols.length; i++) cols[i] = view(cols[i], dx, dz); return api; };
  const sA = build(MA, buildBarracksMart), sB = build(MB, buildBarracksGas);
  let LK = null; try { LK = bshopsLook({ THREE, scene, cols, touch: args.touch, hour: args.hour }); } catch (e) { console.warn('bshops look: ' + (e && e.stack || e)); }
  const PX = m => P => { const p = RL2.P(m); p.ref.P = P; return p.px; }, PA = PX(MA), PB = PX(MB);
  return {
    mart: sA, gas: sB, RL: RL2, LK,
    tick(dt, P, fox) { RL2.within(MA, () => sA.tick(dt, PA(P), fox)); RL2.within(MB, () => sB.tick(dt, PB(P), fox)); if (LK) LK.tick(dt, P); },
    prompt(P) { return sA.prompt(PA(P)) || sB.prompt(PB(P)); },
    talk(P) { return !!(RL2.within(MA, () => sA.talk(PA(P))) || RL2.within(MB, () => sB.talk(PB(P)))); },
    camFix(cam, dt, fox) { RL2.camWrap(MA, cam, () => sA.camFix(cam, dt, fox)); RL2.camWrap(MB, cam, () => sB.camFix(cam, dt, fox)); },
    busy() { return !!(sA.busy() || sB.busy()); },
    quit() { if (sA.busy()) RL2.within(MA, () => sA.quit()); if (sB.busy()) RL2.within(MB, () => sB.quit()); },
    toast() { return sA.toast() || sB.toast(); },
  };
}
