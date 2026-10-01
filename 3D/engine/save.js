// One save for every world: story flags, gold, XP, items, relics, outfit, where you are.
const KEY = '8gates.save.v1';
const fresh = () => ({ v: 1, world: 'meru', zone: 'meruTown', gold: 0, xp: 0, items: {}, relics: [], outfit: null, flags: {}, stats: {} });
let data = fresh();
try { const raw = localStorage.getItem(KEY); if (raw) data = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
const subs = new Set(); let tm = 0;
function changed() { clearTimeout(tm); tm = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }, 150); subs.forEach(f => { try { f(data); } catch (e) {} }); }
const list = v => v == null ? [] : Array.isArray(v) ? v : [v];

export const save = {
  get data() { return data; },
  flag: k => !!data.flags[k],
  setFlag(k, v = true) { if (!!data.flags[k] === !!v) return; if (v) data.flags[k] = true; else delete data.flags[k]; changed(); },
  // 'name', '!name', or a list that must all hold (the 2D game's qTest rule)
  test(req) { const L = list(req); if (!L.length) return false; return L.every(k => { k = String(k); const not = k[0] === '!'; return !!data.flags[not ? k.slice(1) : k] !== not; }); },
  stat: (k, d = 0) => data.stats[k] ?? d,
  setStat(k, v) { if (data.stats[k] === v) return; data.stats[k] = v; changed(); },
  best(k, v) { if (v > (data.stats[k] || 0)) { data.stats[k] = v; changed(); return true; } return false; },
  addGold(n) { data.gold = Math.max(0, data.gold + n); changed(); return data.gold; },
  spend(n) { if (data.gold < n) return false; data.gold -= n; changed(); return true; },
  addXp(n) { data.xp += n; changed(); return data.xp; },
  count: id => data.items[id] || 0,
  give(id, n = 1) { data.items[id] = (data.items[id] || 0) + n; changed(); },
  take(id, n = 1) { if ((data.items[id] || 0) < n) return false; data.items[id] -= n; if (!data.items[id]) delete data.items[id]; changed(); return true; },
  addRelic(id) { if (!data.relics.includes(id)) { data.relics.push(id); changed(); } },
  setOutfit(o) { data.outfit = o; changed(); },
  where(world, zone) { if (data.world === world && data.zone === zone) return; data.world = world; if (zone) data.zone = zone; changed(); },
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  reset() { data = fresh(); changed(); },
};
if (typeof window !== 'undefined') window.__8G_SAVE = save; // console access, like the 2D build
