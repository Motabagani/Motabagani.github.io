import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

function CourseRegistrationProject() {
  const { lang } = useLanguage();

  // Localized labels for the page chrome
  const L = lang === 'ar' ? {
    home: 'الرئيسية',
    work: 'برمجة',
    project: 'نظام تسجيل المقررات',
    year: '٢٠٢٤',
    course: 'CSCI-UA 102 — هياكل البيانات',
    groupProject: 'مشروع جماعي',
    title: 'نظام تسجيل المقررات.',
    deck: 'مشروع جافا OOP يحاكي منصة تسجيل مقررات جامعية — أدوار للمشرفين والطلاب، إدارة المقررات، تدفقات التسجيل، وتخزين دائم عبر Java serialization.',
    metaCourse: 'المقرر',
    metaStack: 'التقنيات',
    metaRole: 'الدور',
    metaSource: 'المصدر',
    metaCourseValue: 'CSCI-UA 102',
    metaStackValue: 'Java, ArrayList, .ser, CSV',
    metaRoleValue: 'مشروع جماعي · متعاونان',
    viewGithub: 'عرض على GitHub ←',
    back: '← العودة إلى البرمجة',
  } : {
    home: 'Home',
    work: 'Coding',
    project: 'Course Registration System',
    year: '2026',
    course: 'NYU CSCI-UA 102 — Data Structures',
    groupProject: 'Group Project',
    title: 'Course Registration System.',
    deck: 'A Java OOP project that simulates a university course-registration platform — admin and student roles, course management, enrollment workflows, and persistent storage via Java serialization.',
    metaCourse: 'Course',
    metaStack: 'Stack',
    metaRole: 'Role',
    metaSource: 'Source',
    metaCourseValue: 'CSCI-UA 102 — Data Structures',
    metaStackValue: 'Java, ArrayList, .ser, CSV',
    metaRoleValue: 'Group project · 4 collaborators',
    viewGithub: 'View on GitHub →',
    back: '← Back to coding',
  };

  return (
    <>
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
          <div className="eyebrow">
            <span>{L.year}</span>
            <span>{L.course}</span>
            <span>{L.groupProject}</span>
            <span className="project-status project-status--completed">
              <span className="project-status__dot" aria-hidden="true" />
              {lang === 'ar' ? 'مكتمل' : 'Completed'}
            </span>
          </div>
          <h1>{L.title}</h1>
          <p className="deck">{L.deck}</p>
        </header>
        

        <section className="case-col">
          <div className="meta-bar">
            <dl>
              <div>
                <dt>{L.metaCourse}</dt>
                <dd>{L.metaCourseValue}</dd>
              </div>
              <div>
                <dt>{L.metaStack}</dt>
                <dd>{L.metaStackValue}</dd>
              </div>
              <div>
                <dt>{L.metaRole}</dt>
                <dd>{L.metaRoleValue}</dd>
              </div>
              <div>
                <dt>{L.metaSource}</dt>
                <dd>
                  <a href="#" target="_blank" rel="noreferrer">{L.viewGithub}</a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Prose content stays in English for now — translation is a later pass */}
        {lang === 'en' && <EnglishProse />}
        {lang === 'ar' && <ArabicProse />}

        <section className="back-link case-col">
          <a href={`#/${lang}/coding`}>{L.back}</a>
        </section>
      </main>

     
    </>
  );
}

