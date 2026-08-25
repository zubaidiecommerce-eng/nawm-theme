# De gids in de winkel zetten

De bron van de gids staat in deze repo, de winkel is de kopie. Dit document
beschrijft hoe je die kopie maakt en bijwerkt.

**Wijzig een artikel altijd in `content/gids/`, nooit in de admin.** Doe je het
andersom, dan lopen de twee uit elkaar en is `scripts/claims-lint.sh` een
schijnzekerheid — die leest alleen deze repo.

---

## Eenmalig: de blog en de pagina's aanmaken

### 1. De blog

**Content → Blogberichten → Blogs beheren → Blog toevoegen**

| Veld | Waarde |
|---|---|
| Titel | `Gids` |
| Handle | `gids` |
| Sjabloon | `gids` |

De handle ligt daarna vast. `/blogs/gids/<slug>` is de URL van elk artikel, en
zodra er één artikel geïndexeerd is, breekt een wijziging ze allemaal. Dat is
ook de reden dat de handle in `snippets/nawm-schema-breadcrumb.liquid` hard
staat en niet als instelling.

### 2. De drie pijlerpagina's en de grenspagina

**Content → Pagina's → Pagina toevoegen**, vier keer. De inhoud laat je leeg:
die staat in het thema.

| Titel | Handle | Sjabloon |
|---|---|---|
| Wake-up light: hoe het werkt en wanneer het iets voor je is | `wake-up-light` | `pijler` |
| Beter opstaan: waarom je ochtend zwaar voelt en wat je eraan kunt doen | `beter-opstaan` | `pijler` |
| Een avondroutine die je volhoudt | `avondroutine` | `pijler` |
| Wanneer je hier niets aan hebt | `wanneer-naar-de-huisarts` | `grens` |

De handles moeten exact kloppen. `sections/pijler-hub.liquid` kiest zijn tekst
op `page.handle`, en de artikelen linken met absolute paden naar deze vier.

### 3. De navigatie

**Content → Menu's → Hoofdmenu → Menu-item toevoegen**

Eén item `Gids`, met de drie pijlers eronder als submenu (§5.6):

```
Gids                    → /blogs/gids
  Wake-up light         → /pages/wake-up-light
  Beter opstaan         → /pages/beter-opstaan
  Avondroutine          → /pages/avondroutine
```

De grenspagina komt niet in de navigatie. Die wordt gevonden via de artikelen
en via de veiligheidsnoot op de homepage, en dat is precies genoeg.

---

## Per artikel

Voor elk van de twaalf: **Content → Blogberichten → Blogbericht toevoegen**.

| Veld in de admin | Waar het vandaan komt |
|---|---|
| Titel | `title` uit `manifest.json` |
| Inhoud | de volledige inhoud van `<handle>.html`, als HTML geplakt |
| Uittreksel | `excerpt` |
| Blog | Gids |
| Sjabloon | `gids` |
| Tags | `pijler:<pillar>` — bijvoorbeeld `pijler:avondroutine` |
| Uitgelichte afbeelding | minimaal 1200px breed, met `image_alt` als alt-tekst |
| SEO-titel | `meta_title` als die er is, anders leeg laten |
| SEO-beschrijving | `meta_description` |

**De inhoud plakken doe je in de HTML-weergave van de editor**, niet in de
rich-text-modus. De rich-text-editor herschrijft je opmaak en gooit de `id`'s
van de H2's weg — en dan is de inhoudsopgave leeg.

**De tag is niet optioneel.** Zonder `pijler:<handle>` verschijnt het artikel
niet op zijn pijler, niet in het overzicht per cluster, en mist het zijn
kruimel. Het valt dan onder "Overig" op `/blogs/gids`, en dat is precies zodat
je het ziet.

### Publicatievolgorde

De volgorde in `manifest.json` is de bouwvolgorde uit §10 van de contentspec.
De enige met een datum: **`wakker-worden-in-de-winter` uiterlijk in september**
— dat is de seizoenspiek en die haal je niet in door hem in november te
publiceren.

---

## Na afloop controleren

- [ ] `/blogs/gids` toont drie clusters en geen artikelen onder "Overig"
- [ ] Elk artikel toont een kruimelpad `Home › Gids › <pijler> › <artikel>`
- [ ] Elk artikel boven de 800 woorden toont een inhoudsopgave, en elke regel
      daarin springt naar de juiste kop
- [ ] De drie pijlers tonen hun artikellijst
- [ ] De Rich Results Test van Google keurt `Article` en `BreadcrumbList` goed
      op één artikel, en `FAQPage` alleen op de productpagina
- [ ] `/blogs/gids/tagged/…` geeft `noindex,follow` in de broncode
- [ ] De artikelen staan in `/sitemap.xml`

---

## Een artikel bijwerken

1. Wijzig `content/gids/<handle>.html` op een branch.
2. Draai `bash scripts/claims-lint.sh`. Rood is niet committen.
3. Commit en push.
4. Plak de nieuwe inhoud in het bestaande artikel in de admin — maak geen
   nieuw artikel aan, want dan verandert de URL.

---

## Via de Shopify Admin API

Kan ook, en het is sneller bij twaalf artikelen. De GraphQL-mutatie is
`articleCreate` met `blogId`, `title`, `body`, `summary`, `tags`,
`templateSuffix` en `metafields` voor de SEO-velden.

Wat je daarvoor nodig hebt is een Admin API-token met `write_content`. Dat is
een sleutel waarmee je de hele winkelinhoud kunt overschrijven, dus die hoort
niet in deze repo en niet in een script dat hier staat — zet hem als
omgevingsvariabele en verwijder hem als het klaar is.

Vraag Claude Code om het te doen als de koppeling met de winkel al actief is;
dan is er geen token nodig, en gaat het per artikel met een bevestiging vooraf.
