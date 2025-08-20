
import { getOrCreateUserByName, incrementPointsByUserId, setPointsByUserId } from './_db.mjs';

function isEboard(context) {
  const roles = context.clientContext?.user?.app_metadata?.roles || [];
  return roles.includes('eboard');
}

export default async (req, context) => {
  // Protect: only logged-in eboard may modify points
  if (!context.clientContext?.user) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }
  if (!isEboard(context)) {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, name, delta, points } = body || {};
    if (!name || !action) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing action or name' }), { status: 400 });
    }

    const user = await getOrCreateUserByName(name);

    if (action === 'increment') {
      const d = parseInt(delta, 10);
      if (!Number.isFinite(d)) return new Response(JSON.stringify({ ok: false, error: 'Invalid delta' }), { status: 400 });
      const total = await incrementPointsByUserId(user.id, d);
      return new Response(JSON.stringify({ ok: true, result: { name: user.full_name, points: total } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (action === 'set') {
      const p = parseInt(points, 10);
      if (!Number.isFinite(p)) return new Response(JSON.stringify({ ok: false, error: 'Invalid points' }), { status: 400 });
      const total = await setPointsByUserId(user.id, p);
      return new Response(JSON.stringify({ ok: true, result: { name: user.full_name, points: total } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Unknown action' }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};
