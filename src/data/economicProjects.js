// Economic-models projects — same card shape as codingProjects, rendered by the
// homepage Economic Models section and the Economic Models page.

export const economicProjects = [
  {
    year: { en: '2026', ar: '٢٠٢٦' },
    type: { en: 'Independent research · Quantum + econometrics', ar: 'بحث مستقل · كمّي + اقتصاد قياسي' },
    title: { en: 'Ashom 1 — Quantum Equity Model', ar: 'أسهم ١ — نموذج الأسهم الكمّي' },
    description: {
      en: 'An independent hybrid quantum–econometric stock-classification framework — disclosure-first evidence, a disclosure-anchored company network, a 10-qubit fidelity kernel, and walk-forward validation. A research concept in progress.',
      ar: 'إطار مستقل هجين كمّي–اقتصادي لتصنيف الأسهم — الإفصاح أولًا، وشبكة شركات مثبّتة بالإفصاح، ونواة إخلاص بعشرة كيوبتات، وتحقّق تقدّمي. مفهوم بحثي قيد التطوير.',
    },
    tags: ['Quantum', 'Econometrics', 'TypeScript', 'Python'],
    status: 'current',
    image: '/images/ashom1-logo.png',
    href: (lang) => `/${lang}/projects/ashom1`,
  },
];
