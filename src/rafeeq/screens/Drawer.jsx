import { Icon, IC } from "../ui/Icon.jsx";
import { Mark } from "../ui/Mark.jsx";

export function Drawer({ t, lang, setLang, theme, setTheme, onClose, onHome, onFiles, onRequests, onReset }) {
  return (
    <>
      <div className="rq-scrim" onClick={onClose} />
      <nav className="rq-drawer" aria-label={t("chrome.menu")}>
        <div className="dh"><Mark size={30} theme={theme} /><b style={{ fontSize: 18 }}>{t("brand.name")}</b>
          <button type="button" onClick={onClose} style={{ marginInlineStart: "auto", fontSize: 22, color: "var(--ink-faint)", lineHeight: 1 }} aria-label={t("chrome.close")}>×</button></div>
        <button type="button" className="rq-ditem" onClick={() => { onHome(); onClose(); }}><Icon d={IC.home2} />{t("chrome.home")}</button>
        <button type="button" className="rq-ditem" onClick={() => { onFiles(); onClose(); }}><Icon d={IC.doc} />{t("files.title")}</button>
        <button type="button" className="rq-ditem" onClick={() => { onRequests(); onClose(); }}><Icon d={IC.clock} />{t("req.title")}</button>
        <div className="rq-dlabel">{t("chrome.language")}</div>
        <div className="rq-seg">
          <button type="button" className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>العربية</button>
          <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
        </div>
        <div className="rq-dlabel">{t("chrome.theme")}</div>
        <div className="rq-seg">
          <button type="button" className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>{t("chrome.theme.dark")}</button>
          <button type="button" className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>{t("chrome.theme.light")}</button>
        </div>
        <div style={{ marginBlockStart: "auto", paddingBlockStart: 14, borderBlockStart: "1px solid var(--line-soft)" }}>
          <button type="button" className="rq-ditem" onClick={onReset}><Icon d={IC.reset} />{t("chrome.reset")}</button>

        </div>
      </nav>
    </>
  );
}
