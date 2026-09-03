import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

/* Graphic Design — landing page.
   One card per project, same pattern as the coding section's Course
   Registration card. "Read more" opens the full case study at
   #/<lang>/projects/ssa-ucsd (SSAUCSDProject.jsx).
   Add more cards by copying the <a className="project"> block. */

function GraphicDesignPage() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`#/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {t.sections.design}
          <img src="images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{t.sections.design}</h1>
        </header>

        <section className="section">
          <div className="container">
            <div className="projects">

              {/* Saudi Student Association at UC San Diego */}
              <a className="project" href={`#/${lang}/projects/ssa-ucsd?from=graphic-design`}>
                <div className="project-thumb">
                  <img
                    src="images/ssa-ucsd-logo.png"
                    alt={ar ? 'شعار النادي السعودي' : 'Saudi Student Association mark'}
                  />
                </div>
                <div className="meta">
                  <span>{ar ? '٢٠٢٤' : '2024'}</span>
                  <span>{ar ? 'هوية بصرية' : 'Visual Identity'}</span>
                </div>
                <h3>
                  {ar
                    ? 'النادي السعودي في جامعة كاليفورنيا سان دييغو'
                    : 'Saudi Student Association at UC San Diego'}
                </h3>
                <div className="arrow">{ar ? 'اقرأ المزيد ←' : 'Read more →'}</div>
              </a>

            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default GraphicDesignPage;
