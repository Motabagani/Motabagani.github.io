/* Deterministic-looking fake passport numbers, cached per traveller. */
const MOI_PASSPORTS = {};
export const moiPassport = (pid) => {
  if (!MOI_PASSPORTS[pid]) {
    const L = "ABCEFGHJKLMNPRSTVWXYZ";
    MOI_PASSPORTS[pid] = L[Math.floor(Math.random() * L.length)] +
      String(Math.floor(1000000 + Math.random() * 8999999));
  }
  return MOI_PASSPORTS[pid];
};
