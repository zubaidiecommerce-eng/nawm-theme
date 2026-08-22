/**
 * pdp-sticky-cta.js — de mobiele koopbalk. PDP SPEC §4.1.
 *
 * Dit is de belangrijkste losse component van de pagina: mobiele
 * productpagina's presteren structureel slechter dan desktop, en de
 * voornaamste oorzaak is dat de koopknop vier schermen omhoog staat op het
 * moment dat iemand overtuigd raakt.
 *
 * Gedrag, precies zoals de spec het voorschrijft:
 *   · verschijnt zodra de CTA in de hero uit beeld is — niet eerder, want een
 *     balk die er meteen staat, leest als een advertentie
 *   · verdwijnt zodra de laatste CTA in beeld komt, zodat er nooit twee
 *     knoppen tegelijk staan
 *   · reserveert zijn eigen hoogte onderaan de pagina, zodat het verschijnen
 *     geen layout shift oplevert
 *
 * Op desktop doet dit script niets zichtbaars: daar is de balk in CSS
 * verborgen en blijft het koopblok in de hero sticky binnen zijn sectie.
 */

const bar = document.querySelector('[data-pdp-sticky]');
const heroAnchor = document.querySelector('[data-pdp-hero-cta]');
const closeAnchor = document.querySelector('[data-pdp-close-cta]');

if (bar && heroAnchor && 'IntersectionObserver' in window) {
  let heroVisible = true;
  let closeVisible = false;
  let announced = false;

  const update = () => {
    const show = !heroVisible && !closeVisible;

    bar.classList.toggle('is-visible', show);
    bar.toggleAttribute('inert', !show);
    document.body.classList.toggle('pdp-sticky-active', show);

    if (show && !announced) {
      announced = true;
      if (typeof window.nawmTrack === 'function') window.nawmTrack('sticky_cta_view');
    }
  };

  new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting;
      update();
    },
    { threshold: 0 }
  ).observe(heroAnchor);

  if (closeAnchor) {
    new IntersectionObserver(
      ([entry]) => {
        closeVisible = entry.isIntersecting;
        update();
      },
      { threshold: 0 }
    ).observe(closeAnchor);
  }

  update();
}
