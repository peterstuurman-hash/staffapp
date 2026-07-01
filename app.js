/* =======================================================================
   Branding Staff — prototype (alleen mock-data, geen backend)
   -----------------------------------------------------------------------
   Doel: laten zien hoe een vernieuwde staff-app kan voelen —
   modern, app-gevoel (Uber-stijl), met een PERSISTENTE statusbalk die
   meebeweegt met de "flag" van de medewerker, en gamificatie-haakjes.

   Alles draait in de browser. Wissel rechtsonder van demo-medewerker
   om elke status te zien.
   ======================================================================= */

/* ---------------------------------------------------------------------
   1. STATUS-DEFINITIES  (gebaseerd op de flag-legenda van de business)
   --------------------------------------------------------------------- */
const STATUS = {
  topper_zat: {
    theme: 't-green', icons: '💪🕺', badge: 'Topper +',
    title: 'Jij werkt écht top — óók op zaterdagavond!',
    sub: 'Je bent goud waard voor het team 🙌', level: 5,
  },
  topper: {
    theme: 't-green', icons: '💪', badge: 'Topper',
    title: 'Jij bent echt een topper',
    sub: 'Bedankt voor je topbeschikbaarheid', level: 4,
  },
  groen: {
    theme: 't-green', icons: '✅', badge: 'Op koers',
    title: 'Bedankt voor je beschikbaarheid',
    sub: 'Lekker bezig — zo blijf je groen', level: 3,
  },
  bijna_blauw: {
    theme: 't-alert', icons: '🟢❗', badge: 'Mayday',
    title: 'Geef je beschikbaarheid z.s.m. op',
    sub: 'Anders word je binnenkort blauw', level: 2,
    alert: 'Mayday! Je staat op het punt blauw te worden',
  },
  blauw: {
    theme: 't-blue', icons: '💧', badge: 'Te weinig',
    title: 'Je hebt te weinig beschikbaarheid',
    sub: 'Geef meer dagen op om weer groen te worden', level: 1,
  },
  newbee: {
    theme: 't-sunrise', icons: '🌱', badge: 'Newbee',
    title: 'Welkom in de familie!',
    sub: 'Samen bouwen we je eerste 13 weken op', level: 0, newbee: true,
  },
  vakantie: {
    theme: 't-purple', icons: '🏖️', badge: 'Bijna vrij',
    title: 'Bijna op vakantie',
    sub: 'Geniet straks — je hebt het verdiend', level: null,
  },
  rpp: {
    theme: 't-gold', icons: '⭐', badge: 'Team',
    title: 'Branding team member',
    sub: 'Fijn dat je af en toe bijspringt', level: null,
  },
  dnd: {
    theme: 't-slate', icons: '🌙', badge: 'Sabbatical',
    title: 'Branding team member on a sabbatical',
    sub: 'Tot snel weer! 👋', level: null,
  },
};

/* ---------------------------------------------------------------------
   2a. FLAG-BEREKENING  (de "echte" regels uit jullie rapporten)
   -----------------------------------------------------------------------
   Bepaalt de status uit ruwe cijfers, i.p.v. een hardgecodeerd label.
   Gebaseerd op de status-legenda:
   - groen  = goede beschikbaarheid (≥12 dagen & ≥4 lastige diensten, komende 4 wkn)
   - blauw  = te weinig beschikbaarheid
   - 💪 topper = >8 lastige diensten in 4 wkn  · 🕺 = ook op za-avond gewerkt
   - ❗ bijna-blauw = wél groen, maar géén beschikbaarheid voor het komende rooster
   - newbee = eerste 13 weken in dienst · DND/RPP = occasioneel (geen alert)
   --------------------------------------------------------------------- */
const REGELS = { groenDagen: 12, groenDiensten: 4, topperDiensten: 8 };

function computeStatus(p) {
  if (p.dnd)            return { key: 'dnd',      reason: 'Handmatig op sabbatical gezet (DND).' };
  if (p.occasional)     return { key: 'rpp',      reason: 'Occasionele medewerker (RPP) — geen beschikbaarheids-alert.' };
  if (p.vakantieOver != null)
                        return { key: 'vakantie', reason: `Geaccordeerde vakantie over ${p.vakantieOver} dagen.` };
  if (p.tenureWeken != null && p.tenureWeken <= 13)
                        return { key: 'newbee',   reason: `In dienst sinds ${p.tenureWeken} wkn — binnen de eerste 13 weken.` };

  const groen = p.dagen >= REGELS.groenDagen && p.diensten >= REGELS.groenDiensten;
  if (!groen) return { key: 'blauw',
    reason: `Te weinig: ${p.dagen} dagen / ${p.diensten} lastige diensten (groen vanaf ${REGELS.groenDagen} dagen & ${REGELS.groenDiensten} diensten).` };

  if (p.diensten > REGELS.topperDiensten) {
    return p.zaterdagGewerkt
      ? { key: 'topper_zat', reason: `${p.diensten} lastige diensten (>${REGELS.topperDiensten}) én op zaterdagavond gewerkt.` }
      : { key: 'topper',     reason: `${p.diensten} lastige diensten in 4 wkn (>${REGELS.topperDiensten}).` };
  }
  if (!p.roosterBeschikbaar)
    return { key: 'bijna_blauw', reason: 'Groen, maar nog géén beschikbaarheid voor het nog te maken rooster.' };
  return { key: 'groen', reason: `Goede beschikbaarheid: ${p.dagen} dagen, ${p.diensten} lastige diensten.` };
}

/* ---------------------------------------------------------------------
   2b. DEMO-MEDEWERKERS  (ruwe cijfers; de status wordt berekend)
   --------------------------------------------------------------------- */
const PERSONAS = [
  { id: 'sophie', naam: 'Sophie de Wit', rol: 'Kelner · Branding', avatar: '😎',
    punten: 1840, xp: 0.78, streak: 11, dagen: 18, diensten: 9, zaterdagen: 6,
    zaterdagGewerkt: true, roosterBeschikbaar: true, tenureWeken: 64 },
  { id: 'daan', naam: 'Daan Hulhoven', rol: 'Leidinggevende · Branding', avatar: '🧑‍🍳',
    punten: 1520, xp: 0.62, streak: 7, dagen: 15, diensten: 9, zaterdagen: 0,
    zaterdagGewerkt: false, roosterBeschikbaar: true, tenureWeken: 82 },
  { id: 'pien', naam: 'Pien Duijndam', rol: 'Kelner · Branding', avatar: '🙂',
    punten: 760, xp: 0.40, streak: 4, dagen: 12, diensten: 4, zaterdagen: 2,
    zaterdagGewerkt: true, roosterBeschikbaar: true, tenureWeken: 38 },
  { id: 'jesse', naam: 'Jesse Plas', rol: 'Kelner · Branding', avatar: '😅',
    punten: 610, xp: 0.32, streak: 1, dagen: 13, diensten: 5, zaterdagen: 1,
    zaterdagGewerkt: true, roosterBeschikbaar: false, tenureWeken: 27, blauwOver: true },
  { id: 'lisa', naam: 'Lisa Hellemans', rol: 'Kelner · Branding', avatar: '😐',
    punten: 180, xp: 0.10, streak: 0, dagen: 2, diensten: 0, zaterdagen: 0,
    zaterdagGewerkt: false, roosterBeschikbaar: false, tenureWeken: 51 },
  { id: 'milou', naam: 'Milou Kaspers', rol: 'Kelner · Branding', avatar: '🌟',
    punten: 240, xp: 0.30, streak: 3, dagen: 7, diensten: 2, zaterdagen: 1,
    zaterdagGewerkt: true, roosterBeschikbaar: true, tenureWeken: 3, newbeeWeek: 3 },
  { id: 'phil', naam: 'Phil Groenewoud', rol: 'Leidinggevende · Branding', avatar: '🕶️',
    punten: 1340, xp: 0.55, streak: 6, dagen: 14, diensten: 7, zaterdagen: 4,
    zaterdagGewerkt: true, roosterBeschikbaar: true, tenureWeken: 73, vakantieOver: 5 },
  { id: 'rob', naam: 'Rob Pieters', rol: 'Occasioneel · Branding', avatar: '👨‍🦳',
    punten: 90, xp: 0, streak: 0, dagen: 0, diensten: 0, zaterdagen: 0, occasional: true },
  { id: 'nadia', naam: 'Nadia el Amrani', rol: 'Sabbatical · Branding', avatar: '🌙',
    punten: 0, xp: 0, streak: 0, dagen: 0, diensten: 0, zaterdagen: 0, dnd: true },
];
// Bereken en bevries de status + reden voor elke medewerker
PERSONAS.forEach(p => { const c = computeStatus(p); p.status = c.key; p.statusReason = c.reason; });

