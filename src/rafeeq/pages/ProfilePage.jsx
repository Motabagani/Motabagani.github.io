import { useState, useEffect } from 'react';
import { Icon, IC } from '../ui/Icon.jsx';
import { Field } from '../ui/atoms.jsx';
import { useRafeeq } from '../RafeeqContext.jsx';
import { moiPassport } from '../lib/passport.js';
import { awardBoth } from '../lib/money.js';
import { digitsOnly } from '../lib/num.js';

/* Identity comes from Nafath and the ministry record, so it is shown, not
   edited. Contact details are the student's own, so those are editable. */
export default function ProfilePage() {
  const { t, lang, user, updateUser } = useRafeeq();
  const go = () => { window.location.hash = `#/${lang}/rafeeq`; };

  const [form, setForm] = useState({ email: user.email || '', phone: user.phone || '' });
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState({});

  useEffect(() => { setForm({ email: user.email || '', phone: user.phone || '' }); }, [user]);

  const dirty = form.email !== (user.email || '') || form.phone !== (user.phone || '');

  const save = () => {
    const e = {};
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = true;
    if (form.phone && form.phone.length < 9) e.phone = true;
    setErr(e);
    if (Object.keys(e).length) return;
    updateUser({ email: form.email, phone: form.phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  /* Read-only identity, straight from the record. */
  const fixed = [
    ['profile.name', user.name[lang]],
    ['profile.id', user.national_id],
    ['profile.passport', moiPassport('self')],
    ['profile.university', user.university && user.university[lang]],
    ['profile.degree', user.degree && user.degree[lang]],
    ['profile.major', user.major && (user.major[lang] || user.major)],
    ['profile.award', awardBoth(user)],
  ];

  return (
    <div className="rq-rise">
      <button type="button" className="rq-btn rq-ghost" style={{ marginBlockEnd: 16, padding: '8px 15px', fontSize: 13.5 }} onClick={go}>
        <Icon d={IC.back} dir size={15} />{t('phase.backhome')}
      </button>
      <h1 style={{ fontSize: 24 }}>{t('profile.title')}</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginBlockStart: 4 }}>{t('profile.sub')}</p>

      {/* ---- editable ---- */}
      <h2 className="rq-sec-h">{t('profile.contact')}</h2>
      <p className="rq-sec-s">{t('profile.contact.sub')}</p>
      <div className="rq-card" style={{ padding: '16px 18px' }}>
        <div className="rq-row2">
          <Field label={t('profile.email')} error={err.email} hint={t('profile.email.err')}>
            <input value={form.email} dir="ltr" style={{ textAlign: 'start' }} inputMode="email"
              placeholder="you@university.edu"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label={t('profile.phone')} error={err.phone} hint={t('profile.phone.err')}>
            <input value={form.phone} dir="ltr" style={{ textAlign: 'start' }} inputMode="tel"
              placeholder="0555555555" maxLength={15}
              onChange={(e) => setForm({ ...form, phone: digitsOnly(e.target.value, 15) })} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBlockStart: 6, flexWrap: 'wrap' }}>
          <button type="button" className="rq-btn rq-primary" disabled={!dirty} onClick={save}>
            <Icon d={IC.check} size={15} />{t('profile.save')}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--accent)' }}>{t('profile.saved')}</span>}
        </div>
      </div>

      {/* ---- read-only ---- */}
      <h2 className="rq-sec-h">{t('profile.record')}</h2>
      <p className="rq-sec-s">{t('profile.record.sub')}</p>
      <div className="rq-card" style={{ padding: '6px 18px' }}>
        <dl className="rq-profile">
          {fixed.map(([k, v]) => v && (
            <div key={k}>
              <dt>{t(k)}</dt>
              <dd dir={/id|passport/.test(k) ? 'ltr' : undefined}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
