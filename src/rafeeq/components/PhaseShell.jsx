// The wizard frame every phase page renders inside. Pulls all shared state
// from context, so a phase page only has to say which phase it is.

import { PhaseWizard } from '../screens/PhaseWizard.jsx';
import { navigate } from '../../lib/router';
import { PHASES } from '../phases/registry.js';
import { useRafeeq } from '../RafeeqContext.jsx';

export default function PhaseShell({ phaseId }) {
  const {
    t, lang, user, data, statuses, refs, setPhaseData,
    submitPhase, approvePhase, toast, wizardCtx,
  } = useRafeeq();

  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return null;

  const goHome = () => { navigate(`/${lang}/rafeeq`); };

  return (
    <PhaseWizard
      t={t} lang={lang} user={user}
      phase={phase}
      phaseRef={refs[phaseId]}
      phaseData={data[phaseId]}
      setPhaseData={setPhaseData(phaseId)}
      status={statuses[phaseId]}
      onSubmit={() => submitPhase(phaseId)}
      onApprove={() => { approvePhase(phaseId); goHome(); }}
      onHome={goHome}
      toast={toast}
      ctx={wizardCtx}
    />
  );
}
