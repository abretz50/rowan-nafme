
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent } from './_db.mjs';

function isEboard(context) {
  const roles = context.clientContext?.user?.app_metadata?.roles || [];
  return roles.includes('eboard');
}

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname; // /.netlify/functions/events or with extra
    const parts = pathname.split('/').filter(Boolean); // [" .netlify", "functions", "events", "<id?>"]
    const maybeId = parts.length > 3 ? parts[3] : null;
    const method = req.method.toUpperCase();

    if (method === 'GET') {
      if (maybeId) {
        const row = await getEvent(maybeId);
        if (!row) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
        return new Response(JSON.stringify({ ok: true, data: row }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      const tag = url.searchParams.get('tag') || null;
      const fromDate = url.searchParams.get('from') || null;
      const toDate = url.searchParams.get('to') || null;
      const limit = parseInt(url.searchParams.get('limit') || '500', 10);
      const rows = await listEvents({ tag, fromDate, toDate, limit: Math.max(1, Math.min(2000, limit)) });
      return new Response(JSON.stringify({ ok: true, data: rows }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // Mutations require eboard role
    if (!context.clientContext?.user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    }
    if (!isEboard(context)) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
    }

    if (method === 'POST') {
      const body = await req.json();
      const ev = normalizeEvent(body);
      if (!ev.name) return new Response(JSON.stringify({ ok: false, error: 'Event name is required' }), { status: 400 });
      const row = await createEvent(ev);
      return new Response(JSON.stringify({ ok: true, data: row }), { status: 201, headers: { 'content-type': 'application/json' } });
    }

    if (method === 'PUT' || method === 'PATCH') {
      if (!maybeId) return new Response(JSON.stringify({ ok: false, error: 'Missing event id in path' }), { status: 400 });
      const body = await req.json();
      const ev = normalizeEvent(body, true);
      const row = await updateEvent(maybeId, ev);
      if (!row) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
      return new Response(JSON.stringify({ ok: true, data: row }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (method === 'DELETE') {
      if (!maybeId) return new Response(JSON.stringify({ ok: false, error: 'Missing event id in path' }), { status: 400 });
      const id = await deleteEvent(maybeId);
      if (!id) return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
      return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};

function toInt(val, def = null) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : def;
}
function normalizeEvent(src = {}, partial = false) {
  // Keep fields only; coerce numeric; accept nulls on partial
  const ev = {
    name: src.name ?? null,
    description: src.description ?? null,
    preview: src.preview ?? null,
    date: src.date ?? null,               // 'YYYY-MM-DD'
    start_time: src.start_time ?? null,   // 'HH:MM' 24h
    end_time: src.end_time ?? null,       // 'HH:MM'
    location: src.location ?? null,
    image_url: src.image_url ?? null,
    points: toInt(src.points, partial ? null : 0),
    attendance: toInt(src.attendance, partial ? null : 0),
    tag: src.tag ?? null,
    volunteers_per_hour: toInt(src.volunteers_per_hour, partial ? null : null)
  };
  return ev;
}
