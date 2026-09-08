// Shared source of truth for the coding projects.
// Used by both the homepage Coding section and the Coding page.
//
// Each `image` is a placeholder for now — swap the path for a real
// screenshot/cover later. `FILLER_IMAGE` is the Haa coding illustration
// on a light panel so every card has a picture in the meantime.

export const FILLER_IMAGE = '/images/Haacoding.png';

// Collections group the projects on the Coding page (filter chips + sections).
// Order here is the display order; a collection with no projects is hidden
// automatically, so new buckets (or a first Penn State project) just appear.
export const CODING_COLLECTIONS = [
  { id: 'nyu',        label: { en: 'New York University', ar: 'جامعة نيويورك' } },
  { id: 'penn-state', label: { en: 'Penn State',          ar: 'جامعة ولاية بنسلفانيا' } },
  { id: 'research',   label: { en: 'Research',            ar: 'أبحاث' } },
  { id: 'personal',   label: { en: 'Personal',            ar: 'مشاريع شخصية' } },
];

export const codingProjects = [
  {
    year: { en: '2026', ar: '٢٠٢٦' },
    type: { en: 'Code · Personal project', ar: 'برمجة · مشروع شخصي' },
    title: { en: 'Rafeeq', ar: 'رفيق' },
    description: {
      en: 'A bilingual simulator of the Saudi scholarship journey — four phases, issued documents with tracking references, and a content-hashed storage layer built for a backend.',
      ar: 'محاكي ثنائي اللغة لرحلة الابتعاث السعودي — أربع مراحل، ووثائق صادرة بأرقام تتبع، وطبقة تخزين مبنية لخادم لاحق.',
    },
    tags: ['React', 'Vite', 'RTL', 'IndexedDB'],
    status: 'current',
    collection: 'personal',
    image: '/images/rafeeq-bright.png',
    // Rafeeq's own deep teal/green, so the mint mark sits on its brand colour
    thumbClass: 'project-thumb--rafeeq',
    href: (lang) => `/${lang}/projects/rafeeq`,
  },
  {
    year: { en: '2026', ar: '٢٠٢٦' },
    type: { en: 'Code · CSCI-UA 102', ar: 'برمجة · CSCI-UA 102' },
    title: { en: 'Course Registration System', ar: 'نظام تسجيل المقررات' },
    description: {
      en: 'A Java OOP project simulating a university course registration platform — admin and student roles, course CRUD, enrollment, and .ser persistence.',
      ar: 'مشروع جافا يحاكي منصة تسجيل مقررات جامعية — أدوار للمشرفين والطلاب، إدارة المقررات، التسجيل، وتخزين دائم للبيانات بين الجلسات.',
    },
    tags: ['Java', 'OOP', 'Serialization', 'CSV'],
    status: 'completed',
    collection: 'nyu',
    // TODO: replace with a real Course Registration cover image
    image: FILLER_IMAGE,
    href: (lang) => `/${lang}/projects/course-registration`,
  },
  {
    year: { en: '2025', ar: '٢٠٢٥' },
    type: { en: 'Research · CMU RISS', ar: 'بحث · CMU RISS' },
    title: { en: 'Simulating Soft DeltaZ in MuJoCo', ar: 'محاكاة DeltaZ المرن في MuJoCo' },
    description: {
      en: 'A CMU Robotics Institute Summer Scholars project — modeling the DeltaZ soft manipulator in MuJoCo with flex/flexcomp and validating it against physical TPU prototypes. Includes an interactive in-browser DeltaZ you can drive.',
      ar: 'مشروع بحثي في برنامج RISS بمعهد الروبوتات في CMU — نمذجة المناور المرن DeltaZ في MuJoCo باستخدام flex والتحقق منه مقابل نماذج TPU الفيزيائية، مع محاكاة تفاعلية في المتصفح.',
    },
    tags: ['MuJoCo', 'Python', 'Three.js', 'Robotics'],
    status: 'completed',
    collection: 'research',
    image: '/images/haa robots.png',
    thumbClass: 'project-thumb--illustration',
    href: (lang) => `/${lang}/journey/cmu-riss?from=coding`,
  },
];
