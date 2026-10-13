# Art Alive

Point your phone. Watch any image come alive.

Live at https://blindbenfilms.github.io/FOXgate8/ART-ALIVE/

Made by the Blind Canvas Project and Able Art Alliance.

---

## Before launch: three settings

Open `site-config.js` in Notepad, fill in the blanks between the quote marks, and save. Every page reads this one file.

1. **Waitlist and contact forms.** Make a free account at https://formspree.io, choose New form, and copy its address (it looks like `https://formspree.io/f/abcdwxyz`). Paste it into `formEndpoint`. Every sign-up and message then arrives in your email. Until you do this, the forms say "not connected yet" and send nothing.
2. **Public email (optional).** Put an address in `contactEmail` to show it on the contact page. Leave it empty to keep your email off the site.
3. **Visitor counting (optional).** Make a free account at https://www.goatcounter.com (no cookies, no banner needed). If your dashboard is `artalive.goatcounter.com`, type `artalive` into `goatcounter`. It counts page views plus these moments in the demo: camera started, watched without the camera, shape found, and forms sent.

Then in GitHub Desktop: write a short summary, click **Commit to main**, then **Push origin**. Changes are live in a minute or two.

## Launch checklist

- [ ] Fill in `site-config.js` (above), push, then send yourself a test sign-up.
- [ ] Open the demo on your phone and point it at a TV, a poster and a sheet of paper.
- [ ] Print the letter-size poster (`print/art-alive-poster-letter.pdf`) and scan its QR code.
- [ ] Paste the home page link into a message to yourself and check the preview image shows.
- [ ] Confirm you have the rights to every painting and video used on the site.
- [ ] Check the name: other apps already use "Art Alive" (see below).

## What's where

| File or folder | What it is |
| --- | --- |
| `index.html` | Home page |
| `for-*.html` | For Creators, Galleries, Businesses and Everyone |
| `about.html`, `contact.html`, `privacy.html` | About, contact form, privacy notice |
| `signup.html`, `login.html` | Waitlist sign-up; log-in placeholder until accounts open |
| `presskit.html` | Logos, videos, printables and ready-to-post captions |
| `demo/` | The camera demo ("See it now") |
| `studio/` | The Living Painting Studio ("Create your own") |
| `games/` | The Game Maker: turn a painting into a game with your voice |
| `gallery.html`, `play/` | The Gallery page and its playable example games |
| `how-to.html`, `howto/` | How to make one, with step-by-step pictures |
| `voice/` | Your Chatterbox voice files and the script that makes them |
| `capture.js` | Take photo, crop and record tools used by the studio and Game Maker |
| `print/` | Printable PDFs: posters, coaster, sticker, table card |
| `site.css` | Look and layout for every page |
| `site-config.js` | Your settings (the only file you need to edit) |
| `site.js` | Counting and forms; no need to edit |

## Your own voice (Chatterbox)

Every fixed line the site speaks (the camera help and the example games) can play in your cloned voice instead of the computer voice.

1. Put a clean 10-20 second recording of your voice in the `voice` folder, named `my-voice.wav`.
2. Open a terminal in `voice` and run `python make_voice.py` (use the Python where Chatterbox is installed).
3. Commit and push. Any line without a file keeps the computer voice, so you can do it a few at a time.

Made the files another way? Name them as in `voice/voice-lines.csv` (for example `camera-03.mp3`), put them in `voice`, and run `python make_voice.py --index`.

## Moving to its own address later

The site works anywhere because every link is relative.

1. In GitHub, make a new repository (for example `art-alive`) and copy everything in this folder into it.
2. In that repository: Settings → Pages → Deploy from branch → `main`, folder `/ (root)`.
3. To use your own domain, buy it (for example artalive.app), type it in Settings → Pages → Custom domain, and add the DNS records GitHub shows you at your domain seller. Tick **Enforce HTTPS**.
4. Update the old address where it appears: search the files for `blindbenfilms.github.io/FOXgate8/ART-ALIVE` and replace it. It's in the link-preview tags, the QR codes and the press kit. The printable PDFs need new QR codes, so ask Claude to remake them.
5. Leave a short page at the old address that links to the new one.

## The name

At least two apps already use the name "Art Alive":

- An App Store app called "Art Alive" (AI image-to-art), released May 2025.
- "Faber-Castell ARt Alive", an AR colouring app from 2023.

Neither stops you from using it, but a trademark search (or a quick chat with a lawyer) before printing lots of material is worth it.
