# Openstaand voor de productpagina

Alles wat de productpagina nog nodig heeft voordat hij live kan. Dit is de lijst
uit `NAWM_PDP_CONVERSIE_SPEC.md` §12, aangevuld met wat tijdens het bouwen
bovenkwam.

**Niets hiervan raden.** Elk onbekend getal staat in de theme als een
`VERIFY`-token: fel magenta in de theme-editor, en op de live storefront een
banner plus een console-error. Zolang er tokens open staan, is de pagina niet
klaar voor publicatie.

Draai `bash scripts/claims-lint.sh --strict` om te zien of er nog tokens open
staan. Zonder `--strict` telt hij ze en blokkeert hij niets.

---

## 1. Blokkerend voor livegang

| # | Wat | Waar het vandaan moet komen | Blokkeert |
|---|---|---|---|
| 1 | Aantal ontspanningsgeluiden | Fysieke test verkoopmodel → metafield `nawm.relax_sounds_count` | §3.8 |
| 2 | Hoeveel daarvan als wekgeluid selecteerbaar zijn | Fysieke test → `nawm.wake_sounds_count` en `nawm.wake_sounds_list` | §3.1, §3.6, §3.8, §3.10 |
| 3 | FM-radio als wekbron, functioneel getest | Fysieke test → `nawm.has_fm_radio` | §3.1, §3.8, §3.10 |
| 4 | Definitieve webshopprijs en het besluit over het bol.com-verschil | Beslissing Mohammed → productprijs of themasetting `price_manual` | §3.1, §3.9, §6.1 |
| 5 | Retourtermijn in dagen | Beslissing → themasetting `return_days` | §3.1, §3.9, §3.11, §4.3 |
| 6 | Wie de retourzending betaalt | Beslissing → `return_shipping_line` | §3.9 |
| 7 | Of de verpakking bewaard moet blijven | Beslissing → `return_packaging_line` | §3.9 |
| 8 | Termijn waarbinnen het geld terugstaat | Beslissing → `refund_term` | §3.9 |
| 9 | Garantietermijn in jaren | Verpakking + bol-listing → `warranty_years` | §3.1, §3.9, §3.10 |
| 10 | Besteldeadline en levertijd in werkdagen | Vervoerder → `order_deadline_time` en `delivery_business_days` | §3.1, §3.9, §3.10, §4.3 |
| 11 | Verzendregel — wat de klant werkelijk betaalt | Marge-berekening → `shipping_line` | §3.9 |
| 12 | Voeding en back-upgedrag bij stroomuitval | Fysieke test → `nawm.power`, `nawm.battery_backup` | §3.8, §3.10 |
| 13 | Kan het display volledig uit of alleen dimmen | Fysieke test → `nawm.display_dimmable` **plus een foto** | §3.4, §3.10 |
| 14 | Afmetingen, gewicht, materiaal, kabellengte | Meten → `nawm.dimensions_mm`, `nawm.weight_g`, `nawm.power` | §3.8 |
| 15 | Lichtkleuren bevestigen op het verkoopmodel | Fysieke test → `nawm.light_colors` | §3.4, §3.8 |
| 16 | Helderheidsstanden bevestigen | Fysieke test → `nawm.brightness_levels` | §3.1, §3.8 |
| 17 | Nederlandstalige handleiding als PDF | Upload via Content → Bestanden → `nawm.manual_pdf` | §3.1, §3.5, §3.8 |
| 18 | Reviewcitaten met bron, url en datum | Metaobject `nawm_review` | §3.7 |
| 19 | Score, aantal, bron en controledatum | Themasettings `review_score`, `review_count`, `review_source`, `review_checked_on` | §3.1, §3.7 |
| 20 | Werkelijke verdeling 5★ tot 1★ | Tellen bij de bron → `review_distribution` | §3.7 |
| 21 | KvK, btw-nummer, vestigingsplaats, e-mailadres | Inschrijving → themasettings | §3.12 |
| 22 | Reactietijd klantenservice | Alleen invullen als je hem waarmaakt → `support_response_time` | §3.12 |
| 23 | Twee zinnen over waarom dit product bestaat | Mohammed zelf → sectie-instelling bij *PDP bedrijfsinfo* | §3.12 |
| 24 | Nederlandse ondertiteling (.vtt) bij de timelapse | Bij de video → `assets/` | §3.6, §10.3 |

---

## 2. Buiten de theme — dit kan Claude Code niet doen

| # | Wat | Waar |
|---|---|---|
| 1 | **Klarna uitvinken** bij Shopify Payments | Instellingen → Betalingen |
| 2 | Een eventueel losse Klarna-app verwijderen | Apps |
| 3 | Controleren dat gastafrekenen aanstaat (klantaccounts optioneel) | Instellingen → Checkout |
| 4 | Het product koppelen aan het sjabloon **wake-up-light** | Product → Sjabloon |
| 5 | De metafielddefinities in de namespace `nawm` aanmaken | Instellingen → Aangepaste gegevens → Producten |
| 6 | De metaobjectdefinities `nawm_review` en `nawm_faq` aanmaken | Instellingen → Aangepaste gegevens |
| 7 | Beeld 1 t/m 8 uit de beeldbrief uploaden | Content → Bestanden |

