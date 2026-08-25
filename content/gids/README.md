# content/gids

De bodies van de gidsartikelen, plus hun metadata.

Waarom ze hier staan en niet in de Shopify-admin: `/blogs/gids/<slug>` vraagt
om echte Shopify-artikelen, en die kunnen niet in het thema wonen. Maar
`NAWM_SEO_CONTENTSPEC.md` §0 zegt ook dat `scripts/claims-lint.sh` over elk
artikel draait, en rich text in de admin valt buiten elke controle in deze
repo. Dus: de bron staat hier, de admin is de kopie.

Wijzig een artikel dus **hier**, en importeer daarna opnieuw. Wijzig je het in
de admin, dan lopen de twee uit elkaar en is de lint een schijnzekerheid.

## Wat er in een bestand staat

`<handle>.html` bevat alleen de body — wat in Shopify het veld *Inhoud* van het
artikel is. Geen `<h1>`: die rendert `sections/gids-article.liquid` uit
`article.title`, zodat er nooit twee koppen op de pagina staan.

De rest — titel, samenvatting, meta-description, tags — staat in
`manifest.json`.

## Regels waar de bestanden aan moeten voldoen

- **Elke `<h2>` heeft een `id`.** De inhoudsopgave leest die ids
  (`snippets/nawm-toc.liquid`). Een kop zonder id valt eruit; dat is bewust
  geen dode link, maar het is wel een gemiste kop.
- **Geen Liquid.** De body wordt door Shopify als HTML uitgeserveerd, niet als
  template. `{{ }}` en `{% %}` komen letterlijk op de pagina te staan.
- **Interne links zijn absolute paden**, zonder domein: `/pages/avondroutine`,
  `/blogs/gids/is-snoozen-slecht`, `/products/nawm-wake-up-light`.
- **Eén link naar de productpagina per artikel**, contextueel, aan het eind.
  Geen banner, geen popup, geen koopblok (§4).
- **Maximaal drie links naar andere artikelen** (§5.4).
- **Elk artikel linkt in de eerste of tweede alinea omhoog naar zijn pijler**,
  met beschrijvende ankertekst (§5.1).
- **Elk artikel uit cluster B linkt naar `/pages/wanneer-naar-de-huisarts`**
  (§4.13).
- **Geen fysiologie.** `scripts/claims-lint.sh` leest deze map mee en
  blokkeert erop. Schrijf over wat mensen dóén.
- **Beelden in de body krijgen `loading="lazy" decoding="async"`** (§8). Het
  uitgelichte beeld staat niet in de body maar op het artikel zelf, en dat
  krijgt in de sectie juist `eager`.

## Importeren

Zie `scripts/gids-import.md`.
