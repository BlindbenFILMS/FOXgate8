// ─────────────────────────────────────────────────────────────
//  BLIND CANVAS AR: ARTWORK LIST
//  One entry per artwork. Each artwork gets its own link:
//     .../AR/?art=<id>
//  Make the .mind file and a ready-to-paste entry with add.html
// ─────────────────────────────────────────────────────────────
//
//  id           short name used in the link (letters, numbers, dashes)
//  title        artwork title (spoken and shown)
//  artist       artist name
//  target       the tracking file made by add.html  (targets/<id>.mind)
//  image        the photo of the artwork            (targets/<id>.jpg)
//  width/height size of that photo in pixels (sets the overlay shape)
//  description  audio description, read aloud when the art is found
//  narration    optional recorded audio (mp3/m4a) to play instead of
//               the read-aloud voice, e.g. 'media/fox-narration.mp3'
//  overlay      what appears on the artwork:
//                 { type: 'magic' }                       glow + sparkles
//                 { type: 'video', src: 'media/x.mp4' }   video over the art
//                 { type: 'image', src: 'media/x.png' }   picture over the art
//                 { type: 'story', anim, clip, audio }     the Blind Canvas layout: the animated art over the
//                   painting, a black title banner (TITLE / ARTIST) under it, and the artist's interview clip
//                   (with sound) under that. anim: muted looping video; clip: video with sound; audio: sound only
//  quote        the artist's words (shown as the caption while the clip plays)
//  hotspots     tap-to-hear spots, in photo pixels from the top-left:
//                 { name, x, y, r, label, glow: true/false, color: '#hex' }
//               name is the short button text; label is what's spoken
// ─────────────────────────────────────────────────────────────

