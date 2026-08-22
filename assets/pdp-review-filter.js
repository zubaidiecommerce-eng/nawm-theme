/**
 * pdp-review-filter.js — de themafilters boven de reviewkaarten. PDP SPEC §3.7.
 *
 * De chips worden in Liquid opgebouwd uit de thema's die de getoonde reviews
 * werkelijk hebben, dus er staat nooit een filter dat niets oplevert. Dit
 * script verbergt en toont; het haalt niets op en het sorteert niets.
 *
 * Zonder JS staan alle reviews er gewoon, en zijn de chips onzichtbaar — zie
 * de `.pdp-proof__filters` regel in de sectie.
 */

const root = document.querySelector('[data-pdp-reviews]');

if (root) {
  const chips = [...root.querySelectorAll('[data-review-filter]')];
  const cards = [...root.querySelectorAll('[data-review-theme]')];
  const status = root.querySelector('[data-review-status]');

  if (chips.length > 1 && cards.length > 0) {
    root.classList.add('has-filters');

    const apply = (value) => {
      let shown = 0;

      for (const card of cards) {
        const match = value === '' || card.dataset.reviewTheme === value;
        card.hidden = !match;
        if (match) shown += 1;
      }

      for (const chip of chips) {
        chip.setAttribute('aria-pressed', chip.dataset.reviewFilter === value ? 'true' : 'false');
      }

      /* Het aantal wordt aangekondigd, want voor wie niet ziet dat kaarten
         verdwijnen is een filter zonder terugkoppeling stil kapot. */
      if (status) status.textContent = status.dataset.template.replace('#', String(shown));
    };

    for (const chip of chips) {
      chip.addEventListener('click', () => apply(chip.dataset.reviewFilter));
    }
  }
}
