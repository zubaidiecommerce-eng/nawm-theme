/**
 * nawm-reveal.js — IntersectionObserver reveal. BUILD SPEC §3.5.
 *
 * Beweegt licht en opaciteit, maximaal 12px translate, één keer per element.
 * Bij prefers-reduced-motion doet dit script niets: de CSS toont alles direct.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function revealAll() {
  for (const el of document.querySelectorAll('.nawm-reveal')) el.classList.add('is-revealed');
}

if (reduce.matches || !('IntersectionObserver' in window)) {
  revealAll();
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
  );

  const observe = () => {
    for (const el of document.querySelectorAll('.nawm-reveal:not(.is-revealed)')) io.observe(el);
  };

  observe();
  document.addEventListener('shopify:section:load', observe);
  reduce.addEventListener('change', (e) => {
    if (e.matches) revealAll();
  });
}
