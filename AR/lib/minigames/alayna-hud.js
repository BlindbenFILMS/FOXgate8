// Alayna Lopez's three games share this screen layout: a slim score panel pinned to the very top, and messages that show slim,
// over that panel, so nothing ever covers the painting (or Alayna in it). Added in start(), removed in stop().
export function slimHud() {
  const st = document.createElement('style'); st.dataset.alayna = '1';
  st.textContent = '.mgk.mgk-count{top:auto!important;bottom:calc(152px + env(safe-area-inset-bottom))!important}' +
    '.mgk.mgk-alert{top:calc(8px + env(safe-area-inset-top))!important;bottom:auto!important;padding:8px 14px 10px!important}.mgk-alert .t{font-size:clamp(20px,6vw,28px)!important}.mgk-alert .s{font-size:15px!important;margin-top:3px!important}' +
    '.mgk.mgk-panel{top:calc(10px + env(safe-area-inset-top))!important;padding:8px 16px 9px!important;border-bottom-width:6px!important}.mgk-panel .mgk-v{font-size:clamp(20px,6vw,26px)!important;margin-top:4px!important}.mgk-panel .mgk-segs{height:8px!important;margin-top:7px!important}' +
    '.mgk-end .cells b{font-size:11px!important;letter-spacing:.1em!important}.mgk-end .cells span{font-size:clamp(22px,7vw,38px)!important}' +
    '.mgk.mgk-pop{white-space:nowrap}';
  document.head.appendChild(st); return st;
}
