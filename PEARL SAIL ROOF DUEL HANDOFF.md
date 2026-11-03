# PEARL SAIL · ROOF DUEL — build handoff (for a NEW chat)

Start the new chat with exactly:
**"continue BUILD_PLAN.md: build the Pearl Sail ROOF DUEL from PEARL SAIL ROOF DUEL HANDOFF.md"**

Read this whole file first, then the files in §3. Before writing any code, ask Ben the open questions in §9 in ONE ask_user form. Ben's opening asks are settled (§1); don't re-ask them.

---

## 1. What Ben asked for (s35, verbatim intent)
- Take the **Kyoto Sword Duel** (our Street-Fighter-style side-on samurai duel) and make it the **FINALE of the Pearl Sail 3D tower**.
- Add **our fox characters** as playable duelists: **PLAYER MALE (Ben)**, **NOBLE**, **HOPE**.
- Add **the current boss** (the Pearl Sail roof boss = **SUDS-9, the rogue window-cleaning robot**) as the duel opponent.
- Setting: the **Pearl Sail ROOF**, **looking down on Meru**.
- Flow: Pearl Sail 3D Floor → climb the atrium (floors 3–5) → ROOF door → **duel SUDS-9** → win → cleared card / Pearl of the Sail relic.

## 2. Where things stand right now
- **s35z13: THE ROOF now exists as a walkable 4th map** (FLOORS3D[3], art 'roof', `?floor=4`): stair hut, lookout with a BINOCULAR KIOSK over Meru (buildMeru: landmarks + labels), SUDS-9 on his gondola off the east edge, and a gold **DUEL SPOT** at (16, −4). **UPDATE s35z14:** the duel spot is gone. Now: drone ambush → a 3D SUDS-9 boss fight on the roof → when EITHER fighter is down to 75 % he says *"Robots too honor the law of the duel, and I challenge you to a traditional duel."* → ACCEPT → `api.acceptDuel()` sets state 'duel' and `Pearl Sail 3D Floor.dc.html` opens a full-screen panel (`duelOn`) that currently iframes `Kyoto Sword Duel.dc.html?embed=1` as a STAND-IN, with FINISH › = `api.finishDuel()` → cleared card. **Hook the real duel there**: point the iframe at the fox-vs-SUDS-9 duel (`?pearl=1&embed=1&fox=…`), carry over HP if wanted (both start the duel at 75 %?: ask Ben), and replace FINISH with the duel's postMessage result (§8), and reuse `buildMeru()`'s landmark layout for the duel stage backdrop (§7) so both views match.
- `Pearl Sail 3D Floor.dc.html` + `worlds/pearl-floor3d.js`: 3 maps (FLOORS3D[0] OPEN OFFICE, [1] SERVER ROOM, [2] ATRIUM · FLOORS 3–5). The atrium's exit is the **ROOF door** (east wall, y 10.8). Going through the last floor's exit currently calls `win()`, which shows the cleared card (reputation, damages bill, etc.). `?floor=3` starts on the atrium (the start card also has "Start on floor 1/2/3" rows).
- `Kyoto Sword Duel.dc.html` + `minigames/kyoto/sword-duel.js` (`createDuel({ container, onState, opts })`): working duel with roster, ladder, story mode, online 1v1, practice, 4 stages (`STAGES = ['yard','roof','bamboo','castle']`), boss mode (RED GENERAL), `?back=<url>` shows a BACK link, `?demo=1`, `?room=XXXX`.
- SUDS-9 exists ONLY in the side-on tower: `worlds/pearl-sail.js` "BOSS: SUDS-9" section (≈ lines 242–275). It isn't in 3D yet.

