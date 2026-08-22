/**
 * nawm-marquee.js — de horizontaal lopende band met beoordelingen.
 *
 * De CSS kan de band niet zelf naadloos laten lopen, want daarvoor moet je de
 * werkelijke breedte van de kaarten weten. Dit script doet drie dingen:
 *
 *   1. de set kaarten zo vaak kopiëren dat de band ruim breder is dan het
 *      scherm — met twee of drie beoordelingen is één kopie niet genoeg, en dan
 *      zie je de band halverwege leeglopen
 *   2. de afstand en de duur meten en als custom property doorgeven
 *   3. de animatie pas aanzetten wanneer de band in beeld komt
 *
 * De kopieën krijgen `aria-hidden` en gaan uit de tabvolgorde: een screenreader
 * hoort de beoordelingen één keer, niet vier keer.
 *
 * Snelheid staat in pixels per seconde, niet in een vaste duur. Anders raast
 * een band met drie kaarten voorbij en kruipt een band met twintig.
 */

const PIXELS_PER_SECOND = 42;
const MIN_TRACK_RATIO = 2.2; /* de band moet ruim breder zijn dan zijn venster */
const MAX_COPIES = 8;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

for (const marquee of document.querySelectorAll('[data-nawm-marquee]')) {
  if (!marquee.classList.contains('is-animated')) continue;

  const track = marquee.querySelector('[data-marquee-track]');
  if (!track) continue;

  const originals = [...track.children];
  if (originals.length === 0) continue;

  let prepared = false;

  const gapOf = () => parseFloat(getComputedStyle(track).columnGap || '0') || 0;

  /** Breedte van één volledige set kaarten, inclusief de ruimte erachter. */
  const setWidth = () => {
    const gap = gapOf();
    let width = 0;
    for (const item of originals) width += item.getBoundingClientRect().width + gap;
    return width;
  };

  const prepare = () => {
    if (prepared) return;

    const base = setWidth();
    if (base <= 0) return;

    /* Zoveel kopieën als nodig om de band ruim over de schermbreedte te
       trekken. Precies dát ene setje schuift straks weg, waarna de eerste
       kopie exact op de plek van het origineel staat en de lus onzichtbaar is. */
    const needed = Math.min(
      MAX_COPIES,
      Math.max(1, Math.ceil((marquee.clientWidth * MIN_TRACK_RATIO) / base))
    );

    for (let round = 0; round < needed; round += 1) {
      for (const item of originals) {
        const copy = item.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        for (const focusable of copy.querySelectorAll('a, button, [tabindex]')) {
          focusable.setAttribute('tabindex', '-1');
        }
        track.appendChild(copy);
      }
    }

    prepared = true;
  };

  const measure = () => {
    const base = setWidth();
    if (base <= 0) return;
    marquee.style.setProperty('--marquee-distance', `${base}px`);
    marquee.style.setProperty('--marquee-duration', `${(base / PIXELS_PER_SECOND).toFixed(1)}s`);
  };

  const enable = () => {
    if (reduce.matches) {
      marquee.classList.remove('is-running');
      return;
    }
    prepare();
    measure();
    marquee.classList.add('is-running');
  };

  /* Pas aanzetten wanneer de band in beeld komt: een animatie die onderaan de
     pagina draait terwijl niemand kijkt, kost alleen batterij. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        enable();
        io.disconnect();
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(marquee);
  } else {
    enable();
  }

  addEventListener(
    'resize',
    () => {
      if (marquee.classList.contains('is-running')) measure();
    },
    { passive: true }
  );

  reduce.addEventListener('change', (event) => {
    if (event.matches) marquee.classList.remove('is-running');
    else enable();
  });
}
