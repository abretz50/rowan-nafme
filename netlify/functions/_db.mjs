import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.warn('NEON_DATABASE_URL is not set.');
}

export const sql = neon(connectionString);

// Helpers
export async function ensureUserByEmail({ id, email, full_name }) {
  // Upsert into users by email (email is unique), then ensure points row exists.
  const user = (await sql`
    INSERT INTO users (id, email, full_name)
    VALUES (${id}::uuid, ${email}, ${full_name})
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name
    RETURNING id, email, full_name, created_at;
  `)[0];

  await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, 0)
    ON CONFLICT (user_id) DO NOTHING;
  `;

  return user;
}

export async function getLeaderboard(limit = 100) {
  const rows = await sql`
    SELECT u.id, u.full_name, u.email, COALESCE(p.points, 0) AS points
    FROM users u
    LEFT JOIN points p ON p.user_id = u.id
    ORDER BY points DESC, u.full_name NULLS LAST, u.email ASC
    LIMIT ${limit};
  `;
  return rows;
}

export async function getUserByEmail(email) {
  const rows = await sql`SELECT id, email, full_name FROM users WHERE email = ${email} LIMIT 1;`;
  return rows[0] || null;
}

export async function incrementPointsByEmail(email, delta) {
  // Ensure user exists, then increment
  let user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  const row = (await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, ${delta})
    ON CONFLICT (user_id) DO UPDATE SET
      points = points.points + ${delta},
      updated_at = now()
    RETURNING points;
  `)[0];
  return { email, points: row.points };
}

export async function setPointsByEmail(email, pointsVal) {
  let user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  const row = (await sql`
    INSERT INTO points (user_id, points)
    VALUES (${user.id}::uuid, ${pointsVal})
    ON CONFLICT (user_id) DO UPDATE SET
      points = ${pointsVal},
      updated_at = now()
    RETURNING points;
  `)[0];
  return { email, points: row.points };
}
