import { Icon, IC } from "../ui/Icon.jsx";
import { Field, Pill } from "../ui/atoms.jsx";
import { DateField } from "../ui/DateField.jsx";
import { Combo, optCountries } from "../ui/Combo.jsx";
import { num } from "../lib/num.js";
import { isoOf } from "../lib/dates.js";
import { awardSAR, awardLocal, awardBoth, money } from "../lib/money.js";
import { cLabel } from "../data/countries.js";
import { priorLevels, moeHistory } from "../data/academic.js";
import { putAttachment, fileName } from "../storage/attachments.js";

export const P1_STEPS = [
  {
    titleKey: "p1.s1.title", subKey: "p1.s1.sub",
    validate: d => (d.confirmed ? [] : ["confirm"]),
    errToast: "err.confirmfirst",
    render: ({ t, lang, user, data, setData }) => (
      <>
        <div className="rq-rec">
          <div><div className="k">{t("p1.s1.field.name")}</div><div className="v">{user.name[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.program")}</div><div className="v">{user.program[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.uni")}</div><div className="v">{user.university[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.degree")}</div><div className="v">{user.degree[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.term")}</div><div className="v">{user.startTerm[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.stipend")}</div><div className="v mono" dir="ltr">{awardBoth(user)}</div></div>
        </div>
        <label className={"rq-agree" + (data.confirmed ? " on" : "")}>
          <input type="checkbox" checked={!!data.confirmed} onChange={e => setData({ ...data, confirmed: e.target.checked })} />
          {t("p1.s1.confirm")}
        </label>
      </>
    ),
  },
  {
    titleKey: "p1.s2.title", subKey: "p1.s2.sub",
    validate: (d, ctx) => priorLevels(ctx.user).filter(lv => !((d.qualDocs || {})[lv])).map(lv => "qd-" + lv),
    errToast: "err.docrequired",
    render: ({ t, lang, user, data, setData, errors }) => {
      const levels = priorLevels(user);
      const hist = moeHistory(levels);
      const docs = data.qualDocs || {};
      const hsType = hist.hs.type.k;
      const setDoc = (lv, name) => setData({ ...data, qualDocs: { ...docs, [lv]: name } });
      const row = (k, v, mono) => (
        <div><div className="k">{k}</div>
          <div className={"v" + (mono ? " mono" : "")} dir={mono ? "ltr" : undefined}>{v}</div></div>
      );
      return (
        <>
          {levels.map(lv => {
            const rec = hist[lv];
            const outside = lv === "hs" && hsType === "out";
            const instName = lv === "hs" ? rec.inst[lang] : rec.inst[lang];
            return (
              <div key={lv} style={{ marginBlockEnd: 20 }}>
                <div className="rq-field" style={{ marginBlockEnd: 8 }}>
                  <label>{t("p1.s2.lvl." + lv)}</label>
                </div>

                <div className="rq-rec">
                  {lv === "hs" && row(t("p1.s2.hstype"), rec.type[lang])}
                  {row(t("p1.s2.inst"), instName)}
                  {outside && row(t("p1.s2.hscountry"), cLabel(rec.country, lang))}
                  {lv !== "hs" && row(t("p1.s2.major"), rec.major[lang])}
                  {row(t("p1.s2.year"), num(rec.year, lang))}
                  {row(t("p1.s2.gpa"), rec.gpa + " / " + rec.scale, true)}
                </div>

                <div className={"rq-item" + (errors.includes("qd-" + lv) ? " err" : "")}>
                  <Icon d={IC.doc} size={17} />
                  <div className="ib2">
                    <div className="t">{t("p1.s2.doc.of", { lvl: t("p1.s2.lvl." + lv) })}</div>
                    <div className={"d" + (docs[lv] ? " mono" : "")} dir={docs[lv] ? "ltr" : undefined}>
                      {fileName(docs[lv]) || t("p1.s2.doc.ph")}
                    </div>
                  </div>
                  {docs[lv]
                    ? (<div className="rq-file-acts">
                        <Pill tone="green">{t("p3.s3.doc.attached")}</Pill>
                        <button type="button" className="rq-iconbtn danger" title={t("doc.remove")}
                          aria-label={t("doc.remove")} onClick={() => setDoc(lv, null)}>
                          <Icon d='<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>' size={14} />
                        </button>
                      </div>)
                    : <label className="rq-btn rq-ghost" style={{ padding: "8px 14px", fontSize: 13.5 }}>
                        <Icon d={IC.paperclip} size={15} />{t("p3.s3.doc.attach")}
                        <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
                          onChange={async e => { const f = e.target.files[0]; if (f) setDoc(lv, await putAttachment(f)); }} />
                      </label>}
                </div>
              </div>
            );
          })}
          <p className="rq-stub-note">{t("p1.s2.moe")}</p>
        </>
      );
    },
  },
  {
    titleKey: "p1.s3.title", subKey: "p1.s3.sub",
    validate: d => (d.terms ? [] : ["terms"]),
    errToast: "err.agreefirst",
    render: ({ t, data, setData }) => (
      <>
        <div className="rq-terms">
          <h4>{t("p1.s3.t1h")}</h4><p>{t("p1.s3.t1")}</p>
          <h4>{t("p1.s3.t2h")}</h4><p>{t("p1.s3.t2")}</p>
          <h4>{t("p1.s3.t3h")}</h4><p>{t("p1.s3.t3")}</p>
          <h4>{t("p1.s3.t4h")}</h4><p>{t("p1.s3.t4")}</p>
        </div>
        <label className={"rq-agree" + (data.terms ? " on" : "")}>
          <input type="checkbox" checked={!!data.terms} onChange={e => setData({ ...data, terms: e.target.checked })} />
          {t("p1.s3.agree")}
        </label>
      </>
    ),
  },
  {
    titleKey: "p1.s4.title", subKey: "p1.s4.sub",
    validate: d => (d.dependents || []).some(x => !x.name) ? ["depname"] : [],
    render: ({ t, lang, data, setData }) => {
      const deps = data.dependents || [];
      const upd = (i, patch) => setData({ ...data, dependents: deps.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
      return (
        <>
          {deps.length === 0 && <div className="rq-empty">{t("p1.s4.none")}</div>}
          <div className="rq-list">
            {deps.map((dep, i) => (
              <div className="rq-item" key={dep.id} style={{ alignItems: "flex-end" }}>
                <div className="ib2">
                  <Field label={t("p1.s4.name")} required>
                    <input value={dep.name} onChange={e => upd(i, { name: e.target.value })} placeholder={t("p1.s4.name.ph")} />
                  </Field>
                </div>
                <div style={{ minWidth: 130 }}>
                  <Field label={t("p1.s4.relation")}>
                    <select value={dep.relation} onChange={e => upd(i, { relation: e.target.value })}>
                      <option value="spouse">{t("p1.s4.rel.spouse")}</option>
                      <option value="child">{t("p1.s4.rel.child")}</option>
                    </select>
                  </Field>
                </div>
                <div style={{ minWidth: 150 }}>
                  <Field label={t("p1.s4.dob")}>
                    <DateField value={dep.dob || ""} lang={lang} max={isoOf(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                      onChange={v => upd(i, { dob: v })} />
                  </Field>
                </div>
                <button type="button" className="rq-x" style={{ marginBlockEnd: 16 }} onClick={() => setData({ ...data, dependents: deps.filter((_, j) => j !== i) })}>
                  {t("p1.s4.remove")}
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="rq-btn rq-ghost" onClick={() => setData({ ...data, dependents: [...deps, { id: Date.now(), name: "", relation: "spouse", dob: "" }] })}>
            <Icon d={IC.plus} />{t("p1.s4.add")}
          </button>
        </>
      );
    },
  },
];
