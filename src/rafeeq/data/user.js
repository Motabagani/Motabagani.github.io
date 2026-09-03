import { AWARD_SAR } from "./domain.js";

/* Demo scholarship holder — replaced by the signed-in user at runtime. */
export const DEMO_USER = {
  national_id: "1102345678",
  password: "demo1234",
  name: { ar: "هاشم مطبقاني", en: "Hashim Motabagani" },
  first: { ar: "هاشم", en: "Hashim" },
  award_sar: AWARD_SAR,
  currency: "USD",
  program: { ar: "برنامج خادم الحرمين الشريفين للابتعاث — مسار إمداد", en: "Custodian of the Two Holy Mosques Scholarship Program — Imdad path" },
  university: { ar: "جامعة نيويورك", en: "New York University" },
  degree: { ar: "بكالوريوس · علوم الحاسب والاقتصاد", en: "Bachelor's · Computer Science & Economics" },
  major: { ar: "علوم الحاسب والاقتصاد", en: "Computer Science & Economics" },
  startTerm: { ar: "خريف ٢٠٢٦", en: "Fall 2026" },
  external: { nafathVerified: true, qiyas: null, highSchool: null },
};
/* ---- Ported reference data (countries, visa classes, airports) ---- */
