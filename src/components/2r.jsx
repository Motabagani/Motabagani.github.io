import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

/* ============================================================================
   رفيق / Rafeeq — Arabic-first rebuild (React)
   ----------------------------------------------------------------------------
   Architecture rules (from RAFEEQ-HANDOFF.md):
   1. Every user-facing string lives in STR, keyed. Never a literal in render.
   2. t() warns loudly on missing keys.
   3. Values vs labels: form values are stable EN/ISO codes; labels are t()'d.
   4. dir switches on the root; all CSS uses logical properties.
   5. num() renders Arabic-Indic digits in Arabic — one helper, used everywhere.
   6. Storage sits behind an adapter. In this sandbox it is in-memory; in the
      portfolio, swap `makeStorage` for the localStorage version (see comment).
   ==========================================================================*/

/* ============ 1 · STRING DICTIONARY — Arabic written first ============ */
const STR = {
  /* brand + chrome */
  "brand.name":            { ar: "رفيق", en: "Rafeeq" },
  "brand.tag":             { ar: "رفيقك في رحلة الابتعاث", en: "Your companion through the scholarship journey" },
  "brand.disclaimer":      { ar: "نموذج تصميمي مستقل — غير تابع لوزارة التعليم أو الملحقيات الثقافية، ولا يُخزَّن أي بيانات حقيقية.", en: "Independent design concept — not affiliated with the Ministry of Education or cultural missions. No real data is stored." },
  "chrome.menu":           { ar: "القائمة", en: "Menu" },
  "chrome.home":           { ar: "الرئيسية", en: "Home" },
  "chrome.journey":        { ar: "رحلة الالتحاق", en: "Boarding journey" },
  "chrome.language":       { ar: "اللغة", en: "Language" },
  "chrome.theme":          { ar: "المظهر", en: "Theme" },
  "chrome.theme.dark":     { ar: "داكن", en: "Dark" },
  "chrome.theme.light":    { ar: "فاتح", en: "Light" },
  "chrome.signout":        { ar: "تسجيل الخروج", en: "Sign out" },
  "chrome.reset":          { ar: "إعادة ضبط العرض التجريبي", en: "Reset demo" },
  "chrome.close":          { ar: "إغلاق", en: "Close" },
  "chrome.notifications":  { ar: "الإشعارات", en: "Notifications" },

  /* login */
  "login.title":           { ar: "تسجيل الدخول", en: "Sign in" },
  "login.sub":             { ar: "منحتك مسجّلة في النظام مسبقًا — سجّل دخولك لنبدأ رحلتك.", en: "Your scholarship is already in the system — sign in and let's begin." },
  "login.id":              { ar: "رقم الهوية الوطنية", en: "National ID" },
  "login.id.ph":           { ar: "١٠ أرقام", en: "10 digits" },
  "login.password":        { ar: "كلمة المرور", en: "Password" },
  "login.password.ph":     { ar: "كلمة المرور", en: "Password" },
  "login.btn":             { ar: "دخول", en: "Sign in" },
  "login.nafath":          { ar: "الدخول عبر نفاذ", en: "Sign in with Nafath" },
  "login.or":              { ar: "أو", en: "or" },
  "login.err.id":          { ar: "لا يوجد حساب بهذا الرقم.", en: "No account with that ID." },
  "login.err.pw":          { ar: "كلمة المرور غير صحيحة.", en: "Incorrect password." },
  "login.demo":            { ar: "حساب تجريبي — الهوية 1102345678 وكلمة المرور demo1234، أو استخدم نفاذ.", en: "Demo account — ID 1102345678, password demo1234, or use Nafath." },

  /* home */
  "home.congrats.eyebrow": { ar: "قرار الابتعاث", en: "Scholarship decision" },
  "home.congrats.title":   { ar: "مبروك يا {name} — تم ابتعاثك", en: "Congratulations, {name} — you've been awarded" },
  "home.congrats.body":    { ar: "لم تتقدّم عبر هذه البوابة — برنامجك أصدر قرار ابتعاثك وأُضيف إلى النظام. من هنا، رفيق يمشي معك خطوة بخطوة حتى أول يوم دراسة.", en: "You didn't apply through this portal — your program issued the award and it was added to the system. From here, Rafeeq walks with you step by step until your first day of class." },
  "home.journey.title":    { ar: "رحلة الالتحاق", en: "Your boarding journey" },
  "home.journey.sub":      { ar: "ثلاث مراحل، كل مرحلة تُعتمد قبل أن تفتح التي بعدها.", en: "Three phases — each is approved before the next unlocks." },
  "home.continue":         { ar: "متابعة المرحلة", en: "Continue phase" },
  "home.start":            { ar: "ابدأ المرحلة", en: "Start phase" },
  "home.review":           { ar: "عرض المرحلة", en: "View phase" },
  "home.locked":           { ar: "تُفتح بعد اعتماد المرحلة السابقة", en: "Unlocks after the previous phase is approved" },
  "home.done.title":       { ar: "رحلتك اكتملت — دراسة موفقة!", en: "Journey complete — best of luck in your studies!" },
  "home.done.body":        { ar: "أنهيت مراحل الالتحاق الثلاث. مخصصك الشهري الأول في طريقه إليك.", en: "You've finished all three boarding phases. Your first monthly stipend is on its way." },
  "home.student.program":  { ar: "برنامج خادم الحرمين الشريفين للابتعاث — مسار إمداد", en: "Custodian of the Two Holy Mosques Scholarship Program — Imdad path" },
  "home.student.degree":   { ar: "بكالوريوس · علوم الحاسب والاقتصاد", en: "Bachelor's · Computer Science & Economics" },
  "home.student.uni":      { ar: "جامعة نيويورك", en: "New York University" },
  "home.student.term":     { ar: "خريف ٢٠٢٦", en: "Fall 2026" },

  /* phases */
  "phase.1.name":          { ar: "التهيئة", en: "Getting ready" },
  "phase.1.where":         { ar: "وأنت في السعودية", en: "While you're in Saudi Arabia" },
  "phase.2.name":          { ar: "التأشيرة والسفر", en: "Visa & travel" },
  "phase.2.where":         { ar: "التأشيرة والرحلة", en: "Getting your visa and flying out" },
  "phase.3.name":          { ar: "الوصول والبدء", en: "Arrival & start" },
  "phase.3.where":         { ar: "بعد وصولك لبلد الدراسة", en: "After you land abroad" },
  "phase.status.locked":     { ar: "مقفلة", en: "Locked" },
  "phase.status.inprogress": { ar: "قيد الإكمال", en: "In progress" },
  "phase.status.submitted":  { ar: "قيد الاعتماد", en: "Awaiting approval" },
  "phase.status.approved":   { ar: "معتمدة", en: "Approved" },
  "phase.step":            { ar: "الخطوة {n} من {total}", en: "Step {n} of {total}" },
  "phase.save":            { ar: "حفظ", en: "Save" },
  "phase.saved":           { ar: "تم الحفظ", en: "Saved" },
  "phase.next":            { ar: "التالي", en: "Next" },
  "phase.back":            { ar: "السابق", en: "Back" },
  "phase.submit":          { ar: "إرسال المرحلة للاعتماد", en: "Submit phase for approval" },
  "phase.submitted.title": { ar: "المرحلة قيد المراجعة", en: "Phase under review" },
  "phase.submitted.body":  { ar: "أُرسلت بياناتك للملحقية للمراجعة. ستصلك الموافقة قريبًا.", en: "Your details were sent to the cultural mission for review. Approval arrives soon." },
  "phase.simulate":        { ar: "اعتماد المرحلة (محاكاة المراجِع)", en: "Approve phase (simulate reviewer)" },
  "phase.approved.toast":  { ar: "تم اعتماد المرحلة {n}", en: "Phase {n} approved" },
  "phase.backhome":        { ar: "العودة للرئيسية", en: "Back to home" },

  /* phase 1 steps */
  "p1.s1.title":           { ar: "بيانات الابتعاث", en: "Scholarship information" },
  "p1.s1.sub":             { ar: "هذه بياناتك كما وصلت من برنامجك — تأكد أنها صحيحة قبل المتابعة.", en: "This is your record as it arrived from your program — confirm it's right before continuing." },
  "p1.s1.confirm":         { ar: "البيانات صحيحة", en: "The details are correct" },
  "p1.s1.field.name":      { ar: "الاسم الكامل", en: "Full name" },
  "p1.s1.field.program":   { ar: "البرنامج", en: "Program" },
  "p1.s1.field.uni":       { ar: "الجامعة", en: "University" },
  "p1.s1.field.degree":    { ar: "الدرجة والتخصص", en: "Degree & major" },
  "p1.s1.field.term":      { ar: "فصل البداية", en: "Start term" },
  "p1.s1.field.stipend":   { ar: "المخصص الشهري", en: "Monthly stipend" },
  "p1.s2.title":           { ar: "المؤهلات السابقة", en: "Prior qualifications" },
  "p1.s2.sub":             { ar: "أضف آخر مؤهل حصلت عليه — يُستخدم في ملفك لدى الملحقية.", en: "Add your most recent qualification — it goes in your file at the cultural mission." },
  "p1.s2.qual":            { ar: "المؤهل", en: "Qualification" },
  "p1.s2.qual.hs":         { ar: "الثانوية العامة", en: "High school diploma" },
  "p1.s2.qual.dip":        { ar: "دبلوم", en: "Diploma" },
  "p1.s2.qual.bsc":        { ar: "بكالوريوس", en: "Bachelor's degree" },
  "p1.s2.inst":            { ar: "جهة الإصدار", en: "Issuing institution" },
  "p1.s2.inst.ph":         { ar: "اسم المدرسة أو الجامعة", en: "School or university name" },
  "p1.s2.year":            { ar: "سنة التخرج", en: "Graduation year" },
  "p1.s2.gpa":             { ar: "المعدل", en: "GPA" },
  "p1.s2.gpa.ph":          { ar: "مثال: 98.5", en: "e.g. 98.5" },
  "p1.s3.title":           { ar: "الشروط والأحكام", en: "Terms & conditions" },
  "p1.s3.sub":             { ar: "اقرأ اتفاقية الابتعاث ووافق عليها.", en: "Read the scholarship agreement and accept it." },
  "p1.s3.agree":           { ar: "قرأت اتفاقية الابتعاث وأوافق على شروطها.", en: "I have read the scholarship agreement and accept its terms." },
  "p1.s3.t1h":             { ar: "١ · التمويل", en: "1 · Funding" },
  "p1.s3.t1":              { ar: "يُصرف المخصص الشهري والرسوم الدراسية والبدلات المعتمدة وفق جدول برنامجك ما دمت منتظمًا دراسيًا.", en: "Your stipend, tuition, and approved allowances are paid on your program's schedule while you remain in good standing." },
  "p1.s3.t2h":             { ar: "٢ · التقدّم الدراسي", en: "2 · Academic progress" },
  "p1.s3.t2":              { ar: "تلتزم بالانتظام بدوام كامل ورفع تقرير دراسي كل فصل عبر البوابة.", en: "You commit to full-time enrolment and submit an academic report each term through the portal." },
  "p1.s3.t3h":             { ar: "٣ · الموافقات", en: "3 · Approvals" },
  "p1.s3.t3":              { ar: "قد يتطلب تغيير المقررات أو التخصص أو الجامعة موافقة مسبقة — تخبرك البوابة عند الحاجة.", en: "Changing courses, major, or university may need prior approval — the portal tells you when." },
  "p1.s3.t4h":             { ar: "٤ · استرداد المبالغ", en: "4 · Return of funds" },
  "p1.s3.t4":              { ar: "المبالغ المصروفة خطأً أو خلال فترة عدم استحقاق قد تُسترد.", en: "Funds disbursed in error or during ineligibility may be recovered." },
  "p1.s4.title":           { ar: "المرافقون", en: "Dependents" },
  "p1.s4.sub":             { ar: "أضف من سيسافر معك — تُدخل بياناتهم مرة واحدة فقط، وسنستخدمها في التأشيرات وحجز الطيران تلقائيًا.", en: "Add whoever travels with you — entered once, then reused automatically for visas and the flight booking." },
  "p1.s4.none":            { ar: "لا يوجد مرافقون بعد. إن كنت تسافر وحدك، تابع مباشرة.", en: "No dependents yet. Travelling alone? Just continue." },
  "p1.s4.add":             { ar: "إضافة مرافق", en: "Add a dependent" },
  "p1.s4.name":            { ar: "الاسم الكامل", en: "Full name" },
  "p1.s4.name.ph":         { ar: "كما في الجواز", en: "As in the passport" },
  "p1.s4.relation":        { ar: "صلة القرابة", en: "Relation" },
  "p1.s4.rel.spouse":      { ar: "زوج/زوجة", en: "Spouse" },
  "p1.s4.rel.child":       { ar: "ابن/ابنة", en: "Child" },
  "p1.s4.dob":             { ar: "تاريخ الميلاد", en: "Date of birth" },
  "p1.s4.remove":          { ar: "إزالة", en: "Remove" },

  /* financial guarantee */
  "fg.ready.title":        { ar: "الضمان المالي جاهز", en: "Your financial guarantee is ready" },
  "fg.ready.body":         { ar: "صدر خطاب الضمان المالي بعد اعتماد مرحلة التهيئة — ستحتاجه لموعد التأشيرة.", en: "Issued after Phase 1 approval — you'll need it for your visa appointment." },
  "fg.view":               { ar: "عرض الخطاب", en: "View letter" },
  "fg.note":               { ar: "يصدر الخطاب بالإنجليزية لأنه يُقدَّم للسفارات والجامعات الأجنبية.", en: "The letter is issued in English because it's presented to foreign embassies and universities." },

  /* phase 2 steps */
  "p2.s1.title":           { ar: "التأشيرات", en: "Visas" },
  "p2.s1.sub":             { ar: "تأشيرة لك ولكل مرافق. من يحمل جواز بلد الدراسة لا يحتاج تأشيرة.", en: "A visa for you and each dependent. Anyone holding the destination's passport doesn't need one." },
  "p2.s1.you":             { ar: "أنت", en: "You" },
  "p2.s1.needs":           { ar: "يحتاج تأشيرة", en: "Needs a visa" },
  "p2.s1.noneed":          { ar: "لا يحتاج — يحمل جواز بلد الدراسة", en: "No visa needed — holds the destination's passport" },
  "p2.s1.visatype":        { ar: "نوع التأشيرة", en: "Visa type" },
  "p2.s1.visa.f1":         { ar: "طالب F-1", en: "F-1 student" },
  "p2.s1.visa.f2":         { ar: "مرافق F-2", en: "F-2 dependent" },
  "p2.s1.visa.j1":         { ar: "تبادل J-1", en: "J-1 exchange" },
  "p2.s1.passport":        { ar: "رقم الجواز", en: "Passport number" },
  "p2.s1.passport2":       { ar: "رقم جواز بلد الدراسة", en: "Destination passport number" },
  "p2.s1.passport.ph":     { ar: "مثال: A1234567", en: "e.g. A1234567" },
  "p2.s2.title":           { ar: "رحلة السعودية", en: "Saudia flight" },
  "p2.s2.sub":             { ar: "اطلب حجزك على الخطوط السعودية — مرافقوك يُضافون تلقائيًا.", en: "Request your Saudia booking — your dependents are added automatically." },
  "p2.s2.from":            { ar: "مطار المغادرة", en: "Departure airport" },
  "p2.s2.to":              { ar: "مطار الوصول", en: "Arrival airport" },
  "p2.s2.date":            { ar: "تاريخ السفر", en: "Travel date" },
  "p2.s2.travellers":      { ar: "المسافرون", en: "Travellers" },
  "p2.s2.request":         { ar: "طلب الحجز", en: "Request booking" },
  "p2.s2.route.ok":        { ar: "المسار معتمد تلقائيًا — رقم التصريح OTB: {otb}", en: "Route auto-approved — OTB number: {otb}" },
  "p2.s2.itinerary":       { ar: "وصلك خط سير من السعودية", en: "Saudia sent your itinerary" },
  "p2.s2.confirm":         { ar: "تأكيد الحجز", en: "Confirm booking" },
  "p2.s2.confirmed":       { ar: "الحجز مؤكد ومقفل — أي تعديل يتم عبر السعودية مباشرة.", en: "Booking confirmed and locked — changes go through Saudia directly." },
  "p2.s2.flightno":        { ar: "الرحلة", en: "Flight" },

  /* phase 3 steps */
  "p3.s1.title":           { ar: "عنوان السكن", en: "Home address" },
  "p3.s1.sub":             { ar: "عنوانك في بلد الدراسة ورقم تواصل محلي.", en: "Your address in the country of study and a local contact number." },
  "p3.s1.addr":            { ar: "العنوان", en: "Address" },
  "p3.s1.addr.ph":         { ar: "الشارع، المدينة، الرمز البريدي", en: "Street, city, ZIP" },
  "p3.s1.phone":           { ar: "رقم الجوال المحلي", en: "Local phone" },
  "p3.s1.emname":          { ar: "جهة اتصال للطوارئ", en: "Emergency contact" },
  "p3.s1.emphone":         { ar: "هاتف الطوارئ", en: "Emergency phone" },
  "p3.s2.title":           { ar: "الحساب البنكي", en: "Bank account" },
  "p3.s2.sub":             { ar: "الحساب المحلي الذي سيصلك عليه مخصصك الشهري.", en: "The local account where your monthly stipend arrives." },
  "p3.s2.country":         { ar: "دولة الحساب", en: "Account country" },
  "p3.s2.bank":            { ar: "اسم البنك", en: "Bank name" },
  "p3.s2.bank.ph":         { ar: "مثال: Chase", en: "e.g. Chase" },
  "p3.s2.routing":         { ar: "رقم التوجيه (ABA)", en: "Routing number (ABA)" },
  "p3.s2.routing.ph":      { ar: "٩ أرقام", en: "9 digits" },
  "p3.s2.acct":            { ar: "رقم الحساب", en: "Account number" },
  "p3.s2.iban":            { ar: "الآيبان IBAN", en: "IBAN" },
  "p3.s3.title":           { ar: "الفصل والمقررات", en: "Semester & courses" },
  "p3.s3.sub":             { ar: "بيانات الفصل أولًا، ثم المقررات، ثم المستندات.", en: "Semester details first, then courses, then documents." },
  "p3.s3.term":            { ar: "الفصل", en: "Term" },
  "p3.s3.term.fall":       { ar: "خريف", en: "Fall" },
  "p3.s3.term.spring":     { ar: "ربيع", en: "Spring" },
  "p3.s3.term.summer":     { ar: "صيف", en: "Summer" },
  "p3.s3.year":            { ar: "السنة", en: "Year" },
  "p3.s3.start":           { ar: "بداية الفصل", en: "Term start" },
  "p3.s3.end":             { ar: "نهاية الفصل", en: "Term end" },
  "p3.s3.courses":         { ar: "المقررات", en: "Courses" },
  "p3.s3.course.name":     { ar: "اسم المقرر", en: "Course name" },
  "p3.s3.course.code":     { ar: "الرمز", en: "Code" },
  "p3.s3.course.credits":  { ar: "الساعات", en: "Credits" },
  "p3.s3.course.add":      { ar: "إضافة مقرر", en: "Add course" },
  "p3.s3.docs":            { ar: "المستندات", en: "Documents" },
  "p3.s3.doc.reg":         { ar: "إثبات تسجيل المقررات", en: "Class registration proof" },
  "p3.s3.doc.adm":         { ar: "خطاب القبول", en: "Admission letter" },
  "p3.s3.doc.plan":        { ar: "الخطة الدراسية", en: "Academic plan" },
  "p3.s3.doc.attach":      { ar: "إرفاق ملف", en: "Attach file" },
  "p3.s3.doc.attached":    { ar: "مرفق", en: "Attached" },
  "p3.s4.title":           { ar: "الضمان المالي للجامعة", en: "University financial guarantee" },
  "p3.s4.sub":             { ar: "أرسل خطاب الضمان لمكتب القبول في جامعتك ليُسدَّد رسومك مباشرة.", en: "Send the guarantee letter to your university's bursar so tuition is paid directly." },
  "p3.s4.sent":            { ar: "أرسلت الخطاب للجامعة", en: "I sent the letter to the university" },

  /* validation + toasts */
  "err.required":          { ar: "هذا الحقل مطلوب.", en: "This field is required." },
  "err.check":             { ar: "تأكد من الحقول المظللة", en: "Check the highlighted fields" },
  "err.confirmfirst":      { ar: "أكّد البيانات قبل المتابعة", en: "Confirm the details before continuing" },
  "err.agreefirst":        { ar: "وافق على الشروط قبل المتابعة", en: "Accept the terms before continuing" },
  "err.flightfirst":       { ar: "أكّد حجز الطيران قبل الإرسال", en: "Confirm the flight before submitting" },
  "toast.welcome":         { ar: "أهلًا بك في رفيق", en: "Welcome to Rafeeq" },
  "toast.submitted":       { ar: "أُرسلت المرحلة للاعتماد", en: "Phase submitted for approval" },
  "toast.reset":           { ar: "أُعيد ضبط العرض — أنت مبتعث جديد من جديد", en: "Demo reset — you're a new recipient again" },
};

