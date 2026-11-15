// (13 Nov, gallery chat) a silent stand-in for the game's fighter sounds: the gallery's foxes carry no swords or lasers, and the real
// file downloads every fighter sound (76 files, not in this folder) the moment it loads. fighter-gear.js only calls SFX.play / loopStart / loopStop / loopLevel.
export const SFX_EVENTS = [];
export const SFX = { play() {}, loopStart() {}, loopStop() {}, loopLevel() {}, unlock() {}, setVolume() {} };
export const ROBOTS_SFX = [];
export const SLOT_LABEL = {};
export const botKey = () => null;
