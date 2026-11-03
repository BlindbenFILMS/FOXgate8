// s710 SUPER ICONS (Ben): one simple stroke icon (24 box, Lucide-style like engine/fighter-super.js) for every Noble / Hope / R-8 / Warden / Maker super + weapon.
// superIcon(k) → glyph key · iconURL(k, colour) → a data: URL for an <img>.
export const GLYPH = {
  shoe: 'M3 16h15a3 3 0 0 0 3-3v-1l-6-2-3-5H6L3 9zM3 16v3h18v-3', bird: 'M4 13c3 0 5-2 6-5l3 3 7-2-3 4c0 4-3 7-8 7-3 0-5-2-5-4zM13 8l2-4', bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  drill: 'M3 12h6l3-3h4l5 3-5 3h-4l-3-3M12 9v6', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', wave: 'M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0M2 18c2-4 4-4 6 0s4 4 6 0 4-4 6 0',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11v2', orbit: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 12a9 9 0 0 1 9-9M21 12a9 9 0 0 1-9 9', flame: 'M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 1 1 2 2 2 3 0-3 1-5 2-7z',
  magnet: 'M6 3v8a6 6 0 0 0 12 0V3M6 3h4v8a2 2 0 0 0 4 0V3h4', hammer: 'M14 4l6 6-3 3-6-6zM11 7 3 15l3 3 8-8', saw: 'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',
  rocket: 'M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M12 15l-3-3c1-5 5-9 11-9 0 6-4 10-9 11z', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1', down: 'M12 3v15M5 12l7 7 7-7', sparkles: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
  tornado: 'M3 4h18M5 8h14M7 12h10M9 16h6M11 20h2', rain: 'M7 14a5 5 0 1 1 1-10 6 6 0 0 1 11 2 4 4 0 0 1-1 8zM8 18l-1 3M12 18l-1 3M16 18l-1 3', grid: 'M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18',
  signal: 'M12 12v9M8 8a5.5 5.5 0 0 1 8 0M5 5a10 10 0 0 1 14 0M12 12a1 1 0 1 0 0-.01', crown: 'M3 18h18M4 18l-1-11 5 4 4-7 4 7 5-4-1 11', wrench: 'M15 6a4 4 0 0 0-5 5L3 18l3 3 7-7a4 4 0 0 0 5-5l-3 3-3-3z',
  fist: 'M7 11V7a2 2 0 0 1 4 0v3M11 10V6a2 2 0 0 1 4 0v4M15 10V8a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0', bullet: 'M5 19l4-4M8 12l4 4 8-8V4h-4z', bomb: 'M11 8a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM14 8l3-3M18 2l1 2 2 1-2 1-1 2', drone: 'M8 12h8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 6h6M15 6h6M6 6v3M18 6v3',
  turret: 'M5 21h14M7 21v-6h10v6M12 15v-4M12 11h8', dome: 'M3 18h18M5 18a7 7 0 0 1 14 0M12 4v3', wheel: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v5M12 16v5M3 12h5M16 12h5', cane: 'M8 3h4a3 3 0 0 1 3 3v15', vault: 'M4 20l6-14 4 4 6-6M14 4h6v6' };
const BY = { shoe: 'shoe', double: 'shoe', ricochet: 'shoe', tow: 'link', orbit: 'orbit', homing: 'target', drop: 'down', storm: 'drone', finale: 'crown', shock: 'bolt', rush: 'wheel', rain: 'rocket',
  bird: 'bird', echo: 'wave', sweep: 'cane', wave: 'wave', mines: 'sparkles', seismic: 'down', wing: 'shield', flock: 'bird', beam: 'eye', vault: 'vault', voice: 'music',
  fist: 'fist', drill: 'drill', slam: 'hammer', magnet: 'magnet', saw: 'saw', rivet: 'bullet', ore: 'target', hook: 'link', scan: 'eye', grenade: 'bomb',
  overdrive: 'bolt', jets: 'rocket', burrow: 'drill', spray: 'bullet', dome: 'dome', tornado: 'tornado', web: 'link', avalanche: 'rain', lift: 'magnet', grid: 'grid', signal: 'signal', mega: 'crown',
  bash: 'shield', turret: 'turret', drones: 'drone' };
export const superIcon = k => BY[k] || 'sparkles';
export const iconURL = (k, col = '#f3f2f2') => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"><path d="' + GLYPH[superIcon(k)] + '"/></svg>');
