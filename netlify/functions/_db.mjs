
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DB connection string: set NEON_DATABASE_URL or DATABASE_URL');
}
export const sql = neon(connectionString);

// Create or fetch a user by case-insensitive full_name
export async function getOrCreateUserByName(name) {
  const user = (await sql`
    INSERT INTO users (full_name)
    VALUES (${name})
    ON CONFLICT (lower(full_name)) DO UPDATE
      SET full_name = EXCLUDED.full_name
    RETURNING id, full_name;
  `)[0];

  // Ensure points row exists
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
