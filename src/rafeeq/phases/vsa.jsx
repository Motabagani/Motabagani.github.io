import { Icon, IC } from "../ui/Icon.jsx";
import { Field, Pill } from "../ui/atoms.jsx";
import { DateField } from "../ui/DateField.jsx";
import { Combo, AirportPicker, optCountries, optVisaTypes } from "../ui/Combo.jsx";
import { num } from "../lib/num.js";
import { isoToDmy } from "../lib/dates.js";
import { ticketRef, makeRef } from "../lib/refs.js";
import { reviewRoute } from "../lib/route.js";
import { moiPassport } from "../lib/passport.js";
import { saudiaMailBody, SAUDIA_MAIL } from "../lib/mail.js";
import { aptLabel } from "../data/airports.js";
import { TICKET_KINDS } from "../data/tickets.js";
import { DOC_TYPES } from "../data/documents.js";
import { putAttachment, fileName } from "../storage/attachments.js";

export const P2_STEPS = [
  {
    titleKey: "p2.s1.title", subKey: "p2.s1.sub",
    validate: (d, ctx) => {
      const people = ["self", ...(ctx.dependents || []).map(x => "dep" + x.id)];
      const errs = [];
      people.forEach(pid => {
        const v = (d.visas || {})[pid] || {};
        if ((v.mode || "needs") === "needs") {
          if (!v.issue) errs.push("issue-" + pid);
          if (!v.type || (v.type === "__other" && !v.typeOther)) errs.push("vtype-" + pid);
          if (!v.visaNo) errs.push("visano-" + pid);
          if (!v.expiry) errs.push("vexp-" + pid);
        } else {
          if (!v.altCountry) errs.push("altc-" + pid);
          if (!v.passport2) errs.push("pp2-" + pid);
        }
      });
      return errs;
    },
    render: ({ t, lang, data, setData, errors, ctx }) => {
      const people = [
        { pid: "self", label: t("p2.s1.you") + " — " + ctx.userName, defType: "F1" },
        ...(ctx.dependents || []).map(x => ({ pid: "dep" + x.id, label: x.name || t("p1.s4.title"), defType: "F2" })),
      ];
      const visas = data.visas || {};
      const upd = (pid, patch) => setData({ ...data, visas: { ...visas, [pid]: { ...(visas[pid] || {}), ...patch } } });
      return (
        <div className="rq-list">
          {people.map(p => {
            const v = visas[p.pid] || {};
            const mode = v.mode || "needs";
            return (
              <div className="rq-item" key={p.pid} style={{ display: "block" }}>
                <div className="t" style={{ marginBlockEnd: 10 }}>{p.label}</div>
                <Field label={t("p2.s1.status")}>
                  <select value={mode} onChange={e => upd(p.pid, { mode: e.target.value })}>
                    <option value="needs">{t("p2.s1.needs")}</option>
                    <option value="none">{t("p2.s1.noneed")}</option>
                  </select>
                </Field>
                <div className="rq-rec" style={{ marginBlockEnd: 12 }}>
                  <div><div className="k">{t("p2.s1.passport")}</div>
                    <div className="v mono" dir="ltr">{moiPassport(p.pid)}</div></div>
                  <div><div className="k">{t("p1.s2.src")}</div>
                    <div className="v">{t("p2.s1.src.moi")}</div></div>
                </div>
                {mode === "needs" ? (
                  <>
                    <Field label={t("p2.s1.issue")} required
                      error={errors.includes("issue-" + p.pid)} hint={t("err.required")}>
                      <Combo options={optCountries(lang)} value={v.issue || ""}
                        placeholder={t("p2.s1.country.ph")} emptyText={t("list.nomatch")}
                        invalid={errors.includes("issue-" + p.pid)}
                        onPick={c => upd(p.pid, { issue: c })} />
                    </Field>
                    <Field label={t("p2.s1.visatype")} required
                      error={errors.includes("vtype-" + p.pid)} hint={t("err.required")}>
                      <Combo options={optVisaTypes(lang).concat([{ v: "__other", label: t("p2.s1.visatype.other"), hay: "other أخرى" }])}
                        value={v.type || ""} placeholder={t("p2.s1.visatype.ph")} emptyText={t("list.nomatch")}
                        invalid={errors.includes("vtype-" + p.pid)}
                        onPick={x => upd(p.pid, { type: x })} />
                    </Field>
                    {v.type === "__other" && (
                      <Field label={t("p2.s1.visatype.other")} required
                        error={errors.includes("vtype-" + p.pid)} hint={t("err.required")}>
                        <input value={v.typeOther || ""} onChange={e => upd(p.pid, { typeOther: e.target.value })}
                          placeholder={t("p2.s1.visatype.other.ph")} />
                      </Field>
                    )}
                    <div className="rq-row2">
                      <Field label={t("p2.s1.visano")} required
                        error={errors.includes("visano-" + p.pid)} hint={t("err.required")}>
                        <input value={v.visaNo || ""} onChange={e => upd(p.pid, { visaNo: e.target.value.replace(/[^0-9A-Za-z-]/g, "") })}
                          placeholder={t("p2.s1.visano.ph")} dir="ltr" style={{ textAlign: "start" }} />
                      </Field>
                      <Field label={t("p2.s1.expiry")} required
                        error={errors.includes("vexp-" + p.pid)} hint={t("err.required")}>
                        <DateField value={v.expiry || ""} lang={lang} invalid={errors.includes("vexp-" + p.pid)}
                          onChange={x => upd(p.pid, { expiry: x })} />
                      </Field>
                    </div>
                    <div className="rq-item" style={{ marginBlockStart: 4 }}>
                      <Icon d={IC.doc} size={17} />
                      <div className="ib2"><div className="t">{t("p2.s1.attach")}</div>
                        {v.file && <div className="d mono" dir="ltr">{fileName(v.file)}</div>}</div>
                      {v.file ? (<div className="rq-file-acts">
                          <Pill tone="green">{t("p3.s3.doc.attached")}</Pill>
                          <button type="button" className="rq-iconbtn danger" title={t("doc.remove")}
                            aria-label={t("doc.remove")} onClick={() => upd(p.pid, { file: null })}>
                            <Icon d='<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>' size={14} />
                          </button>
                        </div>)
                        : <label className="rq-btn rq-ghost" style={{ padding: "8px 14px", fontSize: 13.5 }}>
                            <Icon d={IC.paperclip} size={15} />{t("p3.s3.doc.attach")}
                            <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
                              onChange={async e => { const f = e.target.files[0]; if (f) upd(p.pid, { file: await putAttachment(f) }); }} />
                          </label>}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="rq-callout">{t("p2.s1.alt.note")}</p>
                    <div className="rq-row2">
                      <Field label={t("p2.s1.alt.country")} required
                        error={errors.includes("altc-" + p.pid)} hint={t("err.required")}>
                        <Combo options={optCountries(lang)} value={v.altCountry || ""}
                          placeholder={t("p2.s1.country.ph")} emptyText={t("list.nomatch")}
                          invalid={errors.includes("altc-" + p.pid)}
                          onPick={c => upd(p.pid, { altCountry: c })} />
                      </Field>
                      <Field label={t("p2.s1.passport2")} required
                        error={errors.includes("pp2-" + p.pid)} hint={t("err.required")}>
                        <input value={v.passport2 || ""} onChange={e => upd(p.pid, { passport2: e.target.value })}
                          placeholder={t("p2.s1.passport.ph")} dir="ltr" style={{ textAlign: "start" }} />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          <p className="rq-stub-note">{t("p2.s1.moi.note")}</p>
        </div>
      );
    },
  },
  {
    titleKey: "p2.s2.title", subKey: "p2.s2.sub",
    validate: d => (d.flightConfirmed ? [] : ["flight"]),
    errToast: "err.flightfirst",
    render: ({ t, lang, user, data, setData, ctx }) => {
      const stage = data.flightStage || "form"; // form → issued
      const deps = ctx.dependents || [];
      const kind = data.ticketKind || "initial";
      const depNow = data.depNow || {};
      const files = data.reqFiles || [];
      /* Auto-issue only clears when BOTH checks pass: the airport must serve the
         university, and the arrival must land before the term begins. Anything
         else goes to a human, and no OTB exists until they approve it. */
      const dateFits = !ctx.semStart || !data.date || data.date <= ctx.semStart;
      const request = () => {
        if (!data.from || !data.to || !data.date) { setData({ ...data, flightErr: true }); return; }
        return ctx.runTask(t("busy.ticket"), async () => {
        const rev = reviewRoute(data.to, user, lang);
        const auto = rev.ok && dateFits;
        setData({ ...data, flightErr: false, flightStage: "issued",
          flightConfirmed: auto, routeOk: rev.ok, routeReason: rev.reason, dateOk: dateFits,
          reqNo: ticketRef(kind, data.date), flightNo: "SV 21",
          otb: auto ? "OTB-" + Math.floor(100000 + Math.random() * 899999) : "" }); }, 1400);
      };
      const approveTicket = () => setData({ ...data, flightConfirmed: true,
        otb: "OTB-" + Math.floor(100000 + Math.random() * 899999) });
      const locked = stage !== "form";
      return (
        <>
          <Field label={t("p2.s2.kind")}>
            <select value={kind} disabled={locked} onChange={e => setData({ ...data, ticketKind: e.target.value })}>
              {TICKET_KINDS.map(k => <option key={k.k} value={k.k}>{k[lang]}</option>)}
            </select>
          </Field>
          <p className="rq-stub-note">{t("p2.s2.kind." + kind + ".d")}</p>

          <div className="rq-row2">
            <Field label={t("p2.s2.from")} required error={!!data.flightErr && !data.from} hint={t("err.required")}>
              <AirportPicker value={data.from} lang={lang} disabled={locked}
                invalid={!!data.flightErr && !data.from} placeholder={t("p2.s2.apt.ph")}
                emptyText={t("list.nomatch")}
                onPick={a => setData({ ...data, from: a.i, fromLabel: aptLabel(a) })} />
            </Field>
            <Field label={t("p2.s2.to")} required error={!!data.flightErr && !data.to} hint={t("err.required")}>
              <AirportPicker value={data.to} lang={lang} disabled={locked}
                invalid={!!data.flightErr && !data.to} placeholder={t("p2.s2.apt.ph")}
                emptyText={t("list.nomatch")}
                onPick={a => setData({ ...data, to: a.i, toLabel: aptLabel(a), toCountry: a.k })} />
            </Field>
          </div>
          <Field label={t("p2.s2.date")} required error={!!data.flightErr && !data.date} hint={t("err.required")}>
            <DateField value={data.date || ""} lang={lang} disabled={locked}
              invalid={!!data.flightErr && !data.date}
              onChange={v => setData({ ...data, date: v })} />
          </Field>
          {ctx.semStart && (dateFits
            ? <p className="rq-stub-note">{t("p2.s2.semref", { d: isoToDmy(ctx.semStart), s: ctx.semLabel })}</p>
            : <p className="rq-callout rq-warn">{t("p2.s2.late", { d: isoToDmy(ctx.semStart) })}</p>)}

          {/* Travellers — you are always on the booking; dependents are opt-in */}
          <div className="rq-field"><label>{t("p2.s2.travellers")}</label></div>
          <div className="rq-list">
            <div className="rq-item">
              <Icon d={IC.user} size={17} />
              <div className="ib2"><div className="t">{ctx.userName}</div>
                <div className="d">{t("p2.s2.trav.self")}</div></div>
              <Pill tone="green">{t("p2.s2.trav.included")}</Pill>
            </div>
            {deps.map(dp => (
              <div className="rq-item" key={dp.id}>
                <Icon d={IC.user} size={17} />
                <div className="ib2"><div className="t">{dp.name}</div>
                  <div className="d">{t(depNow[dp.id] ? "p2.s2.trav.now.d" : "p2.s2.trav.later.d")}</div></div>
                <select value={depNow[dp.id] ? "now" : "later"} disabled={locked} style={{ maxWidth: 190 }}
                  onChange={e => setData({ ...data, depNow: { ...depNow, [dp.id]: e.target.value === "now" } })}>
                  <option value="now">{t("p2.s2.trav.now")}</option>
                  <option value="later">{t("p2.s2.trav.later")}</option>
                </select>
              </div>
            ))}
          </div>
          {!deps.length && <p className="rq-stub-note">{t("p2.s2.trav.none")}</p>}

          {/* Optional supporting documents */}
          <div className="rq-field" style={{ marginBlockStart: 14 }}><label>{t("p2.s2.docs")}</label></div>
          <div className="rq-list">
            {files.map((f, n) => (
              <div className="rq-item" key={n}>
                <Icon d={IC.doc} size={17} />
                <div className="ib2"><div className="t mono" dir="ltr">{fileName(f)}</div></div>
                {!locked && (
                  <button type="button" className="rq-iconbtn danger" aria-label={t("sem.course.remove")}
                    onClick={() => setData({ ...data, reqFiles: files.filter((_, k) => k !== n) })}>
                    <Icon d='<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>' size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!locked && (
            <label className="rq-btn rq-ghost" style={{ marginBlockStart: 10, padding: "8px 14px", fontSize: 13.5 }}>
              <Icon d={IC.paperclip} size={15} />{t("p2.s2.docs.add")}
              <input type="file" accept=".pdf,image/*" multiple style={{ display: "none" }}
                onChange={async e => { const added = await Promise.all(Array.from(e.target.files).map(putAttachment)); setData({ ...data, reqFiles: [...files, ...added] }); }} />
            </label>
          )}
          {!files.length && <p className="rq-stub-note">{t("p2.s2.docs.hint")}</p>}

          {stage === "form" && (
            <button type="button" className="rq-btn rq-primary" style={{ marginBlockStart: 16 }} onClick={request}>
              <Icon d={IC.plane} />{t("p2.s2.request")}
            </button>
          )}

          {stage === "issued" && (
            <div className="rq-item" style={{ display: "block", marginBlockStart: 14 }}>
              <div className="rq-reqno">
                <span className="k">{t("ref.no")}</span>
                <b className="mono" dir="ltr">{data.reqNo}</b>
                <Pill tone={data.flightConfirmed ? "green" : "amber"}>
                  {t(data.flightConfirmed ? "status.approved" : "status.review")}
                </Pill>
              </div>

              {/* Checks the automatic issuer ran */}
              <div className="rq-checks">
                <div className={"ck" + (data.routeOk ? " ok" : "")}>
                  <Icon d={data.routeOk ? IC.check : IC.clock} size={15} />
                  <span>{data.routeReason}</span>
                </div>
                <div className={"ck" + (data.dateOk ? " ok" : "")}>
                  <Icon d={data.dateOk ? IC.check : IC.clock} size={15} />
                  <span>{data.dateOk ? t("p2.s2.chk.date.ok") : t("p2.s2.chk.date.no", { d: isoToDmy(ctx.semStart) })}</span>
                </div>
              </div>

              {!data.flightConfirmed ? (
                <>
                  <div className="t" style={{ color: "var(--amber)", display: "flex", gap: 8, alignItems: "center", marginBlockStart: 12 }}>
                    <Icon d={IC.clock} />{t("p2.s2.manual.title")}
                  </div>
                  <div className="d" style={{ marginBlockStart: 6 }}>{t("p2.s2.manual.body")}</div>
                  <button type="button" className="rq-btn rq-ghost" style={{ marginBlockStart: 12 }} onClick={approveTicket}>
                    <Icon d={IC.seal} size={15} />{t("p2.s2.manual.sim")}
                  </button>
                </>
              ) : (
                <>
                  <div className="t" style={{ color: "var(--accent)", display: "flex", gap: 8, alignItems: "center", marginBlockStart: 12 }}>
                    <Icon d={IC.check} />{t(data.routeOk && data.dateOk ? "p2.s2.route.ok" : "p2.s2.route.okManual", { otb: data.otb })}
                  </div>
                  <div className="d" style={{ marginBlock: "8px 12px" }}>
                    {t("p2.s2.itinerary")} — {t("p2.s2.flightno")} <span className="mono" dir="ltr">{data.flightNo} · {data.from} → {data.to}</span>
                  </div>
                  <div className="rq-mailcard">
                    <div className="mh">
                      <Icon d={IC.doc} size={16} />
                      <div><div className="t">{t("p2.s2.mail.title")}</div>
                        <div className="d">{t("p2.s2.mail.sub", { mail: SAUDIA_MAIL })}</div></div>
                    </div>
                    <pre className="mb" dir="ltr">{saudiaMailBody(user, data, ctx, lang)}</pre>
                    <div className="ma">
                      <button type="button" className="rq-btn rq-ghost" onClick={() => {
                        const txt = saudiaMailBody(user, data, ctx, lang);
                        if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(txt);
                        setData({ ...data, mailCopied: true });
                      }}>
                        <Icon d={IC.doc} size={15} />{data.mailCopied ? t("p2.s2.mail.copied") : t("p2.s2.mail.copy")}
                      </button>
                      <a className="rq-btn rq-ghost" href={"mailto:" + SAUDIA_MAIL + "?subject=" + encodeURIComponent((data.reqNo || "") + " · OTB " + (data.otb || "")) + "&body=" + encodeURIComponent(saudiaMailBody(user, data, ctx, lang))}>
                        <Icon d={IC.plane} size={15} />{t("p2.s2.mail.open")}
                      </a>
                    </div>
                    <ul className="mi">
                      <li>{t("p2.s2.mail.i1")}</li>
                      <li>{t("p2.s2.mail.i2")}</li>
                      <li>{t("p2.s2.mail.i3")}</li>
                    </ul>
                  </div>
                  <p className="rq-stub-note" style={{ marginBlockStart: 12 }}>{t("p2.s2.done")}</p>
                </>
              )}
            </div>
          )}
        </>
      );
    },
  },
];
