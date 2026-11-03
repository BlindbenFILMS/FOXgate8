# MERU 3D — REBUILD NOTES FROM THE SOUND SIDE (Ben's sound chat, verbatim summary of the rules)

These numbers are measured, not stylistic. They override the guesses in MERU_2_PLAN.md section 2.

## Spacing
- Greeting trigger: **7 m outdoors**, **5.5 m indoors**. Greeting 1.2–3.6 s (3–9 words). Player ~4 m/s. Only one greeting plays at a time.
- Speaking foxes: **≥ 16 m apart outdoors (20 m preferred)**, **≥ 12 m indoors**. Dense market = stalls can be close, talkers must not.
- A row of 8 stalls: stall structures 6 m apart, only **3 have a speaking fox**, the rest are set dressing with a sign.

## Rooms
- Two sizes only: **small ≤ 12 m across** (shops, offices, booths; 1–2 speakers, dry) or **halls ≥ 20 m** (throne room, cave, drill hall; places the player stops). Avoid the 13–19 m middle.
- Every room's rectangle in ONE table: centre, width, depth, key (sound is gated on which room you and the speaker are in).
- Everything ships dry; reverb is added per room by ear. Name any room that needs reverb up front.

## Doors
- Interior music/atmosphere leaks out of the door: audible from 11 m, half at 6.8 m, 55% at the threshold, lowpassed.
- **Doors on the same street face ≥ 22 m apart.** Better: put neighbours' doors on different faces.
- Each door has one outward point ~1.4 m into the street.

## Ground (6 footstep surfaces)
stone (paved square, castle path) · wood (lanes, tavern, shops) · rug (casino, seer's tent) · sand (desert, lake shore) · grit (ruins path) · grass (verges, open ground).
Routes should cross surfaces; don't pave everything. The audio needs a paved-area map + a floor type per room.

## Zones + music
- Crossfade 2.8 s. **Zones ≥ 30 m deep** along the path. Boundaries at gates, bridges, rises, turns — never mid-run. A corridor between two zones gets its own track.
- Busy voice zones are flagged so their music level is trimmed (casino music is at 45%).

## Who speaks (82 cast parts today, keys pinned)
1. **Talker**: name, greeting, 4–6 line conversation, 16 m clear. Max 20–25 per zone.
2. **Greeter**: one line as you pass, 16 m clear. Doormen, guards, stallholders.
3. **Crowd**: no voice (ambient chatter), can stand shoulder to shoulder. Most market people.
Per speaking fox: stable `key`, position per spacing, room or outdoors.

## Dialogue shape (settled; Ben writes all lines)
NPCs make statements, never questions · go-forward choice first, Goodbye last · 20–40 words per NPC line · greetings 3–9 words · CAPS printed not spoken (voice gets Title Case) · never end a sentence on a name with a question mark.

## Lessons from the old build
1. Arena path → **three clearings joined by 40 m quiet stretches**.
2. Square was one stone floor with six doors → **two or three linked spaces**, loud rooms on different faces.
3. Interiors sized for the ear: 12 m or 20 m+.
4. Listener sits on the player; keep the camera follow distance stable in conversations.
5. Give the player ground worth hearing.

## Checklist (every layout)
- [ ] no two speaking foxes within 16 m outdoors, 12 m indoors
- [ ] no two doors within 22 m on the same street face
- [ ] every room ≤ 12 m or ≥ 20 m across
- [ ] every zone ≥ 30 m deep along the path
- [ ] zone boundaries at gates, bridges or turns
- [ ] ≥ 3 surface changes on any route walked twice
- [ ] every speaking fox is tier 1 or 2 with a key; everyone else is crowd
- [ ] busiest voice zones flagged for music trim
- [ ] rooms that need reverb named up front
