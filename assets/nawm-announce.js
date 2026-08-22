/**
 * nawm-announce.js — de roterende balk bovenaan.
 *
 * Wisselt puur visueel van boodschap. Alle regels staan in de DOM en worden
 * niet verborgen voor hulpsoftware, dus dit script hoeft alleen een klasse te
 * verplaatsen.
 *
 * Drie dingen die het bewust wél doet:
 *   · stilstaan bij prefers-reduced-motion — de CSS zet de regels dan naast
 *     elkaar, dus er valt niets te rouleren
 *   · stilstaan wanneer het tabblad niet zichtbaar is, zodat er geen timer
 *     loopt voor een lege kamer
 *   · pauzeren zodra de muis erop staat of iets erin focus krijgt, zodat een
 *     boodschap niet wegspringt terwijl je hem leest
 */

const INTERVAL = 4200;

const bar = document.querySelector('[data-nawm-announce]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

if (bar && !reduce.matches) {
  const items = [...bar.querySelectorAll('[data-announce-item]')];

  if (items.length > 1) {
    let index = 0;
    let timer = 0;
    let paused = false;

    const show = (next) => {
      items[index].classList.remove('is-current');
      index = next % items.length;
      items[index].classList.add('is-current');
    };

    const tick = () => {
      if (!paused && !document.hidden) show(index + 1);
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(tick, INTERVAL);
    };

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };

    bar.addEventListener('mouseenter', pause);
    bar.addEventListener('mouseleave', resume);
    bar.addEventListener('focusin', pause);
    bar.addEventListener('focusout', resume);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
      else start();
    });

    /* Zet iemand reduced motion later aan, dan stopt de rotatie alsnog. */
    reduce.addEventListener('change', (event) => {
      if (event.matches) clearInterval(timer);
      else start();
    });

    start();
  }
}
