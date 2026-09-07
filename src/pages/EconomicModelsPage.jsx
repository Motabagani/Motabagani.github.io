import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import RunnerGame2 from '../components/RunnerGame2';

function EconomicModelsPage() {
  const { t, lang } = useLanguage();

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{lang === 'en' ? 'Home' : 'الرئيسية'}</a>
          &nbsp;/&nbsp; {t.sections.economics}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <h1 className="sr-only">{t.sections.economics}</h1>
        <RunnerGame2 />
      </main>
    </>
  );
}

export default EconomicModelsPage;