// ============================================================
// English prose — split out for readability
// ============================================================
function EnglishProse() {
  return (
    <article className="prose narrow">
      <p className="lead">
        The brief was a registration system for a small university — but the
        real exercise was practicing the OOP fundamentals that make a codebase{' '}
        <em>survive contact with real users</em>: clean inheritance, well-scoped
        interfaces, and persistence that doesn't lose your data between runs.
      </p>

      <h2>The problem</h2>
      <p>
        Admins need to manage a catalog of courses (create, edit, delete, view
        rosters, sort by enrollment, export full courses). Students need to log
        in, browse what's available, register, and withdraw. The system should
        remember everything between sessions.
      </p>

      <h2>Architecture</h2>
      <p>
        The codebase is built around a single abstract <code>User</code> class
        that <code>Admin</code> and <code>Student</code> both inherit from. Each
        role implements its own behavior contract — <code>AdminActions</code>{' '}
        for admin capabilities, <code>StudentInterface</code> for student-facing
        actions. This split keeps responsibilities clear: a student object
        literally cannot delete a course, because that method isn't on its
        interface.
      </p>

      <div className="arch">
        <div className="arch-grid">
          <div className="arch-node">
            <strong>User</strong>
            abstract<br />
            username, password,<br />name, getters/setters
          </div>
          <div className="arch-node">
            <strong>Admin</strong>
            extends User<br />
            implements AdminActions
          </div>
          <div className="arch-node">
            <strong>Student</strong>
            extends User<br />
            implements StudentInterface
          </div>
        </div>
        <div className="arch-row">Persistence layer</div>
        <div className="arch-grid">
          <div className="arch-node">
            <strong>Course</strong>
            Serializable model<br />
            id, name, prof, location,<br />roster, capacity
          </div>
          <div className="arch-node">
            <strong>serialization</strong>
            load/save .ser files<br />fallback CSV import
          </div>
          <div className="arch-node">
            <strong>CRS</strong>
            main loop<br />menu routing &amp; I/O
          </div>
        </div>
      </div>

      <h2>How it works</h2>

      <h3>Persistence with a CSV fallback</h3>
      <p>
        On launch the system checks for a <code>CourseData.ser</code> file. If it
        exists, the saved course list is deserialized straight back into memory.
        If not, the system bootstraps from{' '}
        <code>MyUniversityCourses.csv</code> — 29 NYU graduate CS courses — and
        immediately writes a <code>.ser</code> so future launches are fast.
      </p>

      <div
        className="codeblock"
        data-lang="Java"
        dangerouslySetInnerHTML={{
          __html: `<span class="k">public static</span> <span class="t">ArrayList&lt;Course&gt;</span> loadData() {
    <span class="t">File</span> file = <span class="k">new</span> <span class="t">File</span>(<span class="s">"CourseData.ser"</span>);
    <span class="k">if</span> (file.exists()) {
        <span class="k">return</span> loadSer();           <span class="c">// fast path: deserialize</span>
    } <span class="k">else</span> {
        <span class="t">ArrayList&lt;Course&gt;</span> courses = loadCSV(<span class="s">"...MyUniversityCourses.csv"</span>);
        saveSer(courses);              <span class="c">// seed for next run</span>
        <span class="k">return</span> courses;
    }
}`,
        }}
      />

      <h3>Role-gated menus</h3>
      <p>
        The <code>CRS</code> main class authenticates the user at startup, then
        routes every menu selection through one of two handler methods —{' '}
        <code>adminMenu()</code> or <code>studentMenu()</code>. State is saved
        back to disk on exit.
      </p>

      <h3>Composite-key registration</h3>
      <p>
        Courses can have multiple sections, so a student's registration list
        stores composite keys like <code>"CSCI-GA.1170-1"</code> rather than
        just course IDs. This makes "already registered?" checks a fast string
        comparison and prevents accidental double-enrollment.
      </p>

      <h2>Features</h2>
      <div className="features">
        <div className="feature">
          <div className="label">Admin · 01</div>
          <h4>Full course CRUD</h4>
          <p>Create, edit, delete, and inspect any course or section — with duplicate-section validation.</p>
        </div>
        <div className="feature">
          <div className="label">Admin · 02</div>
          <h4>Roster &amp; enrollment views</h4>
          <p>List who's in any course, find every course a given student is in, see all full courses.</p>
        </div>
        <div className="feature">
          <div className="label">Admin · 03</div>
          <h4>Enrollment sort &amp; export</h4>
          <p>Sort the catalog by current enrollment (high → low); export full courses to a text file.</p>
        </div>
        <div className="feature">
          <div className="label">Student · 04</div>
          <h4>Browse &amp; register</h4>
          <p>View all courses or just the open ones, register, withdraw, and see your personal schedule.</p>
        </div>
      </div>

      <h2>What I'd do differently</h2>
      <ul>
        <li><strong>Hash the passwords.</strong> Right now they're stored as plain strings — fine for a homework, not for anything real.</li>
        <li><strong>Use a <code>HashMap&lt;String, Course&gt;</code></strong> instead of linear-scanning an <code>ArrayList</code> on every lookup.</li>
        <li><strong>Replace the <code>Scanner</code>-based menu</strong> with a real CLI library or a simple GUI.</li>
        <li><strong>Add unit tests.</strong> Right now correctness is verified by hand-running the menus.</li>
      </ul>

      <p className="pull">
        The most useful lesson wasn't the syntax — it was watching a clean
        interface quietly prevent entire categories of bugs.
      </p>

      <h2>Takeaways</h2>
      <p>
        Building this with a partner taught me as much about <em>structuring a
        small codebase for two people</em> as it did about Java. Splitting work
        along the interface boundaries meant we could work in parallel without
        stepping on each other's edits.
      </p>
    </article>
  );
}

