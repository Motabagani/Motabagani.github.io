/* Reference tables that are the same in every session. */
export const AWARD_SAR = 6512.50;
export const CURRENCY = {
  US: { code: "USD", rate: 1 / 3.75, ar: "\u062f\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064a\u0643\u064a" },
  UK: { code: "GBP", rate: 0.21,     ar: "\u062c\u0646\u064a\u0647 \u0625\u0633\u062a\u0631\u0644\u064a\u0646\u064a" },
  CA: { code: "CAD", rate: 0.36,     ar: "\u062f\u0648\u0644\u0627\u0631 \u0643\u0646\u062f\u064a" },
  CN: { code: "CNY", rate: 1.90,     ar: "\u064a\u0648\u0627\u0646 \u0635\u064a\u0646\u064a" },
  CH: { code: "CHF", rate: 0.213,    ar: "\u0641\u0631\u0646\u0643 \u0633\u0648\u064a\u0633\u0631\u064a" },
  SG: { code: "SGD", rate: 0.343,    ar: "\u062f\u0648\u0644\u0627\u0631 \u0633\u0646\u063a\u0627\u0641\u0648\u0631\u064a" },
  JP: { code: "JPY", rate: 41.5,     ar: "\u064a\u0646 \u064a\u0627\u0628\u0627\u0646\u064a" },
  FR: { code: "EUR", rate: 0.245,    ar: "\u064a\u0648\u0631\u0648" },
};
export const COUNTRY = {
  US: { en: "United States",  ar: "\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629 \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a\u0629" },
  UK: { en: "United Kingdom", ar: "\u0628\u0631\u064a\u0637\u0627\u0646\u064a\u0627" },
  CA: { en: "Canada",         ar: "\u0643\u0646\u062f\u0627" },
  CN: { en: "China",          ar: "\u0627\u0644\u0635\u064a\u0646" },
  CH: { en: "Switzerland",    ar: "\u0633\u0648\u064a\u0633\u0631\u0627" },
  SG: { en: "Singapore",      ar: "\u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629" },
  JP: { en: "Japan",          ar: "\u0627\u0644\u064a\u0627\u0628\u0627\u0646" },
  FR: { en: "France",         ar: "\u0641\u0631\u0646\u0633\u0627" },
};
/* \u0645\u0633\u0627\u0631 \u0627\u0644\u0631\u0648\u0627\u062f \u2014 the approved universities, in rank order. This is the full list; nothing outside it. */
export const UNIS = [
  { r: 1,  en: "Harvard University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0647\u0627\u0631\u0641\u0627\u0631\u062f", c: "US" },
  { r: 2,  en: "Stanford University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0633\u062a\u0627\u0646\u0641\u0648\u0631\u062f", c: "US" },
  { r: 3,  en: "Massachusetts Institute of Technology", ar: "\u0645\u0639\u0647\u062f \u0645\u0627\u0633\u0627\u062a\u0634\u0648\u0633\u062a\u0633 \u0644\u0644\u062a\u0642\u0646\u064a\u0629", c: "US" },
  { r: 4,  en: "University of Cambridge", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0645\u0628\u0631\u062f\u062c", c: "UK" },
  { r: 5,  en: "University of California Berkeley", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0628\u064a\u0631\u0643\u0644\u064a", c: "US" },
  { r: 6,  en: "University of Oxford", ar: "\u062c\u0627\u0645\u0639\u0629 \u0623\u0643\u0633\u0641\u0648\u0631\u062f", c: "UK" },
  { r: 7,  en: "Princeton University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0631\u064a\u0646\u0633\u062a\u0648\u0646", c: "US" },
  { r: 8,  en: "Columbia University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0648\u0644\u0648\u0645\u0628\u064a\u0627", c: "US" },
  { r: 9,  en: "California Institute of Technology", ar: "\u0645\u0639\u0647\u062f \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0644\u0644\u062a\u0642\u0646\u064a\u0629", c: "US" },
  { r: 10, en: "University of Chicago", ar: "\u062c\u0627\u0645\u0639\u0629 \u0634\u064a\u0643\u0627\u063a\u0648", c: "US" },
  { r: 11, en: "Yale University", ar: "\u062c\u0627\u0645\u0639\u0629 \u064a\u0627\u0644", c: "US" },
  { r: 12, en: "Cornell University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0648\u0631\u0646\u064a\u0644", c: "US" },
  { r: 13, en: "UCL", ar: "\u064a\u0648\u0646\u064a\u0641\u0631\u0633\u062a\u064a \u0643\u0648\u0644\u064a\u062c \u0644\u0646\u062f\u0646", c: "UK" },
  { r: 14, en: "University of Pennsylvania", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0646\u0633\u0644\u0641\u0627\u0646\u064a\u0627", c: "US" },
  { r: 15, en: "University of California Los Angeles", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0644\u0648\u0633 \u0623\u0646\u062c\u0644\u0648\u0633", c: "US" },
  { r: 16, en: "University of Washington", ar: "\u062c\u0627\u0645\u0639\u0629 \u0648\u0627\u0634\u0646\u0637\u0646", c: "US" },
  { r: 17, en: "Tsinghua University", ar: "\u062c\u0627\u0645\u0639\u0629 \u062a\u0633\u064a\u0646\u063a\u0647\u0648\u0627", c: "CN" },
  { r: 18, en: "Johns Hopkins University", ar: "\u062c\u0627\u0645\u0639\u0629 \u062c\u0648\u0646\u0632 \u0647\u0648\u0628\u0643\u0646\u0632", c: "US" },
  { r: 19, en: "ETH Zurich", ar: "\u0627\u0644\u0645\u0639\u0647\u062f \u0627\u0644\u062a\u0642\u0646\u064a \u0627\u0644\u0627\u062a\u062d\u0627\u062f\u064a \u2014 \u0632\u064a\u0648\u0631\u062e", c: "CH" },
  { r: 20, en: "Peking University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0643\u064a\u0646", c: "CN" },
  { r: 21, en: "University of Toronto", ar: "\u062c\u0627\u0645\u0639\u0629 \u062a\u0648\u0631\u0646\u062a\u0648", c: "CA" },
  { r: 22, en: "Imperial College London", ar: "\u0625\u0645\u0628\u0631\u064a\u0627\u0644 \u0643\u0648\u0644\u064a\u062c \u0644\u0646\u062f\u0646", c: "UK" },
  { r: 23, en: "National University of Singapore", ar: "\u062c\u0627\u0645\u0639\u0629 \u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629 \u0627\u0644\u0648\u0637\u0646\u064a\u0629", c: "SG" },
  { r: 24, en: "Carnegie Mellon University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0631\u0646\u064a\u062c\u064a \u0645\u064a\u0644\u0648\u0646", c: "US" },
  { r: 25, en: "University of Michigan Ann Arbor", ar: "\u062c\u0627\u0645\u0639\u0629 \u0645\u064a\u062a\u0634\u064a\u062c\u0627\u0646 \u2014 \u0622\u0646 \u0623\u0631\u0628\u0631", c: "US" },
  { r: 26, en: "University of Tokyo", ar: "\u062c\u0627\u0645\u0639\u0629 \u0637\u0648\u0643\u064a\u0648", c: "JP" },
  { r: 27, en: "Universit\u00e9 Paris Saclay", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0627\u0631\u064a\u0633 \u0633\u0627\u0643\u0644\u0627\u064a", c: "FR" },
  { r: 28, en: "University of California San Diego", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0633\u0627\u0646 \u062f\u064a\u064a\u063a\u0648", c: "US" },
  { r: 29, en: "Zhejiang University", ar: "\u062c\u0627\u0645\u0639\u0629 \u062c\u064a\u062c\u064a\u0627\u0646\u063a", c: "CN" },
  { r: 30, en: "Washington University in St Louis", ar: "\u062c\u0627\u0645\u0639\u0629 \u0648\u0627\u0634\u0646\u0637\u0646 \u0641\u064a \u0633\u0627\u0646\u062a \u0644\u0648\u064a\u0633", c: "US" },
];
export const DEGREES = [
  { en: "Bachelor\u2019s",     ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064a\u0648\u0633", lvl: "ug" },
  { en: "Master\u2019s",       ar: "\u0645\u0627\u062c\u0633\u062a\u064a\u0631",             lvl: "ug" },
  { en: "Doctorate (PhD)",  ar: "\u062f\u0643\u062a\u0648\u0631\u0627\u0647",           lvl: "phd" },
];
/* Track rules: \u0625\u0645\u062f\u0627\u062f and \u0627\u0644\u0631\u0648\u0627\u062f cover bachelor\u2019s + master\u2019s;
   \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u062a\u0637\u0648\u064a\u0631 is the doctorate track. \u0627\u0644\u0631\u0648\u0627\u062f is restricted to the ranked list above. */
export const PROGRAMS = {
  ug: [
    { key: "imdad", ar: "\u0628\u0631\u0646\u0627\u0645\u062c \u062e\u0627\u062f\u0645 \u0627\u0644\u062d\u0631\u0645\u064a\u0646 \u0627\u0644\u0634\u0631\u064a\u0641\u064a\u0646 \u0644\u0644\u0627\u0628\u062a\u0639\u0627\u062b \u2014 \u0645\u0633\u0627\u0631 \u0625\u0645\u062f\u0627\u062f",
      en: "Custodian of the Two Holy Mosques Scholarship Program \u2014 Imdad path" },
    { key: "ruwad", ar: "\u0628\u0631\u0646\u0627\u0645\u062c \u062e\u0627\u062f\u0645 \u0627\u0644\u062d\u0631\u0645\u064a\u0646 \u0627\u0644\u0634\u0631\u064a\u0641\u064a\u0646 \u0644\u0644\u0627\u0628\u062a\u0639\u0627\u062b \u2014 \u0645\u0633\u0627\u0631 \u0627\u0644\u0631\u0648\u0627\u062f",
      en: "Custodian of the Two Holy Mosques Scholarship Program \u2014 Ruwad path" },
  ],
  phd: [
    { key: "rd", ar: "\u0628\u0631\u0646\u0627\u0645\u062c \u062e\u0627\u062f\u0645 \u0627\u0644\u062d\u0631\u0645\u064a\u0646 \u0627\u0644\u0634\u0631\u064a\u0641\u064a\u0646 \u0644\u0644\u0627\u0628\u062a\u0639\u0627\u062b \u2014 \u0645\u0633\u0627\u0631 \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u062a\u0637\u0648\u064a\u0631",
      en: "Custodian of the Two Holy Mosques Scholarship Program \u2014 Research & Development path" },
  ],
};
export const MAJORS = [
  { en: "Computer Science", ar: "\u0639\u0644\u0648\u0645 \u0627\u0644\u062d\u0627\u0633\u0628" },
  { en: "Computer Science & Economics", ar: "\u0639\u0644\u0648\u0645 \u0627\u0644\u062d\u0627\u0633\u0628 \u0648\u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f" },
  { en: "Software Engineering", ar: "\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0628\u0631\u0645\u062c\u064a\u0627\u062a" },
  { en: "Electrical Engineering", ar: "\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629" },
  { en: "Mechanical Engineering", ar: "\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a\u0629" },
  { en: "Civil Engineering", ar: "\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0645\u062f\u0646\u064a\u0629" },
  { en: "Data Science", ar: "\u0639\u0644\u0645 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a" },
  { en: "Artificial Intelligence", ar: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" },
  { en: "Cybersecurity", ar: "\u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064a\u0628\u0631\u0627\u0646\u064a" },
  { en: "Business Administration", ar: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644" },
  { en: "Finance", ar: "\u0627\u0644\u062a\u0645\u0648\u064a\u0644" },
  { en: "Accounting", ar: "\u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629" },
  { en: "Economics", ar: "\u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f" },
  { en: "Law", ar: "\u0627\u0644\u0642\u0627\u0646\u0648\u0646" },
  { en: "Medicine", ar: "\u0627\u0644\u0637\u0628" },
  { en: "Pharmacy", ar: "\u0627\u0644\u0635\u064a\u062f\u0644\u0629" },
  { en: "Public Health", ar: "\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0639\u0627\u0645\u0629" },
  { en: "Chemistry", ar: "\u0627\u0644\u0643\u064a\u0645\u064a\u0627\u0621" },
  { en: "Physics", ar: "\u0627\u0644\u0641\u064a\u0632\u064a\u0627\u0621" },
  { en: "Mathematics", ar: "\u0627\u0644\u0631\u064a\u0627\u0636\u064a\u0627\u062a" },
  { en: "Architecture", ar: "\u0627\u0644\u0639\u0645\u0627\u0631\u0629" },
  { en: "Graphic Design", ar: "\u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u062c\u0631\u0627\u0641\u064a\u0643\u064a" },
  { en: "Media & Journalism", ar: "\u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0648\u0627\u0644\u0635\u062d\u0627\u0641\u0629" },
  { en: "Political Science", ar: "\u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0633\u064a\u0627\u0633\u064a\u0629" },
  { en: "International Relations", ar: "\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u062f\u0648\u0644\u064a\u0629" },
  { en: "Psychology", ar: "\u0639\u0644\u0645 \u0627\u0644\u0646\u0641\u0633" },
  { en: "Education", ar: "\u0627\u0644\u062a\u0631\u0628\u064a\u0629" },
];
export const TERMS = [
  { en: "Fall 2026",   ar: "\u062e\u0631\u064a\u0641 \u0662\u0660\u0662\u0666" },
  { en: "Spring 2027", ar: "\u0631\u0628\u064a\u0639 \u0662\u0660\u0662\u0667" },
  { en: "Summer 2027", ar: "\u0635\u064a\u0641 \u0662\u0660\u0662\u0667" },
  { en: "Fall 2027",   ar: "\u062e\u0631\u064a\u0641 \u0662\u0660\u0662\u0667" },
];

/* Combobox — type to filter, click to pick, free text still allowed.
   Mirrors the airport picker UX. */
export const EXTERNAL_STUB = {
  nafathVerified: false,   // إدارة الهوية الموحدة (Nafath) — identity verification
  qiyas: null,             // قياس — Qudurat / aptitude scores
  highSchool: null,        // وزارة التعليم / مركز المعلومات الوطني — high-school data
};
