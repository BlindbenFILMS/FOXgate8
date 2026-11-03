// 8 GATES — ARCADE · SLOTS: open the game from any world [arcadeSlots].
// const s = openSlots({ onOpen: () => world.pause(), onClose: info => world.resume() });   s.close() to force-close.
// Lays the game over the whole screen (Arcade Slots.dc.html?embed=1). The game itself spends and pays gold through engine/save.js.
export function openSlots({ base = document.baseURI, mount = document.body, page = 'Arcade Slots.dc.html', room = '', onOpen, onClose } = {}) {
  const wrap = document.createElement('div'); wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex';
  const f = document.createElement('iframe'); f.title = 'Slot machine'; f.allow = 'autoplay; screen-wake-lock; fullscreen; clipboard-write; web-share';
  f.style.cssText = 'border:0;flex:1;width:100%;height:100%;display:block;background:#000';
  const u = new URL(page, base); u.searchParams.set('embed', '1'); if (room) u.searchParams.set('room', room); f.src = u.href;
  wrap.appendChild(f); mount.appendChild(wrap); f.addEventListener('load', () => { try { f.focus(); } catch (e) {} });
  let open = true;
  const onMsg = e => { if (e.source !== f.contentWindow) return; const d = e.data; if (d && d.type === '8g:minigame' && d.game === 'arcadeSlots' && d.action === 'close') { close(); onClose && onClose(d); } };
  addEventListener('message', onMsg);
  function close() { if (!open) return; open = false; removeEventListener('message', onMsg); wrap.remove(); try { window.__8G_SAVE && window.__8G_SAVE.reload && window.__8G_SAVE.reload(); } catch (e) {} }
  onOpen && onOpen();
  return { close, frame: f, get open() { return open; } };
}
