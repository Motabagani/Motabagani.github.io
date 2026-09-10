import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useLanguage } from '../LanguageContext';

const tex = (s) => ({ __html: katex.renderToString(s, { throwOnError: false, displayMode: true }) });

/* Ashom 1 — Quantum Equity Model concept showcase for the Economic Models page.
   The interactive scanner itself is still being built; this presents the concept,
   an authenticated (RFC 3161) timestamp proving when the working paper was posted,
   and the ownership + not-investment-advice notice. */

// Content fingerprint + trusted-timestamp facts (see public/docs/).
const PAPER = {
  url: '/docs/ashom1-quantum-equity-model.pdf',
  tsr: '/docs/ashom1.tsr',
  sha256: '84fe7ad8260fc6d6f9a74043d55a7e8b8a35900e8c7f3eedc266aab4856109e1',
  stampedEn: '8 Sep 2026, 20:01 UTC',
  stampedAr: '٨ سبتمبر ٢٠٢٦، ٢٠:٠١ ت.ع.م',
};

const QUBITS = [
  { en: 'Momentum', ar: 'الزخم' },
  { en: 'Volatility', ar: 'التقلب' },
  { en: 'Drawdown', ar: 'أقصى تراجع' },
  { en: 'Market β', ar: 'حساسية السوق' },
  { en: 'Market / network', ar: 'السوق / الشبكة' },
  { en: 'Fundamentals', ar: 'الأساسيات' },
  { en: 'Macro exposure', ar: 'التعرّض الكلي' },
  { en: 'Local perception', ar: 'الإدراك المحلي' },
  { en: 'International', ar: 'الإدراك الدولي' },
  { en: 'Perception gap', ar: 'فجوة الإدراك' },
];

const PILLARS = [
  {
    en: { t: 'Disclosure-first evidence', d: 'Official issuer filings outrank market feeds, macro series, and news. News can move a disclosure-supported relationship — it can never create one.' },
    ar: { t: 'الإفصاح أولًا', d: 'الإفصاحات الرسمية للشركات تتقدّم على بيانات السوق والمؤشرات الكلية والأخبار. الأخبار تُحرّك علاقة مثبّتة بالإفصاح ولا تنشئها.' },
  },
  {
    en: { t: 'Disclosure-anchored network', d: 'An edge between two firms exists only when a filing names the counterparty. Recent news then updates that edge — capped at ±20 points with a 30-day half-life.' },
    ar: { t: 'شبكة مثبّتة بالإفصاح', d: 'لا تنشأ العلاقة بين شركتين إلا إذا ذكر الإفصاح الطرف الآخر. ثم تحدّثها الأخبار بحدٍّ أقصى ±٢٠ نقطة وعمرٍ نصفي ٣٠ يومًا.' },
  },
  {
    en: { t: 'Ten-qubit feature map', d: 'A 10-qubit circuit with data re-uploading and ring-connected entanglement encodes the nonlinear interactions between the model factors.' },
    ar: { t: 'خريطة سمات بعشرة كيوبتات', d: 'دائرة من عشرة كيوبتات مع إعادة رفع البيانات وتشابك حلقي تُرمّز التفاعلات غير الخطية بين عوامل النموذج.' },
  },
  {
    en: { t: 'Quantum fidelity kernel', d: 'A fidelity kernel measures similarity in the quantum feature space; a benchmark-weighted kernel-ridge regression turns similarity into forecasts.' },
    ar: { t: 'نواة الإخلاص الكمّية', d: 'نواة إخلاص تقيس التشابه في فضاء السمات الكمّي، ثم انحدار ريدج نووي مُرجّح بالمؤشر يحوّل التشابه إلى تنبؤات.' },
  },
  {
    en: { t: 'Walk-forward + uncertainty', d: 'Non-overlapping walk-forward folds with a wild-cluster bootstrap build a forecast distribution; classification is gated by liquidity, coverage, and tail-risk vetoes.' },
    ar: { t: 'تقدير تقدّمي + عدم اليقين', d: 'نوافذ تقدّمية غير متداخلة مع bootstrap عنقودي تبني توزيع تنبؤ؛ ويُقيَّد التصنيف ببوابات السيولة والتغطية ومخاطر الذيل.' },
  },
  {
    en: { t: 'Falsification-first', d: 'No quantum advantage is claimed unless sealed walk-forward tests beat preregistered classical models after costs. A four-bank recommendation set stays sealed for out-of-sample comparison.' },
    ar: { t: 'قابلية الدحض أولًا', d: 'لا يُدّعى أي تفوّق كمّي ما لم تتغلّب اختبارات مغلقة على نماذج كلاسيكية مُسجّلة مسبقًا بعد التكاليف. وتبقى توصيات أربعة بنوك محجوبة للمقارنة خارج العينة.' },
  },
];

