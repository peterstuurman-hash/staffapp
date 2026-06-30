/**
 * BeschikbaarheidV2 — opt-out beschikbaarheid (mobiel).
 *
 * Eén scherm, in-memory state, geen backend. UX = opt-out: elke dag staat
 * standaard "Hele dag" beschikbaar; de medewerker haalt eraf wat niet kan.
 * Drielaagse interactie: 75% niets doen → bevestig · ~20% één chip → één rand ·
 * ~5% bewerken via de tijdbalk.
 *
 * Gebruik:  import Beschikbaarheid from './BeschikbaarheidV2';
 *           <Beschikbaarheid />
 *
 * Koppelen aan de DB = later alleen een POST van serializeWeek(week, weekNr).
 */
import React, { useState, useRef, useCallback } from 'react';

/* ====== Constanten & datamodel ====== */
const DAY_START = 7, DAY_END = 25, SPAN = DAY_END - DAY_START; // tijd-as 07:00–01:00
const TIP = 17; // kantelpunt (geaggregeerd; maak per locatie configureerbaar vóór uitrol)
const DAY_KEYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
const DAY_SHORT = { ma: 'MA', di: 'DI', wo: 'WO', do: 'DO', vr: 'VR', za: 'ZA', zo: 'ZO' };
const DAY_LONG = { ma: 'Maandag', di: 'Dinsdag', wo: 'Woensdag', do: 'Donderdag', vr: 'Vrijdag', za: 'Zaterdag', zo: 'Zondag' };
const WEEK_NR = 29;
const WEEK_MONDAY = new Date(2026, 6, 13); // ma 13 juli 2026 = week 29

const T = {
  paper: '#FBFAF7', ink: '#14201C', green: '#138A60', card: '#FFFFFF', inkSoft: '#5C6A63',
  greenFill: '#DCF0E6', line: '#E7E4DD', muteInk: '#9AA39C', greenLine: '#A7DCC4',
  mute: '#EEECE6', ember: '#E0651E', emberFill: '#FBE7D6', emberLine: '#F3C19B',
};

const newDay = () => ({ start: 7, end: 25, off: false }); // opt-out default
const initWeek = () => DAY_KEYS.reduce((w, k) => (w[k] = newDay(), w), {});

/* ====== Tijd-helpers ====== */
export function fmt(h) {
  if (h === 24) return '00:00';
  if (h === 25) return '01:00';
  let hr = Math.floor(h);
  const mn = (h - hr) === 0.5 ? '30' : '00';
  if (hr >= 24) hr -= 24;
  return String(hr).padStart(2, '0') + ':' + mn;
}
export function windowLabel(w) {
  if (w.off) return 'Niet beschikbaar';
  const s7 = w.start === 7, e25 = w.end === 25;
  if (s7 && e25) return 'Hele dag';
  if (s7) return 'tot ' + fmt(w.end);
  if (e25) return 'vanaf ' + fmt(w.start);
  return fmt(w.start) + ' – ' + fmt(w.end);
}
const isHeleDag = w => !w.off && w.start === 7 && w.end === 25;
const isTot = w => !w.off && w.start === 7 && w.end === TIP;
const isVanaf = w => !w.off && w.start === TIP && w.end === 25;
const isCustom = w => !w.off && !isHeleDag(w) && !isTot(w) && !isVanaf(w);

function dateOf(i, weekNr = WEEK_NR) {
  const d = new Date(WEEK_MONDAY);
  d.setDate(d.getDate() + (weekNr - WEEK_NR) * 7 + i);
  return d;
}
const ddmm = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ====== DB-payload (§7) ====== */
export function serializeWeek(week, weekNr) {
  return DAY_KEYS.map((k, i) => {
    const w = week[k];
    return {
      date: iso(dateOf(i, weekNr)),
      available: !w.off,
      start: w.off ? null : (w.start === 7 ? null : fmt(w.start)),
      end: w.off ? null : (w.end === 25 ? null : fmt(w.end)),
    };
  });
}

