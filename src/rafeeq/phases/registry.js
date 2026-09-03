import { IC } from "../ui/Icon.jsx";
import { P1_STEPS } from "./prp.jsx";
import { PA_STEPS } from "./acd.jsx";
import { P2_STEPS } from "./vsa.jsx";
import { P3_STEPS } from "./arv.jsx";

export const PHASES = [
  { id: "p1", code: "PRP", nameKey: "phase.1.name", whereKey: "phase.1.where", icon: IC.doc, steps: P1_STEPS },
  { id: "pa", code: "ACD", nameKey: "phase.a.name", whereKey: "phase.a.where", icon: IC.cap, steps: PA_STEPS },
  { id: "p2", code: "VSA", nameKey: "phase.2.name", whereKey: "phase.2.where", icon: IC.plane, steps: P2_STEPS },
  { id: "p3", code: "ARV", nameKey: "phase.3.name", whereKey: "phase.3.where", icon: IC.cap, steps: P3_STEPS },
];
