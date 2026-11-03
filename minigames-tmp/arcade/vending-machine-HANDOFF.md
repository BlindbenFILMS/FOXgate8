# HANDOFF — Snack Stop vending machine (Arcade · any world)

Game key: `arcadeVend` · room name `[arcadeVend]`
Not on the master list yet: suggest adding it under SHOPS & JOBS or CARNIVAL STALLS as **Snack Stop vending machine** (Ben picks the number).
Reference used: Meru Burgers (page + module, own panels, no Game HUD). Built in the same style as Claw Crane (#38).
Checked at 390x844 and 844x390.

## What it is
A vending machine that drops into any building. The player picks a snack with the buttons (or by tapping a snack through the glass, or A–E / 1–5 on a keyboard) and pays in gold. The coin goes in, the spiral turns, the snack tips off the shelf and drops into the tray. Then the fox (Ben, Hope or Noble from `engine/cast.js`) walks up, pushes the flap, reaches in, stands up and holds the snack over its head. The snack goes into the bag.

- **Snacks (5):** HEALTH BAR 4g (+25 HEALTH) · ENERGY DRINK 5g (+40 ENERGY) · CHOCOLATE BAR 3g (+10 HEALTH, happy) · APPLE 2g (+15 HEALTH) · CHIPS 3g (+10 HEALTH). 8 of each in the machine (2 spirals × 4), labelled A1–E2 on the shelf tags.
- **Free sample:** the first snack ever is free.
- **Stuck snack (7%):** it hangs on the spiral. Tap SHAKE IT! and the machine rocks. It always falls by the third shake.
- **Bonus snack (6%):** the spiral turns twice and two snacks drop. The fox carries one in each hand.
- **EAT / DRINK IT NOW:** the fox takes 3 bites (or 3 gulps), the snack shrinks away, then a "YUM!" (or a small burp after the drink). Eating takes the snack out of the bag.
- **Demo:** the DEMO button (or `?demo=1`) buys, picks up and keeps snacks on its own. Demo snacks are free and are not saved.
- **Machine details:** a lit header, an LED display that shows the code, price and messages, A–E buttons that blink for the picked snack, a coin slot, a GOLD ONLY label, price tags on every shelf, a lit interior, a glass shine that drifts, a translucent push flap and a glow in the tray when a snack lands.
- **Room:** tiled floor, a painted wall with a rail, a SNACKS neon sign, a bench, a plant and a drinks cooler.
- **Sound:** an easy-listening shop tune; coin clink; button beeps; the spiral motor hum; a different landing sound per snack (the can clanks, the apple thuds, the chips crinkle); the flap; footsteps; a "got it" jingle; the bonus jingle; the shake rattle; crunch, chew and glug when eating; a can opening; a little burp; quiet fridge hum. SFX and MUSIC buttons on the top bar.

## Files made (new only)
- `Arcade Vending Machine.dc.html` — the page
- `Arcade Vending Machine Phone Preview.dc.html` — portrait + landscape preview
- `minigames/arcade/vending-machine.js` — the game module
- `minigames/arcade/vending-machine-HANDOFF.md` — this file

Imports only kit files: `vendor/three/three.module.js`, `fox-kit.js`, `engine/cast.js`, `engine/textures.js`, `engine/save.js`. The helpers and the synth engine are copies from `minigames/arcade/claw-crane.js`, so the two games don't depend on each other.

## Save keys used (all through engine/save.js)
- Items: `arcadeVend.healthBar` · `arcadeVend.energyDrink` · `arcadeVend.chocolateBar` · `arcadeVend.apple` · `arcadeVend.chips`
- Stats: `arcadeVend.bought` · `arcadeVend.fox` · `arcadeVend.sound` · `arcadeVend.music`
- Flags: `arcadeVend.sample` (the free sample is used)
- Also: `save.spend()` for the price, `save.addXp(1)` per purchase, `save.take()` when you eat one.

## Menu line to add (minigames/index.html)
```html
<li><a href="../Arcade%20Vending%20Machine.dc.html">Snack Stop · Vending Machine</a></li>
```

## Opening it from a world
- Panel: `Arcade Vending Machine.dc.html?embed=1`. A BACK button on the top bar posts `{ type: '8gates:minigame', action: 'back', game: 'arcadeVend' }` to the parent (same message as Claw Crane).
- `?sign=LUXOR%20SNACKS` changes the neon sign on the wall. `?demo=1` starts the demo.

## Shared-file changes wanted (NOT made)
1. **Item effects:** the module exports `ITEM_EFFECTS` (`'+25 HEALTH'`, `'+40 ENERGY'`, …). The world's item wheel needs to apply them when a snack is used from the bag. Suggested numbers: health bar +25 HP, energy drink +40 energy, chocolate +10 HP, apple +15 HP, chips +10 HP.
2. **Item labels:** add the exported `ITEM_LABELS` to the shared item-label list so the HUD shows "HEALTH BAR" instead of the id.
3. **Embed BACK listener** (same as Claw Crane).
4. **Shared arcade helpers:** Claw Crane and Snack Stop both carry the same helpers + synth. A shared `engine/arcade-kit.js` would remove the copies.

## DRAFT for Ben
- Prices and effects above, the free sample, stuck 7%, bonus 6%, 8 of each snack per visit (stock refills when the page opens; RESTOCK button when everything is sold out).

## Phone budget
- Each snack is one merged mesh. Static parts of the machine and the room are baked into one mesh per material. About 95 draw calls on the pick screen.

## Try this
1. Open `Arcade Vending Machine Phone Preview.dc.html` and check both phone sizes.
2. Tap CHIPS, then FREE SAMPLE. Watch the coin, the spiral, the drop, and the fox picking it up.
3. Tap a snack through the glass to pick it. Tap the A–E buttons on the tiles.
4. Buy until you are out of gold: the BUY button says NOT ENOUGH GOLD.
5. Buy a lot until one gets STUCK, then SHAKE IT!
6. EAT IT NOW on the apple (crunch) and DRINK IT NOW on the energy drink (glug + burp).
7. Switch the fox to HOPE and NOBLE and buy again.
8. Buy all 8 of something: it says SOLD OUT.
9. Turn the DEMO on and let it run.
