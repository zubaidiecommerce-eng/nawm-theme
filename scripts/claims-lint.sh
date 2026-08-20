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

TARGETS="locales sections snippets blocks templates config"
ALLOW="scripts/claims-allow.txt"

# De spec schrijft hier `100% ` als losse term. Die matcht elke CSS-percentage in
# de theme — zestig treffers in Horizon zelf — en een lint die wolf roept, wordt
# niet meer gedraaid. Daarom is de term gebonden aan de woorden die er in een
# marketingclaim op volgen. `calc(100% - ...)` valt er nu buiten, `100% veilig`
# niet.
BLOCK='genees|geneest|voorkomt depressie|verhelpt hoofdpijn|herstelt je bioritme|herstelt je biologische klok|wetenschappelijk bewezen|klinisch bewezen|gegarandeerd (meer energie|beter|energieker)|100% ?(garantie|gegarandeerd|effectief|natuurlijk|veilig|bewezen|zeker|succes|resultaat)|wondermiddel|wonderbaarlijk'
WARN='zorgt ervoor dat je (beter|sneller|dieper)|je slaapt (beter|dieper)|meer energie overdag|minder snoozen|sneller in slaap|verbetert je slaap'
VERIFY="\{\{VERIFY:|render 'nawm-verify'|render \"nawm-verify\""

SKIPPED="$(mktemp)"
trap 'rm -f "$SKIPPED"' EXIT

scan() {
  grep -rniE "$1" $TARGETS --include='*.json' --include='*.liquid' 2>/dev/null || true
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
