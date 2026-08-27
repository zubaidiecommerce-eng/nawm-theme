# scripts/locale-flatten.awk — een talenbestand platslaan naar gepunte sleutels.
#
# Leest locales/*.json en schrijft één regel per bladsleutel:
#
#   nawm.cart.progress
#   nawm.gids.pijler.wake-up-light.short
#
# Waarom regelgebaseerd en geen echte JSON-parser: er is in deze omgeving geen
# jq, geen node en geen python, en `scripts/claims-lint.sh` moet overal draaien
# waar bash draait. Shopify schrijft dit bestand zelf, met twee spaties
# inspringing en één sleutel per regel, en die vorm is stabiel genoeg om op te
# rekenen.
#
# Wat er gebeurt als die aanname ooit niet meer klopt: er vallen sleutels uit
# de lijst, en dan meldt de lint ze als ontbrekend. Dat is de veilige kant —
# een vals alarm valt op, een gemiste controle niet.

BEGIN { depth = 0 }

{
  line = $0
  sub(/\r$/, "", line)

  # De commentaarkop die Shopify boven het bestand zet.
  if (line ~ /^[[:space:]]*[\/*]/) next

  # Sluitende haak: één niveau omhoog.
  if (line ~ /^[[:space:]]*[}\]],?[[:space:]]*$/) {
    if (depth > 0) depth--
    next
  }

  if (match(line, /^[[:space:]]*"([^"]+)"[[:space:]]*:/, m)) {
    stack[depth] = m[1]

    rest = substr(line, RSTART + RLENGTH)
    gsub(/^[[:space:]]+/, "", rest)

    path = ""
    for (i = 0; i <= depth; i++) path = (i == 0 ? stack[i] : path "." stack[i])

    # Opent deze sleutel een object of een array, dan is hij geen blad.
    if (rest ~ /^[{[]/) depth++
    else print path

    next
  }
}
