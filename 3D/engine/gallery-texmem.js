// Blind Canvas gallery: keeping drawn textures light on phones (22 Oct).
// Signs, cards, bio boards and title walls are drawn on canvases. Once a canvas has been uploaded to the GPU its pixels are not
// needed any more, so lean() shrinks the canvas to 1x1 right after the upload: the picture stays on screen, and the browser
// gets the memory back (iPhones stop drawing canvases once they total ~384 MB, then crash). Only for textures that are never
// redrawn afterwards. TEXMEM.scale draws them smaller on phones (still sharp on a phone screen).
export const TEXMEM = { scale: 1 };
export function lean(t) {
  if (!t || !t.image || !(t.image instanceof HTMLCanvasElement)) return t;
  t.onUpdate = () => { const c = t.image; if (c && c.width > 8) { t.userData.gpu = [c.width, c.height]; c.width = 1; c.height = 1; } t.onUpdate = null; };   // (gpu: the size it was uploaded at, for the memory checks)
  return t;
}
