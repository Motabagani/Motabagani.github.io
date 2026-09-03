import { CURRENCY, COUNTRY, AWARD_SAR } from "../data/domain.js";

/* Stipend maths — the demo award in SAR converted to the local currency. */
export const money = (n, cur) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + cur;
export const awardSAR = (u) => money((u && u.award_sar) || AWARD_SAR, "SAR");
export const awardLocal = (u) => {
  const cc = (u && u.currency) || "USD";
  const c = Object.values(CURRENCY).find((x) => x.code === cc) || CURRENCY.US;
  return money(((u && u.award_sar) || AWARD_SAR) * c.rate, c.code);
};
export const awardBoth = (u) => awardSAR(u) + " \u00b7 " + awardLocal(u);