De theme toont Klarna nergens: `snippets/pdp-payment-methods.liquid` filtert de
methode weg en de koopknop rendert geen `payment_button`, dus de dynamic
checkout buttons staan uit. Zonder punt 1 verschijnt Klarna alsnog in de
checkout, hoe schoon de theme ook is.

**Grep ter controle van de theme zelf:**

```bash
grep -rniE "\bklarna\b|\bafterpay\b|achteraf betalen|in 3 termijnen" sections snippets blocks templates locales/nl.default.json
```

---

## 3. Metaobjectvelden die de productpagina verwacht

### `nawm_review`

Bestaande velden uit BUILD SPEC §8.2 — `citaat`, `naam`, `bron`, `bron_url`,
`datum`, `thema` — plus één toevoeging:

| Veld | Type | Waarom |
|---|---|---|
| `bezwaar_code` | single_line_text (B1–B12) | Reviews die een bezwaar wegnemen worden eerst getoond |

`thema` voedt de filterchips. De chips worden opgebouwd uit de thema's die de
getoonde reviews werkelijk hebben, dus er verschijnt nooit een filter dat niets
oplevert.

Een review zonder `bron_url` of `datum` rendert niet. Die guard zit in Liquid en
kan niet per ongeluk worden overgeslagen.

### `nawm_faq`

| Veld | Type |
|---|---|
| `vraag` | single_line_text |
| `antwoord` | multi_line_text |
| `volgorde` | integer |
| `bezwaar_code` | single_line_text (B1–B12) |
| `in_json_ld` | boolean |

`bezwaar_code` gaat mee in het `open_faq`-event. Daarmee zie je in GA4 welk
bezwaar het vaakst een bestelling tegenhoudt — directe input voor je
advertentiecopy.

---

## 4. Beeld dat nog gemaakt moet worden

Fotografie, geen AI. Dit zijn bewijsbeelden.

| # | Beeld | Waar |
|---|---|---|
| 1 | Apparaat recht van voren, display aan | Galerij |
| 2 | Schuin van boven, knoppen zichtbaar | Galerij |
| 3 | Achterkant met aansluitingen en USB-poort | Galerij |
| 4 | **Donkere kamer, laagste stand, display gedimd** | §3.4 — het meest onderschatte beeld op de pagina |
| 5 | Naast een hand of mok voor schaalgevoel | Galerij |
| 6 | Doosinhoud plat gelegd | §3.8 |
| 7 | Video: timelapse zonsopgang, 6–10s | §3.6 |
| 8 | Video: display dimmen van vol naar bijna uit, 3s | §3.4 |

Zolang een beeld ontbreekt, rendert de galerij een zichtbare placeholder met de
bestandsnaam erin. Een lege plek schuift nooit stilletjes door.

---

## 5. Losse punten die tijdens het bouwen opvielen

### 5.1 De landingspagina noemt onderdelen die niet in de doos zitten

`locales/nl.default.json` → `nawm.inbox.item2` t/m `item5` en
`nawm.offer.included` noemen een snelstartkaart, een gedrukte Sleep–Wake Guide,
een instelkaart en een QR-kaart. Volgens `NAWM_PDP_CONVERSIE_SPEC.md` §1 zitten
die er op basis van de werkelijke doosfoto niet in.

De productpagina toont alleen wat er wél in zit. **De landingspagina is niet
aangepast** — dat valt buiten deze opdracht, maar het is een feitelijke
onjuistheid over de doosinhoud en dus een beslissing die genomen moet worden:
óf de onderdelen komen er alsnog, óf de landingspagina wordt gecorrigeerd.

### 5.2 Uitvoeringskeuze bij meerdere varianten

Het product heeft één SKU. Mocht er later een tweede variant bij komen, dan
toont de koopknop een keuzelijst in plaats van stilzwijgend altijd de eerste
variant te bestellen. In de mobiele koopbalk past die keuzelijst niet; daar
springt de knop dan naar het koopblok.

### 5.3 `shopify theme check` is niet gedraaid

De Shopify CLI staat niet op deze machine. Liquid-tagbalans en de JSON van elk
sectieschema zijn wel gecontroleerd, en de claims-lint is groen. Draai vóór het
mergen alsnog:

```bash
shopify theme check
```

### 5.4 De leverdatum kent geen feestdagen

`snippets/pdp-delivery-date.liquid` slaat weekenden over en schuift de
verzenddag door naar de eerstvolgende werkdag, maar hij weet niets van Koningsdag,
Pasen of Kerst. Rond die dagen belooft de pagina een dag te vroeg.

Twee manieren om dat op te lossen, allebei prima:

- laat `delivery_business_days` rond feestdagen tijdelijk een dag hoger staan;
- of laat `order_deadline_time` leeg, dan valt de pagina terug op de vrije tekst
  in `delivery_time`.

### 5.5 Prijsverschilblok staat uit

De themasetting `show_price_difference` staat standaard uit. Zet hem pas aan
zodra het besluit uit §6.1 gevallen is; zonder ingevulde uitleg toont het blok
een VERIFY.

### 5.6 De gegenereerde VERIFY-lijst staat in `docs/OPEN.md`

`scripts/claims-lint.sh` schrijft de actuele lijst met openstaande tokens naar
het gegenereerde blok in `docs/OPEN.md`. Dit bestand blijft handwerk: het legt
uit wát er nodig is en waar het vandaan moet komen.
