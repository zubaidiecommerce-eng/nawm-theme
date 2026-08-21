/**
 * pdp-gallery.js — de galerij in het koopblok. PDP SPEC §3.1 en §10.
 *
 * Geen carrousel-library en geen autoplay. De strip is een gewone
 * scroll-container met scroll-snap; dit script doet alleen drie dingen die CSS
 * niet kan:
 *
 *   1. de thumbnail en de indicator bijwerken bij het scrollen
 *   2. springen naar een beeld wanneer je een thumbnail kiest
 *   3. pijltjestoetsen laten werken binnen de thumbnailrij
 *
 * Valt dit script uit, dan blijft de galerij bruikbaar: swipen werkt, de
 * thumbnails zijn ankerlinks naar de slides.
 */

const roots = document.querySelectorAll('[data-pdp-gallery]');

for (const root of roots) {
  const track = root.querySelector('[data-gallery-track]');
  const slides = [...root.querySelectorAll('[data-gallery-slide]')];
  const thumbs = [...root.querySelectorAll('[data-gallery-thumb]')];
  const position = root.querySelector('[data-gallery-position]');

  if (!track || slides.length < 2) continue;

  let current = 0;
  let reported = false;

  const setActive = (index) => {
    if (index === current) return;
    current = index;

    thumbs.forEach((thumb, i) => {
      thumb.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    if (position) position.textContent = String(index + 1);
  };

  /* Eén melding per bezoek is genoeg om te weten dát de galerij gebruikt is. */
  const report = () => {
    if (reported) return;
    reported = true;
    if (typeof window.nawmTrack === 'function') window.nawmTrack('gallery_interact');
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(slides.indexOf(entry.target));
        }
      },
      { root: track, threshold: 0.6 }
    );

    for (const slide of slides) io.observe(slide);
  }

  track.addEventListener('scroll', report, { passive: true, once: true });

  const goTo = (index) => {
    const slide = slides[index];
    if (!slide) return;
    /* scrollIntoView zou ook de pagina verschuiven; scrollTo blijft binnen de strip. */
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    setActive(index);
    report();
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      goTo(index);
      slides[index]?.focus({ preventScroll: true });
    });

    thumb.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (step === 0) return;
      event.preventDefault();
      const next = (index + step + thumbs.length) % thumbs.length;
      thumbs[next].focus();
      goTo(next);
    });
  });
}
