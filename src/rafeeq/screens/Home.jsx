import { Icon, IC } from "../ui/Icon.jsx";
import { Pill } from "../ui/atoms.jsx";
import { num } from "../lib/num.js";
import { PHASES } from "../phases/registry.js";

export function Home({ t, lang, user, statuses, refs, phaseProgress, onOpenPhase, guaranteeReady, docCount, openFiles, allDone }) {
  return (
    <div className="rq-rise">
      <div className="rq-hero">
        <svg className="leafbg" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 34 C14 14, 30 8, 42 10 C34 14, 24 18, 18 34 Z" fill="var(--accent)" />
        </svg>
        <div className="eyebrow">{t("home.congrats.eyebrow")}</div>
        <h1>{allDone ? t("home.done.title") : t("home.congrats.title", { name: user.first[lang] })}</h1>
        <p>{allDone ? t("home.done.body") : t("home.congrats.body")}</p>
        <div className="rq-meta">
          <span className="rq-chip"><Icon d={IC.seal} size={14} />{user.program[lang]}</span>
          <span className="rq-chip"><Icon d={IC.cap} size={14} />{user.university[lang]}</span>
          <span className="rq-chip"><Icon d={IC.doc} size={14} />{user.degree[lang]}</span>
          <span className="rq-chip"><Icon d={IC.clock} size={14} />{user.startTerm[lang]}</span>
        </div>
      </div>

      {!!docCount && (
        <div className="rq-card rq-phase rq-rise" style={{ marginBlockStart: 16, borderColor: "var(--accent)" }}>
          <div className="pnum" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Icon d={IC.seal} size={23} /></div>
          <div className="pb">
            <h3>{t("files.title")}</h3>
            <div className="pw">{t("files.card", { n: num(docCount, lang) })}</div>
          </div>
          <button type="button" className="rq-btn rq-ghost" onClick={openFiles}>{t("files.open")}</button>
        </div>
      )}

      <div style={{ marginBlockStart: 26 }}>
        <h2 style={{ fontSize: 19 }}>{t("home.journey.title")}</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBlockStart: 3 }}>{t("home.journey.sub")}</p>
        <div className="rq-phases">
          {PHASES.map((ph, i) => {
            const st = statuses[ph.id];
            const locked = st === "locked";
            const pill = st === "approved" ? <Pill tone="green">{t("phase.status.approved")}</Pill>
              : st === "submitted" ? <Pill tone="amber">{t("phase.status.submitted")}</Pill>
              : locked ? <Pill tone="gray">{t("phase.status.locked")}</Pill>
              : <Pill tone="amber">{t("phase.status.inprogress")}</Pill>;
            const btnLabel = st === "in_progress" ? (phaseProgress[ph.id] > 0 ? t("home.continue") : t("home.start"))
              : st === "approved" ? t("home.review") : t("home.review");
            return (
              <div key={ph.id} className={"rq-card rq-phase " + st}>
                <div className="pnum">{st === "approved" ? <Icon d={IC.check} size={22} /> : locked ? <Icon d={IC.lock} size={20} /> : num(i + 1, lang)}</div>
                <div className="pb">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 9 }}>{t(ph.nameKey)} {pill}</h3>
                  <div className="pw">{t(ph.whereKey)}</div>
                  {refs[ph.id] && <div className="rq-ref"><span>{t("ref.no")}</span><b className="mono" dir="ltr">{refs[ph.id]}</b></div>}
                  {!locked && st !== "approved" && (
                    <div className="rq-progress"><i style={{ width: (phaseProgress[ph.id] || 0) + "%" }} /></div>
                  )}
                </div>
                {locked
                  ? <span style={{ fontSize: 12.5, color: "var(--ink-faint)", maxWidth: 170 }}>{t("home.locked")}</span>
                  : <button type="button" className={"rq-btn " + (st === "in_progress" ? "rq-primary" : "rq-ghost")} onClick={() => onOpenPhase(ph.id)}>
                      {btnLabel}<Icon d={IC.next} dir size={15} />
                    </button>}
              </div>
            );
          })}
        </div>
      </div>
      <p className="rq-disc" style={{ marginBlockStart: 30 }}>{t("brand.disclaimer")}</p>
    </div>
  );
}
