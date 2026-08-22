/**
 * nawm-clips.js — de korte productclips.
 *
 * Video's die vanzelf mogen lopen, starten pas wanneer ze in beeld staan en
 * stoppen zodra ze eruit gaan. Dat scheelt bandbreedte en batterij, en het
 * voorkomt zes tegelijk spelende video's op een telefoon.
 *
 * Bij prefers-reduced-motion start er niets vanzelf. De video blijft dan een
 * gewone video met bediening — de bezoeker kiest zelf.
 *
 * De pauzeknop is geen extraatje: beweging die je niet kunt stoppen, is een
 * toegankelijkheidsprobleem.
 */

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const players = [...document.querySelectorAll('[data-clip-autoplay]')];

if (players.length > 0) {
  /* Zonder automatische beweging horen de knoppen er ook bij te blijven: de
     bezoeker kan de clip dan handmatig starten. */
  const labels = {
    play: document.documentElement.lang === 'nl' ? 'Afspelen' : 'Play',
    pause: document.documentElement.lang === 'nl' ? 'Pauzeren' : 'Pause',
  };

  for (const video of players) {
    const frame = video.closest('.pdp-clips__frame');
    const toggle = frame?.querySelector('[data-clip-toggle]');
    const toggleLabel = toggle?.querySelector('[data-clip-toggle-label]');

    /* Handmatig gepauzeerd blijft gepauzeerd, ook als je eraf scrollt en
       terugkomt. Anders vecht de observer met de bezoeker. */
    let heldByUser = reduce.matches;

    const sync = () => {
      if (!toggleLabel) return;
      toggleLabel.textContent = video.paused ? labels.play : labels.pause;
    };

    const tryPlay = () => {
      if (heldByUser) return;
      /* play() geeft een promise die de browser mag weigeren, bijvoorbeeld in
         de energiebesparingsmodus. Dat is geen fout die de pagina moet halen. */
      video.play().then(sync).catch(() => {});
    };

    toggle?.addEventListener('click', () => {
      if (video.paused) {
        heldByUser = false;
        tryPlay();
      } else {
        heldByUser = true;
        video.pause();
        sync();
      }
    });

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) tryPlay();
          else if (!video.paused) video.pause();
        },
        { threshold: 0.4 }
      ).observe(video);
    }

    reduce.addEventListener('change', (event) => {
      if (event.matches) {
        heldByUser = true;
        video.pause();
      } else {
        heldByUser = false;
      }
      sync();
    });

    sync();
  }
}
