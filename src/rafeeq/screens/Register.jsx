import { useState } from "react";
import { Icon, IC } from "../ui/Icon.jsx";
import { Mark } from "../ui/Mark.jsx";
import { RafeeqDraw } from "../ui/RafeeqDraw.jsx";
import { digitsOnly } from "../lib/num.js";
import { userStore, storage } from "../storage/legacy.js";
import { AWARD_SAR } from "../data/domain.js";
import { awardBoth } from "../lib/money.js";
import { UNIS, DEGREES, MAJORS, TERMS, PROGRAMS, CURRENCY, COUNTRY, EXTERNAL_STUB } from "../data/domain.js";

const capChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const newCapCode = () => Array.from({ length: 5 }, () => capChars[Math.floor(Math.random() * capChars.length)]).join("");
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* The award already exists in the system before the student signs in — exactly like
   Safeer2, where the program issues it and the portal only reveals it. The degree
   decides the track, and \u0627\u0644\u0631\u0648\u0627\u062f draws only from the approved ranked universities. */
function assignAward() {
  const uni = pick(UNIS);
  const deg = pick(DEGREES);
  const maj = pick(MAJORS);
  const term = pick(TERMS);
  const prog = pick(PROGRAMS[deg.lvl]);
  const cur = CURRENCY[uni.c];
  const ctry = COUNTRY[uni.c];
  return {
    award_sar: AWARD_SAR,
    currency: cur.code,
    country: { ar: ctry.ar, en: ctry.en },
    program: { ar: prog.ar, en: prog.en },
    track: prog.key,
    university: { ar: uni.ar, en: uni.en },
    uni_rank: uni.r,
    degree: { ar: deg.ar, en: deg.en },
    major: { ar: maj.ar, en: maj.en },
    startTerm: { ar: term.ar, en: term.en },
  };
}

