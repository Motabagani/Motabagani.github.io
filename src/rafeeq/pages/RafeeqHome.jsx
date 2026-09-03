import { Home } from '../screens/Home.jsx';
import { useRafeeq } from '../RafeeqContext.jsx';
import { PHASE_PAGE } from '../App.jsx';

export default function RafeeqHome() {
  const { t, lang, user, statuses, refs, docs, phaseProgress, guaranteeReady, allDone } = useRafeeq();
  const go = (page) => { window.location.hash = `#/${lang}/rafeeq${page ? '/' + page : ''}`; };

  return (
    <Home
      t={t} lang={lang} user={user}
      statuses={statuses} refs={refs}
      phaseProgress={phaseProgress}
      onOpenPhase={(pid) => go(PHASE_PAGE[pid])}
      guaranteeReady={guaranteeReady}
      docCount={docs.length}
      openFiles={() => go('files')}
      allDone={allDone}
    />
  );
}
