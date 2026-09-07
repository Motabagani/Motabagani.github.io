import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { sendMessage } from '../api';

/* Haa — a Clippy-style greeter.
   Pops in shortly after the site opens, waves, says hello, and offers to take
   feedback. Shown once per browser session so it greets a visit, not a click.
   Feedback is saved to the backend database (server/api/submit.php) and read
   from the dashboard — no email client involved. */

/* Built from the separate layers rather than the flattened haaidle.png, so the
   waving arm can be animated on its own. Layer offsets were derived by
   alpha template-matching each layer against haaidle.png (the reference
   assembly) — see .haa-body/.haa-face/.haa-arm-* in App.css.
   Filenames contain spaces, so encode them into valid URLs.
   Note the names are from Haa's own point of view: "hand right of haa" is the
   character's right arm, which sits on the viewer's left. That's the waver. */
const LAYER_BODY = encodeURI('/images/body and legs.png');
const LAYER_FACE = encodeURI('/images/face.png');
const LAYER_ARM_STILL = encodeURI('/images/Hand left of haa.png');
const LAYER_ARM_WAVE = encodeURI('/images/hand right of haa.png');

// Minimized launcher shows Haa's head (white body carries the dark features,
// so it reads on the purple square — the flat face-only PNG would vanish).
const CHIP_FACE = '/images/haaidle.png';

const SEEN_KEY = 'haa-greeted';

function HaaGreeter() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  // hidden | greeting | feedback | sending | thanks
  // Start already-minimized if Haa was greeted earlier this session, so the
  // face chip is there on load without a setState-in-effect.
  const [stage, setStage] = useState(() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) === '1' ? 'minimized' : 'hidden';
    } catch {
      return 'hidden';
    }
  });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [hp, setHp] = useState(''); // honeypot — must stay empty
  const areaRef = useRef(null);

  const t = ar
    ? {
        hello: 'هلا، أنا هاء',
        line: 'عسى كل شيء جايز لك، وإن احتجت شيء حاضرين',
        feedback: 'عندي ملاحظة',
        dismiss: 'شكراً، أتصفّح فقط',
        prompt: 'قل لي رأيك — أي شيء لاحظته أو تتمنى تغييره.',
        placeholder: 'اكتب ملاحظتك هنا…',
        send: 'أرسل',
        sending: 'جارٍ الإرسال…',
        back: 'رجوع',
        thanks: 'شكراً لك! وصلتني ملاحظتك.',
        errNet: 'تعذّر الإرسال. تحقق من اتصالك وحاول مرة أخرى.',
        errShort: 'اكتب شوي أكثر.',
        errRate: 'رسائل كثيرة الحين — حاول بعد شوي.',
        errGen: 'صار خطأ ما. حاول مرة أخرى.',
        close: 'إغلاق',
        aria: 'ها — ترحيب وملاحظات',
        reopen: 'افتح «ها»',
      }
    : {
        hello: "Hala, I'm Haa.",
        line: 'Hope you are enjoying the portfolio. Need anything?',
        feedback: 'I have feedback',
        dismiss: 'No thanks, just looking',
        prompt: 'Tell me what you think — anything you noticed or would change.',
        placeholder: 'Type your feedback here…',
        send: 'Send',
        sending: 'Sending…',
        back: 'Back',
        thanks: 'Thank you! Your feedback reached me.',
        errNet: "Couldn't send. Check your connection and try again.",
        errShort: 'Please write a little more.',
        errRate: 'Too many messages just now — try again in a bit.',
        errGen: 'Something went wrong. Please try again.',
        close: 'Close',
        aria: 'Haa — greeting and feedback',
        reopen: 'Open Haa',
      };

  // First-visit greeting — held back until the visitor has actually engaged
  // (scrolled a meaningful amount), rather than popping up on load. Once per
  // session. If already greeted, the chip is shown via the initial state above.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      // Private mode / storage blocked — just greet on scroll.
    }
    if (seen) return undefined;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      // ~1.5 viewport heights of scrolling counts as meaningful engagement.
      const threshold = Math.max(window.innerHeight * 1.5, 800);
      if (window.scrollY > threshold) {
        fired = true;
        window.removeEventListener('scroll', onScroll);
        setStage('greeting');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (stage === 'feedback' && areaRef.current) areaRef.current.focus();
  }, [stage]);

  const remember = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  // The × / dismiss don't banish Haa — they shrink it to the face chip.
  const close = () => {
    remember();
    setStage('minimized');
  };
  const reopen = () => {
    setError('');
    setStage('greeting');
  };

  // Saves the note to the backend database.
  const send = async () => {
    if (!note.trim()) return;
    setError('');
    setStage('sending');
    try {
      await sendMessage({
        type: 'feedback',
        message: note.trim(),
        page: window.location.pathname + window.location.search,
        lang,
        website: hp, // honeypot
      });
      setStage('thanks');
      remember();
    } catch (e) {
      const msg =
        e.message === 'network' ? t.errNet
        : e.code === 'message' ? t.errShort
        : e.code === 'rate' ? t.errRate
        : t.errGen;
      setError(msg);
      setStage('feedback');
    }
  };

  // Esc dismisses, like any transient popover.
  useEffect(() => {
    if (stage === 'hidden') return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage]);

  if (stage === 'hidden') return null;

  // Minimized: a small logo-style square with Haa's face — click to reopen.
  if (stage === 'minimized') {
    return (
      <button className="haa-mini" onClick={reopen} aria-label={t.reopen} title={t.reopen}>
        <img src={CHIP_FACE} alt="" />
      </button>
    );
  }

  return (
    <div className="haa" role="dialog" aria-label={t.aria}>
      <div className="haa-bubble">
        <button className="haa-x" onClick={close} aria-label={t.close}>
          ×
        </button>

        {stage === 'greeting' && (
          <>
            <p className="haa-hello">{t.hello}</p>
            <p className="haa-line">{t.line}</p>
            <div className="haa-actions">
              <button className="haa-btn haa-btn--primary" onClick={() => setStage('feedback')}>
                {t.feedback}
              </button>
              <button className="haa-btn" onClick={close}>
                {t.dismiss}
              </button>
            </div>
          </>
        )}

        {(stage === 'feedback' || stage === 'sending') && (
          <>
            <p className="haa-line">{t.prompt}</p>
            <textarea
              ref={areaRef}
              className="haa-area"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.placeholder}
              rows={4}
              disabled={stage === 'sending'}
            />
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
            {error && (
              <p className="haa-error" role="alert">
                {error}
              </p>
            )}
            <div className="haa-actions">
              <button
                className="haa-btn"
                onClick={() => setStage('greeting')}
                disabled={stage === 'sending'}
              >
                {t.back}
              </button>
              <button
                className="haa-btn haa-btn--primary"
                onClick={send}
                disabled={!note.trim() || stage === 'sending'}
              >
                {stage === 'sending' ? t.sending : t.send}
              </button>
            </div>
          </>
        )}

        {stage === 'thanks' && (
          <>
            <p className="haa-hello">{t.thanks}</p>
            <div className="haa-actions">
              <button className="haa-btn haa-btn--primary" onClick={close}>
                {t.close}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="haa-figure" aria-hidden="true">
        <img className="haa-body" src={LAYER_BODY} alt="" />
        <img className="haa-face" src={LAYER_FACE} alt="" />
        <img className="haa-arm-still" src={LAYER_ARM_STILL} alt="" />
        <img className="haa-arm-wave" src={LAYER_ARM_WAVE} alt="" />
      </div>
    </div>
  );
}

export default HaaGreeter;
