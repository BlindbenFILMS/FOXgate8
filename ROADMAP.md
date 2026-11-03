# 8 GATES 3D · ROADMAP (s607, Ben + Claude)
The big-picture plan. BUILD_PLAN.md stays the session-by-session log; this file says what order the big pieces go in and why.

## Where we are (Ben, 30 Oct)
- MERU: map done, about half the story in. Battle system lives here.
- CREATURES: all made. ITEMS: most made.
- SPACE MAP: ~90 %.
- OTHER WORLDS + KYOTO (vision): surfaces built in other chats, ~75 % each. None has Meru's battle system or the shared world information yet.

## The one rule: build the SPINE before the content
Making every item and creature before any more story sounds safe, but the story will keep asking for new ones and making others pointless. That's normal, and fine as long as nothing is hard-wired into a map. What has to come first is the system everything plugs into, so that adding or cutting an item later means editing one line.

The SPINE = 5 shared files every world uses (some exist already):
1. ITEM CATALOG `engine/items.js` (NEW). One entry per item: id, name, what it does, price, which worlds sell / buy it, icon. Right now item info is spread around (Game HUD ITEM_NOTE, each world's shops). One list = an item carries the same name, price and effect on every world.
2. CREATURE ROSTER `engine/creature-roster.js` (exists). Every creature: id, look, behaviour, HP, drops (item ids from the catalog), which worlds it lives on.
3. SAVE `engine/save.js` (exists). One save: gold, XP, bag, story flags, relics, outfits, current world. Add a VERSION number so old saves upgrade when we add or remove things.
4. WORLD CONTRACT (NEW, written down). What every world page must have: Game HUD, the shared battle system, the save, a space dock exit, shops that read the catalog. A checker lists what a world is missing.
5. STORY `engine/story.js` (exists). Quests, steps and choices as data. Each quest names the items and creatures it needs, so the checker spots a missing one.

## How we handle changes later (adding, cutting, new battle moves)
- Never delete an item id: mark it RETIRED. Old saves still load; it just stops appearing in shops.
- New item = one catalog line + (optional) an icon. Every world sees it at once.
- New battle feature = added to the shared battle engine behind an on/off flag (the way Pearl Sail's ROOF DUEL sits inside the Kyoto duel). Worlds switch it on when they want it, so nothing old breaks.
- A CHANGES list at the bottom of this file: every add / cut, with the session it happened in.
- A CHECKER page (like Map Workshop's checker): "this quest needs item X, nobody sells it", "this creature drops an item that is retired", "world Y has no space dock exit".

## The order
### Phase 1 · SPINE (about 3-5 sessions, do now)
1. Item catalog (s608: engine/items.js + Item Workshop.dc.html made; HUD, Kia/Bram, Hardware, Outlets, Mart heals read it; DSF kiosks + HQ canteens + minigame prizes still to wire): gather every item from Meru, the space map, the HUD and the 2D world files into `engine/items.js`. Shops + HUD read from it. Ben reviews the full list in an ITEM WORKSHOP page (keep / cut / rename / price).
2. Creature roster check: every creature has drops + home worlds filled in.
3. Save version + "the bag travels": walk from Meru to the space map and back; gold, bag and flags match.
4. Write the WORLD CONTRACT + the checker.

### Phase 2 · STORY SKELETON (1-2 sessions, before more dialogue)
The whole game's story as a list of beats, not dialogue: per world, what happens, who you meet, which boss, which key item / relic you get, which robots you free (Machine Fleet arc). About one page. It tells us which items and creatures the story truly needs, so we only polish those. Dialogue gets written later, world by world.

### Phase 3 · PILOT WORLD (first port)
Bring ONE world over and connect it fully to the spine: battle system, shops from the catalog, space dock in and out, its story beats. Suggestion: GAYA (next in the order). This shows us how long a port takes and what breaks. Fix the process before doing the rest.

### Phase 4 · THE REST OF THE WORLDS, one at a time
Order: Jidda, Kufa, Luxor, Nebo, Ur, Zion, Shasta (old Home), Earth, Kyoto (vision), Deep Space Fox. Each one, in a new chat:
port → connect to the spine → battle → shops + items → story beats → Meru-level polish → phone test (390x844 + 844x390) → "try this" checklist.

### Phase 5 · FINISH MERU + SPACE STORY
Meru's second half and the space map's last 10 % (the MACHINE FLEET story last), now that every world exists to send the player to.

### Phase 6 · WHOLE-GAME PASS
Full playthrough start to finish: prices and gold balance across worlds, difficulty curve, save/load everywhere, phone performance.

## When to bring each world over
- Not all at once. Bring a world here when it is its turn to be PORTED (Phase 3-4), one at a time.
- Until then, keep polishing it in its own chat, but only the MAP: buildings, paths, layout, look. Hold off on shops, items, battles or story there, because those get rebuilt on the spine here.
- Before you bring it: freeze its layout (no more moving buildings), copy its files to `backup/<world>/`, and note what's unfinished.
- First one: bring GAYA once Phase 1 is done.

## CHANGES (every item / creature add or cut, with the session)
- s608: ITEM CATALOG started with 156 items (all Meru + DSF kiosks). No cuts yet: Ben reviews in Item Workshop.
