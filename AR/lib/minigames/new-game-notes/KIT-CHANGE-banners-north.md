# KIT CHANGE for ALL games: info banners sit NORTH of the painting (Ben, 5 Nov)
Asked by Ben in the April & Melissa polish chat: "move the info banner to be north of the image, do this for all games."
The main chat applies this to AR/lib/minigames/kit.js (polish chats don't edit kit.js). Tested with Picking Apples (roots-of-kinship): bot plays to the finale, no errors.

What it does:
- The start/round banner (G.ui.banner) is now the same size and place as the score panel (top slot), so it no longer hangs down over the painting.
- Alerts (G.ui.alert: "Round cleared", hints, etc.) also show in that top slot, same size, instead of over the middle of the painting.
  The score panel hides while an alert shows and comes back after (as it already did for banners).
- Nothing else changes; no game code needs touching.

Ready-to-apply diff (old kit.js 5 Nov snapshot  ->  new):
```diff
168,174c168,174
<   .mgk-banner{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));top:calc(66px + env(safe-area-inset-top));background:#000;border-bottom:8px solid ${RED};padding:14px 20px 18px}
<   .mgk-banner .t{font-size:clamp(32px,11vw,54px);line-height:.95;margin-top:8px}
<   .mgk-banner .s{font:700 clamp(16px,4.6vw,21px)/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;margin-top:10px;color:#fff}
<   .mgk-alert{left:calc(12px + env(safe-area-inset-left));right:calc(18px + env(safe-area-inset-right));top:calc(196px + env(safe-area-inset-top));background:${RED};border:3px solid #000;box-shadow:6px 6px 0 #000;padding:12px 18px 14px}
<   .mgk-alert.blue{background:${BLUE}} .mgk-alert.black{background:#000;border-color:#fff;box-shadow:6px 6px 0 ${RED}}
<   .mgk-alert .t{font-size:clamp(26px,8.6vw,42px);line-height:.98}
<   .mgk-alert .s{font:700 17px/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;margin-top:6px}
---
>   .mgk-banner{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));top:calc(66px + env(safe-area-inset-top));background:#000;border-bottom:8px solid ${RED};padding:10px 16px 12px}
>   .mgk-banner .t{font-size:clamp(22px,7vw,34px);line-height:1.02;margin-top:6px}
>   .mgk-banner .s{font:700 15px/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;margin-top:6px;color:#fff}
>   .mgk-alert{left:calc(12px + env(safe-area-inset-left));right:calc(12px + env(safe-area-inset-right));top:calc(66px + env(safe-area-inset-top));background:${RED};border:3px solid #000;padding:10px 16px 12px;z-index:12}
>   .mgk-alert.blue{background:${BLUE}} .mgk-alert.black{background:#000;border-color:#fff;border-bottom:8px solid ${RED}}
>   .mgk-alert .t{font-size:clamp(22px,7vw,34px);line-height:1.02}
>   .mgk-alert .s{font:700 15px/1.3 'Atkinson Hyperlegible',Arial,sans-serif;text-transform:none;margin-top:6px}
199c199
<   @media (max-height:640px){.mgk-alert{top:calc(150px + env(safe-area-inset-top))}.mgk-count{top:calc(190px + env(safe-area-inset-top))}}
---
>   @media (max-height:640px){.mgk-count{top:calc(190px + env(safe-area-inset-top))}}
233c233
<       alertEl.style.display = 'block'; alertT = secs;
---
>       alertEl.style.display = 'block'; alertT = secs; if (panelEl) panelEl.style.visibility = 'hidden';
235c235
<     hideAlert() { if (alertEl) alertEl.style.display = 'none'; alertT = 0; },
---
>     hideAlert() { if (alertEl) alertEl.style.display = 'none'; alertT = 0; if (panelEl && !(bannerEl && bannerEl.style.display === 'block')) panelEl.style.visibility = ''; },
```
