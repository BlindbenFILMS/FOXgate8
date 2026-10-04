# Blind Canvas AR

No-download augmented reality for artwork. Visitors scan a QR code, the page opens in their phone browser, they point the camera at the painting, and it comes alive and describes itself aloud.

- **index.html**: the AR viewer. Each artwork has its own link: `.../AR/?art=<id>`
- **add.html**: turns a photo of an artwork into a tracking file, tap-to-hear spots, and a QR code
- **artworks.js**: the list of artworks: titles, descriptions, overlays, and spots
- **targets/**: tracking files (`.mind`) and photos for each artwork
- **lib/**: MindAR (image tracking) and Three.js (3D), stored here so the site never depends on another server

Works in Safari on iPhone and Chrome on Android. Phones only allow camera access over https, which GitHub Pages provides.

Test it: open `targets/fox-at-dusk.jpg` on a computer screen, then open `.../AR/` on a phone and point the phone at the screen.
