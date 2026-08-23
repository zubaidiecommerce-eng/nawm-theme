/**
 * nawm-clip.js — de korte animaties op de productpagina.
 *
 * Dit script ontbrak: de clips droegen wel `data-clip-autoplay` en een
 * pauzeknop, maar er was niets dat ze bediende. Gevolg: de video's stonden
 * stil en de knop deed niets.
 *
 * Wat het doet:
 *   · een clip start pas wanneer hij in beeld staat, en stopt zodra hij eruit
 *     gaat — dat scheelt bandbreedte en voorkomt vier tegelijk spelende
 *     video's op een telefoon
 *   · handmatig pauzeren blijft gepauzeerd, ook als je eraf scrollt en
 *     terugkomt; anders vecht de observer met de bezoeker
 *   · bij prefers-reduced-motion start er niets vanzelf. Beweging die je niet
 *     kunt stoppen is een toegankelijkheidsprobleem, geen stijlkeuze
 *
 * `preload="none"` staat op het element zelf. De browser haalt de video dus
 * pas op als hij hem echt nodig heeft.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const players = document.querySelectorAll('[data-clip-autoplay]');

const LABELS = {
  play: 'Afspelen',
  pause: 'Pauze',
};

for (const video of players) {
  const frame = video.closest('.nawm-clip__frame');
  const toggle = frame?.querySelector('[data-clip-toggle]');
  const toggleLabel = toggle?.querySelector('[data-clip-toggle-label]');

  let heldByUser = reduce.matches;

  const sync = () => {
    if (toggleLabel) toggleLabel.textContent = video.paused ? LABELS.play : LABELS.pause;
  };

  const tryPlay = () => {
    if (heldByUser) return;
    /* play() geeft een promise die de browser mag weigeren, bijvoorbeeld in de
       energiebesparingsmodus. Dat is geen fout die de pagina moet halen. */
    video.play().then(sync).catch(() => {});
  };

  toggle?.addEventListener('click', () => {
    if (video.paused) {
      heldByUser = false;
      tryPlay();
    } else {
      heldByUser = true;
      video.pause();
    }
    sync();
  });

  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else if (!video.paused) video.pause();
      },
      { threshold: 0.35 }
    ).observe(video);
  } else {
    tryPlay();
  }

  reduce.addEventListener('change', (event) => {
    heldByUser = event.matches;
    if (event.matches) video.pause();
    sync();
  });

  sync();
}
