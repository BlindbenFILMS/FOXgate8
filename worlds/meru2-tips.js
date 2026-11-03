// MERU 2.0 — s137 TIP-OFF HEADLINES: what the Salt + Pepper HQ jobs tipped off to the Meru Daily ('paper') or Meru Buzz ('buzz'),
// plus the VAX thread (storyVaxLocks from the VAX CEO scene, storyMfPatch from the Machine Fleet Director). Read by meru2-news.js + meru2-tabloid.js.
const SALT = { count: 'THE CASINO TAKE IS BIGGER THAN THE BOOKS SAY', cheat: 'THE SALT CASINO WATCHES EVERY TABLE', door: 'WHO GETS THROUGH THE SALT BACK DOOR', deliver: 'SALT PARCELS THAT ARE NOT SALT', books: 'THE SALTS KEEP TWO BOOKS' };
const PEPPER = { rent: 'PEPPER RENT GOES UP EVERY WEEK', lock: 'THE PEPPERS TEACH LOCKPICKING', keys: 'PEPPER KEY CUTTERS COPY ANY KEY', lost: 'PEPPER LOST PROPERTY IS FULL OF POCKETS' };
export function tipHeadlines(save, who) { const out = [];
  for (const [ls, tl, H] of [['storySaltTips', 'sfhTold', SALT], ['storyPepperTips', 'pfhTold', PEPPER]]) { const list = save.stat(ls, null) || [], told = save.stat(tl, null) || {};
    for (const g of list) if (told[g] === who && H[g]) out.push(who === 'buzz' ? H[g] + '!' : H[g]); }
  return out; }
export function vaxHeadline(save, who) {
  if (save.stat('storyMfPatch', false)) return who === 'buzz' ? 'ROBOT RIOT: WAS IT A VAX UPDATE?!' : 'FACTORY FAULT TRACED TO AN OUTSIDE PATCH';
  if (save.stat('storyVaxLocks', false)) return who === 'buzz' ? 'LOCK SALES BOOM AS BANDITS ROAM. HMM!' : 'WHO SELLS THE LOCKS TO BOTH FAMILIES?';
  return null; }
const crateHeadline = (save, who) => save.stat('storyWoodCrates', false) ? (who === 'buzz' ? 'SECRET CRATES! WHAT IS VAX HIDING?!' : 'WOODSHOP BUILT FALSE-BOTTOM CRATES FOR VAX') : null;   // s138
const lockHeadline = (save, who) => save.stat('storyDumpLocks', false) ? (who === 'buzz' ? 'HUNDREDS OF PICKED VAX LOCKS AT THE DUMP!' : 'PICKED VAX LOCKS PILE UP AT THE TOWN DUMP') : null;   // s139
const camHeadline = (save, who) => save.stat('storyGalleryCams', false) ? (who === 'buzz' ? 'SPY PAINTINGS! IS VAX WATCHING BOTH FAMILIES?!' : 'VAX GIFT PAINTINGS HIDE TINY CAMERAS') : null;   // s140
const feeHeadline = (save, who) => save.stat('storyOfficeFees', false) ? (who === 'buzz' ? 'ONE LAWYER, TWO FAMILIES, ONE PAYER: VAX?!' : 'VAX PAYS THE LAWYER FOR BOTH FAMILIES') : null;   // s141
const liftHeadline = (save, who) => save.stat('storyLakeLift', false) ? (who === 'buzz' ? 'WHY DOES THE LAKESIDE LIFT ONLY WORK ON TUESDAYS?!' : 'SALT CRATES RIDE THE LAKESIDE LIFT SHAFT TO THE LAKE') : null;   // s145
const botHeadline = (save, who) => save.stat('storySpireBots', false) ? (who === 'buzz' ? 'WHO IS WATCHING THE SPIRE AT NIGHT?! VAX BOTS!' : 'FREE NIGHT-WATCH BOTS AT SPIRE APARTMENTS CARRY VAX PLATES') : null;   // s146
const rentHeadline = (save, who) => save.stat('storyDecoRent', false) ? (who === 'buzz' ? 'WHO IS SKIMMING PEPPER RENT?! VAX!' : 'DECO RENT BOX HAS A SECOND SLOT: HALF GOES TO VAX') : null;   // s147
const loanHeadline = (save, who) => save.stat('storyGardenLoan', false) ? (who === 'buzz' ? 'VAX GOLD BOUGHT PEPPER AN ISLAND?!' : 'VAX LENT THE PEPPERS THE GOLD FOR GARDEN ISLAND') : null;   // s144
export function storyHeadlines(save, who) { const v = [vaxHeadline(save, who), crateHeadline(save, who), lockHeadline(save, who), camHeadline(save, who), feeHeadline(save, who), loanHeadline(save, who), liftHeadline(save, who), botHeadline(save, who), rentHeadline(save, who)].filter(Boolean), t = tipHeadlines(save, who); return [...v, ...t]; }
