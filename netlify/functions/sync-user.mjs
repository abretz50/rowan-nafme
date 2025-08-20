import { ensureUserByEmail } from './_db.mjs';

export default async (req, context) => {
  try {
    const user = context.clientContext?.user;
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    }
    const id = user.sub || user.id;
    const email = user.email;
    const full_name = user.user_metadata?.full_name || null;

    const saved = await ensureUserByEmail({ id, email, full_name });
    return new Response(JSON.stringify({ ok: true, user: saved }), {
      status: 200, headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};
