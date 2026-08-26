/**
 * nawm-motion.js — de kleine interacties.
 *
 * Alles hier is versiering en niets is functie: gaat dit bestand stuk of laadt
 * het niet, dan werkt de winkel precies zoals hij werkte. Dat is de regel voor
 * dit soort werk — een knop die niet klikbaar is omdat een animatie faalde, is
 * geen high-end detail maar een kapotte winkel.
 *
 * Wat het doet:
 *   · het winkelwagenicoon veert kort op zodra er iets in gaat
 *   · de galerij op de productpagina kantelt een paar graden mee met de muis
 *   · de knop die net gebruikt is, houdt zijn bevestiging even vast
 *
 * De vlucht van het product naar de winkelwagen zit hier niet in. Die komt uit
 * Horizon's eigen `fly-to-cart`, aangestuurd door `add-to-cart-component` in
 * snippets/pdp-buy.liquid. Twee implementaties van dezelfde animatie zouden
 * gaan botsen.
 *
 * Bij prefers-reduced-motion gebeurt er niets. Geen uitzonderingen: iemand die
 * die voorkeur zet, heeft er last van, niet slechts een mening erover.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------- winkelwagenicoon */

/* Een veer in plaats van een schaalsprong. De teller springt mee, zodat je ziet
   dát er iets veranderd is ook als je net ergens anders keek. */
function bumpCart() {
  if (reduce.matches) return;

  const icon = document.querySelector('.header-actions__cart-icon');
  if (!icon || typeof icon.animate !== 'function') return;

  icon.animate(
    [
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-4px) scale(1.12)', offset: 0.35 },
      { transform: 'translateY(1px) scale(.97)', offset: 0.7 },
      { transform: 'translateY(0) scale(1)' },
    ],
    { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' }
  );

  const bubble = icon.querySelector('.cart-bubble');
  bubble?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: 0.4 }, { transform: 'scale(1)' }],
    { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', delay: 120 }
  );
}

/* Het standaard cart-event van Shopify. De naam komt uit de module en niet uit
   een string, zodat een hernoeming aan de kant van Shopify hier stukloopt in
   plaats van stilletjes niets meer te doen. */
import('@shopify/events')
  .then(({ StandardEvents }) => {
    document.addEventListener(StandardEvents.cartLinesUpdate, bumpCart);
  })
  .catch(() => {
    /* Geen module, geen veer. Verder verandert er niets. */
  });

/* ------------------------------------------------------------ de galerij */

/* De galerij blijft op desktop staan terwijl je leest. Een blok dat minutenlang
   stilstaat wordt behang, dus kantelt hij een paar graden mee met de muis. De
   uitslag is klein en de terugkeer traag: het moet aanvoelen als diepte, niet
   als een effect.
 *
 * Alleen op een echte muis. Op een aanraakscherm bestaat hover niet en zou dit
 * bij elke tik een sprong geven. */
function tiltGallery() {
  if (reduce.matches || !matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;

  const gallery = document.querySelector('[data-pdp-gallery]');
  const stage = gallery?.querySelector('.pdp-gallery__track');
  if (!gallery || !stage) return;

  let frame = 0;

  const move = (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const box = gallery.getBoundingClientRect();
      /* -1 tot 1 vanaf het midden. */
      const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
      const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
      stage.style.setProperty('--tilt-x', `${(-y * 1.6).toFixed(2)}deg`);
      stage.style.setProperty('--tilt-y', `${(x * 1.6).toFixed(2)}deg`);
      stage.style.setProperty('--tilt-lift', '6px');
    });
  };

  const rest = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    stage.style.setProperty('--tilt-x', '0deg');
    stage.style.setProperty('--tilt-y', '0deg');
    stage.style.setProperty('--tilt-lift', '0px');
  };

  gallery.addEventListener('pointermove', move);
  gallery.addEventListener('pointerleave', rest);
  /* Wie met het toetsenbord door de galerij loopt, hoort geen scheve foto te
     krijgen die niet meer rechtkomt. */
  gallery.addEventListener('focusin', rest);
}

tiltGallery();

/* --------------------------------------------------------- bevestigingen */

/* `add-to-cart-component` zet `data-added` op de knop en haalt het er na 800ms
   weer af. De CSS hangt daaraan; hier hoeft niets te gebeuren. Wat hier wél
   gebeurt: dezelfde bevestiging voor de knoppen die niet door dat component
   lopen, zoals de upsell in de winkelwagen. */
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-nawm-confirm]');
  if (!button || reduce.matches) return;

  button.dataset.added = 'true';
  setTimeout(() => button.removeAttribute('data-added'), 900);
});
