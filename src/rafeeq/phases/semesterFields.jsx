import { Icon, IC } from "../ui/Icon.jsx";
import { Field, Pill } from "../ui/atoms.jsx";
import { DateField } from "../ui/DateField.jsx";
import { num, digitsOnly } from "../lib/num.js";
import { SEM_SYSTEMS, TERM_ORDINALS } from "../data/semester.js";
import { putAttachment, fileName } from "../storage/attachments.js";

export function SemesterFields({ t, lang, data, setData, errors }) {
  const sys = data.semSystem || "semester";
  /* Always four: a year can carry two summer sessions alongside fall and spring. */
  const terms = TERM_ORDINALS;
  const curTerm = data.semTerm && terms.some(x => x.k === data.semTerm) ? data.semTerm : terms[0].k;
  return (
    <>
      <div className="rq-row2">
        <Field label={t("sem.system")}>
          <select value={sys} onChange={e => setData({ ...data, semSystem: e.target.value, semTerm: "1" })}>
            {SEM_SYSTEMS.map(s => <option key={s.k} value={s.k}>{s[lang]}</option>)}
          </select>
        </Field>
        <Field label={t("sem.term")}>
          <select value={curTerm} onChange={e => setData({ ...data, semTerm: e.target.value })}>
            {terms.map(x => <option key={x.k} value={x.k}>{x[lang]}</option>)}
          </select>
        </Field>
      </div>
      <div className="rq-row2">
        <Field label={t("sem.start")} required error={errors.includes("semStart")} hint={t("err.required")}>
          <DateField value={data.semStart || ""} lang={lang} invalid={errors.includes("semStart")}
            onChange={v => setData({ ...data, semStart: v })} />
        </Field>
        <Field label={t("sem.end")} required error={errors.includes("semEnd")} hint={t("err.dateorder")}>
          <DateField value={data.semEnd || ""} lang={lang} min={data.semStart || undefined} invalid={errors.includes("semEnd")}
            onChange={v => setData({ ...data, semEnd: v })} />
        </Field>
      </div>
    </>
  );
}

