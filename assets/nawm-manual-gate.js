/**
 * nawm-manual-gate.js — de handleiding achter een e-mailadres.
 *
 * Sinds v3 is er één ingang: de knop uit `nawm-manual-cta`. Die knop staat op
 * `hidden` in de HTML en wordt hier zichtbaar gemaakt, zodat er zonder dit
 * script geen knop staat die niets doet. In dat geval toont de `<noscript>`
 * ernaast de directe link — een bezoeker die de handleiding wil lezen mag
 * nooit stranden op een script dat niet laadt.
 *
 * De oude directe links met `data-nawm-manual` worden nog steeds afgevangen,
 * voor het geval er ergens één achterblijft.
 *
 * Wie zijn adres al eens gaf, gaat er nooit meer langs. Dat wordt lokaal
 * onthouden, want een tweede keer vragen om iets wat je al hebt gekregen is
 * precies het soort wrijving dat mensen wegjaagt.
 */

const KEY = 'nawm:manual-unlocked';
const PENDING = 'nawm:manual-pending';

const gate = document.querySelector('[data-nawm-manual-gate]');
const links = document.querySelectorAll('[data-nawm-manual]');
const buttons = document.querySelectorAll('[data-manual-open]');

function unlocked() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true; /* Geen opslag? Dan niet zeuren en de handleiding gewoon geven. */
  }
}

function unlock() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
    localStorage.removeItem(PENDING);
  } catch {
    /* Niets aan te doen. */
  }
}

/* De knoppen staan verborgen in de HTML. Pas als dit script draait én er een
   venster is om te openen, zijn ze een echte knop. */
if (gate && typeof gate.showModal === 'function') {
  for (const button of buttons) button.hidden = false;
}

if (gate && typeof gate.showModal === 'function' && (links.length > 0 || buttons.length > 0)) {
  const formState = gate.querySelector('[data-gate-state="form"]');
  const successState = gate.querySelector('[data-gate-state="success"]');

  const showSuccess = () => {
    if (!formState || !successState) return;
    formState.hidden = true;
    successState.hidden = false;
  };

  /* Shopify stuurt de bezoeker na het inschrijven terug met
     ?customer_posted=true. Alleen als wíj degene waren die hem wegstuurden,
     hoort daar de handleiding bij en niet de nieuwsbriefbevestiging. */
  const returned = new URLSearchParams(location.search).get('customer_posted') === 'true';
  let pending = false;
  try {
    pending = localStorage.getItem(PENDING) !== null;
  } catch {
    pending = false;
  }

  if (returned && pending) {
    unlock();
    showSuccess();
    gate.showModal();
  }

  for (const link of links) {
    link.addEventListener('click', (event) => {
      if (unlocked()) return; /* Al gegeven: de link doet gewoon zijn werk. */
      event.preventDefault();
      gate.showModal();
    });
  }

  /* De knop heeft geen href, dus hier valt niets te onderdrukken. Wie zijn
     adres al gaf, krijgt meteen het bevestigingsvenster met de download in
     plaats van het formulier opnieuw. */
  for (const button of buttons) {
    button.addEventListener('click', () => {
      if (unlocked()) showSuccess();
      gate.showModal();
    });
  }

  gate.addEventListener('click', (event) => {
    if (event.target === gate) gate.close();
  });

  gate.addEventListener('submit', (event) => {
    if (event.target.method === 'dialog') return;
    /* Onthouden dat déze inzending om de handleiding ging, zodat we na de
       terugkeer het juiste venster tonen. */
    try {
      localStorage.setItem(PENDING, '1');
    } catch {
      /* Dan valt de bezoeker terug op de link in de bevestigingsmail. */
    }
  });

}
