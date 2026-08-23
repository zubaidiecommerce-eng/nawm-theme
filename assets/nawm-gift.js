/**
 * nawm-gift.js — de cadeauoptie bij twee stuks.
 *
 * De vraag "verstuur als cadeau" hoort alleen te verschijnen bij twee
 * exemplaren. Bij één stuk voor jezelf is hij onzin, en een veld dat er staat
 * zonder dat het ergens over gaat kost aandacht die de knop nodig heeft.
 *
 * Het vinkje gaat als line item property mee naar de winkelwagen; Shopify toont
 * die dan bij de bestelling, zodat de pakbon zonder prijs kan.
 */

const form = document.querySelector('[data-nawm-gift-form]');

if (form) {
  const toggle = form.querySelector('[data-gift-toggle]');
  const check = form.querySelector('[data-gift-check]');
  const options = [...form.querySelectorAll('input[name="quantity"]')];

  if (toggle && check && options.length > 0) {
    const sync = () => {
      const selected = options.find((input) => input.checked);
      const pair = selected && Number(selected.value) > 1;

      toggle.hidden = !pair;

      /* Terugschakelen naar één stuk mag de cadeauoptie niet stilletjes
         meesturen. */
      if (!pair) check.checked = false;
    };

    for (const input of options) input.addEventListener('change', sync);

    check.addEventListener('change', () => {
      if (typeof window.nawmTrack === 'function') {
        window.nawmTrack('gift_option_toggle', { on: check.checked });
      }
    });

    sync();
  }
}
