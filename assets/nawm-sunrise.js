/**
 * nawm-sunrise.js — <nawm-sunrise>, de zonsopgang-scrubber. BUILD SPEC §4.3.
 *
 * Toont uitsluitend wat het apparaat werkelijk doet: licht dat oploopt, een
 * helderheidsgetal, een tijd en een geluid. Geen melatoninegrafiek, geen
 * hartslag, geen slaapfases.
 *
 * Twee variabelen op het element:
 *   --rise  0..1  de schuifstand (10..60 minuten) — kiest duur en helderheid
 *   --lit   0..1  het licht op dit moment — rust op --rise, loopt bij doorloop
 *
 * Eén doorloop duurt altijd 6 seconden, ongeacht de gekozen minutenwaarde.
 * Dat staat ook in de interface: het is een samenvatting, geen realtime beeld.
 * Bij prefers-reduced-motion loopt er niets vanzelf; alles blijft bedienbaar.
 */

const PLAY_MS = 6000;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* easeInOutSine — licht dat oploopt zonder schok aan begin of eind. */
const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const pad = (n) => String(Math.floor(n)).padStart(2, '0');

class NawmSunrise extends HTMLElement {
  connectedCallback() {
    this.range = this.querySelector('input[type=range]');
    this.panel = this.querySelector('[data-panel]');
    this.levelEl = this.querySelector('[data-level]');
    this.minutesEls = this.querySelectorAll('[data-minutes]');
    this.timeEl = this.querySelector('[data-time]');
    this.playBtn = this.querySelector('[data-play]');
    this.chips = this.querySelectorAll('[data-sound]');
    this.soundEl = this.querySelector('[data-sound-label]');

    if (!this.range) return;

    this.wake = this.parseWake(this.getAttribute('data-wake') || '07:00');
    this.playing = false;
    this.raf = 0;
    this.reported = false;

    this.range.addEventListener('input', () => {
      this.render();
      this.report();
    });

    this.playBtn?.addEventListener('click', () => this.play());

    for (const chip of this.chips) {
      chip.addEventListener('click', () => this.selectSound(chip));
    }

    this.observe();
    this.render();
  }

  disconnectedCallback() {
    this.audio?.pause();
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
  }

  parseWake(value) {
    const [h, m] = String(value).split(':').map(Number);
    return (Number.isFinite(h) ? h : 7) * 60 + (Number.isFinite(m) ? m : 0);
  }

  /* Start pas bij interactie, of wanneer de sectie voor de helft in beeld staat. */
  observe() {
    if (reduce.matches || !('IntersectionObserver' in window)) return;
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.play();
            this.io.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    this.io.observe(this);
  }

  render(lit) {
    const min = Number(this.range.value); // 10..60
    const t = (min - 10) / 50; // 0..1
    this.style.setProperty('--rise', t.toFixed(3));

    const level = Math.round(1 + t * 19); // 1..20
    this.range.setAttribute('aria-valuetext', `${min} minuten zonsopgang, helderheid ${level} van 20`);
    if (this.levelEl) this.levelEl.textContent = level;
    for (const el of this.minutesEls) el.textContent = min;

    const progress = typeof lit === 'number' ? lit : 1;
    this.style.setProperty('--lit', progress.toFixed(3));

    if (this.timeEl) {
      const start = this.wake - min;
      const now = (start + min * progress + 1440) % 1440;
      this.timeEl.textContent = `${pad(now / 60)}:${pad(now % 60)}`;
    }
  }

  play() {
    if (this.playing) return;

    if (reduce.matches) {
      this.render(1);
      return;
    }

    this.playing = true;
    const started = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - started) / PLAY_MS);
      this.render(ease(t));
      if (t < 1) {
        this.raf = requestAnimationFrame(step);
      } else {
        this.playing = false;
      }
    };

    this.render(0);
    this.raf = requestAnimationFrame(step);
  }

  selectSound(chip) {
    for (const other of this.chips) other.setAttribute('aria-pressed', String(other === chip));
    if (this.soundEl) this.soundEl.textContent = chip.dataset.sound;
    this.playPreview(chip);
    this.report();
  }

  /* Een kort fragment bij de gekozen chip, als er een audiobestand aan hangt.
     Er speelt er nooit meer dan één tegelijk, en er start niets vanzelf: geluid
     dat uit zichzelf begint is op een webshop een reden om weg te klikken. */
  playPreview(chip) {
    const src = chip.dataset.soundSrc;

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    if (!src) return;

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'none';
    }

    if (this.audio.src !== src) this.audio.src = src;
    this.audio.play().catch(() => {
      /* De browser mag weigeren, bijvoorbeeld zonder eerdere interactie. Dat is
         geen fout die de pagina moet halen. */
    });
  }

  /* Via nawmTrack, zodat het event de consent-wachtrij van nawm-analytics.js
     doorloopt en niet rechtstreeks in de dataLayer belandt. */
  report() {
    if (this.reported) return;
    this.reported = true;
    if (typeof window.nawmTrack === 'function') window.nawmTrack('use_sunrise_scrubber');
  }
}

if (!customElements.get('nawm-sunrise')) {
  customElements.define('nawm-sunrise', NawmSunrise);
}
