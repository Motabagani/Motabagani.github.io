import { useState, useRef } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import { sendMessage } from '../api';

/* Contact form. Submissions are saved by the CGI collector
   (server/cgi-bin/submit.cgi) and read from the admin dashboard. */

function ContactPage() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const c = t.contact;

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [hp, setHp] = useState(''); // honeypot
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState(''); // general (non-field) error
  const [invalid, setInvalid] = useState({ name: '', email: '', message: '' }); // per-field messages

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);
  const refs = { name: nameRef, email: emailRef, message: messageRef };

  const reqMsg = ar ? 'هذا الحقل مطلوب' : 'This field is required';

  // Change handler clears a field's invalid state as soon as it's corrected.
  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setInvalid((iv) => (iv[k] ? { ...iv, [k]: '' } : iv));
  };

  const focusFirstInvalid = (iv) => {
    const first = ['name', 'email', 'message'].find((k) => iv[k]);
    if (first) refs[first].current?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const iv = {
      name: form.name.trim() ? '' : reqMsg,
      email: form.email.trim() ? '' : reqMsg,
      message: form.message.trim() ? '' : reqMsg,
    };
    if (iv.name || iv.email || iv.message) {
      setInvalid(iv);
      setError(c.required);
      setStatus('error');
      focusFirstInvalid(iv);
      return;
    }
    setInvalid({ name: '', email: '', message: '' });
    setError('');
    setStatus('sending');
    try {
      const data = await sendMessage({
        type: 'contact',
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        page: window.location.pathname + window.location.search,
        lang,
        website: hp,
      });
      setTicket((data && data.ticket) || '');
      setStatus('sent');
    } catch (err) {
      const msg =
        err.message === 'network' ? c.errNet
        : err.code === 'email' ? c.errEmail
        : err.code === 'message' ? c.errShort
        : err.code === 'rate' ? c.errRate
        : c.errGen;
      // Attach server errors to the offending field where we can.
      const field = err.code === 'email' ? 'email' : err.code === 'message' ? 'message' : null;
      if (field) {
        const iv2 = { name: '', email: '', message: '', [field]: msg };
        setInvalid(iv2);
        setError('');
        refs[field].current?.focus();
      } else {
        setError(msg);
      }
      setStatus('error');
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', message: '' });
    setTicket('');
    setStatus('idle');
    setError('');
    setInvalid({ name: '', email: '', message: '' });
  };

  // Shared props for a field's error wiring.
  const errProps = (k) => ({
    'aria-invalid': invalid[k] ? true : undefined,
    'aria-describedby': invalid[k] ? `cf-${k}-err` : undefined,
  });
  const FieldError = ({ k }) =>
    invalid[k] ? (
      <span id={`cf-${k}-err`} className="field-error" role="alert">{invalid[k]}</span>
    ) : null;

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {c.title}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{c.title}</h1>
          <p className="deck">{c.deck}</p>
          <p className="deck" style={{ marginTop: 6 }}>
            <a href={`/${lang}/track`}>{ar ? 'تتبّع طلبًا موجودًا ←' : 'Track an existing request →'}</a>
          </p>
        </header>

        <section className="container" style={{ paddingBlock: '8px 100px' }}>
          {status === 'sent' ? (
            <div className="contact-done" role="status">
              <p>{c.success}</p>
              {ticket && (
                <p className="contact-ticket">
                  {ar ? 'رقم تذكرتك: ' : 'Your ticket: '}<strong>{ticket}</strong><br />
                  <a href={`/${lang}/track?id=${encodeURIComponent(ticket)}`}>
                    {ar ? 'تابع طلبك' : 'track your request'}
                  </a>
                  {' '}
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {ar ? '(تحقّق ببريدك الإلكتروني، وسيصلك ردّي عليه)' : '(verify with your email — my reply will also be sent there)'}
                  </span>
                </p>
              )}
              <button className="contact-btn" onClick={reset}>
                {c.another}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate>
              <div className="contact-field">
                <label htmlFor="cf-name">{c.name}</label>
                <input
                  id="cf-name"
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder={c.namePlaceholder}
                  autoComplete="name"
                  required
                  {...errProps('name')}
                />
                <FieldError k="name" />
              </div>

              <div className="contact-field">
                <label htmlFor="cf-email">{c.email}</label>
                <input
                  id="cf-email"
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder={c.emailPlaceholder}
                  autoComplete="email"
                  className="latin"
                  required
                  {...errProps('email')}
                />
                <FieldError k="email" />
              </div>

              <div className="contact-field">
                <label htmlFor="cf-message">{c.message}</label>
                <textarea
                  id="cf-message"
                  ref={messageRef}
                  value={form.message}
                  onChange={set('message')}
                  placeholder={c.messagePlaceholder}
                  rows={6}
                  required
                  {...errProps('message')}
                />
                <FieldError k="message" />
              </div>

              {/* Honeypot: hidden from people, tempting to bots. */}
              <input
                className="haa-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />

              {status === 'error' && error && (
                <p className="contact-error" role="alert">
                  {error}
                </p>
              )}

              <button className="contact-btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? c.sending : c.send}
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default ContactPage;
