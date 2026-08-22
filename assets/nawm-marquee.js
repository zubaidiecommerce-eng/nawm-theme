/**
 * nawm-marquee.js — de horizontaal lopende band met beoordelingen.
 *
 * De CSS kan de band niet zelf naadloos laten lopen, want daarvoor moet je de
 * werkelijke breedte van één set kaarten weten. Dit script doet drie dingen:
 *
 *   1. de kaarten één keer dupliceren, zodat er altijd een tweede set klaarstaat
 *      om in beeld te schuiven
 *   2. de afstand en de duur meten en als custom property doorgeven
 *   3. de animatie pas aanzetten wanneer de band in beeld is
 *
 * De duplicaten krijgen `aria-hidden` en worden uit de tabvolgorde gehaald: een
 * screenreader hoort de beoordelingen één keer, niet twee keer.
 *
 * Snelheid is uitgedrukt in pixels per seconde, niet in een vaste duur. Anders
 * loopt een band met drie kaarten razendsnel en een band met twintig kaarten
 * als stroop.
 */

const PIXELS_PER_SECOND = 45;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

for (const marquee of document.querySelectorAll('[data-nawm-marquee]')) {
  if (!marquee.classList.contains('is-animated')) continue;

  const track = marquee.querySelector('[data-marquee-track]');
  if (!track) continue;

  const originals = [...track.children];
  if (originals.length < 3) continue;

  let cloned = false;

  const measure = () => {
    /* De afstand is de breedte van de oorspronkelijke set plus de tussenruimte
       die erachter komt. Precies dát stuk schuift weg, waarna de kopie exact op
       de plek van het origineel staat. */
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
    let width = 0;
    for (const item of originals) width += item.getBoundingClientRect().width + gap;

    if (width <= 0) return;

    marquee.style.setProperty('--marquee-distance', `${width}px`);
    marquee.style.setProperty('--marquee-duration', `${(width / PIXELS_PER_SECOND).toFixed(1)}s`);
  };

  const clone = () => {
    if (cloned) return;
    cloned = true;
    for (const item of originals) {
      const copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      for (const focusable of copy.querySelectorAll('a, button, [tabindex]')) {
        focusable.setAttribute('tabindex', '-1');
      }
      track.appendChild(copy);
    }
  };

  const enable = () => {
    if (reduce.matches) {
      marquee.classList.remove('is-running');
      return;
    }
    clone();
    measure();
    marquee.classList.add('is-running');
  };

  /* Pas aanzetten wanneer de band in beeld komt: een animatie die onderaan de
     pagina staat te draaien terwijl niemand kijkt, kost alleen maar batterij. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          enable();
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(marquee);
  } else {
    enable();
  }

  addEventListener('resize', () => {
    if (marquee.classList.contains('is-running')) measure();
  }, { passive: true });

  reduce.addEventListener('change', (event) => {
    if (event.matches) marquee.classList.remove('is-running');
    else enable();
  });
}
