/* Arabic-Indic digit rendering. */
const AR_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
export const num = (n, lang) => lang === "ar" ? String(n).replace(/[0-9]/g, d => AR_DIGITS[+d]) : String(n);

/* The inverse: fold Arabic-Indic (٠-٩) and Persian (۰-۹) digits back to ASCII.
   Arabic keyboards produce these, and every validator, mask and stored value
   expects 0-9 — without this, typing ٢٢١١ into a numeric field matches \D and
   gets silently deleted. Call it before any digit filtering. */
export const toLatinDigits = (s) => String(s == null ? "" : s)
  .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
  .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

/* Convenience for the common "digits only" input: normalise, then strip. */
export const digitsOnly = (s, max) => {
  const out = toLatinDigits(s).replace(/\D/g, "");
  return max ? out.slice(0, max) : out;
};