/* ====== Sleepbare tijdbalk ====== */
function TimeBar({ win, onChange }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const pct = h => ((h - DAY_START) / SPAN) * 100;
  const hourFromX = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    let frac = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    let h = Math.round((DAY_START + frac * SPAN) * 2) / 2; // snap 0.5
    return Math.max(DAY_START, Math.min(DAY_END, h));
  };
  const down = (which) => (e) => {
    e.preventDefault();
    dragRef.current = which;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const move = (e) => {
    if (!dragRef.current) return;
    const h = hourFromX(e.clientX);
    if (dragRef.current === 'start') onChange({ start: Math.min(h, win.end - 0.5) });
    else onChange({ end: Math.max(h, win.start + 0.5) });
  };
  const up = () => { dragRef.current = null; };
  const handleStyle = (h) => ({
    position: 'absolute', top: '50%', left: pct(h) + '%', transform: 'translate(-50%,-50%)',
    width: 26, height: 26, borderRadius: '50%', background: '#fff', border: `3px solid ${T.green}`,
    boxShadow: '0 2px 6px rgba(0,0,0,.18)', cursor: 'grab', touchAction: 'none',
  });
  const hit = { position: 'absolute', inset: -12, borderRadius: '50%' };

  return (
    <div style={{ marginTop: 6 }}>
      <div ref={trackRef} style={{ position: 'relative', height: 30, background: T.mute, borderRadius: 14, touchAction: 'none' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(win.start) + '%', width: (pct(win.end) - pct(win.start)) + '%', background: T.greenFill, border: `1px solid ${T.greenLine}`, borderRadius: 14 }} />
        <div style={handleStyle(win.start)} onPointerDown={down('start')} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><span style={hit} /></div>
        <div style={handleStyle(win.end)} onPointerDown={down('end')} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><span style={hit} /></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.muteInk, marginTop: 4 }}>
        <span>07:00</span><span>17:00</span><span>sluit</span>
      </div>
    </div>
  );
}

function Stepper({ label, value, onMinus, onPlus }) {
  const btn = { width: 44, height: 44, borderRadius: 12, border: `1px solid ${T.line}`, background: '#fff', fontSize: 20, fontWeight: 700, color: T.ink, cursor: 'pointer' };
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <button style={btn} onClick={onMinus}>−</button>
        <div style={{ minWidth: 64, fontSize: 18, fontWeight: 600, fontFamily: 'Fraunces, serif' }}>{fmt(value)}</div>
        <button style={btn} onClick={onPlus}>+</button>
      </div>
    </div>
  );
}

