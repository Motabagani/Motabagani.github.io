import { useState } from 'react';
import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';
import { useLanguage } from '../LanguageContext';
import { codingProjects, CODING_COLLECTIONS } from '../data/codingProjects';

function CodingPage() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const pick = (v) => (v && typeof v === 'object' && 'en' in v ? v[lang] : v);
  const [active, setActive] = useState('all');

  // Collections in display order, each with its projects; empty ones are hidden.
  const groups = CODING_COLLECTIONS
    .map((c) => ({ ...c, items: codingProjects.filter((p) => p.collection === c.id) }))
    .filter((g) => g.items.length > 0);
  const shown = active === 'all' ? groups : groups.filter((g) => g.id === active);

  const card = (p) => (
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
  );

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {t.sections.coding}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{t.sections.coding}</h1>
          <p className="deck">
            {ar
              ? 'مشاريع في البرمجة — تطبيقات وأنظمة بنيتها من الصفر.'
              : 'Programming projects — apps and systems built from the ground up.'}
          </p>
        </header>

        <section className="section">
          <div className="container">
            {/* Collection filters */}
            <div className="coll-chips" role="group" aria-label={ar ? 'تصفية حسب المجموعة' : 'Filter by collection'}>
              <button
                type="button"
                className={'coll-chip' + (active === 'all' ? ' is-active' : '')}
                aria-pressed={active === 'all'}
                onClick={() => setActive('all')}
              >
                {ar ? 'الكل' : 'All'} <span className="n">{codingProjects.length}</span>
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={'coll-chip' + (active === g.id ? ' is-active' : '')}
                  aria-pressed={active === g.id}
                  onClick={() => setActive(g.id)}
                >
                  {pick(g.label)} <span className="n">{g.items.length}</span>
                </button>
              ))}
            </div>

            {shown.map((g) => (
              <div className="coll-group" key={g.id}>
                <h2 className="coll-title">{pick(g.label)}</h2>
                <div className="projects">{g.items.map(card)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default CodingPage;
