#!/usr/bin/env bash
# scripts/claims-lint.sh — blokkeert verboden en onvoorzichtige claims.
# BUILD SPEC §7.3. Draaien vóór elke commit en in CI.
#
# Drie controles:
#   1. Verboden claims            → blocker, altijd
#   2. Claims die eigen bewijs vereisen → waarschuwing, bevestigen met Mohammed
#   3. Openstaande VERIFY-tokens  → blocker vóór livegang (--strict)
#
# `config` staat in TARGETS omdat kopoverrides en handelsvoorwaarden in
# config/settings_data.json terechtkomen. Zonder die map zou een claim die via
# de theme-editor is ingetypt buiten de lint vallen, en dat is precies het gat
# dat deze lint moet dichten.
#
# Regels die woordelijk in scripts/claims-allow.txt staan, zijn beoordeeld en
# goedgekeurd. Het aantal wordt altijd geprint, zodat de lijst niet ongemerkt
# groeit. Wijzigt de regel ook maar één teken, dan valt hij weer door de lint —
# dat is opzettelijk.

set -uo pipefail

cd "$(dirname "$0")/.."

FAIL=0
STRICT=0
[ "${1:-}" = "--strict" ] && STRICT=1

# `content` staat erbij sinds de gids. Daar staan de artikelbodies als HTML —
# ze worden in de Shopify-admin geïmporteerd, maar de bron blijft deze repo,
# juist zodat deze lint eroverheen kan. Een artikel dat alleen in de admin
# bestaat, valt buiten elke controle die hier staat.
TARGETS="locales sections snippets blocks templates config content"
ALLOW="scripts/claims-allow.txt"

# De grenspagina verwijst naar wie er wél over gaat en mag daarom benoemen
# waar wij niet over gaan (§9). Zonder deze uitzondering zou de derde controle
# hieronder die pagina afkeuren voor het uitvoeren van zijn eigen opdracht.
#
# Dit is een padfilter en geen tekstfilter: het dekt de sectie en het
# contentbestand van die pagina. De copy van de grenspagina staat óók in
# locales/nl.default.json, en daar werkt een padfilter niet — dat bestand
# draagt alle teksten van de site. Komt daar ooit een woord uit CONTENT_BLOCK
# in te staan omdat de grenspagina het nodig heeft, zet die ene regel dan
# woordelijk in scripts/claims-allow.txt. Dat is precies waar die lijst voor is.
CONTENT_EXCEPT='(^|/)(content/[^:]*wanneer-naar-de-huisarts|sections/gids-grens\.liquid)'

# De spec schrijft hier `100% ` als losse term. Die matcht elke CSS-percentage in
# de theme — zestig treffers in Horizon zelf — en een lint die wolf roept, wordt
# niet meer gedraaid. Daarom is de term gebonden aan de woorden die er in een
# marketingclaim op volgen. `calc(100% - ...)` valt er nu buiten, `100% veilig`
# niet.
BLOCK='genees|geneest|voorkomt depressie|verhelpt hoofdpijn|herstelt je bioritme|herstelt je biologische klok|wetenschappelijk bewezen|klinisch bewezen|gegarandeerd (meer energie|beter|energieker)|100% ?(garantie|gegarandeerd|effectief|natuurlijk|veilig|bewezen|zeker|succes|resultaat)|wondermiddel|wonderbaarlijk'
WARN='zorgt ervoor dat je (beter|sneller|dieper)|je slaapt (beter|dieper)|meer energie overdag|minder snoozen|sneller in slaap|verbetert je slaap'

# Fysiologische uitleg. NAWM_SEO_CONTENTSPEC.md §9.
#
# Deze woorden zijn niet verboden omdat ze onwaar zijn, maar omdat ze de site
# buiten haar eigen positionering trekken. De werkregel voor alle content is:
# schrijf over wat mensen dóén, niet over wat hun lichaam doet. Er zijn honderd
# sites die de fysiologie uitleggen; er zijn er weinig die concreet zijn over
# het laatste halfuur van je avond.
#
# Praktisch is het bovendien de scheidslijn tussen content die mag ranken en
# content die Google als YMYL behandelt — en waar een advertentieaccount op
# geschorst wordt.
CONTENT_BLOCK='melatonine|cortisol|circadiaan|biologische klok|slaapfase|remslaap|diepe slaap|hersengolven|blauw licht (onderdrukt|remt)|slaaphormoon'
VERIFY="\{\{VERIFY:|render 'nawm-verify'|render \"nawm-verify\""

SKIPPED="$(mktemp)"
trap 'rm -f "$SKIPPED"' EXIT

