# Piyush — Story World

A responsive single-page animated advertising portfolio based on the selected Story World mockup. HTML, CSS and vanilla JavaScript; Node.js renders the full page and streams the films. The same renderer also produces a static build. No npm dependencies, runtime server, tracking or third-party font requests are required on GitHub Pages.

## Run locally

Requires Node.js 22 or later. Run `npm start` and open http://127.0.0.1:3000 for the Node.js app. No dependency installation is required. Edit `app/page.mjs` for page layout and `app/films.mjs` for film content. The build regenerates `public/index.html` and `dist/index.html`.

For development with automatic server restarts:

```sh
npm run dev
```

Open http://127.0.0.1:4173. The development server supports byte-range requests for seeking through the videos. Stop it with Ctrl+C. Set `PORT` to use another port.

```sh
npm run check
npm run build
npm run preview
```

The finished static website is in `dist/`. `npm run preview` serves that output on the same port; stop the development server first. With either server running, `node scripts/smoke.mjs` checks HTTP assets and byte-range streaming. Set `PREVIEW_URL` for a different server URL.

## GitHub Pages

The public portfolio is hosted at [Piyush Story World](https://piyush-120898.github.io/piyush-story-world/). The source is in [Piyush-120898/piyush-story-world](https://github.com/Piyush-120898/piyush-story-world).

Push to `main` to publish an update. GitHub Actions checks the source, runs the Node.js static build and deploys `dist/` to Pages. The Node.js HTTP server is available for local use; Pages serves the generated HTML, JavaScript and assets.

## Contact destination

Per Piyush's instruction, contact information is deferred. Edit `public/site-config.js` when a real email, WhatsApp or booking link is ready:

```js
window.STUDIO_CONFIG = Object.freeze({ contactUrl: 'YOUR_REAL_CONTACT_URL' });
```

The implementation accepts `https://` and `mailto:` destinations. Until configured, the conversation button opens an accessible dialog explaining that contact details will be available soon. It never collects data or claims a message was sent.

## Assets and playback

- `public/assets/the-smile-story.mp4`: supplied orthodontic film, 480 × 848, 78.42 seconds.
- `public/assets/comfort-at-home.mp4`: supplied HVAC film, 480 × 848, 59.79 seconds.
- Posters are extracted from the corresponding real films.
- `public/assets/story-world.webp`: desktop hero artwork, about 277 KB.
- `public/assets/story-world-small.webp`: mobile artwork, about 101 KB.
- `public/assets/fonts/`: self-hosted DM Serif Display fonts and their SIL Open Font License.

Videos retain the supplied originals' encoding and are copied non-destructively from Downloads. They load on demand, never autoplay, play inline on mobile and expose native controls after starting. Starting one pauses the other. No caption track has been fabricated. Without JavaScript, direct download links remain available.

The generated background is artwork only. All typography, navigation, sections, buttons, icons and video controls are real HTML/CSS/JavaScript. The full-page reference mockup is not used as a flat website image. The hero prompt and provenance are in `ASSETS.md`.

## Scroll journey

One continuous SVG thread starts beside the HVAC homeowner at the curved hero boundary. Scrolling draws it toward the dental film, the HVAC film, Brief → Story → Film, and the conversation button. The current destination glows; previous destinations keep a subtle accent. Scrolling upward retraces the line and clears the highlights. The path adapts to the actual element positions when the page resizes or fonts load.

The desktop films activate sequentially even though they sit side by side. On mobile, the path winds between the stacked films. Masks keep the thread behind text, controls and icons. Reduced-motion mode shows a static thread and removes the moving point. The animation uses passive scroll listeners and stops requesting frames when it has settled.

## Verification

Source checks and the static build pass. Both files have H.264 video and AAC audio. HTTP checks verify asset responses and 206 byte-range streaming. `scripts/check-scroll-thread.mjs` executes the production controller with layout fixtures and sampled SVG curves at widths from 320 to 1920 pixels, checking six ordered activations, reverse scrolling, CTA completion, resizing, reduced motion and settled animation frames. These logic checks do not replace browser testing.

Browser-based visual and interaction QA was blocked because embedded browser access was unavailable and the Windows computer-use tool stopped when it could not reliably determine Chrome's current URL. Desktop/mobile appearance, playback, keyboard behavior, and reduced-motion behavior still need browser verification.

