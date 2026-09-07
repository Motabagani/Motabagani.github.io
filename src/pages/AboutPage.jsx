import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import JourneyTimeline from '../components/JourneyTimeline';
import Certifications from '../components/Certifications';

function AboutPage() {
  const { t, lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
<a href={`/${lang}`}>{lang === 'en' ? 'Home' : 'الرئيسية'}</a>
          &nbsp;/&nbsp; {t.sections.about}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <div className="about-mobile-pad" style={{ maxWidth: 760, margin: '0 auto' }}>
          <style>{`
            .about-intro { display: flex; align-items: center; gap: 26px; text-align: start; }
            .about-photo-wrap { position: relative; flex: none; }
            /* Naqsh ornament peeking out from under the photo. */
            .about-naqsh {
              position: absolute; z-index: 0; pointer-events: none;
              width: 220px; height: auto; opacity: 0.22;
              inset-inline-start: -26px; bottom: -40px;
              mix-blend-mode: screen;
            }
            .about-photo {
              position: relative; z-index: 1; display: block;
              width: 168px; aspect-ratio: 4 / 5; border-radius: 14px;
              object-fit: cover; object-position: 50% 28%;
              border: 1px solid var(--divider);
              box-shadow: 0 12px 34px rgba(0, 0, 0, 0.38);
            }
            .about-hala { margin: 0; font-size: clamp(26px, 4.4vw, 38px); font-weight: 700; letter-spacing: -0.01em; color: var(--ink); line-height: 1.12; }
            .about-hala-note { margin: 7px 0 0; font-size: 14px; color: var(--muted); font-style: italic; line-height: 1.5; }
            .about-social { display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 14px 0 0; }
            .about-social a { color: var(--accent); text-decoration: none; font-weight: 600; font-size: 14.5px; }
            .about-social a:hover { text-decoration: underline; text-underline-offset: 3px; }
            @media (max-width: 560px) {
              .about-intro { flex-direction: column; align-items: flex-start; gap: 18px; }
              .about-photo { width: 144px; }
              .about-naqsh { width: 185px; bottom: -32px; }
            }
          `}</style>
          <div className="about-intro">
            <div className="about-photo-wrap">
              <img className="about-photo" src="/images/hashim.png" alt="Hashim Motabagani" />
            </div>
            <div>
              <h1 className="about-hala">{isEn ? 'Hala, I’m Hashim.' : 'هلا، أنا هاشم.'}</h1>
              <p className="deck" style={{ margin: '14px 0 6px' }}>{t.about.bio1}</p>
              <p style={{ margin: 10, color: 'var(--muted)', fontSize: 16, lineHeight: 1.55 }}>{t.about.bio2}</p>
              <p className="about-social">
                <a href="https://github.com/Motabagani" target="_blank" rel="noreferrer">GitHub ↗</a>
                <a href="https://www.linkedin.com/in/almutabaganih/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                <a href="mailto:hm2983@nyu.edu">Email ↗</a>
              </p>
            </div>
          </div>
        </div>

        <JourneyTimeline />

        <Certifications />

      </main>
    </>
  );
}

export default AboutPage;
