// Front-end client for the site's own message backend — a Cloudflare Worker
// (worker/index.js) that stores submissions in Cloudflare D1 and serves the
// Basic-Auth admin dashboard at /admin. Same-origin with the site, so no CORS.
//
// This preserves the response shape of the old CIMS CGI ({ok:true} on success,
// or {ok:false, error:'message'|'email'|'rate'|...}), which the contact page and
// Haa greeter already map to friendly messages. In dev (Vite) there is no Worker,
// so calls fail and the UI shows an error — expected locally.

const ENDPOINT = '/api/submit';

/**
 * Send a message to the backend.
 * @param {{type:'feedback'|'contact', message:string, name?:string,
 *          email?:string, page?:string, lang?:string, website?:string}} payload
 * @returns {Promise<{ok:true, ticket?:string}>} resolves with the server data
 *          (including the tracking `ticket`) on success, throws Error on failure.
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
    /* non-JSON (e.g. dev server) */
  }

  if (!res.ok || !data || !data.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data && data.error; // 'message' | 'email' | 'rate' | ...
    throw err;
  }
  return data; // { ok:true, ticket:'C-K-04821' }
}
