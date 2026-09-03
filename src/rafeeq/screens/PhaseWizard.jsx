import { useState, useEffect } from "react";
import { Icon, IC } from "../ui/Icon.jsx";
import { Pill } from "../ui/atoms.jsx";
import { num } from "../lib/num.js";
import { Chevrons, WizardNav } from "./wizardParts.jsx";

export function PhaseWizard({ t, lang, user, phase, phaseRef, phaseData, setPhaseData, status, onSubmit, onApprove, onHome, toast, ctx }) {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState([]);
  const steps = phase.steps;
  const cur = steps[step];

  useEffect(() => { setStep(0); setMaxReached(0); setErrors([]); }, [phase.id]);

  /* A finished phase reopens as the submitted record, read-only, with its
     status on top — not just a bare "approved" card. */
  if (status === "submitted" || status === "approved") {
    const ok = status === "approved";
    return (
      <div className="rq-rise">
        <button type="button" className="rq-btn rq-ghost" style={{ marginBlockEnd: 16, padding: "8px 15px", fontSize: 13.5 }}
          onClick={onHome}>
          <Icon d={IC.back} dir size={15} />{t("phase.backhome")}
        </button>

        <div className={"rq-rvhead" + (ok ? " ok" : "")}>
          <div className="ri"><Icon d={ok ? IC.check : IC.clock} size={22} /></div>
          <div className="tx">
            <h1>{t(phase.nameKey)}</h1>
            {phaseRef && <div className="rq-ref"><span>{t("ref.no")}</span><b className="mono" dir="ltr">{phaseRef}</b></div>}
            <p>{ok ? t("phase.approved.body") : t("phase.submitted.body")}</p>
          </div>
          <Pill tone={ok ? "green" : "amber"}>{t(ok ? "phase.status.approved" : "status.review")}</Pill>
        </div>

        {!ok && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBlockEnd: 18 }}>
            <button type="button" className="rq-btn rq-primary" onClick={onApprove}><Icon d={IC.seal} />{t("phase.simulate")}</button>
          </div>
        )}

        <p className="rq-ro-note">{t("phase.readonly")}</p>

        {/* `disabled` on the fieldset makes every control inside inert, so each
            step's own render can be reused verbatim as a read-only summary. */}
        <fieldset className="rq-ro" disabled>
          {steps.map((s, i) => (
            <div className="rq-card rq-panel" key={s.titleKey} style={{ marginBlockEnd: 14 }}>
              <h2>{num(i + 1, lang)} · {t(s.titleKey)}</h2>
              <p className="sub">{t(s.subKey)}</p>
              {s.render({ t, lang, user, data: phaseData, setData: () => {}, errors: [], ctx })}
            </div>
          ))}
        </fieldset>

        <button type="button" className="rq-btn rq-ghost" onClick={onHome}>
          <Icon d={IC.back} dir size={15} />{t("phase.backhome")}
        </button>
        {!ok && <div className="rq-sim">{t("brand.disclaimer")}</div>}
      </div>
    );
  }

  const goNext = () => {
    const errs = cur.validate(phaseData, ctx);
    setErrors(errs);
    if (errs.length) { toast(t(cur.errToast || "err.check")); return; }
    if (step === steps.length - 1) { onSubmit(); return; }
    const nx = step + 1;
    setStep(nx); setMaxReached(Math.max(maxReached, nx)); setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rq-rise">
      <button type="button" className="rq-btn rq-ghost" style={{ marginBlockEnd: 16, padding: "8px 15px", fontSize: 13.5 }}
        onClick={() => {
          if (step > 0) { setStep(step - 1); setErrors([]); window.scrollTo({ top: 0, behavior: "smooth" }); }
          else onHome();
        }}>
        <Icon d={IC.back} dir size={15} />{step > 0 ? t("phase.back") : t("phase.backhome")}
      </button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBlockEnd: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24 }}>{t(phase.nameKey)}</h1>
        <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>
          {t("phase.step", { n: num(step + 1, lang), total: num(steps.length, lang) })}
        </span>
      </div>
      <Chevrons steps={steps} current={step} maxReached={maxReached} lang={lang} t={t}
        onGo={i => { setStep(i); setErrors([]); }} />
      <div className="rq-card rq-panel">
        <h2>{t(cur.titleKey)}</h2>
        <p className="sub">{t(cur.subKey)}</p>
        {cur.render({ t, lang, user, data: phaseData, setData: setPhaseData, errors, ctx })}
        <WizardNav t={t} isFirst={step === 0} isLast={step === steps.length - 1}
          onBack={() => { setStep(step - 1); setErrors([]); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onSave={() => toast(t("phase.saved"))}
          onNext={goNext} />
      </div>
    </div>
  );
}