scan() {
  grep -rniE "$1" $TARGETS \
    --include='*.json' --include='*.liquid' --include='*.html' 2>/dev/null || true
}

# Filtert regels weg die woordelijk in de allowlist staan. Draait achter een
# pipe en dus in een subshell, waar een teller niet zou overleven — daarom
# worden overgeslagen regels naar een tijdelijk bestand geschreven en pas
# achteraf geteld.
filter_allowed() {
  local line text trimmed
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    text="${line#*:*:}"
    trimmed="$(printf '%s' "$text" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"
    if [ -f "$ALLOW" ] && grep -Fqx -- "$trimmed" "$ALLOW"; then
      printf '%s\n' "$line" >> "$SKIPPED"
      continue
    fi
    printf '%s\n' "$line"
  done
}

echo "→ verboden claims"
blocked="$(scan "$BLOCK" | filter_allowed)"
if [ -n "$blocked" ]; then
  printf '%s\n' "$blocked"
  echo "✖ BLOCKER: verboden claim gevonden"
  FAIL=1
else
  echo "✓ geen verboden claims"
fi

echo
echo "→ claims die eigen bewijs vereisen"
warned="$(scan "$WARN" | filter_allowed)"
if [ -n "$warned" ]; then
  printf '%s\n' "$warned"
  echo "⚠ bevestig met Mohammed dat hier eigen bewijs voor is"
else
  echo "✓ schoon"
fi

echo
echo "→ fysiologische uitleg in content"
physiology="$(scan "$CONTENT_BLOCK" | grep -vE "$CONTENT_EXCEPT" | filter_allowed)"
if [ -n "$physiology" ]; then
  printf '%s\n' "$physiology"
  echo "✖ BLOCKER: fysiologische uitleg hoort niet in NAWM-content"
  echo "  Schrijf over wat mensen dóén, niet over wat hun lichaam doet."
  FAIL=1
else
  echo "✓ schoon"
fi

echo
echo "→ openstaande VERIFY-tokens"
verifies="$(scan "$VERIFY")"
verify_count=0
if [ -n "$verifies" ]; then
  verify_count="$(printf '%s\n' "$verifies" | wc -l | tr -d ' ')"
  printf '%s\n' "$verifies"
  if [ "$STRICT" -eq 1 ]; then
    echo "✖ BLOCKER voor livegang: $verify_count onopgeloste VERIFY"
    FAIL=1
  else
    echo "· $verify_count openstaande VERIFY — blokkeert de livegang, niet de commit."
    echo "  Draai met --strict om ze als blocker te behandelen."
  fi
else
  echo "✓ geen VERIFY open"
fi

allowed_count="$(wc -l < "$SKIPPED" | tr -d ' ')"

echo
echo "· $allowed_count regel(s) uit $ALLOW overgeslagen"
if [ "$allowed_count" -gt 0 ]; then
  sed 's/^/  /' "$SKIPPED"
fi

# --- docs/OPEN.md bijwerken -------------------------------------------------
# De laatste twee greps worden samengevoegd in het gegenereerde blok, zodat
# Mohammed één lijst heeft om af te vinken.

OPEN="docs/OPEN.md"
START="<!-- claims-lint:start -->"
END="<!-- claims-lint:end -->"

if [ -f "$OPEN" ] && grep -qF "$START" "$OPEN"; then
  {
    echo "$START"
    echo "_Gegenereerd door \`scripts/claims-lint.sh\` op $(date '+%Y-%m-%d %H:%M').  Niet met de hand bijwerken._"
    echo
    echo "### Openstaande VERIFY-tokens ($verify_count)"
    echo
    if [ -n "$verifies" ]; then
      echo '```'
      printf '%s\n' "$verifies"
      echo '```'
    else
      echo "Geen."
    fi
    echo
    echo "### Claims die eigen bewijs vereisen"
    echo
    if [ -n "$warned" ]; then
      echo '```'
      printf '%s\n' "$warned"
      echo '```'
    else
      echo "Geen."
    fi
    echo "$END"
  } > /tmp/nawm-open-block.$$

  awk -v start="$START" -v end="$END" -v block="/tmp/nawm-open-block.$$" '
    $0 ~ start { system("cat " block); skip = 1; next }
    $0 ~ end   { skip = 0; next }
    !skip      { print }
  ' "$OPEN" > "$OPEN.tmp" && mv "$OPEN.tmp" "$OPEN"

  rm -f /tmp/nawm-open-block.$$
  echo "· $OPEN bijgewerkt"
fi

exit $FAIL
