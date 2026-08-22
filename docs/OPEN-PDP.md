# Openstaand voor de productpagina

Bijgewerkt op 22 augustus 2026, nadat de handleiding, de bol-listing en de
handelsvoorwaarden zijn verwerkt.

**Bron van waarheid, in deze volgorde:** de handleiding
(`Final_WUP_handleiding.pdf`) → de bol-listing → alles daarbuiten. Waar de
handleiding en de listing elkaar tegenspreken, wint de handleiding.

Draai `bash scripts/claims-lint.sh --strict` om te zien of er nog
`VERIFY`-tokens open staan.

---

## 1. Wat er sinds de vorige ronde is ingevuld

Alles hieronder staat nu in de winkel of in de theme en heeft geen VERIFY meer.

| Wat | Waarde | Bron |
|---|---|---|
| Prijs | € 59,95 | product |
| Helderheidsstanden | 20 | handleiding |
| Zonsopgangduur | 10–60 minuten | listing + beoordeling |
| Natuurgeluiden | 22, met de volledige tracklijst op naam | handleiding, hoofdstuk 7 |
| Lichtkleuren | 8 — amber, blauw, roze, groen, oranje, wit, rood, geel | listing |
| Alarmen | twee · per alarm elke dag, weekdag of weekend · snooze · sleeptimer | handleiding |
| Display dimbaar | ja, tot volledig uit | jouw test + beoordeling |
| FM-radio | ja | handleiding |
| Bluetooth | ja | handleiding |
| Voeding | netstroom via adapter · 6 V DC, 1000 mA · standby < 0,5 W | handleiding |
| Aansluitingen | USB-ingang · USB-C-ingang · Bluetooth · FM-radio | handleiding |
| Afmetingen | 16 × 18 cm (b × h) | listing |
| Gewicht | 450 g | listing |
| EAN | 8721161165378 | listing |
| Garantie | 1 jaar | jij + listing |
| In de doos | wake-up light · USB-voedingskabel · voedingsadapter met EU-stekker · handleiding | handleiding, Verpakkingsinhoud |
| Retourtermijn | 30 dagen | jij |
| Retourzending | wij betalen | jij |
| Verpakking | moet bewaard blijven | jij |
| Terugbetaling | binnen 14 dagen | jij |
| Besteldeadline | 23:59, levertijd 2 werkdagen | jij |
| Verzending | € 4,95 · gratis vanaf twee exemplaren | jij |
| KvK · btw · adres · e-mail · reactietijd | ingevuld | jij |
| Handleiding als PDF | geüpload en gekoppeld aan `nawm.manual_pdf` | jij |

---

## 2. Nog blokkerend

### 2.1 Hoeveel geluiden kun je écht als wekgeluid kiezen? — de belangrijkste

Drie bronnen, drie verhalen:

| Bron | Zegt |
|---|---|
| Handleiding, kenmerkenblok p. 3 | "22 Wekker geluiden" |
| Handleiding, hoofdstuk 7 | een tracklijst van 22 natuurgeluiden |
| bol-specificaties | 25 geluiden totaal, **7** selecteerbaar als alarm |
| Beoordeling van een koper, 13 dec 2025 | "voor het instellen van het alarm maar uit **7 geluiden + radio** kan kiezen en niet uit alle 22" |

De handleiding is leidend, maar hij zégt nergens dat alle 22 als wekgeluid te
kiezen zijn — dat kenmerkenblok is marketing, geen instelmenu. Twee
onafhankelijke bronnen zeggen 7.

**Daarom staat er nu geen getal.** Dit is precies de fout waar §3.8 van de spec
voor waarschuwt: wie 22 verwacht en er 7 vindt, stuurt hem terug én schrijft een
slechte beoordeling. Andersom verkoop je jezelf tekort, maar dat kost geen
retour.

> **Wat jij moet doen:** zet het apparaat aan, houd `AL1 SET` ingedrukt, draai
> door het wekgeluidmenu en tel hoeveel opties er langskomen. Noteer ook of de
> radio ertussen staat. Vul dat in bij `nawm.wake_sounds_count` en
> `nawm.wake_sounds_list`. Twee minuten werk, en het is de rij waar de meeste
> retouren op hangen.

