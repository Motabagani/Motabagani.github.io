import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

function RafeeqProject() {
  const { lang } = useLanguage();

  // Localized page chrome — same pattern as CourseRegistrationProject
  const L = lang === 'ar' ? {
    home: 'الرئيسية',
    work: 'برمجة',
    project: 'رفيق',
    year: '٢٠٢٦',
    kind: 'مشروع شخصي',
    solo: 'تصميم وتطوير منفرد',
    title: 'رفيق.',
    deck: 'محاكي ثنائي اللغة لرحلة الابتعاث السعودي — أربع مراحل، ووثائق رسمية، وقواعد بيروقراطية حقيقية، مبني بالكامل في المتصفح بواجهة تنقلب بين العربية والإنجليزية.',
    hook: 'إن كان «سفيرك» ضايع، يبيلك رفيق كفو.',
    cta: 'جرّب المحاكي',
    ctaNote: 'يعمل مباشرة في متصفحك — بلا حساب. سجّل الدخول بأي رقم هوية من ١٠ خانات.',
    metaYear: 'السنة',
    metaStack: 'التقنيات',
    metaRole: 'الدور',
    metaYearValue: '٢٠٢٦',
    metaStackValue: 'React · Vite · IndexedDB',
    metaRoleValue: 'تصميم وتطوير منفرد',
    back: '← العودة إلى البرمجة',
  } : {
    home: 'Home',
    work: 'Coding',
    project: 'Rafeeq',
    year: '2026',
    kind: 'Personal project',
    solo: 'Solo design & engineering',
    title: 'Rafeeq.',
    deck: 'A bilingual simulator of the Saudi scholarship journey — four phases, issued documents, and real bureaucratic rules, built entirely in the browser with an interface that flips between Arabic and English.',
    hook: "If your Safeer's lost, you need a Rafeeq who isn't.",
    cta: 'Try the simulator',
    ctaNote: 'Runs live in your browser — no account needed. Sign in with any 10-digit ID.',
    metaYear: 'Year',
    metaStack: 'Stack',
    metaRole: 'Role',
    metaYearValue: '2026',
    metaStackValue: 'React · Vite · IndexedDB',
    metaRoleValue: 'Solo design & engineering',
    back: '← Back to coding',
  };

  return (
    <>
      {/* Scoped here so the CTA needs no App.css changes. */}
      <style>{`
        /* Brand hero band — the Rafeeq mark centred on the project's own brand
           gradient (same as the homepage card), extended full-bleed to the
           viewport edges out of the 820px column. */
        .rq-proj-hero {
          margin-block: 0 30px;
          margin-inline: calc(50% - 50vw);   /* full-bleed within the centred column */
          background: linear-gradient(150deg, #0E7A58 0%, #132A20 100%);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(44px, 8vw, 84px) clamp(20px, 5vw, 48px);
          min-height: clamp(180px, 26vw, 260px);
        }
        .rq-proj-mark { height: clamp(72px, 13vw, 128px); width: auto; display: block; }
        .rq-hook {
          margin: 26px 0 0; font-size: clamp(20px, 2.6vw, 27px); line-height: 1.35;
          font-weight: 600; color: var(--accent); letter-spacing: -.01em;
          max-width: 22ch;
          /* Match the title/deck — otherwise it inherits centring from #root. */
          text-align: start;
        }
        html[dir="rtl"] .rq-hook { max-width: 26ch; }
        /* The button is inline-flex, so without this it inherits the centring
           from #root and drifts off the column's start edge. */
        .rq-cta-wrap { margin: 22px 0 4px; text-align: start; }
        .rq-cta {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 18px 34px; border-radius: var(--r-pill);
          background: var(--accent); color: var(--bg);
          font-size: 19px; font-weight: 600; text-decoration: none;
          box-shadow: 0 10px 30px rgba(245,160,92,.28);
          transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
        }
        .rq-cta:hover { transform: translateY(-2px); filter: brightness(1.06);
          color: var(--bg); /* keep text visible; the global a:hover turns links accent, which matches the button bg */
          box-shadow: 0 16px 40px rgba(245,160,92,.38); }
        .rq-cta:active { transform: translateY(0); }
        .rq-cta-arrow { font-size: 22px; line-height: 1; }
        html[dir="rtl"] .rq-cta-arrow { transform: scaleX(-1); }
        .rq-cta-note { margin-top: 13px; font-size: 14px; color: var(--muted); }
        @media (max-width: 640px) {
          .rq-cta { width: 100%; justify-content: center; padding: 17px 24px; font-size: 17px; }
        }
      `}</style>

      <TopBar />

      <div className="breadcrumb breadcrumb--narrow">
        <a href={`#/${lang}`}>{L.home}</a>
        &nbsp;/&nbsp;
        <a href={`#/${lang}/coding`}>{L.work}</a>
        &nbsp;/&nbsp;
        {L.project}
      </div>
      <img src="images/naqsh.png" alt="" className="hero-naqsh" />

      <main id="main-content" tabIndex={-1}>
        <header className="project-header narrow">
          <div className="rq-proj-hero">
            <img src="images/rafeeq-bright.png" alt={L.title} className="rq-proj-mark" />
          </div>
          <div className="eyebrow">
            <span>{L.year}</span>
            <span>{L.kind}</span>
            <span>{L.solo}</span>
            <span className="project-status project-status--current">
              <span className="project-status__dot" aria-hidden="true" />
              {lang === 'ar' ? 'مشروع جارٍ' : 'Current'}
            </span>
          </div>
          <h1>{L.title}</h1>
          <p className="deck">{L.deck}</p>

          {/* The pitch, in the register a student would actually use.
              Safeer is the ministry's own portal; Rafeeq is the companion. */}
          <p className="rq-hook">{L.hook}</p>

          {/* The point of the page: go use the thing. */}
          <div className="rq-cta-wrap">
            <a className="rq-cta" href={`#/${lang}/rafeeq`}>
              {L.cta}<span className="rq-cta-arrow" aria-hidden="true">→</span>
            </a>
            <p className="rq-cta-note">{L.ctaNote}</p>
          </div>
        </header>

        <section className="case-col">
          <div className="meta-bar">
            <dl>
              <div>
                <dt>{L.metaYear}</dt>
                <dd>{L.metaYearValue}</dd>
              </div>
              <div>
                <dt>{L.metaStack}</dt>
                <dd>{L.metaStackValue}</dd>
              </div>
              <div>
                <dt>{L.metaRole}</dt>
                <dd>{L.metaRoleValue}</dd>
              </div>
            </dl>
          </div>
        </section>

        {lang === 'en' && <EnglishProse />}
        {lang === 'ar' && <ArabicProse />}

        {/* Second chance to launch, for anyone who read to the bottom. */}
        <section className="case-col" style={{ paddingBlock: '8px 44px' }}>
          <a className="rq-cta" href={`#/${lang}/rafeeq`}>
            {L.cta}<span className="rq-cta-arrow" aria-hidden="true">→</span>
          </a>
        </section>

        <section className="back-link case-col">
          <a href={`#/${lang}/coding`}>{L.back}</a>
        </section>
      </main>
    </>
  );
}

