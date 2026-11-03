// 8 GATES · PLAYER PLANET · TRADE GOODS ON THE PLANET (s599, Ben: "planting the bought seeds in the farms AND bringing in the animals / bees").
// USE: what each trade good becomes when you UNLOAD SHIP CARGO on the Build Board. Building goods → planet stock; food goods → food;
// animals + bees → live stock that needs its own building (APIARY / SHEEP FOLD / GOAT SHED / CAMEL PEN); EARTH SEED → plant a field.
// Luxury goods (incense, spice, amber, ink) stay in the hold: sell them at a high-paying port.
// Everything lives in the planet stock (save stat ppStock): bees, sheep, goats, camels, seeds, wool, cl (clay), fields [{ left }].
export const USE = {
  gaya_timber: { k: 't', per: 10, n: 'TIMBER' }, meru_stone: { k: 's', per: 10, n: 'STONE' }, zion_metal: { k: 'm', per: 10, n: 'METAL' },
  prism_glass: { k: 'gl', per: 5, n: 'GLASS' }, kufa_copper: { k: 'cu', per: 5, n: 'COPPER' }, foundry_steel: { k: 'st', per: 5, n: 'STEEL' },
  ur_clay: { k: 'cl', per: 10, n: 'CLAY' }, jidda_lime: { k: 'li', per: 5, n: 'LIME' }, nebo_rope: { k: 'ro', per: 5, n: 'ROPE + SAILCLOTH' }, shasta_ice_core: { k: 'ic', per: 2, n: 'ICE CORES' }, babel_tile: { k: 'ti', per: 5, n: 'BABEL TILE' }, delos_marble: { k: 'ma', per: 5, n: 'DELOS MARBLE' },
  gaya_grain: { food: 12, n: 'FOOD (FLOUR)' }, zion_salt: { food: 15, n: 'FOOD (SALTED STORES)' }, nebo_honey: { food: 10, n: 'FOOD (HONEY)' },
  earth_good: { k: 'seeds', per: 1, n: 'EARTH SEED' },
  nebo_bees: { k: 'bees', per: 1, n: 'BEE HIVES', cap: 'hives', home: 'APIARY' }, shasta_sheep: { k: 'sheep', per: 1, n: 'SHEEP', cap: 'sheep', home: 'SHEEP FOLD' },
  gaya_goat: { k: 'goats', per: 1, n: 'GOATS', cap: 'goats', home: 'GOAT SHED' }, kufa_camel: { k: 'camels', per: 1, n: 'CAMELS', cap: 'camels', home: 'CAMEL PEN' }
};
// stock keys every cost can use (player-build RES)
export const RES_MORE = [['gl', 'GLASS'], ['cu', 'COPPER'], ['st', 'STEEL'], ['br', 'BRICK'], ['li', 'LIME'], ['ro', 'ROPE'], ['ic', 'ICE CORE'], ['ti', 'TILE'], ['ma', 'MARBLE']];
// the new buildings (same row format as player-build CATALOG)
export const FARM_CATALOG = [
  ['apiary', 'APIARY', 'food', 'farm town', 6, { g: 40, t: 14, gl: 1 }, 0, [12, 10, 5], ['#f0d878', '#5a3a22', '#201e1d'], 'Hives for NEBO BEES. Honey never spoils.', { hives: 6 }],
  ['greenhouse', 'GREENHOUSE', 'food', 'farm town', 10, { g: 80, t: 10, gl: 4, cu: 1 }, 0, [22, 14, 7], ['#d8f0e8', '#3a6a4a', '#7fe3ff'], 'Two more fields for EARTH SEED, all year round.', { fields: 2 }],
  ['sheepfold', 'SHEEP FOLD', 'food', 'farm', 8, { g: 50, t: 20, s: 4, ro: 1 }, 0, [20, 16, 6], ['#f3f2f2', '#8a3a2a', '#201e1d'], 'Shasta sheep give wool. Lambs every few days.', { sheep: 8 }],
  ['goatshed', 'GOAT SHED', 'food', 'farm', 6, { g: 40, t: 16 }, 0, [16, 12, 6], ['#e8d8b8', '#5a3a22', '#3a6a4a'], 'Gaya goats give milk and cheese every day.', { goats: 8 }],
  ['camelpen', 'CAMEL PEN', 'ind', 'farm town', 6, { g: 40, t: 16, ro: 1 }, 0, [18, 14, 5], ['#d8b888', '#8a5a32', '#ec3013'], 'Kufa camels haul loads. Every camel speeds up building.', { camels: 6 }],
  ['weaver', 'WEAVING SHED', 'ind', 'town farm', 8, { g: 50, t: 16, s: 4 }, 0, [16, 12, 6], ['#efe2c8', '#2a4a7a', '#ffd23a'], 'Wool into rope and sailcloth. No more buying from Nebo.', { weave: 1 }],
  ['kiln', 'BRICK KILN', 'ind', 'town river', 8, { g: 50, s: 10, m: 2 }, 0, [14, 12, 9], ['#a0503a', '#3a2a1e', '#ffd23a'], 'Fires UR CLAY into brick for big houses and halls.', { kiln: 1 }],
  ['warehouse', 'WAREHOUSE', 'ind', 'town', 8, { g: 60, t: 20, s: 10 }, 0, [18, 14, 7], ['#c8ccd2', '#3a3836', '#ffd23a'], 'Stores 40 crates of trade goods your planet cannot use yet.', { wh: 40 }],   // s601d (Ben: a warehouse, bigger with upgrades)
  ['whbig', 'BIG WAREHOUSE', 'ind', 'town', 14, { g: 160, t: 30, s: 20, st: 4 }, 1, [26, 18, 9], ['#9aa6b6', '#201e1d', '#ffd23a'], 'Room for 80 more crates. Buy cheap, store, sell when it is hot.', { wh: 80 }]
];
// extra materials on the existing buildings (merged into their costs)
export const COST_MORE = { house2: { br: 6 }, house3: { br: 8, gl: 2, ti: 2 }, apts: { br: 12, gl: 4 }, tower: { cu: 2 }, windmill: { cu: 1 }, wheel: { cu: 1 }, plant: { cu: 4, ic: 2 }, refinery: { ic: 1, cu: 2 },
  fishery: { ro: 1 }, raft: { ro: 2 }, harbour: { li: 6, ro: 4 }, lighthouse: { gl: 4, li: 2 }, clinic: { gl: 2, cu: 1 }, school: { br: 8 }, police: { br: 6 }, arcade: { cu: 2 }, arena: { ma: 6 }, park: { ma: 2 }, carnival: { ro: 3 },
  turret: { st: 2, cu: 1 }, shipyard: { st: 10 }, fuel: { st: 6 }, smine: { st: 8 }, spaceport: { gl: 4, st: 4 } };
