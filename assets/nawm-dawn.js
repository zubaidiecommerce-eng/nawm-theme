/**
 * nawm-dawn.js — de dawn-engine en de nachtklok. BUILD SPEC §4.1 / §4.2.
 *
 * Zet één variabele op <html>: `--dawn` loopt van 0 (23:30, bovenkant hero)
 * naar 1 (07:00, einde ochtenddemo). `--ember` piekt op 1 rond --dawn .5.
 * De hele pagina hangt daaraan; niets anders leest de scrollpositie.
 *
 * Kosten: één rAF per scroll-frame. Binnen de frame worden geen layout-reads
 * gedaan — de bounds zijn gecached en worden alleen bij resize/load hermeten.
 */

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

const HHMM = document.querySelector('[data-nawm-clock]');
const clockNodes = document.querySelectorAll('[data-nawm-clock]');

function clock(dawn) {
  if (!HHMM) return;
  const total = (23 * 60 + 30 + dawn * 450) % 1440;
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(Math.floor(total % 60)).padStart(2, '0');
  const text = `${h}:${m}`;
  for (const node of clockNodes) {
    if (node.textContent !== text) node.textContent = text;
  }
}

function bounds() {
  const a = document.querySelector('[data-dawn-start]');
  const b = document.querySelector('[data-dawn-end]');
  if (!a || !b) return null;
  const top = a.getBoundingClientRect().top + window.scrollY;
  const bottom = b.getBoundingClientRect().bottom + window.scrollY;
  return { top, span: Math.max(1, bottom - top) };
}

let box = bounds();
let ticking = false;

function paint() {
  ticking = false;
  if (!box) return;
  const raw = clamp01((window.scrollY + window.innerHeight * 0.55 - box.top) / box.span);
  const dawn = reduce.matches ? (raw < 0.5 ? 0 : 1) : raw;
  root.style.setProperty('--dawn', dawn.toFixed(4));
  root.style.setProperty('--ember', (1 - Math.abs(dawn * 2 - 1)).toFixed(4));
  clock(dawn);
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(paint);
  }
}

function remeasure() {
  box = bounds();
  onScroll();
}

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

paint();
