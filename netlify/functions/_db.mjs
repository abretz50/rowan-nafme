
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DB connection string: set NEON_DATABASE_URL or DATABASE_URL');
}
export const sql = neon(connectionString);

// Upsert/ensure user row by email on login/sync
export async function ensureUserByEmail({ id, email, full_name }) {
  const user = (await sql`
    INSERT INTO users (id, email, full_name)
    VALUES (${id}::uuid, ${email}, ${full_name})
    ON CONFLICT (email) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, users.full_name)
    RETURNING id, email, full_name, created_at;
  `)[0];

  await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, 0)
    ON CONFLICT (user_id) DO NOTHING;
  `;

  return user;
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

export async function getUserByNameExact(name) {
  const rows = await sql`
    SELECT id, email, full_name FROM users
    WHERE lower(full_name) = lower(${name})
    LIMIT 2;
  `;
  if (rows.length === 0) throw new Error('User not found by name');
  if (rows.length > 1) throw new Error('Multiple users share that name. Please make the name unique.');
  return rows[0];
}

export async function incrementPointsByName(name, delta) {
  const user = await getUserByNameExact(name);
  const row = (await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, ${delta})
    ON CONFLICT (user_id) DO UPDATE SET
      points = points.points + ${delta},
      updated_at = now()
    RETURNING points;
  `)[0];
  return { name: user.full_name, points: row.points };
}

export async function setPointsByName(name, pointsVal) {
  const user = await getUserByNameExact(name);
  const row = (await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, ${pointsVal})
    ON CONFLICT (user_id) DO UPDATE SET
      points = ${pointsVal},
      updated_at = now()
    RETURNING points;
  `)[0];
  return { name: user.full_name, points: row.points };
}