/* t(): dictionary lookup with loud missing-key warning + {token} interpolation */
function makeT(lang) {
  return (key, vars) => {
    const s = STR[key];
    if (!s) { console.warn("MISSING STRING:", key); return key; }
    let out = s[lang] || s.en;
    if (vars) for (const k of Object.keys(vars)) out = out.replaceAll(`{${k}}`, String(vars[k]));
    return out;
  };
}

/* ============ 2 · Numbers — Arabic-Indic digits, one helper ============ */
const AR_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const num = (n, lang) => lang === "ar" ? String(n).replace(/[0-9]/g, d => AR_DIGITS[+d]) : String(n);

/* ============ 3 · Storage adapter ============
   Sandbox-safe: in-memory only here. In the portfolio, replace the body of
   makeStorage() with a try/catch localStorage version (handoff §5). */
function makeStorage() {
  const mem = {};
  return {
    get: (k, fb) => (k in mem ? mem[k] : fb),
    set: (k, v) => { mem[k] = v; },
    clear: () => { for (const k of Object.keys(mem)) delete mem[k]; },
  };
}
const storage = makeStorage();

/* ---------- user accounts: localStorage (instant, per-device) + CIMS CGI (durable) ---------- */
const RAFEEQ_ENDPOINT = "https://cims.nyu.edu/~hm2983/cgi-bin"; // register.cgi / login.cgi
const LS_KEY = "rafeeq:user";
/* Demo accounts are throwaway: they live in sessionStorage, so the whole
   experience is wiped the moment the tab closes. endSession() clears it early. */
const SS = (() => { try { return window.sessionStorage; } catch { return null; } })();
const userStore = {
  loadLocal() { try { const r = SS && SS.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } },
  saveLocal(u) { try { const { pin, ...safe } = u; SS && SS.setItem(LS_KEY, JSON.stringify(safe)); } catch {} },
  clear() { try { SS && SS.removeItem(LS_KEY); } catch {} },
  endSession() { this.clear(); try { SS && SS.removeItem("rafeeq:setup"); } catch {} },
  async register(u) {
    this.saveLocal(u);
    try {
      await fetch(`${RAFEEQ_ENDPOINT}/register.cgi`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(u),
      });
    } catch { /* offline: localStorage still holds it */ }
    const { pin, ...safe } = u; return safe;
  },
  async login(national_id, pin) {
    try {
      const r = await fetch(`${RAFEEQ_ENDPOINT}/login.cgi`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ national_id, pin }),
      });
      const d = await r.json();
      if (d && d.ok && d.user) { this.saveLocal(d.user); return d.user; }
    } catch { /* fall through to local */ }
    const local = this.loadLocal();
    if (local && String(local.national_id) === String(national_id)) return local;
    return null;
  },
};

/* Fields Safeer2 never asks the student to type — inquiried from external gov sources.
   We have no integrations, so these render read-only with a "not connected" badge. */
/* salary — a CONSTANT in SAR, displayed in the currency of the destination country */
const AWARD_SAR = 6512.50;
const money = (n, cur) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + cur;
const awardSAR = (u) => money((u && u.award_sar) || AWARD_SAR, "SAR");
const awardLocal = (u) => {
  const cc = (u && u.currency) || "USD";
  const c = Object.values(CURRENCY).find((x) => x.code === cc) || CURRENCY.US;
  return money(((u && u.award_sar) || AWARD_SAR) * c.rate, c.code);
};
const awardBoth = (u) => awardSAR(u) + " \u00b7 " + awardLocal(u);

/* ---- reference data: bilingual, country-aware ----
   Stipend is a CONSTANT in SAR, displayed in the currency of the destination country.
   Rates are units of local currency per 1 SAR. */