export const ARTWORKS = [
  {
    id: 'fox-at-dusk',
    title: 'Fox at Dusk',
    artist: 'AR Test Canvas',
    target: 'targets/fox-at-dusk.mind',
    image: 'targets/fox-at-dusk.jpg',
    width: 900,
    height: 1200,
    description:
      'Fox at Dusk. A tall painting. A huge orange sun sets in the middle of the canvas, ' +
      'glowing yellow at its center, behind three layers of purple mountains that get darker toward the bottom. ' +
      'The sky above is deep navy blue, scattered with white and gold stars. ' +
      'At the bottom center, a bright orange fox with two tall pointed ears looks straight at you. ' +
      'It has small black eyes and a cream colored chin. ' +
      'Tiny shapes in yellow, sky blue, pink and green are scattered across the mountains like confetti. ' +
      'A border of yellow and blue dashes runs around the edge. ' +
      'Tap the screen on the sun or the fox to hear more.',
    narration: null,
    overlay: { type: 'magic' },
    hotspots: [
      { name: 'The sun', x: 450, y: 520, r: 220, glow: true, color: '#ffb347',
        label: 'The setting sun. A wide circle of warm orange, fading to pale yellow at its center.' },
      { name: 'The fox', x: 450, y: 990, r: 110, glow: false, color: '#ff8a3d',
        label: 'The fox. Orange, with tall pointed ears, black eyes, and a cream chin. It is looking right at you.' },
      { name: 'The title', x: 450, y: 110, r: 120, glow: false, color: '#ffffff',
        label: 'The title, Fox at Dusk, written in white capital letters across the top of the starry sky.' }
    ]
  },

  {
    id: 'harbor-light',
    title: 'Harbor Light',
    artist: 'AR Test Canvas 2',
    target: 'targets/harbor-light.mind',
    image: 'targets/harbor-light.jpg',
    width: 1200,
    height: 900,
    description:
      'Harbor Light. A wide painting of the sea. The top half is a sky of soft peach and cream stripes, ' +
      'with small dark gulls flying across it. The bottom half is deep blue water, covered in rows of white curling waves. ' +
      'On the left, a white lighthouse with four red bands and a yellow lamp at the top stands on a rocky gray brown shore. ' +
      'In the middle of the water, a sailboat with a brown hull, one red sail and one white sail, heads to the right. ' +
      'The title, Harbor Light, is written in dark letters in the top right corner.',
    narration: null,
    overlay: { type: 'magic' },
    hotspots: [
      { name: 'The lamp', x: 215, y: 280, r: 70, glow: true, color: '#ffe066',
        label: 'The lighthouse lamp. A small yellow window at the very top, under a dark pointed roof.' },
      { name: 'The lighthouse', x: 215, y: 470, r: 110, glow: false, color: '#ffffff',
        label: 'The lighthouse. Tall and white, with four red bands, standing on the rocks.' },
      { name: 'The sailboat', x: 650, y: 480, r: 170, glow: false, color: '#ffffff',
        label: 'The sailboat. A brown wooden hull, a red sail on the left and a bigger white sail on the right.' }
    ]
  }
,

  // ── the Blind Canvas Project artworks (story layout) ──
  {
    id: "5-weeks-on-my-side",
    title: "5 WEEKS ON MY SIDE",
    artist: "Ben Fox",
    target: 'targets/5-weeks-on-my-side.mind',
    image: 'targets/5-weeks-on-my-side.jpg',
    width: 576, height: 576,
    quote: "“I had the first of four eye surgeries at the age of 18. Docs put a gas bubble in my eye to hold stitches on my retina. If I moved my head the gas bubble could tear the stitches out. So for 5 weeks I was on 1 side, in bed and watching movies. Friends visited me often, and brought me every VHS tape they had. Watching movies with friends wondering about the future. Those were actually good times.” — Ben Fox",
    description: "5 WEEKS ON MY SIDE. By Ben Fox. \"I had the first of four eye surgeries at the age of 18. Docs put a gas bubble in my eye to hold stitches on my retina. If I moved my head the gas bubble could tear the stitches out. So FOR 5 WEEKS I WAS ON 1 SIDE, in bed and watching movies. / Friends visited me often, and brought me every VHS tape they had. Watching movies with friends wondering about the future. Those were actually good times.\" - BEN FOX \t\t\t\t\t\t\t\t/IMAGE DESCRIPTION/ Image shows a young man wearing an eye patch in bed with video tapes in large stacks all around him, tehre is a tv in the center of the image that says, \"Blind Canvas Project\".",
    overlay: { type: 'story', anim: null, clip: "media/clips/5-weeks-on-my-side.mp4", audio: null },
    hotspots: []
  },
  {
    id: "almost-blindness",
    title: "Almost Blindness",
    artist: "Ben Fox",
    target: 'targets/almost-blindness.mind',
    image: 'targets/almost-blindness.jpg',
    width: 1024, height: 1024,
    quote: "“It’s important to talk about almost blindness — about people on their journey to total blindness. You wake up one day; you saw yesterday the thing that you’re going to trip over this morning. The way you find out your vision dropped last night is your stubbed toe or your bloody shin.” — Ben Fox",
    description: "Almost Blindness. By Ben Fox. The image portrays a vast, swirling tunnel composed of dynamic, energetic brushstrokes. The colors transition from dark blues and blacks on the outer edges to vibrant, luminous shades of orange and yellow at the center. The brilliant center is both the focal point and the source of light in the painting. Tiny specks, possibly embers or sparks, can be observed within the whirlpool of colors, creating a sense of depth and motion. Standing at the forefront, a silhouetted figure representing Ben Fox is positioned facing the radiant center. His posture is upright but slightly leaning forward, as if being drawn towards the light as the world swirls around him. The swirling tunnel can be symbolic of the narrowing field of vision experienced by someone with Retinitis Pigmentosa (RP) — a degenerative eye disease characterized by the progressive loss of peripheral vision. The dark peripheries mirror the loss of side vision, while the luminous center symbolizes the remaining central vision that often persists for a longer period in those with the condition. The gradual transition from darkness to light illustrates the slow progression of the disease. The artwork not only captures the physical manifestation of retinitis pigmentosa but also portrays the emotional landscape of those affected — symbolizing resilience, Ben’s current level of vision, and the reality of impending blindness.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_almost_blindness.mp4", clip: "media/clips/almost-blindness.mp4", audio: null },
    hotspots: []
  },
  {
    id: "curating-hope",
    title: "Curating Hope",
    artist: "Ben Fox",
    target: 'targets/curating-hope.mind',
    image: 'targets/curating-hope.jpg',
    width: 1024, height: 1024,
    quote: "“It’s so important to curate hope together — to share it, and to take notice not just of what we’re doing right now, but of the fact that there’s enough human spirit left in us that we’re willing to pause for some things still today. And I am honored to know that blindness is a cause people still pause for.” — Ben Fox",
    description: "Curating Hope. By Ben Fox. The image features a magnificent, expansive tree as the central focal point. The branches stretch out to fill most of the canvas. The tree is divided visually into two distinct groupings of branches; one half is depicted in cool, calming shades of blue and purple, the other in warm hues of orange and yellow. This dramatic difference gives the impression of a split between night and day, blindness and sight. The leaves resemble shards or fragments, each painted with thick, expressive brushstrokes, creating a mosaic of color that swirls around the central trunk. Beneath the tree, the ground is richly textured with both cool and warm colors, reflecting the duality in the foliage. At the base, a line of silhouetted figures stands facing the viewer — a representation of the blind community and the importance of unity, support, and coming together to curate hope. The dichotomy of the tree symbolizes the challenges faced by those affected by blindness. The cool side might represent the difficulties and sometimes cold reception they receive from the sighted community. The warm side embodies the hope and potential that emerges when individuals, communities, and organizations come together to support and uplift. The figures united at the base signify the blind community and their allies. Their collective stance showcases the strength found in numbers — underscoring mentorship, guidance, and advocacy, and suggesting that together they can build a brighter, more inclusive future.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_curating_hope.mp4", clip: "media/clips/curating-hope.mp4", audio: null },
    hotspots: []
  },
  {
    id: "find-your-village",
    title: "Find Your Village",
    artist: "Steven McCoy",
    target: 'targets/find-your-village.mind',
    image: 'targets/find-your-village.jpg',
    width: 1024, height: 1024,
    quote: "“I’m living my life authentically. I don’t have to hide anymore. I’m being embraced for who I am, and the beautiful thing about being authentic, you find your village. You think that you’re alone, but eventually, like a magnet, you just start attracting everyone you’re supposed to.” — Steven McCoy",
    description: "Find Your Village. By Steven McCoy. This surreal image features a face formed by intricate patterns, with dreamlike structures like floating castles, trees, and celestial bodies emerging from it. The colors shift from darker tones on the left to warm, golden hues on the right, symbolizing a journey from darkness to light. As part of Steven McCoy’s journey navigating the complexities of Usher’s syndrome and self-discovery, this abstract image symbolizes the flourishing of his true identity and the supportive community he attracted by living authentically.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_steven_village.mp4", clip: "media/clips/find-your-village.mp4", audio: null },
    hotspots: []
  },
  {
    id: "take-time-to-bloom",
    title: "Take Time to Bloom",
    artist: "Steven McCoy",
    target: 'targets/take-time-to-bloom.mind',
    image: 'targets/take-time-to-bloom.jpg',
    width: 1024, height: 1024,
    quote: "“To the people out there who are always giving their time and attention to others, what are you doing for yourself? You are a person. You deserve your time and attention as well. And when I took that time, and worked on myself, I truly flourished. It was like a flower blooming, and truthfully, my career bloomed in a way that I never would have imagined.” — Steven McCoy",
    description: "Take Time to Bloom. By Steven McCoy. This image depicts a large, intricate flower with delicate petals rendered in soft shades of white and gray. The flower’s center is rich with detail, featuring complex layers of petals blossoming. Interwoven among the petals, one can see elements of mechanical clockwork, blending natural beauty with the theme of time. The juxtaposition of the organic flower representing McCoy’s transformation, combined with the industrial elements of time, creates a striking and thought-provoking visual.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_steven_time.mp4", clip: "media/clips/take-time-to-bloom.mp4", audio: null },
    hotspots: []
  },
  {
    id: "pour-in-the-love",
    title: "Pour In The Love",
    artist: "Steven McCoy",
    target: 'targets/pour-in-the-love.mind',
    image: 'targets/pour-in-the-love.jpg',
    width: 1024, height: 1024,
    quote: "“I had to do a lot of thought analysis and I did that during Covid. I really had to fix my thoughts — it was time to pull all the ugly out and start pouring in the love. And as I continued to drink that water of love and pour into my thoughts, I was allowing myself to release anyone who did not want to be in my life. And I did that by just being.” — Steven McCoy",
    description: "Pour In The Love. By Steven McCoy. The image is a captivating piece featuring a large, central heart that is black with concentric circles radiating outward. These circles transition into vibrant colors as they move away from the center — blues, reds, yellows — creating a rainbow-like effect against a starry black cosmos. Dripping from the top are shapes that suggest molten lava or wax, a gradient from yellow to red. Small circular accents in a vertical line connect the heart to these drips, symbolizing a flow between the heart and the universe above it. The concentric circles can be seen as the layers of thought and emotion Steven has worked through; as they radiate outward, they become infused with color and life, symbolizing the transformative process of self-love. The drips signify the “water of love” he used to cleanse his thoughts. By “just being,” Steven emphasizes the power of presence and authenticity.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_steven_heart.mp4", clip: "media/clips/pour-in-the-love.mp4", audio: null },
    hotspots: []
  },
  {
    id: "roots-of-kinship",
    title: "Roots of Kinship",
    artist: "April & Melissa",
    target: 'targets/roots-of-kinship.mind',
    image: 'targets/roots-of-kinship.jpg',
    width: 939, height: 939,
    quote: "“I work side by side with my sister and I love her dearly. We’re now, as a family, cohesively dealing with the same genetic disease. So you get through it — life is on the other side. It’s different, but you can live a fulfilled life.” — April & Melissa",
    description: "Roots of Kinship. By April & Melissa. The image features a large, stylized tree as its central focus. The tree’s canopy is filled with a myriad of patterns, shapes, and motifs — swirls, leaves, flowers, birds, and various abstract designs — rendered in a rich palette of reds, oranges, blues, greens, and yellows. The tree’s expansive trunk and roots are equally detailed, with swirling patterns and colors that mirror the vibrancy of the canopy. Below the tree, a whimsical landscape unfolds, with a soft gradient of blues and yellows suggesting a sky transitioning from day to night. It stands tall and majestic, branches extending up into the sky and roots deeply entrenched in the earth — signifying generations of growth, the continuity of life, and the passing down of traditions and values.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_am_familytree.mp4", clip: "media/clips/roots-of-kinship.mp4", audio: null },
    hotspots: []
  },
  {
    id: "all-lifes-beauty",
    title: "All Life’s Beauty",
    artist: "Dave Steele",
    target: 'targets/all-lifes-beauty.mind',
    image: 'targets/all-lifes-beauty.jpg',
    width: 1024, height: 1024,
    quote: "“Don’t let the fear of tomorrow take away the beauty you can still find today.” — Dave Steele",
    description: "All Life’s Beauty. By Dave Steele. This image shows a woman standing amid a vivid garden of blossoms, her face turned gently toward the light. The flowers around her burst in warm pinks, oranges, and golds, while the background softens into an impressionistic haze of color. The blurred, glowing edges evoke the way vision can soften and fragment with sight loss, yet the painting insists on beauty rather than loss. What remains in view is luminous, tender, and alive. It is a meditation on presence — on finding and holding the beauty that is still here, still reachable, even as the world’s sharp edges fade. Dave’s poetry returns again and again to this theme: that joy and gratitude can coexist with grief.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_d_2.mp4", clip: "media/clips/all-lifes-beauty.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-only-light-well-see",
    title: "The Only Light We’ll See",
    artist: "Dave Steele",
    target: 'targets/the-only-light-well-see.mind',
    image: 'targets/the-only-light-well-see.jpg',
    width: 1024, height: 1024,
    quote: "“In the darkest of nights, we learn to find our own light, and to become that light for others.” — Dave Steele",
    description: "The Only Light We’ll See. By Dave Steele. This image depicts a still, moonlit lake beneath a vast night sky. A luminous full moon hangs low, casting a shimmering path of silver light across the dark water toward the viewer. The surrounding darkness is deep and enveloping, but it is the radiant moon — and its reflection — that commands the scene. For someone navigating progressive sight loss, the image speaks to holding onto whatever light remains, however faint. The reflected path of light reaching across the water becomes a metaphor for guidance and hope: even in profound darkness, there is a way forward, and a light worth following. It is an image of resilience, and of the quiet beauty found in the night.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_d_3.mp4", clip: "media/clips/the-only-light-well-see.mp4", audio: null },
    hotspots: []
  },
  {
    id: "pathways-unveiled",
    title: "Pathways Unveiled",
    artist: "April & Melissa",
    target: 'targets/pathways-unveiled.mind',
    image: 'targets/pathways-unveiled.jpg',
    width: 798, height: 798,
    quote: "“The roads and the avenues continue to open and spread and it gives us an ability to share and hopefully help someone else that’s newly diagnosed — because it is a very rock bottom, ground zero feeling.” — April & Melissa",
    description: "Pathways Unveiled. By April & Melissa. The image is a vibrant and abstract depiction of roadways and paths that weave, curve, and intertwine with each other, creating a dynamic pattern of overpasses and intersections. The myriad of colors and forms creates a visual tapestry that gives the impression of a bustling, dynamic world. This vivid tableau stands as a poignant metaphor for the journey of two sisters navigating the twists and turns of life, particularly the challenges posed by inherited retinal disease. From the vibrant yellows, blues, and reds to the subtle pastels, each hue encapsulates the spectrum of emotions and experiences the sisters share — joy, sadness, strength, and perseverance. The fluidity of the lanes, looping and bending but never breaking, mirrors the sisters’ resilience. Together they chart new paths, leaning on each other’s strengths. Just as one road comes to an end, another continues on the path of hope — new roads and opportunities continually unfolding, especially when navigated with the unbreakable bond of sisterhood.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_am_roads.mp4", clip: "media/clips/pathways-unveiled.mp4", audio: null },
    hotspots: []
  },
  {
    id: "reflections-of-sisterhood",
    title: "Reflections of Sisterhood",
    artist: "April & Melissa",
    target: 'targets/reflections-of-sisterhood.mind',
    image: 'targets/reflections-of-sisterhood.jpg',
    width: 1024, height: 1024,
    quote: "“… that’s where our parents were from, Guanaja. That’s where we went every summer. It’s a little house and their backyard is water. So, we would sit back there, kick our feet in.” — April & Melissa",
    description: "Reflections of Sisterhood. By April & Melissa. The image depicts two girls (April & Melissa) sitting on the edge of a wooden dock, with a blue body of water beneath them. Both are dangling their feet into the water, and their reflections can be clearly seen on the water’s surface. The girl on the left wears a floral dress in hues of pink, yellow, and blue, engrossed in looking at something in her hands. The girl on the right wears a pink and blue patterned dress, leaning slightly forward, looking at her feet touching the water. Behind them, the dock leads to a small building on stilts over the water. The artwork has a realistic style, with detailed shading and reflections in the water. The mood is calm and serene, highlighting the bond between the sisters and a cherished moment from their childhood in Guanaja.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_am_sisterhood.mp4", clip: null, audio: "../3D/gallery/audio/art_10.mp3" },
    hotspots: []
  },
  {
    id: "all-the-possibilities",
    title: "All the Possibilities",
    artist: "Raquel Alim",
    target: 'targets/all-the-possibilities.mind',
    image: 'targets/all-the-possibilities.jpg',
    width: 1024, height: 1024,
    quote: "“If I were able to sit down with my 12-year-old self, I would show her the art of other visually impaired people going through the same condition — their music, photography, filmmaking, visual art. A blind architect, a blind poet, a blind teacher — anything, so that little girl could decide where she wants to go in life and how many options she has.” — Raquel Alim",
    description: "All the Possibilities. By Raquel Alim. The image is inspired by the conversation Raquel would have with her younger self, facing the diagnosis of retinitis pigmentosa. The older figure, representing Raquel, and the child symbolize a meeting across time — an exchange of wisdom, comfort, and guidance. The abstract world surrounding them represents the world of opportunities available to those who are visually impaired — the arts, literature, architecture, and more. The figures are rendered with gentle brushstrokes in earthy tones that blend into the dreamlike background, their posture conveying contemplative observation and shared experience. The image captures the essence of reflection, resilience, and the human capacity to adapt — a testament to the power of support and the enduring spirit of those who navigate the journey of visual impairment, encouraging them to embrace the endless possibilities that life offers.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_raquel_11.mp4", clip: "media/clips/all-the-possibilities.mp4", audio: null },
    hotspots: []
  },
  {
    id: "a-new-day",
    title: "A New Day",
    artist: "Raquel Alim",
    target: 'targets/a-new-day.mind',
    image: 'targets/a-new-day.jpg',
    width: 1024, height: 1024,
    quote: "“I have my down moments, and that’s okay. Tomorrow is a new day. I get back out there and do whatever I can. Artwork is just like life — you have to feel it. And when you know it’s right, you go with it.” — Raquel Alim",
    description: "A New Day. By Raquel Alim. The image is a mesmerizing artwork depicting an arched window or portal framing a serene seascape. Mosaic shapes create a stained-glass effect, with a palette transitioning from deep blues and purples on one side to warm oranges, yellows, and reds on the other — perhaps symbolizing different times of day or emotional states. Through the window, tall slender trees stretch towards a sunset over a calm ocean, the sky reflecting onto the water. The warm and cool hues reflect the emotional spectrum Raquel navigates — the down moments as well as the resurgence of hope and determination to get back out there. The window frames not just a view but a perspective — that each day brings a new horizon, a fresh opportunity to create something beautiful, akin to the way a stained-glass piece comes together to form a whole from many individual fragments.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_raquel_33.mp4", clip: "media/clips/a-new-day.mp4", audio: null },
    hotspots: []
  },
  {
    id: "music-on-the-streets",
    title: "Music On The Streets",
    artist: "Alayna Lopez",
    target: 'targets/music-on-the-streets.mind',
    image: 'targets/music-on-the-streets.jpg',
    width: 1024, height: 1024,
    quote: "“I’ve gained more appreciation for how things literally feel, especially since I got the cane. I love going over all the different textures and the domes when you cross the street. Some of them sound like music and it’s the coolest thing ever.” — Alayna Lopez",
    description: "Music On The Streets. By Alayna Lopez. Set in the streets of a city, this image portrays a bird’s-eye view of people strolling along crosswalks. The crosswalks form a rigid square shape consuming most of the frame, under a dim gray undertone. The streets are beautified by vibrant, colorful music notes and clef symbols, decorating the ground like graffiti. These musical ornaments bring life and vitality to otherwise lackluster streets, contradicting the rigid lines with their abstract nature — vivid oranges, yellows, pinks, and blues. The image animates Alayna’s skill in translating the sound of her cane tapping the ground into musical patterns. Rather than focusing on inconvenience, she draws attention to what makes her disability beautiful — the music found within the textures of the ground.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_alayna_music.mp4", clip: "media/clips/music-on-the-streets.mp4", audio: null },
    hotspots: []
  },
  {
    id: "roller-coaster-of-emotions",
    title: "Roller Coaster Of Emotions",
    artist: "Alayna Lopez",
    target: 'targets/roller-coaster-of-emotions.mind',
    image: 'targets/roller-coaster-of-emotions.jpg',
    width: 1024, height: 1024,
    quote: "“I had to throw away who I was because of this incorrect perception of what a blind person was and what they should act like. I felt stuck on this roller coaster of different emotions throughout that year.” — Alayna Lopez",
    description: "Roller Coaster Of Emotions. By Alayna Lopez. The image depicts a bright, bustling city view filled with saturated colors, spotlighting Alayna with her back turned. She stands on a highly positioned, tangerine-colored roller coaster track, overlooking the chaos below — skyscrapers, billboards, and flags creating a spectacle of pandemonium. Adorned in a sea-green coat and an orange beanie, wind flying through her curly brown locks, Alayna contemplates the paths this roller coaster might embark on. Additional tracks roam through the air in various, unorderly directions. With the recent knowledge of her diagnosis, Alayna grapples with the contradictions of who she has always been versus who she thinks others perceive her to be. The varying tracks symbolize her contrasting emotions, and the steepness of her track represents her fear of the unpredictable.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_alayna_coaster.mp4", clip: "media/clips/roller-coaster-of-emotions.mp4", audio: null },
    hotspots: []
  },
  {
    id: "i-am-blind-like-my-hair-is-brown",
    title: "I Am Blind, Like My Hair Is Brown",
    artist: "Alayna Lopez",
    target: 'targets/i-am-blind-like-my-hair-is-brown.mind',
    image: 'targets/i-am-blind-like-my-hair-is-brown.jpg',
    width: 768, height: 768,
    quote: "“Lean on your people, but just know no matter where you go, that person you are and always have been is still going to be there. I am blind like my hair is brown, you know? It’s just a part of me that I really appreciate.” — Alayna Lopez",
    description: "I Am Blind, Like My Hair Is Brown. By Alayna Lopez. This illustration presents an enlarged, abstract-style portrait of Alayna from the neck up. Her face is composed of geometric shapes and vibrant colors in a mosaic-like effect — bright hues of yellow, orange, pink, blue, and green forming her eyes, nose, lips, and hair. The most significant features are her big brown eyes and curly brown hair. Alayna compares her blindness to the color of her hair, conveying that being blind is as much a staple of her identity as her hair is — both real, permanent qualities she values highly. The constancy of her hair color symbolizes the constancy of her identity, even through a life-altering diagnosis. Placing her blindness in the same category as her hair color speaks to the idea that she does not view it as a disability, but as an addition to who she is.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_alayna_hair.mp4", clip: "media/clips/i-am-blind-like-my-hair-is-brown.mp4", audio: null },
    hotspots: []
  },
  {
    id: "reaching-past-blindness",
    title: "Reaching Past Blindness",
    artist: "Rusty Perez",
    target: 'targets/reaching-past-blindness.mind',
    image: 'targets/reaching-past-blindness.jpg',
    width: 1024, height: 1024,
    quote: "“I call music a constant companion. It’s an alternate form of expression. And I think it’s also helped me reach past the blindness. Maybe it’s helped others reach past the blindness that they might be worried or fearful of and connect with me on a personal level.” — Rusty Perez",
    description: "Reaching Past Blindness. By Rusty Perez. This image is a dynamic representation of a guitarist (Rusty) lost in the flow of their music. The figure is surrounded by an explosion of colors and abstract patterns that radiate outward, creating a sense of movement and energy. The musician’s face is not visible, allowing the viewer to focus on the act of playing and the emotions it evokes. The background is filled with swirling, multicolored light trails and shapes. It highlights the power of music to impact the listener and beyond — a bridge that reaches past blindness to connect, person to person.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_rusty_reach.mp4", clip: "media/clips/reaching-past-blindness.mp4", audio: null },
    hotspots: []
  },
  {
    id: "reasons-for-a-cure",
    title: "Reasons for a Cure",
    artist: "Rusty Perez",
    target: 'targets/reasons-for-a-cure.mind',
    image: 'targets/reasons-for-a-cure.jpg',
    width: 1024, height: 1024,
    quote: "“Maybe the reason to take a cure is for those deeply emotional things that I miss out on. Sure, we can’t pick up a menu and read it, or get in a car and drive — but we can’t see a loved one’s face. And that is so much more meaningful, I think, than the reading or driving.” — Rusty Perez",
    description: "Reasons for a Cure. By Rusty Perez. This image features a man (representing Rusty) sitting with his back to the viewer, in front of a large wall covered with hundreds of photographs. The photos are of various subjects — people in different settings, landscapes, and activities. The overall composition is mosaic-like, with each small image contributing to a larger, intricate tapestry. This artwork poignantly brings the quote to life, symbolizing the countless experiences and emotions that could be experienced through sight if a cure were to exist.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_rusty_reason.mp4", clip: "media/clips/reasons-for-a-cure.mp4", audio: null },
    hotspots: []
  },
  {
    id: "midnight-melodies",
    title: "Midnight Melodies",
    artist: "Wayne Pearcy",
    target: 'targets/midnight-melodies.mind',
    image: 'targets/midnight-melodies.jpg',
    width: 1024, height: 1024,
    quote: "“My dad bought me this trumpet and I was so excited about it. I remember I actually slept with that horn that night. I took it out of its case and I put it in bed with me. It was like it was a toy.” — Wayne Pearcy",
    description: "Midnight Melodies. By Wayne Pearcy. The image portrays a young boy (representing Wayne Pearcy), peacefully sleeping on his bed. He holds a golden trumpet close to him, suggesting a deep bond or affection toward the instrument. Above him, a lamppost with a glowing light bulb illuminates the scene — but rather than a regular lamppost, this one morphs into the bell of a trumpet at the top. The backdrop displays a picturesque night sky filled with stars, while the bed itself seems to be situated amidst mountainous terrain or rocky outcrops. The overall ambiance emanates tranquility, with a mix of fantasy and reality, hinting at the boy’s dreams and passion for music.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_wayne_trumpet.mp4", clip: "media/clips/midnight-melodies.mp4", audio: null },
    hotspots: []
  },
  {
    id: "moment-of-communion",
    title: "Moment of Communion",
    artist: "Marcus Roberts",
    target: 'targets/moment-of-communion.mind',
    image: 'targets/moment-of-communion.jpg',
    width: 1024, height: 1024,
    quote: "“… in those rare instances where not only do people connect, but they actually feel the same thing about each other and about themselves… I call that moment a moment of communion — we not only feel the same thing, we believe the same thing, and we have a trust and a symmetry that is elevating all of us at the same time.” — Marcus Roberts",
    description: "Moment of Communion. By Marcus Roberts. The image depicts two dreamlike towns lining opposite banks of a calm, mirror-like river. The landmasses appear to have been split apart, leaving a chasm beneath the water. A fragile, seemingly incomplete bridge connects the two sides, and a few figures stand on it in contemplation or conversation. The sun casts a golden hue while the river reflects town, sky, and clouds perfectly. As a metaphor, the scene underscores the divisions that can exist between groups of people — such as the blind and sighted communities. The chasm beneath the river suggests the depth of misunderstanding or lack of knowledge that can separate them. The bridge, though fragile and incomplete, signifies the potential for connection, dialogue, and understanding. The individuals on it symbolize those who take the initiative to reach out, communicate, and bridge the gap.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_m_bridge.mp4", clip: "media/clips/moment-of-communion.mp4", audio: null },
    hotspots: []
  },
  {
    id: "fearless-request",
    title: "Fearless Request",
    artist: "Wayne Pearcy",
    target: 'targets/fearless-request.mind',
    image: 'targets/fearless-request.jpg',
    width: 1024, height: 1024,
    quote: "“If there are things I can do on my own I try to do them. But if there is something I know will make my life a little bit easier, I’m not afraid to go out and ask for that help, if I really think I need it, or if it would save me a few inconveniences along the way.” — Wayne Pearcy",
    description: "Fearless Request. By Wayne Pearcy. This whimsical image shows a young boy (representing Wayne Pearcy) standing on a path, gazing up at a large, humanoid robot with a boxy head that glows with two luminescent eyes. The robot offers a lantern to the boy, casting a light that contrasts with the dusky environment. A dim city skyline sits under a star-studded night sky. The boy represents someone who is blind or visually impaired, and the path represents the journey of navigating the world without sight. The robot offering a lantern signifies the guidance and support that strangers can provide. The juxtaposition of the boy’s small size against the robot’s grand stature emphasizes the vulnerability one might feel when seeking help — but also underscores the significant impact that a little assistance can have.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_wayne_robot.mp4", clip: "media/clips/fearless-request.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-scope-of-communication",
    title: "The Scope of Communication",
    artist: "Marcus Roberts",
    target: 'targets/the-scope-of-communication.mind',
    image: 'targets/the-scope-of-communication.jpg',
    width: 1024, height: 1024,
    quote: "“The goal of the project is to enlighten and broaden the scope of communication between groups of people who normally don’t communicate that well together.” — Marcus Roberts",
    description: "The Scope of Communication. By Marcus Roberts. The image showcases two human profiles facing each other in intimate proximity. The profile on the left is rendered in vibrant, swirling colors fluidly melded together, evoking unity and harmony. On the right, the profile seems to be disintegrating into a burst of color, like an ink spill or watercolor dispersion, suggesting vulnerability or change. The vibrant, fluid colors represent the flow of emotions, ideas, and understanding between two beings. The image captures a fleeting moment of deep connection — where one shares their vulnerabilities and the other responds with empathy and recognition, culminating in a profound communion.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_m_communication.mp4", clip: "media/clips/the-scope-of-communication.mp4", audio: null },
    hotspots: []
  },
  {
    id: "rhapsody-in-blue",
    title: "Rhapsody in Blue",
    artist: "Marcus Roberts",
    target: 'targets/rhapsody-in-blue.mind',
    image: 'targets/rhapsody-in-blue.jpg',
    width: 1024, height: 1024,
    quote: "“I met with the president, Peter Gelb… he asked me, what do you want to do? We need something different. And I said, I’d like to reimagine Gershwin’s Rhapsody in Blue… I want to use classical musicians and jazz musicians for this record.” — Marcus Roberts",
    description: "Rhapsody in Blue. By Marcus Roberts. The image is a vibrant, dynamic canvas awash with bold blues, splashes of golden yellow, and pops of pink and white. Intertwined amidst this sea of color are myriad music notes, symbols, and abstract designs that swirl and dance in an intricate choreography. The fluid strokes and lyrical quality evoke movement and rhythm, as if the painting itself is alive with sound. The artwork captures how music and jazz move beyond mere sound to become a vivid, visceral experience. The intertwining of notes and colors is a metaphor for the intricate harmonies and improvisational nature of jazz — where each note is not just heard but felt deeply. It embodies emotions and experiences that are innately human, uniting us across borders and backgrounds, and broadening the scope of communication itself.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_m_rhapsody.mp4", clip: "media/clips/rhapsody-in-blue.mp4", audio: null },
    hotspots: []
  },
  {
    id: "reliroo",
    title: "Reliroo",
    artist: "Rusty Perez",
    target: 'targets/reliroo.mind',
    image: 'targets/reliroo.jpg',
    width: 1024, height: 1024,
    quote: "“I went to get my first guide dog in 1998, and that was Relish. Relish was a black Labrador, and I called her Reliroo. And that was it, I was hooked. You build a relationship, you know? You learn to work together. And I get to take an amazing dog with me everywhere I go.” — Rusty Perez",
    description: "Reliroo. By Rusty Perez. This image is a surreal painting featuring Rusty and Relish walking down a winding path. The path and sky are filled with abstract shapes that flow together to create an otherworldly landscape extending into the distance. The overall atmosphere is dreamlike, presenting Rusty and Relish as a pair heading out into the world together — a portrait of trust, partnership, and freedom.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_rusty_reliroo.mp4", clip: "media/clips/reliroo.mp4", audio: null },
    hotspots: []
  },
  {
    id: "harmonious-gathering",
    title: "Harmonious Gathering",
    artist: "Will Hollimon",
    target: 'targets/harmonious-gathering.mind',
    image: 'targets/harmonious-gathering.jpg',
    width: 1024, height: 1024,
    quote: "“It’s just such a great feeling to meet someone at a show and I can connect with you because you were there and you saw me play. That interaction is incredible to me — people really care about what I do as a musician, and that feels really good.” — Will Hollimon",
    description: "Harmonious Gathering. By Will Hollimon. The image beautifully captures the transformative journey through music and community. The town, bathed in the golden hues of a setting sun, symbolizes the ever-evolving world full of new experiences. A population of humans morphing into instruments plays music in their whimsical town as the sun sets behind them. From musicians on the bridge to people listening intently, these characters epitomize the vibrancy of the community — a whimsical town bustling with life and color, capturing the feeling of togetherness through the universal language of music.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_will_community.mp4", clip: "media/clips/harmonious-gathering.mp4", audio: null },
    hotspots: []
  },
  {
    id: "napkin-please",
    title: "Napkin, Please",
    artist: "Wayne Pearcy",
    target: 'targets/napkin-please.mind',
    image: 'targets/napkin-please.jpg',
    width: 1024, height: 1024,
    quote: "“One of those stereotypes is blind people are just inadvertently messy eaters and they’re going to need tons of napkins. I’ll ask, can I have some napkins? And they’ll bring me like a whole Bible’s worth of them. And I’m thinking, who do you think I am?” — Wayne Pearcy",
    description: "Napkin, Please. By Wayne Pearcy. The image displays an interior view of a restaurant with wooden paneling and warm lighting. Dining tables are neatly arranged with silverware and glasses. The standout feature is a colossal stack of napkins, towering precariously in the center of the scene, almost reaching the ceiling — disproportionately more than any diner would need. As a commentary on stereotypes of blind individuals, the exaggerated pile of napkins serves as a metaphor for misconceptions sighted people may have. The overabundance is a hyperbolic representation of the stereotype that blind people might be inherently messier when eating — which, of course, is false. By displaying such an excessive quantity, the image humorously critiques the absurdity of the stereotype, highlighting the importance of avoiding broad generalizations based on limited understanding.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_wayne_napkins.mp4", clip: "media/clips/napkin-please.mp4", audio: null },
    hotspots: []
  },
  {
    id: "seeing-the-world-together",
    title: "SEEING THE WORLD TOGETHER",
    artist: "Ricky Ruzicka",
    target: 'targets/seeing-the-world-together.mind',
    image: 'targets/seeing-the-world-together.jpg',
    width: 512, height: 512,
    quote: "“My wife and I have been married for eight years. The blindness journey with her has been nothing but amazing because she is my eyes and I help her out in the ways that I do. But we both get to see the world together and I am grateful for it.” — Ricky Ruzicka",
    description: "SEEING THE WORLD TOGETHER. By Ricky Ruzicka. “My wife and I have been married for eight years. The blindness journey with her has been nothing but amazing because she is my eyes and I help her out in the ways that I do. But we both get to see the world together and I am grateful for it.” = RICKY RUZICKA   /IMAGE DESCRIPTION/  This lively image depicts a visionary utopia set in the distant future. It captures a scene that integrates the splendor of nature with the potential marvels of advanced technology. The centerpiece of the illustration consists of two silhouettes, Ricky and his wife, standing side by side, exuding a contemplative air as they gaze upon the breathtaking landscape before them. The pair is immersed within lush flora, with towering plants and foliage enveloping their surroundings. A serene body of water occupies the midground, its surface mirroring the sky and the surrounding futuristic buildings. The sky is a tapestry of vibrant colors, encompassing gradients of orange, pink, and yellow, suggesting a time of dawn or dusk. Wisps of clouds are scattered across this celestial canvas, accentuating the luminosity of the piece. Hovering within the sky is a planet resembling Saturn in that it is enclosed within a ring.  The themes of this image are rooted in Ricky’s well founded, reliable relationship with his wife. He expresses that despite his visual impairment, she has been able to help him “see” through continuing to guide and support him unconditionally. One of the most significant features in the illustration is the directions in which Ricky and his wife are looking – Ricky is looking out into the distance while his wife is gazing at him. Her unwavering focus on Ricky, even in the face of a breathtaking view, reveals her undying dedication to supporting her husband through his journey. They see the world together, but Ricky is her world.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/ricky_r_seeing_world_optimized_269676270.mp4", clip: "media/clips/seeing-the-world-together.mp4", audio: null },
    hotspots: []
  },
  {
    id: "hope-is-not-lost",
    title: "HOPE IS NOT LOST",
    artist: "Ricky Ruzicka",
    target: 'targets/hope-is-not-lost.mind',
    image: 'targets/hope-is-not-lost.jpg',
    width: 512, height: 512,
    quote: "“Hope is not lost. There is a difference between your eyesight and vision, right? You have to have a vision for hope in the future and what you can still do through those challenges that you may have now. You are losing something, but just because you lose something doesn’t mean that there’s nothing to be gained from it.” — Ricky Ruzicka",
    description: "HOPE IS NOT LOST. By Ricky Ruzicka. “Hope is not lost. There is a difference between your eyesight and vision, right? You have to have a vision for hope in the future and what you can still do through those challenges that you may have now. You are losing something, but just because you lose something doesn’t mean that there’s nothing to be gained from it.” = RICKY RUZICKA   /IMAGE DESCRIPTION/  The image portrays an ethereal, surreal scene of a floating island suspended in the sky amidst a sea of fluffy, white clouds. The island is an isolated, rocky plateau with steep cliffs descending into the mist below it. Upon the island is a serene oasis, featuring a peaceful, circular pond surrounded by sparsely scattered plants and rock formations that evoke a sense of tranquility and beauty. A solitary figure, presumably Ricky, stands near the edge of the pond, observing the terrain around him. Ricky’s presence adds a contemplative and human element to the scene. The sky above and around the floating island is a mesmerizing blend of soft blues and oranges, accompanied by a mass of fluffy, cumulonimbus clouds. Two faraway crescent moons are faintly visible, adding to the celestial, surrealistic tone of the piece.  The isolation of the island represents Ricky’s feelings of solidarity on his journey of navigating blindness. Though he has support from loved ones, he is the only one who can truly fight this battle for himself. A path of isolation, though, can be one of great beauty, and because Ricky is lonesome on this journey, he is the only one who can reap the benefits of this beautiful island for one. He has held onto a strong sense of vision despite his lack of sight, which has provided him with the most important thing of all: hope.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/ricky_r_hope_optimized_269676271.mp4", clip: "media/clips/hope-is-not-lost.mp4", audio: null },
    hotspots: []
  },
  {
    id: "pedals-of-freedom",
    title: "Pedals of Freedom",
    artist: "Bill McCann",
    target: 'targets/pedals-of-freedom.mind',
    image: 'targets/pedals-of-freedom.jpg',
    width: 1024, height: 1024,
    quote: "“When I lost my sight that summer when I was six, all I wanted was a bicycle. My father never said, ’Bill, let’s talk about this.’ No — I had a bicycle under the Christmas tree that year. He taught me to ride it in our driveway, then took the training wheels off, and somehow I learned to balance and ride. I knew every bump in the sidewalk within a five-block radius.” — Bill McCann",
    description: "Pedals of Freedom. By Bill McCann. This vibrant image captures a young boy, representing Bill McCann, exuding confidence as he rides a bicycle down a sunlit suburban lane. Although his path ahead is not clearly visible, the poise with which he handles the bicycle suggests an air of self-assurance and determination. The picture serves as a potent metaphor for Bill’s journey as he explores his world, not through sight, but through determination, confidence, and self-reliance. The bicycle — a symbol of independence and mobility — represents his drive to navigate his surroundings despite the challenges of visual impairment. It is a vivid reminder that, while vision might provide sight, true understanding and growth come from experiences, risks, and the belief that one can overcome challenges.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_b_bicycle.mp4", clip: "media/clips/pedals-of-freedom.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-bridge-of-perception",
    title: "The Bridge of Perception",
    artist: "Bill McCann",
    target: 'targets/the-bridge-of-perception.mind',
    image: 'targets/the-bridge-of-perception.jpg',
    width: 1024, height: 1024,
    quote: "“We can’t totally trust our own perceptions of the world. We have to make judgments based on our perceptions — of course we do. But we also have to be open to the possibility that, you know what, I could be completely wrong about this.” — Bill McCann",
    description: "The Bridge of Perception. By Bill McCann. This image depicts a young boy, representing Bill McCann, emerging from the cold mountain water under the bridge across Licking Creek. His wide-open eyes convey a sense of surprise or shock. The clarity of the water and the vivid details of the bridge contrast with his startled expression, reminding us that sometimes even the most evident truths can be overlooked or misinterpreted. While this depicts an event from Bill’s childhood, it equally serves as a universal metaphor for the unpredictable nature of perception. Even those with sight can be ’blinded’ by their preconceptions and biases. Perception, for all its value, is not infallible, and we must always be open to re-evaluating and understanding the world. As Bill recalls: “I wonder what’s on the other side of this bridge. And I went off the bridge into the water.”",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_b_bridge.mp4", clip: "media/clips/the-bridge-of-perception.mp4", audio: null },
    hotspots: []
  },
  {
    id: "rhythm-of-life",
    title: "Rhythm of Life",
    artist: "Will Hollimon",
    target: 'targets/rhythm-of-life.mind',
    image: 'targets/rhythm-of-life.jpg',
    width: 1024, height: 1024,
    quote: "“Early in life, I realized music is my main interest and passion. It was the thing I wanted to do. It’s the best feeling in the world, whenever I sit down at a drumkit. Drums have always been something I can play well enough since I was four or five.” — Will Hollimon",
    description: "Rhythm of Life. By Will Hollimon. The image is a detailed and imaginative illustration, capturing a young man (Will Hollimon) engrossed in playing a drum set. He wears black-rimmed glasses and a teal-colored shirt, deeply immersed in the rhythm. The backdrop is a fantastical whirlwind of objects and creatures, seemingly floating or swirling around him in a dreamlike state — planets, a cassette tape, a red electric guitar, old radios, a rotary telephone, musical notes, a light bulb, a metronome, and many more eclectic items. Each object adds to the sense of a creative and inspirational musical universe.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_will_drums.mp4", clip: "media/clips/rhythm-of-life.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-dark-uncertainty",
    title: "The Dark Uncertainty",
    artist: "Bill McCann",
    target: 'targets/the-dark-uncertainty.mind',
    image: 'targets/the-dark-uncertainty.jpg',
    width: 1024, height: 1024,
    quote: "“I have learned that in some people’s minds, being blind is about one step away from being dead. As blind people, I think it’s important for us to understand that reality — because what it’s really about is that people fear what they don’t know.” — Bill McCann",
    description: "The Dark Uncertainty. By Bill McCann. This evocative image depicts a man, representing Bill McCann, sitting inside a bus. The amber and deep red tones of the interior exude a warm essence, and the vibrant, contrasting colors create a dramatic atmosphere. Bill is depicted as a contemplative figure, seated with a trumpet cradled in his hands — a clear reference to his identity as a musician. He appears deep in thought, his face shadowed yet defined, hinting at the stories and experiences he might have encountered in his journey as a blind trumpet player. The windows behind him showcase abstract patterns, indicating the world passing by. The overall ambiance evokes feelings of nostalgia and introspection, capturing a still moment in the bustling rhythm of life.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_b_bus.mp4", clip: "media/clips/the-dark-uncertainty.mp4", audio: null },
    hotspots: []
  },
  {
    id: "goalball-is",
    title: "GOALBALL IS...",
    artist: "Ricky Ruzicka",
    target: 'targets/goalball-is.mind',
    image: 'targets/goalball-is.jpg',
    width: 512, height: 512,
    quote: "“Goalball is probably the greatest sport, and not many people have heard of it. I found it about four years into the rehabilitation and the new journey of blindness and I was so grateful at the time to be exposed to friends in the community who were thriving and who were so passionate about something.” — Ricky Ruzicka",
    description: "GOALBALL IS.... By Ricky Ruzicka. “Goalball is probably the greatest sport, and not many people have heard of it. I found it about four years into the rehabilitation and the new journey of blindness and I was so grateful at the time to be exposed to friends in the community who were thriving and who were so passionate about something.” = RICKY RUZICKA   /IMAGE DESCRIPTION/  This piece is a vibrant and dynamic illustration that captures the essence of athleticism and motion. The composition is similar in structure to a kaleidoscope; geometric shapes and bold colors are arranged to depict a moment of intense action in the sport of goalball. At the heart of the piece is an abstract representation of a goalball player in mid-action. The player’s form is composed of geometric segments, each section painted in a different color. The player’s limbs are extended, suggesting a dramatic leap or dive. The player’s contours are defined by sharp angles and contrasting tones which convey the fluidity and tension of the movement at hand. A ball is captured in the player’s outstretched hand, revealing a climactic moment in the game. The scene’s background is composed of angular forms, creating an environment that suggests boundaries similar to those of a soccer field. Lines and shapes in varying shades of blue, green, red, and yellow dominate the piece.  The thrilling and spirited essence of this image suggests the amount of liveliness that has been restored in Ricky’s life since he began playing goalball. After enduring a difficult period during rehabilitation, goalball served as a light in Ricky’s world of darkness, reminding him of the joys that life has to offer.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/ricky_r_goalball_optimized_269676269.mp4", clip: "media/clips/goalball-is.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-visions-that-we-share",
    title: "The Visions That We Share",
    artist: "Dave Steele",
    target: 'targets/the-visions-that-we-share.mind',
    image: 'targets/the-visions-that-we-share.jpg',
    width: 1024, height: 1024,
    quote: "“Together we can change the world’s view of sight loss, one word, one poem, one shared story at a time.” — Dave Steele",
    description: "The Visions That We Share. By Dave Steele. This image is dominated by a single, luminous human eye rendered in rich blues and golds, its iris opening like a tunnel of light. Around it, swirling brushstrokes dissolve the edges into darkness, so that the eye becomes both a window and a passage. For someone living with Retinitis Pigmentosa, the bright center surrounded by encroaching darkness mirrors the lived experience of tunnel vision — a shrinking field of clarity ringed by loss. Yet the painting reframes that reality as something shared rather than isolating. The eye looks outward, inviting connection, suggesting that the visions we hold — of hope, of understanding, of a more inclusive world — are visions meant to be shared.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_d_1.mp4", clip: "media/clips/the-visions-that-we-share.mp4", audio: null },
    hotspots: []
  },
  {
    id: "flow-state",
    title: "Flow State",
    artist: "Raquel Alim",
    target: 'targets/flow-state.mind',
    image: 'targets/flow-state.jpg',
    width: 1024, height: 1024,
    quote: "“I always have art flowing through me. I never have that block to create art. I think my issue is I have too many things in my head that I need to paint.” — Raquel Alim",
    description: "Flow State. By Raquel Alim. The image portrays a woman’s face in a state of serene repose, eyes gently closed, head tilted slightly upwards. The artwork is vibrant and rich with flowing lines and contoured colors that map the topography of her features — reds, oranges, yellows, and cool blues, greens, and purples swirling around and across her face in a rainbow effect. Her expression is one of calm and contemplation, with a hint of a thoughtful smile, as if she is lost in an internal world of creativity. The flow of colors symbolizes the constant stream of artistic inspiration she feels — intrinsic and ever-present. Despite the challenges posed by retinitis pigmentosa, her identity as an artist remains, in her own words, “unblurred.” The piece is a testament to Raquel’s personal and emotional journey through her art, even in the face of visual impairment.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_raquel_22.mp4", clip: "media/clips/flow-state.mp4", audio: null },
    hotspots: []
  },
  {
    id: "lighthouse-of-hope",
    title: "Lighthouse of Hope",
    artist: "Craig Ellis",
    target: 'targets/lighthouse-of-hope.mind',
    image: 'targets/lighthouse-of-hope.jpg',
    width: 1024, height: 1024,
    quote: "“We’re shining a light of hope. The first thing we give them is hope. The first time they see that light is the time I want them to realize that there’s hope and there is a future. Hope is the light shining out of the lighthouse, and that’s exactly the way we approach things.” — Craig Ellis",
    description: "Lighthouse of Hope. By Craig Ellis. The image is a visually striking and symbolic artwork depicting a surreal landscape of light, darkness, and hope. In the center, a face is silhouetted in black against a gradient background that transitions to a luminous horizon. The figure’s hair transitions into waves of color blending into the sea and sky, rendered in soft cream, beige, and white tones with intricate swirling patterns. The piece encapsulates the beacon of hope that the East Texas Lighthouse represents for the blind community — the message that there is always light, support, and a path forward. The transition from dark to light signifies the progression from despair to hope. This mirrors the emotional transformation that individuals with vision loss undergo, particularly as they engage with organizations like the East Texas Lighthouse for the Blind, which helps them realize their full potential.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_c_lighthouse.mp4", clip: "media/clips/lighthouse-of-hope.mp4", audio: null },
    hotspots: []
  },
  {
    id: "telephone-poles",
    title: "Telephone Poles",
    artist: "Craig Ellis",
    target: 'targets/telephone-poles.mind',
    image: 'targets/telephone-poles.jpg',
    width: 1024, height: 1024,
    quote: "“I started noticing straight lines appearing crooked, one of the classic symptoms of early macular degeneration. I was driving down the highway and all the telephone poles looked like they went straight up and then bent over at the top. My son thought I was having a stroke — he said, those things are straight as an arrow.” — Craig Ellis",
    description: "Telephone Poles. By Craig Ellis. The image displays a vivid landscape with a road stretching off into the distance under a dramatic sky teeming with swirling clouds. These clouds are rendered in shades of dark green and blue, contrasting with the bright yellow and orange tones near the horizon. Dominating the scene are telephone poles lining the road, their lines stretching into the distance. They are depicted with exaggerated angles that warp the otherwise straight lines — a direct expression of the visual distortion Craig experienced. The telephone poles symbolize the beginning of Craig’s difficult journey living with macular degeneration and the uncertainty of progressing vision loss. Yet the path continues forward, symbolizing perseverance and the drive to continue.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_c_poles.mp4", clip: "media/clips/telephone-poles.mp4", audio: null },
    hotspots: []
  },
  {
    id: "back-of-a-harley",
    title: "Back of a Harley",
    artist: "Craig Ellis",
    target: 'targets/back-of-a-harley.mind',
    image: 'targets/back-of-a-harley.jpg',
    width: 1024, height: 1024,
    quote: "“I rode Harleys my whole adult life until I lost my vision. It’s one of those hobbies that gets in your blood. I’ve seen a whole lot of this country on the back of a Harley. You let a Harley go by with the right pipes on it, and it’s like it rips your heart out.” — Craig Ellis",
    description: "Back of a Harley. By Craig Ellis. The image features a man, representing Craig Ellis, sitting astride a motorcycle. Depicted from the waist up, his head tilts toward the sun. His attire consists of a classic biker’s leather jacket, gloves, and a helmet with goggles pushed up. His eyes are closed, soaking in the sunlight as he savors a moment of contentment and freedom. The background is awash with dramatic clouds, illuminated from behind by the sun’s rays filtering through in beams, creating a warm atmosphere. The lower sky is tinged with blue, suggesting dawn or dusk and lending a quiet sense of stillness. The man’s serene expression captures a mix of nostalgia and acceptance — an emotional reflection of losing a cherished experience to vision loss. Yet there is also peace, and a determination to savor the world in new ways.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_c_motorcycle.mp4", clip: "media/clips/back-of-a-harley.mp4", audio: null },
    hotspots: []
  },
  {
    id: "joyride",
    title: "Joyride",
    artist: "Shardasia Hadley",
    target: 'targets/joyride.mind',
    image: 'targets/joyride.jpg',
    width: 1024, height: 1024,
    quote: "“She tries to see the world through my perspective, and I really do appreciate that. Joyriding is really fun for me — going out, running errands. We visit family throughout the day, but we like to just drive around together sometimes.” — Shardasia Hadley",
    description: "Joyride. By Shardasia Hadley. This image depicts the enduring bond between Shardasia and her mother, capturing a carefree moment of joy. The pair cruise down a picturesque boulevard, lined with majestic palm trees that stand tall against a fiery sunset. The sun, immense and glowing, not only sheds light on their path but also symbolizes the hope and warmth in their lives. It is a testament to the radiant bond they share — one that outshines the darkest of moments.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_deja_joyride.mp4", clip: "media/clips/joyride.mp4", audio: null },
    hotspots: []
  },
  {
    id: "haute-couture-dreams",
    title: "Haute Couture Dreams",
    artist: "Shardasia Hadley",
    target: 'targets/haute-couture-dreams.mind',
    image: 'targets/haute-couture-dreams.jpg',
    width: 1024, height: 1024,
    quote: "“I’m into fashion at the moment. I like finding new and different styles of clothing, whether it be chic or kind of baggy. I like being comfortable. And I like trying out certain colors to see how they look on me.” — Shardasia Hadley",
    description: "Haute Couture Dreams. By Shardasia Hadley. This vivid and captivating collage is a tapestry of Shardasia’s love for fashion, in light of visual challenges. At the heart of the canvas stands a young woman, depicted with her back turned to us, poised with confidence. Her striking yellow top is a beacon, symbolizing her vibrant spirit and innate ability to stand out amidst a world of visual stimuli. The mosaic of images around her is a whirlwind of colors, textures, and silhouettes, representing the vast realm of fashion. From chic dresses to elegant blouses, these snippets mirror her aspirations, her dreams, and her deep-rooted love of style — a reminder that, legally blind, she still makes the image from her mind real.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_deja_fashion.mp4", clip: "media/clips/haute-couture-dreams.mp4", audio: null },
    hotspots: []
  },
  {
    id: "embracing-unity",
    title: "Embracing Unity",
    artist: "Shardasia Hadley",
    target: 'targets/embracing-unity.mind',
    image: 'targets/embracing-unity.jpg',
    width: 1024, height: 1024,
    quote: "“I’m grateful and appreciative of the support my family gives me every day. I’m happy that they accept me for having a disability and help me with whatever I need. They’re always there when I need them the most.” — Shardasia Hadley",
    description: "Embracing Unity. By Shardasia Hadley. The canvas prominently features silhouettes of figures representing the love, guidance, and support of Shardasia’s family. The overlapping, interwoven backdrop — teeming with patterns, colors, and textual fragments — creates a complex mosaic of seemingly tactile elements. The children, some holding hands and others with outstretched arms, embody the playful yet protective nature of siblings. As the oldest of six, Shardasia is surrounded by a family that moves together. In summary, the image portrays Shardasia’s support system, guiding her through the intricate journey of challenges and triumphs, all bound together by their collective love and commitment.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_deja_family.mp4", clip: "media/clips/embracing-unity.mp4", audio: null },
    hotspots: []
  },
  {
    id: "a-bright-future",
    title: "A Bright Future",
    artist: "Academy of Music for the Blind",
    target: 'targets/a-bright-future.mind',
    image: 'targets/a-bright-future.jpg',
    width: 666, height: 654,
    quote: "“Most of all, I want to serve them. I want to have the delight to know that they get to be the glorious people that they are, feel that self-esteem and self-worth, and be able to make the great music that they make.” — David Pinto, AMB Executive Director — Academy of Music for the Blind",
    description: "A Bright Future. By Academy of Music for the Blind. This image shows a young girl on a mountainside, standing on an uneven staircase made of musical notes that ascends into a misty, dreamlike sky. The colors transition from warm oranges and yellows at the base to cool blues and whites at the top, symbolizing a journey toward something unknown yet hopeful. The notes appear as though they are guiding her upward, representing both a literal path and a figurative journey with music guiding the way. The student stands with open arms, fearlessly embracing the ascent, confident in her own potential. This image encapsulates David’s dedication to helping young blind musicians reach their full potential — not just in skill but in self-worth. The girl climbing the stairs symbolizes each student’s growth, a symbolic celebration of capability and the uplifting experience that music offers.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_amb_11.mp4", clip: "media/clips/a-bright-future.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-harmony-of-vision",
    title: "The Harmony of Vision",
    artist: "Academy of Music for the Blind",
    target: 'targets/the-harmony-of-vision.mind',
    image: 'targets/the-harmony-of-vision.jpg',
    width: 673, height: 674,
    quote: "“I feel like these students have incredible vision. They tell us, the teachers, this is what I want to do, this is how I want to play or sing better. I feel like they even have more vision than some sighted people.” — Deb Beyer, AMB vocal instructor — Academy of Music for the Blind",
    description: "The Harmony of Vision. By Academy of Music for the Blind. This image is an abstract composition of musical notes, fluid shapes, and dynamic colors that seem to pulse and move across the canvas. The use of abstract forms and flowing lines creates a sense of rhythm and harmony — almost like a visual symphony, with notes embedded within colorful waves, arcs, and spirals that dance across the piece. Just as the abstract forms intertwine and interact dynamically, the students at AMB bring their own creative visions and desires to their music, pushing boundaries and setting personal goals for growth. Their ability to communicate what they want to achieve musically — how they wish to play or sing better — embodies a kind of vision that transcends physical sight, represented here by the bold, colorful, energetic movement in the artwork.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_amb_33.mp4", clip: "media/clips/the-harmony-of-vision.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-power-within",
    title: "The Power Within",
    artist: "Academy of Music for the Blind",
    target: 'targets/the-power-within.mind',
    image: 'targets/the-power-within.jpg',
    width: 661, height: 542,
    quote: "“Blindness is resilience, a superpower. I don’t want to let my blindness stop me from experiencing things. If people are curious about it, let’s educate them.” — Acabella, AMB Performance Group — Academy of Music for the Blind",
    description: "The Power Within. By Academy of Music for the Blind. This image features a heroic figure standing confidently atop a colorful cityscape of geometric buildings in a variety of vibrant hues. The superhero, dressed in a bold, futuristic costume with a red cape flowing behind them, faces forward with an air of strength and resilience. The figure appears both grounded in their stance and larger than life, exuding a sense of power and individuality within the larger community surrounding them — representing blindness not as a limitation but as a superpower. This visual encapsulates the students’ journey of navigating the challenging world around them. The bright contrasting colors symbolize their vibrant inner world, while the superhero stands as a metaphor for confidence, self-assurance, and the desire to embrace life fully.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_amb_22.mp4", clip: "media/clips/the-power-within.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-gray-zone",
    title: "The Gray Zone",
    artist: "Morten Bonde",
    target: 'targets/the-gray-zone.mind',
    image: 'targets/the-gray-zone.jpg',
    width: 1024, height: 1024,
    quote: "“For a long time I lived in a gray zone — no longer fully sighted, not yet identifying as blind. Naming that in-between space, instead of hiding it, is what finally set me free.” — Morten Bonde",
    description: "The Gray Zone. By Morten Bonde. This quiet, minimal image shows a translucent glass cube resting on a smooth floor, filled with soft white fog. The cube sits in a muted gray space, its contents half-hidden — a contained cloud you can almost see through, but never clearly. The fog inside the cube is the perfect metaphor for the experience the title names. It is neither solid nor empty, neither dark nor bright. It is the in-between — a defined space that still cannot be seen through. The clean edges of the cube give that uncertainty a shape, making the intangible feel real and acknowledged. The piece reflects the “gray zone” many people with progressive sight loss describe — the long passage between sighted and blind. Rather than treating that ambiguity as something shameful to hide, the image gives it form and dignity, suggesting that naming the in-between is itself a kind of clarity.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_morten_grayzone.mp4", clip: "media/clips/the-gray-zone.mp4", audio: null },
    hotspots: []
  },
  {
    id: "inner-peace-in-outer-chaos",
    title: "Inner Peace in Outer Chaos",
    artist: "Morten Bonde",
    target: 'targets/inner-peace-in-outer-chaos.mind',
    image: 'targets/inner-peace-in-outer-chaos.jpg',
    width: 1024, height: 1024,
    quote: "“I had to learn that peace is not something that arrives when the chaos stops. Peace is something I carry into the chaos. It is found within, not in the conditions around me.” — Morten Bonde",
    description: "Inner Peace in Outer Chaos. By Morten Bonde. This image shows a serene human face emerging from an explosion of vivid, swirling color. The eyes are gently closed, the expression calm, while around the head a storm of turquoise, magenta, gold, and deep blue erupts like clouds caught in a hurricane of paint. The contrast is the whole message. At the very center sits stillness — a peaceful, almost meditative face — while everything surrounding it churns with movement and intensity. The calm does not depend on the chaos calming down. It exists right in the middle of it. The piece reflects Morten’s mindfulness practice and his journey with retinitis pigmentosa: as his outer world grew less certain, he learned to anchor himself inwardly. The painting becomes a portrait of that inner steadiness — a reminder that peace is generated from within, even as the world outside swirls beyond our control.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_morten_innerpeace.mp4", clip: "media/clips/inner-peace-in-outer-chaos.mp4", audio: null },
    hotspots: []
  },
  {
    id: "the-mirror",
    title: "The Mirror",
    artist: "Morten Bonde",
    target: 'targets/the-mirror.mind',
    image: 'targets/the-mirror.jpg',
    width: 1024, height: 1024,
    quote: "“The hardest part was meeting myself honestly — facing the man in the mirror, accepting the diagnosis, and choosing who I wanted to become because of it, not in spite of it.” — Morten Bonde",
    description: "The Mirror. By Morten Bonde. This surreal image shows two figures of the same man standing in a vast desert, facing one another across a large mirror frame set into the sand. Above them an open sky drifts with clouds; the mirror reflects and fractures the scene, so the two versions of the man seem to meet at a seam in reality itself. The doubling is the heart of the piece. One figure faces the other as if confronting a former or future self. The cracked mirror suggests a moment of rupture — a before and an after — and the desert around them strips everything else away, leaving only the encounter between a person and his own reflection. The image speaks to Morten’s process of self-confrontation: looking honestly at his changing sight and his identity, and deciding to integrate the two selves rather than be split by them. The mirror becomes a place of reckoning and, ultimately, of acceptance.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_morten_mirror.mp4", clip: "media/clips/the-mirror.mp4", audio: null },
    hotspots: []
  },
  {
    id: "walk-through-fear",
    title: "Walk Through Fear",
    artist: "Ben Fox",
    target: 'targets/walk-through-fear.mind',
    image: 'targets/walk-through-fear.jpg',
    width: 1024, height: 1024,
    quote: "“… when you walk through the fear, you are the only thing that is left.” — Ben Fox",
    description: "Walk Through Fear. By Ben Fox. This image depicts the silhouette of a man, representing Ben Fox, walking into a vibrant abstract world of color. He wears a long coat and has long, flowing hair, and holds a white cane in his right hand. In front of him is a vibrant explosion of color, primarily deep blues, fiery reds, and glowing oranges. The strokes are dynamic and emotive, with the blues concentrated in the upper regions and the warmer hues dominating the bottom. These colors clash, compete, and blend simultaneously, creating a chaotic yet beautiful dance around the individual. Drips of paint, almost like rain, stream down from the top. The ground beneath his feet appears wet, reflecting the intense colors above. The figure’s posture, facing away from the viewer, reads as a symbol of introspection — a personal journey others might not fully understand. The reflective ground signifies reflection, both literally and metaphorically: as one processes the diagnosis, there are moments where one looks back at the past and contemplates the future. Ben’s white cane emphasizes the challenges faced daily, and acts as a symbol of resilience, adaptation, and freedom as he confidently faces the realities of his condition. The vibrant yet chaotic colors symbolize the overwhelming emotions one feels when diagnosed with a disease that causes blindness. Amidst the chaos, there is also a sense of beauty, resilience, and strength — highlighting the human spirit’s capacity to adapt and find light even in the most challenging circumstances.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_walk_through_fear.mp4", clip: "media/clips/walk-through-fear.mp4", audio: null },
    hotspots: []
  },
  {
    id: "decision-divide",
    title: "Decision Divide",
    artist: "Will Hollimon",
    target: 'targets/decision-divide.mind',
    image: 'targets/decision-divide.jpg',
    width: 1024, height: 1024,
    quote: "“It’s looking pretty stable, nothing’s really changed. But they have told me that I have the opportunity to do cataract surgery, which either could drastically improve my vision by removing my nearsightedness, or make me fully blind. So they’re just very hesitant on what to do about it. And I get why—” — Will Hollimon",
    description: "Decision Divide. By Will Hollimon. The striking visual depicts a bridge spanning two vastly contrasting worlds, serving as a profound metaphor for the process of making impactful decisions. On the left, the landscape is cool, serene, and bathed in a calming blue hue — the familiar comfort of the current reality. Conversely, the right side is aflame with fiery oranges and reds, an intense representation of the unpredictable outcome of undergoing treatment or surgery. The bridge connecting the two realms embodies the impending decision. It’s narrow, seemingly fragile, and represents a path of no return — encapsulating the dichotomy of hope and fear, the known and unknown, as the viewer stands at the precipice of a life-altering decision.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_will_stuck.mp4", clip: "media/clips/decision-divide.mp4", audio: null },
    hotspots: []
  },

  // ── the New Artists Wing (added 3 Nov 2026, from the 3D gallery's images, animations and the artists' voice clips) ──
  {
    id: "the-button-is-to-the-left",
    title: "The Button is to the Left",
    artist: "Anthony Ferraro",
    target: 'targets/the-button-is-to-the-left.mind',
    image: 'targets/the-button-is-to-the-left.jpg',
    width: 900, height: 900,
    quote: "“Sometimes independence is knowing when to advocate for help.” — Anthony Ferraro",
    description: "The Button is to the Left. By Anthony Ferraro. This image shows a street-level view from a city curb, where a crosswalk leads to a large, complex city building. To the left, there is a crosswalk button mounted on a pole. The large glass-and-steel structure in the background stacks walkways, bridges, and stairs in overlapping directions, creating a space that feels visually complex and hard to map. In the middle of that complexity, the crossing button becomes a small but essential point of access. It is a practical object, but in this image it carries a much larger meaning. By placing the viewer directly at the curb, facing a crosswalk button before an overwhelming maze of stairs, glass, and circulation systems, the image makes a larger truth immediate: the built world is often designed to be understood visually, and even beginning the journey can depend on locating one small point of access. Anthony’s insight rings true — that freedom is not about doing everything alone, but about being able to ask for the information you need to move through the world.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_anthony_button.mp4", clip: "media/clips/the-button-is-to-the-left.mp4", audio: "../3D/gallery/audio/wing_0_0.mp3" },
    hotspots: []
  },
  {
    id: "light-on-the-other-side",
    title: "Light on the Other Side",
    artist: "Anthony Ferraro",
    target: 'targets/light-on-the-other-side.mind',
    image: 'targets/light-on-the-other-side.jpg',
    width: 878, height: 878,
    quote: "“You’re faced with these situations in life. And the two options are: do I give up or do I keep going? Giving up is just not an option, ever. So you have to keep going. When you step through that madness and darkness, there’s always going to be light on the other side. The dark helps you enjoy those light moments.” — Anthony Ferraro",
    description: "Light on the Other Side. By Anthony Ferraro. This painting shows a figure skateboarding with a white cane through a vast, dark tunnel or wave of deep blue and black. The figure is small in the composition, leaning forward as he moves along a narrow path of warm light. Ahead of him, the darkness opens into a bright burst of white, gold, and orange, spilling across the ground like an illuminated passage. The scale of the image is important. The darkness feels enormous, almost like a storm or a force of nature, while the figure continues forward through it. The image does not pretend the darkness is small or easy. It makes the darkness real, but it also shows motion through it. The light becomes something reached through persistence, not something handed over easily. The piece reflects Anthony’s idea that life gives you moments where the choice is to give up or keep going. The figure’s movement becomes a physical expression of perseverance. The dark is not the end of the story — it is part of what makes the light on the other side feel so meaningful.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_anthony_light.mp4", clip: "media/clips/light-on-the-other-side.mp4", audio: "../3D/gallery/audio/wing_0_1.mp3" },
    hotspots: []
  },
  {
    id: "one-love",
    title: "One Love",
    artist: "Anthony Ferraro",
    target: 'targets/one-love.mind',
    image: 'targets/one-love.jpg',
    width: 900, height: 900,
    quote: "“I just want to help other people. That’s all I’ve ever wanted to do. I’m just trying to spread positivity around the world and use my platform to help others.” — Anthony Ferraro",
    description: "One Love. By Anthony Ferraro. This image shows the outline of a large hand making a peace sign against a light, minimal background. Across the hand, the words ONE LOVE appear in bold red letters. Inside the shape of the hand is a black-and-white landscape made of trees, flowers, birds, open sky, and a small walking figure. From a distance, the image reads like a poster: simple, direct, and iconic. Up close, it becomes more layered. The landscape inside the hand gives the symbol emotional depth. The small figure walking through the scene adds a sense of humility and purpose, as if the message is not just being declared, but lived. The piece reflects Anthony’s desire to help other people, spread positivity, and use his platform in service of others. “One Love” becomes more than a phrase — it becomes a visual philosophy. The peace sign reaches outward as a gesture of connection, while the landscape inside it suggests that love is also carried internally, shaped by experience, and offered back to the world.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_anthony_onelove.mp4", clip: "media/clips/one-love.mp4", audio: "../3D/gallery/audio/wing_0_2.mp3" },
    hotspots: []
  },
  {
    id: "art-raised-me-up",
    title: "Art Raised Me Up",
    artist: "Deborah Tramentozzi",
    target: 'targets/art-raised-me-up.mind',
    image: 'targets/art-raised-me-up.jpg',
    width: 800, height: 800,
    quote: "“Art has raised me up so many times. When I touch a sculpture or feel the texture of a painting described to me, I am lifted out of the dark and into something luminous.” — Deborah Tramentozzi",
    description: "Art Raised Me Up. By Deborah Tramentozzi. The image presents a grand, shadowed museum hall lined with ornate gilded frames. A single powerful beam of light pierces the darkness from above, lifting several framed paintings out of the gloom so they appear to float in mid-air, glowing. The polished floor mirrors the light, doubling its glow. The darkness of the hall speaks to a world that is often experienced without sight, while the beam of light becomes art itself — reaching in, illuminating, and lifting what matters into view. The floating frames suggest that beauty is not fixed to the wall but can rise to meet us. For Deborah, who has been blind since birth, art is not about seeing with the eyes but about being raised up — carried into meaning, dignity, and wonder by the works and the people who describe them.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_deborah_raisedup.mp4", clip: "media/clips/art-raised-me-up.mp4", audio: "../3D/gallery/audio/wing_1_0.mp3" },
    hotspots: []
  },
  {
    id: "live-the-beauty",
    title: "Live the Beauty",
    artist: "Deborah Tramentozzi",
    target: 'targets/live-the-beauty.mind',
    image: 'targets/live-the-beauty.jpg',
    width: 900, height: 897,
    quote: "“You don’t have to see beauty to live it. Beauty is something you move through, something you breathe — it surrounds you whether or not your eyes can catch it.” — Deborah Tramentozzi",
    description: "Live the Beauty. By Deborah Tramentozzi. The image is a vast, dreamlike landscape of billowing clouds that swirl around a radiant opening of warm light at its center. Classical figures, mountains, rivers, and forests fill the scene in rich, painterly detail, arranged like a great spiral drawing the eye — and the spirit — toward the glowing heart of the composition. The swirling clouds and luminous center evoke a world experienced not as a flat picture but as an immersive, surrounding presence. Beauty here is atmospheric and total, something you are inside of rather than something you look at. It reflects Deborah’s conviction that beauty is lived through every sense — sound, touch, scent, and feeling — and that a full, vivid inner world is open to everyone, sighted or not.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_deborah_livebeauty.mp4", clip: "media/clips/live-the-beauty.mp4", audio: "../3D/gallery/audio/wing_1_1.mp3" },
    hotspots: []
  },
  {
    id: "a-different-way-to-see",
    title: "A Different Way to See",
    artist: "Deborah Tramentozzi",
    target: 'targets/a-different-way-to-see.mind',
    image: 'targets/a-different-way-to-see.jpg',
    width: 800, height: 800,
    quote: "“Being blind is not the absence of seeing — it is a different way to see. I build the world from details, from voices, from memory and imagination, and the picture is whole.” — Deborah Tramentozzi",
    description: "A Different Way to See. By Deborah Tramentozzi. The image is an intricate collage of many small framed paintings — classical scenes of people, architecture, and landscapes — connected by fine lines and overlapping at different angles across a bright wall. Together the scattered fragments assemble into a single larger composition. The many separate frames represent the pieces of information a blind person gathers — a described detail here, a remembered texture there, a fragment of conversation — each one partial on its own. The connecting lines show how the mind weaves them into a coherent whole. It embodies Deborah’s insight that perception is an act of construction for everyone. Her way of seeing simply assembles the picture from different materials — and the result is no less complete, no less beautiful.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_deborah_diffway.mp4", clip: "media/clips/a-different-way-to-see.mp4", audio: "../3D/gallery/audio/wing_1_2.mp3" },
    hotspots: []
  },
  {
    id: "beauty-in-the-blurry",
    title: "Beauty in the Blurry",
    artist: "Delric Pollins",
    target: 'targets/beauty-in-the-blurry.mind',
    image: 'targets/beauty-in-the-blurry.jpg',
    width: 960, height: 960,
    quote: "“There’s beauty in the blurry. When the details fade, you start to feel the world instead of just seeing it.” — Delric Pollins",
    description: "Beauty in the Blurry. By Delric Pollins. This image shows a city street at night rendered in soft, smeared light. Headlights, neon signs, and reflections on wet pavement dissolve into glowing streaks of blue and amber. Nothing holds a hard edge — the whole scene shimmers and moves. For someone with Stargardt disease, the sharp center of vision is what fades first, leaving a world of color, light, and motion without crisp detail. Rather than mourn that loss, the painting celebrates it: the blur becomes its own kind of beauty. It is an invitation to find wonder in impressionistic light — to recognize that a life lived through softened vision is still vivid, still full, still worth seeing.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_delric_blurry.mp4", clip: "media/clips/beauty-in-the-blurry.mp4", audio: "../3D/gallery/audio/wing_2_0.mp3" },
    hotspots: []
  },
  {
    id: "everything-in-its-place",
    title: "Everything in Its Place",
    artist: "Delric Pollins",
    target: 'targets/everything-in-its-place.mind',
    image: 'targets/everything-in-its-place.jpg',
    width: 960, height: 960,
    quote: "“When you can’t rely on your eyes, everything has to have its place. Order becomes a kind of freedom.” — Delric Pollins",
    description: "Everything in Its Place. By Delric Pollins. This image shows an everyday desk — a watch, a wallet, pens, a glass of water, a stack of books — resting on a surface that drops away into a churning ocean, as if the edge of the table is a cliff above a vast sea. For a person navigating sight loss, keeping each object in a known, fixed place is what makes daily life possible. The calm, ordered objects above contrast with the turbulent water below, capturing how a small act of organization holds back a sense of chaos. It is a meditation on control and trust — on building a reliable world by touch and memory, so that the unknown depths beneath never have to be faced unprepared.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_delric_place.mp4", clip: "media/clips/everything-in-its-place.mp4", audio: "../3D/gallery/audio/wing_2_1.mp3" },
    hotspots: []
  },
  {
    id: "the-temperature-setter",
    title: "The Temperature Setter",
    artist: "Delric Pollins",
    target: 'targets/the-temperature-setter.mind',
    image: 'targets/the-temperature-setter.jpg',
    width: 960, height: 960,
    quote: "“As a performer, you set the temperature in the room. That’s the one thing my eyes could never take from me.” — Delric Pollins",
    description: "The Temperature Setter. By Delric Pollins. This image shows a performer standing on a stage, microphone raised, silhouetted against a blaze of golden light. A sea of hands reaches up from the crowd below, the whole scene glowing with heat and energy. For Delric — a hip-hop artist and performer — the stage is where vision matters least and presence matters most. He cannot see every face, but he can feel the room, and he can move it. The painting captures that exchange of energy: the artist as the one who sets the emotional temperature of a space, turning a crowd into a single, electric moment. It is a portrait of power that has nothing to do with sight.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_delric_temp.mp4", clip: "media/clips/the-temperature-setter.mp4", audio: "../3D/gallery/audio/wing_2_2.mp3" },
    hotspots: []
  },
  {
    id: "how-not-who",
    title: "How, Not Who",
    artist: "Doreen Holmes",
    target: 'targets/how-not-who.mind',
    image: 'targets/how-not-who.jpg',
    width: 768, height: 768,
    quote: "“You don’t have to change anything about you, you’ve got to change the things you do and how you do them.” — Doreen Holmes",
    description: "How, Not Who. By Doreen Holmes. This image shows three stages of transformation arranged from left to right on a clean white background. On the left is a caterpillar, detailed with green, yellow, and blue patterns. In the center is a transitional form with green wings beginning to open. On the right is a fully formed butterfly with blue and gold wings. The three forms feel connected, like one life moving through different ways of being. The transformation does not suggest becoming someone else. It shows the same self adapting into new forms. The title How, Not Who gets to the heart of that idea. What changes is not identity, value, or purpose. What changes is the method, the approach, the way forward. The piece honors adaptation without self-erasure, and shows change as something that can preserve the person while opening a new way to live.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_doreen_metamorphosis.mp4", clip: "media/clips/how-not-who.mp4", audio: "../3D/gallery/audio/wing_3_0.mp3" },
    hotspots: []
  },
  {
    id: "invisibly-ours",
    title: "Invisibly, Ours",
    artist: "Doreen Holmes",
    target: 'targets/invisibly-ours.mind',
    image: 'targets/invisibly-ours.jpg',
    width: 768, height: 774,
    quote: "“There are those who say, ’Well, you don’t look blind,’ or ’you don’t act blind.’ I hear it all the time. We must remember that disabilities are not always visible.” — Doreen Holmes",
    description: "Invisibly, Ours. By Doreen Holmes. This image shows a large crowd made up of hundreds of small painted figures. The people are simplified, colorful, and varied. Some wear bright colors, others darker tones. Some appear close together, while others are separated by small spaces. No single person stands at the center — the entire image is a field of human presence. From a distance, the crowd looks like a pattern of color and shape. Up close, each figure suggests an individual life. Because the figures are stylized, their inner lives are not visible. The viewer cannot know from the outside what each person may be living with. The image connects to Doreen’s quote about invisible disability. It pushes back against statements like ’you don’t look blind’ or ’you don’t act blind.’ The crowd reminds us that appearance does not reveal everything. The title “Invisibly, Ours” suggests both hidden experience and shared belonging. The piece asks the viewer to look with more humility, and to remember that what cannot be seen is still real.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_doreen_invisibility.mp4", clip: "media/clips/invisibly-ours.mp4", audio: "../3D/gallery/audio/wing_3_1.mp3" },
    hotspots: []
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    artist: "Doreen Holmes",
    target: 'targets/unstoppable.mind',
    image: 'targets/unstoppable.jpg',
    width: 768, height: 768,
    quote: "“He said, ’When you walked into this office, what did you want to do before I gave you the news?’ I said I wanted to be a yoga teacher. He said, ’What’s stopping you?’” — Doreen Holmes",
    description: "Unstoppable. By Doreen Holmes. This image shows the silhouette of a woman in a yoga pose, balanced on one leg with her hands lifted in front of her. Behind her is a large, translucent pink flower, almost like a lotus, opening outward around her body. The background is warm and soft, filled with peach, rose, and golden tones. The image reflects the moment in Doreen’s quote when a difficult diagnosis is met with a simple question: “What’s stopping you?” She wanted to become a yoga teacher, and that question helped return the possibility to her. The flower suggests growth, renewal, and inner strength, while the yoga pose speaks to balance, focus, and embodiment. The image does not show someone being stopped by the news she received. It shows someone still rising, still centered, and still moving toward the life she wanted.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_doreen_unstoppable.mp4", clip: "media/clips/unstoppable.mp4", audio: "../3D/gallery/audio/wing_3_2.mp3" },
    hotspots: []
  },
  {
    id: "comfort-in-the-uncomfortable",
    title: "Comfort in the Uncomfortable",
    artist: "Michael Tubiak",
    target: 'targets/comfort-in-the-uncomfortable.mind',
    image: 'targets/comfort-in-the-uncomfortable.jpg',
    width: 900, height: 900,
    quote: "“I’ve learned to get comfortable being uncomfortable. That’s where the growth happens — pushing into the stuff that scares you.” — Michael Tubiak",
    description: "Comfort in the Uncomfortable. By Michael Tubiak. This image shows a lone mountain biker dropping into a vast, sculpted canyon of sunlit rock. The rider is tiny against the towering ridges and deep troughs that fall away on either side, the trail a thin ribbon winding down through the immense terrain. The scale is dizzying, and the path ahead demands total commitment. The composition places the viewer right at the edge of the descent, where the only way through is down and forward. The smallness of the rider against the enormity of the landscape captures both the fear and the freedom of the moment. For Mike, the image embodies his belief in getting comfortable being uncomfortable. The canyon is every daunting challenge; the rider is the choice to drop in anyway. Growth, the piece suggests, lives on the far side of fear.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_mike_comfort.mp4", clip: "media/clips/comfort-in-the-uncomfortable.mp4", audio: "../3D/gallery/audio/wing_4_0.mp3" },
    hotspots: []
  },
  {
    id: "spectrum-of-sight",
    title: "Spectrum of Sight",
    artist: "Michael Tubiak",
    target: 'targets/spectrum-of-sight.mind',
    image: 'targets/spectrum-of-sight.jpg',
    width: 900, height: 900,
    quote: "“Blindness isn’t black and white. It’s a whole spectrum — there are so many different ways of seeing, and so many of us living somewhere in between.” — Michael Tubiak",
    description: "Spectrum of Sight. By Michael Tubiak. This image shows a bold, graphic eye set against a vivid red background. The iris is built from concentric rings of rainbow color spiraling inward to a deep black pupil, while the upper and lower lids fold in like halves of a circle. It reads at once as an eye, a target, and a color wheel. The design is clean and symbolic rather than literal. The bands of color moving from bright to dark suggest a range — a continuum of vision rather than a single fixed state. The black center anchors the spectrum, a reminder that sight and its loss exist on a scale. The piece reflects Mike’s insistence that blindness is not all-or-nothing. “Spectrum of Sight” challenges the language around vision, honoring the many gradations of how people see and the wide community living across that spectrum.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_mike_spectrum.mp4", clip: "media/clips/spectrum-of-sight.mp4", audio: "../3D/gallery/audio/wing_4_1.mp3" },
    hotspots: []
  },
  {
    id: "wet-floor-signs-beware",
    title: "Wet Floor Signs, Beware!",
    artist: "Michael Tubiak",
    target: 'targets/wet-floor-signs-beware.mind',
    image: 'targets/wet-floor-signs-beware.jpg',
    width: 857, height: 857,
    quote: "“I turned myself into a comic book superhero — the Tubiak Maniak. Humor is how I take the power back from the hard stuff.” — Michael Tubiak",
    description: "Wet Floor Signs, Beware!. By Michael Tubiak. This image is a vivid comic-book panel. A caped superhero — the Tubiak Maniak — launches through the air mid-action, white cane swinging like a weapon, as a bold “SHWAK!” sound effect explodes across the scene and a hapless wet-floor sign goes flying. The style is pure comic energy: dynamic angles, saturated color, motion lines, and exaggerated impact. The humor is front and center, turning an everyday hazard for a blind person — the unexpected wet-floor sign — into a worthy nemesis for a caped hero. The piece captures Mike’s playful, defiant spirit. By casting himself as a superhero whose cane is a force to be reckoned with, he reclaims the obstacles of daily life with humor and bravado, transforming frustration into triumph.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_mike_comic.mp4", clip: "media/clips/wet-floor-signs-beware.mp4", audio: "../3D/gallery/audio/wing_4_2.mp3" },
    hotspots: []
  },
  {
    id: "fellowship",
    title: "Fellowship",
    artist: "Nikki Jeffords",
    target: 'targets/fellowship.mind',
    image: 'targets/fellowship.jpg',
    width: 900, height: 900,
    quote: "“I feel like there is a sacred brotherhood, sisterhood in the blind community — having people that I can commiserate with. Because blindness itself is usually not the problem. The problem is the attitudes of people that I encounter, and the world not being truly accessible. So having that fellowship is really important to me.” — Nikki Jeffords",
    description: "Fellowship. By Nikki Jeffords. This image is an abstract gathering of overlapping human figures, rendered in translucent layers of color. There is no traditional background — just a soft neutral field that allows the figures themselves to become the entire environment. The figures are simplified and stylized, built from rounded shapes and curved silhouettes rather than detailed anatomy. The palette moves through deep blues, teals, amber, ochre, coral, rose, black, and smoky gray. Because the shapes are semi-transparent, colors blend where figures overlap, creating a sense of layering, closeness, and shared presence. The image brings the quote to life by showing fellowship as mutual presence and recognition — the blind community as a brotherhood and sisterhood, a space where people do not need to explain themselves because others already understand the texture of that experience. It becomes a portrait of solidarity, refuge, and emotional recognition.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_nikki_fellowship.mp4", clip: "media/clips/fellowship.mp4", audio: "../3D/gallery/audio/wing_5_0.mp3" },
    hotspots: []
  },
  {
    id: "move-the-needle",
    title: "Move the Needle",
    artist: "Nikki Jeffords",
    target: 'targets/move-the-needle.mind',
    image: 'targets/move-the-needle.jpg',
    width: 900, height: 900,
    quote: "“If you can take away some of the pain that comes with the loss of vision, then that’s a beautiful thing. Researchers may think that moving that needle — just a little bit — to give a little more vision is not a big deal. But it is a big deal. It is a big deal.” — Nikki Jeffords",
    description: "Move the Needle. By Nikki Jeffords. This image features a clean black background with hundreds of brilliantly colored oval marks clustered around a central axis of white lines. They form both an abstract pattern and something like a chart — densest near the middle, gradually thinning out toward the edges in white, pale blue, yellow, orange, and red. On one level it evokes the language of vision science: measurement, fields of vision. But it does not feel cold. The concentration of marks at the center, and the way they thin into darkness, suggests the fragile and uneven nature of sight itself — how vision can narrow, scatter, and diminish. That is where it connects to Nikki’s deeper point: vision loss is not only physiological, but psychological. The image becomes a map of the visible and the invisible — a visual argument for why small gains in vision are not small at all, but deeply meaningful in a person’s life.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_nikki_needle.mp4", clip: "media/clips/move-the-needle.mp4", audio: "../3D/gallery/audio/wing_5_1.mp3" },
    hotspots: []
  },
  {
    id: "self-worth-a-new-understanding",
    title: "Self-Worth: A New Understanding",
    artist: "Nikki Jeffords",
    target: 'targets/self-worth-a-new-understanding.mind',
    image: 'targets/self-worth-a-new-understanding.jpg',
    width: 900, height: 900,
    quote: "“A blind woman said to me, ’Nikki, you need to know that blindness is respectable.’ That was a profound statement, and it altered my life in a huge way. It helped me realize that I did have worth. I didn’t have to be embarrassed anymore. That’s when my life started moving forward.” — Nikki Jeffords",
    description: "Self-Worth: A New Understanding. By Nikki Jeffords. This image shows a woman facing away from the viewer, walking through a freestanding doorway set in the middle of a surreal, vividly colored landscape. Around her, the land rises in soft, textured bands of deep blue, purple, olive, rust, orange, and red under a clear teal sky. The door, placed alone in this open landscape, becomes symbolic — less an object than a threshold. The composition feels calm, deliberate, and full of forward motion. What makes it so resonant is the way it turns an internal shift into something spatial and visible. The doorway stands for that pivotal conversation, where Nikki heard “blindness is respectable.” The image presents her journey as one of recognition and release — a passage into a fuller, more confident sense of self.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_nikki_selfworth.mp4", clip: "media/clips/self-worth-a-new-understanding.mp4", audio: "../3D/gallery/audio/wing_5_2.mp3" },
    hotspots: []
  },
  {
    id: "strengths-limitations",
    title: "Strengths & Limitations",
    artist: "Sophia Dunn-Walker",
    target: 'targets/strengths-limitations.mind',
    image: 'targets/strengths-limitations.jpg',
    width: 768, height: 768,
    quote: "“Having a visual impairment and working in a medium that’s highly visual, you have to rely on your key collaborators — finding people I really trust, who understand both my strengths and limitations. It really boils down to communication. Anyone who’s different can contribute a lot to a creative field, and a good leader knows how to incorporate that person.” — Sophia Dunn-Walker",
    description: "Strengths & Limitations. By Sophia Dunn-Walker. This image shows a woman’s face in profile, looking toward the right side of the composition. Her face is calm, almost sculptural, while the left side is built from a dense collage of film equipment, camera lenses, reels, mechanical parts, and layered visual forms. Bright blocks of orange, teal, purple, and blue move through the composition. The image feels like a portrait of creativity built through collaboration. The woman’s face remains clear and focused, while the tools of filmmaking surround and intersect with her. The camera equipment represents the highly visual medium Sophia works in, and the layered forms suggest the many people, skills, and systems that help bring a creative vision to life. It shows that making visual work while visually impaired is not about working alone or hiding what is difficult. It is about communication, trust, and surrounding yourself with collaborators who understand both what you can bring and what support you need — collaboration not as a compromise, but as part of the creative process itself.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_sophia_collab.mp4", clip: "media/clips/strengths-limitations.mp4", audio: "../3D/gallery/audio/wing_6_0.mp3" },
    hotspots: []
  },
  {
    id: "where-people-are",
    title: "Where People Are",
    artist: "Sophia Dunn-Walker",
    target: 'targets/where-people-are.mind',
    image: 'targets/where-people-are.jpg',
    width: 768, height: 768,
    quote: "“My main message would be to let the individual tell you what they need and let them tell you what their condition is like. I really try to see people on an individual basis, because there’s such a range in what people need and where people are.” — Sophia Dunn-Walker",
    description: "Where People Are. By Sophia Dunn-Walker. This image shows an aerial view of a monumental, layered circular structure. The form descends inward in wide rings, almost like a vast amphitheater or civic space seen from above. Each level is filled with people — some standing alone, others moving in small groups, many gathered along the curved pathways at different heights. The scale gives the image a sense of complexity and humanity. There are many people here, but they are not all in the same place or moving in the same way. Some are close to the center, others remain near the edges. The structure suggests a world with many different needs, positions, and ways of moving through it. The image reflects Sophia’s message about letting each individual tell you what they need and where they are. Rather than one universal kind of support, the piece shows a layered human environment. It suggests that empathy begins by paying attention to the person in front of you — listening first, and shaping support around what people actually need.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_sophia_meeting.mp4", clip: "media/clips/where-people-are.mp4", audio: "../3D/gallery/audio/wing_6_1.mp3" },
    hotspots: []
  },
  {
    id: "full-immersion",
    title: "Full Immersion",
    artist: "Sophia Dunn-Walker",
    target: 'targets/full-immersion.mind',
    image: 'targets/full-immersion.jpg',
    width: 768, height: 768,
    quote: "“Full immersion in a different culture can be even richer for a visually impaired person, because everything is different. The cobblestones feel different. The way it smells is different. The lighting is different. The languages you hear are different. It’s a very, very rich experience.” — Sophia Dunn-Walker",
    description: "Full Immersion. By Sophia Dunn-Walker. This image shows a narrow city street viewed from above, as if the viewer is looking down into a canyon of buildings. The sides of the street are dark and steep, with tall structures rising on both sides and closing in around the center. Light pours down from above in long, soft streaks, and small figures move through the scene. The image feels blurred, layered, and sensory rather than sharply detailed. The buildings, people, light, and movement blend together, creating the feeling of being inside a place rather than simply looking at it from a distance. The composition pulls the viewer downward and inward, into the street itself, where sound, smell, texture, light, and motion all seem to exist at once. The piece reflects Sophia’s idea that travel and cultural immersion can be especially rich for a visually impaired person. It is not focused on a postcard view, but on the full experience of being there — the feel of the street, the shifting light, the atmosphere of an unfamiliar place. A place is not only seen, but experienced in so many ways.",
    overlay: { type: 'story', anim: "../3D/gallery/anim/wix_sophia_travel.mp4", clip: "media/clips/full-immersion.mp4", audio: "../3D/gallery/audio/wing_6_2.mp3" },
    hotspots: []
  }

  // Paste new artworks here, separated by commas. add.html writes them for you.
];

