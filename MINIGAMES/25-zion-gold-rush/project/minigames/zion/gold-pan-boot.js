// Loads the Gold Rush engine as a real module script (works on a Design canvas, where a page's dynamic import() has no file base) and hands it to the page.
import { createGoldPan } from './gold-pan.js';
window.__GoldPanCreate = createGoldPan;
window.dispatchEvent(new Event('goldpan-ready'));
