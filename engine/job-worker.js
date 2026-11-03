// s637 JOB WORKER (Ben: "do animations for all the listed above"): Meru's jobs used to HIDE your fox while you worked. jobWorker(THREE)
// returns JW(fox, jobKey): call it instead of fox.visible = false. Your fox stays where you started the job (the yellow ring), turns to the
// work, and does a move that fits the job name (WORK_BY: mop, shelve, till, grill, knead, hammer, paint, water, skim, fold, carry, pump,
// photo, binoculars, ladder, hose, dishes, cards, snips …; else BUSY HANDS). If it would block the camera's view of the work it hides
// (cut-off: within 0.6 m of the camera's line and in front of what it looks at). The walk calls jwEnd(fox) each frame: no JW call for
// 0.25 s = endPose. window.__m2cam is the walk's camera.
import { applyD, applyPose, endPose, workD, lifeD, FOX_ANIMS } from './fox-poses.js?v=s648k';
const WORK_BY = [[/mop|spill|clean|scrub/, 'w:mop'], [/sweep|leaf|leaves/, 'w:sweep'], [/shelf|stock|arrange|produce|flyer|deli|display|restock|price/, 'w:shelve'], [/till|register|cash|checkin|check-in|desk|count|bank|ticket|order|receipt/, 'w_till'],
  [/grill|burger|flip|fry|cook|kitchen/, 'grill_flip'], [/pie|dough|knead|bake|bread|oven/, 'k_knead'], [/shave|trim|cut|style|hair|snip|barber/, 'k_snip'], [/dish|wash|sink|glass/, 'w_dishes'], [/photo|camera|picture|news|report/, 'w_photo'],
  [/fix|repair|\bice\b|machine|engine|tune|forge|anvil|smith|sharpen|build|nail/, 'w:hammer'], [/paint|sign|mural/, 'w:paint'], [/water|plant|garden|flower|seed|crop/, 'w:water'], [/pool|skim|net|fish|bait|lake/, 'w:skim'],
  [/laundry|fold|towel|sheet|cloth|tailor|sew|measure/, 'w:fold'], [/tray|service|carry|luggage|box|crate|deliver|mail|post|parcel|bag/, 'w:carry'], [/pump|fuel|gas|tank|tyre|tire/, 'w:pump'], [/spot|look|watch|binoc|bird|tag|weigh|survey/, 'w:binocs'],
  [/chand|ladder|lamp|light|window/, 'w_ladder'], [/hose|fire/, 'w:hose'], [/card|deal|poker|chip|roulette|dice/, 'c_deal'], [/polish|shine|armou?r|shield/, 'ball_polish'], [/book|library|file|record|permit|form/, 'k_clipboard'], [/dig|ruin|fossil|brush/, 'w:sweep'], [/drill|march|guard/, 'salute'], [/lane|pin|shoe/, 'shoe_desk']];
// s638: every Meru job key → its own move (checked against each module's GAMES list); the word rules above are the fallback
const JOB_MOVE = { bunks: 'w_bed', armour: 'ball_polish', mess: 'k_stir', braziers: 'w_ladder', guard: 'salute', inspect: 'k_clipboard', sharpen: 'w:hammer', arrows: 'w:carry', rack: 'w:shelve', dummies: 'w:fold', drill: 'salute',
  fuel: 'w:pump', knots: 'w:fold', jackets: 'w:fold', scrub: 'w:mop', paint: 'w:paint', lawn: 'w_mow', steps: 'w:sweep', bins: 'w:carry', mail: 'w:carry',
  forge: 'w:hammer', polish: 'ball_polish', restock: 'w:shelve', fit: 'k_measure', repair: 'w:hammer', range: 'w:busy', order: 'w_till',
  list: 'k_clipboard', price: 'w:shelve', checkout: 'w_till', produce: 'w:shelve', carts: 'w:carry', deli: 'w:busy', spill: 'w:mop', freezer: 'w:shelve', flyer: 'w:busy',
  pot: 'w:busy', cases: 'ball_polish', brush: 'w:sweep', sort: 'w:shelve', appraise: 'k_inspect', mosaic: 'w:busy', watch: 'w:binocs', catalogue: 'k_clipboard', dig: 'w:sweep', rub: 'w:busy',
  stamp: 'w:hammer', file: 'k_clipboard', forged: 'k_inspect', map: 'k_inspect', survey: 'w:binocs', theo: 'w:binocs', deliver: 'w:carry',
  shoes: 'shoe_desk', oil: 'w:mop', unjam: 'w:hammer', ret: 'w:hammer', cards: 'c_shuffle', slots: 'w:hammer', cage: 'k_count', vac: 'w:mop',
  cond: 'w:shelve', dish: 'w_dishes', mop: 'w:mop', throne: 'ball_polish', carpet: 'w:sweep', announce: 'k_clipboard', chand: 'w_ladder', council: 'w:shelve', warmap: 'k_inspect', shelve: 'w:shelve', lost: 'browse_look',
  checkin: 'w_till', beds: 'w_bed', service: 'w:carry', ice: 'w:hammer', pool: 'w:skim', luggage: 'w:carry', night: 'k_type', laundry: 'w:fold' };
export function workFor(key = '') { const raw = String(key), last = raw.split(' ').pop(); if (JOB_MOVE[raw]) return JOB_MOVE[raw]; if (JOB_MOVE[last]) return JOB_MOVE[last]; const s = raw.toLowerCase(); for (const [re, a] of WORK_BY) if (re.test(s)) return a; return 'w:busy'; }
export function jobWorker(THREE) { const V = new THREE.Vector3(), V2 = new THREE.Vector3(), DIR = new THREE.Vector3();
  return function JW(fox, key, look) { if (!fox || !fox.userData || !fox.userData.P || !fox.userData.P.fore) { if (fox) fox.visible = false; return; }
    const u = fox.userData, cam = window.__m2cam, now = performance.now() / 1000; u._jwT = performance.now(); if (!u._jw || u._jwK !== key) { u._jw = 1; u._jwK = key; u._jwS = now; u._jwA = workFor(key); }
    fox.visible = true; const t = now - u._jwS;
    if (cam) { cam.getWorldDirection(DIR); const tgt = look || V2.copy(cam.position).addScaledVector(DIR, 3); let yaw = Math.atan2(tgt.x - fox.position.x, tgt.z - fox.position.z); if (!look) yaw = Math.atan2(DIR.x, DIR.z); fox.rotation.y = yaw;
      fox.getWorldPosition(V); V.y += 1.0; V.sub(cam.position); const along = V.dot(DIR), perp = V.clone().addScaledVector(DIR, -along).length(); if (along > 0 && along < 4 && perp < 0.6) { fox.visible = false; return; } }
    const a = u._jwA; try { if (a.startsWith('w:')) applyD(THREE, fox, workD(a.slice(2), t), t, Math.min(1, t * 3)); else if (FOX_ANIMS[a]) applyPose(THREE, fox, a, t, Math.min(1, t * 3)); else applyD(THREE, fox, workD('busy', t), t, 1); } catch (e) {} }; }
export function jwEnd(fox) { const u = fox && fox.userData; if (u && u._jw && performance.now() - (u._jwT || 0) > 250) { u._jw = 0; u._jwK = null; endPose(fox); } }
