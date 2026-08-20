/**
 * nawm-verify.js — VERIFY-token guard. BUILD SPEC §0.4.
 *
 * Een {{VERIFY:...}} is een feit dat nog niet op het verkoopmodel is
 * gecontroleerd. In de theme-editor is het fel magenta zichtbaar zodat het
 * opvalt; op de live storefront is het een blocker: console-error plus een
 * banner, zodat een onopgemerkte VERIFY nooit stilletjes meegaat.
 *
 * De spec schrijft `Shopify.designMode === false`. Buiten de editor bestaat
 * `Shopify.designMode` niet, dus die vergelijking zou nooit waar zijn en de
 * guard zou dood zijn. Daarom testen we op de afwezigheid van designMode.
 */

const inDesignMode = Boolean(window.Shopify && window.Shopify.designMode);
const tokens = document.querySelectorAll('.verify');

if (tokens.length > 0) {
  const fields = [...tokens].map((el) => el.dataset.verifyField || el.textContent.trim());

  if (inDesignMode) {
    console.warn(`[NAWM] ${tokens.length} openstaande VERIFY-token(s):`, fields);
  } else {
    console.error(
      `[NAWM] BLOCKER: ${tokens.length} onopgeloste VERIFY-token(s) op de live pagina. ` +
        'Geen enkele specificatie mag geraden worden — zie docs/OPEN.md.',
      fields
    );

    const banner = document.createElement('p');
    banner.className = 'nawm-verify-banner';
    banner.setAttribute('role', 'alert');
    banner.textContent = `NAWM BUILD-BLOCKER — ${tokens.length} onopgeloste VERIFY: ${fields.join(' · ')}`;
    document.body.appendChild(banner);
  }
}
