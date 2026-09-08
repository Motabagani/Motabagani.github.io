// All site text in both languages, organized by section.
// To add or refine a translation, just edit the string here — the UI updates automatically.


import React from 'react';


export const translations = {
  en: {
    // Topbar / Navigation
    name: 'HASHIM MOTABAGANI',
    nav: {
      coding: 'Coding',
      economics: 'Economic Models',
      design: 'Graphic Design',
      about: 'About Me',
      contact: 'Contact',
    },

    // Hero — keep these as plain strings here; if you want <em> emphasis,
    // we can switch to JSX variants later. Starting simple.
    hero: {
      eyebrow: 'Portfolio · Est. 2026',
      heroes: [
        {
         h1: <>Is this another boring portfolio? <em>NO.</em></>,
        lede: <>Have you ever met someone who does <strong>programming</strong>, <strong>economic models</strong>, and sometimes, <em>graphic design</em>?</>,
        },
        {
          h1: <> A jack of many trades and a master of <em>ALL.</em></>,
          lede: 'An NYU student building things across disciplines — Java systems, economic models, and graphic design',
        },
        {
          h1: "I'm Hashim. I write code, models, and design.",
          lede: 'An NYU student building software, economic models, and visual identities between Riyadh and New York.',
        },
      ],
    },

    sections: {
      coding: 'Coding',
      economics: 'Economic Models',
      design: 'Graphic Design',
      about: 'About Me',
    },

    // About
    about: {
      bio1: "I'm an NYU student working at the intersection of software, economics, and graphic design.",
      bio2: 'I care about craft, clarity, and making work that matters across disciplines.',
      meta: {
        based: 'Based',
        basedValue: 'Riyadh ↔ New York',
        currently: 'Currently',
        currentlyValue: 'NYU',
        tools: 'Tools',
        toolsValue: 'Code, models, design',
        elsewhere: 'Elsewhere',
      },
      resumeCta: 'Explore my interactive résumé',
      resumeBlurb: 'A clickable timeline of where I’ve studied, built, and competed — from Riyadh to New York.',
    },

    // Legal
    legal: {
      heading: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      cookies: 'Cookie Policy',
      placeholder: 'This page is being prepared. Content coming soon.',
    },

    // Contact form
    contact: {
      title: 'Contact',
      deck: 'Questions, ideas, or just want to say hi? Send me a message.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'you@example.com',
      messagePlaceholder: 'What’s on your mind?',
      send: 'Send message',
      sending: 'Sending…',
      success: 'Thanks — your message has been sent. I’ll get back to you.',
      errNet: 'Couldn’t send. Check your connection and try again.',
      errEmail: 'That email address looks invalid.',
      errShort: 'Please write a slightly longer message.',
      errRate: 'Too many messages just now — please try again in a bit.',
      errGen: 'Something went wrong. Please try again.',
      required: 'Please fill in your name, email, and a message.',
      another: 'Send another',
    },

    // Footer
    footer: {

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
      coding: 'برمجة',
      economics: 'نماذج اقتصادية',
      design: 'تصميم جرافيكي',
      about: 'عني',
      contact: 'تواصل',
    },

    hero: {
      eyebrow: 'بورتفوليو · ٢٠٢٦',
      heroes: [
        {
           h1: <>«يا ليل طالب حاسب ثاني؟» <em>لا.</em></>,
          lede: <>أكيد صوت داخلك قال شيء زي كذا، وصدّقني، صوتك الداخلي <strong>غلطان</strong>.</>,
        },
        {
          h1: 'برمجة، واقتصاد، وتصميم جرافيكي.',
          lede: 'طالب في جامعة نيويورك يبني أشياء عبر تخصصات متعددة — أنظمة جافا، ونماذج اقتصادية، وتصميم جرافيكي.',
        },
        {
          h1: 'أنا هاشم. أكتب الكود والنماذج وأصمّم.',
          lede: 'متعدد التخصصات، أعمل في تقاطع البرمجة والاقتصاد والتصميم الجرافيكي. هنا تلتقي الثلاثة.',
        },
      ],
    },

    sections: {
      coding: 'برمجة',
      economics: 'نماذج اقتصادية',
      design: 'تصميم جرافيكي',
      about: 'عني',
    },

    about: {
      bio1: 'طالب في جامعة نيويورك أعمل في تقاطع البرمجة والاقتصاد والتصميم الجرافيكي.',
      bio2: 'أهتم بالحرفة، والوضوح، وصناعة عمل ذي معنى عبر التخصصات.',
      meta: {
        based: 'الموقع',
        basedValue: 'الرياض ↔ نيويورك',
        currently: 'حالياً',
        currentlyValue: 'جامعة نيويورك',
        tools: 'الأدوات',
        toolsValue: 'الكود، النماذج، التصميم',
        elsewhere: 'في أماكن أخرى',
      },
      resumeCta: 'استكشف سيرتي التفاعلية',
      resumeBlurb: 'خط زمني تفاعلي لأماكن دراستي ومشاريعي ومسابقاتي — من الرياض إلى نيويورك.',
    },

    legal: {
      heading: 'قانوني',
      privacy: 'سياسة الخصوصية',
      terms: 'الشروط والأحكام',
      cookies: 'سياسة ملفات تعريف الارتباط',
      placeholder: 'هذه الصفحة قيد الإعداد. المحتوى قريباً.',
    },

    contact: {
      title: 'تواصل',
      deck: 'عندك سؤال أو فكرة أو حاب تسلّم؟ ابعث لي رسالة.',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      message: 'الرسالة',
      namePlaceholder: 'اسمك',
      emailPlaceholder: 'you@example.com',
      messagePlaceholder: 'وش في بالك؟',
      send: 'إرسال الرسالة',
      sending: 'جارٍ الإرسال…',
      success: 'شكراً — وصلتني رسالتك، وبأرد عليك قريباً.',
      errNet: 'تعذّر الإرسال. تحقق من اتصالك وحاول مرة أخرى.',
      errEmail: 'البريد الإلكتروني غير صحيح.',
      errShort: 'رجاءً اكتب رسالة أطول شوي.',
      errRate: 'رسائل كثيرة الحين — حاول بعد شوي.',
      errGen: 'صار خطأ ما. حاول مرة أخرى.',
      required: 'رجاءً اكتب اسمك وبريدك ورسالتك.',
      another: 'إرسال رسالة أخرى',
    },

    footer: {

    },

    switcher: {
      toArabic: 'عربي',
      toEnglish: 'EN',
    },
  },
};
