# Openstaande verificaties — NAWM Sleep–Wake System

Alles wat hieronder staat, is **niet geraden**. Waar een feit ontbrak, staat op
de pagina een magenta VERIFY-token in plaats van een getal. Die tokens zijn
zichtbaar in de theme-editor en gooien op de live storefront een console-error
plus een banner — zie `assets/nawm-verify.js`.

Draai vóór livegang:

```bash
bash scripts/claims-lint.sh --strict
```

Groen betekent: geen verboden claims, en nul openstaande VERIFY.

---

## 1 · Productfeiten die op het verkoopmodel gemeten moeten worden

Deze horen als metafields in de namespace `nawm` op het NAWM-product te staan
(zie §2 hieronder). Zolang ze leeg zijn, rendert het VERIFY-token.

| # | Wat | Waarom het klemt | Bron nodig | Metafield |
|---|---|---|---|---|
| 1 | Aantal wekgeluiden versus ontspanningsgeluiden | De listingtitel noemt 25 ontspanningsgeluiden, specificaties elders noemen 22 wekgeluiden, de omschrijving noemt "kies uit de 7 beste natuurgeluiden bij het instellen". Drie getallen, één verwachting bij de koper | Fysieke test van het verkoopmodel plus de definitieve specificatiekaart | `relax_sounds_count`, `wake_sounds_count`, `wake_sounds_list` |
| 2 | FM-radio | Nieuwe versie heeft radio, oudere reviews melden dat hij ontbreekt. Radio staat in de copy van sectie 4, 6, 9 en de FAQ | Model, knoppen, ontvangst en handleiding één-op-één controleren | `has_fm_radio` |
| 3 | Prijs | Blauwdruk adviseert €69,95 op de eigen webshop; de bol-listing van hetzelfde product staat op €39,95. Een bezoeker die vergelijkt, vindt dat verschil | Besluit: differentiëren op bundel, kanaalprijs gelijktrekken, of bewust accepteren met uitleg | themasetting `price_manual` of de productprijs |
| 4 | Voeding en back-up | De FAQ belooft een antwoord over stroomuitval | Producttest: blijven tijd en alarm bewaard, en hoelang | `power`, `battery_backup` |
| 5 | Afmetingen, gewicht, materiaal, vermogen, kabel | De specificatiesectie is een vertrouwenssectie; gaten ondermijnen die | Meten op het verkoopmodel | `dimensions_mm`, `weight_g` |
| 6 | EAN en garantietermijn | Moeten identiek zijn aan verpakking en bol-listing | Verpakking en leverancier | `ean`, `warranty` |
| 7 | Lichtkleuren | Bron noemt acht kleuren: amber, blauw, geel, groen, oranje, rood, wit, roze | Bevestigen op het verkoopmodel | `light_colors` |
| 8 | Proefperiode 30 nachten | Sterk instrument, maar alleen bij ingericht retour- en hygiëneproces | Besluit plus proces | themasettings `show_trial_period`, `trial_nights`, en de checkbox op de hero |
| 9 | Reviewcitaten | Alleen letterlijk en met bron te gebruiken | Selectie plus vastlegging van bron en datum | metaobject `nawm_review` |
| 10 | Merknaam "Sleep–Wake System" | Wordt de commerciële propositie op de hele site | Merkcheck en toepassing op verpakking | — |

---

## 2 · Datamodel dat nog in Shopify aangemaakt moet worden

De theme leest alles hieruit. Zonder deze velden rendert de pagina, maar toont
hij VERIFY-tokens in plaats van specificaties.

### Product-metafields, namespace `nawm`

