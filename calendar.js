'use strict';

/* =======================================================================
   Sleep-kalender voor staffapp — gebaseerd op het snelle weeksysteem uit
   de onboarding-tool, uitgebreid met een VRIJE DAG-toggle per dag.

   Per dag sleep je verticaal over de uren dat je KUNT werken (touch + muis).
   Of je markeert de dag als VRIJE DAG (🚫) — dan vraag je die dag juist vrij.
   Een dag = { available, from, to, off }.
   ======================================================================= */
window.Cal = (function () {
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DAY_SHORT = { mon: 'MA', tue: 'DI', wed: 'WO', thu: 'DO', fri: 'VR', sat: 'ZA', sun: 'ZO' };
  const CFG = { GRID_START_HOUR: 8, GRID_END_HOUR: 24 }; // 08:00 t/m sluit (laatste blok na 23:00)
  // Compacte uren-as: tussenliggende uren overslaan zodat de dag op één scherm past
  const SKIP = new Set([9, 10, 11, 14, 15, 16, 20, 21, 22]);
  const HOURS = []; // [8,12,13,17,18,19,23]
  for (let h = CFG.GRID_START_HOUR; h < CFG.GRID_END_HOUR; h++) if (!SKIP.has(h)) HOURS.push(h);

  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  const dm = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  // Het blok ná 23:00 (uur 24) heet "sluit" i.p.v. 00:00
  function hourLabel(h) { return h >= 24 ? 'sluit' : `${String(h).padStart(2, '0')}:00`; }
  function dayToSlots(day, start) {
    if (!day || !day.available) return null;
    const fromH = parseInt(day.from, 10);
    const toH = (day.to === 'sluit' || day.to === '00:00') ? 24 : parseInt(day.to, 10);
    return { a: fromH - start, b: toH - start - 1 };
  }
  function emptyDays() {
    const days = {};
    for (const k of DAY_KEYS) days[k] = { available: false, from: null, to: null, off: false };
    return days;
  }
  function cloneDays(days) {
    const out = {};
    for (const k of DAY_KEYS) { out[k] = { ...(days[k] || { available: false, from: null, to: null, off: false }) }; delete out[k]._slots; }
    return out;
  }
  function isEmpty(days) {
    return !DAY_KEYS.some(k => days[k] && (days[k].available || days[k].off));
  }
  function el(tag, cls, txt) { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ---- render: de sleep-kalender van één week ---------------------------- */
  function renderBaseWeek(container, days, monday, onChange) {
    const start = CFG.GRID_START_HOUR, end = CFG.GRID_END_HOUR;
    const nSlots = end - start;

    container.classList.add('tg');
    container.innerHTML = '';
    container.appendChild(el('div', 'tg-corner'));

    DAY_KEYS.forEach((key, i) => {
      const date = addDays(monday, i);
      const wknd = key === 'sat' || key === 'sun';
      const head = el('div', 'tg-day' + (wknd ? ' tg-wknd' : ''));
      head.innerHTML =
        `<span class="dn">${DAY_SHORT[key]}</span>` +
        `<span class="dd">${dm(date)}</span>` +
        `<span class="rng" data-range="${key}"></span>` +
        `<div class="tg-acts">` +
          `<button class="tg-on" data-allon="${key}" title="hele dag beschikbaar">●</button>` +
          `<button class="tg-off" data-off="${key}" title="vrije dag">🚫</button>` +
        `</div>`;
      container.appendChild(head);
    });

    const cells = [];
    HOURS.forEach((h) => {
      container.appendChild(el('div', 'tg-time', hourLabel(h)));
      DAY_KEYS.forEach((key) => {
        const wknd = key === 'sat' || key === 'sun';
        const cell = el('div', 'tg-cell' + (wknd ? ' tg-wknd' : ''));
        cell.dataset.day = key; cell.dataset.hour = String(h);
        container.appendChild(cell);
        cells.push(cell);
      });
    });

    // Per dag een Set van 'aan' UREN (uit de zichtbare HOURS; afgeleid uit from/to)
    function slotsOf(day) {
      if (!day._slots) {
        const s = new Set();
        if (day.available && !day.off) {
          const fromH = parseInt(day.from, 10);
          const toH = (day.to === 'sluit' || day.to === '00:00') ? 24 : parseInt(day.to, 10);
          HOURS.forEach(h => { if (h >= fromH && h < toH) s.add(h); });
        }
        day._slots = s;
      }
      return day._slots;
    }
    // from/to/available bijwerken vanuit de gekozen uren (gaten worden in het label overbrugd)
    function syncDay(day) {
      if (day.off) { day.available = false; day.from = null; day.to = null; return; }
      const arr = [...slotsOf(day)].sort((a, b) => a - b);
      if (!arr.length) { day.available = false; day.from = null; day.to = null; }
      else { day.available = true; day.from = hourLabel(arr[0]); day.to = hourLabel(arr[arr.length - 1] + 1); }
    }

    function paint() {
      for (const cell of cells) {
        const key = cell.dataset.day, h = +cell.dataset.hour;
        const day = days[key];
        cell.classList.toggle('off', !!day.off);
        cell.classList.toggle('on', !day.off && slotsOf(day).has(h));
      }
      updateHeaders();
    }
    function updateHeaders() {
      DAY_KEYS.forEach((key) => {
        const span = container.querySelector(`[data-range="${key}"]`);
        const day = days[key];
        let txt = '';
        if (day.off) txt = '🚫 vrij';
        else if (day.available) txt = `${day.from}–${day.to}`;
        span.textContent = txt;
        const head = span.parentElement;
        const full = day.available && day.from === hourLabel(start) && day.to === 'sluit';
        head.classList.toggle('has', !!day.available && !day.off);
        head.classList.toggle('isoff', !!day.off);
        head.classList.toggle('fullon', !!full); // groen stipje actief
      });
    }

    // Per-uur tekenen: tik = dat ene uur aan/uit, slepen = vegen (zelfde modus)
    let drag = null; // { dayKey, mode:'add'|'del' }
    function cellAt(x, y) { const node = document.elementFromPoint(x, y); return node && node.closest ? node.closest('.tg-cell') : null; }
    function applyHour(key, h) {
      const s = slotsOf(days[key]);
      if (drag.mode === 'add') s.add(h); else s.delete(h);
      syncDay(days[key]);
    }
    container.addEventListener('pointerdown', (e) => {
      const cell = e.target.closest && e.target.closest('.tg-cell');
      if (!cell) return;
      e.preventDefault();
      const key = cell.dataset.day, h = +cell.dataset.hour;
      if (days[key].off) { days[key].off = false; days[key]._slots = new Set(); } // 'vrij' eraf
      const has = slotsOf(days[key]).has(h);
      drag = { dayKey: key, mode: has ? 'del' : 'add' }; // groen uur aantikken = alleen dat uur weg
      applyHour(key, h);
      try { container.setPointerCapture(e.pointerId); } catch (_) {}
      paint();
    });
    container.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cell = cellAt(e.clientX, e.clientY);
      if (cell && cell.dataset.day === drag.dayKey) { applyHour(drag.dayKey, +cell.dataset.hour); paint(); }
    });
    function commit() { if (!drag) return; drag = null; paint(); onChange(); }
    container.addEventListener('pointerup', commit);
    container.addEventListener('pointercancel', commit);

    const allSlots = () => new Set(HOURS);
    container.addEventListener('click', (e) => {
      const onBtn = e.target.closest && e.target.closest('.tg-on');
      const offBtn = e.target.closest && e.target.closest('.tg-off');
      if (onBtn) {
        // groen stipje: toggle hele dag beschikbaar (nog eens = weg)
        const key = onBtn.dataset.allon;
        const full = !days[key].off && slotsOf(days[key]).size === HOURS.length;
        days[key].off = false;
        days[key]._slots = full ? new Set() : allSlots();
        syncDay(days[key]); paint(); onChange();
      } else if (offBtn) {
        // vrij: toggle hele dag vrij (nog eens = weg)
        const key = offBtn.dataset.off;
        const wasOff = days[key].off;
        days[key]._slots = new Set();
        days[key].off = !wasOff;
        syncDay(days[key]); paint(); onChange();
      }
    });

    paint();
  }

  // Snelvul-acties op een week
  function fill(days, what) {
    const set = (keys, val) => keys.forEach(k => {
      if (val === 'a') days[k] = { available: true, from: '17:00', to: 'sluit', off: false };
      else if (val === 'v') days[k] = { available: false, from: null, to: null, off: true };
      else days[k] = { available: false, from: null, to: null, off: false };
    });
    if (what === 'alle-a') set(DAY_KEYS, 'a');
    else if (what === 'doordeweeks') { set(['mon', 'tue', 'wed', 'thu', 'fri'], 'a'); }
    else if (what === 'weekend') { set(['sat', 'sun'], 'a'); }
    else if (what === 'alle-v') set(DAY_KEYS, 'v');
    else if (what === 'wis') set(DAY_KEYS, '');
  }

  function summary(days) {
    const kan = DAY_KEYS.filter(k => days[k] && days[k].available).length;
    const vrij = DAY_KEYS.filter(k => days[k] && days[k].off).length;
    return { kan, vrij };
  }

  return { DAY_KEYS, DAY_SHORT, emptyDays, cloneDays, isEmpty, renderBaseWeek, fill, summary };
})();