// ============================================================
// English prose
// ============================================================
function EnglishProse() {
  return (
    <article className="prose narrow">
      <p>
        The Saudi scholarship process spans a ministry, an embassy, a university
        and an airline — each with its own forms, its own sequence, and its own
        vocabulary. Students learn it by making mistakes that cost them months.
        Rafeeq lets them make those mistakes in a browser instead.
      </p>
      <p>
        It is a working simulator, not a prototype: four phases, real validation,
        issued documents with tracking references, and a data layer built for a
        backend it does not yet have.
      </p>

      <h2>The journey it models</h2>
      <p>
        Four phases, in the order the real process demands — التهيئة (preparation)
        → التسجيل الأكاديمي (academic registration) → التأشيرة والسفر (visa and
        travel) → الوصول والبدء (arrival). That ordering is not cosmetic. Academic
        registration has to come before travel, because the ticket-approval rules
        need to know when your term starts.
      </p>

      <h2>Bilingual as architecture, not translation</h2>
      <p>
        The interface is Arabic-first and flips wholesale to English. That is a
        structural constraint, not a string-swap. Every layout rule uses logical
        CSS properties — <code>inset-inline</code>, <code>text-align: start</code>,{' '}
        <code>margin-inline-start</code> — so direction inverts from the{' '}
        <code>dir</code> attribute alone, with no parallel RTL stylesheet to keep
        in sync.
      </p>
      <p>
        It broke in exactly one place. The chevron step-bar used{' '}
        <code>clip-path</code> with a <code>transform</code> flip, and Safari
        renders that combination inconsistently. The fix was to abandon the flip
        trick and write mirrored clip-path polygons for each direction, letting
        natural RTL flex ordering handle the sequence.
      </p>

      <h2>A date picker, because the native one was unusable</h2>
      <p>
        <code>&lt;input type="date"&gt;</code> renders a different control in every
        browser, ignores the app's theme entirely, and displays Latin digits and
        English month names even when the page is in Arabic. So it had to be
        rebuilt:
      </p>
      <ul>
        <li>Typeable <code>DD/MM/YYYY</code> with slashes inserted as you type.</li>
        <li>Real validation, not a regex — <code>31/02</code> is rejected, leap years are correct.</li>
        <li>Arabic month names and Arabic-Indic digits in the grid; Latin in the field, so it stays typable.</li>
        <li>Direction-aware arrow keys — ← moves forward in Arabic.</li>
        <li>Flips above the field when it would otherwise be clipped by the viewport.</li>
      </ul>

      <h2>Modelling a rule instead of a happy path</h2>
      <p>
        The most interesting logic is the OTB travel authorization. It issues
        automatically only when <em>both</em> conditions hold: the departure
        airport actually serves the destination university, and the arrival date
        precedes the start of term. If either fails, the request goes to manual
        review — and no OTB number is generated at all. The Saudia email packet
        stays hidden until a reviewer approves it.
      </p>
      <p>
        The request card shows both checks as an explicit pass/fail list, so it is
        clear <em>which</em> condition sent it to a human rather than just
        "under review."
      </p>

      <h2>Two guarantees with different lifecycles</h2>
      <p>
        There are two financial guarantee letters and they behave differently.
        The admission guarantee is issued automatically when the first phase is
        approved — it is what a university and an embassy need. The academic
        guarantee is <em>requested</em>, held pending, and only lands in the
        student's Files when the whole phase clears.
      </p>
      <p>
        Editing any course after requesting it silently withdraws the request,
        because the letter would otherwise describe a schedule that no longer
        exists. That tradeoff — a small surprise in exchange for never issuing a
        document that contradicts its own data — is the kind of decision the
        whole project is made of.
      </p>

      <h2>One reference scheme for everything</h2>
      <p>
        Every submission a student makes produces a tracking reference from a
        single generator: a three-letter code, the year and month, and a
        per-code sequence.
      </p>
      <ul>
        <li><code>PRP-2607-71601</code> — preparation phase</li>
        <li><code>ACD-2607-38501</code> — academic registration</li>
        <li><code>VSA-2607-91501</code> — visa and travel</li>
        <li><code>INT-2708-33401</code> — initial ticket request</li>
        <li><code>FGT-2607-18301</code> — academic financial guarantee</li>
      </ul>
      <p>
        Sortable, readable, and collision-free within a session. The issued
        document carries the same reference as the request that produced it, so
        the thing you tracked and the thing you received are one number.
      </p>

      <h2>A storage layer built for a backend it doesn't have</h2>
      <p>
        Everything persisted flows through four async methods — get, set, remove,
        list. Each write is stamped with a SHA-256 hash of its payload and a
        timestamp, which gives cheap change detection and the row shape a real
        database would want. Keys are namespaced per applicant, so the store is
        already multi-tenant.
      </p>
      <p>
        Today it writes to IndexedDB. Moving to a server means reimplementing
        those four methods against <code>fetch()</code> in one file — no screen
        and no phase changes. Two things the client explicitly cannot own:
        reference generation, because a per-session counter would collide across
        users, and approval, which has to be a server decision.
      </p>

      <h2>From one file to thirty-nine</h2>
      <p>
        It grew to roughly 3,400 lines in a single file, which made editing a
        sentence of copy mean scrolling past two hundred lines of labels. The
        split was chosen around what gets edited most: all copy lives in one
        strings file, and each phase is a single module. Data tables, pure
        helpers, UI atoms and screens each got their own directory.
      </p>

      <h2>What's next</h2>
      <ul>
        <li>Hash-based routing, so browser back and forward move between steps instead of leaving the app.</li>
        <li>Swapping the storage layer for a real backend, using the seam already in place.</li>
        <li>Dependent ticket booking through the standard request form.</li>
      </ul>
    </article>
  );
}

