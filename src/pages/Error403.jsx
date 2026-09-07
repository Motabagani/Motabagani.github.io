import { useEffect } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import HaaBand from '../components/HaaBand';

function Error403() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  // Make the whole 403 page black (the naqsh watermark still shows through).
  useEffect(() => {
    document.body.classList.add('page-black');
    return () => document.body.classList.remove('page-black');
  }, []);

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <img src="/images/naqsh.png" alt="" className="hero-naqsh" />

        <div style={{ textAlign: 'center', padding: '32px 24px 80px' }}>
          <HaaBand />

          <h1 style={{ marginTop: 28 }}>{isEn ? 'ERROR 403' : 'خطأ ٤٠٣'}</h1>
          <p className="deck" style={{ margin: '8px auto 0', maxWidth: 620 }}>
            {isEn
              ? "This corner's off-limits — but the skyline's putting on a show. Enjoy the view while you're here."
              : 'لعلك دخلت منطقة محظورة، لكن ما دامك هنا، استمتع بالمنظر بين الرياض ونيويورك.'}
          </p>

          <p style={{ margin: '16px auto 0', maxWidth: 560, fontSize: 14, color: 'rgba(240, 235, 224, 0.72)', lineHeight: 1.6 }}>
            {isEn ? (
              <>You don’t have permission to view this page. If you think that’s a mistake, please
                contact the <a href="mailto:hm2983@nyu.edu,helpdesk@cims.nyu.edu?subject=Portfolio%20403%20—%20access%20issue">webmaster</a>.</>
            ) : (
              <>ما عندك صلاحية لعرض هذي الصفحة. إذا تظن أنها غلطة، تواصل مع{' '}
                <a href="mailto:hm2983@nyu.edu,helpdesk@cims.nyu.edu?subject=Portfolio%20403%20—%20access%20issue">مسؤول الموقع</a>.</>
            )}
          </p>

          <p style={{ marginTop: 20 }}>
            <a href={`/${lang}`}>{isEn ? '← Back to home' : 'العودة إلى الصفحة الرئيسية ←'}</a>
          </p>
        </div>
      </main>
    </>
  );
}

export default Error403;
