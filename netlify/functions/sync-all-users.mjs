// netlify/functions/sync-all-users.mjs
import { ensureUserByEmail } from './_db.mjs';

function isEboard(context) {
  const roles = context.clientContext?.user?.app_metadata?.roles || [];
  return roles.includes('eboard');
}

export default async (req, context) => {
  // Require logged-in caller with eboard role
  if (!context.clientContext?.user) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }
  if (!isEboard(context)) {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
  }

  // Netlify injects an Identity admin token + API base url into the function context
  const identity = context.clientContext.identity || {};
  const identityUrl = identity.url;
  const adminToken = identity.token;

  if (!identityUrl || !adminToken) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Identity not available in function context (is Identity enabled and deployed?)'
    }), { status: 500 });
  }

  try {
    let page = 1, perPage = 1000, total = 0;

    while (true) {
      const res = await fetch(`${identityUrl}/admin/users?page=${page}&per_page=${perPage}`, {
        headers: { authorization: `Bearer ${adminToken}` }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Identity admin request failed (${res.status}): ${txt}`);
      }

      const users = await res.json();
      if (!Array.isArray(users) || users.length === 0) break;

      for (const u of users) {
        if (!u?.email) continue;
        await ensureUserByEmail({
          id: u.id,
          email: u.email,
          full_name: u.user_metadata?.full_name || null
        });
        total++;
      }

      if (users.length < perPage) break;
      page++;
    }

    return new Response(JSON.stringify({ ok: true, synced: total }), {
      status: 200, headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};
