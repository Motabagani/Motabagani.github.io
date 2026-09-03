import { useLanguage } from '../LanguageContext';

/* Certifications — a small section under the journey timeline. Bilingual.
   Add more entries to CERTS as they come. */

const CERTS = [
  {
    name: { en: 'Future Seekers — Product Manager Nanodegree', ar: 'Future Seekers — شهادة مدير المنتج' },
    issuer: { en: 'Udacity · Misk Foundation', ar: 'يوداسيتي · مؤسسة مسك' },
    date: { en: 'Oct 2021', ar: 'أكتوبر ٢٠٢١' },
    href: 'https://www.udacity.com/certificate/TGGKRCC7',
  },
  {
    name: { en: 'Introduction to Machine Learning', ar: 'مقدمة في تعلّم الآلة' },
    issuer: { en: 'Duke University', ar: 'جامعة ديوك' },
    date: { en: 'Jul 2024', ar: 'يوليو ٢٠٢٤' },
    href: 'https://www.coursera.org/account/accomplishments/verify/M7SBN59Z2UF4',
  },
];

const CSS = `
.certs { max-width: 960px; margin: 40px auto 0; text-align: start; }
.certs__head { margin: 0 0 16px; font-size: clamp(20px, 3vw, 26px); font-weight: 700; letter-spacing: -.01em; color: var(--ink); }
.certs__list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.certs__card {
  display: flex; align-items: center; gap: 14px;
  background: var(--surface-1); border: 1px solid var(--divider);
  border-radius: 16px; padding: 14px 16px;
  transition: transform .16s ease, background .16s ease;
}
.certs__card:hover { background: var(--surface-2); transform: translateY(-2px); }
a.certs__card { text-decoration: none; }
.certs__view { margin: 5px 0 0; font-size: 12px; font-weight: 700; color: var(--accent); }
.certs__badge {
  flex: none; width: 42px; height: 42px; border-radius: 50%;
  display: grid; place-items: center;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--accent);
}
.certs__badge svg { width: 22px; height: 22px; }
.certs__name { margin: 0; font-size: 15.5px; font-weight: 700; color: var(--ink); line-height: 1.3; }
.certs__issuer { margin: 3px 0 0; font-size: 13px; color: var(--muted); }
.certs__date { margin: 2px 0 0; font-size: 12px; font-weight: 600; color: var(--accent); font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .certs__card { transition: none; } }
`;

export default function Certifications() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section className="certs" aria-label={isEn ? 'Certifications' : 'الشهادات'}>
      <style>{CSS}</style>
      <h2 className="certs__head">{isEn ? 'Certifications' : 'الشهادات'}</h2>
      <ul className="certs__list">
        {CERTS.map((c, i) => {
          const Tag = c.href ? 'a' : 'div';
          const linkProps = c.href ? { href: c.href, target: '_blank', rel: 'noreferrer' } : {};
          return (
            <li key={i}>
              <Tag className="certs__card" {...linkProps}>
                <span className="certs__badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
                  </svg>
                </span>
                <div>
                  <h3 className="certs__name">{isEn ? c.name.en : c.name.ar}</h3>
                  {c.issuer && <p className="certs__issuer">{isEn ? c.issuer.en : c.issuer.ar}</p>}
                  {c.date && <p className="certs__date">{isEn ? c.date.en : c.date.ar}</p>}
                  {c.href && <p className="certs__view">{isEn ? 'View credential ↗' : 'عرض الشهادة ↗'}</p>}
                </div>
              </Tag>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
