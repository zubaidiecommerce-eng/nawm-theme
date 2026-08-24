/**
 * nawm-guide.js — de vergroting van de Sleep–Wake Guide.
 *
 * Eén beeld, één venster. Er zit geen download in: de gids hoort bij de
 * bestelling en komt per e-mail, en hem hier alsnog weggeven zou de belofte in
 * het aanbod tegenspreken.
 *
 * De knop staat gewoon in de HTML en blijft bruikbaar zonder dit script — dan
 * gebeurt er niets bij een klik, maar het beeld ernaast is al leesbaar. Dat is
 * hier acceptabel omdat de vergroting comfort is en geen inhoud.
 */

const trigger = document.querySelector('[data-guide-zoom]');
const dialog = document.querySelector('[data-guide-dialog]');

if (trigger && dialog && typeof dialog.showModal === 'function') {
  trigger.addEventListener('click', () => dialog.showModal());

  /* Klikken naast het beeld sluit het venster. Op een telefoon is dat vaak de
     eerste reflex, nog voor de sluitknop. */
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
