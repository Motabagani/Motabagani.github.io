// All site text in both languages, organized by section.
// To add or refine a translation, just edit the string here — the UI updates automatically.

export const translations = {
  en: {
    // Topbar / Navigation
    name: 'HASHIM MOTABAGANI',
    nav: {
      work: 'Work',
      writing: 'Writing',
      about: 'About',
      contact: 'Contact',
    },

    // Hero — keep these as plain strings here; if you want <em> emphasis,
    // we can switch to JSX variants later. Starting simple.
    hero: {
      eyebrow: 'Portfolio · Est. 2026',
      heroes: [
        {
          h1: 'Is this another boring portfolio? NO.',
          lede: 'Have you ever met someone who does programming, economic models, and sometimes, political pieces?',
        },
        {
          h1: 'Software, economics, and the occasional political essay.',
          lede: 'An NYU student building things across disciplines — Java systems, economic models, and writing that takes Aristotle seriously enough to bring him to Qatar.',
        },
        {
          h1: "I'm Hashim. I write code, models, and essays.",
          lede: 'A generalist working across software, economics, and political theory. This is where the three meet.',
        },
      ],
    },

    // Sections
    sections: {
      work: 'Selected Work',
      writing: 'Writing',
      about: 'About',
    },

    // About
    about: {
      bio1: "I'm an NYU student working at the intersection of software, economics, and political theory.",
      bio2: 'I care about craft, clarity, and making work that matters across disciplines.',
      meta: {
        based: 'Based',
        basedValue: 'Riyadh ↔ New York',
        currently: 'Currently',
        currentlyValue: 'NYU',
        tools: 'Tools',
        toolsValue: 'Code, prose, models',
        elsewhere: 'Elsewhere',
      },
    },

    // Footer
    footer: {
      talk: "Let's",
      talkLink: 'talk',
      colophon: ['© 2026 Hashim Motabagani', 'Set in SF Grandezza', 'Built with React'],
    },

    // Language switcher
    switcher: {
      toArabic: 'عربي',
      toEnglish: 'EN',
    },
  },

  ar: {
    name: 'هــــاشـم مــطـبـقــاني',
    nav: {
      work: 'الأعمال',
      writing: 'الكتابة',
      about: 'عني',
      contact: 'تواصل',
    },

    hero: {
      eyebrow: 'بورتفوليو · ٢٠٢٦',
      heroes: [
        {
          h1: 'هل هذا بورتفوليو مملٌّ آخر؟ لا.',
          lede: 'هل قابلت يوماً شخصاً يكتب الكود، ويبني النماذج الاقتصادية، وأحياناً المقالات السياسية؟',
        },
        {
          h1: 'برمجة، اقتصاد، ومقال سياسي بين الحين والآخر.',
          lede: 'طالب في جامعة نيويورك يبني أشياء عبر تخصصات متعددة — أنظمة جافا، ونماذج اقتصادية، .',
        },
        {
          h1: 'أنا هاشم. أكتب الكود والنماذج والمقالات.',
          lede: 'متعدد التخصصات، أعمل في تقاطع البرمجة والاقتصاد والنظرية السياسية. هنا تلتقي الثلاثة.',
        },
      ],
    },

    sections: {
      work: 'مختارات من الأعمال',
      writing: 'الكتابة',
      about: 'عني',
    },

    about: {
      bio1: 'طالب في جامعة نيويورك أعمل في تقاطع البرمجة والاقتصاد والنظرية السياسية.',
      bio2: 'أهتم بالحرفة، والوضوح، وصناعة عمل ذي معنى عبر التخصصات.',
      meta: {
        based: 'الموقع',
        basedValue: 'الرياض ↔ نيويورك',
        currently: 'حالياً',
        currentlyValue: 'جامعة نيويورك',
        tools: 'الأدوات',
        toolsValue: 'الكود، الكتابة، النماذج',
        elsewhere: 'في أماكن أخرى',
      },
    },

    footer: {
      talk: 'هيا',
      talkLink: 'نتحدث',
      colophon: ['© ٢٠٢٦ هاشم مطبقاني', 'بخط SF Grandezza', 'مبني بـ React'],
    },

    switcher: {
      toArabic: 'عربي',
      toEnglish: 'EN',
    },
  },
};
