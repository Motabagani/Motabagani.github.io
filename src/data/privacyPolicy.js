/* Full Privacy Policy content (EN + AR), rendered by LegalPage when
   which === 'privacy'. Block types: p = paragraph, sub = sub-heading,
   ul = bullet list. Inline links use markdown [label](url) and are parsed
   by LegalPage's linkify helper. */

export const privacyPolicy = {
  en: {
    effective: 'Effective date: September 8, 2026',
    intro:
      'This Privacy Policy explains how Hashim Motabagani (“I,” “me,” or the “Site Operator”) handles information in connection with the personal portfolio available at https://motabagani.com, including its English and Arabic pages, contact and feedback features, interactive demonstrations, games, and the Rafeeq scholarship-journey simulator (collectively, the “Site”).',
    sections: [
      { h: '1. Scope', blocks: [
        { t: 'p', c: 'This Policy applies only to this Site and its features. It does not govern external websites, services, or platforms linked from the Site, including GitHub, LinkedIn, New York University, or other third parties.' },
        { t: 'p', c: 'The Site is a personal portfolio and educational demonstration. It is not an official service of New York University, the Saudi Ministry of Education, a Saudi cultural mission, Nafath, an embassy, an airline, or any other government or commercial organization.' },
      ] },
      { h: '2. Information You Choose to Provide', blocks: [
        { t: 'sub', c: 'Contact messages' },
        { t: 'p', c: 'If you use the Contact page, you may provide:' },
        { t: 'ul', c: ['Your name;', 'Your email address; and', 'The contents of your message.'] },
        { t: 'p', c: 'When you submit the form, this information is sent to and stored in a database operated by the Site Operator (see Section 5) so the message can be read, responded to, and managed. It is not used for any other purpose.' },
        { t: 'sub', c: 'Portfolio feedback' },
        { t: 'p', c: 'If you submit feedback through the Ha’a feedback interface, the Site stores the feedback text you provide in the same database. You should not include passwords, identity numbers, financial details, health information, confidential material, or other sensitive personal information.' },
        { t: 'p', c: 'Feedback may be used to identify problems, improve the Site, and evaluate its design and content.' },
        { t: 'sub', c: 'Rafeeq demo entries' },
        { t: 'p', c: 'Rafeeq may ask you to enter or select simulated information such as:' },
        { t: 'ul', c: ['A demonstration identity number and password;', 'Scholarship and academic information;', 'Course and term information;', 'Travel dates;', 'Dependent information;', 'Uploaded demonstration documents; and', 'Simulated requests, approvals, references, and generated files.'] },
        { t: 'p', c: 'Rafeeq is a demonstration. Do not enter real identity numbers, passwords, passport information, financial information, immigration documents, educational records, or other sensitive personal data. Use only fictional or non-sensitive demonstration information.' },
      ] },
      { h: '3. Information Stored in Your Browser', blocks: [
        { t: 'p', c: 'The current version of Rafeeq stores its demo state locally in your browser using IndexedDB. This may include:' },
        { t: 'ul', c: ['Form entries and selections;', 'Phase and workflow progress;', 'Course, dependent, and travel information;', 'Simulated request and document records;', 'Generated tracking references;', 'Information about files selected for the demo;', 'Content fingerprints; and', 'Update timestamps.'] },
        { t: 'p', c: 'These records remain associated with the Site’s browser-storage area on your device until you use the demo’s reset function, clear the Site’s browser data, use a private-browsing environment that deletes it, or your browser removes it.' },
        { t: 'p', c: 'If IndexedDB is unavailable, Rafeeq may temporarily use in-memory storage. Information stored only in memory is ordinarily lost when the page or browser session ends.' },
        { t: 'p', c: 'The current Rafeeq storage layer does not intentionally transmit this demo state or selected demo files to a server. The Site Operator cannot normally view information that remains solely in your browser’s local storage.' },
        { t: 'p', c: 'Rafeeq may create a SHA-256 content fingerprint for locally stored records. This fingerprint supports change detection; it does not encrypt the underlying information and should not be treated as a security or confidentiality guarantee.' },
      ] },
      { h: '4. Preferences and Interface State', blocks: [
        { t: 'p', c: 'The Site may remember limited interface information on your device, such as:' },
        { t: 'ul', c: ['Language choice;', 'Light or dark appearance;', 'Demo progress;', 'Best scores or game state;', 'Whether an informational or feedback prompt was dismissed; and', 'Similar presentation preferences.'] },
        { t: 'p', c: 'Depending on the feature and browser, this information may use IndexedDB, local storage, session storage, or in-memory state. The Site does not set advertising or cross-site tracking cookies. A session cookie is used only for the private administrative area and is never set for ordinary visitors.' },
      ] },
      { h: '5. Hosting, Backend Storage, and Automatically Processed Information', blocks: [
        { t: 'p', c: 'The Site is hosted on [Cloudflare](https://www.cloudflare.com/privacypolicy/), which serves the pages from its global network and runs the Site’s backend (a Cloudflare Worker) and its database (Cloudflare D1). Contact messages and feedback you submit are stored in that database.' },
        { t: 'sub', c: 'What is stored with a submission' },
        { t: 'p', c: 'When you submit a contact message or feedback, the following is saved in the database:' },
        { t: 'ul', c: ['The name, email, and message text you provided (email is optional for feedback);', 'The page you submitted from and its language;', 'Your browser’s user-agent string;', 'The date and time of the submission; and', 'A salted, one-way SHA-256 hash of your IP address — not your IP address itself.'] },
        { t: 'p', c: 'The IP hash lets the Site limit how many submissions come from one source per hour (to prevent spam and abuse) without retaining your actual IP address. A short-lived record of failed administrative sign-in attempts (also keyed to a hashed IP) is kept only to slow brute-force attempts and is cleared automatically.' },
        { t: 'sub', c: 'Information processed by Cloudflare' },
        { t: 'p', c: 'To deliver and protect the Site, Cloudflare automatically processes technical information such as your IP address, browser and device type, requested pages, date and time of access, and security or diagnostic signals. This processing is governed by Cloudflare’s own policies; the Site Operator does not control Cloudflare’s independent logging or retention.' },
      ] },
      { h: '6. How Information Is Used', blocks: [
        { t: 'p', c: 'Information covered by this Policy may be used to:' },
        { t: 'ul', c: ['Operate and display the Site;', 'Preserve browser-local demo progress;', 'Generate simulated records and documents;', 'Receive, store, read, and respond to contact messages;', 'Review portfolio feedback;', 'Diagnose errors;', 'Protect the Site against spam and abuse (including rate-limiting and sign-in protection);', 'Improve accessibility, usability, design, and content; and', 'Comply with applicable legal obligations.'] },
        { t: 'p', c: 'The Site Operator does not use information submitted through the Site to make decisions about scholarships, education, immigration, travel, employment, credit, insurance, or eligibility for any benefit.' },
      ] },
      { h: '7. Cookies and Similar Technologies', blocks: [
        { t: 'p', c: 'The Site Operator does not use advertising cookies or cross-site behavioral tracking.' },
        { t: 'p', c: 'Ordinary visitors are not given tracking cookies. The only cookie the Site sets is a signed session cookie for the private administrative area, which is created solely when the Site Operator signs in there.' },
        { t: 'p', c: 'Rafeeq and interface preferences primarily use IndexedDB and related browser-local storage, which are technically different from cookies. Blocking or clearing browser storage may reset demo progress and saved preferences.' },
        { t: 'p', c: 'Cloudflare, as the hosting and security provider, may set cookies or process technical information independently to operate and protect the Site. Those practices are governed by Cloudflare’s applicable policies.' },
      ] },
      { h: '8. Sharing and Sale of Information', blocks: [
        { t: 'p', c: 'The Site Operator does not sell personal information.' },
        { t: 'p', c: 'Information may be disclosed only:' },
        { t: 'ul', c: ['To Cloudflare, which hosts the Site, its backend, and its database and provides security and delivery;', 'When required by law, legal process, or a valid governmental request;', 'To protect the rights, safety, integrity, or security of the Site or others; or', 'With your direction or consent.'] },
        { t: 'p', c: 'Browser-local Rafeeq data is not intentionally shared with third parties by the current demo.' },
      ] },
      { h: '9. Retention', blocks: [
        { t: 'p', c: 'Contact messages and feedback stored in the database will ordinarily be deleted within 12 months after the last relevant interaction, unless they are needed longer to resolve a request, maintain security records, establish or defend legal claims, or comply with law.' },
        { t: 'p', c: 'Hashed-IP rate-limit and failed-sign-in records are transient and are used only within short time windows.' },
        { t: 'p', c: 'Browser-local Rafeeq information remains on your device until you reset the demo, clear the Site’s browser data, or the browser removes it.' },
        { t: 'p', c: 'Cloudflare may apply its own retention periods to server logs and technical information.' },
      ] },
      { h: '10. Security', blocks: [
        { t: 'p', c: 'The Site is served over HTTPS (TLS). Reasonable measures are used to limit unnecessary collection and protect information handled by the Site Operator, including storing only a salted one-way hash of visitor IP addresses, a honeypot and hourly rate-limit on submissions, and a private administrative area protected by authentication, a signed session cookie, brute-force lockout, and strict security headers.' },
        { t: 'p', c: 'No website, email transmission, database, browser-storage system, or electronic communication is completely secure. Do not use Rafeeq or any Site form to store or transmit sensitive, confidential, or legally protected information.' },
      ] },
      { h: '11. External Links', blocks: [
        { t: 'p', c: 'The Site may link to third-party websites. Following an external link leaves this Site. The destination’s privacy and security practices apply, and the Site Operator is not responsible for those practices.' },
      ] },
      { h: '12. Children’s Privacy', blocks: [
        { t: 'p', c: 'The Site is not directed to children under 13 and is not intended to knowingly collect personal information from them. If you believe a child has submitted personal information through the Site, contact the Site Operator so it can be reviewed and deleted where appropriate.' },
      ] },
      { h: '13. International Visitors', blocks: [
        { t: 'p', c: 'The Site is delivered through Cloudflare’s global network and may be accessed internationally. Information you submit may be processed and stored on infrastructure located in the United States or other countries, where privacy laws may differ from those in your country.' },
      ] },
      { h: '14. Your Choices and Requests', blocks: [
        { t: 'p', c: 'You may:' },
        { t: 'ul', c: ['Avoid submitting contact or feedback information;', 'Use fictional information in demonstrations;', 'Reset Rafeeq using its Reset Demo control;', 'Clear the Site’s data through your browser settings;', 'Block cookies or browser storage, subject to possible loss of functionality; and', 'Request access to, correction of, or deletion of contact or feedback information retained by the Site Operator.'] },
        { t: 'p', c: 'To make a privacy request, email [info@motabagani.com](mailto:info@motabagani.com) or use the [Contact page](/en/contact) on this Site. The Site Operator may need enough information to identify the relevant communication, but will not ask for unnecessary sensitive information.' },
        { t: 'p', c: 'Information stored solely in your browser must generally be managed or deleted through that browser because the Site Operator does not possess it.' },
      ] },
      { h: '15. Changes to This Policy', blocks: [
        { t: 'p', c: 'This Policy may be updated when the Site, its storage practices, hosting arrangements, or legal obligations change. The updated version will be posted on this page with a revised effective date.' },
        { t: 'p', c: 'Material changes affecting previously collected information will not be applied retroactively in a way that contradicts earlier privacy promises unless permitted by law and appropriate notice is provided.' },
      ] },
      { h: '16. Contact', blocks: [
        { t: 'p', c: 'For privacy questions or requests:' },
        { t: 'p', c: 'Hashim Motabagani' },
        { t: 'p', c: 'Email: [info@motabagani.com](mailto:info@motabagani.com)' },
        { t: 'p', c: 'Contact form: [Contact page](/en/contact)' },
        { t: 'p', c: 'Website: https://motabagani.com' },
      ] },
    ],
  },
  ar: {
    effective: 'تاريخ السريان: ٨ سبتمبر ٢٠٢٦',
    intro:
      'توضح سياسة الخصوصية هذه كيفية تعامل هاشم مطبقاني («أنا» أو «مشغّل الموقع») مع المعلومات المرتبطة بمعرض الأعمال الشخصي المتاح على https://motabagani.com، بما في ذلك الصفحات العربية والإنجليزية، ووسائل التواصل وإرسال الملاحظات، والتجارب التفاعلية، والألعاب، ومحاكي رحلة الابتعاث «رفيق» (ويُشار إليها مجتمعةً بـ«الموقع»).',
    sections: [
      { h: '١. نطاق السياسة', blocks: [
        { t: 'p', c: 'تنطبق هذه السياسة على هذا الموقع وميزاته فقط. ولا تنطبق على المواقع أو الخدمات أو المنصات الخارجية المرتبطة به، بما فيها GitHub وLinkedIn وجامعة نيويورك وأي جهات خارجية أخرى.' },
        { t: 'p', c: 'الموقع معرض أعمال شخصي وتجربة تعليمية. وليس خدمة رسمية تابعة لجامعة نيويورك أو وزارة التعليم السعودية أو أي ملحقية ثقافية سعودية أو نفاذ أو سفارة أو شركة طيران أو أي جهة حكومية أو تجارية أخرى.' },
      ] },
      { h: '٢. المعلومات التي تختار تقديمها', blocks: [
        { t: 'sub', c: 'رسائل التواصل' },
        { t: 'p', c: 'إذا استخدمت صفحة التواصل، فقد تقدم:' },
        { t: 'ul', c: ['اسمك؛', 'بريدك الإلكتروني؛', 'محتوى رسالتك.'] },
        { t: 'p', c: 'عند إرسال النموذج، تُرسل هذه المعلومات وتُخزَّن في قاعدة بيانات يديرها مشغّل الموقع (انظر القسم ٥) ليتسنى قراءة الرسالة والرد عليها وإدارتها، ولا تُستخدم لأي غرض آخر.' },
        { t: 'sub', c: 'ملاحظات معرض الأعمال' },
        { t: 'p', c: 'إذا أرسلت ملاحظة عبر واجهة «هاء»، يخزّن الموقع نص الملاحظة الذي تقدمه في القاعدة نفسها. يجب ألا تتضمن الملاحظة كلمات مرور أو أرقام هوية أو معلومات مالية أو صحية أو مواد سرية أو غيرها من المعلومات الشخصية الحساسة.' },
        { t: 'p', c: 'قد تُستخدم الملاحظات لاكتشاف المشكلات وتحسين الموقع وتقييم تصميمه ومحتواه.' },
        { t: 'sub', c: 'البيانات المدخلة في عرض «رفيق»' },
        { t: 'p', c: 'قد يطلب «رفيق» إدخال أو اختيار معلومات تجريبية، مثل:' },
        { t: 'ul', c: ['رقم هوية وكلمة مرور تجريبيين؛', 'معلومات الابتعاث والدراسة؛', 'المواد والفصول الدراسية؛', 'تواريخ السفر؛', 'معلومات المرافقين؛', 'مستندات تجريبية مرفوعة؛', 'طلبات وموافقات وأرقام مرجعية وملفات مولّدة لأغراض المحاكاة.'] },
        { t: 'p', c: '«رفيق» تجربة توضيحية. لا تُدخل أرقام هوية أو كلمات مرور أو معلومات جواز أو معلومات مالية أو مستندات هجرة أو سجلات دراسية أو غيرها من البيانات الشخصية الحساسة الحقيقية. استخدم معلومات خيالية أو تجريبية غير حساسة فقط.' },
      ] },
      { h: '٣. المعلومات المخزنة في متصفحك', blocks: [
        { t: 'p', c: 'تخزّن النسخة الحالية من «رفيق» حالة العرض التجريبي محليًا في متصفحك باستخدام IndexedDB. وقد يشمل ذلك:' },
        { t: 'ul', c: ['البيانات والاختيارات المدخلة في النماذج؛', 'تقدم المراحل ومسار الإجراءات؛', 'معلومات المواد والمرافقين والسفر؛', 'سجلات الطلبات والوثائق التجريبية؛', 'أرقام التتبع المولّدة؛', 'معلومات عن الملفات المختارة للعرض؛', 'بصمات المحتوى؛', 'أوقات التحديث.'] },
        { t: 'p', c: 'تبقى هذه السجلات ضمن مساحة تخزين الموقع في جهازك حتى تستخدم وظيفة إعادة ضبط العرض، أو تمسح بيانات الموقع من المتصفح، أو تستخدم وضع تصفح خاصًا يحذفها، أو يزيلها المتصفح.' },
        { t: 'p', c: 'إذا تعذر استخدام IndexedDB، فقد يستخدم «رفيق» تخزينًا مؤقتًا في الذاكرة. وعادةً ما تضيع المعلومات المخزنة في الذاكرة فقط عند إغلاق الصفحة أو انتهاء جلسة المتصفح.' },
        { t: 'p', c: 'لا تنقل طبقة التخزين الحالية في «رفيق» حالة العرض أو الملفات التجريبية المختارة عمدًا إلى خادم. ولا يستطيع مشغّل الموقع عادةً الاطلاع على المعلومات التي تبقى داخل التخزين المحلي لمتصفحك.' },
        { t: 'p', c: 'قد ينشئ «رفيق» بصمة SHA-256 للسجلات المخزنة محليًا. تُستخدم هذه البصمة للمساعدة في اكتشاف التغييرات؛ وهي ليست تشفيرًا للمعلومات ولا تُعد ضمانًا للسرية أو الأمان.' },
      ] },
      { h: '٤. التفضيلات وحالة الواجهة', blocks: [
        { t: 'p', c: 'قد يتذكر الموقع معلومات محدودة على جهازك، مثل:' },
        { t: 'ul', c: ['اللغة المختارة؛', 'المظهر الفاتح أو الداكن؛', 'تقدم العرض التجريبي؛', 'أفضل نتيجة أو حالة لعبة؛', 'إغلاق رسالة تعريفية أو نافذة الملاحظات؛', 'تفضيلات عرض مشابهة.'] },
        { t: 'p', c: 'وقد تُخزّن هذه المعلومات، بحسب الميزة والمتصفح، باستخدام IndexedDB أو التخزين المحلي أو تخزين الجلسة أو الذاكرة المؤقتة. ولا يستخدم الموقع ملفات تعريف ارتباط إعلانية أو للتتبع عبر المواقع. وتُستخدم ملف ارتباط الجلسة فقط في منطقة الإدارة الخاصة، ولا يُنشأ للزوار العاديين إطلاقًا.' },
      ] },
      { h: '٥. الاستضافة وتخزين البيانات في الخادم والمعلومات المعالجة تلقائيًا', blocks: [
        { t: 'p', c: 'يُستضاف الموقع على [Cloudflare](https://www.cloudflare.com/privacypolicy/)، التي تقدّم الصفحات عبر شبكتها العالمية وتشغّل الواجهة الخلفية للموقع (Cloudflare Worker) وقاعدة بياناته (Cloudflare D1). وتُخزَّن رسائل التواصل والملاحظات التي ترسلها في تلك القاعدة.' },
        { t: 'sub', c: 'ما الذي يُخزَّن مع كل إرسال' },
        { t: 'p', c: 'عند إرسال رسالة تواصل أو ملاحظة، يُحفظ ما يلي في قاعدة البيانات:' },
        { t: 'ul', c: ['الاسم والبريد الإلكتروني ونص الرسالة الذي قدمته (البريد اختياري للملاحظات)؛', 'الصفحة التي أرسلت منها ولغتها؛', 'سلسلة معرّف متصفحك (user-agent)؛', 'تاريخ ووقت الإرسال؛', 'بصمة SHA-256 أحادية الاتجاه ومملّحة لعنوان IP الخاص بك — وليس عنوان IP نفسه.'] },
        { t: 'p', c: 'تتيح بصمة الـIP للموقع تحديد عدد الرسائل الواردة من مصدر واحد في الساعة (لمنع البريد المزعج وإساءة الاستخدام) دون الاحتفاظ بعنوان IP الفعلي. كما يُحتفظ بسجل قصير الأمد لمحاولات تسجيل الدخول الإدارية الفاشلة (مرتبط أيضًا ببصمة IP) فقط لإبطاء محاولات التخمين، ويُمسح تلقائيًا.' },
        { t: 'sub', c: 'المعلومات التي تعالجها Cloudflare' },
        { t: 'p', c: 'لتقديم الموقع وحمايته، تعالج Cloudflare تلقائيًا معلومات تقنية مثل عنوان IP ونوع المتصفح والجهاز والصفحات المطلوبة وتاريخ ووقت الزيارة وإشارات الأمان والتشخيص. وتخضع هذه المعالجة لسياسات Cloudflare الخاصة، ولا يتحكم مشغّل الموقع في تسجيلها أو مدد احتفاظها المستقلة.' },
      ] },
      { h: '٦. كيفية استخدام المعلومات', blocks: [
        { t: 'p', c: 'قد تُستخدم المعلومات المشمولة بهذه السياسة من أجل:' },
        { t: 'ul', c: ['تشغيل الموقع وعرضه؛', 'حفظ تقدم العرض التجريبي داخل المتصفح؛', 'إنشاء السجلات والوثائق التجريبية؛', 'استقبال رسائل التواصل وتخزينها وقراءتها والرد عليها؛', 'مراجعة ملاحظات معرض الأعمال؛', 'تشخيص الأخطاء؛', 'حماية الموقع من البريد المزعج وإساءة الاستخدام (بما في ذلك تحديد المعدل وحماية تسجيل الدخول)؛', 'تحسين الوصول وسهولة الاستخدام والتصميم والمحتوى؛', 'الامتثال للالتزامات القانونية المطبقة.'] },
        { t: 'p', c: 'لا يستخدم مشغّل الموقع المعلومات المقدمة لاتخاذ قرارات تتعلق بالابتعاث أو التعليم أو الهجرة أو السفر أو التوظيف أو الائتمان أو التأمين أو أهلية الحصول على أي منفعة.' },
      ] },
      { h: '٧. ملفات تعريف الارتباط والتقنيات المشابهة', blocks: [
        { t: 'p', c: 'لا يستخدم مشغّل الموقع ملفات تعريف ارتباط إعلانية أو أدوات تتبع سلوكي عبر المواقع.' },
        { t: 'p', c: 'لا تُمنح للزوار العاديين ملفات تتبع. وملف الارتباط الوحيد الذي ينشئه الموقع هو ملف ارتباط جلسة موقّع خاص بمنطقة الإدارة، ولا يُنشأ إلا عند تسجيل مشغّل الموقع دخوله هناك.' },
        { t: 'p', c: 'يعتمد «رفيق» وتفضيلات الواجهة أساسًا على IndexedDB وتقنيات تخزين محلية مشابهة، وهي مختلفة تقنيًا عن ملفات تعريف الارتباط. قد يؤدي حظر التخزين أو مسحه إلى إعادة ضبط تقدم العرض والتفضيلات المحفوظة.' },
        { t: 'p', c: 'وباعتبارها مزوّد الاستضافة والأمان، قد تنشئ Cloudflare ملفات تعريف ارتباط أو تعالج معلومات تقنية بصورة مستقلة لتشغيل الموقع وحمايته، وتخضع تلك الممارسات لسياسات Cloudflare المعمول بها.' },
      ] },
      { h: '٨. مشاركة المعلومات وبيعها', blocks: [
        { t: 'p', c: 'لا يبيع مشغّل الموقع المعلومات الشخصية.' },
        { t: 'p', c: 'ولا تُفصح المعلومات إلا:' },
        { t: 'ul', c: ['لشركة Cloudflare التي تستضيف الموقع وواجهته الخلفية وقاعدة بياناته وتوفر الأمان والتوصيل؛', 'إذا تطلب القانون أو إجراء قانوني أو طلب حكومي صحيح ذلك؛', 'لحماية حقوق الموقع أو سلامته أو نزاهته أو أمانه أو حماية الآخرين؛', 'بناءً على توجيهك أو موافقتك.'] },
        { t: 'p', c: 'لا تشارك النسخة الحالية من العرض بيانات «رفيق» المحلية عمدًا مع جهات خارجية.' },
      ] },
      { h: '٩. مدة الاحتفاظ', blocks: [
        { t: 'p', c: 'تُحذف رسائل التواصل والملاحظات المخزنة في قاعدة البيانات عادةً خلال ١٢ شهرًا من آخر تفاعل ذي صلة، ما لم تكن هناك حاجة للاحتفاظ بها مدة أطول لحل طلب أو حفظ سجل أمني أو إنشاء مطالبة قانونية أو الدفاع عنها أو الامتثال للقانون.' },
        { t: 'p', c: 'أما سجلات تحديد المعدل ومحاولات الدخول الفاشلة المعتمدة على بصمة IP فهي مؤقتة وتُستخدم ضمن نوافذ زمنية قصيرة فقط.' },
        { t: 'p', c: 'تبقى معلومات «رفيق» المحلية على جهازك حتى تعيد ضبط العرض أو تمسح بيانات الموقع أو يزيلها المتصفح.' },
        { t: 'p', c: 'قد تطبق Cloudflare مدد احتفاظ خاصة بها على سجلات الخادم والمعلومات التقنية.' },
      ] },
      { h: '١٠. الأمان', blocks: [
        { t: 'p', c: 'يُقدَّم الموقع عبر HTTPS (TLS). وتُتخذ تدابير معقولة للحد من الجمع غير الضروري وحماية المعلومات التي يتعامل معها مشغّل الموقع، منها تخزين بصمة أحادية الاتجاه ومملّحة لعناوين IP الخاصة بالزوار فقط، ومصيدة للبريد المزعج وحد أقصى للإرسال في الساعة، ومنطقة إدارة خاصة محمية بالمصادقة وملف ارتباط جلسة موقّع وإغلاق ضد التخمين ورؤوس أمان صارمة.' },
        { t: 'p', c: 'لا يوجد موقع أو بريد إلكتروني أو قاعدة بيانات أو نظام تخزين في المتصفح أو وسيلة اتصال إلكترونية آمنة بالكامل. لا تستخدم «رفيق» أو نماذج الموقع لتخزين أو إرسال معلومات حساسة أو سرية أو محمية قانونًا.' },
      ] },
      { h: '١١. الروابط الخارجية', blocks: [
        { t: 'p', c: 'قد يحتوي الموقع على روابط لمواقع خارجية. عند فتح رابط خارجي فإنك تغادر هذا الموقع، وتطبق ممارسات الخصوصية والأمان الخاصة بالوجهة. ولا يتحمل مشغّل الموقع مسؤولية تلك الممارسات.' },
      ] },
      { h: '١٢. خصوصية الأطفال', blocks: [
        { t: 'p', c: 'الموقع غير موجه للأطفال دون سن الثالثة عشرة، ولا يقصد جمع معلومات شخصية منهم عن علم. إذا اعتقدت أن طفلًا أرسل معلومات شخصية عبر الموقع، فتواصل مع مشغّل الموقع لمراجعتها وحذفها حيثما كان ذلك مناسبًا.' },
      ] },
      { h: '١٣. الزوار من خارج الولايات المتحدة', blocks: [
        { t: 'p', c: 'يُقدَّم الموقع عبر شبكة Cloudflare العالمية ويمكن الوصول إليه من دول أخرى. وقد تُعالَج المعلومات التي ترسلها وتُخزَّن على بنية تحتية في الولايات المتحدة أو دول أخرى، حيث قد تختلف قوانين الخصوصية عن قوانين بلدك.' },
      ] },
      { h: '١٤. خياراتك وطلباتك', blocks: [
        { t: 'p', c: 'يمكنك:' },
        { t: 'ul', c: ['عدم إرسال رسائل أو ملاحظات؛', 'استخدام معلومات خيالية في التجارب؛', 'إعادة ضبط «رفيق» من خلال زر إعادة ضبط العرض؛', 'مسح بيانات الموقع من إعدادات متصفحك؛', 'حظر ملفات تعريف الارتباط أو تخزين المتصفح، مع احتمال فقدان بعض الوظائف؛', 'طلب الوصول إلى رسائل التواصل أو الملاحظات التي يحتفظ بها مشغّل الموقع أو تصحيحها أو حذفها.'] },
        { t: 'p', c: 'لتقديم طلب متعلق بالخصوصية، أرسل بريدًا إلى [info@motabagani.com](mailto:info@motabagani.com) أو استخدم [صفحة التواصل](/ar/contact) في هذا الموقع. وقد يحتاج مشغّل الموقع إلى معلومات كافية لتحديد الرسالة المعنية، لكنه لن يطلب معلومات حساسة غير ضرورية.' },
        { t: 'p', c: 'أما المعلومات المخزنة داخل متصفحك فقط، فيجب عادةً إدارتها أو حذفها من خلال ذلك المتصفح لأن مشغّل الموقع لا يمتلكها.' },
      ] },
      { h: '١٥. التغييرات على السياسة', blocks: [
        { t: 'p', c: 'قد تُحدّث هذه السياسة عند تغير الموقع أو ممارسات التخزين أو ترتيبات الاستضافة أو الالتزامات القانونية. وستُنشر النسخة المحدثة في هذه الصفحة مع تعديل تاريخ السريان.' },
        { t: 'p', c: 'لن تُطبق التغييرات الجوهرية على المعلومات التي جُمعت سابقًا بصورة رجعية تتعارض مع الوعود السابقة، إلا حيث يسمح القانون وبعد تقديم إشعار مناسب.' },
      ] },
      { h: '١٦. التواصل', blocks: [
        { t: 'p', c: 'للأسئلة والطلبات المتعلقة بالخصوصية:' },
        { t: 'p', c: 'هاشم مطبقاني' },
        { t: 'p', c: 'البريد الإلكتروني: [info@motabagani.com](mailto:info@motabagani.com)' },
        { t: 'p', c: 'نموذج التواصل: [صفحة التواصل](/ar/contact)' },
        { t: 'p', c: 'الموقع: https://motabagani.com' },
      ] },
    ],
  },
};
