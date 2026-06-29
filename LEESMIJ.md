# staffapp — prototype (vernieuwde staff-app)

Klikbaar **voorbeeld** van een vernieuwde versie van staff.brandingbeach.nl.
Meer app-gevoel (Uber-stijl), met een **persistente statusbalk** bovenin en
gamificatie-haakjes. Alleen mock-data — geen backend, niets wordt opgeslagen.

**Nieuw:**
- ⏳ **Live aftelklok** bij "bijna blauw": *"over X dagen, Y uur, Z min word jij blauw"* (telt echt af).
- 🏆 **Familie & Toppers**-scherm (via Overig): leaderboard + de drie gradaties
  (Toppers / Newbees / groene namen) — het familiegevoel.
- 🔎 **Echte flag-berekening**: de status komt uit ruwe cijfers (`computeStatus` in
  `app.js`), met "Waarom deze status?" in het detail-paneel.

## Openen
Dubbelklik **`index.html`** (werkt direct in de browser, geen server nodig).
Tip: open de devtools en zet 'm in mobiele weergave voor het echte gevoel.

## Wat zit erin

**Persistente statusbalk** (blijft staan op elk scherm), verandert mee met de
"flag" van de medewerker:

| Flag | Balk | Boodschap |
|---|---|---|
| Groen + 💪🕺 | groen | Jij werkt écht top — óók op zaterdagavond |
| Groen + 💪 | groen | Jij bent echt een topper |
| Groen | groen | Bedankt voor je beschikbaarheid |
| Groen + ❗ | groen + pulserende waarschuwing | Mayday — geef z.s.m. op, je wordt bijna blauw |
| Blauw | blauw | Te weinig beschikbaarheid — geef meer op |
| Newbee | warm/oranje | Welkom in de familie · week X van 13 |
| Paars | paars | Bijna op vakantie |
| RPP | goud | Branding team member |
| DND | grijs | Branding team member on a sabbatical |

**Onderbalk (5 hoofdkeuzes, in de gevraagde volgorde):**
1. Beschikbaarheid opgeven
2. Rode plekken pakken (open diensten + bonuspunten)
3. Wanneer ingeroosterd
4. Rooster (team)
5. Overig (alle oude submenu-items + prestaties/badges)

**Gamificatie (voor de toekomst):** XP-/level-balk, weekstreak 🔥, weekdoel met
voortgang, bonuspunten op rode plekken, badges, en een newbee-voortgang
"week X van 13" om nieuwe mensen in het familiegevoel te trekken.

## Demo: wissel van medewerker
Knop **rechtsonder (👤)** → kies een medewerker om elke status/flag te zien.
Er staat één persona per flag klaar (topper, newbee, groen, bijna-blauw, blauw,
vakantie, RPP, DND).

## Bestanden
- `index.html` — opzet (statusbalk + scherm + onderbalk)
- `styles.css` — alle styling + statusthema's
- `app.js` — mock-data, statusdefinities, schermen en interactie (Nederlands becommentarieerd)