export const FIELD_HOURS = 72;   // an EARTH SEED field gives food for 3 game days, then needs new seed
const BASE_FIELDS = 2;           // the starting farm has room for 2 seed fields (+2 SECOND FARM, +2 per GREENHOUSE)

export function farmKit({ save, prompt, note, toast, chime, stock, setStock, totals }) {
  const fieldCap = T => BASE_FIELDS + (T.food >= 20 ? 2 : 0) + (T.fields || 0);
  const capOf = (u, T) => u.cap ? (T[u.cap] || 0) : Infinity;
  // how many of q crates of good k fit on the planet right now
  const fits = (k, q, s = stock(), T = totals()) => { const u = USE[k]; if (!u) return 0; if (!u.cap) return q; return Math.max(0, Math.min(q, capOf(u, T) - (s[u.k] || 0))); };
  function hour(s, n, T) {   // every game hour (n hours at once), mutates s
    const fd = (s.bees || 0) * 0.5 + (s.goats || 0) * 0.3; let crop = 0;
    const F = (s.fields || []).filter(f => f.left > 0); for (const f of F) { const h = Math.min(n, f.left); crop += h * 0.6; f.left -= h; } s.fields = F.filter(f => f.left > 0);
    if (fd || crop) s.f = Math.round(((s.f ?? 60) + fd * n + crop) * 10) / 10;
    if (s.sheep) s.wool = +((s.wool || 0) + s.sheep * 0.2 * n).toFixed(1);
    if (T.weave && s.wool >= 1) { const w = Math.min(Math.floor(s.wool), T.weave * n); s.wool -= w; s.ro = (s.ro || 0) + w; }
    if (T.kiln && s.cl >= 1) { const b = Math.min(s.cl, T.kiln * 2 * n); s.cl -= b; s.br = (s.br || 0) + b; }
  }
  function day(d, T) {   // breeding: sheep + goats + camels, never bees
    const s = stock(), born = [];
    for (const [k, cap, every, nm] of [['sheep', 'sheep', 2, 'LAMB'], ['goats', 'goats', 2, 'KID'], ['camels', 'camels', 3, 'CALF']]) {
      const have = s[k] || 0, room = (T[cap] || 0) - have; if (have >= 2 && room > 0 && d % every === 0) { const b = Math.min(room, Math.max(1, Math.floor(have / 4))); s[k] = have + b; born.push(b + ' ' + nm + (b > 1 ? 'S' : '')); } }
    if (born.length) { setStock(s); note('NEW ON THE FARM', born.join(' · ') + ' born.'); }
  }
  const speed = () => 1 + 0.05 * Math.min(10, stock().camels || 0);
  function plant(back) { const s = stock(), T = totals(), F = s.fields || []; if (!s.seeds) { toast('No EARTH SEED. It grows on EARTH, far out past the frontier.'); return; } if (F.length >= fieldCap(T)) { toast('Every field is planted. Build a GREENHOUSE for more.'); return; }
    s.seeds -= 1; s.fields = [...F, { left: FIELD_HOURS }]; setStock(s); chime(); note('FIELD PLANTED', 'Earth seed in the ground. +0.6 food an hour for 3 days.'); setTimeout(() => menu(back), 60); }
  function menu(back) { const s = stock(), T = totals(), F = s.fields || [], fc = fieldCap(T);
    const row = (n, have, cap, home, line) => [n + ' · ' + (have || 0) + (cap != null ? ' / ' + cap : '') + (cap === 0 ? ' · BUILD A ' + home : '') + (line ? ' · ' + line : ''), () => menu(back), true];
    prompt('FARM + ANIMALS', 'Food ' + Math.round(s.f ?? 60) + ' · seed fields ' + F.length + '/' + fc + ' · ' + (s.seeds || 0) + ' EARTH SEED in store', [
      ['PLANT A FIELD · 1 EARTH SEED', () => plant(back), !s.seeds || F.length >= fc],
      ...F.map((f, i) => ['FIELD ' + (i + 1) + ' · GROWING · ' + Math.ceil(f.left / 24) + ' DAYS LEFT', () => menu(back), true]),
      row('BEE HIVES', s.bees, T.hives || 0, 'APIARY', 'honey, never breed'), row('SHEEP', s.sheep, T.sheep || 0, 'SHEEP FOLD', Math.floor(s.wool || 0) + ' wool'),
      row('GOATS', s.goats, T.goats || 0, 'GOAT SHED', 'milk + cheese'), row('CAMELS', s.camels, T.camels || 0, 'CAMEL PEN', 'build speed +' + Math.round((speed() - 1) * 100) + '%'),
      ['BACK', () => back()]]); }
  return { hour, day, speed, fits, menu, fieldCap };
}
