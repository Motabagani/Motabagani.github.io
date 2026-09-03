import { useLanguage } from '../LanguageContext';

/* Placeholder panel for sections that don't have content yet.
   Styled to match the project cards so an empty section still reads
   as part of the same system instead of a stray line of text. */

function ComingSoon({ note }) {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  return (
    <div className="coming-soon">
      <div className="coming-soon__mark">
        <img src="images/driller.png" alt="" />
      </div>
      <h3 className="coming-soon__title">{ar ? 'قريباً' : 'Coming soon'}</h3>
      <p className="coming-soon__note">
        {note || (ar
          ? 'أعمل على هذا القسم حالياً. عد قريباً.'
          : 'This section is being built. Check back soon.')}
      </p>
    </div>
  );
}

export default ComingSoon;
