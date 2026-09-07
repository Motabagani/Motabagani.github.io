import { Icon, IC } from '../ui/Icon.jsx';
import { navigate } from '../../lib/router';
import { Pill } from '../ui/atoms.jsx';
import { useRafeeq } from '../RafeeqContext.jsx';
import { isoToDmy } from '../lib/dates.js';

/* Everything the student has submitted, with where it stands and a way out of
   it. Grouped by status so what still needs attention sits at the top. */
export default function RequestsPage() {
  const { t, lang, requests, cancelRequest } = useRafeeq();
  const go = () => { navigate(`/${lang}/rafeeq`); };

  const pending = requests.filter((r) => r.status !== 'approved');
  const done = requests.filter((r) => r.status === 'approved');

  const Row = ({ r }) => (
    <div className="rq-item" key={r.id}>
      <Icon d={r.status === 'approved' ? IC.check : IC.clock} size={19} />
      <div className="ib2">
        <div className="t">{t(r.titleKey)}</div>
        <div className="rq-ref">
          {r.ref && <><span>{t('ref.no')}</span><b className="mono" dir="ltr">{r.ref}</b></>}
          {r.term && <span>· {r.term}</span>}
          {r.date && <span>· {isoToDmy(r.date)}</span>}
        </div>
      </div>
      <div className="rq-file-acts">
        <Pill tone={r.status === 'approved' ? 'green' : 'amber'}>
          {t(r.status === 'approved' ? 'status.approved' : 'status.review')}
        </Pill>
        {r.cancellable && (
          <button type="button" className="rq-btn rq-ghost danger" style={{ padding: '8px 13px', fontSize: 13 }}
            onClick={() => cancelRequest(r)}>
            <Icon d='<path d="M18 6 6 18M6 6l12 12"/>' size={14} />{t('req.cancel')}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="rq-rise">
      <button type="button" className="rq-btn rq-ghost" style={{ marginBlockEnd: 16, padding: '8px 15px', fontSize: 13.5 }} onClick={go}>
        <Icon d={IC.back} dir size={15} />{t('phase.backhome')}
      </button>
      <h1 style={{ fontSize: 24 }}>{t('req.title')}</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginBlockStart: 4 }}>{t('req.sub')}</p>

      {!requests.length && <p className="rq-empty" style={{ marginBlockStart: 20 }}>{t('req.empty')}</p>}

      {!!pending.length && (<>
        <h2 className="rq-sec-h">{t('req.pending')}</h2>
        <div className="rq-list">{pending.map((r) => <Row key={r.id} r={r} />)}</div>
      </>)}

      {!!done.length && (<>
        <h2 className="rq-sec-h">{t('req.done')}</h2>
        <div className="rq-list">{done.map((r) => <Row key={r.id} r={r} />)}</div>
      </>)}
    </div>
  );
}
