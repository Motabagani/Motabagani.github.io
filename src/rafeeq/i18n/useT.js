import { STR } from "./strings.js";

export function makeT(lang) {
  return (key, vars) => {
    const s = STR[key];
    if (!s) { console.warn("MISSING STRING:", key); return key; }
    let out = s[lang] || s.en;
    if (vars) for (const k of Object.keys(vars)) out = out.replaceAll(`{${k}}`, String(vars[k]));
    return out;
  };
}