Zolang het leeg is, tonen de demo-chips de 22 natuurgeluiden onder het kopje
"Natuurgeluiden" met een link naar de specificaties — niet als wekgeluiden.

### 2.2 Blijft het alarm bewaard bij stroomuitval?

De handleiding zegt hier niets over; er staat alleen netstroomvoeding in.
Trek de stekker er een minuut uit en kijk of tijd en alarm blijven staan.
→ `nawm.battery_backup`. Dit is FAQ-vraag 3.

### 2.3 De USB-poort: ingang of oplaadpunt?

De handleiding tekent op de achterkant een "USB input" en een "Type-C input".
De bol-listing zegt "USB-oplaadpoort: ja, voor het opladen van je telefoon".
Dat is niet hetzelfde, en de handleiding wint.

**Er wordt daarom nergens beweerd dat je je telefoon eraan kunt opladen.** Klopt
dat wel, dan is het een goed verkoopargument — check het met een kabel en zet
`nawm.has_usb_port` aan.

### 2.4 De doosinhoud — hier moet je kiezen

De handleiding noemt onder *Verpakkingsinhoud* vier dingen: het apparaat, een
USB-voedingskabel, een voedingsadapter en de gebruikershandleiding. Geen
slaapgids, geen snelstartkaart, geen instelkaart, geen QR-kaart.

De bol-titel noemt wél een slaapgids, en de landingspagina noemt vijf gedrukte
onderdelen (`nawm.inbox.item2` t/m `item5`, `nawm.offer.included`).

Je zei dat die items er zijn. De productpagina volgt nu de handleiding, omdat
jouw eigen regel zegt dat die leidend is — en omdat een klant die vier dingen
uitpakt terwijl de site er zes belooft, direct mailt.

**Kies één van tweeën:**

- de gids en de kaarten zitten er echt bij → ik zet ze op de productpagina en
  we laten de handleiding aanpassen, want die klopt dan niet;
- of ze zijn digitaal → dan noemen we ze apart, niet onder "In de doos", en
  moet de landingspagina dat ook zo zeggen.

Tot die keuze is de landingspagina onaangeroerd gelaten, op één punt na: daar
stond "verzending inbegrepen" en dat is met € 4,95 verzendkosten niet meer waar.
Die regel is aangepast.

### 2.5 De voorraad staat op nul

Het product heeft voorraadregistratie aan, staat op 0 en weigert bestellingen
bij nul voorraad. **De pagina toont daardoor nu "Tijdelijk uitverkocht" in plaats
van een koopknop.** Ik heb hier geen aantal ingevuld — dat is een echt getal, geen
instelling.

Boek de voorraad in bij Winkellocatie, of zet de variant op "doorverkopen bij
uitverkocht" als je op bestelling levert.

### 2.6 Het reviewcijfer klopt niet met wat je doorgaf

Je zei 4,8 gemiddeld, geen 1-sterbeoordelingen en een paar van 3 sterren.
Op de listing staat vandaag:

| | |
|---|---|
| Gemiddelde | **4,4** |
| Aantal | **41** |
| Verdeling | 20 × 5★ · 18 × 4★ · 1 × 3★ · 2 × 2★ · 0 × 1★ |

Ik heb de cijfers van de listing ingevuld, niet 4,8. De cijferregel op de pagina
zegt letterlijk "op bol.com, gecontroleerd op 22 augustus 2026" en een bezoeker
is één klik van die pagina verwijderd. Klopt 4,8 wel — bijvoorbeeld over een
andere periode of een ander kanaal — pas het dan aan in de themasettings en zet
erbij waar het cijfer vandaan komt.

Er staat nu **één** echte beoordeling op de pagina, met bron, link en datum: een
5-sterbeoordeling van 13 december 2025 die zowel het dimbare display als de
zonsopgangduur bevestigt, en eerlijk het geluidenpunt uit §2.1 noemt. Voeg er
drie tot vijf toe via *Inhoud → Metaobjecten → nawm_review*; kies met voorrang
beoordelingen die een bezwaar wegnemen.

### 2.7 Bedrijfsnaam ontbreekt

KvK, btw-nummer, adres en e-mailadres staan erin. De **naam zoals ingeschreven**
bij de KvK niet — vul `company_name` in bij de themasettings.