/* ====== Hoofd-component ====== */
export default function Beschikbaarheid() {
  const [week, setWeek] = useState(initWeek);
  const [active, setActive] = useState('za');
  const [editOpen, setEditOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [toast, setToast] = useState(null);
  const [hookDone, setHookDone] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const patchDay = useCallback((key, patch) => {
    setWeek(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    setConfirmed(false); // elke wijziging reset de bevestigd-state
  }, []);
  const setWindow = (key, start, end) => patchDay(key, { start, end, off: false });

  const win = week[active];
  const nonOff = DAY_KEYS.filter(k => !week[k].off).length;
  const eveningCount = DAY_KEYS.filter(k => { const w = week[k]; return !w.off && w.end === 25 && w.start >= 12; }).length;
  const hookVisible = !hookDone && !(week.do.start === TIP && week.do.end === 25 && !week.do.off);

  const selectDay = (key) => { setActive(key); setEditOpen(false); };
  const kanNiet = () => { patchDay(active, { off: true }); setEditOpen(false); };
  const toggleEdit = () => { if (win.off) return; setEditOpen(o => !o); };
  const springBij = () => { setWindow('do', TIP, 25); setActive('do'); setHookDone(true); };
  const bevestig = () => { setConfirmed(true); showToast('Week ' + WEEK_NR + ' bevestigd ✓'); console.log('serializeWeek →', serializeWeek(week, WEEK_NR)); };

  const wrap = { maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: T.paper, padding: '18px 16px 28px', fontFamily: 'Inter, system-ui, sans-serif', color: T.ink };
  const card = { background: T.card, border: `1px solid ${T.line}`, borderRadius: 22, padding: 16, marginBottom: 14 };
  const fr = { fontFamily: 'Fraunces, serif', fontWeight: 600 };
  const chip = (on) => ({ flex: 1, minHeight: 46, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, border: `1.5px solid ${on ? T.greenLine : T.line}`, background: on ? T.greenFill : '#fff', color: on ? T.green : T.ink, transition: 'background .15s, border-color .15s' });
  const rowBtn = (accent) => ({ flex: 1, minHeight: 46, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, border: `1.5px solid ${accent ? T.greenLine : T.line}`, background: '#fff', color: accent ? T.green : T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 });

  return (
    <div style={wrap}>
      {/* 1. Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ ...fr, margin: 0, fontSize: 30 }}>Beschikbaarheid</h1>
          <span style={{ ...fr, fontSize: 15, color: T.inkSoft }}>Week {WEEK_NR} · 13–19 jul</span>
        </div>
        <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 4 }}>Je staat de hele week beschikbaar. Pas aan wat niet klopt.</div>
      </div>

      {/* 2. LastigeDienstHook */}
      {hookVisible && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.emberFill, border: `1px solid ${T.emberLine}`, borderRadius: 16, padding: '12px 14px', marginBottom: 14 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.ember, flex: '0 0 auto' }} />
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: T.ember }}>Donderdagavond — {eveningCount} van 4 ingevuld</div>
          <button onClick={springBij} style={{ border: 'none', background: T.ember, color: '#fff', borderRadius: 10, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' }}>Spring bij</button>
        </div>
      )}

      {/* 3. WeekStrip */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {DAY_KEYS.map((k) => {
          const w = week[k], on = k === active;
          const pStart = ((w.start - DAY_START) / SPAN) * 100, pW = ((w.end - w.start) / SPAN) * 100;
          return (
            <button key={k} onClick={() => selectDay(k)} style={{ flex: 1, minWidth: 0, cursor: 'pointer', background: '#fff', padding: '8px 0 7px', border: `${on ? 2 : 1}px solid ${on ? T.ink : T.line}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: w.off ? T.muteInk : T.ink }}>{DAY_SHORT[k]}</span>
              <span style={{ position: 'relative', width: '78%', height: 5, borderRadius: 999, background: T.mute, overflow: 'hidden' }}>
                {!w.off && <span style={{ position: 'absolute', left: pStart + '%', width: pW + '%', top: 0, bottom: 0, background: T.green, borderRadius: 999 }} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. DagKaart */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ ...fr, fontSize: 20 }}>{DAY_LONG[active]} {ddmm(dateOf(DAY_KEYS.indexOf(active)))}</div>
          <div style={{ fontWeight: 700, color: win.off ? T.muteInk : T.green }}>{windowLabel(win)}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={chip(isHeleDag(win))} onClick={() => setWindow(active, 7, 25)}>Hele dag</button>
          <button style={chip(isTot(win))} onClick={() => setWindow(active, 7, TIP)}>tot 17:00</button>
          <button style={chip(isVanaf(win))} onClick={() => setWindow(active, TIP, 25)}>vanaf 17:00</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={rowBtn(false)} onClick={kanNiet}>✕ Kan niet</button>
          <button style={rowBtn(isCustom(win))} onClick={toggleEdit} disabled={win.off}>
            {isCustom(win) ? 'Aangepast' : 'Bewerk tijden'} {editOpen ? '⌃' : '⌄'}
          </button>
        </div>

        <div style={{ maxHeight: (editOpen && !win.off) ? 240 : 0, overflow: 'hidden', transition: 'max-height .25s ease' }}>
          <div style={{ paddingTop: 14 }}>
            <TimeBar win={win} onChange={(patch) => patchDay(active, { ...patch, off: false })} />
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <Stepper label="Begin" value={win.start}
                onMinus={() => patchDay(active, { start: Math.max(7, win.start - 0.5), off: false })}
                onPlus={() => patchDay(active, { start: Math.min(win.end - 0.5, win.start + 0.5), off: false })} />
              <Stepper label="Einde" value={win.end}
                onMinus={() => patchDay(active, { end: Math.max(win.start + 0.5, win.end - 0.5), off: false })}
                onPlus={() => patchDay(active, { end: Math.min(25, win.end + 0.5), off: false })} />
            </div>
            <div style={{ fontSize: 12, color: T.muteInk, marginTop: 10 }}>Sleep of tik. De planner krijgt exact deze tijden.</div>
          </div>
        </div>
      </div>

      {/* 5. OptOutMeter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.greenFill, border: `1px solid ${T.greenLine}`, borderRadius: 14, padding: '11px 14px', marginBottom: 14 }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: T.green, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>✓</span>
        <span style={{ fontWeight: 700, color: '#0f6e4d' }}>{nonOff}/7 dagen staan klaar in de database</span>
      </div>

      {/* 6. BevestigKnop */}
      <button onClick={bevestig} style={{ width: '100%', minHeight: 52, borderRadius: 14, cursor: 'pointer', border: 'none', background: confirmed ? '#0f6e4d' : T.green, color: '#fff', fontWeight: 700, fontSize: 17 }}>
        {confirmed ? '✓ Week ' + WEEK_NR + ' bevestigd' : 'Bevestig week ' + WEEK_NR}
      </button>

      <div style={{ textAlign: 'center', fontSize: 12, color: T.muteInk, marginTop: 14 }}>
        75% tikt niets aan — die staan al goed. De rest verzet één rand.
      </div>

      {/* 7. Toast */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', background: T.ink, color: '#fff', padding: '11px 18px', borderRadius: 999, fontWeight: 700, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>{toast}</div>
      )}
    </div>
  );
}
