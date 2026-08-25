# SEO-status

Bijgewerkt op 25 augustus 2026, branch `feature/seo-content`.

Per punt: gedaan of niet, en waar van toepassing de meetwaarde. Punten die
alleen in de Shopify-admin of op een gepubliceerde URL af te handelen zijn,
staan als **admin** of **meten** — die kan een thema niet voor je doen.

---

## NAWM_RANDZAKEN_ADS_SEO.md deel 4

### S1 · Homepage/PDP-scheiding — **gedaan**

De twee pagina's droegen dezelfde specificatietabel, dezelfde acht
beoordelingen, dezelfde elf FAQ-vragen en dezelfde geluidenlijst, en de
homepage-title was letterlijk de H1 van de productpagina.

| Wat | Was | Is |
|---|---|---|
| `nawm-specs` | 7 groepen, 20 rijen, incl. wekgeluidenlijst | 4 kernwaarden + link naar de PDP |
| `nawm-proof` | alle beoordelingen | 3, instelbaar, + link naar alle |
| `nawm-faq` | 8 vragen + 3 praktische | 4 vragen + link naar de rest |
| `FAQPage` JSON-LD | homepage én PDP | alleen PDP |
| Homepage-title | `NAWM Wake-Up Light — word wakker met licht, niet met schrikken` | `NAWM — rustiger avond, zachtere ochtend` |
| Homepage-description | zonsopgangduur, standen, wekgeluiden | merk en probleem |

**Niet gedaan, met reden:** de PDP-kolom van de tabel noemt "uitgebreide
routine-uitleg" en "merkverhaal" als wat eraf moet. Op de productpagina staat
geen van beide als duplicaat. `pdp-brand` is het KvK/btw/adres-blok dat deel 3
juist eist voor Google Ads, `pdp-evening` beantwoordt bezwaar B10 en
`pdp-setup` B6. De routinesecties `nawm-tonight` en `nawm-system` staan alleen
op de homepage. Er viel dus niets weg te halen dat niet conversiedragend is.

### S2 · Eén H1 per pagina — **deels, rest is admin**

De nieuwe sjablonen hebben er elk precies één: `gids-article` uit
`article.title`, `pijler-hub` en `gids-grens` uit `page.title`, `gids-index`
uit het talenbestand. De koppen daaronder zijn H2 en H3, zonder niveaus over te
slaan.

**Nog te doen (admin):** controleren of het logo in de header op de homepage
een `<h1>` is. Dat is een instelling van het thema Horizon en geen NAWM-sectie.

### S3 · Structured data — **deels**

| Schema | Waar | Status |
|---|---|---|
| `Article` | elk gidsartikel | gedaan — `snippets/nawm-schema-article.liquid` |
| `BreadcrumbList` | artikelen, pijlers, grenspagina | gedaan — `snippets/nawm-schema-breadcrumb.liquid`, uit dezelfde bron als het zichtbare pad |
| `FAQPage` | uitsluitend de PDP | gedaan — van de homepage verwijderd |
| `Product` met `offers` | PDP | **niet gedaan** — valt buiten deze spec, staat in §S3 van het randzakendocument |
| `Organization` | `theme.liquid` | **niet gedaan** — idem |
| `HowTo` | nergens | bewust niet (§6.4) |
| `MedicalWebPage` | nergens | bewust nooit (§6.4) |

**Meten:** valideer één artikel met de Rich Results Test zodra het gepubliceerd
is. `AggregateRating` zonder zichtbare beoordelingen op dezelfde pagina is een
overtreding — de homepage houdt daarom drie beoordelingen.

### S4 · Zoekwoorden en waar ze landen — **gedaan voor de gids**

| Term | Pagina |
|---|---|
| `wake up light`, `lichtwekker`, `daglichtwekker`, `wekker met licht` | PDP |
| `hoe werkt een wake up light` | `/pages/wake-up-light` en `/blogs/gids/hoe-werkt-een-wake-up-light` |
| `beter opstaan`, `makkelijker wakker worden` | `/pages/beter-opstaan` |
| `avondroutine`, `avondroutine maken` | `/pages/avondroutine` |
| `moe wakker worden ondanks genoeg slaap` | artikel |
| `telefoon voor het slapen gaan`, `bedtijd uitstellen` | artikelen |

