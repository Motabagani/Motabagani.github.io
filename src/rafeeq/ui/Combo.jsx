import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "./Icon.jsx";
import { AIRPORTS, cityLabel, aptLabel, aptByCode, VISA_GROUPS, CITY_AR } from "../data/airports.js";
import { COUNTRIES, cLabel, COUNTRY_AR } from "../data/countries.js";
import { MAJORS } from "../data/domain.js";

export function Combo({ options, value, onPick, placeholder, disabled, invalid, allowFree, emptyText, maxRows = 60 }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef(null);
  const inRef = useRef(null);

  const sel = options.find(o => o.v === value);
  const query = q.trim().toLowerCase();
  const res = (query ? options.filter(o => o.hay.includes(query)) : options).slice(0, maxRows);

  useEffect(() => { setHi(0); }, [q, open]);
  useEffect(() => {
    if (!open || !boxRef.current) return;
    const el = boxRef.current.querySelector('[data-hi="1"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const choose = (o) => { onPick(o.v, o); setQ(""); setOpen(false); };
  /* Caret toggles the list. preventDefault stops the browser moving focus,
     which matters both ways: closing must not blur (the blur timer would race)
     and opening must not fire onFocus a second time (that would re-open what we
     just closed). Focus is only pushed when opening from a cold state. */
  const toggle = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (open) { setOpen(false); return; }
    setQ("");
    setOpen(true);
    if (inRef.current && document.activeElement !== inRef.current) inRef.current.focus();
  };
  const onKey = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) { setOpen(true); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => Math.min(h + 1, res.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (res[hi]) choose(res[hi]);
      else if (allowFree && q.trim()) { onPick(q.trim(), null); setOpen(false); }
    } else if (e.key === "Escape") { setOpen(false); }
  };

  let lastGroup = null;
  return (
    <div className="rq-combo">
      <input ref={inRef} value={open ? q : (sel ? sel.label : (allowFree ? (value || "") : ""))}
        disabled={disabled} className={invalid ? "err" : ""} placeholder={placeholder}
        autoComplete="off" role="combobox" aria-expanded={open}
        onFocus={() => { setQ(""); setOpen(true); }}
        onClick={() => { if (!open) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => { setQ(e.target.value); setOpen(true); if (allowFree) onPick(e.target.value, null); }}
        onKeyDown={onKey} />
      <button type="button" className={"rq-combo-caret" + (open ? " open" : "")} tabIndex={-1}
        aria-label="toggle" disabled={disabled} onMouseDown={toggle}>
        <Icon d='<path d="M6 9l6 6 6-6"/>' size={15} />
      </button>
      {open && (
        <div className="rq-combo-list" ref={boxRef}>
          {res.length ? res.map((o, n) => {
            const head = o.group && o.group !== lastGroup ? (lastGroup = o.group) : null;
            return (
              <React.Fragment key={o.v + "|" + n}>
                {head && <div className="rq-combo-grp">{head}</div>}
                <div className={"rq-combo-opt" + (n === hi ? " hi" : "")} data-hi={n === hi ? "1" : "0"}
                  onMouseEnter={() => setHi(n)} onMouseDown={() => choose(o)}>
                  {o.tag && <b className="tag" dir="ltr">{o.tag}</b>}
                  <span className="lbl">{o.label}</span>
                  {o.sub && <span className="sub">{o.sub}</span>}
                </div>
              </React.Fragment>
            );
          }) : <div className="rq-combo-opt none">{emptyText}</div>}
        </div>
      )}
    </div>
  );
}

/* Option builders — each folds both languages into `hay`. */
export const optAirports = (lang) => AIRPORTS.map(a => ({
  v: a.i, label: cityLabel(a, lang) + " (" + a.i + ")", sub: "— " + a.n, tag: a.i,
  hay: (a.i + " " + a.c + " " + a.n + " " + a.k + " " + (CITY_AR[a.c] || "") + " " + (COUNTRY_AR[a.k] || "")).toLowerCase(),
}));
export const optCountries = (lang) => COUNTRIES.map(c => ({
  v: c, label: cLabel(c, lang), sub: lang === "ar" ? c : (COUNTRY_AR[c] || ""),
  hay: (c + " " + (COUNTRY_AR[c] || "")).toLowerCase(),
}));
export const optVisaTypes = (lang) => {
  const out = [];
  VISA_GROUPS.forEach(g => g.items.forEach((en, k) => out.push({
    v: g.grp + "|" + k, label: lang === "ar" ? g.arItems[k] : en,
    group: lang === "ar" ? g.ar : g.grp,
    hay: (g.grp + " " + g.ar + " " + en + " " + g.arItems[k]).toLowerCase(),
  })));
  return out;
};
export const optMajors = (lang) => MAJORS.map(m => ({
  v: m.en, label: lang === "ar" ? m.ar : m.en, sub: lang === "ar" ? m.en : m.ar,
  hay: (m.en + " " + m.ar).toLowerCase(),
}));

/* Airport field — thin wrapper over Combo. */
export function AirportPicker({ value, onPick, placeholder, disabled, invalid, lang, emptyText }) {
  const opts = useMemo(() => optAirports(lang), [lang]);
  return <Combo options={opts} value={value} placeholder={placeholder} disabled={disabled}
    invalid={invalid} emptyText={emptyText}
    onPick={(v) => { const a = aptByCode(v); if (a) onPick(a); }} />;
}