## 3. Files the new chat must read (read, don't copy unless noted)
| File | Why |
|---|---|
| `BUILD_PLAN.md` → sections **KYOTO SWORD DUEL v1 … v3 / ROSTER / LADDER / STORY** and **PEARL SAIL TOWER / 3D FLOOR / s35…** | Everything already decided for both games |
| `minigames/kyoto/sword-duel.js` | The duel engine. Key spots: `MV` move table (top), `mkF(cfg, side)` (fighter record, ~line 92), `YOU` + `ROSTER` + `oppBody()` + `setRoster()` (~93–106), `STG.*` stage builders + `STAGES` / `LADST` (~30–82), `poseOf(f)` (poses, ~325), `start()` / `toRound()` / `oppHp()` (~156–159), result handling (`S.done`, ~426–430), boss handling (`opp.boss`) |
| `Kyoto Sword Duel.dc.html` | Welcome / select / ladder UI, Game HUD mount, `back=` param, how `opts` are passed (line ~230) |
| `engine/human-kit.js` | How duel fighters are built + posed: `make(cfg)`, `restPose(g)`, `update(g, pose, dt)`; poses are **IK targets in root space** (hands `hL/hR`, feet `fL/fR`, knees `kL/kR`, `hip`, `lean`, `twist`, `side`, `yaw`, `pitch`, `mood`); the character faces +z, its left is +x |
| `fox-kit.js` | Foxes: `makeFox(cfg)` → group with `userData.P` = `{ body, head, arms[0..1], legs[0..1], sword, gun, … }` (simple rotation groups, NOT IK), `animFox(fox, dt, speed, air)` (walk cycle, moods, tail, ears) |
| `engine/cast.js` | **THE CAST, single source of truth**: `CAST.player / hope / noble`, `castKit({THREE,M,toon,makeFox}, rigs).make('player'|'hope'|'noble')`, `loadCastRigs()` (cane + chair). Never redefine the cast |
| `engine/cane.js`, `presets/cane.json`, `Cane Workshop.dc.html` | Hope's long cane rig + CANE SWING + pulse |
| `engine/chair.js`, `presets/chair.json`, `Noble Workshop.dc.html` | Noble's futuristic chair + the **shoemerang** (off his right boot, `NOBLE_SHOE_FOOT = 0`) |
| `worlds/pearl-sail.js` (SUDS-9 section) | SUDS-9 look + attacks + phases (see §6) |
| `worlds/pearl-floor3d.js` → `nextFloor()`, `win()`, `St.won`, `emit()` | Where to hand off to the duel |
| `Game HUD.dc.html` | Shared HUD; the duel already mounts it (vehicle/duel contract). Don't rebuild HUD buttons |
| `CLAUDE.md` | Project rules (mobile first, cast, HUD, backups) |

Backups before touching anything: copy `minigames/kyoto/sword-duel.js` → `backup/kyoto/sword-duel pre-foxes.js`, `Kyoto Sword Duel.dc.html` → `backup/kyoto/Kyoto Sword Duel pre-foxes.dc.html`, `worlds/pearl-floor3d.js` → `backup/pearl-sail/pearl-floor3d.pre-duel.js`, `Pearl Sail 3D Floor.dc.html` → `backup/pearl-sail/Pearl Sail 3D Floor.pre-duel.dc.html`.

## 4. Architecture (recommended)
Keep ONE duel engine. Don't fork the duel into a second file; Kyoto must keep working exactly as now.