Let ook op: in de handleiding staat `management@mangohub.nl` als contactadres,
op de site komt `zubaidiecommerce@gmail.com` te staan. Twee adressen voor
dezelfde klant is verwarrend; kies er één.

### 2.8 Beeld en video

Onveranderd — jij maakt de foto's. Zolang een beeld ontbreekt, toont de galerij
een zichtbare placeholder met de bestandsnaam erin.

| # | Beeld | Waar |
|---|---|---|
| 1 | Recht van voren, display aan | Galerij |
| 2 | Schuin van boven, knoppen zichtbaar | Galerij |
| 3 | Achterkant met de aansluitingen | Galerij |
| 4 | **Donkere kamer, laagste stand, display gedimd** | §3.4 |
| 5 | Naast een hand of mok voor schaalgevoel | Galerij |
| 6 | Doosinhoud plat gelegd | §3.8 |
| 7 | Video: timelapse zonsopgang, 6–10s | §3.6 |
| 8 | Video: display dimmen, 3s | §3.4 |

Bij video 7 hoort een Nederlands ondertitelbestand (`.vtt`) in `assets/`.

---

## 3. Buiten de theme

| # | Wat | Status |
|---|---|---|
| 1 | Klarna uitvinken bij Betalingen | door jou opgepakt |
| 2 | Losse Klarna-app verwijderen | door jou opgepakt |
| 3 | Gastafrekenen aan | door jou opgepakt |
| 4 | Product op sjabloon `wake-up-light` | ✅ staat goed |
| 5 | Metafielddefinities `nawm` | ✅ compleet, waarden ingevuld |
| 6 | Metaobjecten `nawm_review` / `nawm_faq` | ✅ aangemaakt |
| 7 | Beelden uploaden | jij |
| 8 | Voorraad inboeken | jij — zie §2.5 |

De theme noemt Klarna nergens; `pdp-payment-methods.liquid` filtert de methode
weg en de koopknop rendert geen `payment_button`. Ter controle:

```bash
grep -rniE "\bklarna\b|\bafterpay\b|achteraf betalen|in 3 termijnen" sections snippets blocks templates locales/nl.default.json
```

---

## 4. Wat ik in de winkel heb gewijzigd

Zodat je het kunt terugvinden:

- **Metafielddefinities** `light_colors`, `in_the_box` en `wake_sounds_list`
  waren losse tekstvelden; de build spec schrijft lijsten voor. Ze waren nog
  leeg, dus ze zijn verwijderd en opnieuw aangemaakt als lijst.
- **Nieuwe definities**: `relax_sounds_list`, `dimensions_mm`, `connections`.
- **`nawm_review`** heeft er een veld `bezwaar_code` bij, en `bron` accepteert nu
  ook `bol.com` naast `e-mail` en `Trustpilot`.
- **Eén beoordeling** aangemaakt en op actief gezet.
- **De handleiding** geüpload naar Bestanden en gekoppeld aan `nawm.manual_pdf`.

Let op: in de definitie van `nawm_faq` heet het veld `in_json_id` terwijl het
label `in_json_ld` is. De sectie leest allebei, dus er gaat niets mis — maar als
je de definitie ooit opnieuw aanmaakt, gebruik dan `in_json_ld`.

---

## 5. Techniek

`shopify theme check` draait nu schoon op de PDP. Twee bugs die eruit kwamen zijn
opgelost, en de tweede zat ook al in de landingspagina:

1. **Filters in `render`-argumenten.** Shopify past ze niet toe, dus
   `label: 'sleutel' | t` zette de ruwe sleutel in de specificatietabel in plaats
   van het label. Dat gold voor 40 aanroepen, waarvan 24 op de landingspagina.
   `nawm-spec-row`, `nawm-cta` en `nawm-figure` nemen de sleutel nu zelf aan.
2. **Een `{% liquid %}`-regel die over twee regels liep** in de
   leverdatumberekening — dat is een syntaxfout, geen stijlkwestie.

Wat blijft staan: drie ontbrekende fontbestanden (die staan achter de setting
`nawm_self_hosted_fonts`, die uit staat) en veertien waarschuwingen over
CSS-klassen die gedeeld worden tussen secties. Dat laatste is opzet.

Feestdagen zitten niet in de leverdatumberekening. Zoals afgesproken: rond een
feestdag zet je `delivery_business_days` tijdelijk een dag hoger.
