import { Icon, IC } from "../ui/Icon.jsx";
import { num } from "../lib/num.js";

export function Chevrons({ steps, current, maxReached, onGo, lang, t }) {
  return (
    <div className="rq-chevs" role="tablist">
      {steps.map((s, i) => {
        const st = i === current ? "active" : i < maxReached || i < current ? "done" : "todo";
        return (
          <button type="button" key={i} className={"rq-chev " + st} role="tab" aria-selected={i === current}
            onClick={() => (i <= maxReached ? onGo(i) : null)} disabled={i > maxReached}>
            <span><b className="n">{num(i + 1, lang)}</b><span className="lbl">{t(s.titleKey)}</span></span>
          </button>
        );
      })}
    </div>
  );
}

export function WizardNav({ t, isFirst, isLast, onBack, onSave, onNext }) {
  return (
    <div className="rq-wnav">
      {!isFirst ? (
        <button type="button" className="rq-btn rq-ghost" onClick={onBack}><Icon d={IC.back} dir />{t("phase.back")}</button>
      ) : <span />}
      <span className="grow" />
      <button type="button" className="rq-btn rq-ghost" onClick={onSave}>{t("phase.save")}</button>
      <button type="button" className="rq-btn rq-primary" onClick={onNext}>
        {isLast ? t("phase.submit") : t("phase.next")}<Icon d={isLast ? IC.check : IC.next} dir={!isLast} />
      </button>
    </div>
  );
}
