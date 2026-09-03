import { Icon, IC } from "../ui/Icon.jsx";
import { Field, Pill } from "../ui/atoms.jsx";
import { Combo } from "../ui/Combo.jsx";
import { DateField } from "../ui/DateField.jsx";
import { SemesterFields, CourseList, RegDocs } from "./semesterFields.jsx";
import { num, digitsOnly, toLatinDigits } from "../lib/num.js";
import { makeRef } from "../lib/refs.js";
import { semValidate } from "../data/semester.js";
import { BANK_COUNTRIES } from "../data/bank.js";
import { DOC_TYPES } from "../data/documents.js";

export const P3_STEPS = [
  {
    titleKey: "p3.s1.title", subKey: "p3.s1.sub",
    validate: d => { const e = []; if (!d.addr) e.push("addr"); if (!d.phone) e.push("phone"); return e; },
    render: ({ t, data, setData, errors }) => (
      <>
        <Field label={t("p3.s1.addr")} required error={errors.includes("addr")} hint={t("err.required")}>
          <input value={data.addr || ""} onChange={e => setData({ ...data, addr: e.target.value })} placeholder={t("p3.s1.addr.ph")} />
        </Field>
        <Field label={t("p3.s1.phone")} required error={errors.includes("phone")} hint={t("err.required")}>
          <input value={data.phone || ""} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="+1 …" dir="ltr" style={{ textAlign: "start" }} inputMode="tel" />
        </Field>
        <div className="rq-row2">
          <Field label={t("p3.s1.emname")}>
            <input value={data.emName || ""} onChange={e => setData({ ...data, emName: e.target.value })} />
          </Field>
          <Field label={t("p3.s1.emphone")}>
            <input value={data.emPhone || ""} onChange={e => setData({ ...data, emPhone: e.target.value })} dir="ltr" style={{ textAlign: "start" }} inputMode="tel" />
          </Field>
        </div>
      </>
    ),
  },
  {
    titleKey: "p3.s2.title", subKey: "p3.s2.sub",
    validate: d => {
      const e = []; if (!d.bankName) e.push("bankName");
      const c = BANK_COUNTRIES.find(x => x.code === (d.bankCountry || "US"));
      if (c.scheme === "US") { if (!/^\d{9}$/.test(d.routing || "")) e.push("routing"); if (!d.acct) e.push("acct"); }
      else if (c.scheme === "IBAN") { if (!d.iban || d.iban.replace(/\s/g, "").length < 10) e.push("iban"); }
      else { if (!d.acct) e.push("acct"); }
      return e;
    },
    render: ({ t, lang, data, setData, errors }) => {
      const cc = data.bankCountry || "US";
      const scheme = BANK_COUNTRIES.find(x => x.code === cc).scheme;
      return (
        <>
          <Field label={t("p3.s2.country")}>
            {/* value = stable ISO code; label = translated (handoff rule 4) */}
            <Combo value={cc} placeholder={t("p2.s1.country.ph")} emptyText={t("list.nomatch")}
              options={BANK_COUNTRIES.map(c => ({ v: c.code, label: lang === "ar" ? c.ar : c.en,
                sub: lang === "ar" ? c.en : c.ar, hay: (c.en + " " + c.ar + " " + c.code).toLowerCase() }))}
              onPick={code => setData({ ...data, bankCountry: code })} />
          </Field>
          <Field label={t("p3.s2.bank")} required error={errors.includes("bankName")} hint={t("err.required")}>
            <input value={data.bankName || ""} onChange={e => setData({ ...data, bankName: e.target.value })} placeholder={t("p3.s2.bank.ph")} />
          </Field>
          {scheme === "US" && (
            <div className="rq-row2">
              <Field label={t("p3.s2.routing")} required error={errors.includes("routing")} hint={t("err.required")}>
                <input value={data.routing || ""} onChange={e => setData({ ...data, routing: digitsOnly(e.target.value, 9) })} placeholder={t("p3.s2.routing.ph")} inputMode="numeric" dir="ltr" style={{ textAlign: "start" }} />
              </Field>
              <Field label={t("p3.s2.acct")} required error={errors.includes("acct")} hint={t("err.required")}>
                <input value={data.acct || ""} onChange={e => setData({ ...data, acct: toLatinDigits(e.target.value) })} dir="ltr" style={{ textAlign: "start" }} />
              </Field>
            </div>
          )}
          {scheme === "IBAN" && (
            <Field label={t("p3.s2.iban")} required error={errors.includes("iban")} hint={t("err.required")}>
              <input value={data.iban || ""} onChange={e => setData({ ...data, iban: toLatinDigits(e.target.value) })} placeholder="GB29 NWBK 6016 1331 9268 19" dir="ltr" style={{ textAlign: "start" }} />
            </Field>
          )}
          {scheme === "OTHER" && (
            <Field label={t("p3.s2.acct")} required error={errors.includes("acct")} hint={t("err.required")}>
              <input value={data.acct || ""} onChange={e => setData({ ...data, acct: toLatinDigits(e.target.value) })} dir="ltr" style={{ textAlign: "start" }} />
            </Field>
          )}
        </>
      );
    },
  },
  {
    titleKey: "p3.s3.title", subKey: "p3.s3.sub",
    validate: d => {
      const e = semValidate(d);
      if (!(d.courses || []).length || (d.courses || []).some(c => !c.name)) e.push("courses");
      return e;
    },
    render: ({ t, lang, data, setData, errors, ctx }) => {
      return (
        <>
          {data.inheritedFrom && (
            <div className="rq-item" style={{ marginBlockEnd: 14 }}>
              <Icon d={IC.check} size={18} />
              <div className="ib2">
                <div className="t">{t("p3.s3.inherited")}</div>
                <div className="d">{t((data.courses || []).length ? "p3.s3.inherited.d" : "p3.s3.inherited.none")}</div>
              </div>
              <Pill tone="green">{ctx.semLabel}</Pill>
            </div>
          )}
          <SemesterFields t={t} lang={lang} data={data} setData={setData} errors={errors} />
          <CourseList t={t} lang={lang} data={data} setData={setData} errors={errors} />
          <RegDocs t={t} data={data} setData={setData} />
        </>
      );
    },
  },
  {
    titleKey: "p3.s4.title", subKey: "p3.s4.sub",
    /* Same rule as the academic phase: request now, issued only when the whole
       phase is approved — the schedule confirmed on arrival is what it covers. */
    validate: d => (d.fgRequested ? [] : ["fg"]),
    errToast: "err.requestfg",
    render: ({ t, data, setData, ctx }) => {
      const requested = !!data.fgRequested;
      const issued = ctx.fgIssued(data.fgRef);
      return (
        <>
          <div className="rq-item" style={{ marginBlockEnd: 12 }}>
            <Icon d={IC.cap} size={20} />
            <div className="ib2"><div className="t">{t("p3.s4.fg.title")}</div><div className="d">{t("p3.s4.fg.body")}</div></div>
          </div>
          {!requested && (
            <button type="button" className="rq-btn rq-primary" style={{ marginBlockStart: 12 }}
              onClick={() => setData({ ...data, fgRequested: true, fgRef: makeRef(DOC_TYPES.fgAcademic.code) })}>
              <Icon d={IC.seal} size={15} />{t("pa.s3.request")}
            </button>
          )}
          {requested && (
            <div className="rq-item" style={{ display: "block", marginBlockStart: 12 }}>
              <div className="rq-reqno">
                <span className="k">{t("ref.no")}</span>
                <b className="mono" dir="ltr">{data.fgRef}</b>
                <Pill tone={issued ? "green" : "amber"}>{t(issued ? "status.approved" : "status.review")}</Pill>
              </div>
              <div className="t">{t(issued ? "pa.s3.issued.title" : "pa.s3.pending.title")}</div>
              <div className="d" style={{ marginBlockStart: 5 }}>{t(issued ? "pa.s3.issued.body" : "pa.s3.pending.body")}</div>
              {issued && (
                <button type="button" className="rq-btn rq-ghost" style={{ marginBlockStart: 12 }} onClick={ctx.openFiles}>
                  <Icon d={IC.doc} size={15} />{t("files.open")}
                </button>
              )}
            </div>
          )}
        </>
      );
    },
  },
];
