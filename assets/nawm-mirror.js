/**
 * nawm-mirror.js — de herkenningssectie. Zie fix & uitbreiding v3, punt 9.
 *
 * Kijkt naar wélke stellingen zijn aangevinkt, niet naar hoeveel. Elke
 * stelling draagt een as in `data-axis`: avond of ochtend. Daaruit volgt één
 * van vier profielen, en bij elk profiel hoort een blok dat al in de HTML
 * staat. Dit bestand doet niets anders dan het juiste blok tonen.
 *
 * De teksten staan daarom niet hier maar in de sectie: het is copy, en copy
 * hoort in de theme-editor te staan.
 *
 * Voordat er iets is aangeraakt blijft alles verborgen. Anders zou de sectie
 * iemand die net binnenkomt meteen vertellen dat hij het product niet nodig
 * heeft.
 */

const section = document.querySelector('[data-nawm-mirror]');

if (section) {
  const checks = [...section.querySelectorAll('[data-mirror-check]')];
  const result = section.querySelector('[data-mirror-result]');
  const outcomes = result ? [...result.querySelectorAll('[data-outcome]')] : [];

  if (checks.length > 0 && outcomes.length > 0) {
    /* Alles dicht tot de eerste klik. Dit gebeurt in JS en niet in Liquid,
       zodat iemand zonder JavaScript de blokken gewoon allemaal ziet staan in
       plaats van een lege sectie. */
    for (const outcome of outcomes) outcome.hidden = true;

    const profileOf = () => {
      const checked = checks.filter((input) => input.checked);
      if (checked.length === 0) return 'none';

      const evening = checked.some((input) => input.dataset.axis === 'avond');
      const morning = checked.some((input) => input.dataset.axis === 'ochtend');

      if (evening && morning) return 'both';
      return evening ? 'avond' : 'ochtend';
    };

    /* Eén melding per bezoek, met de eindstand. Bij elke klik een event sturen
       levert ruis op in plaats van inzicht. Na twee weken vertelt dit welk
       profiel het advertentiepubliek heeft, en dat is direct bruikbaar in de
       advertentiecopy. */
    let reportTimer = 0;
    let lastReported = null;

    const report = (profile) => {
      clearTimeout(reportTimer);
      reportTimer = setTimeout(() => {
        if (profile === lastReported) return;
        lastReported = profile;
        if (typeof window.nawmTrack === 'function') {
          window.nawmTrack('mirror_result', { profile });
        }
      }, 1200);
    };

    /* De startinstelling reist mee naar de winkelwagen. Fix & verfijning v5, C2.
     *
     * De velden staan in elk koopformulier op de pagina — het koopblok, het
     * aanbod, de mobiele balk — dus ze worden alle drie bijgewerkt. Welk
     * formulier de bezoeker uiteindelijk verstuurt, weten we hier niet.
     *
     * Leeg zetten wanneer er geen uitkomst is, is net zo belangrijk als vullen:
     * wie een profiel kiest en zich daarna bedenkt, hoort geen instelling in
     * zijn bestelling te krijgen die hij heeft weggeklikt. Shopify laat een
     * lege property vallen, dus leeg is echt weg. */
    const properties = [...document.querySelectorAll('[data-mirror-property]')];

    const carryProfile = (outcome) => {
      const setup = outcome?.dataset.setup?.trim() || '';
      for (const field of properties) field.value = setup;
    };

    const update = () => {
      const touched = section.dataset.touched === 'true';
      const profile = profileOf();
      let visible = null;

      for (const outcome of outcomes) {
        const hidden = !touched || outcome.dataset.outcome !== profile;
        outcome.hidden = hidden;
        if (!hidden) visible = outcome;
      }

      carryProfile(visible);

      if (touched) report(profile);
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
