import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

/* PhotoPage — shows a photo alone on the site's purple page: the mentoring photo
   with the FChO thank-you, or the original Instagram story it came from. It's a
   normal page that flows down (no modal). Add entries to STORIES. */

const STORIES = {
  'icho-team': {
    src: 'images/icho-team.jpg',
    alt: {
      en: 'Hashim mentoring the German national team at the 56th International Chemistry Olympiad, Riyadh 2024',
      ar: 'هاشم مع المنتخب الألماني في أولمبياد الكيمياء الدولي الـ٥٦، الرياض ٢٠٢٤',
    },
    quote: {
      de: 'Vielen Dank an dieser Stelle auch an Hashim, der sich als Team-Mentor 9 Tage lang super um unser Team gekümmert hat!',
      en: 'Special thanks also to Hashim, who took wonderful care of our team as team mentor for 9 days!',
      ar: 'شكرٌ خاص أيضاً لهاشم، الذي اعتنى بفريقنا كمرشدٍ على مدى ٩ أيام خير عناية!',
    },
    source: {
      label: { en: 'Friends of the Chemistry Olympiad (FChO) · @fcho_e.v', ar: 'أصدقاء أولمبياد الكيمياء (FChO) · @fcho_e.v' },
      to: 'story/icho',
    },
  },
  icho: {
    src: 'images/icho-story.jpg',
    alt: {
      en: 'Friends of the Chemistry Olympiad — Instagram story',
      ar: 'أصدقاء أولمبياد الكيمياء — قصة إنستغرام',
    },
    caption: {
      en: 'The original Instagram story · Friends of the Chemistry Olympiad (FChO), 56th IChO, Riyadh 2024',
      ar: 'قصة إنستغرام الأصلية · أصدقاء أولمبياد الكيمياء (FChO)، أولمبياد الكيمياء الدولي الـ٥٦، الرياض ٢٠٢٤',
    },
  },
};

const CSS = `
.photopage { max-width: 760px; margin: 8px auto 0; text-align: start; padding-bottom: 72px; }
.photopage__img {
  width: 100%; height: auto; display: block;
  border-radius: 16px; border: 1px solid var(--divider); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}
.photopage__quote { margin: 22px 0 0; }
.photopage__quote-de { display: block; font-size: clamp(18px, 2.6vw, 24px); line-height: 1.5; color: var(--ink); font-style: italic; }
.photopage__quote-tr { display: block; margin-top: 10px; font-size: 16px; line-height: 1.55; color: var(--muted); }
.photopage__cap { margin: 16px 0 0; font-size: 14px; color: var(--muted); line-height: 1.5; }
.photopage__src { margin: 16px 0 0; }
.photopage__src a { color: var(--accent); text-decoration: none; font-weight: 600; font-size: 14.5px; }
.photopage__src a:hover { text-decoration: underline; text-underline-offset: 3px; }
.photopage__back { margin: 30px 0 0; }
.photopage__back a { color: var(--accent); text-decoration: none; font-weight: 600; }
.photopage__back a:hover { text-decoration: underline; text-underline-offset: 3px; }
`;

function PhotoPage({ slug }) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const story = STORIES[slug];
  const back = isEn ? '← Back to my journey' : 'العودة إلى رحلتي ←';

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`#/${lang}`}>{isEn ? 'Home' : 'الرئيسية'}</a>
          &nbsp;/&nbsp; <a href={`#/${lang}/about`}>{isEn ? 'About Me' : 'عني'}</a>
          <img src="images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <h1 className="sr-only">{isEn ? 'Photo story' : 'قصة مصوّرة'}</h1>
        <div className="photopage">
          <style>{CSS}</style>
          {!story ? (
            <p className="photopage__cap">{isEn ? 'Photo not found.' : 'الصورة غير موجودة.'}</p>
          ) : (
            <>
              <img className="photopage__img" src={story.src} alt={story.alt ? (isEn ? story.alt.en : story.alt.ar) : ''} />

              {story.quote && (
                <blockquote className="photopage__quote">
                  <span className="photopage__quote-de">{story.quote.de}</span>
                  <span className="photopage__quote-tr">{isEn ? story.quote.en : story.quote.ar}</span>
                </blockquote>
              )}

              {story.caption && <p className="photopage__cap">{isEn ? story.caption.en : story.caption.ar}</p>}

              {story.source && (
                <p className="photopage__src">
                  <a href={`#/${lang}/${story.source.to}`}>
                    — {isEn ? story.source.label.en : story.source.label.ar}<span aria-hidden="true"> {isEn ? '→' : '←'}</span>
                  </a>
                </p>
              )}
            </>
          )}
          <p className="photopage__back"><a href={`#/${lang}/about`}>{back}</a></p>
        </div>
      </main>
    </>
  );
}

export default PhotoPage;
