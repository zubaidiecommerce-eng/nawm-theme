# Design notes — NAWM Sleep–Wake System

Waarom dingen zijn zoals ze zijn, zodat niemand ze per ongeluk "verbetert".
De volledige opdracht staat in `NAWM_SHOPIFY_BUILD_SPEC.md`; hieronder alleen
de beslissingen die uit de bouw zijn gekomen.

---

## Hoe de pagina in elkaar zit

```
layout/theme.liquid
  └─ nawm_page?            index of product.wake-up-light
       ├─ snippets/nawm-head.liquid    tokens.css, base.css, fonts
       └─ snippets/nawm-shell.liquid   de lucht, de nachtklok, de scripts

sections/nawm-*.liquid     13 secties, elk met eigen {% stylesheet %}
snippets/nawm-*.liquid     cta, eyebrow, figure, price, review-card,
                           spec-row, verify
assets/nawm-*.css|js       tokens, base, dawn, sunrise, reveal, verify,
                           analytics, sticky-cta
locales/nl.default.json    álle zichtbare copy, onder de sleutel `nawm`
```

Alle CSS die meer dan één sectie raakt, staat in `nawm-base.css`. Alles wat maar
één sectie raakt, staat in die sectie. Er is geen derde plek.

---

## Twee variabelen, niet één

De spec (§4.1) laat de lucht aan `--dawn` hangen: `0` bovenaan de hero, `1` aan
het einde van de ochtenddemo, en `.nawm-sky__morning` krijgt `opacity: var(--dawn)`.

Dat werkt niet samen met de sectietabel in §5. Daar dragen de secties 1 tot en
met 5 `ctx-night` — lichte tekst op een donkere ondergrond. Met een lineaire
`--dawn` staat de ochtendlaag halverwege de pagina al op zo'n 60% en zit die
lichte tekst op een lichte achtergrond. Dat breekt de contrasteisen uit §3.2, en
die zijn expliciet niet onderhandelbaar.

De oplossing splitst de twee dingen die `--dawn` deed:

| Variabele | Loopt over | Stuurt |
|---|---|---|
| `--dawn` | hero-top tot ochtenddemo-bodem, lineair | de nachtklok (23:30 → 07:00) en de `SOFT`-as van Fraunces |
| `--sky` | alleen binnen de ochtenddemo | de crossfade van nacht naar ochtend |
| `--ember` | piek op `--dawn` .5 | de gloed op het kantelpunt, gedempt door `1 - --sky` |

Zo blijft de klok de reis vertellen die de bezoeker maakt, en gebeurt het licht
precies waar de spec het wil: in sectie 6. Beide worden in dezelfde rAF gezet,
dus het kost niets extra. Zie `assets/nawm-dawn.js`.

De ochtenddemo zelf is een donkere slab met een masker aan de onderrand. Je kijkt
naar de zonsopgang op het paneel van het apparaat; de wereld eromheen is licht
geworden zodra je eruit scrollt. Dat is de eerlijke versie: het licht komt uit
het product, niet uit de pagina-achtergrond.

### Wat er scrollt is niet altijd het window

Horizon maakt vanaf 990px `.page-wrapper` de scroll-container en zet `html` en
`body` op `overflow: hidden` (`assets/base.css`, regel 32–38). Boven die breedte
blijft `window.scrollY` dus op `0` staan en vuurt het window geen scroll-event.

`nawm-dawn.js` zoekt daarom bij elke meting op welk element werkelijk scrollt en
hangt zijn listener daaraan. Alle posities worden relatief aan die container
berekend. De IntersectionObservers — reveal, analytics, de sticky CTA — hebben
dit niet nodig: die meten tegen de viewport en werken ook met een inner scroller.

Wie de theme ooit op Dawn zet in plaats van Horizon: die detectie doet dan
vanzelf niets en het window neemt het over.

---

## Regelovergangen in de hero-kop

`nawm.hero.heading` bevat een verticale streep: `Frisser wakker begint|de avond
ervoor.` De streep is geen copy maar een regelmarkering, zodat §5.1's stagger van
120ms per regel echt iets te staggeren heeft zonder dat er markup in de
locale-waarde komt. `nawm-hero.liquid` splitst erop; onder 750px vallen de spans
weer inline zodat de tekst normaal kan afbreken.

---

## Copy-overrides en de claims-lint

§5.1 vraagt om `heading`, `subheading` en `trust_line` als sectiesettings — nodig
voor de A/B-tests uit §11.2 zonder deploy. Dat botst met regel 4 uit §0.3: alle
zichtbare tekst in `locales/nl.default.json`.

Beide blijven waar: elke sectie leest de locale-waarde, tenzij de setting is
ingevuld. En `config` is aan de TARGETS van de claims-lint toegevoegd, zodat copy
die via de theme-editor is ingetypt en in `config/settings_data.json` landt, óók
gescand wordt. Zonder die toevoeging was de override een gat in de lint.