const HIERARCHY = [
  { en: 'Official issuer disclosures', ar: 'الإفصاحات الرسمية للشركات', role: { en: 'Company facts, named relationships, and disclosed risks — the primary source.', ar: 'حقائق الشركة والعلاقات المذكورة والمخاطر المُفصح عنها — المصدر الأساسي.' } },
  { en: 'Market feeds', ar: 'بيانات السوق', role: { en: 'Traded prices, volume, dividends, and splits that filings can’t give at market frequency.', ar: 'الأسعار والأحجام والتوزيعات والتجزئات التي لا توفّرها الإفصاحات بتواتر السوق.' } },
  { en: 'Official macro series', ar: 'السلاسل الكلية الرسمية', role: { en: 'GDP growth, inflation, and unemployment — with the release lag preserved.', ar: 'نمو الناتج والتضخم والبطالة — مع الحفاظ على تأخّر النشر.' } },
  { en: 'Cited news', ar: 'الأخبار الموثّقة', role: { en: 'Recent event tone only. News can move a disclosed relationship, never create one.', ar: 'نبرة الأحداث الحديثة فقط. تُحرّك الأخبار علاقة مُفصحًا عنها ولا تنشئها أبدًا.' } },
];

const STEPS = [
  { en: 'Collect disclosure-first data — filings, market feeds, macro series, and cited news, each timestamped, with missing inputs left explicit.', ar: 'جمع البيانات بمبدأ الإفصاح أولًا — الإفصاحات وبيانات السوق والسلاسل الكلية والأخبار الموثّقة، كلٌّ بختمٍ زمني، مع إبقاء المدخلات الناقصة ظاهرة.' },
  { en: 'Build the company network only from relationships an official filing names, then let recent news nudge those edges (capped ±20, 30-day half-life).', ar: 'بناء شبكة الشركات فقط من العلاقات التي يذكرها إفصاح رسمي، ثم تحريك تلك الروابط بالأخبار الحديثة (بحدٍّ ±٢٠ وعمرٍ نصفي ٣٠ يومًا).' },
  { en: 'Encode ten point-in-time factors into a 10-qubit feature map and measure similarity with a quantum fidelity kernel.', ar: 'ترميز عشرة عوامل مثبّتة زمنيًا في خريطة سمات بعشرة كيوبتات، وقياس التشابه بنواة إخلاص كمّية.' },
  { en: 'Turn similarity into a forecast with benchmark-weighted kernel-ridge regression, fit walk-forward on non-overlapping windows.', ar: 'تحويل التشابه إلى تنبؤ عبر انحدار ريدج نووي مُرجّح بالمؤشر، مُقدَّر تقدّميًا على نوافذ غير متداخلة.' },
  { en: 'Wrap it in a wild-cluster bootstrap for an uncertainty band, then classify — with liquidity, coverage, and tail-risk gates holding veto power.', ar: 'تغليفه بـ bootstrap عنقودي لنطاق عدم يقين، ثم التصنيف — مع بوابات السيولة والتغطية ومخاطر الذيل التي تملك حق النقض.' },
];

const OUTCOMES = [
  { c: { en: 'Insufficient data', ar: 'بيانات غير كافية' }, w: { en: 'Required inputs or uncertainty draws are missing.', ar: 'مدخلات مطلوبة أو عيّنات عدم اليقين غير متوفرة.' } },
  { c: { en: 'Do not invest', ar: 'لا تستثمر' }, w: { en: 'A risk gate (expected shortfall or coverage) vetoes it.', ar: 'تعترض إحدى بوابات المخاطر (العجز المتوقع أو التغطية).' } },
  { c: { en: 'Short-term trading', ar: 'تداول قصير المدى' }, w: { en: 'Only the 20-session lower bound clears its hurdle.', ar: 'يتجاوز الحد الأدنى لـ٢٠ جلسة عتبته فقط.' } },
  { c: { en: 'Long-term investment', ar: 'استثمار طويل المدى' }, w: { en: 'Only the 252-session lower bound clears its hurdle.', ar: 'يتجاوز الحد الأدنى لـ٢٥٢ جلسة عتبته فقط.' } },
  { c: { en: 'Both', ar: 'كلاهما' }, w: { en: 'Both horizons clear their lower-bound hurdles.', ar: 'يتجاوز كلا الأفقين عتبتيهما.' } },
];

