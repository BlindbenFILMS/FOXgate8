# START HERE — NEBO (Ben)

1. Make a NEW project (name it "8 GATES · NEBO"), attach the Modernist design system.
2. Unzip this folder into it (everything at the project root: CLAUDE.md, Map Workshop.dc.html, Layout Viewer.dc.html, kit/, layout/, worlds/, uploads/, vendor/ …).
3. Upload your 2D Nebo file into uploads/ as `surface_nebo.html` (from Documents\8 GATES\all-files\8GATES-SITE).
4. Connect GitHub (BlindbenFILMS/3D-foxgate8) when the chat asks; it copies only the games Nebo needs.
5. Paste this as the first message:

```
HI CLAUDE! This project builds the world NEBO of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md, worlds/nebo.plan.md and uploads/NEBO_BRIEF.md first, then uploads/surface_nebo.html (the 2D world: the source of truth for every room name, building position and NPC key).

A first draft of the map is already in layout/nebo.layout.json (open Map Workshop.dc.html, world NEBO). Check it against the 2D file: fix room names + NPC keys, keep what works.

PHASE 1 · LAYOUT: polish the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and keep layout/nebo.layout.json passing the checker. Walk it in Layout Viewer.dc.html (WALK IT, phone sizes 390x844 and 844x390). PARALLEL_WORLDS.md section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.
- NEBO IS GREEN AND FULL OF TREES AND SMALL HILLS. Trees come from terrain.forests + clearings (PARALLEL_WORLDS.md section 8): never on a path or door. Keep the town and every path flat; hills sit in the woods.
- Keep these Nebo extras: the AIRFIELD (runway, hangar, drop plane, PARACHUTE jumps) and THE HIGH GROVE, reachable ONLY by parachute (cliff hill + air zone) · THE HUSK CAMP forest cult base (DRAFT until the 2D file) · the ROYAL HELIPAD + ROYAL TELEPORT PAD west of the castle (teleport → the Nebo Space Dock) · the NATURE DANCE stage in the Community Garden · the Bike Park trailhead on the Forest Path.

PHASE 2 · EXTERIORS: every building's real outside with a BIG ROOF SIGN and a DOOR SIGN at the avatar's eye level, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9). Then stop: I walk the town.
PHASE 3 · INTERIORS: one building at a time, deluxe polish; I walk each. VERY IMPORTANT: bring in as much as possible of the rooms our games + jobs already have (repo), fitted into their buildings, so they become PLAYABLE IN THE WORLD.
TOP PRIORITY: MOBILE FIRST. Check everything at 390x844 and 844x390 before desktop.
PHASE 4 · JOBS + GAMES: each game and job in worlds/nebo.plan.md INSIDE its place, one per pass, the Meru Claw Crane way (IN_WORLD_GAMES.md). Game code is in GitHub BlindbenFILMS/3D-foxgate8 (3D-GAMES/GAMES_INDEX.md); copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start.
```

## Open picks for you (marked DRAFT in the map)
- FOREST CULT base THE HUSK CAMP (names + story from surface_nebo.html) · the nature dance on the garden stage (game or cutscene?) · the drop plane model for the Airfield · the High Grove chest reward.
- ROYAL HELIPAD + ROYAL TELEPORT PAD west of the castle (copy the Meru 2 recipe: worlds/meru2-royalpad.js in the main project).
- the legendary relic to FIND (stone by the Forest Meadow pond) · the famous relic to BUY (Amber & Relic) · the robots battle (DRAFT: THE FELLED RIDGE, hacked Machine Fleet harvesters) · the cave (DRAFT: THE ROOT HOLLOW) + its boss · NPC keys (from the brief until the 2D file is read).
- Nebo's look: deep pine green to a gold canopy haze, mist, honey lanterns. Trees come from terrain.forests (WALK IT shows them on the hills); clearings keep the meadow, garden and landing field open.
