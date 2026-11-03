# 8 GATES — MINIGAMES MASTER LIST + BUILD RULES

## HOW TO START A NEW CHAT (several games at once)
One game per chat, each chat in its OWN new project with this kit uploaded. Paste this:

> Read CLAUDE.md and MINIGAMES_MASTER.md (this project is a minigame kit). Build minigame #___ (name) for the world of ___. Follow the BUILD RULES and PARALLEL RULES in MINIGAMES_MASTER.md. Use Meru Burgers (restaurant/job) or Skate Park (sport/action) as the reference. Check it at 390x844 and 844x390 with phone-test.html. When finished, give me a zip of ONLY the new files, in repo folders, plus its HANDOFF file.

If a game needs media (music, voices, videos) or its 2D world file, attach only those.

## PARALLEL RULES (other chats are building other games at the same time)
- Only CREATE new files: `<World> <Name>.dc.html`, `<World> <Name> Phone Preview.dc.html`, `minigames/<world>/<name>.js`, and `minigames/<world>/<name>-HANDOFF.md`.
- Do NOT edit any shared file: Game HUD.dc.html, fox-kit.js, engine/*, support.js, _ds/*, vendor/*, presets/*, minigames/index.html, MINIGAMES_MASTER.md, CLAUDE.md. Treat them as read-only.
- If the game needs a change to a shared file, copy the code it needs into the game's own module instead, and list the wished-for shared change in the HANDOFF file.
- Save keys: prefix every save flag/stat with the game key (e.g. `kyotoTea.best`) so games never collide.
- HANDOFF file contents: game number + name, files made, the save keys used, the menu line to add to minigames/index.html, any shared-file change wanted, and the "try this" list. Ben adds the asterisk and menu line when merging.

## BUILD RULES
- MOBILE FIRST: test at 390x844 and 844x390. Touch targets 44px+. Nothing covers a speaker's face. Tap to advance.
- One DC page per game (`<World> <Name>.dc.html`) + one module (`minigames/<world>/<name>.js`). Add `?embed=1` support so a world can open it in a panel (no page chrome, a BACK button posts to the parent).
- Cast: player, Hope, Noble only from `engine/cast.js`. Other foxes from `fox-kit.js`.
- Save: gold, XP, items, flags only through `engine/save.js` (shared save).
- Restaurants/counter jobs: build on `engine/restaurant-kit.js`.
- UI: Modernist design system (Archivo, 2px ink rules, red accent, flush-left labels, no rounded corners). Toon shading + ink outlines in 3D.
- Phone budget: low shadows on phones, small textures, few draw calls.
- Names, NPC lines, prices: take from the 2D world file in `uploads/` when the game exists there; otherwise mark as DRAFT for Ben.
- After building: add a "Phone Preview" DC (like `Skate Park Phone Preview.dc.html`) and write the HANDOFF file (see PARALLEL RULES).

## MASTER LIST (* = built)

BOARD & TILE
1 Chess · 2 Checkers · 3 Backgammon · 4 Dominoes · 5 Japanese Go

CARDS & DICE
6 Shut the Box · 7 Cribbage · 8 Liar's dice · 9 Ship-captain-crew · 10 Three-card monte / shell game

TABLE GAMES
11 Pool / billiards · 12 Air hockey · 13 Ping pong · 14 Foosball · 15 Rod hockey · 16 Table shuffleboard · 17 Crokinole · 18 Carrom · 19 Sjoelen

THROWING & AIMING
*20 Darts · 21 Axe throwing · 22 Cornhole / bags · 23 Washer pitching · 24 Ring toss / hoopla · 25 Quoits · 26 Knife-throwing board · 27 Beer pong · 28 Bachi / bocce · 29 Horseshoes

SHOOTING RANGES
30 Shooting gallery · 31 Duck hunt cabinet · 32 Clay pigeon / skeet · 33 Archery / crossbow range

ARCADE CABINETS
34 Pinball · 35 Skee-ball · 36 Basketball arcade · 37 Whac-A-Mole · 38 Claw crane · 39 Love tester · 40 Dance machine · 41 Pachinko · 42 Coin pusher / penny falls · *43 Defender · *44 Duneglass · *45 Tenpin bowling

CARNIVAL STALLS
46 Coconut shy / tin can alley · 47 Balloon-and-dart pop · 48 Milk bottle knockdown · 49 Duck pond · 50 Water-gun horse race · *51 Fortune teller

STRENGTH & SPECTACLE
52 Punching bag strength tester · 53 High striker · 54 Arm wrestling · 55 Mechanical bull · 56 Climbing wall · 57 Limbo · 58 Eating challenge · 59 Caber toss / stone put · 60 Greased pole climb · 61 Tug of war · 62 Dunk tank

OUTDOOR & LAWN
*63 Fishing · 64 Mini golf / putting green · 65 Croquet · 66 Tetherball · 67 Curling

WORLD AS THE GAME
68 Obstacle / parkour course · 69 Hedge maze

STREET & SCHOOLYARD
70 Marbles · 71 Jacks · 72 Jump rope · 73 Hopscotch · 74 Wall handball / four square · 75 Hoop rolling · 76 Spinning tops · 77 Kendama

DISC & FRISBEE
78 Disc golf · 79 Ultimate · 80 KanJam · 81 Guts frisbee · 82 Freestyle disc tricks · 83 Disc fetch

FOOTBAG & KICK-UP
84 Hacky sack circle · 85 Footbag net · 86 Jianzi · 87 Kemari · 88 Sepak takraw · 89 Keepy-uppy

COURT & NET
90 Volleyball · 91 Badminton · 92 Pickleball · 93 Squash · 94 Basketball · *95 Tennis Open

SPORTS & FIGHTING
*96 Soccer Cup · *97 Ice hockey rink · *98 Boxing · *99 Sumo · *100 Sword duel / kendo · *101 Arena battle

JUGGLING & BALANCE
102 Juggling clubs · 103 Diabolo · 104 Poi · 105 Devil sticks · 106 Plate spinning · 107 Slackline / tightrope

LAWN THROWING & GIANT GAMES
108 Kubb · 109 Mölkky · 110 Ladder toss / bolo · 111 Welly wanging · 112 Giant Jenga · 113 Giant Connect Four

PARTY & FESTIVAL
114 Piñata · 115 Apple bobbing · 116 Egg-and-spoon race · 117 Sack race · 118 Three-legged race · 119 Blind man's buff · 120 Cheese rolling

MOUNTED & ANIMAL
121 Jousting · 122 Tilting at rings · 123 Mounted archery · 124 Falconry · 125 Dog / fox agility course · *126 Dolphin trainer · *127 Camel pen

WATER
128 Log rolling / birling · 129 Rowing / boat race · *130 Swimming race · *131 Diving · 132 Duck race · 133 Water balloon toss · *134 Surf contest · *135 Jetski run · *136 Inner tube run · *137 Submarine school · *138 Deep dive · *139 Pearl dive · *140 Speedboat Bay

WHEELS, MOTORS & FLIGHT
*141 Skate park · *142 Bike park · *143 Moto run · *144 Monster truck crush · *145 Tank Range · 146 Glider · 147 Speedway race

DIGGING
*148 Gold panning · *149 Pyramid dig

CASINO FLOOR
*150 Roulette · *151 Craps · 152 Bingo · 153 Keno · 154 Sic bo / chuck-a-luck · 155 Baccarat · *156 Blackjack · *157 Five-card poker · *158 Texas hold'em · *159 Fox slot machine · *160 Slots, 1-line · *161 Slots, 3-line · *162 Prize wheel

RESTAURANTS
*163 Meru Burgers · *164 Meru diner · *165 Breakfast All Day Diner · *166 Luxor Deli · *167 Jidda Smoothie · *168 Zion bakery · *169 Ur Espresso · *170 Ur Grounds · *171 Foxy Maki · *172 Foxy Pies · *173 Foxy Cakes · *174 Foxy Gyoza · *175 FOX Gelato · *176 Foxy Ramen · *177 Ember's Skewer House · *178 Kufa Creamery · *179 Nebo Candy Shop · *180 Fox Cinema snack counter

SHOPS & JOBS
*181 Hope's Class · *182 Meru School for the Blind · *183 Spyshop of Kufa · *184 Rafiq's Spy Shop · *185 Felt's Ball Works · *186 Ur Lab technician · *187 Nebo Lumber Mill · *188 Bex's Truck Shop · *189 Bram's Ski Works · *190 Clubhouse 8 · *191 Goldsmith of Zion · *192 Bramble's Comics · *193 Jib's Surf Shop · *194 Nebo Pet Store · *195 Tread's Tank Works · *196 Gaya Candle Works · *197 Jon's Boatworks

STORY & STAGE
*198 Kyoto Theatre

FROM THE 2D GAME
199 Hill Run · 200 Truck Road · 201 Blackout · 202 Gauntlet · 203 Gang Yard · 204 Street Race · 205 Sparring · *206 Lock picking · 207 Glyph Lock · 208 Treasure dig · 209 Lookout telescope · 210 Drone board · 211 Detective case · 212 Skimmer · 213 Boat rental · 214 Nature Dance · 215 Noh Stage · 216 Dream room · 217 The Assay · 218 Pizza · 219 Housekeeping · 220 Slalom · 221 Docking · 222 Cargo scan · 223 Daba · 224 Bone set · 225 Foxy Tailors · 226 Fitting room · 227 Shrine candles · 228 Conduit deck · 229 Space flight / wreck salvage

NEW JOB IDEAS
230 Taxi driver shifts (Meru) · 231 Train conductor (Meru) · 232 Bank teller (Meru) · 233 Crystal mine cart (Gaya) · 234 Church bell ringer (Gaya) · 235 Tea ceremony (Kyoto) · 236 Water taxi pilot (Jidda) · 237 Fish market auction (Jidda) · 238 Lighthouse keeper (Jidda) · 239 Caravan packer (Kufa) · 240 Well tally keeper (Kufa) · 241 Bike pit crew (Luxor) · 242 Basalt forge / blacksmith (Luxor) · 243 Lantern lighter (Nebo) · 244 Beekeeper (Nebo) · 245 Mushroom forager (Nebo) · 246 Tablet scribe (Ur) · 247 Brick kiln (Ur) · 248 College archivist (Ur) · 249 Monster truck pit crew (Zion) · 250 Stagecoach / mail run (Zion) · 251 Paper route (Home) · 252 Casino dealer (Earth) · 253 Valet parking (Earth) · 254 Film lot stunt double (Earth) · 255 Holosuite technician (Station) · 256 Hydroponics garden (Station) · 257 Quirk's bar shift (Station)