1. **`opts.pearl`** (new) on `createDuel`: `{ you: 'ben'|'noble'|'hope', opp: 'suds9', stage: 'pearlRoof', finale: true }`. When set: skip ladder/story/online, open on a **fox select** (3 foxes), fight SUDS-9 on the Pearl roof, then report the result.
2. **URL**: `Kyoto Sword Duel.dc.html?pearl=1&fox=ben&embed=1&back=…` → the DC reads it and passes `opts.pearl`. (Optionally a thin wrapper page `Pearl Sail Roof Duel.dc.html` that just mounts the duel with those opts; this is cleaner for Ben's links.)
3. **Fox fighters** live in a new helper **`minigames/kyoto/duel-foxes.js`**: `makeFoxFighter(ctx, key)` builds the fox with `castKit().make(key)` and returns an object with the SAME fields `mkF()` returns (`g, U, L, k, R0, P, sw, side, x, y, vx, hp, …`) plus `fox: true`. The engine treats it like any fighter.
4. **Pose adapter** (the core job): the duel produces human IK poses (`poseOf(f)` → `{hL, hR, fL, fR, kL, kR, hip, lean, twist, …}`). For a fox, write `foxPose(fox, pose, dt)` that turns those targets into rotations:
   - arm group `P.arms[i]` (shoulder at local `(±0.42·s, 1.12+lift, 0)`, length ≈ 0.55 × 1.25 scale) → aim the arm's −Y axis at the hand target (`quaternion.setFromUnitVectors(down, dir)`), clamp to reach;
   - legs `P.legs[i]` (hip at `(±0.14, 0.5+lift, 0)`) → swing (rotation.x) from foot z/y, lift from knee;
   - `hip` → `fox.position.y` offset, `lean` → `P.body.rotation.x`, `twist` → `P.body.rotation.y`, `yaw/pitch` → `P.head`;
   - mood → `fox.userData.mood` (fox-kit faces have moods);
   - still call `kit.animFox(fox, dt, speed)` for tail/ears/blink, then override arms/legs.
   - Scale: humans are 1.75 m with `L.H`; foxes are ~1.9 m. Set `f.L` to a fake "human L" whose numbers (hipY, shW, uaL, faL, footH, torsoL, H) match the fox so `poseOf` targets land on fox joints. Put that fake L in `duel-foxes.js`.
5. **Hitboxes / reach** come from `MV` + fighter `x`; foxes reuse them (same 2.5D lane). Check `reach` values against the fox's arm length + weapon.
6. **SUDS-9** = a ROSTER entry with `robot: true` (see §6) built by a new `makeSuds9(ctx)` in `duel-foxes.js` (or `duel-suds9.js`). It has its own small brain (phases), like the ninjas have `fav` moves.
7. **New stage `STG.pearlRoof`** built like `STG.roof` (§7); add to `STAGES` only when `opts.pearl` (keep the Kyoto stage list unchanged otherwise).
8. **Result**: on the duel's done state, if `opts.pearl`:
   - win → `save.setFlag('pearlSuds9Beaten')`, `save.addRelic('pearlOfTheSail')`, +XP / gold (ask Ben), then `parent.postMessage({ type: '8gates:pearl-duel', won: true, hp, time }, '*')` when embedded, else go to `back=`;
   - lose → retry button (same fox / switch fox) + "back to the atrium".

## 5. The three foxes as duelists (proposal; confirm with Ben)
All three use `castKit().make(...)`. Never restyle the cast. All are side-on and fight in the same lane as the humans.

| Fox | Look (from cast.js) | Weapon / move set (maps to the duel's 1 HIGH · 2 MID · 3 LOW + supers) |
|---|---|---|
| **BEN (player)** | PLAYER_MALE orange, 8 armour, sword + laser gun (`gear: 'both'`) | Closest to BEN · SWORD: the fox sword (`P.sword`) as the katana. HIGH overhead, MID thrust, LOW cut, ISSEN + parry as the samurai. **Super:** LASER (the gun arm, `P.gun`): a 3-bolt shot across the lane (like the ninja kunai projectile, `shots[]`). Bolts leave from the gun tip (same rule as the 3D tower) |
| **NOBLE** | 8 armour, red eyes, blue legs, **futuristic chair** (hover chair rig) | Fights FROM THE CHAIR: glides instead of walking (no jump; a chair HOP instead), HIGH = chair ram, MID = arm punch, LOW = sweep with the chair skid. **Special:** **SHOEMERANG** (right boot flies out and comes back, hits on the way out AND back; guardable). Use `chair.js` hover bob |
| **HOPE** | HOPE_LOOK, white bow, sunglasses, blue legs, **long cane** | Long reach, lower damage: CANE SWING (Cane Workshop motion) for HIGH, cane POKE for MID, cane HOOK at the ankles for LOW (trips = knockdown). **Special:** CANE PULSE (the cane's glow pulse) as a short-range shockwave that pushes the foe back. The bow could be a super: one charged arrow |

Stats: start from BEN · SWORD (160 HP vs the boss). Suggest BEN balanced, NOBLE tanky + slow, HOPE long reach + quick + lower HP.

## 6. SUDS-9 · THE WINDOW CLEANER (boss) — from `worlds/pearl-sail.js`
Look (side-on version): a boxy white body (1.5 × 1.6 × 1.0) with a red band, a glass **dome head** with a glowing red eye bar, a blue **soap tank** on its back, a long **pole arm** ending in a big **squeegee blade** (dark + yellow edge), riding a **window-cleaning gondola** (grey platform, rails, yellow-black skirt) on two **cables**.
Attacks in the tower:
- **SPRAY**: lobs 3–5 soap **bubbles** (shootable) at the player.
- **SWEEP**: docks the gondola, red floor strip = **JUMP** over the low squeegee; phase 3 adds a yellow **HIGH sweep** = **STAY DOWN** (crouch).
- **DOCKED 2.3 s** after a sweep = **WEAK POINT** (full damage; otherwise melee ×0.6, laser ×0.4).
- **MINIONS**: drops up to 2 drones.
- HP 900, phases at 60 % / 30 %.

**Duel version (proposal):**
- Make him a big robot standing in the lane (match the new 3D bots: **dark grey** body #4a4e55, **box head with angry eyes pulsing deep red → red**, like `worlds/pearl-bots.js`), keep the **squeegee arm**, **soap tank** and **gondola** (gondola hangs behind the roof edge; he steps off it to fight and steps back on to "dock").
- Map to duel rules: squeegee **LOW sweep** (guard low or JUMP), squeegee **HIGH sweep** (guard high or CROUCH), **SPRAY** = projectile volley (guardable, can be slashed), **soap puddle** on the floor (slide, like the 3D spills), **DOCK** = after a big combo he leans on the gondola rail, dazed = WEAK POINT window (duel `daze`).
- Phases at 60 / 30 %: faster sweeps, double sweeps (low then high), more spray.
- Can't be disarmed (like RED GENERAL), less knockback, boss intro line + call.
- HP: start at RED GENERAL scale (230 Easy / 260 Normal), not 900 (that number was for the side-on tower's damage scale).

## 7. Stage: PEARL ROOF, looking down on Meru (`STG.pearlRoof`)
- Flat white roof deck with a red edge line and yellow-black safety stripes, a roof parapet, HVAC boxes, a helipad "H", the **PEARL SAIL** logo / sail mast, the gondola davit + cables at one end.
- **Looking down on Meru**: the camera is side-on, so put the city BELOW and BEHIND the roof: the roof edge cuts close behind the fighters, and the backdrop is Meru far below. Use low-detail boxes (Meru 2 city colours) at y −30…−80, the Pearl Quarter river/sea, lit windows at dusk, a few landmark silhouettes (look at `Meru 2 Blockout.dc.html` / `worlds/meru2-city.js` for the landmark list + colours; don't load the whole city, make a cheap backdrop). Keep it phone-light.
- Sky: golden hour or dusk (ask Ben); wind (flags, the gondola sways), maybe light soap mist.

## 8. Hook-up in the 3D tower (`worlds/pearl-floor3d.js` + `Pearl Sail 3D Floor.dc.html`)
- In `nextFloor()`, when `FI` is the last floor, don't call `win()` right away: set `St.state = 'duel'`, show a banner "THE ROOF · SUDS-9", fade out, then the DC opens the duel in a full-screen **panel iframe** (like the Meru casino minigames): `Kyoto Sword Duel.dc.html?pearl=1&embed=1&fox=<picked or ben>`.
- The DC listens for `message` `{ type: '8gates:pearl-duel', won }` → closes the panel → `api.finishDuel(won)`: win → `win()` (cleared card gets a new row **ROOF BOSS · SUDS-9 · BEATEN** + the relic); loss → back at the ROOF door with a RETRY prompt.
- Keep `?floor=3` working; add `?duel=1` to jump straight to the duel for testing.
- Shared SAVE: gold / XP / relic go through `engine/save.js` (the iframe and the tower share localStorage; `save.reload()` after the panel closes).

## 9. Questions for Ben (ask in ONE ask_user form, with defaults)
1. Can the player PICK the fox before the duel (Ben / Noble / Hope), or is it always Ben? *(default: pick, Ben first)*
2. Do Noble + Hope fight with their own weapons (chair + shoemerang / cane), or all with swords? *(default: own weapons, §5)*
3. SUDS-9 look in the duel: keep the white side-on robot, or match the new dark-grey angry-eyed bots? *(default: dark grey to match)*
4. Duel length: best of 3 rounds like Kyoto, or one long boss fight with phases? *(default: one fight, 3 phases, no timer)*
5. Time of day on the roof: sunset / dusk with city lights / night. *(default: sunset)*
6. Reward: gold + XP amounts, and the PEARL OF THE SAIL relic? *(default: 200 gold, 300 XP, relic)*
7. On a loss: retry right away, or back down to floor 5? *(default: retry)*
8. Should the 3 foxes also appear in the normal Kyoto Sword Duel roster (YOU list)? *(default: yes, after the Pearl duel works)*
9. Any special finishing move / cut-in when SUDS-9 falls (e.g. he tumbles off the roof toward Meru)? *(default: yes, falls off with the gondola)*

## 10. Build order (one chat if it fits, otherwise stop after step 4 and leave notes)
1. Backups (§3). Read the files.
2. `duel-foxes.js`: fake human-L for foxes + `makeFoxFighter` + `foxPose` adapter. Test in the duel with **BEN fox vs THE SECOND** in the yard first (no new boss yet). Get idle, walk, guard, HIGH/MID/LOW, hit-react, knockdown, win/lose poses right.
3. Hope + Noble fighters (weapons, special moves).
4. SUDS-9 model + brain + boss call + phases.
5. `STG.pearlRoof` backdrop.
6. `opts.pearl` flow + fox select + result postMessage.
7. Hook into `Pearl Sail 3D Floor` (§8) + cleared-card row.
8. Phone check **390 × 844 and 844 × 390** (HUD buttons, fox select readable, camera frames both fighters + SUDS-9, 44 px targets), desktop check, `?demo=1` style autopilot if cheap.
9. Update `BUILD_PLAN.md` (finished / partial / not started) + a TRY THIS checklist. Add the workshop/duel note to `CLAUDE.md` if new rules came up.

## 11. Rules to keep (from CLAUDE.md)
- Mobile first; Game HUD is shared (don't rebuild buttons in the duel); phone buttons = press fires once.
- The cast comes only from `engine/cast.js`.
- Keep Kyoto Sword Duel working unchanged when `opts.pearl` is not set (roster, ladder, story, online, practice).
- Modernist UI (Archivo, 2 px rules, red accent, no rounded corners) for any new cards.
- Phone budget: no new shadows on phones, low-poly backdrop.
