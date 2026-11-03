// MERU — the space dock [meruSpacedock]. Layout (dockLayout), guards, lines and prompts verbatim from surface_meru.html.
// 2D map units → metres: 60 units = 1 m, centred on the gantry's junction (art 2765, 3030). Fractions are of the 5760 map.
const U = 60, S = 5760, OX = 2765, OZ = 3030;
export const fx = f => (f * S - OX) / U, fz = f => (f * S - OZ) / U;
const rect = r => ({ x0: fx(r.x0), x1: fx(r.x1), z0: fz(r.y0), z1: fz(r.y1) });
export const LAYOUT = {
  deck: rect({ x0: 0.176, x1: 0.762, y0: 0.507, y1: 0.545 }),
  landing: rect({ x0: 0.440, x1: 0.520, y0: 0.507, y1: 0.545 }),
  spur: rect({ x0: 0.462, x1: 0.498, y0: 0.446, y1: 0.507 }),
  spurS: rect({ x0: 0.462, x1: 0.498, y0: 0.545, y1: 0.606 }),
  hatch: { x: fx(0.735), z: fz(0.528) },
  pad: { x: fx(0.222), z: fz(0.526), r: 0.022 * S / U },
  guards: [{ x: fx(0.480), z: fz(0.472) }, { x: fx(0.480), z: fz(0.580) }],
  shipLen: 0.248 * S / U,
};
// the ship lies along the east end, nose north like the 2D drawing; the gangway bridges deck end → her west flank
export const SHIP = { x: LAYOUT.deck.x1 + 7.2, z: 2.2, y: 0.15, flank: LAYOUT.deck.x1 + 3.9 };
export const GANGWAY = { x0: LAYOUT.deck.x1 - 1.2, x1: SHIP.flank + 0.4, z0: -0.95, z1: 1.35 };
export const STEP_FROM = { x: SHIP.flank - 0.3, z: LAYOUT.hatch.z };

export const GUARDS = [
  { key: 'dockGuardA', name: 'Dock Guard', role: 'Meru Dock', outfit: 'armor', torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', ...LAYOUT.guards[0], face: Math.PI, mood: 'stern' },
  { key: 'dockGuardB', name: 'Dock Guard', role: 'Meru Dock', outfit: 'armor', torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', ...LAYOUT.guards[1], face: 0, mood: 'stern' },
];

export const DIALOGUE = {
  dockGuardA: [
    { who: 'player', text: 'Am I cleared to land here?' },
    { who: 'npc', text: 'You are on the ground, so that answered itself. The berth is the KING\'s and today the King is not counting berths.' },
    { who: 'npc', text: 'Down the gantry and through the arch. The TOWN is at the bottom of it, and everything else on this planet hangs off the town.' },
    { who: 'player', text: 'Busy day?' },
    { who: 'npc', text: 'Eleven ships since dawn and every one of them a leader with an escort. I have saluted more braid today than in the last four years.' },
    { who: 'npc', text: 'Not one of them looked at me. That is the posting, and I would rather that than the alternative.' },
  ],
  dockGuardB: [
    { who: 'player', text: 'Did you two draw the short straw?' },
    { who: 'npc', text: 'We asked for it. Everyone else is down on the castle road where the crowd is, and the crowd is where the trouble will be.' },
    { who: 'player', text: 'And up here?' },
    { who: 'npc', text: 'Up here it is cold and nothing happens. I have a flask and the whole valley to look at. Ask me again which of us drew short.' },
    { who: 'npc', text: 'Mind the plates on the gantry if it turns wet. They lift at the corner and they have had three foxes over this season.' },
  ],
};
// crossing the landing (updateDockGuards)
export const LANDING_TALK = [
  { who: 'npc', text: 'Are you here for King Might\u0027s Birthday?' },
  { who: 'player', text: 'Yes, and we need to see him right away. We have been attacked!' },
  { who: 'npc', text: 'King Might is busy hosting the tournament at the ARENA.' },
  { who: 'player', text: 'The MACHINE FLEET is malfunctioning!' },
  { who: 'npc', text: 'The Machine Fleet would never attack Foxes. And King Might is BUSY. MOVE ALONG!' },
];
export const LANDING_TALK_WON = [
  { who: 'npc', text: 'YOU SAVED THE DAY!' },
  { who: 'npc', text: 'The KING still needs your help \u2014 ESCORT his ship to the MACHINE FLEET STATION.' },
  { who: 'player', text: 'Where is he?' },
  { who: 'npc', text: 'Already away and running dark. Take your flagship at the end of the gantry and go after him.' },
];
export const PROMPTS = {
  pad: 'TELEPORT to PLANET MERU?',
  padWon: 'KING MIGHT needs you in space, go to your ship',
  ship: 'BACK to SPACE',
  aboard: ['Aboard', 'Escorting the King to the MACHINE FLEET STATION.'],
  notYet: ['Not yet', 'The SPACE GATE run is not wired up yet.'],
  escaped: 'KING MIGHT HAS ESCAPED',
};
