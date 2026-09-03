// Front-end client for the portfolio backend (server/cgi-bin/submit.cgi).
//
// CIMS runs Python CGI (not PHP), so the endpoint is the suexec collector at
// cgi-bin/submit.cgi. It is resolved relative to the deployed document, which
// stays at the web root (e.g. https://cims.nyu.edu/~hm2983/) regardless of the
// hash route — so it becomes …/~hm2983/cgi-bin/submit.cgi in production and
// http://localhost:5173/cgi-bin/submit.cgi in dev (no CGI there, so calls fail
// and the UI shows an error — expected locally).

const ENDPOINT = new URL('cgi-bin/submit.cgi', document.baseURI).toString();

/**
 * Send a message to the backend.
 * @param {{type:'feedback'|'contact', message:string, name?:string,
 *          email?:string, page?:string, lang?:string, website?:string}} payload
 * @returns {Promise<void>} resolves on success, throws Error on failure.
 */
export async function sendMessage(payload) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('network');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response (e.g. dev server) */
  }

  if (!res.ok || !data || !data.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data && data.error; // 'message' | 'email' | 'rate' | ...
    throw err;
  }
}
