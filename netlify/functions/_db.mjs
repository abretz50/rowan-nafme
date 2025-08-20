
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DB connection string: set NEON_DATABASE_URL or DATABASE_URL');
}
export const sql = neon(connectionString);

/* -------------------- Users & Points (unchanged minimal) -------------------- */
export async function getOrCreateUserByName(name) {
  const user = (await sql`
    INSERT INTO users (full_name)
    VALUES (${name})
    ON CONFLICT (lower(full_name)) DO UPDATE
      SET full_name = EXCLUDED.full_name
    RETURNING id, full_name;
  `)[0];

  await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, 0)
    ON CONFLICT (user_id) DO NOTHING;
  `;

  return user;
}

export async function setPointsByUserId(userId, pointsVal) {
  const row = (await sql`
    INSERT INTO points (user_id, points)
    VALUES (${userId}::uuid, ${pointsVal})
    ON CONFLICT (user_id) DO UPDATE SET
      points = ${pointsVal},
      updated_at = now()
    RETURNING points;
  `)[0];
  return row.points;
}

export async function incrementPointsByUserId(userId, delta) {
  const row = (await sql`
    INSERT INTO points (user_id, points)
    VALUES (${userId}::uuid, ${delta})
    ON CONFLICT (user_id) DO UPDATE SET
      points = points.points + ${delta},
      updated_at = now()
    RETURNING points;
  `)[0];
  return row.points;
}

export async function getLeaderboard(limit = 1000) {
  return await sql`
    SELECT u.id, u.full_name, COALESCE(p.points, 0) AS points
    FROM users u
    LEFT JOIN points p ON p.user_id = u.id
    ORDER BY points DESC, u.full_name NULLS LAST, u.id ASC
    LIMIT ${limit};
  `;
}

/* -------------------- Events helpers -------------------- */
export async function listEvents({ tag, fromDate, toDate, limit = 500 }) {
  // Build dynamic query simply
  let conditions = [];
  let params = [];
  if (tag) { conditions.push(sql`tag = ${tag}`); }
  if (fromDate) { conditions.push(sql`date >= ${fromDate}`); }
  if (toDate) { conditions.push(sql`date <= ${toDate}`); }
  const where = conditions.length ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

  const rows = await sql`
    SELECT id, name, description, preview, date, start_time, end_time,
           location, image_url, points, attendance, tag, volunteers_per_hour,
           created_at, updated_at
    FROM events
    ${where}
    ORDER BY date NULLS LAST, start_time NULLS LAST, name ASC
    LIMIT ${limit};
  `;
  return rows;
}

export async function getEvent(id) {
  const rows = await sql`
    SELECT id, name, description, preview, date, start_time, end_time,
           location, image_url, points, attendance, tag, volunteers_per_hour,
           created_at, updated_at
    FROM events
    WHERE id = ${id}::uuid
    LIMIT 1;
  `;
  return rows[0] || null;
}

export async function createEvent(ev) {
  const row = (await sql`
    INSERT INTO events
      (name, description, preview, date, start_time, end_time, location, image_url,
       points, attendance, tag, volunteers_per_hour, created_at, updated_at)
    VALUES
      (${ev.name}, ${ev.description}, ${ev.preview}, ${ev.date}, ${ev.start_time}, ${ev.end_time},
       ${ev.location}, ${ev.image_url}, ${ev.points}, ${ev.attendance}, ${ev.tag}, ${ev.volunteers_per_hour},
       now(), now())
    RETURNING *;
  `)[0];
  return row;
}

export async function updateEvent(id, ev) {
  const row = (await sql`
    UPDATE events SET
      name = COALESCE(${ev.name}, name),
      description = COALESCE(${ev.description}, description),
      preview = COALESCE(${ev.preview}, preview),
      date = COALESCE(${ev.date}, date),
      start_time = COALESCE(${ev.start_time}, start_time),
      end_time = COALESCE(${ev.end_time}, end_time),
      location = COALESCE(${ev.location}, location),
      image_url = COALESCE(${ev.image_url}, image_url),
      points = COALESCE(${ev.points}, points),
      attendance = COALESCE(${ev.attendance}, attendance),
      tag = COALESCE(${ev.tag}, tag),
      volunteers_per_hour = COALESCE(${ev.volunteers_per_hour}, volunteers_per_hour),
      updated_at = now()
    WHERE id = ${id}::uuid
    RETURNING *;
  `)[0];
  return row;
}

export async function deleteEvent(id) {
  const row = (await sql`DELETE FROM events WHERE id = ${id}::uuid RETURNING id;`)[0];
  return row?.id || null;
}
