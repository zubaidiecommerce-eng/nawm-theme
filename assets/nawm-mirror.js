/**
 * nawm-mirror.js — de herkenningssectie.
 *
 * Telt aangevinkte stellingen en schrijft de bijbehorende uitkomst. De drie
 * teksten komen uit data-attributen op de sectie, niet uit dit bestand: ze zijn
 * copy, en copy hoort in de theme-editor te staan.
 *
 * Het event `mirror_result` vertelt later precies hoe herkenbaar het
 * advertentiepubliek is — bij hoeveel mensen slaan drie of vier stellingen aan.
 * Dat is direct bruikbaar in je advertentiecopy.
 */

const section = document.querySelector('[data-nawm-mirror]');

if (section) {
  const checks = [...section.querySelectorAll('[data-mirror-check]')];
  const result = section.querySelector('[data-mirror-result]');

  if (checks.length > 0 && result) {
    const texts = {
      none: section.dataset.resultNone || '',
      low: section.dataset.resultLow || '',
      high: section.dataset.resultHigh || '',
    };

    /* Eén melding per bezoek, met de eindstand. Bij elke klik een event sturen
       levert ruis op in plaats van inzicht. */
    let reportTimer = 0;
    let lastReported = null;

    const report = (score) => {
      clearTimeout(reportTimer);
      reportTimer = setTimeout(() => {
        if (score === lastReported) return;
        lastReported = score;
        if (typeof window.nawmTrack === 'function') {
          window.nawmTrack('mirror_result', { score });
        }
      }, 1200);
    };

    const update = () => {
      const score = checks.filter((input) => input.checked).length;

      /* Niets aangevinkt en nog niets aangeraakt: geen uitkomst tonen. Anders
         zou de sectie iemand die net binnenkomt meteen wegsturen. */
      const touched = section.dataset.touched === 'true';
      if (score === 0 && !touched) {
        result.textContent = '';
        return;
      }

      if (score === 0) result.textContent = texts.none;
      else if (score <= 2) result.textContent = texts.low;
      else result.textContent = texts.high;

      report(score);
    };

    for (const input of checks) {
      input.addEventListener('change', () => {
        section.dataset.touched = 'true';
        update();
      });
    }

    update();
  }
}