const CURRENCY = {
  US: { code: "USD", rate: 1 / 3.75, ar: "\u062f\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064a\u0643\u064a" },
  UK: { code: "GBP", rate: 0.21,     ar: "\u062c\u0646\u064a\u0647 \u0625\u0633\u062a\u0631\u0644\u064a\u0646\u064a" },
  CA: { code: "CAD", rate: 0.36,     ar: "\u062f\u0648\u0644\u0627\u0631 \u0643\u0646\u062f\u064a" },
  CN: { code: "CNY", rate: 1.90,     ar: "\u064a\u0648\u0627\u0646 \u0635\u064a\u0646\u064a" },
  CH: { code: "CHF", rate: 0.213,    ar: "\u0641\u0631\u0646\u0643 \u0633\u0648\u064a\u0633\u0631\u064a" },
  SG: { code: "SGD", rate: 0.343,    ar: "\u062f\u0648\u0644\u0627\u0631 \u0633\u0646\u063a\u0627\u0641\u0648\u0631\u064a" },
  JP: { code: "JPY", rate: 41.5,     ar: "\u064a\u0646 \u064a\u0627\u0628\u0627\u0646\u064a" },
  FR: { code: "EUR", rate: 0.245,    ar: "\u064a\u0648\u0631\u0648" },
};
const COUNTRY = {
  US: { en: "United States",  ar: "\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629 \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a\u0629" },
  UK: { en: "United Kingdom", ar: "\u0628\u0631\u064a\u0637\u0627\u0646\u064a\u0627" },
  CA: { en: "Canada",         ar: "\u0643\u0646\u062f\u0627" },
  CN: { en: "China",          ar: "\u0627\u0644\u0635\u064a\u0646" },
  CH: { en: "Switzerland",    ar: "\u0633\u0648\u064a\u0633\u0631\u0627" },
  SG: { en: "Singapore",      ar: "\u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629" },
  JP: { en: "Japan",          ar: "\u0627\u0644\u064a\u0627\u0628\u0627\u0646" },
  FR: { en: "France",         ar: "\u0641\u0631\u0646\u0633\u0627" },
};
/* \u0645\u0633\u0627\u0631 \u0627\u0644\u0631\u0648\u0627\u062f \u2014 the approved universities, in rank order. This is the full list; nothing outside it. */
const UNIS = [
  { r: 1,  en: "Harvard University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0647\u0627\u0631\u0641\u0627\u0631\u062f", c: "US" },
  { r: 2,  en: "Stanford University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0633\u062a\u0627\u0646\u0641\u0648\u0631\u062f", c: "US" },
  { r: 3,  en: "Massachusetts Institute of Technology", ar: "\u0645\u0639\u0647\u062f \u0645\u0627\u0633\u0627\u062a\u0634\u0648\u0633\u062a\u0633 \u0644\u0644\u062a\u0642\u0646\u064a\u0629", c: "US" },
  { r: 4,  en: "University of Cambridge", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0645\u0628\u0631\u062f\u062c", c: "UK" },
  { r: 5,  en: "University of California Berkeley", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0628\u064a\u0631\u0643\u0644\u064a", c: "US" },
  { r: 6,  en: "University of Oxford", ar: "\u062c\u0627\u0645\u0639\u0629 \u0623\u0643\u0633\u0641\u0648\u0631\u062f", c: "UK" },
  { r: 7,  en: "Princeton University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0631\u064a\u0646\u0633\u062a\u0648\u0646", c: "US" },
  { r: 8,  en: "Columbia University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0648\u0644\u0648\u0645\u0628\u064a\u0627", c: "US" },
  { r: 9,  en: "California Institute of Technology", ar: "\u0645\u0639\u0647\u062f \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0644\u0644\u062a\u0642\u0646\u064a\u0629", c: "US" },
  { r: 10, en: "University of Chicago", ar: "\u062c\u0627\u0645\u0639\u0629 \u0634\u064a\u0643\u0627\u063a\u0648", c: "US" },
  { r: 11, en: "Yale University", ar: "\u062c\u0627\u0645\u0639\u0629 \u064a\u0627\u0644", c: "US" },
  { r: 12, en: "Cornell University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0648\u0631\u0646\u064a\u0644", c: "US" },
  { r: 13, en: "UCL", ar: "\u064a\u0648\u0646\u064a\u0641\u0631\u0633\u062a\u064a \u0643\u0648\u0644\u064a\u062c \u0644\u0646\u062f\u0646", c: "UK" },
  { r: 14, en: "University of Pennsylvania", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0646\u0633\u0644\u0641\u0627\u0646\u064a\u0627", c: "US" },
  { r: 15, en: "University of California Los Angeles", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0644\u0648\u0633 \u0623\u0646\u062c\u0644\u0648\u0633", c: "US" },
  { r: 16, en: "University of Washington", ar: "\u062c\u0627\u0645\u0639\u0629 \u0648\u0627\u0634\u0646\u0637\u0646", c: "US" },
  { r: 17, en: "Tsinghua University", ar: "\u062c\u0627\u0645\u0639\u0629 \u062a\u0633\u064a\u0646\u063a\u0647\u0648\u0627", c: "CN" },
  { r: 18, en: "Johns Hopkins University", ar: "\u062c\u0627\u0645\u0639\u0629 \u062c\u0648\u0646\u0632 \u0647\u0648\u0628\u0643\u0646\u0632", c: "US" },
  { r: 19, en: "ETH Zurich", ar: "\u0627\u0644\u0645\u0639\u0647\u062f \u0627\u0644\u062a\u0642\u0646\u064a \u0627\u0644\u0627\u062a\u062d\u0627\u062f\u064a \u2014 \u0632\u064a\u0648\u0631\u062e", c: "CH" },
  { r: 20, en: "Peking University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0643\u064a\u0646", c: "CN" },
  { r: 21, en: "University of Toronto", ar: "\u062c\u0627\u0645\u0639\u0629 \u062a\u0648\u0631\u0646\u062a\u0648", c: "CA" },
  { r: 22, en: "Imperial College London", ar: "\u0625\u0645\u0628\u0631\u064a\u0627\u0644 \u0643\u0648\u0644\u064a\u062c \u0644\u0646\u062f\u0646", c: "UK" },
  { r: 23, en: "National University of Singapore", ar: "\u062c\u0627\u0645\u0639\u0629 \u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629 \u0627\u0644\u0648\u0637\u0646\u064a\u0629", c: "SG" },
  { r: 24, en: "Carnegie Mellon University", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0631\u0646\u064a\u062c\u064a \u0645\u064a\u0644\u0648\u0646", c: "US" },
  { r: 25, en: "University of Michigan Ann Arbor", ar: "\u062c\u0627\u0645\u0639\u0629 \u0645\u064a\u062a\u0634\u064a\u062c\u0627\u0646 \u2014 \u0622\u0646 \u0623\u0631\u0628\u0631", c: "US" },
  { r: 26, en: "University of Tokyo", ar: "\u062c\u0627\u0645\u0639\u0629 \u0637\u0648\u0643\u064a\u0648", c: "JP" },
  { r: 27, en: "Universit\u00e9 Paris Saclay", ar: "\u062c\u0627\u0645\u0639\u0629 \u0628\u0627\u0631\u064a\u0633 \u0633\u0627\u0643\u0644\u0627\u064a", c: "FR" },
  { r: 28, en: "University of California San Diego", ar: "\u062c\u0627\u0645\u0639\u0629 \u0643\u0627\u0644\u064a\u0641\u0648\u0631\u0646\u064a\u0627 \u0633\u0627\u0646 \u062f\u064a\u064a\u063a\u0648", c: "US" },
  { r: 29, en: "Zhejiang University", ar: "\u062c\u0627\u0645\u0639\u0629 \u062c\u064a\u062c\u064a\u0627\u0646\u063a", c: "CN" },
  { r: 30, en: "Washington University in St Louis", ar: "\u062c\u0627\u0645\u0639\u0629 \u0648\u0627\u0634\u0646\u0637\u0646 \u0641\u064a \u0633\u0627\u0646\u062a \u0644\u0648\u064a\u0633", c: "US" },
];
const DEGREES = [
  { en: "Bachelor\u2019s",     ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064a\u0648\u0633", lvl: "ug" },
  { en: "Master\u2019s",       ar: "\u0645\u0627\u062c\u0633\u062a\u064a\u0631",             lvl: "ug" },
  { en: "Doctorate (PhD)",  ar: "\u062f\u0643\u062a\u0648\u0631\u0627\u0647",           lvl: "phd" },
];
/* Track rules: \u0625\u0645\u062f\u0627\u062f and \u0627\u0644\u0631\u0648\u0627\u062f cover bachelor\u2019s + master\u2019s;
   \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u062a\u0637\u0648\u064a\u0631 is the doctorate track. \u0627\u0644\u0631\u0648\u0627\u062f is restricted to the ranked list above. */
const PROGRAMS = {
  ug: [
    { key: "imdad", ar: "\u0628\u0631\u0646\u0627\u0645\u062c \u062e\u0627\u062f\u0645 \u0627\u0644\u062d\u0631\u0645\u064a\u0646 \u0627\u0644\u0634\u0631\u064a\u0641\u064a\u0646 \u0644\u0644\u0627\u0628\u062a\u0639\u0627\u062b \u2014 \u0645\u0633\u0627\u0631 \u0625\u0645\u062f\u0627\u062f",
      en: "Custodian of the Two Holy Mosques Scholarship Program \u2014 Imdad path" },
    { key: "ruwad", ar: "\u0628\u0631\u0646\u0627\u0645\u062c \u062e\u0627\u062f\u0645 \u0627\u0644\u062d\u0631\u0645\u064a\u0646 \u0627\u0644\u0634\u0631\u064a\u0641\u064a\u0646 \u0644\u0644\u0627\u0628\u062a\u0639\u0627\u062b \u2014 \u0645\u0633\u0627\u0631 \u0627\u0644\u0631\u0648\u0627\u062f",
      en: "Custodian of the Two Holy Mosques Scholarship Program \u2014 Ruwad path" },
  ],
  phd: [
    { key: "rd", ar: "\u0628\u0631\u0646\u0627\u0645\u062c \u062e\u0627\u062f\u0645 \u0627\u0644\u062d\u0631\u0645\u064a\u0646 \u0627\u0644\u0634\u0631\u064a\u0641\u064a\u0646 \u0644\u0644\u0627\u0628\u062a\u0639\u0627\u062b \u2014 \u0645\u0633\u0627\u0631 \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u062a\u0637\u0648\u064a\u0631",
      en: "Custodian of the Two Holy Mosques Scholarship Program \u2014 Research & Development path" },
  ],
};
const MAJORS = [
  { en: "Computer Science", ar: "\u0639\u0644\u0648\u0645 \u0627\u0644\u062d\u0627\u0633\u0628" },
  { en: "Computer Science & Economics", ar: "\u0639\u0644\u0648\u0645 \u0627\u0644\u062d\u0627\u0633\u0628 \u0648\u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f" },
  { en: "Software Engineering", ar: "\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0628\u0631\u0645\u062c\u064a\u0627\u062a" },
  { en: "Electrical Engineering", ar: "\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629" },
  { en: "Mechanical Engineering", ar: "\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a\u0629" },
  { en: "Civil Engineering", ar: "\u0627\u0644\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0645\u062f\u0646\u064a\u0629" },
  { en: "Data Science", ar: "\u0639\u0644\u0645 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a" },
  { en: "Artificial Intelligence", ar: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" },
  { en: "Cybersecurity", ar: "\u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064a\u0628\u0631\u0627\u0646\u064a" },
  { en: "Business Administration", ar: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644" },
  { en: "Finance", ar: "\u0627\u0644\u062a\u0645\u0648\u064a\u0644" },
  { en: "Accounting", ar: "\u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629" },
  { en: "Economics", ar: "\u0627\u0644\u0627\u0642\u062a\u0635\u0627\u062f" },
  { en: "Law", ar: "\u0627\u0644\u0642\u0627\u0646\u0648\u0646" },
  { en: "Medicine", ar: "\u0627\u0644\u0637\u0628" },
  { en: "Pharmacy", ar: "\u0627\u0644\u0635\u064a\u062f\u0644\u0629" },
  { en: "Public Health", ar: "\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0639\u0627\u0645\u0629" },
  { en: "Chemistry", ar: "\u0627\u0644\u0643\u064a\u0645\u064a\u0627\u0621" },
  { en: "Physics", ar: "\u0627\u0644\u0641\u064a\u0632\u064a\u0627\u0621" },
  { en: "Mathematics", ar: "\u0627\u0644\u0631\u064a\u0627\u0636\u064a\u0627\u062a" },
  { en: "Architecture", ar: "\u0627\u0644\u0639\u0645\u0627\u0631\u0629" },
  { en: "Graphic Design", ar: "\u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u062c\u0631\u0627\u0641\u064a\u0643\u064a" },
  { en: "Media & Journalism", ar: "\u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0648\u0627\u0644\u0635\u062d\u0627\u0641\u0629" },
  { en: "Political Science", ar: "\u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0633\u064a\u0627\u0633\u064a\u0629" },
  { en: "International Relations", ar: "\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u062f\u0648\u0644\u064a\u0629" },
  { en: "Psychology", ar: "\u0639\u0644\u0645 \u0627\u0644\u0646\u0641\u0633" },
  { en: "Education", ar: "\u0627\u0644\u062a\u0631\u0628\u064a\u0629" },
];
const TERMS = [
  { en: "Fall 2026",   ar: "\u062e\u0631\u064a\u0641 \u0662\u0660\u0662\u0666" },
  { en: "Spring 2027", ar: "\u0631\u0628\u064a\u0639 \u0662\u0660\u0662\u0667" },
  { en: "Summer 2027", ar: "\u0635\u064a\u0641 \u0662\u0660\u0662\u0667" },
  { en: "Fall 2027",   ar: "\u062e\u0631\u064a\u0641 \u0662\u0660\u0662\u0667" },
];

/* Combobox — type to filter, click to pick, free text still allowed.
   Mirrors the airport picker UX. */
function Picker({ kind, value, onChange, placeholder, dir }) {
  const [open, setOpen] = useState(false);
  const list = kind === "major" ? MAJORS : [];
  const q = (value || "").trim().toLowerCase();
  const res = (q ? list.filter((x) => x.en.toLowerCase().includes(q) || x.ar.includes(q)) : list).slice(0, 10);
  return (
    <div className="rq-pick">
      <input value={value || ""} placeholder={placeholder} dir={dir}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} />
      {open && (
        <div className="rq-pick-list">
          {res.length ? res.map((x) => (
            <div key={x.en} className="rq-pick-opt" onMouseDown={() => { onChange(x.en); setOpen(false); }}>
              {x.en}<span className="ar-alt"> \u2014 {x.ar}</span>
            </div>
          )) : <div className="rq-pick-opt none">{dir === "rtl" ? "\u0644\u0627 \u064a\u0648\u062c\u062f \u062e\u064a\u0627\u0631 \u0645\u0637\u0627\u0628\u0642 \u2014 \u0627\u0643\u062a\u0628\u0647 \u0643\u0645\u0627 \u062a\u0631\u064a\u062f" : "No match \u2014 type your own"}</div>}
        </div>
      )}
    </div>
  );
}

const EXTERNAL_STUB = {
  nafathVerified: false,   // إدارة الهوية الموحدة (Nafath) — identity verification
  qiyas: null,             // قياس — Qudurat / aptitude scores
  highSchool: null,        // وزارة التعليم / مركز المعلومات الوطني — high-school data
};

/* ============ 4 · Stable values (never translated) ============ */
const DEMO_USER = {
  national_id: "1102345678",
  password: "demo1234",
  name: { ar: "هاشم مطبقاني", en: "Hashim Motabagani" },
  first: { ar: "هاشم", en: "Hashim" },
  award_sar: AWARD_SAR,
  currency: "USD",
  program: { ar: "برنامج خادم الحرمين الشريفين للابتعاث — مسار إمداد", en: "Custodian of the Two Holy Mosques Scholarship Program — Imdad path" },
  university: { ar: "جامعة نيويورك", en: "New York University" },
  degree: { ar: "بكالوريوس · علوم الحاسب والاقتصاد", en: "Bachelor's · Computer Science & Economics" },
  major: { ar: "علوم الحاسب والاقتصاد", en: "Computer Science & Economics" },
  startTerm: { ar: "خريف ٢٠٢٦", en: "Fall 2026" },
  external: { nafathVerified: true, qiyas: null, highSchool: null },
};
const AIRPORTS = [
  { code: "JED", ar: "جدة — الملك عبدالعزيز", en: "Jeddah — King Abdulaziz" },
  { code: "RUH", ar: "الرياض — الملك خالد", en: "Riyadh — King Khalid" },
  { code: "DMM", ar: "الدمام — الملك فهد", en: "Dammam — King Fahd" },
  { code: "MED", ar: "المدينة المنورة", en: "Madinah" },
  { code: "JFK", ar: "نيويورك JFK", en: "New York JFK" },
  { code: "IAD", ar: "واشنطن دالس", en: "Washington Dulles" },
  { code: "LAX", ar: "لوس أنجلوس", en: "Los Angeles" },
  { code: "LHR", ar: "لندن هيثرو", en: "London Heathrow" },
];
const BANK_COUNTRIES = [
  { code: "US", ar: "الولايات المتحدة", en: "United States", scheme: "US" },
  { code: "GB", ar: "المملكة المتحدة", en: "United Kingdom", scheme: "IBAN" },
  { code: "DE", ar: "ألمانيا", en: "Germany", scheme: "IBAN" },
  { code: "FR", ar: "فرنسا", en: "France", scheme: "IBAN" },
  { code: "CA", ar: "كندا", en: "Canada", scheme: "OTHER" },
  { code: "AU", ar: "أستراليا", en: "Australia", scheme: "OTHER" },
];

/* ============ 5 · CSS — theme tokens exactly per handoff, logical props only ============ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
/* full-screen takeover: escape Vite's #root width cap while Rafeeq is on screen */
#root:has(.rafeeq){max-width:none;width:100%;margin:0;padding:0;text-align:start;}
body:has(.rafeeq){margin:0;display:block;}

/* return-to-portfolio — sits at the end of the page like a footer */
.rafeeq .rq-return{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  margin-block-start:56px; padding:20px clamp(20px,5vw,44px);
  border-block-start:1px solid rgba(206,178,255,.28);
  background:linear-gradient(135deg, rgba(92,58,158,.5), rgba(32,16,61,.46));
  backdrop-filter:blur(24px) saturate(190%) brightness(1.08);
  -webkit-backdrop-filter:blur(24px) saturate(190%) brightness(1.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.28);
  font-family:"SF Grandezza", sans-serif; font-weight:200; font-size:17px;
  color:#fff; text-decoration:none; letter-spacing:.01em;
  transition:background .18s ease;
}
.rafeeq[dir="rtl"] .rq-return{ font-family:"Mada", sans-serif; }
.rafeeq .rq-return:hover{ background:linear-gradient(135deg, rgba(110,70,180,.58), rgba(40,20,74,.5)); }
.rafeeq .rq-return .rq-return-txt{ white-space:nowrap; }
.rafeeq .rq-return img{ width:26px !important; height:26px !important; flex:none; object-fit:contain; filter:brightness(0) invert(1); }





.rafeeq{--r:16px;--r-sm:10px;--r-pill:999px;min-height:100vh;font-size:15.5px;line-height:1.6;
  -webkit-font-smoothing:antialiased;color:var(--ink);position:relative;overflow-x:hidden;
  background:radial-gradient(1100px 620px at var(--glow-x) -140px, var(--body-glow), var(--bg) 60%), var(--bg);}
.rafeeq[data-theme="dark"]{
  --bg:#0F2A20;--surface:#16382B;--surface-2:#1C4234;--body-glow:#1D4A39;
  --ink:#E9F2ED;--ink-soft:#A6BEB4;--ink-faint:#7B9488;
  --line:#2A4C3E;--line-soft:#20402F;
  --accent:#2FD6B0;--accent-ink:#8FF0D6;--accent-soft:rgba(47,214,176,.13);--on-accent:#06231A;
  --coral:#E7998A;--amber:#E0B15C;--amber-soft:rgba(224,177,92,.14);--red:#E38279;--red-soft:rgba(227,130,121,.15);
  --glass:rgba(18,44,34,.62);--glass-brd:rgba(150,228,200,.20);--scrim:rgba(6,18,13,.45);
  --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -14px rgba(0,0,0,.55);
  --logo-mark:#2FD6B0;--logo-mark2:#8FF0D6;}
.rafeeq[data-theme="light"]{
  --bg:#F3F1EA;--surface:#FFFFFF;--surface-2:#F7F4EC;--body-glow:#FBFAF3;
  --ink:#132A20;--ink-soft:#4C5A52;--ink-faint:#8A968E;
  --line:#E3DFD4;--line-soft:#ECE8DD;
  --accent:#0E7A58;--accent-ink:#0A5239;--accent-soft:#E2F0E9;--on-accent:#FFFFFF;
  --coral:#C96A54;--amber:#9A6611;--amber-soft:#FAF0DA;--red:#A8362F;--red-soft:#F8E6E3;
  --glass:rgba(255,255,255,.66);--glass-brd:rgba(20,60,45,.14);--scrim:rgba(20,40,30,.22);
  --shadow:0 1px 2px rgba(20,32,26,.05),0 10px 28px -14px rgba(20,32,26,.16);
  --logo-mark:#0E7A58;--logo-mark2:#2FA37E;}
.rafeeq[dir="rtl"]{--glow-x:92%} .rafeeq[dir="ltr"]{--glow-x:8%}
.rafeeq[dir="rtl"]{font-family:"Noto Naskh Arabic","Hanken Grotesk",serif}
.rafeeq[dir="ltr"]{font-family:"Hanken Grotesk","Noto Naskh Arabic",sans-serif}
.rafeeq *{box-sizing:border-box;margin:0;padding:0}
.rafeeq h1,.rafeeq h2,.rafeeq h3{line-height:1.28;letter-spacing:0;font-weight:700}
.rafeeq[dir="ltr"] h1,.rafeeq[dir="ltr"] h2,.rafeeq[dir="ltr"] h3{font-family:"Bricolage Grotesque",sans-serif;letter-spacing:-.01em;line-height:1.14}
.rafeeq .mono{font-family:"JetBrains Mono",monospace}
.rafeeq button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;font-size:inherit}
.rafeeq input,.rafeeq select,.rafeeq textarea{font-family:inherit;color:var(--ink)}
.rafeeq svg{flex:none}
/* directional arrows flip in RTL (handoff §3) */
.rafeeq[dir="rtl"] .dirsvg{transform:scaleX(-1)}

/* buttons */
.rq-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;
  border-radius:var(--r-sm);font-weight:600;font-size:15px;transition:.16s;line-height:1.3}
.rq-btn svg{width:17px;height:17px;stroke-width:2}
.rq-primary{background:var(--accent);color:var(--on-accent)}
.rq-primary:hover{filter:brightness(1.07)}
.rq-primary:disabled{opacity:.45;cursor:not-allowed}
.rq-ghost{background:var(--surface);border:1px solid var(--line)}
.rq-ghost:hover{border-color:var(--ink-faint)}
.rq-btn:focus-visible,.rafeeq button:focus-visible,.rafeeq input:focus-visible,.rafeeq select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* topbar — coral hairline is the one warm note */
.rq-topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:14px;
  padding:12px clamp(16px,4vw,36px);background:var(--glass);backdrop-filter:blur(14px);
  border-block-end:1px solid var(--coral)}
.rq-burger{width:40px;height:40px;border-radius:11px;border:1px solid var(--line);background:var(--surface);
  display:grid;place-items:center;color:var(--ink-soft)}
.rq-burger svg{width:19px;height:19px;stroke-width:2}
.rq-who{display:flex;align-items:center;gap:10px;min-width:0}
.rq-avatar{width:38px;height:38px;border-radius:50%;background:var(--accent);color:var(--on-accent);
  display:grid;place-items:center;font-weight:700;font-size:15px}
.rq-who .nm{font-weight:600;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-who .nm small{display:block;font-weight:500;font-size:11.5px;color:var(--ink-faint)}
.rq-logo{margin-inline-start:auto;display:flex;align-items:center;gap:10px}
.rq-logo .wm{font-weight:700;font-size:21px;line-height:1}
.rq-logo .wm small{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);font-weight:500;margin-block-start:2px;font-family:"Hanken Grotesk",sans-serif}

/* drawer */
.rq-scrim{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(3px);z-index:60;animation:rqFade .22s ease both}
.rq-drawer{position:fixed;inset-block:0;inset-inline-start:0;width:min(320px,86vw);z-index:61;
  background:var(--glass);backdrop-filter:blur(22px);border-inline-end:1px solid var(--glass-brd);
  padding:22px 18px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;
  animation:rqSlide .28s cubic-bezier(.2,.8,.2,1) both}
@keyframes rqSlide{from{transform:translateX(calc(var(--slide-dir) * -100%))}to{transform:none}}
.rafeeq[dir="ltr"] .rq-drawer{--slide-dir:1}.rafeeq[dir="rtl"] .rq-drawer{--slide-dir:-1}
@keyframes rqFade{from{opacity:0}to{opacity:1}}
.rq-drawer .dh{display:flex;align-items:center;gap:11px;padding-block-end:16px;border-block-end:1px solid var(--line-soft);margin-block-end:10px}
.rq-ditem{display:flex;align-items:center;gap:12px;width:100%;text-align:start;padding:11px 12px;border-radius:var(--r-sm);font-weight:500;color:var(--ink-soft);transition:.14s}
.rq-ditem:hover{background:var(--accent-soft);color:var(--ink)}
.rq-ditem svg{width:18px;height:18px;stroke-width:1.9}
.rq-ditem .end{margin-inline-start:auto;font-size:13px;color:var(--ink-faint)}
.rq-dlabel{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);padding:14px 12px 6px}
.rq-seg{display:flex;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-pill);padding:3px;margin:4px 12px}
.rq-seg button{flex:1;padding:7px 10px;border-radius:var(--r-pill);font-size:13.5px;font-weight:600;color:var(--ink-soft)}
.rq-seg button.on{background:var(--accent);color:var(--on-accent)}

/* cards + layout */
.rq-content{padding:clamp(20px,4vw,40px);max-width:880px;margin-inline:auto;width:100%}
.rq-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow)}
.rq-rise{animation:rqRise .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes rqRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.rafeeq *{animation-duration:.001s!important;transition-duration:.001s!important}}

/* home hero */
.rq-hero{position:relative;overflow:hidden;padding:clamp(24px,4vw,36px);border-radius:var(--r);
  background:linear-gradient(140deg,var(--surface-2),var(--surface));border:1px solid var(--line)}
.rq-hero .eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--accent);text-transform:uppercase}
.rq-hero h1{font-size:clamp(24px,4vw,32px);margin-block:8px 10px}
.rq-hero p{color:var(--ink-soft);max-width:62ch}
.rq-hero .leafbg{position:absolute;inset-block-start:-30px;inset-inline-end:-30px;width:220px;height:220px;opacity:.09;pointer-events:none}
.rq-meta{display:flex;flex-wrap:wrap;gap:8px;margin-block-start:18px}
.rq-chip{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:var(--r-pill);
  background:var(--surface);border:1px solid var(--line);font-size:13px;font-weight:600;color:var(--ink-soft)}
