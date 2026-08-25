/**
 * nawm-popup.js — de nieuwsbriefpopup.
 *
 * Het `<dialog>`-element doet het zware werk: focustrap, Escape, en de rest
 * van de pagina inert. Dit script bepaalt wannéér hij opengaat, welke van de
 * twee toestanden zichtbaar is, en zorgt dat hij daarna wegblijft.
 *
 * Regels:
 *   · één keer per bezoeker — sluiten of inschrijven zet een vlag
 *   · niet op de winkelwagen of de kassa: wie al aan het afrekenen is, moet je
 *     niet onderbreken
 *   · op de gids minstens 30 seconden wachten — zie hieronder
 *   · de timer loopt niet door in een verborgen tabblad
 *   · de vertraging staat in de theme-editor, niet hier
 */

/* NAWM_SEO_CONTENTSPEC.md §8: geen popup op artikelpagina's binnen de eerste
   30 seconden.
 *
 * De reden is inhoudelijk en niet cosmetisch. Iemand die via Google op een
 * artikel binnenkomt, heeft nog geen relatie met deze winkel — hij heeft een
 * vraag. Een venster dat na acht seconden over zijn antwoord heen schuift,
 * is precies het signaal waar Google op let en waar een lezer op wegklikt.
 *
 * De ondergrens staat hier en niet in de theme-editor, zodat een lagere
 * instelling hem niet kan omzeilen. Wie hem hoger wil, zet de vertraging in
 * de editor hoger; die wint als hij groter is.
 */
const GUIDE_MIN_DELAY_SECONDS = 30;
const GUIDE_PATHS = /^\/(blogs\/gids|pages\/(wake-up-light|beter-opstaan|avondroutine|wanneer-naar-de-huisarts))(\/|$)/;

const KEY = 'nawm:newsletter-popup';
const dialog = document.querySelector('[data-nawm-popup]');

function alreadySeen() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    /* Privémodus of geblokkeerde opslag: dan liever niet tonen dan bij elke
       paginaweergave opnieuw. */
    return true;
  }
}

function remember() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* Niets aan te doen; de popup is dan eenmalig per sessie. */
  }
}

if (dialog && typeof dialog.showModal === 'function') {
  const formState = dialog.querySelector('[data-popup-state="form"]');
  const successState = dialog.querySelector('[data-popup-state="success"]');

  const onCartOrCheckout = /\/(cart|checkouts?)(\/|$)/.test(location.pathname);

  /* Shopify stuurt de bezoeker na een geslaagde inschrijving terug met
     ?customer_posted=true. Liquid kan die parameter niet lezen, dus de keuze
     tussen formulier en bevestiging valt hier. */
  const justSubmitted = new URLSearchParams(location.search).get('customer_posted') === 'true';

  const showSuccess = () => {
    if (!formState || !successState) return;
    formState.hidden = true;
    successState.hidden = false;
  };

  let timer = 0;

  const open = () => {
    /* Tussen het zetten van de timer en het aflopen ervan kan de bezoeker in
       een ander tabblad zijn beland. */
    if (document.hidden || dialog.open) return;
    dialog.showModal();
  };

  if (justSubmitted) {
    showSuccess();
    remember();
    dialog.showModal();
  } else if (!alreadySeen() && !onCartOrCheckout) {
    let seconds = Math.max(0, Number(dialog.dataset.delay || 8));

    /* Op de gids geldt de ondergrens. Staat de editor hoger, dan wint die. */
    if (GUIDE_PATHS.test(location.pathname)) {
      seconds = Math.max(seconds, GUIDE_MIN_DELAY_SECONDS);
    }

    timer = setTimeout(open, seconds * 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(timer);
    });
  }

  /* Sluiten op welke manier dan ook telt als gezien: Escape, de kruisknop,
     "Nu niet", of een klik naast het venster. */
  dialog.addEventListener('close', remember);

  dialog.addEventListener('click', (event) => {
    /* Een klik op het dialoogvlak zelf is de achtergrond; de inhoud zit in
       .nawm-popup__body. */
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('submit', (event) => {
    /* De dismiss-formulieren hebben method="dialog" en sluiten alleen; het
       inschrijfformulier verstuurt echt. */
    if (event.target.method !== 'dialog') remember();
  });
}
