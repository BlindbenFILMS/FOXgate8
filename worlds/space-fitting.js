// 8 GATES · THE FITTING SHOP (s604, Ben). Button 1 stays the twin laser. Button 2 fires the special in your ACTIVE SLOT; the SLOT button on
// the top banner (next to the fuel dial) cycles your slots. Slots by hull: SCOUT 1 · SHUTTLE 2 · CRUISER / GUNNER / FLAGSHIP 3.
// Each of the 9 worlds' SHIPYARDS sells ONE unique special (Ben), 100-300 G. You start with the TORPEDO. Every special costs ENERGY
// (light, 8-15 EN). BUY TIER per weapon at any shipyard: II 150 G · III 300 G (more damage + a shorter cooldown).
// Weapons you own but haven't fitted are STORED at the shipyards: refit at any of them. The Bridge WEAPONS tab keeps the TEST picker.
export const SPECIAL_SHOP = {   // key: [world that sells it, price, energy, cooldown s]
  PLASMA_TORPEDO: ['meru', 0, 10, 0.5], WEB: ['gaya', 160, 12, 1.2], MINES: ['jidda', 140, 10, 1.0], FLAK: ['kufa', 120, 8, 0.45], RED_CANNON: ['luxor', 300, 15, 1.6],
  ARC: ['nebo', 220, 12, 0.9], RAIL: ['ur', 260, 14, 1.2], MISSILE: ['zion', 180, 12, 0.7], EMP: ['shasta', 240, 15, 1.8] };
export const SPECIAL_NAME = { PLASMA_TORPEDO: 'TORPEDO', MISSILE: 'MISSILE', RED_CANNON: 'THE LANCE', RAIL: 'RAIL', FLAK: 'FLAK', MINES: 'MINES', WEB: 'WEB', ARC: 'ARC', EMP: 'EMP' };
export const TIER_COST = [0, 150, 300], TIER_K = [1, 1.35, 1.7], TIER_CD = [1, 0.85, 0.7], ROMAN = ['I', 'II', 'III'];
export const SLOTS = { ship: 1, hullShuttle: 2, hullCorvette: 3, hullGunship: 3, hullFlagWalk: 3 };
export const slotsFor = hull => SLOTS[hull] || 1;
export function fit(save) { const v = save.stat('shipFit', null); const F = v && typeof v === 'object' ? { owned: { ...(v.owned || {}) }, slots: (v.slots || []).slice(), act: v.act | 0 } : { owned: { PLASMA_TORPEDO: 1 }, slots: ['PLASMA_TORPEDO'], act: 0 };
  if (!F.owned.PLASMA_TORPEDO) F.owned.PLASMA_TORPEDO = 1; return F; }
export const setFit = (save, F) => save.setStat('shipFit', F);
// the slots this hull can use (extra slots fitted on a bigger hull stay saved but sleep in a small one)
export function live(save, hull) { const F = fit(save), n = slotsFor(hull), S = []; for (let i = 0; i < n; i++) S.push(F.slots[i] || null); return { F, S, n, act: Math.min(F.act, n - 1) }; }
export function active(save, hull) { const L = live(save, hull); return L.S[L.act] || L.S.find(Boolean) || null; }
export function nextSlot(save, hull) { const L = live(save, hull); if (L.n < 2) return active(save, hull); let i = L.act; for (let k = 0; k < L.n; k++) { i = (i + 1) % L.n; if (L.S[i]) break; } L.F.act = i; setFit(save, L.F); return L.S[i]; }
export function buy(save, key) { const P = SPECIAL_SHOP[key], F = fit(save); if (!P || F.owned[key]) return { ok: false, why: 'You already own it.' }; if (!save.spend(P[1])) return { ok: false, why: SPECIAL_NAME[key] + ' costs ' + P[1] + ' G.' };
  F.owned[key] = 1; const e = F.slots.indexOf(null); if (e >= 0) F.slots[e] = key; setFit(save, F); return { ok: true }; }
export function buyTier(save, key) { const F = fit(save), t = F.owned[key] || 0; if (!t) return { ok: false, why: 'Buy it first.' }; if (t >= 3) return { ok: false, why: 'Already tier III.' }; const c = TIER_COST[t]; if (!save.spend(c)) return { ok: false, why: 'Tier ' + ROMAN[t] + ' costs ' + c + ' G.' }; F.owned[key] = t + 1; setFit(save, F); return { ok: true, tier: t + 1 }; }
// tap a slot in the shop = the next owned special that isn't in another slot (then EMPTY)
export function cycleSlot(save, hull, i) { const F = fit(save), n = slotsFor(hull); if (i >= n) return; const own = Object.keys(SPECIAL_SHOP).filter(k => F.owned[k]), used = new Set(F.slots.filter((k, j) => k && j !== i && j < n)), opts = [...own.filter(k => !used.has(k)), null];
  const cur = opts.indexOf(F.slots[i] || null); while (F.slots.length <= i) F.slots.push(null); F.slots[i] = opts[(cur + 1) % opts.length]; setFit(save, F); }
export function shopRows(save, hull, world, gold) { const F = fit(save), n = slotsFor(hull);
  return { n, slots: [...Array(3)].map((_, i) => ({ i, on: i < n, key: F.slots[i] || null, name: i < n ? (F.slots[i] ? SPECIAL_NAME[F.slots[i]] + ' ' + ROMAN[(F.owned[F.slots[i]] || 1) - 1] : 'EMPTY') : 'NEEDS A BIGGER HULL' })),
    owned: Object.keys(SPECIAL_SHOP).filter(k => F.owned[k]).map(k => { const t = F.owned[k]; return { k, name: SPECIAL_NAME[k], tier: ROMAN[t - 1], en: SPECIAL_SHOP[k][2], next: t < 3 ? TIER_COST[t] : 0, can: t < 3 && gold >= TIER_COST[t], fitted: F.slots.slice(0, n).includes(k) }; }),
    sale: Object.keys(SPECIAL_SHOP).filter(k => SPECIAL_SHOP[k][0] === world && SPECIAL_SHOP[k][1] > 0).map(k => ({ k, name: SPECIAL_NAME[k], price: SPECIAL_SHOP[k][1], en: SPECIAL_SHOP[k][2], own: !!F.owned[k], can: !F.owned[k] && gold >= SPECIAL_SHOP[k][1] })),
    elsewhere: Object.keys(SPECIAL_SHOP).filter(k => !F.owned[k] && SPECIAL_SHOP[k][0] !== world).map(k => SPECIAL_NAME[k] + ' · ' + SPECIAL_SHOP[k][0].toUpperCase()) }; }
