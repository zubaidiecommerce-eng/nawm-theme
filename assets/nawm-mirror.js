/**
 * nawm-mirror.js — de herkenningssectie. Zie fix & uitbreiding v3 punt 9 en
 * v4 punt A3.
 *
 * Kijkt naar wélke stellingen zijn aangevinkt, niet naar hoeveel. Elke
 * stelling draagt een as in `data-axis`: avond, ochtend of none. Daaruit volgt
 * één van vier profielen, en bij elk profiel hoort een blok dat al in de HTML
 * staat. Dit bestand doet niets anders dan het juiste blok tonen.
 *
 * De teksten staan daarom niet hier maar in de sectie: het is copy, en copy
 * hoort in de theme-editor te staan.
 *
 * Twee regels dragen de hele sectie:
 *
 * 1. Nul selecties tonen niets. Niet "Dan zit je goed" — de bezoeker heeft
 *    niets gezegd en hoort dus ook geen conclusie te krijgen. Dat gold al voor
 *    wie net binnenkwam, maar niet voor wie een vinkje weer weghaalde, en die
 *    kreeg dus alsnog te horen dat hij het product niet nodig heeft.
 * 2. `none` verschijnt uitsluitend wanneer "Ik slaap prima" is aangevinkt,
 *    nooit als afvalpositie. Die stelling sluit de zes andere uit, en
 *    andersom: je zegt óf dat je iets herkent, óf dat je goed slaapt.
 */

const AXIS_OUT = 'none';

const section = document.querySelector('[data-nawm-mirror]');

if (section) {
  const checks = [...section.querySelectorAll('[data-mirror-check]')];
  const result = section.querySelector('[data-mirror-result]');
  const outcomes = result ? [...result.querySelectorAll('[data-outcome]')] : [];

  if (checks.length > 0 && outcomes.length > 0) {
    /* Alles dicht tot de eerste keuze. Dit gebeurt in JS en niet in Liquid,
       zodat iemand zonder JavaScript de blokken gewoon allemaal ziet staan in
       plaats van een lege sectie. */
    result.hidden = true;
    for (const outcome of outcomes) outcome.hidden = true;

    /* "Ik slaap prima" en de rest kunnen niet naast elkaar bestaan. Wie de
       uitweg kiest, wist zijn eerdere vinkjes; wie daarna alsnog iets herkent,
       wist de uitweg. Dit gebeurt op de invoer zelf en niet pas in de uitkomst,
       zodat wat de bezoeker ziet staan ook echt is wat er geteld wordt. */
    const resolveExclusivity = (changed) => {
      if (changed.dataset.axis === AXIS_OUT) {
        if (!changed.checked) return;
        for (const input of checks) {
          if (input !== changed) input.checked = false;
        }
        return;
      }

      if (!changed.checked) return;
      for (const input of checks) {
        if (input.dataset.axis === AXIS_OUT) input.checked = false;
      }
    };

    const profileOf = (checked) => {
      if (checked.some((input) => input.dataset.axis === AXIS_OUT)) return AXIS_OUT;

      const evening = checked.some((input) => input.dataset.axis === 'avond');
      const morning = checked.some((input) => input.dataset.axis === 'ochtend');

      if (evening && morning) return 'both';
      return evening ? 'avond' : 'ochtend';
    };

    /* Eén melding per bezoek, met de eindstand. Bij elke klik een event sturen
       levert ruis op in plaats van inzicht. Na twee weken vertelt dit welk
       profiel het advertentiepubliek heeft, en dat is direct bruikbaar in de
       advertentiecopy.

       Leegmaken meldt niets. Een `mirror_result` zonder profiel is geen
       uitkomst, en de timer die nog liep hoort dan ook niet alsnog af te gaan
       met de vorige stand.

       En de eerste render meldt ook niets. Komt de bezoeker terug met de
       browserknop, dan herstelt de browser zijn vinkjes, en dan zou het laden
       van de pagina een keuze melden die hij nu niet maakt. Alleen een echte
       `change` telt. */
    let reportTimer = 0;
    let lastReported = null;
    let interacted = false;

    const report = (profile) => {
      clearTimeout(reportTimer);
      if (profile === null || !interacted) return;

      reportTimer = setTimeout(() => {
        if (profile === lastReported) return;
        lastReported = profile;
        if (typeof window.nawmTrack === 'function') {
          window.nawmTrack('mirror_result', { profile });
        }
      }, 1200);
    };

    const render = () => {
      const checked = checks.filter((input) => input.checked);

      if (checked.length === 0) {
        result.hidden = true;
        for (const outcome of outcomes) outcome.hidden = true;
        report(null);
        return;
      }

      const profile = profileOf(checked);

      for (const outcome of outcomes) {
        outcome.hidden = outcome.dataset.outcome !== profile;
      }
      result.hidden = false;

      report(profile);
    };

    for (const input of checks) {
      input.addEventListener('change', () => {
        interacted = true;
        resolveExclusivity(input);
        render();
      });
    }

    /* De browser herstelt vinkjes bij een terugnavigatie of een herlaad, dus
       de eerste render leest de werkelijke stand in plaats van van nul uit te
       gaan. Staat er niets aan, dan blijft alles verborgen. */
    render();
  }
}
