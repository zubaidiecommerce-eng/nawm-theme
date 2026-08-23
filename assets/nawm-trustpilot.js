/**
 * nawm-trustpilot.js — laadt de Trustpilot-widget, maar pas na toestemming.
 *
 * Het script van Trustpilot zet cookies en meet mee. Het is dus een tracker en
 * hoort zich aan dezelfde regel te houden als nawm-analytics.js: niets laden
 * zolang de Customer Privacy API geen ja heeft gegeven.
 *
 * Geeft de bezoeker geen toestemming, dan gebeurt er hier niets en blijft de
 * statische regel uit de sectie staan. Die zegt dezelfde score met een link
 * naar het profiel, en volgt niemand.
 */

const MOUNT = '[data-nawm-trustpilot]';
const SRC = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';

let started = false;

function allowed() {
  const api = window.Shopify && window.Shopify.customerPrivacy;
  if (!api || typeof api.analyticsProcessingAllowed !== 'function') return null;
  return api.analyticsProcessingAllowed();
}

function build(el) {
  /* De widget wordt hier opgebouwd en niet in Liquid: zolang het script niet
     geladen mag worden, hoort er geen leeg Trustpilot-blok in de HTML te staan
     dat op een kapotte widget lijkt. */
  const box = document.createElement('div');
  box.className = 'trustpilot-widget';
  box.dataset.locale = el.dataset.locale || 'nl-NL';
  box.dataset.templateId = el.dataset.templateId || '';
  box.dataset.businessunitId = el.dataset.businessunitId || '';
  box.dataset.styleHeight = '52px';
  box.dataset.styleWidth = '100%';
  el.append(box);
  return box;
}

function mount() {
  if (started) return;
  const el = document.querySelector(MOUNT);
  if (!el || !el.dataset.businessunitId || !el.dataset.templateId) return;

  started = true;
  const box = build(el);

  const script = document.createElement('script');
  script.src = SRC;
  script.async = true;
  script.addEventListener('load', () => {
    if (window.Trustpilot) window.Trustpilot.loadFromElement(box, true);
  });
  /* Laadt het script niet, dan halen we het lege blok weer weg: liever niets
     dan een leeg vak met een rand eromheen. */
  script.addEventListener('error', () => box.remove());
  document.head.append(script);
}

function check() {
  if (allowed() === true) mount();
}

check();
document.addEventListener('visitorConsentCollected', check);
addEventListener('load', check);
