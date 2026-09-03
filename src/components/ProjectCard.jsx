import { useLanguage } from '../LanguageContext';
import { FILLER_IMAGE } from '../data/codingProjects';

function ProjectCard({ year, type, title, description, tags, href, image, imageAlt, thumbClass, hideDescription }) {
  const { lang } = useLanguage();
  const readMore = lang === 'en' ? 'Read more →' : 'اقرأ المزيد ←';

  const src = image || FILLER_IMAGE;
  // The Haa placeholder is a full scene, not a mark — it needs the fill
  // treatment rather than the 120px mark sizing.
  const isIllustration = src === FILLER_IMAGE;

  const thumbClasses = [
    'project-thumb',
    'project-thumb--brand',
    isIllustration && 'project-thumb--illustration',
    thumbClass,
  ].filter(Boolean).join(' ');

  return (
    <a className="project" href={href}>
      <div className={thumbClasses}>
        <img src={src} alt={imageAlt || title} />
      </div>
      <div className="meta">
        <span>{year}</span>
        <span>{type}</span>
      </div>
      <h3>{title}</h3>
      {!hideDescription && <p>{description}</p>}
      <div className="tags">
        {tags.map((tag) => (
          <span key={tag} className="latin">{tag}</span>
        ))}
      </div>
      <div className="arrow">{readMore}</div>
    </a>
  );
}

export default ProjectCard;