| Key | Type | Status |
|---|---|---|
| `brightness_levels` | integer | bevestigd in listing: 20 |
| `sunrise_min_minutes` | integer | bevestigd: 10 |
| `sunrise_max_minutes` | integer | bevestigd: 60 |
| `relax_sounds_count` | integer | **VERIFY** |
| `wake_sounds_count` | integer | **VERIFY** |
| `wake_sounds_list` | list.single_line_text | **VERIFY** |
| `light_colors` | list.single_line_text | te bevestigen |
| `has_fm_radio` | boolean | **VERIFY** |
| `has_bluetooth` | boolean | bevestigd |
| `has_usb_port` | boolean | bevestigd — alleen vermelden als hij de telefoon van het nachtkastje kan houden |
| `alarms` | single_line_text | bevestigd |
| `display_dimmable` | boolean | bevestigd |
| `power` | single_line_text | **VERIFY** |
| `battery_backup` | single_line_text | **VERIFY** |
| `dimensions_mm` | single_line_text | **VERIFY** |
| `weight_g` | integer | **VERIFY** |
| `ean` | single_line_text | **VERIFY** |
| `warranty` | single_line_text | **VERIFY** |
| `manual_pdf` | file_reference | verplicht vóór livegang |
| `guide_pdf` | file_reference | verplicht vóór livegang |
| `in_the_box` | list.single_line_text | |

### Metaobject `nawm_review`

`citaat` (verplicht) · `naam` · `bron` (verplicht) · `bron_url` (verplicht) ·
`datum` (verplicht) · `thema`.

De guard zit in `snippets/nawm-review-card.liquid`: een citaat zonder bron-url
en datum rendert niet. Citaten worden letterlijk overgenomen — niet inkorten
zonder dat zichtbaar te maken, niet herschrijven, niet vertalen.

### Metaobject `nawm_faq`

`vraag` · `antwoord` · `volgorde` · `toon_in_json_ld`.

Zolang dit metaobject leeg is, gebruikt de FAQ-sectie de acht vragen uit
`locales/nl.default.json`. De JSON-LD wordt uit dezelfde bron opgebouwd.

### Themasettings die nog ingevuld moeten worden

Onder **NAWM Sleep–Wake System** in de theme-editor: `nawm_product`,
`shipping_line`, `delivery_time`, `return_policy_line`, `warranty_line`,
`company_name`, `contact_url`, `review_score`, `review_count`,
`review_checked_on`.

Het reviewcijfer toont alleen iets wanneer score, aantal én controledatum alle
drie zijn ingevuld. Bij onderzoek stond de listing op 4,4/5 uit 41 reviews; toon
dat datumgebonden zodat de claim niet veroudert.

---

## 3 · Beeld en video — nog te produceren

Fase F4 uit de spec is **niet uitgevoerd**. De reden staat in §9.1 van de spec
zelf: het product, het productscherm en de knoppen mogen niet gegenereerd
worden, en elk beeld waar het product in staat vereist de échte productfoto,
gecomposit op een gegenereerde scène. Dat materiaal is er nog niet.

De theme is er wel volledig op voorbereid: elke sectie heeft een
`image_picker`, en `snippets/nawm-figure.liquid` regelt srcset, `width`,
`height`, `alt`, `loading` en de placeholder. Zolang een beeld ontbreekt,
rendert een zichtbare placeholder met de naam uit §9.3.

| Slug | Sectie | Ratio | Aanpak |
|---|---|---|---|
| `hero-nachtkastje` | Hero | 3:2 desktop, 4:5 mobiel | Scène genereren met een lege plek op het nachtkastje, echte productfoto erop composeren |
| `koud-scherm` | Patroon | 4:5 | Volledig te genereren, geen product in beeld |
| `product-anker` | Systeem | 1:1 | Alleen de lichtomgeving genereren, product erop composeren |
| `inhoud-knolling` | Wat je krijgt | 16:9 | Alleen het oppervlak genereren; de artikelen zijn fotografie |
| `ochtend-raam` | Social proof | 16:9 | Volledig te genereren, geen product in beeld |
| `avond-telefoon-parkeren` | Systeem / Vanavond | 4:5 | Nog geen plek in de theme — toevoegen wanneer het beeld er is |
| `routine-kaart` | Vanavond | 3:2 | Idem |
| `dawn-texture` | Sectieachtergronden | 21:9 | Optioneel, decoratief |
| `og-share` | Open Graph | 1200×630 | Nog in te stellen |
| `guide-cover-texture` | Guide, print en web | 2:3 | Buiten de theme |

### Video, ochtenddemo

Vereist een **echte opname van het verkoopmodel** — AI-video is hier niet
toegestaan, want het beeld functioneert als bewijs. Shotlist in spec §9.5.

