/* Everything the MOE or the cultural mission can issue into Files. */
export const DOC_TYPES = {
  award: {
    code: "AWD", issuer: "moe", icon: "seal",
    title: { ar: "قرار الابتعاث", en: "Scholarship award decision" },
    sub:   { ar: "يثبت ابتعاثك ومسارك وجهة الدراسة.", en: "Confirms your scholarship, track and destination." },
  },
  fgAdmission: {
    code: "FGA", issuer: "sacm", icon: "doc",
    title: { ar: "الضمان المالي للقبول", en: "Admission financial guarantee" },
    sub:   { ar: "يُقدَّم للجامعة لإصدار القبول والـ I-20، وللسفارة مع طلب التأشيرة.", en: "Presented to the university for admission and the I-20, and to the embassy with your visa application." },
  },
  fgAcademic: {
    code: "FGT", issuer: "sacm", icon: "cap",
    title: { ar: "الضمان المالي الأكاديمي", en: "Academic financial guarantee" },
    sub:   { ar: "يغطي رسوم الفصل الدراسي المعتمد ويُقدَّم لإدارة القبول والتسجيل.", en: "Covers the approved term's tuition; presented to the registrar." },
  },
};
export const ISSUERS = {
  moe:  { ar: "وزارة التعليم", en: "Ministry of Education", short: "MOE" },
  sacm: { ar: "الملحقية الثقافية", en: "Saudi Arabian Cultural Mission", short: "SACM" },
};
