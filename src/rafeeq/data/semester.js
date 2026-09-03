export const SEM_SYSTEMS = [
  { k: "semester",  ar: "فصلي (سمستر)",   en: "Semester" },
  { k: "trimester", ar: "ثلاثي (ترمستر)",  en: "Trimester" },
  { k: "quarter",   ar: "ربعي (كوارتر)",   en: "Quarter" },
  { k: "yearly",    ar: "سنوي",            en: "Yearly" },
];
export const TERM_ORDINALS = [
  { k: "1", ar: "الفصل الأول",  en: "1st term" },
  { k: "2", ar: "الفصل الثاني", en: "2nd term" },
  { k: "3", ar: "الفصل الثالث", en: "3rd term" },
  { k: "4", ar: "الفصل الرابع", en: "4th term" },
];

export const semValidate = d => {
  const e = [];
  if (!d.semStart) e.push("semStart");
  if (!d.semEnd || (d.semStart && d.semEnd <= d.semStart)) e.push("semEnd");
  return e;
};
/* The academic year comes off the start date — nobody types it. */
export const semYearOf = d => ((d && d.semStart) || "").slice(0, 4);
