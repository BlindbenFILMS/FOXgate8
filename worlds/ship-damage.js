// 8 GATES · SPACE MAP · SHIP DAMAGE (s606, Claude's lead after Ben's "take the lead"; from the 2D damage report: shields collapsed,
// navigation damaged, screens bleeding, crippled engines). A big hit on your HULL (shield down) can knock out ONE system:
//   ENGINES  · 65 % speed, no BOOST            GUNS · half fire rate (laser + special)
//   SHIELDS  · the screen stays down             NAV  · no minimap, no course line / autopilot
//   FUEL LEAK· fuel drains while it's broken
// Chance per hull hit = dmg / 40 (x2 under half hull), never two in a row inside 4 s. The ship SHOWS it: smoke + sparks under 50 % hull,
// fire under 25 %, a fuel mist while leaking. REPAIR KIT = +40 hull AND fixes one system. Any DOCK: REPAIR ALL (hull + systems) for gold.
// Saved: localStorage space.damage.v1 { sys: { engines, guns, shields, nav, fuel } }.
const KEY = 'space.damage.v1';
export const SYS = [['engines', 'ENGINES', 'Slower · no boost'], ['guns', 'GUNS', 'Half fire rate'], ['shields', 'SHIELDS', 'Screen down'], ['nav', 'NAVIGATION', 'No map or course'], ['fuel', 'FUEL LEAK', 'Fuel draining']];
export const SYS_FIX = 25;   // gold per broken system at a dock, on top of the hull

export function createDamage(X) {
  const { THREE, scene, St, toast, snd, burst, dotTex, LOW } = X;
  let D = {}; try { D = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {} if (!D.sys || typeof D.sys !== 'object') D.sys = {};
  const saveD = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} };
  const on = k => !!D.sys[k];
  let lastBreak = -9, onChange = () => {};
  // smoke / fire puffs in world space (a small pool, recycled)
  const N = LOW ? 14 : 24, puffs = [];
  for (let i = 0; i < N; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: '#555', transparent: true, depthWrite: false, opacity: 0 })); m.visible = false; scene.add(m); puffs.push({ m, life: 0, max: 1, vx: 0, vz: 0, s0: 1, s1: 3, add: false }); }
  let pi = 0, emitT = 0;
  function puff(x, z, col, add, life, s0, s1, vx, vz) { const p = puffs[pi++ % N]; p.m.material.color.set(col); p.m.material.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; p.m.material.needsUpdate = true; p.m.position.set(x, 0.6 + Math.random() * 0.6, z); p.m.visible = true; Object.assign(p, { life, max: life, vx, vz, s0, s1, add }); }
  const API = {
    D, SYS,
    get list() { return SYS.filter(([k]) => on(k)).map(([k, n, d]) => ({ k, n, d })); },
    broken: on,
    speedK: () => on('engines') ? 0.65 : 1, canBoost: () => !on('engines'), rateK: () => on('guns') ? 0.5 : 1, shieldsOff: () => on('shields'), navOff: () => on('nav'),
    set onChange(f) { onChange = f; }, get onChange() { return onChange; },
    hit(d) { if (St.phase !== 'free' || St.t - lastBreak < 4) return; const free = SYS.filter(([k]) => !on(k)); if (!free.length) return;
      const ch = d / 40 * (St.hull < (St.hullMax || 100) * 0.5 ? 2 : 1); if (Math.random() > ch) return;
      const [k, n, txt] = free[(Math.random() * free.length) | 0]; D.sys[k] = 1; saveD(); lastBreak = St.t;
      toast('DAMAGE REPORT · ' + n + (k === 'fuel' ? '' : ' DAMAGED') + ' · ' + txt + '. A REPAIR KIT or any DOCK fixes it.', 4.5); snd('lowHp', { v: 0.8 }); burst(St.x, St.z, '#ffb070', 14, 1.2); onChange(k, true); },
    fixOne() { const L = API.list; if (!L.length) return null; const k = L[0].k; delete D.sys[k]; saveD(); onChange(k, false); return L[0].n; },
    fixAll() { const n = API.list.length; D.sys = {}; saveD(); SYS.forEach(([k]) => onChange(k, false)); return n; },
    repairCost(hullMissing) { return Math.ceil(hullMissing / 2) + API.list.length * SYS_FIX; },
    update(dt) { const hf = St.hull / (St.hullMax || 100), free = St.phase === 'free' || St.phase === 'docking' || St.phase === 'tow';
      if (on('fuel') && St.phase === 'free') St.fuel = Math.max(0, St.fuel - 0.5 * dt);
      const bx = St.x - Math.sin(St.h) * 2.2, bz = St.z + Math.cos(St.h) * 2.2;
      if (free && (hf < 0.5 || on('fuel') || on('engines')) && (emitT -= dt) <= 0) { emitT = hf < 0.25 ? 0.06 : 0.12;
        const dv = 3 + Math.random() * 3, ox = (Math.random() - 0.5) * 1.6, oz = (Math.random() - 0.5) * 1.6;
        if (hf < 0.5 || on('engines')) puff(bx + ox, bz + oz, hf < 0.25 ? '#3a3633' : '#6b6560', false, 1.6, 1.2, 4.5, -Math.sin(St.h) * dv + (St.vx || 0) * 0.2, Math.cos(St.h) * dv + (St.vz || 0) * 0.2);
        if (hf < 0.25) puff(St.x + ox * 0.6, St.z + oz * 0.6, Math.random() < 0.5 ? '#ff8a2a' : '#ffd23a', true, 0.45, 1.0, 2.2, -Math.sin(St.h) * 2, Math.cos(St.h) * 2);
        if (on('fuel') && Math.random() < 0.6) puff(St.x + ox, St.z + oz, '#bff7d0', true, 0.9, 0.6, 2.4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
        if (hf < 0.5 && Math.random() < 0.18) { burst(St.x + ox, St.z + oz, '#ffe0a0', 3, 0.5); if (Math.random() < 0.3) snd('hitShip', { v: 0.25 }); } }
      for (const p of puffs) { if (p.life <= 0) continue; p.life -= dt; if (p.life <= 0) { p.m.visible = false; continue; } const k = 1 - p.life / p.max;
        p.m.position.x += p.vx * dt; p.m.position.z += p.vz * dt; p.m.position.y += dt * 0.8; const s = p.s0 + (p.s1 - p.s0) * k; p.m.scale.set(s, s, 1); p.m.material.opacity = (p.add ? 0.9 : 0.55) * (1 - k); } },
  };
  return API;
}