---

## De allowlist van de claims-lint

De verbatim FAQ-copy uit §5.12 trip de blocker-regex uit §7.3:

> Word ik gegarandeerd energieker wakker?

Dat is de vraag van de bezoeker; het antwoord eronder is "Geen product kan dat
voor iedereen garanderen." De pagina doet dus precies het tegenovergestelde van
de claim waar de lint op zoekt.

De regex verzwakken zou de guard onbruikbaar maken. In plaats daarvan staan de
twee regels woordelijk in `scripts/claims-allow.txt`, met de reden erbij. Wijzigt
de regel één teken, dan valt hij weer door de lint. Het aantal overgeslagen
regels wordt altijd geprint, zodat de lijst niet ongemerkt groeit.

Eén term is wél aangepast: de spec noemt `100% ` als losse blockerterm. Die
matcht elke CSS-percentage — zestig treffers in Horizon zelf. Hij is nu gebonden
aan de woorden die er in een marketingclaim op volgen (`100% veilig`,
`100% natuurlijk`). Een lint die wolf roept, wordt niet meer gedraaid.

---

## VERIFY werkt anders dan letterlijk in de spec

§0.4 schrijft dat `nawm-verify.js` blokkeert bij `Shopify.designMode === false`.
Buiten de theme-editor bestaat `Shopify.designMode` niet, dus die vergelijking is
nooit waar en de guard zou dood zijn. Het script test daarom op de *afwezigheid*
van designMode.

En de tokens staan niet als letterlijke `{{VERIFY:...}}`-string in de bestanden,
maar als `{% render 'nawm-verify', field: ..., note: ... %}`. Dat scheelt
copy-paste en geeft elk token een veld en een bron. De claims-lint zoekt op beide
vormen.

---

## Toegankelijkheid, de niet-vanzelfsprekende keuzes

- **De nachtklok is `aria-hidden`.** Hij is narratief, geen informatie die een
  screenreader nodig heeft.
- **De scrubber is een echte `<input type="range">`** met label. Pijltjes werken.
  De waarde wordt in het Nederlands aangekondigd via `aria-valuetext`:
  "30 minuten zonsopgang, helderheid 14 van 20".
- **De annotaties op het knolling-beeld zijn echte knoppen** met een
  toegankelijke naam, niet `aria-hidden`-decoratie. Ze zijn dus met tab te
  bereiken en tonen hun label op focus én hover. Onder 750px verdwijnen ze —
  32px-punten liggen op een telefoon te dicht op elkaar. De lijst eronder is de
  bron en blijft altijd staan.
- **De vergelijking gebruikt geen vinkjes en kruisjes.** Beide kolommen hebben
  een tekstkop, zodat kleur nooit alleen betekenis draagt.
- **De FAQ is native `<details>`/`<summary>`.** Geen JS-accordeon.
- **Geen lichtanimatie sneller dan één verandering per seconde.** De doorloop van
  de scrubber is één doorlopende ramp van zes seconden, geen flits. Bij
  `prefers-reduced-motion` start hij niet vanzelf en springt de handmatige
  doorloop direct naar de eindstand.

---

## Performance

- Twee stylesheets in de `<head>`, samen ongecomprimeerd ongeveer 12KB. De rest
  is sectie-CSS die Shopify bij de sectie inlinet.
- Vier kleine modules: `nawm-dawn.js` (de enige die niet `fetchpriority=low` is),
  plus reveal, analytics en verify. De scrubber en de sticky CTA laden alleen op
  de secties die ze gebruiken.
- `nawm-dawn.js` doet geen layout-reads binnen de rAF-callback. De bounds worden
  gecached en opnieuw gemeten bij resize, load, een ResizeObserver op de body en
  bij `shopify:section:load`.
- Beelden lopen allemaal via `snippets/nawm-figure.liquid`. Nergens anders staat
  een handgeschreven `<img>`. Er staat bewust geen `format:` in de
  `image_url`-filters: Shopify's CDN onderhandelt dan zelf over AVIF en WebP.
- Geen apps, geen page builder, geen jQuery, geen npm-dependencies, geen
  icon-library. De enkele iconen die nodig zijn, zijn inline SVG met
  `currentColor`.

---

## Twee secties wijken af van de gedeelde sectiepadding

§3.4 zegt: zet `padding-block` op `.nawm-section` en nergens anders. Twee
uitzonderingen, allebei met een reden in de code:

1. **De hero** zet hem op `0`, omdat het beeld op desktop de volle hoogte onder
   de header moet vullen.
2. **De veiligheidsnoot** maakt hem kleiner. Een fijndruk-blok met 10rem lucht
   eromheen leest als een sectie, en dat is hij bewust niet.

Er is geen derde.
