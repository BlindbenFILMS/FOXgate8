# Multiplayer reference (from Ben, Blind Canvas 3D gallery)

## ONLINE ROLL-OUT (Ben's answers, decided — do not re-ask)
- Shared code: engine/duel-net.js (built for the Kyoto Sword Duel; reuse it, add a game name). Lobby = the duel's Online card (CREATE ROOM / CODE + JOIN / share link / READY / 3-2-1). Friends only, no quick match.
- Order: 1 SKATING (Skate Park, minigames/skate/skate-park.js on vehicle-lab.js) → Tennis → Surf → Tank → Sumo. Ben also wants a MONSTER TRUCK multiplayer game (Zion Monster Arena, minigames/zion/truck-arena.js) — add it to the queue.
- SKATING: up to 4 players per room · BOTH modes: TRICK-SCORE RACE (same park, 60 s, highest score wins) and LAP RACE (first to finish 3 laps) · FULL KNOCKDOWNS: ramming a skater knocks them down; a knockdown STEALS a chunk of their trick points (attacker gains them).
- Names: 2 players = YOU / RIVAL; 3–4 players = colour names RED / BLUE / GOLD / GREEN (fur/board tint to match).
- Rewards: SPECIAL ONLINE-ONLY OUTFITS (not gold/XP): GOLD SKATE ARMOUR · CHAMPION SCARF · RANK BADGES (bronze / silver / gold by online wins).
- SKATING: BUILT (see BUILD_PLAN.md · ONLINE SKATING). Next: Tennis.
- Netcode plan for skating: each phone simulates its own skater (instant feel), sends [x, y, z, yaw, pose/trick id, board state, score] 15/s; others render ghosts with smoothing. Host (lowest id) owns the clock, start seed, knockdown verdicts (victim confirms hit from its own position), scores and results. Mesh is fine for 4.


No server. Trystero (Nostr strategy) for matchmaking over public Nostr relays, then direct WebRTC peer-to-peer.

Files to copy from `8GATES-SITE/3D/` (NOT in this project yet, Ben to attach):
- `vendor/trystero-nostr.js`: Trystero 0.25, Nostr strategy, bundled
- `engine/gallery-net.js`: ~60-line wrapper `connectGallery({...})`
- `gallery.html`: reference wiring (search "connectGallery" and "setInterval(() => { const st = G.localState()")

gallery-net.js:
- `joinRoom({ appId }, roomName)`; room = prefix + (?room=… or 'lobby'); private room = a link.
- Actions: `hi` profile (on join, to newcomers, on change) · `st` tiny state array, 10/s only on change + 1 s heartbeat · `em` emotes · `ev` events, to everyone or one peer.
- Media streams (mic, camera, screen share) on the same connection.
- Callbacks: onJoin, onLeave, onState, onEmote, onEvent, onStream, onStatus('online'|'offline'|'local'|'off').
- Test: `?net=local` = BroadcastChannel (2 tabs = 2 players); `?net=off` = single player.

Patterns:
- Remote state is a target; damp toward it every frame.
- 25 s silent → removed; pagehide → leave().
- New state fields go on the END of the array (old clients ignore them).
- Shared things = ev messages applied locally. Agreement without messages = clock (Date.now()).
- Persistent things (notes, guest book) = signed Nostr events kind 4251, admin approval.

For FOX GATE 8 minigames:
1. appId '8gates-minigames', room 'fg8-' + gameName + '-' + roomCode.
2. Lobby: 4-letter code or ?room=ABCD share link; show who's in from onJoin/hi.
3. HOST = lowest peer id (next lowest if they leave). Host owns score, timer, outcomes; others send inputs/own position only.
4. Shared seed from host at start ({k:'start', seed, t0}).
5. Start together: t0 = Date.now() + 3000, 3-2-1 countdown.
6. Fast games: position 10–15/s + interpolate. Turn-based: ev only.
7. Tiny messages. Test ?net=local in 2–4 tabs, then two real phones.
Limits: full mesh, best 2–8 players. Some strict networks block WebRTC (TURN server later). No anti-cheat beyond host authority.
Mobile first: 390x844 and 844x390, 44px+ targets, joystick left / buttons right.