const METHOD = [
  {
    h: { en: '1 · The target', ar: '١ · الهدف' },
    p: { en: 'It forecasts the net benchmark-relative return over a 20- or 252-session horizon — the stock’s return, minus the benchmark’s, minus estimated transaction costs.', ar: 'يتنبّأ بالعائد الصافي النسبي مقابل المؤشر على أفق ٢٠ أو ٢٥٢ جلسة — عائد السهم ناقص عائد المؤشر ناقص تكاليف التداول المقدّرة.' },
    eq: ['\\mathrm{NXR}^{(h)}_{i,t} \\;=\\; R_{i,\\,t\\to t+h} \\;-\\; R_{b,\\,t\\to t+h} \\;-\\; \\mathrm{TC}^{(h)}_{i,t}, \\qquad h \\in \\{20,\\,252\\}\\ \\text{sessions}'],
  },
  {
    h: { en: '2 · Disclosure-anchored network score', ar: '٢ · درجة الشبكة المثبّتة بالإفصاح' },
    p: { en: 'Each related-company event is weighted by relationship strength r, classifier confidence c, source quality q, and a 30-day time decay. Directions d ∈ {−1,0,1} and tones T (0–100) are pooled, then squashed to a 0–100 shift capped at ±20 points around neutral (50).', ar: 'يُوزَن كل حدث لشركة مرتبطة بقوة العلاقة r وثقة المصنّف c وجودة المصدر q وتضاؤل زمني ٣٠ يومًا. تُجمع الاتجاهات d ∈ {−١،٠،١} والنبرات T (٠–١٠٠)، ثم تُضغط إلى إزاحة ٠–١٠٠ بحدٍّ ±٢٠ حول الحياد (٥٠).' },
    eq: [
      'w_e \\;=\\; r_e\\, c_e\\, q_e\\; e^{-\\ln 2 \\,\\cdot\\, a_e / 30}',
      'N_{i,t} \\;=\\; \\operatorname{clip}\\!\\left[\\, 50 + \\frac{20\\sum_e w_e\\, d_e\\,(T_e - 50)}{50\\sum_e w_e},\\ \\ 0,\\ \\ 100 \\right]',
    ],
  },
  {
    h: { en: '3 · Quantum feature map & fidelity kernel', ar: '٣ · خريطة السمات الكمّية ونواة الإخلاص' },
    p: { en: 'The ten factors are standardized, clipped to [−3,3], turned into rotation angles, and loaded into a 10-qubit circuit (Hadamard + data-reuploading Ry/Rz + ring-connected Rzz). Similarity between two observations is the squared overlap of their quantum states.', ar: 'تُوحّد العوامل العشرة وتُقصّ إلى [−٣،٣] وتُحوّل إلى زوايا دوران وتُحمّل في دائرة بعشرة كيوبتات (Hadamard + إعادة رفع Ry/Rz + Rzz حلقي). والتشابه بين مشاهدتين هو مربّع تداخل حالتيهما الكمّيتين.' },
    eq: [
      '\\theta \\;=\\; \\tfrac{\\pi}{3}\\, \\operatorname{clip}\\!\\left( \\frac{x - \\mu}{s},\\, -3,\\, 3 \\right)',
      'K(x, z) \\;=\\; \\bigl|\\, \\langle \\varphi(x) \\mid \\varphi(z) \\rangle \\,\\bigr|^{2}, \\qquad 0 \\le K \\le 1',
    ],
  },
  {
    h: { en: '4 · From similarity to a forecast', ar: '٤ · من التشابه إلى تنبؤ' },
    p: { en: 'A benchmark-weighted kernel-ridge regression (review penalty λ = 1e−3) maps the vector of kernel similarities to a predicted net-excess return. The quantum circuit only builds the kernel; the regression, risk gates, and governance stay classical.', ar: 'انحدار ريدج نووي مُرجّح بالمؤشر (عقوبة λ = ١e−٣) يربط متجه أوجه التشابه بعائد صافٍ متوقّع. تبني الدائرة الكمّية النواة فقط؛ أما الانحدار وبوابات المخاطر والحوكمة فتبقى كلاسيكية.' },
    eq: ['\\hat f(x) \\;=\\; \\hat\\beta_0 \\;+\\; k(x)^{\\top}\\hat\\beta'],
  },
  {
    h: { en: '5 · Uncertainty & the decision bound', ar: '٥ · عدم اليقين وحدّ القرار' },
    p: { en: 'A full-pipeline wild-cluster bootstrap re-fits the model many times to build a forecast distribution. The decision statistic is its 5th-percentile lower bound — not a single point estimate.', ar: 'يعيد bootstrap عنقودي لكامل المسار تقدير النموذج مرارًا لبناء توزيع تنبؤ. وإحصاء القرار هو الحد الأدنى عند المئين الخامس — لا تقديرًا نقطيًا واحدًا.' },
    eq: ['L^{(h)}_{i,t} \\;=\\; Q_{0.05}\\bigl\\{ \\widehat{\\mathrm{NXR}}_{1},\\, \\dots,\\, \\widehat{\\mathrm{NXR}}_{B} \\bigr\\}'],
  },
  {
    h: { en: '6 · Classification hurdles', ar: '٦ · عتبات التصنيف' },
    p: { en: 'The lower bound must clear a hurdle — 0.5% for the 20-session horizon, 3.0% for the 252-session horizon. A −8.0% expected-shortfall veto, plus liquidity and coverage gates, can override a pass. The visible 0–100 figure is a qualitative display index, never the fitted return.', ar: 'يجب أن يتجاوز الحد الأدنى عتبة — ٠٫٥٪ لأفق ٢٠ جلسة و٣٫٠٪ لأفق ٢٥٢ جلسة. ويمكن لعتبة عجز متوقع −٨٫٠٪، مع بوابتي السيولة والتغطية، أن تنقض التجاوز. والرقم الظاهر ٠–١٠٠ مؤشر عرض وصفي، وليس العائد المُقدَّر أبدًا.' },
  },
];