/* Extra teamleden (alleen voor het Familie-/leaderboard-scherm, niet in de switcher) */
const EXTRA_TEAM = [
  { naam: 'Teije van Schaik', status: 'topper_zat', punten: 1690 },
  { naam: 'Chya Saleh',       status: 'topper_zat', punten: 1410 },
  { naam: 'Lieke van Zaanen', status: 'groen',      punten: 900 },
  { naam: 'Dominique vd Burg',status: 'groen',      punten: 820 },
  { naam: 'Fleur Janssen',    status: 'newbee',     punten: 480, newbeeWeek: 8 },
  { naam: 'Sven Bakker',      status: 'newbee',     punten: 120, newbeeWeek: 1 },
];

/* ---------------------------------------------------------------------
   2c. AFTELKLOK  ("over X dagen en Y uur en Z min word jij blauw")
   --------------------------------------------------------------------- */
const APP_START = Date.now();
// Deadline = nu + 6 dagen, 21 uur en 5 minuten (telt live af)
const BLAUW_DEADLINE = APP_START + ((6 * 24 + 21) * 3600 + 5 * 60) * 1000;

// Compacte aftelklok: alleen het aantal dagen
function countdownMini(ms) {
  if (ms <= 0) return '⏳ je bent nu blauw';
  const d = Math.floor(ms / 86400000);
  return `⏳ nog ${d} ${d === 1 ? 'dag' : 'dagen'} tot blauw`;
}

// Eén timer die de aftelklok bijwerkt (als die in beeld is)
function startTicker() {
  setInterval(() => {
    const el = document.getElementById('cd-mini');
    if (el) el.textContent = countdownMini(BLAUW_DEADLINE - Date.now());
  }, 1000);
}

/* ---------------------------------------------------------------------
   3. APP-STATE
   --------------------------------------------------------------------- */
const GOAL_WEEKS = 10;                 // we willen ~10 weken vooruit
// We beginnen 2 weken vooruit: de lopende week + de week erop zijn al ingeroosterd.
const FIRST_WEEK = 29;                  // offset 0 = week 29
const BASE_MONDAY = new Date(2026, 6, 13); // ma 13 juli 2026 = week 29

const state = {
  personaIx: 0,
  tab: 'home',
  weekOffset: 0,
  rosterDay: 0,        // 0 = maandag
  full: null,          // beeldvullend scherm: null | 'besch' | 'rode'
  // per weekOffset een object { dagIndex: 'a' (beschikbaar) | 'v' (vrije dag) }
  weken: {},
  grabbed: new Set(),  // gepakte rode plekken (keys)
  aangevraagd: new Set(), // aangevraagde oranje plekken (keys)
  wkndNudge: {},       // per week: weekend-nudge al getoond?
};

// Nudge: bij een lege week die met een doordeweekse dag begint → eerst het weekend
function maybeWeekendNudge() {
  const days = weekDays(state.weekOffset);
  const weekend = days.sat.available || days.sun.available;
  const weekday = ['mon', 'tue', 'wed', 'thu', 'fri'].some(k => days[k].available);
  if (weekday && !weekend && !state.wkndNudge[state.weekOffset]) {
    state.wkndNudge[state.weekOffset] = true;
    toast('💡 Begin eerst met het weekend (za/zo)');
  }
  if (weekend) state.wkndNudge[state.weekOffset] = false; // weekend gevuld → reset
}

function persona() { return PERSONAS[state.personaIx]; }
function statusOf(p) { return STATUS[p.status]; }
function userZaak(p) { return (p.rol.split('·').pop() || '').trim(); }
function isTopper(p) { return p.status === 'topper' || p.status === 'topper_zat'; }