// ============================================================
// Arabic prose
// ============================================================
function ArabicProse() {
  return (
    <article className="prose narrow">
      <p className="lead">
        كان المطلوب نظام تسجيل لجامعة صغيرة — لكن التمرين الحقيقي كان ممارسة
        أساسيات البرمجة الكائنية التي تجعل الكود <em>قادراً على التعامل مع المستخدمين الحقيقيين</em>:
        وراثة نظيفة، واجهات محددة النطاق، وتخزين لا يفقد بياناتك بين التشغيلات.
      </p>

      <h2>المشكلة</h2>
      <p>
        المشرفون يحتاجون إلى إدارة كتالوج المقررات (إنشاء، تعديل، حذف، عرض القوائم،
        الفرز حسب التسجيل، تصدير المقررات الممتلئة). الطلاب يحتاجون إلى تسجيل
        الدخول، تصفح المتاح، التسجيل، والانسحاب. النظام يجب أن يتذكر كل شيء بين الجلسات.
      </p>

      <h2>المعمارية</h2>
      <p>
        الكود مبني حول فئة مجردة واحدة <code>User</code> ترث منها كل من{' '}
        <code>Admin</code> و<code>Student</code>. كل دور ينفذ عقد سلوكه الخاص —{' '}
        <code>AdminActions</code> لقدرات المشرف، و<code>StudentInterface</code> للإجراءات
        الموجهة للطلاب. هذا الفصل يبقي المسؤوليات واضحة.
      </p>

      <h2>أبرز التحديات</h2>
      <ul>
        <li><strong>التخزين الدائم</strong> عبر Java serialization مع احتياطي من ملف CSV.</li>
        <li><strong>قوائم محمية بالأدوار</strong> — المشرف لا يستطيع فعل ما يفعله الطالب والعكس.</li>
        <li><strong>مفاتيح مركبة للتسجيل</strong> لمنع التسجيل المزدوج في نفس القسم.</li>
      </ul>

      <p className="pull">
        أهم درس لم يكن في القواعد — بل في مشاهدة كيف تمنع الواجهة النظيفة فئات كاملة
        من الأخطاء بهدوء.
      </p>

      <h2>الخلاصة</h2>
      <p>
        بناء هذا المشروع مع شريك علّمني عن <em>هيكلة كود صغير لشخصين</em> بقدر ما
        علّمني عن جافا. تقسيم العمل على حدود الواجهات يعني أننا نستطيع العمل بالتوازي
        دون أن يخطو أحدنا على تعديلات الآخر.
      </p>
    </article>
  );
}

export default CourseRegistrationProject;
