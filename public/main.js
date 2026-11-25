const players = [...document.querySelectorAll('[data-player]')];

for (const player of players) {
  const video = player.querySelector('video');
  const source = video.querySelector('source');
  const button = player.querySelector('.play-overlay');
  const status = player.parentElement.querySelector('.playback-status');

  function loadVideo() {
    if (!source.hasAttribute('src')) {
      source.src = source.dataset.src;
      video.load();
    }
  }

  async function startFilm() {
    loadVideo();
    player.classList.add('is-loading');
    button.disabled = true;
    status.textContent = '';
    try {
      await video.play();
    } catch {
      player.classList.remove('is-started');
      status.textContent = 'Couldn’t start the film. Please try again or ';
      const link = document.createElement('a');
      link.href = source.dataset.src;
      link.textContent = 'open the video directly';
      status.append(link, '.');
    } finally {
      player.classList.remove('is-loading');
      button.disabled = false;
    }
  }

  button.addEventListener('click', startFilm);
  // Keyboard users may reach the native player before the overlay.
  video.addEventListener('focus', loadVideo, { once: true });
  video.addEventListener('play', () => {
    player.classList.add('is-started');
    status.textContent = '';
    players.forEach(other => {
      if (other !== player) other.querySelector('video').pause();
    });
  });
  video.addEventListener('error', () => {
    player.classList.remove('is-started', 'is-loading');
    button.disabled = false;
    status.textContent = 'The film is unavailable right now. Please try again.';
  });
  video.addEventListener('ended', () => {
    player.classList.remove('is-started');
    button.disabled = false;
  });
}

const dialog = document.querySelector('#contact-dialog');
const whatsappLink = dialog.querySelector('[data-whatsapp]');
const whatsappUrl = window.STUDIO_CONFIG?.contactUrl?.trim();
if (whatsappUrl && /^https:\/\//i.test(whatsappUrl)) {
  whatsappLink.href = whatsappUrl;
  whatsappLink.hidden = false;
}
document.querySelector('[data-contact]').addEventListener('click', () => dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.film-project, .studio-inner, .contact-inner').forEach(section => {
    section.classList.add('reveal-ready');
    observer.observe(section);
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) players.forEach(player => player.querySelector('video').pause());
});
