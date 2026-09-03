import { num } from "../lib/num.js";
import { MAJORS } from "./domain.js";

/* Simulated Ministry-of-Education academic history, degree-aware. */
export const HS_TYPES = [
  { k: "sci",  ar: "ثانوي علمي", en: "Secondary — Science track" },
  { k: "lit",  ar: "ثانوي أدبي", en: "Secondary — Humanities track" },
  { k: "us",   ar: "ثانوي أمريكي", en: "American high school diploma" },
  { k: "uk",   ar: "ثانوي بريطاني", en: "British curriculum (IGCSE / A-Level)" },
  { k: "out",  ar: "مدرسة خارج المملكة", en: "School outside the Kingdom" },
];
export const MOE_HS = [
  { ar: "ثانوية الملك فهد — الرياض", en: "King Fahd Secondary School — Riyadh" },
  { ar: "ثانوية الأمير سلطان — جدة", en: "Prince Sultan Secondary School — Jeddah" },
  { ar: "مدارس الرياض — الرياض", en: "Riyadh Schools — Riyadh" },
  { ar: "ثانوية الملك عبدالعزيز — الدمام", en: "King Abdulaziz Secondary School — Dammam" },
  { ar: "مدارس المنارات — جدة", en: "Al-Manarat Schools — Jeddah" },
];
/* Schools on file when the record is for a school outside the Kingdom. */
export const MOE_HS_INTL = [
  { school: { ar: "المدرسة السعودية — واشنطن", en: "Saudi Academy — Washington" }, country: "United States" },
  { school: { ar: "مدرسة الملك فهد — لندن", en: "King Fahad Academy — London" }, country: "United Kingdom" },
  { school: { ar: "المدرسة السعودية — القاهرة", en: "Saudi School — Cairo" }, country: "Egypt" },
  { school: { ar: "المدرسة السعودية — عمّان", en: "Saudi School — Amman" }, country: "Jordan" },
  { school: { ar: "المدرسة السعودية — دبي", en: "Saudi School — Dubai" }, country: "United Arab Emirates" },
  { school: { ar: "أكاديمية الرياض الدولية — تورنتو", en: "International Academy — Toronto" }, country: "Canada" },
];
export const SAUDI_UNIS = [
  { ar: "جامعة الملك سعود", en: "King Saud University" },
  { ar: "جامعة الملك عبدالعزيز", en: "King Abdulaziz University" },
  { ar: "جامعة الملك فهد للبترول والمعادن", en: "King Fahd University of Petroleum & Minerals" },
  { ar: "جامعة الإمام محمد بن سعود الإسلامية", en: "Imam Mohammad Ibn Saud Islamic University" },
  { ar: "جامعة الملك فيصل", en: "King Faisal University" },
  { ar: "جامعة أم القرى", en: "Umm Al-Qura University" },
  { ar: "جامعة الملك خالد", en: "King Khalid University" },
  { ar: "جامعة القصيم", en: "Qassim University" },
  { ar: "جامعة الأميرة نورة بنت عبدالرحمن", en: "Princess Nourah bint Abdulrahman University" },
  { ar: "جامعة طيبة", en: "Taibah University" },
];
export const KAUST = { ar: "جامعة الملك عبدالله للعلوم والتقنية (كاوست)", en: "King Abdullah University of Science & Technology (KAUST)" };
export const MASTERS_UNIS = SAUDI_UNIS.concat([KAUST]);

/* Which prior levels exist for a given awarded degree. */
export const priorLevels = (user) => {
  const d = ((user && user.degree && user.degree.en) || "").toLowerCase();
  if (d.includes("doctor") || d.includes("phd")) return ["hs", "bsc", "msc"];
  if (d.includes("master")) return ["hs", "bsc"];
  return ["hs"];
};

/* Drawn once per ladder shape and cached: a bachelor's candidate leaves high
   school a year or two ago, a doctorate candidate has a decade behind them. */
const _moeCache = {};
export function moeHistory(levels) {
  const key = levels.join("-");
  if (_moeCache[key]) return _moeCache[key];
  const r = a => a[Math.floor(Math.random() * a.length)];
  const j = n => Math.floor(Math.random() * n);
  const NOW = 2026;
  let mscYear = null, bscYear = null, hsYear;
  if (levels.includes("msc")) {
    mscYear = NOW - 1 - j(2);
    bscYear = mscYear - 2 - j(2);
    hsYear  = bscYear - 4 - j(2);
  } else if (levels.includes("bsc")) {
    bscYear = NOW - 1 - j(2);
    hsYear  = bscYear - 4 - j(2);
  } else {
    hsYear = NOW - j(2);
  }
  const hsType = r(HS_TYPES);
  const abroad = hsType.k === "out" ? r(MOE_HS_INTL) : null;
  const rec = {
    hs: {
      inst: abroad ? abroad.school : r(MOE_HS), type: hsType,
      country: abroad ? abroad.country : "Saudi Arabia",
      gpa: (92 + Math.random() * 7.9).toFixed(1), scale: 100, year: hsYear,
    },
    bsc: { inst: r(SAUDI_UNIS),   major: r(MAJORS), gpa: (3.90 + Math.random() * 1.09).toFixed(2), scale: 5, year: bscYear },
    msc: { inst: r(MASTERS_UNIS), major: r(MAJORS), gpa: (4.20 + Math.random() * 0.79).toFixed(2), scale: 5, year: mscYear },
  };
  _moeCache[key] = rec;
  return rec;
}
