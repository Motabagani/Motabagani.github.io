import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon.jsx";
import { num } from "../lib/num.js";
import { MONTHS_EN, MONTHS_AR, WD_EN, WD_AR, isoOf, parseIso, isoToDmy, maskDmy, dmyToIso, fmtDate } from "../lib/dates.js";

export function DateField({ value, onChange, lang, min, max, disabled, invalid, placeholder }) {
  const today = new Date();
  const todayIso = isoOf(today.getFullYear(), today.getMonth(), today.getDate());
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => isoToDmy(value));
  const [bad, setBad] = useState(false);
  const [cursor, setCursor] = useState(value || todayIso);
  const [view, setView] = useState(() => {
    const p = parseIso(value); return p ? { y: p.y, m: p.m } : { y: today.getFullYear(), m: today.getMonth() };
  });
  const wrapRef = useRef(null);
  const [up, setUp] = useState(false);
  const rtl = lang === "ar";

  /* keep the text box in sync when the value changes from outside */
  useEffect(() => { setText(isoToDmy(value)); setBad(false); if (value) setCursor(value); }, [value]);

  /* click anywhere outside closes the calendar */
  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  useEffect(() => { const p = parseIso(cursor); if (p && open) setView({ y: p.y, m: p.m }); }, [cursor, open]);

  /* open upward near the bottom of the window so the grid is never clipped */
  useEffect(() => {
    if (!open || !wrapRef.current || typeof window === "undefined") return;
    const r = wrapRef.current.getBoundingClientRect();
    setUp(r.bottom + 348 > window.innerHeight && r.top > 348);
  }, [open]);

  const blocked = (iso) => (min && iso < min) || (max && iso > max);
  const shiftMonth = (n) => { let m = view.m + n, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); };
  const shiftYear  = (n) => setView(v => ({ ...v, y: v.y + n }));

  const commit = (raw) => {
    const s = raw.trim();
    if (!s) { setBad(false); onChange(""); return; }
    const iso = dmyToIso(s);
    if (!iso || blocked(iso)) { setBad(true); return; }
    setBad(false); onChange(iso); setCursor(iso);
  };

  const moveCursor = (days) => {
    const p = parseIso(cursor) || parseIso(todayIso);
    const d = new Date(p.y, p.m, p.d + days);
    setCursor(isoOf(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const onFieldKey = (e) => {
    if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); return; }
    if (e.key === "Enter") { e.preventDefault(); commit(text); setOpen(false); return; }
    if (e.key === "Escape") { setOpen(false); return; }
    if (!open) return;
    const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step !== undefined) { e.preventDefault(); moveCursor(step); }
    else if (e.key === "PageUp") { e.preventDefault(); shiftMonth(-1); }
    else if (e.key === "PageDown") { e.preventDefault(); shiftMonth(1); }
  };

  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let n = 0; n < new Date(view.y, view.m, 1).getDay(); n++) cells.push(null);
  for (let d = 1; d <= daysIn(view.y, view.m); d++) cells.push(d);

  /* Year dropdown range. It must cover the bounds (a birth date reaches decades
     back; an expiry runs years ahead) AND always include the year currently in
     view — otherwise navigating past a fixed window with the chevrons would
     leave the <select> pointing at a year that has no matching option. */
  const curY = today.getFullYear();
  const minY = min ? (parseIso(min) || {}).y : null;
  const maxY = max ? (parseIso(max) || {}).y : null;
  const yLo = Math.min(minY ?? (curY - 100), view.y);
  const yHi = Math.max(maxY ?? (curY + 15), view.y);
  const yearOpts = [];
  for (let y = yLo; y <= yHi; y++) yearOpts.push(y);

  return (
    <div className="rq-date" ref={wrapRef}>
      <div className={"rq-date-box" + (invalid || bad ? " err" : "") + (disabled ? " off" : "")}>
        <input className="rq-date-in" value={text} disabled={disabled} inputMode="numeric" dir="ltr"
          placeholder={placeholder || "DD/MM/YYYY"} aria-invalid={bad || undefined}
          onChange={e => { setText(maskDmy(e.target.value)); setBad(false); }}
          onBlur={() => commit(text)} onKeyDown={onFieldKey}
          onFocus={() => setOpen(true)} />
        {!!text && !disabled && (
          <button type="button" className="rq-date-x" tabIndex={-1} aria-label={rtl ? "مسح" : "Clear"}
            onClick={() => { setText(""); setBad(false); onChange(""); }}>
            <Icon d='<path d="M18 6 6 18M6 6l12 12"/>' size={14} />
          </button>
        )}
        <button type="button" className="rq-date-cal" disabled={disabled} tabIndex={-1}
          aria-label={rtl ? "التقويم" : "Calendar"} onClick={() => setOpen(o => !o)}>
          <Icon d='<path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>' size={15} />
        </button>
      </div>
      {bad && <span className="rq-date-err">{rtl ? "تاريخ غير صالح — الصيغة يوم/شهر/سنة" : "Invalid date — use DD/MM/YYYY"}</span>}

      {open && !disabled && (
        <div className={"rq-cal" + (up ? " up" : "")} role="dialog">
          <div className="rq-cal-hd">
            <button type="button" className="nav" onClick={() => shiftYear(-1)} aria-label="prev year"><Icon d='<path d="M11 18l-6-6 6-6M19 18l-6-6 6-6"/>' size={15} /></button>
            <button type="button" className="nav" onClick={() => shiftMonth(-1)} aria-label="prev month"><Icon d='<path d="M15 18l-6-6 6-6"/>' size={16} /></button>
            <div className="mo">
              <select value={view.m} onChange={e => setView({ ...view, m: +e.target.value })}>
                {(rtl ? MONTHS_AR : MONTHS_EN).map((mn, n) => <option key={n} value={n}>{mn}</option>)}
              </select>
              <select value={view.y} onChange={e => setView({ ...view, y: +e.target.value })}>
                {yearOpts.map(y => <option key={y} value={y}>{rtl ? num(y, "ar") : y}</option>)}
              </select>
            </div>
            <button type="button" className="nav" onClick={() => shiftMonth(1)} aria-label="next month"><Icon d='<path d="M9 18l6-6-6-6"/>' size={16} /></button>
            <button type="button" className="nav" onClick={() => shiftYear(1)} aria-label="next year"><Icon d='<path d="M13 18l6-6-6-6M5 18l6-6-6-6"/>' size={15} /></button>
          </div>
          <div className="rq-cal-wd">{(rtl ? WD_AR : WD_EN).map((w, n) => <span key={n}>{w}</span>)}</div>
          <div className="rq-cal-gd">
            {cells.map((d, n) => {
              if (!d) return <span key={"e" + n} />;
              const iso = isoOf(view.y, view.m, d);
              const off = blocked(iso);
              return (
                <button type="button" key={iso} disabled={off}
                  className={"day" + (value === iso ? " on" : "") + (iso === todayIso ? " today" : "") + (iso === cursor ? " cur" : "") + (off ? " off" : "")}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onChange(iso); setText(isoToDmy(iso)); setBad(false); setOpen(false); }}>
                  {rtl ? num(d, "ar") : d}
                </button>
              );
            })}
          </div>
          <div className="rq-cal-ft">
            <button type="button" className="lnk" disabled={blocked(todayIso)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(todayIso); setText(isoToDmy(todayIso)); setOpen(false); }}>{rtl ? "اليوم" : "Today"}</button>
            <button type="button" className="lnk" onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(""); setText(""); setBad(false); setOpen(false); }}>{rtl ? "مسح" : "Clear"}</button>
            <button type="button" className="lnk end" onMouseDown={e => e.preventDefault()}
              onClick={() => setOpen(false)}>{rtl ? "إغلاق" : "Close"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
