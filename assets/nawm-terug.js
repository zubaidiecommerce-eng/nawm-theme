/**
 * nawm-terug.js — de terugkerende bezoeker. Fix & verfijning v5, C3.
 *
 * Wie voor de tweede keer komt, hoeft niet opnieuw overtuigd te worden van het
 * probleem. Drie dingen veranderen er, en meer niet:
 *
 *   · de eyebrow in de hero wordt "Je was hier al eens."
 *   · onder de CTA verschijnt één regel met retour en een mailadres
 *   · de handleidingspoort verschijnt niet meer uit zichzelf
 *
 * Geen "Welkom terug!", geen naam, geen aftelling. Subtiel herkennen is
 * prettig; nadrukkelijk herkennen is onprettig. Wie meer wil toevoegen: dat is
 * precies het punt waarop dit een gimmick wordt.
 *
 * Waarom localStorage en geen cookie: er hoeft niets naar de server, dus er
 * hoort ook niets in elke request mee te reizen. Wat er staat is één
 * tijdstempel, geen identiteit, geen gedrag, geen tracking. Vermeld hem wel in
 * het privacybeleid — een functionele opslag blijft opslag.
 *
 * Dat is ook waarom dit script alleen leest en pas aan het eind schrijft: een
 * bezoeker die de site één keer bekijkt en nooit terugkomt, laat niets achter
 * dat later nog iets doet.
 */

const KEY = 'nawm:bezocht';
const VENSTER_DAGEN = 30;
const VENSTER = VENSTER_DAGEN * 24 * 60 * 60 * 1000;

/** @returns {number | null} tijdstempel van het vorige bezoek, of null */
function vorigBezoek() {
  try {
    const waarde = Number(localStorage.getItem(KEY));
    return Number.isFinite(waarde) && waarde > 0 ? waarde : null;
  } catch {
    /* Privémodus of geblokkeerde opslag. Dan is iedereen een eerste bezoeker,
       en dat is de veilige kant: liever niemand herkennen dan iemand ten
       onrechte. */
    return null;
  }
}

function onthoud() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* Niets aan te doen, en niets dat stukgaat. */
  }
}

const vorige = vorigBezoek();
const isTerug = vorige !== null && Date.now() - vorige < VENSTER;

if (isTerug) {
  document.documentElement.setAttribute('data-terug', 'true');

  /* De regel onder de CTA. Hij staat al in de HTML met `hidden`, zodat de
     tekst uit het talenbestand komt en niet uit dit script — copy hoort niet in
     JavaScript. */
  for (const el of document.querySelectorAll('[data-terug-regel]')) el.hidden = false;
}

/* Altijd bijwerken, ook bij een eerste bezoek: het venster van 30 dagen loopt
   vanaf het laatste bezoek en niet vanaf het eerste. Iemand die elke week
   langskomt, blijft herkend. */
onthoud();
