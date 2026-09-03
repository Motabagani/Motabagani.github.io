import { Icon, IC } from "../ui/Icon.jsx";
import { Field, Pill } from "../ui/atoms.jsx";
import { SemesterFields, CourseList, RegDocs } from "./semesterFields.jsx";
import { makeRef } from "../lib/refs.js";
import { semValidate } from "../data/semester.js";
import { DOC_TYPES } from "../data/documents.js";

export const PA_STEPS = [
  {
    titleKey: "pa.s1.title", subKey: "pa.s1.sub",
    validate: semValidate,
    render: ({ t, lang, data, setData, errors, ctx }) => (
      <>
        <SemesterFields t={t} lang={lang} data={data} setData={setData} errors={errors} />
        <p className="rq-stub-note">{t("pa.s1.note")}</p>
      </>
    ),
  },
  {
    titleKey: "pa.s2.title", subKey: "pa.s2.sub",
    validate: d => (d.coursesLater || ((d.courses || []).length && (d.courses || []).every(c => c.done)) ? [] : ["courses"]),
    errToast: "err.finishcourses",
    render: ({ t, lang, data, setData, errors }) => (
      <>
        <label className={"rq-agree" + (data.coursesLater ? " on" : "")} style={{ marginBlockEnd: 14 }}>
          <input type="checkbox" checked={!!data.coursesLater}
            onChange={e => setData({ ...data, coursesLater: e.target.checked })} />
          {t("pa.s2.later")}
        </label>
        {!data.coursesLater && <CourseList t={t} lang={lang} data={data} setData={setData} errors={errors} />}
        {data.coursesLater && <p className="rq-callout">{t("pa.s2.later.note")}</p>}
        <RegDocs t={t} data={data} setData={setData} />
      </>
    ),
  },
  {
    titleKey: "pa.s3.title", subKey: "pa.s3.sub",
    /* The guarantee is the outcome of the whole phase: you request it here, and
       it is issued into Files when the mission approves the phase. */
    validate: d => (d.coursesLater || d.fgRequested ? [] : ["fg"]),
    errToast: "err.requestfg",
    render: ({ t, data, setData, ctx }) => {
      const coursesReady = (data.courses || []).length && (data.courses || []).every(c => c.done);
      const requested = !!data.fgRequested;
      const issued = ctx.fgIssued(data.fgRef);

      if (!coursesReady) {
        return (
          <>
            <div className="rq-item pending" style={{ marginBlockEnd: 12 }}>
              <Icon d={IC.clock} size={20} />
              <div className="ib2"><div className="t">{t("pa.s3.hold.title")}</div>
                <div className="d">{t(data.coursesLater ? "pa.s3.hold.body" : "pa.s3.hold.unconfirmed")}</div></div>
              <Pill tone="amber">{t("status.pending")}</Pill>
            </div>
            <p className="rq-callout">{t("pa.s3.hold.why")}</p>
            <p className="rq-stub-note">{t(data.coursesLater ? "pa.s3.hold.next" : "pa.s3.hold.next2")}</p>
          </>
        );
      }

      return (
        <>
          <div className="rq-item" style={{ marginBlockEnd: 12 }}>
            <Icon d={IC.cap} size={20} />
            <div className="ib2"><div className="t">{t("pa.s3.fg.title")}</div><div className="d">{t("pa.s3.fg.body")}</div></div>
          </div>
          <p className="rq-stub-note">{t("pa.s3.online")}</p>

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