// ─────────────────────────────────────────────────────────────
//  EXHIBITIONS: many artworks, one QR code
//  Link: .../AR/?show=<id>
//  'target' is optional. Leave it out and the phone joins each artwork's own
//  tracking file. With a target (built by exhibition.html), the order of
//  'artworks' must match the order used to build it.
// ─────────────────────────────────────────────────────────────

export const EXHIBITIONS = [
  {
    id: 'test-room',
    title: 'Test Room',
    artworks: ['fox-at-dusk', 'harbor-light'],
    target: 'targets/test-room.mind'
  },

  // Stress test rooms: no 'target' line, so the phone joins each artwork's own tracking file.
  {
    id: 'blind-canvas-10',
    title: 'Blind Canvas · First 10',
    artworks: [
      '5-weeks-on-my-side', 'almost-blindness', 'curating-hope', 'find-your-village', 'take-time-to-bloom',
      'pour-in-the-love', 'roots-of-kinship', 'all-lifes-beauty', 'the-only-light-well-see',
      'pathways-unveiled'
    ]
  },
  {
    id: 'blind-canvas-25',
    title: 'Blind Canvas · First 25',
    artworks: [
      '5-weeks-on-my-side', 'almost-blindness', 'curating-hope', 'find-your-village', 'take-time-to-bloom',
      'pour-in-the-love', 'roots-of-kinship', 'all-lifes-beauty', 'the-only-light-well-see',
      'pathways-unveiled', 'reflections-of-sisterhood', 'all-the-possibilities', 'a-new-day',
      'music-on-the-streets', 'roller-coaster-of-emotions', 'i-am-blind-like-my-hair-is-brown',
      'reaching-past-blindness', 'reasons-for-a-cure', 'midnight-melodies', 'moment-of-communion',
      'fearless-request', 'the-scope-of-communication', 'rhapsody-in-blue', 'reliroo', 'harmonious-gathering'
    ]
  },
  {
    id: 'blind-canvas-all',
    title: 'Blind Canvas · All',
    artworks: [
      '5-weeks-on-my-side', 'almost-blindness', 'curating-hope', 'find-your-village', 'take-time-to-bloom',
      'pour-in-the-love', 'roots-of-kinship', 'all-lifes-beauty', 'the-only-light-well-see',
      'pathways-unveiled', 'reflections-of-sisterhood', 'all-the-possibilities', 'a-new-day',
      'music-on-the-streets', 'roller-coaster-of-emotions', 'i-am-blind-like-my-hair-is-brown',
      'reaching-past-blindness', 'reasons-for-a-cure', 'midnight-melodies', 'moment-of-communion',
      'fearless-request', 'the-scope-of-communication', 'rhapsody-in-blue', 'reliroo', 'harmonious-gathering',
      'napkin-please', 'seeing-the-world-together', 'hope-is-not-lost', 'pedals-of-freedom',
      'the-bridge-of-perception', 'rhythm-of-life', 'the-dark-uncertainty', 'goalball-is',
      'the-visions-that-we-share', 'flow-state', 'lighthouse-of-hope', 'telephone-poles', 'back-of-a-harley',
      'joyride', 'haute-couture-dreams', 'embracing-unity', 'a-bright-future', 'the-harmony-of-vision',
      'the-power-within', 'the-gray-zone', 'inner-peace-in-outer-chaos', 'the-mirror', 'walk-through-fear',
      'decision-divide',
      // the New Artists Wing
      'the-button-is-to-the-left', 'light-on-the-other-side', 'one-love', 'art-raised-me-up', 'live-the-beauty',
      'a-different-way-to-see', 'beauty-in-the-blurry', 'everything-in-its-place', 'the-temperature-setter', 'how-not-who',
      'invisibly-ours', 'unstoppable', 'comfort-in-the-uncomfortable', 'spectrum-of-sight', 'wet-floor-signs-beware',
      'fellowship', 'move-the-needle', 'self-worth-a-new-understanding', 'strengths-limitations', 'where-people-are',
      'full-immersion'
    ]
  },
  {
    id: 'new-artists-wing',
    title: 'Blind Canvas · New Artists Wing',
    artworks: [
      'the-button-is-to-the-left', 'light-on-the-other-side', 'one-love', 'art-raised-me-up', 'live-the-beauty',
      'a-different-way-to-see', 'beauty-in-the-blurry', 'everything-in-its-place', 'the-temperature-setter', 'how-not-who',
      'invisibly-ours', 'unstoppable', 'comfort-in-the-uncomfortable', 'spectrum-of-sight', 'wet-floor-signs-beware',
      'fellowship', 'move-the-needle', 'self-worth-a-new-understanding', 'strengths-limitations', 'where-people-are',
      'full-immersion'
    ]
  }

  // Paste new exhibitions here, separated by commas. exhibition.html writes them for you.
];
