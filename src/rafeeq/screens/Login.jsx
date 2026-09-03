import { useState } from "react";
import { Icon, IC } from "../ui/Icon.jsx";
import { Mark } from "../ui/Mark.jsx";
import { digitsOnly } from "../lib/num.js";
import { Field } from "../ui/atoms.jsx";
import { DEMO_USER } from "../data/user.js";
import { userStore } from "../storage/legacy.js";

export function Login({ t, lang, setLang, theme, setTheme, onSignIn, onRegister }) {
  const [nafath, setNafath]     = useState(false);
  const [nfStep, setNfStep]     = useState(1);
  const [nfId, setNfId]         = useState("");
  const [nfIdErr, setNfIdErr]   = useState(false);
  const [nfNameAr, setNfNameAr] = useState("");
  const [nfNameEn, setNfNameEn] = useState("");
  const arL = lang === "ar";

  const openNafath = () => {
    setNfStep(1); setNfId(""); setNfIdErr(false);
    setNfNameAr(""); setNfNameEn(""); setNafath(true);
  };
  const nfIdNext = () => {
    if (!/^\d{10}$/.test(nfId.trim())) { setNfIdErr(true); return; }
    setNfIdErr(false); setNfStep(2);
  };
  const nafathGo = () => {
    const nAr = nfNameAr.trim(), nEn = nfNameEn.trim();
    if (!nAr || !nEn) return;
    const first = (v) => (v.split(/\s+/)[0] || v);
    onSignIn({ ...DEMO_USER,
      national_id: nfId.trim(),
      name:  { ar: nAr, en: nEn },
      first: { ar: first(nAr), en: first(nEn) },
      major: DEMO_USER.major,
      degree: DEMO_USER.degree,
      nafath: true });
  };
  const [id, setId] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(null);
  const submit = async () => {
    if (id.trim() === DEMO_USER.national_id && pw === DEMO_USER.password) { setErr(null); return onSignIn(DEMO_USER); }
    const u = await userStore.login(id.trim(), pw);
    if (u) { setErr(null); return onSignIn(u); }
    /* Tell the two failures apart where we can: an ID with no account at all
       gets the "no account" hint, a known ID gets "wrong password". */
    const local = userStore.loadLocal();
    const known = id.trim() === DEMO_USER.national_id
      || (local && String(local.national_id) === String(id.trim()));
    setErr(known ? "pw" : "id");
  };
  return (
    <div className="rq-auth">
      <div className="langsw">
        <button type="button" className="rq-btn rq-ghost" style={{ padding: "8px 14px" }} onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          <Icon d={IC.globe} size={16} />{lang === "ar" ? "English" : "العربية"}
        </button>
        <button type="button" className="rq-btn rq-ghost" style={{ padding: "8px 12px" }} aria-label={t("chrome.theme")} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Icon d={theme === "dark" ? IC.sun : IC.moon} size={16} />
        </button>
      </div>
      <div className="rq-card rq-auth-card rq-rise">
        <div className="rq-auth-brand">
          <Mark size={52} theme={theme} />
          <h1>{t("brand.name")}</h1>
          <div className="tg">{t("brand.tag")}</div>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBlockEnd: 20 }}>{t("login.sub")}</p>
        <Field label={t("login.id")} required error={err === "id"} hint={t("login.err.id")}>
          <input value={id} onChange={e => setId(digitsOnly(e.target.value, 10))} placeholder={t("login.id.ph")} inputMode="numeric" autoComplete="username" dir="ltr" style={{ textAlign: "start" }} />
        </Field>
        <Field label={t("login.password")} required error={err === "pw"} hint={t("login.err.pw")}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={t("login.password.ph")} autoComplete="current-password" onKeyDown={e => e.key === "Enter" && submit()} />
        </Field>
        <button type="button" className="rq-btn rq-primary" style={{ width: "100%" }} onClick={submit}>
          {t("login.btn")}<Icon d={IC.next} dir />
        </button>
        <div className="rq-divider">{t("login.or")}</div>
        <button type="button" className="rq-nafath" onClick={openNafath}><span className="nf">نفاذ</span>{t("login.nafath")}</button>
        <button type="button" className="rq-btn rq-ghost" style={{ width: "100%", marginBlockStart: 10 }} onClick={onRegister}>{lang === "ar" ? "إنشاء حساب جديد" : "Create a new account"}</button>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBlockStart: 16 }}>{t("login.demo")}</p>
        <p className="rq-disc">{t("brand.disclaimer")}</p>
        {nafath && (
          <div className="rq-modal-scrim" onClick={() => setNafath(false)}>
            <div className="rq-card rq-nf-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="rq-nf-head"><span className="nf">نفاذ</span>
                <h2>{arL ? "الدخول عبر نفاذ" : "Sign in with Nafath"}</h2></div>

              {nfStep === 1 && (<>
                <p className="rq-nf-sub">{arL
                  ? "أدخل رقم هويتك الوطنية أو الإقامة للتحقق عبر نفاذ."
                  : "Enter your national ID or Iqama number to verify through Nafath."}</p>
                <label className="rq-nf-f">{arL ? "رقم الهوية" : "ID number"}
                  <input value={nfId} autoFocus dir="ltr" inputMode="numeric" maxLength={10}
                    className={nfIdErr ? "err" : ""} placeholder="1102345678"
                    onChange={(e) => { setNfId(digitsOnly(e.target.value, 10)); setNfIdErr(false); }}
                    onKeyDown={(e) => e.key === "Enter" && nfIdNext()} /></label>
                {nfIdErr && <span className="rq-fe">{arL
                  ? "أدخل رقم هوية مكوّنًا من ١٠ أرقام"
                  : "Enter a valid 10-digit ID number"}</span>}
                <div className="rq-nf-act">
                  <button type="button" className="rq-btn rq-ghost" onClick={() => setNafath(false)}>{arL ? "رجوع" : "Back"}</button>
                  <button type="button" className="rq-btn rq-primary" onClick={nfIdNext} disabled={!nfId.trim()}>{arL ? "متابعة" : "Continue"}</button>
                </div>
              </>)}

              {nfStep === 2 && (<>
                <p className="rq-nf-sub">{arL
                  ? "عرّفنا بنفسك لنخصّص رحلتك."
                  : "Tell us who you are so we can tailor your journey."}</p>
                <label className="rq-nf-f">{arL ? "الاسم بالعربية" : "Name in Arabic"}
                  <input value={nfNameAr} onChange={(e) => setNfNameAr(e.target.value)} autoFocus dir="rtl"
                    placeholder={arL ? "اسمك الكامل بالعربية" : "Full name in Arabic"} /></label>
                <label className="rq-nf-f">{arL ? "الاسم بالإنجليزية" : "Name in English"}
                  <input value={nfNameEn} onChange={(e) => setNfNameEn(e.target.value)} dir="ltr"
                    placeholder={arL ? "الاسم الكامل بالإنجليزية" : "Full name in English"} /></label>
                <p className="rq-stub-note">{arL
                  ? "في التكامل الفعلي، يُرجِع نفاذ اسمك بالعربية والإنجليزية مرتبطًا برقم هويتك دون إدخال. نطلبه هنا فقط لتخصيص تجربتك في هذه المحاكاة."
                  : "In a live integration, Nafath returns your Arabic and English name linked to your ID — you'd never type it. We ask here only to personalize your experience in this simulation."}</p>
                <div className="rq-nf-act">
                  <button type="button" className="rq-btn rq-ghost" onClick={() => setNfStep(1)}>{arL ? "رجوع" : "Back"}</button>
                  <button type="button" className="rq-btn rq-primary" onClick={nafathGo}
                    disabled={!nfNameAr.trim() || !nfNameEn.trim()}>{arL ? "متابعة" : "Continue"}</button>
                </div>
              </>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
