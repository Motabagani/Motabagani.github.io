import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';
import { useLanguage } from '../LanguageContext';
import { economicProjects } from '../data/economicProjects';

function EconomicModelsPage() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const pick = (v) => (v && typeof v === 'object' && 'en' in v ? v[lang] : v);

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {t.sections.economics}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{t.sections.economics}</h1>
          <p className="deck">
            {ar
              ? 'نماذج ومفاهيم بحثية عند تقاطع الاقتصاد القياسي والحوسبة.'
              : 'Research models and concepts at the intersection of econometrics and computation.'}
          </p>
        </header>

        <section className="section">
          <div className="container">
            <div className="projects">
              {economicProjects.map((p) => (
                <ProjectCard
                  key={pick(p.title)}
                  year={pick(p.year)}
                  type={pick(p.type)}
                  title={pick(p.title)}
                  description={pick(p.description)}
                  tags={p.tags}
                  image={p.image}
                  thumbClass={p.thumbClass}
                  href={p.href(lang)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default EconomicModelsPage;