.rq-chip svg{width:14px;height:14px;stroke-width:2;color:var(--accent)}

/* phase cards */
.rq-phases{display:grid;gap:14px;margin-block-start:22px}
.rq-phase{display:flex;gap:16px;align-items:center;padding:18px 20px;flex-wrap:wrap}
.rq-phase .pnum{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;flex:none;
  font-weight:700;font-size:21px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--line)}
.rq-phase.locked .pnum{background:var(--surface-2);color:var(--ink-faint)}
.rq-phase.approved .pnum{background:var(--accent);color:var(--on-accent)}
.rq-phase .pb{flex:1;min-width:180px}
.rq-phase h3{font-size:17.5px}
.rq-phase .pw{font-size:13px;color:var(--ink-faint);margin-block-start:2px}
.rq-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:var(--r-pill);font-size:12.5px;font-weight:700}
.rq-pill .led{width:7px;height:7px;border-radius:50%;background:currentColor}
.rq-pill.green{background:var(--accent-soft);color:var(--accent)}
.rq-pill.amber{background:var(--amber-soft);color:var(--amber)}
.rq-pill.gray{background:var(--surface-2);color:var(--ink-faint);border:1px solid var(--line)}
.rq-progress{height:5px;border-radius:3px;background:var(--surface-2);overflow:hidden;margin-block-start:9px}
.rq-progress i{display:block;height:100%;background:var(--accent);border-radius:3px;transition:width .7s cubic-bezier(.2,.8,.2,1)}

/* chevron step bar — double-flip trick keeps text upright in RTL */
.rq-chevs{display:flex;gap:6px;margin-block-end:18px}
.rafeeq[dir="rtl"] .rq-chevs{transform:scaleX(-1)}
.rafeeq[dir="rtl"] .rq-chev>span{transform:scaleX(-1);display:inline-flex;align-items:center;gap:7px}
.rq-chev{flex:1;min-width:0;padding:11px 8px 11px 18px;background:var(--surface);border:1px solid var(--line);
  color:var(--ink-faint);font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;gap:7px;
  clip-path:polygon(0 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 0 100%, 13px 50%);transition:.18s}
.rq-chev:first-child{clip-path:polygon(0 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 0 100%);border-start-start-radius:0;padding-inline-start:12px}
.rq-chev>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-flex;align-items:center;gap:7px}
.rq-chev.active{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.rq-chev.done{background:var(--accent-soft);color:var(--accent);cursor:pointer}
.rq-chev.todo{cursor:not-allowed;opacity:.75}
.rq-chev .n{font-size:14px;font-weight:700}
@media(max-width:640px){.rq-chev>span .lbl{display:none}.rq-chev{padding-block:10px}}

/* wizard panel + fields */
.rq-panel{padding:clamp(20px,3.5vw,30px)}
.rq-panel h2{font-size:21px}
.rq-panel .sub{color:var(--ink-soft);font-size:14px;margin-block:5px 22px}
.rq-field{margin-block-end:16px}
.rq-field label{display:block;font-size:13.5px;font-weight:600;margin-block-end:7px;color:var(--ink-soft)}
.rq-field label .req{color:var(--red)}
.rq-ib{display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);padding-inline:13px;transition:.15s}
.rq-ib:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.rq-ib input,.rq-ib select{border:none;outline:none;background:none;padding-block:11px;width:100%;font-size:15px}
.rq-ib select option{color:#132A20;background:#fff}
.rq-field.err .rq-ib{border-color:var(--red);box-shadow:0 0 0 3px var(--red-soft)}
.rq-field .hint{display:none;font-size:12px;color:var(--red);margin-block-start:5px}
.rq-field.err .hint{display:block}
.rq-row2{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:560px){.rq-row2{grid-template-columns:1fr}}
.rq-rec{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-soft);border:1px solid var(--line);border-radius:var(--r-sm);overflow:hidden;margin-block-end:18px}
@media(max-width:560px){.rq-rec{grid-template-columns:1fr}}
.rq-rec>div{background:var(--surface);padding:13px 16px}
.rq-rec .k{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);margin-block-end:3px}
.rq-rec .v{font-weight:600;font-size:14.5px}
.rq-agree{display:flex;align-items:flex-start;gap:11px;font-size:14.5px;font-weight:500;cursor:pointer;padding:13px 15px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2)}
.rq-agree input{accent-color:var(--accent);width:18px;height:18px;margin-block-start:3px}
.rq-agree.on{border-color:var(--accent);background:var(--accent-soft)}
.rq-terms{max-height:230px;overflow-y:auto;border:1px solid var(--line);border-radius:var(--r-sm);padding:16px 18px;font-size:14px;color:var(--ink-soft);background:var(--surface-2);margin-block-end:14px}
.rq-terms h4{font-size:14px;color:var(--ink);margin-block:12px 4px}
.rq-terms h4:first-child{margin-block-start:0}
.rq-wnav{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-block-start:24px;flex-wrap:wrap}
.rq-wnav .grow{flex:1}
.rq-list{display:flex;flex-direction:column;gap:10px;margin-block-end:14px}
.rq-item{display:flex;align-items:center;gap:12px;padding:12px 15px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);flex-wrap:wrap}
.rq-item .ib2{flex:1;min-width:140px}
.rq-item .t{font-weight:600;font-size:14.5px}
.rq-item .d{font-size:12.5px;color:var(--ink-faint)}
.rq-x{color:var(--red);font-size:13px;font-weight:600;padding:6px 10px;border-radius:8px}
.rq-x:hover{background:var(--red-soft)}
.rq-empty{padding:20px;text-align:center;color:var(--ink-faint);font-size:14px;border:1.5px dashed var(--line);border-radius:var(--r-sm);margin-block-end:14px}

/* review / approval */
.rq-review{padding:clamp(24px,4vw,36px);text-align:center}
.rq-review .ri{width:62px;height:62px;border-radius:50%;background:var(--amber-soft);color:var(--amber);display:grid;place-items:center;margin:0 auto 16px}
.rq-review .ri svg{width:29px;height:29px;stroke-width:2}
.rq-review.ok .ri{background:var(--accent-soft);color:var(--accent)}
.rq-review h2{font-size:22px}
.rq-review p{color:var(--ink-soft);margin-block:8px 20px;max-width:52ch;margin-inline:auto}
.rq-sim{font-size:12.5px;color:var(--ink-faint);margin-block-start:12px}

/* toast + modal + confetti */
.rq-toast{position:fixed;inset-block-end:26px;left:50%;transform:translateX(-50%) translateY(90px);
  background:var(--ink);color:var(--bg);padding:13px 22px;border-radius:var(--r-pill);font-weight:600;font-size:14.5px;
  z-index:100;opacity:0;transition:.35s cubic-bezier(.2,.8,.2,1);box-shadow:var(--shadow);max-width:90vw;text-align:center}
