import { UNI_AIRPORTS, aptByCode } from "../data/airports.js";

export function reviewRoute(toIata, user, lang) {
  const uni = ((user.university && user.university.en) || "").toLowerCase();
  const known = Object.keys(UNI_AIRPORTS).find(k => uni.includes(k));
  const ap = aptByCode(toIata);
  const uniName = (user.university && user.university[lang]) || "";
  if (known) {
    const ok = UNI_AIRPORTS[known].includes(toIata);
    return { ok, reason: ok
      ? (lang === "ar" ? `${toIata} من المطارات الرئيسية التي تخدم ${uniName}.` : `${toIata} is a primary airport serving ${uniName}.`)
      : (lang === "ar" ? `${toIata} (${ap ? ap.c : "\u2014"}) ليس مطارًا معتادًا لـ${uniName} — يحتاج المسار مراجعة يدوية.`
                       : `${toIata} (${ap ? ap.c : "\u2014"}) isn't a standard airport for ${uniName} — a reviewer needs to confirm the routing.`) };
  }
  const ctry = (user.country && user.country.en) || "";
  const ok = !!(ap && ctry && ap.k === ctry);
  return { ok, reason: ok
    ? (lang === "ar" ? `${toIata} يقع في بلد دراستك (${(user.country || {})[lang] || ""}).` : `${toIata} is in your country of study (${ctry}).`)
    : (lang === "ar" ? `${toIata} قد لا يطابق موقع دراستك — سيُحال إلى مراجع.` : `${toIata} may not match your study location — sending to a reviewer.`) };
}