// ============================================================
// Arabic prose
// ============================================================
function ArabicProse() {
  return (
    <article className="prose narrow">
      <p>
        تمتد رحلة الابتعاث السعودي عبر وزارة وسفارة وجامعة وشركة طيران — لكلٍّ
        نماذجها وترتيبها ومصطلحاتها. يتعلّمها المبتعث بأخطاء تكلّفه شهورًا. يتيح
        «رفيق» ارتكاب تلك الأخطاء داخل المتصفح بدلًا من الواقع.
      </p>
      <p>
        وهو محاكٍ عامل لا نموذج أوّلي: أربع مراحل، وتحقق فعلي من المدخلات، ووثائق
        صادرة بأرقام تتبع، وطبقة بيانات مبنية لخادم لم يُوصل بعد.
      </p>

      <h2>الرحلة التي يحاكيها</h2>
      <p>
        أربع مراحل بالترتيب الذي تفرضه العملية الحقيقية: التهيئة ← التسجيل
        الأكاديمي ← التأشيرة والسفر ← الوصول والبدء. هذا الترتيب ليس شكليًا؛
        فالتسجيل الأكاديمي يسبق السفر لأن قواعد اعتماد التذكرة تحتاج معرفة موعد
        بداية الفصل.
      </p>

      <h2>ثنائية اللغة بوصفها معمارية لا ترجمة</h2>
      <p>
        الواجهة عربية أولًا وتنقلب بالكامل إلى الإنجليزية، وهذا قيد بنيوي لا
        استبدال نصوص. كل قواعد التخطيط تستخدم الخصائص المنطقية —{' '}
        <code>inset-inline</code> و<code>text-align: start</code> — فينقلب الاتجاه
        من سمة <code>dir</code> وحدها، دون ملف أنماط موازٍ للعربية.
      </p>
      <p>
        انكسر ذلك في موضع واحد: شريط الخطوات المسنّن كان يجمع{' '}
        <code>clip-path</code> مع <code>transform</code>، وسفاري يعرض هذا المزيج
        بشكل غير متسق. الحل كان التخلي عن حيلة القلب وكتابة مضلّعات معكوسة لكل
        اتجاه.
      </p>

      <h2>منتقي تاريخ، لأن الأصلي غير صالح</h2>
      <p>
        حقل <code>type="date"</code> يعرض أداة مختلفة في كل متصفح، ويتجاهل سمة
        الواجهة، ويعرض أرقامًا لاتينية وأسماء شهور إنجليزية حتى والصفحة عربية.
        لذلك أُعيد بناؤه: إدخال يدوي بصيغة يوم/شهر/سنة، وتحقق حقيقي يرفض{' '}
        <code>٣١/٠٢</code> ويحسب السنوات الكبيسة، وأسماء شهور عربية وأرقام
        هندية في التقويم، وأسهم لوحة مفاتيح تراعي الاتجاه.
      </p>

      <h2>نمذجة قاعدة لا مسار مثالي</h2>
      <p>
        أهم منطق في المشروع هو تصريح السفر (OTB). لا يصدر تلقائيًا إلا إذا تحقق
        الشرطان معًا: أن يخدم مطار الوجهة الجامعة فعلًا، وأن يسبق تاريخ الوصول
        بداية الفصل. وإن اختلّ أحدهما يُحال الطلب للمراجعة اليدوية — ولا يصدر رقم
        OTB إطلاقًا، ويبقى بريد الخطوط السعودية مخفيًا حتى الموافقة.
      </p>

      <h2>ضمانان ماليان بدورتي حياة مختلفتين</h2>
      <p>
        الضمان المالي للقبول يصدر تلقائيًا عند اعتماد المرحلة الأولى، وهو ما
        تحتاجه الجامعة والسفارة. أما الضمان الأكاديمي فيُطلب، ويبقى معلقًا، ولا
        يظهر في «الملفات» إلا باعتماد المرحلة بكاملها. وتعديل أي مادة بعد الطلب
        يسحبه، لأن الخطاب سيصف جدولًا لم يعد قائمًا.
      </p>

      <h2>نظام ترقيم واحد لكل شيء</h2>
      <p>
        كل ما يرسله الطالب ينتج رقم تتبع من مولّد واحد: رمز من ثلاثة أحرف، ثم
        السنة والشهر، ثم تسلسل خاص بكل رمز — مثل <code>PRP-2607-71601</code> و
        <code>FGT-2607-18301</code>. قابل للفرز والقراءة، والوثيقة الصادرة تحمل
        رقم الطلب نفسه.
      </p>

      <h2>طبقة تخزين مبنية لخادم غير موجود بعد</h2>
      <p>
        كل البيانات تمر عبر أربع دوال غير متزامنة، وكل كتابة موسومة ببصمة
        SHA-256 وطابع زمني، والمفاتيح مفصولة لكل مبتعث. اليوم تكتب في IndexedDB،
        والانتقال إلى خادم يعني إعادة كتابة تلك الدوال في ملف واحد دون تغيير أي
        شاشة أو مرحلة.
      </p>

      <h2>من ملف واحد إلى تسعة وثلاثين</h2>
      <p>
        بلغ المشروع نحو ٣٤٠٠ سطر في ملف واحد، فصار تعديل جملة واحدة يعني التمرير
        عبر مئتي سطر من النصوص. قُسّم حسب ما يُعدَّل أكثر: كل النصوص في ملف واحد،
        وكل مرحلة في وحدة مستقلة.
      </p>
    </article>
  );
}

export default RafeeqProject;
