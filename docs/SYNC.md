# Welke bestanden komen wél in het thema, en welke niet

Shopify's GitHub-koppeling synchroniseert deze repo niet volledig. Dat is geen
storing die overwaait — het is hoe Shopify omgaat met bestanden die de admin
zelf ook kan schrijven. Zodra een bestand ooit via de theme-editor of de
taaleditor is aangeraakt, beschouwt Shopify het als eigendom van de admin en
overschrijft de koppeling het niet meer.

Dit document staat er omdat we er nu drie keer ingelopen zijn.

## Wat wél doorkomt

| Map | |
|---|---|
| `sections/*.liquid` | ja |
| `snippets/*.liquid` | ja |
| `blocks/*.liquid` | ja |
| `templates/*.liquid` | ja |
| `layout/*.liquid` | ja |
| `assets/*` | ja |

## Wat níét doorkomt

| Bestand | Wat er misging |
|---|---|
| `templates/*.json` | `templates/product.wake-up-light.json` bleef hangen op de versie van 20 augustus, en het opvolgerbestand `product.nawm.json` kwam nooit aan — waarna Shopify terugviel op de standaard productpagina |
| `locales/*.json` | `Translation missing: nl.nawm.gids.index_eyebrow` op de gepubliceerde gids, terwijl de sleutel gewoon in de repo staat |
| `sections/*.json` (sectiegroepen) | zelfde mechanisme; `footer-group.json` en `header-group.json` zijn in de editor bewerkt |
| `config/settings_data.json` | idem, en dit bestand wordt sowieso door de editor geschreven |

### Het bewijs voor `locales`

`sections/gids-index.liquid` en de sleutels `nawm.gids.index_eyebrow` en
`nawm.gids.index_other` zijn in **dezelfde commit** toegevoegd — `8aa2c79`. Op
de gepubliceerde winkel rendert die sectie wél en ontbreken die sleutels. Eén
commit, twee bestanden, één aangekomen. Daar is geen andere verklaring voor.

## Wat dat betekent voor je werk

**Voor Liquid en assets:** niets. Push naar de branch, koppel de branch aan het
thema, klaar.

**Voor JSON:** wat je in de repo zet is de bron, maar het komt er niet vanzelf
in. Na een wijziging aan een van de bestanden hierboven moet je hem met de hand
overzetten:

- **Talenbestand** → Winkel → Talen → Standaardtaal → Vertalingen bewerken.
  Zoek de sleutel, plak de tekst. Of, sneller bij veel sleutels: exporteer,
  wijzig, importeer.
- **Sectiegroepen en templates** → de theme-editor, of het bestand rechtstreeks
  bewerken onder Thema's → Code bewerken.
- **`settings_data.json`** → de theme-editor.

**Draai `bash scripts/claims-lint.sh` vóór elke commit.** Sinds v5 controleert
die of elke letterlijke `'sleutel' | t` in de Liquid ook echt tekst heeft in
`locales/nl.default.json`. Dat vangt de fout aan de repo-kant af. Wat het niet
kan vangen, is dat het bestand daarna niet naar de winkel komt — dat blijft
handwerk, en dit document bestaat om je daaraan te herinneren.

## Waarom we het niet omzeilen

Twee ontsnappingswegen zijn overwogen en afgevallen:

- **Templates als `.liquid` schrijven.** Dat is wél gedaan, en het werkt:
  `product.nawm.liquid`, `page.contact.liquid`, `cart.liquid`,
  `article.gids.liquid`, `blog.gids.liquid`, `page.pijler.liquid` en
  `page.grens.liquid` bestaan om deze reden. Voor templates is dit de
  oplossing.
- **Teksten uit het talenbestand halen en in de Liquid zetten.** Dat lost het
  symptoom op en breekt iets belangrijkers: copy hoort op één plek te staan,
  en de claims-lint leest het talenbestand. Verspreide teksten in tientallen
  secties zijn niet te controleren en niet te vertalen. De pijlerteksten staan
  wél in snippets, maar dat is een bewuste uitzondering voor lange lopende
  tekst — zie `NAWM_SEO_CONTENTSPEC.md` §6.1.