.rq-toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.rq-modal-scrim{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(4px);z-index:70;display:grid;place-items:center;padding:18px;animation:rqFade .2s ease both}
.rq-modal{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);max-width:560px;width:100%;max-height:86vh;overflow-y:auto;padding:26px}
.rq-letter{background:#fff;color:#1a1a1a;border:1px solid #ddd;border-radius:8px;padding:26px;font-family:"Hanken Grotesk",sans-serif;font-size:13.5px;line-height:1.7;direction:ltr;text-align:left;margin-block:16px}
.rq-letter h3{font-family:"Bricolage Grotesque",sans-serif;font-size:16px;margin-block-end:10px;color:#0A4A37}
.rq-confetti{position:fixed;inset:0;pointer-events:none;z-index:95;overflow:hidden}
.rq-confetti i{position:absolute;inset-block-start:-12px;border-radius:2px;animation:rqDrop var(--dur) cubic-bezier(.3,.6,.5,1) forwards}
@keyframes rqDrop{to{transform:translateY(105vh) rotate(var(--rot));opacity:.6}}

/* login */
.rq-auth{min-height:100vh;display:grid;place-items:center;padding:24px;position:relative}
.rq-auth-card{width:min(430px,100%);padding:clamp(24px,4vw,34px)}
.rq-auth .langsw{position:absolute;inset-block-start:18px;inset-inline-end:clamp(16px,4vw,36px);display:flex;gap:8px}
.rq-auth-brand{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;margin-block-end:22px}
.rq-auth-brand h1{font-size:30px;line-height:1.2}
.rq-auth-brand .tg{color:var(--ink-soft);font-size:14px}
.rq-nafath{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:12px;border:1px solid var(--line);border-radius:var(--r-sm);font-weight:600;background:var(--surface-2);transition:.15s}
.rq-reg .rq-nafath{margin-block-start:18px;position:relative;z-index:1;padding:14px}
.rq-reg .rq-nafath[disabled]{opacity:.6;cursor:progress}
.rq-reg .rq-stub-note{margin-block-start:12px;margin-block-end:4px}
.rq-reg .rq-f{margin-block-end:16px}
.rq-reg .rq-f>input,.rq-reg .rq-captcha{margin-block-start:2px}
.rq-captcha .cap-box .refresh{align-self:stretch;display:grid;place-items:center}
.rq-nafath:hover{border-color:var(--accent);background:var(--accent-soft)}
.rq-nafath .nf{width:24px;height:24px;border-radius:7px;background:#23a455;color:#fff;display:grid;place-items:center;font-size:10.5px;font-weight:700}
.rq-divider{display:flex;align-items:center;gap:14px;margin-block:18px;color:var(--ink-faint);font-size:12.5px}
.rq-divider::before,.rq-divider::after{content:"";flex:1;height:1px;background:var(--line)}
.rq-disc{font-size:11.5px;color:var(--ink-faint);text-align:center;margin-block-start:18px;max-width:46ch;margin-inline:auto;line-height:1.6}
.rq-reg{width:min(520px,94vw);max-width:100%;text-align:start;overflow:hidden}
.rq-reg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;margin:14px 0;min-width:0}
.rq-reg-grid label,.rq-f{display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--ink-soft);font-weight:600;min-width:0;margin-block-end:12px}
.rq-reg-grid label{margin-block-end:0}
.rq-reg-grid label.wide{grid-column:1 / -1}
.rq-reg-grid input,.rq-f input{width:100%;min-width:0;box-sizing:border-box;padding:11px 13px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-reg-grid input:focus,.rq-f input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-reg-grid input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-reg-grid input:disabled{opacity:.5;cursor:not-allowed}
.rq-stub{border:1px dashed var(--line);border-radius:14px;padding:14px;margin:12px 0;background:var(--surface)}
.rq-stub-badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--amber);background:var(--amber-soft);border-radius:999px;padding:3px 10px;margin-block-end:10px}
.rq-stub-note{font-size:12px;color:var(--ink-faint);margin-block-start:8px;line-height:1.55}
.rq-reg-actions{display:flex;gap:12px;justify-content:flex-end;margin-block-start:8px}
.rq-auth-err{color:#e0574f;font-size:13px;margin:8px 0;font-weight:600}
@media(max-width:520px){.rq-reg-grid{grid-template-columns:1fr}}
.rq-pick{position:relative}
.rq-pick input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-pick input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-pick-list{position:absolute;inset-inline:0;top:calc(100% + 4px);z-index:30;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);box-shadow:var(--shadow);max-height:230px;overflow-y:auto}
.rq-pick-opt{padding:9px 12px;font-size:13.5px;cursor:pointer;border-bottom:1px solid var(--line);text-align:start}
.rq-pick-opt:last-child{border-bottom:none}
.rq-pick-opt:hover{background:var(--accent-soft);color:var(--accent)}
.rq-pick-opt.none{color:var(--ink-faint);cursor:default}
.rq-pick-opt .ar-alt{color:var(--ink-faint)}
.rq-readonly input{opacity:.75;cursor:default;background:var(--surface)}
.rq-nf-sheet{width:min(430px,94vw);padding:24px;text-align:start}
.rq-nf-head{display:flex;align-items:center;gap:10px;margin-block-end:6px}
.rq-nf-head .nf{width:26px;height:26px;border-radius:7px;background:#23a455;color:#fff;display:grid;place-items:center;font-size:10px;font-weight:700;flex:none}
.rq-nf-head h2{font-size:19px}
.rq-nf-sub{color:var(--ink-soft);font-size:13.5px;margin-block-end:16px}
.rq-nf-f{display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:var(--ink-soft);font-weight:600;margin-block-end:12px}
.rq-nf-f>input{padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-nf-f>input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-nf-act{display:flex;gap:10px;justify-content:flex-end;margin-block-start:6px}
.rq-reg-h{font-size:20px;margin-block-end:4px}
.rq-reg-sub{color:var(--ink-soft);font-size:13.5px;margin-block-end:16px}
.rq-steps{display:flex;align-items:center;margin-block-end:22px}
.rq-step{display:flex;align-items:center;gap:9px;flex:1}
.rq-step:last-child{flex:none}
.rq-step .dot{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:var(--surface-2);color:var(--ink-faint);border:1px solid var(--line);flex:none}
.rq-step.active .dot{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.rq-step.done .dot{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.rq-step .sl{font-size:12.5px;color:var(--ink-faint);white-space:nowrap}
.rq-step.active .sl{color:var(--ink);font-weight:600}
.rq-step .line{flex:1;height:1px;background:var(--line);margin-inline:10px;min-width:14px}
.rq-idtypes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.rq-idt{padding:15px 10px;border:1.5px solid var(--line);border-radius:var(--r-sm);background:var(--surface);text-align:center;transition:.16s;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px}
.rq-idt:hover{border-color:var(--accent-soft)}
.rq-idt.sel{border-color:var(--accent);background:var(--accent-soft)}
.rq-idt .ti{width:36px;height:36px;border-radius:10px;background:var(--surface-2);display:grid;place-items:center;color:var(--accent);margin-block-end:5px}
.rq-idt.sel .ti{background:var(--surface)}
.rq-idt .tn{font-weight:600;font-size:13px;color:var(--ink)}
.rq-idt .ta{font-size:11.5px;color:var(--ink-faint)}
.rq-captcha{display:flex;gap:10px}
.rq-captcha .cap-box{display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);overflow:hidden;flex:none}
.rq-captcha .refresh{padding:0 10px;color:var(--ink-faint);display:grid;place-items:center;height:100%}
.rq-captcha .refresh:hover{color:var(--accent)}
.rq-captcha .cap-code{padding:8px 16px;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:20px;letter-spacing:5px;color:var(--accent);font-style:italic;transform:skewX(-6deg);user-select:none}
.rq-captcha input{flex:1;min-width:0;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-reg input.err,.rq-captcha input.err{border-color:#e0574f;outline:none}
.rq-fe{color:#e0574f;font-size:11.5px;font-weight:600;margin-block-start:4px}
.rq-award-box{border:1px solid var(--accent);background:var(--accent-soft);border-radius:14px;padding:14px 16px;margin-block-end:16px}
.rq-award-badge{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--accent);margin-block-end:10px}
.rq-award-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;min-width:0}
.rq-award-grid>div{min-width:0}
.rq-award-grid .wide{grid-column:1 / -1}
.rq-award-grid span{display:block;font-size:11px;color:var(--ink-faint);margin-block-end:2px}
.rq-rank{display:inline-block;margin-inline-start:8px;font-style:normal;font-size:10.5px;font-weight:700;color:var(--accent);background:var(--surface);border:1px solid var(--accent);border-radius:999px;padding:1px 7px;vertical-align:middle}
.rq-award-grid b{font-size:13px;font-weight:600;color:var(--ink);line-height:1.35;overflow-wrap:anywhere}
@media(max-width:600px){
  /* language/theme switcher: out of the card's way, into normal flow */
  .rq-auth{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
           gap:12px;padding:14px 14px 32px;min-height:100dvh}
  .rq-auth .langsw{position:static;align-self:flex-end;margin:0}
  .rq-auth-card{width:100%;padding:20px 16px}

  .rq-auth-brand{margin-block-end:16px}
  .rq-auth-brand h1{font-size:24px}

  /* stop iOS auto-zooming on focus — needs >=16px */
  .rq-auth input,.rq-reg input,.rq-captcha input,.rq-nf-f>input,.rq-pick input{font-size:16px}

  /* 3-up ID type cards are far too cramped at this width */
  .rq-idtypes{grid-template-columns:1fr}
  .rq-idt{flex-direction:row;justify-content:flex-start;gap:12px;padding:12px 14px;text-align:start}
  .rq-idt .ti{margin-block-end:0}

  .rq-captcha{flex-wrap:wrap}
  .rq-captcha .cap-code{font-size:18px;letter-spacing:3px;padding:8px 12px}

  .rq-reg-actions{flex-direction:column-reverse;gap:8px}
  .rq-reg-actions .rq-btn{width:100%}

  .rq-award-box{padding:12px 13px}
  .rq-award-grid b{font-size:12.5px}
  .rq-rank{margin-inline-start:6px}
}
`;

/* ============ 6 · Icons + logo ============ */
const Icon = ({ d, dir=false, size=18 }) => (
  <svg className={dir ? "dirsvg" : ""} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
);
const IC = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  bank: '<path d="M3 21h18M4 21V10M20 21V10M3 10l9-6 9 6"/>',
  home2: '<path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"/>',
  cap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  reset: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  seal: '<path d="M12 2l2.4 2.4 3.3-.5.9 3.2 3 1.4-1.4 3 1.4 3-3 1.4-.9 3.2-3.3-.5L12 22l-2.4-2.4-3.3.5-.9-3.2-3-1.4 1.4-3-1.4-3 3-1.4.9-3.2 3.3.5z"/><path d="m9 12 2 2 4-4"/>',
  paperclip: '<path d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
};
/* two-swoosh leaf mark — colored by theme via --logo-mark vars */
const Mark = ({ size=36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path d="M8 34 C14 14, 30 8, 42 10 C34 14, 24 18, 18 34 Z" fill="var(--logo-mark)"/>
    <path d="M14 40 C20 26, 32 20, 42 20 C35 25, 27 29, 23 40 Z" fill="var(--logo-mark2)" opacity=".82"/>
  </svg>
);

/* ============ 7 · UI atoms ============ */
const Field = ({ label, required, error, hint, children }) => (
  <div className={"rq-field" + (error ? " err" : "")}>
    <label>{label}{required && <span className="req"> *</span>}</label>
    <div className="rq-ib">{children}</div>
    <div className="hint">{hint}</div>
  </div>
);

const Pill = ({ tone, children }) => (
  <span className={"rq-pill " + tone}><span className="led" />{children}</span>
);

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100, size: 6 + Math.random() * 7,
    color: ["#2FD6B0", "#C2A24A", "#E7998A", "#8FF0D6"][i % 4],
    dur: 2 + Math.random() * 1.6, rot: Math.random() * 720,
  })), []);
  return (
    <div className="rq-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ insetInlineStart: p.left + "%", width: p.size, height: p.size, background: p.color, "--dur": p.dur + "s", "--rot": p.rot + "deg" }} />
      ))}
    </div>
  );
}

/* financial guarantee letter — English by design (handoff §6) */
function GuaranteeModal({ t, onClose }) {
  return (
    <div className="rq-modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rq-modal" role="dialog" aria-modal="true">
        <h2 style={{ fontSize: 20 }}>{t("fg.ready.title")}</h2>
        <div className="rq-letter">
          <h3>Financial Guarantee — Royal Embassy of Saudi Arabia, Cultural Mission</h3>
          <p>To whom it may concern,</p>
          <p style={{ marginBlock: 10 }}>
            This is to certify that <b>Hashim Motabagani</b> is a recipient of the Custodian of the Two
            Holy Mosques Scholarship Program (Imdad path), sponsored by the Ministry of Education of
            Saudi Arabia, to pursue a Bachelor's degree in Computer Science &amp; Economics at
            <b> New York University</b>, beginning Fall 2026.
          </p>
          <p style={{ marginBlock: 10 }}>
            The sponsor will cover full tuition and fees, a monthly living stipend, and health
            insurance for the duration of the program.
          </p>
          <p>Ref: <span style={{ fontFamily: "JetBrains Mono, monospace" }}>FG-2026-5678</span> · Demo document — not an official letter.</p>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBlockEnd: 16 }}>{t("fg.note")}</p>
        <button className="rq-btn rq-primary" onClick={onClose}>{t("chrome.close")}</button>
      </div>
    </div>
  );
}

/* ============ 8 · Login ============ */
function Login({ t, lang, setLang, theme, setTheme, onSignIn, onRegister }) {
  const [nafath, setNafath]     = useState(false);
  const [nfStep, setNfStep]     = useState(1);
  const [nfId, setNfId]         = useState("");
  const [nfIdErr, setNfIdErr]   = useState(false);
  const [nfNameAr, setNfNameAr] = useState("");
  const [nfNameEn, setNfNameEn] = useState("");
  const [nfMajor, setNfMajor]   = useState("");
  const arL = lang === "ar";

  const openNafath = () => {
    setNfStep(1); setNfId(""); setNfIdErr(false);
    setNfNameAr(""); setNfNameEn(""); setNfMajor(""); setNafath(true);
  };
  const nfIdNext = () => {
    if (!/^\d{10}$/.test(nfId.trim())) { setNfIdErr(true); return; }
    setNfIdErr(false); setNfStep(2);
  };
  const nafathGo = () => {
    const nAr = nfNameAr.trim(), nEn = nfNameEn.trim();
    if (!nAr || !nEn) return;
    const first = (v) => (v.split(/\s+/)[0] || v);
    onSignIn({ ...DEMO_USER,
      national_id: nfId.trim(),
      name:  { ar: nAr, en: nEn },
      first: { ar: first(nAr), en: first(nEn) },
      major: nfMajor ? { ar: nfMajor, en: nfMajor } : DEMO_USER.major,
      degree: DEMO_USER.degree,
      nafath: true });
  };
  const [id, setId] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(null);
  const submit = async () => {
    if (id.trim() === DEMO_USER.national_id && pw === DEMO_USER.password) { setErr(null); return onSignIn(DEMO_USER); }
    const u = await userStore.login(id.trim(), pw);
    if (u) { setErr(null); return onSignIn(u); }
    setErr("pw");
  };
  return (
    <div className="rq-auth">
      <div className="langsw">
        <button className="rq-btn rq-ghost" style={{ padding: "8px 14px" }} onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          <Icon d={IC.globe} size={16} />{lang === "ar" ? "English" : "العربية"}
        </button>
        <button className="rq-btn rq-ghost" style={{ padding: "8px 12px" }} aria-label={t("chrome.theme")} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Icon d={theme === "dark" ? IC.sun : IC.moon} size={16} />
        </button>
      </div>
      <div className="rq-card rq-auth-card rq-rise">
        <div className="rq-auth-brand">
          <Mark size={52} />
          <h1>{t("brand.name")} <span style={{ color: "var(--ink-faint)", fontWeight: 500, fontSize: 20 }}>Rafeeq</span></h1>
          <div className="tg">{t("brand.tag")}</div>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBlockEnd: 20 }}>{t("login.sub")}</p>
        <Field label={t("login.id")} required error={err === "id"} hint={t("login.err.id")}>
          <input value={id} onChange={e => setId(e.target.value)} placeholder={t("login.id.ph")} inputMode="numeric" dir="ltr" style={{ textAlign: "start" }} />
        </Field>
        <Field label={t("login.password")} required error={err === "pw"} hint={t("login.err.pw")}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={t("login.password.ph")} onKeyDown={e => e.key === "Enter" && submit()} />
        </Field>
        <button className="rq-btn rq-primary" style={{ width: "100%" }} onClick={submit}>
          {t("login.btn")}<Icon d={IC.next} dir />
        </button>
        <div className="rq-divider">{t("login.or")}</div>
        <button className="rq-nafath" onClick={() => setNafath(true)}><span className="nf">نفاذ</span>{t("login.nafath")}</button>
        <button className="rq-btn rq-ghost" style={{ width: "100%", marginBlockStart: 10 }} onClick={onRegister}>{lang === "ar" ? "إنشاء حساب جديد" : "Create a new account"}</button>
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBlockStart: 16 }}>{t("login.demo")}</p>
        <p className="rq-disc">{t("brand.disclaimer")}</p>
        {nafath && (
          <div className="rq-modal-scrim" onClick={() => setNafath(false)}>
            <div className="rq-card rq-nf-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="rq-nf-head"><span className="nf">نفاذ</span>
                <h2>{arL ? "مرحباً بك عبر نفاذ" : "Welcome via Nafath"}</h2></div>
              <p className="rq-nf-sub">{arL ? "عرّفنا بنفسك لنخصّص رحلتك." : "Tell us who you are so we can tailor your journey."}</p>
              <label className="rq-nf-f">{arL ? "الاسم الكامل" : "Full name"}
                <input value={nfName} onChange={(e) => setNfName(e.target.value)} autoFocus
                  placeholder={arL ? "اسمك الكامل" : "Your full name"} /></label>
              <label className="rq-nf-f">{arL ? "التخصص" : "Major"}
                <Picker kind="major" value={nfMajor} onChange={setNfMajor} dir="ltr"
                  placeholder={arL ? "مثل: علوم الحاسب" : "e.g. Computer Science"} /></label>
              <div className="rq-nf-act">
                <button className="rq-btn rq-ghost" onClick={() => setNafath(false)}>{arL ? "رجوع" : "Back"}</button>
                <button className="rq-btn rq-primary" onClick={nafathGo} disabled={!nfName.trim()}>{arL ? "متابعة" : "Continue"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ 9 · Chevron wizard shell ============ */
function Chevrons({ steps, current, maxReached, onGo, lang, t }) {
  return (
    <div className="rq-chevs" role="tablist">
      {steps.map((s, i) => {
        const st = i === current ? "active" : i < maxReached || i < current ? "done" : "todo";
        return (
          <button key={i} className={"rq-chev " + st} role="tab" aria-selected={i === current}
            onClick={() => (i <= maxReached ? onGo(i) : null)} disabled={i > maxReached}>
            <span><b className="n">{num(i + 1, lang)}</b><span className="lbl">{t(s.titleKey)}</span></span>
          </button>
        );
      })}
    </div>
  );
}

function WizardNav({ t, isFirst, isLast, onBack, onSave, onNext }) {
  return (
    <div className="rq-wnav">
      {!isFirst ? (
        <button className="rq-btn rq-ghost" onClick={onBack}><Icon d={IC.back} dir />{t("phase.back")}</button>
      ) : <span />}
      <span className="grow" />
      <button className="rq-btn rq-ghost" onClick={onSave}>{t("phase.save")}</button>
      <button className="rq-btn rq-primary" onClick={onNext}>
        {isLast ? t("phase.submit") : t("phase.next")}<Icon d={isLast ? IC.check : IC.next} dir={!isLast} />
      </button>
    </div>
  );
}

/* ============ 10 · Phase step forms ============
   Each step: ({t, lang, data, setData, errors}) => JSX, plus a validate(data)
   returning an array of error keys. Values stored are stable EN/ISO. */

const P1_STEPS = [
  {
    titleKey: "p1.s1.title", subKey: "p1.s1.sub",
    validate: d => (d.confirmed ? [] : ["confirm"]),
    errToast: "err.confirmfirst",
    render: ({ t, lang, data, setData }) => (
      <>
        <div className="rq-rec">
          <div><div className="k">{t("p1.s1.field.name")}</div><div className="v">{user.name[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.program")}</div><div className="v">{user.program[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.uni")}</div><div className="v">{user.university[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.degree")}</div><div className="v">{user.degree[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.term")}</div><div className="v">{user.startTerm[lang]}</div></div>
          <div><div className="k">{t("p1.s1.field.stipend")}</div><div className="v mono" dir="ltr">{awardBoth(user)}</div></div>
        </div>
        <label className={"rq-agree" + (data.confirmed ? " on" : "")}>
          <input type="checkbox" checked={!!data.confirmed} onChange={e => setData({ ...data, confirmed: e.target.checked })} />
          {t("p1.s1.confirm")}
        </label>
      </>
    ),
  },
  {
    titleKey: "p1.s2.title", subKey: "p1.s2.sub",
    validate: d => {
      const e = [];
      if (!d.qualInst) e.push("qualInst");
      if (!d.qualYear) e.push("qualYear");
      return e;
    },
    render: ({ t, data, setData, errors }) => (
      <>
        <Field label={t("p1.s2.qual")}>
          <select value={data.qualType || "hs"} onChange={e => setData({ ...data, qualType: e.target.value })}>
            <option value="hs">{t("p1.s2.qual.hs")}</option>
            <option value="dip">{t("p1.s2.qual.dip")}</option>
            <option value="bsc">{t("p1.s2.qual.bsc")}</option>
          </select>
        </Field>
        <Field label={t("p1.s2.inst")} required error={errors.includes("qualInst")} hint={t("err.required")}>
          <input value={data.qualInst || ""} onChange={e => setData({ ...data, qualInst: e.target.value })} placeholder={t("p1.s2.inst.ph")} />
        </Field>
        <div className="rq-row2">
          <Field label={t("p1.s2.year")} required error={errors.includes("qualYear")} hint={t("err.required")}>
            <input value={data.qualYear || ""} onChange={e => setData({ ...data, qualYear: e.target.value })} inputMode="numeric" placeholder="2026" dir="ltr" style={{ textAlign: "start" }} />
          </Field>
          <Field label={t("p1.s2.gpa")}>
            <input value={data.qualGpa || ""} onChange={e => setData({ ...data, qualGpa: e.target.value })} placeholder={t("p1.s2.gpa.ph")} dir="ltr" style={{ textAlign: "start" }} />
          </Field>
        </div>
      </>
    ),
  },
  {
    titleKey: "p1.s3.title", subKey: "p1.s3.sub",
    validate: d => (d.terms ? [] : ["terms"]),
    errToast: "err.agreefirst",
    render: ({ t, data, setData }) => (
      <>
        <div className="rq-terms">
          <h4>{t("p1.s3.t1h")}</h4><p>{t("p1.s3.t1")}</p>
          <h4>{t("p1.s3.t2h")}</h4><p>{t("p1.s3.t2")}</p>
          <h4>{t("p1.s3.t3h")}</h4><p>{t("p1.s3.t3")}</p>
          <h4>{t("p1.s3.t4h")}</h4><p>{t("p1.s3.t4")}</p>
        </div>
        <label className={"rq-agree" + (data.terms ? " on" : "")}>
          <input type="checkbox" checked={!!data.terms} onChange={e => setData({ ...data, terms: e.target.checked })} />
          {t("p1.s3.agree")}
        </label>
      </>
    ),
  },
  {
    titleKey: "p1.s4.title", subKey: "p1.s4.sub",
    validate: d => (d.dependents || []).some(x => !x.name) ? ["depname"] : [],
    render: ({ t, data, setData }) => {
      const deps = data.dependents || [];
      const upd = (i, patch) => setData({ ...data, dependents: deps.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
      return (
        <>
          {deps.length === 0 && <div className="rq-empty">{t("p1.s4.none")}</div>}
          <div className="rq-list">
            {deps.map((dep, i) => (
              <div className="rq-item" key={dep.id} style={{ alignItems: "flex-end" }}>
                <div className="ib2">
                  <Field label={t("p1.s4.name")} required>
                    <input value={dep.name} onChange={e => upd(i, { name: e.target.value })} placeholder={t("p1.s4.name.ph")} />
                  </Field>
                </div>
                <div style={{ minWidth: 130 }}>
                  <Field label={t("p1.s4.relation")}>
                    <select value={dep.relation} onChange={e => upd(i, { relation: e.target.value })}>
                      <option value="spouse">{t("p1.s4.rel.spouse")}</option>
                      <option value="child">{t("p1.s4.rel.child")}</option>
                    </select>
                  </Field>
                </div>
                <div style={{ minWidth: 150 }}>
                  <Field label={t("p1.s4.dob")}>
                    <input type="date" value={dep.dob || ""} onChange={e => upd(i, { dob: e.target.value })} />
                  </Field>
                </div>
                <button className="rq-x" style={{ marginBlockEnd: 16 }} onClick={() => setData({ ...data, dependents: deps.filter((_, j) => j !== i) })}>
                  {t("p1.s4.remove")}
                </button>
              </div>
            ))}
          </div>
          <button className="rq-btn rq-ghost" onClick={() => setData({ ...data, dependents: [...deps, { id: Date.now(), name: "", relation: "spouse", dob: "" }] })}>
            <Icon d={IC.plus} />{t("p1.s4.add")}
          </button>
        </>
      );
    },
  },
];

/* Phase 2 — visas per traveller (dependents reused from Phase 1), then Saudia */
const P2_STEPS = [
  {
    titleKey: "p2.s1.title", subKey: "p2.s1.sub",
    validate: (d, ctx) => {
      const people = ["self", ...(ctx.dependents || []).map(x => "dep" + x.id)];
      return people.filter(pid => {
        const v = (d.visas || {})[pid] || {};
        return !v.passport;
      }).map(pid => "visa-" + pid);
    },
    render: ({ t, data, setData, errors, ctx }) => {
      const people = [
        { pid: "self", label: t("p2.s1.you") + " — " + ctx.userName, defType: "F1" },
        ...(ctx.dependents || []).map(x => ({ pid: "dep" + x.id, label: x.name || t("p1.s4.title"), defType: "F2" })),
      ];
      const visas = data.visas || {};
      const upd = (pid, patch) => setData({ ...data, visas: { ...visas, [pid]: { ...(visas[pid] || {}), ...patch } } });
      return (
        <div className="rq-list">
          {people.map(p => {
            const v = visas[p.pid] || {};
            const mode = v.mode || "needs";
            return (
              <div className="rq-item" key={p.pid} style={{ display: "block" }}>
                <div className="t" style={{ marginBlockEnd: 10 }}>{p.label}</div>
                <div className="rq-row2">
                  <Field label={t("p2.s1.title")}>
                    <select value={mode} onChange={e => upd(p.pid, { mode: e.target.value })}>
                      <option value="needs">{t("p2.s1.needs")}</option>
                      <option value="none">{t("p2.s1.noneed")}</option>
                    </select>
                  </Field>
                  {mode === "needs" ? (
                    <Field label={t("p2.s1.visatype")}>
                      <select value={v.type || p.defType} onChange={e => upd(p.pid, { type: e.target.value })}>
                        <option value="F1">{t("p2.s1.visa.f1")}</option>
                        <option value="F2">{t("p2.s1.visa.f2")}</option>
                        <option value="J1">{t("p2.s1.visa.j1")}</option>
                      </select>
                    </Field>
                  ) : <span />}
                </div>
                <Field label={mode === "needs" ? t("p2.s1.passport") : t("p2.s1.passport2")} required
                  error={errors.includes("visa-" + p.pid)} hint={t("err.required")}>
                  <input value={v.passport || ""} onChange={e => upd(p.pid, { passport: e.target.value })}
                    placeholder={t("p2.s1.passport.ph")} dir="ltr" style={{ textAlign: "start" }} />
                </Field>
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    titleKey: "p2.s2.title", subKey: "p2.s2.sub",
    validate: d => (d.flightConfirmed ? [] : ["flight"]),
    errToast: "err.flightfirst",
    render: ({ t, lang, data, setData, ctx }) => {
      const stage = data.flightStage || "form"; // form → otb → confirmed
      const travellers = [ctx.userName, ...(ctx.dependents || []).map(x => x.name)].filter(Boolean);
      const label = a => (lang === "ar" ? a.ar : a.en);
      const request = () => {
        if (!data.from || !data.to || !data.date) { setData({ ...data, flightErr: true }); return; }
        setData({ ...data, flightErr: false, flightStage: "otb", otb: "OTB-" + Math.floor(100000 + Math.random() * 899999), flightNo: "SV 21" });
      };
      return (
        <>
          <div className="rq-row2">
            <Field label={t("p2.s2.from")} required error={!!data.flightErr && !data.from} hint={t("err.required")}>
              <select value={data.from || ""} onChange={e => setData({ ...data, from: e.target.value })} disabled={stage !== "form"}>
                <option value="" disabled>—</option>
                {AIRPORTS.slice(0, 4).map(a => <option key={a.code} value={a.code}>{label(a)}</option>)}
              </select>
            </Field>
            <Field label={t("p2.s2.to")} required error={!!data.flightErr && !data.to} hint={t("err.required")}>
              <select value={data.to || ""} onChange={e => setData({ ...data, to: e.target.value })} disabled={stage !== "form"}>
                <option value="" disabled>—</option>
                {AIRPORTS.slice(4).map(a => <option key={a.code} value={a.code}>{label(a)}</option>)}
              </select>
            </Field>
          </div>
          <Field label={t("p2.s2.date")} required error={!!data.flightErr && !data.date} hint={t("err.required")}>
            <input type="date" value={data.date || ""} onChange={e => setData({ ...data, date: e.target.value })} disabled={stage !== "form"} />
          </Field>
          <div className="rq-field">
            <label>{t("p2.s2.travellers")}</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {travellers.map((n, i) => <span key={i} className="rq-chip"><Icon d={IC.user} size={13} />{n}</span>)}
            </div>
          </div>
          {stage === "form" && (
            <button className="rq-btn rq-primary" onClick={request}><Icon d={IC.plane} />{t("p2.s2.request")}</button>
          )}
          {stage === "otb" && (
            <div className="rq-item" style={{ display: "block" }}>
              <div className="t" style={{ color: "var(--accent)", display: "flex", gap: 8, alignItems: "center" }}>
                <Icon d={IC.check} />{t("p2.s2.route.ok", { otb: data.otb })}
              </div>
              <div className="d" style={{ marginBlock: "8px 12px" }}>
                {t("p2.s2.itinerary")} — {t("p2.s2.flightno")} <span className="mono" dir="ltr">{data.flightNo} · {data.from} → {data.to}</span>
              </div>
              <button className="rq-btn rq-primary" onClick={() => setData({ ...data, flightStage: "confirmed", flightConfirmed: true })}>
                <Icon d={IC.check} />{t("p2.s2.confirm")}
              </button>
            </div>
          )}
          {stage === "confirmed" && (
            <div className="rq-item" style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}>
              <Icon d={IC.lock} size={17} />
              <div className="ib2"><div className="t">{t("p2.s2.confirmed")}</div>
                <div className="d mono" dir="ltr">{data.flightNo} · {data.from} → {data.to} · {data.otb}</div></div>
            </div>
          )}
        </>
      );
    },
  },
];

/* Phase 3 — address → bank → semester/courses/docs → university guarantee */
const P3_STEPS = [
  {
    titleKey: "p3.s1.title", subKey: "p3.s1.sub",
    validate: d => { const e = []; if (!d.addr) e.push("addr"); if (!d.phone) e.push("phone"); return e; },
    render: ({ t, data, setData, errors }) => (
      <>
        <Field label={t("p3.s1.addr")} required error={errors.includes("addr")} hint={t("err.required")}>
          <input value={data.addr || ""} onChange={e => setData({ ...data, addr: e.target.value })} placeholder={t("p3.s1.addr.ph")} />
        </Field>
        <Field label={t("p3.s1.phone")} required error={errors.includes("phone")} hint={t("err.required")}>
          <input value={data.phone || ""} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="+1 …" dir="ltr" style={{ textAlign: "start" }} inputMode="tel" />
        </Field>
        <div className="rq-row2">
          <Field label={t("p3.s1.emname")}>
            <input value={data.emName || ""} onChange={e => setData({ ...data, emName: e.target.value })} />
          </Field>
          <Field label={t("p3.s1.emphone")}>
            <input value={data.emPhone || ""} onChange={e => setData({ ...data, emPhone: e.target.value })} dir="ltr" style={{ textAlign: "start" }} inputMode="tel" />
          </Field>
        </div>
      </>
    ),
  },
  {
    titleKey: "p3.s2.title", subKey: "p3.s2.sub",
    validate: d => {
      const e = []; if (!d.bankName) e.push("bankName");
      const c = BANK_COUNTRIES.find(x => x.code === (d.bankCountry || "US"));
      if (c.scheme === "US") { if (!/^\d{9}$/.test(d.routing || "")) e.push("routing"); if (!d.acct) e.push("acct"); }
      else if (c.scheme === "IBAN") { if (!d.iban || d.iban.replace(/\s/g, "").length < 10) e.push("iban"); }
      else { if (!d.acct) e.push("acct"); }
      return e;
    },
    render: ({ t, lang, data, setData, errors }) => {
      const cc = data.bankCountry || "US";
      const scheme = BANK_COUNTRIES.find(x => x.code === cc).scheme;
      return (
        <>
          <Field label={t("p3.s2.country")}>
            {/* value = stable ISO code; label = translated (handoff rule 4) */}
            <select value={cc} onChange={e => setData({ ...data, bankCountry: e.target.value })}>
              {BANK_COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === "ar" ? c.ar : c.en}</option>)}
            </select>
          </Field>
          <Field label={t("p3.s2.bank")} required error={errors.includes("bankName")} hint={t("err.required")}>
            <input value={data.bankName || ""} onChange={e => setData({ ...data, bankName: e.target.value })} placeholder={t("p3.s2.bank.ph")} />
          </Field>
          {scheme === "US" && (
            <div className="rq-row2">
              <Field label={t("p3.s2.routing")} required error={errors.includes("routing")} hint={t("err.required")}>
                <input value={data.routing || ""} onChange={e => setData({ ...data, routing: e.target.value })} placeholder={t("p3.s2.routing.ph")} inputMode="numeric" dir="ltr" style={{ textAlign: "start" }} />
              </Field>
              <Field label={t("p3.s2.acct")} required error={errors.includes("acct")} hint={t("err.required")}>
                <input value={data.acct || ""} onChange={e => setData({ ...data, acct: e.target.value })} dir="ltr" style={{ textAlign: "start" }} />
              </Field>
            </div>
          )}
          {scheme === "IBAN" && (
            <Field label={t("p3.s2.iban")} required error={errors.includes("iban")} hint={t("err.required")}>
              <input value={data.iban || ""} onChange={e => setData({ ...data, iban: e.target.value })} placeholder="GB29 NWBK 6016 1331 9268 19" dir="ltr" style={{ textAlign: "start" }} />
            </Field>
          )}
          {scheme === "OTHER" && (
            <Field label={t("p3.s2.acct")} required error={errors.includes("acct")} hint={t("err.required")}>
              <input value={data.acct || ""} onChange={e => setData({ ...data, acct: e.target.value })} dir="ltr" style={{ textAlign: "start" }} />
            </Field>
          )}
        </>
      );
    },
  },
  {
    titleKey: "p3.s3.title", subKey: "p3.s3.sub",
    validate: d => {
      const e = [];
      if (!d.semYear) e.push("semYear"); if (!d.semStart) e.push("semStart"); if (!d.semEnd) e.push("semEnd");
      if (!(d.courses || []).length || (d.courses || []).some(c => !c.name)) e.push("courses");
      return e;
    },
    render: ({ t, lang, data, setData, errors }) => {
      const courses = data.courses || [];
      const updC = (i, patch) => setData({ ...data, courses: courses.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
      const docs = data.docs || {};
      const docDefs = [
        { id: "reg", key: "p3.s3.doc.reg" }, { id: "adm", key: "p3.s3.doc.adm" }, { id: "plan", key: "p3.s3.doc.plan" },
      ];
      return (
        <>
          {/* 1 · semester first */}
          <div className="rq-row2">
            <Field label={t("p3.s3.term")}>
              <select value={data.semTerm || "fall"} onChange={e => setData({ ...data, semTerm: e.target.value })}>
                <option value="fall">{t("p3.s3.term.fall")}</option>
                <option value="spring">{t("p3.s3.term.spring")}</option>
                <option value="summer">{t("p3.s3.term.summer")}</option>
              </select>
            </Field>
            <Field label={t("p3.s3.year")} required error={errors.includes("semYear")} hint={t("err.required")}>
              <input value={data.semYear || ""} onChange={e => setData({ ...data, semYear: e.target.value })} placeholder="2026" inputMode="numeric" dir="ltr" style={{ textAlign: "start" }} />
            </Field>
          </div>
          <div className="rq-row2">
            <Field label={t("p3.s3.start")} required error={errors.includes("semStart")} hint={t("err.required")}>
              <input type="date" value={data.semStart || ""} onChange={e => setData({ ...data, semStart: e.target.value })} />
            </Field>
            <Field label={t("p3.s3.end")} required error={errors.includes("semEnd")} hint={t("err.required")}>
              <input type="date" value={data.semEnd || ""} onChange={e => setData({ ...data, semEnd: e.target.value })} />
            </Field>
          </div>
          {/* 2 · then courses */}
          <div className="rq-field"><label>{t("p3.s3.courses")}{errors.includes("courses") && <span className="req"> — {t("err.required")}</span>}</label></div>
          <div className="rq-list">
            {courses.map((c, i) => (
              <div className="rq-item" key={c.id} style={{ alignItems: "flex-end" }}>
                <div className="ib2"><Field label={t("p3.s3.course.name")} required>
                  <input value={c.name} onChange={e => updC(i, { name: e.target.value })} /></Field></div>
                <div style={{ width: 130 }}><Field label={t("p3.s3.course.code")}>
                  <input value={c.code || ""} onChange={e => updC(i, { code: e.target.value })} placeholder="CS-UY 101" dir="ltr" style={{ textAlign: "start" }} /></Field></div>
                <div style={{ width: 90 }}><Field label={t("p3.s3.course.credits")}>
                  <input value={c.credits || ""} onChange={e => updC(i, { credits: e.target.value })} inputMode="numeric" dir="ltr" style={{ textAlign: "start" }} /></Field></div>
                <button className="rq-x" style={{ marginBlockEnd: 16 }} onClick={() => setData({ ...data, courses: courses.filter((_, j) => j !== i) })}>{t("p1.s4.remove")}</button>
              </div>
            ))}
          </div>
          <button className="rq-btn rq-ghost" style={{ marginBlockEnd: 22 }} onClick={() => setData({ ...data, courses: [...courses, { id: Date.now(), name: "", code: "", credits: "" }] })}>
            <Icon d={IC.plus} />{t("p3.s3.course.add")}
          </button>
          {/* 3 · then documents */}
          <div className="rq-field"><label>{t("p3.s3.docs")}</label></div>
          <div className="rq-list">
            {docDefs.map(dd => (
              <div className="rq-item" key={dd.id}>
                <Icon d={IC.doc} size={17} />
                <div className="ib2"><div className="t">{t(dd.key)}</div>
                  {docs[dd.id] && <div className="d mono" dir="ltr">{docs[dd.id]}</div>}</div>
                {docs[dd.id]
                  ? <Pill tone="green">{t("p3.s3.doc.attached")}</Pill>
                  : <label className="rq-btn rq-ghost" style={{ padding: "8px 14px", fontSize: 13.5 }}>
                      <Icon d={IC.paperclip} size={15} />{t("p3.s3.doc.attach")}
                      <input type="file" style={{ display: "none" }}
                        onChange={e => e.target.files[0] && setData({ ...data, docs: { ...docs, [dd.id]: e.target.files[0].name } })} />
                    </label>}
              </div>
            ))}
          </div>
        </>
      );
    },
  },
  {
    titleKey: "p3.s4.title", subKey: "p3.s4.sub",
    validate: d => (d.guaranteeSent ? [] : ["gs"]),
    errToast: "err.confirmfirst",
    render: ({ t, data, setData, ctx }) => (
      <>
        <div className="rq-item" style={{ marginBlockEnd: 14 }}>
          <Icon d={IC.seal} size={20} />
          <div className="ib2"><div className="t">{t("fg.ready.title")}</div><div className="d">{t("fg.note")}</div></div>
          <button className="rq-btn rq-ghost" style={{ padding: "8px 14px", fontSize: 13.5 }} onClick={ctx.openGuarantee}>{t("fg.view")}</button>
        </div>
        <label className={"rq-agree" + (data.guaranteeSent ? " on" : "")}>
          <input type="checkbox" checked={!!data.guaranteeSent} onChange={e => setData({ ...data, guaranteeSent: e.target.checked })} />
          {t("p3.s4.sent")}
        </label>
      </>
    ),
  },
];

const PHASES = [
  { id: "p1", nameKey: "phase.1.name", whereKey: "phase.1.where", icon: IC.doc, steps: P1_STEPS },
  { id: "p2", nameKey: "phase.2.name", whereKey: "phase.2.where", icon: IC.plane, steps: P2_STEPS },
  { id: "p3", nameKey: "phase.3.name", whereKey: "phase.3.where", icon: IC.cap, steps: P3_STEPS },
];

/* ============ 11 · Phase wizard screen ============ */
function PhaseWizard({ t, lang, phase, phaseData, setPhaseData, status, onSubmit, onApprove, onHome, toast, ctx }) {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState([]);
  const steps = phase.steps;
  const cur = steps[step];

  useEffect(() => { setStep(0); setMaxReached(0); setErrors([]); }, [phase.id]);

  if (status === "submitted" || status === "approved") {
    const ok = status === "approved";
    return (
      <div className="rq-card rq-review rq-rise" role="status">
        <div className={"ri" + (ok ? "" : "")} style={ok ? { background: "var(--accent-soft)", color: "var(--accent)" } : undefined}>
          <Icon d={ok ? IC.check : IC.clock} size={29} />
        </div>
        <h2>{ok ? t("phase.status.approved") : t("phase.submitted.title")}</h2>
        <p>{ok ? "" : t("phase.submitted.body")}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="rq-btn rq-ghost" onClick={onHome}><Icon d={IC.back} dir />{t("phase.backhome")}</button>
          {!ok && <button className="rq-btn rq-primary" onClick={onApprove}><Icon d={IC.seal} />{t("phase.simulate")}</button>}
        </div>
        {!ok && <div className="rq-sim">{t("brand.disclaimer")}</div>}
      </div>
    );
  }

  const goNext = () => {
    const errs = cur.validate(phaseData, ctx);
    setErrors(errs);
    if (errs.length) { toast(t(cur.errToast || "err.check")); return; }
    if (step === steps.length - 1) { onSubmit(); return; }
    const nx = step + 1;
    setStep(nx); setMaxReached(Math.max(maxReached, nx)); setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rq-rise">
      <button className="rq-btn rq-ghost" style={{ marginBlockEnd: 16, padding: "8px 15px", fontSize: 13.5 }} onClick={onHome}>
        <Icon d={IC.back} dir size={15} />{t("phase.backhome")}
      </button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBlockEnd: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24 }}>{t(phase.nameKey)}</h1>
        <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>
          {t("phase.step", { n: num(step + 1, lang), total: num(steps.length, lang) })}
        </span>
      </div>
      <Chevrons steps={steps} current={step} maxReached={maxReached} lang={lang} t={t}
        onGo={i => { setStep(i); setErrors([]); }} />
      <div className="rq-card rq-panel">
        <h2>{t(cur.titleKey)}</h2>
        <p className="sub">{t(cur.subKey)}</p>
        {cur.render({ t, lang, data: phaseData, setData: setPhaseData, errors, ctx })}
        <WizardNav t={t} isFirst={step === 0} isLast={step === steps.length - 1}
          onBack={() => { setStep(step - 1); setErrors([]); }}
          onSave={() => toast(t("phase.saved"))}
          onNext={goNext} />
      </div>
    </div>
  );
}

/* ============ 12 · Home ============ */
function Home({ t, lang, statuses, phaseProgress, onOpenPhase, guaranteeReady, openGuarantee, allDone }) {
  return (
    <div className="rq-rise">
      <div className="rq-hero">
        <svg className="leafbg" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 34 C14 14, 30 8, 42 10 C34 14, 24 18, 18 34 Z" fill="var(--accent)" />
        </svg>
        <div className="eyebrow">{t("home.congrats.eyebrow")}</div>
        <h1>{allDone ? t("home.done.title") : t("home.congrats.title", { name: user.first[lang] })}</h1>
        <p>{allDone ? t("home.done.body") : t("home.congrats.body")}</p>
        <div className="rq-meta">
          <span className="rq-chip"><Icon d={IC.seal} size={14} />{user.program[lang]}</span>
          <span className="rq-chip"><Icon d={IC.cap} size={14} />{user.university[lang]}</span>
          <span className="rq-chip"><Icon d={IC.doc} size={14} />{user.degree[lang]}</span>
          <span className="rq-chip"><Icon d={IC.clock} size={14} />{user.startTerm[lang]}</span>
        </div>
      </div>

      {guaranteeReady && !allDone && (
        <div className="rq-card rq-phase rq-rise" style={{ marginBlockStart: 16, borderColor: "var(--accent)" }}>
          <div className="pnum" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Icon d={IC.seal} size={23} /></div>
          <div className="pb">
            <h3>{t("fg.ready.title")}</h3>
            <div className="pw">{t("fg.ready.body")}</div>
          </div>
          <button className="rq-btn rq-ghost" onClick={openGuarantee}>{t("fg.view")}</button>
        </div>
      )}

      <div style={{ marginBlockStart: 26 }}>
        <h2 style={{ fontSize: 19 }}>{t("home.journey.title")}</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBlockStart: 3 }}>{t("home.journey.sub")}</p>
        <div className="rq-phases">
          {PHASES.map((ph, i) => {
            const st = statuses[ph.id];
            const locked = st === "locked";
            const pill = st === "approved" ? <Pill tone="green">{t("phase.status.approved")}</Pill>
              : st === "submitted" ? <Pill tone="amber">{t("phase.status.submitted")}</Pill>
              : locked ? <Pill tone="gray">{t("phase.status.locked")}</Pill>
              : <Pill tone="amber">{t("phase.status.inprogress")}</Pill>;
            const btnLabel = st === "in_progress" ? (phaseProgress[ph.id] > 0 ? t("home.continue") : t("home.start"))
              : st === "approved" ? t("home.review") : t("home.review");
            return (
              <div key={ph.id} className={"rq-card rq-phase " + st}>
                <div className="pnum">{st === "approved" ? <Icon d={IC.check} size={22} /> : locked ? <Icon d={IC.lock} size={20} /> : num(i + 1, lang)}</div>
                <div className="pb">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 9 }}>{t(ph.nameKey)} {pill}</h3>
                  <div className="pw">{t(ph.whereKey)}</div>
                  {!locked && st !== "approved" && (
                    <div className="rq-progress"><i style={{ width: (phaseProgress[ph.id] || 0) + "%" }} /></div>
                  )}
                </div>
                {locked
                  ? <span style={{ fontSize: 12.5, color: "var(--ink-faint)", maxWidth: 170 }}>{t("home.locked")}</span>
                  : <button className={"rq-btn " + (st === "in_progress" ? "rq-primary" : "rq-ghost")} onClick={() => onOpenPhase(ph.id)}>
                      {btnLabel}<Icon d={IC.next} dir size={15} />
                    </button>}
              </div>
            );
          })}
        </div>
      </div>
      <p className="rq-disc" style={{ marginBlockStart: 30 }}>{t("brand.disclaimer")}</p>
    </div>
  );
}

/* ============ 13 · Drawer ============ */
function Drawer({ t, lang, setLang, theme, setTheme, onClose, onHome, onSignOut, onReset }) {
  return (
    <>
      <div className="rq-scrim" onClick={onClose} />
      <nav className="rq-drawer" aria-label={t("chrome.menu")}>
        <div className="dh"><Mark size={30} /><b style={{ fontSize: 18 }}>{t("brand.name")}</b>
          <button onClick={onClose} style={{ marginInlineStart: "auto", fontSize: 22, color: "var(--ink-faint)", lineHeight: 1 }} aria-label={t("chrome.close")}>×</button></div>
        <button className="rq-ditem" onClick={() => { onHome(); onClose(); }}><Icon d={IC.home2} />{t("chrome.home")}</button>
        <div className="rq-dlabel">{t("chrome.language")}</div>
        <div className="rq-seg">
          <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>العربية</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
        </div>
        <div className="rq-dlabel">{t("chrome.theme")}</div>
        <div className="rq-seg">
          <button className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>{t("chrome.theme.dark")}</button>
          <button className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>{t("chrome.theme.light")}</button>
        </div>
        <div style={{ marginBlockStart: "auto", paddingBlockStart: 14, borderBlockStart: "1px solid var(--line-soft)" }}>
          <button className="rq-ditem" onClick={onReset}><Icon d={IC.reset} />{t("chrome.reset")}</button>
          <button className="rq-ditem" style={{ color: "var(--red)" }} onClick={onSignOut}><Icon d={IC.out} />{t("chrome.signout")}</button>
        </div>
      </nav>
    </>
  );
}

/* ============ 14 · App root ============ */
/* ============ registration — ID+Nafath, then credentials. Scholarship is ASSIGNED. ============ */
const capChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const newCapCode = () => Array.from({ length: 5 }, () => capChars[Math.floor(Math.random() * capChars.length)]).join("");
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* The award already exists in the system before the student signs in — exactly like
   Safeer2, where the program issues it and the portal only reveals it. The degree
   decides the track, and \u0627\u0644\u0631\u0648\u0627\u062f draws only from the approved ranked universities. */
function assignAward() {
  const uni = pick(UNIS);
  const deg = pick(DEGREES);
  const maj = pick(MAJORS);
  const term = pick(TERMS);
  const prog = pick(PROGRAMS[deg.lvl]);
  const cur = CURRENCY[uni.c];
  const ctry = COUNTRY[uni.c];
  return {
    award_sar: AWARD_SAR,
    currency: cur.code,
    country: { ar: ctry.ar, en: ctry.en },
    program: { ar: prog.ar, en: prog.en },
    track: prog.key,
    university: { ar: uni.ar, en: uni.en },
    uni_rank: uni.r,
    degree: { ar: deg.ar, en: deg.en },
    major: { ar: maj.ar, en: maj.en },
    startTerm: { ar: term.ar, en: term.en },
  };
}

function Register({ t, lang, onDone, onCancel }) {
  const ar = lang === "ar";
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(newCapCode);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState({});
  const [award, setAward] = useState(null);
  const [f, setF] = useState({ national_id: "", cap: "", nameAr: "", nameEn: "", email: "", pw: "", pw2: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const STEPS = ar ? ["\u0627\u0644\u0647\u0648\u064a\u0629", "\u0627\u0644\u062d\u0633\u0627\u0628"] : ["Identity", "Account"];

  /* step 1 — ID + captcha, verified through Nafath */
  const verify = () => {
    const e = {};
    if (!/^\d{10}$/.test(f.national_id.trim())) e.id = true;
    if (f.cap !== code) e.cap = true;
    setErr(e);
    if (Object.keys(e).length) { setCode(newCapCode()); setF((p) => ({ ...p, cap: "" })); return; }
    setVerifying(true);
    setTimeout(() => { setAward(assignAward()); setVerifying(false); setStep(2); }, 1100);
  };

  /* step 2 — the only things we actually ask a person for */
  const submit = async () => {
    const e = {};
    if (!f.nameAr.trim()) e.nameAr = true;
    if (!f.nameEn.trim()) e.nameEn = true;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.email.trim())) e.email = true;
    if (f.pw.length < 8) e.pw = true;
    if (f.pw !== f.pw2 || !f.pw2) e.pw2 = true;
    setErr(e);
    if (Object.keys(e).length) return;
    const first = (v) => (v.trim().split(/\s+/)[0] || v);
    const user = {
      national_id: f.national_id.trim(), pin: f.pw,
      name: { ar: f.nameAr.trim(), en: f.nameEn.trim() },
      first: { ar: first(f.nameAr), en: first(f.nameEn) },
      email: f.email.trim(),
      ...award,
      external: { ...EXTERNAL_STUB, nafathVerified: true },
    };
    const saved = await userStore.register(user);
    setStep(3);
    setTimeout(() => onDone(saved), 1200);
  };

  return (
    <div className="rq-auth">
      <div className="rq-card rq-auth-card rq-rise rq-reg">
        <div className="rq-auth-brand"><Mark size={40} /></div>

        
        {step === 1 && (<>
          <h2 className="rq-reg-h">{ar ? "\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643" : "Verify your identity"}</h2>
          <p className="rq-reg-sub">{ar
            ? "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0648\u064a\u062a\u0643 \u0648\u0633\u064a\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0639\u0628\u0631 \u0646\u0641\u0627\u0630 \u2014 \u062b\u0645 \u0646\u0639\u0631\u0636 \u0639\u0644\u064a\u0643 \u0628\u0639\u062b\u062a\u0643."
            : "Enter your ID and we'll verify it through Nafath \u2014 then we'll show you the award on file."}</p>

          <label className="rq-f">{ar ? "\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064a\u0629" : "ID number"}
            <input className={err.id ? "err" : ""} value={f.national_id} onChange={set("national_id")}
              dir="ltr" inputMode="numeric" maxLength={10} placeholder="1102345678" />
            {err.id && <span className="rq-fe">{ar ? "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0647\u0648\u064a\u0629 \u0645\u0643\u0648\u0651\u0646\u064b\u0627 \u0645\u0646 \u0661\u0660 \u0623\u0631\u0642\u0627\u0645" : "Enter a valid 10-digit ID number"}</span>}
          </label>

          <label className="rq-f">{ar ? "\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642" : "Verification code"}
            <div className="rq-captcha">
              <div className="cap-box">
                <button className="refresh" onClick={() => setCode(newCapCode())} aria-label="New code"><Icon d={IC.refresh} size={15} /></button>
                <span className="cap-code">{code}</span>
              </div>
              <input className={err.cap ? "err" : ""} value={f.cap} onChange={set("cap")} dir="ltr" autoComplete="off"
                placeholder={ar ? "\u0627\u0643\u062a\u0628 \u0627\u0644\u0631\u0645\u0632" : "Type the code"} />
            </div>
            {err.cap && <span className="rq-fe">{ar ? "\u0627\u0644\u0631\u0645\u0632 \u063a\u064a\u0631 \u0645\u0637\u0627\u0628\u0642" : "Code doesn't match"}</span>}
          </label>

          <button className="rq-nafath" onClick={verify} disabled={verifying}>
<span className="nf">{"\u0646\u0641\u0627\u0630"}</span>            {verifying ? (ar ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642\u2026" : "Verifying\u2026") : (ar ? "\u062a\u062d\u0642\u0651\u0642 \u0639\u0628\u0631 \u0646\u0641\u0627\u0630" : "Verify with Nafath")}
          </button>
          <p className="rq-stub-note" style={{ textAlign: "center" }}>
            {ar ? "\u0645\u062d\u0627\u0643\u0627\u0629 \u2014 \u063a\u064a\u0631 \u0645\u0631\u0628\u0648\u0637 \u0628\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0645\u0648\u062d\u062f\u0629 \u0627\u0644\u0641\u0639\u0644\u064a\u0629."
                : "Simulated \u2014 not connected to the real Unified SSO."}
          </p>
          <div className="rq-reg-actions">
            <button className="rq-btn rq-ghost" onClick={onCancel}>{ar ? "\u0631\u062c\u0648\u0639" : "Back"}</button>
          </div>
        </>)}

        {step === 2 && (<>
          <h2 className="rq-reg-h">{ar ? "\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643" : "Create your account"}</h2>
          <p className="rq-reg-sub">{ar
            ? "\u062a\u0645\u0651 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0647\u0648\u064a\u062a\u0643. \u0647\u0630\u0647 \u0628\u0639\u062b\u062a\u0643 \u0627\u0644\u0645\u0633\u062c\u0651\u0644\u0629 \u0645\u0633\u0628\u0642\u064b\u0627 \u2014 \u0644\u0627 \u062a\u064f\u062f\u062e\u0644 \u064a\u062f\u0648\u064a\u064b\u0627."
            : "Identity verified. This is the award already on file for you \u2014 it isn't something you enter."}</p>

          {award && (
            <div className="rq-award-box">
              <div className="rq-award-badge">{ar ? "\u0635\u0627\u062f\u0631 \u0645\u0646 \u0628\u0631\u0646\u0627\u0645\u062c\u0643" : "Issued by your program"}</div>
              <div className="rq-award-grid">
                <div><span>{ar ? "\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c" : "Program"}</span><b>{award.program[lang]}</b></div>
                <div><span>{ar ? "\u0627\u0644\u062c\u0627\u0645\u0639\u0629" : "University"}</span><b>{award.university[lang]}{award.track === "ruwad" && <em className="rq-rank">{ar ? "\u0627\u0644\u062a\u0631\u062a\u064a\u0628 " : "Rank "}{award.uni_rank}</em>}</b></div><div><span>{ar ? "\u0627\u0644\u062f\u0648\u0644\u0629" : "Country"}</span><b>{award.country[lang]}</b></div>
                <div><span>{ar ? "\u0627\u0644\u062f\u0631\u062c\u0629 \u0648\u0627\u0644\u062a\u062e\u0635\u0635" : "Degree & major"}</span><b>{award.degree[lang]} \u00b7 {award.major[lang]}</b></div>
                <div><span>{ar ? "\u0641\u0635\u0644 \u0627\u0644\u0628\u062f\u0627\u064a\u0629" : "Start term"}</span><b>{award.degree[lang]} · {award.major[lang]}</b></div>
                <div className="wide"><span>{ar ? "\u0627\u0644\u0645\u062e\u0635\u0635 \u0627\u0644\u0634\u0647\u0631\u064a" : "Monthly stipend"}</span><b className="mono" dir="ltr">{awardBoth(award)}</b></div>
              </div>
            </div>
          )}

          <div className="rq-reg-grid">
            <label>{ar ? "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "Full name (Arabic)"}
              <input className={err.nameAr ? "err" : ""} value={f.nameAr} onChange={set("nameAr")} dir="rtl" /></label>
            <label>{ar ? "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629" : "Full name (English)"}
              <input className={err.nameEn ? "err" : ""} value={f.nameEn} onChange={set("nameEn")} dir="ltr" /></label>
            <label className="wide">{ar ? "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" : "Email"}
              <input className={err.email ? "err" : ""} value={f.email} onChange={set("email")} dir="ltr" placeholder="you@nyu.edu" /></label>
            <label>{ar ? "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" : "Password"}
              <input className={err.pw ? "err" : ""} type="password" value={f.pw} onChange={set("pw")} dir="ltr"
                placeholder={ar ? "\u0668 \u0623\u062d\u0631\u0641 \u0641\u0623\u0643\u062b\u0631" : "Min. 8 characters"} /></label>
            <label>{ar ? "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" : "Confirm password"}
              <input className={err.pw2 ? "err" : ""} type="password" value={f.pw2} onChange={set("pw2")} dir="ltr" /></label>
          </div>
          {(err.pw || err.pw2 || err.email) && (
            <div className="rq-auth-err">
              {err.email ? (ar ? "\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u064b\u0627 \u0635\u062d\u064a\u062d\u064b\u0627. " : "Enter a valid email. ") : ""}
              {err.pw ? (ar ? "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0668 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644. " : "Password must be 8+ characters. ") : ""}
              {err.pw2 ? (ar ? "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646." : "Passwords don't match.") : ""}
            </div>
          )}
          <div className="rq-reg-actions">
            <button className="rq-btn rq-ghost" onClick={() => setStep(1)}>{ar ? "\u0631\u062c\u0648\u0639" : "Back"}</button>
            <button className="rq-btn rq-primary" onClick={submit}>{ar ? "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628" : "Create account"}</button>
          </div>
        </>)}

        {step === 3 && (
          <div className="rq-survey-done">
            <div className="rq-survey-check"><Icon d={IC.check} size={30} /></div>
            <h2>{ar ? "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628" : "Account created"}</h2>
            <p className="rq-reg-sub">{ar ? "\u0644\u0646\u0628\u062f\u0623 \u0625\u0639\u062f\u0627\u062f \u0627\u0628\u062a\u0639\u0627\u062b\u0643\u2026" : "Let's set up your scholarship\u2026"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RafeeqApp() {
  const [lang, setLangState] = useState(() => storage.get("lang", "ar"));
  const [theme, setThemeState] = useState(() => storage.get("theme", "dark"));
  const setLang = l => { setLangState(l); storage.set("lang", l); };
  const setTheme = th => { setThemeState(th); storage.set("theme", th); };
  const t = useMemo(() => makeT(lang), [lang]);

  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState(DEMO_USER);
  const [authView, setAuthView] = useState("login");
  const [screen, setScreen] = useState("home"); // home | p1 | p2 | p3
  const [statuses, setStatuses] = useState({ p1: "in_progress", p2: "locked", p3: "locked" });
  const [data, setData] = useState({ p1: {}, p2: {}, p3: {} });
  const [drawer, setDrawer] = useState(false);
  const [guarantee, setGuarantee] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const toast = useCallback(m => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const setPhaseData = pid => updater =>
    setData(d => ({ ...d, [pid]: typeof updater === "function" ? updater(d[pid]) : updater }));

  /* rough per-phase progress for the home cards */
  const phaseProgress = useMemo(() => {
    const pct = {};
    pct.p1 = ((data.p1.confirmed ? 1 : 0) + (data.p1.qualInst ? 1 : 0) + (data.p1.terms ? 1 : 0)) / 4 * 100 + ((data.p1.dependents?.length ? 1 : 0) / 4 * 100);
    pct.p2 = ((Object.keys(data.p2.visas || {}).length ? 1 : 0) + (data.p2.flightConfirmed ? 1 : 0)) / 2 * 100;
    pct.p3 = ((data.p3.addr ? 1 : 0) + (data.p3.bankName ? 1 : 0) + (data.p3.courses?.length ? 1 : 0) + (data.p3.guaranteeSent ? 1 : 0)) / 4 * 100;
    return pct;
  }, [data]);

  const submitPhase = pid => {
    setStatuses(s => ({ ...s, [pid]: "submitted" }));
    toast(t("toast.submitted"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const approvePhase = pid => {
    const order = ["p1", "p2", "p3"];
    const i = order.indexOf(pid);
    setStatuses(s => {
      const nx = { ...s, [pid]: "approved" };
      if (order[i + 1] && nx[order[i + 1]] === "locked") nx[order[i + 1]] = "in_progress";
      return nx;
    });
    toast(t("phase.approved.toast", { n: num(i + 1, lang) }));
    setConfetti(true); setTimeout(() => setConfetti(false), 3600);
    setScreen("home");
  };
  const resetDemo = () => {
    setStatuses({ p1: "in_progress", p2: "locked", p3: "locked" });
    setData({ p1: {}, p2: {}, p3: {} });
    setScreen("home"); setDrawer(false);
    toast(t("toast.reset"));
  };

  const allDone = statuses.p3 === "approved";
  const guaranteeReady = statuses.p1 === "approved";
  const curPhase = PHASES.find(p => p.id === screen);
  const wizardCtx = {
    userName: user.name[lang],
    dependents: data.p1.dependents || [],
    openGuarantee: () => setGuarantee(true),
  };

  return (
    <div className="rafeeq" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} data-theme={theme}>
      <style>{CSS}</style>
      {!signedIn ? (
        authView === "register" ? (
          <Register t={t} lang={lang}
            onCancel={() => setAuthView("login")}
            onDone={(u) => { setUser(u); setSignedIn(true); toast(t("toast.welcome")); setConfetti(true); setTimeout(() => setConfetti(false), 3600); }} />
        ) :
        <Login t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
          onRegister={() => setAuthView("register")}
          onSignIn={(u) => { setUser(u || DEMO_USER); setSignedIn(true); toast(t("toast.welcome")); setConfetti(true); setTimeout(() => setConfetti(false), 3600); }} />
      ) : (
        <>
          <header className="rq-topbar">
            <button className="rq-burger" onClick={() => setDrawer(true)} aria-label={t("chrome.menu")}><Icon d={IC.menu} /></button>
            <div className="rq-who">
              <div className="rq-avatar">{user.first[lang][0]}</div>
              <div className="nm">{user.name[lang]}<small>{user.university[lang]}</small></div>
            </div>
            <div className="rq-logo">
              <div className="wm" style={{ textAlign: "end" }}>{t("brand.name")}<small>Rafeeq</small></div>
              <Mark size={38} />
            </div>
          </header>
          <main className="rq-content">
            {screen === "home" ? (
              <Home t={t} lang={lang} statuses={statuses} phaseProgress={phaseProgress}
                onOpenPhase={pid => setScreen(pid)} guaranteeReady={guaranteeReady}
                openGuarantee={() => setGuarantee(true)} allDone={allDone} />
            ) : curPhase && (
              <PhaseWizard t={t} lang={lang} phase={curPhase}
                phaseData={data[curPhase.id]} setPhaseData={setPhaseData(curPhase.id)}
                status={statuses[curPhase.id]}
                onSubmit={() => submitPhase(curPhase.id)}
                onApprove={() => approvePhase(curPhase.id)}
                onHome={() => setScreen("home")}
                toast={toast} ctx={wizardCtx} />
            )}
          </main>
          {drawer && <Drawer t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
            onClose={() => setDrawer(false)} onHome={() => setScreen("home")}
            onSignOut={() => { userStore.endSession(); setUser(DEMO_USER); setSignedIn(false); setDrawer(false); }} onReset={resetDemo} />}
        </>
      )}
      {guarantee && <GuaranteeModal t={t} onClose={() => setGuarantee(false)} />}
      {confetti && <Confetti />}


           <a className="rq-return" href={`#/${lang}`} onClick={() => userStore.endSession()}
         aria-label={lang === "ar" ? "العودة لباقي الأعمال" : "Return to portfolio"}>
        <span>{lang === "ar" ? "العودة لباقي الأعمال" : "Return to portfolio"}</span>
        <img src="images/logowhite.png" alt="" />
      </a>
      <div className={"rq-toast" + (toastMsg ? " show" : "")} role="status">{toastMsg}</div>
    </div>
  );
}
