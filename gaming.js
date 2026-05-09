const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

const cells = [...document.querySelectorAll('.gaming-cell')];
let currentIndex = 0;

// Capture first frame of each video and set as poster thumbnail
cells.forEach(cell => {
  const video = cell.querySelector('video');
  if (!video) return;

  video.addEventListener('loadeddata', function capturePoster() {
    video.currentTime = 0.01;
    video.removeEventListener('loadeddata', capturePoster);
  }, { once: true });

  video.addEventListener('seeked', function onSeeked() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 360;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      video.poster = canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {}
    video.removeEventListener('seeked', onSeeked);
  }, { once: true });
});

// Hover play/pause for video cells
cells.forEach(cell => {
  const video = cell.querySelector('video');
  if (!video) return;
  cell.addEventListener('mouseenter', () => video.play().catch(() => {}));
  cell.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
});

function getMediaType(cell) {
  if (cell.querySelector('img'))   return 'image';
  if (cell.querySelector('video')) return 'video';
  return null;
}

function openLightbox(index) {
  const cell = cells[index];
  const type = getMediaType(cell);
  if (!type) return;

  currentIndex = index;

  const isImage = type === 'image';
  lightboxImg.style.display   = isImage ? '' : 'none';
  lightboxVideo.style.display = isImage ? 'none' : '';

  if (isImage) {
    const img = cell.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = img.alt || '';
  } else {
    const vid = cell.querySelector('video');
    lightboxVideo.src = vid.src;
    lightboxVideo.load();
    lightboxVideo.play().catch(() => {});
    lightboxCap.textContent = cell.querySelector('.gaming-placeholder-label')?.textContent || '';
  }

  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxVideo.pause();
  lightboxVideo.src = '';
  lightboxImg.src = '';
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  // Skip cells that are still placeholders
  let next = (currentIndex + dir + cells.length) % cells.length;
  let tries = 0;
  while (!getMediaType(cells[next]) && tries < cells.length) {
    next = (next + dir + cells.length) % cells.length;
    tries++;
  }
  if (getMediaType(cells[next])) openLightbox(next);
}

cells.forEach((cell, i) => {
  cell.addEventListener('click', () => {
    if (getMediaType(cell)) openLightbox(i);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click',  () => shiftLightbox(-1));
lightboxNext.addEventListener('click',  () => shiftLightbox(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  shiftLightbox(-1);
  if (e.key === 'ArrowRight') shiftLightbox(1);
});

// Scroll reveal
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('card-in'); }),
  { threshold: 0.08 }
);
cells.forEach((c, i) => {
  c.style.transitionDelay = `${Math.min(i, 4) * 0.07}s`;
  revealObserver.observe(c);
});
