import { Icon, IC } from "../ui/Icon.jsx";
import { Pill } from "../ui/atoms.jsx";
import { DOC_TYPES, ISSUERS } from "../data/documents.js";
import { isoToDmy } from "../lib/dates.js";

export function DocumentModal({ t, lang, doc, user, onClose }) {
  const d = DOC_TYPES[doc.kind];
  const iss = ISSUERS[d.issuer];
  const term = doc.term ? doc.term : "";
  return (
    <div className="rq-modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rq-modal" role="dialog" aria-modal="true">
        <h2 style={{ fontSize: 20 }}>{d.title[lang]}</h2>
        <div className="rq-letter">
          <h3>{d.title.en} — {iss.en}</h3>
          <p>To whom it may concern,</p>
          <p style={{ marginBlock: 10 }}>
            This is to certify that <b>{user.name.en}</b> (national ID {user.national_id}) is a
            recipient of the Custodian of the Two Holy Mosques Scholarship Program, sponsored by the
            Ministry of Education of Saudi Arabia, to pursue {user.degree.en} at <b>{user.university.en}</b>.
          </p>
          {doc.kind === "fgAdmission" && (
            <p style={{ marginBlock: 10 }}>
              The sponsor will cover full tuition and fees, a monthly living stipend, and health
              insurance for the duration of the program. This letter may be relied upon for the
              issuance of an admission offer and Form I-20, and for the student visa application.
            </p>
          )}
          {doc.kind === "fgAcademic" && (
            <p style={{ marginBlock: 10 }}>
              The sponsor confirms payment of tuition and mandatory fees for the approved course
              load of the {term || "registered"} term. Charges outside the approved schedule are not
              covered by this guarantee.
            </p>
          )}
          {doc.kind === "award" && (
            <p style={{ marginBlock: 10 }}>
              The award covers the full duration of the stated program, subject to continued
              academic good standing and to the regulations of the scholarship programme.
            </p>
          )}
          <p>Ref: <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{doc.ref}</span> · {isoToDmy(doc.date)} · Demo document — not an official letter.</p>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBlockEnd: 16 }}>{t("fg.note")}</p>
        <button type="button" className="rq-btn rq-primary" onClick={onClose}>{t("chrome.close")}</button>
      </div>
    </div>
  );
}

/* Both lists group the same way: term first, everything untied to a term at
   the top, so a student scanning for "the second term" finds one block. */
function groupByTerm(list) {
  const out = [];
  (list || []).forEach((d) => {
    const key = d.term || "";
    let g = out.find((x) => x.term === key);
    if (!g) { g = { term: key, items: [] }; out.push(g); }
    g.items.push(d);
  });
  out.sort((a, b) => (a.term ? 1 : 0) - (b.term ? 1 : 0) || a.term.localeCompare(b.term));
  return out;
}

export function FilesScreen({ t, lang, docs, userDocs = [], onOpenFile, onOpenAttachment, onHome }) {
  /* Issued documents are one flat list — the issuer is a tag on the row, not a
     section, because what matters is the document, not who signed it. */
  /* Provided documents group by term, so a student can answer "what did I hand
     in for the second term?" without hunting through phases. */
  const byTerm = groupByTerm(userDocs);

  return (
    <div className="rq-rise">
      <button type="button" className="rq-btn rq-ghost" style={{ marginBlockEnd: 16, padding: "8px 15px", fontSize: 13.5 }} onClick={onHome}>
        <Icon d={IC.back} dir size={15} />{t("phase.backhome")}
      </button>
      <h1 style={{ fontSize: 24 }}>{t("files.title")}</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBlockStart: 4 }}>{t("files.sub")}</p>

      {/* ---- issued to you, grouped the same way uploads are ---- */}
      <h2 className="rq-sec-h">{t("files.issuedsec")}</h2>
      {!docs.length ? <p className="rq-empty">{t("files.empty")}</p> : groupByTerm(docs).map((g) => (
        <div key={"iss-" + (g.term || "none")}>
          <div className="rq-termhead">
            <span className="lbl">{g.term || t("files.general")}</span>
            <span className="ln" />
          </div>
        <div className="rq-list">
          {g.items.map((doc) => {
            const d = DOC_TYPES[doc.kind];
            return (
              <div className="rq-item" key={doc.ref}>
                <Icon d={IC[d.icon]} size={19} />
                <div className="ib2">
                  <div className="t">
                    {d.title[lang]}
                    <span className="rq-issuer-tag">{ISSUERS[d.issuer].short}</span>
                  </div>
                  <div className="d">{d.sub[lang]}</div>
                  <div className="rq-ref">
                    <span>{t("ref.no")}</span><b className="mono" dir="ltr">{doc.ref}</b>
                    <span>· {t("files.issued", { d: isoToDmy(doc.date) })}</span>
                    {doc.term && <span>· {doc.term}</span>}
                  </div>
                </div>
                <div className="rq-file-acts">
                  <button type="button" className="rq-btn rq-ghost" style={{ padding: "8px 13px", fontSize: 13 }}
                    onClick={() => onOpenFile(doc, "view")}>
                    <Icon d={IC.doc} size={14} />{t("files.viewpdf")}
                  </button>
                  <button type="button" className="rq-btn rq-ghost" style={{ padding: "8px 13px", fontSize: 13 }}
                    onClick={() => onOpenFile(doc, "download")}>
                    <Icon d='<path d="M12 3v12M7 12l5 5 5-5M5 21h14"/>' size={14} />{t("files.download")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      ))}

      {/* ---- provided by you, grouped by term ---- */}
      <h2 className="rq-sec-h">{t("files.usersec")}</h2>
      {!userDocs.length ? <p className="rq-empty">{t("files.userempty")}</p> : byTerm.map((g) => (
        <div key={g.term || "none"}>
          <div className="rq-termhead">
            <span className="lbl">{g.term || t("files.noterm")}</span>
            <span className="ln" />
          </div>
          <div className="rq-list">
            {g.items.map((f, n) => (
              <div className="rq-item" key={f.srcKey + n}>
                <Icon d={IC.paperclip} size={17} />
                <div className="ib2">
                  <div className="t">{t(f.srcKey)}</div>
                  <div className="d mono" dir="ltr">{f.name}</div>
                </div>
                {f.key && (
                  <div className="rq-file-acts">
                    <button type="button" className="rq-btn rq-ghost" style={{ padding: "8px 13px", fontSize: 13 }}
                      onClick={() => onOpenAttachment(f.key, "view")}>
                      <Icon d={IC.doc} size={14} />{t("files.viewfile")}
                    </button>
                    <button type="button" className="rq-btn rq-ghost" style={{ padding: "8px 13px", fontSize: 13 }}
                      onClick={() => onOpenAttachment(f.key, "download")}>
                      <Icon d='<path d="M12 3v12M7 12l5 5 5-5M5 21h14"/>' size={14} />{t("files.download")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
