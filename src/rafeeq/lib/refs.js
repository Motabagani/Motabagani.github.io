import { parseIso } from "./dates.js";
import { TICKET_KINDS } from "../data/tickets.js";

/* Tracking references: <3-letter code>-<YYMM>-<5 digits>, one generator. */
const _refSeq = {};
export function makeRef(code, dateIso) {
  _refSeq[code] = (_refSeq[code] || 0) + 1;
  const d = parseIso(dateIso) || { y: new Date().getFullYear(), m: new Date().getMonth() };
  const ym = String(d.y).slice(2) + String((d.m || 0) + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${code}-${ym}-${rand}${String(_refSeq[code]).padStart(2, "0")}`;
}
export const ticketRef = (kind, dateIso) =>
  makeRef((TICKET_KINDS.find(x => x.k === kind) || TICKET_KINDS[0]).code, dateIso);
