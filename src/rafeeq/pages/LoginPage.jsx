import { useState } from 'react';
import { Login } from '../screens/Login.jsx';
import { Register } from '../screens/Register.jsx';
import { useRafeeq } from '../RafeeqContext.jsx';
import { DEMO_USER } from '../data/user.js';

export default function LoginPage() {
  const { t, lang, setLang, theme, setTheme, startSession, toast, celebrate, runTask } = useRafeeq();
  const [view, setView] = useState('login');

  /* The wait is the same shape as every other one in the app. */
  const enter = (u) => runTask(t('busy.signin'), async () => {
    startSession(u || DEMO_USER);
    toast(t('toast.welcome'));
    celebrate();
  }, 1100);

  if (view === 'register') {
    return <Register t={t} lang={lang} onCancel={() => setView('login')} onDone={enter} />;
  }
  return (
    <Login t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
      onRegister={() => setView('register')} onSignIn={enter} />
  );
}
