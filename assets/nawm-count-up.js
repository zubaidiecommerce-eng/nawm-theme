/**
 * nawm-count-up.js — getallen die oplopen. Fix & verfijning v5, B3.
 *
 * De kerngetallen op de homepage tellen op wanneer ze voor het eerst in beeld
 * komen. Duur 900ms, ease-out, en `font-variant-numeric: tabular-nums` staat al
 * op `.nawm-mono`, zodat er onderweg niets verspringt.
 *
 * Eén keer, bij het eerste keer in beeld komen. Bij `prefers-reduced-motion`
 * staat het eindgetal er meteen.
 *
 * Wat dit script bewust wél doet: álle getallen in een waarde tegelijk laten
 * oplopen. "10–60 minuten" is geen enkel getal maar een bereik, en alleen de
 * 60 laten tellen levert onderweg "10–37" op — een bereik dat niet bestaat.
 * Nu lopen ze samen op en landen ze samen: 3–19, 7–42, 10–60.
 *
 * Wat het bewust níét doet: tekst aanraken. "Ja" telt nergens naartoe, en een
 * waarde zonder cijfers blijft onaangeraakt staan.
 */

const DUUR = 900;

/* Dezelfde curve als `--ease-out` in nawm-tokens.css, hier als functie omdat
   dit met de hand geïnterpoleerd wordt en niet door de browser. Een
   benadering van cubic-bezier(.22, 1, .36, 1): snel weg, zacht landen. */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Splitst een waarde in stukken tekst en getallen.
 *
 * @param {string} tekst
 * @returns {{ delen: Array<{ getal: number | null, tekst: string }>, heeftGetal: boolean }}
 */
function ontleed(tekst) {
  const delen = [];
  let heeftGetal = false;
  const patroon = /\d+/g;
  let laatste = 0;
  let match;

  while ((match = patroon.exec(tekst)) !== null) {
    if (match.index > laatste) delen.push({ getal: null, tekst: tekst.slice(laatste, match.index) });
    delen.push({ getal: Number(match[0]), tekst: match[0] });
    heeftGetal = true;
    laatste = match.index + match[0].length;
  }

  if (laatste < tekst.length) delen.push({ getal: null, tekst: tekst.slice(laatste) });

  return { delen, heeftGetal };
}

/** @param {HTMLElement} el */
function telOp(el) {
  const origineel = el.textContent ?? '';
  const { delen, heeftGetal } = ontleed(origineel);
  if (!heeftGetal) return;

  const start = performance.now();

  const stap = (nu) => {
    const t = Math.min(1, (nu - start) / DUUR);
    const factor = easeOut(t);

    el.textContent = delen
      .map((deel) => {
        if (deel.getal === null) return deel.tekst;
        const waarde = String(Math.round(deel.getal * factor));
        /* Stond er een voorloopnul, dan blijft die staan: 07:00 telt niet op
           naar 7:00. */
        return deel.tekst.startsWith('0') ? waarde.padStart(deel.tekst.length, '0') : waarde;
      })
      .join('');

    if (t < 1) requestAnimationFrame(stap);
    else el.textContent = origineel;
  };

  requestAnimationFrame(stap);
}

const doelen = [...document.querySelectorAll('[data-count-up]')];

if (doelen.length > 0) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    /* Niets doen: de eindwaarde staat al in de HTML. */
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          telOp(/** @type {HTMLElement} */ (entry.target));
        }
      },
      { threshold: 0.6 }
    );

    for (const el of doelen) io.observe(el);
  }
}
