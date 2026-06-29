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
    for (const k of DAY_KEYS) out[k] = { ...(days[k] || { available: false, from: null, to: null, off: false }) };
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
          `<button class="tg-off" data-off="${key}" title="vrije dag">🚫</button>` +
          `<button class="tg-clear" data-clear="${key}" title="wissen">✕</button>` +
        `</div>`;
      container.appendChild(head);
    });

    const cells = [];
    for (let s = 0; s < nSlots; s++) {
      container.appendChild(el('div', 'tg-time', hourLabel(start + s)));
      DAY_KEYS.forEach((key) => {
        const wknd = key === 'sat' || key === 'sun';
        const cell = el('div', 'tg-cell' + (wknd ? ' tg-wknd' : ''));
        cell.dataset.day = key; cell.dataset.slot = String(s);
        container.appendChild(cell);
        cells.push(cell);
      });
    }

    function paint(drag) {
      for (const cell of cells) {
        const key = cell.dataset.day, slot = +cell.dataset.slot;
        const day = days[key];
        let on = false, off = false;
        if (day.off) {
          off = true;
        } else if (drag && drag.dayKey === key) {
          const a = Math.min(drag.startSlot, drag.curSlot), b = Math.max(drag.startSlot, drag.curSlot);
          on = slot >= a && slot <= b;
        } else {
          const r = dayToSlots(day, start);
          on = r && slot >= r.a && slot <= r.b;
        }
        cell.classList.toggle('on', on);
        cell.classList.toggle('off', off);
      }
      updateHeaders(drag);
    }
    function updateHeaders(drag) {
      DAY_KEYS.forEach((key) => {
        const span = container.querySelector(`[data-range="${key}"]`);
        const day = days[key];
        let txt = '';
        if (day.off) txt = '🚫 vrij';
        else if (drag && drag.dayKey === key) {
          const a = Math.min(drag.startSlot, drag.curSlot), b = Math.max(drag.startSlot, drag.curSlot);
          txt = `${hourLabel(start + a)}–${hourLabel(start + b + 1)}`;
        } else if (day.available) txt = `${day.from}–${day.to}`;
        span.textContent = txt;
        const head = span.parentElement;
        head.classList.toggle('has', !!day.available && !day.off);
        head.classList.toggle('isoff', !!day.off);
      });
    }

    let drag = null;
    function cellAt(x, y) { const node = document.elementFromPoint(x, y); return node && node.closest ? node.closest('.tg-cell') : null; }
    container.addEventListener('pointerdown', (e) => {
      const cell = e.target.closest && e.target.closest('.tg-cell');
      if (!cell) return;
      e.preventDefault();
      const key = cell.dataset.day;
      if (days[key].off) days[key].off = false; // slepen heft 'vrij' op
      drag = { dayKey: key, startSlot: +cell.dataset.slot, curSlot: +cell.dataset.slot };
      try { container.setPointerCapture(e.pointerId); } catch (_) {}
      paint(drag);
    });
    container.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cell = cellAt(e.clientX, e.clientY);
      if (cell && cell.dataset.day === drag.dayKey) { drag.curSlot = +cell.dataset.slot; paint(drag); }
    });
    function commit() {
      if (!drag) return;
      const a = Math.min(drag.startSlot, drag.curSlot), b = Math.max(drag.startSlot, drag.curSlot);
      const day = days[drag.dayKey];
      day.available = true; day.off = false;
      day.from = hourLabel(start + a); day.to = hourLabel(start + b + 1);
      drag = null; paint(null); onChange();
    }
    container.addEventListener('pointerup', commit);
    container.addEventListener('pointercancel', commit);

    container.addEventListener('click', (e) => {
      const offBtn = e.target.closest && e.target.closest('.tg-off');
      const clrBtn = e.target.closest && e.target.closest('.tg-clear');
      if (offBtn) {
        const key = offBtn.dataset.off;
        const wasOff = days[key].off;
        days[key] = { available: false, from: null, to: null, off: !wasOff };
        paint(null); onChange();
      } else if (clrBtn) {
        const key = clrBtn.dataset.clear;
        days[key] = { available: false, from: null, to: null, off: false };
        paint(null); onChange();
      }
    });

    paint(null);
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
