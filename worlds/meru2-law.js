// MERU 2.0 — step 2c: the LAW + the BANK, as data on the shared save (engine/save.js). All amounts are DRAFT until Ben sets them.
// stats: meru2Day · meru2Fines [{why, amt, day}] · meru2Bank (gold) · meru2Locker {itemId: n} · meru2Jail {until, why, bail} · meru2Ledger [lines]
export const LAW = {
  fines: { fare: 20, path: 15, assault: 50, theft: 40, escape: 30 },          // offence → fine (gold)
  arrest: { assault: true, theft: true },                                     // these send you to jail instead of a fine slip
  why: { fare: 'Riding the train without a ticket', path: 'Driving on a foot path', assault: 'Hitting a townsfolk', theft: 'Stealing from a shop', escape: 'Breaking out of jail' },
  jailSecs: 90, bail: 60, interest: 0.02, staffInterest: 0.03, lockerSlots: 6, staffSlots: 6, draft: true,   // s80: bank staff perks (stats bkRate, bkSlots)
};
export function lawKit(save) {
  const day = () => save.stat('meru2Day', 1), list = k => (save.stat(k, null) || []).slice();
  const fines = () => list('meru2Fines'), owed = () => fines().reduce((s, f) => s + f.amt, 0), bank = () => save.stat('meru2Bank', 0);
  const log = t => { const l = list('meru2Ledger'); l.unshift('DAY ' + day() + ' · ' + t); save.setStat('meru2Ledger', l.slice(0, 12)); };
  // s81: the DEPUTY BADGE (police perk, stat pdDeputy) halves every new fine
  const fineOf = kind => { const a = LAW.fines[kind] || 0; return save.stat('pdDeputy', false) ? Math.ceil(a / 2) : a; };
  function addFine(kind) { const f = fines(), a = fineOf(kind); f.push({ why: kind, amt: a, day: day() }); save.setStat('meru2Fines', f); return a; }
  // pay what you can from gold first, then the bank takes the rest
  function payFines() { let left = owed(); if (!left) return 0; const g = Math.min(save.data.gold, left); if (g) save.spend(g); left -= g; const b = Math.min(bank(), left); if (b) save.setStat('meru2Bank', bank() - b); left -= b;
    const paid = owed() - left; save.setStat('meru2Fines', left ? [{ why: 'balance', amt: left, day: day() }] : []); if (paid) log('Paid fines ' + paid + ' gold'); return paid; }
  function deposit(n) { n = Math.min(n, save.data.gold); if (n <= 0 || !save.spend(n)) return 0; save.setStat('meru2Bank', bank() + n); log('Deposit ' + n); return n; }
  function withdraw(n) { n = Math.min(n, bank()); if (n <= 0) return 0; save.setStat('meru2Bank', bank() - n); save.addGold(n); log('Withdraw ' + n); return n; }
  const locker = () => ({ ...(save.stat('meru2Locker', null) || {}) });
  const rate = () => (save.stat('bkRate', false) ? LAW.staffInterest : LAW.interest), slots = () => LAW.lockerSlots + (save.stat('bkSlots', false) ? LAW.staffSlots : 0);
  function store(id, n = 1) { const L0 = locker(); if (!L0[id] && Object.keys(L0).length >= slots()) return false; if (!save.take(id, n)) return false; const L = locker(); L[id] = (L[id] || 0) + n; save.setStat('meru2Locker', L); return true; }
  function takeOut(id, n = 1) { const L = locker(); if ((L[id] || 0) < n) return false; L[id] -= n; if (!L[id]) delete L[id]; save.setStat('meru2Locker', L); save.give(id, n); return true; }
  // a new in-game day: interest on the bank, unpaid fines come out of the bank
  function nextDay() { save.setStat('meru2Day', day() + 1); const b = bank(), i = Math.floor(b * rate()); if (i > 0) { save.setStat('meru2Bank', b + i); log('Interest +' + i); }
    let left = owed(); if (left) { const t = Math.min(bank(), left); if (t) { save.setStat('meru2Bank', bank() - t); left -= t; log('Unpaid fines taken from the bank ' + t); } save.setStat('meru2Fines', left ? [{ why: 'balance', amt: left, day: day() }] : []); } return day(); }
  const jail = () => save.stat('meru2Jail', null);
  function jailUp(kind) { addFine(kind); save.setStat('meru2Jail', { left: LAW.jailSecs, why: kind, bail: LAW.bail }); }
  // s81: FREE BAIL once a day (police perk, stat pdBail; pdBailDay = the day it was used)
  const freeBail = () => !!save.stat('pdBail', false) && save.stat('pdBailDay', 0) !== day();
  function bail() { const J = jail(); if (!J) return false; if (freeBail()) { save.setStat('pdBailDay', day()); log('Free bail (police staff)'); save.setStat('meru2Jail', null); return true; } if (save.data.gold >= J.bail) save.spend(J.bail); else if (save.data.gold + bank() >= J.bail) { const g = save.data.gold; save.spend(g); save.setStat('meru2Bank', bank() - (J.bail - g)); } else return false; log('Bail ' + J.bail); save.setStat('meru2Jail', null); return true; }
  const release = () => save.setStat('meru2Jail', null);
  return { day, fines, owed, bank, addFine, payFines, deposit, withdraw, locker, store, takeOut, nextDay, jail, jailUp, bail, release, ledger: () => list('meru2Ledger'), rate, slots, fineOf, freeBail };
}
