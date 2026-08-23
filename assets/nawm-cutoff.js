/**
 * nawm-cutoff.js — de aftelling naar de verzenddeadline.
 *
 * De regel begint server-side met de leverdatum erin. Dit script vervangt hem
 * door een aftelling zolang de deadline van vandaag nog niet voorbij is, en
 * laat de oorspronkelijke regel staan zodra hij dat wel is.
 *
 * Drie dingen die het bewust níét doet:
 *   · niet opnieuw beginnen zodra de teller op nul komt. Er loopt dan niets
 *     meer af, dus er hoort geen teller meer te staan
 *   · niet aftellen in het weekend. Er gaat zaterdag geen pakket weg, dus een
 *     teller zou een deadline suggereren die er niet is
 *   · geen seconden tonen. Dat leest als druk, en de winst zit in het feit dat
 *     er een deadline is, niet in de precisie
 */

const el = document.querySelector('[data-nawm-cutoff]');

if (el) {
  const target = el.querySelector('[data-cutoff-text]');
  const [hours, minutes] = String(el.dataset.cutoff || '16:00').split(':').map(Number);

  /* De oorspronkelijke tekst is de terugval: hij bevat de leverdatum die
     server-side is uitgerekend, inclusief weekenden en de verzenddag. */
  const fallback = target ? target.textContent.trim() : '';

  const templates = {
    full: el.dataset.textCountdown || '',
    minutesOnly: el.dataset.textCountdownMinutes || '',
  };

  const render = () => {
    if (!target) return;

    const now = new Date();
    const day = now.getDay(); /* 0 = zondag, 6 = zaterdag */

    if (day === 0 || day === 6) {
      target.textContent = fallback;
      return;
    }

    const deadline = new Date(now);
    deadline.setHours(hours || 16, minutes || 0, 0, 0);

    const remaining = deadline - now;
    if (remaining <= 0) {
      target.textContent = fallback;
      return;
    }

    const totalMinutes = Math.floor(remaining / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    target.textContent =
      h > 0
        ? templates.full.replace('HOURS', String(h)).replace('MINUTES', String(m))
        : templates.minutesOnly.replace('MINUTES', String(m));
  };

  render();

  /* Eén keer per minuut is genoeg: er staan geen seconden in de tekst. */
  const timer = setInterval(render, 60000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) render();
  });

  addEventListener('pagehide', () => clearInterval(timer));
}
