/**
 * nawm-sticky-cta.js — de mobiele bestelbalk. BUILD SPEC §5.11.
 *
 * De balk verschijnt pas nadat de bezoeker sectie 11 (het aanbod) één keer
 * heeft gezien — niet eerder. Hij verdwijnt weer zodra het aanbod zelf of de
 * footer in beeld staat, zodat er nooit twee knoppen tegelijk staan.
 */

const bar = document.querySelector('[data-nawm-sticky-cta]');
const offer = document.querySelector('#offer');

if (bar && offer && 'IntersectionObserver' in window) {
  let seen = false;
  let offerVisible = false;
  let footerVisible = false;

  const update = () => {
    const show = seen && !offerVisible && !footerVisible;
    bar.classList.toggle('is-visible', show);
    bar.toggleAttribute('inert', !show);
  };

  new IntersectionObserver(
    ([entry]) => {
      offerVisible = entry.isIntersecting;
      if (offerVisible) seen = true;
      update();
    },
    { threshold: 0.2 }
  ).observe(offer);

  const footer = document.querySelector('footer');
  if (footer) {
    new IntersectionObserver(
      ([entry]) => {
        footerVisible = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 }
    ).observe(footer);
  }
}
