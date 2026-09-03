import { TICKET_KINDS } from "../data/tickets.js";
import { moiPassport } from "./passport.js";
import { isoToDmy } from "./dates.js";

export const SAUDIA_MAIL = "studentscare@saudia.com";

export function saudiaMailBody(user, d, ctx, lang) {
  const kind = TICKET_KINDS.find(x => x.k === (d.ticketKind || "initial")) || TICKET_KINDS[0];
  const L = [];
  L.push("Scholarship ticket issuance request");
  L.push("");
  L.push("Request number:     " + (d.reqNo || ""));
  L.push("Ticket type:        " + kind.en);
  L.push("Name (Arabic):      " + (user.name.ar || ""));
  L.push("Name (English):     " + (user.name.en || ""));
  L.push("National ID:        " + (user.national_id || ""));
  L.push("Passport number:    " + moiPassport("self"));
  L.push("Approved travel date: " + (isoToDmy(d.date) || ""));
  L.push("OTB number:         " + (d.otb || ""));
  L.push("Route:              " + (d.from || "") + " \u2192 " + (d.to || "") + (d.flightNo ? "  (" + d.flightNo + ")" : ""));
  const now = (ctx.dependents || []).filter(x => (d.depNow || {})[x.id]);
  if (now.length) {
    L.push("Dependents on this booking:");
    now.forEach(x => L.push("  - " + x.name + "  (passport " + moiPassport("dep" + x.id) + ")"));
  }
  const later = (ctx.dependents || []).filter(x => !(d.depNow || {})[x.id]);
  if (later.length) L.push("Dependents to be booked separately: " + later.map(x => x.name).join(", "));
  if ((d.reqFiles || []).length) L.push("Attached: passport copy, " + d.reqFiles.join(", "));
  else L.push("Attached: passport copy");
  return L.join("\n");
}
