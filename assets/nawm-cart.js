/**
 * nawm-cart.js — de winkelwagenlade.
 *
 * Twee dingen die Horizon zelf niet doet:
 *
 *   1. een bevestiging na toevoegen. De lade schuift open zonder te zeggen wát
 *      er gebeurd is; voor iemand met een screenreader gebeurt er dan
 *      helemaal niets waarneembaars
 *   2. een melding wanneer de voortgangsbalk in beeld komt, zodat je later kunt
 *      zien of die balk zijn plek verdient
 *
 * Het openen van de lade wordt afgeleid uit het `cart:update`-event dat Horizon
 * zelf verstuurt; er wordt niets van de theme overschreven.
 */

const KEY = 'nawm:cart-announced';

function announce() {
  const cart = document.querySelector('.nawm-cart');
  if (!cart || cart.querySelector('.nawm-cart-added')) return;

  const note = document.createElement('p');
  note.className = 'nawm-cart-added';
  note.setAttribute('role', 'status');
  note.textContent = cart.dataset.addedText || 'Toegevoegd aan je winkelwagen';
  cart.prepend(note);

  /* Na een paar seconden weg: de mededeling is dan gelezen en de ruimte is
     nuttiger voor de knop. */
  setTimeout(() => note.remove(), 6000);
}

document.addEventListener('cart:update', (event) => {
  const source = event?.detail?.data?.source;
  if (source === 'product-form-component' || source === 'add-to-cart') {
    requestAnimationFrame(announce);
  }
});

/* Eén melding wanneer de voortgangsbalk voor het eerst in beeld komt. */
if ('IntersectionObserver' in window) {
  const observe = () => {
    const progress = document.querySelector('.nawm-cart__progress');
    if (!progress || progress.dataset.seen === 'true') return;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      progress.dataset.seen = 'true';
      io.disconnect();
      if (typeof window.nawmTrack === 'function') window.nawmTrack('cart_progress_view');
    });

    io.observe(progress);
  };

  observe();
  document.addEventListener('cart:update', () => requestAnimationFrame(observe));
}

export { KEY };
