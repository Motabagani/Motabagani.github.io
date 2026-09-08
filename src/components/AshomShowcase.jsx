import { useLanguage } from '../LanguageContext';

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

export default function AshomShowcase() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const pick = (o) => (ar ? o.ar : o.en);

  return (
    <section className="ashom container" aria-labelledby="ashom-title">
      <style>{`
        .ashom { padding-block: clamp(8px, 3vh, 28px) clamp(40px, 8vh, 88px); text-align: start; }
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
        @media (max-width: 720px) { .ashom__panels, .ashom__flow { grid-template-columns: 1fr; } }
      `}</style>

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

      <h2 className="ashom__h2">{ar ? 'كيف يُصنَّف السهم' : 'How a stock is classified'}</h2>
      <ul className="ashom__outcomes">
        {OUTCOMES.map((o, i) => (
          <li key={i}><b>{ar ? o.c.ar : o.c.en}</b><span>{ar ? o.w.ar : o.w.en}</span></li>
        ))}
      </ul>

      <div className="ashom__panels">
        {/* Authenticated timestamp / provenance */}
        <div className="ashom__panel">
          <h3>🔏 {ar ? 'ختم زمني موثّق' : 'Authenticated timestamp'}</h3>
          <p>
            {ar
              ? 'وُثِّقت بايتات ورقة العمل تشفيريًا عبر سلطة ختم زمني مستقلة (RFC 3161)، ما يثبت وجود هذا المحتوى بالضبط في ذلك الوقت.'
              : 'The working paper’s exact bytes were cryptographically notarized by an independent Time-Stamp Authority (RFC 3161), proving this content existed at that moment.'}
          </p>
          <p className="ashom__meta">
            <span className="k">{ar ? 'الختم الزمني:' : 'Timestamped:'}</span> {ar ? PAPER.stampedAr : PAPER.stampedEn} · freetsa.org
          </p>
          <p className="ashom__meta" style={{ margin: '6px 0 2px' }}><span className="k">SHA-256</span></p>
          <div className="ashom__hash">{PAPER.sha256}</div>
          <div className="ashom__links">
            <a href={PAPER.url} target="_blank" rel="noreferrer">{ar ? 'الورقة (PDF) ↗' : 'Working paper (PDF) ↗'}</a>
            <a href={PAPER.tsr} target="_blank" rel="noreferrer">{ar ? 'رمز الختم (.tsr)' : 'Timestamp token (.tsr)'}</a>
          </div>
          <details className="ashom__verify">
            <summary>{ar ? 'كيف تتحقق بنفسك' : 'Verify it yourself'}</summary>
            <pre>{`# needs the token + freetsa certs (in /docs)
openssl ts -verify \\
  -in ashom1.tsr \\
  -data ashom1-quantum-equity-model.pdf \\
  -CAfile freetsa-cacert.pem \\
  -untrusted freetsa-tsa.crt
# → Verification: OK`}</pre>
          </details>
        </div>

        {/* Current status */}
        <div className="ashom__panel">
          <h3>🧭 {ar ? 'أين وصل العمل' : 'Where it stands'}</h3>
          <p>
            {ar
              ? 'تعمل دائرة الكيوبتات العشرة ونواة الإخلاص اليوم على مرجع دقيق (statevector)، وجامِعات الإفصاح والأخبار حيّة. الإنتاج ما زال يحتاج إلى بيانات مثبّتة زمنيًا، وأوزان مؤشر تاريخية، ومعاملات مقدّرة، وتوزيع كامل لعدم اليقين.'
              : 'The ten-qubit circuit and fidelity kernel run today on an exact statevector reference, and the disclosure + news collectors are live. Production still needs a frozen point-in-time panel, historical benchmark weights, fitted coefficients, and the full uncertainty artifact.'}
          </p>
          <p>
            {ar
              ? 'أُطوّره تدريجيًا — هذه الصفحة تعرض المفهوم بينما يكتمل الماسح التفاعلي.'
              : 'I’m building it out incrementally — this page showcases the concept while the interactive scanner is finished.'}
          </p>
        </div>

      </div>
    </section>
  );
}

function toArabicDigits(n) {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}