De sectie heeft settings voor de video, een poster en een ondertitelbestand.
**Ondertiteling is verplicht** (§10.3): upload de Nederlandse `.vtt` naar
`assets/` en vul de bestandsnaam in bij de sectie. Zolang er een video is
zonder ondertiteling, rendert daar een VERIFY-token.

---

## 4 · Fonts

`snippets/nawm-fonts.liquid` verwacht drie self-hosted woff2-bestanden **direct
in `assets/`** — de assets-map van een Shopify-theme is plat, er kan geen
`assets/fonts/` submap in:

- `Fraunces-var.woff2` (variable: `opsz`, `wght`, `SOFT`, `WONK`)
- `InterTight-var.woff2`
- `IBMPlexMono-Regular.woff2`

Zet daarna de themasetting **Self-hosted fonts laden** aan. Zolang die uit
staat, gebruikt de pagina de fallback-stacks (Georgia, system-ui, ui-monospace).
De typografie klopt dan qua schaal en ritme, maar niet qua karakter — en de
`SOFT`-as die met `--dawn` meeloopt doet dan niets.

---

## 5 · Copy die nog ontbreekt

| Wat | Waar | Bron |
|---|---|---|
| De 15-minutenversie van de avondroutine | Sectie 5, uitklapblok | `NAWM_Website_Strategie_Blauwdruk.docx` — staat niet in de build-spec |
| FAQ over een partner die anders wakker wordt | Sectie 12 | Nog te schrijven, of via metaobject `nawm_faq` |
| FAQ over zware slapers | Sectie 12 | Idem |
| Onderbouwingsblok met bronnen | Onderaan de pagina | Spec §7.2: link altijd naar de originele bron, nooit naar een samenvattingssite. Nog geen sectie voor gebouwd |

---

## 6 · Techniek die in deze omgeving niet gedraaid kon worden

Op deze machine staan geen Node, Python of Shopify CLI. Het volgende is dus
**niet** uitgevoerd en moet nog:

- [ ] `shopify theme check` — moet zonder errors draaien
- [ ] `shopify theme push --unpublished` en daarna Lighthouse op de **preview-URL**, niet lokaal. Budget: LCP ≤ 2,0 s · CLS ≤ 0,05 · INP ≤ 200 ms · Lighthouse ≥ 92 performance en 100 accessibility
- [ ] Visuele controle op 390 / 414 / 768 / 1024 / 1440 / 1920px
- [ ] iOS Safari, Android Chrome, desktop Chrome, Firefox, Safari
- [ ] Toetsenbordnavigatie van hero tot checkout zonder muis
- [ ] `prefers-reduced-motion` aan: pagina blijft volledig bruikbaar
- [ ] Checkout, e-mails en bedankpagina met een echte order
- [ ] Consent en events: `view_hero`, `play_demo`, `use_sunrise_scrubber`, `open_guide`, `open_specifications`, `open_faq`, `view_offer`, `add_to_cart`, `begin_checkout`, `purchase`

`purchase` hoort op de bedankpagina en zit **niet** in de theme —
`assets/nawm-analytics.js` dekt de events die op de landingspagina ontstaan.
Regel `purchase` via een Shopify Web Pixel. Ook `begin_checkout` vuurt pas
zodra er een checkout-knop in de flow zit.

`docs/preview/` bevat een statische preview die de echte theme-CSS inleest. Die
is een hulpmiddel tijdens het bouwen, geen vervanging van een echte
theme-preview, en staat daarom in `.gitignore`.

---

## 7 · Twee dingen die bewust anders zijn dan de spec

Beide staan uitgelegd in `docs/DESIGN-NOTES.md`:

1. **De lucht hangt aan `--sky`, niet aan `--dawn`.** Met één lineaire variabele
   zou de achtergrond al halverwege de nachtsecties oplichten terwijl die lichte
   tekst dragen — dat breekt de contrasteisen uit §3.2.
2. **De claims-lint heeft een allowlist.** De verbatim FAQ-copy uit §5.12 trip
   de blocker-regex uit §7.3. De twee betreffende regels staan beoordeeld in
   `scripts/claims-allow.txt` in plaats van dat de regex is verzwakt.

