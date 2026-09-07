import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

/* FAQ — expandable questions using native <details>/<summary> for built-in
   keyboard + screen-reader support. Bilingual; each answer may carry one link. */

const FAQS = [
  {
    q: { en: 'Who are you?', ar: 'من أنت؟' },
    a: {
      en: 'I’m Hashim Motabagani — an NYU student building software, economic models, and visual identities between Riyadh and New York.',
      ar: 'أنا هاشم مطبقاني — طالب في جامعة نيويورك، أبني البرمجيات والنماذج الاقتصادية والهويات البصرية بين الرياض ونيويورك.',
    },
  },
  {
    q: { en: 'What do you actually do?', ar: 'ما الذي تعمل عليه فعلاً؟' },
    a: {
      en: 'Three things: I write code (apps and systems), build economic models, and design graphics and brand identities.',
      ar: 'ثلاثة مجالات: أكتب الأكواد (تطبيقات وأنظمة)، وأبني النماذج الاقتصادية، وأصمّم الجرافيك والهويات البصرية.',
    },
  },
  {
    q: { en: 'What are you studying, and where?', ar: 'ماذا تدرس، وأين؟' },
    a: {
      en: 'I study at New York University, after transferring in from Penn State — focused on economics and computer science.',
      ar: 'أدرس في جامعة نيويورك بعد انتقالي إليها من جامعة ولاية بنسلفانيا، مع تركيز على الاقتصاد وعلوم الحاسب.',
    },
  },
  {
    q: { en: 'What is Rafeeq?', ar: 'ما هو رفيق؟' },
    a: {
      en: 'Rafeeq is a prototype I built — a scholarship-journey simulator that walks a student through the phases of a study-abroad scholarship.',
      ar: 'رفيق نموذج أوّلي بنيته — محاكٍ لرحلة الابتعاث يمرّ بالطالب عبر مراحل منحة الدراسة في الخارج.',
    },
    link: { to: 'coding', label: { en: 'See it in Coding', ar: 'شاهده في قسم البرمجة' } },
  },
  {
    q: { en: 'Which technologies do you work with?', ar: 'ما التقنيات التي تستخدمها؟' },
    a: {
      en: 'Mostly React, Vite, and JavaScript on the front end; Python for models and tooling; and MuJoCo + Three.js for robotics simulation. I design in the Adobe suite.',
      ar: 'غالباً React وVite وJavaScript في الواجهة؛ وPython للنماذج والأدوات؛ وMuJoCo مع Three.js لمحاكاة الروبوتات. وأصمّم عبر أدوات Adobe.',
    },
  },
  {
    q: { en: 'Are you open to opportunities?', ar: 'هل أنت منفتح على الفرص؟' },
    a: {
      en: 'Yes — I’m open to internships and collaborations. The best way to reach me is the contact page or email.',
      ar: 'نعم — أنا منفتح على التدريب والتعاون. أفضل طريقة للتواصل هي صفحة التواصل أو البريد الإلكتروني.',
    },
    link: { to: 'contact', label: { en: 'Get in touch', ar: 'تواصل معي' } },
  },
  {
    q: { en: 'Where can I see your code?', ar: 'أين أرى أعمالك البرمجية؟' },
    a: {
      en: 'On GitHub, and each project here links to its own case study.',
      ar: 'على GitHub، وكل مشروع هنا يرتبط بدراسة الحالة الخاصة به.',
    },
    ext: { href: 'https://github.com/Motabagani', label: { en: 'github.com/Motabagani', ar: 'github.com/Motabagani' } },
  },
  {
    q: { en: 'What’s the “hala” on the homepage?', ar: 'ما قصة «هلا» في الصفحة الرئيسية؟' },
    a: {
      en: '“Hala” (هلا) is a warm Saudi greeting. It opens the site as a hello — and doubles as the site’s mascot, Haa.',
      ar: '«هلا» تحية سعودية دافئة. تفتتح الموقع كترحيب — وهي أيضاً شخصية الموقع، هاء.',
    },
  },
  {
    q: { en: 'How is my data handled?', ar: 'كيف تُعالَج بياناتي؟' },
    a: {
      en: 'Only what you send through the contact form is stored, and IP addresses are hashed, never stored raw.',
      ar: 'يُحفظ فقط ما ترسله عبر نموذج التواصل، وتُشفَّر عناوين IP ولا تُخزَّن كما هي.',
    },
    link: { to: 'legal/privacy', label: { en: 'Read the Privacy Policy', ar: 'اقرأ سياسة الخصوصية' } },
  },
];

function FaqPage() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const title = ar ? 'الأسئلة الشائعة' : 'FAQ';

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {title}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{title}</h1>
          <p className="deck">
            {ar ? 'إجابات سريعة عن الأسئلة الأكثر تكراراً.' : 'Quick answers to the questions I get most.'}
          </p>
        </header>

        <section className="container faq">
          {FAQS.map((f, i) => (
            <details className="faq__item" key={i}>
              <summary className="faq__q">
                <span>{ar ? f.q.ar : f.q.en}</span>
                <svg className="faq__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="faq__a">
                <p>{ar ? f.a.ar : f.a.en}</p>
                {f.link && (
                  <a className="faq__link" href={`/${lang}/${f.link.to}`}>
                    {ar ? f.link.label.ar : f.link.label.en}
                    <span aria-hidden="true"> {ar ? '←' : '→'}</span>
                  </a>
                )}
                {f.ext && (
                  <a className="faq__link" href={f.ext.href} target="_blank" rel="noreferrer">
                    {ar ? f.ext.label.ar : f.ext.label.en}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </div>
            </details>
          ))}
        </section>
      </main>
    </>
  );
}

export default FaqPage;