export function Register({ t, lang, onDone, onCancel }) {
  const ar = lang === "ar";
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(newCapCode);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState({});
  const [award, setAward] = useState(null);
  const [f, setF] = useState({ national_id: "", cap: "", nameAr: "", nameEn: "", email: "", pw: "", pw2: "" });
  /* National ID is digits-only; everything else takes the value as typed.
     Arabic-Indic numerals are folded to ASCII so validation sees 0-9. */
  const NUMERIC_FIELDS = { national_id: 10 };
  const set = (k) => (e) => setF((p) => ({
    ...p,
    [k]: NUMERIC_FIELDS[k] ? digitsOnly(e.target.value, NUMERIC_FIELDS[k]) : e.target.value,
  }));
  const STEPS = ar ? ["\u0627\u0644\u0647\u0648\u064a\u0629", "\u0627\u0644\u062d\u0633\u0627\u0628"] : ["Identity", "Account"];

  /* step 1 — ID + captcha, verified through Nafath */
  const verify = () => {
    const e = {};
    if (!/^\d{10}$/.test(f.national_id.trim())) e.id = true;
    if (f.cap !== code) e.cap = true;
    setErr(e);
    if (Object.keys(e).length) { setCode(newCapCode()); setF((p) => ({ ...p, cap: "" })); return; }
    setVerifying(true);
    setTimeout(() => { setAward(assignAward()); setVerifying(false); setStep(2); }, 1100);
  };

  /* step 2 — the only things we actually ask a person for */
  const submit = async () => {
    const e = {};
    if (!f.nameAr.trim()) e.nameAr = true;
    if (!f.nameEn.trim()) e.nameEn = true;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.email.trim())) e.email = true;
    if (f.pw.length < 8) e.pw = true;
    if (f.pw !== f.pw2 || !f.pw2) e.pw2 = true;
    setErr(e);
    if (Object.keys(e).length) return;
    const first = (v) => (v.trim().split(/\s+/)[0] || v);
    const user = {
      national_id: f.national_id.trim(), pin: f.pw,
      name: { ar: f.nameAr.trim(), en: f.nameEn.trim() },
      first: { ar: first(f.nameAr), en: first(f.nameEn) },
      email: f.email.trim(),
      ...award,
      external: { ...EXTERNAL_STUB, nafathVerified: true },
    };
    setBusy(true);
    let saved;
    try {
      saved = await userStore.register(user);
    } catch (ex) {
      /* register() already falls back to local storage, so reaching here means
         something unexpected — still let the person through rather than
         stranding them on a form that looks broken. */
      console.error('register failed', ex);
      const { pin, ...safe } = user; saved = safe;
    } finally { setBusy(false); }
    setStep(3);
    setTimeout(() => onDone(saved), 1200);
  };

  return (
    <div className="rq-auth">
      <div className="rq-card rq-auth-card rq-rise rq-reg">
        <div className="rq-auth-brand"><Mark size={40} /></div>

        
        {/* While Nafath is checking, the sheet shows only the animation — a
            half-disabled form underneath is what invites the browser to put its
            own AutoFill panel on top. */}
        {step === 1 && verifying && (
          <div className="rq-verify">
            <RafeeqDraw size={132} loop />
            <h2>{ar ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0639\u0628\u0631 \u0646\u0641\u0627\u0630" : "Verifying through Nafath"}</h2>
            <p>{ar ? "\u0646\u0637\u0627\u0628\u0642 \u0631\u0642\u0645 \u0647\u0648\u064a\u062a\u0643 \u0645\u0639 \u0633\u062c\u0644 \u0627\u0644\u0648\u0632\u0627\u0631\u0629\u2026"
                  : "Matching your ID against the ministry record\u2026"}</p>
          </div>
        )}

        {step === 1 && !verifying && (<>
          <h2 className="rq-reg-h">{ar ? "\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643" : "Verify your identity"}</h2>
          <p className="rq-reg-sub">{ar
            ? "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0648\u064a\u062a\u0643 \u0648\u0633\u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0639\u0628\u0631 \u0646\u0641\u0627\u0630 \u2014 \u062b\u0645 \u0646\u0639\u0631\u0636 \u0639\u0644\u064a\u0643 \u0628\u0639\u062b\u062a\u0643."
            : "Enter your ID and we'll verify it through Nafath \u2014 then we'll show you the award on file."}</p>

          <label className="rq-f">{ar ? "\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064a\u0629" : "ID number"}
            <input className={err.id ? "err" : ""} value={f.national_id} onChange={set("national_id")}
              dir="ltr" inputMode="numeric" maxLength={10} placeholder="1102345678"
              autoComplete="off" autoCorrect="off" spellCheck={false} name="rq-id" />
            {err.id && <span className="rq-fe">{ar ? "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0648\u064a\u0629 \u0645\u0643\u0648\u0651\u0646\u064b\u0627 \u0645\u0646 \u0661\u0660 \u0623\u0631\u0642\u0627\u0645" : "Enter a valid 10-digit ID number"}</span>}
          </label>

          <label className="rq-f">{ar ? "\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642" : "Verification code"}
            <div className="rq-captcha">
              <div className="cap-box">
                <button type="button" className="refresh" onClick={() => setCode(newCapCode())} aria-label="New code"><Icon d={IC.refresh} size={15} /></button>
                <span className="cap-code">{code}</span>
              </div>
              <input className={err.cap ? "err" : ""} value={f.cap} onChange={set("cap")} dir="ltr" autoComplete="off"
                placeholder={ar ? "\u0627\u0643\u062a\u0628 \u0627\u0644\u0631\u0645\u0632" : "Type the code"} />
            </div>
            {err.cap && <span className="rq-fe">{ar ? "\u0627\u0644\u0631\u0645\u0632 \u063a\u064a\u0631 \u0645\u0637\u0627\u0628\u0642" : "Code doesn't match"}</span>}
          </label>

          <button type="button" className="rq-nafath" onClick={verify} disabled={verifying}>
            <span className="nf">نفاذ</span>
            {verifying ? (ar ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642\u2026" : "Verifying\u2026") : (ar ? "\u062a\u062d\u0642\u0651\u0642 \u0639\u0628\u0631 \u0646\u0641\u0627\u0630" : "Verify with Nafath")}
          </button>
          <p className="rq-stub-note" style={{ textAlign: "center" }}>
            {ar ? "\u0645\u062d\u0627\u0643\u0627\u0629 \u2014 \u063a\u064a\u0631 \u0645\u0631\u0628\u0648\u0637 \u0628\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0645\u0648\u062d\u062f\u0629 \u0627\u0644\u0641\u0639\u0644\u064a\u0629."
                : "Simulated \u2014 not connected to the real Unified SSO."}
          </p>
          <div className="rq-reg-actions">
            <button type="button" className="rq-btn rq-ghost" onClick={onCancel}>{ar ? "\u0631\u062c\u0648\u0639" : "Back"}</button>
          </div>
        </>)}

        {step === 2 && (<>
          <h2 className="rq-reg-h">{ar ? "\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643" : "Create your account"}</h2>
          <p className="rq-reg-sub">{ar
            ? "\u062a\u0645\u0651 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643. \u0647\u0630\u0647 \u0628\u0639\u062b\u062a\u0643 \u0627\u0644\u0645\u0633\u062c\u0651\u0644\u0629 \u0645\u0633\u0628\u0642\u064b\u0627 \u2014 \u0644\u0627 \u062a\u064f\u062f\u062e\u0644 \u064a\u062f\u0648\u064a\u064b\u0627."
            : "Identity verified. This is the award already on file for you \u2014 it isn't something you enter."}</p>

          {award && (
            <div className="rq-award-box">
              <div className="rq-award-badge">{ar ? "\u0635\u0627\u062f\u0631 \u0645\u0646 \u0628\u0631\u0646\u0627\u0645\u062c\u0643" : "Issued by your program"}</div>
              <div className="rq-award-grid">
                <div><span>{ar ? "\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c" : "Program"}</span><b>{award.program[lang]}</b></div>
                <div><span>{ar ? "\u0627\u0644\u062c\u0627\u0645\u0639\u0629" : "University"}</span><b>{award.university[lang]}{award.track === "ruwad" && <em className="rq-rank">{ar ? "\u0627\u0644\u062a\u0631\u062a\u064a\u0628 " : "Rank "}{award.uni_rank}</em>}</b></div><div><span>{ar ? "\u0627\u0644\u062f\u0648\u0644\u0629" : "Country"}</span><b>{award.country[lang]}</b></div>
                <div><span>{ar ? "\u0627\u0644\u062f\u0631\u062c\u0629 \u0648\u0627\u0644\u062a\u062e\u0635\u0635" : "Degree & major"}</span><b>{award.degree[lang]} · {award.major[lang]}</b></div>
                <div><span>{ar ? "\u0641\u0635\u0644 \u0627\u0644\u0628\u062f\u0627\u064a\u0629" : "Start term"}</span><b>{award.startTerm[lang]}</b></div>
                <div className="wide"><span>{ar ? "\u0627\u0644\u0645\u062e\u0635\u0635 \u0627\u0644\u0634\u0647\u0631\u064a" : "Monthly stipend"}</span><b className="mono" dir="ltr">{awardBoth(award)}</b></div>
              </div>
            </div>
          )}

          <div className="rq-reg-grid">
            <label>{ar ? "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "Full name (Arabic)"}
              <input className={err.nameAr ? "err" : ""} value={f.nameAr} onChange={set("nameAr")} dir="rtl" /></label>
            <label>{ar ? "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629" : "Full name (English)"}
              <input className={err.nameEn ? "err" : ""} value={f.nameEn} onChange={set("nameEn")} dir="ltr" /></label>
            <label className="wide">{ar ? "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" : "Email"}
              <input className={err.email ? "err" : ""} value={f.email} onChange={set("email")} dir="ltr" placeholder="you@nyu.edu" /></label>
            <label>{ar ? "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" : "Password"}
              <input className={err.pw ? "err" : ""} type="password" value={f.pw} onChange={set("pw")} dir="ltr"
                placeholder={ar ? "\u0668 \u0623\u062d\u0631\u0641 \u0641\u0623\u0643\u062b\u0631" : "Min. 8 characters"} /></label>
            <label>{ar ? "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" : "Confirm password"}
              <input className={err.pw2 ? "err" : ""} type="password" value={f.pw2} onChange={set("pw2")} dir="ltr" /></label>
          </div>
          {(err.nameAr || err.nameEn || err.pw || err.pw2 || err.email) && (
            <div className="rq-auth-err">
              {err.nameAr ? (ar ? "\u0623\u062f\u062e\u0644 \u0627\u0633\u0645\u0643 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629. " : "Enter your name in Arabic. ") : ""}
              {err.nameEn ? (ar ? "\u0623\u062f\u062e\u0644 \u0627\u0633\u0645\u0643 \u0628\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629. " : "Enter your name in English. ") : ""}
              {err.email ? (ar ? "\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u064b\u0627 \u0635\u062d\u064a\u062d\u064b\u0627. " : "Enter a valid email. ") : ""}
              {err.pw ? (ar ? "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0668 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644. " : "Password must be 8+ characters. ") : ""}
              {err.pw2 ? (ar ? "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646." : "Passwords don't match.") : ""}
            </div>
          )}
          <div className="rq-reg-actions">
            <button type="button" className="rq-btn rq-ghost" onClick={() => setStep(1)}>{ar ? "\u0631\u062c\u0648\u0639" : "Back"}</button>
            <button type="button" className="rq-btn rq-primary" onClick={submit} disabled={busy}>
              {busy
                ? <><RafeeqDraw size={22} loop />{ar ? "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0646\u0634\u0627\u0621\u2026" : "Creating\u2026"}</>
                : (ar ? "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628" : "Create account")}
            </button>
          </div>
        </>)}

        {step === 3 && (
          <div className="rq-survey-done">
            <div className="rq-survey-check"><Icon d={IC.check} size={30} /></div>
            <h2>{ar ? "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628" : "Account created"}</h2>
            <p className="rq-reg-sub">{ar ? "\u0644\u0646\u0628\u062f\u0623 \u0625\u0639\u062f\u0627\u062f \u0627\u0628\u062a\u0639\u0627\u062b\u0643\u2026" : "Let's set up your scholarship\u2026"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
