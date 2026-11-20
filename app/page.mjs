import { films } from './films.mjs';

const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const lines = values => values.map(escape).join('<br>');

function renderFilm(film, i) {
  return `        <article class="film-project${i % 2 ? " film-project-reverse" : ""}" aria-labelledby="${film.id}-title">
          <div class="film-caption">
            <span class="film-number" aria-hidden="true">${String(i+1).padStart(2,"0")}</span>
            <h3 id="${film.id}-title">${lines(film.title)}</h3>
            <span class="orange-rule" aria-hidden="true"></span>
            <p class="film-category">${lines(film.category)}</p>
          </div>
          <div class="film-content">
            <div class="film-player" data-player${film.aspectRatio ? ` style="aspect-ratio:${film.aspectRatio}"` : ""}>
              <video id="${film.id}-video" controls playsinline preload="none" poster="./assets/${film.slug}-poster.jpg" aria-label="${escape(film.description)}">
                <source data-src="./assets/${film.slug}.mp4" type="video/mp4">
                Your browser does not support video. <a href="./assets/${film.slug}.mp4">Download ${escape(film.title.join(" "))}</a>.
              </video>
              <button class="play-overlay" type="button" aria-label="Play ${escape(film.title.join(" "))}"><span class="play-circle"><svg viewBox="0 0 16 18" aria-hidden="true"><path d="M2 1 15 9 2 17Z" fill="currentColor"/></svg></span><span class="play-label">Watch the film <span aria-hidden="true">↗</span></span></button>
              <span class="film-duration" aria-hidden="true">${film.duration}</span>
            </div>
            ${film.note ? `<p class="film-note">${lines(film.note)}</p>` : ""}
            <p class="playback-status" role="status"></p>
          </div>
        </article>`;
}

export function renderPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#10213d">
  <meta name="description" content="Character-led animated films by Piyush for orthodontic practices, HVAC businesses, Pilates studios and dog trainers.">
  <meta property="og:title" content="Piyush — Animated stories. Real-world businesses.">
  <meta property="og:description" content="Small business stories, brought to life. Explore character-led animated advertising films.">
  <meta property="og:type" content="website">
  <title>Piyush — Animated stories. Real-world businesses.</title>
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <link rel="preload" href="./assets/story-world.webp" as="image" media="(min-width: 701px)" fetchpriority="high">
  <link rel="preload" href="./assets/story-world-small.webp" as="image" media="(max-width: 700px)" fetchpriority="high">
  <link rel="stylesheet" href="./styles.css">
  <script src="./site-config.js" defer></script>
  <script src="./main.js" defer></script>
  <script src="./story-thread.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#films">Skip to films</a>
  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <picture class="hero-art" aria-hidden="true">
        <source media="(max-width: 700px)" srcset="./assets/story-world-small.webp">
        <img src="./assets/story-world.webp" alt="" width="1920" height="1280" fetchpriority="high">
      </picture>
      <header class="site-header">
        <a class="wordmark" href="#top" aria-label="Piyush, home">PIYUSH<span class="brand-dot">.</span></a>
        <nav aria-label="Main navigation">
          <a href="#films">Films</a>
          <a href="#studio">Studio</a>
          <a class="nav-contact" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">04 / Story world</p>
        <h1 id="hero-title">Animated stories.<br><em>Real-world businesses.</em></h1>
        <p class="hero-subtitle">Character-led AI films for your social media.</p>
        <a class="button button-navy" href="#films">Explore the films <svg viewBox="0 0 16 18" aria-hidden="true"><path d="M2 1 15 9 2 17Z" fill="currentColor"/></svg></a>
      </div>
      <a class="hero-scroll" href="#films" aria-label="Scroll to the films"><span aria-hidden="true">↓</span></a>
    </section>

    <section class="films" id="films" aria-labelledby="films-title">
      <svg class="film-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 110C350 14 925 -5 1440 40V120H0Z"/></svg>
      <div class="section-heading">
        <h2 class="eyebrow" id="films-title">Two businesses. Two stories.</h2>
        <span class="eyebrow muted">Selected films / 01—02</span>
      </div>
      <div class="film-grid">
${films.slice(0, 2).map(renderFilm).join("\n")}
      </div>
      <a class="explore-studio" href="#more-stories"><span aria-hidden="true">↓</span><span class="eyebrow">Scroll to explore</span></a>
    </section>

    <section class="park-scene" id="more-stories" aria-labelledby="park-title">
      <svg class="park-seam" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H1440V3C1000 97 480 95 0 15Z"/></svg>
      <picture>
        <source media="(max-width: 700px)" srcset="./assets/pilates-park-small.webp">
        <img src="./assets/pilates-park.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="Inside a sunlit Pilates studio, clients exercise on wooden reformers. Through the window, Rocky and his owner work with a dog trainer in the park.">
      </picture>
      <h2 id="park-title">Everyday moments.<br><em>Stories that connect.</em></h2>
      <span class="park-thread-mask" aria-hidden="true"></span>
    </section>

    <section class="films more-films" aria-label="Pilates and dog training films">
      <svg class="film-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 115C390 -12 965 95 1440 6V120H0Z"/></svg>
      <div class="film-grid">
