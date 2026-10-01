// MERU — world data. The engine reads this; rooms keep the 2D game's bracket names.
import { smooth, fbm } from '../village-game.js';
import { treeFromLinear } from '../engine/story.js';

// ---------- the map, in the 2D art's own pixels (2880 x 1620) ----------
const MW = 80, S = MW / 2880, MH = 1620 * S;            // 80 m x 45 m
const AX = a => (a - 1440) * S, AZ = a => (a - 810) * S;
const SRC_Y = 1620 / 2880;                               // walk rows + patrols are in a 2880-square space
const toArt = (X, Z) => [X / S + 1440, Z / S + 810];

const BUILDINGS = [
  { key: 'casino', label: 'Casino', x0: 370, x1: 910, y0: 180, y1: 640, face: 'S', door: 725 },
  { key: 'tavern', label: 'Tavern', x0: 1990, x1: 2520, y0: 180, y1: 640, face: 'S', door: 2150 },
  { key: 'itemshop', label: 'Item Shop', x0: 560, x1: 940, y0: 1190, y1: 1520, face: 'N', door: 761 },
  { key: 'bowling', label: 'Meru Lanes', x0: 1620, x1: 1950, y0: 1200, y1: 1500, face: 'N', door: 1786 },
  { key: 'armory', label: 'Armory', x0: 2100, x1: 2560, y0: 1190, y1: 1500, face: 'N', door: 2188 },
  { key: 'fortune', label: 'Fortune Teller', cx: 1120, cy: 1360, r: 140, face: 'N', door: 1121 },
];
const ARENA_C = { x: 80, z: 0, r: 24 };
const EXITS = [
  { label: 'Castle Path', ax: 1440, ay: 40 }, { label: 'South Gate', ax: 1440, ay: 1580 },
  { label: 'Ruins Path', ax: 40, ay: 810 }, { label: 'Meru Arena', ax: 2840, ay: 810, go: 'Meru Arena.dc.html' },
];
const FOXES = [
  { key: 'hope', name: 'Hope', role: 'Best friend', outfit: 'dress', female: true, torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', glasses: true, cane: true, path: [[1480, 2560], [1480, 390]], speed: 1.5 },
  { key: 'noble', name: 'Noble', role: 'The protector', outfit: 'vest', torso: ['#e7edf4', '#38506e', '#1e293b'], crest: '8', chair: true, path: [[1400, 390], [1400, 2560]], speed: 1.1 },
  { key: 'ulric', name: 'Ulric', role: 'Ur\'s advisor', outfit: 'robe', torso: ['#fdba74', '#b45309', '#7c2d12'], crest: 'U', path: [[400, 1516], [2600, 1516]], speed: 1.0 },
  { key: 'grand', name: 'Grand', role: 'Gaya\'s commander', outfit: 'coat', torso: ['#a78bfa', '#5b21b6', '#2e1065'], crest: 'G', path: [[300, 1308], [2500, 1308]], speed: 1.4 },
  { key: 'james', name: 'Jamos', role: 'Jidda\'s general', outfit: 'coat', torso: ['#93c5fd', '#1e3a8a', '#0f172a'], crest: 'J', path: [[350, 1724], [2550, 1724]], speed: 1.2 },
  { key: 'lucius', name: 'Lucius', role: 'Luxor\'s second', outfit: 'suit', torso: ['#fca5a5', '#991b1b', '#450a0a'], crest: 'L', stand: [1036, 1140] },
  { key: 'jon', name: 'Job', role: 'Jidda', outfit: 'vest', torso: ['#bfdbfe', '#2563eb', '#1e3a8a'], crest: 'J', stand: [2572, 1412] },
];
const DIALOGUE = {
  hope: [{who:'player',text:'Are you enjoying the gala at all, Hope?'}, {who:'npc',text:'Enjoying it? I am sweating through my dress uniform! Look at the security. Fighter-class ships blot out the Sphere.'},{who:'npc',text:'Keep your eyes open.'}, {who:'player',text:'Have you heard the rumors about a Casino on Meru?'}, {who:'npc',text:'Shh! Lower your voice! The cargo crews whisper about it, yes. Fortunes won and lost below, while the King toasts.'},{who:'npc',text:'Do not go looking tonight.'}],
  noble: [{who:'player',text:'How does the perimeter look, Noble?'}, {who:'npc',text:'Tense, Ruler. Luxor\u0027s guards track us with heavy scanners. My shielding arrays will absorb any kinetic fire.'},{who:'npc',text:'Stay behind me.'}, {who:'player',text:'Do you see any signs of royal GODrock weapons on the guards?'}, {who:'npc',text:'Affirmative. Their sidearms carry refined GODrock gems. The energy signatures are astronomical. Do not provoke them.'}],
  lucius: [{who:'player',text:'Is Luxor preparing for an invasion?'}, {who:'npc',text:'Invasion is a crude word, young Steward. We prefer strategic realignment.'},{who:'npc',text:'Leave your borders unguarded and our Gunners move in.'}, {who:'player',text:'Why does Luxor follow Meru so closely?'}, {who:'npc',text:'King Might woke the eight gates we travel by. He holds the secrets of life and technology.'},{who:'npc',text:'Aligning with Meru is not submission. It is sense.'}],
  ulric: [{who:'player',text:'Is it true that Ur is running rogue border raids?'}, {who:'npc',text:'A logical commander tests his neighbours. Weak borders invite the strike. That is your failing, not our malice.'},{who:'npc',text:'Keep your fleet sharp, young Steward.'}, {who:'player',text:'Do you believe Zion caused your planet\'s disaster on purpose?'}, {who:'npc',text:'The data points at their research facility. Sabotage or incompetence. The graves are the same size. They pay either way.'}],
  grand: [{who:'player',text:'What did you think of the Player\'s father, Grand?'}, {who:'npc',text:'He was a good man, and a brilliant Steward. Far too trusting. This galaxy eats fair-minded foxes alive.'},{who:'npc',text:'Do not make his mistakes, child.'}, {who:'player',text:'Do you think King Might can keep the peace much longer?'}, {who:'npc',text:'Might is a brilliant old fool, rotting from the inside. He built a beautiful cage, that Sphere of his.'},{who:'npc',text:'Cages shatter when the beast inside outgrows them. Watch your back.'}],
  james: [{who:'player',text:'How do you coordinate defense with Nebo, General Jamos?'}, {who:'npc',text:'Nash and I hold a strict cross-border defence pact. We stay out of the centre hub politics.'},{who:'npc',text:'Our joint Stations wall off the bottom of the map.'}, {who:'player',text:'Are you related to King Might\'s bloodline?'}, {who:'npc',text:'No. I am Jest\u0027s half-brother, outside the royal line. I do not care about GODrock or titles.'},{who:'npc',text:'I care about the soldiers under my command.'}],
  jon: [{who:'player',text:'You seem very dedicated to your people, Job.'}, {who:'npc',text:'Family and our citizens are everything to me. If Meru or Luxor burn the galaxy... I will fly our Colony Ship into the dark.'},{who:'npc',text:'Or die making sure our people get out.'}, {who:'player',text:'Do you hope to find the mythical 10th Gate?'}, {who:'npc',text:'It is my dream! If Earth exists, and our spirits can dance there... away from all this warfare...'},{who:'npc',text:'...then finding it is the highest calling there is.'}],
};

// paved / built areas in art px — kept clear of trees
const PAVED = [[330, 2550, 430, 1190], [430, 2550, 1190, 1470], [1290, 1590, -3000, 430], [1290, 1590, 1190, 5000], [-5000, 330, 660, 960], [2550, 8000, 660, 960]];
function inPaved(ax, ay, m = 0) {
  for (const [x0, x1, y0, y1] of PAVED) if (ax > x0 - m && ax < x1 + m && ay > y0 - m && ay < y1 + m) return true;
  for (const b of BUILDINGS) { if (b.r) { if (Math.hypot(ax - b.cx, ay - b.cy) < b.r + m) return true; } else if (ax > b.x0 - m && ax < b.x1 + m && ay > b.y0 - m && ay < b.y1 + m) return true; }
  return false;
}
const outsideDist = (X, Z) => Math.hypot(Math.max(0, Math.abs(X) - MW / 2), Math.max(0, Math.abs(Z) - MH / 2));
function heightAt(X, Z) {
  const d = outsideDist(X, Z); if (d <= 0) return 0;
  let h = smooth(1, 26, d) * (2 + 14 * fbm(X * 0.03 + 4, Z * 0.03 + 9)) + smooth(30, 90, d) * 22 * fbm(X * 0.015 + 2, Z * 0.015);
  h *= smooth(4.6, 11, Math.min(Math.abs(X), Math.abs(Z)));
  return h * smooth(ARENA_C.r + 2, ARENA_C.r + 14, Math.hypot(X - ARENA_C.x, Z - ARENA_C.z));
}

// Zones of the one outdoor map (art px; the square is 0..2880 x 0..1620). First match wins.
// Paths from the 2D game become zones here; the label follows the player.
const ZONES = [
  { key: 'meruTown', label: 'Town Square', x0: 0, x1: 2880, y0: 0, y1: 1620 },
  { key: 'meruArena', label: 'Arena Path', x0: 2880, x1: 99999, y0: -99999, y1: 99999 },
  { key: 'meruThronePath', label: 'Castle Path', x0: -99999, x1: 99999, y0: -99999, y1: 0 },
  { key: 'meruRuins', label: 'Ruins Path', x0: -99999, x1: 0, y0: -99999, y1: 99999 },
  { key: 'meruLake', label: 'Lake', x0: -99999, x1: 99999, y0: 1620, y1: 99999 },
];
const INTERIORS = { tavern: { key: 'meruTavern', label: 'Tavern' }, casino: { key: 'meruCasino', label: 'Casino' } };
function zoneAt(ax, ay) { return ZONES.find(z => ax >= z.x0 && ax < z.x1 && ay >= z.y0 && ay < z.y1) || ZONES[0]; }

// The 2D guide card for Meru, verbatim (surface_meru.html, THE GUIDE)
const QUEST = {
  title: 'MERU', allDone: 'Meru is done with you. The way on is wherever you left the ship.',
  steps: [
    { id: 'arena', text: 'Go EAST to ARENA, talk to KING MIGHT', at: 'meruArenaInterior', who: 'arenaGateGuard', done: 'tournamentEntered' },
    { id: 'tourn', text: 'WIN the TOURNAMENT', at: 'meruArenaInterior', done: 'tournamentWon' },
    { id: 'findmax', text: 'Search the RUINS for PRINCE MAX', at: 'meruRuinsInterior', who: 'max', done: 'maxFreed' },
    { id: 'readymax', text: 'Tell MAX you are ready to go', at: 'meruRuinsInterior', who: 'max', done: 'maxFollowing' },
    { id: 'castle', text: 'Take MAX NORTH to the CASTLE', at: 'meruThroneroom', done: 'maxHome' },
  ],
};

// Talk trees: each NPC's questions become a choice menu (no lines reworded)
const TALK = Object.fromEntries(Object.entries(DIALOGUE).map(([k, v]) => [k, treeFromLinear(v)]));

// The world's original minigames, extracted to minigames/meru/<key>.html
const MINIGAMES = { slotFox: 'casino/slotFox.html', slot1: 'casino/slot1.html', slot3: 'casino/slot3.html', wheel: 'casino/wheel.html', poker5: 'casino/poker5.html', pokerTexas: 'casino/pokerTexas.html',
  darts: 'minigames/meru/darts.html', jukebox: 'minigames/meru/jukebox.html', tenpin: 'minigames/meru/tenpin.html', diner: 'minigames/meru/diner.html', duneglass: 'minigames/meru/duneglass.html', defender: 'minigames/meru/defender.html', diving: 'minigames/meru/diving.html', fishing: 'minigames/meru/fishing.html' };

export { MW, S, MH, AX, AZ, SRC_Y, toArt, BUILDINGS, ARENA_C, EXITS, FOXES, DIALOGUE, PAVED, inPaved, outsideDist, heightAt, ZONES, INTERIORS, zoneAt, QUEST, TALK, MINIGAMES };
