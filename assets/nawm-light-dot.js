/**
 * nawm-light-dot.js — de signatuurinteractie. Fix & verfijning v5, B2.
 *
 * Wie iets aan de winkelwagen toevoegt, ziet één amber lichtpunt van de knop
 * naar het winkelwagenicoon reizen. Daarna pulseert het icoon één keer. Geen
 * confetti, geen popup, geen geluid — één lichtpunt dat verhuist.
 *
 * Waarom dit op `cart:update` hangt en niet op de klik:
 *
 * De koopknoppen van NAWM staan in een gewoon `{% form 'product' %}` zonder
 * `product-form-component` eromheen. Zo'n formulier doet een echte POST naar
 * /cart/add en navigeert daarna weg. Een animatie die tijdens die navigatie
 * loopt, ziet er niet duur uit maar kapot.
 *
 * Door op `cart:update` te wachten — het event dat Horizon vuurt wanneer het
 * toevoegen via fetch is gegaan — gebeurt er op de navigatieroute niets, en op
 * de fetch-route het volledige effect. Geen gok, geen halve animatie.
 *
 * Dat betekent ook dat dit effect op de productpagina nu níét te zien is. Zie
 * docs/OPEN.md: die formulieren moeten in een `product-form-component`, en dan
 * opent ook de lade waar `cart_type: drawer` al om vraagt.
 *
 * Bij `prefers-reduced-motion` gebeurt er niets. Niet een kortere animatie —
 * niets. Dat is wat die voorkeur vraagt.
 */

const DUUR = 620;
const PULS = 600;

/** Onthoudt welke knop als laatste is ingedrukt, zodat het licht daarvandaan vertrekt. */
let laatsteKnop = null;

document.addEventListener(
  'pointerdown',
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const knop = target?.closest('button[name="add"], [data-nawm-event="add_to_cart"]');
    if (knop) laatsteKnop = knop;
  },
  { capture: true }
);

function cartIcoon() {
  return document.querySelector('cart-icon, [data-testid="cart-icon"], .header-actions__cart-icon');
}

/**
 * Stuurt één lichtpunt van het ene element naar het andere.
 *
 * @param {Element} van
 * @param {Element} naar
 */
function stuurLicht(van, naar) {
  const a = van.getBoundingClientRect();
  const b = naar.getBoundingClientRect();

  /* Een element dat niet in beeld staat heeft een rect van nul. Dan is er geen
     zinnige baan te tekenen en blijft het bij de puls op het icoon. */
  if (a.width === 0 || b.width === 0) return false;

  const punt = document.createElement('span');
  punt.className = 'nawm-light-dot';
  punt.style.left = `${a.left + a.width / 2}px`;
  punt.style.top = `${a.top + a.height / 2}px`;
  document.body.appendChild(punt);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  const animatie = punt.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(.4)`, opacity: 0 },
    ],
    { duration: DUUR, easing: 'cubic-bezier(.22, 1, .36, 1)' }
  );

  /* Eén keer opruimen, hoe het ook afloopt.
   *
   * Het vangnet met de timer is geen overdaad. Een verborgen tabblad pauzeert
   * animaties: `playState` blijft hangen en `onfinish` komt nooit. Dat is
   * geen theorie — het is gemeten in de preview, waar `document.hidden` waar
   * is en het lichtpunt zonder deze timer op het scherm bleef staan. Iemand
   * die toevoegt en meteen naar een ander tabblad gaat, komt anders terug bij
   * een amber stip die er blijft.
   *
   * De marge van 400ms boven de duur is ruim genoeg voor een frame of wat
   * vertraging en kort genoeg om niet op te vallen. */
  let opgeruimd = false;
  const ruimOp = (metPuls) => {
    if (opgeruimd) return;
    opgeruimd = true;
    clearTimeout(vangnet);
    punt.remove();
    if (metPuls) puls(naar);
  };

  const vangnet = setTimeout(() => ruimOp(true), DUUR + 400);

  animatie.onfinish = () => ruimOp(true);
  animatie.oncancel = () => ruimOp(false);

  return true;
}

/** @param {Element} el */
function puls(el) {
  el.setAttribute('data-pulse', 'true');
  setTimeout(() => el.removeAttribute('data-pulse'), PULS);
}

document.addEventListener('cart:update', (event) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* In een verborgen tabblad is er niemand die kijkt, en animaties lopen daar
     toch niet. Meteen stoppen scheelt een lichtpunt dat op het vangnet moet
     wachten. */
  if (document.hidden) return;

  const bron = event?.detail?.data?.source;
  if (bron !== 'product-form-component' && bron !== 'add-to-cart' && bron !== 'quick-add') return;

  const icoon = cartIcoon();
  if (!icoon) return;

  /* De lade schuift bij het toevoegen open en legt zich over het icoon heen.
     Het licht moet daar vóór aankomen, dus vertrekt het meteen — één frame
     later, zodat de rects van na de klik gemeten worden. */
  requestAnimationFrame(() => {
    const van = laatsteKnop?.isConnected ? laatsteKnop : null;
    if (!van || !stuurLicht(van, icoon)) puls(icoon);
    laatsteKnop = null;
  });
});