/* ---- Beschikbaarheid-helpers ---------------------------------------- */
// Hoeveel weken iemand standaard al vooruit heeft staan (alleen voor de demo)
function baselineWeken(p) {
  // matcht de status: blauw/rpp/dnd hebben (vrijwel) niets ingevuld
  return ({ topper_zat: 9, topper: 8, vakantie: 7, groen: 5, newbee: 2, bijna_blauw: 1, blauw: 0 })[p.status] || 0;
}
// Vul de demo-beschikbaarheid bij het kiezen van een medewerker
function seedWeken(p) {
  state.weken = {};
  // Vakantieganger: huidige week beschikbaar, dan 2 weken vakantie (vrij),
  // daarna leeg — zodat de weken ná de vakantie nog opgegeven moeten worden.
  if (p.status === 'vakantie') {
    const wk0 = Cal.emptyDays(); Cal.fill(wk0, 'doordeweeks'); Cal.fill(wk0, 'weekend'); state.weken[0] = wk0;
    for (const w of [1, 2]) { const d = Cal.emptyDays(); Cal.fill(d, 'alle-v'); state.weken[w] = d; }
    return;
  }
  const n = baselineWeken(p);
  const weekend = (p.status === 'topper_zat' || p.status === 'topper');
  for (let w = 0; w < n; w++) {
    const days = Cal.emptyDays();
    Cal.fill(days, 'doordeweeks');
    if (weekend) Cal.fill(days, 'weekend');
    state.weken[w] = days;
  }
}
function weekDays(off) { return state.weken[off] || (state.weken[off] = Cal.emptyDays()); }
// Aantal weken vooruit waarin iets is ingevuld (beschikbaar of vrij)
function wekenIngevuld() {
  let n = 0;
  for (let w = 0; w < GOAL_WEEKS; w++) {
    const d = state.weken[w];
    if (d && !Cal.isEmpty(d)) n++;
  }
  return n;
}
function mondayFor(off) {
  const d = new Date(BASE_MONDAY); d.setDate(d.getDate() + off * 7); return d;
}
function weekNr(offset) { return FIRST_WEEK + offset; }
function dateFor(offset, day) {
  const d = new Date(BASE_MONDAY);
  d.setDate(d.getDate() + offset * 7 + day);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function weekRange(offset) { return `${dateFor(offset, 0)} – ${dateFor(offset, 6)}`; }

/* ---- Doel komende 4 weken: 12 diensten, waarvan 3 lastige -------------- */
const TARGET = { weken: 4, diensten: 12, lastig: 3 };
function hourNum(t) { if (t === 'sluit' || t === '00:00') return 24; const n = parseInt(t, 10); return isNaN(n) ? null : n; }
function hourTxt(h) { return h >= 24 ? 'sluit' : String(h).padStart(2, '0') + ':00'; }

/* ---- Weekenddiensten (blauw moet hiermee beginnen) -------------------- */
const WEEKEND = [
  { day: 'fri', from: 17, to: 24, label: 'Vrijdagavond', sub: '17:00 – sluit' },
  { day: 'sat', from: 7,  to: 17, label: 'Zaterdag overdag', sub: '07:00 – 17:00' },
  { day: 'sat', from: 17, to: 24, label: 'Zaterdagavond', sub: '17:00 – sluit', lastig: true },
  { day: 'sun', from: 12, to: 19, label: 'Zondagmiddag', sub: '12:00 – 19:00', lastig: true },
];
function dayRange(d) { return (!d || d.off || !d.available) ? null : [hourNum(d.from), hourNum(d.to)]; }
function wkndActive(w, days) { const r = dayRange(days[w.day]); return !!r && r[0] <= w.from && r[1] >= w.to; }
function toggleWeekend(w) {
  const days = weekDays(state.weekOffset), d = days[w.day], r = dayRange(d);
  const active = !!r && r[0] <= w.from && r[1] >= w.to;
  if (active) { // dit blok eraf trimmen
    let [a, b] = r;
    if (w.from <= a) a = w.to; else if (w.to >= b) b = w.from;
    days[w.day] = (a >= b) ? { available: false, from: null, to: null, off: false }
                           : { available: true, off: false, from: hourTxt(a), to: hourTxt(b) };
  } else { // dit blok erbij (samenvoegen tot aaneengesloten venster)
    const a = r ? Math.min(r[0], w.from) : w.from, b = r ? Math.max(r[1], w.to) : w.to;
    days[w.day] = { available: true, off: false, from: hourTxt(a), to: hourTxt(b) };
  }
}
function weekHasWeekend() { const days = weekDays(state.weekOffset); return ['fri', 'sat', 'sun'].some(k => days[k].available); }

// Lastige dienst = zaterdag 18:00–23:00 of zondag 12:00–19:00 volledig gedekt
function isLastigDag(key, day) {
  if (!day || !day.available) return false;
  const f = hourNum(day.from), t = hourNum(day.to);
  if (f == null || t == null) return false;
  if (key === 'sat') return f <= 18 && t >= 23;
  if (key === 'sun') return f <= 12 && t >= 19;
  return false;
}
// Tel lastige diensten over álle ingevulde weken (voor de teller in de editor)
function countLastigAll() {
  let l = 0;
  for (let w = 0; w < GOAL_WEEKS; w++) {
    const d = state.weken[w];
    if (!d) continue;
    for (const k of Cal.DAY_KEYS) if (isLastigDag(k, d[k])) l++;
  }
  return l;
}
function countTarget() {
  let d = 0, l = 0;
  for (let w = 0; w < TARGET.weken; w++) {
    const days = state.weken[w];
    if (!days) continue;
    for (const k of Cal.DAY_KEYS) {
      const day = days[k];
      if (day && day.available) { d++; if (isLastigDag(k, day)) l++; }
    }
  }
  return { d, l, ok: d >= TARGET.diensten && l >= TARGET.lastig };
}

// Volle vakantieweek = elke dag op vrij
function isVakantieWeek(off) {
  const d = state.weken[off];
  return !!d && Cal.DAY_KEYS.every(k => d[k] && d[k].off);
}
// Vakantie + lege weken erna (om te stimuleren)
function vacInfo() {
  let last = -1;
  for (let w = 0; w < GOAL_WEEKS; w++) if (isVakantieWeek(w)) last = w;
  if (last < 0) return { hasVac: false, emptyAfter: 0 };
  let emptyAfter = 0;
  for (let w = last + 1; w < GOAL_WEEKS; w++) { const d = state.weken[w]; if (!d || Cal.isEmpty(d)) emptyAfter++; }
  return { hasVac: true, lastVacWeek: last, emptyAfter };
}

/* ---------------------------------------------------------------------
   4. MOCK-DATA voor de schermen
   --------------------------------------------------------------------- */
const DAGEN = ['MA', 'DI', 'WO', 'DO', 'VR', 'ZA', 'ZO'];
const DAGEN_LANG = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

// Open diensten ("rode plekken")
// Rode plekken = open diensten in het al gemaakte rooster (op datum)
const RODE_PLEKKEN = [
  { dag: 'Wo', datum: '02 jul', sort: 2, rol: 'Kelner', tijd: '11:00 – 17:00', zaak: 'Branding' },
  { dag: 'Vr', datum: '04 jul', sort: 4, rol: 'Kelner', tijd: '16:30 – sluit', zaak: 'Branding' },
  { dag: 'Za', datum: '05 jul', sort: 5, rol: 'Kelner', tijd: '17:00 – sluit', zaak: 'Branding' },
  { dag: 'Zo', datum: '06 jul', sort: 6, rol: 'Runner', tijd: '12:00 – 18:00', zaak: 'Branding' },
];
// Oranje plekken = extra diensten (meer mensen op die dag/avond); moeten goedgekeurd worden
const ORANJE_PLEKKEN = [
  { dag: 'Za', datum: '05 jul', sort: 5, rol: 'Kelner', tijd: '18:00 – sluit', zaak: 'Branding' },
  { dag: 'Zo', datum: '06 jul', sort: 6, rol: 'Kelner', tijd: '11:00 – 17:00', zaak: 'Branding' },
  { dag: 'Vr', datum: '11 jul', sort: 11, rol: 'Kelner', tijd: '18:00 – sluit', zaak: 'Branding' },
];
const plekKey = r => r.dag + r.datum + r.rol + r.tijd;
const PLEK_INDEX = {};
[...RODE_PLEKKEN, ...ORANJE_PLEKKEN].forEach(r => { PLEK_INDEX[plekKey(r)] = r; });

// Jouw komende diensten
const MIJN_DIENSTEN = [
  { dag: 'Maandag 30 jun', tijd: '10:00 – sluit', rol: 'Kelner', zaak: 'Branding', soon: true },
  { dag: 'Donderdag 03 jul', tijd: '17:00 – sluit', rol: 'Kelner', zaak: 'Branding' },
  { dag: 'Zaterdag 05 jul', tijd: '16:30 – sluit', rol: 'Kelner', zaak: 'Branding' },
];

// Teamrooster per dag (zoals huidige app) — vereenvoudigd
const ROOSTER = {
  0: [
    { tijd: '10:00', uit: 'Sluit', naam: 'Daan Hulhoven', fn: 'LG', kl: 'green', ic: '💪' },
    { tijd: '16:30', uit: 'Sluit', naam: 'Phil Groenewoud', fn: 'LG', kl: 'blue', ic: '' },
    { tijd: '08:00', uit: 'Sluit', naam: 'Teije van Schaik', fn: 'Kelner', kl: 'green', ic: '💪🕺' },
    { tijd: '11:00', uit: '17:00', naam: 'Pien Duijndam', fn: 'Kelner', kl: 'green', ic: '' },
    { tijd: '12:00', uit: 'Sluit', naam: 'Lisa Hellemans', fn: 'Kelner', kl: 'blue', ic: '🔴' },
    { tijd: '12:30', uit: 'Sluit', naam: 'Dominique vd Burg', fn: 'Kelner', kl: 'green', ic: '' },
    { tijd: '13:00', uit: 'Sluit', naam: 'Chya Saleh', fn: 'Kelner', kl: 'green', ic: '💪🕺' },
    { tijd: '17:00', uit: 'Sluit', naam: 'Milou Kaspers', fn: 'Kelner', kl: 'green', ic: '🌱' },
  ],
};
function roosterVoor(d) {
  // hergebruik dag 0 met kleine variatie zodat elke dag gevuld is
  const base = ROOSTER[0];
  if (d === 0) return base;
  return base.slice(0, 8 - (d % 4)).map((r, i) => ({ ...r, naam: r.naam }));
}

// "Overig"-menu (alle subs uit het oude hoofdmenu)
const OVERIG = [
  { ic: '⏱️', l: 'Gewerkte uren' },
  { ic: '🌴', l: 'Vakantie aanvragen' },
  { ic: '🤝', l: 'Aangeboden diensten', badge: '4' },
  { ic: '📋', l: 'Eigen diensten' },
  { ic: '👤', l: 'Mijn profiel' },
  { ic: '🔢', l: 'Mijn pincode' },
  { ic: '📰', l: 'Nieuws' },
  { ic: '📖', l: 'Handboek' },
  { ic: '📞', l: 'Telefoonlijst' },
  { ic: '🌐', l: 'Taal — NL / EN' },
  { ic: '🚪', l: 'Log uit' },
];

// Prestatie-badges (gamification — op gedrag, niet op punten/plek)
function badgesVoor(p) {
  return [
    { e: '📅', l: '10 weken vooruit', on: wekenIngevuld() >= GOAL_WEEKS },
    { e: '💪', l: 'Topper', on: ['topper', 'topper_zat'].includes(p.status) },
    { e: '🕺', l: 'Zaterdag-held', on: p.zaterdagen >= 4 },
    { e: '🌱', l: 'Familielid', on: p.dagen >= 10 || p.status === 'newbee' },
    { e: '⚡', l: 'Veel diensten', on: p.diensten >= 5 },
    { e: '🟢', l: 'Trouw groen', on: ['groen', 'topper', 'topper_zat'].includes(p.status) },
  ];
}

/* ---------------------------------------------------------------------
   5. TABS (de 5 hoofdkeuzes, in de gevraagde volgorde)
   --------------------------------------------------------------------- */
const TABS = [
  { id: 'home',        ic: '🏠', l: 'Start' },
  { id: 'beschikbaar', ic: '🗓️', l: 'Beschikbaar' },
  { id: 'rode',        ic: '🔥', l: 'Rode plekken', dot: true },
  { id: 'ingeroosterd',ic: '✅', l: 'Ingeroosterd' },
  { id: 'rooster',     ic: '👥', l: 'Rooster' },
  { id: 'overig',      ic: '⋯',  l: 'Overig' },
];

/* =====================================================================
   6. RENDER — statusbalk
   ===================================================================== */
function renderStatus() {
  const p = persona();
  const s = statusOf(p);
  const bar = document.getElementById('status-bar');
  bar.className = 'statusbar ' + s.theme;
  // Hele app-achtergrond kleurt mee met de status (blauw = duidelijk blauw)
  const phone = document.querySelector('.phone');
  if (phone) phone.className = 'phone bg-' + s.theme.replace('t-', '');

  const xpBlock = ''; // voortgangsbalk verwijderd (te veel tekst)

  // "Bijna blauw" krijgt een live aftelklok i.p.v. een simpele chip
  const alertChip = (s.alert && p.blauwOver)
    ? `<div class="cd-mini" id="cd-mini">${countdownMini(BLAUW_DEADLINE - Date.now())}</div>`
    : (s.alert ? `<div class="sb-alertchip">⚠️ ${s.alert}</div>` : '');

  let msg = `
    <div class="sb-msg">
      <div class="sb-icons">${s.icons}</div>
      <div>
        <div class="sb-text">${s.title}</div>
        <div class="sb-sub">${s.sub}</div>
      </div>
    </div>${alertChip}`;

  // Newbee krijgt een familie-voortgang i.p.v. XP-level
  if (s.newbee) {
    const wk = p.newbeeWeek || 1;
    msg += `
      <div class="sb-xp">
        <div class="sb-xp-track"><div class="sb-xp-fill" style="width:${Math.round((wk / 13) * 100)}%"></div></div>
        <div class="sb-xp-meta"><span>Week ${wk} van 13 in de familie</span><span>nog ${13 - wk} weken</span></div>
      </div>`;
  }

  bar.innerHTML = `
    <div class="sb-top">
      <div class="sb-avatar">${p.avatar}</div>
      <div class="sb-id">
        <div class="sb-name">${p.naam}</div>
        <div class="sb-role">${p.rol}</div>
      </div>
      <div class="sb-badge">${s.icons.slice(0, 2)} ${s.badge}</div>
    </div>
    ${msg}
    ${s.newbee ? '' : xpBlock}
    <div class="sb-chev">tik voor details ⌄</div>`;

  bar.onclick = openStatusSheet;
}

/* =====================================================================
   7. RENDER — tabbar
   ===================================================================== */
// Sub-schermen (geen eigen tab) vallen onder een hoofd-tab voor de markering
const SUBSCREEN_PARENT = { familie: 'overig' };

function renderTabs() {
  const nav = document.getElementById('tabbar');
  const active = TABS.some(t => t.id === state.tab) ? state.tab : (SUBSCREEN_PARENT[state.tab] || state.tab);
  nav.innerHTML = TABS.map(t => `
    <button class="tab ${active === t.id ? 'on' : ''}" data-tab="${t.id}">
      ${t.dot && hasRode() ? '<span class="dot"></span>' : ''}
      <span class="ti">${t.ic}</span>
      <span class="tl">${t.l}</span>
    </button>`).join('');
  nav.querySelectorAll('.tab').forEach(b => b.onclick = () => go(b.dataset.tab));
}
function hasRode() {
  const p = persona();
  if (isTopper(p)) return false; // toppers niet pushen
  return RODE_PLEKKEN.some(r => r.zaak === userZaak(p) && !isGrabbed(r));
}
function isGrabbed(r) { return state.grabbed.has(plekKey(r)); }
function isAangevraagd(r) { return state.aangevraagd.has(plekKey(r)); }

/* =====================================================================
   8. RENDER — schermen
   ===================================================================== */
function renderView() {
  const v = document.getElementById('view');
  v.scrollTop = 0;
  v.innerHTML = ({
    home: viewHome,
    beschikbaar: viewBeschikbaar,
    rode: viewRode,
    ingeroosterd: viewIngeroosterd,
    rooster: viewRooster,
    overig: viewOverig,
    familie: viewFamilie,
  }[state.tab] || viewHome)();
  wireView();
}

/* ---- 8·0 Startscherm (mededelingen) ---- */
// Persoonlijke mededelingen op basis van de status van de medewerker
function mededelingen(p) {
  const naam = p.naam.split(' ')[0];
  const list = [];
  if (p.status === 'bijna_blauw') list.push({ ic: '⏳', kl: 'amber', title: 'Je wordt bijna blauw', text: `${naam}, geef snel beschikbaarheid op voor het komende rooster.`, cta: 'Beschikbaarheid opgeven', tab: 'beschikbaar' });
  if (p.status === 'blauw') list.push({ ic: '💧', kl: 'blue', title: 'Te weinig beschikbaarheid', text: `${naam}, geef op voor de komende 4 weken — anders kun je niet ingeroosterd worden.`, cta: 'Beschikbaarheid opgeven', tab: 'beschikbaar' });
  if (p.status === 'newbee') list.push({ ic: '🌱', kl: 'sun', title: 'Welkom bij Branding', text: `${naam}, geef je eerste weken op zodat we je kunnen inplannen.`, cta: 'Beschikbaarheid opgeven', tab: 'beschikbaar' });
  if (p.status === 'vakantie') list.push({ ic: '🏖️', kl: 'purple', title: 'Beschikbaarheid ná je vakantie', text: `${naam}, geef de weken na je vakantie op.`, cta: 'Beschikbaarheid opgeven', tab: 'beschikbaar' });
  return list;
}
function viewHome() {
  const p = persona();
  const msgs = mededelingen(p);

  let midden;
  if (msgs.length) {
    midden = msgs.map(m => `
      <div class="mdl ${m.kl}">
        <div class="mdl-ic">${m.ic}</div>
        <div class="mdl-body">
          <div class="mdl-title">${m.title}</div>
          <div class="mdl-text">${m.text}</div>
          ${m.cta ? `<button class="btn btn-primary mdl-cta" data-mdl="${m.tab}">${m.cta}</button>` : ''}
        </div>
      </div>`).join('');
  } else {
    // Niets te melden → schoon blok + eerstvolgende dienst
    const d = MIJN_DIENSTEN[0];
    midden = `
      <div class="mdl-leeg">
        <div class="mdl-leeg-ic">✓</div>
        <div class="mdl-leeg-t">Niets te melden — je staat er goed voor.</div>
      </div>
      <div class="next-shift" style="margin-top:14px">
        <div class="lbl">Eerstvolgende dienst</div>
        <div class="big">${d.dag}</div>
        <div class="cd">${d.tijd} · ${d.rol} · ${d.zaak}</div>
      </div>`;
  }

  return `<div class="home">${midden}</div>`;
}

// Begeleiding: voortgang naar 12 diensten / 3 lastige in 4 weken
function coachCard(p) {
  // Vakantieganger: stimuleer de weken ná de vakantie als die nog leeg zijn
  if (p.status === 'vakantie') {
    const v = vacInfo();
    if (!(v.hasVac && v.emptyAfter > 0)) return '';
    return `
      <div class="coach blue">
        <div class="coach-head">Geef je beschikbaarheid op voor de weken ná je vakantie.</div>
      </div>`;
  }
  // Alleen de concrete ontbrekende weken tonen (rest is weggehaald)
  const leeg = [];
  for (let w = 0; w < GOAL_WEEKS; w++) { const d = state.weken[w]; if (!d || Cal.isEmpty(d)) leeg.push(weekNr(w)); }
  if (!leeg.length) return ''; // alles ingevuld → geen coach

  let wkTxt;
  if (leeg.length === 1) wkTxt = `week ${leeg[0]}`;
  else if (leeg[leeg.length - 1] - leeg[0] === leeg.length - 1) wkTxt = `week ${leeg[0]} t/m ${leeg[leeg.length - 1]}`;
  else wkTxt = 'week ' + leeg.join(', ');

  return `
    <div class="coach ${p.status === 'blauw' ? 'blue' : ''}">
      <ul class="coach-todo"><li>Geef nu ook <b>${wkTxt}</b> op</li></ul>
    </div>`;
}

// Actieveld: altijd iets tonen — of de tekorten, of een bevestiging
function actieVeld(p) {
  const c = coachCard(p);
  if (c) return c;
  return `<div class="coach ok"><div class="coach-head">Je beschikbaarheid is op orde. Bedankt!</div></div>`;
}

/* ---- 8a. Beschikbaarheid — ACTIE-scherm (landing) ---- */
function viewBeschikbaar() {
  const p = persona();

  // Weeknummers 29..38 met status; tik een week om die te openen
  const pillen = Array.from({ length: GOAL_WEEKS }, (_, w) => {
    const d = state.weken[w];
    const cls = isVakantieWeek(w) ? 'vrij' : (d && !Cal.isEmpty(d)) ? 'has' : 'leeg';
    return `<button class="wkpill ${cls}" data-week="${w}">${weekNr(w)}</button>`;
  }).join('');

  return `
    ${actieVeld(p)}

    <div class="card">
      <div class="row between" style="margin-bottom:10px">
        <b>Jouw weken</b>
        <span class="small muted">tik een week om op te geven</span>
      </div>
      <div class="wkpills">${pillen}</div>
    </div>

    <button class="btn btn-primary btn-block" id="open-editor">Beschikbaarheid opgeven</button>`;
}

/* ---- Beeldvullend full-screen systeem (beschikbaarheid én rode plekken) ---- */
function openFull(kind) {
  state.full = kind;
  document.getElementById('editor').classList.remove('hidden');
  if (kind === 'rode') renderRodeFull();
  else renderEditor();
}
function hideFull() {
  state.full = null;
  document.getElementById('editor').classList.add('hidden');
}
function openEditor() { openFull('besch'); }
function closeEditor() { hideFull(); renderAll(); } // terug naar landing + statusbalk

// Rode plekken beeldvullend
function renderRodeFull() {
  const el = document.getElementById('editor');
  el.innerHTML = `
    <div class="ed-top">
      <button class="ed-back" id="ed-close">‹ Terug</button>
      <div class="ed-counter">Rode plekken</div>
    </div>
    <div class="ed-body">${rodeInner(persona())}</div>`;
  el.querySelector('#ed-close').onclick = () => { state.tab = 'beschikbaar'; hideFull(); renderAll(); };
  el.querySelectorAll('[data-take]').forEach(b => b.onclick = () => {
    const r = PLEK_INDEX[b.dataset.take];
    if (b.dataset.type === 'oranje') {
      state.aangevraagd.add(b.dataset.take);
      toast('Aanvraag verstuurd — moet nog goedgekeurd worden. Je krijgt z.s.m. reactie via de staffapp.');
    } else {
      state.grabbed.add(b.dataset.take);
      toast('Dienst gepakt! ✅');
    }
    renderRodeFull();
  });
}

function renderEditor() {
  const off = state.weekOffset;
  const la = countLastigAll();
  const sum = Cal.summary(weekDays(off));
  const pillen = Array.from({ length: GOAL_WEEKS }, (_, w) => {
    const d = state.weken[w];
    const cls = isVakantieWeek(w) ? 'vrij' : (d && !Cal.isEmpty(d)) ? 'has' : 'leeg';
    return `<button class="wkpill ${cls} ${w === off ? 'cur' : ''}" data-pill="${w}">${weekNr(w)}</button>`;
  }).join('');

  const blue = persona().status === 'blauw';
  const days = weekDays(off);
  const wkndBtns = WEEKEND.map((w, i) =>
    `<button class="lqbtn ${wkndActive(w, days) ? 'on' : ''} ${w.lastig ? 'lastig' : ''}" data-wknd="${i}">${w.label}<span>${w.sub}</span></button>`
  ).join('');
  // Blauw: verplicht eerst het weekend; pas daarna de rest van de week
  const gridBlock = (blue && !weekHasWeekend())
    ? `<div class="wknd-lock">🔒 Geef eerst je weekend op. Daarna kun je de rest van de week invullen.</div>`
    : `<div id="tg-grid"></div>
       <div class="legenda">
         <span><i class="lg a"></i> kan werken (${sum.kan})</span>
         <span><i class="lg v"></i> vrije dag (${sum.vrij})</span>
       </div>`;

  const el = document.getElementById('editor');
  el.innerHTML = `
    <div class="ed-top">
      <div class="ed-title">Beschikbaarheid</div>
      <div class="ed-counter ${la >= TARGET.lastig ? 'ok' : ''}" id="ed-counter">Lastige diensten ${la}/${TARGET.lastig}</div>
    </div>
    <div class="ed-body">
      <div class="wkpills">${pillen}</div>

      <div class="card">
        <div class="weeknav">
          <button data-wk="-1" ${off === 0 ? 'disabled' : ''}>‹</button>
          <span class="wk">Week ${weekNr(off)} · ${weekRange(off)}</span>
          <button data-wk="1" ${off >= GOAL_WEEKS - 1 ? 'disabled' : ''}>›</button>
        </div>

        ${blue ? '<div class="wknd-head">Begin met het weekend ⭐ = lastige dienst</div>' : ''}
        <div class="weekend-quick">${wkndBtns}</div>

        ${gridBlock}
      </div>

      <button class="btn btn-primary btn-block btn-copy" id="open-copy">📋 Kopieer week ${weekNr(off)} naar volgende weken</button>
      <button class="btn btn-ghost btn-block" id="ed-done" style="margin-top:10px">Klaar</button>
    </div>`;

  wireEditor();
}
function wireEditor() {
  const el = document.getElementById('editor');
  const grid = el.querySelector('#tg-grid');
  if (grid && window.Cal) {
    Cal.renderBaseWeek(grid, weekDays(state.weekOffset), mondayFor(state.weekOffset), () => {
      // teller + legenda live bijwerken zonder de hele editor te hertekenen (slepen blijft werken)
      const la = countLastigAll();
      const cnt = el.querySelector('#ed-counter');
      if (cnt) { cnt.textContent = `Lastige diensten ${la}/${TARGET.lastig}`; cnt.classList.toggle('ok', la >= TARGET.lastig); }
      const lg = el.querySelector('.legenda');
      if (lg) { const s = Cal.summary(weekDays(state.weekOffset)); lg.innerHTML =
        `<span><i class="lg a"></i> kan werken (${s.kan})</span><span><i class="lg v"></i> vrije dag (${s.vrij})</span>`; }
      // Nudge: begin eerst met het weekend (als een doordeweekse dag is gevuld terwijl za/zo nog leeg is)
      maybeWeekendNudge();
    });
  }
  el.querySelectorAll('[data-wk]').forEach(b => b.onclick = () => {
    state.weekOffset = Math.min(GOAL_WEEKS - 1, Math.max(0, state.weekOffset + (+b.dataset.wk)));
    renderEditor();
  });
  el.querySelectorAll('[data-pill]').forEach(b => b.onclick = () => { state.weekOffset = +b.dataset.pill; renderEditor(); });
  el.querySelectorAll('[data-wknd]').forEach(b => b.onclick = () => {
    toggleWeekend(WEEKEND[+b.dataset.wknd]);
    renderEditor();
  });
  const copyBtn = el.querySelector('#open-copy');
  if (copyBtn) copyBtn.onclick = openCopySheet;
  el.querySelector('#ed-done').onclick = () => { toast('Opgeslagen ✓ — bedankt!'); closeEditor(); };
}

/* ---- 8b. Rode plekken (beeldvullend) ---- */
function viewRode() { return rodeInner(persona()); } // fallback (normaal via openFull)
function rodeInner(p) {
  const zaak = userZaak(p);
  const byDate = (a, b) => a.sort - b.sort;
  const rood = RODE_PLEKKEN.filter(r => r.zaak === zaak).slice().sort(byDate);
  const oranje = ORANJE_PLEKKEN.filter(r => r.zaak === zaak).slice().sort(byDate);

  const shift = (r, type) => {
    const key = plekKey(r);
    const done = type === 'rood' ? isGrabbed(r) : isAangevraagd(r);
    const actie = type === 'rood'
      ? (done ? '<span class="btn done-chip">✓ Gepakt</span>' : `<button class="btn btn-primary" data-take="${key}" data-type="rood">Pak</button>`)
      : (done ? '<span class="btn wait-chip">⏳ In behandeling</span>' : `<button class="btn btn-amber" data-take="${key}" data-type="oranje">Aanvragen</button>`);
    return `
      <div class="shift ${type === 'oranje' ? 'oranje' : ''} ${done ? 'is-done' : ''}">
        <div class="when"><b>${r.dag}</b><span>${r.datum}</span></div>
        <div class="info">
          <b>${r.rol} · ${r.zaak}</b>
          <div class="meta">${r.tijd}</div>
        </div>
        <div class="grab">${actie}</div>
      </div>`;
  };

  return `
    <div class="screen-title">Rode plekken</div>
    ${rood.length ? rood.map(r => shift(r, 'rood')).join('') : '<p class="muted small">Geen open diensten.</p>'}

    <div class="rode-sub">🟠 Oranje plekken · extra diensten</div>
    ${oranje.length ? oranje.map(r => shift(r, 'oranje')).join('') : '<p class="muted small">Geen extra diensten.</p>'}`;
}

/* ---- 8c. Wanneer ingeroosterd ---- */
function viewIngeroosterd() {
  const first = MIJN_DIENSTEN[0];
  const rest = MIJN_DIENSTEN.slice(1).map(d => `
    <div class="tl-item">
      <div class="d">${d.dag}</div>
      <div class="t">${d.tijd} · ${d.rol} · ${d.zaak}</div>
    </div>`).join('');

  return `
    <div class="screen-title">Wanneer ben ik ingeroosterd?</div>

    <div class="next-shift">
      <div class="lbl">Eerstvolgende dienst</div>
      <div class="big">${first.dag}</div>
      <div class="cd">${first.tijd} · ${first.rol} · ${first.zaak}</div>
    </div>

    <div class="card">
      <h3>Daarna</h3>
      <div class="timeline">
        ${rest || '<p class="muted small">Geen verdere diensten ingepland.</p>'}
      </div>
    </div>`;
}

/* ---- 8d. Rooster (team) ---- */
function viewRooster() {
  const data = [22, 23, 24, 25, 26, 27, 28];
  const strip = DAGEN.map((d, i) => `
    <div class="d ${state.rosterDay === i ? 'on' : ''}" data-rd="${i}">
      ${d}<b>${data[i]}</b>
    </div>`).join('');

  const head = `
    <div class="screen-title">Rooster</div>
    <p class="screen-lead">${DAGEN_LANG[state.rosterDay]} ${data[state.rosterDay]} juni · Branding</p>
    <div class="daystrip">${strip}</div>`;

  // Sta jij deze week op het rooster? Zo niet: geen teamrooster, wel een nudge.
  const p = persona();
  if (!p.roosterBeschikbaar) {
    const occ = p.status === 'rpp' || p.status === 'dnd';
    return `${head}
      <div class="card roster-block">
        <div class="rb-ic">🔒</div>
        <div class="rb-title">Jij staat niet op dit rooster</div>
        <div class="rb-sub">${occ ? 'Je werkt op afroep.' : 'Geef meer beschikbaarheid op.'}</div>
        ${occ ? '' : '<button class="btn btn-primary btn-block" id="rb-go" style="margin-top:14px">Beschikbaarheid opgeven</button>'}
      </div>`;
  }

  const rows = roosterVoor(state.rosterDay).map(r => `
    <div class="roster-row">
      <div class="time"><b>${r.tijd}</b><span>${r.uit}</span></div>
      <div class="ava">${r.naam.split(' ')[0][0]}</div>
      <div class="nm"><b class="${r.kl}">${r.naam}</b><div class="fn">${r.fn}</div></div>
      <div class="ic">${r.ic}</div>
    </div>`).join('');

  return `${head}
    <div class="card flat" style="padding:6px 14px">${rows}</div>`;
}

/* ---- 8e. Overig (alle subs) ---- */
function viewOverig() {
  const p = persona();
  const badges = badgesVoor(p).map(b => `
    <div class="badge-chip ${b.on ? '' : 'locked'}">
      <div class="e">${b.e}</div><div class="l">${b.l}</div>
    </div>`).join('');

  const items = OVERIG.map((m, i) => `
    <div class="menu-item" data-overig="${i}">
      <span class="mi-ic">${m.ic}</span>
      <span class="mi-l">${m.l}</span>
      ${m.badge ? `<span class="mi-badge">${m.badge}</span>` : ''}
      <span class="mi-chev">›</span>
    </div>`).join('');

  return `
    <div class="screen-title">Overig</div>

    <div class="stat-grid">
      <div class="stat"><b>${wekenIngevuld()}/${GOAL_WEEKS}</b><span>weken vooruit</span></div>
      <div class="stat"><b>${p.dagen}</b><span>dagen besch.</span></div>
      <div class="stat"><b>${p.diensten}</b><span>lastige diensten</span></div>
    </div>

    <div class="card" id="go-familie" style="cursor:pointer">
      <div class="row">
        <div style="font-size:30px">🏆</div>
        <div style="flex:1">
          <b>Familie &amp; Toppers</b>
          <div class="small muted">Onze toppers, newbees en wie het goed doet</div>
        </div>
        <div class="mi-chev" style="font-size:22px">›</div>
      </div>
    </div>

    <div class="card">
      <h3>Jouw prestaties</h3>
      <div class="badges">${badges}</div>
    </div>

    <div class="menu-list">${items}</div>`;
}

/* ---- 8f. Familie & Toppers (de drie gradaties — geen plek/punten) ---- */
function viewFamilie() {
  const me = persona();
  // Volledige teamlijst (demo-medewerkers + extra leden)
  const team = [
    ...PERSONAS.map(p => ({ naam: p.naam, status: p.status, newbeeWeek: p.newbeeWeek, you: p.id === me.id })),
    ...EXTRA_TEAM.map(p => ({ ...p })),
  ];

  const toppers = team.filter(t => t.status === 'topper' || t.status === 'topper_zat');
  const newbees = team.filter(t => t.status === 'newbee');
  const groenen = team.filter(t => t.status === 'groen');

  const toppersHtml = toppers.map(t => `
    <div class="fam-chip">
      <span class="e">${STATUS[t.status].icons}</span>
      <span class="n">${t.naam.split(' ')[0]}</span>
    </div>`).join('');

  const newbeesHtml = newbees.map(t => {
    const wk = t.newbeeWeek || 1;
    return `
      <div class="fam-newbee">
        <div class="row between">
          <b>${t.naam}</b><span class="small muted">week ${wk}/13</span>
        </div>
        <div class="progress" style="margin-top:6px"><i style="width:${Math.round((wk / 13) * 100)}%; background:#ff8a52"></i></div>
        <button class="btn btn-ghost welkom" style="margin-top:9px; padding:8px 14px; font-size:13px">🙌 Heet welkom</button>
      </div>`;
  }).join('');

  const groenenHtml = groenen.map(t => `<span class="green-name">✅ ${t.naam}</span>`).join('');

  return `
    <div class="screen-title">Familie &amp; Toppers</div>

    <div class="card">
      <h3>💪 Onze toppers</h3>
      <div class="fam-chips">${toppersHtml || '<span class="muted small">Nog geen toppers deze week.</span>'}</div>
    </div>

    <div class="card">
      <h3>🌱 Onze newbees</h3>
      ${newbeesHtml || '<span class="muted small">Geen newbees op dit moment.</span>'}
    </div>

    <div class="card">
      <h3>💚 Groene namen</h3>
      <div class="green-names">${groenenHtml || '<span class="muted small">—</span>'}</div>
    </div>`;
}

/* =====================================================================
   9. INTERACTIE per scherm
   ===================================================================== */
function wireView() {
  const v = document.getElementById('view');

  // Beschikbaarheid landing → open de beeldvullende editor
  const openEd = v.querySelector('#open-editor');
  if (openEd) openEd.onclick = openEditor;
  // Tik een weeknummer → open editor op die week
  v.querySelectorAll('[data-week]').forEach(b => b.onclick = () => { state.weekOffset = +b.dataset.week; openEditor(); });

  // Rooster: dag kiezen
  v.querySelectorAll('[data-rd]').forEach(d => d.onclick = () => {
    state.rosterDay = +d.dataset.rd;
    renderView();
  });
  // Rooster geblokkeerd → naar beschikbaarheid
  const rbGo = v.querySelector('#rb-go');
  if (rbGo) rbGo.onclick = () => go('beschikbaar');

  // Startscherm: mededeling-knoppen
  v.querySelectorAll('[data-mdl]').forEach(b => b.onclick = () => go(b.dataset.mdl));

  // Overig: menu-items
  v.querySelectorAll('[data-overig]').forEach(m => m.onclick = () => {
    const item = OVERIG[+m.dataset.overig];
    toast(`"${item.l}" — nog niet in prototype`);
  });

  // Overig → Familie-scherm
  const fam = v.querySelector('#go-familie');
  if (fam) fam.onclick = () => go('familie');

  // Familie: newbee welkom heten
  v.querySelectorAll('.welkom').forEach(b => b.onclick = () => toast('🙌 Welkom gestuurd!'));
}

/* =====================================================================
   10. SHEETS (status-detail + persona-keuze)
   ===================================================================== */
function openSheet(html) {
  const bd = document.getElementById('sheet-backdrop');
  document.getElementById('sheet').innerHTML = `<div class="sheet-handle"></div>${html}`;
  bd.classList.remove('hidden');
  bd.onclick = e => { if (e.target === bd) closeSheet(); };
}
function closeSheet() { document.getElementById('sheet-backdrop').classList.add('hidden'); }

// Kopieer de huidige week naar gekozen volgende weken (tot 10 weken vooruit)
function openCopySheet() {
  const off = state.weekOffset;
  const src = weekDays(off);
  const targets = [];
  for (let w = off + 1; w < GOAL_WEEKS; w++) targets.push(w); // alleen vooruit kopiëren
  const rows = targets.map(w => `
    <label class="copy-row">
      <input type="checkbox" checked data-copy="${w}"/>
      <span>Week ${weekNr(w)} <span class="small muted">(${weekRange(w)})</span></span>
    </label>`).join('');
  const leeg = targets.length === 0;
  openSheet(`
    <h2>📋 Kopieer week ${weekNr(off)} vooruit</h2>
    ${leeg ? '<p class="sub">Dit is de laatste week — niets om vooruit te kopiëren.</p>' : `
    <button class="btn btn-link" id="copy-all" style="margin-bottom:4px">Alles aan / uit</button>
    <div class="copy-list">${rows}</div>
    <button class="btn btn-primary btn-block" id="copy-go" style="margin-top:6px">Kopieer naar aangevinkte weken</button>`}
    <button class="btn btn-ghost btn-block" id="copy-close" style="margin-top:10px">Sluit</button>`);
  const sheet = document.getElementById('sheet');
  sheet.querySelector('#copy-close').onclick = closeSheet;
  if (leeg) return;
  sheet.querySelector('#copy-all').onclick = () => {
    const cbs = sheet.querySelectorAll('[data-copy]');
    const anyOff = [...cbs].some(c => !c.checked);
    cbs.forEach(c => c.checked = anyOff);
  };
  sheet.querySelector('#copy-go').onclick = () => {
    const sel = [...sheet.querySelectorAll('[data-copy]')].filter(c => c.checked).map(c => +c.dataset.copy);
    sel.forEach(w => state.weken[w] = Cal.cloneDays(src));
    closeSheet(); renderStatus(); renderView();
    toast(`Gekopieerd naar ${sel.length} ${sel.length === 1 ? 'week' : 'weken'} ✓`);
  };
}

function openStatusSheet() {
  const p = persona();
  const s = statusOf(p);
  const next = nextStepHint(p);
  openSheet(`
    <h2>${s.icons} ${s.badge}</h2>
    <p class="sub">${s.title}</p>
    <div class="card flat" style="margin-bottom:12px">
      <div class="row between"><span class="muted">Status</span><b>${s.title}</b></div>
      <div class="row between" style="margin-top:8px"><span class="muted">Weken vooruit opgegeven</span><b>${wekenIngevuld()} van ${GOAL_WEEKS}</b></div>
      <div class="row between" style="margin-top:8px"><span class="muted">Beschikbare dagen</span><b>${p.dagen}</b></div>
      <div class="row between" style="margin-top:8px"><span class="muted">Lastige diensten</span><b>${p.diensten}</b></div>
    </div>
    ${p.statusReason ? `<div class="hint-why">🔎 <b>Waarom deze status?</b><br>${p.statusReason}</div>` : ''}
    <div class="goal" style="margin:0 0 12px">
      <div class="goal-emoji">${next.emoji}</div>
      <div class="goal-txt"><b>${next.title}</b><span>${next.sub}</span></div>
    </div>
    <button class="btn btn-primary btn-block" id="sheet-go">${next.cta}</button>`);
  const go2 = document.getElementById('sheet-go');
  if (go2) go2.onclick = () => { closeSheet(); go(next.tab || 'beschikbaar'); };
}

// "Volgende stap" — koppelt status aan een concrete actie (gamification-haak)
function nextStepHint(p) {
  switch (p.status) {
    case 'topper_zat':
    case 'topper':
      return { emoji: '🏆', title: 'Blijf op kop', sub: 'Help het team: pak af en toe een rode plek', cta: 'Naar rode plekken', tab: 'rode' };
    case 'groen':
      return { emoji: '💪', title: 'Word een topper', sub: 'Geef ook lastige diensten op (za-avond telt dubbel)', cta: 'Beschikbaarheid uitbreiden', tab: 'beschikbaar' };
    case 'bijna_blauw':
      return { emoji: '⚠️', title: 'Voorkom dat je blauw wordt', sub: 'Geef nú beschikbaarheid op voor het komende rooster', cta: 'Direct opgeven', tab: 'beschikbaar' };
    case 'blauw':
      return { emoji: '💧', title: 'Word weer groen', sub: 'Geef minimaal 5 dagen op deze week', cta: 'Beschikbaarheid opgeven', tab: 'beschikbaar' };
    case 'newbee':
      return { emoji: '🌱', title: `Week ${p.newbeeWeek} van 13`, sub: 'Geef je eerste weken volop op — zo kom je echt in de familie', cta: 'Beschikbaarheid opgeven', tab: 'beschikbaar' };
    case 'vakantie':
      return { emoji: '🏖️', title: `Nog ${p.vakantieOver} dagen`, sub: 'Regel je diensten ervoor en erna', cta: 'Bekijk mijn rooster', tab: 'ingeroosterd' };
    default:
      return { emoji: '👋', title: 'Fijn dat je er bent', sub: 'Bekijk gerust het rooster van het team', cta: 'Naar rooster', tab: 'rooster' };
  }
}

function openPersonaSheet() {
  const rows = PERSONAS.map((p, i) => {
    const s = STATUS[p.status];
    const col = themeColor(s.theme);
    return `
      <div class="persona-row ${i === state.personaIx ? 'active' : ''}" data-px="${i}">
        <div class="persona-dot" style="background:${col}">${s.icons.slice(0, 2)}</div>
        <div class="pn"><b>${p.naam}</b><span>${s.badge} — ${s.title}</span></div>
        ${i === state.personaIx ? '<span style="color:var(--green-dark);font-weight:800">✓</span>' : ''}
      </div>`;
  }).join('');
  openSheet(`
    <h2>Demo-medewerker</h2>
    <p class="sub">Wissel om elke status & flag te zien. De balk bovenin verandert mee.</p>
    ${rows}`);
  document.querySelectorAll('[data-px]').forEach(r => r.onclick = () => {
    state.personaIx = +r.dataset.px;
    state.weekOffset = 0; state.grabbed = new Set(); state.aangevraagd = new Set();
    seedWeken(persona());
    closeSheet();
    renderAll();
    showPush();   // push bij 'inloggen' als deze medewerker
  });
}

function themeColor(theme) {
  return { 't-green': '#4f9d57', 't-alert': '#4f9d57', 't-blue': '#4a6fa5',
    't-sunrise': '#ff8a52', 't-purple': '#8e6fce', 't-gold': '#d6a534', 't-slate': '#6b7280' }[theme] || '#4f9d57';
}

/* =====================================================================
   11. NAVIGATIE + helpers
   ===================================================================== */
function go(tab) {
  state.tab = tab;
  if (tab === 'rode') { renderTabs(); openFull('rode'); return; } // rode plekken beeldvullend
  hideFull();
  renderStatus(); renderTabs(); renderView();
}

function toast(msg) {
  const old = document.querySelector('.toast'); if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1900);
}

