// 8 GATES · TRADE GOOD ICONS (s599). One line icon per good (24 grid, stroke 2, Lucide-style), coloured by category.
// iconURL(key, colour?) → an SVG data URL (img src / canvas). Used by the Bridge MARKET + CARGO tabs, dock trade lists, the planet Build Board.
export const CATS = { lux: ['LUXURY', '#ffd23a'], build: ['BUILDING', '#f3f2f2'], farm: ['FARM + FOOD', '#6ee7b7'], power: ['POWER + RARE', '#7fd0ff'], prize: ['PRIZE', '#ff8ad8'] };
export const TRADE_ICONS = {
  meru_incense: ['MERU INCENSE', 'MERU', 'lux', '<path d="M5 17h14l-2 5H7z"/><path d="M12 17v-7"/><path d="M12 10c-2-2 2-3 0-5s2-2.5 0-3"/>'],
  jidda_spice: ['JIDDA SPICE', 'JIDDA', 'lux', '<path d="M6 7h12"/><path d="M8 7 7 3h10l-1 4"/><path d="M7.5 7C5 10 4 13.5 4.5 17a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4c.5-3.5-.5-7-3-10"/><path d="M9 13h.01M15 13h.01M12 16h.01M9.5 18h.01M14.5 18h.01"/>'],
  ur_amber: ['UR AMBER', 'UR', 'lux', '<path d="M12 2 20 7v10l-8 5-8-5V7z"/><path d="M10 11c1-1 3-1 4 0"/><path d="M12 11v4"/>'],
  nebo_ink: ['NEBO INK', 'NEBO', 'lux', '<path d="M8 11h7v9a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z"/><path d="M9.5 11V8h4v3"/><path d="M20 2 13 10"/><path d="M20 2c-1 3-3 5-5 6"/>'],
  aksum_coffee: ['AKSUM COFFEE', 'AKSUM', 'lux', '<ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(35 12 12)"/><path d="M7.5 18.5c3-3 6-9 9-13"/>'],
  gaya_timber: ['GAYA TIMBER', 'GAYA', 'build', '<circle cx="7" cy="16" r="4"/><circle cx="17" cy="16" r="4"/><circle cx="12" cy="8" r="4"/><path d="M12 8h.01M7 16h.01M17 16h.01"/>'],
  meru_stone: ['MERU STONE', 'MERU', 'build', '<path d="M3 13h8v7H3zM13 13h8v7h-8zM8 5h8v7H8z"/>'],
  zion_metal: ['ZION METAL', 'ZION', 'build', '<path d="M2 20l2-5h7l2 5zM11 20l2-5h7l2 5z"/><path d="M6.5 15l2-5h7l2 5"/>'],
  prism_glass: ['PRISM GLASS', 'LUXOR', 'build', '<path d="M5 3h14v18H5z"/><path d="M9 9l3-3M9 14l7-7"/>'],
  kufa_copper: ['KUFA COPPER', 'KUFA', 'build', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M20 12h2M12 12h.01"/>'],
  foundry_steel: ['FOUNDRY STEEL', 'SHASTA', 'build', '<path d="M4 4h16M4 20h16M12 4v16"/><path d="M4 4v2M20 4v2M4 20v-2M20 20v-2"/>'],
  ur_clay: ['UR CLAY', 'UR', 'build', '<path d="M8 9h8l2 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M8 9c0-3 8-3 8 0"/><path d="M7 15h10"/>'],
  jidda_lime: ['JIDDA LIME', 'JIDDA', 'build', '<path d="M2 20h20l-6-10-3 4-2-3z"/><path d="M16 5h.01M19 7h.01M13 3h.01"/>'],
  nebo_rope: ['NEBO ROPE + SAILCLOTH', 'NEBO', 'build', '<path d="M12 3v15"/><path d="M12 4l7 12h-7"/><path d="M12 7 7 16h5"/><path d="M3 20c3 1.5 15 1.5 18 0"/>'],
  babel_tile: ['BABEL TILE', 'BABEL', 'build', '<path d="M4 4h16v16H4z"/><path d="M12 4v16M4 12h16"/><path d="M8 6.5 9.5 8 8 9.5 6.5 8zM16 14.5l1.5 1.5-1.5 1.5-1.5-1.5z"/>'],
  delos_marble: ['DELOS MARBLE', 'DELOS', 'build', '<path d="M4 21h16M5 4h14M6 7h12M6 18h12"/><path d="M8 7v11M12 7v11M16 7v11"/>'],
  gaya_grain: ['GAYA GRAIN', 'GAYA', 'farm', '<path d="M12 22V8"/><path d="M12 8c-3-1-3-4-3-6 2 0 3 2 3 6zM12 8c3-1 3-4 3-6-2 0-3 2-3 6z"/><path d="M12 14c-3-1-4-3-4-5 2 0 4 2 4 5zM12 14c3-1 4-3 4-5-2 0-4 2-4 5z"/>'],
  earth_seed: ['EARTH SEED', 'EARTH', 'farm', '<path d="M12 20v-8"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 12c0-3 2-5 6-5 0 3-2 5-6 5z"/><path d="M6 20h12"/>'],
  kufa_camel: ['KUFA CAMELS', 'KUFA', 'farm', '<path d="M3 18v-4c0-2 1-4 3-4 1.5-3 4-3 5 0 1-3 3.5-3 4.5 0H17l2-3.5 2 1-2 4.5v6"/><path d="M6 18v3M10 18v3M15 18v3"/>'],
  shasta_sheep: ['SHASTA WOOL SHEEP', 'SHASTA', 'farm', '<path d="M7 16a3 3 0 0 1 0-6 3 3 0 0 1 5-2 3 3 0 0 1 5 2 3 3 0 0 1 0 6z"/><path d="M17 10h3.5v4H17"/><path d="M9 16v4M15 16v4"/>'],
  gaya_goat: ['GAYA GOATS', 'GAYA', 'farm', '<path d="M8 6C6.5 3.5 4 3 2.5 5M16 6c1.5-2.5 4-3 5.5-1"/><path d="M8 7h8l-1 8-3 4-3-4z"/><path d="M12 19v3M10 11h.01M14 11h.01"/>'],
  zion_salt: ['ZION SALT', 'ZION', 'farm', '<path d="M4 11h9v9H4zM11 4h9v9h-9z"/><path d="M7 14h.01M16 7h.01"/>'],
  nebo_bees: ['NEBO BEES', 'NEBO', 'farm', '<ellipse cx="12" cy="15" rx="4" ry="5"/><path d="M8.3 13.5h7.4M8.6 17h6.8"/><path d="M12 10C10 6 6 6 5 9c1 2 4 2.5 7 1zM12 10c2-4 6-4 7-1-1 2-4 2.5-7 1z"/><path d="M11 6 10 3M13 6l1-3"/>'],
  nebo_honey: ['NEBO HONEY', 'NEBO', 'farm', '<path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M8 9V6h8v3"/><path d="M10 13v2a2 2 0 0 0 4 0v-2"/>'],
  raw_crystal: ['RAW CRYSTAL', 'PLAYER PLANETS', 'power', '<path d="M12 2l3 5-3 15-3-15z"/><path d="M6.5 9 8.5 12 6.5 21 4.5 12zM17.5 9l2 3-2 9-2-9z"/>'],
  shasta_ice_core: ['SHASTA ICE CORE', 'SHASTA', 'power', '<path d="M7 3h10v18H7z"/><path d="M12 8v8M9 10l6 4M15 10l-6 4"/>'],
  star_iron: ['STAR IRON', 'ERIDU', 'power', '<path d="M13 3l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/><path d="M6 21l4-4M3 17l3-2M9 22l1-3"/>'],
  raw_starstone: ['RAW STARSTONE', 'CUSCO', 'power', '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M10 3 8 9l4 12 4-12-2-6"/>'],
  machine_parts: ['MACHINE PARTS', 'THE FLEET', 'power', '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'],
  ephraim_brick: ['EPHRAIM BRICK', 'EPHRAIM', 'build', '<path d="M2 7h20v5H2zM2 12h20v5H2z"/><path d="M8 7v5M16 7v5M5 12v5M12 12v5M19 12v5"/>'],
  ephraim_cloth: ['EPHRAIM CLOTH', 'EPHRAIM', 'build', '<path d="M5 3h14v14l-3-2-4 2-4-2-3 2z"/><path d="M8 7h8M8 11h8"/>'],
  ephraim_wool: ['EPHRAIM WOOL', 'EPHRAIM', 'build', '<circle cx="9" cy="10" r="4"/><circle cx="15" cy="10" r="4"/><circle cx="12" cy="15" r="4"/><path d="M5 20h14"/>'],
  ephraim_produce: ['EPHRAIM PRODUCE', 'EPHRAIM', 'food', '<path d="M3 10h18l-2 10H5z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/><path d="M9 14h6"/>'],
  ice_pearl: ['ICE PEARL', 'IONA', 'prize', '<path d="M3 14a9 9 0 0 0 18 0z"/><circle cx="12" cy="10" r="3"/><path d="M7 14v3M12 14v4M17 14v3"/>'],
  reaver_bullion: ['REAVER BULLION', 'QOM', 'prize', '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>']
};
// the trade table's own keys for the frontier goods
for (const [a2, b2] of [['beta1_good', 'ice_pearl'], ['beta2_good', 'reaver_bullion'], ['beta3_good', 'star_iron'], ['beta4_good', 'raw_starstone'], ['earth_good', 'earth_seed']]) TRADE_ICONS[a2] = TRADE_ICONS[b2];
const ALIAS = new Set(['beta1_good', 'beta2_good', 'beta3_good', 'beta4_good', 'earth_good']); export const isAlias = k => ALIAS.has(k);
const CACHE = {};
export function iconSVG(key, colour) { const d = TRADE_ICONS[key]; if (!d) return ''; const c = colour || CATS[d[2]][1]; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d[3] + '</svg>'; }
export function iconURL(key, colour) { const k = key + '|' + (colour || ''); return CACHE[k] || (CACHE[k] = 'data:image/svg+xml;utf8,' + encodeURIComponent(iconSVG(key, colour))); }