En één ding om te weten: **Nederlands is nu de default locale van de theme.**
`locales/nl.json` is `nl.default.json` geworden en `en.default.json` is `en.json`
geworden, zodat alle copy in één bestand staat en de claims-lint één bestand
hoeft te scannen.

---

<!-- claims-lint:start -->
_Gegenereerd door `scripts/claims-lint.sh` op 2026-08-25 16:22.  Niet met de hand bijwerken._

### Openstaande VERIFY-tokens (36)

```
sections/nawm-faq.liquid:115:                  {% render 'nawm-verify',
sections/nawm-inbox.liquid:104:        {% render 'nawm-verify',
sections/nawm-specs.liquid:77:            {% render 'nawm-verify',
sections/nawm-sunrise-demo.liquid:133:                {% render 'nawm-verify',
sections/nawm-sunrise-demo.liquid:189:                {% render 'nawm-verify',
sections/nawm-system.liquid:80:              {% render 'nawm-verify',
sections/pdp-brand.liquid:56:          {% render 'nawm-verify',
sections/pdp-brand.liquid:67:          {% render 'nawm-verify',
sections/pdp-brand.liquid:78:          {% render 'nawm-verify',
sections/pdp-brand.liquid:92:            {% render 'nawm-verify',
sections/pdp-demo.liquid:147:                  {% render 'nawm-verify',
sections/pdp-demo.liquid:217:              {% render 'nawm-verify',
sections/pdp-evening.liquid:101:              {% render 'nawm-verify',
sections/pdp-evening.liquid:115:              {% render 'nawm-verify',
sections/pdp-faq.liquid:178:                <p>{% render 'nawm-verify', field: verify_field, note: verify_note %}</p>
sections/pdp-hero.liquid:298:                {% render 'nawm-verify',
sections/pdp-hero.liquid:316:                {% render 'nawm-verify',
sections/pdp-hero.liquid:347:                {% render 'nawm-verify', field: 'manual_pdf', note: 'Nederlandstalige handleiding als PDF' %}
sections/pdp-hero.liquid:389:              {% render 'nawm-verify', field: 'return_days', note: 'retourtermijn in dagen' %}
sections/pdp-hero.liquid:405:              {% render 'nawm-verify', field: 'warranty_years', note: 'garantietermijn — identiek aan wat er op de verpakking staat' %}
sections/pdp-offer.liquid:116:              {% render 'nawm-verify',
sections/pdp-offer.liquid:128:              {% render 'nawm-verify', field: 'return_days', note: 'retourtermijn in dagen' %}
sections/pdp-offer.liquid:138:              {% render 'nawm-verify', field: 'warranty_years', note: 'garantietermijn' %}
sections/pdp-offer.liquid:159:              {% render 'nawm-verify',
sections/pdp-offer.liquid:187:              {% render 'nawm-verify',
sections/pdp-offer.liquid:203:              {% render 'nawm-verify', field: 'return_days', note: 'retourtermijn in dagen' %}
sections/pdp-offer.liquid:210:              {% render 'nawm-verify',
sections/pdp-offer.liquid:220:              {% render 'nawm-verify',
sections/pdp-offer.liquid:241:            {% render 'nawm-verify',
sections/pdp-offer.liquid:257:            {{ ' ' }}{% render 'nawm-verify',
sections/pdp-setup.liquid:79:          {% render 'nawm-verify',
sections/pdp-specs.liquid:74:                {% render 'nawm-verify',
snippets/nawm-price.liquid:29:  {%- render 'nawm-verify',
snippets/nawm-spec-row.liquid:70:      {% render 'nawm-verify', field: field, note: note %}
snippets/pdp-microcopy.liquid:37:    {% render 'nawm-verify',
snippets/pdp-microcopy.liquid:46:    {{ ' · ' }}{% render 'nawm-verify', field: 'return_days', note: 'retourtermijn in dagen' %}
```

### Claims die eigen bewijs vereisen

```
sections/pdp-veertien-dagen.liquid:12:  gewenning aan een apparaat. Houd dat zo; een regel als "je slaapt beter" is
```
<!-- claims-lint:end -->
