/**
 * nawm-analytics.js — de minimale eventset uit BUILD SPEC §11.1.
 *
 * Events gaan naar window.dataLayer (GA4). Namen exact zoals in de spec:
 *   view_hero · play_demo · use_sunrise_scrubber · open_guide ·
 *   open_specifications · open_faq · view_offer · add_to_cart ·
 *   begin_checkout · purchase
 *
 * Niets vuurt vóór toestemming. Zolang de Customer Privacy API nog geen
 * antwoord heeft, of het antwoord "nee" is, blijven events in de wachtrij.
 * `purchase` hoort op de bedankpagina en komt niet uit dit bestand — zie
 * docs/OPEN.md.
 */

const queue = [];
let allowed = null;

function consentGranted() {
  const api = window.Shopify && window.Shopify.customerPrivacy;
  if (!api || typeof api.analyticsProcessingAllowed !== 'function') return null;
  return api.analyticsProcessingAllowed();
}

function flush() {
  if (allowed !== true) return;
  window.dataLayer = window.dataLayer || [];
  while (queue.length) window.dataLayer.push(queue.shift());
}

function track(event, params) {
  queue.push({ event, ...params });
  flush();
}

function refreshConsent() {
  const next = consentGranted();
  if (next === null) return;
  allowed = next;
  flush();
}

refreshConsent();
document.addEventListener('visitorConsentCollected', refreshConsent);
/* De Customer Privacy API laadt asynchroon; één late controle volstaat. */
addEventListener('load', refreshConsent);

/* ---- observers -------------------------------------------------------- */

const once = new Set();

function onView(selector, event) {
  const el = document.querySelector(selector);
  if (!el || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || once.has(event)) continue;
        once.add(event);
        track(event);
        io.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  io.observe(el);
}

onView('[data-nawm-hero]', 'view_hero');
onView('#offer', 'view_offer');
onView('#specificaties', 'open_specifications');

/* Productpagina — de eventset uit PDP SPEC §11. Het aanbod heet daar #aanbod;
   op de landingspagina heet dezelfde sectie #offer. Beide vuren view_offer, en
   `once` zorgt dat het er één blijft als ze ooit op dezelfde pagina staan. */
onView('[data-nawm-pdp]', 'view_pdp');
onView('#aanbod', 'view_offer');
onView('[data-pdp-specs]', 'open_specs');

/**
 * Losse parameters bij een event, als JSON in `data-nawm-params`. Op de
 * productpagina draagt elke FAQ zijn bezwaarcode mee: `open_faq` met B2 of B9
 * vertelt precies welk bezwaar het vaakst een bestelling tegenhoudt, en dat is
 * direct input voor de advertentiecopy.
 */
function paramsOf(el) {
  if (!el.dataset.nawmParams) return undefined;
  try {
    return JSON.parse(el.dataset.nawmParams);
  } catch {
    return undefined;
  }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-nawm-event]');
  if (el) track(el.dataset.nawmEvent, paramsOf(el));
});

document.addEventListener('toggle', (e) => {
  const el = e.target;
  if (!(el instanceof HTMLDetailsElement) || !el.open) return;
  const event = el.dataset.nawmEvent;
  if (!event) return;

  /* Een FAQ-opening telt per vraag, niet per pagina: welke vraag geopend wordt
     is nu juist het signaal. Andere toggles blijven eenmalig. */
  const params = paramsOf(el);
  const key = params && params.bezwaar_code ? `${event}:${params.bezwaar_code}` : event;

  if (once.has(key)) return;
  once.add(key);
  track(event, params);
}, true);

document.addEventListener('play', (e) => {
  if (e.target instanceof HTMLVideoElement && !once.has('play_demo')) {
    once.add('play_demo');
    track('play_demo');
  }
}, true);

window.nawmTrack = track;
