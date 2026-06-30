# Beschikbaarheid — opt-out (React)

Losse, zelfstandige beschikbaarheid-app volgens `SPEC_beschikbaarheid.md`.
**Opt-out:** elke dag staat standaard "Hele dag" beschikbaar; je haalt eraf wat niet kan.

## Openen
- **Live demo:** `index.html` — draait direct (React + Babel via CDN, geen build).
  - Lokaal: http://localhost:8080/beschikbaarheid/index.html
  - GitHub Pages: https://peterstuurman-hash.github.io/staffapp/beschikbaarheid/
- **Component (voor in een React-project):** [`BeschikbaarheidV2.jsx`](BeschikbaarheidV2.jsx)
  — `import Beschikbaarheid from './BeschikbaarheidV2'`.

## Drie interactielagen (naar frequentie)
1. **75% — niets doen** → 1× *Bevestig week*.
2. **~20% — één chip** → *tot 17:00* of *vanaf 17:00* (één rand verzetten).
3. **~5% — bewerken** → tijdbalk (slepen) + steppers, bewust ingeklapt.

## DB-koppeling later
`serializeWeek(week, weekNr)` geeft per dag `{ date, available, start, end }`.
"Hele dag" = `available:true` met `start/end: null` (geen schijnprecisie). Koppelen = één POST.

## Nog niet in de demo (zie spec §8)
Geen persistentie/DB-call, geen push (vereist PWA), kantelpunt 17:00 nog niet per locatie.
