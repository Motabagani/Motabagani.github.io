import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import HaaDancing from '../components/HaaDancing';

function Error404() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <img src="/images/naqsh.png" alt="" className="hero-naqsh" />

        <div style={{ textAlign: 'center', padding: '40px 24px 80px' }}>
          <HaaDancing spaceAnywhere />

          {/* --- optional: 404 message + way home. Delete this block for just Ha'a --- */}
          <h1 style={{ marginTop: 24 }}>{isEn ? 'ERROR 404' : 'خطأ ٤٠٤'}</h1>
          <p className="deck" style={{ margin: '8px auto 0', maxWidth: 560 }}>
            {isEn
              ? "Looks like you've lost your way — but at least you found Ha'a, playing the oud."
              : 'تُهت عن الطريق؟ سايق الخير ساقك عند هاء وهو يعزف عود…  🎵'}
          </p>
          <p style={{ marginTop: 20 }}>
            <a href={`/${lang}`}>{isEn ? '← Back to home' : 'العودة إلى الصفحة الرئيسية ←'}</a>
          </p>
        </div>
      </main>
    </>
  );
}

export default Error404;