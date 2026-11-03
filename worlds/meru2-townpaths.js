// MERU 2.0 — Ben's FOUNTAIN-AREA PATH LAYOUT (Town Layout Workshop, PATHS tab; localStorage 'meru2.townPaths' wins over this copy).
// The network itself is worked out from the town layout by the workshop (entrance clearings, door paths, second paths, front strips, links);
// this file keeps Ben's choices: on = paths switched on/off by hand, k = bend distances he dragged, extra = paths he asked for between two entrances.
export const TOWN_PATHS = {
  on: { 'tavern:ew': true },
  k: {},
  extra: [['tavern', 'bank'], ['itemshop', 'burgers']],
};
