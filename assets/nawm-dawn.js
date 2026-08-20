/**
 * nawm-dawn.js — de dawn-engine en de nachtklok. BUILD SPEC §4.1 / §4.2.
 *
 * Zet twee variabelen op <html>:
 *
 *   --dawn  0 → 1, lineair van de bovenkant van de hero tot de onderkant van de
 *           ochtenddemo. Dat is de reis die de klok vertelt: 23:30 → 07:00.
 *           Stuurt ook de SOFT-as van Fraunces.
 *   --sky   0 → 1, maar pas binnen de ochtenddemo. Dit is de crossfade van
 *           nacht naar ochtend.
 *
 * De spec (§4.1) laat de lucht aan --dawn hangen. Met één lineaire variabele
 * licht de achtergrond al halverwege de nachtsecties op, terwijl secties 2 tot
 * en met 5 met ctx-night lichte tekst dragen — dat breekt de contrasteisen uit
 * §3.2, en die zijn niet onderhandelbaar. Zie docs/DESIGN-NOTES.md.
 *
 * Kosten: één rAF per scroll-frame. Binnen de frame worden geen layout-reads
 * gedaan — de bounds zijn gecached en worden alleen bij resize, load en
 * sectiewijzigingen hermeten.
 */

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

const clockNodes = document.querySelectorAll('[data-nawm-clock]');

function clock(dawn) {
  if (clockNodes.length === 0) return;
  const total = (23 * 60 + 30 + dawn * 450) % 1440;
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(Math.floor(total % 60)).padStart(2, '0');
  const text = `${h}:${m}`;
  for (const node of clockNodes) {
    if (node.textContent !== text) node.textContent = text;
  }
}

/**
 * Horizon maakt vanaf 990px `.page-wrapper` de scroll-container en zet html en
 * body op `overflow: hidden`. Boven die breedte blijft `window.scrollY` dus op
 * 0 staan en vuurt het window geen scroll-event. Zonder deze detectie zou de
 * hele engine op desktop stilstaan.
 */
let host = null; // null betekent: het window scrollt

function resolveHost() {
  const wrapper = document.querySelector('.page-wrapper');
  host = wrapper && wrapper.scrollHeight - wrapper.clientHeight > 1 ? wrapper : null;
}

const scrollTop = () => (host ? host.scrollTop : window.scrollY);
const viewport = () => (host ? host.clientHeight : window.innerHeight);

function offsetTop(el) {
  const box = el.getBoundingClientRect();
  if (!host) return box.top + window.scrollY;
  return box.top - host.getBoundingClientRect().top + host.scrollTop;
}

function bounds() {
  const a = document.querySelector('[data-dawn-start]');
  const b = document.querySelector('[data-dawn-end]');
  if (!a || !b) return null;

  const top = offsetTop(a);
  const skyTop = offsetTop(b);
  const bottom = skyTop + b.offsetHeight;

  return {
    top,
    span: Math.max(1, bottom - top),
    skyTop,
    skySpan: Math.max(1, bottom - skyTop),
  };
}

let box = null;
let ticking = false;

function paint() {
  ticking = false;
  if (!box) return;

  const y = scrollTop();
  const h = viewport();

  const raw = clamp01((y + h * 0.55 - box.top) / box.span);
  const rawSky = clamp01((y + h * 0.85 - box.skyTop) / box.skySpan);

  const dawn = reduce.matches ? (raw < 0.5 ? 0 : 1) : raw;
  const sky = reduce.matches ? (rawSky < 0.5 ? 0 : 1) : rawSky;

  root.style.setProperty('--dawn', dawn.toFixed(4));
  root.style.setProperty('--sky', sky.toFixed(4));
  root.style.setProperty('--ember', (1 - Math.abs(dawn * 2 - 1)).toFixed(4));
  clock(dawn);
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(paint);
  }
}

let attached = null;

function attach() {
  if (attached === host) return;
  if (attached) attached.removeEventListener('scroll', onScroll);
  if (host) host.addEventListener('scroll', onScroll, { passive: true });
  attached = host;
}

function remeasure() {
  resolveHost();
  attach();
  box = bounds();
  onScroll();
}

/* Het window blijft luisteren: onder 990px is dát de scroller. */
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', remeasure, { passive: true });
addEventListener('load', remeasure);
reduce.addEventListener('change', paint);

/* Beelden en fonts verschuiven de bounds nadat ze binnen zijn. */
if ('ResizeObserver' in window) {
  new ResizeObserver(remeasure).observe(document.body);
}

/* De theme-editor voegt secties toe zonder herladen. */
document.addEventListener('shopify:section:load', remeasure);
document.addEventListener('shopify:section:unload', remeasure);

remeasure();