function renderAll() { renderStatus(); renderTabs(); renderView(); }

/* ---- Push-melding bij "inloggen" (= medewerker openen) ---------------- */
// Voor wie iets moet doen, verschijnt een push die confronteert.
function pushFor(p) {
  const naam = p.naam.split(' ')[0]; // voornaam in de melding
  if (p.status === 'blauw')       return { title: 'Te weinig beschikbaarheid', msg: `${naam}, geef nu op voor de komende 4 weken — anders kun je niet ingeroosterd worden.` };
  if (p.status === 'bijna_blauw') return { title: 'Bijna blauw', msg: `${naam}, geef snel beschikbaarheid op voor het komende rooster.` };
  if (p.status === 'newbee')      return { title: 'Welkom bij Branding', msg: `${naam}, geef je eerste weken op zodat we je kunnen inplannen.` };
  if (p.status === 'vakantie') {
    const v = vacInfo();
    if (v.hasVac && v.emptyAfter > 0) return { title: 'Beschikbaarheid ná je vakantie', msg: `${naam}, de ${v.emptyAfter} weken na je vakantie zijn nog leeg — geef ze op.` };
  }
  return null;
}
function showPush() {
  const old = document.getElementById('push'); if (old) old.remove();
  const info = pushFor(persona());
  if (!info) return;
  const el = document.createElement('div');
  el.id = 'push'; el.className = 'push';
  el.innerHTML = `
    <div class="push-card">
      <div class="push-ic">B</div>
      <div class="push-body">
        <div class="push-app">Branding Staff<span>nu</span></div>
        <div class="push-title">${info.title}</div>
        <div class="push-msg">${info.msg}</div>
      </div>
      <button class="push-x" aria-label="sluiten">✕</button>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  el.querySelector('.push-x').onclick = (e) => { e.stopPropagation(); dismissPush(el); };
  el.querySelector('.push-card').onclick = () => { dismissPush(el); go('beschikbaar'); };
  setTimeout(() => dismissPush(el), 8000);
}
function dismissPush(el) { if (el && el.parentNode) { el.classList.remove('in'); setTimeout(() => el.remove(), 280); } }

/* =====================================================================
   12. START
   ===================================================================== */
document.getElementById('persona-fab').onclick = openPersonaSheet;
seedWeken(persona());
renderAll();
startTicker();   // live aftelklok
showPush();      // push bij openen (inloggen)