export default function AshomShowcase() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const pick = (o) => (ar ? o.ar : o.en);

  return (
    <section className="ashom container" aria-labelledby="ashom-title">
      <style>{`
        .ashom { padding-block: clamp(8px, 3vh, 28px) clamp(40px, 8vh, 88px); text-align: start; }
        /* Full-bleed brand banner (its own purple gradient matches the page). */
        .ashom__hero { margin-inline: calc(50% - 50vw); margin-bottom: clamp(24px, 4vh, 44px); }
        .ashom__hero img { display: block; width: 100vw; height: auto; }
        .ashom__eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase; color: var(--accent);
          border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-radius: 999px; padding: 6px 13px; }
        .ashom__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px 1px var(--accent); }
        .ashom__title { margin: 18px 0 6px; font-size: clamp(26px, 4.4vw, 42px); font-weight: 700; line-height: 1.12; letter-spacing: -.01em; color: var(--ink); }
        .ashom__sub { margin: 0 0 18px; font-size: clamp(16px, 2.2vw, 20px); font-weight: 300; color: var(--accent); }
        .ashom__abstract { max-width: 74ch; font-size: 17px; line-height: 1.7; color: var(--ink); opacity: .92; }
        .ashom__grid { margin: 34px 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
        .ashom__card { background: var(--surface-1); border: 1px solid var(--divider); border-radius: var(--r-lg); padding: 22px 22px 24px; }
        .ashom__card h3 { margin: 0 0 8px; font-size: 16.5px; font-weight: 600; color: var(--ink); }
        .ashom__card p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--muted); }
        .ashom__qsec { margin: 34px 0 0; }
        .ashom__qhead { font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin: 0 0 12px; }
        .ashom__qubits { display: flex; flex-wrap: wrap; gap: 9px; }
        .ashom__qubit { display: inline-flex; align-items: center; gap: 8px; background: color-mix(in srgb, var(--accent) 9%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); border-radius: 999px; padding: 7px 13px; font-size: 13px; color: var(--ink); }
        .ashom__qubit b { font-variant-numeric: tabular-nums; color: var(--accent); font-weight: 700; }
        .ashom__panels { margin: 34px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ashom__panel { border-radius: var(--r-lg); padding: 22px; border: 1px solid var(--divider); background: var(--surface-1); }
        .ashom__panel h3 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 9px; }
        .ashom__panel p { margin: 0 0 8px; font-size: 13.5px; line-height: 1.6; color: var(--muted); }
        .ashom__meta { font-size: 12.5px; color: var(--muted); line-height: 1.7; }
        .ashom__meta .k { color: var(--ink); font-weight: 600; }
        .ashom__hash { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11.5px; word-break: break-all;
          background: rgba(0,0,0,.22); border: 1px solid var(--divider); border-radius: 8px; padding: 8px 10px; margin: 6px 0 12px; color: var(--ink); }
        .ashom__links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
        .ashom__links a { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; text-decoration: none;
          color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); border-radius: 999px; padding: 7px 13px; }
        .ashom__links a:hover { background: color-mix(in srgb, var(--accent) 12%, transparent); }
        .ashom__verify { margin-top: 12px; }
        .ashom__verify summary { cursor: pointer; font-size: 12.5px; color: var(--muted); }
        .ashom__verify pre { margin: 10px 0 0; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11px; line-height: 1.5;
          background: rgba(0,0,0,.22); border: 1px solid var(--divider); border-radius: 8px; padding: 10px; overflow-x: auto; color: var(--ink); }
        .ashom__warn { grid-column: 1 / -1; border-radius: var(--r-lg); padding: 20px 22px;
          background: color-mix(in srgb, var(--accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); }
        .ashom__warn h3 { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 9px; }
        .ashom__warn p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--ink); opacity: .92; }
        .ashom__h2 { font-size: clamp(18px, 2.4vw, 23px); font-weight: 700; color: var(--ink); margin: 40px 0 14px; }
        .ashom__flow { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 40px; align-items: start; }
        .ashom__steps { margin: 0; padding-inline-start: 1.2em; }
        .ashom__steps li { font-size: 14.5px; line-height: 1.6; color: var(--ink); opacity: .92; margin-bottom: 12px; }
        .ashom__hier { margin: 0; padding: 0; list-style: none; }
        .ashom__hier li { padding: 12px 0; border-bottom: 1px solid var(--divider); font-size: 14px; }
        .ashom__hier li:last-child { border-bottom: 0; }
        .ashom__hk { display: block; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
        .ashom__hier li span:last-child { color: var(--muted); line-height: 1.55; }
        .ashom__outcomes { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
        .ashom__outcomes li { background: var(--surface-1); border: 1px solid var(--divider); border-radius: 12px; padding: 14px 16px; }
        .ashom__outcomes b { display: block; color: var(--accent); font-size: 14px; margin-bottom: 4px; }
        .ashom__outcomes span { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .ashom__method { margin: 0; padding: 0; list-style: none; }
        .ashom__method li { padding: 16px 0; border-bottom: 1px solid var(--divider); }
        .ashom__method li:last-child { border-bottom: 0; }
        .ashom__method h3 { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: var(--ink); }
        .ashom__method p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--muted); }
        .ashom__eq { background: rgba(0,0,0,.24); border: 1px solid var(--divider); border-radius: 10px;
          padding: 14px 16px; margin: 10px 0 0; color: var(--ink); overflow-x: auto; }
        .ashom__eq > div + div { margin-top: 8px; }
        .ashom__eq .katex-display { margin: 0; text-align: start; }
        .ashom__eq .katex { color: var(--ink); font-size: 1.05em; white-space: nowrap; }
        .ashom__fine { margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--divider);
          font-size: 12px; line-height: 1.7; color: var(--muted); max-width: 80ch; }
        .ashom__fine code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11px; color: var(--ink); opacity: .82; }
        .ashom__fine a { color: var(--muted); text-decoration: underline; text-underline-offset: 2px; }
        .ashom__fine a:hover { color: var(--accent); }
        .ashom__fine details { display: inline; }
        .ashom__fine summary { display: inline; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
        .ashom__fine pre { margin: 8px 0 0; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 10.5px;
          line-height: 1.5; background: rgba(0,0,0,.22); border: 1px solid var(--divider); border-radius: 8px; padding: 10px; overflow-x: auto; color: var(--ink); }
        @media (max-width: 720px) { .ashom__panels, .ashom__flow { grid-template-columns: 1fr; } }
      `}</style>

      <div className="ashom__hero">
        <img src="/images/ashom-hero-v2.png" alt={ar ? 'أسهم ١ — نموذج الأسهم الكمّي' : 'Ashom 1 — Quantum Equity Model'} />
      </div>

      <span className="ashom__eyebrow"><span className="ashom__dot" aria-hidden="true" />
        {ar ? 'مشروع بحثي مستقل · قيد التطوير' : 'Independent research project · in progress'}
      </span>
      <h1 id="ashom-title" className="ashom__title">
        {ar ? 'أسهم ١ — نموذج الأسهم الكمّي' : 'Ashom 1 — Quantum Equity Model'}
      </h1>
      <p className="ashom__sub">
        {ar ? 'إطار هجين كمّي–اقتصادي لتصنيف الأسهم' : 'A hybrid quantum–econometric stock-classification framework'}
      </p>
      <p className="ashom__abstract">
        {ar
          ? 'إطار هجين كمّي–كلاسيكي يتنبّأ بالعوائد الصافية النسبية مقابل المؤشر على المديين القصير والطويل. الإفصاحات الرسمية للشركات هي المصدر الأساسي؛ والأخبار قد تُحدّث حالة علاقة مثبّتة بالإفصاح لكنها لا تنشئها. تقيس خريطة سمات بعشرة كيوبتات التشابه غير الخطي، ويحوّل انحدار ريدج نووي مُرجّح بالمؤشر ذلك التشابه إلى تنبؤات، مقيّدة ببوابات السيولة والتغطية ومخاطر الذيل. ولا يُدّعى أي تفوّق كمّي ما لم تتغلّب اختبارات تقدّمية مغلقة على نماذج كلاسيكية مُسجّلة مسبقًا بعد التكاليف.'
          : 'A hybrid quantum-classical framework that forecasts short- and long-horizon net benchmark-relative returns. Official issuer disclosures are the primary source; news may update the state of a disclosure-supported relationship but can never create it. A ten-qubit feature map measures nonlinear similarity, and a benchmark-weighted kernel-ridge regression turns that similarity into forecasts — gated by liquidity, coverage, and tail-risk. No quantum advantage is claimed unless sealed walk-forward tests beat preregistered classical models after costs.'}
      </p>

      <div className="ashom__grid">
        {PILLARS.map((p, i) => (
          <div className="ashom__card" key={i}>
            <h3>{pick(p).t}</h3>
            <p>{pick(p).d}</p>
          </div>
        ))}
      </div>

      <div className="ashom__qsec">
        <p className="ashom__qhead">{ar ? 'متجه السمات — عشرة كيوبتات' : 'Feature vector — ten qubits'}</p>
        <div className="ashom__qubits">
          {QUBITS.map((q, i) => (
            <span className="ashom__qubit" key={i}><b>{ar ? toArabicDigits(i + 1) : i + 1}</b>{pick(q)}</span>
          ))}
        </div>
      </div>

      <div className="ashom__flow">
        <div>
          <h2 className="ashom__h2">{ar ? 'كيف يعمل' : 'How it works'}</h2>
          <ol className="ashom__steps">
            {STEPS.map((s, i) => <li key={i}>{pick(s)}</li>)}
          </ol>
        </div>
        <div>
          <h2 className="ashom__h2">{ar ? 'تسلسل الأدلة' : 'Evidence hierarchy'}</h2>
          <ol className="ashom__hier">
            {HIERARCHY.map((h, i) => (
              <li key={i}>
                <span className="ashom__hk">{ar ? h.ar : h.en}</span>
                <span>{pick(h.role)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <h2 className="ashom__h2">{ar ? 'المنهجية — كيف تُبنى الدرجة' : 'Methodology — how the score is built'}</h2>
      <ol className="ashom__method">
        {METHOD.map((m, i) => (
          <li key={i}>
            <h3>{ar ? m.h.ar : m.h.en}</h3>
            <p>{ar ? m.p.ar : m.p.en}</p>
            {m.eq && (
              <div className="ashom__eq" dir="ltr">
                {m.eq.map((e, j) => <div key={j} dangerouslySetInnerHTML={tex(e)} />)}
              </div>
            )}
          </li>
        ))}
      </ol>

      <h2 className="ashom__h2">{ar ? 'كيف يُصنَّف السهم' : 'How a stock is classified'}</h2>
      <ul className="ashom__outcomes">
        {OUTCOMES.map((o, i) => (
          <li key={i}><b>{ar ? o.c.ar : o.c.en}</b><span>{ar ? o.w.ar : o.w.en}</span></li>
        ))}
      </ul>

      <h2 className="ashom__h2">{ar ? 'التنفيذ الحالي وخطة التحسين' : 'Current implementation & roadmap'}</h2>
      <p className="ashom__abstract">
        {ar
          ? 'حاليًا: تعمل دائرة الكيوبتات العشرة ونواة الإخلاص على مرجعٍ دقيق (statevector). تأتي المدخلات المنظَّمة من الإفصاحات الرسمية (السوق المالية السعودية وSEC EDGAR) ومن بيانات السوق العامة وسلاسل البنك الدولي الكلية؛ أمّا نبرة الأخبار واستخراج العلاقات المثبّتة بالإفصاح فيتمّان اليوم عبر واجهة Groq المجانية (نحو ٢٥٠ طلبًا مركّبًا يوميًا). إنه نموذج بحثي مستقل أبنيه تدريجيًا.'
          : 'Today: the ten-qubit circuit and fidelity kernel run on an exact statevector reference. Structured inputs come from official disclosures (Saudi Exchange, SEC EDGAR), public market feeds, and World Bank macro series; the qualitative news tone and the disclosure-anchored relationship extraction currently run through Groq’s free API (about 250 compound requests per day). It’s an independent research prototype I’m building out incrementally.'}
      </p>
      <p className="ashom__abstract" style={{ marginTop: 12 }}>
        {ar
          ? 'الخطة: استبدال المصادر المؤقتة ببيانات مثبّتة زمنيًا ومرخَّصة، وتثبيت معاملات النموذج، وإضافة أثر عدم اليقين الكامل، وتقليل الاعتماد على نموذج لغوي عام في طبقة الأخبار عبر مكوّنات مخصّصة. وتشغيل دائرة كمّية ليس دليلًا على تفوّق كمّي — لا يُحتسب ذلك إلا بعد أن تتغلّب اختبارات مغلقة على النماذج الكلاسيكية بعد التكاليف.'
          : 'The plan: replace the ad-hoc feeds with a frozen point-in-time, licensed panel; fit and freeze the model coefficients; add the full uncertainty artifact; and reduce reliance on a general LLM for the news layer with purpose-built components. Running a quantum circuit is not evidence of quantum advantage — that only counts once sealed tests beat the classical baselines after costs.'}
      </p>

      {/* Provenance kept as fine print, not a headline feature. */}
      <p className="ashom__fine">
        {ar
          ? 'إثبات الأسبقية: وُثِّقت ورقة العمل تشفيريًا (RFC 3161 · freetsa.org) في '
          : 'Provenance: the working paper was cryptographically timestamped (RFC 3161 · freetsa.org) on '}
        {ar ? PAPER.stampedAr : PAPER.stampedEn}. SHA-256 <code title={PAPER.sha256}>{PAPER.sha256.slice(0, 8)}…{PAPER.sha256.slice(-8)}</code>.{' '}
        <a href={PAPER.url} target="_blank" rel="noreferrer">{ar ? 'الورقة (PDF)' : 'paper (PDF)'}</a> · <a href={PAPER.tsr} target="_blank" rel="noreferrer">{ar ? 'رمز الختم' : 'token'}</a> ·{' '}
        <details>
          <summary>{ar ? 'التحقق' : 'verify'}</summary>
          <pre>{`# needs the token + freetsa certs (in /docs)
openssl ts -verify -in ashom1.tsr \\
  -data ashom1-quantum-equity-model.pdf \\
  -CAfile freetsa-cacert.pem -untrusted freetsa-tsa.crt
# → Verification: OK`}</pre>
        </details>
      </p>
    </section>
  );
}

function toArabicDigits(n) {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}