export function CourseList({ t, lang, data, setData, errors }) {
  const courses = data.courses || [];
  const credits = courses.reduce((s, c) => s + (parseInt(c.credits, 10) || 0), 0);
  const allDone = courses.length > 0 && courses.every(c => c.done);

  const updC = (i, patch) => setData({ ...data, courses: courses.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const addC = () => setData({ ...data, courses: [...courses, { id: Date.now(), name: "", code: "", credits: "" }] });
  /* Editing any course invalidates an approval that was granted on the old list. */
  const delC = (i) => setData({ ...data, courses: courses.filter((_, j) => j !== i), fgRequested: false, fgRef: undefined });
  const touch = (i, patch) => setData({ ...data, courses: courses.map((x, j) => (j === i ? { ...x, ...patch } : x)), fgRequested: false, fgRef: undefined });

  return (
    <>
      <div className="rq-field">
        <label>{t("sem.courses")}{errors.includes("courses") && <span className="req"> — {t("err.required")}</span>}</label>
      </div>

      {!courses.length && <p className="rq-empty">{t("sem.course.empty")}</p>}

      <div className="rq-list">
        {courses.map((c, i) => c.done ? (
          /* collapsed: one line per finished course */
          <div className="rq-course done" key={c.id}>
            <Icon d={IC.check} size={16} />
            <div className="ib2">
              <div className="t">{c.name}</div>
              <div className="d">{[c.code, c.credits && t("sem.course.credits.n", { n: num(c.credits, lang) })].filter(Boolean).join(" · ")}</div>
            </div>
            <button type="button" className="rq-iconbtn" onClick={() => touch(i, { done: false })}
              aria-label={t("sem.course.reopen")} title={t("sem.course.reopen")}>
              <Icon d='<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>' size={15} />
            </button>
            <button type="button" className="rq-iconbtn danger" onClick={() => delC(i)}
              aria-label={t("sem.course.remove")} title={t("sem.course.remove")}>
              <Icon d='<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>' size={15} />
            </button>
          </div>
        ) : (
          /* open: still being filled in */
          <div className="rq-course" key={c.id}>
            <div className="rq-course-hd">
              <span className="n">{t("sem.course.n", { n: num(i + 1, lang) })}</span>
              <button type="button" className="rq-iconbtn danger" onClick={() => delC(i)}
                aria-label={t("sem.course.remove")} title={t("sem.course.remove")}>
                <Icon d='<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>' size={15} />
              </button>
            </div>
            <div className="rq-row2">
              <Field label={t("sem.course.name")}>
                <input value={c.name || ""} onChange={e => touch(i, { name: e.target.value })} placeholder={t("sem.course.name.ph")} />
              </Field>
              <Field label={t("sem.course.code")}>
                <input value={c.code || ""} onChange={e => touch(i, { code: e.target.value })} placeholder="CS-101" dir="ltr" style={{ textAlign: "start" }} />
              </Field>
            </div>
            <div className="rq-row2">
              <Field label={t("sem.course.credits")}>
                <input value={c.credits || ""} onChange={e => touch(i, { credits: digitsOnly(e.target.value, 2) })}
                  inputMode="numeric" maxLength={2} placeholder="3" dir="ltr" style={{ textAlign: "start" }} />
              </Field>
              <div className="rq-course-done">
                <button type="button" className="rq-btn rq-primary" disabled={!(c.name || "").trim()}
                  onClick={() => touch(i, { done: true })}>
                  <Icon d={IC.check} size={15} />{t("sem.course.done")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rq-course-act">
        <button type="button" className="rq-btn rq-ghost" onClick={addC}>
          <Icon d={IC.plus} size={15} />{t("sem.course.add")}
        </button>
        {!!courses.length && <span className="rq-course-sum">{t("sem.course.total", { n: num(courses.length, lang), c: num(credits, lang) })}</span>}
      </div>
      {!!courses.length && !allDone && <p className="rq-stub-note">{t("sem.course.finish")}</p>}
    </>
  );
}

const REG_DOCS = [
  { id: "reg", key: "p3.s3.doc.reg" }, { id: "adm", key: "p3.s3.doc.adm" }, { id: "plan", key: "p3.s3.doc.plan" },
];
export function RegDocs({ t, data, setData }) {
  const docs = data.docs || {};
  return (
    <>
      <div className="rq-field" style={{ marginBlockStart: 16 }}><label>{t("p3.s3.docs")}</label></div>
      <div className="rq-list">
        {REG_DOCS.map(dd => (
          <div className="rq-item" key={dd.id}>
            <Icon d={IC.doc} size={17} />
            <div className="ib2"><div className="t">{t(dd.key)}</div>
              {docs[dd.id] && <div className="d mono" dir="ltr">{fileName(docs[dd.id])}</div>}</div>
            {docs[dd.id]
              ? (<div className="rq-file-acts">
                  <Pill tone="green">{t("p3.s3.doc.attached")}</Pill>
                  <button type="button" className="rq-iconbtn danger" title={t("doc.remove")}
                    aria-label={t("doc.remove")}
                    onClick={() => { const nx = { ...docs }; delete nx[dd.id]; setData({ ...data, docs: nx }); }}>
                    <Icon d='<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>' size={14} />
                  </button>
                </div>)
              : <label className="rq-btn rq-ghost" style={{ padding: "8px 14px", fontSize: 13.5 }}>
                  <Icon d={IC.paperclip} size={15} />{t("p3.s3.doc.attach")}
                  <input type="file" style={{ display: "none" }}
                    onChange={async e => { const f = e.target.files[0]; if (f) setData({ ...data, docs: { ...docs, [dd.id]: await putAttachment(f) } }); }} />
                </label>}
          </div>
        ))}
      </div>
    </>
  );
}
