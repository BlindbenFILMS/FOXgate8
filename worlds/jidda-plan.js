// 8 GATES — JIDDA MASTER MAP PLAN. One world frame for every Jidda zone, minigame and (later) the walkable world.
// World units = metres. Origin = the J crest on jTown. +x = east, -z = north (three.js convention).
// Each minigame is a ZONE with its own local frame placed here (origin + yaw), so the real Jidda map can mount the same islands later.
// Names in brackets are the 2D game's room keys (uploads/8GATES_DESIGN_BRIEF_ALL.md): keep them exact.

export const JIDDA = {
  name: 'JIDDA', tint: '#5ec97e', sea: '#38bdf8',
  islands: {
    jTown:        { label: 'Jidda Town Square', at: [0, 0], r: 150, note: 'hub island in the lagoon, crest mooring + transport pad at the centre, piers to every building, canals between the blocks' },
    jCastlePath:  { label: 'Castle Path', at: [0, -520], r: 170, note: 'headland, fortress wall to wall; the Castle (jThrone) sits on its own rock at the tip', castle: [0, -580] },
    barracksIsle: { label: 'Barracks isle', at: [200, -470], r: 42 },
    jFarm:        { label: 'Farm Island', at: [0, 500], r: 140, note: 'carrot rows, whack-a-mole marquee, flamingos' },
    jSurfContest: { label: 'Surf Contest', at: [640, 0], r: 120, note: 'THE BREAK faces east; BIG BLEACHERS of fox fans on the beach facing the break', break: [780, 0], bleachers: [690, 0] },
    // Reach islands sit outside the jetski zone's open-sea box (local x ±280) so the race + galleon water stays clear
    jReachLanding:{ label: 'Corsair Reach · Landing', at: [-700, -330], r: 70 },
    jReachCrag:   { label: 'Corsair Reach · The Crag', at: [-860, -430], r: 80 },
    jReachShoals: { label: 'Corsair Reach · The Shoals', at: [-640, 340], r: 90 },
    jReachHideout:{ label: 'Corsair Reach · Pirate Hideout', at: [-792, 0], r: 38, note: 'stockade on its own island, sea gate faces east (toward town)' },
    mountain:     { label: 'The Mountain', at: [-1250, -900], r: 380, h: 520, note: 'one big steep rocky mountain rising from the sea, tiny beach, almost no walkable land' },
  },
  lighthouses: [[-250, -130], [300, -600], [820, -150], [-860, 70]],
  windmills: [[-70, 520], [70, 545], [0, 430]],
  // ZONES: local frame → world. world = [ox + lx*cos(yaw) + lz*sin(yaw), oz - lx*sin(yaw) + lz*cos(yaw)]
  zones: {
    // JETSKI CANAL RUN [jidda jetski]: starts in jTown's west harbour, canals west through the outer islands, open sea, ends at the Pirate Hideout. Local +z = west.
    jetski: { origin: [-150, 0], yaw: -Math.PI / 2, file: 'minigames/jidda/jetski-run.js' },
    // SURF [jSurfContest · THE BREAK]: local +z = toward the beach (west), break in front of the bleachers.
    surf: { origin: [780, 0], yaw: Math.PI / 2, file: 'minigames/jidda/surf-break.js' },
  },
};

export function toWorld(zone, lx, lz) { const Z = JIDDA.zones[zone], c = Math.cos(Z.yaw), s = Math.sin(Z.yaw); return [Z.origin[0] + lx * c + lz * s, Z.origin[1] - lx * s + lz * c]; }
export function toLocal(zone, wx, wz) { const Z = JIDDA.zones[zone], c = Math.cos(Z.yaw), s = Math.sin(Z.yaw), dx = wx - Z.origin[0], dz = wz - Z.origin[1]; return [dx * c - dz * s, dx * s + dz * c]; }
// every landmark as [kind, label, local x, local z, size] for a zone's far scenery
export function landmarks(zone) {
  const out = [], I = JIDDA.islands;
  for (const k in I) { const [x, z] = toLocal(zone, I[k].at[0], I[k].at[1]); out.push([k === 'mountain' ? 'mountain' : 'island', I[k].label, x, z, I[k].r, I[k].h || 0, k]); }
  if (I.jCastlePath.castle) { const [x, z] = toLocal(zone, ...I.jCastlePath.castle); out.push(['castle', 'The Castle', x, z, 40, 0, 'castle']); }
  JIDDA.lighthouses.forEach(([a, b], i) => { const [x, z] = toLocal(zone, a, b); out.push(['lighthouse', 'Lighthouse ' + (i + 1), x, z, 6, 0, 'lh' + i]); });
  JIDDA.windmills.forEach(([a, b], i) => { const [x, z] = toLocal(zone, a, b); out.push(['windmill', 'Windmill', x, z, 5, 0, 'wm' + i]); });
  return out;
}
