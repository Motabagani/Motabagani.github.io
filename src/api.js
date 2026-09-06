// Front-end client for the site's forms — backed by Netlify Forms.
//
// The old NYU CIMS backend (Python CGI at cgi-bin/submit.cgi) is gone; the site
// now runs on Netlify, whose built-in Forms captures submissions (emailed to the
// owner + a dashboard, with honeypot spam filtering). Netlify provisions the
// handlers from the hidden static <form> definitions in index.html and receives
// each submission as a urlencoded POST to "/" carrying a matching `form-name`.
//
// In local dev there is no Netlify, so submissions fail and the UI shows an error
// (expected locally) — same as the old CGI behaved in dev.

/**
 * Send a message via Netlify Forms.
 * @param {{type:'feedback'|'contact', message:string, name?:string,
 *          email?:string, page?:string, lang?:string, website?:string}} payload
 * @returns {Promise<void>} resolves on success, throws Error on failure.
 */
export async function sendMessage(payload) {
  const { type, website, ...rest } = payload;
  const formName = type === 'feedback' ? 'feedback' : 'contact';

  const params = new URLSearchParams();
  params.append('form-name', formName);
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  // Honeypot: Netlify silently discards the submission if this is filled.
  params.append('website', website == null ? '' : String(website));

  let res;
  try {
    res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch {
    throw new Error('network');
  }

  if (!res.ok) {
    const err = new Error(`Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
}