${films.slice(2).map((film, i) => renderFilm(film, i + 2)).join("\n")}
      </div>
      <a class="explore-studio" href="#studio"><span aria-hidden="true">↓</span><span class="eyebrow">There’s a story behind every film</span></a>
    </section>

    <section class="studio" id="studio" aria-labelledby="studio-title">
      <svg class="studio-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30C330 -50 850 140 1440 20V90H0Z"/></svg>
      <div class="studio-inner">
        <div class="studio-intro">
          <p class="eyebrow">The person behind the pictures</p>
          <h2 id="studio-title">Made by<br>Piyush<span>.</span></h2>
          <p class="studio-tagline">Small business stories,<br>brought to life.</p>
        </div>
        <div class="process">
          <p class="process-intro">Your business has a story.<br>I turn it into a world people can watch.</p>
          <ol class="process-steps">
            <li><span class="process-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="5" width="25" height="36" rx="1"/><path d="M18 13h13M18 19h13M18 25h13M18 31h8"/></svg></span><h3>Brief</h3><p>Your business.<br>Your audience.</p></li>
            <li><span class="process-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m9 34-2 8 8-2L40 15 33 8 9 34ZM29 12l7 7M9 34l6 6M33 8l4-4 7 7-4 4"/></svg></span><h3>Story</h3><p>Characters with<br>something to say.</p></li>
            <li><span class="process-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 19h36v23H6zM6 19 3 9l35-7 3 10-35 7ZM12 8l-3 9M24 5l-4 9M35 3l-4 9M20 25l10 6-10 6z"/></svg></span><h3>Film</h3><p>Animation, sound<br>&amp; your brand.</p></li>
          </ol>
        </div>
      </div>
    </section>

    <section class="contact" id="contact" aria-labelledby="contact-title">
      <div class="contact-inner">
        <div><p class="eyebrow">Let’s make something worth watching</p><h2 id="contact-title">Your business could<br>be the next story.</h2></div>
        <button class="button button-cream" type="button" data-contact>Start a conversation <span aria-hidden="true">↗</span></button>
      </div>
      <footer><a class="footer-logo" href="#top" aria-label="Piyush, back to top">PIYUSH.</a><p>Storytelling. Animation. A little imagination.</p><a href="#top">Back to top <span aria-hidden="true">↑</span></a></footer>
    </section>
    <svg class="journey-thread" aria-hidden="true" focusable="false">
      <defs>
        <mask id="thread-content-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
          <rect class="thread-mask-base" fill="white"/>
          <g class="thread-content-cutouts" fill="black"></g>
        </mask>
        <linearGradient id="thread-color" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="2400">
          <stop offset="0" stop-color="#f35a26"/>
          <stop class="thread-color-turn" offset="85%" stop-color="#f35a26"/>
          <stop offset="100%" stop-color="#ffb38c"/>
        </linearGradient>
        <marker id="thread-arrow" viewBox="0 0 14 14" refX="10" refY="7" markerWidth="11" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse">
          <path d="m4 2 6 5-6 5" fill="none" stroke="#ffb38c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
      </defs>
      <path class="journey-thread-measure" visibility="hidden"/>
      <path class="journey-thread-path" mask="url(#thread-content-mask)"/>
      <g mask="url(#thread-content-mask)">
        <g class="journey-thread-head" opacity="0">
          <path class="thread-head-halo" d="M-11 -5 L0 0 -11 5"/>
          <path class="thread-head-point" d="M-11 -5 L0 0 -11 5"/>
        </g>
      </g>
    </svg>
  </main>
  <dialog id="contact-dialog" aria-labelledby="dialog-title">
    <button class="dialog-close" type="button" aria-label="Close contact information">×</button>
    <p class="eyebrow">The next chapter</p>
    <h2 id="dialog-title">A new story<br>starts here<span>.</span></h2>
    <p>Contact details will be available soon.<br>In the meantime, take a look at the films.</p>
    <a class="button button-navy" href="#films" data-close-dialog>Explore the films <span aria-hidden="true">↗</span></a>
  </dialog>
  <noscript><style>.play-overlay,.film-duration{display:none}</style><p class="noscript-note">Download a film: ${films.map(film => `<a href="./assets/${film.slug}.mp4">${escape(film.title.join(" "))}</a>`).join(" · ")}.</p></noscript>
</body>
</html>
`;
}
