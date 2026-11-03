// MERU 2.0 — DUETS (s150, Ben: "get these foxes talking ... LOTS of lines ... the DUETS"). Foxes who talk to each other, not to you.
// GROUPS: who stands where (fox keys in the walk, first one found wins), which census scenes (meru_voice/meru_voice.json, voiced) and which
// NEW scenes (below, written s150, not recorded yet) they rotate through. Row ids = scene + '-' + two digits (01, 02 …), the same as the census.
// Voice files: MERU/vo/<id>.mp3 (the census pack). A missing file = caption only, timed to the text.
export const GROUPS = [
  // s181 CAFE DUETS (Ben s173 picks, names by Claude s181): seated all day at the TAVERN DECK tables (red umbrellas)
  { id: 'cafeOld', foxes: { 'MABEL': ['cafeMabel'], 'HERBERT': ['cafeHerbert'] }, spawn: { "MABEL": { cafe: [0, 0], spec: { key: 'cafeMabel', name: "Mabel", outfit: 'dress', female: true, torso: '#c084fc', crest: '8', mood: 'warm' } }, "HERBERT": { cafe: [0, 1], spec: { key: 'cafeHerbert', name: "Herbert", outfit: 'coat', torso: '#64748b', crest: '8', mood: 'warm' } } }, census: [], scenes: ['nx-cafe-old-a', 'nx-cafe-old-b'] },
  { id: 'cafeDate', foxes: { 'ROWAN': ['cafeRowan'], 'WREN': ['cafeWren'] }, spawn: { "ROWAN": { cafe: [1, 0], spec: { key: 'cafeRowan', name: "Rowan", outfit: 'suit', torso: '#2563eb', crest: '8', mood: 'happy' } }, "WREN": { cafe: [1, 1], spec: { key: 'cafeWren', name: "Wren", outfit: 'dress', female: true, torso: '#f472b6', crest: '8', mood: 'happy' } } }, census: [], scenes: ['nx-cafe-date-a', 'nx-cafe-date-b'] },
  { id: 'cafeGossip', foxes: { 'DOT': ['cafeDot'], 'MARGO': ['cafeMargo'] }, spawn: { "DOT": { cafe: [2, 0], spec: { key: 'cafeDot', name: "Dot", outfit: 'dress', female: true, torso: '#f59e0b', crest: '8', mood: 'excited' } }, "MARGO": { cafe: [2, 1], spec: { key: 'cafeMargo', name: "Margo", outfit: 'coat', female: true, torso: '#14b8a6', crest: '8', mood: 'happy' } } }, census: [], scenes: ['nx-cafe-gossip-a', 'nx-cafe-gossip-b'] },
  { id: 'cafeDice', foxes: { 'LUCKY LOU': ['cafeLou'], 'SLIM': ['cafeSlim'] }, spawn: { "LUCKY LOU": { cafe: [3, 0], spec: { key: 'cafeLou', name: "Lucky Lou", outfit: 'vest', torso: '#16a34a', crest: '8', mood: 'excited' } }, "SLIM": { cafe: [3, 1], spec: { key: 'cafeSlim', name: "Slim", outfit: 'suit', torso: '#201e1d', crest: '8', mood: 'neutral' } } }, census: [], scenes: ['nx-cafe-dice-a', 'nx-cafe-dice-b'] },
  { id: 'cafeTourist', foxes: { 'FENWICK': ['cafeFenwick'], 'SAL': ['cafeSal'] }, spawn: { "FENWICK": { cafe: [4, 0], spec: { key: 'cafeFenwick', name: "Fenwick", outfit: 'vest', torso: '#38bdf8', crest: '8', mood: 'happy' } }, "SAL": { cafe: [4, 1], spec: { key: 'cafeSal', name: "Sal", outfit: 'robe', female: true, torso: '#a16207', crest: '8', mood: 'warm' } } }, census: [], scenes: ['nx-cafe-tour-a', 'nx-cafe-tour-b'] },
  { id: 'chess', foxes: { 'CHESS ONE': ['plazaChessA'], 'CHESS TWO': ['plazaChessB'], 'CHESS WATCHER': ['plazaChessWatch'] }, census: ['plaza-chess'], scenes: ['nx-chess-a', 'nx-chess-b', 'nx-chess-c', 'nx-chess-d'] },
  { id: 'checkers', foxes: { 'CHECKERS ONE': ['plazaCheckA'], 'CHECKERS TWO': ['plazaCheckB'] }, census: ['plaza-check'], scenes: ['nx-check-a', 'nx-check-b', 'nx-check-c'] },
  { id: 'tether', foxes: { 'TETHER ONE': ['plazaTetherA'], 'TETHER TWO': ['plazaTetherB'] }, census: ['plaza-tether'], scenes: ['nx-tether-a', 'nx-tether-b'] },
  { id: 'fish', foxes: { 'FISHERMAN': ['fisherman'], 'MAREN': ['duetMaren'] }, spawn: { MAREN: { near: 'FISHERMAN', off: [1.5, 0.6], spec: { key: 'duetMaren', name: 'Maren', outfit: 'coat', female: true, torso: ['#c9a66b', '#94713e', '#5a4122'], crest: '8', mood: 'warm' } } }, census: [], scenes: ['nx-fish-a', 'nx-fish-b', 'nx-fish-c', 'nx-fish-d', 'nx-fish-e'] },
  { id: 'bowlladies', foxes: { 'GALE': ['lanesRegular'], 'NERA': ['lanesRecord'] }, census: [], scenes: ['nx-ladies-a', 'nx-ladies-b', 'nx-ladies-c', 'nx-ladies-d'] },
  { id: 'dashpiper', foxes: { 'DASH': ['bowlerDash'], 'PIPER': ['bowlerPiper'] }, census: ['lanes-bowl'], scenes: ['nx-lanes-a', 'nx-lanes-b'] },
  { id: 'diner', foxes: { 'DINER SERVER': ['dinerServer'], 'DINER COOK': ['dinerCook'] }, census: ['lanes-diner'], scenes: ['nx-diner-a', 'nx-diner-b'] },
  { id: 'slots', foxes: { 'SLOT LUCKY': ['casinoSlots1'], 'SLOT SURE': ['casinoSlots2'] }, census: ['casino-slots'], scenes: ['nx-slots-a', 'nx-slots-b'] },
  { id: 'craps', foxes: { 'CRAPS PLAYER': ['casinoCrapsPlayer'], 'STICKMAN': ['casinoStickman'] }, census: ['casino-craps'], scenes: ['nx-craps-a'] },
  { id: 'casbar', foxes: { 'BAR GUEST': ['casinoBarGuest'], 'BARTENDER': ['casinoBartender'] }, census: ['casino-bar'], scenes: ['nx-casbar-a'] },
  { id: 'cells', foxes: { 'SCRAPS': ['prisonerScraps'], 'MUTT': ['prisonerMutt'] }, census: ['police-cell'], scenes: ['nx-cell-a', 'nx-cell-b'] },
  { id: 'bench', foxes: { 'GRUMBLE': ['benchGrumble'], 'OLD JACK': ['oldJack'] }, census: ['police-bench'], scenes: ['nx-bench-a', 'nx-bench-b'] },
  { id: 'pearl', foxes: { 'PEARL LOCAL ONE': ['pearlLocal1'], 'PEARL LOCAL TWO': ['pearlLocal2'] }, census: ['pearl'], scenes: ['nx-pearl-a'] },
  { id: 'racers', foxes: { 'RACER ZERO': ['bhRacer0'], 'RACER ONE': ['bhRacer1'], 'RACER TWO': ['bhRacer2'] }, census: ['boat'], scenes: ['nx-boat-a'] },
  { id: 'schoolball', foxes: { 'TOBI': ['tobi'], 'JUNO': ['juno'] }, census: ['school-ball'], scenes: ['nx-school-a'] },
  { id: 'schoolart', foxes: { 'RIO': ['rio'], 'MAE': ['mae'] }, census: ['school-art'], scenes: ['nx-school-b'] },
  { id: 'schoolprint', foxes: { 'PIP': ['pip'], 'JUNO': ['juno'] }, census: ['school-print'], scenes: [] },
  { id: 'tavern', foxes: { 'TAVERN ZIGGY': ['tvZiggy'], 'TAVERN REGULAR': ['tvRegular'] }, census: ['tavern-reg'], scenes: [] },
  { id: 'dock', foxes: { 'BERTH GUARD': ['dockGuardA'], 'GANTRY GUARD': ['dockGuardB'] }, census: ['dk-guards'], scenes: [] },
  { id: 'stretch', foxes: { 'STRETCH ONE': ['stretch1'], 'STRETCH TWO': ['stretch2'], 'STRETCH THREE': ['stretch3'] }, spawn: { "STRETCH ONE": { nearKey: ["plazaTetherA"], off: [-3.0, 6.0], spec: { key: 'stretch1', name: "Stretch", outfit: 'vest', torso: "#f59e0b", crest: '8', mood: 'warm' } }, "STRETCH TWO": { nearKey: ["plazaTetherA"], off: [-4.4, 6.6], spec: { key: 'stretch2', name: "Stretch", outfit: 'dress', female: true, torso: "#38bdf8", crest: '8', mood: 'warm' } }, "STRETCH THREE": { nearKey: ["plazaTetherA"], off: [-3.7, 8.2], spec: { key: 'stretch3', name: "Stretch", outfit: 'vest', torso: "#22c55e", crest: '8', mood: 'warm' } } }, census: ['plaza-stretch'], scenes: [] },
  { id: 'balcrest', foxes: { 'BALCONY CREST ONE': ['balCrest1'], 'BALCONY CREST TWO': ['balCrest2'] }, spawn: { "BALCONY CREST ONE": { nearKey: ["aptDoorCrest","aptRealCrest"], off: [2.5, 2.0], spec: { key: 'balCrest1', name: "Balcony Crest", outfit: 'dress', female: true, torso: "#c084fc", crest: '8', mood: 'warm' } }, "BALCONY CREST TWO": { nearKey: ["aptDoorCrest","aptRealCrest"], off: [-2.5, 2.4], spec: { key: 'balCrest2', name: "Balcony Crest", outfit: 'dress', female: true, torso: "#fb7185", crest: '8', mood: 'warm' } } }, census: ['balcony-crest'], scenes: [] },
  { id: 'ballake', foxes: { 'BALCONY LAKE ONE': ['balLake1'], 'BALCONY LAKE TWO': ['balLake2'] }, spawn: { "BALCONY LAKE ONE": { nearKey: ["aptDoorLake","aptRealLake"], off: [2.5, 2.0], spec: { key: 'balLake1', name: "Balcony Lake", outfit: 'dress', female: true, torso: "#60a5fa", crest: '8', mood: 'warm' } }, "BALCONY LAKE TWO": { nearKey: ["aptDoorLake","aptRealLake"], off: [-2.5, 2.4], spec: { key: 'balLake2', name: "Balcony Lake", outfit: 'dress', female: true, torso: "#fbbf24", crest: '8', mood: 'warm' } } }, census: ['balcony-lake'], scenes: [] },
  { id: 'court', foxes: { 'LANES LOSER': ['lanesLoser'], 'WINNIE': ['lanesWinnie'] }, spawn: { "LANES LOSER": { nearKey: ["lanesKeeper"], off: [3.0, 4.0], spec: { key: 'lanesLoser', name: "Lanes Loser", outfit: 'vest', torso: "#9ca3af", crest: '8', mood: 'warm' } }, "WINNIE": { nearKey: ["lanesKeeper"], off: [4.4, 4.6], spec: { key: 'lanesWinnie', name: "Winnie", outfit: 'dress', female: true, torso: "#ff4f9a", crest: '8', mood: 'warm' } } }, census: ['court'], scenes: [] },
  { id: 'darts', foxes: { 'FLICK': ['darterFlick', 'duetFlick'], 'TAVERN COOK': ['duetTavCook'] }, spawn: { "FLICK": { nearKey: ["tvZiggy"], off: [-3.0, 2.0], spec: { key: 'duetFlick', name: "Flick", outfit: 'vest', torso: "#b91c1c", crest: '8', mood: 'warm' } }, "TAVERN COOK": { nearKey: ["tvZiggy"], off: [-4.2, 2.6], spec: { key: 'duetTavCook', name: "Tavern Cook", outfit: 'dress', female: true, torso: "#f3f2f2", crest: '8', mood: 'warm' } } }, census: ['tavern-darts'], scenes: [] },
  { id: 'siblings', foxes: { 'PRINCESS MICHELLE': ['duetMichelle'], 'PRINCE MAX': ['max', 'castleMax', 'princeMax'] }, spawn: { "PRINCESS MICHELLE": { nearKey: ["max","castleMax","princeMax"], off: [1.4, 0.4], spec: { key: 'duetMichelle', name: "Princess Michelle", outfit: 'dress', female: true, torso: "#3b52a8", crest: '8', mood: 'warm' } } }, census: ['mt-siblings'], scenes: [] },
  // s150i STATION CLERKS: one on the street by each loop station (census loop-* rows: platform shout + 2 lines)
  { id: 'clerkTown', foxes: { 'CLERK SQUARE': ['clerkTown'] }, spawn: { 'CLERK SQUARE': { at: [55.1, 142.5], spec: { key: 'clerkTown', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-square'], scenes: [] },
  { id: 'clerkLakeside', foxes: { 'CLERK LAKESIDE': ['clerkLakeside'] }, spawn: { 'CLERK LAKESIDE': { at: [388.5, 275.4], spec: { key: 'clerkLakeside', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-lakeside'], scenes: [] },
  { id: 'clerkArena', foxes: { 'CLERK ARENA': ['clerkArena'] }, spawn: { 'CLERK ARENA': { at: [507.0, 0.0], spec: { key: 'clerkArena', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-arena'], scenes: [] },
  { id: 'clerkSpire', foxes: { 'CLERK SPIRE': ['clerkSpire'] }, spawn: { 'CLERK SPIRE': { at: [508.2, -316.8], spec: { key: 'clerkSpire', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-spire'], scenes: [] },
  { id: 'clerkCastleRd', foxes: { 'CLERK CASTLE': ['clerkCastleRd'] }, spawn: { 'CLERK CASTLE': { at: [-44.3, -507.0], spec: { key: 'clerkCastleRd', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-castle'], scenes: [] },
  { id: 'clerkDeco', foxes: { 'CLERK MARKET': ['clerkDeco'] }, spawn: { 'CLERK MARKET': { at: [-507.3, -154.7], spec: { key: 'clerkDeco', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-market'], scenes: [] },
  { id: 'clerkRuins', foxes: { 'CLERK RUINS': ['clerkRuins'] }, spawn: { 'CLERK RUINS': { at: [-507.0, 54.2], spec: { key: 'clerkRuins', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-ruins'], scenes: [] },
  { id: 'clerkGarden', foxes: { 'CLERK CRESTVIEW': ['clerkGarden'] }, spawn: { 'CLERK CRESTVIEW': { at: [-171.3, 322.9], spec: { key: 'clerkGarden', name: 'Station Clerk', outfit: 'vest', torso: ['#ec3013', '#201e1d', '#ffd23a'], crest: '8', mood: 'warm' } } }, census: ['loop-crest'], scenes: [] },
  // NEW FOXES since the census
  { id: 'gilt', foxes: { 'MISS GILT': ['daptGilt'], 'MIDNIGHT JUGGLER': ['daptJuggler0', 'daptJuggler1'] }, census: [], scenes: ['nx-gilt-a', 'nx-gilt-b', 'nx-gilt-c'] },
  { id: 'volt', foxes: { 'ENGINEER VOLT': ['saptVolt'], 'BOT-7': ['saptBot7'] }, census: [], scenes: ['nx-volt-a', 'nx-volt-b', 'nx-volt-c'] },
  { id: 'hush', foxes: { 'MR HUSH': ['laptHush'] }, census: [], scenes: ['nx-hush-a', 'nx-hush-b'] },
  { id: 'gardener', foxes: { 'ISLAND GARDENER': ['gaptGardener'] }, census: [], scenes: ['nx-garden-a', 'nx-garden-b'] },
  { id: 'sparks', foxes: { 'CHIEF EMBER': ['chiefEmber'], 'SPARKS': ['fireDog'] }, census: [], scenes: ['nx-sparks-a', 'nx-sparks-b'] },
  { id: 'knox', foxes: { 'SGT KNOX': ['policeKnox'], 'OLD JACK': ['oldJack'] }, census: [], scenes: ['nx-knox-a'] },
  { id: 'tumbler', foxes: { 'TUMBLER': ['bankTumbler'] }, census: [], scenes: ['nx-tumbler-a'] },
];
// scene → rows [fox, delivery, text]
export const SCENES = {
  // s181 DECK DUETS (Tavern Deck tables)
  'nx-cafe-old-a': [['HERBERT', 'warm', 'Fifty years today, Mabel.'], ['MABEL', 'warm', 'Fifty-one. You forgot again.'], ['HERBERT', 'laugh', 'I remembered the cake.'], ['MABEL', 'warm', 'You ate the cake on the way here.'], ['HERBERT', 'normal', 'I was checking it was good.'], ['MABEL', 'laugh', 'Was it?'], ['HERBERT', 'warm', 'Very. Happy anniversary, my love.']],
  'nx-cafe-old-b': [['MABEL', 'normal', 'We had our first date at this very table.'], ['HERBERT', 'normal', 'The umbrella was blue then.'], ['MABEL', 'warm', 'And you had a tail full of burrs.'], ['HERBERT', 'laugh', 'I still do. You just stopped saying so.']],
  'nx-cafe-date-a': [['ROWAN', 'nervous', 'So. Do you like... tables?'], ['WREN', 'happy', 'I am sitting at one.'], ['ROWAN', 'nervous', 'Right. Good. Me too.'], ['WREN', 'laugh', 'You have asked me that twice now.'], ['ROWAN', 'sigh', 'I wrote three questions on my paw. That was all of them.'], ['WREN', 'happy', 'Then I will ask one. Same time next week?']],
  'nx-cafe-date-b': [['WREN', 'happy', 'Your ears go red when you talk.'], ['ROWAN', 'nervous', 'They do not. It is the sun.'], ['WREN', 'laugh', 'We are under an umbrella.'], ['ROWAN', 'sigh', 'It is a very sunny umbrella.']],
  'nx-cafe-gossip-a': [['DOT', 'whisper', 'Did you hear about the Ferry Captain?'], ['MARGO', 'excited', 'Tell me everything.'], ['DOT', 'whisper', 'The ducks follow him to work now. Every day.'], ['MARGO', 'normal', 'All of them?'], ['DOT', 'whisper', 'Twelve ducks. In a line. Like a little army.'], ['MARGO', 'laugh', 'I always knew that fox had a secret.']],
  'nx-cafe-gossip-b': [['MARGO', 'whisper', 'Do not look now. The Ferry Captain, by the fountain.'], ['DOT', 'normal', 'Where are the ducks?'], ['MARGO', 'whisper', 'Behind him. Wearing hats.'], ['DOT', 'laugh', 'Tiny hats? Oh, I must see this.']],
  'nx-cafe-dice-a': [['LUCKY LOU', 'excited', 'Come on, Doris. Come on, Gerald. Daddy needs a six.'], ['SLIM', 'normal', 'You named your dice.'], ['LUCKY LOU', 'normal', 'Doris is lucky. Gerald is moody.'], ['SLIM', 'normal', 'You rolled a two.'], ['LUCKY LOU', 'sigh', 'Gerald. Always Gerald.']],
  'nx-cafe-dice-b': [['SLIM', 'normal', 'Double or nothing?'], ['LUCKY LOU', 'excited', 'Doris says yes. Gerald is not talking to me.'], ['SLIM', 'laugh', 'Smart dice.']],
  'nx-cafe-tour-a': [['FENWICK', 'happy', 'Excuse me. Which way to the castle?'], ['SAL', 'normal', 'Up the hill. Follow the yellow bricks.'], ['FENWICK', 'happy', 'And the beach?'], ['SAL', 'normal', 'Down the hill. Follow the yellow bricks.'], ['FENWICK', 'normal', 'And the arena?'], ['SAL', 'sigh', 'Yellow bricks, love. All of them. That is the whole town.']],
  'nx-cafe-tour-b': [['FENWICK', 'happy', 'I have taken four hundred photos of your fountain.'], ['SAL', 'normal', 'It is a nice fountain.'], ['FENWICK', 'excited', 'Is it true it has run for two hundred years?'], ['SAL', 'laugh', 'Longer. Nobody can find the off switch.']],
  'nx-chess-a': [
    ['CHESS ONE', 'calm', 'Do you hear that?'], ['CHESS TWO', 'normal', 'Hear what?'], ['CHESS ONE', 'calm', 'Your knight. It is crying.'],
    ['CHESS TWO', 'normal', 'My knight is fine. My knight is thriving.'], ['CHESS ONE', 'calm', 'Your knight is surrounded by three of my pawns.'],
    ['CHESS TWO', 'normal', 'They are pawns. He could take them all.'], ['CHESS ONE', 'calm', 'One at a time. Slowly. While I take your queen.'],
    ['CHESS WATCHER', 'whisper', 'He has been planning that since breakfast.'], ['CHESS TWO', 'sigh', 'Can we start again?'], ['CHESS ONE', 'calm', 'We have started again nine times today.']],
  'nx-chess-b': [
    ['CHESS TWO', 'normal', 'Fine. Your move.'], ['CHESS ONE', 'calm', 'I know.'], ['CHESS TWO', 'normal', 'Any day now.'],
    ['CHESS ONE', 'calm', 'The fountain has been running for two hundred years. It is in no hurry.'], ['CHESS TWO', 'normal', 'The fountain is not playing chess.'],
    ['CHESS ONE', 'calm', 'If it were, it would also take its time.'], ['CHESS WATCHER', 'whisper', 'The fountain would win, honestly.'],
    ['CHESS TWO', 'normal', 'Nobody asked you.'], ['CHESS WATCHER', 'whisper', 'Nobody ever asks me. That is why I am always right.'], ['CHESS ONE', 'calm', 'Bishop. Check.'], ['CHESS TWO', 'shout', 'WHERE did that come from?']],
  'nx-chess-c': [
    ['CHESS WATCHER', 'whisper', 'Do you two ever play anything else?'], ['CHESS TWO', 'normal', 'We tried checkers once.'], ['CHESS ONE', 'calm', 'He cried.'],
    ['CHESS TWO', 'normal', 'I did not cry. The wind was in my eyes.'], ['CHESS ONE', 'calm', 'We were indoors.'], ['CHESS TWO', 'normal', 'It was a very windy room.'],
    ['CHESS WATCHER', 'laugh', 'I remember. It was a Tuesday.'], ['CHESS TWO', 'sigh', 'Everything bad happens on a Tuesday.'], ['CHESS ONE', 'calm', 'It is Tuesday now.'], ['CHESS TWO', 'normal', 'Oh, NO.']],
  'nx-chess-d': [
    ['CHESS ONE', 'calm', 'Have you noticed the soldier fox watching us?'], ['CHESS TWO', 'normal', 'The one with the eight on his chest?'], ['CHESS ONE', 'calm', 'He thinks he could beat us both.'],
    ['CHESS TWO', 'normal', 'Could he?'], ['CHESS ONE', 'calm', 'You? Easily. Me? He would need a week.'], ['CHESS WATCHER', 'whisper', 'He has a sword. Chess does not care about swords.'],
    ['CHESS TWO', 'normal', 'Rook to the middle.'], ['CHESS ONE', 'calm', 'Interesting.'], ['CHESS TWO', 'normal', 'Is it good interesting or bad interesting?'], ['CHESS ONE', 'calm', 'Yes.']],
  'nx-check-a': [
    ['CHECKERS ONE', 'laugh', 'King me!'], ['CHECKERS TWO', 'normal', 'That is your fourth king, Rufus.'], ['CHECKERS ONE', 'normal', 'A fox can never have too many kings.'],
    ['CHECKERS TWO', 'normal', 'King Might would disagree.'], ['CHECKERS ONE', 'laugh', 'King Might has never played checkers against you.'], ['CHECKERS TWO', 'calm', 'Jump. Jump. And jump.'],
    ['CHECKERS ONE', 'normal', 'That is three of my kings.'], ['CHECKERS TWO', 'calm', 'A fox can never have too many kings, you said.'], ['CHECKERS ONE', 'sigh', 'I take it back.']],
  'nx-check-b': [
    ['CHECKERS TWO', 'normal', 'The chess table thinks we are playing the easy game.'], ['CHECKERS ONE', 'normal', 'Let them think it.'], ['CHECKERS TWO', 'normal', 'They have been on the same game since spring.'],
    ['CHECKERS ONE', 'laugh', 'We have played two hundred games since spring.'], ['CHECKERS TWO', 'normal', 'And I have won one hundred and ninety.'], ['CHECKERS ONE', 'normal', 'Ninety one.'],
    ['CHECKERS TWO', 'calm', 'Ninety. I counted the one where you sneezed on the board.'], ['CHECKERS ONE', 'normal', 'Pieces MOVED, Bea. That is not a win.'], ['CHECKERS TWO', 'laugh', 'It is if I say so.']],
  'nx-check-c': [
    ['CHECKERS ONE', 'normal', 'Did you see the bowling hall put up a new sign?'], ['CHECKERS TWO', 'normal', 'The one with the flashing pins?'], ['CHECKERS ONE', 'normal', 'It keeps me up at night.'],
    ['CHECKERS TWO', 'normal', 'You live four streets away.'], ['CHECKERS ONE', 'normal', 'It is a very bright sign.'], ['CHECKERS TWO', 'calm', 'Your move, Rufus.'],
    ['CHECKERS ONE', 'normal', 'I was hoping you had forgotten.'], ['CHECKERS TWO', 'laugh', 'I never forget. Ask my husband.']],
  'nx-tether-a': [
    ['TETHER ONE', 'shout', 'HIGHER!'], ['TETHER TWO', 'shout', 'It cannot go higher, it is on a ROPE!'], ['TETHER ONE', 'shout', 'Then hit it HARDER!'],
    ['TETHER TWO', 'normal', 'Ow. My paw.'], ['TETHER ONE', 'laugh', 'That is the game. That is the whole game.'], ['TETHER TWO', 'normal', 'Remind me why we play this?'],
    ['TETHER ONE', 'normal', 'Because the chess foxes said we were too loud for chess.'], ['TETHER TWO', 'shout', 'We ARE too loud for chess!']],
  'nx-tether-b': [
    ['TETHER TWO', 'normal', 'New rule. No spinning it round the pole six times.'], ['TETHER ONE', 'normal', 'That is not a rule, that is a skill.'], ['TETHER TWO', 'normal', 'It hit me in the face.'],
    ['TETHER ONE', 'normal', 'Skilfully.'], ['TETHER TWO', 'sigh', 'Best of nine?'], ['TETHER ONE', 'laugh', 'Best of ninety. I have all day.']],
  'nx-fish-a': [
    ['MAREN', 'normal', 'You are holding the rod wrong again.'], ['FISHERMAN', 'calm', 'I have held this rod for forty years.'], ['MAREN', 'normal', 'Wrong, for forty years.'],
    ['FISHERMAN', 'calm', 'And who caught the big silver one last summer?'], ['MAREN', 'normal', 'It jumped into the boat, dear. It was escaping a duck.'],
    ['FISHERMAN', 'calm', 'It chose my boat. That is a kind of skill.'], ['MAREN', 'laugh', 'That is a kind of luck.'], ['FISHERMAN', 'calm', 'Luck is a skill, if you sit still long enough.']],
  'nx-fish-b': [
    ['FISHERMAN', 'whisper', 'Shh. Something is nibbling.'], ['MAREN', 'whisper', 'It is weed.'], ['FISHERMAN', 'whisper', 'Weed does not nibble.'],
    ['MAREN', 'whisper', 'Lake weed does. It is a very hungry lake.'], ['FISHERMAN', 'normal', 'It is gone.'], ['MAREN', 'normal', 'The weed got away. How awful for you.'],
    ['FISHERMAN', 'sigh', 'Pass me the sandwiches.'], ['MAREN', 'normal', 'You used the sandwiches for bait.'], ['FISHERMAN', 'calm', 'Then the fish are eating well today.']],
  'nx-fish-c': [
    ['MAREN', 'normal', 'Did you see the ferry captain wave at us?'], ['FISHERMAN', 'calm', 'He waves at everybody.'], ['MAREN', 'normal', 'He waved at me twice.'],
    ['FISHERMAN', 'calm', 'He has two arms. He has to use them for something.'], ['MAREN', 'laugh', 'Jealous, after forty years.'], ['FISHERMAN', 'calm', 'I am not jealous. I am fishing.'],
    ['MAREN', 'normal', 'You are holding the rod wrong.'], ['FISHERMAN', 'sigh', 'Here we go again.']],
  'nx-fish-d': [
    ['FISHERMAN', 'calm', 'They say there is a fish in this lake as long as a rowing boat.'], ['MAREN', 'normal', 'They say that about every lake.'], ['FISHERMAN', 'calm', 'This lake has the Pearl Sail on it. Big buildings, big fish.'],
    ['MAREN', 'normal', 'That is not how fish work.'], ['FISHERMAN', 'calm', 'You do not know how fish work. Nobody knows how fish work.'], ['MAREN', 'normal', 'The fish know.'],
    ['FISHERMAN', 'calm', 'And they are not telling.'], ['MAREN', 'laugh', 'Smart fish.']],
  'nx-fish-e': [
    ['MAREN', 'normal', 'A swimmer went past. Scared every fish to the far bank.'], ['FISHERMAN', 'calm', 'Then we row to the far bank.'], ['MAREN', 'normal', 'You hate rowing.'],
    ['FISHERMAN', 'calm', 'I hate rowing less than I hate empty buckets.'], ['MAREN', 'normal', 'Our bucket has one fish in it.'], ['FISHERMAN', 'calm', 'And his name is Gerald, and he is a good listener.'],
    ['MAREN', 'laugh', 'You named the fish.'], ['FISHERMAN', 'calm', 'He has been with us since dawn. He is family now.']],
  'nx-ladies-a': [
    ['GALE', 'normal', 'Did you see my last ball? Right down the gutter.'], ['NERA', 'normal', 'I saw. The whole hall saw.'], ['GALE', 'sigh', 'The gutter is my oldest friend.'],
    ['NERA', 'laugh', 'You should invite it to dinner.'], ['GALE', 'normal', 'It would only roll off the table.'], ['NERA', 'normal', 'Lean in, Gale. Low, and let it go.'],
    ['GALE', 'normal', 'I lean in. The ball leans out.'], ['NERA', 'laugh', 'Then you two need to talk.']],
  'nx-ladies-b': [
    ['NERA', 'normal', 'Mott oiled the lanes this morning.'], ['GALE', 'normal', 'That explains it. I am not bad, the lanes are slippery.'], ['NERA', 'normal', 'You bowled a seven yesterday too.'],
    ['GALE', 'normal', 'Mott oils them every morning. I am consistent.'], ['NERA', 'laugh', 'You are something.'], ['GALE', 'normal', 'What is the hall record now?'],
    ['NERA', 'calm', 'Two hundred and ninety. Mine.'], ['GALE', 'sigh', 'You always say mine in that voice.'], ['NERA', 'calm', 'It is the voice of a record holder, darling.']],
  'nx-ladies-c': [
    ['GALE', 'normal', 'New shoes.'], ['NERA', 'normal', 'Rented?'], ['GALE', 'normal', 'Bought! Red, with a white stripe.'], ['NERA', 'normal', 'They are lovely.'],
    ['GALE', 'normal', 'They make me bowl faster.'], ['NERA', 'laugh', 'Into the gutter, faster.'], ['GALE', 'normal', 'Stylishly into the gutter.'], ['NERA', 'calm', 'That I will give you.']],
  'nx-ladies-d': [
    ['NERA', 'whisper', 'That soldier fox has a lovely throw.'], ['GALE', 'whisper', 'The one with the orange tail?'], ['NERA', 'whisper', 'Seven strikes in a row last week.'],
    ['GALE', 'normal', 'Seven? Mott must have oiled HIS lane less.'], ['NERA', 'laugh', 'Or he leans in.'], ['GALE', 'sigh', 'Everybody keeps telling me to lean in.'],
    ['NERA', 'normal', 'Because it works, Gale.'], ['GALE', 'normal', 'Fine. Watch me. Leaning in.'], ['NERA', 'shout', 'GUTTER!']],
  'nx-lanes-a': [
    ['DASH', 'normal', 'I am going to bowl a perfect game tonight.'], ['PIPER', 'normal', 'You say that every night.'], ['DASH', 'normal', 'And one night it will be true.'],
    ['PIPER', 'normal', 'Statistically, sure.'], ['DASH', 'normal', 'Statistically I am due.'], ['PIPER', 'laugh', 'You have been due since you were six.']],
  'nx-lanes-b': [
    ['PIPER', 'normal', 'Your wrist. Straight.'], ['DASH', 'normal', 'It is straight.'], ['PIPER', 'normal', 'It is a question mark.'], ['DASH', 'normal', 'A straight question mark.'],
    ['PIPER', 'sigh', 'Just roll it.'], ['DASH', 'shout', 'STRIKE! Did you see that?'], ['PIPER', 'normal', 'With your wrist like a question mark.'], ['DASH', 'laugh', 'The answer was strike.']],
  'nx-diner-a': [
    ['DINER SERVER', 'normal', 'Two fish sandwiches, one with no fish.'], ['DINER COOK', 'normal', 'So, bread.'], ['DINER SERVER', 'normal', 'He said a fish sandwich with no fish.'],
    ['DINER COOK', 'normal', 'That is bread, Lou. Bread with feelings.'], ['DINER SERVER', 'normal', 'Put a pickle on it. Call it the Lane Special.'], ['DINER COOK', 'laugh', 'Ten gold for bread and a pickle.'],
    ['DINER SERVER', 'normal', 'It is the most popular thing on the menu.'], ['DINER COOK', 'sigh', 'I went to cooking school for this.']],
  'nx-diner-b': [
    ['DINER COOK', 'normal', 'Who keeps ordering milkshakes at midnight?'], ['DINER SERVER', 'normal', 'The bowling league.'], ['DINER COOK', 'normal', 'All of them?'],
    ['DINER SERVER', 'normal', 'Strawberry for winners. Chocolate for the gutter crew.'], ['DINER COOK', 'normal', 'We are out of chocolate.'], ['DINER SERVER', 'laugh', 'Then tonight, nobody loses.']],
  'nx-slots-a': [
    ['SLOT LUCKY', 'normal', 'This machine is warm. That means it is ready.'], ['SLOT SURE', 'normal', 'It is warm because you have been sitting at it for six hours.'],
    ['SLOT LUCKY', 'normal', 'Exactly. I warmed it up for the jackpot.'], ['SLOT SURE', 'normal', 'Cherry, cherry, lemon.'], ['SLOT LUCKY', 'shout', 'SO CLOSE!'],
    ['SLOT SURE', 'calm', 'That is the twelfth so close.'], ['SLOT LUCKY', 'normal', 'Thirteen is lucky.'], ['SLOT SURE', 'sigh', 'Thirteen is unlucky.'], ['SLOT LUCKY', 'normal', 'Not tonight.']],
  'nx-slots-b': [
    ['SLOT SURE', 'normal', 'I play one coin, and I stop.'], ['SLOT LUCKY', 'normal', 'How is that fun?'], ['SLOT SURE', 'calm', 'I still have my house.'],
    ['SLOT LUCKY', 'normal', 'I still have my house too.'], ['SLOT SURE', 'normal', 'You told me you live in a boat now.'], ['SLOT LUCKY', 'normal', 'It is a very nice boat.']],
  'nx-craps-a': [
    ['CRAPS PLAYER', 'shout', 'Come on, seven! Mama needs a new hat!'], ['STICKMAN', 'calm', 'Eleven. Pays the field.'], ['CRAPS PLAYER', 'normal', 'Eleven is just seven wearing a disguise.'],
    ['STICKMAN', 'calm', 'That is not how dice work, madam.'], ['CRAPS PLAYER', 'normal', 'Do not tell me how dice work. I have been blowing on them for years.'],
    ['STICKMAN', 'calm', 'New shooter. Coming out.'], ['CRAPS PLAYER', 'shout', 'Hat money! HAT MONEY!']],
  'nx-casbar-a': [
    ['BAR GUEST', 'normal', 'Something strong, please.'], ['BARTENDER', 'calm', 'Cocoa with extra marshmallows.'], ['BAR GUEST', 'normal', 'Stronger.'],
    ['BARTENDER', 'calm', 'Cocoa with extra marshmallows and a cinnamon stick.'], ['BAR GUEST', 'sigh', 'You are a dangerous fox.'], ['BARTENDER', 'calm', 'Lost at the wheel again?'],
    ['BAR GUEST', 'normal', 'It landed on red. I was on red. Then it moved.'], ['BARTENDER', 'calm', 'It does that. It is a wheel.']],
  'nx-bench-a': [
    ['GRUMBLE', 'normal', 'They arrested me for whistling.'], ['OLD JACK', 'calm', 'Nobody gets arrested for whistling.'], ['GRUMBLE', 'normal', 'At three in the morning. Under the Chief\u2019s window.'],
    ['OLD JACK', 'calm', 'Ah. That will do it.'], ['GRUMBLE', 'normal', 'What are you in for?'], ['OLD JACK', 'calm', 'I took a nap in the bank vault.'],
    ['GRUMBLE', 'normal', 'Why?'], ['OLD JACK', 'calm', 'Best air conditioning in Meru.']],
  'nx-bench-b': [
    ['OLD JACK', 'calm', 'Sergeant Knox makes a good soup.'], ['GRUMBLE', 'normal', 'You are in a cell.'], ['OLD JACK', 'calm', 'A cell with soup. I have had worse Tuesdays.'],
    ['GRUMBLE', 'normal', 'I want a lawyer.'], ['OLD JACK', 'calm', 'There is a lawyer up the Spire. Floor eight. He charges by the word.'], ['GRUMBLE', 'normal', 'Then I will be very quiet.'],
    ['OLD JACK', 'laugh', 'That would be a first.']],
  'nx-pearl-a': [
    ['PEARL LOCAL ONE', 'normal', 'They are cleaning the Pearl Sail windows again.'], ['PEARL LOCAL TWO', 'normal', 'That robot? SUDS?'], ['PEARL LOCAL ONE', 'normal', 'He waved his squeegee at me.'],
    ['PEARL LOCAL TWO', 'normal', 'Waved, or swung?'], ['PEARL LOCAL ONE', 'normal', 'Hard to tell with a robot.'], ['PEARL LOCAL TWO', 'whisper', 'I heard he fell off the roof once. Bounced.'],
    ['PEARL LOCAL ONE', 'laugh', 'He is mostly soap. Of course he bounced.']],
  'nx-boat-a': [
    ['RACER ZERO', 'normal', 'The slalom buoys moved again.'], ['RACER ONE', 'laugh', 'Buoys do not move, Dash.'], ['RACER ZERO', 'normal', 'Then who moved them into my boat?'],
    ['RACER TWO', 'normal', 'The wind.'], ['RACER ZERO', 'normal', 'The wind does not have a grudge against me.'], ['RACER ONE', 'normal', 'Everybody has a grudge against you. You splash the dock.'],
    ['RACER ZERO', 'normal', 'Splashing is a racing line.'], ['RACER TWO', 'sigh', 'It is a soaking line.']],
  'nx-school-a': [
    ['TOBI', 'normal', 'Catch!'], ['JUNO', 'normal', 'I hear it. Left, then bounce.'], ['TOBI', 'normal', 'You always catch the bell ball.'],
    ['JUNO', 'laugh', 'You throw like you talk. Loud and early.'], ['TOBI', 'normal', 'Is that good?'], ['JUNO', 'normal', 'It is very easy to catch.']],
  'nx-school-b': [
    ['RIO', 'normal', 'Feel this. Is the paint dry?'], ['MAE', 'normal', 'Mostly. The top bit is still sticky.'], ['RIO', 'normal', 'That is the sun. It is meant to be sticky.'],
    ['MAE', 'normal', 'Why?'], ['RIO', 'normal', 'Because the sun is hot and everything sticks to it.'], ['MAE', 'laugh', 'That is not science, Rio.'], ['RIO', 'normal', 'It is art. Art does not need science.']],
  'nx-gilt-a': [
    ['MISS GILT', 'calm', 'Darling. Not the crystal glasses.'], ['MIDNIGHT JUGGLER', 'normal', 'Three glasses is easy. It is the fourth that worries me.'],
    ['MISS GILT', 'calm', 'There is no fourth.'], ['MIDNIGHT JUGGLER', 'normal', 'There is now.'], ['MISS GILT', 'sigh', 'Those were my grandmother\u2019s.'],
    ['MIDNIGHT JUGGLER', 'normal', 'And they have never flown so beautifully.'], ['MISS GILT', 'laugh', 'You are lucky you are charming.'], ['MIDNIGHT JUGGLER', 'normal', 'Lucky, and very quick with my paws.']],
  'nx-gilt-b': [
    ['MIDNIGHT JUGGLER', 'normal', 'Why do you call it the ballroom? Nobody dances.'], ['MISS GILT', 'calm', 'In my day, everybody danced.'], ['MIDNIGHT JUGGLER', 'normal', 'What happened?'],
    ['MISS GILT', 'calm', 'Someone started juggling in the middle of the floor.'], ['MIDNIGHT JUGGLER', 'normal', 'Ah.'], ['MISS GILT', 'calm', 'Every night. At midnight. For eleven years.'],
    ['MIDNIGHT JUGGLER', 'laugh', 'That is commitment.'], ['MISS GILT', 'calm', 'That, darling, is a noise complaint.']],
  'nx-gilt-c': [
    ['MISS GILT', 'calm', 'The gold on these walls is real, you know.'], ['MIDNIGHT JUGGLER', 'normal', 'All of it?'], ['MISS GILT', 'calm', 'All of it. Hence the name.'],
    ['MIDNIGHT JUGGLER', 'normal', 'I thought you were called Gilt because you feel bad about things.'], ['MISS GILT', 'calm', 'That is guilt, with a U.'],
    ['MIDNIGHT JUGGLER', 'normal', 'Do you feel bad about anything?'], ['MISS GILT', 'calm', 'Only the year I wore green.']],
  'nx-volt-a': [
    ['ENGINEER VOLT', 'normal', 'Bot. Status.'], ['BOT-7', 'beep', 'Hallway clear. Lift clear. One moth.'], ['ENGINEER VOLT', 'normal', 'A moth is not a threat.'],
    ['BOT-7', 'beep', 'Moth is circling the light. Moth is planning something.'], ['ENGINEER VOLT', 'laugh', 'Stand down, Seven.'], ['BOT-7', 'beep', 'Standing down. Keeping one eye on the moth.']],
  'nx-volt-b': [
    ['BOT-7', 'beep', 'Engineer. Question.'], ['ENGINEER VOLT', 'normal', 'Go on.'], ['BOT-7', 'beep', 'Why do foxes sleep?'], ['ENGINEER VOLT', 'normal', 'To recharge.'],
    ['BOT-7', 'beep', 'Where is your plug?'], ['ENGINEER VOLT', 'normal', 'It is more of a pillow situation.'], ['BOT-7', 'beep', 'Inefficient.'], ['ENGINEER VOLT', 'laugh', 'Very comfy, though.']],
  'nx-volt-c': [
    ['ENGINEER VOLT', 'normal', 'Who rewired the hallway lights to blink in Morse code?'], ['BOT-7', 'beep', 'Unknown.'], ['ENGINEER VOLT', 'normal', 'They spell out BOT SEVEN WAS HERE.'],
    ['BOT-7', 'beep', 'A coincidence.'], ['ENGINEER VOLT', 'normal', 'Seven.'], ['BOT-7', 'beep', 'I was bored. The night is long. The moth left.']],
  'nx-hush-a': [
    ['MR HUSH', 'whisper', 'Shh. The building is sleeping.'], ['MR HUSH', 'whisper', 'Floor nine creaks at the third board. Step over it.'],
    ['MR HUSH', 'whisper', 'I have not raised my voice in nineteen years.'], ['MR HUSH', 'whisper', 'The last time I shouted, a pigeon fainted.']],
  'nx-hush-b': [
    ['MR HUSH', 'whisper', 'Listen. You can hear the lake from here, if nobody talks.'], ['MR HUSH', 'whisper', 'Somebody is always talking.'],
    ['MR HUSH', 'whisper', 'The chess foxes. The bowling ladies. The bell at the Lanes.'], ['MR HUSH', 'sigh', 'Meru is a lovely town. A very loud, lovely town.']],
  'nx-garden-a': [
    ['ISLAND GARDENER', 'calm', 'Good morning, tomatoes.'], ['ISLAND GARDENER', 'calm', 'You are looking very red today. Very proud.'],
    ['ISLAND GARDENER', 'calm', 'Not you, beans. You know what you did.'], ['ISLAND GARDENER', 'laugh', 'Climbing the railing like that. Up eleven floors. Showing off.']],
  'nx-garden-b': [
    ['ISLAND GARDENER', 'calm', 'The roses like the sea air.'], ['ISLAND GARDENER', 'calm', 'The mint likes everything. The mint would grow on the moon.'],
    ['ISLAND GARDENER', 'normal', 'Somebody keeps eating my strawberries.'], ['ISLAND GARDENER', 'whisper', 'I suspect the Building Manager. She has red paws on Mondays.']],
  'nx-sparks-a': [
    ['CHIEF EMBER', 'calm', 'Sparks. Bell drill.'], ['SPARKS', 'bark', 'Woof!'], ['CHIEF EMBER', 'calm', 'Good. Boots.'], ['SPARKS', 'bark', 'Woof woof!'],
    ['CHIEF EMBER', 'calm', 'Hat.'], ['SPARKS', 'bark', 'Woof?'], ['CHIEF EMBER', 'laugh', 'You do not have a hat. We will work on it.']],
  'nx-sparks-b': [
    ['CHIEF EMBER', 'calm', 'Who chewed the end of the hose?'], ['SPARKS', 'bark', 'Woof.'], ['CHIEF EMBER', 'calm', 'That was not a no.'], ['SPARKS', 'bark', '...woof.'],
    ['CHIEF EMBER', 'sigh', 'Fine. But you are helping Rung roll the new one.'], ['SPARKS', 'bark', 'WOOF!']],
  'nx-cell-a': [
    ['SCRAPS', 'normal', 'Mutt. Psst. Mutt.'], ['MUTT', 'sigh', 'What.'], ['SCRAPS', 'whisper', 'I have a plan.'], ['MUTT', 'normal', 'Your last plan is why we are in here.'],
    ['SCRAPS', 'whisper', 'This one has a spoon in it.'], ['MUTT', 'normal', 'A spoon.'], ['SCRAPS', 'whisper', 'We dig.'], ['MUTT', 'normal', 'The floor is stone, Scraps.'],
    ['SCRAPS', 'whisper', 'Then we dig slowly.'], ['MUTT', 'sigh', 'I am going back to sleep.']],
  'nx-cell-b': [
    ['MUTT', 'normal', 'What did they get you for this time?'], ['SCRAPS', 'normal', 'Borrowing.'], ['MUTT', 'normal', 'Borrowing what?'], ['SCRAPS', 'normal', 'A boat.'],
    ['MUTT', 'normal', 'For how long?'], ['SCRAPS', 'normal', 'Forever, ideally.'], ['MUTT', 'laugh', 'That is stealing.'], ['SCRAPS', 'normal', 'That is very long borrowing.']],
  'nx-knox-a': [
    ['SGT KNOX', 'normal', 'Jack. Soup.'], ['OLD JACK', 'calm', 'What kind?'], ['SGT KNOX', 'normal', 'Tomato.'], ['OLD JACK', 'calm', 'Tomato again?'],
    ['SGT KNOX', 'normal', 'You can leave any time, Jack. You served your day last week.'], ['OLD JACK', 'calm', 'And miss the soup?']],
  'nx-tumbler-a': [
    ['TUMBLER', 'whisper', 'Click. Click. Clunk.'], ['TUMBLER', 'normal', 'Every lock has a song. You just have to be quiet enough to hear it.'],
    ['TUMBLER', 'normal', 'This vault sings like a tired old frog.'], ['TUMBLER', 'laugh', 'Do not tell Mr. Farthing I said that.']],
};
// NEW FOXES, extra solo rows for the record sheet (not ambient; for the tournament / boss rooms when Ben writes them in)
export const EXTRA = {
  'nx-lox-intro': [['LOX', 'shout', 'Meru calls THAT a champion?'], ['LOX', 'normal', 'In Luxor we fight with our paws. No lasers. No swords.'], ['LOX', 'laugh', 'Keep your sword, little soldier. You will need something to lean on.']],
  'nx-lox-fight': [['LOX', 'shout', 'Stand still!'], ['LOX', 'shout', 'Here I come!'], ['LOX', 'normal', 'Too slow.'], ['LOX', 'sigh', 'My head. The arena is spinning.'], ['LOX', 'shout', 'Again!']],
  'nx-lox-lose': [['LOX', 'normal', 'Hm. You hit like a Luxor fox.'], ['LOX', 'normal', 'That is the nicest thing I have ever said. Do not get used to it.']],
  'nx-sumo': [['OYAKATA FOX', 'shout', 'HAKKEYOI!'], ['OYAKATA FOX', 'laugh', 'My belly has never lost a pushing match.'], ['OYAKATA FOX', 'normal', 'Salt first. Always salt first.']],
};
