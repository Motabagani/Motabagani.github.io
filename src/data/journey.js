/* Journey content — shared by the About-page timeline (JourneyTimeline) and the
   per-entry detail pages (JourneyDetail). Edit the text here.

   Each ITEM:
     cat    'academic' | 'research' | 'industry' | 'extracurricular'
     date/title/org/note   bilingual { en, ar }
     honor / cert          optional bilingual chip shown on the card
     slug + more           optional — gives the card a "Read more" link to its
                           own page (#/{lang}/journey/{slug}) with a longer
                           write-up, a photo gallery, and links. To add photos,
                           drop files in public/images/ and reference them as
                           '/images/yourfile.jpg'. */

export const CATS = {
  academic:        { color: '#f5b74e', en: 'Academic',        ar: 'أكاديمي' },
  research:        { color: '#4fc7a8', en: 'Research',         ar: 'بحث' },
  industry:        { color: '#5fa8f0', en: 'Industry',         ar: 'صناعة' },
  extracurricular: { color: '#e07bc0', en: 'Extracurricular',  ar: 'نشاطات' },
};

// Oldest first — the journey starts at the KGSP scholarship (2022).
export const ITEMS = [
  {
    cat: 'academic',
    date: { en: 'Aug 2022 – Present', ar: 'أغسطس ٢٠٢٢ – الآن' },
    title: { en: 'KAUST Gifted Student Program (KGSP)', ar: 'برنامج جامعة الملك عبدالله للعلوم والتقنية (كاوست) للطلبة الموهوبين' },
    org: { en: 'King Abdullah University of Science & Technology', ar: 'جامعة الملك عبدالله للعلوم والتقنية' },
    note: { en: 'A prestigious full scholarship — the start of the journey abroad.', ar: 'منحة دراسية كاملة مرموقة — بداية الرحلة للدراسة بالخارج.' },
    logo: '/images/kgsp_logo.png',
  },
  {
    cat: 'academic',
    date: { en: 'Sep 2022 – Jun 2023', ar: 'سبتمبر ٢٠٢٢ – يونيو ٢٠٢٣' },
    title: { en: 'Foundation Year Program', ar: 'برنامج السنة التأسيسية' },
    org: { en: 'University of Illinois Urbana-Champaign', ar: 'جامعة إلينوي في أوربانا-شامبين' },
    note: { en: 'A college-prep bridge year — test prep, applications, and college courses.', ar: 'سنة تأسيسية تمهّد للجامعة — اختبارات، وتقديم جامعي، ومواد جامعية.' },
    cert: { en: 'KAUST Leadership Certificate', ar: 'شهادة القيادة من كاوست' },
    logo: '/images/uiuc_logo.png',
  },
  {
    cat: 'academic',
    date: { en: 'Aug 2023 – Aug 2025', ar: 'أغسطس ٢٠٢٣ – أغسطس ٢٠٢٥' },
    title: { en: 'B.S. Computer Science', ar: 'بكالوريوس علوم الحاسب' },
    org: { en: 'The Pennsylvania State University', ar: 'جامعة ولاية بنسلفانيا' },
    note: { en: 'Systems programming, data structures & algorithms, OOP.', ar: 'برمجة الأنظمة، وهياكل البيانات والخوارزميات، والبرمجة الكائنية.' },
    honor: { en: "Dean's List · Fall 2023", ar: 'قائمة العميد · خريف ٢٠٢٣' },
    logo: '/images/psu logo norm.png',
    // Small badge shown top-corner opposite the logo.
    flag: { en: 'Transferred out', ar: 'انتقلت منها' },
  },
  {
    cat: 'extracurricular',
    date: { en: 'Jul 2024', ar: 'يوليو ٢٠٢٤' },
    title: { en: "Guide & Organizer — Int'l Chemistry Olympiad", ar: 'مرشد ومنظّم — أولمبياد الكيمياء الدولي' },
    org: { en: 'IChO · Riyadh, Saudi Arabia', ar: 'IChO · الرياض، السعودية' },
    note: { en: 'Guided the German national team and made the event more culturally inclusive.', ar: 'رافقت المنتخب الألماني وجعلت الفعالية أكثر شمولاً ثقافياً.' },
    logo: '/images/icho_logo.png',
    // Click-to-open photo with the German team's public thank-you + source link.
    // Thumbnail opens a modal with the photo, the FChO thank-you (German +
    // translation), and a link to the original story screenshot page.
    photo: {
      src: '/images/icho-team.jpg',
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
  },
  {
    cat: 'extracurricular',
    date: { en: 'Jul 2024 – Jun 2025', ar: 'يوليو ٢٠٢٤ – يونيو ٢٠٢٥' },
    title: { en: 'Graphic Designer — Saudi Student Association', ar: 'مصمم جرافيك — نادي الطلبة السعوديين' },
    org: { en: 'UC San Diego', ar: 'جامعة كاليفورنيا، سان دييغو' },
    note: { en: 'Built a new visual-identity guide and led custom merch production.', ar: 'أنشأت دليل هوية بصرية جديد وقُدت إنتاج منتجات مخصصة.' },
    logo: '/images/ssa-ucsd-logo.png',
    // A short About-timeline page (/journey/ssa-ucsd) with the brief, plus a link
    // out to the full graphic-design case study (projects/ssa-ucsd).
    slug: 'ssa-ucsd',
    to: 'projects/ssa-ucsd',
    // Full-bleed brand hero on the /journey/ssa-ucsd page (white UCSD trident on UCSD Deep Teal).
    hero: { img: '/images/ssa-ucsd-logo.png', bg: 'linear-gradient(150deg, #006A6E 0%, #04343A 100%)' },
    more: {
      body: {
        en: 'As the Saudi Student Association’s graphic designer at UC San Diego, I built a new visual-identity guide and led custom merch production for the community. The full breakdown lives in the graphic-design case study.',
        ar: 'كمصمم جرافيك لنادي الطلبة السعوديين في جامعة كاليفورنيا سان دييغو، أنشأت دليل هوية بصرية جديد وقُدت إنتاج منتجات مخصصة للنادي. التفاصيل الكاملة في دراسة حالة التصميم الجرافيكي.',
      },
    },
  },
  {
    cat: 'industry',
    date: { en: 'Jul 2024 – Mar 2025', ar: 'يوليو ٢٠٢٤ – مارس ٢٠٢٥' },
    title: { en: 'Product Designer', ar: 'مصمم منتج' },
    org: { en: 'Hayerd — AI for the Saudi labor market', ar: 'حَيِّرد — ذكاء اصطناعي لسوق العمل السعودي' },
    note: { en: 'Led user research, shipped 8 prototypes, bridged technical & business teams bilingually.', ar: 'قُدت أبحاث المستخدمين، وأطلقت ٨ نماذج، وربطت الفرق التقنية بأصحاب القرار بلغتين.' },
  },
  {
    cat: 'academic',
    date: { en: 'Aug 2024 – Dec 2024', ar: 'أغسطس ٢٠٢٤ – ديسمبر ٢٠٢٤' },
    title: { en: 'MATH 140 Learning Assistant', ar: 'مساعد تعليمي — MATH 140' },
    org: { en: 'Eberly College of Science, Penn State', ar: 'كلية إيبرلي للعلوم، جامعة ولاية بنسلفانيا' },
    note: { en: 'Peer-led calculus sessions for 40+ students daily; +~30% participation.', ar: 'جلسات تفاعلية في التفاضل لأكثر من ٤٠ طالباً يومياً، ورفعت التفاعل بنحو ٣٠٪.' },
  },
  {
    cat: 'extracurricular',
    date: { en: 'Aug 2024 – Dec 2024', ar: 'أغسطس ٢٠٢٤ – ديسمبر ٢٠٢٤' },
    title: { en: 'PRCC Liaison — MENA Caucus', ar: 'ممثّل لدى PRCC — تجمّع مينا' },
    org: { en: 'Paul Robeson Cultural Center', ar: 'مركز بول روبسون الثقافي' },
    note: { en: 'Represented the caucus and coordinated events for inclusion.', ar: 'مثّلت التجمّع ونسّقت فعاليات تعزز الشمول.' },
  },
  {
    cat: 'extracurricular',
    date: { en: 'Dec 2024 – May 2025', ar: 'ديسمبر ٢٠٢٤ – مايو ٢٠٢٥' },
    title: { en: 'Vice President — MENA Caucus', ar: 'نائب الرئيس — تجمّع مينا' },
    org: { en: 'Middle East & North African Caucus', ar: 'تجمّع الشرق الأوسط وشمال أفريقيا' },
    note: { en: "Built partnerships with cultural organizations to grow the caucus's impact.", ar: 'بنيت شراكات مع منظمات ثقافية لتوسيع أثر التجمّع.' },
  },
  {
    cat: 'research',
    date: { en: 'Jun 2025 – Aug 2025', ar: 'يونيو ٢٠٢٥ – أغسطس ٢٠٢٥' },
    title: { en: 'Robotics Institute Summer Scholar — Zoom Lab', ar: 'باحث صيفي في معهد الروبوتات — مختبر Zoom' },
    org: { en: 'Carnegie Mellon University', ar: 'جامعة كارنيغي ميلون' },
    note: { en: 'Simulated the DeltaZ soft manipulator in MuJoCo and validated it against physical TPU prototypes.', ar: 'حاكيت المناور المرن DeltaZ في MuJoCo وقارنته بنماذج TPU الفيزيائية.' },
    logo: '/images/cmu_logo.png',
    slug: 'cmu-riss',
    more: {
      body: {
        en: 'As an RISS scholar in the Zoom Lab, I modeled the DeltaZ soft manipulator in MuJoCo with flex/flexcomp — capturing bending, twisting, and contact dynamics consistent with real TPU prototypes. I benchmarked the simulated behavior against the physical prototypes, demonstrating the soft model’s bending/twisting compliance while surfacing the limits of closed-chain kinematic simulation with deformable links.',
        ar: 'كباحث في برنامج RISS بمختبر Zoom، نمذجت المناور المرن DeltaZ في MuJoCo، والتقطت الانحناء والالتواء وديناميكا التلامس بما يوافق نماذج TPU الحقيقية، ثم قارنت السلوك المحاكى بالنماذج الفيزيائية وأبرزت حدود محاكاة الحركة المغلقة للوصلات المرنة.',
      },
      poster: {
        src: '/images/riss-poster.png',
        alt: { en: 'RISS 2025 poster — Simulating Soft DeltaZ in MuJoCo', ar: 'ملصق RISS 2025 — محاكاة DeltaZ المرن في MuJoCo' },
        caption: { en: 'My RISS 2025 poster — “Simulating Soft DeltaZ in MuJoCo.”', ar: 'ملصقي في RISS 2025 — «محاكاة DeltaZ المرن في MuJoCo».' },
      },
      links: [
        { label: { en: 'About the RISS program', ar: 'عن برنامج RISS' }, href: 'https://riss.ri.cmu.edu/' },
      ],
      // The actual MuJoCo models, rebuilt + run in the browser via Three.js.
      // "control" = drive the 3 arms live (pose grid baked with scripts/bake_grid.py,
      // trilinearly interpolated). "playback" = replay a recorded soft-body motion.
      sim: [
        { kind: 'control', label: { en: 'Drive the 3 arms', ar: 'حرّك الأذرع الثلاثة' }, src: 'data/cmu-rigid-grid.json' },
        { kind: 'control', label: { en: 'Deformable hand', ar: 'اليد المرنة' }, src: 'data/cmu-soft-grid.json' },
      ],
    },
  },
  {
    cat: 'academic',
    date: { en: 'Aug 2025 – May 2027 (expected)', ar: 'أغسطس ٢٠٢٥ – مايو ٢٠٢٧ (متوقع)' },
    title: { en: 'B.A. Computer Science & Economics', ar: 'بكالوريوس علوم الحاسب والاقتصاد' },
    org: { en: 'New York University', ar: 'جامعة نيويورك' },
    note: { en: 'Transferred to NYU — econometrics, macro & micro, and data structures.', ar: 'انتقلت إلى NYU — الاقتصاد القياسي، والتحليل الكلي والجزئي، وهياكل البيانات.' },
    logo: '/images/nyu_logo.png',
  },
];

export function findBySlug(slug) {
  return ITEMS.find((it) => it.slug === slug) || null;
}
