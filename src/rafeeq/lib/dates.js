import { num, toLatinDigits } from "./num.js";
/* Calendar helpers shared by DateField and the date-storing steps. */
export const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
export const WD_EN = ["Su","Mo","Tu","We","Th","Fr","Sa"];
export const WD_AR = ["ح","ن","ث","ر","خ","ج","س"];

export const isoOf = (y, m, d) => y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
export const parseIso = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
};
export const pad2 = (n) => String(n).padStart(2, "0");
export const isoToDmy = (iso) => { const p = parseIso(iso); return p ? `${pad2(p.d)}/${pad2(p.m + 1)}/${p.y}` : ""; };
/* Type "1522027" and get "15/2/2027" — slashes are inserted, nothing else is. */
export const maskDmy = (s) => {
  const dg = toLatinDigits(s || "").replace(/[^\d]/g, "").slice(0, 8);
  if (dg.length <= 2) return dg;
  if (dg.length <= 4) return dg.slice(0, 2) + "/" + dg.slice(2);
  return dg.slice(0, 2) + "/" + dg.slice(2, 4) + "/" + dg.slice(4);
};
export const dmyToIso = (s) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((s || "").trim());
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  if (mo < 1 || mo > 12 || d < 1) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return isoOf(y, mo - 1, d);
};
export const fmtDate = (iso, lang) => {
  const p = parseIso(iso); if (!p) return "";
  const mn = (lang === "ar" ? MONTHS_AR : MONTHS_EN)[p.m];
  return lang === "ar" ? `${num(p.d, "ar")} ${mn} ${num(p.y, "ar")}` : `${p.d} ${mn.slice(0, 3)} ${p.y}`;
};
