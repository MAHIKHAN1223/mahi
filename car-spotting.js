// Hover: muted preview play/pause
document.querySelectorAll('.gallery-card').forEach(card => {
  const video = card.querySelector('video');
  if (!video) return;
  card.addEventListener('mouseenter', () => video.play().catch(() => {}));
  card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
});

// Lightbox
const lightbox      = document.getElementById('lightbox');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

const cards = [...document.querySelectorAll('.gallery-card')];
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const card  = cards[index];
  const src   = card.querySelector('video').src;
  const name  = card.dataset.name;
  const detail = card.dataset.detail;

  lightboxVideo.src = src;
  lightboxVideo.load();
  lightboxVideo.play().catch(() => {});
  lightboxCap.textContent = `${name} · ${detail}`;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxVideo.pause();
  lightboxVideo.src = '';
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  openLightbox((currentIndex + dir + cards.length) % cards.length);
}

cards.forEach((card, i) => {
  card.addEventListener('click', () => openLightbox(i));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => shiftLightbox(-1));
lightboxNext.addEventListener('click', () => shiftLightbox(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  shiftLightbox(-1);
  if (e.key === 'ArrowRight') shiftLightbox(1);
});

// Scroll-reveal on cards
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('card-in'); }),
  { threshold: 0.1 }
);
cards.forEach((c, i) => {
  c.style.transitionDelay = `${i * 0.06}s`;
  revealObserver.observe(c);
});