**Nog te doen:** `lichtwekker` en `daglichtwekker` in de PDP-copy verwerken —
één keer in de H1 of de eerste alinea, één keer in de specificatiesectie. Dat
is copy op de productpagina en valt buiten deze contentspec.

### S5 · Artikelen — **ruim gedaan**

Het randzakendocument vroeg om vier artikelen. De contentspec maakte er twaalf
van, plus drie pijlers en een grenspagina. Alle vier de titels uit S5 zitten
erin.

### S6 · Technische basis — zie de checklist hieronder

### S7 · Core Web Vitals — **meten**

Het uitgelichte beeld van een artikel is het LCP-element en krijgt `eager`,
`fetchpriority="high"` en expliciete `width`/`height`. Beelden in een
artikelbody krijgen `loading="lazy" decoding="async"` — dat is een regel in
`content/gids/README.md`, want Liquid komt niet in `article.content`.

De rest is niet vanuit een thema te meten. Draai PageSpeed Insights op de
gepubliceerde URL van één artikel en één pijler.

---

## NAWM_SEO_CONTENTSPEC.md §8 · Technische checklist

| Punt | Status |
|---|---|
| Blog handle is `gids`, definitief | **admin** — staat in `scripts/gids-import.md`; de handle staat hard in het breadcrumb-snippet zodat hij niet per ongeluk instelbaar wordt |
| `noindex` op `/blogs/gids/tagged/…` | **gedaan** — `meta-tags.liquid`, `noindex,follow` zodra `current_tags` gevuld is |
| `noindex` op `/collections/all` en interne zoekresultaten | **gedaan** — idem |
| Zelfverwijzende canonical op elk artikel en elke pijler | **gedaan** — Shopify's `canonical_url`, met een notitie over de collectie-variant van de PDP |
| Paginering op het blogoverzicht | **gedaan** — geen paginering, alle twaalf op één pagina, geordend per pijler |
| Artikelen in `/sitemap.xml` | **meten** — Shopify doet dit automatisch; controleren na publicatie |
| Uitgelicht beeld ≥1200px met beschrijvende alt-tekst | **admin** — alt-teksten staan klaar in `manifest.json`, de beelden nog niet |
| `lang="nl"` op `<html>` | **gedaan** — stond er al, via `request.locale.iso_code` |
| Artikelbeelden `lazy`/`async`, behalve het uitgelichte | **gedaan** — sectie voor het uitgelichte beeld, regel in de README voor de body |
| Regellengte ≤68 tekens | **gedaan** — gemeten 600px bij 17,7px tekst |
| `--fs-body` ≥17px op mobiel | **gedaan** — gemeten 17,66px; `max()` houdt de ondergrens vast als het token ooit wijzigt |
| Geen popup binnen 30 seconden op artikelpagina's | **gedaan** — `nawm-popup.js`, ondergrens in code zodat een lagere instelling hem niet omzeilt |

---

## NAWM_SEO_CONTENTSPEC.md §9 · Claims-guardrails

**Gedaan.** `scripts/claims-lint.sh` heeft een derde controle op fysiologische
uitleg, en leest sinds deze branch ook `content/` en `*.html`.

Geverifieerd: een testbestand met `melatonine` in `content/gids` geeft exit 1;
zonder dat bestand exit 0. De grenspagina staat op de uitzonderingslijst.

Drie commentaarregels uit `nawm-sunrise-demo` en `pdp-mechanism` staan in
`claims-allow.txt` — die leggen de regel juist vást ("Wat hier bewust NIET
staat: geen melatoninegrafiek"), maar de lint leest commentaar niet als
commentaar.

---

## Wat er nog moet gebeuren, in volgorde

1. **Admin:** blog `gids`, vier pagina's, menu-item — zie `scripts/gids-import.md`.
2. **Admin:** de twaalf artikelen importeren, met tag en SEO-velden.
3. **Fotografie:** twaalf uitgelichte beelden, ≥1200px. De alt-teksten staan klaar.
4. **Meten:** Rich Results Test, PageSpeed Insights, `/sitemap.xml`.
5. **Search Console** koppelen zodra het domein staat, en na acht weken kijken
   naar vertoningen per cluster in plaats van per artikel.

Reken op zes tot acht weken voor de eerste beweging en drie tot zes maanden
voor posities. Voor `telefoon voor het slapen gaan` en `bedtijd uitstellen`
concurreer je met gevestigde sites; de longtail eromheen komt eerder.
